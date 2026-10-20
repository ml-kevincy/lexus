"""Cut redesign image assets out of the text-less composites / raw layer pixels.
usage: python -I psd_assets.py <psd_dir> <textless_dir> <out_dir>"""
import sys
from pathlib import Path

from PIL import Image
from psd_tools import PSDImage

Image.MAX_IMAGE_PIXELS = None
psd_dir, tl, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)


def save(img, name, q=82):
    if name.endswith('.png'):
        img.save(out / name, optimize=True)
    else:
        img.convert('RGB').save(out / name, quality=q, optimize=True, progressive=True)
    print(name, img.size)


def crop(src, box, name, q=82):
    x, y, w, h = box
    save(src.crop((x, y, x + w, y + h)), name, q)


# ---- home (desktop composite, 1920 wide) ----
idx = Image.open(tl / 'idx_0930_b.png')
crop(idx, (0, 0, 1920, 940), 'home-hero-es.jpg')
crop(idx, (89, 1178, 563, 844), 'home-card-es.jpg')
crop(idx, (679, 1178, 562, 844), 'home-card-rx.jpg')
crop(idx, (1268, 1178, 563, 844), 'home-card-nx.jpg')
crop(idx, (158, 2299, 903, 502), 'home-promo-warranty.jpg')
crop(idx, (158, 3222, 503, 344), 'home-news.jpg')
crop(idx, (89, 3884, 1743, 503), 'home-contact.jpg')

# ---- home mobile hero (750 wide, 2x) ----
idxm = Image.open(tl / 'idx_mb_1013.png')
crop(idxm, (0, 0, 750, 1230), 'home-hero-es-m.jpg')

# ---- ES showroom (desktop composite) ----
es = Image.open(tl / 'showroom_0907.png')
crop(es, (186, 1539, 500, 340), 'es-intro-small.jpg')
crop(es, (871, 1390, 1049, 962), 'es-intro-main.jpg')
crop(es, (159, 3549, 902, 615), 'es-power-1.jpg')
crop(es, (859, 4084, 902, 615), 'es-power-2.jpg')
crop(es, (676, 5559, 1085, 502), 'es-interior-gold.jpg')
for i, (x, y) in enumerate([(89, 6807), (969, 6807), (89, 7084), (969, 7084)], 1):
    crop(es, (x, y, 322, 258), f'es-feature-{i}.jpg')

esm = Image.open(tl / 'showroom_mb_0907.png')
crop(esm, (0, 0, 750, 1250), 'es-hero-m.jpg')

# ---- raw layer pixels (clean or off-canvas) ----
psd = PSDImage.open(psd_dir / 'showroom_0907.psd')
for layer in psd.descendants():
    if layer.kind not in ('smartobject', 'pixel'):
        continue
    n, p = layer.name, layer.parent.name if layer.parent else ''
    if n == 'ES 首頁 Banner':
        im = layer.topil()  # 2952x1968 at (-475,-727): keep the canvas window plus bleed
        save(im.crop((475, 727, 475 + 1920, 727 + 1241)), 'es-hero.jpg')
    elif n == 'TAZUNA座艙_ES 300h 拷貝 2':
        save(layer.topil(), 'es-cabin-1.jpg')
    elif n == '感應式觸控按鈕':
        # clipped to a 903x615 frame starting 309px into the layer
        save(layer.topil().crop((309, 0, 309 + 903, 612)), 'es-cabin-2.jpg')
    elif n == '圖層 4' and p == '外觀色系':
        save(layer.topil(), 'es-exterior-blue.png')
    elif n == '圖層 627' and p == '車款比較_1':
        save(layer.topil(), 'es-compare-car.png')
