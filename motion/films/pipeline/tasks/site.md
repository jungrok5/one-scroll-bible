# 13. 사이트 /film — {film}
README 6절. `review.json` `site_slug`(예 "messiah") → `py motion/films/publish.py {film} <slug>`(film.html·스크립트·script.json·글꼴 부분집합·film.m4a → `film/<slug>/f/`) → `film/<slug>/index.html`(silence를 본떠 FILM 설정·챕터·읽을 말씀) → 포스터 → `film/films.json` 맨 앞에 한 줄. sitemap·llms.txt는 films.json에서 자동.
main 배포는 관리자 허락 뒤. 확인: `node motion/films/film.mjs check {film} site`

**마지막 — 대화 피드백 정리**(관리자 2026-11-11 "공정에 마지막엔 대화에만 남은 피드백 같은 거 확인해서 공정에 반영하는 스텝을 넣어놔"): `film.mjs`의 feedback_log와 이 영상을 만든 대화 기록(세션 .jsonl)을 처음부터 훑어, 앞으로의 모든 영상에 적용할 말을 `pipeline/rules.json`(측정 가능하면 `stages.mjs` 검사도)·`tasks/*.md`·README로 옮긴다. 옮긴 것과 이 영상만의 것을 `review.json` `feedback_sweep = { at, items: [{ said, to, status: 'moved'|'film-only' }] }`에 적는다 — 검사 `sweep`.
