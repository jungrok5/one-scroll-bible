// Moving the non-Korean languages to the international channel "Bible in One Scroll" (@bibleinonescroll, 2026-10-26).
// The Korean channel (@one-scroll-bible, renamed 한눈에 보는 성경 이야기) keeps Korean only: its subscribers browse the
// channel's newest uploads and could not find the Korean Short among the other languages'. Uploads still go through the
// Studio helpers (unaudited API uploads are locked private); this script does the API side with YT_AS=GLOBAL:
//   node motion/youtube/global-move.mjs playlists [--dry]   → one public playlist per language (title = site brand)
//   node motion/youtube/global-move.mjs record <L>=<id> …   → uploaded.json global.film[L]
//   node motion/youtube/global-move.mjs playlist-film       → add each language's film to its playlist (first item)
//   node motion/youtube/global-move.mjs status              → films on the channel: privacy, processing
// Records live in uploaded.json "global": { channel, film: {L: {id,…}}, shorts: {L: {ids}}, playlists: {L: id} }.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), UP = join(HERE, 'uploaded.json');
const CHANNEL = 'UCOI5LbYpQGgHkcbMEStvnlw';
const YT_LANG = { 'zh-Hans': 'zh-CN', 'zh-Hant': 'zh-TW', 'pt-BR': 'pt', tl: 'fil' };
const up = JSON.parse(readFileSync(UP, 'utf8')), man = JSON.parse(readFileSync(join(HERE, 'manifest.json'), 'utf8'));
const g = (up.global ||= { _note: 'International channel Bible in One Scroll (@bibleinonescroll) — every language except Korean, from 2026-10-26', channel: CHANNEL, film: {}, shorts: {}, playlists: {} });
const save = () => writeFileSync(UP, JSON.stringify(up, null, 1) + '\n');
const langs = Object.keys(man.languages).filter(L => L !== 'ko' && man.languages[L].film);

