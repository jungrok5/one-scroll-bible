// glass-shatter3.js — 「kingdom」 2부 concept B3 (2026-11-19, owner: "장면 뜻 괜찮아 … 약한 점 보완"): B2 (glass-shatter.js) with the same
// form — break → dark frame → sun pane → village; restoration = the tape rewound, gold seams — and its weak points fixed:
//   · the man is drawn 1.3× larger and the camera comes close (≥ 22 % of the frame) while he turns away (N41) and back (N47);
//     the fracture seed is the one (of 400 searched) whose cracks cross his figure least, and seams over him are drawn thin;
//   · the plates collide with the iron saddle bars, the jamb columns, the jamb sides and the sill, and lie on top of one another
//     on the floor (shatter-core.js o.capsules / o.stack); the window is cut at the bars like a real panelled window;
//   · the shaft haze stops at the scene depth (a depth pre-pass) and thins near the glass and the camera; blue glass is kept
//     from tipping into lavender; the rewind is already running when the block starts; dull shards have streaks and a bevel.
// glass-shatter.js — 「kingdom」 2부 concept B2 (2026-11-19): the backlit stained-glass window of concept B rebuilt around a REAL
// break. The window is fractured once by the shatter engine (shatter-core.js, vendored from motion-skills/shatter-page:
// radial rays + stepped ring chords from the blow, a crushed zone, long daggers cleaved), every cell becomes a thin rigid plate
// in the engine's simulation (gravity, air, the floor, the window ledge, the wall under the sill, landing breaks, sleep), and
// the whole fall is recorded on the engine's tape before the first frame. Each plate is drawn in our own three.js nave with its
// own part of the window picture; the light in the room is computed from the glass that is still in the frame, cell by cell.
//   block 1 (C2a 110 → N43 142.3), one continuous camera:
//     N40 · Q40   the window whole, sunlight through it, coloured pools on the stone, dust in the shafts;
//     N41         the small man in the glass turns his back on the sun (his lead lines and panes are redrawn every frame from a
//                 posed skeleton — a real pose change); a star crack opens at his chest;
//     N42         the crack runs out (rays first, then the rings), the panes leave the frame from him outward (slow motion at
//                 the break), fall with weight and break again on the stone; each pool of coloured light on the floor goes out
//                 with its pane. Left: a dark, broken frame with a few dull shards; dark coloured shards on the floor;
//     ~139.7      in the empty frame the round sun pane relights; the camera pushes gently into its light → white → village S1.
//   block 2 (L43 215.7 → C2 237.6), one continuous camera pulling back from the sun pane: the tape rewinds — every pane's
//     own fall played backwards, from the sun pane outward; each pane that is back in its place relights and its cracks stay
//     as gold seams (kintsugi); the man's panes come back last and he turns to the sun again; the light floods the floor.
// Rules: no words in the art, no Jesus (the light only), God never depicted. API (as glass-window.js):
//   const GS = await (await import('./glass-shatter3.js')).build(W, H);  GS.draw(ctx, t, B)   (t = film seconds; B = line times)
// The simulation part (buildFall) is pure and runs in node too:  node -e "import('./glass-shatter3.js').then(m => m.fallStats())"
import { fracture, Sim, centroid, area, rngOf, clip } from './shatter-core.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const hyp = (x, y) => Math.sqrt(x * x + y * y);

// ---------------------------------------------------------------- the window (picture px, 1024 × 2680 = 6 × 15.7 m, 170.7 px/m)
export const TW = 1024, TH = 2680, WM = 6, HM = 15.7, SILL = 4.5, WZ = -19.4, WCY = SILL + HM / 2;
const YS = Math.round(5.196 / HM * TH);   // the arch springs here (equilateral pointed arch)
const SX = 512, SY = 470, SR = 84;        // the round sun pane (never breaks; it relights in the empty frame)
const FS = 1.3, FQ = 2;                   // B3: the man 1.3× larger than B2; his canvas at 2× the picture's resolution
const FR = [521, 1699, 911, 2251];        // figure rect (px): x0, y0, x1, y1 (300 × 425 drawing units × FS)
const FC = [781, 2214];                   // the blow: the ground at the man's feet (in his turned-away pose)
const BARS = [1000, 1400, 1800, 2200, 2560];   // the iron saddle bars (picture y px)
const LEDGE = WZ + .95;                   // the front of the window ledge / the wall under the sill
const pxToPane = (X, Y) => [(X / TW - .5) * WM, (.5 - Y / TH) * HM];
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

// pot-metal colours (sRGB). Chartres: deep blue grounds leaning to cyan (the tone curve pulls saturated blue toward violet, so
// the glass is set a little greener than the blue we want on screen), ruby borders and fillers, gold, little green, pearl.
const PAL = {
  border: ['#a50f26', '#b6152c', '#8f0b20', '#a50f26', '#b6152c', '#0a58b6', '#e7a326'], pearl: ['#efe7cc', '#f3ecd6', '#e8dcb0'],
  ring: ['#e48d1f', '#d97e1c', '#eb9a2a'], sunR: ['#f7c22e', '#ffcf3e', '#f0b52a'], rayA: ['#ef9d22', '#e48a18'], rayB: ['#ffe07c', '#f8d468'],
  sky: ['#0a5aa8', '#0b62b0', '#084f9c', '#0c68b8', '#074690', '#0d6cbe', '#0a5aa8', '#0b62b0', '#084f9c', '#0c68b8', '#074690', '#0d6cbe', '#0a5aa8', '#0b62b0', '#084f9c', '#0c68b8', '#074690', '#0d6cbe', '#0a5aa8', '#0b62b0'],
  far: ['#0b5d8e', '#0a6896', '#0e5a82', '#0a527e'], hill: ['#1d6b52', '#22745a', '#18604a', '#2a7c5c'],
  mead: ['#2c7a22', '#36852a', '#25701e', '#3f8f2c', '#1d6418'], canopy: ['#24822c', '#2f9234', '#1c7426', '#3a9c34', '#48a83a'], fruit: ['#c0122a', '#d01c30'],
  trunk: ['#7a3a1e', '#6c321a', '#84421f'], river: ['#9fd0ff', '#c6e2ff', '#86bdf2', '#dcefff'], flower: ['#c8182c', '#f2eee0', '#f2c43a'],
};
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// hand-cut glass: a power diagram of 1–3 seeds per grid cell, the plane warped first (curved cuts) and stretched along the
// form (ani, ang), some neighbours joined into one bigger irregular piece
function vorH(X, Y, cs, salt, ani = 1, ang = 0) {
  const wx = X + cs * .5 * (vnoise(X / (cs * 2.3), Y / (cs * 2.3), salt) - .5) * 2, wy = Y + cs * .5 * (vnoise(X / (cs * 2.3) + 17.3, Y / (cs * 2.3), salt + 7) - .5) * 2;
  const ca = Math.cos(ang), sa = Math.sin(ang), u = (wx * ca + wy * sa) / ani, v = -wx * sa + wy * ca, gx = Math.floor(u / cs), gy = Math.floor(v / cs);
  let b1 = 1e18, cx1 = 0, cy1 = 0, s1 = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const cx = gx + i, cy = gy + j, k = 1 + (hashi(cx * 3 + salt, cy * 5) < .32 ? 1 : 0) + (hashi(cx * 11, cy * 7 + salt) < .1 ? 1 : 0);
    for (let s = 0; s < k; s++) { const sx = (cx + .05 + .9 * hashi(cx * 7 + salt + s * 101, cy)) * cs, sy = (cy + .05 + .9 * hashi(cx, cy * 13 + salt + s * 57)) * cs,
        w = (hashi(cx + s * 3, cy + salt * 2) - .5) * cs * cs * .6, d = (u - sx) ** 2 + (v - sy) ** 2 - w;
      if (d < b1) { b1 = d; cx1 = cx; cy1 = cy; s1 = s; } } }
  if (s1 === 0 && hashi(cx1 * 17 + salt, cy1 * 23) < .2) cx1 += 1;   // joined with the neighbour to the right
  return ((cx1 + 512) * 1024 + (cy1 + 512)) * 4 + s1;
}

