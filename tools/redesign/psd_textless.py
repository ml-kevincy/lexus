"""Like psd_textless.py but also hides groups matching EXTRA (regex) by exact group name."""
import re, sys
from psd_tools import PSDImage
src, out, extra = sys.argv[1], sys.argv[2], re.compile(sys.argv[3])
psd = PSDImage.open(src)
UI = re.compile(r'btn|idx_btn|header|tag_|切換|箭頭|群組 14|top|SNS|車型選擇|色系選擇|顏色選擇|圖片切換|h1|h2|h3|footer')
def chain(l):
    p = l
    while p is not None and p.kind != 'psdimage':
        yield p; p = p.parent
def keep(l):
    if l.kind == 'type': return False
    for p in chain(l):
        if p.is_group() and (UI.search(p.name) or extra.fullmatch(p.name)): return False
    return True
psd.composite(layer_filter=lambda l: l.is_visible() and keep(l)).convert('RGB').save(out)
