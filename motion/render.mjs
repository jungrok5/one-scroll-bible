// Record motion/index.html to MP4, frame by frame (deterministic: every frame is seek(t) + screenshot).
//   node motion/render.mjs h            → motion/out/one-scroll-bible-h.mp4 (1920×1080)
//   node motion/render.mjs v            → motion/out/one-scroll-bible-v.mp4 (1080×1920)
//   node motion/render.mjs h --stills 3,20,95   → PNG stills at those seconds (for checking)
//   node motion/render.mjs h --page pilot/cross.html   → motion/out/cross-h.mp4 (any page exposing seek/DURATION/__ready);
//        a sibling sound file (pilot/cross.wav) is muxed in automatically
// Options: --fps 30 --workers 4 --from 0 --to <sec>
// Needs: Playwright (Chromium) + ffmpeg, and the Noto Sans KR / Noto Serif KR fonts installed locally
// (the Google Fonts link is blocked while recording so the output never depends on the network).
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const ori = args[0] === 'v' ? 'v' : 'h';
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const fps = +opt('fps', 30), workers = +opt('workers', 4);
const [W, H] = ori === 'h' ? [1920, 1080] : [1080, 1920];
const out = join(here, 'out'); mkdirSync(out, { recursive: true });
const pageRel = opt('page', 'index.html');
const name = pageRel === 'index.html' ? 'one-scroll-bible' : pageRel.replace(/^.*\//, '').replace(/\.html$/, '');
const url = pathToFileURL(join(here, pageRel)).href + `?render=1&o=${ori}`;
const wav = join(here, pageRel.replace(/\.html$/, '.wav'));

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true);
  return page;
}

const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
const probe = await openPage(browser);
const DUR = await probe.evaluate(() => window.DURATION);
await probe.close();

const stills = opt('stills');
if (stills) {
  const page = await openPage(browser);
  for (const t of stills.split(',').map(Number)) {
    await page.evaluate(t => window.seek(t), t);
    const f = join(out, `still-${name}-${ori}-${String(t).replace('.', '_')}.png`);
    await page.screenshot({ path: f }); console.log(f);
  }
  await browser.close(); process.exit(0);
}

const t0 = +opt('from', 0), t1 = Math.min(DUR, +opt('to', DUR));
const total = Math.round((t1 - t0) * fps);
console.log(`${ori}: ${W}×${H}, ${(t1 - t0).toFixed(1)}s, ${total} frames, ${workers} workers`);
const per = Math.ceil(total / workers);
let done = 0;
const segs = await Promise.all(Array.from({ length: workers }, async (_, w) => {
  const a = w * per, b = Math.min(total, a + per); if (a >= b) return null;
  const seg = join(out, `seg-${name}-${ori}-${w}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const page = await openPage(browser);
  for (let f = a; f < b; f++) {
    await page.evaluate(t => window.seek(t), t0 + f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (++done % 300 === 0) console.log(`  ${done}/${total}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await page.close();
  return seg;
}));
await browser.close();

const list = join(out, `list-${name}-${ori}.txt`);
writeFileSync(list, segs.filter(Boolean).map(s => `file '${s}'`).join('\n'));
const final = join(out, `${name}-${ori}.mp4`);
const audioIn = existsSync(wav) ? `-i "${wav}" -map 0:v -map 1:a -c:a aac -b:a 192k -shortest` : '';
execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i "${list}" ${audioIn} -c:v copy -movflags +faststart "${final}"`);
segs.filter(Boolean).forEach(s => rmSync(s)); rmSync(list);
console.log('→', final);
