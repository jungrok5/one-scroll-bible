// Another language's captions timed to the KOREAN video (관리자 결정 2026-11-01: the Korean upload also carries every reviewed
// caption language). The text is that language's narration lines (the same words as its own voice track and sound/<lang>.vtt),
// the times are the Korean cues (sound/ko.vtt — the Korean narration), so the captions follow the Korean voice and pictures.
//   node motion/films/captions-on-ko.mjs <film> <lang…>   → sound/<lang>.ko-timing.vtt
// then: node motion/youtube/yt-api.mjs caption-file <Korean video id> <that file> <lang>
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), [film, ...langs] = process.argv.slice(2), S = join(HERE, film, 'sound');
const json = f => JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));
const place = json(join(S, 'place.json')), K = Object.fromEntries(json(join(HERE, film, 'script.json')).lines.map(l => [l.id, l]));
// the cue order sound.mjs wrote: every narration line by its start, plus the silent on-screen verses (subs_extra)
const order = [...Object.entries(place.at).map(([id, a]) => [id, a]), ...Object.entries(place.subs_extra || {}).map(([id, [a]]) => [id, a])]
  .sort((p, q) => p[1] - q[1]).map(([id]) => id);
const cues = readFileSync(join(S, 'ko.vtt'), 'utf8').split(/\r?\n\r?\n/).filter(b => /-->/.test(b)).map(b => b.split(/\r?\n/).find(l => l.includes('-->')));
if (cues.length !== order.length) throw new Error(`ko.vtt has ${cues.length} cues, place.json ${order.length} lines — run sound.mjs ${film} first`);
for (const L of langs) {
  const P = json(join(HERE, film, 'i18n', L + '.json'));
  const txt = id => { const k = K[id]; let t = P[id].voice || P[id].text;
    if (k.voice && k.text.includes('…') && !P[id].voice && id in place.at) t = t.slice(t.lastIndexOf('…') + 1).trim();
    return t.replace(/\s*\/\s*/g, '\n'); };
  const out = join(S, `${L}.ko-timing.vtt`);
  writeFileSync(out, 'WEBVTT\n\n' + order.map((id, i) => `${cues[i]}\n${txt(id)}\n`).join('\n'));
  console.log('→', out);
}
