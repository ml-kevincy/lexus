#!/usr/bin/env python3
"""Turn report/data/conclusions-draft.md into report/data/conclusions.json (what the page shows).

Draft format: a first line containing "資料：<period>", then one "## <section no> <title>" heading per
section followed by "- " bullets. A trailing （…） in a heading is dropped.
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
        out['sections'][cur] = []
    elif cur and line.startswith('- '):
        out['sections'][cur].append(line[2:].strip())
    elif cur and line.strip() and not line.startswith('#') and out['sections'][cur]:
        out['sections'][cur][-1] += line.strip()  # wrapped bullet

(DATA / 'conclusions.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
print({k: len(v) for k, v in out['sections'].items()}, 'asof', out['asof'])
