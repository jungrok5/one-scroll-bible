// Cross-links between the Korean and the international channel (관리자 2026-11-13: "서로 연결되어야지").
// Rules + lines live in xlinks.json; video ids come from uploaded.json — never from here.
//   node motion/youtube/xlinks.mjs audit                    → every video's description checked for its links (≈1 unit per 50 videos)
//   node motion/youtube/xlinks.mjs apply [--kind k] [--dry] [--max N] → insert the missing lines (50 units per video;
//        --dry writes motion/out/xlinks/<id>.txt). Kinds: ko-film ko-shorts ko-silence400 gl-film gl-silence400
//   node motion/youtube/xlinks.mjs comment <videoId> <key>  → post xlinks.json[<key>] as a top-level comment on the
//        international channel (50 units). Pin it in Studio afterwards (the API cannot pin).
// Credentials: YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN (Korean) / YT_REFRESH_TOKEN_GLOBAL — never printed.
// New film → add its ids to uploaded.json and a kind below; the audit then shows what is missing.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), OUT = join(HERE, '..', 'out', 'xlinks');
const X = JSON.parse(readFileSync(join(HERE, 'xlinks.json'), 'utf8')), U = JSON.parse(readFileSync(join(HERE, 'uploaded.json'), 'utf8')), G = U.global;
process.on('uncaughtException', e => { console.error('error: ' + String(e.message).replace(/<[^>]+>/g, '')); process.exit(1); });
const tok = {};
async function token(ch) {
  if (tok[ch]) return tok[ch]; const e = process.env, rt = ch === 'gl' ? e.YT_REFRESH_TOKEN_GLOBAL : e.YT_REFRESH_TOKEN;
  if (!e.YT_CLIENT_ID || !e.YT_CLIENT_SECRET || !rt) { console.error('missing YT_* environment variables'); process.exit(1); }
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: rt, grant_type: 'refresh_token' }) });
  const j = await r.json(); if (!j.access_token) { console.error('token refresh failed:', j.error || r.status); process.exit(1); } return (tok[ch] = j.access_token);
}
async function api(ch, path, opt = {}) {
  const r = await fetch('https://www.googleapis.com/youtube/v3/' + path, { ...opt, headers: { Authorization: 'Bearer ' + await token(ch), 'Content-Type': 'application/json', ...(opt.headers || {}) } });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = { raw: t }; }
  if (!r.ok) throw new Error(`${r.status} ${j.error?.message || t.slice(0, 200)}`); return j;
}
const url = k => X.urls[k], line = (text, u) => `▶ ${text}: ${u}`, yt = id => `https://youtu.be/${id}`;

// each target: { kind, ch, id, label, need: { <lang|default>: [[mustContain, lineToInsert]…] } }
function targets() {
  const T = [], ko = [['@bibleinonescroll', line(X.ko.intl, url('intl_channel'))]];
  // music → narrated only; a narrated version never links back to the music version (관리자 2026-11-13)
  if (U.film.ko?.id) T.push({ kind: 'ko-film', ch: 'ko', id: U.film.ko.id, label: '14분 ko', need: { default: [...ko, ...(U.film['ko-narr']?.id ? [[yt(U.film['ko-narr'].id), null]] : [])] } });
  if (U.film['ko-narr']?.id) T.push({ kind: 'ko-film', ch: 'ko', id: U.film['ko-narr'].id, label: '14분 ko-narr', need: { default: ko }, forbid: [U.film.ko.id] });
  for (const [n, id] of Object.entries(U.shorts.ko.ids)) T.push({ kind: 'ko-shorts', ch: 'ko', id, label: `쇼츠 ${n}`, need: { default: ko } });
  const s4 = U.silence400; for (const [k, v] of [['h', s4.h], ['v', s4.v], ...Object.entries(s4.clips || {})]) if (v?.id) T.push({ kind: 'ko-silence400', ch: 'ko', id: v.id, label: `400년 ${k}`, need: { default: ko } });
  for (const [L, t] of Object.entries(X.film14)) { const id = G.film[L]?.id; if (!id) continue;
    T.push({ kind: 'gl-film', ch: 'gl', id, label: `14min ${L}`, need: { default: [['/@bibleinonescroll/playlists', line(t.langs, url('intl_playlists'))],
      [url('ko_film_music'), line(t.korean, url('ko_film_music'))], [url('gl_silence400'), line(t.silence400, url('gl_silence400'))]] } });
    // a language with a narrated version: the music version links to it; the narrated one never links back (관리자 2026-11-13). Needs film14.<L>.narr.
    const nid = G.film[`${L}-narr`]?.id; if (nid) { const T0 = T[T.length - 1];
      T0.need.default.push([yt(nid), t.narr ? line(t.narr, yt(nid)) : null]);
      T.push({ kind: 'gl-film', ch: 'gl', id: nid, label: `14min ${L}-narr`, forbid: [id], need: { default: [['/@bibleinonescroll/playlists', line(t.langs, url('intl_playlists'))],
        [url('ko_film_music'), line(t.korean, url('ko_film_music'))], [url('gl_silence400'), line(t.silence400, url('gl_silence400'))]] } }); } }
  const g4 = G.films?.silence400; for (const k of ['h', 'v']) { const id = g4?.[k]?.id; if (!id) continue; const need = {};
    for (const [L, t] of Object.entries(X.silence400)) need[L === 'en' ? 'default' : L] = [[yt(G.film[L].id), line(t.film14, yt(G.film[L].id))],
      ['/@bibleinonescroll/playlists', line(t.langs, url('intl_playlists'))], [url('ko_silence400'), line(t.korean, url('ko_silence400'))]];
    T.push({ kind: 'gl-silence400', ch: 'gl', id, label: `400 ${k}`, need }); }
  return T;
}
// insert after the last line with the site address, else after the last ▶ line, else before the hashtags / at the end
function insert(desc, lines) {
  const add = lines.filter(l => !desc.includes(l)); if (!add.length) return desc; const L = desc.split('\n');
  let at = L.map(l => l.includes('one-scroll-bible.com')).lastIndexOf(true); if (at < 0) at = L.map(l => l.startsWith('▶')).lastIndexOf(true);
  if (at < 0) { const h = L.findIndex(l => l.startsWith('#')); h < 0 ? L.push('', ...add) : L.splice(h, 0, ...add, ''); } else L.splice(at + 1, 0, ...add);
  return L.join('\n');
}
async function fetchAll(T) {
  const got = {}; for (const ch of ['ko', 'gl']) { const ids = T.filter(t => t.ch === ch).map(t => t.id);
    for (let i = 0; i < ids.length; i += 50) for (const v of (await api(ch, `videos?part=snippet,localizations&id=${ids.slice(i, i + 50).join(',')}`)).items || []) got[v.id] = v; }
  return got;
}
const forbidden = (t, v) => (t.forbid || []).filter(s => v.snippet.description.includes(s));
const missing = (t, v) => [...forbidden(t, v).map(s => ['default', `(must not link ${s})`, v.snippet.description])].concat(Object.entries(t.need).flatMap(([L, rules]) => { const d = L === 'default' ? v.snippet.description : v.localizations?.[L]?.description;
  return d == null ? [[L, '(no localization)', null]] : rules.filter(([must]) => !d.includes(must)).map(([, ln]) => ln ? [L, ln, d] : [L, '(line text missing in xlinks.json)', null]); }));

