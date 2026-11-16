// The studio board — every desk's next step on one screen (motion/studio/operations-proposal.html §4, week 1, approved 2026-11-13).
//   node motion/studio/studio.mjs status        → films (production desks), decisions waiting, what is scheduled in the next 14 days
//                                                 (Sunday rule), the language desk's next steps, scheduled jobs, today's API quota
// Read-only: it runs the existing status tools and reads the records; it never publishes or changes anything.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..', '..'), M = join(ROOT, 'motion');
const J = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const run = (a, opt = {}) => { const p = spawnSync(process.execPath, a, { cwd: ROOT, encoding: 'utf8', timeout: 120000, ...opt }); return (p.stdout || '') + (p.stderr || ''); };
const KST = t => new Date(Date.parse(t) + 9 * 3600e3), day = t => KST(t).toISOString().slice(0, 10);
const WD = '일월화수목금토', now = Date.now();
const cmd = process.argv[2] || 'status';
if (cmd !== 'status') { console.log('usage: node motion/studio/studio.mjs status'); process.exit(1); }
const out = [], H = s => out.push('\n■ ' + s);

// 1. production desks — one per film folder with a review.json
H('제작 (영상마다)');
for (const f of readdirSync(join(M, 'films')).filter(d => existsSync(join(M, 'films', d, 'review.json')))) {
  const R0 = J(join(M, 'films', f, 'review.json')) || {};
  if (R0.lifecycle) { out.push(`  ${f}: ${R0.lifecycle === 'legacy' ? '공개됨(파이프라인 이전 영상)' : R0.lifecycle === 'shelved' ? '보류(만들지 않음)' : R0.lifecycle} — ${R0.lifecycle_note || ''}`); continue; }
  const s = run([join(M, 'films', 'film.mjs'), 'status', f]), lines = s.split('\n');
  const fails = lines.filter(l => /^\s+✗/.test(l)).map(l => l.trim().replace(/^✗\s*/, '').split('  — ')[0]);
  const next = (lines.find(l => /^NEXT →/.test(l)) || '').replace('NEXT → ', '');
  const R = J(join(M, 'films', f, 'review.json')) || {}, P = R.intl_progress || {};
  out.push(`  ${f}: ${fails.length ? `남은 단계 ${fails.length} — ${fails.slice(0, 4).join(' · ')}${fails.length > 4 ? ' …' : ''}` : '모든 단계 통과'}${next ? `\n     다음: ${next}` : ''}`);
  for (const n of (P.next || []).slice(0, 3)) out.push('     · ' + n.slice(0, 150));
  for (const o of (P.owner || []).slice(0, 3)) out.push('     ! 관리자: ' + o.slice(0, 150));
}

// 2. the decision box
H('결정함 (motion/studio/decide.mjs)');
const D = J(join(HERE, 'decisions.json')) || { items: [] }, open = D.items.filter(x => x.status === 'open');
out.push(`  열린 것 ${open.length}개 — 결정 ${open.filter(x => x.kind !== 'owner-action').length} · 관리자 할 일 ${open.filter(x => x.kind === 'owner-action').length}${open.some(x => x.proceed) ? ` · 추천대로 진행 중 ${open.filter(x => x.proceed).length}` : ''}`);
for (const x of open) out.push(`  ${x.id} ${x.kind === 'owner-action' ? '[할 일] ' : ''}${x.q.slice(0, 70)}${x.blocks ? ` → 막는 일: ${x.blocks.slice(0, 50)}` : ''}`);

// 3. channel desk — everything with a publish time in the next 14 days, from uploaded.json (any depth)
H('예약 (다음 14일, 한국 시간)');
const U = J(join(M, 'youtube', 'uploaded.json')) || {}, sched = [];
const walk = (o, path) => { if (!o || typeof o !== 'object') return; for (const [k, v] of Object.entries(o)) {
  if (k === 'publish_at' && typeof v === 'string' && Date.parse(v) > now && Date.parse(v) < now + 14 * 864e5) sched.push({ at: v, what: path.join('.'), title: o.title || '', id: o.id || '' });
  else if (typeof v === 'object') walk(v, [...path, k]); } };
walk(U, []);
sched.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
if (!sched.length) out.push('  (예약 없음)');
for (const s of sched) { const d = KST(s.at), sun = d.getUTCDay() === 0;
  out.push(`  ${day(s.at)}(${WD[d.getUTCDay()]}) ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}  ${s.what} ${s.id} ${s.title.slice(0, 30)}${sun ? '  ← 주일! (한국어 채널은 주일 공개 안 함)' : ''}`); }

// 4. language desk — the 14-min film's languages with a next step
H('언어 (14분 영상 — film14.mjs status)');
const f14 = run([join(M, 'youtube', 'film14.mjs'), 'status']).split('\n').filter(l => /^\S+\s+h /.test(l) || /^[a-z]{2}(-\w+)?\s/.test(l));
const todo = f14.filter(l => !/\|\s*—\s*$/.test(l) && /\|/.test(l));
out.push(`  다음 할 일이 있는 언어 ${todo.length}개${todo.length ? ':' : ''}`);
for (const l of todo.slice(0, 6)) { const c = l.split('|'); out.push(`  ${c[0].trim().split(/\s+/)[0]} — ${c[c.length - 1].trim().slice(0, 110)}`); }

// 5. scheduled jobs — Windows Task Scheduler (the session's own cron jobs are only visible inside that session: CronList)
H('예약 작업');
const st = spawnSync('schtasks', ['/query', '/fo', 'csv', '/nh'], { encoding: 'utf8' }).stdout || '';
const mine = st.split(/\r?\n/).filter(l => /\\OSB\\/.test(l)).map(l => l.split('","').map(x => x.replace(/"/g, '')));
out.push(mine.length ? mine.map(c => `  ${c[0]}  다음 실행 ${c[1]}  ${c[2]}`).join('\n') : '  작업 스케줄러: 아직 없음(1주차 시범 — motion/studio/jobs/)');
out.push('  세션 예약(CronCreate)은 그 세션 안에서만 보임 — 새 세션은 CronList로 확인(motion/youtube/ROUTINES.md)');
const logs = join(HERE, 'logs');
if (existsSync(logs)) { const L = readdirSync(logs).filter(f => f.endsWith('.log')).sort().slice(-3); for (const f of L) out.push('  최근 실행 기록: motion/studio/logs/' + f); }

// 6. quota — ledger arrives in week 2–3 (motion/studio/quota.json)
H('할당량');
const Q = J(join(HERE, 'quota.json'));
out.push(Q ? `  오늘 ${Q.today || 0} / 10,000 (17시 초기화)` : '  장부 없음 — 2~3주차(도구가 쓴 점수를 motion/studio/quota.json에). 지금은 두 채널이 한 프로젝트의 10,000을 나눠 씀(결정함 D2)');

console.log(`스튜디오 현황 — ${new Date(now + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ')} KST` + out.join('\n'));
