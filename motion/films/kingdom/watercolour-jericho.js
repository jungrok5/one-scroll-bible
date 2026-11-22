// watercolour-jericho.js — 「kingdom」 7부 「왕을 모신 사람들」 첫 블록 7-1 (film 735.8 → 767.8): 여리고, 돌무화과나무
//   C6 장 제목 「왕을 모신 사람들」 · N31 「그러면 그 왕을 모신 사람은, / 어떻게 살게 될까요?」 ·
//   N32 「여리고에 삭개오라는 세리장이 있었습니다. / 로마를 위해 세금을 걷는 부자였고, / 사람들은 그를 죄인이라 불렀습니다.」 ·
//   L12/Q18 눅 19:5 「삭개오야 속히 내려오라 / 내가 오늘 네 집에 유하여야 하겠다」
// Round 2 (coordinator 2026-11-22: round 1's flat 2D figures read as illustration/game) — rebuilt with the method this film already
// proved: 3D blocking (lib3d/cine.js, people3d.js robeMan figures with two-bone IK, idle life) + a watercolour pass fixed in the frame
// (after pastel-children.js's pass structure).
// Look: transparent watercolour — soft Kuwahara abstraction (washes laid in flat patches), the pigment pooled at every wash border
// (edge darkening), wet-edge bleed (the borders wander with a fixed low-frequency field), granulating cobalt in the shadows, uneven
// pigment, cotton-paper tooth; the lights are the paper left bare. A subtractive (glaze) colour model: pigment = 1 − colour/paper.
// BACKLIGHT: the late-afternoon sun low behind the sycamore's crown (cheated per shot onto the crown, a film habit), the leaves
// translucent and blooming, the crowd dark irregular silhouettes with warm rims, long shadows toward us.
// film_ref: 「보통 사람들」(1980, OPUSCAR 53, autumn transparent watercolour) + 「반지의 제왕: 왕의 귀환」 Alan Lee's watercolour aerial
// perspective; the channel's first film 「광야」 (motion/pilot/wilderness.html) is the watercolour bar.
// Skills read: cinecode styles/watercolor.md (paper is the white, transparent layering, darker = more passes), ink-water-emergence
// references/LOOK.md (wash, wet edge, rim), feeling-pastel / pastel-children.js (pass method), cinematic-3d (lib3d engine), cinecode
// references/camera-moves.md (push-in, crane up). Tree: a sycamore-fig grown by the recursion of tree3d-mustard.js makeTree()
// (copied and re-shaped: a short massive trunk, limbs spreading wide and low, a broad low crown); leaf cards + backlight term from the
// same file (leafGeo, the translucency term), copied.
// Shots (each one slow named move; cuts):
//   A0 735.8–739.0 C6   the road of Jericho between palms and mud-brick houses, the great sycamore on the right against the low sun,
//                       Moab's hills in the haze; the washes come in from the bare paper (1.2 s), slow PUSH-IN; the chapter title.
//   A1 739.0–745.2 N31  among the crowd's backs: CRANE UP from the heads into the sun-filled crown.
//   A2 745.2–758.8 N32  from the crowd up into the tree: a small rim-lit silhouette on a limb (rust head cloth the one colour accent) —
//                       slow PUSH-IN; he leans out to see; on 「사람들은 그를 죄인이라 불렀습니다」 heads below turn up to him (staggered).
//   A3 758.8–767.8 L12/Q18  low behind one man who has stopped in the road and looks up (Jesus: back view, mid distance, backlit, the
//                       same robe and head cloth as other men); slow PUSH-IN; the light pours through the branches onto Zacchaeus;
//                       on the verse's second half he climbs down (hands keep their grips, feet find the lower limb). Out: from
//                       N33 − 1.0 a deep-blue evening wash floods down the sheet (time passes) → night (7-2).
// API: const WJ = await (await import('./watercolour-jericho.js')).build(W, H); T = WJ.beats(B); WJ.draw(ctx, t, T)  t = FILM seconds.
//      B = { C6, N31, N32, L12, Q18, N33, pc: { N32: [piece starts], Q18: [piece starts] } }. Pure in t.
//      Checks: WJ.probe(t, T) → { shot, sx, sy, d } (the shot's subject on screen, its distance) · WJ.moteCount(t, T) · WJ.joints(t, T).
import { Film, THREE, V, col, rng } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const { clamp, lerp, ss } = P;
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
// a move that never stalls: speed lo + (1 − lo)·sin(πu) normalised — it starts and ends in motion and peaks mid-shot
const glide = (u, lo = .55) => { u = clamp(u); const k = 1 - lo; return (lo * u + k * (1 - Math.cos(Math.PI * u)) / Math.PI) / (lo + 2 * k / Math.PI); };
const face = (dx, dz) => Math.atan2(-dx, -dz);   // rotation.y that turns a figure (facing −z) toward (dx, dz)
const L3 = (a, b, k) => a.clone().lerp(b, k);

// ---------------------------------------------------------------- the one table: every visual time from the line times
export function beats(B) {
  const pc = B.pc || {}, n32 = pc.N32 || [B.N32, B.N32 + 4.4, B.N32 + 8.8], q18 = pc.Q18 || [B.Q18, B.Q18 + 3.4];
  const T = { start: B.C6, end: B.N33 };
  T.a0 = [B.C6, B.N31]; T.a1 = [B.N31, B.N32]; T.a2 = [B.N32, B.L12]; T.a3 = [B.L12, B.N33];
  T.paint = [B.C6, B.C6 + 1.25];                      // A0: the washes come in from the bare paper
  T.peek = [n32[0] + .9, n32[0] + 3.1];               // A2: he leans out to see (piece 1)
  T.shaft = [n32[0] + 1.4, n32[1] + 1.0];             // A2: a shaft of sun finds him
  T.sinner = n32[2];                                  // 「사람들은 그를 죄인이라 불렀습니다」: heads turn up to him (staggered)
  T.shrink = [n32[2] + 1.1, n32[2] + 2.9];            // … and he draws back a little
  T.stop = [B.L12, B.L12 + .9];                       // A3: the man in the road has just stopped (weight settles)
  T.look = [B.L12 + .1, B.Q18 + 1.6];                 // … his head lifts to look up into the tree
  T.pour = [B.L12 + .2, B.Q18 + 2.2];                 // the light pours through the branches onto Zacchaeus
  T.call = [B.Q18 + .1, B.Q18 + 2.5];                 // his right hand lifts a little (the call)
  T.down = [q18[1] + .15, q18[1] + 3.65];             // second half of the verse: Zacchaeus climbs down
  T.dusk = [B.N33 - 1.0, B.N33 - .02];                // out: the deep-blue evening wash floods down the sheet
  return T;
}

