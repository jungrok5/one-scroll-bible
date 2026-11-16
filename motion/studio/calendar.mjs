// The broadcast calendar (operations-proposal §4-3 편성표, week 4): what goes public when, on which channel — one file, checked.
//   node motion/studio/studio.mjs cal [days]          next N days (default 30), KST, Sunday flag, status from the records
//   node motion/studio/studio.mjs cal sync            rebuild the mirrored rows from the records (keeps the planned rows)
//   node motion/studio/studio.mjs cal plan <YYYY-MM-DD[THH:MM]> <ko|gl|ig|threads> "<what>" [--note "…"]   a planned row (no id yet)
//   node motion/studio/studio.mjs cal drop <n>        remove a planned row
// Rows: mirrored from motion/youtube/uploaded.json (every future publish_at; under "global" = gl) and from
// motion/films/*/social/clips-{instagram,threads}.json ("at"), plus planned rows the producer adds. calendar.json is committed.
// checkCalendar() is used by the nightly check: Korean-channel rows (ko, ig, threads) never on a Sunday KST (rules no-sunday),
// planned rows whose day passed without a record, and — with live=true — the real YouTube schedule (videos.list, 1 unit per 50 ids).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..', '..'), M = join(ROOT, 'motion'), F = join(HERE, 'calendar.json');
const J = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const kst = t => new Date(Date.parse(t) + 9 * 3600e3), WD = '일월화수목금토';
const fmt = t => { const d = kst(t); return `${d.toISOString().slice(0, 10)}(${WD[d.getUTCDay()]}) ${d.toISOString().slice(11, 16)}`; };
const KOREAN = new Set(['ko', 'ig', 'threads']);   // the Sunday rule covers the Korean YouTube channel, Instagram and Threads
const load = () => J(F) || { _about: '편성표 — node motion/studio/studio.mjs cal (calendar.mjs 머리말). source=uploaded/social은 sync가 다시 만들고, plan만 손으로.', rows: [] };
const save = c => { c.rows.sort((a, b) => Date.parse(a.at) - Date.parse(b.at)); writeFileSync(F, JSON.stringify(c, null, 1) + '\n'); };

function mirrored() {
  const U = J(join(M, "youtube", "uploaded.json")) || {}, rows = [], now = Date.now();
  const walk = (o, path, gl) => { if (!o || typeof o !== 'object') return; for (const [k, v] of Object.entries(o)) {
    if (k === 'publish_at' && typeof v === 'string' && Date.parse(v) > now) { const at = new Date(Date.parse(v)).toISOString(), what = path.join('.');
      rows.push({ at, ch: gl ? 'gl' : 'ko', what, title: o.title || '', id: o.id || '', source: 'uploaded' });
      // a record whose note says the same cut is scheduled on Instagram / Threads at the same time (e.g. silence400 clips, no social file)
      if (!gl && /instagram/i.test(o.note || '') && /same time/i.test(o.note || '')) rows.push({ at, ch: 'ig', what, title: o.title || '', source: 'uploaded-note' });
      if (!gl && /threads/i.test(o.note || '') && /same time/i.test(o.note || '')) rows.push({ at, ch: 'threads', what, title: o.title || '', source: 'uploaded-note' }); }
    else if (typeof v === 'object') walk(v, [...path, k], gl || k === 'global'); } };
  walk(U, [], false);
  for (const film of readdirSync(join(M, 'films'))) for (const [file, ch] of [['clips-instagram.json', 'ig'], ['clips-threads.json', 'threads']]) {
    const S = J(join(M, 'films', film, 'social', file)); if (!Array.isArray(S)) continue;
    for (const s of S) if (s.at && Date.parse(s.at) > now) rows.push({ at: new Date(Date.parse(s.at)).toISOString(), ch, what: `${film}.clips.${s.n}`, title: (s.caption || '').split('\n')[0].slice(0, 40), id: s.id || '', source: 'social' }); }
  return rows;
}

export function sync() { const c = load(); c.rows = [...c.rows.filter(r => r.source === 'plan'), ...mirrored()]; c.synced = new Date().toISOString(); save(c); return c; }

