"""Copy the mirrored test-drive page into redesign/ (there is no redesign PSD for it).
A <base href="../mirror/"> keeps every asset, API replay and script-built path resolving into mirror/;
links to home / ES / test drive point back into redesign/, everything else goes to the live site.
usage: python3 tools/redesign/build_testdrive.py   (run from the repo root)"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
html = (ROOT / 'mirror/testdrive.html').read_text(encoding='utf-8')
LIVE = 'https://www.lexus.com.tw'

# mirror page path -> target, relative to the <base> (mirror/)
PAGE_LINKS = {
    'index.html': '../redesign/index.html',
    'showroom/ES.html': '../redesign/showroom/ES.html',
    'testdrive.html': '../redesign/testdrive.html',
    'showroom/NX.html': LIVE + '/showroom/NX',
}


def link(m):
    url = m.group(3)
    base, sep, rest = re.match(r'([^?#]*)([?#]?)(.*)', url).groups()
    return m.group(1) + m.group(2) + (PAGE_LINKS[base] + sep + rest if base in PAGE_LINKS else url) + m.group(2)


html = re.sub(r'(\shref\s*=\s*)(["\'])([^"\']*)\2', link, html)
html = re.sub(r'(<head[^>]*>)', r'\1\n<base href="../mirror/">', html, count=1)
# shim: computed against location (redesign/), so name the mirror explicitly; mirrored-page links resolve into redesign/
html = html.replace('window.__MIRROR_ROOT="";', 'window.__MIRROR_ROOT="../mirror/";', 1)
html = re.sub(r'window\.__MIRROR_PAGES=\{[^}]*\};',
              'window.__MIRROR_PAGES={"/":"../redesign/index.html","/showroom/es":"../redesign/showroom/ES.html","/testdrive.aspx":"../redesign/testdrive.html"};', html, count=1)
# testdrive.js builds "<root>testdrive.html?id=" when a car is picked; after load, aim it at this copy.
html = html.replace('</body>', '<script>window.__MIRROR_ROOT="../redesign/";</script>\n</body>', 1)
html = html.replace('<title>', '<title>（新版流程）', 1)

out = ROOT / 'redesign/testdrive.html'
out.write_text(html, encoding='utf-8')
print(out, len(html))
