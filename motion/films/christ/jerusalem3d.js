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
    row(-9.6, -3.2, 16, 25.5, 26.4); row(3.2, 9.6, 16, 25.5, 26.4); row(-3.2, 3.2, 13, 27.5, 28.3); row(-70, -9.6, 11, 30, 30.8); row(9.6, 70, 11, 30, 30.8);
    // the passage: its two side walls and the barrel vault (inside faces, seen from the city)
    const P2 = []; for (const sd of [-1, 1]) P2.push({ pts: sd < 0 ? [[-AW, 0, 27.5], [-AW, 0, 34], [-AW, AS, 34], [-AW, AS, 27.5]] : [[AW, 0, 34], [AW, 0, 27.5], [AW, AS, 27.5], [AW, AS, 34]], alb: stone, k: .8, two: true });
    for (let i = 0; i < 16; i++) { const a0 = Math.PI - i / 16 * Math.PI, a1 = Math.PI - (i + 1) / 16 * Math.PI, y0 = AS + Math.sin(a0) * (AT - AS), y1 = AS + Math.sin(a1) * (AT - AS);
      P2.push({ pts: [[Math.cos(a0) * AW, y0, 27.5], [Math.cos(a0) * AW, y0, 34], [Math.cos(a1) * AW, y1, 34], [Math.cos(a1) * AW, y1, 27.5]], alb: stone, k: .75, two: true }); }
    // weathering stains on the big faces (world-locked: they move with the wall, never crawl)
    const r = rng(7), stains = []; for (let i = 0; i < 70; i++) { const tower = r() < .55, x = tower ? (r() < .5 ? -1 : 1) * (3.4 + r() * 6) : (r() - .5) * 6.2, y = tower ? r() * 15 : 7.6 + r() * 5.2; stains.push({ x, y, z: tower ? 25.48 : 27.48, r: .8 + r() * 2.6, d: r() < .6 ? -1 : 1, a: .06 + .09 * r() }); }
    // the crowd in the gate, seen from behind (they look out at the hills): [x, z, height, kind]
    const crowd = [[-1.6, 29.6, 1.74, 'shade'], [-.5, 30.6, 1.68, 'stand'], [.7, 29.0, 1.78, 'point'], [1.7, 30.2, 1.62, 'veil'], [1.25, 30.25, 1.08, 'child'], [-2.2, 27.4, 1.7, 'staff'], [2.3, 27.0, 1.72, 'stand'], [-.2, 26.4, 1.76, 'walk']];
    G = { F, P2, merl, stains, crowd, fig: P.canvas(700, 700),
      // the camera starts low under the gate and cranes up until the gate's top, the soldiers and the eagle stand in the sky
      // (portrait and landscape frame differently: the feet stay above the words, the eagle comes in at the top by the end)
      cam: P.ori === 'v' ? W3.cam([[0, .25, 1.0, 13.5, .1, 1.0, 30, 1800, 1800], [3.6, .2, 2.7, 5.5, .1, 1.7, 30, 1780, 1780], [7.1, .2, 4.5, -4, .1, 2.5, 30, 1765, 1765]])
        : W3.cam([[0, .25, 1.0, 13.5, .1, 2.65, 30, 1300, 1300], [3.6, .2, 2.7, 5.5, .1, 4.0, 30, 1300, 1300], [7.1, .2, 4.5, -4, .1, 5.6, 30, 1310, 1310]]),
      light: W3.light([[0, 3.2, 2, 1.2, [255, 170, 100], [112, 88, 92], [84, 70, 104], [255, 172, 108], [255, 164, 96], [204, 136, 112], 2600, 0],
        [7.1, 2.6, 2, 1.15, [255, 160, 92], [106, 82, 88], [80, 66, 100], [252, 162, 100], [255, 154, 90], [198, 128, 106], 2500, 0]]) };
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
    for (const s of G.stains) { const p = W3.P(c, s.x, s.y, s.z); if (!p) continue; const R = s.r * p[2], g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], R), cc = s.d < 0 ? [12, 8, 10] : mix(L.glow, [120, 90, 80], .5);
      g.addColorStop(0, css(cc, s.a)); g.addColorStop(1, css(cc, 0)); ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(1, 1.4); ctx.translate(-p[0], -p[1]); ctx.fillStyle = g; ctx.fillRect(p[0] - R, p[1] - R, 2 * R, 2 * R); ctx.restore(); }
  }
  // every top edge burns: a thin line of sun along the merlons and wall tops
  function burn(ctx, c, L) {
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = css(mix(L.glow, [255, 230, 190], .3), .75); ctx.lineCap = 'round';
    const seg = (a, b) => { const p = W3.P(c, ...a), q = W3.P(c, ...b); if (!p || !q) return; ctx.lineWidth = Math.max(1.2, p[2] * .07); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
    for (const [x0, x1, y, z] of G.merl) seg([x0, y, z], [x1, y, z]);
    ctx.restore();
  }
  // the eagle standard (after messiah film.html aquila(), smaller): pole, crossbar, eagle with spread wings, a red vexillum
  function aquila(ctx, x, y, s, u) {
    const k = s * .36; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); const p = new Path2D();
    p.rect(-.09, -9, .18, 9); p.rect(-.9, -4.4, 1.8, .16);
    p.moveTo(0, -10.2); p.bezierCurveTo(-.5, -10.4, -1.1, -11.2, -1.9, -11.4); p.bezierCurveTo(-1.5, -10.8, -1.3, -10.3, -.7, -9.9); p.bezierCurveTo(-.4, -9.6, -.2, -9.3, 0, -9.2);
    p.bezierCurveTo(.2, -9.3, .4, -9.6, .7, -9.9); p.bezierCurveTo(1.3, -10.3, 1.5, -10.8, 1.9, -11.4); p.bezierCurveTo(1.1, -11.2, .5, -10.4, 0, -10.2); p.closePath();
    p.ellipse(0, -10.35, .2, .24, 0, 0, 6.283); p.moveTo(.12, -10.42); p.lineTo(.42, -10.35); p.lineTo(.14, -10.28); p.closePath(); p.rect(-.6, -9.15, 1.2, .3);
    const sw = .12 * Math.sin(u * 1.6), flag = new Path2D(); flag.moveTo(-.85, -4.25); flag.lineTo(.85, -4.25); flag.quadraticCurveTo(.95 + sw, -3.2, .8 + sw * 1.4, -2.2); flag.lineTo(-.9 + sw * 1.4, -2.2); flag.quadraticCurveTo(-.95 + sw, -3.2, -.85, -4.25); flag.closePath();
    ctx.fillStyle = 'rgb(84,22,18)'; ctx.fill(flag); ctx.globalAlpha = .8; ctx.strokeStyle = 'rgb(255,190,110)'; ctx.lineWidth = .06; ctx.stroke(flag); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgb(40,28,20)'; ctx.fill(p); ctx.globalAlpha = .9; ctx.strokeStyle = 'rgb(255,206,130)'; ctx.lineWidth = .08; ctx.stroke(p); ctx.restore();
  }
  // a legionary on the gate top, seen from inside the city (back view, looking out): crested helmet, spear, the curve of a shield
  function soldier(ctx, x, y, s, side, u, rimC) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * side, s); const p = new Path2D();
    p.ellipse(0, -1.6, .12, .13, 0, 0, 6.283); p.moveTo(-.14, -1.62); p.quadraticCurveTo(0, -1.82, .14, -1.62); p.lineTo(.15, -1.55); p.lineTo(-.15, -1.55); p.closePath();
    p.moveTo(-.1, -1.76); p.quadraticCurveTo(0, -1.92, .1, -1.76); p.lineTo(.08, -1.72); p.lineTo(-.08, -1.72); p.closePath();   // the crest
    p.moveTo(-.06, -1.47); p.lineTo(.06, -1.47); p.lineTo(.22, -1.4); p.lineTo(.24, -1.0); p.lineTo(.16, -.62); p.lineTo(.13, -.04); p.lineTo(.03, -.04); p.lineTo(0, -.55); p.lineTo(-.03, -.04); p.lineTo(-.13, -.04); p.lineTo(-.16, -.62); p.lineTo(-.24, -1.0); p.lineTo(-.22, -1.4); p.closePath();
    p.moveTo(-.24, -.62); p.lineTo(.24, -.62); p.lineTo(.2, -.48); p.lineTo(-.2, -.48); p.closePath();                                     // the skirt of strips
    p.rect(.3, -2.5, .035, 2.5); p.moveTo(.317, -2.72); p.lineTo(.36, -2.5); p.lineTo(.274, -2.5); p.closePath();                        // spear
    p.moveTo(.22, -1.36); p.lineTo(.34, -1.1); p.lineTo(.33, -1.02); p.lineTo(.2, -1.2); p.closePath();                                  // spear arm to the shaft
    p.moveTo(-.2, -1.32); p.quadraticCurveTo(-.46, -1.3, -.46, -.85); p.lineTo(-.44, -.38); p.quadraticCurveTo(-.3, -.4, -.24, -.5); p.lineTo(-.24, -1.2); p.closePath();   // shield edge on the left
    ctx.fillStyle = 'rgb(30,20,18)'; ctx.fill(p); ctx.globalAlpha = .85; ctx.strokeStyle = css(rimC); ctx.lineWidth = .035; ctx.stroke(p); ctx.restore();
  }

  // ---- the crowd: back-view silhouettes (metres, feet at the origin), robe and head cloth, arms from the shoulders ----
  function person(g, kind, u, ph) {
    const sw = .015 * Math.sin(u * 1.1 + ph), veil = kind === 'veil';
    g.save(); g.rotate(sw * .5);
    g.beginPath(); g.ellipse(0, -1.58, .098, .118, 0, 0, 6.283); g.fill();                                                                // head
    g.beginPath(); g.moveTo(0, -1.73); g.quadraticCurveTo(.13, -1.7, .14, -1.56); g.quadraticCurveTo(.16, -1.44, veil ? .26 : .22, veil ? -.9 : -1.3); g.lineTo(veil ? -.26 : -.22, veil ? -.9 : -1.3); g.quadraticCurveTo(-.16, -1.44, -.14, -1.56); g.quadraticCurveTo(-.13, -1.7, 0, -1.73); g.fill();   // head cloth / veil
    // shoulders sloping from the neck, a belted waist, the robe widening to the hem (its hem stirs a little)
    g.beginPath(); g.moveTo(-.06, -1.46); g.quadraticCurveTo(-.18, -1.44, -.22, -1.36); g.quadraticCurveTo(-.25, -1.2, -.2, -1.02); g.lineTo(-.165, -.97); g.lineTo(-.19, -.9); g.lineTo(-.27 - .01 * Math.sin(u * 1.7 + ph), -.02); g.lineTo(.27 + .01 * Math.sin(u * 1.5 + ph), -.02); g.lineTo(.19, -.9); g.lineTo(.165, -.97); g.lineTo(.2, -1.02); g.quadraticCurveTo(.25, -1.2, .22, -1.36); g.quadraticCurveTo(.18, -1.44, .06, -1.46); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(-.09, -.02, .07, .03, 0, 0, 6.283); g.ellipse(.09, -.02, .07, .03, 0, 0, 6.283); g.fill();
    // arms: shoulder → elbow → hand, with the sleeve widening; [ex, ey, hx, hy] per side
    const arm = (sd, ex, ey, hx, hy) => { const sx = sd * .2, sy = -1.36; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = .1; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
      const ax = hx - ex, ay = hy - ey, l = Math.hypot(ax, ay) || 1, nx = -ay / l, ny = ax / l; g.beginPath(); g.moveTo(ex + nx * .05, ey + ny * .05); g.lineTo(hx + nx * .08, hy + ny * .08 + .03); g.lineTo(hx - nx * .08, hy - ny * .08 + .03); g.lineTo(ex - nx * .05, ey - ny * .05); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(hx + ax / l * .05, hy + ay / l * .05, .045, .04, 0, 0, 6.283); g.fill(); };
    const down = sd => arm(sd, sd * .25, -1.08, sd * .25, -.8);
    if (kind === 'shade') { const k = ss(.6, 1.6, u); down(-1); arm(1, lerp(.25, .36, k), lerp(-1.08, -1.42, k), lerp(.25, .12, k), lerp(-.8, -1.62, k)); }   // a hand up to shade his eyes
    else if (kind === 'point') { const k = ss(1.8, 2.8, u), bob = .03 * Math.sin(u * 2.2) * k; down(-1); arm(1, lerp(.25, .32, k), lerp(-1.08, -1.6, k), lerp(.25, .42, k), lerp(-.8, -1.86 + bob, k)); }   // pointing to the hills
    else if (kind === 'veil') { down(1); arm(-1, -.24, -1.06, -.36, -.84); }                                                              // a hand down to the child
    else if (kind === 'child') { arm(1, .2, -1.12, .3, -.9); down(-1); }
    else if (kind === 'staff') { down(-1); arm(1, .28, -1.12, .32, -.98); g.fillRect(.3, -1.95, .04, 1.95); }
    else { down(-1); down(1); }
    g.restore();
  }
  function crowd(ctx, c, L, u, sunP) {
    const rimC = mix(L.glow, [255, 226, 180], .35), list = [];
    for (let i = 0; i < G.crowd.length; i++) { const [x0, z0, h, kind] = G.crowd[i]; let x = x0, z = z0; if (kind === 'walk') { const k = ss(0, 6.5, u); z = lerp(23.6, 26.6, k); x = lerp(-.6, -.25, k); } list.push({ x, z, h, kind, i }); }
    list.sort((a, b) => b.z - a.z);
    // long shadows down the lit paving, toward us
    const e = Math.max(.02, L.sd[1]); for (const f of list) { const a = W3.P(c, f.x, .01, f.z), len = f.h / e * .5, b = W3.P(c, f.x - L.sd[0] / e * f.h * .5, .01, Math.max(c.z + .8, f.z - len)); if (!a || !b) continue;
      ctx.save(); const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, 'rgba(14,8,8,.55)'); g.addColorStop(1, 'rgba(14,8,8,0)'); ctx.strokeStyle = g; ctx.lineWidth = a[2] * .34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore(); }
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
    terrain(ctx, c, L, 34);                                                                 // the valley and the hills, seen through the gate
    // the far haze along the hills, lit by the sun
    { const hz = W3.P(c, c.x + c.f[0] * 1e4, c.y, c.z + c.f[2] * 1e4); if (hz) { const g = ctx.createLinearGradient(0, hz[1] - (V ? 120 : 90), 0, hz[1] + 20); g.addColorStop(0, css(L.fog, 0)); g.addColorStop(.7, css(mix(L.fog, L.glow, .4), .4)); g.addColorStop(1, css(L.fog, .1)); ctx.fillStyle = g; ctx.fillRect(0, hz[1] - (V ? 120 : 90), W, (V ? 140 : 110)); } }
    if (sunP) { ctx.fillStyle = 'rgba(255,236,200,.95)'; ctx.beginPath(); ctx.arc(sunP[0], sunP[1], V ? 22 : 19, 0, 6.283); ctx.fill(); }
    // the paving inside the gate: in the wall's shadow, warm bounce near the gate
    { const a = W3.P(c, -40, 0, 34), b = W3.P(c, 40, 0, 34); const y0 = a && b ? Math.min(a[1], b[1]) : H * .6; const g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, css(mix(L.amb, [40, 28, 24], .4))); g.addColorStop(1, 'rgb(14,10,10)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }
    // the passage floor and the light lying on the paving: the arch's outline thrown along the sunlight onto the ground toward us
    { const e = Math.max(.02, L.sd[1]), out = archPts(34, 16).map(([x, y, z]) => [x - L.sd[0] / e * y, .01, Math.max(c.z + .6, z - L.sd[2] / e * y)]);
      const sp = out.map(p => W3.P(c, ...p)).filter(Boolean); if (sp.length > 3) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const n = W3.P(c, 0, 0, 34), f = W3.P(c, 0, 0, Math.max(c.z + .8, 6)), g = ctx.createLinearGradient(0, n ? n[1] : 0, 0, f ? f[1] : H);
        g.addColorStop(0, css(L.glow, .7)); g.addColorStop(.5, css(L.glow, .32)); g.addColorStop(1, css(L.glow, .08)); ctx.fillStyle = g; ctx.filter = 'blur(3px)'; ctx.beginPath(); sp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); ctx.filter = 'none'; ctx.restore(); } }
    W3.faces(ctx, c, L, G.P2);
    W3.faces(ctx, c, L, G.F);
    gateFace(ctx, c, L);
    towerGlaze(ctx, c, L);
    burn(ctx, c, L);
    // on the gate top: the eagle standard between two legionaries, dark against the sky
    const rimC = mix(L.glow, [255, 226, 180], .3);
    for (const sd of [-1, 1]) { const p = W3.P(c, sd * 2.1, 13, 28.8); if (p) soldier(ctx, p[0], p[1], p[2], sd, u, rimC); }
    { const p = W3.P(c, 0, 13, 29.2); if (p) aquila(ctx, p[0], p[1], p[2], u); }
    // light in the air of the passage: soft shafts from the sun through the arch toward us
    if (sunP) { const ap = archPts(27.5, 16).map(p => W3.P(c, ...p)); if (ap.every(Boolean)) { ctx.save(); ctx.beginPath(); ap.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.clip(); ctx.globalCompositeOperation = 'screen';
      ctx.filter = `blur(${V ? 6 : 5}px)`; const R = Math.max(W, H); for (let i = 0; i < 14; i++) { const ang = Math.PI * .5 + (i / 14 - .5) * 2.8 + u * .02, w = .02 + .03 * noise(i * 1.7, 2), g = ctx.createRadialGradient(sunP[0], sunP[1], 0, sunP[0], sunP[1], R); g.addColorStop(0, css(L.glow, .16 * noise(i * 2.3, u * .3))); g.addColorStop(1, css(L.glow, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sunP[0], sunP[1]); ctx.arc(sunP[0], sunP[1], R, ang - w, ang + w); ctx.closePath(); ctx.fill(); } ctx.filter = 'none';
      ctx.restore(); } }
    crowd(ctx, c, L, u, sunP);
    // the sun only flares where it is seen (through the arch); behind stone it only warms the sky
    let seen = 0; if (sunP) { const ap = archPts(27.5, 16).map(p => W3.P(c, ...p)); if (ap.every(Boolean)) { const pa = new Path2D(); ap.forEach((p, i) => i ? pa.lineTo(p[0], p[1]) : pa.moveTo(p[0], p[1])); pa.closePath(); seen = ctx.isPointInPath(pa, sunP[0], sunP[1]) ? 1 : .2; } }
    if (sunP) { W3.bloom(ctx, sunP[0], sunP[1], L.glow, .85 * seen, { r: V ? 200 : 170, streak: .55 }); ctx.save(); ctx.globalCompositeOperation = 'screen'; const R = Math.max(W, H) * .8, g = ctx.createRadialGradient(sunP[0], sunP[1], 0, sunP[0], sunP[1], R); g.addColorStop(0, css(L.glow, .34)); g.addColorStop(.4, css(L.glow, .12)); g.addColorStop(1, css(L.glow, .03)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    W3.finish(ctx, u, { vignette: .6 });
  }
  window.buildJerusalem = buildJerusalem; window.jerusalemScene = jerusalemScene;
})();
