#!/usr/bin/env python3
"""Turn report/data/conclusions-draft.md into report/data/conclusions.json (what the page shows).

Draft format: a first line containing "資料：<period>", then one "## <section no> <title>" heading per
section, then an optional "重點：<one sentence>" line (shown directly) and "- " bullets (collapsed details).
Usage: python3 report/conclusions.py
"""
import json, re
from pathlib import Path

DATA = Path(__file__).resolve().parent / 'data'
text = (DATA / 'conclusions-draft.md').read_text(encoding='utf-8')

m = re.search(r'資料：([0-9-]+ – [0-9-]+)', text)
out = {'asof': m.group(1) if m else None, 'sections': {}}
cur = None
for line in text.splitlines():
    h = re.match(r'##\s+([\d.]+)\s', line)
    if h:
        cur = h.group(1)
        out['sections'][cur] = {'summary': '', 'details': []}
    elif cur and line.startswith('重點：'):
        out['sections'][cur]['summary'] = line[len('重點：'):].strip()
    elif cur and line.startswith('- '):
        out['sections'][cur]['details'].append(line[2:].strip())
    elif cur and line.strip() and not line.startswith('#') and out['sections'][cur]['details']:
        out['sections'][cur]['details'][-1] += line.strip()  # wrapped bullet

(DATA / 'conclusions.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
print({k: (bool(v['summary']), len(v['details'])) for k, v in out['sections'].items()}, 'asof', out['asof'])
