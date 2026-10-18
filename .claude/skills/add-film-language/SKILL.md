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
the checklist. Tools live in `motion/` and are run from the repo root.

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
- Counters: `Pilot.trn('{n}년', n)` — add CLDR plural keys (`"{n}년#one"`, `#few` …) and exact numbers (`"{n}년#=1"`) as needed.
- Do not edit scene code (only one agent may, at a time); report any scene that needs a change for your script.

## 2 · Check (must pass before review)
```
node motion/i18n-merge.mjs <code>            # → motion/pilot/i18n/<code>.json (what the scenes load; never hand-edit)
node motion/i18n-scan.mjs <code>             # every scene "complete", no leaks (Korean left on screen)
node motion/sheets.mjs <code>                # contact sheets → motion/out/sheets/<code>/<scene>-<h|v>.png — LOOK at all 42
```
Look for: tofu boxes (font), text running off the frame, collisions with figures or other text, lines shrunk too small
(rebalance the `\n` breaks — don't cut words from Scripture). Exact moments: `node motion/render.mjs h --page pilot/<scene>.html --lang <code> --stills 3,10`.

## 3 · Native review (separate agent, report only)
Fill `review-prompt.md` (this folder) with the language, edition and YouVersion id and give it to a fresh agent.
Apply every **HIGH** and **MED** finding (re-fetch the verse before changing Scripture), re-merge, re-check the sheets.
Quality gate (AGENTS.md): publish only with no unresolved HIGH/MED.

## 4 · Publish
```
bash motion/poster.sh <code>                 # film/poster-h-<code>.jpg + poster-v-<code>.jpg (the title card)
python3 motion/publish-film.py               # film/s/: scenes, fonts subset to every language's glyphs, i18n/<code>.json
```
- Add the button text to `FILM_CTA` in `index.html` (one line; `tools/build-pages.mjs` puts it on that language's page).
- `publish-film.py` copies **every** language file in `motion/pilot/i18n/` — delete `film/s/i18n/<code>.json` of any language
  that has not passed review before committing.
- New script? Add its Noto faces to `LOCAL` in `publish-film.py` (TTFs in `~/.local/share/fonts`).
- `node tools/build-pages.mjs`, commit (Korean message), and deploy per AGENTS.md (main only with the maintainer's OK).
- **After deploying, check the live site** (`curl -s https://one-scroll-bible.com/film/s/i18n/<code>.json | head -c 200`
  and the language page's `filmCta` link). A deploy can show "success" on GitHub and still not be the one serving.

## Changing a scene's wording or timing
Korean keys are shared by every language: if you change a Korean string, every language loses that line until it is
translated again (`i18n-scan` shows it as missing). Change the look, layout or timing freely; keep the strings.
