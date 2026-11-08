# The shot-list sheet: for every spoken or on-screen line, the frame the viewer sees during it, next to the line's `screen`
# sentence (what script.json says should be seen) — so "the picture and the words go separate ways" (관리자 2026-11-07) is
# caught before the maintainer watches. The picture gate reads the manifest (render fingerprint) and review.json shots_check.
#   py motion/films/shots-sheet.py <film> [--ori v|h]
#   → motion/out/shots/<film>[-h]/sheet-01.jpg … + manifest.json { render, lines: [{id, t, screen}] }
# Then look at every sheet and write review.json shots_check = { render: <manifest render>, at, misses: [{id, what}] }
# (misses = lines whose frame is not their screen sentence). The gate passes when misses is empty for the current render.
import json, os, subprocess, sys, textwrap
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')
args = [a for a in sys.argv[1:]]
ori = 'v'
if '--ori' in args:
    i = args.index('--ori'); ori = args[i + 1]; del args[i:i + 2]
film = args[0]
ROOT = os.getcwd(); D = os.path.join(ROOT, 'motion', 'films', film); OUT = os.path.join(ROOT, 'motion', 'out')
vid = os.path.join(OUT, f'{film}-{ori}-narr.mp4')
if not os.path.exists(vid): sys.exit(f'no render {vid}')
stamp = {}
if os.path.exists(vid + '.src.json'): stamp = json.load(open(vid + '.src.json', encoding='utf-8'))
s = json.load(open(os.path.join(D, 'script.json'), encoding='utf-8')); lines = s['lines'] if isinstance(s, dict) else s
place = {}
pf = os.path.join(D, 'sound', 'place.json')
if os.path.exists(pf): place = json.load(open(pf, encoding='utf-8')).get('at', {})
L = sorted([l for l in lines if l.get('at') is not None and l.get('kind') in ('narr', 'quote', 'label', 'title')], key=lambda l: place.get(l['id'], l['at']))
dest = os.path.join(OUT, 'shots', film + ('-h' if ori == 'h' else '')); os.makedirs(dest, exist_ok=True)
font = os.path.join(OUT, 'fonts', 'NotoSansKR.ttf')
F1 = ImageFont.truetype(font, 22); F2 = ImageFont.truetype(font, 18)
TW, TH = (300, 533) if ori == 'v' else (480, 270)
items = []
for i, l in enumerate(L):
    a = place.get(l['id'], l['at']); nxt = place.get(L[i + 1]['id'], L[i + 1]['at']) if i + 1 < len(L) else a + 4
    t = round(a + min(2.0, max(0.3, (nxt - a) * .5)), 2)
    jpg = os.path.join(dest, f"{l['id']}.jpg")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(t), '-i', vid, '-frames:v', '1', '-vf', f'scale={TW}:{TH}', jpg], check=True)
    items.append({'id': l['id'], 't': t, 'kind': l['kind'], 'screen': l.get('screen') or '(screen 없음)', 'text': (l.get('text') or '').replace(' / ', ' ')})
COLS, ROWS, CAP = 4, 2 if ori == 'v' else 3, 210
pages = [items[i:i + COLS * ROWS] for i in range(0, len(items), COLS * ROWS)]
for p, page in enumerate(pages):
    sheet = Image.new('RGB', (COLS * (TW + 16) + 16, ROWS * (TH + CAP + 16) + 16), (18, 16, 14)); d = ImageDraw.Draw(sheet)
    for k, it in enumerate(page):
        x = 16 + (k % COLS) * (TW + 16); y = 16 + (k // COLS) * (TH + CAP + 16)
        sheet.paste(Image.open(os.path.join(dest, it['id'] + '.jpg')), (x, y))
        d.text((x, y + TH + 6), f"{it['id']} · {it['t']}s · {it['kind']}", font=F1, fill=(233, 199, 122))
        yy = y + TH + 36
        for ln in textwrap.wrap('보일 것: ' + it['screen'], 19)[:5]: d.text((x, yy), ln, font=F2, fill=(235, 230, 220)); yy += 24
        for ln in textwrap.wrap('글자: ' + it['text'], 19)[:2]: d.text((x, yy), ln, font=F2, fill=(150, 145, 135)); yy += 24
    sheet.save(os.path.join(dest, f'sheet-{p + 1:02d}.jpg'), quality=86)
json.dump({'film': film, 'ori': ori, 'render': stamp.get('hash'), 'lines': items, 'sheets': len(pages)}, open(os.path.join(dest, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{len(items)}줄 · 시트 {len(pages)}장 → {dest}  (render {stamp.get("hash")})')
missing = [it['id'] for it in items if it['screen'] == '(screen 없음)']
if missing: print('screen 없는 줄: ' + ' '.join(missing))
