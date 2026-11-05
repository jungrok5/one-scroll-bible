// The periodic analysis, collected the same way every time (관리자 2026-11-04: 절차를 코드로). Numbers come from the YouTube
// Analytics API and from fixed page extractors (analytics/extract/*.js) run in the browser; every source lands as JSON in
// motion/films/analytics/<date>/, and `report` turns them into the same tables every time (the agent adds only the reading).
//   node motion/films/analytics/collect.mjs plan [date]        — the fixed list: API step + every page (URL · extractor · output file)
//   node motion/films/analytics/collect.mjs api [date]         — YouTube Analytics (Korean channel videos) + international status → JSON/text
//   node motion/films/analytics/collect.mjs script <extractor> [page]  — the code to run in the page (javascript_tool); with a page
//                                                                       name it POSTs the result to `recv`, which saves the plan's file
//   node motion/films/analytics/collect.mjs recv [date]        — local receiver (127.0.0.1:8766) for those POSTs; leave it running
//   node motion/films/analytics/collect.mjs check [date]       — which sources are still missing
//   node motion/films/analytics/collect.mjs report [date]      — analytics/<date>/report.md: tables + change since the last analysis + flags
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd(), A = join(ROOT, 'motion/films/analytics'), KO = 'UCtCcbrM2mCgfhSryo4SWxzg';
const [cmd, arg] = process.argv.slice(2), today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), date = (cmd === 'script' ? null : arg) || today, D = join(A, date);
const J = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const U = J(join(ROOT, 'motion/youtube/uploaded.json')) || {};
const prevDate = () => readdirSync(A).filter(d => /^\d{4}-\d\d-\d\d$/.test(d) && d < date).sort().pop();

// what to watch: the 14-min narrated film, every pipeline/film upload (h = long, v = Short), the Korean Shorts already public
function watched() {
  const v = [{ key: 'film-narr', id: U.film?.['ko-narr']?.id, short: false }, { key: 'film-music', id: U.film?.ko?.id, short: false }];
  for (const [k, x] of Object.entries(U)) if (x && x.h?.id && x.v?.id) v.push({ key: `${k}-h`, id: x.h.id, short: false }, { key: `${k}-v`, id: x.v.id, short: true });
  const S = U.shorts?.ko; for (const [n, id] of Object.entries(S?.ids || {})) if ((S.dates || {})[+n] && S.dates[+n] <= today) v.push({ key: `short-${String(+n).padStart(2, '0')}`, id, short: true, n: +n });
  return v.filter(x => x.id);
}
function pages() {
  const P = [{ name: 'studio-channel', url: `https://studio.youtube.com/channel/${KO}/analytics/tab-overview/period-default`, ex: 'studio-channel' },
    { name: 'studio-content', url: `https://studio.youtube.com/channel/${KO}/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=${KO}&time_period=4_weeks&explore_type=TABLE_AND_CHART&metric=VIEWS&granularity=DAY&t_metrics=VIEWS&t_metrics=AVERAGE_WATCH_PERCENTAGE&t_metrics=SUBSCRIBERS_NET_CHANGE&dimension=VIDEO&o_column=VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC`, ex: 'studio-content' }];
  for (const w of watched().filter(w => !w.n)) for (const tab of w.short ? ['overview', 'build_audience'] : ['reach_viewers', 'interest_viewers', 'build_audience'])
    P.push({ name: `video-${w.key}-${tab}`, url: `https://studio.youtube.com/video/${w.id}/analytics/tab-${tab}/period-default`, ex: 'studio-video' });
  P.push({ name: 'instagram', url: 'https://www.instagram.com/accounts/insights/?timeframe=7', ex: 'instagram' },
    { name: 'threads', url: 'https://www.threads.com/insights', ex: 'threads' },
    { name: 'ga4', url: 'https://analytics.google.com/analytics/web/?authuser=1#/a52565752p541891245/reports/explorer?r=lifecycle-traffic-acquisition-v2', ex: 'ga4' });
  return P;
}
const out = n => join(D, n + '.json'), RECV = 8766;

