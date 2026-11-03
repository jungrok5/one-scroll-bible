// How a film's sound sits — the numbers behind "고급진 소리" (2026-11-03: the first film's sound measured against 「메시아」's first
// mix, README 7절 "소리"). Prints, for each file: loudness (integrated, range, true peak), how much of the time is near-silent or
// quiet, how wide the stereo image is, where the energy sits (lows / voice band), and the biggest drops and swells.
// With a voice-free mix of the same film (--bed <file>), also how far the music sits under the voice while someone speaks.
//   node motion/films/sound-check.mjs <mix.wav|mp4 …> [--bed <music-and-effects-only.wav|mp4>] [--from s] [--to s]
import { execFileSync, spawnSync } from 'node:child_process';
const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i > -1 ? args.splice(i, 2)[1] : null; };
const bed = opt('bed'), from = +(opt('from') || 0), to = opt('to'), files = args;
const SR = 8000, seg = ['-ss', String(from), ...(to ? ['-to', to] : [])];
const pcm = (f, af, ch = 1) => { const raw = execFileSync('ffmpeg', ['-loglevel', 'error', ...seg, '-i', f, ...(af ? ['-af', af] : []), '-ac', String(ch), '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4); };
const rmsDb = (x, w = SR / 2) => { const o = []; for (let i = 0; i + w <= x.length; i += w) { let s = 0; for (let k = i; k < i + w; k++) s += x[k] * x[k]; o.push(10 * Math.log10(s / w + 1e-12)); } return o; };
const pct = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
function report(f) {
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...seg, '-i', f, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' }).stderr, S = e.slice(e.lastIndexOf('Summary'));
  const g = r => +(S.match(r) || [])[1];
  const mono = pcm(f), db = rmsDb(mono), n = db.length;
  const st = pcm(f, null, 2); let mm = 0, ss = 0; for (let i = 0; i < st.length; i += 2) { const m = (st[i] + st[i + 1]) / 2, s = (st[i] - st[i + 1]) / 2; mm += m * m; ss += s * s; }
  const band = af => { const x = pcm(f, af); let s = 0; for (const v of x) s += v * v; return s; }, all = band(null) || 1;
  const lo = band('lowpass=f=150,lowpass=f=150'), mid = band('highpass=f=300,lowpass=f=3500');
  const med = pct(db, .5), quiet = db.filter(v => v < med - 12).length / n, silent = db.filter(v => v < -50).length / n;
  const steps = []; for (let i = 2; i < n; i++) steps.push([db[i] - db[i - 2], (i * .5 + from).toFixed(1)]);
  steps.sort((a, b) => a[0] - b[0]);
  console.log(`\n${f.split(/[\\/]/).pop()}  (${(n / 2).toFixed(0)} s)`);
  console.log(`  loudness  I ${g(/I:\s+(-?[\d.]+) LUFS/)} LUFS · range ${g(/LRA:\s+([\d.]+) LU/)} LU · true peak ${g(/Peak:\s+(-?[\d.]+) dBFS/)} dBTP`);
  console.log(`  level spread (0.5 s RMS)  10% ${pct(db, .1).toFixed(1)} · median ${med.toFixed(1)} · 90% ${pct(db, .9).toFixed(1)} dB   quiet (≤median−12) ${(quiet * 100).toFixed(0)}% · near-silent ${(silent * 100).toFixed(0)}%`);
  console.log(`  stereo width (side/mid) ${(10 * Math.log10(ss / (mm || 1))).toFixed(1)} dB   energy: lows<150 Hz ${(100 * lo / all).toFixed(0)}% · voice band 300–3500 ${(100 * mid / all).toFixed(0)}%`);
  console.log(`  biggest drops ${steps.slice(0, 4).map(([d, t]) => `${d.toFixed(0)}dB@${t}`).join(' ')}   swells ${steps.slice(-4).reverse().map(([d, t]) => `+${d.toFixed(0)}dB@${t}`).join(' ')}`);
  return db;
}
const dbs = files.map(report);
if (bed) {   // where the mix is louder than the bed by ≥3 dB someone speaks; the gap there = how far music sits under the voice
  const b = report(bed), m = dbs[0], gaps = []; for (let i = 0; i < Math.min(b.length, m.length); i++) if (m[i] - b[i] > 3) gaps.push(m[i] - b[i]);
  console.log(`\n  under speech (${(gaps.length / 2).toFixed(0)} s): mix − bed  median ${pct(gaps, .5).toFixed(1)} dB · 10% ${pct(gaps, .1).toFixed(1)} · 90% ${pct(gaps, .9).toFixed(1)}`);
}
