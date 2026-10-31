/* kit-illuminated.js — house style: an illuminated manuscript miniature (from one-scroll-bible: the first film's 07
   kingdom.html, packaged while making 「침묵의 400년」, 2026-10). A page of vellum lying in candlelight in the dark: a
   lapis bar border with gold and white tracery and a vermilion roundel, a gothic arch window framed in lapis with gold
   stars and a gold band; inside the arch a diapered lapis ground with gold quatrefoils, tooled gold rays, a green hill
   with ink grass (or a chequered floor). Everything is flat colour with an ink contour — burnished gold leaf on gesso
   with a candle sheen, punched rosettes, and a bright glint that sweeps across all the gold at once.

   The page is static (built once in init); the miniature inside the arch is painted per frame by the scene's paint().
   Figures are drawn in local units with the kit's ink primitives (fillInk, line, gold, face, sheep). Deterministic and
   seek-safe. Load after lib.js (Pilot). Exposes window.Illum. */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, fbm, canvas, hex, mix, rgb } = Pilot;
  const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
  const INK = '#2A1A10', VEL = '#ECDCB4', LAP = '#27469A', VERM = '#C43A20', WHT = '#fbf6e6', GRN = '#4e7a3c';
  const FLESH = '#f0d6ba', WOOL = '#f3ecd8', HAIR = '#8e4020', LINEN = '#f1ead6', ROSE = '#c4776c';
  const I = {};
  I.PAL = { INK, VEL, LAP, VERM, WHT, GRN, FLESH, WOOL, HAIR, LINEN, ROSE };
  I.INK = INK; I.VERM = VERM; I.LAP = LAP; I.GRN = GRN;
  // the page and the arch window in the frame: [x, y, w, h]. Default: portrait leaves room for words above and below;
  // landscape centres the page. Change before init() (or pass init({ L })).
  I.L = V ? { page: [80, 262, 920, 960], arch: [160, 336, 760, 814] } : { page: [584, 96, 752, 700], arch: [656, 150, 608, 600] };
  let vellumC, goldTex, goldPat, pageC, glintAt = -1;

  // ---------------- ink primitives ----------------
  const P2 = d => new Path2D(d);
  const rectP = (x0, y0, w, h) => { const p = new Path2D(); p.rect(x0, y0, w, h); return p; };
  const ell = (cx, cy, rx, ry, r = 0) => { const p = new Path2D(); p.ellipse(cx, cy, rx, ry, r, 0, 6.2832); return p; };
  // archP(x, y, w, h) → Path2D — a pointed gothic arch (equilateral-ish, r = 0.9 w)
  function archP(x0, y0, w, h) { const p = new Path2D(), a = x0, b = x0 + w, half = w / 2, r = w * .9, al = Math.acos((r - half) / r), base = y0 + r * Math.sin(al);
    p.moveTo(a, y0 + h); p.lineTo(a, base); p.arc(a + r, base, r, Math.PI, Math.PI + al, false); p.arc(b - r, base, r, -al, 0, false); p.lineTo(b, y0 + h); p.closePath(); return p; }
  // fillInk(ctx, path, colour, lw=3) — flat colour with an ink contour
  function fillInk(x, p, c, lw = 3) { x.fillStyle = c; x.fill(p); if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.lineJoin = 'round'; x.stroke(p); } }
  // line(ctx, svgPath, lw=2, colour=INK, a=1) — one ink line (round caps)
  const line = (x, d, lw = 2, c = INK, a = 1) => { x.save(); x.globalAlpha *= a; x.strokeStyle = c; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(P2(d)); x.restore(); };
  // gold(ctx, path, { lw=2.2 (0 = no contour), punch: [x0, y0, x1, y1, spacing] }) — burnished gold leaf: the leaf texture,
  // a candle sheen from the upper left, and (while a page() call set glint ∈ 0..1) a bright band sweeping across
  function gold(x, p, o = {}) {
    x.save(); x.clip(p); x.fillStyle = goldPat; x.fill(p);
    const m = x.getTransform(); x.setTransform(1, 0, 0, 1, 0, 0);
    const cg = x.createRadialGradient(W * .05, -H * .1, 0, W * .05, -H * .1, Math.hypot(W, H) * 1.05);
    cg.addColorStop(0, 'rgba(255,236,170,.30)'); cg.addColorStop(.55, 'rgba(255,220,140,0)'); cg.addColorStop(1, 'rgba(60,30,8,.28)'); x.fillStyle = cg; x.fillRect(0, 0, W, H);
    if (glintAt >= 0 && glintAt <= 1) { const a = Math.sin(Math.PI * glintAt), ux = .78, uy = .62, D = (W + H) * 1.25, pos = -D * .25 + glintAt * D, cx = pos * ux, cy = pos * uy, w = 260;
      const lg = x.createLinearGradient(cx - ux * w, cy - uy * w, cx + ux * w, cy + uy * w);
      lg.addColorStop(0, 'rgba(255,230,150,0)'); lg.addColorStop(.38, `rgba(255,226,140,${.35 * a})`); lg.addColorStop(.5, `rgba(255,252,226,${.95 * a})`); lg.addColorStop(.62, `rgba(255,226,140,${.35 * a})`); lg.addColorStop(1, 'rgba(255,230,150,0)');
      x.globalCompositeOperation = 'screen'; x.fillStyle = lg; x.fillRect(0, 0, W, H); }
    x.setTransform(m);
    if (o.punch) punch(x, o.punch);
    x.restore(); if (o.lw !== 0) { x.save(); x.lineJoin = 'round'; x.strokeStyle = INK; x.lineWidth = o.lw || 2.2; x.stroke(p); x.restore(); }
  }
  // punch(ctx, [x0, y0, x1, y1, spacing=46]) — punched rosettes tooled into gold (call inside a gold clip, or via gold's o.punch)
  function punch(x, [x0, y0, x1, y1, sp = 46]) {
    for (let y = y0 + sp / 2, j = 0; y < y1; y += sp * .87, j++) for (let px = x0 + sp / 2 + (j % 2) * sp / 2; px < x1; px += sp) {
      x.fillStyle = 'rgba(90,58,14,.55)'; x.beginPath(); x.arc(px, y, 2.4, 0, 6.28); x.fill();
      for (let k = 0; k < 6; k++) { const a = k * 1.047; x.beginPath(); x.arc(px + Math.cos(a) * 7, y + Math.sin(a) * 7, 1.5, 0, 6.28); x.fill(); }
      x.fillStyle = 'rgba(255,240,190,.35)'; x.beginPath(); x.arc(px - .8, y - .8, 1, 0, 6.28); x.fill(); }
  }
  Object.assign(I, { P2, rectP, ell, archP, fillInk, line, gold, punch });

  // ---------------- setup ----------------
  // init(o) — build the vellum, the gold-leaf texture and the static page (o.L overrides the layout). ~0.3 s.
  I.init = (o = {}) => {
    if (o.L) I.L = o.L;
    const vw = 480, vh = 480; vellumC = canvas(vw, vh); { const x = vellumC.getContext('2d'), d = x.createImageData(vw, vh), base = hex(VEL);
      for (let y = 0; y < vh; y++) for (let px = 0; px < vw; px++) { const n = fbm(px * .016, y * .016, 4), m2 = fbm(px * .12 + 7, y * .12, 2), k = (y * vw + px) * 4, v = (n - .5) * 34 + (m2 - .5) * 10;
        d.data[k] = base[0] + v; d.data[k + 1] = base[1] + v * .95 - 2; d.data[k + 2] = base[2] + v * .8 - 6; d.data[k + 3] = 255; } x.putImageData(d, 0, 0); }
    goldTex = canvas(512, 512); { const x = goldTex.getContext('2d'), d = x.createImageData(512, 512), N = 512;
      const hsh = (i, j, p) => { i = ((i % p) + p) % p; j = ((j % p) + p) % p; let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + p * 7 | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
      const pn = (x0, y0, p) => { const xi = Math.floor(x0), yi = Math.floor(y0), xf = x0 - xi, yf = y0 - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
        const a = hsh(xi, yi, p), b = hsh(xi + 1, yi, p), c = hsh(xi, yi + 1, p), e = hsh(xi + 1, yi + 1, p); return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v; };
      for (let y = 0; y < N; y++) for (let px = 0; px < N; px++) { let n = 0, amp = .5, tot = 0; for (const p of [4, 8, 16, 32, 64]) { n += amp * pn(px / N * p, y / N * p, p); tot += amp; amp *= .55; } n /= tot;
        const c = mix([170, 128, 46], [214, 174, 84], clamp((n - .25) * 1.6)), k = (y * N + px) * 4; d.data[k] = c[0]; d.data[k + 1] = c[1]; d.data[k + 2] = c[2]; d.data[k + 3] = 255; }
      x.putImageData(d, 0, 0); const r = rng(33); x.strokeStyle = 'rgba(96,64,16,.28)'; x.lineWidth = .7;
      for (let i = 0; i < 60; i++) { let px = r() * N, py = r() * N; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (r() - .5) * 30; py += (r() - .5) * 30; x.lineTo(px, py); } x.stroke(); } }
    goldPat = canvas(1, 1).getContext('2d').createPattern(goldTex, 'repeat');
    buildPage();
    return I;
  };

  function buildPage() {   // the page (static): vellum, bar border with tracery, the arch window's frame (its inside is painted per frame)
    pageC = canvas(W, H); const x = pageC.getContext('2d'), [px, py, pw, ph] = I.L.page, [ax, ay, aw, ah] = I.L.arch, r = rng(4);
    x.save(); x.shadowColor = 'rgba(0,0,0,.7)'; x.shadowBlur = 50; x.shadowOffsetY = 18; x.fillStyle = '#d9c79c'; x.fillRect(px, py, pw, ph); x.restore();
    x.save(); x.beginPath(); x.rect(px, py, pw, ph); x.clip(); x.drawImage(vellumC, px, py, pw, ph);
    const e = x.createRadialGradient(px + pw / 2, py + ph / 2, Math.min(pw, ph) * .3, px + pw / 2, py + ph / 2, Math.max(pw, ph) * .75); e.addColorStop(0, 'rgba(120,80,40,0)'); e.addColorStop(1, 'rgba(120,80,40,.35)');
    x.fillStyle = e; x.fillRect(px, py, pw, ph);
    x.fillStyle = 'rgba(120,90,50,.35)'; for (let i = 0; i < 900; i++) { x.globalAlpha = .15 + r() * .3; x.beginPath(); x.arc(px + r() * pw, py + r() * ph, .6 + r() * 1.1, 0, 6.28); x.fill(); } x.globalAlpha = 1; x.restore();
    // bar border on the left and the top: lapis | gold | white tracery
    const bw = 26, segs = [[px + 22, py + 22, bw, ph - 44], [px + 22, py + 22, pw - 44, bw]];
    for (const [x0, y0, ww, hh] of segs) { fillInk(x, rectP(x0, y0, ww, hh), LAP, 2); const vert = hh > ww;
      gold(x, vert ? rectP(x0 + bw * .32, y0 + bw * .32, bw * .36, hh - bw * .64) : rectP(x0 + bw * .32, y0 + bw * .32, ww - bw * .64, bw * .36), { lw: 1.4 });
      x.fillStyle = 'rgba(250,246,232,.85)'; for (let s = 10; s < (vert ? hh : ww) - 10; s += 20) { const qx = vert ? x0 + bw * .16 : x0 + s, qy = vert ? y0 + s : y0 + bw * .16; x.beginPath(); x.arc(qx, qy, 1.7, 0, 6.28); x.fill();
        const zx = vert ? x0 + bw * .84 : x0 + s + 10, zy = vert ? y0 + s + 10 : y0 + bw * .84; x.beginPath(); x.arc(zx, zy, 1.7, 0, 6.28); x.fill(); } }
    const cb = new Path2D(); cb.arc(px + 22 + bw / 2, py + 22 + bw / 2, bw * .95, 0, 6.28); fillInk(x, cb, VERM, 2); const cg = new Path2D(); cg.arc(px + 22 + bw / 2, py + 22 + bw / 2, bw * .5, 0, 6.28); gold(x, cg, { lw: 1.4 });
    // the frame around the arch: lapis spandrels with gold stars, a gold band
    const f = 18; fillInk(x, rectP(ax - f, ay - f, aw + 2 * f, ah + 2 * f), LAP, 2.5);
    const band = rectP(ax - f, ay - f, aw + 2 * f, ah + 2 * f); band.rect(ax - f + 9, ay - f + 9, aw + 2 * f - 18, ah + 2 * f - 18); gold(x, band, { lw: 2 });
    x.fillStyle = 'rgba(255,240,200,.85)'; for (let i = 0; i < 14; i++) { const sx = ax + (i % 2 ? 22 : aw - 22) + (i % 2 ? 1 : -1) * ((i / 2 | 0) % 3) * 20, sy = ay + 20 + ((i / 2 | 0) % 3) * 22 + (i > 7 ? 34 : 0); x.beginPath(); x.arc(sx, sy, 2.2, 0, 6.28); x.fill(); }
  }

  // ---------------- figures (local units, scaled by the caller) ----------------
  // face(ctx, cx, cy, s, dir=1, up=0) — a gothic face in profile-three-quarter: pale oval, few ink lines, a rosy cheek
  function face(x, cx, cy, s, dir = 1, up = 0) {
    x.save(); x.translate(cx, cy); x.rotate(up * dir); x.scale(dir, 1);
    fillInk(x, ell(0, 0, 21 * s, 27 * s), FLESH, 1.8 * s);
    line(x, `M${4 * s} ${-6 * s} q${5 * s} ${-3 * s} ${10 * s} 0`, 1.6 * s); line(x, `M${5 * s} ${-1 * s} q${4 * s} ${2 * s} ${8 * s} 0`, 1.8 * s);
    x.fillStyle = INK; x.beginPath(); x.arc(10 * s, 0, 1.6 * s, 0, 6.28); x.fill();
    line(x, `M${16 * s} ${-2 * s} q${4 * s} ${8 * s} ${1 * s} ${10 * s}`, 1.5 * s); line(x, `M${8 * s} ${15 * s} q${4 * s} ${2 * s} ${8 * s} ${-1 * s}`, 1.5 * s, '#8a2a18');
    x.fillStyle = 'rgba(205,90,70,.35)'; x.beginPath(); x.arc(6 * s, 8 * s, 5 * s, 0, 6.28); x.fill(); x.restore(); }
  // sheep(ctx, x, y, s, dir, rot=0) — a fleecy sheep (scalloped body, ink curls, dark face); about 150 × 100 at s = 1
  function sheep(x, px, py, s, dir, rot = 0) {
    x.save(); x.translate(px, py); x.rotate(rot); x.scale(s * dir, s);
    const r = rng(11), body = new Path2D(), N = 14;
    for (let i = 0; i <= N; i++) { const a = i / N * 6.2832, rx = 62, ry = 36, x1 = Math.cos(a) * rx, y1 = Math.sin(a) * ry, a2 = (i + .5) / N * 6.2832, x2 = Math.cos(a2) * (rx + 9), y2 = Math.sin(a2) * (ry + 9), a3 = (i + 1) / N * 6.2832;
      if (!i) body.moveTo(x1, y1); body.quadraticCurveTo(x2, y2, Math.cos(a3) * rx, Math.sin(a3) * ry); }
    x.fillStyle = INK; [[-38, 0], [-22, 4], [24, 2], [40, -2]].forEach(([lx, k]) => x.fillRect(lx - 3.5, 26, 7, 30 + k));
    fillInk(x, body, WOOL, 2.2);
    for (let i = 0; i < 12; i++) { const cx = (r() - .5) * 90, cy = (r() - .5) * 46; line(x, `M${cx} ${cy} a5 5 0 1 1 6 4`, 1.3, INK, .55); }
    x.save(); x.translate(66, 6); x.rotate(.5); fillInk(x, ell(6, 0, 22, 14), '#4a3a30', 2); fillInk(x, ell(-6, -11, 10, 5, -.6), '#5a483a', 1.6);
    x.fillStyle = WHT; x.beginPath(); x.arc(10, -3, 2.2, 0, 6.28); x.fill(); x.restore(); x.restore(); }
  I.face = face; I.sheep = sheep;

  // ---------------- the miniature ----------------
  // page(ctx, t, paint, o) — the page, the arch's diapered lapis ground, optional tooled rays (o.rays = { at: [x, y], k }),
  // the ground (a green hill with ink grass, or o.ground = 'floor': a chequered floor), then paint(ctx, { ax, ay, aw, ah, gy })
  // inside the arch, then the arch's vermilion and white-dotted rim. o.glint 0..1 sweeps the glint over every gold()
  // drawn during this call (including the page's own gold, baked earlier, which does not move — only live gold glints).
  I.page = (ctx, t, paint, o = {}) => {
    const [ax, ay, aw, ah] = I.L.arch, arch = archP(ax, ay, aw, ah);
    glintAt = o.glint == null ? -1 : o.glint;
    ctx.drawImage(pageC, 0, 0);
    ctx.save(); ctx.clip(arch);
    ctx.fillStyle = '#22408e'; ctx.fillRect(ax, ay, aw, ah); { const sp = 40; for (let y = ay + sp / 2, j = 0; y < ay + ah; y += sp, j++) for (let px = ax + sp / 2 + (j % 2) * sp / 2; px < ax + aw; px += sp) {
      ctx.fillStyle = 'rgba(16,30,80,.55)'; ctx.fillRect(px - sp / 2, y - .5, sp, 1); ctx.fillStyle = '#d9b45e'; for (let k = 0; k < 4; k++) { const a = k * 1.5708; ctx.beginPath(); ctx.arc(px + Math.cos(a) * 4, y + Math.sin(a) * 4, 2.6, 0, 6.28); ctx.fill(); } } }
    { const vg = ctx.createRadialGradient(ax + aw / 2, ay + ah * .4, 0, ax + aw / 2, ay + ah * .4, ah * .8); vg.addColorStop(0, 'rgba(90,130,220,.25)'); vg.addColorStop(1, 'rgba(5,10,40,.35)'); ctx.fillStyle = vg; ctx.fillRect(ax, ay, aw, ah); }
    if (o.rays) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = `rgba(240,200,110,${.45 * o.rays.k})`; ctx.lineWidth = 2.4; const [rx, ry] = o.rays.at;
      for (let i = 0; i < 64; i++) { const a = i / 64 * 6.283; ctx.beginPath(); ctx.moveTo(rx + Math.cos(a) * 40, ry + Math.sin(a) * 40); ctx.lineTo(rx + Math.cos(a) * 900, ry + Math.sin(a) * 900); ctx.stroke(); } ctx.restore(); }
    if (o.ground === 'floor') { const gy = ay + ah * .88, n = 12; ctx.fillStyle = '#6e3a1e'; ctx.fillRect(ax, gy, aw, ah - (gy - ay));
      for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) { if ((i + j) % 2) continue; const x0 = ax + i * aw / n, y0 = gy + j * (ah * .12) / 3; ctx.fillStyle = '#c9a25a'; ctx.fillRect(x0, y0, aw / n, ah * .04); }
      ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(ax, gy); ctx.lineTo(ax + aw, gy); ctx.stroke(); paint(ctx, { ax, ay, aw, ah, gy }); ctx.restore();
      ctx.save(); ctx.lineWidth = 10; ctx.strokeStyle = VERM; ctx.stroke(arch); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke(arch); ctx.setLineDash([1, 9]); ctx.lineCap = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = WHT; ctx.stroke(arch); ctx.restore(); return; }
    // the ground: a green hill with ink grass
    const gy = ay + ah * .9; ctx.fillStyle = GRN; ctx.beginPath(); ctx.moveTo(ax, ay + ah); ctx.lineTo(ax, gy + 10); ctx.quadraticCurveTo(ax + aw / 2, gy - 26, ax + aw, gy + 10); ctx.lineTo(ax + aw, ay + ah); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke(); ctx.lineWidth = 1.4; const r = rng(9); for (let i = 0; i < 40; i++) { const gx = ax + r() * aw, gg = gy + 4 + r() * (ah * .1 - 10); ctx.beginPath(); ctx.moveTo(gx, gg); ctx.lineTo(gx - 3, gg - 9); ctx.moveTo(gx, gg); ctx.lineTo(gx + 4, gg - 8); ctx.stroke(); }
    paint(ctx, { ax, ay, aw, ah, gy });
    ctx.restore();
    ctx.save(); ctx.lineWidth = 10; ctx.strokeStyle = VERM; ctx.stroke(arch); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke(arch);
    ctx.setLineDash([1, 9]); ctx.lineCap = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = WHT; ctx.stroke(arch); ctx.restore();
  };
  // glow(ctx, x, y, r, [r,g,b], a) — a soft radial light
  I.glow = function (ctx, x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgb(col, a)); g.addColorStop(.35, rgb(col, a * .35)); g.addColorStop(1, rgb(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  // desk(ctx, t) — the dark table the page lies on, a candle somewhere up to the left (call before page())
  I.desk = (ctx, t) => { ctx.fillStyle = '#0b0806'; ctx.fillRect(0, 0, W, H); I.glow(ctx, W * .12, -H * .05, Math.max(W, H) * .9, [255, 170, 90], .22 * (1 + .04 * Math.sin(t * 6.1))); };
  // push(ctx, t, t0, amt=.04) — a slow push-in over 12 s from t0 (wrap page() and the miniature in it)
  I.push = (ctx, t, t0, amt = .04) => { const k = 1 + amt * eio(clamp((t - t0) / 12)); ctx.translate(W / 2, H * .5); ctx.scale(k, k); ctx.translate(-W / 2, -H * .5); };

  window.Illum = I;
})();
