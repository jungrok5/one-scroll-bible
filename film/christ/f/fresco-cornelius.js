/* fresco-cornelius.js — 「그리스도」 N20 (film 119.4–125.0 s, u = 0..5.6): "'그리 마옵소서' 하던 베드로가 / 부활하신 예수님을 만난 뒤 전한 말."
   (2026-11-15 아내 #46 "왜 바뀌었나": 문장이 0.5초 길어져 0.5초 일찍 시작)
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
   (round 8: Peter's face in shade, found by a few soft value shapes of the gate's light — temple, cheekbone, brow, nose — the beard
   melting into it; his robe tapers from the shoulders to a sash, folds catch the sun, the held-out arm's sleeve hangs.)
   The look's engine (the camera in metres, plaster, flagstones, the gateway burnt out by the sun, the pool and its shadows, the shaft,
   the dust, soft light on figures, the grade) is the kit fresco (kit-fresco.js = motion-skills canvas-film/kits/fresco/kit.js, global
   FRESCO); this file keeps the courtyard's props, the men, Peter and the camera. Load after kit-fresco.js.
   No words are drawn. Closed form: corneliusFresco(ctx, u) depends only on u. API: await buildCorneliusFresco() · corneliusFresco(ctx, u) */
const CFR = {};
const PETER_D = 4.3;   // Peter's depth (also the dust's focus)
// the courtyard in metres, seen by a camera 1.55 m above the floor: X right, Y up, D depth; world px = portrait screen px at zoom 1
const CF = { F: 1000, E: 1.55, YH: 700, CX: 540, DW: 6.5, XL: -3.9, XR: 2.8,
  G0: -3.0, G1: -1.7, GS: 2.35, GH: 3.0,          // the gateway in the back wall: X G0..G1, straight jambs to GS, a round arch to GH
  tanE: .32, hx: .7, hz: .714,                     // the sun: low (tan of its height), travelling right (hx) and toward us (hz)
  OX: 900, OY: 300, RW: 3000, RH: 2100,            // the room plate: world x -900..2100, y -300..1800
  PX: -620, PY: 330, PWW: 2400, PHH: 1500 };       // the people's plates: world x -620.., y 330..
