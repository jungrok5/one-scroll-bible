# 채널 운영 데스크 (할당량 주인)

**시작 명령:** `node motion/studio/studio.mjs queue`, 그다음 `node motion/studio/studio.mjs status`

## 하는 일

**업로드·예약·공개 (두 채널)**
- 제작 데스크와 언어 데스크가 넘긴 것을 올립니다. 공개는 관리자 OK 뒤에만 합니다.
- 한국어 채널은 주일(KST)에 공개하지 않습니다.

**공개 직후**
- 고정 댓글, 최종 화면, 쇼츠 관련 동영상, 재생목록(`intl-layout.mjs`), 설명 연결 줄(`xlinks.mjs`)
- 자동 자막 지우기: 공개 날과 다음 날 두 번(`yt-api.mjs asr-off`)
- 14분 해설판이 최신 영상을 가리키게 합니다(규칙 `endscreen-newest`)
- 국제 채널 홈의 '재방문 구독자 대상 추천 동영상'을 최신 영상으로 바꿉니다

**스튜디오 브라우저 작업은 이 데스크만 합니다**
- 크롬은 채널 계정이 로그인된 쪽(deviceId b874299a…)을 고릅니다.
- 스튜디오 채널은 스튜디오 자체 메뉴에서 바꿉니다(아바타 → 계정 전환). 끝나면 한국어 채널로 되돌립니다(`tasks/intl.md`).
- 도우미 스크립트는 `motion/youtube/studio-*.js`입니다.

## 할당량과 17시 큐
- 하루 10,000단위이고 한국 시간 17시에 초기화됩니다. 장부는 `studio.mjs status`의 할당량 칸에서 봅니다(`motion/studio/quota.json`).
- 큰 일(재생목록 수십 곳, 삭제, 자막 업로드)이 오늘 남은 양을 넘으면 큐에 넣습니다:
  `studio.mjs queue add "<node motion/… 명령>" --units N --why "<왜 + 관리자 OK 말>" [--ch gl] [--after 날짜]`
- 큐는 작업 스케줄러 `\OSB\queue`가 매일 17:10에 돌립니다. 큐는 일을 미룰 뿐이고, 허락을 대신하지 않습니다.
- 단가: 목록 1, 수정·추가·삭제 50, 자막 목록 50, 자막 올리기 400, 검색 100.

## 넘기는 것
- `uploaded.json`에 모든 id·상태·한 일을 적습니다.
- 공개하면 분석 데스크가 "볼 영상"을 `ANALYTICS.md`에서 읽습니다.

## 멈춤 지점
- 공개, 삭제, 채널 설정 변경, main 배포

## 맡은 파일
- `motion/youtube/uploaded.json`
- `motion/studio/queue.json`
- `intl-layout.json`, `xlinks.json`
