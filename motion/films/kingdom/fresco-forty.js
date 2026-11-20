// fresco-forty.js — 「kingdom」 6부 N27b · L9 · Q15 · N28 (film 631.9 → 655.4): "그리고 사십 일 동안 / 무엇을 말씀하셨을까요?" —
// Acts 1:3 «사십 일 동안 그들에게 보이시며 하나님 나라의 일을 말씀하시니라» — "처음 전파하실 때부터 하늘로 오르시기 전까지, 하나님 나라였습니다."
// Limewashed walls under a low sun: the courtyard of a stone house, after 「그리스도」's fresco (kit-fresco.js = motion-skills canvas-film
// kits/fresco, vendored unchanged). The low sun stands beyond the gateway (here on the RIGHT: the whole courtyard is built in the kit's
// space with the gate on the left and drawn mirrored, so it is not 「그리스도」's courtyard again); its opening burns white-gold, a shaft
// hangs in the air with dust turning in it, a long pool lies across the flagstones toward us, and every body's long shadow runs out of it.
// In the gateway stands one man, small, a silhouette against the glare (no face, no feature — the outline of his head cloth falls down his
// back; plain robe like the others: 다른 이들과 구별되지 않게); he speaks with a slow open hand. Before him, a small irregular group sits on the
// flagstones and on a low step, most from behind, heads turned to him; their long shadows come toward us.
//   N27b  dissolve in (the page's): the courtyard; idle life — one man turns from his neighbour to the gate, another settles, everyone
//         breathes; the man in the gate lifts his hand as he begins to speak
//   L9    —
//   Q15   the dust turns in the shaft; one after another (staggered, eased 1.6–2.4 s each) the listeners lean in toward him — and their long
//         shadows on the floor lean with them
//   N28   the light widens: the sun's strength grows, the glare of the gateway spreads over the walls and floor (마당의 빛이 문밖으로 넓게 번짐) —
//         the hard cut to the Mount of Olives (olivet3d.js, golden backlight) follows at 655.4
// Camera: locked off in feel — a slow creep of 7.5 % over the 24 s with a slight slide toward the gate (eased), so the picture is never frozen;
// the sun's strength breathes ±7 % as thin cloud passes (the shaft and the pool brighten and dim). Figures: rigs cfArm / cfMan / cfBack and the figure() plates
// copied verbatim from motion/films/christ/fresco-cornelius.js (commit 156ea5f4; that file is not changed); the standing man in the gate
// (stander) is new, built from the same parts. Body motion: no limb snaps — a lean is an eased shear about the seat, a head turn is
// drawn in 61 steps, the open hand in 81 steps of an IK arm (elbow down and out), all eased.
// API: const FF = await (await import('./fresco-forty.js')).build(W, H);  FF.draw(ctx, t, T) with T = FF.beats(B) (B: N27b L9 Q15 N28 N15c).
//      t = FILM seconds. Pure in t. Needs window.Pilot (lib.js) and window.FRESCO (kit-fresco.js).
const Pl = window.Pilot, FRESCO = window.FRESCO;
const { circ: cfCirc, caps: cfCaps, ik: cfIK, adder: cfAdder } = FRESCO;
// ---- copied verbatim from motion/films/christ/fresco-cornelius.js (commit 156ea5f4) lines 39–173: cfArm, cfMan, cfBack ----
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


