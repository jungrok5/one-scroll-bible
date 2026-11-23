// lake-peter3d-b.js — 「kingdom」 10차 B안 (rounds/r10-pilot/lake-b.md), a copy of lake-peter3d.js for side-by-side comparison. Only a2/b2, the new tA/hB
// (the rope parts / holds) and a5 are redrawn, with light and silhouette; uwA/uwB stay the current version's net filling (owner, after comparing a vortex), as do the other shots.
// lake-peter3d.js — 「kingdom」 10차: one lake, two mornings. Part 1 (film 50.8–117.6, the first call, Luke 5) and part 7 (803.0–896.0, the
// return, John 21) drawn from ONE world with the SAME camera setups for the matching shots, so block B feels like "the same morning
// again" and then shows what is different (the net holds; the man who fell at his knees now runs through the water; a small fire).
// World: the approved Galilee of galilee3d.js — its land functions are imported (hgt, inland, shoreAt: the same lake, the same hills);
// its sky dome, colour journey (deep blue before dawn → gold), water, mist, ground shader and god rays are copied here with a source note.
// Skills read first (rules.json skills-first; nothing edited at the source):
//   cinematic-3d (lib3d/cine.js + kit.js: fog, bloom, DOF, planar mirror) · cinecode/references/camera-moves.md (the named moves below) ·
//   canvas-film/references/BODY-CHECK.md (people3d.js two-bone IK, planted feet, elbows down/out) · STYLE-INDEX #90 for the underwater look.
// Film refs: 「아웃 오브 아프리카」(1985, OPUSCAR 58) the lake at dawn (as galilee3d.js) · 「셰이프 오브 워터」(2017, OPUSCAR 90) teal water, moving
//   caustics, light shafts from above, real depth.
// Shots (every time from beats(B), B = script.json line times):
//   A  a1 N101–N103  dolly in on a small boat in the blue before dawn; a man hauls at the far side (back view, indigo head cloth)
//      a2 N103–N104  low at the water: the net rises out of the lake with nothing in it, only water falling (slow push + tilt)
//      a3 N104–N105  a seated man's back in the boat (Jesus), the crowd on the beach, his arm goes out to the deep (slow arc)
//      uwA N105–N106 under the hull: silver fish pour into the net, teal caustics, shafts; the mesh tears (slow arc)
//      a5 N106–Q102  from the stern against the sunrise: fish leaping, Peter falls to his knees, bows; the sun spreads on the water (dolly in)
//      a7 Q102–N108  behind Peter, low: he lifts his head; the people on the shore beyond, in the morning light (slow truck)
//      a8 N108–C10   the beach: boats drawn up, the torn net on the sand, small figures walking away up the road (crane up)
//   B  b1 N160–N161  night: the same boat, the same dolly · b2 N161–N162 the same empty net, the same angle
//      b3 N162–N163  from the boat toward the far shore in mist: one small figure, a speck of fire beside him (slow zoom)
//      uwB N163–N164 the same underwater shot: the net strains and HOLDS; then it is dragged toward shore, the lake bed rising
//      b5 N164–L106  from the beach: he wraps his cloak, jumps, wades in, spray in the first light (dolly in)
//      b6 L106–N166  the charcoal fire, fish and bread on it, slow push; on N165 a match on the flame to the black-and-white night courtyard, and back
//      b7 N166–N168  low and wide: two seated silhouettes either side of the fire, Jesus' back to us; the dawn grows; Q120 the sun clears the hills
//      b8 N168–C5    wide: two small figures side by side on the shore, looking toward the road; hold, ease out.
// Rules kept: Jesus never by face (back view, far, or against the light; no halo; same clothes as other men); no long hair; no blood;
// no words in the art; no close-up hands or faces; no per-frame dither (film.frame fixed); everything is a pure function of t.
// API: const L = await (await import('./lake-peter3d.js')).build(W, H); T = beats(B); L.draw(ctx, t, T);  L.probe(t, T) · L.joints(t, T) for the checks.
import { Film, THREE, V, col, rng, GLSL, FOG_GLSL } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';
import { CX, CZ, RX, RZ, inland, shoreAt, hgt as hgt0 } from './galilee3d.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
// galilee3d.js land, with its 1 m step at the waterline eased into a wet slope (seen close here, the step drew a staircase along the shore)
const hgt = (x, z) => { const m = inland(x, z); if (m < -5.5 || m > 4.5) return hgt0(x, z); const mw = m + 1.25 * Math.sin(x * .31 + z * .17) + .62 * Math.sin(x * .83 - z * .41 + 1.2), a = -.75 + m * .05, b = m > 0 ? hgt0(x, z) : .3 + m * .016; return lerp(a, b, ss(-3.5, 2.5, mw)); };
const D2R = Math.PI / 180;
const hsh = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- the place: a beach on the west shore, the lake and the sun to the east
const TH0 = 94, ORI = shoreAt(TH0), OUTW = ORI.clone().sub(V(CX, 0, CZ)).setY(0).normalize(), EAST = OUTW.clone().negate(), RIGHT = V(-EAST.z, 0, EAST.x);
const Lc = (u, v, y = 0) => ORI.clone().addScaledVector(RIGHT, u).addScaledVector(EAST, v).setY(y);   // u: right when looking at the sun; v: out over the lake
const gy = (u, v) => { const p = Lc(u, v); return hgt(p.x, p.z); };
const yawTo = d => Math.atan2(-d.x, -d.z);   // a figure faces −z: the root yaw that makes him face world direction d
const DEEP = 120;

export function beats(B) {
  const T = { ...B }, D = .45, DS = .14;
  const A = B.N101 != null ? [['a1', B.N101, B.N103], ['a2', B.N103, B.N104], ['a3', B.N104, B.N105], ['uwA', B.N105, B.N105 + 2.85], ['tA', B.N105 + 2.85, B.N106], ['a5', B.N106, B.Q102], ['a7', B.Q102, B.N108], ['a8', B.N108, B.C10]] : null;
  const C = B.N160 != null ? [['b1', B.N160, B.N161], ['b2', B.N161, B.N162], ['b3', B.N162, B.N163], ['uwB', B.N163, B.N163b], ['hB', B.N163b, B.N164], ['b5', B.N164, B.L106], ['b6', B.L106, B.N166], ['b7', B.N166, B.N168], ['b8', B.N168, B.C5]] : null;
  const L = A || C;
  const dd = i => (L[i][0] === 'tA' || L[i][0] === 'hB') ? DS : D;   // into the surface shot: almost a cut, on the strain
  T.shots = L.map(([n, a, b], i) => [n, i ? a - dd(i) : a, i < L.length - 1 ? b + dd(i + 1) : b, a, b]);
  if (A) { T.tA0 = B.N105 + 2.85; T.tS = T.tA0 + .62; }   // the rope parts
  T.kind = A ? 'A' : 'B';
  if (B.N165b != null) { T.f0 = B.N165b + .1; T.f1 = T.f0 + 2.7; }   // the flash of the courtyard fire (about 2 s at full)
  return T;
}

