/* kit-cyanotype.js — house style "cyanotype / sun print" (global: window.CYAN). From one-scroll-bible 「그리스도」 3부 (2026-11-11:
   the rock at Caesarea Philippi). After the cyanotype model of claude-drawing-skill (lib/cyanotype.py, Cyanotype) and Anna Atkins's
   photograms: a picture *printed by sunlight* in Prussian blue on rag paper.

   What it is for: a scene where light itself is the event — the image appears while the sun shines (exposure builds), stops and
   fades when the light goes (a print left unfinished, bleached, blotched), a few objects laid on the paper print as crisp white
   silhouettes. Night = a pale, washed sheet with a pinhole star. Reads unmistakably as "paper and light", not as film or paint.

   How to use it
     const sheet = CYAN.sheet(w, h, { seed, coat: [x0, y0, x1, y1] });   // once, in the build (≈0.4 s at 1080×1920)
         the paper in its own space (usually the scene's world px): fine tooth, uneven sunlight, the brushed emulsion (horizontal
         strokes with dry-brush ends and a few drops flicked off the brush; outside the coat the paper stays white), and the
         blotches of an uneven coat / poor wash (under-exposed patches with a darker tide line).
     CYAN.develop(ctx, plate, sheet, { k, fade, blot, soft, halo, view: [fx, fy, z] });   // every frame (≈60–90 ms at 1080×1920)
         plate: a frame-sized canvas (create its context with { willReadFrequently: true } — it is read back every frame) of VALUES as the finished print should read — 0 = full exposure (deep Prussian blue) … 1 = light
         blocked (paper white). Draw objects laid on the paper as white (opacity = how much light they stop: a thin leaf .8, cloth
         .9, card 1), the open sky/ground as dark, glows as paler. The kit turns it into exposure E = (1 - v) × coat × sun and
         develops density D = (1 - e^(-k E)) / (1 - e^(-3)), mapped paper → pale cyan → Prussian blue, the tooth showing through.
         k     exposure (time in the sun): .6 a faint ghost of the image · 3 a normal print · 4+ deep, crisp
         fade  0–1 the print bleaching (blue lifts toward paper, unevenly, more in the blotches)
         blot  0–1 how strongly the blotches (under-exposed stains, tide lines) show
         soft  0–1 the image going soft (blurred toward a wide average — the print "dissolving")
         halo  light scattering under the edges of white objects (default .22)
         view  [fx, fy, z]: which point of the sheet sits at the frame centre and the zoom, so the paper moves with the camera
         levels [lo, hi, gamma]: a contrast curve on the plate first (default [0, 1, 1])
         blotWhere 'edges' (default: stains and tide lines only in a band round the frame, never over the middle) | 'all'
     Two ways to make the plate:
       • photogram — objects laid on the paper drawn white on dark (botanical prints, cut shapes);
       • 19th-century blue photograph — render the scene as an ordinary picture offscreen and pass it as the plate (its
         luminance is read: bright sky → paper white, backlit figures → deep blue silhouettes, rock → modelled blues); use
         levels (lift the shadows with gamma < 1, clip the highlights a little) and a light blur to turn paint into photo.
     Keep words off it (they are drawn by the film over the deep blue). Determinism: depends only on the plate and the options. */
