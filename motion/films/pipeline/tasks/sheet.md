# 6. 올릴 글 · 썸네일 — {film}
읽기: 앞 영상의 `upload.md`·`youtube.json`(같은 틀), README 9b(올리기 전 점검표), ANALYTICS.md 최근 "요소 분석"(썸네일·첫 줄).
만들기: `upload.md`(제목·설명·태그·읽기 목록·고정 댓글·썸네일 칸), `youtube.json`(가로·세로 각각 title·description…).
제목·썸네일은 근거로: `node motion/youtube/title-research.mjs "<주제 검색어 3~5개>" --json motion/films/{film}/research/titles.json`(같은 주제 영상의 하루 조회·제목 모양) + ANALYTICS.md의 우리 CTR·A/B 승자 → upload.md에 '근거' 줄. 썸네일 3안은 서로 다른 후킹(반전 진술 · 질문 · 소름 장면).
설명 첫 줄은 단톡방 미리보기에서 한 줄로 읽히게(`targets.json` upload.first_line_max). 썸네일은 `motion/youtube/thumbs/make.py` 틀로 3안(A/B).
읽기 목록은 구절마다 개역개정 링크(대한성서공회 성경플랫폼, 휴대폰에서 바로 열림): `node motion/youtube/bible-links.mjs "말라기 4:5–6 → 갈라디아서 4:4"`.
링크가 눌리는 곳은 가로판 설명·스레드 글뿐 — 쇼츠 설명·댓글과 인스타 캡션은 안 눌리니 구절 이름만 적고 "관련 영상"/프로필 링크로 잇는다.
도구 크레딧 줄(코드로 그림·ElevenLabs)은 어디에도 넣지 않는다(관리자 2026-11-05: 길다) — sheet 검사가 막고, 이미 올린 영상은 `yt-api.mjs strip-credit [--dry]`(YT_AS=GLOBAL이면 국제 채널)로 한꺼번에 뺀다.
한국어 설명에는 사이트 링크 다음 줄에 국제 채널을 넣는다: `▶ 다른 언어로 보기(영어·스페인어 등): https://www.youtube.com/@bibleinonescroll` — 언어 수는 쓰지 않는다(관리자 2026-11-13: 언어를 더할 때마다 고쳐야 하므로) (관리자 2026-11-13 — 같은 영상이 다른 언어로 있음을 알림). '웹에서 장면 보기'(/film/) 줄은 넣지 않는다(사이트 링크와 겹침). 재생목록 이름은 「해설 영상 모아 보기」.

**연결 규칙**(관리자 2026-11-13: "서로 연결되어야지"): 모든 영상은 세 방향으로 잇는다 — ① 같은 영상의 다른 언어(한국어 → 국제 채널, 국제 → 언어별 재생목록·한국어 원본) ② 같은 시리즈의 다른 영상(14분 ↔ 400년 ↔ 새 영상) ③ 사이트. 줄과 링크는 `motion/youtube/xlinks.json`이 원본이고, 새 영상은 ids를 uploaded.json에 넣은 뒤 `xlinks.mjs`에 종류를 하나 더하고 `node motion/youtube/xlinks.mjs audit` → `apply --dry` → `apply`. 국제판 고정 댓글에도 '오늘 읽어 볼 말씀' + 14분 언어별 목록 줄을 둔다(xlinks.mjs comment). 정기 분석이 audit을 돌려 빠진 것을 알린다.
여러 영상·채널 설명·재생목록 이름을 줄 단위로 고칠 때: `yt-api.mjs text-edit <spec.json> --dry`(앞뒤를 out/에 저장) → `--dry` 빼고 실행.
이미 올린 영상의 설명 고치기: `yt-api.mjs film-desc <film> <h|v|clip-a…> <videoId> --dry`(지금 설명을 out/에 저장해 원본과 같은지 먼저 확인) → `--dry` 빼고 실행.