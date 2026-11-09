/* GoldOil — golden oil, macro, high-speed, in the dark. Made for 「그리스도」 (2026-11): one drop of anointing oil falls,
   spreads into light; the three anointings (David · Aaron · Elisha) pour from a horn over backlit heads.
   What makes it read as OIL (not water, honey or lava): it is transparent amber (the light behind shows through it, upside
   down, as through a lens), its edge is a thick dark ring with a thin bright meniscus, a long viscous thread pinches off and
   leaves a satellite droplet, it never splashes — it lands, flattens and spreads as a smooth film with a raised rim, and its
   light is golden caustics, not glow from inside (it is never emissive; it only carries light that comes from behind).
   Camera language: macro lens — shallow focus, out-of-focus bokeh, motes drifting in the beam, a lens bloom from the bright
   parts, grain and a vignette.
   API (all in screen pixels; u/t in seconds):
     GOLD.grab(ctx, q=.25) → bg                     a small copy of what is drawn so far (what drops refract) — call after the backdrop
     GOLD.drop(ctx, x, y, r, u, o)                  a drop (per pixel: inverted refraction of bg, amber absorption, dark rim, fresnel, highlights)
         o: { bg, s (stretch, 1 = round, >1 tall), tp (taper, + = narrow top), neck: { top, hw: t→px } (a thread up to y=top),
              alpha, flip (mirror image), lens (2.4), dens (1), caus (.5), spec (1), rim (1), key: [lx,ly,lz] }
     GOLD.floor(w, h, o) → canvas                   a floor (old dark wood grain, or stone) in perspective, built once: o: { hor (screen y of the
         horizon), focus (screen y in focus — sharper there, defocused far and near), kind: 'wood'|'stone', seed, lines (grain density) }
     GOLD.pool(ctx, cx, cy, R, k, o)                a thin oil film spread on a surface seen at an angle — R = max radius px, k = spread 0..1.
         Per pixel it refracts what is under it (o.bg = GOLD.grab after the floor is drawn): the floor shows through, soaked and golden,
         bent by the raised meniscus, by the dome of a drop that just landed, and by faint rings.
         o: { bg, tilt (.16), t (s since landing), glow (0..1 light it carries), dome (0..1 height of the landing lens), domeR (.6 of k),
              caus (.6), sheen (1), rings: [[t0, amp, speed]…], ragged (1: how irregular the edge), seed, q (.55), alpha }
     GOLD.stream(ctx, x0, y0, x1, y1, k, o)         a pouring stream (parabola from a lip), or GOLD.stream(ctx, pts, k, o) along any path
         (oil running down a head) — k = how far it has reached 0..1; o: { w (px at the source), t, back (backlit), alpha, glints, taper }
     GOLD.horn(ctx, x, y, L, ang, o) → {x, y}       a ram's horn flask: oil leaves its narrow tip at (x,y); it widens towards angle ang (rad)
         and curls (curl .9), its wide end usually off frame; o: { curl, rim [r,g,b], rimA, light (rad: where the rim light comes from), fill }
     GOLD.motes(ctx, t, o)                          dust in the beam; o: { n, seed, x, y, w, h, light: [x,y,R], pull: [x,y,k, spreadX, spreadY], size, a }
     GOLD.bokeh(ctx, o)                             out-of-focus discs; o: { n, seed, x, y, w, h, r, col, a, t }
     GOLD.bloom(ctx, x, y, col, k, o)               lens bloom from a bright point (exposure falloff, soft streak, ghosts) — after W3.bloom
     GOLD.glow(ctx, k, o)                           bloom from every bright pixel of the frame (downscale → cube → blur → screen)
     GOLD.finish(ctx, t, o)                         grain + vignette (after W3.finish)
   Kits: (to package) canvas-film kits/goldoil. */
