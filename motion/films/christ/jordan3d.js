/* 「그리스도」 — the Jordan, painted 3D world (kit-world3d.js, W3). One river, used twice:
   · default (Q1, 요 1:41, film 7.6–14.6 s, u = 0..7): Bethany beyond the Jordan (요 1:28), the east bank, late afternoon
     ("열 시쯤", 요 1:39 — about four o'clock): we look west across the river toward the Judean hills and the low sun. The
     water glitters; reeds stand along the shore. Andrew hurries along the bank to his brother Simon, who turns; Andrew points
     back the way he came and beckons — "우리가 메시야를 만났다". Simon takes a first step. The camera trucks right and closes in.
   · { mode: 'spirit' } (Q9, 행 10:38, film 129.7–136 s, u = 0..6.5): the same river and reeds in a paler, cooler light. A soft
     shaft of light comes down through the haze; a dove-like gathering of light descends in it straight down his axis (8차: off
     to his right read as odd) upon one man standing in the water (seen from behind — never a face or profile): it never stops
     over his head (7차: resting just above his head read as a glowing point / halo); still descending it opens, pours over him
     and becomes a soft bloom round his upper body, then a wide wash on his shoulders and the water. The camera closes in.
   Round 2 (coordinator: "평면 벡터 일러스트로 읽힌다"): the land is world3d terrain (a world-locked grid, each cell shaded
   smoothly, aerial perspective by distance — after messiah film.html terrain()); the water is a rippled mirror of what stands
   above it; reeds are dark backlit masses with lit plumes, the near ones out of focus; the brothers are jointed silhouettes
   (head cloth, shoulders, elbows, hands, mantle folds) with a rim on the sun side only; the shaft is volumetric haze, the dove
   a soft gathering of light.
   Words are not drawn here (the film lays them on top); the lower band is kept dark and calm for them.
   API: buildJordan() (sync; call once after Pilot is set up) · jordanScene(ctx, u, { mode }) */
