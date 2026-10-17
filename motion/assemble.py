"""Join the rendered scenes into one film (each scene already opens from and closes to black).
   python3 motion/assemble.py h      → motion/out/film-h.mp4   (1920×1080)
   python3 motion/assemble.py v      → motion/out/film-v.mp4   (1080×1920)
   Uses motion/out/<scene>-<h|v>.mp4 for picture and the current motion/pilot/<scene>.wav for sound,
   loudness-normalised to −16 LUFS. Missing scenes are skipped and listed."""
import os, subprocess, sys

ORDER = ['opening', 'creation', 'fall', 'patriarch', 'exodus', 'wilderness', 'judges', 'kingdom', 'exile', 'return',
         'silence', 'advent', 'cross', 'rise', 'church', 'renewal', 'mirror', 'gospel', 'evidence', 'ship', 'invite']

HERE = os.path.dirname(os.path.abspath(__file__))
ori = sys.argv[1] if len(sys.argv) > 1 else 'h'
OUT = os.path.join(HERE, 'out')
have, missing = [], []
for s in ORDER:
    v, a = os.path.join(OUT, f'{s}-{ori}.mp4'), os.path.join(HERE, 'pilot', f'{s}.wav')
    (have if os.path.exists(v) and os.path.exists(a) else missing).append((s, v, a))
if missing: print('skipped (not rendered or no sound yet):', ', '.join(m[0] for m in missing))
args = ['ffmpeg', '-y', '-loglevel', 'error']
for _, v, a in have: args += ['-i', v, '-i', a]
parts = ''.join(f'[{2 * i}:v:0]setsar=1,fps=30[v{i}];[{2 * i + 1}:a:0]aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a{i}];' for i in range(len(have)))
streams = ''.join(f'[v{i}][a{i}]' for i in range(len(have)))
fc = parts + f'{streams}concat=n={len(have)}:v=1:a=1[v][a]'
dst = os.path.join(OUT, f'film-{ori}.mp4')
args += ['-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p',
         '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', dst]
subprocess.run(args, check=True)
print('→', dst, '·', len(have), 'scenes:', ' → '.join(h[0] for h in have))
