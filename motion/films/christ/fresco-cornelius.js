/* fresco-cornelius.js — 「그리스도」 N20 (film 119.9–125.0 s, u = 0..5.1): "'그리 마옵소서' 하던 베드로가 / 훗날 사람들 앞에서 전한 말."
   Acts 10:24–27 ("여러 사람이 모인 것을 보고"). 7차 (관리자 2026-11-14: 고넬료의 집 같은 장면은 성경을 모르면 이해가 안 된다 — 그림만 보고
   알 수 있게): no Roman room, no painted walls. One thing must read in a second on a phone: THAT MAN — the Peter of part 3 — now stands
   before many people and tells them. The courtyard of a house: plain plastered stone walls (plaster fallen here and there to the stone
   courses), a stone-framed arched gateway at the back on the left, a house door, a fig tree and a reed awning on the right over a bench,
   a flagstone floor. No sky anywhere (no time of day fixed by a sky): the walls run out of the top of the frame.
   The light is the main character: a low warm sun stands beyond the gateway, burns its opening white-gold and lays a long shaft through the
   air and a long pool on the flagstones across the courtyard toward us — it falls on Peter (fully, head to feet) and on to the listeners in
   front; dust turns in it; each body in it throws a long shadow toward us.
   Peter is the Peter of part 3 (RD_PETER in road-pastel.js: the broadest, madder robe, ochre head cloth tied with a dark band ending at the
   shoulders, black beard), standing, three-quarter toward the people on his right, speaking with an open hand held out (it moves a little
   as he speaks). Many men sit before him on the ground and on the bench — most of them from behind in the foreground, their heads turned
   to him (a sliver of cheek and beard on that side); on the bench under the awning a few seen three-quarter, one of them a Roman (short
   hair, red cloak — in the shade, not singled out). All men read as men (head cloth with band to the shoulders or short hair, beards,
   square shoulders, belts). No outlines: every figure is a shape lit by the light — a key and a soft rim from the beam where the beam
   actually crosses it (clipped to the beam's section at its depth), a faint skylight edge on top, bounce from the lit floor, roundness
   and folds in shade.
   The camera creeps in and slides right (the walls a little slower than the people); the sun grows a little from u ≈ 0.2.
   Portrait: Peter's whole upper body and every head above F.SAFE (0.64 H); the backs of the front row run down under the words.
   No words are drawn. Closed form: corneliusFresco(ctx, u) depends only on u. API: await buildCorneliusFresco() · corneliusFresco(ctx, u) */
const CFR = {};
const PETER_D = 4.3;   // Peter's depth (also the dust's focus)
// the courtyard in metres, seen by a camera 1.55 m above the floor: X right, Y up, D depth; world px = portrait screen px at zoom 1
const CF = { F: 1000, E: 1.55, YH: 700, CX: 540, DW: 6.5, XL: -3.9, XR: 2.8,
  G0: -3.0, G1: -1.7, GS: 2.35, GH: 3.0,          // the gateway in the back wall: X G0..G1, straight jambs to GS, a round arch to GH
  tanE: .32, hx: .7, hz: .714,                     // the sun: low (tan of its height), travelling right (hx) and toward us (hz)
  OX: 900, OY: 300, RW: 3000, RH: 2100,            // the room plate: world x -900..2100, y -300..1800
  PX: -620, PY: 330, PWW: 2400, PHH: 1500 };       // the people's plates: world x -620.., y 330..
