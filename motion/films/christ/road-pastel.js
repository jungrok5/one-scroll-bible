/* road-pastel.js — 「그리스도」 3부, 가이사랴 빌립보로 가는 길 (막 8:27 "길에서 제자들에게 물어"; 마 16:13–23), 매직 아워 소프트 파스텔.
   Soft pastel on grey-violet toned paper (after the first film's patriarch scene and Lemo-Opuscar 93 'Nomadland'): chalky strokes,
   the sky going gold → rose → violet. The light carries the feeling: the gold of the confession, the sun going down at the first
   word of the passion, the violet of Peter's protest, the first star over Peter left behind on the road.
   One world seen from a rise (high view): golden fields falling away to the north-east, Mount Hermon far off with snow; a dirt road
   winding up through the fields and over a crest toward the south, where the horizon darkens (Jerusalem). The sun is low behind
   us (left), so the band is lit from the side, their shadows run ahead of them up the road.
     'confess'  (u 0–7.7, film 51.4–): the band walking up the road, Jesus in front; u≈1 he stops and turns to them, they stop
                (마 16:15); u 3.5 Peter steps out of the band toward him and the warmest sunlight falls on that spot — the brightest moment.
     'foretell' (u 0–8.0, 59.1–): Jesus turns back to the road ahead — south, over the crest into the darkening horizon — and takes
                a few steps; the sun lowers, gold → rose; everyone's shadow stretches up the road (his in front); the fields cool.
     'protest'  (u 0–4.3, 67.1–): nearer, from low down, rose → violet: Peter steps into the middle of the road in front of him and
                takes his arm — barring the way; between the two figures one last line of sunlight on the horizon.
     'alone'    (u 0–4.6, 71.4–): violet dusk; Jesus and the band walk on up the road, growing small; Peter stands a few steps
                behind, alone on the road; the first star.
   Each mode draws for u from -0.8 to its length + 0.8 (dissolves). Closed form: roadPastel(ctx, u, mode) depends only on (u, mode).
   No words are drawn. Needs Pilot (lib.js). */
const RDP = {};

function rdLayout() {
  const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
  const L = V ? { hz: H * .36, road: [[.12, 1.16], [.26, .88], [.38, .7], [.46, .61], [.55, .535], [.65, .482], [.76, .443], [.87, .405], [.96, .379]], fh: H * .052, lead: .435, herm: [-.3, .78, .26, .283], band: .585, crest: .379, sy: .17 }
              : { hz: H * .4, road: [[.06, 1.2], [.2, .93], [.32, .77], [.41, .68], [.5, .615], [.6, .565], [.72, .515], [.84, .47], [.95, .425]], fh: H * .088, lead: .525, herm: [-.2, .62, .24, .29], band: .72, crest: .425, sy: .19 };
  return Object.assign(L, { W, H, V, S: 1.25, X0: -.2 * W, X1: 1.2 * W, Y1: 1.15 * H });
}
// colours of the light by time of day T (0 gold · .45 rose · .7 violet · 1 dusk)
const RD_C = {
  top: [[0, '#6a72a8'], [.3, '#62609c'], [.55, '#55488a'], [.75, '#443a7c'], [1, '#33366a']],
  mid: [[0, '#eec48c'], [.3, '#eaae8c'], [.5, '#d88a8e'], [.72, '#9a6a98'], [1, '#4a3f7a']],
  hor: [[0, '#fbe2a0'], [.3, '#f8cc90'], [.5, '#f4a890'], [.7, '#d08898'], [.85, '#8a6a98'], [1, '#5a4c88']],
  land: [[0, '#fff8e8'], [.3, '#ffead4'], [.5, '#f4d0c4'], [.7, '#d0b2c8'], [.85, '#b4a8cc'], [1, '#a69ec8']],
  light: [[0, '#ffe2a0'], [.35, '#ffcc90'], [.55, '#f8a890'], [.75, '#d090b0'], [1, '#a890c0']],
  snow: [[0, '#fff6e6'], [.35, '#ffe6d0'], [.55, '#ffc0c0'], [.75, '#c0a8d0'], [1, '#8a84b8']],
};

