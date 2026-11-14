/* road-pastel.js — 「그리스도」 3부, 가이사랴 빌립보로 가는 길 (막 8:27 "길에서 제자들에게 물어"; 마 16:13–23), 매직 아워 소프트 파스텔.
   Soft pastel on grey-violet toned paper (after the first film's patriarch scene and Lemo-Opuscar 93 'Nomadland'): chalky strokes,
   the sky going gold → rose → violet. The light carries the feeling: the gold of the confession, the sun going down beside Jerusalem
   at the first word of the passion, the violet of Peter's protest, the first star over Peter left behind on the road.
   The people are men (관리자 2026-11-14 "다 머리가 길어서 여자처럼 보이는데" + 관점 검수 4차): square shoulders, belted straight robes,
   head cloths tied with a dark band and ending at the shoulders, or short dark hair; beards; staffs. Peter is the same in every mode
   (RD_PETER: the broadest, madder robe, ochre head cloth). Jesus (RD_JESUS) never shows a face — back view, or the face in the shade
   of the cloth, no nose, no beard line; never big in the middle of the frame. Near (in 'foretell' and 'protest') he is only ever seen
   from behind, the head cloth covering his head (관점 검수 5차: the face opening read as a dark oval / a profile).
   One world seen from a rise (high view): golden fields falling away to the north-east, Mount Hermon far off with snow; a dirt road
   winding up through the fields and over a crest toward the south, where the horizon darkens (Jerusalem). The sun is low behind
   us (left), so the band is lit from the side, their shadows run ahead of them up the road.
     'confess'  (u 0–7.7, film 51.4–): the band walking up the road, Jesus in front; u≈1 he stops and turns to them, they stop
                (마 16:15); u 3.5 Peter steps out of the band toward him and the warmest sunlight falls on that spot — the brightest moment.
     'foretell' (u 0–8.0, 59.1–): its own view from behind the band (마 16:21 "예루살렘에 올라가"; 막 10:32 "예수께서 그들 앞에서 가시는데";
                관리자 2026-11-14 "다들 가만히 서있는데 걸어가는장면일까?"): a walking scene throughout — Jesus, small, his back to us, walks
                steadily on ahead up a straight road toward a small Jerusalem on the horizon (walls, towers, the gate tower with light in its
                arch — the gate of N06); the twelve follow on the road in a loose file two abreast, slower and hesitant (each slows and picks up
                on his own beat, never still), so the empty stretch of road between him and them widens; the low sun goes down beside the
                city and the city comes out of the haze as a silhouette. From u 5.4 Peter quickens out of the group toward him (into 'protest').
     'protest'  (u 0–4.3, 67.1–): nearer, low, a few steps behind Jesus, rose → violet: he walks on up the road with his back to us
                (small, left of centre) and stops; Peter comes in across the road from the right and stands in the road ahead of him,
                facing him (seen from the front, his head turned to Jesus) — barring the way: one hand holds Jesus's arm above the elbow,
                the other is raised, palm out (관점 검수 6차); between their heads, in the dip of the hills where the road goes, the last light.
     'alone'    (u 0–4.6, 71.4–): violet dusk; Jesus and the band walk on up the road, growing small; Peter stands a few steps
                behind, alone on the road; the first star.
   Each mode draws for u from -0.8 to its length + 0.8 (dissolves). Closed form: roadPastel(ctx, u, mode) depends only on (u, mode).
   No words are drawn. Needs Pilot (lib.js). */
const RDP = {};

function rdLayout() {
  const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
  const L = V ? { hz: H * .36, road: [[.12, 1.16], [.26, .88], [.38, .7], [.46, .61], [.55, .535], [.65, .482], [.76, .443], [.87, .405], [.96, .379]], fh: H * .052, lead: .435, herm: [-.3, .78, .26, .283], band: .585, crest: .379, sy: .17 }
              : { hz: H * .4, road: [[.06, 1.2], [.2, .93], [.32, .77], [.41, .68], [.5, .615], [.6, .565], [.72, .515], [.84, .47], [.95, .425]], fh: H * .088, lead: .525, herm: [-.2, .62, .24, .29], band: .72, crest: .425, sy: .19 };
  return Object.assign(L, { W, H, V, S: 1.25, X0: -.2 * W, X1: 1.2 * W, Y1: 1.15 * H });
}
// colours of the light by time of day T (0 gold · .45 rose · .7 violet · 1 dusk)
const RD_C = {
  top: [[0, '#6a72a8'], [.3, '#62609c'], [.55, '#55488a'], [.75, '#443a7c'], [1, '#33366a']],
  mid: [[0, '#eec48c'], [.3, '#eaae8c'], [.5, '#d88a8e'], [.72, '#9a6a98'], [1, '#4a3f7a']],
  hor: [[0, '#fbe2a0'], [.3, '#f8cc90'], [.5, '#f4a890'], [.7, '#d08898'], [.85, '#8a6a98'], [1, '#5a4c88']],
  land: [[0, '#fff8e8'], [.3, '#ffead4'], [.5, '#f4d0c4'], [.7, '#d0b2c8'], [.85, '#b4a8cc'], [1, '#a69ec8']],
  light: [[0, '#ffe2a0'], [.35, '#ffcc90'], [.55, '#f8a890'], [.75, '#d090b0'], [1, '#a890c0']],
  snow: [[0, '#fff6e6'], [.35, '#ffe6d0'], [.55, '#ffc0c0'], [.75, '#c0a8d0'], [1, '#8a84b8']],
};
// the same two in every mode: Peter = the broadest, madder robe, an ochre head cloth with a dark band, a dark beard; Jesus = a pale robe and
// cream head cloth, never a face (뒷모습·먼 실루엣·역광만 — 관점 검수 4차 예수님 표현 규칙)
const RD_PETER = { body: '#7e4c44', hc: '#c9a06a', band: '#4a3426', hair: '#3a302c', w: 1.1 };
const RD_JESUS = { body: '#a49688', hc: '#ebe2d2', band: '#5a4a44', w: .98, shade: '#6a5a66' };
// a figure's colours under the light (land = the light's colour, multiplied in)
function rdLook(b, o, land) { const t = c => Pilot.rgb(Pilot.hex(c).map((v, k) => v * land[k] / 255));
  if (b.hc) o.hcCol = t(b.hc); o.bandCol = t(b.band || '#3e2e2c'); o.hairCol = t(b.hairCol || '#3a2a26'); o.skin = t('#b48a6e'); o.shadeCol = t(RD_JESUS.shade); if (b.jesus) o.noFace = true; return o; }

