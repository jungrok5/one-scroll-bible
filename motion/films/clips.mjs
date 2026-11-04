// Loop Shorts cut from a finished film (insight shorts-loop, 2026-11-04: the Shorts feed kept pushing only the Shorts people
// watched more than once — avg view 110 % and 228 %; the 50–60 % ones stopped). Each clip is a span of the narrated portrait
// render, cut on line boundaries, whose last moment dissolves into its own first frame and whose sound fades into its first word,
// so the end reads as the start again. Clips are declared in the film's review.json:
//   "clips": [{ "id": "a", "from": 0, "to": 20.8, "title": "…", "why": "the loop: the last line leads back to the first" }]
//   node motion/films/clips.mjs <film> [--json]     → motion/out/<film>-clip-<id>.mp4 (+ a report); the gate is stages.mjs `clips`
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const film = process.argv[2], JSONOUT = process.argv.includes('--json'), SEAM = 0.5;
if (!film) { console.error('usage: clips.mjs <film>'); process.exit(1); }
const d = join('motion/films', film), rv = JSON.parse(readFileSync(join(d, 'review.json'), 'utf8')), src = `motion/out/${film}-v-narr.mp4`;
const S = JSON.parse(readFileSync(join(d, 'script.json'), 'utf8')), lines = Array.isArray(S) ? S : S.lines;
const place = existsSync(join(d, 'sound/place.json')) ? JSON.parse(readFileSync(join(d, 'sound/place.json'), 'utf8')).at || {} : {}, at = l => place[l.id] ?? l.at;   // where each take really starts
if (!existsSync(src)) { console.error(`${src} 없음 — film.mjs run ${film} picture`); process.exit(1); }
const out = [];
for (const c of rv.clips || []) {
  const f = `motion/out/${film}-clip-${c.id}.mp4`, len = +(c.to - c.from).toFixed(2);
  // video: the span, its last SEAM seconds dissolving into the span's first frame; sound: the span with a short fade at both ends
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(c.from), '-t', String(len), '-i', src, '-ss', String(c.from), '-t', String(SEAM), '-i', src,
    '-filter_complex', `[0:v]setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]xfade=transition=fade:duration=${SEAM}:offset=${(len - SEAM).toFixed(3)}[v];[0:a]asetpts=PTS-STARTPTS,afade=t=in:d=0.08,afade=t=out:st=${(len - SEAM).toFixed(3)}:d=${SEAM}[au]`,
    '-map', '[v]', '-map', '[au]', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', f]);
  const spoken = lines.filter(l => (l.kind === 'narr' || l.kind === 'quote') && l.voice !== null && at(l) != null && at(l) >= c.from - .05 && at(l) < c.to).sort((a, b) => at(a) - at(b));
  out.push({ id: c.id, file: f, from: c.from, to: c.to, len, first: spoken[0] ? +(at(spoken[0]) - c.from).toFixed(2) : null, lines: spoken.map(l => l.id), title: c.title || null, why: c.why || null });
}
writeFileSync(`motion/out/${film}-clips.json`, JSON.stringify(out, null, 1));
if (JSONOUT) console.log(JSON.stringify(out)); else for (const o of out) console.log(`${o.file}  ${o.len}s  첫 해설 ${o.first}s  [${o.lines.join(' ')}]  ${o.title || ''}`);
