// Merge per-scene translations motion/pilot/i18n/<lang>/<scene>.json ({"한국어": "translation"})
// into the file the scenes load: motion/pilot/i18n/<lang>.json ({ _dir, <scene>: {…} }).
//   node motion/i18n-merge.mjs en      (no argument = every language folder)
import { readdirSync, readFileSync, writeFileSync, renameSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), base = join(here, 'pilot', 'i18n');
const langs = process.argv.slice(2).length ? process.argv.slice(2)
  : readdirSync(base).filter(d => !d.startsWith('_') && statSync(join(base, d)).isDirectory());
for (const lang of langs) {
  const site = join(here, '..', 'i18n', lang + '.json');
  const out = { _dir: existsSync(site) ? (JSON.parse(readFileSync(site, 'utf8')).dir || 'ltr') : 'ltr' };
  for (const f of readdirSync(join(base, lang)).filter(f => f.endsWith('.json')).sort())
    out[f.slice(0, -5)] = JSON.parse(readFileSync(join(base, lang, f), 'utf8'));
  const dst = join(base, lang + '.json'), tmp = dst + '.' + process.pid;
  writeFileSync(tmp, JSON.stringify(out, null, 1) + '\n'); renameSync(tmp, dst);
  console.log(`→ ${lang}.json · ${Object.keys(out).length - 1} scenes`);
}
