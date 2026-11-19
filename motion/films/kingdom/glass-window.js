// glass-window.js — 「kingdom」 2부 concept B (2026-11-19, after the owner rejected the ink-wash garden): a backlit Gothic lancet
// in a dark stone nave. The window is a garden world (great sun at the top, the tree of life, the river flowing from its foot,
// hills, a small first man in pale glass); the light that comes through it IS the King's rule — coloured shafts in the haze,
// coloured pools on the floor and the piers. Everything the room receives is computed from the same glass function, so when a
// pane dies its light on the floor and in the air dies with it.
// After OPUSCAR 17 (「Going My Way」, backlit Gothic stained glass: leaded pot-metal, Chartres blue, ruby borders, coloured
// light pooling on the church floor), in the cinematic-3d engine (lib3d/cine.js).
//   block 1 (C2a 110 → N43 142.3), one continuous camera: high in the dark nave, craning down as the window blazes (N40 · Q40);
//     N41: the little man turns his back on the sun and walks out, a crack runs from him through the glass;
//     N42: the panes die one by one from him outward (the great sun last), the floor and the air go grey;
//     ~139.6: one small round pane on the horizon relights — a low sun — and the camera pushes into it, to white (→ village S1).
//   block 2 (L43 215.7 → C2 237.6), one continuous camera: from that sun pane, pulling back and rising while the panes relight
//     from it outward, the cracks healed with gold, the coloured light flooding back over the floor; N47 the man turns back.
// Rules: no words in the art, no face of Jesus (no Jesus at all here — the light only), God never depicted (light only).
// API: const GW = await (await import('./glass-window.js')).build(W, H);  GW.draw(ctx, t, B)  (t = film seconds; B = line times)
import { Film, THREE, V, col, rng } from '../lib3d/cine.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// ---------------------------------------------------------------- beats from the line times
export function beats(B) {
  const T = {};
  T.start = 110.0; T.glow = [110.0, B.N40 + 3.0];          // the window brightens as N40 is spoken
  T.fig = [B.N41 + .8, B.N41 + 2.6];                        // the man turns away
  T.crack = [B.N41 + 2.2, B.N42 + .6];                      // the crack runs out from him
  T.dark = [B.N42 + .3, B.N42 + 5.0];                       // panes die one by one
  T.sun = [B.N43 - 2.1, B.N43 - 1.1];                       // the one round pane relights (a low sun)
  T.white = [B.N43 - 1.0, B.N43];                           // push into it, to white
  T.end1 = B.N43 + .5;
  T.r0 = B.L43; T.rest = [B.Q44 + .5, B.N47 + 1.6];         // panes relight from the sun pane outward
  T.back = [B.N47 + .3, B.N47 + 1.9];                       // the man turns back to the light
  T.r1 = B.C2;
  return T;
}

// ---------------------------------------------------------------- the window picture (canvas, 1024 × 2680 px = 6 × 15.7 m)
const TW = 1024, TH = 2680, WM = 6, HM = 15.7, SILL = 4.5, WZ = -20;
const YS = Math.round(5.196 / HM * TH);   // the arch springs here (equilateral pointed arch)
const SX = 512, SY = 480;                 // the great sun
const RX = 560, RY = 1590, RR = 60;       // the small round pane on the horizon (the low sun)
const FR = [566, 1826, 866, 2251];        // figure rect (px): x0, y0, x1, y1
const FC = [722, 2060];                   // the man (crack origin)
function hyp(x, y) { return Math.sqrt(x * x + y * y); }
function insideW(X, Y) { return Y >= YS ? X >= 0 && X <= TW && Y <= TH : hyp(X - TW, Y - YS) <= TW && hyp(X, Y - YS) <= TW; }
function edgeD(X, Y) { return Y >= YS ? Math.min(X, TW - X, TH - Y) : Math.min(TW - hyp(X - TW, Y - YS), TW - hyp(X, Y - YS)); }
const yFar = X => 1660 - 150 * Math.exp(-(((X - 230) / 170) ** 2)) - 120 * Math.exp(-(((X - 860) / 150) ** 2)) + 18 * Math.sin(X * .02);
const yNear = X => 1830 - 80 * Math.exp(-(((X - 110) / 220) ** 2)) - 100 * Math.exp(-(((X - 990) / 200) ** 2)) + 15 * Math.sin(X * .013 + 2);
const yMead = X => 1965 + 22 * Math.sin(X * .009);
const CAN = [[380, 1180, 190], [250, 1290, 140], [510, 1290, 140], [290, 1075, 130], [470, 1070, 130], [380, 990, 120], [210, 1170, 108], [552, 1170, 108]];
const trunkX = Y => 380 + 14 * Math.sin(Y * .011);
const trunkHW = Y => 24 + (Y - 1380) / 910 * 14 + 34 * Math.exp(-(((2292 - Y) / 46) ** 2));
const riverX = Y => 392 + (Y - 2290) * .24 + 58 * Math.sin((Y - 2290) * .012);
const riverHW = Y => 20 + (Y - 2290) * .22;

function hashi(a, b) { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; }
function vnoise(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hashi(xi + s, yi), b = hashi(xi + 1 + s, yi), c = hashi(xi + s, yi + 1), d = hashi(xi + 1 + s, yi + 1); return lerp(lerp(a, b, u), lerp(c, d, u), v); }

