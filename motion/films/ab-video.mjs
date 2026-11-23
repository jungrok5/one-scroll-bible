// Two renders of the same block side by side, labelled A and B, so the maintainer can compare the same moment (관리자 2026-11-24 「kingdom」 "내가 비교할 수 있게 줘봐").
//   node motion/films/ab-video.mjs <a.mp4> <b.mp4> <out.mp4> [--h 960]
import { execFileSync } from 'node:child_process';
const a = process.argv.slice(2), hi = a.indexOf('--h'), H = hi > -1 ? +a.splice(hi, 2)[1] : 960, [A, B, OUT] = a;
if (!A || !B || !OUT) { console.error('usage: ab-video.mjs <a.mp4> <b.mp4> <out.mp4> [--h 960]'); process.exit(1); }
const W = Math.round(H * 9 / 16 / 2) * 2, box = (x, c) => `drawbox=x=${x}:y=12:w=56:h=56:color=black@0.55:t=fill,drawtext=text='${c}':x=${x}+17:y=22:fontsize=38:fontcolor=white`;
const f = `[0:v]scale=${W}:${H},setsar=1,${box(14, 'A')}[a];[1:v]scale=${W}:${H},setsar=1,${box(14, 'B')}[b];[a][b]hstack=inputs=2:shortest=1,format=yuv420p[v]`;
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', A, '-i', B, '-filter_complex', f, '-map', '[v]', '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
console.log(OUT);
