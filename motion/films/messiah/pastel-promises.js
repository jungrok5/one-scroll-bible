/* pastel-promises.js — 「메시아」 2부의 아브라함과 다윗을 소프트 파스텔로 (2026-11-03 2차; after the first film's 「족장」
   motion/pilot/patriarch.html — pastel hatching clipped to shapes, dry-grass strokes, chalk cloud bands, stars in waves, paper tooth).
   Abraham (37.0–43.6): night in the desert, seated before his tent, looking up at countless stars (Gen 22:18); the gold thread
   crosses the sky (E1b 37.4, 5.4 s). David (43.4–51.2): the hills of Bethlehem at magic hour, the shepherd boy among his sheep
   (2 Sam 7); the thread runs along the crest (E1c 43.8, 6 s). Portrait first. */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, fbm, canvas } = Pilot;
  let W, H, V, paper, A = null, D = null;
  function poly(pts) { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath();
    const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]); p.__b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; return p; }
  function hatch(x, path, c, r, n, ang, len, wd, alpha) {   // pastel hatching clipped to a path (the first film's helper)
    x.save(); x.clip(path); x.strokeStyle = c; x.lineCap = 'round'; const b = path.__b;
    for (let i = 0; i < n; i++) { const px = b[0] + r() * (b[2] - b[0]), py = b[1] + r() * (b[3] - b[1]), a = ang + (r() - .5) * .3, l = len * (.6 + r() * .8);
      x.globalAlpha = alpha * (.4 + r() * .6); x.lineWidth = wd * (.6 + r() * .8); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    x.restore(); }
  const ridgePts = (y0, amp, f, ph, step = 20) => { const pts = [[-40, H + 40]]; for (let x = -40; x <= W + 40; x += step) pts.push([x, y0 - amp * (.5 + .5 * Math.sin(x * f + ph)) - amp * .4 * fbm(x * f * 3, ph, 3)]); pts.push([W + 40, H + 40]); return pts; };
  function grass(x, y0, y1, cols, n, r, k = 1) { for (let i = 0; i < n; i++) { const y = y0 + Math.pow(r(), .55) * (y1 - y0), d = (y - y0) / (y1 - y0), px = r() * W, len = (4 + d * 60 * (.6 + r() * .8)) * k, wd = .8 + d * 5 * (.6 + r() * .6);
    x.globalAlpha = .45 + r() * .5; x.strokeStyle = cols[(r() * cols.length) | 0]; x.lineWidth = wd; x.lineCap = 'round'; const lean = (r() - .5) * .5; x.beginPath(); x.moveTo(px, y); x.lineTo(px + lean * len, y - len); x.stroke(); } x.globalAlpha = 1; }
  function chalkBands(x, y0, y1, col, n, r) { for (let b = 0; b < n; b++) { const yy = y0 + r() * (y1 - y0), x0 = r() * W * .6 - W * .1, len = W * (.4 + r() * .7);
    for (let i = 0; i < 180; i++) { const px = x0 + r() * len, py = yy + (r() - .5) * 12 + Math.sin(px * .006) * 6; x.globalAlpha = .05 + r() * .14; x.strokeStyle = col; x.lineWidth = 2 + r() * 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 40 + r() * 100, py + (r() - .5) * 3); x.stroke(); } } x.globalAlpha = 1; }
  function abrahamStanding(x, sx, sy, s, glow) {   // Abraham standing before his tent, head back, looking up at the stars (Gen 15:5); staff, head cloth, white beard
    x.save(); x.translate(sx, sy); x.scale(s, s); const r = rng(3);
    x.strokeStyle = '#3a2e30'; x.lineWidth = 4.5; x.lineCap = 'round'; x.beginPath(); x.moveTo(42, -196); x.lineTo(44, 0); x.stroke();
    const pts = [[-15, -150], [15, -150], [26, -96], [36, -40], [40, 0], [-38, 0], [-32, -44], [-26, -96]], robe = poly(pts); x.fillStyle = '#2b2840'; x.fill(robe);
    hatch(x, robe, '#4a4466', r, 260, -1.2, 16, 2.2, .55); hatch(x, robe, '#1c1a2c', r, 120, 1.9, 14, 2, .4);
    x.save(); x.clip(robe); const gr = x.createLinearGradient(8, 0, 40, 0); gr.addColorStop(0, 'rgba(240,190,140,0)'); gr.addColorStop(1, `rgba(240,190,140,${.45 + .3 * glow})`); x.fillStyle = gr; x.fillRect(0, -160, 44, 170); x.restore();   // the lantern on his right
    x.strokeStyle = '#2b2840'; x.lineWidth = 10; x.beginPath(); x.moveTo(12, -138); x.quadraticCurveTo(30, -128, 41, -116); x.stroke();   // the arm to the staff
    x.save(); x.translate(0, -160); x.rotate(-.5);
    x.fillStyle = '#5a4038'; x.beginPath(); x.ellipse(4, 0, 10, 12, 0, 0, 6.283); x.fill();
    x.fillStyle = 'rgba(150,134,124,.9)'; x.beginPath(); x.ellipse(7, 13, 6, 9, -.2, 0, 6.283); x.fill();   /* round 3: a grey beard under the chin (the white wedge read as a beak) */
    x.fillStyle = '#3e3a58'; x.beginPath(); x.moveTo(-13, -7); x.quadraticCurveTo(0, -22, 13, -7); x.lineTo(11, 2); x.lineTo(-16, 30); x.lineTo(-18, 0); x.closePath(); x.fill();
    x.restore(); x.restore(); }  function shepherdBoy(x, sx, sy, s) {   // David: a boy with a staff and a sling at his belt, facing left toward the sheep
    x.save(); x.translate(sx, sy); x.scale(s, s); const r = rng(8);
    x.strokeStyle = '#3a2a26'; x.lineWidth = 3.6; x.lineCap = 'round'; x.beginPath(); x.moveTo(-26, -150); x.quadraticCurveTo(-40, -168, -30, -176); x.moveTo(-26, -150); x.lineTo(-22, 0); x.stroke();
    const tunic = poly([[-12, -112], [12, -112], [20, -58], [18, -40], [-18, -40], [-20, -58]]); x.fillStyle = '#8a7656'; x.fill(tunic); hatch(x, tunic, '#b29a74', r, 120, -1.2, 12, 2, .5);   /* round 3: undyed wool, a Bethlehem shepherd (the red read as a Maasai cloak) */ hatch(x, tunic, '#f0c08a', r, 40, -1.2, 10, 1.6, .35);
    x.fillStyle = '#5a3a2a'; x.fillRect(-10, -40, 7, 40); x.fillRect(3, -40, 7, 40);
    x.strokeStyle = '#d9b97c'; x.lineWidth = 2; x.beginPath(); x.moveTo(-16, -62); x.quadraticCurveTo(0, -56, 16, -62); x.stroke();
    x.fillStyle = '#a8785a'; x.beginPath(); x.ellipse(0, -124, 10, 12, 0, 0, 6.283); x.fill(); x.fillStyle = '#6e5a42'; x.beginPath(); x.moveTo(-12, -122); x.quadraticCurveTo(-12, -140, 2, -140); x.quadraticCurveTo(14, -140, 13, -126); x.lineTo(15, -108); x.lineTo(8, -112); x.lineTo(8, -128); x.lineTo(-6, -130); x.closePath(); x.fill();   /* olive skin, a head cloth */
    x.strokeStyle = '#8a7656'; x.lineWidth = 5; x.beginPath(); x.moveTo(-10, -104); x.lineTo(-24, -86); x.lineTo(-26, -140); x.stroke();
    x.restore(); }
  function sheep(x, sx, sy, s, d, r) { x.fillStyle = '#d9cbb2'; x.beginPath(); x.ellipse(sx, sy, 26 * s, 15 * s, 0, 0, 6.283); x.fill(); x.fillStyle = '#3a3248'; x.beginPath(); x.ellipse(sx + d * 26 * s, sy - 4 * s, 8 * s, 7 * s, 0, 0, 6.283); x.fill();
    x.fillRect(sx - 14 * s, sy + 10 * s, 3 * s, 12 * s); x.fillRect(sx + 10 * s, sy + 10 * s, 3 * s, 12 * s); const p = poly([[sx - 26 * s, sy - 15 * s], [sx + 26 * s, sy - 15 * s], [sx + 26 * s, sy + 15 * s], [sx - 26 * s, sy + 15 * s]]); hatch(x, p, '#f3e6c8', r, 40, -1, 8 * s, 2, .5); }
  function init() {
    W = Pilot.W; H = Pilot.H; V = Pilot.ori === 'v';
    paper = canvas(W, H); { const g = paper.getContext('2d'), im = g.createImageData(W, H), r = rng(77); for (let i = 0; i < W * H; i++) { const x = i % W, y = (i / W) | 0, v = 128 + (r() - .5) * 70 + 40 * (Pilot.noise(x * .05, y * .05) - .5); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); }
    // ---- Abraham: the land (sky is per frame) ----
    { const hz = H * (V ? .52 : .6), c = canvas(W, H), x = c.getContext('2d'), r = rng(11);
      const mesa = poly(ridgePts(hz + 4, V ? 70 : 60, .004, 1.3)); x.fillStyle = '#3a3264'; x.fill(mesa); hatch(x, mesa, '#5a4c84', r, 2200, -.45, 20, 3, .3); hatch(x, mesa, '#2a2450', r, 900, 2.6, 16, 3, .3); hatch(x, mesa, '#9a6a8a', r, 300, -.5, 12, 2, .2);
      const plain = poly([[-40, hz + 10], [W + 40, hz + 10], [W + 40, H + 40], [-40, H + 40]]); const gr = x.createLinearGradient(0, hz, 0, H); gr.addColorStop(0, '#5a4a62'); gr.addColorStop(.3, '#6a5658'); gr.addColorStop(1, '#3a3040'); x.fillStyle = gr; x.fill(plain);
      grass(x, hz + 10, H, ['#8a7a6a', '#7a6a62', '#6a5a5a', '#9a8070', '#5a4a58', '#a88a6e', '#4a4470'], 26000, r, V ? 1.3 : 1);
      // the tent (black goat hair) and a rug, right of centre
      const TX = W * (V ? .74 : .7), TY = hz + (V ? 150 : 120), ts = V ? 1.25 : 1;
      const tent = poly([[TX - 230 * ts, TY + 6], [TX - 210 * ts, TY - 70 * ts], [TX - 120 * ts, TY - 96 * ts], [TX - 40 * ts, TY - 80 * ts], [TX + 40 * ts, TY - 104 * ts], [TX + 140 * ts, TY - 82 * ts], [TX + 230 * ts, TY - 66 * ts], [TX + 250 * ts, TY + 6]]);
      x.fillStyle = '#221e30'; x.fill(tent); hatch(x, tent, '#3a3450', r, 900, -1.0, 16, 2.5, .5); hatch(x, tent, '#14121e', r, 400, .6, 14, 2.5, .4);
      const door = poly([[TX - 70 * ts, TY + 4], [TX - 62 * ts, TY - 66 * ts], [TX + 12 * ts, TY - 70 * ts], [TX + 18 * ts, TY + 4]]); x.fillStyle = '#8a5a3a'; x.fill(door); hatch(x, door, '#f0b070', r, 120, -1.2, 10, 2, .5);
      A = { hz, land: c, TX, TY, ts, ax: W * (V ? .3 : .36), ay: hz + (V ? 250 : 210), stars: [] };
      const rs = rng(5); for (let i = 0; i < (V ? 4200 : 5200); i++) { const big = rs() < .02; A.stars.push({ x: rs() * W, y: rs() * (hz - 10), s: big ? 2.2 + rs() * 1.6 : .5 + Math.pow(rs(), 2.2) * 1.8, big, at: 37 + 4.5 * Math.pow(rs(), .6), tw: rs() * 6.28, sp: .8 + rs() * 2.4, warm: rs() < .25 }); }
      A.stars.sort((a, b) => a.at - b.at);
      A.clouds = canvas(W, hz); chalkBands(A.clouds.getContext('2d'), hz * .55, hz * .95, '#fff', 3, rng(31)); }
    // ---- David: magic hour over the hills of Bethlehem (all static but the light) ----
    { const hz = H * (V ? .5 : .56), c = canvas(W, H), x = c.getContext('2d'), r = rng(21);
      const sky = x.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#6a5a9a'); sky.addColorStop(.45, '#c9738a'); sky.addColorStop(.8, '#f4b77a'); sky.addColorStop(1, '#f6cf7a'); x.fillStyle = sky; x.fillRect(0, 0, W, hz + 4);
      { const sx = W * .28, sy = hz - 30, g2 = x.createRadialGradient(sx, sy, 0, sx, sy, H * .45); g2.addColorStop(0, 'rgba(255,240,190,.9)'); g2.addColorStop(.15, 'rgba(255,214,150,.5)'); g2.addColorStop(1, 'rgba(255,200,140,0)'); x.fillStyle = g2; x.fillRect(0, 0, W, hz); x.fillStyle = '#fff0c4'; x.beginPath(); x.arc(sx, sy, V ? 50 : 44, 0, 6.283); x.fill(); D = { sun: [sx, sy] }; }
      chalkBands(x, hz * .35, hz * .85, '#ffe4d0', 4, r);
      const h1 = poly(ridgePts(hz + 10, V ? 80 : 60, .0035, 1)); x.fillStyle = '#9a6a8a'; x.fill(h1); hatch(x, h1, '#b8849a', r, 1800, -.45, 18, 3, .3); hatch(x, h1, '#7a5a7a', r, 700, 2.5, 14, 3, .25);
      const h2 = poly(ridgePts(hz + (V ? 90 : 70), V ? 70 : 50, .005, 3)); x.fillStyle = '#7a7a5a'; x.fill(h2); hatch(x, h2, '#9a9a6a', r, 2000, -.4, 18, 3, .35); hatch(x, h2, '#5a5a42', r, 800, 2.6, 14, 3, .3); hatch(x, h2, '#f4b77a', r, 400, -.4, 12, 2, .25);
      const crest = xx => hz + (V ? 200 : 160) - (V ? 50 : 36) * Math.sin(xx * .003 + 1) - 14 * fbm(xx * .01, 2, 2), h3pts = [[-40, H + 40]]; for (let xx = -40; xx <= W + 40; xx += 12) h3pts.push([xx, crest(xx)]); h3pts.push([W + 40, H + 40]);
      const h3 = poly(h3pts); const g3 = x.createLinearGradient(0, crest(W / 2) - 60, 0, H); g3.addColorStop(0, '#a88a5e'); g3.addColorStop(1, '#5a4a38'); x.fillStyle = g3; x.fill(h3);
      x.save(); x.clip(h3); grass(x, crest(W / 2) - 70, H, ['#c9a56a', '#b8955e', '#9c7a4c', '#d8b97c', '#c08a6e', '#7d6448', '#e3c48a', '#efd29a', '#6e5440', '#c9738a'], 24000, r, V ? 1.4 : 1.1); x.restore();
      const rr = rng(31); const flock = []; for (let i = 0; i < 9; i++) { const xx = W * (.08 + .84 * rr()), yy = crest(xx) + 30 + rr() * 110; flock.push([xx, yy, rr() < .5 ? 1 : -1]); } flock.sort((a, b) => a[1] - b[1]);
      for (const [xx, yy, d] of flock) sheep(x, xx, yy, V ? 1.6 : 1.3, d, rr);
      shepherdBoy(x, W * (V ? .66 : .62), crest(W * (V ? .66 : .62)) + (V ? 60 : 50), V ? 1.9 : 1.5);
      Object.assign(D, { hz, art: c, crest });
    }
  }
  const finish = (ctx, t, k = .5) => { ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = k; ctx.drawImage(paper, 0, 0); ctx.restore();
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); vg.addColorStop(0, 'rgba(20,16,40,0)'); vg.addColorStop(1, 'rgba(20,16,40,.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); };
  window.partAbraham = function (ctx, t) {
    if (!A) init();
    const k = clamp((t - 37) / 6.6), tilt = (V ? 90 : 60) * eio(k), z = 1 + .05 * eio(k);
    // the sky: deep violet into indigo, a last rose band on the horizon
    const g = ctx.createLinearGradient(0, 0, 0, A.hz + tilt); g.addColorStop(0, '#0c0c24'); g.addColorStop(.55, '#1e1d42'); g.addColorStop(.85, '#3a3468'); g.addColorStop(1, '#7a5888'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const s of A.stars) { if (s.at > t) break; const a = ss(s.at, s.at + 1.2, t) * (.55 + .45 * Math.sin(t * s.sp + s.tw)); if (a < .02) continue; const y = s.y + tilt * .5;
      ctx.globalAlpha = a; ctx.fillStyle = s.warm ? '#ffe2b0' : '#f4f0ff'; ctx.beginPath(); ctx.arc(s.x, y, s.s * (V ? 1.2 : 1), 0, 6.283); ctx.fill();
      if (s.big) { ctx.globalAlpha = a * .5; ctx.fillRect(s.x - s.s * 3, y - .6, s.s * 6, 1.2); ctx.fillRect(s.x - .6, y - s.s * 3, 1.2, s.s * 6); } }
    ctx.globalAlpha = .28; ctx.drawImage(A.clouds, 0, tilt * .8); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(W / 2, H * .7); ctx.scale(z, z); ctx.translate(-W / 2, -H * .7 + tilt);
    ctx.drawImage(A.land, 0, 0);
    abrahamStanding(ctx, A.ax, A.ay, V ? 2.1 : 1.7, ss(37, 40, t));
    const lx = A.ax + (V ? 130 : 105), ly = A.ay - 4; ctx.fillStyle = '#2a2026'; ctx.fillRect(lx - 9, ly - 28, 18, 28); ctx.fillStyle = '#ffd890'; ctx.fillRect(lx - 5, ly - 23, 10, 15);
    ctx.globalCompositeOperation = 'screen'; const lamp = .92 + .08 * Math.sin(t * 9) * Math.sin(t * 5.3);
    const gl = ctx.createRadialGradient(lx, ly - 14, 0, lx, ly - 14, V ? 380 : 330); gl.addColorStop(0, `rgba(246,207,122,${.75 * lamp})`); gl.addColorStop(.25, `rgba(240,170,100,${.32 * lamp})`); gl.addColorStop(1, 'rgba(240,160,100,0)'); ctx.fillStyle = gl; ctx.fillRect(-W, -H, 3 * W, 3 * H);
    const dx = A.TX - 30 * A.ts, dy = A.TY - 30, gd = ctx.createRadialGradient(dx, dy, 0, dx, dy, 160); gd.addColorStop(0, `rgba(240,170,100,${.45 * lamp})`); gd.addColorStop(1, 'rgba(240,160,100,0)'); ctx.fillStyle = gd; ctx.fillRect(-W, -H, 3 * W, 3 * H);
    ctx.globalCompositeOperation = 'source-over'; ctx.restore();
    // the promise: the gold thread crosses the sky among the stars
    const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([-40 + u * (W + 80), A.hz * (.58 - .16 * Math.sin(u * 3.1))]); }   /* round 3: the arc stays under the place labels */ thread2D(ctx, pts, clamp((t - 37.4) / 5.4), .85);
    finish(ctx, t); textBand(ctx);
  };
  window.partDavid = function (ctx, t) {
    if (!A) init();
    const k = clamp((t - 43.4) / 7.8), z = 1 + .08 * eio(k), px = 22 * eio(k);   /* round 3: the pan stays inside the zoom's margin (the edges showed) */
    ctx.save(); ctx.translate(W / 2, H * .62); ctx.scale(z, z); ctx.translate(-W / 2 - px, -H * .62); ctx.drawImage(D.art, 0, 0);
    W3.bloom(ctx, D.sun[0], D.sun[1], [255, 214, 150], .6 * (.92 + .08 * Math.sin(t)), { r: V ? 240 : 200, streak: .7 });
    const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40, xx = -40 + u * (W + 80); pts.push([xx, D.crest(xx) - (V ? 300 : 230)]); } thread2D(ctx, pts, clamp((t - 43.8) / 6), .9);   /* round 3: along the far hills, above the boy (it ran through him) */
    ctx.restore(); finish(ctx, t);
    // round 3: the verse sits in the sky — the top of the sky darkens under it so the words and the reference read (not a box: the whole width)
    { const a = ss(43.6, 44.4, t) * (1 - ss(49.4, 50.2, t)); if (a > 0) { const g = ctx.createLinearGradient(0, 0, 0, H * .4); g.addColorStop(0, `rgba(30,20,48,${.62 * a})`); g.addColorStop(.7, `rgba(30,20,48,${.4 * a})`); g.addColorStop(1, 'rgba(30,20,48,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * .4); } }
    textBand(ctx);
  };
})();
