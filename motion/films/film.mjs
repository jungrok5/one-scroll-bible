// film.mjs — the one entry point for making a film (관리자 2026-11-04: 절차를 스킬·문서가 아니라 코드가 쥔다; 2026-11-09: "매번 같은
// 퀄리티로 고정된 균일하게"). The stages, gates, approvals, rules and agent tasks are code and data (pipeline/stages.mjs,
// pipeline/rules.json, pipeline/tasks/*.md, pipeline/targets.json, pipeline/insights.json, pipeline/topics.json);
// the agent's job is to do what `status` says and nothing else, then `check` until the gates pass.
//   node motion/films/film.mjs status <film>             — every stage ✓/✗, then NEXT: the one thing to do now (task, commands, failures)
//   node motion/films/film.mjs task <film> <stage>       — the stage's fixed brief + every rule for it (rules.json) + what the numbers taught
//   node motion/films/film.mjs check <film> <stage>      — that stage's gates in full (numbers included)
//   node motion/films/film.mjs run <film> <stage>        — run the stage's build commands, then its gates
//   node motion/films/film.mjs approve <film> <stage> "<누가: 한 말>"   — record the maintainer's approval (only when they said it);
//        approving `review` also freezes the approved script (rounds/script-approved-review.json) for the drift gate
//   node motion/films/film.mjs new <film> --topic <id>   — a new film folder from the template (review.json with every field the gates read)
//   node motion/films/film.mjs feedback <film> "<누가>" "<한 말 그대로>"      — one piece of feedback, open
//   node motion/films/film.mjs applied <film> <n|last> "<무엇을 바꿨나>" [--declined]  — how it was handled
//   node motion/films/film.mjs round <film> "<이번 차수 요약>" [--force "<이유>"] — close a round: changed line ids (vs the last round's
//        script), the feedback it answered, a script snapshot (rounds/script-<n>.json); refuses while feedback is open or a
//        stage up to the current one is failing (stale mix, old clips …) unless --force with a reason
//   node motion/films/film.mjs diff <film> [approved|<n>]  — line-by-line change against the approved script (or round n)
//   node motion/films/film.mjs snapshot <film> review    — freeze the current script as the approved one (for an approval made before 2026-11-09)
//   node motion/films/film.mjs rules [stage]             — the rules, by stage
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { STAGES, ctx, stageStatus, FILMS, srcHash, INSIGHTS } from './pipeline/stages.mjs';

const argv = process.argv.slice(2), flag = k => { const i = argv.indexOf(k); return i > -1 ? argv.splice(i, 2)[1] ?? true : null; };
const force = flag('--force'), topicArg = flag('--topic'), declined = argv.includes('--declined') ? (argv.splice(argv.indexOf('--declined'), 1), true) : false;
const [cmd, film, stage, ...rest] = argv;
const RULES = JSON.parse(readFileSync(join(FILMS, 'pipeline/rules.json'), 'utf8')).rules;
const rulesFor = id => RULES.filter(r => r.stages.includes(id) || r.stages.includes('all'));
const printRules = (id, title = '## 규칙 — 이 단계에서 지킬 것 (pipeline/rules.json)') => { const R = rulesFor(id); if (!R.length) return;
  console.log('\n' + title); for (const r of R) console.log(`- ${r.rule}${r.gate ? ` [검사: ${r.gate}]` : ' [판단]'}\n  (${r.source})`); };