export async function build(W, H) {
  const vert = H > W, FOV = vert ? 46 : 32;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .25, far: 7000,
    atmos: { density: .00085, falloff: .014, base: 0, start: 6, color: col('#dcae80', .7), colorUp: col('#aab0b6', .58), max: 5000, scatter: 1, anisotropy: .8, phaseMix: .85 },
    bloom: { strength: .07, radius: 1.1, tint: col('#ffe2b8') },
    dof: { focus: 30, aperture: .6, maxCoc: 16 },
    look: { exposure: 1.0, contrast: 1.06, saturation: 1.02, lift: col('#0a0908'), shadowTint: col('#d6d2e6'), highTint: col('#fff0d8'), vignette: .3, grain: .022, ca: .3 },
  });
  film.canvas.style.display = 'none';
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither: no per-frame shimmer
  const S = film.scene, cam = film.camera;
  const mirU = film.mirror({ y: 0, res: .5, streak: 1.2, atmos: true });
  const hashGLSL = GLSL.hash;
  const G = {};   // what each shot shows
  const grp = n => { const g = new THREE.Group(); S.add(g); G[n] = g; return g; };
  for (const n of ['land', 'boat', 'boat2', 'crowd', 'walkers', 'drawn', 'shore', 'fire', 'cy', 'uw']) grp(n);

  // ---------------------------------------------------------------- light (copied from galilee3d.js: one sun, the colour journey)
  const sunDir = e => { const a = e * D2R, d = EAST.clone().addScaledVector(RIGHT, .05).normalize().multiplyScalar(Math.cos(a)); d.y = Math.sin(a); return d; };
  const SUN = sunDir(9);
  const sky = skyDome(film, { top: col('#56739f', .62), mid: col('#d4b291', 1), horizon: col('#ffd39a', 1.75), sunDir: SUN, sunColor: col('#fff1d4', 11), sunGlow: col('#ffc583', 1.7), clouds: .22, cloudColor: col('#ffe2c0', 1.15), cloudShade: col('#b49284', .72) });
  const SK = sky.u;
  const hemi = new THREE.HemisphereLight(col('#a8b6cc'), col('#7a5e40'), .62); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffd7a2'), 3.1); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048);
  Object.assign(sunL.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 900 }); sunL.shadow.bias = -.0004; sunL.shadow.normalBias = .05; S.add(sunL, sunL.target);
  const sunLamp = film.lamp(V(0, 200, -2000), '#ffcf96', { power: 900, size: 6, fog: 1 });
  const PAL = [
    { k: 0, top: ['#16223c', .55], mid: ['#34466a', .62], hor: ['#c88a68', .95], fog: ['#4c5c7a', .5], fogUp: ['#3c4c6c', .45], hs: ['#5a6a94', .5], hg: ['#262830', 1], hi: .5, sun: ['#ff9a60', 1.6], sunC: ['#ffb070', 7], glow: ['#ff9050', 1.2], cl: ['#ffc8a0', .7], cs: ['#4a5068', .55], dens: .00105, sat: .92, sh: ['#b8c4ff', 1], ht: ['#ffe2c0', 1] },
    { k: .45, top: ['#3e5e92', .62], mid: ['#cf9e74', .95], hor: ['#ffbf80', 1.7], fog: ['#b88c6c', .58], fogUp: ['#8890a4', .52], hs: ['#97a4c4', .58], hg: ['#5a4632', 1], hi: .58, sun: ['#ffc888', 3.0], sunC: ['#fff0d0', 11], glow: ['#ffb070', 1.7], cl: ['#ffd8b0', 1.1], cs: ['#9a7c78', .7], dens: .0008, sat: 1.0, sh: ['#c8cce8', 1], ht: ['#fff0d8', 1] },
    { k: 1, top: ['#5c86bc', .72], mid: ['#e0c4a0', 1.0], hor: ['#fff0d6', 1.55], fog: ['#d8c4a8', .55], fogUp: ['#a6b4c6', .55], hs: ['#b4c4dc', .66], hg: ['#6a5a40', 1], hi: .66, sun: ['#fff0d8', 3.4], sunC: ['#fffaf0', 12], glow: ['#ffd8a0', 1.5], cl: ['#fff4e4', 1.2], cs: ['#a89c98', .75], dens: .00055, sat: 1.06, sh: ['#d0d4e4', 1], ht: ['#fff4e0', 1] }];
  const _ca = new THREE.Color(), _cb = new THREE.Color();
  const pcol = (out, a, b, f) => out.copy(_ca.set(a[0]).multiplyScalar(a[1])).lerp(_cb.set(b[0]).multiplyScalar(b[1]), f);
  const mistU = { uT: { value: 0 }, uSunV: { value: SUN.clone() }, uK: { value: 1 }, uCol: { value: col('#8090a8', .7) } };
  function palette(k) {
    k = clamp(k); const i = k < PAL[1].k ? 0 : 1, A = PAL[i], B2 = PAL[i + 1], f = ss(0, 1, (k - A.k) / (B2.k - A.k)), L2 = film.look, a = film.atmos;
    pcol(SK.top.value, A.top, B2.top, f); pcol(SK.mid.value, A.mid, B2.mid, f); pcol(SK.horizon.value, A.hor, B2.hor, f); pcol(SK.sunColor.value, A.sunC, B2.sunC, f); pcol(SK.sunGlow.value, A.glow, B2.glow, f);
    pcol(SK.cloudColor.value, A.cl, B2.cl, f); pcol(SK.cloudShade.value, A.cs, B2.cs, f);
    pcol(a.color, A.fog, B2.fog, f); pcol(a.colorUp, A.fogUp, B2.fogUp, f); a.density = lerp(A.dens, B2.dens, f); a.falloff = .014; a.base = 0; a.start = 6; a.max = 5000; a.scatter = 1; a.anisotropy = .8; a.phaseMix = .85;
    pcol(hemi.color, A.hs, B2.hs, f); pcol(hemi.groundColor, A.hg, B2.hg, f); hemi.intensity = lerp(A.hi, B2.hi, f);
    pcol(sunL.color, A.sun, B2.sun, f); sunL.intensity = lerp(A.sun[1], B2.sun[1], f); sunL.color.multiplyScalar(1 / Math.max(.01, sunL.intensity));
    L2.saturation = lerp(A.sat, B2.sat, f); pcol(L2.shadowTint, A.sh, B2.sh, f); pcol(L2.highTint, A.ht, B2.ht, f); L2.contrast = 1.06; L2.vignette = .3; L2.exposure = 1;
    mistU.uCol.value.copy(a.color).multiplyScalar(1.5);
  }
  let shadowKey = '';
  function shadowAt(c, half, e = 9) { const k = c.x.toFixed(1) + c.z.toFixed(1) + half + ':' + e; if (k === shadowKey) return; shadowKey = k;
    sunL.target.position.copy(c); sunL.position.copy(c).addScaledVector(sunDir(e), 400); const sc = sunL.shadow.camera; Object.assign(sc, { left: -half, right: half, top: half, bottom: -half }); sc.updateProjectionMatrix(); sunL.target.updateMatrixWorld(); }
  const RU = { uSunV: { value: V(0, 0, -1) }, uRimC: { value: col('#ffa868', 1.15) } };
  const rimify = (m, key, s = 1) => { m.onBeforeCompile = sh => { Object.assign(sh.uniforms, RU); sh.uniforms.uRimS = { value: s };
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunV, uRimC; uniform float uRimS;').replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        { vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 3.2); totalEmissiveRadiance += uRimC * fr * smoothstep(-.2, .55, dot(normal, uSunV)) * uRimS; }`); };
    m.customProgramCacheKey = () => 'lp-rim-' + key; return m; };

  // ---------------------------------------------------------------- materials
  const groundM = new THREE.MeshStandardMaterial({ color: '#7a7a48', roughness: 1 });   // galilee3d.js ground shader (light field removed)
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
  groundM.customProgramCacheKey = () => 'lp-ground';
  const M = { wall: K.std('#d8c4a2', { roughness: .92 }), roof: K.std('#c0ac8a', { roughness: .95 }), trunk: K.std('#4a3c2c', { roughness: .95 }), wood: K.std('#5a4028', { roughness: .85 }), rock: K.std('#5a544c', { roughness: .95 }), stone: K.std('#3a352e', { roughness: .95 }), dark: K.std('#1c140e', { roughness: 1 }) };
  const plankT = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d'), r = rng(44); g.fillStyle = '#463424'; g.fillRect(0, 0, 64, 256);
    for (let i = 0; i < 12; i++) { const y = i * 256 / 12, v = 56 + r() * 26; g.fillStyle = `rgb(${v * 1.15 | 0},${v * .88 | 0},${v * .62 | 0})`; g.fillRect(0, y, 64, 256 / 12 - 2); g.fillStyle = 'rgba(14,9,6,.8)'; g.fillRect(0, y + 256 / 12 - 2, 64, 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
  M.hull = K.std('#6e5238', { roughness: .8, side: THREE.DoubleSide, map: plankT });

  // ---------------------------------------------------------------- the land: ONE mesh, world-fixed grid, fine where the beach is
  function axis(lo, hi, spans, cmin = 1.0, cmax = 56, grow = .08) { const xs = [lo]; let x = lo;
    while (x < hi) { let c = cmax; for (const [a, b] of spans) { const d = x < a ? a - x : x > b ? x - b : 0; c = Math.min(c, cmin + d * grow); } x = Math.min(hi, x + c); xs.push(x); } return xs; }
  { const XS = axis(-3600, 3600, [[ORI.x - 90, ORI.x + 90]]), ZS = axis(-6500, 2600, [[ORI.z - 70, ORI.z + 60]]), nx = XS.length, nz = ZS.length, pos = new Float32Array(nx * nz * 3), nor = new Float32Array(nx * nz * 3);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = XS[i], z = ZS[j], k = (j * nx + i) * 3; pos[k] = x; pos[k + 1] = hgt(x, z); pos[k + 2] = z;
      const e = Math.max(.6, Math.min(XS[Math.min(nx - 1, i + 1)] - XS[Math.max(0, i - 1)], ZS[Math.min(nz - 1, j + 1)] - ZS[Math.max(0, j - 1)]) * .5), gx = (hgt(x + e, z) - hgt(x - e, z)) / (2 * e), gz = (hgt(x, z + e) - hgt(x, z - e)) / (2 * e), l = Math.hypot(gx, 1, gz);
      nor[k] = -gx / l; nor[k + 1] = 1 / l; nor[k + 2] = -gz / l; }
    const idx = new Uint32Array((nx - 1) * (nz - 1) * 6); let o = 0; for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx[o++] = a; idx[o++] = c; idx[o++] = b; idx[o++] = b; idx[o++] = c; idx[o++] = d; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeBoundingSphere();
    const land = new THREE.Mesh(g, groundM); land.receiveShadow = true; land.frustumCulled = false; land.layers.set(1); G.land.add(land); }

  // ---------------------------------------------------------------- the lake (galilee3d.js water: the engine's mirror, small waves)
  const waterU = { uT: { value: 0 }, uRefl: { value: 1 }, uSpec: { value: 1 }, uDist: { value: 1 } };
  const waterM = new THREE.MeshStandardMaterial({ color: '#2c3c42', roughness: .22, metalness: 0 });
  waterM.onBeforeCompile = sh => { Object.assign(sh.uniforms, mirU, waterU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWW;').replace('#include <project_vertex>', '#include <project_vertex>\nvWW = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vWW; uniform sampler2D tMirror, tMirrorBlur; uniform mat4 mirrorMatrix; uniform float uT, uRefl, uSpec, uDist; vec2 wG;
        ${hashGLSL}
        vec2 waveG(vec2 p, float t, float det){ vec2 g = vec2(0.);
          vec4 W[5]; W[0] = vec4(normalize(vec2(1., .3)), .09, .55); W[1] = vec4(normalize(vec2(.6, -1.)), .13, .8); W[2] = vec4(normalize(vec2(-1., .45)), .21, 1.1); W[3] = vec4(normalize(vec2(.2, 1.)), .37, 1.6); W[4] = vec4(normalize(vec2(-.7, -.6)), .6, 2.2);
          vec2 wp = p + vec2(vnoise(p * .05), vnoise(p * .05 + 3.)) * 14.;
          for (int i = 0; i < 5; i++){ float k = W[i].z * 6.2831, a = (i > 1 ? det : .35 + .65 * det) * .022 / W[i].z; float ph = dot(W[i].xy, wp) * k - t * W[i].w * 1.3 + float(i) * 1.7;
            g += W[i].xy * cos(ph) * a * k * .16 * (.55 + .9 * vnoise(p * .03 + float(i) * 5.)); }
          g += (vec2(vnoise(p * .9 + t * .2), vnoise(p * .9 + 7. - t * .17)) - .5) * .06 * det;
          g += (vec2(vnoise(p * .012 + t * .01), vnoise(p * .012 + 9. - t * .01)) - .5) * .05;
          return g; }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { float dist = length(vWW - cameraPosition); float det = 1. - smoothstep(60., 600., dist); wG = waveG(vWW.xz, uT, det);
          vec3 nW = normalize(vec3(-wG.x, 1., -wG.y)); normal = normalize((viewMatrix * vec4(nW, 0.)).xyz); }`)
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        reflectedLight.directSpecular *= .35 * uSpec; totalEmissiveRadiance += vec3(1., .78, .52) * .13;`)
      .replace('#include <opaque_fragment>', `
        { vec4 mp = mirrorMatrix * vec4(vWW, 1.); vec2 muv = mp.xy / mp.w; float dist = length(vWW - cameraPosition);
          vec2 dd = wG * vec2(.35, 1.) * .55 * uDist / (1. + dist * .012);
          vec3 sharpR = texture2D(tMirror, muv + dd).rgb, blurR = texture2D(tMirrorBlur, muv + dd * 1.6).rgb;
          vec3 Vd = normalize(cameraPosition - vWW); float cosT = clamp(dot(Vd, normalize(vec3(-wG.x, 1., -wG.y))), 0., 1.);
          float fres = .02 + .98 * pow(1. - cosT, 5.);
          vec3 R = mix(sharpR, blurR, .45);
          outgoingLight = outgoingLight * (1. - fres * .85 * uRefl) + R * mix(.12, 1., fres) * vec3(.96, .97, 1.) * uRefl; }
        #include <opaque_fragment>`); };
  waterM.customProgramCacheKey = () => 'lp-water';
  const waterMesh = (() => { const wg = new THREE.PlaneGeometry(3400, 2300, 1, 1); wg.rotateX(-Math.PI / 2); const w = new THREE.Mesh(wg, waterM); w.position.set(CX, 0, CZ); w.layers.set(1); S.add(w); return w; })();

  // ---------------------------------------------------------------- far villages, olive trees, stones (trimmed from galilee3d.js)
  { const houseG = K.roundedBox(1, 1, 1, .035, 1); houseG.translate(0, .5, 0); const W4 = [], WC = [], R4 = [], RC = [], r = rng(11);
    const box = (x, z, y0, ry, lx, ly, lz, c, list, cl) => { list.push(new THREE.Matrix4().compose(V(x, y0, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(lx, ly, lz))); cl.push(c); };
    for (const [th, n] of [[84, 16], [108, 12], [118, 8], [140, 8], [176, 14], [196, 9], [214, 9], [232, 8], [250, 9], [281, 7], [305, 8], [330, 7], [60, 10], [36, 8], [8, 9]]) { const s = shoreAt(th), out = s.clone().sub(V(CX, 0, CZ)).setY(0).normalize(), al = V(-out.z, 0, out.x);
      for (let i = 0; i < n; i++) { const a = (r() - .5) * 150, b = 22 + Math.pow(r(), .8) * 80, x = s.x + al.x * a + out.x * b, z = s.z + al.z * a + out.z * b; if (inland(x, z) < 12) continue; const ry = Math.atan2(al.x, al.z) + (r() - .5) * .4, lx = 5 + r() * 5, lz = 5 + r() * 4, h = 2.6 + r() * 1.2, y0 = hgt(x, z) - .4;
        const c = r() < .45 ? new THREE.Color(.4, .39, .38) : new THREE.Color().setHSL(.09 + r() * .03, .12 + r() * .1, .8 + r() * .12);
        box(x, z, y0, ry, lx, h + .4, lz, c, W4, WC); box(x, z, y0 + h + .35, ry, lx + .2, .16, lz + .2, new THREE.Color().setHSL(.08, .14, .6 + r() * .12), R4, RC); } }
    for (const [L4, CC, m] of [[W4, WC, M.wall], [R4, RC, M.roof]]) { const im = new THREE.InstancedMesh(houseG, m, L4.length); L4.forEach((q, i) => { im.setMatrixAt(i, q); im.setColorAt(i, CC[i]); }); im.castShadow = im.receiveShadow = true; G.land.add(im); } }
  const leafTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = rng(9);
    for (let i = 0; i < 70; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 50, x = 64 + Math.cos(a) * d, y = 64 + Math.sin(a) * d * .8, L = 9 + r() * 7, an = r() * 6.283, v = 150 + r() * 70; g.fillStyle = `rgb(${v * .78 | 0},${v * .84 | 0},${v * .62 | 0})`; g.beginPath(); g.ellipse(x, y, L, L * .26, an, 0, 6.283); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const leafM = new THREE.MeshStandardMaterial({ color: '#7e8a66', map: leafTex, alphaTest: .45, alphaToCoverage: true, roughness: .9, side: THREE.DoubleSide }), leafItems = [];
  function olive(x, z, h, seed) { const y0 = hgt(x, z) - .15, tr = K.tree({ seed, height: h, trunk: .2 + h * .012, depth: 4, spread: .85, up: .12, twig: 0, mat: M.trunk }); tr.position.set(x, y0, z); tr.rotation.y = seed; G.land.add(tr);
    const r = rng(seed * 7 + 3), n = 70 + (h * 12 | 0); for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.pow(r(), .6) * h * .52, yy = y0 + h * (.5 + r() * .42) - rr * .3 + Math.sin(a * 3 + seed) * .3, s = .8 + r() * .7;
      leafItems.push(new THREE.Matrix4().compose(V(x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr * .9), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)), V(s, s * .75, 1))); } }
  { const r = rng(5150); for (let i = 0; i < 34; i++) { const u = -120 + r() * 300, v = -34 - r() * 110, p = Lc(u, v); if (inland(p.x, p.z) < 14) continue; olive(p.x, p.z, 4.2 + r() * 2.2, 900 + i * 17); }
    const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), leafM, leafItems.length); leafItems.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = im.receiveShadow = true; G.land.add(im);
    const gs = new THREE.IcosahedronGeometry(1, 1), mm = []; for (let i = 0; i < 150; i++) { const u = -46 + r() * 92, v = -26 + r() * 25, p = Lc(u, v), s = .06 + r() * r() * .3; if (inland(p.x, p.z) < 1 || (u > 3.5 && u < 12.5 && v < -8.4)) continue;   // (none in the lens's path to the fire)
      mm.push(new THREE.Matrix4().compose(V(p.x, hgt(p.x, p.z) - s * .25, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(r(), r() * 6, r())), V(s * (1 + r() * .5), s * .6, s))); }
    const st = new THREE.InstancedMesh(gs, M.rock, mm.length); mm.forEach((m, i) => st.setMatrixAt(i, m)); st.castShadow = st.receiveShadow = true; G.land.add(st); }
  { const blades = [], r = rng(77); for (let i = 0; i < 7; i++) { const a = r() * 6.283, h = .16 + r() * .22, g = new THREE.PlaneGeometry(.022, h, 1, 3); g.translate(0, h / 2, 0); const p = g.attributes.position; for (let k = 0; k < p.count; k++) { const u = p.getY(k) / h; p.setX(k, p.getX(k) * (1 - u * .85)); p.setZ(k, u * u * .09); } g.rotateY(a); g.translate(Math.cos(a) * .05, 0, Math.sin(a) * .05); blades.push(g); }
    const geo = K.mergeGeometries(blades.map(g => [g, new THREE.Matrix4()])), tm = new THREE.MeshStandardMaterial({ color: '#b2a868', roughness: .9, side: THREE.DoubleSide }), pts = [];
    for (let i = 0; i < 26000; i++) { const u = -70 + r() * 170, v = -62 + r() * 34, p = Lc(u, v); if (inland(p.x, p.z) < 30 + 5 * Math.sin(u * .13)) continue; pts.push([p.x, p.z]); }   // grass only above the road: the beach stays sand
    const inst = new THREE.InstancedMesh(geo, tm, pts.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(); pts.forEach(([x, z], i) => { q.setFromAxisAngle(V(0, 1, 0), r() * 6.283); m4.compose(V(x, hgt(x, z) + .01, z), q, V(1, .7 + r() * .7, 1)); inst.setMatrixAt(i, m4); c.setHSL(.15 + r() * .06, .3 + r() * .15, .42 + r() * .14); inst.setColorAt(i, c); }); inst.receiveShadow = true; inst.frustumCulled = false; G.land.add(inst); }

  // ---------------------------------------------------------------- mist (galilee3d.js)
  const mist = new THREE.Group(); S.add(mist);
  { const mm = new THREE.ShaderMaterial({ uniforms: { ...mistU }, transparent: true, depthWrite: false,
      vertexShader: `varying vec3 vP; varying vec2 vU; void main(){ vP = (modelMatrix * vec4(position, 1.)).xyz; vU = uv; gl_Position = projectionMatrix * viewMatrix * vec4(vP, 1.); }`,
      fragmentShader: `uniform float uT, uK; uniform vec3 uSunV, uCol; varying vec3 vP; varying vec2 vU; ${hashGLSL}
        void main(){ vec2 q = vP.xz * .022 + vec2(uT * .02, uT * .006); float n = fbm(q) * .7 + fbm(q * 3.1 - uT * .015) * .3;
          float e = smoothstep(0., .25, vU.x) * smoothstep(1., .75, vU.x) * smoothstep(0., .25, vU.y) * smoothstep(1., .75, vU.y);
          vec3 vd = normalize(vP - cameraPosition); float d = length(vP - cameraPosition), fwd = pow(max(dot(vd, uSunV), 0.), 5.);
          float a = smoothstep(.36, .74, n) * e * smoothstep(.8, 8., d) * (1. - smoothstep(900., 1800., d)) * .46 * uK;
          vec3 c = mix(uCol, uCol * vec3(1.35, 1.1, .85) + vec3(.5, .32, .14), .5) + vec3(1.3, .9, .55) * fwd * .7;
          gl_FragColor = vec4(c, a); }` });
    const r = rng(17), add = (c, w, d) => { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, mm); m.position.copy(c); m.rotation.y = r() * .6 - .3; m.renderOrder = 2; m.layers.set(2); mist.add(m); };
    for (let i = 0; i < 24; i++) { const c = V(CX + (r() - .5) * 1800, .8 + r() * 3, CZ + (r() - .5) * 1100); if (inland(c.x, c.z) > -30) continue; add(c, 260, 110); }
    for (let i = 0; i < 36; i++) { const c = Lc((r() - .5) * 90, i % 2 ? -2 + r() * 20 : 150 + r() * 60, .3 + r() * 1.5); if (inland(c.x, c.z) > -3) continue; add(c, 34 + r() * 30, 14 + r() * 12); } }

  // ---------------------------------------------------------------- the boat (a Galilee fishing boat: planked hull, thwarts, a floor above the waterline)
  const BL = 7.0, BW = 2.1, BD = .86, DECK = .15;
  const hullG = (() => { const nu = 40, nv = 14, pos = [], uv = [], idx = [];
    for (let j = 0; j <= nu; j++) { const s = j / nu * 2 - 1, tp = Math.sqrt(Math.max(.0006, 1 - Math.pow(Math.abs(s), 2.6))), sh = .34 * Math.pow(Math.abs(s), 2.4);
      for (let i = 0; i <= nv; i++) { const a = i / nv * Math.PI; pos.push(Math.cos(a) * BW / 2 * tp, -Math.sin(a) * BD * Math.pow(tp, .6) + BD * .55 + sh, s * BL / 2); uv.push(j / nu * 3, i / nv); } }
    for (let j = 0; j < nu; j++) for (let i = 0; i < nv; i++) { const a = j * (nv + 1) + i, b = a + 1, c = a + nv + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; })();
  const deckG = (() => { const nu = 24, pos = [], idx = []; for (let j = 0; j <= nu; j++) { const s = (j / nu * 2 - 1) * .86, tp = Math.sqrt(Math.max(.0006, 1 - Math.pow(Math.abs(s), 2.6))); pos.push(-BW / 2 * tp * .93, DECK, s * BL / 2, BW / 2 * tp * .93, DECK, s * BL / 2); }
    for (let j = 0; j < nu; j++) { const a = j * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; })();
  const railG = (() => { const segs = []; for (const sd of [-1, 1]) for (let j = 0; j < 40; j++) { const q = jj => { const s = jj / 40 * 2 - 1, tp = Math.sqrt(Math.max(.0006, 1 - Math.pow(Math.abs(s), 2.6))), sh = .34 * Math.pow(Math.abs(s), 2.4); return [sd * BW / 2 * tp, BD * .55 + sh, s * BL / 2]; }; segs.push(...q(j), ...q(j + 1), .04, .04); } return K.tubesGeometry(segs, 5); })();
  function makeBoat() { const g = new THREE.Group(), h = new THREE.Mesh(hullG, M.hull); h.castShadow = true; g.add(h);
    const dk = new THREE.Mesh(deckG, new THREE.MeshStandardMaterial({ color: '#3c2c1e', roughness: .95, side: THREE.DoubleSide })); dk.receiveShadow = true; g.add(dk);
    const rl = new THREE.Mesh(railG, M.wood); rl.castShadow = true; g.add(rl);
    for (const zz of [-1.7, .1, 1.9]) { const b = new THREE.Mesh(K.roundedBox(BW * .84, .06, .3, .02, 1), M.wood); b.position.set(0, .5, zz); b.castShadow = true; g.add(b); }
    return g; }
  const boat = makeBoat(); G.boat.add(boat);
  const boat2 = makeBoat(); G.boat2.add(boat2);
  const wakeU = { uT: { value: 0 } };
  function waterline(LL, Wd, seed = 0) { const m = new THREE.ShaderMaterial({ uniforms: { ...wakeU, uSeed: { value: seed }, uL: { value: LL }, uW: { value: Wd } }, transparent: true, depthWrite: false,
      vertexShader: `varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: `uniform float uT, uSeed, uL, uW; varying vec2 vP;
        void main(){ vec2 q = vP / vec2(uW * .5, uL * .5); float d = length(q), e = (d - 1.) * min(uW, uL) * .5;
          float band = exp(-pow(e / .16, 2.)) * .62 + exp(-pow((e + .05) / .06, 2.)) * .35;
          float rings = (.5 + .5 * sin(e * 11. - uT * 2.2 + uSeed)) * exp(-max(e, 0.) * 1.1) * smoothstep(-.02, .1, e) * .22;
          float foam = (.5 + .5 * sin(atan(q.y, q.x) * 9. + uT * 1.7 + uSeed)) * exp(-pow(e / .05, 2.)) * .18;
          if (d < .97) discard;
          gl_FragColor = vec4(mix(vec3(.05, .05, .06), vec3(.95, .85, .7), foam / max(band + rings + foam, .001)), clamp(band + rings * .6 + foam, 0., .75)); }` });
    const g = new THREE.PlaneGeometry(Wd * 3.2, LL * 1.8, 1, 1); g.rotateX(-Math.PI / 2); const w = new THREE.Mesh(g, m); w.renderOrder = 3; w.layers.set(2); w.frustumCulled = false; S.add(w); return w; }
  const wl1 = waterline(6.3, 1.95, 1.3), wl2 = waterline(6.3, 1.95, 3.1);

  // ---------------------------------------------------------------- people: one Peter, one Jesus, the same in every shot
  const tunicM = rimify(K.std('#a58f6f', { roughness: .95, side: THREE.DoubleSide }), 'pt', 1.2), clothM = rimify(K.std('#3b4f6b', { roughness: .95, side: THREE.DoubleSide }), 'pc', 1.1);
  const kingM = rimify(K.std('#c8b694', { roughness: .95, side: THREE.DoubleSide }), 'kg', 1.15), kingC = rimify(K.std('#8a7a66', { roughness: .95, side: THREE.DoubleSide }), 'kc', 1.15);
  const faceM = K.std('#2a1a10', { roughness: 1 }), hairM = K.std('#1c140e', { roughness: 1 });
  const legM = K.std('#5e4430', { roughness: .9 }), ropeM = K.std('#3a2e20', { roughness: 1 });
  // review r2: "hooded cones, nuns". The cloth is tied: a cap on the crown, a band round it, a fall that narrows at the neck and ends on the
  // shoulder, so the outline reads head → neck → broad shoulders → belt → loose robe. A beard for Peter only (Jesus never shows a profile).
  const tiedHead = (g, m, beard) => { const U = g.userData, s = U.s, n = U.neck; n.children.slice(1).forEach(o => n.remove(o));
    const mk = (geo, mt) => { const o = new THREE.Mesh(geo, mt); o.castShadow = o.receiveShadow = true; n.add(o); return o; };
    mk(new THREE.CylinderGeometry(.056 * s, .07 * s, .17 * s, 12), legM).position.set(0, -.005 * s, .012 * s);
    const cap = mk(new THREE.SphereGeometry(.124 * s, 20, 12, 0, 6.283, 0, Math.PI * .56), m); cap.position.set(0, .122 * s, .03 * s); cap.scale.set(.92, 1.04, 1.02);
    const bd = mk(new THREE.TorusGeometry(.116 * s, .014 * s, 6, 28), ropeM); bd.rotation.x = Math.PI / 2; bd.position.set(0, .158 * s, .03 * s); bd.scale.set(.93, 1.02, 1);
    mk(new THREE.LatheGeometry([[.116, .16], [.112, .11], [.097, .055], [.09, .01], [.104, -.04], [.132, -.088]].map(([r, y]) => new THREE.Vector2(r * s, y * s)), 20, Math.PI + .9, Math.PI * 2 - 1.8), m).position.z = .03 * s;
    if (beard) { const b = mk(new THREE.SphereGeometry(.066 * s, 12, 9), hairM); b.position.set(0, .052 * s, -.07 * s); b.scale.set(.92, 1.18, .78); U.beard = b; } };
  // the loose robe of robeMan, without the mantle's bell: drawn in at a rope belt, a little less flare at the hem; broader at the shoulder (as pastel-children.js)
  const dressMan = (g, { hem = 1, flare = .9 } = {}) => { const U = g.userData, s = U.s, B0 = U.skirtBase, top = .99 * s;
    for (let i = 0; i < B0.length; i += 3) { B0[i] *= flare; B0[i + 2] *= flare; B0[i + 1] = top - (top - B0[i + 1]) * hem; }
    U.skirt.geometry.attributes.position.array.set(B0); U.skirt.geometry.attributes.position.needsUpdate = true; U.skirt.geometry.computeVertexNormals();
    U.shoulders.children.forEach(o => { if (o.geometry && o.geometry.type === 'LatheGeometry') o.visible = false; });
    U.upper.children.forEach(o => { if (o.geometry && o.geometry.type === 'TorusGeometry') { if (o.geometry.parameters.arc < 6) o.visible = false; else { o.material = ropeM; o.scale.set(1.04, .82, 1.6); } } });
    U.arms.forEach(A => { A.S.x *= .97; A.fo.scale.set(.74, 1, .74); }); };
  const peter = () => { const g = P.robeMan({ h: 1.78, broad: 1.14, mat: tunicM, cloth: tunicM, face: faceM, head: 'cloth' }), U = g.userData; tiedHead(g, clothM, true); dressMan(g, { hem: .84, flare: .92 }); U.legs.forEach(L => { L.shin.material = legM; L.foot.material = legM; }); U.ph = .17; return g; };
  const jesus = () => { const g = P.robeMan({ h: 1.76, broad: 1.05, mat: kingM, cloth: kingC, face: faceM, head: 'cloth' }); tiedHead(g, kingC, false); dressMan(g, { hem: .98, flare: .9 }); g.userData.ph = .3; return g; };
  const robeCols = ['#5e4c38', '#4c4032', '#6a5642', '#403628', '#5a4834', '#504436', '#64523e', '#48392b'], mantleCols = ['#8a6a34', '#5e5a34', '#7a3626', '#a89a80', '#5a4030', '#4c4842', '#9a8458', '#6a4a2c', '#7c6a48', '#4c5262'];
  const robes = robeCols.map((c, i) => rimify(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'r' + i)), mantles = mantleCols.map((c, i) => rimify(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'm' + i));
  const HEADW = ['cloth', 'turban', 'bare', 'cloth', 'turban'];
  function person(r, { kind: k0, sit = false } = {}) { const u = r(), kind = k0 || (u < .13 ? 'child' : u < .4 ? 'woman' : 'man'), base = { mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0], face: faceM, kind: sit ? 'sit' : 'stand' };
    const o = kind === 'child' ? { h: 1.02 + r() * .3, child: true, head: r() < .5 ? 'cloth' : 'veil', broad: .9 } : kind === 'woman' ? { h: 1.5 + r() * .13, head: 'veil', broad: .82 + r() * .1 } : { h: 1.62 + r() * .2, head: 'cloth', broad: .92 + r() * .2 };
    const p = P.robeMan({ ...base, ...o }); if (kind === 'man') P.headwear(p, HEADW[(r() * HEADW.length) | 0], { mat: base.cloth, dark: hairM }); p.userData.ph = r(); p.userData.sit = sit; return p; }
  const PT = peter(), JS = jesus(), AN = person(rng(5), { kind: 'man', sit: true }); boat.add(PT, JS, AN);
  const PT2 = peter(), JS2 = jesus(); G.shore.add(PT2, JS2);
  const seatJ = P.rock(M.rock, { w: .72, d: .58, top: .4, seed: 3 }), seatP = P.rock(M.rock, { w: .76, d: .56, top: .4, seed: 7 }); G.shore.add(seatJ, seatP);
  const crew2 = [person(rng(6), { kind: 'man' }), person(rng(8), { kind: 'man', sit: true })]; boat2.add(...crew2); crew2[0].position.set(.3, DECK, -1); crew2[1].position.set(-.2, DECK, 1.2);
  const crowd = []; { const r = rng(616); for (let i = 0; i < 40; i++) { const u = -19 + r() * 50, v = -9 + Math.pow(r(), 1.4) * 8.2, p0 = Lc(u, v); if (crowd.some(q => q.position.distanceTo(p0.clone().setY(q.position.y)) < .95)) continue;
      const sit = r() < .4 && v < -3, p = person(r, { sit }); p.position.set(p0.x, gy(u, v), p0.z); p.rotation.y = yawTo(Lc(3, 10).sub(p0)) + (r() - .5) * .5; G.crowd.add(p); crowd.push(p); } }
  // the ones who follow (a8): five small figures on the road; he goes first
  const walkers = [jesus(), peter(), person(rng(21), { kind: 'man' }), person(rng(22), { kind: 'man' }), person(rng(23), { kind: 'man' })]; G.walkers.add(...walkers);

  // ---------------------------------------------------------------- the net coming up (a2/b2): review r2 "a flat orange pyramid"
  // A heavy wet curtain hauled over the gunwale: the float line comes up first and folds in over the rail, the mesh hangs below it in deep
  // uneven folds, the lead line last. The threads are dark; only where a fold turns to the light do they show.
  const netTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.clearRect(0, 0, 128, 128); g.strokeStyle = 'rgba(255,244,222,1)'; g.lineWidth = 2.4;
    for (let i = -128; i < 256; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); g.beginPath(); g.moveTo(i + 128, 0); g.lineTo(i, 128); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const netM = new THREE.MeshStandardMaterial({ color: '#b09c7c', map: netTex, alphaTest: .35, alphaToCoverage: true, side: THREE.DoubleSide, roughness: .9, emissive: col('#3a3026'), emissiveIntensity: .25 });   // (the torn net on the sand, a8)
  const curtU = { uLight: { value: V(0, .2, -1) }, uK: { value: 1 }, uCool: { value: 0 }, uOff: { value: 0 } };
  const curtM = new THREE.ShaderMaterial({ uniforms: curtU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vU; varying vec3 vW; void main(){ vU = uv; vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 uLight; uniform float uK, uCool, uOff; varying vec2 vU; varying vec3 vW;
      void main(){ float wv = 1. - vU.y; vec2 q0 = vec2(vU.x, vU.y - uOff), uv = (q0 + vec2(.012 * sin(q0.y * 23. + q0.x * 9.) + .006 * sin(q0.y * 61. - q0.x * 17.), .014 * sin(q0.x * 19. + q0.y * 7.) + .006 * sin(q0.x * 53. + q0.y * 13.))) * vec2(96., 66.), a = vec2(uv.x + uv.y, uv.x - uv.y), g = abs(fract(a) - .5), fw = fwidth(a); float l = min(g.x / max(fw.x, .001), g.y / max(fw.y, .001)), line = 1. - smoothstep(.42, 1.25, l); line = mix(line, .34, smoothstep(.24, .6, max(fw.x, fw.y)));
        vec3 N = normalize(cross(dFdx(vW), dFdy(vW))), Vd = normalize(cameraPosition - vW), H = normalize(uLight + Vd); float nh = abs(dot(N, H)), sp = pow(nh, 18.), wrap = abs(dot(N, uLight)), brk = .6 + .4 * sin(vW.y * 5. + vW.x * 2.3) * sin(vW.z * 4. + vW.y * 1.4), lit = clamp((pow(wrap, 4.) * .16 + sp * .3) * brk, 0., 1.);
        float rope = smoothstep(.017, .009, wv) + smoothstep(.015, .008, 1. - wv); vec3 c = mix(vec3(.02, .017, .014), mix(vec3(.66, .46, .3), vec3(.42, .5, .68), uCool) * uK, lit * (.3 + .7 * line)); c = mix(c, vec3(.016, .012, .009), clamp(rope, 0., 1.));
        gl_FragColor = vec4(c, clamp(max(line * (.16 + .62 * lit) + .5, rope), 0., 1.)); }` });
  const CW = 2.75, CH = 1.92, cnx = 56, cny = 44, RAIL = .52, curtG = new THREE.PlaneGeometry(CW, CH, cnx, cny), curtain = new THREE.Mesh(curtG, curtM); curtain.renderOrder = 5; curtain.frustumCulled = false; boat.add(curtain);
  const NCORK = 10, corks = new THREE.InstancedMesh(new THREE.SphereGeometry(.034, 10, 7), K.std('#33271b', { roughness: .8 }), NCORK); corks.frustumCulled = false; corks.castShadow = true; curtain.add(corks);
  const hoist = new THREE.Mesh(new THREE.CylinderGeometry(.011, .011, 1, 6), ropeM); boat.add(hoist);
  // a point of the net in its own frame: u across (−.5….5), w down from the float line (0) to the lead line (1); above the rail it bends in over it
  function curtPt(u, w, hh, t, sd, out) { const lift = ss(0, .42, hh), topY = lerp(-.02, RAIL + .17, lift) + (u - .5) * .6 * (1 - ss(0, .55, hh)) + .05 * Math.sin(u * 5 + 1.3) - .07 * (1 - 4 * u * u), hem = lerp(-1.15, .15, ss(.38, 1, hh)) + .05 * Math.sin(u * 7 + .6), y = lerp(topY, hem, Math.pow(w, .9)), off = (w - hh * .55);
    const pl = Math.sin(u * 11 + off * 2.4 + 1.6 * Math.sin(u * 4 + .7)) * .68 + Math.sin(u * 23 + off * 3.6 + 1.1) * .34, bunch = 1 + .9 * ss(.3, 1, hh), fold = (pl * .085 + Math.sin(u * 41 + w * 3.1 + 1.7) * .024 * w) * bunch * (.35 + .65 * Math.sin(Math.min(1, w * 1.15) * 1.57)), belly = .13 * Math.sin(w * 3.14) * (1 + .4 * hh);
    return out.set(u * CW * (1 - .04 * w) + .04 * pl * w + .014 * Math.sin(w * 5 + t * .6), y, sd * (belly + .02 - .2 * lift * Math.pow(1 - w, 3)) + fold + .03 * w * w * Math.sin(t * .7 + u * 4)); }
  const _cp = V(), _cm = new THREE.Matrix4();
  function setCurtain(hh, t, sd) { curtU.uOff.value = hh * 1.55; const p = curtG.attributes.position; for (let j = 0; j <= cny; j++) for (let i = 0; i <= cnx; i++) { curtPt(i / cnx - .5, j / cny, hh, t, sd, _cp); p.setXYZ(j * (cnx + 1) + i, _cp.x, _cp.y, _cp.z); } p.needsUpdate = true;
    for (let i = 0; i < NCORK; i++) { curtPt((i + .5 + (hsh(i, 51) - .5) * .7) / NCORK - .5, 0, hh, t, sd, _cp); { const q = .75 + hsh(i, 52) * .5; _cm.makeScale(q * 1.25, q * .62, q); } _cm.setPosition(_cp.x, _cp.y + .012, _cp.z); corks.setMatrixAt(i, _cm); } corks.instanceMatrix.needsUpdate = true; }
  // water falling from the net (pure in t) + rings where it lands
  const NDROP = 360, dropG = new THREE.BufferGeometry(), dropP = new Float32Array(NDROP * 3), dropA = new Float32Array(NDROP);
  dropG.setAttribute('position', new THREE.BufferAttribute(dropP, 3)); dropG.setAttribute('aK', new THREE.BufferAttribute(dropA, 1));
  const dotM = (size, c) => new THREE.ShaderMaterial({ uniforms: { uPx: { value: H / 1920 * size }, uC: { value: col(c, 1) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aK; varying float vK; uniform float uPx; void main(){ vK = aK; vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = clamp(uPx / -mv.z, 1.5, 26.) * (.6 + aK * .6); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vK; uniform vec3 uC; void main(){ if (vK <= .001) discard; vec2 q = gl_PointCoord - .5; float d = length(q); float a = smoothstep(.5, .08, d); gl_FragColor = vec4(uC * (1. + a * 1.4) * vK, a * vK); }` });
  const dropsMesh = new THREE.Points(dropG, dotM(32, '#ffe9c8')); dropsMesh.frustumCulled = false; boat.add(dropsMesh);
  const ringU = { uT: { value: 0 }, uK: { value: 0 } };
  const rings = (() => { const g = new THREE.PlaneGeometry(4.6, 3.2); g.rotateX(-Math.PI / 2); const m = new THREE.ShaderMaterial({ uniforms: ringU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: `uniform float uT, uK; varying vec2 vP; float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){ float c = 0.; vec2 p = vP * 2.4; for (int L = 0; L < 3; L++){ vec2 q = p + float(L) * 3.7, id = floor(q); for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++){ vec2 n = id + vec2(float(x), float(y)); float r = h(n + float(L)); vec2 ct = n + .5 + .4 * vec2(h(n + 3.), h(n + 7.)) - .2; float ph = fract(uT * (.7 + r * .6) + r * 5.), rr = ph * .55, d = length(q - ct);
            c += exp(-pow((d - rr) / .022, 2.)) * pow(1. - ph, 1.6) * step(.3, r); } }
          float e = smoothstep(2.3, 1.3, abs(vP.x)) * smoothstep(1.6, .8, abs(vP.y)); gl_FragColor = vec4(vec3(1., .9, .75) * c * .55 * uK * e, c * .4 * uK * e); }` });
    const w = new THREE.Mesh(g, m); w.renderOrder = 4; w.layers.set(2); w.frustumCulled = false; S.add(w); return w; })();

  // ---------------------------------------------------------------- fish
  // review r2: "porcelain". A narrow body, dark along the back; the flank is a mirror: as a fish rolls it turns the sun to the lens for a moment and goes dark again
  const fishGeo = (() => { const b = new THREE.SphereGeometry(1, 14, 9); b.scale(.014, .036, .118); const t = new THREE.ConeGeometry(.038, .06, 4); t.scale(.14, 1, 1); t.rotateX(-Math.PI / 2); t.translate(0, 0, .136); return K.mergeGeometries([[b.toNonIndexed(), new THREE.Matrix4()], [t.toNonIndexed(), new THREE.Matrix4()]]); })();
  const fishU = { uT: { value: 0 }, uLight: { value: V(.25, 1, .1).normalize() }, uAmb: { value: 1 }, uFlash: { value: 1 }, uTint: { value: col('#ffffff') } };
  const fishM = new THREE.ShaderMaterial({ uniforms: fishU,
    vertexShader: `uniform float uT; varying vec3 vN, vW, vSide, vUpW; varying float vH, vY; void main(){ vec3 q = position; float id = float(gl_InstanceID), ph = id * 2.399; q.x += sin(uT * 13. + ph + q.z * 18.) * max(q.z + .03, 0.) * .32; mat3 im = mat3(instanceMatrix), mm = mat3(modelMatrix); vec4 w = modelMatrix * instanceMatrix * vec4(q, 1.); vW = w.xyz; vN = normalize(mm * im * normal); vSide = normalize(mm * im[0]); vUpW = normalize(mm * im[1]); vH = fract(id * .61803); vY = position.y / .036; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 uLight, uTint; uniform float uAmb, uFlash, uT; varying vec3 vN, vW, vSide, vUpW; varying float vH, vY; void main(){ vec3 N = normalize(vN), Vd = normalize(cameraPosition - vW), H = normalize(uLight + Vd);
      float roll = .66 * sin(uT * (1.7 + vH * 2.6) + vH * 61.) + .26 * sin(uT * (3.7 + vH * 1.9) + vH * 17.); vec3 side = normalize(vSide * cos(roll) + vUpW * sin(roll)); float m = abs(dot(side, H)), flash = pow(m, 90.) * 5.2 + pow(m, 16.) * .09, backK = smoothstep(-.05, .62, vY);
      vec3 c = mix(vec3(.13, .2, .21), vec3(.008, .024, .032), backK) * uAmb * (.55 + .45 * max(dot(N, uLight), 0.)) + vec3(.95, 1., 1.) * flash * uFlash * (1. - backK * .9); gl_FragColor = vec4(c * uTint, 1.); }` });
  // leaping fish round the boat (a5): each on its own arc, silver in the low sun
  const NLEAP = 34, leap = new THREE.InstancedMesh(fishGeo, fishM, NLEAP); leap.frustumCulled = false; leap.castShadow = false; boat.add(leap);
  const pile = new THREE.InstancedMesh(fishGeo, fishM, 90); pile.frustumCulled = false; boat.add(pile);
  { const r = rng(91), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); for (let i = 0; i < 90; i++) { const z = -2.3 + r() * 3.7, x = (r() - .5) * 1.5 * Math.sqrt(1 - Math.pow(Math.abs(z / 3.1), 2)); e.set(Math.PI / 2 + (r() - .5) * .5, r() * 6.28, (r() - .5) * .6); q.setFromEuler(e); const s = .85 + r() * .5; m.compose(V(x, DECK + .05 + r() * .09, z), q, V(s, s, s)); pile.setMatrixAt(i, m); } }

  // ---------------------------------------------------------------- the beach: boats drawn up, the torn net on the sand (a8)
  { const b1 = makeBoat(), b2 = makeBoat(); G.drawn.add(b1, b2); const pa = Lc(-8.5, -5), pb = Lc(-2.6, -5.5);
    b1.position.set(pa.x, gy(-8.5, -5) + .42, pa.z); b1.rotation.set(.05, yawTo(EAST) + .55, .1, 'YXZ'); b2.position.set(pb.x, gy(-2.6, -5.5) + .42, pb.z); b2.rotation.set(.04, yawTo(EAST) - .32, -.08, 'YXZ');
    const ng = new THREE.PlaneGeometry(3.6, 2.5, 34, 22), p = ng.attributes.position; ng.rotateX(-Math.PI / 2); for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, .03 + .06 * Math.abs(Math.sin(x * 3.1 + z * 2)) + .05 * Math.sin(x * 7) * Math.cos(z * 6)); } ng.computeVertexNormals();
    const torn = netM.clone(); torn.alphaTest = .35; const tu = { uC: { value: new THREE.Vector2(.68, .52) } }; torn.onBeforeCompile = sh => { Object.assign(sh.uniforms, tu);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nuniform vec2 uC; float hn(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); } float vn2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hn(i), hn(i + vec2(1, 0)), f.x), mix(hn(i + vec2(0, 1)), hn(i + vec2(1, 1)), f.x), f.y); }`)
        .replace('#include <alphatest_fragment>', `{ vec2 d = (vMapUv / vec2(8.) - uC) * vec2(1., 1.6); float r = length(d) + (vn2(vMapUv * 5.) - .5) * .09; if (r < .17) discard; }\n#include <alphatest_fragment>`); }; torn.customProgramCacheKey = () => 'lp-torn';
    const netS = new THREE.Mesh(ng, torn), pn = Lc(-6, -7.9); netS.position.set(pn.x, gy(-6, -7.9), pn.z); netS.rotation.y = yawTo(EAST) + .3; netS.receiveShadow = true; G.drawn.add(netS);
    const cl = new THREE.Mesh(new THREE.TorusGeometry(.35, .02, 5, 26), M.wood); cl.rotation.x = Math.PI / 2; cl.position.set(pn.x + .9, gy(-6, -7.9) + .05, pn.z - .6); cl.scale.set(1.4, 1, 1); G.drawn.add(cl); }

  // ---------------------------------------------------------------- the charcoal fire (John 21:9): review r2 "a campsite prop"
  // A small low mound of charcoal in a bed of ash on the sand, a few rough stones half sunk beside it (no ring), fish lying on the coals, flat
  // loaves at the edge, one low flame. The coals glow from the cracks and the undersides; ash lies on what faces the sky.
  const FU = Lc(8, -7), FY = gy(8, -7), fireP = FU.clone().setY(FY + .12), fireU = { uT: { value: 0 }, uK: { value: 1 }, uBW: { value: 0 } };
  let fireFood = null;
  const roughRock = (seed, detail = 2) => { const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + .22 * Math.sin(x * 3.1 + seed) * Math.cos(z * 2.7 + seed * 1.3) + .12 * Math.sin(y * 6.3 + seed * 2) + .07 * Math.sin(x * 11 + z * 9 + seed); p.setXYZ(i, x * n, y * n, z * n); } g.computeVertexNormals(); return g; };
  { const r = rng(141);
    for (const [a, R0, sz, sd] of [[.42, .66, .125, 3], [1.75, .63, .085, 5], [2.62, .7, .145, 7], [4.0, .64, .09, 9], [5.35, .69, .115, 11]]) { const q = new THREE.Mesh(roughRock(sd), M.stone), x = fireP.x + Math.cos(a) * R0, z = fireP.z + Math.sin(a) * R0; q.position.set(x, hgt(x, z) + sz * .06, z); q.scale.set(sz * 1.3, sz * .66, sz); q.rotation.y = a * 2.3; q.castShadow = q.receiveShadow = true; G.fire.add(q); }
    // the ash on the sand: follows the ground, feathered at its edge, red toward the coals
    const ashG = new THREE.RingGeometry(.001, .66, 44, 12); ashG.rotateX(-Math.PI / 2); { const p = ashG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + fireP.x, z = p.getZ(i) + fireP.z; p.setY(i, hgt(x, z) - FY + .012); } }
    const ashM = new THREE.ShaderMaterial({ uniforms: fireU, transparent: true, depthWrite: false, vertexShader: `varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: `uniform float uK; varying vec2 vP; ${hashGLSL} void main(){ float r = length(vP), n = fbm(vP * 13.), m = fbm(vP * 41. + 3.), a = (1. - smoothstep(.26 + n * .2, .62, r)) * (.5 + .5 * smoothstep(.3, .62, n + m * .3)); vec3 c = mix(vec3(.2, .16, .12), vec3(.05, .036, .026), smoothstep(.42, .66, m)) + vec3(.8, .2, .04) * (1. - smoothstep(.2, .4, r)) * smoothstep(.45, .7, n) * uK; gl_FragColor = vec4(c, a); }` });
    const ash = new THREE.Mesh(ashG, ashM); ash.position.set(fireP.x, FY, fireP.z); ash.renderOrder = 1; G.fire.add(ash);
    const charM = new THREE.ShaderMaterial({ uniforms: fireU, vertexShader: `varying vec3 vW, vN; varying float vH; void main(){ float id = float(gl_InstanceID); vH = fract(id * .61803); vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uT, uK; varying vec3 vW, vN; varying float vH; ${hashGLSL} void main(){ vec3 N = normalize(vN); float n = fbm(vW.xz * 44. + vW.y * 27.), c2 = fbm(vW.xz * 61. + 11.), crack = smoothstep(.57, .72, n), under = smoothstep(.3, -.5, N.y), br = .62 + .38 * sin(uT * (.7 + vH * .9) + vH * 30.), hotK = smoothstep(.42, .66, fbm(vW.xz * 8.5 + 4.)), hot = (crack * .72 + under * .05) * hotK * br * (.45 + .55 * vH);
        vec3 c = vec3(.011, .009, .008) + vec3(.07, .058, .048) * smoothstep(.54, .76, c2) * max(N.y, 0.) + vec3(1.9, .46, .07) * hot + vec3(2.2, 1.05, .24) * hot * hot * hot; gl_FragColor = vec4(c * mix(.55, 1., uK), 1.); }` });
    { const bed = new THREE.Mesh(new THREE.SphereGeometry(.39, 28, 10, 0, 6.283, 0, 1.57), charM.clone()); bed.material.uniforms = fireU; bed.scale.set(1, .22, 1); bed.position.set(fireP.x, FY + .004, fireP.z); G.fire.add(bed); bed.material.vertexShader = bed.material.vertexShader.replace('float id = float(gl_InstanceID);', 'float id = 7.;').replace('modelMatrix * instanceMatrix * vec4', 'modelMatrix * vec4').replace('mat3(modelMatrix) * mat3(instanceMatrix) * normal', 'mat3(modelMatrix) * normal'); }
    const NCH = 230, coal = new THREE.InstancedMesh(roughRock(3, 1), charM, NCH), m = new THREE.Matrix4(); for (let i = 0; i < NCH; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * .37, h = .085 * (1 - d * d / (.39 * .39)) + r() * .018, sz = .017 + r() * .024; m.compose(V(fireP.x + Math.cos(a) * d, FY + .012 + h, fireP.z + Math.sin(a) * d), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)), V(sz * (1 + r() * .6), sz * (.65 + r() * .3), sz)); coal.setMatrixAt(i, m); } coal.castShadow = true; G.fire.add(coal);
    // fish lying across the top of the coals, seen along their length; loaves at the mound's edge, on a flat stone
    // a fish laid on its side: head, belly, narrow tail stalk, forked tail; its colours in a small canvas (dark back, pale belly, scorch marks, an eye)
    const grillG = (() => { const o = new THREE.Shape(); o.moveTo(-.2, .002); o.quadraticCurveTo(-.165, .056, -.08, .068); o.quadraticCurveTo(.04, .074, .125, .026); o.lineTo(.158, .017); o.quadraticCurveTo(.195, .042, .232, .07); o.quadraticCurveTo(.214, .018, .216, 0); o.quadraticCurveTo(.214, -.018, .232, -.066); o.quadraticCurveTo(.195, -.04, .158, -.016); o.lineTo(.125, -.024); o.quadraticCurveTo(.03, -.076, -.09, -.062); o.quadraticCurveTo(-.17, -.05, -.2, .002);
      const g = new THREE.ExtrudeGeometry(o, { depth: .012, bevelEnabled: true, bevelThickness: .012, bevelSize: .007, bevelSegments: 3, curveSegments: 12 }); g.translate(0, 0, -.006); return g; })();
    const fishTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 96); g.addColorStop(0, '#3c3226'); g.addColorStop(.42, '#8a7658'); g.addColorStop(.8, '#c9b48e'); g.addColorStop(1, '#a8926e'); x.fillStyle = g; x.fillRect(0, 0, 256, 96); x.strokeStyle = 'rgba(30,20,12,.26)'; x.lineWidth = 5; for (const q of [74, 106, 138, 170]) { x.beginPath(); x.moveTo(q + 8, 18); x.lineTo(q - 6, 78); x.stroke(); } x.fillStyle = 'rgba(23,17,12,.7)'; x.beginPath(); x.arc(30, 39, 3, 0, 6.283); x.fill(); x.strokeStyle = 'rgba(30,20,12,.24)'; x.lineWidth = 2; x.beginPath(); x.arc(44, 48, 19, -1.1, 1.1); x.stroke(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1 / .44, 1 / .16); t.offset.set(.205 / .44, .08 / .16); return t; })();
    const foodG = new THREE.Group(); G.fire.add(foodG); G.food = null; delete G.food; fireFood = foodG; const fishCook = K.std('#8c7a68', { roughness: .55, map: fishTex, side: THREE.DoubleSide }), loaf = K.std('#9a7446', { roughness: .9 }), flat = K.std('#4a443a', { roughness: .95 });
    for (const [dx, dz, ry, fl] of [[-.05, .1, .16, 1], [.06, -.075, -.2, -1]]) { const q = new THREE.Mesh(grillG, fishCook); q.scale.set(.76 * fl, .76, .76); q.rotation.set(-1.2, ry, 0, 'YXZ'); q.position.set(fireP.x + dx, FY + .128 + (fl < 0 ? .012 : 0), fireP.z + dz); q.castShadow = true; foodG.add(q); }
    { const st = new THREE.Mesh(roughRock(13), flat), x = fireP.x + .46, z = fireP.z + .16; st.position.set(x, hgt(x, z) + .012, z); st.scale.set(.2, .04, .17); st.receiveShadow = true; G.fire.add(st);
      for (const [dx, dz, rr] of [[.42, .2, .092], [.54, .1, .082]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), loaf), bx = fireP.x + dx, bz = fireP.z + dz; b.scale.set(rr, rr * .42, rr); b.position.set(bx, hgt(x, z) + .06 + rr * .22, bz); b.castShadow = true; foodG.add(b); } } }
  // one low flame licking up behind the fish
  const flameM = new THREE.ShaderMaterial({ uniforms: fireU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float uT, uK; varying vec2 vU; ${hashGLSL} void main(){ vec2 q = vU; float h = q.y; q.x += (fbm(vec2(q.x * 2.3, h * 2.1 - uT * 1.4)) - .5) * .42 * h; float w = (1. - h) * .44 * (.75 + .25 * sin(uT * 3.1)); float d = abs(q.x - .5) / max(w, .001); float n = fbm(vec2(q.x * 4., h * 3.2 - uT * 2.2)); float a = smoothstep(1., .25, d) * smoothstep(1., .35, h + (n - .5) * .55) * smoothstep(0., .08, h); vec3 c = mix(vec3(2.4, .85, .16), vec3(3.2, 2.1, .8), smoothstep(.55, .1, h) * smoothstep(.9, .2, d)); gl_FragColor = vec4(c * a * uK * .72, a * uK * .72); }` });
  { const fg = new THREE.PlaneGeometry(.27, .23); fg.translate(0, .115, 0); for (let i = 0; i < 2; i++) { const q = new THREE.Mesh(fg, flameM); q.position.set(fireP.x + .03, FY + .08, fireP.z - .19); q.rotation.y = .3 + i * 1.3; q.renderOrder = 6; q.layers.set(2); G.fire.add(q); } }
  const fireLamp = film.lamp(fireP.clone().setY(FY + .72), '#ff9a48', { power: 0, size: .55, light: 1, distance: 16, fog: 1 });
  const NSPK = 26, spG = new THREE.BufferGeometry(), spP = new Float32Array(NSPK * 3), spA = new Float32Array(NSPK); spG.setAttribute('position', new THREE.BufferAttribute(spP, 3)); spG.setAttribute('aK', new THREE.BufferAttribute(spA, 1));
  const sparks = new THREE.Points(spG, dotM(14, '#ff9c4e')); sparks.frustumCulled = false; G.fire.add(sparks);
  function setSparks(t, k) { for (let i = 0; i < NSPK; i++) { const per = 1.6 + hsh(i, 1) * 1.6, ph = ((t + hsh(i, 2) * per) / per) % 1, n = Math.floor((t + hsh(i, 2) * per) / per), a = hsh(n + i, 3) * 6.283, y = ph * (.9 + hsh(i, 4) * .8), r = .05 + ph * .18;
      spP[i * 3] = fireP.x + Math.cos(a + ph * 2) * r; spP[i * 3 + 1] = FY + .1 + y; spP[i * 3 + 2] = fireP.z + Math.sin(a + ph * 2) * r; spA[i] = Math.sin(ph * Math.PI) * k * .55; } spG.attributes.position.needsUpdate = true; spG.attributes.aK.needsUpdate = true; }
  const fireFlick = t => .86 + .09 * Math.sin(t * 3.1) + .05 * Math.sin(t * 7.3 + 1.1) + .03 * Math.sin(t * 13.1 + .4);

  // ---------------------------------------------------------------- spray for the wading (pure in t)
  const NSPR = 110, sprG = new THREE.BufferGeometry(), sprP = new Float32Array(NSPR * 3), sprA = new Float32Array(NSPR); sprG.setAttribute('position', new THREE.BufferAttribute(sprP, 3)); sprG.setAttribute('aK', new THREE.BufferAttribute(sprA, 1));
  const spray = new THREE.Points(sprG, dotM(26, '#fff0d8')); spray.frustumCulled = false; G.shore.add(spray);

  // ---------------------------------------------------------------- the night courtyard (b6's match cut): a dark yard, seated shapes, its orange fire
  { const wm = K.std('#9a9184', { roughness: 1, emissive: col('#6a6258'), emissiveIntensity: .34 }), r = rng(171), add = (x, y, z, lx, ly, lz, ry = 0) => { const b = new THREE.Mesh(K.roundedBox(lx, ly, lz, .05, 1), wm); const p = FU.clone().addScaledVector(RIGHT, x).addScaledVector(EAST, z); b.position.set(p.x, FY + y, p.z); b.rotation.y = yawTo(EAST) + ry; b.castShadow = b.receiveShadow = true; G.cy.add(b); };
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), K.std('#2c2a28', { roughness: 1, emissive: col('#4a4640'), emissiveIntensity: .62 })); fl.rotation.x = -Math.PI / 2; fl.position.set(FU.x, FY + .004, FU.z); fl.receiveShadow = true; G.cy.add(fl);
    add(0, 2, 6.2, 16, 4, .6); add(-5.8, 2, 1, .6, 4, 11); add(6.2, 2, 1, .6, 4, 11);
        const dm = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.7), new THREE.MeshBasicMaterial({ color: '#08090f' })); const dp = FU.clone().addScaledVector(EAST, 5.89).addScaledVector(RIGHT, -1.5); dm.position.set(dp.x, FY + 1.3, dp.z); dm.rotation.y = yawTo(EAST) + Math.PI; G.cy.add(dm);
    const shp = rng(9); const cyDark = new THREE.MeshBasicMaterial({ color: '#070606', side: THREE.DoubleSide }); for (const [dx, dz, ln, hd] of [[-2.75, 3.9, -.34, .3], [-1.4, 4.7, -.16, .12], [.25, 5.0, -.42, .42], [1.7, 4.6, -.22, .05], [2.9, 3.8, -.38, .26]]) { const q = person(shp, { kind: 'man', sit: true }), pp = FU.clone().addScaledVector(RIGHT, dx).addScaledVector(EAST, dz); q.position.set(pp.x, FY, pp.z); q.rotation.y = yawTo(FU.clone().sub(pp)); q.traverse(o => { if (o.isMesh) o.material = cyDark; }); P.pose(q, { breath: .4, lean: ln, head: [hd, 0], hands: [V(-.14, .46, -.36), V(.14, .46, -.34)] }); G.cy.add(q); } }

  // ---------------------------------------------------------------- UNDER THE WATER: one set, the same in both blocks (「셰이프 오브 워터」)
  // the camera looks up at the hull; the surface glows above it (Snell's window), shafts of light come down, caustics crawl on the hull,
  // the net bag hangs under it, the shoal streams in. A = fill, tear. B = fill, strain, hold; then the whole set travels toward the beach.
  const UWO = Lc(0, DEEP); G.uw.position.copy(UWO);
  const CAUST = `float caust(vec2 uv, float t){ vec2 p = mod(uv * 6.28318, 6.28318) - 250.; vec2 i = p; float c = 1., inten = .005; for (int n = 0; n < 4; n++){ float tt = t * (1. - (3.5 / float(n + 1))); i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x)); c += 1. / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten))); } c /= 4.; c = 1.17 - pow(c, 1.4); return pow(abs(c), 8.); }`;
  const uwU = { uT: { value: 0 }, uWarm: { value: 0 }, uB: { value: 1 }, uDrag: { value: 0 } };
  const surfM = new THREE.ShaderMaterial({ uniforms: uwU, side: THREE.DoubleSide,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uT, uWarm, uB, uDrag; varying vec3 vW; ${CAUST} void main(){ vec3 Vd = normalize(vW - cameraPosition); vec2 q = vW.xz * .34 + vec2(uDrag, 0.); vec2 g = vec2(sin(q.x * 3.1 + uT * 1.2) + sin(q.y * 4.3 - uT * .9 + q.x), sin(q.y * 2.7 + uT * .8) + sin(q.x * 5.1 + uT * 1.1 - q.y)) * .05;
        float cv = Vd.y + g.x * .5; float win = smoothstep(.4, .84, cv); float ca = caust(q * .22, uT * .5);
        vec3 deep = vec3(.004, .03, .04), sky = mix(vec3(.05, .25, .27), vec3(.5, .42, .26), uWarm) * (.55 + 1.5 * smoothstep(.62, .95, cv)) * (1. + ca * 2.2); vec3 c = mix(deep + vec3(.02, .12, .13) * ca, sky, win); c += vec3(.2, .5, .48) * pow(max(cv, 0.), 14.) * .5; gl_FragColor = vec4(c * uB * .72, 1.); }` });
  { const sp = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), surfM); sp.rotation.x = -Math.PI / 2; sp.frustumCulled = false; G.uw.add(sp); }
  const uwHull = new THREE.Group(); G.uw.add(uwHull);
  const hullUM = new THREE.ShaderMaterial({ uniforms: uwU, side: THREE.DoubleSide, vertexShader: `varying vec3 vW; varying vec3 vN; varying vec2 vU; void main(){ vU = uv; vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uT, uB, uDrag; varying vec3 vW, vN; varying vec2 vU; ${CAUST} void main(){ float ca = caust((vW.xz + vec2(uDrag * 3., 0.)) * .22, uT * .6); float pl = smoothstep(.9, .98, fract(vU.y * 11.)) * .4; vec3 c = mix(vec3(.004, .007, .008), vec3(.014, .022, .024), .5 + .5 * vN.y) * (1. - pl) + vec3(.05, .17, .17) * ca * smoothstep(-.1, -.8, -vN.y + .3) * .7; gl_FragColor = vec4(c * uB, 1.); }` });
  { const h = new THREE.Mesh(hullG, hullUM); uwHull.add(h); }
  // the floor (seen when the set comes into the shallows)
  const floorM = new THREE.ShaderMaterial({ uniforms: uwU, vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uT, uB, uDrag; varying vec3 vW; ${hashGLSL} ${CAUST} void main(){ vec2 q = vW.xz + vec2(uDrag * 9., 0.); float n = fbm(q * .14) * .7 + fbm(q * .9) * .3, ca = caust(q * .14, uT * .55); vec3 c = mix(vec3(.03, .09, .095), vec3(.09, .19, .18), n) + vec3(.2, .44, .4) * ca; gl_FragColor = vec4(c * uB, 1.); }` });
  const uwFloor = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), floorM); uwFloor.rotation.x = -Math.PI / 2; uwFloor.position.y = -11; uwFloor.frustumCulled = false; G.uw.add(uwFloor);
  // shafts of light: soft planes hanging from the surface, always turned to the lens (few, inside the water's depth of field)
  const shaftM = new THREE.ShaderMaterial({ uniforms: uwU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vU; varying float vS; void main(){ vU = uv; vS = instanceMatrix[3].x * .7 + instanceMatrix[3].z * 1.3; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float uT, uWarm, uB; varying vec2 vU; varying float vS; void main(){ float e = pow(max(sin(vU.x * 3.14159), 0.), 2.4), f = pow(clamp(vU.y, 0., 1.), 1.5), m = .55 + .45 * sin(uT * (.5 + fract(vS) * .4) + vS * 7.) * sin(vU.x * 8. + vS + uT * .3); vec3 c = mix(vec3(.3, .78, .74), vec3(1., .86, .56), uWarm * .6); float a = e * f * m * .16 * uB; gl_FragColor = vec4(c * a, a); }` });
  const NSH = 15, shafts = new THREE.InstancedMesh((() => { const g = new THREE.PlaneGeometry(1, 1); g.translate(0, -.5, 0); return g; })(), shaftM, NSH); shafts.frustumCulled = false; shafts.renderOrder = 8; G.uw.add(shafts);
  const shS = Array.from({ length: NSH }, (_, i) => ({ x: (hsh(i, 1) - .5) * 24 - 3.2, z: (hsh(i, 2) - .5) * 18 - 4.6, w: 1.1 + hsh(i, 3) * 2.2, l: 11 + hsh(i, 4) * 5 }));
  // motes + bubbles
  const NMO = 90, moG = new THREE.BufferGeometry(), moP = new Float32Array(NMO * 3), moA = new Float32Array(NMO); moG.setAttribute('position', new THREE.BufferAttribute(moP, 3)); moG.setAttribute('aK', new THREE.BufferAttribute(moA, 1));
  const motes = new THREE.Points(moG, dotM(18, '#bff4ea')); motes.frustumCulled = false; G.uw.add(motes);
  // the net bag, review r2 "a perfect wire balloon": an irregular dragged sac, its mouth stretched along the hull, slack folds that pull out as it
  // fills. The mesh is very fine and low in contrast, seen where it faces the light, and sinks into the teal with depth. uwA: a long rip opens and the
  // fish burst out through it. uwB: the same bag goes taut along its hauling lines and holds.
  const HRY = 1.75, HA = V(Math.sin(HRY), 0, Math.cos(HRY)), HB = V(Math.cos(HRY), 0, -Math.sin(HRY)).multiplyScalar(-1), TC = { u: .19, w: .56 };
  const netU = { uT: { value: 0 }, uB: uwU.uB, uTearC: { value: new THREE.Vector2(TC.u, TC.w) }, uTearR: { value: 0 }, uTearO: { value: 0 }, uStrain: { value: 0 } };
  const bagM = new THREE.ShaderMaterial({ uniforms: netU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vU; varying vec3 vW; void main(){ vU = uv; vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uT, uB, uTearR, uTearO, uStrain; uniform vec2 uTearC; varying vec2 vU; varying vec3 vW; float hn(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); } float vn2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hn(i), hn(i + vec2(1, 0)), f.x), mix(hn(i + vec2(0, 1)), hn(i + vec2(1, 1)), f.x), f.y); }
      void main(){ vec2 uv = vU * vec2(250., 104.), a = vec2(uv.x + uv.y, uv.x - uv.y), g = abs(fract(a) - .5), fw = fwidth(a); float l = min(g.x / max(fw.x, .001), g.y / max(fw.y, .001)), line = 1. - smoothstep(.35, 1.1, l); line = mix(line, .3, smoothstep(.2, .52, max(fw.x, fw.y)));
        vec2 p = vec2(vU.x, 1. - vU.y) - uTearC; if (p.x > .5) p.x -= 1.; if (p.x < -.5) p.x += 1.; p *= vec2(mix(9., 3.8, uTearO), 1.3); float rag = length(p) + (vn2(vU * vec2(150., 60.)) - .5) * .075 + (vn2(vU * vec2(420., 170.)) - .5) * .03, edge = 0.; if (uTearR > .001) { if (rag < uTearR) discard; edge = exp(-pow((rag - uTearR) / .022, 2.)); }
        vec3 N = normalize(cross(dFdx(vW), dFdy(vW))); float graze = 1. - abs(dot(N, normalize(cameraPosition - vW))), up = abs(N.y), lit = pow(up, 1.6) * (.3 + .7 * vn2(vW.xz * 2.6 + uT * .22)), dk = smoothstep(-6.4, -.7, vW.y), rw = fwidth(vU.x * 7.), rib = exp(-pow(abs(fract(vU.x * 7.) - .5) / max(rw * 1.2, .002), 2.)) * (.2 + .8 * uStrain);
        vec3 c = mix(vec3(.022, .1, .11), vec3(.4, .56, .52), lit * (.42 + .5 * uStrain)) + vec3(.5, .7, .64) * edge * .55; float al = line * mix(.12, .34, lit) * (.72 + .5 * uStrain) + graze * graze * graze * .085 + rib * .14 + edge * .36; float mouth = .3 + .7 * smoothstep(.04, .3, 1. - vU.y); gl_FragColor = vec4(c * uB, clamp(al * (.2 + .8 * dk) * mouth + edge * .2, 0., 1.)); }` });
  const BNU = 150, BNV = 72, bagG = new THREE.PlaneGeometry(1, 1, BNU, BNV), bag = new THREE.Mesh(bagG, bagM); bag.frustumCulled = false; bag.renderOrder = 7; G.uw.add(bag);
  const BAG = { R: 1.32, m: V(-.05, -.44, .5), cod: V(.95, -4.25, 2.15) };
  let TK = 0;   // how far the rip has opened (its edges peel outward)
  function bagC(w, F, drag, t, out) { out.set(lerp(BAG.m.x, BAG.cod.x, w), lerp(BAG.m.y, BAG.cod.y * (.92 + .1 * F), Math.pow(w, .92)), lerp(BAG.m.z, BAG.cod.z, w)); out.x += drag * w * w * 1.25 + .12 * Math.sin(t * .55 + w * 2.2) * (1 - F * .7); out.y += drag * w * .55; out.z += .1 * Math.sin(t * .47 + w * 3) * (1 - F * .7); return out; }
  const _bc = V();
  function bagAt(u, w, F, drag, t, out) { const a = u * 6.28318; bagC(w, F, drag, t, _bc); let Rr = BAG.R * (Math.pow(Math.sin(Math.PI * Math.pow(w, .66)), .82) * (.62 + .38 * F) + .2 * Math.pow(1 - w, 2.5)) + .05;
    const lump = 1 + .15 * Math.sin(3 * a + w * 5 + 1.1) + .09 * Math.sin(5 * a - w * 7 + .4) + .05 * Math.sin(11 * a + w * 9), slack = (1 - F * .82) * (.27 * Math.pow(Math.abs(Math.sin(a * 2 + w * 2.4 + .6 + .25 * Math.sin(t * .6))), 3) + .13 * Math.pow(Math.abs(Math.sin(a * 4.5 + w * 6)), 4)), taut = F * .05 * Math.pow(Math.abs(Math.cos(a * 3.5)), 6);
    Rr *= lump * (1 - slack) * (1 - taut); Rr += (1 - F) * .03 * Math.sin(a * 6 + w * 9 - t * 1.4); if (TK > 0) { let du = u - TC.u; if (du > .5) du -= 1; if (du < -.5) du += 1; const q = du * du * 30 + (w - TC.w) * (w - TC.w); Rr *= 1 + .2 * TK * Math.exp(-q / .035); }
    const el = lerp(2.5, 1, ss(0, .42, w)), ca = Rr * el * Math.cos(a), sa = Rr * .84 * Math.sin(a); return out.set(_bc.x + HA.x * ca + HB.x * sa, _bc.y, _bc.z + HA.z * ca + HB.z * sa); }
  const _bv = V(), _bc2 = V();
  function setBag(F, drag, t) { const p = bagG.attributes.position; for (let j = 0; j <= BNV; j++) for (let i = 0; i <= BNU; i++) { bagAt(i / BNU, j / BNV, F, drag, t, _bv); p.setXYZ(j * (BNU + 1) + i, _bv.x, _bv.y, _bv.z); } p.needsUpdate = true; }
  const roped = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, 1, 5), new THREE.MeshBasicMaterial({ color: '#0a1c1d' })); G.uw.add(m); roped.push(m); }
  // the shoal: each fish a pure function of t — it circles in the school, streams into the bag on its own moment, packs there (its place is on the
  // bag's own shape, so it stays inside whatever the bag does), or goes out through the rip
  const NF = 820, shoal = new THREE.InstancedMesh(fishGeo, fishM, NF); shoal.frustumCulled = false; G.uw.add(shoal);
  const streakG = (() => { const a = new THREE.PlaneGeometry(.03, 1); a.rotateX(Math.PI / 2); a.translate(0, 0, .5); const b = a.clone(); b.rotateZ(Math.PI / 2); return K.mergeGeometries([[a.toNonIndexed(), new THREE.Matrix4()], [b.toNonIndexed(), new THREE.Matrix4()]]); })();
  const streakM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, vertexShader: `varying float vL; void main(){ vL = position.z; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.); }`, fragmentShader: `varying float vL; void main(){ float a = pow(1. - clamp(vL, 0., 1.), 2.) * .075; gl_FragColor = vec4(vec3(.62, .84, .82) * a, a); }` });
  const streaks = new THREE.InstancedMesh(streakG, streakM, NF); streaks.frustumCulled = false; streaks.renderOrder = 6; G.uw.add(streaks);
  const FD = Array.from({ length: NF }, (_, i) => { const r = rng(1000 + i); const a = r() * 6.283, c = 2 * r() - 1, s = Math.sqrt(1 - c * c), rr = Math.cbrt(r()); return { e: r(), ch: r(), sch: V(s * Math.cos(a) * rr, c * rr * .55, s * Math.sin(a) * rr), pk: V(s * Math.cos(a) * rr, c * rr, s * Math.sin(a) * rr), uk: r(), wk: .2 + .74 * r(), rk: Math.cbrt(r()), w: .3 + r() * .4, ph: r() * 6.283, sz: .6 + r() * .42, side: r() < .5 ? -1 : 1 }; });
  const _p0 = V(), _p1 = V(), _d = V(), _m = new THREE.Matrix4(), UPV = V(0, 1, 0), _s = V(), _zero = V(), ripV = V(), ripC = V(), ripO = V();
  function fishAt(f, t, cfg, out) { const sc = .9 + .6 * f.w, ang = t * f.w * (f.side > 0 ? 1 : -.8) + f.ph, cs = Math.cos(ang), sn = Math.sin(ang), sp = f.sch;
    const ax = -7.4 + 1.2 * Math.sin(t * .23), ay = -5.6 + .5 * Math.sin(t * .31), az = 4.8 + 1.0 * Math.sin(t * .19);   // the school, low and off to the left of the frame
    _p0.set(ax + (sp.x * cs - sp.z * sn) * 3.0 * sc, ay + sp.y * 2.4 + .22 * Math.sin(t * .8 + f.ph), az + (sp.x * sn + sp.z * cs) * 2.8 * sc);
    const k0 = clamp((t - (cfg.t0 + f.e * cfg.spread)) / cfg.dur), k = k0 * k0 * (3 - 2 * k0), wf = lerp(f.wk, .4 + .54 * f.wk, cfg.F); bagAt(f.uk, wf, cfg.F, cfg.drag, t, _p1); bagC(wf, cfg.F, cfg.drag, t, _bc2); _p1.lerp(_bc2, 1 - f.rk * .84);
    _p1.x += .05 * Math.sin(t * 2.3 + f.ph); _p1.y += .04 * Math.sin(t * 2.9 + f.ph * 2); _p1.z += .05 * Math.cos(t * 2.1 + f.ph);
    out.copy(_p0).lerp(_p1, k); const arc = Math.sin(Math.PI * k) * (1.1 + f.w); out.y -= arc * .5; out.z += arc * .28 * f.side;
    if (cfg.tear && f.ch < .36) { const ek = clamp((t - cfg.tear - f.w * 1.05) / 1.3); if (ek > 0) { out.lerp(cfg.rip, ss(0, .3, ek) * .9); const e2 = Math.pow(ss(.18, 1, ek), 1.5), sw = f.side * (.55 + f.w), dir = _d.set(cfg.out.x * .62 + HA.x * sw + f.pk.x * .4, cfg.out.y * .5 + f.pk.y * .5 - .2, cfg.out.z * .62 + HA.z * sw + f.pk.z * .4).normalize(); out.addScaledVector(dir, e2 * (2.3 + 3.2 * f.w)); out.y += .14 * Math.sin(ek * 3.1) * f.side; } }
    return out; }
  const _q2 = V(), _sc = V();
  function setShoal(t, cfg) { for (let i = 0; i < NF; i++) { const f = FD[i]; fishAt(f, t, cfg, _s); const px = _s.x, py = _s.y, pz = _s.z; fishAt(f, t + .035, cfg, _q2); _d.copy(_q2).sub(_s); const sp = _d.length() / .035; if (_d.lengthSq() < 1e-7) _d.set(Math.cos(f.ph), .12, Math.sin(f.ph));
      _d.normalize(); _m.lookAt(_zero, _d, UPV); const m0 = _m.clone(), sc = f.sz; _m.scale(_sc.set(sc, sc, sc * (1 + Math.min(.22, sp * .03)))); _m.setPosition(px, py, pz); shoal.setMatrixAt(i, _m);
      m0.scale(_sc.set(sc, sc, Math.max(.001, Math.min(.42, sp * .045)))); m0.setPosition(px, py, pz); streaks.setMatrixAt(i, m0); } shoal.instanceMatrix.needsUpdate = true; streaks.instanceMatrix.needsUpdate = true; }

  // ---------------------------------------------------------------- posing (every shot; pure in t)
  const PS = { PT, JS, PT2, JS2 }; let _matePS = false;
  const haul = (t, s = PT.userData.s) => { const w = t * 2.5, a = .5 + .5 * Math.sin(w), b = .5 + .5 * Math.sin(w + Math.PI);
    return { feet: [{ u: .24 * s, lift: 0 }, { u: -.22 * s, lift: 0 }], lean: -.42 - .1 * Math.sin(w * 2 + .6), twist: .1 * Math.sin(w), bob: -.05 * s - .025 * (1 + Math.sin(w * 2)), breath: P.breath(t, .17), head: [.32, 0],
      hands: [V(-.22 * s, .52 + .3 * a, -.56 - .12 * a), V(.22 * s, .52 + .3 * b, -.56 - .12 * b)] }; };
  const seatH = s => [V(-.2 * s, .47 * s, -.3 * s), V(.2 * s, .47 * s, -.28 * s)];
  const seated = (t, ph, ex = {}) => ({ ...P.rockSit(.37, 1.0), breath: P.breath(t, ph), hands: seatH(1), head: [.03 * Math.sin(t * .27 + ph * 9), .04 * Math.sin(t * .2 + ph * 5)], lean: -.08 + .025 * Math.sin(t * .31 + ph * 7), twist: .03 * Math.sin(t * .23 + ph * 5), ...ex });
  // Peter from standing to kneeling and bowing at the knees (k: 1 standing → 0 knees; bow 0 → 1)
  function kneelPose(k, bow, t) { const s = PT.userData.s, kn = P.kneelRise(k, s), br = P.breath(t, .17);
    const lean = kn.lean - .05 - 1.02 * bow, hw = ss(.05, .75, bow), hip = PT.userData.hipY + kn.bob, reach = V(0, Math.max(.06, hip + .26 - .95 * bow), -.2 - .62 * bow);
    return { ...kn, lean, breath: br * (.45 + .55 * (1 - bow)), head: [.1 + .58 * bow, 0], hands: [V(-.25 * s, reach.y, reach.z), V(.25 * s, reach.y, reach.z)], handsW: [hw, hw], swing: [.08, .05], abd: [-.05, -.03] }; }

  // ---------------------------------------------------------------- the shots
  const tmpV = V(), TUNIC = tunicM.color.clone(), CLOTH = clothM.color.clone(), HULLC = M.hull.color.clone(), KGM = kingM.color.clone(), KGC = kingC.color.clone(), LEGC = legM.color.clone(), RIMC = RU.uRimC.value.clone(), STONEC = M.stone.color.clone();
  function setCam(p, l, fov = FOV) { cam.position.copy(p); cam.up.set(0, 1, 0); cam.fov = fov; cam.lookAt(l); }
  const logd = (a, b, k) => Math.exp(lerp(Math.log(a), Math.log(b), k));
  const key = (a, b, t) => clamp((t - a) / (b - a));
  // what is on screen
  function show(...names) { for (const k in G) G[k].visible = names.includes(k); waterMesh.visible = mist.visible = !names.includes('uw') && !names.includes('cy'); }
  function placeBoat(pos, yaw, t, roll = 0) { boat.position.copy(pos).setY(.02 * Math.sin(t * .9) + .015 * Math.sin(t * 1.7)); boat.rotation.set(.012 * Math.sin(t * .7 + 1), yaw, roll + .016 * Math.sin(t * .85), 'YXZ');
    wl1.position.copy(pos).setY(.012); wl1.rotation.y = yaw; }
  const side = () => { const lx = V(Math.cos(boat.rotation.y), 0, -Math.sin(boat.rotation.y)); return Math.sign(lx.dot(EAST)) || 1; };
  const faceW = (o, d) => { o.rotation.y = yawTo(d) - boat.rotation.y; };
  function hideBoatProps() { fishU.uLight.value.copy(sunDir(7)); fishU.uAmb.value = 1; fishU.uFlash.value = .8; fishU.uTint.value.set('#ffe6c4'); M.stone.color.copy(STONEC); RU.uRimC.value.copy(RIMC); hoist.visible = false; legM.color.copy(LEGC); kingM.color.copy(KGM); kingC.color.copy(KGC); tunicM.color.copy(TUNIC); clothM.color.copy(CLOTH); M.hull.color.copy(HULLC); curtain.visible = false; dropsMesh.visible = false; ringU.uK.value = 0; rings.visible = false; leap.visible = false; pile.visible = false; wl2.visible = false; wl1.visible = true; mate.visible = false; ropeA.visible = ropeW.visible = false; drape.visible = false; DR.m.visible = BU.m.visible = false; sheen.visible = false; wakeB.visible = false; M.wood.color.copy(WOODC); boatFlats.forEach((o, i) => { o.material = flatMats[i]; }); hipBlob.visible = false; for (const g of [PT, mate]) if (g.userData.beard) { g.userData.beard.scale.copy(BEARD0); g.userData.beard.position.z = BEARDZ; } }

  // ----- a1 / b1: dolly in on the boat before dawn (p: 0 far … 1 near)
  function boatWide(t, p, kPal, expo) { show('land', 'boat'); hideBoatProps(); const pos = Lc(0, DEEP), yaw = Math.atan2(RIGHT.x, RIGHT.z); placeBoat(pos, yaw, t); const sd = side();
    PT.visible = true; JS.visible = false; AN.visible = true; PT.position.set(sd * .44, DECK, -.9); faceW(PT, EAST); P.pose(PT, haul(t)); AN.position.set(-sd * .1, DECK, 2.0); faceW(AN, EAST.clone().addScaledVector(RIGHT, -.9)); P.pose(AN, { breath: P.breath(t, .6), hands: seatH(AN.userData.s), lean: -.1, head: [.1, 0] });
    palette(kPal); film.look.exposure = expo; setSunE(-1.4); mistU.uK.value = .4; shadowAt(pos, 40);
    const pe = 1.45 * p - .45 * p * p, d = logd(40, 16.5, pe), yawC = lerp(-.16, -.06, p), dir = EAST.clone().addScaledVector(RIGHT, yawC).normalize(), tgt = pos.clone().setY(lerp(1.5, 1.2, p)), c = tgt.clone().addScaledVector(dir, -d); c.y = lerp(3.0, 1.9, pe); setCam(c, tgt.clone().add(V(0, lerp(.4, .25, pe), 0))); film.dofCfg.focus = d; film.dofCfg.aperture = .35; }
  // ----- a2 / b2: the net comes up, nothing in it (the same angle in both blocks; h from the block's own times)
  function netUp(t, h, s, kPal, expo) { show('land', 'boat'); hideBoatProps(); const pos = Lc(0, DEEP), yaw = Math.atan2(RIGHT.x, RIGHT.z); placeBoat(pos, yaw, t); const sd = side();
    curtain.visible = true; dropsMesh.visible = true; rings.visible = true; JS.visible = false; AN.visible = false; PT.visible = true; PT.position.set(sd * .44, DECK, -1.7); faceW(PT, EAST); P.pose(PT, haul(t));
    curtain.position.set(sd * 1.42, 0, 1.15); curtain.rotation.y = Math.PI / 2; setCurtain(h, t, sd);
    // water runs out of the mesh in threads and falls from the lead line (the curtain's frame → the boat's: x = 1.42·sd + Z, z = 1.15 − X)
    for (let i = 0; i < NDROP; i++) { const st = i < 300 ? Math.floor(i / 10) : i, per = .5 + hsh(st, 5) * .3, tt = t / per + (i < 300 ? (i % 10) / 10 : hsh(i, 6)), n = Math.floor(tt), ph = tt - n, key2 = i < 300 ? st : n + i, u = (hsh(key2, 7) - .5) * .96, w = i < 300 ? .72 + hsh(st, 8) * .28 : .25 + hsh(key2, 8) * .75; curtPt(u, w, h, t, sd, _cp);
      const fall = ph * per, y = _cp.y - 4.9 * fall * fall, alive = _cp.y > .03 && y > 0; dropP[i * 3] = sd * 1.42 + _cp.z; dropP[i * 3 + 1] = Math.max(y, 0); dropP[i * 3 + 2] = 1.15 - _cp.x; dropA[i] = alive ? (.32 + .5 * hsh(key2, 10)) * Math.min(1, ph * 9) * ss(0, .2, h) : 0; } dropG.attributes.position.needsUpdate = true; dropG.attributes.aK.needsUpdate = true;
    { const q = boat.localToWorld(V(sd * 1.5, 0, 1.15)); rings.position.set(q.x, .018, q.z); rings.rotation.y = yaw + Math.PI / 2; ringU.uK.value = ss(.05, .3, h) * .9; }
    { curtPt(.5, 0, h, t, sd, _cp); const a = V(sd * 1.42 + _cp.z, _cp.y, 1.15 - _cp.x), b = V(sd * .75, 1.3, -1.45), d = b.clone().sub(a), L = d.length(); hoist.visible = true; hoist.position.copy(a).addScaledVector(d, .5); hoist.scale.set(1, L, 1); hoist.quaternion.setFromUnitVectors(UPV, d.normalize()); }
    palette(kPal); film.look.exposure = expo; setSunE(-1.2); mistU.uK.value = .8; shadowAt(pos, 26); curtU.uLight.value.copy(sunDir(7)); curtU.uK.value = kPal < .06 ? .8 : 1.12; curtU.uCool.value = kPal < .06 ? .8 : .22;
    // the camera sits low on the sun side and looks back at the net against the dark hull and the deep blue
    const cu = lerp(.86, .98, s), cv = lerp(5.6, 4.55, s), cy = lerp(.55, .62, s), c = Lc(cu, DEEP + cv, cy), l = Lc(.98, DEEP + 1.2, lerp(.27, .36, s)); setCam(c, l); film.dofCfg.focus = cv - 1.2; film.dofCfg.aperture = .6; }
  // ----- a3: the seated man's back, the crowd on the beach, his arm goes out to the deep
  // the camera stands in the shallows and looks along the shore: the beach and its crowd on the right, the deep lake on the left, his back to us;
  // his left arm goes out to the left of the frame, to the deep
  function word(t, Tm) { show('land', 'boat', 'crowd'); hideBoatProps(); const k = key(Tm.N104 - .45, Tm.N105 + .45, t), pos = Lc(3.2, 4.3), dirH = RIGHT.clone().addScaledVector(EAST, .12).normalize(), yaw = yawTo(dirH); placeBoat(pos, yaw, t);
    JS.visible = true; AN.visible = false; PT.visible = true; JS.position.set(-.26, DECK, 1.7); JS.rotation.y = 0;
    const armW = ss(Tm.N104 + 1.1, Tm.N104 + 2.7, t), rest = ss(Tm.N104 + 4.4, Tm.N105 + .4, t), base = seated(t, .3), tgt = V(-.62, 1.05 - .1 * rest + .012 * Math.sin(t * 1.3), -.36 + .05 * rest); P.pose(JS, { ...base, lean: base.lean - .08 * armW, side: .05 * armW, twist: base.twist + .24 * armW, hands: [tgt, seatH(1)[1]], handsW: [armW * (1 - .22 * rest), 1], head: [base.head[0] + .03 * armW, .2 * armW] });
    PT.position.set(.5, DECK, -2.2); PT.rotation.y = .25; P.pose(PT, { ...P.idle(t, .2, { s: PT.userData.s }), head: [.04, .1 * Math.sin(t * .3)], hands: [V(-.24, .92, -.2), V(.24, .92, -.2)] });
    for (const q of crowd) lifeStand(q, t);
    tunicM.color.copy(TUNIC).multiplyScalar(.06); clothM.color.copy(CLOTH).multiplyScalar(.15); legM.color.copy(LEGC).multiplyScalar(.1); kingM.color.copy(KGM).multiplyScalar(.055); kingC.color.copy(KGC).multiplyScalar(.1); M.hull.color.copy(HULLC).multiplyScalar(.3); RU.uRimC.value.setRGB(.34, .2, .11); palette(.3); film.look.exposure = .82; setSunE(.7); mistU.uK.value = .03; shadowAt(pos, 40);
    const R = logd(18.8, 15.2, k), c = Lc(3.2 - R, lerp(1.9, 2.15, k), lerp(1.95, 1.75, k)), l = Lc(9, 3.15, lerp(1.28, 1.2, k)); setCam(c, l); film.dofCfg.focus = R; film.dofCfg.aperture = .32; }
  const lifeStand = (q, t) => { const U = q.userData; if (U.sit) P.pose(q, { breath: P.breath(t, U.ph), lean: -.06 + .03 * Math.sin(t * .3 + U.ph * 7), twist: .04 * Math.sin(t * .23 + U.ph * 5), hands: [V(-.16 * U.s, .52 * U.s, -.3 * U.s), V(.16 * U.s, .52 * U.s, -.28 * U.s)] }); else P.pose(q, { ...P.idle(t, U.ph, { s: U.s }) }); };
  // ----- a5: from the stern against the sunrise; among the leaping fish he falls to his knees before the seated figure
  function fall(t, Tm) { show('land', 'boat', 'boat2'); hideBoatProps(); leap.visible = pile.visible = true; const k = key(Tm.N106 - .45, Tm.Q102 + .45, t), pos = Lc(0, 46), yaw = yawTo(EAST) + .62; placeBoat(pos, yaw, t, .012);
    boat2.position.copy(Lc(11, 62)).setY(.02 * Math.sin(t * .8 + 1)); boat2.rotation.set(0, yaw + .9, .02 * Math.sin(t * .7), 'YXZ'); wl2.visible = true; wl2.position.copy(boat2.position).setY(.012); wl2.rotation.y = boat2.rotation.y; for (const q of crew2) { const U = q.userData; if (U.kind === 'stand') P.pose(q, { ...P.idle(t, .4, { s: U.s }), lean: -.2, hands: [V(-.2, .8, -.4), V(.2, .8, -.4)] }); else P.pose(q, { breath: P.breath(t, .7), hands: seatH(U.s), lean: -.15 }); }
    JS.visible = true; AN.visible = false; PT.visible = true; JS.position.set(.38, DECK, 1.72); JS.rotation.y = 0; P.pose(JS, seated(t, .3));
    const tf = Tm.N106b, kn = 1 - ss(tf - .05, tf + 1.25, t), bow = ss(tf + .75, tf + 2.25, t), settle = .05 * ss(tf + 2.3, Tm.N107, t); PT.position.set(-.3, DECK, .5); PT.rotation.y = Math.atan2(-.68, -1.22); const q = kneelPose(kn, (bow + settle) * .7, t); q.bob = (q.bob || 0) + (bow > .99 ? .012 * Math.sin(t * 1.3) : 0); P.pose(PT, q);
    setLeap(t, Tm.N106, 1 - .75 * ss(tf + 1, Tm.N107 + 1, t));
    const sunK = ss(Tm.Q101 - 1.2, Tm.N107 + .8, t); palette(lerp(.52, .86, sunK)); film.look.exposure = lerp(.76, .78, sunK); setSunE(lerp(3.2, 6.8, sunK)); mistU.uK.value = lerp(.7, .45, sunK); shadowAt(pos, 30);
    const d = logd(18.5, 13.2, k), c = pos.clone().addScaledVector(EAST, -d).addScaledVector(RIGHT, lerp(1.25, .9, k)); c.y = lerp(4.1, 3.35, k); setCam(c, pos.clone().setY(lerp(1.02, .9, k))); film.dofCfg.focus = d; film.dofCfg.aperture = .4; }
  function setLeap(t, t0, amt) { const m = new THREE.Matrix4(); for (let i = 0; i < NLEAP; i++) { const per = 1.15 + hsh(i, 11) * 1.1, tt = t - t0 + hsh(i, 12) * per, n = Math.floor(tt / per), ph = tt / per - n, sd = hsh(n + i, 13) < .5 ? -1 : 1, z0 = -2.6 + hsh(n + i, 14) * 5.2, x0 = sd * (.2 + hsh(n + i, 15) * 1.1), vis = hsh(n + i * 3, 16) < amt;
      const y = DECK + .06 + Math.sin(ph * Math.PI) * (.3 + hsh(n + i, 17) * .62), x = x0 + sd * ph * .34, z = z0 + (hsh(n + i, 18) - .5) * ph * .9, d = V(sd * .5, Math.cos(ph * Math.PI) * 1.6, (hsh(n + i, 19) - .5)).normalize(); m.lookAt(_zero, d, UPV); const s = vis ? .92 : .001; m.scale(_q2.set(s, s, s)); m.setPosition(x, y, z); leap.setMatrixAt(i, m); } leap.instanceMatrix.needsUpdate = true; }
  // ----- a7: behind Peter, low; he lifts his head; the people on the shore beyond him
  function lift(t, Tm) { show('land', 'boat', 'crowd'); hideBoatProps(); pile.visible = true; const k = key(Tm.Q102 - .45, Tm.N108 + .45, t), pos = Lc(0, 46), yaw = yawTo(EAST) + .62; placeBoat(pos, yaw, t, .012);
    // (he is between us and the lit shore: held dark, a shape against the morning; the seated man is just out of this frame)
    tunicM.color.copy(TUNIC).multiplyScalar(.06); clothM.color.copy(CLOTH).multiplyScalar(.16); legM.color.copy(LEGC).multiplyScalar(.1); M.hull.color.copy(HULLC).multiplyScalar(.3); RU.uRimC.value.setRGB(.06, .04, .025);
    AN.visible = false; JS.visible = false; PT.visible = true; PT.position.set(-.3, DECK, .5); PT.rotation.y = Math.atan2(-.68, -1.22); const up = ss(Tm.Q102 + .5, Tm.Q102 + 2.7, t), q = kneelPose(0, .735 * (1 - up), t); q.head = [lerp(.68, -.14, up), .05 * up]; q.hands[0].lerp(V(-.25, .42, -.3), up); q.hands[1].lerp(V(.25, .42, -.3), up); q.handsW = [1, 1]; P.pose(PT, q);
    for (const q2 of crowd) lifeStand(q2, t); palette(.9); film.look.exposure = .74; setSunE(7.5); mistU.uK.value = .4; shadowAt(pos.clone().addScaledVector(EAST, -30), 44);
    const c = pos.clone().addScaledVector(EAST, 19.5 - 1.6 * k).addScaledVector(RIGHT, lerp(-2.2, -2.6, k)); c.y = lerp(1.15, 1.3, k); const l = Lc(lerp(4.4, 4.0, k), 12, lerp(1.62, 1.72, k)); setCam(c, l, 30); film.dofCfg.focus = 17; film.dofCfg.aperture = .32; }
  // ----- a8: the beach, the boats drawn up, the torn net; small figures walk away up the road
  function follow(t, Tm) { show('land', 'drawn', 'walkers'); hideBoatProps(); wl1.visible = false; const k = key(Tm.N108 - .45, Tm.C10, t);
    const pace = 1.18, du = .926, dv = -.378;   // the path: from the boats up the beach to the road, away from the lens
    walkers.forEach((w, i) => { const t0 = Tm.N108 - 2.5 - i * .1, pz = P.walk(w, t, t0, { T: pace, L: .62 }), dist = pz.dist + 1 + (4 - i) * 2.1, lat = (i % 2 ? .46 : -.38), uu = -3.5 + du * dist - dv * lat, vv = -8.2 + dv * dist + du * lat, p = Lc(uu, vv); w.position.set(p.x, hgt(p.x, p.z), p.z); w.rotation.y = yawTo(RIGHT.clone().multiplyScalar(du).addScaledVector(EAST, dv)); const { dist: _, ph: __, ...rest } = pz; P.pose(w, { ...rest, breath: 0 }); });
    palette(.8); SK.mid.value.lerp(col('#a9bccb', .98), .18); film.atmos.density *= .6; film.look.exposure = .8; film.look.saturation = 1.08; setSunE(11); mistU.uK.value = .3; shadowAt(Lc(0, -10), 34, 26);
    const c = Lc(lerp(-20.2, -21.4, k), lerp(-3.4, -3.0, k), lerp(2.9, 3.9, k)), l = Lc(lerp(8, 8.4, k), lerp(-9.9, -10.1, k), lerp(.9, .85, k)); setCam(c, l); film.dofCfg.focus = 18; film.dofCfg.aperture = .25; }
  // ----- b3: from the boat toward the shore in the mist: someone stands there; a speck of fire beside him
  function far(t, Tm) { show('land', 'shore', 'fire'); hideBoatProps(); seatJ.visible = seatP.visible = false; const k = key(Tm.N162 - .45, Tm.N163 + .45, t); PT2.visible = false; JS2.visible = true; spray.visible = false; const jp = Lc(5.6, -.9); JS2.position.set(jp.x, gy(5.6, -.9), jp.z); JS2.rotation.y = yawTo(EAST); P.pose(JS2, { ...P.idle(t, .3, { s: JS2.userData.s }) });
    kingM.color.copy(KGM).multiplyScalar(.2); kingC.color.copy(KGC).multiplyScalar(.2); setFire(t, .3, 0); palette(.16); film.look.exposure = 1.0; film.atmos.density *= 1.5; setSunE(.5); mistU.uK.value = 1; shadowAt(Lc(0, 0), 40);
    const c = Lc(.4 + .35 * k, 96 - 1.4 * k, 1.45 + .05 * k), l = Lc(4.2, -.4, 2.1); setCam(c, l, lerp(23, 18.5, k)); film.dofCfg.focus = 96; film.dofCfg.aperture = .1; }
  // ----- b5: he wraps his cloak, jumps, wades ashore
  function run(t, Tm) { show('land', 'boat', 'shore'); hideBoatProps(); seatJ.visible = seatP.visible = false; const t0 = Tm.N164, pos = Lc(2.5, 15.4), yaw = Math.atan2(RIGHT.x, RIGHT.z); placeBoat(pos, yaw, t); const sd = side(); PT.visible = false; JS.visible = false; AN.visible = true; AN.position.set(sd * .2, DECK, 1.4); faceW(AN, RIGHT.clone().multiplyScalar(-1)); P.pose(AN, { breath: P.breath(t, .6), hands: seatH(AN.userData.s), lean: -.2 });
    PT2.visible = true; JS2.visible = false; spray.visible = true;
    const tj = t0 + 1.25, tl = tj + .58, ws = tl + .3, u0 = 2.5, v0 = 14.4; let v = v0, y = .5, Pz = null; const s = PT2.userData.s, dV = -1.75, wadeY = vv => -Math.min(1.05, .35 + vv * .075), fac = EAST.clone().negate();
    const cr = ss(tj - .32, tj - .03, t), up2 = ss(tj - .14, tj + .34, t), swAir = -.3 * cr + 1.15 * up2 - .43 * ss(tj + .3, tl + .25, t), abdAir = .25 * ss(tj - .1, tj + .2, t), headAir = lerp(.05, -.1, ss(tj - .1, tj + .2, t)), br = P.breath(t, .17);
    if (t < tj) { const wrap = ss(t0 - .35, t0 + .45, t) * (1 - ss(tj - .72, tj - .04, t)); y = DECK + .36; Pz = { feet: [{ u: .16 * s, lift: 0 }, { u: -.14 * s, lift: 0 }], bob: -.2 * cr * s, lean: -.1 - .3 * cr, breath: br, head: [headAir, 0], hands: [V(-.17 * s, 1.18 * s - .1 * cr, -.2), V(.17 * s, 1.18 * s - .1 * cr, -.2)], handsW: [wrap, wrap], swing: [swAir, swAir], abd: [abdAir, abdAir] }; }
    else if (t < tl) { const f = (t - tj) / (tl - tj), sf = Math.sin(f * Math.PI); v = v0 + dV * f; y = lerp(DECK + .36, wadeY(v0 + dV) - .08, f) + sf * .52; Pz = { feet: [{ u: lerp(.16, .1, f) * s, lift: .18 * sf }, { u: lerp(-.14, -.08, f) * s, lift: .1 * sf }], bob: lerp(-.2, -.18, f) * s, lean: lerp(-.4, -.1, f), swing: [swAir, swAir], abd: [abdAir, abdAir], head: [headAir, 0], breath: br }; }
    else { const e = t - ws, amt = ss(0, .7, e), w = P.walk(PT2, t, ws, { T: 1.42, L: .56, amt }), pre = clamp((t - tl) / (ws - tl)), armK = ss(0, .6, e), swA = w.swing[0] * 1.5 + .34; v = v0 + dV - w.dist; y = wadeY(v) - .08 * (1 - pre);
      Pz = { feet: [{ ...w.feet[0], u: w.feet[0].u + (1 - amt) * .1 * s }, { ...w.feet[1], u: w.feet[1].u - (1 - amt) * .08 * s }], bob: w.bob - .18 * s * (1 - pre), lean: lerp(-.1, -.2, pre) - .1 * armK, swing: [lerp(swAir, swA, armK), lerp(swAir, .68 - swA, armK)], abd: [.25 + .37 * armK, .25 + .37 * armK], head: [lerp(-.1, -.04, pre), 0], breath: br }; }
    const pv = Lc(u0, v); PT2.position.set(pv.x, y, pv.z); PT2.rotation.y = yawTo(fac); P.pose(PT2, Pz);
    // spray: a burst when he lands, a small one at every step
    const evs = [[tl, 44, 1]]; for (let i = 0; i < 9; i++) { const te = ws + i * .71; if (te < Tm.L106 + .5) evs.push([te, 14, .55]); } let n = 0; for (const [te, cnt, pow] of evs) { const q = PT2.position.clone().setY(.06), vAt = te < ws ? v0 + dV : v0 + dV - (te - ws) * (.56 * 2 / 1.42); q.copy(Lc(u0, vAt, .06));
      for (let i = 0; i < cnt && n < NSPR; i++, n++) { const a = hsh(i, te * 3) * 6.283, sp = (1.0 + hsh(i, te + 1) * 2.0) * pow, up = (1.5 + hsh(i, te + 2) * 2.4) * pow, age = t - te - hsh(i, te + 3) * .08, life = .75 + hsh(i, te + 4) * .4; if (age <= 0 || age > life) { sprP[n * 3 + 1] = -5; sprA[n] = 0; continue; }
        sprP[n * 3] = q.x + Math.cos(a) * sp * age; sprP[n * 3 + 1] = Math.max(.01, .06 + up * age - 4.9 * age * age); sprP[n * 3 + 2] = q.z + Math.sin(a) * sp * age; sprA[n] = (1 - age / life) * .95; } } for (; n < NSPR; n++) { sprA[n] = 0; sprP[n * 3 + 1] = -5; } sprG.attributes.position.needsUpdate = true; sprG.attributes.aK.needsUpdate = true;
    const k = key(t0 - .45, Tm.L106 + .45, t); palette(lerp(.27, .34, k)); film.look.exposure = .82; setSunE(lerp(1.4, 2.2, k)); sunLamp.power *= .2; film.atmos.density *= .55; M.hull.color.copy(HULLC).multiplyScalar(.3); tunicM.color.copy(TUNIC).multiplyScalar(.4); clothM.color.copy(CLOTH).multiplyScalar(.6); mistU.uK.value = .025; shadowAt(Lc(2, 7), 30);
    const cu = lerp(.3, .7, k), cv = lerp(-15.5, -11, k), c = Lc(cu, cv, gy(cu, cv) + lerp(1.0, .92, k)), l = Lc(lerp(2.5, 2.3, k), lerp(14, 9.0, k), lerp(1.75, 1.45, k)); setCam(c, l); film.dofCfg.focus = lerp(27, 19, k); film.dofCfg.aperture = .4; }
  function setFire(t, k, bw) { const fl = fireFlick(t); fireU.uT.value = t; fireU.uK.value = k * fl; fireU.uBW.value = bw; fireLamp.power = 1.6 * k * fl; fireLamp.light.intensity = (bw ? 5 : 3.4) * k * fl; fireFood.visible = !bw; setSparks(t, Math.min(1, k * 1.2)); }
  // ----- b6: the fire. A slow push; the flame holds its place in the frame through the courtyard's match
  function fireCam(t, Tm) { const k = key(Tm.L106 - .45, Tm.N166 + .45, t), cu = lerp(8.12, 8.04, k), cv = lerp(-12.5, -10.5, k), c = Lc(cu, cv, gy(cu, cv) + lerp(1.2, .92, k)); setCam(c, Lc(8, -6.8, FY + lerp(.3, .22, k)), FOV); film.dofCfg.focus = c.distanceTo(Lc(8, -7, .2)); film.dofCfg.aperture = .9; }
  function fireShot(t, Tm) { show('land', 'fire'); hideBoatProps(); fireCam(t, Tm); setFire(t, 1, 0); const u = key(Tm.L106, Tm.N166, t); palette(lerp(.16, .26, u)); film.look.exposure = lerp(.92, .86, u); setSunE(lerp(1.3, 2, u)); mistU.uK.value = .75; shadowAt(Lc(8, -7), 12); }
  function courtShot(t, Tm) { show('cy', 'fire'); hideBoatProps(); M.stone.color.copy(STONEC).multiplyScalar(.34); fireCam(t, Tm); setFire(t, 1.05, 1); const a = film.atmos; palette(.05); a.density = .012; a.falloff = .01; a.start = 2; a.scatter = 1; pcol(a.color, ['#20242e', .35], ['#20242e', .35], 0); pcol(a.colorUp, ['#20242e', .3], ['#20242e', .3], 0); fireLamp.power *= .16; film.dofCfg.aperture = 3.4; film.look.saturation = 0; film.look.exposure = 1.25; film.look.contrast = 1.14; sky.mesh.visible = true; SK.sunHide.value = 1; sunLamp.power = 0; sunL.intensity = .05; hemi.intensity = 1.05; shadowAt(Lc(8, -7), 12); }
  // ----- b7: two seated silhouettes either side of the fire; dawn → gold → the sun clears the hills on Q120
  function twoAt(t) { JS2.visible = true; PT2.visible = true; spray.visible = false; seatJ.visible = seatP.visible = true; tunicM.color.copy(TUNIC).multiplyScalar(.42); clothM.color.copy(CLOTH).multiplyScalar(.6); kingM.color.copy(KGM).multiplyScalar(.34); kingC.color.copy(KGC).multiplyScalar(.4); }
  function dialog(t, Tm) { show('land', 'fire', 'shore'); hideBoatProps(); twoAt(t); const k = key(Tm.N166 - .45, Tm.N168 + .45, t), jp = Lc(6.72, -8.72), pp = Lc(9.26, -5.62), f2j = jp.clone().sub(FU), f2p = pp.clone().sub(FU);
    JS2.position.set(jp.x, gy(6.72, -8.72), jp.z); JS2.rotation.y = yawTo(f2p.clone().sub(f2j)); PT2.position.set(pp.x, gy(9.26, -5.62), pp.z); PT2.rotation.y = yawTo(f2j.clone().sub(f2p));
    seatJ.position.copy(JS2.position); seatP.position.copy(PT2.position); seatJ.position.addScaledVector(V(-Math.sin(JS2.rotation.y), 0, -Math.cos(JS2.rotation.y)), -.03); seatP.position.addScaledVector(V(-Math.sin(PT2.rotation.y), 0, -Math.cos(PT2.rotation.y)), -.03); P.pose(JS2, seated(t, .3));
    const up = ss(Tm.N167 - .3, Tm.N167 + 3.6, t), upK = up * up * (3 - 2 * up), base = seated(t, .17); P.pose(PT2, { ...base, lean: lerp(-.52, -.12, up) + .02 * Math.sin(t * .35), head: [lerp(.62, .02, upK), .03 * Math.sin(t * .22)], hands: [V(-.2, lerp(.44, .47, up), -.28), V(.2, lerp(.44, .47, up), -.27)] });
    const g = ss(Tm.N166 - 2, Tm.Q120 + .5, t), rise = ss(Tm.Q120 - 3.2, Tm.Q120 + 1.4, t); setFire(t, lerp(1.05, .52, ss(Tm.N167, Tm.N168, t)), 0); palette(lerp(.24, .9, g)); film.look.exposure = lerp(.86, .76, g); setSunE(lerp(1.4, 3.4, g) + rise * 3.4); mistU.uK.value = lerp(.72, .45, g); shadowAt(Lc(8, -7), 13);
    const cu = lerp(7.5, 7.7, k), cv = lerp(-27.5, -21.5, k), c = Lc(cu, cv, gy(cu, cv) + lerp(.62, .56, k)), l = Lc(lerp(8.1, 8.05, k), -5, FY + lerp(1.42, 1.3, k)); setCam(c, l); film.dofCfg.focus = c.distanceTo(FU); film.dofCfg.aperture = .35; }
  // ----- b8: side by side on the shore, looking toward the road; hold, ease out
  function ending(t, Tm) { show('land', 'shore', 'fire'); hideBoatProps(); seatJ.visible = seatP.visible = false; tunicM.color.copy(TUNIC).multiplyScalar(.11); clothM.color.copy(CLOTH).multiplyScalar(.26); legM.color.copy(LEGC).multiplyScalar(.22); kingM.color.copy(KGM).multiplyScalar(.1); kingC.color.copy(KGC).multiplyScalar(.16); const k = clamp((t - (Tm.N168 - .45)) / (Tm.C5 - Tm.N168 + .45)), hd = RIGHT.clone().addScaledVector(EAST, -.16).normalize(), pj = Lc(.4, -5.3), pp = Lc(1.05, -4.25); spray.visible = false; JS2.visible = true; PT2.visible = true;
    JS2.position.set(pj.x, gy(.4, -5.3), pj.z); PT2.position.set(pp.x, gy(1.05, -4.25), pp.z); JS2.rotation.y = PT2.rotation.y = yawTo(hd); P.pose(JS2, { ...P.idle(t, .3, { s: JS2.userData.s }), abd: [-.03, -.04] }); P.pose(PT2, { ...P.idle(t, .17, { s: PT2.userData.s }), abd: [-.04, -.02], head: [-.03, .05 * Math.sin(t * .3)] });
    setFire(t, .28, 0); palette(.74); film.atmos.density *= .6; film.look.exposure = .84; film.look.saturation = 1.1; setSunE(9); mistU.uK.value = .5; shadowAt(pj, 22);
    const ee = 1 - Math.pow(1 - k, 1.25), cu = lerp(-14.6, -19, ee), cv = lerp(-7.4, -7.9, ee), c = Lc(cu, cv, gy(cu, cv) + lerp(1.15, 1.8, ee)), l = Lc(lerp(12, 12.5, ee), lerp(-6.6, -6.3, ee), gy(1, -5) + lerp(1.75, 1.65, ee)); setCam(c, l); film.dofCfg.focus = 17; film.dofCfg.aperture = .32; }
  // ----- under the water
  // the seen sun: below the ridge (≈ 2.5°) there is no disc and no road of light on the water (the mirror does not draw the land, so the disc itself is switched off), only a warm thread on the horizon
  function setSunE(e) { SK.sunDir.value.copy(sunDir(e)); SK.sunHide.value = .93 * (1 - ss(-1.5, 2.6, e)); SK.sunColor.value.multiplyScalar(ss(2.0, 3.2, e)); SK.domeK.value = 1; SK.cover.value = 0; sunLamp.power = 900 * ss(.4, 5, e); waterU.uSpec.value = .05 + .95 * ss(1.6, 4.6, e); sky.mesh.visible = true; }
  function under(t, Tm, blk) { show('uw'); hideBoatProps(); wl1.visible = false; const isB = blk === 'B', t0 = isB ? Tm.N163 : Tm.N105, s = t - t0 + .45;
    const F = isB ? ss(t0 + .1, t0 + 5.4, t) : ss(t0 + .15, t0 + 3.3, t), drag = isB ? ss(Tm.N163b - .7, Tm.N163b + 2.8, t) : 0, travel = isB ? (t > Tm.N163b - .7 ? Math.pow(Math.max(0, t - (Tm.N163b - .7)), 1.6) * .22 : 0) : 0;
    const tear = isB ? 0 : t0 + 3.05, tearK = isB ? 0 : ss(tear, tear + 1.35, t); TK = tearK;
    netU.uTearR.value = isB ? 0 : (t > tear ? .008 + .36 * Math.pow(tearK, 1.15) : 0); netU.uTearO.value = tearK; netU.uStrain.value = isB ? Math.max(F * .7, drag) : F * .45; setBag(F, drag, t);
    bagAt(TC.u, TC.w, F, drag, t, ripV); bagC(TC.w, F, drag, t, ripC); ripO.copy(ripV).sub(ripC).normalize();
    setShoal(t, { t0: t0 + .1, spread: isB ? 4.8 : 2.6, dur: 1.05, F, drag, tear: isB ? 0 : tear + .08, rip: ripV, out: ripO });
    uwU.uT.value = t; uwU.uWarm.value = isB ? .08 + .14 * drag : .08; uwU.uB.value = 1; uwU.uDrag.value = travel * .06; uwFloor.position.y = isB ? lerp(-12, -10.2, ss(Tm.N163b - .5, Tm.N164 + .4, t)) : -11;
    // the hull: large and dark overhead, lying across the frame, the light of the surface all round it; it heels as the catch comes on
    uwHull.scale.setScalar(1.2); uwHull.rotation.set(0, HRY, isB ? .05 + .05 * F : .04 + .1 * F + .02 * Math.sin(t * 1.3) * tearK); uwHull.position.set(.1, .03 * Math.sin(t * .8), 0);
    { roped.forEach((m, i) => { const al = (i / 5 - .5) * 3.3, top = V(.1 + HA.x * al + HB.x * .66, -.24, HA.z * al + HB.z * .66), bot = bagAt(.08 + i * .07, .012, F, drag, t, V()), d = bot.clone().sub(top), L = d.length(); m.position.copy(top).addScaledVector(d, .5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(UPV, d.normalize()); }); }
    // shafts stand from the surface, turned to the lens
    const cc = uwCamPos(s, isB, t, Tm), M4 = new THREE.Matrix4(), q = new THREE.Quaternion(); shS.forEach((h, i) => { const a = Math.atan2(cc.x - h.x, cc.z - h.z); q.setFromAxisAngle(UPV, a); const tilt = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), -.2); q.multiply(tilt); M4.compose(V(h.x + travel * .35, 0, h.z), q, V(h.w, h.l, 1)); shafts.setMatrixAt(i, M4); }); shafts.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NMO; i++) { const per = 9 + hsh(i, 21) * 8, ph = ((t + hsh(i, 22) * per) / per) % 1, x = (hsh(i, 23) - .5) * 14 + Math.sin(t * .15 + i) * .3 - travel * .2, y = -8.5 + ph * 8.2, z = (hsh(i, 24) - .5) * 12 + 2; moP[i * 3] = x; moP[i * 3 + 1] = y; moP[i * 3 + 2] = z; moA[i] = Math.sin(ph * Math.PI) * (.28 + .4 * hsh(i, 25)); } moG.attributes.position.needsUpdate = true; moG.attributes.aK.needsUpdate = true;
    fishU.uT.value = t; fishU.uAmb.value = .85; fishU.uFlash.value = 1; fishU.uTint.value.set('#e8fff8'); fishU.uLight.value.set(.28 + .1 * Math.sin(t * .4), 1, .22).normalize();
    const a = film.atmos; a.color.set('#0e4a50').multiplyScalar(.17); a.colorUp.set('#0e4a50').multiplyScalar(.17); a.density = .052; a.falloff = .001; a.base = 0; a.start = 1.5; a.max = 3000; a.scatter = 0; a.anisotropy = 0; a.phaseMix = 0; sunLamp.power = 0; fireLamp.power = 0; fireLamp.light.intensity = 0; hemi.intensity = .6; sunL.intensity = 0; sky.mesh.visible = false;
    const L2 = film.look; L2.saturation = 1.08; L2.contrast = 1.1; L2.vignette = .36; L2.exposure = 1.12; L2.shadowTint.set('#b0e8e4'); L2.highTint.set('#f2fff8');
    const look = V(.32, -2.0 - (isB ? 1.25 * ss(Tm.N163b - .4, Tm.N164 + .5, t) : 0), .6); const cw = cc.clone().add(UWO); setCam(cw, look.add(UWO)); film.dofCfg.focus = cc.distanceTo(V(.5, -2.6, 1.3)); film.dofCfg.aperture = 1.5; }
  function uwCamPos(s, isB, t, Tm) { const a = 1.0 + s * .018, r = 9.8 - s * .045, h = -6.95 + s * .022; return V(Math.cos(a) * r, h, Math.sin(a) * r); }

  // ================================================================ B VERSION: light and silhouette (rounds/r10-pilot/lake-b.md)
  // Nets and fish built in code fail up close, so B does not draw them well: it tells them with backlight, a dark shape, bright drops and motion.
  const boatFlats = boat.children.slice(1, 2).concat(boat.children.slice(3, 6)), flatMats = boatFlats.map(o => o.material), WOODC = M.wood.color.clone(), deckM = boat.children[1].material, DECKC = deckM.color.clone(), BEARD0 = PT.userData.beard.scale.clone(), BEARDZ = PT.userData.beard.position.z;
  const silM = rimify(K.std('#2c2622', { roughness: .95, side: THREE.DoubleSide }), 'sil', 1), inkM = new THREE.MeshBasicMaterial({ color: '#0a0807', side: THREE.DoubleSide });
  const mate = peter(); mate.traverse(o => { if (o.isMesh) o.material = silM; }); mate.userData.ph = .55; mate.visible = false; boat.add(mate);
  const hipBlob = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 10), tunicM); hipBlob.position.set(0, .03, -.01); hipBlob.scale.set(1.1, .8, .95); hipBlob.castShadow = true; hipBlob.visible = false; PT.userData.upper.add(hipBlob);
  function tuckSkirt(g, kk) { const U = g.userData, p = U.skirt.geometry.attributes.position; let y0 = 1e9, y1 = -1e9; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < y0) y0 = y; if (y > y1) y1 = y; } for (let i = 0; i < p.count; i++) { const z = p.getZ(i), y = p.getY(i), hn = (y - y0) / Math.max(.01, y1 - y0), back = Math.max(0, z) / (.27 * U.s), zk = z > 0 ? 1 - kk * (.34 + .34 * hn) : 1 - .36 * kk; p.setXYZ(i, p.getX(i) * (1 - .24 * kk), y - kk * .3 * hn * Math.min(1, back) * U.s, z * zk); } p.needsUpdate = true; U.skirt.geometry.computeVertexNormals(); }
  // a rope: a tube through a smooth curve of points, re-laid every frame
  function mkRope(n, r) { const sides = 5, pos = new Float32Array((n + 1) * sides * 3), idx = []; for (let j = 0; j < n; j++) for (let i = 0; i < sides; i++) { const a = j * sides + i, b = j * sides + (i + 1) % sides, c = a + sides, d = b + sides; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, inkM); m.frustumCulled = false; m.visible = false;
    const T0 = V(), A0 = V(), B0 = V(), pP = V(), UP = V(0, 1, 0), SIDE = V(1, 0, 0);
    m.userData.lay = pts => { const cv = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); for (let j = 0; j <= n; j++) { cv.getPoint(j / n, pP); cv.getTangent(Math.min(.999, Math.max(.001, j / n)), T0); A0.crossVectors(T0, Math.abs(T0.y) > .9 ? SIDE : UP).normalize(); B0.crossVectors(T0, A0).normalize();
        for (let i = 0; i < sides; i++) { const a = i / sides * 6.28318, k = (j * sides + i) * 3; pos[k] = pP.x + (A0.x * Math.cos(a) + B0.x * Math.sin(a)) * r; pos[k + 1] = pP.y + (A0.y * Math.cos(a) + B0.y * Math.sin(a)) * r; pos[k + 2] = pP.z + (A0.z * Math.cos(a) + B0.z * Math.sin(a)) * r; } } g.attributes.position.needsUpdate = true; };
    return m; }
  const ropeA = mkRope(56, .021), ropeW = mkRope(22, .021); boat.add(ropeA, ropeW);
  // the net: a dark wet drape over the near rail, mostly lost in the hull's shadow; a ragged hem, no mesh
  const DNU = 34, DNV = 16, drapeG = new THREE.PlaneGeometry(1, 1, DNU, DNV), drapeM = new THREE.MeshStandardMaterial({ color: '#0d0b0a', roughness: .3, metalness: .1, side: THREE.DoubleSide }), drape = new THREE.Mesh(drapeG, drapeM); drape.frustumCulled = false; drape.visible = false; boat.add(drape);
  const railAt = (z, sd) => { const s = z / (BL / 2), tp = Math.sqrt(Math.max(.0006, 1 - Math.pow(Math.abs(s), 2.6))), sh = .34 * Math.pow(Math.abs(s), 2.4); return { x: -sd * BW / 2 * tp, y: BD * .55 + sh }; };
  const DZ0 = 1.5, DZ1 = 2.9;
  function drapePt(u, w, h, t, sd, out) { const z = lerp(DZ0, DZ1, u), R = railAt(z, sd), top = R.y + .03 + .07 * h * Math.sin(u * Math.PI), rag = .13 * Math.sin(u * 17 + 1.2) + .08 * Math.sin(u * 41 + .4) + .05 * Math.sin(u * 83), hem = lerp(-.3, .34, h) + rag * (.5 + .5 * h) - .16 * Math.sin(u * Math.PI), y = lerp(top, hem, w), fold = (.05 * Math.sin(u * 23 + w * 2.3) + .028 * Math.sin(u * 53 - w * 3.1)) * (.3 + w), sway = .022 * w * w * Math.sin(t * 1.25 + u * 4);
    return out.set(R.x - sd * (.035 + .15 * w + fold + sway), y, z + .05 * w * Math.sin(u * 9 + 1) + .018 * w * Math.sin(t * .9 + u * 6)); }
  function setDrape(h, t, sd) { const p = drapeG.attributes.position; for (let j = 0; j <= DNV; j++) for (let i = 0; i <= DNU; i++) { drapePt(i / DNU, j / DNV, h, t, sd, _cp); p.setXYZ(j * (DNU + 1) + i, _cp.x, _cp.y, _cp.z); } p.needsUpdate = true; drapeG.computeVertexNormals(); }
  // bright drops off the hem (the only thing that comes up), and one burst when the rope parts
  const mkPts = (n, size, c) => { const g = new THREE.BufferGeometry(), P3 = new Float32Array(n * 3), Ak = new Float32Array(n); g.setAttribute('position', new THREE.BufferAttribute(P3, 3)); g.setAttribute('aK', new THREE.BufferAttribute(Ak, 1)); const m = new THREE.Points(g, dotM(size, c)); m.frustumCulled = false; m.visible = false; m.renderOrder = 9; return { m, g, P3, Ak, n }; };
  const DR = mkPts(460, 92, '#fff3dc'), BU = mkPts(260, 225, '#fff8ec'); boat.add(DR.m); S.add(BU.m); BU.m.layers.set(2);
  // the water behind the figures is what makes them read: a road of light on the lake toward the sun, added over the mirror
  const sheenU = { uT: { value: 0 }, uSun: { value: V(0, .1, -1) }, uC: { value: col('#ffd9ac') }, uK: { value: 1 }, uWide: { value: .5 } };
  const sheen = (() => { const g = new THREE.PlaneGeometry(1600, 1200); g.rotateX(-Math.PI / 2); const m = new THREE.ShaderMaterial({ uniforms: sheenU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uT, uK, uWide; uniform vec3 uSun, uC; varying vec3 vW; ${hashGLSL} void main(){ vec3 Vd = normalize(vW - cameraPosition), R = reflect(Vd, vec3(0., 1., 0.)); vec2 sh = normalize(uSun.xz), rh = normalize(R.xz); float side = abs(rh.x * sh.y - rh.y * sh.x), grazing = 1. - smoothstep(.01, .16, R.y), road = exp(-pow(side / mix(.07, .3, uWide), 2.)), wide = exp(-pow(side / .62, 2.)); vec2 q = vW.xz; float a = fbm(q * vec2(.5, 1.5) + vec2(uT * .1, -uT * .07)), b = fbm(q * vec2(1.7, 4.4) - vec2(uT * .18, uT * .05)), gl = smoothstep(.42, .8, a * .55 + b * .55); float d = length(vW - cameraPosition), fade = smoothstep(3., 13., d); float L = (road * (.3 + 1.05 * gl) + wide * (.14 + .22 * gl)) * mix(.42, 1., grazing) * fade * uK; gl_FragColor = vec4(uC * L, L); }` });
    const w = new THREE.Mesh(g, m); w.position.copy(Lc(0, 300, .02)); w.renderOrder = 3; w.layers.set(2); w.frustumCulled = false; w.visible = false; S.add(w); return w; })();
  const wakeBU = { uT: { value: 0 }, uK: { value: 0 } };
  const wakeB = (() => { const g = new THREE.PlaneGeometry(20, 9); g.rotateX(-Math.PI / 2); const m = new THREE.ShaderMaterial({ uniforms: wakeBU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: `uniform float uT, uK; varying vec2 vP; ${hashGLSL} void main(){ float s = vP.x + 3.7; if (s < 0.) discard; float n = fbm(vec2(vP.x * 1.4 + uT * 1.5, vP.y * 3.)), hw = .36 * s + .1, d = abs(abs(vP.y) - hw), arm = exp(-pow(d / (.07 + s * .035), 2.)) * exp(-s * .17), inner = (1. - smoothstep(0., hw, abs(vP.y))) * (.5 + .5 * sin(s * 5.5 - uT * 6.5 + vP.y * 2.)) * exp(-s * .3) * .22; float a = (arm * (.5 + .9 * n) + inner) * uK * smoothstep(9.8, 7., abs(vP.x)) * smoothstep(4.4, 3., abs(vP.y)); gl_FragColor = vec4(vec3(1., .92, .8) * a, a); }` });
    const w = new THREE.Mesh(g, m); w.renderOrder = 4; w.layers.set(2); w.frustumCulled = false; w.visible = false; S.add(w); return w; })();
  // ---- the two men on one rope, in profile, hand over hand
  const toRoot = (g, v) => v.clone().sub(g.position).applyAxisAngle(UPV, -g.rotation.y);
  // a hand: on the rope pulling from far (0) to near (1), then off it, travelling back in a small arc above it
  const gripPh = (t, per, ph) => { const p = ((t / per + ph) % 1 + 1) % 1; if (p < .6) return { k: ss(0, .6, p), up: 0 }; const b = ss(.6, 1, p); return { k: 1 - b, up: Math.sin(b * Math.PI) * .1 }; };
  const ropeY = z => lerp(.98, 1.2, clamp((1.9 - z) / 3.4));   // the rope's line along the boat
  function placeCrew(sd) { const xp = -sd * .36, xm = -sd * .3, zp = -1.42, zm = -.14; PT.visible = mate.visible = true; JS.visible = AN.visible = false; PT.position.set(xp, DECK, zp); mate.position.set(xm, DECK, zm); PT.rotation.y = mate.rotation.y = Math.PI + sd * .1; }
  function poseHauler(g, t, per, ph0, sd, str) { const U = g.userData, s = U.s, z0 = g.position.z, x0 = g.position.x, a = gripPh(t, per, ph0), b = gripPh(t, per, ph0 + .5), avg = (a.k + b.k) / 2, sw = Math.sin((t / per + ph0) * 6.28318 * 2);
    const hand = (q, off) => toRoot(g, V(x0 + off, ropeY(lerp(z0 + .6, z0 + .26, q.k)) + q.up, lerp(z0 + .6, z0 + .26, q.k)));
    P.pose(g, { feet: [{ u: .23 * s, lift: 0 }, { u: -.19 * s, lift: 0 }], bob: -.05 * s + .018 * sw, lean: lerp(-.3, -.1, avg) + .05 * sw * str + (.0), twist: .05 * sw, breath: P.breath(t, U.ph), head: [.16, 0], hands: [hand(a, -.05), hand(b, .05)], handsW: [1, 1] }); }
  function layRope(t, sd, ex = {}) { const R = railAt(2.1, sd), xE = -sd * .36, rail = V(R.x - sd * .02, R.y + .03, 2.1), W = ex.W || V(-sd * 1.3, .02, 3.6), q = ex.q || 0, pts = [W]; if (!ex.noLow) pts.push(rail); for (let i = 0; i < 6; i++) { const z = lerp(1.7, -1.14, i / 5), u = Math.sin(i / 5 * Math.PI); pts.push(V(lerp(R.x * .5, xE, ss(0, .25, i / 5)) + q * .03 * u * Math.sin(t * 61 + i * 1.7), ropeY(z) + q * .04 * u * Math.sin(t * 47 + i * 2.3) - .02 * u * (1 - q), z)); } pts.push(V(xE, .9, -1.58), V(xE, .46, -1.95), V(xE + sd * .1, .2, -2.3)); ropeA.visible = true; ropeA.userData.lay(pts); return { rail, W }; }

  // ----- a2 / b2: the empty net against the bright water (one setup; b2 is bluer)
  function setHaulCam(e, track = 0) { const d = 18 - .085 * e, c = Lc(.12 + track, DEEP - d, .98), l = Lc(-.3 + track, DEEP, 1.22); setCam(c, l); film.dofCfg.focus = d; film.dofCfg.aperture = .34; }
  function netHaul(t, h, e, isB) { show('land', 'boat'); hideBoatProps(); const pos = Lc(0, DEEP), yaw = Math.atan2(RIGHT.x, RIGHT.z) + Math.PI; placeBoat(pos, yaw, t); const sd = side();
    placeCrew(sd); const per = 1.75; poseHauler(PT, t, per, .08, sd, 1); poseHauler(mate, t, per, .36, sd, 1); layRope(t, sd, { W: V(-sd * .84, .3 + .26 * h, 2.4) }); drape.visible = true; setDrape(h, t, sd);
    let alive = 0; for (let i = 0; i < DR.n; i++) { const per2 = .4 + hsh(i, 5) * .28, tt = t / per2 + hsh(i, 6), n = Math.floor(tt), ph = tt - n, key2 = n * 13 + i, u = hsh(key2, 7), w = .6 + .4 * hsh(key2, 8); drapePt(u, w, h, t - ph * per2, sd, _cp); const fall = ph * per2, y = _cp.y - 4.9 * fall * fall, on = y > .01 && _cp.y > .02; DR.P3[i * 3] = _cp.x - sd * .03; DR.P3[i * 3 + 1] = Math.max(y, 0); DR.P3[i * 3 + 2] = _cp.z; DR.Ak[i] = on ? (.45 + .55 * hsh(key2, 10)) * Math.min(1, ph * 10) * ss(.02, .22, h) : 0; alive += on ? 1 : 0; } DR.g.attributes.position.needsUpdate = DR.g.attributes.aK.needsUpdate = true; DR.m.visible = true; DR.alive = alive;
    { const q = boat.localToWorld(V(-sd * 1.05, 0, 2)); rings.visible = true; rings.position.set(q.x, .018, q.z); rings.rotation.y = yaw + Math.PI / 2; ringU.uK.value = ss(.04, .3, h) * .85; }
    const kP = isB ? .1 : .17; palette(kP); silhouettes(.09, isB ? .95 : .7); film.look.exposure = isB ? .96 : .96; setSunE(-1.15); mistU.uK.value = .4; shadowAt(pos, 26);
    sheenU.uSun.value.copy(sunDir(2)); sheenU.uC.value.set(isB ? '#a9bee8' : '#f4c8a0').multiplyScalar(isB ? .62 : .78); sheenU.uK.value = 1; sheenU.uWide.value = .85; sheenU.uT.value = t; sheen.visible = true; drapeM.color.set('#0c0a0a');
    setHaulCam(e); }
  // the men and hull as shapes against the light (rim k, cool/warm rim)
  function silhouettes(k, cool) { tunicM.color.copy(TUNIC).multiplyScalar(k * .7); clothM.color.copy(CLOTH).multiplyScalar(k * 1.3); legM.color.copy(LEGC).multiplyScalar(k); M.hull.color.copy(HULLC).multiplyScalar(.2); silM.color.set('#2c2622').multiplyScalar(k * 1.1); RU.uRimC.value.setRGB(lerp(.42, .26, cool) * .5, lerp(.26, .3, cool) * .5, lerp(.15, .42, cool) * .5); M.wood.color.copy(WOODC).multiplyScalar(.12); boatFlats.forEach(o => { o.material = inkM; }); for (const g of [PT, mate]) if (g.userData.beard) { g.userData.beard.scale.set(.6, .82, .46); g.userData.beard.position.z = -.058 * g.userData.s; } }

  // ----- tA / hB: one camera, one heel. A: the rope quivers, parts and whips, water bursts. B: it quivers and HOLDS, the boat is dragged
  function netStrain(t, T, blk) { show('land', 'boat'); hideBoatProps(); const isA = blk === 'A', t0 = isA ? T.tA0 : T.N163b, tS = isA ? T.tS : 1e9, e = t - t0, tau = t - tS, snapped = tau > 0;
    const drag = isA ? 0 : .62 * (Math.max(0, e) - (1 - Math.exp(-Math.max(0, e)))), heel = .285 * ss(-.2, .5, e) * (snapped ? Math.exp(-tau * 1.7) * Math.cos(tau * 3.2) : 1) + (isA ? 0 : .012 * Math.sin(t * 2.1) * ss(.5, 1.2, e)); const sg = isA ? 0 : ss(.3, 1.5, e), surge = .17 * sg * Math.sin(e * 6.28318 / 2.15), nod = .034 * sg * Math.cos(e * 6.28318 / 2.15), pos = Lc(drag + surge, DEEP), yaw = Math.atan2(RIGHT.x, RIGHT.z) + Math.PI; boat.rotation.y = yaw; const sd = side();
    placeBoat(pos, yaw, t, sd * heel * .55); boat.rotation.x += heel * .56 + nod; placeCrew(sd); const bump = snapped ? (tau / .24) * Math.exp(1 - tau / .24) : 0, s1 = PT.userData.s, trem = isA && snapped ? 0 : ss(0, .4, e), hold = g => { const U = g.userData, x0 = g.position.x, z0 = g.position.z, q = .012 * trem * Math.sin(t * 43 + z0), up = .2 * bump, hand = o => toRoot(g, V(x0 + o, ropeY(z0 + .36 + o * .8) + q + up, z0 + .36 + o * 1.4 - .1 * bump));
      P.pose(g, { feet: [{ u: .32 * U.s, lift: 0 }, { u: -.24 * U.s, lift: 0 }], bob: -.1 * U.s + .02 * bump, lean: .2 + .1 * ss(0, .5, e) + .36 * bump + .012 * trem * Math.sin(t * 37 + z0), twist: .04, breath: P.breath(t, U.ph), head: [-.08 - .12 * bump, 0], hands: [hand(-.05), hand(.05)], handsW: [1, 1] }); }; hold(PT); hold(mate);
    const W = V(-sd * 1.05, -.05 - .02 * Math.sin(t * 3), 3.82);
    if (!snapped) { const q = (isA ? .55 + .45 * ss(0, tS - t0, e) : .7) * trem; layRope(t, sd, { W, q }); ropeW.visible = false; for (let i = 0; i < BU.n; i++) BU.Ak[i] = 0; BU.m.visible = false; }
    else { const R = railAt(2.1, sd), rail = V(R.x - sd * .02, R.y + .03, 2.1), decay = Math.exp(-tau * 2.5), wv = i => Math.sin(i * 1.5 - tau * 15) * decay, up = [], xE = -sd * .36; for (let i = 0; i < 7; i++) { const u = i / 6, z = lerp(-1.14, .55 + 1.15 * Math.exp(-tau * 4.2), u), bk = u * u, yy = ropeY(z) + bk * (.55 * wv(i) + .95 * (1 - Math.exp(-tau * 7)) * decay - .68 * (1 - decay)); up.push(V(xE - sd * bk * .24 * wv(i + 2), yy, z - bk * .35 * (1 - Math.exp(-tau * 5)))); } ropeA.visible = true; ropeA.userData.lay([V(xE + sd * .1, .2, -2.3), V(xE, .46, -1.95), V(xE, .9, -1.58), ...up]);
      const fallW = ss(0, .42, tau); ropeW.visible = tau < 1.15; ropeW.userData.lay([V(W.x, W.y - .35 * fallW, W.z), V(lerp(rail.x, W.x, .45), lerp(rail.y - .2, -.12, fallW), lerp(2.1, W.z, .5)), V(rail.x, rail.y + .02, 2.1), V(rail.x * .9, rail.y + .1 - .3 * fallW, 1.62)]);
      const wp = boat.localToWorld(V(W.x, 0, W.z)); let al = 0; for (let i = 0; i < BU.n; i++) { const a = hsh(i, 31) * 6.283, sp = (.3 + hsh(i, 32) * 1.5) * (i < 90 ? 1.2 : .8), upV = (1.5 + hsh(i, 33) * 3.0) * (i < 90 ? 1 : .7), dl = hsh(i, 34) * .12, age = tau - dl, life = .6 + hsh(i, 35) * .7; if (age <= 0 || age > life) { BU.Ak[i] = 0; BU.P3[i * 3 + 1] = -3; continue; } const dx = Math.cos(a) * sp * age, dz = Math.sin(a) * sp * age; BU.P3[i * 3] = wp.x + RIGHT.x * dx + EAST.x * dz; BU.P3[i * 3 + 1] = Math.max(.01, .05 + upV * age - 4.9 * age * age); BU.P3[i * 3 + 2] = wp.z + RIGHT.z * dx + EAST.z * dz; BU.Ak[i] = (1 - age / life) * .95; al++; } BU.alive = al; BU.g.attributes.position.needsUpdate = BU.g.attributes.aK.needsUpdate = true; BU.m.visible = true; }
    const kP = isA ? .42 : lerp(.22, .28, clamp(e / 7.5)); palette(kP); silhouettes(.08, isA ? .15 : .4); film.look.exposure = isA ? .63 : .66; setSunE(isA ? 2.3 : lerp(1.1, 1.5, clamp(e / 7.5))); mistU.uK.value = .35; shadowAt(pos, 26);
    sheenU.uSun.value.copy(sunDir(2.4)); sheenU.uC.value.set(isA ? '#ffd2a0' : '#f3d6b8').multiplyScalar(isA ? .85 : .72); sheenU.uK.value = 1; sheenU.uWide.value = .85; sheenU.uT.value = t; sheen.visible = true;
    if (!isA) { wakeB.visible = true; wakeB.position.copy(pos).setY(.016); wakeB.rotation.y = Math.atan2(RIGHT.z, -RIGHT.x); wakeBU.uT.value = t; wakeBU.uK.value = 1.05 * ss(.1, 1.7, e); const q = boat.localToWorld(V(W.x, 0, W.z)); rings.visible = true; rings.position.set(q.x, .018, q.z); rings.rotation.y = yaw + Math.PI / 2; ringU.uK.value = .75 * ss(.1, .9, e);
      const dragAt = x => { const y = Math.max(0, x); return .62 * (y - (1 - Math.exp(-y))) + .17 * ss(.3, 1.5, x) * Math.sin(x * 6.28318 / 2.15); }; let al = 0;
      for (let i = 0; i < BU.n; i++) { const foam = i >= 110, per = foam ? 2.6 : .72 + hsh(i, 41) * .4, tt = (e + 40) / per + hsh(i, 42), n = Math.floor(tt), age = (tt - n) * per, born = e - age, key3 = n * 17 + i, pow2 = ss(.25, 1.5, born) * (.72 + .28 * Math.max(0, Math.cos(born * 6.28318 / 2.15))); if (pow2 <= .01) { BU.Ak[i] = 0; BU.P3[i * 3 + 1] = -3; continue; }
        if (foam) { const along = -3.3 + hsh(key3, 43) * 6.6, lat = -1.02 - hsh(key3, 44) * .2, u = dragAt(born) + along, pp = Lc(u, DEEP + lat); BU.P3[i * 3] = pp.x; BU.P3[i * 3 + 1] = .025; BU.P3[i * 3 + 2] = pp.z; BU.Ak[i] = pow2 * .48 * Math.sin(Math.min(1, age / .25) * 1.57) * (1 - age / per); }
        else { const lat = (hsh(key3, 45) - .5) * .9, sx = -(.25 + hsh(key3, 46) * 1.0), up0 = 1.1 + hsh(key3, 47) * 1.5, pp = Lc(dragAt(born) + 2.72 + sx * age, DEEP + lat * (1 + age)); BU.P3[i * 3] = pp.x; BU.P3[i * 3 + 1] = Math.max(.01, .08 + up0 * age - 4.9 * age * age); BU.P3[i * 3 + 2] = pp.z; BU.Ak[i] = pow2 * .8 * (1 - age / per); } al += BU.Ak[i] > .02 ? 1 : 0; } BU.alive = al; BU.g.attributes.position.needsUpdate = BU.g.attributes.aK.needsUpdate = true; BU.m.visible = true; }
    setHaulCam(7.5 + e * .4, drag * .9); }

  // ----- a5: low on the water, the boat side-on on the bright lake. Peter, large, drops to his knees and bows before the seated man;
  // the sun stands in the gap between them, never behind either head
  function fallB(t, Tm) { show('land', 'boat'); hideBoatProps(); leap.visible = pile.visible = true; const k = key(Tm.N106 - .45, Tm.Q102 + .45, t), pos = Lc(0, 46), yaw = Math.atan2(RIGHT.x, RIGHT.z); placeBoat(pos, yaw, t, .006); const sd = side();
    JS.visible = PT.visible = true; AN.visible = false; mate.visible = false; JS.position.set(-sd * .06, DECK, 1.62); { const d = V(sd * .78, 0, -.62); JS.rotation.y = Math.atan2(-d.x, -d.z); } P.pose(JS, seated(t, .3));
    const tf = Tm.N106b, kn = 1 - ss(tf - .05, tf + 1.25, t), bow = ss(tf + .75, tf + 2.25, t), settle = .05 * ss(tf + 2.3, Tm.N107, t); PT.position.set(-sd * .12, DECK, -.5); PT.rotation.y = Math.PI - sd * .12; const q = kneelPose(kn, (bow + settle) * .96, t); q.bob = (q.bob || 0) + (bow > .99 ? .012 * Math.sin(t * 1.3) : 0); P.pose(PT, q); tuckSkirt(PT, 1 - kn);
    setLeap(t, Tm.N106, 1 - .75 * ss(tf + 1, Tm.N107 + 1, t));
    const sunK = ss(Tm.Q101 - 1.2, Tm.N107 + .8, t); palette(lerp(.52, .86, sunK)); silhouettes(.07, 0); hipBlob.visible = kn < .9; M.hull.color.copy(HULLC).multiplyScalar(.14); kingM.color.copy(KGM).multiplyScalar(.055); kingC.color.copy(KGC).multiplyScalar(.09); RU.uRimC.value.setRGB(.26, .16, .09); film.look.exposure = lerp(.565, .615, sunK); setSunE(lerp(3.0, 6.0, sunK)); mistU.uK.value = lerp(.5, .3, sunK); shadowAt(pos, 26);
    fishU.uFlash.value = .12; fishU.uAmb.value = .1; fishU.uTint.value.set('#2a2018');
    sheenU.uSun.value.copy(SK.sunDir.value); sheenU.uC.value.set('#ffd8a8').multiplyScalar(lerp(.5, .6, sunK)); sheenU.uK.value = 1; sheenU.uWide.value = .55; sheenU.uT.value = t; sheen.visible = true;
    const d = logd(12.7, 10.5, k), gapU = .56, cu = gapU - .05 * d - .1, c = pos.clone().addScaledVector(EAST, -d).addScaledVector(RIGHT, cu); c.y = lerp(.86, .8, k); const l = pos.clone().addScaledVector(RIGHT, gapU - .14).setY(lerp(1.3, 1.24, k)); setCam(c, l); film.dofCfg.focus = d; film.dofCfg.aperture = .32; }

  const GOLD = new Set(['a3', 'a5', 'a7', 'a8', 'b5', 'b6', 'b7', 'b8']);
  const STAGE = {
    a1: (t, T) => boatWide(t, key(T.N101, T.N103 + .45, t), lerp(.03, .07, key(T.N101, T.N103, t)), 1.12),
    a2: (t, T) => netHaul(t, ss(T.N103 + .1, T.N104 - .2, t), t - T.N103 + .45, false),
    a3: (t, T) => word(t, T), uwA: (t, T) => under(t, T, 'A'), tA: (t, T) => netStrain(t, T, 'A'), a5: (t, T) => fallB(t, T), a7: (t, T) => lift(t, T), a8: (t, T) => follow(t, T),
    b1: (t, T) => boatWide(t, lerp(.34, 1, key(T.N160, T.N161 + .45, t)), .03, 1.2),
    b2: (t, T) => netHaul(t, ss(T.N161 + .05, T.N162 - .15, t), t - T.N161 + .45, true),
    b3: (t, T) => far(t, T), uwB: (t, T) => under(t, T, 'B'), hB: (t, T) => netStrain(t, T, 'B'), b5: (t, T) => run(t, T), b6: (t, T) => fireShot(t, T), cy: (t, T) => courtShot(t, T), b7: (t, T) => dialog(t, T), b8: (t, T) => ending(t, T),
  };
  function render(name, t, T) { STAGE[name](t, T); waterU.uT.value = t; wakeU.uT.value = t; mistU.uT.value = t; ringU.uT.value = t; netU.uT.value = t; fishU.uT.value = t;
    cam.updateMatrixWorld(); sunLamp.pos.copy(cam.position).addScaledVector(SK.sunDir.value, 600); RU.uSunV.value.copy(SK.sunDir.value).transformDirection(cam.matrixWorldInverse); mistU.uSunV.value.copy(SK.sunDir.value);
    if (GOLD.has(name)) film.look.exposure *= .86; film._mirrorOff = name.startsWith('uw') || name === 'cy'; film.render(t); }

  // ---------------------------------------------------------------- the lens, after the frame (copied from galilee3d.js: god rays, corona)
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const gS = mkC(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkC(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) { const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h); const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 175) / 80); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; } gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h); gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 24; i++) { const sc = 1 + i * .05; gbx.globalAlpha = Math.pow(.9, i) * .15; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); } gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.imageSmoothingEnabled = true; ctx.drawImage(gB, 0, 0, W, H); ctx.restore(); }
  function corona(ctx, x, y, I, k, rings2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [r, cA, cB, a] of rings2) { const R0 = r * k * (.8 + .2 * I), g = ctx.createRadialGradient(x, y, 0, x, y, R0); g.addColorStop(0, `rgba(${cA},${Math.min(1, a * I)})`); g.addColorStop(.3, `rgba(${cB},${Math.min(1, a * I * .45)})`); g.addColorStop(1, `rgba(${cB},0)`); ctx.fillStyle = g; ctx.fillRect(x - R0, y - R0, R0 * 2, R0 * 2); } ctx.restore(); }
  const FIRE_RINGS = [[5, '255,244,214', '255,214,150', .16], [26, '255,204,136', '255,160,80', .42], [92, '255,170,96', '255,130,60', .17], [240, '255,150,80', '255,110,50', .06]];
  const SUN_RINGS = [[16, '255,255,252', '255,246,226', .9], [70, '255,244,214', '255,214,150', .55], [220, '255,214,160', '255,170,96', .24], [560, '255,190,130', '255,150,80', .1]];
  const project = p => { tmpV.copy(p).project(cam); if (tmpV.z >= 1 || tmpV.z <= -1) return null; return [(tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H, cam.position.distanceTo(p)]; };
  function blit(ctx, k) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore(); }
  // a shot's glow on the frame (fire halo, the sun's bloom) measured with that shot's camera
  const HAS_FIRE = new Set(['b3', 'b6', 'cy', 'b7', 'b8']), HAS_SUN = new Set(['a1', 'a3', 'a5', 'tA', 'hB', 'b1', 'b5', 'b7']);
  function overlayOf(name, t) { const o = {}; if (HAS_FIRE.has(name)) { const q = project(fireP.clone().setY(FY + .15).addScaledVector(EAST, .19)); if (q) o.fire = q; o.fk = fireU.uK.value; } if (HAS_SUN.has(name)) { const d = SK.sunDir.value, q = project(cam.position.clone().addScaledVector(d, 1500)); if (q && q[0] > -W * .4 && q[0] < W * 1.4) { o.sun = q; o.sunE = Math.asin(d.y) / D2R; } } return o; }
  function drawOver(ctx, o, t, name, kk) { if (kk <= .01) return; ctx.save(); ctx.globalAlpha = kk;
    if (o.fire) { const R = clamp(620 / o.fire[2], .3, 1.6), big = name === 'b6' || name === 'cy' ? 1.05 : .8; corona(ctx, o.fire[0], o.fire[1], (o.fk || 1) * (name === 'b3' ? .55 : .8), R * big, FIRE_RINGS); }
    if (name === 'b8' || name === 'a8') { const lg = ctx.createRadialGradient(-W * .12, H * .36, 0, -W * .12, H * .36, W * 1.05); lg.addColorStop(0, 'rgba(255,214,150,.5)'); lg.addColorStop(.45, 'rgba(255,190,120,.16)'); lg.addColorStop(1, 'rgba(255,170,100,0)'); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (o.sun && o.sunE > 2.4 && name !== 'b6') { const I = ss(2.4, 6, o.sunE) * (name === 'b7' ? 1 : .7); corona(ctx, o.sun[0], o.sun[1], I * .72, .9, SUN_RINGS); } ctx.restore(); }
  // ===== SWAP POINT (b6, N165): the black-and-white night courtyard over the charcoal fire, k = 0…1 of its dissolve. This is a stand-in. To use the
  // rooster block's real courtyard frame, either replace this function's body or, without editing it, call L.setCourtyard((ctx, t, k, { fx, fy }) => …):
  // it draws at opacity k; (fx, fy) is where the flame stands on screen, so the two fires match.
  let courtyardOverride = null;
  function drawCourtyardFlash(ctx, t, T, k) {
    if (courtyardOverride) { fireCam(t, T); cam.updateMatrixWorld(); const q = project(fireP.clone().setY(FY + .2)) || [W / 2, H / 2]; ctx.save(); courtyardOverride(ctx, t, k, { fx: q[0], fy: q[1] }); ctx.restore(); return; }
    render('cy', t, T); const oc = overlayOf('cy', t); blit(ctx, k);
    if (oc.fire) { const [fx, fy, fd] = oc.fire, rr = 90 + 760 / Math.max(2, fd), hg = ctx.createRadialGradient(fx, fy, rr * .12, fx, fy, rr); hg.addColorStop(0, `rgba(255,136,44,${k})`); hg.addColorStop(.5, `rgba(255,120,40,${.62 * k})`); hg.addColorStop(1, 'rgba(255,110,40,0)'); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'color'; ctx.fillStyle = hg; ctx.fillRect(fx - rr, fy - rr, rr * 2, rr * 2); ctx.restore(); }
    drawOver(ctx, oc, t, 'cy', k); }
  // the shot table → one or two rendered shots (a dissolve), then the lens
  function draw(ctx, t, T) {
    const on = T.shots.filter(s => t >= s[1] && t < s[2]); if (!on.length) on.push(t < T.shots[0][1] ? T.shots[0] : T.shots[T.shots.length - 1]);
    render(on[0][0], t, T); const o0 = overlayOf(on[0][0], t); blit(ctx, 1); drawOver(ctx, o0, t, on[0][0], 1); let o1 = null, k1 = 0;
    if (on.length > 1) { const s1 = on[1]; k1 = ss(s1[1], on[0][2], t); render(s1[0], t, T); o1 = overlayOf(s1[0], t); blit(ctx, k1); drawOver(ctx, o1, t, s1[0], k1); }
    // b6: the match on the flame — the night courtyard rises round the same fire, about two seconds, and goes
    if (T.f0 != null && t > T.f0 && t < T.f1 && on.some(s => s[0] === 'b6')) { const cK = ss(T.f0, T.f0 + .6, t) * (1 - ss(T.f1 - .65, T.f1, t)); if (cK > .002) drawCourtyardFlash(ctx, t, T, cK); }
    const r0 = on.find(s => HAS_SUN.has(s[0])); if (r0 && (o0.sun || (o1 && o1.sun))) { const os = o0.sun ? o0 : o1, wgt = (o0.sun ? 1 - k1 : 0) + (o1 && o1.sun ? k1 : 0); if (os.sun && os.sunE > 1) godRays(ctx, os.sun[0], os.sun[1], wgt * .3 * ss(1, 5, os.sunE)); }
  }
  // the checks (no render): the camera + what is being emitted, and the bone directions
  function probe(t, T) { const on = T.shots.filter(s => t >= s[3] && t < s[4]), nm = (on[0] || T.shots[T.shots.length - 1])[0]; STAGE[nm](t, T); cam.updateMatrixWorld(); const d = V(); cam.getWorldDirection(d);
    let em = 0; if (nm === 'a2' || nm === 'b2') em = DR.alive || 0; else if (nm === 'tA' || nm === 'hB') em = BU.m.visible ? (BU.alive || 0) : 0; else if (nm === 'b5') for (let i = 0; i < NSPR; i++) em += sprA[i] > 0 ? 1 : 0; else if (nm === 'b6' || nm === 'b7' || nm === 'cy') for (let i = 0; i < NSPK; i++) em += spA[i] > .05 ? 1 : 0; else if (nm.startsWith('uw')) for (let i = 0; i < NMO; i++) em += moA[i] > .05 ? 1 : 0;
    return { shot: nm, p: cam.position.toArray(), d: d.toArray(), fov: cam.fov, emit: em, focus: film.dofCfg.focus }; }
  function joints(t, T) { if (!_matePS) { PS.mate = mate; _matePS = true; } const on = T.shots.filter(s => t >= s[3] && t < s[4]), nm = (on[0] || T.shots[T.shots.length - 1])[0]; if (nm === 'cy') return {}; STAGE[nm](t, T); const out = {}, Y = V(0, 1, 0);
    for (const [k, g] of Object.entries(PS)) { if (!g.visible) continue; const U = g.userData; if (!U.arms[0].E) continue; const rec = {}; U.arms.forEach((A, i) => { rec['ua' + i] = A.E.clone().sub(A.S2 || A.S).normalize().toArray(); rec['fa' + i] = A.T.clone().sub(A.E).normalize().toArray(); }); (U.legs || []).forEach((L, i) => { rec['th' + i] = Y.clone().applyQuaternion(L.thigh.quaternion).toArray(); rec['sh' + i] = Y.clone().applyQuaternion(L.shin.quaternion).toArray(); }); rec.neck = [U.neck.rotation.x, U.neck.rotation.y]; rec.up = [U.upper.rotation.x, U.upper.rotation.y]; out[k] = rec; } return out; }
  return { film, draw, probe, joints, render, drawCourtyardFlash, setCourtyard: fn => { courtyardOverride = fn; } };
}

// ---------------------------------------------------------------- the sky (galilee3d.js skyDome, copied: kit.js sky() + a cloud cover)
function skyDome(film, o = {}) {
  const c = Object.assign({ top: col('#05070d', .2), mid: col('#101826', .25), horizon: col('#202838', .35), sunDir: V(0, -1, 0), sunColor: col('#fff1d0', 20), sunGlow: col('#ffcf8a', 1.2), clouds: 0, cloudColor: col('#ffffff', 1), cloudShade: col('#a0a8c0', .6), radius: 1800 }, o);
  const u = { ...film.fogU, top: { value: c.top }, mid: { value: c.mid }, horizon: { value: c.horizon }, sunDir: { value: c.sunDir.clone().normalize() }, sunColor: { value: c.sunColor }, sunGlow: { value: c.sunGlow },
    clouds: { value: c.clouds }, cloudColor: { value: c.cloudColor }, cloudShade: { value: c.cloudShade }, time: { value: 0 }, skyFogMax: { value: film.atmos.max }, cover: { value: 0 }, sunHide: { value: 0 }, domeK: { value: 1 } };
  const m = new THREE.ShaderMaterial({ uniforms: u, side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 0.)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.)).xyz, 1.); gl_Position = p.xyww; }`,
    fragmentShader: `varying vec3 vD; uniform vec3 top, mid, horizon, sunDir, sunColor, sunGlow, cloudColor, cloudShade; uniform float clouds, time, skyFogMax, cover, sunHide, domeK;
      ${GLSL.hash}
      ${FOG_GLSL}
      void main(){ vec3 d = normalize(vD); float y = d.y; vec3 c = mix(horizon, mid, smoothstep(-.02, .22, y)); c = mix(c, top, smoothstep(.2, .9, y));
        float s = max(dot(d, sunDir), 0.); c += (sunGlow * (pow(s, 8.) * .45 + pow(s, 30.) * .45 + pow(s, 400.) * 1.1) * (1. - sunHide) + sunColor * smoothstep(.9999, .99995, s) * (1. - sunHide));
        if (y > 0.){ vec2 p = d.xz / (y + .12) * 1.6 + vec2(time * .02, time * .007); float n = fbm(p * 1.3) * .7 + fbm(p * 3.7) * .3; float cv = clouds + cover; float m = smoothstep(.58 - min(cv, .62) * .3, .82 - min(cv, .62) * .22, n) * smoothstep(0., .2, y);
          vec3 cc = mix(cloudShade * (.75 + .25 * n), cloudColor, smoothstep(.45, .8, n + (fbm(p * 7.3) - .5) * .18)); cc += sunGlow * pow(s, 6.) * .6; c = mix(c, cc, m * .85 * domeK); }
        float T = fogT(cameraPosition, d, skyFogMax); c = c * T + fogCol(d) * (1. - T); gl_FragColor = vec4(c, 0.); }` });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(c.radius, 48, 24), m); mesh.frustumCulled = false; mesh.renderOrder = -10;
  film.onFrame((t, f) => { mesh.position.setFromMatrixPosition(f.camera.matrixWorld); u.time.value = t; });
  mesh.onBeforeRender = (r, s, cam) => { mesh.position.setFromMatrixPosition(cam.matrixWorld); mesh.updateMatrixWorld(); };
  film.scene.add(mesh); return { mesh, u };
}
