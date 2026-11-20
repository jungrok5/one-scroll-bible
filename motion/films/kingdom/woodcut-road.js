// woodcut-road.js — 「kingdom」 5부 opening, block 4b-2 (b): the road carved in a woodblock, film 434.7 → 482.8
//   C4 「왕이 가신 길」 · N22 「하나님 나라의 왕은 / 사람들이 기다린 왕과 달랐습니다.」 · N22c 「제자 야고보와 요한이 / 예수님께 구했습니다.」 ·
//   L7a/Q10a 막 10:37 · N22d 「왜 오셨는지, 예수님은 자신을 '인자'라 부르시며 / 한 번 더 답하셨습니다.」 · Q11 막 10:45 · N22e 「대속물, / …몸값입니다.」
// Look (review.json looks "7:13–8:01"): a relief woodcut after Käthe Kollwitz (「All Quiet on the Western Front」, 1930, OPUSCAR 3:
// big black masses, white knife-cut contours, rough grain). Black is the wood left standing; light is what the knife cuts away —
// the light literally appears where the knife passes. The block is twice the frame's height: a road runs down it from a hill.
//   carve   434.7  the block is black; the knife's first line runs along the crest of the hill (the palm's crease of the last shot
//                  becomes a groove — match cut on the line), then the sky is cut ray by ray out from behind the crest; the chapter
//                  title sits on the uncut wood above.
//           N22    crane down the block: the knife runs down the road ahead of the camera, light opening behind it, the road
//                  widening toward us.
//   ask     N22c   at the near end of the road a man walks up it (from behind, solemn); two hooded men hurry up behind him, one at each
//                  side, and lower themselves; Q10a 「주의 우편에」 the one on his right points to the place at his right hand; 「좌편에」 the
//                  other to the place at his left (their hooded, gesturing silhouettes come back as the shadows on the charcoal hill).
//   climb  N22d   crane up the block while the knife cuts the path up the hill. Q11: a small man is cut on the path, climbing; a 5 s
//                  dolly out — behind him, one by one, many figures are cut into the road, a line of shadows following him (N22e: the
//                  many, the ransom). At 482.8 the frame is exactly the next block's charcoal hill: the same ridge in the same place
//                  (measured from sample-part5c-v.mp4's first frame) — the material changes, the hill stays (match cut). He stands
//                  near the middle of the crest where the middle cross will stand.
// Kit: kit-woodcut-road.js = motion-skills canvas-film/kits/woodcut/kit.js copied (taller plate + baked cuts; see its header).
// Figures: 2D jointed silhouettes drawn as ink over the print each frame (STYLE.md: moving things are ink, kept as silhouettes
// against carved light), with a broken white knife halo so black reads on black; arms by two-bone IK with fixed lengths and the
// elbow bending down/out; walking feet planted (a foot on the ground does not slide); every move eased.
// Skills read: canvas-film kits/woodcut STYLE.md (+ the template's sower), STYLE-INDEX C 3 (Kollwitz), doodle-styles STYLES.md
// `ukiyoe-woodblock` (keyblock before colour — order of marks), cinecode camera-moves (crane down/up · dolly out 5 s), BODY-CHECK.md.
// No face anywhere (figures are silhouettes); He is seen from behind or far and small; men hooded; no halo.
// API: const WD = await (await import('./woodcut-road.js')).build(W, H);  WD.draw(ctx, t, B)  t = FILM seconds,
//      B = { C4, N22, N22c, L7a, Q10a, N22d, Q11, N22e, END, pc: { id: [piece times] } }. Pure in t.
const WC = () => window.Woodcut, PL = () => window.Pilot;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const sine = x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

// the next block's ridge on screen at 482.8 (sample-part5c-v.mp4 frame 0, 1080×1920, columns every 30 px; the crosses' columns
// interpolated) — the woodcut's hill is carved to it
const RIDGE = [[0, 959], [30, 951], [60, 945], [90, 939], [120, 932], [150, 930], [180, 922], [210, 917], [240, 912], [270, 910], [300, 907], [330, 904], [360, 901], [390, 899],
  [420, 897], [450, 897], [480, 896], [510, 895], [540, 895], [570, 895], [600, 895], [630, 895], [660, 895], [690, 896], [720, 899], [750, 902], [780, 905], [810, 906], [840, 909],
  [870, 915], [900, 919], [930, 922], [960, 929], [990, 932], [1020, 940], [1050, 945], [1080, 950]];

