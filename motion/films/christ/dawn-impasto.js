/* dawn-impasto.js — 「그리스도」 5부, the cross's shadow and the first dawn (2026-11-13 redraw: the knife-painted tomb exterior smeared
   the forms and viewers did not read "empty tomb" — 관리자 피드백; theology review r4 asked for the inside view). The file keeps its
   name (film.html loads it); the look is now light drawn by ray casting — clean forms, one light, restraint (README §7).
   await buildDawn() once, then dawnOil(ctx, u, mode):
     'tree'  u 0..5.1  (film 135.0–140.1, Q11 Acts 10:39 «나무에 달아 죽였으나»): the dove's light of the Jordan scene withdraws into
             darkness; on dark stony ground lies ONE shadow — the EMPTY cross (no body: 6차), long, laid away from us by a cold
             light behind the camera. 7차: rough-timber proportions (a heavy upright and beam, the beam short against the upright,
             no title board) — the thin long beam with a small board on top read as a telephone pole. The picture comes in from the
             dark (u 0–0.6) and the shadow only appears as the cold light comes up (u 1.15–2.4, 8차), after the Jordan figure has
             dissolved away — the upright never passes through the man in the water. No people, no faces. The camera drifts; the cold light breathes as clouds pass, then dims to
             near dark — so the tomb's dawn is the first warm light of the part.
     'tomb'  u 0..9.4  (film 139.5–148.9, Q12 Acts 10:40 «하나님이 사흘 만에 다시 살리사» + N15): inside the rock-hewn tomb looking
             out through its low door (Jn 20:5). Dark chamber, a burial bench cut along the right wall with the linen cloths lying
             there and the head cloth lying apart, still wrapped together as it was (Jn 20:6–7 «딴 곳에 쌌던 대로 놓여 있더라»); outside, the great round stone rolled back (Mk 16:4) and a
             garden in the sunrise (Mk 16:2 «해 돋을 때»). The sun comes up: the door turns gold, the light pours in (u 0.4–2.4,
             on «다시 살리사») across the floor onto the bench and the linen; during N15 it keeps growing gently, the chamber fills
             with warm bounce light, outside brightens. No person. The lower part stays dark and calm for the words.
   No words drawn. Deterministic (seeded noise only; every frame a function of u). */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, noise, canvas } = Pilot;
  const fbm = Pilot.fbm;
  let D = null;
  const nrm = (x, y, z) => { const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };

  async function buildDawn() {
    if (D) return D;
    const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
    const PW = Math.ceil(W * 1.1), PH = Math.ceil(H * 1.1), ox = (PW - W) / 2, oy = (PH - H) / 2;
    D = { W, H, V, PW, PH, ox, oy };
    buildTree(); buildTomb();
    D.grain = []; for (let i = 0; i < 6; i++) D.grain.push(Pilot.speckle(W >> 1, H >> 1, 60, 610 + i));
    { const c = canvas(64, 64), g = c.getContext('2d'), im = g.createImageData(64, 64);   // drifting cloud light over the cross ground
      for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const v = fbm(x / 64 * 4, y / 64 * 4, 4), i = (y * 64 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255 * clamp(.35 + v * .9); im.data[i + 3] = 255; }
      g.putImageData(im, 0, 0); D.cloud = c; }
    return D;
  }
  window.buildDawn = buildDawn;
  const toCanvas = (w, h, data) => { const c = canvas(w, h), g = c.getContext('2d'), im = g.createImageData(w, h); im.data.set(data); g.putImageData(im, 0, 0); return c; };

  // ======================================================================= 'tree': the shadow of the cross on dark ground
  function buildTree() {
    const { W, H, V, PW, PH, ox, oy } = D;
    // camera above the ground looking down at it (pitch th); the cross stands behind us, a cold light low behind us lays its
    // shadow away from us up the frame: the foot near (below the frame, under the words), the beam and the title far (upper third)
    // 8차: the foot of the shadow lies on the ground inside the frame (portrait ≈ .61 H, landscape ≈ .70 H, just above the words) —
    // with the upright running out at the bottom edge and a short beam near the top it read as a sword hilt
    const C = V ? { f: W * 1.25, cx: W * .5, cy: H * .36, th: .78, hc: 3.2, zb: 1.52, hx: 2.3, ks: 1.73, x0: 0 }
                : { f: H * 1.25, cx: W * .5, cy: H * .38, th: .74, hc: 3.2, zb: 2.1, hx: 1.6, ks: 1.64, x0: 0 };
    const st = Math.sin(C.th), ct = Math.cos(C.th);
    const Lt = nrm(.18, .62, -.76);   // toward the cold light: up and behind the camera, a little to the right
    const amb = new Uint8ClampedArray(PW * PH * 4), lit = new Uint8ClampedArray(PW * PH * 4);
    // the cross (empty: wood only), in its own units (h = height above ground .89 h for the upright: crucified() of bw-cross.js)
    // X across (h), s = height above ground (h). Signed distance (negative inside), union by min.
    const box = (x, s, x0, x1, s0, s1) => { const dx = Math.max(x0 - x, x - x1), ds = Math.max(s0 - s, s - s1); return dx > 0 && ds > 0 ? Math.hypot(dx, ds) : Math.max(dx, ds); };
    const crossD = (x, s) => {
      // 7차: rough timber — a heavy upright, a heavy beam set a little below its top, the beam short against the upright's long
      // shadow (no thin 'pole', no title board); the edges hewn, not ruled
      const rough = .006 * (noise(s * 9 + 3, x * 4) - .5) + .004 * (noise(s * 31, x * 17 + 2) - .5);
      // 8차: the upright stands on the ground (its foot at s = 0 is seen, a little wider where it goes into the earth); the beam
      // at about a third from the shadow's far end on screen (s ≈ .52 of .9 — perspective shortens the far part) and longer
      let d = box(x, s, -.05, .05, 0, .9) + rough;                    // the upright
      d = Math.min(d, box(x, s, -.05 - .012 * ss(.04, 0, s), .05 + .012 * ss(.04, 0, s), 0, .04) + rough);   // its foot, wedged in the ground
      d = Math.min(d, box(x, s, -.27, .27, .478, .565) + rough);     // the beam
      // 6차: the shadow of the empty cross only — no body on it (depict-christ-restraint: never the suffering body)
      return d; };
    // the ground: dry, stony earth as a height field (clods, half-buried stones, grit) lit by the cold light — no round pebbles
    const rot = (x, z) => [x * .8 - z * .6, x * .6 + z * .8];
    const hgt = (X, Z) => { const [a1, b1] = rot(X, Z), sA = noise(a1 * 4.3 + 3, b1 * 4.3), sB = noise(b1 * 11 + 1, a1 * 11 + 5);
      return .06 * fbm(X * 1.4, Z * 1.4, 3) + .012 * fbm(X * 6, Z * 6, 2) + .02 * ss(.7, .9, sA) + .006 * ss(.66, .86, sB) + .003 * noise(X * 34, Z * 34); };
    for (let py = 0; py < PH; py++) for (let px = 0; px < PW; px++) {
      const a = (px - ox - C.cx) / C.f, b = -(py - oy - C.cy) / C.f;
      const dy = b * ct - st, dz = b * st + ct; if (dy >= -.02) continue;
      const t = C.hc / -dy, X = a * t, Z = dz * t, i = (py * PW + px) * 4;
      const e = .012 * (1 + t * .15), h0 = hgt(X, Z), gx = (hgt(X + e, Z) - h0) / e, gz = (hgt(X, Z + e) - h0) / e;
      const [a1, b1] = rot(X, Z), stone = ss(.7, .9, noise(a1 * 4.3 + 3, b1 * 4.3));
      let al = (.26 + .12 * (fbm(X * 1.1 + 7, Z * 1.1, 3) - .5) + .1 * (noise(X * 13, Z * 13) - .5)) * (1 - stone * .5) + (.33 + .06 * noise(a1 * 9, b1 * 9)) * stone * .5;
      const nn = nrm(-gx, 1, -gz), ndl = Math.max(0, nn[0] * Lt[0] + nn[1] * Lt[1] + nn[2] * Lt[2]);
      // the shadow: ground → cross coords (s along Z from the foot, stretched by the low light); soft, softer further from the foot
      const s = (Z - C.zb) / (C.hx * C.ks), xx = (X - C.x0) / C.hx, d = crossD(xx, s), pen = .006 + .018 * clamp(s);
      const sh = 1 - .9 * (1 - ss(-pen, pen, d));
      // the pool of light: brightest around the beam, falling off towards the frame edges and towards us (the words below)
      const pz = (Z - (C.zb + C.hx * C.ks * .5)) / (C.hx * C.ks * .78), pxv = X / (C.hx * .9), pool = Math.exp(-(pxv * pxv * .7 + pz * pz * 1.1));
      const lv = al * ndl * pool * sh * 560, av = al * 46 * (.55 + .45 * pool);
      lit[i] = lv * .66; lit[i + 1] = lv * .74; lit[i + 2] = lv * .9; lit[i + 3] = 255;
      amb[i] = av * .7; amb[i + 1] = av * .78; amb[i + 2] = av * .95; amb[i + 3] = 255;
    }
    D.tr = { C, amb: toCanvas(PW, PH, amb), lit: toCanvas(PW, PH, lit) };
  }

  // ======================================================================= 'tomb': inside, looking out at the dawn
  function buildTomb() {
    const { W, H, V, PW, PH, ox, oy } = D;
    const C = V ? { f: W * .98, cx: W * .5, cy: H * .255, cam: .5 } : { f: H * .92, cx: W * .5, cy: H * .2, cam: .42 };
    // the chamber (metres; eye 1 m above the floor at x = cam): floor, ceiling, side walls, the door wall with its low door
    const FL = -1.3, CE = .75, LX = -1.35, RX = 1.65, ZF = 3.3, DX0 = -.62, DX1 = .36, DY0 = -1.2, DY1 = .22, DD = .45, BX = .78, BY = -.84;
    const GO = FL - .12, EDGE = ZF + 7.5, VAL = -7;   // the ground outside: a terrace before the door, then the slope falls to the valley
    const Ls = nrm(-.9, .5, 1);   // toward the sun: outside, up, to the left — its light runs in across the floor onto the bench
    const jag = (v, s) => .014 * (noise(v * 6 + s, s * 3) - .5) + .004 * (noise(v * 19 + s, 2) - .5);   // the door's hewn, uneven edges
    // the linen cloths lying on the bench (Jn 20:6), the head cloth lying apart, still wrapped together as it was (Jn 20:7)
    const LIN = [.8, 1.4, 1.45, 2.3], HCc = [1.12, 2.7], HCR = .34, HC = [HCc[0] - HCR, HCc[0] + HCR, HCc[1] - HCR, HCc[1] + HCR], DRP = [1.62, 2.0];
    // the head cloth's shape in its own frame: a soft roll of linen (lx along it, lz across), slumped a little, and its loose end
    const HCA = -.45, HL = .42, HRr = .062, HHt = .066;
    const hcAt = (x, z) => { const ca = Math.cos(HCA), sa = Math.sin(HCA), lx = (x - HCc[0]) * ca - (z - HCc[1]) * sa, lzr = (x - HCc[0]) * sa + (z - HCc[1]) * ca;
      const lz = lzr - .012 * Math.sin(lx * 11 + .5), ax = Math.abs(lx), cap = 1 - ss(HL / 2 - .028, HL / 2, ax);   // the axis wanders; the ends round off
      const R = HRr * (1 + .22 * (noise(lx * 7 + 2, 1) - .5)) * (.55 + .45 * Math.sqrt(cap)), q = 1 - (lz / R) * (lz / R);
      const out = { lx, lz, R, roll: q > 0 && ax < HL / 2 ? Math.pow(q, .45) * Math.pow(cap, .2) : 0, tail: 0 };
      // the loose end: the last turn unwound, lying out flat from the roll's near side towards us, ragged, its corner turned over
      const v = -(lz + R * .7), u0 = -.13, u1 = .15, tw = .1 + .02 * (noise(lx * 14, 3) - .5) + .025 * (lx - u0) / (u1 - u0);
      if (lx > u0 && lx < u1 && v > -.01 && v < tw) { const ed = ss(0, .012, tw - v) * ss(0, .015, lx - u0) * ss(0, .015, u1 - lx), turn = ss(-.25, .9, (v / tw) * 1.2 - .2) * ss(.06, .1, lx);
        out.tail = ed * (.0045 + .0018 * Math.sin(v * 90 + lx * 40) + .01 * turn * ss(.6, 1, v / tw)); }
      return out; };
    const hf = (x, z) => {
      let h = 0;
      // the linen cloths (6차: the flat board folded in the middle read as an open book): one long sheet of thin cloth lying slack on
      // the slab, the body gone from it — ragged, wandering edges that thin out to nothing, soft folds running along the slab and
      // meandering, a few creases slanting across, the cloth gathered in low rolls along its sides and sunk flat down the middle
      // where the body lay; one end of the near side slips over the bench's edge (drawn on the bench front, below)
      { const dk = ss(DRP[0], DRP[0] + .06, z) * (1 - ss(DRP[1] - .06, DRP[1], z));
        const x0 = lerp(LIN[0] + .035 + .06 * (fbm(z * 3.2 + 1, 7, 3) - .5), BX - .03, dk), x1 = LIN[1] - .01 + .06 * (fbm(z * 3.4 + 9, 3, 3) - .5);
        const z0 = LIN[2] + .06 * (fbm(x * 3.6, 5, 3) - .5), z1 = LIN[3] - .03 + .22 * (fbm(x * 4.2 + 4, 8, 3) - .5) + .04 * (noise(x * 14 + 2, 6) - .5) + .08 * ss(1.15, 1.35, x);   // the far edge ragged, not ruled
        const ex = Math.min(x - x0, x1 - x), ez = Math.min(z - z0, z1 - z);
        if (ex > 0 && ez > 0) {
          const edge = ss(0, .022, ex) * ss(0, .022, ez), hem = .0035 * Math.exp(-Math.pow((Math.min(ex, ez) - .012) / .008, 2));   // the hem: a thin lip, not a slab wall
          const wx = x + .05 * (noise(z * 3.5 + 2, x * 3.5) - .5), wz = z + .05 * (noise(x * 3.5 + 7, z * 3.5) - .5);
          const r1 = .5 + .5 * Math.sin(wx * 48 + 2.6 * Math.sin(wz * 4.5 + 1) + 1.7 * noise(wz * 2, 3));   // folds along the slab, wandering
          const r2 = .5 + .5 * Math.sin((wx * .55 + wz * .83) * 36 + 2 * noise(wx * 2, wz * 2 + 5));            // creases slanting across
          const r3 = .5 + .5 * Math.sin((wx * .9 - wz * .45) * 29 + 1.1);
          const xn = (x - (x0 + x1) / 2) / ((x1 - x0) / 2);
          const roll = .011 * Math.exp(-Math.pow(Math.abs(xn) - .72, 2) / .028) * (.6 + .8 * noise(z * 4 + 3, 2));   // gathered along the sides
          const sunk = 1 - .65 * Math.exp(-xn * xn / .16) * ss(LIN[2] + .1, LIN[2] + .3, z) * (1 - ss(LIN[3] - .3, LIN[3] - .1, z));    // flat down the middle
          const heap = .016 * Math.max(0, fbm(x * 2.6 + 1, z * 2.6, 3) - .48);
          h = Math.max(h, edge * (.004 + hem + (.009 * r1 * r1 * (.45 + .55 * noise(wx * 3, wz * 3)) + .006 * r2 * r2 * r2 * noise(wx * 2.5 + 4, wz * 2.5) + .004 * r3 * r3 * r3 * ss(.5, .8, noise(wx * 2 + 9, wz * 2))) * sunk + roll + heap)); } }
      // the head cloth (7차: the small rounded block read as a bar of soap; theology review: 개역개정 요 20:7 «딴 곳에 쌌던 대로 놓여
      // 있더라» — not a neat napkin): a length of the same linen lying a little apart, still in the round shape it was wound in —
      // a soft roll of cloth slumped on the slab, its turns showing as creases running round it and as a spiral at its ends, and the
      // loose end unwound and lying out flat towards us, ragged, its corner turned over
      { const H0 = hcAt(x, z);
        if (H0.roll > 0) { const { lx, lz, R } = H0, w1 = Math.sin(lx * 40 + lz / R * 2.2 + 1.4 * noise(lx * 6, 2)), w2 = Math.sin(lx * 23 - lz / R * 1.4 + 1);   // the turns: creases running round the roll, slanting
          const edge = ss(-.004, .004, lx - (.03 + lz * .9)) * .0035;   // where the outer turn ends, a layer's edge across the roll
          h = Math.max(h, HHt * (.8 + .3 * noise(lx * 5 + 3, 6)) * H0.roll - .007 * w1 * w1 * H0.roll + .0015 * w2 + edge * H0.roll + .0012 * (noise(x * 70, z * 70) - .5)); }
        if (H0.tail > 0) h = Math.max(h, H0.tail); }
      return h; };
    const inLin = (x, z) => x > BX && x < LIN[1] + .05 && z > LIN[2] - .05 && z < LIN[3] + .14;
    const inHC = (x, z) => x > HC[0] && x < HC[1] && z > HC[2] && z < HC[3];
    // geometry: the first surface a ray from the eye meets. returns [t, kind, nx, ny, nz] (kind: 0 rock, 1 cloth, 2 outside)
    const O = [C.cam, 0, 0];
    function hit(rx, ry) {   // ray direction (rx, ry, 1)
      let t = 1e9, k = 0, n = null;
      const tryP = (tt, kk, nn) => { if (tt > .05 && tt < t) { t = tt; k = kk; n = nn; } };
      if (ry < 0) tryP(FL / ry, 0, [0, 1, 0]);
      if (ry > 0) tryP(CE / ry, 0, [0, -1, 0]);
      if (rx < 0) tryP((LX - O[0]) / rx, 0, [1, 0, 0]);
      if (rx > 0) tryP((RX - O[0]) / rx, 0, [-1, 0, 0]);
      if (ry < 0) { const tt = BY / ry, x = O[0] + rx * tt; if (x > BX && x < RX && tt < ZF) tryP(tt, 0, [0, 1, 0]); }
      if (rx > 0) { const tt = (BX - O[0]) / rx, y = ry * tt; if (y > FL && y < BY && tt < ZF) tryP(tt, 0, [-1, 0, 0]); }
      if (ZF < t) { const x = O[0] + rx * ZF, y = ry * ZF;
        if (x > DX0 + jag(y, 1) && x < DX1 + jag(y, 2) && y > DY0 && y < DY1 + jag(x, 3)) {   // through the door: its jambs, lintel and sill, or out
          let tt = 1e9, nn = null; const zz = ZF + DD;
          if (rx < 0) { const a = (DX0 - O[0]) / rx; if (a > ZF && a < zz && a < tt) { tt = a; nn = [1, 0, 0]; } }
          if (rx > 0) { const a = (DX1 - O[0]) / rx; if (a > ZF && a < zz && a < tt) { tt = a; nn = [-1, 0, 0]; } }
          if (ry > 0) { const a = DY1 / ry; if (a > ZF && a < zz && a < tt) { tt = a; nn = [0, -1, 0]; } }
          if (ry < 0) { const a = DY0 / ry; if (a > ZF && a < zz && a < tt) { tt = a; nn = [0, 1, 0]; } }
          if (nn) { t = tt; k = 0; n = nn; } else { t = 1e9; k = 2; n = null; }
        } else { t = ZF; k = 0; n = [0, 0, -1]; } }
      // the cloths: march the heightfield just above the bench top
      if (ry < 0 && k !== 2) { const t0 = (BY + .1) / ry, t1 = BY / ry;
        if (t0 < t) { let prev = t0, hitT = 0; const N = 48, under = tt => { const x = O[0] + rx * tt, z = tt; if (!inLin(x, z) && !inHC(x, z)) return false; const h = hf(x, z); return h > 1e-4 && ry * tt < BY + h; };
          for (let j = 0; j <= N; j++) { const tt = lerp(t0, t1, j / N); if (tt > t) break;
            if (under(tt)) { let lo = prev, hi = tt; for (let q = 0; q < 7; q++) { const mid = (lo + hi) / 2; if (under(mid)) hi = mid; else lo = mid; } hitT = hi; break; } prev = tt; }
          if (hitT) { const x = O[0] + rx * hitT, z = hitT, e = .006, gx = (hf(x + e, z) - hf(x - e, z)) / (2 * e), gz = (hf(x, z + e) - hf(x, z - e)) / (2 * e);
            t = hitT; k = 1; n = nrm(-gx, 1, -gz); } } }
      return [t, k, n];
    }
    // sunlight reaching a point through the door (soft edges: the sun's disc and the scatter widen the penumbra with distance)
    function sunAt(x, y, z) {
      let m = 1e9; const s0 = (ZF - z) / Ls[2], s1 = (ZF + DD - z) / Ls[2];
      for (const s of (z < ZF ? [s0, s1] : [s1])) { const qx = x + Ls[0] * s, qy = y + Ls[1] * s; m = Math.min(m, qx - DX0, DX1 - qx, qy - DY0, DY1 - qy); }
      const w = .01 + .022 * Math.max(0, s1); return ss(-w, w, m);
    }
    const DC = [(DX0 + DX1) / 2, (DY0 + DY1) / 2, ZF + .1], BC = [.5, -1.0, 2.3];
    const N = PW * PH * 4, Bs = new Uint8ClampedArray(N), Bf = new Uint8ClampedArray(N), Bb = new Uint8ClampedArray(N), Ba = new Uint8ClampedArray(N), Op = new Uint8ClampedArray(N), Or = new Uint8ClampedArray(N);
    const SUN = [1, .8, .55], FILL = [.55, .62, .78], BOUNCE = [1, .72, .48];
    // the stone rolled back, outside: a great disc on its edge, turned a little toward us; the garden; an olive; the hills
    const S = [.42, GO + .82, 5.0], SR = .82, SN = nrm(.5, 0, -1), ST = .3;
    function outside(rx, ry, i) {
      const rl = Math.hypot(rx, ry, 1), dx = rx / rl, dy = ry / rl, dz = 1 / rl, sunDot = Math.max(0, dx * Ls[0] + dy * Ls[1] + dz * Ls[2]);
      let pre, ris;
      // sky: pre-dawn blue-grey / sunrise: gold at the horizon through rose to a pale blue, the sun's glow to the left
      const e = dy;
      { const k = clamp(e / .4); pre = [lerp(98, 58, k), lerp(106, 68, k), lerp(130, 104, k)];
        ris = k < .35 ? [255, lerp(222, 196, k / .35), lerp(168, 170, k / .35)] : [lerp(255, 176, (k - .35) / .65), lerp(196, 186, (k - .35) / .65), lerp(170, 196, (k - .35) / .65)];
        const g = Math.pow(sunDot, 5) * 90 + Math.pow(sunDot, 30) * 160; ris = ris.map((v, j) => Math.min(255, v + g * [1, .86, .62][j])); }
      // the far hills across the valley: two soft ranges, hazed by the morning air
      const az = dx / dz, h1 = .03 + .022 * fbm(az * 1.8 + 3, 1.7, 3), h2 = .012 + .016 * fbm(az * 3.1 + 8, 4.2, 3);
      if (e < h1) { pre = [70, 74, 94]; ris = [226, 176, 150]; }
      if (e < h2) { pre = [60, 64, 82]; ris = [196, 146, 122]; }
      // the ground: the terrace before the tomb (earth, grass, the groove the stone ran in), its edge, then the valley far below
      if (ry < 0) { const t = GO / ry, gx = O[0] + rx * t, gz = t;
        const shrubH = q => .55 * Math.max(0, fbm(q * .9 + 2, 3.3, 3) - .38) + .25 * Math.max(0, noise(q * 3.1, 7) - .55);
        const te = EDGE / 1, sxq = O[0] + rx * te, syq = ry * te;
        if (gz >= EDGE && syq < GO + shrubH(sxq)) { const rim = noise(sxq * 9, syq * 9) > .55 && syq > GO + shrubH(sxq) - .06; ris = rim ? [236, 196, 132] : [86, 84, 52].map(v => v * (.8 + .4 * noise(sxq * 7, syq * 7))); pre = [34, 38, 42]; }
        else if (gz < EDGE) { const g1 = fbm(gx * 1.4, gz * 1.4, 4), grass = fbm(gx * 6 + 3, gz * 6, 3), tuft = noise(gx * 14, gz * 9);
          let c = [lerp(150, 200, g1) * (.78 + .3 * grass), lerp(116, 150, g1) * (.78 + .3 * grass), lerp(70, 86, g1) * (.8 + .2 * grass)];
          if (Math.abs(gz - (S[2] + .02)) < .1) c = c.map(v => v * .6);   // the groove along the face, where the stone was rolled
          { const s = (S[2] - gz) / Ls[2]; if (s > 0) { const qx = gx + Ls[0] * s - S[0], qy = GO + Ls[1] * s - S[1]; if (Math.hypot(qx, qy) < SR * .96) c = c.map(v => v * .45); } }   // the stone's shadow
          ris = c; pre = [52, 56, 66].map(v => v * (.85 + .3 * g1)); }
        else { const tv = VAL / ry, vx = O[0] + rx * tv, vz = tv;
          if (e < h2) { const f = fbm(vx * .15, vz * .15, 4), haze = clamp((vz - 20) / 160);
            ris = [lerp(150, 214, f), lerp(124, 164, f), lerp(88, 132, f)].map((v, j) => lerp(v, [232, 182, 156][j], haze)); pre = [lerp(52, 66, haze), lerp(56, 70, haze), lerp(68, 90, haze)]; } } }
      // the stone: a great rough disc on its edge, turned a little toward us; its face is against the sun (shadowed, chiselled),
      // its rim takes the light
      { const den = rx * SN[0] + ry * SN[1] + SN[2], tt = ((S[0] - O[0]) * SN[0] + S[1] * SN[1] + S[2] * SN[2]) / den;
        const bS = [S[0] - SN[0] * ST, S[1], S[2] - SN[2] * ST], tb = ((bS[0] - O[0]) * SN[0] + bS[1] * SN[1] + bS[2] * SN[2]) / den;
        const at = (q, c0) => { const px = O[0] + rx * q - c0[0], py = ry * q - c0[1], pz = q - c0[2]; return [px, py, pz, Math.hypot(px, py, pz)]; };
        const rough = (p) => SR * (1 + .025 * (noise(Math.atan2(p[1], p[0]) * 3 + 5, 1) - .5));
        const fF = at(tt, S), fB = at(tb, bS);
        if (fF[3] < rough(fF)) { const rr = fF[3] / SR, rd = [fF[0] / fF[3], fF[1] / fF[3]], side = rd[0] * Ls[0] / Math.hypot(Ls[0], Ls[1]) + rd[1] * Ls[1] / Math.hypot(Ls[0], Ls[1]), tex = fbm(fF[0] * 5 + 9, fF[1] * 5, 4);
          const rim = ss(.88, .98, rr) * ss(.1, .6, side), bevel = ss(.8, .97, rr) * clamp(-side);
          const face = [70, 58, 50].map(v => v * (.72 + .56 * tex) * (1 - .12 * bevel));
          ris = face.map((v, j) => lerp(v, [255, 232, 186][j], rim)); pre = [42, 44, 54].map(v => v * (.85 + .3 * tex)); }
        else if (fB[3] < rough(fB)) { const side = (fB[0] * Ls[0] + fB[1] * Ls[1]) / fB[3] / Math.hypot(Ls[0], Ls[1]); const tx2 = fbm(fB[1] * 9, fB[2] * 9 + 3, 2); ris = (side > -.2 ? [236, 196, 140] : [96, 78, 62]).map(v => v * (.85 + .3 * tx2)); pre = [50, 52, 62]; } }   // its thickness: the edge of the wheel, lit
      Op[i] = pre[0]; Op[i + 1] = pre[1]; Op[i + 2] = pre[2]; Op[i + 3] = 255;
      Or[i] = ris[0]; Or[i + 1] = ris[1]; Or[i + 2] = ris[2]; Or[i + 3] = 255;
    }
    for (let py = 0; py < PH; py++) for (let px = 0; px < PW; px++) {
      const rx = (px - ox - C.cx) / C.f, ry = -(py - oy - C.cy) / C.f, i = (py * PW + px) * 4;
      const [t, k, n0] = hit(rx, ry);
      if (k === 2) { outside(rx, ry, i); continue; }
      const x = O[0] + rx * t, y = ry * t, z = t;
      // albedo: limestone hewn with the chisel (its marks catch the raking light as relief); the cloths linen-white with a weave
      let al, n = n0;
      const drape = k === 0 && n0[0] === -1 && Math.abs(x - BX) < 1e-4 && z > DRP[0] && z < DRP[1] && y > BY - (.1 + .035 * Math.sin((z - DRP[0]) * 15) + .02 * noise(z * 30, 1)) * Math.sin(Math.PI * (z - DRP[0]) / (DRP[1] - DRP[0])) ** .3;
      if (drape) { const fold = .5 + .5 * Math.sin(z * 24 + 2.4 * noise(z * 5, y * 8 + 2) + y * 9), dep = clamp((BY - y) / .1); n = nrm(-1, -.1, (fold - .5) * .9); al = [.9, .87, .81].map(v => v * (.72 + .28 * fold) * (1 - .25 * dep)); }   // the end of the linen hanging over the edge
      else if (k === 1) { let wv = .95 + .05 * Math.sin(x * 900) * Math.sin(z * 900);
        if (inHC(x, z)) { const H0 = hcAt(x, z);
          if (H0.roll > 0 && Math.abs(H0.lx) > HL / 2 - .05) { const yy = (y - BY - HHt * .45) / (HHt * .55), rr = Math.hypot(H0.lz / H0.R, yy), sp = rr * 2.4 - Math.atan2(yy, H0.lz) / 6.283, fr = sp - Math.floor(sp);   // the turns seen at the end: a spiral
            wv *= 1 - .55 * Math.exp(-Math.pow((fr - .5) / .12, 2)) * ss(HL / 2 - .04, HL / 2 - .02, Math.abs(H0.lx)); }
          if (H0.tail === 0 && H0.roll > 0 && H0.roll < .35) wv *= .7 + .3 * H0.roll / .35;   // the roll's foot in its own shadow
          if (H0.roll === 0 && H0.tail === 0) { const d = Math.abs(H0.lz) - H0.R; if (d > 0 && d < .03) wv *= .6 + .4 * d / .03; } }
        al = [.94 * wv, .91 * wv, .85 * wv]; }
      else { const [u1, v1] = Math.abs(n[1]) > .5 ? [x, z] : Math.abs(n[0]) > .5 ? [z, y] : [x, y];
        const tx = fbm(u1 * 1.8 + 5, v1 * 1.8, 4), pit = noise(u1 * 40, v1 * 40);
        const bump = (a, b) => .5 * fbm(a * 3, b * 3, 3) + .5 * Math.sin((a + b * .7) * 26 + 9 * fbm(a * 2, b * 2, 2)) * .08 * fbm(a * 1.3 + 4, b * 1.3, 2), eb = .01;
        const ga = (bump(u1 + eb, v1) - bump(u1 - eb, v1)) / (2 * eb) * .05, gb = (bump(u1, v1 + eb) - bump(u1, v1 - eb)) / (2 * eb) * .05;
        n = Math.abs(n[1]) > .5 ? nrm(-ga, n[1], -gb) : Math.abs(n[0]) > .5 ? nrm(n[0], -gb, -ga) : nrm(-ga, -gb, n[2]);
        const base = n0[1] > .5 ? .5 : .62, lv = base * (.74 + .5 * (tx - .5)) * (pit < .05 ? .86 : 1);
        al = [lv * 1.02, lv * .9, lv * .74]; }
      // ambient occlusion in the corners
      const dists = [y - FL, CE - y, x - LX, RX - x, ZF - z, (x > BX ? 9 : BX - x) + Math.max(0, y - BY) * 3];
      let ao = 1; for (const dd of dists) if (dd > .002) ao *= 1 - .4 * Math.exp(-dd / .22);
      let ndl = Math.max(0, n[0] * Ls[0] + n[1] * Ls[1] + n[2] * Ls[2]); if (k === 1 || drape) ndl = (ndl + .35) / 1.35;   // linen: soft, translucent
      const sun = ndl > 0 ? sunAt(x, y, z) * ndl : 0;
      const lt = (P, wrap, fall) => { const vx = P[0] - x, vy = P[1] - y, vz = P[2] - z, dd = Math.hypot(vx, vy, vz); return clamp(((n[0] * vx + n[1] * vy + n[2] * vz) / dd + wrap) / (1 + wrap)) / (1 + dd * dd / fall); };
      const fill = lt(DC, .35, 2.6) * ao, bnc = lt(BC, .5, 2.2) * ao, am = (.55 + .45 * lt(BC, 1, 6)) * ao;
      for (let j = 0; j < 3; j++) { Bs[i + j] = al[j] * SUN[j] * sun * 560; Bf[i + j] = al[j] * FILL[j] * fill * 520; Bb[i + j] = al[j] * BOUNCE[j] * bnc * 760; Ba[i + j] = al[j] * am * 92; }
      Bs[i + 3] = Bf[i + 3] = Bb[i + 3] = Ba[i + 3] = 255;
    }
    // the shaft of light in the air: marched at half resolution
    const HW = PW >> 1, HH = PH >> 1, Bm = new Uint8ClampedArray(HW * HH * 4);
    for (let py = 0; py < HH; py++) for (let px = 0; px < HW; px++) {
      const rx = (px * 2 - ox - C.cx) / C.f, ry = -(py * 2 - oy - C.cy) / C.f, i = (py * HW + px) * 4, [t, k] = hit(rx, ry), te = Math.min(k === 2 ? ZF + DD : t, ZF + DD);
      let acc = 0; const M = 30; for (let j = 0; j < M; j++) { const tt = .4 + (te - .4) * (j + .5) / M; if (tt > te) break; acc += sunAt(O[0] + rx * tt, ry * tt, tt) * (te - .4) / M; }
      const v = clamp(acc / 1.6); Bm[i] = 255 * v; Bm[i + 1] = 214 * v; Bm[i + 2] = 156 * v; Bm[i + 3] = 255;
    }
    const proj = (x, y, z) => [C.cx + (x - O[0]) / z * C.f, C.cy - y / z * C.f];
    D.tb = { C, sun: toCanvas(PW, PH, Bs), fill: toCanvas(PW, PH, Bf), bounce: toCanvas(PW, PH, Bb), amb: toCanvas(PW, PH, Ba), pre: toCanvas(PW, PH, Op), rise: toCanvas(PW, PH, Or), beam: toCanvas(HW, HH, Bm),
      beamData: Bm, HW, HH, door: [proj(DX0, DY1, ZF), proj(DX1, DY0, ZF)], linen: proj((LIN[0] + LIN[1]) / 2, BY + .04, (LIN[2] + LIN[3]) / 2) };
    D.tmp = canvas(PW, PH);
  }

  function film(ctx, t, a) {   // a little grain, the same film the whole part runs on
    const { W, H } = D, fi = Math.floor(t * 24);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = a; ctx.drawImage(D.grain[fi % 6], 0, 0, W, H); ctx.restore();
  }
  function vignette(ctx, k, col, low = 1) {
    const { W, H, V } = D; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const R = Math.hypot(W, H) / 2, gv = ctx.createRadialGradient(W / 2, H * (V ? .32 : .42), R * .3, W / 2, H * .5, R * 1.05); gv.addColorStop(0, `rgba(${col},0)`); gv.addColorStop(1, `rgba(${col},${k})`); ctx.fillStyle = gv; ctx.fillRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, H * (V ? .56 : .66), 0, H); bg.addColorStop(0, `rgba(${col},0)`); bg.addColorStop(.3, `rgba(${col},${.3 * low})`); bg.addColorStop(1, `rgba(${col},${.5 * low})`); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);   // calm under the words
    ctx.restore();
  }
  function bloom(ctx, x, y, r, a, col) {
    if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.25, `rgba(${col},${a * .4})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  }

  function dawnOil(ctx, u, mode = 'tomb') {
    const { W, H, V, ox, oy } = D;
    const t = ({ tree: 135, tomb: 139.5 }[mode] || 0) + u;
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    // the camera: zoom z about (fx, fy) plus a drift, rotation rot — applied to the plate (drawn at -ox, -oy)
    const cam = (z, fx, fy, dx, dy, rot) => { const c = Math.cos(rot) * z, s = Math.sin(rot) * z; ctx.setTransform(c, s, -s, c, fx + dx - (fx * c - fy * s), fy + dy - (fx * s + fy * c)); };
    if (mode === 'tree') {
      const T = D.tr, k = eio(u / 5.1);
      cam(1.015 + .04 * k, W * .5, H * .3, lerp(10, -12, k), lerp(-6, 8, k), lerp(-.006, .004, k));
      ctx.globalAlpha = lerp(.12, 1, ss(.15, 1.0, u)); ctx.drawImage(T.amb, -ox, -oy); ctx.globalAlpha = 1;   // in from the dark
      // the cold light (and with it the shadow): comes up only after the Jordan figure has dissolved away (7차: at 135.0–135.4 the
      // shadow's upright ran through the man in the water; 8차: still faintly — now it starts at u 1.15 = film 135.75, after the
      // Jordan scene has ended at 135.7), breathes with the clouds passing, then dims to near dark
      const L = ss(1.15, 2.4, u) * (1 - .62 * ss(3.3, 5.0, u)) * (1 + .07 * Math.sin(u * 1.7 + .6));
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(L); ctx.drawImage(T.lit, -ox, -oy); ctx.globalAlpha = 1;
      // a faint cold fill with no shadow bridges the dark between the Jordan and the light (8차 render: 5 black frames at 135.77–135.9)
      { const fk = ss(.5, 1.1, u) * (1 - ss(1.6, 2.6, u)); if (fk > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createRadialGradient(W * .5, H * .38, 0, W * .5, H * .38, Math.max(W, H) * .7);
        g.addColorStop(0, `rgba(120,135,165,${.22 * fk})`); g.addColorStop(1, 'rgba(120,135,165,0)'); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .55; ctx.imageSmoothingEnabled = true;   // cloud light drifting across
      ctx.drawImage(D.cloud, -ox - W * .6 + u * W * .05, -oy - H * .2, D.PW * 1.8, D.PH * 1.4); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      { const dv = 1 - ss(0, 1.2, u); if (dv > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(W / 2, H * .2, 0, W / 2, H * .2, Math.max(W, H) * .75);
          g.addColorStop(0, `rgba(228,234,226,${.5 * dv})`); g.addColorStop(.4, `rgba(200,210,204,${.22 * dv})`); g.addColorStop(1, 'rgba(190,200,196,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); } }   // the dove's light of the scene before, withdrawing
      vignette(ctx, .6, '4,5,10'); film(ctx, t, .22);
    } else {   // 'tomb'
      const T = D.tb, k = eio(u / 9.4), [d0, d1] = T.door, dcx = (d0[0] + d1[0]) / 2, dcy = (d0[1] + d1[1]) / 2;
      const rise = ss(.3, 2.3, u), grow = ss(2.6, 9.4, u);
      const camT = () => cam(1 + .055 * k, dcx, dcy, lerp(8, -6, k), lerp(4, -2, k), 0);
      camT();
      // outside: pre-dawn → sunrise, brightening further through N15
      ctx.drawImage(T.pre, -ox, -oy);
      ctx.globalAlpha = rise; ctx.drawImage(T.rise, -ox, -oy); ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1; ctx.drawImage(T.amb, -ox, -oy);
      ctx.globalAlpha = clamp(.45 + .25 * rise + .3 * grow); ctx.drawImage(T.fill, -ox, -oy);
      ctx.globalAlpha = clamp(.55 * rise + .45 * grow); ctx.drawImage(T.bounce, -ox, -oy);
      // the sun pours in: a front running from the door down across the floor and the bench (screen space ≈ depth here)
      { const front = lerp(d0[1] - H * .05, H * 1.05, eo(clamp((u - .45) / 2.0))), soft = H * .14, m = D.tmp.getContext('2d');
        if (u > .45) {
          m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1; m.clearRect(0, 0, D.PW, D.PH); m.drawImage(T.sun, 0, 0);
          m.globalCompositeOperation = 'destination-in'; const g = m.createLinearGradient(0, front - soft + oy, 0, front + oy); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); m.fillStyle = g; m.fillRect(0, 0, D.PW, D.PH);
          ctx.globalAlpha = clamp(rise * (.8 + .2 * grow)); ctx.drawImage(D.tmp, -ox, -oy);
          m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, D.PW, D.PH); m.drawImage(T.beam, 0, 0, D.PW, D.PH);
          m.globalCompositeOperation = 'destination-in'; m.fillStyle = g; m.fillRect(0, 0, D.PW, D.PH);
          ctx.globalAlpha = clamp(rise * (.55 + .2 * grow) * (1 + .05 * Math.sin(u * 1.3))); ctx.drawImage(D.tmp, -ox, -oy); } }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      // dust turning in the shaft
      if (rise > 0) { const r = rng(17); ctx.save(); ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 70; i++) { const bx = r(), by = r(), sp = .006 + r() * .01, x = ((bx + u * sp + Math.sin(u * .4 + i) * .01) % 1) * D.PW, y = ((by - u * sp * .4) % 1 + 1) % 1 * D.PH;
          const bi = ((Math.min(T.HH - 1, y / 2 | 0) * T.HW) + Math.min(T.HW - 1, x / 2 | 0)) * 4, bv = T.beamData[bi] / 255; if (bv < .05) continue;
          const a = bv * rise * (.35 + .4 * r()), rr = 1.2 + r() * 2.2; ctx.fillStyle = `rgba(255,236,196,${a})`; ctx.beginPath(); ctx.arc(x - ox, y - oy, rr, 0, 6.283); ctx.fill(); } ctx.restore(); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // the door's glare: the sunrise beyond it, growing through N15
      const z = 1 + .055 * k, sx = dcx + lerp(8, -6, k), sy = dcy + lerp(4, -2, k);
      bloom(ctx, sx - (d1[0] - d0[0]) * .5 * z, sy - (d1[1] - d0[1]) * .3 * z, (d1[0] - d0[0]) * 1.1, .42 * rise + .22 * grow, '255,214,150');   // the sun is off to the left beyond the jamb
      bloom(ctx, sx, sy, (d1[0] - d0[0]) * .8, .12 * (1 - rise), '150,170,210');   // before the sun: a cold glimmer at the door
      if (window.OIL) { ctx.save(); OIL.varnish(ctx, .35); ctx.restore(); }
      vignette(ctx, .5, '8,6,6', .45); film(ctx, t, .16);
    }
    ctx.restore();
  }
  window.dawnOil = dawnOil;
})();
