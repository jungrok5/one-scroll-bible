// The script reviews as the same document every time: motion/reviews/film-<film>-script.json (the saved result of the
// `film-script-review` workflow) → motion/reviews/film-<film>-script.md (scores per part, issues by severity, what to fix).
//   node motion/films/pipeline/review-md.mjs <film>
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const film = process.argv[2], src = `motion/reviews/film-${film}-script.json`, dst = `motion/reviews/film-${film}-script.md`;
if (!film || !existsSync(src)) { console.error(`${src} 없음 — 워크플로 film-script-review 결과를 먼저 저장`); process.exit(1); }
const j = JSON.parse(readFileSync(src, 'utf8')), R = j.reviewers || [], parts = [...new Set(R.flatMap(r => r.parts.map(p => p.part)))];
const out = [`# 「${film}」 원고 리뷰 (${(j.at || '').slice(0, 10)}, 워크플로 film-script-review)`, '',
  '리뷰어 넷이 같은 원고를 읽고 보고만 했다. 반영은 원고 다음 차수에서 한다(관점 검수 지적은 반영, 1번 대상 점수가 낮은 부는 고친 뒤 다시 리뷰).', '',
  '## 부마다 점수 (감동 / 전율, 0–5)', '', `| 부 | ${R.map(r => r.who).join(' | ')} |`, `|---|${R.map(() => '---').join('|')}|`];
for (const p of parts) out.push(`| ${p} | ${R.map(r => { const x = r.parts.find(q => q.part === p); return x ? `${x.gamdong} / ${x.jeonyul}${x.swipe ? ' · 넘김: ' + x.swipe : ''}` : '—'; }).join(' | ')} |`);
const order = ['BLOCKER', 'MAJOR', 'MINOR', 'NOTE'];
for (const r of R) { out.push('', `## ${r.key === 'theology' ? '관점 검수' : r.who}`, '', r.summary || '');
  for (const s of order) for (const i of r.issues.filter(x => x.severity === s)) out.push(`- ${s}${i.line ? ' ' + i.line : ''}: ${i.text}${i.fix ? ' → ' + i.fix : ''}`); }
// j.resolved = { "<reviewer key>:<line>": "how it was applied" } — the main session records a must-fix it applied without another
// review run (관리자 "리뷰 끝도없네" → apply and freeze); j.deferred = ["…"] — what was read and left for later, on purpose
const done = j.resolved || {}, all = R.flatMap(r => r.issues.filter(i => i.severity === 'BLOCKER' || (r.key === 'theology' && i.severity === 'MAJOR')).map(i => ({ ...i, k: `${r.key}:${i.line || ''}` })));
const block = all.filter(i => !done[i.k]);
out.push('', '## 반영해야 할 것', '', all.length ? all.map(i => done[i.k] ? `- [x] ${i.severity} ${i.line || ''} → ${done[i.k]}` : `- [ ] ${i.severity} ${i.line || ''} ${i.text}`).join('\n') : '- 없음');
if ((j.deferred || []).length) out.push('', '## 보류(읽고 일부러 남김)', '', j.deferred.map(d => `- ${d}`).join('\n'));
writeFileSync(dst, out.join('\n') + '\n'); console.log(dst + (block.length ? ` — 반영할 것 ${block.length}개` : ''));
process.exit(block.length ? 2 : 0);
