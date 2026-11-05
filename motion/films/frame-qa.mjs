// Every frame of a render, checked (after mromidev/claude-animated-shorts `short_qa.py`, MIT — ported to node for the pipeline).
// Streams the video at 180×320 and reports: black frames, unplanned white flashes, frozen spans (≥ 12 frames with no change),
// pops (a frame that jumps > 3× its local median change, outside planned cuts/dissolves), the share of held frames, and per
// scene the luma mean / spread / p2 / p98 and saturation — so "어디가 어둡고, 어디가 멈추고, 어디가 튀나" has frame numbers.
//   node motion/films/frame-qa.mjs <video.mp4> [--film <name>] [--json]
// Flicker (「메시아」 2026-11-05: z-fighting on the window frame, caught by the maintainer's eye): a 10×10-px cell whose brightness goes
// up then straight back down (or the reverse) between consecutive frames, frame after frame — reported per scene with its place.
// --film reads motion/films/<name>/film.html SCENES ([a, b, fn] in seconds): dissolves (overlaps) and scene starts are planned.
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i > -1 ? args.splice(i, 2)[1] : null; };
const film = opt('film'), JSONOUT = args.includes('--json') && (args.splice(args.indexOf('--json'), 1), true), vid = args[0], W = 180, H = 320, FPS = 30, N = W * H;
if (!vid) { console.error('usage: frame-qa.mjs <video.mp4> [--film name] [--json]'); process.exit(1); }
// the film's scenes and planned transitions
let scenes = [];
if (film && existsSync(`motion/films/${film}/film.html`)) { const s = readFileSync(`motion/films/${film}/film.html`, 'utf8'), m = s.match(/const SCENES = \[([\s\S]*?)\n\];/);
  if (m) for (const r of m[1].matchAll(/\[\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\w$]+|\(c, t\)[^\]]*?)/g)) scenes.push({ a: +r[1], b: +r[2], fn: /^[\w$]+$/.test(r[3]) ? r[3] : 'opening' }); }
