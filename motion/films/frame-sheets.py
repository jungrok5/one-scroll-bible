# Frame sheets for the anomaly check: one frame every 0.5 s of a render, 12 to a sheet with the time on each, so an eye (an agent
# with pipeline/tasks/anomaly.md, or the maintainer) can look at the whole film for what the machine checks cannot see — hands
# like wood, a body that is a lump, a thing floating or cut off, words over a face, a wrong colour (관리자 2026-11-10: "프레임으로
# 보면 이상한데 … 만든 영상을 확인해서 이상유무 판단하는 스텝이 제작공정에 있어?" → "ㅇㅇ").
#   py motion/films/frame-sheets.py <film> [--ori v|h] [--video <mp4>] [--every 0.5] [--from S] [--to S]
#   → motion/out/frames/<film>[-h]/sheet-01.jpg … + manifest.json { render, video, every, sheets: [{file, from, to}] }
# Without --video it reads motion/out/<film>-<ori>-narr.mp4 (render = its .src.json hash, as shots-sheet.py). A pilot or a part
# render: --video (render = size + head hash of that file). Then the anomaly check writes review.json anomaly_check (see the gate).
import hashlib, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')
a = sys.argv[1:]
def opt(k, d=None):
    if k in a: i = a.index(k); v = a[i + 1]; del a[i:i + 2]; return v
    return d
ori, video, every = opt('--ori', 'v'), opt('--video'), float(opt('--every', '0.5'))
t_from, t_to = float(opt('--from', '0')), opt('--to')
film = a[0]
ROOT = os.getcwd(); OUT = os.path.join(ROOT, 'motion', 'out')
vid = video or os.path.join(OUT, f'{film}-{ori}-narr.mp4')
if not os.path.exists(vid): sys.exit(f'no render {vid}')
if not video and os.path.exists(vid + '.src.json'): render = json.load(open(vid + '.src.json', encoding='utf-8')).get('hash')
else:
    with open(vid, 'rb') as f: render = f'{os.path.getsize(vid)}-' + hashlib.sha1(f.read(1 << 20)).hexdigest()[:12]
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', vid], capture_output=True, text=True).stdout.strip())
end = min(dur, float(t_to)) if t_to else dur
dest = os.path.join(OUT, 'frames', film + ('-h' if ori == 'h' else '')); os.makedirs(dest, exist_ok=True)
for f in os.listdir(dest):
    if f.startswith('sheet-') or f.startswith('_f'): os.remove(os.path.join(dest, f))
# frames: one ffmpeg pass at 2 fps (every 0.5 s), small
tw = 270 if ori == 'v' else 400
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(t_from), '-to', str(end), '-i', vid, '-vf', f'fps={1 / every},scale={tw}:-2', os.path.join(dest, '_f%05d.png')], check=True)
frames = sorted(f for f in os.listdir(dest) if f.startswith('_f'))
font = None
for p in ['C:/Windows/Fonts/malgun.ttf', '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc']:
    if os.path.exists(p): font = ImageFont.truetype(p, 18); break
cols, rows = (6, 2) if ori == 'v' else (4, 3)
sheets = []
for s in range(0, len(frames), cols * rows):
    batch = frames[s:s + cols * rows]
    with Image.open(os.path.join(dest, batch[0])) as im0: fw, fh = im0.size
    sheet = Image.new('RGB', (cols * (fw + 6) + 6, rows * (fh + 30) + 6), (24, 22, 22)); d = ImageDraw.Draw(sheet)
    for k, f in enumerate(batch):
        t = t_from + (s + k) * every; x, y = 6 + (k % cols) * (fw + 6), 6 + (k // cols) * (fh + 30)
        with Image.open(os.path.join(dest, f)) as im: sheet.paste(im, (x, y + 24))
        d.text((x + 2, y + 2), f'{int(t // 60)}:{t % 60:05.2f}', fill=(240, 220, 160), font=font)
    name = f'sheet-{len(sheets) + 1:02d}.jpg'; sheet.save(os.path.join(dest, name), quality=86)
    sheets.append({'file': name, 'from': round(t_from + s * every, 2), 'to': round(t_from + (s + len(batch) - 1) * every, 2)})
for f in frames: os.remove(os.path.join(dest, f))
json.dump({'render': render, 'video': os.path.relpath(vid, ROOT).replace('\\', '/'), 'ori': ori, 'every': every, 'sheets': sheets}, open(os.path.join(dest, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{dest} — 시트 {len(sheets)}장 ({len(frames)}프레임, {every}초마다) · render {render}')
print('다음: pipeline/tasks/anomaly.md 지시문으로 시트를 보고 review.json anomaly_check 를 적는다')