// the man in the gateway: standing, the same build as everyone (cfMan's tapered robe and belt, a head cloth to the shoulders), but drawn as
// seen from behind / against the light — a symmetric head with the cloth falling down the back (cfBack's head at standing height): no face,
// no nose or beard line in the outline. One arm hangs, the other (toward the listeners, +x) opens slowly: reach 0..1 (IK, elbow down/out).
function stander(P, o) {
  const { w = 1, reach = 0 } = o, q = new Path2D(), pt = {}; for (const k of ['band', 'arm', 'skin', 'hc', 'hband', 'face', 'hair', 'drape', 'cloak', 'mantle', 'stripe', 'hcb']) pt[k] = new Path2D();
  const add = cfAdder(P, 1, q), U = (x, y) => [x, y];
  for (const sd of [-1, 1]) { add(cfCaps([sd * .04, -.36], [sd * .04, -.02], .036, .03)); add(cfCirc(sd * .04 + .02 * sd, -.012, .05, .022, 10)); }
  add([[0, -.035], [-.172 * w, -.04], U(-.152 * w, -.24), U(-.13 * w, -.44), U(-.122 * w, -.5), U(-.13 * w, -.56), U(-.148 * w, -.63), U(-.168 * w, -.7), U(-.176 * w, -.738), U(-.163 * w, -.768), U(-.136 * w, -.792), U(-.096 * w, -.812), U(-.05, -.832),
    U(.05, -.832), U(.096 * w, -.812), U(.136 * w, -.792), U(.163 * w, -.768), U(.176 * w, -.738), U(.168 * w, -.7), U(.148 * w, -.63), U(.13 * w, -.56), U(.122 * w, -.5), U(.13 * w, -.44), U(.152 * w, -.24), [.172 * w, -.04]]);
  add([U(-.127 * w, -.535), U(.127 * w, -.535), U(.124 * w, -.49), U(-.124 * w, -.49)], pt.band);
  // the hanging arm (−x) a little away from the body, the elbow out; the speaking arm (+x) from hanging to open, palm up — the elbow stays
  // below the line from the shoulder to the hand and out to the side (bend −1 on this side, as cfMan's open arm), never up
  { const sh = [-.148 * w, -.738], tg = [-.172 * w, -.41]; cfArm(add, pt, sh, tg, 1, false); }
  { const sh = [.148 * w, -.738], A = armFK(reach), tg = [sh[0] + A.wr[0], sh[1] + A.wr[1]];
    const e1 = cfIK(sh, tg, .18, .172, 1).el, e2 = cfIK(sh, tg, .18, .172, -1).el, want = [sh[0] + A.el[0], sh[1] + A.el[1]];
    const bend = Math.hypot(e1[0] - want[0], e1[1] - want[1]) < Math.hypot(e2[0] - want[0], e2[1] - want[1]) ? 1 : -1; cfArm(add, pt, sh, tg, bend, false); }
  // the head: a neck, the head cloth round the skull and hanging behind to the shoulders (cfBack's head, turn 0, at standing height) —
  // or (o.hood) a mantle drawn over the head: a hood a little larger than the skull falling straight over the shoulders and down the back
  // to the waist, a woven band near its hem (round 2, 2026-11-20: the cloth hanging behind the head read as long hair — a mantle over the
  // head reads as cloth at once, and as a man's prayer mantle)
  const hx = 0, hy = -.9;
  if (o.hood) { add([[0, -1.0], [.05, -.995], [.085, -.97], [.098, -.93], [.104, -.88], [.13, -.83], [.18, -.79], [.21, -.74], [.222, -.66], [.218, -.56], [.206, -.5], [.12, -.474], [0, -.466],
      [-.12, -.474], [-.206, -.5], [-.218, -.56], [-.222, -.66], [-.21, -.74], [-.18, -.79], [-.13, -.83], [-.104, -.88], [-.098, -.93], [-.085, -.97], [-.05, -.995]], pt.hc);
    add([[-.214, -.545], [0, -.512], [.214, -.545], [.212, -.528], [0, -.494], [-.212, -.528]], pt.hband); add([[-.21, -.574], [0, -.54], [.21, -.574], [.21, -.564], [0, -.53], [-.21, -.564]], pt.hband);
    return Object.assign(q, pt); }
  add([[hx - .036, -.835], [hx + .036, -.835], [hx + .032, hy + .03], [hx - .032, hy + .03]], pt.skin);
  add(cfCirc(hx, hy - .008, .072, .07, 18), pt.hc);
  add([[hx - .077, hy - .02], [hx + .077, hy - .02], [hx + .096, hy + .04], [hx + .116, hy + .085], [hx + .124, hy + .1], [hx + .088, hy + .112], [hx + .05, hy + .106], [hx + .012, hy + .126], [hx - .03, hy + .112],
    [hx - .068, hy + .118], [hx - .102, hy + .106], [hx - .126, hy + .096], [hx - .116, hy + .08], [hx - .096, hy + .04]], pt.hc);
  add([[hx - .075, hy - .047], [hx, hy - .037], [hx + .075, hy - .047], [hx + .077, hy - .027], [hx, hy - .017], [hx - .077, hy - .027]], pt.hband);
  return Object.assign(q, pt);
}
const lerpN = (a, b, k) => a + (b - a) * k;
// a man seated from behind with his mantle drawn over his head (cfBack + a hood that falls over the shoulders and down the back)
function cfBackHood(P, o) {
  const q = cfBack(P, { ...o, head: 'cloth' }), add = cfAdder(P, 1, q), b = o.seat === 'bench' ? .25 : 0, hx = (o.turn || 0) * .048, hy = -.545 - b;
  add([[hx, hy - .1], [hx + .05, hy - .096], [hx + .084, hy - .07], [hx + .094, hy - .03], [hx + .1, hy + .02], [hx + .13, hy + .07], [.19, -.42 - b], [.205, -.36 - b], [.21, -.27 - b], [.17, -.24 - b], [0, -.23 - b],
    [-.17, -.24 - b], [-.21, -.27 - b], [-.205, -.36 - b], [-.19, -.42 - b], [hx - .13, hy + .07], [hx - .1, hy + .02], [hx - .094, hy - .03], [hx - .084, hy - .07], [hx - .05, hy - .096]], q.hc);
  add([[-.205, -.3 - b], [0, -.27 - b], [.205, -.3 - b], [.205, -.285 - b], [0, -.255 - b], [-.205, -.285 - b]], q.hband);
  return q;
}
// the speaking arm by joint angles (forward kinematics, the same bone lengths as cfArm's IK: .18, .172): the upper arm hangs a little out
// from vertical (θ 12° → 26°), the forearm comes up and out at the elbow (flexion φ 12° → 82°) — so the elbow is always below and outside
// the line from the shoulder to the hand (never a raised chicken wing). Local units, y down = +.
export function armFK(k) { const th = (12 + 14 * k) * Math.PI / 180, ph = (12 + 70 * k) * Math.PI / 180, ua = Math.PI / 2 - th, fa = ua - ph;
  const el = [Math.cos(ua) * .18, Math.sin(ua) * .18], wr = [el[0] + Math.cos(fa) * .172, el[1] + Math.sin(fa) * .172]; return { el, wr, th: th * 180 / Math.PI, ph: ph * 180 / Math.PI }; }

