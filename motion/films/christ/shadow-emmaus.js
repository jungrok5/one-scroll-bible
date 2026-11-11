/* shadow-emmaus.js — 「그리스도」 6부 엠마오 길을 그림자극으로 (kit-shadowstage.js — jointed cut-out figures; the stage here is
   a paper screen lit from behind by a lamp, so everything is a shadow on warm paper: near things crisp and black, far things
   paler and softer, the paper's grain and seams, the light breathing with the lamp's flame, its edges falling off to dark).
   Luke 24:13–31. Everyone is seen side-on, side by side — no walking into the distance.
     'walk'  (u 0–6.2, 153.4–159.6 s): three shadows walk right in a row (planted feet, robes and head cloths swinging); the road,
             the hills, olive trees and a far village slide past behind them at three speeds; the screen is sunset orange, a
             paper sun low on the right.
     'speak' (u 0–6.9, 159.6–166.5 s): the same road, the light deepening; they slow and stop (0–1.2); the middle one turns
             round to the man behind him (1.25–1.55) and, with one open hand raised, explains as he talks (beats); the front
             one turns his head back to listen (from 1.8). (Not "facing ahead with an arm to the sky".)
     'lamp'  (u 0–9.5, 166.5–176 s): evening — the screen turns blue-green; a flat-roofed house on the right; a lamp is lit in
             its window (u ≈ 1.5); the three walk to it, the door opens (2.4) in a wedge of warm light, they step through one by one
             and it closes behind them (5.2–5.8). From 3.6 the view rises so the lit window ends small at 0.15–0.3 of the frame;
             the screen's own light sinks to a calm dark by 6.2 and stays there to the end (no brightening at 9.5).
   buildEmmausShadow() builds the scenery strips once (sync, ~0.3 s). emmausShadow(ctx, u, mode) is a pure function of (u, mode).
   No words drawn. Needs Pilot (lib.js) and kit-shadowstage.js (window.ShadowStage; vendored with F.hf for a head turned back). */
