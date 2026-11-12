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
      const a = clamp((n - th) * 2.6) * (.75 + .25 * m) * ss(0, .22, v) * (1 - ss(.55, 1, v)), c0 = lo + (hi - lo) * clamp((n - .25) * 1.6) * (1 - v * .25), i = (y * w + x) * 4;
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
              wom: [[.04, 1, -.02], [.07, .93, .1], [.098, .97, -.04], [.128, .9, .07], [.152, .86, .02]], end: [W * .5, H * .36], gap0: [W * .58, H * .155], gap1: [W * .52, H * .14] }
          : { cx: W * .56, cy: H * .43, A: H * .2, sig: W * .27, hc: H * .21, sp: W * .085, hor: H * .5, ridge: H * .735, wh: H * .12,
              wom: [[.15, 1, -.02], [.168, .93, .1], [.185, .97, -.04], [.204, .9, .07], [.219, .86, .02]], end: [W * .5, H * .4], gap0: [W * .64, H * .12], gap1: [W * .57, H * .11] };
    const r = rng(77);
    // a rough crest: rock and scree, not a smooth dome
    X.boul = []; for (let i = 0; i < 18; i++) X.boul.push([X.cx + (r() * 2 - 1) * X.sig * 2, (V ? W : H) * (.012 + r() * .03), H * (.003 + r() * .011) * (r() < .8 ? 1 : -.6)]);
    X.crest = x => { let y = X.cy + X.A * (1 - Math.exp(-Math.pow((x - X.cx) / X.sig, 2))) + (fbm(x * .006 + 3, 1.7, 3) - .5) * H * .016
                 + (noise(x * .035, 5.5) - .5) * H * .01 + Math.abs(noise(x * .09, 2.2) - .5) * H * .006;
      for (const [bx, bw, ba] of X.boul) { const d = (x - bx) / bw; if (d * d < 1) y -= ba * Math.sqrt(1 - d * d); } return y; };
    X.F = [X.cx, X.cy - X.hc * .58];
    X.tufts = []; for (let i = 0; i < 106; i++) { const x = X.cx + (r() * 2 - 1) * X.sig * 2, d = i < 70 ? 0 : Math.pow(r(), 1.5) * X.A * 1.1; if (!d && (Math.abs(x - X.cx) < W * .02 || Math.abs(Math.abs(x - X.cx) - X.sp) < W * .015)) continue; X.tufts.push({ x, d, h: (V ? W : H) * (.008 + r() * .016) * (d ? .45 + r() * .4 : 1), b: r() * 6.28, n: d ? 1 + (r() * 3 | 0) : 2 }); }
    // the hill's relief, baked: gullies running down it, the lit lips of ledges, outcrops of rock
    { const x0 = X.cx - X.sig * 2.3, y0 = X.cy - H * .04, rw = Math.ceil(X.sig * 4.6), rh = Math.ceil(X.A * 1.6 + H * .1); X.relief = canvas(rw, rh); X.reliefAt = [x0, y0];
      const g = X.relief.getContext('2d'), rr = rng(19); g.translate(-x0, -y0); g.lineCap = 'round'; g.lineJoin = 'round';
      for (let i = 0; i < 22; i++) { let x = X.cx + (rr() * 2 - 1) * X.sig * 2, y = X.crest(x) + 3; const pts = [[x, y]], dir = Math.sign(x - X.cx) || 1;
        for (let j = 0; j < 12; j++) { x += dir * X.sig * .02 + (rr() - .5) * X.sig * .05; y += X.A * (.05 + rr() * .05); pts.push([x, y]); }
        const w = (V ? W : H) * (.005 + rr() * .01); g.filter = 'blur(4px)'; g.strokeStyle = 'rgba(8,8,8,.38)'; g.lineWidth = w; g.beginPath(); pts.forEach(([a, b], k) => k ? g.lineTo(a, b) : g.moveTo(a, b)); g.stroke();
        g.filter = 'blur(2px)'; g.strokeStyle = 'rgba(170,170,165,.16)'; g.lineWidth = w * .35; g.beginPath(); pts.forEach(([a, b], k) => k ? g.lineTo(a - w * .6, b - w * .3) : g.moveTo(a - w * .6, b - w * .3)); g.stroke(); }
      for (let i = 0; i < 30; i++) { const x = X.cx + (rr() * 2 - 1) * X.sig * 1.9, y = X.crest(x) + Math.pow(rr(), 1.4) * X.A * .9 + 6, sz = (V ? W : H) * (.012 + rr() * .03), n = 7, pts = [];
        for (let j = 0; j < n; j++) { const a = j / n * 6.283, q = .55 + rr() * .6; pts.push([x + Math.cos(a) * sz * q, y + Math.sin(a) * sz * q * .55]); }
        g.filter = 'blur(2.5px)'; g.fillStyle = 'rgba(10,10,10,.4)'; g.beginPath(); pts.forEach(([a, b], k) => k ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); g.fill();
        g.filter = 'blur(1.5px)'; g.strokeStyle = 'rgba(175,175,170,.2)'; g.lineWidth = 2; g.beginPath(); for (let j = Math.floor(n / 2); j <= n; j++) { const [a, b] = pts[j % n]; j === Math.floor(n / 2) ? g.moveTo(a, b) : g.lineTo(a, b); } g.stroke(); }
      g.filter = 'none'; }
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
    const T = yb - h * .96, bw = h * .044, by = T + h * .2, bl = h * .31, s = side;
    // the wood: a slightly tapering, uneven upright and beam
    const top = T + h * .07; g.beginPath(); g.moveTo(x - bw * .56, yb + h * .08); g.lineTo(x - bw * .47, top + h * .01); g.lineTo(x - bw * .3, top); g.lineTo(x + bw * .42, top + h * .004); g.lineTo(x + bw * .5, yb + h * .08); g.fill();
    g.beginPath(); g.moveTo(x - bl, by - h * .02); g.lineTo(x + bl, by - h * .024); g.lineTo(x + bl - h * .004, by + h * .02); g.lineTo(x - bl + h * .003, by + h * .023); g.fill();
    if (title) { g.beginPath(); g.moveTo(x - h * .075, T + h * .062); g.lineTo(x + h * .075, T + h * .06); g.lineTo(x + h * .073, T + h * .112); g.lineTo(x - h * .074, T + h * .114); g.fill(); }   // the title over his head (Jn 19:19)
    const P = (px, py) => [x + px * h * s, by + py * h], c = (a, b, w0, w1) => capsule(g, P(...a), P(...b), w0 * h, w1 * h);
    // arms drawn along the beam: hand → elbow → shoulder, sagging under the body's weight
    for (const m of [1, -1]) { smooth(g, [P(m * .27, -.013), P(m * .205, -.003), P(m * .15, .018), P(m * .1, .043), P(m * .066, .064), P(m * .05, .098), P(m * .058, .124), P(m * .1, .092), P(m * .155, .058), P(m * .21, .029), P(m * .27, .011)]);
      g.beginPath(); g.ellipse(...P(m * .281, -.002), h * .014, h * .019, 0, 0, 6.283); g.fill(); }
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
    g.beginPath(); g.moveTo(...P(-.03, .612)); g.lineTo(...P(.05, .612)); g.lineTo(...P(.05, .626)); g.lineTo(...P(-.03, .626)); g.fill();   // the footrest
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
    const dk = ss(.2, 3.9, u), sb = lerp(1.18, .8, dk) * lerp(1, .9, q) * lerp(1, .35, endk);
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
      const d = .04 + .26 * dk + .16 * q; gd.addColorStop(0, `rgba(0,0,0,${d * .1})`); gd.addColorStop(1, `rgba(0,0,0,${d})`); ctx.fillStyle = gd; ctx.fillRect(0, 0, W, H * .75); }
    // the gap: before the cry a hidden sun's dull glow; at the cry the clouds part around it and their edges catch the light
    const gapA = (.06 * (1 - dk) + q) * (1 - endk * .35), gr = (V ? W * .2 : H * .3) * lerp(.85, 1.2, q) * lerp(1, .18, endk);
    { ctx.globalCompositeOperation = 'screen'; const gg = ctx.createRadialGradient(gp[0], gp[1], 0, gp[0], gp[1], gr * 3.8);
      gg.addColorStop(0, `rgba(255,250,240,${gapA})`); gg.addColorStop(.12, `rgba(240,236,228,${.62 * gapA})`); gg.addColorStop(.4, `rgba(180,178,172,${.22 * gapA})`); gg.addColorStop(1, 'rgba(120,120,120,0)');
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
    if (q > .01 && endk < .99) { const lc = X.lit.getContext('2d'); lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, W, H); drawClouds(lc, .5);
      lc.globalCompositeOperation = 'destination-in'; const R2 = gr * 4.3 * .5, mg = lc.createRadialGradient(gp[0] * .5, gp[1] * .5, R2 * .1, gp[0] * .5, gp[1] * .5, R2); mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
      lc.fillStyle = mg; lc.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .9 * q * (1 - endk); ctx.drawImage(X.lit, 0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }   // silver edges
    // the shaft: from the gap down behind the middle cross
    const [ctx0, cty0] = scr(1, X.cx, X.cy - X.hc * .9);
    const sa = q * (1 - ss(9.0, 10.0, u)), retreat = ss(8.9, 10.1, u);
    if (sa > .003) {
      const dx = ctx0 - gp[0], dy = cty0 - gp[1], ang = Math.atan2(dy, dx) - Math.PI / 2, len = Math.hypot(dx, dy) * lerp(2.1, .2, retreat), wd = (V ? W * .68 : W * .34) * (1 + push * .25) * lerp(1, .15, retreat);
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
    layer(1);
    // three crosses
    ctx.fillStyle = '#090909'; ctx.strokeStyle = '#090909';
    crucified(ctx, X.cx - X.sp, X.crest(X.cx - X.sp) + 3, X.hc * .8, 1);
    crucified(ctx, X.cx + X.sp, X.crest(X.cx + X.sp) + 3, X.hc * .8, -1);
    crucified(ctx, X.cx, X.crest(X.cx) + 3, X.hc, 1, true);
    // --- the hill: rock, scree and dry grass, its rough crest picked out by the shaft behind it
    layer(1);
    { const hv = lerp(1, .72, q), hill = new Path2D(); hill.moveTo(-W, H * 1.5); for (let x = -W; x <= W * 2; x += 6) hill.lineTo(x, X.crest(x)); hill.lineTo(W * 2, H * 1.5); hill.closePath();
      const hg = ctx.createLinearGradient(0, X.cy, 0, X.cy + X.A * 1.4); hg.addColorStop(0, `rgb(${46 * hv | 0},${46 * hv | 0},${47 * hv | 0})`); hg.addColorStop(1, `rgb(${30 * hv | 0},${30 * hv | 0},${31 * hv | 0})`);
      ctx.fillStyle = hg; ctx.fill(hill);
      ctx.save(); ctx.clip(hill); ctx.globalAlpha = .55 * hv; ctx.drawImage(X.tex, X.cx - X.sig * 2.4, X.cy - H * .02, X.sig * 4.8, X.A * 1.6 + H * .1); ctx.globalAlpha = 1;
      ctx.globalAlpha = hv; ctx.drawImage(X.relief, X.reliefAt[0], X.reliefAt[1]); ctx.globalAlpha = 1;
      ctx.restore();
      ctx.strokeStyle = `rgb(${18 * hv | 0},${18 * hv | 0},${19 * hv | 0})`; ctx.lineCap = 'round'; ctx.lineWidth = 1.6;
      for (const tf of X.tufts) { const y = X.crest(tf.x) + 1 + tf.d, sw = Math.sin(t * 1.5 + tf.b) * .15 + .1; for (let j = -tf.n; j <= tf.n; j++) { ctx.beginPath(); ctx.moveTo(tf.x + j * 1.5, y); ctx.quadraticCurveTo(tf.x + j * 2.5, y - tf.h * .5, tf.x + j * tf.h * .3 + tf.h * sw, y - tf.h * (1 - Math.abs(j) * .15)); ctx.stroke(); } }
      if (q > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineWidth = 3; ctx.filter = 'blur(2px)'; const rg = ctx.createLinearGradient(X.cx - X.sig * .9, 0, X.cx + X.sig * .9, 0);
        rg.addColorStop(0, 'rgba(200,198,194,0)'); rg.addColorStop(.5, `rgba(235,230,222,${.45 * sa})`); rg.addColorStop(1, 'rgba(200,198,194,0)'); ctx.strokeStyle = rg;
        ctx.beginPath(); for (let x = X.cx - X.sig; x <= X.cx + X.sig; x += 4) { const y = X.crest(x) + 1.2; x === X.cx - X.sig ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); } }
    // soldiers keeping watch at the foot
    { const sh = X.hc * .24; [[-1.5, 1, 1, 0, .06], [1.52, 1, -1, 2.1, .08]].forEach(([dx, sp, fc, ph, dn]) => { const x = X.cx + X.sp * dx; sentry(ctx, x, X.crest(x) + X.hc * dn, sh * (1 + dn * .4), sp, fc, t, ph); }); }
    // --- mist lying in the valley between the hill and the near ridge
    layer(1.35);
    { const my = (X.cy + X.A * .95 + ridgeY(X.cx)) / 2, mg = ctx.createLinearGradient(0, my - H * .09, 0, my + H * .09);
      const ma = (.36 - .1 * q) * (1 - endk) * (1 - ss(.15, .9, push) * .6); mg.addColorStop(0, 'rgba(130,130,128,0)'); mg.addColorStop(.55, `rgba(130,130,128,${ma})`); mg.addColorStop(1, 'rgba(100,100,98,0)');
      ctx.fillStyle = mg; ctx.fillRect(-W, my - H * .09, W * 3, H * .18);
      ctx.globalAlpha = ma * .8; ctx.drawImage(B.clouds[0], -W * .4 + (t * 14) % (W * .4), my - H * .06, W * 2, H * .09); ctx.globalAlpha = 1; }
    // --- the near ridge: the women standing far off, close together, leaning on one another; dry grass in the wind
    layer(2.3);
    { const fv = lerp(1, .78, q), ridge = new Path2D(); ridge.moveTo(-W, H * 2); for (let x = -W; x <= W * 2; x += 8) ridge.lineTo(x, ridgeY(x)); ridge.lineTo(W * 2, H * 2); ridge.closePath();
      const fg = ctx.createLinearGradient(0, X.ridge - H * .01, 0, X.ridge + H * .32); fg.addColorStop(0, `rgb(${50 * fv | 0},${50 * fv | 0},${51 * fv | 0})`); fg.addColorStop(.4, `rgb(${38 * fv | 0},${38 * fv | 0},${39 * fv | 0})`); fg.addColorStop(1, `rgb(${28 * fv | 0},${28 * fv | 0},${29 * fv | 0})`);
      ctx.fillStyle = fg; ctx.fill(ridge); ctx.save(); ctx.clip(ridge); ctx.globalAlpha = .4 * fv; ctx.drawImage(X.tex, -W * .2, X.ridge - H * .01, W * 1.4, H * .4); ctx.restore(); ctx.globalAlpha = 1;
      if (u < 5.4) { ctx.fillStyle = '#0d0d0e';   // they pass out of frame as the camera moves in; after that they are not drawn
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
    finish(ctx, t, { halo: .38 + .2 * q, warm: [gp[0], gp[1] + (V ? H * .12 : H * .15) * (1 - endk), wr, .35 * (.4 + .6 * q)], vig: .6 });
  }
  bwCross.point = u => { buildBW(); const push = u < 3.9 ? .15 * (u / 3.9) : .15 + 1.37 * eio((u - 3.9) / 6.3) + .026 * (u - 3.9), pr = clamp(push / 1.6);
    return [lerp(X.gap0[0], X.gap1[0], eio(pr)), lerp(X.gap0[1], X.gap1[1], eio(pr))]; };
  window.bwCross = bwCross;

  // ================================================================== bwSoldiers
  // A shadow play, as black-and-white film does it. A low camera looking down at rough earth and gravel at the foot of the cross; the
  // sun is high behind the soldiers, beyond the top of the frame, so everything's shadow falls down the frame towards us. Two
  // soldiers crouch just out of frame — only their shadows lie on the ground: helmets (round crown, horsehair crest, neck guard),
  // shoulders, hunched backs, reaching arms, hands. Really on the ground: the cross's long shadow, the crumpled end of a woven cloth
  // coming in from the frame's edge, and the knucklebones (astragali). At u ≈ 1.9 one shadow hand, shaking, throws: the bones drop
  // into the frame, bounce, roll and stop. Then the other shadow hand reaches out and settles over the cloth's end.
  let S;
  function buildSoldierWorld() {
    const { W, H, V } = B, k = V ? 1 : .78;
    // looking down: the horizon is above the frame (screen row y ↔ plan depth P = ym + D·ln((y − yh)/D))
    const yh = -H * (V ? .35 : .6), ym = H * .6, D = ym - yh, sMax = (H - yh) / D, sTop = (0 - yh) / D;
    S = { k, yh, ym, D };
    const hw = (W / 2) / sTop + 120, P0 = ym + D * Math.log(sTop) - 60, P1 = ym + D * Math.log(sMax) + 60;
    S.px0 = W / 2 - hw; S.P0 = P0; const GW = Math.ceil(hw), GH = Math.ceil((P1 - P0) / 2);
    const gc = canvas(GW, GH), g = gc.getContext('2d'); g.scale(.5, .5); g.translate(-S.px0, -P0);
    const toPlan = (x, y) => { const s = (y - yh) / D; return [W / 2 + (x - W / 2) / s, ym + D * Math.log(s)]; };
    S.toPlan = toPlan;
    // rough earth and gravel, in values
    { const lw = GW >> 1, lh = GH >> 1, lo = canvas(lw, lh), lg = lo.getContext('2d'), im = lg.createImageData(lw, lh);
      for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) { const n = fbm(x * .02, y * .03, 4), n2 = fbm(x * .09 + 9, y * .12, 2), v = 146 + (n - .5) * 66 + (n2 - .5) * 30, i = (y * lw + x) * 4;
        im.data[i] = v + 2; im.data[i + 1] = v; im.data[i + 2] = v - 4; im.data[i + 3] = 255; }
      lg.putImageData(im, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingQuality = 'high'; g.drawImage(lo, 0, 0, GW, GH);
      g.globalCompositeOperation = 'overlay'; g.globalAlpha = .6; g.drawImage(Pilot.speckle(GW, GH, 70, 5), 0, 0); g.restore(); }
    { const r = rng(12);
      for (let i = 0; i < 2600; i++) { const P = lerp(P0, P1, r()), x = lerp(S.px0, S.px0 + hw * 2, r()), s = (r() < .08 ? 10 + r() * 18 : 2.5 + r() * 7) * k, v = 110 + r() * 90, a = r() * 3;   // stones, lit from beyond, shadows towards us
        g.save(); g.translate(x, P); g.fillStyle = 'rgba(30,28,26,.34)'; g.beginPath(); g.ellipse(s * .1, s * .9, s * .9, s * 1.1, 0, 0, 6.283); g.fill();
        g.rotate(a); const sg = g.createLinearGradient(0, -s, 0, s); sg.addColorStop(0, `rgb(${v + 70},${v + 66},${v + 58})`); sg.addColorStop(.35, `rgb(${v - 20},${v - 20},${v - 22})`); sg.addColorStop(1, `rgb(${v - 66},${v - 66},${v - 68})`);
        g.fillStyle = sg; g.beginPath(); for (let j = 0; j < 7; j++) { const aa = j / 7 * 6.283, rr = s * (.75 + .35 * r()); g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr * .7); } g.closePath(); g.fill(); g.restore(); }
      for (let i = 0; i < 26; i++) { const x = lerp(S.px0, S.px0 + hw * 2, r()), P = lerp(P0, P1, r()); g.strokeStyle = 'rgba(56,52,46,.45)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, P); let qx = x, qy = P;   // cracks
        for (let j = 0; j < 6; j++) { qx += (r() - .5) * 80; qy += (r() - .5) * 60; g.lineTo(qx, qy); } g.stroke(); }
      for (let i = 0; i < 60; i++) { const x = lerp(S.px0, S.px0 + hw * 2, r()), P = lerp(P0, P1, r()); g.strokeStyle = 'rgba(60,56,50,.6)'; g.lineWidth = 2;   // dry weeds
        for (let j = 0; j < 6; j++) { const a = -Math.PI / 2 + (r() - .5) * 1.7, l = (12 + r() * 26) * k; g.beginPath(); g.moveTo(x, P); g.quadraticCurveTo(x + Math.cos(a) * l * .5, P + Math.sin(a) * l * .3, x + Math.cos(a) * l, P + Math.sin(a) * l * .5); g.stroke(); } } }
    // the cross's shadow on the ground (with the body on it), laid long towards us
    { const sc = canvas(GW, GH), s2 = sc.getContext('2d'); s2.scale(.5, .5); s2.translate(-S.px0, -P0); s2.fillStyle = '#000';
      const sd = V ? [.3, 1] : [.42, 1], L = Math.hypot(...sd), dx = sd[0] / L, dy = sd[1] / L, px = -dy, py = dx;
      const C = toPlan(V ? W * .12 : W * .2, H * .76), uw = 210 * k, dCb = 2600 * k, f0 = [C[0] - dx * dCb, C[1] - dy * dCb], at = v => [f0[0] + dx * v, f0[1] + dy * v];
      const quad = (a, b, w0, w1) => { const [ax, ay] = at(a), [bx, by] = at(b); s2.beginPath(); s2.moveTo(ax + px * w0, ay + py * w0); s2.lineTo(bx + px * w1, by + py * w1); s2.lineTo(bx - px * w1, by - py * w1); s2.lineTo(ax - px * w0, ay - py * w0); s2.fill(); };
      quad(0, dCb + uw * 2.2, uw / 2, uw / 2);
      quad(dCb - uw * 3.4, dCb - uw * 1.6, uw * .5, uw * .64); quad(dCb - uw * 1.6, dCb - uw * .3, uw * .72, uw * .78);
      { const [cx, cy] = at(dCb), bw = uw * .72, bl = uw * 3.6;
        s2.beginPath(); s2.moveTo(cx + px * bl - dx * bw / 2, cy + py * bl - dy * bw / 2); s2.lineTo(cx + px * bl + dx * bw / 2, cy + py * bl + dy * bw / 2); s2.lineTo(cx - px * bl + dx * bw / 2, cy - py * bl + dy * bw / 2); s2.lineTo(cx - px * bl - dx * bw / 2, cy - py * bl - dy * bw / 2); s2.fill();
        for (const sg of [1, -1]) { s2.beginPath(); s2.moveTo(cx + px * sg * bl * .9, cy + py * sg * bl * .9); s2.quadraticCurveTo(cx + px * sg * bl * .45 - dx * uw * .75, cy + py * sg * bl * .45 - dy * uw * .75, cx + px * sg * uw * .5 - dx * uw * .6, cy + py * sg * uw * .5 - dy * uw * .6);
          s2.lineTo(cx + px * sg * uw * .5 - dx * uw * .15, cy + py * sg * uw * .5 - dy * uw * .15); s2.lineTo(cx + px * sg * bl * .9 + dx * uw * .2, cy + py * sg * bl * .9 + dy * uw * .2); s2.fill(); } }
      { const [hx, hy] = at(dCb + uw * .62); s2.beginPath(); s2.ellipse(hx - px * uw * .12, hy - py * uw * .12, uw * .33, uw * .4, Math.atan2(dy, dx), 0, 6.283); s2.fill(); }
      const sb = canvas(GW, GH), b2 = sb.getContext('2d'); b2.filter = 'blur(6px)'; b2.drawImage(sc, 0, 0);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .6; g.drawImage(sb, 0, 0); g.restore(); }
    S.G = gc; S.Gb = canvas(GW >> 1, GH >> 1); { const b = S.Gb.getContext('2d'); b.filter = 'blur(2.5px)'; b.drawImage(gc, 0, 0, GW >> 1, GH >> 1); }
    // the crumpled end of a woven cloth (the tunic), coming into the frame from its right edge: weave and creases only
    { const cw = Math.ceil((V ? 560 : 640) * k), ch = Math.ceil((V ? 380 : 330) * k), pad = 40, tc = canvas(cw + pad * 2, ch + pad * 2), t2 = tc.getContext('2d'), r = rng(31);
      const pts = [];
      for (let i = 0; i <= 12; i++) { const f = 1 - i / 12; pts.push([pad + cw * (.18 + .82 * f), pad + ch * (.04 + .16 * fbm(f * 5 + 1, 2.2, 3))]); }               // its upper side, rumpled
      for (let i = 1; i < 16; i++) { const v = i / 16; pts.push([pad + cw * (.06 + .2 * fbm(v * 5 + 3, 1.3, 3) + .1 * Math.sin(v * 9)), pad + ch * v]); }   // the end, folded and ragged
      for (let i = 0; i <= 12; i++) { const f = i / 12; pts.push([pad + cw * (.16 + .84 * f), pad + ch * (.96 - .16 * fbm(f * 5 + 7, 4.4, 3))]); }               // its lower side
      const p = new Path2D(); p.moveTo(tc.width + 20, pts[0][1]); pts.forEach(([x, y]) => p.lineTo(x, y)); p.lineTo(tc.width + 20, pts[pts.length - 1][1]); p.closePath();
      t2.save(); t2.fillStyle = 'rgba(30,28,26,.5)'; t2.filter = 'blur(9px)'; t2.translate(4, 16); t2.fill(p); t2.restore();          // its shadow on the earth
      t2.save(); t2.clip(p); t2.fillStyle = 'rgb(200,195,184)'; t2.fillRect(0, 0, tc.width, tc.height);
      for (let y = 0; y < tc.height; y += 3) { t2.fillStyle = `rgba(70,64,56,${.14 + .06 * r()})`; t2.fillRect(0, y, tc.width, 1.3); }   // the weave
      for (let x = 0; x < tc.width; x += 3) { t2.fillStyle = `rgba(255,252,244,${.08 + .05 * r()})`; t2.fillRect(x, 0, 1.2, tc.height); }
      { const q = 3, w = Math.ceil(tc.width / q), h = Math.ceil(tc.height / q), hf = new Float32Array(w * h), rr = rng(77), L = [];
        for (let i = 0; i < 15; i++) { const x0 = rr() * w, y0 = rr() * h, a = (rr() - .5) * .9 + (rr() < .6 ? 0 : .6), l = (.3 + rr() * .45) * w; L.push([x0, y0, Math.cos(a), Math.sin(a), l, 4 + rr() * 7, (rr() < .7 ? 1 : -.6) * (.7 + rr() * .7), (rr() - .5) * .012]); }
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let hh = fbm(x * .018, y * .018, 3) * .8;
          for (const [x0, y0, ux, uy, l, ww, A, cv] of L) { const dx = x - x0, dy = y - y0, al = dx * ux + dy * uy; if (Math.abs(al) < l) { const ac = -dx * uy + dy * ux + cv * al * al; hh += A * Math.exp(-(ac * ac) / (ww * ww)) * (1 - Math.pow(al / l, 2)); } }
          hf[y * w + x] = hh; }
        const im = t2.createImageData(w, h); for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x, sh = (hf[i + w] - hf[i - w]) * 2.4 + (hf[i + 1] - hf[i - 1]) * .8, v = clamp(.5 + sh) * 255; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
        const hc = canvas(w, h); hc.getContext('2d').putImageData(im, 0, 0); t2.globalCompositeOperation = 'overlay'; t2.drawImage(hc, 0, 0, tc.width, tc.height); t2.globalAlpha = .55; t2.drawImage(hc, 0, 0, tc.width, tc.height); t2.globalAlpha = 1; t2.globalCompositeOperation = 'source-over'; }
      t2.restore();
      t2.save(); t2.clip(p); t2.strokeStyle = 'rgba(255,252,240,.6)'; t2.lineWidth = 5; t2.filter = 'blur(2px)'; t2.translate(2, 4); t2.stroke(p); t2.restore();   // light along its far edge
      { const rf = rng(4); t2.strokeStyle = 'rgba(200,194,182,.8)'; t2.lineWidth = 1.4; for (let i = 13; i < 13 + 15; i++) { const [x, y] = pts[i]; for (let j = 0; j < 4; j++) { const yy = y + (rf() - .5) * ch / 16; t2.beginPath(); t2.moveTo(x + 4, yy); t2.quadraticCurveTo(x - 8, yy + (rf() - .5) * 8, x - 10 - rf() * 12, yy + (rf() - .5) * 10); t2.stroke(); } } }   // loose threads at the end
      S.cloth = tc; S.clothAt = V ? [W - tc.width + pad * .5, H * .335] : [W * .6, H * .34]; }
    S.t1 = canvas(W, H); S.t2 = canvas(W, H);
    const r = rng(5); S.motes = []; for (let i = 0; i < 26; i++) S.motes.push({ x: r(), y: r() * .7, r: 3 + r() * 9, v: .004 + r() * .01, p: r() * 6.28 });
    // the throwing hand and where the bones come to rest (screen fractions)
    S.Lsh = V ? [-.45, .8] : [-.12, .9]; S.Lw0 = V ? [.17, .585] : [.27, .64]; S.Lw1 = V ? [.23, .568] : [.32, .62];
    S.Rsh = V ? [1.45, .82] : [1.15, .84];
    S.land = V ? [[.4, .59], [.47, .605], [.53, .585]] : [[.42, .66], [.48, .69], [.53, .65]];
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
  const projG = (x, P, cam) => { const { W } = B, e = Math.exp((P - S.ym) / S.D), y = S.yh + S.D * e, s = (y - S.yh) / S.D; return [W / 2 + (x - cam - W / 2) * s, y, s]; };

  // ---- the shadow of a crouching legionary, cast down the frame (screen fractions; bx = his centre line). Head and crest nearest us.
  function shadowHand(g, w, a, s, open) {   // palm and five fingers, spread as the hand opens
    g.save(); g.translate(w[0], w[1]); g.rotate(a); g.scale(s, s);
    g.beginPath(); g.ellipse(26, 0, 32, 27, 0, 0, 6.283); g.fill();
    [[-.5, 66], [-.17, 74], [.15, 70], [.45, 56]].forEach(([d, L], i) => { const ang = d * (.35 + .55 * open), l = L * (.45 + .55 * open); capsule(g, [48, d * 40], [48 + Math.cos(ang) * l, d * 40 + Math.sin(ang) * l], 17 - i, 12 - i * .8); });
    const ta = 1.15 - .25 * open; capsule(g, [14, 24], [14 + Math.cos(ta) * 34, 24 + Math.sin(ta) * 34], 20, 17); capsule(g, [14 + Math.cos(ta) * 34, 24 + Math.sin(ta) * 34], [14 + Math.cos(ta) * 34 + Math.cos(ta - .5) * 30, 24 + Math.sin(ta) * 34 + Math.sin(ta - .5) * 30], 17, 13);
    g.restore();
  }
  function soldierShadow(g, o) {
    const { W, H } = B, X = f => f * W, Y = f => f * H, bx = o.bx + o.sway * .01, Xo = d => X(bx + d * (B.V ? 1 : .62)), k = S.k, u = W / 1080 * (B.V ? 1 : .62);
    // the hunched back and shoulders, from beyond the top of the frame
    smooth(g, [[Xo(-.12), Y(-.08)], [Xo(.12), Y(-.08)], [Xo(.15), Y(.07)], [Xo(.185), Y(.18)], [Xo(.19), Y(.245)], [Xo(.15), Y(.285)], [Xo(.075), Y(.3)], [Xo(.04), Y(.33)], [Xo(-.04), Y(.33)], [Xo(-.075), Y(.3)], [Xo(-.15), Y(.285)], [Xo(-.19), Y(.245)], [Xo(-.185), Y(.18)], [Xo(-.15), Y(.07)]]);
    // the helmeted head: round crown, the neck guard flaring behind it, cheek guards, the crest's brush reaching towards us
    const hx = X(bx + o.sway * .006), hy = Y(.345 + o.nod * .01);
    g.beginPath(); g.ellipse(hx, hy, 58 * u, 50 * u, 0, 0, 6.283); g.fill();
    g.beginPath(); g.moveTo(hx - 64 * u, hy - 24 * u); g.quadraticCurveTo(hx, hy - 44 * u, hx + 64 * u, hy - 24 * u); g.lineTo(hx + 82 * u, hy - 46 * u); g.quadraticCurveTo(hx, hy - 76 * u, hx - 82 * u, hy - 46 * u); g.closePath(); g.fill();   // neck guard
    for (const m of [-1, 1]) { g.beginPath(); g.moveTo(hx + m * 46 * u, hy + 4 * u); g.lineTo(hx + m * 60 * u, hy + 34 * u); g.lineTo(hx + m * 40 * u, hy + 42 * u); g.closePath(); g.fill(); }        // cheek guards
    g.beginPath(); g.moveTo(hx - 30 * u, hy + 26 * u); for (let i = 0; i <= 28; i++) { const a = lerp(Math.PI * .97, Math.PI * .03, i / 28), rr = (i % 2 ? 1 : .8) * (1 + o.sway * .02); g.lineTo(hx + Math.cos(a) * 40 * u * rr, hy + 26 * u + Math.sin(a) * 62 * u * rr); } g.closePath(); g.fill();   // crest
    // arms: the resting one, and the one that acts (to its hand)
    for (const [sh, el, wr, open, ang, w0] of o.arms) { capsule(g, [X(sh[0]), Y(sh[1])], [X(el[0]), Y(el[1])], w0 * u, w0 * .8 * u); g.beginPath(); g.arc(X(el[0]), Y(el[1]), w0 * .42 * u, 0, 6.283); g.fill();
      capsule(g, [X(el[0]), Y(el[1])], [X(wr[0]), Y(wr[1])], w0 * .8 * u, w0 * .6 * u); shadowHand(g, [X(wr[0]), Y(wr[1])], ang, 1.25 * u, open); }
  }
  // a knucklebone (astragalus): a squarish, waisted little bone, its four long sides different (hollow, ridged, flat with a pit,
  // twisted) — top face, the near side in shade, a rim of light, its contact shadow
  function bone(g, x, y, s, rot, face, hgt, roll) {
    g.save(); g.fillStyle = `rgba(16,14,12,${.6 - Math.min(.42, hgt / 110)})`; g.filter = hgt > 3 ? `blur(${Math.min(5, hgt / 8)}px)` : 'none';
    g.beginPath(); g.ellipse(x + s * .08, y + s * .3 + hgt * .45, s * .56, s * .3, 0, 0, 6.283); g.fill(); g.restore();
    g.save(); g.translate(x, y - hgt); g.rotate(rot); const fy = .62 + .3 * Math.abs(Math.cos(roll)); g.scale(1, fy);
    const top = new Path2D(); top.moveTo(-.5 * s, -.3 * s); top.bezierCurveTo(-.3 * s, -.38 * s, -.1 * s, -.2 * s, .02 * s, -.24 * s); top.bezierCurveTo(.18 * s, -.3 * s, .4 * s, -.36 * s, .52 * s, -.24 * s);
    top.bezierCurveTo(.6 * s, -.12 * s, .56 * s, .02 * s, .5 * s, .12 * s); top.bezierCurveTo(.56 * s, .22 * s, .44 * s, .32 * s, .3 * s, .3 * s); top.bezierCurveTo(.14 * s, .26 * s, -.04 * s, .34 * s, -.2 * s, .3 * s);
    top.bezierCurveTo(-.4 * s, .34 * s, -.56 * s, .24 * s, -.54 * s, .06 * s); top.bezierCurveTo(-.58 * s, -.08 * s, -.58 * s, -.24 * s, -.5 * s, -.3 * s); top.closePath();
    g.save(); g.translate(0, s * .2 / fy); g.fillStyle = '#4e483f'; g.fill(top); g.restore();                                   // the near side, in shade
    const bg = g.createLinearGradient(0, -s * .35, 0, s * .35); bg.addColorStop(0, '#f8f1de'); bg.addColorStop(.5, '#cfc4ad'); bg.addColorStop(1, '#8e8472');
    g.fillStyle = bg; g.fill(top); g.strokeStyle = 'rgba(46,40,32,.55)'; g.lineWidth = 1.2; g.stroke(top);
    g.fillStyle = 'rgba(66,58,46,.75)'; g.strokeStyle = 'rgba(66,58,46,.8)'; g.lineWidth = Math.max(1.4, s * .055); g.lineCap = 'round';
    if (face === 0) { g.beginPath(); g.ellipse(-.02 * s, .02 * s, s * .2, s * .1, .1, 0, 6.283); g.fill(); }                                   // hollow
    else if (face === 1) { g.beginPath(); g.moveTo(-.36 * s, -.06 * s); g.quadraticCurveTo(0, .16 * s, .36 * s, -.08 * s); g.stroke(); g.beginPath(); g.moveTo(-.2 * s, .14 * s); g.lineTo(.18 * s, .16 * s); g.stroke(); }   // ridged
    else if (face === 2) { g.beginPath(); g.arc(.22 * s, -.04 * s, s * .06, 0, 6.283); g.fill(); }                                             // flat, a pit
    else { g.beginPath(); g.moveTo(-.38 * s, .1 * s); g.bezierCurveTo(-.12 * s, -.18 * s, .12 * s, .2 * s, .38 * s, -.1 * s); g.stroke(); }    // twisted
    g.strokeStyle = 'rgba(255,252,240,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-.46 * s, -.3 * s); g.bezierCurveTo(-.3 * s, -.37 * s, -.1 * s, -.2 * s, .02 * s, -.24 * s); g.bezierCurveTo(.18 * s, -.3 * s, .4 * s, -.36 * s, .5 * s, -.25 * s); g.stroke();
    g.restore();
  }
  function bonePos(u, from, to, t0, t1, seed, last) {
    const p = clamp((u - t0) / (t1 - t0)), r = rng(seed * 101), { H } = B;
    const e = 1 - Math.pow(1 - p, 2), x = lerp(from[0], to[0], e), yg = lerp(from[1] + H * .03, to[1], Math.pow(p, .7));
    const hgt = (p < .38 ? (1 - p / .38) * H * .03 + Math.sin(p / .38 * Math.PI) * H * .025 : p < .7 ? Math.sin((p - .38) / .32 * Math.PI) * H * .018 : p < .88 ? Math.sin((p - .7) / .18 * Math.PI) * H * .006 : 0);
    const bounce = p < .38 ? 0 : p < .7 ? 1 : p < .88 ? 2 : 3, faces = [r() * 4 | 0, r() * 4 | 0, r() * 4 | 0, last];
    return { x, y: yg, hgt, face: faces[bounce], rot: (1 - e) * (5 + r() * 4) + r() * 2, roll: (1 - e) * (16 + r() * 6), p };
  }

  function bwSoldiers(ctx, u) {
    buildBW(); const { W, H, V } = B, t = 114 + u, k = S.k;
    const z = 1 + .06 * eio(u / 6.2), cam = lerp(14, -14, u / 6.2) * k;
    const wv = rng(Math.floor(t * 24) + 2), jx = (wv() - .5) * 1.6, jy = (wv() - .5) * 1.6, zc = [W * .5, H * .5];
    ctx.save(); ctx.setTransform(z, 0, 0, z, zc[0] - zc[0] * z + jx, zc[1] - zc[1] * z + jy);
    ctx.fillStyle = 'rgb(150,146,140)'; ctx.fillRect(-W, -H, W * 3, H * 3);
    // the ground, row by row in perspective; the far and near rows a little soft
    const focus = H * .5;
    for (let y = -12; y < H + 12; y += 3) {
      const Pa = S.ym + S.D * Math.log((y - S.yh) / S.D), Pb = S.ym + S.D * Math.log((y + 3 - S.yh) / S.D), s = (y + 1.5 - S.yh) / S.D;
      const x0 = W / 2 + cam - (W / 2) / s, sw = W / s, gx = (x0 - S.px0) / 2, gy = (Pa - S.P0) / 2, gh = (Pb - Pa) / 2;
      ctx.drawImage(S.G, gx, gy, sw / 2, gh, -4, y, W + 8, 3.6);
      const b = Math.pow(clamp(Math.abs(y - focus) / (H * .55)), 1.6); if (b > .05) { ctx.globalAlpha = b; ctx.drawImage(S.Gb, gx / 2, gy / 2, sw / 4, gh / 2, -4, y, W + 8, 3.6); ctx.globalAlpha = 1; }
    }
    // the cloth's end, lying at the frame's right edge
    if (V) ctx.drawImage(S.cloth, S.clothAt[0] + cam * .9, S.clothAt[1]); else ctx.drawImage(S.cloth, S.clothAt[0] + cam * .9, S.clothAt[1], W * .44, S.cloth.height);   // landscape: stretched to reach the frame's edge
    // the soldiers' poses (screen fractions in portrait; landscape squeezes them towards the middle)
    const M = p => V ? p : [.5 + (p[0] - .5) * .62, p[1] * 1.04], swA = Math.sin(t * 1.3) * .5 + noise(t * .7, 3) - .5, swB = Math.sin(t * 1.1 + 2) * .5 + noise(t * .6, 9) - .5;
    // the left soldier's hand: shaking, the throw at 1.9 (reaching down and opening), then it hangs open
    const wind = ss(1.35, 1.72, u) * (1 - ss(1.72, 1.92, u)), swing = ss(1.72, 1.95, u), rat = u < 1.45 ? Math.sin(u * 38) * .006 * (1 - u / 1.7) : 0, back = ss(3.4, 4.8, u);
    const draw = ss(2.05, 2.9, u), Lwr = [.41 + rat + swing * .015 - wind * .02 - draw * .025, .455 - wind * .02 + swing * .02 - draw * .055], Lopen = clamp(ss(1.8, 1.95, u) - back * .4);
    // the right soldier's hand: resting, then from 3.3 it reaches over the cloth's end and settles on it
    const reach = ss(3.3, 4.7, u), Rwr = [lerp(.66, .7, reach), lerp(.37, .47, reach)];
    // the knucklebones: they drop out of the shadow hand, bounce, roll and stop (real bones, with their own shadows)
    const rel = [(.425 + .03) * W, (.475 + .03) * H], land = [[.45, .58], [.515, .6], [.56, .565]].map(p => [M(p)[0] * W + cam, M(p)[1] * H]);
    const BN = [[1.9, 2.62, 1, 0], [1.93, 2.84, 2, 2], [1.96, 2.72, 3, 1]].map(([t0, t1, sd, last], i) => [V ? rel : [M([.455, 0])[0] * W, rel[1]], land[i], t0, t1, sd, last]);
    if (u > 1.88) for (const a of BN) { const d = bonePos(u, ...a), sz = 64 * k * (1 + d.hgt / H * 2.2);
      if (d.p < .5) { const dp = bonePos(u - .03, ...a); ctx.globalAlpha = .28; bone(ctx, dp.x, dp.y, sz, dp.rot, dp.face, dp.hgt, dp.roll); ctx.globalAlpha = 1; }
      bone(ctx, d.x, d.y, sz, d.rot, d.face, d.hgt, d.roll); }
    BN.forEach((a, i) => { const ap = clamp((u - a[3] + .4) / 1.3); if (ap > 0 && ap < 1) { const r = rng(9 + i * 7), [x, y] = a[1];
        for (let j = 0; j < 14; j++) { const an = r() * 6.283, rr = (10 + r() * 44) * eo(ap) * k; ctx.fillStyle = `rgba(232,226,212,${.3 * (1 - ap)})`; ctx.beginPath(); ctx.arc(x + Math.cos(an) * rr, y + Math.sin(an) * rr * .35 - ap * 18, (3 + r() * 6) * k, 0, 6.283); ctx.fill(); } } });
    // the two shadows, one light: drawn together (no double darkness where they cross), soft at the edges
    { const sc = S.shc || (S.shc = canvas(W >> 1, H >> 1)), g = sc.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.setTransform(.5, 0, 0, .5, cam * .5 * .7, 0); g.fillStyle = '#000';
      const A = (sh, el, wr, open, w0) => { const a = Math.atan2(wr[1] - el[1], (wr[0] - el[0]) * W / H); return [M(sh), M(el), M(wr), open, a, w0]; };
      soldierShadow(g, { bx: M([.3, 0])[0], sway: swA, nod: wind - swing * .5, arms: [A([.17, .27], [.16, .38], [.19, .45], .15, 80), A([.43, .28], [.46, .37], Lwr, Lopen, 82)] });
      soldierShadow(g, { bx: M([.74, 0])[0], sway: swB, nod: reach * .8, arms: [A([.61, .28], [.59, .36], Rwr, .55 + reach * .4, 82)] });
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'blur(1.6px)'; ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .74; ctx.drawImage(sc, 0, 0, W, H); ctx.restore(); }
    ctx.restore();
    // the sun high behind them: the far ground brighter, dust in the air
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen';
    { const sg = ctx.createLinearGradient(0, 0, 0, H * .5); sg.addColorStop(0, 'rgba(255,250,236,.32)'); sg.addColorStop(1, 'rgba(255,250,236,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      for (const m of S.motes) { const x = ((m.x + t * m.v) % 1) * W, y = (m.y + Math.sin(t * .5 + m.p) * .02) * H, a = .16 * (1 - m.y / .7) * (.6 + .4 * Math.sin(t * 2 + m.p)), rr = m.r * k;
        const mg = ctx.createRadialGradient(x, y, 0, x, y, rr); mg.addColorStop(0, `rgba(255,250,236,${a})`); mg.addColorStop(1, 'rgba(255,250,236,0)'); ctx.fillStyle = mg; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2); } }
    ctx.globalCompositeOperation = 'source-over';
    { const bg = ctx.createLinearGradient(0, H * (V ? .6 : .7), 0, H); bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(.3, 'rgba(0,0,0,.34)'); bg.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    const lt = ss(5.2, 6.2, u);   // a breath more light at the end (the next part: dawn)
    finish(ctx, t, { halo: .3 + .12 * lt, grain: .4, vig: .58 - .1 * lt, warm: [W * .5, -H * .1, Math.max(W, H) * .9, .14 + .2 * lt], flicker: .08 });
  }
  window.bwSoldiers = bwSoldiers;
})();