if (cmd === 'plan') {
  console.log(`정기 분석 수집 ${date} → motion/films/analytics/${date}/\n1) node motion/films/analytics/collect.mjs api ${date}\n2) 브라우저(한국어 채널 신원 · 각 페이지 8–10초 기다린 뒤): \`collect.mjs recv ${date}\`를 켜 두고, 페이지를 열고 \`collect.mjs script <추출기> <이름>\`의 코드를 javascript_tool로 실행 — 결과가 recv로 가서 그 파일로 저장된다`);
  for (const p of pages()) console.log(`   - ${p.name}${existsSync(out(p.name)) ? ' ✓' : ''}\n     ${p.url}\n     추출기 ${p.ex} → motion/films/analytics/${date}/${p.name}.json`);
  console.log(`3) node motion/films/analytics/collect.mjs check ${date}  →  4) node motion/films/analytics/collect.mjs report ${date}`);
} else if (cmd === 'script') {
  const f = join(A, 'extract', arg + '.js'); if (!existsSync(f)) { console.error('추출기 없음: ' + arg); process.exit(1); }
  // wrapped in one function so it can run again in the same page (no "already declared"); it returns the JSON string.
  // With a page name (`script studio-video video-film-narr-reach_viewers`) it also POSTs the result to `recv` — the tool's
  // output is cut at ~1,000 characters, so long tables (studio-content, 44 rows) cannot be copied back by hand (2026-11-05).
  // `auto` names a video page from its own URL (id → plan key, tab), so one script serves every video page; the POST form
  // first waits 9 s for the page's charts, so a batch can go navigate → script with no separate wait.
  const name = process.argv[4], body = readFileSync(join(A, 'extract/_lib.js'), 'utf8') + '\nconst __r = JSON.stringify(' + readFileSync(f, 'utf8').replace(/^\s*\/\/.*$/gm, '').trim() + ');\n';
  const K = Object.fromEntries(watched().map(w => [w.id, w.key]));
  const N = name === 'auto' ? `'video-' + ${JSON.stringify(K)}[(location.pathname.match(/video\\/([\\w-]{11})/) || [])[1]] + '-' + (location.pathname.match(/tab-(\\w+)/) || [])[1]` : JSON.stringify(name || '');
  console.log(name ? `await (async () => {\nawait new Promise(r => setTimeout(r, 9000));\n${body}const n = ${N};\nconst r = await fetch('http://127.0.0.1:${RECV}/' + n, { method: 'POST', body: __r }).then(r => r.text(), e => 'recv 없음: ' + e);\nreturn r + ' · ' + __r.slice(0, 300);\n})()`
    : `(() => {\n${body}return __r;\n})()`);
} else if (cmd === 'recv') {
  // receives the page extractors' JSON (POST /<page name>) and writes it to the plan's file; only plan names, only these sites
  const { createServer } = await import('node:http'), names = new Set(pages().map(p => p.name)); mkdirSync(D, { recursive: true });
  const ORIGINS = /^https:\/\/(studio\.youtube\.com|www\.instagram\.com|www\.threads\.com|analytics\.google\.com)$/;
  createServer((req, res) => {
    const o = req.headers.origin || ''; if (ORIGINS.test(o)) res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Access-Control-Allow-Private-Network', 'true'); res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    const n = decodeURIComponent(req.url.slice(1)); if (req.method !== 'POST' || !ORIGINS.test(o) || !names.has(n)) { res.writeHead(403); return res.end('no'); }
    let b = ''; req.on('data', c => { b += c; if (b.length > 2e6) req.destroy(); });
    req.on('end', () => { try { JSON.parse(b); } catch { res.writeHead(400); return res.end('JSON 아님'); } writeFileSync(out(n), b + '\n'); console.log(`✓ ${n} (${b.length}자)`); res.end(`저장 ${n}`); });
  }).listen(RECV, '127.0.0.1', () => console.log(`recv ${date} → motion/films/analytics/${date}/  (127.0.0.1:${RECV}, Ctrl+C로 끔)`));
} else if (cmd === 'api') {
  mkdirSync(D, { recursive: true }); const from = prevDate() || '2026-10-20', env = { ...process.env };
  for (const k of ['YT_CLIENT_ID', 'YT_CLIENT_SECRET', 'YT_REFRESH_TOKEN', 'YT_REFRESH_TOKEN_GLOBAL']) if (!env[k]) { console.error(`${k}가 없다 — 사용자 환경 변수에서 불러온 뒤 다시`); process.exit(1); }
  const w = watched(), r = spawnSync(process.execPath, ['motion/youtube/yt-api.mjs', 'report', ...w.map(x => x.id), '--from', from, '--json'], { encoding: 'utf8', env, maxBuffer: 1 << 26 });
  const j = JSON.parse((r.stdout || '{}').trim().split('\n').pop() || '{}'); writeFileSync(out('api-ko'), JSON.stringify({ from, to: date, keys: Object.fromEntries(w.map(x => [x.id, x.key])), videos: j }, null, 1) + '\n');
  const g = spawnSync(process.execPath, ['motion/youtube/yt-api.mjs', 'status'], { encoding: 'utf8', env: { ...env, YT_AS: 'GLOBAL' } }); writeFileSync(join(D, 'api-global.txt'), g.stdout || g.stderr);
  console.log(`api-ko.json (${Object.keys(j).length}편, ${from}…) · api-global.txt`);
} else if (cmd === 'check') {
  const need = ['api-ko', ...pages().map(p => p.name)], miss = need.filter(n => !existsSync(out(n)));
  console.log(miss.length ? `빠진 것 ${miss.length}개:\n  ` + miss.join('\n  ') : '모두 모였다'); process.exit(miss.length ? 2 : 0);
} else if (cmd === 'report') {
  const g = n => J(out(n)), p = prevDate(), pg = n => p ? J(join(A, p, n + '.json')) : null, fmt = v => v == null ? '—' : typeof v === 'number' ? (Math.abs(v) < 1 && v !== 0 ? (v * 100).toFixed(1) + '%' : v.toLocaleString('en-US')) : v;
  const d = (a, b) => (a == null || b == null) ? '' : ` (${a - b >= 0 ? '+' : ''}${Math.abs(a) < 1 ? ((a - b) * 100).toFixed(1) + '%p' : (a - b).toLocaleString('en-US')})`;
  const R = [`## ${date} — 정기 분석 (수집: analytics/${date}/, collect.mjs report${p ? ` · 지난 분석 ${p} 대비` : ''})`, ''];
  const ch = g('studio-channel'), cp = pg('studio-channel');
  if (ch) R.push(`**한국어 채널(${ch.period || '28일'})**: 조회 ${fmt(ch.views28)}${d(ch.views28, cp?.views28)} · 시청 ${fmt(ch.hours28)}시간 · 구독 +${fmt(ch.subs28)} · 지금 구독자 ${fmt(ch.realtime?.subscribers)}${d(ch.realtime?.subscribers, cp?.realtime?.subscribers)} · 48시간 조회 ${fmt(ch.realtime?.views48h)}`, '');
  R.push('| 영상 | 노출 · CTR | 조회 | 평균 | 0:30 / 계속 시청 | TV | 홈 · 추천 · 최종 화면 | 자막(한국어) |', '|---|---|---|---|---|---|---|---|');
  for (const w of watched().filter(w => !w.n)) { const tabs = (w.short ? ['overview', 'build_audience'] : ['reach_viewers', 'interest_viewers', 'build_audience']).map(t => g(`video-${w.key}-${t}`) || {}), m = Object.assign({}, ...tabs.map(t => Object.fromEntries(Object.entries(t).filter(([, v]) => v != null && !(typeof v === 'object' && !Object.keys(v).length)))));
    const tr = m.traffic || {}, tv = (m.device || {})['TV'], ko = (m.captions || {})['한국어'];
    R.push(`| ${w.key} (${w.id}) | ${fmt(m.impressions)} · ${fmt(m.ctr)} | ${fmt(m.views)} | ${m.avgDuration || '—'}${m.avgPct != null ? ' (' + fmt(m.avgPct) + ')' : ''} | ${fmt(m.at30s)} / ${fmt(m.keptWatching)} | ${fmt(tv)} | ${fmt(tr['탐색 기능'])} · ${fmt(tr['추천 동영상'])} · ${fmt(tr['최종 화면'])} | ${fmt(ko)} |`); }
  // the 화풍·요소 표: Korean Shorts by look (content explorer rows matched by "N/21")
  const ct = g('studio-content'), LK = J(join(A, 'looks.json'))?.shorts_ko || {};
  if (ct) { R.push('', '**화풍·요소 표 — 한국어 쇼츠(28일)**', '', '| 편 | 화풍 | 판 | 조회 | 평균 조회율 | 구독 |', '|---|---|---|---|---|---|');
    for (const r of ct.rows.filter(r => /\d+\/21/.test(r.title) && /[가-힣]/.test(r.title)).sort((a, b) => b.views - a.views)) { const n = +r.title.match(/(\d+)\/21/)[1];
      R.push(`| ${n} | ${LK[n]?.look || '—'} | ${LK[n]?.cut || ''} | ${fmt(r.views)} | ${fmt(r.avgPct)} | ${fmt(r.subs)} |`); } }
  const ig = g('instagram'), ip = pg('instagram'); if (ig) R.push('', `**인스타그램(7일)**: 조회 ${fmt(ig.views)}${d(ig.views, ip?.views)} · 도달 ${fmt(ig.reached)} · 팔로워 아닌 사람 ${fmt(ig.nonFollowerShare)} · 반응 ${fmt(ig.interactions)} · 프로필 방문 ${fmt(ig.profileVisits)} · 팔로워 ${fmt(ig.followers)}${d(ig.followers, ip?.followers)}`,
    '  인기 릴스: ' + ig.topByViews.map(x => `${x.date} ${fmt(x.views)}`).join(' · '));
  const th = g('threads'); if (th) R.push(`**스레드**: 최근 글 조회 ${th.posts.map(x => x.views).join(' · ')}`);
  const ga = g('ga4'); if (ga) R.push('', `**사이트 GA4(${ga.period || '28일'})**: ` + Object.entries(ga.rows).map(([k, v]) => `${k} ${fmt(v.sessions)}(참여 ${fmt(v.engagementRate)}, 주요 이벤트 ${fmt(v.keyEvents)})`).join(' · '));
  const gt = existsSync(join(D, 'api-global.txt')) ? readFileSync(join(D, 'api-global.txt'), 'utf8') : ''; if (gt) R.push('', '**국제 채널**: ' + gt.split('\n').filter(l => /shorts|film/.test(l)).map(l => l.replace(/\s+/g, ' ').replace(/ videos.*views/, ' 조회')).join(' · '));
  R.push('', '**읽은 것** (에이전트가 쓴다: 숫자 → 그림·소리·형식 요소 → 다음 영상에 바꿀 것)', '', '**다음 추천 제작 주제** (README 10절 근거 형식)', '');
  writeFileSync(join(D, 'report.md'), R.join('\n') + '\n'); console.log(`analytics/${date}/report.md`); console.log(R.join('\n'));
} else { console.log('plan | api | script <extractor> [page] | recv | check | report  [date]'); process.exit(1); }
