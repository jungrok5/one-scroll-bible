/* Oil — a night oil painting in top light, drawn in code. Our own renderer; the look follows OPUSCAR no. 45's brief
   (Lemo-Opuscar styleboard, MIT: chiaroscuro after Rembrandt and Caravaggio) and Rembrandt's own night scenes
   (The Adoration of the Shepherds, 1646; The Annunciation to the Shepherds, 1634):
     · about 70% of the frame is warm readable dark (umber, near-black only in the corners); one light source;
     · darks are thin smooth glazes, lights are thick impasto — ridged strokes that follow the form;
     · figures stay mostly in shadow; only the planes that face the light catch strokes (a rim, a cheek, a hand);
     · amber varnish, canvas grain, a heavy vignette; one red accent at most.
   The painting is laid once (init) into a canvas; a frame only moves the camera and breathes the light.
   API: Oil.canvas(w, h, seed) → { c, g }   Oil.ground(g, w, h, light)   Oil.figure(g, path, light, o)
        Oil.stroke(g, x, y, ang, len, w, col, o)   Oil.glow(g, x, y, r, col, a)   Oil.finish(g, w, h, seed)  */
(function () {
  const P = Pilot, { clamp, lerp } = P;
  const UMBER = [36, 21, 11], DEEP = [9, 5, 3], AMBER = [143, 93, 42], TOP = [226, 182, 115], CREAM = [250, 228, 186];
  const lightCol = k => k < .5 ? P.mix(AMBER, TOP, k * 2) : P.mix(TOP, CREAM, (k - .5) * 2);
  // one loaded brush stroke: a body, a ridge of light along its upper edge and a darker trough — impasto
  function stroke(g, x, y, ang, len, w, col, o = {}) {
    const c = Math.cos(ang), s = Math.sin(ang), a = o.alpha ?? 1, r = o.rnd || Math.random;
    g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = a;
    const taper = (u) => Math.sin(Math.PI * Math.min(1, u * 1.15)) ** .5;
    const path = new Path2D(); const n = 8; path.moveTo(-len / 2, 0);
    for (let i = 0; i <= n; i++) { const u = i / n; path.lineTo(-len / 2 + len * u, -w / 2 * taper(u) * (1 + (r() - .5) * .3)); }
    for (let i = n; i >= 0; i--) { const u = i / n; path.lineTo(-len / 2 + len * u, w / 2 * taper(u) * (1 + (r() - .5) * .3)); }
    path.closePath();
    g.fillStyle = P.rgb(col); g.fill(path);
    if (!o.flat) { g.globalAlpha = a * .5; g.strokeStyle = P.rgb(P.mix(col, CREAM, .45)); g.lineWidth = Math.max(.8, w * .16); g.beginPath(); g.moveTo(-len * .4, -w * .2); g.lineTo(len * .38, -w * .26); g.stroke();
      g.globalAlpha = a * .35; g.strokeStyle = P.rgb(P.mix(col, DEEP, .5)); g.beginPath(); g.moveTo(-len * .38, w * .28); g.lineTo(len * .4, w * .22); g.stroke(); }
    g.restore();
  }
  function glow(g, x, y, r, col, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, P.rgb(col, a)); gr.addColorStop(1, P.rgb(col, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  // the room: umber glazes, darker toward the corners, warm around the light; loose dark strokes so it is paint, not a gradient
  function ground(g, w, h, L, seed) {
    const r = P.rng(seed); g.fillStyle = P.rgb(UMBER); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const x = r() * w, y = r() * h, d = Math.hypot(x - L.x, y - L.y) / L.r, k = Math.exp(-d * 1.6);
      stroke(g, x, y, (r() - .5) * .8 + (r() < .5 ? 0 : 1.57), 40 + r() * 90, 10 + r() * 16, P.mix(P.mix(DEEP, UMBER, .7 + .3 * r()), AMBER, .55 * k), { alpha: .35, flat: true, rnd: r }); }
    glow(g, L.x, L.y, L.r * 1.6, AMBER, .5); glow(g, L.x, L.y, L.r * .7, TOP, .35);
  }
  // a figure in the dark: its silhouette in shadow, then strokes on the edge that faces the light (they follow the
  // contour), deeper into the form where the light is strong. path: Path2D; pts: its outline [[x,y]…] (for normals)
  function figure(g, path, pts, L, o = {}) {
    const r = P.rng(o.seed || 3), base = o.base || P.mix(DEEP, UMBER, .55);
    g.save(); g.fillStyle = P.rgb(base); g.fill(path); g.clip(path);
    // a faint body tone so the shadow side is still readable dark, not a hole
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    glow(g, lerp(cx, L.x, .25), lerp(cy, L.y, .25), o.bodyR || 160, UMBER, .9);
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
      let tx = p2[0] - p0[0], ty = p2[1] - p0[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      let nx = ty, ny = -tx; if ((p1[0] + nx * 4 - cx) ** 2 + (p1[1] + ny * 4 - cy) ** 2 < (p1[0] - cx) ** 2 + (p1[1] - cy) ** 2) { nx = -nx; ny = -ny; }   // outward
      const lx = L.x - p1[0], ly = L.y - p1[1], ld = Math.hypot(lx, ly) || 1, facing = (nx * lx + ny * ly) / ld;
      const fall = Math.exp(-ld / (L.r * (o.reach || 1))), lit = clamp(facing) * fall * (o.gain || 1);
      if (lit < .04) continue;
      if (i % 2) { g.save(); g.globalCompositeOperation = 'screen'; glow(g, p1[0] - nx * 26 * lit, p1[1] - ny * 26 * lit, 40 + 110 * lit, AMBER, .2 * lit); g.restore(); }   // soft turning light (glaze)
      if (i % 2) continue;
      const strokes = 2 + Math.round(lit * (o.density || 5) * 1.6);
      for (let k = 0; k < strokes; k++) {
        const depth = Math.pow(r(), 1.6) * (6 + 40 * lit) * (o.depth || 1), x = p1[0] - nx * depth + (r() - .5) * 6, y = p1[1] - ny * depth + (r() - .5) * 6;
        const kk = clamp(lit * (1 - depth / (60 * (o.depth || 1))) * 1.25);
        stroke(g, x, y, Math.atan2(ty, tx) + (r() - .5) * .16, 22 + r() * 26, 2.2 + r() * 2 + lit * 3.2, lightCol(kk), { alpha: .28 + .5 * kk, rnd: r });
      }
    }
    g.restore();
  }
  // varnish (amber over everything), canvas weave, heavy vignette — once, into the painting
  function finish(g, w, h, seed, L) {
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(236,214,170)'; g.fillRect(0, 0, w, h); g.restore();
    const vg = g.createRadialGradient(L.x, L.y, Math.min(w, h) * .25, L.x, L.y, Math.max(w, h) * .75); vg.addColorStop(0, 'rgba(7,4,3,0)'); vg.addColorStop(1, 'rgba(7,4,3,.88)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
    const d = g.getImageData(0, 0, w, h), a = d.data, r = P.rng(seed);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, weave = ((x % 4 < 2) !== (y % 4 < 2) ? 3 : -3), n = (r() - .5) * 7 + weave; a[i] += n; a[i + 1] += n; a[i + 2] += n * .8; }
    g.putImageData(d, 0, 0);
  }
  window.Oil = { stroke, glow, ground, figure, finish, lightCol, UMBER, DEEP, AMBER, TOP, CREAM,
    canvas: (w, h) => { const c = P.canvas(w, h); return { c, g: c.getContext('2d') }; } };
})();
