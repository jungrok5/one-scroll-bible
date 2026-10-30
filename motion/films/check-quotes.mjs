// Every quote line of a film script must be an exact fragment of 개역개정 (fetched live from bskorea via krv.mjs).
//   node motion/films/check-quotes.mjs silence400
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const s = JSON.parse(readFileSync(join(HERE, process.argv[2], 'script.json'), 'utf8'));
const Q = s.lines.filter(l => l.kind === 'quote');
const expand = u => { const m = u.match(/^(\w+)\.(\d+)\.(\d+)-(\d+)$/); if (!m) return [u]; const out = []; for (let v = +m[3]; v <= +m[4]; v++) out.push(`${m[1]}.${m[2]}.${v}`); return out; };
const refs = [...new Set(Q.flatMap(l => expand(l.usfm)))];
const out = execFileSync('node', [join(HERE, '..', 'narration', 'krv.mjs'), ...refs.map(r => r.toLowerCase())], { encoding: 'utf8' });
const V = Object.fromEntries(out.split(/\r?\n/).filter(Boolean).map(l => { const [k, t] = l.split('\t'); return [k.toUpperCase(), t]; }));
let bad = 0;
for (const l of Q) {
  const v = expand(l.usfm).map(u => V[u] || '').join(' '), parts = l.text.split(/\s*\/\s*|\s*…\s*/).map(x => x.trim()).filter(Boolean);
  const miss = parts.filter(p => !v.includes(p)),vmiss = l.voice && !v.includes(l.voice);
  if (miss.length || vmiss) bad++;
  console.log(l.id, l.usfm, miss.length || vmiss ? `MISMATCH ${JSON.stringify(miss)}${vmiss ? ' voice' : ''}` : 'ok');
}
process.exit(bad ? 1 : 0);
