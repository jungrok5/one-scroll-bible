# 스튜디오 운영 — 프로듀서 + 데스크

계획과 근거: [operations-proposal.html](operations-proposal.html). 관리자가 2026-11-13에 §6 추천안을 모두 승인했습니다("다 제안대로 하고 그리스도 공개한뒤 하자").
「그리스도」 공개 뒤인 2026-11-16부터 1주차 항목을 시작했습니다.

## 1주차 (2026-11-16 시작)

| 무엇 | 도구 | 메모 |
|---|---|---|
| 결정함 | `node motion/studio/decide.mjs list \| add \| answer \| applied \| page` → `decisions.json`, 페이지 `motion/out/studio/decisions.html`(아티팩트로 게시) | 데스크는 채팅으로 묻지 않고 여기에 올립니다(추천·선택지·근거·막는 일). 관리자는 주 1~2회 몰아서 답합니다. 급한 것(공개, 되돌릴 수 없는 일)만 바로 묻습니다. 답은 말 그대로 적고 rules.json·일정·review.json으로 옮깁니다. |
| 스튜디오 현황 | `node motion/studio/studio.mjs status` | 영상별 남은 단계와 다음 할 일, 결정함, 14일 예약(주일 검사), 14분 언어 데스크, 예약 작업, 할당량을 한 화면에 보여 줍니다. 읽기만 합니다. |
| 예약 작업(작업 스케줄러) | `jobs/register.ps1` → `\OSB\daily-comments`(매일 19:12) = `jobs/daily-comments.ps1` + `jobs/daily-comments.prompt.txt` | Claude를 화면 없이 실행합니다(`claude -p --chrome`, 허용 도구만). 크롬은 deviceId로 고릅니다. 기록은 `logs/<날짜>-daily.log`(git 제외). 시범 1주 동안 세션 예약으로 댓글 관리를 만들지 않습니다(ROUTINES.md). |

## 2주차 앞당겨 한 것 (2026-11-16, 관리자 "할 수 있는 거 진행해")

| 무엇 | 도구 | 메모 |
|---|---|---|
| 토큰 한 곳 | `motion/youtube/yt-token.mjs` `accessToken('ko'|'gl'|NAME)` | 유튜브 API를 쓰는 도구 10개가 모두 여기서 토큰을 받습니다. 채널 전용 클라이언트(`YT_CLIENT_ID_<NAME>`)가 있으면 그것을, 없으면 공용 클라이언트를 씁니다. D2(국제 채널 전용 프로젝트)는 `yt-auth.mjs <json> --as GLOBAL --own-client` 한 번이면 끝납니다. |
| 할당량 장부 | 같은 파일이 YouTube Data API 호출을 세서 `motion/studio/quota.json`(git 제외)에 적음 | 쿼터일(태평양 자정 = 한국 17시)과 내는 프로젝트별로 셉니다. 단가는 Google 비용표(2026-11-16 확인)를 씁니다. 브라우저 스튜디오와 Analytics API는 세지 않습니다. `studio.mjs status`의 할당량 칸에서 봅니다. |

## 2~3주차 (2026-11-16)

| 무엇 | 도구 | 메모 |
|---|---|---|
| 데스크 지시서 | [desks/](desks/README.md): 프로듀서·제작·언어·채널 운영·시청자·분석 | 새 세션은 "<데스크> 데스크"로 시작해 지시서의 시작 명령부터 칩니다. 데스크끼리는 저장소 파일로 이어집니다. |
| 밤 점검 | `studio.mjs health [--full]` = health.mjs → `\OSB\health` 매일 23:40(월요일은 전체) | 연결 줄, 국제 재생목록, 사이트 버튼, 기록 모양·주일 규칙, 뒤따를 일을 봅니다. 월요일에는 14분 자막 트랙도 봅니다(≈1,100단위). 결과는 status의 '밤 점검' 칸과 `logs/<날짜>-health.log`에 남습니다. |
| 17시 큐 | `studio.mjs queue [add|run|drop]` = queue.mjs, 기록 `queue.json` → `\OSB\queue` 매일 17:10 | 할당량이 모자란 API 일을 다음 쿼터일로 미룹니다. `node motion/…` 명령만 받습니다. 영상을 바꾸는 일은 관리자 OK를 받은 것만 넣습니다. |

결정함 페이지(아티팩트): https://claude.ai/artifact/FQxUXYUc2t2XBYVdhQW3w5. 프로듀서가 `decide.mjs page`로 만든 뒤 같은 파일을 다시 게시합니다.

## 다음 (계획 §5)
- 편성표
- 영상별 7일·28일 사후 분석
- 국제 채널 API 프로젝트 분리(결정함 D2, 관리자가 만듦)
