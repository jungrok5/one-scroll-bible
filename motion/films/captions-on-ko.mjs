// Another language's captions timed to a video's own narration (관리자 결정 2026-11-01: every reviewed caption language goes on
// the Korean upload AND on the international one, even without a voice track in that language).
// The text is that language's lines (the same words as its voice track would say — the '…' rule as in sound.mjs); the times are
// the cues of the video's narration: --timing ko (default) = sound/ko.vtt, the Korean video; --timing en = sound/en.vtt, the
// international (English-voiced) video.
//   node motion/films/captions-on-ko.mjs <film> <lang…> [--timing ko|en]   → sound/<lang>.<timing>-timing.vtt
// then: node motion/youtube/yt-api.mjs caption-file <video id> <that file> <lang>   (YT_AS=GLOBAL for the international one)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2), ti = args.indexOf('--timing');
const timing = ti > -1 ? args.splice(ti, 2)[1] : 'ko', [film, ...langs] = args, S = join(HERE, film, 'sound');
const json = f => JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));
const place = json(join(S, timing === 'ko' ? 'place.json' : `place-${timing}.json`)), K = Object.fromEntries(json(join(HERE, film, 'script.json')).lines.map(l => [l.id, l]));
// the cue order sound.mjs wrote: every narration line by its start, plus the silent on-screen verses (subs_extra)
const order = [...Object.entries(place.at).map(([id, a]) => [id, a]), ...Object.entries(place.subs_extra || {}).map(([id, [a]]) => [id, a])]
  .sort((p, q) => p[1] - q[1]).map(([id]) => id);
const cues = readFileSync(join(S, timing + '.vtt'), 'utf8').split(/\r?\n\r?\n/).filter(b => /-->/.test(b)).map(b => b.split(/\r?\n/).find(l => l.includes('-->')));
if (cues.length !== order.length) throw new Error(`${timing}.vtt has ${cues.length} cues, place has ${order.length} lines — run sound.mjs ${film}${timing === 'ko' ? '' : ' v --lang ' + timing} first`);
for (const L of langs) {
  const P = json(join(HERE, film, 'i18n', L + '.json'));
  const txt = id => { const k = K[id]; if (!P[id]) throw new Error(`${L}: no line ${id}`); let t = P[id].voice || P[id].text;
    if (k.voice && k.text.includes('…') && !P[id].voice && id in place.at) t = t.slice(t.lastIndexOf('…') + 1).trim();
    return t.replace(/\s*\/\s*/g, '\n'); };
  const out = join(S, `${L}.${timing}-timing.vtt`);
  writeFileSync(out, 'WEBVTT\n\n' + order.map((id, i) => `${cues[i]}\n${txt(id)}\n`).join('\n'));
  console.log('→', out);
}