export function beats(B) {
  const pc = B.pc || {}, q10a2 = pc.Q10a ? pc.Q10a[1] : B.Q10a + 4.9, q11b = pc.Q11 ? pc.Q11[1] : B.Q11 + 6.5;
  const T = { start: B.C4, end: B.END };
  T.crest = [B.C4 + .05, B.C4 + 1.2];             // the knife along the crest (the crease → the groove)
  T.sky = [B.C4 + .5, B.N22 + .3];              // the sky cut ray by ray out from behind the crest
  T.down = [B.N22 + .2, B.N22c - .2];            // crane down while the knife runs down the road
  T.road = [B.N22 + .0, B.N22c - .5];            // the road carved far → near
  T.walk = B.N22 - 1.0;                          // He walks up the near road (already walking when we arrive)
  T.stop = B.N22c + 1.8;                         // He stops (the two have come)
  T.come = [B.N22c - .1, B.N22c + 2.7];          // the two hurry up behind him
  T.low = [B.N22c + 2.5, B.N22c + 4.3];          // they lower themselves
  T.pR = [B.Q10a + .6, B.Q10a + 2.0];            // 「주의 우편에」: the one on his right points to the place at his right
  T.pL = [q10a2 + .3, q10a2 + 1.7];              // 「좌편에」: the other to the place at his left
  T.on = B.N22d - .2;                            // He walks on up the road
  T.up = [B.N22d + .2, B.Q11 - .2];              // crane up while the knife cuts the path up the hill
  T.path = [B.N22d + .6, B.Q11 - .5];
  T.man = [B.Q11 + .15, B.Q11 + 1.1];            // the small man cut on the path
  T.out = [B.Q11 + .2, B.Q11 + 5.2];             // dolly out 5 s
  T.many = [q11b - .8, B.END - .6];              // the many cut one by one behind him (N22e: the line grows down the road)
  return T;
}

