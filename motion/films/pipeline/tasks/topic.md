# 1. 주제 — {film}
후보·근거·추천은 `pipeline/topics.json` 한 곳(세션에서 새로 지어내지 않는다).
1. `node motion/films/topic.mjs evidence` — 쇼츠·영상별 평균 시청·조회와 화풍, ANALYTICS.md의 마지막 추천을 본다.
2. 근거를 붙인다: `node motion/films/topic.mjs cite <id> "<숫자가 든 사실>" --source <analytics 파일>`. 새 후보는 `topic.mjs add <id> "<제목>" --refs … --connection "<하나님의 연결>"`.
3. 추천 2~3개: `node motion/films/topic.mjs recommend <id> <id> [<id>]`(근거 2개 미만이면 거절) → 나온 글을 관리자에게. 정기 분석이면 ANALYTICS.md에도 그대로.
4. 관리자가 고르면: 폴더가 없으면 `node motion/films/film.mjs new {film} --topic <id>`, 있으면 `topic.mjs pick <id> {film}` → `review.json` `logline`(영상 전체를 한 문장으로).
멈춤: 관리자가 고른 말 그대로 `node motion/films/film.mjs approve {film} topic "관리자: …"`.
확인: `node motion/films/film.mjs check {film} topic`
