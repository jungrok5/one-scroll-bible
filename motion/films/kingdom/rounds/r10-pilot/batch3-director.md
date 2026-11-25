# 10-3 감독안 빌드: 관리자 2026-11-26 "그래"
The owner approved the director's recommendations in `director3-plan.md`. Read all of it: the principles, the references, your scene's chosen approach, section D (script) and section E (build notes). Build **the chosen approach exactly as written**: its shot list, seconds, framing, light, colour values and text timing. Write its sound notes into the module header as a cue table.

## What was decided
- **Jerusalem:** approach 1 「그분이 보신 성」, with the tear drop on the cloak. Script proposal P-J1 (가) is applied: a new quote line **Q108b** (Luke 19:44) follows Q108.
- **Pentecost:** the director's single approach, built on the first draft's aerial. The first draft is in `git show edc61537:motion/films/kingdom/pentecost3d.js`. Also build variant B (the 1 s memory cut of part 1's net) behind a query flag, `?var=b`, so both can be compared.
- **Room (N111):** approach 1 「빈 자리, 그리고 물동이」.
- **Road (N150) and alley (N159):** stay as they are.

## The script times moved (read them, don't hard-code them)
`script.json` now has Q108b, and every `at` from N135b on is **+9.8 s**. Times come from `script.json` through `beats(B)`. Only a page's T0/T1 are literal:

| Block | Lines | Film time |
|---|---|---|
| Jerusalem | N133 → C13 | 494.7 → 551.0 (56.3 s) |
| Pentecost | N170 → N173 | 970.8 → 986.8 |
| Room | N111 | 162.2 → 168.7 (no change) |

The shorts page reads its windows from the script, so only its header comments need updating. The plan's seconds were written for the old times: map them through the lines they belong to.

## Common
- **Keep your own files:** `jerusalem-weep3d.js` + `sample-r10-jerusalem.html`, `pentecost3d.js` + `sample-r10-pentecost.html`, `short-scenes.js` + `sample-r10-shorts.html`. You may change the technique completely where the plan says so. Copy code from other modules with a source comment; never edit another module.
- **Hard limits** (`director3-brief.md`):
  - No face or profile of Jesus anywhere, including shadows and mid-turn; never large or central; no halo; no light behind his head.
  - Men read as men: broad level shoulders, and a tied head cloth that ends at the shoulder. Women wear a veil.
  - No light at the waist or groin; nothing that reads as indecent.
  - Nothing floating or left behind; no shaking.
  - One slow named move per shot; no near-still stretch over 3 s.
  - Every frame reads in 1 s on a phone.
- **Before reporting**, check the final render at 0.25 s at phone size, looking at every body and the key beats. For Jerusalem, does the ruin read as the city's future, and not as a glitch? Does the tear read as a tear, and not as rain? Then:
  - run `node motion/films/look-check.mjs`;
  - make the 720p preview at `motion/out/review/<page>-720.mp4`.
- Don't edit `script.json` or any approved page. No git commits.
- **Report** (under 350 words): what you built, the measurements, honest weak spots, and 4–6 still paths at the key moments.
