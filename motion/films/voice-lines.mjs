// What each language's narrator reads (README §4 step 2, the text sent to ElevenLabs): the line's own reviewed text from
// films/<film>/i18n/<lang>.json — quotes verbatim from that language's Bible — with '/' breaks removed. A line's `voice` wins;
// where the Korean voice reads only the part after '…' (line 01 of 「침묵의 400년」), so does every language.
//   node motion/films/voice-lines.mjs <film> <lang…>  → films/<film>/sound/voice-lines-<lang>.json ({id: text}) + a listing
// (2026-11-01: moved here from a scratch script used for the en/es/pt-BR dubs.)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [film, ...langs] = process.argv.slice(2);
if (!film || !langs.length) { console.log('usage: voice-lines.mjs <film> <lang…>'); process.exit(1); }
const D = join(dirname(fileURLToPath(import.meta.url)), film);
const j = f => JSON.parse(readFileSync(join(D, f), 'utf8').replace(/^﻿/, ''));
const s = j('script.json'), p = j('sound/place.json');
const ids = Object.keys(p.at).sort((a, b) => p.at[a] - p.at[b]);
for (const L of langs) {
  const pk = j(`i18n/${L}.json`), out = {};
  for (const id of ids) {
    const ko = s.lines.find(l => l.id === id); if (!pk[id]) { console.log(`${L} ${id}: MISSING in i18n/${L}.json`); continue; }
    let t = pk[id].voice || pk[id].text;
    if (ko?.voice && ko.text.includes('…') && !pk[id].voice) t = t.slice(t.lastIndexOf('…') + 1);
    t = t.replace(/\s*\/\s*/g, ' ').replace(/\s+/g, ' ').trim();
    if (/^[a-z]/.test(t)) t = t[0].toUpperCase() + t.slice(1);   // a quote that starts mid-verse is still read as a sentence
    out[id] = t;
  }
  const F = join(D, 'sound', `voice-lines-${L}.json`);
  writeFileSync(F, JSON.stringify(out, null, 1) + '\n');
  for (const id in out) console.log(L, id, out[id]);
  console.log('→', F);
}
