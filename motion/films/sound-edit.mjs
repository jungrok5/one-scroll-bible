// Sound edits a film's re-cut needs, made from a spec file instead of one-off commands (「메시아」 4차, 2026-11-07, lived only
// in a session until 2026-11-08). Run from the repo root; every command works in motion/films/<film>/sound/.
//
//   node motion/films/sound-edit.mjs silences <film> <id…> [--min 0.1]
//        pauses inside voice/<id>.mp3 (or voice-v*/), to pick the verse-piece boundaries for `gaps`
//   node motion/films/sound-edit.mjs gaps <film> <spec.json>
//        a verse read too fast: widen the pause at each piece boundary to spec.gap seconds (default .8) →
//        voice/<id>.mp3 rebuilt from lines[id].src, and pieces.json { id: { dur, pieceStarts } } — film.html uses
//        pieceStarts (+ the line's at) as Film.quote's `cuts`, so the words turn with the voice
//   node motion/films/sound-edit.mjs remap <film> <spec.json>
//        a re-timed cut: cues.json sfx (and ducks) moved by the piecewise-linear map spec.anchors [[old, new], …]
//        (the same map the scenes got), from spec.from (e.g. cues-v3.json); spec.drop = ids removed, spec.fix = {id: at}
//   node motion/films/sound-edit.mjs dewhine <film> <id…> [--hz 15600]
//        a steady high whine in an effect (a 15.6 kHz line in ElevenLabs rushes): low-pass 11 kHz + band-reject →
//        audio/<id>lp.mp3, and the band's level before → after. Point the cue's file at the lp copy.
//   node motion/films/sound-edit.mjs stretch <film> <id> <factor>
//        a music cue that must last longer: atempo (0.8–1.25 keeps the pitch) → audio/<id>s.mp3 + its length
//
// Spec example: motion/films/messiah/sound/edit-4.json (gaps + remap of the 4th cut).
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const [cmd, film, ...rest] = process.argv.slice(2);
const usage = () => { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).slice(2, 21).join('\n')); process.exit(1); };
if (!cmd || !film) usage();
const DIR = join('motion', 'films', film, 'sound'); if (!existsSync(DIR)) { console.log('no', DIR); process.exit(1); }
const P = f => join(DIR, f), sh = c => execSync(c, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const dur = f => +sh(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`);
const opt = (k, d) => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : d; };
const spec = () => JSON.parse(readFileSync(rest[0], 'utf8'));
const save = (f, o) => writeFileSync(P(f), JSON.stringify(o, null, 1) + '\n');

if (cmd === 'silences') {
  const min = +opt('min', .1);
  for (const id of rest.filter((a, i) => !a.startsWith('--') && rest[i - 1] !== '--min')) {
    const f = [`voice/${id}.mp3`, ...['voice-v3', 'voice-v1'].map(d => `${d}/${id}.mp3`)].map(P).find(existsSync); if (!f) { console.log(id, 'no file'); continue; }
    const log = execSync(`ffmpeg -hide_banner -i "${f}" -af silencedetect=n=-38dB:d=${min} -f null - 2>&1`, { shell: true }).toString();
    const s = [...log.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map(m => [+m[1], +m[2]]);
    console.log(id, f.split(/[\\/]/).slice(-2).join('/'), dur(f).toFixed(2) + 's', s.map(([a, b]) => `[${a.toFixed(3)}, ${b.toFixed(3)}]`).join(' '));
  }
} else if (cmd === 'gaps') {
  const S = spec(), GAP = S.gap ?? .8, out = existsSync(P('pieces.json')) ? JSON.parse(readFileSync(P('pieces.json'), 'utf8')) : {};
  for (const [id, L] of Object.entries(S.lines)) {
    const src = P(L.src || `voice/${id}.mp3`), tmp = P(`voice/_${id}.wav`);
    sh(`ffmpeg -v error -y -i "${src}" -ar 44100 -ac 1 "${tmp}"`);
    const D = dur(tmp), parts = [], starts = [0]; let cut = 0, shift = 0;
    for (const [s, e] of L.bounds) { const m = (s + e) / 2, add = Math.max(0, GAP - (e - s)); parts.push([cut, m, add]); cut = m; shift += add; starts.push(+(e + shift).toFixed(3)); }
    parts.push([cut, D, 0]);
    const f = parts.map(([a, b, add], i) => `[0]atrim=${a}:${b},asetpts=PTS-STARTPTS,apad=pad_dur=${add}[p${i}]`).join(';') + ';' + parts.map((_, i) => `[p${i}]`).join('') + `concat=n=${parts.length}:v=0:a=1[o]`;
    sh(`ffmpeg -v error -y -i "${tmp}" -filter_complex "${f}" -map "[o]" -c:a libmp3lame -b:a 192k "${P(`voice/${id}.mp3`)}"`); rmSync(tmp);
    out[id] = { dur: +dur(P(`voice/${id}.mp3`)).toFixed(3), pieceStarts: starts }; console.log(id, JSON.stringify(out[id]));
  }
  save('pieces.json', out); console.log('→ pieces.json; film.html cuts = line at + pieceStarts[1…]');
} else if (cmd === 'remap') {
  const S = spec(), c = JSON.parse(readFileSync(P(S.from || 'cues.json'), 'utf8')), A = S.anchors;
  const map = t => { for (let i = 0; i < A.length - 1; i++) { const [a0, b0] = A[i], [a1, b1] = A[i + 1]; if (t <= a1) return +(b0 + (t - a0) * (b1 - b0) / (a1 - a0)).toFixed(2); } return t; };
  const drop = new Set(S.drop || []), fix = S.fix || {};
  c.sfx = c.sfx.filter(q => !drop.has(q.id)).map(q => ({ ...q, at: fix[q.id] ?? map(q.at) }));
  if (S.ducks !== false && c.ducks) c.ducks = c.ducks.map(d => ({ ...d, from: map(d.from), to: map(d.to) }));
  if (S.dur) c.dur = S.dur;
  const to = opt('out', 'cues.json'); if (!rest.includes('--dry')) save(to, c); for (const q of c.sfx) console.log(q.id, q.at);
  console.log(`${rest.includes('--dry') ? '(dry) ' : ''}→ ${to} (${c.sfx.length} sfx; --out other.json to keep cues.json, --dry to only print). Music cues are NOT moved — set c.music by hand to fit the new parts, then film.mjs check.`);
} else if (cmd === 'dewhine') {
  const hz = +opt('hz', 15600), band = f => (execSync(`ffmpeg -hide_banner -i "${f}" -af "bandpass=f=${hz}:width_type=h:w=300,volumedetect" -f null - 2>&1`, { shell: true }).toString().match(/mean_volume: ([-\d.]+)/) || [])[1];
  for (const id of rest.filter(a => !a.startsWith('--') && a !== opt('hz'))) {
    const src = P(`audio/${id}.mp3`), dst = P(`audio/${id}lp.mp3`); if (!existsSync(src)) { console.log(id, 'no audio file'); continue; }
    sh(`ffmpeg -v error -y -i "${src}" -af "lowpass=f=11000,lowpass=f=11000,bandreject=f=${hz}:width_type=h:w=800" -c:a libmp3lame -b:a 192k "${dst}"`);
    console.log(id, `${hz} Hz band ${band(src)} → ${band(dst)} dB`, '→', dst.replace(/\\/g, '/'));
  }
} else if (cmd === 'stretch') {
  const [id, k] = rest, src = P(`audio/${id}.mp3`), dst = P(`audio/${id}s.mp3`); if (!existsSync(src) || !(+k > .5 && +k < 2)) usage();
  sh(`ffmpeg -v error -y -i "${src}" -af "atempo=${k}" -c:a libmp3lame -b:a 192k "${dst}"`);
  console.log(id, dur(src).toFixed(1) + 's ×1/' + k, '→', dur(dst).toFixed(1) + 's', dst.replace(/\\/g, '/'));
} else usage();
