/* Mosaic — a Roman floor mosaic drawn in code. Our own renderer; the look follows OPUSCAR no. 73's brief (Lemo-Opuscar
   styleboard, MIT) and the floors it names (the Alexander Mosaic, Zliten):
     · square stone tesserae (~1/150 of the frame) over a flat underdrawing; two or three courses follow every outline
       (opus vermiculatum), flat areas are laid in straight rows (opus tessellatum);
     · muted stone and glass — burnt gold, umber, terracotta, warm marble; sea and sky in pale grey-blue and cream;
       one imperial purple at most; dark grout; each stone a little irregular, lit from the upper left;
     · motion comes from details: stones that turn over (a decree spreading, a road of gold glass being laid), a glint.
   API: const m = Mosaic.build({ w, h, tile, seed, color(x, y) → [r,g,b], outlines: [{ pts, color, courses, out }] })
        m.canvas (static floor, w×h)   m.tiles [{x, y, a, s, c}]   m.near(pts, r) → tile indices along a path, in path order
        Mosaic.flip(ctx, m, i, k, to)  draws tile i turning over (k 0..1) to colour `to`   Mosaic.glint(ctx, m, i, a)  */
(function () {
  const P = Pilot, { clamp, lerp } = P;
  const GROUT = '#2e241c';
  function resample(pts, step) { const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], d = Math.hypot(bx - ax, by - ay), k = Math.max(1, Math.round(d / step)); for (let j = 1; j <= k; j++) out.push([ax + (bx - ax) * j / k, ay + (by - ay) * j / k]); } return out; }
  // smooth a polyline (Chaikin) so courses bend gently
  function smooth(pts, n = 2, closed = false) { let p = pts; for (let k = 0; k < n; k++) { const q = []; const m = p.length; for (let i = 0; i < (closed ? m : m - 1); i++) { const a = p[i], b = p[(i + 1) % m]; q.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); } if (!closed) { q.unshift(p[0]); q.push(p[m - 1]); } p = q; } return p; }

  function tilePath(g, x, y, a, s, jit) {   // a slightly irregular square
    const c = Math.cos(a), sn = Math.sin(a), h = s / 2, pts = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([u, v], i) => { const j = jit[i]; return [x + (u + j[0]) * c - (v + j[1]) * sn, y + (u + j[0]) * sn + (v + j[1]) * c]; });
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < 4; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); return pts;
  }
  function drawTile(g, t, col, lift = 0) {
    const pts = tilePath(g, t.x, t.y, t.a, t.s * (1 + lift), t.j);
    g.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; g.fill();
    // light from the upper left: a lit rim on the two edges that face it, a shade on the other two
    const lw = Math.max(1, t.s * .1); g.lineWidth = lw;
    g.strokeStyle = `rgba(255,248,232,${.22 + .12 * t.r})`; g.beginPath(); g.moveTo(pts[3][0], pts[3][1]); g.lineTo(pts[0][0], pts[0][1]); g.lineTo(pts[1][0], pts[1][1]); g.stroke();
    g.strokeStyle = 'rgba(20,12,6,.35)'; g.beginPath(); g.moveTo(pts[1][0], pts[1][1]); g.lineTo(pts[2][0], pts[2][1]); g.lineTo(pts[3][0], pts[3][1]); g.stroke();
  }

  function build(o) {
    const { w, h } = o, s = o.tile, rnd = P.rng(o.seed || 1), tiles = [];
    const cell = s / 4, gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, occ = new Uint8Array(gw * gh);
    const free = (x, y, r = .25) => { const rr = Math.round(s * r / cell); const cx = Math.round(x / cell), cy = Math.round(y / cell); for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) { const X = cx + i, Y = cy + j; if (X >= 0 && Y >= 0 && X < gw && Y < gh && occ[Y * gw + X]) return false; } return true; };
    const mark = (x, y) => { const rr = Math.round(s * .42 / cell); const cx = Math.round(x / cell), cy = Math.round(y / cell); for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) { const X = cx + i, Y = cy + j; if (X >= 0 && Y >= 0 && X < gw && Y < gh) occ[Y * gw + X] = 1; } };
    const vary = (c, k = 14) => { const v = (rnd() - .5) * k; return [c[0] + v + (rnd() - .5) * 6, c[1] + v + (rnd() - .5) * 6, c[2] + v + (rnd() - .5) * 6]; };
    const add = (x, y, a, c, kind) => { if (x < -s || y < -s || x > w + s || y > h + s) return; const ss = s * (.9 + rnd() * .07); tiles.push({ x, y, a: a + (rnd() - .5) * .12, s: ss, c: vary(c), j: [0, 1, 2, 3].map(() => [(rnd() - .5) * ss * .14, (rnd() - .5) * ss * .14]), r: rnd(), kind }); mark(x, y); };
    // outlines first: courses that follow the line (index 0 on the line, then alternately outside/inside)
    for (const ol of o.outlines || []) {
      const pts = resample(smooth(ol.pts, 2, ol.closed), s * 1.04), n = pts.length, courses = ol.courses || 2;
      for (let k = 0; k < courses; k++) {
        const off = (k === 0 ? 0 : Math.ceil(k / 2) * (k % 2 ? 1 : -1)) * s * 1.06 * (ol.side || 1);
        for (let i = 0; i < n; i++) { const a0 = pts[Math.max(0, i - 1)], a1 = pts[Math.min(n - 1, i + 1)], ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
          const x = pts[i][0] + nx * off, y = pts[i][1] + ny * off; if (!free(x, y)) continue;
          add(x, y, ang, k === 0 ? ol.color : (ol.courseColor ? ol.courseColor(x, y, k) : o.color(x, y)), ol.kind || 'line'); } }
    }
    // fill: straight rows, each row shifted a little, stones skipped where a course already lies
    for (let y = s * .5, row = 0; y < h + s; y += s * 1.05, row++) { const x0 = (row % 2 ? s * .5 : 0) + rnd() * s * .3;
      for (let x = x0; x < w + s; x += s * 1.05) { const xx = x + (rnd() - .5) * s * .08, yy = y + (rnd() - .5) * s * .08; if (free(xx, yy)) add(xx, yy, 0, o.color(xx, yy), 'fill'); } }
    // close the holes the rows left (a smaller stone wherever a whole stone's room is still free)
    for (let y = s * .25; y < h + s; y += s * .35) for (let x = s * .25; x < w + s; x += s * .35) if (free(x, y, .2)) { add(x, y, (rnd() - .5) * .3, o.color(x, y), 'fill'); tiles[tiles.length - 1].s *= .82; }
    const canvas = P.canvas(w, h), g = canvas.getContext('2d'); g.fillStyle = GROUT; g.fillRect(0, 0, w, h);
    for (const t of tiles) drawTile(g, t, t.c);
    // a faint wear over the floor (stone polish, old dirt in the grout)
    { const d = g.getImageData(0, 0, w, h), a = d.data, r2 = P.rng((o.seed || 1) + 5); for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) { const i = (y * w + x) * 4, n = (P.noise(x * .012, y * .012) - .5) * 16 + (r2() - .5) * 6; a[i] += n; a[i + 1] += n; a[i + 2] += n; } g.putImageData(d, 0, 0); }
    const m = { canvas, tiles, s, w, h };
    // tiles along a path (within r of it), ordered by distance along the path → [{ i, d }] (d in path length units)
    m.near = (path, r = s * .9) => { const pts = resample(path, s * .5), cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const out = []; tiles.forEach((t, i) => { let best = 1e9, bd = 0; for (let k = 0; k < pts.length; k += 1) { const dd = (t.x - pts[k][0]) ** 2 + (t.y - pts[k][1]) ** 2; if (dd < best) { best = dd; bd = cum[k]; } } if (best < r * r) out.push({ i, d: bd }); });
      out.sort((a, b) => a.d - b.d); return { list: out, len: cum[cum.length - 1] }; };
    return m;
  }
  // a stone turning over (k 0..1) to a new colour: it narrows to an edge, then opens showing its other face
  function flip(ctx, m, i, k, to, from) {
    const t = m.tiles[i]; if (k <= 0) return; const c = Math.abs(Math.cos(Math.PI * Math.min(k, 1))), col = k < .5 ? (from || t.c) : to;
    ctx.save(); ctx.fillStyle = GROUT; tilePath(ctx, t.x, t.y, t.a, t.s * 1.06, [[0, 0], [0, 0], [0, 0], [0, 0]]); ctx.fill();
    if (k < 1) { ctx.translate(t.x, t.y); ctx.rotate(t.a); ctx.scale(1, Math.max(.06, c)); ctx.rotate(-t.a); ctx.translate(-t.x, -t.y); }
    drawTile(ctx, t, col, k < 1 ? .04 * Math.sin(Math.PI * k) : 0); ctx.restore();
  }
  // gold-leaf glass: a slow glint passing over it
  function glint(ctx, m, i, a) { if (a <= 0) return; const t = m.tiles[i]; ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(t.x - t.s * .2, t.y - t.s * .2, 0, t.x, t.y, t.s * 1.1); g.addColorStop(0, 'rgba(255,250,220,.95)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(t.x - t.s, t.y - t.s, t.s * 2, t.s * 2); ctx.restore(); }
  window.Mosaic = { build, flip, glint, smooth, resample, GROUT, drawTile };
})();
