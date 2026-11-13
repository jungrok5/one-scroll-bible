# 12. 국제판 공개 — {film}
관리자 OK가 있어야 한다(국제 채널은 주일 제한 없음). `YT_AS=GLOBAL node motion/youtube/yt-api.mjs privacy <id> public`(가로·세로) → 쇼츠 관련 동영상(스튜디오 `motion/youtube/studio-related.js` `__osbRelated`) → 가로판 최종 화면(스튜디오, 마지막 5초: 영어 14분 영상 + 구독) → 기록 `uploaded.json` `global.films.{film}.related_video`·`published`(최종 화면 포함; `h.captions`·`h.audio`가 있어야 다음 단계가 언어를 안다)
→ **채널 정리**: `node motion/youtube/intl-layout.mjs plan` → `apply`. 이 영상이 자막·음성이 있는 모든 언어 재생목록(14분 다음, 이야기 순서 — `intl-layout.json` `series_order`에 이름을 넣는다)과 시리즈 재생목록에 들어간다. 스튜디오 → 맞춤설정 → 레이아웃의 '구독자용 추천 영상'을 이 영상으로 바꾼다(API 없음)
→ **연결**: `xlinks.mjs`에 이 영상 종류를 더하고 `audit` → `apply`(14분·한국어판과 서로 잇기, 언어 수 쓰지 않음).
멈춤: `node motion/films/film.mjs approve {film} intlpub "관리자: …"`.