(function () {
  const P = Pilot, { clamp, lerp, ss, eio, eo, rng, noise, fbm, mix } = P, css = (c, a) => W3.css(c, a);
  const WY = -0.42;                                     // the water level (m)
  const shoreN = x => 12.4 + 1.1 * Math.sin(x * .13 + 1) + .5 * noise(x * .35, 2.3);   // our (east) bank's waterline, z(x)
  const shoreF = x => 44 + 2.5 * Math.sin(x * .05 + 2) + 1.2 * noise(x * .2, 7);        // the far (west) bank
  const ridged = (x, z, o = 4) => { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * (1 - Math.abs(2 * P.noise(x * f, z * f) - 1)); f *= 2.03; a *= .5; } return s / (1 - Math.pow(.5, o)); };
  let J = null;

  // ---- the land: one height field for both banks, the river bed, the marl badlands and the Judean hills (heights cached:
  // the grid is locked to the world, so a vertex has the same height in every frame)
  const HC = new Map(), AC = new Map();
  function hRaw(x, z) {
    const sn = shoreN(x), sf = shoreF(x);
    if (z < sf - 6) { const t = clamp((sn - z) / 3.2), g = .02 + .16 * fbm(x * .22, z * .22, 2) + .015 * Math.max(0, sn - z); return z > sn + 3 ? WY - 1.2 : lerp(WY - .45, g, ss(0, 1, t)); }
    if (z < sf) return WY - 1.2;
    const d = z - sf; let h = lerp(WY - .45, .25 + .6 * fbm(x * .07, z * .07, 2), ss(0, 4, d));
    h += 26 * ss(160, 1500, d) * ridged(x * .0026 + 1, z * .0026);                                    // the marl badlands (katar)
    h += 1050 * ss(3200, 11000, d) * (.22 + .78 * ridged(x * .00045 + 3, z * .00032 + 1, 5));         // the Judean hills
    return h;
  }
  const hJ = (x, z) => { const k = Math.round(x * 8 + 4e6) * 2e7 + Math.round(z * 8 + 1e5); let v = HC.get(k); if (v === undefined) { v = hRaw(x, z); HC.set(k, v); } return v; };
  function albJ(x, z) {   // wet mud at our waterline → dry earth and grass; the far bank's green → pale marl → the hills
    const sn = shoreN(x); if (z < sn + 4) { const w = 1 - ss(0, 2.5, sn - z), n = fbm(x * .3, z * .3, 2); return mix(mix([.46, .38, .27], [.4, .36, .24], n), [.26, .21, .18], w); }
    const d = z - shoreF(x), n = fbm(x * .01, z * .01, 2); if (d < 300) return mix([.34, .36, .24], [.5, .46, .32], ss(20, 300, d) * (.6 + .4 * n));
    return mix([.82, .74, .6], [.66, .58, .5], ss(1500, 6000, d) * (.5 + .5 * n));
  }
  function terrain(ctx, c, L, zLo, zHi, o = {}) {
    const S = d => Math.pow(2, Math.max(-2, Math.round(Math.log2(.3 + d * .04)))), rows = [];
    let s = S(Math.max(0, zLo - c.z)), z = Math.floor(Math.max(zLo, c.z) / s) * s;
    while (z - c.z < (o.maxD || 16000) && z < zHi) { rows.push([z, s]); const ns = S(z - c.z + s); if (ns > s && Math.abs(z / ns - Math.round(z / ns)) < 1e-6) s = ns; z += s; }
    rows.push([z, s]);
    const V = P.ori === 'v', dirx = c.f[0] / Math.max(.2, c.f[2]), spread = V ? .55 : 1.0;
    const nrm = (x, zz, e) => { const k = Math.round(x * 8 + 4e6) * 2e7 + Math.round(zz * 8 + 1e5) + e * 1e-3; let n = AC.get(k); if (!n) { const hx = hJ(x + e, zz) - hJ(x - e, zz), hz = hJ(x, zz + e) - hJ(x, zz - e), l = Math.hypot(hx, 2 * e, hz); n = [-hx / l, 2 * e / l, -hz / l]; AC.set(k, n); } return n; };
    const col = (x, zz, e, dd) => W3.shade(albJ(x, zz), nrm(x, zz, Math.max(.5, e)), Math.max(1, dd), L);
    for (let i = rows.length - 2; i >= 0; i--) {
      const [z0, sz] = rows[i], z1 = rows[i + 1][0], sN = rows[i + 1][1], dd = z0 - c.z; if (z1 < c.z) continue;
      const half = 14 + spread * Math.max(0, dd), xc = c.x + dirx * Math.max(0, dd), j0 = Math.floor((xc - half) / sz), j1 = Math.ceil((xc + half) / sz);
      const hFar = x => { if (sN === sz) return hJ(x, z1); const xa = Math.floor(x / sN) * sN; return lerp(hJ(xa, z1), hJ(xa + sN, z1), (x - xa) / sN); };
      for (let j = j0; j < j1; j++) { const x0 = j * sz, x1 = x0 + sz, a = hJ(x0, z0), b = hJ(x1, z0), cc = hFar(x1), e = hFar(x0);
        if (Math.max(a, b, cc, e) < WY - .05) continue;                        // under the river
        if (!W3.poly(ctx, c, [[x0, a, z0], [x1, b, z0], [x1, cc, z1], [x0, e, z1]])) continue;
        const xm = x0 + sz / 2, cN = col(xm, z0, sz, dd), cF = col(xm, z1, sz, z1 - c.z), pN = W3.P(c, xm, (a + b) / 2, Math.max(z0, c.z + .6)), pF = W3.P(c, xm, (cc + e) / 2, z1);
        if (pN && pF && Math.abs(pN[1] - pF[1]) > 2) { const g = ctx.createLinearGradient(pN[0], pN[1], pF[0], pF[1]); g.addColorStop(0, css(cN)); g.addColorStop(1, css(cF)); ctx.fillStyle = g; }
        else ctx.fillStyle = css(cN.map((v, k) => (v + cF[k]) / 2));
        ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke(); }
      if (o.things) o.things(z0, z1);
    }
  }

  function buildJordan() {
    const r = rng(41);
    // reeds: a few dense clumps along our waterline (world-locked), two big ones close to the lens (drawn out of focus)
    const clumps = [], clump = (x, z, n, h, near = false) => { const st = []; for (let i = 0; i < n; i++) st.push({ dx: (r() - .5) * .7 * (near ? 1.8 : 1), dz: (r() - .5) * .4, h: h * (.5 + .55 * r()), lean: (r() - .5) * .45, ph: r() * 6.28, plume: r() < .4, w: .022 + .02 * r() }); clumps.push({ x, z, st, near }); };
    for (const x of [-9.5, -6.8, -3.9, -1.6, 4.4, 6.2, 9.6, 13]) clump(x + (r() - .5), shoreN(x) - .25 - r() * .4, 14 + (r() * 12 | 0), 1.9 + r() * 1.1);
    clump(-3.1, 2.4, 22, 2.3, true); clump(2.0, 3.0, 18, 2.0, true);
    // grass: sparse tapered blades, denser toward the wet edge
    const tufts = []; for (let i = 0; i < 900; i++) { const x = -16 + r() * 32, z = 1.5 + 11 * Math.pow(r(), .55); if (z > shoreN(x) - .3) continue; const n = 2 + (r() * 4 | 0), bl = []; for (let j = 0; j < n; j++) bl.push({ a: (r() - .5) * 1.0, l: .4 + .6 * r(), o: (r() - .5) * .08 }); tufts.push({ x, z, h: .06 + .26 * r() * r(), bl, ph: r() * 6 }); }
    // the far bank's thicket (tamarisk, willow): crowns as clusters of soft masses
    const crowns = []; for (let x = -110; x < 110; x += .5 + r() * .9) { const z = shoreF(x) + 1 + r() * 7, tall = Math.pow(fbm(x * .06, 3.3, 3), 1.8), h = .8 + 5.2 * tall * (.6 + .4 * r()), parts = []; for (let k = 0; k < 4; k++) parts.push([(r() - .5) * 1.4, h * (.45 + .55 * r()), .5 + .7 * r() * (.5 + tall)]); crowns.push({ x, z, h, parts }); }
    crowns.sort((a, b) => b.z - a.z);
    // a soft drifting noise for the haze in the shaft (built once)
    const nz = P.canvas(128, 256); { const g = nz.getContext('2d'), d = g.createImageData(128, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 128; x++) { const v = fbm(x * .045, y * .03, 4), i = (y * 128 + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; d.data[i + 3] = 255 * clamp(.5 + 1.0 * (v - .35)); } g.putImageData(d, 0, 0); }
    J = {
      clumps, tufts, crowns, noise: nz, dur: { day: 7, spirit: 6.5 },
      // default: a slow truck right along the bank, closing in on the brothers (eye ≈ 1.2 m, a little below their heads)
      cam: W3.cam([[0, -2.4, 1.22, -.4, -.45, .5, 13, 1360, 1900], [3.5, -1.0, 1.2, .5, .55, .48, 13, 1420, 2100], [7, -.1, 1.18, 1.5, 1.05, .46, 13, 1500, 2280]]),
      // late afternoon in the Jordan valley: low sun in the west (ahead, a little left), golden haze; fog deep enough that
      // each fold of the hills stands one value apart
      light: W3.light([[0, 11, 2.5, 1.15, [255, 198, 132], [76, 64, 78], [70, 80, 122], [248, 196, 140], [255, 196, 128], [226, 180, 146], 5200, 0],
        [7, 9.8, 2.5, 1.12, [255, 190, 124], [72, 60, 74], [66, 76, 118], [248, 188, 134], [255, 188, 122], [222, 174, 140], 5000, 0]]),
      camS: W3.cam([[0, .1, 1.6, 1.0, .25, -.6, 24, 1300, 1800], [3.0, .2, 1.52, 3.8, .25, -.55, 24, 1340, 1920], [6.5, .25, 1.44, 7.0, .25, -.45, 24, 1420, 2150]]),
      // spirit: a pale, overcast-cool day; the shaft is the light
      lightS: W3.light([[0, 30, 175, .3, [220, 226, 236], [92, 100, 120], [44, 58, 92], [168, 176, 186], [226, 226, 222], [150, 158, 172], 4200, 0],
        [6.5, 30, 175, .3, [220, 226, 236], [88, 96, 116], [42, 56, 88], [164, 172, 182], [226, 226, 222], [146, 154, 168], 4200, 0]]),
      man: [.25, 24],
      fig: P.canvas(900, 900), soft: P.canvas(Math.ceil(P.W / 4), Math.ceil(P.H / 4)), beam: P.canvas(Math.ceil(P.W / 4), Math.ceil(P.H / 4)),
    };
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // the far bank's thicket: soft crown masses hazed by the valley air, a warm edge on the side toward the sun
  function thicket(ctx, c, L, sunP) {
    const haze = mix(W3.shade([.28, .3, .2], [0, .3, -.95], 50, L), L.fog, .12);
    for (const cr of J.crowns) { const b = W3.P(c, cr.x, 0, cr.z); if (!b || b[0] < -300 || b[0] > P.W + 300) continue; const k = b[2];
      const col = mix(haze, L.fog, clamp((cr.z - 45) / 9) * .16);
      for (const [dx, hy, rr] of cr.parts) { const p = W3.P(c, cr.x + dx, hy, cr.z); if (!p) continue; const R = rr * k;
        ctx.fillStyle = css(col); ctx.beginPath(); ctx.ellipse(p[0], p[1], R, R * .85, 0, 0, 6.283); ctx.fill(); }
      { const lo = W3.P(c, cr.x, cr.h * .3, cr.z); if (lo) { ctx.fillStyle = css(col); ctx.beginPath(); ctx.ellipse(lo[0], (lo[1] + b[1]) / 2, 1.1 * k, (b[1] - lo[1]) / 2 + 1, 0, 0, 6.283); ctx.fill(); } }
      if (sunP && L.sunI > .5) { const top = W3.P(c, cr.x, cr.h * 1.05, cr.z); if (top) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const R = cr.parts[0][2] * k * 1.4, g = ctx.createRadialGradient(top[0], top[1], 0, top[0], top[1], R); g.addColorStop(0, css(L.glow, .1)); g.addColorStop(1, css(L.glow, 0)); ctx.fillStyle = g; ctx.fillRect(top[0] - R, top[1] - R, 2 * R, 2 * R); ctx.restore(); } } }
  }
  // the river: a rippled mirror of everything already drawn above the far waterline (sky, hills, thicket, sun), darkening
  // toward us; then the sun's glitter and a soft column of its reflection. No drawn streaks.
  function river(ctx, c, L, u, sunP) {
    const W = P.W, H = P.H, far = [];
    for (let i = 0; i <= 48; i++) { const x = c.x - 70 + 140 * i / 48, a = W3.P(c, x, WY, shoreF(x)); if (a) far.push(a); }
    if (!far.length) return null;
    const yFar = Math.round(Math.min(...far.map(p => p[1]))), nb = W3.P(c, c.x, WY, shoreN(c.x) - 3), yNear = Math.min(H, nb ? nb[1] : H), span = Math.max(40, yNear - yFar + 40);
    ctx.save(); ctx.beginPath(); ctx.moveTo(-10, H + 10); for (const p of far) ctx.lineTo(p[0], p[1] + 1); ctx.lineTo(W + 10, far[far.length - 1][1] + 1); ctx.lineTo(W + 10, H + 10); ctx.closePath(); ctx.clip();
    ctx.fillStyle = css(mix(L.skyT, L.skyH, .4)); ctx.fillRect(0, yFar - 2, W, H - yFar + 2);
    const src = J.soft;   // copy the band above the waterline once (a canvas can't read itself while being written row by row)
    if (!J.mirror || J.mirror.width !== W) J.mirror = P.canvas(W, Math.ceil(H * .6));
    const M = J.mirror, mh = Math.min(M.height, yFar), mg = M.getContext('2d'); mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, W, M.height); mg.drawImage(ctx.canvas, 0, yFar - mh, W, mh, 0, 0, W, mh);
    if (!J.refl || J.refl.width !== W) J.refl = P.canvas(W, Math.ceil(H * .7));
    const R = J.refl, rg = R.getContext('2d'); rg.clearRect(0, 0, W, R.height);
    const step = 2; for (let i = 0; i < span && i < mh && i < R.height; i += step) { const v = i / span, amp = (2 + 22 * v * v) * (P.ori === 'v' ? 1 : 1.2), dx = (noise(i * .06 + 3, u * 1.2) - .5) * 2 * amp + (noise(i * .2, u * 2.0) - .5) * amp * .4;
      const sy = mh - 1 - Math.round(i * (1 + .15 * v)); if (sy < 0) break; rg.drawImage(M, 0, sy, W, 1, dx, i, W, step + .5); }
    ctx.save(); ctx.filter = `blur(${P.ori === 'v' ? 2 : 1.8}px)`; ctx.drawImage(R, 0, yFar); ctx.restore();   // a soft mirror, no stair-steps
    // the water's own colour comes in toward us (less sky in the mirror, more depth), and a faint warm sheen far
    { const g = ctx.createLinearGradient(0, yFar, 0, yFar + span); g.addColorStop(0, css(mix(L.skyH, L.glow, .3), .12)); g.addColorStop(.25, css(mix(L.skyT, [10, 12, 22], .3), .2)); g.addColorStop(1, css(mix(L.skyT, [8, 8, 16], .55), .62)); ctx.fillStyle = g; ctx.fillRect(0, yFar, W, H - yFar); }
    if (sunP && L.sunI > .4) { ctx.globalCompositeOperation = 'screen';
      { const R = (P.ori === 'v' ? 240 : 320), g = ctx.createRadialGradient(sunP[0], yFar, 0, sunP[0], yFar, R); g.addColorStop(0, css(L.glow, .5 * L.sunI)); g.addColorStop(.5, css(L.glow, .16 * L.sunI)); g.addColorStop(1, css(L.glow, 0));
        ctx.save(); ctx.translate(sunP[0], yFar); ctx.scale(1, span / R * 1.1); ctx.translate(-sunP[0], -yFar); ctx.fillStyle = g; ctx.fillRect(sunP[0] - R, yFar - R, 2 * R, 2 * R); ctx.restore(); }
      for (let j = 0; j < 520; j++) { const v = (j + .5) / 520, y = yFar + 2 + span * v * v, sp = (P.ori === 'v' ? 50 : 80) + (P.ori === 'v' ? 200 : 300) * v, a = Math.max(0, noise(j * 1.9 + 7, u * 2.1) - .38) * 2.6;
        if (a <= 0) continue; const w = (5 + 46 * v) * (.4 + noise(j * .7, u * 1.3)), x = sunP[0] + (noise(j * 3.3, u * .5) - .5) * 2 * sp;
        ctx.fillStyle = css(mix(L.glow, [255, 246, 226], .5), Math.min(1, L.sunI * (.85 - .35 * v) * a)); ctx.fillRect(x - w / 2, y, w, 1 + 2.6 * v); }
      for (let j = 0; j < 9; j++) { const ph = noise(j * 5.1, u * 1.7); if (ph < .62) continue; const v = rng(90 + j)(), y = yFar + 4 + span * v * .8, x = sunP[0] + (noise(j * 2.7, u * .4) - .5) * (P.ori === 'v' ? 300 : 460) * (.4 + v);
        W3.bloom(ctx, x, y, L.glow, (ph - .62) * 2.2, { r: 26, streak: .05 }); } }
    ctx.restore();
    return { yFar, yNear };
  }
  // the waterline on our side: a thin bright lip where the river laps
  function lip(ctx, c, L, u, a) {
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineWidth = P.ori === 'v' ? 2 : 1.8; ctx.strokeStyle = css(mix(L.glow, [255, 240, 220], .4), a);
    ctx.beginPath(); for (let i = 0; i <= 90; i++) { const x = c.x - 30 + 60 * i / 90, p = W3.P(c, x, WY + .01, shoreN(x) + .35 - .12 * (.5 + .5 * Math.sin(u * 1.4 + x * .7))); if (p) i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); ctx.restore();
  }

  // reeds as backlit masses: tapered filled blades crowded into one dark shape; plumes take the light on the sun side
  function reedClump(g, c, L, u, cl, sunP, body, rimC, sc = 1) {
    for (const s of cl.st) { const x = cl.x + s.dx, z = cl.z + s.dz, b = W3.P(c, x, hJ(x, z), z); if (!b) continue; const k = b[2] * sc; if (b[0] * sc < -k * 3 || b[0] * sc > P.W * sc + k * 3) continue;
      const bx = b[0] * sc, by = b[1] * sc, sw = s.lean + .06 * Math.sin(u * 1.1 + s.ph + x * .3) + .05 * (noise(x * .2 + u * .35, z) - .5), h = s.h * k;
      const tx = bx + Math.sin(sw) * h, ty = by - Math.cos(sw) * h, mx = bx + Math.sin(sw * .4) * h * .5, my = by - h * .55, w = s.w * k, nx = Math.cos(sw), ny = Math.sin(sw);
      g.fillStyle = css(body); g.beginPath(); g.moveTo(bx - w * nx, by - w * ny); g.quadraticCurveTo(mx - w * .6 * nx, my - w * .6 * ny, tx, ty); g.quadraticCurveTo(mx + w * .6 * nx, my + w * .6 * ny, bx + w * nx, by + w * ny); g.closePath(); g.fill();
      if (s.plume) { const a = Math.atan2(ty - my, tx - mx) + Math.PI / 2 + .3 * Math.sin(u * .9 + s.ph), pl = h * .11, pw = Math.max(1.5, h * .028);
        g.save(); g.translate(tx, ty); g.rotate(a); const plume = () => { g.beginPath(); g.moveTo(0, pl * .4); g.quadraticCurveTo(pw * 1.3, -pl * .3, 0, -pl); g.quadraticCurveTo(-pw * 1.3, -pl * .3, 0, pl * .4); g.fill(); };
        if (sunP) { g.fillStyle = css(rimC, .9); plume(); const dx = sunP[0] * sc - tx, dy = sunP[1] * sc - ty, l = Math.hypot(dx, dy) || 1, ca = Math.cos(-a), sa = Math.sin(-a), ox = (dx * ca - dy * sa) / l, oy = (dx * sa + dy * ca) / l, ww = Math.max(1, pw * .45);
          g.save(); g.translate(-ox * ww, -oy * ww); g.fillStyle = css(body); plume(); g.restore(); } else { g.fillStyle = css(body); plume(); }
        g.restore(); } }
  }
  // the near reeds: painted at quarter resolution into a scratch canvas and blown up with a blur — out of focus
  function nearReeds(ctx, c, L, u, sunP, body) {
    const sc = J.soft.width / P.W, g = J.soft.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, J.soft.width, J.soft.height);
    for (const cl of J.clumps) if (cl.near) reedClump(g, c, L, u, cl, null, body, body, sc);
    ctx.save(); ctx.globalAlpha = .9; ctx.filter = `blur(${P.ori === 'v' ? 9 : 8}px)`; ctx.drawImage(J.soft, 0, 0, P.W, P.H); ctx.filter = 'none'; ctx.restore();
  }
  function grass(ctx, c, L, u, sunP, body) {
    const rim = mix(L.glow, [255, 236, 200], .3);
    for (const t of J.tufts) { const p = W3.P(c, t.x, hJ(t.x, t.z), t.z); if (!p || p[0] < -40 || p[0] > P.W + 40) continue; const k = p[2], h = t.h * k, fk = clamp((t.z - c.z) / 14);
      ctx.fillStyle = css(mix(body, L.fog, .12 * fk)); ctx.beginPath();
      for (const b of t.bl) { const a = b.a + .07 * Math.sin(u * 1.3 + t.ph + b.a * 4), bx = p[0] + b.o * k, w = Math.max(.6, .011 * k), ex = bx + Math.sin(a) * h * b.l, ey = p[1] - Math.cos(a) * h * b.l;
        ctx.moveTo(bx - w, p[1]); ctx.quadraticCurveTo(bx + Math.sin(a) * h * b.l * .35 - w * .5, p[1] - h * b.l * .55, ex, ey); ctx.quadraticCurveTo(bx + Math.sin(a) * h * b.l * .35 + w * .5, p[1] - h * b.l * .55, bx + w, p[1]); ctx.closePath(); }
      ctx.fill();
      if (sunP && t.z > 6.5) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = css(rim, .35 * fk); for (const b of t.bl) { const a = b.a + .07 * Math.sin(u * 1.3 + t.ph + b.a * 4), ex = p[0] + b.o * k + Math.sin(a) * h * b.l, ey = p[1] - Math.cos(a) * h * b.l; ctx.fillRect(ex - .6, ey, 1.2, Math.max(1.5, h * .18)); } ctx.restore(); } }
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // the brothers: jointed silhouettes in metres (feet at the origin, facing +x before the facing flip): head and head cloth with
  // its hanging end, beard, neck, sloped shoulders, a tunic belted at the waist, a mantle over the back with three folds,
  // sleeves that widen at the forearm, hands with a thumb. Arms are two bones of fixed length from the shoulder: angle a from
  // straight down (+ = forward), elbow bend e ≥ 0 (the forearm only ever turns forward/up — never backwards).
  const UA = .29, FA = .26;
  function armShape(o, sx, sy, a, e, col, point = 0) {
    const ex = sx + Math.sin(a) * UA, ey = sy + Math.cos(a) * UA, fa = a + e, hx = ex + Math.sin(fa) * FA, hy = ey + Math.cos(fa) * FA;
    const n1 = [Math.cos(a), -Math.sin(a)], n2 = [Math.cos(fa), -Math.sin(fa)];
    o.push({ k: 'ell', col, x: sx, y: sy + .01, rx: .075, ry: .07, r: 0 });                                        // the shoulder cap
    o.push({ k: 'poly', col, pts: [[sx + n1[0] * .064, sy + n1[1] * .064], [ex + n1[0] * .05, ey + n1[1] * .05], [ex - n1[0] * .05, ey - n1[1] * .05], [sx - n1[0] * .064, sy - n1[1] * .064]] });   // upper arm
    o.push({ k: 'ell', col, x: ex, y: ey, rx: .052, ry: .052, r: 0 });                                         // the elbow, rounded
    // the sleeve widens toward the wrist; its loose underside hangs down a little (gravity, not the arm's own axis)
    const wo = .1, hang = .07 * Math.abs(Math.sin(fa));
    o.push({ k: 'poly', col, pts: [[ex + n2[0] * .048, ey + n2[1] * .048], [hx + n2[0] * wo * .8, hy + n2[1] * wo * .8], [hx - n2[0] * wo, hy - n2[1] * wo + hang], [lerp(ex, hx, .55) - n2[0] * .075, lerp(ey, hy, .55) - n2[1] * .075 + hang * .5], [ex - n2[0] * .048, ey - n2[1] * .048]] });
    // the hand out of the sleeve: a mitten and a thumb (or a pointing finger)
    const hx2 = hx + Math.sin(fa) * .05, hy2 = hy + Math.cos(fa) * .05;
    o.push({ k: 'ell', col, x: hx2, y: hy2, rx: .046, ry: .032, r: Math.PI / 2 - fa });
    o.push({ k: 'line', col, w: .02, pts: [[hx2, hy2], [hx2 + Math.sin(fa + .9) * .055, hy2 + Math.cos(fa + .9) * .055]] });
    if (point > 0) o.push({ k: 'line', col, w: .022, pts: [[hx2, hy2], [hx2 + Math.sin(fa) * .11 * point, hy2 + Math.cos(fa) * .11 * point]] });
  }
  function bodyParts(ps, tunic, mantle) {
    const o = [], s = ps.stride || 0, sway = ps.sway || 0, hd = ps.head || 0, fl = ps.flutter || 0;
    const f = ps.armF || [-.1, .25], n = ps.armN || [.1, .25];
    armShape(o, -.05, -1.37, f[0], f[1], mantle, ps.pointF || 0);                                            // far arm, behind
    // legs: when he strides, the front leg pushes the robe forward and the back leg trails — the hem opens into an inverted V
    const fx = .26 * s, bx = -.26 * s, lead = Math.max(fx, bx), trail = Math.min(fx, bx), open = Math.abs(s);
    for (const lx of [fx, bx]) { o.push({ k: 'poly', col: tunic, pts: [[lx - .04, -.2], [lx + .04, -.2], [lx + .035, -.03], [lx - .035, -.03]] }); o.push({ k: 'ell', col: tunic, x: lx + .05, y: -.025, rx: .1, ry: .03, r: 0 }); }   // shins and sandalled feet
    // tunic: sloped shoulders → chest → a belt cinching the waist → the skirt flaring to the hem over the legs
    // (a man's frame: a deep chest and broad back over a narrower waist — 관리자 2026-11-14)
    o.push({ k: 'poly', col: tunic, pts: [[-.04, -1.48], [.1, -1.46], [.185, -1.37], [.195, -1.22], [.15, -1.06], [.11, -.99], [.11, -.95], [.14, -.86],
      [lead + .16, -.12], [lead + .12, -.08], [(lead + trail) / 2 + .02, -.08 - .2 * open], [trail - .12, -.08], [trail - .17, -.14],
      [-.17, -.86], [-.135, -.95], [-.135, -.99], [-.18, -1.08], [-.225, -1.25], [-.2, -1.4]] });
    o.push({ k: 'poly', col: mantle, pts: [[.1, -.99], [.15, -.97], [.16, -.78], [.13, -.76], [.12, -.94]] });   // the sash end hanging from the belt
    // mantle (겉옷) from the shoulders down the back, open in front; its skirt flares behind and lifts back as he walks
    o.push({ k: 'poly', col: mantle, pts: [[-.22, -1.44], [.02, -1.49], [.12, -1.42], [.07, -1.15], [.0, -.75], [-.04, -.36], [-.18, -.3 + fl * .05], [-.36 - fl * .2, -.3 - fl * .12], [-.3 - fl * .08, -.8], [-.26, -1.15]] });
    o.push({ k: 'fold', pts: [[-.04, -1.36], [-.1, -.9], [-.14, -.4]] }, { k: 'fold', pts: [[-.13, -1.32], [-.2, -.85], [-.28 - fl * .1, -.36]] }, { k: 'fold', pts: [[.04, -1.2], [.0, -.8], [-.04, -.42]] });
    o.push({ k: 'head', col: mantle, hd, sway });
    armShape(o, .05, -1.37, n[0], n[1], mantle, 0);                                                            // near arm, in front
    return o;
  }
  function headPath(g, hd, sway) {
    g.save(); g.translate(.02, -1.6); g.rotate(hd);
    g.beginPath(); g.ellipse(0, 0, .092, .112, 0, 0, 6.283); g.fill();                                          // skull
    g.beginPath(); g.moveTo(.08, -.045); g.lineTo(.124, .0); g.lineTo(.085, .028); g.closePath(); g.fill();      // nose
    // 관리자 2026-11-14 (long falling cloth reads as a woman): a full beard from the ear to a point below the chin, and a head cloth
    // wound close over the crown with a band, ending at the nape — no length hanging down the back
    // the beard juts forward and down from the jaw to a point, and recedes under itself to the throat (so it reads as a beard)
    g.beginPath(); g.moveTo(.094, .02); g.quadraticCurveTo(.138, .09, .108, .178); g.lineTo(.082, .19); g.quadraticCurveTo(.04, .135, .005, .095); g.quadraticCurveTo(-.045, .065, -.04, 0); g.closePath(); g.fill();   // beard
    // the cloth: over the crown, its back edge ending at the bottom of the ear, then turning in under the skull — the nape and
    // the neck show below it (a straight fall to the shoulders read as long hair)
    g.beginPath(); g.moveTo(.088, -.055); g.quadraticCurveTo(.05, -.148, -.04, -.136); g.quadraticCurveTo(-.126, -.11, -.12, -.01); g.quadraticCurveTo(-.122, .05 + sway * .08, -.1, .07 + sway * .1);
    g.quadraticCurveTo(-.06, .07, -.03, .04); g.quadraticCurveTo(-.01, .0, .0, -.02); g.quadraticCurveTo(.04, -.05, .088, -.055); g.closePath(); g.fill();   // head cloth
    g.beginPath(); g.ellipse(-.012, -.07, .104, .03, -.22, 0, 6.283); g.fill();                                    // its band
    g.restore();
    g.beginPath(); g.moveTo(-.05, -1.53); g.quadraticCurveTo(-.06, -1.47, -.075, -1.42); g.lineTo(.085, -1.42); g.lineTo(.065, -1.52); g.closePath(); g.fill();   // neck (a man's, thick), the nape curving into the back
  }
  function figure(ctx, x, y, sc, face, ps, tunic, mantle, rimC, toward, rimA) {
    const oc = J.fig, g = oc.getContext('2d'), S = oc.width, k = Math.min(1, (S * .42) / (2.4 * sc)), m = sc * k;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, S);
    const parts = bodyParts(ps, tunic, mantle);
    const paint = (dx, dy, override, folds) => { g.save(); g.translate(S / 2 + dx, S * .78 + dy); g.scale(m * face * (ps.xs || 1), m); g.rotate(ps.lean || 0); g.lineCap = 'round'; g.lineJoin = 'round';
      for (const q of parts) { const col = css(override || q.col || mantle); g.fillStyle = g.strokeStyle = col;
        if (q.k === 'poly') { g.beginPath(); q.pts.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); g.fill(); }
        else if (q.k === 'ell') { g.beginPath(); g.ellipse(q.x, q.y, q.rx, q.ry, q.r || 0, 0, 6.283); g.fill(); }
        else if (q.k === 'line') { g.lineWidth = q.w; g.beginPath(); q.pts.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.stroke(); }
        else if (q.k === 'head') headPath(g, q.hd, q.sway);
        else if (q.k === 'fold' && folds) { g.strokeStyle = css(mix(mantle, rimC, .2), .45); g.lineWidth = .012; g.beginPath(); g.moveTo(...q.pts[0]); g.quadraticCurveTo(...q.pts[1], ...q.pts[2]); g.stroke(); } }
      g.restore(); };
    paint(0, 0, rimC, false);                                                                                   // the whole shape in the rim colour,
    g.globalCompositeOperation = 'source-atop'; const w = Math.max(1.4, m * .024); paint(-toward[0] * w, -toward[1] * w, null, true);   // then the body shifted away from the sun
    g.globalCompositeOperation = 'source-over';
    if (rimA < 1) { g.globalAlpha = 1 - rimA; paint(0, 0, null, true); g.globalAlpha = 1; }
    ctx.drawImage(oc, x - S / 2 / k, y - S * .78 / k, S / k, S / k);
  }
  // the beats (u seconds): Andrew hurries in from the left in clear strides (0–3.0), stops; Simon turns to him (2.3–3.1); Andrew
  // points back the way he came and beckons (2.9–7); Simon takes half a step toward him (4.2–5.4)
  const SIMON = [1.8, 11.55], A_FROM = -3.0, A_TO = .75;
  function brotherList(u) {
    const wk = clamp(u / 3.0), walkK = 1.5 * wk - .5 * wk * wk * wk, ax = lerp(A_FROM, A_TO, walkK), ph = (ax - A_FROM) / .7 * Math.PI, moving = 1 - ss(2.6, 3.1, u);
    const step = ss(4.2, 5.4, u), sx = SIMON[0] - .2 * step, sph = .2 * step / .7 * Math.PI;
    const pt = ss(2.9, 3.5, u), bk = ss(3.3, 3.8, u), beck = u > 3.7 && u < 5.7 ? Math.pow(Math.sin((u - 3.7) * Math.PI), 2) : 0;   // two lifts of the calling hand
    const tk = ss(2.3, 3.1, u), cf = Math.cos(Math.PI * tk);
    return [
      { x: ax, z: SIMON[1] - .25, face: 1, ps: { stride: Math.sin(ph) * moving, flutter: (.7 + .3 * Math.sin(ph * 2)) * moving + .15 * (1 - moving) * Math.max(0, Math.sin(u * 1.6)), sway: .06 * Math.abs(Math.sin(ph)) * moving + .03 * Math.sin(u * 2), lean: .08 * moving + .03 * pt, head: -.04 * moving + .08 * pt,
        armN: [lerp(.35 * Math.sin(ph) * moving, .38, bk), lerp(.25, 1.0 + .6 * beck, bk)],      // calling: upper arm near the body, the forearm lifts toward Simon, palm up
        armF: [lerp(-.35 * Math.sin(ph) * moving, -1.62 - .04 * Math.sin(u * 1.3), pt), lerp(.25, .28, pt)], pointF: ss(3.2, 3.6, u) } },   // pointing back the way he came: a little below the shoulder, elbow soft
      { x: sx, z: SIMON[1], face: 1, ps: { xs: Math.sign(cf || 1) * (.6 + .4 * Math.abs(cf)), stride: tk >= 1 ? Math.sin(sph) * (1 - ss(5.1, 5.6, u)) * .8 : 0, flutter: .3 * step * (1 - ss(5.2, 6, u)), sway: .02 * Math.sin(u * 1.7), lean: -.03 * step,
        head: .1 * ss(3.2, 4.2, u) - .06 * (1 - tk), armN: [.12 + .12 * ss(3.4, 4.4, u), .3 + .3 * ss(3.4, 4.4, u)], armF: [-.08, .22] } }];
  }
  // the long shadows toward us. At the end of the shot the camera has come forward past where they end, so the far end is cut
  // at the camera's near plane along the shadow's own line (and its fade cut at the same place) instead of the shadow being
  // dropped while its man still stands there (관리자 2026-11-14 "다음 몇 프레임에 그림자만 사라져")
  function shadows(ctx, c, L, list) {
    const NC = .62, gy = (x, z) => hJ(x, z) + .02;
    for (const f of list) { const e = L.elev * Math.PI / 180, len = 1.7 / Math.tan(e), dx = -L.sd[0], dz = -L.sd[2], dl = Math.hypot(dx, dz) || 1;
      const A = [f.x, gy(f.x, f.z), f.z], da = W3.toC(c, ...A)[2]; if (da < NC) continue;
      let ex = f.x + dx / dl * len, ez = f.z + dz / dl * len, keep = 1; const db = W3.toC(c, ex, gy(ex, ez), ez)[2];
      if (db < NC) { keep = (da - NC) / (da - db); ex = lerp(f.x, ex, keep); ez = lerp(f.z, ez, keep); }
      const gp = W3.P(c, ...A), sh = W3.P(c, ex, gy(ex, ez), ez); if (gp && sh) { ctx.save(); const g = ctx.createLinearGradient(gp[0], gp[1], sh[0], sh[1]); g.addColorStop(0, 'rgba(12,8,10,.5)'); g.addColorStop(1, `rgba(12,8,10,${(.5 * (1 - keep)).toFixed(3)})`);
        ctx.strokeStyle = g; ctx.lineCap = 'round'; ctx.lineWidth = gp[2] * .36; ctx.filter = 'blur(2px)'; ctx.beginPath(); ctx.moveTo(gp[0], gp[1]); ctx.lineTo(sh[0], sh[1]); ctx.stroke(); ctx.filter = 'none'; ctx.restore(); } }
  }

  // ---------------------------------------------------------------------------------------------------------------------
  function day(ctx, u) {
    const W = P.W, H = P.H, V = P.ori === 'v', c = J.cam(u), L = J.light(u);
    const sk = W3.sky(ctx, c, L, u), sunP = sk.sun;
    terrain(ctx, c, L, 38, 1e9);                                       // the far bank, the badlands, the hills (far → near)
    // the valley haze lying along the foot of the hills, lit by the sun
    { const hz = W3.P(c, c.x + c.f[0] * 1e4, 40, c.z + c.f[2] * 1e4); if (hz) { const y0 = hz[1] - (V ? 150 : 110), g = ctx.createLinearGradient(0, y0, 0, hz[1] + 30); g.addColorStop(0, css(L.fog, 0)); g.addColorStop(.7, css(mix(L.fog, L.glow, .35), .42)); g.addColorStop(1, css(L.fog, .15)); ctx.fillStyle = g; ctx.fillRect(0, y0, W, hz[1] + 30 - y0); } }
    thicket(ctx, c, L, sunP);
    river(ctx, c, L, u, sunP);
    terrain(ctx, c, L, c.z - 1, 16.5);                                 // our bank
    lip(ctx, c, L, u, .5);
    const list = brotherList(u), body = [24, 18, 19];
    shadows(ctx, c, L, list);
    const rimC = mix(L.glow, [255, 236, 200], .35), objs = [];
    for (const cl of J.clumps) if (!cl.near) objs.push({ z: cl.z, d: () => reedClump(ctx, c, L, u, cl, sunP, body, rimC) });
    for (const f of list) objs.push({ z: f.z, d: () => { const p = W3.P(c, f.x, hJ(f.x, f.z), f.z); if (!p) return; const tw = sunP ? [sunP[0] - p[0], sunP[1] - (p[1] - 1.3 * p[2])] : [0, -1], l = Math.hypot(...tw) || 1;
      figure(ctx, p[0], p[1], p[2], f.face, f.ps, [40, 31, 30], [23, 17, 18], rimC, [tw[0] / l, tw[1] / l], 1); } });
    objs.sort((a, b) => b.z - a.z); for (const o of objs) o.d();
    grass(ctx, c, L, u, sunP, [28, 22, 21]);
    nearReeds(ctx, c, L, u, sunP, [16, 12, 12]);
    // the low sun scattering in the valley air over everything, then the lens
    if (sunP) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const R = Math.max(W, H) * .9, g = ctx.createRadialGradient(sunP[0], sunP[1], 0, sunP[0], sunP[1], R); g.addColorStop(0, css(L.glow, .24)); g.addColorStop(.3, css(L.glow, .08)); g.addColorStop(1, css(L.glow, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,244,222,.95)'; ctx.beginPath(); ctx.arc(sunP[0], sunP[1], V ? 24 : 21, 0, 6.283); ctx.fill(); ctx.restore(); W3.bloom(ctx, sunP[0], sunP[1], L.glow, .8 * L.sunI, { r: V ? 190 : 160, streak: .6 }); }
    W3.finish(ctx, u, { vignette: .6 });
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // spirit: the man in the water, seen from behind (we stand on the bank behind him; never a face or a profile — 관리자
  // 2026-11-14: a man, not long hair): the back of a head with short wet hair (the ears show), the beard just past the jaw, a
  // thick neck, broad shoulders, the wet tunic clinging to the back (spine and shoulder-blade folds), arms from the shoulders —
  // upper arm, elbow, forearm out over the water, open hands just above it. rise (0..1) opens the hands a little upward as
  // the light rests on him. (origin at the water surface on his axis)
  function manParts(g, rise, folds, foldCol) {
    g.beginPath(); g.ellipse(0, -.985, .09, .106, 0, 0, 6.283); g.fill();                                                        // the back of the head
    g.beginPath(); g.ellipse(0, -1.015, .094, .08, 0, Math.PI, 2 * Math.PI); g.fill();                                            // short hair over the crown
    for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * .088, -.975, .018, .03, 0, 0, 6.283); g.fill();                     // the ears
      g.beginPath(); g.ellipse(sd * .062, -.913, .036, .03, 0, 0, 6.283); g.fill(); }                                            // the beard past the jaw
    g.beginPath(); g.moveTo(-.062, -.92); g.lineTo(.062, -.92); g.lineTo(.075, -.81); g.lineTo(-.075, -.81); g.fill();                     // neck
    g.beginPath(); g.moveTo(-.07, -.85); g.quadraticCurveTo(-.17, -.81, -.28, -.75); g.quadraticCurveTo(-.33, -.66, -.29, -.5); g.quadraticCurveTo(-.23, -.25, -.22, .02); g.lineTo(.22, .02); g.quadraticCurveTo(.23, -.25, .29, -.5); g.quadraticCurveTo(.33, -.66, .28, -.74); g.quadraticCurveTo(.17, -.81, .07, -.85); g.closePath(); g.fill();   // broad shoulders, the back
    for (const sd of [-1, 1]) { const sx = sd * .27, sy = -.69, a = .1, e = lerp(.42, .8, rise), ex = sx + sd * Math.sin(a) * .29, ey = sy + Math.cos(a) * .29, hx = ex + sd * Math.sin(a + e) * .26, hy = ey + Math.cos(a + e) * .26;
      const n1 = [Math.cos(a), -sd * Math.sin(a)], fa = a + e, n2 = [Math.cos(fa), -sd * Math.sin(fa)];
      g.beginPath(); g.ellipse(sx - sd * .01, sy + .01, .075, .07, 0, 0, 6.283); g.fill();                                                          // the shoulder cap
      g.beginPath(); g.moveTo(sx - n1[0] * .066, sy - n1[1] * .066); g.lineTo(ex - n1[0] * .052, ey - n1[1] * .052); g.lineTo(ex + n1[0] * .052, ey + n1[1] * .052); g.lineTo(sx + n1[0] * .066, sy + n1[1] * .066); g.closePath(); g.fill();   // upper arm in the wet sleeve
      g.beginPath(); g.arc(ex, ey, .054, 0, 6.283); g.fill();                                                                                       // elbow
      { const wo = .085, hang = .05; g.beginPath(); g.moveTo(ex - n2[0] * .05, ey - n2[1] * .05); g.lineTo(hx - n2[0] * wo * .8, hy - n2[1] * wo * .8); g.lineTo(hx + n2[0] * wo, hy + n2[1] * wo + hang); g.lineTo(lerp(ex, hx, .55) + n2[0] * .07, lerp(ey, hy, .55) + n2[1] * .07 + hang * .5); g.lineTo(ex + n2[0] * .05, ey + n2[1] * .05); g.closePath(); g.fill(); }   // the sleeve widening to the wrist, its wet hem hanging
      const hx2 = hx + sd * Math.sin(fa) * .04, hy2 = hy + Math.cos(fa) * .04; g.beginPath(); g.ellipse(hx2, hy2, .045, .028, sd * (Math.PI / 2 - fa) * -1, 0, 6.283); g.fill(); }
    if (folds) { g.strokeStyle = foldCol; g.lineWidth = .012; for (const [a, b, cc] of [[[0, -.74], [.01, -.5], [0, -.2]], [[-.2, -.68], [-.14, -.6], [-.08, -.55]], [[.2, -.68], [.14, -.6], [.08, -.55]]]) { g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(...b, ...cc); g.stroke(); } }   // the spine, the shoulder blades under the wet cloth
  }
  function spirit(ctx, u) {
    const W = P.W, H = P.H, V = P.ori === 'v', c = J.camS(u), L = J.lightS(u), [mx, mz] = J.man;
    W3.sky(ctx, c, L, u);
    // the sky above opens: a soft brightening at the top of the frame where the light comes from
    const open = ss(0, 1.6, u), top = W3.P(c, mx, 60, mz);
    if (top) { const R = V ? 700 : 680, gx = top[0], gy = H * .0; const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, R); g.addColorStop(0, `rgba(255,238,204,${.5 * open})`); g.addColorStop(.35, `rgba(244,222,188,${.18 * open})`); g.addColorStop(1, 'rgba(244,222,188,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    terrain(ctx, c, L, 38, 1e9);
    thicket(ctx, c, L, null);
    const rv = river(ctx, c, L, u, null);
    if (rv) { const g = ctx.createLinearGradient(0, rv.yFar - (V ? 80 : 56), 0, rv.yFar + (V ? 60 : 40)); g.addColorStop(0, css(L.fog, 0)); g.addColorStop(.55, css(mix(L.fog, [226, 224, 218], .35), .5)); g.addColorStop(1, css(L.fog, 0)); ctx.fillStyle = g; ctx.fillRect(0, rv.yFar - (V ? 80 : 56), W, V ? 140 : 96); }   // mist on the water
    // the shaft: soft stacked cones at quarter resolution, its density broken by drifting haze (no stripes), then blurred up
    const pk = ss(.2, 2.0, u), beamTop = 60, rTop = 2.2, rBot = 1.25;
    if (pk > 0) { const bc = J.beam, bg = bc.getContext('2d'), sx = bc.width / W; bg.setTransform(1, 0, 0, 1, 0, 0); bg.globalCompositeOperation = 'source-over'; bg.clearRect(0, 0, bc.width, bc.height); bg.setTransform(sx, 0, 0, sx, 0, 0); bg.globalCompositeOperation = 'lighter';
      const cone = (wk, a, col) => { const p0 = W3.P(c, mx - wk * rTop, beamTop, mz), p1 = W3.P(c, mx + wk * rTop, beamTop, mz), p2 = W3.P(c, mx + wk * rBot, WY, mz), p3 = W3.P(c, mx - wk * rBot, WY, mz); if (!p0 || !p1 || !p2 || !p3) return;
        const g = bg.createLinearGradient(0, Math.min(p0[1], 0), 0, p2[1]); g.addColorStop(0, css(col, a * .35)); g.addColorStop(.6, css(col, a * .8)); g.addColorStop(.92, css(col, a)); g.addColorStop(1, css(col, a * .4));
        bg.fillStyle = g; bg.beginPath(); bg.moveTo(p0[0], p0[1]); bg.lineTo(p1[0], p1[1]); bg.lineTo(p2[0], p2[1]); bg.lineTo(p3[0], p3[1]); bg.closePath(); bg.fill(); };
      for (let i = 0; i < 8; i++) cone(1.6 - i * .18, .1 * pk, [255, 210, 140]);
      bg.setTransform(1, 0, 0, 1, 0, 0); bg.globalCompositeOperation = 'destination-in'; const nh = bc.height * 1.6, off = (u * bc.height * .05) % nh;   // the haze drifts down
      if (!J.ntmp) J.ntmp = P.canvas(bc.width, bc.height); const ng = J.ntmp.getContext('2d'); ng.clearRect(0, 0, bc.width, bc.height); ng.drawImage(J.noise, -bc.width * .2, off - nh, bc.width * 1.4, nh); ng.drawImage(J.noise, -bc.width * .2, off, bc.width * 1.4, nh);
      bg.drawImage(J.ntmp, 0, 0);   // one destination-in pass (each such draw clears everything outside itself)
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = `blur(${V ? 10 : 9}px)`; ctx.drawImage(bc, 0, 0, W, H);
      if (rv) { ctx.globalAlpha = .35; ctx.translate(0, 2 * rv.yFar + (V ? 40 : 30)); ctx.scale(1, -1); ctx.beginPath(); ctx.rect(0, -H, W, 2 * rv.yFar + (V ? 40 : 30) - rv.yFar + H); ctx.clip(); ctx.drawImage(bc, 0, 0, W, H); }   // its reflection
      ctx.filter = 'none'; ctx.restore();
      // motes drifting down through it
      ctx.save(); ctx.globalCompositeOperation = 'screen'; const r = rng(66); ctx.fillStyle = 'rgba(255,244,222,.8)'; for (let i = 0; i < 60; i++) { const yy = ((r() * 12 - u * (.22 + .25 * r())) % 12 + 12) % 12 - .3, xx = mx + (r() - .5) * 2 * lerp(rBot, rTop, yy / 60), p = W3.P(c, xx, yy, mz + (r() - .5) * 1.6); if (!p) continue; ctx.globalAlpha = pk * (.2 + .5 * r()) * clamp(yy / 1.2); ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(1, p[2] * .01), 0, 6.283); ctx.fill(); } ctx.restore(); }
    // where it meets the river: the water lights round him; rings spread as the light comes to rest
    const bot = W3.P(c, mx, WY, mz), settle = ss(4.0, 5.3, u);   // settle: the dove's light has come down upon him and spread
    if (bot) { ctx.save(); ctx.globalCompositeOperation = 'screen';
      const ring = (rad, a) => { ctx.strokeStyle = `rgba(255,238,210,${a})`; ctx.lineWidth = Math.max(1, bot[2] * .016); ctx.beginPath(); for (let i = 0; i <= 48; i++) { const an = i / 48 * 6.283, p = W3.P(c, mx + Math.cos(an) * rad, WY, mz + Math.sin(an) * rad); if (p) i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); };
      { const R = bot[2] * 2.4, g = ctx.createRadialGradient(bot[0], bot[1], 0, bot[0], bot[1], R); g.addColorStop(0, `rgba(255,234,200,${.45 * pk + .25 * settle})`); g.addColorStop(1, 'rgba(255,234,200,0)'); ctx.save(); ctx.translate(bot[0], bot[1]); ctx.scale(1, .22); ctx.translate(-bot[0], -bot[1]); ctx.fillStyle = g; ctx.fillRect(bot[0] - R, bot[1] - R, 2 * R, 2 * R); ctx.restore(); }
      ctx.filter = 'blur(1px)'; for (let i = 0; i < 4; i++) { const tt = u - 4.1 - i * .7; if (tt <= 0) continue; ring(.55 + tt * .9, .3 * Math.max(0, 1 - tt / 2.6)); } ring(.5, .25 * pk); ctx.filter = 'none';
      ctx.restore(); }
    // the man, lit from above (a rim on the head and shoulders), and his broken reflection
    if (bot) { const s = bot[2], g = J.fig.getContext('2d'), S = J.fig.width, k = Math.min(1, S * .3 / (1.3 * s)), m = s * k, rise = ss(4.2, 6.2, u), lit = ss(3.2, 4.5, u);
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, S); g.save(); g.translate(S / 2, S * .6); g.scale(m, m);
      g.fillStyle = `rgb(255,232,192)`; manParts(g, rise, false); g.globalCompositeOperation = 'source-atop'; g.translate(0, .022 + .03 * (1 - lit)); g.fillStyle = 'rgb(40,40,48)'; manParts(g, rise, true, 'rgba(96,94,100,.3)');
      // 8차: the rim on the crown dimmed (no bright line sitting on top of his head — rule depict-christ-restraint, no halo)
      g.translate(0, -.016 - .03 * (1 - lit)); g.globalAlpha = .85; g.beginPath(); g.ellipse(0, -.985, .09, .106, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(0, -1.015, .094, .08, 0, Math.PI, 2 * Math.PI); g.fill(); g.globalAlpha = 1; g.restore();
      ctx.save(); ctx.globalAlpha = .3; ctx.filter = 'blur(2px)'; ctx.translate(bot[0], bot[1]); ctx.scale(1, -.8); ctx.drawImage(J.fig, -S / 2 / k, -S * .6 / k, S / k, S / k); ctx.restore();
      ctx.drawImage(J.fig, bot[0] - S / 2 / k, bot[1] - S * .6 / k, S / k, S / k);
      // the light come down upon him: a soft, wide, low wash across his shoulders and back — wider than it is tall and centred
      // below the shoulders, so it never makes a ring round his head
      if (settle > 0) { const cy = bot[1] - s * .5, rx = s * 1.25, g2 = ctx.createRadialGradient(bot[0], cy, 0, bot[0], cy, rx); g2.addColorStop(0, `rgba(255,226,170,${.32 * settle})`); g2.addColorStop(.45, `rgba(255,214,150,${.14 * settle})`); g2.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(bot[0], cy); ctx.scale(1, .42); ctx.translate(-bot[0], -cy); ctx.fillStyle = g2; ctx.fillRect(bot[0] - rx, cy - rx, rx * 2, rx * 2); ctx.restore(); }
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = `rgba(255,238,210,${.45 * pk})`; ctx.lineWidth = Math.max(1.2, s * .016); ctx.beginPath(); ctx.ellipse(bot[0], bot[1], s * .3, s * .045, 0, 0, 6.283); ctx.stroke(); ctx.restore(); }   // the water at his hips
    // the dove: a gathering of light with no outline — a bright core, two soft wing-glows that beat slowly then still, a faint tail
    // 8차 (관리자 "예수님 오른쪽으로 비둘기가 내려오는건 의도야?"): it comes straight down the shaft on his own axis, from the opening
    // in the sky toward him (마 3:16 "자기 위에 임하심"), and never stops over his head: still descending, it opens its wings wide,
    // loses its core and pours down over his head and shoulders (u 3.3–4.3), and as it reaches him it becomes a soft bloom round
    // his whole upper body, centred on his shoulders, that fades into the wash on him and the water (gone by u 5.8). No ring, no
    // disc, no point left above the head.
    // 8차 이상 확인 (관리자): it used to fade out ~2 m over his head — against the far thicket it read as a light far away among
    // the trees, and the bloom came only after it had gone. Now it keeps coming down past the tree line, over the mist on the
    // water, through his head height without slowing to a stop (≈1.4 m/s there), and its body reaches his shoulders (u ≈ 4.2)
    // at full strength, opening as it goes (its bright core already thinned to a downward pour before it passes his head, so
    // no point of light sits on the head even for a moment); the shoulder bloom (b below, centred where the dove ends) rises from the same moment, so there is no gap.
    { const yEnd = WY + .6, k = clamp((u - .5) / 3.9), dy = yEnd + (11.5 - yEnd) * Math.pow(1 - k, 1.6), p = W3.P(c, mx, dy, mz + .06);
      if (p && u > .4 && u < 5.0) { const s = p[2], a = ss(1.5, 2.5, u) * (1 - ss(4.2, 4.95, u)), core = 1 - ss(3.45, 4.0, u), open = ss(3.4, 4.2, u), beat = (1 - ss(3.0, 3.6, u)) * Math.sin(u * 3.0), spread = lerp(.2, .48, .5 + .5 * beat) * (1 - .4 * open), sc = J.soft.width / W, g = J.soft.getContext('2d');
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, J.soft.width, J.soft.height); g.setTransform(sc, 0, 0, sc, 0, 0); g.globalCompositeOperation = 'lighter';
        const glow = (x, y, rx, ry, rot, al) => { g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(255,228,150,${al})`); gr.addColorStop(.45, `rgba(255,190,92,${al * .5})`); gr.addColorStop(1, 'rgba(240,160,60,0)'); g.fillStyle = gr; g.fillRect(-rx, -rx, 2 * rx, 2 * rx); g.restore(); };
        const L0 = .62 * s, wl = 1 + 1.3 * open, gain = 1 + .35 * ss(2.8, 3.4, u) * (1 - ss(4.2, 4.8, u));   // a little stronger while it crosses the dark thicket and the mist (it must stay the brightest thing there)
        for (const sd of [-1, 1]) glow(p[0] + sd * L0 * .55 * wl, p[1] - L0 * spread * .55 + L0 * .25 * open, L0 * .62 * wl, L0 * .16 * (1 + open), sd * (-spread * .9), .75 * gain * a * (1 - .45 * open));
        glow(p[0], p[1] + L0 * .3 * open, L0 * .22 * (1 + .8 * open), L0 * .3 * (1 + 2.2 * open), 0, a * lerp(.35, 1, core)); glow(p[0], p[1] + L0 * .32, L0 * .14, L0 * .2, 0, .5 * gain * a * core * core);   // the core pours down and thins
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(4px)'; ctx.drawImage(J.soft, 0, 0, W, H); ctx.filter = 'none'; ctx.restore();
        const ba = a * .55 * (1 - ss(3.3, 3.85, u));   // the lens bloom gone before it reaches his head (no point of light there)
        if (ba > .005) W3.bloom(ctx, p[0], p[1], [255, 190, 100], ba, { r: V ? 170 : 140, streak: .08 }); }
      // the arrival: a gentle bloom round his whole upper body, centred on his shoulders (filled, wider than tall — never a ring)
      const b = ss(3.85, 4.5, u) * (1 - ss(5.1, 6.3, u));
      if (bot && b > 0) { const s = bot[2], cx = bot[0], cy = bot[1] - s * .6, R = s * 1.1, g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, `rgba(255,226,166,${.3 * b})`); g.addColorStop(.5, `rgba(255,212,146,${.13 * b})`); g.addColorStop(1, 'rgba(255,212,146,0)');
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(cx, cy); ctx.scale(1, .78); ctx.translate(-cx, -cy); ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); ctx.restore(); } }
    terrain(ctx, c, L, c.z - 1, 16.5);
    const body = [30, 31, 36];
    const objs = []; for (const cl of J.clumps) if (!cl.near) objs.push(cl); objs.sort((a, b) => b.z - a.z); for (const cl of objs) reedClump(ctx, c, L, u, cl, null, body, body);
    grass(ctx, c, L, u, null, [32, 32, 36]);
    nearReeds(ctx, c, L, u, null, [18, 18, 22]);
    W3.finish(ctx, u, { vignette: .6, grain: .08 });
  }

  function jordanScene(ctx, u, o = {}) {
    if (!J) buildJordan();
    if (o.mode === 'spirit') spirit(ctx, clamp(u, 0, J.dur.spirit)); else day(ctx, clamp(u, 0, J.dur.day));
  }
  window.buildJordan = buildJordan; window.jordanScene = jordanScene;
})();
