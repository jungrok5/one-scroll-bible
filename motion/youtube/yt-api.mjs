// YouTube Data API helper (after motion/youtube/yt-auth.mjs). Credentials come only from YT_CLIENT_ID / YT_CLIENT_SECRET /
// YT_REFRESH_TOKEN (environment, or ~/.config/one-scroll-bible/youtube.env) and are never printed.
//   node motion/youtube/yt-api.mjs whoami                    → the channel these credentials act as (must be @one-scroll-bible)
//   node motion/youtube/yt-api.mjs captions [<lang…>] [--dry] → upload motion/subs/<lang>/film-h.srt to that language's
//        landscape film (ids in motion/youtube/uploaded.json) as a caption track in the film's own language; skips a film
//        that already has a track in that language. Default: every language with a film id. Quota: 400 units per upload.
// Why captions: the film has no speech, so YouTube makes no captions; its text is burned into the picture, which search
// cannot read. A caption track in the film's language makes those lines searchable (and lets viewers turn on auto-translate).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), M = join(HERE, '..');
function creds() {
  const env = { ...process.env }, f = join(homedir(), '.config', 'one-scroll-bible', 'youtube.env');
  if (existsSync(f)) for (const l of readFileSync(f, 'utf8').split('\n')) { const m = l.match(/^(YT_\w+)=(.*)$/); if (m && !env[m[1]]) env[m[1]] = m[2]; }
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
} else console.log('usage: node motion/youtube/yt-api.mjs whoami | captions [<lang…>] [--dry]');
