"""Instagram Reels covers, one per Short (21 scenes): the scene's own picture, full bleed, with the series number,
the chapter name and the Short's hook line. Text stays inside the centre 3:4 (y 240-1680) that the profile grid shows.
   python motion/social/insta_reel_covers.py [lang=ko] [n …]   → motion/out/insta/reels-<lang>/cover-NN-<scene>.jpg
                                                                + grid.jpg (how the 21 look on the profile, 3:4 crops)
Reads the hook and chapter from motion/youtube/manifest.json (title "hook — chapter n/21") and the picture from the
release Short (motion/out/release/shorts-<lang>-NN-<scene>.mp4) at the moment insta_covers.py picks for that scene."""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

M = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]; lang = args[0] if args and not args[0].isdigit() else 'ko'; only = {int(a) for a in args if a.isdigit()}
OUT = os.path.join(M, 'out', 'insta', f'reels-{lang}'); TMP = os.path.join(M, 'out', 'social-tmp'); os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)

def font(names, size):
    for n in names:
        for d in ('C:/Windows/Fonts', os.path.expanduser('~/.local/share/fonts'), '/root/.local/share/fonts', '/usr/share/fonts/truetype/nanum'):
            p = os.path.join(d, n)
            if os.path.exists(p): return ImageFont.truetype(p, size)
    sys.exit(f'font not found: {names}')
SERIF = ['Noto-900.ttf', 'NanumMyeongjoExtraBold.ttf']; SERIF_B = ['Noto-700.ttf', 'NanumMyeongjoBold.ttf']
SANS = ['Noto-700.ttf', 'NanumGothicBold.ttf']
GOLD = (244, 199, 110); WHITE = (250, 246, 236)
W, H, TOP, BOT = 1080, 1920, 240, 1680

# moment (s into the scene, or a fraction of it) — same picks as insta_covers.py
PICK = {'opening': 25.2, 'creation': 28.0, 'fall': 3.4, 'patriarch': .3, 'exodus': 30, 'wilderness': .55, 'judges': .3,
        'kingdom': 14, 'exile': 22, 'return': .55, 'silence': .3, 'advent': 15, 'cross': 3.9, 'rise': 10.8, 'church': 7.0,
        'renewal': .55, 'mirror': .55, 'gospel': .8, 'evidence': 24.0, 'ship': 17.2, 'invite': 5.7}
BOOST = {'invite': 1.5, 'gospel': 1.4, 'silence': 1.15, 'church': 1.25}

def probe_dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
def frame(src, scene):
    t = PICK.get(scene, .5); t = t * probe_dur(src) if t < 1 else t; p = os.path.join(TMP, f'reel-{lang}-{scene}.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t}', '-i', src, '-frames:v', '1', p], check=True)
    im = Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS)
    return ImageEnhance.Brightness(im).enhance(BOOST.get(scene, 1))

def glow(im, xy, s, f, fill, r=16, a=235):
    L = Image.new('RGBA', im.size, (0, 0, 0, 0)); ImageDraw.Draw(L).text(xy, s, font=f, fill=(0, 0, 0, a), anchor='ma')
    L = L.filter(ImageFilter.GaussianBlur(r)); im.alpha_composite(L); im.alpha_composite(L)
    ImageDraw.Draw(im).text(xy, s, font=f, fill=fill, anchor='ma')

def wrap(text, f, width):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if f.getlength(t) <= width or not cur: cur = t
        else: lines.append(cur); cur = w
    return lines + [cur]

def split_title(title):   # "hook — chapter n/21" | "hook n/21"
    m = re.match(r'^(.*?)\s+(\d+)/(\d+)$', title.strip()); body, n, tot = m.group(1), int(m.group(2)), int(m.group(3))
    hook, _, chap = body.rpartition(' — ')
    return (hook, chap, n, tot) if hook else (body, '', n, tot)

man = json.load(open(os.path.join(M, 'youtube', 'manifest.json'), encoding='utf-8'))['languages'][lang]
brand = man.get('brand') or '한눈에 보는 성경 이야기'
if isinstance(brand, dict): brand = brand.get('name') or brand.get('title') or '한눈에 보는 성경 이야기'
done = []
for s in man['shorts']:
    if only and s['n'] not in only: continue
    src = os.path.join(M, 'out', 'release', s['file'])
    if not os.path.exists(src): print('skip (no file):', src); continue
    hook, chap, n, tot = split_title(s['title'])
    fr = frame(src, s['scene'])
    # background: the same picture blurred and darkened; foreground: its middle as a framed square card
    # (the scene's own small labels sit near its edges, so a full-bleed picture fought with the cover text)
    bg = Image.blend(fr.filter(ImageFilter.GaussianBlur(40)), Image.new('RGB', (W, H), (8, 8, 14)), .62)
    im = bg.convert('RGBA'); c = W // 2; cs, cy = 660, 700
    card = fr.crop((0, 420, W, 1500)).resize((cs, cs), Image.LANCZOS)
    sh = Image.new('RGBA', (cs + 80, cs + 80), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((40, 48, cs + 40, cs + 48), 22, fill=(0, 0, 0, 180))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)), (c - cs // 2 - 40, cy - 40))
    mk = Image.new('L', (cs, cs), 0); ImageDraw.Draw(mk).rounded_rectangle((0, 0, cs - 1, cs - 1), 22, fill=255)
    im.paste(card, (c - cs // 2, cy), mk); ImageDraw.Draw(im).rounded_rectangle((c - cs // 2, cy, c + cs // 2 - 1, cy + cs - 1), 22, outline=GOLD + (150,), width=2)
    glow(im, (c, 270), brand, font(SANS, 40), (232, 226, 214), r=10)
    num, rest = f'{n}', f'/{tot}'; fn, fr2 = font(SERIF, 180), font(SERIF, 84)
    wn, wr = fn.getlength(num), fr2.getlength(rest); x0 = c - (wn + wr) / 2; ny = 318
    L = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    d.text((x0, ny), num, font=fn, fill=(60, 30, 0, 210)); d.text((x0 + wn + 6, ny + 84), rest, font=fr2, fill=(60, 30, 0, 210))
    L = L.filter(ImageFilter.GaussianBlur(22)); im.alpha_composite(L)
    d = ImageDraw.Draw(im); d.text((x0, ny), num, font=fn, fill=GOLD); d.text((x0 + wn + 6, ny + 84), rest, font=fr2, fill=GOLD)
    if chap: glow(im, (c, 560), chap, font(SERIF_B, 64), WHITE)
    for size in (58, 52, 46):   # the hook under the card, at most 3 lines
        fh = font(SERIF_B, size); lines = wrap(hook, fh, 940)
        if len(lines) <= 3: break
    y = cy + cs + 60
    for ln in lines[:3]: glow(im, (c, y), ln, fh, WHITE, r=14); y += int(size * 1.36)
    out = os.path.join(OUT, f'cover-{n:02d}-{s["scene"]}.jpg'); im.convert('RGB').save(out, quality=90); done.append(out)
    print('→', out)

if not only and done:   # the profile grid: newest first, 3 across, centre 3:4 crops
    tiles = [Image.open(f).crop((0, TOP, W, BOT)).resize((270, 360), Image.LANCZOS) for f in reversed(done)]
    g = Image.new('RGB', (3 * 270 + 4, ((len(tiles) + 2) // 3) * 362), (255, 255, 255))
    for i, t in enumerate(tiles): g.paste(t, ((i % 3) * 272, (i // 3) * 362))
    g.save(os.path.join(OUT, 'grid.jpg'), quality=88); print('→', os.path.join(OUT, 'grid.jpg'))
