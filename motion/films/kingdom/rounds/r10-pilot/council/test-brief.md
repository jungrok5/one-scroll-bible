# 10-3 시험 컷 — 네 명 대책안 (관리자 2026-11-28 "각 전문가들이 낸 의견이니 이대로 시험컷 만들어봐 기대하겠어")
You are a **fresh builder** for one scene. Before writing code, read:
- `council/plan.md` (the agreed plan)
- `council/bold.md` (the shot designs; the **stage director's section overrides** the camera director's where they differ)
- your scene's sections in `camera.md`, `lighting.md`, `director.md`
- the new rules at the end of `motion/films/pipeline/rules.json`: `round-no-regression`, `fix-round-no-technique-switch`, `preview-voice-context`, `shot-table-brief`, `directors-propose-bold`

This is a **test**, not the full scene: make exactly what your section asks, then stop.
- No commits.
- Don't touch other scenes' files.

## Fixed rules
- Cinematic, never illustration: the camera moves through space and light is the protagonist.
- Portrait 1080×1920, readable in 1 s on a phone.
- No near-still stretch over 3 s. No shaking.
- **Jesus:** no face or profile, no halo, never large or central, no light behind his head.
- **Men read as men:** tied head cloth with a level top ending at the shoulder, broad level shoulders.
- No waist or groin light. Nothing indecent. Words never on art.
- **Lesson of five rounds:** code-drawn close 3D bodies, beds and buildings fail. Shadows, light and far silhouettes work.

## New script times
script.json was re-timed 2026-11-28 for W1/W2. Read every time from the script by id; never hard-code old times.
- N111: 162.2–170.1
- Jerusalem: N133 496.1 → C13 554.1
- Pentecost: N170 973.9 → N173 989.9 (N172 at 982.9)

## Render and check
- `node motion/render.mjs v --page films/kingdom/<page>.html [--stills a,b]` from `motion/`. Check frames at 0.25 s at phone size (about 360 px wide).
- **Comparison (`round-no-regression`):** build a side-by-side image of the previous version vs your test at matching beats, phone size.
  - Previous frames: `motion/out/review/anomaly-d2/` (j, p, r) and `anomaly-d3/` (jer, pen, room).
  - First-draft Pentecost stills: `motion/out/review/r10-pentecost-still-*.jpg`.
- Report brightness (mean), dark share and p2–p98 contrast per beat for both.
- First judgement at thumbnail size: **"film frame or diagram?"**

**Report under 300 words with SubagentHandback:**
- what you made;
- the comparison image path and the numbers;
- your own honest weak spots;
- still and video paths.

---

## A. Pentecost — the N172 drone (`pentecost3d.js`, `sample-r10-pentecost.html`)
1. **The drone:**
   - Built on the **first-draft aerial (commit edc61537)**. Restore its world and light exactly — `git show edc61537:motion/films/kingdom/pentecost3d.js`.
   - **Locked light:** sun 15–19°, shadows 4–6 times the figures' height, dark-brown hard shadows.
   - **Start (stage director):** about 5 m, 35° down, skimming over the crowd's long shadows (not 2.4 m over heads). People are backlit silhouettes with a thin gold rim.
   - **"슈욱":** on 「사람을 취하리라던」 it rises over the pool edge, 2 s, ease in and out.
   - **Landing:** on the edc61537 aerial framing at 「말씀대로」, still drifting up and orbiting to the end.
   - No net shape. No rope lines.
2. **The bowed wall-shadow shot (P2) is removed.** P3 (small upright Peter on the steps, backlit) is lengthened. Its last 0.6 s pushes behind the crowd's heads into the drone with the same direction and backlight.
3. **Deliverables:**
   - the full Pentecost render (973.9–989.9);
   - the 720p preview `motion/out/review/sample-r10-pentecost-720.mp4`;
   - the comparison against the first-draft aerial and d3.

## B. Jerusalem (`jerusalem-weep3d.js`, `sample-r10-jerusalem.html`) — back to 3D
1. **Start from the 3D version of fix 1:** `git show 3365dae9:motion/films/kingdom/jerusalem-weep3d.js`.
   - Also look at 9e9fa17f, the version the owner called "나쁘지 않은데", for its lens and haze.
   - Discard the 2D panorama entirely.
   - Keep `sample-r10-jerusalem.html`'s T0/T1/IDS line as is.
2. **The test covers three shots** (full scene later):
   - **J-A 「그림자의 강」 (N133):** crowd and palm-branch shadows only, cast by figures that are not drawn (the pentecost3d layer-3 method), flowing toward the city; any people are far 4–8 px dots. The camera cranes down along them. On 「그런데」 (N134) one shadow stops — his. His small figure (≤ 8 %) is backlit, opaque, behind the haze, horizon above his shoulder, rim only on head-cloth and shoulders.
   - **Q108b ruin:** the same 3D scene, **fixed camera, same framing**. Sun off, ash-grey sky, the Temple broken, three smoke columns. Cut back to the golden city on 「보살핌 받는 날을」 with his small figure in frame.
   - **N136 「산 그림자가 성을 덮다」:** the sun sinks behind the Mount of Olives; the mountain's shadow edge crosses the valley in time-lapse and swallows the city; the gold on the Temple top goes out last. Only the sun's azimuth and elevation move; no close buildings.
3. **Deliverables:**
   - stills at the key beats;
   - a short test clip of each shot (or the whole scene if simpler), with the 720p preview `motion/out/review/sample-r10-jerusalem-720.mp4`;
   - the comparison against d2 (fix 1) and d3.

## C. Mother-in-law room (`short-scenes.js` ROOM only, `sample-r10-shorts.html`) — R-A
1. **Base: the current d3 two-shot room** (door light → water-jar shadow). The window is now 162.2–170.1 (7.9 s). Line: 「베드로의 집에서는, / 열병으로 누워 있던 장모가 일어나 / 손님들을 섬겼습니다.」
2. **Door shot:** floor height, 35° off axis. The light is a parallelogram wedge across the floor. No blow-out to white.
3. **R-A on the sunlit courtyard wall:**
   - A hand-and-forearm shadow enters from the frame edge and takes her hand (Mark 1:31).
   - **Jesus rule:** hand and forearm only, at most ⅓ of her shadow's size; no body, head or profile shadow.
   - Her shadow rises, then carries the water jar out (her arm supports the jar, natural walk, ≥ 2.5 s visible).
   - Grazing light and a contact shadow on the wall.
4. **If the hand reads as a mitten at phone size**, say so plainly and deliver the polished two-shot version without the hand as well.
5. **Deliverables:**
   - stills;
   - the 720p preview `motion/out/review/sample-r10-shorts-720.mp4` (room first), or a room-only clip;
   - the comparison against d3.
6. Road and alley stay untouched.
