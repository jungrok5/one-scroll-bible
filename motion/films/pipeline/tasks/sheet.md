# 6. 올릴 글 · 썸네일 — {film}
읽기: 앞 영상의 `upload.md`·`youtube.json`(같은 틀), README 9b(올리기 전 점검표), ANALYTICS.md 최근 "요소 분석"(썸네일·첫 줄).
만들기: `upload.md`(제목·설명·태그·읽기 목록·고정 댓글·썸네일 칸), `youtube.json`(가로·세로 각각 title·description…).
설명 첫 줄은 단톡방 미리보기에서 한 줄로 읽히게(`targets.json` upload.first_line_max). 썸네일은 `motion/youtube/thumbs/make.py` 틀로 3안(A/B).
읽기 목록은 구절마다 개역개정 링크(대한성서공회 성경플랫폼, 휴대폰에서 바로 열림): `node motion/youtube/bible-links.mjs "말라기 4:5–6 → 갈라디아서 4:4"`.
링크가 눌리는 곳은 가로판 설명·스레드 글뿐 — 쇼츠 설명·댓글과 인스타 캡션은 안 눌리니 구절 이름만 적고 "관련 영상"/프로필 링크로 잇는다.
도구 크레딧 줄(코드로 그림·ElevenLabs)은 어디에도 넣지 않는다(관리자 2026-11-05: 길다) — sheet 검사가 막고, 이미 올린 영상은 `yt-api.mjs strip-credit [--dry]`(YT_AS=GLOBAL이면 국제 채널)로 한꺼번에 뺀다.
이미 올린 영상의 설명 고치기: `yt-api.mjs film-desc <film> <h|v|clip-a…> <videoId> --dry`(지금 설명을 out/에 저장해 원본과 같은지 먼저 확인) → `--dry` 빼고 실행.