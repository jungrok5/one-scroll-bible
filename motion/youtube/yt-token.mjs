// One place that turns the saved YouTube credentials into an access token, for every tool (never prints a secret).
//   import { accessToken } from './yt-token.mjs';  const t = await accessToken('gl');   // 'ko' (default) · 'gl' = GLOBAL · or a name like WORDLOG
// Credentials: Windows user environment variables or ~/.config/one-scroll-bible/youtube.env (yt-auth.mjs writes them).
//   Korean channel  YT_CLIENT_ID · YT_CLIENT_SECRET · YT_REFRESH_TOKEN
//   another channel YT_REFRESH_TOKEN_<NAME>, with its own client YT_CLIENT_ID_<NAME> · YT_CLIENT_SECRET_<NAME> when that exists,
//                   else the Korean channel's client (the shared project — both channels then share one 10,000-unit daily quota).
// Decision box D2 (approved 2026-11-13): the international channel gets its own Google Cloud project →
//   node motion/youtube/yt-auth.mjs <client_secret_….json> --as GLOBAL --own-client  saves YT_CLIENT_ID_GLOBAL / _SECRET_GLOBAL /
//   YT_REFRESH_TOKEN_GLOBAL together, and every tool picks them up here with no other change.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export function ytEnv() {
  const env = { ...process.env }, f = join(homedir(), '.config', 'one-scroll-bible', 'youtube.env');
  if (existsSync(f)) for (const l of readFileSync(f, 'utf8').split('\n')) { const m = l.match(/^(YT_\w+)=(.*)$/); if (m && !env[m[1]]) env[m[1]] = m[2]; }
  return env;
}
const name = ch => { const c = String(ch || 'ko'); return c === 'ko' ? '' : c === 'gl' ? 'GLOBAL' : c.toUpperCase(); };
// which client and token a channel uses — names only (for status lines), never the values
export function clientFor(ch) {
  const e = ytEnv(), N = name(ch), own = N && e['YT_CLIENT_ID_' + N] && e['YT_CLIENT_SECRET_' + N];
  return { id: own ? e['YT_CLIENT_ID_' + N] : e.YT_CLIENT_ID, secret: own ? e['YT_CLIENT_SECRET_' + N] : e.YT_CLIENT_SECRET,
    refresh: N ? e['YT_REFRESH_TOKEN_' + N] : e.YT_REFRESH_TOKEN, project: own ? 'own:' + N : 'shared', vars: N ? `YT_REFRESH_TOKEN_${N}${own ? ` + YT_CLIENT_ID_${N}` : ''}` : 'YT_REFRESH_TOKEN' };
}
const cache = {};
export async function accessToken(ch = 'ko') {
  const N = name(ch); if (cache[N]) return cache[N];
  const c = clientFor(ch);
  if (!c.id || !c.secret || !c.refresh) { console.error(`missing YouTube credentials for ${N || 'the Korean channel'} (${c.vars}) — load the YT_* user environment variables, or run motion/youtube/yt-auth.mjs`); process.exit(1); }
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: c.id, client_secret: c.secret, refresh_token: c.refresh, grant_type: 'refresh_token' }) });
  const j = await r.json(); if (!j.access_token) { console.error(`token refresh failed (${N || 'ko'}, ${c.project}):`, j.error || r.status); process.exit(1); }
  who[j.access_token] = c.project;
  return (cache[N] = j.access_token);
}