const planned = new Set(), QP = [];
// the film's own planned effects: `const QA_PLANNED = [[a, b, 'why'], …];` in film.html (a flicker, a flash) — and the first/last half second
if (film && existsSync(`motion/films/${film}/film.html`)) { const m = readFileSync(`motion/films/${film}/film.html`, 'utf8').match(/const QA_PLANNED = \[([\s\S]*?)\];/);
  if (m) for (const r of m[1].matchAll(/\[\s*([\d.]+)\s*,\s*([\d.]+)/g)) { QP.push([+r[1], +r[2]]); for (let f = Math.round(+r[1] * FPS); f <= Math.round(+r[2] * FPS); f++) planned.add(f); } }
for (let f = 0; f <= FPS / 2; f++) planned.add(f);
// planned holds (a reading card): const QA_HOLD = [[a, b, 'why']]; — left out of the held share (overall and per scene)
const hold = new Set(); if (film && existsSync(`motion/films/${film}/film.html`)) { const m = readFileSync(`motion/films/${film}/film.html`, 'utf8').match(/const QA_HOLD = \[([\s\S]*?)\];/);
  if (m) for (const r of m[1].matchAll(/\[\s*([\d.]+)\s*,\s*([\d.]+)/g)) for (let f = Math.round(+r[1] * FPS); f <= Math.round(+r[2] * FPS); f++) hold.add(f); }
for (let i = 0; i < scenes.length; i++) { const s = scenes[i], fa = Math.round(s.a * FPS); for (let f = fa - 2; f <= fa + 2; f++) planned.add(f);
  if (i > 0 && scenes[i - 1].b > s.a) for (let f = Math.round(s.a * FPS) - 1; f <= Math.round(scenes[i - 1].b * FPS) + 1; f++) planned.add(f); }
const ff = spawn('ffmpeg', ['-v', 'error', '-i', vid, '-vf', `fps=${FPS},scale=${W}:${H}:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
const per = [], diff = []; let prev = null, buf = Buffer.alloc(0), n = 0;
const CW = 10, GX = W / CW, GY = H / CW, flick = [], L0 = new Float32Array(GX * GY), L1 = new Float32Array(GX * GY), L2 = new Float32Array(GX * GY); let lq = 0;   // cell lumas of the last three frames
ff.stdout.on('data', d => { buf = Buffer.concat([buf, d]); const fs = N * 3;
  while (buf.length >= fs) { const fr = buf.subarray(0, fs); buf = buf.subarray(fs); const hist = new Uint32Array(256); let sum = 0, sum2 = 0, sat = 0, dd = 0;
    for (let i = 0, p = 0; i < N; i++, p += 3) { const r = fr[p], g = fr[p + 1], b = fr[p + 2], y = .2126 * r + .7152 * g + .0722 * b; hist[y | 0]++; sum += y; sum2 += y * y;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx > 15) sat += (mx - mn) / mx; if (prev) dd += Math.abs(r - prev[p]) + Math.abs(g - prev[p + 1]) + Math.abs(b - prev[p + 2]); }
    const q = t => { let c = 0; for (let v = 0; v < 256; v++) { c += hist[v]; if (c >= t * N) return v / 255; } return 1; }, mean = sum / N;
    per.push({ mean: mean / 255, std: Math.sqrt(Math.max(0, sum2 / N - mean * mean)) / 255, p2: q(.02), p98: q(.98), sat: sat / N }); if (prev) diff.push(dd / (N * 3));
    { L0.set(L1); L1.set(L2); L2.fill(0); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const p = (y * W + x) * 3; L2[((y / CW) | 0) * GX + ((x / CW) | 0)] += (.2126 * fr[p] + .7152 * fr[p + 1] + .0722 * fr[p + 2]) / (CW * CW); }
      if (++lq >= 3) { const ev = []; for (let k = 0; k < GX * GY; k++) { const a = L1[k] - L0[k], c = L2[k] - L1[k]; if (a * c < 0 && Math.min(Math.abs(a), Math.abs(c)) > 2.5 && Math.abs(L2[k] - L0[k]) < Math.min(Math.abs(a), Math.abs(c))) ev.push(k); } flick.push(ev); } else flick.push([]); }
    prev = Buffer.from(fr); n++; } });
ff.on('close', () => {
  const med = i => { const w = diff.slice(Math.max(0, i - 8), i + 9).slice().sort((a, b) => a - b); return w[w.length >> 1]; };
  const pops = [], frozen = [], black = [], white = []; let run = null;
  for (let i = 0; i < diff.length; i++) { if (diff[i] > 3 * med(i) + 1 && !planned.has(i + 1)) pops.push(i + 1);
    if (diff[i] < .02) run = run ?? i; else { if (run != null && i - run >= 12) frozen.push([run, i]); run = null; } }
  if (run != null && diff.length - run >= 12) frozen.push([run, diff.length]);
  for (let f = n - FPS / 2; f < n; f++) planned.add(f);
  per.forEach((p, i) => { if (p.mean < .04 && !planned.has(i)) black.push(i); if (p.mean > .93 && !planned.has(i)) white.push(i); });
  // held = a change smaller than 0.3 levels scaled by the frame's own contrast (a dark, low-contrast night moves in small numbers)
  const thr = i => Math.max(.06, .3 * (per[i]?.std || .15) / .15), live = diff.map((d, i) => [d, i + 1]).filter(([, f]) => !hold.has(f)), held = live.filter(([d, f]) => d < thr(f)).length / Math.max(1, live.length), sec = f => +(f / FPS).toFixed(2);
  const medOf = (a, k) => { const v = a.map(x => x[k]).sort((x, y) => x - y); return +(v[v.length >> 1] || 0).toFixed(3); };
  const perScene = (scenes.length ? scenes : [{ a: 0, b: n / FPS, fn: 'all' }]).map(s => { const a = Math.round(s.a * FPS), b = Math.min(n, Math.round(s.b * FPS)), seg = per.slice(a, b), dseg = diff.slice(a, b - 1).filter((d, k) => !hold.has(a + k + 1));
    return { scene: s.fn, a: s.a, b: s.b, luma: medOf(seg, 'mean'), std: medOf(seg, 'std'), p2: medOf(seg, 'p2'), p98: medOf(seg, 'p98'), sat: medOf(seg, 'sat'), held: +(dseg.filter((d, k) => d < thr(a + k + 1)).length / Math.max(1, dseg.length)).toFixed(3), motion: +(dseg.reduce((x, y) => x + y, 0) / Math.max(1, dseg.length)).toFixed(2) }; });
  // flicker per scene: the cell that flips most often (share of the scene's frames), outside planned effects
  const flickers = []; for (const sc of (scenes.length ? scenes : [{ a: 0, b: n / FPS, fn: 'all' }])) { const a = Math.round(sc.a * FPS) + 3, b = Math.min(n, Math.round(sc.b * FPS)) - 3, cnt = new Map(); let m = 0;
    for (let fr = a; fr < b; fr++) { if (planned.has(fr)) continue; m++; for (const k of flick[fr] || []) cnt.set(k, (cnt.get(k) || 0) + 1); }
    let best = null; for (const [k, v] of cnt) if (!best || v > best[1]) best = [k, v]; if (best && m > 0 && best[1] / m > .12) flickers.push({ scene: sc.fn, rate: +(best[1] / m).toFixed(2), x: +(((best[0] % GX) + .5) / GX).toFixed(2), y: +((Math.floor(best[0] / GX) + .5) / GY).toFixed(2) }); }
  const R = { file: vid, flickers, frames: n, seconds: +(n / FPS).toFixed(2), black: black.length, blackAt: black.slice(0, 10).map(sec), white: white.length, whiteAt: white.slice(0, 10).map(sec),
    frozen: frozen.map(([a, b]) => [sec(a), sec(b)]), pops: pops.map(sec), held: +held.toFixed(3), motion: +(diff.reduce((x, y) => x + y, 0) / Math.max(1, diff.length)).toFixed(2), perScene };
  if (JSONOUT) { console.log(JSON.stringify(R)); return; }
  console.log(`${vid}  ${R.frames} frames (${R.seconds} s)\n  black ${R.black} ${R.blackAt.join(' ')} · unplanned white ${R.white} ${R.whiteAt.join(' ')}\n  frozen spans ≥12f: ${R.frozen.map(([a, b]) => `${a}–${b}s`).join(' ') || 'none'}\n  pops: ${R.pops.join(' ') || 'none'}\n  held frames ${(R.held * 100).toFixed(0)}% · mean change ${R.motion}`);
  console.log(`  flicker: ${R.flickers.map(q => `${q.scene} ${(q.rate * 100).toFixed(0)}% of frames at x ${q.x} y ${q.y} (share of the frame)`).join(' · ') || 'none'}`);
  console.log('  per scene (luma · std · p2 · p98 · sat · held · motion):'); for (const s of perScene) console.log(`   ${s.scene.padEnd(16)} ${s.a}–${s.b}s  ${s.luma} · ${s.std} · ${s.p2} · ${s.p98} · ${s.sat} · ${(s.held * 100).toFixed(0)}% · ${s.motion}`);
});
