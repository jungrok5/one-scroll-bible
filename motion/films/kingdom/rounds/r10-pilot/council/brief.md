# 10-3 대책 회의: 카메라·연출·조명·시나리오 (관리자 2026-11-27 "4명 모여서 대책 세워봐")

You are one of four film professionals called in to stop a run of failed rounds on three short scenes of the film 「kingdom」 (예수님이 가장 많이 하신 말은? — 하나님 나라).
- **Your output:** a diagnosis and a concrete countermeasure plan from your own craft.
- **Report only:** do not edit project code and do not commit. Write only your own file in this folder.
- **Language:** write in Korean, plainly; the owner reads it.

## The situation
The three 10-3 scenes, portrait 1080×1920 (phone first), all drawn live in canvas code:
- **Jerusalem weeping (Luke 19:41–44)**
  - Film 494.7–551.0, lines N133–N137, Q108 and Q108b.
  - Module `motion/films/kingdom/jerusalem-weep3d.js`, page `sample-r10-jerusalem.html`.
- **Pentecost, the 3,000 baptised (Acts 2)**
  - Film 970.8–986.8, lines N170–N172.
  - Module `pentecost3d.js`, page `sample-r10-pentecost.html`.
- **Peter's mother-in-law rose and served (Mark 1:30–31)**
  - Film 162.2–168.7, line N111.
  - Module `short-scenes.js`, page `sample-r10-shorts.html` (first ~6.5 s).
- **Script lines:** `motion/films/kingdom/script.json` (match by `at` time).

**About 8 rounds since 11-25 without converging.** Owner remarks are in `review.json` `feedback_log` #85–98.
- **#89, after "수정 2" (commit 9e9fa17f), on the Jerusalem visual:** "영상 자체는 나쁘지 않은데 무엇을 표현한 건지 이해가 안 됨. 예수님 왜 우시지?"
- **#90:** Pentecost's first-draft aerial of 3,000 gathering was better.
- **#91:** "장모가 일어난 것과 '베드로가 곁에 없었다'가 어떻게 연결되는 거지?"
- **Then:**
  1. A director plan (`director3-plan.md`).
  2. Build (`batch3-director.md`).
  3. Fix 1 (`batch3-director-fix1.md`).
  4. Fix 2 (`batch3-director-fix2.md`). Fix 2 threw away the 3D city for a code-"painted" 2D panorama.
- **Result:** a sharp quality drop.
  - Owner #96: "뭐지 급격한 퀄리티 저하는?? 왜지".
  - Owner #97: "오순절똑같애" — Pentecost did not improve; the aerial crowd vanished into sand dots, and the bowed shadow is unchanged.

**History of every round's anomaly check:** `review.json` → `anomaly_checks` `b3-*` (f1, f2, d1, d2, d3).

**Frames, every 0.25 s:**
- d1, d2, d3: `motion/out/review/anomaly-d1/`, `anomaly-d2/` (j, p, r), `anomaly-d3/` (jer, pen, room, plus z-*.png zooms).
- **Side by side, top = before fix 2, bottom = after:** `motion/out/review/jer-cmp.jpg` and `pen-cmp.jpg`.
- **Earlier versions in git:** e.g. `git show 9e9fa17f:motion/films/kingdom/jerusalem-weep3d.js` (the "나쁘지 않은데" version), 3365dae9 (fix 1).
- **Current previews:** `motion/out/review/sample-r10-{jerusalem,pentecost,shorts}-720.mp4`. Extract frames with ffmpeg; use `py` for PIL.

**Builders:** each scene was built and patched round after round by one long-running coding agent (contexts near 1M tokens). Briefs were written by the producer (me) from the anomaly lists.

## The bar and the rules (read before judging)
- **The bar:** `motion/films/README.md` §7 (how films are made — the first film is the bar) and §9 (lessons).
- **Rules:** `motion/films/pipeline/rules.json`.
- **General method:** `C:\Project\motion-skills\canvas-film\` — SKILL.md, references/LESSONS.md, BODY-CHECK.md, STYLE-INDEX.md.
- **Scenes the owner approved in this film:**
  - Part 5 / the rooster: `sample-r10-rooster-b*.html`.
  - The lake: `sample-r10-lake2*.html`.
  - Part previews `motion/out/review/kingdom-part*-latest-720.mp4` / `-polish-720.mp4`.
  - What did those do right?

**Fixed rules:**
- **Cinematic, never illustration.** A camera moving through space, light as the protagonist, small figures, restraint. No flat posters, maps or infographics.
- Portrait first; readable in 1 s on a phone. A fitting look per scene. No near-still stretch over 3 s. No shaking.
- **Jesus:** no face or profile, no halo, never large or central, no light behind his head.
- **Men read as men:** a tied head cloth with a level top ending at the shoulder, and broad level shoulders.
- Nothing indecent; no waist or groin light. Words never on art. Scripture quotes are verbatim (개역개정).
- **Lesson repeated over five rounds:** code-drawn 3D buildings, beds and bodies keep failing; shadows, light and far silhouettes work.

## What you write
Your file: `council/<role>.md`, under 700 words. It must be grounded in frames you actually looked at; cite times and paths.
1. **Diagnosis.**
   - Why the quality dropped in fix 2.
   - Why 10-3 has not converged in ~8 rounds — in your craft, and in how the rounds were run (briefs, patching, checks).
2. **Per scene, a concrete plan in your craft.**
   - A shot list with times, or a light plan, or line changes.
   - What to keep from which earlier version (name the commit or frames).
   - What to drop.
3. **Process countermeasures:** what must change in how we iterate so a round never gets worse again.
4. **Decisions only the owner can make:** 1–3, with options.
