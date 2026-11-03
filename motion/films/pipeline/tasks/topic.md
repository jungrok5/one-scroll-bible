# 1. 주제 — {film}
읽기: `motion/films/ANALYTICS.md`의 가장 최근 "다음 추천 제작 주제", README 10절(이야기의 결 = 하나님의 연결).
만들기: `motion/films/{film}/review.json`에 `logline`(영상 전체를 한 문장으로), `topic_evidence`(근거 숫자 2~3개).
멈춤: 관리자가 고른다. 관리자가 고른 말을 그대로 `node motion/films/film.mjs approve {film} topic "관리자: …"`.
확인: `node motion/films/film.mjs check {film} topic`