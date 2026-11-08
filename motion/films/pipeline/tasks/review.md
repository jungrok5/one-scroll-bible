# 3. 관점 검수 · 시청자 리뷰 · 초안 페이지 — {film}
리뷰는 저장된 워크플로 **`film-script-review`**(`.claude/workflows/film-script-review.js`, args `{ "film": "{film}" }`) — 리뷰어 넷(관점 검수 · 성경 잘 모르는 크리스천 63세(1번 대상) · 성경 잘 아는 신자 48세 · 비신자 34세)의 지시문과 결과 형식이 코드로 고정돼 있다.
워크플로는 관리자가 허락해야 돈다("리뷰 워크플로 돌려"). 허락이 없거나 Workflow 도구가 꺼져 있으면 `node motion/films/pipeline/wf-prompts.mjs .claude/workflows/film-script-review.js <args.json> <briefs 폴더>`로 같은 지시문을 꺼내 리뷰어마다 하위 에이전트 하나로 돌린다(답은 파일로 저장하게).
1. 결과 JSON을 그대로 `motion/reviews/film-{film}-script.json`에 저장하고, 그 원고의 음절 수를 `syllables`로 적는다(`script-stats.mjs {film} --json`의 syllables).
2. `node motion/films/pipeline/review-md.mjs {film}` → `.md`. 반영할 것이 남으면 종료 코드 2.
3. 매 차수: 반영할 것 · 반영 안 할 것을 정리해 관리자에게 컨펌받는다. 고친 뒤 `script-stats`로 음절을 다시 센다(640 넘으면 줄인다).
   1번 대상 평균·부별 최저가 `targets.json` script.novice_*에 못 미치면 고치고 다시 리뷰. 1번 대상 점수가 두 차수 그대로이고 관점 검수 BLOCKER가 없으면 굳히자고 제안 —
   관리자가 OK하면 관점 검수 MAJOR만 고치고 결과 JSON에 `frozen: { at, by: "관리자: …" }`, `resolved`(`"theology:<줄>": "어떻게"`), `deferred`를 적고 review-md 다시.
4. 초안 페이지: `node motion/films/film.mjs run {film} review` → `motion/out/review/{film}.html`을 아티팩트로(처음은 새로 올리고 주소를 `artifact_url`에, 다음은 그 주소에). 1280·400 px 스크린숏으로 먼저 본다.
5. 관리자·아내 의견은 받는 대로 `film.mjs feedback {film} "<누가>" "<한 말 그대로>"`, 반영하면 `film.mjs applied {film} <n> "<무엇을>"`, 다시 올릴 때 `film.mjs round {film} "<요약>"`.
멈춤: 관리자와 아내가 컨펌하면 `node motion/films/film.mjs approve {film} review "관리자: …"`(승인한 원고가 저장되고, 이후 바뀌는 줄은 차수 기록이 있어야 통과한다).
