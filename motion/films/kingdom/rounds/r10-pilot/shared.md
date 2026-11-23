# 「kingdom」 10차 그림 — 공통 추가 지시 (common.md 다음에 읽는다)

The script was rewritten (round 10, frozen): the film now follows **Peter** from his call to Pentecost. Read `motion/films/kingdom/review.json` `logline`, `parts`, `story_spine`, and every line of your block in `motion/films/kingdom/script.json` (`text`, `at`, `screen`). All times come from `at`. Ignore the part 7 story in common.md; its rules, render steps and report format still apply. Paths in common.md are still right.

## Lessons from the last pilots (the owner's bar — do not repeat these)
- Flat 2D rigged figures, tombstone crowds in rows and stamped-ellipse foliage read as a cartoon. **Build in 3D (`lib3d/cine.js`, `kit.js`, `people3d.js`) and keep people mid/far, backlit, as silhouettes with a rim of light.**
- **Never draw close-up hands or faces.** A 2D hand read as a glowing rake and a 3D head as a mask. Tell the action with shape, light, the object and the camera. If a hand must appear, it is a dark, soft-focus silhouette at mid distance.
- A carried object must stay in the hand; a handed-over object must arrive in the other hand; nothing floats, flies in, or vanishes. Heads must not change shape or colour during a move.
- Bodies move: a person who climbs, kneels, falls or jumps uses arms and legs with fixed limb lengths (BODY-CHECK). No elevator slides, no stretching.
- No uniform texture over the whole frame (it read as rain). No grey-box architecture: irregular mud-brick, depth, haze, warm practical lights.
- At a climax the light must grow and read, never dim into a dull wide shot.
- Before you report, look at your frames against the first film and say honestly what is still weak.

## The same man in every shot
- **Peter**: a broad-shouldered fisherman, about 1.78 m, short dark beard, indigo-blue head cloth `#3b4f6b` tied with a band and ending at the shoulder, undyed tunic `#a58f6f`, rope belt. His shape must read in silhouette (broad shoulders, tied head cloth).
- **Jesus**: same clothes as other men: oatmeal robe `#c8b694`, grey-brown head cloth `#8a7a66`. Back view, far silhouette or backlit only. **No face, no profile line, even when he turns.** Never large or central, no halo.
- Men have no long hair. Women only where the text has them (veil).
- No blood or wounds on screen.

## Do not touch
Only create or edit the files your brief names. No git commits. Do not edit `C:/Project/motion-skills`. Do not download anything. Another agent is drawing a different block in this folder at the same time.
