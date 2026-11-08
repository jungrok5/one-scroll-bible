# 10. 국제판 — 영어 글자판 + 해설 트랙 — {film}
README 4절 "순서와 도구" 그대로. 해설 트랙 언어 = `targets.json` intl.voice_langs. 한국어 원고가 확정(review 승인)된 뒤 시작한다.
1. 영어 원고: `motion/films/{film}/i18n/en.json`(줄 id 그대로, 성경은 ESV 원문 — `fetch-verse`) → 역번역·원어민 검수(`motion/reviews/film-{film}-en.md`). 다른 해설 언어도 같은 방식.
2. 영어판 렌더: `node motion/render.mjs v --page films/{film}/film.html --lang en`(가로 h도) → 3초 간격 밀착 시트로 넘치는 글자 확인.
3. 해설: `node motion/films/voice-lines.mjs {film} <lang>` → ElevenLabs(그 언어 원어민 다큐 목소리, 줄당 두 번, 한 플로) → 세션 id를 `{줄: [a, b]}`로 → `fetch-takes.mjs {film} <lang> <sessions.json> <상태 파일…>` → `sound-prompts.mjs logs`(프롬프트 깃에).
4. 맞추기: `node motion/films/fit-voice.mjs {film} <lang>` → `sound/place-<lang>.json`. 섞기: `node motion/films/sound.mjs {film} v --lang <lang>`(h도).
5. 들은 대로 읽었나: 목소리만 받아쓰기(Scribe) → `check-voice.mjs {film} <lang> <결과>` — 다른 단어만 나온다.
6. 제목·설명: `youtube-intl.json`(검수된 문장만) + 새 문장 원어민 검수 `motion/reviews/film-{film}-yt.md`. 썸네일 `py motion/films/{film}/thumbs/make.py --lang <lang>`.
7. 올리기(국제 채널, 비공개): `node motion/films/intl.mjs entry {film} v|h` → 스튜디오 `__osbUpload('en', { entry })` → `YT_AS=GLOBAL node motion/films/intl.mjs api {film} v|h <id>` → 스튜디오 언어 탭에서 오디오 트랙(세로·가로 각각) → 기록 `uploaded.json` `global.films.{film}.h|v` = id·privacy·audio·captions.
확인: `node motion/films/film.mjs check {film} intl`
