// The music layer as the mix hears it, and its ceiling — shared by sound.mjs (the mix), music-arc.mjs and sfx-stick.mjs (the measures).
// cues.json bus.music_ceiling: [[t, dB], …] — the highest the music alone (mono 8 kHz, 0.5 s RMS, as music-arc measures it) may go at film
// time t, straight lines between points. Where the music would rise above it its gain comes down — smoothly (looks ahead 1 s, never faster
// than 6 dB/s), never up. 「그리스도」 2026-11-15 관리자 #51 "배경음악이 너무 과격하게 기승전결이 들어간 것 같아서 소리가 고조되는 구간이
// 너무 여러 번 있달까? 소리가 큰 느낌이야": the #49 score swelled to −16…−20 dB more than ten times in three minutes.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

// one cue laid as sound.mjs lays it (off/len/fades/bus lowpass/bus db) — the filter chain after the input
export function layChain(c, C, R, kind = 'music') {
  const B = C.bus || {}, lp = c.lp ?? B[kind + '_lp'], g = (c.db || 0) + (B[kind + '_db'] || 0);
  return `atrim=start=${c.off || 0}${c.len ? ':duration=' + c.len : ''},asetpts=PTS-STARTPTS,afade=t=in:d=${c.fin || .005},areverse,afade=t=in:d=${c.fout || .005},areverse,` +
    `${lp && lp < R * .45 ? `lowpass=f=${lp},` : ''}volume=${g}dB`; }
// cues → Float32Array (ch interleaved channels at R), the cues.json ducks included, before the ceiling
export function renderCues(list, C, R, ch, fileOf, kind = 'music') {
  const inp = [], parts = [];
  list.forEach((c, i) => { inp.push('-i', fileOf(c));
    const dk = (C.ducks || []).filter(d => c.at < d.from).map(d => `(1-${(1 - 10 ** (d.db / 20)).toFixed(4)}*clip((t-${d.from})/${d.ramp || .3},0,1)*lt(t,${d.to}))`);
    parts.push(`[${i}:a]aresample=${R},aformat=channel_layouts=${ch === 1 ? 'mono' : 'stereo'},${layChain(c, C, R, kind)},adelay=${Math.round(c.at * 1000)}:all=1${dk.length ? `,volume='${dk.join('*')}':eval=frame` : ''}[m${i}]`); });
  const D = C.dur || 180, fc = parts.join(';') + ';' + list.map((_, i) => `[m${i}]`).join('') + `amix=inputs=${list.length}:normalize=0:dropout_transition=0,apad,atrim=end=${D}[o]`;
  const r = spawnSync('ffmpeg', ['-v', 'error', ...inp, '-filter_complex', fc, '-map', '[o]', '-ar', String(R), '-ac', String(ch), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  if (r.status) throw new Error(String(r.stderr));
  return new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length)); }
export function ceilingAt(pts, t) {
  if (!pts?.length) return Infinity; if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [t0, d0] = pts[i - 1], [t1, d1] = pts[i]; return d0 + (d1 - d0) * (t - t0) / Math.max(1e-6, t1 - t0); }
  return pts[pts.length - 1][1]; }
// the ceiling's gain curve (dB every 0.1 s) from the mono 8 kHz music
export function ceilingGain(mono, R, pts) {
  const hop = Math.round(R / 10), n = Math.floor(mono.length / hop);
  if (!pts?.length) return new Array(n).fill(0);
  const lv = Array.from({ length: n }, (_, i) => { let s = 0, c = 0; for (let k = Math.max(0, (i - 2) * hop); k < Math.min(mono.length, (i + 3) * hop); k++, c++) s += mono[k] ** 2; return 10 * Math.log10(s / Math.max(1, c) + 1e-12); });
  let g = lv.map((d, i) => Math.min(0, ceilingAt(pts, i / 10) - d));
  g = g.map((_, i) => Math.min(...g.slice(i, i + 11)));                                     // look ahead 1 s: be down before the swell
  for (let i = 1; i < n; i++) g[i] = Math.max(g[i], g[i - 1] - .6);                        // fall no faster than 6 dB/s …
  for (let i = n - 2; i >= 0; i--) g[i] = Math.max(g[i], g[i + 1] - .6);                    // … and come back as gently
  return g.map((_, i) => { let s = 0, c = 0; for (let k = Math.max(0, i - 5); k <= Math.min(n - 1, i + 5); k++, c++) s += g[k]; return s / c; }); }
export function applyGain(x, R, ch, gain) {
  const y = new Float32Array(x.length), hop = R / 10, n = gain.length;
  for (let f = 0; f < x.length / ch; f++) { const p = f / hop, i = Math.min(n - 1, Math.floor(p)), j = Math.min(n - 1, i + 1), m = 10 ** ((gain[i] + (gain[j] - gain[i]) * (p - i)) / 20 || 0);
    for (let c = 0; c < ch; c++) y[f * ch + c] = x[f * ch + c] * m; }
  return y; }
// the music as the mix hears it: mono 8 kHz decides the ceiling; returns the music at (R, ch) under it, and the gain
export function music(C, fileOf, R = 8000, ch = 1) {
  const mono = renderCues(C.music, C, 8000, 1, fileOf), gain = ceilingGain(mono, 8000, C.bus?.music_ceiling);
  const x = R === 8000 && ch === 1 ? mono : renderCues(C.music, C, R, ch, fileOf);
  return { x: applyGain(x, R, ch, gain), gain }; }
export const fileOfFor = (ROOT, S) => c => c.file ? join(ROOT, c.file) : join(S, 'audio', c.id + '.mp3');
