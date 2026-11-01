// Fit one language's narration into the picture's timing (the film's timeline is the same in every language).
//   node motion/films/fit-voice.mjs <film> <lang>
// Reads sound/place.json (the Korean start times = where each line's words appear on screen) and the takes in
// sound/takes-<lang>/<lineId>-<a|b>.mp3 (fetch-takes.mjs). For every line, in film order:
//   1. take: the first take that fits its room, else the shorter one;
//   2. start: at the Korean start (or place.sync_start — a line whose first word lands on a picture beat), later if the
//      previous line runs on; if too long, up to LEAD s earlier — never into the previous line or a voice-free beat;
//   3. room: until the next line's start pushed at most PUSH s late, and never into a voice-free beat (place.quiet);
//   4. still too long → long pauses inside the take squeezed (SQUEEZE), then speed-up (atempo) up to MAXT.
// Writes sound/place-<lang>.json { dur, at, take, squeeze, tempo, subs_extra } — read by sound.mjs <film> <v|h> --lang <lang>.
// Lines that still do not fit are listed: shorten that language's voice text (a 'voice' subset of 'text', as the Korean line 01 does).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), [film, lang] = process.argv.slice(2);
const S = join(HERE, film, 'sound'), T = join(HERE, '..', 'out', `${film}-fit-${lang}`); mkdirSync(T, { recursive: true });
const json = f => JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));
const place = json(join(S, 'place.json')), ids = Object.keys(place.at).sort((a, b) => place.at[a] - place.at[b]);
const LEAD = 1.0, PUSH = 2.0, GAP = 0.15, MAXT = 1.12;
const QUIET = place.quiet || [], SYNC = place.sync_start || {};
export const TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.10,areverse';
export const SQUEEZE = 'silenceremove=stop_periods=-1:stop_duration=0.28:stop_threshold=-42dB:stop_silence=0.22';
const len = (f, sq) => { const w = join(T, f.split(/[\\/]/).pop().replace('.mp3', sq ? '-sq.wav' : '.wav'));
  if (!existsSync(w)) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', f, '-af', sq ? `${TRIM},${SQUEEZE}` : TRIM, '-ac', '1', '-ar', '48000', w]);
  return +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', w], { encoding: 'utf8' }).trim(); };
const quietIn = (a, b) => QUIET.find(([q0, q1]) => a < q1 && b > q0);
// a line that still overflows takes room from the line before it: rerun with that one sped up to MAXT
let out, bad, over, force = {}, log;
// (and starts as early as it may, so the room it frees reaches the overflowing line); repeated up the chain if needed
for (let pass = 0; pass < 12; pass++) {
  ({ out, bad, over, log } = fit(force)); if (!over.length) break;
  let moved = false;
  over.forEach(i => { for (let j = i - 1; j >= 0 && j >= i - 3; j--) if (!force[ids[j]]) { force[ids[j]] = true; moved = true; break; } });
  if (!moved) break;
}
console.log(log.join('\n'));
writeFileSync(join(S, `place-${lang}.json`), JSON.stringify(out, null, 1) + '\n');
console.log(bad.length ? 'DOES NOT FIT:\n  ' + bad.join('\n  ') : `all ${ids.length} lines fit → sound/place-${lang}.json`);

function fit(force) {
const out = { dur: place.dur, at: {}, take: {}, squeeze: {}, tempo: {}, subs_extra: place.subs_extra || {} }, bad = [], over = [], log = [];
let prevEnd = 0;
ids.forEach((id, i) => {
  const at0 = SYNC[id] ?? place.at[id], nextAt = ids[i + 1] ? (SYNC[ids[i + 1]] ?? place.at[ids[i + 1]]) : place.dur - 0.3;
  const files = ['a', 'b', 'c', 'd'].map(k => join(S, 'takes-' + lang, `${id}-${k}.mp3`)).filter(existsSync);
  if (!files.length) throw new Error(`no take for ${lang} ${id}`);
  const takes = files.map(f => ({ f, k: f.slice(-5, -4), d: len(f) }));
  let start = Math.max(at0, prevEnd + GAP);
  // latest end: the next line's start pushed at most PUSH (a synced next line is not pushed), and before the next quiet beat
  const endCap = s => { let e = nextAt + (SYNC[ids[i + 1]] ? 0 : PUSH) - GAP; const q = QUIET.filter(([q0]) => q0 >= s).sort((a, b) => a[0] - b[0])[0]; if (q) e = Math.min(e, q[0] - GAP); return e; };
  const room = s => endCap(s) - s;
  let t = takes.find(x => x.d <= room(start)) || takes.reduce((p, q) => q.d < p.d ? q : p), d = t.d, sq = false, tempo = 1;
  if ((d > room(start) || force[id]) && !SYNC[id]) {   // start earlier, but not into the previous line or a quiet beat
    let s = Math.max(prevEnd + GAP, at0 - LEAD); while (s < start && quietIn(s, s + 0.01)) s += 0.05;
    start = Math.min(start, s);
  }
  if (d > room(start)) { const d2 = len(t.f, true); if (d2 < d - 0.05) { d = d2; sq = true; } }
  if (d > room(start) || force[id]) tempo = force[id] ? MAXT : Math.min(MAXT, d / room(start));
  const spoken = d / tempo, end = start + spoken;
  if (quietIn(start, end)) bad.push(`${id}: runs into a voice-free beat (${start.toFixed(2)}–${end.toFixed(2)})`);
  if (end > endCap(start) + 0.01) { over.push(i); bad.push(`${id}: ${(end - endCap(start)).toFixed(2)} s too long even squeezed at ×${MAXT} (take ${t.k} ${t.d.toFixed(2)} s, room ${room(start).toFixed(2)} s)`); }
  out.at[id] = +start.toFixed(2); out.take[id] = t.k; if (sq) out.squeeze[id] = true; if (tempo > 1.001) out.tempo[id] = +tempo.toFixed(3);
  const late = start - place.at[id];
  log.push(`${id.padEnd(4)} ko@${place.at[id].toFixed(1).padStart(5)} → ${start.toFixed(2).padStart(6)}${Math.abs(late) > 0.3 ? ` (${late > 0 ? '+' : ''}${late.toFixed(1)})` : ''}  take ${t.k} ${t.d.toFixed(2)}s${sq ? ` squeezed ${d.toFixed(2)}s` : ''}${tempo > 1.001 ? ` ×${tempo.toFixed(2)}` : ''}  ends ${end.toFixed(2)}  (next ${nextAt.toFixed(1)})`);
  prevEnd = end;
});
return { out, bad, over, log };
}
