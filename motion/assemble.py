"""Join the rendered scenes into one film (each scene already opens from and closes to black).
   python3 motion/assemble.py h      → motion/out/film-h.mp4   (1920×1080)
   python3 motion/assemble.py v      → motion/out/film-v.mp4   (1080×1920)
   python3 motion/assemble.py h --lang en → motion/out/film-en-h.mp4 from motion/out/<scene>-en-h.mp4
     (render each scene first: node motion/render.mjs h --page pilot/<scene>.html --lang en)
   Add --upload to also write film-…-upload.mp4: the copy to upload to YouTube/Instagram (H.265, closed GOP, a keyframe
   every 2 s, no B-frames). Video sites re-encode each upload in chunks cut at keyframes; with open-GOP/B-frame files some
   renditions show a later frame for a moment at every scene start ("the start jumps"), on some phones only.

   Add --shorts (portrait) to write one file per scene instead of the film, for YouTube Shorts:
   out/shorts/<lang>/NN-<scene>.mp4 (the upload encode + that scene's sound, 30 ms fades against clicks). No film is made.

   Clips rendered straight to the upload format (render.mjs default, H.265) are joined as they are — no encode at all.
   Fast: nothing is re-encoded as a whole. Pictures are joined as they are (stream copy); the upload copy is encoded per
   scene once and cached in out/upcache/ (re-made only when that scene's clip is newer). So after fixing one scene,
   re-render that scene and run this again: it takes about as long as encoding that one scene. A scene whose clip was
   deleted (disk) is taken from its cached upload encode, so keep out/upcache/.
   Sound: each scene's motion/pilot/<scene>.wav, loudness-normalised to −16 LUFS and cut/padded to exactly its picture's
   length, so sound and picture stay in step scene by scene."""
import os, subprocess, sys

ORDER = ['opening', 'creation', 'fall', 'patriarch', 'exodus', 'wilderness', 'judges', 'kingdom', 'exile', 'return',
         'silence', 'advent', 'cross', 'rise', 'church', 'renewal', 'mirror', 'gospel', 'evidence', 'ship', 'invite']
FPS = 30
X265 = 'crf=20:bframes=0:open-gop=0:keyint=60:min-keyint=60:vbv-maxrate=3600:vbv-bufsize=7200:log-level=error'

HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[1:]
def opt(name, default=None): return argv[argv.index(name) + 1] if name in argv else default
lang = opt('--lang', 'ko')
only = opt('--only')   # testing: --only opening,creation
pos = [a for i, a in enumerate(argv) if not a.startswith('--') and (i == 0 or not argv[i - 1] in ('--lang', '--only'))]
ori = pos[0] if pos else 'h'
tag = '' if lang == 'ko' else f'-{lang}'
OUT = os.path.join(HERE, 'out'); TMP = os.path.join(OUT, 'assemble-tmp'); UPC = os.path.join(OUT, 'upcache')
os.makedirs(TMP, exist_ok=True); os.makedirs(UPC, exist_ok=True)

def run(args): subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + args, check=True)
def frames(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries',
                        'stream=nb_read_packets', '-of', 'csv=p=0', path], capture_output=True, text=True, check=True)
    return int(r.stdout.strip())
def concat_list(name, paths):
    p = os.path.join(TMP, name)
    with open(p, 'w') as f: f.writelines(f"file '{x}'\n" for x in paths)
    return p

scenes = only.split(',') if only else ORDER
have, missing = [], []
for s in scenes:
    v, a = os.path.join(OUT, f'{s}{tag}-{ori}.mp4'), os.path.join(HERE, 'pilot', f'{s}.wav')
    u = os.path.join(UPC, f'{s}{tag}-{ori}.mp4')
    if not os.path.exists(v) and os.path.exists(u): v = u   # clip deleted to save disk: its cached upload encode stands in
    (have if os.path.exists(v) and os.path.exists(a) else missing).append((s, v, a))
if missing: print('skipped (not rendered or no sound yet):', ', '.join(m[0] for m in missing))

# sound: per scene, normalised and cut/padded to the picture's exact length
auds = []
for s, v, a in have:
    d = frames(v) / FPS; out = os.path.join(TMP, f'aud-{s}.wav')
    run(['-i', a, '-af', f'aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad,atrim=0:{d:.6f}',
         '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', out])
    auds.append(out)
sound = os.path.join(TMP, 'sound.wav')
run(['-f', 'concat', '-safe', '0', '-i', concat_list('aud.txt', auds), '-c', 'copy', sound])

def mux(video_paths, dst):
    run(['-f', 'concat', '-safe', '0', '-i', concat_list('vid.txt', video_paths), '-i', sound, '-map', '0:v', '-map', '1:a',
         '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', dst])

def codec(path):
    return subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', path],
                          capture_output=True, text=True).stdout.strip()

def upload_encode(s, v):
    if codec(v) == 'hevc': return v   # render.mjs already wrote the upload format (its default): nothing to encode
    u = os.path.join(UPC, f'{s}{tag}-{ori}.mp4')
    if v != u and (not os.path.exists(u) or os.path.getmtime(u) < os.path.getmtime(v)):
        print('  upload encode:', s, flush=True)
        run(['-i', v, '-map', '0:v', '-c:v', 'libx265', '-preset', 'fast', '-x265-params', X265,
             '-pix_fmt', 'yuv420p', '-tag:v', 'hvc1', u])
    return u

if '--shorts' in argv:   # one file per scene (YouTube Shorts), no film
    SD = os.path.join(OUT, 'shorts', lang); os.makedirs(SD, exist_ok=True)
    for (s, v, _), aud in zip(have, auds):
        u = upload_encode(s, v); d = frames(v) / FPS; n = ORDER.index(s) + 1
        dst = os.path.join(SD, f'{n:02d}-{s}.mp4')
        run(['-i', u, '-i', aud, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
             '-af', f'afade=t=in:d=0.03,afade=t=out:st={d - 0.03:.3f}:d=0.03', '-c:a', 'aac', '-b:a', '192k',
             '-movflags', '+faststart', dst])
        print('→', dst, f'{d:.1f}s')
    sys.exit(0)

dst = os.path.join(OUT, f'film{tag}-{ori}.mp4')
if '--upload' in argv and all(codec(v) == 'hevc' for _, v, _ in have):   # clips are already the upload format: one file serves both
    up = dst[:-4] + '-upload.mp4'; mux([v for _, v, _ in have], up)
    print('→', up, '(upload copy; clips joined as rendered, no encode) ·', len(have), 'scenes'); sys.exit(0)
if any(os.path.dirname(v) == UPC for _, v, _ in have):   # can't mix codecs by stream copy: only the upload copy
    print('master skipped (some scene clips were deleted; their cached upload encodes are used)')
    if '--upload' not in argv: argv.append('--upload')
else:
    mux([v for _, v, _ in have], dst)
    print('→', dst, '·', len(have), 'scenes:', ' → '.join(h[0] for h in have))

if '--upload' in argv:
    ups = [upload_encode(s, v) for s, v, _ in have]
    up = dst[:-4] + '-upload.mp4'
    mux(ups, up)
    print('→', up, '(upload copy)')
