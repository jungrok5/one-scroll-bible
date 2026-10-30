/* Watercolour paintings for 2:17–2:27, with the toolkit of the first film's 05 wilderness.html (pencil contours,
   granulating washes, wet-in-wet blooms, one strong light): Bethlehem by night — the stable's light under the star — and
   a shepherd at dawn carrying the lost lamb home (seen against the sun: no face is drawn). A painting opens from wet spots
   (Water.bloom). Needs lib.js. Exposes window.Water. */
(function () {
  const { clamp, lerp, ss, rng, fbm, noise, canvas, hex, mix, rgb, speckle } = Pilot;
  const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v', S1 = Math.min(W, H) / 1080, PAPER = [236, 226, 204];
  const pth = (pts, close) => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); if (close) p.closePath(); return p; };
  const jit = (pts, a, r) => pts.map(([x, y]) => [x + (r() - .5) * 2 * a, y + (r() - .5) * 2 * a]);
  function wash(x, pts, col, a, r, amp = 5, edge = .5) { const c = typeof col === 'string' ? hex(col) : col; x.save(); x.globalCompositeOperation = 'multiply'; let p;
    for (let k = 0; k < 3; k++) { p = pth(jit(pts, amp, r), true); x.fillStyle = rgb(c, a / 2.2); x.fill(p); }
    if (edge) { x.strokeStyle = rgb(c.map(v => v * .72), a * edge); x.lineWidth = 1.8; x.stroke(p); } x.restore(); return p; }
  function pencil(x, pts, lw, a, r, close = false) { x.save(); x.strokeStyle = `rgba(58,36,24,${a})`; x.lineWidth = lw; x.lineJoin = x.lineCap = 'round'; x.stroke(pth(jit(pts, .8, r), close)); x.globalAlpha = .4; x.stroke(pth(jit(pts, 1.6, r), close)); x.restore(); }
  function ridge(x0, x1, fn, bottom, step = 8) { const p = [[x0, bottom]]; for (let xx = x0; xx <= x1; xx += step) p.push([xx, fn(xx)]); p.push([x1, fn(x1)], [x1, bottom]); return p; }
  function glow(x, px, py, rad, stops, op = 'screen') { x.save(); x.globalCompositeOperation = op; const g = x.createRadialGradient(px, py, 0, px, py, rad); stops.forEach(([k, c]) => g.addColorStop(k, c)); x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2); x.restore(); }
  function vgrad(x, y0, y1, stops, b = [0, 0, x.canvas.width, x.canvas.height]) { x.save(); x.globalCompositeOperation = 'multiply'; const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([k, c]) => g.addColorStop(k, c)); x.fillStyle = g; x.fillRect(...b); x.restore(); }
  function paperBase(x, w, h, seed) { x.fillStyle = rgb(PAPER); x.fillRect(0, 0, w, h); const r = rng(seed); x.strokeStyle = 'rgba(150,120,80,.07)'; x.lineWidth = 1;
    for (let i = 0; i < 2500; i++) { const px = r() * w, py = r() * h, a = r() * 6.28, l = 4 + r() * 10; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l / 2 + 2, py + Math.sin(a) * l / 2, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } }
  function granulate(x, w, h, seed) { const r = rng(seed); x.save(); x.globalCompositeOperation = 'multiply';
    for (let i = 0; i < w * h / 70; i++) { const px = r() * w, py = r() * h; if (fbm(px * .006, py * .006, 3) < .47 + r() * .1) continue; x.fillStyle = `rgba(70,45,35,${.08 + r() * .14})`; x.fillRect(px, py, 1 + r() * 1.6, 1 + r() * 1.6); }
    x.globalCompositeOperation = 'overlay'; x.globalAlpha = .22; x.drawImage(speckle(w >> 1, h >> 1, 26, seed, .6), 0, 0, w, h); x.restore(); }
  function blob(x, cx, cy, rr, col, a, blur, seed, sq = .75, op = 'multiply') { const m = Math.ceil(rr * 1.3 + blur * 3), c = canvas(m * 2, m * 2), b = c.getContext('2d'), pts = [];
    for (let k = 0; k < 6.283; k += .3) { const q = rr * (.78 + .4 * fbm(Math.cos(k) * 1.6 + seed, Math.sin(k) * 1.6, 2)); pts.push([m + Math.cos(k) * q, m + Math.sin(k) * q * sq]); }
    b.filter = `blur(${blur}px)`; b.fillStyle = rgb(col, 1); b.fill(pth(pts, true)); x.save(); x.globalCompositeOperation = op; x.globalAlpha = a; x.drawImage(c, cx - m, cy - m); x.restore(); }

  // ---------- Bethlehem by night ----------
  function bethlehem(w, h) {
    const c = canvas(w, h), x = c.getContext('2d'), r = rng(410), s = S1, hz = h * (V ? .52 : .58), sx = w * (V ? .6 : .64), sy = h * (V ? .14 : .13);
    paperBase(x, w, h, 4);
    vgrad(x, 0, h, [[0, '#2c3266'], [.45, '#4a4f86'], [.75, '#7a6f96'], [1, '#3e3450']]);
    for (let i = 0; i < 26; i++) blob(x, r() * w, r() * hz * .9, (60 + r() * 140) * s, [60, 70, 130], .16, 18 * s, i * .9, .6);
    for (let i = 0; i < 160; i++) { const px = r() * w, py = r() * hz * .95, b = r(); x.fillStyle = `rgba(255,252,236,${.35 + .5 * b})`; x.beginPath(); x.arc(px, py, (.8 + b * 1.6) * s, 0, 6.283); x.fill(); }
    // the star: a wet bloom of light with a long ray down toward the stable
    glow(x, sx, sy, w * .32, [[0, 'rgba(255,250,226,.9)'], [.12, 'rgba(255,236,190,.45)'], [1, 'rgba(255,230,180,0)']]);
    x.save(); x.globalCompositeOperation = 'screen'; const rg = x.createLinearGradient(0, sy, 0, hz + h * .22); rg.addColorStop(0, 'rgba(255,240,200,.75)'); rg.addColorStop(1, 'rgba(255,240,200,0)');
    x.fillStyle = rg; x.beginPath(); x.moveTo(sx - 3 * s, sy); x.lineTo(sx + 3 * s, sy); x.lineTo(sx + 26 * s, hz + h * .22); x.lineTo(sx - 26 * s, hz + h * .22); x.closePath(); x.fill(); x.restore();
    for (const [a, l] of [[0, 1], [Math.PI / 2, .55], [Math.PI / 4, .3], [-Math.PI / 4, .3]]) { x.save(); x.translate(sx, sy); x.rotate(a); x.fillStyle = 'rgba(255,252,236,.9)'; x.beginPath(); x.moveTo(-70 * l * s, 0); x.lineTo(0, -3 * s); x.lineTo(70 * l * s, 0); x.lineTo(0, 3 * s); x.fill(); x.restore(); }
    // hills
    for (const [k, col, a] of [[.1, '#6a6a9a', .5], [.05, '#4c4a7c', .6]]) { const R = ridge(-20, w + 20, xx => hz - h * k - h * .05 * fbm(xx * .003, k * 9, 4), hz + 40, 10); wash(x, R, col, a, r, 3, .35); pencil(x, R.slice(1, -2), 1.1 * s, .3, r); }
    // Bethlehem on its hill: small houses with a few lit windows
    const tx = w * (V ? .2 : .26), ty = hz - h * .06;
    for (let i = 0; i < 16; i++) { const bx = tx + (i - 8) * 22 * s + (r() - .5) * 8 * s, bh = (16 + r() * 26) * s, bw = (18 + r() * 14) * s, by = ty + Math.abs(i - 8) * 3 * s;
      const p = [[bx, by], [bx, by - bh], [bx + bw, by - bh], [bx + bw, by]]; wash(x, p, '#8a7aa0', .7, r, 1, .5); pencil(x, p, 1 * s, .5, r, true);
      if (r() < .5) { x.fillStyle = 'rgba(255,200,120,.9)'; x.fillRect(bx + bw * .35, by - bh * .6, 4 * s, 5 * s); } }
    // the ground
    wash(x, [[0, hz], [w, hz - h * .02], [w, h], [0, h]], '#3e3a5c', .65, r, 3, 0);
    vgrad(x, hz, h, [[0, 'rgba(255,255,255,1)'], [1, 'rgba(70,56,80,1)']], [0, hz, w, h - hz]);
    // the stable: a rough timber shed against a rock, its open front full of warm light
    const bx = sx - w * (V ? .2 : .13), by = hz + h * (V ? .14 : .2), bw = w * (V ? .42 : .27), bh = h * (V ? .12 : .2);
    const rock = [[bx - bw * .35, by + 4], [bx - bw * .3, by - bh * 1.3], [bx + bw * .2, by - bh * 1.55], [bx + bw * .9, by - bh * 1.4], [bx + bw * 1.3, by + 4]]; wash(x, rock, '#4a4064', .75, r, 4, .4); pencil(x, rock.slice(0, -1), 1.4 * s, .5, r);
    const roof = [[bx - bw * .06, by - bh], [bx + bw * .5, by - bh * 1.28], [bx + bw * 1.06, by - bh]]; wash(x, [...roof, [bx + bw * 1.06, by - bh * .92], [bx - bw * .06, by - bh * .92]], '#6a4a3a', .8, r, 2, .6); pencil(x, roof, 2 * s, .7, r);
    const door = [[bx + bw * .08, by], [bx + bw * .08, by - bh * .9], [bx + bw * .92, by - bh * .9], [bx + bw * .92, by]];
    x.save(); const lg = x.createLinearGradient(0, by - bh, 0, by); lg.addColorStop(0, 'rgba(255,214,140,1)'); lg.addColorStop(1, 'rgba(255,180,100,1)'); x.fillStyle = lg; x.fill(pth(door, true)); x.restore();
    for (const px of [.08, .5, .92]) pencil(x, [[bx + bw * px, by], [bx + bw * px, by - bh * .95]], 3 * s, .8, r);
    // inside: the manger and two kneeling figures, in shadow against the light (no faces)
    const mx = bx + bw * .5, my = by - bh * .12; x.fillStyle = 'rgba(90,60,40,.85)'; x.beginPath(); x.moveTo(mx - bw * .12, my - bh * .12); x.lineTo(mx + bw * .12, my - bh * .12); x.lineTo(mx + bw * .08, my); x.lineTo(mx - bw * .08, my); x.closePath(); x.fill();
    glow(x, mx, my - bh * .16, bw * .22, [[0, 'rgba(255,252,236,1)'], [.4, 'rgba(255,236,190,.6)'], [1, 'rgba(255,220,160,0)']]);
    const kneel = (kx, d) => { x.fillStyle = 'rgba(70,46,40,.9)'; x.beginPath(); x.moveTo(kx - 18 * s * d, my); x.quadraticCurveTo(kx - 22 * s * d, my - bh * .4, kx, my - bh * .5); x.quadraticCurveTo(kx + 14 * s * d, my - bh * .3, kx + 20 * s * d, my); x.closePath(); x.fill();
      x.beginPath(); x.arc(kx + 2 * s * d, my - bh * .56, 9 * s, 0, 6.283); x.fill(); };
    kneel(mx - bw * .26, 1); kneel(mx + bw * .26, -1);
    glow(x, mx, by, bw * 1.1, [[0, 'rgba(255,200,120,.55)'], [1, 'rgba(255,180,100,0)']]);
    wash(x, [[bx - bw * .2, by], [bx + bw * 1.2, by], [bx + bw * 1.6, by + h * .1], [bx - bw * .6, by + h * .1]], '#c89a6a', .35, r, 4, 0);
    granulate(x, w, h, 61); return c;
  }
  // ---------- the shepherd at dawn ----------
  function shepherd(w, h) {
    const c = canvas(w, h), x = c.getContext('2d'), r = rng(520), s = S1, hz = h * (V ? .5 : .5), sunX = w * (V ? .5 : .56), sunY = hz - h * .04;
    paperBase(x, w, h, 6);
    vgrad(x, 0, hz + 20, [[0, '#9eaacb'], [.55, '#e4c8b4'], [1, '#f2d4a0']]);
    glow(x, sunX, sunY, w * .6, [[0, 'rgba(255,240,196,.95)'], [.2, 'rgba(255,214,150,.55)'], [1, 'rgba(255,200,120,0)']]);
    const far = ridge(-20, w + 20, xx => hz - h * .05 - h * .05 * fbm(xx * .003, 2, 4), hz + 30, 10); wash(x, far, '#c4b0c4', .42, r, 3, .3);
    const mid = xx => hz + h * .03 - h * .06 * fbm(xx * .004 + 5, 4, 4); const Mm = ridge(-20, w + 20, mid, hz + h * .2, 8); wash(x, Mm, '#a8a878', .55, r, 3, .45); pencil(x, Mm.slice(1, -2), 1.6 * s, .45, r);
    wash(x, [[0, hz + h * .1], [w, hz + h * .08], [w, h], [0, h]], '#9aa070', .55, r, 3, 0);
    vgrad(x, hz, h, [[0, 'rgba(255,255,255,1)'], [.7, 'rgba(176,170,120,1)'], [1, 'rgba(90,86,60,1)']], [0, hz, w, h - hz]);
    // the path from the light down to us
    const path = []; for (let k = 0; k <= 30; k++) { const f = k / 30, yy = lerp(hz + h * .04, h + 10, f), xx = sunX + Math.sin(f * 3.2) * w * .08 * f - w * .06 * f; path.push([xx, yy, w * (.006 + .1 * f)]); }
    const band = [...path.map(([a, b, ww]) => [a - ww, b]), ...path.slice().reverse().map(([a, b, ww]) => [a + ww, b])]; wash(x, band, '#e8d6b0', .55, r, 2, .3);
    // the flock waiting further back, catching the rim light
    for (let i = 0; i < 22; i++) { const px = w * (.15 + r() * .7), py = hz + h * (.06 + r() * .06), sz = (8 + r() * 8) * s; blob(x, px, py, sz, [244, 236, 218], .9, 1.6 * s, i, .62, 'source-over'); x.fillStyle = 'rgba(58,40,30,.6)'; x.beginPath(); x.arc(px + sz * .8, py - sz * .1, sz * .3, 0, 6.283); x.fill(); }
    // the shepherd: coming down the path with the lamb across his shoulders, staff in hand; the sun is behind him (face in shadow, unpainted)
    const fx = sunX - w * .04, fy = h * (V ? .82 : .86), fs = h * (V ? .4 : .52) / 400;
    x.save(); x.translate(fx, fy); x.scale(fs, fs);
    const P = (pts, col, a, ed = .6) => wash(x, pts, col, a, r, 2, ed);
    P([[-40, 0], [-34, -140], [-6, -140], [-6, 0]], '#5a4a3a', .8); P([[6, 0], [6, -140], [34, -140], [40, 0]], '#5a4a3a', .8);
    P([[-70, -110], [-60, -260], [-40, -300], [40, -300], [60, -260], [70, -110], [30, -100], [-30, -100]], '#6c7a94', .85);
    P([[-70, -280], [-90, -180], [-80, -100], [-56, -120], [-50, -250]], '#9a5a40', .8); P([[70, -280], [90, -180], [80, -100], [56, -120], [50, -250]], '#9a5a40', .8);
    blob(x, 0, -312, 48, [244, 238, 222], 1, 3, 3, .55, 'source-over'); pencil(x, [[-52, -300], [-30, -328], [0, -334], [30, -328], [52, -300]], 3, .6, r);
    for (let i = 0; i < 9; i++) { const ax = -40 + i * 10, ay = -318 + (i % 2) * 8; pencil(x, [[ax, ay], [ax + 4, ay - 5], [ax + 8, ay]], 1.6, .45, r); }
    x.fillStyle = 'rgba(58,40,30,.75)'; x.beginPath(); x.ellipse(-58, -310, 12, 9, -.4, 0, 6.283); x.fill(); x.fillRect(-56, -300, 5, 34); x.fillRect(48, -300, 5, 34);
    P([[-26, -296], [-30, -350], [0, -372], [30, -350], [26, -296]], '#e8dcc0', .9);                                 // head cloth
    blob(x, 0, -338, 18, [120, 90, 70], .55, 2, 7, 1.1);                                                              // the face, in shadow
    pencil(x, [[78, 20], [92, -360], [80, -386], [62, -378]], 5, .85, r);                                              // staff
    x.restore();
    glow(x, fx, fy - h * .3, w * .2, [[0, 'rgba(255,236,190,.35)'], [1, 'rgba(255,220,160,0)']]);
    for (let i = 0; i < 220; i++) { const px = r() * w, py = h - r() * h * .1, l = (20 + r() * 60) * s; x.strokeStyle = r() < .6 ? 'rgba(80,90,50,.5)' : 'rgba(58,36,24,.4)'; x.lineWidth = (1.6 + r() * 2.4) * s; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 6 * s, py - l * .5, px + (r() - .3) * 18 * s, py - l); x.stroke(); }
    glow(x, sunX, sunY, w * .09, [[0, 'rgba(255,252,236,.95)'], [1, 'rgba(255,240,200,0)']]);
    granulate(x, w, h, 71); return c;
  }
  // ---------- the bloom (the painting opens from wet spots) ----------
  let NZ, maskC, maskX, maskD, lay, lx; const MW = 240, MH = Math.round(240 * H / W);
  const W_ = {};
  W_.init = () => { W_.P = { beth: bethlehem(W, H), shep: shepherd(W, H) };
    NZ = new Float32Array(MW * MH); for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) NZ[j * MW + i] = fbm(i * .035 + 3, j * .035, 4) * .8 + .2 * Math.hypot(i / MW - .5, j / MH - .5);
    maskC = canvas(MW, MH); maskX = maskC.getContext('2d'); maskD = maskX.createImageData(MW, MH); lay = canvas(W, H); lx = lay.getContext('2d'); };
  // draw painting `key` opened k (0..1) over what is already on ctx, with a slow push-in z
  W_.draw = (ctx, key, k, z = 1, live) => { const img = W_.P[key];
    lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalCompositeOperation = 'source-over'; lx.clearRect(0, 0, W, H); lx.translate(W / 2, H / 2); lx.scale(z, z); lx.drawImage(img, -W / 2, -H / 2); lx.setTransform(1, 0, 0, 1, 0, 0);
    if (live) live(lx, z);
    if (k < 1) { const d = maskD.data; for (let i = 0; i < NZ.length; i++) d[i * 4 + 3] = clamp((k * 1.5 - .25 - NZ[i]) * 7) * 255; maskX.putImageData(maskD, 0, 0);
      lx.globalCompositeOperation = 'destination-in'; lx.imageSmoothingQuality = 'high'; lx.drawImage(maskC, 0, 0, W, H); lx.globalCompositeOperation = 'source-over'; }
    ctx.drawImage(lay, 0, 0); };
  W_.geo = { star: () => [W * (V ? .6 : .64), H * (V ? .14 : .13)] };
  window.Water = W_;
})();
