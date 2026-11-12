/* oil-cornelius.js — 「그리스도」 N20 (film 125.0–129.7 s, u = 0..4.7): "'그리 마옵소서' 하던 베드로가 / 훗날 전한 말."
   Acts 10:24–27 — Cornelius at Caesarea "had called together his relatives and close friends … and found many persons gathered".
   Painted after Vermeer (kit-oilpaint.js key 'vermeer'; the light of *Woman Reading a Letter at an Open Window* and *The Milkmaid*):
   warm, quiet morning. A lime-plastered room under dark wooden beams; on the left an open window with one shutter swung back on
   the bright Mediterranean (sea, sky, a red roof). Its daylight spreads softly over the wall and over the people: a group of six
   — Cornelius in his red military cloak on a stool (the one strong colour), kinsmen and friends seated and standing, a woman in a
   pale veil — all leaning toward Peter. Peter stands on the right, turned to them and to the window, one hand open as he speaks;
   the window light warms his profile and the edge of his hand. A table with a clay water jar against the wall. Faces are only
   soft planes of light and shade (OIL.relief volumes), no features.
   The room is one painted plate (made once). The camera is low and still and closes in by 5 %; at u ≈ 1.2 the window's light
   grows a little stronger and gathers over Peter and his listeners (a soft beam over the painting), dust turning in it.
   No words are drawn (the floor under the words, portrait 0.62–0.78, is in shade). API: await buildCorneliusOil() · corneliusOil(ctx, u) */
