// motion/reviews/film-<film>-look.json (the film-look-review workflow's result) → .md: scores per scene × reviewer, swipe points,
// fixes by severity and the list of what must change before the picture can be approved. Exit 2 if that list is not empty.
//   node motion/films/pipeline/look-md.mjs <film>
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const film = process.argv[2], f = `motion/reviews/film-${film}-look.json`;
if (!film || !existsSync(f)) { console.error(`${f} 없음 — film-look-review 워크플로 결과를 저장`); process.exit(1); }
const R = JSON.parse(readFileSync(f, 'utf8')), T = JSON.parse(readFileSync('motion/films/pipeline/targets.json', 'utf8')).look_review;
export const sceneScores = R => { const m = new Map(); for (const r of R.reviewers) for (const s of r.scenes) { const e = m.get(s.scene) || { scene: s.scene, by: {}, swipe: 0 }; e.by[r.key] = s.score; if (s.swipe) e.swipe++; m.set(s.scene, e); }
  return [...m.values()].map(e => ({ ...e, mean: +(Object.values(e.by).reduce((a, b) => a + b, 0) / Object.values(e.by).length).toFixed(1) })); };
const S = sceneScores(R), keys = R.reviewers.map(r => r.key), mean = +(S.reduce((a, s) => a + s.mean, 0) / S.length).toFixed(2);
const fixes = R.reviewers.flatMap(r => r.fixes.map(x => ({ ...x, by: r.key }))), ord = { BLOCKER: 0, MAJOR: 1, MINOR: 2, NOTE: 3 };
const must = [...S.filter(s => s.mean < T.scene_min).map(s => `${s.scene}: 평균 ${s.mean} < ${T.scene_min}`), ...(mean < T.mean_min ? [`전체 평균 ${mean} < ${T.mean_min}`] : []),
  ...fixes.filter(x => x.severity === 'BLOCKER' || x.severity === 'MAJOR').map(x => `[${x.severity}·${x.by}] ${x.scene}${x.at != null ? ` ${x.at}s` : ''} — ${x.what} → ${x.fix}`)];
let md = `# 「${film}」 그림 리뷰 (장면별 점수)\n\n렌더 ${R.render} · ${R.at}\n\n| 장면 | ${keys.join(' | ')} | 평균 | 넘김 |\n|---|${keys.map(() => '---').join('|')}|---|---|\n`;
for (const s of S) md += `| ${s.scene} | ${keys.map(k => s.by[k] ?? '').join(' | ')} | **${s.mean}** | ${s.swipe ? '⚠ ' + s.swipe : ''} |\n`;
md += `\n전체 평균 **${mean}** (기준: 장면 ${T.scene_min} 이상, 전체 ${T.mean_min} 이상)\n\n## 한 줄 평\n`;
for (const r of R.reviewers) md += `\n### ${r.who}\n${r.summary}\n\n${r.scenes.map(s => `- ${s.scene} ${s.score}${s.swipe ? ' (넘김)' : ''}: ${s.note}`).join('\n')}\n`;
md += `\n## 고칠 점\n\n${fixes.sort((a, b) => ord[a.severity] - ord[b.severity]).map(x => `- **${x.severity}** (${x.by}) ${x.scene}${x.at != null ? ` ${x.at}s` : ''} — ${x.what}\n  → ${x.fix}`).join('\n')}\n`;
md += `\n## 반영해야 할 것\n\n${must.length ? must.map(m => '- ' + m).join('\n') : '(없음)'}\n`;
writeFileSync(f.replace(/\.json$/, '.md'), md);
console.log(`${f.replace(/\.json$/, '.md')} · 평균 ${mean} · 반영할 것 ${must.length}`); if (must.length) process.exit(2);