const cfP = (X, Y, D) => [CF.CX + CF.F * X / D, CF.YH + CF.F * (CF.E - Y) / D];
const cfSun = (X, Y, D) => { const t = Y / CF.tanE; return [X + t * CF.hx, D - t * CF.hz]; };   // where the sun through (X, Y, D) lands on the floor
const cfArchY = X => { const c = (CF.G0 + CF.G1) / 2, r = (CF.G1 - CF.G0) / 2, d = Math.abs(X - c); return d >= r ? CF.GS : CF.GS + (CF.GH - CF.GS) * Math.sqrt(1 - (d / r) ** 2); };
const CF_AP = (() => { const a = [[CF.G0, 0]]; for (let i = 0; i <= 16; i++) { const X = CF.G0 + (CF.G1 - CF.G0) * i / 16; a.push([X, cfArchY(X)]); } a.push([CF.G1, 0]); return a; })();   // the opening's outline (X, Y)
const cfCirc = (cx, cy, rx, ry, n = 14, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * 6.283, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
function cfCaps(a, b, w0, w1, n = 5) {   // a capsule from a to b as a polygon
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
function cfClipD(poly, dmin) {   // a floor polygon [X, D] cut at D >= dmin (nearer than that is under the camera)
  const out = []; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], ia = a[1] >= dmin, ib = b[1] >= dmin;
    if (ia) out.push(a); if (ia !== ib) { const t = (dmin - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * t, dmin]); } } return out;
}
function cfAdder(P, f, q) {   // adds a closed rounded polygon (unit coords, mirrored by f) to the silhouette q and to any parts
  return (pts, ...to) => { pts = pts.map(([x, y]) => P(x * f, y)); let a = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; } if (a < 0) pts.reverse();
    const n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
    for (const t of [q, ...to]) { t.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) t.quadraticCurveTo(pts[i][0], pts[i][1], ...m(i)); t.closePath(); } };
}
// an arm: the upper sleeve, the forearm's sleeve flaring a little to its cuff, the hand coming out of it shaped (wrist, palm, tapering
// fingers, the thumb on its inner side) — never a log and a lump (관점 검수 6차)
function cfArm(add, pt, sh, tg, bend, palmUp) {
  const a = cfIK(sh, tg, .18, .172, bend), dx = a.wr[0] - a.el[0], dy = a.wr[1] - a.el[1], d = Math.hypot(dx, dy) || 1, c = [dx / d, dy / d], pn = [-c[1], c[0]];
  const Q = (t, y) => [a.wr[0] + c[0] * t + pn[0] * y, a.wr[1] + c[1] * t + pn[1] * y], E = k => [a.el[0] + pn[0] * k * .05, a.el[1] + pn[1] * k * .05];
  add(cfCaps(sh, a.el, .058, .05), pt.arm);
  add([E(-1), Q(-.034, -.056), Q(.004, -.062), Q(.014, -.054), Q(.014, .054), Q(.004, .062), Q(-.034, .056), E(1)], pt.arm);
  const s = palmUp ? 1.1 : 1, th = palmUp ? -1 : 1;
  add([Q(-.004, -.017 * s), Q(.02, -.021 * s), Q(.05, -.02 * s), Q(.06, -.012 * s), Q(.06, .012 * s), Q(.05, .019 * s), Q(.02, .019 * s), Q(-.004, .016 * s)], pt.skin);   // the palm
  for (const [yy, L] of [[-.0125, .03], [-.0042, .037], [.0042, .035], [.0125, .027]]) add(cfCaps(Q(.052, yy * s), Q(.052 + L, yy * 1.3 * s), .0056, .0046, 3), pt.skin);   // four fingers, a little apart at the tips (2026-11-14: not a mitten)
  add(cfCaps(Q(.02, th * .016), Q(.058, th * .036), .0085, .0056, 3), pt.skin);   // the thumb, apart from the fingers
  return a;
}
// a man in units of his height (feet at the origin, y up negative) through a map P(x, y) → px, seen three-quarter toward f (+1 right,
// -1 left); the same build as rdPerson in road-pastel.js (square shoulders, a belted robe falling straight, a head cloth ending at the
// shoulders with a dark band round the brow, or short hair; a beard). pose 'sit': on a bench, thighs forward, shins down. arms [back,
// front]: 'hang' · 'knee' · 'clasp' · 'open' (held out, palm up; reach 0..1 lifts it). Parts: q = silhouette; band, cloak, arm, skin,
// face, hair (and beard), hc (head cloth), hband.
function cfMan(P, o) {
  const { w = 1, f = 1, lean: l = 0, pose = 'stand', head = 'cloth', beard = true, arms = ['hang', 'hang'], tunic = 'long', cloak = false, reach = 0 } = o;
  const sit = pose === 'sit', dz = sit ? .2 : 0, piv = sit ? -.5 : 0;
  const q = new Path2D(), pt = {}; for (const k of ['band', 'cloak', 'arm', 'skin', 'face', 'hair', 'hc', 'hband']) pt[k] = new Path2D();
  const add = cfAdder(P, f, q), U = (x, y) => [x + l * (piv - y), y + dz];
  if (!sit) {
    for (const sd of [-1, 1]) { add(cfCaps([sd * .04, -.36], [sd * .04, -.02], .036, .03)); add(cfCirc(sd * .04 + .02, -.012, .05, .022, 10)); }
    add([[0, -.035], [-.17 * w, -.045], U(-.162 * w, -.26), U(-.145 * w, -.5), U(-.162 * w, -.62), U(-.178 * w, -.71), U(-.183 * w, -.742), U(-.172 * w, -.772), U(-.148 * w, -.796), U(-.105 * w, -.815), U(-.05, -.832),
      U(.05, -.832), U(.105 * w, -.815), U(.148 * w, -.796), U(.172 * w, -.772), U(.183 * w, -.742), U(.178 * w, -.71), U(.162 * w, -.62), U(.145 * w, -.5), U(.162 * w, -.26), [.17 * w, -.045]]);
  } else {
    const up = [U(-.145 * w, -.5), U(-.162 * w, -.62), U(-.178 * w, -.71), U(-.183 * w, -.742), U(-.172 * w, -.772), U(-.148 * w, -.796), U(-.105 * w, -.815), U(-.05, -.832), U(.05, -.832), U(.105 * w, -.815), U(.148 * w, -.796), U(.172 * w, -.772), U(.183 * w, -.742), U(.178 * w, -.71), U(.162 * w, -.62), U(.145 * w, -.52)];
    if (tunic === 'short') {   // a soldier's tunic to the knee: bare shins, sandals
      for (const kx of [.28, .33]) add(cfCaps([kx, -.27], [kx - .01, -.035], .028, .023), pt.skin);
      add(cfCirc(.29, -.016, .05, .02, 10), pt.band); add(cfCirc(.345, -.014, .055, .021, 10), pt.band);
      add([...up, [.24, -.335], [.33, -.322], [.365, -.27], [.3, -.232], [.12, -.236], [-.1, -.236], [-.16 * w, -.25]]);
    } else {
      add(cfCirc(.29, -.016, .05, .02, 10)); add(cfCirc(.345, -.014, .055, .021, 10));
      add([...up, [.24, -.335], [.33, -.322], [.352, -.27], [.335, -.1], [.36, -.035], [.19, -.035], [.205, -.2], [.12, -.236], [-.1, -.236], [-.16 * w, -.25]]);
    }
  }
  add([U(-.15 * w, -.54), U(.15 * w, -.54), U(.152 * w, -.497), U(-.152 * w, -.497)], pt.band);   // the belt
  if (!sit) add([U(.05 * w, -.505), U(.085 * w, -.5), U(.08 * w, -.39), U(.058 * w, -.39)], pt.band);
  if (cloak) {   // the cloak: from the shoulders down the back to the bench, a fold over the near shoulder
    add([U(-.178 * w, -.8), U(-.05, -.838), U(.05, -.81), U(-.04, -.66), U(-.09, -.52), [-.11, -.25], [-.215 * w, -.245], U(-.21 * w, -.5), U(-.205 * w, -.7)], pt.cloak);
    add([U(.03, -.835), U(.168 * w, -.792), U(.19 * w, -.69), U(.1, -.73)], pt.cloak);
  }
  for (const [i, sd] of [[0, -1], [1, 1]]) { const mode = arms[i], sh = U(sd * .148 * w, -.738);   // (the shoulder rounded, 2026-11-14)
    let tg, bend = -sd;
    if (mode === 'knee') { tg = [sd > 0 ? .23 : .17, -.37]; bend = 1; }
    else if (mode === 'clasp') { tg = [.26, -.44 + (sd > 0 ? 0 : .012)]; bend = 1; }
    else if (mode === 'open') { tg = U((.27 + .03 * reach) * w, -.56 - .05 * reach); bend = 1; }
    else tg = U(sd * .185 * w, -.41);
    cfArm(add, pt, sh, tg, bend, mode === 'open'); }
  // the head: neck, face (on the side he looks to), short hair or the head cloth and its band, the beard
  // (2026-11-14: the head a tenth larger — it read small on the broad shoulders — grown up from the neck)
  const [hx, hy0] = U(.012, -.9), fcx = hx + .026, hcY = hy0 + .09, add0 = add;
  add0([[hx - .036, hy0 + .045], [hx + .036, hy0 + .045], [hx + .038, hy0 + .088], [hx - .038, hy0 + .088]], pt.skin);
  { const add = (pts, ...to) => add0(pts.map(([x, y]) => [hx + (x - hx) * 1.1, hcY + (y - hcY) * 1.1]), ...to);
  add(cfCirc(fcx, hy0 + .006, .052, .064), pt.face); add([[fcx + .044, hy0 - .008], [fcx + .068, hy0 + .016], [fcx + .046, hy0 + .03]], pt.face);
  if (head === 'cloth') {
    add(cfCirc(hx - .004, hy0 - .046, .086, .04), pt.hc);   // the cloth over the crown down to the band: the face shows below it (2026-11-14: it covers the forehead to the band on the face side too)
    for (const sd of [-1, 1]) add([[hx + sd * .08, hy0 - .03], [fcx + sd * .043, hy0 - .032], [fcx + sd * .048, hy0 + .07], [fcx + sd * .062, hy0 + .108], [hx + sd * .124, hy0 + .114], [hx + sd * .1, hy0 + .03]], pt.hc);
    add([[hx - .08, hy0 - .05], [hx, hy0 - .062], [hx + .08, hy0 - .05], [hx + .081, hy0 - .028], [hx, hy0 - .04], [hx - .081, hy0 - .028]], pt.hband);
    for (const sd of [-1, 1]) for (const [a, b] of [[.072, .084], [.092, .098]]) add([[fcx + sd * (.05 + a * .1), hy0 + a], [hx + sd * (.11 + a * .1), hy0 + a + .004], [hx + sd * (.112 + b * .1), hy0 + b + .004], [fcx + sd * (.05 + b * .1), hy0 + b]], pt.hband);   // woven stripes along the cloth's hem: cloth, not hair
  } else {
    add(cfCirc(hx - .06, hy0 + .01, .014, .022, 8), pt.skin);
    add(cfCirc(hx - .018, hy0 + .014, .05, .06), pt.face);   // the back of the skull under the short hair (2026-11-14: the ear floated beside a face-only head)
    add([[hx - .062, hy0 - .02], [hx - .066, hy0 - .03], [hx - .04, hy0 - .066], [hx, hy0 - .074], [hx + .04, hy0 - .066], [hx + .066, hy0 - .03], [hx + .062, hy0 + .01], [fcx + .04, hy0 - .03], [fcx - .04, hy0 - .03]], pt.hair);
  }
  // a full black beard along the jaw and chin, from the mouth down (2026-11-14: it covered the whole face — a black mask; now the cheek,
  // the eye's hollow and the nose show above it; no notch: a notch read as a grin)
  if (beard) add([[fcx - .05, hy0 + .036], [fcx - .045, hy0 + .07], [fcx - .016, hy0 + .097], [fcx + .02, hy0 + .102], [fcx + .046, hy0 + .08], [fcx + .056, hy0 + .052], [fcx + .05, hy0 + .047], [fcx + .026, hy0 + .057], [fcx - .008, hy0 + .055], [fcx - .038, hy0 + .042]], pt.hair); }
  return Object.assign(q, pt);
}
// a man seated, seen FROM BEHIND (the listeners in front), in units of his standing height: on the ground (legs crossed, knees out) or
// on a bench (seat: 'bench', its top 0.25 up); his head turned toward the speaker (turn -1 left … +1 right): the shoulders follow a
// little, a sliver of cheek and beard shows past the head cloth's edge (or past the short hair) on that side. mantle: an outer cloak
// over the shoulders down the back, with two darker stripes. Parts: q, mantle, stripe, band, skin, face, hair, hc, hband.
function cfBack(P, o) {
  const { w = 1, turn = 0, head = 'cloth', seat = 'ground', mantle = false, beard = true } = o;
  const q = new Path2D(), pt = {}; for (const k of ['mantle', 'stripe', 'band', 'arm', 'skin', 'face', 'hair', 'hc', 'hband']) pt[k] = new Path2D();
  const add = cfAdder(P, 1, q), b = seat === 'bench' ? .25 : 0, sd = turn < 0 ? -1 : 1, at = Math.min(1, Math.abs(turn));
  const B = (x, y) => [x + turn * .045 * Math.max(0, Math.min(1, (-y - .16) / .3)), y - b];   // the body leans a little toward the speaker   // body coords (0 = the seat); the shoulders swing to the turn
  // (2026-11-14: the shoulders slope from the neck — no flat yoke — and the head sits on a neck, not on the shoulders)
  const up = [B(-.162, -.2), B(-.154, -.27), B(-.164 * w, -.34), B(-.18 * w, -.378), B(-.188 * w, -.4), B(-.172 * w, -.422), B(-.118 * w, -.44), B(-.05, -.462), B(.05, -.462), B(.118 * w, -.44), B(.172 * w, -.422), B(.188 * w, -.4), B(.18 * w, -.378), B(.164 * w, -.34), B(.154, -.27), B(.162, -.2)];
  if (!b) { add([[-.17, -.01], [-.178, -.11], ...up, [.178, -.11], [.17, -.01]]);   // the back down to the hips; the crossed legs' knees out to the sides
    for (const s of [-1, 1]) add([[s * .1, -.004], [s * .215, -.01], [s * .236, -.038], [s * .212, -.072], [s * .15, -.088]]); }
  else add([[-.205, -b + .07], [-.215, -b - .03], ...up, [.215, -b - .03], [.205, -b + .07]]);
  for (const s of [-1, 1]) { const sh = B(s * .158 * w, -.392), el = B(s * (.196 + .012 * (s === sd ? 0 : 1)) * w, -.27), hd = [s * (b ? .17 : .2), -b - .14];   // the arms down the sides, elbows out, hands forward onto the knees
    add(cfCaps(sh, el, .043, .041), pt.arm); add(cfCaps(el, hd, .042, .036), pt.arm); }
  if (mantle) { const lo = b ? -b + .06 : -.02;
    add([B(-.192 * w, -.405), B(-.13 * w, -.452), B(0, -.465), B(.13 * w, -.452), B(.192 * w, -.405), B(.205, -.2), [b ? .215 : .245, lo], [b ? -.215 : -.245, lo], B(-.205, -.2)], pt.mantle);
    for (const sx of [-.085, .085]) add([B(sx - .016, -.44), B(sx + .016, -.44), [sx * 1.15 + .02, lo - .005], [sx * 1.15 - .02, lo - .005]], pt.stripe); }
  const [hx, hy] = [turn * .048, -.545 - b];   // the head a little forward and down: listening (raised onto its neck, 2026-11-14)
  add([[hx - .037, -.45 - b], [hx + .037, -.45 - b], [hx + .032, hy + .03], [hx - .032, hy + .03]], pt.skin);   // the neck
  if (head === 'cloth') {
    const px0 = hx + sd * (.066 + .04 * at);   // the face's edge past the cloth
    if (at > .15) { add([[hx + sd * .045, hy - .032], [px0 + sd * .01, hy - .008], [px0 + sd * .02, hy + .016], [px0, hy + .028], [hx + sd * .045, hy + .046]], pt.face);
      if (beard) add([[hx + sd * .04, hy + .024], [px0 + sd * .008, hy + .03], [px0 - sd * .002, hy + .074], [hx + sd * .045, hy + .094]], pt.hair); }
    add(cfCirc(hx - sd * .006 * at, hy - .008, .075, .071), pt.hc);
    const e = k => sd * k > 0 ? 1 - .45 * at : 1;   // the cloth's edge on the face side comes back as he turns
    add([[hx - .079, hy - .02], [hx + .079, hy - .02], [hx + .1 * e(1), hy + .05], [hx + .124 * e(1), -.45 - b], [hx - .124 * e(-1), -.45 - b], [hx - .1 * e(-1), hy + .05]], pt.hc);
    add([[hx - .077, hy - .047], [hx, hy - .037], [hx + .077, hy - .047], [hx + .079, hy - .027], [hx, hy - .017], [hx - .079, hy - .027]], pt.hband);
  } else {
    for (const s of [-1, 1]) add(cfCirc(hx + s * .062, hy + .008, .01, .018, 8), pt.skin);   // the ears
    if (at > .15) { const px0 = hx + sd * (.056 + .026 * at); add([[hx + sd * .05, hy - .018], [px0 + sd * .008, hy + .004], [px0 + sd * .004, hy + .034], [hx + sd * .05, hy + .05]], pt.face);
    }
    add([[hx - .055, hy + .036], [hx - .064, hy], [hx - .064, hy - .034], [hx - .04, hy - .066], [hx, hy - .075], [hx + .04, hy - .066], [hx + .064, hy - .034], [hx + .064, hy], [hx + .055, hy + .036], [hx, hy + .046]], pt.hair);
  }
  return Object.assign(q, pt);
}