// pot-metal colours per region (sRGB): a list to pick from per piece
const PAL = {
  border: ['#9c1426', '#b01a2e', '#1d3a9a', '#22449f', '#8a1022'], pearl: ['#efe6c8', '#f4ecd2', '#e6d9a8'],
  ring: ['#e0962a', '#d5852a'], round: ['#f3d48c'], sunC: ['#ffe27a'], sunR: ['#ffcc3c', '#f7c030', '#ffd658'], rayA: ['#f0a228', '#e8931e'], rayB: ['#ffe48a', '#fbdc78'],
  sky: ['#0f3196', '#0b2a8a', '#1540a8', '#0d2c8e', '#1a4ab2', '#0a2478', '#123aa0'], far: ['#4a3492', '#553a9a', '#3e2c86'], hill: ['#2b6d5a', '#2f7660', '#276453'],
  mead: ['#2f7a22', '#3a862a', '#286e1e', '#45922e', '#1f6418'], canopy: ['#145a22', '#1d6a28', '#0f4e1c', '#287a2c', '#3a8a24'], fruit: ['#c0122a', '#d01c30'],
  trunk: ['#7a3a1e', '#6c321a', '#84421f'], river: ['#a8d4ff', '#cfe6ff', '#8fc2f4', '#e3f1ff'], flower: ['#c8182c', '#f2eee0', '#f2c43a'],
};
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function paintWindow() {
  const R = rng(1717);
  const fruits = []; for (let i = 0; i < 40 && fruits.length < 13; i++) { const c = CAN[(R() * CAN.length) | 0], a = R() * 6.283, r = Math.sqrt(R()) * c[2] * .8, x = c[0] + Math.cos(a) * r, y = c[1] + Math.sin(a) * r; if (fruits.every(f => hyp(f[0] - x, f[1] - y) > 70)) fruits.push([x, y]); }
  const flowers = []; for (let i = 0; i < 200 && flowers.length < 22; i++) { const x = 90 + R() * 850, y = 2000 + R() * 620;
    if (y < yMead(x) + 20 || Math.abs(x - riverX(y)) < riverHW(y) + 24 || (x > FR[0] - 10 && x < FR[2] + 10 && y > FR[1] && y < FR[3] + 30) || (Math.abs(x - 380) < 80 && y < 2340)) continue;
    if (flowers.every(f => hyp(f[0] - x, f[1] - y) > 60)) flowers.push([x, y, (R() * 3) | 0]); }
  // jittered-grid voronoi seeds (cell size by region)
  const vor = (X, Y, cs, salt) => { const gx = Math.floor(X / cs), gy = Math.floor(Y / cs); let best = 1e9, id = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const cx = gx + i, cy = gy + j, sx = (cx + .04 + .92 * hashi(cx * 7 + salt, cy)) * cs, sy = (cy + .04 + .92 * hashi(cx, cy * 13 + salt)) * cs, d = (X - sx) ** 2 + (Y - sy) ** 2; if (d < best) { best = d; id = (cx + 64) * 1024 + (cy + 64); } }
    return id; };
  // region + piece of a pixel
  const piece = (X, Y) => {
    if (!insideW(X, Y)) return [0, 0];
    const ed = edgeD(X, Y);
    if (ed < 44) return [1, vor(X, Y, 40, 3)];
    if (ed < 60) return [2, vor(X, Y, 24, 5)];
    const rr = hyp(X - RX, Y - RY); if (rr < RR) return [3, 0]; if (rr < RR + 16) return [4, (Math.floor((Math.atan2(Y - RY, X - RX) + Math.PI) / 6.2832 * 10))];
    const sr = hyp(X - SX, Y - SY), sa = Math.atan2(Y - SY, X - SX) + Math.PI;
    if (sr < 64) return [5, 0];
    if (sr < 150) return [6, Math.floor(sa / 6.2832 * 12)];
    { const k = Math.floor(sa / 6.2832 * 24), f = sa / 6.2832 * 24 - k, len = k % 4 === 0 ? 318 : k % 4 === 2 ? 250 : 0;
      if (sr < len && Math.abs(f - .5) < .5 * (1 - (sr - 150) / (len - 150 + 1)) + .06) return [k % 4 === 0 ? 7 : 8, k]; }
    for (let i = 0; i < fruits.length; i++) if (hyp(X - fruits[i][0], Y - fruits[i][1]) < 19) return [9, i];
    let inC = false; for (const c of CAN) if (hyp(X - c[0], Y - c[1]) < c[2]) { inC = true; break; }
    if (inC) return [10, vor(X, Y, 46, 7)];
    if (Y > 1360 && Y < 2300 && Math.abs(X - trunkX(Y)) < trunkHW(Y)) return [11, Math.floor(Y / 74) * 2 + (X > trunkX(Y) ? 1 : 0)];
    if (Y > 2290 && Math.abs(X - riverX(Y)) < riverHW(Y)) return [12, vor(X, Y, 48, 9)];
    for (let i = 0; i < flowers.length; i++) if (hyp(X - flowers[i][0], Y - flowers[i][1]) < 13) return [13, i];
    if (Y >= yMead(X)) return [14, vor(X, Y, 62, 11)];
    if (Y >= yNear(X)) return [15, vor(X, Y, 70, 13)];
    if (Y >= yFar(X)) return [16, vor(X, Y, 70, 17)];
    return [17, vor(X, Y, 68, 19)];
  };
  const REG = [null, 'border', 'pearl', 'round', 'ring', 'sunC', 'sunR', 'rayA', 'rayB', 'fruit', 'canopy', 'trunk', 'river', 'flower', 'mead', 'hill', 'far', 'sky'];
  const N = TW * TH, pid = new Int32Array(N), reg = new Uint8Array(N);
  const cen = new Map();
  for (let Y = 0; Y < TH; Y++) for (let X = 0; X < TW; X++) { const [r, s] = piece(X + .5, Y + .5), i = Y * TW + X, id = r === 0 ? -1 : r * 1048576 * 0 + (r << 22) + s;
    pid[i] = id; reg[i] = r; if (r) { let c = cen.get(id); if (!c) { c = [0, 0, 0, r]; cen.set(id, c); } c[0] += X; c[1] += Y; c[2]++; } }
  // per piece: colour, the order it dies in (from the man outward, scattered, the great sun last), its distance from the sun pane
  const info = new Map(), DMAX = 2300;
  for (const [id, c] of cen) { const x = c[0] / c[2], y = c[1] / c[2], r = c[3], h = hashi(id, 77), h2 = hashi(id, 91);
    const pal = r === 13 ? [PAL.flower[(id & 3) % 3]] : PAL[REG[r]], base = rgbOf(pal[Math.floor(h * pal.length) % pal.length]), v = .86 + .26 * h2;
    let dk = clamp(.72 * hyp(x - FC[0], y - FC[1]) / DMAX + .26 * hashi(id, 5));
    if (r >= 5 && r <= 8) dk = .9 + .1 * hashi(id, 6);                 // the great sun dies last
    if (r === 3 || r === 4) dk = .5;
    const rd = r === 3 ? 0 : clamp(.06 + .8 * hyp(x - RX, y - RY) / DMAX + .12 * hashi(id, 8));
    info.set(id, [base.map(q => q * v), dk, rd]); }
  // colour + info rasters
  const cC = document.createElement('canvas'); cC.width = TW; cC.height = TH; const gC = cC.getContext('2d'), imC = gC.createImageData(TW, TH), dC = imC.data;
  const cI = document.createElement('canvas'); cI.width = TW; cI.height = TH; const gI = cI.getContext('2d'), imI = gI.createImageData(TW, TH), dI = imI.data;
  const lw = 4;
  for (let Y = 0; Y < TH; Y++) for (let X = 0; X < TW; X++) { const i = Y * TW + X, k = i * 4, id = pid[i];
    if (id < 0) { dC[k] = dC[k + 1] = dC[k + 2] = 0; dC[k + 3] = 255; dI[k] = dI[k + 1] = 0; dI[k + 2] = 255; dI[k + 3] = 255; continue; }
    let lead = false;
    for (const [dx, dy] of [[lw, 0], [-lw, 0], [0, lw], [0, -lw]]) { const x2 = X + dx, y2 = Y + dy; if (x2 < 0 || y2 < 0 || x2 >= TW || y2 >= TH || pid[y2 * TW + x2] !== id) { lead = true; break; } }
    const [c, dk, rd] = info.get(id);
    // mottled pot-metal: low-frequency density, a few streaks, darker near the lead (thicker glass at the edges)
    const m = .82 + .3 * vnoise(X / 38, Y / 38, id & 255) + .08 * vnoise(X / 7, Y / 90, 3);
    dC[k] = clamp(c[0] * m, 0, 255); dC[k + 1] = clamp(c[1] * m, 0, 255); dC[k + 2] = clamp(c[2] * m, 0, 255); dC[k + 3] = 255;
    dI[k] = dk * 255; dI[k + 1] = rd * 255; dI[k + 2] = lead ? 255 : 0; dI[k + 3] = 255; }
  // the iron saddle bars are lead too (opaque)
  for (const by of [1000, 1400, 1800, 2200, 2560]) for (let Y = by - 6; Y <= by + 6; Y++) for (let X = 0; X < TW; X++) { const k = (Y * TW + X) * 4; if (pid[Y * TW + X] >= 0) dI[k + 2] = 255; }
  // matting: the painter's thin wash darkens every piece toward its lead, so the centres glow (chamfer distance to the lead)
  { const dist = new Float32Array(N); for (let i = 0; i < N; i++) dist[i] = dI[i * 4 + 2] > 0 ? 0 : 1e6;
    for (let Y = 1; Y < TH; Y++) for (let X = 1; X < TW - 1; X++) { const i = Y * TW + X; let d = dist[i]; d = Math.min(d, dist[i - 1] + 1, dist[i - TW] + 1, dist[i - TW - 1] + 1.414, dist[i - TW + 1] + 1.414); dist[i] = d; }
    for (let Y = TH - 2; Y >= 0; Y--) for (let X = TW - 2; X >= 1; X--) { const i = Y * TW + X; let d = dist[i]; d = Math.min(d, dist[i + 1] + 1, dist[i + TW] + 1, dist[i + TW + 1] + 1.414, dist[i + TW - 1] + 1.414); dist[i] = d; }
    for (let i = 0; i < N; i++) { if (pid[i] < 0) continue; const k = i * 4, m = .5 + .5 * Math.min(1, dist[i] / 16) ** .8; dC[k] *= m; dC[k + 1] *= m; dC[k + 2] *= m; } }
  gC.putImageData(imC, 0, 0); gI.putImageData(imI, 0, 0);
  // grisaille: the painted brown line on the glass (leaves, bark, water, rays, folds of the hills) — it holds back the light
  const g = gC; g.lineCap = 'round'; g.lineJoin = 'round';
  const clipW = () => { g.save(); g.beginPath(); g.moveTo(0, TH); g.lineTo(TW, TH); g.lineTo(TW, YS); g.arc(0, YS, TW, 0, -Math.PI / 3, true); g.arc(TW, YS, TW, -2 * Math.PI / 3, -Math.PI, true); g.closePath(); g.clip(); };
  clipW();
  g.strokeStyle = 'rgba(38,22,12,.55)';
  for (let i = 0; i < 260; i++) { const c = CAN[(R() * CAN.length) | 0], a = R() * 6.283, r = Math.sqrt(R()) * c[2] * .92, x = c[0] + Math.cos(a) * r, y = c[1] + Math.sin(a) * r, s = 10 + R() * 9, o = R() * 6.283;
    g.lineWidth = 2.6; g.beginPath(); g.moveTo(x - Math.cos(o) * s, y - Math.sin(o) * s); g.quadraticCurveTo(x + Math.cos(o + 1.4) * s * .5, y + Math.sin(o + 1.4) * s * .5, x + Math.cos(o) * s, y + Math.sin(o) * s); g.stroke(); }
  for (let i = 0; i < 26; i++) { const y0 = 1400 + R() * 880, x = trunkX(y0) + (R() - .5) * 30; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (R() - .5) * 8, y0 + 40 + R() * 50); g.stroke(); }
  g.strokeStyle = 'rgba(30,50,90,.45)'; for (let y = 2310; y < TH; y += 26) { const hw = riverHW(y) * .8, x = riverX(y); g.lineWidth = 2.4; g.beginPath(); for (let k = -1; k <= 1; k += .1) { const xx = x + k * hw, yy = y + Math.sin(k * 7 + y * .1) * 4; k === -1 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke(); }
  g.strokeStyle = 'rgba(70,30,6,.4)'; g.lineWidth = 2.5; for (let k = 0; k < 48; k++) { const a = k / 48 * 6.283; g.beginPath(); g.moveTo(SX + Math.cos(a) * 160, SY + Math.sin(a) * 160); g.lineTo(SX + Math.cos(a) * (k % 2 ? 230 : 290), SY + Math.sin(a) * (k % 2 ? 230 : 290)); g.stroke(); }
  g.beginPath(); g.arc(SX, SY, 104, 0, 6.283); g.stroke();
  g.strokeStyle = 'rgba(20,20,40,.35)'; g.lineWidth = 3;
  for (const [f, off, n] of [[yFar, 30, 3], [yNear, 26, 3], [yMead, 40, 2]]) for (let j = 1; j <= n; j++) { g.beginPath(); for (let X = 70; X < 960; X += 12) { const y = f(X) + j * off + 6 * Math.sin(X * .05 + j); X === 70 ? g.moveTo(X, y) : g.lineTo(X, y); } g.stroke(); }
  g.strokeStyle = 'rgba(20,40,10,.45)'; g.lineWidth = 2.4; for (let i = 0; i < 90; i++) { const x = 80 + R() * 860, y = 2010 + R() * 630; if (Math.abs(x - riverX(y)) < riverHW(y) + 10) continue; g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x - 2, y - 14); g.moveTo(x, y); g.lineTo(x + 1, y - 18); g.moveTo(x + 7, y); g.lineTo(x + 4, y - 13); g.stroke(); }
  g.restore();

  // the man: A — standing at the tree, his face (no features) and both arms lifted toward the sun (up-left);
  //          B — his back to it, walking out to the right, head bowed, arms hanging. Drawn as glass: lead outline, pieces, grisaille.
  const figCanvas = (away) => { const c = document.createElement('canvas'); c.width = FR[2] - FR[0]; c.height = FR[3] - FR[1]; const f = c.getContext('2d'); f.lineCap = f.lineJoin = 'round'; f.scale(1.25, 1.25);
    const robe = '#efe4cc', skin = '#efc6a2', hair = '#5a3216', L = '#050404';
    const poly = (pts, fill, w = 7) => { f.beginPath(); pts.forEach((p, i) => i ? f.lineTo(p[0], p[1]) : f.moveTo(p[0], p[1])); f.closePath(); f.fillStyle = fill; f.fill(); f.strokeStyle = L; f.lineWidth = w; f.stroke(); };
    const limb = (pts, w) => { f.strokeStyle = L; f.lineWidth = w + 9; f.beginPath(); pts.forEach((p, i) => i ? f.lineTo(p[0], p[1]) : f.moveTo(p[0], p[1])); f.stroke(); f.strokeStyle = robe; f.lineWidth = w; f.stroke(); };
    if (!away) {
      limb([[112, 134], [88, 92], [62, 44]], 15); limb([[128, 136], [110, 88], [92, 36]], 15);
      f.fillStyle = skin; f.strokeStyle = L; f.lineWidth = 6; for (const [x, y] of [[60, 40], [90, 32]]) { f.beginPath(); f.arc(x, y, 9, 0, 6.283); f.fill(); f.stroke(); }
      poly([[98, 128], [146, 126], [160, 210], [174, 318], [70, 318], [86, 210]], robe);
      f.strokeStyle = L; f.lineWidth = 5; f.beginPath(); f.moveTo(90, 214); f.lineTo(158, 212); f.moveTo(120, 214); f.lineTo(112, 318); f.stroke();
      f.strokeStyle = 'rgba(60,40,20,.5)'; f.lineWidth = 2.5; for (const x of [100, 132, 148]) { f.beginPath(); f.moveTo(x, 222); f.lineTo(x + (x - 120) * .25, 312); f.stroke(); }
      f.beginPath(); f.arc(118, 100, 25, 0, 6.283); f.fillStyle = skin; f.fill(); f.lineWidth = 6; f.strokeStyle = L; f.stroke();
      f.beginPath(); f.arc(118, 100, 25, -.6, 2.0); f.lineTo(118, 100); f.closePath(); f.fillStyle = hair; f.fill(); f.stroke();   // hair at the back of the head (he faces up-left)
    } else {
      poly([[124, 128], [168, 132], [184, 214], [210, 314], [150, 318], [138, 284], [118, 318], [96, 316], [112, 210]], '#d9c9a8');
      f.strokeStyle = L; f.lineWidth = 5; f.beginPath(); f.moveTo(114, 216); f.lineTo(184, 216); f.moveTo(140, 216); f.lineTo(136, 280); f.stroke();
      limb([[130, 140], [120, 196], [128, 244]], 13); limb([[164, 142], [182, 196], [196, 236]], 13);
      f.strokeStyle = 'rgba(50,30,14,.6)'; f.lineWidth = 3; for (const x of [130, 160, 178]) { f.beginPath(); f.moveTo(x, 224); f.lineTo(x + (x - 150) * .3 + 8, 306); f.stroke(); }
      f.beginPath(); f.arc(160, 110, 24, 0, 6.283); f.fillStyle = skin; f.fill(); f.lineWidth = 6; f.strokeStyle = L; f.stroke();
      f.beginPath(); f.arc(160, 110, 24, Math.PI * .55, Math.PI * 1.95); f.lineTo(160, 110); f.closePath(); f.fillStyle = hair; f.fill(); f.stroke();   // seen from behind, head bowed toward the right
    }
    return c; };

  // the crack: branching jagged lines from the man; R = crack, G = when it arrives (fraction of its run); B = the round sun pane
  const cK = document.createElement('canvas'); cK.width = TW; cK.height = TH; const k = cK.getContext('2d'); k.fillStyle = '#000'; k.fillRect(0, 0, TW, TH); k.lineCap = k.lineJoin = 'round';
  const CR = rng(4407), runMax = 2100, segs = [];
  const grow = (x, y, a, len0, w, depth) => { let L = len0; while (L < runMax) { const step = 16 + CR() * 14; a += (CR() - .5) * .7; const x2 = x + Math.cos(a) * step, y2 = y + Math.sin(a) * step; if (!insideW(x2, y2) || edgeD(x2, y2) < 52) break;
      segs.push([x, y, x2, y2, L, w]); L += step; x = x2; y = y2; w = Math.max(3, w * .992);
      if (depth < 3 && CR() < .045) grow(x, y, a + (CR() < .5 ? 1 : -1) * (.5 + CR() * .7), L, w * .7, depth + 1); } };
  for (let i = 0; i < 9; i++) grow(FC[0] + (CR() - .5) * 20, FC[1] + (CR() - .5) * 30, i / 9 * 6.283 + CR() * .5, 0, 8, 0);
  for (const [x, y, x2, y2, L, w] of segs) { k.strokeStyle = `rgb(255,${Math.round(clamp(L / runMax) * 255)},0)`; k.lineWidth = w; k.beginPath(); k.moveTo(x, y); k.lineTo(x2, y2); k.stroke(); }
  const imK = k.getImageData(0, 0, TW, TH), dK = imK.data;
  for (let Y = RY - RR - 2; Y <= RY + RR + 2; Y++) for (let X = RX - RR - 2; X <= RX + RR + 2; X++) { const d = hyp(X + .5 - RX, Y + .5 - RY); if (d < RR - 2) { const q = (Y * TW + X) * 4; dK[q + 2] = Math.round(255 * clamp((RR - 2 - d) / (RR * .45))); dK[q] = 0; } }
  k.putImageData(imK, 0, 0);
  return { col: cC, info: cI, crack: cK, figA: figCanvas(false), figB: figCanvas(true) };
}

