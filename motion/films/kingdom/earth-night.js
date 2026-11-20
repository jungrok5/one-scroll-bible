// earth-night.js — 「kingdom」 6부 「땅 끝까지」 (Acts 1:8, 681.8–700.3): the night earth the camera rises to from the Mount of Olives
// (olivet3d.js builds the hill, the city and the 3D terrain patch; this file holds the geography they share and the globe).
// Sources (copied and adapted, never edited at the source):
//   * the first film's 「교회의 시작」 night earth — motion/pilot/church.html: LAND outlines, POP centres, popW(), the city points that
//     light by their distance from Jerusalem, the thin blue rim and the first light on the limb. Refined here round the eastern
//     Mediterranean so its coast meets the 3D terrain (Levant, Sinai, Cyprus, Crete, Sicily, Sardinia, Corsica added).
//   * motion-skills lineage-glow (lib/glow.js PALETTE, lineage.js fan/branch): gold lines that leave one lit node and branch, a
//     white-hot head running ahead, light flowing along them, warm-on-black, overlaps brighten. Re-drawn as a screen-space line
//     shader on the 3D globe (lineMesh) so the lines keep their width from 20 m to 25,000 km.
//   * motion-skills map-dive (night: warm road glow + lamps + bloom) and cinematic-3d (lib3d/cine.js pipeline: bloom, AgX, grain).
// World units are METRES: x = north, y = up, z = east at the origin (the Mount of Olives); the earth's centre is (0, −R_E, 0).
// So the hill keeps full float precision and the globe is simply very far below it; nothing here depends on time except the
// uniforms set by olivet3d.js each frame (uF = how far the light has gone along the roads, uT, uK …).
import { THREE, V, rng } from '../lib3d/cine.js';

export const R_E = 6371000, SEA = -30;          // the globe's surface sits 30 m under sea level; the terrain patch meets it from above
export const LL0 = [35.243, 31.778];            // the Mount of Olives (lon, lat)
const D2R = Math.PI / 180;
const ecef = (lon, lat) => { const a = lat * D2R, b = lon * D2R; return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const U0 = ecef(...LL0), E0 = [-Math.sin(LL0[0] * D2R), Math.cos(LL0[0] * D2R), 0];
const N0 = [-Math.sin(LL0[1] * D2R) * Math.cos(LL0[0] * D2R), -Math.sin(LL0[1] * D2R) * Math.sin(LL0[0] * D2R), Math.cos(LL0[1] * D2R)];
export function llToWorld(lon, lat, h = 0, out = V()) { const p = ecef(lon, lat), r = R_E + h; return out.set(dot(p, N0) * r, dot(p, U0) * r - R_E, dot(p, E0) * r); }
// azimuthal-equidistant plane round the origin (x north, z east, metres) — the 3D terrain is laid out in it
export function llToLocal(lon, lat) { const p = ecef(lon, lat), th = Math.acos(Math.min(1, Math.max(-1, dot(p, U0)))), n = dot(p, N0), e = dot(p, E0), s = Math.hypot(n, e) || 1; return [th * R_E * n / s, th * R_E * e / s]; }
export function localToWorld(x, z, h = 0, out = V()) { const r = Math.hypot(x, z); if (r < 1e-3) return out.set(x, h, z); const th = r / R_E, rr = R_E + h, s = Math.sin(th) * rr / r; return out.set(x * s, Math.cos(th) * rr - R_E, z * s); }
export const gcDist = (lon, lat) => Math.acos(Math.min(1, dot(ecef(lon, lat), U0))) * R_E;

// ---------------------------------------------------------------- land (church.html LAND, + the eastern Mediterranean refined)
const LAND = [
  [[-17, 21], [-16, 12], [-8, 4], [5, 4], [9, 4], [10, -2], [13, -12], [12, -18], [15, -27], [18, -34], [20, -35], [27, -34], [33, -27], [35, -24], [40, -15], [40, -10], [39, -4], [42, 0], [51, 11], [44, 11], [43, 13], [38, 18], [34, 27], [32, 31], [25, 32], [20, 31], [10, 37], [-1, 36], [-6, 36], [-10, 30], [-13, 27]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [0, 49], [3, 51], [8, 54], [8, 57], [10, 59], [5, 62], [14, 68], [22, 70], [30, 70], [42, 67], [45, 68], [60, 69], [60, 55], [50, 47], [40, 47], [37, 45], [28, 41], [26, 40], [23, 36], [20, 40], [14, 41], [16, 38], [12, 44], [8, 44], [3, 43], [-1, 37]],
  [[26, 40], [36, 36], [36, 32], [35, 28], [43, 13], [45, 12], [52, 16], [58, 22], [56, 26], [50, 30], [48, 30], [57, 26], [62, 25], [67, 24], [73, 21], [77, 8], [80, 15], [87, 21], [92, 22], [94, 17], [98, 16], [98, 8], [101, 3], [104, 1], [103, 10], [106, 11], [109, 12], [108, 21], [117, 23], [121, 28], [122, 31], [119, 35], [122, 37], [121, 40], [125, 40], [126, 35], [129, 35], [129, 38], [128, 40], [132, 43], [141, 47], [141, 52], [137, 54], [143, 59], [155, 59], [163, 61], [160, 55], [163, 56], [170, 60], [178, 63], [180, 67], [180, 69], [160, 70], [140, 72], [113, 74], [104, 78], [90, 76], [75, 73], [68, 70], [60, 69], [60, 55], [50, 47], [40, 47], [42, 42], [36, 41], [28, 41]],
  [[130, 31], [132, 34], [135, 34], [140, 35], [141, 38], [142, 40], [140, 41], [141, 45], [144, 44], [143, 42], [141, 40], [141, 37], [140, 35], [136, 33]],
  [[-5, 50], [1, 51], [2, 53], [-1, 55], [-2, 58], [-5, 58], [-6, 56], [-3, 54], [-5, 52]],
  [[95, 5], [98, 4], [106, -6], [104, -6], [96, 2]], [[109, 1], [111, 3], [117, 7], [119, 5], [116, -3], [111, -3]], [[105, -6], [114, -8], [106, -7]], [[131, -1], [141, -3], [150, -10], [141, -9], [136, -5]],
  [[114, -22], [122, -17], [130, -12], [136, -12], [137, -16], [142, -11], [146, -19], [153, -25], [153, -32], [150, -37], [144, -38], [140, -38], [135, -35], [131, -31], [124, -34], [115, -34]],
  [[-168, 66], [-162, 70], [-140, 70], [-120, 69], [-95, 72], [-80, 70], [-62, 66], [-55, 52], [-66, 45], [-70, 42], [-76, 38], [-76, 35], [-81, 31], [-80, 25], [-83, 29], [-90, 30], [-97, 27], [-97, 21], [-90, 21], [-87, 21], [-88, 16], [-83, 10], [-79, 9], [-78, 8], [-85, 11], [-92, 15], [-105, 20], [-110, 24], [-112, 29], [-117, 32], [-121, 35], [-124, 40], [-124, 48], [-131, 55], [-140, 60], [-150, 61], [-158, 58], [-165, 62]],
  [[-55, 60], [-43, 60], [-22, 70], [-20, 80], [-40, 83], [-62, 82], [-72, 78], [-55, 70]],
  [[-80, 9], [-72, 12], [-62, 11], [-52, 5], [-50, 0], [-35, -5], [-39, -15], [-41, -22], [-48, -26], [-58, -34], [-63, -40], [-66, -46], [-69, -52], [-74, -52], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-78, 3]],
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]], [[120, 18], [122, 18], [126, 7], [124, 7], [120, 12]], [[-80, 22], [-74, 20], [-78, 23]],
  // refined (this film): the Levant coast from Port Said to Iskenderun, Asia Minor's south and west coasts, Sinai between the gulfs
  [[32.3, 31.27], [33.0, 31.1], [33.8, 31.13], [34.2, 31.32], [34.45, 31.5], [34.55, 31.67], [34.68, 31.85], [34.75, 32.05], [34.83, 32.3], [34.89, 32.5], [34.93, 32.7], [34.97, 32.83], [35.07, 32.92], [35.1, 33.1], [35.2, 33.27], [35.37, 33.56], [35.5, 33.9], [35.64, 34.2], [35.83, 34.43], [35.9, 34.9], [35.78, 35.52], [35.9, 35.9], [36.1, 36.6], [35.8, 36.75], [35.4, 36.6], [34.6, 36.8], [34, 36.3], [33.4, 36.15], [32.8, 36.05], [32.2, 36.5], [31.5, 36.75], [30.7, 36.88], [30.5, 36.4], [29.6, 36.2], [29.1, 36.6], [28.3, 36.8], [27.4, 37.0], [27.2, 37.9], [26.6, 38.3], [26.9, 38.4], [26.7, 38.9], [26.2, 39.4], [26.2, 40.0], [26.5, 40.4], [27.5, 40.4], [29, 41], [31, 41.2], [35, 42], [38, 41], [42, 41.5], [45, 40], [45, 30], [38, 28], [35.0, 29.5], [34.9, 29.5], [34.27, 27.73], [33.5, 28.3], [32.55, 29.95], [32.3, 30.6]],
  [[32.3, 35.05], [32.9, 35.4], [33.9, 35.4], [34.6, 35.7], [34.0, 35.0], [33.6, 34.95], [33.0, 34.6], [32.4, 34.75]],
  [[23.5, 35.3], [24.5, 35.6], [26.3, 35.3], [25.5, 35.0], [24.0, 35.2]],
  [[12.4, 38.1], [13.4, 38.2], [15.6, 38.3], [15.1, 36.7], [12.6, 37.6]], [[8.4, 39.0], [8.2, 40.9], [9.5, 41.2], [9.8, 39.2]], [[8.6, 41.4], [9.4, 43.0], [9.6, 41.4]],
];
// the Mediterranean coast of the Levant (for the 3D terrain's sea): the same points as the refined polygon above, south → north
export const LEVANT_COAST = [[30.5, 31.1], [32.3, 31.27], [33.0, 31.1], [33.8, 31.13], [34.2, 31.32], [34.45, 31.5], [34.55, 31.67], [34.68, 31.85], [34.75, 32.05], [34.83, 32.3], [34.89, 32.5], [34.93, 32.7], [34.97, 32.83], [35.07, 32.92], [35.1, 33.1], [35.2, 33.27], [35.37, 33.56], [35.5, 33.9], [35.64, 34.2], [35.83, 34.43], [35.9, 34.9]];
const inPoly = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { if (((p[i][1] > y) !== (p[j][1] > y)) && (x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) c = !c; } return c; };
const POP = [[10, 48, 14], [30, 50, 12], [8, 8, 9], [38, 8, 8], [33, -2, 9], [28, -27, 7], [31, 30, 6], [40, 34, 9], [52, 32, 7], [78, 22, 12], [88, 25, 7], [113, 30, 12], [118, 38, 9], [128, 36, 6], [137, 36, 5], [104, 14, 8], [108, 0, 8], [121, 14, 5], [150, -33, 6], [-3, 40, 6], [-74, 41, 9], [-90, 35, 12], [-118, 36, 7], [-99, 19, 7], [-46, -20, 10], [-60, -33, 7], [-74, 5, 6], [12, 42, 4], [23, 38, 3], [29, 41, 3], [36, 36, 3]];
export const popAt = (lon, lat) => popW(lon, lat);   // round 6: how populated a place is (0..1), for olivet3d's city weighting
const popW = (lon, lat) => Math.min(1, POP.reduce((s, [a, b, r]) => s + Math.exp(-(((lon - a) * Math.cos(lat * .0175)) ** 2 + (lat - b) ** 2) / (2 * r * r)), 0));

