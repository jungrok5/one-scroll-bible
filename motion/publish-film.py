"""Publish the scene pages to the site so /film/ can play them live in the browser.
   python3 motion/publish-film.py      → film/s/ (scene pages, lib, fonts subset to the glyphs used, per-scene audio)

   - Scene HTML is copied as is, except the Google Fonts link (blocked by the site CSP and not needed) is
     replaced by fonts.css, which serves Noto Serif KR / Noto Sans KR subset to the characters the scenes use.
   - Audio: the mixed pilot/<scene>.wav → <scene>.m4a (AAC 96 kb/s), loudness-normalised to −16 LUFS like the film.
   Needs: ffmpeg, fonttools + brotli (pip install fonttools brotli), the Noto fonts in ~/.local/share/fonts (or $FONT_DIR) —
   `bash motion/ci-setup.sh` puts every one there (that is how the film-language workflow runs this on GitHub)."""
import os, re, glob, json, shutil, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
PILOT = os.path.join(HERE, 'pilot')
OUT = os.path.join(os.path.dirname(HERE), 'film', 's')
FONTS = os.environ.get('FONT_DIR') or os.path.expanduser('~/.local/share/fonts')
ORDER = ['opening', 'creation', 'fall', 'patriarch', 'exodus', 'wilderness', 'judges', 'kingdom', 'exile', 'return',
         'silence', 'advent', 'cross', 'rise', 'church', 'renewal', 'mirror', 'gospel', 'evidence', 'ship', 'invite']
# family, weight, source file (first one found: the maintainer's static TTFs, or the noto-cjk OTFs ci-setup.sh downloads)
FACES = [('Noto Serif KR', 400, ('Noto-400.ttf', 'NotoSerifKR-Regular.otf')), ('Noto Serif KR', 600, ('Noto-600.ttf', 'NotoSerifKR-SemiBold.otf')),
         ('Noto Serif KR', 900, ('Noto-900.ttf', 'NotoSerifKR-Black.otf')), ('Noto Sans KR', 300, ('Noto-300.ttf', 'NotoSansKR-Light.otf')),
         ('Noto Sans KR', 400, ('NotoSansKR-400.ttf', 'NotoSansKR-Regular.otf')), ('Noto Sans KR', 700, ('Noto-700.ttf', 'NotoSansKR-Bold.otf'))]
def first_file(names):
    for n in names:
        if os.path.exists(os.path.join(FONTS, n)): return os.path.join(FONTS, n)
    raise SystemExit(f'font missing in {FONTS}: one of {names} (run: bash motion/ci-setup.sh)')
def family_file(fam):
    """a language's own face ('Noto Serif Thai'…): NotoSerifThai.ttf, or the variable file ci-setup.sh names NotoSerifThaiwdthwght.ttf"""
    b = fam.replace(' ', '')
    for n in (b + '.ttf', b + 'wght.ttf', b + 'wdthwght.ttf'):
        if os.path.exists(os.path.join(FONTS, n)): return os.path.join(FONTS, n)
    return None
