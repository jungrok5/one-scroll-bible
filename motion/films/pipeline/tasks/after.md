# 9. 공개 직후 — {film}
고정 댓글(가로·세로, 한국어 채널 신원) → uploaded.json `h.pinned_comment`·`v.pinned_comment`. 가로판 최종 화면(14분 해설판 + 구독, 마지막 5초), 쇼츠 관련 동영상,
재생목록, 자동 자막 지우기(`yt-api.mjs asr-off <가로> <세로> <짧은 쇼츠…>` — 우리 자막이 있는 영상의 자동 자막은 **언어와 상관없이 모두**(잘못 알아들은 다른 언어 자동 자막 포함, 관리자 2026-11-16), 유튜브가 공개 뒤에 다시 만들기도 해서 **공개 다음 날 한 번 더** → uploaded.json `{film}.asr_off = { ids, at, again }`). **공개 후 48시간 안에 14분 해설판(wrEYqvOU1O8)의 최종 화면 카드·고정 댓글·설명 첫 링크를 이 영상(가장 최근 시리즈 영상)으로 바꾼다 — 묻지 않는다**(관리자 상시 OK 2026-11-13, 규칙 `endscreen-newest`). 국제판도 같은 방식으로 영어 14분(MFH3Hj4V6KA)의 최종 화면을 가장 최근 국제판으로. 각 일을 uploaded.json 노트에 남긴다.
주간 분석에서 `node motion/youtube/yt-api.mjs ypp`(국제 채널 `YT_AS=GLOBAL`) — 구독자, 365일 일반 동영상 시청 시간(쇼츠는 안 셈), 90일 쇼츠 조회수(rules long-form-watch-hours).
