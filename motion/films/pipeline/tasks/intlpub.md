# 12. 국제판 공개 — {film}
관리자 OK가 있어야 한다(국제 채널은 주일 제한 없음). `YT_AS=GLOBAL node motion/youtube/yt-api.mjs privacy <id> public`(가로·세로) → 쇼츠 관련 동영상(스튜디오 `motion/youtube/studio-related.js` `__osbRelated`) → 가로판 최종 화면(스튜디오, 마지막 5초: 영어 14분 영상 + 구독) → 기록 `uploaded.json` `global.films.{film}.related_video`·`published`(최종 화면 포함).
멈춤: `node motion/films/film.mjs approve {film} intlpub "관리자: …"`.
