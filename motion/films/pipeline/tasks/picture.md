# 4. 그리기 · 렌더 — {film}
읽기: README 7절 전부, canvas-film `SCENE-RULES.md`·`BODY-CHECK.md`(인물이 움직이면)·`LESSONS.md`, review.json `looks`(이 표대로 장면마다 그 화풍).
그리기: 장면 하나 = 화풍 하나의 모듈(`films/{film}/<화풍>-<장면>.js`), 새 화풍 엔진은 `look-*.js`(영상이 끝나면 motion-skills 키트로).
세로(1080×1920) 먼저. 구절마다 화면 사건 하나, 3초 넘게 멈춘 화면 없음, 주인공은 폰에서 1초에 읽힘.
만들기: `node motion/films/film.mjs run {film} picture`(렌더 + 소리 입힌 본).
검사가 보는 것: `pipeline/targets.json` look(밝기·어두운 화면·멈춘 화면), 세로 길이, 렌더가 그림 코드보다 새것인지. 실패하면 출력된 시각(가장 어두운·멈춘 5초)의 장면부터 고친다.
보이기: 720p 미리보기와 6초 밀착 시트를 SendUserFile로. 멈춤: `approve {film} picture "관리자: …"`.