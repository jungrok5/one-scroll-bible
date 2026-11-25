# 10-3 수정 1: 관리자 2026-11-25 "응"
The fresh reviewer's check of the first drafts is in `motion/films/kingdom/review.json` under `anomaly_checks` `b3-jerusalem`, `b3-pentecost` and `b3-shorts`. It found **9 MAJOR** issues. The root cause is the same in all three: **3D people at middle distance read as mannequins, game figures, paper cut-outs or sacks.**

The owner approved this direction, which is the method that worked in part 5, approach 1 (`bw-rooster-p1.js`): **tell it with shadows, silhouettes, light and editing, not with detailed bodies.**
- A person is either:
  - a **cast shadow** (long, on a lit wall or ground);
  - a **far small silhouette** (under about 12% of frame height) against a bright sky or wall;
  - a **backlit silhouette** with only a thin rim of light.
- No mid-distance 3D bodies with visible surfaces, and no top-down crowds of little figures.
- Shadows must still obey the body: legs stride, shoulders are broad and level, and the head cloth is tied.

Keep your files, timings and everything that worked. Re-render, re-check at 0.25 s on the **final** render (phone size, every body), run look-check, rebuild the 720p preview, and report briefly with stills.

## A. Jerusalem (`jerusalem-weep3d.js`)
1. **The procession as shadows:** low sun from behind the crowd. Long shadows of walkers and raised palm branches stream along the road or a wall. **One shadow stops** while the others flow past it and on. Its head bows a little and its shoulders drop once. This is the beat of N134. Crowd sound and speed drain, the light stays warm. Never a face or profile, even in shadow.
2. **The shoulder shot is cut.** For the quote, show a far, small, backlit back on a ridge at the frame edge, and the city across the valley at sunset. The city is a layered silhouette with depth, haze and the Temple's gold catching the last light. No plain boxes in strong light.
3. **No near-still stretch:** in 12–17 s, keep something moving (a slow named camera move plus smoke, birds or the light).
4. **No top-down street of figures (N135b).** Show the city's roofs and lamps from the ridge at a low angle: small lights, smoke, washing on lines, and no one looking up. People are tiny far shadows or lit windows only.
5. **N137:** his small far silhouette walks down toward the gate. Show a stride in the hem or in the shadow. He is not centred and no light column stands above him.
6. Label and reference contrast: the new top shade in `lib-film.js` already handles the label. Keep the reference readable.

## B. Pentecost (`pentecost3d.js`)
1. **Peter:** a backlit silhouette against the bright sky or sun on the steps, with broad level shoulders, a tied head cloth and a thin rim. His arm rises once. The crowd are dark backlit heads and shoulders only, soft, in the foreground, and they read as men (no bald capsules).
2. **The wind of light:** a visible band or front moving through the street (dust lit in a moving band, shadows lifting off the walls in a sweep). It must not be a whole-frame exposure jump.
3. **The full net (N172):** low sun. People are shown as **long shadows streaming from all directions onto the pool steps**. Their shadow lines cross and form a mesh, like the net's cords, converging on the bright water. Use a high angle, but not straight down and not toy-like. The water is dark and glittering. Ripples spread smoothly with no pop. Keep the city soft or in haze so it does not look like a board game.

## C. Short scenes (`short-scenes.js`)
1. **Room (N111):**
   - The woman becomes a **shadow play**: her shadow on the sunlit wall rises from lying to sitting, with real body mechanics (the back curls, an arm pushes).
   - Her body itself stays in darkness, or shows as only a soft dark edge. No glowing oval head and no blanket lump.
   - Peter in the doorway is a soft backlit silhouette: broad level shoulders, a tied head cloth falling to the shoulder, feet hidden by the threshold. No hook on the head and no button feet.
   - Keep brightness at or above 78.
2. **Road (N150):**
   - The wind visibly moves: stronger gusts, dust drifting in sheets across the road, grass bending in waves.
   - A slow push continues, so nothing stays near-still for more than 2 s.
   - The charcoal grain is fixed paper texture, the same every frame. Only the drawn things move.
   - Remove the dark line on the crest.
3. **Alley (N159):**
   - Keep the approach 1 pose (the owner keeps it).
   - The head cloth stays **dark** and is never lit blue. The dawn light touches only a thin warm rim along the head cloth's edge and his shoulder line. Colour returns on the wall and in that rim.
   - His shape must read: head bowed against the wall, forearm on the wall, shoulders.
   - The subtitle must be readable. Add the bottom band, and make sure it is not lost over his dark body.
   - In the last 3 s, keep something moving: the light edge moving on, his head lifting a little, motes in the light.
