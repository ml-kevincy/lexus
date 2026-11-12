#!/usr/bin/env python3
"""Build report/data/report.json from the GA4 BigQuery export.

Usage (run `gcloud auth login` first):
  python3 report/build.py                       # pre-test window 2026-11-05 – 2026-12-04, clipped to the latest table
  python3 report/build.py --start 20261105 --end 20261107
  python3 report/build.py --refresh-recommend   # re-read the 為您推薦 lists from www.lexus.com.tw

Each SQL file in report/sql/ returns counts; this script turns them into ratios
in the shape report/index.html reads.
"""
import argparse, json, re, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
SQL = HERE / 'sql'
OUT = HERE / 'data' / 'report.json'
REC_CACHE = HERE / 'data' / 'recommend_lists.json'
PROJECT = 'lexus-ga4-research'
DATASET = f'{PROJECT}.analytics_560107489'

MODELS = ['ES', 'IS', 'LS', 'LBX', 'UX', 'NX', 'RX', 'LM', 'RZ', 'LESC', 'LF-ZC']
DEVICES = ['all', 'desktop', 'mobile']
SECTION_LABEL = {
    'hero': '封面', 'highlight': '重點特色', 'feature_exterior': '外觀', 'feature_color': '車色',
    'feature_interior': '內裝', 'feature_performance': '性能', 'feature_safety': '安全',
    'feature_charging': '充電', 'link_plus': 'LINK+', 'faq': 'FAQ', 'spec_equipment': '規格配備',
    'recommend': '為您推薦', 'model_list': '底部車款入口',
}
SECTION_ORDER = list(SECTION_LABEL)
FEATURES = [s for s in SECTION_ORDER if s.startswith('feature_')]
HOME_SECTIONS = [('home_hero', '封面輪播'), ('home_brand', 'AMAZING LEXUS 品牌'), ('home_service', '服務入口'),
                 ('home_news', 'News'), ('home_extra', '其他服務入口'), ('home_model_list', '底部車款入口')]
ENTRIES = [
    ('menu', '主選單 車款介紹', '車款介紹選單展開次數'),
    ('home_hero', '首頁 封面輪播', '有封面輪播曝光的首頁瀏覽'),
    ('home_model_list', '首頁 底部車款入口', '看到首頁底部車款入口'),
    ('model_page_recommend', '車款頁 為您推薦', '看到為您推薦'),
    ('model_page_list', '車款頁 底部車款入口', '看到車款頁底部車款入口'),
]
CTA_FAB = [('offer', '購車優惠'), ('test_drive', '試乘諮詢'), ('find_dealer', '據點查詢'), ('tech_showcase', '科技展演')]
CTA_PAGE = [('catalog_download', '下載型錄', 'hero'), ('test_drive', '試乘諮詢', 'highlight'),
            ('compare', '前往全車系比較', 'spec_equipment')]


def ratio(a, b, nd=4):
    return round(a / b, nd) if a is not None and b else None


NEVER = 9223372036854775807  # "not live yet": denominators become empty


