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
  const D = .6;    // half a dissolve (1.2 s: different framings cross slowly, no per-frame spike)
  T.fly = [0, T.n01 + 7.7];                                 // S1: the 8 s glide
  const cuts = [0, T.fly[1], T.q1, T.n05, T.n07];
  T.shots = cuts.map((a, i) => [i ? a - D : 0, i < 4 ? cuts[i + 1] + D : T.n06]);   // S1 … S5 (soft dissolves between them)
  T.shots.push([T.n08, T.end]);                             // S6: one camera to the hand-off
  // round 4: the end of N09d at ground level (shot 6): S5 hands over on the overcast sky (a dissolve cloud to cloud)
  T.sfrom = T.n09c + 3.7; T.shots[4][1] = T.sfrom + .8; T.shots.push([T.sfrom, T.n06]);
  T.stilt = [T.sfrom + .2, T.n09d + .3]; T.stear = [T.sfrom + .1, T.n09d - .1]; T.ssweep = [T.n09d + .15, T.n09d + 3.4]; T.spush = [T.n09d + .1, T.n09d + 3.7];
  T.sunrise = [0, T.fly[1]];                                // S1 the disc clears the far ridge
  T.birds = T.n01 + 2.4;                                    // S1 the flock lifts (each on his own delay as we near)
  T.arm = [T.n04 + .3, T.n04 + 1.9];                        // S2 he lifts his hand and speaks
  T.heads = T.n04 + .6;                                     // S2 heads rise in a ripple
  T.front = [T.q1 + .4, T.q1 + 6.6];                        // S3 the morning light crosses the lake and the crowd
  T.marks = [T.n07 + .9, T.n07 + 5.3];                      // S5 the marks light on the scroll
  T.crane = [T.t1 - 2.0, T.t1 + 4.0];                       // S5 crane up 6 s
  T.dim = [T.n09b + .3, T.n09b + 3.2];                      // S5 the cloud comes, the light sinks
  T.tilt = [T.n09c + .15, T.n09c + 2.6];                    // S5 a small tilt up to the far light (a tear in the cloud, low in the sky)
  T.point = [T.n09c + .5, T.n09d + .9];                     // round 3: the tear brightens, then opens wide at N09d
  T.down = [T.n09c + 4.0, T.n09d + 4.1];                    // round 3: one calm descent and push, ≈ 5.8 s, eased in and out
  T.beam = [T.n09d + .05, T.n09d + 2.4];                    // broad shafts through the tear
  T.pool = [T.n09d + .2, T.n09d + 3.9];                     // the light sweeps over the land in a wave (feathered front)
  T.clear = [T.n09d + .6, T.n09d + 5.0];
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
    look: { exposure: 1.0, contrast: 1.06, saturation: 1.02, lift: col('#0a0908'), shadowTint: col('#d6d2e6'), highTint: col('#fff0d8'), vignette: .3, grain: .022, ca: .3 },
    cloud: { bottom: 520, top: 860, density: .05, scale: .0017, cover: .5, steps: 26, wind: V(.006, 0, .003), litTop: col('#ffe4c0', .9), litBottom: col('#8a7c84', .35), shadow: col('#2a2c3c', .1) },
  });
  const CLOUD = film.cloud; film.cloud = null;   // the raymarched slab: only under the cloud of N09b–N09d
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
  // ---------------------------------------------------------------- the colour journey (round 2: "one monotone amber haze")
  // k = 0 deep blue before dawn (cool mist, a warm thread on the horizon) → .45 the first gold on the water → 1 full warm morning.
  // Every shot sets its k from the line times; the sky, the fog, the fill light, the sun and the grade follow it, so the light is the
  // protagonist against a calmer, darker cool world (the first film's way), and the fog thins as the morning comes.
  const PAL = [
    { k: 0, top: ['#16223c', .55], mid: ['#34466a', .62], hor: ['#c88a68', .95], fog: ['#4c5c7a', .5], fogUp: ['#3c4c6c', .45], hs: ['#5a6a94', .5], hg: ['#262830', 1], hi: .5, sun: ['#ff9a60', 1.6], sunC: ['#ffb070', 7], glow: ['#ff9050', 1.2], cl: ['#ffc8a0', .7], cs: ['#4a5068', .55], dens: .00105, sat: .92, sh: ['#b8c4ff', 1], ht: ['#ffe2c0', 1] },
    { k: .45, top: ['#3e5e92', .62], mid: ['#cf9e74', .95], hor: ['#ffbf80', 1.7], fog: ['#b88c6c', .58], fogUp: ['#8890a4', .52], hs: ['#97a4c4', .58], hg: ['#5a4632', 1], hi: .58, sun: ['#ffc888', 3.0], sunC: ['#fff0d0', 11], glow: ['#ffb070', 1.7], cl: ['#ffd8b0', 1.1], cs: ['#9a7c78', .7], dens: .0008, sat: 1.0, sh: ['#c8cce8', 1], ht: ['#fff0d8', 1] },
    { k: 1, top: ['#5c86bc', .72], mid: ['#e0c4a0', 1.0], hor: ['#fff0d6', 1.55], fog: ['#d8c4a8', .55], fogUp: ['#a6b4c6', .55], hs: ['#b4c4dc', .66], hg: ['#6a5a40', 1], hi: .66, sun: ['#fff0d8', 3.4], sunC: ['#fffaf0', 12], glow: ['#ffd8a0', 1.5], cl: ['#fff4e4', 1.2], cs: ['#a89c98', .75], dens: .00055, sat: 1.06, sh: ['#d0d4e4', 1], ht: ['#fff4e0', 1] }];
  const _ca = new THREE.Color(), _cb = new THREE.Color();
  const pcol = (out, a, b, f) => out.copy(_ca.set(a[0]).multiplyScalar(a[1])).lerp(_cb.set(b[0]).multiplyScalar(b[1]), f);
  let palK = .5;
  function palette(k) {
    palK = k = clamp(k); const i = k < PAL[1].k ? 0 : 1, A = PAL[i], Bp = PAL[i + 1], f = ss(0, 1, (k - A.k) / (Bp.k - A.k)), L2 = film.look;
    pcol(SK.top.value, A.top, Bp.top, f); pcol(SK.mid.value, A.mid, Bp.mid, f); pcol(SK.horizon.value, A.hor, Bp.hor, f); pcol(SK.sunColor.value, A.sunC, Bp.sunC, f); pcol(SK.sunGlow.value, A.glow, Bp.glow, f);
    pcol(SK.cloudColor.value, A.cl, Bp.cl, f); pcol(SK.cloudShade.value, A.cs, Bp.cs, f);
    pcol(film.atmos.color, A.fog, Bp.fog, f); pcol(film.atmos.colorUp, A.fogUp, Bp.fogUp, f); film.atmos.density = lerp(A.dens, Bp.dens, f);
    pcol(hemi.color, A.hs, Bp.hs, f); pcol(hemi.groundColor, A.hg, Bp.hg, f); hemi.intensity = lerp(A.hi, Bp.hi, f);
    pcol(sunL.color, A.sun, Bp.sun, f); sunL.intensity = lerp(A.sun[1], Bp.sun[1], f); sunL.color.multiplyScalar(1 / Math.max(.01, sunL.intensity));
    L2.saturation = lerp(A.sat, Bp.sat, f); pcol(L2.shadowTint, A.sh, Bp.sh, f); pcol(L2.highTint, A.ht, Bp.ht, f);
    mistU.uCol.value.copy(film.atmos.color).multiplyScalar(1.5);
  }
  let shadowKey = '';
  function shadowAt(c, half) { const k = c.x.toFixed(1) + c.z.toFixed(1) + half; if (k === shadowKey) return; shadowKey = k;
    sunL.target.position.copy(c); sunL.position.copy(c).addScaledVector(SUN, 400); const sc = sunL.shadow.camera; Object.assign(sc, { left: -half, right: half, top: half, bottom: -half }); sc.updateProjectionMatrix(); sunL.target.updateMatrixWorld(); }

  // the light field shared by every material: the morning front (S3), the cloud's dimming (S5), the pool from above (N09d), the
  // villages' beacons (S6). LU is one set of uniform objects, so changing a value reaches every material at once.
  const LU = { uFrontS: { value: 1 }, uSweep: { value: new THREE.Vector2(0, 0) }, uFront: { value: new THREE.Vector4(-1e5, 40, 20, 1) }, uDim: { value: 1 }, uPool: { value: new THREE.Vector4(0, 0, 0, 0) },
    uVil: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, 1, 0)) }, uVilC: { value: col('#ffb468', 1) },
    uSunV: { value: V(0, 0, -1) }, uRimC: { value: col('#ffa868', 1.15) } };
  const LGLSL = `uniform float uFrontS; uniform vec2 uSweep; uniform vec4 uFront; uniform float uDim; uniform vec4 uPool; uniform vec4 uVil[8]; uniform vec3 uVilC; float gPool;
    float lightK(vec3 p, out float warm){
      float fz = uFrontS * p.z + p.y * uFront.z, fr = smoothstep(uFront.x - uFront.y, uFront.x + uFront.y, fz);
      float l = mix(uFront.w, 1., fr);
      float pd = length(p.xz - uPool.xy), pool = uPool.w * (1. - smoothstep(uPool.z * .45, uPool.z, pd));
      l *= mix(uDim, 1., clamp(pool, 0., 1.));
      gPool = clamp(pool, 0., 1.) + uPool.w * .9 * exp(-pow((pd - uPool.z * .9) / max(uPool.z * .1, 6.), 2.));   // the pool and its spreading golden edge
      gPool += uSweep.x * fr + uSweep.y * exp(-pow((fz - uFront.x - uFront.y * .4) / (uFront.y * .9), 2.));   // round 3: the sweep's light, brightest just behind its feathered edge
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
              reflectedLight.directDiffuse += diffuseColor.rgb * vec3(1., .82, .55) * gPool * (.4 + 1.2 * up) * 1.35; }
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
          totalEmissiveRadiance += vec3(1., .78, .52) * .13 * lk * lk + vec3(1., .74, .38) * gPool * .22; }`)
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

  // ---------------------------------------------------------------- the villages: Galilean courtyard houses (round 2)
  // Round 1's villages were single boxes ("lit boxes, game-like"). Now each house is a compound round a courtyard, as excavated at
  // Capernaum: two or three flat-roofed rooms on the courtyard's sides (black basalt or lime-plastered), a low courtyard wall with a
  // gate on the open side, an outside stair up to the roof, roof slabs with a parapet edge, dark doors facing the courtyard, small
  // windows outside; compounds in irregular blocks with lanes between, a lane down to the water. Each compound keeps a hearth point
  // in its courtyard (the beacons light there, S6) and a gate to stand people at (N09d).
  const houseG = K.roundedBox(1, 1, 1, .035, 1); houseG.translate(0, .5, 0);
  const doorG = new THREE.PlaneGeometry(1, 1);
  const VILL = [];   // { c: centre, th, comps: [{ yard, hearth, gate, roof }], lamp }
  function village(th, n, seed, { spread = 90, depth = 70, road = 0 } = {}) {
    const s = shoreAt(th), out = outward(th), al = along(th), r = rng(seed), comps = [], W4 = [], WC = [], R4 = [], RC = [], D4 = [];
    const c = s.clone().addScaledVector(out, 30 + depth * .5), baseRy = Math.atan2(al.x, al.z);
    const box = (cx, cz, y0, ry, lx, ly, lz, col, list = W4, cl = WC) => { const q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry); list.push(new THREE.Matrix4().compose(V(cx, y0, cz), q, V(lx, ly, lz))); cl.push(col); };
    const dark = (p, ry, w, h) => D4.push(new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(w, h, 1)));
    for (let i = 0, tries = 0; i < n && tries < n * 40; tries++) {
      const cw = 5.5 + r() * 3.5, cd = 5 + r() * 3, rd = 3.4 + r() * 1.1, size = Math.max(cw, cd) + 2 * rd;
      const u = (r() - .5) * spread * 2, v = 12 + Math.pow(r(), .85) * depth, p = s.clone().addScaledVector(al, u).addScaledVector(out, v);
      if (comps.some(q => Math.hypot(q.p.x - p.x, q.p.z - p.z) < (q.size + size) * .5 + 2.6)) continue;   // lanes between compounds
      if (Math.abs(u) < 5 && v < 45) continue;                                                       // the lane down to the water
      if (road && Math.abs(v - road) < 6 + size * .5) continue;                                      // the shore road stays open
      if (inland(p.x, p.z) < 6) continue;
      const ry = baseRy + (r() - .5) * .35, cs = Math.cos(ry), sn = Math.sin(ry), L = (a, b) => [p.x + a * cs + b * sn, p.z - a * sn + b * cs];   // local (a across, b along) → world
      const y0 = Math.min(hgt(p.x, p.z), ...[[-size / 2, -size / 2], [size / 2, size / 2], [size / 2, -size / 2], [-size / 2, size / 2]].map(([a, b]) => { const [x, z] = L(a, b); return hgt(x, z); })) - .35;
      const basalt = r() < .45, wc = basalt ? new THREE.Color(.42, .41, .4).multiplyScalar(.9 + r() * .15) : new THREE.Color().setHSL(.09 + r() * .03, .1 + r() * .1, .86 + r() * .1);
      const rc = new THREE.Color().setHSL(.08 + r() * .03, .12 + r() * .1, .62 + r() * .12);
      // rooms on the back side and one or both flanks; the front stays a wall with a gate
      const sides = ['back', r() < .7 ? 'left' : null, r() < .5 ? 'right' : null].filter(Boolean);
      for (const sd of sides) { const rh = 2.5 + r() * .8, hasL = sides.includes('left'), hasR = sides.includes('right');
        let a, b, la, lb;
        if (sd === 'back') { la = cw + (hasL ? rd : 0) + (hasR ? rd : 0); lb = rd; a = ((hasR ? rd : 0) - (hasL ? rd : 0)) / 2; b = cd / 2 + rd / 2; }
        else { a = (sd === 'left' ? -1 : 1) * (cw / 2 + rd / 2); b = 0; la = rd; lb = cd; }
        const [x, z] = L(a, b); box(x, z, y0, ry, la, rh + .35, lb, wc);
        box(x, z, y0 + rh + .3, ry, la + .18, .16, lb + .18, rc, R4, RC);                                         // the roof slab (beams and packed earth)
        const pa = sd === 'back' ? a : a + (sd === 'left' ? -la / 2 : la / 2), pb = sd === 'back' ? b + lb / 2 : b, [px, pz] = L(pa, pb);
        box(px, pz, y0 + rh + .44, ry, sd === 'back' ? la : .14, .3, sd === 'back' ? .14 : lb, wc);              // the parapet on the outer edge
        // a door toward the courtyard, a small window outside
        const din = sd === 'back' ? [0, -1] : [sd === 'left' ? 1 : -1, 0], doff = sd === 'back' ? 0 : (r() - .5) * cd * .4;
        const [dx, dz] = L(a + din[0] * (la / 2 + .02), b + din[1] * (lb / 2 + .02) + doff);
        dark(V(dx, y0 + .35 + .9, dz), ry + (sd === 'back' ? Math.PI : sd === 'left' ? Math.PI / 2 : -Math.PI / 2), .9, 1.8);
        const [wx, wz] = L(a - din[0] * (la / 2 + .02), b - din[1] * (lb / 2 + .02));
        dark(V(wx, y0 + .35 + rh * .62, wz), ry + (sd === 'back' ? 0 : sd === 'left' ? -Math.PI / 2 : Math.PI / 2), .42, .48);
        if (r() < .55) for (let k = 0; k < 5; k++) {   // the outside stair to the roof, against the courtyard face
          const along2 = (k - 2) * .55, [sx, sz] = sd === 'back' ? L(a + along2 + la * .25, b - lb / 2 - .45) : L(a + din[0] * (la / 2 + .45), b + along2);
          box(sx, sz, y0, ry, sd === 'back' ? .55 : .9, .35 + (k + 1) * (rh / 5), sd === 'back' ? .9 : .55, wc); }
      }
      // the courtyard wall on the open sides, a gate in the front
      const wallH = 1.4 + r() * .4;
      for (const half of [-1, 1]) { const len = cw / 2 - .75, [x, z] = L(half * (.75 + len / 2), -cd / 2); box(x, z, y0, ry, len, wallH, .42, wc); }
      for (const sd of ['left', 'right']) if (!sides.includes(sd)) { const [x, z] = L((sd === 'left' ? -1 : 1) * cw / 2, 0); box(x, z, y0, ry, .42, wallH, cd, wc); }
      const [yx, yz] = L((r() - .5) * 1.2, (r() - .5) * .6), yard = V(yx, hgt(yx, yz), yz), [gx, gz] = L(0, -cd / 2 - .9), [rx, rz] = L(0, cd / 2 + rd / 2);
      comps.push({ p, size, yard, gate: V(gx, hgt(gx, gz), gz), ry, hearth: yard.clone().add(V(0, .7, 0)), roof: V(rx, y0 + 3.4, rz) }); i++; }
    const mk = (geo, mat, list, cols) => { if (!list.length) return; const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((m, i) => { im.setMatrixAt(i, m); if (cols) im.setColorAt(i, cols[i]); }); im.castShadow = im.receiveShadow = true; S.add(im); return im; };
    mk(houseG, M.wall, W4, WC); mk(houseG, M.roof, R4, RC);
    if (D4.length) { const dm = new THREE.InstancedMesh(doorG, M.dark, D4.length); D4.forEach((m, i) => dm.setMatrixAt(i, m)); S.add(dm); }
    const v = { c, th, comps, items: comps, lamp: film.lamp(c.clone().setY(hgt(c.x, c.z) + 7), '#ffb060', { power: 0, size: 26, fog: 1 }) }; VILL.push(v); return v; }
  const V0 = village(V0TH, 22, 11, { spread: 80, depth: 85, road: 26 });     // the north-shore town (S6)
  const VW = village(VWTH, 22, 12, { spread: 80, depth: 80 });               // the west-shore village the light comes down on (N09d)
  const others = [[118, 12], [140, 10], [196, 12], [214, 12], [232, 11], [250, 11], [60, 13], [36, 10], [8, 11], [330, 9], [305, 10]].map(([th, n], i) => village(th, n, 40 + i, { spread: 60, depth: 60 }));
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
    // round 3: olive orchards in loose rows round the village the light comes down on (fields and groves for the sweep to turn gold)
    { const out = outward(VWTH), al = along(VWTH), base = shoreAt(VWTH); for (const [u0, v0, nu, nv] of [[-150, 110, 5, 3], [95, 95, 4, 4], [-40, 175, 6, 2], [150, 160, 4, 2]])
        for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const p = base.clone().addScaledVector(al, u0 + i * 13 + (r() - .5) * 4).addScaledVector(out, v0 + j * 12 + (r() - .5) * 4); if (inland(p.x, p.z) < 10) continue; olive(p.x, p.z, 4.2 + r() * 1.6, 1200 + i * 31 + j * 7 + u0); } }
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

  // the hill: him on the crest facing the sunrise; the crowd on the slope below him on that side in loose groups (never rows), facing him
  const crest = (() => { let best = V(), hb = -1; for (let i = 0; i < 900; i++) { const x = HILLP.x - 15 + (i % 30), z = HILLP.z - 15 + ((i / 30) | 0); const y = hgt(x, z); if (y > hb) { hb = y; best.set(x, y, z); } } return best; })();
  const KH = place(groups.hill, king(), crest.x, crest.z - 2, 0);   // round 2: facing −z (east, the sun) — from the lake side he is a back view against the light
  const hillCrowd = [];
  { const r = rng(2024), centres = [[-9, -10, 7], [7, -9, 6], [-22, -20, 9], [3, -22, 10], [20, -18, 8], [-10, -34, 10], [14, -36, 9], [-30, -38, 7], [30, -32, 6], [-2, -48, 8], [22, -50, 6]];   // round 2: on the slope east of him, toward the sun
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

  // the village the light comes down on (N09d): people in its lanes, gates and fields; each lifts his head as the light reaches him
  const vwGroup = new THREE.Group(); S.add(vwGroup); const vwPeople = [];
  { const r = rng(909); for (const cp of VW.comps) { const n = 1 + (r() * 2.4 | 0); for (let i = 0; i < n; i++) { const a = r() * 6.283, d = .8 + r() * 2.2, x = cp.gate.x + Math.cos(a) * d, z = cp.gate.z + Math.sin(a) * d;
        const p = person(r); place(vwGroup, p, x, z, r() * 6.283); p.userData.d0 = Math.hypot(x - VW.c.x, z - VW.c.z); vwPeople.push(p); } }
    for (let i = 0; i < 14; i++) { const a = r() * 6.283, d = 70 + r() * 60, x = VW.c.x + Math.cos(a) * d, z = VW.c.z + Math.sin(a) * d; if (inland(x, z) < 6) continue;
      const p = person(r, { kind: 'man' }); place(vwGroup, p, x, z, r() * 6.283); p.userData.d0 = d; p.userData.field = true; vwPeople.push(p); } }
  // smoke from the courtyard ovens of the village (round 3): soft puffs that rise, lean with the breeze, widen and thin; lit warm once
  // the morning light has reached them
  const smokeU = { uT: { value: 0 }, uL: { value: 0 }, uPx: { value: H / 1920 } };
  const smoke = (() => { const r = rng(515), src = VW.comps.filter(() => r() < .55).map(c => c.yard), n = 22, pos = new Float32Array(src.length * n * 3), sd = new Float32Array(src.length * n * 2);
    src.forEach((p, j) => { for (let i = 0; i < n; i++) { const k = (j * n + i); pos[k * 3] = p.x; pos[k * 3 + 1] = p.y + 1.2; pos[k * 3 + 2] = p.z; sd[k * 2] = i / n + r() * .03; sd[k * 2 + 1] = r(); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 2));
    const m = new THREE.ShaderMaterial({ uniforms: smokeU, transparent: true, depthWrite: false,
      vertexShader: `attribute vec2 aS; uniform float uT, uPx; varying float vA, vH;
        void main(){ float age = fract(uT * .055 + aS.x), h = age * 26.; vec3 q = position + vec3(h * .55 + sin(uT * .3 + aS.y * 9.) * .8 * age, h, -h * .2);
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(uPx * (1.2 + age * 7.) * 900. / -mv.z, 2., 160.);
          vA = smoothstep(0., .08, age) * (1. - age) * .32; vH = age; }`,
      fragmentShader: `uniform float uL; varying float vA, vH; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 9.) * vA;
          gl_FragColor = vec4(mix(vec3(.52, .54, .6), vec3(1.05, .86, .66), uL) * (.8 + .2 * vH), a); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.layers.set(2); pts.visible = false; S.add(pts); return pts; })();
  // ---------------------------------------------------------------- the street (N09d, round 4): ground level, in the liked village grammar
  // After heal-village.js (its house() and street: flat-roofed houses on both sides, a dusty road, the light at the end of the road,
  // rim-lit silhouettes, dust glowing in the light) — copied as a pattern, rebuilt here in this world: a street in the village the light
  // comes down on, running from the west (camera) down to the lake (east), so the light pours up it toward us.
  const STH = VWTH + 7, SOUT = outward(STH), SAL = along(STH), SB0 = shoreAt(STH).addScaledVector(SOUT, 58);
  const SP = (u, v) => SB0.clone().addScaledVector(SOUT, u).addScaledVector(SAL, v);   // u: + west (toward the camera end), v: across the street
  const streetG = new THREE.Group(); S.add(streetG); streetG.visible = false;
  const SW0 = SP(34, 0), SE0 = SP(-38, 0);                                            // the camera's end and the lake end of the street
  { // the road: packed dust draped on the land (a grid that follows the terrain, a little above it — no flat plane cutting through)
    const nu = 90, nv = 8, pos = [], idx = [], ae = [];
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const u = 40 - i * 82 / nu, v = -3.2 + j * 6.4 / nv, p = SP(u, v); pos.push(p.x, hgt(p.x, p.z) + .05, p.z); ae.push(j / nv); }
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + 1, c = a + nv + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aE', new THREE.Float32BufferAttribute(ae, 1)); g.setIndex(idx); g.computeVertexNormals();
    const rm = new THREE.MeshStandardMaterial({ color: '#c8a87c', roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    rm.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRP; attribute float aE; varying float vE;').replace('#include <project_vertex>', '#include <project_vertex>\nvRP = (modelMatrix * vec4(transformed, 1.)).xyz; vE = aE;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vRP; varying float vE;\n' + hashGLSL).replace('#include <map_fragment>', `#include <map_fragment>
        { vec2 q = vRP.xz; float n = fbm(q * .25), f = fbm(q * 2.3), st = smoothstep(.72, .78, fbm(q * 3.7 + 5.)); vec3 c = diffuseColor.rgb * mix(.82, 1.06, n) * mix(.92, 1.05, f); c = mix(c, vec3(.42, .36, .3), st * .5);
          float e = abs(vE - .5) * 2.; diffuseColor.rgb = c * mix(1., .88, smoothstep(.7, 1., e)); }`); };
    rm.customProgramCacheKey = () => 'gl-street'; lightify(rm, 'street');
    const road = new THREE.Mesh(g, rm); road.receiveShadow = true; streetG.add(road); }
  const SWALL = [wallM('#d9c4a0', 'sa'), wallM('#cdb08a', 'sb'), wallM('#6a645c', 'sc')];   // lime plaster, warm plaster, basalt
  const sDoors = [];   // { p (in the doorway, on the street side), face: direction from the door into the street }
  { const r = rng(4321);
    const box = (cx, cz, y0, ry, lx, ly, lz, m) => { const b = new THREE.Mesh(K.roundedBox(lx, ly, lz, .06, 2), m); b.position.set(cx, y0 + ly / 2, cz); b.rotation.y = ry; b.castShadow = b.receiveShadow = true; streetG.add(b); return b; };
    const ry0 = Math.atan2(SAL.x, SAL.z);
    for (const side of [-1, 1]) { let u = 40;
      while (u > -40) { const len = 5 + r() * 4, dep = 6 + r() * 3, h = 2.7 + r() * 1.4, gap = r() < .35 ? 2 + r() * 2.5 : .3, m = SWALL[(r() * 3) | 0];
        const c = SP(u - len / 2, side * (3.3 + dep / 2)), y0 = Math.min(hgt(c.x, c.z), ...[[-len / 2, -dep / 2], [len / 2, dep / 2]].map(([a, b]) => { const q = SP(u - len / 2 + a, side * (3.3 + dep / 2) + b); return hgt(q.x, q.z); })) - .3;
        box(c.x, c.z, y0, ry0, len, h + .3, dep, m);                                                             // the house (lx along the street, lz across)
        box(c.x, c.z, y0 + h + .25, ry0, len + .2, .18, dep + .2, M.roof);                                     // the roof edge
        const pe = SP(u - len / 2, side * 3.3 + side * .07); box(pe.x, pe.z, y0 + h + .38, ry0, len, .32, .14, m);   // the parapet on the street side
        if (r() < .4) { const up = SP(u - len / 2 + (r() - .5) * len * .3, side * (3.3 + dep * .6)); box(up.x, up.z, y0 + h + .3, ry0, len * .45, h * .55, dep * .45, m); }   // an upper room
        // a doorway onto the street (dark, set in), a small window; a few houses have an outside stair
        const du = u - len * (.3 + r() * .4), dp = SP(du, side * 3.28), door = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 2.0), M.dark);
        door.position.set(dp.x, y0 + .3 + 1.0, dp.z); door.lookAt(SP(du, 0).setY(y0 + 1.3)); streetG.add(door);
        sDoors.push({ p: SP(du, side * 2.7), face: V().copy(SAL).multiplyScalar(-side), u: du, side });
        const wp = SP(u - len * .15, side * 3.28), win = new THREE.Mesh(new THREE.PlaneGeometry(.45, .5), M.dark); win.position.set(wp.x, y0 + .3 + h * .68, wp.z); win.lookAt(SP(u - len * .15, 0).setY(y0 + h * .68)); streetG.add(win);
        if (r() < .3) { for (let k = 0; k < 5; k++) { const sp = SP(u - len + .6 + k * .55, side * 2.85); box(sp.x, sp.z, y0, ry0, .55, .35 + (k + 1) * (h / 5), .7, m); } }
        u -= len + gap; } }
    // palms and an olive along the street, low courtyard walls in the gaps
    for (const [u, v, h] of [[18, -7.5, 9], [-6, 8, 10], [-26, -7, 11]]) { const q = SP(u, v); palm(q.x, q.z, h, 900 + u); }
    for (const [u, v] of [[6, 8.5], [-16, -9]]) { const q = SP(u, v); olive(q.x, q.z, 4.6, 990 + u); } }
  // the people of the street: a few already standing in it (their backs to us), the others step out of their doorways as the light reaches
  // them and lift their heads toward it; a child points up, a woman shades her eyes
  const streetPeople = [];
  { const r = rng(2468), doors = sDoors.filter(d => d.u < 26 && d.u > -30).sort((a, b) => a.u - b.u);
    doors.forEach((d, i) => { if (i % 4 === 3) return; const p = person(r); streetG.add(p); p.userData.door = d; p.userData.mode = 'door'; streetPeople.push(p); });
    for (const [u, v, kind] of [[9, -1.2, 'man'], [6.5, 1.1, 'woman'], [3, -.4, 'child'], [-2, 1.6, 'man'], [-8, -1.3, 'woman'], [13, .6, 'man'], [-14, .2, 'man']]) {
      const p = person(r, { kind }); const q = SP(u, v); place(streetG, p, q.x, q.z, face(-SOUT.x, -SOUT.z) + (r() - .5) * .5); p.userData.mode = kind === 'child' ? 'point' : (kind === 'woman' && u > 0 ? 'shade' : 'stand'); p.userData.u = u; streetPeople.push(p); } }
  // the ovens' smoke behind the houses
  const sSmoke = (() => { const r = rng(616), n = 22, src = [[12, -9], [-4, 9.5], [-20, -10], [24, 10]].map(([u, v]) => { const q = SP(u, v); return q.setY(hgt(q.x, q.z) + 2.5); }), pos = new Float32Array(src.length * n * 3), sd = new Float32Array(src.length * n * 2);
    src.forEach((p, j) => { for (let i = 0; i < n; i++) { const k = j * n + i; pos[k * 3] = p.x; pos[k * 3 + 1] = p.y; pos[k * 3 + 2] = p.z; sd[k * 2] = i / n + r() * .03; sd[k * 2 + 1] = r(); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 2));
    const pts = new THREE.Points(g, smoke.material); pts.frustumCulled = false; pts.layers.set(2); streetG.add(pts); return pts; })();
  // the dust in the street's air: tens of motes, gold where the light has reached (a field fixed in the world along the street)
  const sDustU = { uT: { value: 0 }, uPx: { value: H / 1920 }, uF: { value: 1e5 }, uW: { value: 1 } };
  { const n = 260, rr = rng(99), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { const q = SP(30 - rr() * 62, (rr() - .5) * 6); p[i * 3] = q.x; p[i * 3 + 1] = hgt(q.x, q.z) + .3 + rr() * 4.5; p[i * 3 + 2] = q.z; sd[i] = rr(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: sDustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx, uF, uW; varying float vA;
        void main(){ vec3 q = position; q.y += sin(uT * .35 + aS * 40.) * .25; q.x += sin(uT * .22 + aS * 17.) * .4; q.z += cos(uT * .19 + aS * 23.) * .4;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (2. + 4. * aS) * 14. / d, 1., 10.); float lit = smoothstep(uF - uW, uF + uW, -q.z) * .85 + .15;
          vA = lit * clamp(1.4 - d / 30., 0., 1.) * (.35 + .65 * aS); }`,
      fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 12.); gl_FragColor = vec4(vec3(1., .82, .5) * 1.7, a * vA); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.layers.set(2); streetG.add(pts); }
  // ---------------------------------------------------------------- the hook (S1, round 2): boats, nets, birds and mist close to the lens
  // Round 1 opened on a small sun over a flat lake. Now the camera skims 1.6–2 m above the water in the blue mist before dawn; fishing
  // boats with nets out drift past close beside the lens, a flock bursts off the water all round the camera, and the sun breaks over the
  // hills as we pass (lens bloom, after motion/pilot/creation-lens.html). The lone figure on the hill arrives at the end of the move.
  const S1Z = z => KH.position.z + z;   // S1 runs along x ≈ KH.x, from z +250 (far out) to +130 (off the shore), the sun ahead
  const fishers = new THREE.Group(); S.add(fishers);
  const netTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.strokeStyle = 'rgba(40,34,28,1)'; g.lineWidth = 2.2;
    for (let i = -128; i < 256; i += 11) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); g.beginPath(); g.moveTo(i + 128, 0); g.lineTo(i, 128); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 2); return t; })();
  const netM = lightify(new THREE.MeshStandardMaterial({ color: '#3a3028', map: netTex, alphaTest: .4, alphaToCoverage: true, transparent: false, side: THREE.DoubleSide, roughness: 1 }), 'net', { vil: 0 });
  const floatM = lightify(K.std('#8a6a44', { roughness: .8 }), 'float', { vil: 0 });   // cork floats
  function smallBoat(L = 5.6, Wd = 1.7, Dp = .7) { const g = new THREE.Group(), hull = new THREE.CylinderGeometry(1, 1, L, 20, 5, true, Math.PI / 2, Math.PI); hull.rotateX(Math.PI / 2);
    const p = hull.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), u = Math.abs(z) / (L / 2), taper = Math.sqrt(Math.max(.02, 1 - Math.pow(u, 2.4)));
      p.setX(i, p.getX(i) * Wd / 2 * taper); p.setY(i, p.getY(i) * Dp * (.62 + .38 * taper) + Dp * .3 + Math.pow(u, 2.2) * .5 * (p.getY(i) > -.2 ? 1 : .3)); } hull.computeVertexNormals();
    const hm = new THREE.Mesh(hull, M.hull); hm.castShadow = true; g.add(hm);
    for (const zz of [-1.2, .4]) { const b = new THREE.Mesh(K.roundedBox(Wd * .8, .06, .26, .02, 1), M.wood); b.position.set(0, Dp * .82, zz); g.add(b); }
    return g; }
  const FB = [[-4.6, 196, .5, 1], [5.4, 178, -.4, -1], [-3.8, 160, 1.0, 1], [6.5, 146, .25, -1]].map(([dx, dz, ry, side], i) => {
    const b = smallBoat(); b.position.set(KH.position.x + dx, 0, S1Z(dz)); b.rotation.y = ry; fishers.add(b);
    const f = person(rng(70 + i), { kind: 'man', sit: true }); f.position.set(0, .42, i % 2 ? -.6 : .8); f.rotation.y = side * 1.4; b.add(f); f.userData.fisher = side;
    // the net: from the gunwale down into the water, its float line in an arc on the surface beside the boat
    const ng = new THREE.PlaneGeometry(4.2, 1.6, 12, 4), np = ng.attributes.position; for (let k = 0; k < np.count; k++) { const x = np.getX(k), y = np.getY(k); np.setZ(k, .25 * Math.sin(x * 1.3) + (y + .8) * .25); } ng.computeVertexNormals();
    const net = new THREE.Mesh(ng, netM); net.position.set(side * 1.05, .1, 0); net.rotation.set(0, Math.PI / 2, side * .55); b.add(net);
    for (let k = 0; k < 16; k++) { const a = -1.2 + k / 15 * 2.4, fl = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 6), floatM); fl.scale.y = .5; fl.position.set(side * (1.6 + 4.5 * Math.cos(a) - 4.5 + 3.4), -.01, 4.5 * Math.sin(a)); b.add(fl); }
    b.userData = { x0: b.position.x, z0: b.position.z, ry, ph: i * 1.7 }; return b; });
  // the flock: resting on the water in loose rafts along the path and beside it; each bird lifts as the lens comes near, banks away
  // and climbs past the camera (some across the frame, some overhead)
  const birds = []; { const bm = new THREE.MeshBasicMaterial({ color: '#1e1814', side: THREE.DoubleSide }); const r = rng(31);
    const rafts = [[-1.5, 208, 10], [2.5, 190, 14], [-2, 172, 16], [3, 154, 12], [-3.5, 186, 8]];
    for (const [rx, rz, n] of rafts) for (let i = 0; i < n; i++) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3)); const b = new THREE.Mesh(g, bm); b.frustumCulled = false; S.add(b);
      const side = Math.sign(rx + (r() - .5) * 6) || 1;
      b.userData = { x: KH.position.x + rx + (r() - .5) * 5, z: S1Z(rz + (r() - .5) * 9), dl: r() * .7, sp: .9 + r() * .5, vx: side * (2 + r() * 5), vy: 2.5 + r() * 4, vz: -4 - r() * 6, s: .3 + r() * .12, ph: r() * 6 }; birds.push(b); } }
  const setBird = (b, p, s, flap, fold = 0) => { const a = b.geometry.attributes.position, w = Math.sin(flap) * .55 * (1 - fold), sp = s * (1 - fold * .7);
    const pts = [[0, 0, 0], [-sp, s * w + fold * s * .2, -s * .3], [-s * .18, 0, s * .22], [0, 0, 0], [sp, s * w + fold * s * .2, -s * .3], [s * .18, 0, s * .22]];
    pts.forEach((q, i) => a.setXYZ(i, p.x + q[0], p.y + q[1], p.z + q[2])); a.needsUpdate = true; };

  // ---------------------------------------------------------------- mist over the water (soft sheets drifting just above it)
  // its colour follows the palette (blue before the sun, gold where the morning light reaches it — the light field lightK), and along
  // the S1 path the sheets lie low enough for the lens to pass through them
  const mistU = { uT: { value: 0 }, uSunV: { value: SUN.clone() }, uK: { value: 1 }, uCol: { value: col('#8090a8', .7) } };
  { const mm = new THREE.ShaderMaterial({ uniforms: { ...mistU, ...LU }, transparent: true, depthWrite: false,
      vertexShader: `varying vec3 vP; varying vec2 vU; void main(){ vP = (modelMatrix * vec4(position, 1.)).xyz; vU = uv; gl_Position = projectionMatrix * viewMatrix * vec4(vP, 1.); }`,
      fragmentShader: `uniform float uT, uK; uniform vec3 uSunV, uCol; varying vec3 vP; varying vec2 vU; ${hashGLSL}
        ${LGLSL}
        void main(){ vec2 q = vP.xz * .022 + vec2(uT * .02, uT * .006); float n = fbm(q) * .7 + fbm(q * 3.1 - uT * .015) * .3;
          float e = smoothstep(0., .25, vU.x) * smoothstep(1., .75, vU.x) * smoothstep(0., .25, vU.y) * smoothstep(1., .75, vU.y);
          vec3 vd = normalize(vP - cameraPosition); float d = length(vP - cameraPosition), fwd = pow(max(dot(vd, uSunV), 0.), 5.), wv; float lk = lightK(vP, wv);
          float a = smoothstep(.36, .74, n) * e * smoothstep(.8, 8., d) * (1. - smoothstep(900., 1800., d)) * .46 * uK;
          vec3 c = mix(uCol, uCol * vec3(1.35, 1.1, .85) + vec3(.5, .32, .14) * lk, lk) + vec3(1.3, .9, .55) * fwd * (.4 + lk);
          gl_FragColor = vec4(c, a); }` });
    const r = rng(17), add = (c, w = 260, d = 110) => { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, mm); m.position.copy(c); m.rotation.y = r() * .6 - .3; m.renderOrder = 2; m.layers.set(2); S.add(m); };
    for (let i = 0; i < 26; i++) { const c = i < 14 ? V((r() - .5) * 500, .6 + r() * 2.6, -1350 - r() * 340) : V(CX + (r() - .5) * 1800, .8 + r() * 3, CZ + (r() - .5) * 1100); if (inland(c.x, c.z) > -30) continue; add(c); }
    for (let i = 0; i < 34; i++) add(V(KH.position.x + (r() - .5) * 36, .25 + r() * 1.15, S1Z(130 + r() * 110)), 30 + r() * 30, 14 + r() * 12); }   // below the lens: they glow in bands on the water as we skim over   // low banks the lens passes through

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
    // round 2 (no text in the art): no glyph rows — only soft, blurred bands of ink like faded writing seen out of focus, columns of
    // grey-brown haze; the "same word" moments are points of gold light that kindle along the bands (luminous-score's soft rise and
    // held glow), with a faint warm sheen flowing along the parchment between them
    const mk = []; g.filter = 'blur(3.2px)';
    for (let col = 0; col < 3; col++) { const x0 = 72 + col * 310, x1 = x0 + 246; for (let row = 0; row < 11; row++) { const y = 31 + row * 19.5; let x = x0;
        while (x < x1) { const wd = 18 + r() * 40; g.fillStyle = `rgba(${58 + r() * 14 | 0},${42 + r() * 8 | 0},${30 + r() * 6 | 0},${.18 + r() * .14})`;
          g.beginPath(); g.ellipse(x + wd / 2, y - 1.5, wd / 2, 2.6 + r() * 1.2, 0, 0, 6.283); g.fill(); if (r() < .1 && mk.length < 24) mk.push([x + wd / 2, y - 1.5]); x += wd + 8; } } }
    g.filter = 'none';
    // the marks' map: a small soft point per mark — its order in green, its brightness in red
    const mc = document.createElement('canvas'); mc.width = tw; mc.height = th; const mg = mc.getContext('2d'); mg.fillStyle = '#000'; mg.fillRect(0, 0, tw, th);
    const order = mk.map((_, i) => i).sort(() => r() - .5);
    mk.forEach(([x, y], i) => { const o = (order[i] + .5) / mk.length, gg = mg.createRadialGradient(x, y, 0, x, y, 9); gg.addColorStop(0, `rgb(255,${o * 255 | 0},0)`); gg.addColorStop(.35, `rgb(120,${o * 255 | 0},0)`); gg.addColorStop(1, `rgb(0,${o * 255 | 0},0)`); mg.fillStyle = gg; mg.fillRect(x - 9, y - 9, 18, 18); });
    markU.uN.value = mk.length;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; const mtex = new THREE.CanvasTexture(mc); mtex.anisotropy = 8;
    const pm = new THREE.MeshStandardMaterial({ map: tex, roughness: .85, side: THREE.DoubleSide });
    pm.onBeforeCompile = sh => { Object.assign(sh.uniforms, markU); sh.uniforms.tMarks = { value: mtex };
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tMarks; uniform float uK, uN;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec4 m = texture2D(tMarks, vMapUv); float o = m.g; float a = clamp((uK * (uN + 1.5) / uN - o) * uN / 1.6, 0., 1.);   // each point rises over ~1.6 marks' time
            float on = a * (1. + .5 * exp(-a * 3.) * step(.02, a));
            float flow = uK * (1. - uK * .6) * exp(-pow((vMapUv.x - fract(uK * 1.3)) / .08, 2.)) * .12;   // a faint warm sheen travelling along
            totalEmissiveRadiance += vec3(1., .74, .32) * m.r * m.r * on * 2.2 + vec3(1., .82, .55) * flow; }`); };
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
  const OV = {};   // what the lens draws after the frame (lens flare, the far light's corona, the fires' halos)
  function stageReset() {}
  function stage(shot, t) {   // poses, light field, camera — everything but the render
    const Lk = film.look, D = film.dofCfg, [a, b] = T.shots[shot], k = clamp((t - a) / (b - a));
    for (const p of hillCrowd) p.visible = true; fishers.visible = false; vwGroup.visible = false; film.cloud = null; OV.flare = 0; OV.point = 0; OV.halos = null; OV.tear = 0; OV.glow = 0; OV.rays = 0; smoke.visible = false; streetG.visible = false; OV.jag = false;
    LU.uFrontS.value = 1; LU.uSweep.value.set(0, 0); SK.sunHide.value = 0; SK.domeK.value = 1;
    LU.uFront.value.set(-1e5, 40, 20, 1); LU.uDim.value = 1; LU.uPool.value.set(0, 0, 0, 0); LU.uVil.value.forEach(v => v.w = 0); VILL.forEach(v => v.lamp.power = 0);
    SK.sunDir.value.copy(SUN); SK.cover.value = 0; SK.clouds.value = .22; SK.pointK.value = 0; SK.gapK.value = 0; shaftU.uK.value = 0; markU.uK.value = 0; mistU.uK.value = 1; dustU.uA.value = 0;
    birds.forEach(bd => bd.visible = false); Lk.exposure = 1; Lk.contrast = 1.06; D.aperture = .5; D.maxCoc = 20; sunLamp.power = 2400; palette(.5);
    if (shot === 0) {   // S1: the hook — skimming the blue mist, boats and nets beside the lens, birds bursting off the water, the sun breaking
      vis('hill'); poseHill(t); for (const p of hillCrowd) p.visible = false; fishers.visible = true; shadowAt(V(KH.position.x, 0, S1Z(170)), 70);
      palette(lerp(.02, .3, ss(1.6, T.fly[1], t)));
      const el = lerp(1.2, 7.6, ss(.2, T.fly[1], t)) * D2R; SK.sunDir.value.set(.012, Math.sin(el), -Math.cos(el)).normalize();   // the disc clears the far ridge (≈ 3°) at ≈ 2.5 s
      LU.uFront.value.set(1e5, 40, 0, lerp(.28, .85, ss(2.2, T.fly[1], t)));                                                       // everything in the blue until the sun is up
      const L = T.fly[1], u = t / L, v0 = 12, dist = u < .74 ? v0 * L * u : v0 * L * (.74 + (u - .74) * (1 - (u - .74) / (2 * .26)));   // linear, easing out over the last 26 %
      const z = S1Z(222) - dist, x = KH.position.x + lerp(3, .5, u) + 1.6 * Math.sin(u * 3.1), y = lerp(1.7, 4.6, ss(.7, 1, u)) + .08 * Math.sin(t * 1.7);
      const pos = V(x, y, z), look = V(KH.position.x, lerp(1.2, KH.position.y + 2.5, ss(.55, 1, u)), z - 120);
      setCam(pos, look, -.035 * Math.sin(u * 3.1 + .5)); D.focus = 14; D.aperture = .5; D.maxCoc = 14; Lk.exposure = 1.05;
      // the boats rock and drift a little; the fishermen haul at their nets
      for (const bt of FB) { const U = bt.userData; bt.position.set(U.x0 + .3 * Math.sin(t * .2 + U.ph), .04 * Math.sin(t * 1.2 + U.ph), U.z0); bt.rotation.set(.02 * Math.sin(t * .9 + U.ph), U.ry + .03 * Math.sin(t * .3 + U.ph), .035 * Math.sin(t * 1.1 + U.ph));
        const f = bt.children.find(o => o.userData && o.userData.fisher), s = f.userData.s, h = .5 + .5 * Math.sin(t * 1.4 + U.ph);
        P.pose(f, { breath: P.breath(t, U.ph), lean: -.18 - .12 * h, twist: .1 * Math.sin(t * .7 + U.ph), head: [-.25, 0], hands: [V(-.15 * s, (.42 + .1 * h) * s, -.44 * s), V(.15 * s, (.42 + .1 * h) * s, -.44 * s)] }); }
      for (const bd of birds) { const U = bd.userData; bd.visible = true; const tl = (S1Z(222) - (U.z + 16)) / v0 + U.dl * .5, tau = Math.max(0, t - tl);
        const bp = V(U.x + U.vx * tau, .1 + U.vy * tau + 1.6 * tau * tau, U.z + U.vz * tau); setBird(bd, bp, U.s, t * 17 * U.sp + U.ph, tau > 0 ? 0 : .85 + .15 * Math.sin(t * 2 + U.ph)); }
      OV.flare = ss(2.0, 3.4, t) * (1 - .45 * ss(4.5, 8, t)) + .25 * Math.exp(-((t - 2.9) ** 2) / .08);   // the burst as the disc clears the ridge
    } else if (shot === 1) {   // S2: behind him (west of the crest), looking into the sunrise: he is a small dark figure against it, the crowd rim-lit
      vis('hill'); poseHill(t); shadowAt(V(KH.position.x, 0, KH.position.z - 26), 60); palette(lerp(.33, .43, k));
      const e = sine(k), az = lerp(-16, 16, e) * D2R, R0 = 25, c = KH.position, pos = V(c.x + Math.sin(az) * R0, c.y + lerp(4.4, 5.2, e), c.z + Math.cos(az) * R0);
      const [yw, pt] = lookAtY(pos, c.clone().add(V(0, .9, 0)), .56); aim(pos, yw, pt); D.focus = pos.distanceTo(c); D.aperture = .6; Lk.exposure = .95;
    } else if (shot === 2) {   // S3: high on the hill, looking west over the slope and the lake: the morning light comes across the water toward us
      vis('hill'); poseHill(t); shadowAt(V(KH.position.x, 0, KH.position.z + 60), 90);
      const fk = sine((t - T.front[0]) / (T.front[1] - T.front[0])); palette(lerp(.42, .6, fk)); LU.uFront.value.set(lerp(-700, -1960, fk), 60, 22, .42);
      const e = sine(k), c = KH.position, pos = V(c.x + 5 - 10 * e, c.y + 22 + 7 * e, c.z + 18 + 6 * e), [yw, pt] = lookAtY(pos, V(c.x - 12 * e, c.y - 16, c.z + 320), .46);
      aim(pos, yw, pt); D.focus = 200; D.aperture = .1; Lk.exposure = 1.0;
    } else if (shot === 3) {   // S4: low over the water behind the boat
      vis('beach'); poseBeach(t); shadowAt(V(boatP.x, 0, boatP.z - 10), 45); palette(lerp(.6, .66, k));
      boat.rotation.z = .03 * Math.sin(t * .9); boat.rotation.x = .015 * Math.sin(t * .7 + 1); boat.position.y = .05 * Math.sin(t * 1.1);
      const back = V(0, 0, 1), side = V(1, 0, 0), e = sine(k);   // west of the boat on the sun's line: the boat, the beach, the sun behind
      const pos = boatP.clone().addScaledVector(back, lerp(34, 25, e)).addScaledVector(side, lerp(2.6, 1.2, e)); pos.y = 1.9 + .06 * Math.sin(t * .8);
      const look = boatP.clone().addScaledVector(back, -60).addScaledVector(side, .3); look.y = 2.6;
      setCam(pos, look, .006 * Math.sin(t * .7)); D.focus = pos.distanceTo(boatP); D.aperture = .9; Lk.exposure = .82; dustU.uA.value = 0;
    } else if (shot === 4) { shotScrollSky(t); }
    else if (shot === 6) { shotStreet(t); }
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
    S5.TOPP = S5.hold.clone().addScaledVector(dirYP(6 * D2R, 14 * D2R), 2600);                            // round 3: the tear in the cloud, low in the eastern sky
    S5.end = LAND.clone().add(V(-28, 34, 118));                                                          // a low three-quarter view from behind the village: roofs, courtyards, people, the shore, the lake
    S5.look = LAND.clone().add(V(2, -2, -25));                                                          // what the final image centres on (the village's lake edge)
    S5.shaftTop = LAND.clone().add(V(20, 600, -620)); S5.shaftBot = LAND.clone().add(V(0, -2, -140));   // the shafts: from the cloud base over the lake down to the shore
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
      // round 3 (N09c–N09d): a small tilt up to the tear in the cloud, then ONE calm move — a slow descent and push (≈ 5.8 s, eased in and
      // out) from high over the west hills to a low three-quarter view over the village and the shore, the lake and the light beyond; the
      // final wide image holds under the core sentence with only a breath of drift
      const tu = eio((t - T.tilt[0]) / (T.tilt[1] - T.tilt[0]));
      const [yu, pu] = lookAtY(S5.hold, S5.TOPP, .3);
      if (t > T.tilt[0]) { yaw = lerp(yaw, yu, tu) + .025 * ss(T.tilt[0], T.down[0], t); pitch = lerp(pitch, pu, tu) + .012 * ss(T.tilt[1], T.down[0], t); }   // a slow drift while we look at the tear
      if (t > T.down[0]) { const dk = eio((t - T.down[0]) / (T.down[1] - T.down[0])), hold = Math.max(0, t - T.down[1]);
        pos = lv(S5.hold, S5.end, dk); pos.y = logLerp(S5.hold.y, S5.end.y, dk); pos.addScaledVector(F0, hold * .45); pos.y -= hold * .12;
        const [ye, pe] = lookAtY(S5.end, S5.look, .6), r = sine(dk);
        yaw = lerp(yu + .025, ye, r) + .006 * Math.sin(hold * .5); pitch = lerp(pu + .012, pe, r); }
      if (t < T.crane[1]) shadowAt(V(SC.x, 0, SC.z), 30); else shadowAt(V(VW.c.x, 0, VW.c.z - 40), 170);   // the box changes only when the scroll is a speck
      D.focus = Math.max(1, pos.distanceTo(scroll.position)); D.aperture = lerp(.45, .02, Math.sqrt(ck)); D.maxCoc = 10; }
    aim(pos, yaw, pitch);
    const dim = ss(T.dim[0], T.dim[1], t), clear = ss(T.clear[0], T.clear[1], t), sw = sine((t - T.pool[0]) / (T.pool[1] - T.pool[0])), swOn = ss(T.pool[0], T.pool[0] + .8, t);
    // one sky: the heavy, soft cloud deck (raymarched, big billows) hides the sun; the dome's thin clouds fade out under it (no fish scales)
    if (dim > 0) { film.cloud = CLOUD; CLOUD.density = .07 * dim * (1 - clear * .75); CLOUD.cover = lerp(.34, .6, clear); CLOUD.scale = .0011; CLOUD.steps = 30; CLOUD.wind.set(.028, .004, .012); CLOUD.litTop.copy(SK.cloudColor.value).multiplyScalar(.75 + .5 * clear); }
    // (the deck drifts and boils slowly — never a held frame)
    SK.domeK.value = 1 - dim * (1 - clear * .5); SK.sunHide.value = dim * (1 - clear * .7); SK.pointK.value = 0; SK.gapK.value = 0; SK.cover.value = 0;
    // the land under the cloud (cool shade), then the morning light sweeps over it from the lake in a wave with a soft feathered front;
    // the lit side carries the light from above (warm, on everything that faces the sky); the lake flashes gold behind the front
    LU.uDim.value = 1; LU.uFrontS.value = -1; LU.uFront.value.set(lerp(2100, -500, sw), 170, 6, lerp(1, .36, dim * (1 - swOn * 0)));
    LU.uSweep.value.set(.22 * swOn, .8 * swOn * (1 - ss(T.pool[1] - .3, T.pool[1] + 1.5, t)));
    LU.uPool.value.set(0, 0, 0, 0);
    // broad shafts through the tear, over the lake toward the village
    const bk = clamp((t - T.beam[0]) / (T.beam[1] - T.beam[0])); shaftU.uTip.value = 1 - Math.pow(1 - bk, 1.4); shaftU.uK.value = .7 * ss(T.beam[0], T.beam[0] + .8, t) * (1 - ss(T.pool[1], T.pool[1] + 2, t) * .7);
    setShaft(S5.shaftTop, S5.shaftBot, 70, 230);
    Lk.exposure = (t < T.crane[0] ? 1.05 : lerp(1.0, .9, ss(T.crane[0], T.crane[1], t)) * lerp(1, .93, dim * (1 - clear))) * lerp(1, .86, sw * swOn);
    sunLamp.power = lerp(1400, 300, dim * (1 - clear)); mistU.uK.value = 1;
    let pk2 = t < T.crane[0] ? .64 : lerp(.64, .74, ss(T.crane[0], T.crane[1], t)); pk2 = lerp(pk2, .46, dim * (1 - swOn)); pk2 = lerp(pk2, 1, sw * swOn); palette(pk2);
    film.atmos.density *= lerp(1, .3, sw * swOn); hemi.intensity *= lerp(1, .6, sw * swOn); Lk.contrast = lerp(1.06, 1.16, sw * swOn); Lk.saturation *= lerp(1, 1.1, sw * swOn);   // the haze lifts as the light comes: rich contrast in the final image
    sunL.intensity *= lerp(1, .18, dim * (1 - swOn)) * lerp(1, 1.25, sw * swOn);   // no direct sun (no glints) under the cloud; a strong low sun once it pours out
    // the tear in the cloud: a bright rift (overlay), brightening through N09c and opening wide as the shafts come
    OV.tear = ss(T.point[0], T.point[1], t) * (1 - ss(T.pool[1], T.pool[1] + 2.5, t) * .6); OV.tearOpen = ss(T.beam[0] - .3, T.beam[0] + 1.6, t); OV.tearPos = S5.TOPP;
    OV.rays = OV.tear * (.25 + .5 * OV.tearOpen);
    // the village: people lift their heads as the light reaches them; smoke rises from the courtyard ovens
    if (t > T.n09c) { vwGroup.visible = true; smoke.visible = true; smokeU.uT.value = t; smokeU.uL.value = swOn;
      const f = LU.uFront.value.x;
      for (const p of vwPeople) { const U = p.userData, fz = -p.position.z + p.position.y * 6, hk = ss(f - 40, f + 120, fz + 0) * swOn;
        const lift = ss(0, 1, hk) * ss(0, 1, (t - T.pool[0]) - U.ph * .8);
        P.pose(p, { ...P.idle(t, U.ph, { s: U.s }), head: [lerp(-.06, .46, lift), .1 * Math.sin(t * .3 + U.ph * 5) * (1 - lift)], lean: lerp(0, .05, lift),
          hands: U.ph > .72 ? [null, V(.2 * U.s, 1.35 * U.s, -.3 * U.s)] : null, handsW: [0, lift * (U.ph > .72 ? 1 : 0)] }); } }
  }
  function shotTown(t) {
    const Lk = film.look, D = film.dofCfg; poseTown(t); shadowAt(V(K0.x, 0, K0.z).addScaledVector(headC, -6), 40);
    const out = outward(TH0), ck = sine((t - T.craneC[0]) / (T.craneC[1] - T.craneC[0])), pk = sine((t - T.panC[0]) / (T.panC[1] - T.panC[0]));
    // round 2: "다시 새벽 호숫가" — the blue before sunrise again; the sun's rim comes up over the far shore during the crane, so the end
    // frame carries it into part 2's sun pane; the hearth fires of the villages along the shore kindle one village after another
    palette(lerp(.1, .34, ss(T.q3, T.end, t)));
    const el = lerp(2.2, 5.6, ss(T.n08, T.end, t)) * D2R; SK.sunDir.value.set(SUN.x, Math.sin(el), -Math.cos(el)).normalize();
    LU.uFront.value.set(1e5, 40, 0, lerp(.42, .8, ss(T.q3 + 2, T.end, t)));
    const tw = Math.min(t, T.craneC[0] + 2) - T.n08, walkPos = K0.clone().addScaledVector(headC, Math.max(0, tw) * .32);
    const base = walkPos.clone().addScaledVector(headC, -36).addScaledVector(out, 2.5);
    const yawH = yawOf(headC), yawSun = yawOf(SKY_SUN());
    const h = logLerp(6.4, 160, ck), back = 60 * ck;
    const pos = base.clone().addScaledVector(headC, -back).addScaledVector(out, -18 * ck); pos.y = hgt(base.x, base.z) + h;
    const yaw = yawH + (yawSun - yawH) * Math.max(ck * .5, pk);
    const [, pK] = lookAtY(pos, KS.position.clone().add(V(0, .9, 0)), .47);
    let pitch = lerp(pK, -16 * D2R, ck); pitch = lerp(pitch, el - 11 * D2R, pk);   // at the end the disc sits at ≈ 0.26 H (the window's sun pane)
    aim(pos, yaw, pitch); D.focus = pos.distanceTo(KS.position); D.aperture = .7 * (1 - ck) + .05;
    // the beacons: each village's courtyard fires kindle from its centre outward (≈ 1.2 s), village after village toward the sun; the town's
    // own fires are already burning; warm pools on the ground under them (uVil), and the halos drawn by the lens (overlay)
    const halos = [];
    const kindle = (v, t0, slot, k0 = 1) => { if (!v) return; const d0 = Math.max(...v.comps.map(c => Math.hypot(c.yard.x - v.c.x, c.yard.z - v.c.z)), 1);
      let sum = 0; for (const c of v.comps) { const dd = Math.hypot(c.yard.x - v.c.x, c.yard.z - v.c.z) / d0, a = ss(t0 + dd * 1.2, t0 + dd * 1.2 + .7, t) * k0; if (a <= 0) continue; sum += a;
        halos.push({ p: c.hearth.clone().add(V(0, .9, 0)), a, flick: c.p.x * 3.1 + c.p.z }); }
      if (slot >= 0) LU.uVil.value[slot].set(v.c.x, v.c.z, 120, Math.min(1.1, sum / v.comps.length * 1.3)); };
    BEAC.forEach((v, i) => kindle(v, T.beacons[i], i));
    kindle(V0, T.n08 - 3, 6, .9);
    OV.halos = halos;
    Lk.exposure = lerp(1.0, 1.0, ck) + .1 * ss(T.xd[0] - .6, T.end, t); sunLamp.power = 600 + 1800 * ss(T.xd[0] - 1.5, T.end, t);
    dustU.uA.value = .4 * (1 - ck); dustU.uC.value.copy(pos).addScaledVector(headC, 4);
  }
  // ---------------------------------------------------------------- S5b (round 4): the street — the light reaches everyone
  // 59–61 from the overcast sky the camera tilts slowly down to the street in shadow; the tear is above the street's lake end.
  // 61–64.5 the shaft widens and the light pours up the street toward the camera in a wave (feathered front): doorways, courtyards, palms
  // and oven smoke catch it one by one; people step out of their doors (staggered, planted feet) and lift their heads; a child points
  // up, a woman shades her eyes; the dust ignites gold. A slow push down the street at walking height.
  // 64.5–66.8 the luminous street held, a calm drift, the people standing in the light. No sun disc anywhere (the tear is the source;
  // the disc stays hidden — no halo behind a head).
  const SFE = -SE0.z + 18, SFW = -SW0.z - 30;                          // the front's start (beyond the lake end) and end (behind the camera)
  const sFront = t => lerp(SFE, SFW, sine((t - T.ssweep[0]) / (T.ssweep[1] - T.ssweep[0])));
  const tReach = z => { let lo = T.ssweep[0], hi = T.ssweep[1] + .5; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (sFront(m) > -z) lo = m; else hi = m; } return (lo + hi) / 2; };
  function poseStreet(t) {
    for (const p of streetPeople) { const U = p.userData, s = U.s;
      if (U.mode === 'door') { const d = U.door, t0 = (U.t0 ??= tReach(d.p.z) + .15 + U.ph * .5), tEnd = t0 + 2.6;
        const start = d.p.clone().addScaledVector(d.face, -.7), { tau, v } = warp(t, t0, .7, tEnd, .7), w = P.walk(p, tau, t0, { T: 1.3, L: .42 }), id = P.idle(t, U.ph, { s });
        const pos = start.clone().addScaledVector(d.face, w.dist); p.position.set(pos.x, hgt(pos.x, pos.z), pos.z);
        const turn = ss(tEnd - .2, tEnd + 1.4, t), towardLight = face(-SOUT.x, -SOUT.z), out = face(d.face.x, d.face.z); p.rotation.y = out + Math.atan2(Math.sin(towardLight - out), Math.cos(towardLight - out)) * turn * .55;
        const st = [{ u: .21, lift: 0 }, { u: -.21, lift: 0 }], endF = P.walk(p, warp(tEnd + 1, t0, .7, tEnd, .7).tau, t0, { T: 1.3, L: .42 }).feet.map(f => ({ u: f.u, lift: 0 }));
        const feet = t < t0 ? stepFeet(id.feet, st, ss(t0 - .6, t0 - .02, t), [1, 0]) : t < tEnd ? w.feet : stepFeet(endF, id.feet, ss(tEnd + .05, tEnd + .9, t), endF[0].u < endF[1].u ? [0, 1] : [1, 0]);
        const lift = ss(t0 + .6, t0 + 2.0, t);
        P.pose(p, { ...id, feet, bob: lerp(id.bob, w.bob, v), swing: [lerp(id.swing[0], w.swing[0], v), lerp(id.swing[1], w.swing[1], v)], head: [lerp(-.05, .42, lift), lerp(0, -.35, lift * (1 - turn))] });
        if (!PS.streetDoor) PS.streetDoor = p; continue; }
      const tr = (U.tr ??= tReach(p.position.z) + U.ph * .6), lift = ss(tr, tr + 1.6, t), id = P.idle(t, U.ph, { s });
      if (U.mode === 'point') { P.pose(p, { ...id, head: [lerp(.05, .55, lift), 0], hands: [null, V(.16 * s, 1.95 * s, -.32 * s)], handsW: [0, ss(tr + .4, tr + 1.8, t)] }); PS.streetChild = p; continue; }
      if (U.mode === 'shade') { P.pose(p, { ...id, head: [lerp(0, .3, lift), 0], hands: [null, V(.2 * s, 1.5 * s, -.12 * s)], handsW: [0, ss(tr + .3, tr + 1.7, t)] }); PS.streetShade = p; continue; }
      P.pose(p, { ...id, head: [lerp(-.04, .4, lift), .05 * Math.sin(t * .3 + U.ph * 6)], lean: lerp(0, .04, lift) }); } }
  function shotStreet(t) {
    vis('none'); streetG.visible = true; const Lk = film.look, D = film.dofCfg; poseStreet(t); shadowAt(SP(-2, 0), 46);
    const tl = eio((t - T.stilt[0]) / (T.stilt[1] - T.stilt[0])), pk = eio((t - T.spush[0]) / (T.spush[1] - T.spush[0])), hold = Math.max(0, t - T.spush[1]);
    const pos = SW0.clone().addScaledVector(SOUT, -(4.8 * pk + .3 * hold)); pos.y = hgt(pos.x, pos.z) + 1.7 + .025 * Math.sin(t * 1.1);
    const yaw = yawOf(SOUT.clone().negate()) + .012 * Math.sin(t * .23), pitch = (lerp(34, 3.2, tl) - .4 * ss(T.spush[0], T.spush[1] + 2, t)) * D2R;
    aim(pos, yaw, pitch); D.focus = 14; D.aperture = .7; D.maxCoc = 12;
    const sw = sine((t - T.ssweep[0]) / (T.ssweep[1] - T.ssweep[0])), on = ss(T.ssweep[0], T.ssweep[0] + .7, t);
    LU.uFrontS.value = -1; LU.uFront.value.set(sFront(t), 9, 0, .3); LU.uSweep.value.set(.22 * on, .7 * on * (1 - ss(T.ssweep[1] - .2, T.ssweep[1] + 1.6, t))); LU.uDim.value = 1;
    sDustU.uF.value = sFront(t); sDustU.uW.value = 9; sDustU.uT.value = t;
    palette(lerp(.45, 1, sw * on)); film.cloud = CLOUD; CLOUD.density = .07 * (1 - .78 * sw); CLOUD.cover = lerp(.34, .58, sw); CLOUD.scale = .0011; CLOUD.steps = 30; CLOUD.wind.set(.028, .004, .012);
    CLOUD.litTop.copy(SK.cloudColor.value).multiplyScalar(.8 + .4 * sw);
    SK.domeK.value = 0; SK.sunHide.value = 1; SK.cover.value = 0;
    sunL.intensity *= lerp(.4, 1.35, sw * on); hemi.intensity *= lerp(1, .62, sw * on); film.atmos.density *= lerp(1, .7, sw * on);
    Lk.exposure = lerp(1.12, .88, sw * on); Lk.contrast = lerp(1.06, 1.14, sw * on); sunLamp.power = 0;
    // the tear above the lake end, opening; the shaft from it down onto the street's end; the dust and the ovens' smoke
    // round 5: no drawn tear — the cloud deck itself thins over the lake and the sky low over the water brightens warmly; soft rays fan
    // down into the street from that brightness (no shape, nothing that reads as an object)
    OV.tear = 0; OV.glow = ss(T.stear[0], T.ssweep[0] + 1.8, t); OV.glowPos = SE0.clone().add(V(0, 70, -900)).addScaledVector(SAL, 20);
    OV.rays = OV.glow * (.25 + .4 * ss(T.ssweep[0] - .4, T.ssweep[0] + 1.8, t)) * (1 - .3 * ss(T.spush[1], T.spush[1] + 2, t));
    setShaft(SE0.clone().add(V(0, 500, -1100)).addScaledVector(SAL, 30), SE0.clone().add(V(0, 0, -10)), 60, 120); shaftU.uK.value = .75 * OV.tearOpen; shaftU.uTip.value = ss(T.ssweep[0] - .5, T.ssweep[0] + 1.2, t);
    smokeU.uT.value = t; smokeU.uL.value = sw * on; mistU.uK.value = 0;
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
  const proj = p => { tmpV.copy(p).project(cam); if (tmpV.z >= 1 || tmpV.z <= -1) return null; return [(tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H, cam.position.distanceTo(p)]; };
  // what the lens adds after the frame (round 2), measured with each shot's own camera right after its render
  function overlayInfo(t) { const o = { flare: OV.flare, sun: sunScreen(), point: 0, halos: [] };
    if (OV.point > .01 && OV.pointPos) { const q = proj(OV.pointPos); if (q) { o.point = OV.point; o.pp = q; } }
    if (OV.glow > .01 && OV.glowPos) { const q = proj(OV.glowPos); if (q) { o.glow = OV.glow; o.gp = q; o.rays = OV.rays; } }
    if (OV.tear > .01 && OV.tearPos) { const q = proj(OV.tearPos); if (q) { o.tear = OV.tear; o.tearOpen = OV.tearOpen; o.tp = q; o.rays = OV.rays; o.jag = OV.jag; } }
    if (OV.halos) for (const h of OV.halos) { const q = proj(h.p); if (q && q[0] > -100 && q[0] < W + 100 && q[1] > -100 && q[1] < H + 100) o.halos.push([q[0], q[1], q[2], h.a, h.flick]); }
    return o; }
  // the lens, after motion/pilot/creation-lens.html: a layered corona (white-hot heart, warm corona, wide amber air), an anamorphic streak
  // (warm line, cool ends) and ghosts on the line from the light through the frame's centre
  function corona(ctx, x, y, I, k = 1, rings = [[16, '255,255,252', '255,246,226', 1], [60, '255,244,214', '255,214,150', .7], [190, '255,214,160', '255,170,96', .32], [520, '255,190,130', '255,150,80', .14]]) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [r, cA, cB, a] of rings) { const R0 = r * k * (.8 + .2 * I), g = ctx.createRadialGradient(x, y, 0, x, y, R0);
      g.addColorStop(0, `rgba(${cA},${Math.min(1, a * I)})`); g.addColorStop(.3, `rgba(${cB},${Math.min(1, a * I * .45)})`); g.addColorStop(1, `rgba(${cB},0)`); ctx.fillStyle = g; ctx.fillRect(x - R0, y - R0, R0 * 2, R0 * 2); }
    ctx.restore(); }
  function lensFlare(ctx, sx, sy, I) {
    if (I <= .01) return; corona(ctx, sx, sy, I * .55, .8);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [sy2, col2, a, wr] of [[.012, '255,236,206', .42, .55], [.005, '170,200,255', .26, .95]]) { ctx.save(); ctx.translate(sx, sy); ctx.scale(1, sy2); const R0 = W * wr, g = ctx.createRadialGradient(0, 0, 0, 0, 0, R0);
      g.addColorStop(0, `rgba(${col2},${Math.min(1, a * I)})`); g.addColorStop(.25, `rgba(${col2},${a * I * .35})`); g.addColorStop(1, `rgba(${col2},0)`); ctx.fillStyle = g; ctx.fillRect(-R0, -R0, R0 * 2, R0 * 2); ctx.restore(); }
    const dx = W / 2 - sx, dy = H / 2 - sy;
    for (const [kk, r, col2, a] of [[.55, 46, '150,190,255', .16], [1.15, 110, '255,190,130', .1], [1.6, 36, '190,255,220', .14], [2.05, 170, '140,170,255', .07]]) {
      const gx = sx + dx * kk * 2, gy = sy + dy * kk * 2, gr = r * 1.2, gg = ctx.createRadialGradient(gx, gy, gr * .55, gx, gy, gr);
      gg.addColorStop(0, `rgba(${col2},${a * I * .2})`); gg.addColorStop(.85, `rgba(${col2},${a * I * .5})`); gg.addColorStop(1, `rgba(${col2},0)`); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, 6.283); ctx.fill(); }
    ctx.restore(); }
  // the tear in the cloud (round 3): not a disc — a ragged rift of light along the cloud's grain, brightest at its heart, widening as it
  // opens; drawn under the frame's own scatter so the shafts (godRays) come out of it
  // the tear in the cloud (round 3): not a disc or a shape — the cloud's own texture brightened along a long feathered band (its edges turn
  // to silver lining), with a thin ragged core of light; it widens as it opens. Drawn under the scatter so the shafts come out of it.
  const tearC = mkC(W >> 1, H >> 1), tgx = tearC.getContext('2d');
  // round 4: a real break — a jagged opening (a ragged polygon along the cloud's grain), bright sky inside, silver edges, the light behind
  function drawTearJag(ctx, o, k) {
    const [x, y] = o.tp, I = o.tear * k, op = o.tearOpen || 0, L = W * (.1 + .24 * op), Hh = H * (.007 + .022 * op), r = rng(311), N = 34, top = [], bot = [];
    // a ragged outline: the envelope of a torn seam, broken at two scales (no regular zigzag), the lower edge flatter than the upper
    for (let i = 0; i <= N; i++) { const u = i / N, xx = (u - .5) * L, env = Math.pow(Math.sin(Math.PI * u), .8) * (.75 + .25 * Math.sin(u * 9.1 + 1.3));
      const j1 = Math.sin(u * 23.7 + 2) * .35 + (r() - .5) * .45; top.push([xx + (r() - .5) * L * .012, -Hh * env * (.8 + j1)]); bot.push([xx + (r() - .5) * L * .012, Hh * env * (.45 + .3 * Math.sin(u * 17.3) + (r() - .5) * .25)]); }
    const path = new Path2D(); top.forEach(([a, b], i) => i ? path.lineTo(a, b) : path.moveTo(a, b)); for (let i = N; i >= 0; i--) path.lineTo(...bot[i]); path.closePath();
    ctx.save(); ctx.translate(x, y); ctx.rotate(-.06);
    ctx.save(); ctx.filter = 'blur(14px)'; ctx.globalAlpha = .22 * I; ctx.strokeStyle = 'rgba(40,38,48,1)'; ctx.lineWidth = Hh * 1.2 + 12; ctx.stroke(path); ctx.restore();   // the cloud heavier round the break
    ctx.globalCompositeOperation = 'screen';
    ctx.save(); ctx.filter = 'blur(28px)'; ctx.globalAlpha = .4 * I; ctx.fillStyle = 'rgba(255,224,170,1)'; ctx.fill(path); ctx.restore();   // its glow in the cloud
    ctx.save(); ctx.filter = 'blur(4px)'; const g = ctx.createLinearGradient(0, -Hh, 0, Hh); g.addColorStop(0, `rgba(255,244,220,${.7 * I})`); g.addColorStop(.6, `rgba(255,236,198,${.62 * I})`); g.addColorStop(1, `rgba(248,212,160,${.45 * I})`); ctx.fillStyle = g; ctx.fill(path); ctx.restore();
    ctx.save(); ctx.filter = 'blur(1.5px)'; ctx.strokeStyle = `rgba(255,252,240,${.75 * I})`; ctx.lineWidth = 1.4 + 1.2 * op; ctx.stroke(path); ctx.restore();   // silver edges
    ctx.restore(); }
  function drawTear(ctx, o, k) {
    if (!o.tear || k <= .01) return; if (o.jag) return drawTearJag(ctx, o, k); const [x, y] = o.tp, I = o.tear * k, op = o.tearOpen || 0, L = W * (.32 + .5 * op), Hh = H * (.035 + .05 * op), ang = -.1;
    // 1. the band mask × the frame itself (half res), laid back over with 'screen' twice: the clouds' own billows light up near the rift
    const w2 = tearC.width, h2 = tearC.height; tgx.setTransform(1, 0, 0, 1, 0, 0); tgx.globalCompositeOperation = 'source-over'; tgx.clearRect(0, 0, w2, h2);
    tgx.save(); tgx.translate(x / 2, y / 2); tgx.rotate(ang); const r = rng(77);
    for (let i = 0; i < 7; i++) { const u = (i / 6 - .5) * 2; tgx.save(); tgx.translate(u * L * .3 + (r() - .5) * L * .06, (r() - .5) * Hh * .4); tgx.scale(L * (.22 + .1 * r()) / 200, Hh * (.8 + .5 * r()) / 200);
      const g = tgx.createRadialGradient(0, 0, 0, 0, 0, 100); g.addColorStop(0, `rgba(255,255,255,${.75 * (1 - .4 * Math.abs(u))})`); g.addColorStop(1, 'rgba(255,255,255,0)'); tgx.fillStyle = g; tgx.fillRect(-100, -100, 200, 200); tgx.restore(); }
    tgx.restore(); tgx.globalCompositeOperation = 'source-in'; tgx.drawImage(ctx.canvas, 0, 0, w2, h2); tgx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = Math.min(1, I * 1.1); ctx.drawImage(tearC, 0, 0, W, H); ctx.drawImage(tearC, 0, 0, W, H); ctx.restore();
    // 2. the thin core of light inside it: one long streak, feathered at both ends
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalCompositeOperation = 'screen';
    for (const [sx, sy2, a] of [[L * .46, Hh * (.08 + .1 * op), .85], [L * .6, Hh * (.25 + .2 * op), .3]]) { ctx.save(); ctx.scale(sx / 100, sy2 / 100); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
      g.addColorStop(0, `rgba(255,250,232,${a * I})`); g.addColorStop(.45, `rgba(255,228,180,${a * .45 * I})`); g.addColorStop(1, 'rgba(255,210,150,0)'); ctx.fillStyle = g; ctx.fillRect(-100, -100, 200, 200); ctx.restore(); }
    ctx.restore(); }
  function drawOverlay(ctx, o, t, k) {
    if (k <= .01) return; ctx.save(); ctx.globalAlpha = k;
    if (o.flare > .01 && o.sun) lensFlare(ctx, o.sun[0] * W, o.sun[1] * H, o.flare);
    if (o.point > .01) corona(ctx, o.pp[0], o.pp[1], o.point * .9, .55);   // the far light, seen through the cloud
    for (const [x, y, d, a, fl] of o.halos) { const R = clamp(26000 / d, 22, 120), I = a * (.92 + .08 * Math.sin(t * 2.3 + fl)) * clamp(900 / d, .35, 1);   // a fire's halo in the haze
      corona(ctx, x, y, I, R / 60, [[3, '255,250,230', '255,220,160', 1], [16, '255,214,150', '255,170,90', .55], [60, '255,180,110', '255,140,70', .22], [150, '255,170,100', '255,130,60', .08]]); }
    ctx.restore(); }
  let lastSun = null;
  let warmed = false;
  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    // a page that starts inside the street shot (a render worker, a still) must first draw one frame under the cloud deck, or the deck's
    // first use there leaves the sky unlit (seen in round 5's stills): warm the passes once, then draw the asked frame
    if (!warmed) { warmed = true; render(4, T.n09b + 2.5); }
    const on = []; T.shots.forEach(([a, b], i) => { if (t >= a && t < b) on.push(i); });
    if (!on.length) on.push(t < T.n06 ? 4 : 5);
    render(on[0], t); const o0 = overlayInfo(t); blit(ctx, 1); lastSun = o0.sun;
    let o1 = null, k1 = 0; if (on.length > 1) { const i1 = on[1]; render(i1, t); o1 = overlayInfo(t); k1 = ss(T.shots[i1][0], T.shots[on[0]][1], t); blit(ctx, k1); lastSun = o1.sun || lastSun; }
    // the sun's scatter weighted by how much of each shot is on screen (a dissolve to a shot without the sun fades it, never a pop)
    drawTear(ctx, o0, 1 - k1); if (o1) drawTear(ctx, o1, k1);
    for (const [o, kk] of [[o0, 1 - k1], [o1, k1]]) if (o && o.glow && kk > .01) {   // the sky over the lake brightening (a broad soft warmth, no shape)
      const [gx, gy] = o.gp, I = o.glow * kk; ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (const [rw, rh, a, c] of [[W * 1.1, H * .16, .42, '255,226,176'], [W * .7, H * .07, .38, '255,240,210'], [W * 1.6, H * .34, .16, '255,210,160']]) {
        ctx.save(); ctx.translate(gx, gy); ctx.scale(rw / 200, rh / 200); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 100); g.addColorStop(0, `rgba(${c},${a * I})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(-100, -100, 200, 200); ctx.restore(); }
      ctx.restore(); }
    if (o0.glow && o0.gp) godRays(ctx, o0.gp[0], o0.gp[1], o0.rays * (1 - k1) * 1.2);
    else if (o0.tear && o0.tp) godRays(ctx, o0.tp[0], o0.tp[1], o0.rays * (1 - k1) * 1.1);   // the shafts out of the tear
    else { const inF = o => o && o.sun && SK.sunHide.value < .5 && Math.abs(o.sun[0] - .5) < .8 && Math.abs(o.sun[1] - .5) < .8, gk = (inF(o0) ? 1 - k1 : 0) + (inF(o1) ? k1 : 0), gs = inF(o1) && (k1 > .5 || !inF(o0)) ? o1.sun : o0.sun;
      if (gk > .01 && gs) godRays(ctx, gs[0] * W, gs[1] * H, gk * (on[0] === 4 ? .32 : .42)); }
    drawOverlay(ctx, o0, t, 1 - k1); if (o1) drawOverlay(ctx, o1, t, k1);
  }
  // the body check: the joints of the named figures after the last pose (root frame of each figure)
  function joints() { const out = {}, Y = V(0, 1, 0); for (const [k, g] of Object.entries(PS)) { const U = g.userData; g.updateMatrixWorld(true);
      out[k] = { arms: U.arms.map(A => [A.S2 || A.S, A.E, A.T].map(v => v ? v.toArray() : null)), sd: U.arms.map(A => A.sd),
        legs: (U.legs || []).map(L => ({ th: Y.clone().applyQuaternion(L.thigh.quaternion).toArray(), sh: Y.clone().applyQuaternion(L.shin.quaternion).toArray(), foot: L.foot.getWorldPosition(V()).toArray() })),
        root: g.getWorldPosition(V()).toArray(), ry: g.rotation.y, neck: [U.neck.rotation.x, U.neck.rotation.y] }; } return out; }
  // pose only (no render) — for measuring joint deltas fast
  function poseOnly(t, B) { if (!T) T = beats(B); const on = []; T.shots.forEach(([a, b], i) => { if (t >= a && t < b) on.push(i); }); const s = on.length ? on[on.length - 1] : (t < T.n06 ? 4 : 5);
    if (s <= 2) poseHill(t); else if (s === 3) poseBeach(t); else if (s === 5) poseTown(t); else if (s === 6) poseStreet(t); return s; }
  return { film, draw, beats: () => T, sunAt: () => lastSun, joints, poseOnly, PS, dbg: { SC, SCP, scroll, LAND, V0, VW, K0, KH, KS, boatP } };
}

