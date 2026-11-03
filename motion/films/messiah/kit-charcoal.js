/* kit-charcoal.js — house style "Gothic charcoal drawing" for word-log films (global: window.Charcoal).
   After OPUSCAR look no. 13 ("Rebecca"): vine charcoal on toothed paper, eraser lifts, finger smudges, fog lifted out
   of the tone, one red pastel accent; the drawing grammar of William Kentridge's animated drawings.
   First film: sermons/2026-10-18-1cor5/film/scenes/door-a.html (문틈 A). Style card: styles/charcoal/STYLE.md.

   HOW A FRAME IS MADE
   1. Draw everything as VALUES into the kit's value canvas (`Charcoal.begin()` returns its 2D context):
        white = clean paper, black = full charcoal. The BLUE channel says how the dark got there:
        '#000' (stick: vine, sweep)      → R and B dark → paper tooth shows (grainy midtones)
        'rgba(0,0,255,a)' (rubbed tone)  → R dark, B stays 255 → smooth, no grain (finger / chamois / blending stump)
        '#fff' / white sprites (eraser)  → back to clean paper (lifts, glows, fog)
   2. `Charcoal.develop(ctx)` — the TOOTH pass turns values into charcoal #121111 on paper #EEECE7 on the real canvas.
   3. After develop, on the real canvas: the single colour (`pastel`), any warm light (`glowLine` with warm colours),
      captions (`captions`), end card (`endCard`), fade (`fade`).
   Coordinates are screen px of the 1080×1920 (or 1920×1080) frame unless a function says otherwise. Pure functions of
   their arguments: seeded randomness only (Pilot.rng / noise), no network, no images; heavy textures are built in init.
   Load after lib.js and story.js. */
