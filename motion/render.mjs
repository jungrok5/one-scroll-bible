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
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
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
const cap = opt('cap', 'canvas');   // canvas: read the scene's canvas in the same task as the draw (pixel-identical to a screenshot, ~3× faster); shot: page screenshot
// Output is the upload format itself (assemble.py joins clips as they are — no second encode): closed GOP, a keyframe every
// 2 s, no B-frames (video sites re-encode in keyframe chunks; open GOPs made scene starts jump on some phones).
//   x264 (default): H.264 faster, CRF 18, ≤ 12 Mbps — YouTube's recommended range; measured on the busiest scene: 39.6 dB,
//                   half the CPU of x265 (the old 3.6 Mbps HEVC cap, chosen for a 400 MB transfer limit, held it to 36 dB)
//   x265: HEVC fast, CRF 20, ≤ 3.6 Mbps (smaller files)        x264master: the old H.264 master (medium, CRF 18, open GOP)
const venc = opt('venc', 'x264');
const VENC = {
  x264: ['-c:v', 'libx264', '-preset', 'faster', '-crf', '18', '-maxrate', '12M', '-bufsize', '24M', '-g', '60', '-keyint_min', '60', '-sc_threshold', '0', '-bf', '0', '-metadata', 'comment=osb-upload'],
  x265: ['-c:v', 'libx265', '-preset', 'fast', '-x265-params', 'crf=20:bframes=0:open-gop=0:keyint=60:min-keyint=60:vbv-maxrate=3600:vbv-bufsize=7200:log-level=error', '-tag:v', 'hvc1', '-metadata', 'comment=osb-upload'],
  x264master: ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18'],
}[venc];
if (!VENC) { console.error('unknown --venc', venc); process.exit(1); }
// A scene can cache its most expensive, language-independent layer (creation's WebGL cosmos: 0.6 s a frame on a CPU):
// the page exposes __glFrame() (that layer as a PNG) and __prepare(t) (load the cached frame before seek). The cache
// lives in out/glcache/<scene>-<h|v>-<hash of the scene file>/ and is built automatically the first time (--glcache off|auto|build).
const glmode = opt('glcache', 'auto');
const [W, H] = ori === 'h' ? [1920, 1080] : [1080, 1920];
const out = join(here, 'out'); mkdirSync(out, { recursive: true });
const pageRel = opt('page', 'index.html');
const lang = opt('lang', 'ko');
const name = (pageRel === 'index.html' ? 'one-scroll-bible' : pageRel.replace(/^.*\//, '').replace(/\.html$/, '')) + (lang === 'ko' ? '' : '-' + lang);
let url = pathToFileURL(join(here, pageRel)).href + `?render=1&o=${ori}` + (lang === 'ko' ? '' : `&lang=${lang}`) + (process.env.RENDER_QUERY ? '&' + process.env.RENDER_QUERY : '');   // e.g. RENDER_QUERY=clean=1 (a page may hide its captions — thumbnail frames)
const pageSrc = readFileSync(join(here, pageRel), 'utf8');
const glAble = glmode !== 'off' && /__glFrame/.test(pageSrc);
let glDir = null, glReady = false;   // set after the probe page: the scene may name its own cache key (__glFrame.key)
const wav = join(here, pageRel.replace(/\.html$/, '.wav'));

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true);
  return page;
}

const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text', '--allow-file-access-from-files'] });
const probe = await openPage(browser);
const DUR = await probe.evaluate(() => window.DURATION);
if (glAble) {
  const key = (await probe.evaluate(() => window.__glFrame && window.__glFrame.key || null)) || createHash('sha1').update(pageSrc).digest('hex').slice(0, 8);
  glDir = join(out, 'glcache', `${pageRel.replace(/^.*\//, '').replace(/\.html$/, '')}-${ori}-${key}`); glReady = existsSync(join(glDir, 'done'));
  if (glReady && glmode !== 'build') url += '&glcache=' + encodeURIComponent(pathToFileURL(glDir).href + '/');
}
await probe.close();

if (glAble && !glReady) {   // build the scene's cached layer first (all frames at the 30 fps grid), then use it
  const n = Math.round(DUR * fps), per = Math.ceil(n / workers); mkdirSync(glDir, { recursive: true });
  console.log(`building ${glDir.replace(/^.*\//, '')}: ${n} frames (once per orientation; every language reuses it)`);
  let done = 0;
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const a = w * per, b = Math.min(n, a + per); const page = await openPage(browser);
    for (let f = a; f < b; f++) {
      const file = join(glDir, String(f).padStart(5, '0') + '.png'); if (existsSync(file)) { done++; continue; }
      const d = await page.evaluate(f => { window.seek(f / 30); return window.__glFrame(); }, f);
      if (d) writeFileSync(file, Buffer.from(d.split(',')[1], 'base64'));
      if (++done % 100 === 0) console.log(`  ${done}/${n}`);
    }
    await page.close();
  }));
  writeFileSync(join(glDir, 'done'), new Date().toISOString());
  if (glmode === 'build') { await browser.close(); process.exit(0); }
  url += '&glcache=' + encodeURIComponent(pathToFileURL(glDir).href + '/');
}

const stills = opt('stills');
if (stills) {
  const page = await openPage(browser);
  for (const t of stills.split(',').map(Number)) {
    await page.evaluate(async t => { if (window.__prepare) await window.__prepare(t); window.seek(t); }, t);
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
    ...VENC, '-pix_fmt', 'yuv420p', '-r', String(fps), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const page = await openPage(browser);
  for (let f = a; f < b; f++) {
    let buf;
    if (cap === 'canvas') buf = Buffer.from((await page.evaluate(async t => { if (window.__prepare) await window.__prepare(t); window.seek(t); return document.querySelector('canvas').toDataURL('image/jpeg', .95); }, t0 + f / fps)).split(',')[1], 'base64');
    else { await page.evaluate(async t => { if (window.__prepare) await window.__prepare(t); window.seek(t); }, t0 + f / fps); buf = await page.screenshot({ type: 'jpeg', quality: 95 }); }
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
const tag = venc === 'x264master' ? '' : '-metadata comment=osb-upload';   // marks the upload format for assemble.py (the concat mux drops the segments' tags)
execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i "${list}" ${audioIn} -c:v copy ${tag} -movflags +faststart "${final}"`);
segs.filter(Boolean).forEach(s => rmSync(s)); rmSync(list);
console.log('→', final);
