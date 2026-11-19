// olivet3d.js — 「kingdom」 6부 「땅 끝까지」 (film 655.4–700.3: N15c · Q6 · N15d · N28c · Q6a · N28b): one continuous camera.
// Round 2 (2026-11-19, after the review of round 1: "a choir in a row", "flat light, a city of cardboard boxes", "the rise is too
// dark", "abstract map lines"):
//   * The Mount of Olives in the world of the liked part-2 village (heal-village.js): a low sun IN the frame, a thick warm haze
//     with the sun's glow in it (film.lamp in-scatter), dust in the light, long shadows, small figures as silhouettes with rim
//     light (「아웃 오브 아프리카」 low golden light, 「반지의 제왕」 aerial haze in layers). We open INTO the sun from the city side,
//     then the camera follows the pointing arm round the group (one slow arc, rising) until the city stands far off in the haze at
//     the end of their long shadows: the Temple's white and gold mass, the walls and towers, the Antonia's small red banners.
//   * The eleven are an irregular knot, not a row: three sit on rocks, mixed head cloths, turbans and bare heads, earth-tone
//     mantles, everyone breathing and shifting on his own phase; one points at the city and the heads turn after his arm one by
//     one; one asks with an open hand; at N28c the pointing hand eases down and one man (his back to us) turns from the walls to
//     the far horizon, and the camera goes round with him.
//   * Q6a: the light runs out from under their feet along the real roads ON the terrain — warm light in the dust of the tracks
//     (emissive road masks in the terrain shader, after motion-skills map-dive's night-glow layer), down to Jerusalem (the city's
//     lamps), out over Judea, north to Samaria, and village lamps light at each road's end, village after village (part 1's
//     lakeside lamps; 「반지의 제왕」 beacons). One camera: a crane up off the hill that keeps rising (log-altitude, eased) into a
//     pull-back to the top of the air. Only beyond the terrain patch (200 km) do the roads become soft lines of light on the globe.
//   * The earth up there is luminous, after the first film's 「교회」: lifted blue night land, a thick blue-hour rim, cloud glow, warm
//     city lights, and the dawn terminator — a warm gold line — coming across the planet from the east (earth-night.js eShade).
// Craft sources (copied, never edited at the source): heal-village.js (sun lamp, dust, palette) · people3d.js robeMan/walk/idle +
// round-2 headwear/rockSit/rock · motion/pilot/church.html (night earth, rim, first dawn on the limb, lights spreading from
// Jerusalem) · motion-skills map-dive land.js (roads painted into a blurred glow layer = emissive on the terrain at night),
// lineage-glow (a hot head running ahead along the lines), cinematic-3d (lib3d/cine.js), cinecode camera-moves.md ("crane /
// pedestal up — scale, a reveal", "arc", "pull-back reveal").
// Rules kept: Jesus never by face — small, from behind or against the light, never in the sun's axis (no halo); men in head cloths
// or short hair, beards; walking with planted feet; no words in the art; one camera, no cut; every time from script.json.
//
// API: const OL = await (await import('./olivet3d.js')).build(W, H);  OL.draw(ctx, t, B)   t = FILM seconds,
//      B = line times from script.json { N15c, Q6, N15d, N28c, Q6a, N28b, N29 } + B.cuts (the times Q6a's 2nd and 3rd pieces
//      come on screen). Every beat comes from B in beats(). Pure in t.
import { Film, THREE, V, col, rng } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';
import * as E from './earth-night.js';
import LANDP from './data/land-110m.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const sine = x => .5 - .5 * Math.cos(Math.PI * clamp(x));
const D2R = Math.PI / 180;
const hd = deg => V(Math.sin(deg * D2R), 0, -Math.cos(deg * D2R));   // heading: 0 = toward the walls (−z, west), 90 = +x (north), 180 east
const yawOf = deg => -deg * D2R;                                       // the rotation.y that turns a figure (facing −z) to a heading
const headingTo = (x0, z0, x1, z1) => Math.atan2(x1 - x0, -(z1 - z0)) / D2R;
const keys = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const [a, va] = K[i - 1], [b, vb] = K[i]; return lerp(va, vb, sine((t - a) / (b - a))); } return K[K.length - 1][1]; };
// monotone cubic (Fritsch–Carlson) through [t, v] keys: smooth speed, no overshoot — the crane's log-altitude and the light's front
function mono(K) { const n = K.length, x = K.map(k => k[0]), y = K.map(k => k[1]), d = [], m = new Array(n).fill(0);
  for (let i = 0; i + 1 < n; i++) d.push((y[i + 1] - y[i]) / (x[i + 1] - x[i]));
  m[0] = d[0] * .5; m[n - 1] = d[n - 2] * .5; for (let i = 1; i + 1 < n; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : 3 * (x[i + 1] - x[i - 1]) / ((2 * x[i + 1] - x[i] - x[i - 1]) / d[i - 1] + (x[i + 1] + x[i] - 2 * x[i - 1]) / d[i]);
  m[0] = 0; m[n - 1] = 0;
  return t => { if (t <= x[0]) return y[0]; if (t >= x[n - 1]) return y[n - 1]; let i = 0; while (t > x[i + 1]) i++; const h = x[i + 1] - x[i], s = (t - x[i]) / h, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * y[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * y[i + 1] + (s3 - s2) * h * m[i + 1]; }; }

// ---------------------------------------------------------------- noise (deterministic)
const h2 = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function fbm(x, y, o = 4) { let s = 0, a = .5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += a * vnoise(x * f + i * 17.3, y * f - i * 9.1); n += a; a *= .5; f *= 2.03; } return s / n; }

// ---------------------------------------------------------------- the land (metres; y relative to the crest, ≈ 810 m above the sea)
const CREST = 810, PATCH = 200000;
const tab = (T, x) => { if (x <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (x <= T[i][0]) { const k = (x - T[i - 1][0]) / (T[i][0] - T[i - 1][0]); return lerp(T[i - 1][1], T[i][1], k); } return T[T.length - 1][1]; };
const SPINE_Z = [[-250, -60], [-120, -30], [-60, -18], [-28, -12], [0, -1.5], [30, -1], [60, 2], [100, 5], [160, 10], [250, 20]];
const SPINE_H = [[-250, 600], [-120, 500], [-60, 850], [-28, 950], [0, 800], [30, 850], [55, 520], [80, 450], [100, 520], [130, 800], [160, 1200], [250, 1500]];
const RIFT_Z = [[-250, -20], [-120, 15], [-60, 22], [-30, 24], [0, 25], [50, 29], [100, 31], [116, 33], [160, 34], [250, 36]];
// the Mediterranean shore in this plane (km), from earth-night.js's Levant coast; the sea is everything west of it
const COAST = E.LEVANT_COAST.map(([lo, la]) => E.llToLocal(lo, la).map(v => v / 1000));
const SEA_POLY = [...COAST, [COAST[COAST.length - 1][0] + 200, -400], [-400, -400]];
const inPoly = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { if (((p[i][0] > x) !== (p[j][0] > x)) && (y < (p[j][1] - p[i][1]) * (x - p[i][0]) / (p[j][0] - p[i][0]) + p[i][1])) c = !c; } return c; };
function coastDist(x, z) { let m = 1e9; for (let i = 0; i + 1 < COAST.length; i++) { const [ax, az] = COAST[i], [bx, bz] = COAST[i + 1], dx = bx - ax, dz = bz - az, k = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)); m = Math.min(m, Math.hypot(x - ax - dx * k, z - az - dz * k)); } return m; }
const GAL = E.llToLocal(35.59, 32.82).map(v => v / 1000);
let WATER = 0, LAKESD = -50;
function regional(x, z) {   // km → metres above the sea; sets WATER (0 land, 1 sea, 2 lake)
  WATER = 0; LAKESD = -50;
  if (inPoly(x, z, SEA_POLY)) { WATER = 1; return -40; }
  const dc = coastDist(x, z), S = tab(SPINE_H, x), zs = tab(SPINE_Z, x), zj = tab(RIFT_Z, x);
  let m, hilly;
  if (z < zs) { const k = clamp((dc - 14) / Math.max(4, (zs - z) + dc - 14)); m = lerp(Math.min(70, 4 + dc * 4.5), S, Math.pow(ss(0, 1, k), .85)); hilly = ss(.05, .5, k); }
  else if (z < zj - 6) { const k = (z - zs) / (zj - 6 - zs); m = lerp(S, -280, Math.pow(ss(0, 1, k), 1.15)); hilly = 1 - .6 * ss(.7, 1, k); }
  else if (z < zj + 5) { m = -300 - 90 * (1 - Math.abs(z - zj) / 11); hilly = .12; }
  else { m = lerp(-300, 900, ss(zj + 5, zj + 16, z)); hilly = .8; }
  m += ((fbm(x / 7, z / 7, 4) - .5) * 260 + (fbm(x / 1.6, z / 1.6, 3) - .5) * 80 + (fbm(x / .4, z / .4, 2) - .5) * 22) * (.18 + .82 * hilly);
  // the Dead Sea (−430) and the Sea of Galilee (−212)
  if (x > -60 && x < -1) { const w = 7.2 * Math.pow(Math.sin(Math.PI * (x + 60) / 59), .45), c = zj - 1.2 + 1.5 * Math.sin(x / 9); LAKESD = w - Math.abs(z - c); if (LAKESD > 0) { WATER = 2; return -430; } m = Math.max(m, -425 + 18 * clamp(Math.abs(z - c) - w)); }
  { const ex = (x - GAL[0]) / 9.5, ez = (z - GAL[1]) / 5.6, q = ex * ex + ez * ez; LAKESD = Math.max(LAKESD, (1 - Math.sqrt(q)) * 5.6); if (q < 1) { WATER = 2; return -212; } }
  if (m < 3) m = 3 + (m - 3) * .05;
  return m;
}
const KZ = x => -560 + 40 * Math.sin(x / 380);
function nearH(x, z) {   // the crest shelf, the west face down to the Kidron, the city's shelf rising west; the gentle east side
  const kz = KZ(x); let y;
  if (z <= 0) y = .04 * Math.max(z, -48) - 103 * Math.pow(ss(-48, kz, z), 1.12) + 55 * ss(kz - 15, kz - 110, z) + 32 * ss(kz - 110, kz - 1250, z);
  else y = -36 * ss(28, 430, z) - 30 * ss(430, 2200, z);
  y += 6 * Math.sin(x / 300 + .7) * ss(60, 260, Math.abs(x));
  const r = Math.hypot(x, z), m = .12 + .88 * ss(25, 140, r);
  y += (fbm(x / 650 + 7, z / 650 - 2, 3) - .5) * 70 * ss(160, 700, r) * (1 - ss(-60, -260, z));   // rolling hills along the ridge, away from the city side
  return y + ((fbm(x / 140 + 3, z / 140, 3) - .5) * 9 + (fbm(x / 22, z / 22 + 5, 2) - .5) * 1.6) * m;
}
// y (metres, relative to the crest) of the land at (x north, z east); sets WATER
function H(x, z) {
  const r = Math.hypot(x, z), wN = 1 - ss(2600, 7000, r); let y = 0, w = 0;
  if (wN < 1) { y = regional(x / 1000, z / 1000) - CREST; w = WATER; }
  if (wN > 0) { y = lerp(y, nearH(x, z), wN); if (wN > .5) w = 0; }
  const e = ss(PATCH - 45000, PATCH - 2000, r); if (e > 0) y = lerp(y, w === 1 ? -CREST : -CREST + 6, e);
  if (w === 1) y = -CREST;
  WATER = w; return y;
}


// ---------------------------------------------------------------- the one table: beats from the line times
export function beats(B) {
  const a = B.N15c, b = B.Q6, c = B.N15d, d = B.N28c, e = B.Q6a, f = B.N28b, g = B.N29;
  const c1 = (B.cuts && B.cuts[0]) || e + 4.8, c2 = (B.cuts && B.cuts[1]) || e + 10.0;   // Q6a: "예루살렘과 …" and "내 증인이 되리라" come on
  return { start: a, end: g, a, b, c, d, e, f, g, c1, c2,
    arc: [a + 1.1, b + 5.6],                        // N15c→Q6: from into the sun, round the group (through the south) to behind them
    point: [a + 3.2, a + 4.6], relax: [b + 3.4, b + 4.8], again: [c + .9, c + 2.1], lower: [d + .4, d + 1.9],   // Peter's arm
    look1: a + 3.5,                                // heads turn after his arm, one after another
    ask: [b + .25, b + 1.35], askOff: [c + .4, c + 1.5],   // Q6: an open hand toward the man in the middle
    look2: c + .3, push: [c + .1, c + 5.8], rackW: [c + .5, c + 2.3], gust: c + 1.0,   // N15d: the lens closes on the banners
    rackG: [d + .05, d + 1.1], look3: d + .45, open: [d + .9, d + 2.5],               // N28c: they turn to him; his hand opens to the horizon
    turn: [d + 2.2, d + 4.9], look4: d + 3.4, pan: [d + 3.9, d + 7.6], widen: [d + 1.0, d + 7.6],
    crane: e + .5, walk: e + 1.4 };
}
// the sun: heading 145 (from the east-north-east, behind the group as seen from the city — their shadows run down toward the
// walls' south-east corner); low and golden on the hill, below the horizon while the lamps come on, then the dawn line comes back
// across the earth from the east as the camera reaches the top of the air
// below the horizon its bearing comes round (unseen) to where the camera will look from the top of the air, so that in the last
// seconds the dawn line comes across the planet toward Jerusalem, ahead of the camera
const sunHead = T => t => keys([[T.a, 145], [T.c1 + 1.0, 145], [T.c2 + .8, 40], [T.g, 40]], t);
const sunElev = T => t => keys([[T.a, 7.4], [T.c, 6.7], [T.d, 6.2], [T.e, 5.8], [T.e + 2.2, 3.6], [T.c1, 1.2], [T.c1 + 2.2, -3.0], [T.c2, -8.5], [T.f, -19], [T.f + 1.4, -20.5], [T.g, -9.5]], t);
const GC = V(.2, 0, -.6);   // the group's centre (the camera works round it)

