// olivet3d.js — 「kingdom」 6부 「땅 끝까지」 (film 655.4–700.3: N15c · Q6 · N15d · N28c · Q6a · N28b): one continuous camera.
// The Mount of Olives at the end of the afternoon: a few men stand round one man on the crest; one points across the Kidron at
// Jerusalem — the Temple, and beside it the Antonia with its red Roman banners. Their long shadows run toward the walls. The
// pointing hand comes down; the one man turns from the walls to the far horizon and the camera goes round with him (4 s). Then
// (Acts 1:8) the camera cranes up for ten seconds, slow in, slow out: light runs out from under their feet along every road off
// the hill — Jerusalem, all Judea, Samaria — the day goes, the lamps come on village after village, and the camera keeps rising
// through the air until it is over the night earth, the light still running along the roads to the ends of the earth.
// Engine and look: the liked part-2 village (heal-village.js — lib3d/cine.js: height fog, bloom, AgX, depth of field, grain;
// lib3d/kit.js trees; people3d.js robeMan/walk/idle/breath). Craft taken (copied, never edited at the source):
//   * the first film's 「교회의 시작」 (motion/pilot/church.html): ridge lamps → villages lighting as the light passes → the earth at night,
//     lights spreading from Jerusalem; the moonless blue night and warm lamp colour.
//   * motion-skills lineage-glow: gold lines from one lit node, branching, a hot head running ahead, light flowing (earth-night.js).
//   * motion-skills cinematic-3d (cine.js pipeline) · map-dive (dive from a map scale to the ground, night glow) · cinecode
//     references/camera-moves.md: "crane / pedestal up — rises, keeping the subject (tilt down) — scale, a reveal", "pull-back reveal".
//   * refs: 「아웃 오브 아프리카」 aerial (low golden light, the land rolling away under the camera), 「반지의 제왕: 왕의 귀환」 beacons (lights
//     that catch peak after peak — here lamps that catch village after village, rhyming with part 1's lakeside lamps).
// Rules kept: Jesus never by face — from behind, small; turning away from the camera; no halo; men in head cloths to the shoulders;
// figures small, in the low light; no words anywhere in the art; one camera, no cut; the light runs along roads, not across the sky.
//
// API: const OL = await (await import('./olivet3d.js')).build(W, H);  OL.draw(ctx, t, B)   t = FILM seconds,
//      B = line times from script.json { N15c, Q6, N15d, N28c, Q6a, N28b, N29 }. Every beat comes from B in beats(). Pure in t.
import { Film, THREE, V, col, rng } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';
import * as E from './earth-night.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const sine = x => .5 - .5 * Math.cos(Math.PI * clamp(x));
const D2R = Math.PI / 180;
const hd = deg => V(Math.sin(deg * D2R), 0, -Math.cos(deg * D2R));   // heading: 0 = toward the walls (−z, west), 90 = +x (north)
const yawOf = deg => -deg * D2R;                                       // the rotation.y that turns a figure (facing −z) to a heading
const keys = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const [a, va] = K[i - 1], [b, vb] = K[i]; return lerp(va, vb, sine((t - a) / (b - a))); } return K[K.length - 1][1]; };

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
  return { start: a, end: g, a, b, c, d, e, f, g,
    point: [a + 1.0, a + 2.3],                     // N15c: one of them raises his arm toward the walls
    arc: [a + 2.6, b + 4.8],                       // the camera follows his point round to behind them (the walls come into view)
    ask: [b + .2, b + 1.3], askOff: [c + 1.0, c + 2.1],   // Q6: the one beside him turns to the man in the middle, an open hand
    push: [c + .1, c + 5.7], rackW: [c + .5, c + 2.3], gust: c + 1.0,   // N15d: the lens closes on the Antonia's banners
    rackG: [d + .05, d + 1.1], lower: [d + .4, d + 1.8], turn: [d + 1.8, d + 4.7], pan: [d + 1.8, d + 6.0], widen: [d + 1.0, d + 6.0],
    crane: e + .5, craneEnd: e + 11.5, tail: [e + 8.2, g], walk: e + .7,
  };
}
// the sun (degrees above the horizon) and its heading; the day goes as the camera rises
const SUN_HEAD = 180;   // behind the group as seen from the city: their shadows run straight toward the walls
const sunElev = T => t => keys([[T.a, 9.2], [T.b, 8.7], [T.c, 6.2], [T.d, 5.3], [T.e, 3.0], [T.e + 2.2, .7], [T.e + 4.6, -2.6], [T.e + 6.6, -6.2], [T.e + 8.6, -10], [T.g, -17]], t);

