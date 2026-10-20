"""Dump a PSD's structure (groups, bboxes, text, fonts) and a scaled preview.
usage: python -I psd_inspect.py <psd> <outdir>"""
import json
import sys
from pathlib import Path

from psd_tools import PSDImage

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
psd = PSDImage.open(src)

lines, texts, fonts = [], [], {}


def font_info(layer):
    try:
        rd = layer.resource_dict
        names = [f.get('Name').value if hasattr(f.get('Name'), 'value') else str(f.get('Name')) for f in rd['FontSet']]
        runs = layer.engine_dict['StyleRun']['RunArray']
        out = []
        for r in runs:
            ss = r['StyleSheet']['StyleSheetData']
            name = names[ss['Font']] if 'Font' in ss else '?'
            size = float(ss.get('FontSize', 0))
            # account for transform scale
            sx = layer.transform[0] if layer.transform else 1
            out.append((str(name), round(size * sx, 1)))
        return out
    except Exception:
        return []


def walk(group, depth):
    for layer in group:
        if not layer.is_visible():
            continue
        b = layer.bbox
        tag = layer.kind
        line = f"{'  ' * depth}- [{tag}] {layer.name}  ({b[0]},{b[1]} {b[2]-b[0]}x{b[3]-b[1]})"
        if layer.kind == 'type':
            t = (layer.text or '').replace('\r', ' / ').strip()
            fi = font_info(layer)
            for n, s in fi:
                fonts.setdefault(n, set()).add(s)
            texts.append({'text': t, 'bbox': list(b), 'fonts': fi})
            line += f'  "{t[:60]}"  {fi[:1]}'
        if depth < 4 or layer.kind == 'type':
            lines.append(line)
        if layer.is_group():
            walk(layer, depth + 1)


walk(psd, 0)
stem = src.stem
(out / f'{stem}_tree.txt').write_text(f'{src.name} {psd.width}x{psd.height}\n' + '\n'.join(lines), encoding='utf-8')
(out / f'{stem}_texts.json').write_text(json.dumps(texts, ensure_ascii=False, indent=1), encoding='utf-8')

# Preview from the embedded merged image (fast; no re-compositing).
img = psd.topil()
if img is not None:
    w = 720 if psd.width > 1000 else 390
    img = img.convert('RGB').resize((w, round(psd.height * w / psd.width)))
    # split long pages into readable slices
    h = round(w * 2.2)
    for i in range(0, img.height, h):
        img.crop((0, i, w, min(i + h, img.height))).save(out / f'{stem}_preview_{i // h:02d}.jpg', quality=82)

print(json.dumps({'file': src.name, 'size': [psd.width, psd.height], 'layers': len(lines), 'texts': len(texts),
                  'merged': img is not None, 'fonts': {k: sorted(v) for k, v in fonts.items()}}, ensure_ascii=False))
