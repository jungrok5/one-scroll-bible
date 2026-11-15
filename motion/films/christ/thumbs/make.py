# YouTube thumbnails for 「그리스도」 (landscape A/B/C for Studio's "Test & compare", 9:16 covers) — copied from silence400/thumbs/make.py.
#   py motion/films/christ/thumbs/make.py   → thumbs/{A-oil,B-prayer,C-cross}.jpg + V-*.jpg + sheet.jpg/sheet-v.jpg
# Words: review.json publish_plan.thumbs (관리자 2026-11-10 "그래 이대로 진행"). The big middle word is fitted to the width (it ranges from
# 2 to 6 syllables here). Frames (no captions — lib-film ?clean=1):
#   RENDER_QUERY=clean=1 node motion/render.mjs h|v --page films/christ/film.html --stills 17.5,93,164   (→ thumbs/src/<h|v>-<t>.jpg)
#   py motion/films/christ/thumbs/make.py --lang en|es|pt-BR   → A-oil-<lang>.jpg + V-A-oil-<lang>.jpg only: the international video's
#   thumbnails, words = youtube-intl.json thumb_words (from the reviewed lines N01/N03; native review motion/reviews/film-christ-yt.md)
import os, sys, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
FONTS = os.path.join(ROOT, 'out', 'fonts'); os.makedirs(FONTS, exist_ok=True)
URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf'
GOLD = (255, 204, 80); WHITE = (255, 255, 255); INK = (12, 10, 8); W, H = 1280, 720
import json
PLAN = json.load(open(os.path.join(HERE, '..', 'review.json'), encoding='utf-8'))['publish_plan']['thumbs']
# name, picture, crop focus (0..1 of width — lands at 66 %), brightness, zoom, shade strength, words key
PICS = [('A-oil', 'h-17_5.jpg', .4, 1.1, 1.12, 1.0, 'A'), ('B-prayer', 'h-164.jpg!flip', .63, 1.25, 1.12, .9, 'B'), ('C-cross', 'h-93.jpg', .56, 1.15, 1.1, 1.0, 'C')]
LANG = sys.argv[sys.argv.index('--lang') + 1] if '--lang' in sys.argv else None
if LANG: PLAN = {**PLAN, 'A': json.load(open(os.path.join(HERE, '..', 'youtube-intl.json'), encoding='utf-8'))['thumb_words'][LANG]}

def font(size):
    p = os.path.join(FONTS, 'NotoSansKR.ttf')
    if not os.path.exists(p): urllib.request.urlretrieve(URL, p)
    f = ImageFont.truetype(p, size)
    try: f.set_variation_by_name('Black')
    except Exception: pass
    return f

def text(base, xy, s, f, fill, stroke):
    sh = Image.new('RGBA', base.size, (0, 0, 0, 0))   # soft shadow under the letters
    ImageDraw.Draw(sh).text((xy[0] + 6, xy[1] + 8), s, font=f, fill=(0, 0, 0, 200), stroke_width=stroke, stroke_fill=(0, 0, 0, 200))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)))
    ImageDraw.Draw(base).text(xy, s, font=f, fill=fill, stroke_width=stroke, stroke_fill=INK)

def fit(s, size, maxw, stroke):   # the biggest size up to `size` whose width fits maxw
    while size > 60 and ImageDraw.Draw(Image.new('RGB', (8, 8))).textbbox((0, 0), s, font=font(size), stroke_width=stroke)[2] > maxw: size -= 6
    return font(size)

