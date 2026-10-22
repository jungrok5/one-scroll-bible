# YouTube thumbnails for the film — every language, four picture variants, one hook: "the whole Bible in 14 minutes".
#   python3 motion/youtube/thumbs/make.py [lang…]      → motion/youtube/thumbs/<lang>/{A-exodus,B-cross,C-split,D-earth}.jpg
#   python3 motion/youtube/thumbs/make.py --sheet       → motion/out/thumbs/all-langs.jpg (every language at feed size, to check)
# Why it looks like this (CTR research, 2026-10): one picture with one subject (no collage), 2–4 words, the number huge in
# gold with a thick dark outline so it still reads at 168 px wide (the phone feed), the bottom-right corner left for the
# duration badge. The hook text is the same in all four variants; only the picture differs — put up to three in YouTube
# Studio's "Test & compare". Pictures in src/ are frames of the film (render.mjs --stills), saved as JPEG.
# Fonts: Google's Noto Sans variable fonts (Black weight), looked up in motion/out/fonts/ and downloaded there if missing.
import os, sys, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
FONTS = os.path.join(ROOT, 'out', 'fonts'); os.makedirs(FONTS, exist_ok=True)
G = 'https://raw.githubusercontent.com/google/fonts/main/ofl/'
FONT_URL = {'NotoSansKR': 'notosanskr/NotoSansKR%5Bwght%5D.ttf', 'NotoSans': 'notosans/NotoSans%5Bwdth,wght%5D.ttf',
            'NotoSansJP': 'notosansjp/NotoSansJP%5Bwght%5D.ttf', 'NotoSansSC': 'notosanssc/NotoSansSC%5Bwght%5D.ttf',
            'NotoSansTC': 'notosanstc/NotoSansTC%5Bwght%5D.ttf', 'NotoSansArabic': 'notosansarabic/NotoSansArabic%5Bwdth,wght%5D.ttf'}
# top: the line(s) above the number · big: the number (+ unit when the language glues them) · tail: the word after it
LANGS = {
  'ko':      dict(font='NotoSansKR', top=['성경 전체를'], big='14분', tail='만에'),
  'en':      dict(font='NotoSans', top=['THE WHOLE', 'BIBLE IN'], big='14', tail='MIN'),
  'es':      dict(font='NotoSans', top=['TODA LA', 'BIBLIA EN'], big='14', tail='MIN'),
  'pt-BR':   dict(font='NotoSans', top=['A BÍBLIA', 'INTEIRA EM'], big='14', tail='MIN'),
  'fr':      dict(font='NotoSans', top=['TOUTE LA', 'BIBLE EN'], big='14', tail='MIN'),
  'de':      dict(font='NotoSans', top=['DIE GANZE', 'BIBEL IN'], big='14', tail='MIN'),
  'ru':      dict(font='NotoSans', top=['ВСЯ БИБЛИЯ ЗА'], big='14', tail='МИНУТ'),
  'id':      dict(font='NotoSans', top=['SELURUH', 'ALKITAB DALAM'], big='14', tail='MENIT'),
  'zh-Hans': dict(font='NotoSansSC', top=['整本圣经'], big='14分钟', tail='看完'),
  'zh-Hant': dict(font='NotoSansTC', top=['整本聖經'], big='14分鐘', tail='看完'),
  'ja':      dict(font='NotoSansJP', top=['聖書全体を'], big='14分', tail='で'),
  'ar':      dict(font='NotoSansArabic', top=['الكتاب المقدس كله في'], big='14', tail='دقيقة', rtl=True),   # the film's Arabic uses Western digits
}
GOLD = (255, 204, 80); WHITE = (255, 255, 255); INK = (12, 10, 8); W, H = 1280, 720
_fc = {}
def font(name, size, weight='Black'):
    p = os.path.join(FONTS, name + '.ttf')
    if not os.path.exists(p):
        print('fetching font', name); urllib.request.urlretrieve(G + FONT_URL[name], p)
    f = ImageFont.truetype(p, size)
    try: f.set_variation_by_name(weight)
    except Exception: pass
    return f
