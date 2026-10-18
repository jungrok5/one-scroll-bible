// Contact sheets for checking a language: every scene, both orientations, a few moments each, on one image per scene.
//   node motion/sheets.mjs <lang> [scene,scene,…] [--n 8] [--o h|v|hv]
//   → motion/out/sheets/<lang>/<scene>-<h|v>.png   (look at every one: tofu boxes, overflow, collisions, text shrunk too small)
// Times are spread evenly over each scene (skipping the fades). Use render.mjs --stills for exact moments.
import { createRequire } from 'node:module';
import { execSync, execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright'))); }
const here = dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const lang = args[0]; if (!lang) { console.error('usage: node motion/sheets.mjs <lang> [scenes] [--n 8] [--o hv]'); process.exit(1); }
const ORDER = (readFileSync(join(here, 'publish-film.py'), 'utf8').match(/ORDER = \[([^\]]+)\]/)[1].match(/'(\w+)'/g) || []).map(s => s.slice(1, -1));
const scenes = args[1] && !args[1].startsWith('--') ? args[1].split(',') : ORDER;
const n = +opt('n', 8), oris = opt('o', 'hv').split('');
const out = join(here, 'out', 'sheets', lang), tmp = join(out, '.tmp'); mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--allow-file-access-from-files'] });
for (const o of oris) {
  const [W, H] = o === 'h' ? [1920, 1080] : [1080, 1920], page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  for (const sc of scenes) {
    await page.goto(pathToFileURL(join(here, 'pilot', sc + '.html')).href + `?render=1&o=${o}` + (lang === 'ko' ? '' : `&lang=${lang}`));
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
    const dur = await page.evaluate(() => window.DURATION), files = [];
    for (let i = 0; i < n; i++) { const t = +(1.2 + (dur - 2.4) * (i + .5) / n).toFixed(2); await page.evaluate(t => window.seek(t), t);
      const f = join(tmp, `${i}.png`); await page.screenshot({ path: f }); files.push([f, t]); }
    const cols = o === 'h' ? 4 : 4, w = o === 'h' ? 480 : 270, h = o === 'h' ? 270 : 480, rows = Math.ceil(n / cols);
    const inp = files.flatMap(([f]) => ['-i', f]), lay = files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join('|');
    const fc = files.map(([, t], i) => `[${i}]scale=${w}:${h},drawtext=text='${t}s':x=8:y=8:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.5[a${i}]`).join(';') + ';' + files.map((_, i) => `[a${i}]`).join('') + `xstack=inputs=${n}:layout=${lay}:fill=black`;
    const dst = join(out, `${sc}-${o}.png`);
    try { execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...inp, '-filter_complex', fc, dst]); }
    catch { execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...inp, '-filter_complex', fc.replace(/,drawtext=[^\[]+/g, ''), dst]); }   // ffmpeg without drawtext
    console.log(dst);
  }
  await page.close();
}
await browser.close(); rmSync(tmp, { recursive: true, force: true });
