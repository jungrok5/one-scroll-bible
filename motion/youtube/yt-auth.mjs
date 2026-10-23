// One-time YouTube Data API sign-in for this computer (the maintainer runs it; it never prints a secret).
//   1. Google Cloud console (signed in as the channel's owner account): create a project → enable "YouTube Data API v3" →
//      OAuth consent screen (External, add yourself as a test user) → Credentials → Create OAuth client ID →
//      type "Desktop app" → Download JSON (client_secret_….json — gitignored; keep it outside the repo or delete it after).
//   2. node motion/youtube/yt-auth.mjs <path to client_secret_….json>
//      → opens the Google consent page; choose the account that owns @one-scroll-bible (or its brand account) → Allow.
//      The refresh token and the client id/secret are saved as Windows user environment variables
//      (YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN) with setx — open a new terminal afterwards.
//      On macOS/Linux it writes them to ~/.config/one-scroll-bible/youtube.env (mode 600) instead.
// Scopes: youtube.force-ssl (captions need it; it also covers metadata, playlists, comments) and yt-analytics.readonly
// (also enable "YouTube Analytics API" in the project). Revoke any time at myaccount.google.com → Security → Third-party access.
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { randomBytes, createHash } from 'node:crypto';

const file = process.argv[2];
if (!file) { console.log('usage: node motion/youtube/yt-auth.mjs <client_secret_….json>'); process.exit(1); }
const j = JSON.parse(readFileSync(file, 'utf8')), c = j.installed || j.web;
if (!c?.client_id || !c?.client_secret) { console.error('not an OAuth client JSON (need "installed" with client_id/client_secret)'); process.exit(1); }
// youtube.force-ssl: captions, metadata, playlists, comments · yt-analytics.readonly: retention / views for the 7-day wave check
const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/yt-analytics.readonly';
const verifier = randomBytes(32).toString('base64url'), challenge = createHash('sha256').update(verifier).digest('base64url'), state = randomBytes(8).toString('hex');

const srv = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  if (u.pathname !== '/cb') { res.writeHead(404); return res.end(); }
  if (u.searchParams.get('state') !== state || !u.searchParams.get('code')) { res.end('sign-in failed (state/code) — run again'); srv.close(); process.exit(1); }
  const redirect = `http://127.0.0.1:${srv.address().port}/cb`;
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code: u.searchParams.get('code'), client_id: c.client_id, client_secret: c.client_secret, redirect_uri: redirect, grant_type: 'authorization_code', code_verifier: verifier }) });
  const t = await r.json();
  if (!t.refresh_token) { res.end('no refresh token returned — remove the app at myaccount.google.com → Third-party access and run again'); console.error('token exchange failed:', t.error || r.status); srv.close(); process.exit(1); }
  const vals = { YT_CLIENT_ID: c.client_id, YT_CLIENT_SECRET: c.client_secret, YT_REFRESH_TOKEN: t.refresh_token };
  if (platform() === 'win32') for (const [k, v] of Object.entries(vals)) execFileSync('setx', [k, v], { stdio: 'ignore' });
  else { const d = join(homedir(), '.config', 'one-scroll-bible'); mkdirSync(d, { recursive: true }); const f = join(d, 'youtube.env');
    writeFileSync(f, Object.entries(vals).map(([k, v]) => `${k}=${v}`).join('\n') + '\n'); chmodSync(f, 0o600); }
  res.end('Done — you can close this tab. (Credentials saved on this computer; nothing was shown.)');
  console.log('saved YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN for this user — open a new terminal, then: node motion/youtube/yt-api.mjs whoami');
  srv.close();
});
srv.listen(0, '127.0.0.1', () => {
  const redirect = `http://127.0.0.1:${srv.address().port}/cb`;
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({ client_id: c.client_id, redirect_uri: redirect, response_type: 'code', scope: SCOPE,
    access_type: 'offline', prompt: 'consent', state, code_challenge: challenge, code_challenge_method: 'S256' });
  console.log('Opening the Google consent page… (if it does not open, paste this into the browser)\n' + url);
  const open = platform() === 'win32' ? ['cmd', ['/c', 'start', '', url]] : platform() === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  spawn(open[0], open[1], { stdio: 'ignore', detached: true }).unref();
});