def make(name, src, focus, bright, z, shade_k=1.0, key='A'):
    TOP, BIG, TAIL = PLAN[key]
    flip = src.endswith('!flip'); src = src.replace('!flip', '')   # '!flip': mirror so the subject sits right of the words
    im = Image.open(os.path.join(HERE, 'src', src)).convert('RGB')
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    # zoom in so the subject fills the right two-thirds; shift so `focus` lands at 66 % of the width
    im = im.resize((int(im.width * z), int(im.height * z)), Image.LANCZOS)
    x0 = int(min(max(focus * im.width - .66 * W, 0), im.width - W)); y0 = (im.height - H) // 2
    im = ImageEnhance.Brightness(im.crop((x0, y0, x0 + W, y0 + H))).enhance(bright).convert('RGBA')
    shade = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(shade)   # darken the left for the words
    for x in range(W): d.line([(x, 0), (x, H)], fill=(6, 4, 2, int(245 * shade_k * min(1, max(0, 1.25 - x / (W * .62))) ** .9)))
    im.alpha_composite(shade)
    text(im, (56, 78), TOP, font(64), WHITE, 6)
    text(im, (40, 160), BIG, fit(BIG, 230, 700, 14), GOLD, 14)
    text(im, (56, 470), TAIL, font(70), WHITE, 7)
    out = os.path.join(HERE, name + '.jpg'); im.convert('RGB').save(out, quality=92); print(out)
    return im

ims = [] if LANG else [make(*p) for p in PICS]
if ims:
  sheet = Image.new('RGB', (len(ims) * 350 + 10, 191 + 20), (24, 24, 24))   # the phone feed size
  for i, im in enumerate(ims): sheet.paste(im.convert('RGB').resize((340, 191), Image.LANCZOS), (10 + i * 350, 10))
  sheet.save(os.path.join(HERE, 'sheet.jpg'), quality=90)

# 9:16 covers (1080×1920): Instagram Reels cover, the Shorts thumbnail once the channel gets the button, the site's /film poster.
# The picture sits in the top part of the vertical frames; the words go in the dark band under it, all inside the middle 3:4
# (y 240–1680 — what the Instagram profile grid shows). Frames: RENDER_QUERY=clean=1 node motion/render.mjs v … --stills 122,113.6,115.2
VW, VH = 1080, 1920
VPICS = [('V-A-oil', 'v-17_5.jpg', -200, 1.0, 'A'), ('V-B-prayer', 'v-164.jpg', -200, 1.0, 'B'), ('V-C-cross', 'v-93.jpg', -200, 1.0, 'C')]

def centered(base, y, s, f, fill, stroke):
    w = ImageDraw.Draw(base).textbbox((0, 0), s, font=f, stroke_width=stroke)[2]
    text(base, ((VW - w) // 2, y), s, f, fill, stroke)

def make_v(name, src, dy, z, key='A'):
    TOP, BIG, TAIL = PLAN[key]
    pic = Image.open(os.path.join(HERE, 'src', src)).convert('RGB')
    pic = pic.resize((int(VW * z), int(VH * z)), Image.LANCZOS)
    im = Image.new('RGBA', (VW, VH), (8, 6, 4, 255)); im.paste(pic, ((VW - pic.width) // 2, dy))
    shade = Image.new('RGBA', (VW, VH)); d = ImageDraw.Draw(shade)   # darken under the picture for the words
    for y in range(VH): d.line([(0, y), (VW, y)], fill=(6, 4, 2, int(240 * min(1, max(0, (y - 1000) / 260)))))
    im.alpha_composite(shade)
    centered(im, 1110, TOP, font(78), WHITE, 7)
    centered(im, 1200, BIG, fit(BIG, 280, 980, 16), GOLD, 16)
    centered(im, 1580, TAIL, font(84), WHITE, 8)
    out = os.path.join(HERE, name + '.jpg'); im.convert('RGB').save(out, quality=92); print(out)
    return im

if LANG:   # the international video: picture A only, landscape (main / per-language thumbnail) and portrait (the Short's cover)
    make('A-oil-' + LANG, *PICS[0][1:]); make_v('V-A-oil-' + LANG, *VPICS[0][1:]); sys.exit(0)
vims = [make_v(*p) for p in VPICS]
vsheet = Image.new('RGB', (3 * 240 + 40, 427 + 20), (24, 24, 24))   # the Shorts / Reels grid size
for i, im in enumerate(vims): vsheet.paste(im.convert('RGB').resize((240, 427), Image.LANCZOS), (10 + i * 250, 10))
vsheet.save(os.path.join(HERE, 'sheet-v.jpg'), quality=90)
