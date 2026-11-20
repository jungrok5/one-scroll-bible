// shatter-core.js — vendored from the owner's motion-skills repo, skill shatter-page, file shatter-page/lib/shatter.js
// (github.com/jungrok5/motion-skills, origin/main @ 2b490bcf419e0c87ebaceafb37279e3a2fa631db, sections 2 polygons ·
// 3 fracture · 4 simulation + tape, plus the glass material preset and HIC.rng). Only the pure parts are taken: no HIC
// (HTML-in-Canvas), no renderer, no page wiring — 「kingdom」 B2 renders the shards in its own three.js scene (glass-shatter.js).
// Changes from the source (marked "B2:"): ES module exports; HIC.rng inlined as rngOf; the contact planes come from
// o.planes and each plane may carry a region test (a window ledge, the wall below a sill) instead of the fixed floor + wall;
// a piece records its parent (child.parent) so a group can be rewound on its own clock.
// B3 (opt-in, B2 runs unchanged): o.capsules — round bars and columns {a, b, r} the plates collide with (corners + points
// along every edge are tested, so a bar cannot slip through the middle of an edge); o.stack — a plate that comes to rest on a
// lifted plane (floor, ledge) becomes a support: its top face (footprint in x-z + the plane of the face) is remembered, and a
// moving plate's corner and edge points that sink into a support's top are pushed out along its normal, like the floor — so a
// plate lands on a pile and lies on it (tilted where it bridges), glass on glass, never glass through glass.
const TAU = Math.PI * 2;
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function mix(a, b, t) { return a + (b - a) * t; }
// B2: HIC.rng (mulberry32) from shatter-page/lib/hic.js
export function rngOf(seed) { let s = seed >>> 0; return function () { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const HIC = { rng: rngOf };
export const GLASS = {
  thickness: 0.006,
  crack: { rays: 14, rayJitter: 0.5, rings: 5, ringGrow: 1.7, crush: 0.05, ringJitter: 0.22, ringSkip: 0.25, cleave: 0.035, crumble: 0.55, minArea: 3e-5 },
  physics: { density: 2500, bounce: 0.22, friction: 0.45, spin: 1, throw: 1, air: 1, breakSpeed: 0 },
};
  // =================================================================== 2. polygons (convex, CCW, [[x,y],…])
  function area(P) { var a = 0; for (var i = 0, j = P.length - 1; i < P.length; j = i++) a += P[j][0] * P[i][1] - P[i][0] * P[j][1]; return a / 2; }
  function centroid(P) {
    var a = 0, cx = 0, cy = 0, ox = P[0][0], oy = P[0][1];
    for (var i = 0, j = P.length - 1; i < P.length; j = i++) {
      var x0 = P[j][0] - ox, y0 = P[j][1] - oy, x1 = P[i][0] - ox, y1 = P[i][1] - oy, c = x0 * y1 - x1 * y0;
      a += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c;
    }
    return Math.abs(a) < 1e-14 ? [ox, oy] : [ox + cx / (3 * a), oy + cy / (3 * a)];
  }
  function perim(P) { var s = 0; for (var i = 0, j = P.length - 1; i < P.length; j = i++) s += Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); return s; }
  // keep the part of P where nx*x + ny*y <= c (Sutherland–Hodgman against one line)
  function clip(P, nx, ny, c) {
    var out = [], n = P.length;
    if (!n) return out;
    var s = P[n - 1], ds = nx * s[0] + ny * s[1] - c;
    for (var i = 0; i < n; i++) {
      var e = P[i], de = nx * e[0] + ny * e[1] - c;
      if (de <= 0) { if (ds > 0) out.push(cut(s, e, ds, de)); out.push(e); }
      else if (ds <= 0) out.push(cut(s, e, ds, de));
      s = e; ds = de;
    }
    var res = [];
    for (var k = 0; k < out.length; k++) { var q = res[res.length - 1]; if (!q || Math.abs(q[0] - out[k][0]) + Math.abs(q[1] - out[k][1]) > 1e-9) res.push(out[k]); }
    if (res.length > 1 && Math.abs(res[0][0] - res[res.length - 1][0]) + Math.abs(res[0][1] - res[res.length - 1][1]) < 1e-9) res.pop();
    return res.length >= 3 ? res : [];
  }
  function cut(s, e, ds, de) { var u = ds / (ds - de); return [s[0] + u * (e[0] - s[0]), s[1] + u * (e[1] - s[1])]; }
  function inside(P, x, y) { for (var i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][0] - P[j][0]) * (y - P[j][1]) - (P[i][1] - P[j][1]) * (x - P[j][0]) < -1e-12) return false; return true; }
  function convex(P) { for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length], c = P[(i + 2) % P.length]; if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) < -1e-10) return false; } return true; }
  // the outline of the pane in pane metres (origin at its centre, y up)
  function outline(shape, W, H, corner, PW, PH) {
    var P = [], i, k = W / PW;
    if (Array.isArray(shape)) return shape.map(function (p) { return [(p[0] - PW / 2) * k, (PH / 2 - p[1]) * k]; });
    if (shape === 'disc') { var r = Math.min(W, H) / 2; for (i = 0; i < 56; i++) P.push([r * Math.cos(i / 56 * TAU), r * Math.sin(i / 56 * TAU)]); return P; }
    if (shape === 'rounded') {
      var rc = Math.min(corner, W / 2, H / 2), cs = [[W / 2 - rc, -H / 2 + rc, -0.25], [W / 2 - rc, H / 2 - rc, 0], [-W / 2 + rc, H / 2 - rc, 0.25], [-W / 2 + rc, -H / 2 + rc, 0.5]];
      cs.forEach(function (c) { for (var j = 0; j <= 5; j++) { var a = (c[2] + j / 5 * 0.25) * TAU; P.push([c[0] + rc * Math.cos(a), c[1] + rc * Math.sin(a)]); } });
      return P;
    }
    return [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]];
  }
  // =================================================================== 3. fracture
  // fracture(P, q, s, crack, rng, ref) → { cells: [convex polys], lost: area that became dust, rays: [angles], r0 }
  // Rays leave the impact point q; every sector between two rays is cut by its own ring chords (jittered per sector, so
  // rings read as broken, stepped arcs); the innermost cells are the crushed zone and crumble further; long daggers are
  // cleaved along or across their length. Every cell is P ∩ half-planes, so the cells partition P exactly.
  function fracture(P, q, s, C, rng, ref) {
    var A = Math.abs(area(P)), size = Math.sqrt(A), R = 0, i, k;
    for (i = 0; i < P.length; i++) R = Math.max(R, Math.hypot(P[i][0] - q[0], P[i][1] - q[1]));
    var scale = clamp(size / ref, 0.35, 1.3);
    var N = Math.max(3, Math.round(C.rays * (0.55 + 0.45 * s) * (0.55 + 0.45 * scale)));
    var base = rng() * TAU, th = [];
    for (i = 0; i < N; i++) th.push(base + (i + (rng() - 0.5) * C.rayJitter) * TAU / N);
    th.sort(function (a, b) { return a - b; });
    for (var guard = 0; guard < 6; guard++) { // no sector wider than ~130°, so every wedge stays convex
      var add = false;
      for (i = 0; i < th.length; i++) { var nx = i + 1 < th.length ? th[i + 1] : th[0] + TAU; if (nx - th[i] > 2.3) { th.splice(i + 1, 0, (th[i] + nx) / 2); add = true; i++; } }
      if (!add) break;
    }
    var r0 = C.crush * Math.max(size, ref * 0.5) * (0.6 + 0.6 * s), radii = [], r = r0;
    for (k = 0; k < 24 && r < R * 0.97 && radii.length < C.rings + 1; k++) { radii.push(r); r *= C.ringGrow * (0.85 + 0.3 * rng()); }
    var cells = [], lost = 0;
    function keep(cell, band, dir) { if (cell.length >= 3) cells.push({ p: cell, band: band, dir: dir }); }
    for (i = 0; i < th.length; i++) {
      var a = th[i], b = i + 1 < th.length ? th[i + 1] : th[0] + TAU;
      var da = [Math.cos(a), Math.sin(a)], db = [Math.cos(b), Math.sin(b)];
      var W = clip(P, da[1], -da[0], da[1] * q[0] - da[0] * q[1]);          // left of ray a
      W = clip(W, -db[1], db[0], -db[1] * q[0] + db[0] * q[1]);              // right of ray b
      if (W.length < 3) continue;
      var rest = W, pa = 0, pb = 0, band = 0, mid = (a + b) / 2;
      for (k = 0; k < radii.length; k++) {
        if (k > 0 && rng() < C.ringSkip) continue;
        var ra = radii[k] * (1 + (rng() - 0.5) * 2 * C.ringJitter), rb = radii[k] * (1 + (rng() - 0.5) * 2 * C.ringJitter);
        if (ra < pa * 1.12) ra = pa * 1.12 + 1e-4; if (rb < pb * 1.12) rb = pb * 1.12 + 1e-4;
        var Ax = q[0] + ra * da[0], Ay = q[1] + ra * da[1], Bx = q[0] + rb * db[0], By = q[1] + rb * db[1];
        var cnx = By - Ay, cny = Ax - Bx;                                        // chord normal, pointing away from q
        if (cnx * (q[0] - Ax) + cny * (q[1] - Ay) > 0) { cnx = -cnx; cny = -cny; }
        var cc = cnx * Ax + cny * Ay;
        keep(clip(rest, cnx, cny, cc), band++, mid);
        rest = clip(rest, -cnx, -cny, -cc);
        pa = ra; pb = rb;
        if (!rest.length) break;
      }
      keep(rest, band, mid);
    }
    // crumble the crushed zone, cleave long daggers
    var out = [], maxA = C.cleave * ref * ref;
    function split(cell, ang) {
      var c = centroid(cell), nx = Math.cos(ang), ny = Math.sin(ang), cc = nx * c[0] + ny * c[1];
      return [clip(cell, nx, ny, cc), clip(cell, -nx, -ny, -cc)];
    }
    function push(cell, depth, dir, band) {
      if (cell.length < 3) return;
      var ar = Math.abs(area(cell));
      if (ar > maxA && depth < 3) {
        var along = rng() < 0.6;                                                // along the dagger, or across it
        var sp = split(cell, dir + (along ? Math.PI / 2 : 0) + (rng() - 0.5) * 0.5);
        push(sp[0], depth + 1, dir, band); push(sp[1], depth + 1, dir, band); return;
      }
      if (band === 0 && depth === 0 && ar > 8 * C.minArea && rng() < C.crumble) {
        var s2 = split(cell, rng() * Math.PI);
        push(s2[0], 3, dir, band); push(s2[1], 3, dir, band); return;
      }
      var pe = perim(cell);
      if (ar < C.minArea || ar < 0.012 * pe * pe) { lost += ar; return; }  // slivers and crumbs turn to dust
      out.push(cell);
    }
    cells.forEach(function (c) { push(c.p, 0, c.dir, c.band); });
    return { cells: out, lost: lost, rays: th, r0: r0 };
  }
  // =================================================================== 4. simulation + tape
  // Thin rigid plates (and one kind of ball) under gravity and air, colliding with the floor and the back wall (not with
  // each other: a resting piece lies a hair above the floor by its id, so piles read without contact solving). Fixed
  // step H; a tape frame every KEY steps holds every body's full state, so any moment can be shown (poseAt) and the
  // simulation can resume from it (truncate).
  var H = 1 / 240, KEY = 6, STATE = 14, G = 9.81, SLOP = 0.0006;
  function quatMat(q) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    return [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)];
  }
  function axisQuat(ax, ay, az, ang) { var l = Math.hypot(ax, ay, az) || 1, s = Math.sin(ang / 2) / l; return [ax * s, ay * s, az * s, Math.cos(ang / 2)]; }
  function qmul(a, b) { return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]; }
  function rot(R, x, y, z) { return [R[0] * x + R[3] * y + R[6] * z, R[1] * x + R[4] * y + R[7] * z, R[2] * x + R[5] * y + R[8] * z]; }
  function rotT(R, v) { return [R[0] * v[0] + R[1] * v[1] + R[2] * v[2], R[3] * v[0] + R[4] * v[1] + R[5] * v[2], R[6] * v[0] + R[7] * v[1] + R[8] * v[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

  function Sim(o) {
    var M = o.material, P = M.physics, th = M.thickness, rng = HIC.rng(o.seed), sim = this;
    var bodies = [], frames = [], events = [], breaks = [];
    var time = 0, steps = 0, idle = true, refSize = o.refSize;
    sim.bodies = bodies; sim.frames = frames; sim.events = events;
    var caps = o.capsules || [], stack = !!o.stack, restGrid = new Map(), RG = .5;   // B3
    var capFace = !!o.capFace;   // B3b (2026-11-20, opt-in): bars also collide with the face of a plate, not only its edge points
    var planes = o.planes || [{ n: [0, 1, 0], d: 0, lift: 1 }, { n: [0, 0, 1], d: o.wallZ }];   // B2: planes from o.planes, each may carry region(x, y, z) and maxDepth

    function inertia(poly, m, ar) { // second moments of the polygon about its centroid (axes in the plane), plus thickness
      var ix = 0, iy = 0;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var x0 = poly[j][0], y0 = poly[j][1], x1 = poly[i][0], y1 = poly[i][1], c = x0 * y1 - x1 * y0;
        ix += c * (y0 * y0 + y0 * y1 + y1 * y1); iy += c * (x0 * x0 + x0 * x1 + x1 * x1);
      }
      var rho = m / Math.max(ar, 1e-9); ix = Math.abs(ix) / 12 * rho; iy = Math.abs(iy) / 12 * rho;
      var t2 = m * th * th / 12;
      return [1 / (ix + t2), 1 / (iy + t2), 1 / (ix + iy)];
    }
    // a shard from a pane-space polygon; pose: world position of its centroid, orientation of the pane frame
    function addShard(poly, pos, q, gen) {
      var c = centroid(poly), ar = Math.abs(area(poly)), m = Math.max(1e-5, ar * th * P.density), loc = [], rad = 0;
      for (var i = 0; i < poly.length; i++) { loc.push([poly[i][0] - c[0], poly[i][1] - c[1]]); rad = Math.max(rad, Math.hypot(loc[i][0], loc[i][1])); }
      var b = { id: bodies.length, kind: 'shard', poly: poly, c: c, loc: loc, area: ar, m: m, inv: inertia(loc, m, ar), rad: rad, gen: gen || 0,
        born: time, died: Infinity, p: pos.slice(), q: q.slice(), v: [0, 0, 0], w: [0, 0, 0], awake: 1, calm: 0, held: 0, release: 0, life: 0,
        lift: 0.0004 + (bodies.length % 9) * 0.00045, pp: pos.slice(), pq: q.slice() };
      bodies.push(b);
      return b;
    }
    function addBall(pos, vel, r, mass) {
      var b = { id: bodies.length, kind: 'ball', r: r, m: mass, inv: [0, 0, 0], area: 0, born: time, died: Infinity, p: pos.slice(), q: [0, 0, 0, 1], v: vel.slice(), w: [0, 0, 0],
        awake: 1, calm: 0, held: 0, release: 0, life: 0, lift: 0, pp: pos.slice(), pq: [0, 0, 0, 1] };
      bodies.push(b); return b;
    }
    sim.addShard = addShard; sim.addBall = addBall;
    sim.alive = function (b, t) { return b.born <= t && t < b.died; };

    function record() {
      var n = bodies.length, d = new Float32Array(n * STATE);
      for (var i = 0; i < n; i++) {
        var b = bodies[i], o2 = i * STATE;
        d[o2] = b.p[0]; d[o2 + 1] = b.p[1]; d[o2 + 2] = b.p[2]; d[o2 + 3] = b.q[0]; d[o2 + 4] = b.q[1]; d[o2 + 5] = b.q[2]; d[o2 + 6] = b.q[3];
        d[o2 + 7] = b.v[0]; d[o2 + 8] = b.v[1]; d[o2 + 9] = b.v[2]; d[o2 + 10] = b.w[0]; d[o2 + 11] = b.w[1]; d[o2 + 12] = b.w[2];
        d[o2 + 13] = b.awake + (b.held ? 2 : 0);
      }
      if (frames.length && frames[frames.length - 1].t === time) frames[frames.length - 1] = { t: time, n: n, d: d };
      else frames.push({ t: time, n: n, d: d });
    }
    sim.record = record;

    // world inverse inertia times x
    function iw(b, R, x) { var y = rotT(R, x); return rot(R, y[0] * b.inv[0], y[1] * b.inv[1], y[2] * b.inv[2]); }
    function impulseAt(b, R, r, n, j) {
      b.v[0] += n[0] * j / b.m; b.v[1] += n[1] * j / b.m; b.v[2] += n[2] * j / b.m;
      if (b.kind === 'shard') { var dw = iw(b, R, cross(r, [n[0] * j, n[1] * j, n[2] * j])); b.w[0] += dw[0]; b.w[1] += dw[1]; b.w[2] += dw[2]; }
    }
    // B3: sample points of a plate (pane-local): its corners and points along each edge every ~0.1 m
    function samples(b) { if (b.samp) return b.samp; var s = [], n = b.loc.length;
      for (var i = 0; i < n; i++) { var a = b.loc[i], c = b.loc[(i + 1) % n], L = Math.hypot(c[0] - a[0], c[1] - a[1]), m = Math.max(1, Math.ceil(L / .1));
        for (var j = 0; j < m; j++) s.push([a[0] + (c[0] - a[0]) * j / m, a[1] + (c[1] - a[1]) * j / m]); }
      return (b.samp = s); }
    // B3b (o.capFace): denser edge points for the bars (every 2 cm < a bar's 8.4 cm) and a point-in-plate test for the face contact
    function samplesC(b) { if (b.sampC) return b.sampC; var s = [], n = b.loc.length;
      for (var i = 0; i < n; i++) { var a = b.loc[i], c = b.loc[(i + 1) % n], L = Math.hypot(c[0] - a[0], c[1] - a[1]), m = Math.max(1, Math.ceil(L / .02));
        for (var j = 0; j < m; j++) s.push([a[0] + (c[0] - a[0]) * j / m, a[1] + (c[1] - a[1]) * j / m]); }
      return (b.sampC = s); }
    function edgeDist(P, x, y) { var m = 1e9; for (var i = 0, j = P.length - 1; i < P.length; j = i++) { var ex = P[i][0] - P[j][0], ey = P[i][1] - P[j][1], l2 = ex * ex + ey * ey, u = l2 > 0 ? clamp(((x - P[j][0]) * ex + (y - P[j][1]) * ey) / l2, 0, 1) : 0; m = Math.min(m, Math.hypot(x - P[j][0] - ex * u, y - P[j][1] - ey * u)); } return m; }
    function inLoc(P, x, y) { var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > y) !== (P[j][1] > y) && x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; }
    function segDist(p, A, B) { var ab = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], ap = [p[0] - A[0], p[1] - A[1], p[2] - A[2]], l2 = dot(ab, ab), t = l2 > 0 ? clamp(dot(ap, ab) / l2, 0, 1) : 0;
      var c = [A[0] + ab[0] * t, A[1] + ab[1] * t, A[2] + ab[2] * t]; return [p[0] - c[0], p[1] - c[1], p[2] - c[2]]; }
    // B3: the footprint of a resting plate on its plane (convex hull of its corners in x-z) and the stacking query
    function hullXZ(pts) { pts.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }); var cr = function (o2, a, b) { return (a[0] - o2[0]) * (b[1] - o2[1]) - (a[1] - o2[1]) * (b[0] - o2[0]); }, lo = [], up = [], i;
      for (i = 0; i < pts.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
      for (i = pts.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], pts[i]) <= 0) up.pop(); up.push(pts[i]); }
      lo.pop(); up.pop(); return lo.concat(up); }
    function footprint(b) { var R = quatMat(b.q), pts = []; for (var i = 0; i < b.loc.length; i++) { var r = rot(R, b.loc[i][0], b.loc[i][1], 0); pts.push([b.p[0] + r[0], b.p[2] + r[2]]); } return hullXZ(pts); }
    function overlap(A, B) { var P2 = [A, B]; for (var s2 = 0; s2 < 2; s2++) { var Q = P2[s2]; for (var i = 0; i < Q.length; i++) { var a = Q[i], c = Q[(i + 1) % Q.length], nx = c[1] - a[1], nz = a[0] - c[0], nl = Math.hypot(nx, nz); if (nl < 1e-6) continue; nx /= nl; nz /= nl;
          var mn1 = 1e9, mx1 = -1e9, mn2 = 1e9, mx2 = -1e9, k; for (k = 0; k < A.length; k++) { var d1 = A[k][0] * nx + A[k][1] * nz; mn1 = Math.min(mn1, d1); mx1 = Math.max(mx1, d1); }
          for (k = 0; k < B.length; k++) { var d2 = B[k][0] * nx + B[k][1] * nz; mn2 = Math.min(mn2, d2); mx2 = Math.max(mx2, d2); } if (mx1 < mn2 + 1e-4 || mx2 < mn1 + 1e-4) return false; } } return true; }
    function gridKeys(fp) { var x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; fp.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); });
      var ks = []; for (var gx = Math.floor(x0 / RG); gx <= Math.floor(x1 / RG); gx++) for (var gz = Math.floor(z0 / RG); gz <= Math.floor(z1 / RG); gz++) ks.push(gx * 100003 + gz); return ks; }
    function restOn(b, pl) { var R = quatMat(b.q), nn = [R[6], R[7], R[8]]; if (nn[1] < 0) nn = [-nn[0], -nn[1], -nn[2]];
      if (nn[1] < .35) return;                                                         // standing on edge: not a support
      var fp = footprint(b), c0 = [b.p[0] + nn[0] * th / 2, b.p[1] + nn[1] * th / 2, b.p[2] + nn[2] * th / 2];
      var ym = -1e9; for (var i = 0; i < b.loc.length; i++) { var r = rot(R, b.loc[i][0], b.loc[i][1], 0); ym = Math.max(ym, b.p[1] + r[1] + th); }
      var e = { id: b.id, pl: pl, fp: fp, nn: nn, c0: c0, cx: b.p[0], cz: b.p[2], r: b.rad, ymax: ym }; gridKeys(fp).forEach(function (k) { var a = restGrid.get(k); if (!a) restGrid.set(k, a = []); a.push(e); }); b.rest = e; restVer++; }
    function inPoly(fp, x, z) { for (var i = 0, j = fp.length - 1; i < fp.length; j = i++) if ((fp[i][0] - fp[j][0]) * (z - fp[j][1]) - (fp[i][1] - fp[j][1]) * (x - fp[j][0]) < 0) return false; return true; }
    var markA = [], stamp = 0, restVer = 0;
    function supports(b) { if (b.sup && steps - b.supT < 8) return b.sup; stamp++; var out = [], x0 = b.p[0] - b.rad, x1 = b.p[0] + b.rad, z0 = b.p[2] - b.rad, z1 = b.p[2] + b.rad;
      for (var gx = Math.floor(x0 / RG); gx <= Math.floor(x1 / RG); gx++) for (var gz = Math.floor(z0 / RG); gz <= Math.floor(z1 / RG); gz++) { var a = restGrid.get(gx * 100003 + gz); if (!a) continue;
        for (var i = 0; i < a.length; i++) { var e = a[i], o2 = bodies[e.id]; if (markA[e.id] === stamp || e.id === b.id || o2.awake || o2.died !== Infinity || o2.rest !== e) continue; markA[e.id] = stamp;
          if (b.p[1] - b.rad < e.ymax + .3 && Math.hypot(e.cx - b.p[0], e.cz - b.p[2]) < e.r + b.rad + .3) out.push(e); } }
      b.sup = out; b.supT = steps; b.supV = restVer; return out; }
    function stepBody(b) {
      b.pp[0] = b.p[0]; b.pp[1] = b.p[1]; b.pp[2] = b.p[2]; b.pq[0] = b.q[0]; b.pq[1] = b.q[1]; b.pq[2] = b.q[2]; b.pq[3] = b.q[3];
      if (!b.awake) return;
      if (b.held) { if (b.release > 0 && time >= b.release) b.held = 0; else return; }
      b.life += H;
      var R = quatMat(b.q), i, k;
      if (stack && b.kind === 'shard' && (steps + b.id) % 6 === 0) for (var sp0 = 0; sp0 < planes.length; sp0++) { var P0 = planes[sp0]; if (!P0.lift) continue;   // B3: which lifted plane it is over
        var hgt = dot(P0.n, b.p) - P0.d; if (hgt < b.rad + .6 && hgt > -.2 && (!P0.region || P0.region(b.p[0], b.p[1], b.p[2]))) b.onPl = sp0; }
      // gravity, air: drag across the plate (with a centre of pressure ahead of the centroid, so big flat pieces glide
      // and tumble a little) plus plain damping
      b.v[1] -= G * H;
      if (b.kind === 'shard') {
        var n = [R[6], R[7], R[8]], vn = dot(b.v, n), f = -0.72 * P.air * b.area * vn * Math.abs(vn) / b.m * H;
        b.v[0] += n[0] * f; b.v[1] += n[1] * f; b.v[2] += n[2] * f;
        var vin = [b.v[0] - n[0] * vn, b.v[1] - n[1] * vn, b.v[2] - n[2] * vn], vl = Math.hypot(vin[0], vin[1], vin[2]);
        if (vl > 0.05) { var rc = [vin[0] / vl * b.rad * 0.25, vin[1] / vl * b.rad * 0.25, vin[2] / vl * b.rad * 0.25], tq = iw(b, R, cross(rc, [n[0] * f * b.m, n[1] * f * b.m, n[2] * f * b.m])); b.w[0] += tq[0]; b.w[1] += tq[1]; b.w[2] += tq[2]; }
        var ad = Math.exp(-0.35 * H); b.w[0] *= ad; b.w[1] *= ad; b.w[2] *= ad;
      }
      var ld = Math.exp(-0.04 * H); b.v[0] *= ld; b.v[1] *= ld; b.v[2] *= ld;
      // contacts with the floor and the wall
      var touching = false, hit = 0, hitAt = null, hitN = null;
      for (var pi = 0; pi < planes.length; pi++) {
        var pl = planes[pi], d0 = pl.d + (pl.lift ? b.lift : 0), cs = [], deep = 0;
        if (caps.length && b.kind === 'shard' && dot(pl.n, b.p) - d0 > b.rad + th + SLOP) continue;   // B3 (speed): too far from this plane to touch it
        if (b.kind === 'ball') {
          var dist = dot(pl.n, b.p) - d0 - b.r;
          if (dist < SLOP) { cs.push({ r: [-pl.n[0] * b.r, -pl.n[1] * b.r, -pl.n[2] * b.r], depth: -dist }); deep = Math.max(deep, -dist); }
        } else {
          for (i = 0; i < b.loc.length; i++) for (k = -1; k <= 1; k += 2) {
            var r = rot(R, b.loc[i][0], b.loc[i][1], k * th / 2), dd = pl.n[0] * (b.p[0] + r[0]) + pl.n[1] * (b.p[1] + r[1]) + pl.n[2] * (b.p[2] + r[2]) - d0;
            if (dd < SLOP && (!pl.maxDepth || -dd < pl.maxDepth) && (!pl.region || pl.region(b.p[0] + r[0], b.p[1] + r[1], b.p[2] + r[2]))) { cs.push({ r: r, depth: -dd }); if (-dd > deep) deep = -dd; }   // B2: region + maxDepth
          }
        }
        if (!cs.length) continue;
        touching = true;
        // one impulse at the centre of the contact patch (weighted by depth): a plate on its face takes no torque from
        // the floor, one on an edge or a corner tips over it
        var ra = [0, 0, 0], wsum = 0;
        for (i = 0; i < cs.length; i++) { var wt = cs[i].depth + SLOP; ra[0] += cs[i].r[0] * wt; ra[1] += cs[i].r[1] * wt; ra[2] += cs[i].r[2] * wt; wsum += wt; }
        ra = [ra[0] / wsum, ra[1] / wsum, ra[2] / wsum];
        for (var it = 0; it < 2; it++) {
          var vr = b.kind === 'ball' ? b.v.slice() : [b.v[0] + b.w[1] * ra[2] - b.w[2] * ra[1], b.v[1] + b.w[2] * ra[0] - b.w[0] * ra[2], b.v[2] + b.w[0] * ra[1] - b.w[1] * ra[0]];
          var vn2 = dot(vr, pl.n);
          if (it === 0 && -vn2 > hit) { hit = -vn2; hitAt = ra; hitN = pl.n; }
          if (vn2 >= 0) break;
          var e = it === 0 && vn2 < -0.7 ? (b.kind === 'ball' ? 0.45 : P.bounce) : 0;
          var rn = cross(ra, pl.n), kk = 1 / b.m + (b.kind === 'shard' ? dot(cross(iw(b, R, rn), ra), pl.n) : 0);
          var j = -(1 + e) * vn2 / kk;
          impulseAt(b, R, ra, pl.n, j);
          vr = b.kind === 'ball' ? b.v.slice() : [b.v[0] + b.w[1] * ra[2] - b.w[2] * ra[1], b.v[1] + b.w[2] * ra[0] - b.w[0] * ra[2], b.v[2] + b.w[0] * ra[1] - b.w[1] * ra[0]];
          var vnn = dot(vr, pl.n), vt = [vr[0] - pl.n[0] * vnn, vr[1] - pl.n[1] * vnn, vr[2] - pl.n[2] * vnn], vtl = Math.hypot(vt[0], vt[1], vt[2]);
          if (vtl > 1e-6) {
            var t = [-vt[0] / vtl, -vt[1] / vtl, -vt[2] / vtl], kt = 1 / b.m + (b.kind === 'shard' ? dot(cross(iw(b, R, cross(ra, t)), ra), t) : 0);
            impulseAt(b, R, ra, t, Math.min(vtl / kt, P.friction * Math.abs(j) + (cs.length >= 3 ? b.m * G * H * P.friction : 0)));
          }
          if (b.kind === 'shard' && cs.length >= 3) { var tw = dot(b.w, pl.n), sd = Math.min(Math.abs(tw), P.friction * G * H * 40) * Math.sign(tw); b.w[0] -= pl.n[0] * sd; b.w[1] -= pl.n[1] * sd; b.w[2] -= pl.n[2] * sd; } // a plate lying on its face stops turning
        }
        var corr = Math.max(0, deep - SLOP * 0.5) * 0.6; b.p[0] += pl.n[0] * corr; b.p[1] += pl.n[1] * corr; b.p[2] += pl.n[2] * corr;
        if (b.kind === 'shard' && cs.length >= 2) {                         // rolling resistance: a plate on its face stops rocking
          var rr = Math.exp(-(cs.length >= 3 ? 9 : 3) * H); b.w[0] *= rr; b.w[1] *= rr; b.w[2] *= rr;
        }
      }
      if (stack && b.kind === 'shard' && b.onPl !== undefined && dot(planes[b.onPl].n, b.p) - planes[b.onPl].d < b.rad + .5) {   // B3: glass lying on glass
        var sup = supports(b), WP = null;
        for (var si = 0; si < sup.length; si++) { var E = sup[si], smpS = samples(b), cs3 = [], deep3 = 0;
          if (E.nn[0] * (b.p[0] - E.c0[0]) + E.nn[1] * (b.p[1] - E.c0[1]) + E.nn[2] * (b.p[2] - E.c0[2]) > b.rad + th) continue;   // wholly above this support
          if (Math.hypot(E.cx - b.p[0], E.cz - b.p[2]) > E.r + b.rad || b.p[1] - b.rad > E.ymax + .01) continue;
          if (!WP) { WP = []; for (i = 0; i < smpS.length; i++) for (k = -1; k <= 1; k += 2) { var rr0 = rot(R, smpS[i][0], smpS[i][1], k * th / 2); WP.push([b.p[0] + rr0[0], b.p[1] + rr0[1], b.p[2] + rr0[2], rr0]); } }
          for (i = 0; i < WP.length; i++) { var wq = WP[i], r3 = wq[3], wx = wq[0], wy = wq[1], wz = wq[2];
            var hs = (E.nn[0] * (wx - E.c0[0]) + E.nn[1] * (wy - E.c0[1]) + E.nn[2] * (wz - E.c0[2]));   // signed distance above the support's top face
            if (hs < SLOP && hs > -.03 && inPoly(E.fp, wx, wz)) { cs3.push({ r: r3, depth: -hs }); if (-hs > deep3) deep3 = -hs; } }
          if (!cs3.length) continue; touching = true; var cn3 = E.nn, ra3 = [0, 0, 0], ws3 = 0;
          for (i = 0; i < cs3.length; i++) { var w3 = cs3[i].depth + SLOP; ra3[0] += cs3[i].r[0] * w3; ra3[1] += cs3[i].r[1] * w3; ra3[2] += cs3[i].r[2] * w3; ws3 += w3; } ra3 = [ra3[0] / ws3, ra3[1] / ws3, ra3[2] / ws3];
          var vr4 = [b.v[0] + b.w[1] * ra3[2] - b.w[2] * ra3[1], b.v[1] + b.w[2] * ra3[0] - b.w[0] * ra3[2], b.v[2] + b.w[0] * ra3[1] - b.w[1] * ra3[0]], vn4 = dot(vr4, cn3);
          if (vn4 < 0) { var kk4 = 1 / b.m + dot(cross(iw(b, R, cross(ra3, cn3)), ra3), cn3), j4 = -(1 + (vn4 < -0.7 ? P.bounce : 0)) * vn4 / kk4; impulseAt(b, R, ra3, cn3, j4);
            var vr5 = [b.v[0] + b.w[1] * ra3[2] - b.w[2] * ra3[1], b.v[1] + b.w[2] * ra3[0] - b.w[0] * ra3[2], b.v[2] + b.w[0] * ra3[1] - b.w[1] * ra3[0]], vq5 = dot(vr5, cn3), vt5 = [vr5[0] - cn3[0] * vq5, vr5[1] - cn3[1] * vq5, vr5[2] - cn3[2] * vq5], vtl5 = Math.hypot(vt5[0], vt5[1], vt5[2]);
            if (vtl5 > 1e-6) { var t5 = [-vt5[0] / vtl5, -vt5[1] / vtl5, -vt5[2] / vtl5], kt5 = 1 / b.m + dot(cross(iw(b, R, cross(ra3, t5)), ra3), t5); impulseAt(b, R, ra3, t5, Math.min(vtl5 / kt5, P.friction * Math.abs(j4) + (cs3.length >= 3 ? b.m * G * H * P.friction : 0))); } }
          var corr3 = Math.max(0, deep3 - SLOP * .5) * .6; b.p[0] += cn3[0] * corr3; b.p[1] += cn3[1] * corr3; b.p[2] += cn3[2] * corr3;
          if (cs3.length >= 3) { var rr3 = Math.exp(-9 * H); b.w[0] *= rr3; b.w[1] *= rr3; b.w[2] *= rr3; }
        }
      }
      if (b.kind === 'shard') for (var ci = 0; ci < caps.length; ci++) {   // B3: round bars and columns
        var C = caps[ci], dc = segDist(b.p, C.a, C.b); if (Math.hypot(dc[0], dc[1], dc[2]) > b.rad + C.r + th) continue;
        var smp = capFace ? samplesC(b) : samples(b), cs2 = [], nsum = [0, 0, 0], deep2 = capFace ? -1 : 0;
        var MG = capFace ? Math.hypot(b.v[0], b.v[1], b.v[2]) * H * 1.5 + Math.hypot(b.w[0], b.w[1], b.w[2]) * b.rad * H + .002 : SLOP;   // B3b: speculative reach — what the plate can cover in one step
        for (i = 0; i < smp.length; i++) for (k = -1; k <= 1; k += 2) { var r2 = rot(R, smp[i][0], smp[i][1], k * th / 2), wpt = [b.p[0] + r2[0], b.p[1] + r2[1], b.p[2] + r2[2]], dv = segDist(wpt, C.a, C.b), dl2 = Math.hypot(dv[0], dv[1], dv[2]);
          if (dl2 < C.r + MG && dl2 > 1e-6) { var dep = C.r - dl2, wd = capFace ? Math.max(0, dep) + MG - Math.max(0, -dep) * .9 : dep + SLOP; cs2.push({ r: r2, depth: dep }); nsum[0] += dv[0] / dl2 * wd; nsum[1] += dv[1] / dl2 * wd; nsum[2] += dv[2] / dl2 * wd; if (dep > deep2) deep2 = dep; } }
        if (capFace) {   // B3b: the bar against the plate's FACE (edge points alone let a bar pass through the middle of a big pane)
          var ab = [C.b[0] - C.a[0], C.b[1] - C.a[1], C.b[2] - C.a[2]], abl = Math.hypot(ab[0], ab[1], ab[2]), nF = [R[6], R[7], R[8]];
          var tc = clamp(dot([b.p[0] - C.a[0], b.p[1] - C.a[1], b.p[2] - C.a[2]], ab) / (abl * abl), 0, 1), reach = (b.rad + C.r) / abl, ns = Math.max(2, Math.ceil(2 * reach * abl / .02));
          b.capSide = b.capSide || {};
          for (var s3 = 0; s3 <= ns; s3++) { var u3 = clamp(tc - reach + 2 * reach * s3 / ns, 0, 1), X3 = [C.a[0] + ab[0] * u3 - b.p[0], C.a[1] + ab[1] * u3 - b.p[1], C.a[2] + ab[2] * u3 - b.p[2]], L3 = rotT(R, X3);
            if (!inLoc(b.loc, L3[0], L3[1]) || edgeDist(b.loc, L3[0], L3[1]) < C.r) continue;   // near an edge the edge points take it
            var side = b.capSide[ci], ah = Math.abs(L3[2]); if (ah > C.r + th / 2 + .004) side = b.capSide[ci] = L3[2] >= 0 ? 1 : -1;   // which side of the pane the bar is on, learnt while it is clear
            if (!side) continue;
            var dep3 = C.r + th / 2 - side * L3[2]; if (dep3 <= -MG) continue; var wd3 = Math.max(0, dep3) + MG - Math.max(0, -dep3) * .9;
            var rF = rot(R, L3[0], L3[1], side * th / 2); cs2.push({ r: rF, depth: dep3 });
            nsum[0] -= side * nF[0] * wd3; nsum[1] -= side * nF[1] * wd3; nsum[2] -= side * nF[2] * wd3; if (dep3 > deep2) deep2 = dep3; }
        }
        if (!cs2.length) continue; var nl2 = Math.hypot(nsum[0], nsum[1], nsum[2]); if (nl2 < 1e-9) continue; var cn = [nsum[0] / nl2, nsum[1] / nl2, nsum[2] / nl2];
        touching = true; var ra2 = [0, 0, 0], ws2 = 0; for (i = 0; i < cs2.length; i++) { var w2 = capFace ? Math.max(0, cs2[i].depth) + MG * .1 : cs2[i].depth + SLOP; ra2[0] += cs2[i].r[0] * w2; ra2[1] += cs2[i].r[1] * w2; ra2[2] += cs2[i].r[2] * w2; ws2 += w2; } ra2 = [ra2[0] / ws2, ra2[1] / ws2, ra2[2] / ws2];
        var vr2 = [b.v[0] + b.w[1] * ra2[2] - b.w[2] * ra2[1], b.v[1] + b.w[2] * ra2[0] - b.w[0] * ra2[2], b.v[2] + b.w[0] * ra2[1] - b.w[1] * ra2[0]], vn3 = dot(vr2, cn);
        var gap2 = capFace && deep2 < 0 ? -deep2 : 0;   // B3b: a speculative contact (not touching yet): take away only the approach that would close the gap within this step
        if (gap2 > 0) { if (vn3 < -gap2 / H) { var kks = 1 / b.m + dot(cross(iw(b, R, cross(ra2, cn)), ra2), cn); impulseAt(b, R, ra2, cn, -(vn3 + gap2 / H) / kks); } continue; }
        if (-vn3 > hit) { hit = -vn3; hitAt = ra2; hitN = cn; }
        if (vn3 < 0) { var kk2 = 1 / b.m + dot(cross(iw(b, R, cross(ra2, cn)), ra2), cn), j2 = -(1 + (vn3 < -0.7 ? P.bounce : 0)) * vn3 / kk2; impulseAt(b, R, ra2, cn, j2);
          var vr3 = [b.v[0] + b.w[1] * ra2[2] - b.w[2] * ra2[1], b.v[1] + b.w[2] * ra2[0] - b.w[0] * ra2[2], b.v[2] + b.w[0] * ra2[1] - b.w[1] * ra2[0]], vq = dot(vr3, cn), vt2 = [vr3[0] - cn[0] * vq, vr3[1] - cn[1] * vq, vr3[2] - cn[2] * vq], vtl2 = Math.hypot(vt2[0], vt2[1], vt2[2]);
          if (vtl2 > 1e-6) { var tt = [-vt2[0] / vtl2, -vt2[1] / vtl2, -vt2[2] / vtl2], kt2 = 1 / b.m + dot(cross(iw(b, R, cross(ra2, tt)), ra2), tt); impulseAt(b, R, ra2, tt, Math.min(vtl2 / kt2, P.friction * Math.abs(j2))); } }
        var corr2 = Math.max(0, deep2 - SLOP * .5) * (capFace ? 1 : .6); b.p[0] += cn[0] * corr2; b.p[1] += cn[1] * corr2; b.p[2] += cn[2] * corr2;
      }
      if (hit > 0.45) {
        events.push({ id: b.id, speed: hit, t: time, kind: b.kind, size: b.kind === 'ball' ? 0 : Math.sqrt(b.area) });
        if (b.kind === 'shard' && P.breakSpeed > 0 && hit > P.breakSpeed && b.area > Math.max(16 * M.crack.minArea, 0.012 * refSize * refSize) && b.gen < 3) {
          var lp = rotT(R, hitAt); breaks.push({ id: b.id, at: [lp[0] + b.c[0], lp[1] + b.c[1]], speed: hit, n: hitN });
        }
      }
      // clamp, integrate
      var sp = Math.hypot(b.v[0], b.v[1], b.v[2]); if (sp > 25) { b.v[0] *= 25 / sp; b.v[1] *= 25 / sp; b.v[2] *= 25 / sp; }
      var wl = Math.hypot(b.w[0], b.w[1], b.w[2]); if (wl > 60) { b.w[0] *= 60 / wl; b.w[1] *= 60 / wl; b.w[2] *= 60 / wl; }
      b.p[0] += b.v[0] * H; b.p[1] += b.v[1] * H; b.p[2] += b.v[2] * H;
      var q = b.q, w = b.w, h = H / 2;
      var qx = q[0] + h * (w[0] * q[3] + w[1] * q[2] - w[2] * q[1]), qy = q[1] + h * (w[1] * q[3] + w[2] * q[0] - w[0] * q[2]);
      var qz = q[2] + h * (w[2] * q[3] + w[0] * q[1] - w[1] * q[0]), qw = q[3] - h * (w[0] * q[0] + w[1] * q[1] + w[2] * q[2]), ql = Math.hypot(qx, qy, qz, qw);
      q[0] = qx / ql; q[1] = qy / ql; q[2] = qz / ql; q[3] = qw / ql;
      // sleep: slow and touching for a moment (or touching for a long time)
      if (touching && sp + wl * (b.rad || b.r) < 0.08) b.calm += H; else b.calm = 0;
      if (b.kind === 'shard' && touching && sp < 0.25 && wl < 2.5 && b.p[1] < th * 3 + b.lift) {   // nearly flat and slow on the floor: let it lie down
        var ny = R[7];
        if (Math.abs(ny) > 0.985) { var tgt = ny > 0 ? 1 : -1, ax = [R[8] * tgt, 0, -R[6] * tgt], an = Math.asin(clamp(Math.hypot(ax[0], ax[2]), 0, 1));
          if (an > 1e-5) { var dq = axisQuat(ax[0], 0, ax[2], -an * 0.15), nq = qmul(dq, b.q); b.q[0] = nq[0]; b.q[1] = nq[1]; b.q[2] = nq[2]; b.q[3] = nq[3]; }
          b.w[0] *= 0.9; b.w[2] *= 0.9; }
      }
      var sleepy = b.calm > 0.3 || (touching && b.life > 5 && sp < 0.3) || (touching && b.life > 12) || b.p[1] < -1;
      if (sleepy) { b.awake = 0; b.v = [0, 0, 0]; b.w = [0, 0, 0]; b.calm = 0; if (stack && b.kind === 'shard' && b.onPl !== undefined) restOn(b, b.onPl); }   // B3: remember the resting plate
    }

    sim.step = function () {
      events.length = 0;
      for (var i = 0; i < bodies.length; i++) { var b = bodies[i]; if (b.died === Infinity) stepBody(b); }
      time += H; steps++;
      if (breaks.length) { var bs = breaks.splice(0); bs.forEach(function (x) { var b = bodies[x.id]; if (b.died !== Infinity) return; var s = clamp(x.speed / 6, 0.35, 1), r = sim.strike(x.id, x.at, null, s, 'land'); if (sim.onBreak) sim.onBreak(r, s); }); }
      if (steps % KEY === 0) record();
      var any = false; for (i = 0; i < bodies.length && !any; i++) { var c = bodies[i]; if (c.died === Infinity && c.awake && !(c.held && !c.release)) any = true; }
      if (!any) { record(); idle = true; }
      return events;
    };
    Object.defineProperty(sim, 'time', { get: function () { return time; } });
    Object.defineProperty(sim, 'idle', { get: function () { return idle; } });
    sim.awakeCount = function () { var n = 0; bodies.forEach(function (b) { if (b.died === Infinity && b.awake && !(b.held && !b.release)) n++; }); return n; };
    // advance the tape one step if anything moves (the time when everything rests is cut out of the tape)
    sim.tick = function () { if (idle) return null; return sim.step(); };

    // strike body `id` at pane point `at` (shards) — dir: world direction of the blow (null for a landing) — kind:
    // 'blow' (a projectile or a tap pushes the pieces along dir) or 'land' (the piece hit the floor: pieces spray out
    // and up). Returns { pieces: [bodies], cracked, lost, rays, r0 }.
    sim.strike = function (id, at, dir, s, kind) {
      var b = bodies[id];
      if (!b || b.kind !== 'shard') return { pieces: [], cracked: false };
      // each blow has its own seeded stream (seed, piece, impact point): the same blow always makes the same pieces
      var rng = HIC.rng((o.seed * 7919 + b.id * 104729 + Math.round(at[0] * 1e4) * 31 + Math.round(at[1] * 1e4) * 17 + Math.round(time * 240)) >>> 0);
      if (time === 0) { record(); time = H; }                           // keep t = 0 as the intact pane on the tape
      idle = false;
      var R = quatMat(b.q), n = [R[6], R[7], R[8]];
      var res = bodies.length < o.maxShards - 4 && b.area > 6 * M.crack.minArea ? fracture(b.poly, at, s, M.crack, rng, refSize) : { cells: [], lost: 0, rays: [], r0: 0 };
      var hp = rot(R, at[0] - b.c[0], at[1] - b.c[1], 0); hp = [b.p[0] + hp[0], b.p[1] + hp[1], b.p[2] + hp[2]];
      var D = dir || [-n[0], -n[1], -n[2]];
      if (res.cells.length < 2) {                                         // too small to break: it is knocked away
        b.awake = 1; b.held = 0; b.calm = 0;
        impulseAt(b, R, [hp[0] - b.p[0], hp[1] - b.p[1], hp[2] - b.p[2]], kind === 'land' ? [0, 1, 0] : D, b.m * (kind === 'land' ? 0.5 : 2.2 * s));
        record();
        return { pieces: [b], cracked: false, lost: 0, rays: [], r0: 0 };
      }
      record();
      b.died = time;
      var pieces = [], heldParent = b.held && !b.release, Rr = res.r0 || 0.05, PH = M.physics;
      res.cells.forEach(function (cell) {
        var c = centroid(cell), lr = rot(R, c[0] - b.c[0], c[1] - b.c[1], 0);
        var ch = addShard(cell, [b.p[0] + lr[0], b.p[1] + lr[1], b.p[2] + lr[2]], b.q, b.gen + 1); ch.parent = b.id;   // B2: parent
        var dx = c[0] - at[0], dy = c[1] - at[1], dl = Math.hypot(dx, dy) || 1e-6, near = Math.pow(clamp(1 - dl / (Rr * 3.2), 0, 1), 1.5);
        var out = rot(R, dx / dl, dy / dl, 0), wv = cross(b.w, lr);
        ch.v = [b.v[0] + wv[0], b.v[1] + wv[1], b.v[2] + wv[2]];
        var big = clamp(Math.sqrt(ch.area) / (refSize * 0.25), 0.2, 1.5), j = (rng() - 0.5);
        if (kind === 'land') {
          var up = Math.abs(ch.v[1]) * PH.bounce;
          ch.v[1] = Math.max(0, -ch.v[1] * 0.0) + up * (0.6 + 0.8 * rng());
          var spread = s * PH.throw * (1.2 + 2.4 * near) / Math.sqrt(big);
          ch.v[0] = ch.v[0] * 0.5 + out[0] * spread + j * 0.3; ch.v[2] = ch.v[2] * 0.5 + out[2] * spread + (rng() - 0.5) * 0.3; ch.v[1] += 0.4 * spread * rng();
        } else {
          var push = s * PH.throw * (0.25 + 3.6 * near) * (0.6 + 0.8 * rng()) / Math.sqrt(big), side = s * PH.throw * near * 0.9;
          ch.v[0] += D[0] * push + out[0] * side + j * 0.15; ch.v[1] += D[1] * push + out[1] * side + 0.25 * near; ch.v[2] += D[2] * push + out[2] * side;
        }
        // spin: crushed bits tumble fast; far daggers tip over along the blow and outwards
        var spin = PH.spin * (1 + 5 * near) / big, ax = [rng() - 0.5, rng() - 0.5, rng() - 0.5];
        var tip = cross(n, out), tipS = PH.spin * (kind === 'land' ? 2.5 : 1.6) * (1 - near) * (0.5 + rng());
        ch.w = [b.w[0] + ax[0] * spin * 2 + tip[0] * tipS, b.w[1] + ax[1] * spin * 2 + tip[1] * tipS, b.w[2] + ax[2] * spin * 2 + tip[2] * tipS];
        if (heldParent) { ch.held = 1; ch.release = time + dl * 0.05 * (0.7 + 0.6 * rng()) * (1 / Math.max(0.3, s)); }
        pieces.push(ch);
      });
      // wake and nudge what lies near
      bodies.forEach(function (o2) {
        if (o2.died !== Infinity || pieces.indexOf(o2) >= 0) return;
        var d = Math.hypot(o2.p[0] - hp[0], o2.p[1] - hp[1], o2.p[2] - hp[2]);
        if (d < 0.25) { o2.awake = 1; o2.calm = 0; o2.v[1] += 0.6 * (1 - d / 0.25) * s; o2.w[0] += (rng() - 0.5) * 3; o2.w[2] += (rng() - 0.5) * 3; }
      });
      record();
      return { pieces: pieces, cracked: true, lost: res.lost, rays: res.rays, r0: res.r0, at: hp };
    };
    // release a held body (the 'drop' impact): it slips and falls, tipping by `tip` rad/s
    sim.release = function (id, tip, push) {
      var b = bodies[id]; if (!b) return;
      var rng = HIC.rng((o.seed * 31 + id * 7 + Math.round(time * 240)) >>> 0);
      if (time === 0) { record(); time = H; }
      record();
      b.held = 0; b.awake = 1; b.w = [tip, (rng() - 0.5) * 0.3, (rng() - 0.5) * 0.4]; b.v = push || [0, 0, 0.05]; idle = false;
      record();
    };

    // the state of every body at tape time t, into view {p: Float32Array, q, alive: Uint8Array, n}
    sim.view = { p: new Float32Array(0), q: new Float32Array(0), alive: new Uint8Array(0), n: 0 };
    function viewSize(n) { var v = sim.view; if (v.alive.length < n) { v.p = new Float32Array(n * 3 + 96); v.q = new Float32Array(n * 4 + 128); v.alive = new Uint8Array(n + 32); } v.n = n; return v; }
    sim.liveView = function (alpha) { // the current state, blended from the previous step by alpha (smooth slow motion)
      var v = viewSize(bodies.length), a = alpha === undefined ? 1 : alpha;
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i]; v.alive[i] = b.died === Infinity ? 1 : 0;
        for (var k = 0; k < 3; k++) v.p[i * 3 + k] = mix(b.pp[k], b.p[k], a);
        var d = b.pq[0] * b.q[0] + b.pq[1] * b.q[1] + b.pq[2] * b.q[2] + b.pq[3] * b.q[3], sg = d < 0 ? -1 : 1, l = 0;
        for (k = 0; k < 4; k++) { v.q[i * 4 + k] = mix(b.pq[k] * sg, b.q[k], a); l += v.q[i * 4 + k] * v.q[i * 4 + k]; }
        l = Math.sqrt(l) || 1; for (k = 0; k < 4; k++) v.q[i * 4 + k] /= l;
      }
      return v;
    };
    function frameAt(t) { var lo = 0, hi = frames.length - 1; if (hi < 0) return -1; if (t < frames[0].t) return 0; while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (frames[mid].t <= t) lo = mid; else hi = mid - 1; } return lo; }
    sim.poseAt = function (t) {
      if (t >= time - 1e-9) return sim.liveView(1);
      var v = viewSize(bodies.length), k = frameAt(t), A = frames[k], B = frames[Math.min(k + 1, frames.length - 1)];
      var f = B.t > A.t ? clamp((t - A.t) / (B.t - A.t), 0, 1) : 0;
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i]; v.alive[i] = sim.alive(b, t) ? 1 : 0;
        if (!v.alive[i]) continue;
        var a = i < A.n ? A : B, c = i < B.n ? B : A, ff = a === c ? 0 : f, oa = i * STATE, l = 0, j;
        if (i >= a.n) { v.alive[i] = 0; continue; }
        for (j = 0; j < 3; j++) v.p[i * 3 + j] = mix(a.d[oa + j], c.d[oa + j], ff);
        var dq = a.d[oa + 3] * c.d[oa + 3] + a.d[oa + 4] * c.d[oa + 4] + a.d[oa + 5] * c.d[oa + 5] + a.d[oa + 6] * c.d[oa + 6], sg = dq < 0 ? -1 : 1;
        for (j = 0; j < 4; j++) { v.q[i * 4 + j] = mix(a.d[oa + 3 + j] * sg, c.d[oa + 3 + j], ff); l += v.q[i * 4 + j] * v.q[i * 4 + j]; }
        l = Math.sqrt(l) || 1; for (j = 0; j < 4; j++) v.q[i * 4 + j] /= l;
      }
      return v;
    };
    // resume from tape time t: everything after it is forgotten
    sim.truncate = function (t) {
      if (t >= time - 1e-9 || !frames.length) return;
      var k = frameAt(t), F = frames[k];
      frames.length = k + 1; time = F.t;
      var removed = bodies.splice(F.n);
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i], o2 = i * STATE, d = F.d;
        b.p = [d[o2], d[o2 + 1], d[o2 + 2]]; b.q = [d[o2 + 3], d[o2 + 4], d[o2 + 5], d[o2 + 6]]; b.v = [d[o2 + 7], d[o2 + 8], d[o2 + 9]]; b.w = [d[o2 + 10], d[o2 + 11], d[o2 + 12]];
        b.awake = d[o2 + 13] % 2; b.held = d[o2 + 13] >= 2 ? 1 : 0; b.calm = 0; b.pp = b.p.slice(); b.pq = b.q.slice();
        if (b.held && b.release && b.release <= time) b.held = 0;
        if (b.died > time) b.died = Infinity;
      }
      idle = sim.awakeCount() === 0;
      return removed;
    };
    sim.reset = function () { frames.length = 0; time = 0; steps = 0; idle = true; };
    // ray (world) against every alive shard at the current view; returns sorted hits {id, t, at: pane point}
    sim.pickAll = function (o3, d) {
      var v = sim.view, hits = [];
      for (var i = 0; i < v.n; i++) {
        var b = bodies[i]; if (!v.alive[i] || b.kind !== 'shard') continue;
        var q = [v.q[i * 4], v.q[i * 4 + 1], v.q[i * 4 + 2], v.q[i * 4 + 3]], R = quatMat(q), n = [R[6], R[7], R[8]], p = [v.p[i * 3], v.p[i * 3 + 1], v.p[i * 3 + 2]];
        var den = dot(n, d); if (Math.abs(den) < 1e-6) continue;
        var t = (dot(n, p) - dot(n, o3)) / den; if (t <= 0) continue;
        var l = rotT(R, [o3[0] + d[0] * t - p[0], o3[1] + d[1] * t - p[1], o3[2] + d[2] * t - p[2]]), ax = l[0] + b.c[0], ay = l[1] + b.c[1];
        if (inside(b.poly, ax, ay)) hits.push({ id: i, t: t, at: [ax, ay] });
      }
      return hits.sort(function (a, b) { return a.t - b.t; });
    };
  }
export { area, centroid, perim, clip, inside, convex, fracture, Sim, quatMat, axisQuat, qmul, rot, rotT };