export async function build(W, H) {
  const P = PL(), Wc = WC(), HP = 2 * H, INK = Wc.INK, PAPER = Wc.PAPER;
  let T = null, PLATE = null;
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  // the ridge (plate units = final frame units at the top of the block)
  const ridgeY = x => { const i = clamp(Math.floor(x / 30), 0, RIDGE.length - 2), k = clamp((x - RIDGE[i][0]) / 30); const a = RIDGE[i][1], b = RIDGE[i + 1][1]; return lerp(a, b, k * k * (3 - 2 * k)) + 2.2 * Math.sin(x * .05) * 0; };
  const CX = 540, FOOT = 1390;                         // the road meets the hill's foot here
  // the road: a centre line from the foot of the hill down to the bottom of the block, widening toward us (perspective)
  const roadX = y => CX + 70 * Math.sin((y - FOOT) / 520) * ss(FOOT, FOOT + 400, y) - 40 * Math.sin((y - FOOT) / 1300) + 30 * ss(2600, 3840, y) * Math.sin(y / 300);
  const roadW = y => lerp(18, 470, Math.pow(clamp((y - FOOT) / (HP - FOOT)), 1.25));
  // the path up the hill: switchbacks from the foot to the crest just right of the middle
  const PATH = (() => { const pts = [], top = ridgeY(560) + 8, n = 160;
    for (let i = 0; i <= n; i++) { const u = i / n, y = lerp(FOOT, top, u), w = lerp(150, 40, u);   // a winding climb: two long bends and a short one near the top
      const x = CX + 20 * u + w * Math.sin(u * 7.2 + .4) * (1 - .25 * Math.sin(u * 13)) + 18 * Math.sin(u * 23) * (1 - u); pts.push([x, y]); }
    return pts; })();
  const pathLen = (() => { let L = 0; const acc = [0]; for (let i = 1; i < PATH.length; i++) { L += Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]); acc.push(L); } return { L, acc }; })();
  const pathAt = u => { const d = clamp(u) * pathLen.L; let i = 1; while (i < PATH.length - 1 && pathLen.acc[i] < d) i++; const k = (d - pathLen.acc[i - 1]) / Math.max(1e-6, pathLen.acc[i] - pathLen.acc[i - 1]); return [lerp(PATH[i - 1][0], PATH[i][0], k), lerp(PATH[i - 1][1], PATH[i][1], k)]; };

  // the road is cut where the knife is: it rides 120 px below the frame centre while the camera cranes down (eased) — so the cut time
  // of a road point is when the camera's centre passes y − 120 (inverse of the crane's ease, by bisection)
  const roadT = y => { const top = 960, bot = HP - 960, d = clamp((y - 120 - top) / (bot - top)); let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (eio(m) < d) lo = m; else hi = m; }
    return T.down[0] + (lo + hi) / 2 * (T.down[1] - T.down[0]) - (y < top + 120 ? (top + 120 - y) / 400 : 0); };
  function buildPlate() {
    PLATE = Wc.plate(4820, pl => {
      // regions: 1 sky · 2 hill · 3 land (below the hill)
      pl.region(1, g => g.rect(0, 0, W, HP));
      pl.region(2, g => { g.moveTo(-10, ridgeY(0)); for (let x = 0; x <= W; x += 10) g.lineTo(x, ridgeY(x)); g.lineTo(W + 10, ridgeY(W)); g.lineTo(W + 10, HP); g.lineTo(-10, HP); });
      const below = (x, y) => y > ridgeY(x) + 2;
      // the crest: the first groove, a knife line along the ridge (just above it), left → right from the middle out
      { const L = [], R = []; for (let x = CX; x >= -10; x -= 4) L.push([x, ridgeY(x) - 5]); for (let x = CX; x <= W + 10; x += 4) R.push([x, ridgeY(x) - 5]);
        pl.cut(L, 3.2, { kind: 'k', t0: T.crest[0], dur: T.crest[1] - T.crest[0], chip: .12 }); pl.cut(R, 3.2, { kind: 'k', t0: T.crest[0] + .05, dur: T.crest[1] - T.crest[0], chip: .12 }); }
      // the sky: rays from behind the crest (just right of the middle — where He will stand), wide near it; a bright band low over the
      // crest (the charcoal's pale mist band); carved outward from the crest
      const SX = 560, SY = 905;
      { const lines = [], n = 150; for (let i = 0; i < n; i++) { const a = Math.PI + .02 + (Math.PI - .04) * (i + .5) / n, r0 = 22 + (i % 3) * 16, L = [];
          for (let r = r0; r < 2200; r += 22) L.push([SX + Math.cos(a) * r, SY + Math.sin(a) * r]); lines.push(L); }
        pl.hatch(lines, { keep: (x, y) => !below(x, y) && y < SY + 4, kind: 'v', len: [50, 220], gap: [8, 60], thr: .15, wmin: 1.1, wmax: 7.5, gamma: 1.1, dur: .32,
          tone: (x, y) => { const d = Math.hypot(x - SX, (y - SY) * 1.25), band = Math.exp(-Math.max(0, ridgeY(x) - y) / 140); return clamp((Math.exp(-d / 430) * .9 + band * .62) * (.5 + .75 * P.fbm(x * .003 + 2, y * .006))); },
          t0: (x, y, r) => T.sky[0] + Math.hypot(x - SX, y - SY) / 520 + r() * .3 + (y < 500 && Math.abs(x - 540) < 340 ? 1.3 : 0) }); }   // clear of the chapter title until it goes
      // the glare band just over the crest: long horizontal U-cuts (so He reads dark against it), carved with the sky's first rays
      for (let k = 0; k < 9; k++) { const y = 870 - k * 13, x0 = 30 + 60 * hash(k), x1 = W - 30 - 60 * hash(k + 9); pl.cut([[x0, y + 3 * Math.sin(k)], [x1, y]], 7 - k * .55, { kind: 'u', chip: .06, t0: T.sky[0] + .2 + k * .12, dur: .9 }); }
      // the hill: mostly black wood (Kollwitz's mass); a broken rim of short knife cuts down its flanks, and a few contour cuts near the crest
      { const lines = []; for (let k = 1; k < 17; k++) { const L = []; for (let x = -10; x <= W + 10; x += 6) L.push([x, ridgeY(x) + k * 15 + 6 * Math.sin(x * .013 + k)]); lines.push(L); }
        pl.hatch(lines, { keep: (x, y) => below(x, y) && y < FOOT - 30, kind: 'v', len: [30, 140], gap: [8, 40], thr: .12, wmin: 1, wmax: 4.2, dur: .3,
          tone: (x, y) => clamp(.95 - (y - ridgeY(x)) / 340) * (.55 + .7 * P.fbm(x * .01, y * .02)), t0: (x, y, r) => T.sky[0] + .6 + Math.abs(x - SX) / 900 + r() * .4 }); }
      // the road: lengthwise gouge strokes inside its band, carved far → near as the knife runs down; the land on both sides: furrows that
      // follow the road's edges and thin out away from it
      { const lines = [], n = 46; for (let i = 0; i < n; i++) { const f = (i + .5) / n - .5, L = []; for (let y = FOOT - 10; y <= HP; y += 14) L.push([roadX(y) + f * roadW(y), y]); lines.push(L); }
        pl.hatch(lines, { keep: (x, y) => y > FOOT - 14, kind: 'v', len: [40, 200], gap: [4, 22], thr: .06, wmin: 1.2, wmax: 8, gamma: 1, dur: .26,
          tone: (x, y) => clamp(.95 - Math.pow(Math.abs(x - roadX(y)) / (roadW(y) * .5 + 1), 4) * .8) * (.75 + .35 * P.fbm(x * .006, y * .004)),
          t0: (x, y, r) => roadT(y) + r() * .15 }); }
      { const lines = []; for (const sd of [-1, 1]) for (let k = 1; k < 26; k++) { const L = []; for (let y = FOOT + 20; y <= HP; y += 16) L.push([roadX(y) + sd * (roadW(y) * .5 + k * lerp(6, 36, (y - FOOT) / (HP - FOOT))), y]); lines.push(L); }
        pl.hatch(lines, { keep: (x, y) => y > FOOT, kind: 'v', len: [30, 140], gap: [10, 60], thr: .16, wmin: .9, wmax: 5, dur: .3,
          tone: (x, y) => { const d = Math.abs(x - roadX(y)) - roadW(y) * .5; return clamp(.9 * Math.exp(-d / lerp(150, 380, (y - FOOT) / (HP - FOOT))) * (.65 + .6 * P.fbm(x * .004 + 7, y * .003))); },
          t0: (x, y, r) => roadT(y) + .25 + Math.abs(x - roadX(y)) / 900 + r() * .3 }); }
      // the path up the hill: one narrow gouge along the switchbacks, cut from the foot to the crest, with a knife edge on its lower side
      { const segs = 10; for (let s = 0; s < segs; s++) { const a = Math.floor(s * (PATH.length - 1) / segs), b = Math.floor((s + 1) * (PATH.length - 1) / segs);
          const pts = PATH.slice(a, b + 1), w = lerp(13, 7, s / segs), t0 = lerp(T.path[0], T.path[1], s / segs), dur = (T.path[1] - T.path[0]) / segs;
          pl.cut(pts, w, { kind: 'u', t0, dur, chip: .1 }); pl.cut(pts.map(([x, y]) => [x + 2, y + w * .9]), 1.6, { kind: 'k', t0: t0 + .1, dur, chip: .2 }); } }
      // gold: the light behind the crest, only through the cuts (warms as the man climbs)
      pl.gold((g, t) => { const k = .45 + .55 * ss(T.man[0], T.end, t); const R = 980, gr = g.createRadialGradient(SX, SY, 0, SX, SY, R);
        gr.addColorStop(0, `rgba(233,185,92,${.9 * k})`); gr.addColorStop(.3, `rgba(233,185,92,${.45 * k})`); gr.addColorStop(1, 'rgba(233,185,92,0)'); g.fillStyle = gr; g.fillRect(SX - R, SY - R, 2 * R, 2 * R); });
    }, { h: HP });
  }

  // ---------------------------------------------------------------- figures (ink over the print, plate units)
  // fig(o): o = { x, y (feet), h, view: 'back' | 'side', dir (+1 faces right), ph (walk phase 0..1, null = standing), bow 0..1,
  //   hands: [left target | null, right target | null] (plate units), swing (arm swing 0..1), seed }
  function ik(S, Tg, a, b, pref) {   // two-bone IK, fixed lengths; the elbow on the side of `pref` (a direction: down, and back or out) — never up, never flipping
    let dx = Tg[0] - S[0], dy = Tg[1] - S[1], L = Math.hypot(dx, dy); const mx = (a + b) * .995, mn = Math.abs(a - b) + .01;
    if (L > mx) { dx *= mx / L; dy *= mx / L; L = mx; } if (L < mn) { L = mn; }
    const ux = dx / L, uy = dy / L, x = (a * a - b * b + L * L) / (2 * L), hh = Math.sqrt(Math.max(0, a * a - x * x));
    let px = -uy, py = ux; const pr = Array.isArray(pref) ? pref : [0, 1]; if (px * pr[0] + py * pr[1] < 0) { px = -px; py = -py; }   // bend toward pref (continuous: pref never ⟂ to every pose)
    return [[S[0] + ux * x + px * hh, S[1] + uy * x + py * hh], [S[0] + ux * L, S[1] + uy * L]];
  }
  function figShapes(o) {
    const h = o.h, x = o.x, y = o.y, d = o.dir || 1, bow = o.bow || 0, kneel = o.kneel || 0, back = o.view === 'back';
    const ph = o.ph ?? 0, amp = o.ph == null ? 0 : (o.walkAmp ?? 1), walking = amp > 0, sw = Math.sin(ph * 2 * Math.PI) * amp;   // amp eases the gait in/out (no snap at a stop)
    const hipY = y - h * (.5 - .12 * kneel), hip = [x, hipY - h * .012 * Math.abs(Math.cos(ph * 2 * Math.PI)) * amp];
    const ta = bow * .62, tl = h * .33;                                     // torso pitch (forward), length hip → shoulder
    const sh = back ? [x, hip[1] - tl] : [x + d * Math.sin(ta) * tl, hip[1] - Math.cos(ta) * tl];
    const headR = h * .066, neck = back ? [sh[0], sh[1] - h * .03] : [sh[0] + d * Math.sin(ta) * h * .04, sh[1] - Math.cos(ta) * h * .04];
    const head = back ? [neck[0], neck[1] - headR * .95] : [neck[0] + d * Math.sin(ta + .15) * headR * 1.05, neck[1] - Math.cos(ta + .15) * headR * .95];
    const body = new Path2D(), arms = [];
    if (back) {   // seen from behind: hood to the shoulders, a robe widening to the hem; the hem sways with the steps
      const sw2 = h * .135, hw = h * .17 + h * .012 * sw, hem = y - h * .035;
      body.moveTo(head[0] - headR * 1.15, head[1] - headR * .1);
      body.quadraticCurveTo(head[0] - headR * 1.25, head[1] - headR * 1.45, head[0], head[1] - headR * 1.4); body.quadraticCurveTo(head[0] + headR * 1.25, head[1] - headR * 1.45, head[0] + headR * 1.15, head[1] - headR * .1);
      body.quadraticCurveTo(sh[0] + sw2 * .9, sh[1] - h * .01, sh[0] + sw2, sh[1] + h * .05);
      body.lineTo(x + hw + h * .01 * sw, hem); body.quadraticCurveTo(x, hem + h * .012, x - hw + h * .01 * sw, hem);
      body.lineTo(sh[0] - sw2, sh[1] + h * .05); body.quadraticCurveTo(sh[0] - sw2 * .9, sh[1] - h * .01, head[0] - headR * 1.15, head[1] - headR * .1); body.closePath();
      // feet under the hem (planted / lifting alternately)
      for (const s of [-1, 1]) { const lift = Math.max(0, Math.sin((ph + (s > 0 ? .5 : 0)) * 2 * Math.PI)) * h * .025 * amp, fx = x + s * h * .055;
        body.moveTo(fx - h * .028, y - lift); body.lineTo(fx + h * .028, y - lift); body.lineTo(fx + h * .022, y - h * .045 - lift); body.lineTo(fx - h * .022, y - h * .045 - lift); body.closePath(); }
      for (const s of [-1, 1]) { const S = [sh[0] + s * h * .12, sh[1] + h * .03], tg = (o.hands && o.hands[s > 0 ? 1 : 0]) || [S[0] + s * h * .04, S[1] + h * .38 + h * .02 * s * sw * (o.swing ?? 1)];
        const [E, Hd] = ik(S, tg, h * .19, h * .18, [s * .55, 1]); arms.push([S, E, Hd, h * .055]); }
    } else {      // from the side, facing d: hood with a peak, a robe from the shoulders to the hem; the body bends at the hip when bowing
      const kx = d * h * .05 * kneel;
      const back0 = [sh[0] - d * h * .09, sh[1] + h * .02], front0 = [sh[0] + d * h * .07, sh[1] + h * .04];
      const hemB = [x - d * h * .14 - kx * .3, y - h * .035 - h * .1 * kneel], hemF = [x + d * h * .13 + kx, y - h * .04 - h * .08 * kneel];
      const step = h * .09 * sw;
      body.moveTo(head[0] - d * headR * 1.25, head[1] + headR * .2);                                  // hood: back of the head, a peak, the face side
      body.quadraticCurveTo(head[0] - d * headR * 1.5, head[1] - headR * 1.6, head[0] + d * headR * .25, head[1] - headR * 1.25);
      body.quadraticCurveTo(head[0] + d * headR * 1.25, head[1] - headR * .5, head[0] + d * headR * 1.0, head[1] + headR * .55);
      body.lineTo(front0[0], front0[1]); body.lineTo(hemF[0] + step * .5, hemF[1]); body.quadraticCurveTo((hemF[0] + hemB[0]) / 2, Math.max(hemF[1], hemB[1]) + h * .01, hemB[0] + step * .2, hemB[1]);
      body.lineTo(back0[0], back0[1]); body.quadraticCurveTo(head[0] - d * headR * 1.6, head[1] + headR * 1.1, head[0] - d * headR * 1.25, head[1] + headR * .2); body.closePath();
      // feet: two wedges, the front one stepping (walking) or set forward (bowing/kneeling)
      for (const s of [-1, 1]) { const off = s * step * .6 + (1 - amp) * ((s > 0 ? h * .07 : -h * .03) + kx * (s > 0 ? 1 : -.4)), lift = Math.max(0, Math.sin((ph + (s > 0 ? 0 : .5)) * 2 * Math.PI)) * h * .03 * amp;
        const fx = x + off; body.moveTo(fx - d * h * .03, y - lift); body.lineTo(fx + d * h * .065, y - lift); body.lineTo(fx + d * h * .02, y - h * .045 - lift); body.lineTo(fx - d * h * .03, y - h * .04 - lift); body.closePath(); }
      // arms: the near one in front of the body, the far one behind it (drawn first)
      for (const s of [0, 1]) { const S = [sh[0] + d * h * (s ? .01 : -.02), sh[1] + h * .035], free = [S[0] + d * h * .06 * (-sw * (s ? 1 : -1)) + d * h * .04, S[1] + h * .36 - h * .05 * bow];
        const hw = o.handsW ? o.handsW[s] ?? 1 : 1, tg0 = (o.hands && o.hands[s]) || free, tg = [lerp(free[0], tg0[0], hw), lerp(free[1], tg0[1], hw)], [E, Hd] = ik(S, tg, h * .19, h * .18, [-d * .7, 1]); arms.push([S, E, Hd, h * .05, s ? 'near' : 'far']); }
    }
    return { body, arms };
  }
  function drawFig(ctx, o, z, alpha = 1, halo = 1) {
    const { body, arms } = figShapes(o), lw = 1 / z;
    if (window.__WDDBG) window.__WDDBG.push({ id: o.seed, arms: arms.map(([S, E, Hd]) => [S, E, Hd]), h: o.h });   // debug: joint measurement
    ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // the knife halo: a broken paper line round the silhouette (fixed dash — it never crawls)
    if (halo > 0) { ctx.strokeStyle = PAPER; ctx.globalAlpha = alpha * halo; ctx.setLineDash([o.h * .14, o.h * .025]); ctx.lineDashOffset = (o.seed || 0) * 13;
      ctx.lineWidth = Math.max(2.2 * lw, o.h * .03); ctx.stroke(body);
      for (const [S, E, Hd, w] of arms) { ctx.lineWidth = w + Math.max(3 * lw, o.h * .03); ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(Hd[0], Hd[1]); ctx.stroke(); }
      ctx.setLineDash([]); ctx.globalAlpha = alpha; }
    ctx.fillStyle = INK; ctx.strokeStyle = INK;
    const far = arms.filter(a => a[4] === 'far'), rest = arms.filter(a => a[4] !== 'far');
    for (const [S, E, Hd, w] of far) { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(Hd[0], Hd[1]); ctx.stroke(); ctx.beginPath(); ctx.arc(Hd[0], Hd[1], w * .62, 0, 6.283); ctx.fill(); }
    ctx.fill(body);
    for (const [S, E, Hd, w] of rest) { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(Hd[0], Hd[1]); ctx.stroke(); ctx.beginPath(); ctx.arc(Hd[0], Hd[1], w * .62, 0, 6.283); ctx.fill(); }
    ctx.restore();
    return arms;
  }
  const figH = y => lerp(62, 360, Math.pow(clamp((y - FOOT + 60) / (HP - FOOT + 60)), 1.15));   // perspective: a man's height at road y
  const hillH = y => lerp(72, 118, clamp((y - 900) / (FOOT - 900)));   // on the hill (the final frame): small, but a man at a glance

  // ---------------------------------------------------------------- the knife tip and its chips
  function knife(ctx, x, y, ang, z, a = 1) {
    if (a <= 0) return; const s = 1 / z * 1.0; ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha = a;
    ctx.fillStyle = '#2a2622'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-46 * s, -9 * s); ctx.lineTo(-150 * s, -13 * s); ctx.lineTo(-150 * s, 13 * s); ctx.lineTo(-46 * s, 9 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(235,225,201,.55)'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(-2 * s, -.5 * s); ctx.lineTo(-46 * s, -8.5 * s); ctx.lineTo(-150 * s, -12 * s); ctx.stroke();
    ctx.restore();
  }
  function chips(ctx, x, y, ang, t, seed, z) {
    ctx.save(); ctx.fillStyle = PAPER; const s = 1 / z;
    for (let i = 0; i < 7; i++) { const per = .5 + hash(seed + i) * .3, u = ((t / per + hash(seed + i * 3)) % 1), a = ang + Math.PI + (hash(seed + i * 7) - .5) * 1.6, r = u * 46 * s;
      ctx.globalAlpha = (1 - u) * .85; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r - u * u * 12 * s, 3.2 * s * (1 - u * .5), 1.4 * s, a + u * 3, 0, 6.283); ctx.fill(); }
    ctx.restore();
  }

  // ---------------------------------------------------------------- the camera (plate point at the frame centre, zoom)
  function camAt(t) {
    const top = 960, bot = HP - 960, d1 = eio((t - T.down[0]) / (T.down[1] - T.down[0])), u1 = eio((t - T.up[0]) / (T.up[1] - T.up[0])), o1 = sine((t - T.out[0]) / (T.out[1] - T.out[0]));
    let cy = lerp(top, bot, d1), z = 1.0 + .03 * (1 - ss(T.start, T.down[0], t));
    if (t >= T.down[1]) { cy = bot; z = 1 + .05 * ss(T.down[1], T.on, t); }               // at the near road: a slow push while they act
    if (t >= T.up[0]) { cy = lerp(bot, 1080, u1); z = lerp(1.05, 1.55, u1); }              // crane up to the hill, closing in on the path
    if (t >= T.out[0]) { cy = lerp(1080, 975, o1); z = lerp(1.55, 1.07, o1); }             // dolly out 5 s
    if (t >= T.out[1]) { const k = clamp((t - T.out[1]) / (T.end - T.out[1])), e = k * (2 - k); cy = lerp(975, 960, e); z = lerp(1.07, 1.0, e); }   // keeps widening (slowing) into the match frame
    return { x: 540 + (roadX(cy) - 540) * .3 * ss(1500, 2200, cy), y: cy, z: Math.max(1, z) };   // exactly 540 at the match frame
  }

  // ---------------------------------------------------------------- the frame
  function draw(ctx, t, B) {
    if (!T) { T = beats(B); buildPlate(); }
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    const cam = camAt(t); PLATE.render(ctx, t, cam);
    ctx.save(); ctx.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, H / 2 - cam.y * cam.z);
    // the knife: on the crest groove, then over the sky, down the road, up the path
    let kn = null;
    if (t > T.crest[0] && t < T.crest[1] + .2) { const u = clamp((t - T.crest[0]) / (T.crest[1] - T.crest[0])), x = lerp(CX, W + 10, u * (.55 + .45 * u)); kn = [x, ridgeY(x) - 5, 0, ss(T.crest[0], T.crest[0] + .3, t) * (1 - ss(T.crest[1], T.crest[1] + .2, t))]; }
    else if (t > T.down[0] - .5 && t < T.down[1] + .3) { const y = clamp(cam.y + 120, FOOT, HP - 40); const yn = y + 20; kn = [roadX(y) + roadW(y) * .18 * Math.sin(t * 2.1), y, Math.atan2(yn - y, roadX(yn) - roadX(y)), ss(T.down[0] - .5, T.down[0] - .1, t) * (1 - ss(T.down[1], T.down[1] + .3, t))]; }
    else if (t > T.path[0] - .3 && t < T.path[1] + .4) { const u = clamp((t - T.path[0]) / (T.path[1] - T.path[0])), [x, y] = pathAt(u), [x2, y2] = pathAt(u + .01); kn = [x, y, Math.atan2(y2 - y, x2 - x), ss(T.path[0] - .3, T.path[0], t) * (1 - ss(T.path[1], T.path[1] + .4, t))]; }
    // the people
    drawPeople(ctx, t, cam.z);
    if (kn && kn[3] > 0) { chips(ctx, kn[0], kn[1], kn[2], t, 31, cam.z); knife(ctx, kn[0], kn[1], kn[2] + Math.PI, cam.z, kn[3]); }
    ctx.restore();
  }
  // He walks up the near road; the two come; they bow and point; He walks on (out of the frame as the camera rises). On the hill a
  // small man climbs; the many follow.
  const NEAR = { y0: 3215, y1: 2950 };   // his walk on the near road (plate y), and where he stops
  function drawPeople(ctx, t, z) {
    // --- the near road (visible from the crane down to the crane up)
    if (t > T.down[0] && t < T.up[1]) {
      // Him: walking solemnly up the road (1.25 s stride), slowing to a stop as the two arrive, then walking on
      const Tg = 1.25, L = 26, tauStop = (() => { const dec = 1.6, e = t - T.walk; if (t < T.stop - dec) return e; if (t < T.stop) { const u = (t - (T.stop - dec)) / dec; return (T.stop - dec - T.walk) + dec * (u - (u * u * u - u * u * u * u / 2)); } return (T.stop - dec - T.walk) + dec / 2; })();
      const restart = Math.max(0, t - T.on), acc = 1.4, tauOn = restart < acc ? acc * (Math.pow(restart / acc, 3) - Math.pow(restart / acc, 4) / 2) : acc / 2 + restart - acc;
      const tau = tauStop + tauOn, steps = tau / (Tg / 2);
      // distance walked in plate units shrinks with perspective (constant ground speed): integrate a step at a time on the scale
      let y = NEAR.y0; { const n = Math.floor(steps), f = steps - n; for (let i = 0; i < n; i++) y -= L * figH(y) / 300; y -= f * L * figH(y) / 300; }
      const h = figH(y), ph = (tau / Tg) % 1, spd = clamp(1 - ss(T.stop - 1.6, T.stop, t)) + ss(T.on, T.on + 1.4, t);
      const vis = ss(roadT(y) + .1, roadT(y) + .7, t);   // he is cut into the road once the road under him is cut (never a ghost on black)
      drawFig(ctx, { x: roadX(y) + 6, y, h, view: 'back', ph, walkAmp: clamp(spd), swing: .8, seed: 1 }, z, vis, vis);
      // the two: hooded; they hurry up the road behind him (one each side), lower themselves, and point to the places at his hands
      const youY = y;
      [[-1, 'L', 7], [1, 'R', 13]].forEach(([sd, id, seed], i) => {
        const ck = eio((t - T.come[0] - i * .25) / (T.come[1] - T.come[0])), lowK = sine((t - T.low[0] - i * .3) / (T.low[1] - T.low[0]));
        const fy = lerp(youY + 560, youY + 52, ck), fx = roadX(fy) + sd * lerp(230, 178, ck) * figH(fy) / 300;   // from below the frame, up the road at its edges
        const fh = figH(fy), ph2 = ((t - T.come[0]) / .72 + i * .5) % 1, amp2 = ss(0, .08, ck) * (1 - ss(.75, 1, ck));
        // the gesture: the near hand opens toward the place beside Him (his right = screen right; his left = screen left)
        const pK = id === 'R' ? sine((t - T.pR[0]) / (T.pR[1] - T.pR[0])) : sine((t - T.pL[0]) / (T.pL[1] - T.pL[0]));
        const seat = [roadX(youY) + 6 + sd * figH(youY) * .36, youY - figH(youY) * .44];   // the place at his right / left hand, at his shoulder's height
        const facing = -sd;   // each faces Him (the left one faces right)
        const hands = [null, seat], handsW = [0, pK];   // the near hand eases from where it hangs to the place beside Him (no snap)
        // keep still and alive after the gesture (a small breath in the bow)
        const bow = lerp(0, .8, lowK) - .22 * pK + .02 * Math.sin(t * 1.3 + i), kneel = .6 * lowK;
        // after N22d they stay where they are, still lowered (He walks on)
        if (t > T.come[0] - .1) drawFig(ctx, { x: fx, y: fy, h: fh, view: 'side', dir: facing, ph: ph2, walkAmp: amp2, bow, kneel, hands, handsW, seed }, z);
      });
    }
    // --- the hill: the small man cut on the path, climbing; the many behind him
    if (t > T.man[0] - .1) {
      const mk = ss(T.man[0], T.man[1], t), climb = clamp((t - T.man[0]) / (T.end - T.man[0])), u = .08 + .82 * (1 - Math.pow(1 - climb, 1.6));   // slows near the top
      const [x, y] = pathAt(u), h = hillH(y) * 1.05;
      const ph = ((t - T.man[0]) / 1.5) % 1;
      // cut into the block: the halo first, then the black; climbing away from us (his back)
      drawFig(ctx, { x, y, h, view: 'back', ph, swing: .6, seed: 21 }, z, ss(T.man[0] + .35, T.man[1], t), mk);
      // the many: cut one by one behind him, along the path and down the road, each walking up after him
      const N = 22;
      for (let i = 0; i < N; i++) { const t0 = T.many[0] + i * (T.many[1] - T.many[0]) / N; if (t < t0) continue;
        const k = ss(t0, t0 + .7, t), ui = u - (i + 1) * .046 - .018 * Math.sin(i * 2.3) - .008 * i * hash(i + 11);   // irregular spacing
        let fx, fy, fh, fdir = 1;
        if (ui > .02) { [fx, fy] = pathAt(ui); fh = hillH(fy) * (.9 + .12 * hash(i + 3)); }
        else { const yy = FOOT + (.02 - ui) * 2400; fy = yy; fx = roadX(yy) + (hash(i) - .5) * roadW(yy) * .35; fh = hillH(FOOT) * (1 + (yy - FOOT) / 500); }
        if (fy > 2000) continue; const edge = 1 - ss(1820, 2000, fy);   // the ones still far down the road come in from below the frame (no pop)
        const phi = ((t - t0) / (1.4 + hash(i) * .4) + hash(i + 5)) % 1;
        drawFig(ctx, { x: fx, y: fy, h: fh, view: 'back', ph: phi, swing: .5, seed: 40 + i }, z, k * .96 * edge, k * edge);
      }
    }
  }
  return { draw, beats: () => T };
}
