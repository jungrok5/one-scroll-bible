---
name: make-film
description: Make a new film in the film series (motion/films/<name>/) from topic to publication — script, draft page shared with the maintainer's family, drawing, sound, upload, international tracks. Use when asked to start or continue a new film ("새 영상", "N번 해보자", "원고", "시안", "<film> 이어서"), or to show a film's draft for review.
---

# /make-film — one film, the same way every time

The rules live in **`motion/films/README.md`** (strategy, format, review order, lessons). This skill is the session procedure.
The general film-making method underneath is the **canvas-film** skill in `C:\Project\motion-skills\canvas-film` (SKILL.md +
`references/`): MESSAGE.md (12-question message check — before any script/storyboard is shown), STYLE-INDEX.md + `kits/`
(looks), SCENE-RULES.md (scene authoring), BODY-CHECK.md (figures that act), LESSONS.md. The films README adapts it to this
series; where they differ the README wins (e.g. many verbatim quotes on screen are intended here) — record the deviation.
Talk to the maintainer in Korean. Never publish, make public, merge to main or delete without their OK (README 0절 stop points).

## 0 · Where are we? (every session, first)
1. Read README **0절** (the 14 steps) and the film's **`motion/films/<name>/review.json`**: `stage`, `round`, `status`,
   open `decisions`, `artifact_url`, `rounds`, `feedback_log`, `process_changes`. No folder yet → stage 1 (topic from README 10절).
2. Read README 1–3절 and 8–9절 before writing or changing script text; 7절 before drawing.
3. If `artifact_url` is set, `Artifact read` it once (a publish to it from a new session is refused otherwise).

## 1 · Script and style (stage 2)
- `script.json` (format: README 3절; ids are translation keys — never reuse an id for a different line).
  Quotes verbatim: `node motion/narration/krv.mjs gen.3.15 …` (John = `jhn`, 1 John = `1jn`; drop section headings
  that bskorea appends to a verse) → `node motion/films/check-quotes.mjs <name>` must print all `ok`.
- `review.json`: `logline` (the whole film in one sentence), `parts` (name + **`feel`** = one-word emotion (MESSAGE.md q7) +
  **`key`** = id of the part's key line + style + source kit, README 7절, **`story`** = 1–2 sentence synopsis of what is seen, **`samples`** =
  frames of an earlier film drawn in that look `{film, t, cap}` — the page renders and embeds them; the maintainer judges the
  style by eye, never from a style name alone), `decisions` (what only the maintainer can choose —
  title, dates, framing; each with `detail` and `options`), `rounds[0]`, `ref_film` (the previous film, for length estimates).
- Draft page: `node motion/films/review-page.mjs <name>` → publish `motion/out/review/<name>.html` with the Artifact tool
  (first time: no url, icon `script`, then write the URL into `artifact_url`; later: the same file path in this session, or
  `url` = `artifact_url` from a new session). **The page is the draft only, readable at a glance** — logline + one-screen
  board (per part: frame, name, feel, key line), then the words as heard, the open decisions, and the full line-by-line
  script folded. No feedback widgets, no checks on the page (maintainer, 2026-11-02). Screenshot it at 1280 and 400 px
  before publishing (playwright, as render.mjs loads it). Tell the
  maintainer it is private until they share it (Share menu) with their wife.
- `review.json` `message_check`: answer MESSAGE.md's 12 questions for this script (`flag: true` where the maintainer must
  judge or the script should change). Checks stay off the page: say the flagged ones in chat, in a few lines.
- The generator prints the checks — fix what it flags before sending if it is cheap: quote mismatch (never send), voice estimate over the target length,
  tight reading time.

**Before the maintainer sees any draft** (maintainer, 2026-11-02): run README 8절 2·3 first — one theology reviewer
(관점 검수) + viewer reviewers (성경 잘 모르는 크리스천 63세 · 성경 잘 아는 신자 · 비신자), background agents, report only,
each scoring every part 감동 0–5 / 전율 0–5 with the moment they would swipe away. Apply, re-review weak parts for the
primary audience, record in `motion/reviews/film-<name>-script.md`, then build and publish the draft page. In chat: what
the reviews said, what changed, and what is left for the maintainer to choose.

**Drawing (stage 4) — portrait first, legibility first** (maintainer, 2026-11-02): compose every scene for 1080×1920
(Shorts) and adapt landscape for TV; pilots, stills and preview videos are portrait first. Search STYLE-INDEX, the
Lemo-Opuscar repo AND the word-log kits (`kits/templates.jpg` — portrait-native, figures that read); reject a look whose
texture buries the map, the words or the people on a phone (the mosaic pilot did). Pilot 2–3 parts → `review.json`
`pilot` → draft page + a portrait preview video (SendUserFile) before building the rest.

## 2 · Review loop (stages 2–4)
1. Feedback comes in chat (the maintainer and their wife read the draft page).
2. Apply. Decided items move out of `decisions` into `feedback_log` (who said what → what changed). Anything unclear → ask.
3. Bump `round`, add `rounds[]` with `summary` and `changed` (line ids), set `status`, regenerate, republish the same URL.
4. When the script changes a lot after feedback, run the reviewers again before republishing.
5. Only after explicit 컨펌 move `stage` forward and start drawing.

## 3 · Later stages
Follow README 0절 rows 4–14 with the tools named there (render → sound → upload.md → Studio/API → social → intl → captions →
/film → routines). Keep `stage`/`status` in `review.json` current at every stop point, and `uploaded.json` for every id.

## 4 · Make the process stronger as you go (the point of this skill)
Whenever something was missing, went wrong, cost a retry, or a better way was found:
- this film only → `review.json` `process_changes` (date + what);
- every future film → fix the rule in the README section it belongs to (and 9절 for a lesson), or this SKILL.md if it is
  session procedure; a tool fix goes in the tool. Mention it to the maintainer in one line.
Commit with the film work (Korean message), push the work branch; main only with permission.