const [cmd, ...rest] = process.argv.slice(2), flag = n => { const i = rest.indexOf(n); return i < 0 ? null : rest[i + 1]; };
if (cmd === 'audit' || cmd === 'apply') {
  let T = targets(); const kind = flag('--kind'); if (kind) T = T.filter(t => t.kind === kind);
  const got = await fetchAll(T), dry = rest.includes('--dry'), max = +(flag('--max') || 1e9); let done = 0;
  const byKind = {}; for (const t of T) { const v = got[t.id], m = v ? missing(t, v) : [['default', '(video not found)', null]]; (byKind[t.kind] ||= []).push({ t, v, m }); }
  for (const [k, list] of Object.entries(byKind)) { const bad = list.filter(x => x.m.length);
    console.log(`${k}: ${list.length - bad.length}/${list.length} linked${bad.length ? ' — missing: ' + bad.map(x => x.t.label).join(', ') : ''}`);
    if (cmd !== 'apply') continue;
    for (const { t, v, m } of bad) { if (!v || done >= max) continue; if (m.some(([, , d]) => d == null)) { console.log(`  ${t.label}: skip (${m.find(x => x[2] == null)[1]})`); continue; }
      const sn = { ...v.snippet, categoryId: v.snippet.categoryId || '27' }, loc = v.localizations ? JSON.parse(JSON.stringify(v.localizations)) : null;
      if (t.forbid) sn.description = sn.description.split('\n').filter(l => !t.forbid.some(s => l.includes(s))).join('\n');
      const want = (d, rules) => (rules || []).filter(([must, ln]) => ln && !d.includes(must)).map(r => r[1]);
      sn.description = insert(sn.description, want(sn.description, t.need.default));
      if (loc) for (const L of Object.keys(t.need).filter(L => L !== 'default')) loc[L].description = insert(loc[L].description, want(loc[L].description, t.need[L]));
      if (loc && sn.defaultLanguage && loc[sn.defaultLanguage]) loc[sn.defaultLanguage].description = sn.description;
      if (dry) { mkdirSync(OUT, { recursive: true }); writeFileSync(join(OUT, `${t.id}.txt`), `--- ${t.label}\n${sn.description}\n` + (loc ? Object.entries(loc).map(([L, x]) => `\n--- ${L}\n${x.description}\n`).join('') : '')); console.log(`  ${t.label}: dry → out/xlinks/${t.id}.txt`); }
      else { await api(t.ch, `videos?part=snippet${loc ? ',localizations' : ''}`, { method: 'PUT', body: JSON.stringify({ id: t.id, snippet: sn, ...(loc ? { localizations: loc } : {}) }) }); console.log(`  ${t.label}: saved`); }
      done++; } }
} else if (cmd === 'comment') {
  const [id, key] = rest; if (!id || !X[key]) { console.log('usage: comment <videoId> <xlinks.json key>'); process.exit(1); }
  const j = await api('gl', 'commentThreads?part=snippet', { method: 'POST', body: JSON.stringify({ snippet: { videoId: id, topLevelComment: { snippet: { textOriginal: X[key] } } } }) });
  console.log(`${id}: comment ${j.id} — pin it in Studio`);
} else console.log('usage: node motion/youtube/xlinks.mjs audit | apply [--kind k] [--dry] [--max N] | comment <videoId> <key>');
