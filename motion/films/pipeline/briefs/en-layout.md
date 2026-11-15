# 영어판 글자 배치 확인 에이전트 지시문 — {film}
(stage 10, 영어판 렌더마다. 만들기: `node motion/render.mjs v|h --page films/{film}/film.html --lang en` →
`py motion/films/frame-sheets.py {film}-en --video motion/out/film-en-v.mp4 --every 1` (가로 `--ori h --video motion/out/film-en-h.mp4`) →
이 지시문으로 에이전트 하나. 결과는 review.json `en_layout_check = { render, at, issues }`. 고칠 것은 대개 en.json의 `/` 줄 나눔 —
낱말은 그대로라 재검수 없이 고치되, 관리자에게 한 줄로 알린다.)

---
Repo c:\Project\one-scroll-bible. Report only — edit nothing except the result file named below.
The film {film} was rendered with English on-screen text (from `motion/films/{film}/i18n/en.json`; the Korean original's layout was already
approved). Check ONLY the English text layout. Contact sheets, one frame per second with timestamps: portrait `motion/out/frames/{film}-en/`
and landscape `motion/out/frames/{film}-en-h/` (manifest.json gives each sheet's time range). Read every sheet. If unclear at sheet size,
extract the frame: `ffmpeg -v error -ss <t> -i motion/out/film-en-v.mp4 -frames:v 1 {scratch}\en-<t>.png` (or film-en-h.mp4) and Read it.
Look for: text off the frame or clipped; lines overlapping each other or a citation; more than ~3 lines for one piece; a lone short word
on its own line or a phrase split across lines ("the Anointed / One"); text on a bright area or a face so it can't be read; the gold
highlighted word (hl) missing or on the wrong word; leftover Korean; broken characters (tofu), curly quotes/dashes/ellipsis drawn wrong
(2026-11-15: "…" came out as raised Korean-font dots); the title and the end card. Portrait: the bottom ~25% and right edge are covered by
phone buttons.
Write JSON to `{scratch}\en-layout.json`: `{ "issues": [{ "ori": "v|h", "t": <s>, "id": "<line id, from script.json at>", "what": "<one line>",
"severity": "MAJOR|MINOR" }], "clean": "<summary>" }`. Final message: MAJOR/MINOR counts and one line each.