(function () {
  const P = Pilot, { clamp, lerp, ss, eio, rng, fbm, noise, canvas, mix, rgb } = P;
  const W = P.W, H = P.H, V = P.ori === 'v', TAU = Math.PI * 2;
  const K = () => window.ShadowStage;
  const G = Math.round(H * (V ? .585 : .7)), SC = V ? 1.3 : 1.0;          // ground line; figure scale (≈ 205·s px tall)
  const STRIDE = 122 * SC, CAD = .92;                                      // px per walk cycle, cycles per second
  const VEL = STRIDE * CAD;                                                // ground speed (px/s) under the walkers
  const WALK_T = 6.2, SLOW = 1.2;                                          // speak: they ease to a stop over 1.2 s
  const TRAVEL = VEL * (WALK_T + SLOW * .5) + 60;                          // how far the near ground slides over walk + speak
  const INK = '#0d0806';
  const S = {};

  // ---------------- the screen: warm paper lit from behind ----------------
  function buildPaper() {
    const w = Math.ceil(W / 2), h = Math.ceil(H / 2), c = canvas(w, h), x = c.getContext('2d'), d = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = 128 + (fbm(i / 60, j / 60, 4) - .5) * 60 + (fbm(i / 3, j / 18, 2) - .5) * 30 + (noise(i * .9, j * .9) - .5) * 18, o = (j * w + i) * 4;
      d.data[o] = d.data[o + 1] = d.data[o + 2] = v; d.data[o + 3] = 255; }
    x.putImageData(d, 0, 0);
    // the seams where the sheets of paper were pasted (faint vertical bands)
    for (const sx of [.31, .67]) { const g = x.createLinearGradient(w * sx - 6, 0, w * sx + 6, 0); g.addColorStop(0, 'rgba(128,128,128,0)'); g.addColorStop(.5, 'rgba(96,96,96,.6)'); g.addColorStop(1, 'rgba(128,128,128,0)'); x.fillStyle = g; x.fillRect(w * sx - 6, 0, 12, h); }
    const full = canvas(W, H); full.getContext('2d').drawImage(c, 0, 0, W, H); return full; }
  // screen(ctx, u, col, k): the lit paper in palette col = { hi, lo } (rgb), brightness k; the lamp behind breathes
  function screen(ctx, u, col, k = 1, shift = 0) {
    const fl = 1 + .035 * Math.sin(u * 6.1) * Math.sin(u * 2.3 + 1) + .02 * Math.sin(u * 13.7);
    const cx = W * .5 + 14 * Math.sin(u * 1.7), cy = G - (V ? 420 : 300) - shift, R = Math.max(W, H) * (V ? .62 : .7);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, rgb(col.hi.map(v => v * k * fl))); g.addColorStop(.55, rgb(mix(col.hi, col.lo, .55).map(v => v * k * fl))); g.addColorStop(1, rgb(col.lo.map(v => v * k * fl * .7)));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .55; ctx.drawImage(S.paper, 0, 0); ctx.restore(); }
  function post(ctx, u, vig = .7) {   // the screen's edges fall off; fine grain on ones
    const g = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .32, W / 2, H * .5, Math.max(W, H) * .78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(8,4,2,${vig})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .06; const ox = (Math.floor(u * 24) * 97) % 256, oy = (Math.floor(u * 24) * 151) % 256;
    for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) ctx.drawImage(S.grain, x, y); ctx.restore(); }

  // ---------------- scenery: cut-out shadows on strips (far = pale + soft, near = black + crisp) ----------------
  const jag = (pts, a, sd, st) => K().jag(pts, a, sd, st);
  function olive(g, x, gy, h, seed) {   // a gnarled olive: twisted trunk, a ragged crown of cut lobes
    const r = rng(seed), tw = h * .09;
    g.beginPath(); g.moveTo(x - tw * 1.4, gy); g.bezierCurveTo(x - tw * .6, gy - h * .25, x + tw * 1.6, gy - h * .35, x + tw * .2, gy - h * .55); g.lineTo(x + tw * 1.4, gy - h * .55);
    g.bezierCurveTo(x + tw * 2.2, gy - h * .32, x + tw * .4, gy - h * .2, x + tw * 1.6, gy); g.closePath(); g.fill();
    for (let k = 0; k < 7; k++) { const cx = x + (r() - .5) * h * .8, cy = gy - h * .62 - r() * h * .3, rr = h * (.16 + r() * .12);
      g.beginPath(); K().addPoly(g, jag(K().circlePts(cx, cy, rr * 1.25, 16, rr * .8), rr * .12, seed + k, 6)); g.fill(); }
    g.lineWidth = Math.max(1.5, h * .025); g.strokeStyle = g.fillStyle; g.lineCap = 'round';
    for (let k = 0; k < 4; k++) { const a = -1.9 + r() * 1.4; g.beginPath(); g.moveTo(x, gy - h * .5); g.lineTo(x + Math.cos(a) * h * .3, gy - h * .5 + Math.sin(a) * h * .3); g.stroke(); } }
  function flatHouse(g, x, gy, w, h, o = {}) {   // a flat-roofed village house (parapet, a little stair), as a cut-out
    g.beginPath(); g.moveTo(x, gy); g.lineTo(x, gy - h); g.lineTo(x + w * .06, gy - h); g.lineTo(x + w * .06, gy - h - h * .08); g.lineTo(x + w * .2, gy - h - h * .08); g.lineTo(x + w * .2, gy - h);
    g.lineTo(x + w, gy - h); g.lineTo(x + w, gy); g.closePath(); g.fill(); }
  function strip(width, draw, blur) {
    const c = canvas(Math.ceil(width), H), g = c.getContext('2d'); draw(g);
    if (!blur) return c; const b = canvas(c.width, H), bg = b.getContext('2d'); bg.filter = `blur(${blur}px)`; bg.drawImage(c, 0, 0); return b; }
  function buildRoad() {
    const far = strip(W + TRAVEL * .15 + 200, g => {   // far hills and the far village (Emmaus ahead): pale, soft
      g.fillStyle = 'rgba(70,30,14,.34)'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= g.canvas.width; x += 10) g.lineTo(x, G - (V ? 250 : 190) - (V ? 70 : 50) * (fbm(x * .0025, 3, 3) - .2)); g.lineTo(g.canvas.width, H); g.fill();
      const r = rng(5); for (let i = 0; i < 16; i++) { const x = g.canvas.width * .55 + r() * 260, w = 20 + r() * 26; flatHouse(g, x, G - (V ? 250 : 190) - 30 + r() * 10, w, 14 + r() * 18); }
    }, V ? 6 : 5);
    const mid = strip(W + TRAVEL * .45 + 200, g => {   // the nearer hills with olive groves and a stone wall: darker, a little soft
      g.fillStyle = 'rgba(40,16,8,.62)'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= g.canvas.width; x += 10) g.lineTo(x, G - (V ? 110 : 80) - (V ? 60 : 45) * (fbm(x * .004, 8, 3) - .3)); g.lineTo(g.canvas.width, H); g.fill();
      const r = rng(11); for (let x = 40; x < g.canvas.width; x += (V ? 150 : 130) + r() * 220) { const base = G - (V ? 110 : 80) - (V ? 60 : 45) * (fbm(x * .004, 8, 3) - .3) + 8; olive(g, x, base, (V ? 120 : 90) * (.7 + r() * .5), 30 + (x | 0)); }
    }, V ? 2.2 : 1.8);
    const near = strip(W + TRAVEL + 200, g => {   // the road's edge they walk on: black, crisp — stones, tufts, a low wall stub, a milestone
      g.fillStyle = INK; const r = rng(17), top = [];
      for (let x = -10; x <= g.canvas.width + 10; x += 14) top.push([x, G + (r() - .5) * 1.5]);
      g.beginPath(); K().addPoly(g, [...top, [g.canvas.width + 10, H], [-10, H]]); g.fill();
      for (let x = 30; x < g.canvas.width; x += 40 + r() * 140) { const k = r();
        if (k < .55) { const h = (6 + r() * 16) * SC; g.beginPath(); g.moveTo(x, G + 1); for (let i = 0; i < 5; i++) { g.lineTo(x + i * 3 * SC + 2, G - h * (.4 + r() * .6)); g.lineTo(x + i * 3 * SC + 4, G + 1); } g.fill(); }   // grass tuft
        else if (k < .85) { const w = (10 + r() * 22) * SC; g.beginPath(); g.ellipse(x, G + 2, w, w * .45, 0, Math.PI, TAU); g.fill(); }                                                  // stone
        else { const w = 14 * SC, h = 34 * SC; g.beginPath(); g.moveTo(x, G + 1); g.lineTo(x, G - h); g.quadraticCurveTo(x + w / 2, G - h - w * .6, x + w, G - h); g.lineTo(x + w, G + 1); g.fill(); } }   // a milestone
    }, 0);
    return { far, mid, near };
  }

  // ---------------- people: the kit's jointed rig in robes and head cloths ----------------
  const STOPD = VEL * (WALK_T + SLOW / 2);   // where they stop (speak): each walker's phase is offset so it stops with both feet down
  const KIND = [   // the three: [rear disciple, Jesus, front disciple]
    { s: SC * .98, cloth: 0, x: V ? .24 : .33 },
    { s: SC * 1.02, cloth: 1, x: V ? .5 : .5 },
    { s: SC * .96, cloth: 2, x: V ? .76 : .67 },
  ];
  // robe(c, F, col): an ankle-length robe whose hem follows the feet (drawn over the legs), and a head cloth over the head
  function dressRobe(F, cloth) {
    F.head = 'none'; F.dress = 'jacket';
    F.hold = (c, col) => {
      const k = K(), { P } = k.frame(F), s = F.s, f = F.f;
      const fx = F.feet.map(q => q[0]), fwd = f > 0 ? Math.max(...fx) : Math.min(...fx), back = f > 0 ? Math.min(...fx) : Math.max(...fx), hemY = F.gy - 9 * s, trail = (F.sway || 0) * .6 * s;
      const w1 = P(16, 8), w0 = P(-16, 8), kf = P(20, -40), kb = P(-21, -40);
      c.fillStyle = col; c.beginPath(); c.moveTo(...P(14, 40)); c.lineTo(...w1); c.quadraticCurveTo(kf[0], kf[1], fwd + f * 8 * s, hemY);
      c.quadraticCurveTo((fwd + back) / 2, hemY + 3 * s, back - f * (10 * s + Math.abs(trail)), hemY - 2 * s); c.quadraticCurveTo(kb[0] - f * 4 * s, kb[1], w0[0], w0[1]); c.lineTo(...P(-15, 40)); c.closePath(); c.fill();
      // the head cloth: over the crown, falling behind the neck to the shoulders (it trails a little in the walk)
      const tilt = F.ang + (F.tilt || 0), N = P(3, 64), hu = [Math.sin(tilt), -Math.cos(tilt)], hff = F.hf || f, hfv = [hff * Math.cos(tilt), hff * Math.sin(tilt)];
      const Hc = [N[0] + hu[0] * 22 * s + f * Math.cos(tilt) * s, N[1] + hu[1] * 22 * s];
      const T = ([u, v]) => [Hc[0] + (hfv[0] * u - hu[0] * v) * s, Hc[1] + (hfv[1] * u - hu[1] * v) * s];
      const tr = (F.sway || 0) * .35;
      const CL = [
        [[-17, 8], [-18, -6], [-13, -17], [-3, -22], [8, -21], [15, -15], [17, -8], [13, -9], [7, -11], [0, -8], [-5, -1], [-7, 10], [-10, 26], [-24 - tr, 36], [-26 - tr, 18]],
        [[-17, 8], [-18, -7], [-12, -18], [-2, -23], [9, -21.5], [15.5, -15], [17.5, -7], [13, -8.5], [6, -10.5], [-1, -7], [-6, 2], [-8, 14], [-12, 30], [-22 - tr, 40], [-25 - tr, 22]],
        [[-16, 6], [-17, -8], [-11, -18], [-1, -22], [9, -20], [15, -13], [16, -6], [11, -8], [4, -10], [-2, -6], [-6, 4], [-9, 18], [-20 - tr, 30], [-22 - tr, 14]],
      ][cloth];
      c.beginPath(); CL.forEach((p, i) => { const q = T(p); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.fill();
      if (cloth === 1) { const q = T([-15, -4]), q2 = T([16, -9]); c.lineWidth = 2.4 * s; c.strokeStyle = col; c.beginPath(); c.moveTo(...q); c.lineTo(...q2); c.stroke(); }   // a band round the cloth
    };
    return F; }
  // draw a figure as a shadow: a soft penumbra a little larger, then the crisp shadow; optional warm rim from a light
  function shadow(ctx, F, o = {}) {
    const k = K(); ctx.save(); ctx.filter = `blur(${(V ? 5 : 4)}px)`; ctx.globalAlpha = .35; k.body(ctx, F, 'rgb(20,8,4)', 'rgb(20,8,4)'); ctx.restore();
    k.person(ctx, F, { col: INK, rim: o.rim }); }

  // a walker in place at screen x, walking right, the ground sliding under it at VEL (feet planted on the moving ground)
  function walker(i, u, dist, f = 1) {
    const kd = KIND[i], st = STRIDE * kd.s / SC, want = i === 1 ? .55 : .05, off = ((want - (STOPD / st) % 1) % 1 + 1) % 1, ph = dist / st + off, F = K().walk(W * kd.x, G, kd.s, f, ph, st, { lean: .06 });
    return dressRobe(F, kd.cloth); }

  // ---------------- scenes ----------------
  const SUNSET = { hi: [255, 196, 120], lo: [190, 84, 38] }, DEEP = { hi: [250, 168, 96], lo: [160, 62, 34] }, TEAL = { hi: [120, 178, 168], lo: [24, 60, 62] };
  function road(ctx, u, d, pal, k) {   // the scenery strips at ground distance d (px): far / sun / mid / near
    screen(ctx, u, pal, k);
    // the paper sun: a disc of thin yellow paper behind the screen, low on the right (where they walk)
    const sx = W * (V ? .8 : .78) - d * .06, sy = G - (V ? 300 : 230); ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, V ? 420 : 340); g.addColorStop(0, `rgba(255,236,170,${.9 * k})`); g.addColorStop(.16, `rgba(255,214,130,${.7 * k})`); g.addColorStop(.17, `rgba(255,190,100,${.28 * k})`); g.addColorStop(1, 'rgba(255,150,70,0)'); ctx.fillStyle = g; ctx.fillRect(sx - 420, sy - 420, 840, 840); ctx.restore();
    ctx.drawImage(S.road.far, -d * .15, 0); ctx.drawImage(S.road.mid, -d * .45, 0); ctx.drawImage(S.road.near, -d, 0); }
  const dAt = u => VEL * u;   // walk: ground distance
  function walk(ctx, u) {
    const d = dAt(u); road(ctx, u, d, SUNSET, 1);
    const people = [2, 1, 0].map(i => walker(i, u, d));   // front first so the rear one's arm… (they never overlap: 1/3 body apart)
    for (const F of people) shadow(ctx, F);
    post(ctx, u, .6); }
  function speak(ctx, u) {
    // ground distance continues from 'walk' and eases to a stop by u = SLOW
    const tp = K().on2(u), dS = dAt(WALK_T) + VEL * (tp < SLOW ? tp - tp * tp / (2 * SLOW) : SLOW / 2), pal = { hi: mix(SUNSET.hi, DEEP.hi, ss(0, 6, u)), lo: mix(SUNSET.lo, DEEP.lo, ss(0, 6, u)) };
    road(ctx, u, dS, pal, 1);
    const k = K(), stopped = tp >= SLOW;
    const pose = i => { const W0 = walker(i, u, dS); if (!stopped) return W0; const F = k.closeStep(W0, clamp((tp - SLOW) / .4)); return dressRobe(F, KIND[i].cloth); };
    // rear disciple: stops and listens, head a little lowered
    const A = pose(0); if (stopped) A.tilt = .12 * ss(1.6, 2.2, u);
    // front disciple: stops, turns his head back to listen (F.hf), a slight nod
    const C = pose(2); if (u > 1.8) { C.hf = -1; C.tilt = -.08 + .05 * Math.sin(u * 2.1); }
    // Jesus: stops, turns round to the man behind him (a cut-out flip, 1.25–1.55), raises an open hand and explains
    const Jb = pose(1), turn = clamp((tp - 1.25) / .3), arm = ss(1.5, 2.1, u) * (1 - .25 * ss(6.3, 6.9, u)), beat = .14 * Math.sin((u - 2.1) * 3.4) * ss(2.1, 2.5, u);
    if (arm > 0) k.armTo(Jb, 1, arm * (1.75 + beat), 70);
    Jb.tilt = .06 * Math.sin(u * 1.7) * ss(2, 2.5, u);
    for (const F of [C, A]) shadow(ctx, F);
    { const sxk = Math.cos(Math.PI * turn), hx = Jb.hip[0]; ctx.save(); ctx.translate(hx, 0); ctx.scale(Math.abs(sxk) < .08 ? .08 * Math.sign(sxk || -1) : sxk, 1); ctx.translate(-hx, 0); shadow(ctx, Jb); ctx.restore(); }
    post(ctx, u, .6); }

  // the evening house (lamp): flat roof, a window, a door that opens; positions in frame px (world before the rise)
  const HS = { x: W * (V ? .63 : .66), w: V ? 330 : 360, h: V ? 360 : 300 };
  HS.door = { x: HS.x + (V ? 40 : 46), w: V ? 92 : 80, h: V ? 300 : 238 }; HS.win = { x: HS.x + HS.w * .58, y: G - HS.h * .72, w: V ? 64 : 58, h: V ? 70 : 60 };
  function buildEvening() {
    return strip(W, g => {
      g.fillStyle = 'rgba(10,24,24,.38)'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 10) g.lineTo(x, G - (V ? 230 : 170) - (V ? 60 : 44) * (fbm(x * .003, 21, 3) - .2)); g.lineTo(W, H); g.fill();
      const r = rng(23); for (let i = 0; i < 9; i++) { const x = W * (.05 + r() * .5), w = 26 + r() * 30; flatHouse(g, x, G - (V ? 200 : 150) + r() * 16, w, 20 + r() * 22); }
    }, V ? 6 : 5); }
  function evening(ctx, u, shift, lightK) {   // the screen, the far village, the near ground with olives, the house
    screen(ctx, u, TEAL, lightK, shift);
    ctx.save(); ctx.translate(0, -shift);
    ctx.drawImage(S.evening, 0, 0);
    ctx.fillStyle = 'rgba(8,18,18,.62)'; olive(ctx, W * (V ? .12 : .16), G - 4, (V ? 210 : 160), 77);   // a near olive at the left, a little soft
    ctx.fillStyle = INK; ctx.fillRect(-10, G, W + 20, H + shift);
    // the house
    const { x, w, h, door: D, win: Wn } = HS; ctx.fillStyle = '#100a08'; flatHouse(ctx, x, G + 1, w, h);
    ctx.restore(); }
  function lamp(ctx, u) {
    const k = K(), rise = eio(clamp((u - 3.6) / 3.2)), shift = rise * (HS.win.y - H * (V ? .24 : .22)), dim = 1 - .82 * ss(4.2, 6.2, u);
    evening(ctx, u, shift, .95 * dim);
    ctx.save(); ctx.translate(0, -shift);
    const { door: D, win: Wn } = HS, wl = k.lightOn(u, 1.45, .45), open = eio(clamp((u - 2.4) / .9)) * (1 - eio(clamp((u - 5.3) / .6)));
    // the window: warm paper behind a cross of bars, its glow on the screen
    if (wl > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(Wn.x + Wn.w / 2, Wn.y + Wn.h / 2, 0, Wn.x + Wn.w / 2, Wn.y + Wn.h / 2, V ? 260 : 220); g.addColorStop(0, `rgba(255,190,100,${.55 * wl})`); g.addColorStop(1, 'rgba(255,160,70,0)'); ctx.fillStyle = g; ctx.fillRect(Wn.x - 260, Wn.y - 260, 520 + Wn.w, 520 + Wn.h); ctx.restore();
      ctx.fillStyle = rgb(mix([40, 24, 12], [255, 204, 120], wl)); ctx.fillRect(Wn.x, Wn.y, Wn.w, Wn.h); ctx.fillStyle = '#100a08'; ctx.fillRect(Wn.x + Wn.w / 2 - 3, Wn.y, 6, Wn.h); ctx.fillRect(Wn.x, Wn.y + Wn.h * .45 - 3, Wn.w, 6); }
    // the doorway: warm light as the leaf swings in; a wedge of it on the ground
    if (open > 0) { const dw = D.w * open; ctx.fillStyle = rgb([255, 196, 112].map(v => v * (.85 + .15 * Math.sin(u * 7)))); ctx.fillRect(D.x, G - D.h, dw, D.h);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(D.x + dw / 2, G - D.h * .4, 0, D.x + dw / 2, G - D.h * .4, V ? 380 : 320); g.addColorStop(0, `rgba(255,180,90,${.45 * open})`); g.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = g; ctx.fillRect(D.x - 400, G - D.h - 400, 800 + D.w, 800 + D.h); ctx.restore(); }
    // the three walk in from the left and through the door, one after another (the house hides them as they pass inside)
    const order = [[2, 0], [1, .55], [0, 1.1]];   // front disciple first, then Jesus, then the other
    for (const [i, lag] of order) { const kd = KIND[i], x0 = W * .05 - lag * 150, x1 = D.x + D.w * .5 + 60, tp = k.on2(u - lag);
      if (tp <= 0) continue; const stride = k.stopStride(x1 - x0, 122 * kd.s), wv = k.walkAlong(tp, 0, 4.0, x0, x1, stride, .05);
      const F = dressRobe(k.walk(wv.x, G, kd.s, 1, wv.ph, stride, { lean: .06 }), kd.cloth);
      ctx.save(); ctx.beginPath(); ctx.rect(-50, 0, D.x + D.w * .55 + 50, H + 1000); ctx.clip();   // past the door's middle they are inside
      shadow(ctx, F, { rim: { x: D.x + D.w / 2, y: G - D.h * .5, a: open * .9, reach: 420 } }); ctx.restore(); }
    ctx.restore();
    // the frame under the lifted world stays dark
    post(ctx, u, .75); }

  function build() { const t0 = performance.now();
    S.paper = buildPaper(); S.grain = P.speckle(256, 256, 30, 3); S.road = buildRoad(); S.evening = buildEvening();
    S.ms = performance.now() - t0; return S; }
  function scene(ctx, u, mode) {
    if (!S.paper) build();
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (mode === 'speak') speak(ctx, u); else if (mode === 'lamp') lamp(ctx, u); else walk(ctx, u);
    ctx.restore(); }
  window.__EmmausShadow = { build, scene, S };
})();

function buildEmmausShadow() { return window.__EmmausShadow.build(); }
function emmausShadow(ctx, u, mode) { return window.__EmmausShadow.scene(ctx, u, mode); }
