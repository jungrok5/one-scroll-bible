/* Daniel's statue as an illuminated manuscript miniature — ported from the first film's 07 kingdom.html (vellum, lapis,
   vermilion, burnished gold leaf on gesso, punched rosettes, a candle glint): a page lying in the dark, a gothic arch window,
   the statue painted in its five materials (Dan 2:32–33). Needs lib.js (Pilot). Exposes window.Illum. */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, fbm, canvas, hex, mix, rgb } = Pilot;
  const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
  const INK = '#2A1A10', VEL = '#ECDCB4', LAP = '#27469A', VERM = '#C43A20', WHT = '#fbf6e6', GRN = '#4e7a3c';
  const I = {};
  // the page in the frame (the space above holds the section label, below it the narration)
  I.L = V ? { page: [80, 300, 920, 1040], arch: [160, 380, 760, 900] } : { page: [560, 118, 800, 752], arch: [636, 176, 648, 652] };
  let vellumC, goldTex, goldPat, pageC, glintAt = -1;
  const P2 = d => new Path2D(d);
  const rectP = (x0, y0, w, h) => { const p = new Path2D(); p.rect(x0, y0, w, h); return p; };
  function archP(x0, y0, w, h) { const p = new Path2D(), a = x0, b = x0 + w, half = w / 2, r = w * .9, al = Math.acos((r - half) / r), base = y0 + r * Math.sin(al);
    p.moveTo(a, y0 + h); p.lineTo(a, base); p.arc(a + r, base, r, Math.PI, Math.PI + al, false); p.arc(b - r, base, r, -al, 0, false); p.lineTo(b, y0 + h); p.closePath(); return p; }
  I.archP = archP;
  function fillInk(x, p, c, lw = 3) { x.fillStyle = c; x.fill(p); if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.lineJoin = 'round'; x.stroke(p); } }
  function gold(x, p, o = {}) {   // gold leaf with a candle sheen and (when glintAt ∈ 0..1) a bright band sweeping across
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
  I.gold = gold;
  function punch(x, [x0, y0, x1, y1, sp = 46]) {
    for (let y = y0 + sp / 2, j = 0; y < y1; y += sp * .87, j++) for (let px = x0 + sp / 2 + (j % 2) * sp / 2; px < x1; px += sp) {
      x.fillStyle = 'rgba(90,58,14,.55)'; x.beginPath(); x.arc(px, y, 2.4, 0, 6.28); x.fill();
      for (let k = 0; k < 6; k++) { const a = k * 1.047; x.beginPath(); x.arc(px + Math.cos(a) * 7, y + Math.sin(a) * 7, 1.5, 0, 6.28); x.fill(); }
      x.fillStyle = 'rgba(255,240,190,.35)'; x.beginPath(); x.arc(px - .8, y - .8, 1, 0, 6.28); x.fill(); }
  }

  I.init = () => {
    // vellum (low-res noise, stretched — the page is drawn once per orientation)
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

  // ---------- the statue (×1000 units: height 1000, centred on x = 0) ----------
  // A colossal king in the manner of a gothic miniature — crowned head and square curled beard of gold, a robed chest and
  // arms of silver (bracelets, a mantle's edge), a flared pleated kilt of bronze, legs of iron in greaves, feet of iron and clay.
  const mirP = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, a, b) => `${-a} ${b}`);
  const SVG = {
    crown: 'M-54 50 L-64 -14 L-38 16 L-20 -24 L0 8 L20 -24 L38 16 L64 -14 L54 50 Z',
    hairL: 'M-46 66 C-66 104 -64 150 -50 182 L-30 152 C-40 128 -42 100 -38 80 Z',
    beard: 'M-38 116 C-42 166 -28 204 0 212 C28 204 42 166 38 116 C22 134 -22 134 -38 116 Z',
    neck: 'M-20 150 L20 150 L24 190 L-24 190 Z',
    torso: 'M-142 202 C-100 180 100 180 142 202 C148 262 128 322 102 374 L-102 374 C-128 322 -148 262 -142 202 Z',
    armL: 'M-138 202 C-172 208 -186 252 -186 302 C-186 342 -180 394 -170 436 L-142 438 C-148 396 -154 348 -154 308 C-154 272 -146 238 -122 220 Z',
    kilt: 'M-102 374 L102 374 C118 424 142 504 154 574 L-154 574 C-142 504 -118 424 -102 374 Z',
    legL: 'M-110 572 L-16 572 C-18 640 -24 700 -26 742 C-36 792 -34 860 -30 920 L-84 920 C-94 860 -102 792 -98 742 C-102 700 -108 640 -110 572 Z',
    footL: 'M-94 916 L-24 916 C-20 940 -14 962 -12 984 L-124 984 C-122 962 -106 944 -94 916 Z',
  };
  const join = (...ds) => new Path2D(ds.join(' '));
  const headP = (() => { const p = join(SVG.crown, SVG.hairL, mirP(SVG.hairL), SVG.beard, SVG.neck); p.ellipse(0, 98, 52, 64, 0, 0, 6.283); return p; })();
  const handP = (() => { const p = new Path2D(); p.ellipse(-157, 456, 20, 25, 0, 0, 6.283); p.ellipse(157, 456, 20, 25, 0, 0, 6.283); return p; })();
  const silverP = join(SVG.torso, SVG.armL, mirP(SVG.armL)); silverP.addPath(handP);
  I.ZP = { gold: headP, silver: silverP, bronze: join(SVG.kilt), iron: join(SVG.legL, mirP(SVG.legL)), clay: join(SVG.footL, mirP(SVG.footL)) };
  const PAINT = { silver: ['#c9ced9', '#7d859a'], bronze: ['#bb7438', '#73411c'], iron: ['#727782', '#3c4048'], clay: ['#9c6e50', '#5e3e2c'] };
  I.ZONES = ['gold', 'silver', 'bronze', 'iron', 'clay'];
  I.METAL = { gold: [222, 176, 80], silver: [200, 206, 218], bronze: [184, 114, 58], iron: [109, 114, 124], clay: [156, 110, 80] };
  const hexOf = c => '#' + c.map(v => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join('');
  // show: {zone: 0..1 painted}, lit: {zone: 0..1 glowing}, fadeUnlit: unlit zones wash back toward the vellum
  I.statue = (x, cx, top, hs, show, lit, t, fadeUnlit = 0) => {
    x.save(); x.translate(cx, top); x.scale(hs / 1000, hs / 1000);
    const ink = (d, w = 3, c = INK) => { x.save(); x.strokeStyle = c; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(typeof d === 'string' ? P2(d) : d); x.restore(); };
    const dot = (px, py, r, c) => { x.beginPath(); x.arc(px, py, r, 0, 6.283); x.fillStyle = c; x.fill(); x.lineWidth = 1.6; x.strokeStyle = INK; x.stroke(); };
    for (const z of I.ZONES) { const s = show[z] == null ? 1 : show[z]; if (s <= 0) continue; const p = I.ZP[z], L = lit[z] || 0;
      x.save(); x.globalAlpha = s;
      if (L > .02) { x.save(); x.shadowColor = `rgba(255,214,120,${.85 * L})`; x.shadowBlur = 70; x.fillStyle = 'rgba(255,214,120,.01)'; x.fill(p); x.fill(p); x.restore(); }
      if (z === 'gold') gold(x, p, { lw: 0 });
      else { const [c1, c2] = PAINT[z], g = x.createLinearGradient(-200, 0, 200, 0); g.addColorStop(0, c2); g.addColorStop(.36, c1); g.addColorStop(.48, hexOf(mix(hex(c1), [255, 255, 255], .32))); g.addColorStop(.64, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fill(p); }
      // light from above: each part a little darker toward its lower edge
      x.save(); x.clip(p); const vg = x.createLinearGradient(0, 0, 0, 1000); vg.addColorStop(0, 'rgba(40,20,10,0)'); vg.addColorStop(1, 'rgba(40,20,10,.35)'); x.fillStyle = vg; x.fillRect(-300, 0, 600, 1000); x.restore();
      if (z === 'clay') { x.save(); x.clip(p); const r = rng(3); x.fillStyle = '#4a4e57'; for (let i = 0; i < 26; i++) { x.beginPath(); x.ellipse((r() - .5) * 280, 922 + r() * 60, 10 + r() * 14, 6 + r() * 7, r() * 3, 0, 6.283); x.fill(); } x.restore(); }
      if (L > .02) { x.save(); x.clip(p); x.globalCompositeOperation = 'screen'; const u = ((t * .35) % 1.6) - .3, gy = lerp(-200, 1200, u), lg = x.createLinearGradient(0, gy - 120, 0, gy + 120);
        lg.addColorStop(0, 'rgba(255,240,200,0)'); lg.addColorStop(.5, `rgba(255,248,225,${.55 * L})`); lg.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = lg; x.fillRect(-300, gy - 120, 600, 240); x.restore(); }
      if (fadeUnlit > 0 && L < .5) { x.save(); x.clip(p); x.fillStyle = `rgba(236,220,180,${fadeUnlit * (1 - 2 * L) * .6})`; x.fillRect(-300, -50, 600, 1100); x.restore(); }
      ink(p, 4);
      // the painter's details, zone by zone
      if (s > .5) {
        if (z === 'gold') {
          ink('M-54 50 L54 50', 2.4); dot(0, 32, 7, VERM); dot(-32, 36, 5, LAP); dot(32, 36, 5, LAP);   // crown band and jewels
          ink('M-26 86 q9 5 17 0 M9 86 q9 5 17 0 M-26 76 q9 -6 17 -2 M9 74 q9 -4 17 2', 2.4);                 // closed eyes, brows
          ink('M0 92 C-3 104 -6 112 -1 116 h6', 2.4); ink('M-14 126 q14 6 28 0', 2.4);                     // nose, mouth
          for (let row = 0; row < 4; row++) for (let k = -2; k <= 2; k++) { const bx = k * 13, by = 140 + row * 17; if (Math.abs(bx) > 34 - row * 4) continue; ink(`M${bx - 6} ${by} q6 8 12 0`, 2); }   // beard curls
          ink('M-44 80 C-56 110 -54 140 -44 168 M44 80 C56 110 54 140 44 168', 2);                          // hair strands
        }
        if (z === 'silver') {
          ink('M-60 196 C-30 230 30 230 60 196', 3);                       // collar
          ink('M-130 212 C-104 256 -94 312 -94 372 M130 212 C104 256 94 312 94 372', 2.6);   // the mantle's edges
          ink('M-40 250 C-36 290 -38 330 -44 372 M0 238 V372 M40 250 C36 290 38 330 44 372', 1.8);   // robe folds
          ink('M-182 414 h36 M146 414 h36', 3); ink('M-180 424 h32 M148 424 h32', 1.6);           // bracelets
          ink('M-168 440 C-158 448 -154 460 -158 474 M168 440 C158 448 154 460 158 474', 1.8);   // fingers
          ink('M-170 230 C-164 300 -160 360 -156 420 M170 230 C164 300 160 360 156 420', 2.2, 'rgba(255,255,255,.65)');
        }
        if (z === 'bronze') {
          x.save(); x.fillStyle = '#8a4e22'; x.fillRect(-118, 374, 236, 22); x.restore(); ink('M-118 374 h236 M-119 396 h238', 3);
          for (let k = -4; k <= 4; k++) dot(k * 24, 385, 3.6, '#e2b45a');   // studs on the belt
          for (const fx of [-104, -70, -36, 0, 36, 70, 104]) ink(`M${fx * .95} 398 L${fx * 1.22} 572`, 2.2);   // pleats
        }
        if (z === 'iron') {
          ink('M-96 742 q32 -14 64 0 M96 742 q-32 -14 -64 0', 3);   // knees
          ink('M-92 780 q30 8 58 0 M92 780 q-30 8 -58 0 M-90 850 q30 8 58 0 M90 850 q-30 8 -58 0', 1.8);   // greave bands
          ink('M-76 600 v120 M76 600 v120', 2, 'rgba(255,255,255,.4)');
        }
        if (z === 'clay') ink('M-94 940 h76 M94 940 h-76', 2);   // sandal straps
      }
      x.restore(); }
    x.restore();
  };

  // ---------- figures, after the first film's kingdom.html (face, curls, sheep) — local coordinates, scaled by the caller ----------
  const FLESH = '#f0d6ba', WOOL = '#f3ecd8', HAIR = '#8e4020', LINEN = '#f1ead6', ROSE = '#c4776c';
  const ell = (cx, cy, rx, ry, r = 0) => { const p = new Path2D(); p.ellipse(cx, cy, rx, ry, r, 0, 6.2832); return p; };
  const line = (x, d, lw = 2, c = INK, a = 1) => { x.save(); x.globalAlpha *= a; x.strokeStyle = c; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(P2(d)); x.restore(); };
  function face(x, cx, cy, s, dir = 1, up = 0) {    // a gothic face: pale oval, few ink lines, rosy cheek
    x.save(); x.translate(cx, cy); x.rotate(up * dir); x.scale(dir, 1);
    fillInk(x, ell(0, 0, 21 * s, 27 * s), FLESH, 1.8 * s);
    line(x, `M${4 * s} ${-6 * s} q${5 * s} ${-3 * s} ${10 * s} 0`, 1.6 * s); line(x, `M${5 * s} ${-1 * s} q${4 * s} ${2 * s} ${8 * s} 0`, 1.8 * s);
    x.fillStyle = INK; x.beginPath(); x.arc(10 * s, 0, 1.6 * s, 0, 6.28); x.fill();
    line(x, `M${16 * s} ${-2 * s} q${4 * s} ${8 * s} ${1 * s} ${10 * s}`, 1.5 * s); line(x, `M${8 * s} ${15 * s} q${4 * s} ${2 * s} ${8 * s} ${-1 * s}`, 1.5 * s, '#8a2a18');
    x.fillStyle = 'rgba(205,90,70,.35)'; x.beginPath(); x.arc(6 * s, 8 * s, 5 * s, 0, 6.28); x.fill(); x.restore(); }
  function sheep(x, px, py, s, dir, rot = 0) {      // a fleecy sheep (scalloped body, ink curls, dark face)
    x.save(); x.translate(px, py); x.rotate(rot); x.scale(s * dir, s);
    const r = rng(11), body = new Path2D(), N = 14;
    for (let i = 0; i <= N; i++) { const a = i / N * 6.2832, rx = 62, ry = 36, x1 = Math.cos(a) * rx, y1 = Math.sin(a) * ry, a2 = (i + .5) / N * 6.2832, x2 = Math.cos(a2) * (rx + 9), y2 = Math.sin(a2) * (ry + 9), a3 = (i + 1) / N * 6.2832;
      if (!i) body.moveTo(x1, y1); body.quadraticCurveTo(x2, y2, Math.cos(a3) * rx, Math.sin(a3) * ry); }
    x.fillStyle = INK; [[-38, 0], [-22, 4], [24, 2], [40, -2]].forEach(([lx, k]) => x.fillRect(lx - 3.5, 26, 7, 30 + k));
    fillInk(x, body, WOOL, 2.2);
    for (let i = 0; i < 12; i++) { const cx = (r() - .5) * 90, cy = (r() - .5) * 46; line(x, `M${cx} ${cy} a5 5 0 1 1 6 4`, 1.3, INK, .55); }
    x.save(); x.translate(66, 6); x.rotate(.5); fillInk(x, ell(6, 0, 22, 14), '#4a3a30', 2); fillInk(x, ell(-6, -11, 10, 5, -.6), '#5a483a', 1.6);
    x.fillStyle = WHT; x.beginPath(); x.arc(10, -3, 2.2, 0, 6.28); x.fill(); x.restore(); x.restore(); }

  // the altar of incense: gold, with horns, and stylised ink-and-white smoke scrolls rising
  I.altar = (x, cx, by, s, t) => { x.save(); x.translate(cx, by); x.scale(s, s);
    gold(x, P2('M-70 0 L-70 -150 L70 -150 L70 0 Z'), { lw: 3 }); gold(x, P2('M-86 -150 L86 -150 L86 -172 L-86 -172 Z'), { lw: 3 });
    for (const hx of [-1, 1]) gold(x, P2(`M${hx * 86} -172 L${hx * 76} -204 L${hx * 66} -172 Z`), { lw: 2.4 });
    line(x, 'M-70 -110 H70 M-70 -40 H70', 2.4); x.fillStyle = VERM; for (const hx of [-36, 0, 36]) { x.beginPath(); x.arc(hx, -75, 7, 0, 6.28); x.fill(); x.lineWidth = 1.6; x.strokeStyle = INK; x.stroke(); }
    // smoke: a chain of scrolls drifting up and to the side
    for (let i = 0; i < 7; i++) { const u = ((t * .12 + i / 7) % 1), yy = -190 - u * 460, xx = Math.sin(u * 5 + i) * 40 * (.4 + u), rr = 22 + u * 40, a = Math.sin(u * Math.PI);
      x.save(); x.globalAlpha = .85 * a; x.translate(xx, yy); const p = new Path2D(); p.arc(0, 0, rr, 0, 6.283); p.arc(rr * .9, rr * .3, rr * .7, 0, 6.283); p.arc(-rr * .8, rr * .35, rr * .65, 0, 6.283);
      x.fillStyle = 'rgba(250,246,236,.9)'; x.fill(p); line(x, `M${-rr * .5} 0 a${rr * .5} ${rr * .5} 0 1 1 ${rr * .6} ${rr * .4}`, 1.8, INK, .7); x.restore(); }
    x.restore(); };
  // Zechariah the priest: white linen robe and turban, a blue sash, hands lifted in prayer before the altar; facing right
  I.priest = (x, px, py, s, t) => { x.save(); x.translate(px, py); x.scale(s, s);
    fillInk(x, P2('M -70 -560 C -110 -400 -130 -180 -150 0 L 130 0 C 110 -160 100 -360 60 -560 Q 0 -590 -70 -560 Z'), LINEN, 3);
    line(x, 'M -40 -400 Q -70 -200 -90 -6 M 10 -380 Q 0 -200 10 -4 M 50 -360 Q 70 -180 90 -6', 2.2, '#b8ad92', .9);
    fillInk(x, P2('M -84 -300 L 82 -310 L 84 -284 L -88 -274 Z'), LAP, 2); line(x, 'M 60 -290 q 18 80 6 170', 9, LAP); line(x, 'M 60 -290 q 18 80 6 170', 2, INK, .5);
    fillInk(x, P2('M -60 0 l 0 -14 l 50 0 q 20 6 20 14 Z'), '#3a2a20', 2); fillInk(x, P2('M 30 0 l 0 -14 l 54 0 q 20 6 18 14 Z'), '#3a2a20', 2);
    const sw = Math.sin(t * 1.2) * 4;
    fillInk(x, P2(`M 30 -540 C 90 -560 130 ${-620 + sw} 170 ${-660 + sw} L 192 ${-646 + sw} C 150 ${-600 + sw} 100 -520 50 -500 Z`), LINEN, 2.4);
    fillInk(x, P2(`M -20 -520 C 40 -520 100 ${-600 + sw} 140 ${-640 + sw} L 160 ${-628 + sw} C 120 ${-576 + sw} 60 -486 0 -486 Z`), '#e2d9c0', 2.2);
    fillInk(x, ell(186, -664 + sw, 11, 15, .4), FLESH, 1.8); fillInk(x, ell(154, -642 + sw, 11, 14, .4), FLESH, 1.8);
    fillInk(x, P2('M -18 -604 L 16 -604 L 20 -560 L -20 -560 Z'), FLESH, 1.8);
    x.save(); x.translate(6, -650); x.rotate(-.12);
    face(x, 0, 0, 1.75, 1, 0);
    fillInk(x, P2('M -14 22 C -16 60 0 104 18 124 C 34 96 38 56 34 20 Q 26 34 10 32 Q -2 30 -14 22 Z'), WHT, 1.8); line(x, 'M 4 46 q 4 30 10 60 M 18 44 q 4 30 6 60', 1.3, '#9a9078');
    fillInk(x, P2('M -44 -14 C -50 -60 -10 -76 20 -64 C 44 -56 48 -34 40 -18 C 20 -30 -20 -30 -44 -14 Z'), LINEN, 2); line(x, 'M -40 -30 Q 0 -44 40 -30 M -36 -46 Q 0 -60 32 -48', 1.4, '#b8ad92');
    x.restore(); x.restore(); };
  // the angel Gabriel: white robe with a gold hem, gold-leaf wings and nimbus, one hand raised; facing left
  I.angel = (x, px, py, s, t, k = 1) => { if (k <= 0) return; x.save(); x.globalAlpha = k; x.translate(px, py); x.scale(s, s);
    const fl = Math.sin(t * 1.6) * 6;
    for (const d of [1, .82]) { const wing = P2(`M 20 -520 C 120 ${-700 + fl} 200 ${-640 + fl} 230 -470 C 200 -420 170 -330 150 -230 C 110 -300 70 -380 30 -440 Z`); x.save(); x.translate((1 - d) * 60, (1 - d) * 40); x.scale(d, d); gold(x, wing, { lw: 2.6 });
      line(x, 'M 60 -470 Q 150 -560 200 -480 M 70 -420 Q 140 -470 180 -400 M 90 -360 Q 130 -400 160 -320', 1.8, '#7a5418'); x.restore(); }
    fillInk(x, P2('M -60 -540 C -100 -380 -110 -180 -130 0 L 120 0 C 100 -170 90 -380 50 -540 Q -6 -566 -60 -540 Z'), WHT, 3);
    gold(x, P2('M -130 0 L 120 0 L 117 -26 L -127 -26 Z'), { lw: 2 }); line(x, 'M -30 -420 Q -50 -200 -64 -6 M 20 -400 Q 24 -200 30 -4', 2.2, '#b8ad92', .9);
    fillInk(x, P2('M -40 -520 C -90 -540 -140 -600 -170 -650 L -150 -664 C -120 -620 -76 -580 -30 -556 Z'), WHT, 2.4); fillInk(x, ell(-166, -666, 11, 15, -.5), FLESH, 1.8);
    const halo = new Path2D(); halo.arc(-4, -640, 64, 0, 6.283); gold(x, halo, { lw: 2.4 }); line(x, 'M -4 -704 a 64 64 0 0 1 0 128', 1.4, '#7a5418', .5);
    fillInk(x, P2('M -18 -604 L 16 -604 L 20 -560 L -20 -560 Z'), FLESH, 1.8);
    x.save(); x.translate(-4, -640); face(x, 0, 0, 1.7, -1, 0); fillInk(x, P2('M 40 -10 C 46 -52 10 -66 -20 -56 C -40 -46 -44 -20 -36 0 C -30 -20 -10 -34 14 -32 C 30 -30 36 -20 40 -10 Z'), '#e2b45a', 1.6); x.restore();
    x.restore(); };
  // the good shepherd seen from behind, walking toward the light with the lost sheep across his shoulders (no face is shown)
  I.shepherdBack = (x, px, py, s, t) => { x.save(); x.translate(px, py); x.scale(s, s); const step = Math.sin(t * 2.4) * 6;
    line(x, `M 150 ${-20 + step * .2} L 120 -640 q -6 -30 18 -36 q 24 0 22 22`, 8, '#5a3a20');                       // the staff
    fillInk(x, P2(`M -40 0 l ${-8 + step} -120 l 40 0 l ${4 - step} 120 Z M 20 0 l ${4 - step} -120 l 40 0 l ${-4 + step} 120 Z`), '#7a5a3a', 2);   // legs
    fillInk(x, P2('M -96 -500 C -120 -360 -120 -220 -110 -120 L 110 -120 C 120 -220 120 -360 96 -500 Q 0 -540 -96 -500 Z'), VERM, 3);    // tunic
    line(x, 'M -60 -440 Q -80 -300 -76 -130 M 0 -470 V -130 M 60 -440 Q 80 -300 76 -130', 2.2, '#7a1c0c', .8);
    fillInk(x, P2('M -108 -500 C -160 -380 -150 -240 -120 -170 C -60 -200 -20 -320 -24 -500 Q -70 -520 -108 -500 Z'), LAP, 3);          // the mantle over one shoulder
    line(x, 'M -110 -440 Q -130 -330 -120 -200', 2, '#10224f', .8);
    fillInk(x, P2('M 90 -470 C 120 -440 130 -380 128 -320 L 108 -318 C 108 -370 100 -420 80 -450 Z'), VERM, 2.2); fillInk(x, ell(118, -312, 12, 14), FLESH, 1.6);   // arm to the staff
    // the sheep across the shoulders, legs held at the front
    sheep(x, 0, -548, 1.7, -1, .04);
    fillInk(x, ell(0, -620, 44, 50), HAIR, 2);                                                                            // head from behind: hair
    for (let i = 0; i < 6; i++) line(x, `M ${-30 + i * 12} -650 q 4 20 -2 46`, 1.4, '#4a1e0c', .8);
    x.restore(); };

  // the miniature: the page, the punched gold ground with tooled rays behind the lit metal, a strip of ground, and what paint() adds
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
  I.statueBox = () => { const [ax, ay, aw, ah] = I.L.arch, hs = ah * .78; return { cx: ax + aw / 2, top: ay + ah * .9 - hs * .975, hs }; };
  I.INK = INK; I.VERM = VERM; I.LAP = LAP; I.GRN = GRN;
  window.Illum = I;
})();
