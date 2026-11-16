// Upload the hook covers made by make.py as the Shorts' thumbnails (thumbnails.set — works for Shorts; 50 units each) and record it.
//   node motion/youtube/thumbs/shorts/apply.mjs <set> [--dry] [--only k1,k2]
// The set's hooks.json "channel" picks the channel (ko | gl). Each item gets uploaded.json-independent bookkeeping in hooks.json
// ("applied": date) so a second run skips what is done. Changing a public video's cover needs the maintainer's OK for the set
// (관리자 2026-11-17: Korean first-film Shorts + clips, "1번 하자", "앞으로 가로세로 이렇게 만들어줘").
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { accessToken } from '../../yt-token.mjs';
const HERE = dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2), set = args.find(a => !a.startsWith('--'));
if (!set || !existsSync(join(HERE, set, 'hooks.json'))) { console.log('usage: apply.mjs <set> [--dry] [--only k1,k2]'); process.exit(1); }
const F = join(HERE, set, 'hooks.json'), H = JSON.parse(readFileSync(F, 'utf8')), dry = args.includes('--dry');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), tok = dry ? null : await accessToken(H.channel || 'ko');
let n = 0;
for (const [k, it] of Object.entries(H.items).sort()) {
  if (only && !only.includes(k)) continue;
  if (it.applied && !only) { console.log(`${k} ${it.id} already (${it.applied})`); continue; }
  const p = join(HERE, set, 'out', k + '.jpg'); if (!existsSync(p)) { console.log(`${k}: no out/${k}.jpg — run make.py ${set}`); continue; }
  if (dry) { console.log(`${k} ${it.id} ← out/${k}.jpg (dry)`); continue; }
  const r = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${it.id}`, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'image/jpeg' }, body: readFileSync(p) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { console.log(`${k} ${it.id} ✗ ${r.status} ${j.error?.message || ''}`.replace(/<[^>]+>/g, '')); continue; }
  it.applied = today; n++; console.log(`${k} ${it.id} ✓`);
  writeFileSync(F, JSON.stringify(H, null, 1) + '\n');
}
console.log(`${n} cover(s) set${dry ? ' (dry)' : ''}`);
