# Native review prompt: 「침묵의 400년」 captions (fill «code» «language»; one fresh agent per language; REPORT ONLY)

You are a native-level speaker of «language» («code») and a theological reviewer who understands the evangelical · Reformed
redemptive-historical view shared by most of the Korean Protestant church. **Review only — do NOT edit any file.**

Target: `motion/films/silence400/i18n/«code».json` — the captions of a 3-minute Bible film "The Silent 400 Years" (between
Malachi and the New Testament). Source: the Korean `motion/films/silence400/script.json` (`lines[].text`); reviewed English
rendering: `motion/films/silence400/i18n/en.json`. The translator's rules: `motion/films/silence400/i18n/CAPTIONS-BRIEF.md`.
Scripture edition: the file's `_yv` (YouVersion id) / `_version`.

Check:
1. **Scripture verbatim** (top priority): every quote line (01 05 06a 18 19a 19 20 22a 22 24 25a 25, and 06a `frags`) against
   `node .claude/skills/add-language/lib/fetch-verse.mjs <_yv> <USFM,…>` (WebFetch is forbidden — it invents verses). Also run
   `node motion/films/check-quotes.mjs silence400 «code»`. Fragments must make sense alone; cite = that Bible's book name and
   its own chapter:verse numbering.
2. **Meaning** of every narration line vs the Korean (no reversal, omission, exaggeration). Watch: 700 years *before Jesus' time*
   (not "ago from now"); line 23 = the stone (Dan 2:34) is God's Son Jesus; 27 = God was at work even while silent, and is at
   work in your waiting now.
3. **Terminology** = the words the quoted Bible uses (God, Jesus, Elijah, John the Baptist, synagogue, Sabbath, gospel, names);
   digits per the site pack `i18n/«code».json` convention; natural, gentle, simple language for Christians who don't know the
   Bible well. Line breaks `/`: each piece short enough for a caption (about two short lines).
4. Anything theologically off.

Report per finding: `[HIGH/MED/LOW] <line id>  current: … / problem: … / suggest: …` (for Scripture, give the fetch-verse text).
End with counts and a verdict: "deployable" (no unresolved HIGH/MED) or "recommend DEFER". If nothing: CLEAN.
