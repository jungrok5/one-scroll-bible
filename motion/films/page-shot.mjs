// Screenshot a draft page at desktop and phone width before publishing it (make-film skill: "Screenshot it at 1280 and 400 px").
//   node motion/films/page-shot.mjs motion/out/review/<film>.html [--widths 1280,400] [--full] [--el '#direction']
// Writes <page>-<width>.png next to the page and prints the paths. Playwright is loaded the same way as motion/sheets.mjs.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright'))); }
const args = process.argv.slice(2), page = args.find(a => !a.startsWith('--'));
if (!page) { console.error('usage: page-shot.mjs <page.html> [--widths 1280,400] [--full]'); process.exit(1); }
const wi = args.indexOf('--widths'), widths = (wi > -1 ? args[wi + 1] : '1280,400').split(',').map(Number), full = args.includes('--full');
const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--allow-file-access-from-files'] });
for (const w of widths) {
  const p = await browser.newPage({ viewport: { width: w, height: w > 600 ? 900 : 860 }, deviceScaleFactor: 1 });
  await p.goto(pathToFileURL(resolve(page)).href, { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(600);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const si = args.indexOf('--el'), sel = si > -1 ? args[si + 1] : null;   // one section only, e.g. --el '#direction'
  const out = resolve(page).replace(/\.html$/, `${sel ? '-' + sel.replace(/\W+/g, '') : ''}-${w}.png`);
  if (sel) { const el = await p.$(sel); if (!el) { console.error('no element ' + sel); process.exit(1); } await el.screenshot({ path: out }); }
  else await p.screenshot({ path: out, fullPage: full });
  console.log(out + (overflow > 1 ? `  ⚠ 가로 넘침 ${overflow}px` : ''));
  await p.close();
}
await browser.close();
