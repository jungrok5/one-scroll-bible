/* ink-garden.js — 「kingdom」 2부 「왕이 돌아오셨다」, the ink-wash garden on rice paper (N40–N43 · Q40, and Q44 · N47).
   The first film's 「타락」 look (motion/pilot/fall.html: loaded-brush strokes, wet dabs, a bloom field per element, the ink
   flood with its tendrilled tide line, the one gold point the ink could not cover), with 「The Last Emperor」's gongbi order
   added for the ordered garden: iron-wire outlines (鐵線描 — thin, even, unbroken) and pale mineral colour (malachite,
   azurite, ochre, cinnabar) laid inside them, the Tang blue-green landscape on the far ranges.

   Story on the sheet (portrait authored at 1080×1920; the picture lives above Film.SAFE, the band covers the rest):
     N40  the garden paints itself in wash — ranges, river, trees, a small village and fields — and at its centre a place of
          light; every crown, every blade of grass, the deer and the cranes lean toward it.
     Q40  from the light a grain of light spreads in rings; where a ring passes, the iron-wire lines and the colour join in
          order (river, trees, animals).
     N41  a small man (short hair, no long strokes) stands facing the light, turns his back on it and walks away.
     N42  one drop of ink falls where he turned and floods across the garden (push-in on the advancing edge): where it has
          passed, the colour drains, a tree stands dead, the man crouches, a grave mound and its stone appear.
     N43  in the middle of the flood one gold point survives and glows; the camera comes to rest on it; then the point
          grows into the next shot's sun (the page lays the village under the white).
     Q44  the SAME flood mask played backwards: the ink withdraws into its drop, which lifts off the paper; the colour and the
          lines come back, the man stands; the camera pulls back to the whole garden.
     N47  from the gold point the grain of light spreads again over the whole garden; the man turns back to the light.

   Rules kept: no words or seal characters on the art (the first film's 언약 seal is left out); the light sits on the
   subject's axis (the place of light is the centre every line leans to); the man is a small xieyi figure with short hair;
   nothing holds still (lines are revealed, rings travel, cranes fly, the camera creeps ≤ 0.07 zoom/s).

   API (classic script, global InkGarden):  InkGarden.build(W, H)  once in init (≈ 3–5 s of painting);
     InkGarden.draw(ctx, t, B)  t = FILM seconds, B = line times from script.json { C2a N40 Q40 N41 N42 N43 N44 N46c Q44 N47 C2 }.
     InkGarden.beats(B) the visual times (all derived from B, so a voice retime moves the picture with it).
   Pure in t: plates are painted once and seeded; masks, camera, figures, animals and light are recomputed from t. */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, fbm, noise, canvas, rgb, speckle } = Pilot;
  const INK = [27, 25, 21], PAPER = [236, 229, 212];
  const MAL = [86, 142, 112], AZU = [64, 104, 150], OCH = [186, 132, 70], CIN = [178, 70, 46], GOLD = [222, 168, 72], WIL = [132, 160, 96];
  let W, H, V, PS, PW, PH, FW, FH;   // frame size, plate scale, plate size, field size (plate / 4)
  let paper, comp, cx_, tmp, tmx, mk, mkx, mk2, mkx2, grain, LAY = [], FLOOD, floodF, fallen, fallenC, colourC, linesC, compKey = '';
  const LIGHT = [540, 800], DROP = [410, 890], MAN0 = [432, 902], MAN1 = [338, 934];
  const DEER = [[652, 930, 1], [700, 946, 1]], GRAVE = [640, 1094], DEADTREE = [772, 968];

  // ---------------------------------------------------------------- the one table: visual beats from the line times
  function beats(B) {
    const T = {};
    T.paint0 = B.C2a + .35;                 // the far ranges bloom in under the chapter title
    T.glow0 = B.N40 + .3; T.glow1 = B.N40 + 3.6;               // the place of light opens
    T.ring0 = B.Q40 + .25; T.ring1 = B.Q40 + 7.6;               // the grain of light spreads: lines + colour join in order
    T.man0 = B.Q40 + 1.6;                                        // the man is painted in with the ring
    T.turn = B.N41 + 1.2;                                        // he turns his back on the light (.5 s, on twos)
    T.walk0 = T.turn + .7; T.walk1 = T.turn + 4.6;
    T.drop = B.N42 + .5;                                         // the drop falls (.45 s)
    T.flood0 = T.drop + .45; T.flood1 = T.flood0 + 6.2;          // the flood spreads (fall.html: 6.2 s)
    T.push0 = T.flood0; T.push1 = T.flood0 + 2.4;                // push-in on the ink edge
    T.crouch = T.flood0 + 1.1;                                   // the man crouches as the ink reaches him
    T.gold0 = B.N43 + .5;                                        // the gold point shows
    T.toGold0 = B.N43 + .1; T.toGold1 = B.N43 + 4.6;             // the camera comes to rest on it
    T.white0 = B.N44 - 1.7; T.white1 = B.N44 + .05;              // the point grows into the village sun
    // second visit
    T.back0 = B.N46c;                                            // dissolved in from the table light (page: 0.8 s)
    T.rec0 = B.Q44 + .5; T.rec1 = T.rec0 + 9;                    // the same flood, backwards
    T.pull0 = B.Q44 + .9; T.pull1 = T.pull0 + 7.4;               // pull-back reveal of the whole garden
    T.rise = T.rec0 + 4.6;                                       // the man stands as the ink leaves him
    T.ring2 = B.N47 + .3; T.ring3 = B.N47 + 8;                   // the grain of light again
    T.return = B.N47 + 3.2;                                      // the man turns back to the light
    T.end = B.C2;
    return T;
  }

  // ---------------------------------------------------------------- brush (fall.html) — frame units, plate contexts pre-scaled
  function brush(x, pts, wfn, tone, o = {}) {
    const r = rng(o.seed || 1), n = o.n || 18, dry = o.dry || 0, N = pts.length, C = o.col || INK;
    const len = []; let acc = 0; for (let i = 0; i < N; i++) { if (i) acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); len.push(acc); }
    const nrm = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1; return [nx / l, ny / l]; });
    x.lineCap = 'round'; x.lineJoin = 'round';
    for (let b = 0; b < n; b++) { const k = n === 1 ? 0 : b / (n - 1) - .5, side = o.loaded ? .55 + .45 * (k + .5) : 1, bj = (r() - .5) * .25, lw0 = .9 + r() * .8, bt = .78 + .22 * r(), ld = .6 + .6 * r();
      let open = false;
      const pt = i => { const w = wfn(len[i] / (acc || 1)), off = (k + bj / n) * w; return [pts[i][0] + nrm[i][0] * off, pts[i][1] + nrm[i][1] * off, w]; };
      for (let i = 1; i < N; i++) { const s = len[i] / (acc || 1), load = 1 - dry * s * ld, brk = dry > 0 && noise(len[i] / 26 + b * 13.1, b * 3.7) < dry * .55 * (.4 + s);
        if (brk || load <= 0) { if (open) { x.stroke(); open = false; } continue; }
        if (!open) { const p0 = pt(i - 1); x.strokeStyle = rgb(C, tone * load * side * bt); x.lineWidth = Math.max(.6, (p0[2] + wfn(.5)) / 2 / n * 2.1 * lw0); x.beginPath(); x.moveTo(p0[0], p0[1]); open = true; }
        const p1 = pt(i); x.lineTo(p1[0], p1[1]); }
      if (open) x.stroke(); }
  }
  const curve = (a, c, b, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const s = i / n, u = 1 - s; return [u * u * a[0] + 2 * u * s * c[0] + s * s * b[0], u * u * a[1] + 2 * u * s * c[1] + s * s * b[1]]; });
  const taper = (a, b) => s => lerp(a, b, s) * Math.min(1, s * 8 + .2);
  function dab(x, cx, cy, rx, ry, tone, rot = 0, C = INK) {   // a wet dab: dark rim (edge pigment), paler inside
    x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(1, ry / rx);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, rgb(C, tone * .6)); g.addColorStop(.78, rgb(C, tone * .8)); g.addColorStop(.92, rgb(C, tone)); g.addColorStop(1, rgb(C, 0));
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, 6.283); x.fill(); x.restore();
  }
  // iron-wire line (鐵線描): thin, even, unbroken — a faint bleed under a firm line, a tiny tremor of the hand
  function iron(x, pts, w = 1.5, tone = .85, C = INK, seed = 1) {
    const r = rng(seed); x.lineCap = 'round'; x.lineJoin = 'round';
    const path = () => { x.beginPath(); pts.forEach((p, i) => { const j = (r() - .5) * .35; i ? x.lineTo(p[0] + j, p[1] + j) : x.moveTo(p[0], p[1]); }); };
    path(); x.strokeStyle = rgb(C, tone * .12); x.lineWidth = w * 3; x.stroke();
    path(); x.strokeStyle = rgb(C, tone); x.lineWidth = w; x.stroke();
  }
  const fillPath = (x, pts, C, a) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fillStyle = rgb(C, a); x.fill(); };
  // a pale mineral wash: a few overlapping soft fills (pooled edge darker), granulation dots
  function mineral(x, pts, C, a, seed) {
    const r = rng(seed); x.save(); x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.clip();
    const bb = pts.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [1e9, 1e9, -1e9, -1e9]);
    x.fillStyle = rgb(C, a * .7); x.fillRect(bb[0] - 2, bb[1] - 2, bb[2] - bb[0] + 4, bb[3] - bb[1] + 4);
    for (let i = 0; i < 6; i++) dab(x, lerp(bb[0], bb[2], r()), lerp(bb[1], bb[3], r()), (bb[2] - bb[0]) * (.3 + r() * .3) + 4, (bb[3] - bb[1]) * (.3 + r() * .3) + 4, a * .35, r() * 3, C);
    for (let i = 0; i < (bb[2] - bb[0]) * (bb[3] - bb[1]) / 90; i++) { x.fillStyle = rgb(C, a * (.3 + r() * .5)); x.fillRect(lerp(bb[0], bb[2], r()), lerp(bb[1], bb[3], r()), .8 + r(), .8 + r()); }
    x.restore();
    x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.strokeStyle = rgb(C, a * .5); x.lineWidth = 2.2; x.stroke();   // pooled rim
  }
  // a mountain range in wash (fall.html range(), written at plate resolution): peaks [[cx, h, halfw]] in frame fractions
  function range(x, peaks, base, tone, depth, cun, seed, C = INK) {
    const ridge = px => { let m = 0; for (const [c, h, w] of peaks) { const u = Math.abs(px - c * W) / (w * W); if (u < 1) m = Math.max(m, h * H * Math.pow(1 - u, 1.35) * (1 + .1 * Math.sin(px * .03 + c * 9))); }
      return base * H - m - 14 * (fbm(px * .01, seed, 3) - .5) - (m > 0 ? 18 * (fbm(px * .02 + seed, 3, 3) - .5) : 0); };
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
    const d = x.getImageData(0, 0, PW, PH), D = d.data;
    for (let qx = 0; qx < PW; qx++) { const px = qx / PS, top = ridge(px), dd = depth * H * (.4 + .6 * clamp((base * H - top) / (H * .2)));
      for (let qy = Math.max(0, top * PS | 0); qy < Math.min(PH, (top + dd) * PS); qy++) { const y = qy / PS, k = (y - top) / dd, n = fbm(px * .015, y * .015, 3);
        const pk = clamp((base * H - top - 8) / 40); let a = (tone * (1 - Math.pow(k, .55)) * (.6 + .7 * n) + (y - top < 2.5 ? tone * 1.6 : 0) + (y - top < 12 ? tone * .45 * (1 - (y - top) / 12) : 0)) * pk;
        a = clamp(a); if (a < .005) continue; const i = (qy * PW + qx) * 4; D[i] = C[0]; D[i + 1] = C[1]; D[i + 2] = C[2]; D[i + 3] = Math.max(D[i + 3], a * 255); } }
    x.putImageData(d, 0, 0); x.restore();
    if (cun) { const r = rng(seed * 7);
      for (let i = 0; i < cun; i++) { const pk = peaks[(r() * peaks.length) | 0], px = (pk[0] + (r() - .5) * 1.6 * pk[2]) * W, top = ridge(px); if (base * H - top < 30) continue;
        const sl = (ridge(px + 8) - ridge(px - 8)) / 16, dir = sl < 0 ? -1 : 1, l = 30 + r() * 80, y0 = top + 4 + r() * 16;
        brush(x, curve([px, y0], [px + dir * l * .25, y0 + l * .5], [px + dir * l * .38 + (r() - .5) * 10, y0 + l]), taper(3.6, .8), tone * 1.5, { n: 5, dry: .65, seed: i + 3 }); }
      for (let i = 0; i < cun * .5; i++) { const pk = peaks[(r() * peaks.length) | 0], px = (pk[0] + (r() - .5) * 1.4 * pk[2]) * W, top = ridge(px); if (base * H - top < 40) continue; dab(x, px, top + 1 + r() * 5, 2 + r() * 3, 1.4 + r() * 2.2, .92, r()); } }
    return ridge;
  }
  // a tree's trunk and limbs as loaded strokes, leaning toward the light; returns the branch tips
  function trunk(x, bx, by, h, seed, lean, tone = .78) {
    const r = rng(seed), tips = [];
    const go = (p, ang, len, w, d) => { const e = [p[0] + Math.sin(ang) * len, p[1] - Math.cos(ang) * len], m = [(p[0] + e[0]) / 2 + Math.cos(ang) * len * (r() - .5) * .3, (p[1] + e[1]) / 2 + Math.sin(ang) * len * (r() - .5) * .3];
      brush(x, curve(p, m, e, 24), taper(w, w * .55), tone, { n: Math.max(4, Math.round(w / 2.2)), loaded: true, dry: .18 + (3 - d) * .08, seed: seed + tips.length * 7 + d });
      if (d <= 0) { tips.push(e); return; }
      const k = d === 3 ? 3 : 2 + (r() < .4 ? 1 : 0);
      for (let i = 0; i < k; i++) { const sp = k === 2 ? (i ? 1 : -1) * (.35 + r() * .35) : (i - 1) * (.55 + r() * .25); go(e, ang + sp * .85 + lean * .18 + (r() - .5) * .2, len * (.6 + r() * .18), w * .62, d - 1); } };
    go([bx, by], lean * .35, h * .4, h * .075, 3);
    brush(x, curve([bx - h * .18, by + 5], [bx, by - 6], [bx + h * .2, by + 7]), taper(h * .026, h * .008), .45, { n: 10, dry: .5, seed: seed + 99 });
    return tips;
  }

  // ---------------------------------------------------------------- plates
  const mkPlate = () => { const c = canvas(PW, PH), x = c.getContext('2d'); x.setTransform(PS, 0, 0, PS, 0, 0); return [c, x]; };
  // reveal field (frame units → seconds of film time when a pixel appears)
  const fieldOf = fn => { const f = new Float32Array(FW * FH); for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) f[j * FW + i] = fn((i + .5) * 4 / PS, (j + .5) * 4 / PS); return f; };
  const ringR = (t, t0, t1) => 980 * eo(clamp((t - t0) / (t1 - t0)));   // the ring front's radius (frame px)
  let TREES = [];
  function paintAll(T) {
    const R = rng(4);
    // ---- wash: far ranges (blue-green tint goes to the colour layer), near ranges, river banks, trees, village, fields, ground
    const [wFar, xFar] = mkPlate(), [wNear, xNear] = mkPlate(), [wTree, xTree] = mkPlate(), [wGround, xGround] = mkPlate();
    { const r = rng(9); xFar.save(); xFar.filter = 'blur(26px)'; for (let i = 0; i < 14; i++) { xFar.fillStyle = rgb(INK, .07 + r() * .06); xFar.beginPath(); xFar.ellipse(r() * W, r() * 300 - 20, 200 + r() * 260, 40 + r() * 50, (r() - .5) * .15, 0, 6.283); xFar.fill(); } xFar.restore();
      const g = xFar.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, rgb(INK, .26)); g.addColorStop(.6, rgb(INK, .1)); g.addColorStop(1, rgb(INK, 0)); xFar.fillStyle = g; xFar.fillRect(0, 0, W, 420); }
    range(xFar, [[.2, .12, .26], [.62, .16, .3], [.92, .1, .2], [.42, .07, .16]], .335, .12, .1, 0, 3);
    range(xNear, [[.04, .1, .24], [.96, .12, .26], [.78, .06, .14]], .4, .28, .08, 70, 8);
    // the river: a ribbon of blank paper from the far left valley, past the light on its left, out at the lower right
    const RIV = curve([96, 548], [250, 640], [214, 742], 22).concat(curve([214, 742], [170, 840], [262, 930], 22).slice(1), curve([262, 930], [340, 1010], [196, 1130], 22).slice(1), curve([196, 1130], [90, 1220], [40, 1330], 16).slice(1));
    const rivW = s => lerp(14, 150, Math.pow(s, 1.2));
    for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {   // dry bank strokes along both edges
      const pts = RIV.map((p, i) => { const s = i / (RIV.length - 1), a = RIV[Math.min(RIV.length - 1, i + 1)], b = RIV[Math.max(0, i - 1)], nx = -(a[1] - b[1]), ny = a[0] - b[0], l = Math.hypot(nx, ny) || 1; return [p[0] + side * nx / l * (rivW(s) / 2 + 6 + k * 7), p[1] + side * ny / l * (rivW(s) / 2 + 6 + k * 7)]; });
      brush(xNear, pts, taper(3.4 - k, .8), .34 - k * .07, { n: 4, dry: .55, seed: 40 + k + (side > 0 ? 9 : 0) }); }
    // ground washes (pale), darker toward the foreground; reeds by the river
    for (let i = 0; i < 26; i++) { const y = 880 + R() * 420, x0 = R() * W, l = 120 + R() * 300; if (Math.hypot(x0 + l / 2 - LIGHT[0], y - LIGHT[1]) < 150) continue; brush(xGround, curve([x0, y], [x0 + l / 2, y - 4], [x0 + l, y + 2]), taper(5, 1.4), .14 + .14 * clamp((y - 900) / 400), { n: 7, dry: .7, seed: 60 + i }); }
    for (let i = 0; i < 40; i++) { const s = .35 + R() * .5, p = RIV[(s * (RIV.length - 1)) | 0], bx = p[0] + (R() < .5 ? -1 : 1) * (rivW(s) / 2 + 10 + R() * 30), by = p[1] + R() * 10, h = 18 + R() * 30, lean = (LIGHT[0] - bx) * .04;
      brush(xGround, curve([bx, by], [bx + lean * .3, by - h * .5], [bx + lean, by - h]), taper(2.4, .4), .5, { n: 2, seed: 90 + i }); }
    // the clearing of light: the ground around it is left as paper; the tone deepens away from it (everything turns to it)
    { const g = xGround.createRadialGradient(LIGHT[0], LIGHT[1], 150, LIGHT[0], LIGHT[1] + 80, 760); g.addColorStop(0, rgb(INK, 0)); g.addColorStop(.5, rgb(INK, .07)); g.addColorStop(1, rgb(INK, .2));
      xGround.fillStyle = g; xGround.fillRect(0, 420, W, H - 420); }
    // the foreground: heavy wet rocks and dark grass at the bottom of the sheet (under the words)
    { const r = rng(19); for (let i = 0; i < 26; i++) { const x0 = (i / 25) * W + (r() - .5) * 60, y0 = 1180 + r() * 120 + Math.abs(x0 - W / 2) * .1;
        dab(xGround, x0, y0, 70 + r() * 90, 30 + r() * 30, .22 + r() * .16, (r() - .5) * .3); dab(xGround, x0 + 10, y0 + 40, 90 + r() * 80, 50, .22, 0); }
      const g = xGround.createLinearGradient(0, 1160, 0, H); g.addColorStop(0, rgb(INK, 0)); g.addColorStop(.25, rgb(INK, .2)); g.addColorStop(1, rgb(INK, .3)); xGround.fillStyle = g; xGround.fillRect(0, 1160, W, H - 1160);
      for (let i = 0; i < 60; i++) { const bx = r() * W, by = 1170 + r() * 100, h = 30 + r() * 50, lean = (LIGHT[0] - bx) * .05; brush(xGround, curve([bx, by], [bx + lean * .3, by - h * .5], [bx + lean, by - h]), taper(3, .5), .6, { n: 3, seed: 300 + i }); } }
    // a soft pale wash ring holds the clearing
    for (let i = 0; i < 18; i++) { const a = R() * 6.283, rr = 170 + R() * 60; dab(xGround, LIGHT[0] + Math.cos(a) * rr, LIGHT[1] + 40 + Math.sin(a) * rr * .35, 40 + R() * 40, 12 + R() * 10, .07, 0); }
    // trees: crowns lean toward the light (lean sign), placed around the clearing
    TREES = [
      { k: 'pine', x: 936, y: 1150, h: 520, seed: 11, lean: -.4 },
      { k: 'fruit', x: DEADTREE[0], y: DEADTREE[1], h: 300, seed: 21, lean: -.42 },
      { k: 'fruit', x: 318, y: 872, h: 220, seed: 31, lean: .32 },
      { k: 'fruit', x: 640, y: 694, h: 140, seed: 41, lean: -.2 },
      { k: 'pine', x: 846, y: 712, h: 170, seed: 51, lean: -.3 },
      { k: 'fruit', x: 92, y: 1000, h: 260, seed: 61, lean: .4 },
    ];
    for (const tr of TREES) tr.tips = trunk(xTree, tr.x, tr.y, tr.h, tr.seed, tr.lean, tr.k === 'pine' ? .82 : .74);
    // pine needles' wash masses and fruit-tree foliage masses (pale ink under the colour)
    for (const tr of TREES) { const r = rng(tr.seed + 5);
      for (const [cx, cy] of tr.tips) { const rad = tr.h * (tr.k === 'pine' ? .1 : .13);
        for (let j = 0; j < (tr.k === 'willow' ? 4 : 20); j++) { const a = r() * 6.283, q = Math.sqrt(r());
          dab(xTree, cx + Math.cos(a) * rad * q + tr.lean * 10, cy + Math.sin(a) * rad * .6 * q - rad * .2, rad * (.2 + r() * .26), rad * (.12 + r() * .14), .08 + r() * .14, r() * 3); }
        if (tr.k !== 'willow') for (let j = 0; j < 6; j++) { const a = r() * 6.283, q = .4 + .6 * r(); dab(xTree, cx + Math.cos(a) * rad * q, cy + Math.sin(a) * rad * .6 * q - rad * .2, 2.5 + r() * 4, 2 + r() * 3, .55 + r() * .3, r() * 3); }
        if (tr.k === 'pine') for (let j = 0; j < 3; j++) { const px = cx + (r() - .5) * rad, py = cy - rad * .1 + j * 6; dab(xTree, px, py, rad * (.9 + r() * .4), rad * .22, .2 + r() * .1, tr.lean * .2); } } }
    // the village: a few flat-roofed houses on the far bank, terraced fields on the right slope (wash)
    const HOUSES = [[318, 646, 34], [362, 656, 40], [404, 648, 30], [282, 664, 28], [440, 668, 34], [120, 640, 26]];
    for (const [hx, hy, hw] of HOUSES) { brush(xTree, [[hx - hw / 2, hy], [hx + hw / 2, hy]], () => 2.4, .5, { n: 3, seed: hx }); dab(xTree, hx, hy + 10, hw * .6, 8, .08, 0); }
    const FIELDS = [];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) { const x0 = 660 + i * 130 + j * 26 + (j % 2) * 30, y0 = 616 + j * 20, w = 110 + 16 * Math.sin(i + j), h = 13; FIELDS.push([[x0, y0], [x0 + w * .5, y0 - 3], [x0 + w, y0 + 1], [x0 + w + 4, y0 + h], [x0 + w * .5, y0 + h + 3], [x0 + 3, y0 + h - 1]]); }
    for (const f of FIELDS) brush(xGround, [f[0], f[1]], () => 1.6, .25, { n: 2, seed: f[0][0] | 0 });
    LAY.push({ c: wFar, f: fieldOf((x, y) => T.paint0 + 2.6 * clamp(x / W) + (fbm(x * .006, y * .006, 3) - .5) * .9), dur: 1.2 });
    LAY.push({ c: wNear, f: fieldOf((x, y) => T.paint0 + 1.6 + 2.4 * clamp(1 - x / W) * .6 + 2.2 * clamp((y - 400) / 900) + (fbm(x * .006, y * .006, 3) - .5) * 1), dur: 1.2 });
    LAY.push({ c: wGround, f: fieldOf((x, y) => T.paint0 + 3.4 + Math.hypot(x - LIGHT[0], y - LIGHT[1]) / 260 + (fbm(x * .008, y * .008, 3) - .5) * 1), dur: 1.4 });
    LAY.push({ c: wTree, f: fieldOf((x, y) => T.paint0 + 4.6 + clamp((1100 - y) / 500) * 2.2 + (fbm(x * .01, y * .01, 3) - .5) * .8), dur: 1.2 });

    // ---- lines (iron-wire) and colour: revealed by the ring of light, colour .7 s behind the line
    const [lc, lx] = mkPlate(), [cc, cx] = mkPlate(); linesC = lc; colourC = cc;
    // far ranges: the blue-green tint (青綠) along the ridges, contour lines on the near ranges
    range(cx, [[.2, .12, .26], [.62, .16, .3], [.92, .1, .2], [.42, .07, .16]], .335, .2, .05, 0, 3, AZU);
    range(cx, [[.04, .1, .24], [.96, .12, .26], [.78, .06, .14]], .4, .26, .05, 0, 8, MAL);
    // river: azurite wash and gongbi wave lines (rows of fine scallops along the current)
    { const left = [], right = [];
      RIV.forEach((p, i) => { const s = i / (RIV.length - 1), a = RIV[Math.min(RIV.length - 1, i + 1)], b = RIV[Math.max(0, i - 1)], nx = -(a[1] - b[1]), ny = a[0] - b[0], l = Math.hypot(nx, ny) || 1; left.push([p[0] - nx / l * rivW(s) / 2, p[1] - ny / l * rivW(s) / 2]); right.push([p[0] + nx / l * rivW(s) / 2, p[1] + ny / l * rivW(s) / 2]); });
      mineral(cx, left.concat(right.slice().reverse()), AZU, .22, 7);
      iron(lx, left, 1.4, .8, INK, 3); iron(lx, right, 1.4, .8, INK, 4);
      const rw = rng(33); for (let row = -2; row <= 2; row++) for (let i = 2 + (row & 1); i < RIV.length - 2; i += 3) { if (rw() < .35) continue; const s = i / (RIV.length - 1), p = RIV[i], a = RIV[i + 1], b = RIV[i - 1], tx = a[0] - b[0], ty = a[1] - b[1], tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl, off = row * rivW(s) * .17, sc = lerp(5, 14, s);
        const q0 = [p[0] + nx * off - tx / tl * sc, p[1] + ny * off - ty / tl * sc], q2 = [p[0] + nx * off + tx / tl * sc, p[1] + ny * off + ty / tl * sc], q1 = [p[0] + nx * (off - sc * .6), p[1] + ny * (off - sc * .6)];
        iron(lx, curve(q0, q1, q2, 6), .9, .38, AZU, i * 7 + row); } }
    // trees
    for (const tr of TREES) { const r = rng(tr.seed + 9);
      // trunk outline: two iron-wire lines just outside the wash trunk, bark rings
      if (tr.k === 'pine') {
        for (const [px, py] of tr.tips) { const fanA = -Math.PI / 2 + tr.lean * .5;   // needle fans (half-wheels) at each tip
          for (let j = 0; j < 2; j++) { const ox = px + (r() - .5) * 26, oy = py + (r() - .5) * 14, rad = tr.h * (.05 + r() * .02);
            const fan = []; for (let q = 0; q <= 16; q++) { const a = fanA - 1.2 + 2.4 * q / 16; fan.push([ox + Math.cos(a) * rad, oy + Math.sin(a) * rad * .62]); }
            mineral(cx, [[ox, oy]].concat(fan), MAL, .42, (px * 13 + j) | 0);
            for (let q = 0; q <= 16; q++) iron(lx, [[ox, oy], fan[q]], .75, .7, INK, q + j * 17); } }
      } else if (tr.k === 'fruit') {
        for (const [px, py] of tr.tips) { const rad = tr.h * .13; for (let j = 0; j < 12; j++) { const a = r() * 6.283, q = Math.sqrt(r()); dab(cx, px + Math.cos(a) * rad * q + tr.lean * 10, py + Math.sin(a) * rad * .6 * q - rad * .2, rad * (.25 + r() * .3), rad * (.15 + r() * .14), .2 + r() * .15, r() * 3, MAL); } }
        for (const [px, py] of tr.tips) for (let j = 0; j < 9; j++) { const a = r() * 6.283, q = Math.sqrt(r()), rad = tr.h * .11, lx0 = px + Math.cos(a) * rad * q + tr.lean * 10, ly0 = py + Math.sin(a) * rad * .6 * q - rad * .2, ang = r() * 6.283, L = 12 + r() * 9;
          const tip = [lx0 + Math.cos(ang) * L, ly0 + Math.sin(ang) * L], n1 = [-Math.sin(ang) * L * .3, Math.cos(ang) * L * .3], mid = [(lx0 + tip[0]) / 2, (ly0 + tip[1]) / 2];
          const leaf = curve([lx0, ly0], [mid[0] + n1[0], mid[1] + n1[1]], tip, 6).concat(curve(tip, [mid[0] - n1[0], mid[1] - n1[1]], [lx0, ly0], 6).slice(1));
          mineral(cx, leaf, r() < .25 ? OCH : MAL, .5, (lx0 * 7 + j) | 0); iron(lx, leaf, .8, .75, INK, j + (px | 0)); iron(lx, [[lx0, ly0], tip], .5, .5, INK, j);
          if (r() < .16) { const fx = lx0 + (r() - .5) * 10, fy = ly0 + 8; const ring = []; for (let q = 0; q <= 12; q++) ring.push([fx + Math.cos(q / 12 * 6.283) * 5, fy + Math.sin(q / 12 * 6.283) * 5]); mineral(cx, ring, CIN, .7, 900 + j); iron(lx, ring, .7, .8); } }
      } else {   // willow: long drooping iron lines, pale green streaks, swaying toward the light
        for (const [px, py] of tr.tips) for (let j = 0; j < 9; j++) { const x0 = px + (r() - .5) * 30, y0 = py + (r() - .5) * 10, L = 60 + r() * 90, dx = tr.lean * 30 + (r() - .5) * 14;
          const pts = curve([x0, y0], [x0 + dx * .3, y0 + L * .35], [x0 + dx, y0 + L], 12); iron(lx, pts, .7, .6, INK, j); brush(cx, pts, taper(4, 1), .35, { n: 3, seed: j, col: WIL }); }
      }
      // the trunk's outline in iron wire, following the wash trunk's first segment
      const top = [tr.x + Math.sin(tr.lean * .35) * tr.h * .4, tr.y - Math.cos(tr.lean * .35) * tr.h * .4], w0 = tr.h * .04;
      for (const sd of [-1, 1]) iron(lx, curve([tr.x + sd * w0, tr.y + 2], [(tr.x + top[0]) / 2 + sd * w0 * .9, (tr.y + top[1]) / 2], [top[0] + sd * w0 * .7, top[1]], 10), 1.2, .85, INK, tr.seed + sd);
      for (let j = 1; j < 5; j++) { const s = j / 5, px = lerp(tr.x, top[0], s), py = lerp(tr.y, top[1], s); iron(lx, curve([px - w0 * .8, py + 2], [px, py - 3], [px + w0 * .8, py + 1], 5), .7, .55, INK, j * 3 + tr.seed); }
      mineral(cx, [[tr.x - w0, tr.y], [top[0] - w0 * .7, top[1]], [top[0] + w0 * .7, top[1]], [tr.x + w0, tr.y]], OCH, .3, tr.seed);
    }
    // village houses: walls left paper, roofs outlined and washed slate-azurite; fields outlined, pale green and ochre
    for (const [hx, hy, hw] of HOUSES) { const wl = [[hx - hw / 2, hy], [hx + hw / 2, hy], [hx + hw / 2, hy + 18], [hx - hw / 2, hy + 18]], rf = [[hx - hw / 2 - 4, hy], [hx + hw / 2 + 4, hy], [hx + hw / 2, hy - 6], [hx - hw / 2, hy - 6]];
      mineral(cx, rf, AZU, .45, hx | 0); iron(lx, rf.concat([rf[0]]), .8, .8); iron(lx, wl.concat([wl[0]]), .7, .65); fillPath(cx, [[hx - 3, hy + 8], [hx + 3, hy + 8], [hx + 3, hy + 18], [hx - 3, hy + 18]], OCH, .5); }
    FIELDS.forEach((f, i) => { mineral(cx, f, i % 3 === 1 ? OCH : MAL, .22, i + 300); iron(lx, f.concat([f[0]]), .6, .3, INK, i); });
    // grass tufts everywhere on the ground, every blade leaning toward the light
    { const r = rng(77); for (let i = 0; i < 260; i++) { const x0 = r() * W, y0 = 860 + Math.pow(r(), .8) * 440; const dL = Math.hypot(x0 - LIGHT[0], y0 - LIGHT[1]); if (dL < 130) continue;
        const toward = Math.atan2(LIGHT[1] - y0, LIGHT[0] - x0), n = 3 + (r() * 4 | 0);
        for (let j = 0; j < n; j++) { const h = 10 + r() * 16 * clamp((y0 - 800) / 400 + .5), a = -Math.PI / 2 + clamp(Math.cos(toward) * .9, -.8, .8) + (r() - .5) * .35, bx = x0 + (r() - .5) * 10;
          iron(lx, curve([bx, y0], [bx + Math.cos(a) * h * .4, y0 + Math.sin(a) * h * .5], [bx + Math.cos(a) * h, y0 + Math.sin(a) * h], 5), .8, .55, INK, i * 9 + j); } } }
    const ringF = (x, y, d) => T.ring0 + (T.ring1 - T.ring0) * (Math.pow(clamp(Math.hypot(x - LIGHT[0], (y - LIGHT[1]) * 1.15) / 980), 1 / 1.0) * .82) + d + (fbm(x * .02, y * .02, 2) - .5) * .25;
    LAY.push({ c: lc, f: fieldOf((x, y) => ringF(x, y, 0)), dur: .45, lines: true });
    LAY.push({ c: cc, f: fieldOf((x, y) => ringF(x, y, .7)), dur: .9, colour: true });

    // ---- what the ink brings: a dead tree (where the fruit tree stands), a grave mound with its stone, withered grass
    const [fc, fx] = mkPlate(); fallenC = fc;
    { const r = rng(501);
      // the dead tree: bare black limbs over the fruit tree, dry, broken at the tips, its crown fallen to the ground
      trunk(fx, DEADTREE[0], DEADTREE[1], 330, 21, -.42, .95);
      for (let i = 0; i < 14; i++) { const x0 = DEADTREE[0] - 120 + r() * 220, y0 = DEADTREE[1] - 4 + r() * 16; brush(fx, curve([x0, y0], [x0 + 10, y0 - 3], [x0 + 18 + r() * 14, y0 + 2], 6), taper(2, .6), .7, { n: 2, seed: i }); }
      // the grave: a low mound in heavy wash, a standing stone, a few dry stems
      dab(fx, GRAVE[0], GRAVE[1], 78, 20, .62, -.05); dab(fx, GRAVE[0] - 10, GRAVE[1] - 6, 52, 13, .5, -.05);
      brush(fx, curve([GRAVE[0] - 80, GRAVE[1] + 4], [GRAVE[0], GRAVE[1] - 30], [GRAVE[0] + 82, GRAVE[1] + 6], 20), taper(4, 1.5), .85, { n: 6, dry: .4, seed: 7 });
      fillPath(fx, [[GRAVE[0] + 30, GRAVE[1] - 12], [GRAVE[0] + 31, GRAVE[1] - 58], [GRAVE[0] + 44, GRAVE[1] - 62], [GRAVE[0] + 52, GRAVE[1] - 56], [GRAVE[0] + 52, GRAVE[1] - 10]], INK, .78);
      for (let i = 0; i < 6; i++) { const bx = GRAVE[0] - 60 + r() * 120; brush(fx, curve([bx, GRAVE[1] + 4], [bx - 3, GRAVE[1] - 12], [bx - 8 + r() * 4, GRAVE[1] - 24]), taper(1.6, .3), .7, { n: 2, seed: 30 + i }); }
      // withered stems: the leaning grass now bent down, here and there
      for (let i = 0; i < 70; i++) { const x0 = r() * W, y0 = 880 + r() * 380; brush(fx, curve([x0, y0], [x0 + 4, y0 - 10], [x0 + 12, y0 - 4], 6), taper(1.4, .4), .62, { n: 2, seed: 40 + i }); }
    }

    // ---- the flood (fall.html): heavy ink with mottling and paler cauliflower blooms; reach field with tendrils at the top edge
    FLOOD = canvas(PW, PH); { const x = FLOOD.getContext('2d'), d = x.createImageData(PW, PH), D = d.data;
      for (let qy = 0; qy < PH; qy++) for (let qx = 0; qx < PW; qx++) { const i = qx / PS, y = qy / PS, n = fbm(i * .006, y * .006, 4), g = noise(i * .4, y * .4), bl = fbm(i * .012 + 40, y * .012, 3);
        const dc = clamp(1 - Math.hypot(i - DROP[0], y - DROP[1]) / (H * 1.1)), a = clamp(.42 + .16 * n + .05 * g + .12 * dc - .1 * Math.max(0, bl - .6) * 3), k = (qy * PW + qx) * 4; D[k] = INK[0]; D[k + 1] = INK[1]; D[k + 2] = INK[2]; D[k + 3] = a * 255; }
      x.putImageData(d, 0, 0); }
    floodF = new Float32Array(FW * FH); const tr = rng(61), tend = Array.from({ length: 6 }, (_, k) => [W * (.06 + .16 * k + tr() * .08), 60 + tr() * 110, 8 + tr() * 16]), top = 300;
    for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) { const px = (i + .5) * 4 / PS, py = (j + .5) * 4 / PS;
      let f = Math.hypot((px - DROP[0]) * .85, py - DROP[1]) / Math.max(W, H) * 1.25 + (fbm(px * .005, py * .005, 4) - .5) * .32;
      const ey = top + 250 + 130 * (fbm(px * .0021, 5.3, 3) - .5) * 2 + 40 * (fbm(px * .006, 2.1, 3) - .5) * 2 + 14 * (fbm(px * .025, py * .01, 3) - .5) * 2;
      if (py < ey) { let pen = Math.pow((ey - py) / 200, 1.1) * 1.3;
        for (const [tx0, tl, tw] of tend) { const up = ey - py; if (up > tl) continue; const dd = Math.abs(px - (tx0 + 14 * Math.sin(py * .03 + tx0))); pen *= 1 - .97 * Math.exp(-((dd / (tw * (1 - .6 * up / tl))) ** 2)) * (1 - (up / tl) ** 2); }
        f += pen; }
      floodF[j * FW + i] = f; }
  }

  // ---------------------------------------------------------------- per-frame masks
  const maskCanvas = () => { mk = canvas(FW, FH); mkx = mk.getContext('2d'); mk2 = canvas(FW, FH); mkx2 = mk2.getContext('2d'); };
  // reveal masks go to mk, flood masks to mk2 (so a colour layer can use both at once)
  function revealMask(f, t, dur) { const d = mkx.createImageData(FW, FH), D = d.data; for (let i = 0; i < FW * FH; i++) D[i * 4 + 3] = 255 * clamp((t - f[i]) / dur); mkx.putImageData(d, 0, 0); return mk; }
  function floodMask(p, lag = 0, soft = .07) { const d = mkx2.createImageData(FW, FH), D = d.data; for (let i = 0; i < FW * FH; i++) D[i * 4 + 3] = 255 * clamp((p - lag - floodF[i]) / soft); mkx2.putImageData(d, 0, 0); return mk2; }
  const fieldAt = (f, x, y) => f[clamp((y * PS / 4) | 0, 0, FH - 1) * FW + clamp((x * PS / 4) | 0, 0, FW - 1)];
  const floodAt = (p, x, y, soft = .07) => clamp((p - fieldAt(floodF, x, y)) / soft);
  // layer through a mask onto comp (multiply); extra: after the reveal mask, take out the flood (colour drains)
  function layerOn(c, maskA, outMask) {
    tmx.globalCompositeOperation = 'source-over'; tmx.clearRect(0, 0, PW, PH); tmx.drawImage(c, 0, 0);
    if (maskA) { tmx.globalCompositeOperation = 'destination-in'; tmx.drawImage(maskA, 0, 0, PW, PH); }
    if (outMask) { tmx.globalCompositeOperation = 'destination-out'; tmx.filter = 'blur(3px)'; tmx.drawImage(outMask, 0, 0, PW, PH); tmx.filter = 'none'; }
    tmx.globalCompositeOperation = 'source-over';
    cx_.globalCompositeOperation = 'multiply'; cx_.drawImage(tmp, 0, 0); cx_.globalCompositeOperation = 'source-over';
  }

  // flood progress: forward (fall.html eo), and the SAME curve backwards for the recession
  let T = null;
  function floodP(t) {
    if (t < T.back0 - 5) return 1.08 * eo(clamp((t - T.flood0) / (T.flood1 - T.flood0)));
    const k = clamp((t - T.rec0) / (T.rec1 - T.rec0));   // k 0 → 1: replay the forward curve from its end to its start
    return 1.08 * eo(1 - k);
  }
  function buildComp(t) {
    const p = floodP(t), q = x => Math.round(x * 400) / 400;
    const key = LAY.map(L => { const a = t - L.f._min, b = t - L.f._max - L.dur; return a < 0 ? 'n' : b > 0 ? 'y' : q(t); }).join() + '|' + q(p);
    if (key === compKey) return; compKey = key;
    cx_.globalCompositeOperation = 'source-over'; cx_.drawImage(paper, 0, 0);
    for (const L of LAY) {
      if (t < L.f._min) continue;
      const full = t > L.f._max + L.dur, m = full ? null : revealMask(L.f, t, L.dur);
      if (L.colour && p > 0) { layerOn(L.c, m, floodMask(p, -.01)); continue; }   // the colour drains where the ink has passed
      layerOn(L.c, m, null);
    }
    if (p > 0) {
      // the flood itself, then its dark tide line at the advancing (or retreating) edge
      const fm = floodMask(p); tmx.globalCompositeOperation = 'source-over'; tmx.clearRect(0, 0, PW, PH); tmx.drawImage(FLOOD, 0, 0);
      tmx.globalCompositeOperation = 'destination-in'; tmx.filter = 'blur(4px)'; tmx.drawImage(fm, 0, 0, PW, PH); tmx.filter = 'none';
      cx_.globalCompositeOperation = 'multiply'; cx_.drawImage(tmp, 0, 0);
      { const d = mkx.createImageData(FW, FH), D = d.data; for (let i = 0; i < FW * FH; i++) { const e = p - floodF[i]; D[i * 4 + 3] = e > 0 ? 255 * Math.exp(-(((e - .012) / .018) ** 2)) : 0; } mkx.putImageData(d, 0, 0);
        tmx.globalCompositeOperation = 'source-over'; tmx.clearRect(0, 0, PW, PH); tmx.fillStyle = rgb(INK, .5 * (1 - .55 * ss(1, 1.08, p))); tmx.fillRect(0, 0, PW, PH);
        tmx.globalCompositeOperation = 'destination-in'; tmx.drawImage(mk, 0, 0, PW, PH); cx_.drawImage(tmp, 0, 0); }
      // what the ink brings, a little behind its edge
      const fl = floodMask(p, .06, .09); tmx.globalCompositeOperation = 'source-over'; tmx.clearRect(0, 0, PW, PH); tmx.drawImage(fallenC, 0, 0);
      tmx.globalCompositeOperation = 'destination-in'; tmx.drawImage(fl, 0, 0, PW, PH); cx_.drawImage(tmp, 0, 0);
      cx_.globalCompositeOperation = 'source-over'; tmx.globalCompositeOperation = 'source-over';
    }
  }

  // ---------------------------------------------------------------- live things (frame units, drawn through the camera)
  // the man (fall.html xieyi figure, male: no hair stroke, short-cropped head); facing f (±1, |f| < 1 = mid-turn), crouch 0..1
  function man(x, px, py, h, crouch, f, tone = 1, C = INK) {
    const u = h / 100, P_ = pts => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
    x.save(); x.translate(px, py); x.scale(f * u, u); x.lineCap = 'round';
    if (crouch < .5) {
      const mass = P_([[0, -84], [6, -80], [9.5, -66], [7.5, -52], [9.5, -38], [8, -22], [6.5, -3], [-5, -2], [-7, -20], [-10, -40], [-10, -52], [-7, -66], [-6, -80]]);
      x.fillStyle = rgb(C, .36 * tone); x.fill(mass);
      x.strokeStyle = rgb(C, .85 * tone); x.lineWidth = 3.4; x.beginPath(); x.moveTo(-4, -84); x.bezierCurveTo(-10, -66, -11, -50, -8, -40); x.quadraticCurveTo(-6, -20, -5, -2); x.stroke();
      x.lineWidth = 2.8; x.beginPath(); x.moveTo(2, -79); x.quadraticCurveTo(7, -66, 6, -48); x.stroke();
      x.strokeStyle = rgb(C, .95 * tone); x.lineWidth = 1.6; x.beginPath(); x.moveTo(5, -30); x.lineTo(7.5, -1); x.moveTo(-3, -30); x.lineTo(-4.5, -1); x.stroke();
      x.fillStyle = rgb(C, .95 * tone); x.beginPath(); x.ellipse(2, -92, 6.2, 7.2, .1, 0, 6.283); x.fill();          // a short-cropped head
    } else {
      const mass = P_([[0, -50], [-9, -46], [-15, -35], [-16.5, -18], [-13, -3], [15, -3], [16, -10], [19, -28], [15, -34], [8, -40]]);
      x.fillStyle = rgb(C, .3 * tone); x.fill(mass);
      x.strokeStyle = rgb(C, .9 * tone); x.lineWidth = 3.4; x.beginPath(); x.moveTo(-1, -50); x.bezierCurveTo(-14, -46, -18, -30, -13, -3); x.stroke();
      x.lineWidth = 2.6; x.beginPath(); x.moveTo(-12, -6); x.quadraticCurveTo(4, -12, 19, -28); x.lineTo(15, -3); x.stroke();
      x.lineWidth = 2.8; x.beginPath(); x.moveTo(1, -46); x.quadraticCurveTo(10, -30, 21, -27); x.stroke();
      x.fillStyle = rgb(C, .95 * tone); x.beginPath(); x.ellipse(11, -44, 6, 6.6, .9, 0, 6.283); x.fill();   // head bowed onto the knees
    }
    x.restore();
  }
  // a deer (gongbi: iron-wire outline over a pale ochre body), facing the light; head lifts with `up`
  function deer(x, px, py, s, dir, up, a) {
    if (a <= .01) return; x.save(); x.translate(px, py); x.scale(dir * s, s); x.globalAlpha = a; x.lineCap = 'round'; x.lineJoin = 'round';
    const body = new Path2D('M-24,-30 C-12,-38 14,-38 22,-31 C27,-27 26,-19 20,-17 C8,-14 -12,-14 -22,-18 C-28,-21 -28,-27 -24,-30 Z');
    x.fillStyle = rgb(OCH, .5); x.fill(body); x.strokeStyle = rgb(INK, .85); x.lineWidth = 1.1; x.stroke(body);
    const hy = -1 * up;   // the neck rises toward the light
    x.beginPath(); x.moveTo(17, -32); x.quadraticCurveTo(24, -44 + hy * 4, 27, -54 + hy * 6); x.moveTo(22, -24); x.quadraticCurveTo(30, -38 + hy * 4, 31, -50 + hy * 6); x.stroke();
    const head = new Path2D(`M26,${-56 + hy * 6} C30,${-60 + hy * 6} 38,${-58 + hy * 6} 41,${-53 + hy * 6} C38,${-50 + hy * 6} 33,${-50 + hy * 6} 30,${-49 + hy * 6} Z`);
    x.fillStyle = rgb(OCH, .55); x.fill(head); x.stroke(head);
    x.beginPath(); x.moveTo(29, -58 + hy * 6); x.lineTo(26, -68 + hy * 6); x.lineTo(22, -72 + hy * 6); x.moveTo(26, -68 + hy * 6); x.lineTo(30, -73 + hy * 6); x.stroke();   // small antler
    for (const [lx, ph] of [[-19, 0], [-13, .6], [14, .3], [19, .9]]) { x.beginPath(); x.moveTo(lx, -17); x.lineTo(lx + 1 + ph, -6); x.lineTo(lx + ph * 2, 4); x.stroke(); }
    x.fillStyle = rgb(PAPER, .9); for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(-14 + i * 6, -27 + (i % 2) * 4, 1.4, 0, 6.283); x.fill(); }   // spots
    x.restore();
  }
  // a crane in flight (white body left as paper, black wing tips, a cinnabar crown), wings on twos
  function crane(x, px, py, s, dir, flap, a) {
    if (a <= .01) return; x.save(); x.translate(px, py); x.scale(dir * s, s); x.globalAlpha = a; x.lineCap = 'round';
    const wy = Math.sin(flap) * 16;
    x.fillStyle = rgb(PAPER, 1); x.strokeStyle = rgb(INK, .85); x.lineWidth = 1;
    const wing = new Path2D(`M-4,0 C-10,${-10 - wy} -24,${-16 - wy * 1.4} -40,${-12 - wy * 1.8} C-26,${-6 - wy} -14,-2 -4,3 Z`);
    x.fill(wing); x.stroke(wing); x.fillStyle = rgb(INK, .85); x.beginPath(); x.moveTo(-40, -12 - wy * 1.8); x.lineTo(-30, -10 - wy * 1.4); x.lineTo(-33, -6 - wy * 1.1); x.closePath(); x.fill();
    const body = new Path2D('M-12,2 C-4,-3 10,-3 16,0 C10,4 -4,6 -12,2 Z'); x.fillStyle = rgb(PAPER, 1); x.fill(body); x.stroke(body);
    x.beginPath(); x.moveTo(15, 0); x.lineTo(32, -3); x.stroke(); x.fillStyle = rgb(INK, .9); x.beginPath(); x.arc(32, -3, 2.2, 0, 6.283); x.fill(); x.fillStyle = rgb(CIN, .9); x.beginPath(); x.arc(32, -5.5, 1.5, 0, 6.283); x.fill();
    x.beginPath(); x.moveTo(-12, 2); x.lineTo(-30, 5); x.stroke();
    x.restore();
  }

  // ---------------------------------------------------------------- camera (frame point at the screen centre, zoom)
  function cam(t) {
    let c = [540, 960, 1.012 + .03 * eio(clamp((t - T.paint0) / 24))];
    const drift = 6 * Math.sin(t * .23);
    c[0] += drift;
    if (t < T.back0 - 5) {
      const kp = eio(clamp((t - T.push0) / (T.push1 - T.push0)));   // push-in on the advancing ink edge
      c = [lerp(c[0], 488, kp), lerp(c[1], 880, kp), lerp(c[2], 1.17, kp)];
      c = [c[0] + kp * 14 * eio(clamp((t - T.push1) / 5)), c[1], c[2] + .02 * clamp((t - T.push1) / 5)];
      const kg = eio(clamp((t - T.toGold0) / (T.toGold1 - T.toGold0)));   // come to rest on the gold point
      c = [lerp(c[0], LIGHT[0], kg), lerp(c[1], LIGHT[1], kg), lerp(c[2], 1.42, kg)];
      c[2] += .07 * eio(clamp((t - T.toGold1) / (T.white1 - T.toGold1)));
    } else {
      // second visit: on the gold point (as we left it), creep, then the pull-back reveal while the ink withdraws
      const kp = eio(clamp((t - T.pull0) / (T.pull1 - T.pull0)));
      c = [lerp(LIGHT[0] + 4 * Math.sin(t * .3), 540 + drift, kp), lerp(LIGHT[1], 930, kp), lerp(1.49 - .05 * clamp((t - T.back0) / 6), 1.0, kp)];
      c[2] += .045 * eio(clamp((t - T.pull1) / 12)); c[1] -= 24 * eio(clamp((t - T.pull1) / 12));
    }
    // keep the sheet filling the frame (no edge ever shows)
    const hw = W / (2 * c[2]), hh = H / (2 * c[2]); c[0] = clamp(c[0], hw, W - hw); c[1] = clamp(c[1], hh, H - hh);
    return c;
  }
  const camTf = (ctx, c) => { const z = c[2]; ctx.setTransform(z, 0, 0, z, W / 2 - c[0] * z, H / 2 - c[1] * z); };

  // ---------------------------------------------------------------- frame
  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    buildComp(t);
    const c = cam(t), p = floodP(t);
    ctx.save(); camTf(ctx, c);
    ctx.drawImage(comp, 0, 0, W, H);
    // the grain of light: thin rings travelling out of the light (gold ochre, multiplied into the paper), front first
    const rings = (t0, t1, a0) => { const Rf = ringR(t, t0, t1); if (Rf <= 0) return; const fade = a0 * (1 - .6 * ss(t1, t1 + 6, t)), drift = ((t - t0) * 9) % 26;
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      for (let k = 0; k < 40; k++) { const r = Rf - k * 26 + (Rf >= 979 ? drift : 0); if (r <= 8) break; if (r > 1000) continue;
        const a = fade * (.75 - .6 * r / 980) * (k === 0 ? 1 : .62) * (1 - p * .9) * (1 - ss(560, 760, r)); if (a <= .01) continue;
        ctx.lineWidth = k === 0 ? 2.4 : 1.5; ctx.strokeStyle = rgb([176, 118, 40], a); ctx.beginPath();
        for (let q = 0; q <= 72; q++) { const an = q / 72 * 6.283, w = 1 + .05 * (noise(Math.cos(an) * 2 + r * .01, Math.sin(an) * 2 + k) - .5); const X = LIGHT[0] + Math.cos(an) * r * w, Y = LIGHT[1] + Math.sin(an) * r * w * .87; q ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
        ctx.stroke(); }
      // the front itself glows a little (light, not ink)
      if (Rf < 740) { ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 7; ctx.strokeStyle = `rgba(255,214,130,${.16 * fade * (1 - p)})`; ctx.beginPath(); ctx.ellipse(LIGHT[0], LIGHT[1], Rf, Rf * .87, 0, 0, 6.283); ctx.stroke(); }
      ctx.restore(); };
    rings(T.ring0, T.ring1, 1); rings(T.ring2, T.ring3, 1);
    // the man: painted in with the ring; turns, walks away, crouches in the flood; stands again, turns back to the light
    { const tf = Math.floor(t * 12) / 12, rev = clamp((ringR(t, T.ring0, T.ring1) - Math.hypot(MAN0[0] - LIGHT[0], MAN0[1] - LIGHT[1])) / 80);
      let face = 1, x = MAN0[0], y = MAN0[1], cr = 0;
      const turnK = clamp((tf - T.turn) / .5); face = Math.cos(Math.PI * turnK); if (Math.abs(face) < .3) face = .3 * Math.sign(face || -1);
      const wk = clamp((tf - T.walk0) / (T.walk1 - T.walk0)); x = lerp(MAN0[0], MAN1[0], eio(wk)); y = lerp(MAN0[1], MAN1[1], eio(wk)) - (wk > 0 && wk < 1 ? Math.abs(Math.sin(wk * Math.PI * 6)) * 3 : 0);
      if (tf >= T.crouch) cr = 1;
      if (t > T.back0 - 5) { cr = tf < T.rise ? 1 : 0; const rk = clamp((tf - T.return) / .5); face = -Math.cos(Math.PI * rk); if (Math.abs(face) < .3) face = .3 * Math.sign(face || 1); x = MAN1[0]; y = MAN1[1]; }
      const a = t > T.back0 - 5 ? 1 : rev;
      if (a > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; man(ctx, x, y, 128, cr, face, a); ctx.restore(); } }
    // the deer (heads lift toward the light), cranes flying in toward it; both leave when the ink covers them
    { const Rf = Math.max(ringR(t, T.ring0, T.ring1), t > T.back0 - 5 ? 2000 : 0);
      for (const [dx, dy, dir] of DEER) { const rv = clamp((Rf - Math.hypot(dx - LIGHT[0], dy - LIGHT[1])) / 80), cov = floodAt(p, dx, dy - 20, .05), a = rv * (1 - cov);
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; deer(ctx, dx, dy, .95, -dir, .5 + .5 * Math.sin(t * .7 + dx), a); ctx.restore(); }
      const cr = [[0, 820, 470], [1, 900, 430], [2, 760, 410]];
      for (const [i, x0, y0] of cr) { const first = t < T.back0 - 5, tf = Math.floor(t * 12) / 12;
        // first visit: they glide in toward the light, then flee up and out when the ink comes; second: they come back in
        const k = first ? clamp(t - T.ring0 - 1.5 - i * .5, 0, 40) : 14 + clamp(t - T.rec0 - 3, 0, 30);
        const away = first ? ss(T.flood0 + .5, T.flood0 + 3.5, t) : 1 - ss(T.rec0 + 3, T.rec0 + 8.5, t), flee = first && away > .25;
        const px = x0 - k * 6 + away * 520 * (1 + i * .2), py = y0 + Math.sin(k * .4 + i) * 6 - away * 260, a = clamp((Rf - 300) / 200) * (1 - ss(.7, 1, away));
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; crane(ctx, px, py, .9 - i * .12, flee ? 1 : -1, tf * 7 + i, a); ctx.restore(); } }
    // the drop: forward a bead falls and blooms; backward the ink gathers into the bead and it lifts off the paper
    { let k = -1; if (t > T.drop - .02 && t < T.flood0 + .25) k = clamp((t - T.drop) / .45); if (t > T.rec1 - .5 && t < T.rec1 + .5) k = 1 - clamp((t - T.rec1 + .05) / .45);
      if (k >= 0 && k <= 1) { const fy = lerp(DROP[1] - 150, DROP[1], k * k); ctx.fillStyle = rgb(INK, .9); ctx.beginPath(); ctx.ellipse(DROP[0], fy, 6, 8 + 6 * k, 0, 0, 6.283); ctx.fill(); } }
    // the place of light: a warm radiance on the axis everything leans to; dims under the ink (all but the gold point)
    { const g0 = ss(T.glow0, T.glow1, t), cov = floodAt(p, LIGHT[0], LIGHT[1], .12), a = g0 * (1 - cov) * (1 + .06 * Math.sin(t * 1.3));
      if (a > .01) { ctx.save();
        // gold washed into the paper around the light (multiply: on paper a light is a warm tone, the white kept at its heart)
        ctx.globalCompositeOperation = 'multiply';
        let g = ctx.createRadialGradient(LIGHT[0], LIGHT[1], 40, LIGHT[0], LIGHT[1], 420); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.25, `rgba(236,196,120,${.5 * a})`); g.addColorStop(.6, `rgba(226,186,120,${.22 * a})`); g.addColorStop(1, 'rgba(230,200,150,0)');
        ctx.fillStyle = g; ctx.fillRect(LIGHT[0] - 420, LIGHT[1] - 420, 840, 840);
        ctx.globalCompositeOperation = 'lighter';
        g = ctx.createRadialGradient(LIGHT[0], LIGHT[1], 0, LIGHT[0], LIGHT[1], 200); g.addColorStop(0, `rgba(255,236,190,${.5 * a})`); g.addColorStop(.3, `rgba(255,214,140,${.2 * a})`); g.addColorStop(1, 'rgba(230,170,90,0)');
        ctx.fillStyle = g; ctx.fillRect(LIGHT[0] - 200, LIGHT[1] - 200, 400, 400);
        ctx.globalCompositeOperation = 'screen';
        g = ctx.createRadialGradient(LIGHT[0], LIGHT[1] + 30, 0, LIGHT[0], LIGHT[1] + 30, 170); g.addColorStop(0, `rgba(255,240,200,${.45 * a})`); g.addColorStop(1, 'rgba(255,230,180,0)');
        ctx.save(); ctx.translate(LIGHT[0], LIGHT[1] + 30); ctx.scale(1, .32); ctx.translate(-LIGHT[0], -LIGHT[1] - 30); ctx.fillStyle = g; ctx.fillRect(LIGHT[0] - 170, LIGHT[1] - 140, 340, 340); ctx.restore();
        // gongbi gold rays: fine even lines, multiplied (gold ink on the paper), breathing slowly
        ctx.globalCompositeOperation = 'multiply';
        const r = rng(8); for (let i = 0; i < 30; i++) { const an = -Math.PI / 2 + (r() - .5) * 3.0, l = (110 + r() * 200) * (.92 + .08 * Math.sin(t * .8 + i)); ctx.strokeStyle = `rgba(200,140,50,${(.18 + r() * .2) * a})`; ctx.lineWidth = .9 + r() * .8;
          ctx.beginPath(); ctx.moveTo(LIGHT[0] + Math.cos(an) * 26, LIGHT[1] + Math.sin(an) * 22); ctx.lineTo(LIGHT[0] + Math.cos(an) * l, LIGHT[1] + Math.sin(an) * l * .8); ctx.stroke(); }
        ctx.restore(); } }
    // the gold point (fall.html): one tiny light the ink could not cover — shows once it is covered, stays until it is uncovered
    { const covered = floodAt(p, LIGHT[0], LIGHT[1], .12), ga = t < T.back0 - 5 ? ss(T.gold0, T.gold0 + 2.2, t) * covered : covered;
      if (ga > 0) { const gp = LIGHT, pul = 1 + .12 * Math.sin(t * 2.2), R0 = (5 + 8 * (t < T.back0 - 5 ? ss(T.gold0 + 1, T.gold0 + 8, t) : 1)) * pul;
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        let g = ctx.createRadialGradient(gp[0], gp[1], 0, gp[0], gp[1], R0 * 22); g.addColorStop(0, `rgba(250,196,90,${.8 * ga})`); g.addColorStop(.22, `rgba(220,150,60,${.28 * ga})`); g.addColorStop(1, 'rgba(200,140,50,0)');
        ctx.fillStyle = g; ctx.fillRect(gp[0] - R0 * 22, gp[1] - R0 * 22, R0 * 44, R0 * 44);
        const r = rng(8); for (let i = 0; i < 26; i++) { const a = r() * 6.283, l = R0 * (3 + r() * 9) * (t < T.back0 - 5 ? ss(T.gold0 + 1.5, T.gold0 + 9, t) : 1); ctx.strokeStyle = `rgba(240,190,90,${(.08 + r() * .1) * ga})`; ctx.lineWidth = 1 + r();
          ctx.beginPath(); ctx.moveTo(gp[0], gp[1]); ctx.lineTo(gp[0] + Math.cos(a) * l, gp[1] + Math.sin(a) * l * .6); ctx.stroke(); }
        ctx.globalCompositeOperation = 'source-over'; g = ctx.createRadialGradient(gp[0], gp[1], 0, gp[0], gp[1], R0); g.addColorStop(0, `rgba(255,248,220,${ga})`); g.addColorStop(.5, `rgba(250,206,110,${ga})`); g.addColorStop(1, 'rgba(240,184,74,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gp[0], gp[1], R0, 0, 6.283); ctx.fill(); ctx.restore(); } }
    // paper fibres through everything (on the sheet, so they move with it)
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .1; ctx.drawImage(grain, 0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    // mist over the top of the sheet, a light warm vignette
    const vg = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .4, W / 2, H * .45, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(60,50,36,0)'); vg.addColorStop(1, 'rgba(60,50,36,.3)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // the gold point grows into the next shot's sun (N44): warm white from the centre
    const wk = ss(T.white0, T.white1, t);
    if (wk > 0 && t < T.back0 - 5) { const s = [W / 2, H / 2], R = lerp(40, Math.hypot(W, H) * .9, wk * wk);
      const g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], R); g.addColorStop(0, `rgba(255,248,226,${clamp(wk * 1.6)})`); g.addColorStop(.6, `rgba(255,236,196,${clamp(wk * 1.2)})`); g.addColorStop(1, `rgba(255,226,170,${wk * wk})`);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }

  function build(W0, H0) {
    W = W0; H = H0; V = H > W; PS = 1.2; PW = Math.round(W * PS); PH = Math.round(H * PS); FW = Math.ceil(PW / 4); FH = Math.ceil(PH / 4);
    tmp = canvas(PW, PH); tmx = tmp.getContext('2d'); comp = canvas(PW, PH); cx_ = comp.getContext('2d'); maskCanvas();
    // rice paper (fall.html): warm, cloud-mottled, long fibres, pulp flecks
    paper = canvas(PW, PH); { const x = paper.getContext('2d'), d = x.createImageData(PW, PH), D = d.data;
      for (let y = 0; y < PH; y++) for (let i = 0; i < PW; i++) { const m = fbm(i * .0034, y * .0034, 4), m2 = noise(i * .042, y * .042), v = 1 - .05 * m - .015 * m2, k = (y * PW + i) * 4;
        D[k] = PAPER[0] * v; D[k + 1] = PAPER[1] * v; D[k + 2] = PAPER[2] * v * .995; D[k + 3] = 255; }
      x.putImageData(d, 0, 0); const r = rng(2);
      for (let i = 0; i < 2200; i++) { const px = r() * PW, py = r() * PH, a = r() * 6.283, l = 8 + r() * 46; x.strokeStyle = `rgba(${r() < .5 ? '255,252,244' : '200,190,170'},${.12 + r() * .2})`; x.lineWidth = .5 + r() * .7;
        x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l * .5 + (r() - .5) * 6, py + Math.sin(a) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
      for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(120,104,80,${.1 + r() * .2})`; x.fillRect(r() * PW, r() * PH, 1 + r() * 1.5, 1 + r() * 1.5); } }
    grain = speckle(W / 2, H / 2, 30, 7, .4);
    return { beats, draw: (ctx, t, B) => { if (!T) { T = beats(B); paintAll(T); for (const L of LAY) { let a = 1e9, b = -1e9; for (const v of L.f) { if (v < a) a = v; if (v > b) b = v; } L.f._min = a; L.f._max = b; } } draw(ctx, t, B); } };
  }
  window.InkGarden = { build, beats };
})();