// ---------------------------------------------------------------- the sycamore-fig (after tree3d-mustard.js makeTree, re-shaped)
// world: the trunk stands at TR. Three named limbs carry Zacchaeus: SEAT (he sits on it), UPPER (his hand), LOWER (his feet).
const TR = V(3.6, 0, -20);
const LIMB = {
  seat: [V(-.15, 2.5, .2), V(-2.85, 3.62, 2.2), .25, .12],
  upper: [V(-.35, 2.65, .45), V(-1.95, 4.75, 1.65), .2, .1],
  lower: [V(-.2, 1.95, .25), V(-2.5, 2.42, 2.0), .23, .12],
};
const limbAt = (k, u) => TR.clone().add(L3(LIMB[k][0], LIMB[k][1], u));
const SEAT_U = .56, LOWER_U = .6, UPPER_U = .62;
function makeSycamore(seed = 23) {
  const R = rng(seed), segs = [], tips = [];
  const add = (a, b, r0, r1, lvl) => segs.push({ a: a.clone(), b: b.clone(), r0, r1, lvl });
  const DEPTH = 5;
  const branch = (p, dir, len, r, lvl) => {
    let q = p.clone(), d = dir.clone(); const n = lvl < 2 ? 5 : 3;
    for (let i = 0; i < n; i++) {
      const bend = V(R() - .5, (R() - .5) * .6, R() - .5).multiplyScalar(.34 + lvl * .04);
      d.add(bend).add(V(0, lvl < 2 ? .02 : -.03 * lvl, 0)).normalize();
      const e = q.clone().addScaledVector(d, len / n), r1 = Math.max(.014, r * (1 - .2 / n)); add(q, e, Math.max(r, .014), r1, lvl); q = e; r = r1; }
    if (lvl >= DEPTH) { tips.push({ p: q.clone(), d: d.clone() }); return; }
    const kids = R() < .5 ? 2 : 3;
    for (let k = 0; k < kids; k++) { const ax = V(R() - .5, R() - .3, R() - .5).normalize(); const nd = d.clone().applyAxisAngle(ax, .45 + R() * .45);
      const h = V(nd.x, 0, nd.z); if (h.lengthSq() > 1e-4) nd.addScaledVector(h.normalize(), .28);   // spread outward: a broad, low crown
      nd.y = clamp(nd.y, -.15, .62); nd.normalize(); branch(q.clone(), nd, len * (.7 + R() * .15), r * (.62 + R() * .08), lvl + 1); }
  };
  // a short massive trunk, flared at the root, forking at ~2.5 m
  const t0 = V(0, 0, 0), t1 = V(.08, 1.2, .03), t2 = V(-.05, 2.55, .05);
  add(t0, t1, .6, .46, 0); add(t1, t2, .46, .38, 0);
  // the named limbs (and the crown grows on from their ends)
  for (const k of ['seat', 'upper', 'lower']) { const [a, b, r0, r1] = LIMB[k]; add(a, b, r0, r1, 1); branch(b.clone(), b.clone().sub(a).normalize().add(V(0, .3, 0)).normalize(), 1.6, r1, 3); }
  // the other limbs: wide and low round the trunk, away from the named ones
  const az0 = Math.atan2(2.0, -2.7);
  for (let k = 0; k < 5; k++) { const az = az0 + Math.PI * (.45 + k * .3) + (R() - .5) * .2, out = 1.0 + R() * .25;
    branch(V(0, 2.4 + R() * .3, 0), V(Math.cos(az) * out, .7 + R() * .2, Math.sin(az) * out).normalize(), 2.6 + R() * .7, .3, 1); }
  return { segs, tips };
}
// a leaf card (copied from tree3d-mustard.js leafGeo): a cupped, tapering blade along +x
// (the width is clamped: a NaN width at x = −0 blacked out every leaf)
function leafGeo(L = .2, Wd = .11) {
  const g = new THREE.PlaneGeometry(L, Wd, 6, 2); g.translate(L / 2, 0, 0); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / L, y = p.getY(i); const w = Math.pow(Math.max(0, Math.sin(Math.PI * clamp(x * 1.02))), .8) * (1 - .25 * x); p.setY(i, y * Math.max(w, .04)); p.setZ(i, -(y * y) * 3 + x * x * .02); }
  g.computeVertexNormals(); return g;
}
function tubes(segs, sides) { const a = []; for (const g of segs) a.push(g.a.x, g.a.y, g.a.z, g.b.x, g.b.y, g.b.z, g.r0, g.r1); return K.tubesGeometry(a, sides); }

// ---------------------------------------------------------------- cameras (world metres): pos and look per shot, one glide each
function camAt(t, T) {
  if (t < T.a0[1]) { const p = glide((t - T.a0[0]) / (T.a0[1] - T.a0[0]), .7);
    return { shot: 'A0', pos: L3(V(-1.3, 2.6, 11), V(-1.1, 2.6, 8.6), p), look: L3(V(2.4, 4.6, -20), V(2.6, 4.7, -20), p), fov: 42 }; }
  if (t < T.a1[1]) { const p = glide((t - T.a1[0]) / (T.a1[1] - T.a1[0]), .5);
    return { shot: 'A1', pos: L3(V(.5, 1.62, -1), V(1.0, 5.4, -4.6), p), look: L3(V(1.7, 2.05, -22), V(3.0, 6.8, -21), p), fov: 42 }; }
  const S = limbAt('seat', SEAT_U);
  if (t < T.a2[1]) { const p = glide((t - T.a2[0]) / (T.a2[1] - T.a2[0]), .6);
    return { shot: 'A2', pos: L3(V(-.9, 2.25, -5.5), V(-.55, 2.6, -9.6), p), look: L3(S.clone().add(V(.15, .05, 0)), S.clone().add(V(.1, .12, 0)), p), fov: 40 }; }
  const p = glide((t - T.a3[0]) / (T.a3[1] - T.a3[0]), .6);
  return { shot: 'A3', pos: L3(V(2.05, 1.15, -4.9), V(1.9, 1.2, -6.1), p), look: L3(V(1.06, 2.2, -16.96), V(1.12, 2.45, -17.0), p), fov: 42 };
}
const SUBJ = { A0: V(3.6, 5, -20), A1: V(2.6, 4.5, -20), A2: null, A3: V(.55, 1.6, -14.9) };   // the subject point per shot (for the motion table)

