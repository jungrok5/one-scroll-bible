// What titles win on a topic — read-only YouTube search for a new film's title/thumbnail decision (stage 6 sheet, before A/B).
//   node motion/youtube/title-research.mjs "<검색어>" ["<검색어>" …] [--max 25] [--lang ko] [--json out.json]
// For each query: search.list (relevance, region KR, 100 quota units) → videos.list stats (1 unit/50) → one table sorted by
// views per day since publish: views · days · views/day · duration · channel · title, plus title shapes across the results
// (question mark, number, quote marks, "뜻", "—/|" two-part, length). Shorts (≤ 60 s) and long videos are counted apart.
// Why: 「그리스도」 2026-11-10 관리자 "제목과 썸네일을 어떻게 하면 좋을지 데이터는 없어?" — our own channel has two long films only
// (A/B "정보 부족"), so the market of the same topic is the other half of the evidence. Credentials as yt-api.mjs; never printed.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i > -1 ? args.splice(i, 2)[1] : d; };
const MAX = +opt('--max', 25), LANG = opt('--lang', 'ko'), OUT = opt('--json', null), Q = args;
if (!Q.length) { console.error('usage: title-research.mjs "<query>" [...] [--max 25] [--json out.json]'); process.exit(1); }
process.on('uncaughtException', e => { console.error('error: ' + String(e.message).replace(/<[^>]+>/g, '')); process.exit(1); });
function creds() {
  const env = { ...process.env }, f = join(homedir(), '.config', 'one-scroll-bible', 'youtube.env');
  if (existsSync(f)) for (const l of readFileSync(f, 'utf8').split('\n')) { const m = l.match(/^(YT_\w+)=(.*)$/); if (m && !env[m[1]]) env[m[1]] = m[2]; }
  const need = ['YT_CLIENT_ID', 'YT_CLIENT_SECRET', 'YT_REFRESH_TOKEN'].filter(k => !env[k]);
  if (need.length) { console.error('missing ' + need.join(', ')); process.exit(1); } return env;
}
const e = creds();
const tk = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: e.YT_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
if (!tk.access_token) { console.error('token refresh failed'); process.exit(1); }
const api = async (path, p) => { const r = await fetch(`https://www.googleapis.com/youtube/v3/${path}?` + new URLSearchParams(p), { headers: { Authorization: 'Bearer ' + tk.access_token } });
  const j = await r.json(); if (j.error) throw new Error(j.error.message); return j; };
const sec = d => { const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || []; return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0); };
const shape = t => ({ q: /\?|까\s*$|까[^가-힣]|나\?|을까|ㄹ까/.test(t), num: /\d/.test(t), quote: /["“”'‘’「」]/.test(t), meaning: /뜻|의미/.test(t), two: /\s[—\-|:]\s|\|/.test(t), len: [...t].length });
const all = [];
for (const q of Q) {
  const s = await api('search', { part: 'snippet', q, type: 'video', maxResults: String(MAX), regionCode: 'KR', relevanceLanguage: LANG, order: 'relevance' });
  const ids = s.items.map(i => i.id.videoId).filter(Boolean); if (!ids.length) continue;
  const v = await api('videos', { part: 'snippet,statistics,contentDetails', id: ids.join(',') });
  for (const x of v.items) { const days = Math.max(1, (Date.now() - Date.parse(x.snippet.publishedAt)) / 864e5), views = +(x.statistics.viewCount || 0), d = sec(x.contentDetails.duration);
    all.push({ q, id: x.id, title: x.snippet.title, channel: x.snippet.channelTitle, views, days: Math.round(days), vpd: +(views / days).toFixed(1), sec: d, short: d <= 60, ...shape(x.snippet.title) }); }
}
const uniq = [...new Map(all.map(r => [r.id, r])).values()].sort((a, b) => b.vpd - a.vpd);
const mmss = s => s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
console.log(`검색어 ${Q.map(q => `"${q}"`).join(' · ')} — 영상 ${uniq.length}개 (하루 조회 순)`);
for (const r of uniq.slice(0, 40)) console.log(`${String(r.views).padStart(9)} ${String(r.days).padStart(5)}일 ${String(r.vpd).padStart(8)}/일 ${mmss(r.sec).padStart(7)}  ${r.channel.slice(0, 14).padEnd(14)}  ${r.title}`);
const grp = (rows, name) => { if (!rows.length) return; const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const by = k => { const y = rows.filter(r => r[k]), n = rows.filter(r => !r[k]); return `${k} ${y.length}개 중앙 ${med(y.map(r => r.vpd))}/일 vs 아님 ${med(n.map(r => r.vpd))}/일`; };
  console.log(`${name} ${rows.length}개 · 제목 길이 중앙 ${med(rows.map(r => r.len))}자 — ` + ['q', 'num', 'quote', 'meaning', 'two'].map(by).join(' · ')); };
console.log('\n제목 모양(질문 q · 숫자 num · 따옴표 quote · 뜻/의미 meaning · 두 토막 two):');
grp(uniq.filter(r => !r.short), '긴 영상'); grp(uniq.filter(r => r.short), '쇼츠');
if (OUT) { writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), queries: Q, rows: uniq }, null, 1) + '\n'); console.log('저장: ' + OUT); }