const COIL = {};
async function buildCorneliusOil() {
  const { clamp, lerp, rng, canvas, mix } = Pilot, W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v', S = V ? 1.6 : 2.2;
  const U = H, X = x => W / 2 + x * U, Y = y => y * H;   // stage units: y 0 top … 1 bottom of the frame, x 0 centre, 1 unit = frame height
  const PW = Math.round(W * S), PH = Math.round(H * S), plate = canvas(PW, PH), g = plate.getContext('2d'); g.scale(S, S);
  const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([k, c]) => gr.addColorStop(k, c)); return gr; };
  const radial = (x, y, R, stops, op = 'source-over', sy = 1) => { g.save(); g.globalCompositeOperation = op; g.translate(x, y); g.scale(1, sy); const gr = g.createRadialGradient(0, 0, 0, 0, 0, R); stops.forEach(([k, c]) => gr.addColorStop(k, c)); g.fillStyle = gr; g.fillRect(-R, -R, 2 * R, 2 * R); g.restore(); };
  const WIN = { x0: X(-.31), x1: X(-.16), y0: Y(.12), y1: Y(.41) }, LW = [X(-.235), Y(.27)];   // the window and the light's centre
  // ---- the room ----
  { const wallTop = Y(.075), floorY = Y(.6);
    // the back wall: lime plaster, cool grey-green in the shade on the right, warm cream near the window
    g.fillStyle = lin(X(-.45), 0, X(.45), 0, [[0, '#d6c49c'], [.2, '#e2d0aa'], [.5, '#b0a488'], [.8, '#7a7466'], [1, '#5a5650']]); g.fillRect(0, wallTop, W, floorY - wallTop);
    radial(LW[0] + .12 * U, Y(.34), .4 * U, [[0, 'rgba(255,242,210,.6)'], [.45, 'rgba(244,224,186,.25)'], [1, 'rgba(230,214,180,0)']]);
    { const r = rng(4); for (let i = 0; i < 260; i++) { const x = r() * W, y = wallTop + r() * (floorY - wallTop), R = (.01 + .04 * r()) * U; g.fillStyle = r() < .5 ? `rgba(255,248,230,${.03 + .04 * r()})` : `rgba(90,80,64,${.03 + .04 * r()})`; g.beginPath(); g.ellipse(x, y, R, R * (.5 + r() * .6), r() * 3, 0, 6.283); g.fill(); } }   // plaster's cool–warm mottling
    g.fillStyle = lin(0, floorY - .03 * H, 0, floorY, [[0, 'rgba(60,48,36,0)'], [1, 'rgba(60,48,36,.35)']]); g.fillRect(0, floorY - .03 * H, W, .03 * H);   // the wall's foot in shadow
    g.fillStyle = '#6c5a44'; g.fillRect(0, floorY - .012 * H, W, .012 * H);                                                        // a low plinth
    // the ceiling: dark beams receding over a plaster vault
    g.fillStyle = lin(0, 0, 0, wallTop, [[0, '#4a3a2a'], [1, '#6a5640']]); g.fillRect(0, 0, W, wallTop);
    for (let i = -8; i <= 8; i++) { const x = X(i * .085), w = .022 * U; g.fillStyle = lin(x - w, 0, x + w, 0, [[0, '#2c2016'], [.5, '#4a3826'], [1, '#2a1e14']]); g.beginPath(); g.moveTo(x - w * 1.4, 0); g.lineTo(x + w * 1.4, 0); g.lineTo(x + w, wallTop); g.lineTo(x - w, wallTop); g.fill(); }
    g.fillStyle = '#3a2c1e'; g.fillRect(0, wallTop - .012 * H, W, .016 * H);                                                       // the wall plate
    // the floor: worn terracotta and stone flags, warm where the window light lands, sinking into shade toward us
    g.fillStyle = lin(0, floorY, 0, H, [[0, '#9a7a5a'], [.25, '#7a5e44'], [.7, '#4a382a'], [1, '#2e2219']]); g.fillRect(0, floorY, W, H - floorY);
    g.fillStyle = lin(X(-.3), 0, X(.4), 0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(20,14,10,.45)']]); g.fillRect(0, floorY, W, H - floorY);
    radial(X(-.06), Y(.74), .3 * U, [[0, 'rgba(255,230,186,.62)'], [.45, 'rgba(244,206,156,.25)'], [1, 'rgba(220,180,130,0)']], 'source-over', .3);
    g.strokeStyle = 'rgba(40,28,20,.22)'; g.lineWidth = 1.2; for (let k = 0; k < 9; k++) { const y = floorY + (H - floorY) * Math.pow(k / 9, 1.6); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(X(i * .06), floorY); g.lineTo(X(i * .2), H); g.stroke(); }
    // the window: deep reveal, an open shutter swung back on the wall, the bright sea and sky beyond
    { const { x0, x1, y0, y1 } = WIN, ww = x1 - x0, wh = y1 - y0;
      g.fillStyle = lin(0, y0, 0, y1, [[0, '#cfe0ea'], [.55, '#f4f0e2'], [.62, '#fff8e8'], [.66, '#bcc8c4'], [1, '#9eaaa6']]); g.fillRect(x0, y0, ww, wh);   // sky, the sea's bright line, the sea
      g.fillStyle = '#b05a3c'; g.beginPath(); g.moveTo(x0, y1 - wh * .12); g.lineTo(x0 + ww * .55, y1 - wh * .2); g.lineTo(x0 + ww * .7, y1); g.lineTo(x0, y1); g.fill();   // a red roof below
      radial(x0 + ww * .55, y0 + wh * .55, ww * 1.1, [[0, 'rgba(255,252,240,.8)'], [1, 'rgba(255,250,236,0)']], 'screen');
      g.fillStyle = '#6a5640'; g.beginPath(); g.moveTo(x1, y0); g.lineTo(x1 + .02 * U, y0 + .012 * U); g.lineTo(x1 + .02 * U, y1 + .008 * U); g.lineTo(x1, y1); g.fill();   // the reveal (in shade)
      g.fillStyle = lin(x0, 0, x1, 0, [[0, '#f2e4c6'], [1, '#d8c6a2']]); g.fillRect(x0 - .006 * U, y1, ww + .03 * U, .012 * U);              // the sill, sunlit
      g.strokeStyle = '#5a4630'; g.lineWidth = .006 * U; g.strokeRect(x0, y0, ww, wh); g.lineWidth = .004 * U; g.beginPath(); g.moveTo(x0 + ww / 2, y0); g.lineTo(x0 + ww / 2, y1); g.stroke();
      // the shutter swung open against the wall to the right of the window, a few planks catching the light
      g.fillStyle = lin(x1 + .03 * U, 0, x1 + .1 * U, 0, [[0, '#8a6a46'], [1, '#6a5034']]); g.beginPath(); g.moveTo(x1 + .025 * U, y0 - .01 * U); g.lineTo(x1 + .1 * U, y0 + .005 * U); g.lineTo(x1 + .1 * U, y1 - .005 * U); g.lineTo(x1 + .025 * U, y1 + .01 * U); g.fill();
      g.strokeStyle = 'rgba(40,28,18,.4)'; g.lineWidth = 1.2; for (let k = 1; k < 4; k++) { const x = x1 + (.025 + .075 * k / 4) * U; g.beginPath(); g.moveTo(x, y0 + .002 * U); g.lineTo(x, y1); g.stroke(); } }
    // the soft daylight thrown from the window onto the wall and floor (no hard parallelogram: a broad blurred fall)
    g.save(); g.filter = `blur(${(.03 * U * S).toFixed(0)}px)`; g.globalCompositeOperation = 'screen';
    g.fillStyle = 'rgba(255,236,196,.12)'; g.beginPath(); g.moveTo(WIN.x0, WIN.y0); g.lineTo(WIN.x1, WIN.y0); g.lineTo(X(.3), Y(.62)); g.lineTo(X(.12), Y(.8)); g.lineTo(X(-.25), Y(.8)); g.lineTo(WIN.x0, WIN.y1); g.closePath(); g.fill(); g.restore();
  }
  { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = lin(X(-.1), 0, X(.45), 0, [[0, '#ffffff'], [1, '#8c8478']]); g.fillRect(0, 0, W, H); g.restore(); }
  // ---- the table and the water jar against the wall on the right; stools ----
  const furn = (path, top, side, light) => { g.fillStyle = side; g.fill(path); };
  { const tx0 = X(.07), tx1 = X(.27), ty = Y(.5), th = .016 * U;
    g.save(); g.filter = `blur(${(.008 * U * S).toFixed(0)}px)`; g.fillStyle = 'rgba(40,30,20,.35)'; g.beginPath(); g.ellipse((tx0 + tx1) / 2 + .01 * U, Y(.59), (tx1 - tx0) * .55, .012 * U, 0, 0, 6.283); g.fill(); g.restore();
    g.fillStyle = '#4a3624'; for (const x of [tx0 + .012 * U, tx1 - .02 * U]) g.fillRect(x, ty + th, .008 * U, Y(.592) - ty - th);
    g.fillStyle = lin(tx0, 0, tx1, 0, [[0, '#a07a52'], [1, '#6a4e34']]); g.fillRect(tx0, ty - .006 * U, tx1 - tx0, .008 * U); g.fillStyle = '#5a4230'; g.fillRect(tx0, ty + .002 * U, tx1 - tx0, th - .002 * U);
    // the clay jar: round belly, neck, two handles; lit on its window side, a pearly highlight on the shoulder
    const jx = X(.22), jb = ty - .006 * U, jr = .028 * U, jh = .085 * U;
    g.fillStyle = lin(jx - jr, 0, jx + jr, 0, [[0, '#d09a6a'], [.35, '#b4744a'], [1, '#5e3a22']]);
    g.beginPath(); g.moveTo(jx - jr * .45, jb); g.bezierCurveTo(jx - jr * 1.15, jb - jh * .2, jx - jr * 1.05, jb - jh * .7, jx - jr * .38, jb - jh * .82); g.lineTo(jx - jr * .32, jb - jh); g.lineTo(jx + jr * .32, jb - jh); g.lineTo(jx + jr * .38, jb - jh * .82);
    g.bezierCurveTo(jx + jr * 1.05, jb - jh * .7, jx + jr * 1.15, jb - jh * .2, jx + jr * .45, jb); g.closePath(); g.fill();
    g.strokeStyle = '#6a4228'; g.lineWidth = .005 * U; g.beginPath(); g.arc(jx - jr * .62, jb - jh * .8, jr * .28, Math.PI * .6, Math.PI * 1.6); g.stroke(); g.beginPath(); g.arc(jx + jr * .62, jb - jh * .8, jr * .28, -Math.PI * .6, Math.PI * .4); g.stroke();
    g.fillStyle = '#e8c8a0'; g.beginPath(); g.ellipse(jx, jb - jh, jr * .34, jr * .1, 0, 0, 6.283); g.fill();
    // a shallow bowl and a round loaf
    g.fillStyle = lin(0, ty - .02 * U, 0, ty, [[0, '#c8a070'], [1, '#7a5634']]); g.beginPath(); g.ellipse(X(.13), ty - .01 * U, .03 * U, .011 * U, 0, 0, Math.PI); g.fill();
    g.fillStyle = lin(X(.16), 0, X(.19), 0, [[0, '#d8a868'], [1, '#8a5c30']]); g.beginPath(); g.ellipse(X(.172), ty - .012 * U, .016 * U, .009 * U, 0, 0, 6.283); g.fill(); }

  // ---- the people: silhouettes in figure units (feet at 0, a standing height of 1 going up to -1), facing +u (right) before the
  // mirror, given volume and the window's light by OIL.relief. Bones keep their lengths: arms are placed from the shoulder with an
  // upper arm of .19 and a forearm of .16, elbows bending one way only; legs .25 + .25 seated. ----
  const poly = (p, pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; } if (a < 0) pts = pts.slice().reverse(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); };
  const ell = (p, x, y, rx, ry, rot = 0) => { p.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); p.ellipse(x, y, rx, ry, rot, 0, 6.283); };
  const limb = (p, a, b, w0, w1) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l; poly(p, [[a[0] + nx * w0, a[1] + ny * w0], [b[0] + nx * w1, b[1] + ny * w1], [b[0] - nx * w1, b[1] - ny * w1], [a[0] - nx * w0, a[1] - ny * w0]]); ell(p, b[0], b[1], w1, w1); };
  const arm2 = (sh, aU, aF) => { const el = [sh[0] + Math.sin(aU) * .19, sh[1] + Math.cos(aU) * .19], hd = [el[0] + Math.sin(aF) * .16, el[1] + Math.cos(aF) * .16]; return [el, hd]; };   // angles from straight down, + = forward
  function person(o) {
    const p = new Path2D(), ph = new Path2D(), pa = [new Path2D(), new Path2D()], lean = o.lean || 0, sit = o.pose === 'sit';
    const hip = sit ? [0, -.27] : [0, -.5], rot = (pt, c) => { const dx = pt[0] - c[0], dy = pt[1] - c[1], s = Math.sin(lean), co = Math.cos(lean); return [c[0] + dx * co - dy * s, c[1] + dx * s + dy * co]; };   // lean forward about the hip
    const up = (u, v) => rot([hip[0] + u, hip[1] + v], hip);
    // legs / skirt
    if (sit) { poly(p, [[-.13, -.36], [.06, -.36], [.27, -.33], [.29, -.25], [.3, -.02], [.18, -.02], [.17, -.22], [-.1, -.2]]);      // robe over the thighs and shins, falling to the floor in front
      ell(p, .28, -.015, .06, .022); }
    else { poly(p, [[-.12, -.52], [.1, -.52], [.14, -.03], [-.15, -.03]]); ell(p, .05, -.015, .06, .02); ell(p, -.06, -.015, .06, .02); }
    // torso (shoulders → chest → waist), the mantle's drape over the back
    const sh = up(.03, -.32), shB = up(-.07, -.33);
    poly(p, [up(-.12, .02), up(.11, .02), up(.115, -.12), up(.11, -.27), up(.06, -.33), up(-.08, -.335), up(-.13, -.26), up(-.135, -.1)]);
    if (o.cloak) poly(p, [up(-.09, -.34), up(.07, -.33), up(.03, -.2), up(-.16, -.02), up(-.2, sit ? .2 : .25), up(-.15, -.2)]);   // a cloak hanging off the back
    // head (with a head cloth or a veil falling behind)
    const hc = up(.015, -.425); ell(ph, hc[0], hc[1], .06, .072, lean);
    const nk = up(.0, -.34); poly(ph, [[nk[0] - .032, nk[1] + .01], [nk[0] + .032, nk[1] + .01], [nk[0] + .028, nk[1] - .06], [nk[0] - .028, nk[1] - .06]]);
    if (o.head === 'cloth' || o.head === 'veil') { const b1 = up(-.065, -.46), b2 = up(-.11, o.head === 'veil' ? -.1 : -.3), b3 = up(-.02, o.head === 'veil' ? -.12 : -.3); poly(ph, [up(.045, -.495), up(-.03, -.505), b1, b2, b3, up(.0, -.4)]); }
    // arms (far arm first is irrelevant in one silhouette: both drawn)
    const arms = o.arms || [[.3, .9], [.2, 1.1]];   // [upper-arm angle, forearm angle] per arm (rotated by the lean)
    const hands = [];
    arms.forEach(([aU, aF], i) => { const q = pa[i], s0 = up(i ? -.02 : .02, -.31), [el, hd] = arm2(s0, aU + lean, aF + lean); ell(q, s0[0], s0[1], .05, .05); limb(q, s0, el, .046, .04); limb(q, el, hd, .04, .05); ell(q, hd[0], hd[1], .022, .028); hands.push(hd);   // shoulder, upper arm, elbow, the sleeve widening, the hand
      if (o.open && i === 0) { for (let k = 0; k < 4; k++) { const a = -.95 + k * .2; limb(q, hd, [hd[0] + Math.cos(a) * .058, hd[1] + Math.sin(a) * .058], .011, .01); } limb(q, hd, [hd[0] + .01, hd[1] - .045], .012, .01); } });   // the open palm: four fingers and a thumb
    return { path: p, head: hc, hands, ph, pa };
  }
  // the light: the window (plate px), a little in front of the wall
  const LIGHT = { x: LW[0] * S, y: LW[1] * S, z: .2 * U * S, R: 1.25 * U * S };
  const STOOLS = [];
  // place a person: x, feet y (stage), standing height h (stage units), facing f, colours
  function place(o) {
    const pr = person(o), m = new DOMMatrix([o.f * o.h * U * S, 0, 0, o.h * U * S, X(o.x) * S, Y(o.y) * S]);
    const near = (u, v, c, r) => Math.hypot(u - c[0], v - c[1]) < r;
    const zones = [
      { test: (u, v) => pr.hands.some(hd => near(u, v, hd, .036)), base: [70, 50, 38], lit: [236, 186, 142] },
      { test: (u, v) => near(u, v, pr.head, .062) && (u - pr.head[0]) > -.012, base: [66, 46, 34], lit: [244, 188, 140] },   // the face: a soft warm plane
      { test: (u, v) => v < pr.head[1] + .06, base: o.hair || [40, 32, 26], lit: o.hairLit || [150, 120, 92] },               // the head cloth, hair, veil
      { base: o.col, lit: o.lit } ];
    // its shadow on the floor (soft, away from the window)
    g.save(); g.filter = `blur(${(.01 * U * S).toFixed(0)}px)`; g.fillStyle = 'rgba(34,24,16,.4)'; g.beginPath(); g.ellipse(X(o.x + .05 * o.h), Y(o.y) - .004 * U, .14 * o.h * U, .016 * U, 0, 0, 6.283); g.fill(); g.restore();
    if (o.stool) { const sx = X(o.x + o.f * .02 * o.h), sw = .09 * o.h * U, st = Y(o.y) - .27 * o.h * U; g.fillStyle = '#4a3622'; g.fillRect(sx - sw, st, sw * 2, .022 * o.h * U); STOOLS.push({ sx, sw, st, y: Y(o.y), w: .028 * o.h * U }); }
    const RO = { soft: .045, height: 46, amb: .08, wrap: .06 }, box = [-.45, -1.05, .45, .05];
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    OIL.relief(g, pr.pa[1], m, box, zones.map(zn => ({ ...zn, k: .8 })), LIGHT, RO); OIL.relief(g, pr.path, m, box, zones, LIGHT, RO); OIL.relief(g, pr.ph, m, box, zones, LIGHT, { ...RO, soft: .06 }); OIL.relief(g, pr.pa[0], m, box, zones, LIGHT, RO);
    g.restore();
    return { pr, m };
  }
  // the group, far → near (higher feet = further back). Listeners lean toward Peter (to the right); Peter faces them (f = -1)
  const GARM = (a, b) => ({ col: a, lit: b });
  // (round 3, coordinator: Peter by the window in the light, the listeners on the right turned toward him — their faces take the light)
  place({ x: .175, y: .595, h: .23, f: -1, pose: 'stand', lean: .1, head: 'cloth', arms: [[.08, .3], [-.02, .2]], hair: [120, 104, 80], hairLit: [236, 222, 190], ...GARM([86, 64, 42], [214, 168, 112]) });                              // a kinsman standing behind, leaning in
  place({ x: .1, y: .597, h: .23, f: -1, pose: 'stand', lean: .14, head: 'hair', arms: [[.1, .35], [-.06, .22]], ...GARM([112, 90, 36], [240, 210, 120]) });                              // a young friend standing, his hands at his sides
  place({ x: .19, y: .615, h: .21, f: -1, pose: 'sit', lean: .22, head: 'veil', stool: true, hair: [150, 142, 124], hairLit: [252, 246, 228], arms: [[.35, 1.4], [.25, 1.25]], ...GARM([40, 54, 96], [120, 146, 206]) });   // a woman in a pale veil, ultramarine
  place({ x: .135, y: .645, h: .24, f: -1, pose: 'sit', lean: .28, head: 'cloth', stool: true, arms: [[.6, 1.45], [.5, 1.3]], hair: [110, 100, 84], hairLit: [226, 216, 190], ...GARM([70, 72, 58], [190, 190, 156]) });                    // an older friend, elbows on his knees, leaning far in
  place({ x: .04, y: .665, h: .25, f: -1, pose: 'sit', lean: .2, head: 'hair', stool: true, cloak: true, arms: [[.45, 1.35], [.4, 1.2]], ...GARM([104, 22, 16], [226, 60, 40]) });           // Cornelius in his red cloak
  const PETER = place({ x: -.165, y: .68, h: .28, f: 1, pose: 'stand', lean: .03, head: 'hair', open: true, arms: [[.36, 1.32], [-.3, .5]], hair: [62, 52, 44], hairLit: [176, 150, 124], ...GARM([72, 58, 44], [206, 168, 118]) });   // Peter by the window, turned to them, his near hand open, palm up
  // pearly highlights where the light catches (Vermeer's pointillé): the jar's shoulder, the sill, the cloak's fold, the open hand
  { const r = rng(12), dot = (x, y, n, sp) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(255,250,236,${.55 + .4 * r()})`; g.beginPath(); g.arc(x + (r() - .5) * sp, y + (r() - .5) * sp * .5, .6 + 1.4 * r(), 0, 6.283); g.fill(); } };
    dot(X(.205), Y(.43), 5, .012 * U); dot(WIN.x0 + .05 * U, WIN.y1, 6, .05 * U); dot(X(.09), Y(.49), 3, .02 * U);
    const ph = PETER.m.transformPoint({ x: PETER.pr.hands[0][0], y: PETER.pr.hands[0][1] }); dot(ph.x / S, ph.y / S, 4, .012 * U); }
  // ---- paint it ----
  const art = OIL.paint(plate, V ? { key: 'vermeer', S, seed: 23 } : { key: 'vermeer', S, seed: 23, wid: 1 / 500, cell: 3.4 });   // landscape is seen 1.75× closer: finer strokes
  { const a = art.getContext('2d'); a.save(); a.scale(S, S); a.lineCap = 'round';
    for (const st of STOOLS) { a.save(); a.filter = `blur(${(.004 * U * S).toFixed(1)}px)`; a.fillStyle = 'rgba(26,18,12,.55)'; for (const k of [-.85, .8]) { a.beginPath(); a.ellipse(st.sx + k * st.sw, st.y, st.w * 1.6, st.w * .45, 0, 0, 6.283); a.fill(); } a.restore();
      for (const k of [-.85, .8]) { const x0 = st.sx + k * st.sw; a.strokeStyle = '#3a2a1a'; a.lineWidth = st.w; a.beginPath(); a.moveTo(x0, st.st + st.w * .5); a.lineTo(x0 + k * st.w * .4, st.y - st.w * .3); a.stroke(); a.strokeStyle = 'rgba(200,150,100,.35)'; a.lineWidth = st.w * .3; a.beginPath(); a.moveTo(x0 - st.w * .25, st.st + st.w); a.lineTo(x0 - st.w * .25 + k * st.w * .4, st.y - st.w * .6); a.stroke(); } }
    a.restore(); }
  COIL.art = art; COIL.S = S; COIL.WIN = WIN; COIL.LW = LW; COIL.U = U; COIL.X = X; COIL.Y = Y; COIL.peterHand = PETER.m.transformPoint({ x: PETER.pr.hands[0][0], y: PETER.pr.hands[0][1] });
  { const gc = canvas(256, 256), x = gc.getContext('2d'), im = x.createImageData(256, 256), r = rng(91); for (let i = 0; i < 65536; i++) { const v = 128 + (r() - .5) * 110; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); COIL.grain = gc; }
}

function corneliusOil(ctx, u) {
  const { clamp, ss, rng } = Pilot, W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v', { art, S, WIN, LW, U, X, Y } = COIL; u = clamp(u, 0, 4.7);
  // a low still camera that closes in by 5 % on the group (landscape frames the group a little closer: more room on the sides)
  const z0 = V ? 1.25 : 1.75, z = z0 * (1 + .05 * ss(0, 4.7, u)), fx = clamp(X(V ? .005 : -.01), W / 2 / z, W - W / 2 / z), fy = clamp(Y(V ? .468 : .46), H / 2 / z, H - H / 2 / z);
  const sc = (px, py) => [W / 2 + (px - fx) * z, H / 2 + (py - fy) * z];
  OIL.view(ctx, art, S, fx * S, fy * S, z);
  { ctx.save(); ctx.globalCompositeOperation = 'multiply'; const [lx] = sc(X(-.2), 0), [rx] = sc(X(.3), 0), gr = ctx.createLinearGradient(lx, 0, rx, 0); gr.addColorStop(0, 'rgb(238,232,224)'); gr.addColorStop(1, 'rgb(150,142,134)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); }   // the room one step darker than the plate (75–95)
  // the window's light grows (from u ≈ 1.2) and gathers over the people: a soft beam from the window, and a warm lift on them
  const k = ss(1.0, 2.6, u), [wx, wy] = sc(LW[0], LW[1]), [gx, gy] = sc(X(-.02), Y(.52));
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  { const gr = ctx.createLinearGradient(wx, wy, gx, gy); gr.addColorStop(0, `rgba(255,236,196,${.02 + .07 * k})`); gr.addColorStop(1, `rgba(255,226,180,${.0 + .06 * k})`);
    ctx.save(); ctx.filter = 'blur(30px)'; ctx.fillStyle = gr; const [ax, ay] = sc(WIN.x0, WIN.y0), [bx, by] = sc(WIN.x1, WIN.y0), [cx, cy] = sc(X(.32), Y(.6)), [dx, dy] = sc(X(-.2), Y(.72)), [ex, ey] = sc(WIN.x0, WIN.y1);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.lineTo(dx, dy); ctx.lineTo(ex, ey); ctx.closePath(); ctx.fill(); ctx.restore(); }
  { const R = .32 * U * z, gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, R); gr.addColorStop(0, `rgba(255,222,170,${.1 * k})`); gr.addColorStop(1, 'rgba(255,222,170,0)'); ctx.fillStyle = gr; ctx.fillRect(gx - R, gy - R, 2 * R, 2 * R); }
  { const [px, py] = sc(COIL.peterHand.x / S, COIL.peterHand.y / S), R = .06 * U * z, gr = ctx.createRadialGradient(px, py, 0, px, py, R); gr.addColorStop(0, `rgba(255,236,200,${.22 * k})`); gr.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = gr; ctx.fillRect(px - R, py - R, 2 * R, 2 * R); }
  { const R = (WIN.x1 - WIN.x0) * 1.0 * z, gr = ctx.createRadialGradient(wx, wy, 0, wx, wy, R); gr.addColorStop(0, `rgba(255,248,230,${.16 + .08 * k})`); gr.addColorStop(1, 'rgba(255,248,230,0)'); ctx.fillStyle = gr; ctx.fillRect(wx - R, wy - R, 2 * R, 2 * R); }
  // dust turning slowly in the window light
  { const r = rng(41); for (let i = 0; i < 80; i++) { const t0 = r(), ax = WIN.x0 + r() * (X(.28) - WIN.x0), ay = WIN.y0 + r() * (Y(.62) - WIN.y0), x = ax + Math.sin(u * .4 + i) * .01 * U, y = ay - u * .004 * U * (r() + .2), [sx, sy] = sc(x, y);
      const inBeam = 1 - Math.min(1, Math.abs((y - WIN.y0) / (Y(.62) - WIN.y0) - (x - WIN.x0) / (X(.3) - WIN.x0)) * 2.2); if (inBeam <= 0) continue;
      ctx.fillStyle = `rgba(255,240,214,${(.12 + .3 * r()) * inBeam * (.5 + .5 * k)})`; ctx.beginPath(); ctx.arc(sx, sy, (.7 + r() * 1.3) * z, 0, 6.283); ctx.fill(); } }
  ctx.restore();
  // varnish, a gentle vignette, the floor under the words a little darker, grain
  OIL.varnish(ctx, .4, [130, 92, 50]);
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  { const R = Math.hypot(W, H) * .62, gr = ctx.createRadialGradient(W * .45, H * .42, R * .35, W / 2, H * .45, R); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(170,152,136)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  { const y0 = V ? H * .6 : H * .72, b = ctx.createLinearGradient(0, y0, 0, H); b.addColorStop(0, '#fff'); b.addColorStop(1, 'rgb(150,140,130)'); ctx.fillStyle = b; ctx.fillRect(0, y0, W, H - y0); }
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .06; const o = Math.floor(u * 24); ctx.translate(-((o * 73) % 256), -((o * 151) % 256)); ctx.fillStyle = ctx.createPattern(COIL.grain, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}