// ---------------------------------------------------------------- the roads the light runs along (lon, lat), Jerusalem outward
// Acts 1:8 and the book's own roads first (Samaria, Damascus, Antioch, Asia, Macedonia, Achaia, Rome; Gaza → the Ethiopian), then
// the centuries after it (Spain, Gaul, Britain, India, China, Korea, the Americas …). Each route starts at a node already reached.
export const NODE = {
  JER: [35.23, 31.78], JOP: [34.75, 32.05], CAE: [34.89, 32.5], GAZ: [34.45, 31.5], SAM: [35.19, 32.28], NAZ: [35.3, 32.7], DAM: [36.3, 33.51],
  ANT: [36.16, 36.2], TAR: [34.9, 36.92], ICO: [32.5, 37.87], EPH: [27.34, 37.94], TRO: [26.24, 39.75], PHI: [24.29, 41.01], THE: [22.94, 40.64],
  ATH: [23.73, 37.98], COR: [22.88, 37.94], CRE: [24.9, 34.9], MAL: [14.4, 35.9], ROM: [12.5, 41.9], MAR: [5.37, 43.3], LYO: [4.83, 45.76],
  PAR: [2.35, 48.86], LON: [-0.12, 51.5], TGN: [1.25, 41.1], MAD: [-3.7, 40.4], LIS: [-9.14, 38.7], CON: [28.98, 41.0], MOS: [37.6, 55.75],
  BER: [13.4, 52.5], STO: [18.07, 59.33], VIE: [16.37, 48.2], ALX: [29.92, 31.2], CYR: [21.86, 32.82], CAR: [10.32, 36.85], MEM: [31.25, 29.85],
  MER: [33.75, 16.93], AXU: [38.72, 14.13], ADD: [38.74, 9.03], NAI: [36.8, -1.3], KIN: [15.3, -4.3], LAG: [3.4, 6.5], CAP: [18.42, -33.92],
  EDE: [38.79, 37.16], BAB: [44.42, 32.54], PER: [52.5, 29.6], MUM: [72.8, 19.0], KER: [76.3, 9.9], DEL: [77.2, 28.6], SAMK: [66.96, 39.65],
  XIA: [108.9, 34.3], BEI: [116.4, 39.9], SEO: [126.98, 37.57], TOK: [139.7, 35.7], MAN: [121.0, 14.6], SIN: [103.8, 1.35], SYD: [151.2, -33.9],
  HAV: [-82.4, 23.1], MEX: [-99.1, 19.4], RIO: [-43.2, -22.9], SAO: [-46.6, -23.5], BUE: [-58.4, -34.6], LIM: [-77.0, -12.0], NYC: [-74.0, 40.7],
  CHI: [-87.6, 41.9], LAX: [-118.2, 34.0], DAK: [-17.4, 14.7],
};
// chains of nodes, with sea legs marked by '~' (drawn the same, a little dimmer) and extra waypoints as [lon, lat]
export const ROUTES = [
  ['JER', 'JOP', 'CAE'], ['JER', 'SAM', 'NAZ', 'DAM'], ['JER', 'GAZ'],
  ['DAM', 'ANT', 'TAR', 'ICO', 'EPH', 'TRO', 'PHI', 'THE', 'ATH', 'COR'], ['CAE', '~', [33.0, 34.4], 'CRE', 'MAL', [15.6, 37.5], [15.6, 38.9], 'ROM'],
  ['ROM', 'MAR', 'TGN', 'MAD', 'LIS'], ['MAR', 'LYO', 'PAR', 'LON'], ['ROM', 'VIE', 'BER', 'STO'], ['TRO', 'CON', [33.0, 45.0], 'MOS'],
  ['GAZ', 'ALX', 'CYR', 'CAR'], ['GAZ', 'MEM', [32.6, 25.7], 'MER', 'AXU', 'ADD', 'NAI', [28.5, -12], 'CAP'], ['NAI', 'KIN', 'LAG', 'DAK'],
  ['DAM', 'EDE', 'BAB', 'PER', [61.0, 28.0], 'MUM', 'KER'], ['PER', 'SAMK', 'DEL'], ['SAMK', [80.0, 40.5], [95.0, 40.2], 'XIA', 'BEI', 'SEO', 'TOK'],
  ['KER', '~', [86.0, 6.0], 'SIN', 'MAN'], ['SIN', '~', [115.0, -8.0], [130.0, -15.0], 'SYD'],
  ['LIS', '~', [-25.0, 30.0], 'HAV', 'MEX', 'LAX'], ['LIS', '~', [-20.0, 10.0], 'RIO', 'SAO', 'BUE'], ['HAV', 'NYC', 'CHI'], ['MEX', [-80.0, 8.5], 'LIM'],
];

