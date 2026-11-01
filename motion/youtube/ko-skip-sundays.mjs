// Korean channel: nothing goes public on the Lord's Day (관리자 결정 2026-11-01 — YouTube, Instagram and Threads alike).
// Reschedules the Korean Shorts that are still private so that, from <from> on, Short n+1 follows Short n on the next non-Sunday
// at the same time (19:00 KST); writes the dates to uploaded.json shorts.ko.dates (ko-next-comment.mjs "today" reads them).
// Only the publish time changes — every other status field is read and sent back as it is. 50 units per Short.
//   node motion/youtube/ko-skip-sundays.mjs <first n to move> <its new date YYYY-MM-DD> [--dry]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), F = join(HERE, 'uploaded.json');
const up = JSON.parse(readFileSync(F, 'utf8')), ko = up.shorts.ko, [from, day] = process.argv.slice(2).filter(a => !a.startsWith('--')), dry = process.argv.includes('--dry');
if (!(+from >= 1) || !/^\d{4}-\d{2}-\d{2}$/.test(day || '')) { console.log('usage: ko-skip-sundays.mjs <n> <YYYY-MM-DD> [--dry]'); process.exit(1); }
const e = process.env;
const tok = (await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: e.YT_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json()).access_token;
const api = async (p, o = {}) => { const r = await fetch('https://www.googleapis.com/youtube/v3/' + p, { ...o, headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' } });
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message); return j; };
const [hh, mm] = (ko.time_kst || '19:00').split(':').map(Number);
let d = new Date(day + 'T00:00:00Z');
ko.dates ||= {};
for (let n = +from; n <= 21; n++) {
  while (d.getUTCDay() === 0) d = new Date(+d + 864e5);   // skip Sunday
  const date = d.toISOString().slice(0, 10), at = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hh - 9, mm)).toISOString();
  const id = ko.ids[String(n).padStart(2, '0')], v = (await api(`videos?part=status&id=${id}`)).items[0], s = v.status;
  if (s.privacyStatus !== 'private') { console.log(`${n} ${id}: ${s.privacyStatus} — already out, left alone`); }
  else if (s.publishAt === at.replace('.000Z', 'Z')) { console.log(`${n} ${id}: already ${date}`); }
  else { console.log(`${n} ${id}: ${s.publishAt} → ${at}`);
    if (!dry) await api('videos?part=status', { method: 'PUT', body: JSON.stringify({ id, status: { privacyStatus: 'private', publishAt: at,
      selfDeclaredMadeForKids: s.selfDeclaredMadeForKids ?? false, containsSyntheticMedia: s.containsSyntheticMedia ?? false, license: s.license, embeddable: s.embeddable, publicStatsViewable: s.publicStatsViewable } }) }); }
  ko.dates[n] = date; d = new Date(+d + 864e5);
}
if (!dry) { writeFileSync(F, JSON.stringify(up, null, 1) + '\n'); console.log('dates → uploaded.json shorts.ko.dates'); }