function paintWindow() {
  const R = rngOf(1717);
  const fruits = []; for (let i = 0; i < 40 && fruits.length < 13; i++) { const c = CAN[(R() * CAN.length) | 0], a = R() * 6.283, r = Math.sqrt(R()) * c[2] * .8, x = c[0] + Math.cos(a) * r, y = c[1] + Math.sin(a) * r; if (fruits.every(f => hyp(f[0] - x, f[1] - y) > 70)) fruits.push([x, y]); }
  const flowers = []; for (let i = 0; i < 200 && flowers.length < 22; i++) { const x = 90 + R() * 850, y = 2000 + R() * 620;
    if (y < yMead(x) + 20 || Math.abs(x - riverX(y)) < riverHW(y) + 24 || (x > FR[0] - 10 && x < FR[2] + 10 && y > FR[1] && y < FR[3] + 30) || (Math.abs(x - 380) < 80 && y < 2340)) continue;
    if (flowers.every(f => hyp(f[0] - x, f[1] - y) > 60)) flowers.push([x, y, (R() * 3) | 0]); }
  const piece = (X, Y) => {
    if (!insideW(X, Y)) return [0, 0];
    const ed = edgeD(X, Y);
    if (ed < 44) { const al = Y >= YS + 40 ? Y : Math.atan2(Y - YS, X < TW / 2 ? X - TW : X) * 900; return [1, vorH(X + (X < 512 ? 0 : 5000), al, 54, 3, 1, 0)]; }
    if (ed < 60) return [2, vorH(X, Y, 19, 5)];
    const sr = hyp(X - SX, Y - SY), sa = Math.atan2(Y - SY, X - SX) + Math.PI;
    if (sr < SR) return [3, 0];
    if (sr < 150) return [6, Math.floor((sa + .15 * Math.sin(sr * .05)) / 6.2832 * 12)];
    { const k = Math.floor(sa / 6.2832 * 24), f = sa / 6.2832 * 24 - k, len = k % 4 === 0 ? 330 : k % 4 === 2 ? 258 : 0;
      if (sr < len && Math.abs(f - .5) < .5 * (1 - (sr - 150) / (len - 150 + 1)) + .06) return [k % 4 === 0 ? 7 : 8, k * 4 + (sr > (len + 150) / 2 ? 1 : 0)]; }
    for (let i = 0; i < fruits.length; i++) if (hyp(X - fruits[i][0], Y - fruits[i][1]) < 19) return [9, i];
    let inC = false; for (const c of CAN) if (hyp(X - c[0], Y - c[1]) < c[2]) { inC = true; break; }
    if (inC) return [10, vorH(X, Y, 50, 7, 1.25, .5)];
    if (Y > 1360 && Y < 2300 && Math.abs(X - trunkX(Y)) < trunkHW(Y)) return [11, Math.floor((Y + 30 * Math.sin(X * .05)) / 86) * 2 + (X > trunkX(Y) + 6 * Math.sin(Y * .03) ? 1 : 0)];
    if (Y > 2290 && Math.abs(X - riverX(Y)) < riverHW(Y)) return [12, vorH(X, Y, 46, 9, 1.8, .2)];
    for (let i = 0; i < flowers.length; i++) if (hyp(X - flowers[i][0], Y - flowers[i][1]) < 13) return [13, i];
    if (Y >= yMead(X)) return [14, vorH(X, Y, 58, 11, 1.7, .05)];
    if (Y >= yNear(X)) return [15, vorH(X, Y, 62, 13, 2.0, .02)];
    if (Y >= yFar(X)) return [16, vorH(X, Y, 62, 17, 2.0, -.03)];
    return [17, vorH(X, Y, 62, 19, 1.1, Math.atan2(Y - SY, X - SX) + 1.57)];   // the sky cut in rings round the sun
  };
  const REG = [null, 'border', 'pearl', 'round', null, null, 'ring', 'rayA', 'rayB', 'fruit', 'canopy', 'trunk', 'river', 'flower', 'mead', 'hill', 'far', 'sky'];
  const N = TW * TH, pid = new Int32Array(N), reg = new Uint8Array(N);
  for (let Y = 0; Y < TH; Y++) for (let X = 0; X < TW; X++) { const [r, s] = piece(X + .5, Y + .5), i = Y * TW + X; pid[i] = r === 0 ? -1 : (r << 25) + (s & 0x1ffffff); reg[i] = r; }
  const info = new Map();
  const infoOf = (id, r) => { let o = info.get(id); if (o) return o; const h = hashi(id, 77), h2 = hashi(id, 91), h3 = hashi(id, 13);
    const pal = r === 13 ? [PAL.flower[(id & 3) % 3]] : r === 3 ? ['#ffe58a'] : PAL[REG[r]], base = rgbOf(pal[Math.floor(h * pal.length) % pal.length]);
    const v = .8 + .32 * h2, tint = [1 + .1 * (h3 - .5), 1 + .12 * (hashi(id, 5) - .5), 1 + .1 * (hashi(id, 6) - .5)];
    o = { c: base.map((q, k) => q * v * tint[k]), ang: hashi(id, 9) * 3.1416, sd: (id & 1023) }; info.set(id, o); return o; };
  const cC = document.createElement('canvas'); cC.width = TW; cC.height = TH; const gC = cC.getContext('2d'), imC = gC.createImageData(TW, TH), dC = imC.data;
  const lead = new Uint8Array(N);
  for (let Y = 0; Y < TH; Y++) for (let X = 0; X < TW; X++) { const i = Y * TW + X, k = i * 4, id = pid[i];
    if (id < 0) { dC[k] = dC[k + 1] = dC[k + 2] = 0; dC[k + 3] = 255; lead[i] = 255; continue; }
    const lw = 3 + (hashi(id, 31) < .3 ? 1 : 0);
    for (const [dx, dy] of [[lw, 0], [-lw, 0], [0, lw], [0, -lw], [lw - 1, lw - 1], [1 - lw, lw - 1], [lw - 1, 1 - lw], [1 - lw, 1 - lw]]) { const x2 = X + dx, y2 = Y + dy; if (x2 < 0 || y2 < 0 || x2 >= TW || y2 >= TH || pid[y2 * TW + x2] !== id) { lead[i] = 255; break; } }
    const o = infoOf(id, reg[i]), c = o.c;
    // pot-metal: uneven density, streaks drawn out along the piece's own direction, a few seed bubbles
    const ca = Math.cos(o.ang), sa = Math.sin(o.ang), u = X * ca + Y * sa, v = -X * sa + Y * ca;
    let m = .8 + .32 * vnoise(X / 42, Y / 42, o.sd) + .14 * (vnoise(u / 5, v / 70, o.sd + 3) - .5) + .06 * (vnoise(u / 2.2, v / 30, o.sd + 9) - .5);
    const bx = Math.floor(X / 7), by = Math.floor(Y / 7), hb = hashi(bx * 31 + o.sd, by * 17);
    if (hb < .016) { const ox = (bx + .5) * 7 - X, oy = (by + .5) * 7 - Y, rr = hyp(ox, oy), br = 1 + 2 * hashi(bx, by); if (rr < br) m *= 1.35; else if (rr < br + 1.2) m *= .7; }
    dC[k] = clamp(c[0] * m, 0, 255); dC[k + 1] = clamp(c[1] * m, 0, 255); dC[k + 2] = clamp(c[2] * m, 0, 255); dC[k + 3] = 255; }
  // the iron saddle bars are opaque too
  for (const by of BARS) for (let Y = by - 6; Y <= by + 6; Y++) for (let X = 0; X < TW; X++) if (pid[Y * TW + X] >= 0) lead[Y * TW + X] = 255;
  // matting: the painter's wash darkens every piece toward its lead, so the centres glow
  { const dist = new Float32Array(N); for (let i = 0; i < N; i++) dist[i] = lead[i] ? 0 : 1e6;
    for (let Y = 1; Y < TH; Y++) for (let X = 1; X < TW - 1; X++) { const i = Y * TW + X; dist[i] = Math.min(dist[i], dist[i - 1] + 1, dist[i - TW] + 1, dist[i - TW - 1] + 1.414, dist[i - TW + 1] + 1.414); }
    for (let Y = TH - 2; Y >= 0; Y--) for (let X = TW - 2; X >= 1; X--) { const i = Y * TW + X; dist[i] = Math.min(dist[i], dist[i + 1] + 1, dist[i + TW] + 1, dist[i + TW + 1] + 1.414, dist[i + TW - 1] + 1.414); }
    for (let i = 0; i < N; i++) { if (pid[i] < 0) continue; const k = i * 4, m = .42 + .58 * Math.min(1, dist[i] / 18) ** .75; dC[k] *= m; dC[k + 1] *= m; dC[k + 2] *= m; } }
  gC.putImageData(imC, 0, 0);
  // grisaille: the painted brown line on the glass — it holds back the light
  const g = gC; g.lineCap = 'round'; g.lineJoin = 'round';
  g.save(); g.beginPath(); g.moveTo(0, TH); g.lineTo(TW, TH); g.lineTo(TW, YS); g.arc(0, YS, TW, 0, -Math.PI / 3, true); g.arc(TW, YS, TW, -2 * Math.PI / 3, -Math.PI, true); g.closePath(); g.clip();
  g.strokeStyle = 'rgba(34,24,10,.42)';
  for (let i = 0; i < 120; i++) { const c = CAN[(R() * CAN.length) | 0], a = R() * 6.283, r = Math.sqrt(R()) * c[2] * .92, x = c[0] + Math.cos(a) * r, y = c[1] + Math.sin(a) * r, s = 10 + R() * 10, o = R() * 6.283;
    g.lineWidth = 2.4 + R(); g.beginPath(); g.moveTo(x - Math.cos(o) * s, y - Math.sin(o) * s); g.quadraticCurveTo(x + Math.cos(o + 1.4) * s * .5, y + Math.sin(o + 1.4) * s * .5, x + Math.cos(o) * s, y + Math.sin(o) * s); g.stroke(); }
  for (let i = 0; i < 30; i++) { const y0 = 1400 + R() * 880, x = trunkX(y0) + (R() - .5) * 30; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (R() - .5) * 8, y0 + 40 + R() * 50); g.stroke(); }
  g.strokeStyle = 'rgba(20,40,80,.45)'; for (let y = 2310; y < TH; y += 26) { const hw = riverHW(y) * .8, x = riverX(y); g.lineWidth = 2.4; g.beginPath(); for (let k = -1; k <= 1; k += .1) { const xx = x + k * hw, yy = y + Math.sin(k * 7 + y * .1) * 4; k === -1 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke(); }
  g.strokeStyle = 'rgba(70,30,6,.42)'; g.lineWidth = 2.5; for (let k = 0; k < 48; k++) { const a = k / 48 * 6.283; g.beginPath(); g.moveTo(SX + Math.cos(a) * 158, SY + Math.sin(a) * 158); g.lineTo(SX + Math.cos(a) * (k % 2 ? 236 : 296), SY + Math.sin(a) * (k % 2 ? 236 : 296)); g.stroke(); }
  g.strokeStyle = 'rgba(90,40,4,.35)'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(SX, SY, 30 + k * 18, 0, 6.283); g.stroke(); }
  g.strokeStyle = 'rgba(10,18,40,.35)'; g.lineWidth = 3;
  for (const [f, off, n] of [[yFar, 30, 3], [yNear, 26, 3], [yMead, 40, 2]]) for (let j = 1; j <= n; j++) { g.beginPath(); for (let X = 70; X < 960; X += 12) { const y = f(X) + j * off + 6 * Math.sin(X * .05 + j); X === 70 ? g.moveTo(X, y) : g.lineTo(X, y); } g.stroke(); }
  g.strokeStyle = 'rgba(20,40,10,.45)'; g.lineWidth = 2.4; for (let i = 0; i < 90; i++) { const x = 80 + R() * 860, y = 2010 + R() * 630; if (Math.abs(x - riverX(y)) < riverHW(y) + 10) continue; g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x - 2, y - 14); g.moveTo(x, y); g.lineTo(x + 1, y - 18); g.moveTo(x + 7, y); g.lineTo(x + 4, y - 13); g.stroke(); }
  // a faint painted wash in the sky so the blue is not flat (Chartres glass is uneven)
  g.globalCompositeOperation = 'multiply'; for (let i = 0; i < 70; i++) { const x = R() * TW, y = R() * 1900, r = 40 + R() * 120, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(150,150,170,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  g.globalCompositeOperation = 'source-over'; g.restore();
  return { col: cC, lead };
}

// ---------------------------------------------------------------- the man (lead lines + panes from a posed skeleton, every frame)
// p = 0: facing the sun (up-left), both arms lifted toward it; p = 1: his back to it, walking out to the right, head bowed.
// Parts move on their own clocks (head first, then the arms fall, then the body steps away), so the turn reads as a turn.
const FIG_A = { head: [150, 108, 30], face: [-2.35, 1.45], neck: [151, 140],
  armL: [[128, 150], [104, 96], [78, 42]], armR: [[174, 150], [140, 90], [120, 32]],
  robe: [[124, 148], [178, 146], [194, 250], [216, 396], [162, 398], [152, 398], [142, 398], [86, 396], [106, 250]], feet: [[118, 404], [178, 404]] };
const FIG_B = { head: [200, 132, 29], face: [.55, .5], neck: [196, 160],
  armL: [[172, 168], [168, 226], [176, 282]], armR: [[214, 172], [226, 228], [238, 276]],
  robe: [[168, 160], [216, 166], [232, 252], [268, 390], [216, 396], [198, 330], [184, 396], [124, 392], [150, 252]], feet: [[148, 400], [252, 398]] };
function drawFigure(f, p) {
  f.setTransform(1, 0, 0, 1, 0, 0); f.clearRect(0, 0, f.canvas.width, f.canvas.height); const sk = f.canvas.width / 300; f.setTransform(sk, 0, 0, sk, 0, 0); f.lineCap = f.lineJoin = 'round';
  const kh = ss(0, .55, p), ka = ss(.12, .75, p), kb = ss(.3, 1, p);
  const P2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const robeC = '#efe4cc', robeD = '#d9c8a6', skin = '#efc6a2', hair = '#5a3216', L = '#060404';
  const robe = FIG_A.robe.map((q, i) => P2(q, FIG_B.robe[i], kb));
  const arm = (A, B) => A.map((q, i) => P2(q, B[i], i === 0 ? kb : ka));
  const limb = pts => { f.strokeStyle = L; f.lineWidth = 26; f.beginPath(); pts.forEach((q, i) => i ? f.lineTo(q[0], q[1]) : f.moveTo(q[0], q[1])); f.stroke(); f.strokeStyle = robeD; f.lineWidth = 16; f.stroke();
    const h = pts[pts.length - 1]; f.fillStyle = skin; f.strokeStyle = L; f.lineWidth = 6; f.beginPath(); f.arc(h[0], h[1], 10, 0, 6.283); f.fill(); f.stroke(); };
  const aL = arm(FIG_A.armL, FIG_B.armL), aR = arm(FIG_A.armR, FIG_B.armR);
  // arms behind the body while lifted toward the sun on the far side, in front once they hang
  if (ka < .5) { limb(aL); limb(aR); }
  for (const [a, b] of [[FIG_A.feet[0], FIG_B.feet[0]], [FIG_A.feet[1], FIG_B.feet[1]]]) { const q = P2(a, b, kb); f.fillStyle = '#3a2414'; f.strokeStyle = L; f.lineWidth = 5; f.beginPath(); f.ellipse(q[0], q[1], 17, 8, 0, 0, 6.283); f.fill(); f.stroke(); }
  f.beginPath(); robe.forEach((q, i) => i ? f.lineTo(q[0], q[1]) : f.moveTo(q[0], q[1])); f.closePath(); f.fillStyle = robeC; f.fill(); f.strokeStyle = L; f.lineWidth = 8; f.stroke();
  // the robe is several panes: belt, the cut down the skirt to the stride, a darker mantle pane over the near shoulder
  const wl = robe[8], wr = robe[2], mid = P2(wl, wr, .5), cr = robe[5];
  f.save(); f.beginPath(); robe.forEach((q, i) => i ? f.lineTo(q[0], q[1]) : f.moveTo(q[0], q[1])); f.closePath(); f.clip();
  f.fillStyle = robeD; f.beginPath(); f.moveTo(robe[0][0], robe[0][1]); f.lineTo(robe[1][0], robe[1][1]); f.lineTo(lerp(robe[1][0], wr[0], .55), lerp(robe[1][1], wr[1], .55)); f.lineTo(lerp(wl[0], wr[0], .3), lerp(wl[1], wr[1], .3) - 30); f.closePath(); f.fill();
  f.strokeStyle = 'rgba(70,46,22,.55)'; f.lineWidth = 2.6; for (let i = 0; i < 6; i++) { const u = (i + .5) / 6, a = P2(wl, wr, u), b = P2(robe[7], robe[3], u); f.beginPath(); f.moveTo(a[0], a[1] + 8); f.quadraticCurveTo(lerp(a[0], b[0], .5) + 6 * (u - .5), lerp(a[1], b[1], .5), b[0], b[1] - 6); f.stroke(); }
  f.restore();
  f.strokeStyle = L; f.lineWidth = 6; f.beginPath(); f.moveTo(wl[0], wl[1]); f.lineTo(wr[0], wr[1]); f.moveTo(mid[0], mid[1]); f.lineTo(cr[0], cr[1]); f.moveTo(robe[0][0], robe[0][1]); f.lineTo(lerp(wl[0], wr[0], .3), lerp(wl[1], wr[1], .3) - 30); f.stroke();
  if (ka >= .5) { limb(aL); limb(aR); }
  // head: one skin pane and one hair pane; the hair pane swings round from the back of his head to all of it as he turns away
  const hA = FIG_A.head, hB = FIG_B.head, hx = lerp(hA[0], hB[0], kb * .6 + kh * .4), hy = lerp(hA[1], hB[1], kb * .6 + kh * .4), hr = lerp(hA[2], hB[2], kh);
  const fc = lerp(FIG_A.face[0], FIG_B.face[0], kh), fw = lerp(FIG_A.face[1], FIG_B.face[1], kh);
  const nk = P2(FIG_A.neck, FIG_B.neck, kb); f.strokeStyle = L; f.lineWidth = 22; f.beginPath(); f.moveTo(nk[0], nk[1] + 8); f.lineTo(hx, hy); f.stroke(); f.strokeStyle = skin; f.lineWidth = 12; f.stroke();
  f.beginPath(); f.arc(hx, hy, hr, 0, 6.283); f.fillStyle = hair; f.fill();
  f.beginPath(); f.moveTo(hx, hy); f.arc(hx, hy, hr, fc - fw, fc + fw); f.closePath(); f.fillStyle = skin; f.fill();
  f.strokeStyle = L; f.lineWidth = 5; f.beginPath(); f.moveTo(hx + Math.cos(fc - fw) * hr, hy + Math.sin(fc - fw) * hr); f.lineTo(hx + Math.cos(fc - fw) * hr * .25, hy + Math.sin(fc - fw) * hr * .25); f.lineTo(hx + Math.cos(fc + fw) * hr, hy + Math.sin(fc + fw) * hr); f.stroke();
  f.lineWidth = 7; f.beginPath(); f.arc(hx, hy, hr, 0, 6.283); f.stroke();
}

// ---------------------------------------------------------------- the break: fracture + simulation, recorded on the tape (pure)
const WCRACK = { rays: 17, rayJitter: .6, rings: 7, ringGrow: 1.72, crush: .03, ringJitter: .24, ringSkip: .26, cleave: .0105, crumble: .35, minArea: .0035 };
const LCRACK = { rays: 6, rayJitter: .7, rings: 2, ringGrow: 2.2, crush: .07, ringJitter: .3, ringSkip: .4, cleave: .028, crumble: .25, minArea: .003 };
const PHYS = { density: 2500, bounce: .2, friction: .5, spin: 1, throw: .8, air: 1, breakSpeed: 5.5 };
export const GLASS_TH = .014;
function lancetPane() {   // the lancet in pane metres (origin at its centre, y up), counter-clockwise
  const P = [], ys = HM / 2 - 5.196, n = 24, th = Math.acos(.5);
  P.push([-3, -HM / 2], [3, -HM / 2], [3, ys]);
  for (let i = 1; i < n; i++) { const a = th * i / n; P.push([-3 + Math.cos(a) * 6, ys + Math.sin(a) * 6]); }
  P.push([0, ys + 5.196]);
  for (let i = n - 1; i >= 1; i--) { const a = Math.PI - th * i / n; P.push([3 + Math.cos(a) * 6, ys + Math.sin(a) * 6]); }
  P.push([-3, ys]);
  return P;
}
export const SEED = 4;   // B3: of seeds 1–400, the one whose cracks cross the man least (figSeams 14.3 m; B2 seed 2027 gave 19.9, the median 18.4)
function cellsFor(seed) {   // the fracture, then every cell cut along the saddle bars (a real window is panelled at its bars)
  const P = lancetPane(), q = pxToPane(...FC), ref = Math.sqrt(Math.abs(area(P)));
  const res = fracture(P, q, 1, WCRACK, rngOf(seed), ref);
  let cells = res.cells;
  for (const by of BARS) { const yb = (.5 - by / TH) * HM, out = [];
    for (const c of cells) for (const part of [clip(c, 0, 1, yb), clip(c, 0, -1, -yb)]) if (part.length >= 3 && Math.abs(area(part)) > 2e-5) out.push(part);
    cells = out; }
  res.cells = cells; return { P, q, ref, res };
}
// how much crack runs across the man (length of cell edges inside his figure, metres) — the seed search keeps this small
export function figSeams(seed) { const { res } = cellsFor(seed), [x0, y1] = pxToPane(640, 1735), [x1, y0] = pxToPane(880, 2190); let L = 0;
  for (const c of res.cells) for (let i = 0; i < c.length; i++) { const a = c[i], b = c[(i + 1) % c.length], n = 12;
    for (let k = 0; k < n; k++) { const u = (k + .5) / n, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; if (x > x0 && x < x1 && y > y0 && y < y1) L += hyp(b[0] - a[0], b[1] - a[1]) / n; } }
  return L / 2; }
export function buildFall(seed = SEED) {
  const { P, q, ref, res } = cellsFor(seed);
  let Rmax = 0; for (const p of P) Rmax = Math.max(Rmax, hyp(p[0] - q[0], p[1] - q[1]));
  const sunP = pxToPane(SX, SY), R = rngOf(99);
  const YSP = SILL + HM - 5.196, capsules = [
    ...BARS.map(by => { const y = SILL + (1 - by / TH) * HM; return { a: [-3.15, y, WZ + .07], b: [3.15, y, WZ + .07], r: .042 }; }),   // B3: saddle bars
    ...[[1.0, LEDGE - .25], [.6, LEDGE - .6], [.2, LEDGE - .95]].flatMap(([o, z]) => [-1, 1].map(sx => ({ a: [sx * (3 + o), SILL - o, z], b: [sx * (3 + o), YSP, z], r: .12 }))),   // jamb columns
  ];
  const sim = new Sim({ material: { thickness: GLASS_TH, crack: LCRACK, physics: PHYS }, seed: 11, refSize: 2.4, maxShards: 2600, capsules, stack: true,
    planes: [
      { n: [0, 1, 0], d: 0, lift: 1 },                                                                                         // the nave floor
      { n: [0, 1, 0], d: SILL - .07, lift: 1, maxDepth: .2, region: (x, y, z) => z < LEDGE && z > WZ - .4 && Math.abs(x) < 3.4 },   // the window ledge
      { n: [0, 0, 1], d: LEDGE + .05, maxDepth: .45, region: (x, y, z) => y < SILL - .12 },                                    // the wall under the sill (and the sill's front)
      ...[[3.0, WZ + .25], [3.4, WZ + .6], [3.8, LEDGE]].flatMap(([xj, zj]) => [-1, 1].map(sx => ({ n: [-sx, 0, 0], d: -xj, maxDepth: .3,   // B3: the jamb sides
        region: (x, y, z) => z < zj && y > SILL - .1 && y < WCY + HM / 2 - 5.196 }))),
      { n: [0, 0, 1], d: WZ - .03, maxDepth: .3, region: (x, y, z) => y > SILL - .12 },                                         // nothing goes out through the frame
    ] });
  const onEdge = c => c.some(([x, y]) => P.some((a, i) => { const b = P[(i + 1) % P.length], ex = b[0] - a[0], ey = b[1] - a[1], l = hyp(ex, ey); return Math.abs((x - a[0]) * ey - (y - a[1]) * ex) / l < .02; }));
  const cells = res.cells.map((poly, i) => {
    const c = centroid(poly), d = hyp(c[0] - q[0], c[1] - q[1]), ang = Math.atan2(c[1] - q[1], c[0] - q[0]);
    let sector = 0; const th = res.rays; for (let k = 0; k < th.length; k++) { const a0 = th[k], a1 = k + 1 < th.length ? th[k + 1] : th[0] + 2 * Math.PI; let a = ang; while (a < a0) a += 2 * Math.PI; if (a < a1) { sector = k; break; } }
    const edge = onEdge(poly), dSun = hyp(c[0] - sunP[0], c[1] - sunP[1]);
    const stay = (edge && R() < .5) || R() < .05;   // a few dull shards are left in the frame
    const rel = .2 + 2.5 * Math.pow(d / Rmax, .95) + .4 * R();
    return { i, poly, c, area: Math.abs(area(poly)), d, sector, edge, stay, rel, dSun };
  });
  for (const cl of cells) {
    const b = sim.addShard(cl.poly, [cl.c[0], WCY + cl.c[1], WZ], [0, 0, 0, 1], 1); cl.body = b.id; b.cell = cl.i;
    b.held = 1; b.release = cl.stay ? 0 : cl.rel;
    const ox = (cl.c[0] - q[0]) / (cl.d || 1), oy = (cl.c[1] - q[1]) / (cl.d || 1), near = Math.pow(clamp(1 - cl.d / 3), 1.5);
    b.v = [ox * (.25 + 1.4 * near) + (R() - .5) * .3, oy * (.2 + 1.2 * near) - .1, 1.25 + 1.3 * R() + 1.6 * near];
    b.w = [-(.6 + 2.2 * R()) * (1 + near), (R() - .5) * 1.6, (R() - .5) * 2.2];
  }
  sim.record();
  const TMAX = 14; let guard = 0;
  while (sim.time < TMAX && guard++ < TMAX * 240 + 10) { sim.step(); if (sim.time > 3.6 && sim.awakeCount() === 0) break; }
  sim.record();
  const bodies = sim.bodies.map(b => ({ id: b.id, loc: b.loc, c: b.c, poly: b.poly, gen: b.gen, born: b.born, died: b.died, parent: b.parent, area: b.area }));
  for (const b of bodies) { let r = b; while (r.gen > 1) r = bodies[r.parent]; b.root = sim.bodies[r.id].cell; }
  // per cell: when its pieces last moved (the rewind skips the still time after that)
  const frames = sim.frames, last = new Float32Array(cells.length);
  for (let k = 1; k < frames.length; k++) { const A = frames[k - 1], B = frames[k];
    for (let i = 0; i < Math.min(A.n, B.n); i++) { const b = bodies[i]; if (!(b.born <= B.t && B.t < b.died)) continue; const o = i * 14;
      if (Math.abs(A.d[o] - B.d[o]) + Math.abs(A.d[o + 1] - B.d[o + 1]) + Math.abs(A.d[o + 2] - B.d[o + 2]) > .003) last[b.root] = Math.max(last[b.root], B.t); } }
  for (const cl of cells) cl.settle = cl.stay ? cl.rel : clamp(last[cl.i], cl.rel + .3, cl.rel + 5);   // B3: a late creep on the pile is skipped (the rewind starts from the pose at rel + 5 s at most)
  return { P, q, ref, Rmax, res, cells, bodies, frames, simEnd: sim.time, sim };
}
// pose of body i at tape time t → out [x, y, z, qx, qy, qz, qw]; false when the body does not exist then
export function poseOf(F, i, t, out) {
  const b = F.bodies[i]; if (!(b.born <= t + 1e-9 && t < b.died)) return false;
  const fr = F.frames; let lo = 0, hi = fr.length - 1;
  if (t <= fr[0].t) hi = 0; else { while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (fr[mid].t <= t) lo = mid; else hi = mid - 1; } }
  let A = fr[lo], B = fr[Math.min(lo + 1, fr.length - 1)]; if (i >= A.n) { A = B; if (i >= A.n) return false; }
  if (i >= B.n) B = A;
  const f = B.t > A.t ? clamp((t - A.t) / (B.t - A.t)) : 0, oa = i * 14;
  for (let j = 0; j < 3; j++) out[j] = lerp(A.d[oa + j], B.d[oa + j], f);
  const dq = A.d[oa + 3] * B.d[oa + 3] + A.d[oa + 4] * B.d[oa + 4] + A.d[oa + 5] * B.d[oa + 5] + A.d[oa + 6] * B.d[oa + 6], sg = dq < 0 ? -1 : 1; let l = 0;
  for (let j = 0; j < 4; j++) { out[3 + j] = lerp(A.d[oa + 3 + j] * sg, B.d[oa + 3 + j], f); l += out[3 + j] ** 2; }
  l = Math.sqrt(l) || 1; for (let j = 0; j < 4; j++) out[3 + j] /= l;
  return true;
}
export function fallStats(seed) { const t0 = Date.now(), F = buildFall(seed); const stay = F.cells.filter(c => c.stay).length;
  const out = { ms: Date.now() - t0, cells: F.cells.length, stay, bodies: F.bodies.length, frames: F.frames.length, simEnd: +F.simEnd.toFixed(2),
    settleMax: +Math.max(...F.cells.map(c => c.settle - c.rel)).toFixed(2), relMax: +Math.max(...F.cells.map(c => c.rel)).toFixed(2), gens: [1, 2, 3, 4].map(g => F.bodies.filter(b => b.gen === g).length) };
  console.log(JSON.stringify(out)); return out; }

