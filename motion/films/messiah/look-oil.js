/* look-oil.js — oil painting, two keys (2026-11-03; new looks for the kit library, motion/films/README 7절 "영상마다 새 화풍 1–2개"):
     rembrandt — chiaroscuro after Rembrandt's *Adoration of the Shepherds* (OPUSCAR 45, Gordon Willis top light): readable warm umber
                 darks in thin smooth glazes, one light, thick ridged impasto only on the lit planes, amber varnish, canvas grain
     remington — Remington's Western oils (OPUSCAR 65): a red-gold sunset in long horizontal strokes, dark warm silhouettes with a
                 thin warm rim, and after dark a blue-green nocturne with warm windows
   The picture is first drawn as a value-planned plate (shapes, gradients, light — no texture), then OIL.paint() lays loaded
   strokes over it: each stroke takes the plate's colour where it lands (±jitter in brightness), runs along the form (the
   iso-line of the plate's brightness) or along a given direction, and is thick where it is light and thin or absent in the darks.
   The painting is made once (a plate larger than the frame), so strokes stay put while the camera moves over it.
     const art = OIL.paint(plate, { key: 'rembrandt', cell: 9, seed: 5 });   // plate: a canvas; returns a canvas of the same size
     OIL.view(ctx, art, S, fx, fy, z)   // draw the painting: plate point (fx, fy) at the frame centre, zoom z (plate px = S × frame px)
     OIL.varnish(ctx, k)                // amber varnish + canvas weave over the frame */
