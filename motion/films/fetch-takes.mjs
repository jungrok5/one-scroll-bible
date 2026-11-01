// Download ElevenLabs narration takes for one language of a film.
//   node motion/films/fetch-takes.mjs <film> <lang> <sessions.json> <status.json…>
// sessions.json  { lineId: [sessionId, …] }   (the session ids each generate call returned, in order: take a, b, …)
// status.json    saved creative_get_flow_run_status results (signed content URLs, valid ~2 h)
// → motion/films/<film>/sound/takes-<lang>/<lineId>-<a|b>.mp3, and the generation ids in takes-<lang>/gen.json
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), [film, lang, sessFile, ...status] = process.argv.slice(2);
const D = join(HERE, film, 'sound', 'takes-' + lang); mkdirSync(D, { recursive: true });
const sess = JSON.parse(readFileSync(sessFile, 'utf8')), who = {};
for (const [id, list] of Object.entries(sess)) list.forEach((s, k) => who[s] = id + '-' + 'abcd'[k]);
const genF = join(D, 'gen.json'), gen = existsSync(genF) ? JSON.parse(readFileSync(genF, 'utf8')) : {};
let got = 0, left = 0;
for (const f of status) {
  const j = JSON.parse(readFileSync(f, 'utf8'));
  for (const g of j.generations || []) {
    const sid = (g.content_url || '').match(/content_generation\/([^/]+)\//)?.[1], name = who[sid];
    if (!name) continue;
    if (g.status !== 'completed') { left++; console.log('not ready', name, g.status); continue; }
    const out = join(D, name + '.mp3');
    if (!existsSync(out)) { const r = await fetch(g.content_url); if (!r.ok) { console.log('fetch failed', name, r.status); continue; } writeFileSync(out, Buffer.from(await r.arrayBuffer())); got++; }
    gen[name] = g.id;
  }
}
writeFileSync(genF, JSON.stringify(gen, null, 1) + '\n');
const want = Object.keys(who).length, have = Object.keys(gen).length;
console.log(`${lang}: downloaded ${got}, recorded ${have}/${want}${left ? `, ${left} not ready` : ''}`);
