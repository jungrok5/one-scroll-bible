// Subtitles for the rendered film, in any language that has a translation file — for YouTube caption tracks on the
// English (or any) video when that language has no rendered film of its own.
//   node motion/subtitles.mjs scan h|v [scene…]   → motion/out/subs/timeline-<h|v>.json
//        Plays every scene in Korean (the source) and records, every 0.2 s, which on-screen strings are visible
//        (fill alpha ≥ 0.35) and where (y), mapped back to their translation keys. Timing is the same in every
//        language, so this runs once per orientation (again only after a scene's timing changes).
//   node motion/subtitles.mjs srt <lang> [h|v]     → motion/out/subs/<lang>/film-<h|v>.srt (the whole film)
//                                                      + motion/out/subs/<lang>/<h|v>/NN-<scene>.srt (one per Short)
//        Fills the timeline with motion/pilot/i18n/<lang>.json. Seconds per language.
// Rules: counters ("343년") and single characters are skipped; when a sentence is on screen, short labels next to it
// (map names, plate labels) are dropped so a cue never stacks more than 3 lines; cues shorter than 0.6 s are merged.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ORDER = ['opening', 'creation', 'fall', 'patriarch', 'exodus', 'wilderness', 'judges', 'kingdom', 'exile', 'return',
  'silence', 'advent', 'cross', 'rise', 'church', 'renewal', 'mirror', 'gospel', 'evidence', 'ship', 'invite'];
const FPS = 30, STEP = 0.2, MIN_ALPHA = 0.35, MIN_CUE = 0.6;
const SUBS = join(here, 'out', 'subs');
const [cmd, a1, a2, ...rest] = process.argv.slice(2);

