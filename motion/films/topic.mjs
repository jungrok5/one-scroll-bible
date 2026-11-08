// Topic discovery the same way every time (README 10절, pipeline/topics.json). The analysis brings the numbers; this tool keeps
// the backlog, the evidence and the recommendations in one file so the next film starts from it, not from a session.
//   node motion/films/topic.mjs list                                   — the backlog: status, evidence count, last recommended
//   node motion/films/topic.mjs evidence [date]                        — the numbers to judge by: Korean Shorts and films by
//        watch share and views (newest analytics/<date>/api-ko.json with totals), each Short's look (analytics/looks.json),
//        and the last "다음 추천 제작 주제" block of ANALYTICS.md
//   node motion/films/topic.mjs add <id> "<title>" --refs "<refs>" --connection "<the link of God's plan>"
//   node motion/films/topic.mjs cite <id> "<fact with a number>" --source <file>     — attach evidence (date = today KST)
//   node motion/films/topic.mjs recommend <id> <id> [<id>]             — the analysis's 2–3 picks (each needs ≥ 2 evidence) → markdown
//   node motion/films/topic.mjs pick <id> <film>                       — after the maintainer chose: status picked, film folder linked,
//        review.json topic_id + topic_evidence filled (then film.mjs approve <film> topic "관리자: …")
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd(), F = join(ROOT, 'motion/films/pipeline/topics.json'), A = join(ROOT, 'motion/films/analytics');
const J = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const B = J(F), save = () => writeFileSync(F, JSON.stringify(B, null, 1) + '\n');
const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i > -1 ? args.splice(i, 2)[1] : null; };
const [cmd, ...rest] = args, today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const find = id => { const t = B.topics.find(x => x.id === id); if (!t) { console.error(`topic ${id} 없음 — topic.mjs list`); process.exit(1); } return t; };
const MIN_EVIDENCE = 2;

if (cmd === 'list') {
  const last = id => B.recommendations.filter(r => r.ids.includes(id)).map(r => r.at).pop() || '';
  for (const t of B.topics) console.log(`${t.status.padEnd(11)} ${t.id.padEnd(18)} 근거 ${t.evidence.length} ${last(t.id) ? '추천 ' + last(t.id) : ''}${t.film ? ' → films/' + t.film : ''}  ${t.title}`);
} else if (cmd === 'evidence') {
  const dates = readdirSync(A).filter(d => /^\d{4}-\d\d-\d\d$/.test(d) && (!rest[0] || d <= rest[0])).sort().reverse();
  const d = dates.find(x => { const a = J(join(A, x, 'api-ko.json')); return a && Object.values(a.videos || {}).some(v => v.views != null); });
  if (!d) { console.log('조회 수가 든 api-ko.json이 없다 — analytics/collect.mjs api'); process.exit(1); }
  const a = J(join(A, d, 'api-ko.json')), looks = J(join(A, 'looks.json')) || {};
  console.log(`## 한국어 채널 ${a.from} ~ ${a.to} (analytics/${d}/api-ko.json) — 평균 시청 비율 순`);
  const rows = Object.entries(a.videos).filter(([, v]) => v.views != null).map(([id, v]) => ({ key: a.keys[id], ...v })).sort((x, y) => (y.avgPct || 0) - (x.avgPct || 0));
  for (const v of rows) { const n = +(v.key?.match(/^short-(\d+)/)?.[1] || 0), lk = n ? looks.shorts_ko?.[n]?.look : '';
    console.log(`${String(v.avgPct ?? '').padStart(6)}%  ${String(v.views).padStart(6)}회  ${(v.key || '').padEnd(14)} ${lk ? '[' + lk + '] ' : ''}${v.title}`); }
  const md = existsSync(join(ROOT, 'motion/films/ANALYTICS.md')) ? readFileSync(join(ROOT, 'motion/films/ANALYTICS.md'), 'utf8') : '', i = md.lastIndexOf('**다음 추천 제작 주제**');
  if (i > -1) console.log('\n## ANALYTICS.md 마지막 추천\n' + md.slice(i, md.indexOf('\n**', i + 10) > -1 ? md.indexOf('\n**', i + 10) : i + 1500).trim());
  console.log('\n근거를 붙이기: node motion/films/topic.mjs cite <id> "<숫자가 든 사실>" --source <파일>');
} else if (cmd === 'add') {
  const [id, title] = rest, refs = opt('--refs'), connection = opt('--connection');
  if (!id || !title || !refs || !connection) { console.error('add <id> "<title>" --refs "<refs>" --connection "<연결>"'); process.exit(1); }
  if (B.topics.some(t => t.id === id)) { console.error(id + ' 이미 있음'); process.exit(1); }
  B.topics.push({ id, title, refs, connection, status: 'candidate', evidence: [] }); save(); console.log('더함: ' + id);
} else if (cmd === 'cite') {
  const source = opt('--source'), [id, fact] = rest; if (!id || !fact || !source) { console.error('cite <id> "<fact>" --source <file>'); process.exit(1); }
  if (!/\d/.test(fact)) { console.error('근거에는 숫자가 있어야 한다'); process.exit(1); }
  find(id).evidence.push({ at: today, fact, source }); save(); console.log(`근거 더함: ${id} (${find(id).evidence.length}개)`);
} else if (cmd === 'recommend') {
  if (rest.length < 2 || rest.length > 3) { console.error('추천은 2~3개'); process.exit(1); }
  const T = rest.map(find), weak = T.filter(t => t.evidence.length < MIN_EVIDENCE);
  if (weak.length) { console.error(`근거가 ${MIN_EVIDENCE}개 안 되는 주제: ${weak.map(t => t.id).join(' ')} — topic.mjs cite 먼저`); process.exit(1); }
  for (const t of T) if (t.status === 'candidate') t.status = 'recommended';
  B.recommendations.push({ at: today, ids: rest, source: `motion/films/ANALYTICS.md ${today}` }); save();
  console.log('**다음 추천 제작 주제**'); T.forEach((t, i) => { console.log(`${i + 1}. **${t.title}** (${t.refs})`); console.log(`   - 연결: ${t.connection}`); for (const e of t.evidence.slice(-3)) console.log(`   - 근거: ${e.fact} (${e.source})`); });
} else if (cmd === 'pick') {
  const [id, film] = rest, t = find(id); if (!film) { console.error('pick <id> <film>'); process.exit(1); }
  t.status = 'picked'; t.film = film; save();
  const rf = join(ROOT, 'motion/films', film, 'review.json'); if (existsSync(rf)) { const r = J(rf); r.topic_id = id; r.topic_evidence = t.evidence; writeFileSync(rf, JSON.stringify(r, null, 1) + '\n'); }
  console.log(`고름: ${id} → films/${film}${existsSync(rf) ? ' (review.json topic_id·topic_evidence)' : ' — 폴더가 없으면 film.mjs new ' + film + ' --topic ' + id}`);
} else { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n')); process.exit(1); }
