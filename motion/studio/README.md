# 스튜디오 운영 — 프로듀서 + 데스크

계획과 근거: [operations-proposal.html](operations-proposal.html). 관리자가 2026-11-13에 §6 추천안을 모두 승인했습니다("다 제안대로 하고 그리스도 공개한뒤 하자").
「그리스도」 공개 뒤인 2026-11-16부터 1주차 항목을 시작했습니다.

## 1주차 (2026-11-16 시작)

| 무엇 | 도구 | 메모 |
|---|---|---|
| 결정함 | `node motion/studio/decide.mjs list \| add \| answer \| applied \| page` → `decisions.json`, 페이지 `motion/out/studio/decisions.html`(아티팩트로 게시) | 데스크는 채팅으로 묻지 않고 여기에 올립니다(추천·선택지·근거·막는 일). 관리자는 주 1~2회 몰아서 답합니다. 급한 것(공개, 되돌릴 수 없는 일)만 바로 묻습니다. 답은 말 그대로 적고 rules.json·일정·review.json으로 옮깁니다. |
| 스튜디오 현황 | `node motion/studio/studio.mjs status` | 영상별 남은 단계와 다음 할 일, 결정함, 14일 예약(주일 검사), 14분 언어 데스크, 예약 작업, 할당량을 한 화면에 보여 줍니다. 읽기만 합니다. |
| 예약 작업(작업 스케줄러) | `jobs/register.ps1` → `\OSB\daily-comments`(매일 19:12) = `jobs/daily-comments.ps1` + `jobs/daily-comments.prompt.txt` | Claude를 화면 없이 실행합니다(`claude -p --chrome`, 허용 도구만). 크롬은 deviceId로 고릅니다. 기록은 `logs/<날짜>-daily.log`(git 제외). 시범 1주 동안 세션 예약으로 댓글 관리를 만들지 않습니다(ROUTINES.md). |

## 다음 (2~3주차 이후, 계획 §5)
- 데스크 지시서 5개(`desks/*.md`)와 세션 분리
- 할당량 장부(`quota.json`)와 17시 큐
- 매일 밤 점검 `studio.mjs health`
- 편성표
- 영상별 7일·28일 사후 분석
- 국제 채널 API 프로젝트 분리(결정함 D2, 관리자가 만듦)