if (cmd === 'rules') { const ids = film ? [film] : [...new Set(STAGES.map(s => s.id))]; for (const id of ids) printRules(id, `## ${id}`); process.exit(0); }
if (!cmd || !film) { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n')); process.exit(1); }
const NOW = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') + ' KST';
const D = join(FILMS, film), RF = join(D, 'review.json');

if (cmd === 'new') {
  if (existsSync(D)) { console.error(`motion/films/${film} 이미 있음`); process.exit(1); }
  const B = JSON.parse(readFileSync(join(FILMS, 'pipeline/topics.json'), 'utf8')), t = B.topics.find(x => x.id === topicArg);
  if (!t) { console.error('--topic <id> (node motion/films/topic.mjs list)'); process.exit(1); }
  mkdirSync(join(D, 'sound'), { recursive: true });
  const tpl = JSON.parse(readFileSync(join(FILMS, 'pipeline/review-template.json'), 'utf8'));
  tpl.topic_id = t.id; tpl.topic_evidence = t.evidence; tpl.status = '1단계 주제 — 관리자가 고르기 전';
  writeFileSync(RF, JSON.stringify(tpl, null, 1) + '\n');
  writeFileSync(join(D, 'script.json'), JSON.stringify({ _about: '줄마다 id·part·at·kind(narr|quote|label|title)·text·screen(보이는 것) — 인용은 usfm·cite·hl, 화면 전용은 voice: null. README 3절, rules.json', title: t.title, dur: 179, lines: [] }, null, 1) + '\n');
  t.film = film; if (t.status !== 'made') t.status = 'picked'; writeFileSync(join(FILMS, 'pipeline/topics.json'), JSON.stringify(B, null, 1) + '\n');
  console.log(`motion/films/${film}/ (review.json · script.json · sound/) — 주제 ${t.id}\n다음: node motion/films/film.mjs status ${film}`); process.exit(0);
}
if (!existsSync(D)) { console.error(`motion/films/${film} 없음`); process.exit(1); }
const st = id => { const s = STAGES.find(x => x.id === id); if (!s) { console.error('stage: ' + STAGES.map(x => x.id).join(' | ')); process.exit(1); } return s; };
const cmdline = (c, f) => c.map(a => a.replace('{film}', f));
const readR = () => JSON.parse(readFileSync(RF, 'utf8')), writeR = r => writeFileSync(RF, JSON.stringify(r, null, 1) + '\n');
const lines = () => { const s = JSON.parse(readFileSync(join(D, 'script.json'), 'utf8')); return Array.isArray(s) ? s : s.lines; };
const snap = name => { mkdirSync(join(D, 'rounds'), { recursive: true }); copyFileSync(join(D, 'script.json'), join(D, 'rounds', `script-${name}.json`)); };
function changedSince(file) { if (!existsSync(file)) return null; const o = JSON.parse(readFileSync(file, 'utf8')), old = new Map((Array.isArray(o) ? o : o.lines).map(l => [l.id, l])), now = lines(), out = [];
  for (const l of now) { const p = old.get(l.id); if (!p) out.push({ id: l.id, how: '새 줄', now: l.text }); else if (p.text !== l.text || (p.voice ?? null) !== (l.voice ?? null) || p.usfm !== l.usfm) out.push({ id: l.id, how: '바뀜', was: p.text, now: l.text }); else if (p.at !== l.at) out.push({ id: l.id, how: `시각 ${p.at} → ${l.at}`, quiet: true }); }
  for (const [id, p] of old) if (!now.some(l => l.id === id)) out.push({ id, how: '뺌', was: p.text }); return out; }

if (cmd === 'status') {
  const c = ctx(film); let next = null; console.log(`「${film}」 ${c.review.status ? '— ' + c.review.status : ''}`);
  for (const s of STAGES) { const r = stageStatus(c, s), mark = r.done ? '✓' : r.ok ? '…' : '✗';
    console.log(`  ${mark} ${String(s.n).padStart(2)} ${s.name}${r.ok && !r.approved ? '  (승인 대기: ' + s.approve + ')' : ''}${!r.ok ? '  — ' + r.results.flatMap(([, x]) => x.why).slice(0, 2).join(' / ') : ''}`);
    if (!r.done && !next) next = [s, r]; }
  if (!next) { console.log('\n모든 단계 통과.'); process.exit(0); }
  const [s, r] = next; console.log(`\nNEXT → ${s.n}. ${s.name}`);
  if (!r.ok) { console.log('  막힌 이유:'); for (const [g, x] of r.results) for (const w of x.why) console.log(`   - [${g}] ${w}`);
    console.log(`  할 일: node motion/films/film.mjs task ${film} ${s.id}   (고정된 작업 지시 + 규칙)`); if (s.run) console.log(`  만들기: node motion/films/film.mjs run ${film} ${s.id}`);
    console.log(`  확인: node motion/films/film.mjs check ${film} ${s.id}`); }
  else console.log(`  검사는 통과. 승인 대기: ${s.approve}\n  관리자가 말하면: node motion/films/film.mjs approve ${film} ${s.id} "<누가: 한 말>"`);
  process.exit(r.ok ? 0 : 2);
}
if (cmd === 'check' || cmd === 'run') {
  const s0 = st(stage), s = process.argv.includes('--review') ? { ...s0, gates: [...s0.gates, ...(s0.optional || [])] } : s0;   // --review: also the on-request gates (the look review)
  if (cmd === 'run') for (const c of s.run || []) { const a = cmdline(c, film); console.log('$ ' + a.join(' ')); const p = spawnSync(a[0] === 'node' ? process.execPath : a[0], a.slice(1), { stdio: 'inherit' }); if (p.status) { console.error('실패: ' + a.join(' ')); process.exit(p.status); }
    if (s.id === 'picture' && a[1] === 'motion/films/sound.mjs' && a[3] === 'h') { const c = ctx(film), h = srcHash(c);   // stamp both renders before the shot sheet reads the stamp
      for (const o of ['v', 'h']) if (existsSync(join(FILMS, '..', 'out', `${film}-${o}-narr.mp4`))) { writeFileSync(join(FILMS, '..', 'out', `${film}-${o}-narr.mp4.src.json`), JSON.stringify({ hash: h, at: new Date().toISOString() }) + '\n');
        spawnSync(process.execPath, ['motion/films/pipeline/look-sheets.mjs', film, '--ori', o], { stdio: 'inherit' }); } } }
  const r = stageStatus(ctx(film), s);
  for (const [g, x] of r.results) { console.log(`${x.ok ? '✓' : '✗'} ${g}`); for (const w of x.why) console.log('   - ' + w); if (x.info) console.log('   ' + JSON.stringify(x.info)); }
  console.log(r.done ? '단계 통과' : r.ok ? `검사 통과 · 승인 대기: ${s.approve}` : '단계 미통과');
  process.exit(r.ok ? 0 : 2);
}
if (cmd === 'approve') {
  const s = st(stage), note = rest.join(' ').trim(); if (!s.approve) { console.error(`${s.id}는 승인이 필요 없는 단계`); process.exit(1); }
  if (!note) { console.error('관리자가 한 말을 그대로 적는다: approve <film> <stage> "관리자: 응 진행해"'); process.exit(1); }
  const r = readR(); r.pipeline = r.pipeline || {}; r.pipeline.approvals = r.pipeline.approvals || {};
  r.pipeline.approvals[s.id] = { at: new Date().toISOString(), note }; writeR(r);
  if (s.id === 'review') snap('approved-review');
  console.log(`승인 기록: ${s.id} — ${note}${s.id === 'review' ? ' (승인한 원고를 rounds/script-approved-review.json에)' : ''}`); process.exit(0);
}
if (cmd === 'snapshot') { if (stage !== 'review') { console.error('snapshot <film> review'); process.exit(1); } snap('approved-review'); console.log('rounds/script-approved-review.json = 지금 원고'); process.exit(0); }
if (cmd === 'task') {
  const s = st(stage), f = join(FILMS, 'pipeline/tasks', s.task + '.md'); if (!existsSync(f)) { console.error('작업 지시 없음: ' + f); process.exit(1); }
  console.log(readFileSync(f, 'utf8').replaceAll('{film}', film));
  printRules(s.id);
  // what the numbers taught (pipeline/insights.json — the periodic analysis keeps it): this stage's rules, under the brief
  const ins = INSIGHTS.filter(x => x.status !== 'retired' && (x.stages || []).includes(s.id));
  if (ins.length) { console.log(`\n## 분석에서 배운 것 — 이 단계에 반영 (pipeline/insights.json)`);
    for (const x of ins) console.log(`- ${x.status === 'watch' ? '(관찰 중) ' : ''}**${x.rule}**${x.check ? ' [검사: ' + x.check + ']' : ''}\n  근거: ${x.evidence}`); }
  process.exit(0);
}
if (cmd === 'feedback') {
  const [who, said] = [stage, rest.join(' ').trim()]; if (!who || !said) { console.error('feedback <film> "<누가>" "<한 말 그대로>"'); process.exit(1); }
  const r = readR(); (r.feedback_log ||= []).push({ at: NOW(), who, said, status: 'open', round: r.round }); writeR(r);
  console.log(`피드백 #${r.feedback_log.length - 1} (열림) — 반영 뒤: film.mjs applied ${film} ${r.feedback_log.length - 1} "<무엇을 바꿨나>"`); process.exit(0);
}
if (cmd === 'applied') {
  const r = readR(), FB = r.feedback_log || [], i = stage === 'last' ? FB.map(f => f.status).lastIndexOf('open') : +stage, how = rest.join(' ').trim();
  if (!FB[i] || !how) { console.error('applied <film> <n|last> "<무엇을 바꿨나>" [--declined]'); process.exit(1); }
  FB[i].applied = how; FB[i].status = declined ? 'declined' : 'applied'; FB[i].applied_at = NOW(); writeR(r); console.log(`#${i} ${FB[i].status}: ${how}`); process.exit(0);
}
if (cmd === 'round') {
  const summary = [stage, ...rest].filter(Boolean).join(' ').trim(); if (!summary) { console.error('round <film> "<요약>"'); process.exit(1); }
  const r = readR(), open = (r.feedback_log || []).map((f, i) => [f, i]).filter(([f]) => f.status === 'open');
  if (open.length) { console.error('처리 안 한 피드백: ' + open.map(([f, i]) => `#${i} ${f.who}: ${f.said.slice(0, 30)}`).join(' / ') + ' — film.mjs applied'); process.exit(1); }
  // the stages up to where the film is must pass (a re-cut that skipped film.mjs run leaves a stale mix or old clips)
  const c = ctx(film), cur = STAGES.findIndex(s => !stageStatus(c, s).done), bad = [];
  for (const s of STAGES.slice(0, cur + 1)) { const x = stageStatus(c, s); if (!x.ok) bad.push(`${s.id}: ${x.results.flatMap(([, y]) => y.why).slice(0, 2).join(' / ')}`); }
  if (bad.length && !force) { console.error('지금 단계까지 검사가 실패한다 — film.mjs run으로 다시 만들거나, 일부러 남기면 --force "<이유>"\n  ' + bad.join('\n  ')); process.exit(1); }
  const prevN = r.round || 0, prev = join(D, 'rounds', `script-${prevN}.json`), ch = changedSince(existsSync(prev) ? prev : join(D, 'rounds', 'script-approved-review.json')) || [];
  const n = prevN + 1, answered = (r.feedback_log || []).map((f, i) => [f, i]).filter(([f]) => f.round === prevN || f.round == null && !f.answered_by).map(([, i]) => i);
  for (const i of answered) r.feedback_log[i].answered_by = n;
  (r.rounds ||= []).push({ n, date: new Date().toISOString().slice(0, 10), summary, changed: ch.filter(x => !x.quiet).map(x => x.id), retimed: ch.filter(x => x.quiet).map(x => x.id), feedback: answered, ...(force ? { forced: force, failing: bad } : {}) });
  r.round = n; writeR(r); snap(String(n));
  console.log(`${n}차 닫음: 바뀐 줄 ${ch.filter(x => !x.quiet).map(x => x.id).join(' ') || '없음'} · 답한 피드백 ${answered.map(i => '#' + i).join(' ') || '없음'} · rounds/script-${n}.json${force ? ' · 강제: ' + force : ''}`); process.exit(0);
}
if (cmd === 'diff') {
  const which = stage || 'approved', f = join(D, 'rounds', which === 'approved' ? 'script-approved-review.json' : `script-${which}.json`), ch = changedSince(f);
  if (!ch) { console.error(`${f} 없음`); process.exit(1); }
  console.log(`「${film}」 ${which === 'approved' ? '승인한 원고' : which + '차'} 대비 — 바뀐 줄 ${ch.filter(x => !x.quiet).length} · 시각만 ${ch.filter(x => x.quiet).length}`);
  for (const x of ch.filter(x => !x.quiet)) console.log(`${x.id.padEnd(5)} ${x.how}${x.was ? `\n      전: ${x.was}` : ''}${x.now ? `\n      후: ${x.now}` : ''}`);
  process.exit(0);
}
console.error('unknown command ' + cmd); process.exit(1);
