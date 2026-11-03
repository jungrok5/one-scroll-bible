// Word-level sync (after mromidev/claude-animated-shorts: "every visual reaction lands 0–3 frames before its word").
// The narration's word timings (sound/words-<lang>.json — a speech-to-text of motion/out/<film>-voice.wav, ElevenLabs Scribe)
// decide when each gold word lights (TEXT `hlAt` in film.html) and when its sound (the E3* "gold word" effect in cues.json)
// plays, instead of a hand-typed number. Lines without a voice keep their hand timing.
//   node motion/films/word-sync.mjs <film> [--write] [--json]     (--write: set hlAt in film.html and the E3* cue times)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const args = process.argv.slice(2), film = args[0], WRITE = args.includes('--write'), JSONOUT = args.includes('--json'), LEAD = 0.05;   // 1.5 frames before the word
const d = join('motion/films', film), wf = join(d, 'sound/words-ko.json');
if (!film || !existsSync(wf)) { console.error(`${wf} 없음 — motion/out/${film}-voice.wav를 받아쓰기(Scribe)해 words 배열을 저장`); process.exit(1); }
const words = (JSON.parse(readFileSync(wf, 'utf8')).words || []).filter(w => w.type !== 'spacing'), S = JSON.parse(readFileSync(join(d, 'script.json'), 'utf8')), lines = Array.isArray(S) ? S : S.lines;
let html = readFileSync(join(d, 'film.html'), 'utf8'); const cuesF = join(d, 'sound/cues.json'), cues = existsSync(cuesF) ? JSON.parse(readFileSync(cuesF, 'utf8')) : null;
const norm = s => s.replace(/[^\p{L}\p{N}]/gu, '');
const out = [];
for (const l of lines.filter(l => l.hl && l.kind === 'quote' && l.voice !== null)) {
  const re = new RegExp(`\\['quote', '${l.id}', ([\\d.]+), ([\\d.]+), (QB\\(\\)|\\{[^\\]]*?\\})\\]`), m = html.match(re); if (!m) { out.push({ id: l.id, hl: l.hl, note: 'TEXT에 이 줄이 없다' }); continue; }
  const a = +m[1], b = +m[2], cur = (m[3].match(/hlAt: ([\d.]+)/) || [])[1];
  const win = words.filter(w => w.start >= a - 1 && w.start <= b + 1); let str = '', map = [];
  for (const w of win) { const n = norm(w.text); for (let k = 0; k < n.length; k++) map.push(w); str += n; }
  const at = str.indexOf(norm(l.hl)); if (at < 0) { out.push({ id: l.id, hl: l.hl, note: '해설에서 이 말을 찾지 못했다(받아쓰기 확인)' }); continue; }
  const spoken = map[at].start, want = +(spoken - LEAD).toFixed(2), delta = cur != null ? +(+cur - want).toFixed(2) : null;
  out.push({ id: l.id, hl: l.hl, spoken, hlAt: cur != null ? +cur : null, want, delta });
  if (WRITE) { const obj = m[3] === 'QB()' ? `{ ...QB(), hlAt: ${want} }` : cur != null ? m[3].replace(/hlAt: [\d.]+/, `hlAt: ${want}`) : m[3].replace(/\}$/, `, hlAt: ${want} }`);
    html = html.replace(m[0], `['quote', '${l.id}', ${m[1]}, ${m[2]}, ${obj}]`);
    if (cues) { const near = cues.sfx.filter(q => /^E3/.test(q.id) && cur != null && Math.abs(q.at - +cur) < .7).sort((x, y) => Math.abs(x.at - +cur) - Math.abs(y.at - +cur))[0];
      if (near) near.at = want; else cues.sfx.push({ id: 'E3' + l.id, file: 'motion/films/' + film + '/sound/audio/E3.mp3', at: want, len: 1.8, db: -11 }); } }
}
if (WRITE) { writeFileSync(join(d, 'film.html'), html); if (cues) { cues.sfx.sort((x, y) => x.at - y.at); writeFileSync(cuesF, JSON.stringify(cues, null, 1).replace(/\{\n\s+"(id|from)"[\s\S]*?\n\s+\}/g, s => s.replace(/\n\s+/g, ' ')) + '\n'); } }
if (JSONOUT) { console.log(JSON.stringify(out)); process.exit(0); }
for (const o of out) console.log(o.note ? `  ${o.id} 「${o.hl}」 — ${o.note}` : `  ${o.id} 「${o.hl}」 말 ${o.spoken}s · 금빛 ${o.hlAt ?? '없음'} → ${o.want}${o.delta != null ? ` (${o.delta > 0 ? '+' : ''}${o.delta}s)` : ''}`);
if (WRITE) console.log('film.html hlAt · cues.json E3* 고침');
