# Brief: 「그리스도」 (christ) translation — one language file per language

Owner decisions: the film ships as two masters (Korean, English-text) and every other language is an audio or caption track
(films README §4, motion/youtube/LANGUAGES.md §5). Voice tracks: en (on screen) · es · pt-BR (`targets.json intl.voice_langs`).
Captions: the fixed 27 languages (`targets.json captions.langs`). No automatic translation anywhere — this file is that step.
The native review is a separate agent (`motion/reviews/film-christ-captions.md`).

## What to write
`motion/films/christ/i18n/<code>.json`, JSON with 1-space indent (`JSON.stringify(p, null, 1)`), shaped like `en.json`.
- `_dir` ("ltr"/"rtl"), `_yv` (the YouVersion id of the site pack `i18n/<code>.json` → `yv`), `_version` (short edition name as
  the site pack shows it in `ui.version`, without brackets).
- **es and pt-BR** (voice languages): **every key `en.json` has** (narration, quotes, labels P1 L1 L2 L2N L3 P3 P4 P5 L4 P7 E1 B1, T1).
  The voice reads the narration and, for quotes, `voice` when the line has one (else the whole text).
- **all other languages** (captions only): `_scope: "captions"`, `T1`, and the narration + quote lines only (no P*/L*/E1/B1 labels).

Line ids, Korean source = `motion/films/christ/script.json` → `lines[].text` (and `voice`); reviewed English meaning = `en.json`.
Narration (`kind: narr`): N01 N02 N03 N04 N06 N07 N08 N09 N10 N11 N12 N14 N20 N15 N16K N16P N16R N16 N17.
Quotes (`kind: quote`, usfm): Q1 JHN.1.41 · K1 1SA.16.13 · K2 LEV.8.12 · K3 1KI.19.16 · Q2 MAT.16.16 · Q3 MAT.16.22 · Q4 ISA.53.5 ·
Q5 MAT.27.46 · Q6 PSA.22.1 · Q7 PSA.22.18 · Q9 ACT.10.38 · Q11 ACT.10.39 · Q12 ACT.10.40 · Q14 ACT.10.43 · Q13 MAT.16.16.

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
2. **The film's point lives in one word.** "Christ" = "Messiah" = "the Anointed One"; anointing **oil** poured on kings, priests,
   prophets. Use the word your Bible uses for Christ in Matt 16:16 and John 1:41, the word it uses for Messiah in John 1:41, and its
   verb for anoint (1 Sam 16:13, Acts 10:38) — so N03 ("Christ is not a surname; it means 'the anointed one', the Messiah"), N04,
   N16, N17 tie visibly to the verses. If in your Bible John 1:41 already shows the two words, mirror exactly that pair.
   "성" = family name / surname (N01, N03, N17): the question is whether "Christ" is Jesus' last name.
3. **Narration prose**: translate from the Korean, faithful in meaning (en.json is the reviewed English rendering — use it to check
   meaning, don't paraphrase further). Natural, simple, for Christians who don't know the Bible well. Gentle, reverent tone.
   Keep `/` where a long line should break (captions show it as a line break) — at most two short lines per `/` piece.
   N16K/N16P/N16R/N16 are one sentence said in four beats: "King, / Priest, / Prophet, / three offices, in one Person."
   N20: Peter, who once said "Far be it from you" (Q3's words in your Bible), met the risen Jesus — and then preached this (Acts 10).
   N12 "천 년 전" = about a thousand years before Jesus (David wrote Psalm 22). P4 "예수님보다 약 700년 전" = about 700 years before Jesus.
4. **Terminology follows the quoted Bible** of that language (God, Jesus, Christ, Messiah, Holy Spirit, cross, Peter, Andrew, Simon,
   Samuel, David, Aaron, Elisha, Isaiah, Caesarea Philippi, Rome, prophet, priest, king, anoint) — the same words the verses use;
   for words the verses don't contain, use the site pack `i18n/<code>.json` (search it). Never another religious register.
5. **Digits**: follow the site pack's convention (some packs use native digits — check `i18n/<code>.json`).
6. Labels (es, pt-BR only): "Book chapter · who/where" like en.json; E1 = "Key passages in this film · …" with your Bible's book names.

## Check before you report
`node motion/films/check-quotes.mjs christ <code>` must report every quote `ok`. Also
`node -e "JSON.parse(require('fs').readFileSync('motion/films/christ/i18n/<code>.json','utf8'))"`.

## Report (final message — short)
Per language: the check-quotes result; any versification differences (which `usfm`); which words you used for Christ / Messiah /
anoint; and a **literal Korean back-translation** of every narration line (N01 N02 N03 N04 N06 N07 N08 N09 N10 N11 N12 N14 N20 N15
N16K–N16 N17) + T1, written to `motion/films/christ/i18n/backtr-<code>.md` (not in the message). Do not edit any other file.
