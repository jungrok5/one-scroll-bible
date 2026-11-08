# 5. 소리 — {film}
참고로 읽기: `motion/films/SOUND.md`(동작표 → 동작마다 그 재료의 효과음, 같은 시각·같은 길이 · 숨 멈춤 · 장면의 문장인 음악), 첫 영상 프롬프트 `motion/pilot/audio/prompts/first-film.md`, 앞 영상 `sound/prompts.md`.
해설: 목소리 HYALOqtTLlRjxo4uBKeg · eleven_v4 · 줄당 한 번 · 숫자는 한글. 다듬은 길이를 재서 `place.json` at을 정하고 그림의 TEXT 시각을 목소리에 맞춘다.
음악: eleven_music_v2_5 instrumental, 효과음: eleven_text_to_sound_v2(duration_seconds = 화면 동작 길이). 모두 ElevenLabs 플로 하나에.
만든 직후 기록: `sound-prompts.mjs logs … → names(sessions-*.json) → md`.
다시 자르기(차수마다): 구절 낭독이 빠르면 줄 경계에 쉼(`sound-edit.mjs silences` → `gaps`, pieces.json → film.html cuts), 시간표가 바뀌면 효과음 시각을 장면과 같은 꺾은선으로(`remap`), 효과음에 고음 잡음이 있으면 `dewhine`, 음악이 모자라면 `stretch` — 입력은 `sound/edit-<차수>.json`으로 남긴다(예: messiah/sound/edit-4.json). 즉석 명령으로 하지 않는다.
동작표: `node motion/films/actions.mjs {film}` → `sound/actions.json` — 코드의 동작(clamp·ss), 구절·금빛 말·말씀 잇기·끝 화면, 장면 이음, 렌더에서 잰 큰 변화. ✗ 표시된 동작부터 효과음을 만든다(길이 = 그 동작의 길이).
구절 속도·톤: `node motion/films/script-stats.mjs {film}` — 구절마다 음절/초와 뒤 머묾, 줄마다 크기(LUFS). 속삭임·연기 지시를 넣지 않는다(한 영상 한 톤).
만들기: `node motion/films/film.mjs run {film} sound`(섞기 + 프롬프트 기록 + 동작표). 검사가 보는 것: 구절 속도·머묾(pace), 줄마다 톤(tone), 꼭 소리가 있어야 하는 동작(actions), 해설 파일·배치, 효과음 분당 개수, 숨 멈춤 수, 파일·프롬프트 기록, 섞기가 최신인지, 크기(LUFS)·최대, ko.vtt.