const NOPASS = typeof location !== 'undefined' && /[?&]nopass=1/.test(location.search);   // debug: the 3D frame without the watercolour pass
export async function build(W, H) {
  const film = new Film({
    W, H, dur: 1e4, fov: 42, near: .05, far: 4000,
    atmos: { density: .0035, falloff: .03, base: 0, start: 8, color: col('#e8bc8a', .72), colorUp: col('#d8c0a0', .6), max: 2600, scatter: 1, anisotropy: .82, phaseMix: .88 },
    bloom: { strength: .09, radius: 1.1, tint: col('#ffe6bc') },
    dof: { focus: 14, aperture: 2.2, maxCoc: 16 },
    look: { exposure: 1.0, contrast: 1.0, saturation: .95, lift: col('#141016'), shadowTint: col('#c8c8e6'), highTint: col('#fff2dc'), vignette: .22, grain: 0, ca: .15 },
  });
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither (no per-frame shimmer)
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera, R = film.renderer;
  R.shadowMap.type = THREE.VSMShadowMap;

  // ---------------------------------------------------------------- light: the sun low behind the crown (aimed per shot)
  const SUN = V(0, .2, -1).normalize();
  const sky = K.sky(film, { top: col('#5e78a6', .58), mid: col('#d8b48a', .9), horizon: col('#f4cc98', 1.35), sunDir: SUN, sunColor: col('#fff6e2', 5), sunGlow: col('#ffd696', 1.25), clouds: .12, cloudColor: col('#ffe8c8', 1.1), cloudShade: col('#b49a88', .7) });
  const hemi = new THREE.HemisphereLight(col('#c4cce0'), col('#9a7656'), 1.0); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffd8a4'), 3.2); sunL.castShadow = true; sunL.shadow.mapSize.set(4096, 4096);
  Object.assign(sunL.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 40, far: 260 }); sunL.shadow.bias = -.0003; sunL.shadow.normalBias = .03; sunL.shadow.radius = 12; sunL.shadow.blurSamples = 16;
  S.add(sunL, sunL.target); sunL.target.position.copy(TR).add(V(-2, 0, 4));
  const sunLamp = film.lamp(V(0, 0, 0), '#ffd49c', { power: 1700, size: 60, fog: 1 });
  function aimSun(from, at) { SUN.copy(at).sub(from).normalize(); sky.u.sunDir.value.copy(SUN); sunL.position.copy(sunL.target.position).addScaledVector(SUN, 150); sunLamp.pos.copy(from).addScaledVector(SUN, 1500); }

  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;

  // ---------------------------------------------------------------- land: the road of Jericho, dust, the Moab hills in the haze
  const groundM = new THREE.MeshStandardMaterial({ color: '#c9a47a', roughness: 1 });
  groundM.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;\n' + hashGLSL)
      .replace('#include <map_fragment>', `#include <map_fragment>
        { vec2 q = vWP.xz; float n = fb(q * .2), road = 1. - smoothstep(2.6, 4.2, abs(vWP.x - .3 + sin(vWP.z * .04) * .6));
          vec3 c = diffuseColor.rgb * mix(.82, 1.06, n); c = mix(c, c * vec3(1.06, 1.02, .95), road * .6);
          c = mix(c, vec3(.52, .54, .36), smoothstep(.56, .78, fb(q * .5 + 9.)) * (1. - road) * .45); diffuseColor.rgb = c; }`); };
  groundM.customProgramCacheKey = () => 'wj-ground';
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, 240, 240).rotateX(-Math.PI / 2), groundM); g.receiveShadow = true; film.ground(g); S.add(g); }
  { const hm = new THREE.MeshStandardMaterial({ color: '#8a7a8c', roughness: 1 }), RR = rng(31);
    for (const [z, hgt, n] of [[-700, 70, 1], [-1300, 150, 2]]) { const N = 160, w = 7000, pos = [], idx = [], ph = RR() * 9;
      for (let i = 0; i <= N; i++) { const x = -w / 2 + w * i / N, y = hgt * (.6 + .25 * Math.sin(x * .0018 * n + ph) + .15 * Math.sin(x * .006 + ph * 2)); pos.push(x, -2, z, x, y, z - 40); }
      for (let i = 0; i < N; i++) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); S.add(new THREE.Mesh(geo, hm)); } }

  // ---------------------------------------------------------------- houses (mud brick, flat roofs) and the palms of Jericho
  const wallM = (c, key) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: .95 });
    m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;\n' + hashGLSL).replace('#include <map_fragment>', `#include <map_fragment>
        { float big = fb(vWP.xy * .3 + vWP.zz * .3); diffuseColor.rgb *= mix(.84, 1.08, big); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(.7, .62, .6), (1. - smoothstep(.2, 1.2, vWP.y)) * .5); }`); };
    m.customProgramCacheKey = () => 'wj-wall-' + key; return m; };
  const WM = [wallM('#d6b48a', 'a'), wallM('#c8a078', 'b'), wallM('#ddc29c', 'c')], darkM = K.std('#3a2a26', { roughness: 1 }), roofM = K.std('#8a6e56', { roughness: .95 });
  const RH = rng(5151);
  const house = (x, z, w, d, h, side) => { const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g); const m = WM[(RH() * 3) | 0];
    const box = (bw, bh, bd, px, py, pz, mat) => { const b = new THREE.Mesh(K.roundedBox(bw, bh, bd, .08, 2), mat); b.position.set(px, py, pz); b.castShadow = b.receiveShadow = true; g.add(b); };
    box(w, h, d, 0, h / 2, 0, m); box(w + .16, .2, d + .16, 0, h + .05, 0, roofM); for (const s2 of [-1, 1]) box(w, .35, .14, 0, h + .3, s2 * d / 2, m);
    if (RH() < .45) box(w * .45, h * .55, d * .5, (RH() - .5) * w * .3, h + h * .27, (RH() - .5) * d * .3, m);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(.95, 1.85), darkM); door.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; door.position.set(side < 0 ? w / 2 + .012 : -w / 2 - .012, .93, (RH() - .5) * d * .4); g.add(door); };
  for (const side of [-1, 1]) { let z = 40; while (z > -140) { const w = 5 + RH() * 3.5, d = 6 + RH() * 3, h = 2.8 + RH() * 1.6, x = side * (6.2 + w / 2 + RH() * 1.5);
    if (!(side > 0 && z < -8 && z > -32)) house(x, z - d / 2, w, d, h, side);   // the open ground where the sycamore stands
    z -= d + 1.5 + RH() * 4; } }
  // palms: a ringed trunk on a gentle curve, a crown of long drooping fronds (leaf blades)
  const palmTrunkM = K.std('#6e5a48', { roughness: .95 }), frondM = new THREE.MeshStandardMaterial({ color: '#5a6a3a', roughness: .7, side: THREE.DoubleSide });
  const frondGeo = leafGeo(3.0, .36), palms = [], RP = rng(77);
  const palm = (x, z, h, lean) => { const segs = [], N = 7; let prev = V(x, 0, z);
    for (let i = 1; i <= N; i++) { const u = i / N, p = V(x + lean[0] * u * u, h * u, z + lean[1] * u * u); segs.push({ a: prev, b: p, r0: .2 - .06 * (i - 1) / N, r1: .2 - .06 * i / N }); prev = p; }
    const m = new THREE.Mesh(tubes(segs, 7), palmTrunkM); m.castShadow = true; S.add(m); palms.push({ top: prev, n: 18 + (RP() * 5 | 0) }); };
  for (let i = 0; i < 70; i++) { const side = RP() < .5 ? -1 : 1, x = side * (7 + RP() * 30), z = 30 - RP() * 160; if (side > 0 && z < -6 && z > -34 && x < 14) continue; if (z < -24 && z > -90 && x > -6 && x < 22) continue; palm(x, z, 8 + RP() * 8, [(RP() - .5) * 2.5, (RP() - .5) * 2]); }
  for (const [x, z, h, l] of [[-7.2, 10, 10.5, [.8, .3]], [-8.5, -3, 12, [-.6, .4]], [-6.6, -26, 9.5, [.5, -.4]]]) palm(x, z, h, l);
  { const n = palms.reduce((s, p) => s + p.n, 0), inst = new THREE.InstancedMesh(frondGeo, frondM, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); let k = 0;
    for (const p of palms) for (let i = 0; i < p.n; i++) { const az = i / p.n * Math.PI * 2 + RP() * .3, droop = -.3 - RP() * .8;
      e.set(0, az, droop, 'YZX'); q.setFromEuler(e); m4.compose(p.top, q, V(1, 1, 1).multiplyScalar(.8 + RP() * .4)); inst.setMatrixAt(k, m4); inst.setColorAt(k, new THREE.Color('#ffffff').multiplyScalar(.7 + RP() * .5)); k++; }
    inst.castShadow = true; S.add(inst); }

  // ---------------------------------------------------------------- the sycamore-fig
  const TREE = makeSycamore(23);
  const bark = new THREE.MeshStandardMaterial({ color: '#7a6a52', roughness: .92 });
  bark.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vBW;').replace('#include <project_vertex>', '#include <project_vertex>\nvBW = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vBW;\n' + hashGLSL).replace('#include <map_fragment>', `#include <map_fragment>
      { float rid = vn(vec2(vBW.x * 7. + vBW.z * 7., vBW.y * 1.4)); diffuseColor.rgb *= mix(.66, 1.12, rid); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.42, .44, .32), smoothstep(.6, .85, fb(vBW.xy * 1.3)) * .4); }`); };
  bark.customProgramCacheKey = () => 'wj-bark';
  { const big = TREE.segs.filter(g => g.r0 >= .05), small = TREE.segs.filter(g => g.r0 < .05), g = new THREE.Group(); g.position.copy(TR);
    for (const [ss2, sides] of [[big, 10], [small, 5]]) { const m = new THREE.Mesh(tubes(ss2, sides), bark); m.castShadow = m.receiveShadow = true; g.add(m); } S.add(g); }
  // leaves: broad sycamore-fig leaves in clusters at the twig ends and along the outer branches; the backlight shines through them
  const LR = rng(19), leafPts = [];
  for (const tp of TREE.tips) { const n = 46 + (LR() * 16 | 0); for (let i = 0; i < n; i++) leafPts.push(tp.p.clone().add(V(LR() - .5, (LR() - .35) * .9, LR() - .5).multiplyScalar(1.5))); }
  for (const g of TREE.segs) if (g.lvl >= 2 && g.r0 < .12) for (let c = 0; c < 2; c++) { const p = L3(g.a, g.b, LR()).add(V(0, .25, 0)); for (let i = 0; i < 12; i++) leafPts.push(p.clone().add(V(LR() - .5, (LR() - .3) * .7, LR() - .5).multiplyScalar(1.1))); }
  // keep a window round where he sits (so he is half hidden, not buried) and clear the camera paths
  const seatW = limbAt('seat', SEAT_U).sub(TR);
  const kept = leafPts.filter(p => p.distanceTo(seatW.clone().add(V(0, .5, 0))) > .75);
  const leafMat = new THREE.MeshStandardMaterial({ roughness: .62, side: THREE.DoubleSide, color: '#ffffff' });
  const LU = { uSunV: { value: V() }, uSunC: { value: col('#ffdc9a', 1) }, uTrans: { value: 1 } };
  leafMat.onBeforeCompile = sh => { Object.assign(sh.uniforms, LU);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunV, uSunC; uniform float uTrans;').replace('#include <opaque_fragment>', `{ float bk = max(dot(normalize(-vViewPosition), uSunV), 0.);
        outgoingLight += diffuseColor.rgb * uSunC * (.32 + pow(bk, 4.) * .8 + pow(bk, 16.) * 1.8) * uTrans; }
      #include <opaque_fragment>`); };   // (the translucency term copied from tree3d-mustard.js)
  leafMat.customProgramCacheKey = () => 'wj-leaf';
  const leaves = new THREE.InstancedMesh(leafGeo(.24, .19), leafMat, kept.length);
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), cols = ['#4a6a2a', '#5a7a30', '#647c34', '#42602a', '#6e7e3a'];
    kept.forEach((p, i) => { e.set((LR() - .5) * 2.4, LR() * Math.PI * 2, (LR() - .3) * 1.6); q.setFromEuler(e); const s = .8 + LR() * .6; m.compose(p.clone().add(TR), q, V(s, s, s)); leaves.setMatrixAt(i, m);
      leaves.setColorAt(i, new THREE.Color(cols[(LR() * cols.length) | 0]).multiplyScalar(.75 + LR() * .4)); }); }
  leaves.castShadow = true; leaves.receiveShadow = true; S.add(leaves);

  // ---------------------------------------------------------------- people (robeMan bodies; backlit, mid/far — never close)
  const robes = ['#9a6a54', '#5a6a88', '#a8885c', '#7a8068', '#b89a7c', '#8a5a5a', '#6a5a7a', '#c0a888', '#7a6a58', '#94785e', '#6a7a6a'];
  const RM = robes.map(c => K.std(c, { roughness: .95, side: THREE.DoubleSide }));
  const CM = ['#d8c8a8', '#c8b090', '#e0d0b8', '#b8a080', '#a89878'].map(c => K.std(c, { roughness: .95, side: THREE.DoubleSide }));
  const faceM = K.std('#4a3022', { roughness: .9 }), hairM = K.std('#22160e', { roughness: 1 });
  const RIM = { uSunV: LU.uSunV, uRimC: { value: col('#ffd8a0', 1.1) } };
  const rimify = m => { m.onBeforeCompile = sh => { Object.assign(sh.uniforms, RIM);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunV, uRimC;').replace('#include <opaque_fragment>', `{ vec3 vd = normalize(vViewPosition); float fr = pow(1. - abs(dot(normalize(vNormal), vd)), 4.);
        float bk = max(dot(-vd, uSunV), 0.); outgoingLight = outgoingLight * .72 + uRimC * fr * (.03 + 1.1 * pow(bk, 3.)); }
      #include <opaque_fragment>`); }; m.customProgramCacheKey = () => 'wj-rim'; return m; };
  [...RM, ...CM].forEach(rimify);
  const adult = o => { const g = P.robeMan({ face: faceM, head: 'cloth', ...o }); if (o.turban) P.headwear(g, 'turban', { mat: o.cloth, dark: hairM }); else P.headwear(g, 'cloth', { dark: hairM }); return g; };
  const woman = o => P.robeMan({ face: faceM, head: 'veil', ...o });
  const child = o => { const g = P.robeMan({ face: faceM, child: true, head: o.girl ? 'veil' : 'cloth', ...o }); if (!o.girl) { P.headwear(g, 'bare', { dark: hairM }); const n = g.userData.neck; n.remove(n.children[n.children.length - 1]); } return g; };
  const crowd = [], JP = V(.55, 0, -14.9);   // where Jesus stops in A3 (the crowd leaves him room)
  { const RC = rng(4242), pts = [];
    for (let tries = 0; tries < 4000 && pts.length < 64; tries++) { const x = -4.6 + RC() * 9.6, z = -6.5 - RC() * 19;
      if (Math.hypot(x - TR.x, z - TR.z) < 1.5 || Math.hypot(x - JP.x, z - JP.z) < 1.5) continue;
      if (pts.some(p => Math.hypot(p[0] - x, p[1] - z) < .62)) continue;
      if (z > -9 && RC() < .55) continue;   // fewer right in front of the lens
      if (Math.hypot(x - 1.95, z + 5.5) < 2.6 || Math.hypot(x + .7, z + 7.5) < 2.2) continue;   // clear of the A3 / A2 cameras
      pts.push([x, z]); }
    pts.forEach(([x, z], i) => { const r = RC(), ph = RC(); let g;
      if (r < .14) g = child({ h: .98 + RC() * .3, mat: RM[(RC() * RM.length) | 0], cloth: CM[(RC() * 5) | 0], girl: RC() < .4 });
      else if (r < .34) g = woman({ h: 1.56 + RC() * .1, mat: RM[(RC() * RM.length) | 0], cloth: CM[(RC() * 5) | 0] });
      else g = adult({ h: 1.64 + RC() * .2, mat: RM[(RC() * RM.length) | 0], cloth: CM[(RC() * 5) | 0], broad: .98 + RC() * .1, turban: RC() < .2 });
      // facing: toward the road and the tree (they wait for Him to pass), each a little differently; a few turned to a neighbour
      const toward = face(TR.x - 1.5 - x, TR.z + 3 - z) * .5 + face(0, -1) * .5 + (RC() - .5) * .7 + (RC() < .12 ? (RC() < .5 ? 1.4 : -1.4) : 0);
      g.position.set(x, 0, z); g.rotation.y = toward; g.userData.ph = ph; g.userData.i = i; S.add(g); crowd.push(g); });
    // two children on their fathers' shoulders (they want to see too)
    let nk = 0; for (const g of crowd) { if (nk >= 2) break; const U = g.userData; if (U.s < .93 || U.kind !== 'stand' || g.position.z > -12) continue;
      const c = P.robeMan({ h: .95, mat: RM[(nk * 3 + 2) % RM.length], face: faceM, child: true, kind: 'sit', head: 'cloth' }); P.headwear(c, 'bare', { dark: hairM }); { const n = c.userData.neck; n.remove(n.children[n.children.length - 1]); }
      c.position.set(0, U.torsoH + .12 * U.s, .14 * U.s); U.upper.add(c); U.rider = c; c.userData.ph = .3 + nk * .4; nk++; } }
  // the live heads (A2): those near the tree turn up toward him when the people call him a sinner — staggered, eased
  const seatP = limbAt('seat', SEAT_U);
  const LIVE = crowd.filter(g => g.position.z < -12 && g.position.z > -23 && Math.abs(g.position.x - seatP.x) < 3.4 && g.userData.kind === 'stand').slice(0, 9);
  LIVE.forEach((g, i) => { g.userData.turnAt = [.2, .65, 1.0, 1.4, .45, 1.8, 1.2, 2.1, .85][i]; });
  // Jesus (A3): back view, the same undyed oatmeal robe and grey-brown head cloth as other men
  const jesus = adult({ h: 1.76, mat: rimify(K.std('#c8b694', { roughness: .95, side: THREE.DoubleSide })), cloth: rimify(K.std('#8a7a66', { roughness: .95, side: THREE.DoubleSide })), broad: 1.03 });
  jesus.position.copy(JP); jesus.visible = false; S.add(jesus);
  // Zacchaeus: a small man (1.45 m), a rust-red head cloth (the one colour accent), a deep blue-grey robe, an ochre-brown mantle
  const rust = rimify(K.std('#8a3b24', { roughness: .9, side: THREE.DoubleSide }));
  const zac = P.robeMan({ h: 1.45, mat: rimify(K.std('#3a4e68', { roughness: .9, side: THREE.DoubleSide })), cloth: rimify(K.std('#96683e', { roughness: .9, side: THREE.DoubleSide })), face: faceM, head: 'cloth', broad: 1.04 });
  P.headwear(zac, 'cloth', { dark: hairM });
  zac.userData.neck.children.forEach((o, i) => { if (i > 0 && o.material !== hairM) o.material = rust; });   // the head cloth (cap and falls) in rust
  S.add(zac);
  S.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // ---------------------------------------------------------------- Zacchaeus' pose: seated on the limb → climbing down onto the lower limb
  // root frame: facing out from the trunk over the road; hands hold the limbs (world grips → root frame), feet hang, then stand.
  const ZFACE = face(-.55, .85), seatTop = seatP.clone().add(V(0, LIMB.seat[2] * .55 + .02, 0));
  const gripL = limbAt('seat', SEAT_U + .1).add(V(0, .13, 0)), gripR = limbAt('upper', UPPER_U).add(V(0, -.05, 0));
  const standP = limbAt('lower', LOWER_U).add(V(0, .12, 0));
  const zs = zac.userData.s, sitRoot = seatTop.y - .44 * zs - .05;
  const toLocal = (g, w) => { g.updateMatrix(); return w.clone().applyMatrix4(g.matrix.clone().invert()); };
  function zacPose(t, T, shot) {
    const id = P.idle(t, .37, { s: zs });
    let k = 0, lean = 0, headP = 0, headY = 0;
    if (shot === 'A3') { const u = clamp((t - T.down[0]) / (T.down[1] - T.down[0])); k = eio((u - .15) / .75); const lk = eio((t - T.look[0]) / (T.look[1] - T.look[0]));
      headP = -.35 * lk * (1 - k) - .25 * k; headY = .25 * lk * (1 - k); lean = -.18 * lk * (1 - k) - .1 * Math.sin(Math.PI * k); }
    else { const pk = eio((t - T.peek[0]) / (T.peek[1] - T.peek[0])), sk = eio((t - T.shrink[0]) / (T.shrink[1] - T.shrink[0]));
      lean = -.22 * pk + .16 * sk; headP = -.35 * pk + .25 * sk; headY = .1 * pk; }
    const sit = P.rockSit(.44 * zs, zs, { tuck: .06, lean: 0 });
    // the root slides from the seat to the lower limb (k), out a little toward the road as he lets himself down
    const root = L3(V(seatTop.x, sitRoot, seatTop.z), V(standP.x, standP.y, standP.z), k);
    zac.position.copy(root); zac.rotation.y = ZFACE + .25 * Math.sin(Math.PI * k);
    const feet = sit.feet.map((f, i) => ({ u: lerp(f.u, id.feet[i].u, k), lift: 0, x: lerp(f.x || 0, 0, k) }));
    const hands = [toLocal(zac, gripL), toLocal(zac, gripR)];
    const handsW = shot === 'A3' ? [1, 1] : [1, 1];
    P.pose(zac, { ...id, bob: lerp(sit.bob, id.bob, k), lean: lean + lerp(sit.lean, -.02, k), feet, head: [headP, headY], hands, handsW, swing: [0, 0] });
  }
  // Jesus' pose: he has just stopped (the last step settles), lifts his head to the tree, his right hand rises a little on the call
  function jesusPose(t, T) {
    const s = jesus.userData.s, id = P.idle(t, .2, { s }), st = eio((t - T.stop[0]) / (T.stop[1] - T.stop[0])), lk = eio((t - T.look[0]) / (T.look[1] - T.look[0]));
    const ck = eio((t - T.call[0]) / (T.call[1] - T.call[0])) * (1 - .55 * eio((t - T.call[1] - 2.4) / 2.4));
    jesus.position.copy(JP); jesus.rotation.y = face(seatP.x - JP.x, seatP.z - JP.z);
    const feet = [{ u: lerp(.2 * s, id.feet[0].u, st), lift: 0 }, { u: lerp(-.18 * s, id.feet[1].u, st), lift: 0 }];
    const hand = V(.3 * s, 1.02 * s, -.3 * s);   // (root frame) forward, a little out, at chest height — an open hand toward him
    P.pose(jesus, { ...id, feet, bob: lerp(-.015 * s, id.bob, st), lean: lerp(-.04, -.01, st) + .04 * lk, head: [.55 * lk, 0], hands: [null, hand], handsW: [0, ck] });
  }
  function crowdPose(t, T, shot) {
    for (const g of crowd) { const U = g.userData, id = P.idle(t, U.ph, { s: U.s });
      let head = id.head; if (U.turnAt != null && (shot === 'A2' || shot === 'A3')) { const k = shot === 'A3' ? 1 : eio((t - T.sinner - U.turnAt) / 1.5);
        const d = seatP.clone().sub(g.position), yaw = Math.atan2(-d.x, -d.z) - g.rotation.y, yw = Math.atan2(Math.sin(yaw), Math.cos(yaw));
        head = [lerp(id.head[0], .45, k), lerp(id.head[1], clamp(yw, -.9, .9), k)]; }
      if (shot === 'A3' && U.turnAt == null && U.i % 3 === 0) head = [.25, id.head[1]];   // in A3 people look to the man who stopped and to the tree
      P.pose(g, { ...id, head });
      if (U.rider) P.pose(U.rider, { ...P.idle(t, U.rider.userData.ph, { s: U.rider.userData.s }), hands: [null, null] }); }
  }

  // ---------------------------------------------------------------- the watercolour pass (fixed in the frame)
  const FS = (frag, uniforms) => { const m = new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    const sc = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); q.frustumCulled = false; sc.add(q); return { m, sc, u: m.uniforms }; };
  const ocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const rtA = new THREE.WebGLRenderTarget(film.w, film.h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const rtB = new THREE.WebGLRenderTarget(film.w, film.h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  // pass 1: abstraction — a soft Kuwahara (radius 5) sampled through a fixed wet-edge wobble, so the washes are flat patches whose borders wander
  const kuwP = FS(`varying vec2 vUv; uniform sampler2D tIn; uniform vec2 px; ${hashGLSL}
    void main(){ vec2 p = gl_FragCoord.xy; vec2 wob = (vec2(fb(p * .0045), fb(p * .0045 + 7.3)) - .5) * 9. + (vec2(vn(p * .05), vn(p * .05 + 3.)) - .5) * 2.2;
      vec2 uv = vUv + wob * px; const int R = 5; vec3 m[4]; vec3 s2[4]; for (int k = 0; k < 4; k++){ m[k] = vec3(0.); s2[k] = vec3(0.); }
      for (int y = 0; y <= R; y++) for (int x = 0; x <= R; x++){
        vec3 a = texture2D(tIn, uv + vec2(-x, -y) * px).rgb, b = texture2D(tIn, uv + vec2(x, -y) * px).rgb, c = texture2D(tIn, uv + vec2(x, y) * px).rgb, d = texture2D(tIn, uv + vec2(-x, y) * px).rgb;
        m[0] += a; s2[0] += a * a; m[1] += b; s2[1] += b * b; m[2] += c; s2[2] += c * c; m[3] += d; s2[3] += d * d; }
      float n = float((R + 1) * (R + 1)), best = 1e9; vec3 col = vec3(0.);
      for (int k = 0; k < 4; k++){ vec3 mu = m[k] / n, v = abs(s2[k] / n - mu * mu); float sv = v.r + v.g + v.b; if (sv < best){ best = sv; col = mu; } }
      gl_FragColor = vec4(col, 1.); }`, { tIn: { value: null }, px: { value: new THREE.Vector2(1 / film.w, 1 / film.h) } });
  // pass 2: the glaze — pigment = 1 − colour/paper, quantised softly into a few laid washes, uneven, pooled at the wash borders (edge
  // darkening), granulating in the shadows, the paper's tooth; the lights go to bare paper; a paint-in mask (A0) and a cool shade tint
  const wcP = FS(`varying vec2 vUv; uniform sampler2D tIn; uniform vec2 px; uniform vec3 paper; uniform float reveal; ${hashGLSL}
    float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
    void main(){ vec2 p = gl_FragCoord.xy; vec3 c = texture2D(tIn, vUv).rgb;
      // borders of the washes (on the abstracted image): a small Sobel of luminance at two radii
      float gx = 0., gy = 0.;
      for (int i = -1; i <= 1; i++){ float a = lum(texture2D(tIn, vUv + vec2(2.5, float(i) * 2.5) * px).rgb), b = lum(texture2D(tIn, vUv + vec2(-2.5, float(i) * 2.5) * px).rgb);
        float cc = lum(texture2D(tIn, vUv + vec2(float(i) * 2.5, 2.5) * px).rgb), d = lum(texture2D(tIn, vUv + vec2(float(i) * 2.5, -2.5) * px).rgb); gx += a - b; gy += cc - d; }
      float edge = smoothstep(.05, .32, length(vec2(gx, gy)) * .5);
      vec3 pig = clamp(1. - c / paper, 0., 1.);
      float L = lum(c);
      // the lights are bare paper (the pigment lifts away)
      pig *= smoothstep(.93, .7, L / lum(paper));
      // a few laid washes: soft quantisation of the pigment density (darker = more passes)
      float pd = max(pig.r, max(pig.g, pig.b)); float q = floor(pd * 5. + .5) / 5.; pig *= mix(1., q / max(pd, .02), .32 * smoothstep(.22, .4, pd));   // (not in the pale sky: no rings round the sun)
      // uneven pigment (fixed), the tooth of the cotton paper
      float un = fb(p * .0035 + 4.) * .7 + fb(p * .012) * .3, tooth = vn(p * .45) * .6 + vn(p * .13 + 2.) * .4;
      pig *= mix(.82, 1.14, un) * mix(.9, 1.05, tooth);
      // edge darkening: the pigment pools where a wash ends (stronger on the dark side of the border), broken by the tooth
      pig += edge * (.07 + .28 * pd) * mix(.6, 1.1, tooth) * (pig / max(pd, .05) * .7 + .3);
      // blooms: where a wetter wash ran back into a drying one — a lighter blot ringed by a darker tide line (fixed in the frame)
      float bl = fb(p * .0052 + 11.) + (vn(p * .04) - .5) * .06, mid = smoothstep(.3, .45, pd) * smoothstep(.85, .6, pd);
      pig *= 1. - .1 * smoothstep(.56, .6, bl) * mid; pig += vec3(.07, .06, .05) * smoothstep(.022, .0, abs(bl - .56)) * mid;
      // granulation in the shadows: pigment settling in the tooth's hollows, cobalt-ish
      float gr = smoothstep(.62, .9, vn(p * .7 + 9.) * .6 + vn(p * .23) * .4), shade = smoothstep(.35, .8, pd);
      pig += gr * shade * vec3(.14, .11, .05);
      // the shadows lean cobalt-violet, never grey (a transparent cobalt glaze over the deep parts)
      pig = mix(pig, pig * vec3(1.08, 1.02, .86) + vec3(.0, .015, .05) * shade, shade * .6);
      // the underpainting: one warm-grey glaze laid over the whole sheet first (only the sun's core stays bare paper)
      pig = pig + vec3(.17, .2, .26) * (1. - smoothstep(.9, .99, L / lum(paper))) * (1. - pig);
      pig = min(pig, vec3(.82));
      vec3 o = paper * (1. - clamp(pig, 0., 1.)) * mix(.97, 1.0, tooth);
      // the paint-in (A0): the washes come in from bare paper, the darks last, through a wet wandering front
      float wet = fb(p * .003 + 1.7) * .5 + .25, rv = smoothstep(wet - .18, wet + .18, reveal * 1.3 - pd * .3);
      o = mix(paper * mix(.97, 1., tooth), o, rv);
      gl_FragColor = vec4(o, 1.); }`, { tIn: { value: null }, px: { value: new THREE.Vector2(1 / film.w, 1 / film.h) }, paper: { value: new THREE.Vector3(.965, .935, .872) }, reveal: { value: 1 } });
  const realSRT = R.setRenderTarget.bind(R);
  function renderAll(t, reveal) {
    if (window.__NOREN) return;
    R.setRenderTarget = (tg, ...a) => realSRT(tg === null ? rtA : tg, ...a);
    try { film.render(t); } finally { R.setRenderTarget = realSRT; }
    if (NOPASS) { film.copyLinear(rtA.texture, null); return; }
    kuwP.u.tIn.value = rtA.texture; realSRT(rtB); R.render(kuwP.sc, ocam);
    wcP.u.tIn.value = rtB.texture; wcP.u.reveal.value = reveal; realSRT(null); R.render(wcP.sc, ocam);
  }

  // ---------------------------------------------------------------- a frame
  const SUNAT = { A0: V(3.0, 6.6, -21), A1: V(3.2, 7.4, -21.5), A2: limbAt('seat', SEAT_U).add(V(.7, 1.9, -3)), A3: limbAt('seat', SEAT_U).add(V(.9, 2.6, -3.2)) };
  function setCam(c) { cam.position.copy(c.pos); cam.up.set(0, 1, 0); cam.lookAt(c.look); cam.fov = c.fov; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); }
  function frame(t, T) {
    const c = camAt(t, T); setCam(c);
    // the sun behind the crown on the shot's axis (A1: it rides up with the crane into the crown)
    const sa = c.shot === 'A1' ? L3(V(2.6, 4.6, -22), SUNAT.A1, glide((t - T.a1[0]) / (T.a1[1] - T.a1[0]), .5)) : SUNAT[c.shot];
    aimSun(c.pos, sa); LU.uSunV.value.copy(SUN).transformDirection(cam.matrixWorldInverse);
    const fade = c.shot === 'A3' ? 1 - ss(T.dusk[0], T.dusk[1] - .2, t) : 1;
    const pour = c.shot === 'A3' ? eio((t - T.pour[0]) / (T.pour[1] - T.pour[0])) : c.shot === 'A2' ? ss(T.shaft[0], T.shaft[1], t) : 0;
    sunLamp.power = (1500 + 900 * pour) * fade; sunL.intensity = 3.2 * fade; LU.uTrans.value = (1 + .35 * pour) * fade + .1;
    jesus.visible = c.shot === 'A3'; zac.visible = c.shot !== 'A0';
    // A3: the crowd has drawn back round him — a clear way from the lens to the man in the road (no one stands in that line)
    const segD = (q, A, B) => { const ax = B.x - A.x, az = B.z - A.z, k = clamp(((q.x - A.x) * ax + (q.z - A.z) * az) / (ax * ax + az * az)); return Math.hypot(q.x - A.x - ax * k, q.z - A.z - az * k); };
    for (const g of crowd) g.visible = !(c.shot === 'A3' && (g.position.distanceTo(JP) < 3.0 || segD(g.position, c.pos, JP) < 1.7 || Math.hypot(g.position.x - c.pos.x, g.position.z - c.pos.z) < 4.2));
    crowdPose(t, T, c.shot); if (c.shot !== 'A0') zacPose(t, T, c.shot); if (c.shot === 'A3') jesusPose(t, T);
    const focusP = c.shot === 'A2' ? seatP : c.shot === 'A3' ? L3(JP, seatP, .3) : c.shot === 'A1' ? V(2.5, 3.5, -18) : TR;
    film.dofCfg.focus = c.pos.distanceTo(focusP); film.dofCfg.aperture = c.shot === 'A0' ? .8 : 1.8;
    film.look.exposure = c.shot === 'A0' ? 1.0 : .95;
    renderAll(t, c.shot === 'A0' ? ss(T.paint[0] - .1, T.paint[1] + .3, t) : 1);
    return c;
  }
  const project = v => { const q = v.clone().project(cam); return [(q.x + 1) / 2 * W, (1 - q.y) / 2 * H]; };

  // ---------------------------------------------------------------- 2D on top: the shaft and its motes (screen 'light'), the evening wash
  const beam = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 1024; const bx = c.getContext('2d'); bx.filter = 'blur(22px)';
    const g = bx.createLinearGradient(0, 0, 0, 1024); g.addColorStop(0, 'rgba(255,250,236,1)'); g.addColorStop(.55, 'rgba(255,244,222,.6)'); g.addColorStop(1, 'rgba(255,240,214,0)');
    bx.fillStyle = g; bx.beginPath(); bx.moveTo(112, 30); bx.lineTo(144, 30); bx.lineTo(220, 1000); bx.lineTo(36, 1000); bx.closePath(); bx.fill(); return c; })();
  const dot = [0, 1, 2].map(k => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 30), hard = [.25, .55, .9][k];
    g.addColorStop(0, 'rgba(255,250,232,1)'); g.addColorStop(hard * .6, 'rgba(255,246,224,.85)'); g.addColorStop(1, 'rgba(255,240,214,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c; });
  const MOTES = (() => { const r = rng(91); return Array.from({ length: 90 }, () => ({ b: r() * 40, life: 3.5 + r() * 3, u: r(), v: r() * 2 - 1, d: r(), sp: .02 + r() * .03, ph: r() * 6.28 })); })();
  function shaft(ctx, from, to, wFar, k, len = 1.3) { if (k <= .002) return; const dx = to[0] - from[0], dy = to[1] - from[1], d = Math.hypot(dx, dy), a = Math.atan2(dy, dx) - Math.PI / 2;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.translate(from[0], from[1]); ctx.rotate(a); ctx.drawImage(beam, -wFar / 2, -30 * d * len / 1000, wFar, d * len * 1.03); ctx.restore(); }
  // motes: born at a steady rate, live 3.5–6.5 s, drift slowly in the shaft; the count follows the shaft's strength (no bursts)
  function motes(ctx, t, from, to, wFar, k, draw = true) {
    let n = 0; if (k <= .01) return 0; const dx = to[0] - from[0], dy = to[1] - from[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    for (let i = 0; i < MOTES.length; i++) { const m = MOTES[i]; if (i / MOTES.length > k) continue;
      const age = ((t - m.b) % m.life + m.life) % m.life, life = Math.sin(Math.PI * age / m.life); if (life < .05) continue; n++; if (!draw) continue;
      const along = clamp(m.u + age * m.sp) * 1.15, w = (wFar * .15 + wFar * .4 * along) * m.v * .5, x = from[0] + ux * d * along - uy * w + Math.sin(t * .6 + m.ph) * 6, y = from[1] + uy * d * along + ux * w + Math.cos(t * .5 + m.ph) * 5;
      const lvl = m.d < .6 ? 0 : m.d < .85 ? 1 : 2, sz = [7, 18, 46][lvl] * (H / 1920) * (.7 + m.d * .5), al = [.7, .32, .1][lvl] * life * Math.min(1, k * 1.4);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = al; ctx.drawImage(dot[lvl], x - sz / 2, y - sz / 2, sz, sz); ctx.restore(); }
    return n;
  }
  const moteK = (t, T, shot) => shot === 'A0' ? .3 * ss(T.paint[0] + .3, T.paint[0] + 2.8, t) : shot === 'A1' ? .25 * ss(T.a1[0] + 1.5, T.a1[1], t)
    : shot === 'A2' ? .25 + .55 * ss(T.shaft[0], T.shaft[1], t) : (.3 + .6 * eio((t - T.pour[0]) / (T.pour[1] - T.pour[0]))) * (1 - ss(T.dusk[0] - 1, T.dusk[1], t));
  const wave = (x, front) => front + Math.sin(x * .011 + 1.3) * H * .025 + (Math.sin(x * .0067 + 2.1) * .5 + Math.sin(x * .019 + .4) * .3) * H * .03;
  function dusk(ctx, k) {
    if (k <= 0) return; const front = lerp(-.12, 1.18, eio(k)) * H; const p = new Path2D(); p.moveTo(-20, -20); p.lineTo(W + 20, -20); for (let x = W + 20; x >= -20; x -= 24) p.lineTo(x, wave(x, front)); p.closePath();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(92,118,164)'; ctx.fill(p); ctx.globalAlpha = .5 * clamp(k * 1.6); ctx.fillStyle = 'rgb(76,98,146)'; ctx.fill(p);
    ctx.globalAlpha = .7; ctx.strokeStyle = 'rgb(60,80,126)'; ctx.lineWidth = 10 * (H / 1920); ctx.filter = 'blur(5px)'; ctx.beginPath(); for (let x = -20; x <= W + 20; x += 24) x < -10 ? ctx.moveTo(x, wave(x, front)) : ctx.lineTo(x, wave(x, front)); ctx.stroke(); ctx.filter = 'none';
    ctx.globalAlpha = clamp((k - .55) / .45); ctx.fillStyle = 'rgb(130,146,182)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  function draw(ctx, t, T) {
    const c = frame(t, T);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H);
    const sunS = project(c.pos.clone().addScaledVector(SUN, 900)), k = moteK(t, T, c.shot);
    if (c.shot === 'A2' || c.shot === 'A3') { const zh = project(zac.position.clone().add(V(0, .9 * zs, 0)));
      const sk = c.shot === 'A2' ? .4 * ss(T.shaft[0], T.shaft[1], t) : (.2 + .42 * eio((t - T.pour[0]) / (T.pour[1] - T.pour[0]))) * (1 - ss(T.dusk[0], T.dusk[1] - .2, t));
      shaft(ctx, sunS, zh, W * .45, sk, c.shot === 'A3' ? 1.6 : 1.3); motes(ctx, t, sunS, zh, W * .45, k); }
    else motes(ctx, t, sunS, [sunS[0] - W * .25, H * .7], W * .5, k);
    if (c.shot === 'A3') dusk(ctx, (t - T.dusk[0]) / (T.dusk[1] - T.dusk[0]));
    ctx.restore();
  }

  // ---------------------------------------------------------------- checks
  function probe(t, T) { const c = camAt(t, T); setCam(c); const p = c.shot === 'A2' ? seatP.clone().add(V(0, .6, 0)) : SUBJ[c.shot]; const [sx, sy] = project(p); return { shot: c.shot, sx, sy, d: c.pos.distanceTo(p) }; }
  const moteCount = (t, T) => motes(null, t, [0, 0], [1, 1], 1, moteK(t, T, camAt(t, T).shot), false);
  // Zacchaeus' and Jesus' bone orientations (deg) — the measure takes the change per frame
  function joints(t, T) { const shot = camAt(t, T).shot; if (shot === 'A0' || shot === 'A1') return null;
    zacPose(t, T, shot); const o = []; const qs = [];
    for (const A of zac.userData.arms) qs.push(A.up.quaternion, A.fo.quaternion); for (const L of zac.userData.legs) qs.push(L.thigh.quaternion, L.shin.quaternion);
    if (shot === 'A3') { jesusPose(t, T); for (const A of jesus.userData.arms) qs.push(A.up.quaternion, A.fo.quaternion); }
    for (const q of qs) o.push([q.x, q.y, q.z, q.w]); return o; }
  S.updateMatrixWorld(true);
  return { film, draw, beats, probe, moteCount, joints };
}
