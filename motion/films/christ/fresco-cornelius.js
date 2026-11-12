/* fresco-cornelius.js — 「그리스도」 N20 (film 125.0–129.7 s, u = 0..4.7): "'그리 마옵소서' 하던 베드로가 / 훗날 전한 말."
   Acts 10:24–27, the house of Cornelius at Caesarea — told as a first-century Roman wall painting (Pompeii, Herculaneum: the Villa
   of the Mysteries, the portrait of Terentius Neo and his wife), and filmed like an object: a real plastered wall seen at an angle.
   The composition is the one fixed in the Vermeer version: Peter stands front left by the window, his near hand open, palm up;
   on the right five listeners lean toward him — Cornelius in cinnabar red on a stool, an older friend with his elbows on his
   knees, a woman in a pale veil and Egyptian blue, a kinsman and a young man in ochre standing. The painting: dark outlines,
   flat colour fields, a few white highlight strokes, large eyes of a few strokes, no realism; framed Pompeian-style by cinnabar
   panels, black bands and a black dado with ochre lines. The wall: lime plaster with a fine grain, hairline cracks, a few places
   where the paint has flaked off to the bare plaster, colours faded toward the edges.
   The camera slides slowly along the wall at an angle and closes in (each column of the wall drawn at its own depth, so the
   bands converge). Morning sunlight rakes across the surface from the left — the grain and the cracks throw tiny shadows inside
   it; from u ≈ 1.2 the band of sun moves over the wall and comes to rest on the faces of Peter and his listeners, dust in it.
   No words are drawn (portrait: every head and upper body sits above 0.70 H; the words at 0.74 H fall on legs and floor).
   API: await buildCorneliusFresco() · corneliusFresco(ctx, u) */
