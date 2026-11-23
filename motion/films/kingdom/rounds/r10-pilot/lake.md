# 호수 한 벌 — 1부 첫 부르심 · 7부 다시 부르신 아침 (one lake, two mornings)
Blocks: **A** film 50.8 (N101) → 117.6 (C10): N101, N102, N103, N104, N105, N106, L100, Q101, N107, Q102, N108.
**B** film 803.0 (N160) → 896.0 (C5): N160, N161, N162, N163, N163b, N164, L106, Q117, L109, N165, N166, Q118, N167, Q120, N168.
Your files: `motion/films/kingdom/lake-peter3d.js` (one module, both blocks: build/draw/beats), `motion/films/kingdom/sample-r10-lake1.html` (T0 50.8, T1 117.6), `motion/films/kingdom/sample-r10-lake2.html` (T0 803.0, T1 896.0). Pattern: sample-part5d.html. Build on the film's approved Galilee: read `motion/films/kingdom/galilee3d.js` (terrain, water, dawn palette, mist) and reuse its world so block A continues straight from the opening shots. Copy what you need into your module; do not edit galilee3d.js.

**What this pair must do:** the two blocks are a rhyme. The viewer should feel "the same morning again" in block B, and then see what is different. **Use the same camera setups for the matching shots** (empty net, net filling, the boat from the shore).

| beat | block A (first call) | block B (again) |
|---|---|---|
| empty net | N103: before dawn, net comes up with only water | N161: same shot, same angle |
| the word | N104: Jesus seated in the boat, back view, points to deep water | N162: a small unrecognisable figure on the far shore in mist |
| the catch | N105: seen **from under the water**, looking up at the hull: silver fish pour into the net, teal caustics, shafts of light, **mesh tears** | N163/N163b: same underwater shot, the net **strains and holds**, dragged toward shore |
| Peter | N106/Q101: among leaping fish he falls to his knees before the seated figure (silhouette, real body mechanics) | N164: he wraps his cloak and jumps in, wades ashore, small in the frame, spray in the low sun |
| after | N107 Jesus stays; Q102 Peter lifts his head, people on the far shore; N108 boats drawn up, torn net left on the sand, small figures walk away up the road | Q117: the charcoal fire on the shore, fish and bread on it, small warm light as the hero of the frame |

**Block B continues** after the catch:
- Q117, N165: slow push to the fire. On N165 the fire **dissolves for about 2 s to the black-and-white night courtyard with its orange fire** (same place in frame, a match on the flame; a simple dark courtyard with seated silhouettes is enough, the other agent draws the full scene), then back to dawn.
- N166, Q118, N167, Q120: two silhouettes on either side of the fire, wide and low, Jesus' back to us. The light grows in steps so slow they cannot be seen: blue dawn → gold → the sun clears the hills on Q120 and fills the lake. Peter's bowed shoulders slowly lift on N167.
- N168: wide: two small figures side by side on the shore, looking toward the road. Hold, then ease out.

**Look:** the approved painted 3D Galilee (deep blue before dawn → gold). For the underwater shots: 「셰이프 오브 워터」(2017, OPUSCAR 90) teal caustics, light shafts from above, real depth; `cinematic-3d` for water, volumetrics and bloom. Fish are many small silver shapes that flock and flash (`swarm-world` for motion). Camera moves from `cinecode/references/camera-moves.md`. The fire is the only warm point until the sun rises.
Render and check both pages.