// a robed, head-covered walker in units of the height (feet at the origin, y up negative), through a map P(x, y) → canvas.
// The robe ends at the shin and the legs show under it, stepping (ph = walk phase, walk 0 standing … 1 walking); face +1 right,
// -1 left (continuous: a turn passes through facing us); lean tips the top forward; staff adds a staff.
function rdLimb(p, a, b, w0, w1) { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); p.moveTo(a[0] + Math.cos(ang - Math.PI / 2) * w0, a[1] + Math.sin(ang - Math.PI / 2) * w0); p.arc(b[0], b[1], w1, ang - Math.PI / 2, ang + Math.PI / 2); p.arc(a[0], a[1], w0, ang + Math.PI / 2, ang + Math.PI * 1.5); p.closePath(); }
function rdPerson(P, o) {
  const { w = 1, lean: l = 0, face: f = 1, staff = false, cloth = 1, hem = 1, peak = 0, ph = 0, walk = 0 } = o, q = new Path2D(), hc = new Path2D(), hd = new Path2D();
  const add = (pts, also) => { pts = pts.map(([x, y]) => P(x, y)); let a = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; } if (a < 0) pts.reverse();
    const n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2]; for (const t of also ? [q, also] : [q]) { t.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) t.quadraticCurveTo(pts[i][0], pts[i][1], ...m(i)); t.closePath(); } };
  const circ = (cx, cy, rx, ry, n = 16) => Array.from({ length: n }, (_, i) => { const a = i / n * 6.283; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const bob = -.014 * Math.abs(Math.sin(ph)) * walk, hx = l * .95 + .016 * f, sw = .025 * Math.sin(ph) * walk * f, hy = -.04 - .09 * walk + bob, hy0 = -.905 + bob;
  // legs: from the hips under the robe to the feet; the stance leg sweeps back while the other swings forward
  const sl = .36 * Math.sin(ph) * walk, hip = -.36 + bob, LL = .36, s1 = Math.hypot(P(1, 0)[0] - P(0, 0)[0], P(1, 0)[1] - P(0, 0)[1]);
  for (const [s, side] of [[sl, -1], [-sl, 1]]) { const H0 = P(side * .035 + l * .3, hip), F = P(side * .035 + l * .3 + Math.sin(s) * LL * f, hip + Math.cos(s) * LL);
    const lift = Math.max(0, Math.sin(ph + (side < 0 ? 0 : Math.PI))) * walk * .03, Fl = [F[0], F[1] - lift * s1];
    rdLimb(q, H0, Fl, .034 * s1, .028 * s1); q.moveTo(Fl[0] + .05 * s1 * f, Fl[1]); q.ellipse(Fl[0] + .025 * s1 * f, Fl[1], .05 * s1, .022 * s1, 0, 0, 6.283); }
  if (o.profile) {   // seen from the side: front (chest, a little belly) toward f, a straight back, the head cloth only behind
    const X = (x, y) => (x * f) + l * (-y) * 1.05;
    add([[X(.17 * hem, hy) + sw, hy], [X(.15, -.3), -.3 + bob], [X(.135, -.5), -.5 + bob], [X(.125, -.62), -.62 + bob], [X(.1, -.72), -.72 + bob], [X(.06, -.785), -.785 + bob], [X(.03, -.82), -.82 + bob],
      [X(-.035, -.83), -.83 + bob], [X(-.095, -.785), -.785 + bob], [X(-.125, -.7), -.7 + bob], [X(-.135, -.5), -.5 + bob], [X(-.155, -.3), -.3 + bob], [X(-.185 * hem, hy) + sw, hy]]);
    const px = l * .9 + .025 * f, py = -.905 + bob;
    add(circ(px, py, .066, .074), hd); add([[px + .056 * f, py - .02], [px + .09 * f, py + .014], [px + .062 * f, py + .03]], hd); add([[px + .03 * f, py + .05], [px + .06 * f, py + .045], [px + .03 * f, py + .085], [px - .01 * f, py + .08]], hd);   // nose, chin
    add(circ(px - .05 * f, py - .026, .068, .07), hc);
    add([[px + .02 * f, py - .09 - peak], [px - .08 * f, py - .055], [px - .11 * f, py + .04], [X(-.13, -.72), -.72 + bob], [X(-.06, -.79), -.79 + bob], [px - .04 * f, py + .06]], hc);
    q.hc = hc; q.hd = hd; return q; }
  add([[sw, hy + .01], [-.19 * w * hem + sw, hy], [-.2 * w * hem + sw * .6, hy - .06], [-.185 * w + l * .4, -.42 + bob], [-.15 * w + l * .72, -.735 + bob], [-.1 * w + l * .8, -.79 + bob], [-.042 + hx, -.825 + bob], [.042 + hx, -.825 + bob],
    [.1 * w + l * .8, -.79 + bob], [.15 * w + l * .72, -.735 + bob], [.185 * w + l * .4, -.42 + bob], [.2 * w * hem + sw * .6, hy - .06], [.2 * w * hem + sw, hy]]);
  // the head: the face (skin) shows on the side it looks to; the head cloth covers the top and the back (a circle set back and up),
  // so a turn reads — and a frontal face shows under the cloth's edge
  add(circ(hx, hy0, .068, .074), hd); if (Math.abs(f) > .3) add([[hx + .058 * f, hy0 - .012], [hx + .086 * f, hy0 + .012], [hx + .06 * f, hy0 + .028]], hd);   // a nose in profile
  add(circ(hx - .036 * f, hy0 - .024, .075, .072), hc);
  add([[hx + .02 * f, -.99 + bob - peak], [hx - .07 * f, -.955 + bob], [hx - .1 * f, -.87 + bob], [(-.14 * w * f + l * .7) * (.7 + .3 * cloth), -.75 + .2 * (cloth - 1) + bob], [hx - .01 * f, -.8 + bob]], hc);
  add([[hx - .075 - .02 * f, -.86 + bob], [hx + .07 - .03 * f, -.85 + bob], [.13 * w + l * .75, -.74 + bob], [-.13 * w + l * .75, -.74 + bob]], hc);   // the cloth over the shoulders
  if (staff) add([[.2 * f + .012, -.02], [.24 * f + .012 + l * .5, -1.06 + bob], [.24 * f - .012 + l * .5, -1.06 + bob], [.2 * f - .012, -.02]]);
  q.hc = hc; q.hd = hd; return q;
}
// a soft rim: the shape minus itself shifted with the light, on a scratch canvas, strongest on head and shoulders and gone down the
// body, drawn twice (blurred, then crisp) so the chalk edge has no cut-out line
function rdRim(g, path, Lt, d, light, a, box) {
  const c = RDP.rimC, r = c.getContext('2d'), [bx, by, bw, bh] = box.map(Math.round), top = by, len = bh;
  r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = 'source-over'; r.clearRect(bx - 2, by - 2, bw + 4, bh + 4); r.fillStyle = '#fff'; r.fill(path);
  r.globalCompositeOperation = 'destination-out'; r.translate(Lt[0] * d, Lt[1] * d); r.fill(path); r.setTransform(1, 0, 0, 1, 0, 0);
  r.globalCompositeOperation = 'source-in'; const gr = r.createLinearGradient(0, top, 0, top + len * .75); gr.addColorStop(0, light); gr.addColorStop(.45, light); gr.addColorStop(1, 'rgba(0,0,0,0)'); r.fillStyle = gr; r.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (d >= 4) { const sc2 = RDP.rimS, s2 = sc2.getContext('2d'); s2.setTransform(1, 0, 0, 1, 0, 0); s2.clearRect(0, 0, sc2.width, sc2.height); s2.filter = `blur(${(d * .5).toFixed(1)}px)`; s2.drawImage(c, bx - 2, by - 2, bw + 4, bh + 4, 0, 0, bw + 4, bh + 4); s2.filter = 'none';   // the blur on a small canvas (big figures only)
    g.globalAlpha = .55 * a; g.drawImage(sc2, 0, 0, bw + 4, bh + 4, bx - 2, by - 2, bw + 4, bh + 4); }
  g.globalAlpha = (d >= 4 ? .6 : .85) * a; g.drawImage(c, bx - 2, by - 2, bw + 4, bh + 4, bx - 2, by - 2, bw + 4, bh + 4); g.restore();
}
// a figure in pastel: robe, face and hands (skin), head cloth; the soft rim; a few folds. Lt = the direction the light travels
function rdFigure(g, path, P, o, body, light, Lt, d, rimA = 1) {
  const s = Math.hypot(P(1, 0)[0] - P(0, 0)[0], P(1, 0)[1] - P(0, 0)[1]), xs = [P(-.75, 0)[0], P(.75, 0)[0]], ys = [P(0, -1.12)[1], P(0, .06)[1]];
  g.save(); g.fillStyle = body; g.fill(path);
  if (path.hd) { g.fillStyle = o.skin || '#9a7a68'; g.fill(path.hd); }
  if (path.hc) { g.fillStyle = o.hcCol || body; g.fill(path.hc); }
  if (path.hands) { g.fillStyle = o.skin || '#9a7a68'; g.fill(path.hands); }
  if (s > 30) { g.clip(path); g.strokeStyle = o.fold || 'rgba(40,30,56,.28)'; g.lineCap = 'round'; const { w = 1, lean: l = 0, face: f = 1 } = o;   // a few folds, no texture strokes
    for (const [x0, x1, y0, wd] of [[-.06, -.11, -.55, .012], [.06, .11, -.6, .011], [.14, .17, -.44, .009]]) {
      const A = P(x0 * w + l * .5, y0), B = P(x1 * w, -.16), C = P((x0 + x1) / 2 * w + .025 * f + l * .25, (y0 - .16) / 2); g.lineWidth = Math.max(1, wd * s); g.beginPath(); g.moveTo(...A); g.quadraticCurveTo(...C, ...B); g.stroke(); } }
  g.restore();
  if (rimA > 0 && d < 14 && !o.softRim) {   // a small figure: the cheap rim (light, then the shape again shifted with the light), faded down the body
    const top = Math.min(...ys); g.save(); g.clip(path); g.globalAlpha = rimA; g.fillStyle = light; g.fill(path); g.globalAlpha = 1; g.translate(Lt[0] * d, Lt[1] * d); g.fillStyle = body; g.fill(path);
    if (path.hd) { g.fillStyle = o.skin || '#9a7a68'; g.fill(path.hd); } if (path.hc) { g.fillStyle = o.hcCol || body; g.fill(path.hc); } g.translate(-Lt[0] * d, -Lt[1] * d);
    const fg = g.createLinearGradient(0, top + .3 * s, 0, top + .8 * s); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, body); g.fillStyle = fg; g.fillRect(Math.min(...xs), top + .3 * s, Math.abs(xs[1] - xs[0]), 1.2 * s); g.restore(); return; }
  if (rimA > 0) rdRim(g, path, Lt, d, light, rimA, [Math.min(...xs), Math.min(...ys), Math.abs(xs[1] - xs[0]), Math.abs(ys[1] - ys[0])]);
}
function rdCam(keys, u) {   // Catmull-Rom through [t, fx, fy, z] keys, held outside
  let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)], t = Pilot.clamp((u - k1[0]) / (k2[0] - k1[0]));
  return [1, 2, 3].map(j => { const p1 = k1[j], p2 = k2[j], d1 = k1 === k0 ? (p2 - p1) : (p2 - k0[j]) / 2 * (k2[0] - k1[0]) / (k2[0] - k0[0]) * 2, d2 = k3 === k2 ? (p2 - p1) : (k3[j] - p1) / 2 * (k2[0] - k1[0]) / (k3[0] - k1[0]) * 2;
    const t2 = t * t, t3 = t2 * t; return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * d1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * d2; });
}
function rdIK(s, t, a, b, bend) {
  const dx = t[0] - s[0], dy = t[1] - s[1], dd = Math.hypot(dx, dy), d = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, dd)), ang = Math.atan2(dy, dx);
  const c = (a * a + d * d - b * b) / (2 * a * d), e = ang + bend * Math.acos(Math.max(-1, Math.min(1, c)));
  const el = [s[0] + Math.cos(e) * a, s[1] + Math.sin(e) * a], k = d / (dd || 1); return { el, wr: [s[0] + dx * k, s[1] + dy * k] };
}
// pastel strokes clipped to a path (or a rect): n strokes of length len at angle ang ± jitter, colours picked from cols
function rdHatch(x, r, box, n, cols, ang, len, wd, alpha, clip) {
  x.save(); if (clip) x.clip(clip); x.lineCap = 'round'; const [x0, y0, x1, y1] = box;
  for (let i = 0; i < n; i++) { const px = x0 + r() * (x1 - x0), py = y0 + r() * (y1 - y0), a = ang + (r() - .5) * .35, l = len * (.6 + r() * .8);
    x.globalAlpha = alpha * (.4 + r() * .6); x.strokeStyle = cols[(r() * cols.length) | 0]; x.lineWidth = wd * (.6 + r() * .8); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  x.restore();
}

async function buildRoadPastel() {
  const { rng, canvas, fbm, clamp, lerp } = Pilot, L = rdLayout(), { W, H, V, S, hz, X0, X1, Y1 } = L, R0 = V ? W : H;
  RDP.L = L;
  // the road: a smooth curve through its points, sampled by arc length
  { const pts = L.road.map(([x, y]) => [x * W, y * H]), sm = [];
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 40; k++) { const t = k / 40, t2 = t * t, t3 = t2 * t; sm.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
    sm.push(pts[pts.length - 1]); const len = [0]; for (let i = 1; i < sm.length; i++) len.push(len[i - 1] + Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1]));
    RDP.rs = sm; RDP.rl = len; }
  RDP.wd = y => lerp(.008 * W, (V ? .2 : .13) * W, clamp((y - hz) / (H - hz)) ** 1.15);   // road width by depth
  RDP.hs = y => L.fh * clamp((y - hz) / (L.sy * H), .16, 2.2);                               // figure height by depth
  RDP.aAtY = yy => { const s = RDP.rs; for (let i = 0; i < s.length; i++) if (s[i][1] <= yy) return RDP.rl[i]; return RDP.rl[s.length - 1]; };   // the road runs from the bottom up

  const ox = X0, oy = hz - .02 * H, LW = Math.round((X1 - X0) * S), LH = Math.round((Y1 - oy) * S);
  RDP.land = { ox, oy, w: X1 - X0, h: Y1 - oy };
  // the land (fields, olive groves, the road), painted once in the daylight colours; tinted per frame by the light
  { const c = canvas(LW, LH), x = c.getContext('2d'), r = rng(7); x.scale(S, S); x.translate(-ox, -oy);
    const gr = x.createLinearGradient(0, hz, 0, Y1); gr.addColorStop(0, '#b8a07c'); gr.addColorStop(.12, '#c4a066'); gr.addColorStop(1, '#8a6a42'); x.fillStyle = gr; x.fillRect(X0, hz, X1 - X0, Y1 - hz);   // the land starts at the horizon (the far hills show above it)
    const cols = ['#c9a56a', '#b8955e', '#9c7a4c', '#d8b97c', '#c08a6e', '#7d6448', '#e3c48a', '#efd29a', '#6e5440', '#c9738a', '#4a4470', '#8a9a5a'];
    const wts = [14, 14, 12, 10, 8, 8, 8, 5, 6, 3, 4, 5], tot = wts.reduce((a, b) => a + b);
    const pick = () => { let v = r() * tot; for (let i = 0; i < wts.length; i++) { v -= wts[i]; if (v < 0) return cols[i]; } return cols[0]; };
    const hgt = Y1 - hz;
    { const g2 = x.createLinearGradient(0, hz, 0, hz + .06 * H); g2.addColorStop(0, 'rgba(150,140,180,.7)'); g2.addColorStop(1, 'rgba(150,140,180,0)'); x.fillStyle = g2; x.fillRect(X0, hz, X1 - X0, .06 * H); }   // the far land, bluer
    for (let i = 0; i < 70000; i++) { const y = hz + Math.pow(r(), .6) * hgt, d = (y - hz) / hgt, px = X0 + r() * (X1 - X0), len = 2 + d * 60 * (.6 + r() * .8), wd = .7 + d * 5 * (.6 + r() * .6);
      const fld = fbm(px * .004 + 3, y * .009, 3); x.globalAlpha = (.4 + r() * .5) * (.55 + .45 * Math.min(1, d * 8)); x.strokeStyle = fld > .62 && r() < .5 ? '#a8a060' : fld < .36 && r() < .5 ? '#e6c88c' : pick(); x.lineWidth = wd; x.lineCap = 'round';
      const lean = (r() - .5) * .5; x.beginPath(); x.moveTo(px, y); x.lineTo(px + lean * len, y - len); x.stroke(); }
    // a dusk-blue shadow band or two breaking the plain into planes
    x.globalAlpha = 1; x.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 8; i++) { const px = X0 + r() * (X1 - X0), py = hz + .05 * hgt + r() * (hgt * .5), rr = (.2 + .25 * r()) * R0; const gg = x.createRadialGradient(px, py, 0, px, py, rr);
      gg.addColorStop(0, 'rgba(120,108,150,.4)'); gg.addColorStop(1, 'rgba(120,108,150,0)'); x.fillStyle = gg; x.fillRect(px - rr, py - rr, 2 * rr, 2 * rr); }
    x.globalCompositeOperation = 'source-over';
    // the crest the road goes over (a light seam of grass on its brow)
    // the road: a pale dusty band, strokes along it, darker ruts and edges
    { const s = RDP.rs, left = [], right = [];
      for (let i = 0; i < s.length; i++) { const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl, hw = RDP.wd(s[i][1]) / 2;
        left.push([s[i][0] + nx * hw, s[i][1] + ny * hw]); right.push([s[i][0] - nx * hw, s[i][1] - ny * hw]); }
      const p = new Path2D(); left.forEach((q, i) => i ? p.lineTo(...q) : p.moveTo(...q)); for (let i = right.length - 1; i >= 0; i--) p.lineTo(...right[i]); p.closePath(); RDP.roadPath = p;
      x.fillStyle = '#d4b88a'; x.fill(p);
      x.save(); x.clip(p); for (let i = 0; i < 12000; i++) { const k = r() * (s.length - 2) | 0, a = s[k], b = s[k + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (r() - .5) * .9, hw = RDP.wd(a[1]) / 2, off = (r() - .5) * 2.1 * hw, d = clamp((a[1] - hz) / (H - hz));
        const nx = -Math.sin(ang), ny = Math.cos(ang), px = a[0] + nx * off, py = a[1] + ny * off, l = (1.5 + 16 * d) * (.4 + r());   // short dusty dabs in all directions, not planks
        x.globalAlpha = .3 + .4 * r(); x.strokeStyle = ['#e8d0a0', '#f0dcb0', '#c4a478', '#b09070', '#dcc090', '#c8a0a0'][(r() * 6) | 0]; x.lineWidth = .8 + 5 * d * r(); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(ang) * l, py + Math.sin(ang) * l); x.stroke(); }
      x.globalAlpha = .4; x.strokeStyle = '#8a6c50'; for (const fr of [-.28, .28]) { x.lineWidth = 1; x.beginPath(); s.forEach((a, i) => { const b = s[Math.min(s.length - 1, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), hw = RDP.wd(a[1]) / 2, px = a[0] - Math.sin(ang) * hw * fr * 2, py = a[1] + Math.cos(ang) * hw * fr * 2;
        x.lineWidth = .5 + 3 * clamp((a[1] - hz) / (H - hz)); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); }
      x.restore(); x.globalAlpha = 1;
      // the edges: grass tufts leaning over
      for (const side of [left, right]) for (let i = 0; i < side.length; i += 2) { const [px, py] = side[i], d = clamp((py - hz) / (H - hz)); for (let k = 0; k < 3; k++) { x.globalAlpha = .5; x.strokeStyle = ['#8a7048', '#a8905c', '#6e5a48'][(r() * 3) | 0]; x.lineWidth = .6 + 3 * d;
        const l = (2 + 26 * d) * (.5 + r()); x.beginPath(); x.moveTo(px + (r() - .5) * 6 * d, py); x.lineTo(px + (r() - .5) * l * .6, py - l); x.stroke(); } } }
    RDP.landC = c;
    const bx0 = (V ? .4 : .36) * W, by0 = (V ? .37 : .44) * H, bw = (V ? .5 : .5) * W, bh = (V ? .28 : .34) * H, SH = 3.6, hc = canvas(Math.round(bw * SH), Math.round(bh * SH)), hx = hc.getContext('2d'), r2 = rng(97);
    hx.imageSmoothingQuality = 'high'; hx.drawImage(c, (bx0 - ox) * S, (by0 - oy) * S, bw * S, bh * S, 0, 0, hc.width, hc.height); hx.scale(SH, SH); hx.translate(-bx0, -by0); hx.lineCap = 'round';
    for (let i = 0; i < 26000; i++) { const y = by0 + r2() * bh, d = Math.max(0, (y - hz) / hgt), px = bx0 + r2() * bw, len = 2 + d * 60 * (.6 + r2() * .8), wd = .5 + d * 3 * (.6 + r2() * .6);
      hx.globalAlpha = .3 + .4 * r2(); hx.strokeStyle = pick(); hx.lineWidth = wd; const lean = (r2() - .5) * .5; hx.beginPath(); hx.moveTo(px, y); hx.lineTo(px + lean * len, y - len); hx.stroke(); }
    hx.save(); hx.clip(RDP.roadPath); hx.fillStyle = 'rgba(212,184,138,.55)'; hx.fillRect(bx0, by0, bw, bh); const sR = RDP.rs;
    for (let i = 0; i < 14000; i++) { const k = r2() * (sR.length - 2) | 0, a = sR[k]; if (a[1] < by0 - 10 || a[1] > by0 + bh + 10) continue; const b = sR[k + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (r2() - .5) * .9, hw = RDP.wd(a[1]) / 2, off = (r2() - .5) * 2.1 * hw, d = clamp((a[1] - hz) / (H - hz));
      const px = a[0] - Math.sin(ang) * off, py = a[1] + Math.cos(ang) * off, l = (1 + 8 * d) * (.4 + r2()); hx.globalAlpha = .3 + .4 * r2(); hx.strokeStyle = ['#e8d0a0', '#f0dcb0', '#c4a478', '#b09070', '#dcc090', '#c8a0a0'][(r2() * 6) | 0]; hx.lineWidth = .4 + 2 * d * r2(); hx.beginPath(); hx.moveTo(px, py); hx.lineTo(px + Math.cos(ang) * l, py + Math.sin(ang) * l); hx.stroke(); }
    hx.restore(); RDP.landHi = { c: hc, x: bx0, y: by0, w: bw, h: bh }; }
  // the far hills along the horizon (violet), and Mount Hermon far to the north with snow (body and snow apart: the snow takes the
  // alpenglow); drawn at a slower parallax
  { const c = canvas(LW, Math.round(.22 * H * S)), x = c.getContext('2d'), r = rng(11); x.scale(S, S); x.translate(-ox, -(hz - .2 * H));
    const ridge = (base, amp, f, seed) => { const p = new Path2D(); p.moveTo(X0, hz + 4); for (let px = X0; px <= X1; px += 10) p.lineTo(px, base - amp * fbm(px * f + seed, seed, 4)); p.lineTo(X1, hz + 4); p.closePath(); return p; };
    const p0 = ridge(hz - .004 * H, .03 * H, .0035, 1.3), p1 = ridge(hz + .002 * H, .016 * H, .006, 4.1);
    x.fillStyle = '#8a7cae'; x.fill(p0); rdHatch(x, r, [X0, hz - .05 * H, X1, hz + 4], 2400, ['#9a8cbc', '#7a6c9e', '#c9a0b0'], -.45, 14, 2.5, .35, p0);
    x.fillStyle = '#76689c'; x.fill(p1); rdHatch(x, r, [X0, hz - .03 * H, X1, hz + 4], 1600, ['#8a7cae', '#5e5288', '#c08aa0'], 2.6, 12, 2.5, .3, p1);
    RDP.hills = { c, y0: hz - .2 * H }; }
  { const [hx0, hx1, px, py] = L.herm, c = canvas(LW, Math.round(.25 * H * S)), sn = canvas(LW, Math.round(.25 * H * S)), x = c.getContext('2d'), s = sn.getContext('2d'), r = rng(17);
    for (const g of [x, s]) { g.scale(S, S); g.translate(-ox, -(hz - .22 * H)); }
    const top = X => { const t = (X / W - hx0) / (hx1 - hx0), k = (px - hx0) / (hx1 - hx0), gs = (c, s) => Math.exp(-(((t - c) / s) ** 2));   // a long massif: several shoulders and a broad summit, not a cone
      const e = Math.min(1, .78 * gs(k, .2) + .42 * gs(k - .22, .13) + .36 * gs(k + .19, .15) + .2 * gs(k + .38, .1)) * Math.min(1, t * 6, (1 - t) * 6);
      return hz - (hz - py * H) * Math.max(0, e) * (.92 + .1 * fbm(X * .008, 2, 3)) - .004 * H * fbm(X * .04, 5, 3); };
    const p = new Path2D(); p.moveTo(hx0 * W, hz + 2); for (let X = hx0 * W; X <= hx1 * W; X += 6) p.lineTo(X, Math.min(hz + 2, top(X))); p.lineTo(hx1 * W, hz + 2); p.closePath();
    x.fillStyle = '#a49cc6'; x.fill(p); rdHatch(x, r, [hx0 * W, py * H, hx1 * W, hz], 2200, ['#b4acd2', '#9088b8', '#c8b8d8'], -.6, 12, 2.2, .35, p);
    s.save(); s.clip(p); for (let i = 0; i < 2600; i++) { const X = hx0 * W + r() * (hx1 - hx0) * W, t0 = top(X), dep = (hz - t0) * (.12 + .3 * fbm(X * .02, 9, 3) ** 2), y = t0 + r() * dep;
      s.globalAlpha = (.5 + .5 * r()) * (1 - (y - t0) / (dep + 1)); s.strokeStyle = '#fff'; s.lineWidth = 1.2 + 2 * r(); s.beginPath(); s.moveTo(X, y); s.lineTo(X + (r() - .5) * 8, y + 4 + 8 * r()); s.stroke(); } s.restore();
    RDP.herm = { c, sn, y0: hz - .22 * H }; RDP.snowT = canvas(LW, Math.round(.25 * H * S)); }
  // chalk cloud bands (white, tinted per frame) and the paper
  { const c = canvas(Math.round(1.4 * W), Math.round(hz)), x = c.getContext('2d'), r = rng(31);
    for (let b = 0; b < 8; b++) { const y0 = (.08 + .8 * r()) * hz, x0 = r() * W, len = (.4 + .7 * r()) * W;
      for (let i = 0; i < 300; i++) { const px = x0 + r() * len, py = y0 + (r() - .5) * .012 * H + Math.sin(px * .004) * .006 * H; x.globalAlpha = .05 + r() * .13; x.strokeStyle = '#fff'; x.lineWidth = 2 + r() * 6; x.lineCap = 'round';
        x.beginPath(); x.moveTo(px, py); x.lineTo(px + .03 * W + r() * .09 * W, py + (r() - .5) * 3); x.stroke(); } }
    RDP.clouds = c; RDP.cloudT = canvas(c.width, c.height); }
  { const c = canvas(W, Math.round(hz * 1.1)), x = c.getContext('2d'), r = rng(41); rdHatch(x, r, [0, 0, W, c.height], 5000, ['#fff', '#fff', '#2a2050'], -.5, 26, 4, .07); RDP.skyHatch = c; }
  RDP.paper = Pilot.speckle(W, H, 60, 9, .7);
  { const c = canvas(256, 256), x = c.getContext('2d'), r = rng(51); for (let i = 0; i < 2200; i++) { x.globalAlpha = .25 + .6 * r(); x.fillStyle = '#000'; x.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 1.5); } RDP.grain = c; }
  RDP.fl = canvas(W, H); RDP.rimC = canvas(W, H); RDP.rimS = canvas(Math.ceil(W * .9), Math.ceil(H * .45)); RDP.shC = canvas(Math.ceil(W / 2), Math.ceil(H / 2));
  // the band: [rank behind Jesus (arc px), side offset (× road width), options]; Jesus first, Peter in the first row
  { const fh = L.fh, rows = [[1.75, -.34], [1.6, .0], [2.15, .42], [2.45, -.3], [2.5, .04], [1.9, .36], [3.3, -.28], [3.35, .05], [3.3, .36], [4.1, -.3], [4.15, .02], [4.1, .34]];   // four rows of three
    const r = rng(13);
    const hl = RDP.hs(L.lead * H); RDP.hl = hl;
    RDP.band = [{ back: 0, side: 0, o: { w: .95, cloth: 1.1 }, jesus: true }].concat(rows.map(([b, sd], i) => ({ back: b * hl * 1.1, side: sd, o: { w: .9 + .2 * r(), cloth: .9 + .35 * r(), hem: .95 + .2 * r(), peak: r() * .025, staff: r() < .3, lean: .01 + .03 * r() }, peter: i === 1 })));
    RDP.band.forEach((b, i) => { b.body = i ? ['#6a564e', '#5a4c62', '#74604a', '#564a5c', '#6c5052', '#625a5a'][i % 6] : '#7a6a68'; b.ph0 = r() * 6.283; b.hc = i === 0 ? '#e0d4c0' : r() < .55 ? ['#d8c8a8', '#cdbb9c', '#e2d6c2', '#b8a890'][(r() * 4) | 0] : null; }); RDP.band[0].body = '#a49688'; RDP.band[0].hc = '#ebe2d2'; RDP.band[2].body = '#7e4c44'; RDP.band[2].hc = '#d6c6a6'; RDP.aLead = RDP.aAtY(L.lead * H); }   // muted robes (earth, dusty blue, madder), not black
  // 'protest' — its own nearer view from the side: a low horizon at shoulder height, far hills with a dip where the last light is,
  // the fields, and the road crossing the frame left to right under their feet (right = on toward Jerusalem)
  { const c = canvas(Math.round(W * 1.12), Math.round(H * 1.12)), x = c.getContext('2d'), r = rng(61), ph0 = V ? H * .2 : H * .3, pfy = V ? H * .58 : H * .705, hp = pfy - .9 * ph0, Wd = c.width, Hd = c.height; x.translate((Wd - W) / 2, (Hd - H) / 2);
    RDP.php = hp; RDP.pfy = pfy; RDP.ph = ph0;
    const ridge = new Path2D(); ridge.moveTo(-.1 * W, hp + 4); for (let px = -.1 * W; px <= 1.1 * W; px += 8) { const notch = Math.exp(-(((px - .5 * W) / (.1 * W)) ** 2)); ridge.lineTo(px, hp - (.03 * H * fbm(px * .004, 3, 4) + .01 * H) * (1 - .75 * notch)); } ridge.lineTo(1.1 * W, hp + 4); ridge.closePath();
    x.fillStyle = '#7a6c9e'; x.fill(ridge); rdHatch(x, r, [-.1 * W, hp - .07 * H, 1.1 * W, hp + 4], 2400, ['#8a7cae', '#5e5288', '#b08aa8'], -.45, 16, 3, .35, ridge);
    const gr = x.createLinearGradient(0, hp, 0, H * 1.06); gr.addColorStop(0, '#a89070'); gr.addColorStop(.25, '#b8955e'); gr.addColorStop(1, '#7a5a3a'); x.fillStyle = gr; x.fillRect(-.1 * W, hp, 1.2 * W, H);
    const cols = ['#c9a56a', '#b8955e', '#9c7a4c', '#d8b97c', '#c08a6e', '#7d6448', '#e3c48a', '#6e5440', '#c9738a', '#4a4470'];
    for (let i = 0; i < 30000; i++) { const y = hp + Math.pow(r(), .55) * (H * 1.06 - hp), d = (y - hp) / (H - hp), px = -.1 * W + r() * 1.2 * W, len = 3 + d * 55 * (.6 + r() * .8), wd = .6 + d * 3.2 * (.6 + r() * .6);
      x.globalAlpha = (.28 + r() * .32); x.strokeStyle = cols[(r() * cols.length) | 0]; x.lineWidth = wd; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, y); x.lineTo(px + (r() - .5) * .5 * len, y - len); x.stroke(); }
    // the road, seen from the side: a band across the frame under their feet, its far edge a little higher to the right
    const top = X => pfy - .07 * ph0 - .02 * ph0 * (X / W), bot = X => pfy + .12 * ph0 + .01 * ph0 * Math.sin(X / W * 3);
    const rp = new Path2D(); rp.moveTo(-.1 * W, top(-.1 * W)); for (let X = -.1 * W; X <= 1.1 * W; X += 12) rp.lineTo(X, top(X)); for (let X = 1.1 * W; X >= -.1 * W; X -= 12) rp.lineTo(X, bot(X)); rp.closePath();
    x.globalAlpha = 1; x.fillStyle = '#d0b488'; x.fill(rp); rdHatch(x, r, [-.1 * W, top(1.1 * W) - 4, 1.2 * W, bot(0) + .03 * ph0], 7000, ['#e8d0a0', '#f0dcb0', '#c4a478', '#b09070', '#c8a0a0'], 0, 22, 3, .4, rp);
    x.globalAlpha = .5; for (let X = -.1 * W; X <= 1.1 * W; X += 3) { const e = r() < .5, yy = e ? top(X) : bot(X), l = (4 + 16 * r()) * (e ? .6 : 1); x.strokeStyle = ['#8a7048', '#a8905c', '#6e5a48'][(r() * 3) | 0]; x.lineWidth = 1 + 2 * r(); x.beginPath(); x.moveTo(X, yy); x.lineTo(X + (r() - .5) * l * .5, yy - l); x.stroke(); }   // grass at its edges
    x.globalAlpha = 1; RDP.pland = c; }
}

