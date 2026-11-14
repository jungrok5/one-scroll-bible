/* 「그리스도」 — N06 (film 44.3–51.4 s, u = 0..7.1): "많은 사람들은 약속된 그 왕을 / 로마를 몰아낼 왕으로만 기다렸습니다."
   Painted 3D world (kit-world3d.js, W3). Jerusalem in the first century (Herod's city): we stand inside the walls at sunset and
   look west through an arched stone gate between two towers. The low sun stands in the arch; its light pours through the
   passage onto the paving and throws the long shadows of a small crowd who stand in the gate looking out at the far hills
   (one shades his eyes, one points, a mother with a child, an old man with a staff). The camera starts low under the gate and
   cranes up slowly until the gate's top comes into the frame: two Roman soldiers (helmet, spear, shield) and the legion's eagle
   standard stand dark against the burning sky — the empire over the people's waiting. The light is the same red-gold sunset
   the next scene (Caesarea Philippi at dusk, oil) continues.
   Walls are a few large faces, each painted with a soft gradient and a few world-locked weathering stains (no stone courses,
   nothing that can shimmer); every top edge burns with the backlight. Words are not drawn here.
   API: buildJerusalem() (sync) · jerusalemScene(ctx, u) */
(function () {
  const P = Pilot, { clamp, lerp, ss, eio, eo, rng, noise, fbm, mix } = P, css = (c, a) => W3.css(c, a);
  let G = null;
  // a ground segment A→B cut where it passes the camera's near plane, along its own line: [A, B', t] (t = the part of the
  // length that is kept) or null when A itself is behind the camera
  const NEARC = .62, clipSeg = (c, A, B) => { const da = W3.toC(c, ...A)[2], db = W3.toC(c, ...B)[2]; if (da < NEARC) return null; if (db >= NEARC) return [A, B, 1];
    const t = (da - NEARC) / (da - db); return [A, [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t], t]; };
  const ridged = (x, z, o = 4) => { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * (1 - Math.abs(2 * P.noise(x * f, z * f) - 1)); f *= 2.03; a *= .5; } return s / (1 - Math.pow(.5, o)); };
  // the land beyond the gate: the road drops into a valley, then the hill country rises in folds toward the sun
  const HC = new Map(), NC = new Map();
  function hRaw(x, z) { const d = z - 34; if (d < 0) return 0; let h = -14 * ss(10, 160, d) + 2.5 * fbm(x * .02, z * .02, 2) * ss(5, 40, d);
    h += 70 * ss(400, 2600, d) * (.3 + .7 * ridged(x * .0012 + 2, z * .0012, 4)) + 260 * ss(2500, 9000, d) * ridged(x * .0004 + 5, z * .0004 + 1, 4); return h; }
  const hG = (x, z) => { const k = Math.round(x * 4 + 4e6) * 2e7 + Math.round(z * 4 + 1e5); let v = HC.get(k); if (v === undefined) { v = hRaw(x, z); HC.set(k, v); } return v; };
  const albG = (x, z) => { const d = z - 34, n = fbm(x * .01, z * .01, 2); return d < 300 ? mix([.62, .54, .4], [.42, .42, .3], n) : mix([.7, .6, .48], [.56, .5, .42], n); };
  function terrain(ctx, c, L, zLo) {
    const S = d => Math.pow(2, Math.max(-1, Math.round(Math.log2(.4 + d * .04)))), rows = [];
    let s = S(zLo - c.z), z = Math.floor(zLo / s) * s; while (z - c.z < 14000) { rows.push([z, s]); const ns = S(z - c.z + s); if (ns > s && Math.abs(z / ns - Math.round(z / ns)) < 1e-6) s = ns; z += s; } rows.push([z, s]);
    const dirx = c.f[0] / Math.max(.2, c.f[2]), spread = P.ori === 'v' ? .3 : .55;   // seen only through the gate: a narrow fan is enough
    const nrm = (x, zz, e) => { const k = Math.round(x * 4 + 4e6) * 2e7 + Math.round(zz * 4 + 1e5) + e * 1e-3; let n = NC.get(k); if (!n) { const hx = hG(x + e, zz) - hG(x - e, zz), hz = hG(x, zz + e) - hG(x, zz - e), l = Math.hypot(hx, 2 * e, hz); n = [-hx / l, 2 * e / l, -hz / l]; NC.set(k, n); } return n; };
    const col = (x, zz, e, dd) => W3.shade(albG(x, zz), nrm(x, zz, Math.max(1, e)), Math.max(1, dd), L);
    for (let i = rows.length - 2; i >= 0; i--) { const [z0, sz] = rows[i], z1 = rows[i + 1][0], sN = rows[i + 1][1], dd = z0 - c.z;
      const half = 10 + spread * dd, xc = c.x + dirx * dd, j0 = Math.floor((xc - half) / sz), j1 = Math.ceil((xc + half) / sz);
      const hFar = x => { if (sN === sz) return hG(x, z1); const xa = Math.floor(x / sN) * sN; return lerp(hG(xa, z1), hG(xa + sN, z1), (x - xa) / sN); };
      for (let j = j0; j < j1; j++) { const x0 = j * sz, x1 = x0 + sz, a = hG(x0, z0), b = hG(x1, z0), cc = hFar(x1), e = hFar(x0);
        if (!W3.poly(ctx, c, [[x0, a, z0], [x1, b, z0], [x1, cc, z1], [x0, e, z1]])) continue;
        const xm = x0 + sz / 2, cN = col(xm, z0, sz, dd), cF = col(xm, z1, sz, z1 - c.z), pN = W3.P(c, xm, (a + b) / 2, z0), pF = W3.P(c, xm, (cc + e) / 2, z1);
        if (pN && pF && Math.abs(pN[1] - pF[1]) > 2) { const g = ctx.createLinearGradient(pN[0], pN[1], pF[0], pF[1]); g.addColorStop(0, css(cN)); g.addColorStop(1, css(cF)); ctx.fillStyle = g; } else ctx.fillStyle = css(cN);
        ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke(); } }
  }

  // ---- the gate (metres; the wall's outer face looks west, +z; we stand inside, at z < 26) ----
  const AW = 2.6, AS = 4.6, AT = 7.2;   // the arch: half-width, springing height, crown height (semicircle AS + AW ≈ AT)
  const archPts = (z, n = 24) => { const p = [[-AW, 0, z]]; for (let i = 0; i <= n; i++) { const a = Math.PI - i / n * Math.PI; p.push([Math.cos(a) * AW, AS + Math.sin(a) * (AT - AS), z]); } p.push([AW, 0, z]); return p; };
  function buildJerusalem() {
    const stone = [.86, .76, .6], F = [];
    const B = (x0, y0, z0, x1, y1, z1, k = 1) => F.push(...W3.box(x0, y0, z0, x1, y1, z1, stone, k));
    // towers either side of the gate, the curtain wall running off both ways
    B(-9.6, 0, 25.5, -3.2, 16, 34, .96); B(3.2, 0, 25.5, 9.6, 16, 34, .98);
    B(-70, 0, 30, -9.6, 11, 34, .94); B(9.6, 0, 30, 70, 11, 34, .94);
    B(-3.2, 9.6, 27.5, 3.2, 13, 34, 1);                                         // over the gate
    // battlements: merlons along every top (they burn at the edges with the backlight)
    const merl = []; const row = (x0, x1, y, z0, z1) => { for (let x = x0; x < x1 - .6; x += 1.8) { B(x, y, z0, x + 1.0, y + 1.1, z1, .97); merl.push([x, x + 1.0, y + 1.1, z0]); } };
    row(-9.6, -3.2, 16, 25.5, 26.4); row(3.2, 9.6, 16, 25.5, 26.4); row(-70, -9.6, 11, 30, 30.8); row(9.6, 70, 11, 30, 30.8);
    // the gate top (round 6, 관리자 "병사랑 깃발이 성벽 밖에 … 벽에 붙어 공중에"): a wall walk 6.5 m deep behind a parapet on its
    // city edge. The merlons are kept apart from the other faces so they are painted AFTER the soldiers and the standard, who
    // stand on the walk set back behind them: the parapet and the block's top edge hide their feet and lower legs. Three wider
    // embrasures (≈1.1 m) are left where the two legionaries and the eagle stand, so they read through the gaps.
    const PP = []; for (const [x0, x1] of [[-3.2, -2.45], [-1.35, -.45], [.45, 1.35], [2.45, 3.2]]) { PP.push(...W3.box(x0, 13, 27.5, x1, 14.1, 28.3, stone, .97)); merl.push([x0, x1, 14.1, 27.5]); }
    for (const [x0, x1] of [[-2.45, -1.35], [-.45, .45], [1.35, 2.45]]) merl.push([x0, x1, 13, 27.5]);   // the walk's edge in each embrasure burns too
    // the passage: its two side walls and the barrel vault (inside faces, seen from the city)
    const P2 = []; for (const sd of [-1, 1]) P2.push({ pts: sd < 0 ? [[-AW, 0, 27.5], [-AW, 0, 34], [-AW, AS, 34], [-AW, AS, 27.5]] : [[AW, 0, 34], [AW, 0, 27.5], [AW, AS, 27.5], [AW, AS, 34]], alb: stone, k: .8, two: true });
    for (let i = 0; i < 16; i++) { const a0 = Math.PI - i / 16 * Math.PI, a1 = Math.PI - (i + 1) / 16 * Math.PI, y0 = AS + Math.sin(a0) * (AT - AS), y1 = AS + Math.sin(a1) * (AT - AS);
      P2.push({ pts: [[Math.cos(a0) * AW, y0, 27.5], [Math.cos(a0) * AW, y0, 34], [Math.cos(a1) * AW, y1, 34], [Math.cos(a1) * AW, y1, 27.5]], alb: stone, k: .75, two: true }); }
    // weathering stains on the big faces (world-locked: they move with the wall, never crawl)
    const r = rng(7), stains = []; for (let i = 0; i < 70; i++) { const tower = r() < .55, x = tower ? (r() < .5 ? -1 : 1) * (3.4 + r() * 6) : (r() - .5) * 6.2, y = tower ? r() * 15 : 7.6 + r() * 5.2; stains.push({ x, y, z: tower ? 25.48 : 27.48, r: .8 + r() * 2.6, d: r() < .6 ? -1 : 1, a: .06 + .09 * r() }); }
    // the crowd in the gate, seen from behind (they look out at the hills): [x, z, height, kind]
    const crowd = [[-1.6, 29.6, 1.74, 'shade'], [-.5, 30.6, 1.68, 'stand'], [.7, 29.0, 1.78, 'point'], [1.7, 30.2, 1.62, 'veil'], [1.25, 30.25, 1.08, 'child'], [-2.2, 27.4, 1.7, 'staff'], [2.3, 27.0, 1.72, 'stand'], [-.2, 26.4, 1.76, 'walk']];
    // the curtain wall (behind the towers) is painted, and its tops burn, before the towers and the gate: nothing of it shows through them
    const back = f => f.pts.every(q => Math.abs(q[0]) >= 9.59), FB = F.filter(back), FF = F.filter(f => !back(f)), MB = merl.filter(m => Math.abs(m[0]) >= 9.59), MF = merl.filter(m => Math.abs(m[0]) < 9.59);
    G = { F, FB, FF, PP, MB, MF, P2, merl, stains, crowd, fig: P.canvas(700, 700), top: P.canvas(420, 420),
      // the camera starts low under the gate and cranes up until the gate's top, the soldiers and the eagle stand in the sky
      // (portrait and landscape frame differently: the feet stay above the words, the eagle comes in at the top by the end)
      // round 2 (관리자: the eagle must read during the first words): the standard and the soldiers are in the frame from u = 0
      cam: P.ori === 'v' ? W3.cam([[-2, -2.6, .6, -.2, .1, 2.9, 30, 1645, 1645], [0, -1.8, 1.2, -1, .1, 2.83, 30, 1660, 1660], [3.6, .1, 2.8, -2.5, .1, 2.7, 30, 1690, 1690], [7.1, 1.9, 4.5, -4, .1, 2.5, 30, 1720, 1720], [9.2, 2.8, 5.6, -5, .1, 2.4, 30, 1740, 1740]])   /* keys beyond both ends: the crane never stops inside the shot */
        : W3.cam([[-2, -3, .6, -.2, .1, 5.35, 30, 1205, 1205], [0, -2.1, 1.2, -1, .1, 5.4, 30, 1225, 1225], [3.6, .1, 2.8, -2.5, .1, 5.5, 30, 1265, 1265], [7.1, 2.2, 4.5, -4, .1, 5.6, 30, 1310, 1310], [9.2, 3.2, 5.6, -5, .1, 5.7, 30, 1335, 1335]]),
      light: W3.light([[0, 3.2, 2, 1.2, [255, 170, 100], [146, 114, 112], [104, 86, 118], [255, 172, 108], [255, 164, 96], [204, 136, 112], 2600, 0],
        [7.1, 2.6, 2, 1.15, [255, 160, 92], [140, 108, 108], [100, 82, 114], [252, 162, 100], [255, 154, 90], [198, 128, 106], 2500, 0]]) };
  }

  // the front of the gate block: one face with the arch cut out (even-odd), painted with a soft vertical gradient and its stains
  function gateFace(ctx, c, L) {
    const z = 27.5, outer = [[-3.2, 0, z], [3.2, 0, z], [3.2, 13, z], [-3.2, 13, z]].map(p => W3.P(c, ...p)), inner = archPts(z).map(p => W3.P(c, ...p));
    if (outer.some(p => !p) || inner.some(p => !p)) return;
    const base = W3.shade([.86, .76, .6], [0, 0, -1], z - c.z, L), g = ctx.createLinearGradient(0, outer[0][1], 0, outer[3][1]);
    g.addColorStop(0, css(mix(base, [20, 14, 14], .35))); g.addColorStop(1, css(mix(base, L.glow, .12)));
    ctx.beginPath(); outer.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); inner.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
    ctx.fillStyle = g; ctx.fill('evenodd');
    // the arch's voussoir ring: a slightly lighter band round the opening, catching light from the passage
    ctx.save(); ctx.lineWidth = Math.max(2, inner[0][2] * .5); ctx.strokeStyle = css(mix(base, L.glow, .25), .55); ctx.beginPath(); inner.slice(1, -1).forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore();
  }
  // a big face of a tower or wall gets the same soft vertical gradient over its flat shade (drawn after W3.faces)
  function towerGlaze(ctx, c, L) {
    for (const [x0, x1] of [[-9.6, -3.2], [3.2, 9.6]]) { const q = [[x0, 0, 25.5], [x1, 0, 25.5], [x1, 16, 25.5], [x0, 16, 25.5]].map(p => W3.P(c, ...p)); if (q.some(p => !p)) continue;
      const g = ctx.createLinearGradient(0, q[0][1], 0, q[3][1]); g.addColorStop(0, 'rgba(14,10,12,.4)'); g.addColorStop(.6, 'rgba(14,10,12,0)'); g.addColorStop(1, css(L.glow, .1));
      ctx.fillStyle = g; ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); }
    // the gate's stains stay on the gate's face (they used to spill over its top edge onto the sky and now the soldiers there)
    const gq = [[-3.2, 0, 27.5], [3.2, 0, 27.5], [3.2, 13, 27.5], [-3.2, 13, 27.5]].map(p => W3.P(c, ...p)), gclip = gq.every(Boolean) ? new Path2D() : null;
    if (gclip) { gq.forEach((p, i) => i ? gclip.lineTo(p[0], p[1]) : gclip.moveTo(p[0], p[1])); gclip.closePath(); }
    for (const s of G.stains) { const p = W3.P(c, s.x, s.y, s.z); if (!p) continue; const R = s.r * p[2], g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], R), cc = s.d < 0 ? [12, 8, 10] : mix(L.glow, [120, 90, 80], .5);
      g.addColorStop(0, css(cc, s.a)); g.addColorStop(1, css(cc, 0)); ctx.save(); if (s.z > 27 && gclip) ctx.clip(gclip); ctx.translate(p[0], p[1]); ctx.scale(1, 1.4); ctx.translate(-p[0], -p[1]); ctx.fillStyle = g; ctx.fillRect(p[0] - R, p[1] - R, 2 * R, 2 * R); ctx.restore(); }
  }
  // every top edge burns: a thin line of sun along the merlons and wall tops
  function burn(ctx, c, L, list = G.merl) {
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = css(mix(L.glow, [255, 230, 190], .3), .75); ctx.lineCap = 'round';
    const seg = (a, b) => { const p = W3.P(c, ...a), q = W3.P(c, ...b); if (!p || !q) return; ctx.lineWidth = Math.max(1.2, p[2] * .07); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
    for (const [x0, x1, y, z] of list) seg([x0, y, z], [x1, y, z]);
    ctx.restore();
  }
  // ---- the gate top: backlit volumes like the wall (관리자 2026-11-14 "아웃라인이 있어서 어색해" — no stroked outlines) ----
  // Each thing is drawn in metres into a scratch canvas: its dark mass shaded like the stone (W3.shade, same fog and ambient as
  // the merlons beside it) with a soft top-to-bottom turn, per-part tones for depth (the shield's curve, the cloth of the
  // vexillum glowing red where the sun comes through it), and a sun rim only on the edges that face the light — the shape minus
  // itself shifted away from the light, laid sharp and once more blurred.
  function backlit(ctx, c, L, X, Y, Z, hM, side, sunP, parts) {
    const p = W3.P(c, X, Y, Z); if (!p) return; const s = p[2], oc = G.top, g = oc.getContext('2d'), S = oc.width, k = Math.min(1, S * .45 / (hM * s)), m = s * k;
    const dist = Math.hypot(X - c.x, Y - c.y, Z - c.z), dark = alb => W3.shade(alb, [0, 0, -1], dist, L);
    // the light: the low sun beyond, and the bright sky over the tops (the merlons burn on their top edges): up and toward the sun
    const sx = sunP ? clamp((sunP[0] - p[0]) / (P.W * .35), -1, 1) : 0, tl = Math.hypot(sx * .8, 1), tw = [sx * .8 / tl, -1 / tl], w = Math.max(1.3, m * .045);
    const ox = S / 2, oy = S * .82, at = (gg, dx, dy) => { gg.setTransform(m * side, 0, 0, m, ox + dx, oy + dy); };
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, S, S);
    // the mass, part by part, then its soft turn (a little haze-lit at the top, deeper at the foot)
    at(g, 0, 0); for (const q of parts) { g.fillStyle = q.fill ? q.fill(g, dark) : css(dark(q.alb)); g.fill(q.path); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; { const gr = g.createLinearGradient(0, oy - hM * m, 0, oy); gr.addColorStop(0, css(mix(L.glow, L.fog, .5), .16)); gr.addColorStop(.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(8,5,5,.3)'); g.fillStyle = gr; g.fillRect(0, 0, S, S); }
    // the rim band: the union in the rim colour, minus the union moved away from the light
    if (!G.rim || G.rim.width !== S) G.rim = P.canvas(S, S); const rg = G.rim.getContext('2d'); rg.setTransform(1, 0, 0, 1, 0, 0); rg.globalCompositeOperation = 'source-over'; rg.clearRect(0, 0, S, S);
    rg.fillStyle = css(mix(L.glow, [255, 230, 190], .35)); at(rg, 0, 0); for (const q of parts) rg.fill(q.path);
    rg.globalCompositeOperation = 'destination-out'; rg.fillStyle = '#000'; at(rg, -tw[0] * w, -tw[1] * w); for (const q of parts) rg.fill(q.path);
    const dx = p[0] - ox / k, dy = p[1] - oy / k, dw = S / k;
    ctx.save(); ctx.drawImage(oc, dx, dy, dw, dw);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .95; ctx.drawImage(G.rim, dx, dy, dw, dw);
    ctx.globalAlpha = .7; ctx.filter = `blur(${Math.max(1.5, s * .035).toFixed(1)}px)`; ctx.drawImage(G.rim, dx, dy, dw, dw); ctx.filter = 'none'; ctx.restore();
  }
  // the eagle standard (after messiah film.html aquila(), smaller; metres, foot of the pole at the origin): pole, crossbar,
  // the eagle with spread wings on its plinth, the red vexillum hanging from the bar
  function aquila(ctx, c, L, X, Y, Z, u, sunP) {
    const k = .36, T = new DOMMatrix().scale(k, k), path = f => { const q = new Path2D(); f(q); const o = new Path2D(); o.addPath(q, T); return o; };
    const pole = path(q => { q.rect(-.09, -9, .18, 9); q.rect(-.9, -4.4, 1.8, .16); q.rect(-.6, -9.15, 1.2, .3); });
    const eagle = path(q => { q.moveTo(0, -10.2); q.bezierCurveTo(-.5, -10.4, -1.1, -11.2, -1.9, -11.4); q.bezierCurveTo(-1.5, -10.8, -1.3, -10.3, -.7, -9.9); q.bezierCurveTo(-.4, -9.6, -.2, -9.3, 0, -9.2);
      q.bezierCurveTo(.2, -9.3, .4, -9.6, .7, -9.9); q.bezierCurveTo(1.3, -10.3, 1.5, -10.8, 1.9, -11.4); q.bezierCurveTo(1.1, -11.2, .5, -10.4, 0, -10.2); q.closePath();
      q.ellipse(0, -10.35, .2, .24, 0, 0, 6.283); q.moveTo(.12, -10.42); q.lineTo(.42, -10.35); q.lineTo(.14, -10.28); q.closePath(); });
    const sw = .12 * Math.sin(u * 1.6), flag = path(q => { q.moveTo(-.85, -4.25); q.lineTo(.85, -4.25); q.quadraticCurveTo(.95 + sw, -3.2, .8 + sw * 1.4, -2.2); q.lineTo(-.9 + sw * 1.4, -2.2); q.quadraticCurveTo(-.95 + sw, -3.2, -.85, -4.25); q.closePath(); });
    backlit(ctx, c, L, X, Y, Z, 4.3, 1, sunP, [
      { path: flag, fill: (g, dark) => { const gr = g.createLinearGradient(0, -4.25 * k, 0, -2.2 * k), d = dark([.46, .1, .08]); gr.addColorStop(0, css(mix(d, [20, 8, 8], .35))); gr.addColorStop(.6, css(mix(d, [150, 36, 22], .35))); gr.addColorStop(1, css(mix(d, [120, 30, 20], .25))); return gr; } },   // the sun through the red cloth
      { path: pole, alb: [.2, .16, .13] },
      { path: eagle, fill: (g, dark) => { const gr = g.createLinearGradient(-1.9 * k, 0, 1.9 * k, 0), d = dark([.26, .2, .14]); gr.addColorStop(0, css(mix(d, [10, 8, 8], .3))); gr.addColorStop(.5, css(mix(d, L.glow, .12))); gr.addColorStop(1, css(mix(d, [10, 8, 8], .3))); return gr; } }]);   // the gilt bird: its body a little lit, the wing tips darker
  }
  // a legionary on the gate top, seen from inside the city (back view, looking out; metres, feet at the origin): crested helmet,
  // the cuirass and the strip skirt, legs, the spear arm to the shaft, the curved shield on the left
  function soldier(ctx, c, L, X, Y, Z, side, u, sunP) {
    const body = new Path2D(), shield = new Path2D(), spear = new Path2D(), helm = new Path2D();
    helm.ellipse(0, -1.6, .12, .13, 0, 0, 6.283); helm.moveTo(-.14, -1.62); helm.quadraticCurveTo(0, -1.82, .14, -1.62); helm.lineTo(.15, -1.55); helm.lineTo(-.15, -1.55); helm.closePath();
    helm.moveTo(-.1, -1.76); helm.quadraticCurveTo(0, -1.92, .1, -1.76); helm.lineTo(.08, -1.72); helm.lineTo(-.08, -1.72); helm.closePath();   // the crest
    body.moveTo(-.06, -1.47); body.lineTo(.06, -1.47); body.lineTo(.22, -1.4); body.lineTo(.24, -1.0); body.lineTo(.16, -.62); body.lineTo(.13, -.04); body.lineTo(.03, -.04); body.lineTo(0, -.55); body.lineTo(-.03, -.04); body.lineTo(-.13, -.04); body.lineTo(-.16, -.62); body.lineTo(-.24, -1.0); body.lineTo(-.22, -1.4); body.closePath();
    body.moveTo(-.24, -.62); body.lineTo(.24, -.62); body.lineTo(.2, -.48); body.lineTo(-.2, -.48); body.closePath();                                     // the skirt of strips
    body.moveTo(.22, -1.36); body.lineTo(.34, -1.1); body.lineTo(.33, -1.02); body.lineTo(.2, -1.2); body.closePath();                                  // spear arm to the shaft
    spear.rect(.3, -2.5, .035, 2.5); spear.moveTo(.317, -2.72); spear.lineTo(.36, -2.5); spear.lineTo(.274, -2.5); spear.closePath();
    shield.moveTo(-.2, -1.32); shield.quadraticCurveTo(-.46, -1.3, -.46, -.85); shield.lineTo(-.44, -.38); shield.quadraticCurveTo(-.3, -.4, -.24, -.5); shield.lineTo(-.24, -1.2); shield.closePath();
    backlit(ctx, c, L, X, Y, Z, 2.8, side, sunP, [
      { path: spear, alb: [.2, .16, .13] },
      { path: body, fill: (g, dark) => { const gr = g.createLinearGradient(-.24, 0, .24, 0), d = dark([.3, .22, .18]); gr.addColorStop(0, css(mix(d, [8, 6, 6], .25))); gr.addColorStop(.45, css(d)); gr.addColorStop(1, css(mix(d, [8, 6, 6], .3))); return gr; } },   // rounded: the middle of the back a touch lighter
      { path: helm, alb: [.32, .25, .2] },
      { path: shield, fill: (g, dark) => { const gr = g.createLinearGradient(-.46, 0, -.2, 0), d = dark([.36, .14, .11]); gr.addColorStop(0, css(mix(d, L.glow, .14))); gr.addColorStop(.35, css(d)); gr.addColorStop(1, css(mix(d, [8, 6, 6], .4))); return gr; } }]);   // the shield's curve: its outer edge catches the sky, it turns dark toward the body
  }

  // ---- the crowd: back-view silhouettes (metres, feet at the origin), robe and head cloth, arms from the shoulders ----
  function person(g, kind, u, ph) {
    const sw = .015 * Math.sin(u * 1.1 + ph), veil = kind === 'veil', child = kind === 'child', man = !veil && !child;
    g.save(); g.rotate(sw * .5);
    g.beginPath(); g.ellipse(0, -1.58, .098, .118, 0, 0, 6.283); g.fill();                                                                // head
    if (veil || child) { g.beginPath(); g.moveTo(0, -1.73); g.quadraticCurveTo(.13, -1.7, .14, -1.56); g.quadraticCurveTo(.16, -1.44, veil ? .26 : .2, veil ? -.9 : -1.34); g.lineTo(veil ? -.26 : -.2, veil ? -.9 : -1.34); g.quadraticCurveTo(-.16, -1.44, -.14, -1.56); g.quadraticCurveTo(-.13, -1.7, 0, -1.73); g.fill(); }   // the mother's veil down her back / the child's little cloth
    else {
      // the men (관리자 2026-11-14: long falling cloth reads as a woman): a cloth wound close round the head with a band, or bare
      // short hair; a thick neck; the beard showing past the jaw on the side the head is turned to; broad square shoulders
      const bare = [1, 6].includes(Math.round(ph / 1.7)), turn = kind === 'point' || kind === 'shade' ? 1 : kind === 'staff' ? -1 : 0;
      if (bare) { g.beginPath(); g.ellipse(0, -1.6, .104, .11, 0, Math.PI, 2 * Math.PI); g.fill(); }                                         // short hair over the crown
      else { g.beginPath(); g.moveTo(-.118, -1.56); g.quadraticCurveTo(-.13, -1.75, 0, -1.76); g.quadraticCurveTo(.13, -1.75, .118, -1.56); g.quadraticCurveTo(.12, -1.47, .1, -1.43); g.lineTo(-.1, -1.43); g.quadraticCurveTo(-.12, -1.47, -.118, -1.56); g.fill();   // wound cloth to the nape
        g.beginPath(); g.ellipse(0, -1.61, .124, .03, 0, 0, 6.283); g.fill(); }                                                             // its band
      g.beginPath(); g.moveTo(-.075, -1.5); g.lineTo(.075, -1.5); g.lineTo(.085, -1.4); g.lineTo(-.085, -1.4); g.closePath(); g.fill();      // neck
      if (turn) { g.beginPath(); g.ellipse(turn * .085, -1.5, .05, .065, turn * .3, 0, 6.283); g.fill(); }                                    // the beard past the jaw
    }
    // shoulders from the neck — the men broad and square, the robe falling straight; the women and the child sloped, the robe
    // widening to the hem (its hem stirs a little)
    const sh = man ? .265 : .22, hem = man ? .24 : .27, wst = man ? .17 : .165;
    g.beginPath(); g.moveTo(-.06, -1.46); g.quadraticCurveTo(-sh + .02, -1.45, -sh, -1.37); g.quadraticCurveTo(-sh - .03, -1.2, -sh + .03, -1.02); g.lineTo(-wst, -.97); g.lineTo(-wst - .025, -.9); g.lineTo(-hem - .01 * Math.sin(u * 1.7 + ph), -.02); g.lineTo(hem + .01 * Math.sin(u * 1.5 + ph), -.02); g.lineTo(wst + .025, -.9); g.lineTo(wst, -.97); g.lineTo(sh - .03, -1.02); g.quadraticCurveTo(sh + .03, -1.2, sh, -1.37); g.quadraticCurveTo(sh - .02, -1.45, .06, -1.46); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(-.09, -.02, .07, .03, 0, 0, 6.283); g.ellipse(.09, -.02, .07, .03, 0, 0, 6.283); g.fill();
    // arms: shoulder → elbow → hand, with the sleeve widening; [ex, ey, hx, hy] per side
    const sa = man ? .235 : .2, ae = sa + .05, arm = (sd, ex, ey, hx, hy) => { const sx = sd * sa, sy = -1.36; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = .1; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
      const ax = hx - ex, ay = hy - ey, l = Math.hypot(ax, ay) || 1, nx = -ay / l, ny = ax / l; g.beginPath(); g.moveTo(ex + nx * .05, ey + ny * .05); g.lineTo(hx + nx * .08, hy + ny * .08 + .03); g.lineTo(hx - nx * .08, hy - ny * .08 + .03); g.lineTo(ex - nx * .05, ey - ny * .05); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(hx + ax / l * .05, hy + ay / l * .05, .045, .04, 0, 0, 6.283); g.fill(); };
    const down = sd => arm(sd, sd * ae, -1.08, sd * ae, -.8);
    if (kind === 'shade') { const k = ss(.6, 1.6, u); down(-1); arm(1, lerp(ae, .38, k), lerp(-1.08, -1.42, k), lerp(ae, .12, k), lerp(-.8, -1.62, k)); }   // a hand up to shade his eyes
    else if (kind === 'point') { const k = ss(1.8, 2.8, u), bob = .03 * Math.sin(u * 2.2) * k; down(-1); arm(1, lerp(ae, .34, k), lerp(-1.08, -1.6, k), lerp(ae, .44, k), lerp(-.8, -1.86 + bob, k)); }   // pointing to the hills
    else if (kind === 'veil') { down(1); arm(-1, -.24, -1.06, -.36, -.84); }                                                              // a hand down to the child
    else if (kind === 'child') { arm(1, .2, -1.12, .3, -.9); down(-1); }
    else if (kind === 'staff') { down(-1); arm(1, .31, -1.12, .35, -.98); g.fillRect(.33, -1.95, .04, 1.95); }
    else { down(-1); down(1); }
    g.restore();
  }
  function crowd(ctx, c, L, u, sunP, vis = 1) {
    const rimC = mix(L.glow, [255, 226, 180], .35), list = [];
    for (let i = 0; i < G.crowd.length; i++) { const [x0, z0, h, kind] = G.crowd[i]; let x = x0, z = z0; if (kind === 'walk') { const k = ss(0, 6.5, u); z = lerp(23.6, 26.6, k); x = lerp(-.6, -.25, k); } list.push({ x, z, h, kind, i }); }
    list.sort((a, b) => b.z - a.z);
    // long shadows down the lit paving, toward us. The far end is a world point along the sun (x and z together); where it
    // would pass the camera's near plane the segment is cut there along its own line, and the fade is cut at the same place,
    // so a shadow never changes direction or drops out between frames (관리자 2026-11-14 "그림자가 덜그덕거려")
    const e = Math.max(.02, L.sd[1]); for (const f of list) { const A = [f.x, .01, f.z], B = [f.x - L.sd[0] / e * f.h * .5, .01, f.z - L.sd[2] / e * f.h * .5], s = clipSeg(c, A, B); if (!s) continue;
      const a = W3.P(c, ...s[0]), b = W3.P(c, ...s[1]); if (!a || !b) continue;
      ctx.save(); const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); const sa = .55 * (.1 + .9 * vis); g.addColorStop(0, `rgba(14,8,8,${sa.toFixed(3)})`); g.addColorStop(1, `rgba(14,8,8,${(sa * (1 - s[2])).toFixed(3)})`); ctx.strokeStyle = g; ctx.lineWidth = a[2] * (.34 + .12 * (1 - vis)); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore(); }   // vis: as the sun goes behind the wall the shadows soften and fade with it (7차)
    for (const f of list) { const p = W3.P(c, f.x, 0, f.z); if (!p) continue; const s = p[2] * (f.kind === 'child' ? f.h / 1.7 : f.h / 1.72), oc = G.fig, g = oc.getContext('2d'), S = oc.width, k = Math.min(1, S * .4 / (2.2 * s)), m = s * k;
      const tw = sunP ? [sunP[0] - p[0], sunP[1] - (p[1] - 1.4 * p[2])] : [0, -1], l = Math.hypot(...tw) || 1, w = Math.max(1.2, m * .028);
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, S);
      const draw = (dx, dy, col) => { g.save(); g.translate(S / 2 + dx, S * .8 + dy); g.scale(m, m); g.fillStyle = g.strokeStyle = col; person(g, f.kind, u, f.i * 1.7); g.restore(); };
      draw(0, 0, css(rimC)); g.globalCompositeOperation = 'source-atop'; draw(-tw[0] / l * w, -tw[1] / l * w, 'rgb(24,16,16)'); g.globalCompositeOperation = 'source-over';
      ctx.drawImage(oc, p[0] - S / 2 / k, p[1] - S * .8 / k, S / k, S / k); }
  }

  function jerusalemScene(ctx, u) {
    if (!G) buildJerusalem(); u = clamp(u, 0, 7.1);
    const W = P.W, H = P.H, V = P.ori === 'v', c = G.cam(u), L = G.light(u);
    const sk = W3.sky(ctx, c, L, u), sunP = sk.sun;
    // how much of the sun is seen through the arch (0 behind the stone … 1 clear in it), smooth from the sun's distance to the arch's
    // edge — the light pool, the shafts, the crowd's shadows and the flare all follow it in the same frame (7차: the sun went behind the
    // right wall at 48–51 and the shadows stayed as strong; the flare switched on/off)
    let vis = 0, pa = null; if (sunP) { const ap = archPts(27.5, 16).map(p => W3.P(c, ...p)), ao = archPts(34, 16).map(p => W3.P(c, ...p)); if (ap.every(Boolean) && ao.every(Boolean)) { pa = new Path2D(); ap.forEach((p, i) => i ? pa.lineTo(p[0], p[1]) : pa.moveTo(p[0], p[1])); pa.closePath();
      const po = new Path2D(); ao.forEach((p, i) => i ? po.lineTo(p[0], p[1]) : po.moveTo(p[0], p[1])); po.closePath();   // the far (outer) face of the passage is the opening the sun is seen through
      let d = 1e9; for (let i = 0; i < ao.length; i++) { const A = ao[i], B = ao[(i + 1) % ao.length], ex = B[0] - A[0], ey = B[1] - A[1], t = clamp(((sunP[0] - A[0]) * ex + (sunP[1] - A[1]) * ey) / (ex * ex + ey * ey || 1)); d = Math.min(d, Math.hypot(sunP[0] - A[0] - ex * t, sunP[1] - A[1] - ey * t)); }
      const r = V ? 22 : 19, sd = ctx.isPointInPath(po, sunP[0], sunP[1]) ? d : -d; vis = ss(-1.3 * r, 1.1 * r, sd); } }
    terrain(ctx, c, L, 34);                                                                 // the valley and the hills, seen through the gate
    // the far haze along the hills, lit by the sun
    { const hz = W3.P(c, c.x + c.f[0] * 1e4, c.y, c.z + c.f[2] * 1e4); if (hz) { const g = ctx.createLinearGradient(0, hz[1] - (V ? 120 : 90), 0, hz[1] + 20); g.addColorStop(0, css(L.fog, 0)); g.addColorStop(.7, css(mix(L.fog, L.glow, .4), .4)); g.addColorStop(1, css(L.fog, .1)); ctx.fillStyle = g; ctx.fillRect(0, hz[1] - (V ? 120 : 90), W, (V ? 140 : 110)); } }
    if (sunP) { ctx.fillStyle = 'rgba(255,236,200,.95)'; ctx.beginPath(); ctx.arc(sunP[0], sunP[1], V ? 22 : 19, 0, 6.283); ctx.fill(); }
    // the paving inside the gate: in the wall's shadow, warm bounce near the gate
    { const a = W3.P(c, -40, 0, 34), b = W3.P(c, 40, 0, 34); const y0 = a && b ? Math.min(a[1], b[1]) : H * .6; const g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, css(mix(L.amb, [40, 28, 24], .4))); g.addColorStop(1, 'rgb(14,10,10)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }
    // the passage floor and the light lying on the paving: the arch's outline thrown along the sunlight onto the ground toward us
    // (the pool is the true ground polygon, cut by W3.poly at the near plane edge by edge — no per-point clamp or dropped
    // points, which made its left side jump from frame to frame)
    { const e = Math.max(.02, L.sd[1]), out = archPts(34, 16).map(([x, y, z]) => [x - L.sd[0] / e * y, .01, z - L.sd[2] / e * y]);
      ctx.save(); if (W3.poly(ctx, c, out)) { ctx.globalCompositeOperation = 'screen'; const n = W3.P(c, 0, 0, 34), f = W3.P(c, 0, 0, Math.max(c.z + .8, 6)), g = ctx.createLinearGradient(0, n ? n[1] : 0, 0, f ? f[1] : H);
        const pk = .3 + .7 * vis; g.addColorStop(0, css(L.glow, .7 * pk)); g.addColorStop(.5, css(L.glow, .32 * pk)); g.addColorStop(1, css(L.glow, .08 * pk)); ctx.fillStyle = g; ctx.filter = `blur(${(3 + 5 * (1 - vis)).toFixed(1)}px)`; ctx.fill(); ctx.filter = 'none'; } ctx.restore(); }
    W3.faces(ctx, c, L, G.P2);
    W3.faces(ctx, c, L, G.FB); burn(ctx, c, L, G.MB);
    W3.faces(ctx, c, L, G.FF);
    // on the gate top: the eagle standard between two legionaries, dark against the sky. They stand on the wall walk set back
    // behind the parapet (z 28.3), so they are painted before the gate's face and its merlons, which then cover their feet and
    // lower legs exactly where the 3D edges fall (the eagle a little further back, behind them)
    aquila(ctx, c, L, 0, 13, 29.4, u, sunP);
    for (const sd of [-1, 1]) soldier(ctx, c, L, sd * 1.9, 13, 28.95, sd, u, sunP);
    gateFace(ctx, c, L);
    W3.faces(ctx, c, L, G.PP);
    towerGlaze(ctx, c, L);
    burn(ctx, c, L, G.MF);
    // light in the air of the passage: soft shafts from the sun through the arch toward us
    if (sunP) { const ap = archPts(27.5, 16).map(p => W3.P(c, ...p)); if (ap.every(Boolean)) { ctx.save(); ctx.beginPath(); ap.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.clip(); ctx.globalCompositeOperation = 'screen';
      ctx.filter = `blur(${V ? 6 : 5}px)`; const R = Math.max(W, H); for (let i = 0; i < 14; i++) { const ang = Math.PI * .5 + (i / 14 - .5) * 2.8 + u * .02, w = .02 + .03 * noise(i * 1.7, 2), g = ctx.createRadialGradient(sunP[0], sunP[1], 0, sunP[0], sunP[1], R); g.addColorStop(0, css(L.glow, .16 * (.3 + .7 * vis) * noise(i * 2.3, u * .3))); g.addColorStop(1, css(L.glow, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sunP[0], sunP[1]); ctx.arc(sunP[0], sunP[1], R, ang - w, ang + w); ctx.closePath(); ctx.fill(); } ctx.filter = 'none';
      ctx.restore(); } }
    crowd(ctx, c, L, u, sunP, vis);
    // the sun only flares where it is seen (through the arch); behind stone it only warms the sky
    const seen = .2 + .8 * vis;
    if (sunP) { if (pa) { ctx.save(); ctx.clip(pa); W3.bloom(ctx, sunP[0], sunP[1], L.glow, .85 * seen, { r: V ? 200 : 170, streak: .55 }); ctx.restore(); } ctx.save(); ctx.globalCompositeOperation = 'screen'; const R = Math.max(W, H) * .8, g = ctx.createRadialGradient(sunP[0], sunP[1], 0, sunP[0], sunP[1], R); g.addColorStop(0, css(L.glow, .38)); g.addColorStop(.4, css(L.glow, .15)); g.addColorStop(1, css(L.glow, .05)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    W3.finish(ctx, u, { vignette: .6 });
  }
  window.buildJerusalem = buildJerusalem; window.jerusalemScene = jerusalemScene;
})();
