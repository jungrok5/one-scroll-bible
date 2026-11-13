/* fresco-cornelius.js — 「그리스도」 N20 (film 119.9–125.0 s, u = 0..5.1): "'그리 마옵소서' 하던 베드로가 / 훗날 전한 말."
   Acts 10:24–27, the house of Cornelius at Caesarea. 6차 (관리자 이상 확인 5차 MINOR "테두리 선 있는 벽화풍 평면 그림이라 일러스트에
   가깝다 · 문으로 든 아침빛이 거의 안 보인다 · 베드로가 흰 옷·수염 없음"): no longer a painting of the scene — we are IN the room, and the
   room is a Roman one, its walls painted in the Pompeian manner (black dado, cinnabar panels with thin ochre frames, ivory intervals with
   slender painted candelabra, an ivory upper zone; a beamed ceiling; an opus signinum floor of red mortar set with white tesserae).
   The light is the main character: low morning sun comes through the open door in the back wall (left), lays a long warm pool across
   the floor toward us, a shaft of it hangs in the air with dust turning in it. Peter stands in the light at its edge, speaking, his
   open hand toward the listeners; they sit and stand in the half-dark beside it, their faces turned to him and lit from the pool.
   Peter is the Peter of part 3 (RD_PETER in road-pastel.js: the broadest, madder robe, ochre head cloth tied with a dark band ending
   at the shoulders, black beard). All are men: Cornelius a Roman (short hair, clean-shaven, a cinnabar cloak over a short tunic, bare
   shins and sandals), the others with head cloths or short hair and beards. No outlines: every figure is a shape lit by the light
   (a key from the light's side, a soft rim on the edges that face it, bounce from the floor), volume from shading, grain over all.
   The light grows a little from u ≈ 0.3 (as if a cloud moved off the sun); the camera creeps in and slides right (parallax: the room
   a little slower than the people). Portrait: heads and upper bodies above F.SAFE (0.64 H); legs and floor under the words.
   No words are drawn. Closed form: corneliusFresco(ctx, u) depends only on u. API: await buildCorneliusFresco() · corneliusFresco(ctx, u) */
const CFR = {};
// the room in metres, seen by a camera 1.5 m above the floor: X right, Y up, D depth; world px = portrait screen px at zoom 1
const CF = { F: 1000, E: 1.5, YH: 700, CX: 540, DW: 6, XL: -4.6, XR: 5.2, DX0: -3.3, DX1: -1.4, DH: 2.8, tanE: .66, hx: .42, hz: .91, OX: 700, OY: 100, RW: 2500, RH: 2400,
  PX: -260, PY: 380, PWW: 1980, PHH: 1640 };   // the people's plate: world x -260.., y 380..
