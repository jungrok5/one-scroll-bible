# Brief: 「침묵의 400년」 caption translation (one language file per language)

Owner decision 2026-11-01: the film gets captions in every language the first film has. Captions only — no voice, no
re-render. The lines are the narration (what is spoken) plus the on-screen verses. This brief is for the translation agent;
the native review is a separate agent (`motion/reviews/film-silence400-<code>.md`).

## What to write
`motion/films/silence400/i18n/<code>.json`, JSON with 1-space indent (`JSON.stringify(p, null, 1)`), shaped like `en.json`
but **only these keys**:
- `_dir` ("ltr"/"rtl"), `_yv` (the YouVersion id of the site pack `i18n/<code>.json` → `yv`), `_version` (short edition name
  as the site pack shows it in `ui.version`, without brackets), `_scope`: "captions".
- `T1`: the film title (Korean 「침묵의 400년」, English "The Silent 400 Years").
- The 31 lines below, each `{ "text": … }`; quotes also have `"cite"` (book name + chapter:verse in that Bible's own style and
  **its own numbering**) and, when that Bible numbers the verse differently from the Korean `usfm`, `"usfm"` with the
  edition's USFM (e.g. Malachi 4:5–6 is 3:23–24 in some Bibles). Line `06a` also has `"frags"` (the five pieces shown one
  by one, each verbatim, like `en.json`). Copy `hl` only if `en.json` has it for that line (it marks the repeated phrase;
  give the same phrase in your text).

Line ids (Korean source text: `motion/films/silence400/script.json` → `lines[].text`; English meaning reference: `en.json`):
`01 02 03 04 05 06 06a 07 07b 08 09 10 14b 15 17 18 19a 19 20 21 22a 22 23 24 24b 25a 25 25c 25b 26a 27`.
Quotes (`kind: "quote"`): 01 MAL.4.6 · 05 HAB.2.3 · 06a DAN.2.32-33 · 18 LUK.1.13 · 19a MAL.4.5 · 19 MAL.4.6 · 20 LUK.1.17 ·
22a DAN.2.34 · 22 GAL.4.4 · 24 LUK.19.10 · 25a ISA.61.1 · 25 LUK.4.21.

## Rules (AGENTS.md — the site's translation rules apply)
1. **Scripture verbatim** from the site pack's Bible: `node .claude/skills/add-language/lib/fetch-verse.mjs <yv> MAL.4.5,MAL.4.6,…`
   (WebFetch is forbidden — it invents verses). Take the contiguous fragment that matches what the Korean line shows; `…`
   only where the Korean skips words. Line 01 is Mal 4:6 with a gap: first fragment / `…` / the last clause (the narrator reads
   only the part after `…`) — keep that shape. **The caption shows the part after the last `…` unless the line has `voice`** —
   if that part does not start the "lest I come…" clause (verb-final languages leave a lone verb there), add `"voice"` = exactly
   that clause, verbatim (see hi/bn/tr/fa). God's name exactly as that Bible prints it.
2. **Narration prose**: translate from the Korean, faithful in meaning (en.json is the reviewed English rendering — use it to
   check meaning, don't paraphrase further). Natural, simple, for Christians who don't know the Bible well. Gentle tone.
   Keep `/` where a long line should break (captions show it as a line break) — at most two short lines per `/` piece.
3. **Terminology follows the quoted Bible** of that language (God, Jesus, Elijah, John the Baptist, synagogue, Sabbath, gospel,
   prophet, names: Malachi, Zechariah, Elizabeth, Isaiah, Paul, Alexander, Nebuchadnezzar …) — the same words the verses use;
   for words the verses don't contain, use the site pack `i18n/<code>.json` (search it).
4. **Digits**: follow the site pack's convention (some packs use native digits — check `i18n/<code>.json`).
5. "700여 년 전" = some 700 years before Jesus' time (not "ago from now" — a reviewer caught this in Portuguese).
6. Line 23 "하나님이 보내신 그 돌, 그 아들 예수님이 오셨습니다." — the stone (Dan 2:34) = God's Son, Jesus.

## Check before you report
`node motion/films/check-quotes.mjs silence400 <code>` must report every quote OK. Also `node -e "JSON.parse(require('fs').readFileSync('motion/films/silence400/i18n/<code>.json','utf8'))"`.

## Report (final message)
Per language: the check-quotes result; any versification differences (which `usfm`); and a **literal Korean back-translation**
of every narration line (02 03 04 06 07 07b 08 09 10 14b 15 17 21 23 24b 25c 25b 26a 27) + T1. Do not edit any other file.
