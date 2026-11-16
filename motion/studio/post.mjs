// Post-publication analysis per film at day 7 and day 28 (operations-proposal §4-6, week 4): the numbers of one film go into
// that film's review.json, next to the same numbers of the films before it, so the next film's rules can learn from it.
//   node motion/studio/studio.mjs post            every film: publish day, day 7 / day 28 — done, due, or when
//   node motion/studio/studio.mjs post run        collect what is due (YouTube Analytics through yt-api.mjs report --json — no Data API quota
//                                                 except 1 unit for titles) → review.json "post".d7 | d28, then print the comparison
//   node motion/studio/studio.mjs post show <film> [7|28]
// Day N = the first N days from the publish day (Analytics is ~2 days behind, so day 7 is collected from day 9).
// The reading (what to change) is the analysis desk's: ANALYTICS.md "요소 분석", insights.json, rules — routine.mjs analysis runs `post run`.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..', '..'), M = join(ROOT, 'motion');
const J = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const D = t => new Date(t).toISOString().slice(0, 10), add = (d, n) => D(Date.parse(d + 'T00:00:00Z') + n * 864e5);
const today = D(Date.now() + 9 * 3600e3), MARKS = [7, 28], LAG = 2;

function films() {   // every film with a public Korean landscape record; its Korean and international ids
  const U = J(join(M, 'youtube', 'uploaded.json')) || {}, out = [];
  for (const [name, r] of Object.entries(U)) {
    if (!r?.h?.id || !existsSync(join(M, 'films', name, 'review.json'))) continue;
    const pub = r.h.publish_at ? D(Date.parse(r.h.publish_at) + 9 * 3600e3) : null; if (!pub) continue;
    const ko = { h: r.h.id, v: r.v?.id, ...Object.fromEntries(Object.entries(r.clips || {}).filter(([, c]) => c?.id).map(([k, c]) => ['clip_' + k, c.id + (c.publish_at ? '@' + D(Date.parse(c.publish_at) + 9 * 3600e3) : '')])) };
    const g = U.global?.films?.[name], gpub = g?.published?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    out.push({ name, pub, ko, gl: g?.h?.id && gpub ? { pub: gpub, ids: { h: g.h.id, v: g.v?.id } } : null });
  }
  return out.sort((a, b) => a.pub.localeCompare(b.pub));
}
const reviewOf = name => join(M, 'films', name, 'review.json');
function report(ids, from, to, gl) {
  ids = Object.fromEntries(Object.entries(ids).filter(([, v]) => v && !(v.includes('@') && v.split('@')[1] > to)).map(([k, v]) => [k, v.split('@')[0]]));   // a clip counts only once it was public
  const list = Object.values(ids).filter(Boolean);
  const p = spawnSync(process.execPath, [join(M, 'youtube', 'yt-api.mjs'), 'report', ...list, '--from', from, '--to', to, '--json'], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...(gl ? { YT_AS: 'GLOBAL' } : {}) }, maxBuffer: 1 << 26 });
  const line = (p.stdout || '').trim().split('\n').pop(); let j; try { j = JSON.parse(line); } catch { throw new Error(((p.stderr || '') + (p.stdout || '')).slice(0, 300)); }
  const out = {}; for (const [k, id] of Object.entries(ids)) if (id && j[id]) { const o = j[id];
    out[k] = { id, views: o.views, avgPct: o.avgPct, avgSec: o.avgSec, likes: o.likes, shares: o.shares, subs: o.subs, minutes: o.minutes,
      tv: o.device?.TV ?? 0, mobile: o.device?.MOBILE ?? 0, age55: Object.keys(o.age || {}).length ? +((o.age['55-64'] || 0) + (o.age['65-'] || 0)).toFixed(3) : null,   // empty when YouTube withholds ages (few viewers)
      top: Object.entries(o.traffic || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s, v]) => `${s} ${Math.round(v * 100)}%`).join(' · '),
      retention10: (o.retention || []).filter(r => Math.round(r[0] * 100) % 10 === 0).map(r => [r[0], r[1]]), ...(o.error ? { error: o.error } : {}) }; }
  return out;
}
const row = (k, x) => x ? `  ${k.padEnd(8)} 조회 ${String(x.views ?? '-').padStart(6)} · 평균 ${x.avgPct ?? '-'}% (${x.avgSec ?? '-'}초) · 좋아요 ${x.likes ?? '-'} · 공유 ${x.shares ?? '-'} · 구독 +${x.subs ?? '-'} · TV ${Math.round((x.tv || 0) * 100)}% · 55+ ${x.age55 == null ? '-' : Math.round(x.age55 * 100) + '%'}${x.top ? ' · ' + x.top : ''}` : `  ${k.padEnd(8)} (자료 없음)`;
function compare(name, mark, all) {   // this film vs every earlier film at the same mark (same slot: h, v)
  const lines = [], me = J(reviewOf(name))?.post?.['d' + mark]; if (!me) return lines;
  for (const f of all.filter(f => f.name !== name && f.pub < all.find(x => x.name === name).pub)) { const o = J(reviewOf(f.name))?.post?.['d' + mark]; if (!o) continue;
    for (const k of ['h', 'v']) { const a = me.ko?.[k], b = o.ko?.[k]; if (a && b) lines.push(`  vs 「${f.name}」 ${k}: 조회 ${a.views} / ${b.views} · 평균 ${a.avgPct}% / ${b.avgPct}% · 구독 +${a.subs} / +${b.subs}`); } }
  return lines;
}