GF = re.compile(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/[^"]*">')

os.makedirs(OUT, exist_ok=True)
# Published languages = the keys of FILM_CTA in index.html (the film button on that language's page) — one list for the
# button and the files. A translation that has not passed native review stays out of film/s/ until it is added there.
_cta = re.search(r'const FILM_CTA=(\{[^;]*\});', open(os.path.join(os.path.dirname(HERE), 'index.html'), encoding='utf-8').read())
LIVE = set(re.findall(r"(?:^|[{,])'?([\w-]+)'?:", _cta.group(1))) if _cta else set()
PACKS = [p for p in glob.glob(os.path.join(PILOT, 'i18n', '*.json')) if os.path.basename(p)[:-5] in LIVE]
skipped = sorted(os.path.basename(p)[:-5] for p in glob.glob(os.path.join(PILOT, 'i18n', '*.json')) if p not in PACKS)
if skipped: print('not published (no FILM_CTA entry yet):', ' '.join(skipped))
srcs = [os.path.join(PILOT, s + '.html') for s in ORDER] + glob.glob(os.path.join(PILOT, '*.js')) + [p for p in PACKS if '"_fonts"' not in open(p, encoding='utf-8').read()]   # translations drawn in the Noto KR faces (Latin); scripts with their own _fonts don't need them
text = ''.join(open(p, encoding='utf-8').read() for p in srcs)
chars = set(text) | {chr(c) for c in range(0x20, 0x7f)} | set('·—–…“”‘’「」『』()·•→←↑↓')
open(os.path.join(OUT, '.chars.txt'), 'w', encoding='utf-8').write(''.join(sorted(c for c in chars if c >= ' ')))

css = []
for fam, w, f in FACES:
    name = f"{fam.replace(' ', '')}-{w}.woff2"
    subprocess.run(['pyftsubset', first_file(f),f'--text-file={os.path.join(OUT, ".chars.txt")}', '--flavor=woff2',
                    '--layout-features=*', f'--output-file={os.path.join(OUT, name)}'], check=True)
    css.append(f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:normal;font-display:block;src:url({name}) format('woff2')}}")
# Languages that name their own faces in _fonts (Latin: Noto Serif/Sans — the Korean faces draw "…" as a centred "⋯";
# Chinese, Japanese, Arabic …): publish each named Noto face we have locally, subset to the glyphs those languages use,
# so the live film looks like the renders instead of falling back to whatever the viewer's device has.
KR = {'Noto Serif KR', 'Noto Sans KR'}   # served per weight above
need = {}   # family → glyphs
for p in PACKS:
    j = json.load(open(p, encoding='utf-8')); f = j.get('_fonts')
    if not f: continue
    txt = json.dumps(j, ensure_ascii=False)
    for fam in re.findall(r"'([^']+)'", (f.get('serif') or '') + ',' + (f.get('sans') or '')):
        if fam in KR: continue
        if family_file(fam): need.setdefault(fam, set()).update(txt)
        else: print(f'warning: no font file for {fam!r} in {FONTS} — the live film falls back to the viewer\'s fonts')
for fam, gl in sorted(need.items()):
    gl |= {chr(c) for c in range(0x20, 0x7f)} | set('…—–“”‘’«»·•')
    tf = os.path.join(OUT, '.sub.txt'); open(tf, 'w', encoding='utf-8').write(''.join(sorted(c for c in gl if c >= ' ')))
    name = fam.replace(' ', '') + '.woff2'
    subprocess.run(['pyftsubset', family_file(fam), f'--text-file={tf}', '--flavor=woff2', '--layout-features=*',
                    f'--output-file={os.path.join(OUT, name)}'], check=True)
    os.remove(tf)
    css.append(f"@font-face{{font-family:'{fam}';font-weight:100 900;font-style:normal;font-display:block;src:url({name}) format('woff2')}}")
open(os.path.join(OUT, 'fonts.css'), 'w').write('\n'.join(css) + '\n')
os.remove(os.path.join(OUT, '.chars.txt'))

for s in ORDER:
    h = open(os.path.join(PILOT, s + '.html'), encoding='utf-8').read()
    h, n = GF.subn('<link rel="stylesheet" href="fonts.css">', h)
    if not n: h = h.replace('</head>', '<link rel="stylesheet" href="fonts.css">\n</head>', 1)
    open(os.path.join(OUT, s + '.html'), 'w', encoding='utf-8').write(h)
    wav = os.path.join(PILOT, s + '.wav')
    m4a = os.path.join(OUT, s + '.m4a')
    if os.path.exists(m4a) and os.path.exists(wav) and os.path.getmtime(m4a) >= os.path.getmtime(wav): pass   # sound unchanged
    elif os.path.exists(wav):
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000',
                        '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', os.path.join(OUT, s + '.m4a')], check=True)
    else: print('no sound yet:', s)
for p in glob.glob(os.path.join(PILOT, '*.js')): shutil.copy(p, OUT)
os.makedirs(os.path.join(OUT, 'i18n'), exist_ok=True)   # language files (scene text + player page text); Korean needs none
for p in PACKS: shutil.copy(p, os.path.join(OUT, 'i18n'))
for p in glob.glob(os.path.join(OUT, 'i18n', '*.json')):   # a language taken off FILM_CTA leaves the site too
    if os.path.basename(p)[:-5] not in LIVE: os.remove(p); print('removed from the site:', os.path.basename(p))
tot = sum(os.path.getsize(p) for p in glob.glob(os.path.join(OUT, '*')))
print(f'→ film/s/ · {len(ORDER)} scenes · {tot / 1e6:.1f} MB')
