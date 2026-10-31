# YouTube thumbnails for 「침묵의 400년」 (landscape, for Studio's "Test & compare"): three pictures, one hook.
#   py motion/films/silence400/thumbs/make.py      → motion/films/silence400/thumbs/{A-glass,B-statue,C-scroll}.jpg + sheet.jpg (feed size check)
# Same rules as the first film's thumbnails (motion/youtube/thumbs/make.py, CTR research 2026-10): one picture with one subject,
# a few words, the number huge in gold with a thick dark outline so it reads at 168 px wide, the bottom-right corner left for
# the duration badge. Pictures in src/ are frames of the film without captions:
#   RENDER_QUERY=clean=1 node motion/render.mjs h --page films/silence400/film.html --stills 122,113.6,97.5
# Shorts take no custom thumbnail on this channel yet (2026-10-31): in Studio pick the title frame (0:20 "침묵의 400년").
import os, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
FONTS = os.path.join(ROOT, 'out', 'fonts'); os.makedirs(FONTS, exist_ok=True)
URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf'
GOLD = (255, 204, 80); WHITE = (255, 255, 255); INK = (12, 10, 8); W, H = 1280, 720
TOP, BIG, TAIL = '구약과 신약 사이', '400년', '무슨 일이 있었나'
# picture, crop focus (0..1 of width — the subject sits right of the text), brightness, zoom
PICS = [('A-glass', 'h-122.jpg', .62, 1.08, 1.35), ('B-statue', 'h-113_6.jpg', .5, 1.12, 1.12), ('C-strike', 'h-115_2.jpg', .5, 1.12, 1.12)]

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

def make(name, src, focus, bright, z):
    im = Image.open(os.path.join(HERE, 'src', src)).convert('RGB')
    # zoom in so the subject fills the right two-thirds; shift so `focus` lands at 66 % of the width
    im = im.resize((int(im.width * z), int(im.height * z)), Image.LANCZOS)
    x0 = int(min(max(focus * im.width - .66 * W, 0), im.width - W)); y0 = (im.height - H) // 2
    im = ImageEnhance.Brightness(im.crop((x0, y0, x0 + W, y0 + H))).enhance(bright).convert('RGBA')
    shade = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(shade)   # darken the left for the words
    for x in range(W): d.line([(x, 0), (x, H)], fill=(6, 4, 2, int(245 * min(1, max(0, 1.25 - x / (W * .62))) ** .9)))
    im.alpha_composite(shade)
    text(im, (56, 78), TOP, font(64), WHITE, 6)
    text(im, (40, 150), BIG, font(250), GOLD, 14)
    text(im, (56, 470), TAIL, font(70), WHITE, 7)
    out = os.path.join(HERE, name + '.jpg'); im.convert('RGB').save(out, quality=92); print(out)
    return im

ims = [make(*p) for p in PICS]
sheet = Image.new('RGB', (3 * 340 + 40, 191 + 20), (24, 24, 24))   # the phone feed size
for i, im in enumerate(ims): sheet.paste(im.convert('RGB').resize((340, 191), Image.LANCZOS), (10 + i * 350, 10))
sheet.save(os.path.join(HERE, 'sheet.jpg'), quality=90)

# 9:16 covers (1080×1920): Instagram Reels cover, the Shorts thumbnail once the channel gets the button, the site's /film poster.
# The picture sits in the top part of the vertical frames; the words go in the dark band under it, all inside the middle 3:4
# (y 240–1680 — what the Instagram profile grid shows). Frames: RENDER_QUERY=clean=1 node motion/render.mjs v … --stills 122,113.6,115.2
VW, VH = 1080, 1920
VPICS = [('V-A-glass', 'v-122.jpg', -260, 1.0), ('V-B-statue', 'v-113_6.jpg', -150, 1.06), ('V-C-strike', 'v-115_2.jpg', -150, 1.06)]

def centered(base, y, s, f, fill, stroke):
    w = ImageDraw.Draw(base).textbbox((0, 0), s, font=f, stroke_width=stroke)[2]
    text(base, ((VW - w) // 2, y), s, f, fill, stroke)

def make_v(name, src, dy, z):
    pic = Image.open(os.path.join(HERE, 'src', src)).convert('RGB')
    pic = pic.resize((int(VW * z), int(VH * z)), Image.LANCZOS)
    im = Image.new('RGBA', (VW, VH), (8, 6, 4, 255)); im.paste(pic, ((VW - pic.width) // 2, dy))
    shade = Image.new('RGBA', (VW, VH)); d = ImageDraw.Draw(shade)   # darken under the picture for the words
    for y in range(VH): d.line([(0, y), (VW, y)], fill=(6, 4, 2, int(240 * min(1, max(0, (y - 1000) / 260)))))
    im.alpha_composite(shade)
    centered(im, 1110, TOP, font(78), WHITE, 7)
    centered(im, 1180, BIG, font(300), GOLD, 16)
    centered(im, 1580, TAIL, font(84), WHITE, 8)
    out = os.path.join(HERE, name + '.jpg'); im.convert('RGB').save(out, quality=92); print(out)
    return im

vims = [make_v(*p) for p in VPICS]
vsheet = Image.new('RGB', (3 * 240 + 40, 427 + 20), (24, 24, 24))   # the Shorts / Reels grid size
for i, im in enumerate(vims): vsheet.paste(im.convert('RGB').resize((240, 427), Image.LANCZOS), (10 + i * 250, 10))
vsheet.save(os.path.join(HERE, 'sheet-v.jpg'), quality=90)