// ── Quota ledger (operations-proposal §4-6, week 2) ─────────────────────────────────────────────────────────────────
// Every tool that imports this file has its YouTube Data API calls counted here: the global fetch is wrapped once, a call to
// www.googleapis.com/youtube/v3 or /upload/youtube/v3 is priced from Google's cost table and added to motion/studio/quota.json
// under the quota day (it resets at midnight Pacific time = 17:00 KST, 16:00 in US summer time) and the project that pays
// ('shared' = the Korean channel's project, 'own:GLOBAL' once D2 is done). The Analytics API has its own quota and is not counted.
// Read it with node motion/studio/studio.mjs status (할당량). Never stores a token or a request body — only units and the endpoint name.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname as _dir } from 'node:path';
import { fileURLToPath as _f2p } from 'node:url';
const QF = join(_dir(_f2p(import.meta.url)), '..', 'studio', 'quota.json');
// units per call (developers.google.com/youtube/v3/determine_quota_cost, checked 2026-11-16)
const COST = { 'search': 100, 'videos.insert': 1600, 'captions.list': 50, 'captions.insert': 400, 'captions.update': 450, 'captions.download': 200, 'captions.delete': 50,
  'thumbnails.set': 50, 'playlistItems.insert': 50, 'playlistItems.update': 50, 'playlistItems.delete': 50, 'playlists.insert': 50,
  'playlists.update': 50, 'playlists.delete': 50, 'videos.update': 50, 'videos.delete': 50, 'videos.rate': 50, 'comments.insert': 50,
  'commentThreads.insert': 50, 'comments.setModerationStatus': 50, 'comments.update': 50, 'comments.delete': 50, 'channels.update': 50,
  'channelSections.insert': 50, 'channelSections.update': 50, 'channelSections.delete': 50 };
export function quotaDay(t = Date.now()) {   // the Pacific-time date the call counts toward
  const d = new Date(t), y = d.getUTCFullYear();
  const nth = (m, n) => { const x = new Date(Date.UTC(y, m, 1)); return new Date(Date.UTC(y, m, 1 + ((7 - x.getUTCDay()) % 7) + 7 * (n - 1), 10)); };   // US DST: 2nd Sun Mar 10:00 UTC → 1st Sun Nov 09:00 UTC
  const dst = t >= nth(2, 2).getTime() && t < nth(10, 1).getTime() - 3600e3;
  return new Date(t - (dst ? 7 : 8) * 3600e3).toISOString().slice(0, 10);
}
export function priceOf(method, url) {
  const u = new URL(url), m = u.pathname.match(/\/youtube\/v3\/(\w+)(?:\/(\w+))?/); if (!m) return null;
  const res = m[1], sub = m[2], M = (method || 'GET').toUpperCase();
  if (res === 'search') return ['search', 100];
  if (res === 'captions' && M === 'GET' && u.pathname.split('/').length > 4) return ['captions.download', 200];
  if (res === 'thumbnails') return ['thumbnails.set', 50];
  if (res === 'comments' && sub === 'setModerationStatus') return ['comments.setModerationStatus', 50];
  if (res === 'videos' && sub === 'rate') return ['videos.rate', 50];
  const op = M === 'GET' ? 'list' : M === 'POST' ? 'insert' : M === 'PUT' ? 'update' : M === 'DELETE' ? 'delete' : M.toLowerCase();
  const k = `${res}.${op}`; return [k, COST[k] ?? (op === 'list' ? 1 : 50)];
}
const who = {};   // access token → project, so a call is charged to the project that issued it
function charge(project, what, units) {
  let Q = {}; try { Q = JSON.parse(readFileSync(QF, 'utf8')); } catch {}
  const day = quotaDay(); if (Q.day !== day) Q = { _about: 'YouTube Data API units by quota day (Pacific) — written by motion/youtube/yt-token.mjs; studio.mjs status reads it', day, projects: {}, prev: Q.day ? { day: Q.day, projects: Q.projects } : Q.prev };
  const P = (Q.projects[project] ||= { total: 0, by: {} }); P.total += units; P.by[what] = (P.by[what] || 0) + units; P.last = new Date().toISOString();
  try { mkdirSync(_dir(QF), { recursive: true }); writeFileSync(QF, JSON.stringify(Q, null, 1) + '\n'); } catch {}
}
if (!globalThis.__osbQuota) {
  globalThis.__osbQuota = true; const raw = globalThis.fetch;
  globalThis.fetch = async (input, opt = {}) => {
    const url = typeof input === 'string' ? input : input?.url || String(input);
    if (/^https:\/\/(www\.)?googleapis\.com\/(upload\/)?youtube\/v3\//.test(url)) {
      const p = priceOf(opt.method || input?.method, url), h = opt.headers || {}, auth = (h.Authorization || h.authorization || '').replace(/^Bearer /, '');
      if (p) charge(who[auth] || 'shared', p[0], p[1]);
    }
    return raw(input, opt);
  };
}
