# 10. 국제판 — 영어 글자판 + 해설 트랙 — {film}
README 4절 "순서와 도구" 그대로. 해설 트랙 언어 = `targets.json` intl.voice_langs, 목소리 = intl.voices(언어마다 고정 — 찾지 말고 여기서). 한국어 원고가
확정(review 승인)된 뒤 시작한다. **자막 번역(11단계)과 동시에 돌린다** — 관리자 2026-11-15 "병렬로 할 수 있는 번역은 그렇게". 진행 상태는 review.json
`intl_progress`에 적는다(끝난 것 · 돌고 있는 것 · 관리자 확인 대기 · 다음) — 대화에만 두지 않는다(관리자 2026-11-15 "대화에만 남아있지 않게").
1. 영어 원고: 본 세션이 `motion/films/{film}/i18n/en.json`을 직접 쓴다(줄 id 그대로, `_yv` 59 / `_version` ESV, 인용은 `fetch-verse.mjs 59 <USFM…>` 원문,
   `voice`·`hl`은 한국어 줄에 있을 때). `check-quotes.mjs {film} en` 모두 ok → 영어 검수 에이전트 `pipeline/briefs/review-en.md` → `motion/reviews/film-{film}-en.md`.
   HIGH/MED는 반영할 것·안 할 것을 정리해 관리자 확인 뒤 고친다(confirm-agent-fixes). 고친 뜻은 돌고 있는 번역 에이전트에 SendMessage로 알린다.
2. 영어판 렌더: `node motion/render.mjs v|h --page films/{film}/film.html --lang en`(세로·가로 각 약 5분) → `py motion/films/frame-sheets.py {film}-en --video
   motion/out/film-en-v.mp4 --every 1`(가로 `{film}-en --ori h --video motion/out/film-en-h.mp4`) → 글자 배치 에이전트 `pipeline/briefs/en-layout.md` →
   review.json `en_layout_check`. 줄 나눔(`/`)만 고치는 것은 낱말이 그대로라 재검수 없이(관리자에게 한 줄).
3. 해설: `node motion/films/voice-lines.mjs {film} <lang>` → `sound/voice-lines-<lang>.json`(줄 id → 읽을 글). `creative_create_flow` 하나 →
   줄마다 `creative_generate_speech`(model intl.voice_model, voice intl.voices[lang], 테이크 2개 기본) — 돌려받은 session_ids를 바로
   `sound/sessions-<lang>.json` `{ 줄: [a, b] }`에 적는다(컨텍스트가 넘어가도 남게) → `creative_get_flow_run_status`(한 번에 세션 20개까지)로 모두
   completed 확인 → `node motion/films/fetch-takes.mjs {film} <lang> sound/sessions-<lang>.json <세션 기록 .jsonl>` — **대화 기록 파일을 그대로 넘긴다**
   (C:\Users\<user>\.claude\projects\c--Project-one-scroll-bible\<session>.jsonl, 512 MB가 넘어도 스트리밍으로 읽음 — 서명 URL을 손으로 옮기지 않는다)
   → 프롬프트 깃에: `sound-prompts.mjs logs sound/prompts.json <flow_id> <같은 .jsonl>` → `sessions-<lang>-names.json`(`{"<lang> <줄>": [세션…]}`)으로
   `names` → `md`.
4. 맞추기: `node motion/films/fit-voice.mjs {film} <lang>` → `sound/place-<lang>.json`. 섞기: `node motion/films/sound.mjs {film} v --lang <lang>`(h도).
   영어는 `{film}-en-v|h-narr.mp4`, 다른 언어는 오디오 트랙 `{film}-<lang>-narr.mp3` + `sound/<lang>.vtt`.
5. 들은 대로 읽었나: 목소리만 받아쓰기(Scribe) → `check-voice.mjs {film} <lang> <결과>` — 다른 단어만 나온다.
6. 제목·설명: `youtube-intl.json`(검수된 문장만) + 새 문장 원어민 검수 `motion/reviews/film-{film}-yt.md`. 썸네일 `py motion/films/{film}/thumbs/make.py --lang <lang>`.
7. 올리기(국제 채널, 비공개): `node motion/films/intl.mjs entry {film} v|h` → 스튜디오 `__osbUpload('en', { entry })` → `YT_AS=GLOBAL node motion/films/intl.mjs api {film} v|h <id>` → 스튜디오 언어 탭에서 오디오 트랙(세로·가로 각각) → 기록 `uploaded.json` `global.films.{film}.h|v` = id·privacy·audio·captions.
es·pt-BR 해설은 그 언어 원어민 검수(11단계 es-pt-fr-it-de 묶음)의 HIGH/MED가 정리된 뒤 3단계부터.
확인: `node motion/films/film.mjs check {film} intl`
