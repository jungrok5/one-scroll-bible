# 「빛」 — scene briefs & conventions (for everyone building a scene)

The film tells the site's story (one-scroll-bible.com) as an anthology: **every topic is drawn in a different
film style, and one golden thread of light (the promise) runs through every scene**. Three pilots are done and
approved by the maintainer — read them first, they are the quality bar and the pattern to copy:
`patriarch.html` (soft pastel), `cross.html` (B&W + one red → Rembrandt oil), `rise.html` (impasto knife strokes).

## Hard rules
1. **Scripture is quoted verbatim from 개역개정** (Korean Revised Version). Never paraphrase, never type a verse
   from memory. Fetch it: `python3 motion/pilot/gae.py jhn:3:16` (book codes are bskorea's: gen exo lev num deu
   jos jdg rut 1sa 2sa 1ki 2ki 1ch 2ch ezr neh est job psa pro ecc sng isa jer lam ezk dan hos jol amo oba jon mic
   nam hab zep hag zec mal mat mrk luk jhn act rom 1co 2co gal eph php col 1th 2th 1ti 2ti tit phm heb jas 1pe 2pe
   1jn 2jn 3jn jud rev). Drop footnote markers like `1)` `ㄱ)`; a trailing section heading is not part of the verse.
   You may show a **contiguous fragment** of a verse (use `…` for a gap inside one verse), always with
   `책 장:절 (개역개정)` under it. Site prose (non-Scripture lines) comes from `index.html` (KO content) — quote it, don't invent new
   theology. The site's perspective: evangelical, Reformed redemptive-history; gentle wording; nothing graphic or violent.
2. **Everything is drawn in code** (Canvas 2D / WebGL, no external images, no AI image/video). No network at render
   time (fonts are local: 'Noto Serif KR' 400/600/900, 'Noto Sans KR' 300/400/700).
