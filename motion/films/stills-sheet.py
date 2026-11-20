# Stills sheet of a pilot render: chosen moments, each labelled with its film time, the pilot's own time (u) and its mean luma (Y),
# 7 to a row — the "kingdom-<part>-stills-rN.jpg" sheets shown to the maintainer next to each pilot (before 2026-11-20 they were
# made by hand each round; tool-everything rule).
#   py motion/films/stills-sheet.py --video motion/out/sample-part2-v.mp4 --t0 110 --at 1,4.5,9,... --out motion/out/review/kingdom-part2-stills-r6.jpg
#   --at   pilot seconds (u), comma-separated; or --every 4 for an even spread       --t0  film second of u = 0 (header only)
#   --width 260 (each frame)
import os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont, ImageStat

sys.stdout.reconfigure(encoding='utf-8')
a = sys.argv[1:]
def opt(k, d=None):
    if k in a: i = a.index(k); v = a[i + 1]; del a[i:i + 2]; return v
    return d
vid, out, t0, every, fw = opt('--video'), opt('--out'), float(opt('--t0', '0')), opt('--every'), int(opt('--width', '260'))
if not vid or not out: sys.exit('usage: stills-sheet.py --video <mp4> --out <jpg> [--t0 S] (--at u1,u2,… | --every S)')
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', vid], capture_output=True, text=True).stdout.strip())
at = opt('--at')
us = [float(x) for x in at.split(',')] if at else [round(i * float(every or 4) + .5, 2) for i in range(int((dur - .5) // float(every or 4)) + 1)]
us = [min(u, dur - .05) for u in us]
font = None
for p in ['C:/Windows/Fonts/malgun.ttf', '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc']:
    if os.path.exists(p): font = ImageFont.truetype(p, 17); break
tmp = tempfile.mkdtemp()
ims = []
for k, u in enumerate(us):
    f = os.path.join(tmp, f'{k:03d}.png')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{u:.3f}', '-i', vid, '-frames:v', '1', '-vf', f'scale={fw}:-2', f], check=True)
    im = Image.open(f).convert('RGB'); ims.append((u, im, ImageStat.Stat(im.convert('L')).mean[0]))
cols = 7; fh = ims[0][1].size[1]; rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * fw, rows * (fh + 26)), (30, 30, 30)); d = ImageDraw.Draw(sheet)
for k, (u, im, y) in enumerate(ims):
    x, yy = (k % cols) * fw, (k // cols) * (fh + 26)
    sheet.paste(im, (x, yy + 26))
    d.text((x + 6, yy + 3), f'{t0 + u:.2f}  (u {u:g})  Y{y:.0f}', fill=(240, 220, 160), font=font)
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
sheet.save(out, quality=86)
print(f'{out} — {len(ims)} stills, mean Y {sum(y for _, _, y in ims) / len(ims):.0f}')