def src(name): return Image.open(os.path.join(HERE, 'src', name + '.jpg')).convert('RGB')
def cover(im, w, h, fx=.5, fy=.5, z=1):
    r = max(w / im.width, h / im.height) * z; im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x = round((im.width - w) * fx); y = round((im.height - h) * fy); return im.crop((x, y, x + w, y + h))
def T(base, xy, s, f, fill, stroke=10, shadow=18, anchor='la', rtl=False):
    """text with a thick dark outline and a soft shadow — readable over any picture"""
    kw = dict(direction='rtl', language='ar') if rtl else {}
    if shadow:
        L = Image.new('RGBA', base.size, (0, 0, 0, 0))
        ImageDraw.Draw(L).text(xy, s, font=f, fill=(0, 0, 0, 210), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0, 210), **kw)
        base.alpha_composite(L.filter(ImageFilter.GaussianBlur(shadow)), (6, 10))
    ImageDraw.Draw(base).text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=INK, **kw)
def hgrad(stops, color=(6, 6, 10)):
    g = Image.new('L', (W, 1)); px = g.load()
    for i in range(W):
        t = i / (W - 1); a = 0
        for k in range(len(stops) - 1):
            if stops[k][0] <= t <= stops[k + 1][0]:
                u = (t - stops[k][0]) / (stops[k + 1][0] - stops[k][0] + 1e-9); a = round(stops[k][1] + (stops[k + 1][1] - stops[k][1]) * u); break
        px[i, 0] = a
    L = Image.new('RGBA', (W, H), color + (255,)); L.putalpha(g.resize((W, H))); return L
