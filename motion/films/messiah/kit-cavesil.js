/* kit-cavesil.js — 동굴 실루엣과 빛줄기 (cave silhouettes and light shafts) house style for word-log.  Global: window.Cavesil
   Worked example: sermons/2026-10-24-cross-styles/film/scenes/cs-cavesil.html. Card + pitfalls: styles/cavesil/STYLE.md.

   The look: a hand-painted 2D platformer cave. Pure black masses (the ceiling with hanging vines, the ledge's front slab,
   foreground boulders) frame flat blue planes sliding at their own depth (far wall with soft blue glows → pillars → back
   shelf → a lit cavern under the ledge); diagonal shafts of blue light with dust motes; pale leaves and glowing blue
   dot-flowers on the walking ledge. Figures are flat dark caped silhouettes with pale faces and hands, edged by a thin rim
   of light on the upper-right. Everything is cool blue — the ONE warm thing (Cavesil.ACCENT, pale gold) is the story's object.

   A frame:   const cm = { x, y, z, sx, sy };                      // camera: world point at screen centre, zoom, shake px
              Cavesil.backdrop(ctx, t, cm, lk);                     // bg + far / mid / near / cavern layers (lk = light 0..1)
              Cavesil.layer(ctx, cm, 1, () => {                     // the world plane (parallax 1)
                Cavesil.ground(ctx, t, cm, lk);  …your figures and objects…;  Cavesil.ceiling(ctx, t, cm); });
              Cavesil.fore(ctx, cm); Cavesil.dim(ctx, lk); Cavesil.endPlate(ctx, t, at);
              Cavesil.captions(ctx, t, lines, at); Cavesil.endCard(ctx, t, card, at);
   Units: world px (the ledge's walking lanes sit at y ≈ 1250–1300 on a 1080×1920 frame; x runs along the road).
   Load after lib.js (Pilot) and story.js (Story). Deterministic and seek-safe: seeded rng only, everything heavy is built
   once in init()/buildCave(); draw functions keep no state between frames. */
