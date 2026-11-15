// Is the finished mix soft and warm to listen to, like the first film? Measures the final audio (narrated cut), file against file.
//   node motion/films/mix-soft.mjs <mix.wav|mp4> … [--json] [--times]
// 「그리스도」 2026-11-15 관리자 #50 "들을 때 불편하지 않았으면 — 부드럽고 따뜻한 느낌, 첫 영상이 그랬어. 지금 너무 고저차가 있고 날카로운 효과음들이 있어".
// Reference: the first film's Korean Shorts (release youtube-v1, shorts-ko-*.mp4 — narrated, one scene each).
//   spread  p95 − p10 of 0.4 s level (dB, heard windows) — how far loud and quiet moments lie apart
//   jolt    p99 of (0.4 s level − the quietest 0.4 s in the 1.5 s before) — something loud straight out of quiet
//   air     energy above 4 kHz against the whole (dB) — brightness; warm = low
//   bite    p99 of the 100 ms level above 3 kHz minus the file's median 0.4 s level (dB) — sharp transients (clicks, chimes, scrapes)
import { spawnSync } from 'node:child_process';
const a = process.argv.slice(2), files = a.filter(x => !x.startsWith('--')), R = 16000;
const pcm = (f, af) => { const r = spawnSync('ffmpeg', ['-v', 'error', '-i', f, ...(af ? ['-af', af] : []), '-ac', '1', '-ar', String(R), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  if (r.status) throw new Error(f + ': ' + r.stderr); return new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4); };
const lev = (x, w, hop = w) => { const v = []; for (let i = 0; i + w <= x.length; i += hop) { let s = 0; for (let k = i; k < i + w; k++) s += x[k] * x[k]; v.push(Math.max(-80, 10 * Math.log10(s / w + 1e-12))); } return v; };
const pct = (v, p) => { const s = [...v].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
const energy = x => { let s = 0; for (const v of x) s += v * v; return s; };
const out = files.map(f => {
  const x = pcm(f, 'highpass=f=60'), hi = pcm(f, 'highpass=f=3000,highpass=f=3000'), air = pcm(f, 'highpass=f=4000,highpass=f=4000');
  const L = lev(x, R * .4), heard = L.filter(d => d > -60), med = pct(heard, .5);
  const J = L.map((d, i) => i < 4 ? 0 : d - Math.min(...L.slice(i - 4, i)));
  const B = lev(hi, R / 10, R / 20);
  const r = { file: f.split(/[\\/]/).pop(), sec: Math.round(x.length / R), spread: +(pct(heard, .95) - pct(heard, .1)).toFixed(1), jolt: +pct(J, .99).toFixed(1),
    air: +(10 * Math.log10(energy(air) / energy(x))).toFixed(1), bite: +(pct(B, .99) - med).toFixed(1) };
  if (a.includes('--times')) { r.jolts = J.map((d, i) => [d, i * .4]).filter(([d]) => d > 15).map(([d, t]) => `${t.toFixed(1)}s +${d.toFixed(0)}`);
    r.bites = B.map((d, i) => [d - med, i * .05]).filter(([d]) => d > pct(B, .99) - med - .01).map(([d, t]) => `${t.toFixed(2)}s ${d.toFixed(0)}`).slice(0, 30); }
  return r; });
if (a.includes('--json')) console.log(JSON.stringify(out));
else for (const r of out) { console.log(`${r.file.padEnd(28)} ${String(r.sec).padStart(4)}s  spread ${String(r.spread).padStart(5)}  jolt ${String(r.jolt).padStart(5)}  air ${String(r.air).padStart(6)}  bite ${String(r.bite).padStart(5)}`);
  if (r.jolts) console.log('   jolts', r.jolts.join(', ')); if (r.bites) console.log('   bites', r.bites.join(', ')); }
