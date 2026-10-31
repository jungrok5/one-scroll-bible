/* kit-inkmap.js — house style: an ink map on stained parchment (from one-scroll-bible's 「침묵의 400년」, 2026-10; after
   the first film's wilderness map and old maps such as the Peutinger Table). Pencil-ink coasts with ripple lines along
   them, faint water washes, rivers, peaks outlined and hatched on their shadow side, desert stipple, a compass rose,
   place names with a parchment halo. On it, history is DRAWN: dashed ink trails with a red head, an army's march in red
   with a watercolour wash spreading behind it, roads in vermilion, sea lanes with small ink ships, city lamps that light,
   and routes of gold light. The camera moves over ONE map (keys of lon, lat, zoom) — the shot never cuts.

   Coordinates are (lon, lat) degrees, or a city name from the data. projection() maps them to map pixels (an equirect-
   angular map squeezed by cos(lat)); build() paints the whole map ONCE into a canvas; begin(ctx, cam) sets the camera
   and draws it; everything after draws in map pixels — divide line widths by the zoom z that begin() returns so they
   stay the same on screen. Deterministic and seek-safe: seeded randomness only, all motion a function of t.
   Load after lib.js (Pilot). Exposes window.InkMap (with InkMap.MED, the ancient Mediterranean and Near East). */
