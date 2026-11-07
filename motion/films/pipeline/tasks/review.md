# 3. 관점 검수 · 시청자 리뷰 · 초안 페이지 — {film}
리뷰는 저장된 워크플로 **`film-script-review`**(`.claude/workflows/film-script-review.js`, args `{ "film": "{film}" }`)로 돌린다.
리뷰어 넷의 지시문과 결과 형식이 코드로 고정돼 있다:
- 관점 검수
- 성경 잘 모르는 크리스천 63세(1번 대상)
- 성경 잘 아는 신자 48세
- 비신자 34세

워크플로는 관리자가 실행을 허락해야 돈다("리뷰 워크플로 돌려"). 허락이 없으면 그렇게 말하고 기다린다.
1. 결과 JSON을 그대로 `motion/reviews/film-{film}-script.json`에 저장한다.
2. `node motion/films/pipeline/review-md.mjs {film}`로 `motion/reviews/film-{film}-script.md`를 만든다. 반영할 것이 남으면 종료 코드가 2다.
3. 관점 검수 지적은 반영한다. 1번 대상 점수가 낮은 부는 고친 뒤 워크플로를 다시 돌린다. "반영해야 할 것"이 비어야 다음으로 간다.
   매 차수 반영 계획(반영할 것 · 반영 안 할 것)을 관리자에게 보이고 컨펌받는다. 리뷰어는 읽을 때마다 새로 찾으므로 끝이 없다 —
   1번 대상 점수가 두 차수 그대로이고 관점 검수 BLOCKER가 없으면 굳히자고 제안한다(「메시아」는 네 차례 뒤 관리자 "리뷰 끝도없네").
   굳힐 때는 관점 검수 MAJOR만 고치고, 결과 JSON에 `resolved`(`"theology:<줄>": "어떻게 고쳤나"`)와 `deferred`(읽고 일부러 남긴 것)를 적은 뒤 review-md를 다시 돌린다.
4. 초안 페이지: `node motion/films/film.mjs run {film} review`를 돌리고, `motion/out/review/{film}.html`을 아티팩트로 올린다. 처음에는 새로 올리고 주소를 review.json `artifact_url`에 적는다.

멈춤: 관리자와 아내가 컨펌하면 `node motion/films/film.mjs approve {film} review "관리자: …"`.