// ---------------------------------------------------------------- GLSL: the glass, and the light it sends into the room
const GLASS_GLSL = /* glsl */`
  uniform sampler2D tCol, tInfo, tCrack, tFigA, tFigB;
  uniform float uDark, uCrack, uFig, uSunP, uRest, uGlow, uSunGlow;
  uniform vec4 uFigRect; uniform vec3 uL;
  float lancet(vec2 uv){ vec2 m = vec2(uv.x * ${WM.toFixed(1)}, uv.y * ${HM.toFixed(2)}); float ys = ${(HM - 5.196).toFixed(3)};
    if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) return 0.;
    if (m.y < ys) return 1.; return step(length(m - vec2(${WM.toFixed(1)}, ys)), ${WM.toFixed(1)}) * step(length(m - vec2(0., ys)), ${WM.toFixed(1)}); }
  // transmitted light of the glass at uv (linear, × uGlow), its lead (0..1) and the gold of the healed cracks
  vec3 glassAt(vec2 uv, out float lead, out float gold){
    vec4 inf = texture2D(tInfo, uv); vec3 c = pow(texture2D(tCol, uv).rgb, vec3(2.2)); c = max(mix(vec3(dot(c, vec3(.3, .55, .15))), c, 1.3), 0.);
    vec2 fu = (uv - uFigRect.xy) / (uFigRect.zw - uFigRect.xy);
    if (fu.x > 0. && fu.x < 1. && fu.y > 0. && fu.y < 1.){ vec4 fa = texture2D(tFigA, fu), fb = texture2D(tFigB, fu);
      c = mix(c, pow(fa.rgb, vec3(2.2)), fa.a * (1. - uFig)); c = mix(c, pow(fb.rgb, vec3(2.2)), fb.a * uFig); }
    float lit = 1. - smoothstep(inf.r - .025, inf.r + .025, uDark * 1.08 - .04);
    float rest = 1. - smoothstep(uRest - .05, uRest, inf.g);
    lit = max(lit, rest);
    vec4 ck = texture2D(tCrack, uv);
    float sunp = smoothstep(.0, 1., ck.b) * uSunP;
    float lum = dot(c, vec3(.3, .55, .15));
    vec3 dead = mix(vec3(.022 + .05 * lum), c * .05, .3) * vec3(.84, .86, .93);   // opaque: every colour drains to the same dull grey           // opaque, grey, cold
    vec3 o = mix(dead, c, lit);
    o = mix(o, vec3(1., .78, .45) * 2.6 * uSunGlow, sunp);                                // the low sun relit
    float sunK = smoothstep(.0, .02, 1. - inf.r) * 0.;                          // (reserved)
    lead = smoothstep(.3, .7, inf.b);
    float cr = smoothstep(.25, .7, ck.r) * (1. - smoothstep(uCrack - .015, uCrack, ck.g)) * step(.001, uCrack);
    gold = cr * rest;
    o *= (1. - lead) * (1. - cr);
    return o * uGlow;
  }
  vec3 glassUV(vec3 p, out vec2 uv, out float s){ s = (${WZ.toFixed(1)} - p.z) / uL.z; vec3 h = p + uL * s; uv = vec2((h.x + ${(WM / 2).toFixed(1)}) / ${WM.toFixed(1)}, (h.y - ${SILL.toFixed(1)}) / ${HM.toFixed(2)}); return h; }
  vec3 glassLight(vec3 p){ vec2 uv; float s; glassUV(p, uv, s); if (s <= 0. || lancet(uv) < .5) return vec3(0.); float ld, gd; return glassAt(uv, ld, gd); }
`;
const NOISE_GLSL = /* glsl */`
  float gh(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  float gn(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(mix(gh(i), gh(i + vec3(1,0,0)), f.x), mix(gh(i + vec3(0,1,0)), gh(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(gh(i + vec3(0,0,1)), gh(i + vec3(1,0,1)), f.x), mix(gh(i + vec3(0,1,1)), gh(i + vec3(1,1,1)), f.x), f.y), f.z); }
  float h2(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vn2(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), u.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), u.x), u.y); }
  float fb2(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn2(p); p = p * 2.03 + 11.7; a *= .5; } return s; }
`;