const HANGUL = /[가-힣]/;
const isCounter = s => /^\s*[\d,.]+\s*\S{0,3}\s*$/.test(s) && /\d/.test(s);
const readFor = k => Math.min(9, Math.max(3, 1.5 + k.replace(/\s/g, '').length / 6));   // seconds to read a line (Korean length)
const sentenceLike = s => s.replace(/\s/g, '').length > 12 || /[.?!“”"「」…—]/.test(s);

// map a drawn Korean string back to the translation key it came from
function keyFor(d, ids) {
  if (ids.includes(d)) return d;
  const lineHit = ids.find(k => k.split('\n').some(l => l === d || l.trim() === d.trim()));
  if (lineHit) return lineHit;
  if ([...d].length < 2) return null;
  const pre = ids.filter(k => k.split('\n').some(l => l.startsWith(d)) || k.replace(/\n/g, ' ').startsWith(d));   // typewriter prefix
  return pre.length ? pre.sort((x, y) => x.length - y.length)[0] : null;
}

async function scan(ori, scenes) {
  const require = createRequire(import.meta.url);
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch { ({ chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright'))); }
  const [W, H] = ori === 'h' ? [1920, 1080] : [1080, 1920];
  const file = join(SUBS, `timeline-${ori}.json`);
  const out = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const sc of scenes) {
    const ids = JSON.parse(readFileSync(join(here, 'pilot', 'i18n', '_ko', sc + '.json'), 'utf8')).ids;
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    // runs before lib.js, so lib's iOS-alpha patch wraps this one: the alpha arrives baked into fillStyle
    await page.addInitScript(() => {
      const f = CanvasRenderingContext2D.prototype.fillText; window.__txt = [];
      const alphaOf = c => { if (typeof c !== 'string') return 1; const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 1;
        const p = m[1].split(','); return p.length > 3 ? +p[3] : 1; };
      CanvasRenderingContext2D.prototype.fillText = function (t, x, y, ...r) {
        const a = this.globalAlpha * alphaOf(this.fillStyle), m = this.getTransform();
        const px = m.a * x + m.c * y + m.e, py = m.b * x + m.d * y + m.f, cw = this.canvas.width, ch = this.canvas.height;
        // only text whose anchor lands inside the frame (camera pans carry labels off-screen)
        if (px > -cw * .02 && px < cw * 1.02 && py > 0 && py < ch * 1.02) window.__txt.push([String(t), a, py]);
        return f.call(this, t, x, y, ...r);
      };
    });
    await page.goto(pathToFileURL(join(here, 'pilot', sc + '.html')).href + `?render=1&o=${ori}`);
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
    const dur = await page.evaluate(() => window.DURATION);
    const samples = await page.evaluate(([step, minA]) => {
      const res = [];
      for (let t = 0; t < window.DURATION; t += step) {
        window.__txt = []; window.seek(t);
        res.push([+t.toFixed(3), window.__txt.filter(([s, a]) => a >= minA && /[가-힣]/.test(s)).map(([s, a, y]) => [s, Math.round(y)])]);
      }
      return res;
    }, [STEP, MIN_ALPHA]);
    await page.close();
    // per sample: the visible keys, top to bottom
    const frames = samples.map(([t, list]) => {
      const seen = new Map();
      for (const [s, y] of list) {
        if (isCounter(s)) continue;
        const k = keyFor(s, ids); if (!k || isCounter(k)) continue;
        if (!seen.has(k) || y < seen.get(k)) seen.set(k, y);
      }
      return [t, [...seen.entries()].sort((p, q) => p[1] - q[1]).map(e => e[0])];
    });
    // a line that stays on screen (a sign, a title) is subtitled only for as long as it takes to read it
    const runStart = new Map(); let prev = new Set();
    for (const fr of frames) {
      const [t, vis] = fr;
      for (const k of vis) if (!prev.has(k)) runStart.set(k, t);
      prev = new Set(vis);
      let keys = vis.filter(k => t - runStart.get(k) < readFor(k));
      if (keys.some(sentenceLike)) keys = keys.filter(sentenceLike);   // a sentence on screen: drop the labels around it
      fr[1] = keys.slice(0, 3);
    }
    // runs of identical key sets → cues
    const cues = [];
    for (const [t, keys] of frames) {
      const sig = keys.join('\u0001'), last = cues[cues.length - 1];
      if (last && last.sig === sig) last.end = t + STEP;
      else cues.push({ sig, keys, start: t, end: t + STEP });
    }
    const merged = [];
    for (const c of cues) {
      if (!c.keys.length) { merged.push(c); continue; }
      const prev = merged[merged.length - 1];
      if (c.end - c.start < MIN_CUE && prev && prev.keys.length) { prev.end = c.end; continue; }   // a flicker: extend the previous cue
      merged.push(c);
    }
    out[sc] = { dur, frames: Math.round(dur * FPS), cues: merged.filter(c => c.keys.length).map(c => ({ start: +c.start.toFixed(2), end: +Math.min(c.end, dur).toFixed(2), keys: c.keys })) };
    console.log(`${sc}: ${out[sc].cues.length} cues`);
    mkdirSync(SUBS, { recursive: true }); writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
  }
  await browser.close();
}

const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const srt = cues => cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n');

function makeSrt(lang, ori) {
  const tl = JSON.parse(readFileSync(join(SUBS, `timeline-${ori}.json`), 'utf8'));
  const pack = lang === 'ko' ? null : JSON.parse(readFileSync(join(here, 'pilot', 'i18n', lang + '.json'), 'utf8'));
  const dir = join(SUBS, lang, ori); mkdirSync(dir, { recursive: true });
  let off = 0, all = [], missing = 0;
  ORDER.forEach((sc, i) => {
    const s = tl[sc]; if (!s) { console.log('not scanned:', sc); return; }
    const L = pack ? pack[sc] || {} : null;
    const cues = s.cues.map(c => {
      const lines = c.keys.map(k => { const v = L ? L[k] : k; if (L && v == null) missing++; return String(v ?? k).replace(/\s+/g, ' ').trim(); });
      return { start: c.start, end: c.end, text: [...new Set(lines)].join('\n') };   // two keys can share one translation
    });
    writeFileSync(join(dir, `${String(i + 1).padStart(2, '0')}-${sc}.srt`), srt(cues));
    all.push(...cues.map(c => ({ ...c, start: c.start + off, end: c.end + off })));
    off += s.frames / FPS;
  });
  const f = join(SUBS, lang, `film-${ori}.srt`); writeFileSync(f, srt(all));
  console.log(`→ ${f} (${all.length} cues${missing ? `, ${missing} lines untranslated (Korean left in)` : ''}) + ${dir}/NN-<scene>.srt`);
}

if (cmd === 'scan') await scan(a1 || 'h', [a2, ...rest].filter(Boolean).length ? [a2, ...rest].filter(Boolean) : ORDER);
else if (cmd === 'srt') makeSrt(a1, a2 || 'h');
else console.log('usage: node motion/subtitles.mjs scan h|v [scene…]  |  node motion/subtitles.mjs srt <lang> [h|v]');