def go_live_times(base):
    """First event_timestamp (µs) of each tracking addition made after the pre-test started."""
    sql = f"""WITH b AS ({base})
SELECT MIN(IF(event_name = 'menu_open', ts, NULL)) AS menu_open,
  MIN(IF(event_name = 'section_view' AND STARTS_WITH(section, 'home_'), ts, NULL)) AS home_section_view,
  MIN(IF(content_in_view IS NOT NULL, ts, NULL)) AS content_in_view FROM b"""
    res = subprocess.run(['bq', 'query', f'--project_id={PROJECT}', '--use_legacy_sql=false', '--format=json', '--quiet'],
                         input=sql, capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit('go-live query failed:\n' + (res.stderr or res.stdout))
    row = json.loads(res.stdout)[0]
    return {k: (int(v) if v else None) for k, v in row.items()}


def run_query(name, base, live):
    sql = (SQL / f'{name}.sql').read_text().replace('{BASE}', base) \
        .replace('{MENU_LIVE}', str(live['menu_open'] or NEVER)) \
        .replace('{HOME_LIVE}', str(live['home_section_view'] or NEVER)) \
        .replace('{CIV_LIVE}', str(live['content_in_view'] or NEVER))
    cmd = ['bq', 'query', f'--project_id={PROJECT}', '--use_legacy_sql=false', '--format=json',
           '--max_rows=1000000', '--quiet']
    res = subprocess.run(cmd, input=sql, capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit(f'[{name}] bq failed:\n{res.stderr or res.stdout}')
    rows = json.loads(res.stdout or '[]')
    for r in rows:  # bq returns every value as a string
        for k, v in r.items():
            if isinstance(v, str) and re.fullmatch(r'-?\d+', v):
                r[k] = int(v)
            elif isinstance(v, str):
                try:
                    r[k] = float(v)
                except ValueError:
                    pass
    print(f'  {name}: {len(rows)} rows', file=sys.stderr)
    return name, rows


def latest_table():
    res = subprocess.run(['bq', 'ls', '--max_results=1000', '--format=json', DATASET.replace('.', ':', 1)],
                         capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit('bq ls failed — run `gcloud auth login` first.\n' + res.stderr)
    ids = sorted(t['tableReference']['tableId'][7:] for t in json.loads(res.stdout)
                 if re.fullmatch(r'events_\d{8}', t['tableReference']['tableId']))
    return ids[-1] if ids else None


def recommend_lists(models, refresh):
    cache = json.loads(REC_CACHE.read_text()) if REC_CACHE.exists() else {}
    need = [m for m in models if refresh or m not in cache]
    for m in need:
        try:
            req = urllib.request.Request(f'https://www.lexus.com.tw/showroom/{m}', headers={'User-Agent': 'Mozilla/5.0'})
            html = urllib.request.urlopen(req, timeout=20).read().decode('utf-8', 'ignore')
            i = html.find('recommend__list')
            names = [n.strip() for n in re.findall(r'model__name">([^<]*)<', html[i:i + 6000])] if i >= 0 else []
            cache[m] = [n.split()[0].upper() for n in names if n]  # "RZ 450e" -> "RZ"
        except Exception as e:  # keep going; pairs fall back to clicked combos only
            print(f'  recommend list for {m} unavailable: {e}', file=sys.stderr)
    REC_CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1))
    return cache


def fmt_day(s):
    return f'{s[:4]}-{s[4:6]}-{s[6:]}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--start', default='20261105')
    ap.add_argument('--end', default='20261204')
    ap.add_argument('--refresh-recommend', action='store_true')
    args = ap.parse_args()

    latest = latest_table()
    end = min(args.end, latest) if latest else args.end
    print(f'Window {args.start} – {end} (latest table {latest})', file=sys.stderr)
    base = (SQL / '_base.sql').read_text().replace('{DATASET}', DATASET) \
        .replace('{START}', args.start).replace('{END}', end)
    base = '\n'.join(l for l in base.splitlines() if not l.lstrip().startswith('--'))

    live = go_live_times(base)
    print('Go-live (µs):', live, file=sys.stderr)
    names = ['overview', 'home', 'hero', 'entries', 'feature', 'misclick', 'order', 'cta', 'spec', 'recommend']
    with ThreadPoolExecutor(max_workers=5) as ex:
        R = dict(ex.map(lambda n: run_query(n, base, live), names))

    by = lambda rows, *keys: {tuple(r[k] for k in keys): r for r in rows}

    # model list = models with model-page data
    models_present = [m for m in MODELS if any(r['model'] == m for r in R['feature'])]
    rec_lists = recommend_lists(models_present, args.refresh_recommend)
    tracking = {
        'menu_open': any(r['entry'] == 'menu' and r['kind'] == 'den' for r in R['entries']),
        'home_section_view': any(r['section'] != '_pv' for r in R['home']),
        'content_in_view': any((r.get('civ') or 0) > 0 for r in R['overview']),
    }

    out_dev = {}
    for dev in DEVICES:
        ov = next((r for r in R['overview'] if r['device'] == dev), {})
        # 1 home
        home = {r['section']: r['n'] for r in R['home'] if r['device'] == dev}
        home_sections = [{'section': k, 'label': lbl, 'reach': ratio(home.get(k), home.get('_pv'))}
                         for k, lbl in HOME_SECTIONS] if tracking['home_section_view'] else []
        # 2 hero
        hrows = [r for r in R['hero'] if r['device'] == dev]
        hpv = next((r['n'] for r in hrows if r['kind'] == 'pv'), 0)
        exp_by_idx, clk_by_idx = {}, {}
        for r in hrows:
            if r['kind'] == 'exp':
                exp_by_idx[r['idx']] = exp_by_idx.get(r['idx'], 0) + r['n']
            elif r['kind'] == 'clk':
                clk_by_idx[r['idx']] = r['n']
        hero = []
        # drop stray titles (< 5% of that slot's exposures), e.g. a mis-tagged non-model link
        for r in sorted((r for r in hrows if r['kind'] == 'exp' and r['n'] >= 0.05 * exp_by_idx[r['idx']]),
                        key=lambda r: (r['idx'], -r['n'])):
            hero.append({'index': r['idx'], 'title': r['title'] or '（無標題）', 'exposure': ratio(r['n'], hpv),
                         'ctr': ratio(clk_by_idx.get(r['idx'], 0), exp_by_idx[r['idx']])})
        # 3 entries
        ent = {(r['entry'], r['kind']): r['n'] for r in R['entries'] if r['device'] == dev}
        total_clk = sum(n for (e, k), n in ent.items() if k == 'clk')
        # entries whose denominator is a new event: only clicks after go-live count
        click_for_ctr = lambda e: ent.get((e, 'clk_live'), 0) if e in ('menu', 'home_model_list') else ent.get((e, 'clk'), 0)
        entries = [{'entry': e, 'label': lbl, 'share': ratio(ent.get((e, 'clk'), 0), total_clk),
                    'ctr': ratio(click_for_ctr(e), ent.get((e, 'den'))), 'denom': den}
                   for e, lbl, den in ENTRIES]
        # 4–6 per model
        models = {}
        for m in ['all'] + models_present:
            frows = {r['section']: r for r in R['feature'] if r['device'] == dev and r['model'] == m}
            units = next(iter(frows.values()), {}).get('units')
            mrows = {r['section']: r for r in R['misclick'] if r['device'] == dev and r['model'] == m}
            sections = [{'section': s, 'label': SECTION_LABEL[s], 'reach': ratio(frows[s]['seen'], units)}
                        for s in SECTION_ORDER if s in frows]
            feature = []
            for s in FEATURES:
                if s not in frows:
                    continue
                f, mc = frows[s], mrows.get(s, {})
                feature.append({
                    'section': s, 'label': SECTION_LABEL[s], 'seen': f['seen'],
                    'reach': ratio(f['seen'], units), 'repeat': ratio(f['rep'], f['seen']),
                    'dwell': round(f['dwell'], 1) if f.get('dwell') is not None else None,
                    'complete': ratio(f.get('complete') or 0, f['seen']),
                    'variant': ratio(f.get('var') or 0, f['seen']),
                    'clicks': mc.get('clicks', 0),
                    # estimate (whole window) and direct measure (content_in_view, since go-live)
                    'misclick': ratio(mc.get('est_mis'), mc.get('clicks')),
                    'scroll_back': ratio(mc.get('est_back'), mc.get('est_mis')),
                    'civ_clicks': mc.get('civ_n', 0),
                    'misclick_direct': ratio(mc.get('civ_no'), mc.get('civ_n')),
                    'scroll_back_direct': ratio(mc.get('civ_back'), mc.get('civ_no')),
                    'est_on_direct': ratio(mc.get('both_est_no'), mc.get('civ_n')),
                })
            orows = [r for r in R['order'] if r['device'] == dev and r['model'] == m]
            opv = next((r for r in orows if r['path'] == '_pv'), {'n': 0, 'inv': 0})
            skips = sorted((r for r in orows if r['path'] != '_pv'), key=lambda r: -r['n'])[:5]
            order = {'in_order': ratio(opv['n'] - (opv['inv'] or 0), opv['n']), 'pv': opv['n'],
                     'skips': [{'path': ' → '.join(SECTION_LABEL.get(x, x) for x in r['path'].split('>')),
                                'share': ratio(r['n'], opv['inv'])} for r in skips]}
            crows = [r for r in R['cta'] if r['device'] == dev and r['model'] == m]
            cpv = next((r['n'] for r in crows if r['kind'] == 'pv'), 0)
            csec = {r['k1']: r['n'] for r in crows if r['kind'] == 'sec'}
            cclk = {(r['k1'], r['k2']): r['n'] for r in crows if r['kind'] == 'clk'}
            td_fab, td_page = cclk.get(('test_drive', 'fab'), 0), cclk.get(('test_drive', 'page'), 0)
            cta = {
                'fab': [{'type': t, 'label': l, 'clicks': cclk.get((t, 'fab'), 0), 'rate': ratio(cclk.get((t, 'fab'), 0), cpv)} for t, l in CTA_FAB],
                'page': [{'type': t, 'label': l, 'section': SECTION_LABEL[s], 'clicks': cclk.get((t, 'page'), 0),
                          'rate': ratio(cclk.get((t, 'page'), 0), csec.get(s))} for t, l, s in CTA_PAGE],
                'test_drive_split': {'fab': ratio(td_fab, td_fab + td_page), 'page': ratio(td_page, td_fab + td_page)},
            }
            models[m] = {'units': units, 'sections': sections, 'feature': feature, 'order': order, 'cta': cta}
        # 7.1 spec switch
        sp = {r['k']: r['n'] for r in R['spec'] if r['device'] == dev}
        spec = {'on': sp.get('on', 0), 'off': sp.get('off', 0),
                'open_rate': ratio(sp.get('on_live', 0), sp.get('_menu_open')),
                'off_after_on': ratio(sp.get('off', 0), sp.get('on'))}
        # 7.2 recommend
        rrows = [r for r in R['recommend'] if r['device'] == dev]
        seen = {r['src']: r['n'] for r in rrows if r['kind'] == 'seen'}
        clk = {(r['src'], r['dst']): r['n'] for r in rrows if r['kind'] == 'clk' and r['dst'] in MODELS}
        sources = sorted(({'model': s, 'seen': n, 'ctr': ratio(sum(v for (a, _), v in clk.items() if a == s), n)}
                          for s, n in seen.items() if s in MODELS), key=lambda x: -(x['ctr'] or 0))
        pairs, done = [], set()
        for src, lst in rec_lists.items():
            for pos, dst in enumerate(lst, 1):
                done.add((src, dst))
                pairs.append({'from': src, 'to': dst, 'pos': pos, 'clicks': clk.get((src, dst), 0),
                              'ctr': ratio(clk.get((src, dst), 0), seen.get(src))})
        for (src, dst), n in clk.items():
            if (src, dst) not in done and src in MODELS:
                pairs.append({'from': src, 'to': dst, 'pos': None, 'clicks': n, 'ctr': ratio(n, seen.get(src))})
        pairs.sort(key=lambda p: -(p['ctr'] or 0))
        ds = {d: next((r['sessions'] for r in R['overview'] if r['device'] == d), 0) for d in DEVICES}
        out_dev[dev] = {
            'overview': {'sessions': ov.get('sessions'), 'users': ov.get('users'), 'pageviews': ov.get('pageviews'),
                         'device_share': {'desktop': ratio(ds['desktop'], ds['all'], 3), 'mobile': ratio(ds['mobile'], ds['all'], 3)}},
            'home_sections': home_sections, 'home_hero': hero, 'entries': entries, 'models': models,
            'spec_switch': spec, 'recommend': {'sources': sources, 'pairs': pairs},
        }

    days = (date(int(end[:4]), int(end[4:6]), int(end[6:])) - date(int(args.start[:4]), int(args.start[4:6]), int(args.start[6:]))).days + 1
    data = {
        'meta': {
            'sample': False, 'period': f'{fmt_day(args.start)} – {fmt_day(end)}', 'days': days,
            'planned_end': fmt_day(args.end), 'generated': datetime.now().strftime('%Y-%m-%d %H:%M'),
            'property': 'G-4DVH5EF2RM', 'host': 'www.lexus.com.tw', 'models': models_present, 'tracking': tracking,
            'tracking_since': {k: (datetime.fromtimestamp(v / 1e6, tz=timezone(timedelta(hours=8))).strftime('%Y-%m-%d %H:%M') if v else None)
                               for k, v in live.items()},
        },
        'old': out_dev, 'new': None,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
    print(f'Wrote {OUT} ({OUT.stat().st_size // 1024} KB)', file=sys.stderr)


if __name__ == '__main__':
    main()
