// The first film (14 min) — language expansion as code (관리자 2026-11-13: "얘기한 건 전부 규칙과 도구로 — 다음 세션이나 메모리가
//휘발되어도 동작하게"). Policy: LANGUAGES.md §4-1 + film14.json "rules". Ids: uploaded.json only.
//   node motion/youtube/film14.mjs status [lang…]        → every language's layers (music h/v, narrated h/v, captions files, site button,
//        narration gates) and its NEXT step. Offline, no quota. Start every 14-min session with this.
//   node motion/youtube/film14.mjs site [--write]        → the site's film button (index.html FILM_YT) = narrated id when the language has
//        one, else the music id. Shows the diff; --write rewrites FILM_YT (then build + commit + deploy per AGENTS.md).
//   node motion/youtube/film14.mjs captions [--dry]      → upload the caption tracks that are missing (rules "captions-byproduct"):
//        list 50 units per video, upload 400 units per track. Uses yt-api.mjs caption-file.
//   node motion/youtube/film14.mjs narr-check <lang>     → the narrated-version gates (rules "narr-gates"); exit 1 while one is open.
//   node motion/youtube/film14.mjs narr-verify <lang> <transcript.txt> → generated voice vs script (motion/narration/<lang>.json):
//        each line's best match in the transcript, lines under 0.85 similarity listed. Transcript = ElevenLabs transcribe output text.
//   node motion/youtube/film14.mjs intl-layout [--dry]   → = intl-layout.mjs plan|apply (international channel layout, intl-layout.json)
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url)), M = join(HERE, '..'), ROOT = join(M, '..');
const P = JSON.parse(readFileSync(join(HERE, 'film14.json'), 'utf8')), U = JSON.parse(readFileSync(join(HERE, 'uploaded.json'), 'utf8')), G = U.global;
process.on('uncaughtException', e => { console.error('error: ' + String(e.message).replace(/<[^>]+>/g, '')); process.exit(1); });
const YT_LANG = { tl: 'fil' }, ytl = L => YT_LANG[L] || L;
const langs = () => [...new Set([...readdirSync(join(ROOT, 'film', 's', 'i18n')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)), ...Object.keys(G.film)])].filter(L => !L.includes('-narr') && !/-v$/.test(L));
// ids per language and kind (Korean lives at the top level of uploaded.json, every other language under global)
const vid = (L, k) => { const key = k === 'music' ? L : k === 'music-v' ? `${L}-v` : k === 'narr' ? `${L}-narr` : `${L}-narr-v`; return (L === 'ko' ? U.film[key] : G.film[key])?.id || null; };
const subs = L => join(M, 'subs', L, 'film-h.srt'), subsV = L => join(M, 'subs', L, 'film-v.srt'), narrVtt = L => join(M, 'narration', `${L}-narr.vtt`), narrScript = L => join(M, 'narration', `${L}.json`);
const filmYt = () => JSON.parse((readFileSync(join(ROOT, 'index.html'), 'utf8').match(/const FILM_YT=(\{[^}]*\})/) || [, '{}'])[1]);
const wantYt = L => vid(L, 'narr') || vid(L, 'music');

