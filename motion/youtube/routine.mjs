// The scheduled routines as code (관리자 2026-11-04: 예약 작업도 긴 지시문이 아니라 명령 하나로). A routine runs every step that is
// code, then prints the browser steps that are left as a fixed numbered list — the agent does exactly those and reports.
//   node motion/youtube/routine.mjs daily      — '다음 편' comment + new comments on every channel (19:12 daily)
//   node motion/youtube/routine.mjs analysis   — the periodic analysis (Mon/Thu): collect → report → reading (motion/films/analytics)
// YT_* come from the user's environment variables (the cron prompt loads them first).
import { spawnSync } from 'node:child_process';
const run = (args, env = {}) => { const r = spawnSync(process.execPath, args, { encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 1 << 26 }); return (r.stdout || '') + (r.stderr || ''); };
const which = process.argv[2];
for (const k of ['YT_CLIENT_ID', 'YT_CLIENT_SECRET', 'YT_REFRESH_TOKEN', 'YT_REFRESH_TOKEN_GLOBAL']) if (!process.env[k]) { console.error(`${k} 없음 — [Environment]::GetEnvironmentVariable('${k}','User')로 불러온 뒤 다시`); process.exit(1); }

if (which === 'daily') {
  const nx = run(['motion/youtube/ko-next-comment.mjs', 'today']), sunday = /오늘 공개 없음/.test(nx), done = (nx.match(/already commented \((\S+)\)/) || [])[1];
  const pin = (nx.match(/pin it: (\S+)/) || [])[1] || (done ? '오늘 쇼츠 watch 링크(uploaded.json shorts.ko.ids)' : null), cid = (nx.match(/posted (\S+)/) || [])[1] || done;
  const ko = run(['motion/youtube/yt-api.mjs', 'comments']), gl = run(['motion/youtube/yt-api.mjs', 'comments'], { YT_AS: 'GLOBAL' });
  console.log('=== 코드로 한 것 ===\n' + nx.trim() + '\n\n--- 한국어 유튜브 새 댓글 ---\n' + ko.trim() + '\n\n--- 국제 유튜브 새 댓글 ---\n' + gl.trim());
  console.log(`\n=== 브라우저에서 할 것 (이것만, 이 순서로) ===
1. youtube.com/channel_switcher 에서 '한눈에 보는 성경 이야기 @one-scroll-bible'을 실제 클릭.
2. ${sunday ? '(주일 — 고정할 댓글 없음, 건너뜀)' : pin ? `${pin} 열기 → 한국어 채널 댓글(${cid})의 ⋮ → 고정 → 확인 대화상자 '고정'(find ref로 클릭) → 고정 배지 확인.` : '고정 댓글이 아직 없다(공개 전) — 몇 분 뒤 이 명령을 다시.'}
3. 위 새 댓글마다 motion/README.md "댓글 관리" 기준: 좋아요·하트는 직접 누른다(하트 = 채널 동의 — 무관한 교리·종말 시나리오에는 하트 없음). @jungrok5 댓글은 뺀다. 국제 채널 댓글은 channel_switcher에서 Bible in One Scroll로 바꿨다가 끝나면 한국어 채널로 되돌린다.
4. instagram.com/one.scroll.bible 최근 릴스의 새 댓글, threads.com/activity/replies 의 새 답글 — 같은 기준.
5. 답글은 달지 않고 초안도 만들지 않는다. 숨기기·삭제는 하지 않고, 반복 도배·링크/포교·욕설·스팸만 알린다.
6. 한국어로 짧게 보고: 고정 여부 · 플랫폼별 좋아요·하트 누른 것 / 안 누른 것(이유) / 숨기기·삭제 제안. 21편(11/16)까지 끝나면 '다음 편'은 끝났다고 알리고 댓글 관리를 계속할지 묻는다.
다른 게시·삭제·수정은 하지 말 것.`);
} else if (which === 'analysis') {
  console.log(run(['motion/films/analytics/collect.mjs', 'api']).trim());
  console.log(run(['motion/films/analytics/collect.mjs', 'plan']).trim());
  console.log(`
=== 그다음 (이 순서로) ===
A. 위 페이지를 하나씩 열어 \`node motion/films/analytics/collect.mjs script <추출기>\` 코드를 javascript_tool로 실행하고, 돌려받은 JSON을 그 파일에 저장.
B. node motion/films/analytics/collect.mjs check  → 빠진 것이 없을 때까지.
C. node motion/films/analytics/collect.mjs report → report.md의 표를 motion/films/ANALYTICS.md에 날짜 절로 붙인다.
D. "읽은 것": ANALYTICS.md "요소 분석" 8항목(이탈 구간↔장면, 화풍, 첫 1초, 썸네일·제목·첫 줄, 소리, 형식, 플랫폼 차이, 댓글)으로 읽고,
   여러 영상이 같은 방향이면 motion/films/pipeline/targets.json의 해당 숫자를 바꾸자고 제안한다(출처·날짜와 함께 — 바꾸는 것은 관리자 OK 뒤).
E. 다음 추천 제작 주제 2~3개(README 10절 근거 형식), README 10절 후보 목록 갱신.
F. 커밋·푸시(작업 브랜치). 한국어로 짧게 보고: 바뀐 숫자 핵심, 그림·소리·형식에서 읽은 것과 다음 영상에 바꿀 것, targets 변경 제안, 추천 주제, 사용자가 정할 것.
공개·삭제·영상 수정·게시는 하지 않는다. 다른 게시·삭제·수정은 하지 말 것.`);
} else { console.log('usage: node motion/youtube/routine.mjs daily | analysis'); process.exit(1); }
