// Did the narrator say what the script says? Compares a speech-to-text transcript of a language's voice track
// (motion/out/<film>-<lang>-voice.wav, transcribed with word times — ElevenLabs Scribe) line by line with the words
// that language's narrator was given (the reviewed i18n text, '…' rule as in sound.mjs). Quotes must be the Bible verbatim,
// so any missing, extra or changed word is listed; matching lines print nothing.
//   node motion/films/check-voice.mjs <film> <lang> <transcript.json>
// transcript.json: a saved creative_get_flow_run_status result ({ transcripts: [{ text, words: [{ text, start, end }] }] }),
// or { words: [...] } — the first transcript is used unless the file holds several (then pass --pick <n>).
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2), pi = args.indexOf('--pick');
const pick = pi > -1 ? +args.splice(pi, 2)[1] : 0, [film, lang, tf] = args;
const json = f => JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));
const place = json(join(HERE, film, 'sound', `place-${lang}.json`)), K = Object.fromEntries(json(join(HERE, film, 'script.json')).lines.map(l => [l.id, l]));
const P = json(join(HERE, film, 'i18n', lang + '.json')), T = json(tf);
const tr = T.transcripts ? T.transcripts[pick] : T, words = (tr.words || []).filter(w => (w.type || 'word') === 'word' && w.text.trim());
const norm = s => s.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/\s+/g, ' ').trim();
const said = id => { const k = K[id]; let t = P[id].voice || P[id].text; if (k.voice && k.text.includes('…') && !P[id].voice) t = t.slice(t.lastIndexOf('…') + 1); return t.replace(/\//g, ' '); };
const ids = Object.keys(place.at).sort((a, b) => place.at[a] - place.at[b]);
let bad = 0;
ids.forEach((id, i) => {
  const a = place.at[id] - 0.3, b = ids[i + 1] ? place.at[ids[i + 1]] - 0.1 : 1e9;
  const heard = norm(words.filter(w => w.start >= a && w.start < b).map(w => w.text).join(' ')), want = norm(said(id));
  if (heard === want) return;
  // word diff (LCS)
  const x = want.split(' '), y = heard.split(' '), L = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let p = x.length - 1; p >= 0; p--) for (let q = y.length - 1; q >= 0; q--) L[p][q] = x[p] === y[q] ? L[p + 1][q + 1] + 1 : Math.max(L[p + 1][q], L[p][q + 1]);
  const out = []; let p = 0, q = 0;
  while (p < x.length || q < y.length) {
    if (p < x.length && q < y.length && x[p] === y[q]) { out.push(x[p]); p++; q++; }
    else if (q < y.length && (p >= x.length || L[p][q + 1] >= L[p + 1][q])) { out.push(`+[${y[q]}]`); q++; }
    else { out.push(`-[${x[p]}]`); p++; }
  }
  bad++; console.log(`${id} [${K[id].kind}]  ${out.join(' ')}`);
});
console.log(bad ? `${lang}: ${bad} line(s) differ — listen to them (a transcription slip or a real misreading)` : `${lang}: every line heard as written`);
