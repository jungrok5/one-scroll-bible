# 2. 원고 · 장면마다 화풍 · 메시지 점검 — {film}
읽기: README 1~3절(대상·형식·원고와 글자), 7절(영화처럼 · 장면마다 다른 화풍 · 영상마다 새 화풍 하나 이상(많아도 좋다) · 세로 먼저), 9절(배운 것),
canvas-film `references/MESSAGE.md`(12문항), `STYLE-INDEX.md` 전체, 바로 앞 영상의 `review.json`(쓴 화풍은 꼭 맞을 때만 다시).
**먼저 이야기 뼈대**(README 3절 첫 항목): 구절을 늘어놓지 않는다. `review.json` `story_spine` — question(풀 문제를 먼저) · stakes(빗나갈 것 같은 순간) · person(사람의 자리) · reversal(뒤집힘) · payoff(처음 질문의 답을 끝에서) — 를 채우고, 그 뼈대에 구절을 얹는다.
만들기 (검사가 이 형식을 읽는다):
- `script.json` — 줄마다 `id`·`part`·`at`·`kind`(narr|quote|label|title)·`text`. 인용은 `usfm`·`cite`·`hl`. 인용문은 `node motion/narration/krv.mjs <usfm>`로 가져온다(손으로 치지 않는다).
- `review.json` `parts[]`(name·feel·key·story), `message_check`(12문항 모두), `looks[]` = 장면마다 `{at, scene, look, source, style_new?, same_reason?}`.
  새 화풍(`style_new: true`, 만들 키트 이름 `kit`)은 `pipeline/targets.json` looks.new_min개 이상(상한 없음), 화풍 종류는 distinct_min개 이상, 이웃 장면이 같은 화풍이면 `same_reason`.
금지: 성경 구절을 바꾸거나 이어 붙여 새 문장 만들기, 한 영상을 한 화풍으로 고정하기.
확인: `node motion/films/film.mjs check {film} script` → 모두 ✓일 때까지.