(function () {
  const { clamp, lerp, ss, eo, eio, win, rng, noise, fbm, canvas } = Pilot;
  const C = {};
  let W, H, SC, vcv, vctx, low1, l1, low2, l2, redL, rctx, holes, tooth, LUT, COL, GM, outImg, out32;
  let stick, stickW, smudge, smudgeW, eraserPat, fogTex;

  /* ---------------------------------------------------------------- palette, type */
  C.PAPER = '#eeece7';                  // clean paper  (238,236,231)
  C.CHAR = '#121111';                   // full charcoal (18,17,17)
  C.RED = '#9c1a1a';                    // the one accent: red pastel (streaks #6a0f0f / #c23c2f, outlined in charcoal)
  C.WARM = ['#e8c88e', '#efd3a0', '#fbe7c0'];   // warm thread of light (outer, mid, core) — the hope beat, after develop
  C.FONT = "'Gowun Batang',serif";      // captions / end-card title (brush-like serif, reads as hand on paper)
  C.SANS = "'Noto Sans KR',sans-serif"; // source lines, credits
  C.FONTS = ["700 62px 'Gowun Batang'", "400 62px 'Gowun Batang'", "400 28px 'Noto Sans KR'", "500 34px 'Noto Sans KR'", "600 30px 'Noto Sans KR'"];   // for Pilot.run({fonts})
  C.TONE = '0,0,255';                   // rgb of rubbed tone in the value canvas: `rgba(${C.TONE},a)`

  /* ---------------------------------------------------------------- sprites (built in init) */
  function makeStick(col, seed) {   // side-of-the-stick mark: parallel streaks along x, ragged edges, breaks (256×36)
    const w = 256, h = 36, c = canvas(w, h), x = c.getContext('2d'), im = x.createImageData(w, h), r = rng(seed);
    const rowD = []; for (let j = 0; j < h; j++) { const e = Math.sin(Math.PI * (j + .5) / h); rowD[j] = Math.pow(e, .45) * (.25 + .75 * noise(j * .9, seed)); }
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const edge = noise(i * .05, j < h / 2 ? 1.3 + seed : 7.7 + seed), e2 = Math.min(j, h - 1 - j) / (h / 2);
      if (e2 < edge * .5) continue;
      let a = rowD[j] * (.4 + .8 * noise(i * .025 + j * 5.1, j * .9)) * (.85 + .3 * r()); a = Math.min(1, a);
      const k = (j * w + i) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = col; im.data[k + 3] = a * 255;
    }
    x.putImageData(im, 0, 0); return c;
  }
  function makeSmudge(col, seed) {  // a finger smudge: soft, uneven, noisy rim (128×128). col 0 → rubbed tone (B=255)
    const s = 128, c = canvas(s, s), x = c.getContext('2d'), im = x.createImageData(s, s);
    for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) {
      const dx = (i - 63.5) / 64, dy = (j - 63.5) / 64, rr = Math.sqrt(dx * dx + dy * dy);
      const R = .7 + .3 * fbm(i * .045 + seed, j * .045, 3); let a = clamp(1 - rr / R); a = a * a * (3 - 2 * a);
      a *= .7 + .3 * fbm(i * .11 + 9 + seed, j * .11, 2);
      const k = (j * s + i) * 4; im.data[k] = im.data[k + 1] = col; im.data[k + 2] = col ? col : 255; im.data[k + 3] = a * 255;
    }
    x.putImageData(im, 0, 0); return c;
  }
  function makeEraser() {           // eraser lift: white streaks with grey residue rows (256×256, tileable as a pattern)
    const s = 256, c = canvas(s, s), x = c.getContext('2d'), im = x.createImageData(s, s);
    for (let j = 0; j < s; j++) { let ra = .78 + .22 * noise(j * .37, 2); if (noise(j * .13, 8) < .28) ra *= .55;
      for (let i = 0; i < s; i++) { const a = ra * (.86 + .14 * noise(i * .03 + j * 3.3, j * .5)); const k = (j * s + i) * 4;
        im.data[k] = im.data[k + 1] = im.data[k + 2] = 255; im.data[k + 3] = a * 255; } }
    x.putImageData(im, 0, 0); return c;
  }
  function makeFog(seed) {          // a horizontally tileable band of white fog streaks (2W × 220·SC)
    const w = 2 * W, h = Math.round(220 * SC), c = canvas(w, h), x = c.getContext('2d'), r = rng(seed);
    for (let k = 0; k < 170; k++) {
      const yy = h / 2 + (r() + r() + r() - 1.5) * h * .42, len = (180 + r() * 900) * SC, th = (4 + r() * 22) * SC, xx = r() * w;
      x.globalAlpha = .05 + r() * .12;
      for (const o of [-w, 0, w]) x.drawImage(smudgeW, xx + o, yy - th / 2, len, th);
    }
    x.globalAlpha = 1; x.globalCompositeOperation = 'destination-in';
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.35, '#000'); g.addColorStop(.65, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h); return c;
  }
  function makeTooth(seed) {        // paper tooth: fine grain (~2 px ≈ 1/600 frame width) + mottling + faint fibre, equalised 0..255
    const N = W * H, a = new Float32Array(N), r = rng(seed), b = new Float32Array(N);
    for (let i = 0; i < N; i++) a[i] = r();
    for (let y = 0; y < H; y++) { const o = y * W; for (let x = 0; x < W; x++) { const xl = x ? x - 1 : x, xr = x < W - 1 ? x + 1 : x; b[o + x] = (a[o + xl] + 2 * a[o + x] + a[o + xr]) * .25; } }
    for (let y = 0; y < H; y++) { const yu = y ? y - 1 : y, yd = y < H - 1 ? y + 1 : y; for (let x = 0; x < W; x++) a[y * W + x] = (b[yu * W + x] + 2 * b[y * W + x] + b[yd * W + x]) * .25; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; a[i] = a[i] * .5 + noise(x * .42, y * .42) * .3 + noise(x * .012, y * .012) * .12 + noise(x * .004, y * .3) * .08;
    }
    const hist = new Uint32Array(1024); let mn = 1e9, mx = -1e9; for (let i = 0; i < N; i++) { if (a[i] < mn) mn = a[i]; if (a[i] > mx) mx = a[i]; }
    for (let i = 0; i < N; i++) hist[Math.min(1023, ((a[i] - mn) / (mx - mn) * 1024) | 0)]++;
    const cdf = new Uint8Array(1024); let acc = 0; for (let k = 0; k < 1024; k++) { acc += hist[k]; cdf[k] = Math.min(255, (acc / N * 256) | 0); }
    const t = new Uint8Array(N); for (let i = 0; i < N; i++) t[i] = cdf[Math.min(1023, ((a[i] - mn) / (mx - mn) * 1024) | 0)];
    return t;
  }
  function makeLUT(PAPER, CHAR) {   // L: tooth offset by (darkness, tooth); G: how much of it is stick (B channel); C: value → RGBA
    const L = new Int16Array(65536), G = new Uint8Array(65536);
    for (let d = 0; d < 256; d++) for (let T = 0; T < 256; T++) {
      const dd = d / 255, TT = (T + .5) / 256, p = dd * 1.22 - .11;
      let c = clamp((p - (TT - .17)) / .34); c = c * c * (3 - 2 * c);
      const mid = Math.pow(4 * dd * (1 - dd), .8);         // grain strength peaks in the midtones
      L[d * 256 + T] = Math.round((c - dd) * 255 * .85 * mid);
      G[d * 256 + T] = d ? Math.min(255, Math.round(40 + 215 * Math.min(1, T / d))) : 0;   // here T plays dB (grainy darkness)
    }
    const Cc = new Uint32Array(256);
    for (let o0 = 0; o0 < 256; o0++) { let k = o0 / 255; if (k > .88) k = lerp(k, 1, (k - .88) / .12); if (k < .05) k *= k / .05; const o = Math.round(k * 255);
      const kk = o / 255, rr = PAPER[0] + (CHAR[0] - PAPER[0]) * kk, gg = PAPER[1] + (CHAR[1] - PAPER[1]) * kk, bb = PAPER[2] + (CHAR[2] - PAPER[2]) * kk;
      Cc[o0] = (255 << 24) | (Math.round(bb) << 16) | (Math.round(gg) << 8) | Math.round(rr); }
    return [L, Cc, G];
  }

  /* init(opts) — build every heavy texture once (≈ 0.6 s at 1080×1920). Call from the scene's init() before anything else.
     opts: { tooth: seed (77), fog: seed (21), paper: '#hex', charcoal: '#hex' }.
     Afterwards: C.W, C.H, C.SC (= H/1920, scale for px numbers authored at 1080×1920), and the sprites C.stick (black
     stick), C.stickW (white stick = eraser edge), C.smudge (rubbed-tone smudge), C.smudgeW (white smudge = soft lift),
     C.eraser (eraser-streak tile), C.fogTex (fog band), C.tooth (Uint8Array W·H). */
  C.init = function (o = {}) {
    W = C.W = Pilot.W; H = C.H = Pilot.H; SC = C.SC = H / 1920;
    vcv = canvas(W, H); vctx = vcv.getContext('2d', { willReadFrequently: true });
    low1 = canvas(W >> 1, H >> 1); l1 = low1.getContext('2d'); low2 = canvas(W >> 1, H >> 1); l2 = low2.getContext('2d');
    redL = canvas(W, H); rctx = redL.getContext('2d');
    C.stick = stick = makeStick(0, 3); C.stickW = stickW = makeStick(255, 5); C.smudge = smudge = makeSmudge(0, 1); C.smudgeW = smudgeW = makeSmudge(255, 4);
    C.eraser = eraserPat = makeEraser();
    C.tooth = tooth = makeTooth(o.tooth ?? 77);
    [LUT, COL, GM] = makeLUT(Pilot.hex(o.paper || C.PAPER), Pilot.hex(o.charcoal || C.CHAR));
    holes = canvas(W, H); { const hx = holes.getContext('2d'), im = hx.createImageData(W, H); for (let i = 0; i < W * H; i++) { const T = tooth[i]; im.data[i * 4 + 3] = T > 205 ? 255 : T > 185 ? (T - 185) * 12 : 0; } hx.putImageData(im, 0, 0); }
    C.fogTex = fogTex = makeFog(o.fog ?? 21);
    outImg = new ImageData(W, H); out32 = new Uint32Array(outImg.data.buffer);
    C.cam = { zm: 1, ox: 0, oy: 0, zc: [W / 2, H / 2] };
  };

  /* ---------------------------------------------------------------- the value canvas */
  /* begin(clear = true) → the value canvas's 2D context, reset (identity transform, alpha 1, source-over, no filter) and,
     by default, wiped to clean paper. Draw the frame into it, then call develop(ctx). */
  C.begin = function (clear = true) {
    const x = vctx; x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none';
    if (clear) { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); }
    return x;
  };
  /* sheet(k = 1, fill = '#fff', w = W, h = H) → an offscreen canvas for a STATIC plate, built once in init. Its context is
     pre-scaled by k (draw in frame px; k > 1 keeps it crisp under a later push-in up to zoom k). fill null = transparent
     (for a foreground layer). Put it on the frame with drawSheet. */
  C.sheet = function (k = 1, fill = '#fff', w = W, h = H) {
    const c = canvas(Math.ceil(w * k), Math.ceil(h * k)), x = c.getContext('2d'); c.k = k;
    if (fill) { x.fillStyle = fill; x.fillRect(0, 0, c.width, c.height); }
    x.setTransform(k, 0, 0, k, 0, 0); return c;
  };
  /* drawSheet(x, sheet) — draws a sheet at frame size under x's current transform (e.g. after applyCam). */
  C.drawSheet = (x, c) => x.drawImage(c, 0, 0, c.width / c.k, c.height / c.k);

  /* develop(ctx) — THE TOOTH PASS. Reads the value canvas and writes charcoal-on-paper pixels to ctx (identity, full frame).
     Per pixel: darkness d = 255 − R is compared with the paper tooth height, so light pressure catches only the peaks,
     heavy pressure fills the valleys, velvet blacks stay solid, lifts are clean paper; the grain is scaled by how much
     of d came from the stick (B channel) and peaks in the midtones. ≈ 25–30 ms of the frame at 1080×1920. */
  // The paper moves with the camera: a push-in enlarges the tooth with the drawing and a shake moves it, so the grain
  // never slides over the picture (a grain fixed to the screen under a moving camera reads as a crawling shimmer on
  // phones). Column/row lookups are rebuilt only when the camera changes. Reads pixels as 32-bit words (≈ 10 % faster).
  let colIx = null, rowIx = null, camKey = '';
  C.develop = function (ctx) {
    const c = C.cam || { zm: 1, ox: 0, oy: 0, zc: [W / 2, H / 2] }, key = c.zm + ',' + c.ox + ',' + c.oy + ',' + c.zc[0] + ',' + c.zc[1];
    if (key !== camKey) { camKey = key; colIx = colIx || new Int32Array(W); rowIx = rowIx || new Int32Array(H);
      const mod = (v, n) => ((v % n) + n) % n;
      for (let x = 0; x < W; x++) colIx[x] = mod(Math.floor((x - c.zc[0] - c.ox) / c.zm + c.zc[0]), W);
      for (let y = 0; y < H; y++) rowIx[y] = mod(Math.floor((y - c.zc[1] - c.oy) / c.zm + c.zc[1]), H) * W; }
    const s32 = new Uint32Array(vctx.getImageData(0, 0, W, H).data.buffer);
    for (let y = 0, i = 0; y < H; y++) { const r = rowIx[y];
      for (let x = 0; x < W; x++, i++) {
        const v = s32[i], dR = 255 - (v & 255), o = dR + ((LUT[(dR << 8) | tooth[r + colIx[x]]] * GM[(dR << 8) | (255 - ((v >>> 16) & 255))]) >> 8);
        out32[i] = COL[o < 0 ? 0 : o > 255 ? 255 : o];
      } }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.putImageData(outImg, 0, 0);
  };

  /* ---------------------------------------------------------------- geometry */
  /* poly(x, pts) — begins a closed path through [[x,y],…] (no fill). */
  C.poly = function (x, pts) { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); };
  /* seg(a, b, n, jit = 0, r) → n+1 points from a to b; with r (an rng) each is jittered by ±jit/2 px (hand wobble). */
  C.seg = function (a, b, n, jit = 0, r) { const out = []; for (let i = 0; i <= n; i++) { const k = i / n; out.push([lerp(a[0], b[0], k) + (r ? (r() - .5) * jit : 0), lerp(a[1], b[1], k) + (r ? (r() - .5) * jit : 0)]); } return out; };
  /* arch(a, ys, rise, n = 24) → a pointed (two-centred, Gothic) arch as [x,y] pairs: half-span a, springing height ys,
     rise above the springing; from the left springing over the apex to the right. Any units (metres in the door scene). */
  C.arch = function (a, ys, rise, n = 24) {
    const R = (a * a + rise * rise) / (2 * a), c = R - a, phiA = Math.acos(clamp(c / R, -1, 1)), L = [], Rr = [];
    for (let i = 0; i <= n; i++) { const ph = phiA * i / n; L.push([c - R * Math.cos(ph), ys + R * Math.sin(ph)]); }
    for (let i = n; i >= 0; i--) { const ph = phiA * i / n; Rr.push([-(c - R * Math.cos(ph)), ys + R * Math.sin(ph)]); }
    return L.concat(Rr.slice(1));
  };
  /* persp({ F, cx, cy, eye }) → a pinhole camera in metres looking down +z: F focal length px, (cx, cy) the horizon centre
     px, eye height m. Returns { P(x,y,z) → [px,py], seg(a3, b3, n) → screen points stepped in world (perspective-correct),
     poly(x, pts3) → path through world points }. */
  C.persp = function ({ F, cx, cy, eye }) {
    const P = (x, y, z) => [cx + F * x / z, cy - F * (y - eye) / z];
    return { P,
      seg: (a, b, n) => { const out = []; for (let i = 0; i <= n; i++) { const k = i / n; out.push(P(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k))); } return out; },
      poly: (x, pts3) => C.poly(x, pts3.map(p => P(p[0], p[1], p[2]))) };
  };

  /* ---------------------------------------------------------------- marks (all into the value canvas, or any 2D ctx) */
  /* sweep(x, pts, w, a, seed, spr = C.stick) — side of the stick dragged along a path (follow the form!): w = mark width px
     (1/60–1/30 of frame width for broad tone, 4–8 px for grain on timber), a = pressure 0..1. Tapered at both ends. */
  C.sweep = function (x, pts, w, a, seed, spr = stick) {
    const r = rng(seed); const n = pts.length - 1;
    for (let i = 0; i < n; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy); if (L < .3) continue;
      const taper = Math.min(1, (i + .6) / 1.6, (n - i) / 1.6);
      x.save(); x.translate(x0, y0); x.rotate(Math.atan2(dy, dx)); x.globalAlpha = clamp(a * (.75 + .5 * r()) * taper);
      x.drawImage(spr, (r() * 190) | 0, 0, 60, 36, -1, -w / 2, L + 2, w); x.restore();
    }
    x.globalAlpha = 1;
  };
  /* vine(x, pts, w, a, seed, col = '#000', brk = .07) — broken vine-charcoal line through pts: width w px (±), alpha a,
     brk = chance a segment is skipped. col '#fff' = an eraser line (lifted edge / rim light); 'rgba(0,0,255,…)' = rubbed. */
  C.vine = function (x, pts, w, a, seed, col = '#000', brk = .07) {
    const r = rng(seed); x.strokeStyle = col; x.lineCap = 'round';
    for (let i = 0; i < pts.length - 1; i++) {
      if (r() < brk) continue;
      const j = () => (r() - .5) * w * .5;
      x.globalAlpha = clamp(a * (.5 + .5 * r())); x.lineWidth = w * (.55 + .75 * r());
      x.beginPath(); x.moveTo(pts[i][0] + j(), pts[i][1] + j()); x.lineTo(pts[i + 1][0] + j(), pts[i + 1][1] + j()); x.stroke();
    }
    x.globalAlpha = 1;
  };
  /* blob(x, cx, cy, rx, ry, a, rot = 0, spr = C.smudge) — a finger smudge (rubbed tone, no grain) centred at cx,cy with
     radii rx,ry px. spr = C.smudgeW → a soft eraser lift instead. */
  C.blob = function (x, cx, cy, rx, ry, a, rot = 0, spr = smudge) {
    x.save(); x.translate(cx, cy); x.rotate(rot); x.globalAlpha = clamp(a); x.drawImage(spr, -rx, -ry, 2 * rx, 2 * ry); x.restore(); x.globalAlpha = 1;
  };
  /* fillA(x, a, col = C.TONE) — fills the current path with rubbed tone of strength a (or rgba(col,a)). */
  C.fillA = function (x, a, col = '0,0,255') { x.fillStyle = `rgba(${col},${a})`; x.fill(); };
  /* tone(x, pts, a) — tone a region (polygon) with rubbed charcoal of strength a. lift(x, pts, a) — erase it back toward paper. */
  C.tone = (x, pts, a) => { C.poly(x, pts); C.fillA(x, a); };
  C.lift = (x, pts, a) => { C.poly(x, pts); C.fillA(x, a, '255,255,255'); };
  /* toneAll(x, a, rub = false) — rubbed tone over the whole frame (identity transform; leaves it so). Night / blackout.
     rub: a few faint lifted passes so a full black is not flat (use when a > .9). */
  C.toneAll = function (x, a, rub = false) {
    x.setTransform(1, 0, 0, 1, 0, 0); if (a > 0) { x.globalAlpha = 1; x.fillStyle = `rgba(0,0,255,${a})`; x.fillRect(0, 0, W, H); }
    if (rub) for (let k = 0; k < 5; k++) C.blob(x, W * (.2 + .15 * k), H * (.3 + .1 * Math.sin(k * 2.1)), 420, 260, .04, k, smudgeW);
  };
  /* smudgeFill(x, pts, a, seed, n = 8) — tone a region and rub it unevenly: base tone a, then n smudges and n soft lifts
     scattered in its bounding box (density varies like a finger-blended area). Good for masses: hills, cloaks, clouds. */
  C.smudgeFill = function (x, pts, a, seed, n = 8) {
    const r = rng(seed); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [px, py] of pts) { x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); }
    x.save(); C.poly(x, pts); x.clip(); C.poly(x, pts); C.fillA(x, a);
    const rr = Math.max(x1 - x0, y1 - y0) * .22;
    for (let i = 0; i < n; i++) { C.blob(x, lerp(x0, x1, r()), lerp(y0, y1, r()), rr * (.6 + r()), rr * (.4 + .5 * r()), a * .35, r() * 3, smudge);
      C.blob(x, lerp(x0, x1, r()), lerp(y0, y1, r()), rr * (.5 + r() * .8), rr * (.3 + .4 * r()), .12, r() * 3, smudgeW); }
    x.restore();
  };
  /* hatch(x, x0, y0, x1, y1, n, len, ang, w, a, seed) — n short parallel vine strokes (length len px, angle ang rad)
     scattered in the box; for the darkest wall areas, cast-shadow edges, texture under a mass. */
  C.hatch = function (x, x0, y0, x1, y1, n, len, ang, w, a, seed) {
    const r = rng(seed), dx = Math.cos(ang) * len, dy = Math.sin(ang) * len;
    for (let i = 0; i < n; i++) { const xx = lerp(x0, x1, r()), yy = lerp(y0, y1, r()); C.vine(x, [[xx, yy], [xx + dx, yy + dy]], w, a, seed + 1 + i); }
  };

  /* ---------------------------------------------------------------- soft layers (half resolution) and light */
  /* layer(x, paint, { cam = true, blur = 0, alpha = 1 }) — paint into a half-res scratch layer and composite it onto x
     (identity, full frame) with alpha. paint(l) gets the layer ctx already set to the current camera at half scale (draw
     in frame px as usual); cam: false → raw half-res px. blur px (at half res) softens edges — the natural charcoal edge
     for shadows and silhouettes. x null → just returns the layer canvas. One scratch layer: don't nest. paint must undo
     its own clip (save/restore inside paint); composite mode and alpha are reset after it. */
  // o.q: paint at quarter resolution instead of half (blur px then count at quarter res) — for very soft things (cast
  // shadows, glows), a quarter of the pixels to paint and to blur, and no visible difference once blurred.
  let q1, q2, Q1, Q2;
  C.layer = function (x, paint, o = {}) {
    if (o.q && !q1) { q1 = canvas(W >> 2, H >> 2); Q1 = q1.getContext('2d'); q2 = canvas(W >> 2, H >> 2); Q2 = q2.getContext('2d'); }
    const A = o.q ? q1 : low1, a = o.q ? Q1 : l1, B2 = o.q ? q2 : low2, b2 = o.q ? Q2 : l2, k = o.q ? .25 : .5;
    a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, A.width, A.height);
    if (o.cam !== false) { const c = C.cam; a.setTransform(k * c.zm, 0, 0, k * c.zm, k * (c.zc[0] * (1 - c.zm) + c.ox), k * (c.zc[1] * (1 - c.zm) + c.oy)); }
    else if (o.q) a.setTransform(.5, 0, 0, .5, 0, 0);   // (cam:false paints in half-res px)
    paint(a);   // (no save/restore around paint: it changes Chrome's rasterisation by ±1 here; paint resets what it changes)
    a.globalCompositeOperation = 'source-over'; a.globalAlpha = 1;
    let src = A;
    if (o.blur) { b2.setTransform(1, 0, 0, 1, 0, 0); b2.clearRect(0, 0, B2.width, B2.height); b2.filter = `blur(${o.blur}px)`; b2.drawImage(A, 0, 0); b2.filter = 'none'; src = B2; }
    if (x) { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = o.alpha ?? 1; x.drawImage(src, 0, 0, W, H); x.restore(); }
    return src;
  };
  /* silhouette(x, pts, alpha, blur = 2, clip) — a solid black shape (stick-dark, grainy at its soft rim) with a smudged
     edge, optionally clipped to the polygon clip. Under the current camera. */
  C.silhouette = function (x, pts, alpha, blur = 2, clip) {
    C.layer(x, l => { l.save(); if (clip) { C.poly(l, clip); l.clip(); } C.poly(l, pts); l.fillStyle = '#000'; l.fill(); l.restore(); }, { blur, alpha });
  };
  /* wedge(x, quad, m0, m1, alpha, { reach = .55, falloff, blur = 0 }) — a light patch LIFTED with the eraser out of the
     tone: quad (4+ screen points under the camera), streaks run from m0 (the bright source edge) toward m1, brightness
     falls off along reach × |m1 − m0| through falloff stops [[k, a], …] (default 1 → .82 → .42). Floor wedges, window
     beams, pools. A wedge on a floor can stay crisp; a beam in the air needs blur (≈ 6–10) or it reads as a cut shape. */
  C.wedge = function (x, quad, m0, m1, alpha, o = {}) {
    const reach = o.reach ?? .55, stops = o.falloff || [[0, 1], [.35, .82], [1, .42]];
    C.layer(x, l => {
      C.poly(l, quad); const pat = l.createPattern(eraserPat, 'repeat');
      const ang = Math.atan2(m1[1] - m0[1], m1[0] - m0[0]);
      pat.setTransform(new DOMMatrix().rotateSelf(ang * 180 / Math.PI + 90)); l.fillStyle = pat; l.fill();
      l.globalCompositeOperation = 'destination-in';
      const g = l.createLinearGradient(m0[0], m0[1], m0[0] + (m1[0] - m0[0]) * reach, m0[1] + (m1[1] - m0[1]) * reach);
      for (const [k, a] of stops) g.addColorStop(k, `rgba(0,0,0,${a})`);
      C.poly(l, quad); l.fillStyle = g; l.fill(); l.globalCompositeOperation = 'source-over';
    }, { alpha, blur: o.blur });
  };
  /* glowLine(x, pts, a, seed, { w, al, brk, col, off }) — a line of light as stacked vine strokes, wide/faint → thin/bright
     (default w [16,7,3.4] px, al [.1,.28,1], white = eraser). Thread of light under a door, a rim, a crack. After develop,
     pass col: C.WARM (and w [14,6,2.4], al [.1,.3,.95]) for the warm hope light. Seeds seed + off[i]. */
  C.glowLine = function (x, pts, a, seed, o = {}) {
    const w = o.w || [16, 7, 3.4], al = o.al || [.1, .28, 1], brk = o.brk || [.05, .05, .02], col = o.col || ['#fff', '#fff', '#fff'], off = o.off || [0, 2, 5];
    for (let i = 0; i < w.length; i++) C.vine(x, pts, w[i], al[i] * a, seed + off[i], col[i], brk[i]);
  };
  /* fog(x, t, bands) — fog bands erased out of the tone, drifting: bands = [[y px, alpha, speed px/s], …] (2–3 bands at
     different speeds; y under x's current transform, so call applyCam first to make them part of the world). */
  C.fog = function (x, t, bands) {
    const fw = fogTex.width, fh = fogTex.height;
    for (const [y, a, sp] of bands) {
      const off = ((t * sp * SC) % fw + fw) % fw;
      x.globalAlpha = a; x.drawImage(fogTex, -off, y - fh / 2); x.drawImage(fogTex, fw - off, y - fh / 2);
    }
    x.globalAlpha = 1;
  };
  /* eraseWipe(x, t, at, { strokes = 6, gap = .2, dur = .38, lag = .07, ghost = .95 }) → 0..1 — from `at`, the drawing is
     erased in broad alternating eraser strokes, then the sheet goes to paper with a (1 − ghost) trace of the drawing left.
     Returns how far the final clean-up is (use 1 − .86·k to fade the colour and the warm light with it). Value canvas. */
  C.eraseWipe = function (x, t, at, o = {}) {
    if (t < at) return 0;
    const n = o.strokes || 6, gap = o.gap ?? .2, dur = o.dur ?? .38, lag = o.lag ?? .07;
    C.layer(x, l => {
      for (let i = 0; i < n; i++) {
        const k = eio(clamp((t - at + .1 - i * lag) / dur)); if (k <= 0) continue;
        const y0 = (-.05 + i * gap) * low1.height, x0 = -80, x1 = lerp(x0, low1.width + 100, k), r = rng(1000 + i), dir = i % 2 ? -1 : 1;
        for (let xx = x0; xx <= x1; xx += 14) {   // the eraser's soft, uneven bite, dragged across the sheet
          const f = (xx - x0) / (low1.width + 180), cx = dir > 0 ? xx : low1.width - xx, cy = y0 + 70 - f * 130 + Math.sin(f * 5 + i) * 18;
          C.blob(l, cx, cy, 95 + r() * 30, 70 + r() * 25, .85, r() * .6, smudgeW);
        }
      }
    }, { cam: false });
    const full = ss(at + .3, at + .9, t);
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = (o.ghost ?? .95) * full; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.restore();
    return full;
  };
  /* captionSmudge(x, t, lines, { y, rx, ry, a = .4 }) — a soft charcoal smudge behind the caption block while any line
     is up, so light words read on any part of the drawing. Value canvas, before develop. Defaults match captions(). */
  C.captionSmudge = function (x, t, lines, o = {}) {
    let cap = 0; for (const [a, b] of lines) cap = Math.max(cap, win(t, a, b, .35, .45));
    if (cap > 0) { x.setTransform(1, 0, 0, 1, 0, 0); C.blob(x, W / 2, o.y ?? 450 * SC, o.rx ?? 580 * SC, o.ry ?? 220 * SC, (o.a ?? .4) * cap); }
  };

  /* ---------------------------------------------------------------- the one colour: red pastel (after develop) */
  /* pastelPath(a, b, wA, wB, n, r, wob = .022) → n+1 stroke points from a to b (any units: screen px, or world m that you
     project yourself): width wA → wB with pressure wobble and a lifting tail, a hand wobble of ±wob/2 across the stroke,
     and ragged-edge jitters j1/j2 drawn from the rng r. Map each {p, w} to screen {s:[x,y], w px} before pastel(). */
  C.pastelPath = function (a, b, wA, wB, n, r, wob = .022) {
    const pts = []; for (let i = 0; i <= n; i++) { const k = i / n;
      const wo = (noise(i * .23, n * 3.1) - .5) * wob, horiz = Math.abs(b[1] - a[1]) < Math.abs(b[0] - a[0]);
      pts.push({ p: [lerp(a[0], b[0], k) + (horiz ? 0 : wo), lerp(a[1], b[1], k) + (horiz ? wo : 0)],
        w: lerp(wA, wB, k) * (.7 + .55 * noise(i * .31, n + 7)) * (k > .85 ? 1 - (k - .85) * 2.2 : 1), j1: (r() - .5) * .45, j2: (r() - .5) * .45 }); }
    return pts;
  };
  /* pastel(ctx, strokes, fade = 1, { color = C.RED, dark, light, line = C.CHAR }) — lays red pastel strokes on the REAL
     canvas after develop: strokes = [{ pts: [{s:[x,y], w, j1, j2}, …], pr: 0..1 progress }] (draw-on as pr grows).
     Fairly solid, streaked along the stroke, dry-brush tail, paper tooth peeking through, outlined in charcoal. */
  C.pastel = function (ctx, strokes, fade = 1, o = {}) {
    const col = o.color || C.RED, dk = o.dark || '#6a0f0f', lt = o.light || '#c23c2f', line = o.line || C.CHAR;
    let any = false; rctx.setTransform(1, 0, 0, 1, 0, 0); rctx.clearRect(0, 0, W, H);
    const edges = [];
    for (const st of strokes) {
      const pr = st.pr; if (pr <= 0) continue; any = true;
      const n = st.pts.length - 1, m = Math.max(1, Math.floor(pr * n)), pts = st.pts.slice(0, m + 1);
      const A = [], Bb = [];
      for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)].s, b = pts[Math.min(pts.length - 1, i + 1)].s, an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
        const tap = Math.min(1, (i + 1) / 3, (pts.length - i) / 2.2 + (pr >= 1 ? .6 : 0)), hw = pts[i].w / 2 * tap;
        A.push([pts[i].s[0] + Math.cos(an) * hw * (1 + pts[i].j1), pts[i].s[1] + Math.sin(an) * hw * (1 + pts[i].j1)]);
        Bb.push([pts[i].s[0] - Math.cos(an) * hw * (1 + pts[i].j2), pts[i].s[1] - Math.sin(an) * hw * (1 + pts[i].j2)]); }
      C.poly(rctx, A.concat(Bb.slice().reverse())); rctx.fillStyle = col; rctx.fill();
      // streaks of the pastel along the stroke: darker valleys, lighter peaks
      for (let k = 0; k < 7; k++) { const f = (k + .5) / 7, ln = A.map((p, i) => [lerp(p[0], Bb[i][0], f), lerp(p[1], Bb[i][1], f)]);
        C.vine(rctx, ln, 2.6, .4, 860 + k, k % 2 ? dk : lt, .3); }
      // dry-brush tail: the pastel breaks up where the stroke lifts off
      rctx.globalCompositeOperation = 'destination-out';
      for (let i = Math.floor(pts.length * .8); i < pts.length; i++) { const q = pts[i].s; C.blob(rctx, q[0], q[1], pts[i].w * .5, pts[i].w * .3, .5 * (i / pts.length), 0, smudgeW); }
      rctx.globalCompositeOperation = 'source-over';
      edges.push(A, Bb);
    }
    if (!any) return;
    rctx.globalAlpha = 1; rctx.globalCompositeOperation = 'destination-out'; rctx.drawImage(holes, 0, 0); rctx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = fade; ctx.drawImage(redL, 0, 0);
    edges.forEach((e, i) => C.vine(ctx, e, 1.8, .75 * fade, 880 + i, line, .12));
    ctx.restore();
  };

  /* ---------------------------------------------------------------- camera */
  /* setCam({ zm = 1, ox = 0, oy = 0, zc }) — the frame's camera: zoom zm about the point zc [px] plus a shake offset
     (ox, oy) px. Set once per frame; applyCam / toScr / layer / wedge / silhouette use it. */
  C.setCam = function (o) { C.cam = { zm: o.zm ?? 1, ox: o.ox ?? 0, oy: o.oy ?? 0, zc: o.zc || C.cam.zc }; };
  /* applyCam(x, depth = 1, shakeK = 1) — sets x's transform to the camera. depth > 1 = a nearer layer (zoom grows
     depth× faster: foreground parting on a push), shakeK scales its shake. */
  C.applyCam = function (x, depth = 1, shakeK = 1) {
    const c = C.cam;
    if (depth === 1 && shakeK === 1) { x.setTransform(c.zm, 0, 0, c.zm, c.zc[0] * (1 - c.zm) + c.ox, c.zc[1] * (1 - c.zm) + c.oy); return; }
    const fz = 1 + (c.zm - 1) * depth; x.setTransform(fz, 0, 0, fz, c.zc[0] * (1 - fz) + c.ox * shakeK, c.zc[1] * (1 - fz) + c.oy * shakeK);
  };
  /* toScr(p) → where base-frame point p [px] lands on screen under the camera (for marks drawn after develop). */
  C.toScr = function (p) { const c = C.cam; return [c.zc[0] + (p[0] - c.zc[0]) * c.zm + c.ox, c.zc[1] + (p[1] - c.zc[1]) * c.zm + c.oy]; };
  /* push(t, t0, dur, amount, ease = eio) → amount × ease(progress of [t0, t0+dur]). Sum several for a zoom curve:
     zm = 1 + push(…slow creep…) + push(…the push on the reveal…); a negative amount is a pull-back. */
  C.push = function (t, t0, dur, amount, ease = eio) { return amount * ease(clamp((t - t0) / dur)); };
  /* kick(t, at, dur, amp, p = 2) → a decaying shake amplitude: amp at `at`, falling as (1 − u)^p to 0 at at+dur. */
  C.kick = function (t, at, dur, amp, p = 2) { return t >= at && t < at + dur ? amp * Math.pow(1 - (t - at) / dur, p) : 0; };
  /* shake(t, a) → [ox, oy] px: hand-held jolt of amplitude a (authored px at 1080×1920), seeded noise at 41 Hz. */
  C.shake = function (t, a) { return [a * (noise(t * 41, 1) - .5) * 2 * SC, a * (noise(t * 41, 9) - .5) * 2 * SC]; };
  /* boil(t, fps = 12) → frame index for "boiling" edges: seed per-frame jitter with rng(boil(t)·k) so smudged edges are
     redrawn 12×/s (on twos) — alive like an animated drawing, still deterministic. */
  C.boil = (t, fps = 12) => Math.floor(t * fps);

  /* ---------------------------------------------------------------- words, end card, fade (on the real canvas) */
  /* captions(ctx, t, lines, o) — Story.captions in this style: Gowun Batang, paper-white #efece6 on a near-black shadow,
     source line #d4cec4 in Noto Sans KR, block at y = 380 px (upper third). Pair with captionSmudge() before develop. */
  C.captions = function (ctx, t, lines, o = {}) {
    Story.captions(ctx, t, lines, { color: '#efece6', srcColor: '#d4cec4', font: C.FONT, srcFont: C.SANS, y: 380 * SC, shadow: 'rgba(8,7,7,.92)', ...o });
  };
  /* endCard(ctx, t, card, at, o) — Story.endCard in this style: dark charcoal words (#141212 / #3b3735) on the erased
     paper (pair with eraseWipe(x, t, at)), the title with a paper-coloured glow rather than a dark halo. */
  C.endCard = function (ctx, t, card, at, o = {}) {
    if (t < at) return;
    Story.endCard(ctx, t, card, at, { color: '#141212', srcColor: '#3b3735', ctaColor: '#141212', font: C.FONT, srcFont: C.SANS, titleShadow: 'rgba(238,236,231,.9)', ...o });
  };
  /* fade(ctx, t, dur, fi = 1.1, fo = .6) — from black over the first fi s, to black over the last fo s. */
  C.fade = function (ctx, t, dur, fi = 1.1, fo = .6) {
    const fb = Math.max(1 - ss(0, fi, t), ss(dur - fo, dur, t));
    if (fb > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(0,0,0,${fb})`; ctx.fillRect(0, 0, W, H); }
  };

  window.Charcoal = C;
})();
