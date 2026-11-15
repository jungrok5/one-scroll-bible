// The translation brief for one film, from the template and the film's own script — so no session has to rebuild it by hand.
//   node motion/films/i18n-brief.mjs <film> [--point "<the film's key point, one or two lines>"] [--notes "<line notes>"]
// → motion/films/<film>/i18n/CAPTIONS-BRIEF.md (an existing brief keeps its hand-written {point}/{notes} unless new ones are given).
// Then send pipeline/briefs/translate.md per group of targets.json captions.groups, and pipeline/briefs/review-captions.md per group
// as each finishes (tasks/captions.md). First used for 「그리스도」 2026-11-15.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), a = process.argv.slice(2), film = a[0], opt = k => { const i = a.indexOf(k); return i < 0 ? null : a[i + 1]; };
if (!film) { console.error('usage: node motion/films/i18n-brief.mjs <film> [--point "…"] [--notes "…"]'); process.exit(1); }
const S = JSON.parse(readFileSync(join(HERE, film, 'script.json'), 'utf8')), L = S.lines || S, out = join(HERE, film, 'i18n', 'CAPTIONS-BRIEF.md');
const old = existsSync(out) ? readFileSync(out, 'utf8') : '', keep = (re, d) => (old.match(re) || [])[1]?.trim() || d;
const point = opt('--point') || keep(/2\. \*\*The film's key point\*\*[^\n]*\n   ([\s\S]*?)\n3\. /, 'TODO — write the key terms that must tie to the verses (e.g. 「그리스도」: Christ = Messiah = the Anointed One).');
const notes = opt('--notes') || keep(/at most two short lines per `\/` piece\.\n   ([\s\S]*?)\n4\. /, '(no line notes)');
const T = readFileSync(join(HERE, 'pipeline', 'briefs', 'captions-brief.md'), 'utf8');
const title = S.title || (L.find(l => l.id === 'T1') || {}).text || film;
const md = T.replaceAll('{film}', film).replaceAll('{title}', `「${title}」`)
  .replace('{narr}', L.filter(l => l.kind === 'narr').map(l => l.id).join(' '))
  .replace('{quotes}', L.filter(l => l.kind === 'quote').map(l => `${l.id} ${l.usfm}`).join(' · '))
  .replaceAll('{labels}', L.filter(l => l.kind === 'label' && l.id !== 'T1').map(l => l.id).join(' '))
  .replace('{point}', point).replace('{notes}', notes);
mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, md);
console.log('→', out, point.startsWith('TODO') ? '\n  ! fill the key point: --point "…"' : '');
