# 3. 관점 검수 · 시청자 리뷰 · 초안 페이지 — {film}
리뷰어 넷을 배경 에이전트로 돌린다(보고만 한다): ① 관점 검수(복음주의·개혁주의 구속사, 개역개정) ② 성경 잘 모르는 크리스천 63세(1번 대상)
③ 성경 잘 아는 신자 ④ 비신자. 각자 부마다 감동 0–5 · 전율 0–5 · 넘기고 싶은 순간을 낸다. 지시문은 README 8절 2·3과 같다.
반영: 관점 검수 지적은 반영, 1번 대상 점수가 낮은 부는 고친 뒤 다시 리뷰. 기록: `motion/reviews/film-{film}-script.md`(제목에 '관점 검수', '성경 잘 모르는').
초안 페이지: `node motion/films/film.mjs run {film} review` → `motion/out/review/{film}.html`을 아티팩트로(처음은 새로, 주소를 review.json `artifact_url`에).
멈춤: 관리자·아내 컨펌 → `node motion/films/film.mjs approve {film} review "관리자: …"`.