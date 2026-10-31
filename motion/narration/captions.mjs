// Captions for the Korean narrated cut (wrEYqvOU1O8): every narration line of ko.json at its start time t, as WebVTT placed at
// the TOP of the picture (the film's own words sit mostly at the bottom). A quarter of that video's views had captions on and got
// YouTube's automatic ones (2026-10-31, motion/films/ANALYTICS.md) — this gives them the exact text, Scripture included.
// The t values match where YouTube's automatic captions heard each line (checked 2026-10-31, within ~0.1 s).
//   node motion/narration/captions.mjs   → motion/narration/ko-narr.vtt
//   node motion/youtube/yt-api.mjs caption-file wrEYqvOU1O8 motion/narration/ko-narr.vtt ko
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), RATE = 4.2, PAUSE = 0.35;
const { lines } = JSON.parse(readFileSync(join(HERE, 'ko.json'), 'utf8'));
const ts = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
// spoken length the way check.mjs estimates it: syllables at RATE per second + a pause at each comma / full stop
const says = t => (t.match(/[가-힣0-9]/g) || []).length / RATE + (t.match(/[,.?!…]/g) || []).length * PAUSE;
const cues = lines.map((l, i) => { const next = lines[i + 1]?.t ?? l.t + 8; return { a: l.t, b: Math.min(l.t + says(l.text) + 0.7, next - 0.05, l.t + 8), text: l.text }; });
writeFileSync(join(HERE, 'ko-narr.vtt'), 'WEBVTT\n\n' + cues.map(c => `${ts(c.a)} --> ${ts(c.b)} line:6% position:50% align:center\n${c.text}\n`).join('\n'));
console.log(`${cues.length} cues → motion/narration/ko-narr.vtt`);
