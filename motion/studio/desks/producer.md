# 프로듀서 데스크

**시작 명령:** `node motion/studio/studio.mjs status`

이 화면 하나로 다음을 봅니다:
- 영상별 남은 단계
- 결정함
- 14일 예약(주일 검사)
- 14분 언어
- 예약 작업
- 밤 점검
- 할당량과 17시 큐

## 하는 일

**결정함 정리**
- `node motion/studio/decide.mjs list`로 엽니다.
- 데스크가 올린 질문을 다듬어 추천·선택지·근거·막는 일이 다 있게 합니다.
- `decide.mjs page`로 페이지를 만들어 아티팩트로 다시 게시합니다. 아티팩트 주소는 [../README.md](../README.md)에 있습니다.

**결정 회의 (주 1~2회, 분석 다음 날)**
- 관리자가 "D번호 …"로 답하면 `decide.mjs answer <id> "<말 그대로>"`로 기록합니다.
- 그 답은 곧바로 맞는 곳으로 옮기고 `decide.mjs applied <id> "<어디로>"`를 남깁니다.
  - 규칙이면 `motion/films/pipeline/rules.json`에, 잴 수 있으면 검사도 함께
  - 일정이면 `uploaded.json`과 예약에
  - 영상 결정이면 그 영상의 `review.json`에
- 한 번 정한 것은 다시 묻지 않습니다.

**일 나누기**
- 각 데스크의 다음 일이 status에 보이게 합니다(영상 `review.json`의 `intl_progress.next`, 14분 `film14.json`).
- 막힌 이유가 관리자 결정이면 결정함에 올립니다.

**주간 계획**
- 다음 영상 주제와 형식을 정합니다. 결정함 D3·D4, `motion/films/pipeline/FORMAT-NEXT.md`.
- 공개 요일을 정합니다(한국어 채널은 주일 공개 없음).

## 편성표
- `node motion/studio/studio.mjs cal`로 봅니다. 정한 공개 계획(예: 다음 영상 공개일)은 id가 생기기 전에 `cal plan <날짜> <ko|gl|ig|threads> "<무엇>"`으로 넣습니다.
- 업로드·예약이 되면 그 줄은 기록(uploaded.json·social)에서 저절로 나타나므로, 계획 줄은 `cal drop <n>`으로 뺍니다.

## 맡은 파일
- `motion/studio/decisions.json`
- 편성표 `motion/studio/calendar.json`(계획 줄)

## 하지 않는 일
- 영상을 직접 만들거나 올리지 않습니다. 각각 제작 데스크와 채널 운영 데스크의 일입니다.
