// film.mjs — the one entry point for making a film (관리자 2026-11-04: 절차를 스킬·문서가 아니라 코드가 쥔다).
// The stages, their gates, approvals and agent tasks are code (pipeline/stages.mjs, pipeline/tasks/*.md, pipeline/targets.json);
// the agent's job is to do what `status` says and nothing else, then `check` until the gates pass.
//   node motion/films/film.mjs status <film>             — every stage ✓/✗, then NEXT: the one thing to do now (task, commands, failures)
//   node motion/films/film.mjs check <film> <stage>      — that stage's gates in full (numbers included)
//   node motion/films/film.mjs run <film> <stage>        — run the stage's build commands, then its gates
//   node motion/films/film.mjs approve <film> <stage> "<누가: 한 말>"   — record the maintainer's approval (only when they said it)
//   node motion/films/film.mjs task <film> <stage>       — print the stage's fixed agent brief with the film filled in
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { STAGES, ctx, stageStatus, FILMS, srcHash, INSIGHTS } from './pipeline/stages.mjs';

const [cmd, film, stage, ...rest] = process.argv.slice(2);
if (!cmd || !film) { console.log('usage: node motion/films/film.mjs status|check|run|approve|task <film> [stage]'); process.exit(1); }
if (!existsSync(join(FILMS, film))) { console.error(`motion/films/${film} 없음`); process.exit(1); }
const st = id => { const s = STAGES.find(x => x.id === id); if (!s) { console.error('stage: ' + STAGES.map(x => x.id).join(' | ')); process.exit(1); } return s; };
const cmdline = (c, f) => c.map(a => a.replace('{film}', f));

if (cmd === 'status') {
  const c = ctx(film); let next = null; console.log(`「${film}」 ${c.review.status ? '— ' + c.review.status : ''}`);
  for (const s of STAGES) { const r = stageStatus(c, s), mark = r.done ? '✓' : r.ok ? '…' : '✗';
    console.log(`  ${mark} ${String(s.n).padStart(2)} ${s.name}${r.ok && !r.approved ? '  (승인 대기: ' + s.approve + ')' : ''}${!r.ok ? '  — ' + r.results.flatMap(([, x]) => x.why).slice(0, 2).join(' / ') : ''}`);
    if (!r.done && !next) next = [s, r]; }
  if (!next) { console.log('\n모든 단계 통과.'); process.exit(0); }
  const [s, r] = next; console.log(`\nNEXT → ${s.n}. ${s.name}`);
  if (!r.ok) { console.log('  막힌 이유:'); for (const [g, x] of r.results) for (const w of x.why) console.log(`   - [${g}] ${w}`);
    console.log(`  할 일: node motion/films/film.mjs task ${film} ${s.id}   (고정된 작업 지시)`); if (s.run) console.log(`  만들기: node motion/films/film.mjs run ${film} ${s.id}`);
    console.log(`  확인: node motion/films/film.mjs check ${film} ${s.id}`); }
  else console.log(`  검사는 통과. 승인 대기: ${s.approve}\n  관리자가 말하면: node motion/films/film.mjs approve ${film} ${s.id} "<누가: 한 말>"`);
  process.exit(r.ok ? 0 : 2);
}
if (cmd === 'check' || cmd === 'run') {
  const s = st(stage);
  if (cmd === 'run') for (const c of s.run || []) { const a = cmdline(c, film); console.log('$ ' + a.join(' ')); const p = spawnSync(a[0] === 'node' ? process.execPath : a[0], a.slice(1), { stdio: 'inherit' }); if (p.status) { console.error('실패: ' + a.join(' ')); process.exit(p.status); } }
  if (cmd === 'run' && s.id === 'picture') { const c = ctx(film), h = srcHash(c);
    for (const o of ['v', 'h']) if (existsSync(join(FILMS, '..', 'out', `${film}-${o}-narr.mp4`))) { writeFileSync(join(FILMS, '..', 'out', `${film}-${o}-narr.mp4.src.json`), JSON.stringify({ hash: h, at: new Date().toISOString() }) + '\n');
      spawnSync(process.execPath, ['motion/films/pipeline/look-sheets.mjs', film, '--ori', o], { stdio: 'inherit' }); } }
  const r = stageStatus(ctx(film), s);
  for (const [g, x] of r.results) { console.log(`${x.ok ? '✓' : '✗'} ${g}`); for (const w of x.why) console.log('   - ' + w); if (x.info) console.log('   ' + JSON.stringify(x.info)); }
  console.log(r.done ? '단계 통과' : r.ok ? `검사 통과 · 승인 대기: ${s.approve}` : '단계 미통과');
  process.exit(r.ok ? 0 : 2);
}
if (cmd === 'approve') {
  const s = st(stage), note = rest.join(' ').trim(); if (!s.approve) { console.error(`${s.id}는 승인이 필요 없는 단계`); process.exit(1); }
  if (!note) { console.error('관리자가 한 말을 그대로 적는다: approve <film> <stage> "관리자: 응 진행해"'); process.exit(1); }
  const f = join(FILMS, film, 'review.json'), r = JSON.parse(readFileSync(f, 'utf8')); r.pipeline = r.pipeline || {}; r.pipeline.approvals = r.pipeline.approvals || {};
  r.pipeline.approvals[s.id] = { at: new Date().toISOString(), note }; writeFileSync(f, JSON.stringify(r, null, 1) + '\n'); console.log(`승인 기록: ${s.id} — ${note}`);
  process.exit(0);
}
if (cmd === 'task') {
  const s = st(stage), f = join(FILMS, 'pipeline/tasks', s.task + '.md'); if (!existsSync(f)) { console.error('작업 지시 없음: ' + f); process.exit(1); }
  console.log(readFileSync(f, 'utf8').replaceAll('{film}', film));
  // what the numbers taught (pipeline/insights.json — the periodic analysis keeps it): this stage's rules, under the brief
  const ins = INSIGHTS.filter(x => x.status !== 'retired' && (x.stages || []).includes(s.id));
  if (ins.length) { console.log(`\n## 분석에서 배운 것 — 이 단계에 반영 (pipeline/insights.json)`);
    for (const x of ins) console.log(`- ${x.status === 'watch' ? '(관찰 중) ' : ''}**${x.rule}**${x.check ? ' [검사: ' + x.check + ']' : ''}\n  근거: ${x.evidence}`); }
  process.exit(0);
}
console.error('unknown command ' + cmd); process.exit(1);
