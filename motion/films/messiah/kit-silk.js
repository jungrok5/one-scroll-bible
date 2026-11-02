/* Silk — a silkscreen travel poster printed in code. Our own renderer; the craft follows the silkscreen-poster brief of
   Lemo-Opuscar (styles/silkscreen-poster, MIT) and the 1930s–40s national-park screen prints:
     · opaque hard-edged flat inks, ≤ 6 per poster, laid one pull at a time; no gradients (skies are stepped bands);
     · each ink a little off register (a paper sliver shows), a darker overprint sliver, a lit rim top-left on fresh ink;
     · values step from far (light) to near (dark); one bright accent (here gold — the promise; red once, the decree);
     · information is printed in order, one ink one beat — and it reads big (made for a phone first, a TV second).
   API: Silk.paper(w, h, seed) → canvas   Silk.ink(ctx, path, col, o = { reg:[dx,dy], k (pull 0..1), dir, sheen })
        Silk.bands(ctx, x, y, w, h, [colors], o)   Silk.title(ctx, text, x, y, size, col, o)   Silk.dashes(ctx, pts, k, o)  */
(function () {
  const P = Pilot, { clamp, lerp } = P;
  function paper(w, h, seed = 1) {
    const c = P.canvas(w, h), g = c.getContext('2d'); g.fillStyle = '#efe4cc'; g.fillRect(0, 0, w, h);
    const d = g.getImageData(0, 0, w, h), a = d.data, r = P.rng(seed);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, n = (r() - .5) * 8 + 6 * (P.noise(x * .03, y * .03) - .5); a[i] += n; a[i + 1] += n; a[i + 2] += n; }
    g.putImageData(d, 0, 0); return c;
  }
  // a squeegee pull reveals an ink from one side: k 0..1, dir 'down' | 'right' | 'up' | 'left'; the front is ragged
  function pullClip(ctx, k, dir, W, H) {
    if (k >= 1) return; const p = new Path2D(), n = 24;
    if (dir === 'down' || dir === 'up') { const y = lerp(-40, H + 40, k); p.moveTo(0, dir === 'down' ? 0 : H); for (let i = 0; i <= n; i++) { const x = W * i / n, yy = dir === 'down' ? y + 10 * Math.sin(i * 2.3) : H - y + 10 * Math.sin(i * 2.3); p.lineTo(x, yy); } p.lineTo(W, dir === 'down' ? 0 : H); }
    else { const x = lerp(-40, W + 40, k); p.moveTo(dir === 'right' ? 0 : W, 0); for (let i = 0; i <= n; i++) { const y = H * i / n, xx = dir === 'right' ? x + 10 * Math.sin(i * 2.3) : W - x + 10 * Math.sin(i * 2.3); p.lineTo(xx, y); } p.lineTo(dir === 'right' ? 0 : W, H); }
    p.closePath(); ctx.clip(p);
  }
  // one opaque ink: a darker overprint ghost, the ink (off register), a thin lit rim and a dark rim (ink thickness)
  function ink(ctx, path, col, o = {}) {
    const k = o.k ?? 1; if (k <= 0) return; const [dx, dy] = o.reg || [0, 0];
    ctx.save(); if (k < 1) pullClip(ctx, k, o.dir || 'down', o.W || P.W, o.H || P.H);
    ctx.translate(dx, dy);
    ctx.globalAlpha = .18; ctx.fillStyle = 'rgb(30,20,12)'; ctx.translate(2, 2); ctx.fill(path); ctx.translate(-2, -2);
    ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.fill(path);
    if (o.rim !== false) { ctx.save(); ctx.clip(path); ctx.globalAlpha = .22; ctx.strokeStyle = '#fff6e4'; ctx.lineWidth = 2.2; ctx.translate(1.4, 1.4); ctx.stroke(path); ctx.restore(); }
    if (o.sheen > 0) { ctx.save(); ctx.clip(path); ctx.globalAlpha = .18 * o.sheen; ctx.fillStyle = '#ffffff'; ctx.fill(path); ctx.restore(); }
    ctx.restore();
  }
  // a stepped sky: flat bands, each boundary broken into thinning stripes (the brief's gradient substitute)
  function bands(ctx, x, y, w, h, cols, o = {}) {
    const n = cols.length, bh = h / n;
    for (let i = 0; i < n; i++) { const p = new Path2D(); p.rect(x, y + i * bh, w, bh + 1);
      if (i < n - 1) for (let s = 0; s < 4; s++) { const sh = (4 - s) * bh * .035, sy = y + (i + 1) * bh + s * bh * .11; p.rect(x, sy, w, sh); }
      ink(ctx, p, cols[i], { k: o.k ?? 1, dir: o.dir, reg: [(i % 2) * 1.5, (i % 3) * 1], rim: false }); }
  }
  // a header printed into the sky: tracked, heavy, one ink; o.k pulls it in from the left like the rest
  function title(ctx, text, x, y, size, col, o = {}) {
    const k = o.k ?? 1; if (k <= 0) return; ctx.save(); if (k < 1) pullClip(ctx, k, 'right', P.W, P.H);
    ctx.font = `${o.weight || 900} ${size}px 'Noto Sans KR',sans-serif`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx) ctx.letterSpacing = (o.ls ?? size * .08) + 'px';
    if (o.shadow) { ctx.fillStyle = o.shadow; ctx.fillText(text, x + 3, y + 3); }
    ctx.fillStyle = col; ctx.fillText(text, x, y); ctx.restore();
  }
  // a route stamped segment by segment (dashes appear one by one up to k of the length); returns the head point
  function dashes(ctx, pts, k, o = {}) {
    const step = o.step || 26, dash = o.dash || 16, w = o.w || 8; let L = 0; const cum = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(L); }
    const at = s => { let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const f = (s - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; };
    ctx.save(); ctx.strokeStyle = o.color || '#f2b134'; ctx.lineWidth = w; ctx.lineCap = 'round';
    let head = pts[0]; for (let s = 0; s < L * clamp(k); s += step) { const a = at(s), b = at(Math.min(L, s + dash)); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); head = b; }
    ctx.restore(); return { head, L };
  }
  window.Silk = { paper, ink, bands, title, dashes, pullClip };
})();