// a man of the band in units of his height (feet at the origin, y up negative), through a map P(x, y) → canvas (관리자 2026-11-14 "다 머리가
// 길어서 여자처럼 보이는데" + 관점 검수 4차): broad square shoulders, a belted robe that falls straight (no bell), arms at his sides, a head
// cloth that ends at the shoulders and is tied with a dark band (or short dark hair), a beard. The robe ends at the shin and the legs show
// under it, stepping (ph = walk phase, walk 0 standing … 1 walking); face +1 right, -1 left; back 0 (we see his face) … 1 (his back);
// lean tips the top forward; staff = a staff held in the right hand. noFace (Jesus): the face is never drawn — the opening of the head
// cloth stays in shade, no nose, no beard. Parts: q = the silhouette (robe colour), hd = skin (neck, hands), hf = the face, hr = hair and
// beard, hc = head cloth, hb = the band round the head cloth and the belt, arm = the sleeves (a shade darker).
function rdLimb(p, a, b, w0, w1) { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); p.moveTo(a[0] + Math.cos(ang - Math.PI / 2) * w0, a[1] + Math.sin(ang - Math.PI / 2) * w0); p.arc(b[0], b[1], w1, ang - Math.PI / 2, ang + Math.PI / 2); p.arc(a[0], a[1], w0, ang + Math.PI / 2, ang + Math.PI * 1.5); p.closePath(); }
function rdPerson(P, o) {
  const { w = 1, lean: l = 0, face: f = 1, staff = false, hem = 1, ph = 0, walk = 0, back = 0, hair = false, beard = true, noFace = false, wind = 0 } = o;
  const q = new Path2D(), hd = new Path2D(), hf = new Path2D(), hr = new Path2D(), hc = new Path2D(), hb = new Path2D(), arm = new Path2D();
  const add = (pts, ...also) => addC(pts.map(([x, y]) => P(x, y)), ...also), addC = (pts, ...also) => { let a = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; } if (a < 0) pts.reverse();
    const n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2]; for (const t of [q, ...also]) { t.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) t.quadraticCurveTo(pts[i][0], pts[i][1], ...m(i)); t.closePath(); } };
  const circ = (cx, cy, rx, ry, n = 16) => Array.from({ length: n }, (_, i) => { const a = i / n * 6.283; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const s1 = Math.hypot(P(1, 0)[0] - P(0, 0)[0], P(1, 0)[1] - P(0, 0)[1]), bob = -.014 * Math.abs(Math.sin(ph)) * walk;
  const lx = y => l * (-y), sw = .022 * Math.sin(ph) * walk * f + (o.hemSway || 0), hy = -.045 - .085 * walk + bob, front = back < .5;
  // legs: from the hips under the robe to the feet; the stance leg sweeps back while the other swings forward
  const sl = .36 * Math.sin(ph) * walk, hip = -.36 + bob, LL = .36;
  for (const [s, side] of [[sl, -1], [-sl, 1]]) { const H0 = P(side * .04 + lx(-.36), hip), F = P(side * .04 + lx(-.36) + Math.sin(s) * LL * f * (1 - .6 * back), hip + Math.cos(s) * LL);
    const lift = Math.max(0, Math.sin(ph + (side < 0 ? 0 : Math.PI))) * walk * .03, Fl = [F[0], F[1] - lift * s1];
    rdLimb(q, H0, Fl, .036 * s1, .03 * s1); q.moveTo(Fl[0] + .05 * s1 * f, Fl[1]); q.ellipse(Fl[0] + .02 * s1 * f, Fl[1], .05 * s1, .022 * s1, 0, 0, 6.283); }
  if (o.profile) return rdProfile(P, o, { q, hd, hf, hr, hc, hb, arm, add, circ, bob, s1 });
  // the robe: square shoulders wider than the hem, nipped at the belt, straight down
  const B = (x, y) => [x + lx(y), y + bob];
  add([[sw, hy + .01], [-.168 * w * hem + sw, hy], B(-.162 * w + sw * .5, -.26), B(-.145 * w, -.5), B(-.162 * w, -.62), B(-.178 * w, -.715), B(-.182 * w, -.752), B(-.165 * w, -.788), B(-.115 * w, -.808), B(-.05, -.83),
    B(.05, -.83), B(.115 * w, -.808), B(.165 * w, -.788), B(.182 * w, -.752), B(.178 * w, -.715), B(.162 * w, -.62), B(.145 * w, -.5), B(.162 * w + sw * .5, -.26), [.168 * w * hem + sw, hy]]);
  add([B(-.15 * w, -.54), B(.15 * w, -.54), B(.152 * w, -.497), B(-.152 * w, -.497)], hb);                       // the belt
  add([B(.05 * w, -.505), B(.085 * w, -.5), B(.08 * w, -.39), B(.058 * w, -.39)], hb);                            // its end hanging
  // arms (sleeves) from the shoulders, hanging, a little swing; the right hand on the staff if he has one
  // noArms: no arms at all (drawn by the caller); handT: the sleeve flares a little to its cuff and the hand comes out of it shaped —
  // a slim wrist, the palm, the fingers tapering, the thumb along its inner edge (관점 검수 6차: a capsule arm and a round hand read as
  // a log and a lump)
  const hands = [], joints = [];
  if (!o.noArms) for (const side of [-1, 1]) { const sh = P(...B(side * .148 * w, -.745)), sx = Math.sin(ph) * walk * side * .014;
    const rc = o.reach && o.reach[side < 0 ? 0 : 1], tg = rc ? P(...rc) : staff && side === 1 ? P(...B(.205 * w, -.56)) : P(...B(side * (.18 * w) + sx, -.405));   // reach: a hand's target
    const a = rdIK(sh, tg, .18 * s1, .172 * s1, o.bend ? o.bend[side < 0 ? 0 : 1] : -side);
    if (o.handT) { const dx = a.wr[0] - a.el[0], dy = a.wr[1] - a.el[1], d = Math.hypot(dx, dy) || 1, c = [dx / d, dy / d], pn = [-c[1], c[0]], Q = (t, y) => [a.wr[0] + c[0] * t * s1 + pn[0] * y * s1, a.wr[1] + c[1] * t * s1 + pn[1] * y * s1];
      const E = (k, wd) => [a.el[0] + pn[0] * k * wd * s1, a.el[1] + pn[1] * k * wd * s1];
      addC([E(-1, .046), Q(-.03, -.05), Q(.006, -.056), Q(.014, -.05), Q(.014, .05), Q(.006, .056), Q(-.03, .05), E(1, .046)], arm);   // the forearm's sleeve, flaring to the cuff
      rdLimb(q, sh, a.el, .05 * s1, .046 * s1); rdLimb(arm, sh, a.el, .05 * s1, .046 * s1);   // the upper arm
      addC([Q(-.004, -.016), Q(.02, -.02), Q(.05, -.021), Q(.08, -.012), Q(.096, .0), Q(.086, .012), Q(.054, .019), Q(.02, .018), Q(-.004, .015)], hd);   // the hand: wrist, palm, fingers
      { const t0 = Q(.024, side * .014), t1 = Q(.054, side * .026); rdLimb(hd, t0, t1, .008 * s1, .0055 * s1); rdLimb(q, t0, t1, .008 * s1, .0055 * s1); }   // the thumb, on the inner side
      joints.push({ sh, el: a.el, wr: a.wr, Q }); continue; }
    rdLimb(q, sh, a.el, .052 * s1, .046 * s1); rdLimb(q, a.el, a.wr, .046 * s1, .038 * s1);
    rdLimb(arm, sh, a.el, .052 * s1, .046 * s1); rdLimb(arm, a.el, a.wr, .046 * s1, .038 * s1); hands.push(a.wr); joints.push({ sh, el: a.el, wr: a.wr }); }
  for (const [x, y] of hands) { hd.moveTo(x + .03 * s1, y + .012 * s1); hd.ellipse(x, y + .012 * s1, .028 * s1, .034 * s1, 0, 0, 6.283); q.moveTo(x + .03 * s1, y + .012 * s1); q.ellipse(x, y + .012 * s1, .028 * s1, .034 * s1, 0, 0, 6.283); }
  if (staff) { const hx = hands[1][0], st = [[hx + .012 * s1, P(0, -.02)[1]], [hx + .012 * s1 + l * .2 * s1, P(0, -1.06 + bob)[1]], [hx - .012 * s1 + l * .2 * s1, P(0, -1.06 + bob)[1]], [hx - .012 * s1, P(0, -.02)[1]]];
    q.moveTo(...st[0]); st.slice(1).forEach(p => q.lineTo(...p)); q.closePath(); }
  // the head: neck, then the face (on the side he looks to), short hair or the head cloth, the band, the beard
  const hx = lx(-.9) + .012 * f + (o.headX || 0), hy0 = -.9 + bob, fcx = hx + .026 * f;   // headX: the head shifted a little (seen from behind: a slight turn)
  add([[hx - .034, hy0 + .045], [hx + .034, hy0 + .045], [hx + .036, -.815 + bob], [hx - .036, -.815 + bob]], hd);   // the neck
  if (hair) for (const sd of [-1, 1]) if (!front || sd * f < .3) add(circ(hx + sd * .06, hy0 + .01, .014, .022, 8), hd);   // ears (short hair)
  if (front) { add(circ(fcx, hy0 + .006, .052, .064), hf); if (!noFace && Math.abs(f) > .55) add([[fcx + .044 * f, hy0 - .008], [fcx + .068 * f, hy0 + .016], [fcx + .046 * f, hy0 + .03]], hf); }
  else add(circ(hx, hy0, .058, .066), hd);
  if (hair) {   // short dark hair: a cap over the top and the back of the head, the nape bare
    if (front) add([[hx - .062, hy0 + .01 - .03 * Math.max(0, f)], [hx - .066, hy0 - .03], [hx - .04, hy0 - .066], [hx, hy0 - .074], [hx + .04, hy0 - .066], [hx + .066, hy0 - .03], [hx + .062, hy0 + .01 - .03 * Math.max(0, -f)], [fcx + .04, hy0 - .03], [fcx - .04, hy0 - .03]], hr);
    else add([[hx - .05, hy0 + .042], [hx - .056, hy0], [hx - .066, hy0 - .03], [hx - .045, hy0 - .066], [hx, hy0 - .076], [hx + .045, hy0 - .066], [hx + .066, hy0 - .03], [hx + .056, hy0], [hx + .05, hy0 + .042]], hr); }
  else {   // the head cloth: over the crown, falling straight past the jaw to the shoulders and no further; the band round the brow
    const t = wind;
    if (front && o.faceOpen) add([[hx - .082, hy0 - .01], [hx - .08, hy0 - .05], [hx - .045, hy0 - .08], [hx, hy0 - .088], [hx + .045, hy0 - .08], [hx + .08, hy0 - .05], [hx + .082, hy0 - .01], [fcx + .045, hy0 - .036], [fcx - .045, hy0 - .036]], hc);   // faceOpen: the crown stops at the brow (near views: the face shows)
    else add(circ(hx - .01 * f * (1 - back), hy0 - .014, .076, .07), hc);
    if (front) for (const sd of [-1, 1]) add([[hx + sd * .08, hy0 - .03], [fcx + sd * .043, hy0 - .032], [fcx + sd * .048, hy0 + .07], [fcx + sd * .062, -.792 + bob], [hx + sd * .122 + t, -.786 + bob], [hx + sd * .098, hy0 + .03]], hc);
    else add([[hx - .08, hy0 - .03], [hx + .08, hy0 - .03], [hx + .1, hy0 + .04], [hx + .124 + t, -.784 + bob], [hx - .124 + t, -.784 + bob], [hx - .1, hy0 + .04]], hc);
    add([[hx - .08, hy0 - .05], [hx, hy0 - .062], [hx + .08, hy0 - .05], [hx + .081, hy0 - .028], [hx, hy0 - .04], [hx - .081, hy0 - .028]], hb); }
  if (front && beard && !noFace) add([[fcx - .05, hy0 + .004], [fcx - .046, hy0 + .058], [fcx + .02 * f, hy0 + .102], [fcx + .046, hy0 + .058], [fcx + .05, hy0 + .004], [fcx + .024, hy0 + .032], [fcx - .024, hy0 + .032]], hr);
  Object.assign(q, { hd, hf, hr, hc, hb, arm, noFace, joints }); return q;   // joints: each arm's shoulder, elbow, wrist on the canvas (left, right)
}
// the same man seen square from the side (the 'protest' close view): chest toward f, a straight back, the belt; the head cloth over the
// crown and down the back of the neck to the shoulders, the band at the brow; Peter's beard juts from the jaw. noFace: the cloth comes
// forward round the face, the face stays in shade — no nose, no chin, no beard line.
function rdProfile(P, o, k) {
  const { lean: l = 0, face: f = 1, hem = 1, ph = 0, walk = 0, beard = true, noFace = false } = o, { q, hd, hf, hr, hc, hb, arm, add, circ, bob } = k;
  const X = (x, y) => (x * f) + l * (-y) * 1.05, hy = -.04 - .09 * walk + bob, sw = .025 * Math.sin(ph) * walk * f;
  add([[X(.13 * hem, hy + .004) + sw, hy + .004], [X(.148 * hem, hy - .02) + sw, hy - .02], [X(.145, -.3), -.3 + bob], [X(.14, -.5), -.5 + bob], [X(.15, -.62), -.62 + bob], [X(.13, -.72), -.72 + bob], [X(.085, -.79), -.79 + bob], [X(.04, -.825), -.825 + bob],
    [X(-.04, -.835), -.835 + bob], [X(-.11, -.79), -.79 + bob], [X(-.145, -.7), -.7 + bob], [X(-.14, -.5), -.5 + bob], [X(-.15, -.3), -.3 + bob], [X(-.156 * hem, hy - .02) + sw, hy - .02], [X(-.138 * hem, hy + .004) + sw, hy + .004]]);
  add([[X(.145, -.545), -.545 + bob], [X(.15, -.5), -.5 + bob], [X(-.145, -.5), -.5 + bob], [X(-.14, -.545), -.545 + bob]], hb);
  const px = l * .9 + .022 * f, py = -.905 + bob;
  add([[px - .03 * f, py + .05], [px + .03 * f, py + .05], [X(.04, -.82), -.82 + bob], [X(-.03, -.82), -.82 + bob]], hd);   // the neck
  add(circ(px, py, .064, .072), hf);
  if (!noFace) { add([[px + .055 * f, py - .022], [px + .088 * f, py + .012], [px + .06 * f, py + .028]], hf);   // the nose
    if (beard) add([[px + .03 * f, py + .026], [px + .066 * f, py + .046], [px + .07 * f, py + .085], [px + .04 * f, py + .122], [px - .012 * f, py + .11], [px - .05 * f, py + .06], [px - .046 * f, py + .01], [px - .01 * f, py + .04]], hr); }
  add(noFace ? circ(px - .01 * f, py - .008, .078, .082) : circ(px - .045 * f, py - .03, .072, .066), hc);   // noFace: the cloth round the whole head …
  add([[px + .02 * f, py - .095], [px - .085 * f, py - .062], [px - .118 * f, py + .04], [X(-.135, -.73), -.73 + bob], [X(-.05, -.8), -.8 + bob], [px - .035 * f, py + .06]], hc);
  const hs = new Path2D(); if (noFace) add(circ(px + .034 * f, py + .02, .031, .047), hs);   // … and its opening in shade, a rim of cloth in front
  const bf = noFace ? .015 : .07;   // the band: round the brow (behind the cloth's front edge when it is drawn forward)
  add([[px + bf * f, py - .06], [px - .02 * f, py - .078], [px - .116 * f, py - .05], [px - .118 * f, py - .026], [px - .02 * f, py - .054], [px + (bf + .002) * f, py - .038]], hb);
  Object.assign(q, { hd, hf: noFace ? null : hf, hr, hc, hb, arm, noFace, hs: noFace ? hs : null }); return q;
}
// a soft rim: the shape minus itself shifted with the light, on a scratch canvas, strongest on head and shoulders and gone down the
// body, drawn twice (blurred, then crisp) so the chalk edge has no cut-out line
function rdRim(g, path, Lt, d, light, a, box) {
  const c = RDP.rimC, r = c.getContext('2d'), [bx, by, bw, bh] = box.map(Math.round), top = by, len = bh;
  r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = 'source-over'; r.clearRect(bx - 2, by - 2, bw + 4, bh + 4); r.fillStyle = '#fff'; r.fill(path);
  r.globalCompositeOperation = 'destination-out'; r.translate(Lt[0] * d, Lt[1] * d); r.fill(path); r.setTransform(1, 0, 0, 1, 0, 0);
  r.globalCompositeOperation = 'source-in'; const gr = r.createLinearGradient(0, top, 0, top + len * .75); gr.addColorStop(0, light); gr.addColorStop(.45, light); gr.addColorStop(1, 'rgba(0,0,0,0)'); r.fillStyle = gr; r.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (d >= 4) { const sc2 = RDP.rimS, s2 = sc2.getContext('2d'); s2.setTransform(1, 0, 0, 1, 0, 0); s2.clearRect(0, 0, sc2.width, sc2.height); s2.filter = `blur(${(d * .5).toFixed(1)}px)`; s2.drawImage(c, bx - 2, by - 2, bw + 4, bh + 4, 0, 0, bw + 4, bh + 4); s2.filter = 'none';   // the blur on a small canvas (big figures only)
    g.globalAlpha = .55 * a; g.drawImage(sc2, 0, 0, bw + 4, bh + 4, bx - 2, by - 2, bw + 4, bh + 4); }
  g.globalAlpha = (d >= 4 ? .6 : .85) * a; g.drawImage(c, bx - 2, by - 2, bw + 4, bh + 4, bx - 2, by - 2, bw + 4, bh + 4); g.restore();
}
// a figure in pastel: robe, sleeves a shade darker, skin, the face (in shade for Jesus), hair and beard, head cloth, band and belt; the soft
// rim; a few folds. Lt = the direction the light travels
function rdParts(g, path, o, body) {
  const skin = o.skin || '#9a7a68';
  g.fillStyle = body; g.fill(path);
  if (path.hb) { g.fillStyle = o.bandCol || '#3e2e2c'; g.fill(path.hb); }
  if (path.arm) { g.fillStyle = body; g.fill(path.arm); g.fillStyle = 'rgba(28,16,30,.18)'; g.fill(path.arm); }
  if (path.hd) { g.fillStyle = skin; g.fill(path.hd); }
  if (path.hf) { g.fillStyle = path.noFace ? (o.shadeCol || '#4a3a48') : skin; g.fill(path.hf); }
  if (path.hr) { g.fillStyle = o.hairCol || '#3a2a26'; g.fill(path.hr); }
  if (path.hc) { g.fillStyle = o.hcCol || body; g.fill(path.hc); }
  if (path.hb && path.hc) { g.save(); g.clip(path.hc); g.fillStyle = o.bandCol || '#3e2e2c'; g.fill(path.hb); g.restore(); }   // the band sits on the cloth
  if (path.hs) { g.fillStyle = o.shadeCol || '#4a3a48'; g.fill(path.hs); }
  if (path.hands) { g.fillStyle = skin; g.fill(path.hands); }
}
function rdFigure(g, path, P, o, body, light, Lt, d, rimA = 1) {
  const s = Math.hypot(P(1, 0)[0] - P(0, 0)[0], P(1, 0)[1] - P(0, 0)[1]), xs = [P(-.75, 0)[0], P(.75, 0)[0]], ys = [P(0, -1.12)[1], P(0, .06)[1]];
  g.save(); rdParts(g, path, o, body);
  if (s > 30) { g.clip(path); g.strokeStyle = o.fold || 'rgba(40,30,56,.28)'; g.lineCap = 'round'; const { w = 1, lean: l = 0, face: f = 1 } = o;   // a few folds, no texture strokes
    for (const [x0, x1, y0, wd] of [[-.06, -.1, -.47, .012], [.06, .1, -.47, .011], [.13, .15, -.4, .009]]) {
      const A = P(x0 * w + l * .5, y0), B = P(x1 * w, -.12), C = P((x0 + x1) / 2 * w + .02 * f + l * .25, (y0 - .12) / 2); g.lineWidth = Math.max(1, wd * s); g.beginPath(); g.moveTo(...A); g.quadraticCurveTo(...C, ...B); g.stroke(); } }
  g.restore();
  if (rimA > 0 && d < 14 && !o.softRim) {   // a small figure: the cheap rim (light, then the shape again shifted with the light), faded down the body
    const top = Math.min(...ys); g.save(); g.clip(path); g.globalAlpha = rimA; g.fillStyle = light; g.fill(path); g.globalAlpha = 1; g.translate(Lt[0] * d, Lt[1] * d); rdParts(g, path, o, body); g.translate(-Lt[0] * d, -Lt[1] * d);
    const fg = g.createLinearGradient(0, top + .3 * s, 0, top + .8 * s); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, body); g.fillStyle = fg; g.fillRect(Math.min(...xs), top + .3 * s, Math.abs(xs[1] - xs[0]), 1.2 * s); g.restore(); return; }
  if (rimA > 0) rdRim(g, path, Lt, d, light, rimA, [Math.min(...xs), Math.min(...ys), Math.abs(xs[1] - xs[0]), Math.abs(ys[1] - ys[0])]);
}
function rdCam(keys, u) {   // Catmull-Rom through [t, fx, fy, z] keys, held outside
  let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)], t = Pilot.clamp((u - k1[0]) / (k2[0] - k1[0]));
  return [1, 2, 3].map(j => { const p1 = k1[j], p2 = k2[j], d1 = k1 === k0 ? (p2 - p1) : (p2 - k0[j]) / 2 * (k2[0] - k1[0]) / (k2[0] - k0[0]) * 2, d2 = k3 === k2 ? (p2 - p1) : (k3[j] - p1) / 2 * (k2[0] - k1[0]) / (k3[0] - k1[0]) * 2;
    const t2 = t * t, t3 = t2 * t; return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * d1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * d2; });
}
function rdIK(s, t, a, b, bend) {
  const dx = t[0] - s[0], dy = t[1] - s[1], dd = Math.hypot(dx, dy), d = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, dd)), ang = Math.atan2(dy, dx);
  const c = (a * a + d * d - b * b) / (2 * a * d), e = ang + bend * Math.acos(Math.max(-1, Math.min(1, c)));
  const el = [s[0] + Math.cos(e) * a, s[1] + Math.sin(e) * a], k = d / (dd || 1); return { el, wr: [s[0] + dx * k, s[1] + dy * k] };
}
// pastel strokes clipped to a path (or a rect): n strokes of length len at angle ang ± jitter, colours picked from cols
function rdHatch(x, r, box, n, cols, ang, len, wd, alpha, clip) {
  x.save(); if (clip) x.clip(clip); x.lineCap = 'round'; const [x0, y0, x1, y1] = box;
  for (let i = 0; i < n; i++) { const px = x0 + r() * (x1 - x0), py = y0 + r() * (y1 - y0), a = ang + (r() - .5) * .35, l = len * (.6 + r() * .8);
    x.globalAlpha = alpha * (.4 + r() * .6); x.strokeStyle = cols[(r() * cols.length) | 0]; x.lineWidth = wd * (.6 + r() * .8); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  x.restore();
}

async function buildRoadPastel() {
  const { rng, canvas, fbm, clamp, lerp } = Pilot, L = rdLayout(), { W, H, V, S, hz, X0, X1, Y1 } = L, R0 = V ? W : H;
  RDP.L = L;
  // the road: a smooth curve through its points, sampled by arc length
  { const pts = L.road.map(([x, y]) => [x * W, y * H]), sm = [];
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 40; k++) { const t = k / 40, t2 = t * t, t3 = t2 * t; sm.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
    sm.push(pts[pts.length - 1]); const len = [0]; for (let i = 1; i < sm.length; i++) len.push(len[i - 1] + Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1]));
    RDP.rs = sm; RDP.rl = len; }
  RDP.wd = y => lerp(.008 * W, (V ? .2 : .13) * W, clamp((y - hz) / (H - hz)) ** 1.15);   // road width by depth
  RDP.hs = y => L.fh * clamp((y - hz) / (L.sy * H), .16, 2.2);                               // figure height by depth
  RDP.aAtY = yy => { const s = RDP.rs; for (let i = 0; i < s.length; i++) if (s[i][1] <= yy) return RDP.rl[i]; return RDP.rl[s.length - 1]; };   // the road runs from the bottom up

  const ox = X0, oy = hz - .02 * H, LW = Math.round((X1 - X0) * S), LH = Math.round((Y1 - oy) * S);
  RDP.land = { ox, oy, w: X1 - X0, h: Y1 - oy };
  // the land (fields, olive groves, the road), painted once in the daylight colours; tinted per frame by the light
  { const c = canvas(LW, LH), x = c.getContext('2d'), r = rng(7); x.scale(S, S); x.translate(-ox, -oy);
    const gr = x.createLinearGradient(0, hz, 0, Y1); gr.addColorStop(0, '#b8a07c'); gr.addColorStop(.12, '#c4a066'); gr.addColorStop(1, '#8a6a42'); x.fillStyle = gr; x.fillRect(X0, hz, X1 - X0, Y1 - hz);   // the land starts at the horizon (the far hills show above it)
    const cols = ['#c9a56a', '#b8955e', '#9c7a4c', '#d8b97c', '#c08a6e', '#7d6448', '#e3c48a', '#efd29a', '#6e5440', '#c9738a', '#4a4470', '#8a9a5a'];
    const wts = [14, 14, 12, 10, 8, 8, 8, 5, 6, 3, 4, 5], tot = wts.reduce((a, b) => a + b);
    const pick = () => { let v = r() * tot; for (let i = 0; i < wts.length; i++) { v -= wts[i]; if (v < 0) return cols[i]; } return cols[0]; };
    const hgt = Y1 - hz;
    { const g2 = x.createLinearGradient(0, hz, 0, hz + .06 * H); g2.addColorStop(0, 'rgba(150,140,180,.7)'); g2.addColorStop(1, 'rgba(150,140,180,0)'); x.fillStyle = g2; x.fillRect(X0, hz, X1 - X0, .06 * H); }   // the far land, bluer
    for (let i = 0; i < 70000; i++) { const y = hz + Math.pow(r(), .6) * hgt, d = (y - hz) / hgt, px = X0 + r() * (X1 - X0), len = 2 + d * 60 * (.6 + r() * .8), wd = .7 + d * 5 * (.6 + r() * .6);
      const fld = fbm(px * .004 + 3, y * .009, 3); x.globalAlpha = (.4 + r() * .5) * (.55 + .45 * Math.min(1, d * 8)); x.strokeStyle = fld > .62 && r() < .5 ? '#a8a060' : fld < .36 && r() < .5 ? '#e6c88c' : pick(); x.lineWidth = wd; x.lineCap = 'round';
      const lean = (r() - .5) * .5; x.beginPath(); x.moveTo(px, y); x.lineTo(px + lean * len, y - len); x.stroke(); }
    // a dusk-blue shadow band or two breaking the plain into planes
    x.globalAlpha = 1; x.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 8; i++) { const px = X0 + r() * (X1 - X0), py = hz + .05 * hgt + r() * (hgt * .5), rr = (.2 + .25 * r()) * R0; const gg = x.createRadialGradient(px, py, 0, px, py, rr);
      gg.addColorStop(0, 'rgba(120,108,150,.4)'); gg.addColorStop(1, 'rgba(120,108,150,0)'); x.fillStyle = gg; x.fillRect(px - rr, py - rr, 2 * rr, 2 * rr); }
    x.globalCompositeOperation = 'source-over';
    // the crest the road goes over (a light seam of grass on its brow)
    // the road: a pale dusty band, strokes along it, darker ruts and edges
    { const s = RDP.rs, left = [], right = [];
      for (let i = 0; i < s.length; i++) { const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl, hw = RDP.wd(s[i][1]) / 2;
        left.push([s[i][0] + nx * hw, s[i][1] + ny * hw]); right.push([s[i][0] - nx * hw, s[i][1] - ny * hw]); }
      const p = new Path2D(); left.forEach((q, i) => i ? p.lineTo(...q) : p.moveTo(...q)); for (let i = right.length - 1; i >= 0; i--) p.lineTo(...right[i]); p.closePath(); RDP.roadPath = p;
      x.fillStyle = '#d4b88a'; x.fill(p);
      x.save(); x.clip(p); for (let i = 0; i < 12000; i++) { const k = r() * (s.length - 2) | 0, a = s[k], b = s[k + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (r() - .5) * .9, hw = RDP.wd(a[1]) / 2, off = (r() - .5) * 2.1 * hw, d = clamp((a[1] - hz) / (H - hz));
        const nx = -Math.sin(ang), ny = Math.cos(ang), px = a[0] + nx * off, py = a[1] + ny * off, l = (1.5 + 16 * d) * (.4 + r());   // short dusty dabs in all directions, not planks
        x.globalAlpha = .3 + .4 * r(); x.strokeStyle = ['#e8d0a0', '#f0dcb0', '#c4a478', '#b09070', '#dcc090', '#c8a0a0'][(r() * 6) | 0]; x.lineWidth = .8 + 5 * d * r(); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(ang) * l, py + Math.sin(ang) * l); x.stroke(); }
      x.globalAlpha = .4; x.strokeStyle = '#8a6c50'; for (const fr of [-.28, .28]) { x.lineWidth = 1; x.beginPath(); s.forEach((a, i) => { const b = s[Math.min(s.length - 1, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), hw = RDP.wd(a[1]) / 2, px = a[0] - Math.sin(ang) * hw * fr * 2, py = a[1] + Math.cos(ang) * hw * fr * 2;
        x.lineWidth = .5 + 3 * clamp((a[1] - hz) / (H - hz)); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); }
      x.restore(); x.globalAlpha = 1;
      // the edges: grass tufts leaning over
      for (const side of [left, right]) for (let i = 0; i < side.length; i += 2) { const [px, py] = side[i], d = clamp((py - hz) / (H - hz)); for (let k = 0; k < 3; k++) { x.globalAlpha = .5; x.strokeStyle = ['#8a7048', '#a8905c', '#6e5a48'][(r() * 3) | 0]; x.lineWidth = .6 + 3 * d;
        const l = (2 + 26 * d) * (.5 + r()); x.beginPath(); x.moveTo(px + (r() - .5) * 6 * d, py); x.lineTo(px + (r() - .5) * l * .6, py - l); x.stroke(); } } }
    RDP.landC = c;
    const bx0 = (V ? .4 : .36) * W, by0 = (V ? .37 : .44) * H, bw = (V ? .5 : .5) * W, bh = (V ? .28 : .34) * H, SH = 3.6, hc = canvas(Math.round(bw * SH), Math.round(bh * SH)), hx = hc.getContext('2d'), r2 = rng(97);
    hx.imageSmoothingQuality = 'high'; hx.drawImage(c, (bx0 - ox) * S, (by0 - oy) * S, bw * S, bh * S, 0, 0, hc.width, hc.height); hx.scale(SH, SH); hx.translate(-bx0, -by0); hx.lineCap = 'round';
    for (let i = 0; i < 26000; i++) { const y = by0 + r2() * bh, d = Math.max(0, (y - hz) / hgt), px = bx0 + r2() * bw, len = 2 + d * 60 * (.6 + r2() * .8), wd = .5 + d * 3 * (.6 + r2() * .6);
      hx.globalAlpha = .3 + .4 * r2(); hx.strokeStyle = pick(); hx.lineWidth = wd; const lean = (r2() - .5) * .5; hx.beginPath(); hx.moveTo(px, y); hx.lineTo(px + lean * len, y - len); hx.stroke(); }
    hx.save(); hx.clip(RDP.roadPath); hx.fillStyle = 'rgba(212,184,138,.55)'; hx.fillRect(bx0, by0, bw, bh); const sR = RDP.rs;
    for (let i = 0; i < 14000; i++) { const k = r2() * (sR.length - 2) | 0, a = sR[k]; if (a[1] < by0 - 10 || a[1] > by0 + bh + 10) continue; const b = sR[k + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (r2() - .5) * .9, hw = RDP.wd(a[1]) / 2, off = (r2() - .5) * 2.1 * hw, d = clamp((a[1] - hz) / (H - hz));
      const px = a[0] - Math.sin(ang) * off, py = a[1] + Math.cos(ang) * off, l = (1 + 8 * d) * (.4 + r2()); hx.globalAlpha = .3 + .4 * r2(); hx.strokeStyle = ['#e8d0a0', '#f0dcb0', '#c4a478', '#b09070', '#dcc090', '#c8a0a0'][(r2() * 6) | 0]; hx.lineWidth = .4 + 2 * d * r2(); hx.beginPath(); hx.moveTo(px, py); hx.lineTo(px + Math.cos(ang) * l, py + Math.sin(ang) * l); hx.stroke(); }
    hx.restore(); RDP.landHi = { c: hc, x: bx0, y: by0, w: bw, h: bh }; }
  // the far hills along the horizon (violet), and Mount Hermon far to the north with snow (body and snow apart: the snow takes the
  // alpenglow); drawn at a slower parallax
  { const c = canvas(LW, Math.round(.22 * H * S)), x = c.getContext('2d'), r = rng(11); x.scale(S, S); x.translate(-ox, -(hz - .2 * H));
    const ridge = (base, amp, f, seed) => { const p = new Path2D(); p.moveTo(X0, hz + 4); for (let px = X0; px <= X1; px += 10) p.lineTo(px, base - amp * fbm(px * f + seed, seed, 4)); p.lineTo(X1, hz + 4); p.closePath(); return p; };
    const p0 = ridge(hz - .004 * H, .03 * H, .0035, 1.3), p1 = ridge(hz + .002 * H, .016 * H, .006, 4.1);
    x.fillStyle = '#8a7cae'; x.fill(p0); rdHatch(x, r, [X0, hz - .05 * H, X1, hz + 4], 2400, ['#9a8cbc', '#7a6c9e', '#c9a0b0'], -.45, 14, 2.5, .35, p0);
    x.fillStyle = '#76689c'; x.fill(p1); rdHatch(x, r, [X0, hz - .03 * H, X1, hz + 4], 1600, ['#8a7cae', '#5e5288', '#c08aa0'], 2.6, 12, 2.5, .3, p1);
    RDP.hills = { c, y0: hz - .2 * H }; }
  { const [hx0, hx1, px, py] = L.herm, c = canvas(LW, Math.round(.25 * H * S)), sn = canvas(LW, Math.round(.25 * H * S)), x = c.getContext('2d'), s = sn.getContext('2d'), r = rng(17);
    for (const g of [x, s]) { g.scale(S, S); g.translate(-ox, -(hz - .22 * H)); }
    const top = X => { const t = (X / W - hx0) / (hx1 - hx0), k = (px - hx0) / (hx1 - hx0), gs = (c, s) => Math.exp(-(((t - c) / s) ** 2));   // a long massif: several shoulders and a broad summit, not a cone
      const e = Math.min(1, .78 * gs(k, .2) + .42 * gs(k - .22, .13) + .36 * gs(k + .19, .15) + .2 * gs(k + .38, .1)) * Math.min(1, t * 6, (1 - t) * 6);
      return hz - (hz - py * H) * Math.max(0, e) * (.92 + .1 * fbm(X * .008, 2, 3)) - .004 * H * fbm(X * .04, 5, 3); };
    const p = new Path2D(); p.moveTo(hx0 * W, hz + 2); for (let X = hx0 * W; X <= hx1 * W; X += 6) p.lineTo(X, Math.min(hz + 2, top(X))); p.lineTo(hx1 * W, hz + 2); p.closePath();
    x.fillStyle = '#a49cc6'; x.fill(p); rdHatch(x, r, [hx0 * W, py * H, hx1 * W, hz], 2200, ['#b4acd2', '#9088b8', '#c8b8d8'], -.6, 12, 2.2, .35, p);
    s.save(); s.clip(p); for (let i = 0; i < 2600; i++) { const X = hx0 * W + r() * (hx1 - hx0) * W, t0 = top(X), dep = (hz - t0) * (.12 + .3 * fbm(X * .02, 9, 3) ** 2), y = t0 + r() * dep;
      s.globalAlpha = (.5 + .5 * r()) * (1 - (y - t0) / (dep + 1)); s.strokeStyle = '#fff'; s.lineWidth = 1.2 + 2 * r(); s.beginPath(); s.moveTo(X, y); s.lineTo(X + (r() - .5) * 8, y + 4 + 8 * r()); s.stroke(); } s.restore();
    RDP.herm = { c, sn, y0: hz - .22 * H }; RDP.snowT = canvas(LW, Math.round(.25 * H * S)); }
  // chalk cloud bands (white, tinted per frame) and the paper
  { const c = canvas(Math.round(1.4 * W), Math.round(hz)), x = c.getContext('2d'), r = rng(31);
    for (let b = 0; b < 8; b++) { const y0 = (.08 + .8 * r()) * hz, x0 = r() * W, len = (.4 + .7 * r()) * W;
      for (let i = 0; i < 300; i++) { const px = x0 + r() * len, py = y0 + (r() - .5) * .012 * H + Math.sin(px * .004) * .006 * H; x.globalAlpha = .05 + r() * .13; x.strokeStyle = '#fff'; x.lineWidth = 2 + r() * 6; x.lineCap = 'round';
        x.beginPath(); x.moveTo(px, py); x.lineTo(px + .03 * W + r() * .09 * W, py + (r() - .5) * 3); x.stroke(); } }
    RDP.clouds = c; RDP.cloudT = canvas(c.width, c.height); }
  { const c = canvas(W, Math.round(hz * 1.1)), x = c.getContext('2d'), r = rng(41); rdHatch(x, r, [0, 0, W, c.height], 5000, ['#fff', '#fff', '#2a2050'], -.5, 26, 4, .07); RDP.skyHatch = c; }
  RDP.paper = Pilot.speckle(W, H, 60, 9, .7);
  { const c = canvas(256, 256), x = c.getContext('2d'), r = rng(51); for (let i = 0; i < 2200; i++) { x.globalAlpha = .25 + .6 * r(); x.fillStyle = '#000'; x.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 1.5); } RDP.grain = c; }
  RDP.fl = canvas(W, H); RDP.rimC = canvas(W, H); RDP.rimS = canvas(Math.ceil(W * .9), Math.ceil(H * .45)); RDP.shC = canvas(Math.ceil(W / 2), Math.ceil(H / 2));
  // the band: [rank behind Jesus (arc px), side offset (× road width), options]; Jesus first, Peter in the first row
  { const fh = L.fh, rows = [[1.75, -.34], [1.6, .0], [2.15, .42], [2.45, -.3], [2.5, .04], [1.9, .36], [3.3, -.28], [3.35, .05], [3.3, .36], [4.1, -.3], [4.15, .02], [4.1, .34]];   // four rows of three
    const r = rng(13);
    const hl = RDP.hs(L.lead * H); RDP.hl = hl;
    // the twelve: [robe, head cloth colour or 'h' (short dark hair, no cloth), staff, shoulder width] — Peter (the second) always RD_PETER
    const LOOK = [['#6a564e', 'h', false, 1.04], null, ['#5a4c62', '#d8c8a8', true, 1], ['#74604a', 'h', false, 1.06], ['#564a5c', '#cdbb9c', false, .98], ['#6c5052', '#b8a890', true, 1.02],
      ['#625a5a', 'h', false, 1], ['#6a564e', '#e2d6c2', false, 1.05], ['#5a4c62', 'h', true, 1], ['#74604a', '#cdbb9c', false, 1.03], ['#564a5c', 'h', false, .98], ['#6c5052', '#d8c8a8', true, 1.04]];
    RDP.band = [{ back: 0, side: 0, o: { w: RD_JESUS.w, noFace: true }, jesus: true, body: RD_JESUS.body, hc: RD_JESUS.hc, band: RD_JESUS.band }].concat(rows.map(([b, sd], i) => {
      const k = LOOK[i] || [RD_PETER.body, RD_PETER.hc, false, RD_PETER.w], hair = k[1] === 'h';
      return { back: b * hl * 1.1, side: sd, o: { w: k[3], hem: .97 + .08 * r(), staff: k[2], lean: .01 + .025 * r(), hair }, peter: i === 1, body: k[0], hc: hair ? null : k[1], band: i === 1 ? RD_PETER.band : '#3e2e2c', hairCol: i === 1 ? RD_PETER.hair : ['#3a2a26', '#2e2420', '#4a362c'][i % 3] }; }));
    RDP.band.forEach(b => { b.ph0 = r() * 6.283; }); RDP.aLead = RDP.aAtY(L.lead * H); }   // muted robes (earth, dusty blue, madder), not black
  // 'protest' — its own nearer view, low (the camera at shoulder height) and a few steps behind Jesus: the road runs straight away from
  // us into a dip in the far hills where the last light is. A man Z body-heights away is f/Z tall and stands with his feet cH·f/Z below
  // the horizon (관점 검수 5차: Jesus from behind, small and off-centre — no face, no profile at any frame).
  { const c = canvas(Math.round(W * 1.12), Math.round(H * 1.12)), x = c.getContext('2d'), r = rng(61), Wd = c.width, Hd = c.height; x.translate((Wd - W) / 2, (Hd - H) / 2);
    const hJ = V ? .14 * H : .24 * H, fJ = V ? .585 * H : .7 * H, cH = .74, hp = fJ - cH * hJ, ZJ = 4, f = hJ * ZJ, gx = .42 * W;
    RDP.pv = { hJ, fJ, cH, hp, ZJ, f, gx };
    const ridge = new Path2D(); ridge.moveTo(-.1 * W, hp + 4); for (let px = -.1 * W; px <= 1.1 * W; px += 8) { const notch = Math.exp(-(((px - gx) / (.09 * W)) ** 2)); ridge.lineTo(px, hp - (.026 * H * fbm(px * .004, 3, 4) + .008 * H) * (1 - .8 * notch)); } ridge.lineTo(1.1 * W, hp + 4); ridge.closePath();
    x.fillStyle = '#7a6c9e'; x.fill(ridge); rdHatch(x, r, [-.1 * W, hp - .07 * H, 1.1 * W, hp + 4], 2400, ['#8a7cae', '#5e5288', '#b08aa8'], -.45, 16, 3, .35, ridge);
    const gr = x.createLinearGradient(0, hp, 0, H * 1.06); gr.addColorStop(0, '#a89070'); gr.addColorStop(.2, '#b8955e'); gr.addColorStop(1, '#7a5a3a'); x.fillStyle = gr; x.fillRect(-.1 * W, hp, 1.2 * W, H);
    { const g2 = x.createLinearGradient(0, hp, 0, hp + .04 * H); g2.addColorStop(0, 'rgba(150,140,180,.6)'); g2.addColorStop(1, 'rgba(150,140,180,0)'); x.fillStyle = g2; x.fillRect(-.1 * W, hp, 1.2 * W, .04 * H); }
    const cols = ['#c9a56a', '#b8955e', '#9c7a4c', '#d8b97c', '#c08a6e', '#7d6448', '#e3c48a', '#6e5440', '#c9738a', '#4a4470'];
    for (let i = 0; i < 34000; i++) { const y = hp + Math.pow(r(), .6) * (H * 1.06 - hp), d = (y - hp) / (H - hp), px = -.1 * W + r() * 1.2 * W, len = 2 + d * 55 * (.6 + r() * .8), wd = .6 + d * 3.2 * (.6 + r() * .6);
      x.globalAlpha = (.28 + r() * .34) * (.55 + .45 * Math.min(1, d * 6)); x.strokeStyle = cols[(r() * cols.length) | 0]; x.lineWidth = wd; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, y); x.lineTo(px + (r() - .5) * .5 * len, y - len); x.stroke(); }
    // the road: straight away from us into the dip (centre on gx), half-width one body height, pale dust, two ruts, grass at its edges
    const edge = (X, Z) => [gx + X * f / Z, hp + cH * f / Z], Zn = cH * f / (H * 1.08 - hp), Zs = []; for (let Z = 400; Z > Zn; Z /= 1.03) Zs.push(Z); Zs.push(Zn);
    const rp = new Path2D(); Zs.forEach((Z, i) => i ? rp.lineTo(...edge(-1, Z)) : rp.moveTo(...edge(-1, Z))); Zs.slice().reverse().forEach(Z => rp.lineTo(...edge(1, Z))); rp.closePath();
    x.globalAlpha = 1; x.fillStyle = '#d0b488'; x.fill(rp);
    x.save(); x.clip(rp); for (let i = 0; i < 12000; i++) { const Z = Zn * Math.pow(60, Math.pow(r(), 1.5)), d = cH * f / Z / (H - hp), X = (r() - .5) * 2.1, [px, py] = edge(X, Z), l = (1.2 + 20 * d) * (.4 + r()), ang = -Math.PI / 2 + (r() - .5) * 1.4;
      x.globalAlpha = .3 + .4 * r(); x.strokeStyle = ['#e8d0a0', '#f0dcb0', '#c4a478', '#b09070', '#dcc090', '#c8a0a0'][(r() * 6) | 0]; x.lineWidth = .7 + 5 * d * r(); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(ang) * l, py + Math.sin(ang) * l); x.stroke(); }
    x.globalAlpha = .36; x.strokeStyle = '#8a6c50'; for (const fr of [-.34, .34]) { x.beginPath(); Zs.forEach((Z, i) => { const [px, py] = edge(fr, Z); x.lineWidth = .5 + 3 * cH * f / Z / (H - hp); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); }
    x.restore();
    for (const sd of [-1, 1]) for (let Z = Zn; Z < 300; Z *= 1.012) { const [px, py] = edge(sd, Z), d = cH * f / Z / (H - hp); for (let k = 0; k < 2; k++) { x.globalAlpha = .5; x.strokeStyle = ['#8a7048', '#a8905c', '#6e5a48'][(r() * 3) | 0]; x.lineWidth = .6 + 3 * d;
      const l = (2 + 26 * d) * (.5 + r()); x.beginPath(); x.moveTo(px + (r() - .5) * 8 * d, py); x.lineTo(px + (r() - .5) * l * .6, py - l); x.stroke(); } }
    x.globalAlpha = 1; RDP.pland = c; }
  // 'foretell' — its own view, from a little above and behind the band: the road runs straight away to the horizon, into the gate of a
  // small Jerusalem on a rise (walls, towers, the gate tower with its arch — the gate of 2부 N06 seen from far off); the low sun beside it.
  // Depth D in body heights; a man D away stands e = Q/D below the horizon, e/2.2 tall (the camera is 2.2 men high).
  { const c = canvas(Math.round(W * 1.12), Math.round(H * 1.12)), x = c.getContext('2d'), r = rng(83), Wd = c.width, Hd = c.height; x.translate((Wd - W) / 2, (Hd - H) / 2);
    const hp = V ? H * .35 : H * .43, vx = V ? W * .64 : W * .6, Q = (V ? .13 : .14) * H * 10, Xr = -.8, U = V ? W : H, F = RDP.fv = { hp, vx, Q, Xr, U, ox: -(Wd - W) / 2, oy: -(Hd - H) / 2 };
    F.at = (X, D) => { const e = Q / D; return [vx + X * e / 2.2, hp + e, e / 2.2]; };
    F.rx = e => Xr - 1.4 * Math.exp(-Math.max(-2, Q / Math.max(e, 1e-3) - 3) / 2.5);   // the road's centre (it sweeps in from the lower left), half-width .65
    const ridge = new Path2D(); ridge.moveTo(-.1 * W, hp + 4);   // the far hills, low where the city stands, with the city's own rise
    for (let px = -.1 * W; px <= 1.1 * W; px += 8) { const g1 = Math.exp(-(((px - vx) / (.2 * U)) ** 2)), g2 = Math.exp(-(((px - vx) / (.17 * U)) ** 2)); ridge.lineTo(px, hp - (.024 * H * fbm(px * .004, 7, 4) + .008 * H) * (1 - .85 * g1) - .007 * U * g2); }
    ridge.lineTo(1.1 * W, hp + 4); ridge.closePath();
    x.fillStyle = '#7e70a2'; x.fill(ridge); rdHatch(x, r, [-.1 * W, hp - .06 * H, 1.1 * W, hp + 4], 2200, ['#8e80b2', '#66588e', '#b48ca8'], -.45, 14, 2.6, .33, ridge);
    const gr = x.createLinearGradient(0, hp, 0, H * 1.06); gr.addColorStop(0, '#b4a07c'); gr.addColorStop(.15, '#bf9c62'); gr.addColorStop(1, '#7a5a3a'); x.fillStyle = gr; x.fillRect(-.1 * W, hp, 1.2 * W, H);
    { const g2 = x.createLinearGradient(0, hp, 0, hp + .05 * H); g2.addColorStop(0, 'rgba(150,140,180,.65)'); g2.addColorStop(1, 'rgba(150,140,180,0)'); x.fillStyle = g2; x.fillRect(-.1 * W, hp, 1.2 * W, .05 * H); }
    const cols = ['#c9a56a', '#b8955e', '#9c7a4c', '#d8b97c', '#c08a6e', '#7d6448', '#e3c48a', '#6e5440', '#c9738a', '#4a4470', '#8a9a5a'];
    for (let i = 0; i < 42000; i++) { const y = hp + Math.pow(r(), .6) * (H * 1.06 - hp), d = (y - hp) / (H - hp), px = -.1 * W + r() * 1.2 * W, len = 2 + d * 55 * (.6 + r() * .8), wd = .6 + d * 3.4 * (.6 + r() * .6);
      x.globalAlpha = (.3 + r() * .4) * (.55 + .45 * Math.min(1, d * 8)); x.strokeStyle = cols[(r() * cols.length) | 0]; x.lineWidth = wd; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, y); x.lineTo(px + (r() - .5) * .5 * len, y - len); x.stroke(); }
    // the road: straight away into the gate, pale dust, two ruts, grass at its edges
    const eB = H * 1.08 - hp, edge = (X, e) => [vx + (F.rx(e) + X) * e / 2.2, hp + e], es = [0]; for (let e = .5; e < eB; e *= 1.03) es.push(e); es.push(eB);
    const rp = new Path2D(); es.forEach((e, i) => i ? rp.lineTo(...edge(-.8, e)) : rp.moveTo(...edge(-.8, e))); es.slice().reverse().forEach(e => rp.lineTo(...edge(.8, e))); rp.closePath(); F.road = rp;
    x.globalAlpha = 1; x.fillStyle = '#d2b68a'; x.fill(rp);
    x.save(); x.clip(rp); for (let i = 0; i < 14000; i++) { const e = Math.pow(r(), 1.6) * eB, d = e / (H - hp), X = (r() - .5) * 1.7, [px, py] = edge(X, e), l = (1.2 + 18 * d) * (.4 + r()), ang = -Math.PI / 2 + (r() - .5) * 1.4;   // dabs along the road
      x.globalAlpha = .3 + .4 * r(); x.strokeStyle = ['#e8d0a0', '#f0dcb0', '#c4a478', '#b09070', '#dcc090', '#c8a0a0'][(r() * 6) | 0]; x.lineWidth = .7 + 5 * d * r(); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(ang) * l, py + Math.sin(ang) * l); x.stroke(); }
    x.globalAlpha = .38; x.strokeStyle = '#8a6c50'; for (const fr of [-.28, .28]) { x.beginPath(); for (let e = 2; e < eB; e *= 1.08) { const [px, py] = edge(fr, e); x.lineWidth = .5 + 3 * e / (H - hp); e === 2 ? x.moveTo(px, py) : x.lineTo(px, py); } x.stroke(); }
    x.restore();
    for (const sd of [-1, 1]) for (let e = 3; e < eB; e *= 1.012) { const [px, py] = edge(sd * .8, e), d = e / (H - hp); for (let k = 0; k < 2; k++) { x.globalAlpha = .5; x.strokeStyle = ['#8a7048', '#a8905c', '#6e5a48'][(r() * 3) | 0]; x.lineWidth = .6 + 3 * d;
      const l = (2 + 26 * d) * (.5 + r()); x.beginPath(); x.moveTo(px + (r() - .5) * 8 * d, py); x.lineTo(px + (r() - .5) * l * .6, py - l); x.stroke(); } }
    x.globalAlpha = 1; RDP.fland = c;
    // Jerusalem: one silhouette (wall with merlons, towers, the gate tower and its arch, the temple's block behind) — drawn per frame
    const cb = hp - .004 * H, CW = .3 * U, x0 = vx - CW / 2, p = new Path2D(), R = (a, b, w, h) => p.rect(a, b, w, h), mer = (a, w, top, n) => { for (let i = 0; i < n; i++) R(a + (i + .25) * w / n, top - .006 * U, w / n * .5, .0062 * U); };
    R(x0, cb - .026 * U, CW, .036 * U); mer(x0, CW, cb - .026 * U, 19);
    for (const [tx, tw, th] of [[-.5, .032, .042], [-.36, .028, .038], [.29, .028, .04], [.49, .034, .045]]) { const a = vx + tx * CW - tw * U / 2; R(a, cb - th * U, tw * U, (th + .01) * U); mer(a, tw * U, cb - th * U, 3); }
    { const a = vx - .2 * CW - .036 * U; R(a, cb - .054 * U, .072 * U, .06 * U); R(a + .014 * U, cb - .064 * U, .044 * U, .012 * U); }
    { const a = vx - .032 * U; R(a, cb - .064 * U, .064 * U, .074 * U); mer(a, .064 * U, cb - .064 * U, 4); }
    const ar = new Path2D(), aw = .016 * U; ar.moveTo(vx - aw, cb + .002 * U); ar.lineTo(vx - aw, cb - .024 * U); ar.arc(vx, cb - .024 * U, aw, Math.PI, 0); ar.lineTo(vx + aw, cb + .002 * U); ar.closePath();
    RDP.city = { p, ar, cb, CW }; }
}