// densified great-circle polylines: [{ pts: [[lon,lat],…], sea: [bool per segment], ends: [nodeName] }]
export function routePolylines(step = 25000) {
  const out = [];
  for (const r of ROUTES) {
    const pts = [], sea = []; let isSea = false, prev = null;
    for (const k of r) {
      if (k === '~') { isSea = true; continue; }
      const ll = typeof k === 'string' ? NODE[k] : k;
      if (prev) { const a = ecef(...prev), b = ecef(...ll), ang = Math.acos(Math.min(1, dot(a, b))), n = Math.max(1, Math.ceil(ang * R_E / step));
        for (let i = 1; i <= n; i++) { const f = i / n, s0 = Math.sin((1 - f) * ang) / Math.sin(ang || 1e-9), s1 = Math.sin(f * ang) / Math.sin(ang || 1e-9);
          const p = ang < 1e-9 ? b : [a[0] * s0 + b[0] * s1, a[1] * s0 + b[1] * s1, a[2] * s0 + b[2] * s1];
          pts.push([Math.atan2(p[1], p[0]) / D2R, Math.asin(Math.max(-1, Math.min(1, p[2]))) / D2R]); sea.push(isSea); } }
      else pts.push(ll);
      if (typeof k === 'string') isSea = false;
      prev = ll; }
    out.push({ pts, sea, end: typeof r[r.length - 1] === 'string' ? r[r.length - 1] : null });
  }
  return out;
}

// ---------------------------------------------------------------- the line shader (lineage-glow's gold line, in screen space)
// A polyline becomes quads; each vertex knows both ends of its segment and is pushed sideways in pixels, so a line is never thinner
// than uMinPx and never wider than its world width allows. The light: dark until the front uF reaches it (network distance aD),
// a white-hot head just behind the front, gold behind it with light flowing outward (pulses moving with the front), soft edges.
export function lineMesh(lines, { minPx = 2.2, color = [1, .72, .36], halo = false } = {}) {   // halo: a wide soft additive pass under the core (round 2: light, not a vector line)
  let n = 0; for (const L of lines) n += Math.max(0, L.p.length - 1);
  const A = new Float32Array(n * 4 * 3), Bv = new Float32Array(n * 4 * 3), D = new Float32Array(n * 4 * 2), Q = new Float32Array(n * 4 * 2), Wd = new Float32Array(n * 4), K = new Float32Array(n * 4), idx = new Uint32Array(n * 6);
  let s = 0;
  for (const L of lines) for (let i = 0; i + 1 < L.p.length; i++, s++) {
    const a = L.p[i], b = L.p[i + 1];
    for (let v = 0; v < 4; v++) { const o = s * 4 + v; A.set([a.x, a.y, a.z], o * 3); Bv.set([b.x, b.y, b.z], o * 3); D.set([L.d[i], L.d[i + 1]], o * 2);
      Q.set([v & 1 ? 1 : -1, v >> 1], o * 2); Wd[o] = L.w; K[o] = L.k ? (Array.isArray(L.k) ? L.k[i] : L.k) : 1; }
    idx.set([s * 4, s * 4 + 1, s * 4 + 3, s * 4, s * 4 + 3, s * 4 + 2], s * 6);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(A.slice(), 3)); g.setAttribute('aA', new THREE.BufferAttribute(A, 3)); g.setAttribute('aB', new THREE.BufferAttribute(Bv, 3));
  g.setAttribute('aD', new THREE.BufferAttribute(D, 2)); g.setAttribute('aQ', new THREE.BufferAttribute(Q, 2)); g.setAttribute('aW', new THREE.BufferAttribute(Wd, 1)); g.setAttribute('aK', new THREE.BufferAttribute(K, 1));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  const u = { uRes: { value: new THREE.Vector2(1080, 1920) }, uMinPx: { value: minPx }, uPull: { value: .004 }, uPullMax: { value: 120 }, uF: { value: 0 }, uT: { value: 0 }, uK: { value: 1 }, uHead: { value: 1 }, uCol: { value: new THREE.Vector3(...color) }, uFlow: { value: 1 } };
  u.uSoft = { value: halo ? .35 : 1.6 }; u.uDay = { value: new THREE.Vector3(0, -1, 0) };
  const m = new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false, depthTest: true, fog: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendEquation: THREE.MaxEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    vertexShader: /* glsl */`attribute vec3 aA, aB; attribute vec2 aD, aQ; attribute float aW, aK; uniform vec2 uRes; uniform float uMinPx, uPull, uPullMax;
      varying float vD, vX, vK, vSun; uniform vec3 uDay;
      vec3 pulled(vec3 P){ vec3 d = cameraPosition - P; float L = length(d); return P + d / max(L, 1e-3) * min(L * uPull, uPullMax); }
      void main(){
        vec3 A = pulled(aA), B = pulled(aB);
        vec4 cA = projectionMatrix * viewMatrix * vec4(A, 1.), cB = projectionMatrix * viewMatrix * vec4(B, 1.);
        if (cA.w < 1e-3 || cB.w < 1e-3) { gl_Position = vec4(2., 2., 2., 1.); return; }
        vec2 sA = cA.xy / cA.w * uRes * .5, sB = cB.xy / cB.w * uRes * .5, dir = sB - sA; float L = length(dir); dir = L > 1e-4 ? dir / L : vec2(1., 0.);
        vec4 c = aQ.y < .5 ? cA : cB;
        float wpx = max(uMinPx, aW * uRes.y * .5 * projectionMatrix[1][1] / c.w), hw = wpx * .5 + 1.2;
        vec2 off = vec2(-dir.y, dir.x) * aQ.x * hw + dir * (aQ.y < .5 ? -1. : 1.) * wpx * .35;
        c.xy += off / (uRes * .5) * c.w; gl_Position = c;
        vD = aQ.y < .5 ? aD.x : aD.y; vX = aQ.x * hw / max(wpx * .5, .5); vK = aK; vSun = dot(normalize((aQ.y < .5 ? aA : aB) - vec3(0., -6371000., 0.)), uDay); }`,
    fragmentShader: /* glsl */`uniform float uF, uT, uK, uHead, uFlow, uSoft; uniform vec3 uCol; varying float vD, vX, vK, vSun;
      void main(){
        float bh = uF - vD; if (bh < 0.) discard;
        float across = exp(-vX * vX * uSoft);
        float on = smoothstep(0., uHead * .25, bh);                           // the head fades in just behind the front
        float head = exp(-bh / uHead);                                         // white-hot near the front
        float flow = 1. + .22 * uFlow * sin((vD - uT * uHead * 1.2) / (uHead * .9)) * smoothstep(uHead * .6, uHead * 2., bh);
        vec3 c = mix(uCol * .9, vec3(1., .96, .86), head) * (1.0 + 1.7 * head) * flow * on;
        gl_FragColor = vec4(c * across * uK * vK * (1. - .8 * smoothstep(-.02, .12, vSun)), 1.); }` });   // fades where the dawn has come
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 5;
  return { mesh, u };
}

