/* The golden thread — shared by 00 opening.html and 20 invite.html (one-line drawing, drawn with light).
   One continuous path sampled by arc length; every point carries the time the nib reaches it, so the
   drawing is a pure function of time. Rendered as a light line (Gjon Mili's light-pen photographs):
   pressure from speed, a hot core, a gold halo, a glowing nib that pools when it stops.
   Needs lib.js (Pilot) loaded first. Exposes window.GoldLine. */
(function () {
  const { clamp, lerp, ss, eio, noise, fbm, canvas } = Pilot;
  const G = {};

  // ---------------- path builder ----------------
  class Path {
    constructor() { this.pts = []; this.ti = 0; this.tf(0, 0); this.lp = null; }
    tf(ox, oy, sx = 1, sy = 1) {                   // local → world transform for the primitives that follow
      this.T = { ox, oy, sx, sy };
      const l = this.pts[this.pts.length - 1]; this.lp = l ? [(l.x - ox) / sx, (l.y - oy) / sy] : null; return this;
    }
    w(x, y) { const T = this.T; return [T.ox + T.sx * x, T.oy + T.sy * y]; }
    _add(x, y) { const p = this.pts, l = p[p.length - 1]; if (l && Math.hypot(x - l.x, y - l.y) < .6) return; p.push({ x, y }); }
    curve(fn, len, step = 2.5) { const n = Math.max(1, Math.ceil(len / step)); for (let i = 1; i <= n; i++) { const [lx, ly] = fn(i / n), [x, y] = this.w(lx, ly); this._add(x, y); } return this; }
    moveTo(x, y, t) { const [wx, wy] = this.w(x, y); this.pts.push({ x: wx, y: wy, t }); this.ti = this.pts.length; this.lp = [x, y]; return this; }
    lineTo(x, y) { const [a, b] = this.lp; this.curve(u => [lerp(a, x, u), lerp(b, y, u)], Math.hypot(x - a, y - b)); this.lp = [x, y]; return this; }
    cubicTo(c1x, c1y, c2x, c2y, x, y) {
      const [a, b] = this.lp, B = (u, p0, p1, p2, p3) => { const v = 1 - u; return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3; };
      let len = 0, px = a, py = b; for (let i = 1; i <= 24; i++) { const u = i / 24, qx = B(u, a, c1x, c2x, x), qy = B(u, b, c1y, c2y, y); len += Math.hypot(qx - px, qy - py); px = qx; py = qy; }
      this.curve(u => [B(u, a, c1x, c2x, x), B(u, b, c1y, c2y, y)], len); this.lp = [x, y]; return this;
    }
    arc(cx, cy, r, a0, a1) { this.curve(u => { const a = lerp(a0, a1, u); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }, Math.abs(a1 - a0) * r);
      this.lp = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]; return this; }
    // assign times to every point added since the last timing call: curvature-weighted, optional ease in/out
    time(t1, o = {}) {
      const K = o.K == null ? 26 : o.K, p = this.pts, i0 = this.ti; if (i0 >= p.length) return this;
      const t0 = p[i0 - 1].t, w = [];
      for (let i = i0; i < p.length; i++) {
        const a = p[i - 1], b = p[i], c = p[i - 2]; let turn = 0;
        if (c) { const a1 = Math.atan2(a.y - c.y, a.x - c.x), a2 = Math.atan2(b.y - a.y, b.x - a.x); turn = Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1))); }
        w.push(Math.hypot(b.x - a.x, b.y - a.y) + K * turn);
      }
      const sm = w.map((_, i) => { let s = 0, n = 0; for (let j = -4; j <= 4; j++) if (w[i + j] != null) { s += w[i + j]; n++; } return s / n; });
      const tot = sm.reduce((s, v) => s + v, 0); let cum = 0;
      const ei = o.easeIn || 0, eo2 = o.easeOut || 0;
      for (let i = 0; i < sm.length; i++) { cum += sm[i]; let u = cum / tot;
        // ease: slow start / slow finish (a stroke that lands, or one that sets off)
        if (ei || eo2) { const e = u < .5 ? lerp(u, 2 * u * u, ei) : lerp(u, 1 - 2 * (1 - u) * (1 - u), eo2); u = e; }
        p[i0 + i].t = lerp(t0, t1, u); }
      this.ti = p.length; return this;
    }
    hold(t1) { const l = this.pts[this.pts.length - 1]; this.pts.push({ x: l.x + .01, y: l.y, t: t1, hold: true }); this.ti = this.pts.length; return this; }
    // finish: pressure per point (fast = thin, slow = fat), fine noise; returns a Line
    done(o = {}) {
      const p = this.pts;
      for (let i = 0; i < p.length; i++) { const a = p[Math.max(0, i - 1)], b = p[i], dt = b.t - a.t; b.v = dt > 1e-4 ? Math.hypot(b.x - a.x, b.y - a.y) / dt : 0; }
      for (let i = 0; i < p.length; i++) { let s = 0, n = 0; for (let j = -6; j <= 6; j++) { const q = p[i + j]; if (q) { s += q.v; n++; } } p[i].vs = s / n; }
      p.forEach((q, i) => { q.w = (.62 + .8 * Math.exp(-q.vs / 320)) * (1 + .16 * (noise(i * .045, 7.3) - .5)); });
      return new Line(p, o);
    }
  }
  G.Path = Path;

  class Line {
    constructor(p, o) { this.p = p; this.t0 = p[0].t; this.t1 = p[p.length - 1].t; this.o = o; }
    idx(t) { const p = this.p; let lo = 0, hi = p.length - 1; if (t <= p[0].t) return 0; if (t >= p[hi].t) return hi; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p[m].t <= t) lo = m; else hi = m; } return lo; }
    nib(t) { const p = this.p, i = this.idx(t), a = p[i], b = p[Math.min(p.length - 1, i + 1)]; const k = b.t > a.t ? clamp((t - a.t) / (b.t - a.t)) : 0;
      return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), i, w: lerp(a.w, b.w, k), v: a.vs, hold: !!b.hold && t < b.t && t > a.t }; }
    // the camera follows the nib with a little lag and anticipation
    follow(t) { let x = 0, y = 0; const d = [-.55, -.35, -.15, 0, .15, .3, .4]; for (const k of d) { const n = this.nib(clamp(t + k, this.t0, this.t1)); x += n.x; y += n.y; } return [x / d.length, y / d.length]; }
  }

  // ---------------- camera ----------------
  // keys: [t, cx, cy, zoom, follow]; follow 0 = composed frame, 1 = locked to the (averaged) nib
  G.camAt = (keys, t, line, W, H) => {
    let i = 0; while (i < keys.length - 2 && t >= keys[i + 1][0]) i++;
    const a = keys[i], b = keys[i + 1], k = eio(clamp((t - a[0]) / (b[0] - a[0])));
    let cx = lerp(a[1], b[1], k), cy = lerp(a[2], b[2], k); const z = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), k)), f = lerp(a[4], b[4], k);
    if (line && f > 0) { const [fx, fy] = line.follow(t); cx = lerp(cx, fx, f); cy = lerp(cy, fy, f);
      // soft clamp: keep the nib inside the central ~70 % while following
      const n = line.nib(t), lx = W * .34 / z, ly = H * .32 / z, dx = n.x - cx, dy = n.y - cy;
      if (Math.abs(dx) > lx) cx += (Math.abs(dx) - lx) * Math.sign(dx) * f; if (Math.abs(dy) > ly) cy += (Math.abs(dy) - ly) * Math.sign(dy) * f; }
    return { cx, cy, z };
  };
  G.apply = (x, cam, W, H) => x.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.cx * cam.z, H / 2 - cam.cy * cam.z);
  G.toScreen = (cam, W, H, x, y) => [W / 2 + (x - cam.cx) * cam.z, H / 2 + (y - cam.cy) * cam.z];

  // ---------------- renderer ----------------
  let L, lx, B, bx, paperTile, fibreTile;
  // bounds: the world rectangle the camera will ever see [x0, y0, x1, y1]; the mottling is painted once over it (no tile seams)
  let PB;
  G.init = (W, H, bounds = [-2000, -1500, 6000, 1500]) => {
    L = canvas(W, H); lx = L.getContext('2d'); B = canvas(W >> 1, H >> 1); bx = B.getContext('2d');
    // night paper: warm black, large soft mottling and long faint fibres, anchored to the world
    PB = bounds; const sc = 1 / 5, pw = Math.ceil((bounds[2] - bounds[0]) * sc), ph = Math.ceil((bounds[3] - bounds[1]) * sc);
    paperTile = canvas(pw, ph); { const x = paperTile.getContext('2d'), d = x.createImageData(pw, ph);
      for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) { const k = (j * pw + i) * 4, s = fbm(i * .012 + 40, j * .012 + 9, 5), s2 = fbm(i * .05, j * .05 + 70, 3);
        const g = clamp((s - .34) * 1.7) * (.75 + .25 * s2); d.data[k] = 70 * g; d.data[k + 1] = 48 * g; d.data[k + 2] = 30 * g; d.data[k + 3] = 255; }
      x.putImageData(d, 0, 0); }
    fibreTile = canvas(1024, 1024); { const x = fibreTile.getContext('2d'), r = Pilot.rng(5); x.lineCap = 'round';
      for (let i = 0; i < 260; i++) { let px = r() * 1024, py = r() * 1024, a = r() * 6.28; x.strokeStyle = `rgba(150,120,90,${.05 + r() * .07})`; x.lineWidth = .6 + r() * .8; x.beginPath(); x.moveTo(px, py);
        for (let s = 0; s < 14; s++) { a += (r() - .5) * .5; px += Math.cos(a) * 9; py += Math.sin(a) * 9; x.lineTo(px, py); } x.stroke(); } }
  };
  G.paper = (ctx, cam, W, H, o = {}) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = o.base || '#0c0907'; ctx.fillRect(0, 0, W, H);
    G.apply(ctx, cam, W, H); const x0 = cam.cx - W / 2 / cam.z, y0 = cam.cy - H / 2 / cam.z, ww = W / cam.z, hh = H / cam.z;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = o.mottle == null ? .55 : o.mottle; ctx.drawImage(paperTile, PB[0], PB[1], PB[2] - PB[0], PB[3] - PB[1]);
    const zf = clamp((cam.z - .45) / .5);             // fibres fade out when zoomed out (or they shimmer)
    if (zf > 0) { const ft = ctx.createPattern(fibreTile, 'repeat'); ctx.fillStyle = ft; ctx.globalAlpha = zf * (o.fibres == null ? 1 : o.fibres); ctx.fillRect(x0, y0, ww, hh); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.setTransform(1, 0, 0, 1, 0, 0);
  };
  G.vignette = (ctx, W, H, a = .7) => { const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .32, W / 2, H / 2, Math.hypot(W, H) * .6);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };

  // draw the drawn part of the line (up to time t) as light
  //  o.base  world width at zoom 1 · o.zmin  clamp for screen width during pull-backs · o.alpha · o.from (time the visible line starts)
  G.drawLine = (ctx, line, t, cam, W, H, o = {}) => {
    const p = line.p, base = o.base || 4.2, zw = Math.max(cam.z, o.zmin || .7) / cam.z, n = line.nib(t), last = n.i;
    lx.setTransform(1, 0, 0, 1, 0, 0); lx.clearRect(0, 0, W, H); G.apply(lx, cam, W, H);
    lx.lineCap = 'round'; lx.lineJoin = 'round'; lx.strokeStyle = o.color || '#f2c46c';
    const x0 = cam.cx - W / 2 / cam.z - 40, x1 = cam.cx + W / 2 / cam.z + 40, y0 = cam.cy - H / 2 / cam.z - 40, y1 = cam.cy + H / 2 / cam.z + 40;
    const in_ = q => q.x > x0 && q.x < x1 && q.y > y0 && q.y < y1;
    let i = Math.max(1, line.idx(o.from == null ? -1e9 : o.from) + 1);
    while (i <= last) {
      if (!in_(p[i]) && !in_(p[i - 1])) { i++; continue; }
      const w0 = p[i].w; lx.beginPath(); lx.moveTo(p[i - 1].x, p[i - 1].y); let j = i;
      while (j <= last && j < i + 10 && Math.abs(p[j].w - w0) < .05) { lx.lineTo(p[j].x, p[j].y); j++; }
      lx.lineWidth = base * w0 * zw; lx.stroke(); i = j === i ? i + 1 : j;
    }
    if (t > p[0].t && last < p.length - 1) { lx.beginPath(); lx.moveTo(p[last].x, p[last].y); lx.lineTo(n.x, n.y); lx.lineWidth = base * n.w * zw; lx.stroke(); }
    lx.setTransform(1, 0, 0, 1, 0, 0);
    G.bloom(ctx, L, W, H, o.alpha == null ? 1 : o.alpha, o.halo == null ? 1 : o.halo);
    return n;
  };
  // composite a light layer: wide halo + near glow + crisp hot core
  G.bloom = (ctx, src, W, H, a = 1, halo = 1) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    bx.clearRect(0, 0, W >> 1, H >> 1); bx.filter = 'blur(13px)'; bx.drawImage(src, 0, 0, W >> 1, H >> 1); bx.filter = 'none';
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .85 * a * halo; ctx.drawImage(B, 0, 0, W, H);
    ctx.filter = 'blur(3px)'; ctx.globalAlpha = .9 * a; ctx.drawImage(src, 0, 0); ctx.filter = 'none';
    ctx.globalAlpha = a; ctx.drawImage(src, 0, 0);
    ctx.filter = 'brightness(1.9) saturate(.55)'; ctx.globalAlpha = .55 * a; ctx.drawImage(src, 0, 0); ctx.filter = 'none';   // the white-hot core
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
  // the nib: a point of light, pooling while it rests; the paper glows around it
  G.nib = (ctx, line, t, cam, W, H, o = {}) => {
    if (t < line.t0 - .25 || t > line.t1 + .6) return;
    const n = line.nib(t), [sx, sy] = G.toScreen(cam, W, H, n.x, n.y), on = ss(line.t0 - .25, line.t0 + .1, t) * (1 - ss(line.t1, line.t1 + .6, t)) * (o.alpha == null ? 1 : o.alpha);
    // how long has the nib been resting? pooling grows with it
    let rest = 0; { const p = line.p, i = n.i; if (p[i + 1] && p[i + 1].hold && t > p[i].t) rest = clamp((t - p[i].t) / 1.2); }
    const fl = 1 + .12 * (noise(t * 7, 1.7) - .5), z = Math.max(cam.z, .6);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    const R0 = 260 * z * (1 + rest * .5), g0 = ctx.createRadialGradient(sx, sy, 0, sx, sy, R0); g0.addColorStop(0, `rgba(255,190,110,${.16 * on})`); g0.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = g0; ctx.fillRect(sx - R0, sy - R0, R0 * 2, R0 * 2);
    const R1 = (30 + 26 * rest) * z * fl, g1 = ctx.createRadialGradient(sx, sy, 0, sx, sy, R1); g1.addColorStop(0, `rgba(255,248,226,${.95 * on})`); g1.addColorStop(.25, `rgba(255,214,140,${.5 * on})`); g1.addColorStop(1, 'rgba(255,190,100,0)');
    ctx.fillStyle = g1; ctx.fillRect(sx - R1, sy - R1, R1 * 2, R1 * 2);
    if (rest > 0) {   // a drop of light swelling at the stopped nib, sagging downward
      ctx.fillStyle = `rgba(255,236,190,${.85 * on * rest})`; ctx.beginPath(); ctx.ellipse(sx, sy + 3 * rest * z, (3 + 4 * rest) * z, (3.5 + 6 * rest) * z, 0, 0, 6.283); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
  };

  // ---------------- written-on text ----------------
  // revealed left to right behind a soft edge, like ink following the nib. parts: [[str, colour], …] for two-tone lines
  let S, sx_;
  G.write = (ctx, str, x, y, prog, o = {}) => {
    if (prog <= 0 || (o.alpha != null && o.alpha <= 0)) return;
    const W = ctx.canvas.width, H = ctx.canvas.height; if (!S || S.width !== W || S.height !== H) { S = canvas(W, H); sx_ = S.getContext('2d'); }
    const size = o.size || 44, font = `${o.weight || 600} ${size}px ${o.font || "'Noto Serif KR',serif"}`, parts = o.parts || [[str, o.color || '#f6ead2']];
    sx_.setTransform(1, 0, 0, 1, 0, 0); sx_.font = font; sx_.letterSpacing = (o.ls || 0) + 'px';
    const ws = parts.map(q => sx_.measureText(q[0]).width), w = ws.reduce((a, b) => a + b, 0), left = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2;
    const pad = size * 1.2, rx = left - pad, ry = y - size * 1.5, rw = w + pad * 2, rh = size * 2.3;
    sx_.clearRect(rx, ry, rw, rh); sx_.textAlign = 'left'; sx_.textBaseline = 'alphabetic';
    if (o.glow) { sx_.shadowColor = o.glow; sx_.shadowBlur = o.glowBlur || 22; }
    let cx = left; parts.forEach((q, i) => { sx_.fillStyle = q[1]; sx_.fillText(q[0], cx, y); cx += ws[i]; });
    sx_.shadowBlur = 0; sx_.shadowColor = 'transparent';
    if (prog < 1) { const fe = o.feather || size * 1.1, e = lerp(left - fe, left + w, prog), g = sx_.createLinearGradient(e, 0, e + fe, 0);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); sx_.globalCompositeOperation = 'destination-in'; sx_.fillStyle = g; sx_.fillRect(rx, ry, rw, rh); sx_.globalCompositeOperation = 'source-over';
      if (o.spark) { const ex = e + fe * .5, ey = y - size * .38, r = size * 1.1, gg = ctx.createRadialGradient(ex, ey, 0, ex, ey, r);
        gg.addColorStop(0, `rgba(255,236,190,${.35 * o.spark * (o.alpha == null ? 1 : o.alpha)})`); gg.addColorStop(1, 'rgba(255,220,160,0)');
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gg; ctx.fillRect(ex - r, ey - r, r * 2, r * 2); ctx.restore(); } }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; ctx.drawImage(S, rx, ry, rw, rh, rx, ry, rw, rh); ctx.restore();
    return w;
  };
  G.measure = (str, o = {}) => { const c = canvas(4, 4).getContext('2d'); c.font = `${o.weight || 600} ${o.size || 44}px ${o.font || "'Noto Serif KR',serif"}`; c.letterSpacing = (o.ls || 0) + 'px'; return c.measureText(str).width; };

  window.GoldLine = G;
})();
