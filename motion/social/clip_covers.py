"""Instagram Reels covers for a film's loop clips (motion/films/clips.mjs → motion/out/<film>-clips.json), in the same frame as
the series covers (insta_reel_covers.py): the clip's own picture as a framed card on its blurred self, the brand on top, the
film's name in gold where the series puts its number, "짧게 n/N" under it, the clip's title (review.json clips[].title) below.
Text stays inside the centre 3:4 (y 240-1680) that the profile grid shows. Threads has no cover (it shows the first frame).
   python motion/social/clip_covers.py <film> "<film name>" [pick …]   → motion/out/insta/clips-<film>/cover-<id>.jpg + grid.jpg
   pick: <id>=<fraction or seconds> — the moment of the clip the picture is taken from (default .55)"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter
sys.argv, _argv = sys.argv[:1], sys.argv
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'insta_reel_covers.py'), encoding='utf-8').read().split('man = json.load')[0])   # font · glow · wrap · sizes
sys.argv = _argv
film, name = sys.argv[1], sys.argv[2]; picks = dict(a.split('=') for a in sys.argv[3:] if not a.startswith('crop='))
Y0 = int(next((a[5:] for a in sys.argv[3:] if a.startswith('crop=')), 420))   # card = y Y0..Y0+1080 of the clip (keep the subtitles out of it)
clips = json.load(open(os.path.join(M, 'out', f'{film}-clips.json'), encoding='utf-8'))
OUT = os.path.join(M, 'out', 'insta', f'clips-{film}'); os.makedirs(OUT, exist_ok=True)
brand, done = '한눈에 보는 성경 이야기', []
for i, k in enumerate(clips):
    src = os.path.join(M, '..', k['file']) if not os.path.isabs(k['file']) else k['file']
    src = os.path.normpath(os.path.join(os.path.dirname(M), k['file']))
    t = float(picks.get(k['id'], .55)); t = t * k['len'] if t < 1 else t; p = os.path.join(TMP, f'clip-{film}-{k["id"]}.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t}', '-i', src, '-frames:v', '1', p], check=True)
    fr = Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS)
    bg = Image.blend(fr.filter(ImageFilter.GaussianBlur(40)), Image.new('RGB', (W, H), (8, 8, 14)), .62)
    im = bg.convert('RGBA'); c = W // 2; cs, cy = 660, 700
    card = fr.crop((0, Y0, W, Y0 + 1080)).resize((cs, cs), Image.LANCZOS)
    sh = Image.new('RGBA', (cs + 80, cs + 80), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((40, 48, cs + 40, cs + 48), 22, fill=(0, 0, 0, 180))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)), (c - cs // 2 - 40, cy - 40))
    mk = Image.new('L', (cs, cs), 0); ImageDraw.Draw(mk).rounded_rectangle((0, 0, cs - 1, cs - 1), 22, fill=255)
    im.paste(card, (c - cs // 2, cy), mk); ImageDraw.Draw(im).rounded_rectangle((c - cs // 2, cy, c + cs // 2 - 1, cy + cs - 1), 22, outline=GOLD + (150,), width=2)
    glow(im, (c, 270), brand, font(SANS, 40), (232, 226, 214), r=10)
    glow(im, (c, 340), name, font(SERIF, 112), GOLD, r=22)                         # where the series puts its number
    glow(im, (c, 560), f'짧게 {i + 1}/{len(clips)}', font(SERIF_B, 60), WHITE)
    for size in (58, 52, 46):
        fh = font(SERIF_B, size); lines = wrap(k['title'], fh, 940)
        if len(lines) <= 3: break
    y = cy + cs + 60
    for ln in lines[:3]: glow(im, (c, y), ln, fh, WHITE, r=14); y += int(size * 1.36)
    out = os.path.join(OUT, f'cover-{k["id"]}.jpg'); im.convert('RGB').save(out, quality=90); done.append(out); print('→', out)
if done:
    tiles = [Image.open(f).crop((0, TOP, W, BOT)).resize((270, 360), Image.LANCZOS) for f in reversed(done)]
    g = Image.new('RGB', (3 * 270 + 4, ((len(tiles) + 2) // 3) * 362), (255, 255, 255))
    for i, t in enumerate(tiles): g.paste(t, ((i % 3) * 272, (i // 3) * 362))
    g.save(os.path.join(OUT, 'grid.jpg'), quality=88); print('→', os.path.join(OUT, 'grid.jpg'))