export async function build(W, H) {
  const vert = H > W, FOV = vert ? 46 : 32;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .05, far: 400,
    atmos: { density: .0025, falloff: .02, base: 0, start: 2, color: col('#10131c', .4), colorUp: col('#0c0e16', .3), max: 300, scatter: 1, anisotropy: .7, phaseMix: .8 },
    bloom: { strength: .085, radius: 1.15, tint: col('#fff0dc') },
    dof: { focus: 30, aperture: 1.2, maxCoc: 18 },
    look: { exposure: 1.0, contrast: 1.06, saturation: 1.08, lift: col('#07080c'), shadowTint: col('#c8d0e8'), highTint: col('#fff2dc'), vignette: .34, grain: .04, ca: .3 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera;
  let T = null;

  // ---- the window's textures
  const pic = paintWindow();
  const tex = (c, mip = true) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = mip; t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.premultiplyAlpha = false; return t; };
  const L = V(-.22, .62, -1).normalize();   // toward the sun, through the window (the light falls down the nave and a little to the right)
  const GU = {
    tCol: { value: tex(pic.col) }, tInfo: { value: tex(pic.info) }, tCrack: { value: tex(pic.crack, false) }, tFigA: { value: tex(pic.figA) }, tFigB: { value: tex(pic.figB) },
    uDark: { value: 0 }, uCrack: { value: 0 }, uFig: { value: 0 }, uSunP: { value: 0 }, uRest: { value: 0 }, uGlow: { value: 6 }, uSunGlow: { value: 1 },
    uFigRect: { value: new THREE.Vector4(FR[0] / TW, 1 - FR[3] / TH, FR[2] / TW, 1 - FR[1] / TH) }, uL: { value: L },
    uT: { value: 0 }, uHaze: { value: 1 }, uDust: { value: 1 }, uRecv: { value: 1 }, uGoldK: { value: 0 },
  };
  // the glass itself (seen from the nave): transmitted light, dark lead, gold where the cracks are healed
  { const m = new THREE.ShaderMaterial({ uniforms: GU, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `varying vec2 vUv; uniform float uGoldK; ${GLASS_GLSL}
        void main(){ if (lancet(vUv) < .5) discard; float ld, gd; vec3 c = glassAt(vUv, ld, gd);
          c += vec3(.012, .012, .016) * ld;                                   // the lead, faintly lit from the room
          c += vec3(1., .58, .16) * gd * uGoldK;                               // healed with gold
          gl_FragColor = vec4(c, 1.); }` });
    const g = new THREE.Mesh(new THREE.PlaneGeometry(WM, HM), m); g.position.set(0, SILL + HM / 2, WZ); S.add(g); }

  // ---- stone (floor, walls, piers): albedo + the glass light falling on it (pier shadows tested analytically)
  const PIERS = [];
  const stoneM = (base, key, floor = false) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: floor ? .62 : .92 });
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, GU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform float uRecv; uniform vec3 uPierA[${12}], uPierB[${12}];\n${NOISE_GLSL}\n${GLASS_GLSL}
          bool hitBox(vec3 o, vec3 d, float tmax, vec3 a, vec3 b){ vec3 inv = 1. / d, t0 = (a - o) * inv, t1 = (b - o) * inv; vec3 lo = min(t0, t1), hi = max(t0, t1); float n = max(max(lo.x, lo.y), lo.z), f = min(min(hi.x, hi.y), hi.z); return f > max(n, 0.) && n < tmax; }`)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 N = normalize(vWN); vec2 q = abs(N.y) > .7 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
            float big = fb2(q * .3 + 3.1), fine = fb2(q * 4.1);
            vec3 c = diffuseColor.rgb * mix(.8, 1.12, big) * mix(.9, 1.06, fine);
            ${floor ? `vec2 f = fract(q / vec2(1.25, 1.25) + vec2(floor(q.y / 1.25) * .5, 0.)); float jt = min(min(f.x, 1. - f.x), min(f.y, 1. - f.y)); c *= mix(.45, 1., smoothstep(.0, .025, jt)); c *= .88 + .2 * h2(floor(q / 1.25 + vec2(floor(q.y / 1.25) * .5, 0.)));`
                     : `vec2 f = fract(vec2(q.x / 0.9 + floor(q.y / .42) * .5, q.y / .42)); float jt = min(min(f.x, 1. - f.x) * .9, min(f.y, 1. - f.y) * .42); c *= mix(.6, 1., smoothstep(0., .02, jt));`}
            diffuseColor.rgb = c; }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec3 N = normalize(vWN); float nl = max(dot(N, uL), 0.); vec3 gl = vec3(0.);
            if (nl > 0. && vWP.z > ${WZ.toFixed(1)} + .3){ vec2 uv; float s; glassUV(vWP, uv, s);
              if (s > 0. && lancet(uv) > .5){ bool sh = false; for (int i = 0; i < ${12}; i++){ if (hitBox(vWP + N * .02, uL, s, uPierA[i], uPierB[i])) { sh = true; break; } }
                if (!sh){ float ld, gd; gl = glassAt(uv, ld, gd); } } }
            totalEmissiveRadiance += diffuseColor.rgb * gl * nl * .55 * uRecv; }`);
      sh.uniforms.uPierA = { value: PIERS.map(p => p[0]) }; sh.uniforms.uPierB = { value: PIERS.map(p => p[1]) }; };
    m.customProgramCacheKey = () => 'gw-stone-' + key; return m; };
  const M = { floor: stoneM('#8a8478', 'f', true), wall: stoneM('#6e685e', 'w'), pier: stoneM('#7a7468', 'p'), dark: new THREE.MeshStandardMaterial({ color: '#2a2622', roughness: 1 }), iron: new THREE.MeshStandardMaterial({ color: '#0c0b0a', roughness: .6, metalness: .3 }) };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 90), M.floor); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 15); S.add(floor);

  // the lancet outline offset by o (metres) as a Shape / hole
  const YSP = SILL + HM - 5.196;
  const lancetPts = (o, n = 28) => { const pts = [], R0 = 6 + o, th = Math.acos(3 / R0);
    pts.push([-3 - o, SILL - o], [3 + o, SILL - o], [3 + o, YSP]);
    for (let i = 1; i <= n; i++) { const a = th * i / n; pts.push([-3 + Math.cos(a) * R0, YSP + Math.sin(a) * R0]); }
    for (let i = n - 1; i >= 0; i--) { const a = Math.PI - th * i / n; pts.push([3 + Math.cos(a) * R0, YSP + Math.sin(a) * R0]); }
    return pts; };
  const toPath = (pts, P) => { pts.forEach((p, i) => i ? P.lineTo(p[0], p[1]) : P.moveTo(p[0], p[1])); P.closePath(); return P; };
  const ring = (oOut, oIn, z0, z1, mat) => { const s = toPath(lancetPts(oOut), new THREE.Shape()); s.holes.push(toPath(lancetPts(oIn).reverse(), new THREE.Path()));
    const g = new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false, curveSegments: 4 }); const m = new THREE.Mesh(g, mat); m.position.z = z0; S.add(m); return m; };
  // the end wall with the window hole, and three stepped orders of the jamb going back to the glass
  { const s = new THREE.Shape(); s.moveTo(-14, 0); s.lineTo(14, 0); s.lineTo(14, 34); s.lineTo(-14, 34); s.closePath(); s.holes.push(toPath(lancetPts(1.2).reverse(), new THREE.Path()));
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: false, curveSegments: 4 }); const m = new THREE.Mesh(g, M.wall); m.position.z = -19.4; S.add(m); }
  ring(1.2, .8, -19.75, -19.15, M.wall); ring(.8, .4, -20.05, -19.5, M.pier); ring(.4, -.02, -20.3, -19.85, M.wall);
  // colonnettes in the steps of the jamb, with capitals at the springing
  for (const sx of [-1, 1]) for (const [o, z] of [[1.0, -19.2], [.6, -19.55], [.2, -19.9]]) { const h = YSP - (SILL - o); const c = new THREE.Mesh(new THREE.CylinderGeometry(.11, .12, h, 12), M.pier); c.position.set(sx * (3 + o), SILL - o + h / 2, z); S.add(c);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(.34, .26, .34), M.pier); cap.position.set(sx * (3 + o), YSP + .1, z); S.add(cap); }
  // the iron saddle bars across the glass (in front of it)
  for (const by of [1000, 1400, 1800, 2200, 2560]) { const y = SILL + (1 - by / TH) * HM, b = new THREE.Mesh(new THREE.BoxGeometry(WM + .3, .07, .07), M.iron); b.position.set(0, y, WZ + .06); S.add(b); }
  // a low wall under the window (the sill), and the arcade of the nave: clustered piers, pointed arches, dark clerestory, ribs
  { const sill = new THREE.Mesh(new THREE.BoxGeometry(8, .4, 1.4), M.pier); sill.position.set(0, SILL - 1.3, -19.1); S.add(sill); }
  const pierZ = [-15, -8, -1, 6, 13, 20, 27, 34];
  for (const sx of [-1, 1]) for (const z of pierZ) { const x = sx * 5.8, g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, 12, 20), M.pier); core.position.y = 6; g.add(core);
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, sh = new THREE.Mesh(new THREE.CylinderGeometry(.21, .21, 12, 10), M.pier); sh.position.set(Math.cos(a) * .66, 6, Math.sin(a) * .66); g.add(sh); }
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.9, .5, 1.9), M.pier); base.position.y = .25; g.add(base);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.95, .45, 1.95), M.pier); cap.position.y = 12.1; g.add(cap);
      if (z < 30) PIERS.push([V(x - .95, 0, z - .95), V(x + .95, 12.4, z + .95)]); }
  while (PIERS.length < 12) PIERS.push([V(900, 900, 900), V(901, 901, 901)]);
  for (const sx of [-1, 1]) for (let i = 0; i < pierZ.length - 1; i++) { const z0 = pierZ[i], z1 = pierZ[i + 1], span = z1 - z0 - 1.6, zc = (z0 + z1) / 2;
    const s = new THREE.Shape(); s.moveTo(-3.5, 12.3); s.lineTo(3.5, 12.3); s.lineTo(3.5, 30); s.lineTo(-3.5, 30); s.closePath();
    const hole = new THREE.Path(), r = span, ys = 12.3; hole.moveTo(-span / 2, ys - .01); hole.lineTo(-span / 2, ys); const n = 16, th = Math.acos(.5);
    // pointed arch over the opening between the piers (left arc centred on the right springing point, and vice versa)
    for (let k = 0; k <= n; k++) { const a = Math.PI - th * k / n; hole.lineTo(span / 2 + Math.cos(a) * r, ys + Math.sin(a) * r * .55); }
    for (let k = n; k >= 0; k--) { const a = th * k / n; hole.lineTo(-span / 2 + Math.cos(a) * r, ys + Math.sin(a) * r * .55); }
    hole.lineTo(span / 2, ys - .01); hole.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: false }); const m = new THREE.Mesh(g, M.wall); m.rotation.y = Math.PI / 2; m.position.set(sx * 5.8 - .55 * sx * 0 - .55, 0, zc); m.position.x = sx * 5.8 + (sx > 0 ? -.55 : -.55); S.add(m); }
  // under the arcade, the aisles behind: a dark outer wall
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(.6, 14, 70), M.dark); w.position.set(sx * 11, 7, 12); S.add(w); }
  // vault: transverse pointed ribs over each pier pair, and a dark web above
  { const ribM = M.pier; for (const z of pierZ) { const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24, a = u < .5 ? u * 2 : (1 - u) * 2, x = (u - .5) * 11.6, y = 12.3 + 7.8 * Math.sin(a * Math.PI / 2) ** .8; pts.push(V(x, y, z)); }
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .2, 8, false); S.add(new THREE.Mesh(g, ribM)); }
    const web = new THREE.Mesh(new THREE.PlaneGeometry(14, 70), M.dark); web.rotation.x = Math.PI / 2; web.position.set(0, 20.4, 12); S.add(web); }

  // ---- fill light: a dim cold sky in the room; a warm glow off the window onto the jambs (scaled by how much glass is alive)
  const hemi = new THREE.HemisphereLight(col('#5a6680'), col('#2a2018'), .35); S.add(hemi);
  const winL = new THREE.PointLight(col('#ffd8a0'), 60, 40, 2); winL.position.set(0, 11, -16.5); S.add(winL);
  const halo = film.lamp(V(0, 12.5, -21), '#ffe0b0', { power: 800, size: 5, fog: 1 });

  // ---- the haze in the shafts: a box over the nave between the piers, raymarched toward the glass for every sample
  const BX = [V(-4.9, .02, -18.9), V(4.9, 21, 30)];
  { const m = new THREE.ShaderMaterial({ uniforms: GU, side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec3 vWP; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vWP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `varying vec3 vWP; uniform float uT, uHaze; ${NOISE_GLSL} ${GLASS_GLSL}
        void main(){ vec3 ro = cameraPosition, rd = normalize(vWP - ro); float tf = length(vWP - ro);
          vec3 a = vec3(${BX[0].x}, ${BX[0].y}, ${BX[0].z}), b = vec3(${BX[1].x}, ${BX[1].y}, ${BX[1].z});
          vec3 inv = 1. / rd, t0 = (a - ro) * inv, t1 = (b - ro) * inv; float tn = max(max(min(t0.x, t1.x), min(t0.y, t1.y)), min(t0.z, t1.z)); tn = max(tn, 0.);
          float len = tf - tn; if (len <= 0.) discard;
          const int NS = 72; float dt = len / float(NS), j = h2(gl_FragCoord.xy);
          float cosT = dot(rd, uL), g = .55, ph = (1. - g * g) / pow(1. + g * g - 2. * g * cosT, 1.5) * .08 + .02;
          vec3 acc = vec3(0.);
          for (int i = 0; i < NS; i++){ vec3 p = ro + rd * (tn + (float(i) + j) * dt);
            float d = .55 + .9 * gn(p * vec3(.35, .22, .35) + vec3(0., -uT * .05, uT * .03)) * gn(p * .9 + 3.1);
            d *= smoothstep(0., 3., p.y) * .6 + .4;
            acc += glassLight(p) * d * dt; }
          gl_FragColor = vec4(acc * ph * .13 * uHaze, 1.); }` });
    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m); box.scale.copy(BX[1].clone().sub(BX[0])); box.position.copy(BX[0].clone().add(BX[1]).multiplyScalar(.5)); box.frustumCulled = false; box.renderOrder = 5; S.add(box); }

  // ---- dust: motes that glint only where a shaft passes (coloured by it)
  { const n = 900, Rr = rng(57), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (Rr() - .5) * 9; p[i * 3 + 1] = .3 + Rr() * 15; p[i * 3 + 2] = -18 + Rr() * 34; sd[i] = Rr(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: { ...GU, uPx: { value: H / 1920 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx, uDust; varying vec3 vC; ${GLASS_GLSL}
        void main(){ vec3 q = position; q.y += mod(uT * (.04 + .05 * aS) + aS * 15., 15.) - 7.5 * aS; q.x += sin(uT * .3 + aS * 30.) * .35; q.z += cos(uT * .21 + aS * 17.) * .35;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (2. + 4. * aS) * 10. / d, 1., 9.); vC = glassLight(q) * .5 * clamp(1.4 - d / 30., 0., 1.) * (.5 + .5 * aS) * uDust; }`,
      fragmentShader: `varying vec3 vC; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 14.); gl_FragColor = vec4(vC * a, 1.); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 6; S.add(pts); }

  // ---------------------------------------------------------------- the camera: one Hermite spline per block (C1 in time)
  const RXm = RX / TW * WM - WM / 2, RYm = SILL + (1 - RY / TH) * HM;   // the round sun pane in the room
  const K1 = [   // [t, pos, look]  — slow crane down from the sun, then a slow push; the last two seconds a push + zoom into the sun pane
    [110.0, [.6, 10.0, 25], [0, 17.4, -20]],
    [116.0, [.5, 7.4, 19.5], [0, 11.5, -20]],
    [122.0, [.42, 5.3, 15.0], [0, 7.7, -20]],
    [128.0, [.38, 5.3, 12.8], [.05, 7.8, -20]],
    [134.0, [.34, 5.5, 10.8], [.1, 7.9, -20]],
    [140.0, [.3, 6.0, 8.4], [.2, 8.3, -20]],
    [142.4, [RXm, 8.4, 2.5], [RXm, RYm, -20]],
  ];
  const K2 = [   // from the sun pane (zoomed in, as block 1 ended) pulling back and rising
    [215.7, [RXm, 8.4, 2.5], [RXm, RYm, -20]],
    [222.0, [.32, 7.4, 7.0], [.2, 9.4, -20]],
    [230.0, [.42, 6.3, 13.8], [0, 8.1, -20]],
    [237.6, [.6, 8.8, 22], [0, 10.3, -20]],
  ];
  const fovAt = t => t < 180 ? lerp(FOV, 16, ss(140.0, 142.4, t)) : lerp(16, FOV, ss(215.7, 223.0, t));
  const herm = (K, t, idx) => { // cubic Hermite through keys with finite-difference (Catmull-Rom in time) tangents
    const n = K.length; t = clamp(t, K[0][0], K[n - 1][0]); let i = 0; while (i < n - 2 && t > K[i + 1][0]) i++;
    const [t0, a0, b0] = K[i], [t1, a1, b1] = K[i + 1], P0 = idx ? b0 : a0, P1 = idx ? b1 : a1, h = t1 - t0, u = (t - t0) / h;
    const tan = j => { if (j === 0 || j === n - 1) { const [ta, pa] = [K[Math.max(0, j - 1)][0], K[Math.max(0, j - 1)][idx ? 2 : 1]], [tb, pb] = [K[Math.min(n - 1, j + 1)][0], K[Math.min(n - 1, j + 1)][idx ? 2 : 1]]; return pa.map((v, q) => (pb[q] - v) / (tb - ta) * (j === 0 ? .4 : 1)); }
      const pa = K[j - 1][idx ? 2 : 1], pb = K[j + 1][idx ? 2 : 1]; return pa.map((v, q) => (pb[q] - v) / (K[j + 1][0] - K[j - 1][0])); };
    const m0 = tan(i), m1 = tan(i + 1), u2 = u * u, u3 = u2 * u, h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    return V(...P0.map((v, q) => h00 * v + h10 * h * m0[q] + h01 * P1[q] + h11 * h * m1[q])); };

  // ---------------------------------------------------------------- one frame
  function frame3D(t) {
    const Lk = film.look, D = film.dofCfg, blk2 = t > 180, K = blk2 ? K2 : K1;
    const pos = herm(K, t, 0), look = herm(K, t, 1); cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.fov = fovAt(t);
    GU.uT.value = t;
    let dark, crack, fig, sunP, rest, glow, goldK;
    if (!blk2) {
      dark = ss(T.dark[0], T.dark[1], t); crack = clamp((t - T.crack[0]) / (T.crack[1] - T.crack[0])); crack = 1 - (1 - crack) ** 1.6;
      fig = ss(T.fig[0], T.fig[1], t); sunP = ss(T.sun[0], T.sun[1], t); rest = 0; goldK = 0;
      glow = lerp(1.6, 3.2, ss(T.glow[0], T.glow[1], t));
    } else {
      dark = 1; crack = 1; sunP = 1; fig = 1 - ss(T.back[0], T.back[1], t);
      rest = lerp(.0, 1.12, ss(T.rest[0], T.rest[1], t)); goldK = 1; glow = 3.2;
    }
    GU.uSunGlow.value = blk2 ? 1 : 1 + 5 * ss(T.white[0] - .6, T.white[1], t); GU.uDark.value = dark; GU.uCrack.value = crack; GU.uFig.value = fig; GU.uSunP.value = sunP; GU.uRest.value = rest; GU.uGlow.value = glow; GU.uGoldK.value = goldK * 2.2;
    const alive = blk2 ? clamp(rest) : 1 - dark;                     // how much of the glass is alive (approx.)
    GU.uHaze.value = 1; GU.uDust.value = 1; GU.uRecv.value = 1;
    winL.intensity = 30 * glow / 3.2 * (.08 + .92 * alive) + 20 * sunP * (1 - alive);
    halo.power = 120 * glow / 3.2 * (.05 + .95 * alive) + 80 * sunP * (1 - alive);
    hemi.intensity = lerp(1.3, .32, alive); hemi.color.copy(col('#5a6680').lerp(col('#7a7c84'), 1 - alive));
    Lk.saturation = lerp(.6, 1.1, alive); Lk.exposure = 1.28 + .5 * (1 - alive);
    if (!blk2) Lk.exposure *= lerp(1, 4, ss(T.white[0], T.white[1] + .2, t));
    D.focus = pos.distanceTo(V(look.x, look.y, -20)); D.aperture = 1.0;
    film.render(t);
  }

  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const gS = mkC(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkC(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) {   // screen-space scattering (as veil-temple.js): bright pixels zoom-blurred from the window
    const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h);
    const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 150) / 105); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; }
    gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h);
    gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 20; i++) { const sc = 1 + i * .04; gbx.globalAlpha = Math.pow(.9, i) * .14; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); }
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.drawImage(gB, 0, 0, W, H); ctx.restore();
  }
  const tmp = V();
  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    frame3D(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    const blk2 = t > 180, alive = blk2 ? clamp(GU.uRest.value) : 1 - GU.uDark.value;
    tmp.set(0, SILL + HM * .62, WZ).project(cam);
    if (tmp.z < 1) godRays(ctx, (tmp.x + 1) / 2 * W, (1 - tmp.y) / 2 * H, .22 * alive);
    if (!blk2) { const wk = ss(T.white[0], T.white[1], t); if (wk > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,244,222,${wk})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  }
  return { film, draw, beats: () => T, GU };
}
