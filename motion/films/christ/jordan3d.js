/* 「그리스도」 — the Jordan, painted 3D world (kit-world3d.js, W3). One river, used twice:
   · default (Q1, 요 1:41, film 7.6–14.6 s, u = 0..7): Bethany beyond the Jordan (요 1:28), the east bank, late afternoon
     ("열 시쯤", 요 1:39 — about four o'clock): we look west across the river toward the Judean hills and the low sun. The
     water glitters; reeds stand along the shore. Andrew hurries along the bank to his brother Simon, who turns; Andrew points
     back the way he came and beckons — "우리가 메시야를 만났다". Simon takes a first step. The camera trucks right and closes in.
   · { mode: 'spirit' } (Q9, 행 10:38, film 129.7–136 s, u = 0..6.5): the same river and reeds in a paler, cooler light. A soft
     shaft of light comes down through the haze; a dove-like gathering of light descends in it and rests over one man standing
     in the water. The camera closes in.
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
      cam: W3.cam([[0, -2.4, 1.22, -.8, .1, .5, 13, 1300, 1820], [3.5, -1.2, 1.2, .1, .8, .48, 13, 1330, 1860], [7, -.2, 1.18, 1.0, 1.2, .46, 13, 1380, 1940]]),
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
    const n1 = [Math.cos(a), -Math.sin(a)], n2 = [Math.cos(fa), -Math.sin(fa)], w0 = .052, w1 = .044, w2 = .058;
    o.push({ k: 'poly', col, pts: [[sx + n1[0] * w0, sy + n1[1] * w0], [ex + n1[0] * w1, ey + n1[1] * w1], [hx + n2[0] * w2, hy + n2[1] * w2], [hx - n2[0] * w2 * 1.15, hy - n2[1] * w2 * 1.15], [ex - n1[0] * w1, ey - n1[1] * w1], [sx - n1[0] * w0, sy - n1[1] * w0]] });
    o.push({ k: 'ell', col, x: ex, y: ey, rx: .048, ry: .048, r: 0 });                                         // the elbow, rounded
    // the hand beyond the sleeve: a mitten and a thumb (or a pointing finger)
    const hx2 = hx + Math.sin(fa) * .045, hy2 = hy + Math.cos(fa) * .045;
    o.push({ k: 'ell', col, x: hx2, y: hy2, rx: .042, ry: .03, r: Math.PI / 2 - fa });
    o.push({ k: 'line', col, w: .018, pts: [[hx2, hy2], [hx2 + Math.sin(fa + .9) * .05, hy2 + Math.cos(fa + .9) * .05]] });
    if (point > 0) o.push({ k: 'line', col, w: .02, pts: [[hx2, hy2], [hx2 + Math.sin(fa) * .1 * point, hy2 + Math.cos(fa) * .1 * point]] });
  }
  function bodyParts(ps, tunic, mantle) {
    const o = [], s = ps.stride || 0, sway = ps.sway || 0, hd = ps.head || 0;
    const f = ps.armF || [-.1, .25], n = ps.armN || [.1, .25];
    armShape(o, -.04, -1.36, f[0], f[1], mantle, ps.pointF || 0);                                            // far arm, behind
    // feet in sandals under the hem
    o.push({ k: 'ell', col: tunic, x: .2 * s + .07, y: -.03, rx: .11, ry: .035, r: 0 }, { k: 'ell', col: tunic, x: -.2 * s + .03, y: -.03, rx: .11, ry: .035, r: 0 });
    // tunic: shoulders → chest → belted waist → hem that swings with the stride
    o.push({ k: 'poly', col: tunic, pts: [[-.15, -1.42], [.1, -1.44], [.15, -1.3], [.15, -1.06], [.13, -.98], [.16, -.92], [.23 + .1 * Math.max(0, s), -.07], [.05, -.04], [-.24 - .08 * Math.max(0, -s), -.07], [-.17, -.92], [-.15, -.98], [-.17, -1.08], [-.19, -1.3]] });
    // mantle (겉옷) over the shoulders and back, its front edge falling diagonally to the calf
    o.push({ k: 'poly', col: mantle, pts: [[-.19, -1.43], [.07, -1.46], [.13, -1.33], [.06, -1.0], [.02, -.42], [-.12, -.36], [-.3 - .05 * Math.max(0, -s), -.34], [-.25, -.9], [-.21, -1.2]] });
    o.push({ k: 'fold', pts: [[-.02, -1.38], [-.08, -.9], [-.1, -.44]] }, { k: 'fold', pts: [[-.12, -1.36], [-.18, -.95], [-.23, -.4]] }, { k: 'fold', pts: [[.06, -1.2], [.03, -.8], [.01, -.48]] });
    // the head: skull, a nose, a beard; the head cloth over the crown and down the back, its loose end swinging
    o.push({ k: 'head', col: mantle, hd, sway });
    armShape(o, .05, -1.37, n[0], n[1], mantle, 0);                                                            // near arm, in front
    return o;
  }
  function headPath(g, hd, sway) {
    g.save(); g.translate(.02, -1.58); g.rotate(hd);
    g.beginPath(); g.ellipse(0, 0, .092, .112, 0, 0, 6.283); g.fill();                                          // skull
    g.beginPath(); g.moveTo(.08, -.045); g.lineTo(.124, .0); g.lineTo(.085, .028); g.closePath(); g.fill();      // nose
    g.beginPath(); g.moveTo(.085, .04); g.quadraticCurveTo(.1, .12, .03, .16); g.quadraticCurveTo(-.03, .14, -.02, .06); g.closePath(); g.fill();   // beard
    // head cloth: forehead → over the crown → down the back to the shoulders; the loose end hangs behind
    g.beginPath(); g.moveTo(.085, -.075); g.quadraticCurveTo(.03, -.15, -.06, -.13); g.quadraticCurveTo(-.15, -.08, -.15, .04); g.quadraticCurveTo(-.16, .14, -.2, .22);
    g.lineTo(-.06, .2); g.quadraticCurveTo(-.04, .06, .02, .02); g.quadraticCurveTo(.05, -.03, .085, -.075); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-.15, .08); g.quadraticCurveTo(-.22 - sway * .5, .24, -.23 - sway, .36); g.lineTo(-.18 - sway, .37); g.quadraticCurveTo(-.15, .24, -.1, .1); g.closePath(); g.fill();
    g.restore();
    g.beginPath(); g.moveTo(-.03, -1.48); g.lineTo(.06, -1.48); g.lineTo(.07, -1.41); g.lineTo(-.05, -1.41); g.closePath(); g.fill();   // neck
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
  // the beats (u seconds): Andrew hurries in from the left (0–2.4), stops; Simon turns to him (1.9–2.7); Andrew points back the
  // way he came and beckons (2.4–7); Simon's head lifts and he takes a first step toward him (5.2–6.6)
  const SIMON = [2.2, 11.55], A_FROM = -3.6, A_TO = .95;
  function brotherList(u) {
    const walkK = eo(clamp(u / 2.4)), ax = lerp(A_FROM, A_TO, walkK), ph = (ax - A_FROM) / .62 * Math.PI, moving = 1 - ss(1.9, 2.5, u);
    const step = ss(5.2, 6.6, u), sx = SIMON[0] - .2 * step, sph = .2 * step / .62 * Math.PI;
    const pt = ss(2.4, 3.1, u), bk = ss(3.0, 3.5, u), beck = bk * Math.max(0, Math.sin((u - 3.2) * 4.4)) * (1 - ss(5.6, 6.4, u) * .6);
    const tk = ss(1.9, 2.7, u), cf = Math.cos(Math.PI * tk);
    return [
      { x: ax, z: SIMON[1] - .25, face: 1, ps: { stride: Math.sin(ph) * moving, sway: .05 * Math.sin(ph * 1) * moving + .03 * Math.sin(u * 2), lean: .07 * moving + .03 * pt, head: -.04 * moving + .08 * pt,
        armN: [lerp(.35 * Math.sin(ph) * moving, 1.25, bk), lerp(.25, .35 + .75 * beck, bk)],      // the near hand reaches toward Simon and beckons
        armF: [lerp(-.35 * Math.sin(ph) * moving, -2.1, pt), lerp(.25, .12, pt)], pointF: ss(2.8, 3.2, u) } },   // the far arm points back the way he came
      { x: sx, z: SIMON[1], face: 1, ps: { xs: Math.sign(cf || 1) * (.6 + .4 * Math.abs(cf)), stride: tk >= 1 ? Math.sin(sph) * step * (1 - ss(6.4, 7, u)) : 0, sway: .02 * Math.sin(u * 1.7), lean: -.03 * step,
        head: .1 * ss(3.2, 4.2, u) - .06 * (1 - tk), armN: [.12 + .12 * ss(3.4, 4.4, u), .3 + .3 * ss(3.4, 4.4, u)], armF: [-.08, .22] } }];
  }
  function shadows(ctx, c, L, list) {
    for (const f of list) { const gp = W3.P(c, f.x, hJ(f.x, f.z) + .02, f.z), e = L.elev * Math.PI / 180, len = 1.7 / Math.tan(e), dx = -L.sd[0], dz = -L.sd[2], dl = Math.hypot(dx, dz) || 1, ex = f.x + dx / dl * len, ez = f.z + dz / dl * len;
      const sh = W3.P(c, ex, hJ(ex, ez) + .02, ez); if (gp && sh) { ctx.save(); const g = ctx.createLinearGradient(gp[0], gp[1], sh[0], sh[1]); g.addColorStop(0, 'rgba(12,8,10,.5)'); g.addColorStop(1, 'rgba(12,8,10,0)');
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
  // spirit: the man in the water (frontal; origin at the water surface on his axis): wet hair to the shoulders, a beard, sloped
  // shoulders, the wet tunic clinging (two folds), arms from the shoulders — upper arm, elbow, forearm out over the water, open
  // hands just above it. rise (0..1) opens the hands a little upward as the light rests on him.
  function manParts(g, rise, folds, foldCol) {
    g.beginPath(); g.ellipse(0, -1.0, .088, .108, 0, 0, 6.283); g.fill();                                                        // head
    g.beginPath(); g.moveTo(-.09, -1.04); g.quadraticCurveTo(-.12, -.9, -.15, -.78); g.lineTo(.15, -.78); g.quadraticCurveTo(.12, -.9, .09, -1.04); g.quadraticCurveTo(0, -1.15, -.09, -1.04); g.fill();   // wet hair
    g.beginPath(); g.moveTo(-.05, -.93); g.quadraticCurveTo(0, -.84, .05, -.93); g.lineTo(.04, -.86); g.lineTo(-.04, -.86); g.closePath(); g.fill();   // beard
    g.beginPath(); g.moveTo(-.045, -.9); g.lineTo(.045, -.9); g.lineTo(.05, -.8); g.lineTo(-.05, -.8); g.fill();                    // neck
    g.beginPath(); g.moveTo(-.07, -.8); g.quadraticCurveTo(-.2, -.79, -.25, -.72); g.quadraticCurveTo(-.29, -.64, -.25, -.5); g.quadraticCurveTo(-.2, -.25, -.2, .02); g.lineTo(.2, .02); g.quadraticCurveTo(.2, -.25, .25, -.5); g.quadraticCurveTo(.29, -.64, .25, -.72); g.quadraticCurveTo(.2, -.79, .07, -.8); g.closePath(); g.fill();   // shoulders, torso
    for (const sd of [-1, 1]) { const sx = sd * .235, sy = -.69, a = .1, e = lerp(.42, .8, rise), ex = sx + sd * Math.sin(a) * .29, ey = sy + Math.cos(a) * .29, hx = ex + sd * Math.sin(a + e) * .26, hy = ey + Math.cos(a + e) * .26;
      const n1 = [Math.cos(a), -sd * Math.sin(a)], fa = a + e, n2 = [Math.cos(fa), -sd * Math.sin(fa)];
      g.beginPath(); g.moveTo(sx - n1[0] * .055, sy - n1[1] * .055); g.lineTo(ex - n1[0] * .045, ey - n1[1] * .045); g.lineTo(hx - n2[0] * .05, hy - n2[1] * .05); g.lineTo(hx + n2[0] * .05, hy + n2[1] * .05); g.lineTo(ex + n1[0] * .045, ey + n1[1] * .045); g.lineTo(sx + n1[0] * .06, sy + n1[1] * .06); g.closePath(); g.fill();
      g.beginPath(); g.arc(ex, ey, .045, 0, 6.283); g.fill();
      const hx2 = hx + sd * Math.sin(fa) * .04, hy2 = hy + Math.cos(fa) * .04; g.beginPath(); g.ellipse(hx2, hy2, .045, .028, sd * (Math.PI / 2 - fa) * -1, 0, 6.283); g.fill(); }
    if (folds) { g.strokeStyle = foldCol; g.lineWidth = .012; for (const [a, b, cc] of [[[-.14, -.7], [-.05, -.45], [.02, -.15]], [[.12, -.66], [.1, -.4], [.14, -.12]]]) { g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(...b, ...cc); g.stroke(); } }
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
      for (let i = 0; i < 8; i++) cone(1.6 - i * .18, .1 * pk, [255, 228, 182]);
      bg.setTransform(1, 0, 0, 1, 0, 0); bg.globalCompositeOperation = 'destination-in'; const nh = bc.height * 1.6, off = (u * bc.height * .05) % nh;   // the haze drifts down
      if (!J.ntmp) J.ntmp = P.canvas(bc.width, bc.height); const ng = J.ntmp.getContext('2d'); ng.clearRect(0, 0, bc.width, bc.height); ng.drawImage(J.noise, -bc.width * .2, off - nh, bc.width * 1.4, nh); ng.drawImage(J.noise, -bc.width * .2, off, bc.width * 1.4, nh);
      bg.drawImage(J.ntmp, 0, 0);   // one destination-in pass (each such draw clears everything outside itself)
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = `blur(${V ? 10 : 9}px)`; ctx.drawImage(bc, 0, 0, W, H);
      if (rv) { ctx.globalAlpha = .35; ctx.translate(0, 2 * rv.yFar + (V ? 40 : 30)); ctx.scale(1, -1); ctx.beginPath(); ctx.rect(0, -H, W, 2 * rv.yFar + (V ? 40 : 30) - rv.yFar + H); ctx.clip(); ctx.drawImage(bc, 0, 0, W, H); }   // its reflection
      ctx.filter = 'none'; ctx.restore();
      // motes drifting down through it
      ctx.save(); ctx.globalCompositeOperation = 'screen'; const r = rng(66); ctx.fillStyle = 'rgba(255,244,222,.8)'; for (let i = 0; i < 60; i++) { const yy = ((r() * 12 - u * (.22 + .25 * r())) % 12 + 12) % 12 - .3, xx = mx + (r() - .5) * 2 * lerp(rBot, rTop, yy / 60), p = W3.P(c, xx, yy, mz + (r() - .5) * 1.6); if (!p) continue; ctx.globalAlpha = pk * (.2 + .5 * r()) * clamp(yy / 1.2); ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(1, p[2] * .01), 0, 6.283); ctx.fill(); } ctx.restore(); }
    // where it meets the river: the water lights round him; rings spread as the light comes to rest
    const bot = W3.P(c, mx, WY, mz);
    if (bot) { ctx.save(); ctx.globalCompositeOperation = 'screen';
      const ring = (rad, a) => { ctx.strokeStyle = `rgba(255,238,210,${a})`; ctx.lineWidth = Math.max(1, bot[2] * .016); ctx.beginPath(); for (let i = 0; i <= 48; i++) { const an = i / 48 * 6.283, p = W3.P(c, mx + Math.cos(an) * rad, WY, mz + Math.sin(an) * rad); if (p) i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); };
      { const R = bot[2] * 2.4, g = ctx.createRadialGradient(bot[0], bot[1], 0, bot[0], bot[1], R); g.addColorStop(0, `rgba(255,234,200,${.45 * pk})`); g.addColorStop(1, 'rgba(255,234,200,0)'); ctx.save(); ctx.translate(bot[0], bot[1]); ctx.scale(1, .22); ctx.translate(-bot[0], -bot[1]); ctx.fillStyle = g; ctx.fillRect(bot[0] - R, bot[1] - R, 2 * R, 2 * R); ctx.restore(); }
      ctx.filter = 'blur(1px)'; for (let i = 0; i < 4; i++) { const tt = u - 3.6 - i * .7; if (tt <= 0) continue; ring(.55 + tt * .9, .3 * Math.max(0, 1 - tt / 2.6)); } ring(.5, .25 * pk); ctx.filter = 'none';
      ctx.restore(); }
    // the man, lit from above (a rim on the head and shoulders), and his broken reflection
    if (bot) { const s = bot[2], g = J.fig.getContext('2d'), S = J.fig.width, k = Math.min(1, S * .3 / (1.3 * s)), m = s * k, rise = ss(4.0, 6.0, u), lit = ss(2.6, 4.4, u);
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, S); g.save(); g.translate(S / 2, S * .6); g.scale(m, m);
      g.fillStyle = `rgb(255,232,192)`; manParts(g, rise, false); g.globalCompositeOperation = 'source-atop'; g.translate(0, .022 + .03 * (1 - lit)); g.fillStyle = 'rgb(40,40,48)'; manParts(g, rise, true, 'rgba(120,116,116,.6)'); g.restore();
      ctx.save(); ctx.globalAlpha = .3; ctx.filter = 'blur(2px)'; ctx.translate(bot[0], bot[1]); ctx.scale(1, -.8); ctx.drawImage(J.fig, -S / 2 / k, -S * .6 / k, S / k, S / k); ctx.restore();
      ctx.drawImage(J.fig, bot[0] - S / 2 / k, bot[1] - S * .6 / k, S / k, S / k);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = `rgba(255,238,210,${.45 * pk})`; ctx.lineWidth = Math.max(1.2, s * .016); ctx.beginPath(); ctx.ellipse(bot[0], bot[1], s * .3, s * .045, 0, 0, 6.283); ctx.stroke(); ctx.restore(); }   // the water at his hips
    // the dove: a gathering of light with no outline — a bright core, two soft wing-glows that beat slowly then still, a faint tail
    { const dk = eio(clamp((u - .5) / 3.9)), dy = lerp(11.5, 1.45, dk) + .04 * Math.sin(u * 2.2) * ss(4.4, 5.2, u), p = W3.P(c, mx, dy, mz);
      if (p && u > .4) { const s = p[2], a = ss(.4, 1.3, u), beat = (1 - ss(3.6, 4.8, u)) * Math.sin(u * 3.0), spread = lerp(.2, .48, .5 + .5 * beat) * (1 - .25 * ss(3.8, 5, u)), sc = J.soft.width / W, g = J.soft.getContext('2d');
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, J.soft.width, J.soft.height); g.setTransform(sc, 0, 0, sc, 0, 0); g.globalCompositeOperation = 'lighter';
        const glow = (x, y, rx, ry, rot, al) => { g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(255,248,230,${al})`); gr.addColorStop(.45, `rgba(255,236,200,${al * .45})`); gr.addColorStop(1, 'rgba(255,230,190,0)'); g.fillStyle = gr; g.fillRect(-rx, -rx, 2 * rx, 2 * rx); g.restore(); };
        const L0 = .62 * s; for (const sd of [-1, 1]) glow(p[0] + sd * L0 * .55, p[1] - L0 * spread * .55, L0 * .62, L0 * .16, sd * (-spread * .9), .75 * a);
        glow(p[0], p[1], L0 * .22, L0 * .3, 0, a); glow(p[0], p[1] + L0 * .32, L0 * .14, L0 * .2, 0, .5 * a);
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(4px)'; ctx.drawImage(J.soft, 0, 0, W, H); ctx.filter = 'none'; ctx.restore();
        W3.bloom(ctx, p[0], p[1], [255, 234, 196], a * (.5 + .25 * ss(3.8, 4.8, u)), { r: V ? 170 : 140, streak: .16 }); } }
    terrain(ctx, c, L, c.z - 1, 16.5);
    lip(ctx, c, L, u, .3);
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