function roadPastel(ctx, u, mode = 'confess') {
  const { clamp, lerp, ss, ramp, rgb, mix, hex } = Pilot, L = RDP.L, { W, H, V, hz } = L, R0 = V ? W : H;
  const T = mode === 'confess' ? .05 + .1 * ss(-.8, 8.5, u) : mode === 'foretell' ? .15 + .45 * ss(0, 8, u) : mode === 'protest' ? .62 + .12 * ss(-.8, 5, u) : .78 + .22 * ss(-.8, 5.2, u);
  const C = k => ramp(RD_C[k], T);
  if (mode === 'protest') return rdProtest(ctx, u, T, C);
  if (mode === 'foretell') return rdForetell(ctx, u, T, C);
  // camera (world → screen) with parallax per layer
  const K = V ? { confess: [[-.8, .55 * W, .5 * H, 1.22], [2.2, .6 * W, .505 * H, 1.4], [3.4, .755 * W, .438 * H, 4.0], [6.5, .75 * W, .442 * H, 4.2], [8.5, .6 * W, .518 * H, 1.42]], alone: [[-.8, .62 * W, .5 * H, 1.22], [5.4, .6 * W, .512 * H, 1.36]] }
              : { confess: [[-.8, .5 * W, .56 * H, 1.22], [2.2, .54 * W, .565 * H, 1.4], [3.4, .69 * W, .522 * H, 3.1], [6.5, .685 * W, .525 * H, 3.25], [8.5, .55 * W, .575 * H, 1.42]], alone: [[-.8, .58 * W, .56 * H, 1.22], [5.4, .56 * W, .57 * H, 1.36]] };   // nearer than before (the people 1.3–1.4×), always moving: a slow push in, a slow pull back
  let [fx, fy, z] = rdCam(K[mode], u); fx = clamp(fx, L.X0 + W / 2 / z, L.X1 - W / 2 / z); fy = clamp(fy, H / 2 / z, L.Y1 - H / 2 / z);
  const camP = (g, p) => { const zp = 1 + (z - 1) * p; if (p < 1) { g.translate(W / 2, H / 2 + (hz - fy) * z); g.scale(zp, zp); g.translate(-(W / 2 + (fx - W / 2) * p), -hz); return; }   // far layers: zoom less, but stay standing on the land's horizon
    g.translate(W / 2, H / 2); g.scale(zp, zp); g.translate(-(W / 2 + (fx - W / 2) * p), -(H / 2 + (fy - H / 2) * p)); };
  const sc = (x, y) => [W / 2 + (x - fx) * z, H / 2 + (y - fy) * z];
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  // the sky (gold → rose → violet; looking away from the sun: the rose band and the earth's blue shadow rise on the horizon at dusk)
  { const [, hy] = sc(0, hz), g = ctx.createLinearGradient(0, hy - H * .75, 0, hy); g.addColorStop(0, rgb(mix(C('top'), [14, 14, 36], ss(.8, 1, T) * .4))); g.addColorStop(.55, rgb(C('top'))); g.addColorStop(.84, rgb(C('mid'))); g.addColorStop(1, rgb(C('hor')));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const es = ss(.5, 1, T); if (es > 0) { const g2 = ctx.createLinearGradient(0, hy - .07 * H * es, 0, hy); g2.addColorStop(0, 'rgba(90,84,140,0)'); g2.addColorStop(1, `rgba(80,76,136,${.55 * es})`); ctx.fillStyle = g2; ctx.fillRect(0, hy - .07 * H * es, W, .07 * H * es + 2); }
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .55; ctx.drawImage(RDP.skyHatch, 0, Math.min(0, hy - RDP.skyHatch.height)); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  // the southern horizon (right, where the road goes) darkens as the passion is told
  const south = mode === 'alone' ? .55 : 0;
  // stars: the first one in 'alone'
  if (mode === 'alone') { const a = ss(1.2, 2.6, u), tw = .85 + .15 * Math.sin(u * 6); if (a > 0) { const x = W * (V ? .7 : .74), y = H * (V ? .14 : .16), g = ctx.createRadialGradient(x, y, 0, x, y, 40);
    g.addColorStop(0, `rgba(255,248,230,${.9 * a * tw})`); g.addColorStop(.12, `rgba(255,240,220,${.45 * a})`); g.addColorStop(1, 'rgba(255,240,220,0)'); ctx.fillStyle = g; ctx.fillRect(x - 40, y - 40, 80, 80);
    ctx.fillStyle = `rgba(255,252,240,${a})`; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 6.283); ctx.fill(); ctx.globalAlpha = .5 * a; ctx.fillRect(x - 12, y - .7, 24, 1.4); ctx.fillRect(x - .7, y - 12, 1.4, 24); ctx.globalAlpha = 1; } }
  // clouds, tinted by the light, drifting
  { const cg = RDP.cloudT.getContext('2d'), cw = RDP.cloudT.width, ch = RDP.cloudT.height; cg.globalCompositeOperation = 'source-over'; cg.clearRect(0, 0, cw, ch); cg.drawImage(RDP.clouds, 0, 0); cg.globalCompositeOperation = 'source-in'; cg.fillStyle = rgb(mix(mix(C('hor'), [255, 230, 210], .35), C('mid'), ss(.6, 1, T))); cg.fillRect(0, 0, cw, ch);
    const tt = u + { confess: 0, alone: 20 }[mode]; ctx.save(); camP(ctx, .15); ctx.globalAlpha = .85 - .35 * ss(.7, 1, T); ctx.drawImage(RDP.cloudT, -.2 * W - tt * 4, 0, cw, hz); ctx.restore(); }
  // Hermon far off (snow with the alpenglow), the far hills, then the land
  { const hm = RDP.herm, lw = RDP.land.w, lh = hm.c.height / L.S; ctx.save(); camP(ctx, .25); ctx.globalAlpha = .62; ctx.drawImage(hm.c, RDP.land.ox, hm.y0, lw, lh);
    const sg = RDP.snowT.getContext('2d'); sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, RDP.snowT.width, RDP.snowT.height); sg.drawImage(hm.sn, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = rgb(C('snow')); sg.fillRect(0, 0, RDP.snowT.width, RDP.snowT.height);
    ctx.globalAlpha = .75; ctx.drawImage(RDP.snowT, RDP.land.ox, hm.y0, lw, lh); ctx.globalAlpha = 1; ctx.restore(); }
  { const hl = RDP.hills; ctx.save(); camP(ctx, .55); ctx.drawImage(hl.c, RDP.land.ox, hl.y0, RDP.land.w, hl.c.height / L.S); ctx.restore(); }
  ctx.save(); camP(ctx, 1); ctx.drawImage(RDP.landC, RDP.land.ox, RDP.land.oy, RDP.land.w, RDP.land.h);
  { const a = ss(1.5, 2.3, z); if (a > 0) { const lh = RDP.landHi; ctx.globalAlpha = a; ctx.drawImage(lh.c, lh.x, lh.y, lh.w, lh.h); ctx.globalAlpha = 1; } }   // the sharp patch in the close-up
  // moving cloud shadows over the fields (cool), the band's spot kept in the sun
  { const tt = u + { confess: 0, alone: 20 }[mode], r = Pilot.rng(71); ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 5; i++) { const px = L.X0 + ((r() * 1.6 + tt * .012) % 1.6) * W, py = hz + (.06 + .5 * r()) * (H - hz), rr = (.18 + .2 * r()) * R0;
      const g = ctx.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, `rgba(140,128,170,${.35 * (1 - ss(.7, 1, T))})`); g.addColorStop(1, 'rgba(140,128,170,0)'); ctx.fillStyle = g; ctx.fillRect(px - rr, py - rr, 2 * rr, 1.6 * rr); }
    ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  // the light falls over the whole land: multiply toward dusk; the south darkens
  { const [, hy] = sc(0, hz); ctx.globalCompositeOperation = 'multiply'; const lg = ctx.createLinearGradient(0, hy - .04 * H, 0, hy + .06 * H); lg.addColorStop(0, 'rgba(255,255,255,1)'); lg.addColorStop(1, rgb(C('land'))); ctx.fillStyle = lg; ctx.fillRect(0, hy - .04 * H, W, H);
    if (south > 0) { const [sx, sy] = sc(L.road[8][0] * W, L.crest * H), rr = .75 * R0 * z, g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr); g.addColorStop(0, `rgba(70,60,110,${south})`); g.addColorStop(1, 'rgba(70,60,110,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    ctx.globalCompositeOperation = 'source-over'; }
  // warm low sun from behind-left across the land (gone by dusk)
  { const a = .3 * (1 - ss(.45, .8, T)); if (a > 0) { ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, 0, W, H * .4); g.addColorStop(0, rgb(C('light'), a)); g.addColorStop(.6, rgb(C('light'), 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; } }

  // the band on the road
  const B = RDP.band, at = a => { const s = RDP.rs, l = RDP.rl; let lo = 0, hi = l.length - 1; a = clamp(a, 0, l[hi]); while (hi - lo > 1) { const m = (lo + hi) >> 1; if (l[m] < a) lo = m; else hi = m; }
    const k = (a - l[lo]) / ((l[hi] - l[lo]) || 1), p = [lerp(s[lo][0], s[hi][0], k), lerp(s[lo][1], s[hi][1], k)], dx = s[hi][0] - s[lo][0], dy = s[hi][1] - s[lo][1], dl = Math.hypot(dx, dy) || 1; return { p, n: [-dy / dl, dx / dl] }; };
  const vel = RDP.hl * .75, walkF = (uu, ts) => uu <= 0 ? uu : uu < ts ? uu - uu * uu / (2 * ts) : ts / 2;
  const peterStep = mode === 'confess' ? ss(3.3, 4.5, u) : 1, light = rgb(C('light')), Lt = [.94, .34];
  const shLen = mode === 'confess' ? 1.3 : 0, shA = mode === 'alone' ? 0 : .17 * (1 - ss(.62, .78, T)), shD = V ? [.82, -.57] : [.86, -.5];
  const items = B.map((b, i) => {
    let a, walk = 0, face = 1, ph, back = 1;   // walking up the road we see their backs
    if (mode === 'confess') { const ts = 1.1 + .07 * b.back / L.fh; a = RDP.aLead - b.back * (1 - .06 * ss(.6, 2, u)) + vel * (walkF(u, ts) - .55); const wv = u < ts ? 1 - u / ts : 0; walk = clamp(wv * 1.4); ph = b.ph0 + (a / (RDP.hl * .55)) * Math.PI;
      back = 1 - .2 * ss(ts * .8, ts + .6, u); face = .6 + .4 * Math.sin(u * .7 + b.ph0) * ss(ts, ts + 1, u);   // stopped, they look up to him
      if (b.jesus) { const k = ss(.85, 1.7, u); face = lerp(1, -1, k); back = lerp(1, .15, k); }   // he turns to them (his face stays in the shade of the cloth)
      if (b.peter) { a += b.back * .5 * peterStep; walk = Math.max(walk, Math.sin(Math.PI * peterStep) * .9); ph = b.ph0 + (a / (RDP.hl * .55)) * Math.PI; back = lerp(back, .3, peterStep); face = lerp(face, 1, peterStep); } }
    else { const rest = RDP.aLead - b.back * .94 + RDP.hl * 1.6; if (b.peter) { a = RDP.aLead - RDP.hl * 3; ph = b.ph0; walk = 0; }   // the band has walked on; Peter stays a few steps behind the last of them
      else { a = rest + RDP.hl * .6 + vel * .95 * (u + .8); walk = 1; ph = b.ph0 + (a / (RDP.hl * .55)) * Math.PI; } }
    const { p, n } = at(a), hw = RDP.wd(p[1]) / 2, side = b.peter && mode !== 'confess' ? -.1 : b.peter ? lerp(b.side, -.1, peterStep) : b.side;
    const lat = side * Math.max(hw * 1.6, RDP.hl * 1.6), X = p[0] + n[0] * lat, Y = p[1] + n[1] * lat;
    return { b, i, X, Y, h: RDP.hs(Y), walk, face, ph, back }; }).sort((a, b) => a.Y - b.Y);
  // shadows: long and running up the road ahead of each (from the low sun behind us)
  if (shLen > 0 && shA > 0) { const sh = RDP.shC, sg = sh.getContext('2d'); sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, sh.width, sh.height); sg.scale(.5, .5); sg.fillStyle = 'rgb(84,72,124)';
    const nrm = [-shD[1], shD[0]];
    for (const it of items) { const [px, py] = sc(it.X, it.Y), h = it.h * z, Ls = h * shLen * .62;   // his own silhouette laid down along the road from his feet
      const Ps = (x, y) => [px + shD[0] * (-y) * Ls + nrm[0] * x * h * .9, py + shD[1] * (-y) * Ls + nrm[1] * x * h * .9 + .02 * h];
      sg.fill(rdPerson(Ps, Object.assign({}, it.b.o, { face: 1, ph: it.ph, walk: it.walk }))); }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = shA * 2.2; ctx.drawImage(sh, 0, 0, W, H); ctx.restore(); }   // one layer: where shadows overlap it is no darker
  // Peter's step into the warmest light (confess)
  const glow = mode === 'confess' ? ss(3.2, 4.6, u) * (1 - .3 * ss(6.2, 8, u)) : 0, P0 = items.find(it => it.b.peter);
  if (glow > 0 && P0) { const [px, py] = sc(P0.X, P0.Y - P0.h * .3), rr = .2 * R0 * z; ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(px, py, 0, px, py, rr);
    g.addColorStop(0, `rgba(255,214,140,${.75 * glow})`); g.addColorStop(.4, `rgba(255,190,120,${.3 * glow})`); g.addColorStop(1, 'rgba(255,170,100,0)'); ctx.fillStyle = g; ctx.fillRect(px - rr, py - rr, 2 * rr, 2 * rr);
    const [fx2, fy2] = sc(P0.X, P0.Y), pr = P0.h * z * 1.3, g3 = ctx.createRadialGradient(fx2, fy2, 0, fx2, fy2, pr); g3.addColorStop(0, `rgba(255,226,160,${.7 * glow})`); g3.addColorStop(1, 'rgba(255,200,130,0)');
    ctx.save(); ctx.translate(fx2, fy2); ctx.scale(1, .4); ctx.translate(-fx2, -fy2); ctx.fillStyle = g3; ctx.fillRect(fx2 - pr, fy2 - pr, 2 * pr, 2 * pr); ctx.restore(); ctx.globalCompositeOperation = 'source-over'; }   // a pool of sun on the road where he stands
  // the figures, on their own layer (grained like pastel), nearest last
  const fl = RDP.fl, g = fl.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  const rimA = 1 - .55 * ss(.6, .95, T), land = C('land');
  for (const it of items) { const [px, py] = sc(it.X, it.Y), h = it.h * z, P = (x, y) => [px + x * h, py + y * h], o = rdLook(it.b, Object.assign({}, it.b.o, { face: it.face, ph: it.ph, walk: it.walk, back: it.back }), land);
    const path = rdPerson(P, o), boost = it.b.peter ? 1 + .8 * glow : 1; rdFigure(g, path, P, o, rgb(mix(Pilot.hex(it.b.body).map((c, k) => c * land[k] / 255), [236, 190, 130], it.b.peter ? .45 * glow : 0)), light, Lt, Math.max(1.4, .032 * h * boost), clamp(rimA * boost));
    if (it.b.jesus) RDP.lastJesus = [px, py, h]; }
  g.globalCompositeOperation = 'destination-out'; g.globalAlpha = .12; g.fillStyle = g.createPattern(RDP.grain, 'repeat'); g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  ctx.drawImage(fl, 0, 0);
  if (glow > 0 && P0) { const [px, py] = sc(P0.X, P0.Y - P0.h * .5), rr = .55 * R0, g = ctx.createRadialGradient(px, py, .04 * R0, px, py, rr); g.addColorStop(0, 'rgb(255,255,255)'); g.addColorStop(1, `rgb(${255 - 28 * glow | 0},${255 - 28 * glow | 0},${255 - 18 * glow | 0})`);   // the rest a shade under: he is the brightest
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const g4 = ctx.createRadialGradient(px, py, 0, px, py, .7 * R0); g4.addColorStop(0, `rgba(255,210,140,${.18 * glow})`); g4.addColorStop(1, 'rgba(255,200,130,0)'); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g4; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  rdExpose(ctx, T);
  rdFinish(ctx, T, L.band);
  ctx.restore();
}

// exposure: the bright gold frames are held down (the picture lives in the middle values); the dusk is left as it is
function rdExpose(ctx, T) { const e = Pilot.lerp(.76, 1, Pilot.ss(.2, .75, T)); if (e < 1) { const { W, H } = Pilot, v = Math.round(255 * e); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgb(${v},${v},${Math.min(255, v + 6)})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; } }
// the paper, the words' band kept calm, a soft vignette
function rdFinish(ctx, T, band) {
  const { W, H } = Pilot, V = Pilot.ori === 'v';
  { const y0 = H * (band - .01), y1 = H * (band + (V ? .07 : .06)), g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(40,32,70,0)'); g.addColorStop(1, 'rgba(40,32,70,.5)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); ctx.fillStyle = 'rgba(40,32,70,.5)'; ctx.fillRect(0, y1, W, H - y1); }
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .5; ctx.drawImage(RDP.paper, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const vg = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .45, W / 2, H * .45, Math.hypot(W, H) * .62); vg.addColorStop(0, 'rgba(24,18,44,0)'); vg.addColorStop(1, 'rgba(24,18,44,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

// 'protest' (마 16:22), low and a few steps behind Jesus, looking up the road into the dip of the hills where the last light is (관점 검수
// 5차: in the side view his face inside the head cloth read as a dark oval / a profile). He walks on up the road with his back to us —
// small, left of centre, the head cloth covering his head, no face and no profile line at any frame — and slows to a stop; Peter comes in
// across the road from the right and stops in the road AHEAD of him, square in his way, facing him (seen from the front, his head turned to
// Jesus: he is the one who acts — 관점 검수 6차 "he seemed to stand beside him"): one hand holds Jesus's arm above the elbow (at the wrist it
// read as walking hand in hand), the other is raised, palm out. From u 1.4 his insistent small movements, Jesus's head turning a little.
// Between their heads, in the dip, the last light. Fixed bone lengths (two-bone IK from each shoulder to its target).
function rdProtest(ctx, u, T, C) {
  const { ss, clamp, lerp, rgb, mix } = Pilot, { W, H } = RDP.L, PV = RDP.pv, hp = PV.hp, f = PV.f;
  const z = 1 + .07 * ss(-.8, 5.1, u), dx = -.012 * W * ss(-.8, 5.1, u), cx0 = PV.gx, cy0 = hp;
  const S = (x, y) => [cx0 + (x - cx0) * z + dx, cy0 + (y - cy0) * z];   // the camera: a slow push in toward the two and a drift
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // the sky: rose → violet
  { const g = ctx.createLinearGradient(0, 0, 0, S(0, hp)[1]); g.addColorStop(0, rgb(C('top'))); g.addColorStop(.6, rgb(C('mid'))); g.addColorStop(1, rgb(C('hor'))); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .5; ctx.drawImage(RDP.skyHatch, 0, 0, W, hp); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  { const cg = RDP.cloudT.getContext('2d'), cw = RDP.cloudT.width, ch = RDP.cloudT.height; cg.globalCompositeOperation = 'source-over'; cg.clearRect(0, 0, cw, ch); cg.drawImage(RDP.clouds, 0, 0); cg.globalCompositeOperation = 'source-in'; cg.fillStyle = rgb(mix(C('hor'), [255, 220, 210], .3)); cg.fillRect(0, 0, cw, ch);
    ctx.globalAlpha = .7; ctx.drawImage(RDP.cloudT, -.2 * W - u * 5 + dx * .3, 0, cw, hp); ctx.globalAlpha = 1; }
  const lastA = 1 - .35 * ss(2.6, 4.8, u), [gx, gy] = S(PV.gx, hp);
  { ctx.globalCompositeOperation = 'screen'; const R = .35 * W, g = ctx.createRadialGradient(gx, gy, 0, gx, gy, R); g.addColorStop(0, `rgba(255,204,150,${.65 * lastA})`); g.addColorStop(.3, `rgba(240,150,130,${.25 * lastA})`); g.addColorStop(1, 'rgba(200,120,140,0)');
    ctx.fillStyle = g; ctx.fillRect(gx - R, gy - R, 2 * R, 2 * R); ctx.globalCompositeOperation = 'source-over'; }
  { const pl = RDP.pland, [x0, y0] = S(-(pl.width - W) / 2, -(pl.height - H) / 2); ctx.drawImage(pl, x0, y0, pl.width * z, pl.height * z); }
  // (no bright seam on the horizon: it would read as a line joining them; the glow in the dip carries the last light)
  ctx.globalCompositeOperation = 'multiply'; { const g = ctx.createLinearGradient(0, gy - .01 * H, 0, gy + .08 * H); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, rgb(C('land'))); ctx.fillStyle = g; ctx.fillRect(0, gy - .01 * H, W, H); } ctx.globalCompositeOperation = 'source-over';
  // the road catches the last light toward the dip
  { const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, .3 * H); g.addColorStop(0, `rgba(255,200,160,${.28 * lastA})`); g.addColorStop(1, 'rgba(255,190,150,0)'); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, gy, W, .3 * H); ctx.globalCompositeOperation = 'source-over'; }
  // Jesus: a few more steps up the road (away from us), slowing to a stop; world lateral -.34 (left of the road's middle) — small, off the
  // centre, his back to us all through. His arms hang in the sleeves (a sleeve flaring to its cuff, a shaped hand: 관점 검수 6차 "the
  // forearm read as a log, the hand as a lump"); Peter holds the right one above the elbow, drawing it out a little.
  // From u 1.4 (film 68.5) a little life: Peter's tugs and his raised hand, Jesus's head turning a little toward him (inside the back
  // view: the head cloth only shifts), the robes and the head cloths in the wind.
  const life = ss(1.2, 1.9, u), ph6 = (u - 1.4) * 6.6, wob = Math.sin(ph6), tug = life * (.5 + .5 * Math.sin(ph6 - .7));
  const pull = ss(1.3, 3.1, u) * (1 - .3 * ss(3.6, 4.3, u)), wk = clamp((u + 1.2) / 2.3), Zj = PV.ZJ - .6 * (1 - wk) ** 2, hj = f / Zj, xj = PV.gx - .34 * hj, fyj = hp + PV.cH * hj;
  const take = ss(.35, 1.2, u), jx = lerp(.18, .205 + .012 * pull + .012 * tug, take), jy = lerp(-.405, -.425 - .006 * pull - .006 * tug, take);
  const jo = { w: RD_JESUS.w, noFace: true, back: 1, face: 1, hem: 1.04, ph: 7.85 * Zj, walk: 1 - ss(.15, 1.1, u), lean: .004 + .006 * pull, handT: true, reach: [null, [jx, jy]],
    wind: .012 * Math.sin(u * 2.1) + .006 * Math.sin(u * 3.7 + 1), hemSway: .006 * Math.sin(u * 1.7 + .4) * ss(.8, 1.6, u), headX: .022 * ss(1.5, 2.4, u) * (1 - .45 * ss(3.3, 4.2, u)) };
  const Pj = (x, y) => S(xj + x * hj, fyj + y * hj), jesus = rdPerson(Pj, jo), aJ = jesus.joints[1];   // his right arm (on Peter's side)
  // Peter: in the road AHEAD of him (Z × 1.22: smaller, his feet further up the road), come in across it from the right; he stands square
  // in Jesus's way facing him (seen from the front, his head turned to Jesus), leaning toward him: his right hand grips Jesus's arm above the elbow,
  // his left is raised, palm out (마 16:22 "붙들고 항변하여 … 주여 그리 마옵소서"). He is the one who moves.
  const arrive = ss(-.7, .9, u), hP = f / (PV.ZJ * 1.22), xp = PV.gx + (.19 + 1.1 * (1 - arrive)) * PV.hJ, fyp = hp + PV.cH * hP, h = hP * z;
  const pl = -.03 - .02 * pull + .012 * wob * life;
  const po = { w: RD_PETER.w, lean: pl, face: -1, back: 0, hem: 1.0, beard: true, faceOpen: true, ph: 3.14 * 3 * arrive, walk: clamp(Math.sin(Math.PI * arrive) * 1.2), noArms: true,
    wind: .01 * Math.sin(u * 2.3 + 2), hemSway: .007 * Math.sin(u * 2.2 + 1.3) * life };
  const Pp = (x, y) => S(xp + x * hP, fyp + y * hP), peter = rdPerson(Pp, po), B = (x, y) => Pp(x + pl * (-y), y), swP = .148 * RD_PETER.w;
  const grip1 = ss(.5, 1.15, u), raise = ss(.75, 1.5, u), sv = Math.sin(po.ph) * po.walk;
  const G1 = [lerp(aJ.sh[0], aJ.el[0], .74), lerp(aJ.sh[1], aJ.el[1], .74)];   // on Jesus's arm just above the elbow (at the wrist it read as walking hand in hand)
  const aD = (() => { const dx = aJ.el[0] - aJ.sh[0], dy = aJ.el[1] - aJ.sh[1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; })(), nA = aD[1] > 0 ? [-aD[1], aD[0]] : [aD[1], -aD[0]];   // across his upper arm, away from Peter
  const sP1 = B(-swP, -.745), rest1 = B(-swP - .035 + .05 * sv, -.42), aP1 = rdIK(sP1, [lerp(rest1[0], G1[0], grip1), lerp(rest1[1], G1[1], grip1)], .19 * h, .17 * h, -1);
  const R2 = B(-.05 + .008 * wob * life, -.69 + .014 * Math.sin(ph6 + .5) * life), sP2 = B(swP, -.745), rest2 = B(swP + .035 - .05 * sv, -.42), aP2 = rdIK(sP2, [lerp(rest2[0], R2[0], raise), lerp(rest2[1], R2[1], raise)], .19 * h, .17 * h, -1);
  // back: Peter's sleeve ends a little short of the wrist once his hand comes out (the joints stay where they are)
  const arm = (p, s, a, w0, back = 0) => { rdLimb(p, s, a.el, w0 * h, w0 * .88 * h); const d = Math.hypot(a.wr[0] - a.el[0], a.wr[1] - a.el[1]) || 1, e = Math.max(.3, 1 - back / d);
    rdLimb(p, a.el, [lerp(a.el[0], a.wr[0], e), lerp(a.el[1], a.wr[1], e)], w0 * .85 * h, w0 * .62 * h); };
  const back1 = .05 * h * clamp((grip1 - .3) / .4), back2 = .05 * h * raise;
  const pArm1 = new Path2D(); arm(pArm1, sP1, aP1, .05, back1);
  const pArm2 = new Path2D(); arm(pArm2, sP2, aP2, .05, back2);
  // Peter's hands (8th render: tapered shapes read as mittens): out of the cuff the back of the hand, then four fingers with dark gaps
  // laid across Jesus's arm toward its far edge, the thumb along the near side; while reaching, the same hand open along his own forearm.
  // The raised hand: the palm toward Jesus, fingers up, the thumb toward him. sil = the outline (and the finger gaps).
  const poly = (p, pts) => { let s = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; s += x0 * y1 - x1 * y0; } if (s < 0) pts = pts.slice().reverse();
    const n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2]; p.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) p.quadraticCurveTo(pts[i][0], pts[i][1], ...m(i)); p.closePath(); };
  const holdHand = (a, G, grip, cuff, back, thumbTo) => {
    const [wx, wy] = a.wr, [ex, ey] = a.el, d0 = Math.hypot(wx - ex, wy - ey) || 1, up = [(wx - ex) / d0, (wy - ey) / d0], k = ss(.55, 1, grip), sc = 1;   // the hand always shown (open along his forearm while he walks in)
    const far = [G[0] + nA[0] * .016 * h, G[1] + nA[1] * .016 * h], fd = Math.hypot(far[0] - wx, far[1] - wy) || 1;
    let c = [lerp(up[0], (far[0] - wx) / fd, k), lerp(up[1], (far[1] - wy) / fd, k)]; { const cl = Math.hypot(...c) || 1; c = [c[0] / cl, c[1] / cl]; }
    const p = [-c[1], c[0]], xs = cuff * .8 - back, L = xs + sc * lerp(.05 * h, Math.max(.034 * h, fd + .003 * h - xs), k), Q = (x, y) => [wx + c[0] * x + p[0] * y, wy + c[1] * x + p[1] * y];
    const fl = Math.min(.034 * h, (L - xs) * .72), xk = L - fl, sp = .0112 * h * sc, fw = .0041 * h * sc, hw0 = .0165 * h * sc, hw1 = .021 * h * sc;
    const side = (Math.sign(p[0] * aD[0] + p[1] * aD[1]) || 1) * thumbTo;   // the thumb toward Jesus's elbow (-1) or wrist (+1)
    const palm = new Path2D(); poly(palm, [Q(xs - .014 * h, -hw0), Q(lerp(xs, xk, .5), -hw1 * .95), Q(xk + .003 * h, -hw1), Q(xk + .003 * h, hw1), Q(lerp(xs, xk, .5), hw1 * .95), Q(xs - .014 * h, hw0)]);
    const fingers = [-1.5, -.5, .5, 1.5].map(i => { const f = new Path2D(), y = i * sp, len = fl - (Math.abs(i) > 1 ? .005 : i < 0 ? 0 : .0015) * h * sc;   // the middle finger longest, the outer two shorter
      rdLimb(f, Q(xk - .005 * h, y), Q(xk + len - fw, y * 1.05), fw * 1.1, fw * .9); return f; });
    const t0 = Q(xs + .001 * h, side * hw0 * .85), td = [side * p[0] * .8 + c[0] * .55, side * p[1] * .8 + c[1] * .55], tl = .022 * h * sc * (.6 + .4 * k);
    const thumb = new Path2D(); rdLimb(thumb, t0, [t0[0] + td[0] * tl, t0[1] + td[1] * tl], .0058 * h * sc, .0042 * h * sc);
    const sil = new Path2D(); sil.addPath(palm); sil.addPath(thumb); fingers.forEach(f => sil.addPath(f));
    const gap = new Path2D(); poly(gap, [Q(xk - .004 * h, -1.5 * sp), Q(xk + fl * .7, -1.5 * sp), Q(xk + fl * .7, 1.5 * sp), Q(xk - .004 * h, 1.5 * sp)]);   // dark between the fingers
    sil.addPath(gap); return { sil, palm, fingers, thumb };
  };
  const raisedHand = (a, k) => {   // k 0 hanging (along his forearm) … 1 raised (fingers up, leaning a little toward Jesus)
    const [wx, wy] = a.wr, [ex, ey] = a.el, d0 = Math.hypot(wx - ex, wy - ey) || 1, fa = [(wx - ex) / d0, (wy - ey) / d0], upv = [-.3, -1];
    let c = [lerp(fa[0], upv[0], k), lerp(fa[1], upv[1], k)]; { const cl = Math.hypot(...c) || 1; c = [c[0] / cl, c[1] / cl]; }
    let p = [-c[1], c[0]]; if (p[0] > 0) p = [-p[0], -p[1]];   // p toward Jesus (screen left): the thumb's side
    const Q = (x, y) => [wx + (c[0] * x + p[0] * y) * h, wy + (c[1] * x + p[1] * y) * h], sp = .0105, fw = .0046;
    const palm = new Path2D(); poly(palm, [Q(-.006, -.017), Q(.026, -.022), Q(.05, -.021), Q(.052, .02), Q(.026, .021), Q(-.006, .016)]);
    const fingers = [-1.5, -.5, .5, 1.5].map(i => { const f = new Path2D(), y = i * sp, len = (.034 - Math.abs(i) * .0035 + (i === -.5 ? .002 : 0)) * (.75 + .25 * k);
      rdLimb(f, Q(.046, y * .95), Q(.046 + len, y * (1 + .12 * k)), fw * 1.1 * h, fw * .9 * h); return f; });
    const thumb = new Path2D(); rdLimb(thumb, Q(.012, .016), Q(.032, .03 + .006 * k), .0064 * h, .0046 * h);
    const sil = new Path2D(); sil.addPath(palm); sil.addPath(thumb); fingers.forEach(f => sil.addPath(f));
    const gap = new Path2D(); poly(gap, [Q(.046, -1.5 * sp), Q(.072, -1.6 * sp), Q(.072, 1.6 * sp), Q(.046, 1.5 * sp)]); sil.addPath(gap); return { sil, palm, fingers, thumb };
  };
  const H1 = holdHand(aP1, G1, grip1, .05 * .62 * h, back1, 1), H2 = raisedHand(aP2, raise);
  const fl = RDP.fl, g = fl.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  // short soft shadows toward us (the light is ahead of them)
  for (const [P0, hh] of [[Pp, h], [Pj, hj * z]]) { const [ex, ey] = P0(0, .035); g.save(); g.translate(ex, ey); g.scale(1, .2); const sg = g.createRadialGradient(0, 0, 0, 0, 0, .3 * hh);
    sg.addColorStop(0, 'rgba(40,30,60,.3)'); sg.addColorStop(.6, 'rgba(40,30,60,.16)'); sg.addColorStop(1, 'rgba(40,30,60,0)'); g.fillStyle = sg; g.fillRect(-.3 * hh, -.3 * hh, .6 * hh, .6 * hh); g.restore(); }
  const land = C('land'), tint = c => rgb(Pilot.hex(c).map((v, k) => v * land[k] / 255)), light = rgb(mix(C('light'), [255, 224, 186], .45)), rimA = clamp(1.1 - .35 * ss(2.6, 4.6, u));
  const join = (...ps) => { const p = new Path2D(); ps.forEach(q => p.addPath(q)); return p; };
  const wp = join(peter, pArm2, pArm1); for (const k of ['hd', 'hf', 'hr', 'hc', 'hb', 'arm', 'noFace', 'hs']) wp[k] = peter[k];
  rdLook({ jesus: true, hc: RD_JESUS.hc, band: RD_JESUS.band }, jo, land); rdLook({ hc: RD_PETER.hc, band: RD_PETER.band, hairCol: RD_PETER.hair }, po, land); jo.softRim = po.softRim = true;
  // Peter first (he stands further up the road), his sleeves a shade darker (the raised one, across his chest, darker still; not over his
  // head cloth or beard)
  rdFigure(g, wp, Pp, po, tint(RD_PETER.body), light, [1, .05], .02 * h, rimA);
  g.save(); { const ex = new Path2D(); ex.rect(0, 0, W, H); ex.addPath(peter.hc); ex.addPath(peter.hr); g.clip(ex, 'evenodd'); }
  g.fillStyle = 'rgba(28,16,30,.22)'; g.fill(pArm1); g.fillStyle = 'rgba(28,16,30,.3)'; g.fill(pArm2); g.restore();
  // then Jesus, nearer, his back to us
  rdFigure(g, jesus, Pj, jo, tint(RD_JESUS.body), light, [-1, .05], .02 * hj * z, rimA);
  // Peter's hands: the raised one, and the one round Jesus's wrist
  const skinHand = (Hh, shade) => { g.fillStyle = tint('#6a4436'); g.fill(Hh.sil); g.fillStyle = po.skin; g.fill(Hh.palm); g.fill(Hh.thumb); Hh.fingers.forEach(f => g.fill(f));
    if (shade) { g.fillStyle = 'rgba(28,16,30,' + shade + ')'; g.fill(Hh.palm); g.fill(Hh.thumb); Hh.fingers.forEach(f => g.fill(f)); } };
  skinHand(H2, .12); skinHand(H1, 0);
  g.globalCompositeOperation = 'destination-out'; g.globalAlpha = .1; g.fillStyle = g.createPattern(RDP.grain, 'repeat'); g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  ctx.drawImage(fl, 0, 0);
  RDP.lastPose = { grips: [G1, R2], hands: [aP1.wr, aP2.wr], elbows: [aP1.el, aP2.el, aJ.el], shoulders: [sP1, sP2, aJ.sh], jesusX: xj, peterX: xp, jesusH: hj * z };
  rdExpose(ctx, T);
  rdFinish(ctx, T, RDP.L.band);
  ctx.restore();
}

