# 「kingdom」 10-3: 새 짧은 장면들 — 관리자 2026-11-24 "그래"
Approach 1 of part 5 is final, and its two holds are now in `script.json` (`hold` on Q114/Q115; all later `at`s moved +22.7 s). Batch 10-3 draws the scenes the round-10 script added that have no picture yet. Read `common.md`, then `shared.md` (both in this folder), then this file. Where they disagree, this file wins.

## What the owner has approved in this film so far (the bar for these scenes)
- Part 5 approach 1 (`bw-rooster-p1.js`): editing, shadows and light tell the story; figures stay small or silhouetted; one look carried through.
- The lake (`lake-peter3d-b.js`): a 3D world at dawn, one small boat, reflections, a net seen from underwater.
- Things the owner and the fresh reviewers kept catching: a trailing leg behind a robe ("tail"); shapes left behind when a figure leaves; jittering reflections; torches jumping between hand and head; men reading as nuns or veiled women (give men **broad, level shoulders** and a tied head cloth); light at the waist or groin; a figure that is a sack or a slab; ghosting from dissolves (use clean cuts or matched positions); near-still stretches.

## Common
- All times come from `script.json` `at` through `beats(B)`. Only T0 and T1 of your block are literal.
- Make your own module and page (names below). Copy code from other modules with a source comment instead of editing them.
- Portrait 1080×1920 first. Run the checks in `common.md` (frame sheets at 0.25 s on the final render, `look-check.mjs`, 720p preview in `motion/out/review/`).
- Before reporting, look at every body at phone size. Check for: no face or profile of Jesus; no halo; men read as men; nothing indecent; nothing left floating; no shaking.
- Write a sound cue table in the module header (every on-screen action with start and length, for the sound stage).
- Report as `common.md` says, plus honest weak spots. Under 400 words.

## A. 4부 「예루살렘을 보시고 우심」 N133–N137, film 494.7 → 541.2 (46.5 s). Files: `jerusalem-weep3d.js`, `sample-r10-jerusalem.html`
Lines (read `text` and `screen` in script.json): N133 the road where Jerusalem comes into view, crowds cheering "the king is coming" · N134 "예수님은 우셨습니다" · L102 + Q108 (Luke 19:42) · N135b "the city did not recognise the king of peace in front of it" · N136 "the kingdom Jesus dreamed of was lost people coming back to God" · N137 "to fulfil that dream he went into that city". The next block is part 5's chapter title C13 at 541.2 (black + small serif), so end on a calm dark-gold frame.
- **Look:** a 3D world at golden hour, with a soft pastel paint pass fixed in frame. Part 4's look is "pastel sunset"; see `pastel-children.js` and `crowd-evening3d.js`. Film references: the telephoto crowds in *Lawrence of Arabia* (heat haze, small figures); the composition of Simonet's *Flevit super illam* (1892): Jerusalem across the Kidron valley at sunset, seen from the Mount of Olives, the temple gold.
- **The beat that must land:** in the middle of a cheering crowd, one man stops and the noise drains away. Show this with the crowd going soft (defocus and slow-down) around one still back. **He never shows a face or profile.** Show the weeping by stillness, a head that bows a little, and shoulders that drop once. No tears and no hands to the face.
- Shots (suggested; you may improve them, keeping one slow named move per shot):
  1. Telephoto: a hillside road full of small figures, palm branches waving, the city glowing far off.
  2. Inside the crowd at mid distance: one back stops; the people around him blur and slow; he stays sharp.
  3. Over his shoulder (shoulder only, far right of frame) onto the city at dusk, held for the quote.
  4. Down onto the city: roofs, small people busy, no one looks up.
  5. The sun sets over the city; his back is small at the edge.
  6. His small back walks down the road toward the gate in the last light.
- No donkey close-ups. If the donkey appears, it is far and in silhouette.

## B. 8부 「오순절」 N170–N172, film 961.0 → 977.0 (16 s). Files: `pentecost3d.js`, `sample-r10-pentecost.html`
Lines: N170 "on the day the Spirit came as promised, the Peter who trembled before a servant girl stood up and preached Jesus" · N172 "that day three thousand were baptised, as the word 'you will catch men' said". The next line N173 (977) is sharing bread outside a door, in warm light.
- **Look:** 3D Jerusalem morning. Light is the subject: a moving band of light passes through the street like wind (no flames on heads, no cartoon fire, no dove). The colour turns from cool shadow to warm.
- **Peter** stands on steps above a crowd: small, backlit, recognisable in silhouette (broad shoulders, indigo head cloth). His arm may rise once, slowly. The crowd faces him, far and soft.
- **The rhyme with part 1 (required):** for N172, a high top-down shot of people coming down to a pool, gathering from all sides into the shape of the full net in part 1 (`lake-peter3d-b.js`, the underwater net shot about u 26–29). The camera rises slowly, and the gathering reads in one second as "a full net". Same overhead angle as part 1 if possible.
- End warm and bright enough to cut to N173.

## C. Three short scenes. Files: `short-scenes.js` (one module, three scenes), `sample-r10-shorts.html` (a page that plays the three back to back with 1 s black between them; record each scene's film window in the header)
1. **2부 N111, the mother-in-law, film 162.2 → 168.7 (6.5 s).** Screen note: inside a stone house, the woman who lay sick sits up; Peter's silhouette in the doorway. Look: Caravaggio/Vermeer window light in a dark room (part 2 uses a Caravaggio-lit table and `heal-village.js` for the village). She is a woman (veil), mid distance, seen from the side or back, softly lit. She sits up with real body mechanics (BODY-CHECK: hips, back, an arm pushing). Jesus is only a dark shape by the bed, back to us, or not shown. Peter is a dark doorway silhouette with broad shoulders and a tied head cloth. The previous line N44 is a 3D village road (`heal-village.js`); the next is the quote Q41 (healings) in the same village look.
2. **6부 N150, the empty road, film 699.2 → 704.2 (5 s).** "At his side, where he had said he would die with him, Peter was not there." Screen note: an empty road below the hill, only wind. Look: part 6's charcoal with one red point (`charcoal-calvary.js`; N24c before it and N25 after it are in that module). Draw it in the same charcoal hand: a road going down from the hill, dust lifting in the wind, a few dry grasses moving, and no one on it. The three crosses may be very small and far at the top edge. Slow push in.
3. **7부 N159, the alley at dawn, film 818.9 → 825.7 (6.8 s).** "The disciples, and Peter. The name of the man who denied him three times was called separately." Screen note: dawn light reaches Peter's silhouette leaning on a dark alley wall. **This continues part 5's last shot**: import `ALLEY_END` (and the alley drawing if it can be reused) from `bw-rooster-p1.js`, same camera. It starts in the same black-and-white. A thin edge of dawn light comes down the wall and reaches him, and **colour returns with that light** (warm dawn gold on the wall, then on his shoulder and head cloth). He lifts his head a little, without showing a face. Next is N160, the night lake (cool blue), so end with the light still on him.
