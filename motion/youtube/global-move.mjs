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
} else if (cmd === 'status') {
  const ids = Object.values(g.film).map(f => f.id); if (!ids.length) { console.log('no films recorded'); process.exit(0); }
  const v = await api(`videos?part=status,processingDetails,snippet&id=${ids.join(',')}`);
  for (const x of v.items) console.log(Object.keys(g.film).find(L => g.film[L].id === x.id), x.id, x.status.privacyStatus, x.processingDetails?.processingStatus || '', x.snippet.title.slice(0, 40));
} else console.log('usage: global-move.mjs playlists|record|playlist-film|status');
