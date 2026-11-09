// Re-time a script's `at` values from its words — after the text changes, before the voice exists (then sound/place.json wins).
//   node motion/films/script-retime.mjs <film> [--write] [--pace 4.9] [--gap 0.7] [--quote-hold 1.2] [--part-gap 1.4] [--title 2.6] [--end 4.5]
// Each voiced line gets syllables/pace seconds, then a gap (longer after a quote — the screen text stays to be read — and at a part
// change). A label right before a voiced line (a small caption over a quote) appears with it; a standalone label (the title) holds
// --title seconds; the end-card labels hold --end seconds and set `dur`. Prints old → new and the total; --write saves script.json.
// Pace 4.9 syl/s = the voice as measured in 「메시아」 (script-stats quotes 4.65–5.14/s, 2026-11-09).
// Why: 「그리스도」 2차 리뷰(2026-11-09) — after edits the old `at`s left N16 at 7+ syllables/s and the end card on screen 1.6 s.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2);
const num = (k, d) => { const i = args.indexOf(k); return i > -1 ? +args.splice(i, 2)[1] : d; };
const write = args.includes('--write'); if (write) args.splice(args.indexOf('--write'), 1);
const P = { pace: num('--pace', 4.9), gap: num('--gap', 0.7), qhold: num('--quote-hold', 1.2), pgap: num('--part-gap', 1.4), title: num('--title', 2.6), end: num('--end', 4.5) };
const film = args[0]; if (!film) { console.error('usage: script-retime.mjs <film> [--write] [--pace N] …'); process.exit(1); }
const F = join(HERE, film, 'script.json'), s = JSON.parse(readFileSync(F, 'utf8').replace(/^﻿/, ''));
const syl = t => (t || '').match(/[가-힣]/g)?.length || 0;
const spoken = l => (l.kind === 'narr' || l.kind === 'quote') && l.voice !== null ? (l.voice ?? l.text) : null;
const L = s.lines.map((l, i) => ({ l, i })).sort((a, b) => (a.l.at ?? 0) - (b.l.at ?? 0) || a.i - b.i).map(x => x.l);
const lastAt = Math.max(...L.map(l => l.at ?? 0)), ends = new Set(L.filter(l => l.kind === 'label' && (l.at ?? 0) >= lastAt - 0.01)), isEnd = l => ends.has(l);
let t = L[0]?.at ?? 0.3; const rows = [];
for (let k = 0; k < L.length; k++) {
  const l = L[k], old = l.at, next = L[k + 1];
  if (spoken(l) == null) {
    if (isEnd(l)) { l.at = +t.toFixed(1); rows.push([l.id, old, l.at, 'end']); continue; }
    const nv = L.slice(k + 1).find(x => spoken(x) != null), caption = nv && Math.abs((nv.at ?? 0) - (old ?? 0)) <= 0.6;
    l.at = +t.toFixed(1); rows.push([l.id, old, l.at, caption ? 'caption' : 'hold']);
    if (caption) t += 0.2; else t += P.title;
    continue;
  }
  const n = syl(spoken(l)), sec = n / P.pace, extra = l.kind === 'quote' ? Math.max(P.qhold, (syl(l.text) - n) / 6) : P.gap;
  const after = next && next.part !== l.part ? Math.max(extra, P.pgap) : extra;
  l.at = +t.toFixed(1); rows.push([l.id, old, l.at, `${n}음절 ${sec.toFixed(1)}s +${after.toFixed(1)}`]);
  t += sec + after;
}
const endAt = Math.max(...L.filter(isEnd).map(l => l.at)), dur = Math.ceil(endAt + P.end);
for (const [id, o, nw, why] of rows) console.log(`${id.padEnd(4)} ${String(o).padStart(6)} → ${String(nw).padStart(6)}  ${why}`);
console.log(`길이 ${s.dur} → ${dur}초 (끝 화면 ${endAt}초부터 ${P.end}초)${dur >= 180 ? ' — 3분 넘음: 줄이거나 --pace/--gap 조정' : ''}`);
if (write) { s.dur = dur; writeFileSync(F, JSON.stringify(s, null, 1) + '\n'); console.log('저장: ' + F); }
