# 감독안 세 가지 제작: 관리자 2026-11-24 "3가지 안 전부 진행해봐"
The owner wants all three of the director's approaches built so they can compare them side by side. The design is `motion/films/kingdom/rounds/r10-pilot/director-plan.md`. Read all of it: section 0 (diagnosis), 1 (references), 2 (shared base), your approach's section, and 7 (build notes). Build **your approach exactly as written**, including its shot list, seconds, framing, light, colour values, the text timing and the sound notes (write the sound notes into the module header as a cue table for the sound stage).

## Common to all three
- **Start from version B:** copy `motion/films/kingdom/bw-rooster-b.js` and `sample-r10-rooster-b.html` to your own pair of files (names below). Keep everything before film 606.2 (upper room, garden, procession, courtyard) as it is in B. From 606.2 on, build your approach. B's files must stay unchanged, because the owner compares against them.
- **Open questions, decided by the director's recommendations** (the owner did not object): the memory voice reuses the existing line N141 「오늘 닭이 울기 전에, 네가 세 번 나를 모른다고 할 것이라고」 as an echo (sound stage; show the timing only, and do not change `script.json`). Holds are as your approach specifies (approach 1: Q114 +11.3 s, Q115 +11.4 s; for approaches 2 and 3 use the plan's seconds, and record the hold amounts in the module header). The Q115 caption leaves after about 3 s where the plan says so.
- **Hard limits** (`director-brief.md` and `shared.md`): no face or profile line of Jesus in any frame, including shadows and mid-turn; never large or central; no halo; no light behind his head; no light at anyone's waist or groin; nothing that reads as indecent at phone size; men read as men; no shaking (no motion above about 2 Hz except the fire); no close-up hands or faces in action; one slow named move per shot; continuous motion with no stop-and-go.
- **Quality:** look at your own frames at phone size against the first film's bar (cinematic, light as the subject). Before reporting, check the key moments at 0.25 s on the **final** render: the look, the turn, the weeping, and every body. Run `node motion/films/look-check.mjs`. Make the 720p preview at `motion/out/review/<page>-720.mp4`.
- Do not edit `script.json`, any B or A file, or another approach's files. No git commits.
- **Report:** what you built, the hold amounts, the measurements, honest weak spots, and 6–8 still paths at the key moments.

## Your files
- Approach 1 「뜰 건너 한 시선」: `bw-rooster-p1.js`, `sample-r10-rooster-p1.html` (also export the `FIRE_OTS` and `ALLEY_END` constants as the plan says).
- Approach 2 「등 뒤의 카메라」: `bw-rooster-p2.js`, `sample-r10-rooster-p2.html`.
- Approach 3 「숯불」: `bw-rooster-p3.js`, `sample-r10-rooster-p3.html`.
