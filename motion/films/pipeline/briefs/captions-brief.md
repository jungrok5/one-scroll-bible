# Brief: {title} ({film}) translation — one language file per language

Owner decisions: the film ships as two masters (Korean, English-text) and every other language is an audio or caption track
(films README §4, motion/youtube/LANGUAGES.md §5). Voice tracks: en (on screen) · es · pt-BR (`targets.json intl.voice_langs`).
Captions: the fixed 27 languages (`targets.json captions.langs`). No automatic translation anywhere — this file is that step.
The native review is a separate agent (`motion/reviews/film-{film}-captions.md`).

## What to write
`motion/films/{film}/i18n/<code>.json`, JSON with 1-space indent (`JSON.stringify(p, null, 1)`), shaped like `en.json`.
- `_dir` ("ltr"/"rtl"), `_yv` (the YouVersion id of the site pack `i18n/<code>.json` → `yv`), `_version` (short edition name as
  the site pack shows it in `ui.version`, without brackets).
- **es and pt-BR** (voice languages): **every key `en.json` has** (narration, quotes, labels {labels}, T1).
  The voice reads the narration and, for quotes, `voice` when the line has one (else the whole text).
- **all other languages** (captions only): `_scope: "captions"`, `T1`, and the narration + quote lines only (no labels: {labels}).

Line ids, Korean source = `motion/films/{film}/script.json` → `lines[].text` (and `voice`); reviewed English meaning = `en.json`.
Narration (`kind: narr`): {narr}
Quotes (`kind: quote`, usfm): {quotes}

## Rules (AGENTS.md — the site's translation rules apply)
1. **Scripture verbatim** from the site pack's Bible: `node .claude/skills/add-language/lib/fetch-verse.mjs <yv> JHN.1.41,1SA.16.13,…`
   (WebFetch is forbidden — it invents verses). Take the contiguous fragment(s) that match what the Korean line shows; `…` only where
   the Korean skips words (K3, Q5, Q9, Q11, Q14 start or contain `…`, like en.json). Each quote gets `"cite"` (book name + chapter:verse
   in that Bible's own style and **its own numbering**) and, when that Bible numbers the verse differently, `"usfm"` with that edition's
   USFM (Psalm 22 is Psalm 21 in LXX/Slavonic-numbered Bibles — ru/uz etc.; check by fetching). God's name exactly as that Bible prints it.
   `"voice"`: the part read aloud / shown as the caption when the Korean has `voice` — verbatim, contiguous, from the same verse; for
   verb-final languages pick the contiguous clause that carries the Korean voice's meaning (see en.json K3/Q2/Q3/Q5/Q9/Q11/Q14/Q13).
   `"hl"`: copy only when en.json has it — the gold word, a phrase that appears literally in your text (Q1/Q2/Q13 = the word
   "Christ" as your Bible prints it in that verse; K1 "oil", K2 "on Aaron's head", K3 "anoint", Q3 "far be it", Q4 "pierced",
   Q5/Q6 "forsaken me", Q7 "cast lots", Q9 "anointed", Q11 "hanging him on a tree", Q12 "raised him", Q14 "through his name").
2. **The film's key point** (written by hand for each film — the words that must tie visibly to the quoted verses):
   {point}
3. **Narration prose**: translate from the Korean, faithful in meaning (en.json is the reviewed English rendering — use it to check
   meaning, don't paraphrase further). Natural, simple, for Christians who don't know the Bible well. Gentle, reverent tone.
   Keep `/` where a long line should break (captions show it as a line break) — at most two short lines per `/` piece.
   {notes}
4. **Terminology follows the quoted Bible** of that language (God, Jesus, Christ, Messiah, Holy Spirit, cross, and every proper name) — the same words the verses use;
   for words the verses don't contain, use the site pack `i18n/<code>.json` (search it). Never another religious register.
5. **Digits**: follow the site pack's convention (some packs use native digits — check `i18n/<code>.json`).
6. Labels (es, pt-BR only): "Book chapter · who/where" like en.json; E1 = "Key passages in this film · …" with your Bible's book names.

## Check before you report
`node motion/films/check-quotes.mjs {film} <code>` must report every quote `ok`. Also
`node -e "JSON.parse(require('fs').readFileSync('motion/films/{film}/i18n/<code>.json','utf8'))"`.

## Report (final message — short)
Per language: the check-quotes result; any versification differences (which `usfm`); which words you used for Christ / Messiah /
anoint; and a **literal Korean back-translation** of every narration line + T1, written to `motion/films/{film}/i18n/backtr-<code>.md` (not in the message). Do not edit any other file.