const e = process.env; let tok;
async function api(path, opt = {}) {
  tok ||= (await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: e.YT_REFRESH_TOKEN_GLOBAL, grant_type: 'refresh_token' }) })).json()).access_token;
  if (!tok) throw new Error('no token — needs YT_REFRESH_TOKEN_GLOBAL (yt-auth.mjs --as GLOBAL)');
  const r = await fetch('https://www.googleapis.com/youtube/v3/' + path, { ...opt, headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' } });
  const j = await r.json(); if (!r.ok) throw new Error(`${r.status} ${j.error?.message}`.replace(/<[^>]+>/g, '')); return j;
}
const me = async () => { const c = (await api('channels?part=snippet&mine=true')).items?.[0]; if (c?.id !== CHANNEL) throw new Error('token is not for @bibleinonescroll: ' + c?.id); };

const [cmd, ...rest] = process.argv.slice(2), dry = rest.includes('--dry');
if (cmd === 'playlists') {
  if (!dry) await me();
  for (const L of langs) {
    if (g.playlists[L]) { console.log(L, 'has', g.playlists[L]); continue; }
    const f = man.languages[L].film, snippet = { title: man.languages[L].brand, description: f.description.split('\n')[0], defaultLanguage: YT_LANG[L] || L };
    console.log(L, '→', snippet.title); if (dry) continue;
    const p = await api('playlists?part=snippet,status', { method: 'POST', body: JSON.stringify({ snippet, status: { privacyStatus: 'public' } }) });
    g.playlists[L] = p.id; save(); console.log('  ', p.id);
  }
} else if (cmd === 'record') {
  for (const a of rest) { const [L, id] = a.split('='); if (!man.languages[L] || !/^[\w-]{11}$/.test(id || '')) { console.log('skip', a); continue; }
    g.film[L] = { id, status: 'private', note: 'uploaded via Studio 2026-10-26 (moved from the Korean channel)' }; console.log(L, id); }
  save();
} else if (cmd === 'playlist-film') {
  await me();
  for (const L of langs) {
    const pl = g.playlists[L], id = g.film[L]?.id; if (!pl || !id) { console.log(L, 'skip (no playlist or film)'); continue; }
    const items = await api(`playlistItems?part=contentDetails&maxResults=50&playlistId=${pl}`);
    if (items.items.some(i => i.contentDetails.videoId === id)) { console.log(L, 'already'); continue; }
    await api('playlistItems?part=snippet', { method: 'POST', body: JSON.stringify({ snippet: { playlistId: pl, position: 0, resourceId: { kind: 'youtube#video', videoId: id } } }) });
    console.log(L, 'added');
  }
} else if (cmd === 'fill') {
  // fill <L> <id>: a film whose file uploaded but whose form was not filled (the Studio dialog got stuck) — set the
  // upload sheet's title, description, tags (under YouTube's 500-character total), language, Education, not for kids,
  // no altered content, private; then record it. The thumbnail comes with the A/B test when it is published.
  const [L, id] = rest; const f = man.languages[L]?.film; if (!f || !/^[\w-]{11}$/.test(id || '')) { console.log('usage: fill <L> <id>'); process.exit(1); }
  await me();
  const tags = []; for (const t of f.tags) { if ([...tags, t].join(',').length + 2 * (tags.length + 1) > 480) break; tags.push(t); }
  const lang = L === 'pt-BR' ? 'pt-BR' : L === 'tl' ? 'fil' : L;
  await api('videos?part=snippet,status', { method: 'PUT', body: JSON.stringify({ id,
    snippet: { title: f.title, description: f.description, tags, categoryId: '27', defaultLanguage: lang, defaultAudioLanguage: lang },
    status: { privacyStatus: 'private', selfDeclaredMadeForKids: false, containsSyntheticMedia: false } }) });
  g.film[L] = { id, status: 'private', note: 'uploaded via Studio 2026-10-26 (moved from the Korean channel); form filled by API (global-move fill)' }; save();
  console.log(L, id, 'filled:', f.title.slice(0, 40), '| tags', tags.length);
} else if (cmd === 'record-shorts') {
  // record-shorts <log.json>: [{L, n, id}, …] from the Studio file-only uploads → global.shorts[L].ids[NN]
  const log = JSON.parse(readFileSync(rest[0], 'utf8'));
  for (const r of log) if (r?.L && r.n && /^[\w-]{11}$/.test(r.id || '')) ((g.shorts[r.L] ||= { ids: {} }).ids[String(r.n).padStart(2, '0')] = r.id);
  save(); for (const [L, s] of Object.entries(g.shorts)) console.log(L, Object.keys(s.ids).length);
} else if (cmd === 'fill-shorts') {
  // fill-shorts <L> [--dry]: title/description/tags/language from the upload sheet; the same schedule the Korean channel had
  // (uploaded.json shorts[L]: Short n at first_day + n−1, time_kst) — a Short whose time has passed goes public now
  const [L] = rest, s = g.shorts[L], old = up.shorts[L]; if (!s || !old) { console.log('no shorts for', L); process.exit(1); }
  if (!dry) await me();
  const lang = L === 'tl' ? 'fil' : L;
  for (const [nn, id] of Object.entries(s.ids).sort()) {
    const f = man.languages[L].shorts[+nn - 1], when = new Date(Date.parse(old.first_day + 'T' + old.time_kst + ':00+09:00') + (+nn - 1) * 864e5);
    const tags = []; for (const t of f.tags) { if ([...tags, t].join(',').length + 2 * (tags.length + 1) > 480) break; tags.push(t); }
    const future = when > new Date(Date.now() + 15 * 60e3);
    const status = future ? { privacyStatus: 'private', publishAt: when.toISOString(), selfDeclaredMadeForKids: false, containsSyntheticMedia: false }
      : { privacyStatus: 'public', selfDeclaredMadeForKids: false, containsSyntheticMedia: false };
    console.log(L, nn, id, future ? 'scheduled ' + when.toISOString() : 'public now', '|', f.title.slice(0, 40)); if (dry) continue;
    await api('videos?part=snippet,status', { method: 'PUT', body: JSON.stringify({ id, snippet: { title: f.title, description: f.description, tags, categoryId: '27', defaultLanguage: lang, defaultAudioLanguage: lang }, status }) });
  }
  s.time_kst = old.time_kst; s.first_day = old.first_day; s.note = 'moved from the Korean channel 2026-10-26 (same schedule); related video = global.film[L] (set in Studio)'; save();
} else if (cmd === 'unschedule-old') {
  // unschedule-old <L> [--dry]: on the KOREAN channel (YT_REFRESH_TOKEN): the Shorts of L that are public → unlisted (links keep
  // working), the scheduled ones → plain private (schedule cancelled). Nothing is deleted.
  const [L] = rest, old = up.shorts[L]; if (!old) { console.log('no shorts for', L); process.exit(1); }
  let kt; const kapi = async (path, opt = {}) => {
    kt ||= (await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: e.YT_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json()).access_token;
    const r = await fetch('https://www.googleapis.com/youtube/v3/' + path, { ...opt, headers: { Authorization: 'Bearer ' + kt, 'Content-Type': 'application/json' } });
    const j = await r.json(); if (!r.ok) throw new Error(`${r.status} ${j.error?.message}`.replace(/<[^>]+>/g, '')); return j; };
  const ids = Object.values(old.ids), v = (await kapi(`videos?part=status&id=${ids.join(',')}`)).items;
  for (const x of v) {
    const next = x.status.privacyStatus === 'public' ? 'unlisted' : 'private'; if (x.status.privacyStatus === next && !x.status.publishAt) continue;
    console.log(L, x.id, x.status.privacyStatus, x.status.publishAt || '', '→', next); if (dry) continue;
    await kapi('videos?part=status', { method: 'PUT', body: JSON.stringify({ id: x.id, status: { privacyStatus: next, selfDeclaredMadeForKids: false, containsSyntheticMedia: false } }) });
  }
  if (!dry) { old.note = (old.note || '') + '; moved to the international channel 2026-10-26 — public ones unlisted, scheduled ones unscheduled (private)'; save(); }
} else if (cmd === 'playlist-shorts') {
  // playlist-shorts <L…>: append the language's Shorts 1–21 to its playlist after the film (50 units each; skips ones in it)
  await me();
  for (const L of rest.filter(a => !a.startsWith('--'))) {
    const pl = g.playlists[L], ids = Object.entries(g.shorts[L]?.ids || {}).sort().map(([, id]) => id); if (!pl || !ids.length) { console.log(L, 'skip'); continue; }
    const have = new Set((await api(`playlistItems?part=contentDetails&maxResults=50&playlistId=${pl}`)).items.map(i => i.contentDetails.videoId));
    let n = 0; for (const id of ids) { if (have.has(id)) continue; if (!dry) await api('playlistItems?part=snippet', { method: 'POST', body: JSON.stringify({ snippet: { playlistId: pl, resourceId: { kind: 'youtube#video', videoId: id } } }) }); n++; }
    console.log(L, dry ? 'would add' : 'added', n);
  }
} else if (cmd === 'unlist-old-films') {
  // unlist-old-films [--dry]: the non-Korean films still public on the KOREAN channel → unlisted (old links keep working)
  const tk = (await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: e.YT_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json()).access_token;
  const H = { Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json' };
  const films = Object.entries(up.film).filter(([L, f]) => f?.id && L !== 'ko' && L !== 'ko-vertical');
  const v = (await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status&id=${films.map(([, f]) => f.id).join(',')}`, { headers: H })).json()).items;
  for (const x of v) { const L = films.find(([, f]) => f.id === x.id)[0]; if (x.status.privacyStatus !== 'public') { console.log(L, x.id, 'already', x.status.privacyStatus); continue; }
    console.log(L, x.id, 'public → unlisted'); if (dry) continue;
    const r = await fetch('https://www.googleapis.com/youtube/v3/videos?part=status', { method: 'PUT', headers: H, body: JSON.stringify({ id: x.id, status: { privacyStatus: 'unlisted', selfDeclaredMadeForKids: false, containsSyntheticMedia: false } }) });
    if (!r.ok) { console.log('  error', r.status, (await r.json()).error?.message); break; }
    up.film[L].status = 'unlisted'; up.film[L].note += '; unlisted 2026-10-28 (moved to the international channel: global.film)'; save(); }
} else if (cmd === 'status') {
  const ids = Object.values(g.film).map(f => f.id); if (!ids.length) { console.log('no films recorded'); process.exit(0); }
  const v = await api(`videos?part=status,processingDetails,snippet&id=${ids.join(',')}`);
  for (const x of v.items) console.log(Object.keys(g.film).find(L => g.film[L].id === x.id), x.id, x.status.privacyStatus, x.processingDetails?.processingStatus || '', x.snippet.title.slice(0, 40));
} else console.log('usage: global-move.mjs playlists|record|playlist-film|status');