// 'foretell' (마 16:21 "그때로부터 예수께서 … 예루살렘에 올라가 …"; 막 10:32 "예수께서 그들 앞에서 가시는데 … 따르는 자들은 두려워하더라"), from
// behind the band (관리자 2026-11-14 "이 들판장면에서 너무 다들 가만히 서있는데 걸어가는장면일까?"): a walking scene from first frame to last.
// He walks on ahead up the road toward the small city on the horizon, steady, his back to us; the twelve follow on the road in a loose file
// two abreast (some at its edges), slower and hesitant — each slows and picks up again on his own beat, never standing still — so the gap
// between him and them opens; the low sun goes down beside Jerusalem and the city comes out of the haze as a silhouette, light in its gate.
// From u 5.4 Peter quickens out of the group toward him (he stops him in the road in 'protest'). D is depth (∝ distance), X across in body heights.
// The twelve: [X off the road's middle (the road is ±.8), D behind the first of them] by band index (1–12; 2 = Peter, in the first rank).
const RD_FILE = [null, [-.5, 0], [.12, .06], [.55, .28], [-.18, .33], [-.62, .58], [.26, .63], [.62, .86], [-.3, .92], [.08, 1.16], [-.64, 1.22], [.5, 1.44], [-.14, 1.5]];
const rdSsI = (a, b, t) => { if (t <= a) return 0; const w = b - a, x = Math.min(1, (t - a) / w); return w * (x ** 3 - x ** 4 / 2) + Math.max(0, t - b); };   // ∫ smoothstep
function rdForetell(ctx, u, T, C) {
  const { ss, clamp, lerp, rgb, mix } = Pilot, L = RDP.L, { W, H, V } = L, F = RDP.fv, { hp, vx, U } = F;
  const pz = ss(-.8, 8.8, u), z = 1 + .2 * pz, ax = vx - .07 * W, ay = hp + .07 * H;   // the camera: a slow push toward him and the city
  const S = (x, y) => [ax + (x - ax) * z, ay + (y - ay) * z], cam = g => g.setTransform(z, 0, 0, z, ax - ax * z, ay - ay * z);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  const [, hy] = S(0, hp);
  // the sky, warm toward the sun
  { const g = ctx.createLinearGradient(0, hy - H * .62, 0, hy); g.addColorStop(0, rgb(C('top'))); g.addColorStop(.5, rgb(mix(C('top'), C('mid'), .5))); g.addColorStop(.85, rgb(C('mid'))); g.addColorStop(1, rgb(C('hor'))); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .5; ctx.drawImage(RDP.skyHatch, 0, Math.min(0, hy - RDP.skyHatch.height)); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  // the low sun beside the city, going down toward the hills; its glow spreads along the horizon (the light is the one moving thing up there)
  const [sx, sy] = S(vx - (V ? .2 : .16) * U + .03 * U * pz, hp - (.06 - .046 * pz) * U), sun = C('light');
  { ctx.globalCompositeOperation = 'screen'; const R = (V ? .75 : .6) * W, g = ctx.createRadialGradient(sx, sy, 0, sx, sy, R); g.addColorStop(0, rgb(sun, .8)); g.addColorStop(.12, rgb(sun, .42)); g.addColorStop(.45, rgb(mix(sun, C('mid'), .5), .14)); g.addColorStop(1, rgb(sun, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(sx, sy); ctx.scale(1, .16); const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, W * .9); g2.addColorStop(0, rgb(sun, .5)); g2.addColorStop(1, rgb(sun, 0)); ctx.fillStyle = g2; ctx.fillRect(-W, -W, 2 * W, 2 * W); ctx.restore();
    ctx.globalCompositeOperation = 'source-over'; const rs = .021 * U * z; ctx.fillStyle = rgb(mix(sun, [255, 248, 228], .6)); ctx.beginPath(); ctx.arc(sx, sy, rs, 0, 6.283); ctx.fill(); }
  // clouds drifting, lit from below by the sun
  { const cg = RDP.cloudT.getContext('2d'), cw = RDP.cloudT.width, ch = RDP.cloudT.height; cg.globalCompositeOperation = 'source-over'; cg.clearRect(0, 0, cw, ch); cg.drawImage(RDP.clouds, 0, 0); cg.globalCompositeOperation = 'source-in'; cg.fillStyle = rgb(mix(C('hor'), [255, 226, 200], .35)); cg.fillRect(0, 0, cw, ch);
    ctx.globalAlpha = .8; ctx.drawImage(RDP.cloudT, -.2 * W - (u + 8) * 5, hy - L.hz * 1.05, cw, L.hz); ctx.globalAlpha = 1; }
  // the hills and the land, then the city on its rise
  ctx.save(); cam(ctx); ctx.drawImage(RDP.fland, F.ox, F.oy);
  { const ct = RDP.city, k = ss(.6, 4.6, u), col = mix(mix(C('hor'), C('mid'), .35), [56, 42, 82], .42 + .5 * k);
    ctx.fillStyle = rgb(col); ctx.fill(ct.p);
    ctx.fillStyle = rgb(mix(sun, [255, 236, 196], .3), .35 + .55 * k); ctx.fill(ct.ar);   // the light through its gate
    const g = ctx.createRadialGradient(vx, ct.cb - .02 * U, 0, vx, ct.cb - .02 * U, .05 * U); g.addColorStop(0, rgb(sun, .3 * k)); g.addColorStop(1, rgb(sun, 0)); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(vx - .05 * U, ct.cb - .07 * U, .1 * U, .1 * U); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  // the light on the land: the far fields shine toward the sun, the near ground is in the band's own shade (backlight); the road catches
  // the low sun all the way to the gate
  { ctx.globalCompositeOperation = 'multiply'; const lg = ctx.createLinearGradient(0, hy, 0, H); lg.addColorStop(0, rgb(C('land'))); lg.addColorStop(.25, rgb(mix(C('land'), [196, 176, 206], .3))); lg.addColorStop(1, rgb(mix(C('land'), [150, 128, 168], .55))); ctx.fillStyle = lg; ctx.fillRect(0, hy, W, H - hy);
    ctx.globalCompositeOperation = 'screen'; const sg = ctx.createLinearGradient(0, hy, 0, hy + .14 * H); sg.addColorStop(0, rgb(sun, .45)); sg.addColorStop(1, rgb(sun, 0)); ctx.fillStyle = sg; ctx.fillRect(0, hy, W, .14 * H);
    ctx.save(); cam(ctx); ctx.clip(F.road); ctx.setTransform(1, 0, 0, 1, 0, 0); const rg = ctx.createLinearGradient(0, hy, 0, hy + .3 * H); rg.addColorStop(0, rgb(mix(sun, [255, 240, 210], .4), .55)); rg.addColorStop(1, rgb(sun, 0)); ctx.fillStyle = rg; ctx.fillRect(0, hy, W, .3 * H); ctx.restore();
    ctx.globalCompositeOperation = 'source-over'; }
  // the band, all walking: he goes ahead at a steady pace (D .5/s); the twelve behind at .2/s, each slowing and picking up on his own slow
  // beat (speed 1 ± .5, never below a step). Seen from this high camera a man D away only clears the heads of men D′ away if D > 1.8 D′,
  // so he walks about twice as deep as their first rank (11.6 vs 6 → 16.4 vs 8): an empty stretch of road between him and them, widening.
  // Peter quickens out of them from u 5.4
  const landF = mix(C('land'), [168, 146, 184], .28), light = rgb(mix(sun, [255, 232, 196], .3)), rx = D => F.rx(F.Q / D), u0 = -.8;
  const items = RDP.band.map((b, i) => { const fr = k => (b.ph0 * k) % 1;
    let D, X, walk, back = 1, face, lean = (b.o.lean || 0) * .6, ph;
    if (b.jesus) { D = 11.6 + .5 * (u - u0); X = rx(D) - .04; walk = 1; face = .35; lean = .004; ph = b.ph0 + 11 * D; }
    else { const [l0, db] = RD_FILE[i], vg = .2, om = 6.283 * (.12 + .07 * fr(3.7)), phi = b.ph0 * 2, hs = (.36 + .14 * fr(5.3)) * (b.peter ? 1 - ss(4.6, 5.4, u) : 1);
      const sf = 1 + hs * Math.sin(om * u + phi);   // this man's pace now (1 = the band's)
      D = 6 - db + vg * (u - u0) - vg * hs / om * (Math.cos(om * u + phi) - Math.cos(om * u0 + phi));
      walk = clamp(.45 + .55 * sf); ph = b.ph0 + 24 * D; X = rx(D) + l0 + .05 * Math.sin(.45 * u + b.ph0);
      face = .3 * Math.sin(u * .6 + b.ph0); back = .9 + .1 * Math.sin(u * .5 + b.ph0);
      if (i === 3 || i === 4) { const k = ss(3.4, 4.1, u) * (1 - ss(5.4, 6.1, u)); face = lerp(face, i === 3 ? -1 : 1, k); back = lerp(back, .4, k); }   // two of them look at each other
      if (b.peter) { const k = ss(5.4, 7.6, u), ex = 1.1 * rdSsI(5.4, 7.6, u); D += ex; ph += 6 * ex; X = rx(D) + lerp(l0, .3, k); walk = Math.max(walk, ss(5.2, 5.9, u)); } }
    const [x, y, h] = F.at(X, D); return { b, i, x, y, h, D, walk, back, face, lean, ph }; }).sort((a, b) => b.D - a.D);
  const fl = RDP.fl, g = fl.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  const rimA = clamp(.95 - .4 * ss(.5, .9, T));
  for (const it of items) { const [px, py] = S(it.x, it.y), h = it.h * z, P = (x, y) => [px + x * h, py + y * h];
    g.fillStyle = 'rgba(40,30,60,.28)'; g.beginPath(); g.ellipse(px + .03 * h, py + .02 * h, .26 * h, .045 * h, 0, 0, 6.283); g.fill();   // short shade at the feet, toward us
    const o = rdLook(it.b, Object.assign({}, it.b.o, { face: it.face, back: it.back, ph: it.ph, walk: it.walk, lean: it.lean, wind: .012 * Math.sin(u * 2.3 + it.b.ph0) }), landF);
    const dx = px - sx, dy = py - .8 * h - sy, dl = Math.hypot(dx, dy) || 1;
    rdFigure(g, rdPerson(P, o), P, o, rgb(Pilot.hex(it.b.body).map((c, k) => c * landF[k] / 255 * (it.b.jesus ? .9 : 1))), light, [dx / dl, dy / dl], Math.max(1.2, .024 * h), rimA);
    if (it.b.jesus) RDP.lastJesus = [px, py, h]; }
  g.globalCompositeOperation = 'destination-out'; g.globalAlpha = .1; g.fillStyle = g.createPattern(RDP.grain, 'repeat'); g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  ctx.drawImage(fl, 0, 0);
  rdExpose(ctx, T);
  rdFinish(ctx, T, L.band);
  ctx.restore();
}