// ---------------------------------------------------------------- the sky (kit.js sky(), copied; + a cloud cover, a gap, a far point)
function skyDome(film, o = {}) {
  const c = Object.assign({ top: col('#05070d', .2), mid: col('#101826', .25), horizon: col('#202838', .35), sunDir: V(0, -1, 0), sunColor: col('#fff1d0', 20), sunGlow: col('#ffcf8a', 1.2), clouds: 0, cloudColor: col('#ffffff', 1), cloudShade: col('#a0a8c0', .6), radius: 1800 }, o);
  const u = { ...film.fogU, top: { value: c.top }, mid: { value: c.mid }, horizon: { value: c.horizon }, sunDir: { value: c.sunDir.clone().normalize() }, sunColor: { value: c.sunColor }, sunGlow: { value: c.sunGlow },
    clouds: { value: c.clouds }, cloudColor: { value: c.cloudColor }, cloudShade: { value: c.cloudShade }, time: { value: 0 }, skyFogMax: { value: film.atmos.max },
    cover: { value: 0 }, pointDir: { value: V(0, 1, 0) }, pointK: { value: 0 }, gapK: { value: 0 }, sunHide: { value: 0 }, domeK: { value: 1 } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 0.)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.)).xyz, 1.); gl_Position = p.xyww; }`,
    fragmentShader: `varying vec3 vD; uniform vec3 top, mid, horizon, sunDir, sunColor, sunGlow, cloudColor, cloudShade, pointDir; uniform float clouds, time, skyFogMax, cover, pointK, gapK, sunHide, domeK;
      ${GLSL.hash}
      ${FOG_GLSL}
      void main(){ vec3 d = normalize(vD); float y = d.y;
        vec3 c = mix(horizon, mid, smoothstep(-.02, .22, y)); c = mix(c, top, smoothstep(.2, .9, y));
        c = mix(c, mix(cloudShade, cloudColor, .45) * .9, cover * .55 * smoothstep(0., .3, y));   // overcast: the blue goes out of the sky
        float s = max(dot(d, sunDir), 0.); c += (sunGlow * (pow(s, 8.) * .45 + pow(s, 30.) * .45 + pow(s, 400.) * 1.1) * (1. - cover * .7) * (1. - sunHide) + sunColor * smoothstep(.9999, .99995, s) * (1. - smoothstep(.2, .6, cover)) * (1. - sunHide));
        if (y > 0.){ vec2 p = d.xz / (y + .12) * (1.6 + cover * 1.2) + vec2(time * .02, time * .007);
          float n = fbm(p * 1.3) * .7 + fbm(p * 3.7) * .3; float cv = clouds + cover;
          float m = smoothstep(.58 - min(cv, .62) * .3, .82 - min(cv, .62) * .22, n) * smoothstep(0., .2, y + cover * .12);
          float gap = smoothstep(.93, .985, dot(d, pointDir)); m *= 1. - gap * gapK;
          vec3 cc = mix(cloudShade * (.75 + .25 * n), cloudColor, smoothstep(.45, .8, n + (fbm(p * 7.3) - .5) * .18)); cc += sunGlow * pow(s, 6.) * .6 * (1. - cover * .6);
          cc *= 1. - cover * .25; cc += vec3(1., .85, .6) * gap * gapK * .35 * smoothstep(.5, .8, n);
          c = mix(c, cc, m * (.85 + cover * .15) * domeK); }
        float pd = max(dot(d, pointDir), 0.); c += pointK * (vec3(1., .95, .84) * smoothstep(.999955, .99999, pd) * 30. + vec3(1., .86, .62) * pow(pd, 2500.) * 2.4 + vec3(1., .8, .55) * pow(pd, 120.) * .3);
        float T = fogT(cameraPosition, d, skyFogMax); c = c * T + fogCol(d) * (1. - T);
        gl_FragColor = vec4(c, 0.); }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(c.radius, 48, 24), m); mesh.frustumCulled = false; mesh.renderOrder = -10;
  film.onFrame((t, f) => { mesh.position.setFromMatrixPosition(f.camera.matrixWorld); u.time.value = t; });
  mesh.onBeforeRender = (r, s, cam) => { mesh.position.setFromMatrixPosition(cam.matrixWorld); mesh.updateMatrixWorld(); };
  film.scene.add(mesh); return { mesh, u };
}
