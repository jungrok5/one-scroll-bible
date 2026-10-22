// IndexNow: tell Bing, Naver, Yandex, Seznam … (every IndexNow engine shares one submission) which pages changed,
// so they are re-crawled within minutes instead of whenever the crawler next comes by. Google does not use IndexNow —
// for Google the sitemap's honest <lastmod> is the signal.
//   node tools/indexnow.mjs --since 2026-10-22 [--dry]   → pings every sitemap URL whose <lastmod> is on/after that date
//   node tools/indexnow.mjs https://one-scroll-bible.com/film/ …  → pings those URLs
//   node tools/indexnow.mjs --all-langs              → every language page (the template, index.html or the build, changed:
//        every page's HTML changes although each language's own source — and so its <lastmod> — did not)
// Reads sitemap.xml from the repo root (run node tools/build-pages.mjs first). The key file /<KEY>.txt at the site root
// proves we own the host; it is public by design. Run automatically after each deploy by .github/workflows/indexnow.yml.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'one-scroll-bible.com';
const KEY = fs.readdirSync(root).map(f => f.match(/^([0-9a-f]{32})\.txt$/)).find(Boolean)?.[1];
if (!KEY) { console.error('indexnow: no <32-hex>.txt key file at the repo root'); process.exit(1); }
const args = process.argv.slice(2), dry = args.includes('--dry');
const si = args.indexOf('--since');
let urls = args.filter((a, i) => /^https:\/\//.test(a) && args[i - 1] !== '--since');
if (args.includes('--all-langs')) {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  for (const m of xml.matchAll(/<loc>(https:\/\/[^/]+\/(?:[A-Za-z-]+\/)?)<\/loc>/g)) if (!/\/(languages|film|about|maps)\/$/.test(m[1])) urls.push(m[1]);
}
if (si >= 0) {
  const since = args[si + 1], xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)) if (m[2] >= since) urls.push(m[1]);
}
urls = [...new Set(urls)].filter(u => new URL(u).host === HOST);
if (!urls.length) { console.log('indexnow: nothing changed — no ping'); process.exit(0); }
console.log(`indexnow: ${urls.length} URL(s)\n` + urls.slice(0, 20).map(u => '  ' + u).join('\n') + (urls.length > 20 ? `\n  … +${urls.length - 20}` : ''));
if (dry) process.exit(0);
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log('indexnow:', res.status, res.statusText, (await res.text()).slice(0, 200));
if (![200, 202].includes(res.status)) process.exit(1);   // 200 ok · 202 accepted (key being checked) · 403 key not found · 422 bad URLs
