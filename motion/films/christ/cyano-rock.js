/* cyano-rock.js — 「그리스도」 3부, 가이사랴 빌립보의 바위 벼랑 (마 16:13–23), 시아노타입 — 1800년대 푸른 사진 인화 (kit-cyanotype.js).
   The owner found the sunset oil too like parts 5 and 6; the picture itself stays (oil-rock.js, reviewed: framing, people, movement,
   timing, the words' band) and is printed as a blue photograph: every frame rockOil() is drawn offscreen and its luminance is the
   plate CYAN.develop() prints from — the bright sky and the sun print as paper white, the backlit band as deep Prussian-blue
   silhouettes, the rock as modelled blues; paper tooth, the brushed coat, stains only at the frame's edges.
     'confess'  (u 0–7.7): while the sun shines the print builds — a pale ghost at first, then the blue deepens and the forms come up
                (exposure k rising); at Q2 (u≈3.5) Peter steps into the light and the print is at its sharpest.
     'foretell' (u 0–8.0): the sun goes down (u 0–4), the long shadows; then the print stops — it bleaches, goes soft, stains
                creep in from the edges.
     'protest'  (u 0–4.3): a short, strong exposure — the two figures and the gap of light between them, crisp.
     'alone'    (u 0–4.6): a washed, faded sheet; Peter alone; the first star a pinhole of white.
   buildRockCyan() = buildRockOil() + the paper. rockCyan(ctx, u, mode) depends only on (u, mode). No words are drawn.
   Needs Pilot (lib.js), kit-oilpaint.js + oil-rock.js (rockOil), kit-cyanotype.js (window.CYAN). */
const CRK = {};

async function buildRockCyan() {
  if (!RCK.L) await buildRockOil();
  const { W, H } = Pilot;
  CRK.off = Pilot.canvas(W, H); CRK.plate = Pilot.canvas(W, H); CRK.half = Pilot.canvas(Math.round(W * .6), Math.round(H * .6)); CRK.plate.getContext('2d', { willReadFrequently: true });   // read back every frame: keep it in memory
  CRK.sheet = CYAN.sheet(W, H, { seed: 3, coat: [-W * .3, -H * .2, W * 1.3, H * 1.2], splatter: 0 });   // the coat runs past the frame: no paper edge, no dry-brush hairs
}

function rockCyan(ctx, u, mode = 'confess') {
  const { clamp, lerp, ss } = Pilot, L = RCK.L, { W, H, V } = L;
  // the picture (the reviewed oil scene), offscreen
  const oc = CRK.off.getContext('2d'); oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = 1; oc.globalCompositeOperation = 'source-over'; oc.filter = 'none';
  rockOil(oc, u, mode);
  // paint into photograph: a light blur takes the brush marks off; the luminance becomes the plate
  const hg = CRK.half.getContext('2d'), g = CRK.plate.getContext('2d'); hg.imageSmoothingQuality = g.imageSmoothingQuality = 'medium'; hg.drawImage(CRK.off, 0, 0, CRK.half.width, CRK.half.height); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(CRK.half, 0, 0, W, H);   // down to 60 % and back up: a soft photographic blur, cheaper than a filter
  // the same camera as rockOil, so the paper moves with the picture
  let fx, fy, z;
  if (mode === 'protest') [fx, fy, z] = rockCam([[0, W * .6, L.hz - .01 * H, 1.32], [4.3, W * .6, L.hz - .012 * H, 1.4]], u);
  else { const lo = V ? H * .56 : H * .58, KEYS = { confess: [[0, W * .48, lo, 1.08], [7.7, W * .52, lo, 1.16]], foretell: [[0, W * .52, lo, 1.16], [8, W * .45, lo, 1.1]], alone: [[0, W * .55, H * .5, 1.12], [4.6, W * .53, H * .5, 1.22]] }[mode];
    [fx, fy, z] = rockCam(KEYS, u); }
  fx = clamp(fx, W / 2 / z, W - W / 2 / z); fy = clamp(fy, H / 2 / z, H - H / 2 / z);
  // the exposure: builds in 'confess', stops and fades in 'foretell', short and strong in 'protest', washed out at night
  const E = mode === 'confess' ? { k: lerp(.8, 2.75, ss(0, 5, u)) + .3 * ss(3.3, 4.6, u), fade: 0, blot: .2, soft: .35 * (1 - ss(0, 4.6, u)) }
          : mode === 'foretell' ? { k: 3.05, fade: .2 * ss(3.5, 8, u), blot: .2 + .5 * ss(3, 8, u), soft: .22 * ss(4, 8, u) }
          : mode === 'protest' ? { k: lerp(1.3, 3.2, ss(0, .8, u)), fade: 0, blot: .15, soft: .2 * (1 - ss(0, .8, u)) }
          : { k: 2.85, fade: .13 + .08 * ss(0, 4.6, u), blot: .45, soft: .06 };
  CYAN.develop(ctx, CRK.plate, CRK.sheet, Object.assign(E, { view: [fx, fy, z], halo: .14, levels: [.03, .84, .8] }));
}