(function () {
  const P = Pilot;
  const RAMP = [[0, [243, 240, 230]], [.18, [201, 217, 230]], [.42, [126, 165, 204]], [.68, [46, 100, 161]], [.86, [23, 74, 134]], [1, [15, 52, 102]]];
  const RL = (() => { const L = new Uint8ClampedArray(1024 * 3); for (let i = 0; i < 1024; i++) { const D = i / 1023; let j = 0; while (j < RAMP.length - 2 && D > RAMP[j + 1][0]) j++;
    const [a, ca] = RAMP[j], [b, cb] = RAMP[j + 1], t = Math.min(1, Math.max(0, (D - a) / (b - a))); for (let c = 0; c < 3; c++) L[i * 3 + c] = ca[c] + (cb[c] - ca[c]) * t; } return L; })();
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // a smooth field (fbm on a coarse grid, upsampled by the canvas) → Float32Array w×h in 0..1
  function field(w, h, cell, oct, seed) {
    const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, c = P.canvas(gw, gh), g = c.getContext('2d'), im = g.createImageData(gw, gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const v = P.fbm(i / 2.5 + seed * 13.17, j / 2.5 + seed * 5.71, oct), k = (j * gw + i) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = Math.max(0, Math.min(255, (v - .5) * 1.6 * 255 + 128)); im.data[k + 3] = 255; }
    g.putImageData(im, 0, 0); const o = P.canvas(w, h), og = o.getContext('2d'); og.imageSmoothingEnabled = true; og.imageSmoothingQuality = 'high'; og.drawImage(c, 0, 0, gw, gh, 0, 0, gw * cell, gh * cell);
    const d = og.getImageData(0, 0, w, h).data, f = new Float32Array(w * h); for (let i = 0; i < w * h; i++) f[i] = d[i * 4] / 255; return f;
  }
  function random(w, h, rnd, blur) {   // per-pixel random, lightly blurred → Float32Array
    const c = P.canvas(w, h), g = c.getContext('2d'), im = g.createImageData(w, h); for (let i = 0; i < w * h; i++) { const v = rnd() * 255; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); let src = c; if (blur) { const b = P.canvas(w, h), bg = b.getContext('2d'); bg.filter = `blur(${blur}px)`; bg.drawImage(c, 0, 0); src = b; }
    const d = src.getContext('2d').getImageData(0, 0, w, h).data, f = new Float32Array(w * h); for (let i = 0; i < w * h; i++) f[i] = d[i * 4] / 255; return f;
  }
  const line1 = (n, scale, seed) => { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = P.fbm(i / scale + seed * 3.3, seed * 7.1, 3) * 2 - 1; return a; };

  function sheet(w, h, o = {}) {
    const seed = o.seed ?? 1, rnd = P.rng(seed * 977 + 3), [x0, y0, x1, y1] = o.coat || [-200, -200, w + 200, h + 200], ragged = o.ragged ?? 1;
    // the paper's tooth (fine fibres + a coarser felt) and the uneven sunlight under the glass
    const t1 = random(w, h, rnd, .8), t2 = field(w, h, 6, 2, seed + 1), tooth = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) tooth[i] = Math.min(1, Math.max(0, .5 + (t1[i] - .5) * 2.2 * .6 + (t2[i] - .5) * .4));
    const sunF = field(w, h, 120, 3, seed + 2), sun = new Float32Array(w * h); for (let i = 0; i < w * h; i++) sun[i] = .9 + .14 * sunF[i];
    // the emulsion brushed on in overlapping horizontal strokes; their ends thin into dry-brush hairs
    const coat = new Float32Array(w * h), n = Math.max(3, Math.round((y1 - y0) / (o.pitch || 130))), pitch = (y1 - y0) / n;
    const streakC = P.canvas(Math.max(2, w / 14 | 0), Math.max(2, h / 2 | 0)), sg = streakC.getContext('2d'), sim = sg.createImageData(streakC.width, streakC.height);
    for (let i = 0; i < sim.data.length; i += 4) { sim.data[i] = sim.data[i + 1] = sim.data[i + 2] = rnd() * 255; sim.data[i + 3] = 255; } sg.putImageData(sim, 0, 0);
    const sb = P.canvas(w, h), sbg = sb.getContext('2d'); sbg.imageSmoothingEnabled = true; sbg.drawImage(streakC, 0, 0, w, h); const sd = sbg.getImageData(0, 0, w, h).data;
    for (let k = 0; k < n; k++) {
      const s = seed * 31 + k * 7, top = y0 + k * pitch - (k ? pitch * .18 : 0), bot = y0 + (k + 1) * pitch + (k === n - 1 ? 0 : pitch * .18);
      const wt = line1(w, 160, s), wt2 = line1(w, 6, s + 1), wb = line1(w, 160, s + 2), wb2 = line1(w, 6, s + 3), hair = line1(h, 7, s + 4), clump = line1(h, 30, s + 5), th = line1(h, 9, s + 6);
      const xs = x0 + (rnd() - .5) * 44 * ragged, xe = x1 + (rnd() - .5) * 44 * ragged, dry = 70 * ragged;
      const ya = Math.max(0, Math.floor(top - 14)), yb = Math.min(h - 1, Math.ceil(bot + 14));
      for (let y = ya; y <= yb; y++) { const reach = (.35 * hair[y] + .65 * clump[y]) * .5 + .5, es = xs - dry * reach, ee = xe + dry * reach, thick = .975 + .025 * th[y];
        for (let x = Math.max(0, Math.floor(es - 2)); x <= Math.min(w - 1, Math.ceil(ee + 2)); x++) {
          const band = ss(-1.5, 1.5, y - (top + wt[x] * 10 * ragged + wt2[x] * 1.2 * ragged)) * ss(-1.5, 1.5, (bot + wb[x] * 10 * ragged + wb2[x] * 1.2 * ragged) - y); if (band <= 0) continue;
          const sharp = ss(-1.2, 1.2, x - es) * ss(-1.2, 1.2, ee - x), inner = ss(0, dry * 1.2, Math.min(x - es, ee - x)), i = y * w + x;
          const keep = ss(.42, .5, sd[i * 4] / 255 * .8 + inner * .55 + .1), c = band * sharp * keep * (.82 + .18 * inner) * thick; if (c > coat[i]) coat[i] = c; } } }
    for (let q = 0; q < (o.splatter ?? 14); q++) { const side = rnd() * 4 | 0; let x, y; if (side < 2) { x = x0 + rnd() * (x1 - x0); y = side ? y1 + 8 + rnd() * 32 : y0 - 8 - rnd() * 32; } else { y = y0 + rnd() * (y1 - y0); x = side === 2 ? x0 - 70 - rnd() * 60 : x1 + 70 + rnd() * 60; }
      const r = 1.2 + rnd() * 3.3, e = .8 + rnd() * .5; for (let yy = Math.floor(y - r - 2); yy <= y + r + 2; yy++) for (let xx = Math.floor(x - r - 2); xx <= x + r + 2; xx++) { if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const c = Math.min(1, Math.max(0, r - Math.hypot(xx - x, (yy - y) * e) + .5)) * .9, i = yy * w + xx; if (c > coat[i]) coat[i] = c; } }
    // blotches: under-exposed patches of a thin coat or a poor wash, each with a darker tide line at its edge
    const bF = field(w, h, o.blotCell || 70, 3, seed + 3), blotM = new Float32Array(w * h), tide = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) { const v = bF[i] + (t2[i] - .5) * .07 + (t1[i] - .5) * .02; blotM[i] = ss(.66, .8, v); tide[i] = Math.exp(-(((v - .665) / .012) ** 2)); }
    return { w, h, tooth, sun, coat, blot: blotM, tide };
  }

  function develop(ctx, plate, S, o = {}) {
    const w = plate.width, h = plate.height, src = plate.getContext('2d').getImageData(0, 0, w, h).data;
    const k = o.k ?? 3, fade = o.fade || 0, blot = o.blot ?? .25, soft = o.soft || 0, halo = o.halo ?? .22, [fx, fy, z] = o.view || [S.w / 2, S.h / 2, 1];
    // levels: a contrast curve on the plate (lo, hi, gamma) — for a plate taken from a rendered picture (photographic use)
    const [lo, hi, gm] = o.levels || [0, 1, 1], LV = new Float32Array(256); for (let i = 0; i < 256; i++) LV[i] = Math.pow(Math.min(1, Math.max(0, (i / 255 - lo) / (hi - lo))), gm);
    // where blotches may show: 'edges' (default) keeps them to a band round the frame, off the middle and the people; 'all' anywhere
    const ew = new Float32Array(w), eh = new Float32Array(h), em = Math.min(w, h), allB = o.blotWhere === 'all';
    for (let x = 0; x < w; x++) ew[x] = Math.min(x, w - 1 - x) / em; for (let y = 0; y < h; y++) eh[y] = Math.min(y, h - 1 - y) / em;
    // the plate at a quarter: lightly blurred (light scattering under the edges) and, for 'soft', widely blurred
    const qw = Math.ceil(w / 4), qh = Math.ceil(h / 4);
    if (!CYAN.q || CYAN.q.width !== qw || CYAN.q.height !== qh) { CYAN.q = P.canvas(qw, qh); CYAN.q2 = P.canvas(qw, qh); CYAN.buf = P.canvas(w, h); CYAN.q.getContext('2d', { willReadFrequently: true }); CYAN.q2.getContext('2d', { willReadFrequently: true }); }
    const qg = CYAN.q.getContext('2d'); qg.clearRect(0, 0, qw, qh); qg.filter = 'blur(1.6px)'; qg.drawImage(plate, 0, 0, qw, qh); qg.filter = 'none'; const qa = qg.getImageData(0, 0, qw, qh).data;
    let qb = null; if (soft > 0) { const g2 = CYAN.q2.getContext('2d'); g2.clearRect(0, 0, qw, qh); g2.filter = `blur(${(2 + 6 * soft).toFixed(1)}px)`; g2.drawImage(plate, 0, 0, qw, qh); g2.filter = 'none'; qb = g2.getImageData(0, 0, qw, qh).data; }
    const NE = 2048, EL = new Float32Array(NE + 1), norm = 1 / (1 - Math.exp(-3)); for (let i = 0; i <= NE; i++) EL[i] = Math.min(1, (1 - Math.exp(-k * i / NE * 1.25)) * norm);
    const colX = new Int32Array(w), qx = new Int32Array(w), qf = new Float32Array(w);
    for (let x = 0; x < w; x++) { colX[x] = Math.min(S.w - 1, Math.max(0, Math.round(fx + (x - w / 2) / z))); const q = Math.min(qw - 1.001, Math.max(0, x / 4 - .375)); qx[x] = q | 0; qf[x] = q - (q | 0); }
    const g = CYAN.buf.getContext('2d'), out = g.createImageData(w, h), d = out.data, { tooth, sun, coat, blot: BL, tide } = S, sw = S.w;
    for (let y = 0; y < h; y++) {
      const ey = eh[y], sy = Math.min(S.h - 1, Math.max(0, Math.round(fy + (y - h / 2) / z))) * sw, q = Math.min(qh - 1.001, Math.max(0, y / 4 - .375)), qy = q | 0, gy = q - qy, r0 = qy * qw, r1 = r0 + qw;
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) << 2, si = sy + colX[x], a = qx[x], f = qf[x];
        let v = LV[(77 * src[i] + 151 * src[i + 1] + 28 * src[i + 2]) >> 8];
        const i00 = (r0 + a) << 2, i01 = i00 + 4, i10 = (r1 + a) << 2, i11 = i10 + 4;
        const vb = LV[((qa[i00] * (1 - f) + qa[i01] * f) * (1 - gy) + (qa[i10] * (1 - f) + qa[i11] * f) * gy) | 0];
        if (qb) { const vs = LV[((qb[i00] * (1 - f) + qb[i01] * f) * (1 - gy) + (qb[i10] * (1 - f) + qb[i11] * f) * gy) | 0]; v += (vs - v) * soft; }
        v += (1 - v) * halo * vb;
        const wE = allB ? 1 : 1 - ss(.03, .2, Math.min(ew[x], ey)), cz = coat[si], bl = BL[si] * wE, td = tide[si] * wE, t = tooth[si], E = (1 - v) * cz * sun[si] * (1 - blot * .35 * bl);   // a blotch: less sensitiser there, so less blue where the print is not saturated
        let D = EL[Math.min(NE, (E / 1.25 * NE) | 0)];
        D *= 1 - fade * (.55 + .2 * bl); D += blot * .4 * td * cz * (1 - D) * D;   // bleaching (a little more in the blotches); a faint tide line at a blotch's edge, in the mid tones
        D = D * (1 - .07 * (t - .5)) - (t > .8 ? .02 : 0); D = D < 0 ? 0 : D > 1 ? 1 : D;
        const li = (D * 1023 | 0) * 3, pt = .975 + .04 * t, st = cz * (1 - D) * .06;
        d[i] = (RL[li] * pt) * (1 - st) + 159 * st; d[i + 1] = (RL[li + 1] * pt) * (1 - st) + 191 * st; d[i + 2] = (RL[li + 2] * pt) * (1 - st) + 216 * st; d[i + 3] = 255; } }
    g.putImageData(out, 0, 0); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(CYAN.buf, 0, 0); ctx.restore();
  }
  const CYAN = window.CYAN = { sheet, develop, RAMP };
})();