// the camera, the gateway and the sun through it, and the soft shapes the figures are built of: kit-fresco.js (FRESCO)
const CFC = FRESCO.court(CF);
const cfP = CFC.P, cfSun = CFC.sun, cfArchY = CFC.archY, CF_AP = CFC.AP;
const { circ: cfCirc, caps: cfCaps, ik: cfIK, adder: cfAdder } = FRESCO;
// an arm: the upper sleeve, the forearm's sleeve flaring a little to its cuff, the hand coming out of it shaped (wrist, palm, tapering
// fingers, the thumb on its inner side) — never a log and a lump (관점 검수 6차)
function cfArm(add, pt, sh, tg, bend, palmUp) {
  const a = cfIK(sh, tg, .18, .172, bend), dx = a.wr[0] - a.el[0], dy = a.wr[1] - a.el[1], d = Math.hypot(dx, dy) || 1, c = [dx / d, dy / d], pn = [-c[1], c[0]];
  const Q = (t, y) => [a.wr[0] + c[0] * t + pn[0] * y, a.wr[1] + c[1] * t + pn[1] * y], E = k => [a.el[0] + pn[0] * k * .05, a.el[1] + pn[1] * k * .05];
  add(cfCaps(sh, a.el, .058, .05), pt.arm);
  add([E(-1), Q(-.034, -.056), Q(.004, -.062), Q(.014, -.054), Q(.014, .054), Q(.004, .062), Q(-.034, .056), E(1)], pt.arm);
  // the arm held out: its wide sleeve hangs below the forearm in a soft bag of cloth, deepest near the cuff (round 8: the arm read
  // as a box) — pn points down in either mirror, so the cloth always falls
  if (palmUp) { const dn = pn[1] >= 0 ? 1 : -1, D2 = (t, y) => Q(t, y * dn); add([E(dn * .8), D2(-.1, .07), D2(-.05, .1), D2(-.012, .094), D2(.01, .062), D2(.004, .03), D2(-.06, .03)], pt.arm, pt.drape); }
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
  const q = new Path2D(), pt = {}; for (const k of ['band', 'cloak', 'arm', 'drape', 'skin', 'face', 'hair', 'hc', 'hcb', 'hband']) pt[k] = new Path2D();
  const add = cfAdder(P, f, q), U = (x, y) => [x + l * (piv - y), y + dz];
  if (!sit && o.taper) {   // (round 8: Peter's torso read as a box) broad rounded shoulders tapering to the belt, the robe blousing over it, the skirt widening to the hem
    for (const sd of [-1, 1]) { add(cfCaps([sd * .04, -.36], [sd * .04, -.02], .036, .03)); add(cfCirc(sd * .04 + .02, -.012, .05, .022, 10)); }
    add([[0, -.035], [-.172 * w, -.04], U(-.152 * w, -.24), U(-.13 * w, -.44), U(-.122 * w, -.5), U(-.13 * w, -.56), U(-.148 * w, -.63), U(-.168 * w, -.7), U(-.176 * w, -.738), U(-.163 * w, -.768), U(-.136 * w, -.792), U(-.096 * w, -.812), U(-.05, -.832),
      U(.05, -.832), U(.096 * w, -.812), U(.136 * w, -.792), U(.163 * w, -.768), U(.176 * w, -.738), U(.168 * w, -.7), U(.148 * w, -.63), U(.13 * w, -.56), U(.122 * w, -.5), U(.13 * w, -.44), U(.152 * w, -.24), [.172 * w, -.04]]);
  } else if (!sit) {
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
  if (o.taper) {   // a sash wound round the waist (it follows the taper), its knot and two ends hanging on the near side
    add([U(-.127 * w, -.535), U(.127 * w, -.535), U(.124 * w, -.49), U(-.124 * w, -.49)], pt.band);
    add(cfCirc(U(.045 * w, -.51)[0], -.51, .02, .018, 10), pt.band);
    add([U(.035 * w, -.5), U(.058 * w, -.498), U(.064 * w, -.37), U(.046 * w, -.372)], pt.band); add([U(.06 * w, -.5), U(.078 * w, -.496), U(.094 * w, -.4), U(.078 * w, -.398)], pt.band);
  } else {
    add([U(-.15 * w, -.54), U(.15 * w, -.54), U(.152 * w, -.497), U(-.152 * w, -.497)], pt.band);   // the belt
    if (!sit) add([U(.05 * w, -.505), U(.085 * w, -.5), U(.08 * w, -.39), U(.058 * w, -.39)], pt.band);
  }
  if (cloak) {   // the cloak: from the shoulders down the back to the bench, a fold over the near shoulder
    add([U(-.178 * w, -.8), U(-.05, -.838), U(.05, -.81), U(-.04, -.66), U(-.09, -.52), [-.11, -.25], [-.215 * w, -.245], U(-.21 * w, -.5), U(-.205 * w, -.7)], pt.cloak);
    add([U(.03, -.835), U(.168 * w, -.792), U(.19 * w, -.69), U(.1, -.73)], pt.cloak);
  }
  for (const [i, sd] of [[0, -1], [1, 1]]) { const mode = arms[i], sh = U(sd * .148 * w, -.738);   // (the shoulder rounded, 2026-11-14)
    let tg, bend = -sd;
    if (mode === 'knee') { tg = [sd > 0 ? .23 : .17, -.37]; bend = 1; }
    else if (mode === 'clasp') { tg = [.26, -.44 + (sd > 0 ? 0 : .012)]; bend = 1; }
    else if (mode === 'open') { tg = U((.27 + .03 * reach) * w, -.56 - .05 * reach); bend = 1; }
    else if (o.taper) tg = U(sd * .2 * w, -.42);   // (round 8) the hanging arm a little away from the body, the elbow out: the waist shows beside it
    else tg = U(sd * .185 * w, -.41);
    cfArm(add, pt, sh, tg, bend, mode === 'open'); }
  // the head: neck, face (on the side he looks to), short hair or the head cloth and its band, the beard
  // (2026-11-14: the head a tenth larger — it read small on the broad shoulders — grown up from the neck)
  const [hx, hy0] = U(.012, -.9), fcx = hx + .026, hcY = hy0 + .09, add0 = add;
  add0([[hx - .036, hy0 + .045], [hx + .036, hy0 + .045], [hx + .038, hy0 + .088], [hx - .038, hy0 + .088]], pt.skin);
  { const add = (pts, ...to) => add0(pts.map(([x, y]) => [hx + (x - hx) * 1.1, hcY + (y - hcY) * 1.1]), ...to);
  add(cfCirc(fcx, hy0 + .006, .052, .064), pt.face); add([[fcx + .044, hy0 - .008], [fcx + .068, hy0 + .016], [fcx + .046, hy0 + .03]], pt.face);
  if (head === 'cloth') {
    // (round 9: the cloth read as a hard helmet — a flat cap with a hat band) the cloth lies over the skull's dome (no brim), comes down
    // over the forehead to the brow on the face side; the band rings the head, curving round it; the two sides hang to the shoulders,
    // a little fuller below the jaw, their hems uneven where the cloth falls on the shoulder
    const H0 = (x, y) => [hx + x, hy0 + y];
    add([H0(-.088, .0), H0(-.092, -.04), H0(-.076, -.072), H0(-.04, -.092), H0(.005, -.098), H0(.05, -.09), H0(.078, -.068), H0(.088, -.04), H0(.084, -.018), H0(.05, -.014), H0(.0, -.012), H0(-.05, -.004)], pt.hc);
    // the side beyond the face hangs BEHIND it (hcb, drawn before the face): the nose's and the beard's profile stand against the cloth,
    // and no gap of wall shows between the jaw and the cloth
    add([H0(.03, -.03), H0(.088, -.034), H0(.104, .0), H0(.11, .05), H0(.12, .094), H0(.134, .122), H0(.114, .112), H0(.096, .124), H0(.072, .112), H0(.05, .1), H0(.034, .06)], pt.hcb);
    add([H0(-.082, -.03), H0(-.017, -.03), H0(-.02, .03), H0(-.024, .075), H0(-.036, .11), H0(-.06, .126), H0(-.085, .114), H0(-.108, .132), H0(-.134, .118), H0(-.128, .07), H0(-.112, .02), H0(-.1, -.01)], pt.hc);
    add([H0(-.088, -.046), H0(-.04, -.06), H0(.01, -.064), H0(.06, -.056), H0(.089, -.04), H0(.089, -.022), H0(.06, -.036), H0(.01, -.044), H0(-.04, -.04), H0(-.089, -.026)], pt.hband);
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
    add(cfCirc(hx - sd * .006 * at, hy - .008, .075, .071, 18), pt.hc);
    const e = k => sd * k > 0 ? 1 - .45 * at : 1;   // the cloth's edge on the face side comes back as he turns
    // (round 9: a hard shell) the cloth hangs from the band down the back of the neck onto the shoulders: fuller below the band, its
    // hem uneven (lower in the middle of the back, lifted where it lies on each shoulder)
    add([[hx - .079, hy - .02], [hx + .079, hy - .02], [hx + .098 * e(1), hy + .04], [hx + .118 * e(1), hy + .085], [hx + .126 * e(1), hy + .1], [hx + .09 * e(1), hy + .112], [hx + .05, hy + .106], [hx + .012, hy + .128], [hx - .03, hy + .114],
      [hx - .07, hy + .12], [hx - .104 * e(-1), hy + .108], [hx - .128 * e(-1), hy + .098], [hx - .118 * e(-1), hy + .08], [hx - .098 * e(-1), hy + .04]], pt.hc);
    add([[hx - .077, hy - .047], [hx, hy - .037], [hx + .077, hy - .047], [hx + .079, hy - .027], [hx, hy - .017], [hx - .079, hy - .027]], pt.hband);
  } else {
    for (const s of [-1, 1]) add(cfCirc(hx + s * .062, hy + .008, .01, .018, 8), pt.skin);   // the ears
    if (at > .15) { const px0 = hx + sd * (.056 + .026 * at); add([[hx + sd * .05, hy - .018], [px0 + sd * .008, hy + .004], [px0 + sd * .004, hy + .034], [hx + sd * .05, hy + .05]], pt.face);
    }
    // (round 9: a round black ball) the hair sits on the skull and ends in an uneven hairline on the nape, the neck below it
    add([[hx - .05, hy + .03], [hx - .062, hy + .004], [hx - .065, hy - .034], [hx - .04, hy - .067], [hx, hy - .076], [hx + .04, hy - .067], [hx + .065, hy - .034], [hx + .062, hy + .004], [hx + .05, hy + .03], [hx + .032, hy + .038], [hx + .014, hy + .05], [hx - .006, hy + .044], [hx - .026, hy + .049], [hx - .04, hy + .036]], pt.hair);
  }
  return Object.assign(q, pt);
}

async function buildCorneliusFresco() {
  const { clamp, lerp, rng, canvas, noise, hex } = Pilot, { OX, OY, RW, RH, XL, XR, DW, G0, G1, GS, GH } = CF;
  const poly = FRESCO.poly;
  const Wb = (X, Y) => cfP(X, Y, DW);   // a point on the back wall

  // ---------------- the courtyard's colours (albedo) ----------------
  const room = canvas(RW, RH); let g = room.getContext('2d'); g.translate(OX, OY);
  const drawFloor = (x, seed = 12) => FRESCO.flagstones(x, cfP, { XL, XR, DW, near: .7, seed });   // flagstones: limestone slabs laid by hand in rows, earth in the joints, worn and mottled
  drawFloor(g);
  // walls: plaster over stone, a damp grime at the foot, the plaster fallen here and there to the courses beneath (FRESCO.plaster)
  const plaster = (pts, base, seed, wallMap, plain) => FRESCO.plaster(g, pts, base, seed, wallMap, { patches: plain ? 0 : 7,   // patches of bare stone (side walls only: on the back wall they read as blots)
    avoid: (X0, Y0) => (X0 > G0 - .6 && X0 < G1 + .6 && Y0 < GH + .5) || (X0 > -1.9 && X0 < 1.7) });   // never round the gate, never behind Peter
  // the side walls (landscape sees them), then the back wall
  plaster([cfP(XR, 0, DW), cfP(XR, 0, 1), cfP(XR, 9, 1), cfP(XR, 9, DW)], '#a28a70', 31, (X, Y) => cfP(XR, Y, lerp(DW, 1.6, (X + 4) / 7)));
  plaster([cfP(XL, 0, DW), cfP(XL, 0, 1), cfP(XL, 9, 1), cfP(XL, 9, DW)], '#a89076', 37, (X, Y) => cfP(XL, Y, lerp(DW, 1.6, (X + 4) / 7)));
  plaster([Wb(XL, 0), Wb(XR, 0), Wb(XR, 9), Wb(XL, 9)], '#b29b7f', 23, Wb, true);
  for (const [X, D0, D1] of [[XL, DW, 1], [XR, DW, 1], [null]]) {   // damp grime at the foot of every wall
    const pts = X === null ? [Wb(XL, 0), Wb(XR, 0), Wb(XR, .7), Wb(XL, .7)] : [cfP(X, 0, D0), cfP(X, 0, D1), cfP(X, .7, D1), cfP(X, .7, D0)];
    const y0 = X === null ? Wb(0, .7)[1] : cfP(0, .7, 3)[1], y1 = X === null ? Wb(0, 0)[1] : cfP(0, 0, 1.4)[1]; FRESCO.grime(g, pts, y0, y1); }
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
  FRESCO.gateStones(g, CFC, 4);
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
  FRESCO.grain(g, RW, RH, 5);
  // ---------------- the courtyard's own light (open shade): the bounce off the sunlit floor, darker up the walls, under the awning, to the right
  FRESCO.openShade(g, RW, RH, OX, OY, { base: 'rgb(222,206,188)', bounce: [[520, 1080, 900, 'rgba(100,72,44,1)'], [220, 900, 520, 'rgba(96,70,42,1)'], [760, 1260, 600, 'rgba(70,50,30,1)']],
    shade: lx => {
      let gr = lx.createLinearGradient(0, -OY, 0, 760); gr.addColorStop(0, 'rgb(140,130,124)'); gr.addColorStop(1, '#fff'); lx.fillStyle = gr; lx.fillRect(-OX, -OY, RW, 1060);
      gr = lx.createLinearGradient(400, 0, 1700, 0); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(176,166,160)'); lx.fillStyle = gr; lx.fillRect(-OX, -OY, RW, RH);
      gr = lx.createLinearGradient(0, 1120, 0, 1800); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(160,150,140)'); lx.fillStyle = gr; lx.fillRect(-OX, 1120, RW, 700);   // the near floor in the people's shade
      lx.filter = 'blur(40px)'; lx.fillStyle = 'rgb(168,158,150)'; poly(lx, [cfP(1.2, 2.35, 2.9), cfP(XR, 2.62, 2.9), cfP(XR, 0, 2.9), cfP(1.5, 0, 6), cfP(1.2, 2.35, 6)]); lx.fill(); lx.filter = 'none';
    } });
  // the opening: the low sun beyond it burns it out white-gold; the far side of the lane a paler shape in the glare; the left jamb's inner
  // face and the arch's soffit in shade, the threshold lit
  FRESCO.gate(g, CFC, { depth: .5, veil: 400 });
  CFR.room = FRESCO.defocus(room, { blur: 1.2, oy: OY, rows: [[1200, 2.5], [1380, 4.5], [1560, 7]] });   // the walls a touch out of focus, the near floor more

  // ---------------- the people ----------------
  const PE = (typeof RD_PETER !== 'undefined') ? RD_PETER : { body: '#7e4c44', hc: '#c9a06a', band: '#4a3426', hair: '#3a302c', w: 1.1 };   // part 3's Peter
  const deep = c => '#' + Pilot.hex(c).map((v, i) => Math.round(v * [.84, .7, .5][i]).toString(16).padStart(2, '0')).join('');   // the head cloth a deeper ochre (in this light the pastel one read pale, like fair hair)
  const PETER = { X: -.45, D: PETER_D, Hm: 1.8, kind: 'man', peter: true, o: { f: 1, w: PE.w || 1.1, head: 'cloth', lean: .015, arms: ['hang', 'open'], taper: true }, c: { body: PE.body, hc: deep(PE.hc), band: PE.band, hair: PE.hair, skin: '#b48a6e', faceK: .82, softBeard: true }, amb: .54 };   // (round 8: the face in shade, modelled by the light — faceK was 1.12, a flat pale plane)
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
    if (c.hc && p.hcb) { x.fillStyle = tone(c.hc, .88); x.fill(p.hcb); }   // the cloth's far side, behind the face and a little in its shade
    x.fillStyle = tone(c.skin); x.fill(p.skin); x.fillStyle = tone(c.skin, c.faceK || .78); x.fill(p.face);
    if (!c.softBeard) { x.fillStyle = tone(c.hair); x.fill(p.hair); }   // (Peter's beard is laid in soft, after his face's shading)
    if (c.hc) { x.fillStyle = tone(c.hc); x.fill(p.hc); x.save(); x.clip(p.hc); x.fillStyle = tone(c.band); x.fill(p.hband); x.restore(); } };
  const place = m => { const [fx, fy] = cfP(m.X, 0, m.D), S = CF.F * m.Hm / m.D; m.fx = fx; m.fy = fy; m.S = S; m.P = (x, y) => [fx + x * S, fy + y * S]; return m; };
  const build = (m, o = m.o) => m.kind === 'back' ? cfBack(m.P, o) : cfMan(m.P, o);
  // which part of a figure the beam crosses: the beam's section at its depth (null if none of it)
  const beamClip = m => { const pts = CFC.beamAt(m.D), xs = pts.map(p => p[0]); if (Math.max(...xs) < m.fx - .4 * m.S || Math.min(...xs) > m.fx + .4 * m.S) return null; const p = new Path2D(); poly(p, pts); return p; };
  // a soft edge of light on a figure, never a line round it (FRESCO.rim), or only on its outer edge toward a light behind it (FRESCO.edgeOn)
  const { rim, edgeOn, lens } = FRESCO;
  // one figure onto a base plate B (its colours in the open shade, roundness, folds, a skylight edge) and a light plate L (what the beam and
  // the lit floor add: drawn later with the sun's strength); T is scratch; all three translated by -off
  const figure = (B, L, T, off, m, path, bc) => {
    const { fx, fy, S } = m, back = m.kind === 'back', sit = back || m.o.pose === 'sit', top = fy - (back ? .6 : sit ? .78 : 1) * S;
    const box = [fx - .6 * S, fy - 1.06 * S, 1.2 * S, 1.12 * S];
    // head units → px: from behind, relative to the head's centre (cfBack); three-quarter, relative to (hx, hy0) of cfMan with its 1.1 growth
    const UH = back ? (x, y) => m.P((m.o.turn || 0) * .048 + x, -.545 - (m.o.seat === 'bench' ? .25 : 0) + y)
      : (() => { const f = m.o.f || 1, sm = m.o.pose === 'sit', l = m.o.lean || 0, hxu = .012 + l * ((sm ? -.5 : 0) + .9), hyu = -.9 + (sm ? .2 : 0); return (x, y) => m.P(f * (hxu + x * 1.1), hyu + .09 + (y - .09) * 1.1); })();
    // the shadow under it
    B.save(); B.filter = `blur(${(.014 * S).toFixed(1)}px)`; B.fillStyle = 'rgba(16,9,5,.5)'; B.beginPath(); B.ellipse(fx + (m.o.pose === 'sit' ? .14 * (m.o.f || 1) : 0) * S, fy - .004 * S, (back ? .32 : .24) * S, .032 * S, 0, 0, 6.283); B.fill(); B.restore();
    const a = m.amb || .6; AMB = [a, a * .9, a * .82]; parts(B, path, m.c);
    // the face's shading first, then the beard and the cloth again over it (they stand in front of the face)
    // Peter (round 8: the face read as a smooth pale plane with a beard stuck on — a mask): the face in shade, its planes found by a
    // few soft value shapes — the light from the gateway (behind him, on his left) grazes the temple and the cheekbone on that side,
    // a faint touch on the brow ridge and the bridge of the nose; the eye's hollow and the far cheek fall into shade; the beard
    // melts into the shading. No eyes, no mouth drawn. FH maps head units (as in cfMan: relative to the face centre, before the
    // head's 1.1 growth) to px.
    const pf = m.o.f || 1, plx = m.o.lean || 0, phx = .012 + plx * .9, phy = -.9, pfc = phx + .026;
    const FH = (x, y) => { const ux = pfc + x, uy = phy + y; return m.P(pf * (phx + (ux - phx) * 1.1), phy + .09 + (uy - phy - .09) * 1.1); };
    const blob = (X, x, y, rx, ry, rot, rgb, a) => { const [cx, cy] = FH(x, y), R = S * 1.1; X.save(); X.translate(cx, cy); X.rotate(rot * pf); X.scale(rx * R, ry * R);
      const g3 = X.createRadialGradient(0, 0, 0, 0, 0, 1); g3.addColorStop(0, `rgba(${rgb},${a})`); g3.addColorStop(.55, `rgba(${rgb},${a * .45})`); g3.addColorStop(1, `rgba(${rgb},0)`); X.fillStyle = g3; X.beginPath(); X.arc(0, 0, 1, 0, 6.283); X.fill(); X.restore(); };
    const UB = (x, y) => m.P(pf * x, y), PFOLDS = [
        [[[-.13, -.735], [-.08, -.64], [-.03, -.56]], .016, .42, .14], [[[-.06, -.79], [-.03, -.68], [-.005, -.57]], .012, .29, .10],     // from the far shoulder to the waist
        [[[.15, -.72], [.08, -.65], [.03, -.565]], .016, .48, .12], [[[.11, -.69], [.07, -.62], [.055, -.565]], .01, .32, .08],             // pulled toward the held-out arm
        [[[-.085, -.48], [-.1, -.28], [-.12, -.06]], .018, .45, .16], [[[-.03, -.48], [-.035, -.26], [-.045, -.05]], .014, .35, .14],    // falling from the sash to the hem
        [[[.04, -.47], [.05, -.26], [.06, -.05]], .016, .42, .12], [[[.1, -.47], [.115, -.26], [.135, -.05]], .018, .51, .10]];
    const fold = (X, pts, wd, a, la, litOnly) => { X.save(); X.lineCap = 'round'; X.lineJoin = 'round';   // a fold: a soft shade, its lit edge on the gate side
      const path2 = () => { X.beginPath(); pts.forEach((p, i) => { const q = UB(...p); i ? X.lineTo(...q) : X.moveTo(...q); }); };
      X.filter = `blur(${(wd * .7 * S).toFixed(1)}px)`; if (!litOnly) { X.strokeStyle = `rgba(14,6,4,${a})`; X.lineWidth = wd * S; path2(); X.stroke(); }
      X.translate(-pf * wd * .9 * S, 0); X.strokeStyle = `rgba(255,222,190,${litOnly ? Math.min(1, la * 1.5) : la})`; X.lineWidth = wd * .55 * S; path2(); X.stroke(); X.restore(); };
    if (path.face && m.peter) { B.save(); B.clip(path.face);
      let g4 = B.createLinearGradient(...FH(-.05, 0), ...FH(.06, 0)); g4.addColorStop(0, 'rgba(10,5,4,0)'); g4.addColorStop(.5, 'rgba(10,5,4,.12)'); g4.addColorStop(1, 'rgba(10,5,4,.38)'); B.fillStyle = g4; B.fillRect(...box);   // the far cheek turns away into shade
      blob(B, .012, -.007, .034, .012, 0, '10,5,4', .46);        // the eye's hollow under the brow (one soft shade across both)
      blob(B, -.008, .03, .022, .011, .2, '10,5,4', .22);        // the hollow under the cheekbone
      blob(B, .046, .024, .012, .007, 0, '10,5,4', .3);          // the shade under the nose
      B.restore();
      B.save(); B.filter = `blur(${(.0035 * S).toFixed(1)}px)`; B.fillStyle = tone(m.c.hair); B.fill(path.hair); B.restore();   // the beard, its edge soft against the cheek
      B.save(); B.clip(path.hair); g4 = B.createLinearGradient(0, FH(0, .03)[1], 0, FH(0, .07)[1]); g4.addColorStop(0, 'rgba(118,84,62,.4)'); g4.addColorStop(1, 'rgba(118,84,62,0)'); B.fillStyle = g4; B.fillRect(...box); B.restore();   // thinning into the cheek
      const c = m.c; B.fillStyle = tone(c.hc); B.fill(path.hc); B.save(); B.clip(path.hc); B.fillStyle = tone(c.band); B.fill(path.hband); B.restore(); }
    else if (path.face) { let gr; B.save(); B.clip(path.face); gr = B.createLinearGradient(fx - .03 * S, 0, fx + .09 * S, 0); gr.addColorStop(0, `rgba(10,5,4,${back ? .25 : .1})`); gr.addColorStop(1, 'rgba(10,5,4,0)'); B.fillStyle = gr; B.fillRect(...box);
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
    if (m.peter) {   // (round 8: the torso read as a box) the robe's volume: blousing over the sash, folds pulled from the shoulders to the
      // waist and falling from the sash to the hem — each a soft shade with its lit edge on the gate side; the hanging sleeve's belly in shade
      gr = B.createLinearGradient(0, UB(0, -.6)[1], 0, UB(0, -.535)[1]); gr.addColorStop(0, 'rgba(255,226,196,.07)'); gr.addColorStop(.55, 'rgba(14,6,4,0)'); gr.addColorStop(1, 'rgba(14,6,4,.32)'); B.fillStyle = gr; B.fillRect(...box);   // the blouse over the sash
      for (const fd of PFOLDS) fold(B, ...fd, false);
      gr = B.createLinearGradient(...UB(-.16, 0), ...UB(.17, 0)); gr.addColorStop(0, 'rgba(255,226,196,.05)'); gr.addColorStop(.3, 'rgba(255,226,196,.08)'); gr.addColorStop(.62, 'rgba(14,6,4,.06)'); gr.addColorStop(1, 'rgba(14,6,4,.3)'); B.fillStyle = gr; B.fillRect(...box);   // round, not flat: the near side up into the light
      if (path.drape) { B.save(); B.clip(path.drape); gr = B.createLinearGradient(0, UB(0, -.6)[1], 0, UB(0, -.5)[1]); gr.addColorStop(0, 'rgba(14,6,4,.05)'); gr.addColorStop(1, 'rgba(14,6,4,.42)'); B.fillStyle = gr; B.fillRect(...box); B.restore(); } }
    if (back) {   // the spine's valley and the shoulder blades
      gr = B.createLinearGradient(fx - .05 * S, 0, fx + .05 * S, 0); gr.addColorStop(0, 'rgba(10,5,4,0)'); gr.addColorStop(.5, 'rgba(10,5,4,.16)'); gr.addColorStop(1, 'rgba(10,5,4,0)'); B.fillStyle = gr; B.fillRect(fx - .05 * S, fy - .44 * S, .1 * S, .3 * S);
      gr = B.createLinearGradient(0, fy - .47 * S, 0, fy - .3 * S); gr.addColorStop(0, 'rgba(255,236,210,.1)'); gr.addColorStop(1, 'rgba(255,236,210,0)'); B.fillStyle = gr; B.fillRect(fx - .3 * S, fy - .48 * S, .6 * S, .2 * S);   // the tops of the shoulders take the sky
      for (const s of [-1, 1]) { const cx = fx + s * .1 * S, cy = fy - .39 * S, R = .09 * S, g3 = B.createRadialGradient(cx, cy, 0, cx, cy, R); g3.addColorStop(0, 'rgba(255,236,210,.06)'); g3.addColorStop(1, 'rgba(255,236,210,0)'); B.fillStyle = g3; B.fillRect(cx - R, cy - R, 2 * R, 2 * R); } }
    if (path.arm) { B.save(); B.filter = `blur(${(.01 * S).toFixed(1)}px)`; B.strokeStyle = `rgba(12,6,4,${m.peter ? .55 : .34})`; B.lineWidth = (m.peter ? .02 : .014) * S; B.stroke(path.arm); B.restore(); }   // the sleeves' soft turn into shade where they meet the body
    if (path.hc) { gr = B.createLinearGradient(0, top, 0, top + .2 * S); gr.addColorStop(0, 'rgba(255,240,220,.05)'); gr.addColorStop(1, 'rgba(10,5,4,.14)'); B.fillStyle = gr; B.fill(path.hc);
      // (round 9: the cloths read as hard helmets) cloth: the folds falling from the band to the hem, each a soft shade with a faint
      // lit side; the cloth gathered in shade just under the band; two soft pulls over the crown toward the back
      B.save(); B.clip(path.hc); B.lineCap = 'round'; const rf2 = rng(Math.round(fx * 5 + fy * 3)), x0s = back ? [-.096, -.058, -.02, .024, .07] : [-.118, -.09, -.06, -.036];
      B.filter = `blur(${(.0045 * S).toFixed(1)}px)`;
      for (const dx of x0s) { const j = (rf2() - .5) * .012, y1 = (back ? .1 : .115) + (rf2() - .5) * .02, a = .2 + .14 * rf2(), p0 = UH(dx * .92 + j, back ? -.01 : -.016), p1 = UH(dx * 1.06 + j * 1.5, (y1 + (back ? -.01 : -.016)) / 2), p2 = UH(dx * 1.18 + j * 2, y1);
        B.strokeStyle = `rgba(12,6,4,${a})`; B.lineWidth = (.006 + .004 * rf2()) * S; B.beginPath(); B.moveTo(...p0); B.quadraticCurveTo(...p1, ...p2); B.stroke();
        B.save(); B.translate(-.006 * S, 0); B.strokeStyle = `rgba(255,236,206,${.05 + .05 * rf2()})`; B.lineWidth = .004 * S; B.beginPath(); B.moveTo(...p0); B.quadraticCurveTo(...p1, ...p2); B.stroke(); B.restore(); }
      { const a0 = UH(-.09, back ? -.012 : -.018), a1 = UH(.09, back ? -.012 : -.018); B.strokeStyle = 'rgba(12,6,4,.28)'; B.lineWidth = .012 * S; B.beginPath(); B.moveTo(...a0); B.quadraticCurveTo(...UH(0, back ? -.002 : -.03), ...a1); B.stroke(); }   // gathered under the band
      B.strokeStyle = 'rgba(12,6,4,.12)'; B.lineWidth = .006 * S; for (const s of [-1, 1]) { B.beginPath(); B.moveTo(...UH(s * .02, back ? -.07 : -.088)); B.quadraticCurveTo(...UH(s * .055, back ? -.065 : -.08), ...UH(-.07 + s * .01, back ? -.04 : -.05)); B.stroke(); }
      B.restore(); }
    if (back && m.o.head === 'hair') {   // (round 9: round black balls) short hair: strands from the crown down and out, a few catching the light, the crown taking the sky, darker at the nape
      const [hx, hy] = UH(0, 0), rh = rng(Math.round(fx * 3 + fy * 5)); B.save(); B.clip(path.hair);
      let g5 = B.createLinearGradient(hx - .05 * S, hy - .07 * S, hx + .03 * S, hy + .05 * S); g5.addColorStop(0, 'rgba(196,182,166,.2)'); g5.addColorStop(.5, 'rgba(196,182,166,.03)'); g5.addColorStop(1, 'rgba(6,3,2,.3)'); B.fillStyle = g5; B.fillRect(...box);
      B.lineCap = 'round';
      for (let i = 0; i < 90; i++) { const a = rh() * 6.283, rr = Math.sqrt(rh()), x0 = hx + Math.cos(a) * rr * .062 * S, y0 = hy - .012 * S + Math.sin(a) * rr * .066 * S, dx = x0 - hx, dy = y0 - (hy - .055 * S), dl = Math.hypot(dx, dy) || 1, Ls = (.012 + .018 * rh()) * S, cv = (rh() - .5) * .5, lt = rh() < .42;
        B.strokeStyle = lt ? `rgba(160,138,116,${.14 + .16 * rh()})` : `rgba(4,2,1,${.2 + .2 * rh()})`; B.lineWidth = (.0022 + .0022 * rh()) * S;
        B.beginPath(); B.moveTo(x0, y0); B.quadraticCurveTo(x0 + (dx * .5 - dy * cv) / dl * Ls, y0 + (dy * .5 + dx * cv) / dl * Ls, x0 + dx / dl * Ls, y0 + dy / dl * Ls); B.stroke(); }
      B.restore(); }
    if (back && m.o.head === 'hair') {   // the nape: the hairline's soft shadow on the neck, the neck rounder (its sides in shade) — (under a head cloth the neck is hidden)
      const [hx, hy] = UH(0, 0); B.save(); B.clip(path.skin); let g6 = B.createLinearGradient(0, hy + .04 * S, 0, hy + .09 * S); g6.addColorStop(0, 'rgba(10,5,4,.55)'); g6.addColorStop(1, 'rgba(10,5,4,0)'); B.fillStyle = g6; B.fillRect(...box);
      g6 = B.createLinearGradient(hx - .04 * S, 0, hx + .04 * S, 0); g6.addColorStop(0, 'rgba(10,5,4,.3)'); g6.addColorStop(.35, 'rgba(10,5,4,0)'); g6.addColorStop(.7, 'rgba(10,5,4,0)'); g6.addColorStop(1, 'rgba(10,5,4,.4)'); B.fillStyle = g6; B.fillRect(...box);
      for (const s of [-1, 1]) { const [ex, ey] = UH(s * .062, .008), R = .03 * S, g8 = B.createRadialGradient(ex, ey, 0, ex, ey, R); g8.addColorStop(0, 'rgba(10,5,4,.38)'); g8.addColorStop(1, 'rgba(10,5,4,0)'); B.fillStyle = g8; B.fillRect(ex - R, ey - R, 2 * R, 2 * R); }   // the ears in the head's shade
      B.restore(); }
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
      if (m.peter) {   // the planes the light finds (round 8): temple and cheekbone on the gate side strongest, the brow ridge, the nose's bridge and tip faint
        blob(T, -.036, -.014, .015, .024, .2, '255,204,150', 1); blob(T, -.026, .013, .018, .029, .35, '255,196,140', .95);
        blob(T, .0, -.021, .034, .009, -.05, '255,206,156', .7); blob(T, .036, .0, .0075, .019, -.35, '255,206,156', .65); blob(T, .05, .016, .009, .008, 0, '255,200,150', .5);
        // (round 9: still a dark lump at phone size) the warm floor's bounce from below as a fill: the near cheek, the nose's tip, the
        // eye's hollow out of black — the far side and the brow's shadow kept
        { const [ax, ay] = FH(0, .085), [ex, ey] = FH(0, -.045), g7 = T.createLinearGradient(ax, ay, ex, ey); g7.addColorStop(0, 'rgba(255,170,104,.24)'); g7.addColorStop(.55, 'rgba(255,170,104,.06)'); g7.addColorStop(1, 'rgba(255,170,104,0)'); T.fillStyle = g7; T.fillRect(...box); }
        blob(T, .026, .032, .022, .016, 0, '255,184,126', .45); blob(T, .053, .021, .01, .007, 0, '255,206,156', .32); blob(T, .014, .004, .03, .01, 0, '255,186,136', .18);
      } else { gr = T.createLinearGradient(cx - .075 * S, 0, cx + .07 * S, 0); gr.addColorStop(0, `rgba(255,200,146,${A})`); gr.addColorStop(.55, `rgba(255,186,128,${A * .5})`); gr.addColorStop(1, `rgba(240,170,120,${A * .15})`); T.fillStyle = gr; T.fillRect(...box); }
      T.globalCompositeOperation = 'destination-out'; T.fillStyle = '#000'; T.fill(path.hc); T.fill(path.hair); T.restore();   // the cloth and the beard in front of the face keep their own light
      L.save(); L.setTransform(1, 0, 0, 1, 0, 0); const sx = bx - 6 - off[0], sy = by - 6 - off[1]; L.drawImage(T.canvas, sx, sy, bw + 12, bh + 12, sx, sy, bw + 12, bh + 12); L.restore();
      if (m.peter) { L.save(); L.clip(path.hair); blob(L, -.044, .062, .012, .032, .25, '230,170,120', .3); L.restore(); } }   // the beard's edge on the gate side takes a little of the light
    // (round 9: the heads read as black balls and hard helmets) the gateway's light is behind them: a warm edge on each head (hair or
    // cloth) and the neck on the side toward the gate; a head cloth, thin and backlit, glows a little beyond its own edge there
    if (back || m.peter) { const hp = m.o.head === 'hair' ? path.hair : path.hc, Lt = back ? [.8, .55] : [1, .3], gA = m.near ? .7 : 1;
      edgeOn(L, T, off, path, hp, box, Lt, .016 * S, 'rgb(255,208,150)', .005 * S, .9 * gA, false);
      if (m.o.head !== 'hair') edgeOn(L, T, off, path, path.hc, box, Lt, .016 * S, 'rgb(255,184,104)', .013 * S, (m.peter ? .45 : .35) * gA, true);
      if (back && m.o.head === 'hair') edgeOn(L, T, off, path, path.skin, box, [.9, .2], .009 * S, 'rgb(255,196,146)', .004 * S, .45, false); }
    if (m.peter) { L.save(); L.clip(path.hair); const [ax, ay] = FH(0, .108), [ex, ey] = FH(0, .045), g7 = L.createLinearGradient(ax, ay, ex, ey);   // the beard: the floor's warm bounce under it, a few strands catching it
      g7.addColorStop(0, 'rgba(226,156,104,.18)'); g7.addColorStop(1, 'rgba(226,156,104,0)'); L.fillStyle = g7; L.fillRect(...box); L.restore(); }
    if (bc) { L.save(); L.clip(bc); L.clip(path);
      gr = L.createLinearGradient(fx - .26 * S, top, fx + .16 * S, top + .5 * S); const kc = m.peter ? '255,172,100' : '255,200,140'; gr.addColorStop(0, `rgba(${kc},${m.key})`); gr.addColorStop(.5, `rgba(${kc},${m.key * .4})`); gr.addColorStop(1, `rgba(${kc},.02)`); L.fillStyle = gr; L.fillRect(...box);   // the key
      if (m.peter) for (const fd of PFOLDS) fold(L, ...fd, true);   // the folds' edges catch the sun
      rim(L, T, off, path, box, [1, .4], (m.peter ? .016 : .012) * S, `rgba(255,214,158,${m.rimA})`, `rgba(255,200,140,${m.rimA * .35})`, .006 * S);   // the sun's edge
      L.restore(); }
  };
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
  { const PB = { x: -700, y: 880, w: 2600, h: 920 };
    CFR.pool = FRESCO.sunPool(CFC, PB, x => drawFloor(x), mx => {
      for (const m of [PETER, ...MEN, ...FRONT]) {   // each body's shadow: its silhouette carried along the sun onto the floor
        const sp = CFC.cast(m.X, m.D, m.Hm); mx.fill(m.kind === 'back' ? cfBack(sp, m.o) : cfMan(sp, m.o)); } }, { clip: .8, fade: [940, 1800, .45] });
    CFR.PB = PB; }
  { const SB = { x: -500, y: 300, w: 2500, h: 1500 }; CFR.shaft = FRESCO.shaft(CFC, SB, { clip: .8, n: 22, seed: 33, nearD: 1.2 }); CFR.SB = SB; }   // the shaft in the air, rays from points of the opening
  { const BB = { x: -500, y: 120, w: 1300, h: 1150 }; CFR.bloom = FRESCO.bloom(CFC, BB); CFR.BB = BB; }
  // dust in the light (관리자 2026-11-14 "빛 파티클을 좀더 고급지고 덜 어색하게": no more snow of sharp white dots): few motes, all of them
  // INSIDE the shaft — each lives at a point of the gateway's opening (ox, oy in 0..1 of its width and height) carried a distance h along
  // the sun — so a mote that drifts toward the opening's edge has drifted to the beam's edge and fades there, and it is brightest in the
  // beam's core. Most are tiny and faint (in focus round Peter's depth); six are large soft discs nearer the camera (out of focus).
  // None in the shadowed foreground, none over a face (CFR.heads). Closed form: each mote's place is a function of u.
  CFR.dust = FRESCO.dust(96, 41, 6);
  CFR.heads = [PETER, ...MEN, ...FRONT].map(m => { const f = m.o.f || 1, back = m.kind === 'back', sit = !back && m.o.pose === 'sit';
    const [x, y] = back ? m.P((m.o.turn || 0) * .048, -.545 - (m.o.seat === 'bench' ? .25 : 0)) : m.P(.03 * f, sit ? -.71 : -.91); return [x, y, .1 * m.S]; });
  CFR.bodies = [PETER, ...MEN, ...FRONT].map(m => { const back = m.kind === 'back', h = back ? (m.o.seat === 'bench' ? .85 : .62) : m.o.pose === 'sit' ? .82 : 1.02; return [m.fx, m.fy, m.S, m.D, h]; });   // a mote behind a nearer body is hidden by it
  CFR.grain = FRESCO.grainTile(91);
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
  { layer(1); ctx.globalAlpha = 1; FRESCO.drawDust(ctx, u, CFR.dust, CFC, { focus: PETER_D, I, top: .05, near: [2.5, 3.4], bodies: CFR.bodies, heads: CFR.heads }); }
  // grade: a soft vignette (lighter toward the gate and Peter), a little contrast (the haze kept, the shapes firmer), grain
  FRESCO.finish(ctx, u, CFR.grain);
  ctx.restore();
}