const CFR = {};
async function buildCorneliusFresco() {
  const { clamp, lerp, rng, canvas, noise, fbm } = Pilot, PW = 3000, PH = 2700;
  const fr = canvas(PW, PH), g = fr.getContext('2d');
  const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([k, c]) => gr.addColorStop(k, c)); return gr; };
  const C = { red: '#a3271c', redD: '#7c1c14', ochre: '#c8923e', ochreL: '#e2b866', green: '#5f7350', greenD: '#3e4e36', black: '#1c1714', ivory: '#ece0c4', ivoryD: '#d6c6a2', blue: '#3f6f9a', out: '#2a1810' };
  // ---- the wall's decoration (Pompeian Fourth Style, simplified): frieze, cinnabar fields, the central picture, the black dado ----
  const PX0 = 520, PX1 = 2480, PY0 = 360, PY1 = 1960;                                   // the central picture
  g.fillStyle = C.ivory; g.fillRect(0, 0, PW, PH);
  g.fillStyle = C.black; g.fillRect(0, 0, PW, 300);                                      // the upper frieze
  g.fillStyle = C.ochre; g.fillRect(0, 300, PW, 14); g.fillStyle = C.ivory; g.fillRect(0, 318, PW, 6);
  { g.strokeStyle = '#9a7a3c'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 165); g.lineTo(PW, 165); g.stroke();   // a laurel band: one straight stem, paired leaves, ochre and olive only
    for (let x = 20; x < PW; x += 46) for (const sd of [-1, 1]) { g.save(); g.translate(x, 165); g.rotate(sd * .55 - .25); g.fillStyle = sd < 0 ? '#8a7a42' : '#a88a48'; g.beginPath(); g.ellipse(18, 0, 22, 7, 0, 0, 6.283); g.fill(); g.restore(); } }
  g.fillStyle = C.red; g.fillRect(0, 330, PX0 - 40, PY1 - 330 + 40); g.fillRect(PX1 + 40, 330, PW - PX1 - 40, PY1 - 330 + 40);   // the cinnabar fields
  for (const [x0, x1] of [[60, PX0 - 100], [PX1 + 100, PW - 60]]) { g.strokeStyle = C.ochreL; g.lineWidth = 5; g.strokeRect(x0, 420, x1 - x0, PY1 - 520); g.strokeStyle = C.ivory; g.lineWidth = 2; g.strokeRect(x0 + 18, 438, x1 - x0 - 36, PY1 - 556);
    const cx = (x0 + x1) / 2; g.fillStyle = C.ochreL; g.beginPath(); g.ellipse(cx, 1150, 26, 60, 0, 0, 6.283); g.fill(); g.strokeStyle = C.ochre; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, 1050); g.lineTo(cx, 1250); g.stroke(); }   // a small floating emblem
  g.fillStyle = C.black; g.fillRect(PX0 - 40, 330, 40, PY1 - 290); g.fillRect(PX1, 330, 40, PY1 - 290);           // black bands round the picture
  g.fillStyle = C.black; g.fillRect(0, PY1 + 40, PW, PH - PY1 - 40);                                                // the dado
  g.fillStyle = C.red; g.fillRect(0, PY1 + 40, PW, 16); g.strokeStyle = C.ochre; g.lineWidth = 4;
  g.strokeStyle = C.ochreL; g.lineWidth = 6; g.strokeRect(PX0 - 6, PY0 - 6, PX1 - PX0 + 12, PY1 - PY0 + 12); g.strokeStyle = C.ivory; g.lineWidth = 3; g.strokeRect(PX0 + 8, PY0 + 8, PX1 - PX0 - 16, PY1 - PY0 - 16);

  // ---- the picture: a room in Cornelius' house, painted ----
  const PXs = x => 1450 + x * 1700, PYs = y => 1650 + (y - .68) * 1700, K = 1700;   // the Vermeer layout's stage → plate px
  g.save(); g.beginPath(); g.rect(PX0 + 12, PY0 + 12, PX1 - PX0 - 24, PY1 - PY0 - 24); g.clip();
  { const floorY = PYs(.6);
    g.fillStyle = lin(PX0, 0, PX1, 0, [[0, '#efe2c2'], [.6, '#e2d2ae'], [1, '#cdbb94']]); g.fillRect(PX0, PY0, PX1 - PX0, floorY - PY0);       // the room's ivory wall
    g.fillStyle = C.ochre; g.fillRect(PX0, floorY - 70, PX1 - PX0, 70); g.fillStyle = C.redD; g.fillRect(PX0, floorY - 74, PX1 - PX0, 6);      // a low ochre socle
    g.fillStyle = lin(0, floorY, 0, PY1, [[0, '#b88a50'], [1, '#8a6436']]); g.fillRect(PX0, floorY, PX1 - PX0, PY1 - floorY);                  // the floor
    g.strokeStyle = 'rgba(70,44,22,.35)'; g.lineWidth = 3; for (let k = 1; k < 5; k++) { const y = floorY + (PY1 - floorY) * k / 5; g.beginPath(); g.moveTo(PX0, y); g.lineTo(PX1, y); g.stroke(); }
    g.fillStyle = C.black; g.fillRect(PX0, PY0 + 12, PX1 - PX0, 40);                                                                            // the ceiling beam line
    for (let x = PX0 + 40; x < PX1; x += 150) { g.fillStyle = '#4a3020'; g.fillRect(x, PY0 + 12, 50, 70); }
    // the window: deep ochre frame, blue-green sea and sky in a few flat bands, a red roof, the open shutter
    const wx0 = PXs(-.31), wx1 = PXs(-.16), wy0 = PYs(.12), wy1 = PYs(.41);
    g.fillStyle = '#b8cac6'; g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0); g.fillStyle = '#dfe4d8'; g.fillRect(wx0, wy0, wx1 - wx0, (wy1 - wy0) * .45);
    g.fillStyle = '#7a9a9a'; g.fillRect(wx0, wy0 + (wy1 - wy0) * .62, wx1 - wx0, (wy1 - wy0) * .38); g.strokeStyle = '#eef2ea'; g.lineWidth = 4; for (let k = 0; k < 3; k++) { const y = wy0 + (wy1 - wy0) * (.68 + k * .1); g.beginPath(); g.moveTo(wx0 + 20 + k * 30, y); g.lineTo(wx0 + 120 + k * 30, y); g.stroke(); }
    g.fillStyle = '#b05a44'; g.beginPath(); g.moveTo(wx0, wy1 - 60); g.lineTo(wx0 + 140, wy1 - 90); g.lineTo(wx0 + 190, wy1); g.lineTo(wx0, wy1); g.fill();
    g.strokeStyle = '#6a3a22'; g.lineWidth = 8; g.strokeRect(wx0, wy0, wx1 - wx0, wy1 - wy0); g.lineWidth = 5; g.beginPath(); g.moveTo((wx0 + wx1) / 2, wy0); g.lineTo((wx0 + wx1) / 2, wy1); g.stroke();
    g.fillStyle = '#8a5a30'; g.beginPath(); g.moveTo(wx1 + 24, wy0 - 12); g.lineTo(wx1 + 150, wy0 + 10); g.lineTo(wx1 + 150, wy1 - 10); g.lineTo(wx1 + 24, wy1 + 12); g.closePath(); g.fill(); g.strokeStyle = C.out; g.lineWidth = 7; g.stroke();
    g.strokeStyle = 'rgba(42,24,16,.6)'; g.lineWidth = 4; for (let k = 1; k < 4; k++) { const x = wx1 + 24 + 126 * k / 4; g.beginPath(); g.moveTo(x, wy0 + 5); g.lineTo(x, wy1 - 5); g.stroke(); }
    // the table, the jar, a bowl
    const tx0 = PXs(.07), tx1 = PXs(.27), ty = PYs(.5);
    g.fillStyle = '#7a4c28'; g.fillRect(tx0, ty, tx1 - tx0, 24); g.fillRect(tx0 + 20, ty + 24, 18, PYs(.592) - ty - 24); g.fillRect(tx1 - 40, ty + 24, 18, PYs(.592) - ty - 24);
    g.strokeStyle = C.out; g.lineWidth = 6; g.strokeRect(tx0, ty, tx1 - tx0, 24);
    const jx = PXs(.22), jb = ty, jr = 52, jh = 150; g.fillStyle = '#b8643a'; g.beginPath(); g.moveTo(jx - jr * .45, jb); g.bezierCurveTo(jx - jr * 1.15, jb - jh * .2, jx - jr * 1.05, jb - jh * .7, jx - jr * .38, jb - jh * .82); g.lineTo(jx - jr * .32, jb - jh); g.lineTo(jx + jr * .32, jb - jh); g.lineTo(jx + jr * .38, jb - jh * .82); g.bezierCurveTo(jx + jr * 1.05, jb - jh * .7, jx + jr * 1.15, jb - jh * .2, jx + jr * .45, jb); g.closePath(); g.fill(); g.lineWidth = 6; g.stroke();
    g.strokeStyle = '#f4e6c8'; g.lineWidth = 6; g.beginPath(); g.arc(jx - jr * .2, jb - jh * .5, jr * .6, Math.PI * .9, Math.PI * 1.35); g.stroke();   // a white highlight stroke
    g.fillStyle = '#d8a060'; g.beginPath(); g.ellipse(PXs(.13), ty - 14, 54, 18, 0, 0, Math.PI); g.fill(); g.strokeStyle = C.out; g.lineWidth = 5; g.stroke(); }

  { const rb = rng(3); g.lineCap = 'round'; for (let i = 0; i < 900; i++) { const x = rb() * PW, y = 340 + rb() * 1610, a = (rb() - .5) * .8 + (rb() < .5 ? 0 : Math.PI / 2), l = 30 + 90 * rb();
      g.strokeStyle = rb() < .5 ? `rgba(255,248,232,${.04 + .05 * rb()})` : `rgba(40,20,10,${.03 + .05 * rb()})`; g.lineWidth = 6 + 16 * rb(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }   // the fresco painter's broad strokes
  // ---- the people (the Vermeer version's figures, painted flat: outline → colour field → white highlight strokes → eyes) ----
  const poly = (p, pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; } if (a < 0) pts = pts.slice().reverse(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); };
  const ell = (p, x, y, rx, ry, rot = 0) => { p.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); p.ellipse(x, y, rx, ry, rot, 0, 6.283); };
  const limb = (p, a, b, w0, w1) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l; poly(p, [[a[0] + nx * w0, a[1] + ny * w0], [b[0] + nx * w1, b[1] + ny * w1], [b[0] - nx * w1, b[1] - ny * w1], [a[0] - nx * w0, a[1] - ny * w0]]); ell(p, b[0], b[1], w1, w1); };
  const arm2 = (sh, aU, aF) => { const el = [sh[0] + Math.sin(aU) * .19, sh[1] + Math.cos(aU) * .19], hd = [el[0] + Math.sin(aF) * .16, el[1] + Math.cos(aF) * .16]; return [el, hd]; };   // bones .19 + .16, angles from straight down, + = forward
  function person(o) {
    const p = new Path2D(), ph = new Path2D(), hair = new Path2D(), pa = [new Path2D(), new Path2D()], lean = o.lean || 0, sit = o.pose === 'sit';
    const hip = sit ? [0, -.27] : [0, -.5], rot = (pt, c) => { const dx = pt[0] - c[0], dy = pt[1] - c[1], s = Math.sin(lean), co = Math.cos(lean); return [c[0] + dx * co - dy * s, c[1] + dx * s + dy * co]; };
    const up = (u, v) => rot([hip[0] + u, hip[1] + v], hip);
    if (sit) { poly(p, [[-.13, -.36], [.06, -.36], [.27, -.33], [.29, -.25], [.3, -.02], [.18, -.02], [.17, -.22], [-.1, -.2]]); ell(p, .28, -.015, .06, .022); }
    else { poly(p, [[-.12, -.52], [.1, -.52], [.14, -.03], [-.15, -.03]]); ell(p, .05, -.015, .06, .02); ell(p, -.06, -.015, .06, .02); }
    poly(p, [up(-.12, .02), up(.11, .02), up(.115, -.12), up(.11, -.27), up(.06, -.33), up(-.08, -.335), up(-.13, -.26), up(-.135, -.1)]);
    if (o.cloak) poly(p, [up(-.09, -.34), up(.07, -.33), up(.03, -.2), up(-.16, -.02), up(-.2, sit ? .2 : .25), up(-.15, -.2)]);
    const hc = up(.015, -.43); ell(ph, hc[0], hc[1], .048, .06, lean);
    const sh8 = q => [hc[0] + (q[0] - hc[0]) * .82, hc[1] + (q[1] - hc[1]) * .82], polyH = (path, pts) => poly(path, pts.map(sh8));
    const nk = up(.0, -.34); poly(ph, [[nk[0] - .032, nk[1] + .01], [nk[0] + .032, nk[1] + .01], [nk[0] + .028, nk[1] - .06], [nk[0] - .028, nk[1] - .06]]);
    // hair / head cloth / veil: a cap over the back and top of the head (the face stays open toward where they look)
    if (o.head === 'cloth' || o.head === 'veil') { const b1 = up(-.065, -.46), b2 = up(-.11, o.head === 'veil' ? -.1 : -.3), b3 = up(-.02, o.head === 'veil' ? -.12 : -.3); polyH(hair, [up(.045, -.495), up(-.03, -.505), b1, b2, b3, up(.0, -.4)]); }
    else { polyH(hair, [up(.05, -.475), up(.0, -.5), up(-.05, -.49), up(-.065, -.44), up(-.055, -.39), up(-.02, -.4), up(-.01, -.45), up(.04, -.455)]); }
    const arms = o.arms || [[.3, .9], [.2, 1.1]], hands = [];
    arms.forEach(([aU, aF], i) => { const q = pa[i], s0 = up(i ? -.02 : .02, -.31), [el, hd] = arm2(s0, aU + lean, aF + lean); ell(q, s0[0], s0[1], .05, .05); limb(q, s0, el, .046, .04); limb(q, el, hd, .04, .05); hands.push([hd[0] + Math.sin(aF + lean) * .035, hd[1] + Math.cos(aF + lean) * .035]); });
    return { body: p, head: ph, hair, pa, hc, hands, lean };
  }
  const chalk = (c, k = .3) => { const a = Pilot.hex(c), b = [232, 222, 200], m = (a[0] + a[1] + a[2]) / 3; return '#' + a.map((v, i) => { const d = v + (m - v) * .25; return Math.round(d + (b[i] - d) * k).toString(16).padStart(2, '0'); }).join(''); };
  function paintPerson(o) {
    for (const key of ['col', 'colD', 'skin', 'hairC']) o[key] = chalk(o[key], key === 'skin' ? .18 : o.accent ? .1 : .28);   // the cinnabar keeps its strength
    const pr = person(o), s = o.h * K, f = o.f, X = PXs(o.x), Y = PYs(o.y), lw = 2.2 / s * 3;   // outline ≈ 6–7 px
    const drawPart = (path, fill, hi = true) => { g.save(); g.translate(X, Y); g.scale(f * s, s); g.lineJoin = 'round'; g.lineCap = 'round'; const rd = rng(Math.round(X * 3 + Y) % 991);
      g.strokeStyle = 'rgba(122,58,32,.8)'; g.lineWidth = lw * 1.1; g.setLineDash([.06 + .1 * rd(), .015 + .03 * rd(), .03 + .08 * rd(), .02 + .04 * rd()]); g.lineDashOffset = rd(); g.stroke(path);   // the sinopia: a red-brown underdrawing, broken
      g.lineWidth = lw * .6; g.setLineDash([.12 + .1 * rd(), .05 * rd() + .01]); g.lineDashOffset = rd(); g.stroke(path); g.setLineDash([]);
      g.globalAlpha = .9; g.fillStyle = fill; g.fill(path); g.globalAlpha = 1;
      if (hi) { g.save(); g.clip(path); g.fillStyle = 'rgba(250,242,222,.3)'; g.fill(path); g.translate(.014 * f, .006); g.fillStyle = fill; g.fill(path); g.restore(); }
      { g.save(); g.clip(path); const rb = rng(Math.round(X + Y) % 997); g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const x0 = (rb() - .5) * .6, y0 = -rb() * 1.0, a = Math.PI / 2 + (rb() - .5) * .5, l = .05 + .12 * rb();   // the painter's brush inside each colour field
        g.strokeStyle = rb() < .55 ? 'rgba(250,244,228,.16)' : 'rgba(60,30,14,.1)'; g.lineWidth = .015 + .025 * rb(); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); g.stroke(); } g.restore(); }   // a thin white highlight along the edge toward the window (the shape minus itself shifted)
      g.restore(); };
    // its shadow on the floor: a flat dark ellipse (wall painters drew them so)
    g.fillStyle = 'rgba(60,36,18,.35)'; g.beginPath(); g.ellipse(X + f * .05 * s, Y, .17 * s, .022 * s, 0, 0, 6.283); g.fill();
    if (o.stool) { const sx = X + f * .02 * s, sw = .09 * s, st = Y - .27 * s; g.fillStyle = '#6a3e1e'; g.strokeStyle = C.out; g.lineWidth = 5; g.fillRect(sx - sw, st, sw * 2, .025 * s); g.strokeRect(sx - sw, st, sw * 2, .025 * s);
      for (const k of [-.85, .78]) { g.beginPath(); g.moveTo(sx + k * sw, st + .02 * s); g.lineTo(sx + k * sw * 1.08, Y); g.lineWidth = .028 * s; g.strokeStyle = C.out; g.stroke(); g.lineWidth = .016 * s; g.strokeStyle = '#7a4a24'; g.stroke(); } }
    // hands in the skin colour (the sleeves end at the wrist); the open hand: a palm turned up, four fingers and a thumb
    const hand = (i, open) => { const hp = new Path2D(), [hx, hy] = pr.hands[i];
      if (open) { ell(hp, hx + .012, hy - .004, .03, .02); for (let k = 0; k < 4; k++) { const ang = -.5 + k * .17; limb(hp, [hx + .025, hy - .006 + k * .002], [hx + .025 + Math.cos(ang) * .055, hy - .006 + Math.sin(ang) * .055], .009, .008); } limb(hp, [hx, hy - .01], [hx + .012, hy - .05], .01, .009); }
      else ell(hp, hx, hy, .026, .03);
      drawPart(hp, o.skin, false); };
    drawPart(pr.pa[1], o.colD);
    hand(1, false);   // the far hand stays behind the body
    drawPart(pr.body, o.col);
    // garment folds: a few dark strokes
    g.save(); g.translate(X, Y); g.scale(f * s, s); g.strokeStyle = 'rgba(40,22,14,.55)'; g.lineWidth = lw * .9; g.lineCap = 'round'; const sit = o.pose === 'sit', lean = o.lean || 0;
    for (const [a, b, c] of sit ? [[[-.02, -.6], [.0, -.45], [.03, -.33]], [[.08, -.32], [.18, -.3], [.26, -.26]], [[.22, -.2], [.24, -.1], [.25, -.03]]] : [[[-.04, -.8], [-.05, -.6], [-.07, -.1]], [[.05, -.75], [.06, -.5], [.08, -.08]]]) {
      g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(...b, ...c); g.stroke(); }
    g.restore();
    drawPart(pr.head, o.skin);
    drawPart(pr.hair, o.hairC, o.head === 'veil');
    // the face: one large almond eye looking where they look, a brow, the line of the nose and mouth (a few strokes)
    { g.save(); g.translate(X, Y); g.scale(f * s, s); const [hx, hy] = pr.hc; g.translate(hx, hy); g.rotate(pr.lean);
      const fc = new Path2D(); ell(fc, 0, 0, .048, .06); g.save(); g.clip(fc);
      g.fillStyle = 'rgba(70,36,20,.38)'; g.beginPath(); g.ellipse(-.03, .006, .036, .07, 0, 0, 6.283); g.fill();          // the far side of the face in shade
      g.fillStyle = 'rgba(250,226,196,.22)'; g.beginPath(); g.ellipse(.026, -.022, .02, .014, -.3, 0, 6.283); g.fill();     // light on the brow and cheek
      g.fillStyle = 'rgba(60,30,16,.5)'; g.beginPath(); g.ellipse(.022, -.008, .012, .006, 0, 0, 6.283); g.fill();      // the eye: a small shadow under the brow
      g.strokeStyle = 'rgba(90,44,24,.55)'; g.lineWidth = lw * .5; g.beginPath(); g.moveTo(.006, -.022); g.quadraticCurveTo(.024, -.03, .04, -.024); g.stroke();
      g.beginPath(); g.moveTo(.044, -.012); g.lineTo(.05, .014); g.stroke(); g.restore();
      g.restore(); }
    drawPart(pr.pa[0], o.col);
    hand(0, !!o.open);
    return { pr, X, Y, s, f };
  }
  const M = '#9a5a36', Wm = '#e2b48a';   // skin: men reddish brown, the woman pale (the painters' convention)
  paintPerson({ x: .175, y: .595, h: .23, f: -1, pose: 'stand', lean: .1, head: 'cloth', arms: [[.08, .3], [-.02, .2]], col: '#8a5a34', colD: '#6a4226', skin: M, hairC: '#d8c8a0' });          // a kinsman
  paintPerson({ x: .1, y: .597, h: .23, f: -1, pose: 'stand', lean: .14, head: 'hair', arms: [[.1, .35], [-.06, .22]], col: C.ochre, colD: '#9a6a28', skin: M, hairC: '#2a1a10' });                // a young man in ochre
  paintPerson({ x: .19, y: .615, h: .21, f: -1, pose: 'sit', lean: .22, head: 'veil', stool: true, arms: [[.35, 1.4], [.25, 1.25]], col: C.blue, colD: '#2c5070', skin: Wm, hairC: '#ece4d0' });      // a woman, veiled, in Egyptian blue
  paintPerson({ x: .135, y: .645, h: .24, f: -1, pose: 'sit', lean: .28, head: 'cloth', stool: true, arms: [[.6, 1.45], [.5, 1.3]], col: C.green, colD: C.greenD, skin: M, hairC: '#c8b890' });        // an older friend
  paintPerson({ x: .04, y: .665, h: .25, f: -1, pose: 'sit', lean: .2, head: 'hair', stool: true, cloak: true, accent: true, arms: [[.45, 1.35], [.4, 1.2]], col: C.red, colD: C.redD, skin: M, hairC: '#2a1a10' });   // Cornelius in cinnabar
  const PETER = paintPerson({ x: -.165, y: .68, h: .28, f: 1, pose: 'stand', lean: .03, head: 'hair', open: true, arms: [[.36, 1.32], [-.3, .5]], col: '#efe4cc', colD: '#c8b894', skin: M, hairC: '#5a4a3c' });   // Peter in a white tunic
  { const s = PETER.s; g.save(); g.translate(PETER.X, PETER.Y); g.scale(s, s); g.fillStyle = C.ochre; g.strokeStyle = C.out; g.lineWidth = 2.2 / s * 6; const p = new Path2D();   // the clavi of his tunic
    g.fillStyle = C.redD; for (const x of [.035, .075]) g.fillRect(x, -.8, .014, .74);   // the clavi: two narrow stripes down the tunic
    g.restore(); }
  { const rb = rng(8); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(246,238,220,${.05 + .12 * rb()})`; g.fillRect(PX0 + rb() * (PX1 - PX0), PY0 + rb() * (PY1 - PY0), 2 + rb() * 5, 1 + rb() * 3); } }   // chalky bloom of the lime
  g.restore();   // end of the picture's clip
  { const t = canvas(PW, PH), tg = t.getContext('2d'); tg.filter = 'blur(1.2px)'; tg.drawImage(fr, 0, 0); g.globalAlpha = .7; g.drawImage(t, 0, 0); g.globalAlpha = 1; }   // the paint sinks into the wet lime: edges a little soft

  // ---- the wall as an object: plaster grain, faded edges, hairline cracks, flaked places; a height field for the raking light ----
  const SC = 3, HW = Math.ceil(PW / SC), HH = Math.ceil(PH / SC), hc = canvas(HW, HH), hg = hc.getContext('2d');   // the height field at one third
  { const im = hg.createImageData(HW, HH), d = im.data, r = rng(5);
    for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) { const v = 128 + 26 * (noise(x * .05, y * .05) - .5) + 14 * (noise(x * .2, y * .2) - .5) + 18 * (r() - .5), i = (y * HW + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    hg.putImageData(im, 0, 0); }
  const r = rng(77);
  // flaked places: the paint gone to bare grey-beige plaster, a raised rim of paint round each
  const flakes = [[380, 1500, 40], [1760, 1600, 15], [2200, 1300, 24], [1735, 1545, 11], [2700, 1200, 26]];   // none on the black dado (the words pass over it)
  for (const [fx, fy, R] of flakes) { const pts = []; for (let i = 0; i < 30; i++) { const a = i / 30 * 6.283, rr = R * (.7 + .3 * Math.sin(a * 2 + fx) + .25 * r()); pts.push([fx + Math.cos(a) * rr * 1.25, fy + Math.sin(a) * rr]); }
    const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(...q) : p.moveTo(...q)); p.closePath();
    g.save(); g.filter = 'blur(2.5px)'; g.fillStyle = 'rgba(166,150,128,.85)'; g.fill(p); g.filter = 'none'; g.clip(p); for (let i = 0; i < 24; i++) { g.fillStyle = `rgba(${r() < .5 ? '128,114,96' : '190,178,158'},${.15 + .15 * r()})`; g.beginPath(); g.arc(fx + (r() - .5) * R * 2.2, fy + (r() - .5) * R * 1.6, 2 + r() * 5, 0, 6.283); g.fill(); } g.restore();
    hg.save(); hg.scale(1 / SC, 1 / SC); hg.filter = 'blur(2px)'; hg.fillStyle = 'rgba(100,100,100,.5)'; hg.fill(p); hg.restore(); }
  // hairline cracks: wandering lines, dark in the paint and low in the height field
  const keep = (x, y) => y > 1985 || (x > 1120 && x < 1720 && y > 1080 && y < 1700) || (x > 1560 && x < 2000 && y > 1000 && y < 1500);   // the dado stays clean too   // Peter, his hand, Cornelius and the faces stay whole
  for (let k = 0, tries = 0; k < 18 && tries < 200; k++, tries++) { let x = r() * PW, y = r() * PH, a = r() * 6.283; if (keep(x, y)) { k--; continue; } const pts = [[x, y]]; for (let i = 0; i < 60; i++) { a += (r() - .5) * .7; const nx = x + Math.cos(a) * 14, ny = y + Math.sin(a) * 14; if (keep(nx, ny)) break; x = nx; y = ny; pts.push([x, y]); if (r() < .04) { const b = a + (r() < .5 ? 1 : -1) * 1.1; let bx = x, by = y; g.beginPath(); g.moveTo(bx, by); for (let j = 0; j < 12; j++) { bx += Math.cos(b) * 12; by += Math.sin(b) * 12; g.lineTo(bx, by); } g.strokeStyle = 'rgba(52,36,26,.4)'; g.lineWidth = 1.5; g.stroke(); } }
    g.strokeStyle = 'rgba(52,36,26,.55)'; g.lineWidth = 2.2; g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(...q) : g.moveTo(...q)); g.stroke();
    hg.save(); hg.scale(1 / SC, 1 / SC); hg.strokeStyle = 'rgba(80,80,80,.6)'; hg.lineWidth = 4; hg.beginPath(); pts.forEach((q, i) => i ? hg.lineTo(...q) : hg.moveTo(...q)); hg.stroke(); hg.restore(); }
  // pigment worn: soft pale patches, and the colours fade toward the edges of the wall
  for (let i = 0; i < 150; i++) { const x = r() * PW, y = 360 + r() * 1600, R = 30 + 150 * r(), gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, `rgba(236,226,204,${.08 + .16 * r()})`); gr.addColorStop(1, 'rgba(236,226,204,0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R); }
  { const gr = g.createRadialGradient(PW * .5, PH * .48, PW * .3, PW * .5, PH * .5, PW * .78); gr.addColorStop(0, 'rgba(232,222,200,0)'); gr.addColorStop(1, 'rgba(232,222,200,.55)'); g.fillStyle = gr; g.fillRect(0, 0, PW, PH); }
  // the raking-light shading of the height field (light from the left, low over the surface)
  const shadeC = canvas(HW, HH); { const sg = shadeC.getContext('2d'), hd = hg.getImageData(0, 0, HW, HH).data, im = sg.createImageData(HW, HH), d = im.data;
    const h = (x, y) => hd[((Math.max(0, Math.min(HH - 1, y)) * HW + Math.max(0, Math.min(HW - 1, x))) << 2)];
    for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) { const sx = h(x - 1, y) - h(x + 1, y), sy = h(x, y - 1) - h(x, y + 1), v = 128 + (sx * 1.0 + sy * .35) * 2.2, i = (y * HW + x) * 4; d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, v)); d[i + 3] = 255; }
    sg.putImageData(im, 0, 0); }
  // two lightings of the same wall: in the room's shade, and in the raking morning sun
  const mk = (tint, rake, lift) => { const c = canvas(PW, PH), x = c.getContext('2d'); x.drawImage(fr, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = tint; x.fillRect(0, 0, PW, PH);
    x.globalCompositeOperation = 'overlay'; x.globalAlpha = rake; x.imageSmoothingEnabled = true; x.drawImage(shadeC, 0, 0, PW, PH); x.globalAlpha = 1;
    if (lift) { x.globalCompositeOperation = 'screen'; x.fillStyle = lift; x.fillRect(0, 0, PW, PH); } x.globalCompositeOperation = 'source-over'; return c; };
  CFR.shade = mk('rgb(158,152,150)', .4, null);
  CFR.sun = mk('rgb(222,200,170)', .9, null);
  CFR.PW = PW; CFR.PH = PH; CFR.faces = [PETER.X, PETER.Y - .42 * PETER.s];
  { const gc = canvas(256, 256), x = gc.getContext('2d'), im = x.createImageData(256, 256), rr = rng(91); for (let i = 0; i < 65536; i++) { const v = 128 + (rr() - .5) * 110; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); CFR.grain = gc; }
}

// the wall seen at an angle: each vertical strip of the plate drawn at its own depth (so its bands converge toward the far end)
function frescoWall(ctx, src, cam, N = 720) {
  const W = Pilot.W, H = Pilot.H, { PW, PH } = CFR, ct = Math.cos(cam.th), st = Math.sin(cam.th), edge = [];
  for (let i = 0; i < N; i++) { const p0 = i * PW / N, p1 = (i + 1) * PW / N, x0 = (p0 - cam.pc) * ct, z0 = cam.D + (p0 - cam.pc) * st, x1 = (p1 - cam.pc) * ct, z1 = cam.D + (p1 - cam.pc) * st;
    if (z0 <= 50 || z1 <= 50) continue; const s0 = W / 2 + cam.F * x0 / z0, s1 = W / 2 + cam.F * x1 / z1; if (s1 < -4 || s0 > W + 4) continue;
    const sc = cam.F / ((z0 + z1) / 2), top = H / 2 - cam.pyc * sc, bot = top + PH * sc; ctx.drawImage(src, p0, 0, p1 - p0, PH, s0, top, s1 - s0 + .8, PH * sc);
    edge.push([s0, top, bot, sc]); if (i === N - 1 || s1 > W + 4) edge.push([s1, top, bot, sc]); }
  // the plain plaster and its cornice above the frieze, the floor below the dado: whole polygons (no seams between strips)
  if (edge.length > 1) { const fillPoly = (yA, yB, col) => { ctx.fillStyle = col; ctx.beginPath(); edge.forEach(([x, t, b2, k], j) => { const y = yA(t, b2, k); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); for (let j = edge.length - 1; j >= 0; j--) { const [x, t, b2, k] = edge[j]; ctx.lineTo(x, yB(t, b2, k)); } ctx.closePath(); ctx.fill(); };
    fillPoly(() => -10, (t) => t + .5, cam.lit ? '#cdbd9c' : '#8a7e6a'); fillPoly((t, b2, k) => t - 26 * k, (t) => t + .5, cam.lit ? '#a8987a' : '#4e463c');
    if (!cam.lit) { fillPoly((t, b2) => b2 - .5, () => H + 10, '#4a3c2e'); fillPoly((t, b2) => b2 - .5, (t, b2, k) => b2 + 14 * k, 'rgba(0,0,0,.4)'); } }
}
function corneliusFresco(ctx, u) {
  const { clamp, ss, rng, lerp } = Pilot, W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v'; u = clamp(u, 0, 4.7);
  // the camera slides along the wall and closes in a little (portrait: the people large, heads above 0.70 H)
  const k = Pilot.eio(clamp(u / 4.7)), F = 2400, sV = lerp(.5, 1.15, k), sH = lerp(.4, .6, k), cam = { th: lerp(.62, .5, k) * (V ? 1 : .85), pc: lerp(1500, V ? 1475 : 1450, k), D: F / (V ? sV : sH), F, pyc: V ? lerp(1180, 1262, k) : lerp(1120, 1150, k) };
  ctx.fillStyle = '#120d0a'; ctx.fillRect(0, 0, W, H);
  frescoWall(ctx, CFR.shade, cam);
  // the morning sun: a soft band raking across the wall from the left; from u ≈ 1.2 it moves on and comes to rest on the faces
  const m = ss(.9, 2.6, u), bx = lerp(.05, .52, m) * W, by = H * .44, ang = -1.05, nx = Math.cos(ang), ny = Math.sin(ang), wid = (V ? .55 : .42) * W;
  if (!CFR.lc || CFR.lc.width !== W) CFR.lc = Pilot.canvas(W, H); const lc = CFR.lc, lg = lc.getContext('2d');
  lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, W, H); frescoWall(lg, CFR.sun, { ...cam, lit: true });
  lg.globalCompositeOperation = 'destination-in'; { const gr = lg.createLinearGradient(bx - nx * wid, by - ny * wid, bx + nx * wid, by + ny * wid); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.3, 'rgba(0,0,0,.95)'); gr.addColorStop(.7, 'rgba(0,0,0,.95)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = gr; lg.fillRect(0, 0, W, H); }
  ctx.drawImage(lc, 0, 0);
  // dust turning in the sunlight
  { ctx.save(); ctx.globalCompositeOperation = 'screen'; const r = rng(41); for (let i = 0; i < 90; i++) { const x0 = r() * W, y0 = r() * H, x = x0 + Math.sin(u * .5 + i) * 14, y = y0 - u * 12 * (r() + .2), d = Math.abs((x - bx) * nx + (y - by) * ny) / wid, a = clamp(1 - d * 1.4) * (.15 + .35 * r());
      if (a <= .01) continue; ctx.fillStyle = `rgba(255,238,210,${a})`; ctx.beginPath(); ctx.arc(x, y, .8 + r() * 1.6, 0, 6.283); ctx.fill(); } ctx.restore(); }
  // the far end of the wall falls into the room's dark; a soft vignette; grain
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  { const y0 = H * (V ? .6 : .66), y1 = H * (V ? .9 : 1), gr = ctx.createLinearGradient(0, y0, 0, y1); const dk = .45 + .55 * k, v1 = 255 - (255 - 150) * dk | 0, v2 = 255 - (255 - 130) * dk | 0; gr.addColorStop(0, '#fff'); gr.addColorStop(.45, `rgb(${v1},${v1 - 10},${v1 - 18})`); gr.addColorStop(1, `rgb(${v2},${v2 - 10},${v2 - 18})`); ctx.fillStyle = gr; ctx.fillRect(0, y0, W, H - y0); }   // the floor under the words in shade (more as the camera comes onto the painted floor)
  { const gr = ctx.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, 'rgb(230,224,220)'); gr.addColorStop(.6, '#fff'); gr.addColorStop(1, 'rgb(150,140,134)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  { const R = Math.hypot(W, H) * .62, gr = ctx.createRadialGradient(W * .5, H * .45, R * .38, W / 2, H * .46, R); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(150,136,124)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .06; const o = Math.floor(u * 24); ctx.translate(-((o * 73) % 256), -((o * 151) % 256)); ctx.fillStyle = ctx.createPattern(CFR.grain, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}
