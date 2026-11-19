/* charcoal-cross.js — 「kingdom」 5부 절정 1, the three crosses far on a hill, in Gothic charcoal (kit-charcoal.js = motion-skills
   kits/charcoal, vendored untouched; its frame skeleton: begin → camera → plate → tone → light → subject → fog → foreground →
   develop → colour). After 「Rebecca」 (OPUSCAR 13): velvet blacks, mist lifted out of the tone with the eraser.
   This file draws the END of that scene (Q14 → N25c, the light that comes down between the crosses and lands at the foot of
   the penitent thief's cross), so the veil scene's page turn has its front page. The rest of the cross scene (8:01–9:15) is
   not built here yet; charcoalCross(ctx, t) is valid from Q14 (561.6) onward.

   Restraint (crosses only far as silhouettes, no halo; figures only as faceless far backlit silhouettes — owner 2026-11-20 "이대로 가자" for block 3b): three small bare crosses on the crest,
   backlit by a pale band of mist, the darkness heavy above (Mk 15:33). The one colour: the middle cross's title board, a
   single red pastel point (「Schindler's List」's one red). The light: one thin eraser-lifted shaft from a gap in the cloud,
   on the axis of the left cross (the right hand of the middle one, Lk 23:33), reaching the ground at its foot on N25c.

   API (classic script, globals): buildCharcoalCross() once in init (after Charcoal.init is NOT required — it calls it);
   charcoalCross(ctx, t, B) — t = film seconds, B = line times from script.json ({ Q14, N25c, N25e, … }).
   Pure in t: every mark is seeded; the camera, fog and the shaft are functions of t only. */
