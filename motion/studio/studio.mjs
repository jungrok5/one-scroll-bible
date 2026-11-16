// The studio board — every desk's next step on one screen (motion/studio/operations-proposal.html §4, week 1, approved 2026-11-13).
//   node motion/studio/studio.mjs status        → films (production desks), decisions waiting, what is scheduled in the next 14 days
//                                                 (Sunday rule), the language desk's next steps, scheduled jobs, today's API quota, last nightly check
//   node motion/studio/studio.mjs cal [days|sync|plan|drop] → the broadcast calendar (calendar.mjs, calendar.json)
//   node motion/studio/studio.mjs post [run|show]       → day-7 / day-28 analysis per film (post.mjs → review.json "post")
//   node motion/studio/studio.mjs queue [add|run|drop] → the 17:00 queue (queue.mjs) — API jobs waiting for quota
//   node motion/studio/studio.mjs health [--full]  → the nightly check (health.mjs; Task Scheduler \OSB\health)
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
if (cmd === 'post') { const { post } = await import('./post.mjs'); await post(process.argv.slice(3)); process.exit(0); }
if (cmd === 'cal') { const { calendar } = await import('./calendar.mjs'); await calendar(process.argv.slice(3)); process.exit(0); }
if (cmd === 'queue') { const { queue } = await import('./queue.mjs'); await queue(process.argv.slice(3)); process.exit(0); }
if (cmd === 'health') { const { health } = await import('./health.mjs'); await health(process.argv.slice(3)); process.exit(0); }
if (cmd !== 'status') { console.log('usage: node motion/studio/studio.mjs status | cal [days|sync|plan|drop] | post [run|show] | health [--full] | queue [add|run|drop]'); process.exit(1); }
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

// 3. the broadcast calendar (calendar.mjs — mirrors uploaded.json + the social schedules, plus planned rows), next 14 days
H('편성표 (다음 14일, 한국 시간 — studio.mjs cal)');
{ const { sync } = await import('./calendar.mjs'), C = sync(), rows = C.rows.filter(r => Date.parse(r.at) < now + 14 * 864e5);
  if (!rows.length) out.push('  (예정 없음)');
  for (const r of rows) { const d = KST(r.at), sun = d.getUTCDay() === 0 && ['ko', 'ig', 'threads'].includes(r.ch);
    out.push(`  ${day(r.at)}(${WD[d.getUTCDay()]}) ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}  ${r.ch.padEnd(7)} ${r.source === 'plan' ? '[계획] ' : ''}${r.what} ${(r.title || r.note || '').slice(0, 28)}${sun ? '  ← 주일! (한국어 채널·인스타·스레드는 주일 공개 안 함)' : ''}`); } }

// 4. language desk — the 14-min film's languages with a next step
H('언어 (14분 영상 — film14.mjs status)');
const f14 = run([join(M, 'youtube', 'film14.mjs'), 'status']).split('\n').filter(l => /^\S+\s+h /.test(l) || /^[a-z]{2}(-\w+)?\s/.test(l));
const todo = f14.filter(l => !/\|\s*—\s*$/.test(l) && /\|/.test(l));
out.push(`  다음 할 일이 있는 언어 ${todo.length}개${todo.length ? ':' : ''}`);
for (const l of todo.slice(0, 6)) { const c = l.split('|'); out.push(`  ${c[0].trim().split(/\s+/)[0]} — ${c[c.length - 1].trim().slice(0, 110)}`); }

