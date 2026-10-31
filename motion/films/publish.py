"""Publish a short film (motion/films/<film>/) to the site so /film/<slug>/ plays it live in the browser, like the scenes in film/s/.
   py motion/films/publish.py silence400 silence      → film/silence/f/ (film.html + its scripts, script.json, fonts, film.m4a)

   - film.html is copied with its script paths flattened (../../pilot/lib.js → lib.js …) and the Google Fonts link (blocked by
     the site CSP) replaced by fonts.css: Noto Serif KR / Noto Sans KR subset to the characters this film uses (variable fonts,
     every weight in one file — motion/out/fonts/NotoSerifKR.ttf and NotoSansKR.ttf, the same files render.mjs draws with).
   - Sound: the narrated mix motion/out/<film>-narr.wav (node motion/films/sound.mjs <film>) → film.m4a (AAC 96 kb/s), and the
     music-only mix stays local for now.
   - The player page (film/<slug>/index.html) and the film list (film/films.json) are written by hand.
   Needs: ffmpeg, fonttools + brotli (py -m pip install fonttools brotli)."""
import os, re, sys, shutil, subprocess
from fontTools import subset

HERE = os.path.dirname(os.path.abspath(__file__)); MOTION = os.path.dirname(HERE); ROOT = os.path.dirname(MOTION)
film, slug = sys.argv[1], sys.argv[2]
SRC = os.path.join(HERE, film); OUT = os.path.join(ROOT, 'film', slug, 'f'); os.makedirs(OUT, exist_ok=True)
html = open(os.path.join(SRC, 'film.html'), encoding='utf-8').read()

# scripts: every <script src> next to the page, flattened into f/
texts = [html]
def take(m):
    rel = m.group(1); path = os.path.normpath(os.path.join(SRC, rel)); name = os.path.basename(path)
    shutil.copy(path, os.path.join(OUT, name)); texts.append(open(path, encoding='utf-8').read())
    return f'<script src="{name}"></script>'
html = re.sub(r'<script src="([^"]+)"></script>', take, html)
html = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/[^"]*">', '<link rel="stylesheet" href="fonts.css">', html)
html = re.sub(r'<link rel="preconnect"[^>]*fonts\.(googleapis|gstatic)[^>]*>\s*', '', html)
open(os.path.join(OUT, 'film.html'), 'w', encoding='utf-8', newline='').write(html)
for f in ['script.json'] + [f for f in os.listdir(SRC) if f.startswith('i18n')]:
    p = os.path.join(SRC, f)
    if os.path.isdir(p): shutil.copytree(p, os.path.join(OUT, f), dirs_exist_ok=True)
    elif os.path.exists(p): shutil.copy(p, os.path.join(OUT, f)); texts.append(open(p, encoding='utf-8').read())

# fonts: the characters of the page, its scripts and script.json (+ printable ASCII)
chars = set(''.join(texts)) | {chr(c) for c in range(32, 127)}
chars = ''.join(sorted(c for c in chars if c.isprintable()))
FONTS = os.path.join(MOTION, 'out', 'fonts'); css = []
for fam, src, out in [('Noto Serif KR', 'NotoSerifKR.ttf', 'NotoSerifKR.woff2'), ('Noto Sans KR', 'NotoSansKR.ttf', 'NotoSansKR.woff2')]:
    opt = subset.Options(); opt.flavor = 'woff2'; opt.layout_features = ['*']; opt.notdef_outline = True
    f = subset.load_font(os.path.join(FONTS, src), opt); s = subset.Subsetter(opt); s.populate(text=chars); s.subset(f)
    subset.save_font(f, os.path.join(OUT, out), opt)
    css.append(f"@font-face{{font-family:'{fam}';src:url('{out}') format('woff2');font-weight:100 900;font-display:block}}")
    print(out, os.path.getsize(os.path.join(OUT, out)) // 1024, 'KB')
open(os.path.join(OUT, 'fonts.css'), 'w', encoding='utf-8', newline='').write('\n'.join(css) + '\n')

# sound
for mix, name in [('narr', 'film.m4a')]:   # the music-only mix is not published until the page offers it
    wav = os.path.join(MOTION, 'out', f'{film}-{mix}.wav')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', os.path.join(OUT, name)], check=True)
    print(name, os.path.getsize(os.path.join(OUT, name)) // 1024, 'KB')
print('→', OUT)