(function () {
  const C = Charcoal, { clamp, lerp, ss, eo, eio, rng, noise } = Pilot;
  let W, H, SC, plate, crosses, fg, CR, BOARD;

  // ---- layout (portrait authored at 1080×1920, scaled by SC; landscape uses the same numbers around the centre) ----
  const lay = () => {
    const V = Pilot.ori === 'v', crest = V ? H * .47 : H * .56, cx = W / 2, gap = (V ? 150 : 210) * SC;
    // [x of the upright, height, crossbar half-width] — the middle one a little taller; all small (≈ 10 % of the frame)
    CR = [[cx - gap, 150 * SC, 34 * SC], [cx, 186 * SC, 40 * SC], [cx + gap, 146 * SC, 33 * SC]].map(([x, h, a], i) => ({ x, h, a, y: crest + [10, 0, 12][i] * SC }));
    return { V, crest };
  };
  let L;
  const ridgeY = x => L.crest + 20 * SC * Math.pow((x - W / 2) / (W * .5), 2) * 3 + (noise(x / W * 3, 4) - .5) * 26 * SC;
  const ridge = () => { const p = []; for (let i = 0; i <= 40; i++) { const x = lerp(-80, W + 80, i / 40); p.push([x, ridgeY(x)]); } return p; };

  function buildPlate() {   // sky, the pale mist band behind the hill, the hill — once, at 1.2× for the slow push
    const c = C.sheet(1.2), x = c.getContext('2d'), R = rng(41); let sd = 300;
    // the darkness above: heavy rubbed tone, long dragged strokes leaning a little (not level — level reads as video noise)
    x.fillStyle = `rgba(${C.TONE},.62)`; x.fillRect(0, 0, W, H);
    // (stick strokes kept faint: at full strength their tooth grain read as video noise — 「메시아」 round 5 lesson)
    for (let k = 0; k < 30; k++) { const y = R() * L.crest * .95, x0 = -120 + R() * W * .6; C.sweep(x, C.seg([x0, y], [x0 + (360 + R() * 700) * SC, y + (R() - .5) * 120 * SC], 8), (30 + R() * 50) * SC, .04 + R() * .06, sd++); }
    for (let k = 0; k < 9; k++) C.blob(x, R() * W, R() * L.crest * .8, (260 + R() * 260) * SC, (90 + R() * 80) * SC, .22, (R() - .5) * .3);   // rubbed cloud masses
    C.blob(x, W * .5, -80 * SC, 900 * SC, 520 * SC, .55);
    // the gap in the cloud (upper left of the middle cross) the light comes from: lifted with the soft eraser
    C.blob(x, CR[0].x + 40 * SC, H * .2, 170 * SC, 70 * SC, .55, -.2, C.smudgeW);
    C.blob(x, CR[0].x + 30 * SC, H * .2, 90 * SC, 32 * SC, .5, -.2, C.smudgeW);
    // the horizon band behind the crest: a long pale lift, so the crosses stand out dark (backlit)
    for (let k = 0; k < 5; k++) C.blob(x, W * (.15 + .18 * k), L.crest - (40 + 25 * Math.sin(k * 1.7)) * SC, 330 * SC, 95 * SC, .6, 0, C.smudgeW);
    C.blob(x, W * .5, L.crest - 60 * SC, 620 * SC, 120 * SC, .45, 0, C.smudgeW);
    // the hill: an unevenly rubbed mass, sweeps along its slope, the crest line in vine
    const hill = ridge(); C.smudgeFill(x, hill.concat([[W + 80, H], [-80, H]]), .7, sd++, 12);
    for (let k = 0; k < 10; k++) C.sweep(x, hill.map(p => [p[0], p[1] + (10 + k * 30) * SC]), (28 + k * 4) * SC, .25 + R() * .15, sd++);
    C.vine(x, hill, 2.6, .85, sd++);
    for (let k = 0; k < 14; k++) { const side = k % 2 ? 1 : -1; C.blob(x, W / 2 + side * (W * .52 + R() * 60), lerp(0, H, R()), 240 * SC, 400 * SC, .3); }
    return c;
  }
  function buildCrosses() {   // the three crosses on their own sheet (drawn after the light, so the shaft passes behind them)
    const c = C.sheet(1.2, null), x = c.getContext('2d'); let sd = 700;
    for (const k of CR) {
      const w = 7 * SC, bar = k.y - k.h * .74;
      C.tone(x, [[k.x - w, k.y + 6 * SC], [k.x - w * .8, k.y - k.h], [k.x + w * .8, k.y - k.h], [k.x + w, k.y + 6 * SC]], .95);
      C.tone(x, [[k.x - k.a, bar - w * .8], [k.x + k.a, bar - w * .7], [k.x + k.a, bar + w * .7], [k.x - k.a, bar + w * .8]], .95);
      C.sweep(x, [[k.x, k.y], [k.x, k.y - k.h]], w * 2.2, .8, sd++);
      C.vine(x, [[k.x - w, k.y], [k.x - w * .8, k.y - k.h]], 2, .8, sd++); C.vine(x, [[k.x + w, k.y], [k.x + w * .8, k.y - k.h]], 2, .8, sd++);
      C.blob(x, k.x, k.y + 6 * SC, 30 * SC, 8 * SC, .7);   // where the upright goes into the ground
    }
    // the title board on the middle cross: a small dark board (the red point is laid on it after develop)
    const m = CR[1]; BOARD = [m.x, m.y - m.h + 20 * SC];
    C.tone(x, [[m.x - 13 * SC, BOARD[1] - 9 * SC], [m.x + 13 * SC, BOARD[1] - 9 * SC], [m.x + 13 * SC, BOARD[1] + 8 * SC], [m.x - 13 * SC, BOARD[1] + 8 * SC]], .9);
    return c;
  }
  function buildFG() {   // the nearest ground, velvet black, parting a little faster on the push
    const c = C.sheet(1.15, null), x = c.getContext('2d'); let sd = 900;
    const y0 = H * (L.V ? .6 : .78), g = []; for (let i = 0; i <= 30; i++) { const xx = lerp(-80, W + 80, i / 30); g.push([xx, y0 + (noise(i * .3, 7) - .5) * 70 * SC + Math.pow((xx - W / 2) / W, 2) * -120 * SC]); }
    C.poly(x, g.concat([[W + 80, H + 80], [-80, H + 80]])); C.fillA(x, .9); C.sweep(x, g, 34 * SC, .7, sd++);
    const r = rng(93); for (let k = 0; k < 40; k++) { const i = (r() * 30) | 0, p = g[i], h = (24 + r() * 60) * SC; C.vine(x, [[p[0], p[1] + 8], [p[0] + (r() - .4) * 18, p[1] - h * .5], [p[0] + (r() - .3) * 28, p[1] - h]], 2, .6, sd++, k % 6 ? '#000' : '#fff', 0); }
    return c;
  }

  window.buildCharcoalCross = function () {
    if (!C.W) C.init({ tooth: 77, fog: 21 });
    W = Pilot.W; H = Pilot.H; SC = H / 1920; L = lay();
    plate = buildPlate(); crosses = buildCrosses(); fg = buildFG();
  };

  // the shaft: from the cloud gap down to the foot of the left cross — it starts after Q14's 0.8 s silence and lands on N25c
  const shaftK = (t, B) => eio(clamp((t - (B.Q14 + .8)) / Math.max(.5, B.N25c + .6 - (B.Q14 + .8))));
  // ---- (2026-11-20, block 3b — ADDITIVE ONLY: with no 4th argument every line below runs exactly as before, so the veil
  //      pilot renders identically.) The figures on the crosses: three far silhouettes, no detail (rules: no face, far,
  //      backlit, nothing like a crucifix close-up). Arms on the crossbar by a two-bone IK with fixed lengths, elbows below the
  //      shoulder–hand line; the penitent thief (left cross, the right hand of the middle one) bows his head: f.bow 0 → 1
  //      (forward bow of the head + a small sag of the shoulders, the hands stay on the bar). f.rim 0..1 = a thin eraser rim on
  //      his head and shoulder from the light above him (upper left). Called under the crosses' camera.
  const ik2 = (s, h, l1, l2, down) => {   // shoulder s, hand h → elbow, bent to the side `down` (+1: below the line, screen y)
    const dx = h[0] - s[0], dy = h[1] - s[1], d = Math.min(Math.hypot(dx, dy), (l1 + l2) * .9999), a = Math.atan2(dy, dx);
    const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), b = Math.acos(c), sgn = (dx >= 0 ? 1 : -1) * down;
    return [s[0] + Math.cos(a + sgn * b) * l1, s[1] + Math.sin(a + sgn * b) * l1];
  };
  // one figure's pose (frame px): shared by the drawing and by the body check (charcoalCross.pose)
  const figPose = (i, bow) => {
    const k = CR[i], bar = k.y - k.h * .74, u = SC, side = i === 0 ? 1 : i === 2 ? -1 : 0;   // side: which way is the middle cross
    const e = clamp(bow);   // (the caller eases it)
    // head: thieves look a little up/aside; the middle one a little down (alive, Lk 23:43 is still to come)
    const phi = i === 0 ? lerp(-.15, 1.5, e) : i === 1 ? .38 : -.12;            // forward bow (rad): 1.5 ≈ 86° (chin on the chest)
    const tilt = i === 0 ? lerp(.25, .75, e) : i === 1 ? -.08 : -.3;             // sideways tilt (rad), + toward screen right (toward the middle)
    const sag = i === 0 ? 3 * u * e : 0;
    // the arms spread along the bar (shoulders just under it), so the head stands above the bar against the sky — and the bow
    // reads from far away as the head going down behind the line of the bar
    const sh = [[k.x - 9.5 * u, bar + 2 * u + sag], [k.x + 9.5 * u, bar + 2 * u + sag]];
    const hd = [[k.x - (k.a - 5 * u), bar - 1 * u], [k.x + (k.a - 5 * u), bar - 1 * u]];
    const d0 = Math.hypot(hd[1][0] - sh[1][0] + 0, hd[1][1] - (bar + 2 * u)), L1 = d0 * .56, L2 = d0 * .53;   // fixed lengths (from the unsagged pose)
    const el = [ik2(sh[0], hd[0], L1, L2, 1), ik2(sh[1], hd[1], L1, L2, 1)];
    const neck = [k.x, bar - 1 * u + sag], nl = 11 * u;
    const head = [neck[0] + Math.sin(tilt) * nl * Math.cos(phi * .5), neck[1] - Math.cos(tilt) * nl * Math.cos(phi)];
    return { k, bar, sh, hd, el, neck, head, hr: 6.8 * u, phi, tilt, sag, L1, L2, side };
  };
  function drawFigures(x, f) {
    const u = SC, poses = [0, 1, 2].map(i => figPose(i, i === 0 ? f.bow || 0 : 0));
    // the bodies: one soft half-res layer (charcoal edge, not cut paper). Absolute values, rubbed (B = 255): the thieves a
    // smudged near-black just lighter than the velvet-black wood, so a head reads against the upright from far away; the middle
    // one as dark as his cross (restraint: a far backlit silhouette, never a lit body)
    C.layer(x, l => {
      for (let i = 0; i < 3; i++) {
        const p = poses[i], { k, bar } = p, kn = i === 2 ? -1 : 1, v = Math.round(255 * (1 - (i === 1 ? .9 : .8))), T = `rgb(${v},${v},255)`;
        l.fillStyle = T; l.strokeStyle = T; l.lineCap = 'round'; l.lineJoin = 'round';
        // torso and loincloth (a little narrower at the waist), legs bent at the knees to one side, feet together on the upright
        const sg = p.sag;
        C.poly(l, [[p.sh[0][0] - 1.2 * u, p.sh[0][1]], [p.sh[1][0] + 1.2 * u, p.sh[1][1]], [k.x + 6.6 * u, bar + 34 * u + sg * .5], [k.x + 8.4 * u, bar + 48 * u],
          [k.x - 8.4 * u, bar + 48 * u], [k.x - 6.6 * u, bar + 34 * u + sg * .5]]); l.fill();
        l.lineWidth = 5.6 * u; l.beginPath(); l.moveTo(k.x - 3.5 * u, bar + 45 * u); l.lineTo(k.x + kn * 5.5 * u, bar + 67 * u); l.lineTo(k.x - 1 * u, bar + 88 * u); l.stroke();
        l.lineWidth = 5.2 * u; l.beginPath(); l.moveTo(k.x + 3.5 * u, bar + 45 * u); l.lineTo(k.x + kn * 8 * u, bar + 66 * u); l.lineTo(k.x + 1.5 * u, bar + 88 * u); l.stroke();
        // arms: shoulder → elbow → hand on the bar
        for (let s = 0; s < 2; s++) { l.lineWidth = 4.6 * u; l.beginPath(); l.moveTo(p.sh[s][0], p.sh[s][1]); l.lineTo(p.el[s][0], p.el[s][1]); l.stroke();
          l.lineWidth = 3.8 * u; l.beginPath(); l.moveTo(p.el[s][0], p.el[s][1]); l.lineTo(p.hd[s][0], p.hd[s][1]); l.stroke(); }
        // neck and head (short hair: a plain round head, no long-hair line)
        l.lineWidth = 5 * u; l.beginPath(); l.moveTo(p.neck[0], p.neck[1] + 2 * u); l.lineTo(p.head[0], p.head[1]); l.stroke();
        l.beginPath(); l.ellipse(p.head[0], p.head[1], p.hr, p.hr * 1.08, p.tilt, 0, Math.PI * 2); l.fill();
      }
      l.lineCap = 'butt'; l.lineJoin = 'miter';
    }, { blur: .7 });
    const p = poses[0];
    if (f.rim > 0) {   // the light from the gap (upper left) catching the top of his head and his near shoulder
      const r = p.hr * 1.02, a0 = Math.PI * 1.05 + p.tilt, a1 = Math.PI * 1.62 + p.tilt, arc = [];
      for (let j = 0; j <= 8; j++) { const a = lerp(a0, a1, j / 8); arc.push([p.head[0] + Math.cos(a) * r, p.head[1] + Math.sin(a) * r * 1.08]); }
      C.vine(x, arc, 2 * u, .95 * f.rim, 4100, '#fff', 0);
      C.vine(x, [[p.sh[0][0] - 1 * u, p.sh[0][1] - .5 * u], [lerp(p.sh[0][0], p.el[0][0], .6), lerp(p.sh[0][1], p.el[0][1], .6) - 1.6 * u]], 1.4 * u, .6 * f.rim, 4101, '#fff', 0);
    }
  }
  // charcoalCross(ctx, t, B, o) — o (optional, block 3b): { cam, plateT, toothCam, sky(x,P), light(x,P), figures:{bow,rim},
  //   rim(x,P), mist(x,P), fgT, over(x,P), redPr, redFade, after(ctx,P) }. Without o: the original frame, unchanged.
  window.charcoalCross = function (ctx, t, B, o) {
    const x = C.begin(), foot = [CR[0].x, CR[0].y + 6 * SC], top = [CR[0].x + 30 * SC, H * .2];
    // locked off far away (restraint); only a very slow creep so the frame is never still (≈ 0.014/s)
    if (o && o.cam) C.setCam(o.cam); else
    C.setCam({ zm: 1.02 + .014 * (t - B.Q14), zc: [W / 2, L.crest - 60 * SC] });
    if (o && o.plateT) { x.setTransform(...o.plateT); C.drawSheet(x, plate); } else {
    C.applyCam(x); C.drawSheet(x, plate); }
    C.toneAll(x, .12);
    const P = o && { W, H, SC, L, CR, BOARD, ridgeY, top, foot };
    if (o && o.sky) o.sky(x, P);
    // the light: one thin shaft lifted out of the tone, its lower end travelling down to the foot of the cross
    const k = shaftK(t, B);
    if (k > 0) { C.applyCam(x); const end = [lerp(top[0], foot[0], k), lerp(top[1], foot[1], k)], wTop = 16 * SC, wEnd = lerp(18, 46, k) * SC;
      const breathe = .9 + .1 * Math.sin(t * 1.3);
      C.wedge(x, [[top[0] - wTop, top[1]], [top[0] + wTop, top[1]], [end[0] + wEnd, end[1]], [end[0] - wEnd, end[1]]], top, end, .62 * breathe * ss(0, .15, k), { reach: 1, falloff: [[0, .85], [.6, .55], [1, .75]], blur: 7 });
      const land = ss(.92, 1, k); if (land > 0) C.blob(x, foot[0], foot[1] + 4 * SC, 120 * SC, 22 * SC, .6 * land * breathe, 0, C.smudgeW); }
    if (o && o.light) o.light(x, P);
    C.applyCam(x); C.drawSheet(x, crosses);
    if (o && o.figures) { C.applyCam(x); drawFigures(x, o.figures); }
    if (o && o.rim) o.rim(x, P);
    C.applyCam(x);
    C.fog(x, t, [[L.crest + 70 * SC, .42, 16], [L.crest + 150 * SC, .34, -24], [L.crest - 120 * SC, .18, 10]]);
    if (o && o.mist) o.mist(x, P);
    if (o && o.fgT) { x.setTransform(...o.fgT); C.drawSheet(x, fg); } else {
    C.applyCam(x, 1.8, 1); C.drawSheet(x, fg); }
    if (o && o.over) o.over(x, P);
    if (o && o.toothCam) { const keep = C.cam; C.cam = o.toothCam; C.develop(ctx); C.cam = keep; } else
    C.develop(ctx);
    // the one colour, after develop: the title board's red point
    const b = C.toScr(BOARD), r = 9 * SC * C.cam.zm, R2 = rng(5);
    const rp = o && o.redPr != null ? o.redPr : 1, rf = o && o.redFade != null ? o.redFade : 1;
    if (rp > 0 && rf > 0)
    C.pastel(ctx, [{ pr: rp, pts: C.pastelPath([b[0] - r, b[1]], [b[0] + r, b[1] + 1], r * 1.3, r * 1.1, 6, R2, 1.5).map(q => ({ s: q.p, w: q.w, j1: q.j1, j2: q.j2 })) }], rf);
    if (o && o.after) o.after(ctx, P);
  };
  // (block 3b) read-only access for the scene that leads into this one (charcoal-calvary.js) and for the body check
  window.charcoalCross.parts = () => ({ W, H, SC, L, CR, BOARD, ridgeY, plate, crosses, fg });
  window.charcoalCross.pose = figPose;
  // (block 3b) the hand-off helper for the film page: the cross scene (charcoal-calvary.js) ends with the three far figures on
  // the crosses, the penitent thief's head bowed; the veil scene's first 4.65 s (before its page turn) keep them. In film.html:
  //   VT.draw(ctx, t, B, { prev: charcoalCross.prev(B) })      — instead of prev: (c, tt) => charcoalCross(c, tt, B)
  // Everything else in that frame is unchanged (sample-veil.html itself still passes no 4th argument → the pilot as approved).
  window.charcoalCross.tail = () => ({ figures: { bow: 1, rim: 0 } });
  window.charcoalCross.prev = B => (c, tt) => window.charcoalCross(c, tt, B, window.charcoalCross.tail());
})();
