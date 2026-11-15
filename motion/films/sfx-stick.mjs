// How far each sound effect sticks out of the music, and how sharp it is — measured the same way for a film and for the first film.
//   node motion/films/sfx-stick.mjs <film> [--json] [--all]      a film's cues.json (motion/films/<film>/sound/)
//   node motion/films/sfx-stick.mjs --first [--json]             the first film's 21 scenes (motion/pilot/<scene>.sound.json, audio/<scene>__<id>.mp3)
// 「그리스도」 2026-11-15 관리자 #50 "들을 때 불편하지 않았으면 — 부드럽고 따뜻한 느낌, 첫 영상이 그랬어. 지금 너무 고저차가 있고 날카로운 효과음들이 있어".
// For every effect, as it is laid (off/len/db/fades): its loudest 100 ms (stick) and the loudest 100 ms of what is above 3 kHz (sharp),
// both against the median 2 s level of the music it plays over (the film's / the scene's music alone). Prints the distribution and,
// for a film, the effects above the first film's 90th percentile — those are what the ear hears as "튀는/날카로운" sounds.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { music, renderCues } from './music-bus.mjs';
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..', '..'), P = join(ROOT, 'motion', 'pilot');
const a = process.argv.slice(2), R = 16000;
const pcm = (f, af) => { const r = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-af', af, '-ac', '1', '-ar', String(R), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  if (r.status) throw new Error(f + ': ' + r.stderr); return new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4); };
// as sound.mjs lays a cue, including the cues.json "bus" (c.kind 'sfx' | 'music' set by the caller)
let BUS = {};
const lay = c => { const lp = c.lp ?? BUS[c.kind + '_lp'], g = (c.db || 0) + (BUS[c.kind + '_db'] || 0);
  // (a lowpass at or above this tool's Nyquist blows up the biquad — and changes nothing it can hear anyway)
  return `atrim=start=${c.off || 0}${c.len ? ':duration=' + c.len : ''},asetpts=PTS-STARTPTS,afade=t=in:d=${c.fin || .005},areverse,afade=t=in:d=${c.fout || .005},areverse,${lp && lp < R * .45 ? `lowpass=f=${lp},` : ''}volume=${g}dB`; };
const maxWin = (x, w) => { let best = -120; for (let i = 0; i + w <= x.length; i += w / 2) { let s = 0; for (let k = i; k < i + w; k++) s += x[k] * x[k]; best = Math.max(best, 10 * Math.log10(s / w + 1e-12)); } return best; };
// music-only render: median of the heard 2 s windows
function musicRef(list) {
  const inp = [], parts = []; list.forEach((c, i) => { inp.push('-i', c.f); parts.push(`[${i}:a]aresample=${R},aformat=channel_layouts=mono,${lay(c)},adelay=${Math.round(c.at * 1000)}:all=1[m${i}]`); });
  const fc = parts.join(';') + ';' + list.map((_, i) => `[m${i}]`).join('') + `amix=inputs=${list.length}:normalize=0[o]`;
  const r = spawnSync('ffmpeg', ['-v', 'error', ...inp, '-filter_complex', fc, '-map', '[o]', '-ar', String(R), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  return refOf(new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4)); }
function refOf(x) { const v = [];
  for (let i = 0; i + 2 * R <= x.length; i += 2 * R) { let s = 0; for (let k = i; k < i + 2 * R; k++) s += x[k] * x[k]; v.push(10 * Math.log10(s / (2 * R) + 1e-12)); }
  const h = v.filter(d => d > -60).sort((p, q) => p - q); return h[Math.floor(h.length / 2)] ?? -30; }
function measure(sfx, ref, scene) {
  return sfx.map(c => { const x = pcm(c.f, lay(c)), hx = pcm(c.f, lay(c) + ',highpass=f=3000,highpass=f=3000'), w = R / 10;
    return { scene, id: c.id, at: c.at, stick: +(maxWin(x, w) - ref).toFixed(1), sharp: +(maxWin(hx, w) - ref).toFixed(1) }; }); }
// the bed (music + effects, with ducks) and its sudden rises: for every 0.25 s window, its level minus the quietest 0.25 s in the
// 1.5 s before it — a loud hit straight out of near silence is what makes a listener flinch ("고저차")
function jumps(list, ducks, dur) {
  const inp = [], parts = []; list.forEach((c, i) => { inp.push('-i', c.f);
    const dk = (ducks || []).filter(d => c.at < d.from).map(d => `(1-${(1 - 10 ** (d.db / 20)).toFixed(4)}*clip((t-${d.from})/${d.ramp || .3},0,1)*lt(t,${d.to}))`);
    parts.push(`[${i}:a]aresample=${R},aformat=channel_layouts=mono,${lay(c)},adelay=${Math.round(c.at * 1000)}:all=1${dk.length ? `,volume='${dk.join('*')}':eval=frame` : ''}[m${i}]`); });
  const fc = parts.join(';') + ';' + list.map((_, i) => `[m${i}]`).join('') + `amix=inputs=${list.length}:normalize=0,apad,atrim=end=${dur}[o]`;
  const r = spawnSync('ffmpeg', ['-v', 'error', ...inp, '-filter_complex', fc, '-map', '[o]', '-ar', String(R), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  return risesOf(new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4)); }
function risesOf(x) { const w = R / 4, v = [];
  for (let i = 0; i + w <= x.length; i += w) { let s = 0; for (let k = i; k < i + w; k++) s += x[k] * x[k]; v.push(Math.max(-70, 10 * Math.log10(s / w + 1e-12))); }
  return v.map((d, i) => ({ t: i / 4, rise: i < 6 ? 0 : +(d - Math.min(...v.slice(i - 6, i))).toFixed(1) })); }
const pct = (v, p) => { const s = [...v].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
function first() {
  const rows = [];
  for (const fn of readdirSync(P).filter(f => f.endsWith('.sound.json'))) {
    const scene = fn.slice(0, -11), s = JSON.parse(readFileSync(join(P, fn), 'utf8'));
    const f = c => [join(P, 'audio', `${scene}__${c.src || c.id}.mp3`), join(P, 'audio', `${c.src || c.id}.mp3`)].find(existsSync);
    const mus = (s.music || []).map(c => ({ ...c, f: f(c) })).filter(c => c.f), sfx = (s.sfx || []).map(c => ({ ...c, f: f(c) })).filter(c => c.f);
    if (!mus.length) continue; rows.push(...measure(sfx, musicRef(mus), scene));
    rises.push(...jumps([...mus, ...sfx], s.ducks, s.duration).map(j => j.rise)); }
  return rows; }
const rises = [];
const dist = rows => ({ n: rows.length, stick: [.5, .9, 1].map(p => pct(rows.map(r => r.stick), p)), sharp: [.5, .9, 1].map(p => pct(rows.map(r => r.sharp), p)) });
const riseDist = v => ({ rise: [.99, 1].map(p => pct(v, p)), big_per_min: +(v.filter(r => r > 20).length / (v.length / 240)).toFixed(2) });
if (a[0] === '--first') { const rows = first(), d = { ...dist(rows), ...riseDist(rises) };
  if (a.includes('--json')) console.log(JSON.stringify(d));
  else { console.log(`first film: ${d.n} effects · stick p50/p90/max ${d.stick.join(' / ')} dB · sharp ${d.sharp.join(' / ')} dB (against the scene's music median)`);
    console.log(`  bed rises (0.25 s over the quietest of the 1.5 s before): p99 ${d.rise[0]} · max ${d.rise[1]} dB · over 20 dB ${d.big_per_min}/min`);
    rows.sort((p, q) => q.sharp - p.sharp).slice(0, 8).forEach(r => console.log(`  ${r.scene}/${r.id} @${r.at}  stick ${r.stick}  sharp ${r.sharp}`)); }
} else {
  const film = a[0], S = join(HERE, film, 'sound'), C = JSON.parse(readFileSync(join(S, 'cues.json'), 'utf8'));
  BUS = C.bus || {};
  const f = c => c.file ? join(ROOT, c.file) : join(S, 'audio', c.id + '.mp3');
  C.music = C.music.map(c => ({ ...c, kind: 'music' })); C.sfx = C.sfx.map(c => ({ ...c, kind: 'sfx' }));
  // the music as the mix hears it (bus, ducks, bus.music_ceiling — music-bus.mjs)
  const MX = music(C, f, R, 1).x, ref = refOf(MX), rows = measure(C.sfx.map(c => ({ ...c, f: f(c) })), ref, film), d = dist(rows);
  const F = JSON.parse(spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--first', '--json'], { encoding: 'utf8', maxBuffer: 1 << 24 }).stdout.trim());
  const over = rows.filter(r => r.stick > F.stick[1] || r.sharp > F.sharp[1]);
  const SX = renderCues(C.sfx, C, R, 1, f, 'sfx'), BED = MX.map((v, i) => v + (SX[i] || 0));
  const J = risesOf(BED), RD = riseDist(J.map(j => j.rise));
  const jolts = J.filter(j => j.rise > F.rise[0]).map(j => `${j.t}s +${j.rise}`);
  if (a.includes('--json')) console.log(JSON.stringify({ film, ref: +ref.toFixed(1), ...d, ...RD, jolts, first: F, over }));
  else { console.log(`${film}: ${d.n} effects over music median ${ref.toFixed(1)} dB · stick p50/p90/max ${d.stick.join(' / ')} · sharp ${d.sharp.join(' / ')}`);
    console.log(`first film:            stick ${F.stick.join(' / ')} · sharp ${F.sharp.join(' / ')}`);
    console.log(`bed rises p99 ${RD.rise[0]} · max ${RD.rise[1]} · over 20 dB ${RD.big_per_min}/min   (first film p99 ${F.rise[0]} · max ${F.rise[1]} · ${F.big_per_min}/min)`);
    console.log(`  jolts above the first film's p99: ${jolts.join(', ') || 'none'}`);
    console.log(`above the first film's p90 (stick > ${F.stick[1]} or sharp > ${F.sharp[1]}): ${over.length}`);
    (a.includes('--all') ? rows : over).sort((p, q) => p.at - q.at).forEach(r => console.log(`  ${r.id.padEnd(6)} @${String(r.at).padEnd(6)} stick ${String(r.stick).padStart(5)}  sharp ${String(r.sharp).padStart(5)}`)); }
}
