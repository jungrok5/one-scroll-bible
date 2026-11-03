# 7. 한국어 채널 올리기 · 예약 — {film}
순서: 스튜디오 업로드(`motion/youtube/studio-upload.js`, youtube.json) → `yt-api film-schedule` → 자막 `caption-file`(sound/ko.vtt) → 9b 점검표.
공개 시각은 관리자 OK가 있어야 한다. 주일(KST) 공개 금지. 기록: `motion/youtube/uploaded.json` `{film}.h|v` = id·file·publish_at.
멈춤: `approve {film} publish "관리자: …"`.