(function () {
  const { clamp, lerp, ss, eio, rng, fbm, noise, canvas, mix, rgb } = Pilot;
  const W = Pilot.W, H = Pilot.H;
  const M$ = {};

  // ---------------- palette ----------------
  M$.INK = '#3A2418';      // the map's ink
  M$.RED = '#B23A1E';      // red ink: a moving people or army, the head of a trail
  M$.ROAD = '#c8402a';     // vermilion roads
  M$.SEA = 'rgba(96,136,160,.42)';
  M$.BG = '#2a1d12';       // around the sheet
  M$.FONT = "'Noto Serif KR',serif";

  // ---------------- projection ----------------
  // projection({ scale=52, lat=35, lon0=-14, lat0=58 }) — map pixels per degree of latitude, the latitude whose cosine
  // squeezes longitude, and the top-left corner. Sets M$.mx(lon), M$.my(lat); returns M$.
  M$.projection = function (o = {}) {
    const S = o.scale ?? 52, C = Math.cos((o.lat ?? 35) * Math.PI / 180), L0 = o.lon0 ?? -14, A0 = o.lat0 ?? 58;
    M$.mx = lon => (lon - L0) * C * S; M$.my = lat => (A0 - lat) * S; return M$; };
  M$.projection();
  M$.city = {};
  // P(p) → [x, y] map pixels: p is a city name (from the built map's data) or [lon, lat]
  M$.P = p => typeof p === 'string' ? [M$.mx(M$.city[p][0]), M$.my(M$.city[p][1])] : [M$.mx(p[0]), M$.my(p[1])];

  // ---------------- path tools (map pixels) ----------------
  // smoothPts(pts, n=10, closed) — Catmull-Rom through the points, n samples per span
  M$.smoothPts = function (P, n = 10, closed = false) {
    const Q = closed ? [P[P.length - 1], ...P, P[0], P[1]] : [P[0], ...P, P[P.length - 1]], out = [];
    for (let i = 1; i < Q.length - 2; i++) { const p0 = Q[i - 1], p1 = Q[i], p2 = Q[i + 1], p3 = Q[i + 2];
      for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
    if (!closed) out.push(P[P.length - 1]); return out; };
  // wobble(pts, amp, f, seed) — a hand-drawn tremor (noise along the line)
  M$.wobble = (pts, amp, f, seed) => pts.map(([x, y], i) => [x + (noise(i * f, seed) - .5) * 2 * amp, y + (noise(i * f, seed + 9) - .5) * 2 * amp]);
  // pth(pts, close) → Path2D
  M$.pth = (pts, close) => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); if (close) p.closePath(); return p; };
  M$.polyLen = function (pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
  // partial(ctx, pts, p) → head — stroke the first fraction p (by length) of a polyline with the current style
  M$.partial = function (ctx, pts, p) {
    const L = M$.polyLen(pts) * clamp(p); let acc = 0; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); let head = pts[0];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + d >= L) { const k = d ? (L - acc) / d : 0; head = [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; ctx.lineTo(head[0], head[1]); break; }
      acc += d; ctx.lineTo(pts[i][0], pts[i][1]); head = pts[i]; }
    ctx.stroke(); return head; };
  // pointAt(pts, p) → [x, y] at fraction p of the length
  M$.pointAt = function (pts, p) { const L = M$.polyLen(pts) * clamp(p); let acc = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + d >= L) { const k = d ? (L - acc) / d : 0; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } acc += d; } return pts[pts.length - 1]; };
  // arcPts(a, b, bend=.18, n=24) — a curved hop between two places (a quadratic bowed by `bend` of the distance)
  M$.arcPts = function (a, b, bend = .18, n = 24) { const [x0, y0] = M$.P(a), [x1, y1] = M$.P(b), mxp = (x0 + x1) / 2, myp = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0;
    const cx = mxp - dy * bend, cy = myp + dx * bend, out = []; for (let i = 0; i <= n; i++) { const k = i / n; out.push([(1 - k) ** 2 * x0 + 2 * (1 - k) * k * cx + k * k * x1, (1 - k) ** 2 * y0 + 2 * (1 - k) * k * cy + k * k * y1]); } return out; };
  // route(places, n=8) — a smooth line through a list of places (names or [lon, lat])
  M$.route = (r, n = 8) => M$.smoothPts(r.map(M$.P), n);
  // atPlace(routeList, pts, name) → fraction of the route's length where it passes `name` (for "the label appears when he gets there")
  M$.atPlace = (r, pts, name, n = 8) => { const k = r.indexOf(name) * n; return k < 0 ? 1 : M$.polyLen(pts.slice(0, k + 1)) / M$.polyLen(pts); };

  // ---------------- the map (built once) ----------------
  // build(D, o) → canvas — D: { seas, islands (each [[lon, lat], …] closed), city {name: [lon, lat]}, rivers [[pts, width,
  // seed]], ranges [[lon0, lon1, lat0, lat1, n, s0, s1]] (peaks scattered on land), desert { lon:[a,b], lat:[a,b], n },
  // compass [lon, lat], extent [east lon, south lat], grid { lon:[a,b], lat:[a,b], step }, seed }.
  // o.labels: [{ text, at, size, ls, c, dot, dx, dy, al }] — names written into the map (pass translated text);
  // o.font. Order of painting: parchment, graticule, water wash, coast ripples, islands, coastlines, rivers, peaks,
  // desert, labels, compass, city dots. ~0.3–0.6 s for the default world.
  M$.build = function (D, o = {}) {
    const { mx, my } = M$, MINK = M$.INK, P_ = M$.P; M$.city = D.city || {};
    const w = Math.ceil(mx(D.extent[0])), h = Math.ceil(my(D.extent[1])), map = canvas(w, h), x = map.getContext('2d'), r = rng(D.seed ?? 12);
    const { smoothPts, wobble, pth } = M$;
    // parchment: warm base, slow stains, darker toward the edges (computed small, stretched)
    const lw = w >> 3, lh = h >> 3, lo = canvas(lw, lh), lox = lo.getContext('2d'), d = lox.createImageData(lw, lh);
    for (let j = 0; j < lh; j++) for (let i = 0; i < lw; i++) { const n = fbm(i * .012, j * .012, 5), n2 = fbm(i * .05 + 7, j * .05, 3), e = Math.min(i, j, lw - 1 - i, lh - 1 - j) / 30;
      const burn = 1 - clamp(e), k = (j * lw + i) * 4, base = mix([233, 220, 192], [196, 168, 122], clamp((n - .42) * 1.4 + burn * .9)), st = 1 - .06 * ss(.58, .78, n2);
      d.data[k] = base[0] * st; d.data[k + 1] = base[1] * st; d.data[k + 2] = base[2] * st * .98; d.data[k + 3] = 255; }
    lox.putImageData(d, 0, 0); x.imageSmoothingQuality = 'high'; x.drawImage(lo, 0, 0, w, h);
    const G = D.grid || { lon: [-10, 65], lat: [5, 60], step: 5 };
    x.strokeStyle = 'rgba(120,90,50,.06)'; x.lineWidth = 1; for (let lo2 = G.lon[0]; lo2 <= G.lon[1]; lo2 += G.step) { x.beginPath(); x.moveTo(mx(lo2), 0); x.lineTo(mx(lo2), h); x.stroke(); }
    for (let la = G.lat[0]; la <= G.lat[1]; la += G.step) { x.beginPath(); x.moveTo(0, my(la)); x.lineTo(w, my(la)); x.stroke(); }
    // water: a faint wash, ripple lines along the coasts, an ink coastline
    const seas = D.seas.map((s, i) => wobble(smoothPts(s.map(([a, b]) => [mx(a), my(b)]), 6, true), 2.2, .5, 3 + i));
    const isl = (D.islands || []).map((s, i) => wobble(smoothPts(s.map(([a, b]) => [mx(a), my(b)]), 6, true), 1.4, .5, 40 + i));
    const seaP = seas.map(s => pth(s, true)), islP = isl.map(s => pth(s, true));
    x.save(); for (const p of seaP) { x.save(); x.clip(p); x.fillStyle = M$.SEA; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'multiply'; x.globalAlpha = .5; x.drawImage(lo, 0, 0, w, h); x.restore(); } x.restore();
    const rip = canvas(w, h), rx = rip.getContext('2d'); rx.lineJoin = 'round';
    for (const p of [...seaP, ...islP]) for (const dd of [40, 28, 17, 8]) { rx.globalCompositeOperation = 'source-over'; rx.strokeStyle = '#2c4a5e'; rx.globalAlpha = .5 - dd / 120; rx.lineWidth = dd * 2 + 1.6; rx.stroke(p);
      rx.globalAlpha = 1; rx.globalCompositeOperation = 'destination-out'; rx.lineWidth = dd * 2 - .4; rx.stroke(p); }
    x.save(); for (const p of seaP) { x.save(); x.clip(p); x.drawImage(rip, 0, 0); x.restore(); } x.restore();
    for (const p of islP) { x.save(); x.clip(p); x.drawImage(lo, 0, 0, w, h); x.restore(); }
    x.strokeStyle = MINK; x.lineJoin = 'round'; x.lineWidth = 2.6; for (const p of seaP) x.stroke(p); x.lineWidth = 2; for (const p of islP) x.stroke(p);
    const isSea = (px, py) => seaP.some(p => x.isPointInPath(p, px, py)) && !islP.some(p => x.isPointInPath(p, px, py));
    M$.isSea = isSea;
    // rivers
    for (const [ll, lw2, seed] of D.rivers || []) { x.lineWidth = lw2; x.strokeStyle = MINK; x.stroke(pth(wobble(smoothPts(ll.map(([a, b]) => [mx(a), my(b)]), 10), 3, .5, seed), false)); }
    // hills as on old maps: outlined peaks hatched on the shadow side, along the great ranges
    const peak = (px, py, s) => { x.fillStyle = 'rgba(236,224,198,.9)'; x.beginPath(); x.moveTo(px - s, py); x.lineTo(px - s * .12, py - s * 1.05); x.lineTo(px + s, py); x.closePath(); x.fill();
      x.strokeStyle = MINK; x.lineWidth = 1.7; x.beginPath(); x.moveTo(px - s, py); x.lineTo(px - s * .12, py - s * 1.05); x.lineTo(px + s, py); x.stroke();
      x.lineWidth = 1; for (let k = 1; k < 5; k++) { const f = k / 5, qx = lerp(px - s * .12, px + s, f), qy = lerp(py - s * 1.05, py, f); x.beginPath(); x.moveTo(qx, qy); x.lineTo(qx - s * .28, qy + s * .32); x.stroke(); } };
    const range = (lo0, lo1, la0, la1, n, s0, s1) => { const pts = []; for (let i = 0; i < n; i++) { const px = mx(lerp(lo0, lo1, r())), py = my(lerp(la0, la1, r())); if (!isSea(px, py) && !isSea(px - 16, py) && !isSea(px + 16, py)) pts.push([px, py, s0 + r() * (s1 - s0)]); }
      pts.sort((a, b) => a[1] - b[1]).forEach(([px, py, s]) => peak(px, py, s)); };
    for (const g of D.ranges || []) range(...g);
    if (D.desert) { const ds = D.desert; x.fillStyle = 'rgba(58,36,24,.32)'; for (let i = 0; i < ds.n; i++) { const lo2 = lerp(ds.lon[0], ds.lon[1], r()), la = lerp(ds.lat[0], ds.lat[1], r()); const px = mx(lo2), py = my(la); if (isSea(px, py)) continue; x.beginPath(); x.arc(px, py, .7 + r() * 1, 0, 6.283); x.fill(); } }
    // labels (pass the text already translated: the map holds no words of its own)
    const font = o.font || M$.FONT;
    const lab = (s, p, size, q = {}) => { if (!s) return; const [px, py] = P_(p); x.save(); x.font = `600 ${size}px ${font}`; x.letterSpacing = (q.ls || 0) + 'px'; x.textAlign = q.al || 'center'; x.textBaseline = 'middle';
      const tx = px + (q.dx || 0), ty = py + (q.dy || 0); x.lineWidth = size * .22; x.strokeStyle = 'rgba(236,224,198,.85)'; x.lineJoin = 'round'; x.strokeText(s, tx, ty); x.fillStyle = q.c || MINK; x.fillText(s, tx, ty);
      if (q.dot) { x.beginPath(); x.arc(px, py, 6, 0, 6.283); x.fillStyle = MINK; x.fill(); x.beginPath(); x.arc(px, py, 2.6, 0, 6.283); x.fillStyle = '#e9dcc0'; x.fill(); } x.restore(); };
    for (const l of o.labels || []) lab(l.text, l.at, l.size || 38, l);
    // compass rose
    if (D.compass) { const cx = mx(D.compass[0]), cy = my(D.compass[1]); x.save(); x.translate(cx, cy); x.strokeStyle = MINK; x.fillStyle = MINK; x.lineWidth = 1.6; x.beginPath(); x.arc(0, 0, 64, 0, 6.283); x.stroke(); x.beginPath(); x.arc(0, 0, 50, 0, 6.283); x.stroke();
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 - Math.PI / 2, l = k % 2 ? 50 : 100; x.beginPath(); x.moveTo(Math.cos(a) * l, Math.sin(a) * l); x.lineTo(Math.cos(a + .5) * 13, Math.sin(a + .5) * 13); x.lineTo(Math.cos(a - .5) * 13, Math.sin(a - .5) * 13); x.closePath(); k % 4 ? x.stroke() : x.fill(); } x.restore(); }
    if (o.cityDots !== false) { x.fillStyle = 'rgba(58,36,24,.55)'; for (const c of Object.values(M$.city)) { x.beginPath(); x.arc(mx(c[0]), my(c[1]), 2.6, 0, 6.283); x.fill(); } }
    return M$.map = map;
  };

  // ---------------- camera ----------------
  // camAt(keys, t) → [lon, lat, zoom] — keys [[t, lon, lat, zoom], …], eased between keys, held past the ends
  M$.camAt = function (keys, t) { let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++; const a = keys[i], b = keys[i + 1], k = eio(clamp((t - a[0]) / (b[0] - a[0] || 1)));
    return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)]; };
  // begin(ctx, [lon, lat, z], map=M$.map, bg) → z — clear, centre the camera on (lon, lat) at zoom z, draw the map.
  // Draw routes etc. in map pixels after this; call end(ctx) before screen-space work (words, bands).
  M$.begin = function (ctx, cam, map = M$.map, bg = M$.BG) { const [lo, la, z] = cam; ctx.save(); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-M$.mx(lo), -M$.my(la)); ctx.drawImage(map, 0, 0); return z; };
  M$.end = ctx => ctx.restore();
  // dim(ctx, k, c='22,13,6') — darken the whole frame a little (screen space, works inside begin/end) so light reads
  M$.dim = function (ctx, k, c = '22,13,6') { if (k <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(${c},${.38 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); };
  // bands(ctx, top=V?360:190, bottom) — soft dark bands where words are read over the light parchment (screen space;
  // bottom: the y where the lower band starts, e.g. the subtitle safe line)
  M$.bands = function (ctx, top, bottom) { const V = Pilot.ori === 'v'; top = top ?? (V ? 360 : 190);
    const tg = ctx.createLinearGradient(0, 0, 0, top); tg.addColorStop(0, 'rgba(10,6,3,.78)'); tg.addColorStop(1, 'rgba(10,6,3,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, top);
    if (bottom != null) { const g = ctx.createLinearGradient(0, bottom, 0, H); g.addColorStop(0, 'rgba(10,6,3,0)'); g.addColorStop(V ? .32 : .3, V ? 'rgba(10,6,3,.86)' : 'rgba(10,6,3,.78)'); g.addColorStop(1, 'rgba(10,6,3,.94)'); ctx.fillStyle = g; ctx.fillRect(0, bottom, W, H - bottom); } };

  // ---------------- light and props (map pixels; z = the zoom from begin) ----------------
  M$.glow = function (ctx, x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgb(col, a)); g.addColorStop(.35, rgb(col, a * .35)); g.addColorStop(1, rgb(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  // cityLamp(ctx, p, k, z, t, seed) — a small lamp at a place that lights (k 0..1, may exceed 1 to burn brighter)
  M$.cityLamp = function (ctx, p, k, z, t, seed) { if (k <= 0) return; const [x, y] = M$.P(p), f = 1 + .12 * Math.sin(t * 5 + seed * 7);
    M$.glow(ctx, x, y, 30 / z * f, [255, 196, 90], .55 * k); ctx.fillStyle = `rgba(150,60,20,${k})`; ctx.beginPath(); ctx.arc(x, y, 4 / z, 0, 6.283); ctx.fill(); ctx.fillStyle = `rgba(255,236,170,${k})`; ctx.beginPath(); ctx.arc(x, y - 1 / z, 2 / z, 0, 6.283); ctx.fill(); };
  // label(ctx, text, p, a, o) — a place name written live (a city founded during the shot): a dot and the name in ink
  // with a parchment halo; o: size 38, dx -12, dy 34, al 'right', font
  M$.label = function (ctx, s, p, a, o = {}) {
    if (a <= 0 || !s) return; const [px, py] = M$.P(p), size = o.size || 38, MINK = M$.INK; ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(px, py, 6, 0, 6.283); ctx.fillStyle = MINK; ctx.fill(); ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 6.283); ctx.fillStyle = '#e9dcc0'; ctx.fill();
    ctx.font = `600 ${size}px ${o.font || M$.FONT}`; ctx.textAlign = o.al || 'right'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * .22; ctx.strokeStyle = 'rgba(236,224,198,.85)';
    ctx.strokeText(s, px + (o.dx ?? -12), py + (o.dy ?? 34)); ctx.fillStyle = MINK; ctx.fillText(s, px + (o.dx ?? -12), py + (o.dy ?? 34)); ctx.restore(); };
  // tinyScroll(ctx, x, y, s, a) — a little scroll drawn in ink (what a people carried with them)
  M$.tinyScroll = function (ctx, x, y, s, a) { if (a <= 0) return; const MINK = M$.INK; ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 1.6; ctx.strokeStyle = MINK;
    ctx.fillStyle = '#f1e2bd'; ctx.fillRect(x - s, y - s * .6, s * 2, s * 1.2); ctx.strokeRect(x - s, y - s * .6, s * 2, s * 1.2);
    ctx.fillStyle = '#7a5130'; for (const sx of [-1.2, .85]) { ctx.fillRect(x + s * sx, y - s * .8, s * .35, s * 1.6); ctx.strokeRect(x + s * sx, y - s * .8, s * .35, s * 1.6); }
    ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(x - s * .7, y - s * .25 + k * s * .25); ctx.lineTo(x + s * .6, y - s * .25 + k * s * .25); } ctx.lineWidth = .9; ctx.stroke(); ctx.restore(); };
  // inkShip(ctx, x, y, s, dir, a) — an ancient merchantman as an old map draws it (ink outline, hatched hull, one sail)
  M$.inkShip = function (ctx, x, y, s, dir, a) {
    if (a <= 0) return; const MINK = M$.INK; ctx.save(); ctx.globalAlpha = a * .9; ctx.translate(x, y); ctx.scale(dir * s / 40, s / 40); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = MINK;
    const hull = new Path2D('M -36 -4 Q 0 2 34 -6 Q 30 6 18 10 L -22 10 Q -32 6 -36 -4 Z'); ctx.fillStyle = 'rgba(236,224,198,.85)'; ctx.fill(hull);
    ctx.save(); ctx.clip(hull); ctx.lineWidth = 1; for (let k = -40; k < 40; k += 5) { ctx.beginPath(); ctx.moveTo(k, 12); ctx.lineTo(k + 10, -6); ctx.stroke(); } ctx.restore();
    ctx.lineWidth = 2; ctx.stroke(hull); ctx.beginPath(); ctx.moveTo(34, -6); ctx.quadraticCurveTo(40, -12, 36, -16); ctx.moveTo(-36, -4); ctx.quadraticCurveTo(-42, -10, -38, -14); ctx.stroke();
    ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(-2, -44); ctx.moveTo(-20, -40); ctx.lineTo(16, -40); ctx.stroke();
    const sail = new Path2D('M -19 -39 L 15 -39 Q 19 -24 15 -10 L -19 -10 Q -15 -24 -19 -39 Z'); ctx.fillStyle = 'rgba(240,230,206,.95)'; ctx.fill(sail); ctx.lineWidth = 1.4; ctx.stroke(sail);
    ctx.lineWidth = .8; ctx.beginPath(); for (const yy of [-31, -23, -16]) { ctx.moveTo(-16, yy); ctx.quadraticCurveTo(-2, yy + 3, 14, yy); } ctx.stroke();
    ctx.restore(); };

  // ---------------- route styles (each draws the first fraction p of pts; returns the head) ----------------
  // trail — a people on the move: dashed ink, a red dot at the head while it moves
  M$.trail = function (ctx, pts, p, z) { ctx.strokeStyle = M$.INK; ctx.lineWidth = 2.4 / z; ctx.setLineDash([7 / z, 6 / z]); ctx.lineCap = 'round'; const hd = M$.partial(ctx, pts, p); ctx.setLineDash([]);
    if (p < 1) { ctx.fillStyle = M$.RED; ctx.beginPath(); ctx.arc(hd[0], hd[1], 5 / z, 0, 6.283); ctx.fill(); } return hd; };
  // march — an army: a watercolour wash spreads where it has passed (wash = 'r,g,b', default bronze), red dashes on top
  M$.march = function (ctx, pts, p, z, wash = '196,122,58') {
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = 'blur(18px)'; ctx.strokeStyle = `rgba(${wash},.32)`; ctx.lineWidth = 230; M$.partial(ctx, pts, p); ctx.lineWidth = 120; ctx.strokeStyle = `rgba(${wash},.22)`; M$.partial(ctx, pts, p); ctx.restore();
    ctx.strokeStyle = M$.RED; ctx.lineWidth = 3.6 / z; ctx.setLineDash([12 / z, 8 / z]); const hd = M$.partial(ctx, pts, p); ctx.setLineDash([]);
    if (p > 0 && p < 1) { ctx.fillStyle = M$.RED; ctx.beginPath(); ctx.arc(hd[0], hd[1], 7 / z, 0, 6.283); ctx.fill(); } return hd; };
  // road — a built road: an ink casing with vermilion inside, an ink dot at the head while it is being laid
  M$.road = function (ctx, pts, p, z) { ctx.strokeStyle = M$.INK; ctx.lineWidth = 6.5 / z; M$.partial(ctx, pts, p); ctx.strokeStyle = M$.ROAD; ctx.lineWidth = 3.4 / z; const hd = M$.partial(ctx, pts, p);
    if (p < 1) { ctx.fillStyle = M$.INK; ctx.beginPath(); ctx.arc(hd[0], hd[1], 5 / z, 0, 6.283); ctx.fill(); } return hd; };
  // lane — a sea lane: fine blue dots (a = strength); put inkShip()s on it with pointAt
  M$.lane = function (ctx, pts, p, z, a = 1) { ctx.strokeStyle = `rgba(40,70,110,${.8 * a})`; ctx.lineWidth = 2.2 / z; ctx.setLineDash([3 / z, 7 / z]); const hd = M$.partial(ctx, pts, p); ctx.setLineDash([]); return hd; };
  // goldRoute — light travelling: a glowing gold line with a bright head
  M$.goldRoute = function (ctx, pts, p, z) { ctx.save(); ctx.shadowColor = 'rgba(255,200,90,.95)'; ctx.shadowBlur = 16; ctx.strokeStyle = '#f2c96a'; ctx.lineWidth = 5.5 / z; const hd = M$.partial(ctx, pts, p); ctx.restore();
    if (p < 1) { M$.glow(ctx, hd[0], hd[1], 34 / z, [255, 226, 150], 1); M$.glow(ctx, hd[0], hd[1], 8 / z, [255, 255, 240], 1); } return hd; };
  // lightRun — light running out along an existing line (a road): gold with a white core and a bright head
  M$.lightRun = function (ctx, pts, p, z) { ctx.save(); ctx.shadowColor = 'rgba(255,214,120,.95)'; ctx.shadowBlur = 14; ctx.strokeStyle = '#f6d27a'; ctx.lineWidth = 5 / z; M$.partial(ctx, pts, p); ctx.shadowBlur = 0; ctx.strokeStyle = '#fff6da'; ctx.lineWidth = 1.8 / z; const hd = M$.partial(ctx, pts, p); ctx.restore();
    if (p < 1) { M$.glow(ctx, hd[0], hd[1], 30 / z, [255, 230, 160], .9); M$.glow(ctx, hd[0], hd[1], 7 / z, [255, 255, 240], 1); } return hd; };

  // ---------------- the ancient Mediterranean and Near East (lon, lat; hand-traced and simplified: a stage, not a survey) ----------------
  M$.MED = {
    extent: [66, 4], seed: 12, compass: [55, 42], grid: { lon: [-10, 65], lat: [5, 60], step: 5 },
    seas: [
      // the Mediterranean, clockwise from Gibraltar
      [[-5.6, 36.0], [-4.4, 36.7], [-2.0, 36.7], [-0.5, 38.3], [0.2, 38.8], [-0.3, 39.5], [0.9, 41.0], [3.2, 41.9], [3.1, 43.0], [4.8, 43.4], [6.0, 43.1],
       [7.5, 43.8], [8.8, 44.4], [10.2, 43.9], [10.5, 42.9], [12.2, 41.7], [14.0, 40.8], [15.6, 40.1], [15.7, 38.2], [16.6, 38.4], [17.1, 39.0], [16.5, 39.7],
       [17.2, 40.5], [18.5, 40.1], [18.0, 40.6], [16.0, 41.4], [14.0, 42.6], [13.6, 43.5], [12.4, 44.2], [12.3, 45.3], [13.7, 45.7], [14.5, 45.2], [15.9, 43.6],
       [18.5, 42.4], [19.4, 41.8], [19.4, 40.3], [20.2, 39.5], [21.1, 38.3], [21.7, 36.8], [22.5, 36.4], [23.2, 36.4], [22.9, 37.5], [23.5, 38.0], [24.0, 38.2],
       [22.9, 39.4], [22.9, 40.5], [23.9, 40.6], [24.4, 40.9], [26.0, 40.8], [26.2, 40.3], [26.2, 39.5], [26.8, 38.8], [26.3, 38.3], [27.2, 37.9], [27.4, 37.0],
       [28.2, 36.7], [29.6, 36.2], [30.6, 36.8], [32.0, 36.5], [33.5, 36.2], [34.6, 36.8], [35.9, 36.8], [35.8, 35.8], [35.9, 34.6], [35.5, 33.9], [35.1, 33.0],
       [34.8, 32.1], [34.3, 31.3], [32.3, 31.3], [31.0, 31.6], [29.9, 31.2], [28.0, 31.1], [25.2, 31.6], [23.2, 32.2], [21.0, 32.8], [20.0, 32.0], [20.0, 31.0],
       [19.0, 30.3], [17.0, 31.0], [15.4, 32.3], [13.0, 32.9], [11.1, 33.2], [10.2, 34.3], [11.1, 35.2], [10.6, 36.4], [11.1, 37.0], [10.2, 37.2], [9.8, 37.3],
       [8.6, 36.9], [6.4, 37.1], [5.0, 36.8], [3.0, 36.8], [1.0, 36.5], [-1.0, 35.7], [-2.2, 35.2], [-3.9, 35.2], [-5.3, 35.9]],
      // the Black Sea, the Sea of Marmara
      [[28.0, 41.2], [29.1, 41.2], [31.4, 41.2], [33.5, 42.0], [35.2, 42.0], [37.0, 41.1], [39.7, 41.0], [41.5, 41.5], [41.6, 42.6], [40.0, 43.4], [38.0, 44.4],
       [36.6, 45.2], [35.0, 45.0], [33.6, 44.5], [32.5, 45.4], [33.6, 46.0], [31.7, 46.6], [30.7, 46.5], [29.6, 45.4], [28.6, 44.3], [27.9, 42.8]],
      [[26.2, 40.3], [26.7, 40.5], [27.5, 40.4], [29.0, 40.9], [29.1, 41.2], [28.0, 41.2], [27.0, 40.9], [26.0, 40.8]],
      // the Red Sea with the gulfs of Suez and Aqaba
      [[32.6, 29.9], [33.4, 28.2], [34.3, 27.7], [34.9, 29.5], [34.7, 28.2], [35.6, 26.9], [36.9, 25.0], [38.2, 22.5], [39.4, 20.0], [41.5, 14.0],
       [43.3, 12.6], [42.6, 14.5], [41.2, 17.0], [39.0, 21.3], [37.2, 24.5], [35.5, 26.8], [33.9, 27.6], [32.6, 29.5]],
      // the Persian Gulf
      [[48.0, 30.0], [50.0, 30.0], [51.5, 27.8], [54.0, 26.6], [56.3, 27.2], [56.4, 26.2], [54.0, 24.2], [52.0, 24.0], [51.5, 25.5], [50.8, 24.8], [50.1, 26.5],
       [49.0, 27.5], [48.0, 29.0]],
      // the Caspian
      [[47.0, 44.5], [49.0, 46.5], [52.5, 46.5], [53.0, 45.0], [51.3, 44.5], [52.7, 42.5], [53.0, 40.5], [54.0, 37.4], [51.5, 36.8], [49.0, 37.6], [49.4, 40.2],
       [48.6, 41.8], [47.5, 43.0]],
      // the Atlantic, off the left edge
      [[-20, 62], [-4.6, 62], [-4.6, 48.5], [-1.2, 46.2], [-1.8, 43.4], [-8.0, 43.7], [-9.3, 42.9], [-8.8, 41.2], [-9.5, 38.8], [-8.8, 37.0], [-6.4, 36.8],
       [-5.6, 36.0], [-5.9, 35.8], [-6.8, 34.0], [-9.6, 30.4], [-16, 22], [-20, 0]],
      // the Arabian Sea, off the bottom right
      [[43.3, 12.6], [45.0, 13.0], [48.5, 14.0], [52.2, 16.0], [55.5, 17.8], [57.8, 19.0], [59.8, 22.4], [58.0, 23.7], [56.4, 26.2], [57.3, 25.8],
       [61.6, 25.2], [66.0, 25.0], [80, 20], [80, 0], [43.3, 0]],
    ],
    islands: [
      [[12.4, 38.0], [13.4, 38.2], [15.6, 38.3], [15.1, 37.4], [15.1, 36.7], [14.3, 37.0], [12.5, 37.6]],          // Sicily
      [[8.4, 39.0], [9.6, 39.1], [9.8, 40.9], [9.2, 41.3], [8.2, 40.9], [8.4, 39.9]],                             // Sardinia
      [[8.6, 41.4], [9.4, 41.4], [9.5, 42.8], [8.7, 42.6]],                                                       // Corsica
      [[23.5, 35.3], [24.3, 35.6], [26.3, 35.3], [25.8, 35.0], [24.7, 35.1], [23.6, 35.2]],                      // Crete
      [[32.3, 34.8], [33.0, 34.6], [34.0, 35.0], [34.6, 35.7], [33.0, 35.4], [32.3, 35.1]],                      // Cyprus
      [[26.0, 38.1], [26.6, 38.2], [26.4, 39.1], [25.9, 39.0]], [[24.3, 37.6], [25.0, 37.8], [24.7, 38.0]],    // a few Aegean islands
      [[26.6, 36.5], [27.2, 36.8], [27.0, 37.1]], [[28.0, 36.1], [28.2, 36.5], [27.7, 36.2]],
    ],
    // the Nile (and its Delta branch), the Euphrates, the Tigris, the Jordan
    rivers: [
      [[[32.9, 22], [32.6, 25], [32.7, 26.2], [31.2, 27.6], [30.9, 28.8], [31.2, 30.1], [30.6, 31.0], [30.4, 31.45]], 2.6, 21], [[[31.2, 30.1], [31.6, 30.9], [31.8, 31.45]], 2, 22],
      [[[38.5, 38.8], [39.7, 37.2], [40.4, 35.6], [41.6, 34.5], [43.4, 33.3], [44.4, 32.5], [45.8, 31.4], [47.5, 30.6]], 2.4, 23],
      [[[40.5, 38.2], [42.6, 37.1], [43.1, 36.3], [44.1, 34.6], [44.6, 33.1], [46.2, 31.8], [47.5, 30.6], [48.5, 29.9]], 2.4, 24], [[[35.6, 33.0], [35.55, 32.4], [35.55, 31.8]], 1.6, 25],
    ],
    // Taurus, Zagros, Alps, Balkans, Lebanon, Atlas, Apennines, Caucasus, Sinai, Armenian highlands
    ranges: [[30, 38.5, 36.8, 38.2, 46, 9, 15], [44, 53, 29.5, 35.5, 52, 9, 15], [6, 14, 45.2, 47, 34, 9, 14], [19.5, 24.5, 40.6, 43, 26, 8, 13], [35.6, 36.6, 33.2, 34.6, 10, 8, 12],
      [-5, 9, 31.5, 35.2, 34, 8, 13], [11.5, 16, 40.2, 44, 22, 7, 11], [40, 48, 41.8, 43.6, 24, 9, 14], [33.5, 35.5, 27.6, 29.4, 12, 8, 12], [36, 44, 37.5, 39, 20, 8, 12]],
    desert: { lon: [-10, 60], lat: [14, 33], n: 7000 },
    city: {
      jerusalem: [35.2, 31.8], babylon: [44.4, 32.5], susa: [48.3, 32.2], persepolis: [52.9, 29.9], sardis: [28.0, 38.5], alexandria: [29.9, 31.2],
      antioch: [36.2, 36.2], seleucia_p: [35.93, 36.12], athens: [23.7, 38.0], rome: [12.5, 41.9], corinth: [22.9, 37.9], ephesus: [27.3, 37.9], thessalonica: [22.9, 40.6],
      philippi: [24.3, 41.0], damascus: [36.3, 33.5], tarsus: [34.9, 36.9], pella: [22.5, 40.8], carthage: [10.3, 36.9], cyrene: [21.9, 32.8],
      brundisium: [17.9, 40.6], dyrrachium: [19.4, 41.3], byzantium: [29.0, 41.0], memphis: [31.2, 29.8], elephantine: [32.9, 24.1], ecbatana: [48.5, 34.8],
      caesarea: [34.9, 32.5], puteoli: [14.1, 40.8], syracuse: [15.3, 37.1], massilia: [5.4, 43.3], capua: [14.2, 41.1], ancyra: [32.9, 39.9],
      pisidian: [31.2, 38.3], iconium: [32.5, 37.9], troas: [26.2, 39.8], nazareth: [35.3, 32.7], bethlehem: [35.2, 31.7], tyre: [35.2, 33.3],
      gaza: [34.45, 31.5], issus: [36.2, 36.8], gaugamela: [43.4, 36.4], hellespont: [26.4, 40.2], gades: [-6.3, 36.5], tarraco: [1.2, 41.1],
      salamis: [33.9, 35.2], seleucia: [44.5, 33.1], ctesiphon: [44.6, 33.1], petra: [35.4, 30.3], aquileia: [13.4, 45.8], lugdunum: [4.8, 45.8],
      // patriarchs, exodus, judges, kings, exile (approximate; where scholars differ, the traditional site)
      ur: [46.1, 30.96], haran: [39.03, 36.86], shechem: [35.28, 32.21], bethel: [35.22, 31.93], hebron: [35.1, 31.53], beersheba: [34.79, 31.25],
      goshen: [31.8, 30.6], sinai: [33.97, 28.54], kadesh: [34.42, 30.65], jericho: [35.44, 31.86], nineveh: [43.15, 36.36], samaria: [35.19, 32.28],
      moab: [35.7, 31.4], shiloh: [35.29, 32.06], capernaum: [35.57, 32.88], patmos: [26.55, 37.31],
    },
    // example routes, all historical lines (pick what a story needs; they are not drawn unless a scene draws them)
    routes: {
      // Roman roads (the great trunk lines only)
      roads: [['rome', 'capua', 'brundisium'], ['dyrrachium', 'thessalonica', 'philippi', 'byzantium'], ['byzantium', 'ancyra', 'tarsus', 'antioch'],
        ['troas', 'ephesus', 'sardis', 'pisidian', 'iconium', 'tarsus'], ['antioch', 'damascus', 'caesarea', 'jerusalem'], ['caesarea', 'gaza', 'alexandria'], ['damascus', 'petra'],
        ['alexandria', 'cyrene', 'carthage'], ['rome', 'massilia', 'tarraco', [-1, 38.5], 'gades'], ['rome', 'aquileia'], ['massilia', 'lugdunum', [3, 49]], ['antioch', 'seleucia'], ['thessalonica', 'athens', 'corinth']],
      // sea lanes of the Roman peace
      lanes: [['alexandria', 'puteoli'], ['brundisium', 'dyrrachium'], ['corinth', 'puteoli'], ['ephesus', 'corinth'], ['caesarea', 'salamis', 'antioch'],
        ['carthage', 'syracuse', 'puteoli'], ['alexandria', 'caesarea'], ['troas', 'philippi']],
      // Paul's journeys (Acts 13–14, 15:36–18:22, 18:23–21:17) and the voyage to Rome (Acts 27–28), simplified
      paul: [['antioch', 'seleucia_p', 'salamis', [32.4, 34.75], [30.85, 36.96], 'pisidian', 'iconium', [32.35, 37.6], [33.4, 37.35], 'tarsus', 'antioch'],
        ['antioch', 'tarsus', [33.4, 37.35], [32.35, 37.6], 'iconium', 'pisidian', 'troas', 'philippi', 'thessalonica', [22.2, 40.5], 'athens', 'corinth', 'ephesus', 'caesarea', 'jerusalem'],
        ['caesarea', [35.37, 33.56], [29.98, 36.26], [24.8, 34.93], [14.4, 35.9], 'syracuse', [15.65, 38.1], 'puteoli', 'rome']],
      // Alexander, 334–323 BC
      alexander: ['pella', 'hellespont', 'sardis', 'issus', 'tyre', 'gaza', 'memphis', 'alexandria', 'memphis', 'tyre', 'gaugamela', 'babylon', 'susa', 'persepolis', [60, 33]],
      // Abraham (Gen 11:31–12:10), along the Fertile Crescent
      abraham: ['ur', [45.2, 31.9], 'babylon', [42.0, 34.4], [40.2, 35.6], 'haran', [37.5, 36.4], [36.6, 34.8], 'damascus', 'shechem', 'bethel', 'hebron', 'beersheba'],
    },
  };

  window.InkMap = M$;
})();
