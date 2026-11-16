// The 17:00 queue (operations-proposal §4-8, week 2–3): YouTube API jobs that wait for quota. The channel desk owns it.
// The daily 10,000 units reset at midnight Pacific (17:00 KST, 16:00 in US summer time); on an upload day the big jobs
// (playlists, deletes, caption uploads) no longer fit — they go here and run after the reset, in order, as far as the quota goes.
//   node motion/studio/studio.mjs queue                                   list: what waits, what fits in today's remaining units
//   node motion/studio/studio.mjs queue add "<node motion/… command>" --units N --why "<why>" [--ch ko|gl] [--after YYYY-MM-DD]
//   node motion/studio/studio.mjs queue run [--dry]                       run the waiting jobs that fit (YT_* in the environment)
//   node motion/studio/studio.mjs queue drop <n>                          remove a job (it stays in history)
// Only `node motion/…` commands are accepted. A job that publishes, deletes or changes a video goes in only after the maintainer's
// OK for that job (write the words in --why) — the queue moves work in time, it never grants permission.
// Units come from the ledger (motion/studio/quota.json, written by motion/youtube/yt-token.mjs) per paying project.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..', '..'), F = join(HERE, 'queue.json');
const J = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const load = () => J(F) || { _about: '17시 큐 — node motion/studio/studio.mjs queue (queue.mjs 머리말)', jobs: [], done: [] };
const save = q => writeFileSync(F, JSON.stringify(q, null, 1) + '\n');
const DAY = 10000;

export async function queue(args) {
  const { quotaDay, clientFor } = await import('../youtube/yt-token.mjs');
  const [sub = 'list', ...rest] = args, q = load();
  const flag = k => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : undefined; };
  const kstDay = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  const used = project => { const L = J(join(HERE, 'quota.json')); return L?.day === quotaDay() ? (L.projects[project]?.total || 0) : 0; };
  const left = ch => DAY - used(clientFor(ch).project);
  if (sub === 'add') {
    const cmd = rest[0], units = +flag('units'), why = flag('why');
    if (!(cmd || '').replace(/^([A-Z_]+=\S+\s+)+/, '').startsWith('node motion/') || !(units > 0) || !why) { console.log('usage: queue add "<node motion/… command>" --units N --why "<why>" [--ch ko|gl] [--after YYYY-MM-DD]'); process.exit(1); }
    const n = Math.max(0, ...q.jobs.map(j => j.n), ...q.done.map(j => j.n)) + 1;
    q.jobs.push({ n, cmd, units, why, ch: flag('ch') || (/YT_AS=GLOBAL|--gl\b/.test(cmd) ? 'gl' : 'ko'), after: flag('after') || null, added: kstDay });
    save(q); console.log(`추가: #${n} (${units} units, ${flag('ch') || 'ko'})`); return;
  }
  if (sub === 'drop') { const n = +rest[0], i = q.jobs.findIndex(j => j.n === n); if (i < 0) { console.log('no such job'); process.exit(1); }
    q.done.push({ ...q.jobs[i], dropped: kstDay }); q.jobs.splice(i, 1); save(q); console.log(`빼냄: #${n}`); return; }
  const ready = j => !j.after || j.after <= kstDay;
  if (sub === 'run') {
    const dry = rest.includes('--dry'), budget = { ko: left('ko'), gl: left('gl') }, shared = clientFor('gl').project === 'shared';
    for (const j of [...q.jobs]) {
      if (!ready(j)) { console.log(`#${j.n} 대기 — ${j.after}부터`); continue; }
      const b = shared ? Math.min(budget.ko, budget.gl) : budget[j.ch];
      if (j.units > b) { console.log(`#${j.n} 할당량 부족(${j.units} > 남은 ${b}) — 다음 쿼터일(한국 17시 뒤)`); continue; }
      console.log(`#${j.n} ${dry ? '실행할 것' : '실행'}: ${j.cmd}`); if (dry) { if (shared) { budget.ko -= j.units; budget.gl -= j.units; } else budget[j.ch] -= j.units; continue; }
      const env = { ...process.env, ...(j.ch === 'gl' ? { YT_AS: 'GLOBAL' } : {}) }, parts = j.cmd.match(/"[^"]*"|\S+/g).map(s => s.replace(/^"|"$/g, ''));
      const assign = []; while (/^[A-Z_]+=/.test(parts[0])) { const [k, v] = parts.shift().split('='); env[k] = v; assign.push(k); }
      const p = spawnSync(parts[0] === 'node' ? process.execPath : parts[0], parts.slice(1), { cwd: ROOT, env, encoding: 'utf8', timeout: 3600e3 });
      const tail = ((p.stdout || '') + (p.stderr || '')).trim().split('\n').slice(-4).join(' / ');
      q.jobs = q.jobs.filter(x => x.n !== j.n); q.done.push({ ...j, ran: new Date().toISOString(), exit: p.status, tail }); save(q);
      console.log(`  → exit ${p.status}: ${tail.slice(0, 300)}`);
      const b2 = { ko: left('ko'), gl: left('gl') }; budget.ko = b2.ko; budget.gl = b2.gl;
    }
    return;
  }
  // list
  console.log(`17시 큐 — 기다리는 일 ${q.jobs.length}개 · 오늘 남은 할당량: 한국어 ${left('ko').toLocaleString()} · 국제 ${left('gl').toLocaleString()}${clientFor('gl').project === 'shared' ? ' (같은 프로젝트를 나눠 씀 — D2)' : ''}`);
  for (const j of q.jobs) console.log(`  #${j.n} [${j.ch}] ${j.units} units${ready(j) ? '' : ` · ${j.after}부터`} — ${j.why}\n      ${j.cmd}`);
  const last = q.done.slice(-3); if (last.length) console.log('  최근: ' + last.map(j => `#${j.n} ${j.dropped ? '빼냄' : 'exit ' + j.exit}`).join(' · '));
}
