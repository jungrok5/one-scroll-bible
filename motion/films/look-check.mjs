// How a film looks over time — the numbers behind "비주얼이 심심하다" (2026-11-03: 「메시아」 round 1 against the first film's Shorts,
// README 7절 "장면마다 다른 화풍"). For each file: average brightness, share of dark frames, share of near-still frames, and the
// stillest / darkest 5-second stretches, so the scenes to redraw can be named.
//   node motion/films/look-check.mjs <film.mp4 …> [--fps 2] [--json]   (--json: one machine-readable line, for film.mjs gates)
// First film's Shorts (release-narr): brightness 78–123/255 · dark 1–11 % · still 0–1 % (20 % in kingdom, which holds pictures) · motion median 1.7–6.
// 「메시아」 round 1 (2026-11-03): 49 · 58 % · 24 % · 1.5.
import { spawnSync } from 'node:child_process';
const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i > -1 ? args.splice(i, 2)[1] : null; };
const fps = +(opt('fps') || 2), DARK = 40, STILL = 0.6, JSONOUT = args.includes('--json') ? (args.splice(args.indexOf('--json'), 1), []) : null;
const yavg = (f, vf) => [...spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', f, '-vf', `fps=${fps},scale=135:240,${vf}signalstats,metadata=print:key=lavfi.signalstats.YAVG`, '-f', 'null', '-'],
  { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr.matchAll(/YAVG=([\d.]+)/g)].map(m => +m[1]);
const med = a => [...a].sort((x, y) => x - y)[a.length >> 1];
const win = (a, n = 5 * fps) => { const o = []; for (let i = 0; i + n <= a.length; i += n) o.push([i / fps, a.slice(i, i + n).reduce((s, v) => s + v, 0) / n]); return o; };
const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
for (const f of args) {
  const y = yavg(f, ''), m = yavg(f, 'tblend=all_mode=difference,');
  const avg = y.reduce((s, v) => s + v, 0) / y.length, dark = y.filter(v => v < DARK).length / y.length, still = m.filter(v => v < STILL).length / m.length;
  if (JSONOUT) { JSONOUT.push({ file: f, seconds: y.length / fps, brightness: +avg.toFixed(1), dark: +dark.toFixed(3), still: +still.toFixed(3), motion: +med(m).toFixed(2), stillest: win(m).sort((a, b) => a[1] - b[1]).slice(0, 6), darkest: win(y).sort((a, b) => a[1] - b[1]).slice(0, 6) }); continue; }
  console.log(`\n${f.split(/[\\/]/).pop()}  (${(y.length / fps).toFixed(0)} s)`);
  console.log(`  brightness ${avg.toFixed(0)}/255 · dark (<${DARK}) ${(dark * 100).toFixed(0)}% · near-still ${(still * 100).toFixed(0)}% · motion median ${med(m).toFixed(2)}`);
  console.log(`  stillest 5 s: ${win(m).sort((a, b) => a[1] - b[1]).slice(0, 6).map(([t, v]) => `${mmss(t)}(${v.toFixed(1)})`).join(' ')}`);
  console.log(`  darkest 5 s:  ${win(y).sort((a, b) => a[1] - b[1]).slice(0, 6).map(([t, v]) => `${mmss(t)}(${v.toFixed(0)})`).join(' ')}`);
}
if (JSONOUT) console.log(JSON.stringify(JSONOUT));