export async function build(W, H_, B0 = null) {
  const T0B = beats(B0);   // round 3: the arcs' launch times are laid out once at build, from the same line times
  const Hh = H_, vert = Hh > W;
  const film = new Film({
    W, H: Hh, dur: 1e4, fov: 40, near: .3, far: 3.5e5,
    atmos: { density: 9e-4, falloff: 1.3e-3, base: -60, start: 5, color: col('#d6ad7c', .72), colorUp: col('#c8b69a', .64), max: 3e5, scatter: 1, anisotropy: .8, phaseMix: .9 },
    bloom: { strength: .07, radius: 1.1, tint: col('#ffe2b8') },
    dof: { focus: 20, aperture: 2, maxCoc: 14 },
    look: { exposure: 1.05, contrast: 1.04, saturation: 1.03, lift: col('#0c0906'), shadowTint: col('#d8d0e8'), highTint: col('#fff0d8'), vignette: .3, grain: .03, ca: .3 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera, R = film.renderer;
  let T = null, SUNE = null, SUNH = null, SUNF = null, OFFS = [];

  // ---------------------------------------------------------------- light
  const sunL = new THREE.DirectionalLight(col('#ffd39a'), 3.0); S.add(sunL, sunL.target);
  const maxT = R.capabilities.maxTextureSize, smW = Math.min(8192, maxT), smH = Math.min(4096, maxT);
  sunL.castShadow = true; sunL.shadow.mapSize.set(smW, smH); sunL.shadow.bias = -.0002; sunL.shadow.normalBias = .05;
  const hemi = new THREE.HemisphereLight(col('#a6b4cc'), col('#7a5a3a'), .55); S.add(hemi);
  const twi = new THREE.DirectionalLight(col('#8a9ad8'), 0); S.add(twi, twi.target);   // the bright side of the twilight sky: shape on the hills after sunset
  // the sun's glow in the haze (heal-village: film.lamp in-scatter) — kept on the sun's line a few km off, every frame
  const sunLamp = film.lamp(V(0, 400, 3000), '#ffcf90', { power: 0, size: 220, fog: 1 });
  const SHADOW_BOX = [V(-600, -150, -1800), V(420, 90, 260)];
  const lightView = new THREE.Matrix4(), tmp = V();
  function fitShadow(dir) {   // an orthographic shadow box round the hill, the slope and the near city, aligned to the sun
    const tg = V(0, -40, -480); sunL.target.position.copy(tg); sunL.position.copy(tg).addScaledVector(dir, 3000);
    lightView.lookAt(sunL.position, tg, V(0, 1, 0)); lightView.setPosition(sunL.position); const inv = lightView.clone().invert();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9; const [A, Bx] = SHADOW_BOX;
    for (let i = 0; i < 8; i++) { tmp.set(i & 1 ? Bx.x : A.x, i & 2 ? Bx.y : A.y, i & 4 ? Bx.z : A.z).applyMatrix4(inv); x0 = Math.min(x0, tmp.x); x1 = Math.max(x1, tmp.x); y0 = Math.min(y0, tmp.y); y1 = Math.max(y1, tmp.y); z0 = Math.min(z0, tmp.z); z1 = Math.max(z1, tmp.z); }
    Object.assign(sunL.shadow.camera, { left: x0, right: x1, bottom: y0, top: y1, near: Math.max(1, -z1 - 50), far: -z0 + 50 }); sunL.shadow.camera.updateProjectionMatrix();
  }
  // a second, tight shadow for the group itself (the big box is too coarse for 1.7 m figures: their shadows must be crisp and long)
  const sunN = new THREE.DirectionalLight(col('#ffd39a'), 0); S.add(sunN, sunN.target);
  sunN.castShadow = true; sunN.shadow.mapSize.set(2048, 2048); sunN.shadow.bias = -.0004; sunN.shadow.normalBias = .03;
  Object.assign(sunN.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 400 });

  // ---------------------------------------------------------------- the sky (golden haze → blue hour → the black above the air)
  const skyU = { uUp: { value: V(0, 1, 0) }, uSun: { value: V(0, 1, 0) }, uE: { value: 9 }, uDip: { value: 0 }, uSpace: { value: 0 }, uGlow: { value: 0 }, uGlowDir: { value: hd(50) }, uStars: { value: 0 } };
  { const m = new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: `varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 0.)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.)).xyz, 1.); gl_Position = p.xyww; }`,
      fragmentShader: `varying vec3 vD; uniform vec3 uSun, uGlowDir, uUp; uniform float uE, uDip, uSpace, uGlow, uStars;
        float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(h12(i), h12(i + vec2(1, 0)), u.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), u.x), u.y); }
        void main(){ vec3 d = normalize(vD); float y = dot(d, uUp) + uDip;   // relative to the true horizon (up = away from the earth's centre)
          vec3 hz3 = normalize(d - uUp * dot(d, uUp) + 1e-5), hs3 = normalize(uSun - uUp * dot(uSun, uUp) + 1e-5); float sd = dot(hz3, hs3); vec2 hz = hz3.xz;
          float day = smoothstep(-1., 12., uE), dk = smoothstep(-12., -.5, uE);
          vec3 Z = mix(mix(vec3(.03, .05, .13), vec3(.11, .17, .36), dk), vec3(.25, .36, .58), day);
          vec3 Ha = mix(mix(vec3(.1, .12, .24), vec3(.5, .38, .46), dk), vec3(.92, .74, .54), day);
          vec3 Hs = mix(mix(vec3(.22, .14, .16), vec3(1.25, .55, .24), dk), vec3(1.55, 1.0, .58), day);
          vec3 Hc = mix(Ha, Hs, pow(sd * .5 + .5, 2.4));
          float esTop = clamp(-uE * .018, 0., .12);                                    // the earth's shadow rising opposite the sun
          Hc = mix(Hc, vec3(.16, .19, .34) * (.5 + .5 * dk), (1. - smoothstep(0., esTop + .001, y)) * smoothstep(.1, -.6, sd) * step(.0, esTop - .0001) * .7);
          vec3 c = mix(Hc, Z, pow(smoothstep(-.01, .55, y), .7));
          if (y < 0.) c = mix(Hc * .6, vec3(.03, .04, .08), smoothstep(0., -.25, y));
          // high thin cloud: a few streaks catching the low light (heal-village's sky had them)
          if (y > .01) { vec2 p = d.xz / (y + .08); float n = vn(p * 1.1 + 3.) * .6 + vn(p * 3.3) * .3 + vn(p * 9.) * .1; float m = smoothstep(.6, .82, n) * smoothstep(.01, .12, y) * (1. - smoothstep(.35, .7, y));
            vec3 cc = mix(Ha * .9, Hs * 1.15, pow(sd * .5 + .5, 3.)) * (.55 + .5 * day) + vec3(1., .6, .35) * smoothstep(-9., -1., uE) * (1. - day) * .5; c = mix(c, cc, m * .55 * (1. - uSpace)); }
          float s = max(dot(d, uSun), 0.);
          c += vec3(1., .66, .32) * (pow(s, 6.) * .55 + pow(s, 40.) * 1.2 + pow(s, 400.) * 3.) * smoothstep(-6., 1., uE) + vec3(1., .92, .75) * 34. * smoothstep(.99962, .9998, s) * smoothstep(-1., .5, uE);
          c += vec3(1., .7, .38) * uGlow * exp(-abs(y) / .025) * pow(max(dot(hz, normalize(uGlowDir.xz)), 0.), 2.);   // the light gone beyond the horizon
          float ys = dot(uSun, uUp) + uDip;   // the sun against the camera's own horizon (the limb)
          vec3 sp = vec3(.003, .005, .012) + vec3(.04, .08, .2) * exp(-abs(y) / .0015) + (vec3(1., .64, .32) * exp(-abs(y) / .0012) * .9 + vec3(1., .7, .42) * exp(-abs(y) / .005) * .06) * pow(max(sd, 0.), 6.) * smoothstep(-.4, .0, ys);   // round 5: near-black navy; a thin rim, the dawn glow only on the far limb   // above the air: the blue rim; the dawn on the limb toward the sun
          c = uSpace > .999 ? sp : mix(c, sp, uSpace); if (any(isnan(c))) c = sp;
          if (uStars > 0. && y > .02){ vec3 gg = d * 260., g = floor(gg); vec2 k = g.xy + g.z * 17.31; float st = step(.9986, h12(k)) * (1. - smoothstep(.05, .32, length(fract(gg) - .5))); c += vec3(st * uStars * (.3 + .7 * h12(k + 3.))) * smoothstep(.02, .12, y); }
          gl_FragColor = vec4(c, 0.); }` });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), m); sky.frustumCulled = false; sky.renderOrder = -10;
    sky.onBeforeRender = (r, s, c) => { sky.position.setFromMatrixPosition(c.matrixWorld); sky.updateMatrixWorld(); }; S.add(sky); }

  // ---------------------------------------------------------------- the roads (dirt tracks) and their glow: masks painted for the terrain shader
  // near: the paths off the crest (6 km square, 1.5 m/px): R = the track, G = a wide soft halo (the glow in the dust round it)
  // regional: the roads to the towns of Judea and Samaria (420 km square, 100 m/px): R = road, G = halo, B = the towns' glow
  const ROADR = 3000, RT = 4096, REGR = 210000, RG = 4096;
  const mkCv = n => { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, n, n); x.lineCap = x.lineJoin = 'round'; return [c, x]; };
  const [roadCv, rx] = mkCv(RT), [roadHCv, rhx] = mkCv(RT >> 1), [regCv, gx] = mkCv(RG), [regHCv, ghx] = mkCv(RG >> 1);
  const toRT = (x, z, n = RT) => [(x + ROADR) / (2 * ROADR) * n, (z + ROADR) / (2 * ROADR) * n];
  const toRG = (x, z, n = RG) => [(x + REGR) / (2 * REGR) * n, (z + REGR) / (2 * REGR) * n];
  // local paths off the crest (metres, [x north, z east]); they fan out from the group's feet in every direction
  const PATHS = {
    W: [[0, 0], [-3, -30], [4, -95], [-12, -190], [6, -300], [-8, -420], [8, -540], [40, -650], [60, -705], [40, -900], [-30, -1250], [-60, -1730], [-90, -2400], [-150, -2950]],   // down to the Kidron, the Temple's east gate, through the city and out west
    NW: [[0, 0], [22, -24], [120, -140], [240, -330], [300, -560], [330, -760], [300, -1000], [300, -1360], [420, -2100], [560, -2950]],   // across the Kidron's head to the north gate
    N: [[0, 0], [30, 4], [160, 0], [420, -20], [800, -60], [1400, -120], [2300, -180], [2950, -230]],                      // along the ridge, north
    NE: [[0, 0], [24, 26], [180, 160], [520, 420], [1100, 900], [1900, 1500], [2400, 2000]],                              // down the back toward Anathoth
    E: [[0, 0], [-6, 30], [-60, 220], [-260, 700], [-560, 1250], [-820, 1700], [-1100, 2300], [-1300, 2950]],              // down to Bethany and on toward Jericho
    S: [[0, 0], [-30, 6], [-200, -20], [-520, -90], [-1000, -170], [-1700, -330], [-2400, -480], [-2950, -560]],           // south along the ridge toward Bethlehem
  };
  for (const k in PATHS) { const p = PATHS[k], r = rng(k.length * 31 + k.charCodeAt(0)), out = [p[0]];   // tracks wander with the ground (no ruler-straight spokes)
    for (let i = 0; i + 1 < p.length; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 25)), nx = -(bz - az) / L, nz = (bx - ax) / L, ph = r() * 6.3;
      for (let j = 1; j <= n; j++) { const kk = j / n, w = (j < n ? 1 : 0) * Math.sin(kk * Math.PI) * Math.sin(kk * 5.1 + ph) * Math.min(L * .05, 30) * Math.min(1, Math.hypot(ax, az) / 40 + .2); out.push([lerp(ax, bx, kk) + nx * w, lerp(az, bz, kk) + nz * w]); } }
    PATHS[k] = out; }
  const strokeP = (x, map, n, p, w) => { x.lineWidth = w; x.beginPath(); p.forEach(([a, b], i) => { const [u, v] = map(a, b, n); i ? x.lineTo(u, v) : x.moveTo(u, v); }); x.stroke(); };
  rx.strokeStyle = '#fff'; rhx.strokeStyle = '#0f0';
  for (const k in PATHS) { const p = PATHS[k];
    for (const [w, a] of [[5, .25], [3, .6], [1.8, 1]]) { rx.globalAlpha = a; strokeP(rx, toRT, RT, p, w / (2 * ROADR) * RT); }
    rhx.globalAlpha = 1; rhx.filter = 'blur(3px)'; strokeP(rhx, toRT, RT >> 1, p, 4 / (2 * ROADR) * (RT >> 1)); rhx.filter = 'none'; }
  rx.globalAlpha = 1;
  // regional roads (lon, lat), from the path ends and town to town (the same chains as round 1)
  const LL = (lo, la) => E.llToLocal(lo, la);
  const pathEnds = {}; for (const k in PATHS) pathEnds[k] = PATHS[k][PATHS[k].length - 1];
  const TOWN = { EMM: [34.99, 31.84], LYD: [34.89, 31.95], JOP: [34.75, 32.05], APO: [34.81, 32.2], CAE: [34.89, 32.5], BET: [35.2, 31.705], HEB: [35.1, 31.53], BSH: [34.79, 31.25],
    BGU: [34.9, 31.6], ASK: [34.55, 31.67], GAZ: [34.45, 31.5], JRC: [35.44, 31.87], JFD: [35.55, 31.84], AMM: [35.93, 31.95], GIB: [35.23, 31.82], RAM: [35.23, 31.85], BTL: [35.22, 31.93],
    SHI: [35.29, 32.06], SHE: [35.28, 32.21], SAM: [35.19, 32.28], JEN: [35.3, 32.46], NAI: [35.35, 32.63], NAZ: [35.3, 32.7], CAN: [35.34, 32.75], CAP: [35.57, 32.88], CPH: [35.69, 33.25],
    DAM: [36.3, 33.51], ANA: [35.26, 31.81], MIC: [35.28, 31.87], EPH: [35.3, 31.95], JV1: [35.5, 32.1], JV2: [35.55, 32.4], SCY: [35.5, 32.5], GAD: [35.68, 32.65], GBN: [35.18, 31.85], BHR: [35.1, 31.88],
    ARI: [33.8, 31.13], PEL: [32.55, 31.04], TYR: [35.2, 33.27], SID: [35.37, 33.56], PTO: [35.08, 32.92], TIB: [35.53, 32.79], MAS: [35.35, 31.31], TEK: [35.21, 31.64], AZO: [34.65, 31.75] };
  const REG = [['@W', 'EMM', 'LYD', 'JOP', 'APO', 'CAE'], ['@S', 'BET', 'HEB', 'BSH'], ['BET', 'BGU', 'ASK', 'GAZ', 'ARI', 'PEL'], ['@E', 'JRC', 'JFD', 'AMM'],
    ['@N', 'GIB', 'RAM', 'BTL', 'SHI', 'SHE', 'SAM', 'JEN', 'NAI', 'NAZ', 'CAN', 'CAP', 'CPH', 'DAM'], ['@NE', 'ANA', 'MIC', 'EPH', 'JV1', 'JV2', 'SCY', 'GAD'], ['@NW', 'GBN', 'BHR', 'LYD'],
    ['JOP', 'AZO', 'ASK'], ['CAE', 'PTO', 'TYR', 'SID'], ['NAZ', 'TIB', 'CAP'], ['BET', 'TEK', 'MAS'], ['JRC', 'MAS']];
  const TP = {}; for (const k in TOWN) TP[k] = LL(...TOWN[k]);
  // a road is not a ruler line: each leg wanders a little (seeded), as tracks follow the ground
  const wander = (poly, seed) => { const r = rng(seed), out = []; for (let i = 0; i + 1 < poly.length; i++) { const [ax, az] = poly[i], [bx, bz] = poly[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.ceil(L / 2500)), nx = -(bz - az) / L, nz = (bx - ax) / L, ph = r() * 6.28, amp = Math.min(1800, L * .06);
      for (let j = 0; j < n; j++) { const k = j / n, w = Math.sin(k * Math.PI) * (Math.sin(k * 7.3 + ph) * .7 + Math.sin(k * 17.1 + ph * 2) * .3) * amp; out.push([lerp(ax, bx, k) + nx * w, lerp(az, bz, k) + nz * w]); } }
    out.push(poly[poly.length - 1]); return out; };
  const REGP = REG.map((ch, i) => wander(ch.map(k => k[0] === '@' ? pathEnds[k.slice(1)] : TP[k]), 91 + i));
  gx.strokeStyle = '#f00'; ghx.strokeStyle = '#0f0';
  for (const p of REGP) { gx.globalAlpha = 1; gx.filter = 'blur(.8px)'; strokeP(gx, toRG, RG, p, 2.2); gx.filter = 'none'; ghx.filter = 'blur(5px)'; strokeP(ghx, toRG, RG >> 1, p, 4); ghx.filter = 'none'; }
  const TOWNS = Object.keys(TOWN).map(k => [TP[k], k === 'DAM' || k === 'GAZ' || k === 'CAE' || k === 'JOP' ? 2.2 : 1]);
  for (const [[x, z], sz] of TOWNS) { const [u, v] = toRG(x, z, RG >> 1); const g = ghx.createRadialGradient(u, v, 0, u, v, 3 * sz); g.addColorStop(0, 'rgba(0,0,255,1)'); g.addColorStop(1, 'rgba(0,0,255,0)'); ghx.globalCompositeOperation = 'lighter'; ghx.fillStyle = g; ghx.fillRect(u - 8 * sz, v - 8 * sz, 16 * sz, 16 * sz); ghx.globalCompositeOperation = 'source-over'; }
  const MIDR = 60000, MG = 4096, [midCv, mx] = mkCv(MG), toMG = (x, z, n = MG) => [(x + MIDR) / (2 * MIDR) * n, (z + MIDR) / (2 * MIDR) * n];
  { const fine = (p, seed) => { const r = rng(seed), out = []; for (let i = 0; i + 1 < p.length; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 220)), nx = -(bz - az) / L, nz = (bx - ax) / L, ph = r() * 6.3;
        for (let j = 0; j < n; j++) { const k = j / n, w = (Math.sin(k * L / 700 + ph) * .6 + Math.sin(k * L / 260 + ph * 3) * .4) * Math.min(70, L * .05) * (j ? 1 : 0); out.push([lerp(ax, bx, k) + nx * w, lerp(az, bz, k) + nz * w]); } }
      out.push(p[p.length - 1]); return out; };
    mx.globalCompositeOperation = 'lighter';
    REGP.forEach((p0, i) => { const p = fine(p0, 300 + i); mx.strokeStyle = '#0f0'; mx.filter = 'blur(4px)'; strokeP(mx, toMG, MG, p, 5); mx.strokeStyle = '#f00'; mx.filter = 'blur(.6px)'; strokeP(mx, toMG, MG, p, 1.5); mx.filter = 'none'; }); }
  const texOf = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.flipY = false; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8; return t; };
  const roadTex = texOf(roadCv), roadHTex = texOf(roadHCv), regTex = texOf(regCv), regHTex = texOf(regHCv), midTex = texOf(midCv);

  // ---------------------------------------------------------------- the terrain: one polar mesh round the hill out to 200 km, on the sphere
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;
  const terrU = { tRoad: { value: roadTex }, tRoadH: { value: roadHTex }, tReg: { value: regTex }, tRegH: { value: regHTex }, uRoadR: { value: ROADR }, uRegR: { value: REGR }, tMid: { value: midTex }, uMidR: { value: MIDR },
    uSkyW: { value: new THREE.Color(.4, .35, .3) }, uDetail: { value: 1 }, uGK: { value: 0 }, uSunW: { value: V(0, 1, 0) }, uF: { value: 0 }, uGlow: { value: 0 }, uHeadW: { value: 50 }, uFeet: { value: 0 } };
  {
    const NR = 452, NA = 768, r0 = .6, kR = Math.log(PATCH / r0) / (NR - 2);
    const nV = 1 + (NR - 1) * NA, pos = new Float32Array(nV * 3), colr = new Float32Array(nV * 3), wet = new Float32Array(nV), coast = new Float32Array(nV);
    const cLake = [.06, .08, .1];
    const setC = (i, x, z, y, w) => {
      let c; const xk0 = x / 1000, zk0 = z / 1000, rr0 = Math.hypot(x, z); coast[i] = rr0 < 2000 ? -50 : (inPoly(xk0, zk0, SEA_POLY) ? 1 : -1) * coastDist(xk0, zk0);
      if (w === 2) c = cLake;
      else { const xk = x / 1000, zk = z / 1000, msl = y + CREST, zs = tab(SPINE_Z, xk), zj = tab(RIFT_Z, xk), dc = coastDist(xk, zk);
        const desert = ss(zs + 2, zs + 9, zk) * (1 - ss(zj + 4, zj + 9, zk)) * (1 - ss(60, 110, xk)), plain = 1 - ss(10, 22, dc), green = ss(60, 120, xk) * (1 - desert);
        const n = fbm(x / 900, z / 900, 3);
        c = [.62 + .1 * n, .52 + .08 * n, .38 + .05 * n];                                     // limestone and dry grass
        c = c.map((v, k) => lerp(v, [.74, .62, .44][k], desert * .8));                       // the wilderness of Judea, paler
        c = c.map((v, k) => lerp(v, [.5, .5, .33][k], plain * .7 + green * .6));             // plains and Galilee, a little green
        if (msl < -300) c = c.map((v, k) => lerp(v, [.66, .58, .46][k], .7)); }
      colr.set(c, i * 3); wet[i] = LSD; };
    const v0 = V(); let i = 0, LSD = -50;
    { const y = H(0, 0); localToW(0, 0, y, v0); pos.set([v0.x, v0.y, v0.z], 0); setC(0, 0, 0, y, WATER); i = 1; }
    for (let ri = 1; ri < NR; ri++) { const r = r0 * Math.exp((ri - 1) * kR);
      for (let ai = 0; ai < NA; ai++, i++) { const a = ai / NA * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r, y = H(x, z), w = WATER; LSD = r > 2600 ? LAKESD : -50; localToW(x, z, y, v0); pos.set([v0.x, v0.y, v0.z], i * 3); setC(i, x, z, y, w); } }
    const idx = new Uint32Array(NA * 3 + (NR - 2) * NA * 6); let k = 0;
    for (let ai = 0; ai < NA; ai++) { idx[k++] = 0; idx[k++] = 1 + (ai + 1) % NA; idx[k++] = 1 + ai; }
    for (let ri = 1; ri < NR - 1; ri++) for (let ai = 0; ai < NA; ai++) { const a0 = 1 + (ri - 1) * NA, a1 = a0 + NA, p = a0 + ai, q = a0 + (ai + 1) % NA, p2 = a1 + ai, q2 = a1 + (ai + 1) % NA; idx[k++] = p; idx[k++] = q; idx[k++] = p2; idx[k++] = q; idx[k++] = q2; idx[k++] = p2; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(colr, 3)); g.setAttribute('aWet', new THREE.BufferAttribute(wet, 1)); g.setAttribute('aCoast', new THREE.BufferAttribute(coast, 1)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 1, metalness: 0 });
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, terrU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aWet, aCoast; varying float vWet, vCoast; varying vec3 vWP; varying vec3 vWN;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvWet = aWet; vCoast = aCoast; vWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
          uniform sampler2D tRoad, tRoadH, tReg, tRegH, tLand, tMid; uniform float uMidR, uNM; uniform vec3 uN0, uU0, uE0; uniform float uHazeL; uniform float uRoadR, uRegR, uDetail, uGK, uF, uGlow, uHeadW, uFeet; uniform vec3 uSkyW, uSunW; varying float vWet, vCoast; varying vec3 vWP; varying vec3 vWN;
          float wetF(){ return max(smoothstep(-.2, .2, vWet), smoothstep(-.25, .25, vCoast)); }
          ${hashGLSL}
          ${E.SHADE_GLSL}
          // the light along the roads: dark until the front reaches the point (distance from the hill × 1.15 ≈ along the road),
          // a brighter head at the front, the track itself bright, the dust round it glowing, the towns' lamps a soft pool
          vec3 roadGlow(){
            if (uGlow <= 0.) return vec3(0.);
            vec2 q = vWP.xz; float r = length(q), dd = r * 1.15, bh = uF - dd;
            float on = smoothstep(0., max(4., dd * .05), bh); if (on <= 0.) return vec3(0.);
            float head = exp(-bh / max(uHeadW, 1.));
            vec2 ru = (q + uRoadR) / (2. * uRoadR), gu = (q + uRegR) / (2. * uRegR);
            float core = 0., halo = 0.;
            if (ru.x > 0. && ru.x < 1. && ru.y > 0. && ru.y < 1.) { core = smoothstep(.8, 1., texture2D(tRoad, ru).r); halo = texture2D(tRoadH, ru).g; }
            float wN = smoothstep(2300., 2900., r), cd = length(cameraPosition - vWP);
            vec4 rg = texture2D(tReg, gu), rh = texture2D(tRegH, gu);
            vec2 mu2 = (q + uMidR) / (2. * uMidR); vec4 mg = texture2D(tMid, mu2); float wR = smoothstep(50000., 58000., r);
            float coreF = mix(smoothstep(.3, .9, mg.r) * smoothstep(1200., 4000., cd), smoothstep(.25, .85, rg.r) * (1. - .7 * smoothstep(3e4, 2e5, cd)), wR);
            float haloF = mix(mg.g * .7 * smoothstep(3e3, 3e4, cd), rh.g * smoothstep(4e3, 4e4, cd), wR);
            core = mix(core, coreF, wN); halo = mix(halo * .6, haloF, wN); float town = rh.b * wN;
            float far = smoothstep(3000., 40000., r);                                      // far roads are seen from high up: broader light
            town *= smoothstep(2500., 25000., cd);
            return vec3(1., .64, .3) * (core * mix(.2, .75, far) * mix(.6, 1., smoothstep(30., 400., cd)) + halo * mix(.05, .6, far) + town * .0) * on * (.55 + .6 * head) * uGlow;
          }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          { vec2 q = vWP.xz; float dist = length(vWP - cameraPosition);
            float det = uDetail * (1. - smoothstep(600., 4000., dist));                  // fine detail only near (no far shimmer)
            float slope = 1. - clamp(vWN.y, 0., 1.);
            vec3 c = diffuseColor.rgb;
            if (vWet < .5) {
              float n = fb(q * .045), f = fb(q * .7), g = fb(q * 3.1);
              c *= mix(1., mix(.86, 1.1, n) * mix(.93, 1.05, f), det);
              c = mix(c, c * vec3(.62, .68, .5), smoothstep(.55, .75, fb(q * .9 + 4.)) * det * .55);               // dry grass, darker patches
              c = mix(c, vec3(.82, .76, .66), smoothstep(.05, .35, slope) * smoothstep(.55, .7, fb(q * .35 + 9.)) * .45); // limestone outcrops on the slopes
              float grove = smoothstep(.62, .7, vn(q * .16 + 2.3)) * smoothstep(.35, .8, fb(q * .012 + 1.)) * (1. - smoothstep(1800., 6000., length(vWP.xz)));
              c = mix(c, vec3(.27, .29, .2), grove * .6 * smoothstep(.3, .85, vn(q * .9)));                      // olive groves seen from far: dark dots
              c = mix(c, c * vec3(1.12, 1.06, .96) + .03, smoothstep(.62, .78, fb(q * 1.6 + 2.)) * .18 * det);      // pale stony ground
              c = mix(c, vec3(.4, .36, .3), smoothstep(.74, .8, fb(q * 2.4 + 7.)) * det * .5);                      // scattered stones
              vec2 ru = (vWP.xz + uRoadR) / (2. * uRoadR);
              if (ru.x > 0. && ru.x < 1. && ru.y > 0. && ru.y < 1.) { float rd = texture2D(tRoad, ru).r; c = mix(c, vec3(.8, .7, .54) * (.9 + .15 * g), rd * .8); }
            } else c *= .9 + .1 * vn(q * .002);
            c = mix(c, vec3(.05, .075, .1) * (.9 + .1 * vn(q * .002)), wetF());
            diffuseColor.rgb = c; }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { float wf = wetF(); vec3 v = normalize(cameraPosition - vWP); float fr = pow(1. - clamp(v.y, 0., 1.), 4.); totalEmissiveRadiance += uSkyW * (.015 + .1 * fr) * wf; }`)
        .replace('#include <fog_fragment>', `if (uGK > 0.) { vec3 n = normalize(vWP - vec3(0., -${E.R_E.toFixed(1)}, 0.)), v = normalize(cameraPosition - vWP); float mu = max(dot(n, v), 0.), ms = min(dot(n, uSunW), uNM);
            vec3 pp = n.x * uN0 + n.y * uU0 + n.z * uE0; float lat = asin(clamp(pp.z, -1., 1.)), lon = atan(pp.y, pp.x);
            vec2 uv = vec2((lon + 3.14159265) / 6.2831853, (lat + 1.5707963) / 3.14159265);
            float land = smoothstep(.38, .62, texture2D(tLand, uv).r), rel = vn(uv * vec2(900., 450.)) * .6 + vn(uv * vec2(2400., 1200.)) * .4;
            float latd = abs(lat) * 57.3, grn = clamp(smoothstep(38., 52., latd) + (1. - smoothstep(8., 18., latd)) * .9, 0., 1.) * (.6 + .4 * vn(uv * vec2(60., 30.)));
            vec3 gc = eShade(ms, land, rel, grn, 0.);   // (the patch is tiny against the terminator: no warm terminator line flashing over it)
            float hz = 1. - exp(-length(cameraPosition - vWP) / uHazeL); gc = mix(gc, eHaze(ms), clamp(hz * .12 + pow(1. - mu, 9.) * .6, 0., 1.));
            gl_FragColor.rgb = mix(gl_FragColor.rgb, gc, uGK); }
          gl_FragColor.rgb += roadGlow() + vec3(1., .7, .38) * uFeet * exp(-length(vWP.xz - vec2(.6, .4)) / 2.6) * .9;
          #include <fog_fragment>`); };
    m.customProgramCacheKey = () => 'ol-terrain-r2';
    const terr = new THREE.Mesh(g, m); terr.receiveShadow = terr.castShadow = true; terr.frustumCulled = false; S.add(terr);
  }
  function localToW(x, z, y, out) { return E.localToWorld(x, z, y, out); }

  // ---------------------------------------------------------------- materials
  const wallM = (base, key, { win = 0 } = {}) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .92 });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvec4 wp4 = vec4(transformed, 1.);\n#ifdef USE_INSTANCING\nwp4 = instanceMatrix * wp4;\n#endif\nvWP = (modelMatrix * wp4).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + hashGLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 N = normalize(vWN); vec2 q = abs(N.y) > .7 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
            float big = fb(q * .08 + 3.1), fine = fb(q * .9), course = smoothstep(.42, .5, fract(q.y * 1.1 + floor(q.x * .55) * .37)) * (1. - abs(N.y));
            vec3 c = diffuseColor.rgb * mix(.84, 1.1, big) * mix(.93, 1.05, fine) * (1. - course * .06);
            c *= mix(1., .84, smoothstep(.62, .8, fb(vec2(q.x * 1.2, q.y * .15))) * (1. - abs(N.y)));
            ${win ? `{ float side = 1. - abs(N.y); vec2 cell = vec2(q.x * .32, q.y * .3); vec2 f = fract(cell), ci = floor(cell);
              vec2 fw = max(fwidth(cell), vec2(1e-4)); float aa = clamp(max(fw.x, fw.y) * 3.5, 0., 1.);
              float hx = smoothstep(.38 - fw.x, .38 + fw.x, f.x) * (1. - smoothstep(.62 - fw.x, .62 + fw.x, f.x)), hy = smoothstep(.35 - fw.y, .35 + fw.y, f.y) * (1. - smoothstep(.7 - fw.y, .7 + fw.y, f.y));
              float hole = mix(hx * hy * step(.55, hh(ci + 7.)), .038, aa) * side;   // small dark openings: doors and windows (filtered, no shimmer far off)
              c *= 1. - hole * .72; }` : ''}
            diffuseColor.rgb = c; }`); };
    m.customProgramCacheKey = () => 'ol-wall-' + key; return m; };
  const M = { stone: wallM('#dcc8a2', 'a'), stone2: wallM('#c9b08a', 'b'), pale: wallM('#efe6d2', 'c'), house: wallM('#d4be98', 'h', { win: 1 }), house2: wallM('#c4a47e', 'h2', { win: 1 }),
    dark: K.std('#1c140e', { roughness: 1 }), shade: K.std('#3a2e24', { roughness: 1 }), roof: K.std('#9c8a6c', { roughness: .95 }), gold: K.std('#d2a650', { roughness: .4, metalness: .45 }),
    wood: K.std('#5a4028', { roughness: .9 }), leaf: K.std('#6c7458', { roughness: .9 }), leafD: K.std('#565e46', { roughness: .9 }), trunk: K.std('#4a3a2a', { roughness: .95 }), rock: wallM('#a89a84', 'r') };
  const place = (o, x, z, dy = 0) => { o.position.set(x, H(x, z) + dy, z); S.add(o); return o; };
  const box = (w, h, d, x, z, mat, { y = null, ry = 0, cast = true } = {}) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); b.position.set(x, (y ?? H(x, z)) + h / 2, z); b.rotation.y = ry; b.castShadow = cast; b.receiveShadow = true; S.add(b); return b; };

  const nBeforeCity = S.children.length;
  // ---------------------------------------------------------------- Jerusalem (from the Mount: the east wall over the Kidron, the Temple, the Antonia)
  const CITY = [[330, -700], [120, -705], [-150, -700], [-420, -690], [-560, -1150], [-430, -1650], [60, -1750], [300, -1350]];   // x north, z east
  const TMB = { x0: -150, x1: 170, z0: -985, z1: -705, top: -30 };   // the Temple Mount's platform
  const inCity = (x, z) => inPoly(x, z, CITY);
  // walls with towers and a toothed top
  { const crenG = new THREE.BoxGeometry(1.3, 1.5, 1.3), cren = []; const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
    for (let i = 0; i < CITY.length; i++) { const [ax, az] = CITY[i], [bx, bz] = CITY[(i + 1) % CITY.length], L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az);
      const n = Math.ceil(L / 30);
      for (let j = 0; j < n; j++) { const k0 = j / n, k1 = (j + 1) / n, x = lerp(ax, bx, (k0 + k1) / 2), z = lerp(az, bz, (k0 + k1) / 2), y = Math.min(H(lerp(ax, bx, k0), lerp(az, bz, k0)), H(lerp(ax, bx, k1), lerp(az, bz, k1))) - 3;
        const wl = L / n + .5, wh = 16 + (x > -160 && x < 175 && az > -720 ? 8 : 0); const w = box(3.6, wh, wl, x, z, M.stone2, { y }); w.rotation.y = ry;
        for (let c = 0; c < wl / 2.6; c++) { const kk = (c + .5) / (wl / 2.6) - .5; cren.push(m4.compose(V(x + Math.sin(ry) * kk * wl, y + wh + .7, z + Math.cos(ry) * kk * wl), q4.setFromEuler(new THREE.Euler(0, ry, 0)), V(1, 1, 1)).clone()); } }
      for (let j = 0; j <= Math.floor(L / 75); j++) { const k = j / Math.max(1, Math.floor(L / 75)), x = lerp(ax, bx, k), z = lerp(az, bz, k), y = H(x, z) - 3;
        box(9, 26, 9, x, z, M.stone, { y }).rotation.y = ry; box(10.4, 1.4, 10.4, x, z, M.stone2, { y: y + 26 }).rotation.y = ry;   // a tower and its cornice
        for (const [dx, dz] of [[-4, -4], [4, -4], [-4, 4], [4, 4], [0, -4], [0, 4], [-4, 0], [4, 0]]) cren.push(m4.compose(V(x + dx * Math.cos(ry) + dz * Math.sin(ry), y + 28.1, z - dx * Math.sin(ry) + dz * Math.cos(ry)), q4.setFromEuler(new THREE.Euler(0, ry, 0)), V(1.1, 1.4, 1.1)).clone()); } }
    const inst = new THREE.InstancedMesh(crenG, M.stone2, cren.length); cren.forEach((mm, i) => inst.setMatrixAt(i, mm)); inst.castShadow = inst.receiveShadow = true; S.add(inst); }
  // the Temple Mount: retaining walls, the paved court, the porticoes (Solomon's Porch along the east side, facing us: a deep shade
  // under a long roof), the Royal Stoa on the south side, the inner courts, the white and gold sanctuary facing east
  { const { x0, x1, z0, z1, top } = TMB, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, base = -56;
    box(x1 - x0, top - base, z1 - z0, cx, cz, M.stone, { y: base });
    box(26, 20, z1 - z0 - 10, x0 + 13, cz, M.pale, { y: top });  box(20, 7, z1 - z0 - 14, x0 + 12, cz, M.dark, { y: top + 2, cast: false }).position.x = x0 + 25.6;   // the Royal Stoa and its shaded colonnade
    box(x1 - x0 - 30, 1.6, 14, cx + 6, z1 - 9, M.pale, { y: top + 11 }); box(x1 - x0 - 32, 10.5, 9, cx + 6, z1 - 10, M.shade, { y: top, cast: false });   // Solomon's Porch: roof and shade
    for (let i = 0; i < 26; i++) box(1.2, 10.6, 1.2, x0 + 22 + i * ((x1 - x0 - 34) / 25), z1 - 4.6, M.pale, { y: top });                                  // its front columns
    box(14, 1.6, z1 - z0 - 40, x1 - 8, cz, M.pale, { y: top + 10 });                                                                                   // the north portico
    for (const [w, d, x, z] of [[104, 4, cx + 10, -800], [104, 4, cx + 10, -930], [4, 130, cx - 42, -865], [4, 130, cx + 62, -865]]) box(w, 13, d, x, z, M.pale, { y: top });   // the inner courts' walls
    box(30, 40, 64, cx + 10, -885, M.pale, { y: top });                 // the sanctuary
    box(46, 38, 12, cx + 10, -850, M.pale, { y: top });                 // the porch, facing east (toward the Mount) …
    box(60, 14, 12, cx + 10, -850, M.pale, { y: top + 38 });            // … wider above, as Herod's porch was
    box(61, 1.3, 12.8, cx + 10, -850, M.stone2, { y: top + 37.4 });     // the cornice between
    box(12, 26, .6, cx + 10, -843.7, M.dark, { y: top + 6, cast: false });   // its open doorway
    box(18, 2.4, .5, cx + 10, -843.6, M.gold, { y: top + 33, cast: false }); // the golden vine over the door
    for (const s of [-17, -10.5, 10.5, 17]) box(1.8, 33, .9, cx + 10 + s, -843.6, M.stone, { y: top + 1 });   // engaged columns
    box(61, 1.0, 12.6, cx + 10, -850, M.gold, { y: top + 52 }); box(31, .8, 64.4, cx + 10, -885, M.gold, { y: top + 40 });
    for (let i = 0; i < 9; i++) box(.5, 1.8, .5, cx + 10 - 28 + i * 7, -850, M.gold, { y: top + 53, cast: false });   // the golden spikes on the roof line
    box(9, 4, 9, cx + 10, -800, M.stone2, { y: top }); }                // the altar in the court (a dark square of stone)
  // the Antonia at the Temple Mount's north-west corner: a block with four towers, the south-east one taller; the Roman banners
  const AN = { x: 210, z: -960 };
  { box(64, 26, 46, AN.x, AN.z, M.stone, { y: -40 });
    for (const [dx, dz, h] of [[-30, 21, 52], [30, 21, 40], [-30, -21, 40], [30, -21, 40]]) { box(14, h, 14, AN.x + dx, AN.z + dz, M.stone2, { y: -40 }); box(15.6, 1.4, 15.6, AN.x + dx, AN.z + dz, M.stone, { y: -40 + h }); } }
  // banners: deep red cloth with a gold edge, rippling in the wind (vertex wave, pure in t); hung on the Antonia's east face and towers
  const banU = { uT: { value: 0 }, uGust: { value: 0 } };
  const banM = new THREE.MeshStandardMaterial({ color: '#a01e16', roughness: .75, side: THREE.DoubleSide, emissive: new THREE.Color('#3a0805') });
  banM.onBeforeCompile = sh => { Object.assign(sh.uniforms, banU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT, uGust; varying vec2 vUv2;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vUv2 = uv; float hang = 1. - uv.y; float ph = position.x * .9 + modelMatrix[3][0] * .13;
        transformed.z += (sin(hang * 4.2 - uT * 2.3 + ph) * .35 + sin(hang * 9. - uT * 3.7 + ph * 1.7) * .12) * hang * (1. + 1.6 * uGust);
        transformed.x += sin(hang * 3. - uT * 1.7 + ph) * .12 * hang * (1. + uGust);`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vUv2;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        { float edge = step(vUv2.x, .09) + step(.91, vUv2.x) + step(vUv2.y, .05) + step(.93, vUv2.y); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.85, .6, .22), clamp(edge, 0., 1.) * .9); }`); };
  banM.customProgramCacheKey = () => 'ol-banner';
  const banners = [];
  const banner = (w, h, x, y, z, ry = 0) => { const g = new THREE.PlaneGeometry(w, h, 6, 20); g.translate(0, -h / 2, 0); const b = new THREE.Mesh(g, banM); b.position.set(x, y, z); b.rotation.y = ry; b.castShadow = true; S.add(b); banners.push(b); return b; };
  banner(6, 17, AN.x - 12, -15, AN.z + 23.4); banner(6, 17, AN.x + 8, -15, AN.z + 23.4); banner(6.5, 22, AN.x - 30, 10, AN.z + 28.4);
  { const onWall = (x, ai, extra) => { const [ax, az] = CITY[ai], [bx, bz] = CITY[ai + 1], k = (x - ax) / (bx - ax), z = lerp(az, bz, k), y = Math.min(H(ax, az), H(bx, bz)) - 3 + 16 + extra;
      return [x, Math.min(y, H(x, z) - 3 + 16 + extra) - .4, z + 2.0]; };
    banner(5, 12, ...onWall(250, 0, 0)); banner(5, 14, ...onWall(-20, 1, 8)); banner(5, 14, ...onWall(80, 1, 8)); }
  // the standards on the towers: a pole, a crossbar, a square red cloth and a gold disc above
  for (const [x, y, z] of [[AN.x - 30, 13.4, AN.z + 21], [AN.x + 30, 1.4, AN.z + 21], [AN.x - 30, 1.4, AN.z - 21], [AN.x + 30, 1.4, AN.z - 21]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, 13, 6), M.wood); pole.position.set(x, y + 6.5, z); S.add(pole);
    const disc = new THREE.Mesh(new THREE.SphereGeometry(1.0, 10, 8), M.gold); disc.position.set(x, y + 13.6, z); S.add(disc);
    banner(4.2, 4.4, x, y + 12, z + .3); }
  // the houses: flat-roofed blocks of two stones, packed, rising west; upper rooms, parapets, small dark openings; instanced
  { const r = rng(808), hg = new THREE.BoxGeometry(1, 1, 1), A = [[], []], C = [[], []], up = [], par = []; const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
    let n = 0; while (A[0].length + A[1].length < 3600 && n++ < 50000) { const x = -560 + r() * 880, z = -700 - r() * 1060; if (!inCity(x, z)) continue;
      if (x > TMB.x0 - 6 && x < TMB.x1 + 6 && z < TMB.z1 + 6 && z > TMB.z0 - 6) continue; if (Math.hypot(x - AN.x, z - AN.z) < 50) continue;
      if (Math.abs(z + 700) < 12 || Math.abs(z + 1750 - (x + 430) * .2) < 10) continue;
      const w = 6 + r() * 7, d = 6 + r() * 7, h = 4.5 + r() * 4.5 + (r() < .14 ? 4.5 : 0), y = H(x, z) - 1.5, ry = .08 * (r() - .5), q = q4.setFromEuler(new THREE.Euler(0, ry, 0)).clone(), k = r() < .62 ? 0 : 1;
      A[k].push(m4.compose(V(x, y + h / 2, z), q, V(w, h, d)).clone()); const b = .84 + r() * .24; C[k].push(new THREE.Color(b, b * (.95 + r() * .06), b * (.88 + r() * .1)));
      if (r() < .3) { const uw = w * (.35 + r() * .2), ud = d * (.35 + r() * .2); up.push(m4.compose(V(x + (r() - .5) * w * .3, y + h + 1.6, z + (r() - .5) * d * .3), q, V(uw, 3.2, ud)).clone()); }
      if (r() < .55) par.push(m4.compose(V(x, y + h + .35, z), q, V(w + .3, .7, d + .3)).clone()); }
    A.forEach((L, k) => { const inst = new THREE.InstancedMesh(hg, k ? M.house2 : M.house, L.length); L.forEach((mm, i) => { inst.setMatrixAt(i, mm); inst.setColorAt(i, C[k][i]); }); inst.castShadow = inst.receiveShadow = true; S.add(inst); });
    for (const [L, m] of [[up, M.house], [par, M.stone2]]) { const inst = new THREE.InstancedMesh(hg, m, L.length); L.forEach((mm, i) => inst.setMatrixAt(i, mm)); inst.castShadow = inst.receiveShadow = true; S.add(inst); } }
  // Herod's palace towers on the west wall
  for (const [x, z, h] of [[40, -1735, 42], [10, -1730, 36], [-20, -1726, 32]]) { box(13, h, 13, x, z, M.stone); box(14.6, 1.4, 14.6, x, z, M.stone2, { y: H(x, z) + h }); }

  const CITYOBJ = S.children.slice(nBeforeCity);   // round 5: faded out from the air (a grey slab from above); the lamps carry the city
  const CITYMAT = [...new Set(CITYOBJ.map(o => o.material).filter(Boolean))]; CITYMAT.forEach(m => { m.transparent = true; });
  // ---------------------------------------------------------------- olive trees on the Mount (near ones in 3D; far groves are dots in the terrain)
  // ---------------------------------------------------------------- olive trees on the Mount (near ones in 3D; far groves are dots in the terrain)
  const olive = (x, z, h, seed) => { const tr = K.tree({ seed, height: h, trunk: .22, depth: 4, spread: .75, up: .2, twig: 0, mat: M.trunk, layer: 0 }); tr.position.set(x, H(x, z) - .1, z); S.add(tr);
    const r = rng(seed), n = 420, geo = new THREE.IcosahedronGeometry(.2, 1), inst = new THREE.InstancedMesh(geo, r() < .5 ? M.leaf : M.leafD, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.pow(r(), .7) * h * .5, y = H(x, z) + h * (.48 + r() * .4) - rr * .25; m4.compose(V(x + Math.cos(a) * rr, y, z + Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * .6, r() * 3, r() * .6)), V(1.4, .55, 1).multiplyScalar(.55 + r() * .8)); inst.setMatrixAt(i, m4); }
    inst.castShadow = true; inst.receiveShadow = true; S.add(inst); };
  // (kept off the skyline behind the group in the first view (north, 60–125°) and off the far horizon after the turn (≈ 40–58°))
  for (const [hdg, dist, h] of [[-38, 30, 5.2], [-27, 52, 6], [-55, 22, 4.6], [27, 30, 5.4], [64, 46, 5.6], [-80, 38, 5.6], [205, 34, 5], [240, 28, 4.8], [-110, 48, 5.8], [-20, 95, 6.2], [34, 64, 6]]) {
    const hh = ((hdg % 360) + 360) % 360; if (hh > 170 && hh < 350 && dist < 44) continue;   // round 2: the arc passes south of the group
    const p = hd(hdg).multiplyScalar(dist); olive(p.x, p.z, h, (hdg * 7 + dist) | 0); }
  // groves down the west face and along the ridge (instanced clumps: a dark crown on a short trunk), kept off the paths
  { const r = rng(4411), geo = new THREE.IcosahedronGeometry(1, 1), items = []; const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
    const nearPath = (x, z) => { for (const k in PATHS) { const p = PATHS[k]; for (let i = 0; i + 1 < p.length; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, kk = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz + 1e-6)); if (Math.hypot(x - ax - dx * kk, z - az - dz * kk) < 9) return true; } } return false; };
    let n = 0; while (items.length < 700 && n++ < 60000) { const a = r() * 6.283, d = 70 + Math.pow(r(), 1.4) * 1900, x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (inCity(x, z) || nearPath(x, z) || vnoise(x * .012 + 3, z * .012) < .45) continue;
      { const hdg = Math.atan2(x, -z) / D2R; if (hdg > 32 || hdg < -75 || d > 900) continue; }   // open skyline behind the group (north) and toward the far horizon
      const s = 1.6 + r() * 1.1, y = H(x, z); items.push(m4.compose(V(x, y + s * .9, z), q4.setFromEuler(new THREE.Euler(0, r() * 6, 0)), V(s, s * .72, s)).clone()); }
    const inst = new THREE.InstancedMesh(geo, M.leaf, items.length); items.forEach((mm, i) => inst.setMatrixAt(i, mm)); inst.castShadow = true; inst.receiveShadow = true; S.add(inst); }
  // Bethany behind the hill: a few houses (seen as the camera rises)
  { const r = rng(77); for (let i = 0; i < 26; i++) { const x = -820 + (r() - .5) * 180, z = 1700 + (r() - .5) * 160; box(6 + r() * 4, 4 + r() * 3, 6 + r() * 4, x, z, M.house, { y: H(x, z) - 1 }); } }

  // ---------------------------------------------------------------- the people: the eleven round the one man — a knot, not a row
  const skinM = K.std('#7a5236', { roughness: .8 }), hairM = K.std('#1e150f', { roughness: 1 });
  const mat = c => K.std(c, { roughness: .95, side: THREE.DoubleSide });
  const JX = 1.1, JZ = .7;
  const kingM = mat('#b9a88a'), kingC = mat('#8c7a5e');     // the same plain undyed robe and darker head cloth as in part 2 — no mark, no glow
  const king = P.robeMan({ h: 1.76, mat: kingM, cloth: kingC, skin: skinM, head: 'cloth' }); P.headwear(king, 'cloth', { dark: hairM }); place(king, JX, JZ); king.userData.ph = .37;
  // [x north, z east, 'stand'|'rock', head, height, broad, robe, mantle, facing ('J' him | 'C' the Antonia | heading), seat height]
  const CAST = [
    [2.9, -2.6, 'stand', 'cloth', 1.76, 1.07, '#6e5a44', '#4a3e30', 0],          // 0 Peter: points at the city
    [2.1, -.9, 'stand', 'turban', 1.72, 1.0, '#5e5a48', '#8a7454', 'J'],          // 1 asks (Q6) with an open hand
    [3.05, 1.05, 'rock', 'hood', 1.7, 1.02, '#7c6650', '#5a4a3a', 'J', .46],      // 2 sits on a rock
    [-2.35, .45, 'rock', 'bare', 1.74, 1.04, '#4e5258', '#6a5844', 'J', .42],     // 3 sits, bare-headed
    [-1.7, -3.55, 'rock', 'cloth', 1.68, .98, '#7d5a3e', '#4c4440', 'C', .36],    // 4 sits low, forearms on his knees, toward the city
    [-3.05, -.95, 'stand', 'hood', 1.78, 1.05, '#665848', '#3e3a36', 'J'],        // 5 leans on a staff
    [.95, -3.25, 'stand', 'turban', 1.7, .96, '#8a7356', '#55606a', 'C'],         // 6
    [3.65, -2.45, 'stand', 'cloth', 1.75, 1.03, '#5d4c3c', '#746450', 'C'],       // 7 his hand on his chest
    [-.55, -4.95, 'stand', 'bare', 1.69, .97, '#6a5a4a', '#5f503e', 'C'],         // 8 hands clasped behind his back
    [2.55, 2.75, 'stand', 'hood', 1.73, 1.0, '#806c52', '#4a4440', 'J'],          // 9
    [-.9, 4.6, 'stand', 'cloth', 1.78, 1.06, '#5a5048', '#6a5a46', 'C'],          // 10 turns from the walls to the far horizon (N28c)
  ];
  const AN0 = { x: 210, z: -960 };
  for (const c of CAST) { c[0] *= .88; c[1] *= .84; }   // a knot
  const men = CAST.map(([x, z, kind, head, h, b, robe, mant, face, seat], i) => {
    const g = P.robeMan({ h, broad: b, mat: mat(robe), cloth: mat(mant), skin: skinM, head: head === 'hood' ? 'hood' : 'cloth' });
    P.headwear(g, head === 'turban' || head === 'bare' ? head : 'cloth', { mat: mat(mant), dark: hairM });
    const h0 = face === 'J' ? headingTo(x, z, JX, JZ) : face === 'C' ? headingTo(x, z, AN0.x, AN0.z) : face;
    place(g, x, z); g.rotation.y = yawOf(h0);
    const U = g.userData; Object.assign(U, { ph: (i * .618 + .13) % 1, h0, x0: x, z0: z, kind, seat: seat || 0, i });
    if (kind === 'rock') { const bk = hd(h0).multiplyScalar(-.06), rk = P.rock(M.rock, { w: .78, d: .62, top: seat, seed: i * 3 + 1 }); rk.position.set(x + bk.x, H(x, z), z + bk.z); rk.rotation.y = i * 1.7; S.add(rk); }
    U.arms.forEach(A => A.fo.scale.set(.74, 1, .74));
    return g; });
  // the order heads turn after Peter's arm: by distance from him, with a little of each man's own hesitation
  men.forEach((g, i) => { const U = g.userData; U.dl = i === 0 ? 0 : .25 + Math.hypot(U.x0 - CAST[0][0], U.z0 - CAST[0][1]) * .2 + ((i * .37) % .3); });
  // 5's staff: planted a little forward of his right foot, his right hand round it (BODY-CHECK §4: the hand at the grip)
  { const g = men[5], U = g.userData, s = U.s, B0 = V(.36 * s, 0, -.34 * s), G0 = V(.3 * s, 1.08 * s, -.2 * s), dir = G0.clone().sub(B0).normalize();
    const st = new THREE.Mesh(new THREE.CylinderGeometry(.018, .024, 1.9, 7), M.wood); st.position.copy(B0).addScaledVector(dir, .95); st.quaternion.setFromUnitVectors(V(0, 1, 0), dir); st.castShadow = true; g.add(st); U.grip = G0; }
  // who walks out along which road when the light runs (Q6a): [man, heading of his road]
  const WALKERS = [[6, 355], [8, 276], [1, 92], [9, 140]];
  const wrapD = a => ((a + 540) % 360) - 180;
  const blendH = (a, b, k) => a + wrapD(b - a) * k;
  const shoulder = (g, sd) => { const U = g.userData; return V(sd * .235 * U.s, U.hipY + U.torsoH - .04 * U.s, 0); };
  const restHand = (g, sd) => { const U = g.userData, Sh = shoulder(g, sd), r = (U.la + U.lb) * .96; return Sh.add(V(sd * Math.sin(.1) * r, -Math.cos(.1) * r, -.04)); };
  const toRoot = (g, w) => w.clone().applyAxisAngle(V(0, 1, 0), -g.rotation.y);
  // turning in place: small steps (one foot lifts, then the other) under the robe — the feet never slide
  const stepFeet = (g, k01) => { const U = g.userData, u = clamp(k01), l0 = Math.max(0, Math.sin(clamp(u * 2) * Math.PI)), l1 = Math.max(0, Math.sin(clamp(u * 2 - 1) * Math.PI));
    return [{ u: .09 * U.s, lift: .04 * l0 }, { u: -.07 * U.s, lift: .04 * l1 }]; };
  const HORIZON = 78;   // the far horizon he turns to (north-north-west: Samaria, and on to the ends of the earth)
  function people(t) {
    const tT = T, k = (t0, U, d = .95) => ss(t0 + U.dl, t0 + U.dl + d, t);
    // the one man: alive, still; he listens (head to whoever speaks), and at N28c his right hand opens toward the far horizon
    { const U = king.userData, s = U.s, tk = (t - tT.open[0]) / (tT.turn[1] - tT.open[0]), body = lerp(328, 18, eio(tk));
      king.rotation.y = yawOf(body);
      const id = P.idle(t, U.ph, { s }), gk = eio((t - tT.open[0]) / (tT.open[1] - tT.open[0])) * (1 - eio((t - tT.crane - 1.2) / 1.8));
      let hw = blendH(blendH(headingTo(JX, JZ, CAST[0][0], CAST[0][1]), headingTo(JX, JZ, CAST[1][0], CAST[1][1]), ss(tT.ask[0], tT.ask[1], t)), HORIZON, ss(tT.open[0], tT.open[1] + .5, t));
      const hy = clamp(wrapD(hw - body) * D2R, -1.1, 1.1);
      const Sh = shoulder(king, 1), dirR = toRoot(king, hd(HORIZON)), hand = Sh.clone().addScaledVector(dirR, (U.la + U.lb) * .78).add(V(0, -.16 * s, 0));
      P.pose(king, { ...id, feet: stepFeet(king, tk), head: [-.03 + .02 * Math.sin(t * .4), hy * .8], twist: id.twist + hy * .15, hands: [null, restHand(king, 1).lerp(hand, gk)] }); }
    const ant = V(AN0.x - 12, -10, AN0.z + 20);
    men.forEach((g, i) => { const U = g.userData, s = U.s;
      const wk = WALKERS.find(w => w[0] === i), wi = WALKERS.findIndex(w => w[0] === i);
      if (wk && t > tT.walk + wi * .45) {   // walks out along his road: turns toward it, then real steps (planted feet)
        const t0 = tT.walk + wi * .45, tk = eio((t - t0) / .9), hdg = blendH(U.h0, wk[1], tk);
        g.rotation.y = yawOf(hdg); const w = P.walk(g, t, t0 + .6, { T: 1.12, L: .5 }); const dir = hd(wk[1]);
        g.position.set(U.x0 + dir.x * w.dist, 0, U.z0 + dir.z * w.dist); g.position.y = H(g.position.x, g.position.z);
        P.pose(g, t > t0 + .6 ? { ...w, breath: .5, head: [0, 0] } : { ...P.idle(t, U.ph, { s }), feet: stepFeet(g, tk), head: [0, 0] }); return; }
      g.position.set(U.x0, H(U.x0, U.z0), U.z0);
      // the body: 10 turns to the far horizon at N28c (eased, small steps); the rest stay where they are
      const tk = (t - tT.turn[0]) / (tT.turn[1] - tT.turn[0]), body = i === 10 ? lerp(U.h0, HORIZON, eio(tk)) : U.h0; g.rotation.y = yawOf(body);
      const sit = U.kind === 'rock', id = P.idle(t, U.ph, { s });
      const base = sit ? { ...id, ...P.rockSit(U.seat, s, { lean: i === 4 ? -.3 : -.08 }), side: id.side * .4 } : id;
      if (i === 10) base.feet = stepFeet(g, tk);
      // where the head looks: him (they were talking) → the walls after Peter's arm, one after another → (some) back to him at the
      // question → the walls and banners → him as he speaks → the far horizon, one after another
      const pos = g.position, hJ = headingTo(pos.x, pos.z, JX, JZ), hC = headingTo(pos.x, pos.z, ant.x, ant.z);
      let hw = hJ + 8 * Math.sin(t * .23 + U.ph * 7);
      hw = blendH(hw, hC, k(tT.look1, U));
      if (i === 1 || i === 2 || i === 9 || i === 3) hw = blendH(hw, hJ, k(tT.ask[0] + .15, U) * (1 - k(tT.look2, U)));
      hw = blendH(hw, hC, k(tT.look2, U)); hw = blendH(hw, hJ, k(tT.look3, U, .8)); hw = blendH(hw, HORIZON, k(tT.look4, U, 1.1));
      if (i === 10) hw = blendH(hw, HORIZON, ss(tT.turn[0] - .3, tT.turn[0] + .6, t));   // his head leads the turn
      const rel = wrapD(hw - body) * D2R, tw = clamp(rel * .3, sit ? -.2 : -.34, sit ? .2 : .34), hy = clamp(rel - tw, -1.15, 1.15);
      const ex = { ...base, head: [(sit ? .02 : -.04) + .03 * Math.sin(t * .37 + U.ph * 5), hy + .04 * Math.sin(t * .31 + U.ph * 9)], twist: base.twist + tw };
      if (sit) ex.hands = i === 4 ? [V(-.1 * s, U.hipY + base.bob + .02 * s, -.5 * s), V(.12 * s, U.hipY + base.bob + .04 * s, -.48 * s)] : [P.kneeHand(g, -1, base), P.kneeHand(g, 1, base)];
      if (i === 0) {   // Peter: the arm comes up and points across the valley at the Antonia; half down while they talk; up again; down at N28c
        const up = eio((t - tT.point[0]) / (tT.point[1] - tT.point[0])), rel2 = 1 - .42 * eio((t - tT.relax[0]) / (tT.relax[1] - tT.relax[0])) * (1 - eio((t - tT.again[0]) / (tT.again[1] - tT.again[0])));
        const kk = up * rel2 * (1 - eio((t - tT.lower[0]) / (tT.lower[1] - tT.lower[0])));
        const Sh = shoulder(g, 1), dirW = ant.clone().sub(g.position.clone().add(V(0, 1.45, 0))).normalize(), dirR = toRoot(g, dirW), tip = Sh.clone().addScaledVector(dirR.clone().add(V(0, .32, 0)).normalize(), (U.la + U.lb) * .97);
        ex.hands = [null, restHand(g, 1).lerp(tip, kk)]; ex.twist += .1 * kk;
        const hW = wrapD(hC - body) * D2R; ex.head = [ex.head[0] + .02 * kk, lerp(ex.head[1], clamp(hW, -1, 1), clamp(kk * 1.3, 0, 1))]; }
      if (i === 1) { const kq = ss(tT.ask[0], tT.ask[1], t) * (1 - ss(tT.askOff[0], tT.askOff[1], t));   // the question: an open hand toward him
        const Sh = shoulder(g, -1), dirR = toRoot(g, V(JX - pos.x, 0, JZ - pos.z).normalize()), palm = Sh.clone().add(V(0, -.36 * s, 0)).addScaledVector(dirR, .38 * s);
        ex.hands = [restHand(g, -1).lerp(palm, kq), null]; ex.twist += .1 * kq; ex.lean = (ex.lean || 0) - .05 * kq; }
      if (i === 5) ex.hands = [null, U.grip.clone()];
      if (i === 7) ex.hands = [null, V(.06 * s, U.hipY + U.torsoH - .16 * s, -.2 * s)];
      if (i === 8) ex.hands = [V(.04 * s, U.hipY + .06 * s, .15 * s), V(-.04 * s, U.hipY + .08 * s, .16 * s)];
      P.pose(g, ex); });
  }

  // ---------------------------------------------------------------- dust in the low sun round the group (tens, slow closed drifts — no wrap, no popping)
  const dustU = { uT: { value: 0 }, uA: { value: 0 }, uPx: { value: Hh / 1920 } };
  { const n = 120, Rr = rng(57), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { const a = Rr() * 6.283, d = 2 + Rr() * 16; p[i * 3] = GC.x + Math.cos(a) * d; p[i * 3 + 1] = .3 + Rr() * 3.6; p[i * 3 + 2] = GC.z + Math.sin(a) * d; sd[i] = Rr(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx; varying float vA;
        void main(){ vec3 q = position; q.y += sin(uT * (.11 + .1 * aS) + aS * 40.) * .5; q.x += sin(uT * .23 + aS * 30.) * .6; q.z += cos(uT * .19 + aS * 17.) * .6;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (2. + 4. * aS) * 14. / d, 1., 10.); vA = clamp(1.3 - d / 30., 0., 1.) * (.35 + .65 * aS) * (.6 + .4 * sin(uT * .7 + aS * 21.)); }`,
      fragmentShader: `uniform float uA; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 14.); gl_FragColor = vec4(vec3(1., .84, .58) * 1.5, a * vA * uA); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; S.add(pts); }

  // ---------------------------------------------------------------- the light: lamps in Jerusalem, in the villages of Judea and Samaria, and the world's roads
  // every lamp's moment is its distance from the hill (× 1.15, ≈ along the roads) — the same front the terrain's road glow uses
  const lamps = [], far = [];
  const RD = (x, z) => Math.hypot(x, z) * 1.15;
  { const r = rng(901);
    let n = 0; while (lamps.length < 2400 && n++ < 60000) { const x = -560 + r() * 880, z = -700 - r() * 1060; if (!inCity(x, z)) continue;
      const y = H(x, z) + 3 + r() * 6; lamps.push({ p: localToW(x, z, y, V()), d: RD(x, z) + r() * 260, b: .35 + r() * .6, s: .6 + r() * .6, f: 220 }); }
    for (let i = 0; i < 40; i++) { const x = TMB.x0 + 20 + r() * 280, z = TMB.z1 - 10 - r() * 260; lamps.push({ p: localToW(x, z, TMB.top + 3, V()), d: RD(x, z) + r() * 120, b: 1.2, s: 1.2, f: 200 }); }   // torches on the Temple courts
  }
  { const r = rng(515);
    const hamlets = []; let n = 0; while (hamlets.length < 300 && n++ < 9000) { const a = r() * 6.283, d = 2500 + Math.pow(r(), 1.3) * 150000, x = Math.cos(a) * d, z = Math.sin(a) * d; H(x, z); if (WATER) continue; if (inCity(x, z)) continue; hamlets.push([[x, z], .5 + r() * .6]); }
    hamlets.push([[-820, 1700], 1.2], [[-200, 600], .5], [[900, 250], .6], [[1500, -900], .7], [[-1600, 900], .6]);
    for (const [[x, z], sz] of [...TOWNS.map(([p, s]) => [p, s * 1.4]), ...hamlets]) { const d0 = RD(x, z), nl = Math.round(6 + sz * 22), rad = 120 + sz * 260;
      for (let i = 0; i < nl; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * rad, xx = x + Math.cos(a) * rr, zz = z + Math.sin(a) * rr; const y = H(xx, zz); if (WATER) continue;
        lamps.push({ p: localToW(xx, zz, y + 3.5, V()), d: d0 + rr * 1.2 + r() * rad * 1.5, b: .45 + r() * .7, s: .75 + r() * .5, f: Math.max(260, d0 * .03) }); } } }
  // round 5: the city's own lamps (the first 2,440) in a mesh of their own — from high up they would draw the walls' outline as a
  // textured slab, so they give way to one soft warm glow over Jerusalem as the camera climbs
  const CLAMPS = E.lampPoints(lamps.slice(0, 2440), { px: 5.0, minPx: 1.4 }); CLAMPS.u.uRef.value = 900; S.add(CLAMPS.pts);
  const LAMPS = E.lampPoints(lamps.slice(2440), { px: 5.0, minPx: 1.4 }); LAMPS.u.uRef.value = 900; S.add(LAMPS.pts);
  const JGLOW = E.lampPoints([{ p: localToW(60, -1200, 200, V()), d: 0, b: 1.0, s: 4.2, f: 1 }], { px: 6, minPx: 1 }); JGLOW.u.uRef.value = 1e12; S.add(JGLOW.pts);
  // ---------------------------------------------------------------- the globe (round 3: Natural Earth 1:110m land, data/land-110m.js)
  const GL = E.buildGlobe({ polys: LANDP }); S.add(GL.mesh, GL.atm);
  Object.assign(terrU, { tLand: GL.u.tLand, uN0: GL.u.uN0, uU0: GL.u.uU0, uE0: GL.u.uE0, uHazeL: GL.u.uHazeL, uNM: GL.u.uNM });   // before the first render compiles the terrain

  // ---------------------------------------------------------------- round 4: the arcs as a tree over the night side (owner 2026-11-19: "완전 이상해 …
  // 호가 지구를 커버하는 느낌도 아니고 좀 엉망", "처음에 직선이 마구마구"). No arc flies before the whole globe is coming into view
  // (before that the spread is only the light on the real roads: Jerusalem → Judea → Samaria). Then, as a tree with its trunk at Jerusalem:
  //   wave 1  a few short hops round Jerusalem — a bright knot spreading;  wave 2  12 thick arcs to the first world (Rome, Corinth, Ephesus,
  //   Antioch, Alexandria, Carthage, Aksum, Arabia, Babylon, Persia, India, Armenia);  wave 3  from each of those landings 3–6 onward,
  //   so the branching shows, to every continent (Europe, Africa, Asia, Korea and Japan, the Americas, Australia);  wave 4 (N28b →)
  //   thinner arcs from those, like a mustard tree still growing. Each landing: a soft bloom that leaves a warm glow of lamps.
  const JER = [E.LL0[0], E.LL0[1]], R_E0 = E.R_E;
  const v3 = (lo, la) => E.llToWorld(lo, la, 0, V()).sub(V(0, -R_E0, 0)).normalize();
  const gcd = (a, b) => Math.acos(clamp(v3(...a).dot(v3(...b)), -1, 1)) * R_E0;
  const dest = (a, brg, d) => { const [l1, p1] = a.map(x => x * D2R), dr = d / R_E0, p2 = Math.asin(Math.sin(p1) * Math.cos(dr) + Math.cos(p1) * Math.sin(dr) * Math.cos(brg));
    const l2 = l1 + Math.atan2(Math.sin(brg) * Math.sin(dr) * Math.cos(p1), Math.cos(dr) - Math.sin(p1) * Math.sin(p2)); return [((l2 / D2R + 540) % 360) - 180, p2 / D2R]; };
  const surfY = (lo, la) => { if (E.gcDist(lo, la) < PATCH - 8000) { const [x, z] = LL(lo, la); return Math.max(H(x, z), -30); } return -30; };
  function arcPts(a, b) {   // a great circle lifted into a bow; the height grows with the length (seen in profile over the limb)
    const d = gcd(a, b), va = v3(...a), vb = v3(...b), om = Math.acos(clamp(va.dot(vb), -1, 1)), n = clamp(Math.round(d / 90000), 16, 96);
    const hTop = Math.min(1.0e6, d * (.08 + .08 * ss(2e5, 3e6, d))), ya = surfY(...a) + 200, yb = surfY(...b) + 200, P = [];
    for (let i = 0; i <= n; i++) { const s = i / n, k0 = Math.sin((1 - s) * om) / Math.sin(om || 1e-9), k1 = Math.sin(s * om) / Math.sin(om || 1e-9);
      const v = om < 1e-9 ? va.clone() : va.clone().multiplyScalar(k0).addScaledVector(vb, k1), y = lerp(ya, yb, s) + hTop * Math.sin(Math.PI * s);
      P.push(V(0, -R_E0, 0).addScaledVector(v, R_E0 + y)); }
    return P; }
  const ARCS = [], HUBS = [], cells = new Set(), rA = rng(2026);
  const cellOf = ([lo, la]) => `${Math.round(la / 2.6)}:${Math.round(lo * Math.cos(la * D2R) / 2.6)}`;
  function arc(a, b, t0, rank) { const d = gcd(a, b), Tf = .85 + 1.15 * Math.sqrt(d / 3e6), R = [null, [3.0, .45, 1.05], [4.4, .55, 1.15], [2.8, .38, 1.0], [1.7, .26, .85]][rank];
    ARCS.push({ a, b, t0, T: Tf, k: R[2], w: R[0], rest: R[1], d }); const h = { ll: b, t: t0 + Tf, rank, d }; HUBS.push(h); cells.add(cellOf(b)); return h; }
  const N = E.NODE;
  const W2 = { ROM: N.ROM, COR: N.COR, EPH: N.EPH, ANT: N.ANT, ALX: N.ALX, CAR: N.CAR, AXU: N.AXU, ADE: [45.0, 12.8], BAB: N.BAB, PER: N.PER, MUM: N.MUM, ARM: [44.5, 40.2] };
  const W3 = { ROM: [N.LON, N.PAR, N.MAD, N.LIS, N.BER], COR: [N.VIE, [30.5, 50.45], N.STO, [21.0, 52.2]], EPH: [N.CON, N.MOS, [26.1, 44.4], [30.7, 46.5]],
    ANT: [[32.85, 39.93], [44.8, 41.7], [49.1, 55.8]], ALX: [[32.5, 15.6], N.LAG, [15.0, 12.1], [-3.0, 16.8]], CAR: [N.NYC, N.RIO, N.DAK, N.MEX, N.BUE, N.LIM],
    AXU: [N.NAI, N.KIN, N.CAP, [47.5, -18.9], [13.2, -8.8]], ADE: [[39.2, -6.2], [58.4, 23.6], [46.7, 24.7], [45.3, 2.0]], BAB: [[51.4, 35.7], [69.2, 34.5], N.SAMK, [76.9, 43.25]],
    PER: [N.DEL, N.XIA, N.BEI, N.SEO, N.TOK], MUM: [N.KER, [90.4, 23.8], N.SIN, [106.8, -6.2], N.SYD, N.MAN], ARM: [[82.9, 55.0], [106.9, 47.9], [135.1, 48.5]] };
  { const t1 = T0B.c2 + .5, t2 = T0B.c2 + .9;   // only once the whole globe is coming into view (≈ 12,000 km up): no arc is ever seen end-on as a streak
    [N.DAM, N.GAZ, N.CAE, N.SAM, N.NAZ, [35.44, 30.33], [36.48, 32.52], [33.95, 28.55]].forEach((b, i) => arc(JER, b, t1 + i * .06, 1));
    const hubs = Object.entries(W2).map(([k, b], i) => [k, arc(JER, b, t2 + i * .075, 2)]);
    const w3 = [];
    for (const [k, h] of hubs) W3[k].forEach((b, j) => { if (!b) return; w3.push(arc(h.ll, b, h.t + .2 + j * .17, 3)); });
    // wave 4: from each wave-3 landing, thinner arcs to the land round it (one per cell), launching from N28b to the last second
    const tEnd = T0B.g - .45;
    for (const h of w3.sort((x, y) => x.t - y.t)) { const n = 3 + (rA() < .45 ? 1 : 0), t0b = Math.max(h.t + .3, T0B.f);
      for (let j = 0; j < n; j++) { let ok = null;
        for (let tr = 0; tr < 12 && !ok; tr++) { const b = dest(h.ll, rA() * 6.283, 5e5 + rA() * 1.4e6); if (Math.abs(b[1]) > 66 || !GL.isLand(b[0], b[1]) || cells.has(cellOf(b))) continue; ok = b; }
        const t0 = t0b + j * .38 + rA() * .45; if (!ok || t0 > tEnd) continue; arc(h.ll, ok, t0, 4); } } }
  ARCS.forEach(a => { a.P = arcPts(a.a, a.b); });
  const ARC = E.arcMesh(ARCS, { px: 2.2 }); S.add(ARC.mesh);
  // each landing: a soft bloom and the lamps of a city coming on round it; the world's other lights after the waves
  const hubL = [];
  for (const h of HUBS) { const r = rng(Math.round(h.t * 1000)), rad = h.rank === 1 ? 2.5e4 : clamp(h.d * .03, 3e4, 9e4);
    hubL.push({ p: E.llToWorld(h.ll[0], h.ll[1], 900, V()), d: h.t * 1000, b: h.rank === 2 ? 1.5 : 1.0, s: 3.4, f: 650 });
    for (let i = 0; i < 6; i++) { const b = dest(h.ll, r() * 6.283, Math.sqrt(r()) * rad); if (!GL.isLand(b[0], b[1])) continue; hubL.push({ p: E.llToWorld(b[0], b[1], 900, V()), d: (h.t + .15 + r() * .7) * 1000, b: .45 + r() * .5, s: 1.1, f: 450 }); } }
  { const r = rng(7); hubL.push({ p: E.llToWorld(JER[0], JER[1], 900, V()), d: (T0B.c2 - 1.6) * 1000, b: 1.4, s: 2.6, f: 900 });   // Jerusalem keeps its glow (the trunk) as the lamps of the hills fade into the globe
    for (let i = 0; i < 14; i++) { const b = dest(JER, r() * 6.283, Math.sqrt(r()) * 6e4); hubL.push({ p: E.llToWorld(b[0], b[1], 900, V()), d: (T0B.c2 - 1.5 + r() * .6) * 1000, b: .5 + r() * .5, s: 1.1, f: 700 }); } }
  const HUBP = E.lampPoints(hubL, { px: 4.6, minPx: 1.8 }); HUBP.u.uRef.value = 4e6; S.add(HUBP.pts);
  for (const c of E.cityLights({ count: 16000, isLand: GL.isLand, skipWithin: 90000 })) far.push({ p: E.llToWorld(c.lon, c.lat, 700, V()), d: c.gd + c.j * 1.2e6, b: c.b * .8, s: 1, f: 5e5 });
  const CITIES = E.lampPoints(far, { px: 4.0, minPx: 1.4 }); CITIES.u.uRef.value = 4e6; S.add(CITIES.pts);
  const CDIM = E.lampPoints(far.filter(c => c.b > .42).map(c => ({ ...c, d: 0, b: c.b * .9, f: 1 })), { px: 3.6, minPx: 1.2 }); CDIM.u.uRef.value = 4e6; S.add(CDIM.pts);
  let GW = null;   // the wave front over the world's other lights (m from Jerusalem), behind the arcs
  const waveFront = t => { if (!GW) GW = mono([[T.c2 + .4, Math.log(3e5)], [T.c2 + 2.2, Math.log(2.5e6)], [T.f + 1.5, Math.log(7e6)], [T.g, Math.log(2.0e7)]]); return t < T.c2 + .4 ? 0 : Math.exp(GW(t)); };

  // ---------------------------------------------------------------- the camera: one move (see beats)
  function groundCam(t) {
    const tT = T;
    // N15c: low on the city side, INTO the sun — the knot of men on the crest against the low sun and the glowing haze (the sun to
    // the left of them, never behind him). Then one slow arc round them through the south, rising (cinecode "arc", 11 s, eased),
    // following Peter's arm until the city stands far off in the haze at the end of their long shadows (Q6). N15d: the lens
    // closes on the banners. N28c: the camera goes round with the man who turns to the far horizon (pan, 5 s).
    const yaw = keys([[tT.a, 136], [tT.arc[0], 135.6], [tT.arc[1], 3], [tT.push[0], 3.1], [tT.push[1], 6], [tT.pan[0], 6], [tT.pan[1], 60]], t);
    const dist = keys([[tT.a, 21], [tT.arc[0], 20.8], [tT.arc[1], 27], [tT.pan[0], 26.5], [tT.pan[1], 23.5]], t);
    const hgt = keys([[tT.a, 1.3], [tT.arc[0] + 1.6, 2.0], [tT.arc[0] + 5.0, 5.2], [tT.arc[1], 7.6], [tT.c + 5.8, 7.0], [tT.pan[1], 5.6], [tT.crane, 5.6]], t);
    const pitch = keys([[tT.a, 2.2], [tT.arc[0] + 1.6, .5], [tT.arc[0] + 5.0, -8.5], [tT.arc[1], -12.5], [tT.c + .4, -12.8], [tT.c + 5.8, -11.6], [tT.pan[0], -11.8], [tT.pan[1], -11.5]], t);
    const fov = keys([[tT.a, 40], [tT.push[0], 40], [tT.push[1], 33], [tT.widen[0], 33], [tT.widen[1], 40]], t);
    const x = GC.x - hd(yaw).x * dist, z = GC.z - hd(yaw).z * dist, y = H(x, z) + hgt;
    const focus = lerp(lerp(dist + .3, 980, eio((t - tT.rackW[0]) / (tT.rackW[1] - tT.rackW[0]))), dist + .3, eio((t - tT.rackG[0]) / (tT.rackG[1] - tT.rackG[0])));
    return { pos: V(x, y, z), yaw, pd: -pitch, fov, focus, aperture: 2.0, dist, alt: y };
  }
  // Q6a → N29: the crane up off the hill that becomes the pull-back to the top of the air. Log-altitude through keys on a monotone
  // cubic (one smooth speed curve: slow off the ground, fastest while the light runs over Judea and Samaria, slowing as the earth
  // rounds), on the real sphere: the camera stays behind the hill on its great circle and looks down at it, the limb coming in at the top.
  let crane0 = null, LNA = null, GOFF = null;
  const R_E = E.R_E, up0 = V(0, 1, 0), NPOLE = E.llToWorld(0, 90, 0, V()).sub(V(0, -E.R_E, 0)).normalize();
  function thetaFor(h, delta) {   // the arc (rad) behind the hill from which the hill is seen `delta` degrees below the horizontal
    const dip = Math.acos(R_E / (R_E + h)) / D2R; delta = Math.max(delta, dip + .4); let lo = 1e-12, hi = Math.acos(R_E / (R_E + h));
    for (let i = 0; i < 60; i++) { const th = (lo + hi) / 2, dl = Math.atan2(R_E + h - R_E * Math.cos(th), R_E * Math.sin(th)) / D2R; if (dl > delta) lo = th; else hi = th; }
    return (lo + hi) / 2; }
  function camAt(t) {
    const tT = T;
    if (t < tT.crane) return groundCam(t);
    if (!crane0) { crane0 = groundCam(tT.crane); const a0 = Math.log(crane0.alt);
      LNA = mono([[tT.crane, a0], [tT.crane + 2.0, Math.log(12)], [tT.c1, Math.log(150)], [tT.c1 + 1.0, Math.log(1500)], [tT.c1 + 2.0, Math.log(1.5e4)], [tT.c1 + 3.0, Math.log(2.0e5)], [tT.c1 + 3.9, Math.log(1.5e6)], [tT.c2 - .4, Math.log(5e6)], [tT.c2 + .6, Math.log(1.2e7)], [tT.f - .4, Math.log(2.5e7)], [tT.f + 1.6, Math.log(2.9e7)], [tT.g, Math.log(3.05e7)]]);
      GOFF = Math.atan2(crane0.alt, crane0.dist) / D2R - crane0.pd; }
    const c0 = crane0, alt = Math.exp(LNA(t)), la = Math.log(alt), dip = Math.acos(R_E / (R_E + alt)) / D2R;
    const pdMid = lerp(c0.pd, 47, ss(Math.log(8), Math.log(4000), la)), pd0 = Math.max(pdMid, dip + 11 * ss(Math.log(2e4), Math.log(2e5), la));
    const gOff = lerp(GOFF, 4, ss(Math.log(8), Math.log(400), la));
    // from the region view to the whole globe: wG 0 → 1 as the camera climbs from 200 km to 5,000 km. At 1 the camera is straight over
    // a point south-east of Jerusalem (Jerusalem up and left of the disc's centre, north up), looking at the earth's centre, tilted so the
    // disc sits at 40 % of the height; that point drifts west (the globe turns west → east under us), so arcs rise over the limbs in profile
    const wG = ss(Math.log(2e5), Math.log(5e6), la), yaw = lerp(keys([[tT.crane, 60], [tT.c1 + 2.0, 52]], t), 90, wG);
    const nk = ss(tT.c2 - .8, tT.g, t), lonN = lerp(62, 46, nk), latN = lerp(14, 11, nk), gk = ss(Math.log(4e6), Math.log(2.6e7), la), lonT = lerp(JER[0], lonN, gk), latT = lerp(JER[1], latN, gk);
    const upT = gk > 0 ? v3(lonT, latT) : up0.clone(), ET = gk > 0 ? NPOLE.clone().cross(upT).normalize() : V(0, 0, 1), NT = gk > 0 ? upT.clone().cross(ET) : V(1, 0, 0);
    const th = lerp(thetaFor(alt, pd0 + gOff), 0, wG), pd = lerp(pd0, 94.05, wG), h = NT.clone().multiplyScalar(Math.sin(yaw * D2R)).addScaledVector(ET, -Math.cos(yaw * D2R));
    const uC = upT.clone().multiplyScalar(Math.cos(th)).addScaledVector(h, -Math.sin(th)), tC = upT.clone().multiplyScalar(Math.sin(th)).addScaledVector(h, Math.cos(th));
    const pos = V(GC.x, -R_E, GC.z).addScaledVector(uC, R_E + alt);
    return { pos, yaw, pd, fov: lerp(c0.fov, 39, ss(Math.log(8), Math.log(300), la)), focus: lerp(c0.focus, Math.max(20, alt * 1.4), ss(tT.crane, tT.crane + 1.6, t)), aperture: 2.0 * (1 - ss(tT.crane, tT.crane + 2.2, t)), dist: th * R_E, alt, uC, tC };
  }
  // how far the light has run (metres, compared with distance-from-the-hill × 1.15): from their feet down to the city as Q6a
  // begins, Jerusalem's lamps on "예루살렘과", out over Judea, north to Samaria, then beyond the terrain along the world's roads
  let FR = null;
  function front(t) { if (t < T.crane - .3) return 0;
    if (!FR) FR = mono([[T.crane - .3, Math.log(30)], [T.crane + 1.8, Math.log(30 + 60)], [T.c1 - .3, Math.log(30 + 900)], [T.c1 + .9, Math.log(30 + 2600)], [T.c1 + 2.3, Math.log(4e4)], [T.c1 + 3.4, Math.log(8e4)], [T.c2, Math.log(4e5)], [T.f, Math.log(1.6e6)], [T.f + 3.1, Math.log(3.5e6)], [T.g, Math.log(6e6)]]);
    return Math.max(0, Math.exp(FR(t)) - 30); }

  // ---------------------------------------------------------------- one frame
  function setView(t) {
    const c = camAt(t), pdr = c.pd * D2R;
    let dir, up;
    if (c.uC) { dir = c.tC.clone().multiplyScalar(Math.cos(pdr)).addScaledVector(c.uC, -Math.sin(pdr)); up = c.tC.clone().multiplyScalar(Math.sin(pdr)).addScaledVector(c.uC, Math.cos(pdr)); }
    else { const dirH = hd(c.yaw); dir = dirH.clone().multiplyScalar(Math.cos(pdr)).add(V(0, -Math.sin(pdr), 0)); up = dirH.clone().multiplyScalar(Math.sin(pdr)).add(V(0, Math.cos(pdr), 0)); }
    cam.position.copy(c.pos); cam.up.copy(up); cam.lookAt(c.pos.clone().add(dir));
    cam.fov = c.fov; const altG = c.alt - (c.alt < 50 ? H(c.pos.x, c.pos.z) : 0);
    cam.near = c.alt < 30 ? .3 : Math.max(.3, .2 * altG); cam.far = Math.max(3.5e5, Math.sqrt((R_E + c.alt) ** 2 - R_E ** 2) * 1.2 + 3e5);
    return c;
  }
  function frame(t) {
    const c = setView(t), e0 = SUNE(t), sh0 = SUNH(t), sunDir = V(Math.sin(sh0 * D2R) * Math.cos(e0 * D2R), Math.sin(e0 * D2R), -Math.cos(sh0 * D2R) * Math.cos(e0 * D2R));
    { const w = ss(T.c1 + 2.6, T.c2 + .6, t); if (w > 0) { if (!SUNF) { const cg = camAt(T.g), rt = cg.uC.clone().negate().cross(cg.tC).normalize(), side = cg.tC.clone().multiplyScalar(.78).addScaledVector(rt, -.62).normalize(), b = 132 * D2R; SUNF = cg.uC.clone().multiplyScalar(Math.cos(b)).addScaledVector(side, Math.sin(b)).normalize(); } sunDir.lerp(SUNF, w).normalize(); } }
    const e = Math.asin(clamp(sunDir.y, -1, 1)) / D2R, sh = Math.atan2(sunDir.x, -sunDir.z) / D2R, night = ss(-.5, -7, e);
    const alt = c.alt, space = ss(9e3, 7e4, alt), lowA = 1 - ss(300, 3000, alt);
    // sun, its glow in the haze, sky light
    const sk = ss(-.8, 3.5, e); sunL.intensity = 3.2 * sk; sunL.color.copy(col('#ffd7a0')).lerp(col('#ff9a52'), 1 - ss(1, 8, e)); sunL.castShadow = sk > .01 && alt < 4000; if (sunL.castShadow) fitShadow(sunDir);
    sunLamp.pos.copy(cam.position).addScaledVector(sunDir, 3500); sunLamp.power = 1.3e6 * ss(-1.5, 2.5, e) * lowA;
    { const tw = ss(1, -3, e) * (1 - ss(-12, -17, e)); twi.intensity = .75 * tw; twi.color.copy(col('#9aa4d0')).lerp(col('#6c80c8'), ss(-1, -7, e)); twi.target.position.copy(cam.position); twi.position.copy(cam.position).add(V(Math.sin(sh * D2R) * 100, 32, -Math.cos(sh * D2R) * 100)); }
    hemi.color.copy(col('#a6b4cc')).lerp(col('#6a80bc'), ss(4, -2, e)).lerp(col('#4c62a6'), night); hemi.groundColor.copy(col('#7a5a3a')).lerp(col('#2c2836'), night); hemi.intensity = lerp(.55, .62, ss(3, -3, e));
    skyU.uUp.value.copy(c.uC || up0); skyU.uSun.value.copy(sunDir); skyU.uE.value = e; skyU.uDip.value = Math.sin(Math.acos(R_E / (R_E + Math.max(0, alt)))); skyU.uSpace.value = space; skyU.uStars.value = ss(-3, -10, e) * (1 - space) * .5 + space * .35;
    skyU.uGlow.value = 0;
    // haze: warm gold by day, violet-blue at the blue hour; thinner as the camera climbs, gone above the air
    const A = film.atmos, fogDay = col('#d6ad7c', .72), fogDusk = col('#4a5a88', .28), fogNight = col('#1e2c56', .2);
    const fc = fogDay.clone().lerp(fogDusk, ss(5, -1.5, e)).lerp(fogNight, night); A.color.copy(fc); A.colorUp = fc.clone().multiplyScalar(.9);
    A.density = 9e-4 * lerp(1, .12, ss(120, 2000, alt)) * (1 - ss(6e3, 1.5e4, alt)); A.falloff = alt > 1.5e4 ? 1e-9 : 1.3e-3;
    terrU.uSkyW.value.copy(fc).multiplyScalar(.9 + .4 * (1 - night)); terrU.uDetail.value = 1;
    // the look: exposure rides up into the blue hour so the land never goes black; bloom for the lamps
    const L = film.look; L.exposure = lerp(1.05, 1.5, ss(3, -5, e)) * lerp(1, .92, space) * lerp(1, 1.55, ss(8e3, 1.5e5, alt)) * lerp(1, 1.12, ss(1e5, 6e5, alt) * (1 - ss(6e6, 2e7, alt)));   // a little more light on the night globe
    film.bloomCfg.strength = lerp(.07, .17, ss(1, -5, e)) * lerp(1, .3, ss(2e3, 2.5e4, alt)); L.grain = .03;   // (from the air the whole lamp field would bloom into a veil)
    const Df = film.dofCfg; Df.focus = c.focus; Df.aperture = c.aperture; Df.maxCoc = 14;
    // the light along the roads (terrain), the lamps, the world's lines
    const F = front(t), glowOn = ss(T.crane - .2, T.crane + 1.4, t);
    terrU.uF.value = F; terrU.uGlow.value = (OFFS.includes("glow") ? 0 : 1) * glowOn * lerp(.8, 1.3, ss(2, -4, e)) * lerp(1, .3, ss(6e4, 6e5, alt)); terrU.uHeadW.value = Math.max(18, F * .12);
    terrU.uFeet.value = .7 * ss(T.crane - .3, T.crane + 1.0, t) * (1 - ss(T.crane + 3.5, T.crane + 7, t));
        CLAMPS.u.uF.value = F; CLAMPS.u.uK.value = lerp(.5, 1.15, ss(2, -4, e)) * (1 - ss(1100, 3800, alt)); CLAMPS.u.uPull.value = .003; CLAMPS.u.uScale.value = film.scale;
        JGLOW.u.uF.value = 1; JGLOW.u.uK.value = 0; JGLOW.u.uPull.value = .0005; JGLOW.u.uScale.value = film.scale;
        LAMPS.u.uF.value = F; LAMPS.u.uK.value = lerp(.5, 1.15, ss(2, -4, e)) * (1 - ss(2.5e5, 1.6e6, alt)); LAMPS.u.uPull.value = alt < 4e4 ? .003 : .0005; LAMPS.u.uScale.value = film.scale;   // (from orbit the lamps would pile into one blob: the globe's own lights take over)
    CITIES.u.uF.value = waveFront(t); CITIES.u.uK.value = 1.2; CITIES.u.uPull.value = .0004; CITIES.u.uScale.value = film.scale;
    CDIM.u.uF.value = 1; CDIM.u.uK.value = ss(3e4, 4e5, alt) * 2.0; CDIM.u.uPull.value = .0004; CDIM.u.uScale.value = film.scale;
    HUBP.u.uF.value = t * 1000; HUBP.u.uK.value = 1.7; HUBP.u.uPull.value = .0004; HUBP.u.uScale.value = film.scale;
    ARC.u.uT.value = t; ARC.u.uRes.value.set(film.w, film.h); ARC.u.uPx.value = 2.2 * film.scale; ARC.u.uK.value = 1.25; ARC.u.uBandY.value = .38;
    // the globe (only once the camera is high enough for it to show past the terrain) and its air seen from outside
    { const op = 1 - ss(700, 2600, alt); CITYMAT.forEach(m => { m.opacity = op; }); CITYOBJ.forEach(o => { o.visible = op > .002; }); }
    GL.mesh.visible = alt > 1500; GL.atm.visible = alt > 6e4 && !OFFS.includes("atm"); GL.au.uK.value = ss(9e4, 5e5, alt); GL.au.uSun.value.copy(sunDir); GL.u.uSun.value.copy(sunDir);
    GL.u.uHazeL.value = lerp(2.5e5, 8e6, ss(1e4, 2e6, alt));
    terrU.uGK.value = OFFS.includes("gk") ? 0 : ss(1.5e4, 8e4, alt); GL.u.uNM.value = lerp(-.22, 1.2, ss(T.c2 - .9, T.c2 + 1.2, t)); terrU.uSunW.value.copy(sunDir);   // uNM: the night holds over the land as the globe look comes in; then the dawn comes in at the far limb
    // banners, dust
    banU.uT.value = t; banU.uGust.value = Math.exp(-Math.pow((t - T.gust - .8) / 1.1, 2)) * .9;
    dustU.uT.value = t; dustU.uA.value = ss(-1, 3, e) * (1 - ss(T.crane, T.crane + 2, t));
    people(t);
    film.render(t);
  }
  function blit(ctx) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(film.canvas, 0, 0, W, Hh); ctx.restore(); }
  function draw(ctx, t, B) {
    if (!T) { T = beats(B); SUNE = sunElev(T); SUNH = sunHead(T); }
    frame(clamp(t, T.a, T.g)); blit(ctx);
  }
  { const off = (new URLSearchParams(location.search).get('off') || '').split(','); if (off.includes('arc')) ARC.mesh.visible = false; if (off.includes('hub')) HUBP.pts.visible = false; if (off.includes('city')) CITIES.pts.visible = false; if (off.includes('lamp')) LAMPS.pts.visible = false; if (off.includes('atm')) GL.atm.visible = false; OFFS = off; }
  return { film, draw, beats: () => T, camAt: t => (T ? camAt(t) : null), front: t => (T ? front(t) : 0), people: { king, men }, arcs: ARCS.map(a => [a.w, +a.t0.toFixed(2)]) };
}
