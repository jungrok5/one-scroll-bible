// A loop clip's captions: the film's sound/ko.vtt cut to the clip's span and shifted to start at 0 (clips.mjs makes the clips).
// Insight older-tv: Korean captions are always uploaded (a fifth of the long film's viewers turn them on).
//   node motion/films/clip-vtt.mjs <film>   → motion/out/<film>-clip-<id>.ko.vtt for every clip in motion/out/<film>-clips.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const film = process.argv[2], src = `motion/films/${film}/sound/ko.vtt`;
if (!film || !existsSync(src)) { console.error(`usage: clip-vtt.mjs <film> — ${src} 없음`); process.exit(1); }
const sec = s => { const [h, m, x] = s.split(':'); return +h * 3600 + +m * 60 + +x; }, fmt = t => { t = Math.max(0, t); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = (t % 60).toFixed(3).padStart(6, '0'); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s}`; };
const blocks = readFileSync(src, 'utf8').replace(/\r/g, '').split(/\n\n+/), head = blocks[0].startsWith('WEBVTT') ? blocks.shift() : 'WEBVTT';
const cues = blocks.map(b => { const L = b.split('\n'), i = L.findIndex(l => l.includes('-->')); if (i < 0) return null; const m = L[i].match(/([\d:.]+)\s*-->\s*([\d:.]+)(.*)/); return { a: sec(m[1]), b: sec(m[2]), set: m[3], text: L.slice(i + 1).join('\n') }; }).filter(Boolean);
for (const c of JSON.parse(readFileSync(`motion/out/${film}-clips.json`, 'utf8'))) {
  const keep = cues.filter(q => Math.min(q.b, c.to) - Math.max(q.a, c.from) >= .5)   /* a line cut to a sliver at either end is dropped */.map(q => `${fmt(Math.max(q.a, c.from) - c.from)} --> ${fmt(Math.min(q.b, c.to) - c.from)}${q.set}\n${q.text}`);
  const out = `motion/out/${film}-clip-${c.id}.ko.vtt`; writeFileSync(out, `${head}\n\n${keep.join('\n\n')}\n`); console.log(`${out}  ${keep.length} cues`);
}
