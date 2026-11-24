# 5부 B안 2차 — 관리자 2026-11-24
The owner chose B and said (translated): *"B is good. But in the sword section it shakes badly, in A and B, is that intended? In B the man on the left shakes too. The Lord turning to look at Peter is the overwhelming moment of this story, and it doesn't come through. Is that because it's a shadow? And of B's weak spots, especially the weeping: it's almost still. Make the viewer fully feel what Peter feels in his situation."*

These are the owner's own words: do all of it. Edit only `bw-rooster-b.js` and `sample-r10-rooster-b.html`.

## 1. Remove every tremble
The shake is in the code, from the old brief's "trembling": `shake`/`shk` with `Math.sin(t * 19/23/27/29/31/37)` on the wrist, blade, lamp position and the mask offset `MS` (which is why the man on the left shakes). **Delete all of it.** The sword's tension in N144 is now stillness: the blade's shadow holds dead still while a torch slowly swells.
Flame flicker may change **brightness only**, slowly (under about 1.2 Hz). No shadow, mask, figure or lamp position may move at flicker rate. Remove the procession's `abs(sin)` bob or make it a calm walking rise and fall. Report a frame-to-frame check that no shot has a repeating side-to-side motion above 2 Hz.

## 2. More time for the two moments
These two beats need silence. In this page only, insert holds with a local time map (do **not** edit `script.json`; record the amounts in the module header and report them, I will apply them when integrating): the look (Q114) runs about **12 s** instead of 4.7 s, the weeping (Q115) about **20 s** instead of 8.6 s. The block becomes about 104 s. Captions stay on their lines for the longer time, and Q114's caption appears only as he finishes turning.

## 3. The look (Q114): the climax of the film's first half. Not a shadow.
The viewer must feel **being looked at**. Build it as a classic eyeline sequence, with the camera as Peter's eyes:
- **R5a, Peter (about 2.5 s).** Close, low, near the fire: Peter's dark head and shoulders in profile (his profile is allowed: beard, tied head cloth), one thin orange rim of firelight on brow and beard. After the rooster he has frozen mid-word. His head slowly lifts and turns toward something across the yard.
- **R5b, what he sees: Peter's point of view (about 6–7 s).** Across the dark courtyard, a line of guards with torches leads a bound man along a raised walkway. Everyone keeps walking. **He alone stops.** The guards drift on and their torchlight leaves him. Slowly (about 2 s, shoulders first, then the head) he turns until he **faces us square on**. A frontal black silhouette has no features and no profile line. **During the turn, keep his head outline round with the head cloth so no nose or brow ever shows; if needed, let the head turn while he is darkest.** Then nothing moves. A very slow push-in while everything around him falls away into black, until he is alone in the dark. He stays small: **never more than about a quarter of the frame height, placed a little above centre**, no halo (no light source directly behind his head; only a faint edge on one shoulder). Hold his gaze at least 4 s. This must be the stillest, most silent shot of the film.
- **R5c, Peter receives it (about 3 s).** The same close framing as R5a, but now he is facing that gaze. **The orange drains out of the rim on his face until the frame has no colour left**: the only colour in this block dies here. One small jolt through the shoulders, then his head sinks.

## 4. The weeping (Q115): the viewer must break with him
No frozen pose. Tell it in three movements, all silhouette, all with real body mechanics (BODY-CHECK, fixed limbs, nothing sliding):
- **R6a, flight (about 3–4 s).** He lurches up and away. We see **his huge shadow stumbling along an alley wall**, uneven steps, one hand dragging on the stone.
- **R6b, the fall (about 3 s).** He hits the wall, his hand flat on it, his knees give, and he drops to his knees in the empty alley, side-on.
- **R6c, the weeping (about 13 s).** Sobbing is **irregular**, never a sine wave: a sharp catch of breath lifts the shoulders (about .4 s), then the whole back collapses forward (about .9 s), a pause, a smaller shudder, a longer pause, then a bigger one. Three or four great heaves. At the worst of it his head goes back for one moment in a silent cry, then he folds all the way forward, **forehead toward the ground, both arms wrapped over his head**. After that only the ragged breathing slows.
  **His breath is visible.** John 18:18 says the night was cold: in the grey dawn light, a small puff of vapour bursts from him on each sob, and the puffs get smaller at the end. This gives the shot life and tells us how hard he is breathing without showing a face.
  Camera: starts close, then one long slow pull back and up over the whole shot, until he is a very small dark shape at the foot of an enormous wall, and a line of grey dawn creeps down the wall toward him and stops just above him. No colour at all. The silhouette must always read as a man: no rounded hip hump.

## 5. B's other recorded weak spots
- R3: Peter's shadow turning away must read in one second (shoulders and head together, a clear change of shape).
- R2e: the led man must read as **seized**, not as people holding hands: guards' hands grip his upper arms, his wrists bound in front, his head slightly bowed.
- R2b: the bark reads like cloth or hair. Make it coarser, drier and less stringy, lower contrast.
- R4: make the dawn a thin line, and give the roofline a little irregular detail.

## Check before reporting
The Safety list in `rooster-b.md` still applies (nothing indecent at phone size, no flame at a groin, no face or profile for Jesus, no halo, no blood). Look at R5b and R6c every 0.1–0.25 s. Run look-check, render, make the 720p preview, and report what changed, the hold amounts, and honest weak spots, with stills of R5a, R5b (mid-turn and full gaze), R5c, R6b and three moments of R6c.
