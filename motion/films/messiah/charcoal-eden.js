/* charcoal-eden.js — 「메시아」 2부 첫 장면, 에덴을 고딕 목탄으로 (2026-11-03 2차; kit-charcoal.js = motion-skills kits/charcoal,
   vendored; its template's frame skeleton). The great tree in the middle of the garden at dusk; "죄가 세상에 들어온 날": the dark
   crawls in from both sides like smoke and the light goes out of the garden; at "여자의 후손" (Gen 3:15, the gold word) the dark
   flinches and withdraws, one point of light is lifted out of the ground at the tree's foot, and later it rises as the warm thread
   of the promise and leaves the frame toward Abraham (33.5 s, 3.5 s — the E1a pen sound). 21.0–37.2 s. No red: the one colour
   here is the warm thread (the film's motif). */
(function () {
  const C = Charcoal, { clamp, lerp, ss, eo, eio, rng, noise } = Pilot;
  let W, H, SC, TX, TY, ZC, HILL, plate, subj, fg, TREE, TRUNK, PT, THREAD;
  const B = { in: 21.0, light: 21.2, grow: 22.0, dark: 25.2, turn: 26.8, recoil: 27.05, calm: 30.5, rise: 33.5, out: 37.2 };
  const offset = (pts, d) => pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, k = typeof d === 'function' ? d(i) : d; return [p[0] + Math.cos(an) * k, p[1] + Math.sin(an) * k]; });
  const halfW = (b, i) => b.w * .5 * (lerp(1.12, .62, i / (b.pts.length - 1)) + (b.d ? 0 : .7 * Math.exp(-i * 1.6)));
  const ridgeY = (x, y0, y1, amp, f, seed, crest = 0) => { const k = (x + 60) / (W + 120); return lerp(y0, y1, k) + (noise(k * f, seed) - .5) * amp - crest * Math.exp(-Math.pow((x - TX) / (W * .32), 2)); };
  const ridge = (y0, y1, amp, f, seed, crest = 0) => { const pts = []; for (let i = 0; i <= 40; i++) { const x = lerp(-60, W + 60, i / 40); pts.push([x, ridgeY(x, y0, y1, amp, f, seed, crest)]); } return pts; };
  // the great tree: wide and old (the tree in the middle of the garden), seeded
  function growTree() {
    const r = rng(19), out = [];
    const grow = (x, y, ang, len, w, d) => { const pts = [[x, y]], n = 6; let a = ang;
      for (let i = 1; i <= n; i++) { a += (r() - .5) * .3; pts.push([pts[i - 1][0] + Math.cos(a) * len / n, pts[i - 1][1] + Math.sin(a) * len / n]); }
      out.push({ pts, w, d }); if (d >= 6) return;
      const kids = d < 1 ? 3 : 2 + (r() < .5 ? 1 : 0);
      for (let k = 0; k < kids; k++) { const i = Math.min(n, Math.round((.45 + r() * .5) * n)), sp = (k - (kids - 1) / 2) * (.62 + r() * .3);
        grow(pts[i][0], pts[i][1], a + sp + (r() - .5) * .2, len * (.66 + r() * .1), w * .6, d + 1); } };
    grow(TX, TY, -Math.PI / 2 + .03, 300 * SC, 58 * SC, 0); return out;
  }
  function buildPlate() {   // sky at dusk, far hills, the garden's hill — built once at 1.3× for the push
    const c = C.sheet(1.3), x = c.getContext('2d'), R = rng(11); let sd = 100;
    x.fillStyle = `rgba(${C.TONE},.3)`; x.fillRect(0, 0, W, H);
    for (let k = 0; k < 50; k++) { const y = R() * H * .6, x0 = -100 + R() * W * .5; C.sweep(x, C.seg([x0, y], [x0 + (300 + R() * 700) * SC, y + (R() - .5) * 30], 8), (24 + R() * 40) * SC, .12 + R() * .16, sd++); }
    C.blob(x, W * .5, -60 * SC, 760 * SC, 420 * SC, .4);
    const far = ridge(H * .6, H * .58, 70 * SC, 3, 2); C.smudgeFill(x, far.concat([[W + 60, H], [-60, H]]), .28, sd++);
    for (let k = 0; k < 4; k++) C.sweep(x, far.map(p => [p[0], p[1] + (10 + k * 14) * SC]), 22 * SC, .22, sd++);
    const near = ridge(...HILL); C.smudgeFill(x, near.concat([[W + 60, H], [-60, H]]), .5, sd++, 12);
    for (let k = 0; k < 9; k++) C.sweep(x, near.map(p => [p[0], p[1] + (8 + k * 26) * SC]), (26 + k * 3) * SC, .2 + R() * .14, sd++);
    C.vine(x, near, 2.6, .85, sd++); C.vine(x, near.map(p => [p[0], p[1] + 4]), 1.4, .3, sd++, '#fff', .3);
    for (let k = 0; k < 14; k++) { const side = k % 2 ? 1 : -1; C.blob(x, W / 2 + side * (W * .5 + R() * 60), lerp(0, H, R()), 230 * SC, 380 * SC, .28); }
    return c;
  }
  function buildSubject() {   // the tree, the side toward the setting light lifted
    const c = C.sheet(1.3, null), x = c.getContext('2d'); let sd = 500;
    const edges = TREE.map(b => [offset(b.pts, i => halfW(b, i)), offset(b.pts, i => -halfW(b, i))]);
    TREE.forEach((b, k) => C.tone(x, edges[k][0].concat(edges[k][1].slice().reverse()), .86));
    TREE.forEach((b, k) => { C.sweep(x, b.pts, b.w * .9, .75, sd++);
      if (b.w > 5) { C.vine(x, edges[k][0], Math.min(2.6, b.w * .2), .85, sd++); C.vine(x, edges[k][1], Math.min(2.6, b.w * .2), .85, sd++); }
      C.vine(x, offset(b.pts, i => -halfW(b, i) * .62), Math.max(1, b.w * .1), .3, sd++, '#fff', .25); });
    // leaves: rubbed clusters at the twig ends (a garden tree, not a bare one)
    const r = rng(23); TREE.filter(b => b.d >= 4).forEach(b => { const [ex, ey] = b.pts[b.pts.length - 1]; C.blob(x, ex, ey, (30 + 30 * r()) * SC, (18 + 16 * r()) * SC, .55, r() * 3); });
    C.blob(x, TX + 24 * SC, TY + 8 * SC, 110 * SC, 18 * SC, .7);
    return c;
  }
  function buildFG() {
    const c = C.sheet(1.2, null), x = c.getContext('2d'); let sd = 900;
    const g = ridge(H * .9, H * .87, 60 * SC, 4, 9).concat([[W + 60, H + 80], [-60, H + 80]]);
    C.poly(x, g); C.fillA(x, .96); C.sweep(x, g.slice(0, 41), 30 * SC, .8, sd++);
    const r = rng(91); for (let k = 0; k < 70; k++) { const xx = r() * W, yy = H * .9 + (noise(xx / W * 4, 9) - .5) * 60 * SC - 6, h = (30 + r() * 70) * SC;
      C.vine(x, [[xx, yy + 10], [xx + (r() - .3) * 20, yy - h * .5], [xx + (r() - .2) * 34, yy - h]], 2.2, .7, sd++, k % 5 ? '#000' : '#fff', 0); }
    return c;
  }
  function state(t) {
    const s = { t };
    s.zm = 1 + C.push(t, B.in, 4, .03, k => k) + C.push(t, B.grow, B.dark - B.grow, .08) - C.push(t, B.recoil, 9, .07);
    [s.ox, s.oy] = C.shake(t, C.kick(t, B.turn, .6, 6));
    s.light = .7 * ss(B.light, B.light + 1.6, t);                                                   // the garden's last light (the west, left)
    s.threat = ss(B.grow, B.dark, t) * (t < B.recoil ? 1 : 1 - eio(clamp((t - B.recoil - .2) / 1.8)));
    if (t >= B.recoil && t < B.recoil + .25) s.threat *= 1 + .06 * Math.sin((t - B.recoil) * 60);
    s.light *= 1 - .7 * s.threat; s.light += .25 * ss(B.recoil, B.recoil + 2, t);
    s.night = .42 + .2 * s.threat - .08 * ss(B.recoil, B.calm, t);
    s.point = ss(B.turn, B.turn + 1.2, t);                                                           // the one point of light at the tree's foot
    s.rise = clamp((t - B.rise) / 3.5);                                                              // …that rises as the thread
    return s;
  }
  function drawLight(x, s) {   // the dusk: a lift low in the west behind the tree, and on the hill
    if (s.light <= .002) return;
    C.blob(x, W * .2, H * .56, 520 * SC, 260 * SC, .5 * s.light, 0, C.smudgeW);
    C.blob(x, TX - 80 * SC, TY + 40 * SC, 420 * SC, 90 * SC, .45 * s.light, -.05, C.smudgeW);
  }
  function drawThreat(x, s, t) {   // the dark comes in from both sides like smoke, its edge boiling on twos
    if (s.threat <= .002) return;
    const bo = C.boil(t), jr = rng(bo * 7 + 3);
    C.layer(x, l => { for (const sd of [-1, 1]) { const reach = s.threat * (W * .5 - 150 * SC), pts = [];
      for (let i = 0; i <= 48; i++) { const y = lerp(H * .12, H * 1.02, i / 48), k = Math.sin(i / 48 * Math.PI);
        const d = reach * (.5 + .5 * k) + (Pilot.fbm(i * .22, sd * 3 + t * .25, 3) - .5) * 260 * SC * s.threat + (jr() - .5) * 8 * SC; pts.push([sd < 0 ? d : W - d, y]); }
      C.poly(l, pts.concat(sd < 0 ? [[-80, H + 80], [-80, -80]] : [[W + 80, H + 80], [W + 80, -80]])); l.fillStyle = '#000'; l.fill();
      for (let i = 0; i < 16; i++) { const p = pts[1 + i * 3]; C.blob(l, p[0] + sd * -30 * SC, p[1], (90 + 60 * jr()) * SC, (60 + 40 * jr()) * SC, .55, i, C.smudge); } } }, { blur: 20, alpha: .84 });   /* round 3: a rubbed charcoal edge (blur 7 read as a broken frame) */
  }
  function drawGhost(x, s, t) {   // where the dark reached stays as a faint smear (Kentridge's palimpsest)
    const a = .2 * ss(B.recoil + .3, B.recoil + 1.4, t); if (a <= 0) return;
    for (const sd of [-1, 1]) { const d = W * .5 - 140 * SC, pts = []; for (let i = 0; i <= 24; i++) { const y = lerp(H * .2, H * .95, i / 24); pts.push([sd < 0 ? d * (.55 + .45 * Math.sin(i / 24 * Math.PI)) : W - d * (.55 + .45 * Math.sin(i / 24 * Math.PI)), y]); }
      C.sweep(x, pts, 34 * SC, a, 500 + sd); }
  }
  // words that are up in this scene (03 · 04 · 05): a smudge behind them so they read on the paper
  const LINES = [[21.9, 24.9], [25.2, 31.2], [31.4, 38.1]];
  function partEdenCharcoal(ctx, t) {
    if (!plate) init();
    const s = state(t), x = C.begin();
    C.setCam({ zm: s.zm, ox: s.ox, oy: s.oy, zc: ZC });
    C.applyCam(x); C.drawSheet(x, plate);
    C.toneAll(x, s.night);
    C.applyCam(x); drawLight(x, s);
    if (s.point > 0) { C.applyCam(x); C.blob(x, PT[0], PT[1], 90 * SC * (.6 + .4 * s.point), 50 * SC * (.6 + .4 * s.point), .8 * s.point, 0, C.smudgeW); }   // lifted out of the dark
    C.applyCam(x); C.drawSheet(x, subj);
    drawThreat(x, s, t);
    C.applyCam(x); drawGhost(x, s, t);
    C.fog(x, t, [[H * .6, .36, 12], [H * .69, .3 * (1 + .5 * s.threat), -20], [H * .5, .18, 7]]);
    C.applyCam(x, 1.9, 1.4); C.drawSheet(x, fg);
    C.captionSmudge(x, t, LINES, { y: Film.SAFE() - (Pilot.ori === 'v' ? 70 : 30), rx: 600 * SC, ry: 190 * SC, a: .62 });
    C.develop(ctx);
    // after develop: the warm point and the thread of the promise (the film's gold)
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (s.point > 0) { const [px, py] = C.toScr(PT); W3.bloom(ctx, px, py, [255, 210, 130], .55 * s.point * (.88 + .12 * Math.sin(t * 2)), { r: 80, streak: .12 }); ctx.fillStyle = `rgba(255,236,190,${s.point})`; ctx.beginPath(); ctx.arc(px, py, 4, 0, 6.283); ctx.fill(); }
    if (s.rise > 0) { const n = Math.max(2, Math.round(THREAD.length * s.rise)), pts = THREAD.slice(0, n).map(C.toScr);
      C.glowLine(ctx, pts, 1, 950, { w: [12, 5, 2], al: [.12, .35, .95], col: C.WARM, off: [0, 1, 2] });
      const [hx, hy] = pts[pts.length - 1]; if (s.rise < 1) W3.bloom(ctx, hx, hy, [255, 214, 140], .7, { r: 60, streak: .12 }); }
    ctx.restore();
  }
  function init() {
    C.init(); W = Pilot.W; H = Pilot.H; SC = H / 1920; TX = W * (Pilot.ori === 'v' ? .56 : .6);
    HILL = [H * .71, H * .7, 40 * SC, 2, 5, 34 * SC]; TY = ridgeY(TX, ...HILL) + 6 * SC; ZC = [TX, TY - 260 * SC];
    TREE = growTree(); TRUNK = offset(TREE[0].pts, i => -halfW(TREE[0], i) * .72);
    PT = [W * (Pilot.ori === 'v' ? .3 : .32), ridgeY(W * .3, ...HILL) + 22 * SC];
    THREAD = []; for (let i = 0; i <= 50; i++) { const u = i / 50; THREAD.push([lerp(PT[0], W + 80, u), PT[1] - Math.sin(u * 2.6) * H * .2 - u * H * .1]); }
    plate = buildPlate(); subj = buildSubject(); fg = buildFG();
  }
  window.partEden = partEdenCharcoal;
  partEdenCharcoal.point = () => C.toScr(PT);   // where the point of light is on screen after the last draw (partPair remembers the garden)
})();
