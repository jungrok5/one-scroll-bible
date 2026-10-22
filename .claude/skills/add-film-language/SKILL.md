---
name: add-film-language
description: Translate the 21-scene film (one-scroll-bible.com/film/) into a language the site already has — translation files per scene, verbatim Scripture from that language's Bible, checks, native review, poster, film button, publish. Use when asked to "add <language> to the film / 영상", "영상 번역", or to fix a film translation.
---

# /add-film-language — put the film in one more language

The film is 21 canvas scenes (`motion/pilot/<scene>.html`) drawn **live** in the browser; nothing is re-rendered per
language. Korean is the source: every scene draws its Korean text through `Pilot.tr`, and a language file maps each exact
Korean string to its translation. So adding a language = writing translation files, checking them, and publishing.

**Prerequisite:** the language already exists on the site (`i18n/<code>.json`, added with `/add-language`). The film reuses
that pack's Bible version (`yv`, `ui.version`), its site prose (epoch lines, FAQ, prayer…) and its terminology.
Read `motion/I18N.md` once — it is the detailed brief (what each kind of text is, line breaks, fonts, RTL). This file is
the checklist. Tools live in `motion/` and are run from the repo root. **`node motion/film-lang.mjs`** drives every step below
(`status` shows where each language stands); the heavy steps run on GitHub Actions (`render-film` workflow), so a machine
with Node + git + `gh` is enough. The same procedure for people, in Korean: `motion/README.md` → "새 언어로 영상 만들기".

## 1 · Translate (one agent per language; several languages may run in parallel)
- Files: `motion/pilot/i18n/<code>/<scene>.json` for all 21 scenes + `_ui.json` (player page; copy the keys of
  `en/_ui.json`) + `_fonts.json` for non-Latin scripts (Latin: point at `'Noto Serif'` / `'Noto Sans'` like `en/_fonts.json`).
  `motion/pilot/i18n/en/*.json` shows which keys exist; translate from the **Korean key**, never from the English.
- The keys a scene needs: `node motion/i18n-scan.mjs ko <scene>` → `motion/pilot/i18n/_ko/<scene>.json` (`ids`).
- Three kinds of text:
  1. **Scripture** — verbatim from the site pack's Bible: `node .claude/skills/add-language/lib/fetch-verse.mjs <yv> GEN.1.3,…`.
     Contiguous fragment matching what the Korean shows (`…` for gaps), that Bible's versification and **God's name exactly
     as it prints it** (small-caps LORD/SENHOR/TUHAN: fetch-verse flattens them — check the bible.com `nd` markup).
     A fragment must make sense alone (include its subject). Cite in the pack's style + version tag.
  2. **Site prose** — copy `i18n/<code>.json` exactly (find the Korean in `index.html`, take the same key).
  3. **Film-only labels** (chapter names, captions, map names, plates) — short, natural, the quoted Bible's vocabulary;
     avoid words with a misleading second meaning (e.g. "United Kingdom" for 통일 왕국). Write a literal Korean
     back-translation of each in your report.
- `_ui.json` `legal`: entirely in the language — the pack's Scripture-licence meaning + "scenes drawn in code, music and
  sound made with ElevenLabs". **Never invent a publisher notice.** `ch` = the 21 on-screen chapter names.
  `cta` = the film button on the language's site page (like "Watch the 14-minute film"; see `FILM_CTA` in `index.html`).
- `motion/youtube/lang/<code>.json`, shaped like `en.json`: `thumb` = the thumbnail hook "THE WHOLE BIBLE IN 14 MIN"
  (`top` 1–2 short lines, `big` the number, `tail` the word after it, `font` a Noto Sans family that has the script, `rtl`
  for right-to-left), `watch` / `short_tail` (the description lines), `tags` (7–8 search tags). Back-translate these too.
- Counters: `Pilot.trn('{n}년', n)` — add CLDR plural keys (`"{n}년#one"`, `#few` …) and exact numbers (`"{n}년#=1"`) as needed.
- Do not edit scene code (only one agent may, at a time); report any scene that needs a change for your script.

## 2 · Check (must pass before review)
```
node motion/film-lang.mjs check <code>       # i18n-merge (→ motion/pilot/i18n/<code>.json, never hand-edit) + i18n-scan:
                                             # every scene "complete", no leaks (Korean left on screen)
# commit + push the branch, then contact sheets on GitHub (every Noto font is there):
node motion/film-lang.mjs ci <code> --steps sheets --wait   # → motion/out/sheets/<code>/<scene>-<h|v>.png — LOOK at all 42
```
(`node motion/sheets.mjs <code>` does the same locally if Playwright and the script's Noto fonts are installed.)
Look for: tofu boxes (font), text running off the frame, collisions with figures or other text, lines shrunk too small
(rebalance the `\n` breaks — don't cut words from Scripture). Exact moments: `node motion/render.mjs h --page pilot/<scene>.html --lang <code> --stills 3,10`.

## 3 · Native review (separate agent, report only)
`node motion/film-lang.mjs review <code>` fills `review-prompt.md` (this folder) with the language, edition and YouVersion
id → `motion/out/review-<code>.md`; give it to a fresh agent (or a native speaker).
Apply every **HIGH** and **MED** finding (re-fetch the verse before changing Scripture), re-run check, re-look at the sheets.
Keep the final report as **`motion/reviews/<code>.md`**. Quality gate (AGENTS.md): publish only with no unresolved HIGH/MED —
`site` refuses a language without that file, and the YouTube upload sheet leaves it out.

## 4 · Publish to the site
```
node motion/film-lang.mjs site <code>                       # FILM_CTA in index.html ← _ui.json "cta" (the button), build-pages
# commit + push, then posters + film/s (scenes, fonts subset to the published languages' glyphs, language files) on GitHub:
node motion/film-lang.mjs ci <code> --steps site --wait     # → film/poster-*-<code>.jpg, film/s/ in the working tree
# commit + push; deploy per AGENTS.md (main only with the maintainer's OK), then:
node motion/film-lang.mjs live <code>                       # film/s/i18n/<code>.json served + the film button on /<code>/
```
- Published languages = the keys of `FILM_CTA`. `publish-film.py` exports only those (and removes a language taken off it), so an
  unreviewed translation in `motion/pilot/i18n/` never reaches `film/s/`.
- New script? Add its Noto faces (serif + sans) to the font list in `motion/ci-setup.sh`; `publish-film.py` finds any face named
  in `_fonts.json` there (`NotoSerifThai.ttf` or the variable `NotoSerifThaiwdthwght.ttf`).
- A deploy can show "success" on GitHub and still not be the one serving — that is why `live` checks the real site.

## 5 · YouTube files (everything up to the upload itself)
```
node motion/film-lang.mjs ci <code> --steps "h v kit release" --wait
```
`h` = the whole film and `v` = the 21 Shorts in the upload format → release `youtube-v1` (`release`; no expiry);
`kit` = thumbnails (`motion/youtube/thumbs/<code>/`, from `motion/youtube/lang/<code>.json`), the upload sheet
(`motion/youtube/manifest.json` / `.md`: titles, descriptions with chapters, tags, Shorts titles = a hook line from each scene)
and subtitles (`motion/subs/<code>/`). Commit the kit. The creation scene's WebGL cosmos comes from the Actions cache.

## Changing a scene's wording or timing
Korean keys are shared by every language: if you change a Korean string, every language loses that line until it is
translated again (`i18n-scan` shows it as missing). Change the look, layout or timing freely; keep the strings.
