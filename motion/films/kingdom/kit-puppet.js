/* kit-puppet.js — vendored copy of motion-skills canvas-film/kits/puppet/kit.js (C:/Project/motion-skills, unmodified below this
   header; never edit the source). Used by 「kingdom」 4부 「겨자씨와 보화」 (puppet-tent.js): the backlit cloth, the lamp field,
   leather pieces (carve/place/press/liftOff), the jointed hand (buildHand/drawHand), rivets, rods, bloom, stage, post. */
/* kit-puppet.js — 그림자극 (shadow puppetry) house style for word-log.  Global: window.Puppet
   First film: 문틈 D (sermons/2026-10-18-1cor5/film/scenes/door-d.html). Card + pitfalls: styles/puppet/STYLE.md.

   Rendering model (per frame) — everything we see is lamp light × what the leather lets through:
     T (transmission) starts WHITE; every piece is drawn into it with 'multiply' (holes stay white, overlaps darken);
     screen = tonemapped lamp field × cloth × T, then warm bloom, the stage (when pulled back), warm vignette, grain.
   A frame:   const M = Puppet.cam();  const g = Puppet.beginT(M);  …draw pieces into g…
              Puppet.frame(ctx, t, M, { I, color, x, y });  Puppet.captions(…);  Puppet.endCard(…);  Puppet.fade(…)

   Units: "world" = the cloth, Puppet.WW × Puppet.WH (default 1080 × 1920), fitted into the canvas by Puppet.cam().
   Piece-local units are whatever the piece was built in (its box); a piece is drawn at 1 unit = 1 world px.
   Load after lib.js (Pilot) and story.js (Story). Deterministic: no Math.random, no per-frame state that accumulates;
   heavy textures are built once in init(); scratch buffers are reused but fully cleared on every use (seek-safe). */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, noise, canvas } = Pilot;
  const P = {};
  let W, H, WW, WH, S0, BX, BY;
  let HIDE, CLOTH, Tc, T, SOFT2, SG2, SOFT4, SG4, BL, BG, VIGN, GRAIN, AUD;
  let CUTA = 1;                                   // how much a cut removes (1 = a hole; .5 = thinned leather)
  const BUF = new Map();                          // scratch canvases by key (allocated once, cleared on use)
  const buf = (key, w, h) => { let b = BUF.get(key); if (!b || b.c.width !== w || b.c.height !== h) { const c = canvas(w, h); b = { c, g: c.getContext('2d') }; BUF.set(key, b); } return b; };

  // ------------------------------------------------------------------ palette & type
  P.INK = '#160c06';                              // carved outlines, nail studs
  P.ACCENT = '#a21814';                           // the ONE saturated colour: translucent red dye (rgb 162,24,20)
  P.DYE = {                                       // leather dyes as they read through the lamp (dark → light)
    soot: '#0b0603', claw: '#22120a', deep: '#2b170a', floor: '#301c0d', wall: '#3e2412', brace: '#4f2a11', hide: '#734420',
    // brighter dyes from the original shadow-puppet card, for stories that want colour (use sparingly; keep one accent)
    vermilion: '#b8211a', ochre: '#dc9d1e', gold: '#c98a26', malachite: '#236e3a', indigo: '#22647e', raw: '#e2bd80',
  };
  P.TEXT = { color: '#f8ead0', src: '#e6d2ae', cardSrc: '#dcc59f', cta: '#f1c27a', shadow: 'rgba(10,4,0,.95)' };
  P.FONT = "'Gowun Batang','Noto Serif KR',serif";
  P.FILM_FONTS = { serif: "'Gowun Batang'", sans: "'Noto Sans KR'" };   // window.FILM_FONTS for the page
  P.FONTS = ["700 60px 'Gowun Batang'", "400 30px 'Gowun Batang'", "500 30px 'Noto Sans KR'", "600 30px 'Noto Sans KR'"];   // Pilot.run({fonts})

  // ------------------------------------------------------------------ setup
  /* init(opts) — build the heavy textures once (call from the scene's init, before building pieces).
     opts.world [w,h] cloth size in world px (default [1080,1920]); opts.vignette {cy, inner, outer, stops} overrides.
     Sets Puppet.W/H (canvas), WW/WH (cloth), S0/BX/BY (cloth → canvas fit), Puppet.T (transmission context). */
  P.init = function (o = {}) {
    W = Pilot.W; H = Pilot.H; [WW, WH] = o.world || [1080, 1920];
    S0 = Math.min(W / WW, H / WH); BX = (W - WW * S0) / 2; BY = (H - WH * S0) / 2;
    Object.assign(P, { W, H, WW, WH, S0, BX, BY });
    HIDE = hideTile(); CLOTH = clothTex();
    Tc = canvas(W, H); T = Tc.getContext('2d'); P.T = T; P.Tc = Tc;
    SOFT2 = canvas(Math.round(W / 2), Math.round(H / 2)); SG2 = SOFT2.getContext('2d'); SOFT4 = canvas(Math.round(W / 4), Math.round(H / 4)); SG4 = SOFT4.getContext('2d');
    BL = canvas(Math.round(W / 8), Math.round(H / 8)); BG = BL.getContext('2d');
    const v = Object.assign({ cy: .52, inner: .3, outer: .55, stops: [[0, '#fff'], [.6, '#e9d2b6'], [1, '#8a5a30']] }, o.vignette || {});
    VIGN = canvas(W, H); { const g = VIGN.getContext('2d'), vg = g.createRadialGradient(W / 2, H * v.cy, Math.min(W, H) * v.inner, W / 2, H * v.cy, Math.hypot(W, H) * v.outer);
      for (const [k, c] of v.stops) vg.addColorStop(k, c); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
    GRAIN = Pilot.speckle(Math.round(W / 2), Math.round(H / 2), 40, 5);
    P.HIDE = HIDE; P.CLOTH = CLOTH;
  };

  function hideTile() {     // 256² tileable leather: mottling, fibres, a few dark specks
    const N = 256, c = canvas(N, N), g = c.getContext('2d'), id = g.createImageData(N, N), d = id.data;
    const hs = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
    const vn = (x, y, P) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = (a, b) => hs(((a % P) + P) % P, ((b % P) + P) % P);
      return (w(i, j) * (1 - u) + w(i + 1, j) * u) * (1 - v) + (w(i, j + 1) * (1 - u) + w(i + 1, j + 1) * u) * v; };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const f = vn(x / 32, y / 32, 8) * .5 + vn(x / 16, y / 16, 16) * .3 + vn(x / 4, y / 4, 64) * .2, sp = hs(x + 999, y) > .985 ? .8 : 1, v = (.8 + .24 * f) * sp, i = (y * N + x) * 4;
      d[i] = Math.min(255, v * 255); d[i + 1] = Math.min(255, v * 246); d[i + 2] = Math.min(255, v * 228); d[i + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    const r = rng(41); g.strokeStyle = 'rgba(90,58,30,.12)'; g.lineWidth = .8;
    for (let k = 0; k < 500; k++) { const x = r() * N, y = r() * N, a = r() * 6.28, l = 6 + r() * 16; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + 3, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    return c;
  }
  function clothTex() {     // cotton screen at world size: weave + fibre speckle + density blotches + darker edges
    const lw = Math.round(WW / 8), lh = Math.round(WH / 8), lo = canvas(lw, lh), lg = lo.getContext('2d'), ld = lg.createImageData(lw, lh);
    for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) { const i = (y * lw + x) * 4; ld.data[i] = Pilot.fbm(x * .06, y * .06, 4) * 255; ld.data[i + 1] = Pilot.noise(x * .5 + 40, y * .5) * 255; ld.data[i + 2] = 0; ld.data[i + 3] = 255; }
    lg.putImageData(ld, 0, 0);
    const up = canvas(WW, WH), ug = up.getContext('2d'); ug.imageSmoothingQuality = 'high'; ug.drawImage(lo, 0, 0, WW, WH);
    const u = ug.getImageData(0, 0, WW, WH).data;
    const c = canvas(WW, WH), g = c.getContext('2d'), id = g.createImageData(WW, WH), d = id.data, r = rng(9);
    for (let y = 0; y < WH; y++) {
      const ey = Math.min(1, y / 90, (WH - y) / 90);
      for (let x = 0; x < WW; x++) {
        const i = (y * WW + x) * 4, bl = u[i] / 255, wb = u[i + 1] / 255;
        const th = .5 + .5 * Math.sin(x * 2.6 + wb * 2) * Math.sin(y * 2.6 + wb * 2.3);
        const ex = Math.min(1, x / 90, (WW - x) / 90), ed = Math.max(0, Math.min(ex, ey)), e = ed * ed * (3 - 2 * ed);
        const v = (1 - (.05 * th + .035 * (r() - .5) + .11 * (bl - .5))) * (.74 + .26 * e);
        d[i] = 255 * v; d[i + 1] = 247 * v; d[i + 2] = 232 * v; d[i + 3] = 255;
      }
    }
    g.putImageData(id, 0, 0); return c;
  }

  // ------------------------------------------------------------------ path helpers
  /* smooth(g, pts, closed=true) — a soft closed (or open) curve through the midpoints of pts [[x,y],…]. Adds to g's path. */
  P.smooth = function (g, pts, closed = true) {
    const n = pts.length, m = i => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2];
    if (!closed) { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n - 1; i++) { const q = m(i); g.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); } g.lineTo(pts[n - 1][0], pts[n - 1][1]); return; }
    const s = m(0); g.moveTo(s[0], s[1]); for (let i = 1; i <= n; i++) { const p = pts[i % n], q = m(i); g.quadraticCurveTo(p[0], p[1], q[0], q[1]); } g.closePath();
  };
  /* poly(g, pts) — a closed polygon subpath. */
  P.poly = function (g, pts) { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };

  // ------------------------------------------------------------------ carving (use inside a piece's draw callback)
  /* cut(g, fn, rule='evenodd') — punch out the path fn(g) builds (destination-out at the current cut strength). */
  P.cut = (g, fn, rule = 'evenodd') => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = `rgba(0,0,0,${CUTA})`; g.beginPath(); fn(g); g.fill(rule); g.restore(); };
  /* cutLine(g, w, fn) — a slit: stroke-cut the path fn(g) builds, w px wide, round caps. */
  P.cutLine = (g, w, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.strokeStyle = `rgba(0,0,0,${CUTA})`; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); fn(g); g.stroke(); g.restore(); };
  /* ink(g, w, fn, col=INK) — a carved dark outline (stroke) along fn(g)'s path. */
  P.ink = (g, w, fn, col = P.INK) => { g.beginPath(); fn(g); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  /* dots(g, pts, r) — round punch holes of radius r at pts. */
  P.dots = (g, pts, r) => P.cut(g, q => { for (const [x, y] of pts) { q.moveTo(x + r, y); q.arc(x, y, r, 0, 7); } }, 'nonzero');
  /* coin(g, x, y, r) — a coin hole: round hole with a square of leather left inside. */
  P.coin = (g, x, y, r) => P.cut(g, q => { q.arc(x, y, r, 0, 7); q.rect(x - r * .4, y - r * .4, r * .8, r * .8); });
  /* scroll(g, x, y, r, rot=0, flip=1, w=1.8) — a cloud-scroll slit (spiral, radius r) ending in a teardrop hole. */
  P.scroll = function (g, x, y, r, rot = 0, flip = 1, w = 1.8) {
    P.cutLine(g, w, q => { for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2.1, rr = r * (1 - i / 40 * .78);
      const px = x + Math.cos(rot + a * flip) * rr, py = y + Math.sin(rot + a * flip) * rr; i ? q.lineTo(px, py) : q.moveTo(px, py); } });
    P.cut(g, q => q.arc(x, y, r * .17, 0, 7));
  };
  /* crescents(g, x0, y0, x1, y1, r, w) — rows of fish-scale crescent slits (scales, tiles, fur) over a box. */
  P.crescents = function (g, x0, y0, x1, y1, r, w) {
    let row = 0; for (let y = y0; y < y1; y += r * 1.1, row++) for (let x = x0 + (row % 2) * r; x < x1; x += r * 2)
      P.cutLine(g, w, q => q.arc(x, y, r * .85, .18 * Math.PI, .82 * Math.PI));
  };
  /* taper(g, x0, y0, x1, y1, w) — a tapered slit (lens), widest (w) in the middle: cracks, rain, grass, fur, rays. */
  P.taper = (g, x0, y0, x1, y1, w) => P.cut(g, q => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    q.moveTo(x0, y0); q.quadraticCurveTo(mx + nx * 2, my + ny * 2, x1, y1); q.quadraticCurveTo(mx - nx * 2, my - ny * 2, x0, y0); q.closePath(); }, 'nonzero');
  /* lattice(g, x0, y0, x1, y1, s, w) — a diamond lattice: diamond holes on an s-px staggered grid, w-px leather strips. */
  P.lattice = (g, x0, y0, x1, y1, s, w) => P.cut(g, q => { const d = s / 2 - w * .71; let row = 0;
    for (let y = y0; y <= y1; y += s / 2, row++) for (let x = x0 + (row % 2) * s / 2; x <= x1; x += s) { q.moveTo(x, y - d); q.lineTo(x + d, y); q.lineTo(x, y + d); q.lineTo(x - d, y); q.closePath(); } }, 'nonzero');
  /* punch(g, p, box) — fill an area with a perforation pattern. p = { kind, area:[x0,y0,x1,y1] (default box), …}:
       'dots' {r=2.4, step=r*5}  ·  'crescents' {r=9, w=1.6}  ·  'scrolls' {r=11, step=r*3.2, w=1.4}  ·  'coins' {r=7, step=r*3.4}
       'lattice' {step=18, w=3}  ·  'slits' {len=26, w=3, step=14, angle=π/2, jitter=.5, seed}  ·  'leaves' {r=9, step=r*2.4, seed}
     or p = (g, box) => {…} for a custom pattern. Patterns are clipped by the caller (carve() clips to the silhouette). */
  P.punch = function (g, p, box) {
    if (typeof p === 'function') return p(g, box);
    const [x0, y0, x1, y1] = p.area || box, r = rng(p.seed || 1);
    switch (p.kind) {
      case 'dots': { const rr = p.r || 2.4, s = p.step || rr * 5, pts = []; let row = 0; for (let y = y0 + s / 2; y < y1; y += s * .87, row++) for (let x = x0 + s / 2 + (row % 2) * s / 2; x < x1; x += s) pts.push([x, y]); return P.dots(g, pts, rr); }
      case 'crescents': return P.crescents(g, x0, y0, x1, y1, p.r || 9, p.w || 1.6);
      case 'scrolls': { const rr = p.r || 11, s = p.step || rr * 3.2; let i = 0; for (let y = y0 + s / 2; y < y1; y += s) for (let x = x0 + s / 2; x < x1; x += s, i++) P.scroll(g, x, y, rr, i % 2 ? 0 : Math.PI, 1, p.w || 1.4); return; }
      case 'coins': { const rr = p.r || 7, s = p.step || rr * 3.4; let row = 0; for (let y = y0 + s / 2; y < y1; y += s * .87, row++) for (let x = x0 + s / 2 + (row % 2) * s / 2; x < x1; x += s) P.coin(g, x, y, rr); return; }
      case 'lattice': return P.lattice(g, x0, y0, x1, y1, p.step || 18, p.w || 3);
      case 'slits': { const L = p.len || 26, s = p.step || 14, a = p.angle ?? Math.PI / 2, j = p.jitter ?? .5, ca = Math.cos(a) * L / 2, sa = Math.sin(a) * L / 2;
        let row = 0; for (let y = y0 + L / 2; y < y1; y += s * 1.6, row++) for (let x = x0 + s / 2 + (row % 2) * s / 2; x < x1; x += s) { const ox = (r() - .5) * s * j, oy = (r() - .5) * s * j * 2, k = .7 + .5 * r();
          P.taper(g, x + ox - ca * k, y + oy - sa * k, x + ox + ca * k, y + oy + sa * k, p.w || 3); } return; }
      case 'leaves': { const rr = p.r || 9, s = p.step || rr * 2.4; let row = 0; for (let y = y0 + s / 2; y < y1; y += s * .8, row++) for (let x = x0 + s / 2 + (row % 2) * s / 2; x < x1; x += s) { const a = r() * Math.PI * 2, l = rr * (.8 + .4 * r());
          P.taper(g, x - Math.cos(a) * l, y - Math.sin(a) * l, x + Math.cos(a) * l, y + Math.sin(a) * l, l * .7); } return; }
    }
  };

  // ------------------------------------------------------------------ pieces
  /* piece(box, res, draw, seed=0, opts) — a leather sprite. box [x0,y0,x1,y1] in local units, res = sprite px per unit;
     draw(g) paints dye / cuts / ink in local units; then the hide texture is multiplied in (offset by seed) and the
     alpha restored so holes survive. opts.cutAlpha: cut strength during draw (default 1; .5 = thinned, half-lit cuts).
     Returns { c, x0, y0, w, h } — draw it with drawP(g, piece) at 1 unit = 1 world px (transform g first). */
  P.piece = function (box, ssc, draw, seed = 0, o = {}) {
    const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0, c = canvas(Math.ceil(w * ssc), Math.ceil(h * ssc)), g = c.getContext('2d');
    const prev = CUTA; if (o.cutAlpha != null) CUTA = o.cutAlpha;
    g.setTransform(ssc, 0, 0, ssc, -x0 * ssc, -y0 * ssc); g.lineJoin = 'round'; g.lineCap = 'round';
    draw(g);
    CUTA = prev;
    const m = canvas(c.width, c.height); m.getContext('2d').drawImage(c, 0, 0);
    g.setTransform(1, 0, 0, 1, 0, 0);
    const pat = g.createPattern(HIDE, 'repeat'); pat.setTransform(new DOMMatrix([1, 0, 0, 1, (seed * 137) % 256, (seed * 71) % 256]));
    g.globalCompositeOperation = 'multiply'; g.fillStyle = pat; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0); g.globalCompositeOperation = 'source-over';
    return { c, x0, y0, w, h };
  };
  /* drawP(g, piece) — draw a piece at its own box (local units → g's current transform). */
  P.drawP = (g, p) => g.drawImage(p.c, p.x0, p.y0, p.w, p.h);

  /* carve(spec) — THE general puppet piece: any silhouette + dye + perforation + carved outline, on a pivot.
       shape:   [[x,y],…] (smoothed; smooth:false for straight edges) or (g) => { path }   local units, origin = pivot/joint
       box:     [x0,y0,x1,y1] bounds (pad a few units for the outline);  res: sprite px per unit (default 2; ≥ 2.5 if it gets close-ups)
       dye:     fill colour (default DYE.claw — dark reads best);  seed: hide-texture offset
       punch:   a pattern or list (see punch()), clipped to the silhouette; rim: solid leather border kept around the holes (default 5)
       detail:  (g) => {…} extra dye / cuts / ink after the punch (eyes, a mouth slit, a second dye);  outline: px (default 1.8, 0 = none)
       cutAlpha:.5 for half-lit (thinned) cuts.          Returns a piece; draw with place() / drawP() / chain(). */
  P.carve = function (s) {
    const shape = typeof s.shape === 'function' ? s.shape : (s.smooth === false ? g => P.poly(g, s.shape) : g => P.smooth(g, s.shape));
    const dye = s.dye || P.DYE.claw;
    return P.piece(s.box, s.res || 2, g => {
      g.fillStyle = dye; g.beginPath(); shape(g); g.fill();
      if (s.punch) {
        g.save(); g.beginPath(); shape(g); g.clip(); for (const p of [].concat(s.punch)) P.punch(g, p, s.box); g.restore();
        const rim = s.rim ?? 5; if (rim > 0) { g.save(); g.beginPath(); shape(g); g.clip(); g.lineWidth = rim * 2; g.strokeStyle = dye; g.beginPath(); shape(g); g.stroke(); g.restore(); }
      }
      if (s.detail) s.detail(g);
      if (s.outline !== 0) P.ink(g, s.outline || 1.8, shape, s.outlineColor || '#090402');
    }, s.seed || 0, { cutAlpha: s.cutAlpha });
  };
  /* silhouette(box, k, draw) — a solid black sprite (no hide, no holes) for a puppet held OFF the cloth: its shadow.
     draw(g) fills paths in local units; k = sprite px per unit (.5 is plenty — it is always blurred). Returns a piece. */
  P.silhouette = function (box, k, draw) {
    const [x0, y0, x1, y1] = box, c = canvas(Math.ceil((x1 - x0) * k), Math.ceil((y1 - y0) * k)), g = c.getContext('2d');
    g.setTransform(k, 0, 0, k, -x0 * k, -y0 * k); g.fillStyle = '#000'; draw(g);
    return { c, x0, y0, w: x1 - x0, h: y1 - y0 };
  };
  /* shadowOf(piece) — the same piece as a black silhouette with its holes (what it casts once lifted off the cloth). Cached. */
  P.shadowOf = function (p) {
    if (p.sh) return p.sh; const c = canvas(p.c.width, p.c.height), g = c.getContext('2d');
    g.drawImage(p.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    return (p.sh = { c, x0: p.x0, y0: p.y0, w: p.w, h: p.h });
  };

  // ------------------------------------------------------------------ distance from the cloth
  /* dist(d, o) — what distance from the cloth does to a piece. d 0 = pressed on the cloth (sharp, true size, full density),
     1 = held far toward the lamp. Returns { scale, blur (world px), den, shadow (0..1 how much it reads as a plain shadow) }.
     o.grow (default 1.6 → 2.6× at d=1), o.blur (34), o.fade (.5). */
  P.dist = (d, o = {}) => ({ scale: 1 + (o.grow ?? 1.6) * d, blur: (o.blur ?? 34) * d, den: 1 - (o.fade ?? .5) * d, shadow: ss(.1, .55, d) });
  /* press(t, t0, dur=.55) — distance for an arrival: 1 (far, big, soft) → 0 (pressed sharp) over dur s, ease-out. */
  P.press = (t, t0, dur = .55) => 1 - eo(clamp((t - t0) / dur));
  /* liftOff(t, t0, dur=.9) — distance for an exit: 0 → 1 over dur s, ease-in (it grows, softens and fades). */
  P.liftOff = (t, t0, dur = .9) => { const k = clamp((t - t0) / dur); return k * k; };
  /* place(g, p, o) — draw a piece (or a whole rig) into T at a pose and a distance from the cloth.
       p: a piece, or a rig { box: [x0,y0,x1,y1] local bounds, draw: (g) => {…} } (several pieces, joints, rivets —
       blurred as ONE layer so its parts never seam while it presses on or lifts off).
       o: { x, y (world), rot (rad), scale, sx, sy (−1 flips), dist (0..1, see dist(); grows about the pivot), alpha,
       grow / blur / fade (dist() tuning) }.
     Pressed (sharp) it is drawn directly with 'multiply'. Held off the cloth it is drawn into a small scratch buffer
     (½ or ¼ res for big blurs), its dye darkened toward a plain (warm-black) shadow past mid-distance, blurred there and multiplied in. */
  P.place = function (g, p, o = {}) {
    const D = P.dist(o.dist || 0, o), s = (o.scale || 1) * D.scale, a = (o.alpha ?? 1) * D.den;
    if (a <= .002) return;
    const rig = !!p.draw, [x0, y0, x1, y1] = rig ? p.box : [p.x0, p.y0, p.x0 + p.w, p.y0 + p.h];
    const paint = q => { if (rig) p.draw(q); else P.drawP(q, p); };
    const m0 = g.getTransform(), px = D.blur * Math.hypot(m0.a, m0.b);
    const full = m0.multiply(new DOMMatrix().translate(o.x || 0, o.y || 0).rotate((o.rot || 0) * 180 / Math.PI).scale(s * (o.sx || 1), s * (o.sy || 1)));
    if (px <= .4) { g.save(); g.setTransform(full); g.globalAlpha = a; g.globalCompositeOperation = 'multiply'; paint(g); g.restore(); return; }
    // screen-space bounds, padded for the blur, at reduced resolution; buffers are reused (sizes rounded to 64 px)
    const cs = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => full.transformPoint(new DOMPoint(x, y)));
    const pad = px * 2.6 + 4, bx0 = Math.min(...cs.map(q => q.x)) - pad, by0 = Math.min(...cs.map(q => q.y)) - pad, bx1 = Math.max(...cs.map(q => q.x)) + pad, by1 = Math.max(...cs.map(q => q.y)) + pad;
    const rs = px > 14 ? .25 : px > 5 ? .5 : 1, bw = Math.ceil(Math.max(1, (bx1 - bx0) * rs) / 64) * 64, bh = Math.ceil(Math.max(1, (by1 - by0) * rs) / 64) * 64;
    const A = buf('placeA' + bw + 'x' + bh, bw, bh), Bf = buf('placeB' + bw + 'x' + bh, bw, bh);
    for (const q of [A.g, Bf.g]) { q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; q.filter = 'none'; q.clearRect(0, 0, bw, bh); }
    A.g.save(); A.g.setTransform(new DOMMatrix().scale(rs).translate(-bx0, -by0).multiply(full)); paint(A.g); A.g.restore();
    if (D.shadow > 0) { A.g.globalCompositeOperation = 'source-atop'; A.g.globalAlpha = D.shadow; A.g.fillStyle = '#120904'; A.g.fillRect(0, 0, bw, bh); A.g.globalAlpha = 1; A.g.globalCompositeOperation = 'source-over'; }
    Bf.g.filter = `blur(${(px * rs).toFixed(2)}px)`; Bf.g.drawImage(A.c, 0, 0); Bf.g.filter = 'none';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.globalCompositeOperation = 'multiply';
    g.drawImage(Bf.c, 0, 0, bw, bh, bx0, by0, bw / rs, bh / rs); g.restore();
  };
  /* soft(g, M, o, draw) — a big soft shadow from a puppet held well off the cloth (can cover the whole frame).
     draw(sg) draws in world units (M already applied, blur + density already set) on a white half- or quarter-res
     buffer; the buffer is then multiplied into g (T) full-frame. o: { blur (world px), den (0..1), quarter (default
     blur·M.a > 15), clip: (g) => path in world units to limit where the shadow falls }. */
  P.soft = function (g, M, o, draw) {
    const q = o.quarter ?? (o.blur * M.a > 15), SOFT = q ? SOFT4 : SOFT2, SG = q ? SG4 : SG2;
    SG.setTransform(1, 0, 0, 1, 0, 0); SG.globalAlpha = 1; SG.filter = 'none'; SG.globalCompositeOperation = 'source-over'; SG.fillStyle = '#fff'; SG.fillRect(0, 0, SOFT.width, SOFT.height);
    const k = SOFT.width / W;
    SG.setTransform(new DOMMatrix().scale(k).multiply(M));
    SG.filter = `blur(${(o.blur * M.a * k).toFixed(2)}px)`; SG.globalAlpha = Math.min(1, o.den);
    draw(SG);
    SG.filter = 'none'; SG.globalAlpha = 1;
    g.save();
    if (o.clip) { g.setTransform(M); g.beginPath(); o.clip(g); g.clip(); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(SOFT, 0, 0, W, H);
    g.restore();
  };
  /* lift(g, x, y, blur, alpha, draw, o) — draw a small rig (several pieces, rivets) at world (x,y) either directly
     (blur ≤ .4) or through a scratch buffer blurred as ONE layer (no seams between its pieces while it presses on /
     lifts off). draw(g) works in world units with the origin at (x,y). blur in screen px. o.size [w,h] buffer px and
     o.origin [ox,oy] where (x,y) sits in it (default [720,620] / [260,260]). Leaves g's transform as on entry for
     direct draws (call inside g.save/restore). */
  P.lift = function (g, x, y, blur, alpha, draw, o = {}) {
    const [bw, bh] = o.size || [720, 620], [ox, oy] = o.origin || [260, 260];
    const useB = blur > .4, out = g;
    if (useB) { const b = buf('lift' + bw + 'x' + bh, bw, bh); g = b.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, bw, bh); g.save(); g.translate(ox, oy); draw(g);
      g.restore(); out.globalCompositeOperation = 'multiply'; out.globalAlpha = alpha; out.filter = `blur(${blur.toFixed(1)}px)`; out.drawImage(b.c, x - ox, y - oy); out.filter = 'none'; }
    else { g.translate(x, y); g.globalAlpha = alpha; draw(g); }
  };

  // ------------------------------------------------------------------ joints, rods, hands
  /* rivet(g, x, y, r=3.2) — a joint rivet: dark ring + pale thread knot. Leaves g in 'multiply'. */
  P.rivet = function (g, x, y, r = 3.2) {
    g.globalCompositeOperation = 'multiply'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = '#0a0502'; g.fill();
    g.globalCompositeOperation = 'source-over'; g.beginPath(); g.arc(x, y, r * .45, 0, 7); g.fillStyle = 'rgba(205,160,110,.85)'; g.fill();
    g.globalCompositeOperation = 'multiply';
  };
  /* rod(g, x0, y0, x1, y1, a=1) — a control rod just off the cloth: a soft grey line with a darker core (world units). */
  P.rod = function (g, x0, y0, x1, y1, a = 1) {
    g.strokeStyle = `rgba(40,26,16,${.16 * a})`; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = `rgba(30,18,10,${.42 * a})`; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  };
  /* joint(g, piece, x, y, ang, kids) — draw a piece pivoting at (x,y) (local units of the parent), rotated ang rad;
     kids(g) then draws child pieces in this piece's local frame (hierarchical rigs: torso → arm → forearm → hand). */
  P.joint = function (g, p, x, y, ang, kids) { g.save(); g.translate(x, y); g.rotate(ang); P.drawP(g, p); if (kids) kids(g); g.restore(); };
  /* chain(g, base, a0, links, c, o) — a jointed finger / tail / chain drawn link by link.
       base [x,y], a0 start angle (rad); links [{ p: piece (pointing +x from its joint), len, bend (rad at c=1), r: rivet radius }];
       c 0..1 curl; o.rest bend at c=0 per link (default .06); o.tip { p, bend } a last piece (nail, claw, leaf);
       o.joints: array to collect [[x,y], r] for rivets (draw them after all chains so they sit on top). Returns the tip [x,y]. */
  P.chain = function (g, base, a0, links, c, o = {}) {
    let a = a0, p = base; const rest = o.rest ?? .06;
    for (const L of links) {
      a -= c * L.bend + (1 - c) * rest;
      g.save(); g.translate(p[0], p[1]); g.rotate(a); P.drawP(g, L.p); g.restore();
      if (o.joints) o.joints.push([p, L.r]); p = [p[0] + Math.cos(a) * L.len, p[1] + Math.sin(a) * L.len];
    }
    if (o.tip) { g.save(); g.translate(p[0], p[1]); g.rotate(a - c * o.tip.bend); P.drawP(g, o.tip.p); g.restore(); }
    return p;
  };
  /* buildHand(o) — an articulated leather hand: back of hand (origin at the knuckle line, wrist toward +x), a forearm,
     three finger-segment pieces and a nail. o: { dye, outline, nails (true), segs [[len,width]…] (default claw-long
     [[50,13],[40,11.5],[32,10]]), tendons (true: slits that read as bones), armScales (true), seed (11) }.
     Returns { hand, arm, seg[], nail, segLen[], rivets[] } for drawHand(). */
  P.buildHand = function (o = {}) {
    const OUT = o.outline || '#090402', sd = o.seed ?? 11, dye = o.dye || { hand: '#22120a', arm: '#20110a', seg: '#1f1009', nail: '#0b0603' };
    const handPts = [[-2, -64], [30, -52], [62, -30], [78, -4], [74, 30], [40, 54], [-2, 66], [-9, 34], [-11, 0], [-9, -34]];
    const hand = P.piece([-16, -80, 92, 82], 2.5, g => {
      g.fillStyle = dye.hand;
      g.beginPath(); P.smooth(g, handPts); g.fill();
      for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-3 + Math.abs(i - 1.5) * 3, -51 + 34 * i, 9.5, 0, 7); g.fill(); }
      if (o.tendons !== false) for (let i = 0; i < 4; i++) { const ky = -51 + 34 * i, wy = -12 + 9 * i;
        P.cut(g, q => { q.moveTo(66, wy - 1); q.quadraticCurveTo(34, (wy + ky) / 2 - 3, 9, ky - 1.2); q.lineTo(9, ky + 1.2); q.quadraticCurveTo(34, (wy + ky) / 2 + 3, 66, wy + 1); q.closePath(); }, 'nonzero'); }
      for (let i = 0; i < 4; i++) P.ink(g, 1.3, q => q.arc(-3 + Math.abs(i - 1.5) * 3, -51 + 34 * i, 9.5, 0, 7), OUT);
      P.ink(g, 1.8, q => P.smooth(q, handPts), OUT);
    }, sd);
    const armPts = [[-4, -26], [140, -24], [330, -14], [330, 50], [140, 40], [-4, 28]];
    const arm = P.piece([-10, -40, 340, 60], 2, g => {
      g.fillStyle = dye.arm;
      g.beginPath(); P.smooth(g, armPts); g.fill();
      if (o.armScales !== false) P.crescents(g, 40, -12, 320, 40, 9, 1.6);
      P.ink(g, 1.8, q => P.smooth(q, armPts), OUT);
    }, sd + 1);
    const segs = o.segs || [[50, 13], [40, 11.5], [32, 10]];
    const seg = segs.map(([L, w], k) => P.piece([-w * .8, -w, L + w * .5, w], 3, g => {
      g.fillStyle = dye.seg;
      g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(L, -w * .38); g.arc(L, 0, w * .38, -Math.PI / 2, Math.PI / 2); g.lineTo(0, w / 2); g.arc(0, 0, w / 2, Math.PI / 2, Math.PI * 1.5); g.fill();
      g.beginPath(); g.arc(0, 0, w * .62, 0, 7); g.fill();
      P.cut(g, q => { q.ellipse(L * .55, 0, L * .16, w * .1, 0, 0, 7); }, 'nonzero');
      P.ink(g, 1.2, q => { q.moveTo(0, -w / 2); q.lineTo(L, -w * .38); q.arc(L, 0, w * .38, -Math.PI / 2, Math.PI / 2); q.lineTo(0, w / 2); }, OUT);
      P.ink(g, 1.2, q => q.arc(0, 0, w * .62, 0, 7), OUT);
    }, sd + 9 + k));
    const nail = o.nails === false ? null : P.piece([-4, -40, 56, 10], 3, g => {
      g.fillStyle = dye.nail;
      g.beginPath(); g.moveTo(0, -5); g.bezierCurveTo(20, -7, 42, -12, 54, -36); g.bezierCurveTo(46, -14, 30, 1, 0, 5); g.closePath(); g.fill();
    }, sd + 19);
    return { hand, arm, seg, nail, segLen: segs.map(s => s[0]), rivets: o.rivets || [3.1, 2.8, 2.5] };
  };
  /* drawHand(g, h, o) — draw a hand from buildHand() at g's origin (local units; palm faces −y, fingers point −x).
       o: { curl: i => 0..1 per finger (0 = open, 1 = hooked), thumb: 0..1, spread (rad, default .09 per finger),
       bends [.22,.72,.62] per segment at full curl, nailBend .35, arm: [x, y, ang] forearm placement or null }. */
  P.drawHand = function (g, h, o = {}) {
    const curl = o.curl || (() => 0), bends = o.bends || [.22, .72, .62], arm = o.arm === undefined ? [70, 8, .62] : o.arm;
    if (arm && h.arm) { g.save(); g.translate(arm[0], arm[1]); g.rotate(arm[2]); P.drawP(g, h.arm); g.restore(); }
    P.drawP(g, h.hand);
    const joints = [], L = i => ({ p: h.seg[i], len: h.segLen[i], r: h.rivets[i] });
    const tip = h.nail ? { p: h.nail, bend: o.nailBend ?? .35 } : null;
    for (let i = 0; i < 4; i++) {
      const c = curl(i);
      P.chain(g, [-3 + Math.abs(i - 1.5) * 3, -51 + 34 * i], Math.PI + (-.2 + (o.spread ?? .09) * i) - .15 * (1 - c), [0, 1, 2].map(k => Object.assign(L(k), { bend: bends[k] })), c, { joints, tip });
    }
    if (o.thumb != null) P.chain(g, [30, 50], Math.PI * .72, [Object.assign(L(1), { bend: -.1 }), Object.assign(L(2), { bend: -.5 })], o.thumb, { joints, tip: h.nail ? { p: h.nail, bend: -.2 } : null });
    for (const [[x, y], r] of joints) P.rivet(g, x, y, Math.max(2.6, r));
  };
  /* tremor(t, seed, k=1) — hand-held wobble of a puppet on its rod: { x, y (world px), r (rad) }; k ≈ 1 calm, 1.8 tense. */
  P.tremor = (t, seed, k = 1) => ({ x: 2.2 * k * (noise(t * 1.6, seed) * 2 - 1), y: 2 * k * (noise(t * 1.4, seed + 2) * 2 - 1), r: .025 * k * (noise(t * 1.2, seed + 6) * 2 - 1) });

  // ------------------------------------------------------------------ hinged pieces (perspective)
  /* hingePt(hg, u, v, th) — a point on a hinged flat piece swung th rad away from the cloth (toward the lamp side).
     hg = { x0, y0, w, h, vpx, vpy, depth, side } (world box when shut; vanishing point; camera distance px; side 1 =
     hinge on the left edge, −1 = right). u 0 (hinge) → 1 (free edge), v 0 (top) → 1 (bottom). Returns [x,y]. */
  P.hingePt = function (hg, u, v, th) {
    const X = hg.side === -1 ? hg.x0 + hg.w - u * hg.w * Math.cos(th) : hg.x0 + u * hg.w * Math.cos(th), z = u * hg.w * Math.sin(th), f = 1 / (1 + z / hg.depth), y = hg.y0 + v * hg.h;
    return [hg.vpx + (X - hg.vpx) * f, hg.vpy + (y - hg.vpy) * f];
  };
  /* swing(g, piece, hg, th, o) — draw a piece (built in local 0..w × 0..h) on its hinge, foreshortened in vertical strips
     (doors, shutters, book covers, a lid). o: { strips 64, k 1.4 (buffer px per world px), pad 20 }. */
  P.swing = function (g, p, hg, th, o = {}) {
    const N = o.strips || 64, k = o.k || 1.4, pad = o.pad ?? 20, bx = hg.x0 - pad, by = hg.y0 - pad, bw = hg.w + pad * 2, bh = hg.h + pad * 2;
    const b = buf('swing' + bw + 'x' + bh + '@' + k, Math.ceil(bw * k), Math.ceil(bh * k)), lb = b.g, cw = p.c.width, ch = p.c.height, R = hg.side === -1;
    lb.setTransform(1, 0, 0, 1, 0, 0); lb.clearRect(0, 0, b.c.width, b.c.height);
    lb.setTransform(k, 0, 0, k, -bx * k, -by * k);
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N, a = P.hingePt(hg, u0, 0, th), bb = P.hingePt(hg, u1, 1, th), am = P.hingePt(hg, (u0 + u1) / 2, 0, th), bm = P.hingePt(hg, (u0 + u1) / 2, 1, th);
      const w = R ? a[0] - bb[0] : bb[0] - a[0]; if (w <= 0) continue;
      const sx = R ? (1 - u1) * cw : u0 * cw;
      lb.drawImage(p.c, sx, 0, cw / N + .5, ch, R ? bb[0] : a[0], am[1], w + .7, bm[1] - am[1]);
    }
    g.drawImage(b.c, bx, by, bw, bh);
  };

  // ------------------------------------------------------------------ floor light (perspective)
  /* planks(g, o) — floor boards converging on the eye point. o: { vpx, vpy, y0 (floor line), yEnd (2100), step (64),
     k0, k1 (board range, default ±16), col ('rgba(40,22,10,.55)'), w (2.4), joints: { rows 9, col, w } cross joints }. */
  P.planks = function (g, o) {
    const { vpx, vpy, y0 } = o, yE = o.yEnd ?? 2100, st = o.step || 64, k0 = o.k0 ?? -16, k1 = o.k1 ?? 16;
    for (let k = k0; k <= k1; k++) { const xs = vpx + k * st; g.strokeStyle = o.col || 'rgba(40,22,10,.55)'; g.lineWidth = o.w ?? 2.4; g.beginPath(); g.moveTo(xs, y0); g.lineTo(vpx + (xs - vpx) * (yE - vpy) / (y0 - vpy), yE); g.stroke(); }
    if (o.joints) { const J = o.joints; for (let j = 0; j < (J.rows || 9); j++) { const y = y0 + 28 + j * j * 9 + j * 30; for (let k = k0; k <= k1; k++) { if ((k + j) % 3) continue;
      const x0 = vpx + (vpx + k * st - vpx) * (y - vpy) / (y0 - vpy), x1 = vpx + (vpx + (k + 1) * st - vpx) * (y - vpy) / (y0 - vpy); g.strokeStyle = J.col || 'rgba(40,22,10,.45)'; g.lineWidth = J.w || 2; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); } } }
  };
  /* rayPoly(src, pts, yEnd) — extend points away from a floor light point src [x,y] to the line y = yEnd (the far end of
     a beam on the floor). Returns the projected points (for a light wedge: [edgeA, edgeB, ...rayPoly(src,[edgeB,edgeA])]). */
  P.rayPoly = (src, pts, yEnd = 2100) => pts.map(p => { const k = (yEnd - src[1]) / (p[1] - src[1]); return [src[0] + (p[0] - src[0]) * k, yEnd]; });
  /* floorLight(g, poly, o, inner) — a patch of light on the floor: the floor leather slid away inside poly (world), so
     the cloth shows through as a warm gradient with the boards inked over it. o: { y0 (floor line), y1 (gradient end,
     1980), stops [[k,col]…], rect [x,y,w,h] clip (default the floor below y0), planks: options for planks() }.
     inner(g) draws more inside the same clip (a cast shadow). Call with g in 'multiply'; leaves it in 'multiply'. */
  P.floorLight = function (g, poly, o, inner) {
    const r = o.rect || [-400, o.y0, 1900, 800];
    g.save(); g.beginPath(); P.poly(g, poly); g.clip(); g.beginPath(); g.rect(...r); g.clip();
    g.globalCompositeOperation = 'source-over';
    const wg = g.createLinearGradient(0, o.y0, 0, o.y1 ?? 1980); for (const [k, c] of (o.stops || [[0, '#fbe8c4'], [.45, '#d9b07a'], [1, '#8e6238']])) wg.addColorStop(k, c);
    g.fillStyle = wg; g.fillRect(...r);
    g.globalCompositeOperation = 'multiply';
    if (o.planks) P.planks(g, Object.assign({ y0: o.y0 }, o.planks));
    if (inner) inner(g);
    g.restore();
  };
  /* castFloor(g, src, o) — a puppet's shadow thrown along the floor away from a floor light point (strip projection:
     each horizontal band of the sprite is laid at the floor depth where it lands, narrowing with perspective).
       src: a canvas (a blurred silhouette, feet at the bottom);  o: { x (feet x on the cloth), px, py (floor point under
       the lamp), base (floor line y where the shadow starts), y0 (first strip y, ≈ base − 4), len (shadow length px),
       w (width at depth k=1), pow (.6 narrowing), foot (fraction of src height above the feet, 1), den, blur (2.5),
       strips (150), box [x,y,w,h] world area of the scratch buffer, k (.6 buffer px per world px) }. */
  P.castFloor = function (g, src, o) {
    const N = o.strips || 150, sw = src.width, sh = src.height, [bx, by, bw, bh] = o.box, bk = o.k || .6, foot = o.foot ?? 1;
    const b = buf('floor' + bw + 'x' + bh + '@' + bk, Math.ceil(bw * bk), Math.ceil(bh * bk)), fg = b.g;
    fg.setTransform(1, 0, 0, 1, 0, 0); fg.clearRect(0, 0, b.c.width, b.c.height); fg.setTransform(bk, 0, 0, bk, -bx * bk, -by * bk);
    for (let i = 0; i < N; i++) {
      const v0 = i / N, v1 = (i + 1) / N, y0 = o.y0 + o.len * v0, y1 = o.y0 + o.len * v1, k = ((y0 + y1) / 2 - o.py) / (o.base - o.py);
      const cx = o.px + (o.x - o.px) * k, wpx = o.w * Math.pow(k, o.pow ?? .6);
      const syA = sh * (1 - v1) * foot, syB = sh * (1 - v0) * foot;
      fg.drawImage(src, 0, syA, sw, syB - syA, cx - wpx / 2, y0, wpx, y1 - y0 + 1.2);
    }
    g.globalAlpha = o.den ?? 1; g.filter = `blur(${o.blur ?? 2.5}px)`; g.drawImage(b.c, bx, by, bw, bh); g.filter = 'none'; g.globalAlpha = 1;
  };
  /* dimExcept(g, dim, holes) — a dark gauze over the whole cloth except the given polygons (world): "the room is dark
     until the light gets in". dim 1 = no gauze, .4 = deep dark. Call with g in 'multiply'. */
  P.dimExcept = function (g, dim, holes) {
    if (dim >= .995) return; const v = Math.round(255 * dim);
    g.save(); g.beginPath(); g.rect(-600, -600, WW + 1200, WH + 1200); for (const h of holes) P.poly(g, h);
    g.fillStyle = `rgb(${v},${v},${Math.round(v * .97)})`; g.fill('evenodd'); g.restore();
  };

  // ------------------------------------------------------------------ the accent: red dye
  /* dyeStroke(len, wid, seed, rgb) — a brush stroke of translucent dye, built horizontally (local x 0 → len) with bristle
     ridges, dry-brush gaps and frayed ends. rgb default ACCENT [162,24,20]. Returns S for drawStroke(). Build in init. */
  P.dyeStroke = function (len, wid, seed, rgb = [162, 24, 20]) {
    const pad = 26, c = canvas(len + pad * 2, wid * 2 + pad), g = c.getContext('2d'), r = rng(seed), cy = c.height / 2;
    const def = rgb.join() === '162,24,20';     // the house red keeps its hand-tuned ridge colours; other dyes derive them
    const dk = def ? [110, 10, 10] : rgb.map(v => Math.round(v * .68)), lt = def ? [225, 70, 52] : rgb.map(v => Math.round(v + (255 - v) * .35)), fr = def ? [160, 22, 18] : rgb.map(v => Math.max(0, v - 2));
    g.translate(pad, 0);
    const top = [], bot = [];
    for (let x = 0; x <= len; x += 6) {
      const k = Math.min(1, x / 26, (len - x + 10) / 40), w = wid / 2 * (.72 + .28 * k) * (1 + .08 * (Pilot.noise(x * .03, seed) - .5));
      top.push([x, cy - w + 3 * (Pilot.noise(x * .05, seed + 3) - .5)]); bot.push([x, cy + w + 3 * (Pilot.noise(x * .05, seed + 7) - .5)]);
    }
    g.beginPath(); g.moveTo(-6, cy); for (const p of top) g.lineTo(p[0], p[1]); for (let i = bot.length - 1; i >= 0; i--) g.lineTo(bot[i][0], bot[i][1]); g.closePath();
    g.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`; g.fill();
    for (let k = 0; k < 16; k++) {
      const y = cy + (r() - .5) * wid * .9, a = r() * len * .2, b = len - r() * len * .25, dark = r() < .55;
      g.strokeStyle = dark ? `rgba(${dk[0]},${dk[1]},${dk[2]},.55)` : `rgba(${lt[0]},${lt[1]},${lt[2]},.3)`; g.lineWidth = 1 + r() * 2.2;
      g.beginPath(); g.moveTo(a, y); for (let x = a; x < b; x += 20) g.lineTo(x, y + 1.6 * (Pilot.noise(x * .04, k + seed) - .5)); g.stroke();
    }
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 12; k++) { const y = cy + (r() - .5) * wid * .95, a = len * (.55 + r() * .35); g.strokeStyle = `rgba(0,0,0,${.35 + r() * .5})`; g.lineWidth = .8 + r() * 1.8; g.beginPath(); g.moveTo(a, y); g.lineTo(len + 10, y + (r() - .5) * 3); g.stroke(); }
    g.restore();
    for (let k = 0; k < 9; k++) { const y = cy + (r() - .5) * wid * .8, l = 6 + r() * 18; g.strokeStyle = `rgba(${fr[0]},${fr[1]},${fr[2]},.75)`; g.lineWidth = 1 + r() * 1.5; g.beginPath(); g.moveTo(len - 4, y); g.lineTo(len + l, y + (r() - .5) * 4); g.stroke(); }
    return { c, pad, cy, len };
  };
  /* drawStroke(g, S, x, y, ang, p) — paint a dyeStroke from (x,y) along angle ang (rad), revealed to fraction p (0..1). */
  P.drawStroke = function (g, S, x, y, ang, p) {
    if (p <= 0) return;
    g.save(); g.translate(x, y); g.rotate(ang);
    g.beginPath(); g.rect(-S.pad, -S.cy - 10, S.pad + S.len * p + (p >= 1 ? S.pad : 4), S.c.height + 20); g.clip();
    g.drawImage(S.c, -S.pad, -S.cy); g.restore();
  };

  // ------------------------------------------------------------------ the lamp
  /* flicker(t, o) — oil-lamp intensity multiplier ≈ 1: value noise + a fast buzz. o: { amt .045, hz 7, seed 1.3, buzz .012, buzzHz 23 }.
     Unsteady/relit lamp: { amt .09, hz 6, seed 3.1, buzz .01, buzzHz 19 }. */
  P.flicker = (t, o = {}) => 1 + (o.amt ?? .045) * (noise(t * (o.hz ?? 7), o.seed ?? 1.3) * 2 - 1) + (o.buzz ?? .012) * Math.sin(t * 2 * Math.PI * (o.buzzHz ?? 23));
  /* flare(t, t0, w) — a gaussian pulse at t0 of width w s (a lamp catching, a flare on a hit). Multiply by the overshoot. */
  P.flare = (t, t0, w) => Math.exp(-(((t - t0) / w) ** 2));
  /* gutter(t, t0, t1, seed=7.7) — a lamp guttering out between t0 and t1: 1 → 0 with fast stutter. */
  P.gutter = (t, t0, t1, seed = 7.7) => { const g = ss(t0, t1, t); return (1 - g) * (1 - .6 * g * noise(t * 36, seed)); };
  /* warm(k) — lamp colour [r,g,b] 0..1: k 0 = pale lamplight, 1 = deep amber (the "comforted" end of a film). */
  P.warm = k => [1, lerp(.89, .72, k), lerp(.72, .40, k)];
  /* lamp(c, t, M, o) — paint the lamp field × cloth onto c (the output canvas). Returns false when the lamp is out (c is black).
     o: { I intensity (≈1 normal; flares 1.4; 0 out), color [r,g,b] (warm()), x, y lamp hot-spot position (world),
     R 1800 reach, lobe 560 broad σ, hot 175 hot-spot σ, base .07 floor light, gain 1.75 exposure, wobble [8,6] px flame drift }. */
  P.lamp = function (c, t, M, o) {
    const I = o.I, Lc = o.color || P.warm(0);
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (I <= .002) return false;
    c.setTransform(M);
    const wb = o.wobble || [8, 6], R = o.R || 1800, lobe = o.lobe || 560, hot = o.hot || 175, base = o.base ?? .07, gain = o.gain || 1.75;
    const lx = o.x + wb[0] * (noise(t * 1.7, 9) - .5), ly = o.y + wb[1] * (noise(t * 1.3, 4) - .5), gr = c.createRadialGradient(lx, ly, 0, lx, ly, R);
    for (let i = 0; i <= 16; i++) { const r = R * Math.pow(i / 16, 1.7), v = base + .85 * Math.exp(-r * r / (2 * lobe * lobe)) + .9 * Math.exp(-r * r / (2 * hot * hot));
      gr.addColorStop(i / 16, Pilot.rgb(Lc.map(ch => 255 * (1 - Math.exp(-gain * ch * v * I))))); }
    c.fillStyle = gr; c.fillRect(-600, -600, WW + 1200, WH + 1200);
    c.globalCompositeOperation = 'multiply'; c.drawImage(CLOTH, 0, 0, WW, WH);
    c.globalCompositeOperation = 'source-over';
    return true;
  };

  // ------------------------------------------------------------------ per-frame passes
  /* beginT(M) — clear the transmission buffer to white and return it with transform M and 'multiply' set: draw every
     piece of this frame into it, back to front. */
  P.beginT = function (M) {
    const g = T; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.filter = 'none';
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    if (M) { g.setTransform(M); g.globalCompositeOperation = 'multiply'; }
    return g;
  };
  /* bloom(ctx, amt=.62, tint='#ffcf96') — warm glow from the bright parts of ctx (1/8-res buffer, screen blend). */
  P.bloom = function (ctx, amt = .62, tint = '#ffcf96') {
    BG.setTransform(1, 0, 0, 1, 0, 0); BG.globalCompositeOperation = 'source-over'; BG.filter = 'brightness(.72) contrast(3.2) blur(3px)';
    BG.drawImage(ctx.canvas, 0, 0, BL.width, BL.height); BG.filter = 'none';
    BG.globalCompositeOperation = 'destination-over'; BG.fillStyle = '#000'; BG.fillRect(0, 0, BL.width, BL.height);
    BG.globalCompositeOperation = 'multiply'; BG.fillStyle = tint; BG.fillRect(0, 0, BL.width, BL.height);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt; ctx.drawImage(BL, 0, 0, W, H); ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };
  /* screen(ctx, t, M, lamp, o) — lamp field × cloth × T (+ bloom) onto ctx. lamp = options for lamp(). o.bloom amount (.62).
     Returns whether the lamp was lit. */
  P.screen = function (ctx, t, M, lamp, o = {}) {
    const lit = P.lamp(ctx, t, M, lamp);
    if (lit) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(Tc, 0, 0); P.bloom(ctx, o.bloom ?? .62); }
    return lit;
  };
  /* stage(ctx, M, I) — the lacquered stage frame and dark room around the cloth, visible once the camera has pulled back
     (no-op while the cloth fills the frame). I = lamp intensity (warm spill). */
  P.stage = function (c, M, I) {
    const p0 = M.transformPoint(new DOMPoint(0, 0)), p1 = M.transformPoint(new DOMPoint(WW, WH));
    if (p0.y < 2) return;
    const k = M.a, bw = 34 * k;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#080503'; c.beginPath(); c.rect(0, 0, W, H); c.rect(p0.x - bw, p0.y - bw * 2.2, p1.x - p0.x + bw * 2, p1.y - p0.y + bw * 3.2); c.fill('evenodd');
    const sp = c.createRadialGradient((p0.x + p1.x) / 2, (p0.y + p1.y) / 2, 50, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2, (p1.y - p0.y) * .95);
    I = Math.min(1, I); sp.addColorStop(0, `rgba(150,92,40,${.32 * I})`); sp.addColorStop(1, 'rgba(150,92,40,0)');
    c.globalCompositeOperation = 'screen'; c.fillStyle = sp; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
    const lg = c.createLinearGradient(p0.x - bw, 0, p0.x, 0); lg.addColorStop(0, '#1c0a05'); lg.addColorStop(1, '#3d170b');
    const rg = c.createLinearGradient(p1.x, 0, p1.x + bw, 0); rg.addColorStop(0, '#3d170b'); rg.addColorStop(1, '#1c0a05');
    c.fillStyle = lg; c.fillRect(p0.x - bw, p0.y - bw * 2.2, bw, p1.y - p0.y + bw * 3.2);
    c.fillStyle = rg; c.fillRect(p1.x, p0.y - bw * 2.2, bw, p1.y - p0.y + bw * 3.2);
    const tg = c.createLinearGradient(0, p0.y - bw * 2.2, 0, p0.y); tg.addColorStop(0, '#220c06'); tg.addColorStop(1, '#4a1d0d');
    c.fillStyle = tg; c.fillRect(p0.x - bw, p0.y - bw * 2.2, p1.x - p0.x + bw * 2, bw * 2.2);
    c.fillStyle = '#2a0f07'; c.fillRect(p0.x - bw, p1.y, p1.x - p0.x + bw * 2, bw);
    c.strokeStyle = 'rgba(196,146,74,.55)'; c.lineWidth = Math.max(1, 1.6 * k);
    c.strokeRect(p0.x - bw * .55, p0.y - bw * 1.75, p1.x - p0.x + bw * 1.1, p1.y - p0.y + bw * 2.3);
    c.fillStyle = 'rgba(196,146,74,.5)';
    for (let i = 0; i < 9; i++) { const x = p0.x + (p1.x - p0.x) * (i + .5) / 9; c.beginPath(); c.arc(x, p0.y - bw * 1.1, 3.2 * k * 2, 0, 7); c.fill(); }
    c.strokeStyle = `rgba(255,178,96,${.4 * I})`; c.lineWidth = 3; c.strokeRect(p0.x + 1, p0.y + 1, p1.x - p0.x - 2, p1.y - p0.y - 2);
  };
  /* audience(ctx, a, o) — a row of blurred audience heads along the bottom of the frame (screen-fixed), opacity a.
     o.heads [[x, y, r]…] in a 1080×360 band (world units across the cloth width). */
  P.audience = function (ctx, a, o = {}) {
    if (a <= 0) return;
    if (!AUD) { AUD = canvas(WW, 360); const g = AUD.getContext('2d'); g.filter = 'blur(5px)'; g.fillStyle = '#040201';
      for (const [x, y, r] of (o.heads || [[120, 250, 74], [330, 210, 66], [560, 260, 80], [790, 205, 62], [985, 250, 76]])) { g.beginPath(); g.ellipse(x, y, r * .8, r, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, y + r * 1.9, r * 1.8, r * 1.2, 0, 0, 7); g.fill(); } }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.drawImage(AUD, BX, BY + (WH - 360) * S0, WW * S0, 360 * S0); ctx.globalAlpha = 1;
  };
  /* post(ctx, t, o) — warm vignette + light film grain (grain pattern steps at 30 fps). o.grain (.07). */
  P.post = function (ctx, t, o = {}) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(VIGN, 0, 0, W, H);
    const fr = Math.floor(t * 30), r = rng(fr * 7 + 3), ox = -r() * 60, oy = -r() * 60;
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain ?? .07; ctx.drawImage(GRAIN, ox, oy, W + 60, H + 60); ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };
  /* frame(ctx, t, M, lamp, o) — everything after T is built: screen (lamp × cloth × T, bloom) → stage → audience → post.
     lamp: lamp() options (lamp.I also drives the stage spill). o: { audience 0..1, bloom, grain }. Captions go after. */
  P.frame = function (ctx, t, M, lamp, o = {}) {
    P.screen(ctx, t, M, lamp, o);
    P.stage(ctx, M, lamp.I);
    P.audience(ctx, o.audience || 0);
    P.post(ctx, t, o);
  };

  // ------------------------------------------------------------------ camera
  /* cam() — the base camera: the cloth (world) fitted into the canvas. Returns a fresh DOMMatrix. */
  P.cam = () => new DOMMatrix([S0, 0, 0, S0, BX, BY]);
  /* zoom(m, s, ax, ay) — scale camera m by s about world point (ax, ay). s < 1 pulls back (reveals the stage), > 1 pushes. */
  P.zoom = (m, s, ax, ay) => m.translate(ax, ay).scale(s).translate(-ax, -ay);
  /* pullBack(t, t0, dur, to=.52) — zoom factor for the pull-back from the cloth into the dark room: 1 → to, ease-in-out. */
  P.pullBack = (t, t0, dur, to = .52) => lerp(1, to, eio(clamp((t - t0) / dur)));
  /* crash(t, t0, rise=.06, hold=.14, decay=6) — a crash zoom on a percussion hit: 0 → 1 in rise s, holds, decays.
     Use as P.zoom(m, 1 + .06 * P.crash(t, hit), x, y). Returns 0 before t0. */
  P.crash = (t, t0, rise = .06, hold = .14, decay = 6) => t >= t0 ? ss(t0, t0 + rise, t) * Math.exp(-Math.max(0, t - t0 - hold) * decay) : 0;
  /* step(t, fps=12) — quantise time for swapped effect pieces (fire, water, a twitch) that step at 12 fps. */
  P.step = (t, fps = 12) => Math.floor(t * fps) / fps;

  // ------------------------------------------------------------------ words
  /* captions(ctx, t, lines, o) — Story.captions in the style's type: Gowun Batang, cream on a deep warm shadow, upper third (y 400). */
  P.captions = (ctx, t, lines, o = {}) => Story.captions(ctx, t, lines, Object.assign({ font: P.FONT, color: P.TEXT.color, srcColor: P.TEXT.src, y: 400, shadow: P.TEXT.shadow }, o));
  /* endCard(ctx, t, card, at, o) — Story.endCard in the style's type, high on the frame (y 262) so the stage sits below it. */
  P.endCard = (ctx, t, card, at, o = {}) => Story.endCard(ctx, t, card, at, Object.assign({ y: 262, font: P.FONT, color: P.TEXT.color, srcColor: P.TEXT.cardSrc, ctaColor: P.TEXT.cta }, o));
  /* fade(ctx, t, dur) — fade in from black (.8 s) and out to black (.6 s). */
  P.fade = (ctx, t, dur) => Story.fadeBlack(ctx, t, dur, .8, .6);

  window.Puppet = P;
})();
