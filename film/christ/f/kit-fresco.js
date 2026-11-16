/* FRESCO — lime plaster in a low sun. Made for 「그리스도」 (2026-11): Peter speaks to many people seated in the courtyard of a
   house (Acts 10:24–27). The look began as a Pompeian wall painting (cinnabar panels, flat colour in dark outlines) and was
   turned, over the film's rounds, into the real place a fresco is painted on: plastered stone walls with the plaster fallen here
   and there to the courses beneath, a flagstone floor, a stone-framed gateway at the back. A low warm sun stands beyond the
   gateway: its opening burns white-gold, a shaft hangs in the air with dust turning in it, and a long pool lies across the
   flagstones toward the camera with the long shadow of every body standing in it. Everything else is in the courtyard's own
   open shade: warm bounce off the sunlit floor, darker up the walls. No outlines anywhere: figures are shapes lit by the light.
   The world is built in metres (X right, Y up, D depth) and projected by one pinhole camera, so the beam, the pool, the shadows
   and the dust all agree with the gateway they come through.
   API (world px = portrait screen px at zoom 1; the scene owns its camera and its figures):
     FRESCO.court(c) → C                                the camera and the gateway in metres. c: { F (focal px), E (eye height m), YH (horizon
         px), CX (centre px), DW (back wall depth), G0, G1 (the opening's X), GS (top of the jambs), GH (top of the arch), tanE (tan of the
         sun's height), hx, hz (its travel per unit of fall: right, toward us), n (16 arch steps) }.
         C.P(X, Y, D) → px · C.sun(X, Y, D) → [X, D] where the sun through that point lands on the floor · C.archY(X) · C.AP (the opening's
         outline [X, Y]) · C.wall(X, Y) (a point on the back wall) · C.beamAt(D) (the beam's section at depth D, px) · C.cast(X, D, S) (a
         figure's map (x, y) → its shadow on the floor; S = its height in m) · C.pool(clip .8) (the sunlit pool on the floor, px)
     FRESCO.poly(g, pts) · FRESCO.hull(pts) · FRESCO.clipD(poly, dmin) · FRESCO.circ(cx, cy, rx, ry, n, rot) · FRESCO.caps(a, b, w0, w1, n)
     FRESCO.ik(s, t, a, b, bend) → { el, wr } · FRESCO.adder(P, f, q) → add(pts, ...parts)   shapes: soft closed silhouettes (no lines)
     FRESCO.flagstones(x, P, o)                         limestone slabs laid by hand, earth in the joints, worn hollows. o: { XL, XR, DW, near (.7), seed (12) }
     FRESCO.plaster(g, pts, base, seed, wallMap, o)     a lime-plastered wall: mottling, and patches fallen to the stone courses. o: { patches (7),
         avoid (X, Y) → true to skip a patch there, X ([-4, 3]), Y ([.3, 5.5]), mottle (90), MY ([0, 7]) }
     FRESCO.grime(g, pts, y0, y1)                       the damp grime at the foot of a wall (pts the band, y0 → y1 the gradient)
     FRESCO.grain(g, w, h, seed = 5)                    plaster grain over everything (overlay, half resolution)
     FRESCO.openShade(g, w, h, ox, oy, o)               the courtyard's own light, multiplied over the albedo. o: { base (rgb), bounce: [[cx, cy, R, rgba]…]
         (added: light off the sunlit floor), shade (lx) → more multiplied gradients }
     FRESCO.gate(g, C, o)                               the opening burnt out by the low sun beyond it: glare, the lane's far wall lost in it, the jamb's
         inner face and the soffit in shade, the threshold lit. o: { depth (.5 m), veil (400 px) }
     FRESCO.gateStones(g, C, seed = 4)                  dressed stones round the arch (voussoirs) and down the jambs
     FRESCO.defocus(src, o) → canvas                    the plate a touch out of focus, the near rows more. o: { blur (1.2), oy, rows: [[y, px]…] }
     FRESCO.rim(X, T, off, path, box, Lt, d, c0, c1, bl)            a soft edge of light inside a shape: the shape minus itself moved along Lt
     FRESCO.edgeOn(X, T, off, sil, region, box, Lt, d, col, bl, a, spill)   the same, only on the silhouette's outer edge where it runs along one
         part (region); spill: blurred past the edge (a thin backlit cloth)
     FRESCO.lens(c, bl = .8)                            blur a plate in place: a lens, not a vector edge
     FRESCO.sunPool(C, PB, floor, shadows, o) → canvas  the pool of sun on the floor: floor(x) redraws the floor, shadows(mx) fills every body's
         cast silhouette (C.cast). o: { clip (.8), fade: [y0, y1, a] (weaker toward us) }
     FRESCO.shaft(C, SB, o) → canvas                    the shaft in the air (the hull of opening and pool) and rays from points of the opening along
         the sun. o: { clip (.8), n (22), seed (33), nearD (1.2) }
     FRESCO.bloom(C, BB) → canvas                       the glow round the opening (screen it over the room)
     FRESCO.dust(n = 96, seed = 41, big = 6) → motes    FRESCO.drawDust(ctx, u, motes, C, o) — dust that lives INSIDE the shaft (a point of the
         opening carried along the sun), brightest in the beam's core, fading at its edge, depth of field round o.focus; never over a face
         (o.heads [[x, y, r]…]) nor in front of a nearer body (o.bodies [[x, y, S, D, h]…]). o: { focus (m), I (sun 0..1), top (.05), near: [2.5, 3.4] }
     FRESCO.grainTile(seed = 91) → canvas · FRESCO.finish(ctx, u, tile, o)   grade: a soft warm vignette, a little soft-light contrast, moving grain.
         o: { soft (.45), grain (.07) }
   Kit: motion-skills canvas-film/kits/fresco (kit.js + STYLE.md); a film vendors this file unchanged as kit-fresco.js.
   Load after lib.js (Pilot). Exposes window.FRESCO. Pure functions of their arguments (seek-safe). No network, no images. */