const cfP = (X, Y, D) => [CF.CX + CF.F * X / D, CF.YH + CF.F * (CF.E - Y) / D];
const cfSun = (X, Y, D) => { const t = Y / CF.tanE; return [X + t * CF.hx, Math.max(.35, D - t * CF.hz)]; };   // where the sun through (X, Y, D) lands on the floor
const cfCirc = (cx, cy, rx, ry, n = 14, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * 6.283, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
function cfCaps(a, b, w0, w1, n = 5) {   // a capsule from a to b as a polygon (so any map P can take it)
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), pts = [];
  for (let i = 0; i <= n; i++) { const t = ang - Math.PI / 2 + Math.PI * i / n; pts.push([b[0] + Math.cos(t) * w1, b[1] + Math.sin(t) * w1]); }
  for (let i = 0; i <= n; i++) { const t = ang + Math.PI / 2 + Math.PI * i / n; pts.push([a[0] + Math.cos(t) * w0, a[1] + Math.sin(t) * w0]); }
  return pts;
}
function cfIK(s, t, a, b, bend) {
  const dx = t[0] - s[0], dy = t[1] - s[1], dd = Math.hypot(dx, dy), d = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, dd)), ang = Math.atan2(dy, dx);
  const c = (a * a + d * d - b * b) / (2 * a * d), e = ang + bend * Math.acos(Math.max(-1, Math.min(1, c)));
  const el = [s[0] + Math.cos(e) * a, s[1] + Math.sin(e) * a], k = d / (dd || 1); return { el, wr: [s[0] + dx * k, s[1] + dy * k] };
}
// a man in units of his height (feet at the origin, y up negative), drawn through a map P(x, y) → px; the same build as rdPerson in
// road-pastel.js (square shoulders, a belted robe falling straight, a head cloth ending at the shoulders with a dark band round the brow,
// or short hair; a beard), seen three-quarter toward f (+1 right, -1 left). pose 'sit': the upper body comes down onto a bench, the thighs
// forward, the shins down. arms: [back, front] each 'hang' · 'knee' (hand on the knee) · 'clasp' (elbows on the knees) · 'open' (the
// hand held out, palm up). Parts: q = the whole silhouette; band (belt), cloak, arm (sleeves), skin, face, hair (and beard), hc (head
// cloth), hband (its band).
function cfMan(P, o) {
  const { w = 1, f = 1, lean: l = 0, pose = 'stand', head = 'cloth', beard = true, arms = ['hang', 'hang'], tunic = 'long', cloak = false } = o;
  const sit = pose === 'sit', dz = sit ? .2 : 0, piv = sit ? -.5 : 0;
  const q = new Path2D(), pt = {}; for (const k of ['band', 'cloak', 'arm', 'skin', 'face', 'hair', 'hc', 'hband']) pt[k] = new Path2D();
  const add = (pts, ...to) => { pts = pts.map(([x, y]) => P(x * f, y)); let a = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; } if (a < 0) pts.reverse();
    const n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
    for (const t of [q, ...to]) { t.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) t.quadraticCurveTo(pts[i][0], pts[i][1], ...m(i)); t.closePath(); } };
  const U = (x, y) => [x + l * (piv - y), y + dz];
  // legs, feet and the robe
  if (!sit) {
    for (const sd of [-1, 1]) { add(cfCaps([sd * .04, -.36], [sd * .04, -.02], .036, .03)); add(cfCirc(sd * .04 + .02, -.012, .05, .022, 10)); }
    add([[0, -.035], [-.168 * w, -.045], U(-.162 * w, -.26), U(-.145 * w, -.5), U(-.162 * w, -.62), U(-.178 * w, -.715), U(-.182 * w, -.752), U(-.165 * w, -.788), U(-.115 * w, -.808), U(-.05, -.83),
      U(.05, -.83), U(.115 * w, -.808), U(.165 * w, -.788), U(.182 * w, -.752), U(.178 * w, -.715), U(.162 * w, -.62), U(.145 * w, -.5), U(.162 * w, -.26), [.168 * w, -.045]]);
  } else {
    const up = [U(-.145 * w, -.5), U(-.162 * w, -.62), U(-.178 * w, -.715), U(-.182 * w, -.752), U(-.165 * w, -.788), U(-.115 * w, -.808), U(-.05, -.83), U(.05, -.83), U(.115 * w, -.808), U(.165 * w, -.788), U(.182 * w, -.752), U(.178 * w, -.715), U(.162 * w, -.62), U(.145 * w, -.52)];
    if (tunic === 'short') {   // a soldier's tunic to the knee: bare shins, sandals
      for (const kx of [.28, .33]) add(cfCaps([kx, -.27], [kx - .01, -.035], .026, .022), pt.skin);
      add(cfCirc(.29, -.016, .05, .02, 10), pt.band); add(cfCirc(.345, -.014, .055, .021, 10), pt.band);
      add([...up, [.24, -.335], [.33, -.322], [.365, -.27], [.3, -.232], [.12, -.236], [-.1, -.236], [-.16 * w, -.25]]);
    } else {
      add(cfCirc(.29, -.016, .05, .02, 10)); add(cfCirc(.345, -.014, .055, .021, 10));
      add([...up, [.24, -.335], [.33, -.322], [.352, -.27], [.335, -.1], [.36, -.035], [.19, -.035], [.205, -.2], [.12, -.236], [-.1, -.236], [-.16 * w, -.25]]);
    }
  }
  add([U(-.15 * w, -.54), U(.15 * w, -.54), U(.152 * w, -.497), U(-.152 * w, -.497)], pt.band);   // the belt
  if (!sit) add([U(.05 * w, -.505), U(.085 * w, -.5), U(.08 * w, -.39), U(.058 * w, -.39)], pt.band);   // its end hanging
  if (cloak) {   // the cloak: from the shoulders down the back to the bench, a fold over the near shoulder, a fall over the lap
    add([U(-.175 * w, -.8), U(-.05, -.838), U(.05, -.81), U(-.04, -.66), U(-.09, -.52), [-.11, -.25], [-.215 * w, -.245], U(-.21 * w, -.5), U(-.205 * w, -.7)], pt.cloak);
    add([U(.03, -.835), U(.168 * w, -.792), U(.19 * w, -.69), U(.1, -.73)], pt.cloak);
  }
  // arms (sleeves) and hands
  for (const [i, sd] of [[0, -1], [1, 1]]) { const mode = arms[i], sh = U(sd * .148 * w, -.745);
    let tg, bend = -sd;
    if (mode === 'knee') { tg = [sd > 0 ? .22 : .16, -.36]; bend = 1; }
    else if (mode === 'clasp') { tg = [.25, -.43 + (sd > 0 ? 0 : .01)]; bend = 1; }
    else if (mode === 'open') { tg = U(.29 * w, -.57); bend = 1; }
    else tg = U(sd * .18 * w, -.405);
    const a = cfIK(sh, tg, .18, .172, bend); add(cfCaps(sh, a.el, .052, .046), pt.arm); add(cfCaps(a.el, a.wr, .046, .038), pt.arm);
    if (mode === 'open') { const d = Math.atan2(a.wr[1] - a.el[1], a.wr[0] - a.el[0]), c = [a.wr[0] + Math.cos(d) * .04, a.wr[1] + Math.sin(d) * .04 - .006];
      add(cfCirc(c[0], c[1], .05, .019, 12, d - .12), pt.skin); add(cfCaps([a.wr[0] + .012, a.wr[1] - .012], [a.wr[0] + .036, a.wr[1] - .046], .011, .009), pt.skin); }   // the open hand, palm up, the thumb raised
    else add(cfCirc(a.wr[0], a.wr[1] + .012, .028, .034, 10), pt.skin); }
  // the head: neck, face (on the side he looks to), short hair or the head cloth and its band, the beard
  const [hx, hy0] = U(.012, -.9), fcx = hx + .026;
  add([[hx - .034, hy0 + .045], [hx + .034, hy0 + .045], [hx + .036, hy0 + .085], [hx - .036, hy0 + .085]], pt.skin);
  add(cfCirc(fcx, hy0 + .006, .052, .064), pt.face); add([[fcx + .044, hy0 - .008], [fcx + .068, hy0 + .016], [fcx + .046, hy0 + .03]], pt.face);
  if (head === 'cloth') {
    add(cfCirc(hx - .01, hy0 - .014, .076, .07), pt.hc);
    for (const sd of [-1, 1]) add([[hx + sd * .08, hy0 - .03], [fcx + sd * .043, hy0 - .032], [fcx + sd * .048, hy0 + .07], [fcx + sd * .062, hy0 + .108], [hx + sd * .122, hy0 + .114], [hx + sd * .098, hy0 + .03]], pt.hc);
    add([[hx - .08, hy0 - .05], [hx, hy0 - .062], [hx + .08, hy0 - .05], [hx + .081, hy0 - .028], [hx, hy0 - .04], [hx - .081, hy0 - .028]], pt.hband);
  } else {   // short hair: a cap over the top and back of the head, the back ear
    add(cfCirc(hx - .06, hy0 + .01, .014, .022, 8), pt.skin);
    add([[hx - .062, hy0 - .02], [hx - .066, hy0 - .03], [hx - .04, hy0 - .066], [hx, hy0 - .074], [hx + .04, hy0 - .066], [hx + .066, hy0 - .03], [hx + .062, hy0 + .01], [fcx + .04, hy0 - .03], [fcx - .04, hy0 - .03]], pt.hair);
  }
  if (beard) add([[fcx - .05, hy0 + .004], [fcx - .046, hy0 + .058], [fcx + .02, hy0 + .102], [fcx + .046, hy0 + .058], [fcx + .05, hy0 + .004], [fcx + .024, hy0 + .032], [fcx - .024, hy0 + .032]], pt.hair);
  return Object.assign(q, pt);
}

