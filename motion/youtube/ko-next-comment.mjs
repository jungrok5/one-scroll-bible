// Korean Shorts: post the "next episode" comment on Short n (then pin it in the browser — the API cannot pin).
// Viewers on YouTube could not tell there was a next episode (the channel mixes many languages), so every Korean Short
// names the next one and links the Korean playlist. A Short can only be commented on once it is public (19:00 KST).
//   node motion/youtube/ko-next-comment.mjs <n…> [--dry]       (YT_* credentials as for yt-api.mjs)
//   node motion/youtube/ko-next-comment.mjs today [--dry]      → the Short that went public today (from first_day)
// Records the comment id in uploaded.json shorts.ko.comments[n]; skips n that already has one.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
// Shorts 7–21 are the narrated cut (2026-10-29), so the last one points at the narrated film
const PL = 'https://www.youtube.com/playlist?list=PLWbLhnVLU-Gg', FILM = 'https://youtu.be/wrEYqvOU1O8';
const up = JSON.parse(readFileSync(join(HERE, 'uploaded.json'), 'utf8')), man = JSON.parse(readFileSync(join(HERE, 'manifest.json'), 'utf8'));
const shorts = man.languages.ko.shorts, ko = up.shorts.ko;
const name = s => { const t = s.title.replace(/\s*\d+\/21$/, ''); const i = t.lastIndexOf(' — '); return i >= 0 ? t.slice(i + 3) : t; };
export const text = n => n >= 21
  ? `마지막 편입니다. 끝까지 함께해 주셔서 감사합니다 🙏\n1편부터 다시 보기: ${PL}\n전체 영상(14분, 목소리 해설): ${FILM}`
  : `▶ 다음 편: ${n + 1}/21 ${name(shorts[n])} (매일 저녁 7시에 한 편씩)\n1편부터 순서대로 보기: ${PL}`;   // no "tomorrow": the comment stays true later

const args = process.argv.slice(2), dry = args.includes('--dry');
let ns = args.filter(a => /^\d+$/.test(a)).map(Number);
if (args.includes('today')) ns.push(Math.floor((Date.now() + 9 * 3600e3) / 864e5) - Math.floor(Date.parse(ko.first_day + 'T00:00:00Z') / 864e5) + 1);
if (!ns.length) { console.log('usage: ko-next-comment.mjs <n…>|today [--dry]'); process.exit(1); }

const e = process.env;
async function token() { const j = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: e.YT_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  if (!j.access_token) throw new Error('token: ' + j.error); return j.access_token; }
ko.comments ||= {};
for (const n of ns) {
  if (n < 1 || n > 21) { console.log(`${n}: outside 1–21`); continue; }
  const id = ko.ids[String(n).padStart(2, '0')], t = text(n);
  if (ko.comments[n]) { console.log(`${n}: already commented (${ko.comments[n]})`); continue; }
  console.log(`${n} ${id}:\n${t}`); if (dry) continue;
  const tok = await token();
  const v = (await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status&id=${id}`, { headers: { Authorization: 'Bearer ' + tok } })).json()).items?.[0];
  if (v?.status.privacyStatus !== 'public') { console.log(`  not public yet (${v?.status.privacyStatus}) — skipped`); continue; }
  const r = await fetch('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet', { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
    body: JSON.stringify({ snippet: { videoId: id, topLevelComment: { snippet: { textOriginal: t } } } }) });
  const j = await r.json(); if (!r.ok) { console.log('  error:', j.error?.message); continue; }
  ko.comments[n] = j.id; writeFileSync(join(HERE, 'uploaded.json'), JSON.stringify(up, null, 1) + '\n');
  console.log(`  posted ${j.id} — pin it: https://www.youtube.com/watch?v=${id}`);
}