function roadPastel(ctx, u, mode = 'confess') {
  const { clamp, lerp, ss, ramp, rgb, mix, hex } = Pilot, L = RDP.L, { W, H, V, hz } = L, R0 = V ? W : H;
  const T = mode === 'confess' ? .05 + .1 * ss(-.8, 8.5, u) : mode === 'foretell' ? .15 + .45 * ss(0, 8, u) : mode === 'protest' ? .62 + .12 * ss(-.8, 5, u) : .78 + .22 * ss(-.8, 5.2, u);
  const C = k => ramp(RD_C[k], T);
  if (mode === 'protest') return rdProtest(ctx, u, T, C);
  // camera (world → screen) with parallax per layer
  const K = V ? { confess: [[-.8, .55 * W, .5 * H, 1.22], [2.2, .6 * W, .505 * H, 1.4], [3.4, .755 * W, .438 * H, 4.0], [6.5, .75 * W, .442 * H, 4.2], [8.5, .6 * W, .518 * H, 1.42]], foretell: [[-.8, .6 * W, .518 * H, 1.42], [4, .63 * W, .51 * H, 1.32], [8.8, .66 * W, .5 * H, 1.22]], alone: [[-.8, .62 * W, .5 * H, 1.22], [5.4, .6 * W, .512 * H, 1.36]] }
              : { confess: [[-.8, .5 * W, .56 * H, 1.22], [2.2, .54 * W, .565 * H, 1.4], [3.4, .69 * W, .522 * H, 3.1], [6.5, .685 * W, .525 * H, 3.25], [8.5, .55 * W, .575 * H, 1.42]], foretell: [[-.8, .55 * W, .575 * H, 1.42], [4, .58 * W, .57 * H, 1.32], [8.8, .61 * W, .56 * H, 1.22]], alone: [[-.8, .58 * W, .56 * H, 1.22], [5.4, .56 * W, .57 * H, 1.36]] };   // nearer than before (the people 1.3–1.4×), always moving: a slow push in, a slow pull back
  let [fx, fy, z] = rdCam(K[mode], u); fx = clamp(fx, L.X0 + W / 2 / z, L.X1 - W / 2 / z); fy = clamp(fy, H / 2 / z, L.Y1 - H / 2 / z);
  const camP = (g, p) => { const zp = 1 + (z - 1) * p; if (p < 1) { g.translate(W / 2, H / 2 + (hz - fy) * z); g.scale(zp, zp); g.translate(-(W / 2 + (fx - W / 2) * p), -hz); return; }   // far layers: zoom less, but stay standing on the land's horizon
    g.translate(W / 2, H / 2); g.scale(zp, zp); g.translate(-(W / 2 + (fx - W / 2) * p), -(H / 2 + (fy - H / 2) * p)); };
  const sc = (x, y) => [W / 2 + (x - fx) * z, H / 2 + (y - fy) * z];
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  // the sky (gold → rose → violet; looking away from the sun: the rose band and the earth's blue shadow rise on the horizon at dusk)
  { const [, hy] = sc(0, hz), g = ctx.createLinearGradient(0, hy - H * .75, 0, hy); g.addColorStop(0, rgb(mix(C('top'), [14, 14, 36], ss(.8, 1, T) * .4))); g.addColorStop(.55, rgb(C('top'))); g.addColorStop(.84, rgb(C('mid'))); g.addColorStop(1, rgb(C('hor')));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const es = ss(.5, 1, T); if (es > 0) { const g2 = ctx.createLinearGradient(0, hy - .07 * H * es, 0, hy); g2.addColorStop(0, 'rgba(90,84,140,0)'); g2.addColorStop(1, `rgba(80,76,136,${.55 * es})`); ctx.fillStyle = g2; ctx.fillRect(0, hy - .07 * H * es, W, .07 * H * es + 2); }
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .55; ctx.drawImage(RDP.skyHatch, 0, Math.min(0, hy - RDP.skyHatch.height)); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  // the southern horizon (right, where the road goes) darkens as the passion is told
  const south = mode === 'foretell' ? .55 * ss(1, 7, u) : mode === 'alone' ? .55 : 0;
  // stars: the first one in 'alone'
  if (mode === 'alone') { const a = ss(1.2, 2.6, u), tw = .85 + .15 * Math.sin(u * 6); if (a > 0) { const x = W * (V ? .7 : .74), y = H * (V ? .14 : .16), g = ctx.createRadialGradient(x, y, 0, x, y, 40);
    g.addColorStop(0, `rgba(255,248,230,${.9 * a * tw})`); g.addColorStop(.12, `rgba(255,240,220,${.45 * a})`); g.addColorStop(1, 'rgba(255,240,220,0)'); ctx.fillStyle = g; ctx.fillRect(x - 40, y - 40, 80, 80);
    ctx.fillStyle = `rgba(255,252,240,${a})`; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 6.283); ctx.fill(); ctx.globalAlpha = .5 * a; ctx.fillRect(x - 12, y - .7, 24, 1.4); ctx.fillRect(x - .7, y - 12, 1.4, 24); ctx.globalAlpha = 1; } }
  // clouds, tinted by the light, drifting
  { const cg = RDP.cloudT.getContext('2d'), cw = RDP.cloudT.width, ch = RDP.cloudT.height; cg.globalCompositeOperation = 'source-over'; cg.clearRect(0, 0, cw, ch); cg.drawImage(RDP.clouds, 0, 0); cg.globalCompositeOperation = 'source-in'; cg.fillStyle = rgb(mix(mix(C('hor'), [255, 230, 210], .35), C('mid'), ss(.6, 1, T))); cg.fillRect(0, 0, cw, ch);
    const tt = u + { confess: 0, foretell: 8, alone: 20 }[mode]; ctx.save(); camP(ctx, .15); ctx.globalAlpha = .85 - .35 * ss(.7, 1, T); ctx.drawImage(RDP.cloudT, -.2 * W - tt * 4, 0, cw, hz); ctx.restore(); }
  // Hermon far off (snow with the alpenglow), the far hills, then the land
  { const hm = RDP.herm, lw = RDP.land.w, lh = hm.c.height / L.S; ctx.save(); camP(ctx, .25); ctx.globalAlpha = .62; ctx.drawImage(hm.c, RDP.land.ox, hm.y0, lw, lh);
    const sg = RDP.snowT.getContext('2d'); sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, RDP.snowT.width, RDP.snowT.height); sg.drawImage(hm.sn, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = rgb(C('snow')); sg.fillRect(0, 0, RDP.snowT.width, RDP.snowT.height);
    ctx.globalAlpha = .75; ctx.drawImage(RDP.snowT, RDP.land.ox, hm.y0, lw, lh); ctx.globalAlpha = 1; ctx.restore(); }
  { const hl = RDP.hills; ctx.save(); camP(ctx, .55); ctx.drawImage(hl.c, RDP.land.ox, hl.y0, RDP.land.w, hl.c.height / L.S); ctx.restore(); }
  ctx.save(); camP(ctx, 1); ctx.drawImage(RDP.landC, RDP.land.ox, RDP.land.oy, RDP.land.w, RDP.land.h);
  { const a = ss(1.5, 2.3, z); if (a > 0) { const lh = RDP.landHi; ctx.globalAlpha = a; ctx.drawImage(lh.c, lh.x, lh.y, lh.w, lh.h); ctx.globalAlpha = 1; } }   // the sharp patch in the close-up
  // moving cloud shadows over the fields (cool), the band's spot kept in the sun
  { const tt = u + { confess: 0, foretell: 8, alone: 20 }[mode], r = Pilot.rng(71); ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 5; i++) { const px = L.X0 + ((r() * 1.6 + tt * .012) % 1.6) * W, py = hz + (.06 + .5 * r()) * (H - hz), rr = (.18 + .2 * r()) * R0;
      const g = ctx.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, `rgba(140,128,170,${.35 * (1 - ss(.7, 1, T))})`); g.addColorStop(1, 'rgba(140,128,170,0)'); ctx.fillStyle = g; ctx.fillRect(px - rr, py - rr, 2 * rr, 1.6 * rr); }
    ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  // the light falls over the whole land: multiply toward dusk; the south darkens
  { const [, hy] = sc(0, hz); ctx.globalCompositeOperation = 'multiply'; const lg = ctx.createLinearGradient(0, hy - .04 * H, 0, hy + .06 * H); lg.addColorStop(0, 'rgba(255,255,255,1)'); lg.addColorStop(1, rgb(C('land'))); ctx.fillStyle = lg; ctx.fillRect(0, hy - .04 * H, W, H);
    if (south > 0) { const [sx, sy] = sc(L.road[8][0] * W, L.crest * H), rr = .75 * R0 * z, g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr); g.addColorStop(0, `rgba(70,60,110,${south})`); g.addColorStop(1, 'rgba(70,60,110,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    ctx.globalCompositeOperation = 'source-over'; }
  // warm low sun from behind-left across the land (gone by dusk)
  { const a = .3 * (1 - ss(.45, .8, T)); if (a > 0) { ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, 0, W, H * .4); g.addColorStop(0, rgb(C('light'), a)); g.addColorStop(.6, rgb(C('light'), 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; } }

  // the band on the road
  const B = RDP.band, at = a => { const s = RDP.rs, l = RDP.rl; let lo = 0, hi = l.length - 1; a = clamp(a, 0, l[hi]); while (hi - lo > 1) { const m = (lo + hi) >> 1; if (l[m] < a) lo = m; else hi = m; }
    const k = (a - l[lo]) / ((l[hi] - l[lo]) || 1), p = [lerp(s[lo][0], s[hi][0], k), lerp(s[lo][1], s[hi][1], k)], dx = s[hi][0] - s[lo][0], dy = s[hi][1] - s[lo][1], dl = Math.hypot(dx, dy) || 1; return { p, n: [-dy / dl, dx / dl] }; };
  const vel = RDP.hl * .75, walkF = (uu, ts) => uu <= 0 ? uu : uu < ts ? uu - uu * uu / (2 * ts) : ts / 2;
  const peterStep = mode === 'confess' ? ss(3.3, 4.5, u) : 1, light = rgb(C('light')), Lt = [.94, .34];
  const shLen = mode === 'confess' ? 1.3 : mode === 'foretell' ? lerp(1.4, 5.2, ss(0, 6.5, u)) : 0, shA = mode === 'alone' ? 0 : .17 * (1 - ss(.62, .78, T)), shD = V ? [.82, -.57] : [.86, -.5];
  const items = B.map((b, i) => {
    let a, walk = 0, face = 1, ph;
    if (mode === 'confess') { const ts = 1.1 + .07 * b.back / L.fh; a = RDP.aLead - b.back * (1 - .06 * ss(.6, 2, u)) + vel * (walkF(u, ts) - .55); const wv = u < ts ? 1 - u / ts : 0; walk = clamp(wv * 1.4); ph = b.ph0 + (a / (RDP.hl * .55)) * Math.PI;
      if (b.jesus) face = lerp(1, -1, ss(.85, 1.7, u));
      if (b.peter) { a += b.back * .5 * peterStep; walk = Math.max(walk, Math.sin(Math.PI * peterStep) * .9); ph = b.ph0 + (a / (RDP.hl * .55)) * Math.PI; } }
    else if (mode === 'foretell') { a = RDP.aLead - b.back * .94 + (b.peter ? b.back * .5 : 0); ph = b.ph0;
      if (b.jesus) { face = lerp(-1, 1, ss(.2, 1.5, u)); const st = ss(1.3, 3.2, u); a += RDP.hl * .5 * st; walk = Math.sin(Math.PI * st) * .9; ph = b.ph0 + (a / (RDP.hl * .55)) * Math.PI; } }
    else { const rest = RDP.aLead - b.back * .94 + RDP.hl * 1.6; if (b.peter) { a = RDP.aLead - RDP.hl * 3; ph = b.ph0; walk = 0; }   // the band has walked on; Peter stays a few steps behind the last of them
      else { a = rest + RDP.hl * .6 + vel * .95 * (u + .8); walk = 1; ph = b.ph0 + (a / (RDP.hl * .55)) * Math.PI; } }
    const { p, n } = at(a), hw = RDP.wd(p[1]) / 2, side = b.peter && mode !== 'confess' ? -.1 : b.peter ? lerp(b.side, -.1, peterStep) : b.side;
    const lat = side * Math.max(hw * 1.6, RDP.hl * 1.6), X = p[0] + n[0] * lat, Y = p[1] + n[1] * lat;
    return { b, i, X, Y, h: RDP.hs(Y), walk, face, ph }; }).sort((a, b) => a.Y - b.Y);
  // shadows: long and running up the road ahead of each (from the low sun behind us)
  if (shLen > 0 && shA > 0) { const sh = RDP.shC, sg = sh.getContext('2d'); sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, sh.width, sh.height); sg.scale(.5, .5); sg.fillStyle = 'rgb(84,72,124)';
    const nrm = [-shD[1], shD[0]];
    for (const it of items) { const [px, py] = sc(it.X, it.Y), h = it.h * z, Ls = h * shLen * .62;   // his own silhouette laid down along the road from his feet
      const Ps = (x, y) => [px + shD[0] * (-y) * Ls + nrm[0] * x * h * .9, py + shD[1] * (-y) * Ls + nrm[1] * x * h * .9 + .02 * h];
      sg.fill(rdPerson(Ps, Object.assign({}, it.b.o, { face: 1, ph: it.ph, walk: it.walk }))); }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = shA * 2.2; ctx.drawImage(sh, 0, 0, W, H); ctx.restore(); }   // one layer: where shadows overlap it is no darker
  // Peter's step into the warmest light (confess)
  const glow = mode === 'confess' ? ss(3.2, 4.6, u) * (1 - .3 * ss(6.2, 8, u)) : 0, P0 = items.find(it => it.b.peter);
  if (glow > 0 && P0) { const [px, py] = sc(P0.X, P0.Y - P0.h * .3), rr = .2 * R0 * z; ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(px, py, 0, px, py, rr);
    g.addColorStop(0, `rgba(255,214,140,${.75 * glow})`); g.addColorStop(.4, `rgba(255,190,120,${.3 * glow})`); g.addColorStop(1, 'rgba(255,170,100,0)'); ctx.fillStyle = g; ctx.fillRect(px - rr, py - rr, 2 * rr, 2 * rr);
    const [fx2, fy2] = sc(P0.X, P0.Y), pr = P0.h * z * 1.3, g3 = ctx.createRadialGradient(fx2, fy2, 0, fx2, fy2, pr); g3.addColorStop(0, `rgba(255,226,160,${.7 * glow})`); g3.addColorStop(1, 'rgba(255,200,130,0)');
    ctx.save(); ctx.translate(fx2, fy2); ctx.scale(1, .4); ctx.translate(-fx2, -fy2); ctx.fillStyle = g3; ctx.fillRect(fx2 - pr, fy2 - pr, 2 * pr, 2 * pr); ctx.restore(); ctx.globalCompositeOperation = 'source-over'; }   // a pool of sun on the road where he stands
  // the figures, on their own layer (grained like pastel), nearest last
  const fl = RDP.fl, g = fl.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  const rimA = 1 - .55 * ss(.6, .95, T), land = C('land');
  for (const it of items) { const [px, py] = sc(it.X, it.Y), h = it.h * z, P = (x, y) => [px + x * h, py + y * h], o = Object.assign({}, it.b.o, { face: it.face, ph: it.ph, walk: it.walk });
    if (it.b.hc) o.hcCol = rgb(Pilot.hex(it.b.hc).map((c, k) => c * land[k] / 255)); o.skin = rgb(Pilot.hex('#b48a6e').map((c, k) => c * land[k] / 255)); const path = rdPerson(P, o), boost = it.b.peter ? 1 + .8 * glow : 1; rdFigure(g, path, P, o, rgb(mix(Pilot.hex(it.b.body).map((c, k) => c * land[k] / 255), [236, 190, 130], it.b.peter ? .45 * glow : 0)), light, Lt, Math.max(1.4, .05 * h * boost), clamp(rimA * boost));
    if (it.b.jesus) RDP.lastJesus = [px, py, h]; }
  g.globalCompositeOperation = 'destination-out'; g.globalAlpha = .12; g.fillStyle = g.createPattern(RDP.grain, 'repeat'); g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  ctx.drawImage(fl, 0, 0);
  if (glow > 0 && P0) { const [px, py] = sc(P0.X, P0.Y - P0.h * .5), rr = .55 * R0, g = ctx.createRadialGradient(px, py, .04 * R0, px, py, rr); g.addColorStop(0, 'rgb(255,255,255)'); g.addColorStop(1, `rgb(${255 - 28 * glow | 0},${255 - 28 * glow | 0},${255 - 18 * glow | 0})`);   // the rest a shade under: he is the brightest
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const g4 = ctx.createRadialGradient(px, py, 0, px, py, .7 * R0); g4.addColorStop(0, `rgba(255,210,140,${.18 * glow})`); g4.addColorStop(1, 'rgba(255,200,130,0)'); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g4; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  rdExpose(ctx, T);
  rdFinish(ctx, T, L.band);
  ctx.restore();
}

// exposure: the bright gold frames are held down (the picture lives in the middle values); the dusk is left as it is
function rdExpose(ctx, T) { const e = Pilot.lerp(.76, 1, Pilot.ss(.2, .75, T)); if (e < 1) { const { W, H } = Pilot, v = Math.round(255 * e); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgb(${v},${v},${Math.min(255, v + 6)})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; } }
// the paper, the words' band kept calm, a soft vignette
function rdFinish(ctx, T, band) {
  const { W, H } = Pilot, V = Pilot.ori === 'v';
  { const y0 = H * (band - .01), y1 = H * (band + (V ? .07 : .06)), g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(40,32,70,0)'); g.addColorStop(1, 'rgba(40,32,70,.5)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); ctx.fillStyle = 'rgba(40,32,70,.5)'; ctx.fillRect(0, y1, W, H - y1); }
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .5; ctx.drawImage(RDP.paper, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const vg = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .45, W / 2, H * .45, Math.hypot(W, H) * .62); vg.addColorStop(0, 'rgba(24,18,44,0)'); vg.addColorStop(1, 'rgba(24,18,44,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

// 'protest' (마 16:22), from the side: the road crosses the frame; Jesus walks to the right (toward Jerusalem), in profile; Peter comes
// round in front of him from the right and turns to face him, barring the road: one hand takes Jesus's forearm (elbow bent, the hand
// shown), the other is held up, palm forward — stop. Between their heads, in the dip of the hills, the last line of sunlight.
// Fixed bone lengths (two-bone IK from each shoulder to its target).
function rdProtest(ctx, u, T, C) {
  const { ss, clamp, lerp, rgb, mix } = Pilot, L = RDP.L, { W, H, V } = L, hp = RDP.php, fy = RDP.pfy, h0 = RDP.ph;
  const z = 1 + .07 * ss(-.8, 5.1, u), dx = -.015 * W * ss(-.8, 5.1, u), cx0 = W / 2, cy0 = hp;
  const S = (x, y) => [cx0 + (x - cx0) * z + dx, cy0 + (y - cy0) * z], h = h0 * z;   // the camera: a slow push in and drift
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // the sky: rose → violet
  { const g = ctx.createLinearGradient(0, 0, 0, S(0, hp)[1]); g.addColorStop(0, rgb(C('top'))); g.addColorStop(.6, rgb(C('mid'))); g.addColorStop(1, rgb(C('hor'))); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .5; ctx.drawImage(RDP.skyHatch, 0, 0, W, hp); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  { const cg = RDP.cloudT.getContext('2d'), cw = RDP.cloudT.width, ch = RDP.cloudT.height; cg.globalCompositeOperation = 'source-over'; cg.clearRect(0, 0, cw, ch); cg.drawImage(RDP.clouds, 0, 0); cg.globalCompositeOperation = 'source-in'; cg.fillStyle = rgb(mix(C('hor'), [255, 220, 210], .3)); cg.fillRect(0, 0, cw, ch);
    ctx.globalAlpha = .7; ctx.drawImage(RDP.cloudT, -.2 * W - u * 5 + dx * .3, 0, cw, hp); ctx.globalAlpha = 1; }
  const lastA = 1 - .35 * ss(2.6, 4.8, u), [gx, gy] = S(W * .5, hp);
  { ctx.globalCompositeOperation = 'screen'; const R = .35 * W, g = ctx.createRadialGradient(gx, gy, 0, gx, gy, R); g.addColorStop(0, `rgba(255,204,150,${.65 * lastA})`); g.addColorStop(.3, `rgba(240,150,130,${.25 * lastA})`); g.addColorStop(1, 'rgba(200,120,140,0)');
    ctx.fillStyle = g; ctx.fillRect(gx - R, gy - R, 2 * R, 2 * R); ctx.globalCompositeOperation = 'source-over'; }
  { const pl = RDP.pland, [x0, y0] = S(-(pl.width - W) / 2, -(pl.height - H) / 2); ctx.drawImage(pl, x0, y0, pl.width * z, pl.height * z); }
  // (no bright seam on the horizon here: at face height it read as a line joining their heads; the glow in the dip carries the last light)
  ctx.globalCompositeOperation = 'multiply'; { const g = ctx.createLinearGradient(0, gy - .01 * H, 0, gy + .08 * H); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, rgb(C('land'))); ctx.fillStyle = g; ctx.fillRect(0, gy - .01 * H, W, H); } ctx.globalCompositeOperation = 'source-over';
  // the two, in true profile (the camera square to the road), in units of their height; x from the frame centre
  const B0 = (x, y) => S(cx0 + x * h0, fy + y * h0);
  const jwalk = 1 - ss(.1, .9, u), jx = -.33 + .05 * ss(-.8, .8, u), pull = ss(1.3, 3.1, u) * (1 - .3 * ss(3.6, 4.3, u)), jl = .03 - .04 * pull;
  const jo = { w: .92, lean: jl, face: 1, cloth: 1.05, hem: 1.05, ph: 2.6 * ss(-.8, .9, u) * 3, walk: jwalk, profile: 1 };
  const Pj = (x, y) => B0(jx + x, y), jesus = rdPerson(Pj, jo);
  const arrive = ss(-.7, .9, u), px = lerp(.8, .235, arrive), pl = -.05 - .04 * pull;
  const po = { w: .96, lean: pl, face: -1, cloth: .9, hem: 1.0, peak: .015, ph: 3.14 * 3 * arrive, walk: clamp(Math.sin(Math.PI * arrive) * 1.2), profile: 1 };
  const Pp = (x, y) => B0(px + x, y + .005), peter = rdPerson(Pp, po);
  // Jesus's near arm: forearm forward and a little down — the arm Peter takes hold of
  const sJ = Pj(.0 + jl * .75, -.76), wJ = Pj(.2 + .015 * pull, -.44), aJ = rdIK(sJ, wJ, .2 * h, .17 * h, 1);
  // Peter (마 16:22 "붙들고"): both hands on Jesus's forearm, side by side between wrist and elbow; both arms shoulder → elbow → hand,
  // the far one coming forward in front of his chest; he leans toward Jesus, pleading. No palms, no hand-in-hand.
  const grip1 = ss(.5, 1.15, u), grip2 = ss(.7, 1.35, u), F = t => [lerp(aJ.el[0], aJ.wr[0], t), lerp(aJ.el[1], aJ.wr[1], t) - .014 * h];
  const G1 = F(.42), G2 = F(.72);
  const aD = (() => { const dx = aJ.wr[0] - aJ.el[0], dy = aJ.wr[1] - aJ.el[1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; })(), nA = aD[1] > 0 ? [-aD[1], aD[0]] : [aD[1], -aD[0]];   // across his forearm, away from Peter
  const sP1 = Pp(.0 + pl * .75, -.76), rest1 = Pp(.03 + pl * .3 + .07 * Math.sin(po.ph) * po.walk, -.42), aP1 = rdIK(sP1, [lerp(rest1[0], G1[0], grip1), lerp(rest1[1], G1[1], grip1)], .2 * h, .17 * h, -1);
  const sP2 = Pp(.045 + pl * .75, -.775), rest2 = Pp(.05 + pl * .3 - .07 * Math.sin(po.ph) * po.walk, -.43), aP2 = rdIK(sP2, [lerp(rest2[0], G2[0], grip2), lerp(rest2[1], G2[1], grip2)], .2 * h, .17 * h, -1);
  // back: Peter's sleeve ends a little short of the wrist once his hand comes out (the joints stay where they are), so the cuff does not
  // cover the grip and the hand has room to reach across Jesus's forearm
  const arm = (p, s, a, w0, back = 0) => { rdLimb(p, s, a.el, w0 * h, w0 * .88 * h); const d = Math.hypot(a.wr[0] - a.el[0], a.wr[1] - a.el[1]) || 1, e = Math.max(.3, 1 - back / d);
    rdLimb(p, a.el, [lerp(a.el[0], a.wr[0], e), lerp(a.el[1], a.wr[1], e)], w0 * .85 * h, w0 * .62 * h); };
  const back1 = .05 * h * clamp((grip1 - .3) / .4), back2 = .05 * h * clamp((grip2 - .3) / .4);
  const jArm = new Path2D(); arm(jArm, sJ, aJ, .052);
  const pArm1 = new Path2D(); arm(pArm1, sP1, aP1, .05, back1);
  const pArm2 = new Path2D(); arm(pArm2, sP2, aP2, .048, back2);
  // hands only at the ends of the arms, as short tapered shapes along the forearm (no round discs); a hand shows once it reaches out
  const hand = (a, len, w0) => { const p = new Path2D(), [ex, ey] = a.el, [wx, wy] = a.wr, d = Math.hypot(wx - ex, wy - ey) || 1, ux = (wx - ex) / d, uy = (wy - ey) / d;
    rdLimb(p, [wx - ux * .01 * h, wy - uy * .01 * h], [wx + ux * len * h, wy + uy * len * h], w0 * h, w0 * .78 * h); return p; };
  // Peter's hands hold (8th render: the tapered shapes read as mittens): out of the cuff (the IK end) the back of the hand, then four
  // fingers with dark gaps between them laid across Jesus's forearm to its far edge, the thumb out along the near side (pointing away from
  // the other hand); while reaching, the same hand open along his own forearm. sil = the outline (robe colour + rim, and the finger gaps).
  const poly = (p, pts) => { let s = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; s += x0 * y1 - x1 * y0; } if (s < 0) pts = pts.slice().reverse();
    const n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2]; p.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) p.quadraticCurveTo(pts[i][0], pts[i][1], ...m(i)); p.closePath(); };
  const holdHand = (a, G, grip, cuff, back, thumbTo) => {
    const [wx, wy] = a.wr, [ex, ey] = a.el, d0 = Math.hypot(wx - ex, wy - ey) || 1, up = [(wx - ex) / d0, (wy - ey) / d0], k = ss(.55, 1, grip), sc = Math.min(1, grip * 1.4);
    const tax = [G[0], G[1] + .014 * h], far = [tax[0] + nA[0] * .016 * h, tax[1] + nA[1] * .016 * h], fd = Math.hypot(far[0] - wx, far[1] - wy) || 1;
    let c = [lerp(up[0], (far[0] - wx) / fd, k), lerp(up[1], (far[1] - wy) / fd, k)]; { const cl = Math.hypot(...c) || 1; c = [c[0] / cl, c[1] / cl]; }
    const p = [-c[1], c[0]], xs = cuff * .8 - back, L = xs + sc * lerp(.05 * h, Math.max(.034 * h, fd + .003 * h - xs), k), Q = (x, y) => [wx + c[0] * x + p[0] * y, wy + c[1] * x + p[1] * y];
    const fl = Math.min(.034 * h, (L - xs) * .72) , xk = L - fl, sp = .0112 * h * sc, fw = .0041 * h * sc, hw0 = .0165 * h * sc, hw1 = .021 * h * sc;
    const side = (Math.sign(p[0] * aD[0] + p[1] * aD[1]) || 1) * thumbTo;   // the thumb toward Jesus's elbow (-1) or wrist (+1)
    const palm = new Path2D(); poly(palm, [Q(xs - .014 * h, -hw0), Q(lerp(xs, xk, .5), -hw1 * .95), Q(xk + .003 * h, -hw1), Q(xk + .003 * h, hw1), Q(lerp(xs, xk, .5), hw1 * .95), Q(xs - .014 * h, hw0)]);
    const fingers = [-1.5, -.5, .5, 1.5].map(i => { const f = new Path2D(), y = i * sp, len = fl - (Math.abs(i) > 1 ? .005 : i < 0 ? 0 : .0015) * h * sc;   // the middle finger longest, the outer two shorter
      rdLimb(f, Q(xk - .005 * h, y), Q(xk + len - fw, y * 1.05), fw * 1.1, fw * .9); return f; });
    const t0 = Q(xs + .001 * h, side * hw0 * .85), td = [side * p[0] * .8 + c[0] * .55, side * p[1] * .8 + c[1] * .55], tl = .022 * h * sc * (.6 + .4 * k);
    const thumb = new Path2D(); rdLimb(thumb, t0, [t0[0] + td[0] * tl, t0[1] + td[1] * tl], .0058 * h * sc, .0042 * h * sc);
    const sil = new Path2D(); sil.addPath(palm); sil.addPath(thumb); fingers.forEach(f => sil.addPath(f));
    const gap = new Path2D(); poly(gap, [Q(xk - .004 * h, -1.5 * sp), Q(xk + fl * .7, -1.5 * sp), Q(xk + fl * .7, 1.5 * sp), Q(xk - .004 * h, 1.5 * sp)]);   // dark between the fingers
    sil.addPath(gap); return { sil, palm, fingers, thumb };
  };
  const hJ = hand(aJ, .07, .024), showP1 = grip1 > .3, showP2 = grip2 > .3, H1 = holdHand(aP1, G1, grip1, .05 * .62 * h, back1, -1), H2 = holdHand(aP2, G2, grip2, .048 * .62 * h, back2, 1), hP1 = H1.sil, hP2 = H2.sil;
  const fl = RDP.fl, g = fl.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  // short shadows toward us (the light is behind them)
  g.save(); g.fillStyle = 'rgba(40,30,60,.3)'; for (const xx of [jx, px]) { const [ex, ey] = B0(xx, .012); g.beginPath(); g.ellipse(ex, ey, .22 * h, .03 * h, 0, 0, 6.283); g.fill(); } g.restore();
  const land = C('land'), tint = c => rgb(Pilot.hex(c).map((v, k) => v * land[k] / 255)), light = rgb(mix(C('light'), [255, 224, 186], .45)), rimA = clamp(1.1 - .35 * ss(2.6, 4.6, u));
  const join = (...ps) => { const p = new Path2D(); ps.forEach(q => p.addPath(q)); return p; };
  const wj = join(jesus, jArm, hJ); wj.hd = jesus.hd; wj.hc = jesus.hc;
  const wp = join(peter, pArm2, pArm1, ...(showP1 ? [hP1] : []), ...(showP2 ? [hP2] : [])); wp.hd = peter.hd; wp.hc = peter.hc;
  jo.hcCol = tint('#ebe2d2'); po.hcCol = tint('#d6c6a6'); jo.skin = po.skin = tint('#b48a6e'); jo.softRim = po.softRim = true;
  rdFigure(g, wj, Pj, jo, tint('#a49688'), light, [-1, .05], .02 * h, rimA);
  rdFigure(g, wp, Pp, po, tint('#7e4c44'), light, [1, .05], .02 * h, rimA);
  // the sleeves a shade darker than the robe (the far arm darker still), then the hands in skin, all at the arms' ends
  // (not over the head cloths: the cloth hangs over the shoulder, a sleeve shade on it read as a see-through sleeve — 8th render)
  g.save(); { const ex = new Path2D(); ex.rect(0, 0, W, H); ex.addPath(jesus.hc); ex.addPath(peter.hc); g.clip(ex, 'evenodd'); }
  g.fillStyle = 'rgba(28,16,30,.22)'; g.fill(jArm); g.fill(pArm1); g.fillStyle = 'rgba(28,16,30,.34)'; g.fill(pArm2); g.fillStyle = 'rgba(28,16,30,.22)'; g.fill(pArm1);
  g.fillStyle = jo.skin; g.fill(hJ); g.fillStyle = 'rgba(28,16,30,.24)'; g.fill(hJ);   // his hand in the shade of his body (the light is behind): plain skin on the gold field read as see-through
  const skinHand = (Hh, shade) => { g.fillStyle = tint('#6a4436'); g.fill(Hh.sil); g.fillStyle = jo.skin; g.fill(Hh.palm); g.fill(Hh.thumb); Hh.fingers.forEach(f => g.fill(f));
    if (shade) { g.fillStyle = 'rgba(28,16,30,' + shade + ')'; g.fill(Hh.palm); g.fill(Hh.thumb); Hh.fingers.forEach(f => g.fill(f)); } };
  if (showP2) skinHand(H2, .2); if (showP1) skinHand(H1, 0); g.restore();
  g.globalCompositeOperation = 'destination-out'; g.globalAlpha = .1; g.fillStyle = g.createPattern(RDP.grain, 'repeat'); g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  ctx.drawImage(fl, 0, 0);
  RDP.lastPose = { grips: [G1, G2], hands: [aP1.wr, aP2.wr], elbows: [aP1.el, aP2.el, aJ.el], shoulders: [sP1, sP2, sJ], jesusX: jx, peterX: px };
  rdExpose(ctx, T);
  rdFinish(ctx, T, RDP.L.band);
  ctx.restore();
}