(function () {
  const { clamp, lerp, ss, eo, eio, rng } = Pilot;
  const K = {};
  const W = Pilot.W, H = Pilot.H, TAU = Math.PI * 2;   // (vendored for 메시아: frame size from Pilot, so landscape works too — the world stays in portrait units)

  // ------------------------------------------------------------------ palette & type
  const C = K.C = {
    black: '#010409', vine: '#06111d', wallA: '#0a2540', wallB: '#0c2a45', wallC: '#071a2c', blob: '#2d6aa4', blob2: '#4f8fc8',
    far: '#123a5e', far2: '#0f3150', col1: '#0d3352', col2: '#0a2843', shelf: '#092036', shelf2: '#0b2743',
    bandA: '#173f63', bandB: '#0c253d', bandC: '#081a2c', leaf: '#9fd2df', leafD: '#5fa3b8', dot: '#7fd8ff',
    me: '#0c1e33', pil: '#17324f', figL: '#2f5a80', face: '#d6a283', faceO: '#9c7c6a', hair: '#0a1a2c', hairL: '#7fb6d8',
    gold: '#f0c27a', gate: '#c98b4a', wood: '#e9b46a', woodL: '#ffe4ac', woodD: '#a9682e', xdark: '#2e5578', xrim: '#a9d2ef',
    steel: '#b4d4e6', steelD: '#6d93ae', handle: '#3a6286', light: '#fff1d2', light2: '#f6b766', ink: '#e4f3fb',
  };
  K.ACCENT = C.gold;                                   // the one warm colour (lit pale-gold wood, the gate's light)
  K.FONT = "'Noto Sans KR',sans-serif";
  K.FONTS = ["400 54px 'Noto Sans KR'", "700 72px 'Noto Sans KR'", "500 34px 'Noto Sans KR'", "400 28px 'Noto Sans KR'"];   // Pilot.run({fonts})
  /* layout of the ledge (world y): FY = front lane (the lead figure's feet), BY = back lane, RT = the ledge's far edge,
     LIP = where the walking surface ends and the black front face begins, SLAB = the slab's underside */
  K.Y = { FY: 1300, BY: 1252, RT: 1212, LIP: 1372, SLAB: 1505 };

  // ------------------------------------------------------------------ small helpers
  K.shade = (hex, k) => { const c = Pilot.hex(hex); return `rgb(${c[0] * k | 0},${c[1] * k | 0},${c[2] * k | 0})`; };   // a hex colour × k
  K.t12 = t => Math.floor(t * 12 + 1e-6) / 12;        // pose on twos (12 fps), like hand-keyed game animation
  K.frac = x => x - Math.floor(x);
  /* pathOf(pts, closed) — polyline Path2D */
  const pathOf = K.pathOf = (pts, closed = true) => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); if (closed) p.closePath(); return p; };
  /* blobPath(pts) — a smooth closed shape through points (quadratic midpoints): the style's soft blobby edge */
  const blobPath = K.blobPath = function (pts) {
    const g = new Path2D(), n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m = mid(pts[n - 1], pts[0]); g.moveTo(m[0], m[1]);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], mm = mid(p, q); g.quadraticCurveTo(p[0], p[1], mm[0], mm[1]); }
    g.closePath(); return g;
  };
  /* capsule(a, b, wa, wb, n) — points of a tapered limb from a (width wa) to b (width wb) with round ends */
  const capsule = K.capsule = function (a, b, wa, wb, n = 7) {
    const dx = b[0] - a[0], dy = b[1] - a[1], an = Math.atan2(dy, dx), pts = [];
    for (let i = 0; i <= n; i++) { const q = an + Math.PI / 2 + Math.PI * i / n; pts.push([a[0] + Math.cos(q) * wa / 2, a[1] + Math.sin(q) * wa / 2]); }
    for (let i = 0; i <= n; i++) { const q = an - Math.PI / 2 + Math.PI * i / n; pts.push([b[0] + Math.cos(q) * wb / 2, b[1] + Math.sin(q) * wb / 2]); }
    return pts;
  };
  /* leafShape(g, x, y, len, wid, a) — fill one pointed leaf from (x, y) at angle a (current fillStyle) */
  K.leafShape = function (g, x, y, len, wid, a) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0);
    g.quadraticCurveTo(len * .45, -wid, len, 0); g.quadraticCurveTo(len * .45, wid, 0, 0); g.fill(); g.restore(); };
  /* leafPath(x, y, len, wid, a) — the same leaf as a Path2D (for batching into a bag) */
  const leafPath = K.leafPath = function (x, y, len, wid, a) { const p = new Path2D(), c = Math.cos(a), s = Math.sin(a), T = (u, v) => [x + u * c - v * s, y + u * s + v * c];
    p.moveTo(x, y); p.quadraticCurveTo(...T(len * .45, -wid), ...T(len, 0)); p.quadraticCurveTo(...T(len * .45, wid), x, y); p.closePath(); return p; };
  /* sprite(N, stops) — an N×N radial-gradient sprite ([[offset, css colour], …]) */
  const sprite = K.sprite = function (N, stops) { const c = Pilot.canvas(N, N), g = c.getContext('2d'), gr = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2); for (const [o, col] of stops) gr.addColorStop(o, col); g.fillStyle = gr; g.fillRect(0, 0, N, N); return c; };
  /* bag() / add(bag, colour, path) / drawBag(ctx, bag) — batch many flat shapes per colour into one fill each */
  const bag = K.bag = () => ({}), add = K.add = (b, col, p) => { (b[col] = b[col] || new Path2D()).addPath(p); };
  const drawBag = K.drawBag = function (ctx, b) { for (const col in b) { ctx.fillStyle = col; ctx.fill(b[col]); } };
  const rr = K.rr = function (x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
  /* drip(x, y, l, w) — a hanging stalactite / drip from (x, y), length l, half-width w */
  const drip = K.drip = function (x, y, l, w) { const p = new Path2D(); p.moveTo(x - w, y); p.quadraticCurveTo(x - w * .3, y + l * .7, x, y + l); p.quadraticCurveTo(x + w * .3, y + l * .7, x + w, y); p.closePath(); return p; };
  /* lumpLine(x0, x1, y, amp, sc, seed, step) — a lumpy horizontal edge (fbm), as points */
  const lumpLine = K.lumpLine = function (x0, x1, y, amp, sc, seed, step = 18) { const o = []; for (let x = x0; x <= x1; x += step) o.push([x, y + amp * (Pilot.fbm(x / sc + seed, seed * .7, 3) - .5) * 2]); return o; };

  // ------------------------------------------------------------------ setup
  let GLOW = null, GLOWB = null, WARMG = null, MIST = null, SHADE = null, BGG = null, FORE = null, FOREL = null;
  /* init() — build the glow sprites, the background gradient and the foreground boulders (once, before buildCave) */
  K.init = function () {
    GLOW = sprite(64, [[0, 'rgba(127,216,255,.9)'], [.4, 'rgba(80,170,240,.3)'], [1, 'rgba(60,140,220,0)']]);            // a dot-flower's glow
    GLOWB = sprite(256, [[0, 'rgba(79,143,200,1)'], [.55, 'rgba(45,106,164,.85)'], [.85, 'rgba(45,106,164,.3)'], [1, 'rgba(45,106,164,0)']]);   // a big soft blue glow
    WARMG = sprite(256, [[0, 'rgba(255,240,200,1)'], [.12, 'rgba(255,196,110,.8)'], [.4, 'rgba(240,140,70,.22)'], [1, 'rgba(200,100,60,0)']]);   // the warm accent glow
    MIST = sprite(128, [[0, 'rgba(150,200,240,.5)'], [1, 'rgba(150,200,240,0)']]);
    SHADE = sprite(128, [[0, 'rgba(1,4,9,.85)'], [.6, 'rgba(1,4,9,.5)'], [1, 'rgba(1,4,9,0)']]);
    const g = Pilot.canvas(1, 1).getContext('2d'), bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#081d33'); bg.addColorStop(.3, C.wallA); bg.addColorStop(.6, C.wallB); bg.addColorStop(1, C.wallC); BGG = bg;
    buildFore();
    Object.assign(K, { GLOW, GLOWB, WARMG, MIST, SHADE });
  };

  // ------------------------------------------------------------------ the figure rig (jointed: 2-bone IK, poses on twos)
  /* ik(a, t, l1, l2, pick) — 2-bone IK from joint a toward target t with FIXED bone lengths l1, l2 (target clamped to reach);
     pick(j1, j2) chooses the middle joint. → [middle joint, end point] */
  const ik = K.ik = function (a, t, l1, l2, pick) {
    let dx = t[0] - a[0], dy = t[1] - a[1], d = Math.hypot(dx, dy) || 1e-6; const dd = clamp(d, Math.abs(l1 - l2) + .5, l1 + l2 - .5);
    const tx = a[0] + dx / d * dd, ty = a[1] + dy / d * dd, an = Math.atan2(ty - a[1], tx - a[0]), b = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1));
    const j1 = [a[0] + Math.cos(an + b) * l1, a[1] + Math.sin(an + b) * l1], j2 = [a[0] + Math.cos(an - b) * l1, a[1] + Math.sin(an - b) * l1];
    return [pick(j1, j2), [tx, ty]];
  };
  /* frame(F) — torso frame of a pose: P(a, b) = hip + forward·a + up·b (body units × F.s) */
  const frame = K.frame = function (F) {
    const up = [Math.sin(F.ang), -Math.cos(F.ang)], fw = [F.f * Math.cos(F.ang), F.f * Math.sin(F.ang)], s = F.s;
    return { up, fw, P: (a, b) => [F.hip[0] + fw[0] * a * s + up[0] * b * s, F.hip[1] + fw[1] * a * s + up[1] * b * s] };
  };
  const shoulderOf = K.shoulderOf = F => frame(F).P(4, 136);   // the near shoulder (world px)
  K.BODY = { HIPH: 178, LEG1: 96, LEG2: 90, ARM1: 78, ARM2: 74 };   // the traveller at s = 1: hip height, thigh, shin, upper arm, forearm
  /* the rim light colour at world x: cool blue, mixed toward warm where K.warmAt(x) > 0 (buildCave sets it from the gate;
     override K.warmAt = x => 0..1 for any warm source of your own) */
  const COOL = [150, 205, 255], WARMR = [255, 200, 135];
  K.warmAt = x => 0;
  const rimOf = K.rimOf = x => Pilot.mix(COOL, WARMR, K.warmAt(x));
  /* handShape(ctx, hd, an, type, f, s, col) — a hand AT point hd: 'fist' (closed, thumb bump, knuckle lines), 'flat'
     (pressing down), 'open' (fingers spread along the forearm angle an) */
  const handShape = K.handShape = function (ctx, hd, an, type, f, s, col) {
    let pts;
    if (type === 'flat') pts = [[-4, -7], [10, -8], [24, -5], [28, 0], [22, 4], [-2, 6], [-8, 2]].map(([u, v]) => [hd[0] + f * u * s, hd[1] + v * s - 4 * s]);
    else if (type === 'open') pts = [[-6, -8], [16, -9], [26, -4], [18, -2], [27, 2], [16, 5], [-2, 9], [-8, 2]].map(([u, v]) => [hd[0] + (Math.cos(an) * u - Math.sin(an) * v) * s, hd[1] + (Math.sin(an) * u + Math.cos(an) * v) * s]);
    else { pts = []; for (let i = 0; i < 10; i++) { const q = i / 10 * TAU; pts.push([hd[0] + Math.cos(q) * 11.5 * s, hd[1] + Math.sin(q) * 10 * s]); }
      pts.splice(7, 0, [hd[0] + Math.cos(an - 1.9) * 14 * s, hd[1] + Math.sin(an - 1.9) * 14 * s]); }   // a thumb bump
    ctx.fillStyle = col; ctx.fill(pathOf(pts));
    if (type === 'fist') { ctx.strokeStyle = 'rgba(20,45,70,.55)'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); for (let i = 0; i < 3; i++) { const q = an + .5 + i * .45; ctx.moveTo(hd[0] + Math.cos(q) * 4 * s, hd[1] + Math.sin(q) * 4 * s); ctx.lineTo(hd[0] + Math.cos(q) * 9.5 * s, hd[1] + Math.sin(q) * 9.5 * s); } ctx.stroke(); }
  };
  /* figure(ctx, F, mid, back, mid0) — a caped traveller: thin legs under a long bell cape, sleeves, pale hands, a round head.
     F (a pose from walk/stand/kneel/crouch/mix…): { s scale, f facing ±1, gy ground y, hip [x,y], ang torso lean, feet [[x,y]×2]
       (far, near), hands [far, near] grip points or null (= hanging), hand ['fist'|'flat'|'open' ×2], tilt head, eye
       'calm'|'strain'|'down'|'shock', sway cape trail, alpha, col cape colour (C.me / C.pil),
       me true = the lead figure (dark hair with a tail, warmer face, brighter rim) else a soft round hood,
       head 'hair'|'hood' (override), skin / hairCol (colours), sq horizontal squash (turns), toes [far, near] foot angle override,
       farFront the far arm drawn over everything (sawing), farOver far arm over the cape }.
     Layering hooks (objects the hands hold): back() before the body, mid0() over the cape (an object the far arm reaches
     around), mid() over the head and under the near arm (a held object). The near arm always ends on top, hand AT its grip. */
  K.figure = function (ctx, F, mid, back, mid0) {
    const s = F.s, f = F.f, me = !!F.me, col = F.col, far = K.shade(col, .72), { up, fw, P } = frame(F);
    const al = F.alpha ?? 1; if (al <= 0) return; ctx.save(); ctx.globalAlpha = al;
    if (F.sq != null && F.sq !== 1) { ctx.translate(F.hip[0], F.gy); ctx.scale(F.sq, 1); ctx.translate(-F.hip[0], -F.gy); }
    const rc = rimOf(F.hip[0]), rim = Pilot.rgb(rc, me ? .85 : .55), RX = 2.4 * s, RY = -2.4 * s, skin = F.skin || (me ? C.face : C.faceO);
    const part = (p, c) => { ctx.save(); ctx.translate(RX, RY); ctx.fillStyle = rim; ctx.fill(p); ctx.restore(); ctx.fillStyle = c; ctx.fill(p); };
    const sh = P(4, 136), shF = P(-3, 134);
    const elbowPick = (a, b) => (a[1] - f * a[0] * .35) > (b[1] - f * b[0] * .35) ? a : b, kneePick = (a, b) => f * a[0] > f * b[0] ? a : b;
    const arm = (S0, T, c, type) => {
      if (!T) T = [S0[0] - f * 8 * s, S0[1] + 140 * s];
      const [el, hd] = ik(S0, T, 78 * s, 74 * s, elbowPick);
      part(pathOf(capsule(S0, el, 22 * s, 17 * s)), c);
      part(pathOf(capsule(el, hd, 17 * s, 12 * s)), c);
      handShape(ctx, hd, Math.atan2(hd[1] - el[1], hd[0] - el[0]), type, f, s, skin);
    };
    const leg = (T, c, i) => {
      const hp = P(-2, -2), ank = [T[0], T[1] - 8 * s];
      const [kn, an] = ik(hp, ank, 96 * s, 90 * s, kneePick);
      part(pathOf(capsule(hp, kn, 19 * s, 14 * s)), c);
      part(pathOf(capsule(kn, an, 14 * s, 10 * s)), c);
      const lift = Math.max(0, F.gy - T[1]), toe = F.toes && F.toes[i] != null ? F.toes[i] : lift > 6 * s ? .35 : 0;
      const shoe = [[-9, -10], [8, -10], [26, -4], [30, 1], [-10, 1]].map(([u, v]) => { const cu = Math.cos(toe), su = Math.sin(toe); return [an[0] + f * (u * cu - v * su) * s, an[1] + 8 * s + (u * su + v * cu) * s]; });
      part(pathOf(shoe), c);
    };
    if (back) back();
    if (!F.farFront && !mid0 && !F.farOver) arm(shF, F.hands[0], far, F.hand?.[0] || 'fist');
    leg(F.feet[0], far, 0); leg(F.feet[1], K.shade(col, .88), 1);
    // the cape: one silhouette from the shoulders to a soft hem below the knees; the hem trails behind with the step
    const hemD = Math.max(40 * s, F.gy - F.hip[1] - 52 * s), sw = (F.sway || 0) * s;
    const skx = (a, b) => [F.hip[0] + f * a * s + sw * b / hemD, F.hip[1] + b];
    const capePts = [P(16, 152), P(27, 118), P(31, 62), P(29, 4), skx(36, hemD * .5), skx(46, hemD - 4), skx(30, hemD + 2), skx(10, hemD - 3), skx(-12, hemD + 3), skx(-34, hemD - 2),
      [F.hip[0] - f * 54 * s + sw * 1.6, F.hip[1] + hemD - 10 * s], skx(-44, hemD * .45), P(-38, 36), P(-35, 96), P(-28, 138), P(-12, 152)];
    part(blobPath(capePts), col);
    // the lit front fold, and a darker shoulder line under the collar
    ctx.fillStyle = Pilot.rgb(Pilot.mix([47, 90, 128], rc, .25), me ? .85 : .5);
    ctx.fill(blobPath([P(20, 146), P(29, 110), P(30, 56), P(28, 6), skx(35, hemD * .5), skx(43, hemD - 6), skx(36, hemD - 4), skx(29, hemD * .5), P(21, 8), P(22, 58), P(21, 110), P(14, 144)]));
    if (mid0) mid0();
    if (mid0 && !F.farFront) arm(shF, F.hands[0], far, F.hand?.[0] || 'fist');
    const nearUp = !!(F.hands[1] && F.hands[1][1] < sh[1] - 6 * s);   // a hand up on a carried beam: the arm goes behind the head, not across the face
    if (nearUp) arm(sh, F.hands[1], K.shade(col, me ? 1.6 : 1.3), F.hand?.[1] || 'fist');
    // head on a short neck
    const tilt = F.ang + (F.tilt || 0), hu = [Math.sin(tilt), -Math.cos(tilt)], hf = [f * Math.cos(tilt), f * Math.sin(tilt)], N = P(6, 146);
    const Hc = [N[0] + hu[0] * 30 * s + hf[0] * 4 * s, N[1] + hu[1] * 30 * s + hf[1] * 4 * s];
    part(pathOf(capsule(N, [N[0] + hu[0] * 22 * s, N[1] + hu[1] * 22 * s], 15 * s, 15 * s)), col);
    ctx.save(); ctx.transform(hf[0] * s, hf[1] * s, -hu[0] * s, -hu[1] * s, Hc[0], Hc[1]);   // head space: x forward, y down
    const rimL = (p, c) => { ctx.save(); ctx.translate(2.6 * f, -2.6); ctx.fillStyle = rim; ctx.fill(p); ctx.restore(); ctx.fillStyle = c; ctx.fill(p); };
    const hairC = F.hairCol || C.hair;
    if ((F.head || (me ? 'hair' : 'hood')) === 'hair') {
      const hair = new Path2D(); hair.arc(0, 0, 30, 0, TAU);
      hair.moveTo(-18, -15); hair.quadraticCurveTo(-46, -6, -43, 24); hair.quadraticCurveTo(-28, 12, -15, 18); hair.closePath();   // the hair tail
      rimL(hair, hairC);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(13, 4, 16.5, 21, .1, -Math.PI / 2, Math.PI / 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(29, 3, 4, 5, .2, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(200,110,90,.35)'; ctx.beginPath(); ctx.arc(17, 9, 4.5, 0, TAU); ctx.fill();
      ctx.fillStyle = hairC; ctx.beginPath(); ctx.moveTo(-4, -30); ctx.quadraticCurveTo(22, -30, 30, -8); ctx.quadraticCurveTo(14, -16, 2, -12); ctx.fill();   // fringe
      ctx.fillStyle = C.hairL; ctx.globalAlpha = al * .8; ctx.beginPath(); ctx.arc(-4, -17, 8, Math.PI, TAU); ctx.fill(); ctx.globalAlpha = al;   // hair shine
    } else {
      const hood = new Path2D(); hood.arc(-2, -1, 34, 0, TAU); hood.moveTo(-34, 4); hood.quadraticCurveTo(-42, 34, -30, 46); hood.lineTo(14, 44); hood.lineTo(20, 20); hood.closePath();
      rimL(hood, col);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(14, 6, 14, 19, .08, -Math.PI / 2, Math.PI / 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(28, 5, 3.5, 4.5, .2, 0, TAU); ctx.fill();
      ctx.strokeStyle = K.shade(col, 1.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-2, -1, 31, -1.25, 1.2); ctx.stroke();   // the hood's soft front edge
    }
    const eye = F.eye || 'calm', ec = '#0a1a2c'; ctx.fillStyle = ec; ctx.strokeStyle = ec; ctx.lineCap = 'round';
    if (eye === 'strain') { ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(13, -1); ctx.lineTo(19, 1); ctx.lineTo(25, -1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(12, -9); ctx.lineTo(24, -7); ctx.stroke(); }
    else if (eye === 'down') { ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(14, 2); ctx.quadraticCurveTo(19, 5, 24, 2); ctx.stroke(); }
    else if (eye === 'shock') { ctx.beginPath(); ctx.arc(19, -1, 3.6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(23, 13, 2.4, 3.2, 0, 0, TAU); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(19, 0, 2.7, 0, TAU); ctx.fill(); }
    if (eye !== 'shock') { ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(21, 13); ctx.quadraticCurveTo(24, eye === 'calm' ? 14.5 : 12, 27, 12.5); ctx.stroke(); }   // a small mouth
    ctx.restore();
    if (mid) mid();
    if (F.farOver && !F.farFront && !mid0) arm(shF, F.hands[0], far, F.hand?.[0] || 'fist');
    if (F.farFront) arm(shF, F.hands[0], far, F.hand?.[0] || 'fist');
    if (!nearUp) arm(sh, F.hands[1], K.shade(col, me ? 1.6 : 1.3), F.hand?.[1] || 'fist');
    ctx.restore();
  };

  // ------------------------------------------------------------------ poses (pure data: build, mix, then draw with figure())
  /* walk(x, gy, s, f, ph, stride, lean, lift) — a walking pose: hip at x, ground gy, scale s, facing f, step phase ph
     (cycles per stride; integrate x/stride for it), stride px, torso lean (rad), foot lift px. Hands hang (null). */
  K.walk = function (x, gy, s, f, ph, stride, lean, lift = 22) {
    const feet = [0, 1].map(i => { const p = K.frac(ph + i * .5); let off, up = 0;
      if (p < .58) off = stride * (.29 - p); else { const u = (p - .58) / .42; off = -.29 * stride + .58 * stride * eio(u); up = lift * Math.sin(Math.PI * u); }
      return [x + f * off * s, gy - up * s]; });
    const hipH = (176 - 5 * Math.abs(Math.sin(TAU * ph))) * s;
    return { s, f, gy, hip: [x, gy - hipH], ang: f * lean, feet, hands: [null, null], hand: ['fist', 'fist'], tilt: 0, eye: 'calm', sway: -f * 7 * Math.sin(TAU * ph), ph };
  };
  /* stand(x, gy, s, f, lean) — standing, feet apart, hands hanging */
  K.stand = function (x, gy, s, f, lean = .05) { return { s, f, gy, hip: [x, gy - 178 * s], ang: f * lean, feet: [[x - f * 18 * s, gy], [x + f * 22 * s, gy]], hands: [null, null], hand: ['fist', 'fist'], tilt: 0, eye: 'calm', sway: 0 }; };
  /* kneel(x, gy, s, f, lean) — down on the far knee (shin flat behind, toes tucked), near foot planted forward, knee up.
     Hip at x. Lean ~.25 upright (prayer, waiting); ~1.0 bent over the ground in front (planting, reaching down). */
  K.kneel = function (x, gy, s, f, lean = .25) { return { s, f, gy, hip: [x, gy - 96 * s], ang: f * lean, feet: [[x - f * 92 * s, gy - 18 * s], [x + f * 62 * s, gy]], toes: [2.3, null], hands: [null, null], hand: ['fist', 'fist'], tilt: .1, eye: 'calm', sway: 0 }; };
  /* crouch(x, gy, s, f, lean) — a deep squat, both feet down (the lay-it-down pose of the worked example) */
  K.crouch = function (x, gy, s, f, lean = 1.2) { return { s, f, gy, hip: [x - f * 14 * s, gy - 92 * s], ang: f * lean, feet: [[x - f * 52 * s, gy], [x + f * 22 * s, gy]], hands: [null, null], hand: ['fist', 'fist'], tilt: -.5, eye: 'calm', sway: 0 }; };
  /* hangHands(F, swing) — the two hanging-hand points for pose F (swing px fore/aft, ± for a walk) */
  const hangHands = K.hangHands = function (F, swing = 0) { const fr = frame(F), sh = fr.P(4, 136); return [[sh[0] - F.f * (10 + swing) * F.s, sh[1] + 140 * F.s], [sh[0] - F.f * (10 - swing) * F.s, sh[1] + 140 * F.s]]; };
  /* hangGrip(F, sw) — where a hand hangs holding a tool at the side (a saw, a lantern) */
  K.hangGrip = (F, sw = 0) => { const sh = shoulderOf(F); return [sh[0] + F.f * (16 + sw) * F.s, sh[1] + 128 * F.s]; };
  /* walkFree(x, gy, s, f, ph, stride, lean, lift) — a walk with both arms swinging (nothing carried) */
  K.walkFree = function (x, gy, s, f, ph, stride, lean, lift) { const F = K.walk(x, gy, s, f, ph, stride, lean, lift); F.hands = hangHands(F, 26 * Math.sin(TAU * ph)); return F; };
  /* mix(A, B, k) — in-between of two poses (k 0..1): positions blend, facing/hand types switch at .5. Use ≥ .3 s for
     stand↔kneel/crouch changes (pops read as broken bodies) and keep held objects on the hands through the blend. */
  K.mix = function (A, B, k) {
    if (k <= 0) return A; if (k >= 1) return B;
    const l2 = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], hA = hangHands(A), hB = hangHands(B);
    const pick = k < .5 ? A : B;
    return { ...pick, s: lerp(A.s, B.s, k), gy: lerp(A.gy, B.gy, k), hip: l2(A.hip, B.hip), ang: lerp(A.ang, B.ang, k), feet: [l2(A.feet[0], B.feet[0]), l2(A.feet[1], B.feet[1])],
      hands: [0, 1].map(i => l2(A.hands[i] || hA[i], B.hands[i] || hB[i])), hand: pick.hand.slice(), tilt: lerp(A.tilt || 0, B.tilt || 0, k), sway: lerp(A.sway || 0, B.sway || 0, k),
      ...(A.toes || B.toes ? { toes: [0, 1].map(i => (A.toes?.[i] ?? B.toes?.[i]) == null ? null : lerp(A.toes?.[i] ?? 0, B.toes?.[i] ?? 0, k)) } : {}) };
  };
  /* turn(A, B, k) — mix two poses facing opposite ways with a horizontal squash through the flip (a card turn) */
  K.turn = function (A, B, k) { const F = K.mix(A, B, k); if (k > 0 && k < 1) F.sq = Math.max(.3, Math.abs(Math.cos(Math.PI * k))); return F; };
  /* reach(F, i, p, type) — hand i (0 far, 1 near) to world point p (IK keeps bone lengths: aim within ~150·s of the shoulder) */
  K.reach = function (F, i, p, type) { F.hands = F.hands.slice(); F.hands[i] = p; if (type) { F.hand = (F.hand || ['fist', 'fist']).slice(); F.hand[i] = type; } return F; };
  /* lookAt(F, p, max) — tilt the head toward world point p (clamped ±max rad); lookUp(F, k) — chin up by k */
  K.lookAt = function (F, p, max = .7) { const fr = frame(F), N = fr.P(6, 176), dx = p[0] - N[0], dy = p[1] - N[1];
    const T = F.f > 0 ? Math.atan2(dy, dx) : Math.atan2(-dy, -dx); F.tilt = clamp(T - F.ang, -max, max); return F; };
  K.lookUp = function (F, k = 1) { F.tilt = (F.tilt || 0) * (1 - k) - .45 * k; return F; };
  K.handR = F => F.f > 0 ? 1 : 0; K.handL = F => F.f > 0 ? 0 : 1;   // index of the right / left hand for the facing

  // ------------------------------------------------------------------ long held objects (a beam, a cross, a staff, a plank)
  /* An object X = { x, y, a } is its foot origin and angle; points along it: pt(X, u, v) (u along, v across, px). */
  const cpt = K.pt = (X, u, v = 0) => [X.x + Math.cos(X.a) * u - Math.sin(X.a) * v, X.y + Math.sin(X.a) * u + Math.cos(X.a) * v];
  /* carry(F, a0, w, contact) — an object of width w resting ON the shoulder (behind the head), tilted a0 (−.16 flat … −.42
     steep, mirrored for f<0); the point `contact` px along it sits on the shoulder. Then grip(F, X, uFar, uNear). */
  K.carry = function (F, a0, w, contact) {
    const fr = frame(F), sh = fr.P(-10, 128), T = [sh[0] + fr.up[0] * 10 * F.s, sh[1] + fr.up[1] * 10 * F.s];
    const a = F.f > 0 ? a0 : Math.PI - a0, d = [Math.cos(a), Math.sin(a)]; let n = [d[1], -d[0]]; if (n[1] > 0) n = [-n[0], -n[1]];
    return { x: T[0] + n[0] * w / 2 - d[0] * contact, y: T[1] + n[1] * w / 2 - d[1] * contact, a, contact };
  };
  /* inFront(F, len, dx, dy) — an object held level in front at the waist, centred dx ahead of the hip (both hands on it) */
  K.inFront = function (F, len, dx = 40, dy = 6) { const a = F.f > 0 ? 0 : Math.PI, cx = F.hip[0] + F.f * dx * F.s, X = { x: cx - Math.cos(a) * len / 2, y: F.hip[1] + dy * F.s, a };
    F.hands = [cpt(X, len * .5 + 28), cpt(X, len * .5 - 28)]; F.hand = ['fist', 'fist']; return X; };
  /* upright(F, len, dx) — an object stood upright on the ground in front (a staff), near hand on it at chest height */
  K.upright = function (F, len, dx = 70) { const X = { x: F.hip[0] + F.f * dx * F.s, y: F.gy, a: -Math.PI / 2 };
    F.hands = [F.hands[0], cpt(X, 120 * F.s + (F.gy - F.hip[1]) * .3)]; F.hand = [F.hand[0], 'fist']; return X; };
  /* grip(F, X, uFar, uNear) — both hands closed on X at u px along it */
  K.grip = function (F, X, u0, u1) { F.hands = [cpt(X, u0), cpt(X, u1)]; F.hand = ['fist', 'fist']; return F; };
  K.mixX = (A, B, k) => k <= 0 ? A : k >= 1 ? B : { ...B, x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), a: lerp(A.a, B.a, k), u0: B.u0, lie: k > .62 ? B.lie : A.lie };
  K.rotAbout = function (X, pv, th) { const ox = X.x - pv[0], oy = X.y - pv[1]; return { ...X, x: pv[0] + ox * Math.cos(th) - oy * Math.sin(th), y: pv[1] + ox * Math.sin(th) + oy * Math.cos(th), a: X.a + th }; };
  /* beamSprite({len, w, bar, hb, lit, seed}) — a prebuilt sprite of a beam along +x (foot at x=0): lit = the warm accent wood
     (lighter top, darker underside, grain, a knot) else a dark silhouette beam with a blue rim. bar = {at, w} adds a crossbar
     of half-height hb (a cross). drawBeam(ctx, X, u0, u1, x, y, a, alpha, glow) draws the part [u0, u1] of it. */
  const KX = 2, CPAD = 14;
  K.beamSprite = function (o) {
    const L = o.len, PW = o.w, bar = o.bar, hb = bar ? o.hb : PW / 2, w = (L + 2 * CPAD) * KX, h = (2 * hb + 2 * CPAD) * KX, c = Pilot.canvas(w, h), g = c.getContext('2d');
    const CBX = bar ? bar.at : 0, CBW = bar ? bar.w : 0;
    g.setTransform(KX, 0, 0, KX, CPAD * KX, (hb + CPAD) * KX);
    const out = bar ? [[0, -PW / 2], [CBX - CBW / 2, -PW / 2], [CBX - CBW / 2, -hb], [CBX + CBW / 2, -hb], [CBX + CBW / 2, -PW / 2], [L, -PW / 2], [L, PW / 2],
      [CBX + CBW / 2, PW / 2], [CBX + CBW / 2, hb], [CBX - CBW / 2, hb], [CBX - CBW / 2, PW / 2], [0, PW / 2]] : [[0, -PW / 2], [L, -PW / 2], [L, PW / 2], [0, PW / 2]];
    const p = pathOf(out);
    if (o.lit) {   // pale-gold lit wood: lighter top face, darker underside, a few grain lines and a knot
      g.fillStyle = C.wood; g.fill(p); g.save(); g.clip(p);
      const pg = g.createLinearGradient(0, -PW / 2, 0, PW / 2); pg.addColorStop(0, C.woodL); pg.addColorStop(.35, C.wood); pg.addColorStop(1, C.woodD);
      g.fillStyle = pg; g.fillRect(0, -PW / 2, L, PW);
      if (bar) { const cg = g.createLinearGradient(CBX - CBW / 2, 0, CBX + CBW / 2, 0); cg.addColorStop(0, C.woodL); cg.addColorStop(.4, C.wood); cg.addColorStop(1, C.woodD);
        g.fillStyle = cg; g.fillRect(CBX - CBW / 2, -hb, CBW, hb - PW / 2); g.fillRect(CBX - CBW / 2, PW / 2, CBW, hb - PW / 2);
        g.fillStyle = C.wood; g.fillRect(CBX - CBW / 2, -PW / 2, CBW, PW); }
      const r = rng(o.seed ?? 11); g.strokeStyle = 'rgba(140,80,30,.35)'; g.lineWidth = 1.3;
      for (let k = 0; k < 4; k++) { const y0 = -PW / 2 + 6 + k * 7.5; g.beginPath(); g.moveTo(0, y0); for (let x = 0; x <= L; x += 20) g.lineTo(x, y0 + Math.sin(x / 47 + k * 2 + r() * .4) * 1.6); g.stroke(); }
      g.strokeStyle = 'rgba(140,80,30,.4)'; g.beginPath(); g.ellipse(170, 3, 9, 4, 0, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(170, 3, 3.5, 1.6, 0, 0, TAU); g.stroke();
      g.fillStyle = 'rgba(255,246,220,.55)'; g.fillRect(0, -PW / 2, L, 2.2); if (bar) g.fillRect(CBX + CBW / 2 - 2.2, -hb, 2.2, 2 * hb);
      g.restore();
    } else {       // dark silhouette wood, edged with blue light on top and right
      g.fillStyle = C.xdark; g.fill(p); g.save(); g.clip(p);
      g.fillStyle = C.xrim; g.globalAlpha = .75; g.fillRect(0, -PW / 2, L, 2.6); if (bar) { g.fillRect(CBX + CBW / 2 - 2.6, -hb, 2.6, 2 * hb); g.fillRect(CBX - CBW / 2, -hb, CBW, 2.6); }
      g.globalAlpha = .25; g.fillRect(0, -PW / 2 + 2.6, L, 5); g.restore();
    }
    return { c, hb, L };
  };
  K.drawBeam = function (ctx, X, u0, u1, x, y, a, alpha = 1, glow = 0) {
    if (u1 - u0 < .5 || alpha <= 0) return;
    const L = X.L;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = alpha;
    const hb = X.hb, dh = 2 * hb + 2 * CPAD, left = u0 <= .5 ? -CPAD : u0, right = u1 >= L - .5 ? L + CPAD : u1;
    if (glow > 0) { ctx.shadowColor = `rgba(255,190,100,${.75 * glow})`; ctx.shadowBlur = 26 * glow; }
    ctx.drawImage(X.c, (left + CPAD) * KX, 0, (right - left) * KX, dh * KX, left, -hb - CPAD, right - left, dh);
    ctx.restore();
  };

  // ------------------------------------------------------------------ the cave
  let E = null, G = 0, GX = null, GAY = 0, ROADX0 = -1600, ROADX1 = 0, FY = 1300, BY = 1252, RT = 1212, LIP = 1372, SLAB = 1505, CEIL = null;
  let STAL = [];
  const CAVE = K.CAVE = {}, VINES = [], SHAFTS = [], DOTS = [], MOTES = [];
  /* ceilY(x) — the ceiling's lower edge at world x (lumpy, with stalactites; drops by ceil.drop across [ceil.from, ceil.to]) */
  const ceilY = K.ceilY = x => { let y = CEIL.y - CEIL.drop * (CEIL.drop ? ss(CEIL.from, CEIL.to, x) : 0) + 100 * (Pilot.fbm(x / 470 + 3, 1.7, 3) - .5) * 2; for (const [sx, d, w] of STAL) y += d * Math.exp(-Math.pow((x - sx) / w, 2)); return y; };
  const inGap = K.inGap = (x, pad = 0) => E != null && x > E - pad && x < E + G + pad;
  const nearGate = (x, d) => GX != null && Math.abs(x - GX) < d;
  /* buildCave(o) — build the whole cave once (paths, sprites, motes). o:
       x0, x1     the road's extent (world x; the ledge, plants, dots, vines span it)
       gap        { x, w } a platform gap in the ledge (near lip x, width w) with lit blue mist below — or omit
       gate       { x } a round-arched opening in a black rock wall on the far side, warm light pouring out — or omit
                  (the rim light of figures warms toward it: K.warmAt)
       ceil       { y: 610, drop: 250, from, to } the ceiling height and where it comes down (default: toward the gap)
       shafts     [[footX, footW, dx, topW], …] diagonal light shafts (foot on the ledge at FY+40, top in the ceiling)
       spikesOK   x => bool — false where the black spiky plants must not stand (where figures kneel)
       FY BY RT LIP SLAB   ledge layout overrides (K.Y) */
  K.buildCave = function (o = {}) {
    ({ FY, BY, RT, LIP, SLAB } = Object.assign({}, K.Y, o));
    ROADX0 = o.x0 ?? -1600; ROADX1 = o.x1 ?? 3000;
    if (o.gap) { E = o.gap.x; G = o.gap.w; } else { E = null; G = 0; }
    if (o.gate) { GX = o.gate.x; GAY = BY + 4 - 300; } else GX = null;
    CEIL = Object.assign({ y: 610, drop: o.gap ? 250 : 0, from: o.gap ? E - 1100 : 0, to: o.gap ? E - 300 : 1 }, o.ceil || {});
    if (E != null && GX != null) K.warmAt = x => ss(E + G * .6, GX - 80, x);
    else if (GX != null) K.warmAt = x => ss(GX - 700, GX - 80, x);
    const spikesOK = o.spikesOK || (() => true);
    const r = rng(303);
    for (let x = -1500; x < ROADX1 + 600; x += 300 + r() * 320) STAL.push([x, 50 + r() * 120, 40 + r() * 46]);
    const cp = new Path2D(); cp.moveTo(-1800, -2800); for (let x = -1800; x <= ROADX1 + 900; x += 14) cp.lineTo(x, ceilY(x)); cp.lineTo(ROADX1 + 900, -2800); cp.closePath(); CAVE.ceil = cp;
    // far (parallax .15): soft blue glows, far pillars, a row of small stalactites, a far stair of ruined blocks
    CAVE.far = bag(); CAVE.farGlows = [[120, 700, 520], [1100, 620, 560], [-700, 760, 420]];
    for (const [x, w, top] of [[-560, 120, 520], [-190, 90, 700], [300, 150, 430], [700, 70, 780], [1050, 130, 470], [1400, 100, 640]]) add(CAVE.far, C.far, rr(x - w / 2, top, w, 1900, [w / 2, w / 2, 0, 0]));
    for (let x = -900; x < 1700; x += 70 + r() * 70) add(CAVE.far, C.far2, drip(x, 300, 60 + r() * 150, 16 + r() * 28));
    for (let i = 0; i < 5; i++) add(CAVE.far, '#143f63', rr(820 + i * 30, 1150 - i * 26, 160 - i * 30, 26, 0));
    { const p = new Path2D(), top = lumpLine(-1000, 1800, 1170, 26, 300, 4); p.moveTo(-1000, 2400); for (const q of top) p.lineTo(...q); p.lineTo(1800, 2400); p.closePath(); add(CAVE.far, '#0d2e4c', p); }
    // mid (parallax .42): blobby rock pillars, hanging root curtains, stiff dead saplings, the mid floor
    CAVE.mid = bag(); CAVE.midLines = new Path2D();
    for (let x = -700; x < 2300; x += 380 + r() * 260) { const w = 60 + r() * 50;
      add(CAVE.mid, C.col1, blobPath([[x - w * .6, -300], [x + w * .7, -300], [x + w * .5, 300 + r() * 100], [x + w * .65, 700], [x + w * .45, 1000], [x + w * .8, 1290], [x - w * .9, 1300], [x - w * .55, 1000], [x - w * .7, 640], [x - w * .45, 300]])); }
    for (let i = 0; i < 26; i++) { const x = -700 + r() * 3000, l = 120 + r() * 380; CAVE.midLines.moveTo(x, 200); CAVE.midLines.quadraticCurveTo(x + 6, 200 + l * .6, x + (r() - .5) * 10, 200 + l); }
    { const p = new Path2D(), top = lumpLine(-1000, 2600, 1215, 16, 200, 9); p.moveTo(-1000, 2600); for (const q of top) p.lineTo(...q); p.lineTo(2600, 2600); p.closePath(); add(CAVE.mid, C.col2, p); }
    CAVE.sapl = new Path2D(); const br = (x, y, h, d) => { if (d < 0) return; CAVE.sapl.moveTo(x, y); CAVE.sapl.lineTo(x, y - h); CAVE.sapl.rect(x - 5, y - h - 8, 10, 10); CAVE.sapl.moveTo(x, y - h);
      if (d > 0) { CAVE.sapl.moveTo(x - h * .45, y - h * .45); CAVE.sapl.lineTo(x + h * .45, y - h * .45); br(x - h * .45, y - h * .45, h * .55, d - 1); br(x + h * .45, y - h * .45, h * .55, d - 1); } };
    for (const x of [-300, 640, 1500, 2150]) br(x, 1225, 110 + r() * 40, 2);
    // near-back (parallax .7): the back shelf behind the ledge, dark plants on it, darker pillars
    CAVE.near = bag();
    for (let x = -800; x < 3400; x += 520 + r() * 420) { const w = 70 + r() * 60, top = ceilY(x / .7) - 120;
      add(CAVE.near, '#08203a', blobPath([[x - w * .5, -400], [x + w * .6, -400], [x + w * .5, 500], [x + w * .8, 900], [x + w * .6, 1180], [x - w * .8, 1190], [x - w * .55, 880], [x - w * .6, 500]])); }
    { const p = new Path2D(), top = lumpLine(-1200, 3600, 1178, 14, 160, 13, 14); p.moveTo(-1200, 2700); for (const q of top) p.lineTo(...q); p.lineTo(3600, 2700); p.closePath(); add(CAVE.near, C.shelf, p); }
    for (let x = -1100; x < 3500; x += 140 + r() * 240) for (let k = 0; k < 5; k++) add(CAVE.near, '#061527', leafPath(x + k * 7, 1182, 34 + r() * 40, 9, -Math.PI / 2 + (k - 2) * .32));
    // the ledge: the walking surface (lit blue, darker toward the front) and the thick black slab under it
    const lipEdge = (x, dir, seed) => { const q = rng(seed), o = []; for (let y = RT - 6; y <= 2700; y += 16) o.push([x + dir * (y < RT + 40 ? q() * 3 : (5 + q() * 14 + (y - RT) * .045)), y]); return o; };
    const DRIPS = [];
    const under = (x0, x1, sd) => { const o = []; for (let x = x0; x <= x1; x += 14) { let y = SLAB + 22 * (Pilot.fbm(x / 90 + sd, 2, 3) - .5) * 2; for (const [dx, d, w] of DRIPS) y += d * Math.exp(-Math.pow((x - dx) / w, 2)); o.push([x, y]); } return o; };
    const face = new Path2D(); CAVE.band = new Path2D(); CAVE.lipLines = new Path2D();
    if (E != null) {
      const LE = lipEdge(E, 1, 71), RE = lipEdge(E + G, -1, 73);
      const top0 = lumpLine(ROADX0, E, RT, 4, 60, 2, 12), top1 = lumpLine(E + G, ROADX1, RT, 4, 60, 2, 12);
      CAVE.band.addPath(pathOf([...top0, ...LE.filter(p => p[1] <= LIP + 20), [ROADX0, LIP + 20]])); CAVE.band.addPath(pathOf([...RE.filter(p => p[1] <= LIP + 20).reverse(), ...top1, [ROADX1, LIP + 20], [E + G, LIP + 20]]));
      const lt0 = lumpLine(ROADX0, E, LIP, 7, 50, 6, 10), lt1 = lumpLine(E + G, ROADX1, LIP, 7, 50, 6, 10);
      for (let x = ROADX0; x < ROADX1; x += 120 + r() * 220) if (!inGap(x, 30)) DRIPS.push([x, 30 + r() * 70, 10 + r() * 16]);
      face.addPath(pathOf([...lt0, ...LE.filter(p => p[1] > LIP && p[1] <= SLAB), ...under(ROADX0, E + 6, 1).reverse()]));
      face.addPath(pathOf([...RE.filter(p => p[1] > LIP && p[1] <= SLAB).reverse(), ...lt1, ...under(E + G - 6, ROADX1, 1).reverse()]));
      for (const ed of [LE, RE]) { const e2 = ed.filter(p => p[1] <= LIP + 4); CAVE.lipLines.moveTo(...e2[0]); for (const q of e2) CAVE.lipLines.lineTo(...q); }
      CAVE.lipLines.moveTo(...top0[0]); for (const q of top0) CAVE.lipLines.lineTo(...q); CAVE.lipLines.moveTo(...top1[0]); for (const q of top1) CAVE.lipLines.lineTo(...q);
    } else {
      const top = lumpLine(ROADX0, ROADX1, RT, 4, 60, 2, 12);
      CAVE.band.addPath(pathOf([...top, [ROADX1, LIP + 20], [ROADX0, LIP + 20]]));
      const lt = lumpLine(ROADX0, ROADX1, LIP, 7, 50, 6, 10);
      for (let x = ROADX0; x < ROADX1; x += 120 + r() * 220) DRIPS.push([x, 30 + r() * 70, 10 + r() * 16]);
      face.addPath(pathOf([...lt, ...under(ROADX0, ROADX1, 1).reverse()]));
      CAVE.lipLines.moveTo(...top[0]); for (const q of top) CAVE.lipLines.lineTo(...q);
    }
    CAVE.face = face;
    // the abyss walls inside the gap: two tones stepping inward as they go down
    CAVE.abyss = bag();
    if (E != null) for (const [col, inset, yTop] of [['#06182a', 14, RT + 50], ['#030d19', 40, RT + 170]]) {
      const lw = [], rw = []; for (let y = yTop; y <= SLAB + 30; y += 20) { lw.push([E + inset + r() * 18 + (y - yTop) * .08, y]); rw.push([E + G - inset - r() * 18 - (y - yTop) * .08, y]); }
      add(CAVE.abyss, col, blobPath([[E - 30, yTop - 30], ...lw, [E - 30, SLAB + 40]])); add(CAVE.abyss, col, blobPath([[E + G + 30, yTop - 30], ...rw, [E + G + 30, SLAB + 40]])); }
    // the gate: a plain round-arched opening in a black rock wall on the far side
    if (GX != null) {
      const wall = blobPath([[GX - 128, BY + 4], [GX - 150, 1000], [GX - 190, 760], [GX - 170, 560], [GX - 260, 200], [GX - 240, -2800], [ROADX1 + 900, -2800], [ROADX1 + 900, BY + 4]]);
      CAVE.gate = new Path2D(); CAVE.gate.addPath(wall); CAVE.gate.addPath(pathOf([[GX - 129, BY + 4], [GX - 133, BY - 240], [ROADX1 + 900, BY - 240], [ROADX1 + 900, BY + 4]]));
      CAVE.gateClip = new Path2D(); CAVE.gateClip.rect(GX - 600, -3000, ROADX1 + 2000 - GX, 5000); CAVE.gateClip.addPath(K.archPath(95));
    }
    // ground details on the ledge: pale leaves and black spiky plants on its far edge, a few stones
    CAVE.plants = bag();
    for (let x = ROADX0 + 100; x < ROADX1 - 100; x += 150 + r() * 260) { if (inGap(x, 80) || nearGate(x, 240)) continue;
      const y = RT + 6 + r() * 10;
      if (r() < .55) { add(CAVE.plants, C.leafD, leafPath(x, y, 70 + r() * 50, 18, -1.95)); add(CAVE.plants, C.leafD, leafPath(x + 2, y, 60 + r() * 30, 15, -1.2));
        add(CAVE.plants, C.leaf, leafPath(x + 2, y, 90 + r() * 60, 24, -1.55)); add(CAVE.plants, C.leaf, leafPath(x + 4, y, 60 + r() * 30, 17, -.8)); }
      else if (spikesOK(x)) for (let k = 0; k < 7; k++) add(CAVE.plants, C.black, leafPath(x + k * 8, y + 2, 34 + r() * 36, 10, -Math.PI / 2 + (k - 3) * .3)); }
    for (let x = ROADX0 + 50; x < ROADX1; x += 300 + r() * 400) { if (inGap(x, 60)) continue; add(CAVE.plants, '#0a2034', blobPath([[x - 26, LIP - 6], [x - 18, LIP - 26], [x + 8, LIP - 30], [x + 28, LIP - 12], [x + 30, LIP - 2]])); }
    for (let i = 0; i < 120; i++) { const x = ROADX0 + r() * (ROADX1 - ROADX0); if (inGap(x, 30)) continue; DOTS.push({ x, y: RT + 8 + r() * (LIP - RT - 20), r: 2 + r() * 2.6, p: [2, 3, 6][r() * 3 | 0], ph: r() * TAU }); }
    // vines from the ceiling: loops and strands (a few black, thicker, with leaves)
    for (let x = -1500; x < ROADX1 + 500; x += 40 + r() * 90) { const y0 = ceilY(x) - 10, k = r();
      if (k < .18) VINES.push({ kind: 'loop', x0: x, x1: x + 140 + r() * 200, y0, sag: 60 + r() * 160, ph: r() * 6, w: 3 });
      else VINES.push({ kind: 'hang', x, y0, len: 60 + r() * (r() < .25 ? 420 : 200), ph: r() * 6, w: k > .85 ? 5 : 2.4 + r() * 1.4, black: k > .85, leaves: r() < .45 }); }
    // shafts of light (world): foot on the ledge, top up in the ceiling
    for (const [fx, fw, dx, tw] of (o.shafts || [])) SHAFTS.push(shaftSprite({ fx, fw, tx: fx + dx, tw, ty: ceilY(fx + dx) - 60, fy: FY + 40 }));
    for (let i = 0; i < 40 * SHAFTS.length; i++) MOTES.push({ sh: i % SHAFTS.length, u: r(), v: r(), s: .012 + r() * .02, k: 1 + (r() * 2 | 0), ph: r() * TAU, f: 1 + r() * 3, r: 2 + r() * 3 });
    if (GX != null) CAVE.spill = spillSprite();
    // the deep cavern (parallax .82): a lit haze under the ledge, far columns, stalagmites from far below
    { const g0 = Pilot.canvas(1, 1).getContext('2d'), cg = g0.createLinearGradient(0, 1380, 0, 2700); cg.addColorStop(0, '#12406a'); cg.addColorStop(.3, '#0f3558'); cg.addColorStop(.7, '#0a2642'); cg.addColorStop(1, '#061626'); CAVE.cavG = cg; }
    CAVE.cav = bag(); CAVE.cavGlows = []; CAVE.cavMotes = [];
    for (let x = -1400; x < ROADX1 + 600; x += 380 + r() * 380) { const w = 40 + r() * 70; add(CAVE.cav, r() < .5 ? '#0e3152' : '#0b2a47', rr(x - w / 2, 1300, w, 1500, 0)); }
    for (let x = -1400; x < ROADX1 + 600; x += 90 + r() * 160) { const h = 90 + r() * 260, w = 20 + r() * 40, y0 = 2150 + r() * 260; const p = new Path2D(); p.moveTo(x - w, y0); p.quadraticCurveTo(x - w * .3, y0 - h * .7, x, y0 - h); p.quadraticCurveTo(x + w * .3, y0 - h * .7, x + w, y0); p.lineTo(x + w, 2800); p.lineTo(x - w, 2800); p.closePath(); add(CAVE.cav, '#071b2f', p); }
    for (let x = -1200; x < ROADX1 + 600; x += 600 + r() * 500) CAVE.cavGlows.push([x, 1760 + r() * 120, 300 + r() * 160]);
    for (let i = 0; i < 90; i++) CAVE.cavMotes.push({ x: -1400 + r() * (ROADX1 + 2000), y: 1650 + r() * 700, r: 2 + r() * 2.5, v: 8 + r() * 14, f: 1 + r() * 2, p: r() * TAU });
    Object.assign(K, { GX, GAY, ROADX0, ROADX1 });
  };
  function shaftSprite(sh) {
    const q = 4, x0 = Math.min(sh.fx - sh.fw / 2, sh.tx - sh.tw / 2) - 60, x1 = Math.max(sh.fx + sh.fw / 2, sh.tx + sh.tw / 2) + 60, y0 = sh.ty - 40, y1 = sh.fy + 50;
    const c = Pilot.canvas(Math.ceil((x1 - x0) / q), Math.ceil((y1 - y0) / q)), g = c.getContext('2d'); g.scale(1 / q, 1 / q); g.translate(-x0, -y0);
    const lg = g.createLinearGradient(sh.tx, sh.ty, sh.fx, sh.fy); lg.addColorStop(0, 'rgba(150,205,255,.55)'); lg.addColorStop(.6, 'rgba(120,185,245,.32)'); lg.addColorStop(1, 'rgba(120,185,245,.14)');
    g.fillStyle = lg; g.beginPath(); g.moveTo(sh.tx - sh.tw / 2, sh.ty); g.lineTo(sh.tx + sh.tw / 2, sh.ty); g.lineTo(sh.fx + sh.fw / 2, sh.fy); g.lineTo(sh.fx - sh.fw / 2, sh.fy); g.closePath(); g.fill();
    g.fillStyle = 'rgba(190,230,255,.22)'; g.beginPath(); g.moveTo(sh.tx - sh.tw * .1, sh.ty); g.lineTo(sh.tx + sh.tw * .2, sh.ty); g.lineTo(sh.fx - sh.fw * .05, sh.fy); g.lineTo(sh.fx - sh.fw * .3, sh.fy); g.closePath(); g.fill();
    const c2 = Pilot.canvas(c.width, c.height), g2 = c2.getContext('2d'); g2.filter = 'blur(6px)'; g2.drawImage(c, 0, 0);
    return { ...sh, c: c2, x0, y0, w: x1 - x0, h: y1 - y0 };
  }
  function spillSprite() {   // the warm light falling out of the gate across the ledge toward us
    const q = 4, x0 = GX - 420, y0 = GAY - 260, x1 = GX + 360, y1 = LIP + 40, c = Pilot.canvas((x1 - x0) / q, (y1 - y0) / q), g = c.getContext('2d'); g.scale(1 / q, 1 / q); g.translate(-x0, -y0);
    const rg = g.createRadialGradient(GX, BY - 120, 20, GX, BY - 120, 380); rg.addColorStop(0, 'rgba(255,214,150,.55)'); rg.addColorStop(.5, 'rgba(255,170,90,.18)'); rg.addColorStop(1, 'rgba(255,150,80,0)');
    g.fillStyle = rg; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const lg = g.createLinearGradient(0, BY, 0, LIP); lg.addColorStop(0, 'rgba(255,205,140,.5)'); lg.addColorStop(1, 'rgba(255,190,120,.08)');
    g.fillStyle = lg; g.beginPath(); g.moveTo(GX - 92, BY + 4); g.lineTo(GX + 92, BY + 4); g.lineTo(GX + 150, LIP); g.lineTo(GX - 330, LIP); g.closePath(); g.fill();
    const c2 = Pilot.canvas(c.width, c.height), g2 = c2.getContext('2d'); g2.filter = 'blur(5px)'; g2.drawImage(c, 0, 0);
    return { c: c2, x0, y0, w: x1 - x0, h: y1 - y0 };
  }
  /* archPath(r) — the gate's round-arched opening (radius r) as a Path2D */
  K.archPath = function (r) { const p = new Path2D(), gy = BY + 4; p.moveTo(GX - r, gy); p.lineTo(GX - r, GAY); p.arc(GX, GAY, r, Math.PI, TAU); p.lineTo(GX + r, gy); p.closePath(); return p; };

  // ------------------------------------------------------------------ live bits
  /* hitLight(t, at, depth) — the light multiplier for a hit at `at`: dips by depth in .06 s, comes back over ~1.7 s */
  K.hitLight = (t, at, depth = .6) => 1 - depth * ss(at, at + .06, t) * (1 - ss(at + .35, at + 1.7, t));
  function vinePath(v, t) {
    const sw = Math.sin(TAU * t / 3 + v.ph);
    if (v.kind === 'loop') { const mx = (v.x0 + v.x1) / 2 + sw * 10, my = v.y0 + v.sag + Math.cos(TAU * t / 3 + v.ph) * 4; return { a: [v.x0, v.y0], c: [mx, my + v.sag * .9], b: [v.x1, ceilY(v.x1) - 10] }; }
    return { a: [v.x, v.y0], c: [v.x + sw * v.len * .01, v.y0 + v.len * .55], b: [v.x + sw * v.len * .02, v.y0 + v.len] };
  }
  function drawVines(ctx, t, xa, xb) {
    ctx.lineCap = 'round';
    for (const v of VINES) { const vx = v.kind === 'loop' ? v.x0 : v.x; if (vx < xa - 400 || vx > xb + 50) continue;
      const p = vinePath(v, t), col = v.black ? C.black : C.vine; ctx.strokeStyle = col; ctx.lineWidth = v.w;
      ctx.beginPath(); ctx.moveTo(...p.a); ctx.quadraticCurveTo(...p.c, ...p.b); ctx.stroke();
      if (v.kind === 'hang') { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(p.b[0], p.b[1] + 4, v.w * 1.3, v.w * 2.2, 0, 0, TAU); ctx.fill();
        if (v.leaves) for (let k = 1; k < 6; k++) { const u = k / 6, x = (1 - u) * (1 - u) * p.a[0] + 2 * u * (1 - u) * p.c[0] + u * u * p.b[0], y = (1 - u) * (1 - u) * p.a[1] + 2 * u * (1 - u) * p.c[1] + u * u * p.b[1];
          K.leafShape(ctx, x, y, 14 + v.w * 2, 5 + v.w * .6, (k % 2 ? .5 : Math.PI - .5) + Math.sin(TAU * t / 3 + v.ph + k) * .15); } }
    }
  }
  function drawShafts(ctx, t, lk) {
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = lk;
    for (const s of SHAFTS) { ctx.drawImage(s.c, s.x0, s.y0, s.w, s.h);
      const pg = ctx.createRadialGradient(s.fx, s.fy - 30, 10, s.fx, s.fy - 30, s.fw * .75); pg.addColorStop(0, 'rgba(140,200,255,.22)'); pg.addColorStop(1, 'rgba(140,200,255,0)');
      ctx.fillStyle = pg; ctx.save(); ctx.translate(s.fx, s.fy - 30); ctx.scale(1, .28); ctx.translate(-s.fx, -(s.fy - 30)); ctx.fillRect(s.fx - s.fw, s.fy - 30 - s.fw, 2 * s.fw, 2 * s.fw); ctx.restore(); }
    ctx.globalCompositeOperation = 'lighter';
    for (const m of MOTES) { const s = SHAFTS[m.sh], u = ((m.u + t * m.s) % 1 + 1) % 1, v = m.v + Math.sin(TAU * t / 6 * m.k + m.ph) * .05;
      const x = lerp(lerp(s.tx - s.tw / 2, s.tx + s.tw / 2, v), lerp(s.fx - s.fw / 2, s.fx + s.fw / 2, v), u) + Math.sin(t * 1.3 + m.ph) * 6, y = lerp(s.ty + 40, s.fy - 20, u);
      const tw = .5 + .5 * Math.sin(t * m.f + m.ph), edge = Math.sin(Math.PI * u) * Math.sin(Math.PI * clamp(v * 1.1));
      ctx.globalAlpha = .9 * tw * edge * lk; ctx.fillStyle = '#cfeaff'; ctx.fillRect(x - m.r / 2, y - m.r / 2, m.r, m.r); }
    ctx.restore();
  }
  /* flecks(ctx, t, list) — little squares thrown up and landing (sawdust, chips, sparks):
     each { t0, x, y, vx, vy (px/s, up < 0), land (y where it stops), sz, col }; fade 1.0–1.6 s after t0 */
  K.flecks = function (ctx, t, list) {
    for (const q of list) {
      const u = t - q.t0; if (u < 0) continue; const al = 1 - ss(q.t0 + 1.0, q.t0 + 1.6, t); if (al <= 0) continue;
      const tl = (-q.vy + Math.sqrt(q.vy * q.vy + 4 * 700 * (q.land - q.y))) / 1400, uu = Math.min(u, Math.max(0, tl));
      const x = q.x + q.vx * uu, y = q.y + q.vy * uu + 700 * uu * uu, z = q.sz * .8;
      ctx.globalAlpha = al; ctx.fillStyle = q.col; ctx.fillRect(x - z / 2, y - z / 2, z, z);
    }
    ctx.globalAlpha = 1;
  };
  /* dust(ctx, t, at, x, y) — the hit: a half-ring of pale dust bursting from (x, y) over 1.1 s */
  K.dust = function (ctx, t, at, x, y) {
    if (t > at && t < at + 1.2) { const u = clamp((t - at) / 1.1); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#cfe8ff';
      for (let k = 0; k < 22; k++) { const a = Math.PI + (k / 21) * Math.PI, R = 14 + eo(u) * (70 + (k % 3) * 30);
        ctx.globalAlpha = .8 * (1 - u); ctx.fillRect(x + Math.cos(a) * R * 1.5 - 2, y + Math.sin(a) * R * .55 - u * 16 - 2, 4, 4); } ctx.restore(); }
  };
  /* glow(ctx, x, y, R, a) — the warm accent glow (additive) of radius R; blueGlow — the cool one */
  K.glow = function (ctx, x, y, R, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.drawImage(WARMG, x - R, y - R, 2 * R, 2 * R); ctx.restore(); };
  K.blueGlow = function (ctx, x, y, R, a) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a; ctx.drawImage(GLOWB, x - R, y - R, 2 * R, 2 * R); ctx.restore(); };
  /* sprout(ctx, t, x, y, grow, o) — a glowing seed-pod plant (the style's one warm living thing): grow 0..1 rises a stem
     with pale leaves from (x, y = ground), the pod at the tip glows warm. o: { h height px (220), glow 0..1, sway } */
  K.sprout = function (ctx, t, x, y, grow, o = {}) {
    if (grow <= 0) return;
    const h = (o.h || 220) * eo(grow), sw = (o.sway ?? 1) * Math.sin(t * 1.3) * 6 * grow, gl = o.glow ?? grow;
    const tip = [x + sw, y - h], c1 = [x - 10, y - h * .45];
    if (gl > 0) K.glow(ctx, tip[0], tip[1] - 10, 160 + 120 * gl, .6 * gl);
    ctx.save(); ctx.strokeStyle = '#06111d'; ctx.lineCap = 'round'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]); ctx.stroke();
    ctx.strokeStyle = 'rgba(150,205,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 3, y - 4); ctx.quadraticCurveTo(c1[0] + 3, c1[1], tip[0] + 3, tip[1]); ctx.stroke();
    const leaves = [[.22, -1, 112], [.4, 1, 132], [.58, -1, 104], [.74, 1, 82], [.86, -1, 58]];
    for (const [u, side, len] of leaves) { const k = clamp((grow - u * .7) / .3); if (k <= 0) continue;
      const px = (1 - u) * (1 - u) * x + 2 * u * (1 - u) * c1[0] + u * u * tip[0], py = (1 - u) * (1 - u) * y + 2 * u * (1 - u) * c1[1] + u * u * tip[1];
      const an = side > 0 ? -.55 + .05 * Math.sin(t * 1.7 + u * 9) : Math.PI + .55 + .05 * Math.sin(t * 1.5 + u * 7);
      ctx.fillStyle = C.leafD; K.leafShape(ctx, px, py, len * k, 26 * k, an + .12); ctx.fillStyle = u > .55 && gl > .3 ? '#e9e2c4' : C.leaf; K.leafShape(ctx, px, py, len * .82 * k, 19 * k, an); }
    const pr = 22 * clamp((grow - .35) / .4); if (pr > 0) {
      ctx.fillStyle = C.woodD; ctx.beginPath(); ctx.ellipse(tip[0], tip[1] - pr * .6, pr * .95, pr * 1.3, sw * .02, 0, TAU); ctx.fill();
      const pg = ctx.createRadialGradient(tip[0] - pr * .3, tip[1] - pr, 1, tip[0], tip[1] - pr * .6, pr * 1.4); pg.addColorStop(0, C.light); pg.addColorStop(.45, C.gold); pg.addColorStop(1, C.gate);
      ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(tip[0], tip[1] - pr * .7, pr * .8, pr * 1.15, sw * .02, 0, TAU); ctx.fill(); }
    ctx.restore();
  };

  // ------------------------------------------------------------------ the frame's layers
  /* layer(ctx, cm, p, fn) — draw fn in world coordinates at parallax p (1 = the world plane, <1 farther, >1 nearer).
     cm = { x, y, z, sx, sy }: the world point at the screen centre, zoom, and shake (screen px). */
  const layer = K.layer = function (ctx, cm, p, fn) { const z = 1 + (cm.z - 1) * p, cx = cm.x * p, cy = 960 + (cm.y - 960) * p; ctx.save(); ctx.setTransform(z, 0, 0, z, W / 2 - cx * z + cm.sx * p, H / 2 - cy * z + cm.sy * p); fn(); ctx.restore(); };
  K.cam = (x, y = 1050, z = 1.03) => ({ x, y, z, sx: 0, sy: 0 });
  K.mixCam = (a, b, k) => k <= 0 ? a : k >= 1 ? b : { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) };
  /* shake(c, t, at) — sets c.sx/c.sy: the hit's camera shake (15/11 px, decaying over .55 s from `at`) */
  K.shake = function (c, t, at) { const k = 1 - ss(at, at + .55, t); c.sx = t >= at ? 15 * k * Math.sin(t * 97) : 0; c.sy = t >= at ? 11 * k * Math.sin(t * 131 + 1) : 0; return c; };
  function drawFar(ctx, t) {
    for (const [x, y, R] of CAVE.farGlows) ctx.drawImage(GLOWB, x - R, y - R * .92, 2 * R, 1.84 * R);
    drawBag(ctx, CAVE.far);
  }
  function drawCavern(ctx, t, lk) {   // the deep cavern seen under the ledge: blue haze, far columns, glows, slow motes
    ctx.fillStyle = CAVE.cavG; ctx.fillRect(-1600, 1340, ROADX1 + 2400, 1700);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .55 * lk; for (const [x, y, R] of CAVE.cavGlows) ctx.drawImage(GLOWB, x - R, y - R * .6, 2 * R, 1.2 * R); ctx.restore();
    drawBag(ctx, CAVE.cav);
    ctx.save(); ctx.globalAlpha = .3 * lk; for (let k = 0; k < 6; k++) { const mx = -400 + k * 700 + 60 * Math.sin(t * .3 + k), my = 1720 + 40 * Math.sin(k * 2.1); ctx.drawImage(MIST, mx - 380, my - 60, 760, 120); } ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#9fdcff';
    for (const m of CAVE.cavMotes) { const y = m.y - ((t * m.v) % 300), a = .5 + .5 * Math.sin(t * m.f + m.p); ctx.globalAlpha = a * .6 * lk; ctx.fillRect(m.x + 10 * Math.sin(t * .7 + m.p), y, m.r, m.r); } ctx.restore();
  }
  function drawMid(ctx, t) {
    drawBag(ctx, CAVE.mid);
    ctx.strokeStyle = C.col2; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke(CAVE.midLines);
    ctx.strokeStyle = '#0a2238'; ctx.fillStyle = '#0a2238'; ctx.stroke(CAVE.sapl); ctx.fill(CAVE.sapl);
  }
  /* backdrop(ctx, t, cm, lk) — the background gradient and the four parallax layers behind the world plane */
  K.backdrop = function (ctx, t, cm, lk) {
    ctx.fillStyle = BGG; ctx.fillRect(0, 0, W, H);
    layer(ctx, cm, .15, () => drawFar(ctx, t));
    layer(ctx, cm, .42, () => drawMid(ctx, t));
    layer(ctx, cm, .7, () => drawBag(ctx, CAVE.near));
    layer(ctx, cm, .82, () => drawCavern(ctx, t, lk));
  };
  /* ground(ctx, t, cm, lk, inGate) — the world plane's ground (call inside layer(…, 1, …)): the gap's misty abyss, the ledge
     and its black slab, the gate (inGate() draws whoever is walking into its light, between the light and the wall), the
     light shafts and motes, plants and glowing dot-flowers. Draw your figures after it, then ceiling(). */
  K.ground = function (ctx, t, cm, lk, inGate) {
    const xa = cm.x - W / 2 / cm.z - 60, xb = cm.x + W / 2 / cm.z + 60;
    if (E != null) {   // the abyss in the gap: blue mist above, falling away into the dark
      const ag = ctx.createLinearGradient(0, RT, 0, SLAB + 20); ag.addColorStop(0, '#0b2540'); ag.addColorStop(.3, '#07192d'); ag.addColorStop(.75, '#030c18'); ag.addColorStop(1, '#0a2846');
      ctx.fillStyle = ag; ctx.fillRect(E - 40, RT + 3, G + 80, SLAB - RT + 20);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .35 * lk;
      for (let k = 0; k < 2; k++) { const mx = E + G * (.3 + .4 * k) + 30 * Math.sin(t * .4 + k * 2), my = RT + 150 + k * 80; ctx.drawImage(MIST, mx - 220, my - 70, 440, 140); }
      ctx.restore();
      drawBag(ctx, CAVE.abyss);
    }
    const bg = ctx.createLinearGradient(0, RT, 0, LIP + 10); bg.addColorStop(0, C.bandA); bg.addColorStop(.45, C.bandB); bg.addColorStop(1, C.bandC);
    ctx.fillStyle = bg; ctx.fill(CAVE.band);
    ctx.fillStyle = C.black; ctx.fill(CAVE.face, 'evenodd');
    ctx.strokeStyle = 'rgba(150,205,255,.55)'; ctx.lineWidth = 2.5; ctx.stroke(CAVE.lipLines);
    if (GX != null && GX - 400 < xb) {
      const ga = ctx.createRadialGradient(GX, BY - 120, 10, GX, BY - 120, 300); ga.addColorStop(0, C.light); ga.addColorStop(.55, C.light2); ga.addColorStop(1, '#c4743a');
      ctx.fillStyle = ga; ctx.fill(K.archPath(97));
      if (inGate) inGate();
      ctx.save(); ctx.clip(CAVE.gateClip, 'evenodd'); ctx.fillStyle = C.black; ctx.fill(CAVE.gate); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.drawImage(CAVE.spill.c, CAVE.spill.x0, CAVE.spill.y0, CAVE.spill.w, CAVE.spill.h);
      ctx.globalAlpha = .9; ctx.drawImage(WARMG, GX - 330, BY - 450, 660, 660); ctx.restore();
    }
    drawShafts(ctx, t, lk);
    drawBag(ctx, CAVE.plants);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';   // glowing dot-flowers on the ledge
    for (const d of DOTS) { if (d.x < xa || d.x > xb) continue; const a = (.55 + .45 * Math.sin(TAU * t / d.p + d.ph)) * (.4 + .6 * lk);
      ctx.globalAlpha = a * .5; ctx.drawImage(GLOW, d.x - d.r * 4, d.y - d.r * 4, d.r * 8, d.r * 8); ctx.globalAlpha = a; ctx.fillStyle = C.dot; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill(); }
    ctx.restore();
  };
  /* ceiling(ctx, t, cm) — the black ceiling mass and its swaying vines (last thing on the world plane) */
  K.ceiling = function (ctx, t, cm) {
    const xa = cm.x - W / 2 / cm.z - 60, xb = cm.x + W / 2 / cm.z + 60;
    ctx.fillStyle = C.black; ctx.fill(CAVE.ceil);
    drawVines(ctx, t, xa, xb);
  };
  /* fore(ctx, cm) — black boulders and big leaf silhouettes at the very bottom (screen space, faster parallax 1.25) */
  K.fore = function (ctx, cm) {
    const off = ((cm.x * 1.25) % 2400 + 2400) % 2400;
    ctx.save(); ctx.translate(-off + cm.sx * 1.3, cm.sy * 1.3); ctx.fillStyle = C.black;
    for (const k of [0, 2400]) { ctx.save(); ctx.translate(k, 0); ctx.fill(FORE); ctx.fillStyle = C.leafD; ctx.fill(FOREL[0]); ctx.fillStyle = C.leaf; ctx.fill(FOREL[1]); ctx.fillStyle = C.black; ctx.restore(); }
    ctx.restore();
  };
  function buildFore() {
    const p = new Path2D(), r = rng(77);
    p.addPath(blobPath([[-80, 1780], [300, 1700], [520, 1760], [600, 1990], [-80, 2000]]));
    p.addPath(blobPath([[1150, 2000], [1180, 1800], [1400, 1740], [1640, 1790], [1700, 2000]]));
    p.addPath(blobPath([[1900, 2000], [2000, 1840], [2200, 1820], [2420, 1860], [2500, 2000]]));
    const stem = (x, h, a, lw) => { p.addPath(pathOf(capsule([x, 1990], [x + 30, 1960 - h], 18, 10))); p.addPath(leafPath(x + 30, 1960 - h, lw, lw * .33, a)); };
    stem(820, 240, -2.5, 230); stem(980, 170, -.55, 150); stem(1800, 210, -2.3, 200);
    FORE = p; FOREL = [new Path2D(), new Path2D()];
    for (const [x, y, n] of [[260, 1720, 5], [1500, 1760, 4], [2150, 1840, 5]]) for (let k = 0; k < n; k++) FOREL[k % 2].addPath(leafPath(x + k * 10, y, 90 + r() * 70, 22, -Math.PI / 2 + (k - n / 2) * .38));
  }
  /* dim(ctx, lk) — darken the whole frame when the light is down (lk < 1) */
  K.dim = function (ctx, lk) { const dim = 1 - lk; if (dim > 0) { ctx.fillStyle = `rgba(1,4,9,${.55 * dim})`; ctx.fillRect(0, 0, W, H); } };

  // ------------------------------------------------------------------ words
  /* captionShade(ctx, t, lines) — a soft dark of cave behind the words (no box) */
  K.captionShade = function (ctx, t, lines) {
    let a = 0, three = false; for (const [s0, s1, s, src] of lines) { const w = Pilot.win(t, s0, s1, .35, .45); if (w > a) { a = w; three = !!src; } }
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a * .75; ctx.translate(540, three ? 500 : 440); ctx.scale(1, three ? .42 : .3); ctx.drawImage(SHADE, -560, -560, 1120, 1120); ctx.restore();
  };
  /* captions(ctx, t, lines, end, o) — the film's lines (y 440, pale on the dark ceiling) until the end card at `end` */
  K.captions = function (ctx, t, lines, end, o = {}) {
    if (t >= end) return;
    K.captionShade(ctx, t, lines);
    Story.captions(ctx, t, lines, Object.assign({ font: K.FONT, weight: 400, color: C.ink, srcColor: '#a9cbe0', y: 440, shadow: 'rgba(0,8,20,.9)', shadowBlur: 16 }, o));
  };
  /* endPlate(ctx, t, at) — the cave closes: a lumpy black mass comes down over the picture, then blue glow + rising motes */
  K.endPlate = function (ctx, t, at) {
    const k = eo((t - (at - .2)) / .5); if (k <= 0) return;
    const yb = lerp(-120, H + 160, k), p = new Path2D(); p.moveTo(-20, -20); p.lineTo(W + 20, -20);
    for (let x = W + 20; x >= -20; x -= 20) p.lineTo(x, yb + 70 * (Pilot.fbm(x / 160 + 5, 2, 3) - .5) * 2 + 40 * Math.sin(x / 90));
    p.closePath(); ctx.fillStyle = C.black; ctx.fill(p);
    const a = ss(at + .1, at + .6, t); if (a <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .55 * a; ctx.drawImage(GLOWB, 540 - 520, 980 - 360, 1040, 720); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) { const ph = K.frac(t * .05 + i * .37), x = 160 + ((i * 263) % 760) + 20 * Math.sin(t * .8 + i), y = 1380 - ph * 900;
      ctx.globalAlpha = a * .7 * Math.sin(Math.PI * ph); ctx.fillStyle = '#cfeaff'; ctx.fillRect(x - 2, y - 2, 4, 4); }
    ctx.restore();
  };
  /* endCard(ctx, t, card, at, o) — Story.endCard in the style's type and colours (y 880) */
  K.endCard = (ctx, t, card, at, o = {}) => Story.endCard(ctx, t, card, at, Object.assign({ font: K.FONT, color: C.ink, srcColor: '#a9cbe0', y: 880, titleShadow: 'rgba(0,0,0,.5)' }, o));

  window.Cavesil = K;
})();
