# 번역 에이전트 지시문 — {film} · {codes}
(stage 10·11. 「그리스도」 2026-11-15에 처음 이 형태로 돌림. 묶음 = targets.json captions.groups — 묶음마다 에이전트 하나, 동시에.)
본 세션이 먼저 할 것: ① `motion/films/{film}/i18n/en.json`을 직접 쓰고 `check-quotes.mjs {film} en` 통과 + 영어 검수(briefs/review-en.md)
② `node motion/films/i18n-brief.mjs {film}` → `motion/films/{film}/i18n/CAPTIONS-BRIEF.md`(줄 id·인용 목록이 들어간 이 영상의 지시문 — 영상의
핵심 낱말(「그리스도」라면 그리스도=메시야=기름 부음 받은 자)을 '이 영상의 요점' 칸에 손으로 한두 줄 적는다). 그다음 아래를 묶음마다 보낸다.

---
Repo c:\Project\one-scroll-bible. Follow the brief `motion/films/{film}/i18n/CAPTIONS-BRIEF.md` exactly (read it first, then
`motion/films/{film}/script.json`, `motion/films/{film}/i18n/en.json`, and AGENTS.md's translation rules — versification, terminology
follows the quoted Bible, native digits, zh-Hant Taiwan glyphs, rtl). Write the language files for: **{codes}**
(es and pt-BR, when in the list, are full files — every key en.json has; all others captions scope).
Scripture only via `node .claude/skills/add-language/lib/fetch-verse.mjs <yv> <USFM,…>` (never WebFetch).
Run `node motion/films/check-quotes.mjs {film} <code>` for each until all ok. Write each back-translation to
`motion/films/{film}/i18n/backtr-<code>.md`. **Temp files only in your own folder `{scratch}`** — other translators run at the same time
and share the scratchpad (2026-11-15: two agents used the same script name and one overwrote the other's five files).
Edit no other files. Final message: per language one line — check-quotes result, versification notes, the words used for the film's
key terms, anything a native reviewer should look at.