export async function build(W, H_) {
  const Hh = H_, vert = Hh > W;
  const film = new Film({
    W, H: Hh, dur: 1e4, fov: 44, near: 1, far: 3.5e5,
    atmos: { density: 1.1e-4, falloff: 5.5e-4, base: 0, start: 4, color: col('#c99a64', .62), colorUp: col('#b7a58c', .55), max: 3e5, scatter: 1, anisotropy: .78, phaseMix: .85 },
    bloom: { strength: .06, radius: 1.1, tint: col('#ffe2b8') },
    dof: { focus: 18, aperture: 2, maxCoc: 12 },
    look: { exposure: 1.0, contrast: 1.04, saturation: 1.02, lift: col('#0a0806'), shadowTint: col('#d8d0e8'), highTint: col('#fff0d8'), vignette: .3, grain: .028, ca: .3 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera, R = film.renderer;
  let T = null, SUNE = null;

  // ---------------------------------------------------------------- light
  const sunL = new THREE.DirectionalLight(col('#ffd39a'), 3.0); S.add(sunL, sunL.target);
  const maxT = R.capabilities.maxTextureSize, smW = Math.min(8192, maxT), smH = Math.min(2048, maxT);
  sunL.castShadow = true; sunL.shadow.mapSize.set(smW, smH); sunL.shadow.bias = -.00025; sunL.shadow.normalBias = .06;
  const hemi = new THREE.HemisphereLight(col('#a6b4cc'), col('#7a5a3a'), .55); S.add(hemi);
  const moon = new THREE.DirectionalLight(col('#8ea4d8'), 0); moon.position.copy(V(Math.sin(250 * D2R) * .7, .7, -Math.cos(250 * D2R) * .7).multiplyScalar(1000)); S.add(moon);
  const SHADOW_BOX = [V(-580, -140, -1800), V(400, 80, 70)];
  const lightView = new THREE.Matrix4(), tmp = V();
  function fitShadow(dir) {   // an orthographic shadow box round the hill, the slope and the near city, aligned to the sun
    const tg = V(0, -40, -480); sunL.target.position.copy(tg); sunL.position.copy(tg).addScaledVector(dir, 3000);
    lightView.lookAt(sunL.position, tg, V(0, 1, 0)); lightView.setPosition(sunL.position); const inv = lightView.clone().invert();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9; const [A, Bx] = SHADOW_BOX;
    for (let i = 0; i < 8; i++) { tmp.set(i & 1 ? Bx.x : A.x, i & 2 ? Bx.y : A.y, i & 4 ? Bx.z : A.z).applyMatrix4(inv); x0 = Math.min(x0, tmp.x); x1 = Math.max(x1, tmp.x); y0 = Math.min(y0, tmp.y); y1 = Math.max(y1, tmp.y); z0 = Math.min(z0, tmp.z); z1 = Math.max(z1, tmp.z); }
    Object.assign(sunL.shadow.camera, { left: x0, right: x1, bottom: y0, top: y1, near: Math.max(1, -z1 - 50), far: -z0 + 50 }); sunL.shadow.camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------------- the sky (dusk → night → the black above the air)
  const skyU = { uUp: { value: V(0, 1, 0) }, uSun: { value: V(0, 1, 0) }, uE: { value: 9 }, uDip: { value: 0 }, uSpace: { value: 0 }, uGlow: { value: 0 }, uGlowDir: { value: hd(50) }, uStars: { value: 0 } };
  { const m = new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: `varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 0.)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.)).xyz, 1.); gl_Position = p.xyww; }`,
      fragmentShader: `varying vec3 vD; uniform vec3 uSun, uGlowDir, uUp; uniform float uE, uDip, uSpace, uGlow, uStars;
        float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
        void main(){ vec3 d = normalize(vD); float y = dot(d, uUp) + uDip;   // relative to the true horizon (up = away from the earth's centre)
          vec2 hz = normalize(d.xz + 1e-5), hs = normalize(uSun.xz + 1e-5); float sd = dot(hz, hs);
          float day = smoothstep(-1., 12., uE), dk = smoothstep(-10., -.5, uE); dk *= dk;
          vec3 Z = mix(mix(vec3(.004, .007, .018), vec3(.05, .08, .18), dk), vec3(.2, .3, .52), day);
          vec3 Ha = mix(mix(vec3(.012, .018, .045), vec3(.36, .25, .32), dk), vec3(.82, .68, .52), day);
          vec3 Hs = mix(mix(vec3(.02, .016, .025), vec3(1., .42, .16), dk), vec3(1.35, .9, .52), day);
          vec3 Hc = mix(Ha, Hs, pow(sd * .5 + .5, 3.));
          float esTop = clamp(-uE * .02, 0., .14);                                     // the earth's shadow rising opposite the sun
          Hc = mix(Hc, vec3(.07, .09, .17) * (.4 + .6 * dk), (1. - smoothstep(0., esTop + .001, y)) * smoothstep(.1, -.6, sd) * step(.0, esTop - .0001));
          vec3 c = mix(Hc, Z, pow(smoothstep(-.01, .5, y), .65));
          if (y < 0.) c = mix(Hc * .55, vec3(.01, .014, .03), smoothstep(0., -.2, y));
          float s = max(dot(d, uSun), 0.);
          c += vec3(1., .66, .32) * (pow(s, 7.) * .45 + pow(s, 60.) * 1.4) * smoothstep(-6., 1., uE) + vec3(1., .9, .7) * 30. * smoothstep(.99965, .9998, s) * smoothstep(-1., .5, uE);
          c += vec3(1., .7, .38) * uGlow * exp(-abs(y) / .02) * pow(max(dot(hz, normalize(uGlowDir.xz)), 0.), 2.);   // the light gone beyond the horizon
          vec3 sp = vec3(.0012, .0016, .004) + vec3(.03, .07, .22) * exp(-abs(y) / .006);       // above the air: black, a thin blue line on the limb
          c = mix(c, sp, uSpace);
          if (uStars > 0. && y > .02){ vec3 g = floor(d * 260.); vec2 k = g.xy + g.z * 17.31; float st = step(.9986, h12(k)); c += vec3(st * uStars * (.3 + .7 * h12(k + 3.))) * smoothstep(.02, .12, y); }
          gl_FragColor = vec4(c, 0.); }` });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), m); sky.frustumCulled = false; sky.renderOrder = -10;
    sky.onBeforeRender = (r, s, c) => { sky.position.setFromMatrixPosition(c.matrixWorld); sky.updateMatrixWorld(); }; S.add(sky); }

  // ---------------------------------------------------------------- the roads near the hill (dirt tracks): a mask painted for the terrain shader
  const ROADR = 3000, RT = 4096;
  const roadCv = document.createElement('canvas'); roadCv.width = roadCv.height = RT; const rx = roadCv.getContext('2d'); rx.fillStyle = '#000'; rx.fillRect(0, 0, RT, RT);
  const toRT = (x, z) => [(x + ROADR) / (2 * ROADR) * RT, (z + ROADR) / (2 * ROADR) * RT];
  // local paths off the crest (metres, [x north, z east]); they fan out from the group's feet in every direction
  const PATHS = {
    W: [[0, 0], [-3, -30], [4, -95], [-12, -190], [6, -300], [-8, -420], [8, -540], [40, -650], [60, -705], [40, -900], [-30, -1250], [-60, -1730]],   // down to the Kidron, the Temple's east gate, through the city to the west gate
    NW: [[0, 0], [22, -24], [120, -140], [240, -330], [300, -560], [330, -760], [300, -1000], [300, -1360]],   // across the Kidron's head to the north gate
    N: [[0, 0], [30, 4], [160, 0], [420, -20], [800, -60], [1400, -120], [2300, -180]],                      // along the ridge, north
    NE: [[0, 0], [24, 26], [180, 160], [520, 420], [1100, 900], [1900, 1500]],                              // down the back toward Anathoth
    E: [[0, 0], [-6, 30], [-60, 220], [-260, 700], [-560, 1250], [-820, 1700]],                              // down to Bethany
    S: [[0, 0], [-30, 6], [-200, -20], [-520, -90], [-1000, -170], [-1700, -330]],                           // south along the ridge toward Bethlehem
  };
  rx.strokeStyle = '#fff'; rx.lineCap = rx.lineJoin = 'round';
  for (const k in PATHS) { const p = PATHS[k]; for (const [w, a] of [[9, .35], [4.5, .7], [2.6, 1]]) { rx.globalAlpha = a; rx.lineWidth = w / (2 * ROADR) * RT; rx.beginPath(); p.forEach(([x, z], i) => { const [u, v] = toRT(x, z); i ? rx.lineTo(u, v) : rx.moveTo(u, v); }); rx.stroke(); } }
  rx.globalAlpha = 1;
  const roadTex = new THREE.CanvasTexture(roadCv); roadTex.colorSpace = THREE.NoColorSpace; roadTex.flipY = false; roadTex.minFilter = THREE.LinearMipmapLinearFilter; roadTex.anisotropy = 8;

  // ---------------------------------------------------------------- the terrain: one polar mesh round the hill out to 200 km, on the sphere
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;
  const terrU = { tRoad: { value: roadTex }, uRoadR: { value: ROADR }, uSkyW: { value: new THREE.Color(.4, .35, .3) }, uDetail: { value: 1 }, uGK: { value: 0 }, uGLand: { value: new THREE.Color() }, uGSea: { value: new THREE.Color() }, uGHaze: { value: new THREE.Color() }, uGHazeL: { value: 1e6 } };
  {
    const NR = 452, NA = 768, r0 = .6, kR = Math.log(PATCH / r0) / (NR - 2);
    const nV = 1 + (NR - 1) * NA, pos = new Float32Array(nV * 3), colr = new Float32Array(nV * 3), wet = new Float32Array(nV), coast = new Float32Array(nV);
    const cSea = [.05, .075, .1], cLake = [.06, .08, .1];
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
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tRoad; uniform float uRoadR, uDetail, uGK, uGHazeL; uniform vec3 uSkyW, uGLand, uGSea, uGHaze; varying float vWet, vCoast; varying vec3 vWP; varying vec3 vWN; float wetF(){ return max(smoothstep(-.2, .2, vWet), smoothstep(-.25, .25, vCoast)); }\n' + hashGLSL)
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
              vec2 ru = (vWP.xz + uRoadR) / (2. * uRoadR);
              if (ru.x > 0. && ru.x < 1. && ru.y > 0. && ru.y < 1.) { float rd = texture2D(tRoad, ru).r; c = mix(c, vec3(.8, .7, .54) * (.9 + .15 * g), rd * .8); }
            } else c *= .9 + .1 * vn(q * .002);
            c = mix(c, vec3(.05, .075, .1) * (.9 + .1 * vn(q * .002)), wetF());
            diffuseColor.rgb = c; }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { float wf = wetF(); vec3 v = normalize(cameraPosition - vWP); float fr = pow(1. - clamp(v.y, 0., 1.), 4.); totalEmissiveRadiance += uSkyW * (.015 + .1 * fr) * wf; }`)
        .replace('#include <fog_fragment>', `if (uGK > 0.) { vec3 n = normalize(vWP - vec3(0., -${E.R_E.toFixed(1)}, 0.)), v = normalize(cameraPosition - vWP); float mu = max(dot(n, v), 0.);
            float lum = dot(diffuseColor.rgb, vec3(.33)); vec3 gc = mix(uGLand * (.8 + .5 * lum), uGSea, wetF());
            float hz = 1. - exp(-length(cameraPosition - vWP) / uGHazeL); gc = mix(gc, uGHaze, clamp(hz * .35 + pow(1. - mu, 6.) * .5, 0., 1.));
            gl_FragColor.rgb = mix(gl_FragColor.rgb, gc, uGK); }
          #include <fog_fragment>`); };
    m.customProgramCacheKey = () => 'ol-terrain';
    const terr = new THREE.Mesh(g, m); terr.receiveShadow = terr.castShadow = true; terr.frustumCulled = false; S.add(terr);
  }
  function localToW(x, z, y, out) { return E.localToWorld(x, z, y, out); }

  // ---------------------------------------------------------------- materials
  const wallM = (base, key) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .92 });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvec4 wp4 = vec4(transformed, 1.);\n#ifdef USE_INSTANCING\nwp4 = instanceMatrix * wp4;\n#endif\nvWP = (modelMatrix * wp4).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + hashGLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 N = normalize(vWN); vec2 q = abs(N.y) > .7 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
            float big = fb(q * .08 + 3.1), fine = fb(q * .9), course = smoothstep(.42, .5, fract(q.y * 1.1 + floor(q.x * .55) * .37)) * (1. - abs(N.y));
            vec3 c = diffuseColor.rgb * mix(.84, 1.1, big) * mix(.93, 1.05, fine) * (1. - course * .06);
            c *= mix(1., .84, smoothstep(.62, .8, fb(vec2(q.x * 1.2, q.y * .15))) * (1. - abs(N.y)));
            diffuseColor.rgb = c; }`); };
    m.customProgramCacheKey = () => 'ol-wall-' + key; return m; };
  const M = { stone: wallM('#d9c6a0', 'a'), stone2: wallM('#c9b08a', 'b'), pale: wallM('#e6dcc6', 'c'), house: wallM('#d2bc96', 'h'),
    dark: K.std('#1c140e', { roughness: 1 }), roof: K.std('#9c8a6c', { roughness: .95 }), gold: K.std('#c49a4a', { roughness: .55, metalness: .25 }),
    wood: K.std('#5a4028', { roughness: .9 }), leaf: K.std('#6c7458', { roughness: .9 }), leafD: K.std('#565e46', { roughness: .9 }), trunk: K.std('#4a3a2a', { roughness: .95 }) };
  const place = (o, x, z, dy = 0) => { o.position.set(x, H(x, z) + dy, z); S.add(o); return o; };
  const box = (w, h, d, x, z, mat, { y = null, ry = 0, cast = true } = {}) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); b.position.set(x, (y ?? H(x, z)) + h / 2, z); b.rotation.y = ry; b.castShadow = cast; b.receiveShadow = true; S.add(b); return b; };

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
      for (let j = 0; j <= Math.floor(L / 75); j++) { const k = j / Math.max(1, Math.floor(L / 75)), x = lerp(ax, bx, k), z = lerp(az, bz, k), y = H(x, z) - 3; box(9, 26, 9, x, z, M.stone, { y }).rotation.y = ry; } }
    const inst = new THREE.InstancedMesh(crenG, M.stone2, cren.length); cren.forEach((mm, i) => inst.setMatrixAt(i, mm)); inst.castShadow = inst.receiveShadow = true; S.add(inst); }
  // the Temple Mount: retaining walls, the paved court, the Royal Stoa on the south side, the inner courts, the Temple facing east
  { const { x0, x1, z0, z1, top } = TMB, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, base = -56;
    box(x1 - x0, top - base, z1 - z0, cx, cz, M.stone, { y: base });
    box(26, 20, z1 - z0 - 10, x0 + 13, cz, M.pale, { y: top });  box(20, 7, z1 - z0 - 14, x0 + 12, cz, M.dark, { y: top + 2, cast: false }).position.x = x0 + 25.6;   // the Royal Stoa and its shaded colonnade
    for (const [w, d, x, z] of [[104, 4, cx + 10, -800], [104, 4, cx + 10, -930], [4, 130, cx - 42, -865], [4, 130, cx + 62, -865]]) box(w, 11, d, x, z, M.pale, { y: top });   // the inner courts' walls
    box(26, 36, 62, cx + 10, -885, M.pale, { y: top });                 // the sanctuary
    box(42, 34, 12, cx + 10, -850, M.pale, { y: top });                 // the porch, facing east (toward the Mount) …
    box(58, 14, 12, cx + 10, -850, M.pale, { y: top + 34 });            // … wider above, as Herod's porch was
    box(59, 1.3, 12.8, cx + 10, -850, M.stone2, { y: top + 33.4 });     // the cornice between
    box(11, 24, .6, cx + 10, -843.7, M.dark, { y: top + 5, cast: false });   // its open doorway
    box(17, 2.2, .5, cx + 10, -843.6, M.gold, { y: top + 30, cast: false }); // the golden vine over the door
    for (const s of [-15, -9.5, 9.5, 15]) box(1.7, 30, .9, cx + 10 + s, -843.6, M.stone, { y: top + 1 });   // engaged columns
    box(59, 1.0, 12.6, cx + 10, -850, M.gold, { y: top + 48 }); box(27, .8, 62.4, cx + 10, -885, M.gold, { y: top + 36 }); }
  // the Antonia at the Temple Mount's north-west corner: a block with four towers, the south-east one taller; the Roman banners
  const AN = { x: 210, z: -960 };
  { box(64, 26, 46, AN.x, AN.z, M.stone, { y: -40 });
    for (const [dx, dz, h] of [[-30, 21, 52], [30, 21, 40], [-30, -21, 40], [30, -21, 40]]) box(14, h, 14, AN.x + dx, AN.z + dz, M.stone2, { y: -40 }); }
  // banners: deep red cloth with a gold edge, rippling in the wind (vertex wave, pure in t); hung on the Antonia's east face and towers
  const banU = { uT: { value: 0 }, uGust: { value: 0 } };
  const banM = new THREE.MeshStandardMaterial({ color: '#8e1c16', roughness: .8, side: THREE.DoubleSide, emissive: new THREE.Color('#200402') });
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
  for (const [x, y, z] of [[AN.x - 30, 13, AN.z + 21], [AN.x + 30, 1, AN.z + 21], [AN.x - 30, 1, AN.z - 21]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, 12, 6), M.wood); pole.position.set(x, y + 6, z); S.add(pole);
    const disc = new THREE.Mesh(new THREE.SphereGeometry(.9, 10, 8), M.gold); disc.position.set(x, y + 12.6, z); S.add(disc);
    banner(3.6, 3.8, x, y + 11, z + .3); }
  // the houses: flat-roofed blocks, packed, rising west; a few upper rooms; instanced
  { const r = rng(808), hg = new THREE.BoxGeometry(1, 1, 1), mats = [], cols = []; const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
    let n = 0; while (mats.length < 3200 && n++ < 40000) { const x = -560 + r() * 880, z = -700 - r() * 1060; if (!inCity(x, z)) continue;
      if (x > TMB.x0 - 6 && x < TMB.x1 + 6 && z < TMB.z1 + 6 && z > TMB.z0 - 6) continue; if (Math.hypot(x - AN.x, z - AN.z) < 50) continue;
      if (Math.abs(z + 700) < 12 || Math.abs(z + 1750 - (x + 430) * .2) < 10) continue;
      const w = 6 + r() * 7, d = 6 + r() * 7, h = 4.5 + r() * 4.5 + (r() < .12 ? 4 : 0), y = H(x, z) - 1.5, ry = .08 * (r() - .5);
      mats.push(m4.compose(V(x, y + h / 2, z), q4.setFromEuler(new THREE.Euler(0, ry, 0)), V(w, h, d)).clone()); const k = .86 + r() * .2; cols.push(new THREE.Color(k, k * (.97 + r() * .04), k * (.92 + r() * .06))); }
    const inst = new THREE.InstancedMesh(hg, M.house, mats.length); mats.forEach((mm, i) => { inst.setMatrixAt(i, mm); inst.setColorAt(i, cols[i]); }); inst.castShadow = inst.receiveShadow = true; S.add(inst); }
  // Herod's palace towers on the west wall
  for (const [x, z, h] of [[40, -1735, 42], [10, -1730, 36], [-20, -1726, 32]]) box(13, h, 13, x, z, M.stone);

  // ---------------------------------------------------------------- olive trees on the Mount (near ones in 3D; far groves are dots in the terrain)
  const olive = (x, z, h, seed) => { const tr = K.tree({ seed, height: h, trunk: .22, depth: 4, spread: .75, up: .2, twig: 0, mat: M.trunk, layer: 0 }); tr.position.set(x, H(x, z) - .1, z); S.add(tr);
    const r = rng(seed), n = 150, geo = new THREE.IcosahedronGeometry(.36, 1), inst = new THREE.InstancedMesh(geo, r() < .5 ? M.leaf : M.leafD, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.pow(r(), .7) * h * .5, y = H(x, z) + h * (.48 + r() * .4) - rr * .25; m4.compose(V(x + Math.cos(a) * rr, y, z + Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * .6, r() * 3, r() * .6)), V(1.3, .5, 1).multiplyScalar(.6 + r() * .9)); inst.setMatrixAt(i, m4); }
    inst.castShadow = true; inst.receiveShadow = true; S.add(inst); };
  // (kept off the skyline behind the group in the first view (north, 60–125°) and off the far horizon after the turn (≈ 40–58°))
  for (const [hdg, dist, h] of [[-38, 30, 5.2], [-27, 52, 6], [-55, 22, 4.6], [27, 30, 5.4], [64, 46, 5.6], [138, 30, 5.2], [-80, 38, 5.6], [150, 50, 6], [205, 34, 5], [240, 28, 4.8], [-110, 48, 5.8], [-20, 95, 6.2], [34, 64, 6]]) {
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

  // ---------------------------------------------------------------- the people: the eleven round the one man (people3d robeMan)
  const robes = ['#6e5a44', '#5a5048', '#7c6650', '#4e5a66', '#8a7356', '#6a5a4a', '#5d4c3c', '#7a6a58', '#4a4440', '#806c52', '#665448'];
  const cloths = ['#4e4236', '#6a5a46', '#3e3a36', '#55606a', '#5f503e', '#4a3e30', '#746450', '#3c3630', '#5a4a3a', '#4c4440', '#6a5844'];
  const skinM = K.std('#7a5236', { roughness: .8 });
  const mat = c => K.std(c, { roughness: .95, side: THREE.DoubleSide });
  const kingM = mat('#b9a88a'), kingC = mat('#8c7a5e');     // the same plain undyed robe and darker head cloth as in part 2 — no mark, no glow
  const king = P.robeMan({ h: 1.76, mat: kingM, cloth: kingC, skin: skinM, head: 'cloth' }); place(king, 0, 0); king.rotation.y = yawOf(30); king.userData.ph = .37;
  // the eleven: [x, z, heading they face, height, broad]; d0 points (right of him, in front), d2 asks (at his right side)
  // (laid out so that from the south — the first view — nobody stands between the camera and him, and Peter's pointing arm is clear)
  const D = [[-2.6, -2.0, 8, 1.74, 1.08], [-1.7, 1.0, 14, 1.7, 1], [1.0, 1.3, -25, 1.78, 1.04], [-2.4, 2.2, 10, 1.68, .96], [.6, -2.2, 2, 1.72, 1], [1.9, 2.4, 6, 1.75, 1.05],
    [2.9, -1.0, 14, 1.69, .95], [1.6, -3.4, -9, 1.76, 1.02], [3.2, 1.3, 3, 1.71, 1], [.2, -3.4, -3, 1.67, .97], [-1.3, 3.2, 10, 1.73, 1.03]];
  const men = D.map(([x, z, h0, h, b], i) => { const g = P.robeMan({ h, broad: b, mat: mat(robes[i]), cloth: mat(cloths[i]), skin: skinM, head: 'cloth' }); place(g, x, z); g.rotation.y = yawOf(h0); g.userData.ph = (i * .618 + .13) % 1; g.userData.h0 = h0; g.userData.x0 = x; g.userData.z0 = z; return g; });
  const ALL = [king, ...men];
  // who walks out along which road when the light runs (Q6a): [man, heading of the road]
  const WALKERS = [[4, 4], [0, 46], [6, 92], [3, -40], [8, 140]];
  const headTo = (g, wx, wz) => { const yaw = Math.atan2(-(wx - g.position.x), -(wz - g.position.z)) - g.rotation.y; return Math.atan2(Math.sin(yaw), Math.cos(yaw)); };
  const shoulder = (g, sd) => { const U = g.userData; return V(sd * .235 * U.s, U.hipY + U.torsoH - .04 * U.s, 0); };
  const restHand = (g, sd) => { const U = g.userData, Sh = shoulder(g, sd), r = (U.la + U.lb) * .96; return Sh.add(V(sd * Math.sin(.1) * r, -Math.cos(.1) * r, -.04)); };
  const toRoot = (g, w) => w.clone().applyAxisAngle(V(0, 1, 0), -g.rotation.y);
  function people(t) {
    const tT = T, turnK = eio((t - tT.turn[0]) / (tT.turn[1] - tT.turn[0]));
    // turning in place: two small steps (one foot lifts, then the other) hidden mostly by the robe — the feet never slide
    const stepFeet = (g, k01) => { const U = g.userData, u = clamp(k01), l0 = Math.max(0, Math.sin(clamp(u * 2) * Math.PI)), l1 = Math.max(0, Math.sin(clamp(u * 2 - 1) * Math.PI));
      return [{ u: .09 * U.s, lift: .035 * l0 }, { u: -.07 * U.s, lift: .035 * l1 }]; };
    // the one man: still, alive; at N28c his right hand opens toward the far horizon (sending), his body turns a little with it
    king.rotation.y = yawOf(lerp(30, 44, turnK));
    { const U = king.userData, id = P.idle(t, U.ph, { s: U.s }), gk = eio((t - tT.lower[0] - .5) / 1.4) * (1 - eio((t - tT.crane) / 1.6));
      const Sh = shoulder(king, 1), dirR = toRoot(king, hd(50)), hand = Sh.clone().addScaledVector(dirR, (U.la + U.lb) * .8).add(V(0, -.12 * U.s, 0));
      P.pose(king, { ...id, feet: stepFeet(king, (t - tT.turn[0]) / (tT.turn[1] - tT.turn[0])), head: [-.03 + .02 * Math.sin(t * .4), id.head[1] * .5], hands: [null, restHand(king, 1).lerp(hand, gk)] }); }
    const ant = V(AN.x - 12, -10, AN.z + 20);
    men.forEach((g, i) => { const U = g.userData;
      const wk = WALKERS.find(w => w[0] === i);
      if (wk && t > tT.walk) {   // walks out along his road: turns toward it, then real steps (planted feet)
        const t0 = tT.walk + i * .13, tk = eio((t - t0) / .9), hdg = lerp(U.h0 + lerp(0, 46 * .35, ss(tT.turn[0] + .5, tT.turn[1] + 1.2, tT.walk)), wk[1], tk);
        g.rotation.y = yawOf(hdg); const w = P.walk(g, t, t0 + .55, { T: 1.12, L: .5 }); const dir = hd(wk[1]); g.position.set(U.x0 + dir.x * w.dist, 0, U.z0 + dir.z * w.dist); g.position.y = H(g.position.x, g.position.z);
        P.pose(g, t > t0 + .55 ? { ...w, breath: .5, head: [0, 0] } : { ...P.idle(t, U.ph, { s: U.s }), head: [0, 0] }); return; }
      g.position.set(U.x0, H(U.x0, U.z0), U.z0);
      // Peter (who pointed) turns from the walls to the far horizon at N28c; the rest turn a little after (each on his own delay), heads fully
      const fk = i === 0 ? turnK : ss(tT.turn[0] + .5 + U.ph * .9, tT.turn[1] + 1.2 + U.ph * .9, t), yaw = i === 0 ? lerp(U.h0, 50, turnK) : U.h0 + 46 * .35 * fk; g.rotation.y = yawOf(yaw);
      const id = P.idle(t, U.ph, { s: U.s }); if (i === 0) id.feet = stepFeet(g, (t - tT.turn[0]) / (tT.turn[1] - tT.turn[0]));
      // where the head looks: the walls (the Antonia) → (Q6 asker: the man in the middle) → the horizon he turned to
      const hw = headTo(g, ant.x, ant.z), hk = headTo(g, king.position.x, king.position.z), hh = headTo(g, g.position.x + hd(50).x * 100, g.position.z + hd(50).z * 100);
      let hy = hw;
      if (i === 2) hy = lerp(hy, hk, ss(tT.ask[0], tT.ask[1], t) * (1 - ss(tT.askOff[0], tT.askOff[1], t)));
      hy = lerp(hy, hh, fk); hy = clamp(hy, -1.15, 1.15) + .04 * Math.sin(t * .31 + U.ph * 9);
      const ex = { ...id, head: [-.04 + .03 * Math.sin(t * .37 + U.ph * 5), hy], twist: id.twist + clamp(hy, -.5, .5) * .25 };
      if (i === 0) {   // Peter: his right arm comes up and points across the valley at the Antonia; it comes down at N28c
        const k = eio((t - tT.point[0]) / (tT.point[1] - tT.point[0])) * (1 - eio((t - tT.lower[0]) / (tT.lower[1] - tT.lower[0])));
        const Sh = shoulder(g, 1), dirW = ant.clone().sub(g.position.clone().add(V(0, 1.45, 0))).normalize(), dirR = toRoot(g, dirW), tip = Sh.clone().addScaledVector(dirR, (U.la + U.lb) * .97).add(V(0, .13, 0));
        ex.hands = [null, restHand(g, 1).lerp(tip, k)]; ex.twist += .12 * k; ex.head = [ex.head[0] + .03 * k, lerp(hy, clamp(hw, -1, 1), k)]; }
      if (i === 2) { const k = ss(tT.ask[0], tT.ask[1], t) * (1 - ss(tT.askOff[0], tT.askOff[1], t));   // the question: an open hand toward him
        const Sh = shoulder(g, -1), dirR = toRoot(g, king.position.clone().sub(g.position).setY(0).normalize()), palm = Sh.clone().add(V(0, -.34 * U.s, 0)).addScaledVector(dirR, .38 * U.s);
        ex.hands = [restHand(g, -1).lerp(palm, k), null]; ex.twist += .1 * k; }
      if (i === 7) ex.hands = [null, Sh2(g)];   // one with his hand on his chest (stillness, not the same pose as the rest)
      P.pose(g, ex); });
  }
  const Sh2 = g => { const U = g.userData; return V(.06 * U.s, U.hipY + U.torsoH - .16 * U.s, -.2 * U.s); };

  // ---------------------------------------------------------------- the roads the light runs along: near paths → towns → the world
  const lines = [], netV = [];   // netV: every vertex (world) with its network distance, for joining branches and placing villages
  const dW = V();
  const addLine = (pts, d0, w, k = 1) => { const L = { p: [], d: [], w, k }; let d = d0; pts.forEach((p, i) => { if (i) d += p.distanceTo(pts[i - 1]); L.p.push(p); L.d.push(d); netV.push([p, d]); }); lines.push(L); return d; };
  const nearestNet = p => { let best = null, bd = 1e18; for (const [q, d] of netV) { const dd = q.distanceToSquared(p); if (dd < bd) { bd = dd; best = [q, d]; } } return [best, Math.sqrt(bd)]; };
  const surf = (x, z, lift) => { const r = Math.hypot(x, z); return r < PATCH - 6000 ? localToW(x, z, H(x, z) + lift, V()) : localToW(x, z, -CREST + 300, V()); };
  const densify = (poly, step, lift) => { const out = []; for (let i = 0; i + 1 < poly.length; i++) { const [ax, az] = poly[i], [bx, bz] = poly[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / step(Math.hypot(ax, az)))); for (let j = 0; j < n; j++) { const k = j / n; out.push(surf(lerp(ax, bx, k) + (j ? 1 : 0) * 0, lerp(az, bz, k), lift)); } } const l = poly[poly.length - 1]; out.push(surf(l[0], l[1], lift)); return out; };
  const stepNear = r => clamp(r * .06, 1.5, 400);
  const pathEnds = {};
  for (const k in PATHS) { const pts = densify(PATHS[k], stepNear, .3); addLine(pts, 0, .07, .7); pathEnds[k] = PATHS[k][PATHS[k].length - 1]; }
  // regional roads (lon, lat), each from a path end or an earlier town
  const LL = (lo, la) => E.llToLocal(lo, la);
  const TOWN = { EMM: [34.99, 31.84], LYD: [34.89, 31.95], JOP: [34.75, 32.05], APO: [34.81, 32.2], CAE: [34.89, 32.5], BET: [35.2, 31.705], HEB: [35.1, 31.53], BSH: [34.79, 31.25],
    BGU: [34.9, 31.6], ASK: [34.55, 31.67], GAZ: [34.45, 31.5], JRC: [35.44, 31.87], JFD: [35.55, 31.84], AMM: [35.93, 31.95], GIB: [35.23, 31.82], RAM: [35.23, 31.85], BTL: [35.22, 31.93],
    SHI: [35.29, 32.06], SHE: [35.28, 32.21], SAM: [35.19, 32.28], JEN: [35.3, 32.46], NAI: [35.35, 32.63], NAZ: [35.3, 32.7], CAN: [35.34, 32.75], CAP: [35.57, 32.88], CPH: [35.69, 33.25],
    DAM: [36.3, 33.51], ANA: [35.26, 31.81], MIC: [35.28, 31.87], EPH: [35.3, 31.95], JV1: [35.5, 32.1], JV2: [35.55, 32.4], SCY: [35.5, 32.5], GAD: [35.68, 32.65], GBN: [35.18, 31.85], BHR: [35.1, 31.88],
    ARI: [33.8, 31.13], PEL: [32.55, 31.04], TYR: [35.2, 33.27], SID: [35.37, 33.56], PTO: [35.08, 32.92], TIB: [35.53, 32.79], MAS: [35.35, 31.31], TEK: [35.21, 31.64], AZO: [34.65, 31.75] };
  const REG = [['@W', 'EMM', 'LYD', 'JOP', 'APO', 'CAE'], ['@S', 'BET', 'HEB', 'BSH'], ['BET', 'BGU', 'ASK', 'GAZ', 'ARI', 'PEL'], ['@E', 'JRC', 'JFD', 'AMM'],
    ['@N', 'GIB', 'RAM', 'BTL', 'SHI', 'SHE', 'SAM', 'JEN', 'NAI', 'NAZ', 'CAN', 'CAP', 'CPH', 'DAM'], ['@NE', 'ANA', 'MIC', 'EPH', 'JV1', 'JV2', 'SCY', 'GAD'], ['@NW', 'GBN', 'BHR', 'LYD'],
    ['JOP', 'AZO', 'ASK'], ['CAE', 'PTO', 'TYR', 'SID'], ['NAZ', 'TIB', 'CAP'], ['BET', 'TEK', 'MAS'], ['JRC', 'MAS']];
  const TP = {}; for (const k in TOWN) TP[k] = LL(...TOWN[k]);
  const stepReg = r => clamp(r * .02, 60, 4000);
  for (const ch of REG) { const poly = ch.map(k => k[0] === '@' ? pathEnds[k.slice(1)] : TP[k]); const pts = densify(poly, stepReg, 2.5);
    const [, gap] = nearestNet(pts[0]); const [nb] = nearestNet(pts[0]); addLine(pts, nb[1] + gap, 6, ch.length > 6 ? 1 : .9); }
  // the world (earth-night.js ROUTES; the first three are the regional roads above)
  for (const r of E.routePolylines(30000).slice(3)) { const pts = r.pts.map(([lo, la]) => { const gd = E.gcDist(lo, la); if (gd < PATCH - 8000) { const [x, z] = LL(lo, la); return surf(x, z, 3); } return E.llToWorld(lo, la, 400, V()); });
    const [nb, gap] = nearestNet(pts[0]); addLine(pts, nb[1] + gap, 120, r.sea.map(s => s ? .6 : 1)); r.endD = netV[netV.length - 1][1]; r.endP = pts[pts.length - 1]; lines[lines.length - 1].end = r; }
  const ROADS = E.lineMesh(lines, { minPx: 2.0 }); S.add(ROADS.mesh);

  // ---------------------------------------------------------------- lamps: Jerusalem's windows and torches, the villages, the world's cities
  const lamps = [], far = [];
  { const r = rng(901), gate = V(60, 0, -705), dGate = netV.find(([p]) => p.distanceTo(localToW(60, -705, H(60, -705) + .3, V())) < 30)?.[1] ?? 1100;
    let n = 0; while (lamps.length < 2400 && n++ < 60000) { const x = -560 + r() * 880, z = -700 - r() * 1060; if (!inCity(x, z)) continue;
      const y = H(x, z) + 3 + r() * 6; const p = localToW(x, z, y, V()); lamps.push({ p, d: dGate + Math.hypot(x - gate.x, z - gate.z) * 1.15 + r() * 120, b: .35 + r() * .6, s: .6 + r() * .6, f: 160 }); }
    for (let i = 0; i < 40; i++) { const x = TMB.x0 + 20 + r() * 280, z = TMB.z1 - 10 - r() * 260; lamps.push({ p: localToW(x, z, TMB.top + 3, V()), d: dGate + 60 + r() * 200, b: 1.2, s: 1.2, f: 200 }); }   // torches on the Temple courts
  }
  // villages at every town and hamlets over the land; each lamp's moment is its distance along the nearest road (+ the walk off it)
  { const r = rng(515), towns = Object.keys(TOWN).map(k => [TP[k], k === 'DAM' || k === 'GAZ' || k === 'CAE' || k === 'JOP' ? 3 : 1.4]);
    const hamlets = []; let n = 0; while (hamlets.length < 260 && n++ < 9000) { const a = r() * 6.283, d = 2500 + Math.pow(r(), 1.3) * 150000, x = Math.cos(a) * d, z = Math.sin(a) * d; H(x, z); if (WATER) continue; if (inCity(x, z)) continue; hamlets.push([[x, z], .5 + r() * .6]); }
    // Bethany, Bethphage and the hamlets near the hill (small)
    hamlets.push([[-820, 1700], 1.2], [[-200, 600], .5], [[900, 250], .6], [[1500, -900], .7], [[-1600, 900], .6]);
    for (const [[x, z], sz] of [...towns, ...hamlets]) { const pc = surf(x, z, 4), [nb, gap] = nearestNet(pc), d0 = nb[1] + gap * 1.3, nl = Math.round(6 + sz * 22), rad = 120 + sz * 260;
      for (let i = 0; i < nl; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * rad, xx = x + Math.cos(a) * rr, zz = z + Math.sin(a) * rr; const y = H(xx, zz); if (WATER) continue;
        lamps.push({ p: localToW(xx, zz, y + 3.5, V()), d: d0 + rr * 1.2 + r() * rad, b: .4 + r() * .7, s: .7 + r() * .5, f: Math.max(200, d0 * .02) }); } } }
  const LAMPS = E.lampPoints(lamps, { px: 5.0, minPx: 1.3 }); LAMPS.u.uRef.value = 900; S.add(LAMPS.pts);
  // the world's cities (outside the terrain) and a brighter lamp where each road ends ("the village at each road's end")
  for (const c of E.cityLights({ count: 8000 })) far.push({ p: E.llToWorld(c.lon, c.lat, 600, V()), d: c.gd * 1.28 + c.j * 260000, b: c.b, s: 1, f: 380000 });
  for (const L of lines) if (L.end) far.push({ p: L.end.endP.clone(), d: L.end.endD, b: 2.4, s: 3.2, f: 450000 });
  const CITIES = E.lampPoints(far, { px: 4.2, minPx: 1.25 }); CITIES.u.uRef.value = 4e6; S.add(CITIES.pts);

  // ---------------------------------------------------------------- the globe
  const GL = E.buildGlobe(); S.add(GL.mesh, GL.atm);

  // ---------------------------------------------------------------- the camera: one move (see beats)
  const A_END = 3.0e7;
  let crane0 = null;
  function groundCam(t) {
    const tT = T;
    // N15c: low, from the south — the group on the crest against the evening sky, the sun at the right, Peter's arm pointing left (off
    // frame, at the city); then the camera follows his point: an arc round to behind them (86°, 8 s, eased) rising over their heads until
    // the walls, the Temple and the Antonia stand at the end of their long shadows (Q6). N15d: the lens closes on the banners.
    // N28c: back on the group, the camera goes round with Peter as he turns to the far horizon (pan, 4.2 s).
    const yaw = keys([[tT.a, 90], [tT.arc[0], 89], [tT.arc[1], 4], [tT.push[0], 5], [tT.push[1], 10], [tT.pan[0], 10], [tT.pan[1], 50]], t);
    const dist = keys([[tT.a, 22.5], [tT.arc[0], 21.8], [tT.arc[1], 19.6], [tT.c + 5.7, 18.8], [tT.pan[0], 18.8], [tT.pan[1], 20.0]], t);
    const hgt = keys([[tT.a, 1.45], [tT.arc[0], 1.5], [tT.arc[1], 5.0], [tT.c + .4, 5.6], [tT.c + 5.7, 5.0], [tT.pan[0], 4.9], [tT.pan[1], 4.5], [tT.crane, 4.55]], t);
    const pitch = keys([[tT.a, -.7], [tT.arc[0], -.8], [tT.arc[1], -12.0], [tT.c + .4, -13.5], [tT.c + 5.7, -9.0], [tT.pan[0], -9.2], [tT.pan[1], -10.6]], t);
    const fov = keys([[tT.a, 40], [tT.push[0], 40], [tT.push[1], 30], [tT.widen[0], 30], [tT.widen[1], 40]], t);
    const x = -hd(yaw).x * dist, z = -hd(yaw).z * dist, y = H(x, z) + hgt;
    const focus = lerp(lerp(dist + .4, 980, eio((t - tT.rackW[0]) / (tT.rackW[1] - tT.rackW[0]))), dist + .4, eio((t - tT.rackG[0]) / (tT.rackG[1] - tT.rackG[0])));
    return { pos: V(x, y, z), yaw, pd: -pitch, fov, focus, aperture: 2.1, dist, alt: y };
  }
  function camAt(t) {
    const tT = T;
    if (t < tT.crane) return groundCam(t);
    if (!crane0) crane0 = groundCam(tT.crane);
    const c0 = crane0, lnA0 = Math.log(c0.alt), lnA1 = Math.log(A_END);
    const s = .73 * ss(tT.crane, tT.craneEnd, t) + .27 * ss(tT.tail[0], tT.tail[1], t), alt = Math.exp(lerp(lnA0, lnA1, s)), la = Math.log(alt);
    const dip = Math.acos(E.R_E / (E.R_E + alt)) / D2R, wLow = ss(lnA0, Math.log(300), la), wHigh = ss(Math.log(2e4), Math.log(1.5e7), la);
    const gOff0 = Math.atan(c0.alt / c0.dist) / D2R - c0.pd;
    const pd = lerp(lerp(c0.pd, dip + 14, wLow), 90, wHigh), gOff = lerp(gOff0, -3.4, wHigh), b = alt / Math.tan(Math.min(89.5, pd + gOff) * D2R);
    const h = hd(50), pos = V(-h.x * b, alt, -h.z * b);
    return { pos, yaw: 50, pd, fov: lerp(c0.fov, 39, wLow), focus: Math.hypot(b, alt), aperture: 2.1 * (1 - ss(tT.crane, tT.crane + 2.2, t)), dist: b, alt };
  }
  // how far the light has run along the roads (metres): ahead of the camera, a little more each moment
  const CK = [[Math.log(3), 8], [Math.log(3e4), 5], [Math.log(2.3e5), 3.5], [Math.log(2e6), 1.75], [Math.log(1.1e7), .8], [Math.log(2.4e7), .58]];
  function front(t) { if (t < T.crane) return 0; const c = camAt(Math.min(T.g, t + .5)), base = crane0.alt; return Math.max(0, tab(CK, Math.log(c.alt)) * (c.alt - base)); }

  // ---------------------------------------------------------------- one frame
  function setView(t) {
    const c = camAt(t), dirH = hd(c.yaw), pdr = c.pd * D2R;
    const dir = dirH.clone().multiplyScalar(Math.cos(pdr)).add(V(0, -Math.sin(pdr), 0));
    cam.position.copy(c.pos); cam.up.copy(dirH.clone().multiplyScalar(Math.sin(pdr)).add(V(0, Math.cos(pdr), 0))); cam.lookAt(c.pos.clone().add(dir));
    cam.fov = c.fov; const altG = c.pos.y - (c.alt < 50 ? H(c.pos.x, c.pos.z) : 0);
    cam.near = c.alt < 30 ? 1 : Math.max(1, .22 * altG); cam.far = Math.max(3.5e5, Math.sqrt((E.R_E + c.alt) ** 2 - E.R_E ** 2) * 1.2 + 3e5);
    return c;
  }
  function frame(t) {
    const c = setView(t), e = SUNE(t), night = ss(-.5, -9, e), sunDir = V(Math.sin(SUN_HEAD * D2R) * Math.cos(e * D2R), Math.sin(e * D2R), -Math.cos(SUN_HEAD * D2R) * Math.cos(e * D2R));
    const alt = c.alt, space = ss(9e3, 7e4, alt);
    // sun, sky, ambient, moon
    const sk = ss(-.8, 3.5, e); sunL.intensity = 3.1 * sk; sunL.color.copy(col('#ffd39a')).lerp(col('#ff9a52'), 1 - ss(1, 8, e)); sunL.castShadow = sk > .01; if (sunL.castShadow) fitShadow(sunDir);
    hemi.color.copy(col('#a6b4cc')).lerp(col('#46578a'), ss(4, -3, e)).lerp(col('#26345e'), night); hemi.groundColor.copy(col('#7a5a3a')).lerp(col('#141018'), night); hemi.intensity = lerp(.55, .34, night);
    moon.intensity = .55 * night;
    skyU.uUp.value.copy(cam.position).sub(V(0, -E.R_E, 0)).normalize(); skyU.uSun.value.copy(sunDir); skyU.uE.value = e; skyU.uDip.value = Math.sin(Math.acos(E.R_E / (E.R_E + Math.max(0, alt))) ); skyU.uSpace.value = space; skyU.uStars.value = ss(-3, -10, e) * (1 - space * .3) + space * .8;
    const F = front(t); skyU.uGlow.value = ss(60, 2000, F) * (1 - ss(2e5, 1.2e6, F)) * .28 * (1 - space);
    // fog: warm haze by day, violet at dusk, deep blue at night; thinning out and gone above the air (closed form stays finite)
    const A = film.atmos, fogDay = col('#cba57a', .62), fogDusk = col('#7a6276', .32), fogNight = col('#0c1226', .1);
    const fc = fogDay.clone().lerp(fogDusk, ss(5, -2, e)).lerp(fogNight, night); A.color.copy(fc); A.colorUp = fc.clone().multiplyScalar(.92);
    A.density = 1.1e-4 * (1 - ss(3e4, 7.5e4, alt)); A.falloff = alt > 7.6e4 ? 1e-9 : 5.5e-4;
    terrU.uSkyW.value.copy(fc).multiplyScalar(.9 + .4 * (1 - night)); terrU.uDetail.value = 1;
    // look: exposure and bloom ride up into the night so the lamps glow at the first film's level
    const L = film.look; L.exposure = lerp(1.0, 1.4, ss(2, -8, e)) * lerp(1, 1.1, space); film.bloomCfg.strength = lerp(.06, .15, ss(0, -8, e)) * lerp(1, .45, ss(3e5, 5e6, alt)); L.grain = .028;
    const Df = film.dofCfg; Df.focus = c.focus; Df.aperture = c.aperture; Df.maxCoc = 12;
    // the light along the roads and the lamps
    const uH = Math.max(.7, F * .11);
    ROADS.u.uF.value = F; ROADS.u.uT.value = t; ROADS.u.uHead.value = uH; ROADS.u.uK.value = lerp(.9, 1.2, night) * lerp(1, .78, ss(1e6, 1e7, alt)); ROADS.u.uRes.value.set(film.w, film.h); ROADS.u.uPull.value = alt < 4e4 ? .004 : .0008; ROADS.u.uMinPx.value = lerp(2.0, 1.6, ss(1e6, 1e7, alt)) * film.scale; ROADS.u.uPullMax.value = 120;
    LAMPS.u.uF.value = F; LAMPS.u.uK.value = lerp(.4, 1.1, night); LAMPS.u.uPull.value = alt < 4e4 ? .003 : .0005; LAMPS.u.uScale.value = film.scale;
    CITIES.u.uF.value = F; CITIES.u.uK.value = 1.0; CITIES.u.uPull.value = .0004; CITIES.u.uScale.value = film.scale;
    // the globe (only once the camera is high enough for it to show past the terrain), its air from outside
    GL.mesh.visible = alt > 1500; GL.atm.visible = alt > 9e4; GL.au.uK.value = ss(1.2e5, 6e5, alt) * 1.0; GL.au.uSun.value.copy(sunDir).setY(-.05).normalize(); GL.u.uSun.value.copy(sunDir);
    GL.u.uHaze.value.copy(fc).multiplyScalar(lerp(1, .35, space)); GL.u.uHazeL.value = lerp(2.5e5, 8e6, ss(1e4, 2e6, alt));
    terrU.uGK.value = ss(9e3, 6e4, alt); terrU.uGLand.value.copy(GL.u.uLand.value); terrU.uGSea.value.copy(GL.u.uSea.value); terrU.uGHaze.value.copy(GL.u.uHaze.value); terrU.uGHazeL.value = GL.u.uHazeL.value;
    // banners
    banU.uT.value = t; banU.uGust.value = Math.exp(-Math.pow((t - T.gust - .8) / 1.1, 2)) * .9;
    people(t);
    film.render(t);
  }
  function blit(ctx) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(film.canvas, 0, 0, W, Hh); ctx.restore(); }
  function draw(ctx, t, B) {
    if (!T) { T = beats(B); SUNE = sunElev(T); }
    frame(clamp(t, T.a, T.g)); blit(ctx);
  }
  return { film, draw, beats: () => T, camAt: t => (T ? camAt(t) : null), front: t => (T ? front(t) : 0), people: { king, men } };
}