function gates(L) {
  const n = P.narr[L] || {}, rev = join(M, 'reviews', `${L}-narr.md`), out = [];
  if (n.elevenlabs !== 'yes') out.push(`ElevenLabs가 이 언어를 잘 읽는지 (film14.json narr.${L}.elevenlabs = ${n.elevenlabs || '없음'})`);
  if (n.scripture_audio !== 'ok') out.push(`성경 낭독 허락 (narr.${L}.scripture_audio = ${n.scripture_audio || '없음'}${n.source ? ' — ' + n.source : ''})`);
  if (!existsSync(narrScript(L))) out.push(`해설 원고 번역 ${narrScript(L).replace(ROOT + '\\', '').replace(ROOT + '/', '')} (ko.json과 같은 모양)`);
  else if (!existsSync(rev)) out.push(`해설 원고 관문 보고서 motion/reviews/${L}-narr.md (역번역 + 원어민 검수)`);
  else if (/\b(BLOCKER|MAJOR)\b[^\n]*\b(open|미해결|남음)\b/i.test(readFileSync(rev, 'utf8'))) out.push(`motion/reviews/${L}-narr.md에 미해결 BLOCKER/MAJOR`);
  if (n.pilot !== 'approved') out.push(`1분 시험본 관리자 승인 (narr.${L}.pilot = ${n.pilot || 'none'})`);
  return out;
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'status' || !cmd) {
  const only = rest.filter(a => !a.startsWith('--')), yt = filmYt(), rows = [];
  for (const L of ['ko', ...langs().filter(l => l !== 'ko')].filter(l => !only.length || only.includes(l))) {
    const r = { L, music: vid(L, 'music') ? 'h' : '-', mv: vid(L, 'music-v') ? 'v' : '-', narr: vid(L, 'narr') ? 'h' : '-', nv: vid(L, 'narr-v') ? 'v' : '-',
      srt: L === 'ko' ? '(원본)' : existsSync(subs(L)) ? 'yes' : '-', nvtt: existsSync(L === 'ko' ? join(M, 'narration', 'ko-narr.vtt') : narrVtt(L)) ? 'yes' : '-',
      site: yt[L] === wantYt(L) ? 'ok' : yt[L] ? `틀림(${yt[L]}≠${wantYt(L)})` : wantYt(L) ? `없음(${wantYt(L)})` : '-' };
    const next = [];
    if (!vid(L, 'music')) next.push('음악판 가로 올리기 (/add-film-language 5–6단계)');
    if (!vid(L, 'music-v')) next.push('음악판 세로 14분' + (P.todo.some(t => /vfull/.test(t)) ? ' — CI vfull 단계부터 만들 것(film14.json todo)' : ` (film-lang.mjs ci ${L} --steps "vfull release" → 릴리즈 film-${L}-v.mp4)`));
    // every language: the 21 scene Shorts are the base (rule music-base, 관리자 2026-11-13 오후)
    const nShorts = Object.keys((L === 'ko' ? U.shorts.ko : G.shorts?.[L])?.ids || {}).length;
    if (nShorts < 21) next.push(`장면 쇼츠 ${nShorts}/21 (film-lang.mjs ci ${L} --steps "v release" → 물결로 올리기 global-move.mjs)`);
    if (r.site !== 'ok' && wantYt(L)) next.push('사이트 버튼: film14.mjs site --write');
    if (P.narr[L] && !vid(L, 'narr')) { const g = gates(L); next.push(g.length ? '해설판 관문: ' + g.join(' · ') : '해설판 만들기(관문 통과)'); }
    if (vid(L, 'narr') && !vid(L, 'narr-v')) next.push('해설판 세로');
    // narrated Shorts (rule narr-layer): replace unpublished music Shorts, or a second run ~1 month after the music run (ids: global.shorts['<L>-narr'])
    if (vid(L, 'narr') && L !== 'ko' && Object.keys(G.shorts?.[`${L}-narr`]?.ids || {}).length < 21) next.push('해설 쇼츠 21편 (공개 전 음악 쇼츠는 바꿔 넣고, 이미 나갔으면 약 한 달 뒤 두 번째 연재)');
    rows.push({ ...r, next: next.join(' / ') || '—' });
  }
  console.log('lang     music h v | narr h v | subs  narrVtt | site button | NEXT');
  for (const r of rows) console.log(`${r.L.padEnd(8)} ${r.music}     ${r.mv} |   ${r.narr}  ${r.nv} | ${r.srt.padEnd(5)} ${r.nvtt.padEnd(7)} | ${r.site.padEnd(11)} | ${r.next}`);
  console.log('\nnarr 후보는 film14.json "narr"에 있는 언어만(관문: film14.mjs narr-check <lang>). 자막 업로드 점검: film14.mjs captions --dry · 연결 점검: xlinks.mjs audit');
  if (P.todo.length) console.log('todo:\n' + P.todo.map(t => '  - ' + t).join('\n'));
} else if (cmd === 'site') {
  const yt = filmYt(), want = {}; for (const L of ['ko', ...langs().filter(l => l !== 'ko')]) if (wantYt(L)) want[L] = wantYt(L);
  const diff = Object.keys({ ...yt, ...want }).filter(L => yt[L] !== want[L]);
  if (!diff.length) { console.log('FILM_YT ok'); process.exit(0); }
  for (const L of diff) console.log(`${L}: ${yt[L] || '-'} → ${want[L] || '-'}`);
  if (rest.includes('--write')) { const f = join(ROOT, 'index.html'), s = readFileSync(f, 'utf8');
    writeFileSync(f, s.replace(/const FILM_YT=\{[^}]*\};/, `const FILM_YT=${JSON.stringify(want)};`));
    const ko = want.ko; if (ko) writeFileSync(f, readFileSync(f, 'utf8').replace(/(id="filmCta" href="https:\/\/youtu\.be\/)[\w-]+/, `$1${ko}`));
    console.log('index.html written — node tools/build-pages.mjs, commit, deploy per AGENTS.md (main only with the OK)'); }
} else if (cmd === 'captions') {
  const dry = rest.includes('--dry'), want = []; // [channel, videoId, file, ytLang, why]
  const koM = vid('ko', 'music'), koN = vid('ko', 'narr');
  for (const L of langs()) {
    if (existsSync(subs(L))) { if (koM) want.push(['ko', koM, subs(L), ytl(L), `${L} 화면 글자 → 한국어 음악판`]); if (vid(L, 'music')) want.push(['gl', vid(L, 'music'), subs(L), ytl(L), `${L} 화면 글자 → ${L} 음악판`]); }
    if (L !== 'ko' && vid(L, 'music-v') && existsSync(subsV(L))) want.push(['gl', vid(L, 'music-v'), subsV(L), ytl(L), `${L} 화면 글자(세로 배치, film-v.srt) → ${L} 음악판 세로`]);
    if (existsSync(narrVtt(L))) { if (koN) want.push(['ko', koN, narrVtt(L), ytl(L), `${L} 해설 → 한국어 해설판`]); if (vid(L, 'narr')) want.push(['gl', vid(L, 'narr'), narrVtt(L), ytl(L), `${L} 해설 → ${L} 해설판`]); }
  }
  const env = k => ({ ...process.env, ...(k === 'gl' ? { YT_AS: 'GLOBAL' } : {}) }), have = {};
  async function tracks(ch, id) {
    if (have[id]) return have[id]; const e = process.env, rt = ch === 'gl' ? e.YT_REFRESH_TOKEN_GLOBAL : e.YT_REFRESH_TOKEN;
    const t = (await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: e.YT_CLIENT_ID, client_secret: e.YT_CLIENT_SECRET, refresh_token: rt, grant_type: 'refresh_token' }) })).json()).access_token;
    const j = await (await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${id}`, { headers: { Authorization: 'Bearer ' + t } })).json();
    if (j.error) throw new Error(j.error.message); return (have[id] = (j.items || []).filter(c => c.snippet.trackKind !== 'asr').map(c => c.snippet.language));
  }
  let up = 0; for (const [ch, id, file, lang, why] of want) { if ((await tracks(ch, id)).includes(lang)) continue;
    console.log(`missing: ${why} (${id}, ${lang})`); if (dry) continue;
    const r = spawnSync(process.execPath, [join(HERE, 'yt-api.mjs'), 'caption-file', id, file, lang], { encoding: 'utf8', env: env(ch) }); console.log((r.stdout + r.stderr).trim()); up++; }
  console.log(`${want.length} wanted, ${dry ? 'dry run' : up + ' uploaded'} — then remove the matching automatic tracks: yt-api asr-off <id…> (standing OK 2026-11-13)`);
} else if (cmd === 'narr-check') {
  const L = rest[0]; if (!L) { console.log('usage: narr-check <lang>'); process.exit(1); }
  const g = gates(L); if (!g.length) console.log(`${L}: 관문 모두 통과 — 해설판을 만들어도 된다`); else { console.log(`${L}: 열린 관문\n` + g.map(x => '  - ' + x).join('\n')); process.exit(1); }
} else if (cmd === 'narr-verify') {
  const [L, tf] = rest; if (!L || !tf || !existsSync(narrScript(L))) { console.log('usage: narr-verify <lang> <transcript.txt>  (needs motion/narration/<lang>.json)'); process.exit(1); }
  const norm = s => s.toLowerCase().normalize('NFC').replace(/[\s\p{P}\p{S}]/gu, ''), T = norm(readFileSync(tf, 'utf8'));
  const sim = (a, b) => { const m = a.length, n = b.length; if (!m) return 1; let prev = Array(n + 1).fill(0), best = 0; // best local alignment of a inside b (edit distance)
    prev = Array.from({ length: n + 1 }, () => 0); for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
    best = Math.min(...prev); return 1 - best / m; };
  const { lines } = JSON.parse(readFileSync(narrScript(L), 'utf8')); let bad = 0;
  for (const [i, l] of lines.entries()) { const s = sim(norm(l.text || l.say || ''), T); if (s < 0.85) { bad++; console.log(`#${i} ${s.toFixed(2)}  ${l.text || l.say}`); } }
  console.log(`${lines.length - bad}/${lines.length} lines match (≥0.85)${bad ? ' — listen to the flagged lines; Scripture lines must be exact' : ''}`); process.exit(bad ? 1 : 0);
} else if (cmd === 'intl-layout') {
  // moved to intl-layout.mjs (rules intl-layout.json — playlists, series playlist, home, channel description per language)
  const r = spawnSync(process.execPath, [join(HERE, 'intl-layout.mjs'), rest.includes('--dry') ? 'plan' : 'apply'], { stdio: 'inherit' }); process.exit(r.status ?? 1);
} else console.log('usage: node motion/youtube/film14.mjs status [lang…] | site [--write] | captions [--dry] | narr-check <lang> | narr-verify <lang> <transcript> | intl-layout [--dry]');
