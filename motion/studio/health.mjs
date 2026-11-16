// Nightly check (operations-proposal §4-7, week 2–3): every existing check in one run, only the problems reported.
//   node motion/studio/studio.mjs health [--full]
// Cheap checks every night (≈70 units): links in descriptions (xlinks audit), playlists and home (intl-layout plan), the site's film
// button (film14 site), the Korean channel's Sunday rule, records (uploaded.json ids), due follow-ups (second auto-caption pass).
// --full (jobs/health.ps1 adds it on Mondays): also the caption tracks of the 14-min films (film14 captions --dry — ≈1,100 units, captions.list = 50 each).
// Writes motion/studio/health.json (last result, read by studio.mjs status) and logs/<date>-health.log (both gitignored).
// Read-only: it runs the tools' dry/plan/audit modes and never changes a video. YT_* must be in the environment (jobs/health.ps1 loads them).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..', '..'), M = join(ROOT, 'motion');
const J = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const run = (a, env = {}) => { const p = spawnSync(process.execPath, a, { cwd: ROOT, encoding: 'utf8', timeout: 600000, env: { ...process.env, ...env } }); return { out: (p.stdout || '') + (p.stderr || ''), code: p.status }; };
const kst = (t = Date.now()) => new Date(t + 9 * 3600e3), today = kst().toISOString().slice(0, 10);

export async function health(args = []) {
  const full = args.includes('--full');   // jobs/health.ps1 passes it on Mondays
  const problems = [], ok = [], log = [];
  const check = (name, fn) => { try { const r = fn(); log.push(`## ${name}\n${r.log || ''}`.trim()); (r.problems || []).forEach(p => problems.push({ check: name, what: p })); if (!r.problems?.length) ok.push(name); }
    catch (e) { problems.push({ check: name, what: 'check failed: ' + e.message }); } };
  const needKeys = !process.env.YT_REFRESH_TOKEN;

  // 1. description links on both channels
  check('연결 줄 (xlinks audit)', () => { if (needKeys) return { problems: ['YT_* 없음 — jobs/health.ps1로 실행'] };
    const r = run([join(M, 'youtube', 'xlinks.mjs'), 'audit']);
    return { log: r.out, problems: r.out.split('\n').map(l => l.match(/^(\S+): (\d+)\/(\d+) linked/)).filter(m => m && +m[2] < +m[3]).map(m => `${m[1]}: ${m[2]}/${m[3]}만 연결 — xlinks.mjs apply --kind ${m[1]} --dry`) }; });

  // 2. international playlists + series list (plan only; the home line is advice, not a problem)
  check('국제 재생목록 (intl-layout plan)', () => { if (needKeys) return { problems: ['YT_* 없음'] };
    const r = run([join(M, 'youtube', 'intl-layout.mjs'), 'plan']), n = +(r.out.match(/(\d+) change\(s\) to make/) || [])[1] || 0;
    return { log: r.out, problems: n ? [`재생목록 ${n}곳이 규칙과 다름 — intl-layout.mjs plan 보고 apply`] : [] }; });

  // 3. the site's 14-min film button + every language's site column
  check('사이트 영상 버튼 (film14 site/status)', () => {
    const s = run([join(M, 'youtube', 'film14.mjs'), 'site']), st = run([join(M, 'youtube', 'film14.mjs'), 'status']);
    const bad = st.out.split('\n').filter(l => /^[a-z]{2}(-\w+)?\s/.test(l) && l.split('|').length > 3).map(l => l.split('|')).filter(c => c[3] && !/\bok\b/.test(c[3])).map(c => `${c[0].trim().split(/\s+/)[0]}: 사이트 칸 "${c[3].trim()}"`);
    return { log: s.out + '\n' + st.out.split('\n').slice(0, 3).join('\n'), problems: [...(/FILM_YT ok/.test(s.out) ? [] : ['FILM_YT가 기록과 다름 — film14.mjs site --write']), ...bad] }; });

  // 4. records: uploaded.json parses, every "id" looks like a video id, Korean schedules never on a Sunday (KST)
  check('기록·주일 규칙 (uploaded.json)', () => {
    const U = J(join(M, 'youtube', 'uploaded.json')); if (!U) return { problems: ['uploaded.json을 읽을 수 없음(JSON 오류)'] };
    const p = [], walk = (o, path, gl) => { if (!o || typeof o !== 'object') return; for (const [k, v] of Object.entries(o)) {
      // video ids are 11 characters; playlists start with PL, comments with Ug
      if (k === 'id' && typeof v === 'string' && !/^[\w-]{11}$/.test(v) && !/^(PL|Ug)[\w-]{10,}$/.test(v)) p.push(`${path.join('.')}.id "${v}" — 영상·재생목록·댓글 id 모양이 아님`);
      if (k === 'publish_at' && typeof v === 'string' && !gl && Date.parse(v) > Date.now() && kst(Date.parse(v)).getUTCDay() === 0) p.push(`${path.join('.')} ${v} — 한국어 채널 주일 공개(규칙 no-sunday)`);
      if (typeof v === 'object') walk(v, [...path, k], gl || k === 'global'); } };
    walk(U, [], false); return { problems: p }; });

  // 5. follow-ups that have a date: the second auto-caption pass the day after publishing (rules asr-off-all)
  check('뒤따를 일 (자동 자막 두 번째)', () => {
    const U = J(join(M, 'youtube', 'uploaded.json')) || {}, p = [];
    const look = (o, name) => { if (o?.asr_off?.at && !o.asr_off.again && o.asr_off.at < today) p.push(`${name}: 자동 자막 두 번째가 ${o.asr_off.at} 다음 날부터 밀림 — ${name.startsWith('global') ? 'YT_AS=GLOBAL ' : ''}yt-api.mjs asr-off ${o.asr_off.ids.join(' ')}`); };
    for (const [k, v] of Object.entries(U)) if (v && typeof v === 'object' && k !== 'global') look(v, k);
    for (const [k, v] of Object.entries(U.global?.films || {})) look(v, 'global.films.' + k);
    return { problems: p }; });

  // 6. (weekly) caption tracks of the 14-min films
  if (full) check('14분 자막 트랙 (film14 captions --dry, 주 1회)', () => { if (needKeys) return { problems: ['YT_* 없음'] };
    const r = run([join(M, 'youtube', 'film14.mjs'), 'captions', '--dry']);
    return { log: r.out, problems: r.out.split('\n').filter(l => l.startsWith('missing:')).map(l => l.replace('missing: ', '자막 없음: ') + ' — film14.mjs captions') }; });

  const res = { at: new Date().toISOString(), day: today, full, problems, ok };
  writeFileSync(join(HERE, 'health.json'), JSON.stringify(res, null, 1) + '\n');
  mkdirSync(join(HERE, 'logs'), { recursive: true });
  writeFileSync(join(HERE, 'logs', `${today}-health.log`), `밤 점검 ${res.at}${full ? ' (전체)' : ''}\n문제 ${problems.length}\n` + problems.map(p => `- [${p.check}] ${p.what}`).join('\n') + '\n\n' + log.join('\n\n') + '\n');
  console.log(`밤 점검 ${today}${full ? ' (전체)' : ''} — 문제 ${problems.length}개 · 통과 ${ok.length}개`);
  for (const p of problems) console.log(`  ✗ [${p.check}] ${p.what}`);
  for (const o of ok) console.log(`  ✓ ${o}`);
  return res;
}
