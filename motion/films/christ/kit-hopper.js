/* kit-hopper.js — house style B: Hopper-style quiet realism (Lemo-Opuscar no. 48, after Edward Hopper).
   A still one-point interior (or street) built as a real little 3D world in METRES and seen through a fixed camera, so
   every light shape is a true projection: flat matte planes with long dragged strokes, hard-edged light thrown by ONE
   unseen source (a point lamp or the sun/moon) through an opening, crisp cast silhouette shadows, canvas weave + vignette,
   a desaturated palette and ONE accent colour.

   World: x right, y up (floor y = 0), z away from the camera (camera at z = 0). Screen = Pilot.W × Pilot.H px.
   The core trick: paint the world twice, once UNLIT (ambient) and once LIT (same seeds → same strokes, other colours),
   then a light is just "clip to the projected light polygon and show the lit version"; a shadow inside the light is
   "clip to the projected silhouette and show the unlit version again". Everything is deterministic and seek-safe:
   seeded randomness only, all state a function of t, heavy canvases built once in init.

   Load after lib.js and story.js. Exposes window.Hopper. Needs no network and no images. */
(function () {
  const { clamp, lerp, ss, eo, rng, noise, fbm, canvas, hex, mix, rgb } = Pilot;
  const D2R = Math.PI / 180;
  const H$ = {};

  // ---------------- palette ----------------
  // NIGHT: the 문틈 room (dark warm-grey walls, cold lamp, warm "hope" lamp, moon). DAY: the no. 48 brief
  // (institutional greens, grey-green floor, cream, low warm sun). ACCENT: the one saturated colour of a film.
  H$.ACCENT = '#9c1a1a';
  H$.PAL = {
    night: { bg: '#0d0f0f', ceiling: '#1e2426', left: '#2a2f2c', right: '#36362e', back: ['#332f27', '#423b2f', '#4a4234'],
      trim: '#4f4b40', base: '#1c1d1a', lampCold: '#dfe3cf', lampWarm: '#f6cf92', moon: 'rgba(84,100,104,.34)' },
    day: { green: '#9EB8A0', greenDark: '#5E7C66', floor: '#7E8876', cream: '#ECE6D2', sun: '#FCE6AC', sky: '#E3E6CC' },
    text: '#efe6d3', src: '#cbbfa9', cta: '#e9cf9f', shadow: 'rgba(5,6,6,.9)',
  };
  H$.FONT = "'Noto Serif KR',serif";
  // pass to Pilot.run({ fonts }) so captions and end card never render in a fallback face
  H$.FONTS = ["600 60px 'Noto Serif KR'", "700 72px 'Noto Serif KR'", "400 28px 'Noto Sans KR'", "500 34px 'Noto Sans KR'", "600 30px 'Noto Sans KR'"];
  // lit(hex, sunHex, k=.6, gain=1.05) → '#rrggbb': the sunlit version of a matte colour (toward the light's colour, a bit brighter)
  H$.lit = (c, sun = H$.PAL.day.sun, k = .6, gain = 1.05) => '#' + mix(hex(c), hex(sun), k).map(v => Math.min(255, Math.round(v * gain)).toString(16).padStart(2, '0')).join('');
  // shade(hex, k=.62) → '#rrggbb': the same colour in ambient/shadow (darker, slightly cooler — never black)
  H$.shade = (c, k = .62) => '#' + hex(c).map((v, i) => Math.round(v * k * [.97, 1, 1.04][i])).map(v => Math.min(255, v).toString(16).padStart(2, '0')).join('');

  // ---------------- setup ----------------
  // init(o) — build the frame-sized post textures once (call from Pilot.run's init, before drawing):
  //   o.grainSeed (77)  seed of the canvas weave;  o.vignette { cx:.48, cy:.55, r0:.2, r1:.72, a:.55 } (fractions of W/H)
  //   → H$.tex = { grain, vign } (W × H canvases). Takes ~0.3 s at 1080×1920.
  H$.init = function (o = {}) {
    const W = Pilot.W, H = Pilot.H;
    H$.tex = { grain: H$.weave(W, H, o.grainSeed ?? 77), vign: H$.vignette(W, H, o.vignette) };
    return H$;
  };
  // weave(w, h, seed) → canvas: grey (128-centred) canvas weave + soft blotches + speckle, for an 'overlay' pass
  H$.weave = function (w, h, seed) {
    const c = canvas(w, h), x = c.getContext('2d'), d = x.createImageData(w, h), r = rng(seed);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const weave = (Math.sin(i * 2.1) + Math.sin(j * 2.1)) * 2.2 + (Math.sin(i * .7 + j * .05) * Math.sin(j * .7)) * 1.2;
      const blot = (noise(i * .012, j * .012) - .5) * 14 + (noise(i * .05 + 9, j * .05) - .5) * 6;
      const v = 128 + weave + blot + (r() - .5) * 10, k = (j * w + i) * 4;
      d.data[k] = d.data[k + 1] = d.data[k + 2] = v; d.data[k + 3] = 255;
    }
    x.putImageData(d, 0, 0); return c;
  };
  // vignette(w, h, o) → canvas: radial darkening, off-centre a little low (where Hopper's floors are)
  H$.vignette = function (w, h, o = {}) {
    const c = canvas(w, h), x = c.getContext('2d');
    const g = x.createRadialGradient(w * (o.cx ?? .48), h * (o.cy ?? .55), h * (o.r0 ?? .2), w * .5, h * (o.cy ?? .55), h * (o.r1 ?? .72));
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${o.a ?? .55})`);
    x.fillStyle = g; x.fillRect(0, 0, w, h); return c;
  };
  // layer(paint) → a new W × H canvas painted by paint(ctx) — for the unlit/lit/beyond versions you build in init
  H$.layer = function (paint) { const c = canvas(Pilot.W, Pilot.H); paint(c.getContext('2d')); return c; };

  // ---------------- camera (one-point, fixed, metres) ----------------
  // eye(ori) → camera settings for a low still eye at 1 m, 0.2 m right of centre: portrait f 1650 (horizon at y 997),
  //   landscape f 880. Pass to camera() with any overrides.
  H$.eye = (ori = Pilot.ori) => ori === 'v' ? { x: 0.2, y: 1.0, f: 1650, px: 540, py: 997 } : { x: 0.2, y: 1.0, f: 880, px: 960, py: 560 };
  // camera({ x, y, f, px, py, zn=.7 }) → cam:
  //   cam.P(x,y,z) → [sx, sy] screen px;  cam.ppm(z) → px per metre at depth z;  cam.clip(poly) → poly clipped to z ≥ zn;
  //   cam.path(ctx, poly, fresh=true) → adds the projected polygon to the path (fresh: beginPath first);
  //   cam.fill(ctx, poly, style) → fills it.  A poly is an array of [x,y,z] points (any convex or simple polygon).
  H$.camera = function (o = H$.eye()) {
    const cam = { x: o.x, y: o.y, f: o.f, px: o.px, py: o.py, zn: o.zn ?? 0.7 };
    cam.P = (x, y, z) => [cam.px + cam.f * (x - cam.x) / z, cam.py - cam.f * (y - cam.y) / z];
    cam.ppm = z => cam.f / z;
    cam.clip = function (poly) {
      const out = [], ZN = cam.zn;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length], ina = a[2] >= ZN, inb = b[2] >= ZN;
        if (ina) out.push(a);
        if (ina !== inb) { const k = (ZN - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, ZN]); }
      }
      return out;
    };
    cam.path = function (ctx, poly, fresh = true) {
      const q = cam.clip(poly); if (fresh) ctx.beginPath();
      q.forEach((p, i) => { const s = cam.P(p[0], p[1], p[2]); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); });
      if (q.length) ctx.closePath();
    };
    cam.fill = function (ctx, poly, style) { cam.path(ctx, poly); ctx.fillStyle = style; ctx.fill(); };
    return cam;
  };
  // quads in the three axis planes (vertex orders are fixed; used everywhere):
  //   Q.z(x0,x1,y0,y1,z) a face toward the camera;  Q.x(x,z0,z1,y0,y1) a side wall;  Q.y(y,x0,x1,z0,z1) floor/ceiling/top
  H$.Q = {
    z: (x0, x1, y0, y1, z) => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]],
    x: (x, z0, z1, y0, y1) => [[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]],
    y: (y, x0, x1, z0, z1) => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]],
  };
  // clipRect(poly2, x0, x1, y0, y1) → 2D polygon clipped to an axis-aligned rect (Sutherland–Hodgman); [] if outside
  H$.clipRect = function (poly, x0, x1, y0, y1) {
    const edges = [[p => p[0] >= x0, (a, b) => (x0 - a[0]) / (b[0] - a[0])], [p => p[0] <= x1, (a, b) => (x1 - a[0]) / (b[0] - a[0])],
                   [p => p[1] >= y0, (a, b) => (y0 - a[1]) / (b[1] - a[1])], [p => p[1] <= y1, (a, b) => (y1 - a[1]) / (b[1] - a[1])]];
    let out = poly;
    for (const [inside, kf] of edges) {
      const src = out; out = [];
      for (let i = 0; i < src.length; i++) {
        const a = src[i], b = src[(i + 1) % src.length], ia = inside(a), ib = inside(b);
        if (ia) out.push(a);
        if (ia !== ib) { const k = kf(a, b); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
      }
      if (!out.length) break;
    }
    return out;
  };
  // hull(pts, i=0, j=2) → convex hull of 3D points using coordinates i, j (default x,z: a floor shadow), same points back
  H$.hull = function (pts, i = 0, j = 2) {
    const p = pts.slice().sort((a, b) => a[i] - b[i] || a[j] - b[j]), cr = (o, a, b) => (a[i] - o[i]) * (b[j] - o[j]) - (a[j] - o[j]) * (b[i] - o[i]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let k = p.length - 1; k >= 0; k--) { const q = p[k]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };
  // hinge(x, z) → (thDeg, a, b, y) → [x,y,z]: a leaf hinged at (x, z) on a back-facing wall, swinging INTO the room;
  //   a = metres along the leaf from the hinge, b = metres out of its room face. Doors, shutters, casement windows.
  H$.hinge = (X0, ZB) => (th, a, b, y) => { const c = Math.cos(th * D2R), s = Math.sin(th * D2R); return [X0 + a * c - b * s, y, ZB - a * s - b * c]; };
  // bez(out, p0, p1, p2, p3, n=8) — appends n points of a cubic Bézier (not p0) to out; build silhouettes with it
  H$.bez = function (out, p0, p1, p2, p3, n = 8) { for (let i = 1; i <= n; i++) { const t = i / n, m = 1 - t;
    out.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]); } };

  // ---------------- lights ----------------
  // Planes for projection: { a: axis 0|1|2 (x|y|z), v: coordinate }. FLOOR = y 0. wallZ(z), wallX(x) make others.
  H$.FLOOR = { a: 1, v: 0 };
  H$.wallZ = z => ({ a: 2, v: z }); H$.wallX = x => ({ a: 0, v: x });
  // lamp({x,y,z}) → a point light (the unseen bulb):  L.onto(q, plane=FLOOR) → q projected from the lamp onto the plane;
  //   L.project(poly, plane) → every point;  L.through(rect, plane, depth) → the light pool a lamp BEHIND a back-facing
  //   wall throws through an opening rect {x0,x1,y0,y1,z} (y0 = 0: a doorway, its bottom edge starts at the wall's far face
  //   z + depth; y0 > 0: a window, all four corners projected);
  //   L.cast(sil, o) → shadow of a 2D silhouette sil=[[u,v]…] standing in the plane z = o.z (placed at x + u·k, v·k − sink),
  //   clipped to o.clip [x0,x1,y0,y1] (the part the light passes), projected onto o.plane; null if nothing is left.
  H$.lamp = function (p) {
    const L = { x: p.x, y: p.y, z: p.z, point: true };
    L.onto = function (q, pl = H$.FLOOR) {
      const a = pl.a, c = [L.x, L.y, L.z], s = (c[a] - pl.v) / (c[a] - q[a]);
      const o = [c[0] + s * (q[0] - c[0]), c[1] + s * (q[1] - c[1]), c[2] + s * (q[2] - c[2])]; o[a] = pl.v; return o;
    };
    L.project = (poly, pl) => poly.map(q => L.onto(q, pl));
    L.through = function (r, pl = H$.FLOOR, depth = 0) {
      const pr = (x, y) => L.onto([x, y, r.z], pl);
      if (r.y0 > 0 || !depth) return [pr(r.x0, r.y0), pr(r.x1, r.y0), pr(r.x1, r.y1), pr(r.x0, r.y1)];
      const DL = L.z - r.z, far = x => { const q = pr(x, 0); return [q[0] + (L.x - q[0]) * depth / DL, 0, r.z + depth]; };
      return [far(r.x0), far(r.x1), pr(r.x1, r.y1), pr(r.x0, r.y1)];
    };
    L.cast = (sil, o) => castSil(L, sil, o);
    return L;
  };
  // sun(dir) → a parallel light travelling along dir=[dx,dy,dz] (dy < 0: downward). Same API as lamp: onto, project,
  //   cast (cast also takes o.place(u,v) → [x,y,z] to stand the silhouette in any vertical plane, e.g. across the rays).
  //   Use it for low sun or moon through a window: L.project(Q.x(XL, z0, z1, y0, y1), FLOOR).
  H$.sun = function (d) {
    const L = { d, point: false };
    L.onto = function (q, pl = H$.FLOOR) { const a = pl.a, s = (pl.v - q[a]) / d[a];
      const o = [q[0] + d[0] * s, q[1] + d[1] * s, q[2] + d[2] * s]; o[a] = pl.v; return o; };
    L.project = (poly, pl) => poly.map(q => L.onto(q, pl));
    L.cast = (sil, o) => castSil(L, sil, o);
    return L;
  };
  function castSil(L, sil, o) {
    const k = o.k ?? 1, x = o.x ?? 0, sink = o.sink || 0;
    let q = sil.map(([u, v]) => [x + u * k, v * k - sink]);
    if (o.clip) q = H$.clipRect(q, o.clip[0], o.clip[1], o.clip[2], o.clip[3]);
    if (q.length < 3) return null;
    const pl = o.plane || H$.FLOOR, fy = o.floorY ?? 0;
    return q.map(([a, b]) => L.onto(o.place ? o.place(a, Math.max(fy, b)) : [a, Math.max(fy, b), o.z], pl));
  }
  // boxShadow(L, [x0,x1,y0,y1,z0,z1], plane=FLOOR) → the shadow polygon of an axis-aligned box (hull of its projected corners)
  H$.boxShadow = function (L, b, pl = H$.FLOOR) {
    const pts = []; for (const x of [b[0], b[1]]) for (const y of [b[2], b[3]]) for (const z of [b[4], b[5]]) pts.push(L.onto([x, y, z], pl));
    return pl.a === 1 ? H$.hull(pts, 0, 2) : pl.a === 2 ? H$.hull(pts, 0, 1) : H$.hull(pts, 2, 1);
  };

  // lampTint(ctx, tint, y0, fall=.3) — finish a LIT layer: darken toward the camera from screen row y0 down (the lamp
  //   falls off) and multiply the whole layer by the light's colour (cold bulb '#dfe3cf', warm '#f6cf92', sun '#FCE6AC')
  H$.lampTint = function (x, tint, y0, fall = .3) {
    const g = x.createLinearGradient(0, y0, 0, Pilot.H);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${fall})`);
    x.fillStyle = g; x.fillRect(0, 0, Pilot.W, Pilot.H);
    x.globalCompositeOperation = 'multiply'; x.fillStyle = tint; x.fillRect(0, 0, Pilot.W, Pilot.H);
    x.globalCompositeOperation = 'source-over';
  };

  // ---------------- clipping, revealing, shading ----------------
  // clip(ctx, cam, polys) — intersect the current clip with the union of 3D polys (no save: you save/restore)
  H$.clip = function (ctx, cam, polys) { ctx.beginPath(); for (const p of polys) cam.path(ctx, p, false); ctx.clip(); };
  // within(ctx, cam, polys, fn) — save, clip to the union of polys, fn(ctx), restore
  H$.within = function (ctx, cam, polys, fn) { ctx.save(); H$.clip(ctx, cam, polys); fn(ctx); ctx.restore(); };
  // drawLit(ctx, I, layer, warm?, wk=0) — draw a pre-painted lit layer at intensity min(1, I), and its warm version
  //   over it at weight wk (a light that turns warm). Use inside a clip (the light polygon).
  H$.drawLit = function (ctx, I, layer, warm, wk = 0) {
    ctx.globalAlpha = Math.min(1, I); ctx.drawImage(layer, 0, 0);
    if (warm && wk > 0) { ctx.globalAlpha = Math.min(1, I) * wk; ctx.drawImage(warm, 0, 0); }
    ctx.globalAlpha = 1;
  };
  // dim(ctx, amb) — the ambient level: darkens everything drawn so far by (1 − amb) (amb 1 = as painted, 0 = black)
  H$.dim = function (ctx, amb) { if (amb < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - amb})`; ctx.fillRect(-50, -50, Pilot.W + 100, Pilot.H + 100); } };
  // shadowIn(ctx, cam, polys, paint) — a cast shadow inside a light: clip to the shadow polys and repaint the unlit
  //   world there with paint(ctx) (usually: drawImage(unlit), dim(amb)). Hard edges, no blur: that is the style.
  H$.shadowIn = function (ctx, cam, polys, paint) { if (!polys.length) return; ctx.save(); H$.clip(ctx, cam, polys); paint(ctx); ctx.restore(); };
  // lightShapes(ctx, cam, polys, style, clipPoly?, mode='screen') — fill light shapes (e.g. moon window panes on a wall)
  //   additively, optionally clipped to the surface they land on
  H$.lightShapes = function (ctx, cam, polys, style, clipPoly, mode = 'screen') {
    ctx.save(); if (clipPoly) { cam.path(ctx, clipPoly); ctx.clip(); }
    ctx.globalCompositeOperation = mode;
    for (const p of polys) cam.fill(ctx, p, style);
    ctx.restore(); ctx.globalCompositeOperation = 'source-over';
  };
  // glow(ctx, [sx,sy], r, 'r,g,b', a, mode='screen') — a radial light bloom (bounce off a lit floor, a lamp halo, a flash)
  H$.glow = function (ctx, o, r, c, a, mode = 'screen') {
    const g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], r);
    g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.globalCompositeOperation = mode; ctx.fillStyle = g; ctx.fillRect(0, 0, Pilot.W, Pilot.H); ctx.globalCompositeOperation = 'source-over';
  };
  // wash(ctx, 'r,g,b', a, mode='screen') — a flat full-frame light wash (inside a clip: brightens just that patch)
  H$.wash = function (ctx, c, a, mode = 'screen') { ctx.globalCompositeOperation = mode; ctx.fillStyle = `rgba(${c},${a})`; ctx.fillRect(0, 0, Pilot.W, Pilot.H); ctx.globalCompositeOperation = 'source-over'; };
  // glowLine(ctx, a, b, stroke, glowColor, blur=22, width=2.2) — a hair of light (a crack, a thread at a door's edge)
  H$.glowLine = function (ctx, a, b, stroke, glowC, blur = 22, w = 2.2) {
    ctx.save(); ctx.strokeStyle = stroke; ctx.shadowColor = glowC; ctx.shadowBlur = blur; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
  };
  // softShadow(ctx, cam, poly, blurPx=6, a=.35) — a soft contact shadow behind trim/furniture on a wall (ctx.filter blur)
  H$.softShadow = function (ctx, cam, poly, blur = 6, a = .35) { ctx.save(); ctx.filter = `blur(${blur}px)`; cam.fill(ctx, poly, `rgba(0,0,0,${a})`); ctx.restore(); };

  // ---------------- paint (matte oil) ----------------
  // strokes(ctx, cam, n, seed, fn, o) — n long dragged brush strokes across a plane; fn(u,v) → [x,y,z] maps the unit
  //   square onto the plane, strokes run along v. o = { len:[min,max] (in v), slant (u drift), w (metres), a (alpha),
  //   hi:'r,g,b' light strokes (255,248,230), lo:'r,g,b' dark strokes (0,0,0) }. Half light, half dark, 5–10 % off base.
  H$.strokes = function (ctx, cam, n, seed, fn, o) {
    const r = rng(seed), hi = o.hi || '255,248,230', lo = o.lo || '0,0,0';
    for (let i = 0; i < n; i++) {
      const u = r(), v = r(), len = o.len[0] + r() * (o.len[1] - o.len[0]), du = (r() - .5) * o.slant;
      const a = fn(u, v), b = fn(clamp(u + du), clamp(v + len)), zc = (a[2] + b[2]) / 2;
      const pa = cam.P(...a), pb = cam.P(...b);
      ctx.strokeStyle = r() < .5 ? `rgba(${hi},${o.a * (.4 + .6 * r())})` : `rgba(${lo},${o.a * 1.3 * (.4 + .6 * r())})`;
      ctx.lineWidth = Math.max(1, o.w * cam.f / zc * (.6 + .8 * r())); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]);
      const pm = cam.P(...fn(clamp(u + du * .5 + (r() - .5) * .004), clamp(v + len * .5)));
      ctx.quadraticCurveTo(pm[0], pm[1], pb[0], pb[1]); ctx.stroke();
    }
  };
  // plane(ctx, cam, poly, style, st?) — a flat matte plane; st = { n, seed, fn, len, slant, w, a } adds strokes clipped to it
  H$.plane = function (ctx, cam, poly, style, st) {
    cam.fill(ctx, poly, style);
    if (st) { ctx.save(); cam.path(ctx, poly); ctx.clip(); H$.strokes(ctx, cam, st.n, st.seed, st.fn, st); ctx.restore(); }
  };
  // box(ctx, cam, [x0,x1,y0,y1,z0,z1], c, st?) — an axis-aligned block (table, bed, cabinet, building): paints only the
  //   faces the camera sees; c = { front, top, bottom, left, right } colours (missing faces fall back to front);
  //   st (strokes options without fn) brushes the front face
  H$.box = function (ctx, cam, b, c, st) {
    const [x0, x1, y0, y1, z0, z1] = b, Q = H$.Q;
    if (cam.y > y1) cam.fill(ctx, Q.y(y1, x0, x1, z0, z1), c.top || c.front);
    if (cam.y < y0) cam.fill(ctx, Q.y(y0, x0, x1, z0, z1), c.bottom || c.front);
    if (cam.x < x0) cam.fill(ctx, Q.x(x0, z0, z1, y0, y1), c.left || c.front);
    if (cam.x > x1) cam.fill(ctx, Q.x(x1, z0, z1, y0, y1), c.right || c.front);
    H$.plane(ctx, cam, Q.z(x0, x1, y0, y1, z0), c.front, st && { ...st, fn: (u, v) => [lerp(x0, x1, u), lerp(y0, y1, v), z0] });
  };
  // bevelPanel(ctx, cam, map, [a0,a1,y0,y1], e, c) — a sunk panel (door, cabinet, wainscot) on a surface map(a, y) → [x,y,z]:
  //   bevel width e (m); c = { top, bottom, left, right, field } colours. Light from below: top bevel dark, bottom lit.
  H$.bevelPanel = function (ctx, cam, M, r, e, c) {
    const [a0, a1, y0, y1] = r;
    cam.fill(ctx, [M(a0, y1), M(a1, y1), M(a1 - e, y1 - e), M(a0 + e, y1 - e)], c.top);
    cam.fill(ctx, [M(a0, y0), M(a1, y0), M(a1 - e, y0 + e), M(a0 + e, y0 + e)], c.bottom);
    cam.fill(ctx, [M(a0, y0), M(a0 + e, y0 + e), M(a0 + e, y1 - e), M(a0, y1)], c.left);
    cam.fill(ctx, [M(a1, y0), M(a1 - e, y0 + e), M(a1 - e, y1 - e), M(a1, y1)], c.right);
    cam.fill(ctx, [M(a0 + e, y0 + e), M(a1 - e, y0 + e), M(a1 - e, y1 - e), M(a0 + e, y1 - e)], c.field);
  };
  // FLOOR looks for boards(): plank colours a→b, joint and seam colours, stroke alpha
  H$.BOARDS = {
    night: { a: [44, 34, 27], b: [34, 26, 21], joint: 'rgba(10,7,5,.5)', seam: 'rgba(12,9,7,.7)', sa: .05 },
    nightLit: { a: [180, 166, 136], b: [150, 136, 108], joint: 'rgba(70,58,42,.45)', seam: 'rgba(80,66,48,.55)', sa: .07 },
  };
  // boardsLook(hex, k=1) → a boards look from one floor colour (k < 1 shade, k > 1 sunlit) — for day rooms
  H$.boardsLook = function (c, k = 1) {
    const m = hex(c).map(v => Math.min(255, v * k));
    return { a: m.map(v => Math.min(255, v * 1.08)), b: m.map(v => v * .9), joint: rgb(m.map(v => v * .45), .45), seam: rgb(m.map(v => v * .42), .6), sa: .06 };
  };

  // ---------------- the room ----------------
  // room({ xl, xr, h, zn, zb }, cam) → R: an open box seen from inside (side walls at x = xl/xr, ceiling h, back wall zb).
  //   R.poly.{floor, ceiling, left, right, back} 3D quads;  R.wall(name) → map(u, v, w) → [x,y,z] for 'back' (u = x),
  //   'left'/'right' (u = z); v = height, w = metres out of the wall into the room (negative = into the wall).
  //   R.paint(ctx, look) the shell;  R.boards(ctx, look, o) the floor;  R.baseboards(ctx, o).
  H$.room = function (d, cam) {
    const { xl: XL, xr: XR, h: HC, zn: ZN, zb: ZB } = d, Q = H$.Q;
    const R = { ...d, cam };
    R.poly = {
      ceiling: [[XL, HC, ZN], [XR, HC, ZN], [XR, HC, ZB], [XL, HC, ZB]],
      left: [[XL, 0, ZN], [XL, 0, ZB], [XL, HC, ZB], [XL, HC, ZN]],
      right: [[XR, 0, ZN], [XR, 0, ZB], [XR, HC, ZB], [XR, HC, ZN]],
      back: [[XL, 0, ZB], [XR, 0, ZB], [XR, HC, ZB], [XL, HC, ZB]],
      floor: [[XL, 0, ZN], [XR, 0, ZN], [XR, 0, ZB], [XL, 0, ZB]],
    };
    R.wall = name => name === 'back' ? (u, v, w = 0) => [u, v, ZB - w] : name === 'left' ? (u, v, w = 0) => [XL + w, v, u] : (u, v, w = 0) => [XR - w, v, u];
    // paint(ctx, look) — background, ceiling, side walls, back wall (vertical gradient), dragged strokes on the three
    //   walls, a soft shade under the ceiling line. look = { bg, ceiling, left, right, back: [top, mid, bottom] | colour,
    //   st: { back, left, right } stroke options ({ n, seed, len, slant, w, a } or null), sideFrom (z where side strokes
    //   start, zb − 2), corner: { px:140, a:.35 } }. Defaults = the night room of 문틈. Use the same look twice with lit
    //   colours for a lit version: identical seeds give identical strokes.
    R.paint = function (x, look = {}) {
      const L = { ...H$.LOOK.night, ...look }, st = { ...H$.LOOK.night.st, ...(look.st || {}) }, W = Pilot.W, P = cam.P;
      x.fillStyle = L.bg; x.fillRect(0, 0, W, Pilot.H);
      cam.fill(x, R.poly.ceiling, L.ceiling);
      cam.fill(x, R.poly.left, L.left);
      cam.fill(x, R.poly.right, L.right);
      let bk = L.back;
      if (Array.isArray(bk)) { const top = P(0, HC, ZB)[1], bot = P(0, 0, ZB)[1], g = x.createLinearGradient(0, top, 0, bot);
        g.addColorStop(0, bk[0]); g.addColorStop(.45, bk[1]); g.addColorStop(1, bk[2]); bk = g; }
      cam.fill(x, R.poly.back, bk);
      const z0 = L.sideFrom ?? ZB - 2;
      const pass = (poly, s, fn) => { if (!s) return; x.save(); cam.path(x, poly); x.clip(); H$.strokes(x, cam, s.n, s.seed, fn, s); x.restore(); };
      pass(R.poly.back, st.back, (u, v) => [lerp(XL, XR, u), lerp(0, HC, v), ZB]);
      pass(R.poly.left, st.left, (u, v) => [XL, lerp(0, HC, v), lerp(z0, ZB, u)]);
      pass(R.poly.right, st.right, (u, v) => [XR, lerp(0, HC, v), lerp(z0, ZB, u)]);
      const co = L.corner;
      if (co) { x.save(); cam.path(x, R.poly.back); x.clip();
        const ct = P(0, HC, ZB)[1], cg = x.createLinearGradient(0, ct, 0, ct + co.px); cg.addColorStop(0, `rgba(0,0,0,${co.a})`); cg.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = cg; x.fillRect(0, ct, W, co.px); x.restore(); }
    };
    // boards(ctx, look=BOARDS.night, o) — a plank floor running away from the camera: planks bw (o.width .135 m) wide with
    //   seeded tone, cross joints, seams, then 520 dragged strokes clipped to o.clip (default the floor quad).
    //   o = { seed 21, z1 (planks run to here, default zb; run them under a threshold), clip: 3D poly }
    R.boards = function (ctx, look = H$.BOARDS.night, o = {}) {
      const seed = o.seed ?? 21, r = rng(seed), bw = o.width ?? .135, Z1 = o.z1 ?? ZB;
      for (let x = XL; x < XR; x += bw) {
        const tone = (r() - .5) * .12, c = mix(look.a, look.b, .5 + tone * 3);
        cam.fill(ctx, [[x, 0, ZN], [x + bw, 0, ZN], [x + bw, 0, Z1], [x, 0, Z1]], rgb(c));
        let z = ZN + r() * 1.5;
        while (z < ZB) { const zz = z; cam.fill(ctx, [[x, 0, zz], [x + bw, 0, zz], [x + bw, 0, zz + .012], [x, 0, zz + .012]], look.joint); z += .9 + r() * 1.8; }
        cam.fill(ctx, [[x - .004, 0, ZN], [x + .004, 0, ZN], [x + .004, 0, Z1], [x - .004, 0, Z1]], look.seam);
      }
      ctx.save(); cam.path(ctx, o.clip || R.poly.floor); ctx.clip();
      H$.strokes(ctx, cam, o.n ?? 520, seed + 1, (u, v) => [lerp(XL, XR, u), 0, lerp(ZN + .6, ZB, v)], { len: [.06, .2], slant: .01, w: .022, a: look.sa });
      ctx.restore();
    };
    // baseboards(ctx, o) — skirting on back and side walls: o = { h .15, gaps: [[x0,x1]…] on the back wall (doors),
    //   back, left, right colours, line: [colour per back segment] (the lit top edge) }
    R.baseboards = function (ctx, o = {}) {
      const bb = o.h ?? .15, segs = [], gaps = (o.gaps || []).slice().sort((a, b) => a[0] - b[0]);
      let x = XL; for (const [a, b] of gaps) { segs.push([x, a]); x = b; } segs.push([x, XR]);
      for (const [a, b] of segs) cam.fill(ctx, [[a, 0, ZB - .01], [b, 0, ZB - .01], [b, bb, ZB - .01], [a, bb, ZB - .01]], o.back || '#1c1d1a');
      cam.fill(ctx, [[XL + .01, 0, ZN], [XL + .01, 0, ZB], [XL + .01, bb, ZB], [XL + .01, bb, ZN]], o.left || '#161715');
      cam.fill(ctx, [[XR - .01, 0, ZN], [XR - .01, 0, ZB], [XR - .01, bb, ZB], [XR - .01, bb, ZN]], o.right || '#1a1a17');
      segs.forEach(([a, b], i) => cam.fill(ctx, [[a, bb, ZB - .011], [b, bb, ZB - .011], [b, bb + .012, ZB - .011], [a, bb + .012, ZB - .011]],
        (o.line && o.line[i]) || 'rgba(120,112,92,.32)'));
    };
    return R;
  };
  H$.LOOK = {
    night: { bg: '#0d0f0f', ceiling: '#1e2426', left: '#2a2f2c', right: '#36362e', back: ['#332f27', '#423b2f', '#4a4234'],
      st: { back: { n: 260, seed: 11, len: [.12, .35], slant: .12, w: .035, a: .028 }, left: { n: 120, seed: 12, len: [.12, .3], slant: .12, w: .04, a: .025 },
            right: { n: 120, seed: 13, len: [.12, .3], slant: .12, w: .04, a: .025 } },
      corner: { px: 140, a: .35 } },
  };
  // dayLook(k=1, sun?) → a room look in the no. 48 day palette (pale institutional green walls, cream ceiling) at light
  //   level k (shade ≈ .62, as painted 1); pass sun to get the sunlit version (H$.lit of each colour)
  H$.dayLook = function (k = 1, sun) {
    const D = H$.PAL.day, f = c => sun ? H$.lit(c, sun) : k === 1 ? c : H$.shade(c, k);
    return { bg: f('#202622'), ceiling: f(D.cream), left: f(D.greenDark), right: f(D.green), back: [f('#93AD95'), f(D.green), f('#A6BEA7')],
      st: { back: { n: 260, seed: 11, len: [.12, .35], slant: .12, w: .035, a: .05 }, left: { n: 120, seed: 12, len: [.12, .3], slant: .12, w: .04, a: .045 },
            right: { n: 120, seed: 13, len: [.12, .3], slant: .12, w: .04, a: .045 } }, corner: { px: 140, a: .16 } };
  };

  // opening(ctx, cam, map, o) — a hole in a wall (door or window) with its reveals and painted casing.
  //   map = R.wall(name); o = { u0,u1,v0,v1 (metres in the wall), depth (wall thickness .14), hole (colour of the hole —
  //   paint what is beyond inside opening.poly afterwards), reveal, head, sill (colours of the inner faces),
  //   casing: { w .1, head .12, c colour, shadow (soft shadow alpha .35), st strokes } | null, ledge: { d, h, c } window sill }
  //   → { poly: the inner opening (far face) for clipping what is beyond, outer: the opening in the room face }
  H$.opening = function (ctx, cam, M, o) {
    const { u0, u1, v0, v1 } = o, T = o.depth ?? .14, camP = [cam.x, cam.y, 0];
    const outer = [M(u0, v0), M(u1, v0), M(u1, v1), M(u0, v1)], inner = [M(u0, v0, -T), M(u1, v0, -T), M(u1, v1, -T), M(u0, v1, -T)];
    if (o.hole) cam.fill(ctx, outer, o.hole);
    const face = (poly, pa, pb, col) => {   // a reveal face is drawn only if it faces the camera
      const n = [pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]], c = poly[0], dv = [camP[0] - c[0], camP[1] - c[1], camP[2] - c[2]];
      if (n[0] * dv[0] + n[1] * dv[1] + n[2] * dv[2] > 0) cam.fill(ctx, poly, col);
    };
    face([M(u0, v0), M(u0, v0, -T), M(u0, v1, -T), M(u0, v1)], M(u0, v0), M(u0 + 1, v0), o.reveal || '#34312a');
    face([M(u1, v0), M(u1, v0, -T), M(u1, v1, -T), M(u1, v1)], M(u1, v0), M(u1 - 1, v0), o.reveal || '#34312a');
    face([M(u0, v1), M(u1, v1), M(u1, v1, -T), M(u0, v1, -T)], M(u0, v1), M(u0, v1 - 1), o.head || '#24221d');
    face([M(u0, v0), M(u1, v0), M(u1, v0, -T), M(u0, v0, -T)], M(u0, v0), M(u0, v0 + 1), o.sill || '#3a3127');
    const cs = o.casing;
    if (cs) {
      const w = cs.w ?? .1, hd = cs.head ?? .12, z = .02, b0 = v0 > 0 ? v0 - w : v0;
      if (cs.shadow !== 0) H$.softShadow(ctx, cam, [M(u0 - w - .02, b0, 0), M(u1 + w + .03, b0, 0), M(u1 + w + .03, v1 + hd + .03, 0), M(u0 - w - .02, v1 + hd + .03, 0)], 6, cs.shadow ?? .35);
      const parts = [[M(u0 - w, b0, z), M(u0, b0, z), M(u0, v1, z), M(u0 - w, v1, z)], [M(u1, b0, z), M(u1 + w, b0, z), M(u1 + w, v1, z), M(u1, v1, z)],
        [M(u0 - w - .015, v1, z), M(u1 + w + .015, v1, z), M(u1 + w + .015, v1 + hd, z), M(u0 - w - .015, v1 + hd, z)]];
      if (v0 > 0) parts.push([M(u0 - w, b0, z), M(u1 + w, b0, z), M(u1 + w, v0, z), M(u0 - w, v0, z)]);
      for (const q of parts) cam.fill(ctx, q, cs.c || '#4f4b40');
      if (cs.st) { ctx.save(); for (const q of parts) cam.path(ctx, q, false); ctx.clip();
        H$.strokes(ctx, cam, cs.st.n ?? 90, cs.st.seed ?? 31, (u, v) => M(lerp(u0 - w, u1 + w, u), lerp(b0, v1 + hd, v), z), cs.st); ctx.restore(); }
    }
    const lg = o.ledge;
    if (lg && v0 > 0) { const d = lg.d ?? .06, h = lg.h ?? .035;
      cam.fill(ctx, [M(u0 - .14, v0 - h, d), M(u1 + .14, v0 - h, d), M(u1 + .14, v0, d), M(u0 - .14, v0, d)], lg.c || '#5a5548');
      if (cam.y > v0) cam.fill(ctx, [M(u0 - .14, v0, 0), M(u1 + .14, v0, 0), M(u1 + .14, v0, d), M(u0 - .14, v0, d)], lg.top || lg.c || '#6a6556'); }
    return { poly: inner, outer };
  };
  // mullions(ctx, cam, map, [u0,u1,v0,v1], rows, cols, bar (m), colour, w=-.07) — window bars across an opening at depth w
  H$.mullions = function (ctx, cam, M, r, rows, cols, bar, col, w = -.07) {
    const [u0, u1, v0, v1] = r;
    for (let i = 1; i < cols; i++) { const u = lerp(u0, u1, i / cols); cam.fill(ctx, [M(u - bar / 2, v0, w), M(u + bar / 2, v0, w), M(u + bar / 2, v1, w), M(u - bar / 2, v1, w)], col); }
    for (let j = 1; j < rows; j++) { const v = lerp(v0, v1, j / rows); cam.fill(ctx, [M(u0, v - bar / 2, w), M(u1, v - bar / 2, w), M(u1, v + bar / 2, w), M(u0, v + bar / 2, w)], col); }
  };
  // panes(map, [u0,u1,v0,v1], rows, cols, bar) → the glass cells of a window as 3D quads (project them with a light to get
  //   window-shaped light on a floor or wall: L.project(cell, FLOOR))
  H$.panes = function (M, r, rows, cols, bar) {
    const [u0, u1, v0, v1] = r, out = [], du = (u1 - u0 - bar * (cols - 1)) / cols, dv = (v1 - v0 - bar * (rows - 1)) / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const a = u0 + i * (du + bar), b = v0 + j * (dv + bar); out.push([M(a, b), M(a + du, b), M(a + du, b + dv), M(a, b + dv)]);
    }
    return out;
  };

  // ---------------- the accent: a loaded dry brush ----------------
  // brush(seed, n=26) → bristles for brushStroke (build once in init, one per stroke)
  H$.brush = function (seed, n = 26) {
    const r = rng(seed);
    return { n, br: Array.from({ length: n }, (_, i) => ({ off: (i / (n - 1) - .5) * (.86 + .2 * r()), reach: .72 + .28 * Math.pow(r(), .5), start: r() * .06,
      shade: r(), w: .7 + .9 * r(), wob: r() * 10 })), edge: Array.from({ length: 40 }, () => r()) };
  };
  // brushStroke(ctx, cam, s, br, p, lb=1, color=ACCENT) — one painted stroke on a surface, drawn on to progress p (0–1):
  //   s = { a:[x,y,z], b:[x,y,z], w (width m), seed }; heavy dab at the start, uneven body, ragged dry tail, bristle
  //   streaks; lb = light level on it (0 black … 1 as mixed). The accent's dark/hi shades are derived from color.
  H$.brushStroke = function (ctx, cam, s, br, p, lb = 1, color = H$.ACCENT) {
    if (p <= 0) return;
    const A = cam.P(...s.a), Bp = cam.P(...s.b), dx = Bp[0] - A[0], dy = Bp[1] - A[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const wpx = s.w * cam.f / s.a[2], sd = s.seed;
    const red = hex(color), [dark, hi] = color === '#9c1a1a' ? [[66, 9, 10], [168, 40, 36]] : [red.map(v => v * .42), red.map(v => Math.min(255, v * 1.08 + 12))];
    const col = (k, a) => rgb(mix([12, 8, 8], mix(dark, k > 0 ? hi : red, Math.abs(k)), lb), a);
    const bow = k => Math.sin(k * Math.PI) * wpx * .25 * (sd % 2 ? 1 : -1) + (fbm(k * 3, sd) - .5) * wpx * .3;
    const hw = (k, side) => .5 * wpx * (1 + .45 * Math.exp(-k * 9)) * (1 - .55 * ss(.7, 1, k)) * (.72 + .5 * fbm(k * 7 + side * 5, sd + side));
    const pt = (k, o) => [A[0] + dx * k + nx * (o + bow(k)), A[1] + dy * k + ny * (o + bow(k))];
    const N = 36, pts = [];
    for (let i = 0; i <= N; i++) { const k = i / N * p * .93; pts.push(pt(k, hw(k, 0))); }
    for (let i = N; i >= 0; i--) { const k = i / N * p * .93; pts.push(pt(k, -hw(k, 1))); }
    ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
    ctx.fillStyle = col(0, .88); ctx.fill();
    ctx.lineCap = 'round';
    for (const b of br.br) {
      const end = Math.min(p, b.reach); if (end <= b.start) continue;
      const o = b.off * wpx * 1.05, w = b.w * wpx / br.n * 1.7;
      ctx.strokeStyle = col(b.shade < .25 ? -1 : b.shade > .8 ? .5 : .12, b.shade < .25 ? .55 : .5);
      ctx.lineWidth = w; ctx.beginPath(); let pen = false;
      for (let j = 0; j <= 24; j++) {
        const k = lerp(b.start, end, j / 24), gap = k > .55 && noise(k * 22 + b.wob * 3, b.wob) < .25 + .5 * ss(.55, 1, k);
        const q = pt(k, o * (1 - .3 * ss(.7, 1, k)) + Math.sin(k * 9 + b.wob) * wpx * .02);
        if (gap) { pen = false; continue; }
        pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true;
      }
      ctx.stroke();
    }
  };

  // ---------------- a figure from soft value shapes ----------------
  // figureParts(o) → { parts: [{ poly:[[u,v]…], c:'body'|'skin'|'hair'|'legs' }], sil: one outline for L.cast, h }:
  //   a person standing still, front-on, in metres (feet at v 0, centred u 0), real proportions, no outline.
  //   o = { h 1.7 (height), w .19 (shoulder half-width), skirt true (dress to the knee; false: coat and trousers) }
  H$.figureParts = function (o = {}) {
    const h = o.h ?? 1.7, s = h / 1.7, sw = o.w ?? .19, sk = o.skirt ?? true;
    const S = ([u, v]) => [u * s, v * s];
    // left side of the garment, hem → hip → waist → chest → shoulder → neck; the right side is its mirror
    const left = sk ? [[-.05, .47], [-.17, .47]] : [[-.03, .02], [-.11, .02]], b = (p1, p2, p3) => H$.bez(left, left[left.length - 1], p1, p2, p3, 5);
    if (sk) b([-.165, .62], [-.15, .8], [-.145, .9]); else b([-.12, .4], [-.135, .7], [-.14, .9]);
    b([-.14, .96], [-.118, .99], [-.12, 1.04]); b([-.13, 1.14], [-.155, 1.25], [-.16, 1.33]);
    b([-sw + .01, 1.39], [-sw + .03, 1.43], [-.11, 1.44]); b([-.08, 1.45], [-.05, 1.455], [-.04, 1.47]);
    const right = left.map(([u, v]) => [-u, v]).reverse(), body = left.concat(right);
    const leg = side => [[side * .1, .02], [side * .045, .02], [side * .05, .3], [side * .045, .5], [side * .1, .5], [side * .105, .3]];
    const shoe = side => [[side * .11, 0], [side * .035, 0], [side * .04, .035], [side * .105, .035]];
    const arc = (a0, a1, n, r, ry, cy, cx = 0) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.sin(a) * r, cy + Math.cos(a) * ry]; });
    const head = arc(0, Math.PI * 2 * 23 / 24, 23, .078, .105, 1.58);
    const neck = [[-.032, 1.43], [.032, 1.43], [.028, 1.52], [-.028, 1.52]];
    // hair: a cap over the crown and the back of the head, parted, down to the jaw at the sides (the face shows)
    const hair = arc(-Math.PI * .62, Math.PI * .62, 14, .088, .118, 1.59).concat([[.07, 1.53], [.06, 1.6], [.02, 1.655], [-.03, 1.645], [-.065, 1.6], [-.075, 1.53]]);
    const arm = side => [[side * (sw - .015), 1.4], [side * (sw + .025), 1.25], [side * (sw + .03), 1.02], [side * (sw + .01), .8],
      [side * (sw - .035), .8], [side * (sw - .025), 1.0], [side * (sw - .035), 1.22], [side * (sw - .06), 1.36]];
    const hand = side => arc(0, Math.PI * 2 * 11 / 12, 11, .028, .045, .76, side * (sw - .01));
    const parts = [{ poly: leg(-1), c: 'legs' }, { poly: leg(1), c: 'legs' }, { poly: shoe(-1), c: 'hair' }, { poly: shoe(1), c: 'hair' },
      { poly: hand(-1), c: 'skin' }, { poly: hand(1), c: 'skin' }, { poly: neck, c: 'skin' }, { poly: arm(-1), c: 'body' }, { poly: arm(1), c: 'body' },
      { poly: body, c: 'body' }, { poly: head, c: 'skin' }, { poly: hair, c: 'hair' }].map(p => ({ ...p, poly: p.poly.map(S) }));
    // one closed outline for cast shadows: feet → leg → garment (arms folded into it) → over the head → down the other side
    const L2 = left.slice(sk ? 1 : 0), R2 = right.slice(0, sk ? -1 : undefined);
    const sil = [[-.11, 0], ...(sk ? [[-.1, .47]] : []), ...L2.map(([u, v]) => [u - (v > .8 && v < 1.38 ? .04 : 0), v]),
      ...arc(-Math.PI * .6, Math.PI * .6, 12, .085, .115, 1.585), ...R2.map(([u, v]) => [u + (v > .8 && v < 1.38 ? .04 : 0), v]), ...(sk ? [[.1, .47]] : []), [.11, 0]].map(S);
    return { parts, sil, h };
  };
  const FIGC = new Map();
  // figure(ctx, cam, F, o) — paint F = figureParts() standing at floor point (o.x, o.z), facing the camera, as 3–4 soft
  //   value shapes: the shade mass; the side toward the light (o.side −1 = light from the left, +1 right) lit at o.lit
  //   (0–1), fading across the body (not a seam); its hottest edge; a darker band toward the feet; then softened
  //   (o.soft px blur, 1.6). o.colors { body, legs, skin, hair } are the SHADE colours; o.litColors (same keys, optional)
  //   the sunlit ones — give the accent garment its saturated colour only here so it blooms in the light; missing ones
  //   default to the shade colour pushed toward o.sun and brightened. The three layers are cached per look and depth,
  //   (blur included), so a frame only composites them (< 1 ms); keep o.z fixed or quantised if the figure walks.
  H$.figure = function (ctx, cam, F, o) {
    const z = o.z, k = cam.ppm(z), foot = cam.P(o.x, 0, z), pad = 20, hw = .45 * k, hh = (F.h * 1.12) * k;
    const w = Math.ceil(hw * 2 + pad * 2), h = Math.ceil(hh + pad * 2), ox = pad + hw, oy = pad + hh;
    const side = o.side ?? -1, lit = clamp(o.lit ?? 0), soft = o.soft ?? 1.6;
    const key = [k.toFixed(2), side, soft, o.sun, JSON.stringify(o.colors), JSON.stringify(o.litColors)].join('|');
    let L = FIGC.get(key) && FIGC.get(key).F === F ? FIGC.get(key) : null;
    if (!L) {
      if (FIGC.size > 12) FIGC.clear();
      const C = { body: '#3c4a40', legs: '#2a2e2a', skin: '#9c8470', hair: '#2b241f', ...(o.colors || {}) }, LC = o.litColors || {};
      const sun = hex(o.sun || H$.PAL.day.sun), litC = c => LC[c] ? hex(LC[c]) : mix(hex(C[c]), sun, .35).map(v => Math.min(255, v * 1.45));
      const layer = (f, mask) => { const cv = canvas(w, h), x = cv.getContext('2d');
        for (const p of F.parts) { x.beginPath(); p.poly.forEach(([u, v], i) => { const X = ox + u * k, Y = oy - v * k; i ? x.lineTo(X, Y) : x.moveTo(X, Y); });
          x.closePath(); x.fillStyle = f(p.c); x.fill(); }
        x.globalCompositeOperation = mask ? 'destination-in' : 'source-atop';
        const g = mask ? x.createLinearGradient(ox + side * mask[0] * k, 0, ox + side * mask[1] * k, 0) : x.createLinearGradient(0, oy - .6 * k, 0, oy);
        if (mask) { g.addColorStop(0, `rgba(0,0,0,${mask[2]})`); g.addColorStop(1, 'rgba(0,0,0,0)'); }   // the lit side fades across the body
        else { g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.3)'); }               // darker toward the feet
        x.fillStyle = g; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'source-over';
        if (!(soft > 0)) return cv;                                                         // soften once, here
        const cb = canvas(w, h), xb = cb.getContext('2d'); xb.filter = `blur(${soft}px)`; xb.drawImage(cv, 0, 0); return cb; };
      L = { F, shade: layer(c => C[c]), lit: layer(c => rgb(litC(c)), [.06, -.04, 1]),
        hot: layer(c => rgb(mix(litC(c), sun, .3).map(v => Math.min(255, v * 1.12))), [.14, .07, .6]) };
      FIGC.set(key, L);
    }
    const X = foot[0] - ox, Y = foot[1] - oy, ga = ctx.globalAlpha;
    ctx.drawImage(L.shade, X, Y);                                                           // 1. the shade mass (4. feet band baked in)
    if (lit > 0) { ctx.globalAlpha = ga * lit; ctx.drawImage(L.lit, X, Y); ctx.drawImage(L.hot, X, Y); ctx.globalAlpha = ga; }   // 2. lit side, 3. hottest edge
  };
  // mute(hex, k=.7, grey='#5c625a') → '#rrggbb': a colour pulled toward the palette's neutral grey-green (the accent in shade)
  H$.mute = (c, k = .7, g = '#5c625a') => '#' + mix(hex(c), hex(g), k).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  // litFraction(L, pts, cells, plane) → 0…1: how many of the 3D sample points pts receive light L through the opening
  //   cells (3D quads lying in plane, e.g. H$.panes(...) and wallX(XL)). Back-projects each point to the opening plane.
  //   Use it to light a figure or object exactly when the projected light reaches it (sample 8–16 points over it).
  H$.litFraction = function (L, pts, cells, pl) {
    const [i, j] = [0, 1, 2].filter(a => a !== pl.a);
    const inside = (p, poly) => { let c = false; for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
      const A = poly[a], B = poly[b]; if ((A[j] > p[j]) !== (B[j] > p[j]) && p[i] < (B[i] - A[i]) * (p[j] - A[j]) / (B[j] - A[j]) + A[i]) c = !c; } return c; };
    let n = 0; for (const q of pts) { const p = L.onto(q, pl); if (cells.some(c => inside(p, c))) n++; }
    return pts.length ? n / pts.length : 0;
  };

  // ---------------- motion grammar ----------------
  // creak(dt, d=.85) → 0…1: a stiff thing that gives once and settles with a small wobble (a hinge, a sash, a chair)
  H$.creak = (dt, d = .85) => dt <= 0 ? 0 : eo(dt / d) + .05 * Math.sin(dt * 15) * Math.exp(-dt * 5);
  // breathe(t, t0, rise=3, period=2.4) → 0…1: a slow swell that starts at t0 (something alive behind the stillness)
  H$.breathe = (t, t0, rise = 3, period = 2.4) => t < t0 ? 0 : ss(t0, t0 + rise, t) * (.5 - .5 * Math.cos(2 * Math.PI * (t - t0) / period));
  // flicker(t, rate=7, seed=2, thr=.78) → 0|1: a bulb's random drop-outs (multiply a depth by it); deterministic in t
  H$.flicker = (t, rate = 7, seed = 2, thr = .78) => noise(t * rate, seed) > thr ? 1 : 0;
  // push(ctx, z, [sx,sy]) — scale the camera about a screen point (z > 1 slow push-in, z < 1 pull-back); call between
  //   ctx.save() and ctx.restore() around the world (not the words). Hopper's camera barely moves: ≤ 5 % over a film.
  H$.push = function (ctx, z, c) { ctx.translate(c[0], c[1]); ctx.scale(z, z); ctx.translate(-c[0], -c[1]); };
  let WH = null;
  // whip(ctx, u, dx=W*.5) — the one sudden move: a whip-pan smear of what is drawn so far, u = −1…1 (0 = none, sign =
  //   direction); 8–32 offset copies (≤ 6 px apart) averaged. Use for under a second, at the event.
  H$.whip = function (ctx, u, dx = Pilot.W * .5) {
    if (Math.abs(u) < .002) return;
    const W = Pilot.W, H = Pilot.H; if (!WH) WH = canvas(W, H); const x = WH.getContext('2d'); x.clearRect(0, 0, W, H); x.drawImage(ctx.canvas, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const sh = u * dx, n = Math.min(32, Math.max(8, Math.ceil(Math.abs(sh) / 6)));
    for (let i = 0; i < n; i++) { ctx.globalAlpha = 1 / (i + 1); ctx.drawImage(WH, sh * (i / (n - 1) - .5) + sh * .5, 0); }
    ctx.restore();
  };
  // flash(ctx, a, 'r,g,b'='255,250,236') — a burst of light over the frame (screen), a = 0…1
  H$.flash = (ctx, a, c = '255,250,236') => { if (a > 0) H$.wash(ctx, c, a); };

  // ---------------- post, words ----------------
  // finish(ctx, o) — canvas weave (overlay, o.grain .55) and vignette, fixed to the frame (call after the camera restore)
  H$.finish = function (ctx, o = {}) {
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain ?? .55; ctx.drawImage(H$.tex.grain, 0, 0); ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over'; if (o.vignette !== false) ctx.drawImage(H$.tex.vign, 0, 0);
  };
  // sink(ctx, k, a=.7) — the picture sinks back so an end card can sit on it (k 0…1)
  H$.sink = function (ctx, k, a = .7) { if (k > 0) { ctx.fillStyle = `rgba(4,5,5,${a * k})`; ctx.fillRect(0, 0, Pilot.W, Pilot.H); } };
  // captions(ctx, t, lines, o) — Story.captions in the house look: Noto Serif KR in warm off-white over a dark soft
  //   shadow, upper third (portrait y 400, landscape 160)
  H$.captions = (ctx, t, lines, o = {}) => Story.captions(ctx, t, lines, { font: H$.FONT, color: H$.PAL.text, srcColor: H$.PAL.src,
    y: Pilot.ori === 'v' ? 400 : 160, shadow: H$.PAL.shadow, ...o });
  // endCard(ctx, t, card, at, o) — Story.endCard in the house look (title serif, a warm "전체 설교" line)
  H$.endCard = (ctx, t, card, at, o = {}) => Story.endCard(ctx, t, card, at, { font: H$.FONT, color: H$.PAL.text, srcColor: H$.PAL.src,
    ctaColor: H$.PAL.cta, y: Pilot.ori === 'v' ? Pilot.H * .36 : Pilot.H * .3, ...o });
  // fade(ctx, t, dur) — in from black over 1 s, out over the last .6 s
  H$.fade = (ctx, t, dur) => Story.fadeBlack(ctx, t, dur, 1.0, .6);

  window.Hopper = H$;
})();
