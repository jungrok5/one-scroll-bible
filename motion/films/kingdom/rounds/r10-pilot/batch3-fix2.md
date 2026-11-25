# 10-3 수정 2: 관리자 2026-11-26 "ㄱㄱ"
The fresh reviewer's check after fix 1 is in `motion/films/kingdom/review.json` under `anomaly_checks` `b3-jerusalem-f1`, `b3-pentecost-f1` and `b3-shorts-f1`. The owner approved these fixes. Keep everything else. Re-render, re-check at 0.25 s on the **final** render (phone size, every body), run look-check, rebuild the 720p preview, and report briefly with stills.

**Men must read as men in silhouette.** The head cloth is tied with a band, has a level top, and ends at the shoulder. It never falls like a veil or long hair. Shoulders are broad and level. No bumps, points or rings on any head: they read as horns, ears, a crown of thorns or a halo.

## A. Jerusalem (`jerusalem-weep3d.js`)
1. **S2 (N134):**
   - He is **small and far** (under about 15% of frame height) and off-centre.
   - He has a tied head cloth (no veil), arms in a natural hang, and a plain dark robe. No dither or blotch texture on robes anywhere.
   - The weeping must show in the body: he slows and stops, the head bows, and the shoulders drop once, visibly at that size, with the crowd flowing past.
2. **S6 (N137):** he actually **walks** toward the gate for its whole length. You can see steps in the hem and shadow, and he gets smaller. No 10 s standing.
3. **Temple and gate:**
   - The low sun goes **behind the city**, so the Temple is a backlit layered silhouette (porch, colonnades, rooftops in haze) with only a gold edge.
   - Remove the glowing patch in the gateway and the gold bar (it read as a floating cross).
   - No plain box faces in light.
4. **No near-still stretch over 3 s** (11.5–19.5 and 21–27 were still): give each shot one slow named camera move that never stops, plus smoke, birds or the light moving.
5. **Small fixes:**
   - The jump cut at 35.25 s: match positions or use a clean, motivated cut.
   - The flat wall in the top 40% at 0–3.75 s, and the light-line artifact at 3.75 s.
   - The pawn-like far figure at 12 s: a tiny clean silhouette.

## B. Pentecost (`pentecost3d.js`)
1. **Remove the foreground crowd heads entirely.** If a crowd is needed, it is far, soft and dark, or shown only by long shadows on the steps.
2. **Peter:** a **far** backlit silhouette on the steps against the bright sky. He has a tied head cloth, broad but natural shoulders (no square robot block), and his arm rises once in a natural arc with an open hand.
3. **The three thousand (N172): replace the high view with an underwater view looking up, the rhyme with part 1's underwater net** (`lake-peter3d-b.js` uwA/uwB, about u 26–29 in part 1).
   - The camera is under the surface looking up at bright, rippling morning water.
   - One after another, all across the surface, people step into the water. We see only dark soft shapes breaking the surface, feet and legs at the edge of sight, and expanding rings of light.
   - It fills until the whole surface is alive with rings, the way the net filled with fish.
   - The camera rises slowly toward the light.
   - No figures from above, no pegs, no game board. End warm and bright, so it cuts to N173 (bread shared outside a door).
4. The wind of light (s1) and the dust front stay as they are.

## C. Short scenes (`short-scenes.js`)
1. **Room (N111):**
   - Remove the second seated shadow that pops in at 3.5–4.5 s. Her single shadow rises continuously.
   - Peter in the doorway: a level head-cloth top (no bump), tied at the back, ending at the shoulder.
   - He moves slightly: a breath in the shoulders, and the hand comes off the jamb as she rises. Not a frozen cut-out.
2. **Alley (N159):**
   - Keep the approach 1 kneeling pose.
   - Make the silhouette read as a man: a short tied head cloth ending at the shoulder (nothing that reads as long hair), broad shoulders, and the forearm on the wall.
   - The dawn colour must clearly arrive: warm gold on the wall, then a warm rim on the head-cloth edge and the shoulder line.
   - Fix the outline that changes shape on the last frames.
3. **Road (N150):** more motion in 7.5–12 s (the push continues, and dust sheets cross the road), so it is never near-still.
