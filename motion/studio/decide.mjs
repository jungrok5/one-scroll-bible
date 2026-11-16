// 결정함 — the desks' questions for the maintainer, collected in one file and answered once or twice a week
// (motion/studio/operations-proposal.html §4-5, approved 2026-11-13 "다 제안대로 하고 그리스도 공개한뒤 하자").
// A desk never stops to ask in chat: it files the question here with its recommendation, options, evidence and what it blocks.
// Only urgent things (a publish, anything irreversible) are asked at once. An answer is recorded in the maintainer's own words,
// then moved where it belongs (rules.json + a gate, a schedule, a film's review.json) and never asked again.
//
//   node motion/studio/decide.mjs list [--all]                       open items (or every item)
//   node motion/studio/decide.mjs add <desk> "<question>" --rec "<recommendation>" [--opt "<a>" --opt "<b>"] [--why "<evidence>"]
//        [--blocks "<what waits on it>"] [--kind decision|owner-action] [--proceed]   (--proceed: go with the recommendation now, confirm later)
//   node motion/studio/decide.mjs answer <id> "<the maintainer's words>" [--applied "<where it went>"]
//   node motion/studio/decide.mjs applied <id> "<where it went>"
//   node motion/studio/decide.mjs page                                 → motion/out/studio/decisions.html (the page the maintainer reads)
// desks: producer · film:<name> · language · channel · viewers · analysis
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), F = join(HERE, 'decisions.json');
const load = () => existsSync(F) ? JSON.parse(readFileSync(F, 'utf8')) : { _about: '결정함 — node motion/studio/decide.mjs (머리말 참고)', items: [] };
const save = d => writeFileSync(F, JSON.stringify(d, null, 1) + '\n');
const args = process.argv.slice(2), cmd = args[0];
const flag = (k, many) => { const v = []; for (let i = 0; i < args.length; i++) if (args[i] === '--' + k) v.push(args[i + 1]); return many ? v : v[0]; };
const has = k => args.includes('--' + k);
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);   // KST date
const show = x => `${x.id}  [${x.status}${x.proceed ? ' · 추천대로 진행 중' : ''}] ${x.desk} — ${x.q}\n      추천: ${x.rec}${x.blocks ? `\n      막는 일: ${x.blocks}` : ''}${x.answer ? `\n      답(${x.answered}): ${x.answer}${x.applied ? ` → ${x.applied}` : ''}` : ''}`;
const d = load();
if (cmd === 'list') {
  const L = d.items.filter(x => has('all') || x.status === 'open');
  console.log(L.length ? L.map(show).join('\n') : '열린 결정 없음');
} else if (cmd === 'add') {
  const [, desk, q] = args; const rec = flag('rec');
  if (!desk || !q || !rec) { console.log('usage: add <desk> "<question>" --rec "<recommendation>" [--opt …] [--why …] [--blocks …] [--kind …] [--proceed]'); process.exit(1); }
  const n = d.items.reduce((m, x) => Math.max(m, +x.id.slice(1)), 0) + 1, id = 'D' + n;
  d.items.push({ id, at: today(), desk, kind: flag('kind') || 'decision', q, rec, options: flag('opt', true), why: flag('why') || '', blocks: flag('blocks') || '', proceed: has('proceed'), status: 'open' });
  save(d); console.log('추가: ' + id);
} else if (cmd === 'answer' || cmd === 'applied') {
  const [, id, words] = args, x = d.items.find(i => i.id === id);
  if (!x || !words) { console.log(`usage: ${cmd} <id> "<…>"`); process.exit(1); }
  if (cmd === 'answer') { x.answer = words; x.answered = today(); x.status = 'answered'; if (flag('applied')) x.applied = flag('applied'); }
  else { x.applied = words; x.status = 'answered'; }
  save(d); console.log(show(x));
} else if (cmd === 'page') {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const open = d.items.filter(x => x.status === 'open'), done = d.items.filter(x => x.status !== 'open').slice(-12).reverse();
  const card = x => `<article class="${x.kind}${x.status !== 'open' ? ' done' : ''}"><header><b>${esc(x.id)}</b><span class="desk">${esc(x.desk)}</span>${x.kind === 'owner-action' ? '<span class="tag act">관리자 할 일</span>' : ''}${x.proceed ? '<span class="tag go">추천대로 진행 중</span>' : ''}<span class="at">${esc(x.at)}</span></header>
<h3>${esc(x.q)}</h3><p class="rec"><em>추천</em> ${esc(x.rec)}</p>${x.options?.length ? `<ul>${x.options.map(o => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}${x.why ? `<p class="why">${esc(x.why)}</p>` : ''}${x.blocks ? `<p class="blocks"><em>막는 일</em> ${esc(x.blocks)}</p>` : ''}${x.answer ? `<p class="ans"><em>답 ${esc(x.answered)}</em> ${esc(x.answer)}${x.applied ? ` → ${esc(x.applied)}` : ''}</p>` : ''}</article>`;
  const html = `<title>결정함</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
:root{--bg:#f6f3ee;--fg:#1f1b16;--muted:#6b6257;--card:#fffdf9;--line:#e3dbcf;--accent:#9a6a1f;--act:#2f6f8f;--go:#4f7a3a}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#15130f;--fg:#ece6dc;--muted:#a59a8a;--card:#1f1c17;--line:#38322a;--accent:#d9a650;--act:#7fb6d1;--go:#9ac27f;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#15130f;--fg:#ece6dc;--muted:#a59a8a;--card:#1f1c17;--line:#38322a;--accent:#d9a650;--act:#7fb6d1;--go:#9ac27f;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:15px/1.6 "Noto Sans KR",system-ui,sans-serif;margin:0;padding-block:24px 48px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:760px;margin:0 auto}
h1{font-size:1.5rem;margin:0 0 4px;text-wrap:balance}.lead{color:var(--muted);margin:0 0 20px}
h2{font-size:1rem;letter-spacing:.04em;color:var(--muted);margin:28px 0 10px}
article{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:10px;padding:14px 16px;margin:0 0 12px}
article.owner-action{border-left-color:var(--act)}article.done{opacity:.72;border-left-color:var(--line)}
header{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:.8125rem;color:var(--muted)}header b{color:var(--fg)}
.desk{border:1px solid var(--line);border-radius:999px;padding:0 8px}.at{margin-left:auto}
.tag{border-radius:999px;padding:0 8px;color:var(--card)}.tag.act{background:var(--act)}.tag.go{background:var(--go)}
h3{font-size:1.0625rem;margin:6px 0 8px;text-wrap:balance}
p{margin:6px 0}em{font-style:normal;font-weight:700;color:var(--accent);margin-right:6px}
.why{color:var(--muted);font-size:.875rem}ul{margin:6px 0;padding-left:1.2em}
.ans em{color:var(--go)}
</style>
<main><h1>결정함</h1><p class="lead">열린 것 ${open.length}개 · ${today()} 기준. 답은 채팅으로 "D번호 …"처럼 주시면 그대로 기록하고 규칙·일정으로 옮깁니다. 급한 것(공개·되돌릴 수 없는 일)만 따로 바로 묻습니다.</p>
<h2>열린 결정</h2>${open.map(card).join('\n') || '<p>열린 결정이 없습니다.</p>'}
<h2>최근에 정한 것</h2>${done.map(card).join('\n') || '<p>아직 없습니다.</p>'}</main>`;
  const out = join(HERE, '..', 'out', 'studio'); mkdirSync(out, { recursive: true }); writeFileSync(join(out, 'decisions.html'), html); console.log('→ ' + join(out, 'decisions.html'));
} else console.log('usage: node motion/studio/decide.mjs list | add | answer | applied | page');
