# 10-3 감독안 수정 1: 관리자 2026-11-26 "응 제안한 방향으로 고쳐줘"
The fresh reviewer's check of the director builds is in `motion/films/kingdom/review.json` under `anomaly_checks`: `b3-jerusalem-d1`, `b3-pentecost-d1` and `b3-room-d1`. Its frames are in `motion/out/review/anomaly-d1/`. The owner approved the fixes below. Keep everything else, and keep the rules in `batch3-director.md`.

Re-render, then re-check the **final** render at 0.25 s, at phone size, looking at every body. Run look-check, rebuild the 720p preview, and report briefly (under 300 words) with stills. No commits.

## A. Jerusalem (`jerusalem-weep3d.js`)
1. **The ruin:**
   - Remove the cloud-shadow wipe.
   - On Q108b, cut cleanly from the golden city to the **same composition, same camera** drawn as the charcoal ruin. The Temple's place is a heap, the walls are broken, and smoke rises.
   - Hold the ruin, then cut cleanly back to the golden city on 「보살핌 받는 날을」.
   - The positions match exactly: no seam, no ghosting and no dissolve.
   - The ruin's ground has no flat band edge, and the sky stays the same sky.
2. **The tear:** remove the cloak macro shot (J3). Give its time to J2: the shadow stops, then the head bows and the shoulders drop. Make the bow visible at phone size, and keep the crowd flowing past.
3. **The crowd:** walkers read as men. Each has a tied head cloth with a level top that ends at the shoulder, and broad level shoulders. No hooded cone cloaks. He keeps the same tied-head-cloth shape in every frame: no veil-like fall, and no knob.
4. **J5:**
   - Drop the grey box houses, the shutters and the door.
   - Replace them with the city seen from the ridge at dusk: lit windows go dark one by one across the city, from near to far, until only a few remain.
   - Soft, dark silhouettes only. No plain box faces in light.
5. **Motion and other fixes:**
   - **No near-still stretch over 3 s** (12.25–19.5 and 50.5–54.5 were still). Give each shot one slow named move that never stops.
   - **J6/J7:** make them two clearly different shots (no jump cut), and make the city's shadow edge and the lamps visibly move.
   - **Small fixes:**
     - Remove the lollipop trees and the dark lump in front of the wall.
     - Make the white subtitles readable over the bright sand.
     - Remove the brightness pump at 19.75 s.
   - **The ending:** end on dark gold, about 55, as the plan says.

## B. Pentecost (`pentecost3d.js`)
1. **The aerial (P4):**
   - Go back to the first draft's aerial look from `git show edc61537:motion/films/kingdom/pentecost3d.js`: small figures with their shadows, the pool and the city. The owner liked that one.
   - Change only these:
     - The crowd streams in from all sides and fills in the shape of a full net or funnel converging on the pool.
     - Warmer low light, a soft haze over the city edges, and a slow crane up.
     - Rings on the water spread smoothly, with no pop.
     - The pool is not stuck to the subtitle.
   - No dense hatching shadows, no pill-shaped pool and no bubble rings.
2. **P2, Peter's shadow on the wall:**
   - He reads as a man: a tied head cloth with a level top that ends at the shoulder, and broad level shoulders.
   - The crowd shadows read as men's heads and shoulders, not as tombstones.
   - Make the straightening visible: he rises from bowed to upright. Then his arm rises.
3. **Small fixes:** remove the left-wall exposure jump at 2 s. Make the gold lines on the steps visible, or remove them.
4. **Remove variant B** (the net memory cut) and its `?var=b` path. Delete `motion/out/review/sample-r10-pentecost-b-720.mp4`.

## C. Room (N111, `short-scenes.js`)
1. **r1:**
   - The bed must clearly hold **a lying woman under a blanket**: a readable body shape with head, shoulder, hip and knees, the head on a raised end, and the madder veil around the head. She lies on her side or back, softly lit by the door light when it arrives. No snowy hills and no sand heap.
   - Her fever shows in a slow, visible breath.
   - Replace the white ceiling bar with a soft window slit, and make the niche jar read as a jar.
2. **r2:**
   - The empty bed: the blanket is thrown back, the mat shows her pressed shape, and the light lies on it. It must read as "she got up", not as a sand heap. The bowl reads as a bowl, not a hole.
   - Make her shadow carrying the water jar across the courtyard wall **large and clear** at phone size. That is the beat that works.
   - Remove her crossing in the doorway (it read as a crouching cut-out), and remove the floating dark bar in the door frame.
3. Road and alley stay untouched.
