# 「kingdom」 7부 「왕을 모신 사람들」 — portrait pilot, shared brief

Repo: `c:\Project\one-scroll-bible` (Windows; Bash and PowerShell both available). Film folder `motion/films/kingdom/`.
You are one of three agents drawing one scene each, in parallel. Do **not** git commit, push, or edit files other than your own
new files listed in your scene brief (the main session integrates). Do **not** edit `C:/Project/motion-skills` (copy code into
the film folder with a source comment instead). Do not download anything from the internet.

## What this film is
Korean film for YouTube Shorts/TV. Main audience: Christians 55+ who don't know the Bible well; 43 % watch on TV, but the
**portrait 1080×1920 version is the main one** — compose for it first. The film answers "what is the kingdom of God?"; part 7
shows **how a person who has received the King lives** — Zacchaeus (Luke 19) → Matthew 25 ("the least of these") → the
kingdom completed. The feeling of the part: 찔림 → 다짐 (being pricked → resolving to live that way). Key line N34:
"착해져서 왕을 만난 것이 아니라, 왕을 만나서 달라진 것입니다."

## The bar — the channel's first film (cinematic, never illustration)
Space with a camera moving through it; **light is the protagonist** (a source that blooms like a lens) and it points at the
line's protagonist; small people in a vast world but the protagonist reads in 1 s on a phone; restraint (dark calm palette,
empty space, grain, vignette). No poster / cartoon / game / infographic look, no counters or labels drawn in the art.
Every look comes from a film or a painting.

## Read first (fast — skim, then work)
- Read **`motion/films/kingdom/script.json`** (lines array): your lines' `text`, `at` (film seconds) and
  `screen` (what must be on screen during that line — the shot table; draw exactly that, line by line).
- Pattern to copy: `motion/films/kingdom/sample-part5d.html` (page: scene table, dissolves via offscreen canvas, text band,
  Film.sub / Film.quote / Film.label / chapter title, all times from script `at`, `Pilot.run`), and a 3D-with-paint-pass module:
  `motion/films/kingdom/pastel-children.js` (+ `people3d.js` for figures with two-bone IK, walk/idle/pose; `../lib3d/cine.js`, `../lib3d/kit.js`).
  Other modules worth a look: `roof-table-3d.js` (3D + oil pass), `gold-world3d.js`, `crowd-evening3d.js`, `olivet3d.js`, `prayer-room.js`.
- canvas-film method: `C:/Project/motion-skills/canvas-film/references/SCENE-RULES.md`, `BODY-CHECK.md`, `LESSONS.md`, `STYLE-INDEX.md`.
- **Skills-first**: before writing a technique yourself, look in `C:/Project/motion-skills/*/` (≈55 skill folders, each with SKILL.md/README;
  e.g. `cinematic-3d`, `oil-paint-world`, `feeling-pastel`, `ink-water-emergence`, `colored-pencil-world`, `parallax-facade`, `cinecode`
  (`cinecode/references/camera-moves.md` for named camera moves), `canvas-film/kits/*`). Name the skills you used in the module header.

## Hard rules
- Portrait 1080×1920 first (`Pilot.W/H`, `Pilot.ori==='v'`); landscape must not crash (`?ori=h`), but polish portrait only.
  The bottom 25 % and the right edge are covered by app buttons — keep the protagonist out of them; the words sit in the bottom band.
- **Words are never drawn into the art.** Subtitles/quotes/labels come from `Film.sub/quote/label` over a dark band (copy `band()`).
- **Jesus**: never a face, profile line or features — back view, far silhouette, or backlit only; never a big central figure; no halo.
  He looks like the other men (same clothes). God the Father never depicted. Men: head cloth tied, ending at the shoulder, or short hair,
  beard outline for adults, broad shoulders — **no long flowing hair** on anyone male. Zacchaeus is small (Luke 19:3) — same man every shot
  (same build, same head-cloth colour).
- One event on screen per verse; **no near-still stretch over 3 s**. Brightness of the scene average ~78–97/255, dark frames few.
- Camera: one slow named move per shot (zoom/push ≤ ~0.25/s); never violent pulls or rushing into a vanishing point.
- **motion-continuity** (owner, 2026-11-21): camera speed, rotation, and the rate at which lights/particles appear must flow — no stop-go
  steps (a move must begin before the previous one ends; no drop to ~0 then a sudden burst; rates ease along smooth curves). Measure
  camera speed + emission rate every 0.25 s and put the table in your report; no jump ≥ 2× between neighbours and no stall near 0
  unless the script has a beat there (name the line).
- Light points at the line's protagonist, on its axis; few particles (tens–100), only inside beams, with depth of field.
- Bodies: elbows bend down/out only, fixed limb lengths (IK), hands on what they hold, planted feet never slide, movements ease
  in/out at 30 fps (no snaps, no low-rate updates). Report the max per-frame joint-angle change. Simple 3D figures look crude when
  close (owner) — keep 3D figures at mid/far distance or in silhouette; close-ups of hands go in the painted pass / silhouette.
- A paint pass must be fixed in the frame (no per-frame noise / no flicker; owner).
- Owner-banned looks: Hopper style, Roman mosaic / pointillism, silkscreen poster, word-log cartoon kits.
- Font: Noto Serif KR 600 must exist in `motion/out/fonts` (render refuses otherwise).
- All times come from script `at` (build a `beats(B)` from line ids; never hard-code film seconds except T0/T1 of your block).

## Render and check (do this yourself before reporting)
- `node motion/render.mjs v --page films/kingdom/<your page>.html` → `motion/out/<page>-v.mp4`; stills: `--stills 1,5,9` (block seconds).
- Look at frames yourself every 0.25 s around every move/transition, and a 0.5 s contact sheet of the whole block:
  `py motion/films/frame-sheets.py --video motion/out/<page>-v.mp4` (check `--help`). Fix what looks wrong before reporting.
- `node motion/films/look-check.mjs motion/out/<page>-v.mp4` (brightness / dark / still frames vs the first film).
- Make a 720p preview: `ffmpeg -y -i motion/out/<page>-v.mp4 -vf scale=720:-2 -c:v libx264 -crf 23 -preset veryfast motion/out/review/<page>-720.mp4`.

## Report (final message, Korean or English, concise)
Files made; the shot list with film times; look + film_ref + camera + out per shot; skills used; look-check numbers;
the 0.25 s motion-continuity table (camera speed, emission rate) summarised with any flagged spots; max joint-angle change;
paths of the mp4, 720p preview and 3–4 representative stills (absolute paths); anything you could not solve.