(function () {
  const P = Pilot, { clamp, lerp, ss } = P;
  const W = () => P.W, H = () => P.H;
  const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const ABS = [0.05, 0.22, 0.95];          // absorption per unit thickness: blue first, then green → amber/gold
  const GOLD_C = [255, 206, 120];

  // ---------------- what the drop refracts ----------------
  const GC = {};
  function grab(ctx, q = .25) {
    const cw = ctx.canvas.width, ch = ctx.canvas.height, w = Math.max(8, Math.round(cw * q)), h = Math.max(8, Math.round(ch * q)), key = w + 'x' + h;
    let c = GC[key]; if (!c) { const cv = P.canvas(w, h); c = GC[key] = cv.getContext('2d', { willReadFrequently: true }); }
    const gx = c; gx.globalCompositeOperation = 'copy'; gx.drawImage(ctx.canvas, 0, 0, w, h); gx.globalCompositeOperation = 'source-over';
    return { d: gx.getImageData(0, 0, w, h).data, w, h, q: w / cw };
  }
  function samp(bg, x, y, out) {
    if (!bg) { out[0] = 20; out[1] = 12; out[2] = 6; return out; }
    let fx = clamp(x * bg.q - .5, 0, bg.w - 1.001), fy = clamp(y * bg.q - .5, 0, bg.h - 1.001);
    const ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy, i = (iy * bg.w + ix) * 4, j = i + bg.w * 4, d = bg.d;
    for (let c = 0; c < 3; c++) { const a = d[i + c] + (d[i + 4 + c] - d[i + c]) * ax, b = d[j + c] + (d[j + 4 + c] - d[j + c]) * ax; out[c] = a + (b - a) * ay; }
    return out;
  }

  // ---------------- a drop ----------------
  const T1 = [0, 0, 0], T2 = [0, 0, 0];
  function drop(ctx, x, y, r, u, o = {}) {
    if (r < .8) return;
    const s = o.s || 1, ax = 1 / Math.sqrt(s), ay = s, tp = o.tp || 0, al = o.alpha == null ? 1 : o.alpha, bg = o.bg, nk = o.neck, flip = o.flip ? -1 : 1;
    const M = o.lens || 2.4, dens = o.dens == null ? .85 : o.dens, caus = o.caus == null ? .5 : o.caus, spK = o.spec == null ? 1 : o.spec, rimK = o.rim == null ? 1 : o.rim;
    let kx = -.42, ky = -.62, kz = .66; if (o.key) [kx, ky, kz] = o.key;
    let hx = kx, hy = ky, hz = kz + 1; const hl = Math.hypot(hx, hy, hz); hx /= hl; hy /= hl; hz /= hl;
    const wx = r * ax * (1 + Math.abs(tp)) + 3; let nkW = 0;
    if (nk) for (let t = 0; t <= 1; t += .1) nkW = Math.max(nkW, nk.hw(t));
    const cw = ctx.canvas.width, ch = ctx.canvas.height;
    const bx = Math.max(0, Math.floor(x - Math.max(wx, nkW + 3))), ex2 = Math.min(cw, Math.ceil(x + Math.max(wx, nkW + 3)));
    const by = Math.max(0, Math.floor(nk ? Math.min(nk.top, y - r * ay) - 3 : y - r * ay - 3)), ey2 = Math.min(ch, Math.ceil(y + r * ay + 3));
    const bw = ex2 - bx, bh = ey2 - by; if (bw <= 0 || bh <= 0) return;
    const img = ctx.getImageData(bx, by, bw, bh), d = img.data;
    const rpx = r * Math.min(ax, ay), KK = .28;
    for (let py = 0; py < bh; py++) {
      const Y = by + py + .5, dy = Y - y, ey = dy / (r * ay), txs = 1 + tp * clamp(ey, -1, 1);
      let hw = 0;
      if (nk && Y < y && Y >= nk.top) hw = nk.hw((Y - nk.top) / (y - nk.top));
      for (let pxx = 0; pxx < bw; pxx++) {
        const X = bx + pxx + .5, dx = X - x;
        const ex = dx / (r * ax * txs);
        let rho = Math.sqrt(ex * ex + ey * ey), nx = ex, ny = ey, edge = rpx;
        if (hw > .3) {                                    // thread: smooth union with the drop body
          const e2 = dx / hw, r2 = Math.abs(e2), h = clamp(.5 + .5 * (r2 - rho) / KK);
          const rs = lerp(r2, rho, h) - KK * h * (1 - h);
          nx = lerp(e2, nx, h); ny = lerp(-.15, ny, h); const nl = Math.hypot(nx, ny) || 1; nx = nx / nl * rs; ny = ny / nl * rs;
          rho = rs; edge = lerp(hw, rpx, h);
        }
        if (rho >= 1 + 1.5 / edge) continue;
        const cov = clamp((1 - rho) * edge + .5) * al; if (cov <= 0) continue;
        const rr = Math.min(rho, .995), nl0 = rho > 1e-5 ? rr / rho : 0; nx *= nl0; ny *= nl0 * flip;
        const nz = Math.sqrt(1 - rr * rr);
        // refraction: a ball lens shows what is behind it upside down and squeezed (wide field near the rim)
        const g = (1 + 1.7 * rr * rr) * M * r;
        samp(bg, X - nx * g, Y - ny * flip * g, T1);
        const th = 2 * nz * dens, gain = 1.18 + .7 * nz;
        let cr = T1[0] * Math.exp(-ABS[0] * th) * gain + GOLD_C[0] * .07 * nz;
        let cg = T1[1] * Math.exp(-ABS[1] * th) * gain + GOLD_C[1] * .05 * nz;
        let cb = T1[2] * Math.exp(-ABS[2] * th) * gain + GOLD_C[2] * .02 * nz;
        const rim = ss(.70, .985, rr), dk = 1 - .9 * rim; cr *= dk; cg *= dk; cb *= dk;
        // fresnel: the rim mirrors the room (not inverted)
        const F = .04 + .96 * Math.pow(1 - nz, 5);
        samp(bg, X + nx * r * 1.6, Y + ny * flip * r * 1.6 - r * .5, T2);
        cr = cr * (1 - F) + T2[0] * F * 1.5; cg = cg * (1 - F) + T2[1] * F * 1.45; cb = cb * (1 - F) + T2[2] * F * 1.3;
        // highlights: key light (sharp + soft), a softbox window, a thin back rim, the caustic focus at the bottom
        const hd = Math.max(0, nx * hx + ny * hy + nz * hz);
        let sp = (Math.pow(hd, 260) * 2.6 + Math.pow(hd, 30) * .16) * spK;
        const qx = (nx + .30) / .17, qy = (ny + .40) / .08;                     // ny is the shading normal (mirrored when flip)
        const sb = Math.exp(-Math.pow(qx * qx, 2) - Math.pow(qy * qy, 2)) * .55 * spK * (o.flip ? .5 : 1);
        const br = Math.pow(rr, 22) * clamp(.35 - ny * .9) * rimK;
        const cz = Math.exp(-(nx / .40) * (nx / .40) - ((ny - .60) / .15) * ((ny - .60) / .15)) * caus * (1 - rim * .6);
        cr += (sp + sb) * 255 + br * 255 + cz * 255; cg += (sp + sb) * 246 + br * 205 + cz * 214; cb += (sp + sb) * 228 + br * 130 + cz * 140;
        const i = (py * bw + pxx) * 4;
        d[i] = d[i] + (cr - d[i]) * cov; d[i + 1] = d[i + 1] + (cg - d[i + 1]) * cov; d[i + 2] = d[i + 2] + (cb - d[i + 2]) * cov;
      }
    }
    ctx.putImageData(img, bx, by);
  }

  // ---------------- a film of oil spreading on a dark plane ----------------
  let pc = null, px2 = null;
  const U = [0, 0, 0];
  function pool(ctx, cx, cy, R, k, o = {}) {
    if (k <= 0) return;
    const tilt = o.tilt || .16, t = o.t || 0, q = o.q || .55, glow = o.glow || 0, causK = o.caus == null ? .25 : o.caus, seed = o.seed || 7, rings = o.rings || [];
    const sheen = o.sheen == null ? 1 : o.sheen, bg = o.bg, dome = o.dome || 0, domeR = (o.domeR || .6) * k, rag = o.ragged == null ? 1 : o.ragged;
    const rad = k * (1 + .12 * rag), Rw = R * rad + 6, Rh = R * tilt * rad + 6;
    const w = Math.max(4, Math.ceil(2 * Rw * q)), h = Math.max(4, Math.ceil(2 * Rh * q));
    if (!pc || pc.width < w || pc.height < h) { pc = P.canvas(Math.max(w, pc ? pc.width : 0), Math.max(h, pc ? pc.height : 0)); px2 = pc.getContext('2d', { willReadFrequently: true }); }
    const img = px2.createImageData(w, h), d = img.data, tf = t * .16, X0 = cx - Rw, Y0 = cy - Rh;
    // ragged edge: the film creeps out unevenly (slow fingers), a function of the angle only
    const EN = 256, ER = new Float32Array(EN + 1);
    for (let i = 0; i <= EN; i++) { const a = i / EN * 6.2832, ca = Math.cos(a), sa = Math.sin(a);
      ER[i] = k * (1 + rag * (.05 * Math.sin(3 * a + seed + t * .08) + .035 * Math.sin(5 * a + seed * 2.3 - t * .05) + .022 * Math.sin(8 * a + seed * 3.7) + .012 * Math.sin(13 * a + seed * 5.1 + t * .1))); }
    const live = rings.map(([t0, amp, sp = .22]) => { const tt = t - t0; return tt > 0 ? [sp * tt * (1 + .3 / (1 + tt)), amp * Math.exp(-tt * .55)] : null; }).filter(Boolean);
    for (let j = 0; j < h; j++) {
      const Ys = Y0 + (j + .5) / q, Yp = (Ys - cy) / (R * tilt);
      for (let i = 0; i < w; i++) {
        const Xs = X0 + (i + .5) / q, Xp = (Xs - cx) / R, dd = Math.hypot(Xp, Yp);
        if (dd > rad) continue;
        const ca = dd > 1e-6 ? Xp / dd : 1, sa = dd > 1e-6 ? Yp / dd : 0;
        let ai = Math.atan2(sa, ca) / 6.2832; if (ai < 0) ai += 1; const fi = ai * EN, i0 = fi | 0, edgeR = ER[i0] + (ER[i0 + 1] - ER[i0]) * (fi - i0);
        const scr = R * Math.hypot(ca, sa * tilt), dS = (edgeR - dd) * scr;             // screen px inside the edge
        if (dS < -2) continue;
        const cov = ss(-2, 5, dS);
        // thickness: a meniscus band just inside the edge, the landing dome, faint rings — refraction follows the slope
        const men = Math.exp(-(((dS - 11) / 9) ** 2)), menS = -(dS - 11) / 9 * men;           // slope across the band
        let off = menS * 5;                                                                  // px, along (ca, sa)
        let hd = 0; if (dome > 0) { const z = dd / domeR; hd = dome * Math.exp(-z * z); off += -2 * z * hd * domeR * R * .55; }
        let wav = 0; for (const [rr, a] of live) { const z = (dd - rr) / .045; if (z > -4 && z < 4) wav += a * Math.exp(-z * z) * Math.sin(z * 3.2); }
        off += wav * 7;
        if (bg) samp(bg, Xs + ca * off, Ys + sa * tilt * off * 2.2, U); else { U[0] = 40; U[1] = 24; U[2] = 10; }
        // what is under, soaked in oil: darker-richer, golden, carrying the light
        const lit = 1.05 + .42 * glow * Math.pow(Math.max(0, 1 - dd / edgeR), .6) + .25 * hd;
        let cr = U[0] * 1.18 * lit + 10, cg = U[1] * .98 * lit + 5, cb = U[2] * .6 * lit;
        // the far light mirrored in the film, a sharp highlight, the lit meniscus, soft caustics
        const xr = Xp / edgeR, yr = Yp / edgeR;
        const sh = Math.exp(-(((yr + .5) / .26) ** 2) - ((xr / .5) ** 2)) * sheen * .2;
        let sp = Math.exp(-(((yr + .6) / .07) ** 2) - ((xr / .18) ** 2)) * sheen * .55;
        if (hd > .02) { const xd = Xp / domeR, yd = Yp / domeR; sp += hd * (Math.exp(-(((yd + .5) / .2) ** 2) - ((xd / .28) ** 2)) * 1.8 + Math.exp(-(((yd - .55) / .25) ** 2) - ((xd / .5) ** 2)) * .5); }
        const ml = men * (.08 + .20 * Math.max(0, -sa) + .04 * Math.max(0, sa)) * (.6 + .4 * glow);
        const wx = P.noise(Xp * 1.6 + seed, Yp * 1.6 + tf) - .5, wy = P.noise(Xp * 1.6 + 17, Yp * 1.6 - tf + seed) - .5;
        const r1 = 1 - Math.abs(2 * P.noise(Xp * 7 + wx * 1.4 + tf + seed, Yp * 7 + wy * 1.4 - tf * .6) - 1);
        const cs = Math.pow(r1, 12) * causK * (.10 + .22 * glow) * ss(4, 30, dS), soft = .1 * (P.noise(Xp * 2.2 + tf, Yp * 2.2 + seed) - .5) * (.4 + glow);
        const add = sh + sp + ml + cs + soft + Math.abs(wav) * .06;
        cr += add * 255; cg += add * 205; cb += add * 120 + sp * 60;
        const ii = (j * w + i) * 4; d[ii] = cr; d[ii + 1] = cg; d[ii + 2] = cb; d[ii + 3] = cov * 255;
      }
    }
    px2.clearRect(0, 0, pc.width, pc.height); px2.putImageData(img, 0, 0);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    ctx.drawImage(pc, 0, 0, w, h, X0, Y0, w / q, h / q); ctx.restore();
  }

  // ---------------- a floor in perspective (built once) ----------------
  function floor(w, h, o = {}) {
    const hor = o.hor == null ? h * .4 : o.hor, focus = o.focus == null ? h * .55 : o.focus, seed = o.seed || 3, kind = o.kind || 'wood', F = o.lines || 13;
    const c = P.canvas(w, h), x = c.getContext('2d'), im = x.createImageData(w, h), d = im.data;
    for (let y = Math.max(0, Math.floor(hor)); y < h; y++) {
      const kk = Math.max(.004, (y - hor) / h), Z = .06 / kk, fade = Math.exp(-Math.max(0, Z - .25) * .9);   // depth; far detail fades (no moiré)
      for (let xx = 0; xx < w; xx++) {
        const X = (xx - w / 2) / h * Z, Y = Z;
        let r, g, b;
        if (kind === 'wood') {
          const near = 1 - .65 * ss(.14, .5, kk);
          // growth lines: uneven spacing (low-frequency drift), gentle wander along the board, uneven thickness
          const v = Y * F + 2.4 * P.fbm(X * .7 + seed, Y * 1.6, 3) + .7 * P.fbm(X * 4 + seed, Y * 3, 2) + .1 * Math.sin(X * 9 + 2 * P.noise(X * 3, Y * 2 + seed));
          const ring = .5 + .5 * Math.sin(v * 6.2832), late = Math.pow(ring, 3 + 6 * P.noise(X * 2 + 5, Y * 4));   // latewood lines, darker
          // fibres and pores: long thin streaks along the grain, a few wider ones
          const fib = (P.noise(X * 5 + seed, Y * 30) - .5) * 1.1 + (P.noise(X * 2 + 11, Y * 12 + seed) - .5) * .8,
            pore = Math.pow(1 - Math.abs(2 * P.noise(X * 9 + 3, Y * 55 + seed) - 1), 10) * fade,
            blot = P.fbm(X * 2.2 + 9, Y * 1.5 + seed, 3), tone = P.fbm(X * .6 + 4, Y * .3, 2);
          const l = (.55 + .30 * blot + .25 * tone) * (1 - .5 * late * fade * near) * (1 + .32 * fib * fade) * (1 - .35 * pore);
          r = 74 * l + 6; g = 46 * l + 4; b = 26 * l + 2;
        } else {
          const m = P.fbm(X * 3 + seed, Y * 3, 4), cr = Math.pow(1 - Math.abs(2 * P.noise(X * 5 + 7, Y * 5 + seed) - 1), 24) * fade;
          const l = (.55 + .5 * m) * (1 - .6 * cr) * (1 + .15 * (P.noise(X * 60, Y * 60) - .5) * fade);
          r = 66 * l + 6; g = 50 * l + 5; b = 36 * l + 4;
        }
        const i = (y * w + xx) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
      }
    }
    x.putImageData(im, 0, 0);
    // macro depth of field: sharp around the focus row, soft far and near
    const bl = P.canvas(w, h), bx = bl.getContext('2d'); bx.filter = `blur(${Math.round(h * .0022)}px)`; bx.drawImage(c, 0, 0); bx.filter = 'none';
    const sh = P.canvas(w, h), sx = sh.getContext('2d'); sx.drawImage(c, 0, 0); sx.globalCompositeOperation = 'destination-in';
    const g = sx.createLinearGradient(0, hor, 0, h); const f0 = clamp((focus - hor) / (h - hor));
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(clamp(f0 - .25), 'rgba(0,0,0,0)'); g.addColorStop(clamp(f0 - .08), 'rgba(0,0,0,1)'); g.addColorStop(clamp(f0 + .3), 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,.4)');
    sx.fillStyle = g; sx.fillRect(0, 0, w, h);
    bx.drawImage(sh, 0, 0);
    bx.globalCompositeOperation = 'destination-in'; const g2 = bx.createLinearGradient(0, hor - 2, 0, hor + h * .03); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)'); bx.fillStyle = g2; bx.fillRect(0, 0, w, h);
    return bl;
  }

  // ---------------- a pouring stream / a rivulet ----------------
  function pathOf(x0, y0, x1, y1, n = 48) { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push([lerp(x0, x1, t), y0 + (y1 - y0) * (.18 * t + .82 * t * t)]); } return pts; }
  function stream(ctx, a, b, c, d, e, f) {
    let pts, k, o;
    if (Array.isArray(a)) { pts = a; k = b; o = c || {}; } else { pts = pathOf(a, b, c, d); k = e; o = f || {}; }
    if (k <= 0 || pts.length < 2) return;
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const tot = L[L.length - 1], end = tot * clamp(k), t = o.t || 0, w0 = o.w || 10, taper = o.taper == null ? 1.6 : o.taper, back = !!o.back;
    // resample along the reached length
    const S = []; const n = Math.max(8, Math.ceil(end / 4));
    let seg = 0;
    for (let i = 0; i <= n; i++) {
      const sl = end * i / n; while (seg < L.length - 2 && L[seg + 1] < sl) seg++;
      const u = (sl - L[seg]) / ((L[seg + 1] - L[seg]) || 1), p0 = pts[seg], p1 = pts[seg + 1];
      const tx = p1[0] - p0[0], ty = p1[1] - p0[1], tl = Math.hypot(tx, ty) || 1;
      const sN = sl / tot;
      let w = w0 / Math.sqrt(1 + taper * sN);
      w *= 1 + .14 * Math.sin(sl / (w0 * 3.2) * 6.283 - t * 9) * ss(0, .15, sN);          // varicose ripple running down
      if (k < 1) w *= 1 + .7 * ss(end - w0 * 3, end, sl);                                    // the head of the flow is a bead
      S.push([lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u), -ty / tl, tx / tl, w, sl]);
    }
    const poly = (f, sh) => { ctx.beginPath(); for (let i = 0; i < S.length; i++) { const q = S[i]; ctx.lineTo(q[0] + q[2] * q[4] * (f + sh), q[1] + q[3] * q[4] * (f + sh)); }
      for (let i = S.length - 1; i >= 0; i--) { const q = S[i]; ctx.lineTo(q[0] + q[2] * q[4] * (-f + sh), q[1] + q[3] * q[4] * (-f + sh)); } ctx.closePath(); };
    ctx.save(); ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    // glow in the air around it (backlit oil is a line of light)
    ctx.globalCompositeOperation = 'screen';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); S.forEach(q => ctx.lineTo(q[0], q[1]));
    for (const [f, a] of [[9, .045], [4.5, .08]]) { ctx.lineWidth = w0 * f; ctx.strokeStyle = css(back ? [255, 170, 70] : [210, 130, 50], a); ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over';
    const lay = back
      ? [[1, 0, [96, 46, 8], .95], [.78, 0, [190, 110, 28], .95], [.5, -.1, [246, 170, 64], .95], [.22, -.28, [255, 226, 150], 1], [.08, -.48, [255, 252, 238], 1]]
      : [[1, 0, [52, 26, 6], .96], [.78, 0, [140, 76, 18], .95], [.48, -.12, [214, 140, 44], .9], [.18, -.4, [255, 228, 160], 1], [.07, -.55, [255, 252, 240], 1]];
    for (const [f, sh, col, a] of lay) { poly(f, sh); ctx.fillStyle = css(col, a); ctx.fill(); }
    // a dark refraction line near the far edge, and glints riding down
    poly(.1, .62); ctx.fillStyle = css([40, 18, 2], .55); ctx.fill();
    const ng = o.glints == null ? 5 : o.glints;
    for (let g = 0; g < ng; g++) {
      const sl = ((g / ng) * tot + t * (o.speed || 260)) % tot; if (sl > end) continue;
      let i = 0; while (i < S.length - 1 && S[i][5] < sl) i++; const q = S[i];
      const gr = q[4] * .55, gx = q[0] - q[2] * q[4] * .3, gy = q[1] - q[3] * q[4] * .3;
      const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * 2.2); gg.addColorStop(0, 'rgba(255,252,240,.95)'); gg.addColorStop(.3, 'rgba(255,220,150,.45)'); gg.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = gg; ctx.fillRect(gx - gr * 2.2, gy - gr * 2.2, gr * 4.4, gr * 4.4); ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    return S.length ? { x: S[S.length - 1][0], y: S[S.length - 1][1] } : null;
  }

  // ---------------- a ram's horn flask ----------------
  // the oil leaves from the narrow tip at (x,y); the horn widens along angle ang and curls (its wide end usually off frame)
  function horn(ctx, x, y, L, ang, o = {}) {
    const curl = o.curl == null ? .9 : o.curl, rim = o.rim || [255, 186, 96], rimA = o.rimA == null ? .85 : o.rimA, la = o.light == null ? ang + Math.PI / 2 : o.light;
    const N = 48, C = [];
    let px = x, py = y, a = ang;
    for (let i = 0; i <= N; i++) { const s = i / N; C.push([px, py, a, L * (.014 + .19 * Math.pow(s, 1.1))]); a += curl * 1.6 / N * (1 - .5 * s); px += Math.cos(a) * L / N; py += Math.sin(a) * L / N; }
    const lx = Math.cos(la), ly = Math.sin(la);
    const outline = (dx, dy, k = 1) => { ctx.beginPath(); C.forEach(([cx, cy, a, w]) => ctx.lineTo(cx + Math.cos(a + Math.PI / 2) * w * k + dx, cy + Math.sin(a + Math.PI / 2) * w * k + dy));
      for (let i = C.length - 1; i >= 0; i--) { const [cx, cy, a, w] = C[i]; ctx.lineTo(cx - Math.cos(a + Math.PI / 2) * w * k + dx, cy - Math.sin(a + Math.PI / 2) * w * k + dy); } ctx.closePath(); };
    const off = L * .006;
    ctx.save();
    outline(lx * off, ly * off); ctx.fillStyle = css(rim, rimA); ctx.fill();                       // rim where the light wraps the edge
    outline(-lx * off * .4, -ly * off * .4); ctx.fillStyle = o.fill || '#120a05'; ctx.fill();
    // horn is translucent: where it is thin (towards the tip) the light behind shows amber through it
    ctx.save(); outline(0, 0, .9); ctx.clip(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(x, y, 0, x, y, L * .45); g.addColorStop(0, css([200, 110, 40], .55)); g.addColorStop(1, css([120, 60, 20], 0)); ctx.fillStyle = g; ctx.fillRect(x - L, y - L, 2 * L, 2 * L);
    // growth ridges, faint
    ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = css(rim, .07); ctx.lineWidth = Math.max(1, L * .003);
    for (let i = 8; i < N; i += 3) { const [cx, cy, a, w] = C[i], nx = Math.cos(a + Math.PI / 2), ny = Math.sin(a + Math.PI / 2); ctx.beginPath(); ctx.moveTo(cx + nx * w, cy + ny * w); ctx.quadraticCurveTo(cx - Math.cos(a) * w * .3, cy - Math.sin(a) * w * .3, cx - nx * w, cy - ny * w); ctx.stroke(); }
    ctx.restore();
    // a bead of oil at the tip
    const gg = ctx.createRadialGradient(x, y, 0, x, y, L * .03); gg.addColorStop(0, 'rgba(255,240,200,.95)'); gg.addColorStop(.4, 'rgba(255,190,90,.6)'); gg.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = gg; ctx.fillRect(x - L * .03, y - L * .03, L * .06, L * .06);
    ctx.restore();
    return { x, y, w: C[0][3] };
  }

  // ---------------- motes and bokeh ----------------
  function motes(ctx, t, o = {}) {
    const n = o.n || 60, R = P.rng(o.seed || 5), x0 = o.x || 0, y0 = o.y || 0, w = o.w || W(), h = o.h || H(), L = o.light, pl = o.pull, sz = o.size || 1, A = o.a == null ? 1 : o.a;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < n; i++) {
      const bx = R(), by = R(), z = R(), ph = R() * 6.28, sp = .004 + R() * .01, dl = R();
      let x = x0 + ((bx + Math.sin(t * .21 + ph) * .02 + t * sp * .4) % 1) * w, y = y0 + ((by - t * sp + 10) % 1) * h;
      if (pl && pl[2] > 0) { const kk = P.eio(clamp((pl[2] - dl * .45) / .55)); const spx = pl[3] || 20, spy = pl[4] || 8, rq = Math.sqrt(dl); x = lerp(x, pl[0] + Math.cos(ph) * spx * rq, kk); y = lerp(y, pl[1] + Math.sin(ph) * spy * rq, kk); }
      let lit = .25; if (L) { const dd = Math.hypot(x - L[0], y - L[1]) / L[2]; lit = Math.exp(-dd * dd * 1.2); }
      if (lit < .02) continue;
      const near = z > .86, r = (near ? 7 + 10 * (z - .86) / .14 : .9 + 1.8 * z) * sz, a = (near ? .10 : .55 + .4 * Math.sin(t * 2 + ph * 3)) * lit * A;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * (near ? 1 : 2.2)); g.addColorStop(0, css([255, 226, 160], a)); g.addColorStop(near ? .8 : .35, css([255, 196, 110], a * (near ? .8 : .4))); g.addColorStop(1, 'rgba(255,190,100,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
    }
    ctx.restore();
  }
  function bokeh(ctx, o = {}) {
    const n = o.n || 8, R = P.rng(o.seed || 9), x0 = o.x || 0, y0 = o.y || 0, w = o.w || W(), h = o.h || H(), t = o.t || 0;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < n; i++) {
      const x = x0 + R() * w + Math.sin(t * .1 + i) * 6, y = y0 + R() * h, r = (o.r || 60) * (.5 + R()), a = (o.a || .08) * (.4 + R() * .8), col = o.col || [255, 180, 90];
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, css(col, a * .7)); g.addColorStop(.82, css(col, a)); g.addColorStop(.95, css(col, a * .5)); g.addColorStop(1, css(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    }
    ctx.restore();
  }

  // ---------------- lens ----------------
  function bloom(ctx, x, y, col, k, o = {}) {
    if (k <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen';
    const R = (o.r || 140) * (.8 + .4 * k); let g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, css([255, 250, 236], .95 * k)); g.addColorStop(.18, css(col, .7 * k)); g.addColorStop(1, css(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    if (o.streak !== 0) { const sw = W() * (o.streak || .45); g = ctx.createLinearGradient(x - sw, 0, x + sw, 0); g.addColorStop(0, css(col, 0)); g.addColorStop(.5, css(P.mix(col, [255, 250, 236], .5), .28 * k)); g.addColorStop(1, css(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - sw, y - 2, 2 * sw, 4); }
    if (o.ghosts !== false) { const cx = W() / 2, cy = H() / 2; for (const [m, r, a] of [[-.45, 26, .10], [-.9, 60, .06]]) { const gx = cx + (x - cx) * m, gy = cy + (y - cy) * m, gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, r); gg.addColorStop(0, css(col, a * k)); gg.addColorStop(1, css(col, 0)); ctx.fillStyle = gg; ctx.fillRect(gx - r, gy - r, 2 * r, 2 * r); } }
    ctx.restore();
  }
  let bc = null, bx2 = null, bc2 = null, bx3 = null;
  function glow(ctx, k = .6, o = {}) {
    if (k <= 0) return;
    const q = o.q || 1 / 6, cw = ctx.canvas.width, ch = ctx.canvas.height, w = Math.round(cw * q), h = Math.round(ch * q);
    if (!bc || bc.width !== w || bc.height !== h) { bc = P.canvas(w, h); bx2 = bc.getContext('2d'); bc2 = P.canvas(w, h); bx3 = bc2.getContext('2d'); }
    bx2.globalCompositeOperation = 'copy'; bx2.filter = 'none'; bx2.drawImage(ctx.canvas, 0, 0, w, h);
    bx2.globalCompositeOperation = 'multiply'; bx2.drawImage(bc, 0, 0); bx2.drawImage(bc, 0, 0);   // ≈ x³: only bright parts survive
    bx3.globalCompositeOperation = 'copy'; bx3.filter = `blur(${o.blur || 7}px)`; bx3.drawImage(bc, 0, 0); bx3.filter = 'none';
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.imageSmoothingEnabled = true; ctx.drawImage(bc2, 0, 0, cw, ch);
    if (o.wide) { bx3.globalCompositeOperation = 'copy'; bx3.filter = `blur(${(o.blur || 7) * 3}px)`; bx3.drawImage(bc, 0, 0); bx3.filter = 'none'; ctx.globalAlpha = k * o.wide; ctx.drawImage(bc2, 0, 0, cw, ch); }
    ctx.restore();
  }
  let GRAIN = null;
  function finish(ctx, t, o = {}) {
    if (!GRAIN) { GRAIN = []; for (let k = 0; k < 4; k++) { const c = P.canvas(512, 512), g = c.getContext('2d'), d = g.createImageData(512, 512), r = P.rng(31 + k); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - .5) * 90; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); GRAIN.push(c); } }
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain == null ? .08 : o.grain; ctx.fillStyle = ctx.createPattern(GRAIN[Math.floor(t * 12) % 4], 'repeat'); ctx.fillRect(0, 0, W(), H()); ctx.restore();
    const vg = ctx.createRadialGradient(W() / 2, H() * (o.vy || .46), Math.min(W(), H()) * .32, W() / 2, H() / 2, Math.max(W(), H()) * .78); vg.addColorStop(0, 'rgba(6,4,2,0)'); vg.addColorStop(1, `rgba(6,4,2,${o.vignette == null ? .6 : o.vignette})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W(), H());
  }

  window.GOLD = { grab, drop, pool, floor, stream, path: pathOf, horn, motes, bokeh, bloom, glow, finish, css, GOLD: GOLD_C };
})();