async function buildCorneliusFresco() {
  const { clamp, lerp, rng, canvas, noise, hex } = Pilot, { OX, OY, RW, RH, XL, XR, DX0, DX1, DH } = CF;
  const px = (X, D = CF.DW) => cfP(X, 0, D)[0], py = (Y, D = CF.DW) => cfP(0, Y, D)[1];
  const poly = (g, pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  // ---------------- the room's colours (albedo), then its light ----------------
  const room = canvas(RW, RH), g = room.getContext('2d'); g.translate(OX, OY);
  const wallL = px(XL), wallR = px(XR), wTop = py(4.2), wBot = py(0);
  g.fillStyle = '#7e6c58'; g.fillRect(-OX, -OY, RW, wTop + OY);                       // the ceiling plaster
  g.fillStyle = '#86503a'; g.fillRect(-OX, wBot, RW, RH - wBot - OY);                  // the floor
  const floorPoly = [cfP(XL, 0, CF.DW), cfP(XR, 0, CF.DW), cfP(XR, 0, .6), cfP(XL, 0, .6)];
  const drawFloor = (x) => {   // opus signinum: red mortar, white tesserae in a lattice, mottled
    x.save(); poly(x, floorPoly); x.clip(); x.fillStyle = '#86503a'; x.fill();
    const r = rng(12); for (let i = 0; i < 70; i++) { const X = lerp(XL, XR, r()), D = lerp(1, CF.DW, r()), [cx, cy] = cfP(X, 0, D), R = 900 * (.3 + r() * .7) / D;
      const gr = x.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, r() < .5 ? 'rgba(160,96,64,.35)' : 'rgba(90,48,32,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.save(); x.translate(cx, cy); x.scale(1, 1.5 / D + .15); x.translate(-cx, -cy); x.fillRect(cx - R, cy - R, 2 * R, 2 * R); x.restore(); }
    const rt = rng(21), st = .3; let row = 0;
    for (let D = CF.DW - .05; D > .9; D -= st * .5, row++) for (let X = XL + (row % 2) * st / 2; X < XR; X += st) {   // set by hand: not quite in line, not all the same
      const [cx, cy] = cfP(X + (rt() - .5) * .05, 0, D + (rt() - .5) * .04), rx = 1000 * (.009 + .006 * rt()) / D, ry = rx * CF.E / Math.hypot(D, CF.E);
      x.fillStyle = `rgba(222,208,182,${.28 + .3 * rt()})`; x.beginPath(); x.ellipse(cx, cy, rx, ry, (rt() - .5) * .6, 0, 6.283); x.fill(); }
    // a meander band of tesserae along the back wall
    for (let X = XL; X < XR; X += .12) for (const D of [CF.DW - .28, CF.DW - .22]) { const [cx, cy] = cfP(X, 0, D), rx = 1000 * .016 / D; x.fillStyle = 'rgba(222,208,182,.4)'; x.beginPath(); x.ellipse(cx, cy, rx, rx * .3, 0, 0, 6.283); x.fill(); }
    x.restore(); };
  drawFloor(g);
  // the side walls (landscape sees their near corners)
  for (const X of [XL, XR]) { g.fillStyle = '#7e2a1e'; poly(g, [cfP(X, 0, CF.DW), cfP(X, 4.2, CF.DW), cfP(X, 4.2, 1.2), cfP(X, 0, 1.2)]); g.fill();
    g.fillStyle = '#1e1814'; poly(g, [cfP(X, 0, CF.DW), cfP(X, .95, CF.DW), cfP(X, .95, 1.2), cfP(X, 0, 1.2)]); g.fill();
    g.fillStyle = '#c4ae84'; poly(g, [cfP(X, 3.4, CF.DW), cfP(X, 4.2, CF.DW), cfP(X, 4.2, 1.2), cfP(X, 3.4, 1.2)]); g.fill(); }
  // the back wall: dado · main zone (cinnabar panels, ivory intervals) · cornice · upper zone
  g.fillStyle = '#cdb488'; g.fillRect(wallL, wTop, wallR - wallL, py(3.4) - wTop);                      // the upper zone
  g.fillStyle = '#e2d4b4'; g.fillRect(wallL, py(3.4), wallR - wallL, py(3.25) - py(3.4));               // the stucco cornice
  g.fillStyle = '#a08458'; g.fillRect(wallL, py(3.25) - 3, wallR - wallL, 3);
  g.fillStyle = '#1f1915'; g.fillRect(wallL, py(.95), wallR - wallL, wBot - py(.95));                    // the black dado
  g.fillStyle = '#8c2a1c'; g.fillRect(wallL, py(.95), wallR - wallL, 5);
  const zone = [py(3.25), py(.95)], panel = (X0, X1) => { const x0 = px(X0), x1 = px(X1), [y0, y1] = zone;
      g.fillStyle = '#9a3022'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.strokeStyle = 'rgba(222,190,124,.75)'; g.lineWidth = 3; g.strokeRect(x0 + 16, y0 + 16, x1 - x0 - 32, y1 - y0 - 32);   // painted frame lines on the plaster
      g.strokeStyle = 'rgba(236,224,196,.35)'; g.lineWidth = 1.5; g.strokeRect(x0 + 24, y0 + 24, x1 - x0 - 48, y1 - y0 - 48);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; g.fillStyle = 'rgba(214,176,108,.55)'; g.beginPath(); g.ellipse(cx, cy, 13, 22, 0, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(232,212,170,.4)'; g.beginPath(); g.ellipse(cx - 3, cy - 6, 5, 8, 0, 0, 6.283); g.fill();
      g.strokeStyle = 'rgba(214,176,108,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 16, y1 + 2); g.lineTo(x0 + 16, wBot - 8); g.moveTo(x1 - 16, y1 + 2); g.lineTo(x1 - 16, wBot - 8); g.stroke(); },
    interval = (X0, X1) => { const x0 = px(X0), x1 = px(X1), [y0, y1] = zone, cx = (x0 + x1) / 2;
      g.fillStyle = '#d6c49c'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.strokeStyle = 'rgba(176,128,66,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, y0 + 30); g.lineTo(cx, y1 - 10); g.stroke();   // a slender painted candelabrum
      g.fillStyle = 'rgba(176,128,66,.7)'; for (const k of [.18, .42, .66]) { g.beginPath(); g.ellipse(cx, lerp(y0, y1, k), 12, 3.5, 0, 0, 6.283); g.fill(); }
      g.fillStyle = 'rgba(120,140,96,.55)'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(cx + sd * 12, lerp(y0, y1, .3), 9, 4, sd * .5, 0, 6.283); g.fill(); }
      g.strokeStyle = 'rgba(150,60,40,.45)'; g.lineWidth = 2; g.strokeRect(x0 + 8, y0 + 8, x1 - x0 - 16, y1 - y0 - 16); };
  panel(XL, DX0 - .12);
  [[DX1 + .12, -.9, 0], [-.9, .4, 1], [.4, .9, 0], [.9, 2.2, 1], [2.2, 2.7, 0], [2.7, 4.0, 1], [4.0, 4.5, 0], [4.5, XR, 1]].forEach(([a, b, p]) => p ? panel(a, b) : interval(a, b));
  { g.strokeStyle = 'rgba(150,96,52,.5)'; g.lineWidth = 2; for (let X = XL + .3; X < XR; X += .55) { const x = px(X); g.beginPath(); g.moveTo(x, wTop + 10); g.lineTo(x, py(3.4) - 8); g.stroke(); }   // the upper zone's thin painted architecture
    g.beginPath(); g.moveTo(wallL, wTop + 30); g.lineTo(wallR, wTop + 30); g.stroke(); }
  // the beamed ceiling: a wall plate along the top, beams running toward us
  g.fillStyle = '#3e2a1c'; g.fillRect(wallL, py(4.5), wallR - wallL, wTop - py(4.5));
  for (let X = -4.1; X < 5; X += 1.0) { g.fillStyle = '#3a2a1e'; poly(g, [cfP(X - .11, 4.5, CF.DW), cfP(X - .11, 4.5, 1), cfP(X - .11, 4.22, 1), cfP(X - .11, 4.22, CF.DW)]); g.fill();
    g.fillStyle = '#4e3a2a'; poly(g, [cfP(X - .11, 4.22, CF.DW), cfP(X + .11, 4.22, CF.DW), cfP(X + .11, 4.22, 1), cfP(X - .11, 4.22, 1)]); g.fill(); }
  g.fillStyle = '#3e2a1c'; g.fillRect(wallL, py(4.2), wallR - wallL, 6);
  // the door: a dark wooden frame round the opening (the opening itself is painted after the light)
  const dx0 = px(DX0), dx1 = px(DX1), dy0 = py(DH);
  g.fillStyle = '#34241a'; g.fillRect(dx0 - 24, dy0 - 26, dx1 - dx0 + 48, wBot - dy0 + 26); g.fillStyle = '#4a3222'; g.fillRect(dx0 - 24, dy0 - 26, dx1 - dx0 + 48, 8);
  // plaster: grain and blotches over walls and floor, a few hairline cracks, worn patches
  { const NW = RW >> 1, NH = RH >> 1, nc = canvas(NW, NH), nx = nc.getContext('2d'), im = nx.createImageData(NW, NH), d = im.data, r = rng(5);
    for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) { const v = 128 + 34 * (noise(x * .02, y * .02) - .5) + 18 * (noise(x * .09, y * .09) - .5) + 16 * (r() - .5), i = (y * NW + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    nx.putImageData(im, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .5; g.drawImage(nc, 0, 0, RW, RH); g.restore(); }
  { const r = rng(77); g.lineCap = 'round';
    for (let k = 0; k < 9; k++) { let x = lerp(wallL, wallR, r()), y = lerp(wTop + 20, py(1), r()), a = r() * 6.283; if (x > dx0 - 40 && x < dx1 + 40) continue; g.strokeStyle = 'rgba(46,30,22,.32)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y);
      for (let i = 0; i < 40; i++) { a += (r() - .5) * .8; x += Math.cos(a) * 6; y += Math.sin(a) * 6; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 70; i++) { const x = lerp(wallL, wallR, r()), y = lerp(wTop, wBot, r()), R = 20 + 70 * r(), gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, `rgba(230,214,186,${.06 + .1 * r()})`); gr.addColorStop(1, 'rgba(230,214,186,0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R); } }
  // the room's own light (no sun yet): dim, warmer and brighter near the door and the floor it lights, darker toward the far right
  { const lm = canvas(RW, RH), lx = lm.getContext('2d'); lx.translate(OX, OY); lx.fillStyle = 'rgb(162,146,132)'; lx.fillRect(-OX, -OY, RW, RH);
    lx.globalCompositeOperation = 'lighter';
    for (const [cx, cy, R, c] of [[300, 1090, 1050, 'rgba(110,80,50,1)'], [165, 720, 560, 'rgba(84,60,36,1)'], [380, 950, 460, 'rgba(70,48,28,1)']]) { const gr = lx.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); lx.fillStyle = gr; lx.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
    lx.globalCompositeOperation = 'multiply'; const gr = lx.createLinearGradient(-OX, 0, RW - OX, 0); gr.addColorStop(0, '#fff'); gr.addColorStop(.45, '#fff'); gr.addColorStop(1, 'rgb(170,160,156)'); lx.fillStyle = gr; lx.fillRect(-OX, -OY, RW, RH);
    const gv = lx.createLinearGradient(0, -OY, 0, 400); gv.addColorStop(0, 'rgb(150,140,136)'); gv.addColorStop(1, '#fff'); lx.fillStyle = gv; lx.fillRect(-OX, -OY, RW, 500);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(lm, 0, 0); g.restore(); }
  // the opening: the bright morning outside — a portico's pale columns, the garden beyond, all burnt out by the sun
  { g.save(); g.beginPath(); g.rect(dx0, dy0, dx1 - dx0, wBot - dy0); g.clip();
    let gr = g.createLinearGradient(0, dy0, 0, wBot); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(.7, '#fff3da'); gr.addColorStop(1, '#ffe8c0'); g.fillStyle = gr; g.fillRect(dx0, dy0, dx1 - dx0, wBot - dy0);
    g.fillStyle = 'rgba(214,196,150,.45)'; g.fillRect(dx0, wBot - 70, dx1 - dx0, 70);                         // the garden, a pale band
    for (let x = dx0 + 22; x < dx1; x += 78) { gr = g.createLinearGradient(x, 0, x + 18, 0); gr.addColorStop(0, 'rgba(226,206,168,.75)'); gr.addColorStop(1, 'rgba(246,232,206,.5)'); g.fillStyle = gr; g.fillRect(x, dy0 + 34, 18, wBot - dy0 - 70); }   // the portico's columns
    g.fillStyle = 'rgba(232,214,178,.6)'; g.fillRect(dx0, dy0 + 22, dx1 - dx0, 16);
    g.fillStyle = 'rgba(176,150,112,.85)'; poly(g, [[dx0, dy0], [px(DX0, CF.DW + .4), py(DH, CF.DW + .4)], [px(DX0, CF.DW + .4), py(0, CF.DW + .4)], [dx0, wBot]]); g.fill();   // the left jamb's inner face, in shade
    g.fillStyle = 'rgba(150,126,92,.85)'; poly(g, [[dx0, dy0], [dx1, dy0], [px(DX1, CF.DW + .4), py(DH, CF.DW + .4)], [px(DX0, CF.DW + .4), py(DH, CF.DW + .4)]]); g.fill();   // the lintel's underside
    g.fillStyle = 'rgba(255,236,200,.9)'; poly(g, [[px(DX0, CF.DW + .4), py(0, CF.DW + .4)], [px(DX1, CF.DW + .4), py(0, CF.DW + .4)], [dx1, wBot], [dx0, wBot]]); g.fill();   // the sunlit threshold
    g.fillStyle = 'rgba(255,250,240,.35)'; g.fillRect(dx0, dy0, dx1 - dx0, wBot - dy0); g.restore(); }
  { g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(18px)'; const gr = g.createLinearGradient(0, wBot, 0, wBot + 420); gr.addColorStop(0, 'rgba(255,214,160,.32)'); gr.addColorStop(1, 'rgba(255,214,160,0)'); g.fillStyle = gr;   // the door's sheen on the polished floor
    poly(g, [[dx0 + 10, wBot], [dx1 - 10, wBot], [dx1 + 40, wBot + 420], [dx0 - 40, wBot + 420]]); g.fill(); g.restore(); }
  { const rb = canvas(RW, RH), x = rb.getContext('2d'); x.filter = 'blur(1.3px)'; x.drawImage(room, 0, 0); CFR.room = rb; }   // the room a touch out of focus behind the people
  // ---------------- the people ----------------
  const PP = { X: CF.PX, Y: CF.PY }, peo = canvas(CF.PWW, CF.PHH), lit = canvas(CF.PWW, CF.PHH), tmp = canvas(CF.PWW, CF.PHH);
  const gB = peo.getContext('2d'), gL = lit.getContext('2d'), gT = tmp.getContext('2d'); for (const x of [gB, gL, gT]) x.translate(-PP.X, -PP.Y);
  let AMB = [.6, .52, .47]; const tone = (c, k = 1) => { const a = hex(c); return `rgb(${a[0] * AMB[0] * k | 0},${a[1] * AMB[1] * k | 0},${a[2] * AMB[2] * k | 0})`; };
  const PE = (typeof RD_PETER !== 'undefined') ? RD_PETER : { body: '#7e4c44', hc: '#c9a06a', band: '#4a3426', hair: '#3a302c', w: 1.1 };   // part 3's Peter
  const MEN = [   // back to front. lt: [light travel x, y], rim, key, bounce from the floor
    { X: 2.7, D: 4.9, Hm: 1.74, o: { f: -1, w: 1, head: 'cloth', lean: .02 }, c: { body: '#5c4a3c', hc: '#b8a888', band: '#3e2e2c', hair: '#2e2420', skin: '#a07a60' }, lt: [[1, -.1], .22, .08, .03] },
    { X: 1.75, D: 4.6, Hm: 1.72, o: { f: -1, w: .98, head: 'hair', lean: .03 }, c: { body: '#4c5866', band: '#2e2a2a', hair: '#2a201c', skin: '#a8806a' }, lt: [[1, -.1], .26, .1, .04] },
    { X: .95, D: 4.3, Hm: 1.75, o: { f: -1, w: 1.02, head: 'cloth', lean: .04 }, c: { body: '#6e5238', hc: '#a6643e', band: '#3e2e2c', hair: '#2e2420', skin: '#a8806a' }, lt: [[1, -.12], .3, .12, .05] },
    { X: 1.55, D: 3.9, Hm: 1.75, o: { f: -1, w: 1, head: 'cloth', pose: 'sit', lean: .12, arms: ['clasp', 'clasp'] }, c: { body: '#5e6a4c', hc: '#b4a68a', band: '#4a3c30', hair: '#8e847a', skin: '#a8806a' }, lt: [[1, -.15], .32, .14, .05], bench: true },
    { X: .98, D: 3.6, Hm: 1.8, o: { f: -1, w: 1.04, head: 'hair', beard: false, pose: 'sit', lean: .06, arms: ['knee', 'knee'], tunic: 'short', cloak: true }, c: { body: '#6e5c44', cloak: '#9c2c20', band: '#3a2618', hair: '#2a1e18', skin: '#9c7258' }, lt: [[1, -.15], .36, .17, .06], bench: true },
    { X: -.3, D: 3.2, Hm: 1.8, peter: true, o: { f: 1, w: PE.w || 1.1, head: 'cloth', lean: .02, arms: ['hang', 'open'] }, c: { body: PE.body, hc: PE.hc, band: PE.band, hair: PE.hair, skin: '#b48a6e' }, lt: [[1, .42], .9, .2, .1] },
  ];
  const fill = (x, p, c) => {
    x.fillStyle = tone(c.body); x.fill(p); x.fillStyle = tone(c.band); x.fill(p.band);
    if (c.cloak) { x.fillStyle = tone(c.cloak); x.fill(p.cloak); }
    x.fillStyle = tone(c.body, .86); x.fill(p.arm);
    x.fillStyle = tone(c.skin); x.fill(p.skin); x.fillStyle = tone(c.skin, .74); x.fill(p.face);
    x.fillStyle = tone(c.hair); x.fill(p.hair);
    if (c.hc) { x.fillStyle = tone(c.hc); x.fill(p.hc); x.fillStyle = tone(c.band); x.fill(p.hband); } };
  for (const m of MEN) {
    const [fx, fy] = cfP(m.X, 0, m.D), S = CF.F * m.Hm / m.D, f = m.o.f, P = (x, y) => [fx + x * S, fy + y * S];
    const path = cfMan(P, m.o), box = [fx - .5 * S, fy - 1.02 * S, S, 1.06 * S];
    m.fx = fx; m.fy = fy; m.S = S;
    // its shadow on the floor (soft, a little toward us and right: the light comes from the door)
    gB.save(); gB.filter = `blur(${(.012 * S).toFixed(1)}px)`; gB.fillStyle = 'rgba(14,7,4,.5)'; gB.beginPath(); gB.ellipse(fx + f * (m.o.pose === 'sit' ? .14 : .02) * S + .03 * S, fy + .004 * S, .25 * S, .03 * S, 0, 0, 6.283); gB.fill(); gB.restore();
    let bench = null;
    if (m.bench) { bench = new Path2D(); const bx = (x, y) => P(x * f, y);
      for (const pts of [[[-.21, -.272], [.2, -.272], [.2, -.238], [-.21, -.238]], [[-.18, -.24], [-.15, -.24], [-.15, -.004], [-.18, -.004]], [[.15, -.24], [.18, -.24], [.18, -.004], [.15, -.004]]]) { const q = pts.map(p => bx(...p)); bench.moveTo(...q[0]); q.slice(1).forEach(p => bench.lineTo(...p)); bench.closePath(); }
      gB.fillStyle = tone('#5a3a24'); gB.fill(bench); }
    { const a = m.peter ? .56 : .46; AMB = [a, a * .87, a * .79]; } fill(gB, path, m.c);
    // volume: darker down the body and on the side away from the light
    { const [Lx, Ly] = m.lt[0], top = fy - S, cx = fx, cy = fy - .55 * S; gB.save(); gB.clip(path);
      let gr = gB.createLinearGradient(0, fy - .55 * S, 0, fy); gr.addColorStop(0, 'rgba(12,6,4,0)'); gr.addColorStop(1, 'rgba(12,6,4,.42)'); gB.fillStyle = gr; gB.fillRect(...box);
      gr = gB.createLinearGradient(cx - Lx * .22 * S, cy - Ly * .22 * S, cx + Lx * .22 * S, cy + Ly * .22 * S); gr.addColorStop(0, 'rgba(10,5,4,0)'); gr.addColorStop(1, 'rgba(10,5,4,.34)'); gB.fillStyle = gr; gB.fillRect(...box);
      { const rf = rng(Math.round(fx * 7)); for (let i = 0; i < 6; i++) { const xx = fx + (rf() - .5) * .28 * S, wd = (.012 + .022 * rf()) * S, g2 = gB.createLinearGradient(xx - wd, 0, xx + wd, 0);   // soft folds
        g2.addColorStop(0, 'rgba(10,5,4,0)'); g2.addColorStop(.5, `rgba(10,5,4,${.1 + .12 * rf()})`); g2.addColorStop(1, 'rgba(10,5,4,0)'); gB.fillStyle = g2; gB.fillRect(xx - wd, fy - (m.o.pose === 'sit' ? .5 : .74) * S, 2 * wd, (m.o.pose === 'sit' ? .48 : .72) * S); } }
      gr = gB.createLinearGradient(0, top, 0, top + .2 * S); gr.addColorStop(0, 'rgba(255,240,220,.05)'); gr.addColorStop(1, 'rgba(255,240,220,0)'); gB.fillStyle = gr; gB.fillRect(...box); gB.restore(); }
    // the light it catches (drawn later with the light's strength): first hide what is behind it
    gL.save(); gL.globalCompositeOperation = 'destination-out'; gL.fill(path); if (bench) gL.fill(bench); gL.restore();
    { const [Lx, Ly] = m.lt[0], [, rimA, keyA, bA] = m.lt, cx = fx, cy = fy - .55 * S; gL.save(); gL.clip(path);
      let gr = gL.createLinearGradient(cx - Lx * .26 * S, cy - Ly * .26 * S, cx + Lx * .12 * S, cy + Ly * .12 * S); gr.addColorStop(0, `rgba(255,206,150,${keyA})`); gr.addColorStop(.55, `rgba(255,196,140,${keyA * .3})`); gr.addColorStop(1, 'rgba(255,196,140,0)'); gL.fillStyle = gr; gL.fillRect(...box);   // the key, from the light's side
      gr = gL.createLinearGradient(0, fy, 0, fy - .75 * S); gr.addColorStop(0, `rgba(255,180,120,${bA})`); gr.addColorStop(1, 'rgba(255,180,120,0)'); gL.fillStyle = gr; gL.fillRect(...box); gL.restore();   // bounce from the floor
      // the soft rim: the shape minus itself moved along the light, blurred, kept inside the shape (an edge of light, never a line round it)
      const d = (m.peter ? .013 : .011) * S, [bx, by, bw, bh] = box.map(Math.round);
      gT.save(); gT.clearRect(bx - 4, by - 4, bw + 8, bh + 8); gT.fillStyle = '#fff'; gT.fill(path); gT.globalCompositeOperation = 'destination-out'; gT.translate(Lx * d, Ly * d); gT.fill(path); gT.restore();
      gT.save(); gT.globalCompositeOperation = 'source-in'; gr = gT.createLinearGradient(0, by, 0, by + bh); gr.addColorStop(0, `rgba(255,212,156,${rimA})`); gr.addColorStop(.5, `rgba(255,200,140,${rimA * .7})`); gr.addColorStop(1, `rgba(255,200,140,${rimA * .15})`); gT.fillStyle = gr; gT.fillRect(bx - 4, by - 4, bw + 8, bh + 8); gT.restore();
      gL.save(); gL.clip(path); gL.setTransform(1, 0, 0, 1, 0, 0); gL.filter = `blur(${(d * .35).toFixed(1)}px)`; gL.drawImage(tmp, bx - 4 - PP.X, by - 4 - PP.Y, bw + 8, bh + 8, bx - 4 - PP.X, by - 4 - PP.Y, bw + 8, bh + 8); gL.filter = 'none'; gL.globalAlpha = .6; gL.drawImage(tmp, bx - 4 - PP.X, by - 4 - PP.Y, bw + 8, bh + 8, bx - 4 - PP.X, by - 4 - PP.Y, bw + 8, bh + 8); gL.restore(); }
    if (m.peter) CFR.peterShadow = cfMan((x, y) => { const [Xs, Ds] = cfSun(m.X + x * m.Hm, -y * m.Hm, m.D); return cfP(Xs, 0, Ds); }, m.o);   // his shadow on the sunlit floor
  }
  for (const c of [peo, lit]) { const t = canvas(c.width, c.height), x = t.getContext('2d'); x.filter = 'blur(.8px)'; x.drawImage(c, 0, 0); const cx = c.getContext('2d'); cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, c.width, c.height); cx.drawImage(t, 0, 0); }   // a lens, not a vector edge
  CFR.peo = peo; CFR.lit = lit;
  // ---------------- the sun: the pool on the floor, the shaft in the air, the glow of the door ----------------
  const ap = [[DX0, DH], [DX1, DH], [DX1, 0], [DX0, 0]], landing = ap.map(([X, Y]) => cfSun(X, Y, CF.DW)), poolW = landing.map(([X, D]) => cfP(X, 0, D));   // the opening's corners where the sun lands
  const doorW = ap.map(([X, Y]) => cfP(X, Y, CF.DW));
  CFR.poolW = poolW; CFR.doorW = doorW;
  { const PB = { x: -300, y: 900, w: 1200, h: 500 }, pc = canvas(PB.w, PB.h), x = pc.getContext('2d'); x.translate(-PB.x, -PB.y);
    drawFloor(x); x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgb(255,222,176)'; x.fillRect(PB.x, PB.y, PB.w, PB.h);
    x.globalCompositeOperation = 'screen'; x.fillStyle = 'rgb(178,128,72)'; x.fillRect(PB.x, PB.y, PB.w, PB.h);
    const mk = canvas(PB.w, PB.h), mx = mk.getContext('2d'); mx.translate(-PB.x, -PB.y); mx.filter = 'blur(3px)'; mx.fillStyle = '#fff'; poly(mx, [poolW[3], poolW[2], poolW[1], poolW[0]]); mx.fill();   // the pool: the opening's shape laid on the floor
    mx.filter = 'blur(2.5px)'; mx.globalCompositeOperation = 'destination-out'; mx.fill(CFR.peterShadow); mx.filter = 'none';   // Peter's shadow across it
    { const gr = mx.createLinearGradient(0, poolW[3][1], 0, poolW[0][1]); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); mx.globalCompositeOperation = 'destination-out'; mx.fillStyle = gr; mx.fillRect(PB.x, PB.y, PB.w, PB.h); }   // weaker toward us
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'destination-in'; x.drawImage(mk, 0, 0);
    CFR.pool = pc; CFR.PB = PB; }
  { const SB = { x: -400, y: 300, w: 1300, h: 1400 }, sc = canvas(SB.w, SB.h), x = sc.getContext('2d'); x.translate(-SB.x, -SB.y);
    const H4 = [doorW[0], doorW[1], poolW[1], poolW[0]];   // the hull: the opening's top edge to the pool's near edge
    x.filter = 'blur(26px)'; let gr = x.createLinearGradient(doorW[0][0], doorW[0][1] + 200, poolW[1][0], poolW[1][1]); gr.addColorStop(0, 'rgba(255,226,170,.8)'); gr.addColorStop(.5, 'rgba(255,214,150,.5)'); gr.addColorStop(1, 'rgba(255,200,140,.14)'); x.fillStyle = gr; poly(x, H4); x.fill();
    x.filter = 'blur(10px)'; x.globalCompositeOperation = 'lighter'; const r = rng(33);   // rays: from points of the opening to where they land
    for (let i = 0; i < 16; i++) { const X = lerp(DX0, DX1, r()), Y0 = lerp(.2, DH, r()), a = cfP(X, Y0, CF.DW), [Xs, Ds] = cfSun(X, Y0, CF.DW), b = cfP(Xs, 0, Ds), wd = 6 + 22 * r(), al = .1 + .22 * r();
      gr = x.createLinearGradient(a[0], a[1], b[0], b[1]); gr.addColorStop(0, `rgba(255,232,190,${al})`); gr.addColorStop(1, 'rgba(255,232,190,0)'); x.strokeStyle = gr; x.lineWidth = wd; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); }
    CFR.shaft = sc; CFR.SB = SB; }
  { const BB = { x: -300, y: 260, w: 900, h: 1000 }, bc = canvas(BB.w, BB.h), x = bc.getContext('2d'); x.translate(-BB.x, -BB.y); x.filter = 'blur(46px)'; x.fillStyle = 'rgba(255,226,170,.9)'; poly(x, doorW); x.fill();
    x.filter = 'blur(14px)'; x.fillStyle = 'rgba(255,240,210,.6)'; poly(x, doorW); x.fill(); CFR.bloom = bc; CFR.BB = BB; }
  // dust motes: points on rays from the opening (closed form: each mote's place is a function of u)
  { const r = rng(41); CFR.dust = Array.from({ length: 240 }, () => { const X = lerp(DX0 + .05, DX1 - .05, r()), Y = lerp(.15, DH - .05, r()), lam = r(); return { X, Y, lam, p1: r() * 6.283, p2: r() * 6.283, s: r(), a: r() }; }); }
  { const gc = canvas(256, 256), x = gc.getContext('2d'), im = x.createImageData(256, 256), rr = rng(91); for (let i = 0; i < 65536; i++) { const v = 128 + (rr() - .5) * 110; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); CFR.grain = gc; }
}

function corneliusFresco(ctx, u) {
  const { clamp, ss, lerp } = Pilot, W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v'; u = clamp(u, 0, 5.2);
  const k = Pilot.eio(clamp(u / 5.1)), I = .6 + .4 * ss(.3, 2.6, u);   // the camera's creep; the sun's strength (a cloud moving off)
  // the camera: portrait close on Peter and the listeners, landscape the whole room; creeps in and slides right
  const C = V ? { z0: 1.07, z: lerp(1.07, 1.16, k), x0: 565, x: lerp(565, 592, k), y0: 1040, y: lerp(1040, 1012, k) }
              : { z0: .9, z: .9 * lerp(1, 1.06, k), x0: 560, x: lerp(560, 592, k), y0: 880, y: lerp(880, 868, k) };
  const layer = p => { const s = C.z0 * (1 + (C.z / C.z0 - 1) * p), cx = C.x0 + (C.x - C.x0) * p, cy = C.y0 + (C.y - C.y0) * p; ctx.setTransform(s, 0, 0, s, W / 2 - cx * s, H / 2 - cy * s); return s; };
  ctx.save(); ctx.fillStyle = '#140e0a'; ctx.fillRect(0, 0, W, H);
  // the room, its warmth from the sun, the door's glow, the pool of light on the floor
  layer(.82); ctx.drawImage(CFR.room, -CF.OX, -CF.OY);
  ctx.globalCompositeOperation = 'screen';
  { const gr = ctx.createRadialGradient(300, 1100, 0, 300, 1100, 1000); gr.addColorStop(0, `rgba(255,170,100,${.2 * I})`); gr.addColorStop(1, 'rgba(255,170,100,0)'); ctx.fillStyle = gr; ctx.fillRect(-840, 160, 2200, 2200); }
  ctx.globalAlpha = .5 + .5 * I; ctx.drawImage(CFR.bloom, CFR.BB.x, CFR.BB.y);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = clamp(I * 1.05); ctx.drawImage(CFR.pool, CFR.PB.x, CFR.PB.y); ctx.globalAlpha = 1;
  // the shaft of sun in the air behind the people; the people, then the light they catch
  ctx.globalCompositeOperation = 'screen'; layer(.9); ctx.globalAlpha = .7 * I; ctx.drawImage(CFR.shaft, CFR.SB.x, CFR.SB.y); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  layer(1); ctx.drawImage(CFR.peo, CF.PX, CF.PY);
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = I; ctx.drawImage(CFR.lit, CF.PX, CF.PY);
  // a thinner veil of the shaft in front of Peter too, and the dust turning in it
  layer(.9); ctx.globalAlpha = .28 * I; ctx.drawImage(CFR.shaft, CFR.SB.x, CFR.SB.y);
  { const s = layer(1), ce = Math.cos(Math.atan(CF.tanE)), se = Math.sin(Math.atan(CF.tanE)); ctx.globalAlpha = 1;
    for (const m of CFR.dust) { const lam = m.lam * m.Y / se, X = m.X + lam * ce * CF.hx + .05 * Math.sin(u * .35 + m.p1), Y = m.Y - lam * se + .04 * Math.sin(u * .27 + m.p2) + .02 * u, D = CF.DW - lam * ce * CF.hz + .04 * Math.cos(u * .3 + m.p1);
      if (Y < .03 || D < .9) continue; const [x, y] = cfP(X, Y, D), tw = .55 + .45 * Math.sin(u * 1.7 + m.p2 * 3), near = D < 1.7, R = (near ? 5 + 6 * m.s : 1.5 + 2.2 * m.s) * 3.2 / D * (V ? 1 : 1.1), a = (near ? .14 : .4 + .5 * m.a) * tw * I;
      if (a < .01) continue; if (near) { const gr = ctx.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, `rgba(255,236,200,${a})`); gr.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = gr; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); }
      else { ctx.fillStyle = `rgba(255,238,206,${a})`; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.283); ctx.fill(); } } }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  // grade: a warm lift in the light's half, a soft vignette, grain
  ctx.globalCompositeOperation = 'multiply';
  { const R = Math.hypot(W, H) * .62, gr = ctx.createRadialGradient(W * .42, H * .4, R * .3, W / 2, H * .45, R); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(168,152,140)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07; const o = Math.floor(u * 24); ctx.translate(-((o * 73) % 256), -((o * 151) % 256)); ctx.fillStyle = ctx.createPattern(CFR.grain, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}
