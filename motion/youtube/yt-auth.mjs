// One-time YouTube Data API sign-in for this computer (the maintainer runs it; it never prints a secret).
//   1. Google Cloud console (signed in as the channel's owner account): create a project → enable "YouTube Data API v3" →
//      OAuth consent screen (External, add yourself as a test user) → Credentials → Create OAuth client ID →
//      type "Desktop app" → Download JSON (client_secret_….json — gitignored; keep it outside the repo or delete it after).
//   2. node motion/youtube/yt-auth.mjs <path to client_secret_….json>
//      → opens the Google consent page; choose the account that owns @one-scroll-bible (or its brand account) → Allow.
//      The refresh token and the client id/secret are saved as Windows user environment variables
//      (YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN) with setx — open a new terminal afterwards.
//      On macOS/Linux it writes them to ~/.config/one-scroll-bible/youtube.env (mode 600) instead.
//   Another channel of the same owner (a Brand Account channel, e.g. word-log), same client:
//      node motion/youtube/yt-auth.mjs --as WORDLOG      (client id/secret from YT_CLIENT_ID / YT_CLIENT_SECRET)
//      → pick that channel on the consent page; saves only YT_REFRESH_TOKEN_WORDLOG (the main token is left alone) and
//        prints which channel the new token acts as.
// Scopes: youtube.force-ssl (captions need it; it also covers metadata, playlists, comments) and yt-analytics.readonly
// (also enable "YouTube Analytics API" in the project). Revoke any time at myaccount.google.com → Security → Third-party access.
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { randomBytes, createHash } from 'node:crypto';

const args = process.argv.slice(2), ai = args.indexOf('--as'), AS = ai >= 0 ? (args[ai + 1] || '').toUpperCase() : '';
if (ai >= 0 && !/^[A-Z0-9_]+$/.test(AS)) { console.log('--as needs a name like WORDLOG'); process.exit(1); }
const file = args.find((a, i) => !a.startsWith('--') && (ai < 0 || i !== ai + 1));
if (!file && !(AS && process.env.YT_CLIENT_ID && process.env.YT_CLIENT_SECRET)) { console.log('usage: node motion/youtube/yt-auth.mjs <client_secret_….json> [--as NAME]  (or --as NAME with YT_CLIENT_ID / YT_CLIENT_SECRET set)'); process.exit(1); }
const j = file ? JSON.parse(readFileSync(file, 'utf8')) : { installed: { client_id: process.env.YT_CLIENT_ID, client_secret: process.env.YT_CLIENT_SECRET } }, c = j.installed || j.web;
if (!c?.client_id || !c?.client_secret) { console.error('not an OAuth client JSON (need "installed" with client_id/client_secret)'); process.exit(1); }
// youtube.force-ssl: captions, metadata, playlists, comments · yt-analytics.readonly: retention / views for the 7-day wave check
const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/yt-analytics.readonly';
const verifier = randomBytes(32).toString('base64url'), challenge = createHash('sha256').update(verifier).digest('base64url'), state = randomBytes(8).toString('hex');

const srv = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  const u = new URL(req.url, 'http://127.0.0.1');
  if (u.pathname !== '/cb') { res.writeHead(404); return res.end(); }
  if (u.searchParams.get('state') !== state || !u.searchParams.get('code')) { res.end('sign-in failed (state/code) — run again'); srv.close(); process.exit(1); }
  const redirect = `http://127.0.0.1:${srv.address().port}/cb`;
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code: u.searchParams.get('code'), client_id: c.client_id, client_secret: c.client_secret, redirect_uri: redirect, grant_type: 'authorization_code', code_verifier: verifier }) });
  const t = await r.json();
  if (!t.refresh_token) { res.end('no refresh token returned — remove the app at myaccount.google.com → Third-party access and run again'); console.error('token exchange failed:', t.error || r.status); srv.close(); process.exit(1); }
  // --as NAME: another channel of the same owner — save only its refresh token, never touch the main one
  const vals = AS ? { ['YT_REFRESH_TOKEN_' + AS]: t.refresh_token } : { YT_CLIENT_ID: c.client_id, YT_CLIENT_SECRET: c.client_secret, YT_REFRESH_TOKEN: t.refresh_token };
  const me = await (await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { headers: { Authorization: 'Bearer ' + t.access_token } })).json().catch(() => ({}));
  const ch = (me.items || []).map(x => `${x.snippet.title} ${x.snippet.customUrl || ''} (${x.id})`).join(', ') || '(no channel)';
  if (platform() === 'win32') for (const [k, v] of Object.entries(vals)) execFileSync('setx', [k, v], { stdio: 'ignore' });
  else { const d = join(homedir(), '.config', 'one-scroll-bible'); mkdirSync(d, { recursive: true }); const f = join(d, 'youtube.env');
    let old = []; try { old = readFileSync(f, 'utf8').split('\n').filter(l => l && !Object.keys(vals).some(k => l.startsWith(k + '='))); } catch {}
    writeFileSync(f, [...old, ...Object.entries(vals).map(([k, v]) => `${k}=${v}`)].join('\n') + '\n'); chmodSync(f, 0o600); }
  res.end('Done — you can close this tab. (Credentials saved on this computer; nothing was shown.) Channel: ' + ch);
  console.log(`saved ${Object.keys(vals).join(' / ')} for this user — channel: ${ch} — open a new terminal`);
  srv.close();
});
srv.listen(0, '127.0.0.1', () => {
  const redirect = `http://127.0.0.1:${srv.address().port}/cb`;
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({ client_id: c.client_id, redirect_uri: redirect, response_type: 'code', scope: SCOPE,
    access_type: 'offline', prompt: 'consent', state, code_challenge: challenge, code_challenge_method: 'S256' });
  console.log('Opening the Google consent page… (if it does not open, paste this into the browser)\n' + url);
  // not `cmd /c start`: cmd treats the URL's & as a command separator and cuts it after client_id
  const open = platform() === 'win32' ? ['rundll32', ['url.dll,FileProtocolHandler', url]] : platform() === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  spawn(open[0], open[1], { stdio: 'ignore', detached: true }).unref();
});