def vignette(base, strength=110):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse((-W * .15, -H * .25, W * 1.15, H * 1.25), fill=255)
    m = ImageOps.invert(m).filter(ImageFilter.GaussianBlur(120))
    L = Image.new('RGBA', (W, H), (0, 0, 0, 255)); L.putalpha(m.point(lambda v: v * strength // 255)); base.alpha_composite(L)
def sat(im, s=1.25, c=1.1): return ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(s)).enhance(c)

def hook(im, lang, align, maxw):
    """the hook block: top line(s), then the number huge in gold with the tail word on the same baseline.
    align: 'l' (left column), 'r' (right column, for RTL), 'c' (centred)"""
    L = LANGS[lang]; rtl = L.get('rtl', False); F = lambda s: font(L['font'], s)
    tops = L['top']; y = 170 if len(tops) == 1 else 112
    xl, xr, xc = 52, W - 52, W // 2
    for line in tops:
        size = 88
        while size > 48 and F(size).getlength(line) > maxw: size -= 4
        f = F(size); st = max(6, size // 10)
        if align == 'l': T(im, (xl + 6, y), line, f, WHITE, stroke=st, anchor='la', rtl=rtl)
        elif align == 'r': T(im, (xr - 6, y), line, f, WHITE, stroke=st, anchor='ra', rtl=rtl)
        else: T(im, (xc, y), line, f, WHITE, stroke=st, anchor='ma', rtl=rtl)
        y += round(size * 1.16)
    fb, ft = F(236), F(112)
    wb, wt = fb.getlength(L['big']), (ft.getlength(L['tail']) if L['tail'] else 0); gap = 18 if wt else 0
    while wb + gap + wt > maxw * 1.12 and fb.size > 150:   # a long number line shrinks to the column
        fb, ft = F(fb.size - 8), F(ft.size - 4); wb, wt = fb.getlength(L['big']), ft.getlength(L['tail'])
    yb = y + 200 + 12
    x0 = {'l': xl, 'r': xr - (wb + gap + wt), 'c': xc - (wb + gap + wt) / 2}[align]
    if rtl:   # Arabic reads right to left: the number sits at the right end of the line, the unit to its left
        T(im, (x0 + wt + gap, yb), L['big'], fb, GOLD, stroke=13, shadow=24, anchor='ls')
        T(im, (x0, yb), L['tail'], ft, WHITE, stroke=10, anchor='ls', rtl=True)
    else:
        T(im, (x0, yb), L['big'], fb, GOLD, stroke=13, shadow=24, anchor='ls')
        if L['tail']: T(im, (x0 + wb + gap, yb), L['tail'], ft, WHITE, stroke=10, anchor='ls')

def side(bg, lang, grad_stops, vig):
    """a picture with the hook in the left column (right column, picture mirrored, for RTL)"""
    rtl = LANGS[lang].get('rtl', False)
    if rtl: bg = ImageOps.mirror(bg)
    im = Image.new('RGBA', (W, H)); im.paste(bg, (0, 0))
    g = hgrad(grad_stops); im.alpha_composite(ImageOps.mirror(g) if rtl else g)
    if vig: vignette(im, vig)
    hook(im, lang, 'r' if rtl else 'l', 640); return im

def make(lang, out):
    os.makedirs(out, exist_ok=True)
    # A · the Red Sea: one epic scene, colour and people
    bg = sat(cover(src('exodus'), W, H, .3, .3, 1.3))
    side(bg, lang, [(0, 235), (.3, 220), (.56, 0), (1, 0)], 90).convert('RGB').save(os.path.join(out, 'A-exodus.jpg'), quality=93)
    # B · the cross: a silhouette in sepia, emotional
    bg = cover(src('cross'), W, H, .62, .4, 1.1)
    bg = ImageOps.colorize(ImageOps.grayscale(bg), (18, 12, 8), (255, 232, 190), mid=(120, 86, 50))
    side(bg, lang, [(0, 230), (.3, 205), (.56, 0), (1, 0)], 110).convert('RGB').save(os.path.join(out, 'B-cross.jpg'), quality=93)
    # C · creation → the new creation: the whole arc in one split picture, hook centred
    e = src('earth').resize((W, H), Image.LANCZOS); left = Image.new('RGB', (W, H), (4, 4, 8)); left.paste(e, (-470, 0)); left = sat(left, 1.2, 1.05)
    right = ImageEnhance.Brightness(sat(cover(src('renewal'), W, H, .6, .45, 1.15), 1.3, 1.15)).enhance(1.05)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(700, 0), (W, 0), (W, H), (560, H)], fill=255); m = m.filter(ImageFilter.GaussianBlur(2))
    im = Image.new('RGBA', (W, H)); im.paste(Image.composite(right, left, m), (0, 0)); ImageDraw.Draw(im).line([(700, 0), (560, H)], fill=GOLD, width=8)
    hook(im, lang, 'c', 1000); im.convert('RGB').save(os.path.join(out, 'C-split.jpg'), quality=93)
    # D · the earth: clean, highest contrast, reads best when tiny
    e = sat(src('earth'), 1.25, 1.1).resize((round(1920 * .78), round(1080 * .78)), Image.LANCZOS)
    bg = Image.new('RGB', (W, H), (3, 3, 8)); bg.paste(e, (W - e.width + 40, (H - e.height) // 2))
    side(bg, lang, [(0, 200), (.25, 170), (.5, 0), (1, 0)], 0).convert('RGB').save(os.path.join(out, 'D-earth.jpg'), quality=93)

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    langs = args or list(LANGS)
    for lang in langs:
        make(lang, os.path.join(HERE, lang)); print('→', os.path.join(HERE, lang))
    if '--sheet' in sys.argv:
        cw, ch = 320, 180; sheet = Image.new('RGB', (4 * (cw + 10) + 90, len(langs) * (ch + 10) + 10), (28, 28, 30)); d = ImageDraw.Draw(sheet)
        for r, lang in enumerate(langs):
            d.text((8, 10 + r * (ch + 10) + 80), lang, font=font('NotoSans', 22, 'Bold'), fill=(255, 255, 255))
            for c, v in enumerate(['A-exodus', 'B-cross', 'C-split', 'D-earth']):
                sheet.paste(Image.open(os.path.join(HERE, lang, v + '.jpg')).resize((cw, ch), Image.LANCZOS), (90 + c * (cw + 10), 10 + r * (ch + 10)))
        p = os.path.join(ROOT, 'out', 'thumbs', 'all-langs.jpg'); os.makedirs(os.path.dirname(p), exist_ok=True); sheet.save(p, quality=88); print('→', p)
