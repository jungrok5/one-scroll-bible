"""Publish the scene pages to the site so /film/ can play them live in the browser.
   python3 motion/publish-film.py      → film/s/ (scene pages, lib, fonts subset to the glyphs used, per-scene audio)

   - Scene HTML is copied as is, except the Google Fonts link (blocked by the site CSP and not needed) is
     replaced by fonts.css, which serves Noto Serif KR / Noto Sans KR subset to the characters the scenes use.
   - Audio: the mixed pilot/<scene>.wav → <scene>.m4a (AAC 96 kb/s), loudness-normalised to −16 LUFS like the film.
   Needs: ffmpeg, fonttools + brotli (pip install fonttools brotli), the Noto TTFs in ~/.local/share/fonts."""
import os, re, glob, shutil, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
PILOT = os.path.join(HERE, 'pilot')
OUT = os.path.join(os.path.dirname(HERE), 'film', 's')
FONTS = os.path.expanduser('~/.local/share/fonts')
ORDER = ['opening', 'creation', 'fall', 'patriarch', 'exodus', 'wilderness', 'judges', 'kingdom', 'exile', 'return',
         'silence', 'advent', 'cross', 'rise', 'church', 'renewal', 'mirror', 'gospel', 'evidence', 'ship', 'invite']
# family, weight, source file
FACES = [('Noto Serif KR', 400, 'Noto-400.ttf'), ('Noto Serif KR', 600, 'Noto-600.ttf'), ('Noto Serif KR', 900, 'Noto-900.ttf'),
         ('Noto Sans KR', 300, 'Noto-300.ttf'), ('Noto Sans KR', 400, 'NotoSansKR-400.ttf'), ('Noto Sans KR', 700, 'Noto-700.ttf')]
GF = re.compile(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/[^"]*">')

os.makedirs(OUT, exist_ok=True)
srcs = [os.path.join(PILOT, s + '.html') for s in ORDER] + glob.glob(os.path.join(PILOT, '*.js'))
text = ''.join(open(p, encoding='utf-8').read() for p in srcs)
chars = set(text) | {chr(c) for c in range(0x20, 0x7f)} | set('·—–…“”‘’「」『』()·•→←↑↓')
open(os.path.join(OUT, '.chars.txt'), 'w', encoding='utf-8').write(''.join(sorted(c for c in chars if c >= ' ')))

css = []
for fam, w, f in FACES:
    name = f"{fam.replace(' ', '')}-{w}.woff2"
    subprocess.run(['pyftsubset', os.path.join(FONTS, f), f'--text-file={os.path.join(OUT, ".chars.txt")}', '--flavor=woff2',
                    '--layout-features=*', f'--output-file={os.path.join(OUT, name)}'], check=True)
    css.append(f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:normal;font-display:block;src:url({name}) format('woff2')}}")
open(os.path.join(OUT, 'fonts.css'), 'w').write('\n'.join(css) + '\n')
os.remove(os.path.join(OUT, '.chars.txt'))

for s in ORDER:
    h = open(os.path.join(PILOT, s + '.html'), encoding='utf-8').read()
    h, n = GF.subn('<link rel="stylesheet" href="fonts.css">', h)
    if not n: h = h.replace('</head>', '<link rel="stylesheet" href="fonts.css">\n</head>', 1)
    open(os.path.join(OUT, s + '.html'), 'w', encoding='utf-8').write(h)
    wav = os.path.join(PILOT, s + '.wav')
    if os.path.exists(wav):
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000',
                        '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', os.path.join(OUT, s + '.m4a')], check=True)
    else: print('no sound yet:', s)
for p in glob.glob(os.path.join(PILOT, '*.js')): shutil.copy(p, OUT)
tot = sum(os.path.getsize(p) for p in glob.glob(os.path.join(OUT, '*')))
print(f'→ film/s/ · {len(ORDER)} scenes · {tot / 1e6:.1f} MB')
