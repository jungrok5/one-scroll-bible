// Gather the look reviewers' answers (when the review ran as subagents — wf-prompts.mjs briefs, each answer saved as
// motion/out/look-review/<film>[-h]/answers/<key>.json) into the review record the gate reads, then render the .md.
//   node motion/films/pipeline/look-collect.mjs <film> [--ori h]   → motion/reviews/film-<film>-look[-h].json + .md
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
const film = process.argv[2], H = process.argv.includes('h'), dir = join('motion/out/look-review', film + (H ? '-h' : '')), ans = join(dir, 'answers');
const WHO = { director: '아트 디렉터(첫 영상을 만든 사람의 눈)', novice63: '성경 잘 모르는 크리스천(63세, 휴대폰, 1번 대상)', tv48: '성경 잘 아는 신자(48세, 거실 TV)', tech: '기술 검수(프레임·글자·전환)' };
if (!film || !existsSync(ans)) { console.error(`usage: look-collect.mjs <film> [--ori h] — ${ans} 없음`); process.exit(1); }
const A = JSON.parse(readFileSync(join(dir, 'args.json'), 'utf8')), have = readdirSync(ans).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
const missing = Object.keys(WHO).filter(k => !have.includes(k)); if (missing.length) { console.error('아직 없는 답: ' + missing.join(' ')); process.exit(1); }
const R = { film, ori: H ? 'h' : 'v', render: A.render, at: new Date().toISOString(), runner: 'subagents — same briefs via wf-prompts.mjs',
  reviewers: Object.keys(WHO).map(k => ({ key: k, who: WHO[k], ...JSON.parse(readFileSync(join(ans, k + '.json'), 'utf8')) })) };
mkdirSync('motion/reviews', { recursive: true }); writeFileSync(`motion/reviews/film-${film}-look${H ? '-h' : ''}.json`, JSON.stringify(R, null, 1));
const r = spawnSync(process.execPath, ['motion/films/pipeline/look-md.mjs', film, ...(H ? ['--ori', 'h'] : [])], { stdio: 'inherit' }); process.exit(r.status ?? 0);