export async function post(args) {
  const [sub, ...rest] = args, all = films();
  if (sub === 'show') { const [name, m = '7'] = rest, P = J(reviewOf(name))?.post?.['d' + m]; if (!P) { console.log(`${name} d${m} 없음`); return; }
    console.log(`「${name}」 ${m}일 (${P.from} … ${P.to}, 모은 날 ${P.at})`); for (const [k, x] of Object.entries(P.ko || {})) console.log(row(k, x));
    if (P.gl) { console.log(' 국제판'); for (const [k, x] of Object.entries(P.gl)) console.log(row(k, x)); } compare(name, m, all).forEach(l => console.log(l)); return; }
  const run = sub === 'run';
  if (run && !process.env.YT_REFRESH_TOKEN) { console.log('YT_* 없음 — 사용자 환경 변수를 불러온 뒤'); process.exit(1); }
  console.log(`사후 분석 (7일·28일, 자료는 ${LAG}일 늦게 들어옴) — 오늘 ${today}`);
  for (const f of all) {
    const R = J(reviewOf(f.name)) || {}, cells = [];
    for (const m of MARKS) { const k = 'd' + m, due = add(f.pub, m + LAG), to = add(f.pub, m - 1);
      if (R.post?.[k]) { cells.push(`${m}일 ✓(${R.post[k].at})`); continue; }
      if (today < due) { cells.push(`${m}일 ${due}부터`); continue; }
      if (!run) { cells.push(`${m}일 모을 때 됨`); continue; }
      const raw = readFileSync(reviewOf(f.name), 'utf8'), r = JSON.parse(raw);
      const rec = { at: today, from: f.pub, to, ko: report(f.ko, f.pub, to, false) };
      if (f.gl) rec.gl = report(f.gl.ids, f.gl.pub, add(f.gl.pub, m - 1), true);
      (r.post ||= {})[k] = rec; writeFileSync(reviewOf(f.name), JSON.stringify(r, null, 1) + (raw.endsWith('\n') ? '\n' : ''));
      cells.push(`${m}일 방금 모음`);
      console.log(`\n「${f.name}」 ${m}일 (${f.pub} … ${to})`); for (const [kk, x] of Object.entries(rec.ko)) console.log(row(kk, x));
      if (rec.gl) { console.log(' 국제판'); for (const [kk, x] of Object.entries(rec.gl)) console.log(row(kk, x)); }
      compare(f.name, m, all).forEach(l => console.log(l)); }
    console.log(`  ${f.name.padEnd(12)} 공개 ${f.pub}${f.gl ? ` (국제 ${f.gl.pub})` : ''} — ${cells.join(' · ')}`);
  }
}