// ---------------------------------------------------------------- beats from the line times
export function beats(B) {
  const T = {};
  T.glow = [110.0, B.N40 + 3.0];                      // the window brightens as N40 is spoken
  T.fig = [B.N41 + 1.3, B.N41 + 3.9];                 // the man turns away
  T.crack0 = [B.N41 + 4.3, B.N42 - .2];               // a star crack opens at his chest
  T.brk = B.N42 + .05;                                // the crack runs out; the tape starts (sim time 0)
  T.sunOn = [B.N43 - 2.6, B.N43 - 1.3];               // the round sun pane relights in the empty frame
  T.white = [B.N43 - 1.0, B.N43 + .25];               // the push into its light ends in white
  T.r0 = B.L43; T.rew = [B.L43 - 3.9, B.L43 + 9.3];   // B3: the rewind (from the sun pane outward) is already running at the block start
  T.rate = .85;                                       // rewind speed (tape seconds per film second)
  T.back = null;                                      // the man turns back: set from the data (after his panes are home)
  T.r1 = B.C2;
  return T;
}

// ---------------------------------------------------------------- GLSL
const GLASS_GLSL = /* glsl */`
  uniform sampler2D tCol, tCrack, tFig; uniform highp usampler2D tCell; uniform highp sampler2D tState;
  uniform float uCrackK, uGlow, uSun, uSunGlow, uGoldK, uSunHot;
  uniform vec4 uFigRect; uniform vec3 uL; uniform vec3 uRound; uniform vec3 uSunPos; uniform float uNight, uSunLamp;
  float lancet(vec2 uv){ vec2 m = vec2(uv.x * ${WM.toFixed(1)}, uv.y * ${HM.toFixed(2)}); float ys = ${(HM - 5.196).toFixed(3)};
    if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) return 0.;
    if (m.y < ys) return 1.; return step(length(m - vec2(${WM.toFixed(1)}, ys)), ${WM.toFixed(1)}) * step(length(m - vec2(0., ys)), ${WM.toFixed(1)}); }
  int cellAt(vec2 uv){ ivec2 p = clamp(ivec2(uv * vec2(${TW}., ${TH}.)), ivec2(0), ivec2(${TW - 1}, ${TH - 1})); return int(texelFetch(tCell, p, 0).r); }
  vec4 stateOf(int id){ return texelFetch(tState, ivec2(id % 64, id / 64), 0); }
  // linear pot-metal colour at uv (with the man painted over his part)
  // B3: blue glass keeps its blue (less red, a touch of green) so the tone curve does not turn the bright sky lavender
  vec3 blueGuard(vec3 c){ float bl = clamp((c.b - max(c.r, c.g)) / max(c.b, 1e-4), 0., 1.); c.r *= 1. - .6 * bl; c.g = mix(c.g, max(c.g, c.b * .28), bl); return c; }
  float figAt(vec2 uv){ vec2 fu = (uv - uFigRect.xy) / (uFigRect.zw - uFigRect.xy); return (fu.x > 0. && fu.x < 1. && fu.y > 0. && fu.y < 1.) ? texture2D(tFig, fu).a : 0.; }
  vec3 potColor(vec2 uv){ vec3 c = blueGuard(pow(texture2D(tCol, uv).rgb, vec3(2.2)));
    vec2 fu = (uv - uFigRect.xy) / (uFigRect.zw - uFigRect.xy);
    if (fu.x > 0. && fu.x < 1. && fu.y > 0. && fu.y < 1.){ vec4 fa = texture2D(tFig, fu); vec3 fc = pow(fa.rgb, vec3(2.2)); fc *= 1. + .5 * smoothstep(.45, .75, dot(fc, vec3(.3, .55, .15))); c = mix(c, fc, fa.a); }
    return c; }
  float inRound(vec2 uv){ vec2 d = (uv - uRound.xy) * vec2(${WM.toFixed(1)}, ${HM.toFixed(2)}); return 1. - smoothstep(uRound.z - .012, uRound.z, length(d)); }
  vec3 sunColor(){ return vec3(1., .8, .5) * (1.3 + 3.5 * uSunHot) * uSunGlow; }
  // what the glass in the frame sends into the room at uv (linear, × uGlow); 0 where a pane is gone or dead
  vec3 glassT(vec2 uv){
    if (lancet(uv) < .5) return vec3(0.);
    int id = cellAt(uv); vec4 ck = texture2D(tCrack, uv);
    if (id == 65534) return mix(vec3(0.), sunColor() * uSun, 1. - ck.b);
    if (id >= 65535) return vec3(0.);
    vec4 st = stateOf(id); if (st.r < .5) return vec3(0.);
    vec3 c = potColor(uv); float cr = ck.r * step(ck.g, uCrackK);
    return c * (1. - ck.b) * st.g * (1. - .6 * cr) * uGlow * mix(1., .82, st.a);
  }
  vec3 glassUV(vec3 p, out vec2 uv, out float s){ s = (${WZ.toFixed(2)} - p.z) / uL.z; vec3 h = p + uL * s; uv = vec2((h.x + ${(WM / 2).toFixed(1)}) / ${WM.toFixed(1)}, (h.y - ${SILL.toFixed(1)}) / ${HM.toFixed(2)}); return h; }
  vec3 glassLight(vec3 p){ vec2 uv; float s; glassUV(p, uv, s); if (s <= 0.) return vec3(0.); return glassT(uv); }
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
  const { Film, THREE, V, col } = await import('../lib3d/cine.js');
  const vert = H > W, FOV = vert ? 46 : 32;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .4, far: 300,
    atmos: { density: .0025, falloff: .02, base: 0, start: 2, color: col('#0e1118', .35), colorUp: col('#0b0d14', .3), max: 300, scatter: 1, anisotropy: .7, phaseMix: .8 },
    bloom: { strength: .09, radius: 1.15, tint: col('#fff0dc') },
    dof: { focus: 30, aperture: 1.0, maxCoc: 16 },
    look: { exposure: 1.3, contrast: 1.07, saturation: 1.06, lift: col('#050608'), shadowTint: col('#c8d2ea'), highTint: col('#fff2dc'), vignette: .36, grain: .04, ca: .3 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera;
  let T = null;

  // ---- the picture, the fall, and the cell raster
  const pic = paintWindow(), F = buildFall(), NC = F.cells.length, NB = F.bodies.length;
  const tex = (c, mip = true) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = mip; t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; return t; };
  // cell id per pixel (rows bottom-up, as uv), crack lines (R mask, G arrival 0..1) and lead (B)
  const cid = new Uint16Array(TW * TH).fill(65535);
  for (const cl of F.cells) { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of cl.poly) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const X0 = Math.max(0, Math.floor((x0 / WM + .5) * TW) - 1), X1 = Math.min(TW - 1, Math.ceil((x1 / WM + .5) * TW) + 1), Y0 = Math.max(0, Math.floor((.5 - y1 / HM) * TH) - 1), Y1 = Math.min(TH - 1, Math.ceil((.5 - y0 / HM) * TH) + 1);
    const pl = cl.poly, n = pl.length;
    for (let Y = Y0; Y <= Y1; Y++) { const py = (.5 - (Y + .5) / TH) * HM; for (let X = X0; X <= X1; X++) { const px = ((X + .5) / TW - .5) * WM; let ok = true;
      for (let i = 0, j = n - 1; i < n; j = i++) if ((pl[i][0] - pl[j][0]) * (py - pl[j][1]) - (pl[i][1] - pl[j][1]) * (px - pl[j][0]) < -1e-9) { ok = false; break; }
      if (ok) cid[(TH - 1 - Y) * TW + X] = cl.i; } } }
  for (let Y = 0; Y < TH; Y++) for (let X = 0; X < TW; X++) { const i = (TH - 1 - Y) * TW + X; if (!insideW(X + .5, Y + .5)) { cid[i] = 65535; continue; }
    if (hyp(X + .5 - SX, Y + .5 - SY) < SR) { cid[i] = 65534; continue; }
    if (cid[i] === 65535) { for (const d of [1, -1, TW, -TW, 2, -2]) { const v = cid[i + d]; if (v !== undefined && v < 65534) { cid[i] = v; break; } } } }
  const crk = new Uint8Array(TW * TH * 4), sunPane = pxToPane(SX, SY);
  for (let Y = 0; Y < TH; Y++) for (let X = 0; X < TW; X++) { const r = TH - 1 - Y, i = r * TW + X, a = cid[i], k = i * 4;
    crk[k + 2] = pic.lead[Y * TW + X];
    if (a >= 65534) continue;
    let other = -1, w = 0;
    for (const [dx, dy, ww] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [2, 0, .45], [-2, 0, .45], [0, 2, .45], [0, -2, .45]]) { const x2 = X + dx, r2 = r + dy; if (x2 < 0 || r2 < 0 || x2 >= TW || r2 >= TH) continue; const b = cid[r2 * TW + x2]; if (b !== a && b < 65534) { if (ww > w) { w = ww; other = b; } } }
    if (other < 0) continue;
    const [px, py] = pxToPane(X + .5, Y + .5), d = hyp(px - F.q[0], py - F.q[1]) / F.Rmax, ray = F.cells[a].sector !== F.cells[other].sector;
    const arr = ray ? .02 + .5 * Math.pow(d, .8) : .1 + .7 * Math.pow(d, .8) + .1 * hashi(Math.min(a, other), Math.max(a, other));
    crk[k] = Math.round(255 * w); crk[k + 1] = Math.round(255 * clamp(arr)); }
  const tCell = new THREE.DataTexture(cid, TW, TH, THREE.RedIntegerFormat, THREE.UnsignedShortType); tCell.internalFormat = 'R16UI'; tCell.minFilter = tCell.magFilter = THREE.NearestFilter; tCell.generateMipmaps = false; tCell.needsUpdate = true;
  const tCrack = new THREE.DataTexture(crk, TW, TH, THREE.RGBAFormat, THREE.UnsignedByteType); tCrack.minFilter = THREE.LinearMipmapLinearFilter; tCrack.magFilter = THREE.LinearFilter; tCrack.generateMipmaps = true; tCrack.anisotropy = 8; tCrack.needsUpdate = true;
  const stD = new Float32Array(64 * 64 * 4), tState = new THREE.DataTexture(stD, 64, 64, THREE.RGBAFormat, THREE.FloatType); tState.minFilter = tState.magFilter = THREE.NearestFilter; tState.needsUpdate = true;
  const figC = document.createElement('canvas'); figC.width = (FR[2] - FR[0]) * FQ; figC.height = (FR[3] - FR[1]) * FQ; const figX = figC.getContext('2d'); drawFigure(figX, 1); let figP = 1;
  const tFig = tex(figC);
  const L = V(-.22, .62, -1).normalize();   // toward the sun, through the window
  const GU = {
    tCol: { value: tex(pic.col) }, tCrack: { value: tCrack }, tFig: { value: tFig }, tCell: { value: tCell }, tState: { value: tState },
    uCrackK: { value: 0 }, uGlow: { value: 3.2 }, uSun: { value: 1 }, uSunGlow: { value: 1 }, uGoldK: { value: 0 }, uSunHot: { value: 0 },
    uFigRect: { value: new THREE.Vector4(FR[0] / TW, 1 - FR[3] / TH, FR[2] / TW, 1 - FR[1] / TH) }, uL: { value: L },
    uRound: { value: new THREE.Vector3(SX / TW, 1 - SY / TH, SR / TW * WM) },
    uT: { value: 0 }, uHaze: { value: 1 }, uDust: { value: 1 }, uRecv: { value: 1 }, uNight: { value: 0 }, uSunLamp: { value: 0 },
    uSunPos: { value: V(sunPane[0], WCY + sunPane[1], WZ + .1) },
  };
  // ---- the glass in the frame: transmitted light, the lead, crack lines, gold seams; holes where a pane has gone
  { const m = new THREE.ShaderMaterial({ uniforms: GU, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `varying vec2 vUv; ${NOISE_GLSL} ${GLASS_GLSL}
        void main(){ if (lancet(vUv) < .5) discard;
          int id = cellAt(vUv); vec4 ck = texture2D(tCrack, vUv); float lead = smoothstep(.3, .75, ck.b);
          vec3 c;
          if (id == 65534){ float pl = dot(potColor(vUv), vec3(.3, .55, .15)); c = sunColor() * uSun * mix(.5 + .7 * pl, 1., uSunHot) * (1. - lead) + vec3(.012, .011, .012) * lead; gl_FragColor = vec4(c, 1.); return; }
          if (id >= 65535) discard;
          vec4 st = stateOf(id); if (st.r < .5) discard;                    // the pane has left the frame
          vec3 pc = potColor(vUv); float fg = 1. - .8 * figAt(vUv), cr = ck.r * step(ck.g, uCrackK) * fg; float dens = texture2D(tCrack, vUv, 3.5).r; float calm = 1. / (1. + 9. * dens * dens);
          vec3 lit = pc * st.g * uGlow * mix(1., .82, st.a);
          float lum = dot(pc, vec3(.3, .55, .15));
          // a dull pane: hardly any light; its own faint colour, the streaks of the pot-metal, a cold sheen, the broken edge's bevel
          float hs = fract(sin(float(id) * 12.9898) * 43758.5453), an = hs * 3.1416; vec2 wm = vUv * vec2(${WM.toFixed(1)}, ${HM.toFixed(2)});
          vec2 su = vec2(cos(an) * wm.x - sin(an) * wm.y, sin(an) * wm.x + cos(an) * wm.y);
          float streak = vn2(su * vec2(2.5, 55.)) * .6 + vn2(su * vec2(1.1, 16.)) * .4, sheen = pow(vn2(wm * .8 + hs * 9.), 2.);
          vec3 dead = mix(vec3(lum), pc, .8) * (.03 + .06 * streak) + vec3(.005, .007, .011) * sheen + vec3(.002, .0025, .004)
                    + vec3(.045, .05, .058) * smoothstep(.15, .6, ck.r) * (1. - st.g);
          c = mix(dead, lit, clamp(st.g * 1.4, 0., 1.)) * (1. - lead) + vec3(.008, .008, .01) * lead;
          // the crack: a hair of bright refracted light while the pane is lit, a dark line once it is dead; gold once mended
          c = mix(c, mix(vec3(.004), vec3(1., .95, .85) * uGlow * .45 * calm, st.g), cr * (1. - st.b));
          c = mix(c, vec3(1., .44, .06) * (.3 + .55 * st.g) * uGoldK * (.45 + .55 * calm), max(smoothstep(.08, .45, ck.r), smoothstep(.05, .3, texture2D(tCrack, vUv, 1.4).r) * .5) * st.b * fg);
          gl_FragColor = vec4(c, 1.); }` });
    const g = new THREE.Mesh(new THREE.PlaneGeometry(WM, HM), m); g.position.set(0, WCY, WZ); S.add(g); }
  // the night behind the window: holes are dark
  { const bd = new THREE.Mesh(new THREE.PlaneGeometry(30, 40), new THREE.MeshBasicMaterial({ color: col('#010204') })); bd.position.set(0, 14, WZ - 3); S.add(bd); }

  // ---- the shards: one geometry for every body the tape ever holds; pose + light per body from a float texture
  const poseD = new Float32Array(4 * NB * 4), tPose = new THREE.DataTexture(poseD, 4, NB, THREE.RGBAFormat, THREE.FloatType); tPose.minFilter = tPose.magFilter = THREE.NearestFilter; tPose.needsUpdate = true;
  { const pos = [], nrm = [], uvs = [], idx = [], edg = [], h = GLASS_TH / 2;
    for (const b of F.bodies) { if (b.gen < 1) continue; const n = b.loc.length, cx = b.c[0], cy = b.c[1];
      const put = (x, y, z, nx, ny, nz, e) => { pos.push(x, y, z); nrm.push(nx, ny, nz); uvs.push((x + cx) / WM + .5, (y + cy) / HM + .5); idx.push(b.id); edg.push(e); };
      for (let i = 0; i < n; i++) { const a = b.loc[i], c = b.loc[(i + 1) % n], ex = c[0] - a[0], ey = c[1] - a[1], len = Math.hypot(ex, ey) || 1e-9, nx = ey / len, ny = -ex / len;
        put(0, 0, h, 0, 0, 1, 0); put(a[0], a[1], h, 0, 0, 1, 0); put(c[0], c[1], h, 0, 0, 1, 0);
        put(0, 0, -h, 0, 0, -1, 0); put(c[0], c[1], -h, 0, 0, -1, 0); put(a[0], a[1], -h, 0, 0, -1, 0);
        put(a[0], a[1], -h, nx, ny, 0, 1); put(c[0], c[1], -h, nx, ny, 0, 1); put(c[0], c[1], h, nx, ny, 0, 1);
        put(a[0], a[1], -h, nx, ny, 0, 1); put(c[0], c[1], h, nx, ny, 0, 1); put(a[0], a[1], h, nx, ny, 0, 1); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setAttribute('aBody', new THREE.Float32BufferAttribute(idx, 1)); g.setAttribute('aEdge', new THREE.Float32BufferAttribute(edg, 1));
    const m = new THREE.ShaderMaterial({ uniforms: { ...GU, tPose: { value: tPose } }, side: THREE.DoubleSide,
      vertexShader: `attribute float aBody, aEdge; uniform highp sampler2D tPose; varying vec2 vUv; varying vec3 vN, vWP; varying float vLit, vEdge, vGold;
        vec3 qrot(vec4 q, vec3 v){ return v + 2. * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
        void main(){ int i = int(aBody + .5); vec4 a = texelFetch(tPose, ivec2(0, i), 0), q = texelFetch(tPose, ivec2(1, i), 0), s = texelFetch(tPose, ivec2(2, i), 0);
          if (a.w < .5){ gl_Position = vec4(2., 2., 2., 1.); return; }
          vWP = a.xyz + qrot(q, position); vN = qrot(q, normal); vUv = uv; vLit = s.x; vGold = s.y; vEdge = aEdge;
          gl_Position = projectionMatrix * viewMatrix * vec4(vWP, 1.); }`,
      fragmentShader: `varying vec2 vUv; varying vec3 vN, vWP; varying float vLit, vEdge, vGold; ${NOISE_GLSL} ${GLASS_GLSL}
        void main(){ if (inRound(vUv) > .5) discard;
          vec4 ck = texture2D(tCrack, vUv); float lead = smoothstep(.3, .75, ck.b);
          vec3 pc = potColor(vUv), N = normalize(vN), Vd = normalize(cameraPosition - vWP); if (dot(N, Vd) < 0.) N = -N;
          // dead glass lying in the dark: a little of its own colour, glints of the night through the holes and of the sun pane
          vec3 Ls = normalize(uSunPos - vWP); float ds = length(uSunPos - vWP);
          float fr = .04 + .96 * pow(1. - max(dot(N, Vd), 0.), 5.);
          float spN = pow(max(dot(N, normalize(uL + Vd)), 0.), 90.) * uNight, spS = pow(max(dot(N, normalize(Ls + Vd)), 0.), 140.) * uSun * (1. + 4. * uSunHot) * 60. / (ds * ds);
          vec2 wm = vUv * vec2(${WM.toFixed(1)}, ${HM.toFixed(2)}); float streak = vn2(wm * vec2(3., 40.)) * .6 + vn2(wm * vec2(1.3, 12.)) * .4;
          vec3 body = pc * (.014 + .03 * streak + .02 * max(N.y, 0.)) + vec3(.002, .0025, .004);
          vec3 c = body + (vec3(.55, .65, .9) * spN * .6 + vec3(1., .78, .5) * spS) * (.25 + fr) * (1. - lead);
          c += pc * vLit * uGlow * (vEdge > .5 ? .5 : 1.) * (1. - lead);                       // still glowing as it leaves the frame
          if (vEdge > .5) c = c * .6 + pc * .01;
          c = mix(c, vec3(.006), lead * (1. - vLit));
          gl_FragColor = vec4(c, 1.); }` });
    const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; S.add(mesh); }

  // ---- stone (floor, walls, piers): albedo + the glass light falling on it (pier shadows tested analytically)
  const PIERS = [];
  const stoneM = (base, key, floor = false) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: floor ? .62 : .92 });
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, GU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform float uRecv; uniform vec3 uPierA[12], uPierB[12];\n${NOISE_GLSL}\n${GLASS_GLSL}
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
            if (nl > 0. && vWP.z > ${WZ.toFixed(2)} + .3){ vec2 uv; float s; glassUV(vWP, uv, s);
              if (s > 0. && lancet(uv) > .5){ bool sh = false; for (int i = 0; i < 12; i++){ if (hitBox(vWP + N * .02, uL, s, uPierA[i], uPierB[i])) { sh = true; break; } }
                if (!sh) gl = glassT(uv); } }
            // the relit sun pane: a small warm lamp on the stone round it while the rest of the glass is dark
            vec3 dl = uSunPos - vWP; float d2 = dot(dl, dl); vec3 sl = vec3(1., .75, .45) * max(dot(N, normalize(dl)), 0.) * 6. / (d2 + 6.) * uSunLamp;
            totalEmissiveRadiance += diffuseColor.rgb * (gl * nl * ${floor ? "1.1" : ".6"} * uRecv + sl); }`);
      sh.uniforms.uPierA = { value: PIERS.map(p => p[0]) }; sh.uniforms.uPierB = { value: PIERS.map(p => p[1]) }; };
    m.customProgramCacheKey = () => 'gs-stone-' + key; return m; };
  const M = { floor: stoneM('#86806f', 'f', true), wall: stoneM('#6a645a', 'w'), pier: stoneM('#766f63', 'p'), dark: new THREE.MeshStandardMaterial({ color: '#1e1b18', roughness: 1 }), iron: new THREE.MeshStandardMaterial({ color: '#0c0b0a', roughness: .6, metalness: .3 }) };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 90), M.floor); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 15); S.add(floor);

  const YSP = SILL + HM - 5.196;
  const lancetPts = (o, n = 28) => { const pts = [], R0 = 6 + o, th = Math.acos(3 / R0);
    pts.push([-3 - o, SILL - o], [3 + o, SILL - o], [3 + o, YSP]);
    for (let i = 1; i <= n; i++) { const a = th * i / n; pts.push([-3 + Math.cos(a) * R0, YSP + Math.sin(a) * R0]); }
    for (let i = n - 1; i >= 0; i--) { const a = Math.PI - th * i / n; pts.push([3 + Math.cos(a) * R0, YSP + Math.sin(a) * R0]); }
    return pts; };
  const toPath = (pts, P) => { pts.forEach((p, i) => i ? P.lineTo(p[0], p[1]) : P.moveTo(p[0], p[1])); P.closePath(); return P; };
  const ring = (oOut, oIn, z0, z1, mat) => { const s = toPath(lancetPts(oOut), new THREE.Shape()); s.holes.push(toPath(lancetPts(oIn).reverse(), new THREE.Path()));
    const g = new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false, curveSegments: 4 }); const m = new THREE.Mesh(g, mat); m.position.z = z0; S.add(m); return m; };
  // the end wall (its face at the ledge front) with the window hole, and stepped orders of the jamb back to the glass
  { const s = new THREE.Shape(); s.moveTo(-14, 0); s.lineTo(14, 0); s.lineTo(14, 34); s.lineTo(-14, 34); s.closePath(); s.holes.push(toPath(lancetPts(1.2).reverse(), new THREE.Path()));
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: false, curveSegments: 4 }); const m = new THREE.Mesh(g, M.wall); m.position.z = LEDGE - 1.2; S.add(m); }
  ring(1.2, .8, LEDGE - .7, LEDGE, M.wall); ring(.8, .4, LEDGE - 1.1, LEDGE - .35, M.pier); ring(.4, -.02, WZ - .5, LEDGE - .7, M.wall);
  { const lw = new THREE.Mesh(new THREE.BoxGeometry(8.6, SILL - 1.2, 1.1), M.wall); lw.position.set(0, (SILL - 1.2) / 2, LEDGE - .55); S.add(lw); }   // the wall under the sill is solid
  for (const sx of [-1, 1]) for (const [o, z] of [[1.0, LEDGE - .25], [.6, LEDGE - .6], [.2, LEDGE - .95]]) { const h = YSP - (SILL - o); const c = new THREE.Mesh(new THREE.CylinderGeometry(.11, .12, h, 12), M.pier); c.position.set(sx * (3 + o), SILL - o + h / 2, z); S.add(c);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(.34, .26, .34), M.pier); cap.position.set(sx * (3 + o), YSP + .1, z); S.add(cap); }
  for (const by of [1000, 1400, 1800, 2200, 2560]) { const y = SILL + (1 - by / TH) * HM, b = new THREE.Mesh(new THREE.BoxGeometry(WM + .3, .07, .07), M.iron); b.position.set(0, y, WZ + .07); S.add(b); }
  { const sill = new THREE.Mesh(new THREE.BoxGeometry(7.2, .3, LEDGE - WZ + .1), M.pier); sill.position.set(0, SILL - .07 - .15, (LEDGE + WZ) / 2 - .05); S.add(sill); }
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
    for (let k = 0; k <= n; k++) { const a = Math.PI - th * k / n; hole.lineTo(span / 2 + Math.cos(a) * r, ys + Math.sin(a) * r * .55); }
    for (let k = n; k >= 0; k--) { const a = th * k / n; hole.lineTo(-span / 2 + Math.cos(a) * r, ys + Math.sin(a) * r * .55); }
    hole.lineTo(span / 2, ys - .01); hole.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: false }); const m = new THREE.Mesh(g, M.wall); m.rotation.y = Math.PI / 2; m.position.set(sx * 5.8 - .55, 0, zc); S.add(m); }
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(.6, 14, 70), M.dark); w.position.set(sx * 11, 7, 12); S.add(w); }
  { for (const z of pierZ) { const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24, a = u < .5 ? u * 2 : (1 - u) * 2, x = (u - .5) * 11.6, y = 12.3 + 7.8 * Math.sin(a * Math.PI / 2) ** .8; pts.push(V(x, y, z)); }
      S.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .2, 8, false), M.pier)); }
    const web = new THREE.Mesh(new THREE.PlaneGeometry(14, 70), M.dark); web.rotation.x = Math.PI / 2; web.position.set(0, 20.4, 12); S.add(web); }

  // ---- fill light: a dim cold room; a warm glow off the window onto the jambs (scaled by how much glass is alive)
  const hemi = new THREE.HemisphereLight(col('#4c5670'), col('#221a14'), .3); S.add(hemi);
  const winL = new THREE.PointLight(col('#ffd8a0'), 60, 40, 2); winL.position.set(0, 11, WZ + 3); S.add(winL);
  const halo = film.lamp(V(0, 12.5, WZ + 1.6), '#ffe0b0', { power: 800, size: 5, fog: 1 });
  const sunLamp = film.lamp(GU.uSunPos.value.clone().add(V(0, 0, -.3)), '#ffd9a0', { power: 0, size: .7, fog: 1 });

  // ---- B3: a depth pre-pass (everything but the haze and the dust), so the haze stops at what stands in the shaft
  const depthRT = new THREE.WebGLRenderTarget(film.w, film.h, { depthBuffer: true }); depthRT.depthTexture = new THREE.DepthTexture(film.w, film.h); depthRT.depthTexture.type = THREE.UnsignedIntType;
  Object.assign(GU, { tDepth: { value: depthRT.depthTexture }, uRes: { value: new THREE.Vector2(film.w, film.h) }, uNear: { value: cam.near }, uFar: { value: cam.far }, uFwd: { value: V(0, 0, -1) } });
  // ---- the haze in the shafts, raymarched toward the glass for every sample
  const BX = [V(-4.9, .02, WZ + .5), V(4.9, 21, 30)];
  { const m = new THREE.ShaderMaterial({ uniforms: GU, side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec3 vWP; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vWP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `varying vec3 vWP; uniform float uT, uHaze, uNear, uFar; uniform sampler2D tDepth; uniform vec2 uRes; uniform vec3 uFwd; ${NOISE_GLSL} ${GLASS_GLSL}
        void main(){ vec3 ro = cameraPosition, rd = normalize(vWP - ro); float tf = length(vWP - ro);
          float dz = texture2D(tDepth, gl_FragCoord.xy / uRes).x; if (dz < 1.){ float vz = uNear * uFar / ((uFar - uNear) * dz - uFar); tf = min(tf, -vz / max(dot(rd, uFwd), 1e-3)); }   // B3: stop at what is there
          vec3 a = vec3(${BX[0].x}, ${BX[0].y}, ${BX[0].z}), b = vec3(${BX[1].x}, ${BX[1].y}, ${BX[1].z});
          vec3 inv = 1. / rd, t0 = (a - ro) * inv, t1 = (b - ro) * inv; float tn = max(max(min(t0.x, t1.x), min(t0.y, t1.y)), min(t0.z, t1.z)); tn = max(tn, 0.);
          float len = tf - tn; if (len <= 0.) discard;
          const int NS = 64; float dt = len / float(NS), j = h2(gl_FragCoord.xy);
          float cosT = dot(rd, uL), g = .55, ph = (1. - g * g) / pow(1. + g * g - 2. * g * cosT, 1.5) * .08 + .02;
          vec3 acc = vec3(0.);
          for (int i = 0; i < NS; i++){ vec3 p = ro + rd * (tn + (float(i) + j) * dt);
            float d = .55 + .9 * gn(p * vec3(.35, .22, .35) + vec3(0., -uT * .05, uT * .03)) * gn(p * .9 + 3.1);
            d *= smoothstep(0., 3., p.y) * .6 + .4;
            d *= mix(.3, 1., smoothstep(.4, 4.5, p.z - ${WZ.toFixed(2)})) * smoothstep(.6, 4., length(p - ro));   // B3: no veil on the glass or at the lens
            acc += glassLight(p) * d * dt; }
          gl_FragColor = vec4(acc * ph * .095 * uHaze, 1.); }` });
    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m); box.scale.copy(BX[1].clone().sub(BX[0])); box.position.copy(BX[0].clone().add(BX[1]).multiplyScalar(.5)); box.frustumCulled = false; box.renderOrder = 5; box.layers.set(3); S.add(box); }
  // ---- dust: motes that glint only where a shaft passes (coloured by it)
  { const n = 900, Rr = rngOf(57), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (Rr() - .5) * 9; p[i * 3 + 1] = .3 + Rr() * 15; p[i * 3 + 2] = WZ + 1.4 + Rr() * 34; sd[i] = Rr(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: { ...GU, uPx: { value: H / 1920 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx, uDust; varying vec3 vC; ${GLASS_GLSL}
        void main(){ vec3 q = position; q.y += mod(uT * (.04 + .05 * aS) + aS * 15., 15.) - 7.5 * aS; q.x += sin(uT * .3 + aS * 30.) * .35; q.z += cos(uT * .21 + aS * 17.) * .35;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (2. + 4. * aS) * 10. / d, 1., 9.); vC = glassLight(q) * .5 * clamp(1.4 - d / 30., 0., 1.) * (.5 + .5 * aS) * uDust; }`,
      fragmentShader: `varying vec3 vC; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 14.); gl_FragColor = vec4(vC * a, 1.); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 6; pts.layers.set(3); S.add(pts); }

  // ---------------------------------------------------------------- the clocks
  // block 1: film time → tape time (slow motion right after the break, back to real time over ~1.2 s)
  const SLOW = .3, sigTab = []; { let s = 0; for (let k = 0; k <= 240 * 16; k++) { sigTab.push(s); const u = k / 240, rt = u < .25 ? 1 : u < 1.7 ? lerp(1, SLOW, ss(.25, .45, u)) : lerp(SLOW, 1, ss(1.7, 2.9, u)); s += rt / 240; } }
  const sigma = t => { const u = t - T.brk; if (u <= 0) return 0; const k = u * 240, i = Math.min(sigTab.length - 2, Math.floor(k)); return lerp(sigTab[i], sigTab[i + 1], k - i); };
  // block 2: each cell's own rewind (from the sun pane outward); film time when it is home again
  let dSunMax = 0; for (const c of F.cells) dSunMax = Math.max(dSunMax, c.dSun);
  const RR = rngOf(4242), figCells = new Set();
  for (let Y = FR[1]; Y < FR[3]; Y += 6) for (let X = FR[0]; X < FR[2]; X += 6) { const v = cid[(TH - 1 - Y) * TW + X]; if (v < 65534) figCells.add(v); }
  let sunCellsRel = 1e9; for (const c of F.cells) if (c.dSun < 1.6 && !c.stay) sunCellsRel = Math.min(sunCellsRel, c.rel);
  const plan = B => { T = beats(B); const [a, b] = T.rew;
    for (const c of F.cells) { c.S = a + (b - a) * Math.pow(c.dSun / dSunMax, .85) + .7 * (RR() - .5); if (figCells.has(c.i)) c.S = Math.min(c.S, b - 2.6);
      c.home = c.stay ? c.S + .4 : c.S + (c.settle - c.rel) / T.rate; }
    let figHome = 0; for (const i of figCells) figHome = Math.max(figHome, F.cells[i].home);
    const tb = clamp(figHome + .3, B.N47 + 1.6, B.N47 + 3.4); T.back = [tb, tb + 2.6]; T.figHome = figHome; };
  const tau = (c, t) => clamp(c.settle - (t - c.S) * T.rate, c.rel, c.settle);

  // ---------------------------------------------------------------- the camera: one Hermite spline per block (C1 in time)
  const sunW = GU.uSunPos.value;
  // B3: the man is ~2.85 m tall in the glass; at ≤ 14 m from the window he is ≥ 22 % of the portrait frame (fov 46°)
  const K1 = [   // [t, pos, look] — a push in to the man as he turns away and the crack opens at his feet; back and wide as the panes fall; a tilt up to the empty frame and a gentle push into the sun pane
    [110.0, [.5, 3.4, 15.5], [0, 9.6, WZ]],
    [118.0, [.5, 3.8, 11.5], [.1, 9.3, WZ]],
    [125.0, [.8, 5.4, 1.0], [.8, 8.9, WZ]],
    [129.4, [1.1, 6.5, -6.4], [1.25, 8.5, WZ]],
    [134.4, [1.1, 6.6, -7.2], [1.2, 8.4, WZ]],
    [138.8, [.5, 4.4, 6.6], [.3, 9.0, WZ]],
    [140.8, [.3, 4.6, 8.4], [.1, 12.4, WZ]],
    [142.8, [.15, 6.0, 4.8], [sunW.x, sunW.y - .5, WZ]],
  ];
  const K2 = [   // from close under the sun pane, down to the man as he turns back to it, then back to the whole mended window
    [215.7, [.05, 14.6, -11.2], [sunW.x, sunW.y - .4, WZ]],
    [221.5, [.2, 12.8, -6.4], [.15, 14.4, WZ]],
    [226.6, [.9, 7.8, -5.0], [1.2, 9.5, WZ]],
    [229.6, [1.1, 6.6, -6.6], [1.25, 8.6, WZ]],
    [233.2, [1.0, 6.5, -5.9], [1.2, 8.7, WZ]],
    [237.6, [.5, 4.2, 6.2], [.1, 9.9, WZ]],
  ];
  const herm = (K, t, idx) => {
    const n = K.length; t = clamp(t, K[0][0], K[n - 1][0]); let i = 0; while (i < n - 2 && t > K[i + 1][0]) i++;
    const [t0, a0, b0] = K[i], [t1, a1, b1] = K[i + 1], P0 = idx ? b0 : a0, P1 = idx ? b1 : a1, h = t1 - t0, u = (t - t0) / h;
    const tan = j => { if (j === 0 || j === n - 1) return [0, 0, 0];
      const pa = K[j - 1][idx ? 2 : 1], pb = K[j + 1][idx ? 2 : 1]; return pa.map((v, q) => (pb[q] - v) / (K[j + 1][0] - K[j - 1][0])); };
    const m0 = tan(i), m1 = tan(i + 1), u2 = u * u, u3 = u2 * u, h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    return V(...P0.map((v, q) => h00 * v + h10 * h * m0[q] + h01 * P1[q] + h11 * h * m1[q])); };

  // ---------------------------------------------------------------- one frame
  const pose = new Float64Array(7);
  function frame3D(t) {
    const Lk = film.look, D = film.dofCfg, blk2 = t > 180, K = blk2 ? K2 : K1;
    const pos = herm(K, t, 0), look = herm(K, t, 1); cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.fov = FOV; cam.updateProjectionMatrix();
    GU.uT.value = t;
    let aliveA = 0, totA = 0, figK, crackK, glow, sun, sunHot = 0, night;
    if (!blk2) {
      const sg = sigma(t), broke = t >= T.brk;
      crackK = broke ? .07 + .93 * Math.pow(clamp(sg / .26), .7) : .07 * ss(T.crack0[0], T.crack0[1], t);
      figK = ss(T.fig[0], T.fig[1], t); glow = lerp(3.0, 3.4, ss(T.glow[0], T.glow[1], t));   // B3: the window is already alight under the chapter title
      for (const c of F.cells) { const o = c.i * 4, gone = broke && !c.stay && sg >= c.rel;
        stD[o] = gone ? 0 : 1; stD[o + 1] = !broke ? 1 : c.stay ? 1 - ss(c.rel, c.rel + .5, sg) : (gone ? 0 : 1); stD[o + 2] = 0; stD[o + 3] = broke && crackK > .3 ? 1 : 0;
        totA += c.area; aliveA += c.area * stD[o] * stD[o + 1]; }
      for (const b of F.bodies) { const o = b.id * 16, c = F.cells[b.root];
        const vis = broke && !c.stay && sg >= c.rel && poseOf(F, b.id, sg, pose);
        poseD[o + 3] = vis ? 1 : 0; if (!vis) continue;
        poseD[o] = pose[0]; poseD[o + 1] = pose[1]; poseD[o + 2] = pose[2]; poseD[o + 4] = pose[3]; poseD[o + 5] = pose[4]; poseD[o + 6] = pose[5]; poseD[o + 7] = pose[6];
        poseD[o + 8] = 1 - ss(c.rel + .15, c.rel + 1.5, sg); poseD[o + 9] = 0; }
      const sunDie = broke ? ss(sunCellsRel + .1, sunCellsRel + .7, sg) : 0;
      sun = (1 - sunDie) + ss(T.sunOn[0], T.sunOn[1], t) * sunDie; sunHot = ss(T.sunOn[1] - .2, T.white[1], t);
      night = broke ? ss(0, 2.5, sg) : 0;
    } else {
      crackK = 1; glow = 3.4; sun = 1; night = 1 - ss(T.rew[0] + 2, T.r1 - 4, t);
      figK = T.back ? 1 - ss(T.back[0], T.back[1], t) : 1;
      for (const c of F.cells) { const o = c.i * 4, home = t >= c.home, k = c.stay ? ss(c.home, c.home + .8, t) : .35 + .65 * ss(c.home, c.home + .8, t);
        stD[o] = c.stay || home ? 1 : 0; stD[o + 1] = k; stD[o + 2] = ss(c.home - .1, c.home + .5, t); stD[o + 3] = 1 - k;
        totA += c.area; aliveA += c.area * stD[o] * k; }
      for (const b of F.bodies) { const o = b.id * 16, c = F.cells[b.root];
        let vis = false; if (!c.stay && t < c.home) { const tt = tau(c, t); vis = tt > c.rel + 1e-4 && poseOf(F, b.id, tt, pose); if (vis) poseD[o + 8] = .35 * ss(c.rel + .6, c.rel, tt); }
        poseD[o + 3] = vis ? 1 : 0; if (!vis) continue;
        poseD[o] = pose[0]; poseD[o + 1] = pose[1]; poseD[o + 2] = pose[2]; poseD[o + 4] = pose[3]; poseD[o + 5] = pose[4]; poseD[o + 6] = pose[5]; poseD[o + 7] = pose[6]; }
    }
    tState.needsUpdate = true; tPose.needsUpdate = true;
    if (Math.abs(figK - figP) > 1e-4) { drawFigure(figX, figK); figP = figK; tFig.needsUpdate = true; }
    const alive = aliveA / totA;
    GU.uCrackK.value = crackK; GU.uGlow.value = glow; GU.uSun.value = sun; GU.uSunHot.value = sunHot; GU.uGoldK.value = blk2 ? 1.6 : 0; GU.uNight.value = night * 1.2;
    GU.uSunGlow.value = 1 + 5 * sunHot; GU.uSunLamp.value = (1 - alive) * sun * (.25 + 4 * sunHot);
    sunLamp.power = (blk2 ? 5 * (1 - alive) + 2 : (1 - alive) * sun * (30 + 400 * sunHot));
    winL.intensity = 26 * glow / 3.4 * (.04 + .96 * alive);
    halo.power = 120 * glow / 3.4 * (.03 + .97 * alive);
    hemi.intensity = lerp(.8, .3, alive); hemi.color.copy(col('#46557a').lerp(col('#4c5670'), alive));
    Lk.saturation = lerp(.8, 1.04, alive); Lk.exposure = 1.42 + .35 * (1 - alive);
    if (!blk2) Lk.exposure *= lerp(1, 3.5, ss(T.white[0], T.white[1] + .2, t));
    else Lk.exposure *= (1.12 - .04 * ss(T.r1 - 6, T.r1, t)) * (1 + .2 * (1 - ss(T.r0 + 3.5, T.r0 + 7.5, t)));   // B3: a little more while the frame is still mostly empty
    Lk.exposure *= lerp(.8, 1, ss(12, 24, pos.z - WZ));   // B3: close on the glass, a little less exposure, so the pot-metal stays deep (not pastel)
    D.focus = pos.distanceTo(V(look.x, look.y, WZ)); D.aperture = 1.0;
    cam.updateMatrixWorld(); cam.getWorldDirection(GU.uFwd.value); film._fogMaterials();
    { const R = film.renderer; cam.layers.disable(3); R.setRenderTarget(depthRT); R.setClearColor(0x000000, 0); R.clear(); R.render(S, cam); R.setRenderTarget(null); cam.layers.enable(3); }
    film.render(t);
    return alive;
  }

  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const gS = mkC(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkC(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) {   // screen-space scattering: bright pixels zoom-blurred from the window
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
    if (!T) plan(B);
    const alive = frame3D(t), blk2 = t > 180;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    tmp.set(0, SILL + HM * .62, WZ).project(cam);
    if (tmp.z < 1) godRays(ctx, (tmp.x + 1) / 2 * W, (1 - tmp.y) / 2 * H, .14 * alive);
    if (!blk2) { const wk = ss(T.white[0], T.white[1], t); if (wk > 0) {   // into the sun pane's light: white opens from it
        tmp.copy(sunW).project(cam); const cx = (tmp.x + 1) / 2 * W, cy = (1 - tmp.y) / 2 * H, r = lerp(.05, 1.6, wk) * H;
        ctx.save(); ctx.globalCompositeOperation = 'screen'; const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gr.addColorStop(0, `rgba(255,246,226,${Math.min(1, wk * 1.6)})`); gr.addColorStop(.5, `rgba(255,240,214,${wk * .8})`); gr.addColorStop(1, `rgba(255,236,206,${wk * wk})`);
        ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.fillStyle = `rgba(255,244,222,${ss(.55, 1, wk)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  }
  const whiteK = t => T ? ss(T.white[0] - .3, T.white[0] + .4, t) * (1 - ss(T.white[1] + .1, T.white[1] + .7, t)) : 0;   // for the page: no caption band over the white
  return { film, draw, beats: () => T, GU, F, pic, whiteK };
}
