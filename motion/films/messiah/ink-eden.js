/* ink-eden.js — 「메시아」 2부 첫 장면, 에덴을 첫 영상 「02 타락」의 수묵(먹 번짐)으로 (2026-11-05; 관리자: "제안대로해" —
   목탄 에덴이 그림 리뷰에서 가장 낮아(5.8) 첫 영상의 타락 화풍으로 바꿈). The painting, brush, figures and the ink flood are
   motion/pilot/fall.html's own code, laid out above the words (Film.SAFE) and timed to this film:
     21.0  the paper comes up out of the night; the garden is painted in (far ranges in mist, the river of blank paper, one
           great tree, two small figures walking by the river)
     23.9  a drop of ink falls from the tree and blooms over the painting — "죄가 세상에 들어온 날" (G0); the two run and hide
     25.3  at "여자의 후손" (04, the gold word) one tiny gold point the ink could not cover (Gen 3:15)
     33.5  the point rises as the warm thread of the promise and leaves the frame toward Abraham (E1a, the pen sound)
   The words sit on ink: a wet wash under the caption band and a paler one under the place label (the scroll's dark mount).
   window.partEden(ctx, t) · window.partEden.point() = the gold point on screen after the last draw (partPair's flashback). */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, fbm, noise, canvas, rgb, speckle } = Pilot;
  const INK = [27, 25, 21], PAPER = [242, 236, 222];
  const B = { in: 21.0, paint: 21.1, figs: 22.6, drop: 23.9, flood: 24.2, run: 24.4, gold: 25.3, rise: 33.5, out: 37.2 };
  let W, H, V, L, tx, ty, th, paper, els, flood, floodF, FW, FH, fm, fmx, em, emx, tmp, tmx, grain, wash, last = [0, 0];

  // ---------- brush (fall.html) ----------
  function brush(x, pts, wfn, tone, o = {}) {
    const r = rng(o.seed || 1), n = o.n || 18, dry = o.dry || 0, N = pts.length;
    const len = []; let acc = 0; for (let i = 0; i < N; i++) { if (i) acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); len.push(acc); }
    const nrm = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1; return [nx / l, ny / l]; });
    x.lineCap = 'round'; x.lineJoin = 'round';
    for (let b = 0; b < n; b++) { const k = n === 1 ? 0 : b / (n - 1) - .5, side = o.loaded ? .55 + .45 * (k + .5) : 1, bj = (r() - .5) * .25, lw0 = .9 + r() * .8, bt = .78 + .22 * r(), ld = .6 + .6 * r();
      let open = false;
      const pt = i => { const w = wfn(len[i] / acc), off = (k + bj / n) * w; return [pts[i][0] + nrm[i][0] * off, pts[i][1] + nrm[i][1] * off, w]; };
      for (let i = 1; i < N; i++) { const s = len[i] / acc, load = 1 - dry * s * ld, brk = dry > 0 && noise(len[i] / 26 + b * 13.1, b * 3.7) < dry * .55 * (.4 + s);
        if (brk || load <= 0) { if (open) { x.stroke(); open = false; } continue; }
        if (!open) { const p0 = pt(i - 1); x.strokeStyle = rgb(INK, tone * load * side * bt); x.lineWidth = Math.max(.6, (p0[2] + wfn(.5)) / 2 / n * 2.1 * lw0); x.beginPath(); x.moveTo(p0[0], p0[1]); open = true; }
        const p1 = pt(i); x.lineTo(p1[0], p1[1]); }
      if (open) x.stroke(); }
  }
  const curve = (a, c, b, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const s = i / n, u = 1 - s; return [u * u * a[0] + 2 * u * s * c[0] + s * s * b[0], u * u * a[1] + 2 * u * s * c[1] + s * s * b[1]]; });
  const taper = (a, b) => s => lerp(a, b, s) * Math.min(1, s * 8 + .2);
  function dab(x, cx, cy, rx, ry, tone, rot = 0) {
    x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(1, ry / rx);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, rgb(INK, tone * .6)); g.addColorStop(.78, rgb(INK, tone * .8)); g.addColorStop(.92, rgb(INK, tone)); g.addColorStop(1, rgb(INK, 0));
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, 6.283); x.fill(); x.restore();
  }

  // ---------- the painting, element by element (each one revealed by its own bloom/wipe field) ----------
  // fall.html's times, compressed into this film's 2.3 s of painting
  function el(ft, fdur, field, paint) { const c = canvas(W, H), x = c.getContext('2d'); paint(x); const f = new Float32Array(FW * FH);
    for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) f[j * FW + i] = field(i * 4, j * 4); els.push({ c, t0: B.paint + ft * .4, dur: fdur * .55, f }); }
  const radial = (cx, cy, R, nz = .18) => (x, y) => Math.hypot(x - cx, y - cy) / R + (fbm(x * .008, y * .008, 3) - .5) * nz * 2;
  const sweep = (dx, dy, nz = .12) => (x, y) => (x * dx + y * dy) / (W * Math.abs(dx) + H * Math.abs(dy)) + (fbm(x * .006, y * .006, 3) - .5) * nz * 2;
  function range(x, peaks, base, tone, depth, cun, seed) {
    const ridge = px => { let m = 0; for (const [c, h, w] of peaks) { const u = Math.abs(px - c * W) / (w * W); if (u < 1) m = Math.max(m, h * H * Math.pow(1 - u, 1.35) * (1 + .1 * Math.sin(px * .03 + c * 9))); }
      return base * H - m - 14 * (fbm(px * .01, seed, 3) - .5) - (m > 0 ? 18 * (fbm(px * .02 + seed, 3, 3) - .5) : 0); };
    const d = x.getImageData(0, 0, W, H), D = d.data;
    for (let px = 0; px < W; px++) { const top = ridge(px), dd = depth * H * (.4 + .6 * clamp((base * H - top) / (H * .2)));
      for (let y = Math.max(0, top | 0); y < Math.min(H, top + dd); y++) { const k = (y - top) / dd, n = fbm(px * .015, y * .015, 3);
        const pk = clamp((base * H - top - 8) / 40); let a = (tone * (1 - Math.pow(k, .55)) * (.6 + .7 * n) + (y - top < 2.5 ? tone * 1.6 : 0) + (y - top < 12 ? tone * .45 * (1 - (y - top) / 12) : 0)) * pk;
        a = clamp(a); if (a < .005) continue; const i = (y * W + px) * 4; D[i] = INK[0]; D[i + 1] = INK[1]; D[i + 2] = INK[2]; D[i + 3] = Math.max(D[i + 3], a * 255); } }
    x.putImageData(d, 0, 0);
    if (cun) { const r = rng(seed * 7);
      for (let i = 0; i < cun; i++) { const pk = peaks[(r() * peaks.length) | 0], px = (pk[0] + (r() - .5) * 1.6 * pk[2]) * W, top = ridge(px); if (base * H - top < 30) continue;
        const sl = (ridge(px + 8) - ridge(px - 8)) / 16, dir = sl < 0 ? -1 : 1, l = 40 + r() * 110, y0 = top + 4 + r() * 20;
        brush(x, curve([px, y0], [px + dir * l * .25, y0 + l * .5], [px + dir * l * .38 + (r() - .5) * 10, y0 + l]), taper(4.5, 1), tone * 1.5, { n: 5, dry: .65, seed: i + 3 }); }
      for (let i = 0; i < cun * .5; i++) { const pk = peaks[(r() * peaks.length) | 0], px = (pk[0] + (r() - .5) * 1.4 * pk[2]) * W, top = ridge(px); if (base * H - top < 40) continue; dab(x, px, top + 1 + r() * 5, 2 + r() * 3.5, 1.6 + r() * 2.5, .92, r()); } }
  }
  function tree(x, bx, by, h, seed, tone = .82) {
    const r = rng(seed), tips = [];
    const go = (p, ang, len, w, d) => { const e = [p[0] + Math.sin(ang) * len, p[1] - Math.cos(ang) * len], m = [(p[0] + e[0]) / 2 + Math.cos(ang) * len * (r() - .5) * .3, (p[1] + e[1]) / 2 + Math.sin(ang) * len * (r() - .5) * .3];
      brush(x, curve(p, m, e, 30), taper(w, w * .55), tone, { n: Math.max(4, Math.round(w / 2.2)), loaded: true, dry: .18 + (3 - d) * .08, seed: seed + tips.length * 7 + d });
      if (d <= 0) { tips.push(e); return; }
      const k = d === 3 ? 3 : 2 + (r() < .4 ? 1 : 0);
      for (let i = 0; i < k; i++) { const sp = k === 2 ? (i ? 1 : -1) * (.35 + r() * .35) : (i - 1) * (.55 + r() * .25); go(e, ang + sp + (r() - .5) * .2, len * (.6 + r() * .18), w * .62, d - 1); } };
    go([bx, by], -.06, h * .4, h * .085, 3);
    brush(x, curve([bx - h * .2, by + 6], [bx, by - 8], [bx + h * .22, by + 8]), taper(h * .03, h * .008), .5, { n: 10, dry: .5, seed: seed + 99 });
    return tips;
  }
  function foliage(x, tips, rad, seed) {
    const r = rng(seed);
    for (const [cx, cy] of tips) { for (let j = 0; j < 22; j++) { const a = r() * 6.283, q = Math.sqrt(r()); dab(x, cx + Math.cos(a) * rad * q, cy + Math.sin(a) * rad * .7 * q - rad * .2, rad * (.18 + r() * .25), rad * (.12 + r() * .14), .08 + r() * .14, r() * 3); }
      for (let j = 0; j < 7; j++) { const a = r() * 6.283, q = .4 + .6 * r(); dab(x, cx + Math.cos(a) * rad * q, cy + Math.sin(a) * rad * .6 * q - rad * .2, 2.5 + r() * 4, 2 + r() * 3, .6 + r() * .3, r() * 3); } }
  }
  function buildPainting() {
    const r = rng(4), g = L.g;
    el(.3, 3.0, sweep(1, .15), x => range(x, V ? [[.18, .17, .3], [.82, .2, .3], [.5, .08, .2]] : [[.12, .28, .16], [.27, .2, .12], [.85, .27, .15], [.97, .2, .1], [.5, .07, .14]], V ? g - .2 : g - .18, .13, V ? .14 : .22, 0, 3));
    el(1.0, 3.0, sweep(-1, .1), x => range(x, V ? [[.04, .12, .22], [.95, .1, .2]] : [[.04, .2, .14], [.9, .2, .16], [.78, .11, .1]], V ? g - .1 : g - .04, .3, V ? .1 : .16, V ? 60 : 110, 8));
    el(2.0, 2.2, sweep(1, 0), x => {
      const yb = H * (g + (V ? .05 : .045));
      for (let i = 0; i < 7; i++) { const y = yb + i * (V ? 16 : 13) + r() * 5, x0 = W * (r() * .4), l = W * (.1 + r() * .22); brush(x, curve([x0, y], [x0 + l / 2, y - 3], [x0 + l, y + 1]), taper(2.2, .6), .28, { n: 3, dry: .6, seed: 40 + i }); }
      for (let i = 0; i < 14; i++) { const y = H * (g + .1) + r() * H * .08, x0 = r() * W, l = 80 + r() * 240; brush(x, curve([x0, y], [x0 + l / 2, y - 5], [x0 + l, y]), taper(5, 1.2), .4, { n: 6, dry: .75, seed: 60 + i }); }
      for (let i = 0; i < 34; i++) { const bx = W * (V ? .05 : .06) + r() * W * (V ? .3 : .2), by = H * (g + .07) + r() * 26, h = 20 + r() * 50, lean = (r() - .2) * 18; brush(x, curve([bx, by], [bx + lean * .3, by - h * .5], [bx + lean, by - h]), taper(3, .4), .55, { n: 2, seed: 90 + i }); }
    });
    let tips;
    el(2.6, 2.0, (x, y) => (ty - y) / th + (fbm(x * .01, y * .01, 3) - .5) * .2, x => { tips = tree(x, tx, ty, th, 11); });
    el(3.4, 2.4, radial(tx, ty - th * .72, th * .75), x => foliage(x, tips, th * .13, 12));
    el(3.8, 1.8, radial(W * .2, H * (g - (V ? .06 : .1)), H * .3), x => {
      const sx = W * (V ? .14 : .19), sy = H * (g + (V ? .04 : .03)), sh = H * (V ? .2 : .3), t2 = tree(x, sx, sy, sh, 21, .72); foliage(x, t2, sh * .12, 22);
      [[tx - th * .42, ty + 4], [tx + th * .5, ty + 6]].forEach(([bx, by], i) => { const r2 = rng(400 + i); for (let j = 0; j < 80; j++) { const q = r2(); dab(x, bx + (r2() - .5) * th * .32 * (1 - q * .5), by - q * th * .1, 4 + r2() * 7, 3 + r2() * 5, .12 + r2() * .2, r2() * 3); } });
    });
  }
  // ---------- the two (xieyi, fall.html): one pale body mass + two loaded strokes + a burnt-ink head ----------
  function figure(x, px, py, h, crouch, lean, fem, tone = 1, C = INK) {
    const u = h / 100, P_ = pts => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
    x.save(); x.translate(px, py); x.scale(lean * u, u); x.lineCap = 'round';
    if (crouch <= .5) {
      const mass = P_([[0, -84], [6, -80], [8.5, -66], [6.5, -52], [9, -38], [8, -22], [6.5, -3], [-5, -2], [-6.5, -20], [-9.5, -40], [-9.5, -50], [-6.5, -66], [-6, -80]]);
      x.fillStyle = rgb(C, .34 * tone); x.fill(mass);
      if (fem) { x.strokeStyle = rgb(C, .7 * tone); x.lineWidth = 5; x.beginPath(); x.moveTo(-2, -97); x.quadraticCurveTo(-11, -88, -9, -66); x.stroke(); }
      x.strokeStyle = rgb(C, .85 * tone); x.lineWidth = 3.4; x.beginPath(); x.moveTo(-4, -84); x.bezierCurveTo(-10, -66, -11, -50, -8, -40); x.quadraticCurveTo(-6, -20, -5, -2); x.stroke();
      x.lineWidth = 2.8; x.beginPath(); x.moveTo(2, -79); x.quadraticCurveTo(6.5, -66, 6, -48); x.stroke();
      x.strokeStyle = rgb(C, .95 * tone); x.lineWidth = 1.6; x.beginPath(); x.moveTo(5, -30); x.lineTo(7.5, -1); x.moveTo(-3, -30); x.lineTo(-4.5, -1); x.stroke();
      x.fillStyle = rgb(C, .95 * tone); x.beginPath(); x.ellipse(2, -92, 6.4, 7.6, .15, 0, 6.283); x.fill();
    } else {
      const mass = P_([[0, -50], [-9, -46], [-15, -35], [-16.5, -18], [-13, -3], [15, -3], [16, -10], [19, -28], [15, -34], [8, -40]]);
      x.fillStyle = rgb(C, .27 * tone); x.fill(mass);
      if (fem) { x.strokeStyle = rgb(C, .7 * tone); x.lineWidth = 5; x.beginPath(); x.moveTo(8, -54); x.quadraticCurveTo(-4, -54, -9, -38); x.stroke(); }
      x.strokeStyle = rgb(C, .9 * tone); x.lineWidth = 3.4; x.beginPath(); x.moveTo(-1, -50); x.bezierCurveTo(-14, -46, -18, -30, -13, -3); x.stroke();
      x.lineWidth = 2.6; x.beginPath(); x.moveTo(-12, -6); x.quadraticCurveTo(4, -12, 19, -28); x.lineTo(15, -3); x.stroke();
      x.lineWidth = 2.8; x.beginPath(); x.moveTo(1, -46); x.quadraticCurveTo(10, -30, 21, -27); x.stroke();
      x.fillStyle = rgb(C, .95 * tone); x.beginPath(); x.ellipse(11, -44, 6.2, 7, .9, 0, 6.283); x.fill();
    }
    x.restore();
  }
  // ---------- frame ----------
  function maskFor(e, p, soft = .06) { const d = emx.createImageData(FW, FH), D = d.data; for (let i = 0; i < FW * FH; i++) D[i * 4 + 3] = 255 * clamp((p * (1 + soft) - e.f[i]) / soft); emx.putImageData(d, 0, 0); return em; }
  function drawEl(ctx, e, t) {
    const p = clamp((t - e.t0) / e.dur); if (p <= 0) return;
    if (p >= 1) { ctx.drawImage(e.c, 0, 0); return; }
    tmx.globalCompositeOperation = 'source-over'; tmx.clearRect(0, 0, W, H); tmx.drawImage(e.c, 0, 0);
    tmx.globalCompositeOperation = 'destination-in'; tmx.imageSmoothingEnabled = true; tmx.drawImage(maskFor(e, eo(p)), 0, 0, W, H);
    ctx.drawImage(tmp, 0, 0);
  }
  const floodP = t => 1.08 * eo(clamp((t - B.flood) / 3.2));
  function drawFlood(ctx, t) {
    const p = floodP(t); if (p <= 0) return;
    const d = fmx.createImageData(FW, FH), D = d.data, ed = emx.createImageData(FW, FH), E = ed.data;
    for (let i = 0; i < FW * FH; i++) { const f = floodF[i], a = clamp((p - f) / .07); D[i * 4 + 3] = 255 * a; const e = p - f; E[i * 4 + 3] = e > 0 ? 255 * Math.exp(-(((e - .012) / .018) ** 2)) : 0; }
    fmx.putImageData(d, 0, 0); emx.putImageData(ed, 0, 0);
    tmx.globalCompositeOperation = 'source-over'; tmx.clearRect(0, 0, W, H); tmx.drawImage(flood, 0, 0);
    tmx.globalCompositeOperation = 'destination-in'; tmx.filter = 'blur(4px)'; tmx.drawImage(fm, 0, 0, W, H); tmx.filter = 'none';
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(tmp, 0, 0);
    { tmx.globalCompositeOperation = 'source-over'; tmx.clearRect(0, 0, W, H); tmx.fillStyle = rgb(INK, .55 * (1 - .55 * ss(1, 1.08, p))); tmx.fillRect(0, 0, W, H);
      tmx.globalCompositeOperation = 'destination-in'; tmx.drawImage(em, 0, 0, W, H); ctx.drawImage(tmp, 0, 0); }
    ctx.globalCompositeOperation = 'source-over';
  }
  function poses(t) {      // the two, stepped on twos (12 fps): they walk by the river, then run and hide
    const tf = Math.floor(t * 12) / 12, run = eio(clamp((tf - B.run) / 1.2)), walk = clamp((tf - B.figs - .2) / (B.drop - B.figs));
    return [0, 1].map(i => { const a = L.fig[i], b = L.hide[i], wx = a[0] * W + walk * 22;
      const x = lerp(wx, b[0] * W, run), y = lerp(a[1] * H, b[1] * H, run) - Math.abs(Math.sin(run * Math.PI * 4)) * 5 * (run > 0 && run < 1);
      return { x, y, crouch: ss(.75, 1, run), lean: i === 0 ? (run >= 1 ? -1 : 1) : (run > 0 ? 1 : -1), fem: i === 1 }; });
  }
  function partEdenInk(ctx, t) {
    if (!paper) init();
    // the camera never stops: a slow push toward the point until the dissolve into Abraham (frame-qa: no frozen stretch)
    const gp = [L.gold[0] * W, L.gold[1] * H], zk = eio(clamp((t - B.gold) / 8)), z = lerp(1, 1.035, eio(clamp((t - B.in) / (B.drop - B.in)))) * lerp(1, 1.12, zk) * (1 + .05 * clamp((t - B.gold - 6) / (B.out - B.gold - 6)));
    const ox = lerp(W / 2, gp[0], zk), oy = lerp(H / 2, gp[1], zk);
    ctx.save(); ctx.translate(ox, oy); ctx.scale(z, z); ctx.translate(-ox, -oy);
    ctx.drawImage(paper, 0, 0);
    ctx.globalCompositeOperation = 'multiply';
    for (const e of els) drawEl(ctx, e, t);
    const fa = ss(B.figs, B.figs + .6, t), ps = poses(t);
    if (fa > 0) for (const p of ps) figure(ctx, p.x, p.y, L.fh, p.crouch, p.lean, p.fem, fa);
    ctx.globalCompositeOperation = 'source-over';
    // the drop: a bead of ink falls from the canopy and blooms
    if (t > B.drop && t < B.flood + .3) { const k = clamp((t - B.drop) / (B.flood - B.drop)), fx = L.flood[0] * W, fy = lerp(L.flood[1] * H - 140, L.flood[1] * H, k * k);
      ctx.fillStyle = rgb(INK, .9); ctx.beginPath(); ctx.ellipse(fx, fy, 6, 8 + 6 * k, 0, 0, 6.283); ctx.fill(); }
    drawFlood(ctx, t);
    // hidden among the trees: the two become pale shapes where the ink did not take
    const ghost = ss(B.run + 1.1, B.run + 1.9, t);
    if (ghost > 0) for (const p of ps) { ctx.save(); ctx.globalAlpha = ghost * .8; ctx.filter = 'blur(.8px)'; figure(ctx, p.x, p.y, L.fh, 1, p.lean, p.fem, 1.5, PAPER); ctx.restore(); }
    ctx.restore();
    // the words sit on ink: the mount's wash under the caption band and the place label (drawn on the paper, not zoomed)
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(wash, 0, 0); ctx.restore();
    // the gold point: one tiny light the ink could not cover (fall.html) — where it is on screen after the zoom
    const sp = [(gp[0] - ox) * z + ox, (gp[1] - oy) * z + oy]; last = sp;
    const ga = ss(B.gold, B.gold + 1.4, t), rise = eo(clamp((t - B.rise) / (B.out - B.rise + .6)));
    if (ga > 0) { const pul = 1 + .12 * Math.sin(t * 2.2) * ss(B.gold + 1.4, B.gold + 3, t), R0 = (5 + 8 * ss(B.gold + .6, B.gold + 6, t)) * pul * (1 - .35 * rise);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      let g = ctx.createRadialGradient(sp[0], sp[1], 0, sp[0], sp[1], R0 * 22); g.addColorStop(0, `rgba(250,196,90,${.8 * ga})`); g.addColorStop(.22, `rgba(220,150,60,${.28 * ga})`); g.addColorStop(1, 'rgba(200,140,50,0)');
      ctx.fillStyle = g; ctx.fillRect(sp[0] - R0 * 22, sp[1] - R0 * 22, R0 * 44, R0 * 44);
      const r = rng(8); for (let i = 0; i < 26; i++) { const a = r() * 6.283, l = R0 * (3 + r() * 9) * ss(B.gold + 1, B.gold + 7, t); ctx.strokeStyle = `rgba(240,190,90,${(.08 + r() * .1) * ga})`; ctx.lineWidth = 1 + r();
        ctx.beginPath(); ctx.moveTo(sp[0], sp[1]); ctx.lineTo(sp[0] + Math.cos(a) * l, sp[1] + Math.sin(a) * l * .6); ctx.stroke(); }
      ctx.globalCompositeOperation = 'source-over'; g = ctx.createRadialGradient(sp[0], sp[1], 0, sp[0], sp[1], R0); g.addColorStop(0, `rgba(255,248,220,${ga})`); g.addColorStop(.5, `rgba(250,206,110,${ga})`); g.addColorStop(1, 'rgba(240,184,74,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sp[0], sp[1], R0, 0, 6.283); ctx.fill(); ctx.restore(); }
    // it rises as the thread of the promise and leaves the frame toward Abraham (the film's motif: thread2D)
    if (rise > 0) { const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push([lerp(sp[0], W + 90, u), sp[1] - Math.sin(u * 2.4) * H * (V ? .16 : .24) - u * H * (V ? .12 : .2)]); } thread2D(ctx, pts, rise); }
    // paper grain on top (fibres show through the ink), light vignette
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .1; ctx.drawImage(grain, 0, 0, W, H); ctx.restore();
    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .4, W / 2, H / 2, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(60,50,36,0)'); vg.addColorStop(1, 'rgba(60,50,36,.28)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // the paper comes up out of the night of part 1
    const f = 1 - ss(B.in, B.in + .9, t); if (f > 0) { ctx.fillStyle = `rgba(6,6,12,${clamp(f)})`; ctx.fillRect(0, 0, W, H); }
  }
  function init() {
    W = Pilot.W; H = Pilot.H; V = Pilot.ori === 'v'; FW = W / 4; FH = H / 4; els = [];
    // above the words: the ground line sits over Film.SAFE (portrait .64 H, landscape H − 270)
    const g = V ? .585 : .69;
    L = V ? { g, tree: [.63, g, .3], fig: [[.26, g], [.33, g + .005]], hide: [[.52, g + .005], [.74, g + .01]], fh: 120, gold: [.47, g + .025], top: .06, flood: [.6, .315] }
          : { g, tree: [.63, g, .4], fig: [[.34, g], [.39, g + .005]], hide: [[.565, g], [.705, g + .005]], fh: 108, gold: [.5, g + .03], top: .04, flood: [.63, .31] };
    tx = L.tree[0] * W; ty = L.tree[1] * H; th = L.tree[2] * H;
    tmp = canvas(W, H); tmx = tmp.getContext('2d'); fm = canvas(FW, FH); fmx = fm.getContext('2d'); em = canvas(FW, FH); emx = em.getContext('2d');
    // rice paper: warm, cloud-mottled, long fibres, pulp flecks
    paper = canvas(W, H); { const x = paper.getContext('2d'), d = x.createImageData(W, H), D = d.data;
      for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) { const m = fbm(i * .004, y * .004, 4), m2 = noise(i * .05, y * .05), v = 1 - .045 * m - .015 * m2, k = (y * W + i) * 4;
        D[k] = PAPER[0] * v; D[k + 1] = PAPER[1] * v; D[k + 2] = PAPER[2] * v * .995; D[k + 3] = 255; }
      x.putImageData(d, 0, 0); const r = rng(2);
      for (let i = 0; i < 1600; i++) { const px = r() * W, py = r() * H, a = r() * 6.283, l = 8 + r() * 40; x.strokeStyle = `rgba(${r() < .5 ? '255,252,244' : '200,190,170'},${.12 + r() * .2})`; x.lineWidth = .5 + r() * .6;
        x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l * .5 + (r() - .5) * 6, py + Math.sin(a) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
      for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(120,104,80,${.1 + r() * .2})`; x.fillRect(r() * W, r() * H, 1 + r() * 1.5, 1 + r() * 1.5); } }
    grain = speckle(W / 2, H / 2, 30, 7, .4);
    buildPainting();
    // the flood: heavy ink with mottling, granulation and paler cauliflower blooms
    flood = canvas(W, H); { const x = flood.getContext('2d'), d = x.createImageData(W, H), D = d.data;
      for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) { const n = fbm(i * .006, y * .006, 4), gg = noise(i * .4, y * .4), bl = fbm(i * .012 + 40, y * .012, 3);
        const dc = clamp(1 - Math.hypot(i - L.flood[0] * W, y - L.flood[1] * H) / (H * 1.1)), a = clamp(.62 + .2 * n + .05 * gg + .14 * dc - .12 * Math.max(0, bl - .6) * 3), k = (y * W + i) * 4; D[k] = INK[0]; D[k + 1] = INK[1]; D[k + 2] = INK[2]; D[k + 3] = a * 255; }
      x.putImageData(d, 0, 0); }
    floodF = new Float32Array(FW * FH); const tr = rng(61), tend = Array.from({ length: 12 }, (_, k) => [W * (.03 + .08 * k + tr() * .05), 90 + tr() * 130, 10 + tr() * 18]), fx = L.flood[0] * W, fy = L.flood[1] * H, top = L.top * H;
    for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) { const px = i * 4, py = j * 4;
      let f = Math.hypot((px - fx) * .85, py - fy) / Math.max(W, H) * 1.25 + (fbm(px * .005, py * .005, 4) - .5) * .32;
      const ey = top + 250 + 100 * (fbm(px * .0025, 5.3, 3) - .5) * 2 + 55 * (fbm(px * .008, 2.1, 3) - .5) * 2 + 18 * (fbm(px * .025, py * .01, 3) - .5) * 2;
      if (py < ey) { let pen = Math.pow((ey - py) / 200, 1.1) * 1.3;
        for (const [tx0, tl, tw] of tend) { const up = ey - py; if (up > tl) continue; const dd = Math.abs(px - (tx0 + 14 * Math.sin(py * .03 + tx0))); pen *= 1 - .97 * Math.exp(-((dd / (tw * (1 - .6 * up / tl))) ** 2)) * (1 - (up / tl) ** 2); }
        f += pen; }
      floodF[j * FW + i] = f; }
    // the mount's wash: wet ink under the caption band (from just above Film.SAFE down) and a paler one under the label
    wash = canvas(W, H); { const x = wash.getContext('2d'), d = x.createImageData(W, H), D = d.data, y0 = Film.SAFE() - (V ? 100 : 60), y1 = Film.SAFE() + 30, yt = V ? 380 : 190;
      for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) { const n = fbm(i * .006, y * .008, 4), e = 40 * (n - .5) * 2;
        const lo = .86 * ss(y0 + e, y1 + e, y) * (.9 + .1 * noise(i * .3, y * .3)), hi = .62 * (1 - ss(yt * .45 + e, yt + e, y)) * (.9 + .1 * noise(i * .3 + 9, y * .3));
        const a = clamp(Math.max(lo, hi)), k = (y * W + i) * 4; D[k] = 255 - (255 - INK[0]) * a; D[k + 1] = 255 - (255 - INK[1]) * a; D[k + 2] = 255 - (255 - INK[2]) * a; D[k + 3] = 255; }
      x.putImageData(d, 0, 0); }
  }
  window.partEden = partEdenInk;
  partEdenInk.point = () => last;   // where the gold point is on screen after the last draw (partPair remembers the garden)
})();
