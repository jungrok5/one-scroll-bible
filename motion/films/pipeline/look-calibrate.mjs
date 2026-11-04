// Calibrate the look review (관리자 2026-11-04: "잘 만드는 게 중요"): the bar says "7 = as good as the first film", so the same
// reviewers score the first film itself with the same brief and sheets — 13 of its 21 Korean Shorts as 13 "scenes", no reference
// sheet (they must not know it is the bar). The mean they give it is what 7 really means on their scale; targets.json
// look_review takes the calibrated bar (calibrated_mean − margin) instead of a guessed 7.
//   node motion/films/pipeline/look-calibrate.mjs sheets      → motion/out/look-review/_first-film/args.json (+ briefs via wf-prompts.mjs)
//   node motion/films/pipeline/look-calibrate.mjs collect     → motion/reviews/first-film-look.json + .md, and prints the calibrated mean
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const cmd = process.argv[2], out = 'motion/out/look-review/_first-film', SRC = 'motion/out/release-narr';
const PICK = ['01', '02', '03', '04', '05', '06', '08', '10', '12', '13', '14', '17', '19'];   // spread over the film, both bright and dark
if (cmd === 'sheets') {
  rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
  const files = readdirSync(SRC).filter(f => /^shorts-ko-narr-\d\d-/.test(f)).sort(), scenes = [];
  for (const n of PICK) { const f = files.find(x => x.startsWith(`shorts-ko-narr-${n}-`)); if (!f) continue;
    const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', join(SRC, f)]).toString(), ts = [0.15, 0.4, 0.65, 0.9].map(k => +(dur * k).toFixed(2));
    const sheet = join(out, `${n}-${f.replace(/^shorts-ko-narr-\d\d-|\.mp4$/g, '')}.png`).replace(/\\/g, '/');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(SRC, f), '-vf', `select='${ts.map(t => `eq(n\\,${Math.round(t * 30)})`).join('+')}',scale=360:640,tile=4x1`, '-frames:v', '1', sheet]);
    const R = JSON.parse(execFileSync('node', ['motion/films/frame-qa.mjs', join(SRC, f), '--json'], { maxBuffer: 1 << 26 }).toString().trim().split('\n').pop()), s = R.perScene[0];
    scenes.push({ scene: 'short-' + n, a: 0, b: +dur.toFixed(1), times: ts, sheet, look: null, lines: [], stats: { luma: s.luma, p98: s.p98, sat: s.sat, motion: s.motion, held: R.held, vs_first_film: { luma: '-', p98: '-', sat: '-', motion: '-' } } }); }
  writeFileSync(join(out, 'args.json'), JSON.stringify({ film: 'first-film (calibration)', ori: 'v', render: 'release-narr', first_film_sheet: null, scenes }, null, 1));
  spawnSync(process.execPath, ['motion/films/pipeline/wf-prompts.mjs', '.claude/workflows/film-look-review.js', join(out, 'args.json'), join(out, 'briefs')], { stdio: 'inherit' });
  mkdirSync(join(out, 'answers'), { recursive: true }); console.log(`${out}: ${scenes.length} shorts — 리뷰어마다 briefs/brief-<key>.md → answers/<key>.json`);
} else if (cmd === 'collect') {
  const WHO = ['director', 'novice63', 'tv48', 'tech'], A = join(out, 'answers'), miss = WHO.filter(k => !existsSync(join(A, k + '.json')));
  if (miss.length) { console.error('아직 없는 답: ' + miss.join(' ')); process.exit(1); }
  const R = { film: 'first-film', calibration: true, at: new Date().toISOString(), reviewers: WHO.map(k => ({ key: k, ...JSON.parse(readFileSync(join(A, k + '.json'), 'utf8')) })) };
  const all = R.reviewers.flatMap(r => r.scenes.map(s => s.score)), mean = all.reduce((a, b) => a + b, 0) / all.length, per = Object.fromEntries(R.reviewers.map(r => [r.key, +(r.scenes.reduce((a, s) => a + s.score, 0) / r.scenes.length).toFixed(2)]));
  R.mean = +mean.toFixed(2); R.perReviewer = per; mkdirSync('motion/reviews', { recursive: true }); writeFileSync('motion/reviews/first-film-look.json', JSON.stringify(R, null, 1));
  console.log(`첫 영상 보정 평균 ${R.mean} — 리뷰어별 ${JSON.stringify(per)}`);
} else { console.error('usage: look-calibrate.mjs sheets|collect'); process.exit(1); }