export async function checkCalendar({ live = false } = {}) {
  const c = sync(), p = [], today = kst(new Date().toISOString()).toISOString().slice(0, 10);
  for (const r of c.rows) {
    if (KOREAN.has(r.ch) && kst(r.at).getUTCDay() === 0 && Date.parse(r.at) > Date.now()) p.push(`${fmt(r.at)} ${r.ch} ${r.what} — 주일 공개(규칙 no-sunday)`);
    if (r.source === 'plan' && kst(r.at).toISOString().slice(0, 10) < today) p.push(`계획 ${fmt(r.at)} ${r.ch} "${r.what}" — 날짜가 지났는데 기록 없음(올렸으면 uploaded.json에, 미뤘으면 cal plan으로 다시)`);
  }
  if (live) {   // the real schedule on YouTube vs the record (catches a schedule changed in Studio but not in uploaded.json)
    const { accessToken } = await import('../youtube/yt-token.mjs');
    for (const ch of ['ko', 'gl']) { const ids = c.rows.filter(r => r.ch === ch && r.id).map(r => r.id); if (!ids.length) continue;
      const t = await accessToken(ch);
      for (let i = 0; i < ids.length; i += 50) { const j = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status&id=${ids.slice(i, i + 50).join(',')}`, { headers: { Authorization: 'Bearer ' + t } })).json();
        const got = Object.fromEntries((j.items || []).map(x => [x.id, x.status]));
        for (const r of c.rows.filter(r => r.ch === ch && ids.slice(i, i + 50).includes(r.id))) { const s = got[r.id];
          if (!s) p.push(`${r.what} ${r.id} — 유튜브에 없음(지워졌거나 다른 채널)`);
          else if (s.privacyStatus === 'public') p.push(`${r.what} ${r.id} — 이미 공개인데 기록은 ${fmt(r.at)} 예약(uploaded.json 고치기)`);
          else if (!s.publishAt) p.push(`${r.what} ${r.id} — 유튜브에 예약이 없음(${s.privacyStatus}) — 기록은 ${fmt(r.at)}`);
          else if (Math.abs(Date.parse(s.publishAt) - Date.parse(r.at)) > 60e3) p.push(`${r.what} ${r.id} — 유튜브 예약 ${fmt(s.publishAt)} ≠ 기록 ${fmt(r.at)}`); } } } }
  return { rows: c.rows.length, problems: p };
}

export async function calendar(args) {
  const [sub, ...rest] = args;
  if (sub === 'sync') { const c = sync(); console.log(`편성표 다시 맞춤 — ${c.rows.length}줄 (계획 ${c.rows.filter(r => r.source === 'plan').length})`); return; }
  if (sub === 'plan') {
    const [when, ch, what] = rest, i = rest.indexOf('--note');
    if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(when || '') || !['ko', 'gl', 'ig', 'threads'].includes(ch) || !what) { console.log('usage: cal plan <YYYY-MM-DD[THH:MM]> <ko|gl|ig|threads> "<what>" [--note "…"]'); process.exit(1); }
    const at = new Date(Date.parse((when.includes('T') ? when : when + 'T19:00') + ':00+09:00')).toISOString();
    const c = load(), n = Math.max(0, ...c.rows.map(r => r.n || 0)) + 1;
    c.rows.push({ n, at, ch, what, source: 'plan', note: i >= 0 ? rest[i + 1] : '' }); save(c);
    console.log(`계획 #${n}: ${fmt(at)} ${ch} ${what}${KOREAN.has(ch) && kst(at).getUTCDay() === 0 ? '  ← 주일! 한국어 채널·인스타·스레드는 주일 공개 안 함' : ''}`); return;
  }
  if (sub === 'drop') { const c = load(), n = +rest[0], i = c.rows.findIndex(r => r.source === 'plan' && r.n === n); if (i < 0) { console.log('계획 줄 번호가 아님'); process.exit(1); }
    c.rows.splice(i, 1); save(c); console.log(`빼냄: 계획 #${n}`); return; }
  const days = +(sub || 30) || 30, c = sync(), until = Date.now() + days * 864e5;
  const rows = c.rows.filter(r => Date.parse(r.at) < until);
  console.log(`편성표 — 다음 ${days}일, 한국 시간 (${rows.length}줄)`);
  let last = '';
  for (const r of rows) { const d = fmt(r.at), dd = d.slice(0, 13); if (dd !== last) { console.log(''); last = dd; }
    const sun = KOREAN.has(r.ch) && kst(r.at).getUTCDay() === 0;
    console.log(`  ${d}  ${r.ch.padEnd(7)} ${r.source === 'plan' ? `[계획 #${r.n}] ` : ''}${r.what}${r.id ? ' ' + r.id : ''} ${r.title || r.note || ''}${sun ? '  ← 주일!' : ''}`.trimEnd()); }
}
