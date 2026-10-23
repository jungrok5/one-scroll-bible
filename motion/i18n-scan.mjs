// Find every on-screen string of a scene, or what a language is still missing.
//   node motion/i18n-scan.mjs ko  [scene…]   → motion/pilot/i18n/_ko/<scene>.json: the Korean strings to translate
//                                              ("ids": passed through Pilot.text/Pilot.tr — translatable as is;
//                                               "direct": Hangul drawn straight to the canvas — the scene must route it through Pilot.tr)
//   node motion/i18n-scan.mjs en  [scene…]   → prints, per scene, strings missing from i18n/en.json and Hangul still drawn (leaks)
// Seeks through the whole scene (every 0.25 s) in both orientations. No scene list = all 21 scenes.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const here = dirname(fileURLToPath(import.meta.url));
const ORDER = ['opening', 'creation', 'fall', 'patriarch', 'exodus', 'wilderness', 'judges', 'kingdom', 'exile', 'return',
  'silence', 'advent', 'cross', 'rise', 'church', 'renewal', 'mirror', 'gospel', 'evidence', 'ship', 'invite'];
const [lang = 'ko', ...only] = process.argv.slice(2);
const scenes = only.length ? only : ORDER;
const step = 0.25;
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
let bad = 0;
// scenes are independent: scan several at once (JOBS, default 4 — one scene at a time took 9–17 min on a CI runner)
const scan = async sc => {
  const seen = new Set(), miss = new Set(), drawn = new Set();
  for (const ori of ['h', 'v']) {
    const page = await browser.newPage({ viewport: ori === 'h' ? { width: 1920, height: 1080 } : { width: 1080, height: 1920 } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto(pathToFileURL(join(here, 'pilot', sc + '.html')).href + `?render=1&collect=1&o=${ori}` + (lang === 'ko' ? '' : `&lang=${lang}`));
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
    const r = await page.evaluate(async step => { for (let t = 0; t < window.DURATION; t += step) window.seek(t); return window.__i18n(); }, step);
    r.seen.forEach(s => seen.add(s)); r.miss.forEach(s => miss.add(s)); r.drawn.forEach(s => drawn.add(s));
    await page.close();
  }
  return { seen, miss, drawn };
};
const results = {}, queue = [...scenes];
await Promise.all(Array.from({ length: Math.min(+(process.env.JOBS || 4), scenes.length) }, async () => {
  while (queue.length) { const sc = queue.shift(); results[sc] = await scan(sc); }
}));
for (const sc of scenes) {   // report in scene order
  const { seen, miss, drawn } = results[sc];
  if (lang === 'ko') {
    // drawn but never passed through Pilot.tr, and not merely a typed-in prefix of a translatable string
    const ids = [...seen].sort(), direct = [...drawn].filter(d => !seen.has(d) && ![...seen].some(s => s.startsWith(d) || s.includes(d))).sort();
    mkdirSync(join(here, 'pilot', 'i18n', '_ko'), { recursive: true });
    writeFileSync(join(here, 'pilot', 'i18n', '_ko', sc + '.json'), JSON.stringify({ ids, direct }, null, 1) + '\n');
    console.log(`${sc}: ${ids.length} strings${direct.length ? `, ${direct.length} drawn directly (route through Pilot.tr): ` + direct.slice(0, 6).map(s => JSON.stringify(s)).join(' ') : ''}`);
    if (direct.length) bad++;
  } else {
    const leaks = [...drawn];
    console.log(`${sc}: ${miss.size ? miss.size + ' missing' : 'complete'}${leaks.length ? `, ${leaks.length} Hangul still drawn` : ''}`);
    for (const m of miss) console.log('   missing:', JSON.stringify(m));
    for (const l of leaks.filter(l => !miss.has(l)).slice(0, 12)) console.log('   leak:', JSON.stringify(l));
    if (miss.size || leaks.length) bad++;
  }
}
await browser.close();
process.exit(bad ? 1 : 0);