(function () {
  const P = Pilot, { clamp, lerp, rng, canvas, noise, ss } = P;

  // ---------------- shapes ----------------
  const poly = (g, pts) => { if (g.beginPath) g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  const hull = pts => { const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = [];
    for (const x of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], x) <= 0) lo.pop(); lo.push(x); }
    for (const x of p.reverse()) { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], x) <= 0) hi.pop(); hi.push(x); } return lo.slice(0, -1).concat(hi.slice(0, -1)); };
  const circ = (cx, cy, rx, ry, n = 14, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * 6.283, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
  function caps(a, b, w0, w1, n = 5) {   // a capsule from a to b as a polygon
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), pts = [];
    for (let i = 0; i <= n; i++) { const t = ang - Math.PI / 2 + Math.PI * i / n; pts.push([b[0] + Math.cos(t) * w1, b[1] + Math.sin(t) * w1]); }
    for (let i = 0; i <= n; i++) { const t = ang + Math.PI / 2 + Math.PI * i / n; pts.push([a[0] + Math.cos(t) * w0, a[1] + Math.sin(t) * w0]); }
    return pts;
  }
  function ik(s, t, a, b, bend) {
    const dx = t[0] - s[0], dy = t[1] - s[1], dd = Math.hypot(dx, dy), d = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, dd)), ang = Math.atan2(dy, dx);
    const c = (a * a + d * d - b * b) / (2 * a * d), e = ang + bend * Math.acos(Math.max(-1, Math.min(1, c)));
    const el = [s[0] + Math.cos(e) * a, s[1] + Math.sin(e) * a], k = d / (dd || 1); return { el, wr: [s[0] + dx * k, s[1] + dy * k] };
  }
  function clipD(poly, dmin) {   // a floor polygon [X, D] cut at D >= dmin (nearer than that is under the camera)
    const out = []; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], ia = a[1] >= dmin, ib = b[1] >= dmin;
      if (ia) out.push(a); if (ia !== ib) { const t = (dmin - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * t, dmin]); } } return out;
  }
  function adder(P, f, q) {   // adds a closed rounded polygon (unit coords, mirrored by f) to the silhouette q and to any parts
    return (pts, ...to) => { pts = pts.map(([x, y]) => P(x * f, y)); let a = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; } if (a < 0) pts.reverse();
      const n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
      for (const t of [q, ...to]) { t.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) t.quadraticCurveTo(pts[i][0], pts[i][1], ...m(i)); t.closePath(); } };
  }

  // ---------------- the camera, the gateway, the sun ----------------
  function court(c) {
    const C = Object.assign({}, c);
    const cfP = (X, Y, D) => [c.CX + c.F * X / D, c.YH + c.F * (c.E - Y) / D];
    const cfSun = (X, Y, D) => { const t = Y / c.tanE; return [X + t * c.hx, D - t * c.hz]; };   // where the sun through (X, Y, D) lands on the floor
    const cfArchY = X => { const m = (c.G0 + c.G1) / 2, r = (c.G1 - c.G0) / 2, d = Math.abs(X - m); return d >= r ? c.GS : c.GS + (c.GH - c.GS) * Math.sqrt(1 - (d / r) ** 2); };
    const n = c.n || 16, AP = (() => { const a = [[c.G0, 0]]; for (let i = 0; i <= n; i++) { const X = c.G0 + (c.G1 - c.G0) * i / n; a.push([X, cfArchY(X)]); } a.push([c.G1, 0]); return a; })();   // the opening's outline (X, Y)
    C.P = cfP; C.sun = cfSun; C.archY = cfArchY; C.AP = AP;
    C.wall = (X, Y) => cfP(X, Y, c.DW);   // a point on the back wall
    // the beam's section at depth D (the figures standing there are clipped to it): the opening moved along the sun to D
    C.beamAt = D => { const t = (c.DW - D) / c.hz, ox = t * c.hx, dy = t * c.tanE; return AP.map(([X, Y]) => cfP(X + ox, Y - dy, D)); };
    // a figure's map (x, y in units of its height S m, feet at X, D) carried along the sun onto the floor: its long shadow
    C.cast = (X, D, S) => (x2, y2) => { const [Xs, Ds] = cfSun(X + x2 * S, -y2 * S, D); return cfP(Xs, 0, Math.max(.6, Ds)); };
    // the sun's pool on the floor: the opening's outline laid on the flagstones, cut where it passes under the camera
    C.pool = (clip = .8) => clipD(AP.map(([X, Y]) => cfSun(X, Y, c.DW)), clip).map(([X, D]) => cfP(X, 0, D));
    return C;
  }

  // ---------------- materials ----------------
  function flagstones(x, cfP, o) {   // flagstones: limestone slabs laid by hand in rows, earth in the joints, worn and mottled
    const { XL, XR, DW, near = .7, seed = 12 } = o, floorPoly = [cfP(XL, 0, DW), cfP(XR, 0, DW), cfP(XR, 0, near), cfP(XL, 0, near)];
    x.save(); poly(x, floorPoly); x.clip(); x.fillStyle = '#6a5644'; x.fill();
    const r = rng(seed); let D = DW;
    while (D > .75) { const dd = .42 + .26 * r(), D1 = Math.max(.7, D - dd); let X = XL - r() * .5;
      while (X < XR) { const ww = .45 + .55 * r(), j = () => (r() - .5) * .07, g0 = .014, g1 = .012;
        const pts = [[X + g0 + j(), D - g1], [X + ww - g0 + j(), D - g1], [X + ww - g0 + j(), D1 + g1], [X + g0 + j(), D1 + g1]].map(([a, b]) => cfP(a, 0, b));
        const v = .86 + .22 * r(), c = [162 * v, 140 * v, 110 * v]; x.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; poly(x, pts); x.fill();
        const cx = (pts[0][0] + pts[2][0]) / 2, cy = (pts[0][1] + pts[2][1]) / 2, R = Math.abs(pts[1][0] - pts[0][0]) * .5;   // a worn hollow / a stain
        if (R > 2) { const gr = x.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, r() < .5 ? 'rgba(200,176,140,.22)' : 'rgba(70,52,36,.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
        X += ww; }
      D = D1; }
    x.restore();
  }
  // walls: plaster over stone, the plaster fallen here and there to the courses beneath; wallMap(X, Y) → px on that wall
  function plaster(g, pts, base, seed, wallMap, o = {}) {
    const { patches = 7, avoid = () => false, X: xr = [-4, 3], Y: yr = [.3, 5.5], mottle = 90, MY: my = [0, 7] } = o;
    g.save(); poly(g, pts); g.clip(); g.fillStyle = base; g.fill();
    const r = rng(seed);
    for (let i = 0; i < patches; i++) {   // patches of bare stone (keep them off a plain back wall: there they read as blots)
      const X0 = lerp(xr[0], xr[1], r()), Y0 = lerp(yr[0], yr[1], r()), rw = .3 + .45 * r(), rh = .25 + .3 * r();
      if (avoid(X0, Y0)) continue;
      const blob = Array.from({ length: 22 }, (_, k) => { const a = k / 22 * 6.283, rr = .7 + .35 * r(); return wallMap(X0 + Math.cos(a) * rw * rr, Y0 + Math.sin(a) * rh * rr); });
      g.save(); g.globalAlpha = .5; poly(g, blob); g.clip(); g.fillStyle = '#7a6650'; g.fill();
      for (let Y = Math.floor((Y0 - rh - .4) / .3) * .3; Y < Y0 + rh + .4; Y += .3) { let X = X0 - rw - .5 + (Math.round(Y / .3) % 2) * .3;
        while (X < X0 + rw + .5) { const L = .45 + .45 * r(), v = .82 + .26 * r(); g.fillStyle = `rgb(${150 * v | 0},${128 * v | 0},${100 * v | 0})`; poly(g, [wallMap(X + .02, Y + .02), wallMap(X + L - .02, Y + .02), wallMap(X + L - .02, Y + .28), wallMap(X + .02, Y + .28)]); g.fill(); X += L; } }
      g.restore();
    }
    for (let i = 0; i < mottle; i++) { const [x, y] = wallMap(lerp(xr[0], xr[1], r()), lerp(my[0], my[1], r())), R = 30 + 110 * r(), gr = g.createRadialGradient(x, y, 0, x, y, R);   // mottling
      gr.addColorStop(0, r() < .55 ? `rgba(214,196,166,${.08 + .1 * r()})` : `rgba(80,62,46,${.06 + .08 * r()})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R); }
    g.restore();
  }
  function grime(g, pts, y0, y1) {   // damp grime at the foot of a wall
    g.save(); poly(g, pts); g.clip(); const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(60,44,30,0)'); gr.addColorStop(1, 'rgba(60,44,30,.42)'); g.fillStyle = gr; g.fill(); g.restore();
  }
  function grain(g, RW, RH, seed = 5) {   // plaster grain over everything
    const NW = RW >> 1, NH = RH >> 1, nc = canvas(NW, NH), nx = nc.getContext('2d'), im = nx.createImageData(NW, NH), d = im.data, r = rng(seed);
    for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) { const v = 128 + 30 * (noise(x * .02, y * .02) - .5) + 16 * (noise(x * .09, y * .09) - .5) + 16 * (r() - .5), i = (y * NW + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    nx.putImageData(im, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .45; g.drawImage(nc, 0, 0, RW, RH); g.restore();
  }
  // the courtyard's own light (open shade), multiplied over the albedo: a base, the bounce off the sunlit floor added, then the shade
  function openShade(g, RW, RH, OX, OY, o) {
    const lm = canvas(RW, RH), lx = lm.getContext('2d'); lx.translate(OX, OY); lx.fillStyle = o.base || 'rgb(222,206,188)'; lx.fillRect(-OX, -OY, RW, RH);
    lx.globalCompositeOperation = 'lighter';
    for (const [cx, cy, R, c] of o.bounce || []) { const gr = lx.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); lx.fillStyle = gr; lx.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
    lx.globalCompositeOperation = 'multiply';
    if (o.shade) o.shade(lx);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(lm, 0, 0); g.restore();
  }
  // the opening: the low sun beyond it burns it out white-gold; the far side of the lane a paler shape in the glare; the left jamb's inner
  // face and the arch's soffit in shade, the threshold lit
  function gate(g, C, o = {}) {
    const { G0, G1, GS, GH, DW } = C, Wb = C.wall, cfP = C.P, CF_AP = C.AP, apW = CF_AP.map(([X, Y]) => Wb(X, Y)), dep = o.depth ?? .5;
    g.save(); poly(g, apW); g.clip(); const [, yT] = Wb(0, GH), [, yB] = Wb(0, 0);
    let gr = g.createLinearGradient(0, yT, 0, yB); gr.addColorStop(0, '#fff4dc'); gr.addColorStop(.55, '#ffeccc'); gr.addColorStop(1, '#ffdcaa'); g.fillStyle = gr; g.fillRect(Wb(G0, 0)[0], yT, Wb(G1, 0)[0] - Wb(G0, 0)[0], yB - yT);
    g.fillStyle = 'rgba(214,184,140,.4)'; poly(g, [Wb(G0, 0), Wb(G0, 1.5), Wb(G0 + .5, 1.6), Wb(G1, 1.3), Wb(G1, 0)]); g.fill();   // the lane's far wall, lost in the glare
    const Wi = (X, Y) => cfP(X, Y, DW + dep);
    g.fillStyle = 'rgba(150,118,84,.9)'; poly(g, [Wb(G0, 0), Wb(G0, GS), Wi(G0, GS), Wi(G0, 0)]); g.fill();   // the left jamb's inner face
    g.fillStyle = 'rgba(120,94,66,.8)'; poly(g, [...CF_AP.slice(1, -1).map(([X, Y]) => Wb(X, Y)), ...CF_AP.slice(1, -1).reverse().map(([X, Y]) => Wi(X, Y))]); g.fill();   // the soffit
    g.fillStyle = 'rgba(255,240,206,.95)'; poly(g, [Wi(G0, 0), Wi(G1, 0), Wb(G1, 0), Wb(G0, 0)]); g.fill();
    g.fillStyle = 'rgba(255,250,236,.3)'; g.fillRect(Wb(G0, 0)[0], yT, o.veil ?? 400, yB - yT); g.restore();
  }
  function gateStones(g, C, seed = 4) {   // the gateway: dressed stones round the arch (voussoirs) and down the jambs
    const { G0, G1, GS } = C, Wb = C.wall;
    const r = rng(seed), c = (G0 + G1) / 2, R0 = (G1 - G0) / 2, R1 = R0 + .3;
    for (let i = 0; i < 11; i++) { const a0 = Math.PI * i / 11, a1 = Math.PI * (i + 1) / 11, P = (a, R) => Wb(c - Math.cos(a) * R, GS + Math.sin(a) * R), v = .9 + .16 * r();
      g.fillStyle = `rgb(${176 * v | 0},${156 * v | 0},${124 * v | 0})`; poly(g, [P(a0 + .012, R0), P(a1 - .012, R0), P(a1 - .012, R1), P(a0 + .012, R1)]); g.fill(); }
    for (const [xa, xb] of [[G0 - .3, G0], [G1, G1 + .3]]) for (let Y = 0; Y < GS; Y += .36) { const v = .88 + .16 * r(), dx = (Math.round(Y / .36) % 2) * .06;
      g.fillStyle = `rgb(${172 * v | 0},${152 * v | 0},${120 * v | 0})`; poly(g, [Wb(xa - (xa < G0 ? dx : 0) + .01, Y + .01), Wb(xb + (xb > G1 ? dx : 0) - .01, Y + .01), Wb(xb + (xb > G1 ? dx : 0) - .01, Y + .35), Wb(xa - (xa < G0 ? dx : 0) + .01, Y + .35)]); g.fill(); }
  }
  function defocus(room, o = {}) {   // the walls a touch out of focus, the near floor more
    const RW = room.width, RH = room.height, OY = o.oy || 0;
    const rb = canvas(RW, RH), x = rb.getContext('2d'); x.filter = `blur(${o.blur ?? 1.2}px)`; x.drawImage(room, 0, 0);
    for (const [y0, bl] of o.rows || []) { x.save(); x.beginPath(); x.rect(0, y0 + OY, RW, RH); x.clip(); x.filter = `blur(${bl}px)`; x.drawImage(room, 0, 0); x.restore(); }
    return rb;
  }

  // ---------------- light on figures (no outlines) ----------------
  // a soft edge of light: the shape minus itself moved along the light, coloured, blurred, kept inside the shape — never a line round it
  const rim = (X, T, off, path, box, Lt, d, c0, c1, bl) => {
    const [bx, by, bw, bh] = box.map(Math.round);
    T.save(); T.clearRect(bx - 6, by - 6, bw + 12, bh + 12); T.fillStyle = '#fff'; T.fill(path); T.globalCompositeOperation = 'destination-out'; T.translate(Lt[0] * d, Lt[1] * d); T.fill(path); T.restore();
    T.save(); T.globalCompositeOperation = 'source-in'; const gr = T.createLinearGradient(0, by, 0, by + bh); gr.addColorStop(0, c0); gr.addColorStop(1, c1); T.fillStyle = gr; T.fillRect(bx - 6, by - 6, bw + 12, bh + 12); T.restore();
    X.save(); X.clip(path); X.setTransform(1, 0, 0, 1, 0, 0); const sx = bx - 6 - off[0], sy = by - 6 - off[1];
    X.filter = `blur(${bl.toFixed(1)}px)`; X.drawImage(T.canvas, sx, sy, bw + 12, bh + 12, sx, sy, bw + 12, bh + 12); X.filter = 'none'; X.globalAlpha = .55; X.drawImage(T.canvas, sx, sy, bw + 12, bh + 12, sx, sy, bw + 12, bh + 12); X.restore(); };
  // the same edge band, only on the figure's OUTER edge (its silhouette's band toward the light) where it runs along one part (region):
  // the light from behind never finds an inner edge. spill: blurred and not kept inside (light coming through a thin backlit cloth)
  const edgeOn = (X, T, off, sil, region, box, Lt, d, col, bl, a, spill) => {
    const [bx, by, bw, bh] = box.map(Math.round);
    T.save(); T.clearRect(bx - 6, by - 6, bw + 12, bh + 12); T.fillStyle = '#fff'; T.fill(sil); T.globalCompositeOperation = 'destination-out'; T.translate(Lt[0] * d, Lt[1] * d); T.fill(sil); T.restore();
    T.save(); T.globalCompositeOperation = 'destination-in'; T.fill(region); T.globalCompositeOperation = 'source-in'; T.fillStyle = col; T.fillRect(bx - 6, by - 6, bw + 12, bh + 12); T.restore();
    X.save(); if (!spill) X.clip(region); X.setTransform(1, 0, 0, 1, 0, 0); const sx = bx - 6 - off[0], sy = by - 6 - off[1]; X.globalAlpha = a; X.filter = `blur(${bl.toFixed(1)}px)`; X.drawImage(T.canvas, sx, sy, bw + 12, bh + 12, sx, sy, bw + 12, bh + 12);
    if (!spill) { X.filter = 'none'; X.globalAlpha = a * .5; X.drawImage(T.canvas, sx, sy, bw + 12, bh + 12, sx, sy, bw + 12, bh + 12); } X.restore(); };
  const lens = (c, bl = .8) => { const t = canvas(c.width, c.height), x = t.getContext('2d'); x.filter = `blur(${bl}px)`; x.drawImage(c, 0, 0); const cx = c.getContext('2d'); cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, c.width, c.height); cx.drawImage(t, 0, 0); cx.restore(); };   // a lens, not a vector edge

  // ---------------- the sun: the pool on the floor (with the long shadows of everyone standing in it), the shaft in the air, the glow ----
  function sunPool(C, PB, floor, shadows, o = {}) {
    const poolW = C.pool(o.clip ?? .8), [f0, f1, fa] = o.fade || [940, 1800, .45];
    const pc = canvas(PB.w, PB.h), x = pc.getContext('2d'); x.translate(-PB.x, -PB.y);
    floor(x); x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgb(255,214,160)'; x.fillRect(PB.x, PB.y, PB.w, PB.h);
    x.globalCompositeOperation = 'screen'; x.fillStyle = 'rgb(176,124,70)'; x.fillRect(PB.x, PB.y, PB.w, PB.h);
    const mk = canvas(PB.w, PB.h), mx = mk.getContext('2d'); mx.translate(-PB.x, -PB.y); mx.filter = 'blur(3px)'; mx.fillStyle = '#fff'; poly(mx, poolW); mx.fill();
    mx.globalCompositeOperation = 'destination-out'; mx.filter = 'blur(3.5px)';
    shadows(mx);   // each body's shadow: its silhouette carried along the sun onto the floor (C.cast)
    mx.filter = 'none'; { const gr = mx.createLinearGradient(0, f0, 0, f1); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${fa})`); mx.fillStyle = gr; mx.fillRect(PB.x, PB.y, PB.w, PB.h); }   // weaker toward us
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'destination-in'; x.drawImage(mk, 0, 0);
    return pc;
  }
  function shaft(C, SB, o = {}) {
    const { G0, G1, DW } = C, Wb = C.wall, cfP = C.P, cfSun = C.sun, cfArchY = C.archY, apW = C.AP.map(([X, Y]) => Wb(X, Y)), poolW = C.pool(o.clip ?? .8);
    const n = o.n ?? 22, nearD = o.nearD ?? 1.2;
    const sc = canvas(SB.w, SB.h), x = sc.getContext('2d'); x.translate(-SB.x, -SB.y);
    const H = hull([...apW, ...poolW]);
    x.filter = 'blur(30px)'; let gr = x.createLinearGradient(apW[0][0], apW[0][1] - 100, poolW[Math.floor(poolW.length / 2)][0], poolW[Math.floor(poolW.length / 2)][1]); gr.addColorStop(0, 'rgba(255,226,170,.55)'); gr.addColorStop(.4, 'rgba(255,214,150,.3)'); gr.addColorStop(1, 'rgba(255,200,140,0)'); x.fillStyle = gr; poly(x, H); x.fill();
    x.filter = 'blur(9px)'; x.globalCompositeOperation = 'lighter'; const r = rng(o.seed ?? 33);   // rays: from points of the opening along the sun
    for (let i = 0; i < n; i++) { const X = lerp(G0 + .05, G1 - .05, r()), Y0 = lerp(.3, cfArchY(X) - .05, r()), a = Wb(X, Y0), [Xs, Ds] = cfSun(X, Y0, DW), lam = Math.min(1, (DW - nearD) / (DW - Ds)), b = cfP(X + (Xs - X) * lam, Y0 * (1 - lam), DW - (DW - Ds) * lam), wd = 8 + 26 * r(), al = .08 + .18 * r();
      gr = x.createLinearGradient(a[0], a[1], b[0], b[1]); gr.addColorStop(0, `rgba(255,232,190,${al})`); gr.addColorStop(.6, `rgba(255,232,190,${al * .4})`); gr.addColorStop(1, 'rgba(255,232,190,0)'); x.strokeStyle = gr; x.lineWidth = wd; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); }
    return sc;
  }
  function bloom(C, BB) {   // the glow round the opening
    const apW = C.AP.map(([X, Y]) => C.wall(X, Y)), bc = canvas(BB.w, BB.h), x = bc.getContext('2d'); x.translate(-BB.x, -BB.y); x.filter = 'blur(60px)'; x.fillStyle = 'rgba(255,220,160,.85)'; poly(x, apW); x.fill();
    x.filter = 'blur(16px)'; x.fillStyle = 'rgba(255,240,210,.55)'; poly(x, apW); x.fill(); return bc;
  }
  // dust in the light: few motes, all of them INSIDE the shaft — each lives at a point of the gateway's opening (ox, oy in 0..1 of its width
  // and height) carried a distance h along the sun — so a mote that drifts toward the opening's edge has drifted to the beam's edge and
  // fades there, and it is brightest in the beam's core. Most are tiny and faint (in focus at o.focus); `big` are large soft discs nearer
  // the camera (out of focus). Closed form: each mote's place is a function of u.
  function dust(n = 96, seed = 41, big = 6) { const r = rng(seed); return Array.from({ length: n }, (_, i) => ({ ox: r(), oy: .08 + .86 * r(), lam: i < big ? .62 + .3 * r() : Math.pow(r(), .85), bok: i < big, p1: r() * 6.283, p2: r() * 6.283, p3: r() * 6.283, s: r(), a: r() })); }
  function drawDust(ctx, u, motes, C, o) {
    const N = P.noise, DF = o.focus, TOP = o.top ?? .05, I = o.I, [nb, nd] = o.near || [2.5, 3.4], bodies = o.bodies || [], heads = o.heads || [], cfP = C.P, cfArchY = C.archY;
    for (const m of motes) {
      // drift in the opening's coordinates: slow wander + a gentle turbulence, a slow settling; and slowly along the beam
      const ox = m.ox + .035 * Math.sin(u * .21 + m.p1) + .03 * (N(u * .28 + m.p2 * 3, m.p1 * 5) - .5), oy = m.oy + .03 * Math.sin(u * .17 + m.p2) + .03 * (N(u * .25 + m.p3 * 3, m.p2 * 5) - .5) - .012 * u;
      const edge = ss(0, .16, Math.min(ox, 1 - ox)) * ss(0, .12, Math.min(oy, 1 - oy)); if (edge <= 0) continue;
      const core = Math.exp(-(((ox - .5) / .3) ** 2) - (((oy - .45) / .45) ** 2));                     // the beam's core brighter
      const X0 = C.G0 + (C.G1 - C.G0) * ox, Y0 = oy * (cfArchY(X0) - .02); if (Y0 < TOP + .05) continue;
      const hMax = Math.min((Y0 - TOP) / C.tanE, (C.DW - (m.bok ? nb : nd)) / C.hz), h = hMax * clamp(m.lam + .025 * Math.sin(u * .13 + m.p3) + .01 * u);
      const X = X0 + h * C.hx, Y = Y0 - h * C.tanE, D = C.DW - h * C.hz, [x, y] = cfP(X, Y, D);
      let hid = false; for (const [bx, by, bS, bD, bh] of bodies) if (bD < D - .05 && Math.abs(x - bx) < .21 * bS && y < by && y > by - bh * bS) { hid = true; break; } if (hid) continue;
      let face = 1; for (const [hx, hy, hr] of heads) { const d = Math.hypot(x - hx, y - hy) / hr; if (d < 2.2) face = Math.min(face, ss(1.2, 2.2, d)); } if (face <= 0) continue;
      // depth of field round the focus: a circle of confusion that grows quickly toward the camera, slowly beyond
      const coc = 150 * Math.max(0, 1 / D - 1 / DF) + 22 * Math.max(0, 1 / DF - 1 / D), r0 = (m.bok ? 2.4 : 1.1 + 1.4 * m.s) * 4 / D, R = Math.max(r0 * 2.2, r0 + coc * (m.bok ? 1.6 : 1));
      const glint = .8 + .2 * Math.sin(u * .9 + m.p1 * 2);                                             // a slow turn, no twinkle
      let a = edge * (.25 + .75 * core) * face * glint * I * (m.bok ? .12 + .06 * m.a : (.4 + .4 * m.a) * Math.min(1, (r0 * 2.2 / R) ** 1.2));
      if (a < .006) continue;
      const gr = ctx.createRadialGradient(x, y, 0, x, y, R);
      if (m.bok) { gr.addColorStop(0, `rgba(255,222,172,${a})`); gr.addColorStop(.62, `rgba(255,220,168,${a * .8})`); gr.addColorStop(1, 'rgba(255,214,160,0)'); }
      else { gr.addColorStop(0, `rgba(255,228,184,${a})`); gr.addColorStop(.4, `rgba(255,220,170,${a * .45})`); gr.addColorStop(1, 'rgba(255,214,160,0)'); }
      ctx.fillStyle = gr; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); }
  }

  // ---------------- grade ----------------
  function grainTile(seed = 91) { const gc = canvas(256, 256), x = gc.getContext('2d'), im = x.createImageData(256, 256), rr = rng(seed); for (let i = 0; i < 65536; i++) { const v = 128 + (rr() - .5) * 110; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); return gc; }
  // a soft vignette (lighter toward the gate's side, upper left), a little soft-light contrast (the haze kept, the shapes firmer), grain
  function finish(ctx, u, tile, o = {}) {
    const W = P.W, H = P.H;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'multiply';
    { const R = Math.hypot(W, H) * .62, gr = ctx.createRadialGradient(W * .38, H * .38, R * .25, W * .45, H * .45, R); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(206,192,180)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = o.soft ?? .45; ctx.drawImage(ctx.canvas, 0, 0);
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain ?? .07; const f = Math.floor(u * 24); ctx.translate(-((f * 73) % 256), -((f * 151) % 256)); ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256);
    ctx.restore();
  }

  window.FRESCO = { court, poly, hull, clipD, circ, caps, ik, adder, flagstones, plaster, grime, grain, openShade, gate, gateStones, defocus,
    rim, edgeOn, lens, sunPool, shaft, bloom, dust, drawDust, grainTile, finish };
})();
