// Every video's language settings (title/description language + audio language) match its language (관리자 2026-11-13:
// "언어별로 영상 언어설정은 제대로 되어있겠지?"). Wrong settings hurt search and the Shorts feed in that language.
//   node motion/youtube/yt-langs.mjs audit          → mismatches on both channels (≈1 unit per 50 videos)
//   node motion/youtube/yt-langs.mjs fix [--max N]  → set them (50 units per video; keeps title/description/tags/category)
// Expected: Korean channel = ko; international channel = the video's language (YouTube codes: zh-Hans→zh-CN, zh-Hant→zh-TW,
// pt-BR→pt, tl→fil — same as global-move.mjs); series films (one English-text master) = en. Music versions have no speech
// but take the on-screen language as audio language too, so YouTube files them under that language.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), U = JSON.parse(readFileSync(join(HERE, 'uploaded.json'), 'utf8')), G = U.global;
process.on('uncaughtException', e => { console.error('error: ' + String(e.message).replace(/<[^>]+>/g, '')); process.exit(1); });
export const YT_LANG = { 'zh-Hans': 'zh-CN', 'zh-Hant': 'zh-TW', 'pt-BR': 'pt', tl: 'fil' };
const yl = L => YT_LANG[L] || L, tok = {};
async function api(ch, p, o = {}) {
  if (!tok[ch]) { const e = process.env, rt = ch === 'gl' ? e.YT_REFRESH_TOKEN_GLOBAL : e.YT_REFRESH_TOKEN; if (!rt) { console.error('missing YT_* environment variables'); process.exit(1); }
    tok[ch] = (await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: rt, grant_type: 'refresh_token' }) })).json()).access_token; }
  const r = await fetch('https://www.googleapis.com/youtube/v3/' + p, { ...o, headers: { Authorization: 'Bearer ' + tok[ch], 'Content-Type': 'application/json' } });
  const t = await r.text(), j = t ? JSON.parse(t) : {}; if (!r.ok) throw new Error(`${r.status} ${j.error?.message || t.slice(0, 200)}`); return j;
}
function targets() {
  const T = [], add = (ch, id, lang, label) => id && T.push({ ch, id, lang, label });
  for (const k of ['ko', 'ko-narr', 'ko-v', 'ko-narr-v']) add('ko', U.film[k]?.id, 'ko', `ko 14분 ${k}`);
  for (const [n, id] of Object.entries(U.shorts.ko.ids || {})) add('ko', id, 'ko', `ko 쇼츠 ${n}`);
  const s4 = U.silence400; for (const [k, v] of [['h', s4?.h], ['v', s4?.v], ...Object.entries(s4?.clips || {})]) add('ko', v?.id, 'ko', `ko 400 ${k}`);
  for (const [k, v] of Object.entries(G.film || {})) { const L = k.replace(/-(narr-v|narr|v)$/, ''); add('gl', v?.id, yl(L), `gl 14min ${k}`); }
  for (const [L, s] of Object.entries(G.shorts || {})) for (const [n, id] of Object.entries(s.ids || {})) add('gl', id, yl(L), `gl shorts ${L} ${n}`);
  for (const [f, v] of Object.entries(G.films || {})) for (const o of ['h', 'v']) if (v?.[o]?.id) add('gl', v[o].id, yl(v[o].default || 'en'), `gl ${f} ${o}`);
  return T;
}
const [cmd, ...rest] = process.argv.slice(2), max = +(rest[rest.indexOf('--max') + 1] || 1e9);
if (cmd !== 'audit' && cmd !== 'fix') { console.log('usage: node motion/youtube/yt-langs.mjs audit | fix [--max N]'); process.exit(1); }
const T = targets(), got = {};
for (const ch of ['ko', 'gl']) { const ids = T.filter(t => t.ch === ch).map(t => t.id);
  for (let i = 0; i < ids.length; i += 50) for (const v of (await api(ch, `videos?part=snippet&id=${ids.slice(i, i + 50).join(',')}`)).items || []) got[v.id] = v; }
const bad = T.filter(t => { const s = got[t.id]?.snippet; return s && (s.defaultLanguage !== t.lang || s.defaultAudioLanguage !== t.lang); });
const missing = T.filter(t => !got[t.id]);
console.log(`${T.length} videos checked · ${T.length - bad.length - missing.length} ok · ${bad.length} wrong · ${missing.length} not found`);
for (const t of missing) console.log(`  not found: ${t.label} ${t.id}`);
const byKind = {}; for (const t of bad) { const s = got[t.id].snippet, k = `${t.label.replace(/ \d+$/, '')}: ${s.defaultLanguage || '-'}/${s.defaultAudioLanguage || '-'} → ${t.lang}`; (byKind[k] ||= []).push(t); }
for (const [k, list] of Object.entries(byKind)) console.log(`  ${k} (${list.length})`);
if (cmd === 'fix') { let n = 0; for (const t of bad.slice(0, max)) { const s = got[t.id].snippet;
    await api(t.ch, 'videos?part=snippet', { method: 'PUT', body: JSON.stringify({ id: t.id, snippet: { title: s.title, description: s.description, tags: s.tags, categoryId: s.categoryId || '27', defaultLanguage: t.lang, defaultAudioLanguage: t.lang } }) }); n++; }
  console.log(`fixed ${n}${bad.length > n ? ` — ${bad.length - n} left (run again)` : ''}`); }