// ---------------------------------------------------------------- lamps (village lamps, city lights): warm points that light when the front passes
// p: positions (Vector3 world), d: network distance (m), b: brightness, s: size scale. Sizes in px, shrinking with distance to a floor.
export function lampPoints(list, { px = 5.5, minPx = 1.4, fade = 400, color = [1, .78, .46] } = {}) {   // color: round 6 — the world's cities warmer (sodium)
  const n = list.length, P = new Float32Array(n * 3), Dd = new Float32Array(n), Bb = new Float32Array(n), Ss = new Float32Array(n), Fd = new Float32Array(n);
  list.forEach((L, i) => { P.set([L.p.x, L.p.y, L.p.z], i * 3); Dd[i] = L.d; Bb[i] = L.b; Ss[i] = L.s || 1; Fd[i] = L.f || fade; });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aD', new THREE.BufferAttribute(Dd, 1)); g.setAttribute('aB', new THREE.BufferAttribute(Bb, 1)); g.setAttribute('aS', new THREE.BufferAttribute(Ss, 1)); g.setAttribute('aFd', new THREE.BufferAttribute(Fd, 1));
  const u = { uBurst: { value: 0 }, uCol: { value: new THREE.Vector3(...color) }, uF: { value: 0 }, uT: { value: 0 }, uK: { value: 1 }, uPx: { value: px }, uMin: { value: minPx }, uRef: { value: 600 }, uPull: { value: .004 }, uPullMax: { value: 120 }, uScale: { value: 1 } };
  const m = new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false, depthTest: true, fog: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`attribute float aD, aB, aS, aFd; uniform float uF, uPx, uMin, uRef, uPull, uPullMax, uScale, uBurst; varying float vA;
      void main(){
        vec3 dc = cameraPosition - position; float Lc = length(dc); vec3 q = position + dc / max(Lc, 1e-3) * min(Lc * uPull, uPullMax);
        vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
        float on = smoothstep(aD, aD + aFd, uF);
        float sz = uPx * aS * clamp(uRef / d, .0, 1.) * uScale; float px = max(uMin, sz);
        float fl = max(step(3., aS), uBurst) * on * exp(-max(uF - aD - aFd, 0.) / (aFd * 2.5));   // uBurst (round 7): every light flares as its line arrives
        gl_PointSize = px * on * (1. + 2.2 * fl) + step(.001, on) * .5; vA = on * aB * clamp(sz / px, .25, 1.) * (1. + 1.4 * fl); }`,
    fragmentShader: /* glsl */`uniform float uK; uniform vec3 uCol; varying float vA;
      void main(){ vec2 c = gl_PointCoord - .5; float r2 = dot(c, c) * 4.; float a = (exp(-r2 * 3.2) + .55 * exp(-r2 * 14.)) * (1. - smoothstep(.7, 1., r2));   // round 7: round (a big bright point showed its square corners)
        if (vA <= 0.) discard; gl_FragColor = vec4(uCol * a * vA * uK * 3.2, 1.); }` });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 6;
  return { pts, u };
}

