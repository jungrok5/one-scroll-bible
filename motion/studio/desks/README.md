# 데스크 지시서

계획: [../operations-proposal.html](../operations-proposal.html) §4-1~4-3. 관리자가 2026-11-13에 추천안대로 승인했습니다(프로듀서 + 다섯 데스크).

- **데스크는 따로 여는 Claude 세션입니다.** 새 세션 첫 말로 "`<데스크> 데스크`"라고 하거나 아래 지시서를 열면, 그 데스크의 시작 명령부터 칩니다.
  대화가 압축된 뒤에도 같은 방법으로 이어서 일합니다.
- **데스크끼리는 대화가 아니라 저장소 파일로 이어집니다.**
  - 결정함 `motion/studio/decisions.json`
  - 17시 큐 `motion/studio/queue.json`
  - 할당량 장부 `motion/studio/quota.json`
  - 기록부 `motion/youtube/uploaded.json`
  - 영상별 `review.json`
- **어느 세션에서든** `node motion/studio/studio.mjs status`로 전체를 봅니다.
- **멈춤 지점은 어느 데스크나 같습니다.**
  - 공개·삭제·main 배포·되돌릴 수 없는 일은 관리자 확인 뒤에만 합니다.
  - 급하지 않은 질문은 결정함(`decide.mjs add`)에 올립니다. 채팅으로는 묻지 않습니다.
  - 관리자와 가족이 직접 한 말은 바로 고칩니다. 검수 에이전트가 낸 수정안은 확인받고 고칩니다.
- 판단은 데스크가 하고, 에이전트는 보고만 합니다(§4-2).

| 데스크 | 세션 | 시작 명령 | 지시서 |
|---|---|---|---|
| 프로듀서 | 하나 | `node motion/studio/studio.mjs status` | [producer.md](producer.md) |
| 제작 | 영상마다 하나 | `node motion/films/film.mjs status <film>` | [production.md](production.md) |
| 언어 | 하나 | `node motion/youtube/film14.mjs status` | [language.md](language.md) |
| 채널 운영 | 하나 (할당량 주인) | `node motion/studio/studio.mjs queue` | [channel.md](channel.md) |
| 시청자 | 세션 없음, 매일 19:12 | 작업 스케줄러 `\OSB\daily-comments` | [viewers.md](viewers.md) |
| 분석 | 세션 없음, 월·목 + 매일 밤 | `routine.mjs analysis` · `\OSB\health` | [analysis.md](analysis.md) |
