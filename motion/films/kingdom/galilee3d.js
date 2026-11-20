// galilee3d.js — 「kingdom」 1부 (film 0.0–66.8 and 90.3–110.0): the Sea of Galilee at dawn as a painted 3D world, in the engine of
// the liked part-2 village (heal-village.js: motion/films/lib3d cine.js + kit.js — height fog with the sun's in-scatter, bloom,
// depth of field, AgX; robed people from people3d.js). One world, one lake, one low sun in the east (−z); +x is south.
// Skills read first (rules.json skills-first) — the sources of what is copied (never edited at the source):
//   motion-skills/cinematic-3d (the engine; lib3d/cine.js + kit.js are its vendored copies; the planar mirror of cine.js is the
//     lake, its wetMaterial() the pattern for the water's reflection lookup; kit.js sky() copied into skyDome() with a cloud cover,
//     a gap and a far point of light added) · cinecode/references/camera-moves.md (the named moves below) ·
//     luminous-score (a light that switches on and settles — the gold marks on the scroll: a soft rise, a small flare, a held glow)
//   · canvas-film/references/BODY-CHECK.md (fixed-length IK, planted feet, elbows down/out) · heal-village.js (sun lamp, dust,
//     godRays, birds) · crowd-evening3d.js (rim light on backlit people, world-space ground, grass tufts, person mix).
// Film ref: 「아웃 오브 아프리카」(1985, OPUSCAR 58) — a low flight over a lake into amber haze, birds lifting as we pass;
//           「반지의 제왕: 왕의 귀환」(2003, OPUSCAR 76) — the beacons: the lakeside villages light one by one along the shore.
// Shots (every time from beats(B), B = script.json line times):
//   S1 0–8      FPV glide low over the misted water toward the sun just rising behind a hill; a small figure stands on it;
//               birds lift off the water as we pass; linear, easing out at the end (the hook).
//   S2 8–Q1     behind him on the crest (back view, small), a slow 50° arc: the crowd sits on the slope below in loose groups,
//               the lake beyond, the far shore's villages coming into view one after another; N04 he lifts his hand, heads rise in
//               a ripple (each on his own delay).
//   S3 Q1–N05   high and wide from over the water: the morning light crosses the lake and climbs onto the crowd (truck, slow).
//   S4 N05–N07  low over the water behind a boat: the small figure standing in it speaks to the crowd on the beach, against the
//               sun (back view); the boat rocks; push in, slow.
//   S5 N07–N06  one camera: an open scroll on a flat stone at the water's edge in the raking light, marks of the same word light
//               one by one (the writing is only texture) → crane up 6 s (log altitude, ease-in-out) into the sky for the title →
//               the lake and villages spread under it → N09b cloud comes over, the light sinks → N09c tilt up to a far point of
//               light above the clouds → N09d the light comes down as a shaft onto a lakeside village; crane down 4 s (soft
//               start, ease-out) following it; the light spreads over the village, the fields, the lake — everything in the sun.
//   S6 N08–END  the north-shore village: the people press after him, a hand at his sleeve; he turns to the road and walks on,
//               unhurried (planted feet); Q3 crane up 6 s (slow ease-in-out), the villages along the shore toward the sun light
//               one by one; a slow turn to the sun for the light-to-light hand-off to part 2's window (sun pane at 0.5 W, 0.26 H).
// Rules kept: Jesus never by face — from behind, small, or far against the light; no halo; men in head cloths, turbans or short
// hair with beards; no long hair; no words in the art (the scroll's writing is stroke texture only); the light (shaft, pool)
// goes to the village he is about, never beside it. No per-frame dither (film.frame fixed); shadows from a fixed sun into a
// fixed box per shot (no crawl); one terrain mesh (no overlapping layers, no z-fighting); near = .4 m for depth precision.
//
// API: const G = await (await import('./galilee3d.js')).build(W, H);  G.draw(ctx, t, B)  t = FILM seconds;
//      B = { N01 N03 N04 L1 Q1 N05 N07 T1 N09 N09b N09c N09d N06 N08 L3 Q3 END } — END = part 2's first line (C2a). Pure in t.
//      G.sunAt(t) → the sun's place on the frame (0..1) — the page aligns the hand-off with it. G.joints() — pose numbers for the
//      body check (max per-frame joint deltas).
import { Film, THREE, V, col, rng, GLSL, FOG_GLSL } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const sine = x => { x = clamp(x); return .5 - .5 * Math.cos(Math.PI * x); };
const lv = (a, b, k) => a.clone().lerp(b, k);
const logLerp = (a, b, k) => Math.exp(lerp(Math.log(a), Math.log(b), k));
const D2R = Math.PI / 180;
// an ease-out with a soft start: the speed rises over the first `rise` of the move, then dies away as (1 − x)^dec
const SOFT = new Map();
function softOut(x, rise = .16, dec = 1.8) {
  const key = rise + ':' + dec; let tab = SOFT.get(key);
  if (!tab) { const n = 400, v = i => { const u = i / n; return ss(0, rise, u) * Math.pow(1 - u, dec); }; tab = new Float64Array(n + 1); let s = 0;
    for (let i = 1; i <= n; i++) { s += (v(i - 1) + v(i)) / 2; tab[i] = s; } for (let i = 0; i <= n; i++) tab[i] /= s; SOFT.set(key, tab); }
  x = clamp(x) * (tab.length - 1); const i = Math.floor(x), f = x - i; return i >= tab.length - 1 ? 1 : lerp(tab[i], tab[i + 1], f);
}

// ---------------------------------------------------------------- value noise (JS, for the land)
const h2 = (i, j) => { let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
function vn(x, y) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return lerp(lerp(h2(xi, yi), h2(xi + 1, yi), u), lerp(h2(xi, yi + 1), h2(xi + 1, yi + 1), u), v); }
function fbm(x, y, o = 4) { let s = 0, a = .5, n = 0; for (let i = 0; i < o; i++) { s += a * vn(x, y); n += a; x = x * 2.03 + 11.7; y = y * 2.03 + 4.1; a *= .5; } return s / n; }

// ---------------------------------------------------------------- the land (metres): the lake is an ellipse, the sun in the east (−z)
export const CX = 0, CZ = -900, RX = 1300, RZ = 820;
const wob = a => 1 + .04 * Math.sin(3 * a + .7) + .025 * Math.sin(5 * a + 2.1) + .012 * Math.sin(11 * a + .3);
export function inland(x, z) { const dx = (x - CX) / RX, dz = (z - CZ) / RZ; return (Math.hypot(dx, dz) / wob(Math.atan2(dz, dx)) - 1) * 950; }
// a point on the shore at angle θ round the lake (θ = 90° west shore, 180° north, 270° east), and the way along it
export function shoreAt(th) { const a = th * D2R; let lo = .7, hi = 1.3; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, x = CX + RX * Math.cos(a) * m, z = CZ + RZ * Math.sin(a) * m; if (inland(x, z) < 0) lo = m; else hi = m; }
  const m = (lo + hi) / 2; return V(CX + RX * Math.cos(a) * m, 0, CZ + RZ * Math.sin(a) * m); }
const outward = th => { const p = shoreAt(th), c = V(CX, 0, CZ); return p.sub(c).normalize(); };
const along = th => { const a = shoreAt(th - .3), b = shoreAt(th + .3); return b.sub(a).normalize(); };   // toward increasing θ
// the preaching hill on the east shore, the scroll's stone on the west shore, the villages
const HILLP = (() => { const s = shoreAt(270); return V(s.x, 0, s.z - 96); })();
function hillBump(x, z) { const dx = x - HILLP.x, dz = z - HILLP.z; return 10 * Math.exp(-(dx * dx / (2 * 80 * 80) + dz * dz / (2 * 60 * 60))) + 2.5 * Math.exp(-((dx + 40) ** 2 / (2 * 30 * 30) + (dz + 10) ** 2 / (2 * 25 * 25))); }
export function hgt(x, z) {
  const m = inland(x, z);
  if (m < 0) return -.75 + Math.max(m * .05, -9);                           // a small bank, then the lake bed
  const n1 = fbm(x * .0016 + 3, z * .0016 - 1), n2 = fbm(x * .006, z * .006 + 7), n3 = fbm(x * .03 + 1, z * .03);
  let h = .3 + 1.5 * ss(0, 26, m) + m * .016;                               // the beach, the bank
  h += (14 + 40 * n1) * ss(60, 800, m);                                     // rolling hills inland
  h += 6 * (n2 - .5) * ss(10, 140, m) + .9 * (n3 - .5) * ss(4, 40, m);
  h += 210 * ss(-3200, -4400, z) * (.72 + .5 * fbm(x * .0009 + 5, 1.3, 3));    // the far ridge in the east (low against the sun)
  h += 60 * ss(250, 1500, z) * (.6 + .6 * n1);                              // the hills behind the west shore
  h += hillBump(x, z) * ss(-6, 20, m);
  return h;
}
const groundAt = (x, z) => V(x, hgt(x, z), z);

export function beats(B) {
  const T = { n01: B.N01, n03: B.N03, n04: B.N04, l1: B.L1, q1: B.Q1, n05: B.N05, n07: B.N07, t1: B.T1, n09: B.N09, n09b: B.N09b, n09c: B.N09c,
    n09d: B.N09d, n06: B.N06, n08: B.N08, l3: B.L3, q3: B.Q3, end: B.END };
  const D = .35;   // half a dissolve
  T.fly = [0, T.n01 + 7.7];                                 // S1: the 8 s glide
  const cuts = [0, T.fly[1], T.q1, T.n05, T.n07];
  T.shots = cuts.map((a, i) => [i ? a - D : 0, i < 4 ? cuts[i + 1] + D : T.n06]);   // S1 … S5 (soft dissolves between them)
  T.shots.push([T.n08, T.end]);                             // S6: one camera to the hand-off
  T.sunrise = [0, T.fly[1]];                                // S1 the disc clears the far ridge
  T.birds = T.n01 + 2.4;                                    // S1 the flock lifts (each on his own delay as we near)
  T.arm = [T.n04 + .3, T.n04 + 1.9];                        // S2 he lifts his hand and speaks
  T.heads = T.n04 + .6;                                     // S2 heads rise in a ripple
  T.front = [T.q1 + .4, T.q1 + 6.6];                        // S3 the morning light crosses the lake and the crowd
  T.marks = [T.n07 + .9, T.n07 + 5.3];                      // S5 the marks light on the scroll
  T.crane = [T.t1 - 2.0, T.t1 + 4.0];                       // S5 crane up 6 s
  T.dim = [T.n09b + .3, T.n09b + 3.2];                      // S5 the cloud comes, the light sinks
  T.tilt = [T.n09c + .15, T.n09c + 2.75];                   // S5 tilt up to the far light
  T.point = [T.n09c + .6, T.n09c + 2.2];
  T.down = [T.n09d + .05, T.n09d + 4.05];                   // S5 crane down 4 s, following the light
  T.beam = [T.n09d - .1, T.n09d + 1.8];                     // the shaft grows down from the point to the village
  T.pool = [T.n09d + 1.3, T.n09d + 5.0];                    // the light spreads from the village over everything
  T.clear = [T.n09d + 1.2, T.n09d + 5.4];
  T.turn = [T.n08 + .1, T.n08 + 1.7];                       // S6 he turns from them to the road
  T.walk0 = T.n08 + .9;                                     // S6 his first step
  T.craneC = [T.q3, T.q3 + 6.0];                            // S6 crane up 6 s
  T.panC = [T.q3 + 4.6, T.end - 1.3];                       // S6 the slow turn and tilt to the sun
  T.xd = [T.end - 1.2, T.end];                              // the light-to-light dissolve (drawn by the page)
  T.beacons = [0, 1, 2, 3, 4, 5].map(i => T.q3 + 1.6 + i * 1.45);
  return T;
}