// ---------------------------------------------------------------- round 7 (2026-11-20, owner: "제자들 위치에서부터 밝은 점들이 번져 나가며 생기고,
// lineage-glow 스킬처럼 가는 선들이 밝은 점으로 쏴아악 퍼져서 지구 전체로 번지듯 — 지금 밝은 점 숫자만큼 위치마다"): one thin line from the
// disciples' feet to every light. After motion-skills lineage-glow (C:/Project/motion-skills/lineage-glow — lib/glow.js `fibers` / `node`,
// lib/lineage.js `fan`, references/LOOK.md: "thin gold lines, a white-hot running head, the line stays faintly lit, end nodes ignite with a
// flare, everything 'lighter' on near-black, lines always grow from source to target, never pop in"), re-drawn as an instanced screen-space
// ribbon on the 3D globe so one draw call carries thousands of lines.
// Each line = the great circle from the origin (the world origin: x north, y up, z east at the hill) to its light, written in the origin's
// tangent frame — y = h·cos φ − 2R·sin²(φ/2) — so a line keeps full float precision at the disciples' feet and over the whole planet.
// lines: [{ P (Vector3 world, the light), k (brightness), rest (what stays once arrived), rho (m from the origin before the line shows —
// lineage-glow's fan: near the source only a few lines, more emerge as they spread), lam (0..1: the head runs at lam × the front), or
// late: { t0, T } (a line launched on its own clock: the last lines that keep arriving), hTop (m: a slight lift over the surface) }].
// Uniforms: uF (front, m), uT (s), uO (origin: x, ground y, z), uPx (core px), uK, uBandY (words band), uLimb (1 = fade off the disc),
// uNv / uRmax / uDens (screen-density control near the hub: lines thin out where thousands converge, so the hub glows, never blows out).
export function burstLines(lines, { px = 1.5, seg = 64 } = {}) {
  const n = lines.length, D = new Float32Array(n * 2), Lv = new Float32Array(n * 4), Tv = new Float32Array(n * 4), Hv = new Float32Array(n * 2);
  lines.forEach((L, i) => { const X = L.P.x, Y = L.P.y + R_E, Z = L.P.z, hz = Math.hypot(X, Z) || 1e-6, r = Math.hypot(X, Y, Z);
    D.set([X / hz, Z / hz], i * 2); Lv.set([Math.atan2(hz, Y), L.lam ?? 1, L.rho ?? 0, L.hTop ?? 0], i * 4);
    Tv.set(L.late ? [1, L.late.t0, L.late.T, L.k ?? 1] : [0, 0, 1, L.k ?? 1], i * 4); Hv.set([r - R_E, L.rest ?? .15], i * 2); });
  const S = new Float32Array((seg + 1) * 2), Sd = new Float32Array((seg + 1) * 2), idx = [];
  for (let i = 0; i <= seg; i++) { S.set([i / seg, i / seg], i * 2); Sd.set([-1, 1], i * 2); if (i < seg) { const a = i * 2; idx.push(a, a + 1, a + 3, a, a + 3, a + 2); } }
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((seg + 1) * 2 * 3), 3)); g.setAttribute('aS', new THREE.BufferAttribute(S, 1)); g.setAttribute('aSide', new THREE.BufferAttribute(Sd, 1)); g.setIndex(idx);
  g.setAttribute('aDir', new THREE.InstancedBufferAttribute(D, 2)); g.setAttribute('aL', new THREE.InstancedBufferAttribute(Lv, 4)); g.setAttribute('aT', new THREE.InstancedBufferAttribute(Tv, 4)); g.setAttribute('aH', new THREE.InstancedBufferAttribute(Hv, 2));
  g.instanceCount = n;
  const u = { uF: { value: 0 }, uT: { value: 0 }, uO: { value: new THREE.Vector3() }, uRes: { value: new THREE.Vector2(1080, 1920) }, uPx: { value: px }, uK: { value: 1 }, uBandY: { value: .36 }, uLimb: { value: 1 },
    uNv: { value: n }, uRmax: { value: 2e6 }, uDens: { value: 0 }, uSeg: { value: seg }, uTrail: { value: .55 } };   // uTrail (round 8): the warm trail's peak behind the head
  const m = new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false, depthTest: true, fog: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`attribute float aS, aSide; attribute vec2 aDir, aH; attribute vec4 aL, aT;
      uniform float uF, uT, uPx, uLimb, uNv, uRmax, uDens, uSeg; uniform vec3 uO; uniform vec2 uRes;
      varying float vX, vB, vLh, vOver, vRo, vS, vRho, vK, vRest, vOn, vDn;
      const float R = 6371000.;
      vec3 P(float s){ float ph = aL.x * s, h = mix(uO.y, aH.x, s) + aL.w * sin(3.14159265 * s) + min(s * aL.x * R, 2500.) * .024 * (1. - s),   /* + a lift off the hill's crest over the first km */ sh = sin(ph * .5), rr = R + h, sp = sin(ph);
        return vec3(sp * rr * aDir.x + uO.x * (1. - s), h * cos(ph) - 2. * R * sh * sh, sp * rr * aDir.y + uO.z * (1. - s)); }
      vec2 scr(vec4 c){ return c.xy / c.w * uRes * .5; }
      void main(){
        float d = max(aL.x * R, 1.), p, over, Lh;
        if (aT.x < .5) { float dist = aL.y * uF; p = clamp(dist / d, 0., 1.); over = dist - d; Lh = max(.07 * dist, 3.); }
        else { float q = clamp((uT - aT.y) / aT.z, 0., 1.); p = 1. - (1. - q) * (1. - q) * (1. - q); over = (uT - aT.y - aT.z) / aT.z * d; Lh = .1 * d; }
        if (p <= 0.) { gl_Position = vec4(2., 2., 2., 1.); return; }
        float s = min(aS, p), e = .5 / uSeg;
        vec3 Pc = P(s); vec4 cC = projectionMatrix * viewMatrix * vec4(Pc, 1.), cA = projectionMatrix * viewMatrix * vec4(P(max(s - e, 0.)), 1.), cB = projectionMatrix * viewMatrix * vec4(P(min(s + e, 1.)), 1.);
        if (cC.w < 1e-3 || cA.w < 1e-3 || cB.w < 1e-3) { gl_Position = vec4(2., 2., 2., 1.); return; }
        vec2 tg = scr(cB) - scr(cA); float lt = length(tg); tg = lt > 1e-5 ? tg / lt : vec2(1., 0.);
        cC.xy += vec2(-tg.y, tg.x) * aSide * uPx * 1.6 / (uRes * .5) * cC.w; gl_Position = cC;
        vX = aSide; vB = (p - s) * d; vLh = Lh; vOver = over; vRo = s * d; vS = s; vRho = aL.z; vK = aT.w; vRest = aH.y;
        vec3 dc = vec3(0., -R, 0.) - cameraPosition; float Dc = length(dc), aD = asin(clamp(R / Dc, 0., 1.)), aP = acos(clamp(dot(normalize(Pc - cameraPosition), dc / Dc), -1., 1.));
        vOn = mix(1., 1. - smoothstep(.97, .998, aP / aD), uLimb);
        vDn = 1.; if (uDens > 0.) { vec4 cO = projectionMatrix * viewMatrix * vec4(uO, 1.); if (cO.w > 1e-3) { float rpx = length(scr(cC) - scr(cO)), nv = uNv * min(1., sqrt(vRo / uRmax)); vDn = clamp(uDens * 6.2832 * rpx / max(nv, 1.), 0., 1.); } } }`,
    fragmentShader: /* glsl */`uniform float uK, uBandY, uTrail; uniform vec2 uRes; varying float vX, vB, vLh, vOver, vRo, vS, vRho, vK, vRest, vOn, vDn;
      void main(){
        if (vOn < .002) discard;
        float across = exp(-vX * vX * 4.5);
        float fade = exp(-max(vOver, 0.) / vLh);                                       // after arrival the head goes out
        float head = exp(-vB / vLh) * fade;                                            // white-hot running head
        float trail = exp(-vB / (2.5 * vLh)) * exp(-max(vOver, 0.) / (2. * vLh));   // round 9: a short trail that goes out soon after landing       // warm trail behind it, settling to the rest glow
        float b = vRest * mix(1., .3, vS) + max(uTrail - vRest, 0.) * trail;   // the line that stays: brighter toward the source, so the lit points carry the far ends
        vec3 col = mix(vec3(1., .66, .3), vec3(1., .95, .84), head) * (b + 1.5 * head);
        float near = smoothstep(vRho, vRho * 1.5 + 30., vRo);                          // lineage fan: near the source only a few lines show
        float y = gl_FragCoord.y / uRes.y, band = mix(.22, 1., smoothstep(uBandY - .1, uBandY + .04, y));   // under the words the lines step back
        vec3 o = col * across * vK * uK * near * vDn * vOn * band; if (any(isnan(o)) || any(isinf(o))) o = vec3(0.);
        gl_FragColor = vec4(clamp(o, 0., 6.), 1.); }` });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 7;
  return { mesh, u };
}

