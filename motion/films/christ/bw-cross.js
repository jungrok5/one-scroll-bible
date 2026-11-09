/* bw-cross.js — 「그리스도」 4부, 흑백 필름 (after the first film's 「십자가」: black-and-white film, grain, gate flicker,
   scratches, vignette — and one light alive in it, a breath of warmth allowed only there).
   bwCross(ctx, u)    u 0..10.2  (film 87.6–97.8)
     N11 "십자가 위에서 예수님은 외치셨습니다." — darkness over the land at noon (Mt 27:45): a heavy grey sky, the hill and three
     crosses in silhouette, a few women standing far off (Mt 27:55), the camera slowly pushing in.
     Q5 (u 3.9 = 91.5) "나의 하나님, 나의 하나님, 어찌하여 나를 버리셨나이까" — the sky closes and darkens; one shaft of light is all
     that is left, falling behind the middle cross; the camera dollies to the middle cross (near things pass out of frame).
     u 9–10.2: the shaft draws back up into its gap in the clouds and the gap closes to one point of light (bwCross.point(u)).
   bwSoldiers(ctx, u) u 0..6.2   (film 114–120.2)
     N14 "십자가 아래 군인들은 그 옷을 두고 제비를 뽑았습니다." — daylight, the third hour (Mk 15:24–25): close on the ground at the
     foot of the cross, two squatting soldiers' hands, the seamless tunic spread above them (Jn 19:23–24); the cross is only
     its long shadow lying across the ground. The dice leave the hand at u 1.9 and come to rest at u ≈ 2.6 (the event); then the
     winner's hand reaches up and takes hold of the tunic's hem.
   No words are drawn here. No blood, no wounds, no faces. Deterministic (Pilot.rng / noise only). */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, fbm, noise, canvas } = Pilot;
  let B = null;

  // ------------------------------------------------------------------ build (once)
  function buildBW() {
    if (B) return B;
    const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
    B = { W, H, V };
    B.grain = []; for (let i = 0; i < 6; i++) B.grain.push(Pilot.speckle(W >> 1, H >> 1, 62, 410 + i));
    B.halo = canvas(W >> 2, H >> 2); B.halo2 = canvas(W >> 2, H >> 2);
    B.clouds = [cloudTex(640, 300, 3, .30, 70, 150), cloudTex(640, 300, 11, .47, 40, 120)];
    B.shaft = shaftTex();
    buildCrossWorld(); buildSoldierWorld();
    return B;
  }
  window.buildBW = buildBW;

  // horizontally tileable overcast: tone and coverage from fbm
  function cloudTex(w, h, seed, th, lo, hi) {
    const c = canvas(w, h), g = c.getContext('2d'), im = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h, k = seed * 7.3;
      const n = lerp(fbm(u * 4 + k, v * 2.4 + k, 5), fbm(u * 4 - 4 + k, v * 2.4 + k, 5), u);
      const m = fbm(u * 9 + k + 2, v * 5 + k, 3);
      const a = clamp((n - th) * 2.6) * (.75 + .25 * m), c0 = lo + (hi - lo) * clamp((n - .25) * 1.6) * (1 - v * .25), i = (y * w + x) * 4;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = c0; im.data[i + 3] = a * 255;
    }
    g.putImageData(im, 0, 0); return c;
  }
  // a shaft of light: soft edges, striations along its length, fading towards the ground (warm white)
  function shaftTex() {
    const w = 256, h = 1024, c = canvas(w, h), g = c.getContext('2d'), im = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const xn = (x - w / 2) / (w / 2), yn = y / h, wid = lerp(.35, 1, yn);
      const edge = Math.exp(-Math.pow(xn / wid, 2) * 2.6), str = .55 + .45 * fbm(x * .045 / wid + 3, yn * 1.2, 3);
      const along = ss(0, .06, yn) * (1 - ss(.55, 1, yn) * .92);
      const a = clamp(edge * str * along), i = (y * w + x) * 4;
      im.data[i] = 255; im.data[i + 1] = 246; im.data[i + 2] = 230; im.data[i + 3] = a * 255;
    }
    g.putImageData(im, 0, 0); return c;
  }

  // ------------------------------------------------------------------ film treatment
  function finish(ctx, t, o) {
    const { W, H } = B, hw = B.halo.width, hh = B.halo.height, fi = Math.floor(t * 24);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
    // halation: the highlights bloom like film
    const h1 = B.halo.getContext('2d'); h1.globalCompositeOperation = 'copy'; h1.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, hw, hh);
    const h2 = B.halo2.getContext('2d'); h2.globalCompositeOperation = 'copy'; h2.filter = `blur(${o.haloBlur || 7}px) contrast(1.9) brightness(.85)`; h2.drawImage(B.halo, 0, 0); h2.filter = 'none';
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.halo == null ? .35 : o.halo; ctx.drawImage(B.halo2, 0, 0, W, H);
    // the only colour: a faint warmth where the light is
    if (o.warm) { const [x, y, r, a] = o.warm, gw = ctx.createRadialGradient(x, y, 0, x, y, r);
      gw.addColorStop(0, `rgba(255,196,128,${a})`); gw.addColorStop(1, 'rgba(255,196,128,0)');
      ctx.globalCompositeOperation = o.warmMode || 'color'; ctx.globalAlpha = 1; ctx.fillStyle = gw; ctx.fillRect(0, 0, W, H); }
    // gate flicker
    const fl = (noise(t * 9.3, 4.1) - .5) * (o.flicker || .09) + (rng(fi * 13 + 5)() - .5) * .03;
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.abs(fl); ctx.fillStyle = fl > 0 ? '#fff' : '#000'; ctx.fillRect(0, 0, W, H);
    // grain (24 fps, a different plate and flip each frame)
    const r = rng(fi * 7 + 1), gi = fi % B.grain.length; ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain || .42;
    ctx.save(); if (r() < .5) { ctx.translate(W, 0); ctx.scale(-1, 1); } if (r() < .5) { ctx.translate(0, H); ctx.scale(1, -1); }
    ctx.drawImage(B.grain[gi], 0, 0, W, H); ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    // scratches (held for a few frames) and dust
    const rs = rng(Math.floor(fi / 3) * 31 + 9); const ns = rs() < .55 ? 1 : rs() < .3 ? 2 : 0;
    for (let i = 0; i < ns; i++) { const x = rs() * W, a = .06 + rs() * .12, wb = rs() * 6.28; ctx.globalAlpha = a; ctx.strokeStyle = rs() < .7 ? '#e8e8e8' : '#000'; ctx.lineWidth = 1 + rs() * 1.4;
      ctx.beginPath(); for (let y = 0; y <= H; y += H / 8) { const xx = x + Math.sin(y * .004 + wb) * 3; y ? ctx.lineTo(xx, y) : ctx.moveTo(xx, y); } ctx.stroke(); }
    const rd = rng(fi * 17 + 3); for (let i = 0; i < 4; i++) if (rd() < .4) { ctx.globalAlpha = .25 + rd() * .45; ctx.fillStyle = rd() < .6 ? '#ddd' : '#000';
      ctx.beginPath(); ctx.ellipse(rd() * W, rd() * H, 1 + rd() * 3, .6 + rd() * 1.6, rd() * 3, 0, 6.283); ctx.fill(); }
    // vignette
    ctx.globalAlpha = 1; const R = Math.hypot(W, H) / 2, gv = ctx.createRadialGradient(W / 2, H * .46, R * .38, W / 2, H * .5, R * 1.02);
    gv.addColorStop(0, 'rgba(0,0,0,0)'); gv.addColorStop(1, `rgba(0,0,0,${o.vig == null ? .7 : o.vig})`); ctx.fillStyle = gv; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ================================================================== bwCross
  let X;   // cross-world layout
  function buildCrossWorld() {
    const { W, H, V } = B;
    // wom: [x, height, lean] — the women stand close together, leaning on one another
    X = V ? { cx: W * .5, cy: H * .47, A: H * .135, sig: W * .29, hc: H * .122, sp: W * .145, hor: H * .535, ridge: H * .615, wh: H * .078,
              wom: [[.2, 1, -.02], [.232, .93, .1], [.262, .97, -.04], [.296, .9, .07], [.322, .86, .02]], end: [W * .5, H * .36], gap0: [W * .58, H * .155], gap1: [W * .52, H * .14] }
          : { cx: W * .56, cy: H * .43, A: H * .2, sig: W * .27, hc: H * .21, sp: W * .085, hor: H * .5, ridge: H * .735, wh: H * .12,
              wom: [[.15, 1, -.02], [.168, .93, .1], [.185, .97, -.04], [.204, .9, .07], [.219, .86, .02]], end: [W * .5, H * .4], gap0: [W * .64, H * .12], gap1: [W * .57, H * .11] };
    const r = rng(77);
    // a rough crest: rock and scree, not a smooth dome
    X.crest = x => X.cy + X.A * (1 - Math.exp(-Math.pow((x - X.cx) / X.sig, 2))) + (fbm(x * .006 + 3, 1.7, 3) - .5) * H * .014
                 + (noise(x * .035, 5.5) - .5) * H * .009 + Math.abs(noise(x * .09, 2.2) - .5) * H * .005;
    X.F = [X.cx, X.cy - X.hc * .58];
    X.rocks = []; for (let i = 0; i < 40; i++) { const x = X.cx + (r() * 2 - 1) * X.sig * 1.7, d = Math.pow(r(), 2.2) * X.A * .6, s = (V ? W : H) * (.008 + r() * .02) * (1 - d / X.A * .5), n = 6 + (r() * 3 | 0), pts = [];
      for (let j = 0; j < n; j++) { const a = j / n * 6.283, rr = .6 + r() * .5; pts.push([Math.cos(a) * rr, Math.sin(a) * rr * .6]); } X.rocks.push({ x, d, s, pts }); }
    X.tufts = []; for (let i = 0; i < 80; i++) { const x = X.cx + (r() * 2 - 1) * X.sig * 2; if (Math.abs(x - X.cx) < W * .02 || Math.abs(Math.abs(x - X.cx) - X.sp) < W * .015) continue; X.tufts.push({ x, h: (V ? W : H) * (.008 + r() * .016), b: r() * 6.28 }); }
    X.grass = []; for (let i = 0; i < 110; i++) X.grass.push({ x: r() * W * 1.2 - W * .1, h: (.4 + r()) * H * (V ? .022 : .03), b: r() * 6.28, l: r() < .5 ? -1 : 1 });
    X.motes = []; for (let i = 0; i < 46; i++) X.motes.push({ a: r(), s: r() * 2 - 1, v: .02 + r() * .05, z: 1 + r() * 2, p: r() * 6.28 });
    // soil and stone grain for the hill and the near ridge
    X.tex = canvas(512, 256); { const g = X.tex.getContext('2d'), im = g.createImageData(512, 256);
      for (let y = 0; y < 256; y++) for (let x = 0; x < 512; x++) { const n = fbm(x * .03, y * .06, 5), m = fbm(x * .12 + 7, y * .2, 2), v = 30 + 70 * n + 25 * (m - .5), i = (y * 512 + x) * 4;
        im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255 * clamp(.25 + Math.abs(n - .5) * 1.4); }
      g.putImageData(im, 0, 0); }
    X.lit = canvas(W >> 1, H >> 1);
    B.clouds.push(cloudTex(640, 220, 23, .5, 96, 200));   // a thin, fast, streaky layer
  }
  function ridgeY(x) { const { H } = B; return X.ridge + Math.sin(x * .004 + 1) * H * .008 + (fbm(x * .01, 4.2, 3) - .5) * H * .016 + (noise(x * .04, 9) - .5) * H * .006; }

  // a crucified figure in silhouette — restrained, no detail: the head fallen to one side, the arms drawn along the beam, the body
  // hanging from them, the cloth at the waist, the knees bent and turned (after Rembrandt's and El Greco's crucifixions)
  function crucified(g, x, yb, h, side, title) {
    const T = yb - h * .96, bw = h * .05, by = T + h * .2, bl = h * .31, s = side;
    // the wood: a slightly tapering, uneven upright and beam
    const top = T + h * .07; g.beginPath(); g.moveTo(x - bw * .56, yb + 4); g.lineTo(x - bw * .47, top + h * .01); g.lineTo(x - bw * .3, top); g.lineTo(x + bw * .42, top + h * .004); g.lineTo(x + bw * .5, yb + 4); g.fill();
    g.beginPath(); g.moveTo(x - bl, by - h * .02); g.lineTo(x + bl, by - h * .024); g.lineTo(x + bl - h * .004, by + h * .02); g.lineTo(x - bl + h * .003, by + h * .023); g.fill();
    if (title) { g.beginPath(); g.moveTo(x - h * .075, T + h * .062); g.lineTo(x + h * .075, T + h * .06); g.lineTo(x + h * .073, T + h * .112); g.lineTo(x - h * .074, T + h * .114); g.fill(); }   // the title over his head (Jn 19:19)
    const P = (px, py) => [x + px * h * s, by + py * h], c = (a, b, w0, w1) => capsule(g, P(...a), P(...b), w0 * h, w1 * h);
    // arms drawn along the beam: hand → elbow → shoulder, sagging under the body's weight
    for (const m of [1, -1]) { c([m * .272, -.004], [m * .155, .04], .021, .028); c([m * .155, .04], [m * .062, .092], .028, .04); g.beginPath(); g.ellipse(...P(m * .282, -.004), h * .014, h * .019, 0, 0, 6.283); g.fill(); }
    // the body hangs a little to one side: chest, ribs, waist
    smooth(g, [P(-.066, .085), P(-.062, .125), P(-.058, .19), P(-.046, .26), P(-.05, .315), P(.042, .322), P(.05, .27), P(.064, .19), P(.068, .125), P(.068, .086), P(.025, .07), P(-.025, .07)]);
    // the head fallen onto the shoulder, hair falling forward over the face
    c([0, .078], [.022, .07], .036, .032);
    g.beginPath(); g.ellipse(...P(.04, .066), h * .031, h * .039, s * .62, 0, 6.283); g.fill();
    smooth(g, [P(.02, .05), P(.065, .05), P(.08, .085), P(.07, .115), P(.05, .1)]);
    // the cloth at the waist, knotted at one side, its end hanging
    smooth(g, [P(-.056, .298), P(.052, .3), P(.064, .34), P(.05, .372), P(.015, .36), P(-.02, .378), P(-.058, .36), P(-.064, .33)]);
    c([.058, .31], [.08, .39], .026, .016);
    // the legs together, the knees bent and turned to one side, the feet on the rest
    c([-.028, .35], [.03, .46], .052, .038); c([.03, .46], [.004, .585], .038, .024);
    c([.012, .35], [.05, .455], .05, .036); c([.05, .455], [.016, .58], .036, .023);
    c([.004, .585], [.01, .612], .022, .016); c([.016, .58], [.02, .608], .02, .015);
  }
  // a woman seen from behind: veil over the head and shoulders, a long robe; bow lowers the head
  function woman(g, x, y, h, lean, ph, t, bow = 0) {
    const hr = h * .072, hy = y - h + hr * 1.15 + bow * h * .045, sw = h * .148, wind = Math.sin(t * 1.7 + ph) * .5 + noise(t * .9 + ph, 2) - .5;
    g.save(); g.translate(x, y); g.rotate(lean); g.translate(-x, -y);
    g.beginPath(); g.moveTo(x - hr, hy + hr * .4);
    g.bezierCurveTo(x - hr * 1.25, hy - hr * 1.25, x + hr * 1.25, hy - hr * 1.25, x + hr, hy + hr * .4);
    g.bezierCurveTo(x + hr * 1.1, hy + hr * 1.4, x + sw * 1.02, y - h * .8, x + sw * (1.1 + wind * .1), y - h * .62);
    g.lineTo(x + sw * (1.16 + wind * .2), y - h * .46); g.lineTo(x + sw * .9, y - h * .45);
    g.bezierCurveTo(x + sw * .94, y - h * .3, x + sw * 1.08, y - h * .1, x + sw * 1.24, y); g.lineTo(x - sw * 1.2, y);
    g.bezierCurveTo(x - sw * 1.06, y - h * .1, x - sw * .92, y - h * .3, x - sw * .88, y - h * .45);
    g.lineTo(x - sw * (1.1 - wind * .12), y - h * .47); g.lineTo(x - sw * (1.06 - wind * .06), y - h * .62);
    g.bezierCurveTo(x - sw * 1.0, y - h * .8, x - hr * 1.1, hy + hr * 1.4, x - hr, hy + hr * .4); g.fill();
    g.restore();
  }
  // a soldier on watch at the foot of the crosses: helmet, cloak in the wind, spear — a small dark figure, no cartoon
  function sentry(g, x, y, h, spear, face, t, ph) {
    const w = Math.sin(t * 1.4 + ph) * .5 + noise(t * .8 + ph, 3) - .5;
    g.save(); g.translate(x, y); g.scale(face * h / 100, h / 100);
    g.beginPath(); g.moveTo(-6, -100); g.bezierCurveTo(-16, -100, -17, -86, -12, -82); g.lineTo(-17, -80); g.lineTo(-16, -76); g.lineTo(-8, -77);   // helmet, neck guard
    g.lineTo(-10, -70); g.bezierCurveTo(-24, -66, -26, -50, -27 - w * 3, -30); g.bezierCurveTo(-29 - w * 5, -18, -26 - w * 6, -8, -24 - w * 7, -2);  // cloak falling from the shoulders
    g.lineTo(-10, -4); g.lineTo(-9, 0); g.lineTo(-3, 0); g.lineTo(-2, -12); g.lineTo(2, -12); g.lineTo(4, 0); g.lineTo(10, 0); g.lineTo(9, -6);      // legs below the tunic
    g.lineTo(14, -10); g.bezierCurveTo(16, -30, 15, -55, 9, -70); g.lineTo(6, -77); g.bezierCurveTo(10, -80, 10, -88, 6, -95); g.bezierCurveTo(2, -101, -2, -101, -6, -100); g.fill();
    if (spear) { g.lineWidth = 2.6; g.beginPath(); g.moveTo(22, 2); g.lineTo(26, -150); g.stroke(); g.beginPath(); g.moveTo(26, -150); g.lineTo(24, -164); g.lineTo(26.6, -176); g.lineTo(28.4, -163); g.closePath(); g.fill(); }
    g.restore();
  }

  function bwCross(ctx, u) {
    buildBW(); const { W, H, V } = B, t = 87.6 + u;
    const q = ss(3.9, 5.3, u), endk = ss(8.9, 10.2, u);                                // q: the cry — the sky closes; endk: down to one point
    // camera: a slow push, then (from the cry) a dolly to the middle cross; near layers grow faster
    const push = u < 3.9 ? .15 * (u / 3.9) : .15 + 1.37 * eio((u - 3.9) / 6.3) + .026 * (u - 3.9);
    const pr = clamp(push / 1.6), Tx = lerp(X.F[0], X.end[0], eio(pr)) + (V ? W : H) * .02 * Math.sin(u * .35 + .4), Ty = lerp(X.F[1], X.end[1], eio(pr));
    const wv = rng(Math.floor(t * 24) + 1), jx = (wv() - .5) * 1.6, jy = (wv() - .5) * 1.6;   // gate weave
    const camT = k => { const s = 1 + push * k; return [s, Tx + jx - X.F[0] * s, Ty + jy - X.F[1] * s]; };
    const layer = k => { const [s, a, b] = camT(k); ctx.setTransform(s, 0, 0, s, a, b); return s; };
    const scr = (k, x, y) => { const s = 1 + push * k; return [Tx + (x - X.F[0]) * s, Ty + (y - X.F[1]) * s]; };
    ctx.save();
    // --- sky: dim noon overcast that darkens at the cry; the gap is where the light still is
    const sb = lerp(1, .74, q) * lerp(1, .35, endk);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const sk = ctx.createLinearGradient(0, 0, 0, H * .62); sk.addColorStop(0, `rgb(${70 * sb | 0},${70 * sb | 0},${72 * sb | 0})`); sk.addColorStop(.6, `rgb(${132 * sb | 0},${132 * sb | 0},${130 * sb | 0})`); sk.addColorStop(1, `rgb(${166 * sb | 0},${165 * sb | 0},${160 * sb | 0})`);
    ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H);
    const gp = [lerp(X.gap0[0], X.gap1[0], eio(pr)), lerp(X.gap0[1], X.gap1[1], eio(pr))];
    // clouds: three layers moving at their own speeds (the near ones faster)
    const CL = [[0, 10, .95, -.06, V ? .44 : .62], [1, 24, .9, .02, V ? .44 : .62], [2, 46, .55, .06, V ? .26 : .36]];
    const drawClouds = (g, half) => { for (const [ci, sp, a, yo, hh] of CL) { const [s, ox, oy] = camT(.3); g.setTransform(s * half, 0, 0, s * half, ox * half, oy * half);
        const cw = W * 1.6, off = ((t * sp) % cw + cw) % cw; g.globalAlpha = a; for (const o of [-cw, 0, cw]) g.drawImage(B.clouds[ci], o + off - W * .3, H * yo, cw, H * hh); } g.globalAlpha = 1; g.setTransform(1, 0, 0, 1, 0, 0); };
    drawClouds(ctx, 1);
    // darkness over the land (Mt 27:45) — heavier from the cry, the gap left open
    { const R = Math.max(W, H) * lerp(.95, .6, q), gd = ctx.createRadialGradient(gp[0], gp[1], R * .14, gp[0], gp[1], R);
      const d = .1 + .3 * q; gd.addColorStop(0, `rgba(0,0,0,${d * .1})`); gd.addColorStop(1, `rgba(0,0,0,${d})`); ctx.fillStyle = gd; ctx.fillRect(0, 0, W, H * .75); }
    // the gap: before the cry a hidden sun's dull glow; at the cry the clouds part around it and their edges catch the light
    const gapA = lerp(.38, 1, q) * (1 - endk * .35), gr = (V ? W * .2 : H * .3) * lerp(.85, 1.2, q) * lerp(1, .18, endk);
    { ctx.globalCompositeOperation = 'screen'; const gg = ctx.createRadialGradient(gp[0], gp[1], 0, gp[0], gp[1], gr * 2.8);
      gg.addColorStop(0, `rgba(255,250,240,${gapA})`); gg.addColorStop(.12, `rgba(240,236,228,${.62 * gapA})`); gg.addColorStop(.4, `rgba(180,178,172,${.22 * gapA})`); gg.addColorStop(1, 'rgba(120,120,120,0)');
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
    if (q > .01 && endk < .99) { const lc = X.lit.getContext('2d'); lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, W, H); drawClouds(lc, .5);
      lc.globalCompositeOperation = 'destination-in'; const R2 = gr * 3.2 * .5, mg = lc.createRadialGradient(gp[0] * .5, gp[1] * .5, R2 * .1, gp[0] * .5, gp[1] * .5, R2); mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
      lc.fillStyle = mg; lc.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .9 * q * (1 - endk); ctx.drawImage(X.lit, 0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }   // silver edges
    // the shaft: from the gap down behind the middle cross
    const [ctx0, cty0] = scr(1, X.cx, X.cy - X.hc * .9);
    const sa = q * (1 - ss(9.0, 10.0, u)), retreat = ss(8.9, 10.1, u);
    if (sa > .003) {
      const dx = ctx0 - gp[0], dy = cty0 - gp[1], ang = Math.atan2(dy, dx) - Math.PI / 2, len = Math.hypot(dx, dy) * lerp(2.1, .2, retreat), wd = (V ? W * .55 : W * .28) * (1 + push * .25) * lerp(1, .15, retreat);
      ctx.save(); ctx.translate(gp[0], gp[1]); ctx.rotate(ang); ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = sa; ctx.drawImage(B.shaft, -wd / 2, 0, wd, len);
      ctx.globalAlpha = .6 * sa * (.8 + .2 * Math.sin(t * 1.3)); ctx.drawImage(B.shaft, -wd * .3 + Math.sin(t * .7) * wd * .03, 0, wd * .6, len * .9);
      ctx.globalAlpha = .5 * sa; ctx.drawImage(B.shaft, -wd * .12, 0, wd * .24, len * .8);
      ctx.fillStyle = '#fff';
      for (const m of X.motes) { const along = (m.a + t * m.v) % 1, yy = along * len * .8, xx = m.s * wd * .28 * lerp(.4, 1, along) + Math.sin(t * .8 + m.p) * 8;
        ctx.globalAlpha = sa * .5 * Math.exp(-Math.pow(m.s, 2) * 2) * Math.sin(along * Math.PI); ctx.beginPath(); ctx.arc(xx, yy, m.z, 0, 6.283); ctx.fill(); }
      ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    // --- far land and the city wall (atmospheric: lighter than the hill)
    layer(.6); ctx.fillStyle = `rgb(${84 * sb | 0},${84 * sb | 0},${84 * sb | 0})`;
    ctx.beginPath(); ctx.moveTo(-W, H * 1.2); for (let x = -W; x <= W * 2; x += 12) ctx.lineTo(x, X.hor + (fbm(x * .003, 7.7, 4) - .5) * H * .03); ctx.lineTo(W * 2, H * 1.2); ctx.fill();
    { const hz = ctx.createLinearGradient(0, X.hor - H * .05, 0, X.hor + H * .03); hz.addColorStop(0, 'rgba(130,130,128,0)'); hz.addColorStop(.7, `rgba(130,130,128,${.3 * sb})`); hz.addColorStop(1, 'rgba(130,130,128,0)'); ctx.fillStyle = hz; ctx.fillRect(-W, X.hor - H * .05, W * 3, H * .08); }
    { const wx0 = V ? W * .02 : W * .06, wx1 = V ? W * .3 : W * .34, wy = X.hor - H * .004; ctx.fillStyle = `rgb(${64 * sb | 0},${64 * sb | 0},${66 * sb | 0})`; ctx.beginPath(); ctx.moveTo(wx0, wy + H * .02);
      for (let x = wx0; x < wx1; x += H * .008) { const tw = Math.abs(x - (wx0 + (wx1 - wx0) * .62)) < H * .012 ? H * .022 : 0; ctx.lineTo(x, wy - H * .014 - tw); ctx.lineTo(x + H * .005, wy - H * .014 - tw); ctx.lineTo(x + H * .005, wy - H * .011 - tw); ctx.lineTo(x + H * .008, wy - H * .011 - tw); }
      ctx.lineTo(wx1, wy + H * .02); ctx.fill(); }
    // --- the hill: rock, scree and dry grass, its rough crest picked out by the shaft behind it
    layer(1);
    { const hv = lerp(1, .72, q), hill = new Path2D(); hill.moveTo(-W, H * 1.5); for (let x = -W; x <= W * 2; x += 6) hill.lineTo(x, X.crest(x)); hill.lineTo(W * 2, H * 1.5); hill.closePath();
      const hg = ctx.createLinearGradient(0, X.cy, 0, X.cy + X.A * 1.4); hg.addColorStop(0, `rgb(${46 * hv | 0},${46 * hv | 0},${47 * hv | 0})`); hg.addColorStop(1, `rgb(${30 * hv | 0},${30 * hv | 0},${31 * hv | 0})`);
      ctx.fillStyle = hg; ctx.fill(hill);
      ctx.save(); ctx.clip(hill); ctx.globalAlpha = .55 * hv; ctx.drawImage(X.tex, X.cx - X.sig * 2.4, X.cy - H * .02, X.sig * 4.8, X.A * 1.6 + H * .1); ctx.globalAlpha = 1;
      for (const rk of X.rocks) { const y = X.crest(rk.x) + rk.d + rk.s * .2; ctx.fillStyle = `rgba(${24 * hv | 0},${24 * hv | 0},${25 * hv | 0},.45)`; ctx.beginPath(); rk.pts.forEach(([a, b], i) => i ? ctx.lineTo(rk.x + a * rk.s, y + b * rk.s) : ctx.moveTo(rk.x + a * rk.s, y + b * rk.s)); ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(130,130,126,${.1 + .12 * q})`; ctx.beginPath(); ctx.ellipse(rk.x - rk.s * .1, y - rk.s * .3, rk.s * .5, rk.s * .14, 0, 0, 6.283); ctx.fill(); }
      ctx.restore();
      ctx.strokeStyle = `rgb(${18 * hv | 0},${18 * hv | 0},${19 * hv | 0})`; ctx.lineCap = 'round'; ctx.lineWidth = 1.6;
      for (const tf of X.tufts) { const y = X.crest(tf.x) + 1, sw = Math.sin(t * 1.5 + tf.b) * .15 + .1; for (let j = -2; j <= 2; j++) { ctx.beginPath(); ctx.moveTo(tf.x + j * 1.5, y); ctx.quadraticCurveTo(tf.x + j * 2.5, y - tf.h * .5, tf.x + j * tf.h * .3 + tf.h * sw, y - tf.h * (1 - Math.abs(j) * .15)); ctx.stroke(); } }
      if (q > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineWidth = 3; ctx.filter = 'blur(2px)'; const rg = ctx.createLinearGradient(X.cx - X.sig * .9, 0, X.cx + X.sig * .9, 0);
        rg.addColorStop(0, 'rgba(200,198,194,0)'); rg.addColorStop(.5, `rgba(235,230,222,${.45 * sa})`); rg.addColorStop(1, 'rgba(200,198,194,0)'); ctx.strokeStyle = rg;
        ctx.beginPath(); for (let x = X.cx - X.sig; x <= X.cx + X.sig; x += 4) { const y = X.crest(x) + 1.2; x === X.cx - X.sig ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); } }
    // three crosses
    ctx.fillStyle = '#090909'; ctx.strokeStyle = '#090909';
    crucified(ctx, X.cx - X.sp, X.crest(X.cx - X.sp) + 3, X.hc * .8, 1);
    crucified(ctx, X.cx + X.sp, X.crest(X.cx + X.sp) + 3, X.hc * .8, -1);
    crucified(ctx, X.cx, X.crest(X.cx) + 3, X.hc, 1, true);
    // soldiers keeping watch at the foot
    { const sh = X.hc * .24; [[-.66, 1, 1, 0], [-.5, 0, 1, 1.3], [.56, 1, -1, 2.1]].forEach(([dx, sp, fc, ph]) => { const x = X.cx + X.sp * dx * 1.6; sentry(ctx, x, X.crest(x) + 3, sh, sp, fc, t, ph); }); }
    // --- mist lying in the valley between the hill and the near ridge
    layer(1.35);
    { const my = (X.cy + X.A * .95 + ridgeY(X.cx)) / 2, mg = ctx.createLinearGradient(0, my - H * .09, 0, my + H * .09);
      const ma = (.36 - .1 * q) * (1 - endk) * (1 - ss(.15, .9, push) * .6); mg.addColorStop(0, 'rgba(130,130,128,0)'); mg.addColorStop(.55, `rgba(130,130,128,${ma})`); mg.addColorStop(1, 'rgba(100,100,98,0)');
      ctx.fillStyle = mg; ctx.fillRect(-W, my - H * .09, W * 3, H * .18);
      ctx.globalAlpha = ma * .8; ctx.drawImage(B.clouds[0], -W * .4 + (t * 14) % (W * .4), my - H * .06, W * 2, H * .09); ctx.globalAlpha = 1; }
    // --- the near ridge: the women standing far off, close together, leaning on one another; dry grass in the wind
    layer(1.8);
    { const fv = lerp(1, .78, q), ridge = new Path2D(); ridge.moveTo(-W, H * 2); for (let x = -W; x <= W * 2; x += 8) ridge.lineTo(x, ridgeY(x)); ridge.lineTo(W * 2, H * 2); ridge.closePath();
      const fg = ctx.createLinearGradient(0, X.ridge - H * .01, 0, X.ridge + H * .32); fg.addColorStop(0, `rgb(${50 * fv | 0},${50 * fv | 0},${51 * fv | 0})`); fg.addColorStop(.4, `rgb(${38 * fv | 0},${38 * fv | 0},${39 * fv | 0})`); fg.addColorStop(1, `rgb(${28 * fv | 0},${28 * fv | 0},${29 * fv | 0})`);
      ctx.fillStyle = fg; ctx.fill(ridge); ctx.save(); ctx.clip(ridge); ctx.globalAlpha = .4 * fv; ctx.drawImage(X.tex, -W * .2, X.ridge - H * .01, W * 1.4, H * .4); ctx.restore(); ctx.globalAlpha = 1;
      const wa = 1 - ss(.5, 1.0, push);   // they pass out of frame as the camera moves in
      if (wa > 0) { ctx.globalAlpha = wa; ctx.fillStyle = '#0d0d0e';
        X.wom.forEach(([fx, hk, ln], i) => { const x = W * fx; woman(ctx, x, ridgeY(x) + 2, X.wh * hk, ln, i * 1.9, t, i === 1 || i === 3 ? 1 : 0); });
        { const [a, b] = [X.wom[1], X.wom[2]].map(([fx, hk]) => [W * fx, ridgeY(W * fx) + 2 - X.wh * hk * .72]); ctx.lineWidth = X.wh * .07; ctx.strokeStyle = '#0d0d0e'; ctx.lineCap = 'round';   // an arm round another's shoulders
          ctx.beginPath(); ctx.moveTo(b[0] - X.wh * .1, b[1] + X.wh * .04); ctx.quadraticCurveTo((a[0] + b[0]) / 2, Math.min(a[1], b[1]) - X.wh * .03, a[0] + X.wh * .06, a[1] + X.wh * .02); ctx.stroke(); }
        ctx.globalAlpha = 1; } }
    ctx.strokeStyle = '#141415'; ctx.lineCap = 'round';
    for (const gb of X.grass) { const y = ridgeY(gb.x) + 2, sw = Math.sin(t * 1.6 + gb.b) * .12 + (noise(t * .7 + gb.b, 1) - .5) * .25 + .15;
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gb.x, y); ctx.quadraticCurveTo(gb.x + gb.l * gb.h * .1, y - gb.h * .6, gb.x + gb.h * sw + gb.l * gb.h * .15, y - gb.h); ctx.stroke(); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // --- the end: everything sinks into the dark, one point of light stays where the gap was
    if (endk > 0) {
      ctx.fillStyle = `rgba(0,0,0,${.86 * endk})`; ctx.fillRect(0, 0, W, H);
      const pa = ss(8.9, 9.8, u), pr2 = (V ? W : H) * lerp(.16, .05, endk);
      ctx.globalCompositeOperation = 'screen';
      const pg = ctx.createRadialGradient(gp[0], gp[1], 0, gp[0], gp[1], pr2);
      pg.addColorStop(0, `rgba(255,244,222,${pa})`); pg.addColorStop(.08, `rgba(255,232,196,${.8 * pa})`); pg.addColorStop(.35, `rgba(220,200,170,${.22 * pa})`); pg.addColorStop(1, 'rgba(200,180,150,0)');
      ctx.fillStyle = pg; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    const wr = (V ? W * .55 : H * .7) * lerp(.6, 1.1, q) * lerp(1, .4, endk);
    finish(ctx, t, { halo: .38 + .14 * q, warm: [gp[0], gp[1] + (V ? H * .12 : H * .15) * (1 - endk), wr, .35 * (.4 + .6 * q)], vig: .6 });
  }
  bwCross.point = u => { buildBW(); const push = u < 3.9 ? .15 * (u / 3.9) : .15 + 1.37 * eio((u - 3.9) / 6.3) + .026 * (u - 3.9), pr = clamp(push / 1.6);
    return [lerp(X.gap0[0], X.gap1[0], eio(pr)), lerp(X.gap0[1], X.gap1[1], eio(pr))]; };
  window.bwCross = bwCross;

  // ================================================================== bwSoldiers
  // A low camera at the foot of the cross, facing the morning sun (beyond the upper-left corner). Two legionaries squat on the
  // ground, whole figures in silhouette with a rim of light (galea, belt, sword in its scabbard, knees, sandalled feet); one holds
  // up the seamless tunic, the light coming through its weave; the other throws knucklebones (astragali) onto the ground, where
  // the cross's long shadow lies towards us.
  let S;
  function buildSoldierWorld() {
    const { W, H, V } = B, k = V ? 1 : .72, f = .72 * 1080 / 1920, inset = .08, fy = .72 * 1920 / 1080;
    // the layout is designed in portrait fractions; landscape maps it (people at 0.72 scale, near the frame's sides, the top 3.5 % cropped)
    const M = (p, side) => V ? p : [side < 0 ? p[0] * f + inset : side > 0 ? 1 - ((1 - p[0]) * f + inset) : (p[0] - .5) * f * 1.7 + .5, (p[1] - .035) * fy];
    const yh = H * M([0, .43])[1], ym = H * .75, D = ym - yh, sMin = V ? .24 : .3, sMax = (H - yh) / D;
    S = { k, yh, ym, D, sMin };
    // the ground plate (half resolution), in plan coordinates: x across, P into depth (screen row y ↔ P = ym + D·ln((y − yh)/D))
    const hw = (W / 2) / sMin + 80, P0 = ym + D * Math.log(sMin) - 40, P1 = ym + D * Math.log(sMax) + 40;
    S.px0 = W / 2 - hw; S.P0 = P0; const GW = Math.ceil(hw * 2 / 2), GH = Math.ceil((P1 - P0) / 2);
    const gc = canvas(GW, GH), g = gc.getContext('2d'); g.scale(.5, .5); g.translate(-S.px0, -P0);
    const toPlan = (x, y) => { const s = (y - yh) / D; return [W / 2 + (x - W / 2) / s, ym + D * Math.log(s)]; };
    { const lw = GW >> 1, lh = GH >> 1, lo = canvas(lw, lh), lg = lo.getContext('2d'), im = lg.createImageData(lw, lh);
      for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) { const n = fbm(x * .02, y * .05, 4), n2 = fbm(x * .1 + 9, y * .2, 2), v = 150 + (n - .5) * 60 + (n2 - .5) * 26, i = (y * lw + x) * 4;
        im.data[i] = v + 2; im.data[i + 1] = v; im.data[i + 2] = v - 4; im.data[i + 3] = 255; }
      lg.putImageData(im, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingQuality = 'high'; g.drawImage(lo, 0, 0, GW, GH);
      g.globalCompositeOperation = 'overlay'; g.globalAlpha = .5; g.drawImage(Pilot.speckle(GW, GH, 60, 5), 0, 0); g.restore(); }
    const sd = V ? [.42, 1] : [.36, 1], L = Math.hypot(...sd), dx = sd[0] / L, dy = sd[1] / L, px = -dy, py = dx; S.sd = sd;
    { const r = rng(12);
      for (let i = 0; i < 1400; i++) { const P = lerp(P0, P1, Math.pow(r(), .7)), x = lerp(S.px0, S.px0 + hw * 2, r()), s = (r() < .07 ? 9 + r() * 15 : 2 + r() * 6) * k, v = 120 + r() * 80;   // stones and their shadows, towards us
        g.save(); g.translate(x, P); g.fillStyle = 'rgba(34,32,30,.26)'; g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.lineTo(s * .4 + dx * s * 1.6, s * 1.5); g.lineTo(-s * .4 + dx * s * 1.6, s * 1.5); g.fill();
        const sg = g.createLinearGradient(-s, -s, s, s); sg.addColorStop(0, `rgb(${v + 70},${v + 66},${v + 58})`); sg.addColorStop(.3, `rgb(${v - 30},${v - 30},${v - 32})`); sg.addColorStop(1, `rgb(${v - 70},${v - 70},${v - 72})`);
        g.fillStyle = sg; g.beginPath(); g.ellipse(0, 0, s, s * .62, 0, 0, 6.283); g.fill(); g.restore(); }
      for (let i = 0; i < 70; i++) { const x = lerp(S.px0, S.px0 + hw * 2, r()), P = lerp(P0, P1, r()); g.strokeStyle = 'rgba(60,56,50,.6)'; g.lineWidth = 2;   // dry weeds
        for (let j = 0; j < 5; j++) { const a = -Math.PI / 2 + (r() - .5) * 1.7, l = (10 + r() * 22) * k; g.beginPath(); g.moveTo(x, P); g.quadraticCurveTo(x + Math.cos(a) * l * .5, P + Math.sin(a) * l * .2, x + Math.cos(a) * l, P + Math.sin(a) * l * .3); g.stroke(); } } }
    // the cross's shadow — it stands just out of frame to the left, the sun beyond it — with the body's shadow on it, laid towards us
    { const sc = canvas(GW, GH), s2 = sc.getContext('2d'); s2.scale(.5, .5); s2.translate(-S.px0, -P0); s2.fillStyle = '#000';
      const C = toPlan(V ? W * .36 : W * .35, H * .735), uw = 150 * k, dCb = 1500 * k, f0 = [C[0] - dx * dCb, C[1] - dy * dCb], at = v => [f0[0] + dx * v, f0[1] + dy * v];
      const quad = (a, b, w0, w1) => { const [ax, ay] = at(a), [bx, by] = at(b); s2.beginPath(); s2.moveTo(ax + px * w0, ay + py * w0); s2.lineTo(bx + px * w1, by + py * w1); s2.lineTo(bx - px * w1, by - py * w1); s2.lineTo(ax - px * w0, ay - py * w0); s2.fill(); };
      quad(dCb - uw * (V ? 5.6 : 6.5), dCb + uw * 2.2, uw / 2, uw / 2);
      quad(dCb - uw * 3.4, dCb - uw * 1.6, uw * .5, uw * .64); quad(dCb - uw * 1.6, dCb - uw * .3, uw * .72, uw * .78);
      { const [cx, cy] = at(dCb), bw = uw * .72, bl = uw * 3.6;
        s2.beginPath(); s2.moveTo(cx + px * bl - dx * bw / 2, cy + py * bl - dy * bw / 2); s2.lineTo(cx + px * bl + dx * bw / 2, cy + py * bl + dy * bw / 2); s2.lineTo(cx - px * bl + dx * bw / 2, cy - py * bl + dy * bw / 2); s2.lineTo(cx - px * bl - dx * bw / 2, cy - py * bl - dy * bw / 2); s2.fill();
        for (const sg of [1, -1]) { s2.beginPath(); s2.moveTo(cx + px * sg * bl * .9, cy + py * sg * bl * .9); s2.quadraticCurveTo(cx + px * sg * bl * .45 - dx * uw * .75, cy + py * sg * bl * .45 - dy * uw * .75, cx + px * sg * uw * .5 - dx * uw * .6, cy + py * sg * uw * .5 - dy * uw * .6);
          s2.lineTo(cx + px * sg * uw * .5 - dx * uw * .15, cy + py * sg * uw * .5 - dy * uw * .15); s2.lineTo(cx + px * sg * bl * .9 + dx * uw * .2, cy + py * sg * bl * .9 + dy * uw * .2); s2.fill(); } }
      { const [hx, hy] = at(dCb + uw * .62); s2.beginPath(); s2.ellipse(hx - px * uw * .12, hy - py * uw * .12, uw * .33, uw * .4, Math.atan2(dy, dx), 0, 6.283); s2.fill(); }
      const sb = canvas(GW, GH), b2 = sb.getContext('2d'); b2.filter = 'blur(5px)'; b2.drawImage(sc, 0, 0);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .62; g.drawImage(sb, 0, 0); g.restore(); }
    S.G = gc; S.Gb = canvas(GW >> 1, GH >> 1); { const b = S.Gb.getContext('2d'); b.filter = 'blur(2.5px)'; b.drawImage(gc, 0, 0, GW >> 1, GH >> 1); }
    // the tunic, held up by the back of its neck: the shoulders fall to either side, short wide sleeves hang with their openings, the
    // body falls straight to the hem; one piece, woven without seam (Jn 19:23) — the weave shows in the light coming through it
    { const tw = 400 * k, th = tw * 1.5, pad = 24, tc = canvas(Math.ceil(tw + pad * 2), Math.ceil(th + pad * 2)), t2 = tc.getContext('2d'), r = rng(31), cx = tc.width / 2, U = (a, b) => [cx + a * tw, pad + b * tw];
      const p = new Path2D(), mv = (a, b) => p.moveTo(...U(a, b)), ln = (a, b) => p.lineTo(...U(a, b)), bz = (a, b, c, d, e, f2) => p.bezierCurveTo(...U(a, b), ...U(c, d), ...U(e, f2));
      mv(0, 0); bz(-.07, .03, -.18, .11, -.27, .2);
      bz(-.34, .25, -.41, .28, -.44, .34); bz(-.47, .42, -.49, .5, -.48, .57);     // over the sleeve to its end
      bz(-.44, .6, -.38, .6, -.34, .58); bz(-.32, .52, -.3, .47, -.28, .43);       // the sleeve's opening, up into the armpit
      bz(-.31, .75, -.38, 1.1, -.41, 1.45);                                         // the side, flaring to the hem
      for (let i = 1; i <= 14; i++) ln(-.41 + .82 * i / 14, 1.45 + Math.sin(i * 1.9) * .018 + (i % 3) * .006 - Math.sin(i / 14 * Math.PI) * .02);
      bz(.38, 1.1, .31, .75, .28, .43); bz(.3, .47, .32, .52, .34, .58); bz(.38, .6, .44, .6, .48, .57);
      bz(.49, .5, .47, .42, .44, .34); bz(.41, .28, .34, .25, .27, .2); bz(.18, .11, .07, .03, 0, 0); p.closePath();
      t2.save(); t2.clip(p);
      const lg = t2.createRadialGradient(...U(-.3, .2), 0, ...U(0, .5), th); lg.addColorStop(0, 'rgb(240,235,224)'); lg.addColorStop(.5, 'rgb(204,198,186)'); lg.addColorStop(1, 'rgb(150,144,134)');
      t2.fillStyle = lg; t2.fillRect(0, 0, tc.width, tc.height);
      for (let y = 0; y < tc.height; y += 3) { t2.fillStyle = `rgba(80,74,66,${.07 + .04 * r()})`; t2.fillRect(0, y, tc.width, 1.1); }     // the weave, unbroken: no seam anywhere
      for (let x = 0; x < tc.width; x += 3) { t2.fillStyle = `rgba(80,74,66,${.05 + .03 * r()})`; t2.fillRect(x, 0, 1, tc.height); }
      const fold = (pts, w, dark) => { t2.filter = `blur(${dark ? 7 : 3}px)`; t2.strokeStyle = dark ? `rgba(60,54,46,${.35 + r() * .2})` : 'rgba(255,252,242,.5)'; t2.lineWidth = w; t2.beginPath(); t2.moveTo(...U(...pts[0])); t2.bezierCurveTo(...U(...pts[1]), ...U(...pts[2]), ...U(...pts[3])); t2.stroke(); };
      for (const m of [-1, 1]) { fold([[m * .1, .07], [m * .16, .12], [m * .2, .15], [m * .28, .2]], 12 * k, true); fold([[m * .12, .14], [m * .16, .22], [m * .19, .3], [m * .22, .44]], 16 * k, true);   // drapes from the pinch
        fold([[m * .02, .05], [m * .09, .15], [m * .12, .22], [m * .17, .36]], 7 * k, false); fold([[m * .36, .3], [m * .4, .38], [m * .42, .46], [m * .43, .55]], 12 * k, true); }
      for (let i = 0; i < 7; i++) { const x0 = -.24 + i * .08 + (r() - .5) * .03; fold([[x0 * .5, .35], [x0 * .8, .7], [x0 * 1.1, 1.05], [x0 * 1.3, 1.42]], (14 + r() * 14) * k, true); fold([[x0 * .5 + .02, .37], [x0 * .8 + .02, .7], [x0 * 1.1 + .025, 1.05], [x0 * 1.3 + .025, 1.42]], 5 * k, false); }
      t2.filter = 'none';
      for (const m of [-1, 1]) { t2.fillStyle = 'rgba(60,54,46,.55)'; t2.beginPath(); t2.ellipse(...U(m * .41, .59), .07 * tw, .016 * tw, m * -.25, 0, 6.283); t2.fill(); }   // into the sleeves
      t2.fillStyle = 'rgba(96,88,78,.75)'; t2.beginPath(); t2.moveTo(...U(-.1, .03)); t2.bezierCurveTo(...U(-.07, .085), ...U(.07, .085), ...U(.1, .03)); t2.bezierCurveTo(...U(.05, .05), ...U(-.05, .05), ...U(-.1, .03)); t2.fill();   // the neck opening
      t2.strokeStyle = 'rgba(255,250,236,.55)'; t2.lineWidth = 2; t2.beginPath(); t2.moveTo(...U(-.1, .033)); t2.bezierCurveTo(...U(-.07, .09), ...U(.07, .09), ...U(.1, .033)); t2.stroke();
      t2.restore();
      t2.save(); t2.clip(p); t2.strokeStyle = 'rgba(255,252,240,.7)'; t2.lineWidth = 3; t2.filter = 'blur(1.5px)'; t2.translate(3, 4); t2.stroke(p); t2.filter = 'none'; t2.restore();   // light round its edge
      t2.strokeStyle = 'rgba(60,54,46,.45)'; t2.lineWidth = 1.5; t2.stroke(p);
      S.tunic = tc; S.tunicPin = [cx, pad]; }
    S.t1 = canvas(W, H); S.t2 = canvas(W, H);
    const r = rng(5); S.motes = []; for (let i = 0; i < 30; i++) S.motes.push({ x: r(), y: r() * .55, r: 3 + r() * 10, v: .004 + r() * .012, p: r() * 6.28 });
    // the figures (heel on the ground = origin) and where the knucklebones come to rest
    S.sc = .74 * k;
    S.L = { O: M([.25, .6], -1), T0: M([.43, .462], -1), T1: M([.47, .5], -1) };
    S.R = { O: M([.75, .6], 1), T: M([.6, .225], 1) };
    S.land = [M([.455, .588], 0), M([.54, .598], 0), M([.61, .586], 0)];
  }

  // a smooth closed outline through points (Catmull-Rom)
  function smooth(g, pts) { const n = pts.length; g.beginPath(); g.moveTo(...pts[0]);
    for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
    g.closePath(); g.fill(); }
  // a limb: tapered, round at both ends
  function capsule(g, a, b, w0, w1) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    g.beginPath(); g.moveTo(a[0] + nx * w0 / 2, a[1] + ny * w0 / 2); g.lineTo(b[0] + nx * w1 / 2, b[1] + ny * w1 / 2); g.lineTo(b[0] - nx * w1 / 2, b[1] - ny * w1 / 2); g.lineTo(a[0] - nx * w0 / 2, a[1] - ny * w0 / 2); g.fill();
    g.beginPath(); g.arc(a[0], a[1], w0 / 2, 0, 6.283); g.fill(); g.beginPath(); g.arc(b[0], b[1], w1 / 2, 0, 6.283); g.fill();
  }
  // two-bone arm: shoulder → elbow → wrist, bone lengths kept; the elbow bends downwards
  function ik(sh, tg, L1, L2) {
    const dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), L1 + L2 - 1e-3), a = Math.atan2(dy, dx), al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const e1 = [sh[0] + Math.cos(a + al) * L1, sh[1] + Math.sin(a + al) * L1], e2 = [sh[0] + Math.cos(a - al) * L1, sh[1] + Math.sin(a - al) * L1], el = e1[1] > e2[1] ? e1 : e2;
    const ang = Math.atan2(tg[1] - el[1], tg[0] - el[0]); return { el, wr: [el[0] + Math.cos(ang) * L2, el[1] + Math.sin(ang) * L2], ang };
  }
  // a legionary's helmeted head in profile — galea: dome, crest knob, brow ridge, cheek guard, flared neck guard
  function helmetHead(g, c, r, tilt, face) {
    g.save(); g.translate(c[0], c[1]); g.scale(face, 1); g.rotate(tilt); g.scale(r / 100, r / 100);
    g.beginPath(); g.moveTo(-112, 40); g.quadraticCurveTo(-86, 18, -80, -10); g.bezierCurveTo(-76, -88, 62, -98, 84, -22);
    g.lineTo(104, -14); g.lineTo(96, 2); g.lineTo(80, 4); g.bezierCurveTo(88, 34, 84, 62, 64, 90); g.quadraticCurveTo(44, 104, 26, 98);   // brow ridge, cheek guard
    g.lineTo(14, 128); g.lineTo(-44, 128); g.lineTo(-52, 64); g.quadraticCurveTo(-82, 56, -114, 52); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(0, -74, 12, 10, 0, 0, 6.283); g.fill(); g.fillRect(-5, -84, 10, 16);                                                    // crest knob, seated on the dome
    g.restore();
  }
  // ---- hand (back of the hand), wrist wr, pointing a; curl 0 open … 1 fist
  const FING = [[-.36, .9, .06], [-.12, 1.05, .01], [.12, 1.0, -.04], [.35, .78, -.1]];
  function handShape(g, wr, a, s, curl, mir, back, detail) {
    g.save(); g.translate(wr[0], wr[1]); g.rotate(a); if (mir) g.scale(1, -1); g.scale(s, s);
    const fw = 30; g.beginPath(); g.moveTo(6, -27); g.quadraticCurveTo(-back * .5, -fw * 1.05, -back, -fw); g.arc(-back, 0, fw, -Math.PI / 2, Math.PI / 2, true); g.quadraticCurveTo(-back * .5, fw * 1.05, 6, 27); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-4, -27); g.bezierCurveTo(24, -36, 52, -38, 66, -33); g.bezierCurveTo(78, -12, 78, 14, 66, 34); g.bezierCurveTo(46, 40, 20, 38, -4, 27); g.closePath(); g.fill();
    const fingers = [];
    FING.forEach(([o, Lf, sp]) => { let x = 62, y = o * 72, ang = sp * (1 - curl * .7); const pts = [[x, y]], wd = [17, 15.5, 14, 12];
      [.46, .3, .24].forEach((seg, j) => { const bend = curl * [1.0, 1.4, 1.1][j] * (j + 1) * .5, pr = Math.max(.12, Math.cos(Math.min(1.45, bend * (1 + curl)))); x += Math.cos(ang) * seg * Lf * 72 * pr; y += Math.sin(ang) * seg * Lf * 72 * pr; pts.push([x, y]); });
      fingers.push([pts, wd]); });
    const ta = .8 - curl * .6, tb = .3 - curl * .9, t0 = [16, 28], t1 = [t0[0] + Math.cos(ta) * 34, t0[1] + Math.sin(ta) * 34], t2 = [t1[0] + Math.cos(tb) * 28, t1[1] + Math.sin(tb) * 28];
    fingers.push([[t0, t1, t2, t2], [20, 17, 14, 14]]);
    for (const [pts, wd] of fingers) {
      g.beginPath(); for (let i = 0; i < pts.length; i++) { g.moveTo(pts[i][0] + wd[i] / 2, pts[i][1]); g.arc(pts[i][0], pts[i][1], wd[i] / 2, 0, 6.283); } g.fill();
      for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], l = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / l, ny = (x1 - x0) / l;
        g.beginPath(); g.moveTo(x0 + nx * wd[i] / 2, y0 + ny * wd[i] / 2); g.lineTo(x1 + nx * wd[i + 1] / 2, y1 + ny * wd[i + 1] / 2); g.lineTo(x1 - nx * wd[i + 1] / 2, y1 - ny * wd[i + 1] / 2); g.lineTo(x0 - nx * wd[i] / 2, y0 - ny * wd[i] / 2); g.fill(); } }
    if (detail) { g.strokeStyle = 'rgba(255,248,232,.28)'; g.lineWidth = 2; fingers.slice(1, 4).forEach(([pts, wd]) => { g.beginPath(); pts.forEach(([x, y], j) => { const yy = y - wd[j] / 2; j ? g.lineTo(x, yy) : g.moveTo(x - 8, yy); }); g.stroke(); }); }
    g.restore();
  }
  // a squatting legionary, whole, in profile (origin = heel on the ground; local units, ≈ 1000 = his height squatting).
  // Returns the wrist so the caller can hang things from it.
  function squatter(g, O, sc, face, o, det) {
    const Lp = (lx, ly) => [O[0] + face * lx * sc, O[1] + ly * sc], s = sc;
    // the far leg (a little behind and higher)
    capsule(g, Lp(-150, -300), Lp(123, -384), 118 * s, 94 * s); capsule(g, Lp(123, -384), Lp(23, -66), 94 * s, 58 * s);
    smooth(g, [Lp(-12, -16), Lp(-2, -78), Lp(52, -66), Lp(108, -36), Lp(150, -14), Lp(146, -4), Lp(-6, -2)]);
    // the sword in its scabbard on the hip, slanting back — it shows against the light behind him
    capsule(g, Lp(-190, -392), Lp(-392, -168), 32 * s, 26 * s); g.beginPath(); g.arc(...Lp(-398, -160), 22 * s, 0, 6.283); g.fill();
    capsule(g, Lp(-182, -400), Lp(-160, -424), 22 * s, 22 * s); g.beginPath(); g.arc(...Lp(-154, -432), 20 * s, 0, 6.283); g.fill();
    // the body: back, seat, belly and chest under the tunic; the belt notches the back
    smooth(g, [Lp(-130, -690), Lp(-178, -640), Lp(-222, -520), Lp(-244, -410), Lp(-252, -396), Lp(-248, -382), Lp(-262, -300), Lp(-232, -214), Lp(-150, -228), Lp(-70, -300),
               Lp(-40, -380), Lp(-30, -470), Lp(-22, -580), Lp(-48, -690)]);
    // the tunic's skirt over the thigh, its hem in a few folds
    smooth(g, [Lp(-120, -400), Lp(-40, -420), Lp(30, -410), Lp(46, -372), Lp(28, -356), Lp(8, -366), Lp(-12, -350), Lp(-40, -360), Lp(-110, -330)]);
    // the near leg: thigh to the high knee, shin, the strapped sandal
    capsule(g, Lp(-160, -290), Lp(95, -370), 128 * s, 100 * s); capsule(g, Lp(95, -370), Lp(-5, -56), 100 * s, 60 * s);
    smooth(g, [Lp(-50, -6), Lp(-62, -44), Lp(-30, -84), Lp(22, -74), Lp(74, -44), Lp(126, -20), Lp(132, -4), Lp(60, 2)]);
    // neck and helmeted head, bent towards the ground
    capsule(g, Lp(-90, -680), Lp(-64, -750), 78 * s, 72 * s);
    helmetHead(g, Lp(-55, -790), 98 * s, o.tilt, face);
    // the near arm, from the shoulder to the hand (bone lengths kept)
    const sh = Lp(-108, -632), A = ik(sh, o.T, 270 * s, 250 * s);
    capsule(g, sh, A.el, 96 * s, 80 * s); capsule(g, A.el, A.wr, 80 * s, 58 * s);
    handShape(g, A.wr, A.ang + (o.turn || 0), s * 1.75, o.curl, o.mir, 10, det);
    return { wr: A.wr, ang: A.ang, belt: [Lp(-246, -392), Lp(-40, -386)] };
  }
  // the rim of light along a silhouette's sun-side (upper-left) edges; drawFn(g, detail) fills the shapes
  function sil(ctx, drawFn, o = {}) {
    const { W, H } = B, c1 = S.t1.getContext('2d'), c2 = S.t2.getContext('2d'), s = o.rimW || 4;
    for (const c of [c1, c2]) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none'; c.clearRect(0, 0, W, H); }
    c1.fillStyle = o.fill || '#1c1b1a'; let ret = drawFn(c1, true);
    c2.fillStyle = '#fff'; drawFn(c2, false); c2.globalCompositeOperation = 'destination-out'; c2.save(); c2.translate(s * .8, s); drawFn(c2, false); c2.restore();
    c2.globalCompositeOperation = 'source-in'; c2.fillStyle = o.rim || 'rgba(255,248,232,.92)'; c2.fillRect(0, 0, W, H);
    c1.globalCompositeOperation = 'source-atop'; c1.drawImage(S.t2, 0, 0);
    ctx.drawImage(S.t1, 0, 0); return ret;
  }
  // a knucklebone (astragalus, a sheep's ankle bone — what soldiers cast lots with): an irregular, waisted little bone; its four
  // sides land differently (hollow, rounded, flat, twisted)
  function bone(g, x, y, s, rot, face, hgt, roll) {
    g.save(); g.fillStyle = `rgba(16,14,12,${.55 - Math.min(.4, hgt / 120)})`; g.translate(x + hgt * .3, y + s * .1);   // its shadow, long towards us
    g.beginPath(); g.ellipse(S.sd[0] * s * .5, s * .35, s * .55, s * .3, .3, 0, 6.283); g.fill(); g.restore();
    g.save(); g.translate(x, y - hgt); g.rotate(rot); g.scale(1, .55 + .35 * Math.abs(Math.cos(roll)));
    const P = new Path2D(); P.moveTo(-.5 * s, -.16 * s); P.bezierCurveTo(-.3 * s, -.34 * s, -.1 * s, -.2 * s, 0, -.22 * s); P.bezierCurveTo(.12 * s, -.26 * s, .34 * s, -.34 * s, .52 * s, -.14 * s);
    P.bezierCurveTo(.64 * s, 0, .58 * s, .2 * s, .46 * s, .22 * s); P.bezierCurveTo(.26 * s, .26 * s, .12 * s, .1 * s, 0, .14 * s); P.bezierCurveTo(-.14 * s, .18 * s, -.32 * s, .3 * s, -.5 * s, .2 * s);
    P.bezierCurveTo(-.64 * s, .1 * s, -.62 * s, -.08 * s, -.5 * s, -.16 * s); P.closePath();
    g.save(); g.translate(0, s * .1); g.fillStyle = '#5a544a'; g.fill(P); g.restore();                         // its underside, in shade
    const bg = g.createLinearGradient(-s * .4, -s * .3, s * .4, s * .3); bg.addColorStop(0, '#f6efdc'); bg.addColorStop(.6, '#c8bea8'); bg.addColorStop(1, '#8a8070');
    g.fillStyle = bg; g.fill(P); g.strokeStyle = 'rgba(50,44,36,.55)'; g.lineWidth = 1.2; g.stroke(P);
    g.fillStyle = 'rgba(70,62,50,.7)'; g.strokeStyle = 'rgba(70,62,50,.75)'; g.lineWidth = Math.max(1.2, s * .05);
    if (face === 0) { g.beginPath(); g.ellipse(0, 0, s * .16, s * .08, 0, 0, 6.283); g.fill(); }                 // the hollow side
    else if (face === 1) { g.beginPath(); g.moveTo(-s * .3, -s * .05); g.quadraticCurveTo(0, s * .12, s * .32, -s * .04); g.stroke(); }
    else if (face === 2) { g.beginPath(); g.arc(s * .2, -s * .02, s * .05, 0, 6.283); g.fill(); g.beginPath(); g.arc(-s * .22, s * .02, s * .04, 0, 6.283); g.fill(); }
    else { g.beginPath(); g.moveTo(-s * .34, s * .06); g.bezierCurveTo(-s * .1, -s * .14, s * .1, s * .16, s * .34, -s * .06); g.stroke(); }
    g.fillStyle = 'rgba(255,250,236,.55)'; g.beginPath(); g.ellipse(-s * .22, -s * .16, s * .12, s * .04, -.3, 0, 6.283); g.fill();   // the light on its top
    g.restore();
  }
  // a bone's flight in screen space: out of the hand, two bounces, then still
  function bonePos(u, from, to, t0, t1, seed, last) {
    const p = clamp((u - t0) / (t1 - t0)), r = rng(seed * 101), { H } = B;
    const e = 1 - Math.pow(1 - p, 2), x = lerp(from[0], to[0], e), yg = lerp(from[1] + H * .05, to[1], Math.pow(p, .6));
    const hgt = (p < .4 ? (1 - p / .4) * H * .05 + Math.sin(p / .4 * Math.PI) * H * .02 : p < .72 ? Math.sin((p - .4) / .32 * Math.PI) * H * .02 : p < .9 ? Math.sin((p - .72) / .18 * Math.PI) * H * .006 : 0);
    const bounce = p < .4 ? 0 : p < .72 ? 1 : p < .9 ? 2 : 3, faces = [r() * 4 | 0, r() * 4 | 0, r() * 4 | 0, last];
    return { x, y: yg, hgt, face: faces[bounce], rot: (1 - e) * (6 + r() * 4) + r() * 2, roll: (1 - e) * (14 + r() * 6), p };
  }

  function bwSoldiers(ctx, u) {
    buildBW(); const { W, H, V } = B, t = 114 + u, k = S.k;
    const z = 1 + .06 * eio(u / 6.2), lean = ss(1.9, 3.3, u), cam = lerp(16, -12, u / 6.2) * k + lean * 10;
    const wv = rng(Math.floor(t * 24) + 2), jx = (wv() - .5) * 1.6, jy = (wv() - .5) * 1.6, zc = [W * .5, H * (V ? .5 : .55)];
    ctx.save(); ctx.setTransform(z, 0, 0, z, zc[0] - zc[0] * z + jx, zc[1] - zc[1] * z + jy);
    // sky: morning haze, the sun beyond the upper-left corner
    { const sg = ctx.createLinearGradient(0, 0, W, S.yh); sg.addColorStop(0, 'rgb(226,222,212)'); sg.addColorStop(.5, 'rgb(170,168,162)'); sg.addColorStop(1, 'rgb(120,120,118)'); ctx.fillStyle = 'rgb(150,148,142)'; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.fillStyle = sg; ctx.fillRect(-W, -H, W * 3, S.yh + H + 4);
      ctx.globalAlpha = .35; ctx.drawImage(B.clouds[0], -W * .3 + (t * 6) % (W * .3), -H * .05, W * 1.8, S.yh); ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(150,148,142,.8)'; ctx.beginPath(); ctx.moveTo(-W, S.yh + 2); for (let x = -W * .2; x <= W * 1.2; x += 14) ctx.lineTo(x - cam * .2, S.yh - H * .012 - (fbm(x * .004, 3.3, 3) - .4) * H * .03); ctx.lineTo(W * 2, S.yh + 2); ctx.fill();   // far hills
      const wx0 = W * (V ? .38 : .5), wx1 = W * (V ? .7 : .78), wy = S.yh - H * .012; ctx.fillStyle = 'rgba(128,126,122,.75)'; ctx.beginPath(); ctx.moveTo(wx0, wy + 6);   // the city wall, far off in the haze
      for (let x = wx0; x < wx1; x += H * .007) { const tw = Math.abs(x - lerp(wx0, wx1, .3)) < H * .01 ? H * .016 : 0; ctx.lineTo(x, wy - H * .011 - tw); ctx.lineTo(x + H * .004, wy - H * .011 - tw); ctx.lineTo(x + H * .004, wy - H * .008 - tw); ctx.lineTo(x + H * .007, wy - H * .008 - tw); }
      ctx.lineTo(wx1, wy + 6); ctx.fill(); }
    // the ground in perspective, row by row; the far rows in haze, the near rows out of focus
    { const step = 3, y0 = Math.floor(S.yh + S.D * S.sMin), focus = S.land[0][1] * H;
      for (let y = y0; y < H; y += step) {
        const s = (y + step / 2 - S.yh) / S.D, Pa = S.ym + S.D * Math.log((y - S.yh) / S.D), Pb = S.ym + S.D * Math.log((y + step - S.yh) / S.D);
        const x0 = W / 2 + cam - (W / 2) / s, sw = W / s, gx = (x0 - S.px0) / 2, gy = (Pa - S.P0) / 2, gh = (Pb - Pa) / 2;
        ctx.drawImage(S.G, gx, gy, sw / 2, gh, -2, y, W + 4, step + .6);
        const b = Math.pow(clamp((y - focus) / (H - focus)), 1.3); if (b > .05) { ctx.globalAlpha = b; ctx.drawImage(S.Gb, gx / 2, gy / 2, sw / 4, gh / 2, -2, y, W + 4, step + .6); ctx.globalAlpha = 1; }
      }
      const hz = ctx.createLinearGradient(0, S.yh - 2, 0, y0 + H * .06); hz.addColorStop(0, 'rgb(150,148,142)'); hz.addColorStop(.45, 'rgba(150,148,142,.75)'); hz.addColorStop(1, 'rgba(150,148,142,0)');
      ctx.fillStyle = hz; ctx.fillRect(-W, S.yh - 2, W * 3, y0 - S.yh + H * .06 + 2); }
    const P = (p, sx = 1.15) => [p[0] * W + cam * sx, p[1] * H], sc = S.sc;
    // the right soldier holds up the tunic by the back of its neck
    const sway = Math.sin(t * 1.1) * .025 + (noise(t * .6, 8) - .5) * .04, lift = ss(4.6, 6.2, u), RT = P(S.R.T); RT[1] -= lift * H * .008;
    { const O = P(S.R.O), sh = [O[0] + 108 * sc, O[1] - 632 * sc], A = ik(sh, RT, 270 * sc, 250 * sc), fist = [A.wr[0] + Math.cos(A.ang) * 40 * sc * 1.75, A.wr[1] + Math.sin(A.ang) * 40 * sc * 1.75];
      ctx.save(); ctx.translate(fist[0], fist[1]); ctx.rotate(sway); ctx.drawImage(S.tunic, -S.tunicPin[0], -S.tunicPin[1]); ctx.restore(); }
    // the knucklebones: shaken in the left soldier's fist, thrown at 1.9, at rest by ≈ 2.8; dust where they land
    const Lw = uu => { const w0 = P(S.L.T0), w1 = P(S.L.T1), wind = ss(1.35, 1.72, uu) * (1 - ss(1.72, 1.92, uu)), swing = ss(1.72, 1.92, uu), rat = uu < 1.4 ? Math.sin(uu * 40) * 5 * k * (1 - uu / 1.6) : 0, after = ss(3.4, 4.8, uu);
      return [lerp(w0[0], w1[0], swing) - wind * 34 * k + rat + after * 24 * k, lerp(w0[1], w1[1], swing) - wind * 30 * k + rat * .4 + after * 12 * k]; };
    const rel = Lw(1.9); rel[0] += 70 * sc; rel[1] += 10 * sc;
    const BN = [[1.9, 2.62, 1, 0], [1.92, 2.8, 2, 2], [1.95, 2.72, 3, 1]].map(([t0, t1, sd, last], i) => ({ a: [rel, P(S.land[i], 1), t0, t1, sd, last] }));
    if (u > 1.88) for (const b of BN) { const d = bonePos(u, ...b.a), sz = 96 * k * ((d.y - S.yh) / S.D);
      if (d.p < .5) { const dp = bonePos(u - .03, ...b.a); ctx.globalAlpha = .28; bone(ctx, dp.x, dp.y, sz, dp.rot, dp.face, dp.hgt, dp.roll); ctx.globalAlpha = 1; }
      bone(ctx, d.x, d.y, sz, d.rot, d.face, d.hgt, d.roll); }
    BN.forEach((b, i) => { const a = clamp((u - b.a[3] + .35) / 1.3); if (a > 0 && a < 1) { const r = rng(9 + i * 7), [x, y] = b.a[1], s = (y - S.yh) / S.D;
        for (let j = 0; j < 14; j++) { const an = r() * 6.283, rr = (10 + r() * 46) * eo(a) * k * s; ctx.fillStyle = `rgba(232,226,212,${.32 * (1 - a)})`; ctx.beginPath(); ctx.arc(x + Math.cos(an) * rr, y + Math.sin(an) * rr * .35 - a * 20 * s, (3 + r() * 6) * k * s, 0, 6.283); ctx.fill(); } } });
    // the two soldiers
    let beltR, beltL;
    sil(ctx, (g, det) => { const o = squatter(g, P(S.R.O), sc, -1, { T: RT, curl: 1, mir: true, tilt: .2 + sway * .5 }, det); beltR = o.belt; }, { rimW: 4.5 * k });
    const lw = Lw(u), cL = (() => { let c = lerp(.92, .06, ss(1.8, 1.92, u)); c = lerp(c, .35, ss(3.4, 4.8, u)); if (u < 1.4) c -= .04 * Math.abs(Math.sin(u * 40)); return clamp(c); })();
    sil(ctx, (g, det) => { const o = squatter(g, P(S.L.O), sc, 1, { T: lw, curl: cL, mir: false, tilt: .32 - lean * .06, turn: ss(1.72, 1.92, u) * .2 }, det); beltL = o.belt; }, { rimW: 4.5 * k });
    for (const bl of [beltL, beltR]) { ctx.strokeStyle = 'rgba(214,204,182,.14)'; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(...bl[0]); ctx.lineTo(...bl[1]); ctx.stroke();   // the belt's metal plates catch a little light
      ctx.fillStyle = 'rgba(230,220,196,.3)'; for (let i = 2; i < 5; i += 2) { ctx.beginPath(); ctx.arc(lerp(bl[0][0], bl[1][0], i / 6), lerp(bl[0][1], bl[1][1], i / 6), 2.6 * k, 0, 6.283); ctx.fill(); } }
    ctx.restore();
    // light: glare from the sun beyond the corner, dust turning in the air
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen';
    { const sx = -W * .05, sy = -H * .06, R0 = Math.max(W, H) * .8, sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, R0); sg.addColorStop(0, 'rgba(255,250,236,.85)'); sg.addColorStop(.25, 'rgba(240,236,224,.3)'); sg.addColorStop(1, 'rgba(200,198,190,0)');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      for (const m of S.motes) { const x = ((m.x + t * m.v) % 1) * W, y = (m.y + Math.sin(t * .5 + m.p) * .02) * H, a = .2 * (1 - m.y / .55) * (.6 + .4 * Math.sin(t * 2 + m.p)), rr = m.r * k;
        const mg = ctx.createRadialGradient(x, y, 0, x, y, rr); mg.addColorStop(0, `rgba(255,250,236,${a})`); mg.addColorStop(1, 'rgba(255,250,236,0)'); ctx.fillStyle = mg; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2); } }
    ctx.globalCompositeOperation = 'source-over';
    { const bg = ctx.createLinearGradient(0, H * (V ? .6 : .7), 0, H); bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(.3, 'rgba(0,0,0,.42)'); bg.addColorStop(1, 'rgba(0,0,0,.6)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    const lt = ss(5.2, 6.2, u);   // a breath more light at the end (the next part: dawn)
    finish(ctx, t, { halo: .32 + .12 * lt, grain: .4, vig: .6 - .1 * lt, warm: [W * .1, H * .05, Math.max(W, H) * .8, .16 + .2 * lt], flicker: .08 });
  }
  window.bwSoldiers = bwSoldiers;
})();
