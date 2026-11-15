// The score's shape, measured on the music alone (cues.json music, as sound.mjs lays it, without voice or effects).
//   node motion/films/music-arc.mjs <film> [--card <s>] [--cues <older cues.json>] [--json] [--bars]
// 「그리스도」 2026-11-15 관리자 #49 "배경음악이 단조로워 — 기승전결, 긴장감·전율·고조": the old score sat at −22…−28 dB for
// two minutes and its loudest moment (the title, 0:26) was as loud as any later one. #48: it also faded out under the last
// verse, so the end card came in on near silence ("숨 참듯 줄어든 뒤 엔딩"). Three numbers catch both:
//   contrast  p95 − p50 of 2 s RMS (dB) — how far the big moments stand above the ordinary ones (old 5.7, new 10.9; 「메시아」 7.0, 「침묵의 400년」 7.5)
//   rise      loudest 2 s in the last third − loudest in the first third (dB) — the climax comes late, not at the title (old 0.2, new 5.5; 「메시아」 −2.3, 「침묵의 400년」 −2.5)
//   swells    stretches 6 dB or more above the median (#51 "고조되는 구간이 너무 여러 번", 2026-11-15)
//   endDrop   music in [card − 6, card − 1] minus music in [card, card + 2.5] (dB) — positive = it sinks into the end card (old 22, new −5.3; 「메시아」 25, 「침묵의 400년」 8.6)
import { readFileSync } from 'node:fs';
import { music, fileOfFor } from './music-bus.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..', '..');
const a = process.argv.slice(2), film = a[0], opt = k => { const i = a.indexOf(k); return i < 0 ? null : a[i + 1]; };
const S = join(HERE, film, 'sound'), C = JSON.parse(readFileSync(opt('--cues') || join(S, 'cues.json'), 'utf8'));   // --cues <file>: an older cues.json to compare
const sc = JSON.parse(readFileSync(join(HERE, film, 'script.json'), 'utf8')), L = sc.lines || sc;
const card = +(opt('--card') ?? Math.max(...L.map(l => l.at ?? 0))), D = C.dur || 180, R = 8000;
// the music as the mix hears it (cues.json bus, ducks, bus.music_ceiling — music-bus.mjs)
const x = music(C, fileOfFor(ROOT, S), R, 1).x;
const rms = (t0, t1) => { let s = 0, n = 0; for (let i = Math.max(0, Math.round(t0 * R)); i < Math.min(x.length, Math.round(t1 * R)); i++, n++) s += x[i] * x[i]; return 10 * Math.log10(s / Math.max(1, n) + 1e-12); };
const W = 2, env = []; for (let t = 0; t + W <= D; t += W) env.push(rms(t, t + W));
const heard = env.filter(v => v > -70).sort((p, q) => p - q), pct = p => heard[Math.min(heard.length - 1, Math.floor(heard.length * p))];
const third = Math.floor(env.length / 3), mx = v => Math.max(...v);
const out = { film, card, contrast: +(pct(.95) - pct(.5)).toFixed(1), rise: +(mx(env.slice(-third)) - mx(env.slice(0, third))).toFixed(1),
  endDrop: +(rms(card - 6, card - 1) - rms(card, card + 2.5)).toFixed(1), p50: +pct(.5).toFixed(1), p95: +pct(.95).toFixed(1) };
// swells (#51 "고조되는 구간이 너무 여러 번"): separate stretches where the music stands 6 dB or more above its median (gaps under 4 s join)
{ const hi = env.map((d, i) => [i * W, d > out.p50 + 6]).filter(([, h]) => h).map(([t]) => t), sw = [];
  for (const t of hi) if (sw.length && t - sw[sw.length - 1][1] <= 4) sw[sw.length - 1][1] = t; else sw.push([t, t]);
  out.swells = sw.length; out.swellAt = sw.map(([p, q]) => p === q ? `${p}` : `${p}–${q + W}`); }
if (a.includes('--bars')) env.forEach((d, i) => console.log(String(i * W).padStart(3), d.toFixed(0).padStart(4), '#'.repeat(Math.max(0, Math.round((d + 50) / 1.5)))));
console.log(a.includes('--json') ? JSON.stringify(out) : `contrast ${out.contrast} dB · rise ${out.rise} dB · endDrop ${out.endDrop} dB · swells ${out.swells} (${out.swellAt.join(', ')} s) (p50 ${out.p50}, p95 ${out.p95}, card ${card}s)`);