// 5. scheduled jobs — Windows Task Scheduler (the session's own cron jobs are only visible inside that session: CronList)
H('예약 작업');
// PowerShell, not schtasks: schtasks prints in the console code page (CP949) and the Korean comes out broken
const ps = "[Console]::OutputEncoding=[Text.Encoding]::UTF8; Get-ScheduledTask -TaskPath '\\OSB\\' -ErrorAction SilentlyContinue | % { $i = $_ | Get-ScheduledTaskInfo; '{0}|{1}|{2}|{3}|{4}' -f $_.TaskName, $(if ($i.NextRunTime) { $i.NextRunTime.ToString('MM-dd HH:mm') } else { '-' }), $_.State, $(if ($i.LastRunTime -and $i.LastRunTime.Year -gt 2000) { $i.LastRunTime.ToString('MM-dd HH:mm') } else { 'never' }), $i.LastTaskResult }";
const st = spawnSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' }).stdout || '';
const mine = st.split(/\r?\n/).filter(l => l.includes('|')).map(l => l.split('|'));
const when = c => c[3] === 'never' ? '아직 안 돌았음' : `${c[3]} (결과 ${c[4] === '0' ? '성공' : c[4]})`;
out.push(mine.length ? mine.map(c => `  \\OSB\\${c[0]}  다음 ${c[1]} · ${c[2] === 'Ready' ? '대기' : c[2] === 'Running' ? '실행 중' : c[2]} · 마지막 ${when(c)}`).join('\n') : '  작업 스케줄러: 아직 없음(1주차 시범 — motion/studio/jobs/)');
out.push('  세션 예약(CronCreate)은 그 세션 안에서만 보임 — 새 세션은 CronList로 확인(motion/youtube/ROUTINES.md)');
const logs = join(HERE, 'logs');
if (existsSync(logs)) { const L = readdirSync(logs).filter(f => f.endsWith('.log')).sort().slice(-3); for (const f of L) out.push('  최근 실행 기록: motion/studio/logs/' + f); }

// 5b. the last nightly check (health.mjs)
const HL = J(join(HERE, 'health.json'));
H('밤 점검 (studio.mjs health)');
out.push(HL ? `  ${HL.day}${HL.full ? ' 전체' : ''}: 문제 ${HL.problems.length}개 · 통과 ${HL.ok.length}개` + HL.problems.slice(0, 8).map(p => `
  ✗ [${p.check}] ${p.what.slice(0, 140)}`).join('') : '  아직 안 돌았음 — node motion/studio/studio.mjs health');

// 5c. post-publication analysis due dates (post.mjs)
H('사후 분석 7일·28일 (studio.mjs post)');
out.push(run([join(HERE, 'studio.mjs'), 'post']).split('\n').slice(1).filter(Boolean).join('\n'));

// 6. quota — the ledger motion/youtube/yt-token.mjs keeps (every tool that gets its token there is counted; Studio in the browser is not)
H('할당량 (YouTube Data API, 하루 10,000 — 태평양 자정 = 한국 17시 초기화)');
const Q = J(join(HERE, 'quota.json'));
const { quotaDay } = await import('../youtube/yt-token.mjs');
if (!Q) out.push('  아직 기록 없음 — 도구가 API를 쓰면 motion/studio/quota.json에 쌓임');
else { const cur = Q.day === quotaDay(), P = cur ? Q.projects : {};
  for (const [k, v] of Object.entries(P)) { const top = Object.entries(v.by).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([w, u]) => `${w} ${u}`).join(' · ');
    out.push(`  ${k === 'shared' ? '공용 프로젝트(두 채널)' : k}: 오늘 ${v.total.toLocaleString()} / 10,000${v.total > 8000 ? '  ← 거의 다 씀' : ''} — ${top}`); }
  if (!Object.keys(P).length) out.push('  오늘(' + quotaDay() + ') 쓴 것 없음');
  const pv = cur ? Q.prev : { day: Q.day, projects: Q.projects };
  if (pv?.projects) out.push('  지난 쿼터일 ' + pv.day + ': ' + Object.entries(pv.projects).map(([k, v]) => `${k} ${v.total.toLocaleString()}`).join(' · '));
  const QQ = J(join(HERE, 'queue.json')); if (QQ?.jobs?.length) out.push(`  17시 큐: 기다리는 일 ${QQ.jobs.length}개 (${QQ.jobs.reduce((a, j) => a + j.units, 0).toLocaleString()} units) — studio.mjs queue`);
  out.push('  국제 채널 전용 프로젝트: ' + (process.env.YT_CLIENT_ID_GLOBAL ? '있음' : '없음 — 결정함 D2(급하지 않음)')); }

console.log(`스튜디오 현황 — ${new Date(now + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ')} KST` + out.join('\n'));
