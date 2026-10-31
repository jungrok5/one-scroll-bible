// Captions for the Korean narrated cut (wrEYqvOU1O8): every narration line of ko.json at its start time t, as WebVTT placed at
// the TOP of the picture (the film's own words sit mostly at the bottom). A quarter of that video's views had captions on and got
// YouTube's automatic ones (2026-10-31, motion/films/ANALYTICS.md) — this gives them the exact text, Scripture included.
// The t values match where YouTube's automatic captions heard each line (checked 2026-10-31, within ~0.1 s).
//   node motion/narration/captions.mjs   → motion/narration/ko-narr.vtt
//   node motion/youtube/yt-api.mjs caption-file wrEYqvOU1O8 motion/narration/ko-narr.vtt ko
// --shorts: the same cues cut for each narrated Short (one scene each). A Short starts at its scene's start in the film
// (film/story/index.html `scenes`, durations summed) + motion/youtube/shorts-open.json `skip` (default 1.0, cross 0,
// rise 4.0) and lasts the scene minus the skip.
//   node motion/narration/captions.mjs --shorts   → motion/narration/shorts/NN.vtt (NN = 01–21, scene order)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..', '..'), RATE = 4.2, PAUSE = 0.35;
const { lines } = JSON.parse(readFileSync(join(HERE, 'ko.json'), 'utf8'));
const ts = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
// spoken length the way check.mjs estimates it: syllables at RATE per second + a pause at each comma / full stop
const says = t => (t.match(/[가-힣0-9]/g) || []).length / RATE + (t.match(/[,.?!…]/g) || []).length * PAUSE;
const cues = lines.map((l, i) => { const next = lines[i + 1]?.t ?? l.t + 15; return { a: l.t, b: Math.min(l.t + says(l.text) + 0.7, next - 0.05, l.t + 15), text: l.text }; });   // (long lines: up to 15 s — an 8 s cap cut them ~5 s before the voice ended)
const vtt = cs => 'WEBVTT\n\n' + cs.map(c => `${ts(c.a)} --> ${ts(c.b)} line:6% position:50% align:center\n${c.text}\n`).join('\n');

if (!process.argv.includes('--shorts')) {
  writeFileSync(join(HERE, 'ko-narr.vtt'), vtt(cues));
  console.log(`${cues.length} cues → motion/narration/ko-narr.vtt`);
} else {
  const page = readFileSync(join(ROOT, 'film', 'story', 'index.html'), 'utf8');
  const scenes = [...page.matchAll(/\['(\w+)','[^']*',([\d.]+)\]/g)].map(m => ({ id: m[1], dur: +m[2] }));
  const open = JSON.parse(readFileSync(join(ROOT, 'motion', 'youtube', 'shorts-open.json'), 'utf8'));
  mkdirSync(join(HERE, 'shorts'), { recursive: true });
  let at = 0;
  scenes.forEach((s, i) => {
    const skip = open.scenes[s.id] ?? open.default, a = at + skip, b = at + s.dur, len = b - a; at += s.dur;
    const cs = cues.filter(c => c.a >= b - s.dur - .1 && c.b > a + .2 && c.a < b - .3)   // this scene's lines only (a long line of the scene before may run past the cut)
      .map(c => ({ a: Math.max(0, c.a - a), b: Math.min(len, c.b - a), text: c.text }));
    const nn = String(i + 1).padStart(2, '0');
    writeFileSync(join(HERE, 'shorts', nn + '.vtt'), vtt(cs));
    console.log(`${nn} ${s.id.padEnd(10)} film ${a.toFixed(1)}–${b.toFixed(1)} s (${len.toFixed(1)} s): ${cs.length} cues, first at ${cs[0] ? cs[0].a.toFixed(1) : '-'} s`);
  });
}
