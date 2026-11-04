// What the look reviewers see (.claude/workflows/film-look-review.js): per scene a sheet of 4 frames from the current render,
// its frame-qa numbers next to the first film's range, its look (review.json looks[]) and the lines on screen; plus one sheet of
// the first film's Shorts as the bar. Writes motion/out/look-review/<film>/ (sheets) and prints the workflow args as JSON.
//   node motion/films/pipeline/look-sheets.mjs <film> [--ori v|h]   → motion/out/look-review/<film>[-h]/args.json
// --ori h: the TV cut (insight older-tv: a third of the 14-min film's watch time is on a TV) — the bar is the first film's 14-min landscape film
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const film = process.argv[2], oi = process.argv.indexOf('--ori'), ORI = oi > 0 ? process.argv[oi + 1] : 'v'; if (!film) { console.error('usage: look-sheets.mjs <film> [--ori v|h]'); process.exit(1); }
const d = join('motion/films', film), vid = `motion/out/${film}-${ORI}-narr.mp4`, out = join('motion/out/look-review', ORI === 'h' ? film + '-h' : film), FPS = 30, CELL = ORI === 'h' ? 'scale=480:270,tile=2x2' : 'scale=360:640,tile=4x1';
if (!existsSync(vid)) { console.error(`${vid} 없음 — film.mjs run ${film} picture`); process.exit(1); }
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
const T = JSON.parse(readFileSync('motion/films/pipeline/targets.json', 'utf8')), REF = T.frames.first_film;
const R = JSON.parse(execFileSync('node', ['motion/films/frame-qa.mjs', vid, '--film', film, '--json'], { maxBuffer: 1 << 26 }).toString().trim().split('\n').pop());
const S = JSON.parse(readFileSync(join(d, 'script.json'), 'utf8')), lines = Array.isArray(S) ? S : S.lines, rv = JSON.parse(readFileSync(join(d, 'review.json'), 'utf8'));
const looks = rv.looks || rv.looks_round3 || [], stamp = existsSync(vid + '.src.json') ? JSON.parse(readFileSync(vid + '.src.json', 'utf8')).hash : null;
const ff = a => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a]);
// the bar: the first film's Shorts, one frame from the middle of each of eight
const refDir = 'motion/out/release-narr', LONG = 'motion/out/release/film-ko-narr.mp4';
const refs = ORI === 'h' ? (existsSync(LONG) ? [60, 150, 240, 330, 420, 540, 660, 780].map(t => ({ f: LONG, t })) : []) : existsSync(refDir) ? readdirSync(refDir).filter(f => /^shorts-ko-narr-(02|04|05|10|14|17|19|20)-/.test(f)).sort().map(f => ({ f: join(refDir, f), t: 12 })) : [];
if (refs.length) { refs.forEach((r, i) => ff(['-ss', String(r.t), '-i', r.f, '-frames:v', '1', '-vf', ORI === 'h' ? 'scale=480:270' : 'scale=270:480', join(out, `_ref${i}.png`)]));
  ff([...refs.flatMap((_, i) => ['-i', join(out, `_ref${i}.png`)]), '-filter_complex', `hstack=inputs=${refs.length}`, join(out, 'first-film.png')]); refs.forEach((_, i) => rmSync(join(out, `_ref${i}.png`))); }
const pos = (v, [lo, mid, hi]) => v < lo ? '첫 영상 하위 10%보다 낮음' : v > hi ? '첫 영상 상위 10%보다 높음' : v < mid ? '첫 영상 범위(중간 아래)' : '첫 영상 범위(중간 위)';
const scenes = R.perScene.map((s, i) => {
  const ts = [0.15, 0.4, 0.65, 0.9].map(k => +(s.a + (s.b - s.a) * k).toFixed(2)), sheet = join(out, `${String(i + 1).padStart(2, '0')}-${s.scene}.png`);
  ff(['-i', vid, '-vf', `select='${ts.map(t => `eq(n\\,${Math.round(t * FPS)})`).join('+')}',${CELL}`, '-frames:v', '1', sheet]);
  // looks[] are written by time ("0:21–0:37"): the one overlapping this scene most
  const sec = m => { const [mm, ss] = m.split(':'); return +mm * 60 + +ss; }, spans = l => (l.at || '').split('·').map(p => p.split(/[–-]/).map(x => x.trim()).filter(Boolean).map(sec));
  const look = looks.map(l => [l, spans(l).reduce((o, [la, lb]) => o + (la == null ? 0 : Math.max(0, Math.min(lb ?? la, s.b) - Math.max(la, s.a))), 0)]).filter(([, o]) => o > 0).sort((x, y) => y[1] - x[1])[0]?.[0] || null;
  return { scene: s.scene, a: s.a, b: s.b, times: ts, sheet: sheet.replace(/\\/g, '/'), look: look && { what: look.scene, look: look.look, source: look.source, new: !!(look.style_new || look.kit) },
    lines: lines.filter(l => l.at != null && l.at >= s.a - .2 && l.at < s.b).map(l => `${l.id} [${l.kind}] ${l.text}`),
    stats: { luma: s.luma, p98: s.p98, sat: s.sat, motion: s.motion, held: s.held,
      vs_first_film: { luma: pos(s.luma, REF.luma), p98: pos(s.p98, REF.p98), sat: pos(s.sat, REF.sat), motion: pos(s.motion, REF.motion) } } };
});
const args = { film, ori: ORI, render: stamp, first_film_sheet: refs.length ? join(out, 'first-film.png').replace(/\\/g, '/') : null, scenes };
writeFileSync(join(out, 'args.json'), JSON.stringify(args, null, 1));
console.log(`${out}/args.json · ${scenes.length} scenes · render ${stamp}`);
