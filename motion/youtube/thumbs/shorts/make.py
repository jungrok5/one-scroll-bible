# Shorts covers with a hook line — every Short gets one (관리자 2026-11-17 "앞으로 가로세로 이렇게 만들어줘", after the maintainer's wife
# compared our Shorts tab with a channel whose covers carry a question: our tab showed art frames with nothing to tap for).
#   py motion/youtube/thumbs/shorts/make.py <set…>        → <set>/out/<key>.jpg (1080×1920) + <set>/sheet.jpg (the Shorts-tab grid size)
#   sets: folders next to this file, each with hooks.json {channel, items: {key: {id, words: [top, big, bottom]}}} and src/<key>.jpg
# The look is the 「그리스도」 cover (motion/films/christ/thumbs/make.py make_v): the picture stays, a dark band fades in under it, and
# three centred lines sit inside the middle 3:4 (y 240–1680, Instagram's grid crop) — small white line, the big gold word fitted to the
# width, small white line. Same file = the Instagram Reels cover. Words: a question the viewer already has, or a reversal — never light
# or joking (관리자: "저건 너무 가벼운"); facts in the words checked against the verse.
# Upload: node motion/youtube/thumbs/shorts/apply.mjs <set> [--dry]  (thumbnails.set, 50 units each; YT_* in the environment).
import os, sys, json, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
FONTS = os.path.join(ROOT, 'out', 'fonts'); os.makedirs(FONTS, exist_ok=True)
URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf'
GOLD = (255, 204, 80); WHITE = (255, 255, 255); INK = (12, 10, 8); VW, VH = 1080, 1920

def font(size):
    p = os.path.join(FONTS, 'NotoSansKR.ttf')
    if not os.path.exists(p): urllib.request.urlretrieve(URL, p)
    f = ImageFont.truetype(p, size)
    try: f.set_variation_by_name('Black')
    except Exception: pass
    return f

def text(b, xy, s, f, fill, st):
    sh = Image.new('RGBA', b.size, (0, 0, 0, 0))   # soft shadow under the letters
    ImageDraw.Draw(sh).text((xy[0] + 6, xy[1] + 8), s, font=f, fill=(0, 0, 0, 200), stroke_width=st, stroke_fill=(0, 0, 0, 200))
    b.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14))); ImageDraw.Draw(b).text(xy, s, font=f, fill=fill, stroke_width=st, stroke_fill=INK)

def fit(s, size, maxw, st):   # the biggest size up to `size` whose width fits maxw
    while size > 60 and ImageDraw.Draw(Image.new('RGB', (8, 8))).textbbox((0, 0), s, font=font(size), stroke_width=st)[2] > maxw: size -= 6
    return font(size)

def centred(b, y, s, f, fill, st):
    w = ImageDraw.Draw(b).textbbox((0, 0), s, font=f, stroke_width=st)[2]; text(b, ((VW - w) // 2, y), s, f, fill, st)

def cover(src, words):
    top, big, tail = (list(words) + ['', '', ''])[:3]
    im = Image.open(src).convert('RGB')
    s = max(VW / im.width, VH / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x0, y0 = (im.width - VW) // 2, (im.height - VH) // 2; im = im.crop((x0, y0, x0 + VW, y0 + VH)).convert('RGBA')
    band = Image.new('RGBA', (VW, VH)); d = ImageDraw.Draw(band)   # dark band: fades in from y 760, fades out under the Shorts overlay
    for y in range(VH): d.line([(0, y), (VW, y)], fill=(6, 4, 2, int(235 * min(1, max(0, (y - 760) / 260)) * (1 if y < 1700 else max(0, 1 - (y - 1700) / 220)))))
    im.alpha_composite(band)
    if top: centred(im, 990, top, fit(top, 78, 980, 7), WHITE, 7)
    centred(im, 1080, big, fit(big, 260, 980, 16), GOLD, 16)
    if tail: centred(im, 1420, tail, fit(tail, 80, 980, 8), WHITE, 8)
    return im.convert('RGB')

for name in sys.argv[1:] or [d for d in sorted(os.listdir(HERE)) if os.path.exists(os.path.join(HERE, d, 'hooks.json'))]:
    D = os.path.join(HERE, name); H = json.load(open(os.path.join(D, 'hooks.json'), encoding='utf-8'))['items']
    os.makedirs(os.path.join(D, 'out'), exist_ok=True); ims = []
    for k in sorted(H):
        im = cover(os.path.join(D, 'src', k + '.jpg'), H[k]['words']); p = os.path.join(D, 'out', k + '.jpg')
        q = 90
        while True:   # YouTube's thumbnail limit is 2 MB
            im.save(p, quality=q)
            if os.path.getsize(p) < 1_900_000 or q < 60: break
            q -= 8
        ims.append(im); print(p)
    cols = min(3, len(ims)); rows = (len(ims) + cols - 1) // cols; tw, th, g = 240, 427, 6   # the phone's Shorts-tab tile
    sheet = Image.new('RGB', (cols * tw + (cols + 1) * g, rows * th + (rows + 1) * g), (255, 255, 255))
    for i, im in enumerate(ims): sheet.paste(im.resize((tw, th), Image.LANCZOS), (g + (i % cols) * (tw + g), g + (i // cols) * (th + g)))
    sheet.save(os.path.join(D, 'sheet.jpg'), quality=86)
