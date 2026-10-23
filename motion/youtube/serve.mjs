// Local read-only file server for the YouTube paste-in helpers (studio-upload.js, studio-shorts.js, studio-describe.js,
// studio-comment.js): serves this repo's motion/ folder on http://127.0.0.1:8765 so a Studio / watch page can fetch the
// videos, thumbnails, captions and manifest.json (the Chrome extension's file_upload caps at 10 MB).
//   node motion/youtube/serve.mjs          (leave it running; Ctrl+C to stop)
// CORS is limited to YouTube's own pages; Access-Control-Allow-Private-Network lets an https page reach 127.0.0.1.
// (Lived only in a session scratchpad until 2026-10-23 — and allowed only studio.youtube.com, so the comment helper on
// www.youtube.com failed with "Failed to fetch".)
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');   // motion/
const PORT = +(process.env.PORT || 8765);
// + Meta Business Suite, where the Instagram Reels are scheduled (motion/social/insta_reels_plan.mjs)
const ORIGINS = new Set(['https://studio.youtube.com', 'https://www.youtube.com', 'https://business.facebook.com']);
const TYPES = { '.html': 'text/html; charset=utf-8', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.png': 'image/png', '.srt': 'text/plain; charset=utf-8', '.json': 'application/json', '.md': 'text/plain; charset=utf-8' };

createServer((req, res) => {
  const o = req.headers.origin;
  if (o && ORIGINS.has(o)) res.setHeader('Access-Control-Allow-Origin', o);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-store');   // the helpers must always see the current manifest
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
  const f = resolve(ROOT, rel);
  if (!f.startsWith(ROOT + sep) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream', 'Content-Length': statSync(f).size });
  if (req.method === 'HEAD') return res.end();
  createReadStream(f).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} (read-only) on http://127.0.0.1:${PORT}`));