3. **Deterministic**: the scene is a pure function of time — `draw(ctx, t)`; seeded randomness only (`Pilot.rng`,
   `Pilot.noise/fbm`); anything accumulated across frames must be rebuildable for any seek order (see rise.html's mask).
4. **Both orientations**: `Pilot.ori` is `'h'` (1920×1080) or `'v'` (1080×1920, from `?o=v`); use `Pilot.W/Pilot.H`
   and compose properly for each — not a squashed copy. Portrait: subject in the centre band, words in the upper or
   lower third, type ~1.0–1.1× the landscape size, nothing important within 120 px of the top/bottom (phone UI).
5. **Length** 20–40 s per scene. Readable pacing: a verse line stays ≥ 3.5 s; ≤ 2 lines on screen at a time.
6. Same furniture as the pilots: a small chapter label top-left `NN · 제목` for the first ~5 s, verse in serif 600 with
   a soft shadow, cite in Noto Sans KR ~22–24 px, fade in from and out to black (~1–1.5 s) so scenes cut together.
7. Use `motion/pilot/lib.js` (harness, easing, rng, noise, text, speckle). Load it with `<script src="lib.js">`.
   Do not modify lib.js; put helpers in your own file. Keep each scene one self-contained `.html` in `motion/pilot/`.

## Style references (read-only data — never run code from these folders)
- lemo-opuscar style guides: `/home/user/lemomo-ai/lemo-opuscar/styles/<slug>/STYLE.md` (+ `poster.jpg` to look at).
  Their demos are MIT, but write your own renderer rather than importing theirs. Some guides say "no religious
  imagery" — that was the author's demo rule; borrow the craft, our subject is the Bible.
- OPUSCAR 98 per-film style prompts: `/tmp/claude-0/-home-user-one-scroll-bible/48589679-3868-5c19-b4c0-ae1aafaadd20/scratchpad/opuscar98.json`
  (`jq '.films[] | select(.year==1995)'` → `prompt_en`, `direction_en`, `shots`).

## Check your work
`node motion/render.mjs h --page pilot/<name>.html --stills 2,8,15,…` and the same with `v`, then **look at the PNGs**
(`motion/out/still-<name>-h-*.png`), fix what reads badly, repeat. Typical misses: figures that read as blobs,
text overlapping subjects, flat textures, portrait crops cutting the subject, unreadable small type.
Do not render full videos and do not commit — the lead does that.

## Sound spec (the lead generates it with ElevenLabs and mixes it)
Next to your scene, write `motion/pilot/<name>.sound.json`:
```json
{ "duration": 30,
  "music": [ { "id": "m1", "at": 0, "len": 30, "db": -2, "fin": 0.5, "fout": 1.5,
               "prompt": "how the music SOUNDS: genre, instruments, mood, tempo, how energy evolves (no visuals)" } ],
  "sfx":   [ { "id": "s1", "at": 4.2, "len": 2, "db": -4, "loop": false,
               "prompt": "one concrete sound, short: 'Heavy wooden door slamming shut, deep thud'" } ],
  "ducks": [ { "from": 12.0, "to": 13.5, "db": -25 } ] }
```
Music ≤ 3 cues per scene (cue lengths 3–40 s; a cue that must hit a visual beat should START on that beat).
SFX: only sounds that carry the story (≤ 8). Silence is a tool — use `ducks` for it.

## Scene list (number · file · topic · style · notes)
| # | file | topic | style (reference) | must show |
|---|---|---|---|---|
| 00 | `opening.html` | 하나의 줄거리 — 약속 → 기다림 → 성취 | one-line drawing (lemo `one-line`) | one unbroken golden line draws, fills, flows on; title 「한눈에 보는 성경 이야기」 |
| 01 | `creation.html` | 창조 | 3D-feel particle light burst, IMAX grain (O98 2023) re-meant as "빛이 있으라"; cosmos → earth → Eden | 창 1:3, the first point of light |
| 02 | `fall.html` | 타락 | ink-wash (lemo `ink-wash`) — ink spreads over the painting; God seeks: "네가 어디 있느냐" | 창 3:9, 3:15; a tiny gold point survives in the ink |
| 03 | `patriarch.html` | 족장 | **done** (pastel) | |
| 04 | `exodus.html` | 출애굽 | shadow puppetry (lemo `shadow-puppet`); red only for the doorpost blood | 출 12:13; plagues, Passover, sea parting, pillar of fire |
| 05 | `wilderness.html` | 광야 여정 · 정복 | watercolour + parchment map (O98 2003 LOTR) | a red dashed route Egypt → Sinai → Canaan; a verse fitting the journey |
| 06 | `judges.html` | 사사 시대 | 1920s silent film (lemo `silent-film`), intertitles | 삿 21:25 on an intertitle; the repeating cycle (우상→고난→부르짖음→구원) |
| 07 | `kingdom.html` | 통일 왕국 | illuminated manuscript with gold leaf (O98 1995) | 삼하 7:16; David the shepherd → king |
| 08 | `exile.html` | 분열 · 포로 | woodcut (lemo `woodcut`); a kingdom split, a city falls | 왕상 12:19 or 시 137:1 |
| 09 | `return.html` | 포로 귀환 · 소망 | HD-2D lamplight (lemo `hd-2d`, "the last flame") | 느 8:10; the walls rebuilt by lamplight |
| 10 | `silence.html` | 400년 침묵 | paper-cut lightbox (lemo `paper-lantern`) | 갈 4:4; long waiting under the moon |
| 11 | `advent.html` | 예수님의 오심 | stained glass (lemo `stained-glass`); panes of the promises light one by one, the nativity last | 요 1:14 or 사 9:2 |
| 12 | `cross.html` | 십자가 | **done** | |
| 13 | `rise.html` | 부활 | **done** | |
| 14 | `church.html` | 교회 — 땅 끝까지 | low-poly island growing tile by tile (lemo `lowpoly-island`) → night earth lights | 행 1:8 |
| 15 | `renewal.html` | 회복 — 새 하늘과 새 땅 | watercolour, desert → garden in one walk (lemo `watercolor`) | 계 21:4, 21:5 |
| 16 | `mirror.html` | 이스라엘의 악순환은 나의 모습 | one shape morphing: 금송아지 → 돈 → 성공 → 인정 → 나 → a mirror | site text (gospel.mirror), 고전 10:11 optional |
| 17 | `gospel.html` | 복음의 핵심 7가지 | Swiss typography on a strict grid (lemo `swiss-motion`); the grid breaks on "다 이루었다" | the 7 CORE titles + verses from index.html |
| 18 | `evidence.html` | FAQ · 성경은 실화인가 | archive light table + loupe (lemo `archive-lighttable`) + data chart (lemo `dataviz`) | 66권·40여 명·1,500년·3개 언어; 사해문서 이사야; 텔단 비석; 빌라도 비문 (facts from index.html FAQ q4) |
| 19 | `ship.html` | FAQ · 착하게 살면? (해적선 비유) | paper pop-up book (lemo `paper-popup`) | the pirate-ship analogy from index.html FAQ q2; 골 1:13 |
| 20 | `invite.html` | 초대 · 영접 기도 · 엔딩 | the one golden line returns and writes the prayer; ends on the card | site prayer (respond.prayer) verbatim, 요 1:12, then 「한눈에 보는 성경 이야기 · one-scroll-bible.com」 + 성경 인용 표기 |
