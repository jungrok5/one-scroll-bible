# 2. 원고 · 장면표 · 장면마다 화풍 · 메시지 점검 — {film}
본보기: 「침묵의 400년」(`motion/films/silence400/script.json`, 640음절·2:59) — `node motion/films/script-stats.mjs silence400`와 나란히 놓고 쓴다.
참고로 읽기: canvas-film `references/MESSAGE.md`(12문항)·`STYLE-INDEX.md`, 바로 앞 영상의 `review.json`(쓴 화풍은 꼭 맞을 때만 다시).

순서 (이 순서를 바꾸지 않는다):
1. **뼈대** — `review.json` `story_spine` 여섯 칸(question · stakes · person · reversal · payoff · surprise)을 먼저 문장으로. 아직 줄 id는 비워 둔다.
2. **끝** — `review.json` `ending`: 영상의 질문이 풀린 뒤 열 두 번째 질문(`question` = 그 줄 id), 그 답이 있는 본문 하나(`passage`, 예 "마태복음 2장"), 그 본문에서 무엇이 풀리는지(`answer`).
3. **틀** — 부 5~7개, 한 부 20~45초. 0~1초 첫 해설, 10초 안에 물음표 해설, 마지막 25초 안에 열린 질문, 끝 화면 5초 이상(읽을 곳 하나). 인용 비중은 음절의 30~35%(400년 31%, 메시아 34%).
4. **줄** — `script.json` 줄마다 `id`·`part`·`at`·`kind`(narr|quote|label|title)·`text`·**`screen`**(그 줄 동안 화면에 보이는 것 한 문장 = 장면표). 인용은 `usfm`·`cite`·`hl`, 문장은 `node motion/narration/krv.mjs <usfm>`로 가져온다(손으로 치지 않는다). 화면 전용 줄은 `voice: null`.
5. 뼈대·끝 칸에 줄 id를 채운다.
6. **세기** — `node motion/films/script-stats.mjs {film}`: 음절(≤ 640), 부별 길이, 질문 위치, 끝 화면.
7. **화풍** — `review.json` `parts[]`(name·feel·key·story·samples), `looks[]` = 장면마다 `{at, scene, look, source, style_new?, kit?, same_reason?}`.
8. **메시지 점검** — `message_check` 12문항.
확인: `node motion/films/film.mjs check {film} script` → 모두 ✓일 때까지(원문 대조·뼈대·장면표·화풍·음절·끝).
