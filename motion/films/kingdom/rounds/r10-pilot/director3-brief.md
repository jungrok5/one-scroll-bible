# 감독 브리프 2 — 「kingdom」 10-3: 예루살렘에서 우심 · 오순절 · 장모가 일어남
The owner asked for a film director again, as in part 5. Their words on 2026-11-26, after the third version of these scenes: *"5부 때처럼 영화감독 에이전트에게 장면별 연출안을 먼저 받아 보자."* (Like part 5, let's get a scene-by-scene direction from a film-director agent first.)

**Your job is design, not code.** Write a shot-by-shot direction the animators can build. Do not edit project files. Write your answer to the path given in your prompt.

## The film
- 「kingdom」 is an 18-minute Korean film about the kingdom of God, told along Peter's path in 8 parts: the call at the lake → misunderstanding the King → the night he denies Jesus → the cross → the dawn restoration → Pentecost.
- Read `motion/films/kingdom/script.json` (`text` = narration or verbatim quote, `screen` = the planned picture) and `motion/films/kingdom/review.json` (`logline`, `parts`, `story_spine`).
- **Main audience:** Korean Christians aged 55 and over who don't know the Bible well. About 43% watch on TV, the rest on phones. **Portrait 1080×1920 is the main version.**
- The words reach the viewer through the narration voice, plus the screen text (subtitles; verbatim Korean Bible quotes sit in a band at the bottom). The previews you can see have **subtitles but no voice yet**.

## What the owner has approved in this film (the bar)
- **Part 5, approach 1 「뜰 건너 한 시선」** (your earlier plan, `director-plan.md`; built as `bw-rooster-p1.js`). Black and white with fire orange; shadows on walls; editing (eyeline, reaction shot, memory); small silhouettes.
- **The lake** (`lake-peter3d-b.js`): a 3D world at dawn, a small boat, reflections, the net seen from underwater.
- **Kept from batch 10-3:**
  - N150, the empty road in charcoal.
  - N159, the alley at dawn: colour comes back with the light, continuing part 5's last shot.
  - Both stay as they are. Don't redesign them.

## The three scenes you own, and what the owner said
Videos (720p portrait) are in `motion/out/review/`: `sample-r10-jerusalem-720.mp4`, `sample-r10-pentecost-720.mp4` and `sample-r10-shorts-720.mp4` (the room is the first 6.5 s). Stills are in the same folder: `jerusalem-r10-fix2-*.png`, `r10-pentecost-f2-*.jpg`, `sample-r10-shorts-room*.jpg`, and `director3/pentecost-v1-aerial.jpg` (the first draft's aerial).

The fresh reviewers' checks are in `review.json` `anomaly_checks`:
- Jerusalem: `b3-jerusalem`, `-f1`, `-f2`
- Pentecost: `b3-pentecost`, `-f1`, `-f2`
- Room: `b3-shorts`, `-f1`, `-f2`

In short: **code-drawn people at middle distance keep reading as game pieces, mannequins, cut-outs or sacks**, and the underwater "three thousand" reads as a microscope slide.

### A. Part 4 「예루살렘을 보시고 우심」: N133 → N137, film 494.7 → 541.2 (46.5 s; then C13, part 5's title on black)
- **Lines:**
  - N133: the road where Jerusalem comes into view, with crowds cheering "the king is coming".
  - N134: "예수님은 우셨습니다".
  - L102 + Q108 (Luke 19:42).
  - N135b: the city did not recognise the king of peace in front of it.
  - N136: the kingdom Jesus dreamed of was lost people coming back to God.
  - N137: to fulfil that dream he went into that city.
- **Owner:**
  > 영상 자체는 나쁘지 않은데 무엇을 표현한 건지 이해가 안 돼. 예수님 왜 우시지? 성경 내용도 잘 이해가 안 됨. 앞뒤 내용이 아직 없기 때문인가.

  The picture is not bad, but they can't tell what it shows or **why Jesus weeps**.
- **This is the main problem to solve.** The picture must make the *reason* felt, even before the voice is added.
  - Read Luke 19:28–44 (the cheering of v. 37–38, the weeping of v. 41–42, the coming ruin of v. 43–44).
  - Read the film's own reasons: the crowd wants a king who will overthrow Rome (part 3: the disciples misunderstood the King). The kingdom is lost people coming home (part 4: Zacchaeus, Q19c "인자가 온 것은 잃어버린 자를 찾아 구원하려 함이니라").
  - Decide what the viewer must *see* so that "he wept" lands.
- You may propose small script changes (one narration line, a different quote, a reordering), **marked clearly as a proposal**. Only the owner can approve script text.

### B. Part 8 「오순절」: N170 → N172, film 961.0 → 977.0 (16 s; then N173, bread shared outside a door in warm light)
- **Lines:**
  - N170: on the day the Spirit came, the Peter who trembled before a servant girl stood up and preached Jesus.
  - N172: that day three thousand were baptised, "as the word 'you will catch men' said".
- **Owner:**
  > 2번 영상도 나쁘지 않은데 세례는 3천 명 모이던 항공샷이 더 좋아.

  The current version is OK, but for the baptism they prefer the first draft's aerial shot of the three thousand gathering (`director3/pentecost-v1-aerial.jpg`).
  - **Keep that aerial idea**: a top-down pool, people streaming in from all sides into the shape of a full net.
  - Design how to make it cinematic: no pegs or game-board look, with light, haze, scale and camera, and the rhyme with part 1's full net.
- **N170 (Peter preaching):** design it as well. Keep what works: the morning street, the moving band of light like wind, and the far backlit Peter.

### C. Part 2: N111, the mother-in-law, film 162.2 → 168.7 (6.5 s)
- **Context:**
  - Before: N44 "왕이 오신 곳에서는 무슨 일이 일어났을까요?", a 3D village road.
  - N111: "베드로의 집에서는, 열병으로 누워 있던 장모가 일어났습니다."
  - After: Q41, the healings (Luke 7:22), in the same village look.
  - So N111 is the first sign of the King **in Peter's own house**.
- **Owner:**
  > 장모 일어나는 부분만 다른 형태로 바꿔 보면?

  They want a different form for her rising. They also asked how it connects to "베드로는 없었습니다" (N150). It doesn't follow N150: the preview just played the three short scenes back to back. But if a quiet echo across the film helps, you may say so, for example the house, the doorway, or Peter's place beside Him.
- **Current version:** a woman's shadow on a sunlit wall rises, and Peter is a silhouette in the doorway. The reviewers said:
  - she rises like a hinged board;
  - Peter is a flat, frozen cut-out.

## Hard limits (design within them)
1. **Jesus:**
   - Never a face, features or profile line, including in shadow or mid-turn.
   - Never large or central. No halo, and no light directly behind his head.
   - Back view, far silhouette, or backlit only.
2. **Figures are code-drawn** (2D canvas, or simple 3D bodies). They fail at middle distance and up close: they read as dolls, pegs, cut-outs or sacks. **Get your power from light, darkness, composition, scale, time of day, camera, editing, sound, silence, symbol objects and texture**, not from detailed bodies. You may change the technique completely. For example:
   - a painted 2D look where figures have read well before (Doré engraving, Rembrandt oil, charcoal, shadow theatre);
   - layered painted planes with a camera moving through them;
   - extreme close-ups of objects and light;
   - a single take.
3. **Every frame must read in one second on a phone.** No symbolism that needs explaining; the owner has rejected "what does this mean?" shots several times.
   - Nothing that could read as indecent, and no light at the waist or groin.
   - Men read as men: broad level shoulders and a tied head cloth ending at the shoulder, never a veil-like fall. Women wear a veil.
   - Light points at the line's subject.
4. **One slow named move per shot** (from `C:/Project/motion-skills/cinecode/references/camera-moves.md`).
   - No stop-and-go, and no near-still stretch over 3 s unless the stillness is the point and something still breathes.
   - No shaking.
5. Sound is designed later (a cello theme for Peter; the first film's bar is soft and warm). You may specify sound and silence.
6. The scene must hand off cleanly to its neighbours:
   - Jerusalem: from part 4's pastel sunset, ending calm, dark gold, into C13 on black.
   - Pentecost: ending warm and bright, into N173.
   - Room: from and back to the 3D village.

## What to deliver
1. **Read first:**
   - the script;
   - `motion/films/README.md` sections 7–9 (look and lessons);
   - `C:/Project/motion-skills/canvas-film/references/SCENE-RULES.md`;
   - `STYLE-INDEX.md` (the OPUSCAR film-look table);
   - `cinecode/references/camera-moves.md`;
   - your own `director-plan.md` (part 5).

   Then look at the videos and stills. Name your references (paintings and films, such as Simonet's 「Flevit super illam」, Doré, Tissot, Rembrandt, Ford, Lean, Malick, Tarkovsky, and others), and what you take from each.
2. **Jerusalem: two or three distinct approaches.** For each:
   - the idea, and **how the viewer understands why he weeps**;
   - a shot list with seconds, portrait framing, camera move, light, what moves, the text on screen, and sound or silence;
   - what we never have to draw well;
   - risks.
3. **Pentecost: one approach, built on the aerial**, plus N170. Use the same detail as item 2.
4. **The room (N111): one or two approaches** for her rising. Use the same detail as item 2.
5. **Your recommendation per scene**, why it serves this audience, and any script proposals, kept separate.
6. **A short build note for the animators:** what existing code to reuse, what is new, and what must be measured.
   - Jerusalem: `jerusalem-weep3d.js`.
   - Pentecost: `pentecost3d.js`; get the first-draft aerial with `git show edc61537:motion/films/kingdom/pentecost3d.js`.
   - Room: `short-scenes.js`.
   - Also: `lake-peter3d-b.js` and `bw-rooster-p1.js`.

Write in Korean (shot terms in English are fine). Be concrete: seconds, positions in a 1080×1920 frame, light direction, colour values.