const SCR = [332, 645];   // where the tomb's low door is on screen at the end (sample-part5d.html doorRect at 631.9 — round 3: 「그리스도」's tomb): the gateway is held there
export function beats(B) {
  const a = B.N27b, q = B.Q15, n = B.N28, e = B.N15c;
  return { start: a - .5, end: e, sun: [a - .5, a + 2.2], speak: [a + .9, a + 3.4], speak2: [q - .6, q + 1.6], drop: [n - 1.4, n + .6], speak3: [n + .4, n + 2.6],
    turnC: [a + .8, a + 2.9], turnI: [B.L9 + .2, B.L9 + 2.4], lean0: q + .5, widen: [n + .6, e - .4] };
}

export async function build(W, H) {
  const { clamp, lerp, rng, canvas, hex, ss, eio } = Pl, V = H > W;
  const CF = { F: 1000, E: 1.55, YH: 700, CX: 540, DW: 6.5, XL: -3.9, XR: 2.8, G0: -3.0, G1: -1.7, GS: 2.35, GH: 3.0, tanE: .28, hx: .62, hz: .78,
    OX: 900, OY: 300, RW: 3000, RH: 2450 };
  const CFC = FRESCO.court(CF), cfP = CFC.P, poly = FRESCO.poly, { OX, OY, RW, RH, XL, XR, DW, G0, G1, GH } = CF, Wb = (X, Y) => cfP(X, Y, DW);
  // ---------------------------------------------------------------- the courtyard (albedo): limewashed walls, flagstones, an outside stair,
  // a clay oven, jars, a basket, a rolled mat; the gateway
  const room = canvas(RW, RH); const g = room.getContext('2d'); g.translate(OX, OY);
  const drawFloor = (x, seed = 21) => FRESCO.flagstones(x, cfP, { XL, XR, DW, near: .7, seed });
  drawFloor(g);
  const avoid = (X0, Y0) => (X0 > G0 - .6 && X0 < G1 + .6 && Y0 < GH + .5) || (X0 > -2.2 && X0 < 1.4);
  // limewash: lighter, cooler plaster than 「그리스도」's ochre walls
  FRESCO.plaster(g, [cfP(XR, 0, DW), cfP(XR, 0, 1), cfP(XR, 9, 1), cfP(XR, 9, DW)], '#c4b49a', 41, (X, Y) => cfP(XR, Y, lerp(DW, 1.6, (X + 4) / 7)), { avoid, patches: 4 });
  FRESCO.plaster(g, [cfP(XL, 0, DW), cfP(XL, 0, 1), cfP(XL, 9, 1), cfP(XL, 9, DW)], '#c8b89e', 43, (X, Y) => cfP(XL, Y, lerp(DW, 1.6, (X + 4) / 7)), { avoid, patches: 4 });
  FRESCO.plaster(g, [Wb(XL, 0), Wb(XR, 0), Wb(XR, 9), Wb(XL, 9)], '#cdbea4', 47, Wb, { patches: 0 });
  for (const X of [XL, XR]) FRESCO.grime(g, [cfP(X, 0, DW), cfP(X, 0, 1), cfP(X, .7, 1), cfP(X, .7, DW)], cfP(0, .7, 3)[1], cfP(0, 0, 1.4)[1]);
  FRESCO.grime(g, [Wb(XL, 0), Wb(XR, 0), Wb(XR, .7), Wb(XL, .7)], Wb(0, .7)[1], Wb(0, 0)[1]);
  g.fillStyle = 'rgba(40,28,20,.45)'; g.fillRect(cfP(XR, 0, DW)[0] - 2, Wb(0, 9)[1], 5, Wb(0, 0)[1] - Wb(0, 9)[1]);
  // the outside stair up the right wall to the roof (stone steps on a plastered base), its shadow
  { const s0 = 4.6, s1 = 6.4, nS = 9; g.fillStyle = '#a8977c'; poly(g, [cfP(XR, 0, s0), cfP(XR, 2.7, s1), cfP(XR - .85, 2.7, s1), cfP(XR - .85, 0, s0)]); g.fill();
    g.fillStyle = 'rgba(60,44,30,.35)'; poly(g, [cfP(XR - .85, 0, s0), cfP(XR - .85, 2.7, s1), cfP(XR - .85, 0, s1)]); g.fill();
    for (let i = 0; i < nS; i++) { const k0 = i / nS, k1 = (i + 1) / nS, y0 = 2.7 * k0, y1 = 2.7 * k1, d0 = lerp(s0, s1, k0), d1 = lerp(s0, s1, k1);
      g.fillStyle = i % 2 ? '#bcac90' : '#b4a488'; poly(g, [cfP(XR, y1, d0 + (d1 - d0) * .2), cfP(XR, y1, d1), cfP(XR - .85, y1, d1), cfP(XR - .85, y1, d0 + (d1 - d0) * .2)]); g.fill();
      g.fillStyle = 'rgba(70,52,36,.45)'; poly(g, [cfP(XR - .85, y0, d0), cfP(XR - .85, y1, d0 + (d1 - d0) * .2), cfP(XR - .85, y1 - .03, d0 + (d1 - d0) * .2), cfP(XR - .85, y0 - .03, d0)]); g.fill(); } }
  // a small window high in the back wall, a beam end or two, a plank door
  { const [x0, y0] = Wb(-.2, 4.2), [x1, y1] = Wb(.35, 3.7); g.fillStyle = '#9a8a70'; g.fillRect(x0 - 9, y0 - 7, x1 - x0 + 18, y1 - y0 + 16); g.fillStyle = '#20180f'; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
  for (const X of [-1.2, .9, 2.0]) { const [x, y] = Wb(X, 4.9); g.fillStyle = '#4a3624'; g.beginPath(); g.ellipse(x, y, 9, 8, 0, 0, 6.283); g.fill(); }
  { const [x0, y0] = Wb(.75, 2.1), [x1, y1] = Wb(1.5, 0); g.fillStyle = '#a8977a'; g.fillRect(x0 - 14, y0 - 20, x1 - x0 + 28, 20); g.fillStyle = '#3a2a1e'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const r = rng(9); for (let x = x0; x < x1; x += 17) { g.fillStyle = `rgba(${r() < .5 ? '90,66,44' : '20,14,10'},${.22 + .2 * r()})`; g.fillRect(x, y0, 3, y1 - y0); }
    g.fillStyle = 'rgba(16,10,6,.5)'; g.fillRect(x0, y0, x1 - x0, 13); g.fillStyle = '#8e7a5c'; g.fillRect(x0 - 9, y1 - 7, x1 - x0 + 18, 9); }
  // a low stone step along the back wall to the right (two of the men sit on it); a clay oven (tabun) by the stair; jars; a basket; a mat
  { const s = .36, X0 = .2, X1 = XR - .9, D0 = 5.7, D1 = 6.3; g.fillStyle = '#9a8a6e'; poly(g, [cfP(X0, s, D0), cfP(X1, s, D0), cfP(X1, 0, D0), cfP(X0, 0, D0)]); g.fill();
    g.fillStyle = '#b8a88a'; poly(g, [cfP(X0, s, D1), cfP(X1, s, D1), cfP(X1, s, D0), cfP(X0, s, D0)]); g.fill();
    g.fillStyle = 'rgba(30,20,12,.35)'; poly(g, [cfP(X0, s - .05, D0), cfP(X1, s - .05, D0), cfP(X1, 0, D0), cfP(X0, 0, D0)]); g.fill(); }
  { const [cx, cy] = cfP(XR - .5, 0, 4.0), s = CF.F / 4.0; g.fillStyle = '#8a6648'; g.beginPath(); g.ellipse(cx, cy - .28 * s, .42 * s, .34 * s, 0, Math.PI, 0); g.lineTo(cx + .42 * s, cy); g.lineTo(cx - .42 * s, cy); g.fill();
    g.fillStyle = 'rgba(30,18,10,.55)'; g.beginPath(); g.ellipse(cx - .08 * s, cy - .14 * s, .1 * s, .09 * s, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(255,230,190,.12)'; g.beginPath(); g.ellipse(cx - .2 * s, cy - .44 * s, .12 * s, .05 * s, -.3, 0, 6.283); g.fill(); }
  for (const [X, D, hgt] of [[-3.4, 5.9, .58], [-3.1, 6.1, .46], [2.2, 3.2, .5]]) { const [cx, cy] = cfP(X, 0, D), s = CF.F / D; g.fillStyle = '#8a5a3c'; g.beginPath(); g.ellipse(cx, cy - hgt * .45 * s, .16 * s, hgt * .5 * s, 0, 0, 6.283); g.fill(); g.fillRect(cx - .06 * s, cy - hgt * s, .12 * s, .12 * s);
    g.fillStyle = 'rgba(20,12,8,.3)'; g.beginPath(); g.ellipse(cx + .1 * s, cy, .2 * s, .03 * s, 0, 0, 6.283); g.fill(); }
  { const [cx, cy] = cfP(1.6, 0, 3.1), s = CF.F / 3.1; g.fillStyle = '#8a6e44'; g.beginPath(); g.ellipse(cx, cy - .1 * s, .22 * s, .11 * s, 0, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(50,36,20,.4)'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(cx, cy - .1 * s, .22 * s, (.03 + i * .018) * s, 0, Math.PI, 2 * Math.PI); g.stroke(); } }
  { const p0 = cfP(-2.0, 0, 3.0), p1 = cfP(-.9, 0, 3.0), p2 = cfP(-.9, 0, 3.9), p3 = cfP(-2.0, 0, 3.9); g.fillStyle = 'rgba(122,98,66,.75)'; poly(g, [p0, p1, p2, p3]); g.fill(); }
  { const X = .95, D = 4.6, s = CF.F / D, [cx, cy] = cfP(X, 0, D); g.fillStyle = '#5a3e28'; g.fillRect(cx - .2 * s, cy - .44 * s, .4 * s, .06 * s);   // a low wooden stool
    g.fillStyle = '#3e2a1a'; for (const dx of [-.17, .14]) g.fillRect(cx + dx * s, cy - .4 * s, .035 * s, .4 * s); g.fillStyle = 'rgba(20,12,8,.35)'; g.beginPath(); g.ellipse(cx, cy, .26 * s, .035 * s, 0, 0, 6.283); g.fill(); }
  FRESCO.gateStones(g, CFC, 6);
  FRESCO.grain(g, RW, RH, 7);
  FRESCO.openShade(g, RW, RH, OX, OY, { base: 'rgb(226,212,194)', bounce: [[420, 1060, 900, 'rgba(100,72,44,1)'], [200, 900, 520, 'rgba(96,70,42,1)']],
    shade: lx => { let gr = lx.createLinearGradient(0, -OY, 0, 760); gr.addColorStop(0, 'rgb(146,136,130)'); gr.addColorStop(1, '#fff'); lx.fillStyle = gr; lx.fillRect(-OX, -OY, RW, 1060);
      gr = lx.createLinearGradient(400, 0, 1700, 0); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(180,170,164)'); lx.fillStyle = gr; lx.fillRect(-OX, -OY, RW, RH);
      gr = lx.createLinearGradient(0, 1120, 0, 1800); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(160,150,140)'); lx.fillStyle = gr; lx.fillRect(-OX, 1120, RW, 700); } });
  FRESCO.gate(g, CFC, { depth: .5, veil: 400 });
  const ROOM = FRESCO.defocus(room, { blur: 1.2, oy: OY, rows: [[1200, 2.5], [1380, 4.5], [1560, 7]] });
  // ---- copied verbatim from motion/films/christ/fresco-cornelius.js (commit 156ea5f4) lines 273–414: tone, parts, place, build, beamClip, figure ----
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

  // ---------------------------------------------------------------- the people (kit space: the gate on the left — the frame is drawn mirrored)
  // (round 2) he stands deep in the bright gateway, on its threshold — clearly smaller than the near listeners — his mantle over his head
  const RISEN = { X: -2.35, D: 7.0, Hm: 1.72, kind: 'risen', o: { w: .9, hood: true }, c: { body: '#5e5444', hc: '#76664e', band: '#3e2e2c', hair: '#2e2420', skin: '#7a5e48' }, amb: .2 };
  // listeners (round 2, coordinator: "dolls in theatre rows"): an irregular cluster — on the floor, on a stool, on the step by the back
  // wall, one standing, one leaning on the wall; cloths, short hair, mantles drawn over the head; heights 1.62–1.84; all seen from behind
  // with the head turned only a little (no cheek/beard slivers — no toy faces). ld: lean delay. fixA: a constant lean (on the wall).
  const MEN = [
    // two in the sun's pool that runs from the gate across the floor toward us (their long shadows lie down it beside his), the rest round it
    { X: -1.4, D: 4.6, Hm: 1.74, kind: 'back', o: { turn: .04, head: 'cloth' }, c: { body: '#56503e', hc: '#a89676', band: '#3e2e2c', hair: '#2e2420', skin: '#a07a60' }, ld: .3 },
    { X: -.55, D: 5.2, Hm: 1.7, kind: 'back', o: { turn: -.12, hood: true, mantle: true }, c: { body: '#4e4a44', mantle: '#6a5a46', stripe: '#4e4032', hc: '#6a5a46', band: '#3a2e24', hair: '#2e2420', skin: '#a07a60' }, ld: 1.1 },
    { X: -2.15, D: 3.75, Hm: 1.66, kind: 'back', o: { turn: .06, head: 'cloth', w: .96 }, c: { body: '#6a5a46', hc: '#7e6e56', band: '#4a3424', hair: '#2e2420', skin: '#a8806a' }, ld: .7 },
    { X: .3, D: 3.75, Hm: 1.8, kind: 'back', o: { turn: -.1, head: 'hair', w: 1.06 }, c: { body: '#5a4e40', hair: '#2a201a', skin: '#a07a60' }, ld: 2.6 },
    // in the courtyard's shade: on a stool, on the step, one standing, one against the wall, one by himself near the wall
    { X: .95, D: 4.6, Hm: 1.8, kind: 'back', o: { turn: -.14, head: 'hair', seat: 'bench', w: 1.04 }, c: { body: '#4a5464', hair: '#241c18', skin: '#a07a60' }, ld: 1.9, stool: true },
    { X: -3.0, D: 4.4, Hm: 1.76, kind: 'back', o: { turn: .1, hood: true }, c: { body: '#5e5240', hc: '#74624a', band: '#4a3a2c', hair: '#2e2420', skin: '#a07a60' }, ld: 3.2 },
    { X: .55, D: 5.95, Hm: 1.76, kind: 'back', o: { turn: -.14, head: 'cloth', seat: 'bench', mantle: true }, c: { body: '#5e5444', mantle: '#7a6a52', stripe: '#5e4e3c', hc: '#9c8c70', band: '#3e2e2c', hair: '#3a3430', skin: '#a07a60' }, ld: 2.2 },
    { X: .05, D: 5.45, Hm: 1.84, kind: 'stand', o: { w: 1.02, reach: 0 }, c: { body: '#6a5e4c', hc: '#8a7a60', band: '#4a3c30', hair: '#2e2420', skin: '#a07a60' }, ld: 3.6 },
    { X: -3.4, D: 5.6, Hm: 1.78, kind: 'stand', o: { w: .98, reach: 0, hood: true }, c: { body: '#4c5060', hc: '#5e5444', band: '#3a2e24', hair: '#2e2420', skin: '#9c7258' }, ld: 9, fixA: .085 },
  ];
  const ALL = [RISEN, ...MEN].sort((a, b) => b.D - a.D);   // far to near
  for (const m of MEN) m.bA = Math.max(.02, .1 - .025 * Math.hypot(m.X - RISEN.X, m.D - RISEN.D));
  const buildM = (m, o) => m.kind === 'risen' || m.kind === 'stand' ? stander(m.P, o) : m.kind === 'back' ? (o.hood ? cfBackHood(m.P, o) : cfBack(m.P, o)) : cfMan(m.P, o);
  // each figure on its own small pair of plates (base + light), cached per pose step (a head turn: 61 steps; the open hand: 81)
  function plates(m) { place(m); const bc = beamClip(m); m.key = m.key ?? .2; m.rimA = m.rimA ?? .75; m.bA = m.bA ?? .05;
    const pw = Math.ceil(m.S * 1.4), ph = Math.ceil(m.S * 1.3), off = [Math.floor(m.fx - pw / 2), Math.floor(m.fy - m.S * 1.18)], cache = new Map();
    const B = canvas(pw, ph), L = canvas(pw, ph), T = canvas(pw, ph), xs = [B, L, T].map(c => c.getContext('2d'));
    m.pl = { off, pw, ph, get: (key, o) => { if (cache.has(key)) return cache.get(key);
      for (const x of xs) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, pw, ph); x.translate(-off[0], -off[1]); }
      if (m.kind === 'risen') risenFig(xs[0], xs[1], xs[2], off, m, buildM(m, o)); else figure(xs[0], xs[1], xs[2], off, m, buildM(m, o), bc);
      lens(B, m.near ? 3.5 : .8); lens(L, m.near ? 3.5 : .8);
      const b2 = canvas(pw, ph), l2 = canvas(pw, ph); b2.getContext('2d').drawImage(B, 0, 0); l2.getContext('2d').drawImage(L, 0, 0); const r = { B: b2, L: l2 }; cache.set(key, r); return r; } }; }
  // the man in the gate: a dark shape against the glare; the light behind him wraps every edge (both sides, the head cloth's rim glowing a
  // little beyond it), a faint floor bounce on the robe's front; no key, no face
  function risenFig(B, L, T, off, m, path) {
    const { fx, fy, S } = m, box = [fx - .6 * S, fy - 1.06 * S, 1.2 * S, 1.12 * S], a = m.amb; AMB = [a, a * .9, a * .82]; parts(B, path, m.c);
    B.save(); B.clip(path); let gr = B.createLinearGradient(0, fy - S, 0, fy); gr.addColorStop(0, 'rgba(12,6,4,.15)'); gr.addColorStop(1, 'rgba(12,6,4,.4)'); B.fillStyle = gr; B.fillRect(...box);
    { const rf = rng(77); for (let i = 0; i < 6; i++) { const xx = fx + (rf() - .5) * .26 * S, wd = (.01 + .012 * rf()) * S, y0 = fy - .5 * S, y1 = fy - .03 * S; const g2 = B.createLinearGradient(xx - wd, 0, xx + wd * 1.6, 0); g2.addColorStop(0, 'rgba(10,5,4,0)'); g2.addColorStop(.45, 'rgba(10,5,4,.16)'); g2.addColorStop(1, 'rgba(10,5,4,0)'); B.fillStyle = g2; B.fillRect(xx - wd, y0, 2.6 * wd, y1 - y0); } }
    B.restore();
    L.save(); L.globalCompositeOperation = 'destination-out'; L.fill(path); L.restore();
    L.save(); L.clip(path); gr = L.createLinearGradient(0, fy, 0, fy - .6 * S); gr.addColorStop(0, 'rgba(255,178,116,.08)'); gr.addColorStop(1, 'rgba(255,178,116,0)'); L.fillStyle = gr; L.fillRect(...box); L.restore();
    rim(L, T, off, path, box, [1, .25], .012 * S, 'rgba(255,222,170,.75)', 'rgba(255,206,150,.35)', .01 * S);
    rim(L, T, off, path, box, [-1, .25], .012 * S, 'rgba(255,222,170,.75)', 'rgba(255,206,150,.35)', .01 * S);
    edgeOn(L, T, off, path, path.hc, box, [0, 1], .012 * S, 'rgb(255,214,160)', .012 * S, .35, true);
  }
  for (const m of ALL) plates(m);
  // ---------------------------------------------------------------- the sun's pool (no shadows baked: they are cut each frame from the poses)
  const PB = { x: -700, y: 880, w: 2600, h: 1270 }, POOL = FRESCO.sunPool(CFC, PB, x => drawFloor(x), () => {}, { clip: .8, fade: [940, 1800, .45] });
  const poolT = canvas(PB.w, PB.h), ptx = poolT.getContext('2d');
  const SB = { x: -500, y: 300, w: 2500, h: 1500 }, SHAFT = FRESCO.shaft(CFC, SB, { clip: .8, n: 22, seed: 37, nearD: 1.2 });
  const BB = { x: -500, y: 120, w: 1300, h: 1150 }, BLOOM = FRESCO.bloom(CFC, BB);
  const DUST = FRESCO.dust(100, 43, 6), GRAIN = FRESCO.grainTile(93);
  const heads = MEN.map(m => { const back = m.kind === 'back'; const [x, y] = back ? m.P((m.o.turn || 0) * .048, -.545 - (m.o.seat === 'bench' ? .25 : 0)) : m.P(0, -.91); return [x, y, .1 * m.S]; });
  heads.push([...RISEN.P(0, -.9), .1 * RISEN.S]);
  const bodies = ALL.map(m => [m.fx, m.fy, m.S, m.D, m.kind === 'back' ? (m.o.seat === 'bench' ? .85 : .62) : 1.02]);
  // ---------------------------------------------------------------- poses over time (all eased; probe() reports them for the motion check)
  let T = null;
  const leanK = (m, t) => m.kind === 'risen' ? 0 : ss(T.lean0 + m.ld, T.lean0 + m.ld + 1.6 + .25 * (m.ld % 1.7), t) * (1 - .35 * ss(T.widen[0] + .5, T.widen[1], t));
  const turnOf = (m, t) => { if (!m.tw) return m.o.turn; const w = m.twI ? T.turnI : T.turnC; return lerp(m.tw[0], m.tw[1], eio(clamp((t - w[0]) / (w[1] - w[0])))); };
  const reachOf = t => clamp(.12 + .78 * eio(clamp((t - T.speak[0]) / (T.speak[1] - T.speak[0]))) - .32 * eio(clamp((t - (T.speak[1] + 2.2)) / 2.4)) + .3 * eio(clamp((t - T.speak2[0]) / (T.speak2[1] - T.speak2[0])))
    - .45 * eio(clamp((t - T.drop[0]) / (T.drop[1] - T.drop[0]))) + .4 * eio(clamp((t - T.speak3[0]) / (T.speak3[1] - T.speak3[0]))) + .025 * Math.sin(t * .9));
  const breath = (m, i, t) => 1 + .007 * Math.sin(t * (1.1 + .13 * (i % 4)) + i * 1.9);
  // the lean as an affine shear about the feet: in the figure's units x' = x + a·y, y' = b·y (y up negative) — the top goes toward the gate
  const shear = k => ({ a: .07 * k, b: 1 - .045 * k });
  function poseOf(m, i, t) { const k = leanK(m, t) * (m.kind === 'stand' ? .4 : 1), sh = shear(k), br = breath(m, i, t); return { k, a: sh.a + (m.fixA || 0), b: sh.b * br, turn: turnOf(m, t), reach: m.kind === 'risen' ? reachOf(t) : 0 }; }
  function draw(ctx, t, TT) {
    T = TT;
    const cr = clamp((t - T.start) / (T.end - T.start)), wid = ss(T.widen[0], T.widen[1], t);
    const I = (.78 + .22 * ss(T.sun[0], T.sun[1], t)) * (1 + .4 * wid) * (1 + .09 * Math.sin((t - T.start) * 2 * Math.PI / 7.3) * (1 - wid));   // thin high cloud thins and thickens over the sun
    const cr2 = clamp((t - T.start - 1.0) / (T.end - T.start - 1.0)), ce = .7 * cr2 + .3 * eio(cr2), z0 = V ? 1.0 : .82, z = z0 * (1 + .08 * ce);
    const [ax, ay] = Wb((G0 + G1) / 2, (GH) / 2), sa = [SCR[0] + 14 * ce, SCR[1] + 10 * ce];   // the gateway's middle → its screen place
    const layer = p => { const s = z0 * (1 + (z / z0 - 1) * p), cx = ax - (sa[0] - W / 2) / s, cy = ay - (sa[1] - H / 2) / s; ctx.setTransform(s, 0, 0, s, W / 2 - cx * s, H / 2 - cy * s); return s; };   // (round 3: not mirrored — the gateway sits left of centre where the tomb's door was, the sun's pool runs across the frame)
    ctx.save(); ctx.fillStyle = '#16100c'; ctx.fillRect(0, 0, W, H);
    layer(.94); ctx.drawImage(ROOM, -OX, -OY);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = clamp(.5 + .5 * I); ctx.drawImage(BLOOM, BB.x, BB.y);
    // the pool with this frame's shadows cut out of it (each body's silhouette, leaning as it leans, carried along the sun)
    const P2 = ALL.map((m, i) => poseOf(m, i, t));
    ptx.setTransform(1, 0, 0, 1, 0, 0); ptx.globalCompositeOperation = 'source-over'; ptx.clearRect(0, 0, PB.w, PB.h); ptx.drawImage(POOL, 0, 0);
    ptx.translate(-PB.x, -PB.y); ptx.globalCompositeOperation = 'destination-out'; ptx.filter = 'blur(3px)'; ptx.fillStyle = 'rgba(0,0,0,1)';
    ALL.forEach((m, i) => { const q = P2[i], cast = CFC.cast(m.X, m.D, m.Hm), mp = (x, y) => cast(x + q.a * y, q.b * y);
      if (m.kind === 'risen' || m.kind === 'stand') return;
      ptx.fill(buildM({ ...m, P: mp }, { ...m.o, turn: q.turn, reach: q.reach })); });
    // (round 3, owner: the man's long shadow read as something anatomical) a standing man's shadow is cast from a plain robe shape —
    // broad at the hem, tapering a little, the shoulders and the mantle over the head one blunt rounded end, no legs, no feet, no arm —
    // blurred more and fading toward the far end, so it lies on the floor as a soft wedge of shade beside the listeners' shadows
    ptx.filter = 'blur(7px)';
    ALL.forEach((m, i) => { if (m.kind !== 'risen' && m.kind !== 'stand') return; const q = P2[i], cast = CFC.cast(m.X, m.D, m.Hm), mp = (x, y) => cast(x + q.a * y, q.b * y);
      const pts = [[-.23, .01], [-.215, -.25], [-.2, -.5], [-.205, -.72], [-.19, -.84], [-.15, -.93], [-.07, -.985], [.07, -.985], [.15, -.93], [.19, -.84], [.205, -.72], [.2, -.5], [.215, -.25], [.23, .01]].map(([x, y]) => mp(x, y));
      const f0 = mp(0, 0), f1 = mp(0, -1), g = ptx.createLinearGradient(f0[0], f0[1], f1[0], f1[1]); g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(.6, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,.3)');
      ptx.fillStyle = g; ptx.beginPath(); pts.forEach(([x, y], j) => j ? ptx.lineTo(x, y) : ptx.moveTo(x, y)); ptx.closePath(); ptx.fill(); });
    ptx.filter = 'none';
    layer(1); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = clamp(I * 1.05); ctx.drawImage(poolT, PB.x, PB.y);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = clamp(.55 * I); ctx.drawImage(poolT, PB.x, PB.y); ctx.globalAlpha = 1;   // the pool stronger: the long shadows read (round 2)
    ctx.globalCompositeOperation = 'screen'; layer(.97); ctx.globalAlpha = clamp(.75 * I); ctx.drawImage(SHAFT, SB.x, SB.y); ctx.globalAlpha = 1;
    // the figures far to near: base plate, then the light plate screened at the sun's strength; each sheared about its feet as it leans
    ALL.forEach((m, i) => { if (m.kind === 'risen') { layer(1); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = clamp(.55 * I); const [hx, hy] = m.P(0, -.55), R = m.S * .62, gg = ctx.createRadialGradient(hx, hy, R * .2, hx, hy, R);
        gg.addColorStop(0, 'rgba(255,236,200,.5)'); gg.addColorStop(1, 'rgba(255,236,200,0)'); ctx.fillStyle = gg; ctx.fillRect(hx - R, hy - R, 2 * R, 2 * R); }   // the glare behind him (his outline melts into it a little)
      const q = P2[i], key = m.kind === 'risen' ? Math.round(q.reach * 80) : m.tw ? Math.round((q.turn + 1) * 30) : 0;
      const o = m.kind === 'risen' ? { ...m.o, reach: key / 80 } : m.tw ? { ...m.o, turn: key / 30 - 1 } : m.o, p = m.pl.get(key, o), [ox, oy] = m.pl.off;
      layer(1); ctx.transform(1, 0, 0, 1, m.fx, m.fy); ctx.transform(1, 0, q.a, q.b, 0, 0); ctx.transform(1, 0, 0, 1, -m.fx, -m.fy);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(p.B, ox, oy); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = clamp(I); ctx.drawImage(p.L, ox, oy);
 });
    { const fl = 1 - ss(T.start + .8, T.start + 2.8, t); if (fl > 0) { layer(1); const [gx, gy] = Wb((G0 + G1) / 2, 1.35), R = 330 + 120 * fl, gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, R);
      gr.addColorStop(0, `rgba(255,246,226,${.97 * fl})`); gr.addColorStop(.45, `rgba(255,236,204,${.85 * fl})`); gr.addColorStop(1, 'rgba(255,226,186,0)'); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.fillRect(gx - R, gy - R, 2 * R, 2 * R); } }
    ctx.globalCompositeOperation = 'screen'; layer(.97); ctx.globalAlpha = clamp(.14 * I); ctx.drawImage(SHAFT, SB.x, SB.y);
    { layer(1); ctx.globalAlpha = 1; FRESCO.drawDust(ctx, t - T.start, DUST, CFC, { focus: 5.0, I: clamp(I * (1 + .25 * ss(T.lean0 - 1, T.lean0 + 1, t))), top: .05, near: [2.5, 3.4], bodies, heads }); }
    // N28: the light widens — the gate's glare spreads over the walls and the floor
    if (wid > 0) { layer(1); ctx.globalCompositeOperation = 'screen'; const [gx, gy] = Wb((G0 + G1) / 2, 1.2), R = lerp(500, 1700, eio(wid)), gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, R);
      gr.addColorStop(0, `rgba(255,236,196,${.42 * wid})`); gr.addColorStop(.4, `rgba(255,214,160,${.2 * wid})`); gr.addColorStop(1, 'rgba(255,214,160,0)'); ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.fillRect(gx - R, gy - R, 2 * R, 2 * R); }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    FRESCO.finish(ctx, t - T.start, GRAIN);
    ctx.restore();
  }
  function probe(t, TT) { T = TT; return ALL.map((m, i) => { const q = poseOf(m, i, t), r = { id: m.kind + '@' + m.X, lean: Math.atan(q.a) * 180 / Math.PI, turn: q.turn };
    if (m.kind === 'risen') { const A = armFK(q.reach); r.shoulder = A.th; r.elbow = A.ph; r.reach = q.reach; } return r; }); }
  return { draw, probe, beats };
}