// ---------------------------------------------------------------- the earth's light (round 2, 2026-11-19 — "the rise is too dark")
// One shading for the globe and for the terrain patch seen from high up, after the first film's 「교회」 night earth (lifted blue
// land, not black) and orbital photographs at the terminator: night land a deep lifted blue; a wide blue-hour band on the night
// side of the terminator; a warm gold line along the terminator itself; the day side in low warm sun turning to full daylight.
// mu = dot(surface normal, sun). land 0..1, rel = relief noise 0..1, grn = how green the land is, cl = cloud cover 0..1.
export const SHADE_GLSL = /* glsl */`
  uniform float uDeep;   // round 6: 0 = the round-5 lifted night land (the region view), 1 = blue-black night land (the globe from space); unset = 0
  vec3 eShade(float mu, float land, float rel, float grn, float cl){
    vec3 alb = mix(vec3(.04, .085, .16), mix(vec3(.58, .44, .29), vec3(.26, .31, .17), grn) * (.8 + .4 * rel), land);
    vec3 sunC = mix(vec3(1., .52, .26), vec3(1., .94, .86), smoothstep(.0, .32, mu));
    float lit = smoothstep(-.035, .1, mu) * (.32 + .95 * max(mu, 0.));
    vec3 night = mix(mix(vec3(.004, .007, .017), vec3(.018, .024, .045) * (.7 + .6 * rel), land), mix(vec3(.0016, .0031, .0098), vec3(.0030, .0058, .0200) * (.8 + .4 * rel), land), uDeep);   // round 6 (2026-11-20 "slightly grey-blue"): blue-black, the land a shade above the sea
    float tw = smoothstep(-.2, -.01, mu) * (1. - smoothstep(-.01, .14, mu));
    vec3 c = night + alb * sunC * lit * 1.25 + vec3(.04, .055, .13) * tw * tw * mix(.4, 1., land) + vec3(1., .5, .24) * exp(-abs(mu + .012) / .025) * .22;
    vec3 cc = vec3(1., .97, .92) * sunC * smoothstep(-.03, .12, mu) * (.45 + .8 * max(mu, 0.)) + vec3(.018, .022, .04) + vec3(.08, .1, .2) * tw * tw + vec3(1., .55, .3) * exp(-abs(mu) / .03) * .35;
    return mix(c, cc, cl * mix(.35, .85, smoothstep(-.05, .1, mu)));   // moonlit clouds on the night side are faint
  }
  vec3 eHaze(float mu){ return mix(vec3(.02, .035, .09), vec3(.42, .58, .9), smoothstep(-.12, .2, mu)) + vec3(.9, .45, .22) * exp(-abs(mu) / .06) * .25; }`;

// ---------------------------------------------------------------- the globe: a polar cap mesh round the origin out to the antipode
// (dense near the terrain patch so the sphere meets it without facets), shaded as the earth at night: dark land, darker sea,
// a faint relief, haze toward the limb; the city lights and the gold roads are separate meshes (above).
// round 3 (2026-11-19, owner: "지구가 좀 어색하고"): `polys` = Natural Earth 1:110m land ([polygon][ring][lon, lat], data/land-110m.js)
// replaces the first film's hand-drawn LAND outlines (straight coasts, a dark slab by the Red Sea); painted soft, holes even-odd.
export function buildGlobe({ thetaMin = .018, rings = 260, seg = 512, texW = 4096, polys = null } = {}) {
  // the land mask, equirectangular (row 0 = 90°N), painted from the polygons
  const cv = document.createElement('canvas'); cv.width = texW; cv.height = texW / 2; const x = cv.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = '#fff'; x.filter = 'blur(2.5px)';   // soft edges: bilinear + smoothstep = a smooth coast when magnified
  const px = (lon, lat) => [(lon + 180) / 360 * cv.width, (90 - lat) / 180 * cv.height];
  if (polys) { x.filter = 'blur(1.6px)'; for (const P of polys) { x.beginPath(); for (const ring of P) ring.forEach((q, i) => { const [a, b] = px(...q); i ? x.lineTo(a, b) : x.moveTo(a, b); }); x.fill('evenodd'); } x.fillRect(0, px(0, -84)[1], cv.width, cv.height); }
  else { for (const p of LAND) { x.beginPath(); p.forEach((q, i) => { const [a, b] = px(...q); i ? x.lineTo(a, b) : x.moveTo(a, b); }); x.closePath(); x.fill(); }
    x.fillRect(0, px(0, -68)[1], cv.width, cv.height); }   // Antarctica
  const md = x.getImageData(0, 0, cv.width, cv.height).data, CW = cv.width, CH = cv.height;
  const isLand = (lon, lat) => { const i = Math.min(CW - 1, Math.max(0, Math.floor((((lon + 180) % 360 + 360) % 360) / 360 * CW))), j = Math.min(CH - 1, Math.max(0, Math.floor((90 - lat) / 180 * CH))); return md[(j * CW + i) * 4] > 140; };
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = true; tex.anisotropy = 4;
  // the cap mesh: rings at polar angle θ from the origin, exponential near it, out to π
  const pos = [], ix = [];
  for (let i = 0; i <= rings; i++) { const k = i / rings, th = thetaMin * Math.pow(Math.PI / thetaMin, k);
    for (let j = 0; j <= seg; j++) { const ph = j / seg * Math.PI * 2, r = R_E + SEA, st = Math.sin(th);
      pos.push(st * Math.cos(ph) * r, Math.cos(th) * r - R_E, st * Math.sin(ph) * r); } }
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + seg + 1; ix.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(ix);
  const u = { tLand: { value: tex }, uN0: { value: V(...N0) }, uU0: { value: V(...U0) }, uE0: { value: V(...E0) }, uLand: { value: new THREE.Color(.011, .0135, .022) }, uSea: { value: new THREE.Color(.0035, .0055, .014) },
    uHaze: { value: new THREE.Color(.03, .045, .1) }, uHazeL: { value: 4e6 }, uK: { value: 1 }, uNM: { value: 1 }, uSun: { value: V(0, -1, 0) }, uDusk: { value: new THREE.Color(.5, .22, .12) },
    tGlow: { value: null }, uDeep: { value: 0 }, uPre: { value: .3 }, uCG: { value: 0 }, uWF: { value: 0 }, uGlowCol: { value: new THREE.Color(1., .56, .24) } };   // round 6: the cities' warm glow (cityGlowTex), off unless uCG > 0
  const m = new THREE.ShaderMaterial({ uniforms: u, fog: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */`varying vec3 vN, vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vN = normalize(w.xyz - vec3(0., -${R_E.toFixed(1)}, 0.)); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */`uniform sampler2D tLand, tGlow; uniform vec3 uN0, uU0, uE0, uLand, uSea, uHaze, uSun, uDusk, uGlowCol; uniform float uHazeL, uK, uNM, uCG, uWF, uPre; varying vec3 vN, vW;
      ${SHADE_GLSL}
      float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 w = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), w.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), w.x), w.y); }
      void main(){
        vec3 n = normalize(vN), p = n.x * uN0 + n.y * uU0 + n.z * uE0;            // world normal → earth-fixed
        float lat = asin(clamp(p.z, -1., 1.)), lon = atan(p.y, p.x);
        vec2 uv = vec2((lon + 3.14159265) / 6.2831853, (lat + 1.5707963) / 3.14159265);
        float land = smoothstep(.38, .62, texture2D(tLand, uv).r);
        float rel = vn(uv * vec2(900., 450.)) * .6 + vn(uv * vec2(2400., 1200.)) * .4;
        float latd = abs(lat) * 57.3, grn = clamp(smoothstep(38., 52., latd) + (1. - smoothstep(8., 18., latd)) * .9, 0., 1.) * (.6 + .4 * vn(uv * vec2(60., 30.)));
        float clr = vn(uv * vec2(70., 35.)) * .55 + vn(uv * vec2(190., 95.)) * .3 + vn(uv * vec2(600., 300.)) * .15;
        float cl = smoothstep(.56, .78, clr) * smoothstep(.07, .12, acos(clamp(dot(p, uU0), -1., 1.)));   // clear skies over the Holy Land (the terrain patch)
        float ms = min(dot(n, uSun), uNM);
        vec3 c = eShade(ms, land, rel, grn, cl * .8);
        { vec3 vv = normalize(cameraPosition - vW); float sp = max(dot(reflect(-uSun, n), vv), 0.); c += vec3(1., .74, .46) * (pow(sp, 90.) * 1.6 + pow(sp, 14.) * .16) * (1. - land) * (1. - cl) * smoothstep(-.03, .12, ms); }
        vec3 v = normalize(cameraPosition - vW); float mu = max(dot(n, v), 0.);
        float hz = 1. - exp(-length(cameraPosition - vW) / uHazeL); c = mix(c, eHaze(ms), clamp(hz * .12 + pow(1. - mu, 9.) * .6, 0., 1.));
        if (uCG > 0.) { float gd = acos(clamp(dot(p, uU0), -1., 1.)) * ${R_E.toFixed(1)}, on = uPre + (1. - uPre) * smoothstep(gd + 1.5e5, gd + 1.3e6, uWF);   // full as the wave front passes; uPre: the world's cities glow faintly before it (as the dim city points)
          float gl = texture2D(tGlow, uv).r; c += uGlowCol * (gl * gl * 1.9 + gl * .14) * uCG * on * (1. - .55 * cl) * (1. - smoothstep(-.06, .08, ms)) * mix(.55, 1., mu); }
        gl_FragColor = vec4(c * uK, 1.); }` });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false;
  // the atmosphere seen from outside: a shell 90 km up, its limb glowing blue, warm on the side the sun has just left
  const sg = new THREE.SphereGeometry(R_E + 28000, 256, 128); sg.translate(0, -R_E, 0);
  const au = { uK: { value: 0 }, uSun: { value: V(0, -1, 0) }, uBlue: { value: new THREE.Color(.22, .42, 1.0) }, uWarm: { value: new THREE.Color(1.0, .62, .32) } };
  const am = new THREE.ShaderMaterial({ uniforms: au, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    vertexShader: /* glsl */`varying vec3 vN, vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vN = normalize(w.xyz - vec3(0., -${R_E.toFixed(1)}, 0.)); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */`uniform float uK; uniform vec3 uSun, uBlue, uWarm; varying vec3 vN, vW;
      void main(){ vec3 n = normalize(vN), v = normalize(cameraPosition - vW); float mu = clamp(dot(n, v), 0., 1.);
        float rim = pow(1. - mu, 10.) * .8 + pow(1. - mu, 22.) * 2.2;   // round 3: one clean rim                // a thick glow, brightest at the edge
        float ms = dot(n, uSun), sun = pow(max(ms * .5 + .5, 0.), 4.), lineS = exp(-abs(ms + .02) / .09);
        vec3 c = mix(uBlue, uWarm, clamp(sun * .55 + lineS * .6, 0., 1.)) * rim * (.3 + .3 * sun + .25 * lineS);
        gl_FragColor = vec4(c * uK, 1.); }` });
  const atm = new THREE.Mesh(sg, am); atm.frustumCulled = false; atm.renderOrder = 4;
  return { mesh, u, atm, au, tex, isLand };
}

