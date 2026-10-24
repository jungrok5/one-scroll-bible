// Screen-recording demo for the YouTube API audit (motion/youtube/API-AUDIT.md "데모 녹화 순서"): runs the tool's read-only
// commands one by one, printing each command before it runs, with a pause so a reviewer can read the output.
// Nothing here uploads or changes anything (upload/captions run with --dry), and no secret is printed.
//   node motion/youtube/demo.mjs            (YouTube Data API quota resets at midnight Pacific = 16:00/17:00 KST)
import { spawnSync } from 'node:child_process';
const sleep = s => new Promise(r => setTimeout(r, s * 1000));
const steps = [
  ['The channel this tool acts as (one-scroll-bible)', 'yt-api.mjs whoami', {}],
  ['Same tool, the second channel of the same owner (word-log, a Brand Account channel)', 'yt-api.mjs whoami', { YT_AS: 'WORDLOG' }],
  ['Publish status of our own videos, per language', 'yt-api.mjs status', {}],
  ['YouTube Analytics for our own videos (used to decide when to publish the next language)', 'yt-api.mjs stats', {}],
  ['Caption tracks it would upload (dry run)', 'yt-api.mjs captions --dry', {}],
  ['An upload it would make: file, title, scheduled time (dry run)', 'yt-api.mjs upload fr 1 --publish-at 2026-12-01T10:00:00Z --dry', {}],
];
console.log('one-scroll-bible tools — YouTube Data API v3 / YouTube Analytics API demo\n');
for (const [what, cmd, env] of steps) {
  console.log(`\n# ${what}`); console.log(`> ${Object.entries(env).map(([k, v]) => `${k}=${v} `).join('')}node motion/youtube/${cmd}`);
  await sleep(1.5);
  spawnSync(process.execPath, [new URL(cmd.split(' ')[0], import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), ...cmd.split(' ').slice(1)],
    { stdio: 'inherit', env: { ...process.env, ...env } });
  await sleep(4);
}
console.log('\nPrivacy policy (section 7, Use of YouTube API Services): https://one-scroll-bible.com/privacy.html');
