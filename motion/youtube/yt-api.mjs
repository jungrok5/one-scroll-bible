// YouTube Data API helper (after motion/youtube/yt-auth.mjs). Credentials come only from YT_CLIENT_ID / YT_CLIENT_SECRET /
// YT_REFRESH_TOKEN (environment, or ~/.config/one-scroll-bible/youtube.env) and are never printed.
//   node motion/youtube/yt-api.mjs whoami                    → the channel these credentials act as (must be @one-scroll-bible)
//   node motion/youtube/yt-api.mjs captions [<lang…>] [--dry] → upload motion/subs/<lang>/film-h.srt to that language's
//        landscape film (ids in motion/youtube/uploaded.json) as a caption track in the film's own language; skips a film
//        that already has a track in that language. Default: every language with a film id. Quota: 400 units per upload.
//   node motion/youtube/yt-api.mjs status [<lang…>]           → public / scheduled / private + views per language (film, Shorts)
//   node motion/youtube/yt-api.mjs stats [<lang…>] [--from D]  → YouTube Analytics per language: views, minutes, avg % viewed
//   node motion/youtube/yt-api.mjs playlist-add <playlistId> <videoId…> → append (playlist ids in uploaded.json "playlists")
//   node motion/youtube/yt-api.mjs upload <lang> film|<n…> [--publish-at ISO] [--dry] → videos.insert from the upload sheet
//        (locked private until the API audit passes — motion/youtube/API-AUDIT.md)
// Why captions: the film has no speech, so YouTube makes no captions; its text is burned into the picture, which search
// cannot read. A caption track in the film's language makes those lines searchable (and lets viewers turn on auto-translate).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), M = join(HERE, '..');
// an API error (quota, permission) is one readable line, not a stack trace
process.on('uncaughtException', e => { console.error('error: ' + String(e.message).replace(/<[^>]+>/g, '')); process.exit(1); });
function creds() {
  const env = { ...process.env }, f = join(homedir(), '.config', 'one-scroll-bible', 'youtube.env');
  if (existsSync(f)) for (const l of readFileSync(f, 'utf8').split('\n')) { const m = l.match(/^(YT_\w+)=(.*)$/); if (m && !env[m[1]]) env[m[1]] = m[2]; }
  if (env.YT_AS) env.YT_REFRESH_TOKEN = env['YT_REFRESH_TOKEN_' + env.YT_AS.toUpperCase()];   // YT_AS=WORDLOG → that channel's token (yt-auth --as)
  const need = ['YT_CLIENT_ID', 'YT_CLIENT_SECRET', 'YT_REFRESH_TOKEN'].filter(k => !env[k]);
  if (need.length) { console.error(`missing ${need.join(', ')} — run node motion/youtube/yt-auth.mjs <client_secret.json> first (and open a new terminal)`); process.exit(1); }
  return env;
}
let tok = null;
async function token() {
  if (tok) return tok; const e = creds();
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: e.YT_REFRESH_TOKEN, grant_type: 'refresh_token' }) });
  const j = await r.json(); if (!j.access_token) { console.error('token refresh failed:', j.error || r.status); process.exit(1); }
  return (tok = j.access_token);
}
async function api(path, opt = {}) {
  const r = await fetch(path.startsWith('http') ? path : 'https://www.googleapis.com/youtube/v3/' + path, { ...opt, headers: { Authorization: 'Bearer ' + await token(), ...(opt.headers || {}) } });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = { raw: t }; }
  if (!r.ok) throw new Error(`${r.status} ${j.error?.message || t.slice(0, 200)}`); return j;
}
// site language code → YouTube caption language code
const YT_LANG = { tl: 'fil' };

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'whoami') {
  const j = await api('channels?part=snippet&mine=true'); for (const c of j.items || []) console.log(c.id, c.snippet.title, c.snippet.customUrl || '');
} else if (cmd === 'captions') {
  const dry = rest.includes('--dry'), up = JSON.parse(readFileSync(join(HERE, 'uploaded.json'), 'utf8'));
  const langs = rest.filter(a => !a.startsWith('--')); const list = (langs.length ? langs : Object.keys(up.film)).filter(L => L !== 'ko-vertical');
  for (const L of list) {
    const id = up.film[L]?.id, srt = join(M, 'subs', L, 'film-h.srt'), lang = YT_LANG[L] || L;
    if (!id || !existsSync(srt)) { console.log(`${L}: skip (${!id ? 'no film id' : 'no ' + srt})`); continue; }
    const have = await api(`captions?part=snippet&videoId=${id}`);
    if ((have.items || []).some(c => c.snippet.language === lang && c.snippet.trackKind !== 'asr')) { console.log(`${L}: already has a ${lang} track`); continue; }
    if (dry) { console.log(`${L}: would upload ${srt} → ${id} (${lang})`); continue; }
    const meta = JSON.stringify({ snippet: { videoId: id, language: lang, name: '', isDraft: false } }), b = 'osb' + Date.now();
    const body = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${b}\r\nContent-Type: application/octet-stream\r\n\r\n${readFileSync(srt, 'utf8')}\r\n--${b}--`;
    const j = await api('https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet', { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${b}` }, body });
    console.log(`${L}: uploaded caption ${j.id} (${lang}) → https://youtu.be/${id}`);
  }
} else if (cmd === 'status' || cmd === 'stats') {
  // status: privacy / scheduled time / views of every uploaded film and Short (videos.list, 1 unit per 50 ids)
  // stats [--from YYYY-MM-DD] [--to YYYY-MM-DD]: YouTube Analytics per language (views, minutes watched, average % viewed,
  //   subscribers gained), film and Shorts apart — the numbers the 7-day wave check needs
  const up = JSON.parse(readFileSync(join(HERE, 'uploaded.json'), 'utf8')), langs = rest.filter(a => !a.startsWith('--'));
  const val = (n, d) => (rest.includes('--' + n) ? rest[rest.indexOf('--' + n) + 1] : d);
  const vids = [];   // {lang, kind, n, id}
  for (const [L, f] of Object.entries(up.film)) if (f?.id && L !== 'ko-vertical') vids.push({ lang: L, kind: 'film', n: 0, id: f.id });
  for (const [L, s] of Object.entries(up.shorts || {})) for (const [n, id] of Object.entries(s.ids || {})) vids.push({ lang: L, kind: 'shorts', n: +n, id });
  const pick = vids.filter(v => !langs.length || langs.includes(v.lang));
  if (cmd === 'status') {
    const info = {};
    for (let i = 0; i < pick.length; i += 50) {
      const j = await api('videos?part=status,statistics&id=' + pick.slice(i, i + 50).map(v => v.id).join(','));
      for (const it of j.items || []) info[it.id] = it;
    }
    const by = {};
    for (const v of pick) { const it = info[v.id], k = `${v.lang} ${v.kind}`, b = by[k] ||= { n: 0, public: 0, scheduled: [], private: 0, missing: 0, views: 0 };
      b.n++; if (!it) { b.missing++; continue; }
      const st = it.status; b.views += +(it.statistics?.viewCount || 0);
      if (st.privacyStatus === 'public') b.public++; else if (st.publishAt) b.scheduled.push(st.publishAt); else b.private++; }
    for (const [k, b] of Object.entries(by)) { const s = b.scheduled.sort();
      console.log(`${k.padEnd(14)} ${b.n} videos · public ${b.public} · scheduled ${s.length}${s.length ? ` (${s[0].slice(0, 10)} … ${s.at(-1).slice(0, 10)})` : ''} · private ${b.private}${b.missing ? ` · NOT FOUND ${b.missing}` : ''} · views ${b.views}`); }
  } else {
    const today = new Date().toISOString().slice(0, 10), from = val('from', '2026-10-20'), to = val('to', today), rows = {};
    for (let i = 0; i < pick.length; i += 200) {
      const q = new URLSearchParams({ ids: 'channel==MINE', startDate: from, endDate: to, dimensions: 'video',
        metrics: 'views,estimatedMinutesWatched,averageViewPercentage,subscribersGained', filters: 'video==' + pick.slice(i, i + 200).map(v => v.id).join(','), maxResults: '200' });
      const j = await api('https://youtubeanalytics.googleapis.com/v2/reports?' + q);
      for (const r of j.rows || []) rows[r[0]] = r;
    }
    const by = {};
    for (const v of pick) { const r = rows[v.id], k = `${v.lang} ${v.kind}`, b = by[k] ||= { views: 0, min: 0, pctW: 0, subs: 0 };
      if (!r) continue; b.views += r[1]; b.min += r[2]; b.pctW += r[3] * r[1]; b.subs += r[4]; }
    console.log(`YouTube Analytics ${from} … ${to} (the last ~2 days are incomplete)`);
    for (const [k, b] of Object.entries(by)) console.log(`${k.padEnd(14)} views ${b.views} · minutes ${Math.round(b.min)} · avg viewed ${b.views ? (b.pctW / b.views).toFixed(1) : '-'}% · subs +${b.subs}`);
  }
} else if (cmd === 'playlist-add') {
  // playlist-add <playlistId> <videoId…>: append videos in the given order (50 units each); skips ones already in it
  const [pl, ...ids] = rest; if (!pl || !ids.length) { console.log('usage: playlist-add <playlistId> <videoId…>'); process.exit(1); }
  const have = new Set(); let tokn = '';
  do { const j = await api(`playlistItems?part=contentDetails&maxResults=50&playlistId=${pl}${tokn ? '&pageToken=' + tokn : ''}`);
    for (const it of j.items || []) have.add(it.contentDetails.videoId); tokn = j.nextPageToken || ''; } while (tokn);
  for (const id of ids) {
    if (have.has(id)) { console.log(`${id}: already in ${pl}`); continue; }
    await api('playlistItems?part=snippet', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snippet: { playlistId: pl, resourceId: { kind: 'youtube#video', videoId: id } } }) });
    console.log(`${id}: added to ${pl}`);
  }
} else if (cmd === 'upload') {
  // upload <lang> film|<n…> [--publish-at <ISO>] [--dry]: videos.insert (resumable) from the upload sheet (manifest.json):
  // title, description, tags, category Education (27), the language, made-for-kids no; private, or scheduled with
  // --publish-at (Shorts: one per day from that time, n-1 days later each). Film: also thumbnails.set (thumbnail A).
  // NOTE: until the API project passes YouTube's audit, every API upload is locked private (motion/youtube/API-AUDIT.md).
  const [L, ...what] = rest.filter(a => !a.startsWith('--') && !/^\d{4}-\d\d-\d\dT/.test(a)), dry = rest.includes('--dry');
  const at = rest.includes('--publish-at') ? rest[rest.indexOf('--publish-at') + 1] : null;
  const m = JSON.parse(readFileSync(join(HERE, 'manifest.json'), 'utf8')).languages[L];
  if (!m || !what.length) { console.log('usage: upload <lang> film|<n…> [--publish-at 2026-11-28T10:00:00Z] [--dry]'); process.exit(1); }
  const items = what[0] === 'film' ? [{ ...m.film, n: 0 }] : what.map(n => m.shorts.find(s => s.n === +n)).filter(Boolean);
  const ROOT = join(M, '..');
  for (const it of items) {
    const file = join(ROOT, it.local), lang = YT_LANG[L] || L;
    if (!existsSync(file)) { console.log(`${L} ${it.n || 'film'}: missing ${it.local}`); continue; }
    const when = at && new Date(Date.parse(at) + Math.max(0, (it.n || 1) - 1) * 864e5).toISOString();
    const meta = { snippet: { title: it.title, description: it.description, tags: it.tags, categoryId: '27', defaultLanguage: lang, defaultAudioLanguage: lang },
      status: { privacyStatus: 'private', ...(when ? { publishAt: when } : {}), selfDeclaredMadeForKids: false } };
    const buf = readFileSync(file);
    if (dry) { console.log(`${L} ${it.n || 'film'}: would upload ${it.local} (${(buf.length / 1e6).toFixed(1)} MB) "${it.title}"${when ? ' → ' + when : ' (private)'}`); continue; }
    const r = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', { method: 'POST',
      headers: { Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': String(buf.length) },
      body: JSON.stringify(meta) });
    if (!r.ok) { console.error(`${L} ${it.n || 'film'}: start failed ${r.status} ${(await r.text()).slice(0, 200)}`); process.exit(1); }
    const v = await (await fetch(r.headers.get('location'), { method: 'PUT', headers: { 'Content-Type': 'video/mp4' }, body: buf })).json();
    if (!v.id) { console.error(`${L} ${it.n || 'film'}: upload failed ${JSON.stringify(v).slice(0, 200)}`); process.exit(1); }
    console.log(`${L} ${it.n || 'film'}: uploaded ${v.id} (${v.status?.privacyStatus}${v.status?.publishAt ? ' → ' + v.status.publishAt : ''}) — record it in uploaded.json`);
    if (!it.n && it.thumbnail && existsSync(join(ROOT, it.thumbnail))) {
      await api(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${v.id}`, { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: readFileSync(join(ROOT, it.thumbnail)) });
      console.log(`  thumbnail set from ${it.thumbnail}`);
    }
  }
} else console.log('usage: node motion/youtube/yt-api.mjs whoami | captions [<lang…>] [--dry] | status [<lang…>] | stats [<lang…>] [--from D] [--to D] | playlist-add <playlistId> <videoId…> | upload <lang> film|<n…> [--publish-at ISO] [--dry]');
