/* kit-lamplit.js — house style: a scroll under a lamp at night (from one-scroll-bible's 「침묵의 400년」, 2026-10).
   Night, lamplight and gold on parchment. ONE scroll is the main character: it is lit, unrolled, written on in ink, its words
   burn to gold, a pen of light underlines them, light runs along it, and the camera pulls back until the whole scroll is in
   frame. Around it: a clay oil lamp with a living flame, a warm pool of light, dust motes in the lamplight, film grain, a
   vignette — and, for the night outside, a star-trail sky over a dark ridge with small silhouettes.

   Every function draws in the caller's current transform (so a camera = ctx.translate/scale around the calls) and is a
   pure function of its arguments and t: deterministic and seek-safe. Heavy textures are built once in init().
   Load after lib.js (Pilot). Exposes window.Lamplit. Needs no network and no images. */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, fbm, canvas, hex, mix, rgb } = Pilot;
  const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
  const L$ = {};

  // ---------------- palette and fonts ----------------
  L$.INK = '#2b1a0b';                 // ink on the parchment
  L$.GOLD = [233, 199, 122];          // burnished gold (titles, rules)
  L$.PAL = { night: '#05060a', label: '#6a4a26', cite: '#5a3d1f', text: '#f3ece0', title: '#e9c77a', glow: [255, 214, 130], warm: [255, 222, 150], white: [255, 250, 230] };
  L$.SERIF = "'Noto Serif KR',serif"; L$.SANS = "'Noto Sans KR',sans-serif";
  // font(size, weight=400, serif=true) → a canvas font string in the kit's faces
  L$.font = (size, weight = 400, serif = true) => `${weight} ${size}px ${serif ? L$.SERIF : L$.SANS}`;
  // pass to Pilot.run({ fonts }) so the words never render in a fallback face
  L$.FONTS = ["400 40px 'Noto Serif KR'", "600 40px 'Noto Serif KR'", "700 40px 'Noto Serif KR'", "400 28px 'Noto Sans KR'", "600 30px 'Noto Sans KR'"];

  // ---------------- setup ----------------
  // init() — build the textures once (call from Pilot.run's init): the parchment (low-res fbm stretched: soft fibres and
  // blotches, warm), the grain tile and the dust motes. ~0.1 s.
  L$.init = function () {
    const pw = 480, ph = 270, c = canvas(pw, ph), x = c.getContext('2d'), d = x.createImageData(pw, ph);
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      const n = fbm(i / 60, j / 60, 5), f = fbm(i / 6, j / 90, 2), v = .78 + (n - .5) * .35 + (f - .5) * .08, o = (j * pw + i) * 4;
      d.data[o] = 222 * v; d.data[o + 1] = 196 * v; d.data[o + 2] = 150 * v; d.data[o + 3] = 255; }
    x.putImageData(d, 0, 0); L$.parch = c;
    L$.grain = Pilot.speckle(512, 512, 22, 7, .4);
    L$.motes = []; const r = rng(11); for (let i = 0; i < 70; i++) L$.motes.push([r(), r(), .3 + r() * .9, r() * 6.28, .2 + r() * .8]);
    return L$;
  };

  // ---------------- light ----------------
  // glow(ctx, x, y, r, [r,g,b], a) — a soft radial light (35 % of a at a third of r)
  L$.glow = function (ctx, x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgb(col, a)); g.addColorStop(.35, rgb(col, a * .35)); g.addColorStop(1, rgb(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  // nib(ctx, x, y, r=46) — the head of a pen of light (a warm halo and a white point)
  L$.nib = function (ctx, x, y, r = 46) { L$.glow(ctx, x, y, r, [255, 232, 170], 1); L$.glow(ctx, x, y, r * 9 / 46, [255, 255, 240], 1); };
  // flicker(t) → ~0.92..1.08: a lamp's breathing (multiply a light level by it)
  L$.flicker = t => 1 + .05 * Math.sin(t * 7.3) * Math.sin(t * 2.9 + 1) + .03 * Math.sin(t * 17.1);
  // pool(ctx, cx, cy, h, light) — the warm pool of lamplight on the table around a scroll of height h at (cx, cy)
  L$.pool = function (ctx, cx, cy, h, light) { const lp = ctx.createRadialGradient(cx, cy - h * .2, 0, cx, cy, Math.max(W, H) * .7);
    lp.addColorStop(0, `rgba(120,80,40,${.35 * light})`); lp.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = lp; ctx.fillRect(0, 0, W, H); };
  // lamp(ctx, x, y, s, t, a=1) — a clay oil lamp of size s with a living flame and its halo
  L$.lamp = function (ctx, x, y, s, t, a = 1) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
    const f = 1 + .08 * Math.sin(t * 9.1) + .05 * Math.sin(t * 23.7);
    L$.glow(ctx, x + s * .55, y - s * .55, s * 7 * f, [255, 170, 80], .32);
    ctx.fillStyle = '#3a2412'; ctx.beginPath(); ctx.ellipse(x, y, s, s * .38, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + s * .6, y - s * .12); ctx.quadraticCurveTo(x + s * 1.1, y - s * .2, x + s * 1.25, y - s * .05); ctx.quadraticCurveTo(x + s * .9, y + s * .2, x + s * .5, y + s * .18); ctx.fill();
    ctx.fillStyle = 'rgba(255,190,120,.25)'; ctx.beginPath(); ctx.ellipse(x - s * .2, y - s * .18, s * .5, s * .1, 0, 0, 6.283); ctx.fill();
    const fx = x + s * 1.2, fy = y - s * .1, fh = s * 1.1 * f, sway = Math.sin(t * 3.3) * s * .08;
    const g = ctx.createLinearGradient(fx, fy, fx, fy - fh); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(.5, 'rgba(255,190,90,.95)'); g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(fx - s * .16, fy); ctx.quadraticCurveTo(fx - s * .2, fy - fh * .5, fx + sway, fy - fh); ctx.quadraticCurveTo(fx + s * .2, fy - fh * .5, fx + s * .16, fy); ctx.closePath(); ctx.fill();
    ctx.restore(); };
  // dust(ctx, t, [lx, ly], light, a=1) — motes drifting, visible only near the light (screen space)
  L$.dust = function (ctx, t, light, k, a = 1) {
    ctx.save(); for (const [mx, my, s, ph, b] of L$.motes) {
      const x = ((mx * W + t * 9 * s + Math.sin(t * .3 + ph) * 30) % W + W) % W, y = ((my * H - t * 6 * s) % H + H) % H;
      const d = Math.hypot(x - light[0], y - light[1]) / (Math.max(W, H) * .5), q = clamp(1 - d) * b * k * a; if (q < .02) continue;
      ctx.fillStyle = `rgba(255,220,160,${q * .5})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + s * 1.6, 0, 6.283); ctx.fill(); }
    ctx.restore(); };

  // ---------------- post ----------------
  // vignette(ctx, k=.85) — darken toward the corners (screen space)
  L$.vignette = function (ctx, k = .85) { const g = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .25, W / 2, H / 2, Math.max(W, H) * .78);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  // filmGrain(ctx, t, a=.06) — a moving grain overlay at 24 steps a second (screen space)
  L$.filmGrain = function (ctx, t, a = .06) { ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay';
    const ox = (Math.floor(t * 24) * 137) % 512, oy = (Math.floor(t * 24) * 251) % 512;
    for (let y = -oy; y < H; y += 512) for (let x = -ox; x < W; x += 512) ctx.drawImage(L$.grain, x, y); ctx.restore(); };

  // ---------------- the scroll ----------------
  const roller = (ctx, sx, cy, h, light) => { const rw = V ? 34 : 40, rh = h + (V ? 60 : 70);
    const rg = ctx.createLinearGradient(sx - rw / 2, 0, sx + rw / 2, 0);
    const base = mix([92, 58, 30], [160, 110, 60], light * .8);
    rg.addColorStop(0, rgb(mix(base, [0, 0, 0], .6))); rg.addColorStop(.45, rgb(mix(base, [255, 220, 170], .25))); rg.addColorStop(1, rgb(mix(base, [0, 0, 0], .7)));
    ctx.fillStyle = rg; ctx.beginPath(); ctx.roundRect(sx - rw / 2, cy - rh / 2, rw, rh, rw / 2); ctx.fill();
    ctx.fillStyle = rgb(mix(base, [0, 0, 0], .35)); for (const yy of [cy - rh / 2 - 26, cy + rh / 2 + 2]) { ctx.beginPath(); ctx.roundRect(sx - rw * .32, yy, rw * .64, 24, 8); ctx.fill(); } };
  // scroll(ctx, cx, cy, w, h, open, light) — a scroll centred at (cx, cy), full size w × h, opened to the fraction `open`
  // (0..1, it opens from the middle), lit 0..1 by a lamp above: a soft shadow under it, the sheet, lamplight, burnt
  // top and bottom edges, wooden rollers with knobs at both ends
  L$.scroll = function (ctx, cx, cy, w, h, open, light) {
    const ow = w * open, x0 = cx - ow / 2, y0 = cy - h / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.filter = 'blur(24px)'; ctx.fillRect(x0 + 10, y0 + 30, ow, h); ctx.filter = 'none';
    ctx.beginPath(); ctx.rect(x0, y0, ow, h); ctx.clip();
    ctx.drawImage(L$.parch, cx - w / 2, y0, w, h);
    const g = ctx.createRadialGradient(cx, cy - h * .3, 0, cx, cy, Math.max(w, h) * .75);
    g.addColorStop(0, `rgba(255,214,150,${.18 * light})`); g.addColorStop(1, `rgba(20,10,0,${.55 + (1 - light) * .45})`);
    ctx.fillStyle = g; ctx.fillRect(x0, y0, ow, h);
    ctx.fillStyle = `rgba(0,0,0,${(1 - light) * .55})`; ctx.fillRect(x0, y0, ow, h);
    const e = ctx.createLinearGradient(0, y0, 0, y0 + h); e.addColorStop(0, 'rgba(60,30,5,.45)'); e.addColorStop(.08, 'rgba(60,30,5,0)'); e.addColorStop(.92, 'rgba(60,30,5,0)'); e.addColorStop(1, 'rgba(60,30,5,.45)');
    ctx.fillStyle = e; ctx.fillRect(x0, y0, ow, h);
    ctx.restore();
    for (const sx of [x0, x0 + ow]) roller(ctx, sx, cy, h, light);
  };
  // longScroll(ctx, x0, x1, cy, h, light, lx) — one scroll unrolled from x0 to x1 (any length: the parchment is tiled
  // mirrored, so no seams), lit around x = lx; rollers at both ends. For "the whole story is one scroll" pull-backs.
  L$.longScroll = function (ctx, x0, x1, cy, h, light, lx) {
    const seg = V ? 900 : 1340, y0 = cy - h / 2; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.filter = 'blur(24px)'; ctx.fillRect(x0 + 10, y0 + 30, x1 - x0, h); ctx.filter = 'none';
    ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, h); ctx.clip();
    for (let x = x0, i = 0; x < x1; x += seg, i++) { ctx.save(); if (i % 2) { ctx.translate(x + seg, 0); ctx.scale(-1, 1); ctx.drawImage(L$.parch, 0, y0, seg + 1, h); } else ctx.drawImage(L$.parch, x, y0, seg + 1, h); ctx.restore(); }
    const g = ctx.createRadialGradient(lx, cy - h * .3, 0, lx, cy, seg * 1.1); g.addColorStop(0, `rgba(255,214,150,${.18 * light})`); g.addColorStop(1, `rgba(20,10,0,${.6 + (1 - light) * .4})`); ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, h);
    const e = ctx.createLinearGradient(0, y0, 0, y0 + h); e.addColorStop(0, 'rgba(60,30,5,.45)'); e.addColorStop(.08, 'rgba(60,30,5,0)'); e.addColorStop(.92, 'rgba(60,30,5,0)'); e.addColorStop(1, 'rgba(60,30,5,.45)'); ctx.fillStyle = e; ctx.fillRect(x0, y0, x1 - x0, h);
    ctx.restore();
    for (const sx of [x0, x1]) roller(ctx, sx, cy, h, light);
  };
  // ruler(ctx, a, b, y, until, n=40) — a row of year ticks from x = a to b (a tall tick every 10th), cut off at x = until
  // (e.g. the scroll's unrolled edge) — the blank years between two writings
  L$.ruler = function (ctx, a, b, y, until, n = 40) { ctx.save(); ctx.strokeStyle = 'rgba(70,44,20,.55)'; ctx.lineWidth = 2;
    for (let i = 0; i <= n; i++) { const x = lerp(a, b, i / n); if (x > until - 30) break; const l = i % 10 === 0 ? 22 : i % 5 === 0 ? 14 : 8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - l); ctx.stroke(); }
    ctx.restore(); };
  // sweep(ctx, x0, x1, cy, h, k, on) → x — light running along a (long) scroll from x0 to x1 (k 0..1, eased), a bright
  // head with a trail behind it; `on` 0..1 is its overall strength. Returns the head's x.
  L$.sweep = function (ctx, x0, x1, cy, h, k, on) { const e = eio(k), sx = lerp(x0, x1, e);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const tr = ctx.createLinearGradient(x0, 0, sx, 0); tr.addColorStop(0, 'rgba(255,214,130,0)'); tr.addColorStop(1, `rgba(255,220,140,${.55 * on})`);
    ctx.fillStyle = tr; ctx.fillRect(x0, cy - h * .07, Math.max(0, sx - x0), h * .14); ctx.restore();
    L$.glow(ctx, sx, cy, h * .9, [255, 222, 150], .75 * on); L$.glow(ctx, sx, cy, h * .18, [255, 250, 230], .95 * on); return sx; };

  // quill(ctx, x, y, s) — a white quill whose nib is at (x, y), leaning right (put it at ink()/hebInk()'s returned head)
  L$.quill = function (ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(-.75);
    ctx.fillStyle = '#efe4cc'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * .25, -s * .55, s * .05, -s * 1.5); ctx.quadraticCurveTo(-s * .3, -s * .6, 0, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(80,60,40,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * .04, -s * 1.45); ctx.stroke(); ctx.restore(); };
  // retext(ctx, cx, cy, sw, sh, k, drawOld, drawNew, band) → x — one text becomes another under a band of light that sweeps
  // right → left across a scroll (k 0..1): drawOld(ctx) shows left of the band, drawNew(ctx) right of it (a translation)
  L$.retext = function (ctx, cx, cy, sw, sh, k, drawOld, drawNew, band = k > 0 && k < 1) {
    const sweep = lerp(cx + sw * .5, cx - sw * .5, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, sweep, H); ctx.clip(); drawOld(ctx); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(sweep, 0, W, H); ctx.clip(); drawNew(ctx); ctx.restore();
    if (band) { const g = ctx.createLinearGradient(sweep - 50, 0, sweep + 50, 0); g.addColorStop(0, 'rgba(255,220,150,0)'); g.addColorStop(.5, 'rgba(255,220,150,.55)'); g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g; ctx.fillRect(sweep - 50, cy - sh / 2, 100, sh); }
    return sweep; };

  // ---------------- the scroll burns ----------------
  // flame(ctx, x, y, s, t, ph, a) — one tongue of fire: glow, body, white-hot core; it breathes and sways (ph: its phase)
  L$.flame = function (ctx, x, y, s, t, ph, a) {
    if (a <= 0) return; const f = 1 + .18 * Math.sin(t * 11 + ph * 7) + .1 * Math.sin(t * 23 + ph * 3), h = s * 2.4 * f, sway = Math.sin(t * 5 + ph * 5) * s * .35;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(x, y, x, y - h); g.addColorStop(0, 'rgba(255,190,80,.9)'); g.addColorStop(.45, 'rgba(255,120,30,.75)'); g.addColorStop(1, 'rgba(200,40,10,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - s * .5, y); ctx.bezierCurveTo(x - s * .7, y - h * .45, x + sway - s * .1, y - h * .7, x + sway, y - h); ctx.bezierCurveTo(x + sway + s * .2, y - h * .6, x + s * .7, y - h * .4, x + s * .5, y); ctx.closePath(); ctx.fill();
    const c = ctx.createLinearGradient(x, y, x, y - h * .5); c.addColorStop(0, 'rgba(255,250,220,.95)'); c.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x + sway * .2, y - h * .18, s * .22, h * .22, 0, 0, 6.283); ctx.fill(); ctx.restore(); };
  // initBurn(R) — prepare a burn over the scroll rectangle R = { cx, cy, sw, sh, x0, y0 } (call in init): a burn field
  // (fbm + a diagonal from the lower right, so it burns from one corner) at half resolution and 900 front points
  let burnF = null, fireFront = [], burnLayer = null;
  L$.initBurn = function (R) { const bw = Math.round(R.sw / 2), bh = Math.round(R.sh / 2), v = new Float32Array(bw * bh);
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) v[j * bw + i] = .6 * fbm(i / 70, j / 70, 5) + .4 * (1 - (i / bw * .55 + j / bh * .45));
    burnF = { w: bw, h: bh, v, c: canvas(bw, bh), g: canvas(bw, bh), R }; fireFront = [];
    const r = rng(31); for (let k = 0; k < 900; k++) { const i = r() * bw | 0, j = r() * bh | 0; fireFront.push([R.x0 + i * 2, R.y0 + j * 2, v[j * bw + i], r(), r()]); } return L$; };
  // burn(ctx, t, t0, t1, paint) — the scroll painted by paint(ctx) (e.g. scroll() + hebInk()) burns away between t0 and
  // t1: paper that remains with a soft edge, a charred band behind the front, a glowing rim, flames riding the front,
  // embers lifting off where it has just burnt. Needs initBurn(R) with the same rectangle.
  L$.burn = function (ctx, t, t0, t1, paint) {
    const { w, h, v, c, g, R } = burnF, th = lerp(.1, .95, ss(t0, t1, t));
    if (!burnLayer) burnLayer = canvas(W, H); const layer = burnLayer, lx = layer.getContext('2d'); lx.clearRect(0, 0, W, H); paint(lx);
    const cx2 = c.getContext('2d'), d = cx2.createImageData(w, h), gx2 = g.getContext('2d'), dg = gx2.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { const e = v[i] - th, keep = clamp(e / .012), ch = e > 0 ? clamp(1 - e / .07) : 0, rim = clamp(1 - Math.abs(e - .004) / .016);
      const o = i * 4; d.data[o] = 30 * (1 - ch); d.data[o + 1] = 14 * (1 - ch); d.data[o + 2] = 4; d.data[o + 3] = Math.round(255 * keep);
      dg.data[o] = 255; dg.data[o + 1] = 120 + 110 * rim; dg.data[o + 2] = 40 + 60 * rim * rim; dg.data[o + 3] = Math.round(235 * rim * rim); }
    cx2.putImageData(d, 0, 0); gx2.putImageData(dg, 0, 0);
    lx.save(); lx.globalCompositeOperation = 'destination-in'; lx.imageSmoothingQuality = 'high';
    lx.drawImage(c, R.x0 - 40, R.y0 - 50, R.sw + 80, R.sh + 100); lx.restore();   // (destination-in clears everything the mask does not cover: one draw only)
    lx.save(); lx.globalCompositeOperation = 'source-atop'; for (let i = 0; i < w * h; i++) { const e = v[i] - th, ch = e > 0 ? clamp(1 - e / .07) : 0; d.data[i * 4 + 3] = Math.round(235 * ch * ch); }
    cx2.putImageData(d, 0, 0); lx.drawImage(c, R.x0 - 40, R.y0 - 50, R.sw + 80, R.sh + 100); lx.restore();
    ctx.drawImage(layer, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(10px)'; ctx.drawImage(g, R.x0 - 40, R.y0 - 50, R.sw + 80, R.sh + 100); ctx.filter = 'blur(2px)'; ctx.drawImage(g, R.x0 - 40, R.y0 - 50, R.sw + 80, R.sh + 100); ctx.restore();
    for (const [x, y, ev, r1, r2] of fireFront) { const e = ev - th;
      if (e > -.004 && e < .022 && r1 < .5) L$.flame(ctx, x, y + 6, (V ? 18 : 16) + r2 * 22, t, r1 * 10 + r2, clamp(1 - Math.abs(e - .008) / .014) * .9);
      const tb = lerp(t0, t1, clamp((ev - .1) / .85)), u = t - tb; if (u < 0 || u > 2.4 || r2 > .6) continue;
      const ex = x + Math.sin(u * 3 + r1 * 9) * 24 + u * 30 * (r2 - .3), ey = y - u * (90 + 140 * r1), a = (1 - u / 2.4) * (.5 + .5 * r2);
      ctx.fillStyle = `rgba(255,${170 + 60 * r1 | 0},80,${a})`; ctx.beginPath(); ctx.arc(ex, ey, 1.4 + r2 * 2.2, 0, 6.283); ctx.fill(); } };

  // ---------------- words on the scroll ----------------
  // wrap(ctx, s, maxW, joinIfFits) → lines: '/' in a string marks the breaks a translator chose (each piece is a line,
  // or several when it is too long); a long piece breaks between words (between characters for scripts without spaces)
  L$.wrap = (ctx, s, maxW, joinIfFits = false) => {
    const segs = String(s).split(/\s*\/\s*/);
    if (joinIfFits) { const one = segs.join(' '); if (ctx.measureText(one).width <= maxW) return [one]; }
    const out = [];
    for (const seg of segs) {
      if (ctx.measureText(seg).width <= maxW) { out.push(seg); continue; }
      const words = /\s/.test(seg) ? seg.split(/(?<=\s)/) : Pilot.chars(seg);
      let cur = '';
      for (const w of words) { if (cur && ctx.measureText(cur + w).width > maxW) { out.push(cur.trim()); cur = w.trimStart(); } else cur += w; }
      if (cur.trim()) out.push(cur.trim());
    }
    return out;
  };
  // wrapEven(ctx, s, maxW) — the same, but a piece that has to wrap is re-wrapped to even line lengths (no one-word last line)
  L$.wrapEven = (ctx, s, maxW) => String(s).split(/\s*\/\s*/).flatMap(seg => {
    const a = L$.wrap(ctx, seg, maxW); if (a.length < 2) return a;
    let lo = ctx.measureText(seg).width / a.length, best = a;
    for (let w = lo; w <= maxW; w += 8) { const b = L$.wrap(ctx, seg, w); if (b.length === a.length) { best = b; break; } }
    return best; });
  // lines(s, size, maxW, weight=600) → wrapEven at that font (no ctx needed)
  L$.lines = (s, size, maxW, weight = 600) => { const c = canvas(2, 2).getContext('2d'); c.font = L$.font(size, weight); return L$.wrapEven(c, s, maxW); };
  // block(ctx, lines, x, y, o) → height — lines centred at x, first baseline y. o: size, weight, lh (×size, 1.6), serif,
  // color, alpha, shadow, shadowBlur, lineAlpha(i), lineColor(i), charAlpha(k, n, i) (per grapheme across all lines:
  // write in / go out letter by letter), charGlow(k, n) (0..1: the letter flares orange as it is written or goes out).
  // RTL languages lay out right to left (Pilot.dir).
  L$.block = (ctx, lines, x, y, o = {}) => {
    const P = Pilot, size = o.size || 48, lh = size * (o.lh || 1.6); ctx.save();
    ctx.font = L$.font(size, o.weight || 400, o.serif !== false); ctx.textBaseline = 'alphabetic';
    if (P.dir === 'rtl') ctx.direction = 'rtl';
    if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.shadowBlur || 18; }
    const total = lines.reduce((n, l) => n + P.chars(l).length, 0); let k = 0;
    lines.forEach((l, i) => {
      const ly = y + i * lh, col = (o.lineColor && o.lineColor(i)) || o.color || '#f3ece0';
      if (!o.charAlpha) { ctx.textAlign = 'center'; ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * ((o.lineAlpha && o.lineAlpha(i)) ?? 1); ctx.fillStyle = col; ctx.fillText(l, x, ly); k += P.chars(l).length; return; }
      const cs = P.chars(l), w = ctx.measureText(l).width; ctx.textAlign = 'left'; let pre = '';
      for (const c of cs) { const a = o.charAlpha(k++, total, i);
        const cx = P.dir === 'rtl' ? x + w / 2 - ctx.measureText(pre + c).width : x - w / 2 + ctx.measureText(pre).width; pre += c;
        if (a <= 0.004) continue; const g = o.charGlow ? o.charGlow(k - 1, total) : 0;
        ctx.globalAlpha = a * (o.alpha == null ? 1 : o.alpha) * ((o.lineAlpha && o.lineAlpha(i)) ?? 1);
        ctx.fillStyle = g > 0 ? P.rgb(P.mix(P.hex(col.length === 7 ? col : '#f3ece0'), [255, 150, 60], g)) : col;
        ctx.fillText(c, cx, ly); }
    });
    ctx.restore(); return lines.length * lh;
  };
  // inkText(ctx, lines, cx, y, size, o) — words written on the scroll in ink (weight 600, line height 1.7); o.lit 0..1 turns
  // them to burnished gold with a halo behind; o.alpha, o.reveal(k, n) (= block's charAlpha), o.glow (charGlow), o.lineAlpha
  L$.inkText = function (ctx, lines, cx, y, size, o = {}) {
    const lit = o.lit || 0, a = o.alpha == null ? 1 : o.alpha;
    if (lit > 0) L$.block(ctx, lines, cx, y, { size, weight: 600, lh: 1.7, color: 'rgba(255,214,130,1)', alpha: lit * .75 * a, shadow: 'rgba(255,200,90,1)', shadowBlur: 40, charAlpha: o.reveal, lineAlpha: o.lineAlpha });
    L$.block(ctx, lines, cx, y, { size, weight: 600, lh: 1.7, color: L$.INK, alpha: a, charAlpha: o.reveal, charGlow: o.glow, lineAlpha: o.lineAlpha });
    return lines; };
  // underline(ctx, lines, cx, y, size, word, k) — a gold underline (drawn in as k → 0.7) and a soft light under `word`
  // wherever it appears in the lines: the words two passages share, lit together
  L$.underline = function (ctx, lines, cx, y, size, hl, k) {
    if (!hl || k <= 0) return; ctx.save(); ctx.font = L$.font(size, 600); const lh = size * 1.7;
    lines.forEach((l, i) => { const j = l.indexOf(hl); if (j < 0) return; const lw = ctx.measureText(l).width, x = cx - lw / 2 + ctx.measureText(l.slice(0, j)).width, w = ctx.measureText(hl).width, yy = y + i * lh;
      L$.glow(ctx, x + w / 2, yy - size * .3, w * .9, [255, 214, 130], .45 * k);
      ctx.strokeStyle = `rgba(196,140,40,${k})`; ctx.shadowColor = 'rgba(255,200,90,.9)'; ctx.shadowBlur = 12; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, yy + 12); ctx.lineTo(x + w * Math.min(1, k * 1.4), yy + 12); ctx.stroke(); });
    ctx.restore(); };
  // pen(ctx, lines, cx, y, size, prog, showNib=true) — a pen of light underlines the whole text at reading pace (prog 0..1
  // over the total width); the line stays once drawn; the nib glows at its head while it moves
  L$.pen = function (ctx, lines, cx, y, size, prog, showNib = true) {
    ctx.save(); ctx.font = L$.font(size, 600); const lh = size * 1.7, total = lines.reduce((s, l) => s + ctx.measureText(l).width, 0); let acc = 0; const rd = prog * total;
    lines.forEach((l, i) => { const w = ctx.measureText(l).width, d = clamp((rd - acc) / w); acc += w; if (d <= 0) return; const lx0 = cx - w / 2, ly = y + i * lh + 12;
      ctx.save(); ctx.strokeStyle = 'rgba(196,140,40,.95)'; ctx.shadowColor = 'rgba(255,200,90,.9)'; ctx.shadowBlur = 12; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx0, ly); ctx.lineTo(lx0 + w * d, ly); ctx.stroke(); ctx.restore();
      if (d < 1 && showNib) L$.nib(ctx, lx0 + w * d, ly); });
    ctx.restore(); };
  // centredY(cy, n, size) → the first baseline that centres n lines' letter bodies (not their baselines) on cy
  L$.centredY = (cy, n, size) => cy - (n - 1) * size * 1.7 / 2 + size * .32;

  // ---------------- writing that is not read (texture) ----------------
  // ink(ctx, x0, y0, w, rows, lh, s, seed, prog=1, col, a=1, rtl=true) → head [x, y] | null — rows of pseudo-script
  // (no real words: the only real words on screen are the quoted ones), written in as prog goes 0 → 1
  const inkCache = {};
  function inkRows(seed, rows, w, s) {
    const k = seed + ':' + rows + ':' + w; if (inkCache[k]) return inkCache[k]; const r = rng(seed), out = [];
    for (let i = 0; i < rows; i++) { const row = []; let x = 0; const end = w * (i === rows - 1 ? .55 : .9 + r() * .1);
      while (x < end) { row.push([x, r() * 7 | 0]); x += s * (r() < .12 ? 1.9 : 1.05 + r() * .25); } out.push(row); }
    return inkCache[k] = out; }
  L$.ink = function (ctx, x0, y0, w, rows, lh, s, seed, prog = 1, col = L$.INK, a = 1, rtl = true) {
    const R = inkRows(seed, rows, w, s), n = R.reduce((m, r) => m + r.length, 0); let k = 0, head = null;
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = s * .16; ctx.lineCap = 'round';
    for (let i = 0; i < R.length; i++) for (const [gx, ty] of R[i]) { if (k++ / n > prog) { ctx.restore(); return head; }
      const x = rtl ? x0 + w - gx - s : x0 + gx, y = y0 + i * lh; head = [x, y + s * .5]; ctx.beginPath();
      if (ty === 0) { ctx.moveTo(x, y); ctx.lineTo(x + s * .8, y); ctx.lineTo(x + s * .8, y + s); }
      else if (ty === 1) { ctx.moveTo(x, y); ctx.lineTo(x + s * .8, y); ctx.lineTo(x + s * .8, y + s); ctx.moveTo(x, y + s); ctx.lineTo(x + s * .9, y + s); }
      else if (ty === 2) { ctx.moveTo(x + s * .4, y); ctx.lineTo(x + s * .4, y + s * .35); }
      else if (ty === 3) { ctx.moveTo(x, y + s); ctx.lineTo(x, y); ctx.lineTo(x + s * .8, y); ctx.lineTo(x + s * .8, y + s); }
      else if (ty === 4) { ctx.moveTo(x + s * .8, y); ctx.lineTo(x + s * .8, y + s * 1.4); }
      else if (ty === 5) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + s, y, x + s * .7, y + s); ctx.moveTo(x + s * .1, y + s * .4); ctx.lineTo(x + s * .1, y + s); }
      else { ctx.moveTo(x, y); ctx.lineTo(x + s * .8, y); ctx.moveTo(x + s * .4, y); ctx.lineTo(x + s * .4, y + s); }
      ctx.stroke(); }
    ctx.restore(); return head; };
  // hebInk(ctx, x0, y0, w, rows, lh, s, text, prog=1, col, a=1) → head | null — real right-to-left text (e.g. Hebrew
  // consonants from a public source) laid into rows and written in as prog goes 0 → 1; needs a Hebrew-capable serif
  const hebRowsC = {};
  L$.hebInk = function (ctx, x0, y0, w, rows, lh, s, text, prog = 1, col = L$.INK, a = 1) {
    const fs = s * 1.45, font = `400 ${fs}px 'Noto Serif Hebrew','SBL Hebrew','Times New Roman',serif`, key = text.length + ':' + w + ':' + fs;
    if (!hebRowsC[key]) { const c = canvas(2, 2).getContext('2d'); c.font = font; const R = []; let cur = '';
      for (const wd of text.split(' ')) { const nx = cur ? cur + ' ' + wd : wd; if (c.measureText(nx).width > w && cur) { R.push([cur, c.measureText(cur).width]); cur = wd; } else cur = nx; }
      if (cur) R.push([cur, c.measureText(cur).width]); hebRowsC[key] = R; }
    const R = hebRowsC[key].slice(0, rows), total = R.reduce((m, r) => m + r[1], 0); let rd = prog * total, head = null;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.font = font; ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    R.forEach(([ln, lw], i) => { if (rd <= 0) return; const d = Math.min(lw, rd); rd -= lw; const y = y0 + i * lh + s * .5;
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + w - d, y - lh / 2, d + 4, lh); ctx.clip(); ctx.fillText(ln, x0 + w, y); ctx.restore(); head = [x0 + w - d, y]; });
    ctx.restore(); return prog >= 1 ? null : head; };

  // ---------------- the night outside ----------------
  // initSky() — build the milky way (dust with dark lanes, warm at its core) and 1,900 coloured stars once. ~1–2 s at
  // 1080×1920, so call it only when a scene uses starSky (from Pilot.run's init).
  L$.initSky = function () {
    const Dg = Math.ceil(Math.hypot(W, H) * 1.4), s = 2, w = Dg / s | 0, h = w, c = canvas(w, h), x = c.getContext('2d'), d = x.createImageData(w, h), ang = .55;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const u = i - w / 2, v = j - h / 2, ac = (u * Math.sin(ang) - v * Math.cos(ang)) / (w * .075), band = Math.exp(-ac * ac);
      const n = fbm(i * .02, j * .02, 6), ln = fbm(i * .045 + 9, j * .045, 5), sp = fbm(i * .3, j * .3, 2), val = band * (.25 + .75 * n) * (1 - .8 * ss(.5, .7, ln)) * (.75 + .5 * sp), k = (j * w + i) * 4, warm = Math.exp(-(((u * Math.cos(ang) + v * Math.sin(ang)) / (w * .25)) ** 2));
      d.data[k] = 150 + 90 * warm; d.data[k + 1] = 150 + 60 * warm; d.data[k + 2] = 230 - 40 * warm; d.data[k + 3] = Math.min(255, 150 * val); }
    x.putImageData(d, 0, 0); const r = rng(41), stars = [];
    for (let i = 0; i < 1900; i++) { const b = Math.pow(r(), 3.4), tk = r(); stars.push([r() * 6.283, Math.sqrt(r()) * 1.25, .25 + b * 1.6, tk < .15 ? [255, 214, 170] : tk < .35 ? [210, 225, 255] : [240, 242, 255]]); }
    L$.SKY = { mw: c, Dg, stars }; return L$; };
  // starSky(ctx, t, t0, o) — the waiting sky: a long exposure that starts at t0 — stars wheel round the pole and their
  // trails lengthen over ~10 s, the milky way turns with them, one meteor at t0 + o.meteor (6.2; null = none), a warm
  // glow low on the horizon. Needs initSky().
  L$.starSky = function (ctx, t, t0, o = {}) {
    const u = t - t0, rot = u * .02, g = ctx.createLinearGradient(0, 0, 0, H), SKY = L$.SKY;
    g.addColorStop(0, '#02030a'); g.addColorStop(.5, '#070c26'); g.addColorStop(.78, '#151536'); g.addColorStop(1, '#2c1f33'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const px = V ? W * .18 : W * .26, py = V ? -H * .04 : -H * .16, R = Math.hypot(W, H) * 1.05;
    ctx.save(); ctx.translate(px, py); ctx.rotate(rot); ctx.translate(W * .58 - px, H * .3 - py); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .38; ctx.filter = 'blur(1.5px)'; ctx.drawImage(SKY.mw, -SKY.Dg / 2, -SKY.Dg / 2, SKY.Dg, SKY.Dg); ctx.restore();
    const len = .015 + .2 * ss(t0 + .4, t0 + 10.5, t); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const [a, rr, b, col] of SKY.stars) { const rad = rr * R, aa = a + rot, sx = px + Math.cos(aa) * rad, sy = py + Math.sin(aa) * rad; if (sx < -60 || sx > W + 60 || sy < -60 || sy > H * .86) continue;
      for (let k = 0; k < 3; k++) { const a0 = aa - len * (1 - k / 3), a1 = aa - len * (1 - (k + 1) / 3); ctx.strokeStyle = rgb(col, (.12 + .3 * k) * Math.min(1, b)); ctx.lineWidth = .7 + b * 1.1; ctx.beginPath(); ctx.arc(px, py, rad, a0, a1); ctx.stroke(); }
      if (b > .9) { ctx.fillStyle = rgb(col, .8); ctx.beginPath(); ctx.arc(sx, sy, 1.2 + b, 0, 6.283); ctx.fill(); } }
    const mt = u - (o.meteor === undefined ? 6.2 : o.meteor); if (o.meteor !== null && mt > 0 && mt < .7) { const k = mt / .7, mx0 = W * .62, my0 = H * .12, mx1 = mx0 - W * .18, my1 = my0 + H * .14, ex = lerp(mx0, mx1, k), ey = lerp(my0, my1, k), mg = ctx.createLinearGradient(ex, ey, ex + W * .06, ey - H * .05);
      mg.addColorStop(0, `rgba(255,250,235,${.9 * (1 - k)})`); mg.addColorStop(1, 'rgba(255,250,235,0)'); ctx.strokeStyle = mg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + W * .06, ey - H * .05); ctx.stroke(); }
    ctx.restore();
    L$.glow(ctx, W * .5, H * (V ? .74 : .92), Math.max(W, H) * .7, [255, 160, 110], .14); };
  // HORIZON = { far, near } — the y of the far ridge (with the town) and the near ridge (where the watchers stand)
  L$.HORIZON = { far: V ? H * .66 : H * .74, near: V ? H * .72 : H * .84 };
  // town(ctx, t, fr=HORIZON.far) — a far ridge in night blue with a walled town on it whose 14 lamps flicker, and mist
  L$.town = function (ctx, t, fr = L$.HORIZON.far) {
    ctx.fillStyle = '#0b1030'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, fr - 50 * fbm(x / 420, 1.3, 3) - 70 * Math.exp(-(((x - W * .62) / (W * .22)) ** 2))); ctx.lineTo(W, H); ctx.fill();
    const tx0 = W * (V ? .42 : .5), tw = W * (V ? .42 : .26), ty = fr - 70 - 50 * fbm(W * .62 / 420, 1.3, 3) + 6, rr = rng(9); ctx.fillStyle = '#0a0e28';
    ctx.fillRect(tx0, ty - 14, tw, 24); for (let x = tx0; x < tx0 + tw; ) { const bw = 14 + rr() * 26, bh = 12 + rr() * 30; ctx.fillRect(x, ty - 14 - bh, bw, bh); if (rr() < .2) { ctx.beginPath(); ctx.arc(x + bw / 2, ty - 14 - bh, bw * .4, Math.PI, 0); ctx.fill(); } x += bw * .9; }
    for (let i = 0; i < 14; i++) { const lx = tx0 + 10 + rr() * (tw - 20), ly = ty - 18 - rr() * 30, f = .7 + .3 * Math.sin(t * 3 + i * 1.7); L$.glow(ctx, lx, ly, 14, [255, 190, 110], .5 * f); ctx.fillStyle = `rgba(255,214,150,${.9 * f})`; ctx.fillRect(lx - 1.5, ly - 2, 3, 4); }
    const mist = ctx.createLinearGradient(0, fr - 90, 0, fr + 40); mist.addColorStop(0, 'rgba(70,80,130,0)'); mist.addColorStop(.6, 'rgba(70,80,130,.16)'); mist.addColorStop(1, 'rgba(70,80,130,0)'); ctx.fillStyle = mist; ctx.fillRect(0, fr - 90, W, 130); };
  // ridge(ctx, near=HORIZON.near) — the near ridge, almost black (stand person()s on it with ctx.fillStyle = '#020309')
  L$.ridge = function (ctx, near = L$.HORIZON.near) {
    ctx.fillStyle = '#020309'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, near - 26 * fbm(x / 300, 3.7, 3) - (V ? 0 : 40) * Math.exp(-(((x - W * .26) / 260) ** 2))); ctx.lineTo(W, H); ctx.fill(); };
  // person(ctx, x, y, h, kind, tilt) — a standing silhouette (fill colour = ctx.fillStyle) looking up by `tilt`;
  // kind: '' | 'staff' (holds a staff) | 'child' (a child beside them)
  L$.person = function (ctx, x, y, h, kind, tilt) {
    ctx.save(); ctx.translate(x, y); const s = h;
    ctx.beginPath(); ctx.moveTo(-s * .13, 0); ctx.quadraticCurveTo(-s * .16, -s * .45, -s * .1, -s * .74); ctx.lineTo(s * .1, -s * .74); ctx.quadraticCurveTo(s * .16, -s * .45, s * .13, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * .02 + tilt * s * .03, -s * .82, s * .075, s * .09, tilt * .5, 0, 6.283); ctx.fill();
    if (kind === 'staff') { ctx.lineWidth = s * .025; ctx.strokeStyle = ctx.fillStyle; ctx.beginPath(); ctx.moveTo(s * .2, 0); ctx.lineTo(s * .17, -s * .95); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s * .08, -s * .6); ctx.lineTo(s * .18, -s * .62); ctx.stroke(); }
    if (kind === 'child') { ctx.beginPath(); ctx.moveTo(s * .2, 0); ctx.quadraticCurveTo(s * .19, -s * .3, s * .24, -s * .42); ctx.lineTo(s * .34, -s * .42); ctx.quadraticCurveTo(s * .38, -s * .3, s * .36, 0); ctx.fill();
      ctx.beginPath(); ctx.arc(s * .29, -s * .48, s * .055, 0, 6.283); ctx.fill(); }
    ctx.restore(); };

  // ---------------- typographic moments ----------------
  // title(ctx, s, t, a, b, o) — a gold serif title on the night with a fine gold rule drawing out under it (window a..b)
  L$.title = function (ctx, s, t, a, b, o = {}) {
    const ta = Pilot.win(t, a, b, 1.0, 1.0); if (ta <= 0) return; const sz = o.size || (V ? 104 : 116), ty = o.y || (V ? H * .47 : H * .5);
    Pilot.text(ctx, s, W / 2, ty, { size: sz, weight: 600, color: '#e9c77a', alpha: ta, shadow: 'rgba(233,185,73,.35)', shadowBlur: 40, ls: 6 });
    const lw = (V ? 420 : 520) * eo(clamp((t - a - .3) / 2.0)); ctx.fillStyle = `rgba(233,199,122,${ta * .8})`; ctx.fillRect(W / 2 - lw / 2, ty + (V ? 54 : 58), lw, 2); };

  window.Lamplit = L$;
})();
