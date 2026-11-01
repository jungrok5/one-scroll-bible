// Every quote line of a film script must be an exact fragment of that language's Bible.
//   node motion/films/check-quotes.mjs silence400          → script.json against 개역개정 (bskorea via krv.mjs)
//   node motion/films/check-quotes.mjs silence400 es       → i18n/es.json against its "_yv" YouVersion edition (fetch-verse.mjs)
// Whitespace and curly/straight quote marks are ignored (YouVersion drops the spaces at poetry line breaks).
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), [film, lang = 'ko'] = process.argv.slice(2);
const s = JSON.parse(readFileSync(join(HERE, film, 'script.json'), 'utf8'));
const L = lang === 'ko' ? null : JSON.parse(readFileSync(join(HERE, film, 'i18n', lang + '.json'), 'utf8'));
const Q = s.lines.filter(l => l.kind === 'quote').map(l => (L ? { ...l, voice: null, ...(L[l.id] || {}), usfm: (L[l.id] || {}).usfm || l.usfm } : l));   // a language file brings its own voice (or none)
const expand = u => { const m = u.match(/^(\w+)\.(\d+)\.(\d+)-(\d+)$/); if (!m) return [u]; const out = []; for (let v = +m[3]; v <= +m[4]; v++) out.push(`${m[1]}.${m[2]}.${v}`); return out; };
const refs = [...new Set(Q.flatMap(l => expand(l.usfm)))];
let V;
if (!L) { const out = execFileSync('node', [join(HERE, '..', 'narration', 'krv.mjs'), ...refs.map(r => r.toLowerCase())], { encoding: 'utf8' });
  V = Object.fromEntries(out.split(/\r?\n/).filter(Boolean).map(l => { const [k, t] = l.split('\t'); return [k.toUpperCase(), t]; })); }
else { if (!L._yv) { console.error('i18n/' + lang + '.json has no "_yv" (YouVersion edition id)'); process.exit(1); }
  const out = execFileSync('node', [join(HERE, '..', '..', '.claude', 'skills', 'add-language', 'lib', 'fetch-verse.mjs'), String(L._yv), refs.join(',')], { encoding: 'utf8' });
  V = Object.fromEntries(out.split(/\r?\n/).filter(Boolean).map(l => { const [k, ...t] = l.split('\t'); return [k, t.join('\t')]; })); }
// a line may name another source of the SAME edition when YouVersion's copy lacks the verse ("src": "ebible:pesOPV" —
// 2026-11-01: YouVersion 136 (Persian Old Version) ends Malachi at 4:5); fetch-verse reads eBible.org for "ebible:<id>"
const SRC = {};
for (const l of Q.filter(q => q.src)) {
  const out = execFileSync('node', [join(HERE, '..', '..', '.claude', 'skills', 'add-language', 'lib', 'fetch-verse.mjs'), l.src, expand(l.usfm).join(',')], { encoding: 'utf8' });
  for (const line of out.split(/\r?\n/).filter(Boolean)) { const [k, ...t] = line.split('\t'); SRC[l.src + ' ' + k] = t.join('\t'); }
}
const verse = (l, u) => (l.src ? SRC[l.src + ' ' + u] : V[u]) || '';
// case is ignored too: fetch-verse flattens small capitals (LORD/TUHAN/SENHOR print as Lord/Tuhan/Senhor), and the films keep
// God's name as the Bible prints it (2026-11-01, id Isa 61:1 "Tuhan ALLAH … TUHAN")
const norm = x => x.replace(/[“”"‘’'«»]/g, '').replace(/\s+/g, '').toLowerCase();
let bad = 0;
for (const l of Q) {
  if (!l.text) { console.log(l.id, l.usfm, 'MISSING text'); bad++; continue; }
  const v = norm(expand(l.usfm).map(u => verse(l, u)).join(' ')), parts = [...l.text.split(/\s*\/\s*|\s*…\s*/), ...(l.frags || [])].map(x => x.trim()).filter(Boolean);   // frags: pieces shown one by one, each verbatim
  const miss = parts.filter(p => !v.includes(norm(p))), vmiss = l.voice && !v.includes(norm(l.voice.replace(/\s*\/\s*/g, ' '))), hmiss = l.hl && !l.text.includes(l.hl);
  if (miss.length || vmiss || hmiss) bad++;
  console.log(l.id, l.usfm + (l.src ? ` (${l.src})` : ''), miss.length || vmiss || hmiss ? `MISMATCH ${JSON.stringify(miss)}${vmiss ? ' voice' : ''}${hmiss ? ' hl not in text' : ''}` : 'ok');
}
process.exit(bad ? 1 : 0);