export async function build(W, H) {
  const vert = H > W, FOV = vert ? 46 : 32;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .4, far: 7000,
    atmos: { density: .00085, falloff: .014, base: 0, start: 6, color: col('#dcae80', .7), colorUp: col('#aab0b6', .58), max: 5000, scatter: 1, anisotropy: .8, phaseMix: .85 },
    bloom: { strength: .06, radius: 1.1, tint: col('#ffe2b8') },
    dof: { focus: 40, aperture: .6, maxCoc: 20 },
    look: { exposure: 1.0, contrast: 1.04, saturation: 1.02, lift: col('#0c0906'), shadowTint: col('#d6d2e6'), highTint: col('#fff0d8'), vignette: .28, grain: .022, ca: .3 },
  });
  film.canvas.style.display = 'none';
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither: no per-frame shimmer in the DOF / scatter
  const S = film.scene, cam = film.camera;
  const mirU = film.mirror({ y: 0, res: .5, streak: 1.2, atmos: true });
  let T = null;

  // ---------------------------------------------------------------- light: one sun, low in the east, fixed (only the seen disc rises)
  const SUN_E = 9 * D2R, SUN = V(0, Math.sin(SUN_E), -Math.cos(SUN_E)).normalize();
  const sky = skyDome(film, { top: col('#56739f', .62), mid: col('#d4b291', 1.0), horizon: col('#ffd39a', 1.75), sunDir: SUN, sunColor: col('#fff1d4', 11), sunGlow: col('#ffc583', 1.7),
    clouds: .22, cloudColor: col('#ffe2c0', 1.15), cloudShade: col('#b49284', .72) });
  const SK = sky.u;
  const hemi = new THREE.HemisphereLight(col('#a8b6cc'), col('#7a5e40'), .62); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffd7a2'), 3.1); sunL.castShadow = true; sunL.shadow.mapSize.set(4096, 4096);
  Object.assign(sunL.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 900 }); sunL.shadow.bias = -.0004; sunL.shadow.normalBias = .05;
  S.add(sunL, sunL.target);
  const sunLamp = film.lamp(V(0, 200, -2000), '#ffcf96', { power: 900, size: 6, fog: 1 });
  let shadowKey = '';
  function shadowAt(c, half) { const k = c.x.toFixed(1) + c.z.toFixed(1) + half; if (k === shadowKey) return; shadowKey = k;
    sunL.target.position.copy(c); sunL.position.copy(c).addScaledVector(SUN, 400); const sc = sunL.shadow.camera; Object.assign(sc, { left: -half, right: half, top: half, bottom: -half }); sc.updateProjectionMatrix(); sunL.target.updateMatrixWorld(); }

  // the light field shared by every material: the morning front (S3), the cloud's dimming (S5), the pool from above (N09d), the
  // villages' beacons (S6). LU is one set of uniform objects, so changing a value reaches every material at once.
  const LU = { uFront: { value: new THREE.Vector4(-1e5, 40, 20, 1) }, uDim: { value: 1 }, uPool: { value: new THREE.Vector4(0, 0, 0, 0) },
    uVil: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, 1, 0)) }, uVilC: { value: col('#ffb468', 1) },
    uSunV: { value: V(0, 0, -1) }, uRimC: { value: col('#ffa868', 1.15) } };
  const LGLSL = `uniform vec4 uFront; uniform float uDim; uniform vec4 uPool; uniform vec4 uVil[8]; uniform vec3 uVilC; float gPool;
    float lightK(vec3 p, out float warm){
      float fr = smoothstep(uFront.x - uFront.y, uFront.x + uFront.y, p.z + p.y * uFront.z);
      float l = mix(uFront.w, 1., fr);
      float pd = length(p.xz - uPool.xy), pool = uPool.w * (1. - smoothstep(uPool.z * .8, uPool.z, pd));
      l *= mix(uDim, 1., clamp(pool, 0., 1.));
      gPool = clamp(pool, 0., 1.) + uPool.w * .9 * exp(-pow((pd - uPool.z * .9) / max(uPool.z * .1, 6.), 2.));   // the pool and its spreading golden edge
      warm = 0.;
      for (int i = 0; i < 8; i++){ vec2 d = p.xz - uVil[i].xy; warm += uVil[i].w * exp(-dot(d, d) / (uVil[i].z * uVil[i].z)); }
      return l;
    }`;
  const lightify = (m, key, { rim = 0, vil = 1 } = {}) => {
    const prev = m.onBeforeCompile, pk = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : () => '';
    m.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r); Object.assign(sh.uniforms, LU); sh.uniforms.uRimS = { value: rim };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLWP;')
        .replace('#include <project_vertex>', `#include <project_vertex>
          { vec4 lw = vec4(transformed, 1.);
          #ifdef USE_INSTANCING
            lw = instanceMatrix * lw;
          #endif
            vLWP = (modelMatrix * lw).xyz; }`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLWP; uniform vec3 uSunV, uRimC; uniform float uRimS;\n' + LGLSL)
        .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
          { float wv; float lk = lightK(vLWP, wv); float wk = min(wv, 1.4) * ${vil.toFixed(2)};
            reflectedLight.directDiffuse *= lk + wk * .9; reflectedLight.directSpecular *= lk; reflectedLight.indirectDiffuse *= mix(.8, 1., lk) + wk * .25;
            totalEmissiveRadiance += diffuseColor.rgb * uVilC * wk * .12;
            { float up = max(dot(normal, normalize((viewMatrix * vec4(0., 1., 0., 0.)).xyz)), 0.);   // the light from above (N09d) lights what faces the sky
              reflectedLight.directDiffuse += diffuseColor.rgb * vec3(1., .86, .62) * gPool * (.35 + .9 * up) * .9; }
            ${rim ? `{ vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 3.2);
              totalEmissiveRadiance += uRimC * fr * smoothstep(-.2, .55, dot(normal, uSunV)) * uRimS * lk; }` : ''} }`); };
    m.customProgramCacheKey = () => pk() + '|gl-' + key; return m; };

  // ---------------------------------------------------------------- materials
  const hashGLSL = GLSL.hash;
  // the ground: spring grass going gold in the low sun, earth, basalt, the beach; olive groves as dark dots far off
  const groundM = new THREE.MeshStandardMaterial({ color: '#7a7a48', roughness: 1 });
  groundM.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + hashGLSL)
      .replace('#include <map_fragment>', `#include <map_fragment>
        { vec2 q = vWP.xz; float dist = length(vWP - cameraPosition), det = 1. - smoothstep(250., 1800., dist);
          float n = fbm(q * .006), m = fbm(q * .045 + 3.), f = fbm(q * .55) * det + .5 * (1. - det), g = fbm(q * 3.1 + 7.) * (1. - smoothstep(20., 120., dist)) + .5 * smoothstep(20., 120., dist);
          vec3 green = vec3(.36, .4, .2), gold = vec3(.58, .5, .28), earth = vec3(.46, .36, .25), sand = vec3(.74, .64, .48), basalt = vec3(.22, .2, .19);
          vec3 c = mix(green, gold, smoothstep(.38, .7, n + (m - .5) * .5));
          c = mix(c, earth, smoothstep(.62, .78, fbm(q * .02 + 9.)) * .55);
          c *= mix(.82, 1.08, m) * mix(.9, 1.06, f) * mix(.93, 1.05, g);
          float steep = 1. - smoothstep(.72, .95, normalize(vWN).y); c = mix(c, earth * .9, steep * .45);
          float rk = smoothstep(.73, .79, fbm(q * .9 + 5.)) * det; c = mix(c, basalt, rk * .7);
          float grove = smoothstep(.62, .7, vnoise(q * .045)) * smoothstep(.45, .7, fbm(q * .004 + 2.)) * smoothstep(1.5, 4., vWP.y) * (1. - smoothstep(1200., 3000., dist));
          c = mix(c, vec3(.2, .23, .15), grove * .55);
          float beach = 1. - smoothstep(.6, 1.9, vWP.y); c = mix(c, sand * mix(.85, 1.05, f), beach * .9);
          { vec2 e = (vWP.xz - vec2(${CX.toFixed(1)}, ${CZ.toFixed(1)})) / vec2(${RX.toFixed(1)}, ${RZ.toFixed(1)}); float a = atan(e.y, e.x);
            float inl = (length(e) / (1. + .04 * sin(3. * a + .7) + .025 * sin(5. * a + 2.1) + .012 * sin(11. * a + .3)) - 1.) * 950.;
            float road = 1. - smoothstep(1.6, 2.8, abs(inl - 26. + sin(vWP.x * .02 + vWP.z * .015) * 1.2)); float rut = road * exp(-pow((abs(inl - 26.) - .7) / .18, 2.)) * .3;
            c = mix(c, vec3(.72, .62, .48) * mix(.9, 1.05, f), road * .8 * det); c *= 1. - rut * det; }
          float wet = 1. - smoothstep(-.4, .5, vWP.y); c *= 1. - wet * .35;
          diffuseColor.rgb = c; }`); };
  groundM.customProgramCacheKey = () => 'gl-ground';
  lightify(groundM, 'ground');
  const wallM = (base, key) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .92 });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP2; varying vec3 vWN2;').replace('#include <project_vertex>', `#include <project_vertex>
        { vec4 w = vec4(transformed, 1.); vec3 nn = objectNormal;
        #ifdef USE_INSTANCING
          w = instanceMatrix * w; nn = mat3(instanceMatrix) * nn;
        #endif
          vWP2 = (modelMatrix * w).xyz; vWN2 = normalize(mat3(modelMatrix) * nn); }`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP2; varying vec3 vWN2;\n' + hashGLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 N = normalize(vWN2); vec2 q = abs(N.y) > .7 ? vWP2.xz : (abs(N.x) > abs(N.z) ? vWP2.zy : vWP2.xy);
            float big = fbm(q * .35 + 3.1), fine = fbm(q * 3.1) * (1. - smoothstep(30., 200., length(vWP2 - cameraPosition))) + .25;
            vec3 c = diffuseColor.rgb * mix(.84, 1.08, big) * mix(.92, 1.05, fine);
            c *= mix(1., .84, smoothstep(.62, .8, fbm(vec2(q.x * 4., q.y * .4))) * (1. - abs(N.y)));   // rain streaks
            diffuseColor.rgb = c; }`); };
    m.customProgramCacheKey = () => 'gl-wall-' + key; return lightify(m, 'wall' + key); };
  const M = {
    wall: wallM('#ddc6a0', 'a'), dark: lightify(K.std('#1c140e', { roughness: 1 }), 'dark'), roof: lightify(K.std('#c4b08e', { roughness: .95 }), 'roof'),
    trunk: lightify(K.std('#4a3c2c', { roughness: .95 }), 'trunk'), palm: lightify(K.std('#56703e', { roughness: .85, side: THREE.DoubleSide }), 'palm'),
    wood: lightify(K.std('#5a4028', { roughness: .85 }), 'wood'), hull: lightify(K.std('#3e2e20', { roughness: .8, side: THREE.DoubleSide }), 'hull'),
    rock: lightify(K.std('#5a544c', { roughness: .95 }), 'rock'), stone: lightify(K.std('#8e8474', { roughness: .9 }), 'stone'),
  };

  // ---------------------------------------------------------------- the terrain: ONE mesh, a world-fixed grid, dense where people stand
  function axis(lo, hi, spans, cmin = 1.7, cmax = 46, grow = .07) {
    const xs = [lo]; let x = lo;
    while (x < hi) { let c = cmax; for (const [a, b] of spans) { const d = x < a ? a - x : x > b ? x - b : 0; c = Math.min(c, cmin + d * grow); } x = Math.min(hi, x + c); xs.push(x); }
    return xs; }
  // places that need a fine grid (x: south +; z: west +)
  const V0TH = 176, VWTH = 84, SCROLLTH = 95.5;
  const V0P = shoreAt(V0TH), VWP = shoreAt(VWTH), SCP = shoreAt(SCROLLTH), BOATS = shoreAt(281);
  const XS = axis(-3600, 3600, [[HILLP.x - 140, HILLP.x + 140], [V0P.x - 120, V0P.x + 120], [SCP.x - 40, SCP.x + 40], [BOATS.x - 50, BOATS.x + 50], [VWP.x - 60, VWP.x + 60]]);
  const ZS = axis(-6500, 2600, [[HILLP.z - 90, HILLP.z + 140], [V0P.z - 120, V0P.z + 120], [SCP.z - 40, SCP.z + 60], [BOATS.z - 40, BOATS.z + 60], [VWP.z - 60, VWP.z + 60]]);
  { const nx = XS.length, nz = ZS.length, pos = new Float32Array(nx * nz * 3), nor = new Float32Array(nx * nz * 3);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = XS[i], z = ZS[j], k = (j * nx + i) * 3, y = hgt(x, z);
      pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
      const e = Math.max(.6, Math.min(XS[Math.min(nx - 1, i + 1)] - XS[Math.max(0, i - 1)], ZS[Math.min(nz - 1, j + 1)] - ZS[Math.max(0, j - 1)]) * .5);
      const gx = (hgt(x + e, z) - hgt(x - e, z)) / (2 * e), gz = (hgt(x, z + e) - hgt(x, z - e)) / (2 * e), l = Math.hypot(gx, 1, gz);
      nor[k] = -gx / l; nor[k + 1] = 1 / l; nor[k + 2] = -gz / l; }
    const idx = new Uint32Array((nx - 1) * (nz - 1) * 6); let o = 0;
    for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx[o++] = a; idx[o++] = c; idx[o++] = b; idx[o++] = b; idx[o++] = c; idx[o++] = d; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeBoundingSphere(); const land = new THREE.Mesh(g, groundM); land.receiveShadow = true; land.frustumCulled = false; S.add(land); }

  // ---------------------------------------------------------------- the lake: the engine's planar mirror, small waves, the sun's road
  const waterU = { uT: { value: 0 } };
  const waterM = new THREE.MeshStandardMaterial({ color: '#2c3c42', roughness: .22, metalness: 0 });
  waterM.onBeforeCompile = sh => { Object.assign(sh.uniforms, mirU, waterU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWW;').replace('#include <project_vertex>', '#include <project_vertex>\nvWW = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vWW; uniform sampler2D tMirror, tMirrorBlur; uniform mat4 mirrorMatrix; uniform float uT; vec2 wG;
        ${hashGLSL}
        // small wind waves: a few directional trains (gradient only), finer far less (no far sparkle)
        vec2 waveG(vec2 p, float t, float det){ vec2 g = vec2(0.);
          vec4 W[5]; W[0] = vec4(normalize(vec2(1., .3)), .09, .55); W[1] = vec4(normalize(vec2(.6, -1.)), .13, .8); W[2] = vec4(normalize(vec2(-1., .45)), .21, 1.1); W[3] = vec4(normalize(vec2(.2, 1.)), .37, 1.6); W[4] = vec4(normalize(vec2(-.7, -.6)), .6, 2.2);
          vec2 wp = p + vec2(vnoise(p * .05), vnoise(p * .05 + 3.)) * 14.;   // bend the trains so they never read as stripes
          for (int i = 0; i < 5; i++){ float k = W[i].z * 6.2831, a = (i > 1 ? det : .35 + .65 * det) * .022 / W[i].z; float ph = dot(W[i].xy, wp) * k - t * W[i].w * 1.3 + float(i) * 1.7;
            g += W[i].xy * cos(ph) * a * k * .16 * (.55 + .9 * vnoise(p * .03 + float(i) * 5.)); }
          g += (vec2(vnoise(p * .9 + t * .2), vnoise(p * .9 + 7. - t * .17)) - .5) * .06 * det;
          g += (vec2(vnoise(p * .012 + t * .01), vnoise(p * .012 + 9. - t * .01)) - .5) * .05;   // slow wide swells (wind patches)
          return g; }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { float dist = length(vWW - cameraPosition); float det = 1. - smoothstep(60., 600., dist); wG = waveG(vWW.xz, uT, det);
          vec3 nW = normalize(vec3(-wG.x, 1., -wG.y)); normal = normalize((viewMatrix * vec4(nW, 0.)).xyz); }`)
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        { float wv; float lk = lightK(vWW, wv); reflectedLight.directDiffuse *= lk; reflectedLight.directSpecular *= lk * .35; reflectedLight.indirectDiffuse *= mix(.7, 1., lk);
          totalEmissiveRadiance += vec3(1., .78, .52) * .13 * lk * lk; }`)
      .replace('#include <opaque_fragment>', `
        { vec4 mp = mirrorMatrix * vec4(vWW, 1.); vec2 muv = mp.xy / mp.w; float dist = length(vWW - cameraPosition);
          vec2 dd = wG * vec2(.35, 1.) * .55 / (1. + dist * .012);
          vec3 sharpR = texture2D(tMirror, muv + dd).rgb, blurR = texture2D(tMirrorBlur, muv + dd * 1.6).rgb;
          vec3 Vd = normalize(cameraPosition - vWW); float cosT = clamp(dot(Vd, normalize(vec3(-wG.x, 1., -wG.y))), 0., 1.);
          float fres = .02 + .98 * pow(1. - cosT, 5.);
          vec3 R = mix(sharpR, blurR, .45);
          outgoingLight = outgoingLight * (1. - fres * .85) + R * mix(.12, 1., fres) * vec3(.96, .97, 1.); }
        #include <opaque_fragment>`); };
  waterM.customProgramCacheKey = () => 'gl-water';
  lightify(waterM, 'water', { vil: 0 });
  { const wg = new THREE.PlaneGeometry(3400, 2300, 1, 1); wg.rotateX(-Math.PI / 2); const w = new THREE.Mesh(wg, waterM); w.position.set(CX, 0, CZ); w.layers.set(1); S.add(w); }

  // ---------------------------------------------------------------- the villages: flat-roofed houses, lanes, courtyard walls
  const houseG = K.roundedBox(1, 1, 1, .04, 1); houseG.translate(0, .5, 0);
  const roofG = K.roundedBox(1, 1, 1, .02, 1); roofG.translate(0, .5, 0);
  const doorG = new THREE.PlaneGeometry(1, 1);
  const VILL = [];   // { c: centre, th, lamp }
  function village(th, n, seed, { spread = 90, depth = 70, doors = false, road = 0 } = {}) {
    const s = shoreAt(th), out = outward(th), al = along(th), r = rng(seed), items = [], roofs = [], drs = [];
    const c = s.clone().addScaledVector(out, 30 + depth * .5);
    for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) {
      const u = (r() - .5) * spread * 2, v = 14 + Math.pow(r(), .8) * depth, w = 4.5 + r() * 4, d = 5 + r() * 4, h = 2.7 + r() * 1.6;
      const p = s.clone().addScaledVector(al, u).addScaledVector(out, v);
      if (items.some(q => Math.hypot(q.p.x - p.x, q.p.z - p.z) < (q.w + w) * .52 + .8)) continue;   // no overlapping houses
      if (Math.abs(u) < 4 && v < 40) continue;   // a lane down to the water
      if (road && Math.abs(v - road) < 8 + d * .5) continue;   // the shore road stays open
      const y = Math.min(hgt(p.x, p.z), hgt(p.x + 3, p.z + 3), hgt(p.x - 3, p.z - 3)) - .4, ry = Math.atan2(al.x, al.z) + (r() - .5) * .25;
      items.push({ p, w, d, h, y, ry, up: r() < .45, uw: .4 + r() * .3 }); i++; }
    for (const it of items) { const q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), it.ry);
      roofs.push(new THREE.Matrix4().compose(V(it.p.x, it.y + it.h + .4, it.p.z), q, V(it.w + .2, .2, it.d + .2)));
      if (it.up) roofs.push(new THREE.Matrix4().compose(V(it.p.x, it.y + it.h + .6, it.p.z), q, V(it.w * it.uw, it.h * .55, it.d * .5)));
      if (doors) { const fwd = V(0, 0, 1).applyQuaternion(q); for (const sd of [1, -1]) { const dp = V(it.p.x, it.y + .4 + .95, it.p.z).addScaledVector(fwd, sd * (it.d / 2 + .02));
          drs.push(new THREE.Matrix4().compose(dp, new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), it.ry + (sd > 0 ? 0 : Math.PI)), V(.95, 1.85, 1)));
          const wp = dp.clone().add(V(0, it.h * .45, 0)).addScaledVector(V(1, 0, 0).applyQuaternion(q), it.w * .28); drs.push(new THREE.Matrix4().compose(wp, new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), it.ry + (sd > 0 ? 0 : Math.PI)), V(.45, .5, 1))); } } }
    const im = new THREE.InstancedMesh(houseG, M.wall, items.length), m4 = new THREE.Matrix4(), cc = new THREE.Color();
    items.forEach((it, i) => { im.setMatrixAt(i, m4.compose(V(it.p.x, it.y, it.p.z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), it.ry), V(it.w, it.h + .4, it.d))); cc.setHSL(.09 + r() * .03, .12 + r() * .12, .86 + r() * .1); im.setColorAt(i, cc); });
    im.castShadow = im.receiveShadow = true; S.add(im);
    const rm = new THREE.InstancedMesh(roofG, M.roof, roofs.length); roofs.forEach((mm, i) => rm.setMatrixAt(i, mm)); rm.castShadow = rm.receiveShadow = true; S.add(rm);
    if (drs.length) { const dm = new THREE.InstancedMesh(doorG, M.dark, drs.length); drs.forEach((mm, i) => dm.setMatrixAt(i, mm)); S.add(dm); }
    const v = { c, th, items, lamp: film.lamp(c.clone().setY(hgt(c.x, c.z) + 7), '#ffb060', { power: 0, size: 26, fog: 1 }) }; VILL.push(v); return v; }
  const V0 = village(V0TH, 34, 11, { spread: 75, depth: 80, doors: true, road: 26 });     // the north-shore town (S6)
  const VW = village(VWTH, 30, 12, { spread: 70, depth: 70, doors: false });    // the west-shore village the light comes down on (N09d)
  const others = [[118, 22], [140, 18], [196, 20], [214, 20], [232, 18], [250, 18], [60, 24], [36, 18], [8, 20], [330, 16], [305, 18]].map(([th, n], i) => village(th, n, 40 + i, { spread: 55, depth: 60 }));
  const BEAC = [196, 214, 232, 250].map(th => VILL.find(v => v.th === th) || null);   // S6: the shore toward the sun, in order

  // ---------------------------------------------------------------- trees: olives with leaf-card crowns (lace, not blobs), palms
  const leafTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = rng(9);
    for (let i = 0; i < 70; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 50, x = 64 + Math.cos(a) * d, y = 64 + Math.sin(a) * d * .8, L = 9 + r() * 7, an = r() * 6.283;
      const v = 150 + r() * 70; g.fillStyle = `rgb(${v * .78 | 0},${v * .84 | 0},${v * .62 | 0})`; g.beginPath(); g.ellipse(x, y, L, L * .26, an, 0, 6.283); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const leafM = lightify(new THREE.MeshStandardMaterial({ color: '#7e8a66', map: leafTex, alphaTest: .45, alphaToCoverage: true, roughness: .9, side: THREE.DoubleSide }), 'leaf');
  const leafG = new THREE.PlaneGeometry(1, 1);
  const leafItems = [];
  function olive(x, z, h, seed, layer = 0) {
    const y0 = hgt(x, z) - .15, tr = K.tree({ seed, height: h, trunk: .2 + h * .012, depth: 4, spread: .85, up: .12, twig: 0, mat: M.trunk, layer });
    tr.position.set(x, y0, z); tr.rotation.y = seed; S.add(tr);
    const r = rng(seed * 7 + 3), n = 70 + (h * 12 | 0);
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.pow(r(), .6) * h * .52, yy = y0 + h * (.5 + r() * .42) - rr * .3 + Math.sin(a * 3 + seed) * .3;
      const s = .8 + r() * .7; leafItems.push(new THREE.Matrix4().compose(V(x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr * .9), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)), V(s, s * .75, 1))); } }
  function palm(x, z, h, seed) { const r = rng(seed), segs = [], g = new THREE.Group(); let p = V(x, hgt(x, z) - .2, z), d = V((r() - .5) * .3, 1, (r() - .5) * .3).normalize();
    for (let i = 0; i < 10; i++) { const e = p.clone().addScaledVector(d, h / 10); segs.push(p.x, p.y, p.z, e.x, e.y, e.z, .2 - i * .008, .19 - i * .008); p = e; d.add(V(.02, 0, 0)).normalize(); }
    g.add(new THREE.Mesh(K.tubesGeometry(segs, 7), M.trunk));
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + r(), L = 2.8 + r() * .9, fg = new THREE.PlaneGeometry(L, .5, 10, 1); fg.translate(L / 2, 0, 0);
      const pos = fg.attributes.position; for (let k = 0; k < pos.count; k++) { const u = pos.getX(k) / L; pos.setY(k, pos.getY(k) * (1 - u * .7) - u * u * 1.3); } fg.computeVertexNormals();
      const f = new THREE.Mesh(fg, M.palm); f.position.copy(p); f.rotation.set(0, a, .3 + r() * .35); f.castShadow = true; g.add(f); }
    g.traverse(o => { if (o.isMesh) o.castShadow = true; }); S.add(g); }
  { const r = rng(5150);
    // the preaching hill: a few olives on its shoulders (kept off the crest line and off the slope where the crowd sits)
    for (const [dx, dz, h] of [[-58, -10, 5.5], [-72, 30, 6.2], [55, -18, 5.2], [66, 22, 6], [-40, -62, 5.8], [30, -70, 6.4], [90, -40, 5.6], [-95, -35, 6], [-48, 52, 5.4], [52, 60, 5.8], [-110, 10, 6.4], [105, 5, 6.1], [-80, -80, 6], [75, -85, 5.5]]) olive(HILLP.x + dx, HILLP.z + dz, h, 300 + dx * 3 + dz);
    // groves round the villages and along the shores (smaller; far they are the ground's dark dots)
    for (const v of VILL) for (let i = 0; i < 7; i++) { const a = r() * 6.283, d = 70 + r() * 90, x = v.c.x + Math.cos(a) * d, z = v.c.z + Math.sin(a) * d; if (inland(x, z) < 8) continue; olive(x, z, 4.5 + r() * 2, 900 + VILL.indexOf(v) * 17 + i); }
    for (let i = 0; i < 4; i++) { const a = r() * 6.283; palm(V0.c.x + Math.cos(a) * 40, V0.c.z + Math.sin(a) * 40, 8 + r() * 3, 70 + i); palm(VW.c.x + Math.cos(a + 1) * 38, VW.c.z + Math.sin(a + 1) * 38, 8 + r() * 3, 80 + i); }
    // the scroll's stone: an old olive behind it (its shade is what the light crosses at N07)
    olive(SCP.x + 6, SCP.z + 9, 6.5, 4321); }
  { const im = new THREE.InstancedMesh(leafG, leafM, leafItems.length); leafItems.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = im.receiveShadow = true; S.add(im); }

  // grass tufts and spring flowers where people are (fixed to the world; a slow breeze)
  const tuftU = { uT: { value: 0 } };
  { const blades = []; const r = rng(77);
    for (let i = 0; i < 7; i++) { const a = r() * 6.283, h = .16 + r() * .22, g = new THREE.PlaneGeometry(.022, h, 1, 3); g.translate(0, h / 2, 0);
      const p = g.attributes.position; for (let k = 0; k < p.count; k++) { const y = p.getY(k), u = y / h; p.setX(k, p.getX(k) * (1 - u * .85)); p.setZ(k, u * u * .09); }
      g.rotateY(a); g.translate(Math.cos(a) * .05, 0, Math.sin(a) * .05); blades.push(g); }
    const geo = K.mergeGeometries(blades.map(g => [g, new THREE.Matrix4()]));
    const tm = new THREE.MeshStandardMaterial({ color: '#b2a868', roughness: .9, side: THREE.DoubleSide });
    tm.onBeforeCompile = sh => { Object.assign(sh.uniforms, tuftU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <begin_vertex>', `#include <begin_vertex>
        { vec2 ip = vec2(instanceMatrix[3].x, instanceMatrix[3].z); float w = sin(uT * 1.1 + ip.x * .15 + ip.y * .09) * .6 + sin(uT * 2.3 + ip.x * .4) * .25; transformed.x += w * .045 * position.y * 3.; }`); };
    tm.customProgramCacheKey = () => 'gl-tuft'; lightify(tm, 'tuft');
    const pts = []; const add = (c, rad, n, skip) => { for (let i = 0; i < n; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * rad, x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; if (inland(x, z) < 3 || (skip && skip(x, z))) continue; pts.push([x, z]); } };
    add(HILLP, 110, 42000); add(SCP, 14, 1600); add(V0P.clone().addScaledVector(outward(V0TH), 20), 60, 9000); add(BOATS, 40, 2400);
    const inst = new THREE.InstancedMesh(geo, tm, pts.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    pts.forEach(([x, z], i) => { q.setFromAxisAngle(V(0, 1, 0), r() * 6.283); m4.compose(V(x, hgt(x, z) + .01, z), q, V(1, .7 + r() * .7, 1)); inst.setMatrixAt(i, m4); c.setHSL(.15 + r() * .06, .3 + r() * .15, .42 + r() * .14); inst.setColorAt(i, c); });
    inst.receiveShadow = true; inst.frustumCulled = false; S.add(inst);
    // red anemones and white chamomile in the grass (small, few — the Galilean spring)
    const fg = new THREE.IcosahedronGeometry(.045, 0), fm = lightify(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .8 }), 'flower'), fp = [];
    for (let i = 0; i < 1800; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 90, x = HILLP.x + Math.cos(a) * d, z = HILLP.z + Math.sin(a) * d; if (inland(x, z) < 3) continue; fp.push([x, z]); }
    const fi = new THREE.InstancedMesh(fg, fm, fp.length); fp.forEach(([x, z], i) => { m4.compose(V(x, hgt(x, z) + .14 + r() * .1, z), q, V(1, .6, 1)); fi.setMatrixAt(i, m4); fi.setColorAt(i, c.set(r() < .6 ? '#b8282a' : '#efe6d0')); });
    S.add(fi); }
  // basalt stones on the hill and the beaches
  { const r = rng(808), gs = new THREE.IcosahedronGeometry(1, 1), mm = [];
    const add = (cx, cz, rad, n, s0) => { for (let i = 0; i < n; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * rad, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (inland(x, z) < 1) continue; const s = s0 * (.4 + r() * r() * 1.6);
        mm.push(new THREE.Matrix4().compose(V(x, hgt(x, z) - s * .25, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(r(), r() * 6, r())), V(s * (1 + r() * .5), s * .6, s))); } };
    add(HILLP.x, HILLP.z, 110, 160, .35); add(BOATS.x, BOATS.z, 60, 70, .3); add(SCP.x, SCP.z, 30, 40, .3); add(V0P.x, V0P.z, 90, 60, .3);
    const im = new THREE.InstancedMesh(gs, M.rock, mm.length); mm.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = im.receiveShadow = true; S.add(im); }

  // ---------------------------------------------------------------- people (people3d.js robeMan, mixed headwear; rim-lit; life)
  const robeCols = ['#5e4c38', '#4c4032', '#6a5642', '#403628', '#5a4834', '#504436', '#64523e', '#48392b'];
  const mantleCols = ['#8a6a34', '#5e5a34', '#7a3626', '#a89a80', '#5a4030', '#4c4842', '#9a8458', '#6a4a2c', '#7c6a48', '#4c5262'];
  const robes = robeCols.map((c, i) => lightify(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'r' + i, { rim: 1 }));
  const mantles = mantleCols.map((c, i) => lightify(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'm' + i, { rim: 1 }));
  const faceM = lightify(K.std('#2a1a10', { roughness: 1 }), 'face'), hairM = lightify(K.std('#1c140e', { roughness: 1 }), 'hair');
  const kingM = lightify(K.std('#bcab8c', { roughness: .95, side: THREE.DoubleSide }), 'kg', { rim: 1.15 }), kingC = lightify(K.std('#8e7c60', { roughness: .95, side: THREE.DoubleSide }), 'kc', { rim: 1.15 });
  const face = (dx, dz) => Math.atan2(-dx, -dz);
  const HEADW = ['cloth', 'turban', 'bare', 'cloth', 'turban'];
  function person(r, { kind: k0, sit = false } = {}) {
    const u = r(), kind = k0 || (u < .13 ? 'child' : u < .4 ? 'woman' : 'man');
    const base = { mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0], face: faceM, kind: sit ? 'sit' : 'stand' };
    const o = kind === 'child' ? { h: 1.02 + r() * .3, child: true, head: r() < .5 ? 'cloth' : 'veil', broad: .9 } : kind === 'woman' ? { h: 1.5 + r() * .13, head: 'veil', broad: .82 + r() * .1 } : { h: 1.62 + r() * .2, head: 'cloth', broad: .92 + r() * .2 };
    const p = P.robeMan({ ...base, ...o });
    if (kind === 'man') P.headwear(p, HEADW[(r() * HEADW.length) | 0], { mat: base.cloth, dark: hairM });
    p.userData.who = kind; p.userData.ph = r(); p.userData.dl = r(); return p; }
  const king = () => { const k = P.robeMan({ h: 1.76, mat: kingM, cloth: kingC, face: faceM, head: 'cloth' }); P.headwear(k, 'cloth', { mat: kingC, dark: hairM }); k.userData.ph = .3; return k; };
  const SEATH = s => [V(-.16 * s, .52 * s, -.3 * s), V(.16 * s, .52 * s, -.28 * s)];
  const groups = { hill: new THREE.Group(), beach: new THREE.Group(), town: new THREE.Group() }; for (const g of Object.values(groups)) S.add(g);
  const place = (g, p, x, z, ry, dy = 0) => { p.position.set(x, hgt(x, z) + dy, z); p.rotation.y = ry; g.add(p); return p; };

  // the hill: him on the crest facing west; the crowd on the slope below in loose groups (never rows), facing him
  const crest = (() => { let best = V(), hb = -1; for (let i = 0; i < 900; i++) { const x = HILLP.x - 15 + (i % 30), z = HILLP.z - 15 + ((i / 30) | 0); const y = hgt(x, z); if (y > hb) { hb = y; best.set(x, y, z); } } return best; })();
  const KH = place(groups.hill, king(), crest.x, crest.z + 3, Math.PI);   // facing +z (west, the lake)
  const hillCrowd = [];
  { const r = rng(2024), centres = [[-9, 10, 7], [7, 9, 6], [-22, 20, 9], [3, 22, 10], [20, 18, 8], [-10, 34, 10], [14, 36, 9], [-30, 38, 7], [30, 32, 6], [-2, 48, 8], [22, 50, 6]];
    for (const [cx, cz, n] of centres) for (let i = 0; i < n; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * (2.2 + n * .35), x = KH.position.x + cx + Math.cos(a) * d, z = KH.position.z + cz + Math.sin(a) * d * .8;
      if (hillCrowd.some(p => Math.hypot(p.position.x - x, p.position.z - z) < .95)) continue;
      const stand = r() < .12, p = person(r, { sit: !stand }); place(groups.hill, p, x, z, face(KH.position.x - x, KH.position.z - z) + (r() - .5) * .5);
      p.userData.stand = stand; p.userData.dist = Math.hypot(x - KH.position.x, z - KH.position.z); p.userData.yaw0 = (r() - .5) * 1.1; p.userData.bow = .15 + r() * .3; hillCrowd.push(p); } }
  // the beach (S4): the crowd at the water's edge, the boat off shore with him standing in it
  const bshore = BOATS.clone(), bout = outward(281), bal = along(281);
  const boat = new THREE.Group(); S.add(boat);
  { const L = 7.2, Wd = 2.1, Dp = .85, hull = new THREE.CylinderGeometry(1, 1, L, 22, 6, true, Math.PI / 2, Math.PI); hull.rotateX(Math.PI / 2);
    const p = hull.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), u = Math.abs(z) / (L / 2), taper = Math.sqrt(Math.max(.02, 1 - Math.pow(u, 2.4)));
      p.setX(i, p.getX(i) * Wd / 2 * taper); p.setY(i, p.getY(i) * Dp * (.62 + .38 * taper) + Dp * .3 + Math.pow(u, 2.2) * .62 * (p.getY(i) > -.2 ? 1 : .3)); } hull.computeVertexNormals();
    const hm = new THREE.Mesh(hull, M.hull); hm.castShadow = true; boat.add(hm);
    for (const zz of [-1.6, .2, 1.9]) { const b = new THREE.Mesh(K.roundedBox(1.7, .07, .3, .02, 1), M.wood); b.position.set(0, Dp * .82, zz); boat.add(b); }
    { const oar = new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, 3.0, 6), M.wood); oar.rotation.set(.12, 0, 1.38); oar.position.set(.35, Dp * .9, 1.0); boat.add(oar); } }   // one oar shipped along the gunwale
  const boatP = bshore.clone().addScaledVector(bout, -24); boatP.y = 0;
  boat.position.copy(boatP); boat.rotation.y = Math.atan2(bal.x, bal.z);
  const KB = king(); boat.add(KB); KB.position.set(0, .62, .3); KB.rotation.y = Math.atan2(bout.x, bout.z) - boat.rotation.y + Math.PI;   // facing the shore (−outward)
  { const r0 = person(rng(3), { kind: 'man', sit: true }); boat.add(r0); r0.position.set(.1, .5, 2.0); r0.rotation.y = KB.rotation.y + .3; r0.userData.sitBoat = true; groups.boatMan = r0; }
  const beachCrowd = [];
  { const r = rng(616), toB = V(boatP.x - bshore.x, 0, boatP.z - bshore.z).normalize();
    for (let i = 0; i < 46; i++) { const u = (r() - .5) * 46 + Math.sin(i) * 2, v = 2.5 + Math.pow(r(), 1.3) * 16, p0 = bshore.clone().addScaledVector(bal, u).addScaledVector(bout, v);
      if (beachCrowd.some(p => Math.hypot(p.position.x - p0.x, p.position.z - p0.z) < .9)) continue;
      const sit = r() < .42 && v > 4, p = person(r, { sit }); place(groups.beach, p, p0.x, p0.z, face(boatP.x - p0.x, boatP.z - p0.z) + (r() - .5) * .45);
      p.userData.stand = !sit; beachCrowd.push(p); } }
  // the north-shore town (S6): him on the road; the people pressing after him, a hand at his sleeve
  const TH0 = V0TH + 3.5, roadOut = 26, rP = th => shoreAt(th).addScaledVector(outward(th), roadOut);
  const KS = place(groups.town, king(), 0, 0, 0); const headC = along(TH0);
  const townCrowd = [];
  { const r = rng(4242), k0 = rP(TH0);
    const cl = [[5, -2.2, 2.2, 6], [7.5, 3.8, 2.6, 6], [11, -4.5, 3, 7], [14.5, 2.5, 3.2, 8], [18.5, -2.5, 3.5, 7], [8, -8, 2, 4]];   // loose knots behind him: [back, side, radius, n]
    const spots = []; for (const [bk, sd, rad, n] of cl) for (let j = 0; j < n; j++) { const a = r() * 6.283, d = Math.sqrt(r()) * rad; spots.push([bk + Math.cos(a) * d, sd + Math.sin(a) * d * 1.3]); }
    for (let i = 0; i < spots.length; i++) { const [back, side] = spots[i], p0 = k0.clone().addScaledVector(headC, -back).addScaledVector(outward(TH0), side);
      if (inland(p0.x, p0.z) < 4 || townCrowd.some(p => Math.hypot(p.position.x - p0.x, p.position.z - p0.z) < .85)) continue;
      const sit = back > 9 && r() < .25, p = person(r, { sit }); place(groups.town, p, p0.x, p0.z, face(k0.x - p0.x, k0.z - p0.z) + (r() - .5) * .35);
      p.userData.stand = !sit; p.userData.back = back; p.userData.p0 = p0.clone(); townCrowd.push(p); }
    townCrowd.sort((a, b) => a.userData.back - b.userData.back);
    // the nearest three follow a few steps; one woman's hand is at his sleeve when we arrive
    townCrowd.slice(0, 5).forEach((p, i) => { p.userData.follow = i < 4; p.userData.steps = 2 + (i % 2); p.userData.fdl = [.15, .55, .9, 1.3, 1.6][i]; });
    const sleeve = townCrowd.find(p => p.userData.who === 'woman' && p.userData.back < 7) || townCrowd[0]; sleeve.userData.sleeve = true;
    const k0p = k0.clone(); sleeve.position.copy(k0p.clone().addScaledVector(headC, -1.05).addScaledVector(outward(TH0), .55)); sleeve.position.y = hgt(sleeve.position.x, sleeve.position.z); sleeve.userData.p0 = sleeve.position.clone();
    sleeve.rotation.y = face(headC.x, headC.z) - .4; }

  // ---------------------------------------------------------------- birds (S1): a flock resting on the water that lifts as we come
  const birds = []; { const bm = new THREE.MeshBasicMaterial({ color: '#2c2219', side: THREE.DoubleSide }); const r = rng(31);
    for (let i = 0; i < 46; i++) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3)); const b = new THREE.Mesh(g, bm); b.frustumCulled = false; S.add(b);
      b.userData = { x: (r() - .5) * 46 + 6, z: -1585 - r() * 60, dl: r() * 1.4, sp: .8 + r() * .5, vx: (r() - .5) * .8, s: .17 + r() * .07, ph: r() * 6 }; birds.push(b); } }
  const setBird = (b, p, s, flap, fold = 0) => { const a = b.geometry.attributes.position, w = Math.sin(flap) * .55 * (1 - fold), sp = s * (1 - fold * .7);
    const pts = [[0, 0, 0], [-sp, s * w + fold * s * .2, -s * .3], [-s * .18, 0, s * .22], [0, 0, 0], [sp, s * w + fold * s * .2, -s * .3], [s * .18, 0, s * .22]];
    pts.forEach((q, i) => a.setXYZ(i, p.x + q[0], p.y + q[1], p.z + q[2])); a.needsUpdate = true; };

  // ---------------------------------------------------------------- mist over the water (soft sheets drifting just above it)
  const mistU = { uT: { value: 0 }, uSunV: { value: SUN.clone() }, uK: { value: 1 } };
  { const mm = new THREE.ShaderMaterial({ uniforms: mistU, transparent: true, depthWrite: false,
      vertexShader: `varying vec3 vP; varying vec2 vU; void main(){ vP = (modelMatrix * vec4(position, 1.)).xyz; vU = uv; gl_Position = projectionMatrix * viewMatrix * vec4(vP, 1.); }`,
      fragmentShader: `uniform float uT, uK; uniform vec3 uSunV; varying vec3 vP; varying vec2 vU; ${hashGLSL}
        void main(){ vec2 q = vP.xz * .018 + vec2(uT * .012, uT * .004); float n = fbm(q) * .7 + fbm(q * 3.1 - uT * .01) * .3;
          float e = smoothstep(0., .25, vU.x) * smoothstep(1., .75, vU.x) * smoothstep(0., .25, vU.y) * smoothstep(1., .75, vU.y);
          vec3 vd = normalize(vP - cameraPosition); float d = length(vP - cameraPosition), fwd = pow(max(dot(vd, uSunV), 0.), 6.);
          float a = smoothstep(.42, .78, n) * e * smoothstep(8., 40., d) * (1. - smoothstep(900., 1800., d)) * .3 * uK;
          gl_FragColor = vec4(mix(vec3(.82, .74, .66), vec3(1.25, .98, .7), fwd) * (.85 + fwd * 1.4), a); }` });
    const r = rng(17); for (let i = 0; i < 26; i++) { const g = new THREE.PlaneGeometry(260, 110); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, mm);
      const c = i < 14 ? V((r() - .5) * 500, .6 + r() * 2.6, -1350 - r() * 340) : V(CX + (r() - .5) * 1800, .8 + r() * 3, CZ + (r() - .5) * 1100); if (inland(c.x, c.z) > -30) continue;
      m.position.copy(c); m.rotation.y = r() * .6 - .3; m.renderOrder = 2; m.layers.set(2); S.add(m); } }

  // ---------------------------------------------------------------- the scroll on the stone (N07): parchment, the writing as texture only
  const scroll = new THREE.Group(); S.add(scroll);
  const markU = { uK: { value: 0 }, uN: { value: 26 } };
  const SC = SCP.clone().addScaledVector(outward(SCROLLTH), 3.2); SC.y = hgt(SC.x, SC.z);
  { // a flat basalt slab, worn (a rounded block with a lumpy skirt), its top at .55 m
    const g = K.roundedBox(1.75, .62, 1.15, .14, 3), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), top = y > .2, n = Math.sin(x * 7.1 + 1.3) * Math.cos(z * 6.3) * .03 + Math.sin(x * 17 + z * 13) * .008;
      p.setXYZ(i, x * (1 + (top ? 0 : .06 * Math.sin(z * 5 + x))), y + (top ? n * .15 : n), z * (1 + (top ? 0 : .05 * Math.cos(x * 4)))); }
    g.computeVertexNormals(); g.computeBoundingBox(); const stone = new THREE.Mesh(g, M.stone); stone.position.copy(SC).add(V(0, .56 - g.boundingBox.max.y, 0)); stone.rotation.y = .1; stone.castShadow = stone.receiveShadow = true; S.add(stone); }
  { const tw = 1024, th = 256, c = document.createElement('canvas'); c.width = tw; c.height = th; const g = c.getContext('2d'), r = rng(61);
    const gr = g.createLinearGradient(0, 0, 0, th); gr.addColorStop(0, '#d9c49a'); gr.addColorStop(.5, '#e6d4ae'); gr.addColorStop(1, '#cfb88c'); g.fillStyle = gr; g.fillRect(0, 0, tw, th);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${120 + r() * 60 | 0},${90 + r() * 40 | 0},${60 + r() * 20 | 0},${.04 + r() * .05})`; g.beginPath(); g.ellipse(r() * tw, r() * th, 4 + r() * 22, 2 + r() * 8, r() * 3, 0, 6.283); g.fill(); }
    // three columns of writing: rows of small strokes (shapes like letters, but not letters — no words in the art)
    // each "letter" is a small brush mark — a top bar, a stem, sometimes a hook (square-script-like texture, never a real letter)
    const mk = []; g.lineCap = 'round';
    for (let col = 0; col < 3; col++) { const x0 = 72 + col * 310, x1 = x0 + 246; for (let row = 0; row < 11; row++) { const y = 31 + row * 19.5; let x = x0;
        while (x < x1) { const wd = 16 + r() * 34; for (let k = 0; k < wd / 6.2; k++) { const cx = x + k * 6.2, a = .55 + r() * .3; if (r() < .12) continue;
            g.strokeStyle = `rgba(${44 + r() * 14 | 0},${30 + r() * 8 | 0},${20 + r() * 6 | 0},${a})`; g.lineWidth = 1.3 + r() * .9; g.beginPath();
            const kind = r(); g.moveTo(cx - 2, y - 5); g.lineTo(cx + 2.4, y - 5.3);                                  // top bar
            if (kind < .55) { g.moveTo(cx + 2.2, y - 5); g.lineTo(cx + 1.8, y + 2); } else if (kind < .8) { g.moveTo(cx - 1.8, y - 4.6); g.lineTo(cx - 1.6, y + 2); g.lineTo(cx + 2.2, y + 2.2); }
            else { g.moveTo(cx + .2, y - 5); g.lineTo(cx, y + 1.4); }
            g.stroke(); }
          if (r() < .1 && mk.length < 26) mk.push([x + wd / 2, y - 1.5, wd]); x += wd + 7; } } }
    // the marks' map: their order in the blue channel (0..1), their place in alpha
    const mc = document.createElement('canvas'); mc.width = tw; mc.height = th; const mg = mc.getContext('2d'); mg.fillStyle = '#000'; mg.fillRect(0, 0, tw, th);
    const order = mk.map((_, i) => i).sort(() => r() - .5);
    // each mark is the word's own place (a soft rectangle over its letters): its order in green, its area in red — the shader lights the
    // INK inside it, so the letters themselves turn gold (no round blobs)
    mg.filter = 'blur(2px)'; mk.forEach(([x, y, wd], i) => { const o = (order[i] + .5) / mk.length; mg.fillStyle = `rgb(255,${o * 255 | 0},0)`; mg.fillRect(x - wd / 2 - 2, y - 8, wd + 4, 14); }); mg.filter = 'none';
    markU.uN.value = mk.length;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; const mtex = new THREE.CanvasTexture(mc); mtex.anisotropy = 8;
    const pm = new THREE.MeshStandardMaterial({ map: tex, roughness: .85, side: THREE.DoubleSide });
    pm.onBeforeCompile = sh => { Object.assign(sh.uniforms, markU); sh.uniforms.tMarks = { value: mtex };
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tMarks; uniform float uK, uN;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec4 m = texture2D(tMarks, vMapUv); float o = m.g; float a = clamp((uK * (uN + 1.5) / uN - o) * uN / 1.6, 0., 1.);   // each mark rises over ~1.6 marks' time
            float on = a * (1. + .5 * exp(-a * 3.) * step(.02, a)), area = m.r, ink = 1. - smoothstep(.22, .5, dot(diffuseColor.rgb, vec3(.33)));
            totalEmissiveRadiance += vec3(1., .72, .3) * area * on * (ink * 1.5 + .06); }`); };
    pm.customProgramCacheKey = () => 'gl-scroll'; lightify(pm, 'scroll', { vil: 0 });
    const SW = 1.18, SH = .3, sg = new THREE.PlaneGeometry(SW, SH, 48, 4); const sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++) { const x = sp.getX(i), u = Math.abs(x) / (SW / 2); sp.setZ(i, .012 * Math.sin(x * 14) + .02 * Math.pow(u, 6)); } sg.computeVertexNormals();
    const sheet = new THREE.Mesh(sg, pm); sheet.rotation.x = -Math.PI / 2; sheet.castShadow = sheet.receiveShadow = true; scroll.add(sheet);
    for (const sd of [-1, 1]) { const roll = new THREE.Mesh(new THREE.CylinderGeometry(.032, .032, SH + .04, 14), lightify(K.std('#cdb588', { roughness: .85 }), 'roll')); roll.rotation.x = Math.PI / 2; roll.position.set(sd * (SW / 2 + .02), .03, 0); roll.castShadow = true; scroll.add(roll);
      for (const e of [-1, 1]) { const k = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .07, 8), M.wood); k.position.set(sd * (SW / 2 + .02), .03, e * (SH / 2 + .05)); k.rotation.x = Math.PI / 2; scroll.add(k); } }
    scroll.position.copy(SC).add(V(0, .575, 0)); scroll.rotation.y = .12; }

  // ---------------------------------------------------------------- the light from above (N09d): a shaft from the far point to the village
  const LAND = VW.c.clone(); LAND.y = hgt(LAND.x, LAND.z);
  const shaftU = { uTip: { value: 1 }, uK: { value: 0 }, uTop: { value: V() }, uBot: { value: V() } };
  const shaft = (() => { const g = new THREE.CylinderGeometry(1, 1, 1, 48, 24, true); g.translate(0, -.5, 0);   // y 0 (top) … −1 (bottom)
    const m = new THREE.ShaderMaterial({ uniforms: shaftU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `varying float vY; varying vec3 vN, vP; void main(){ vY = -position.y; vec4 w = modelMatrix * vec4(position, 1.); vP = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uTip, uK; varying float vY; varying vec3 vN, vP; ${hashGLSL}
        void main(){ vec3 vd = normalize(cameraPosition - vP); float edge = pow(abs(dot(normalize(vN), vd)), 3.2);
          float front = 1. - smoothstep(uTip - .12, uTip, vY);
          float stre = .6 + .4 * vnoise(vec2(atan(vN.z, vN.x) * 9., vY * 2.5)) * (.6 + .4 * vnoise(vec2(atan(vN.z, vN.x) * 23., 1.)));
          float a = edge * front * stre * uK * smoothstep(.0, .35, vY) * (1. - smoothstep(.9, 1., vY) * .5);
          gl_FragColor = vec4(vec3(1., .86, .6) * a * .5, 1.); }` });
    const s = new THREE.Mesh(g, m); s.frustumCulled = false; s.renderOrder = 3; s.layers.set(2); S.add(s); return s; })();
  function setShaft(top, bot, r0, r1) { const ax = bot.clone().sub(top), L = ax.length(); shaft.position.copy(top); shaft.quaternion.setFromUnitVectors(V(0, -1, 0), ax.clone().normalize()); shaft.scale.set(r0, L, r0);
    // a cone: the cylinder's bottom ring wider (taper in the vertex positions once)
    if (!shaft.userData.tapered) { const p = shaft.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const y = -p.getY(i), k = lerp(1, r1 / r0, y); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } p.needsUpdate = true; shaft.geometry.computeVertexNormals(); shaft.userData.tapered = true; } }

  // dust motes in the low sun near the camera (tens, not a field), as heal-village
  const dustU = { uT: { value: 0 }, uA: { value: 0 }, uPx: { value: H / 1920 }, uC: { value: V() } };
  { const n = 110, Rr = rng(57), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (Rr() - .5) * 7; p[i * 3 + 1] = Rr() * 3.5; p[i * 3 + 2] = -Rr() * 12; sd[i] = Rr(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx; uniform vec3 uC; varying float vA;
        void main(){ vec3 q = position + uC; q.y += mod(uT * (.05 + .06 * aS) + aS * 3.5, 3.5) - 1.75 * aS; q.x += sin(uT * .4 + aS * 30.) * .3; q.z += cos(uT * .3 + aS * 17.) * .3;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (2. + 4. * aS) * 12. / d, 1., 12.); vA = clamp(1.2 - d / 12., 0., 1.) * (.4 + .6 * aS); }`,
      fragmentShader: `uniform float uA; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 14.); gl_FragColor = vec4(vec3(1., .86, .62) * 1.5, a * vA * uA); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.layers.set(2); S.add(pts); }

  // ---------------------------------------------------------------- posing (every shot; pure in t)
  const PS = {};   // the last pose of each named figure (joints() reads it)
  function lifeSit(p, t, ex = {}) { const U = p.userData; P.pose(p, { breath: P.breath(t, U.ph), lean: -.06 + .03 * Math.sin(t * .3 + U.ph * 7), twist: .04 * Math.sin(t * .23 + U.ph * 5), hands: SEATH(U.s), ...ex }); }
  function lifeStand(p, t, ex = {}) { const U = p.userData; P.pose(p, { ...P.idle(t, U.ph, { s: U.s }), ...ex }); }
  function poseHill(t) {
    const U = KH.userData, aw = ss(T.arm[0], T.arm[1], t), g = .5 + .5 * Math.sin((t - T.arm[0]) * .9);
    const tgt = V(.3 * U.s + .04 * g * aw, lerp(1.0, 1.36 + .05 * g, aw) * U.s, lerp(-.1, -.36, aw) * U.s);
    P.pose(KH, { ...P.idle(t, .3, { s: U.s }), hands: [null, tgt], handsW: [0, aw], head: [-.04 + .03 * Math.sin(t * .4), .08 * Math.sin(t * .3) * aw] }); PS.hillKing = KH;
    for (const p of hillCrowd) { const Up = p.userData, k = ss(T.heads + Up.dist * .03 + Up.dl * .9, T.heads + Up.dist * .03 + Up.dl * .9 + 1.4, t);
      const head = [lerp(-Up.bow, .12, k) + .04 * Math.sin(t * .37 + Up.ph * 9), lerp(Up.yaw0, 0, k) * (1 - .1 * Math.sin(t * .2 + Up.ph * 4))];
      if (Up.stand) lifeStand(p, t, { head }); else lifeSit(p, t, { head, lean: lerp(-.1, -.02, k) + .02 * Math.sin(t * .3 + Up.ph * 7) }); } }
  function poseBeach(t) { const U = KB.userData, g = Math.sin(t * .8) * .5 + .5, aw = .85 + .15 * Math.sin(t * .5);
    P.pose(KB, { ...P.idle(t, .6, { s: U.s }), hands: [null, V(.32 * U.s, (1.25 + .08 * g) * U.s, -.32 * U.s)], handsW: [0, aw], head: [0, .06 * Math.sin(t * .3)] }); PS.boatKing = KB;
    lifeSit(groups.boatMan, t, { head: [.1, 0] });
    for (const p of beachCrowd) { const Up = p.userData; if (Up.stand) lifeStand(p, t, { head: [.06 + .04 * Math.sin(t * .4 + Up.ph * 7), .1 * Math.sin(t * .17 + Up.ph * 5)] }); else lifeSit(p, t, { head: [.12, .06 * Math.sin(t * .21 + Up.ph * 3)] }); } }
  // S6: his turn and walk; the followers step after him and stop; the hand at his sleeve lets go.
  // Gait without slip: walking time is warped (tau), so the start and the stop ease in and out while the stance foot stays planted
  // (the body's speed and the stance foot's backward speed are both scaled by d tau / dt). Before the first step the feet step into the
  // walk's starting stance one at a time (each foot lifts on an arc); after the stop they step back to standing.
  const K0 = rP(TH0);
  const SR = x => x * x * x - x * x * x * x / 2;   // ∫ smoothstep
  function warp(t, t0, Din, tEnd = 1e9, Dout = 1) {
    if (t <= t0) return { tau: t0, v: 0 };
    let tau = Din * SR(Math.min(1, (t - t0) / Din));
    if (t > t0 + Din) tau += Math.min(t, tEnd - Dout) - (t0 + Din);
    if (t > tEnd - Dout) { const x = Math.min(1, (t - (tEnd - Dout)) / Dout); tau += Dout * (x - SR(x)); }
    const v = t < t0 + Din ? ss(t0, t0 + Din, t) : t < tEnd - Dout ? 1 : 1 - ss(tEnd - Dout, tEnd, t);
    return { tau: t0 + tau, v }; }
  // feet: from stance A to stance B, one foot then the other, each on a lifted arc (k 0..1 over the two steps)
  const stepFeet = (A, B, k, order = [0, 1]) => A.map((fa, i) => { const j = order.indexOf(i), kk = clamp(k * 2 - j), e = ss(0, 1, kk); return { u: lerp(fa.u, B[i].u, e), lift: Math.sin(Math.PI * kk) * .045, pitch: 0 }; });
  function kingTown(t) {
    const U = KS.userData, dir = headC.clone(), tk = ss(T.turn[0], T.turn[1], t), ry0 = face(dir.x, dir.z) + .3, ry1 = face(dir.x, dir.z);
    const Tw = 1.42, Lw = .5, { tau, v } = warp(t, T.walk0, 1.2), w = P.walk(KS, tau, T.walk0, { T: Tw, L: Lw });
    const pos = K0.clone().addScaledVector(dir, w.dist); KS.position.set(pos.x, hgt(pos.x, pos.z), pos.z); KS.rotation.y = lerp(ry0, ry1, tk);
    const id = P.idle(t, .3, { s: U.s }), start = [{ u: Lw / 2, lift: 0 }, { u: -Lw / 2, lift: 0 }];
    const feet = t < T.walk0 ? stepFeet(id.feet, start, ss(T.walk0 - 1.4, T.walk0 - .05, t) * 1, [1, 0]) : w.feet;
    P.pose(KS, { ...id, feet, bob: lerp(id.bob, w.bob, v), lean: lerp(0, w.lean, v), swing: [lerp(id.swing[0], w.swing[0] * .8, v), lerp(id.swing[1], w.swing[1] * .8, v)], head: [-.03, .05 * Math.sin(t * .25)] });
    PS.townKing = KS; return KS.position; }
  function poseTown(t) {
    const kp = kingTown(t);
    for (const p of townCrowd) { const Up = p.userData;
      if (Up.sleeve) {   // her hand at his sleeve; as he steps on she lets go and the hand comes back to her (a reach never past 60 cm)
        const rel = ss(T.walk0 - .2, T.walk0 + 1.1, t), back = ss(T.walk0 + .9, T.walk0 + 2.4, t);
        p.updateMatrixWorld(); KS.updateMatrixWorld(); const sl = KS.localToWorld(V(-.25 * KS.userData.s, 1.0 * KS.userData.s, .02)), loc = p.worldToLocal(sl.clone());
        const hi = loc.x < 0 ? 0 : 1, sd = hi ? 1 : -1, sh = V(sd * .235 * Up.s, .9 * Up.s + .48 * Up.s, 0), d = loc.clone().sub(sh); if (d.length() > .58 * Up.s) loc.copy(sh).addScaledVector(d.normalize(), .58 * Up.s);
        const rest = V(sd * .16 * Up.s, .98 * Up.s, -.2 * Up.s), reach = V(sd * .17 * Up.s, 1.22 * Up.s, -.46 * Up.s), tg = lv(lv(loc, reach, rel), rest, back);
        const hands = [null, null]; hands[hi] = tg; const hw = [0, 0]; hw[hi] = 1;
        P.pose(p, { ...P.idle(t, Up.ph, { s: Up.s }), lean: -.05 - .05 * rel * (1 - back), hands, handsW: hw, head: [.05, 0] }); PS.sleeve = p; continue; }
      if (Up.follow) {   // two or three steps after him, then a stop; the feet step back together
        const t0 = T.walk0 + Up.fdl, tEnd = t0 + 2.75, Tst = 1.3, Lst = .42, dir = Up.fdir || (Up.fdir = V(K0.x - Up.p0.x, 0, K0.z - Up.p0.z).normalize());
        const { tau, v } = warp(t, t0, .8, tEnd, .8), w = P.walk(p, tau, t0, { T: Tst, L: Lst }), id = P.idle(t, Up.ph, { s: Up.s });
        const pos = Up.p0.clone().addScaledVector(dir, w.dist); p.position.set(pos.x, hgt(pos.x, pos.z), pos.z); p.rotation.y = face(dir.x, dir.z);
        const start = [{ u: Lst / 2, lift: 0 }, { u: -Lst / 2, lift: 0 }], endF = P.walk(p, warp(tEnd + 1, t0, .8, tEnd, .8).tau, t0, { T: Tst, L: Lst }).feet.map(f => ({ u: f.u, lift: 0 }));
        const feet = t < t0 ? stepFeet(id.feet, start, ss(t0 - .7, t0 - .02, t), [1, 0]) : t < tEnd ? w.feet : stepFeet(endF, id.feet, ss(tEnd + .05, tEnd + .9, t), endF[0].u < endF[1].u ? [0, 1] : [1, 0]);
        const reachK = ss(t0 - .5, t0 + .7, t) * (1 - ss(tEnd + .6, tEnd + 2.2, t) * .7);
        P.pose(p, { ...id, feet, bob: lerp(id.bob, w.bob, v), lean: lerp(id.lean || 0, -.08, reachK), hands: [null, V(.18 * Up.s, 1.26 * Up.s, -.46 * Up.s)], handsW: [0, reachK], swing: [lerp(id.swing[0], w.swing[0], v), lerp(id.swing[1], w.swing[1], v)], head: [.06, 0] });
        if (Up.who === 'man' && !PS.follower) PS.follower = p; continue; }
      const k = ss(T.walk0 + .4 + Up.dl * 1.2, T.walk0 + 1.6 + Up.dl * 1.2, t), head = [.05 + .05 * k, .25 * Math.sin(t * .2 + Up.ph * 6) * (1 - k)];
      if (Up.stand) { const reach = Up.ph > .7 ? ss(T.walk0 + Up.dl, T.walk0 + Up.dl + 1.2, t) * (1 - ss(T.walk0 + Up.dl + 3, T.walk0 + Up.dl + 4.5, t)) : 0;
        lifeStand(p, t, { head, hands: [null, V(.2 * Up.s, 1.2 * Up.s, -.45 * Up.s)], handsW: [0, reach * .9] }); }
      else lifeSit(p, t, { head }); } }

  // ---------------------------------------------------------------- the shots
  const tmpV = V();
  function setCam(pos, look, roll = 0) { cam.position.copy(pos); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(look); }
  function aim(pos, yaw, pitch) { const d = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)); setCam(pos, pos.clone().add(d)); }
  function vis(which) { groups.hill.visible = which === 'hill'; groups.beach.visible = which === 'beach'; boat.visible = which === 'beach'; groups.town.visible = which === 'town'; }
  const camAt = {};
  function stage(shot, t) {   // poses, light field, camera — everything but the render
    const Lk = film.look, D = film.dofCfg, [a, b] = T.shots[shot], k = clamp((t - a) / (b - a));
    for (const p of hillCrowd) p.visible = true;
    LU.uFront.value.set(-1e5, 40, 20, 1); LU.uDim.value = 1; LU.uPool.value.set(0, 0, 0, 0); LU.uVil.value.forEach(v => v.w = 0); VILL.forEach(v => v.lamp.power = 0);
    SK.sunDir.value.copy(SUN); SK.cover.value = 0; SK.pointK.value = 0; SK.gapK.value = 0; shaftU.uK.value = 0; markU.uK.value = 0; mistU.uK.value = 1; dustU.uA.value = 0;
    birds.forEach(bd => bd.visible = false); Lk.exposure = 1; D.aperture = .5; D.maxCoc = 20; sunLamp.power = 2400; sunL.intensity = 3.1; hemi.intensity = .62;
    if (shot === 0) {   // S1: the glide
      vis('hill'); poseHill(t); for (const p of hillCrowd) p.visible = false; shadowAt(V(KH.position.x, 0, KH.position.z + 30), 90);   // the crowd comes at N04 (S2): here he stands alone
      const sr = ss(T.sunrise[0], T.sunrise[1], t), el = lerp(5.6, 8.6, sr) * D2R; SK.sunDir.value.set(.012, Math.sin(el), -Math.cos(el)).normalize();
      const L = T.fly[1], u = t / L, v0 = 15.5, dist = u < .72 ? v0 * L * u : v0 * L * (.72 + (u - .72) * (1 - (u - .72) / (2 * .28)));   // linear, then ease out over the last 28 %
      const z = KH.position.z + 250 - dist, x = KH.position.x + lerp(16, 4, u) + 2.5 * Math.sin(u * 2.2), y = lerp(4.4, 8.2, ss(.55, 1, u)) + .12 * Math.sin(t * 1.3);
      const pos = V(x, y, z), look = V(KH.position.x + 1, KH.position.y + 4.2 - 1.2 * u, KH.position.z - 40);
      setCam(pos, look, -.02 * Math.sin(u * 2.2 + .4)); D.focus = pos.distanceTo(KH.position); D.aperture = .3;
      Lk.exposure = .8; for (const bd of birds) { const U = bd.userData; bd.visible = true; const tl = T.birds + U.dl + (U.z + 1585) * -.012, lk = clamp((t - tl) / 2.6);
        const bp = V(KH.position.x + U.x * .7 + U.vx * lk * 20, .12 + lk * lk * 22 + lk * 3, KH.position.z + 150 + (U.z + 1585) * .8 - lk * 9 - lk * lk * 14); setBird(bd, bp, U.s, t * 19 * U.sp + U.ph, lk > 0 ? 0 : 1); }
    } else if (shot === 1) {   // S2: behind him on the crest, a slow arc
      vis('hill'); poseHill(t); shadowAt(V(KH.position.x, 0, KH.position.z + 32), 60);
      const e = sine(k), az = lerp(-28, 22, e) * D2R, R0 = 13.5, hgtC = lerp(6.2, 7.0, e);
      const c = KH.position, pos = V(c.x + Math.sin(az) * R0, c.y + hgtC, c.z - Math.cos(az) * R0), [yw, pt] = lookAtY(pos, c.clone().add(V(0, .9, 0)), .5);
      aim(pos, yw, pt); D.focus = pos.distanceTo(c); D.aperture = .9; Lk.exposure = 1.05;
      LU.uFront.value.set(-1000, 60, 20, .6);
    } else if (shot === 2) {   // S3: high and wide over the water: the light crosses the lake onto the crowd
      vis('hill'); poseHill(t); shadowAt(V(KH.position.x, 0, KH.position.z + 32), 70);
      const fk = sine((t - T.front[0]) / (T.front[1] - T.front[0])); LU.uFront.value.set(lerp(-1000, -1980, fk), 70, 20, .6);
      // from just south of him, low over the slope, looking down over the crowd to the lake: the light comes across the water toward us
      // high on the hill behind him (much higher and wider than S2), a slow pedestal up: the whole crowd on the slope below, the lake
      // beyond — the morning light comes across the water toward us and climbs over the crowd
      const e = sine(k), c = KH.position, pos = V(c.x + 14 - 6 * e, c.y + 24 + 9 * e, c.z - 40 + 4 * e), [yw, pt] = lookAtY(pos, V(c.x - 3, c.y - 12, c.z + 85), .5);
      aim(pos, yw, pt); D.focus = 80; D.aperture = .15; Lk.exposure = 1.0;
    } else if (shot === 3) {   // S4: low over the water behind the boat
      vis('beach'); poseBeach(t); shadowAt(V(boatP.x, 0, boatP.z - 10), 45);
      boat.rotation.z = .03 * Math.sin(t * .9); boat.rotation.x = .015 * Math.sin(t * .7 + 1); boat.position.y = .05 * Math.sin(t * 1.1);
      const back = V(0, 0, 1), side = V(1, 0, 0), e = sine(k);   // west of the boat on the sun's line: the boat, the beach, the sun behind
      const pos = boatP.clone().addScaledVector(back, lerp(34, 25, e)).addScaledVector(side, lerp(2.6, 1.2, e)); pos.y = 1.9 + .06 * Math.sin(t * .8);
      const look = boatP.clone().addScaledVector(back, -60).addScaledVector(side, .3); look.y = 2.6;
      setCam(pos, look, .006 * Math.sin(t * .7)); D.focus = pos.distanceTo(boatP); D.aperture = .9; Lk.exposure = .8; dustU.uA.value = 0;
    } else if (shot === 4) { shotScrollSky(t); }
    else { vis('town'); shotTown(t); }
  }
  // S5: the scroll → crane up → the sky → the light comes down (one camera, keyed: position, yaw, pitch)
  const CRANE_TOP = 235, CRANE_BACK = 320;
  const dirYP = (yaw, pitch) => V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  const yawOf = v => Math.atan2(v.x, -v.z), pitchOf = v => Math.asin(clamp(v.clone().normalize().y, -1, 1));
  const YAW0 = -.04, F0 = V(Math.sin(YAW0), 0, -Math.cos(YAW0));
  const S5 = {};   // the fixed points of the move (made once from the world)
  function s5plan() { if (S5.ok) return; S5.ok = true;
    S5.start = SC.clone().add(V(0, .575, 0)).addScaledVector(F0, -.42).add(V(.0, .78, 0));               // behind and above the scroll
    S5.glide = S5.start.clone().addScaledVector(F0, .06).add(V(.24, -.04, 0));
    S5.top = V(S5.glide.x, SC.y + CRANE_TOP, S5.glide.z).addScaledVector(F0, -CRANE_BACK);               // the crane's top (the title)
    S5.hold = S5.top.clone().addScaledVector(F0, (T.n09d - T.crane[1]) * 6.0).add(V(30, 18, 0));                           // after the slow drift east
    S5.TOPP = S5.hold.clone().addScaledVector(dirYP(10 * D2R, 33 * D2R), 1350);                           // the far point above the clouds
    S5.end = LAND.clone().add(V(-40, 168, 300));                                                         // over the shore, the village ahead-below
  }
  // where the camera looks: yaw/pitch so that point Q sits at frame height fy (0 top … 1 bottom)
  const lookAtY = (pos, Q, fy) => { const d = Q.clone().sub(pos); return [yawOf(d), pitchOf(d) - (.5 - fy) * FOV * D2R]; };
  function shotScrollSky(t) {
    vis('none'); s5plan(); const Lk = film.look, D = film.dofCfg;
    let pos, yaw = YAW0, pitch;
    const ck = eio((t - T.crane[0]) / (T.crane[1] - T.crane[0]));
    if (t < T.crane[0]) { const g = sine((t - T.n07 + .35) / (T.crane[0] - T.n07 + .35)); pos = lv(S5.start, S5.glide, g);
      const fc = scroll.position.clone().add(V(.05 + .12 * g, 0, 0)); [yaw, pitch] = lookAtY(pos, fc, .43);
      shadowAt(V(SC.x, 0, SC.z), 30); D.focus = pos.distanceTo(fc); D.aperture = .45; D.maxCoc = 10;
      const mk = clamp((t - T.marks[0]) / (T.marks[1] - T.marks[0])); markU.uK.value = mk * mk * .35 + mk * .65; }
    else { markU.uK.value = 1;
      // crane up: log altitude, ease-in-out, back inland while rising; the view tilts from the scroll to the sun
      const h0 = S5.glide.y - SC.y, hNow = logLerp(h0, CRANE_TOP, ck), back = CRANE_BACK * eio(clamp((ck - .3) / .7));
      const [y0, p0] = lookAtY(S5.glide, scroll.position.clone().add(V(.17, 0, 0)), .43);
      pos = V(S5.glide.x, SC.y + hNow, S5.glide.z).addScaledVector(F0, -back); yaw = lerp(y0, YAW0, sine(ck)); pitch = lerp(p0, -6.5 * D2R, sine(clamp(ck * 1.3)));
      if (t > T.crane[1]) { const dr = clamp((t - T.crane[1]) / (T.n09d - T.crane[1])); pos = lv(S5.top, S5.hold, dr); pitch = lerp(-6.5, -8.5, clamp((t - T.crane[1]) / 8)) * D2R; }
      // the tilt up to the far point (it sits at 0.32 H), a slow hold
      const tu = eio((t - T.tilt[0]) / (T.tilt[1] - T.tilt[0]));
      if (t > T.tilt[0]) { const [yu, pu] = lookAtY(pos, S5.TOPP, .3 + .06 * clamp((t - T.tilt[1]) / 3)); yaw = lerp(yaw, yu, tu); pitch = lerp(pitch, pu, tu); }
      // the descent: crane down 4 s (soft start, ease-out), following the light's front down to the village (it lands at 0.43 H)
      if (t > T.down[0]) { const dk = softOut((t - T.down[0]) / (T.down[1] - T.down[0]), .3, 1.25), tk = 1 - Math.pow(1 - clamp((t - T.beam[0]) / (T.beam[1] - T.beam[0])), 1.6);
        pos = lv(S5.hold, S5.end, dk).addScaledVector(F0, Math.max(0, t - T.down[1]) * .7); pos.y = logLerp(S5.hold.y, S5.end.y, dk);
        const tip = lv(S5.TOPP, LAND, tk), fy = lerp(.36, .43, tk), [yt, pt] = lookAtY(pos, tip, fy), [y0, p0] = lookAtY(pos, S5.TOPP, .36);
        const w = ss(0, .25, (t - T.down[0]) / (T.down[1] - T.down[0])); yaw = lerp(y0, yt, w); pitch = lerp(p0, pt, w); }
      if (t < T.crane[1]) shadowAt(V(SC.x, 0, SC.z), 30); else shadowAt(V(VW.c.x, 0, VW.c.z), 160);   // the box changes only when the scroll is a speck
      D.focus = Math.max(1, pos.distanceTo(scroll.position)); D.aperture = lerp(.45, .02, Math.sqrt(ck)); D.maxCoc = 10; }
    aim(pos, yaw, pitch);
    // the light: the cloud comes over (N09b), the far point (N09c), the shaft and the pool (N09d), the sky clears
    const dim = ss(T.dim[0], T.dim[1], t), clear = ss(T.clear[0], T.clear[1], t);
    SK.cover.value = dim * (1 - clear) * .85; LU.uDim.value = lerp(1, .55, dim); sunL.intensity = 3.1;
    Lk.exposure = t < T.crane[0] ? 1.05 : lerp(1.0, .9, ss(T.crane[0], T.crane[1], t)) * lerp(1, .95, dim * (1 - clear)) + .05 * clear;
    const pk = ss(T.point[0], T.point[1], t) * (1 - ss(T.beam[1], T.beam[1] + 2.4, t) * .8);
    SK.pointK.value = pk; SK.pointDir.value.copy(S5.TOPP).sub(pos).normalize(); SK.gapK.value = ss(T.point[0] - .6, T.point[1], t) * (1 - clear);
    const bk = clamp((t - T.beam[0]) / (T.beam[1] - T.beam[0])); shaftU.uTip.value = 1 - Math.pow(1 - bk, 1.6); shaftU.uK.value = ss(T.beam[0], T.beam[0] + .5, t) * (1 - ss(T.pool[1] - 1.2, T.pool[1] + 1.4, t) * .8);
    setShaft(S5.TOPP, LAND.clone().add(V(0, -2, 0)), 16, 52);
    const pr = clamp((t - T.pool[0]) / (T.pool[1] - T.pool[0] + 1.2)); LU.uPool.value.set(LAND.x, LAND.z, lerp(25, 3600, Math.pow(pr, 2.1)), ss(T.beam[1] - .4, T.beam[1] + .3, t));
    sunLamp.power = lerp(1400, 500, dim * (1 - clear)); mistU.uK.value = 1;
  }
  function shotTown(t) {
    const Lk = film.look, D = film.dofCfg; poseTown(t); shadowAt(V(K0.x, 0, K0.z).addScaledVector(headC, -6), 40);
    const out = outward(TH0), ck = sine((t - T.craneC[0]) / (T.craneC[1] - T.craneC[0])), pk = sine((t - T.panC[0]) / (T.panC[1] - T.panC[0]));
    // behind the people, low, looking along the shore road toward the sun: he walks away into the light, they are dark against it,
    // their shadows long toward us; a slow push as he goes; then the crane rises from there (log altitude) and keeps the sun
    const tw = Math.min(t, T.craneC[0] + 2) - T.n08, walkPos = K0.clone().addScaledVector(headC, Math.max(0, tw) * .32);
    const base = walkPos.clone().addScaledVector(headC, -36).addScaledVector(out, 2.5);
    const yawH = yawOf(headC), yawSun = yawOf(SUN);
    const h = logLerp(6.4, 160, ck), back = 60 * ck;
    const pos = base.clone().addScaledVector(headC, -back).addScaledVector(out, -18 * ck); pos.y = hgt(base.x, base.z) + h;
    const yaw = yawH + (yawSun - yawH) * Math.max(ck * .5, pk);
    const [, pK] = lookAtY(pos, KS.position.clone().add(V(0, .9, 0)), .47);
    let pitch = lerp(pK, -16 * D2R, ck); pitch = lerp(pitch, -3.4 * D2R, pk);
    aim(pos, yaw, pitch); D.focus = pos.distanceTo(KS.position); D.aperture = .7 * (1 - ck) + .05;
    // the beacons: the villages along the shore toward the sun light one after another (slots 0–3), the town itself (slot 6)
    BEAC.forEach((v, i) => { if (!v) return; const bk = ss(T.beacons[i], T.beacons[i] + 1.5, t); LU.uVil.value[i].set(v.c.x, v.c.z, 150, bk * 1.1); v.lamp.power = bk * 520; });
    LU.uVil.value[6].set(V0.c.x, V0.c.z, 85, ss(T.q3 + .3, T.q3 + 1.9, t) * .55);
    LU.uFront.value.set(-1e5, 40, 20, 1); LU.uDim.value = lerp(.72, 1, ss(T.q3 + 1, T.end - 2, t));   // the morning brightens as they light
    Lk.exposure = lerp(.9, .98, ck) + .1 * ss(T.xd[0] - .6, T.end, t); sunLamp.power = 900 + 1500 * ss(T.xd[0] - .8, T.end, t);
    dustU.uA.value = .5 * (1 - ck); dustU.uC.value.copy(pos).addScaledVector(headC, 4);
  }
  const EXPO = .75;   // the block's overall key (look-check: brightness 78–97 over the whole part)
  function render(shot, t) { stage(shot, t); film.look.exposure *= EXPO; waterU.uT.value = t; tuftU.uT.value = t; mistU.uT.value = t; dustU.uT.value = t;
    sunLamp.pos.copy(cam.position).addScaledVector(SKY_SUN(), 600);
    LU.uSunV.value.copy(SKY_SUN()).transformDirection(cam.matrixWorldInverse);
    film.render(t); }
  const SKY_SUN = () => SK.sunDir.value;

  // ---- screen-space light scattering from the sun (heal-village.js godRays)
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const gS = mkC(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkC(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) {
    const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h);
    const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 175) / 80); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; }
    gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h);
    gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 24; i++) { const sc = 1 + i * .05; gbx.globalAlpha = Math.pow(.9, i) * .15; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); }
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.imageSmoothingEnabled = true; ctx.drawImage(gB, 0, 0, W, H); ctx.restore();
  }
  function blit(ctx, k) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore(); }
  function sunScreen() { tmpV.copy(cam.position).addScaledVector(SKY_SUN(), 1500).project(cam); return tmpV.z < 1 ? [(tmpV.x + 1) / 2, (1 - tmpV.y) / 2] : null; }
  let lastSun = null;
  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    const on = []; T.shots.forEach(([a, b], i) => { if (t >= a && t < b) on.push(i); });
    if (!on.length) on.push(t < T.n06 ? 4 : 5);
    render(on[0], t); blit(ctx, 1); lastSun = sunScreen();
    if (on.length > 1) { const i1 = on[1]; render(i1, t); blit(ctx, ss(T.shots[i1][0], T.shots[on[0]][1], t)); lastSun = sunScreen() || lastSun; }
    if (lastSun && Math.abs(lastSun[0] - .5) < .8 && Math.abs(lastSun[1] - .5) < .8) godRays(ctx, lastSun[0] * W, lastSun[1] * H, on[0] === 4 ? .32 * (1 - SK.cover.value) : .42);
  }
  // the body check: the joints of the named figures after the last pose (root frame of each figure)
  function joints() { const out = {}, Y = V(0, 1, 0); for (const [k, g] of Object.entries(PS)) { const U = g.userData; g.updateMatrixWorld(true);
      out[k] = { arms: U.arms.map(A => [A.S2 || A.S, A.E, A.T].map(v => v ? v.toArray() : null)), sd: U.arms.map(A => A.sd),
        legs: (U.legs || []).map(L => ({ th: Y.clone().applyQuaternion(L.thigh.quaternion).toArray(), sh: Y.clone().applyQuaternion(L.shin.quaternion).toArray(), foot: L.foot.getWorldPosition(V()).toArray() })),
        root: g.getWorldPosition(V()).toArray(), ry: g.rotation.y, neck: [U.neck.rotation.x, U.neck.rotation.y] }; } return out; }
  // pose only (no render) — for measuring joint deltas fast
  function poseOnly(t, B) { if (!T) T = beats(B); const on = []; T.shots.forEach(([a, b], i) => { if (t >= a && t < b) on.push(i); }); const s = on.length ? on[on.length - 1] : (t < T.n06 ? 4 : 5);
    if (s <= 2) poseHill(t); else if (s === 3) poseBeach(t); else if (s === 5) poseTown(t); return s; }
  return { film, draw, beats: () => T, sunAt: () => lastSun, joints, poseOnly, PS, dbg: { SC, SCP, scroll, LAND, V0, VW, K0, KH, KS, boatP } };
}

// ---------------------------------------------------------------- the sky (kit.js sky(), copied; + a cloud cover, a gap, a far point)
function skyDome(film, o = {}) {
  const c = Object.assign({ top: col('#05070d', .2), mid: col('#101826', .25), horizon: col('#202838', .35), sunDir: V(0, -1, 0), sunColor: col('#fff1d0', 20), sunGlow: col('#ffcf8a', 1.2), clouds: 0, cloudColor: col('#ffffff', 1), cloudShade: col('#a0a8c0', .6), radius: 1800 }, o);
  const u = { ...film.fogU, top: { value: c.top }, mid: { value: c.mid }, horizon: { value: c.horizon }, sunDir: { value: c.sunDir.clone().normalize() }, sunColor: { value: c.sunColor }, sunGlow: { value: c.sunGlow },
    clouds: { value: c.clouds }, cloudColor: { value: c.cloudColor }, cloudShade: { value: c.cloudShade }, time: { value: 0 }, skyFogMax: { value: film.atmos.max },
    cover: { value: 0 }, pointDir: { value: V(0, 1, 0) }, pointK: { value: 0 }, gapK: { value: 0 } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 0.)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.)).xyz, 1.); gl_Position = p.xyww; }`,
    fragmentShader: `varying vec3 vD; uniform vec3 top, mid, horizon, sunDir, sunColor, sunGlow, cloudColor, cloudShade, pointDir; uniform float clouds, time, skyFogMax, cover, pointK, gapK;
      ${GLSL.hash}
      ${FOG_GLSL}
      void main(){ vec3 d = normalize(vD); float y = d.y;
        vec3 c = mix(horizon, mid, smoothstep(-.02, .22, y)); c = mix(c, top, smoothstep(.2, .9, y));
        c = mix(c, mix(cloudShade, cloudColor, .45) * .9, cover * .55 * smoothstep(0., .3, y));   // overcast: the blue goes out of the sky
        float s = max(dot(d, sunDir), 0.); c += (sunGlow * (pow(s, 8.) * .45 + pow(s, 30.) * .45 + pow(s, 400.) * 1.1) * (1. - cover * .7) + sunColor * smoothstep(.9999, .99995, s) * (1. - smoothstep(.2, .6, cover)));
        if (y > 0.){ vec2 p = d.xz / (y + .12) * (1.6 + cover * 1.2) + vec2(time * .02, time * .007);
          float n = fbm(p * 1.3) * .7 + fbm(p * 3.7) * .3; float cv = clouds + cover;
          float m = smoothstep(.58 - min(cv, .62) * .3, .82 - min(cv, .62) * .22, n) * smoothstep(0., .2, y + cover * .12);
          float gap = smoothstep(.93, .985, dot(d, pointDir)); m *= 1. - gap * gapK;
          vec3 cc = mix(cloudShade * (.75 + .25 * n), cloudColor, smoothstep(.45, .8, n + (fbm(p * 7.3) - .5) * .18)); cc += sunGlow * pow(s, 6.) * .6 * (1. - cover * .6);
          cc *= 1. - cover * .25; cc += vec3(1., .85, .6) * gap * gapK * .35 * smoothstep(.5, .8, n);
          c = mix(c, cc, m * (.85 + cover * .15)); }
        float pd = max(dot(d, pointDir), 0.); c += pointK * (vec3(1., .95, .84) * smoothstep(.999955, .99999, pd) * 30. + vec3(1., .86, .62) * pow(pd, 2500.) * 2.4 + vec3(1., .8, .55) * pow(pd, 120.) * .3);
        float T = fogT(cameraPosition, d, skyFogMax); c = c * T + fogCol(d) * (1. - T);
        gl_FragColor = vec4(c, 0.); }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(c.radius, 48, 24), m); mesh.frustumCulled = false; mesh.renderOrder = -10;
  film.onFrame((t, f) => { mesh.position.setFromMatrixPosition(f.camera.matrixWorld); u.time.value = t; });
  mesh.onBeforeRender = (r, s, cam) => { mesh.position.setFromMatrixPosition(cam.matrixWorld); mesh.updateMatrixWorld(); };
  film.scene.add(mesh); return { mesh, u };
}