async function buildCorneliusFresco() {
  const { clamp, lerp, rng, canvas, noise, hex } = Pilot, { OX, OY, RW, RH, XL, XR, DW, G0, G1, GS, GH } = CF;
  const poly = (g, pts) => { if (g.beginPath) g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  const Wb = (X, Y) => cfP(X, Y, DW);   // a point on the back wall
  const hull = pts => { const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = [];
    for (const x of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], x) <= 0) lo.pop(); lo.push(x); }
    for (const x of p.reverse()) { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], x) <= 0) hi.pop(); hi.push(x); } return lo.slice(0, -1).concat(hi.slice(0, -1)); };
  // the sun's pool on the floor: the opening's outline laid on the flagstones, cut where it passes under the camera
  const footXD = cfClipD(CF_AP.map(([X, Y]) => cfSun(X, Y, DW)), .8), poolW = footXD.map(([X, D]) => cfP(X, 0, D)), apW = CF_AP.map(([X, Y]) => Wb(X, Y));
  // the beam's section at depth D (the figures standing there are clipped to it): the opening moved along the sun to D
  const beamAt = D => { const t = (DW - D) / CF.hz, ox = t * CF.hx, dy = t * CF.tanE; return CF_AP.map(([X, Y]) => cfP(X + ox, Y - dy, D)); };

  // ---------------- the courtyard's colours (albedo) ----------------
  const room = canvas(RW, RH); let g = room.getContext('2d'); g.translate(OX, OY);
  const floorPoly = [cfP(XL, 0, DW), cfP(XR, 0, DW), cfP(XR, 0, .7), cfP(XL, 0, .7)];
  const drawFloor = (x, seed = 12) => {   // flagstones: limestone slabs laid by hand in rows, earth in the joints, worn and mottled
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
    x.restore(); };
  drawFloor(g);
  // walls: plaster over stone, a damp grime at the foot, the plaster fallen here and there to the courses beneath
  const plaster = (pts, base, seed, wallMap, plain) => {
    g.save(); poly(g, pts); g.clip(); g.fillStyle = base; g.fill();
    const r = rng(seed);
    for (let i = 0; i < (plain ? 0 : 7); i++) {   // patches of bare stone (side walls only: on the back wall they read as blots)
      const X0 = lerp(-4, 3, r()), Y0 = lerp(.3, 5.5, r()), rw = .3 + .45 * r(), rh = .25 + .3 * r();
      if ((X0 > G0 - .6 && X0 < G1 + .6 && Y0 < GH + .5) || (X0 > -1.9 && X0 < 1.7)) continue;   // never round the gate, never behind Peter
      const blob = Array.from({ length: 22 }, (_, k) => { const a = k / 22 * 6.283, rr = .7 + .35 * r(); return wallMap(X0 + Math.cos(a) * rw * rr, Y0 + Math.sin(a) * rh * rr); });
      g.save(); g.globalAlpha = .5; poly(g, blob); g.clip(); g.fillStyle = '#7a6650'; g.fill();
      for (let Y = Math.floor((Y0 - rh - .4) / .3) * .3; Y < Y0 + rh + .4; Y += .3) { let X = X0 - rw - .5 + (Math.round(Y / .3) % 2) * .3;
        while (X < X0 + rw + .5) { const L = .45 + .45 * r(), v = .82 + .26 * r(); g.fillStyle = `rgb(${150 * v | 0},${128 * v | 0},${100 * v | 0})`; poly(g, [wallMap(X + .02, Y + .02), wallMap(X + L - .02, Y + .02), wallMap(X + L - .02, Y + .28), wallMap(X + .02, Y + .28)]); g.fill(); X += L; } }
      g.restore();
    }
    for (let i = 0; i < 90; i++) { const [x, y] = wallMap(lerp(-4, 3, r()), lerp(0, 7, r())), R = 30 + 110 * r(), gr = g.createRadialGradient(x, y, 0, x, y, R);   // mottling
      gr.addColorStop(0, r() < .55 ? `rgba(214,196,166,${.08 + .1 * r()})` : `rgba(80,62,46,${.06 + .08 * r()})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R); }
    g.restore(); };
  // the side walls (landscape sees them), then the back wall
  plaster([cfP(XR, 0, DW), cfP(XR, 0, 1), cfP(XR, 9, 1), cfP(XR, 9, DW)], '#a28a70', 31, (X, Y) => cfP(XR, Y, lerp(DW, 1.6, (X + 4) / 7)));
  plaster([cfP(XL, 0, DW), cfP(XL, 0, 1), cfP(XL, 9, 1), cfP(XL, 9, DW)], '#a89076', 37, (X, Y) => cfP(XL, Y, lerp(DW, 1.6, (X + 4) / 7)));
  plaster([Wb(XL, 0), Wb(XR, 0), Wb(XR, 9), Wb(XL, 9)], '#b29b7f', 23, Wb, true);
  for (const [X, D0, D1] of [[XL, DW, 1], [XR, DW, 1], [null]]) {   // damp grime at the foot of every wall
    const pts = X === null ? [Wb(XL, 0), Wb(XR, 0), Wb(XR, .7), Wb(XL, .7)] : [cfP(X, 0, D0), cfP(X, 0, D1), cfP(X, .7, D1), cfP(X, .7, D0)];
    g.save(); poly(g, pts); g.clip(); const y0 = X === null ? Wb(0, .7)[1] : cfP(0, .7, 3)[1], y1 = X === null ? Wb(0, 0)[1] : cfP(0, 0, 1.4)[1], gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(60,44,30,0)'); gr.addColorStop(1, 'rgba(60,44,30,.42)'); g.fillStyle = gr; g.fill(); g.restore(); }
  g.fillStyle = 'rgba(40,28,20,.5)'; g.fillRect(cfP(XR, 0, DW)[0] - 2, Wb(0, 9)[1], 5, Wb(0, 0)[1] - Wb(0, 9)[1]);   // the corner's shade
  // beam ends of the upper floor, a small latticed window
  { const [x0, y0] = Wb(-.55, 4.35), [x1, y1] = Wb(.05, 3.75); g.fillStyle = '#8e7a60'; g.fillRect(x0 - 10, y0 - 8, x1 - x0 + 20, y1 - y0 + 18); g.fillStyle = '#1e1610'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.strokeStyle = '#4a3624'; g.lineWidth = 4; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(lerp(x0, x1, i / 4), y0); g.lineTo(lerp(x0, x1, i / 4), y1); g.stroke(); g.beginPath(); g.moveTo(x0, lerp(y0, y1, i / 4)); g.lineTo(x1, lerp(y0, y1, i / 4)); g.stroke(); } }
  // the house door: dark planks under a stone lintel, a worn step
  { const [x0, y0] = Wb(.45, 2.15), [x1, y1] = Wb(1.25, 0); g.fillStyle = '#9c8668'; g.fillRect(x0 - 16, y0 - 22, x1 - x0 + 32, 22);
    g.fillStyle = '#3a2a1e'; g.fillRect(x0, y0, x1 - x0, y1 - y0); const r = rng(8);
    for (let x = x0; x < x1; x += 18) { g.fillStyle = `rgba(${r() < .5 ? '90,66,44' : '20,14,10'},${.25 + .2 * r()})`; g.fillRect(x, y0, 3, y1 - y0); }
    g.fillStyle = 'rgba(16,10,6,.55)'; g.fillRect(x0, y0, x1 - x0, 14); g.fillStyle = '#8a7458'; g.fillRect(x0 - 10, y1 - 8, x1 - x0 + 20, 10);
    g.fillStyle = 'rgba(150,120,80,.6)'; g.beginPath(); g.arc(lerp(x0, x1, .82), lerp(y0, y1, .52), 4, 0, 6.283); g.fill(); }
  // the gateway: dressed stones round the arch (voussoirs) and down the jambs
  { const r = rng(4), c = (G0 + G1) / 2, R0 = (G1 - G0) / 2, R1 = R0 + .3;
    for (let i = 0; i < 11; i++) { const a0 = Math.PI * i / 11, a1 = Math.PI * (i + 1) / 11, P = (a, R) => Wb(c - Math.cos(a) * R, GS + Math.sin(a) * R), v = .9 + .16 * r();
      g.fillStyle = `rgb(${176 * v | 0},${156 * v | 0},${124 * v | 0})`; poly(g, [P(a0 + .012, R0), P(a1 - .012, R0), P(a1 - .012, R1), P(a0 + .012, R1)]); g.fill(); }
    for (const [xa, xb] of [[G0 - .3, G0], [G1, G1 + .3]]) for (let Y = 0; Y < GS; Y += .36) { const v = .88 + .16 * r(), dx = (Math.round(Y / .36) % 2) * .06;
      g.fillStyle = `rgb(${172 * v | 0},${152 * v | 0},${120 * v | 0})`; poly(g, [Wb(xa - (xa < G0 ? dx : 0) + .01, Y + .01), Wb(xb + (xb > G1 ? dx : 0) - .01, Y + .01), Wb(xb + (xb > G1 ? dx : 0) - .01, Y + .35), Wb(xa - (xa < G0 ? dx : 0) + .01, Y + .35)]); g.fill(); } }
  // the bench along the right under the awning; two water jars by the fig
  { const s = .45; g.fillStyle = '#4a3424'; poly(g, [cfP(1.6, s, 3.0), cfP(1.6, s, 5.9), cfP(1.6, 0, 5.9), cfP(1.6, 0, 3.0)]); g.fill();
    g.fillStyle = '#6a4c34'; poly(g, [cfP(1.6, s, 3.0), cfP(1.98, s, 3.0), cfP(1.98, s, 5.9), cfP(1.6, s, 5.9)]); g.fill();
    g.fillStyle = 'rgba(20,12,8,.5)'; poly(g, [cfP(1.6, s - .06, 3.0), cfP(1.6, s - .06, 5.9), cfP(1.6, 0, 5.9), cfP(1.6, 0, 3.0)]); g.fill(); }
  for (const [X, hgt] of [[2.25, .62], [2.5, .5]]) { const [cx, cy] = cfP(X, 0, 6.25), s = CF.F / 6.25; g.fillStyle = '#8a5a3c';
    g.beginPath(); g.ellipse(cx, cy - hgt * .45 * s, .16 * s, hgt * .5 * s, 0, 0, 6.283); g.fill(); g.fillRect(cx - .06 * s, cy - hgt * s, .12 * s, .12 * s); }
  // the fig: a grey crooked trunk by the back right corner, big lobed leaves spreading up and over
  { const r = rng(61), T0 = cfP(2.15, 0, 6.1), s = CF.F / 6.1;
    g.fillStyle = '#5c544a'; g.beginPath(); g.moveTo(T0[0] - .1 * s, T0[1]); g.bezierCurveTo(T0[0] - .02 * s, T0[1] - 1.2 * s, T0[0] - .3 * s, T0[1] - 2 * s, T0[0] - .5 * s, T0[1] - 3.1 * s);
    g.lineTo(T0[0] - .38 * s, T0[1] - 3.15 * s); g.bezierCurveTo(T0[0] - .12 * s, T0[1] - 2 * s, T0[0] + .14 * s, T0[1] - 1.2 * s, T0[0] + .09 * s, T0[1]); g.fill();
    for (const [a, L] of [[-2.4, 1.3], [-1.9, 1.5], [-1.2, 1.1], [-.7, 1.2]]) { const o = [T0[0] - .44 * s, T0[1] - 3.1 * s]; g.strokeStyle = '#4e463e'; g.lineWidth = .07 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(...o); g.quadraticCurveTo(o[0] + Math.cos(a + .3) * L * .5 * s, o[1] + Math.sin(a + .3) * L * .5 * s, o[0] + Math.cos(a) * L * s, o[1] + Math.sin(a) * L * s); g.stroke(); }
    const leaf = (x, y, sz, rot, col) => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath();
      for (const [a, k] of [[-.9, .85], [0, 1.05], [.9, .85]]) { const ex = Math.sin(a) * sz * .38 * k, ey = -Math.cos(a) * sz * .38 * k; g.moveTo(ex + sz * .3, ey); g.ellipse(ex, ey, sz * .3, sz * .44 * k, a, 0, 6.283); }
      g.fill(); g.restore(); };
    const [cx, cy] = cfP(1.75, 4.1, 6.1), fc = canvas(RW, RH), fx = fc.getContext('2d'); fx.translate(OX, OY); const g0 = g; g = fx;   // the canopy on its own plate: shaded as one mass, softened
    for (let i = 0; i < 380; i++) { const a = r() * 6.283, rr = Math.sqrt(r()), x = cx + Math.cos(a) * rr * 1.35 * s, y = cy + Math.sin(a) * rr * 1.0 * s, top = (cy - y) / (1.0 * s), v = .78 + .3 * r();
      leaf(x, y, (.17 + .08 * r()) * s, r() * 6.283, `rgb(${(50 + 12 * top) * v | 0},${(60 + 12 * top) * v | 0},${(36 + 4 * top) * v | 0})`); }
    g = g0; fx.globalCompositeOperation = 'source-atop'; const gr = fx.createRadialGradient(cx - .4 * s, cy - .6 * s, 0, cx, cy, 1.6 * s); gr.addColorStop(0, 'rgba(150,140,100,.25)'); gr.addColorStop(.6, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,12,6,.45)'); fx.fillStyle = gr; fx.fillRect(cx - 2 * s, cy - 2 * s, 4 * s, 4 * s);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'blur(1.6px)'; g.drawImage(fc, 0, 0); g.restore(); }
  // the awning: a reed mat on beams from the right wall, seen from beneath; its frayed front edge
  { const A = [[1.2, 2.35, 2.9], [XR, 2.62, 2.9], [XR, 2.62, 6.0], [1.2, 2.35, 6.0]], Ap = A.map(p => cfP(...p)), r = rng(17);
    g.fillStyle = '#4a3a28'; poly(g, Ap); g.fill();
    g.save(); poly(g, Ap); g.clip();
    for (let D = 2.9; D < 6; D += .028) { const a = cfP(1.2, 2.35, D), b = cfP(XR, 2.62, D), v = .7 + .5 * r(); g.strokeStyle = `rgba(${130 * v | 0},${104 * v | 0},${68 * v | 0},.55)`; g.lineWidth = Math.max(1, 26 / D); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    for (const X of [1.5, 2.1, 2.6]) { g.strokeStyle = '#2e2216'; g.lineWidth = 9; g.beginPath(); g.moveTo(...cfP(X, 2.36 + (X - 1.2) * .19, 2.9)); g.lineTo(...cfP(X, 2.36 + (X - 1.2) * .19, 6)); g.stroke(); }
    g.restore();
    g.fillStyle = '#3a2c1e'; for (let D = 2.9; D < 6; D += .05) { const a = cfP(1.2, 2.35, D), L = (.06 + .1 * r()) * CF.F / D; g.fillRect(a[0] - 2, a[1], 3 + 4 / D, L); }
    { const top = cfP(1.2, 2.35, 5.9), bot = cfP(1.2, 0, 5.9), wd = .07 * CF.F / 5.9; g.fillStyle = '#3c2c1e'; g.fillRect(top[0] - wd / 2, top[1], wd, bot[1] - top[1]); g.fillStyle = 'rgba(160,120,80,.25)'; g.fillRect(top[0] - wd / 2, top[1], wd * .35, bot[1] - top[1]); } }
  // plaster grain over everything
  { const NW = RW >> 1, NH = RH >> 1, nc = canvas(NW, NH), nx = nc.getContext('2d'), im = nx.createImageData(NW, NH), d = im.data, r = rng(5);
    for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) { const v = 128 + 30 * (noise(x * .02, y * .02) - .5) + 16 * (noise(x * .09, y * .09) - .5) + 16 * (r() - .5), i = (y * NW + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    nx.putImageData(im, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .45; g.drawImage(nc, 0, 0, RW, RH); g.restore(); }
  // ---------------- the courtyard's own light (open shade): the bounce off the sunlit floor, darker up the walls, under the awning, to the right
  { const lm = canvas(RW, RH), lx = lm.getContext('2d'); lx.translate(OX, OY); lx.fillStyle = 'rgb(222,206,188)'; lx.fillRect(-OX, -OY, RW, RH);
    lx.globalCompositeOperation = 'lighter';
    for (const [cx, cy, R, c] of [[520, 1080, 900, 'rgba(100,72,44,1)'], [220, 900, 520, 'rgba(96,70,42,1)'], [760, 1260, 600, 'rgba(70,50,30,1)']]) { const gr = lx.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); lx.fillStyle = gr; lx.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
    lx.globalCompositeOperation = 'multiply';
    let gr = lx.createLinearGradient(0, -OY, 0, 760); gr.addColorStop(0, 'rgb(140,130,124)'); gr.addColorStop(1, '#fff'); lx.fillStyle = gr; lx.fillRect(-OX, -OY, RW, 1060);
    gr = lx.createLinearGradient(400, 0, 1700, 0); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(176,166,160)'); lx.fillStyle = gr; lx.fillRect(-OX, -OY, RW, RH);
    gr = lx.createLinearGradient(0, 1120, 0, 1800); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(160,150,140)'); lx.fillStyle = gr; lx.fillRect(-OX, 1120, RW, 700);   // the near floor in the people's shade
    lx.filter = 'blur(40px)'; lx.fillStyle = 'rgb(168,158,150)'; poly(lx, [cfP(1.2, 2.35, 2.9), cfP(XR, 2.62, 2.9), cfP(XR, 0, 2.9), cfP(1.5, 0, 6), cfP(1.2, 2.35, 6)]); lx.fill(); lx.filter = 'none';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(lm, 0, 0); g.restore(); }
  // the opening: the low sun beyond it burns it out white-gold; the far side of the lane a paler shape in the glare; the left jamb's inner
  // face and the arch's soffit in shade, the threshold lit
  { g.save(); poly(g, apW); g.clip(); const [, yT] = Wb(0, GH), [, yB] = Wb(0, 0);
    let gr = g.createLinearGradient(0, yT, 0, yB); gr.addColorStop(0, '#fff4dc'); gr.addColorStop(.55, '#ffeccc'); gr.addColorStop(1, '#ffdcaa'); g.fillStyle = gr; g.fillRect(Wb(G0, 0)[0], yT, Wb(G1, 0)[0] - Wb(G0, 0)[0], yB - yT);
    g.fillStyle = 'rgba(214,184,140,.4)'; poly(g, [Wb(G0, 0), Wb(G0, 1.5), Wb(G0 + .5, 1.6), Wb(G1, 1.3), Wb(G1, 0)]); g.fill();   // the lane's far wall, lost in the glare
    const Wi = (X, Y) => cfP(X, Y, DW + .5);
    g.fillStyle = 'rgba(150,118,84,.9)'; poly(g, [Wb(G0, 0), Wb(G0, GS), Wi(G0, GS), Wi(G0, 0)]); g.fill();   // the left jamb's inner face
    g.fillStyle = 'rgba(120,94,66,.8)'; poly(g, [...CF_AP.slice(1, -1).map(([X, Y]) => Wb(X, Y)), ...CF_AP.slice(1, -1).reverse().map(([X, Y]) => Wi(X, Y))]); g.fill();   // the soffit
    g.fillStyle = 'rgba(255,240,206,.95)'; poly(g, [Wi(G0, 0), Wi(G1, 0), Wb(G1, 0), Wb(G0, 0)]); g.fill();
    g.fillStyle = 'rgba(255,250,236,.3)'; g.fillRect(Wb(G0, 0)[0], yT, 400, yB - yT); g.restore(); }
  { const rb = canvas(RW, RH), x = rb.getContext('2d'); x.filter = 'blur(1.2px)'; x.drawImage(room, 0, 0);
    for (const [y0, bl] of [[1200, 2.5], [1380, 4.5], [1560, 7]]) { x.save(); x.beginPath(); x.rect(0, y0 + OY, RW, RH); x.clip(); x.filter = `blur(${bl}px)`; x.drawImage(room, 0, 0); x.restore(); }   // the near floor out of focus
    CFR.room = rb; }   // the walls a touch out of focus

  // ---------------- the people ----------------
  const PE = (typeof RD_PETER !== 'undefined') ? RD_PETER : { body: '#7e4c44', hc: '#c9a06a', band: '#4a3426', hair: '#3a302c', w: 1.1 };   // part 3's Peter
  const deep = c => '#' + Pilot.hex(c).map((v, i) => Math.round(v * [.84, .7, .5][i]).toString(16).padStart(2, '0')).join('');   // the head cloth a deeper ochre (in this light the pastel one read pale, like fair hair)
  const PETER = { X: -.45, D: PETER_D, Hm: 1.8, kind: 'man', peter: true, o: { f: 1, w: PE.w || 1.1, head: 'cloth', lean: .015, arms: ['hang', 'open'] }, c: { body: PE.body, hc: deep(PE.hc), band: PE.band, hair: PE.hair, skin: '#b48a6e', faceK: 1.12 }, amb: .54 };
  const MEN = [   // c: colours; kind 'back' = seated, seen from behind; 'man' = three-quarter (cfMan)
    // landscape only, at the sides
    { X: -3.05, D: 4.4, Hm: 1.74, kind: 'man', o: { f: 1, w: 1, head: 'cloth', lean: .02 }, c: { body: '#5a4c3e', hc: '#b6a688', band: '#3e2e2c', hair: '#2e2420', skin: '#9c7a62' } },
    { X: -2.7, D: 3.0, Hm: 1.74, kind: 'back', o: { turn: .7, head: 'hair' }, c: { body: '#4e4a44', hair: '#2a201c', skin: '#9c7a62' } },
    { X: 2.35, D: 2.6, Hm: 1.76, kind: 'back', o: { turn: -.8, head: 'cloth', mantle: true }, c: { body: '#5c5040', mantle: '#7a6a52', stripe: '#3a2e24', hc: '#a89a80', band: '#3e2e2c', hair: '#2e2420', skin: '#a07a60' } },
    // behind Peter: the bench under the awning, a man on the ground by the gate
    { X: 1.68, D: 5.3, Hm: 1.74, kind: 'man', o: { f: -1, w: 1, head: 'cloth', pose: 'sit', lean: .08, arms: ['knee', 'knee'] }, c: { body: '#5e5444', hc: '#a29276', band: '#3e2e2c', hair: '#3a3430', skin: '#a07a60' } },
    { X: 1.7, D: 4.55, Hm: 1.8, kind: 'man', o: { f: -1, w: 1.04, head: 'hair', beard: false, pose: 'sit', lean: .06, arms: ['knee', 'knee'], tunic: 'short', cloak: true }, c: { body: '#6a5a46', cloak: '#8e2a20', band: '#3a2618', hair: '#2a1e18', skin: '#9c7258' } },   // the Roman, in the shade
    { X: -2.3, D: 5.4, Hm: 1.72, kind: 'back', o: { turn: .75, head: 'cloth' }, c: { body: '#56503e', hc: '#b4a486', band: '#3e2e2c', hair: '#2e2420', skin: '#a07a60' } },
  ];
  const FRONT = [   // in front of Peter, back to front
    { X: 1.75, D: 3.75, Hm: 1.76, kind: 'man', o: { f: -1, w: 1, head: 'cloth', pose: 'sit', lean: .1, arms: ['knee', 'knee'] }, c: { body: '#5c6448', hc: '#b2a488', band: '#4a3c30', hair: '#857a70', skin: '#a8806a' } },
    { X: -1.75, D: 3.9, Hm: 1.74, kind: 'back', o: { turn: .85, head: 'cloth', mantle: true }, c: { body: '#4c5060', mantle: '#6e5e4a', stripe: '#5a4a3a', hc: '#bcae92', band: '#3e2e2c', hair: '#2e2420', skin: '#a07a60' } },
    { X: .78, D: 3.65, Hm: 1.75, kind: 'back', o: { turn: -.7, head: 'hair' }, c: { body: '#6a5e4c', hair: '#2a201c', skin: '#a8806a' } },
    { X: -.2, D: 3.55, Hm: 1.76, kind: 'back', o: { turn: -.3, head: 'cloth', mantle: true }, c: { body: '#5a4a3a', mantle: '#806c50', stripe: '#6a5842', hc: '#c2b498', band: '#3e2e2c', hair: '#2e2420', skin: '#a8806a' } },
    { X: .3, D: 3.0, Hm: 1.76, kind: 'back', o: { turn: -.5, head: 'hair', w: 1.04 }, c: { body: '#4a5464', hair: '#241c18', skin: '#a07a60' } },
    { X: 1.3, D: 2.9, Hm: 1.78, kind: 'back', o: { turn: -.8, head: 'cloth', mantle: true, w: 1.06 }, c: { body: '#5e5240', mantle: '#74624a', stripe: '#62523e', hc: '#b8aa8c', band: '#3e2e2c', hair: '#2e2420', skin: '#a07a60' } },
    { X: -.95, D: 2.95, Hm: 1.76, kind: 'back', o: { turn: .6, head: 'hair', w: 1.05 }, c: { body: '#5a4e40', hair: '#2a201a', skin: '#a07a60' } },
    { X: 1.02, D: 2.05, Hm: 1.78, kind: 'back', near: true, o: { turn: -.75, head: 'cloth', mantle: true, w: 1.05 }, c: { body: '#4a4034', mantle: '#5e5040', stripe: '#4e4234', hc: '#9a8c74', band: '#3e2e2c', hair: '#2e2420', skin: '#94705a' }, amb: .44 },
    { X: -.98, D: 2.0, Hm: 1.76, kind: 'back', near: true, o: { turn: .7, head: 'cloth', w: 1.02 }, c: { body: '#4e4436', hc: '#a69276', band: '#3e2e2c', hair: '#2e2420', skin: '#94705a' }, amb: .44 },
  ];
  let AMB = [.5, .45, .41]; const tone = (c, k = 1) => { const a = hex(c); return `rgb(${a[0] * AMB[0] * k | 0},${a[1] * AMB[1] * k | 0},${a[2] * AMB[2] * k | 0})`; };
  const parts = (x, p, c) => {
    x.fillStyle = tone(c.body); x.fill(p); x.fillStyle = tone(c.band || '#3e2e2c'); x.fill(p.band);
    if (c.mantle && p.arm) { x.fillStyle = tone(c.body, .88); x.fill(p.arm); }   // under a mantle the sleeves are covered from behind
    if (c.mantle) { x.fillStyle = tone(c.mantle); x.fill(p.mantle); x.save(); x.clip(p.mantle); x.fillStyle = tone(c.stripe); x.fill(p.stripe); x.restore(); }
    if (c.cloak) { x.fillStyle = tone(c.cloak); x.fill(p.cloak); }
    if (p.arm && !c.mantle) { x.fillStyle = tone(c.body, .88); x.fill(p.arm); }
    x.fillStyle = tone(c.skin); x.fill(p.skin); x.fillStyle = tone(c.skin, c.faceK || .78); x.fill(p.face);
    x.fillStyle = tone(c.hair); x.fill(p.hair);
    if (c.hc) { x.fillStyle = tone(c.hc); x.fill(p.hc); x.save(); x.clip(p.hc); x.fillStyle = tone(c.band); x.fill(p.hband); x.restore(); } };
  const place = m => { const [fx, fy] = cfP(m.X, 0, m.D), S = CF.F * m.Hm / m.D; m.fx = fx; m.fy = fy; m.S = S; m.P = (x, y) => [fx + x * S, fy + y * S]; return m; };
  const build = (m, o = m.o) => m.kind === 'back' ? cfBack(m.P, o) : cfMan(m.P, o);
  // which part of a figure the beam crosses: the beam's section at its depth (null if none of it)
  const beamClip = m => { const pts = beamAt(m.D), xs = pts.map(p => p[0]); if (Math.max(...xs) < m.fx - .4 * m.S || Math.min(...xs) > m.fx + .4 * m.S) return null; const p = new Path2D(); poly(p, pts); return p; };
  // a soft edge of light: the shape minus itself moved along the light, coloured, blurred, kept inside the shape — never a line round it
  const rim = (X, T, off, path, box, Lt, d, c0, c1, bl) => {
    const [bx, by, bw, bh] = box.map(Math.round);
    T.save(); T.clearRect(bx - 6, by - 6, bw + 12, bh + 12); T.fillStyle = '#fff'; T.fill(path); T.globalCompositeOperation = 'destination-out'; T.translate(Lt[0] * d, Lt[1] * d); T.fill(path); T.restore();
    T.save(); T.globalCompositeOperation = 'source-in'; const gr = T.createLinearGradient(0, by, 0, by + bh); gr.addColorStop(0, c0); gr.addColorStop(1, c1); T.fillStyle = gr; T.fillRect(bx - 6, by - 6, bw + 12, bh + 12); T.restore();
    X.save(); X.clip(path); X.setTransform(1, 0, 0, 1, 0, 0); const sx = bx - 6 - off[0], sy = by - 6 - off[1];
    X.filter = `blur(${bl.toFixed(1)}px)`; X.drawImage(T.canvas, sx, sy, bw + 12, bh + 12, sx, sy, bw + 12, bh + 12); X.filter = 'none'; X.globalAlpha = .55; X.drawImage(T.canvas, sx, sy, bw + 12, bh + 12, sx, sy, bw + 12, bh + 12); X.restore(); };
  // one figure onto a base plate B (its colours in the open shade, roundness, folds, a skylight edge) and a light plate L (what the beam and
  // the lit floor add: drawn later with the sun's strength); T is scratch; all three translated by -off
  const figure = (B, L, T, off, m, path, bc) => {
    const { fx, fy, S } = m, back = m.kind === 'back', sit = back || m.o.pose === 'sit', top = fy - (back ? .6 : sit ? .78 : 1) * S;
    const box = [fx - .6 * S, fy - 1.06 * S, 1.2 * S, 1.12 * S];
    // the shadow under it
    B.save(); B.filter = `blur(${(.014 * S).toFixed(1)}px)`; B.fillStyle = 'rgba(16,9,5,.5)'; B.beginPath(); B.ellipse(fx + (m.o.pose === 'sit' ? .14 * (m.o.f || 1) : 0) * S, fy - .004 * S, (back ? .32 : .24) * S, .032 * S, 0, 0, 6.283); B.fill(); B.restore();
    const a = m.amb || .6; AMB = [a, a * .9, a * .82]; parts(B, path, m.c);
    // the face's shading first, then the beard and the cloth again over it (they stand in front of the face)
    if (path.face) { let gr; B.save(); B.clip(path.face); gr = B.createLinearGradient(fx - .03 * S, 0, fx + .09 * S, 0); gr.addColorStop(0, `rgba(10,5,4,${back ? .25 : .1})`); gr.addColorStop(1, 'rgba(10,5,4,0)'); B.fillStyle = gr; B.fillRect(...box);
      if (!back) { const f = m.o.f || 1, cy = fy - (sit ? .71 : .905) * S, cx = fx + f * .05 * S;   // the eye's hollow under the brow, the nose's small shadow — no features drawn
        gr = B.createLinearGradient(0, cy - .014 * S, 0, cy + .03 * S); gr.addColorStop(0, 'rgba(10,5,4,.55)'); gr.addColorStop(.5, 'rgba(10,5,4,.18)'); gr.addColorStop(1, 'rgba(10,5,4,0)'); B.fillStyle = gr; B.fillRect(...box);
        const g2 = B.createRadialGradient(cx + f * .02 * S, cy + .022 * S, 0, cx + f * .02 * S, cy + .022 * S, .022 * S); g2.addColorStop(0, 'rgba(10,5,4,.2)'); g2.addColorStop(1, 'rgba(10,5,4,0)'); B.fillStyle = g2; B.fillRect(...box); }
      B.restore();
      const c = m.c; B.fillStyle = tone(c.hair); B.fill(path.hair); if (c.hc) { B.fillStyle = tone(c.hc); B.fill(path.hc); B.save(); B.clip(path.hc); B.fillStyle = tone(c.band); B.fill(path.hband); B.restore(); } }   // the beard and the cloth stay in front of the face's shading
    B.save(); B.clip(path);
    let gr = B.createLinearGradient(0, top + .25 * S, 0, fy); gr.addColorStop(0, 'rgba(12,6,4,0)'); gr.addColorStop(1, `rgba(12,6,4,${back ? .5 : .4})`); B.fillStyle = gr; B.fillRect(...box);   // darker down the body (and the backs toward us)
    const hw = (back ? .3 : .19) * S;   // roundness: the far side (away from the gate) darker, the near edge a touch darker too
    gr = B.createLinearGradient(fx - hw, 0, fx + hw, 0); gr.addColorStop(0, `rgba(10,5,4,${back ? .3 : .16})`); gr.addColorStop(.28, 'rgba(10,5,4,0)'); gr.addColorStop(.6, 'rgba(10,5,4,.1)'); gr.addColorStop(1, `rgba(10,5,4,${back ? .5 : .42})`); B.fillStyle = gr; B.fillRect(...box);
    { const rf = rng(Math.round(fx * 7 + fy)); const n = back ? 3 : 7;   // folds: a soft shadow with a faint lit edge beside it
      for (let i = 0; i < n; i++) { const xx = fx + (rf() - .5) * (back ? .44 : .3) * S, wd = (.01 + .014 * rf()) * S, y0 = fy - (back ? .42 : sit ? .5 : .5) * S, y1 = fy - (back ? .02 : .03) * S, sk = (rf() - .5) * .08 * S;
        B.save(); B.transform(1, 0, sk / (y1 - y0), 1, -sk / (y1 - y0) * y0, 0);
        const g2 = B.createLinearGradient(xx - wd, 0, xx + wd * 1.6, 0); g2.addColorStop(0, 'rgba(10,5,4,0)'); g2.addColorStop(.4, `rgba(10,5,4,${(back ? .07 : .12) + .12 * rf()})`); g2.addColorStop(.62, `rgba(255,236,210,${back ? .02 : .05})`); g2.addColorStop(1, 'rgba(255,236,210,0)');
        B.fillStyle = g2; B.fillRect(xx - wd, y0, 2.6 * wd, y1 - y0); B.restore(); } }
    if (back) {   // the spine's valley and the shoulder blades
      gr = B.createLinearGradient(fx - .05 * S, 0, fx + .05 * S, 0); gr.addColorStop(0, 'rgba(10,5,4,0)'); gr.addColorStop(.5, 'rgba(10,5,4,.16)'); gr.addColorStop(1, 'rgba(10,5,4,0)'); B.fillStyle = gr; B.fillRect(fx - .05 * S, fy - .44 * S, .1 * S, .3 * S);
      gr = B.createLinearGradient(0, fy - .47 * S, 0, fy - .3 * S); gr.addColorStop(0, 'rgba(255,236,210,.1)'); gr.addColorStop(1, 'rgba(255,236,210,0)'); B.fillStyle = gr; B.fillRect(fx - .3 * S, fy - .48 * S, .6 * S, .2 * S);   // the tops of the shoulders take the sky
      for (const s of [-1, 1]) { const cx = fx + s * .1 * S, cy = fy - .39 * S, R = .09 * S, g3 = B.createRadialGradient(cx, cy, 0, cx, cy, R); g3.addColorStop(0, 'rgba(255,236,210,.06)'); g3.addColorStop(1, 'rgba(255,236,210,0)'); B.fillStyle = g3; B.fillRect(cx - R, cy - R, 2 * R, 2 * R); } }
    if (path.arm) { B.save(); B.filter = `blur(${(.01 * S).toFixed(1)}px)`; B.strokeStyle = 'rgba(12,6,4,.34)'; B.lineWidth = .014 * S; B.stroke(path.arm); B.restore(); }   // the sleeves' soft turn into shade where they meet the body
    if (path.hc) { gr = B.createLinearGradient(0, top, 0, top + .2 * S); gr.addColorStop(0, 'rgba(255,240,220,.07)'); gr.addColorStop(1, 'rgba(10,5,4,.16)'); B.fillStyle = gr; B.fill(path.hc);
      if (!back) { B.save(); B.clip(path.hc); B.strokeStyle = 'rgba(10,5,4,.22)'; B.lineWidth = .008 * S; B.filter = `blur(${(.004 * S).toFixed(1)}px)`; const hx = fx + .012 * S * (m.o.f || 1), hy = top + .1 * S;   // the cloth's folds falling from the band
        for (const dx of [-.095, -.07, .07, .1]) { B.beginPath(); B.moveTo(hx + dx * S, hy - .04 * S); B.quadraticCurveTo(hx + dx * 1.15 * S, hy + .03 * S, hx + dx * 1.25 * S, hy + .1 * S); B.stroke(); } B.restore(); } }
    B.restore();
    rim(B, T, off, path, box, [.15, 1], .007 * S, 'rgba(206,196,182,.3)', 'rgba(206,196,182,0)', .004 * S);   // the open sky's edge on heads and shoulders
    // the light plate: hide what is behind; bounce from the lit floor (warm, from below and from the gate's side); the beam where it crosses
    L.save(); L.globalCompositeOperation = 'destination-out'; L.fill(path); L.restore();
    L.save(); L.clip(path); const bA = m.bA ?? .05;
    gr = L.createLinearGradient(0, fy, 0, fy - .7 * S); gr.addColorStop(0, `rgba(255,178,116,${bA})`); gr.addColorStop(1, 'rgba(255,178,116,0)'); L.fillStyle = gr; L.fillRect(...box);
    gr = L.createLinearGradient(fx - .3 * S, 0, fx + .1 * S, 0); gr.addColorStop(0, `rgba(255,190,130,${bA * .8})`); gr.addColorStop(1, 'rgba(255,190,130,0)'); L.fillStyle = gr; L.fillRect(...box); L.restore();
    // the face in soft side light (2026-11-14: Peter's face read as a black mask): the cheek toward the gate warm from the beam's
    // spill and the lit floor, the far side falling into shade; the beard keeps its dark
    if (path.face && !back) { const f = m.o.f || 1, cx = fx + f * .05 * S, A = m.peter ? .3 : .07, [bx, by, bw, bh] = box.map(Math.round);
      T.save(); T.clearRect(bx - 6, by - 6, bw + 12, bh + 12); T.clip(path.face);
      gr = T.createLinearGradient(cx - .075 * S, 0, cx + .07 * S, 0); gr.addColorStop(0, `rgba(255,200,146,${A})`); gr.addColorStop(.55, `rgba(255,186,128,${A * .5})`); gr.addColorStop(1, `rgba(240,170,120,${A * .15})`); T.fillStyle = gr; T.fillRect(...box);
      T.globalCompositeOperation = 'destination-out'; T.fillStyle = '#000'; T.fill(path.hc); T.fill(path.hair); T.restore();   // the cloth and the beard in front of the face keep their own light
      L.save(); L.setTransform(1, 0, 0, 1, 0, 0); const sx = bx - 6 - off[0], sy = by - 6 - off[1]; L.drawImage(T.canvas, sx, sy, bw + 12, bh + 12, sx, sy, bw + 12, bh + 12); L.restore(); }
    if (bc) { L.save(); L.clip(bc); L.clip(path);
      gr = L.createLinearGradient(fx - .26 * S, top, fx + .16 * S, top + .5 * S); const kc = m.peter ? '255,172,100' : '255,200,140'; gr.addColorStop(0, `rgba(${kc},${m.key})`); gr.addColorStop(.5, `rgba(${kc},${m.key * .4})`); gr.addColorStop(1, `rgba(${kc},.02)`); L.fillStyle = gr; L.fillRect(...box);   // the key
      rim(L, T, off, path, box, [1, .4], (m.peter ? .016 : .012) * S, `rgba(255,214,158,${m.rimA})`, `rgba(255,200,140,${m.rimA * .35})`, .006 * S);   // the sun's edge
      L.restore(); }
  };
  const lens = (c, bl = .8) => { const t = canvas(c.width, c.height), x = t.getContext('2d'); x.filter = `blur(${bl}px)`; x.drawImage(c, 0, 0); const cx = c.getContext('2d'); cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, c.width, c.height); cx.drawImage(t, 0, 0); cx.restore(); };   // a lens, not a vector edge
  const plate = (list, bl) => { const off = [CF.PX, CF.PY], B = canvas(CF.PWW, CF.PHH), L = canvas(CF.PWW, CF.PHH), T = canvas(CF.PWW, CF.PHH), xs = [B, L, T].map(c => { const x = c.getContext('2d'); x.translate(-off[0], -off[1]); return x; });
    for (const m of list) { place(m); const bc = beamClip(m); m.key = m.key ?? .2; m.rimA = m.rimA ?? .75; m.bA = m.bA ?? .05; figure(xs[0], xs[1], xs[2], off, m, build(m), bc); }
    lens(B, bl); lens(L, bl); return { B, L }; };
  for (const m of [...MEN, ...FRONT]) { const dx = m.X - PETER.X; m.bA = Math.max(.02, .1 - .025 * Math.hypot(dx, m.D - PETER.D)); }
  CFR.back = plate(MEN); CFR.front = plate(FRONT.filter(m => !m.near)); CFR.near = plate(FRONT.filter(m => m.near), 3.5);   // the nearest two out of focus
  // Peter is drawn each frame (his open hand moves as he speaks): his own small plates
  place(PETER); PETER.key = .32; PETER.rimA = .9; PETER.bA = .12;
  { const pw = Math.ceil(PETER.S * 1.3), ph = Math.ceil(PETER.S * 1.25), off = [Math.floor(PETER.fx - pw / 2), Math.floor(PETER.fy - PETER.S * 1.15)], bc = beamClip(PETER);
    const B = canvas(pw, ph), L = canvas(pw, ph), T = canvas(pw, ph), xs = [B, L, T].map(c => c.getContext('2d')), cache = new Map();
    CFR.peter = { off, B, L, draw: reach => { const key = Math.round(reach * 40); if (cache.has(key)) return cache.get(key);   // 41 steps of the gesture, each drawn once
      for (const x of xs) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, pw, ph); x.translate(-off[0], -off[1]); }
      figure(xs[0], xs[1], xs[2], off, PETER, build(PETER, { ...PETER.o, reach: key / 40 }), bc); lens(B); lens(L);
      const b2 = canvas(pw, ph), l2 = canvas(pw, ph); b2.getContext('2d').drawImage(B, 0, 0); l2.getContext('2d').drawImage(L, 0, 0); const r = { B: b2, L: l2 }; cache.set(key, r); return r; } }; }
  // ---------------- the sun: the pool on the floor (with the long shadows of everyone standing in it), the shaft in the air, the glow ----
  { const PB = { x: -700, y: 880, w: 2600, h: 920 }, pc = canvas(PB.w, PB.h), x = pc.getContext('2d'); x.translate(-PB.x, -PB.y);
    drawFloor(x); x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgb(255,214,160)'; x.fillRect(PB.x, PB.y, PB.w, PB.h);
    x.globalCompositeOperation = 'screen'; x.fillStyle = 'rgb(176,124,70)'; x.fillRect(PB.x, PB.y, PB.w, PB.h);
    const mk = canvas(PB.w, PB.h), mx = mk.getContext('2d'); mx.translate(-PB.x, -PB.y); mx.filter = 'blur(3px)'; mx.fillStyle = '#fff'; poly(mx, poolW); mx.fill();
    mx.globalCompositeOperation = 'destination-out'; mx.filter = 'blur(3.5px)';
    for (const m of [PETER, ...MEN, ...FRONT]) {   // each body's shadow: its silhouette carried along the sun onto the floor
      const S = m.Hm, sp = (x2, y2) => { const [Xs, Ds] = cfSun(m.X + x2 * S, -y2 * S, m.D); return cfP(Xs, 0, Math.max(.6, Ds)); };
      mx.fill(m.kind === 'back' ? cfBack(sp, m.o) : cfMan(sp, m.o)); }
    mx.filter = 'none'; { const gr = mx.createLinearGradient(0, 940, 0, 1800); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.45)'); mx.fillStyle = gr; mx.fillRect(PB.x, PB.y, PB.w, PB.h); }   // weaker toward us
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'destination-in'; x.drawImage(mk, 0, 0);
    CFR.pool = pc; CFR.PB = PB; }
  { const SB = { x: -500, y: 300, w: 2500, h: 1500 }, sc = canvas(SB.w, SB.h), x = sc.getContext('2d'); x.translate(-SB.x, -SB.y);
    const H = hull([...apW, ...poolW]);
    x.filter = 'blur(30px)'; let gr = x.createLinearGradient(apW[0][0], apW[0][1] - 100, poolW[Math.floor(poolW.length / 2)][0], poolW[Math.floor(poolW.length / 2)][1]); gr.addColorStop(0, 'rgba(255,226,170,.55)'); gr.addColorStop(.4, 'rgba(255,214,150,.3)'); gr.addColorStop(1, 'rgba(255,200,140,0)'); x.fillStyle = gr; poly(x, H); x.fill();
    x.filter = 'blur(9px)'; x.globalCompositeOperation = 'lighter'; const r = rng(33);   // rays: from points of the opening along the sun
    for (let i = 0; i < 22; i++) { const X = lerp(G0 + .05, G1 - .05, r()), Y0 = lerp(.3, cfArchY(X) - .05, r()), a = Wb(X, Y0), [Xs, Ds] = cfSun(X, Y0, DW), lam = Math.min(1, (DW - 1.2) / (DW - Ds)), b = cfP(X + (Xs - X) * lam, Y0 * (1 - lam), DW - (DW - Ds) * lam), wd = 8 + 26 * r(), al = .08 + .18 * r();
      gr = x.createLinearGradient(a[0], a[1], b[0], b[1]); gr.addColorStop(0, `rgba(255,232,190,${al})`); gr.addColorStop(.6, `rgba(255,232,190,${al * .4})`); gr.addColorStop(1, 'rgba(255,232,190,0)'); x.strokeStyle = gr; x.lineWidth = wd; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); }
    CFR.shaft = sc; CFR.SB = SB; }
  { const BB = { x: -500, y: 120, w: 1300, h: 1150 }, bc = canvas(BB.w, BB.h), x = bc.getContext('2d'); x.translate(-BB.x, -BB.y); x.filter = 'blur(60px)'; x.fillStyle = 'rgba(255,220,160,.85)'; poly(x, apW); x.fill();
    x.filter = 'blur(16px)'; x.fillStyle = 'rgba(255,240,210,.55)'; poly(x, apW); x.fill(); CFR.bloom = bc; CFR.BB = BB; }
  // dust in the light (관리자 2026-11-14 "빛 파티클을 좀더 고급지고 덜 어색하게": no more snow of sharp white dots): few motes, all of them
  // INSIDE the shaft — each lives at a point of the gateway's opening (ox, oy in 0..1 of its width and height) carried a distance h along
  // the sun — so a mote that drifts toward the opening's edge has drifted to the beam's edge and fades there, and it is brightest in the
  // beam's core. Most are tiny and faint (in focus round Peter's depth); six are large soft discs nearer the camera (out of focus).
  // None in the shadowed foreground, none over a face (CFR.heads). Closed form: each mote's place is a function of u.
  { const r = rng(41); CFR.dust = Array.from({ length: 96 }, (_, i) => ({ ox: r(), oy: .08 + .86 * r(), lam: i < 6 ? .62 + .3 * r() : Math.pow(r(), .85), bok: i < 6, p1: r() * 6.283, p2: r() * 6.283, p3: r() * 6.283, s: r(), a: r() })); }
  CFR.heads = [PETER, ...MEN, ...FRONT].map(m => { const f = m.o.f || 1, back = m.kind === 'back', sit = !back && m.o.pose === 'sit';
    const [x, y] = back ? m.P((m.o.turn || 0) * .048, -.545 - (m.o.seat === 'bench' ? .25 : 0)) : m.P(.03 * f, sit ? -.71 : -.91); return [x, y, .1 * m.S]; });
  CFR.bodies = [PETER, ...MEN, ...FRONT].map(m => { const back = m.kind === 'back', h = back ? (m.o.seat === 'bench' ? .85 : .62) : m.o.pose === 'sit' ? .82 : 1.02; return [m.fx, m.fy, m.S, m.D, h]; });   // a mote behind a nearer body is hidden by it
  { const gc = canvas(256, 256), x = gc.getContext('2d'), im = x.createImageData(256, 256), rr = rng(91); for (let i = 0; i < 65536; i++) { const v = 128 + (rr() - .5) * 110; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); CFR.grain = gc; }
}

function corneliusFresco(ctx, u) {
  const { clamp, ss, lerp } = Pilot, W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v'; u = clamp(u, 0, 5.2);
  const k = Pilot.eio(clamp(u / 5.1)), I = .64 + .36 * ss(.2, 2.4, u);   // the camera's creep; the sun's strength (a haze moving off)
  const C = V ? { z0: 1.2, z: lerp(1.2, 1.3, k), x0: 520, x: lerp(520, 540, k), y0: 872, y: lerp(872, 852, k) }
              : { z0: .86, z: lerp(.86, .92, k), x0: 560, x: lerp(560, 590, k), y0: 860, y: lerp(860, 850, k) };
  const layer = p => { const s = C.z0 * (1 + (C.z / C.z0 - 1) * p), cx = C.x0 + (C.x - C.x0) * p, cy = C.y0 + (C.y - C.y0) * p; ctx.setTransform(s, 0, 0, s, W / 2 - cx * s, H / 2 - cy * s); return s; };
  ctx.save(); ctx.fillStyle = '#16100c'; ctx.fillRect(0, 0, W, H);
  layer(.94); ctx.drawImage(CFR.room, -CF.OX, -CF.OY);
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .5 + .5 * I; ctx.drawImage(CFR.bloom, CFR.BB.x, CFR.BB.y);
  layer(1); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = clamp(I * 1.05); ctx.drawImage(CFR.pool, CFR.PB.x, CFR.PB.y); ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'screen'; layer(.97); ctx.globalAlpha = .75 * I; ctx.drawImage(CFR.shaft, CFR.SB.x, CFR.SB.y); ctx.globalAlpha = 1;
  layer(1);
  const plate = p => { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(p.B, CF.PX, CF.PY); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = I; ctx.drawImage(p.L, CF.PX, CF.PY); };
  plate(CFR.back);
  { const reach = clamp(.15 + .7 * ss(.4, 2.3, u) - .35 * ss(3.0, 4.4, u) + .3 * ss(4.4, 5.1, u)), p = CFR.peter.draw(reach), [ox, oy] = CFR.peter.off;   // the open hand: out, a little back, out again
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(p.B, ox, oy); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = I; ctx.drawImage(p.L, ox, oy); }
  plate(CFR.front); plate(CFR.near);
  // a thinner veil of the shaft in front of everyone, and the dust turning in it
  ctx.globalCompositeOperation = 'screen'; layer(.97); ctx.globalAlpha = .14 * I; ctx.drawImage(CFR.shaft, CFR.SB.x, CFR.SB.y);
  { layer(1); ctx.globalAlpha = 1; const N = Pilot.noise, DF = PETER_D, TOP = .05;
    for (const m of CFR.dust) {
      // drift in the opening's coordinates: slow wander + a gentle turbulence, a slow settling; and slowly along the beam
      const ox = m.ox + .035 * Math.sin(u * .21 + m.p1) + .03 * (N(u * .28 + m.p2 * 3, m.p1 * 5) - .5), oy = m.oy + .03 * Math.sin(u * .17 + m.p2) + .03 * (N(u * .25 + m.p3 * 3, m.p2 * 5) - .5) - .012 * u;
      const edge = ss(0, .16, Math.min(ox, 1 - ox)) * ss(0, .12, Math.min(oy, 1 - oy)); if (edge <= 0) continue;
      const core = Math.exp(-(((ox - .5) / .3) ** 2) - (((oy - .45) / .45) ** 2));                     // the beam's core brighter
      const X0 = CF.G0 + (CF.G1 - CF.G0) * ox, Y0 = oy * (cfArchY(X0) - .02); if (Y0 < TOP + .05) continue;
      const hMax = Math.min((Y0 - TOP) / CF.tanE, (CF.DW - (m.bok ? 2.5 : 3.4)) / CF.hz), h = hMax * clamp(m.lam + .025 * Math.sin(u * .13 + m.p3) + .01 * u);
      const X = X0 + h * CF.hx, Y = Y0 - h * CF.tanE, D = CF.DW - h * CF.hz, [x, y] = cfP(X, Y, D);
      let hid = false; for (const [bx, by, bS, bD, bh] of CFR.bodies) if (bD < D - .05 && Math.abs(x - bx) < .21 * bS && y < by && y > by - bh * bS) { hid = true; break; } if (hid) continue;
      let face = 1; for (const [hx, hy, hr] of CFR.heads) { const d = Math.hypot(x - hx, y - hy) / hr; if (d < 2.2) face = Math.min(face, ss(1.2, 2.2, d)); } if (face <= 0) continue;
      // depth of field round Peter: a circle of confusion that grows quickly toward the camera, slowly beyond him
      const coc = 150 * Math.max(0, 1 / D - 1 / DF) + 22 * Math.max(0, 1 / DF - 1 / D), r0 = (m.bok ? 2.4 : 1.1 + 1.4 * m.s) * 4 / D, R = Math.max(r0 * 2.2, r0 + coc * (m.bok ? 1.6 : 1));
      const glint = .8 + .2 * Math.sin(u * .9 + m.p1 * 2);                                             // a slow turn, no twinkle
      let a = edge * (.25 + .75 * core) * face * glint * I * (m.bok ? .12 + .06 * m.a : (.4 + .4 * m.a) * Math.min(1, (r0 * 2.2 / R) ** 1.2));
      if (a < .006) continue;
      const gr = ctx.createRadialGradient(x, y, 0, x, y, R);
      if (m.bok) { gr.addColorStop(0, `rgba(255,222,172,${a})`); gr.addColorStop(.62, `rgba(255,220,168,${a * .8})`); gr.addColorStop(1, 'rgba(255,214,160,0)'); }
      else { gr.addColorStop(0, `rgba(255,228,184,${a})`); gr.addColorStop(.4, `rgba(255,220,170,${a * .45})`); gr.addColorStop(1, 'rgba(255,214,160,0)'); }
      ctx.fillStyle = gr; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); } }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  // grade: a soft vignette (lighter toward the gate and Peter), grain
  ctx.globalCompositeOperation = 'multiply';
  { const R = Math.hypot(W, H) * .62, gr = ctx.createRadialGradient(W * .38, H * .38, R * .25, W * .45, H * .45, R); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(206,192,180)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .45; ctx.drawImage(ctx.canvas, 0, 0);   // a little contrast: the haze kept, the shapes firmer
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07; const o = Math.floor(u * 24); ctx.translate(-((o * 73) % 256), -((o * 151) % 256)); ctx.fillStyle = ctx.createPattern(CFR.grain, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}