(function () {
  const P = Pilot, { clamp, lerp, rng } = P;
  const KEYS = {
    // cell = stroke spacing (plate px); wid = stroke width (× frame width); len = length / width; dark = below this brightness
    // strokes thin out (glazes); jit = brightness jitter; dir = 'form' (along the iso-line) or an angle in radians
    rembrandt: { cell: 7, wid: 1 / 115, len: [3.5, 7], dark: .2, darkKeep: .12, jit: .05, dir: 'form', ridge: .5, ridgeMin: .45, edge: .09, probe: 2.5 },
    // impasto: the palette knife (the first film's 「부활」) — broad, short, thick slabs, ridges on everything lit
    impasto: { cell: 10, wid: 1 / 55, len: [2, 3.6], dark: .08, darkKeep: .6, jit: .08, dir: 'form', ridge: .7, ridgeMin: .35, edge: .16, probe: 1.2 },
    remington: { cell: 7, wid: 1 / 110, len: [3, 6], dark: .1, darkKeep: .55, jit: .06, dir: 0, ridge: .25, ridgeMin: .6, bend: .15, edge: .08 },
  };
  function paint(plate, o = {}) {
    const k = { ...KEYS[o.key || 'rembrandt'], ...o }, w = plate.width, h = plate.height, r = rng(k.seed || 7);
    const d = plate.getContext('2d').getImageData(0, 0, w, h).data;
    const at = (x, y) => { x = Math.max(0, Math.min(w - 1, x | 0)); y = Math.max(0, Math.min(h - 1, y | 0)); const i = (y * w + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    const lum = (x, y) => { const c = at(x, y); return (.3 * c[0] + .59 * c[1] + .11 * c[2]) / 255; };
    const far = (x, y, c0) => { const c = at(x, y); return Math.hypot(c[0] - c0[0], c[1] - c0[1], c[2] - c0[2]) / 255; };
    const out = P.canvas(w, h), g = out.getContext('2d'); g.drawImage(plate, 0, 0); g.lineCap = 'round';
    const S = o.S || 1, W0 = P.W * k.wid * S, step = k.cell * S, e = Math.max(2, W0 * (k.probe || .4));   // S = plate px per frame px
    for (let y = -step; y < h + step; y += step) for (let x = -step; x < w + step; x += step) {
      const px = x + (r() - .5) * step * 1.6, py = y + (r() - .5) * step * 1.6, L = lum(px, py), kd = clamp((L - k.dark * .4) / (k.dark * .6));
      if (r() > k.darkKeep + (1 - k.darkKeep) * kd) continue;                       // darks: most strokes dropped → smooth glaze
      let a;
      if (k.dir === 'form' || o.dirAt) { const gx = lum(px + e, py) - lum(px - e, py), gy = lum(px, py + e) - lum(px, py - e);
        a = Math.hypot(gx, gy) > .02 ? Math.atan2(gy, gx) + Math.PI / 2 + (r() - .5) * .2 : (o.dirAt ? o.dirAt(px, py) : (o.calm ?? 1.2)) + (r() - .5) * .35;
        if (o.dirAt && Math.hypot(gx, gy) <= .05) a = o.dirAt(px, py) + (r() - .5) * .3; }
      else a = k.dir + (r() - .5) * .25;
      const c = at(px, py), j = 1 + (r() - .5) * 2 * k.jit, wid = W0 * (.65 + .55 * r()) * (.55 + .6 * clamp(L * 1.4));
      let len = wid * lerp(k.len[0], k.len[1], r()), dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2;
      // a stroke never crosses an edge: shorten it until both ends are the colour it was loaded with (silhouettes stay crisp)
      const c0 = at(px, py); for (let n = 0; n < 3; n++) { if (far(px - dx, py - dy, c0) < k.edge && far(px + dx, py + dy, c0) < k.edge && far(px, py, c0) < k.edge) break; dx *= .5; dy *= .5; len *= .5; }
      if (len < wid * 1.1) continue;
      const bx = -dy * (k.bend || .08) * (r() - .5) * 4, by = dx * (k.bend || .08) * (r() - .5) * 4;
      g.strokeStyle = `rgb(${Math.min(255, c[0] * j) | 0},${Math.min(255, c[1] * j) | 0},${Math.min(255, c[2] * j) | 0})`; g.lineWidth = wid; g.globalAlpha = .9;
      g.beginPath(); g.moveTo(px - dx, py - dy); g.quadraticCurveTo(px + bx, py + by, px + dx, py + dy); g.stroke();
      if (L > k.ridgeMin && r() < k.ridge) {   // impasto: a ridge of light paint along the stroke's top edge
        g.strokeStyle = `rgba(255,244,222,${.18 * clamp((L - k.ridgeMin) * 3)})`; g.lineWidth = wid * .3; g.beginPath();
        g.moveTo(px - dx - wid * .2, py - dy - wid * .25); g.quadraticCurveTo(px + bx - wid * .2, py + by - wid * .25, px + dx - wid * .2, py + dy - wid * .25); g.stroke(); }
    }
    g.globalAlpha = 1; return out;
  }
  // relief: a flat silhouette given volume by one light. The shape's mask is blurred into a height field; each pixel's normal
  // meets the light (a point in the room: plate px x, y and a height z), so planes that face the light are lit, the rest stay in
  // warm shadow, and the edge toward the light glows. zones colour parts differently (veil, face, hands): [{ test(u, v) → bool in
  // the path's own units, base: [r,g,b], lit: [r,g,b] }], the last one is the default. m = DOMMatrix path units → plate px.
  //   OIL.relief(g, path, m, box, zones, { x, y, z, R }, { soft: .06, height: 60, amb: .16, wrap: .25 })
  function relief(g, path, m, box, zones, light, o = {}) {
    const pts = [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]].map(([u, v]) => m.transformPoint({ x: u, y: v }));
    const bl = Math.max(2, (o.soft ?? .06) * Math.hypot(pts[3].x - pts[0].x, pts[3].y - pts[0].y)), pad = Math.ceil(bl * 2);
    const bx = Math.floor(Math.min(...pts.map(p => p.x))) - pad, by = Math.floor(Math.min(...pts.map(p => p.y))) - pad;
    const bw = Math.ceil(Math.max(...pts.map(p => p.x))) + pad - bx, bh = Math.ceil(Math.max(...pts.map(p => p.y))) + pad - by;
    const mk = P.canvas(bw, bh), mg = mk.getContext('2d'); mg.setTransform(new DOMMatrix([1, 0, 0, 1, -bx, -by]).multiply(m)); mg.fillStyle = '#fff'; mg.fill(path);
    const bc = P.canvas(bw, bh), bg2 = bc.getContext('2d'); bg2.filter = `blur(${bl.toFixed(1)}px)`; bg2.drawImage(mk, 0, 0);
    const A = mg.getImageData(0, 0, bw, bh).data, Bd = bg2.getImageData(0, 0, bw, bh).data, out = mg.createImageData(bw, bh), O = out.data;
    const mi = m.inverse(), hgt = o.height ?? 60, amb = o.amb ?? .16, wrap = o.wrap ?? .25, R2 = (light.R || 1e9) ** 2;
    const hb = (x, y) => Bd[((Math.max(0, Math.min(bh - 1, y)) * bw + Math.max(0, Math.min(bw - 1, x))) << 2) + 3] / 255 * hgt;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const i = (y * bw + x) << 2, a = A[i + 3]; if (!a) continue;
      let nx = -(hb(x + 1, y) - hb(x - 1, y)) / 2, ny = -(hb(x, y + 1) - hb(x, y - 1)) / 2, nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      const X = bx + x, Y = by + y; let lx = light.x - X, ly = light.y - Y, lz = light.z ?? 200; const d2 = lx * lx + ly * ly, ll = Math.hypot(lx, ly, lz); lx /= ll; ly /= ll; lz /= ll;
      const dif = clamp((nx * lx + ny * ly + nz * lz + wrap) / (1 + wrap)) ** 1.6, fall = 1 / (1 + d2 / R2);
      const uv = mi.transformPoint({ x: X, y: Y }), z0 = zones[zones.length - 1]; let base = z0.base, lit = z0.lit, kk = z0.k ?? 1;
      for (const zn of zones) { if (zn === z0) break; const wgt = zn.w ? zn.w(uv.x, uv.y) : (zn.test && zn.test(uv.x, uv.y) ? 1 : 0); if (wgt > 0) { base = P.mix(base, zn.base, wgt); lit = P.mix(lit, zn.lit, wgt); kk = lerp(kk, zn.k ?? 1, wgt); } }
      for (let c = 0; c < 3; c++) O[i + c] = Math.min(255, base[c] * (amb + (1 - amb) * .35) + lit[c] * dif * fall * kk);
      O[i + 3] = a; }
    mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, bw, bh); mg.putImageData(out, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(mk, bx, by); g.restore();
  }
  // the painting seen by a camera: plate point (fx, fy) at the frame centre, zoom z; S = plate px per frame px at z = 1
  function view(ctx, art, S, fx, fy, z = 1) { const W = P.W, H = P.H, s = z / S; ctx.drawImage(art, W / 2 - fx * s, H / 2 - fy * s, art.width * s, art.height * s); }
  let WEAVE = null;
  function varnish(ctx, k = 1, col = [120, 74, 22]) {
    const W = P.W, H = P.H;
    if (!WEAVE) { WEAVE = P.canvas(256, 256); const g = WEAVE.getContext('2d'), im = g.createImageData(256, 256), r = rng(19);
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const v = 128 + 22 * Math.sin(x * 1.7) * Math.sin(y * .23) + 22 * Math.sin(y * 1.7) * Math.sin(x * .23) + (r() - .5) * 26, i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      g.putImageData(im, 0, 0); }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(${255 - (255 - col[0]) * .25 * k | 0},${255 - (255 - col[1]) * .25 * k | 0},${255 - (255 - col[2]) * .25 * k | 0},1)`; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .16 * k; ctx.fillStyle = ctx.createPattern(WEAVE, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  window.OIL = { paint, view, varnish, relief, KEYS };
})();
