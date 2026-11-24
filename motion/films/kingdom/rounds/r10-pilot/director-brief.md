# 감독 브리프 — 「kingdom」 5부 「닭이 울 때」, 베드로가 무너지는 순간
You are the film director called in by the owner. Their words: *"영화감독 불러와봐. 진짜 베드로의 감정이 보는 사람한테도 전달될 카메라 구도나 여러가지 다 써줘. 기법을 완전 바꾸든."* (Bring in a film director. Write out the camera framing and everything else that will make the viewer truly feel Peter's emotion. Change the technique completely if needed.)

**Your job is design, not code.** Write a shot-by-shot direction the animators can build. Do not edit project files. Write your answer to the path given in your prompt.

## The film and the moment
- 「kingdom」 is an 18-minute Korean film about the kingdom of God, told along Peter's path: his call at the lake → misunderstanding the King → **the night he denies Jesus (part 5)** → the cross → the morning by the charcoal fire when Jesus restores him → Pentecost. Read `motion/films/kingdom/script.json` (part 5 = film 541.2–627.3, lines C13 through Q115; also part 7, lines N160–N168, the restoration that this scene must set up) and `motion/films/kingdom/review.json` (`logline`, `parts`, `story_spine`).
- **Main audience:** Korean Christians aged 55 and over who don't know the Bible well. About 43% watch on TV and the rest on phones; the portrait 1080×1920 version is the main one. The words come from narration and the screen text (verbatim Korean Bible quotes in a band at the bottom).
- **The beat you own: film 606.2 → 627.3 plus holds**, which is the third denial, the rooster, **「주께서 돌이켜 베드로를 보시니」 (Luke 22:61)** and **「밖에 나가서 심히 통곡하니라」 (Luke 22:62)**. Holds are allowed: the look may take about 12 s and the weeping about 20 s, or more if you argue for it. The owner considers **the Lord turning to look at Peter the overwhelming moment**, and wants the weeping to make the viewer feel what Peter feels: he swore he would die with Him, three times said "I don't know Him", and then was seen.
- The block before yours (upper room, sword, courtyard fire, servant girl) is approved in spirit: black-and-white with **the orange of fire as the only colour**, a real night, action told through **shadows thrown on walls by fire**. The owner chose this "B" version over a 3D version whose figures looked like dolls.

## What the current version does, and why it is not enough
Frames are in `motion/out/review/director/` (`b4-<seconds>.jpg`). The 720p video is `motion/out/review/sample-r10-rooster-b-720.mp4`; in it, the look is 1:12–1:23 and the weeping 1:23–1:45.
- **The look:** Peter's profile lifts → POV across the yard through a stone arch: a small faceless silhouette stops, turns to face us → a 1 s cut to Peter frozen → back to Him, closer → Peter's profile with the orange rim draining out of colour. A fresh reviewer said it reads with the caption, but the frontal silhouette is a stiff small shape that could just as well be his back.
- **The weeping:** one continuous shot: he staggers in, crouches against a wall, kneels, sobs (shoulders heave), folds forward, with a slow pull-back. The crouch reads like a man with a stomach ache, so it is being cut. The sobbing at the end works, but it is a small dark shape in front of a grey wall. It does not break the viewer.

## Hard limits (do not design around these: design within them)
1. **Jesus:** never a face, features or profile line, including in a shadow. Never a large central figure, no halo, no light directly behind his head. Back view, far silhouette, or backlit only.
2. **Figures are code-drawn** (2D canvas silhouettes, or simple 3D "robeMan" bodies). They fail whenever the camera is close on bodies, hands or faces in action: they read as dolls, cut-outs, or something unintended. Peter's own profile may be shown (beard, tied head cloth), but up close it tends to look comic. Your design must get its power from **light, darkness, composition, scale, timing, camera, editing, sound and silence, symbol objects, texture**, not from detailed acting.
3. Every frame must read in one second on a phone. No symbolism that needs explaining (the owner has rejected "what does this mean?" shots several times). Nothing that could read as indecent. Men must read as men. Light must point at the line's subject.
4. One slow named move per shot (from `C:/Project/motion-skills/cinecode/references/camera-moves.md`); no stop-and-go; nothing frozen longer than 3 s unless the silence is the point and something still breathes.
5. Sound is designed later (music: a cello theme for Peter; the first film's bar is soft and warm, with at most two big swells in the whole film). You may specify sound and silence, and you should.

## What to deliver
1. **Read first:** the script, `motion/films/README.md` sections 7–9 (look and lessons), `C:/Project/motion-skills/canvas-film/references/SCENE-RULES.md`, `STYLE-INDEX.md` (the OPUSCAR film-look table) and `cinecode/references/camera-moves.md`. Look at the frames. Study how great films stage denial, a look, and weeping without showing a face: think of Rembrandt's 「The Denial of St Peter」 (1660), Caravaggio, Dreyer, Bresson, Tarkovsky, Kurosawa, Kieślowski, Lee Chang-dong, the first film of this channel, and other references of your own. Name them and what you take from each.
2. **Three distinct approaches**, each a complete direction for 606.2 → end of the weeping, with one approach allowed to abandon the current technique entirely (for example extreme close-ups of objects and light, a single-take, sound-led darkness, painting-like tableaux, macro firelight, a cut to black). For each:
   - a one-paragraph idea, and the feeling it puts in the viewer;
   - a **shot list** with seconds, framing (portrait), camera move, light, what moves, the text on screen, and sound or silence;
   - why it gets past limit 2 (what we never have to draw well);
   - risks.
3. **Your recommendation**, and why it serves this audience. Include how it sets up part 7 (the charcoal fire at dawn, "네가 나를 사랑하느냐", the same shot echoed, the colour returning).
4. A short **build note for the animators**: which existing elements to reuse (the fire, the wall shadows, the stone arch), what is new, what must be measured.
Write in Korean (shot terms in English are fine). Be concrete: seconds, positions in a 1080×1920 frame, light direction, colour values.