// ---------------------------------------------------------------- round 6 (2026-11-20): the cities' glow on the night land — a soft warm haze round
// the populated land (after night-earth photographs: the land itself blue-black, the light pollution orange round the clusters), so the
// night side carries warm light instead of a grey-blue lift. Equirectangular, row 0 = 90°N; painted from the city list (lon, lat, b).
export function cityGlowTex(cities, { w = 2048 } = {}) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = w / 2; const x = cv.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, w, w / 2); x.globalCompositeOperation = 'lighter';
  for (const c of cities) { const px = (c.lon + 180) / 360 * w, py = (90 - c.lat) / 180 * (w / 2), r = (1.4 + 2.2 * c.b) * w / 2048 / Math.max(.35, Math.cos(c.lat * D2R));
    const g = x.createRadialGradient(px, py, 0, px, py, r * 2.2); g.addColorStop(0, `rgba(255,255,255,${(.03 + .07 * c.b).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(px - r * 2.2, py - r * 2.2, r * 4.4, r * 4.4); }
  x.globalCompositeOperation = 'source-over'; x.filter = 'blur(3px)'; x.drawImage(cv, 0, 0); x.filter = 'none';
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.wrapS = THREE.RepeatWrapping;
  return t;
}

// ---------------------------------------------------------------- the world's city lights (church.html's CITIES, more of them)
// Each light knows its great-circle distance from Jerusalem; it comes on when the light along the roads has gone a little further.
export function cityLights({ count = 13000, skipWithin = 210000, seed = 31, isLand = null } = {}) {
  const r = rng(seed), out = [], boxes = LAND.map(p => { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; for (const [x, y] of p) { a = Math.min(a, x); b = Math.max(b, x); c = Math.min(c, y); d = Math.max(d, y); } return [a, b, c, d]; });
  const land = isLand ? ((lon, lat) => lat > -58 && isLand(lon, lat)) : (lon, lat) => lat < -60 ? false : LAND.some((p, i) => { const q = boxes[i]; return lon >= q[0] && lon <= q[1] && lat >= q[2] && lat <= q[3] && inPoly(lon, lat, p); });
  let guard = 0;
  while (out.length < count && guard++ < count * 60) { const lon = -180 + r() * 360, lat = Math.asin(r() * 2 - 1) / D2R; if (lat < -50 || lat > 66 || !land(lon, lat)) continue;
    const pp = popW(lon, lat); if (r() > .015 + Math.pow(pp, 1.6) * .985) continue; const gd = gcDist(lon, lat); if (gd < skipWithin) continue;
    out.push({ lon, lat, gd, b: (.25 + .75 * Math.pow(r(), 2)) * (.4 + .6 * pp), j: r() }); }
  return out;
}

// ---------------------------------------------------------------- round 3: arcs of light over the curve of the earth (owner 2026-11-19:
// "더 압도적인 선이 전 세계로 번져 나가는 느낌 … 선들이 호를 그리며 쫘악 전 지구적으로 퍼져 나간다든지")
// After motion-skills lineage-glow (one lit node, lines that branch and double, a white-hot head running ahead, warm trail) and the
// classic great-circle "flight arc" globe: each arc = a great circle from A to B lifted into a parabola-like bow (height ∝ length),
// drawn as a screen-space ribbon. Its head runs from A to B in [t0, t0 + T]; behind the head a warm trail fades, and once landed the
// arc stays as a faint residual line, so the lace builds up. Depth-tested against the globe: arcs go over the horizon and come back.
// arcs: [{ P: [Vector3 …] (points along the arc, world), t0, T, k (brightness), w (width ×), rest (what stays once landed) }]. Uniforms: uT (film seconds), uRes, uPx (core px),
// uBandY (fraction of the frame height from the bottom under which the words sit — arcs dimmed there), uK.
export function arcMesh(arcs, { px = 2.4 } = {}) {
  let nSeg = 0; for (const a of arcs) nSeg += a.P.length - 1;
  const A = new Float32Array(nSeg * 12), Bv = new Float32Array(nSeg * 12), PA = new Float32Array(nSeg * 12), NB = new Float32Array(nSeg * 12), Q = new Float32Array(nSeg * 8), Sv = new Float32Array(nSeg * 8), Tm = new Float32Array(nSeg * 12), Wv = new Float32Array(nSeg * 8), idx = new Uint32Array(nSeg * 6);
  let s = 0;
  for (const a of arcs) { const n = a.P.length - 1;
    for (let i = 0; i < n; i++, s++) { const p = a.P[i], q = a.P[i + 1], pa = a.P[Math.max(0, i - 1)], nb = a.P[Math.min(n, i + 2)];
      for (let v = 0; v < 4; v++) { const o = s * 4 + v; A.set([p.x, p.y, p.z], o * 3); Bv.set([q.x, q.y, q.z], o * 3); PA.set([pa.x, pa.y, pa.z], o * 3); NB.set([nb.x, nb.y, nb.z], o * 3); Q.set([v & 1 ? 1 : -1, v >> 1], o * 2); Sv.set([i / n, (i + 1) / n], o * 2); Tm.set([a.t0, a.T, a.k], o * 3); Wv.set([a.w || 1, a.rest == null ? .2 : a.rest], o * 2); }
      idx.set([s * 4, s * 4 + 1, s * 4 + 3, s * 4, s * 4 + 3, s * 4 + 2], s * 6); } }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(A.slice(), 3)); g.setAttribute('aA', new THREE.BufferAttribute(A, 3)); g.setAttribute('aB', new THREE.BufferAttribute(Bv, 3)); g.setAttribute('aPA', new THREE.BufferAttribute(PA, 3)); g.setAttribute('aNB', new THREE.BufferAttribute(NB, 3));
  g.setAttribute('aQ', new THREE.BufferAttribute(Q, 2)); g.setAttribute('aS', new THREE.BufferAttribute(Sv, 2)); g.setAttribute('aTm', new THREE.BufferAttribute(Tm, 3)); g.setAttribute('aW', new THREE.BufferAttribute(Wv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  const u = { uT: { value: 0 }, uRes: { value: new THREE.Vector2(1080, 1920) }, uPx: { value: px }, uK: { value: 1 }, uBandY: { value: .36 }, uRest: { value: .16 }, uHalo: { value: 0 }, uLimb: { value: 0 } };   // round 6: uHalo (soft warm glow round each line), uLimb 1 = fade what leaves the globe's disc
  const m = new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false, depthTest: true, fog: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`attribute vec3 aA, aB, aPA, aNB, aTm; attribute vec2 aQ, aS, aW; uniform vec2 uRes; uniform float uPx, uT, uHalo, uLimb; varying float vS, vX, vP, vAge, vK, vH, vR, vOn, vHk;
      void main(){
        float p = clamp((uT - aTm.x) / aTm.y, 0., 1.); p = 1. - (1. - p) * (1. - p) * (1. - .35 * p);   // the head: fast off the ground, easing in to land
        float sA = aS.x, sB = aS.y;
        if (uT < aTm.x || sA > p + .002) { gl_Position = vec4(2., 2., 2., 1.); return; }
        vec4 cA = projectionMatrix * viewMatrix * vec4(aA, 1.), cB = projectionMatrix * viewMatrix * vec4(aB, 1.);
        if (cA.w < 1e-3 || cB.w < 1e-3) { gl_Position = vec4(2., 2., 2., 1.); return; }
        vec2 sa = cA.xy / cA.w * uRes * .5, sb = cB.xy / cB.w * uRes * .5, dir = sb - sa; float L = length(dir); dir = L > 1e-4 ? dir / L : vec2(1., 0.);
        vec4 c = aQ.y < .5 ? cA : cB;
        // round 6: joined ribbon — each end is pushed sideways along the curve's tangent at that point (from its neighbours), so two
        // segments share the same corners: no overlap (an additive overlap per segment read as bright bars where the arc rises end-on)
        { vec4 cE = aQ.y < .5 ? projectionMatrix * viewMatrix * vec4(aPA, 1.) : projectionMatrix * viewMatrix * vec4(aNB, 1.);
          if (cE.w > 1e-3) { vec2 sE = cE.xy / cE.w * uRes * .5, tg = aQ.y < .5 ? sb - sE : sE - sa; float lt = length(tg); if (lt > 1e-4 && dot(tg / lt, dir) > .75) dir = tg / lt; } }
        float head = exp(-max(p - (aQ.y < .5 ? sA : sB), 0.) * 9.);
        float w = uPx * aW.x * (1. + .45 * head * (1. - smoothstep(.85, 1., p))) * 2.6 * (1. + uHalo * smoothstep(.25, .8, p));   // a soft ribbon (no widening tick where it lands); wider by uHalo for the glow
        c.xy += vec2(-dir.y, dir.x) * aQ.x * w * .5 / (uRes * .5) * c.w; gl_Position = c;   // (round 6: no push along the line any more — the ends meet)
        // round 6: on the globe only — a point whose line of sight passes outside the earth's disc (in space past the limb) fades out
        vec3 Pw = aQ.y < .5 ? aA : aB, dc = vec3(0., -6371000., 0.) - cameraPosition; float D = length(dc), aD = asin(clamp(6371000. / D, 0., 1.)), aP = acos(clamp(dot(normalize(Pw - cameraPosition), dc / D), -1., 1.));
        vOn = mix(1., 1. - smoothstep(.97, .998, aP / aD), uLimb);
        // the glow grows in as the arc lengthens (a short arc rising end-on would read as a plate)
        vS = aQ.y < .5 ? sA : sB; vHk = uHalo * smoothstep(.25, .8, p); vX = aQ.x * (1. + vHk); vP = p; vAge = max(uT - aTm.x - aTm.y, 0.); vK = aTm.z; vH = head; vR = aW.y; }`,
    fragmentShader: /* glsl */`uniform float uK, uBandY, uRest; uniform vec2 uRes; varying float vS, vX, vP, vAge, vK, vH, vR, vOn, vHk;
      void main(){
        float bh = vP - vS; if (bh < -.002 || vOn < .002) discard;
        float across = exp(-vX * vX * 5.) + .5 * exp(-vX * vX * 22.) + vHk * .16 * exp(-vX * vX * 5. / ((1. + vHk) * (1. + vHk)));   // core as before + a wide soft glow
        float head = exp(-bh * 14.) * smoothstep(-.002, .014, bh), trail = exp(-bh * 2.4);   // round 6: no flat cut at the head
        float landed = smoothstep(.0, 2.8, vAge);
        float body = mix(.34 * max(trail, .4), vR * .55, landed);               // in flight: a warm trail; landed: a line that stays (by rank)
        vec3 col = mix(vec3(1., .58, .25), vec3(1., .93, .78), head) * (body + 1.15 * head * (1. - smoothstep(.86, 1., vP)));
        float y = gl_FragCoord.y / uRes.y, band = mix(.4, 1., smoothstep(uBandY - .1, uBandY + .04, y));
        vec3 o = col * across * vK * uK * band * vOn; if (any(isnan(o)) || any(isinf(o))) o = vec3(0.); gl_FragColor = vec4(clamp(o, 0., 6.), 1.); }` });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 7;
  return { mesh, u };
}
