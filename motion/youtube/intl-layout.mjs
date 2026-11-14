// International channel layout as code (관리자 2026-11-13: "해외채널 정리 — 앞으로 영상들 생성될 것 고려해서").
// Rules: intl-layout.json. Ids: uploaded.json global.* (a new film or language shows up here once it is recorded there).
//   node motion/youtube/intl-layout.mjs plan     → what differs from the rules (≈25 units of reads)
//   node motion/youtube/intl-layout.mjs apply [--only playlists|series|home|channel] → fix it (50 units per insert/move/update)
// Never removes a video from a playlist and never deletes anything — extra items are only reported.
// Credentials: YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN_GLOBAL (never printed).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const R = JSON.parse(readFileSync(join(HERE, 'intl-layout.json'), 'utf8')), UP = join(HERE, 'uploaded.json'), U = JSON.parse(readFileSync(UP, 'utf8')), G = U.global;
process.on('uncaughtException', e => { console.error('error: ' + String(e.message).replace(/<[^>]+>/g, '')); process.exit(1); });
let tok; async function api(p, o = {}) {
  if (!tok) { const e = process.env; if (!e.YT_CLIENT_ID || !e.YT_REFRESH_TOKEN_GLOBAL) { console.error('missing YT_* environment variables'); process.exit(1); }
    tok = (await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: e.YT_REFRESH_TOKEN_GLOBAL, grant_type: 'refresh_token' }) })).json()).access_token; }
  const r = await fetch('https://www.googleapis.com/youtube/v3/' + p, { ...o, headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' } });
  const t = await r.text(); const j = t ? JSON.parse(t) : {}; if (!r.ok) throw new Error(`${r.status} ${j.error?.message || t.slice(0, 200)}`); return j;
}
const LOC = { tl: 'fil' }, loc = L => LOC[L] || L;
const id = k => G.film[k]?.id || null;
const films = () => { const names = Object.keys(G.films || {}); return [...R.series_order.filter(n => names.includes(n)), ...names.filter(n => !R.series_order.includes(n))]; };
const speaks = (f, L) => { const h = G.films[f]?.h; if (!h?.id) return false; const c = h.captions || [], a = h.audio || [];
  return h.default === L || c.includes(L) || c.includes(loc(L)) || a.includes(L); };
function wantList(L) {
  const main = id(`${L}-narr`) || id(L), other = [id(`${L}-narr`) ? id(L) : null, id(`${L}-narr-v`), id(`${L}-v`)].filter(Boolean);
  const series = films().filter(f => speaks(f, L)).map(f => G.films[f].h.id);
  const shorts = Object.entries(G.shorts?.[L]?.ids || {}).sort(([a], [b]) => +a - +b).map(([, v]) => v);
  const parts = { 'film14-main': main ? [main] : [], 'film14-other': other, series, shorts };
  return R.language_playlist.order.flatMap(k => parts[k]);
}
async function items(pl) { const out = []; let pt = '';
  do { const j = await api(`playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${pl}${pt ? '&pageToken=' + pt : ''}`); out.push(...j.items); pt = j.nextPageToken; } while (pt);
  return out.sort((a, b) => a.snippet.position - b.snippet.position); }

const [cmd, ...rest] = process.argv.slice(2), only = rest[rest.indexOf('--only') + 1], apply = cmd === 'apply', doit = k => !only || only === k;
if (cmd !== 'plan' && cmd !== 'apply') { console.log('usage: node motion/youtube/intl-layout.mjs plan | apply [--only playlists|series|home|channel]'); process.exit(1); }
let changes = 0; const say = s => { console.log(s); changes++; };

// 1. language playlists: missing videos inserted at their place, then order fixed; extra items only reported
if (doit('playlists')) for (const [L, pl] of Object.entries(G.playlists || {})) {
  const want = wantList(L); let cur = await items(pl); const have = cur.map(i => i.contentDetails.videoId);
  const extra = have.filter(v => !want.includes(v)); if (extra.length) console.log(`${L}: not in the rules (kept): ${extra.join(' ')}`);
  for (const [pos, v] of want.entries()) if (!have.includes(v)) { say(`${L}: add ${v} at ${pos}`);
    if (apply) { await api('playlistItems?part=snippet', { method: 'POST', body: JSON.stringify({ snippet: { playlistId: pl, position: Math.min(pos, have.length), resourceId: { kind: 'youtube#video', videoId: v } } }) }); have.splice(pos, 0, v); } }
  if (apply) cur = await items(pl);
  const order = cur.map(i => i.contentDetails.videoId).filter(v => want.includes(v)), target = want.filter(v => order.includes(v));
  for (const [pos, v] of target.entries()) { const now = cur.filter(i => want.includes(i.contentDetails.videoId)).findIndex(i => i.contentDetails.videoId === v);
    if (now === pos) continue; say(`${L}: move ${v} ${now} → ${pos}`); if (!apply) break;
    const it = cur.find(i => i.contentDetails.videoId === v); await api('playlistItems?part=snippet', { method: 'PUT', body: JSON.stringify({ id: it.id, snippet: { playlistId: pl, position: pos, resourceId: it.snippet.resourceId } }) });
    cur = await items(pl); }
}
// 2. the series playlist (create once, then keep its films in story order)
let seriesId = G.playlists_series || null;
if (doit('series')) { const want = films().map(f => G.films[f]?.h?.id).filter(Boolean);
  if (!seriesId) { say(`series: create playlist "${R.series_playlist.title}" with ${want.length} film(s)`);
    if (apply) { const sp = R.series_playlist, j = await api('playlists?part=snippet,status,localizations', { method: 'POST', body: JSON.stringify({ snippet: { title: sp.title, description: sp.description, defaultLanguage: 'en' }, status: { privacyStatus: 'public' }, localizations: { en: { title: sp.title, description: sp.description }, ...sp.localizations } }) });
      seriesId = j.id; U.global.playlists_series = seriesId; writeFileSync(UP, JSON.stringify(U, null, 1) + '\n'); console.log(`  created ${seriesId} (uploaded.json global.playlists_series)`); } }
  if (seriesId) { const have = (await items(seriesId)).map(i => i.contentDetails.videoId);
    for (const [pos, v] of want.entries()) if (!have.includes(v)) { say(`series: add ${v}`); if (apply) await api('playlistItems?part=snippet', { method: 'POST', body: JSON.stringify({ snippet: { playlistId: seriesId, position: Math.min(pos, have.length), resourceId: { kind: 'youtube#video', videoId: v } } }) }); } } }
// 3. home sections
if (doit('home')) { const secs = (await api('channelSections?part=snippet,contentDetails&mine=true')).items || [], lang = Object.values(G.playlists || {});
  for (const [n, s] of R.home.sections.entries()) { const pls = s.playlists === 'language' ? lang : seriesId ? [seriesId] : [];
    if (!pls.length) { console.log(`home ${s.type}: waits for the series playlist`); continue; }
    // YouTube returns the section type in lower case ('multipleplaylists'): compare without case (2026-11-14: plan kept saying "add" after apply)
    const cur = secs.find(x => x.snippet.type.toLowerCase() === s.type.toLowerCase() && (x.contentDetails?.playlists || []).some(p => pls.includes(p)));
    if (cur && pls.every(p => cur.contentDetails.playlists.includes(p))) continue;
    say(`home: ${cur ? 'update' : 'add'} ${s.type}${s.title ? ` "${s.title}"` : ''} (${pls.length} playlist(s))`);
    if (apply) { const body = { snippet: { type: s.type, position: n, ...(s.title ? { title: s.title } : {}) }, contentDetails: { playlists: pls } };
      await api('channelSections?part=snippet,contentDetails', { method: cur ? 'PUT' : 'POST', body: JSON.stringify(cur ? { id: cur.id, ...body } : body) }); } }
  console.log('home: the featured video for returning subscribers has no API — Studio → Customization → Layout (newest series film).'); }
// 4. channel description per language
if (doit('channel')) { const ch = (await api('channels?part=brandingSettings,localizations&mine=true')).items[0], next = { ...(ch.localizations || {}) }; let chg = 0;
  const pls = (await api(`playlists?part=snippet&mine=true&maxResults=50`)).items, title = ch.brandingSettings.channel.title || 'Bible in One Scroll';
  for (const [L, pl] of Object.entries(G.playlists || {})) { if (L === 'en') continue; const p = pls.find(x => x.id === pl); if (!p?.snippet.description) continue;
    const site = `https://one-scroll-bible.com/${L}/?utm_source=youtube&utm_medium=channel&utm_campaign=intl_${L}`;
    const d = R.channel_localizations.lines.map(l => l.replace('{playlist_description}', p.snippet.description.trim()).replace('{site}', site)).join('\n');
    // YouTube stores localization keys in its own form (zh-Hans → zh_CN, ja → ja_JP …): an entry counts as present when a stored key of
    // the same language (and the same Chinese script) already has this description (2026-11-14: plan kept listing 18 after apply)
    const base = loc(L).split(/[-_]/)[0], trad = k => /Hant|TW|HK/.test(k);
    const have = Object.entries(ch.localizations || {}).some(([k, v]) => k.split(/[-_]/)[0] === base && (base !== 'zh' || trad(k) === trad(loc(L))) && v.description === d);
    if (!have) { next[loc(L)] = { title, description: d }; chg++; say(`channel: ${loc(L)} description`); } }
  if (apply && chg) await api('channels?part=localizations', { method: 'PUT', body: JSON.stringify({ id: ch.id, localizations: next }) }); }
// 5. related videos (Studio only) — what must change once a narrated version exists
for (const L of Object.keys(G.shorts || {})) { const n = id(`${L}-narr`); if (n) console.log(`related: ${L} scene Shorts → ${n} (Studio, studio-related.js)`); }
console.log(`${changes} change(s) ${apply ? 'made' : 'to make'}`);
