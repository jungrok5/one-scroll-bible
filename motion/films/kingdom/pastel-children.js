// pastel-children.js — 「kingdom」 4부 block 4b-2 (a): the children on the village road at sunset, film 390.7 → 434.7
//   N20 「그러면 그 나라에는 누가 들어갈까요? / 사람들이 아이들을 데려오자 제자들이 꾸짖었습니다.」 · N20b 「그것을 보신 예수님은 노하셨습니다.」 ·
//   L6/Q10 막 10:15 · N21 「셋째, 힘으로 얻는 나라가 아니라, / 빈손으로 받는 나라입니다.」 · N21b 「아이는 내세울 것도 갚을 것도 없이, / 주시는 것을 그냥 받습니다.」
// Look (review.json looks "6:29–7:13"): soft pastel at magic hour, gold → rose → violet, after 「Nomadland」 (2020, OPUSCAR 93: chalky
// soft-pastel strokes on grey-violet paper, the sky turning from gold to rose to violet). The first film's 「족장」 (soft pastel on
// toned paper, motion/pilot/patriarch.html) is the channel's own bar for it.
// Three shots, each with one slow move (cinecode camera-moves: tracking · reverse · push-in on detail):
//   S1 road    390.7 – 407.8  tracking at a child's eye height (1.0 m) behind and beside the families walking up the road into the
//              low sun: a father and his son hand in hand, a mother with a daughter by the hand and a small boy running ahead, an old
//              man with a staff and a girl, two boys racing each other, a mother with a baby in her arms — irregular, each on its own
//              stride. On 「제자들이 꾸짖었습니다」 four men step into the road from the sides and spread their arms against the sun
//              (staggered); the families slow and stop, one after another. N20b: beyond them the one man by the wall gets up and
//              turns toward them; the low sun blooms behind his back (far, small, backlit — no face).
//   S2 gather  407.8 – 418.3  the reverse (the sun now behind the camera, rose light on the faces of the road): low, behind him
//              (his back, kneeling down to their height, small in the frame); the blocking arms come down one after another and
//              the children run past them to him and gather round him — irregular, never a row; a slow track forward.
//   S3 hands   418.3 – 434.7  over his shoulder (a dark soft edge): a girl in front of him holds out her two open, empty hands;
//              push-in 3 s on the hands (N21); the last sun pools in the palms and fills them (N21b); behind her the violet street.
//              Out: the creases of the palms → the knife grooves of the woodcut (match cut, woodcut-road.js).
// People: people3d.js (robeMan with child variants, walk/idle/pose — two-bone IK with fixed lengths, elbows down/out, planted feet).
// Walks start and stop by a smooth time-warp of the gait (speed eases 0 → 1 → 0, the feet stay planted), so nobody snaps to a halt.
// Hands held between a parent and a child are solved onto ONE grip point (both arms reach it — BODY-CHECK §4 contact).
// The pastel pass (after this film's roof-table-3d.js oil pass, rewritten for dry media — feeling-pastel's method: tooth that the
// pigment catches, side-of-the-stick strokes, coloured shadows, no black): soft Kuwahara chalk patches, strokes at a fixed slant,
// the toned paper showing through in the darks; everything fixed in the frame (no per-frame noise — owner: no flicker).
// Skills read: canvas-film STYLE-INDEX (patriarch: soft pastel magic hour; pastelbook/clover), feeling-pastel (tools.js softPastel /
// surface.js tooth catch — method only, no code copied), doodle-styles STYLES.md (coloured pencil / pastel order), cinematic-3d.
// No face for Him: S1 far and backlit, S2 from behind, S3 only a soft dark edge of his shoulder. Men in head cloths, no long hair.
// API: const PC = await (await import('./pastel-children.js')).build(W, H);  PC.draw(ctx, t, B)  t = FILM seconds,
//      B = { N20, N20b, L6, Q10, N21, N21b, C4, pc: { id: [piece times] } }. Pure in t.
import { Film, THREE, V, col, rng } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const { clamp, lerp, ss } = P;
const sine = x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const face = (dx, dz) => Math.atan2(-dx, -dz);   // the rotation.y that turns a figure (facing −z) toward (dx, dz)
const rampI = u => u * u * u - u * u * u * u / 2;  // ∫₀ᵘ smoothstep

// ---------------------------------------------------------------- the one table: every visual time from the line times
export function beats(B) {
  const pc = B.pc || {}, n20b = pc.N20 ? pc.N20[1] : B.N20 + 4, n21b = pc.N21 ? pc.N21[1] : B.N21 + 3.4;
  const T = { start: B.N20, end: B.C4 };
  T.cut1 = B.N20b; T.cut2 = B.N21;                       // S1 | S2 | S3 (hard cuts between clearly different framings)
  T.block = n20b + .15;                                  // 「제자들이 꾸짖었습니다」: the men step in and spread their arms
  T.turn = [B.N20b + .35, B.N20b + 2.35];                // He turns toward them (2 s, two small steps)
  T.bloom = [B.N20b + .5, B.N20b + 4.5];                 // the sun blooms behind his back
  T.lower = B.Q10 + .4;                                  // S2: the arms come down (staggered from here)
  T.run = B.Q10 + 1.0;                                   // the children run to him (staggered)
  T.kneel = [B.Q10 + .2, B.Q10 + 2.4];                   // He kneels to their height
  T.push = [B.N21 + .3, B.N21 + 3.3];                    // S3: push-in 3 s on the open hands
  T.fill = [B.N21b + .2, B.N21b + 7.5];                  // the light fills the hands
  T.n21b = n21b;
  return T;
}

const NOPASS = typeof location !== 'undefined' && /[?&]nopass=1/.test(location.search);   // debug: the 3D frame without the pastel pass
export async function build(W, H) {
  const FOV = 44;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .03, far: 2500,
    atmos: { density: .0045, falloff: .05, base: 0, start: 3, color: col('#d8a07a', .6), colorUp: col('#b49cb4', .55), max: 1400, scatter: 1, anisotropy: .8, phaseMix: .85 },
    bloom: { strength: .08, radius: 1.15, tint: col('#ffd8b4') },
    dof: { focus: 12, aperture: 4, maxCoc: 24 },
    look: { exposure: 1.1, contrast: .97, saturation: 1.0, lift: col('#2c2236'), shadowTint: col('#c8bce0'), highTint: col('#fff0dc'), vignette: .3, grain: 0, ca: .2 },
  });
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither (no per-frame shimmer)
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera, R = film.renderer;
  let T = null;
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;

  // ---------------------------------------------------------------- light: the low sun straight up the road (−z), a little left
  const SUN = V(.16, .035, -1).normalize();
  const sky = K.sky(film, { top: col('#5a6ea0', .5), mid: col('#e0a87e', .95), horizon: col('#ffc88a', 1.6), sunDir: SUN, sunColor: col('#fff0d0', 14), sunGlow: col('#ffb878', 1.5), clouds: .35, cloudColor: col('#ffd0b0', 1.1), cloudShade: col('#a88aa0', .7) });
  // the sun is cheated per shot (a film habit): it always stands behind Him on the frame's axis (rule: light on the protagonist's axis)
  const aimSun = (from, at, el) => { const d = at.clone().sub(from); d.y = 0; d.normalize(); d.y = el; SUN.copy(d.normalize()); sky.u.sunDir.value.copy(SUN); };
  const hemi = new THREE.HemisphereLight(col('#a8a0c8'), col('#7a5a4a'), .6); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffc890'), 3.0); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048);
  Object.assign(sunL.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 300 }); sunL.shadow.bias = -.0004; sunL.shadow.normalBias = .04; sunL.shadow.radius = 3;
  S.add(sunL, sunL.target);
  const sunLamp = film.lamp(SUN.clone().multiplyScalar(300), '#ffc890', { power: 1600, size: 50, fog: 1 });

  // ---------------------------------------------------------------- the village (after heal-village.js: plastered fieldstone houses,
  // flat roofs with parapets, courtyard walls, olive trees, far hills in the haze — the same Galilee as 2부)
  const wallM = (base, key) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .92 });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + hashGLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 N = normalize(vWN); vec2 q = abs(N.y) > .7 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
            float big = fb(q * .35 + 3.1), fine = fb(q * 3.1);
            float base = 1. - smoothstep(.5, 1.3, vWP.y + (big - .5) * .7);
            vec3 c = diffuseColor.rgb * mix(.85, 1.08, big) * mix(.93, 1.04, fine);
            c = mix(c, c * vec3(.62, .55, .6), base * .6);
            diffuseColor.rgb = c; }`); };
    m.customProgramCacheKey = () => 'pc-wall-' + key; return m; };
  const M = { wall: wallM('#d8bf9c', 'a'), wall2: wallM('#c9a682', 'b'), wall3: wallM('#e0cdb0', 'c'), roof: K.std('#8a7460', { roughness: .95 }), dark: K.std('#3a2a2a', { roughness: 1 }),
    leaf: K.std('#7a8060', { roughness: .9 }), trunk: K.std('#5a4a3a', { roughness: .95 }) };
  const groundM = new THREE.MeshStandardMaterial({ color: '#c8a682', roughness: 1 });
  groundM.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;\n' + hashGLSL)
      .replace('#include <map_fragment>', `#include <map_fragment>
        { vec2 q = vWP.xz; float n = fb(q * .25), f = fb(q * 2.3), road = 1. - smoothstep(2.0, 3.2, abs(vWP.x - .2 + sin(vWP.z * .05) * .5));
          vec3 c = diffuseColor.rgb * mix(.82, 1.06, n) * mix(.93, 1.04, f);
          c = mix(c, c * vec3(1.05, 1.02, .96), road * .6);
          c = mix(c, vec3(.6, .6, .44), smoothstep(.55, .75, fb(q * .6 + 9.)) * (1. - road) * .4);
          diffuseColor.rgb = c; }`); };
  groundM.customProgramCacheKey = () => 'pc-ground';
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), groundM); ground.rotation.x = -Math.PI / 2; ground.position.z = -300; ground.receiveShadow = true; S.add(ground);
  const R0 = rng(5150);
  const house = (x, z, w, d, h, side, m) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
    const box = (bw, bh, bd, px, py, pz, mat) => { const b = new THREE.Mesh(K.roundedBox(bw, bh, bd, .08, 2), mat); b.position.set(px, py, pz); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
    box(w, h, d, 0, h / 2, 0, m); box(w + .16, .22, d + .16, 0, h + .05, 0, M.roof);
    for (const s2 of [-1, 1]) box(w, .35, .14, 0, h + .3, s2 * d / 2, m);
    if (R0() < .5) box(w * .45, h * .6, d * .5, (R0() - .5) * w * .3, h + h * .3, (R0() - .5) * d * .3, m);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(.95, 1.85), M.dark); door.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; door.position.set(side < 0 ? w / 2 + .012 : -w / 2 - .012, .93, (R0() - .5) * d * .4); g.add(door);
    return g; };
  for (const side of [-1, 1]) { let z = 30; while (z > -120) { const w = 5 + R0() * 3.5, d = 6 + R0() * 3, h = 2.7 + R0() * 1.4, x = side * (4.6 + w / 2 + R0() * 1.2);
      const m = [M.wall, M.wall2, M.wall3][(R0() * 3) | 0];
      if (!(side > 0 && z < -14 && z > -30)) house(x, z - d / 2, w, d, h, side, m);   // an open plot on the right where He sits by the wall
      const gap = 1.5 + R0() * 3.5, cw = new THREE.Mesh(K.roundedBox(.45, 1.0 + R0() * .4, gap, .08, 2), m); cw.position.set(side * (4.7 + R0() * .3), .55, z - d - gap / 2); cw.castShadow = cw.receiveShadow = true; S.add(cw);
      z -= d + gap; } }
  // the low wall of the open plot (He sits on it), an olive tree behind it, the far hills
  { const lw = new THREE.Mesh(K.roundedBox(.55, .62, 16, .1, 2), M.wall2); lw.position.set(4.25, .31, -22); lw.castShadow = lw.receiveShadow = true; S.add(lw); }
  const olive = (x, z, h, seed) => { const tr = K.tree({ seed, height: h, trunk: .2, depth: 4, spread: .7, up: .2, twig: 0, mat: M.trunk, layer: 0 }); tr.position.set(x, 0, z); S.add(tr);
    const r = rng(seed), n = 46, geo = new THREE.IcosahedronGeometry(.55, 1), inst = new THREE.InstancedMesh(geo, M.leaf, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * h * .38, y = h * (.55 + r() * .35); m4.compose(V(x + Math.cos(a) * rr, y, z + Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, 0)), V(1, .7, 1).multiplyScalar(.7 + r() * .8)); inst.setMatrixAt(i, m4); }
    inst.castShadow = true; S.add(inst); };
  for (const [x, z, h] of [[6.5, -24, 5.5], [-9, -40, 6], [8.5, -52, 5], [-8, 8, 5.5], [9, 14, 6], [7.2, -17, 4.6]]) olive(x, z, h, (x * 7 + z * 3) | 0);
  { const hm = new THREE.MeshStandardMaterial({ color: '#a48a7c', roughness: 1 });
    for (let i = 0; i < 9; i++) { const g = new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), r = rng(70 + i);
      const m = new THREE.Mesh(g, hm); m.scale.set(140 + r() * 120, 3 + r() * 4, 80 + r() * 60); m.position.set((i - 4) * 120 + r() * 60, -4, -360 - r() * 260); m.scale.y *= .35; S.add(m);   // low in the west: the sun sets on the horizon down the road
      const m2 = m.clone(); m2.position.z = 360 + r() * 260; m2.position.x = (i - 4) * 120 + r() * 60; S.add(m2); } }

  // ---------------------------------------------------------------- people
  const robes = ['#9a6a54', '#5a6a88', '#a8885c', '#7a8068', '#b89a7c', '#8a5a5a', '#6a5a7a', '#c0a888', '#7a6a58', '#94785e'];
  const RM = robes.map((c, i) => K.std(c, { roughness: .95, side: THREE.DoubleSide }));
  const CM = ['#d8c8a8', '#c8b090', '#e0d0b8', '#b8a080'].map(c => K.std(c, { roughness: .95, side: THREE.DoubleSide }));
  const faceM = K.std('#5a3a2a', { roughness: .9 }), hairM = K.std('#2a1c14', { roughness: 1 }), skinM = K.std('#b07a5a', { roughness: .7 });
  const all = [];
  const add = (g, x, z, ry, ph) => { g.position.set(x, 0, z); g.rotation.y = ry; g.userData.ph = ph; S.add(g); all.push(g); return g; };
  const adult = (o) => { const g = P.robeMan({ face: faceM, head: 'cloth', ...o }); if (o.turban) P.headwear(g, 'turban', { mat: o.cloth, dark: hairM }); else if (!o.head || o.head === 'cloth') P.headwear(g, 'cloth', { dark: hairM }); return g; };
  const woman = (o) => P.robeMan({ face: faceM, head: 'veil', ...o });
  // a child: the robeMan child body; a boy has short dark hair (no beard), a girl a small veil
  const child = (o) => { const g = P.robeMan({ face: faceM, child: true, head: o.girl ? 'veil' : 'cloth', ...o });
    if (!o.girl) { P.headwear(g, 'bare', { dark: hairM }); const n = g.userData.neck; n.remove(n.children[n.children.length - 1]); }
    // round 2: a child's silhouette at a glance — a short tunic (boys to the knee, girls to the calf) so the legs show and walk
    const U = g.userData; if (U.skirt) { const k = o.girl ? .72 : .5, top = .99 * U.s; U.skirt.scale.y = k; U.skirt.position.y = top * (1 - k); }
    return g; };
  // --- the families (S1): they walk up the road (−z) at one speed (1.0 m/s), each family on its own clock
  // fam: { people: [{g, T, L, x}], t0, acc, dec, n (steps of the first), z0, hold: [[ia, ib, sideA]] }
  const SPD = 1.0;
  const mkFam = (people, z0, t0, acc, dec, gaitS, holds = []) => ({ people, z0, t0, acc, dec, gaitS, holds });
  const F = [];
  { const fa = add(adult({ h: 1.78, mat: RM[1], cloth: CM[0], broad: 1.05 }), -2.95, 0, 0, .1), so = add(child({ h: 1.12, mat: RM[2] }), -2.32, 0, 0, .43), sm = add(child({ h: .9, mat: RM[7], cloth: CM[2], girl: true }), -3.5, 0, 0, .81);
    F.push(mkFam([{ g: fa, T: 1.2, x: -2.95 }, { g: so, T: .8, x: -2.32 }, { g: sm, T: .6, x: -3.48 }], 2.0, -2, 0, 2.4, 7.2, [[0, 1], [0, 2]])); }
  { const mo = add(woman({ h: 1.64, mat: RM[5], cloth: CM[1] }), .9, 0, 0, .27), da = add(child({ h: 1.04, mat: RM[7], cloth: CM[2], girl: true }), 1.45, 0, 0, .71), bo = add(child({ h: .98, mat: RM[3] }), .4, 0, 0, .58);
    { const td = P.robeMan({ h: .78, mat: RM[9], face: faceM, child: true, kind: 'sit', head: 'cloth' }); P.headwear(td, 'bare', { dark: hairM }); { const n = td.userData.neck; n.remove(n.children[n.children.length - 1]); } mo.add(td); mo.userData.toddler = td; td.userData.ph = .37; }   // a toddler carried on her left hip
    F.push(mkFam([{ g: mo, T: 1.1, x: .9 }, { g: da, T: .733, x: 1.45 }, { g: bo, T: .55, x: 1.0, ahead: 1.6 }], -.5, -1.4, 0, 2.2, 6.6, [[0, 1]])); }
  { const gr = add(adult({ h: 1.7, mat: RM[8], cloth: CM[3] }), 2.4, 0, 0, .35), gi = add(child({ h: 1.18, mat: RM[6], cloth: CM[0], girl: true }), 1.9, 0, 0, .9);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(.018, .022, 1.55, 6), M.trunk); staff.castShadow = true; S.add(staff); gr.userData.staff = staff;
    F.push(mkFam([{ g: gr, T: 1.3, x: 2.45 }, { g: gi, T: .867, x: 1.88 }], -3.4, -1.0, 0, 2.6, 5.2, [[0, 1]])); }
  { const b1 = add(child({ h: 1.24, mat: RM[0] }), -1.55, 0, 0, .15), b2 = add(child({ h: 1.12, mat: RM[9] }), -.95, 0, 0, .66);
    F.push(mkFam([{ g: b1, T: .62, x: -1.55 }, { g: b2, T: .58, x: -.95, lag: .94 }], -3.9, -.6, 0, 1.6, 5.58)); }
  { const mb = add(woman({ h: 1.6, mat: RM[4], cloth: CM[2] }), 2.9, 0, 0, .52), sb = add(child({ h: .96, mat: RM[0] }), 3.5, 0, 0, .24);
    const baby = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8), CM[0]); baby.scale.set(1, .75, 1.6); baby.castShadow = true; S.add(baby); mb.userData.baby = baby;
    F.push(mkFam([{ g: mb, T: 1.1, x: 2.95 }, { g: sb, T: .55, x: 3.5 }], 4.5, -2.6, 0, 2.4, 7.7, [[0, 1]])); }
  // the gait of a family member at t: the family's speed profile (ease in/out by a time-warp), the member's own stride
  // (L = SPD × T / 2 so all of a family move at one speed and stop together; feet planted throughout)
  function famTau(f, t) { const total = f.gaitS, cruise = Math.max(0, total - f.dec / 2), tStop = T.block + f.stopDelay; // the walk ends at tStop (real)
    const tD = tStop - f.dec; // deceleration starts
    let tau; if (t < tD) tau = cruise - (tD - t); else if (t < tStop) { const u = (t - tD) / f.dec; tau = cruise + f.dec * (u - rampI(u)); } else tau = total;
    return { tau, total, stopped: t >= tStop, tStop }; }
  F.forEach((f, i) => { f.stopDelay = [1.9, 2.5, 1.5, .9, 3.0][i]; });   // staggered stops
  // --- the four disciples who block (S1/S2): they step in from the sides and spread their arms; at Q10 the arms come down
  const D = [[-2.6, -10.6, -4.2, -9.6, .3, RM[8], CM[3], false], [-1.2, -11.3, -3.8, -12.8, .55, RM[1], CM[3], false], [1.2, -10.8, 4.0, -9.9, .12, RM[3], CM[1], false], [2.8, -11.6, 4.3, -13.0, .8, RM[6], CM[3], false]]
    .map(([x, z, x0, z0, ph, m, c, tb], i) => { const g = add(adult({ h: 1.72 + i * .02, mat: m, cloth: c, broad: 1.04, turban: tb }), x0, z0, face(x - x0, z - z0), ph);
      g.userData.to = V(x, 0, z); g.userData.from = V(x0, 0, z0); g.userData.i = i; return g; });
  // --- Him: sitting on the low wall of the open plot, his back to the road (looking out over the fields into the sun)
  const kingM = K.std('#b4a48a', { roughness: .95, side: THREE.DoubleSide }), kingC = K.std('#8a7a62', { roughness: .95, side: THREE.DoubleSide });
  const KP = V(.45, 0, -21.2), KN = V(.35, 0, -19.6);   // where He stands (S1) and kneels (S2, S3)
  const king = add(adult({ h: 1.76, mat: kingM, cloth: kingC }), KP.x, KP.z, face(-.1, -1), .2);   // standing at the road's edge, his back to the road, looking into the sun
  // --- the children who run to Him (S2: the same children as S1, they leave their parents) and the girl with the open hands (S3)
  // S2 run targets round Him (irregular): [member ref, target offset from Him (x, z), arrive order]
  const RUN = [[F[1].people[2].g, [-.78, .42]], [F[3].people[0].g, [.82, .3]], [F[3].people[1].g, [-1.35, -.15]], [F[2].people[1].g, [1.3, -.25]], [F[1].people[1].g, [-.52, 1.15]], [F[0].people[1].g, [.62, 1.6]]];
  // S3's girl: F[1]'s daughter (the same pink-cream robe), standing close in front of Him
  const GIRL = F[1].people[1].g;

  // open hands for the close shot (a child's: palm, four fingers in two joints, a thumb), palm up, fingers along −z, cupped
  const handM = K.std('#b07a5a', { roughness: .7, emissive: col('#ff9a5a'), emissiveIntensity: 0 });   // the palms: they take the light (emissive ramps up)
  function openHand(sd, s) {
    const g = new THREE.Group(), mk2 = (geo, p, r) => { const m = new THREE.Mesh(geo, handM); m.position.copy(p); if (r) m.rotation.set(r[0], r[1], r[2]); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    mk2(K.roundedBox(.054 * s, .014 * s, .058 * s, .006 * s, 3), V(0, 0, -.026 * s));
    { const w = new THREE.Mesh(new THREE.CapsuleGeometry(.019 * s, .03 * s, 3, 8), handM); w.rotation.x = Math.PI / 2; w.scale.set(1.25, 1, .7); w.position.set(0, 0, .01 * s); w.castShadow = true; g.add(w); }   // the wrist into the sleeve
    for (let i = 0; i < 4; i++) { const x = (i - 1.5) * .0132 * s, L1 = [.028, .033, .031, .024][i] * s, L2 = [.022, .025, .024, .019][i] * s, sp = (i - 1.5) * .09;
      const f1 = new THREE.Group(); f1.position.set(x, .003 * s, -.056 * s); f1.rotation.set(.32, sp, 0); g.add(f1);
      const a = new THREE.Mesh(new THREE.CapsuleGeometry(.0058 * s, L1, 3, 6), handM); a.rotation.x = Math.PI / 2; a.position.z = -L1 / 2; a.castShadow = true; f1.add(a);
      const f2 = new THREE.Group(); f2.position.z = -L1; f2.rotation.x = .42; f1.add(f2);
      const b = new THREE.Mesh(new THREE.CapsuleGeometry(.0052 * s, L2, 3, 6), handM); b.rotation.x = Math.PI / 2; b.position.z = -L2 / 2; b.castShadow = true; f2.add(b); }
    const th = new THREE.Group(); th.position.set(sd * .026 * s, .002 * s, -.012 * s); th.rotation.set(.2, -sd * .65, sd * .25); g.add(th);
    const t1 = new THREE.Mesh(new THREE.CapsuleGeometry(.0068 * s, .03 * s, 3, 6), handM); t1.rotation.x = Math.PI / 2; t1.position.z = -.015 * s; t1.castShadow = true; th.add(t1);
    g.visible = false; S.add(g); return g; }
  const gs = GIRL.userData.s, HANDS = [openHand(-1, gs * 1.7), openHand(1, gs * 1.7)];   // a little large for her size, so the close shot reads (her hands, not a doll's)
  // the light that pools in the palms (N21/N21b): a warm point light just above them and a soft glow sprite
  const palmL = new THREE.PointLight(col('#ffb07a'), 0, 1.2, 2); S.add(palmL);
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,236,200,1)'); gr.addColorStop(.25, 'rgba(255,190,130,.55)'); gr.addColorStop(.6, 'rgba(255,150,110,.15)'); gr.addColorStop(1, 'rgba(255,140,100,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); return t; })();
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: glowTex, color: col('#ffd2a0', 2.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: 0, fog: false }));
  glow.renderOrder = 10; glow.frustumCulled = false; S.add(glow);
  S.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // ---------------------------------------------------------------- the pastel pass (on the finished frame, display values)
  const FS = (frag, uniforms) => { const m = new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    const sc = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); q.frustumCulled = false; sc.add(q); return { m, sc, u: m.uniforms }; };
  const ocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const rtA = new THREE.WebGLRenderTarget(film.w, film.h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const pastelP = FS(`varying vec2 vUv; uniform sampler2D tIn; uniform vec2 px; uniform vec3 paper; uniform float violet;
    ${hashGLSL}
    float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
    void main(){
      // chalk: a soft Kuwahara (radius 3) — the colour laid in flat dusty patches, edges kept
      const int R = 3; vec3 m[4]; vec3 s2[4]; for (int k = 0; k < 4; k++){ m[k] = vec3(0.); s2[k] = vec3(0.); }
      for (int y = 0; y <= R; y++) for (int x = 0; x <= R; x++){
        vec3 a = texture2D(tIn, vUv + vec2(-x, -y) * px).rgb, b = texture2D(tIn, vUv + vec2(x, -y) * px).rgb, c = texture2D(tIn, vUv + vec2(x, y) * px).rgb, d = texture2D(tIn, vUv + vec2(-x, y) * px).rgb;
        m[0] += a; s2[0] += a * a; m[1] += b; s2[1] += b * b; m[2] += c; s2[2] += c * c; m[3] += d; s2[3] += d * d; }
      float n = float((R + 1) * (R + 1)), best = 1e9; vec3 col = vec3(0.);
      for (int k = 0; k < 4; k++){ vec3 mu = m[k] / n, v = abs(s2[k] / n - mu * mu); float sv = v.r + v.g + v.b; if (sv < best){ best = sv; col = mu; } }
      vec2 p = gl_FragCoord.xy; float l = lum(col);
      // side-of-the-stick strokes at a fixed slant (bending slowly across the sheet), a few crossing strokes in the darks
      float a = -.58 + .45 * (fb(p * .0011 + 2.) - .5); vec2 d = vec2(cos(a), sin(a)), e = vec2(-d.y, d.x);
      float st = vn(vec2(dot(p, d) / 26., dot(p, e) / 3.4)) * .7 + vn(vec2(dot(p, d) / 9., dot(p, e) / 1.6) + 5.) * .3;
      vec2 d2 = vec2(cos(a + 1.25), sin(a + 1.25)), e2 = vec2(-d2.y, d2.x);
      float st2 = vn(vec2(dot(p, d2) / 20., dot(p, e2) / 3.) + 9.);
      // the paper's tooth (fixed): light pressure catches only the peaks, so the toned paper speckles through in the darks
      float tooth = vn(p * .11) * .55 + vn(p * .27 + 3.) * .3 + vn(p * .05 + 7.) * .15;
      float press = .42 + .62 * smoothstep(.02, .7, l) + (st - .5) * .38 - (1. - smoothstep(.05, .35, l)) * (st2 - .5) * .3;
      float cover = .74 + .26 * smoothstep(tooth - .32, tooth + .2, press);
      // colour: cel-era pastel logic — coloured shadows (blue-violet, never grey or black), warm cream lights
      vec3 g = mix(vec3(l), col, 1.1);
      g = mix(g, g * vec3(.82, .78, 1.1) + vec3(.07, .045, .12), (1. - smoothstep(.12, .55, l)) * (.55 + .25 * violet));
      g = mix(g, g * vec3(1.04, 1., .9) + vec3(.035, .025, 0.), smoothstep(.55, .95, l));
      g *= 1. + (st - .5) * .1;
      vec3 c = mix(paper, g, cover);
      gl_FragColor = vec4(c, 1.);
    }`, { tIn: { value: null }, px: { value: new THREE.Vector2(1 / film.w, 1 / film.h) }, paper: { value: new THREE.Vector3(.36, .3, .44) }, violet: { value: 0 } });
  const realSRT = R.setRenderTarget.bind(R);
  function renderAll(t) {
    if (window.__NOREN) return;   // debug (joint measurement): poses only, no GPU work
    R.setRenderTarget = (tg, ...a) => realSRT(tg === null ? rtA : tg, ...a);
    try { film.render(t); } finally { R.setRenderTarget = realSRT; }
    if (NOPASS) { film.copyLinear(rtA.texture, null); return; }
    pastelP.u.tIn.value = rtA.texture; realSRT(null); R.render(pastelP.sc, ocam);
  }

  // ---------------------------------------------------------------- motion
  // a parent and a child hold hands: one grip point between them (world), both hands solved onto it
  const toLocal = (g, w) => { g.updateMatrix(); return w.clone().applyMatrix4(g.matrix.clone().invert()); };
  function poseWalker(g, t, tau, total, L, Tg, stopped, tStop, extra = {}) {
    const s = g.userData.s, t0 = 0;
    if (!stopped) { const w = P.walk(g, tau, t0, { T: Tg, L }); return { pose: { ...w, breath: .5, head: [0, 0], ...extra }, dist: w.dist }; }
    const n = Math.round(total / (Tg / 2)), odd = n % 2 === 1, k = clamp((t - tStop) / .9), id = P.idle(t, g.userData.ph, { s });
    const stance = odd ? [{ u: -L / 2, lift: 0 }, { u: L / 2, lift: 0 }] : [{ u: L / 2, lift: 0 }, { u: -L / 2, lift: 0 }];
    return { pose: { ...id, feet: stance, bob: lerp(-.02 * s, id.bob, ss(0, 1, k)), lean: lerp(-.06, id.side * 0 - .01, ss(0, 1, k)), swing: [lerp(0, id.swing[0], k), lerp(0, id.swing[1], k)], ...extra }, dist: total / (Tg / 2) * L };
  }
  // the families in S1
  function families(t) {
    F.forEach((f, fi) => {
      const ft = famTau(f, t), grips = [];
      const res = f.people.map((m, j) => { const L = SPD * m.T / 2, lag = m.lag || 0, ahead = m.ahead || 0;
        const r = poseWalker(m.g, t, Math.max(0, ft.tau - lag), f.gaitS - lag, L, m.T, ft.stopped, ft.tStop);
        m.g.position.set(m.x + .05 * Math.sin(t * .2 + fi), 0, f.z0 + ahead - r.dist); m.g.rotation.y = .02 * Math.sin(t * .17 + j); return r; });
      // hands held
      for (const [ia, ib] of f.holds) { const A = f.people[ia].g, Bc = f.people[ib].g, sA = A.userData.s, sB = Bc.userData.s;
        const sdA = Bc.position.x > A.position.x ? 1 : -1;
        const ph = res[ia].pose.ph ?? 0, swing = ft.stopped ? .02 * Math.sin(t * .8) : .05 * Math.sin(ph * 2 * Math.PI) * clamp(1.2 - ft.tau / f.gaitS * 0);
        const gw = V(lerp(A.position.x + sdA * .26 * sA, Bc.position.x - sdA * .17 * sB, .55), lerp(.84 * sA, .68 * sB, .45), (A.position.z + Bc.position.z) / 2 - .05 + swing);
        const hA = [null, null], hB = [null, null]; hA[sdA > 0 ? 1 : 0] = toLocal(A, gw); hB[sdA > 0 ? 0 : 1] = toLocal(Bc, gw);
        { const prev = res[ia].pose.hands || [null, null]; res[ia].pose.hands = [hA[0] || prev[0], hA[1] || prev[1]]; } res[ib].pose.hands = hB;   // (a parent may hold a child on each hand) }
      f.people.forEach((m, j) => { const g = m.g, U = g.userData;
        if (U.staff) { const s = U.s, sw = res[j].pose.ph != null ? Math.sin(res[j].pose.ph * 2 * Math.PI) : 0, tip = g.position.clone().add(V(-.34 * s, 0, -.25 * s + .1 * sw));   // the staff planted a little ahead on his left
          const grip = tip.clone().add(V(.05, 1.02 * s, .1)); res[j].pose.hands = [toLocal(g, grip), res[j].pose.hands ? res[j].pose.hands[1] : null];
          U.staff.position.copy(tip).add(grip).multiplyScalar(.5); U.staff.position.y = (tip.y + grip.y) / 2 + .2; U.staff.lookAt(grip.clone().add(V(0, .3, 0))); U.staff.rotateX(Math.PI / 2); }
        if (U.toddler) { const s = U.s, td = U.toddler, ts = td.userData.s, bob = res[j].pose.bob || 0;   // on her left hip: her left arm round it (the hand under it)
          td.position.set(-.19 * s, .66 * s + bob, -.02 * s); td.rotation.set(0, .9, -.08);
          res[j].pose.hands = [V(-.15 * s, .7 * s + bob, -.13 * s), res[j].pose.hands ? res[j].pose.hands[1] : null]; res[j].pose.side = (res[j].pose.side || 0) + .05;
          P.pose(td, { breath: P.breath(t, .37), head: [.05 * Math.sin(t * .7), .3 * Math.sin(t * .4)], hands: [null, V(.08 * ts, .55 * ts, -.12 * ts)], handsW: [0, .7] }); }
        if (U.baby) { const s = U.s, c = V(.02 * s, 1.08 * s + (res[j].pose.bob || 0), -.2 * s); res[j].pose.hands = [c.clone().add(V(-.1 * s, -.04 * s, .02 * s)), c.clone().add(V(.11 * s, .03 * s, -.01 * s))]; res[j].pose.lean = (res[j].pose.lean || 0) + .05;
          g.updateMatrix(); U.baby.position.copy(c).applyMatrix4(g.matrix); U.baby.rotation.set(0, g.rotation.y + .5, .25); }
        P.pose(g, res[j].pose); }); });
  }
  // the disciples: in from the sides on 「꾸짖었습니다」, stop, turn to the road, spread their arms (staggered); at Q10 the arms come down
  function disciples(t, shot) {
    D.forEach((g, i) => { const U = g.userData, s = U.s, t0 = T.block + [.0, .35, .15, .55][i], Tg = 1.05, L = .5;
      const dir = U.to.clone().sub(U.from), dist = dir.length(); dir.normalize(); const n = Math.max(2, Math.round(dist / L)), Lr = dist / n;
      const acc = .5, total = n * Tg / 2, dec = .9, cruise = Math.max(0, total - acc / 2 - dec / 2), tStop = t0 + acc + cruise + dec;
      let tau; { const e = t - t0; if (e <= 0) tau = 0; else if (e < acc) tau = acc * rampI(e / acc); else if (e < acc + cruise) tau = acc / 2 + (e - acc); else if (e < acc + cruise + dec) { const u = (e - acc - cruise) / dec; tau = acc / 2 + cruise + dec * (u - rampI(u)); } else tau = total; }
      const a0 = face(dir.x, dir.z), a1 = face(-.15 * (U.to.x), 1), id = P.idle(t, U.ph, { s });
      const spread = ss(tStop - .3, tStop + .8, t) * (1 - ss(T.lower + i * .45, T.lower + i * .45 + 1.3, t));
      let po;
      if (t < t0) { g.position.copy(U.from); g.rotation.y = a0; po = { ...id, feet: [{ u: Lr / 2, lift: 0 }, { u: -Lr / 2, lift: 0 }] }; }
      else if (t < tStop) { const w = P.walk(g, tau, 0, { T: Tg, L: Lr }); g.position.copy(U.from).addScaledVector(dir, w.dist); g.rotation.y = a0; po = { ...w, breath: .5, head: [0, 0] }; }
      else { const odd = n % 2 === 1, k = ss(0, 1, (t - tStop) / .9); g.position.copy(U.to); const da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0)); g.rotation.y = a0 + da * ss(tStop, tStop + 2.2, t);   // a turn on the spot over 2.2 s, from the stop
        po = { ...id, feet: odd ? [{ u: -Lr / 2, lift: .02 * Math.sin(Math.PI * clamp((t - tStop) / .8)) * s }, { u: Lr / 2, lift: 0 }] : [{ u: Lr / 2, lift: 0 }, { u: -Lr / 2, lift: .02 * Math.sin(Math.PI * clamp((t - tStop) / .8)) * s }],
          bob: lerp(-.02 * s, id.bob, k), lean: lerp(-.06, -.02 + .03 * spread, k), swing: [lerp(0, id.swing[0], k), lerp(0, id.swing[1], k)] }; }
      // the arms: out to the sides, a little forward, at shoulder height (elbows down — the pole is below); one man waves them off
      if (shot === 'gather') { const pk = ss(T.lower + i * .45 + .3, T.lower + i * .45 + 2.2, t), side = U.to.x < .2 ? -1 : 1; g.position.x += side * .55 * pk; g.rotation.y += side * -.35 * pk; po.feet = [{ u: po.feet[0].u, lift: .05 * s * Math.sin(Math.PI * clamp((pk - .1) / .4)) }, { u: po.feet[1].u, lift: .05 * s * Math.sin(Math.PI * clamp((pk - .5) / .4)) }]; }
      const sh = 1.36 * s, wave = (i === 2 ? .08 * Math.sin(t * 5.2) : .035 * Math.sin(t * (1.6 + .4 * i) + i * 2)) * spread;   // one waves them off; the others' arms are never frozen
      po.hands = [V(-.62 * s, sh - .1 * s, -.18 * s), V(.62 * s, sh - .08 * s + wave, -.2 * s + wave)]; po.handsW = [spread, spread];
      po.head = [-.04 + .03 * Math.sin(t * .9 + i), shot === 'gather' ? -.3 * ss(T.lower + .6, T.lower + 2, t) * (U.to.x > 0 ? -1 : 1) : .1 * Math.sin(t * .5 + i)];
      P.pose(g, po); });
  }
  // Him: seated on the low wall (S1) → gets up (N20b) → turns to the road; (S2) walks two steps toward them and kneels to their height
  function kingPose(t, shot) {
    const U = king.userData, s = U.s, id = P.idle(t, U.ph, { s });
    if (shot !== 'road') {   // S2/S3: in the road, facing the disciples and the children (back to the camera), kneeling
      king.position.set(KN.x, 0, KN.z);
      if (shot === 'gather' && t < T.kneel[0]) {   // N20b: standing in the road, his back to them, he turns toward them (two small steps)
        const a0 = face(-.05, -1), a1 = face(-.12, 1), tk = sine((t - T.turn[0]) / (T.turn[1] - T.turn[0])); king.rotation.y = a0 + Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0)) * tk;
        const step = (ph) => Math.max(0, Math.sin(Math.PI * clamp((tk - ph) / .45))) * .05 * s;
        P.pose(king, { ...id, feet: [{ u: .08 * s, lift: step(.05) }, { u: -.07 * s, lift: step(.5) }], breath: P.breath(t, U.ph), twist: id.twist * .4, side: id.side * .5, head: [-.02, .04 * Math.sin(t * .3)] });
        return; }
      king.rotation.y = face(-.12, 1);
      const k = shot === 'hands' ? 0 : 1 - eio((t - T.kneel[0]) / (T.kneel[1] - T.kneel[0])), kr = P.kneelRise(k, s, U.ph);
      const open = shot === 'hands' ? .2 : ss(T.kneel[0] + .8, T.kneel[1] + .6, t);
      P.pose(king, { ...kr, breath: P.breath(t, U.ph), head: [-.05 - .12 * (1 - k), .05 * Math.sin(t * .3)],
        hands: [V(-.42 * s, .75 * s + kr.bob * .6, -.32 * s), V(.42 * s, .75 * s + kr.bob * .6, -.3 * s)], handsW: [open, open] });
      return; }
    king.position.copy(KP);
    const a0 = face(-.1, -1), a1 = face(-.55, 1), tk = sine((t - T.turn[0]) / (T.turn[1] - T.turn[0]));
    king.rotation.y = a0 + Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0)) * tk;
    const step = (ph) => Math.max(0, Math.sin(Math.PI * clamp((tk - ph) / .45))) * .05 * s;   // two small steps as he turns round
    P.pose(king, { ...id, feet: [{ u: .08 * s, lift: step(.05) }, { u: -.07 * s, lift: step(.5) }], breath: P.breath(t, U.ph), twist: id.twist * .4, side: id.side * .5,
      head: [-.02 + .06 * tk, .04 * Math.sin(t * .3)] });
  }
  // S2: the children run from where their families stopped to Him, staggered, slowing as they arrive; then stand round Him, alive
  const RUNS = RUN.map(([g, off], i) => ({ g, off, t0: 0, i }));
  const RUN0 = [[-2.1, 0, -8.6], [1.75, 0, -9.2], [-2.75, 0, -9.6], [2.4, 0, -8.4], [-1.7, 0, -8.0], [2.0, 0, -9.8]];   // S2: where each child starts (in front of the long lens)
  function gather(t) {
    for (const r of RUNS) { const g = r.g, U = g.userData, s = U.s;
      const to = V(KN.x + r.off[0], 0, KN.z + r.off[1]), dir = to.clone().sub(r.from), dist = dir.length(); dir.normalize();
      const Tg = .62, L = .5 * (s / .63), n = Math.max(3, Math.round(dist / L)), Lr = dist / n, t0 = T.run + [0, .35, .8, 1.05, .55, 1.4][r.i];
      const acc = .5, total = n * Tg / 2, dec = 1.2, cruise = Math.max(0, total - acc / 2 - dec / 2), tStop = t0 + acc + cruise + dec;
      let tau; { const e = t - t0; if (e <= 0) tau = 0; else if (e < acc) tau = acc * rampI(e / acc); else if (e < acc + cruise) tau = acc / 2 + (e - acc); else if (e < acc + cruise + dec) { const u = (e - acc - cruise) / dec; tau = acc / 2 + cruise + dec * (u - rampI(u)); } else tau = total; }
      const id = P.idle(t, U.ph, { s }), a0 = face(dir.x, dir.z), a1 = face(KN.x - to.x, KN.z - to.z);
      let po;
      if (t < t0) { g.position.copy(r.from); g.rotation.y = face(.1 * (r.i - 2), -1); po = { ...id, feet: [{ u: Lr / 2, lift: 0 }, { u: -Lr / 2, lift: 0 }], head: [0, .25 * Math.sin(t * .6 + r.i)] }; }
      else if (t < tStop) { const w = P.walk(g, tau, 0, { T: Tg, L: Lr }); g.position.copy(r.from).addScaledVector(dir, w.dist); const k0 = ss(t0, t0 + .5, t); g.rotation.y = lerp(face(.1 * (r.i - 2), -1), a0, k0); po = { ...w, breath: .5, head: [.05, 0] }; }
      else { const odd = n % 2 === 1, k = ss(0, 1, (t - tStop) / .8); g.position.copy(to); const da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0)); g.rotation.y = a0 + da * ss(tStop, tStop + 1.5, t);
        po = { ...id, feet: odd ? [{ u: -Lr / 2, lift: 0 }, { u: Lr / 2, lift: 0 }] : [{ u: Lr / 2, lift: 0 }, { u: -Lr / 2, lift: 0 }], bob: lerp(-.02 * s, id.bob, k), lean: lerp(-.07, -.03, k), swing: [lerp(0, id.swing[0], k), lerp(0, id.swing[1], k)], head: [-.03 + .05 * Math.sin(t * .7 + r.i), .15 * Math.sin(t * .4 + r.i * 2)] }; }
      P.pose(g, po); }
  }
  // S3: the girl holds out her open hands (they come up and out at the cut's start already held; she breathes; her head bowed to them)
  function girlHands(t) {
    const g = GIRL, U = g.userData, s = U.s, id = P.idle(t, U.ph, { s });
    g.position.set(KN.x + .2, 0, KN.z + 1.0); g.rotation.y = face(1, -.55);
    const rise = ss(T.fill[0], T.fill[1], t), lift = .012 * Math.sin(t * 1.1) + .035 * s * rise, reach = .04 * s * rise;
    const hp = [V(-.05 * s, .74 * s + lift, -.36 * s - reach), V(.05 * s, .745 * s + lift, -.36 * s - reach)];
    P.pose(g, { ...id, side: id.side * .5, twist: id.twist * .3, lean: -.06 - .03 * rise, head: [-.42 + .16 * ss(T.fill[0] + 2.5, T.end - .5, t) + .03 * Math.sin(t * .5), .03 * Math.sin(t * .23)], hands: hp });
    g.updateMatrix();
    U.arms.forEach((A, i) => { A.hand.visible = false; const H2 = HANDS[i]; H2.visible = true;
      const wrist = A.T.clone().applyMatrix4(U.upper.matrix).applyMatrix4(g.matrix), elbow = A.E.clone().applyMatrix4(U.upper.matrix).applyMatrix4(g.matrix);
      const dir = wrist.clone().sub(elbow); dir.y = 0; dir.normalize();
      H2.position.copy(wrist); H2.rotation.set(0, Math.atan2(-dir.x, -dir.z), 0); H2.rotateZ((i ? -1 : 1) * .22); H2.rotateX(.12); });   // palms up, tipped in a little toward each other (cupped)
    const c = HANDS[0].position.clone().add(HANDS[1].position).multiplyScalar(.5).add(V(0, .03, -.05));
    return c;
  }

  // ---------------------------------------------------------------- shots
  function setCam(pos, look) { cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); }
  function magic(h) {   // the sky through the hour: h 0 gold → 1 rose → 2 violet
    const g = Math.min(1, h), v = Math.max(0, h - 1);
    sky.u.top.value.copy(col('#5a6ea0', .5)).lerp(col('#6a5a96', .45), g).lerp(col('#3a3a78', .38), v);
    sky.u.mid.value.copy(col('#e0a87e', .95)).lerp(col('#d88a8e', .85), g).lerp(col('#8a6a9e', .6), v);
    sky.u.horizon.value.copy(col('#ffc88a', 1.6)).lerp(col('#ffa080', 1.35), g).lerp(col('#e08a8a', 1.0), v);
    sky.u.sunGlow.value.copy(col('#ffb878', 1.5)).lerp(col('#ff9070', 1.3), g);
    sunL.color.copy(col('#ffc890')).lerp(col('#ff9a7a'), g); hemi.color.copy(col('#a8a0c8')).lerp(col('#9a88c0'), g).lerp(col('#7a70b0'), v);
    pastelP.u.violet.value = Math.min(1, h * .6);
  }
  function frame(t) {
    const shot = t < T.cut1 ? 'road' : t < T.cut2 ? 'gather' : 'hands';
    all.forEach(g => { g.visible = true; }); HANDS.forEach(h => { h.visible = false; }); hemi.intensity = .6; GIRL.userData.arms.forEach(A => { A.hand.visible = true; });
    if (shot === 'gather') aimSun(V(-.4, 1, 1.5), KN.clone().add(V(2.3, 0, 0)), .028);   // the long lens: the low sun just out of frame left (its light rakes in; no disc behind any head)
    sunL.position.copy(SUN).multiplyScalar(120).add(V(0, 0, -15)); sunL.target.position.set(0, 0, -15); sunLamp.pos.copy(SUN).multiplyScalar(300);
    if (shot === 'road') { cam.fov = 36; cam.updateProjectionMatrix(); } else if (shot === 'hands') { cam.fov = FOV; cam.updateProjectionMatrix(); }
    if (shot === 'road') {
      families(t); disciples(t, shot); kingPose(t, shot);
      RUNS.forEach(r => { r.from = null; });
      // tracking at a child's eye height: the camera keeps pace with the first family (same eased stop), then a slow push
      const f = F[0], ft = famTau(f, t), z = 11.4 - (ft.tau * SPD - famTau(f, T.start).tau * SPD) - .16 * Math.max(0, t - ft.tStop);
      const x = lerp(-1.75, -.95, sine((t - T.start) / (T.cut1 - T.start)));
      setCam(V(x, 1.0, z), V(x + 1.1, 1.05, z - 30));
      { const d = Math.hypot(KP.x - x, KP.z - z); aimSun(V(x, 1, z), KP.clone().add(V(.8, 0, 0)), (1.22 - 1.0) / d); sunL.position.copy(SUN).multiplyScalar(120).add(V(0, 0, -15)); sunLamp.pos.copy(SUN).multiplyScalar(300); }   // the sun just beside him at his shoulder (never a disc round a head)
      film.dofCfg.focus = 10 + 6 * ss(T.block, T.turn[0], t); film.dofCfg.aperture = 3;
      magic(ss(T.start - 6, T.cut1 + 4, t) * .7);
      sunLamp.power = 1600; film.look.exposure = 1.34;
    } else if (shot === 'gather') {
      families(t); RUNS.forEach((r, i) => { r.from = V(...RUN0[i]); });
      F.forEach(f => f.people.forEach(m => { if (!RUNS.some(r => r.g === m.g)) m.g.visible = false; }));   // a new framing down the long lens: the parents stay back, out of it
      disciples(t, shot); kingPose(t, shot);
      // the children who run are taken from their families' poses at the cut (they stand where they stopped), then run
      gather(t);
      const lu = clamp((t - T.cut1) / (T.cut2 - T.cut1)), u = lu * .75 + .25 * sine(lu);   // moving from the first frame (no slow start)
      cam.fov = 28; cam.updateProjectionMatrix();
      cam.fov = 28 - 7 * sine((t - T.lower) / (T.cut2 - T.lower)); cam.updateProjectionMatrix();   // the lens closes in on the gathering
      setCam(V(lerp(-.6, .3, u), lerp(.92, 1.0, u), lerp(3.4, -.4, u)), V(lerp(.15, .35, u), lerp(.95, .7, u), -19.6));   // a slow push with a lateral arc (the gap between the men opens round Him)
      film.dofCfg.focus = lerp(19, 16.7, u); film.dofCfg.aperture = 2.4;
      const bl = ss(T.bloom[0], T.bloom[1], t);
      magic(.75 + .4 * u); sunLamp.power = 2200 + 1800 * bl; film.look.exposure = 1.34 + .05 * bl; sky.u.sunGlow.value.multiplyScalar(1 + .5 * bl);
    } else {
      families(t); RUNS.forEach((r, i) => { r.from = V(...RUN0[i]); });
      F.forEach(f => f.people.forEach(m => { if (!RUNS.some(r => r.g === m.g)) m.g.visible = false; }));
      disciples(t, 'gather'); kingPose(t, shot); gather(t + 30);
      const c = girlHands(t);
      // push-in on detail 3 s (eased), then an almost imperceptible drift: low, in front of her (from his place), the low sun behind
      // her — her bowed head, her cupped empty hands in silhouette, the light gathering in the palms
      // after the push the camera keeps a slow arc round to her side (≈ 9°) and creeps in — the shot never stops (no still stretch)
      const u = sine((t - T.push[0]) / (T.push[1] - T.push[0])), lw = clamp((t - T.push[1]) / (T.end - T.push[1])), w = lw * .8 + .2 * sine(lw);
      const from = c.clone().add(V(.1, .06, -1.95)), to = c.clone().add(V(.06, .07, -1.25)), pos = from.clone().lerp(to, u);
      { const rel = pos.clone().sub(c), a = -.3 * w, ca = Math.cos(a), sa = Math.sin(a); pos.copy(c).add(V(rel.x * ca - rel.z * sa, rel.y + .03 * w, rel.x * sa + rel.z * ca).multiplyScalar(1 - .2 * w)); }
      setCam(pos, c.clone().add(V(.02, -.1 + .02 * u + .03 * w, .1)));
      king.visible = false;   // we are where He kneels: the girl seen from his place, never Him
      aimSun(pos, c.clone().add(V(-.28, 0, 0)), .085); sunL.position.copy(SUN).multiplyScalar(120).add(V(0, 0, -15)); sunLamp.pos.copy(SUN).multiplyScalar(300);
      film.dofCfg.focus = .35; film.dofCfg.aperture = 16;   // round 2: everything behind the drawn hands is soft colour (her sleeves, her robe, the street)
      magic(1.35 + .55 * ss(T.push[0], T.end, t));
      const fl = ss(T.push[0] + .5, T.push[1] + 1, t) * .45 + ss(T.fill[0], T.fill[1], t) * .55;
      palmL.intensity = 0; hemi.intensity = .42; all.forEach(g => { if (g !== GIRL) g.visible = false; });
      glow.material.opacity = 0; handM.emissiveIntensity = 0; HANDS.forEach(h => { h.visible = false; });   // round 2: the hands are drawn in 2D (drawHands)
      sunLamp.power = 700; film.look.exposure = 1.42 + .1 * fl;
    }
    if (shot !== 'hands') { palmL.intensity = 0; glow.material.opacity = 0; }
    renderAll(t);
  }
  // ---------------------------------------------------------------- round 2: the empty hands, drawn (418.3 – 434.7)
  // Coordinator r1: "a close robeMan is a toy — draw a proper pair of small child's hands in soft pastel". Two small hands seen from
  // in front and a little above (from where He kneels): palms up, slightly cupped, the little-finger edges almost touching, fingers
  // toward us in a natural curl (two segments each, the distal one shorter and bending — no straight sticks, no broken joints),
  // thumbs out and turning in. Drawn as a pastel drawing: a soft fill, then fixed strokes (seeded, pinned to the hand — they never
  // crawl) coloured by the light at that spot, a broken rose contour, the paper's tooth; three faint palm creases (the creases the
  // woodcut's first knife line answers). The sunset pools in the cup of the palms and slowly fills them. Behind: her sleeves (drawn,
  // soft) and the 3D frame defocused to colour (her robe, the street, the light).
  const HAND = (() => {
    const r = rng(9191);
    // finger table: [base x, base y, angle from straight down (outward +), length, width] — index (outer) … little (inner)
    const FING = [[.41, .012, .1, .31, .102], [.305, .028, .035, .35, .108], [.2, .028, -.02, .32, .1], [.105, .012, -.08, .25, .088]];
    const strokes = []; for (let i = 0; i < 1500; i++) strokes.push([r() * .68 + .01, r() * 1.0 - .66, (r() - .5) * .5, .025 + r() * .045, .010 + r() * .016, r()]);
    const tooth = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), im = g.createImageData(256, 256), rr = rng(77);
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const v = 200 + 55 * Math.max(0, Math.sin(x * .9 + rr() * 2) * Math.sin(y * .7 + rr() * 2)) - rr() * 40, k = (y * 256 + x) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = v; im.data[k + 3] = 255; }
      g.putImageData(im, 0, 0); return c; })();
    return { FING, strokes, tooth };
  })();
  // the centre line of one finger: base → middle joint (straight) → tip; the curl shortens the distal segment as seen from above
  // and turns it slightly toward the middle finger (a hand at rest)
  function fingerPts(f, sgn, curl) {
    const [bx, by, a, L, w] = f, L1 = L * .56, L2 = L * .44 * (1 - .4 * curl), a2 = a * (1 - .5 * curl);
    const kx = bx + Math.sin(a) * L1, ky = by + Math.cos(a) * L1, tx = kx + Math.sin(a2) * L2, ty = ky + Math.cos(a2) * L2;
    return { b: [bx * sgn, by], k: [kx * sgn, ky], t: [tx * sgn, ty], w };
  }
  function capsule(p, P0, P1, w0, w1) {   // a tapered segment with round ends (added to path p)
    const dx = P1[0] - P0[0], dy = P1[1] - P0[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, a1 = Math.atan2(ny, nx);
    p.moveTo(P0[0] + nx * w0 / 2, P0[1] + ny * w0 / 2); p.lineTo(P1[0] + nx * w1 / 2, P1[1] + ny * w1 / 2); p.arc(P1[0], P1[1], w1 / 2, a1, a1 + Math.PI, true);
    p.lineTo(P0[0] - nx * w0 / 2, P0[1] - ny * w0 / 2); p.arc(P0[0], P0[1], w0 / 2, a1 + Math.PI, a1 + 2 * Math.PI, true); p.closePath();
  }
  // the parts of one hand (each filled on its own so overlaps never punch holes): the palm, eight finger segments, two thumb segments
  function handParts(sgn, curl, thumbA) {
    const X = x => x * sgn, parts = [];   // (a child's palm: a little narrower at the wrist, the thenar full, the heel of the hand round)
    const palm = new Path2D(); palm.moveTo(X(.13), -.58); palm.bezierCurveTo(X(.24), -.62, X(.38), -.62, X(.44), -.56);
    palm.bezierCurveTo(X(.56), -.46, X(.58), -.26, X(.52), -.07); palm.lineTo(X(.49), .015);
    palm.bezierCurveTo(X(.36), .05, X(.2), .05, X(.07), .025); palm.bezierCurveTo(X(.02), -.16, X(.04), -.42, X(.13), -.58); palm.closePath(); parts.push(palm);
    HAND.FING.forEach((f, i) => { const c = fingerPts(f, sgn, curl[i]); const a = new Path2D(); capsule(a, c.b, c.k, c.w, c.w * .92); parts.push(a); const b = new Path2D(); capsule(b, c.k, c.t, c.w * .92, c.w * .78); parts.push(b); });
    const b0 = [X(.47), -.33], m = [b0[0] + sgn * Math.sin(thumbA) * .17, b0[1] + Math.cos(thumbA) * .17], tp = [m[0] + sgn * Math.sin(thumbA - .6) * .13, m[1] + Math.cos(thumbA - .6) * .13];
    const t1 = new Path2D(); capsule(t1, b0, m, .125, .11); parts.push(t1); const t2 = new Path2D(); capsule(t2, m, tp, .11, .092); parts.push(t2);
    return parts;
  }
  const HC = document.createElement('canvas'); HC.width = W; HC.height = H; const hx = HC.getContext('2d');
  function drawHands(ctx, t) {
    const u = sine((t - T.push[0]) / (T.push[1] - T.push[0])), lw = clamp((t - T.push[1]) / (T.end - T.push[1])), w = lw * .8 + .2 * sine(lw);
    const fill = ss(T.push[0] + .4, T.push[1] + 1.2, t) * .4 + ss(T.fill[0], T.fill[1], t) * .6;   // the light pooling in the palms
    const S0 = W * .72 * lerp(.8, 1, u) * (1 + .05 * w), cx = W / 2 + 6 * Math.sin(t * .21) * (1 - u * .5), cy = H * .45 - .03 * S0 * fill + 4 * Math.sin(t * .37);
    const M0 = new DOMMatrix().translate(cx, cy).rotate((.02 * Math.sin(t * .17) - .015 * w) * 57.3).scale(S0, S0);
    const MH = sgn => M0.translate(-sgn * .06, 0);   // the two hands close together, little-finger edges almost touching
    // the sleeves: soft robe-coloured shapes from the top of the frame narrowing into the cuffs (behind the hands)
    ctx.save(); ctx.setTransform(M0); ctx.filter = 'blur(16px)';
    for (const sgn of [-1, 1]) { const sl = new Path2D(); sl.moveTo(sgn * .1, -.58); sl.bezierCurveTo(sgn * .06, -.85, sgn * .02, -1.2, sgn * -.02, -1.7); sl.lineTo(sgn * .62, -1.7); sl.bezierCurveTo(sgn * .58, -1.2, sgn * .52, -.86, sgn * .48, -.58); sl.closePath();
      const g = ctx.createLinearGradient(0, -1.5, 0, -.56); g.addColorStop(0, 'rgba(96,70,110,0)'); g.addColorStop(.5, 'rgba(150,108,124,.8)'); g.addColorStop(1, 'rgba(196,146,132,.92)'); ctx.fillStyle = g; ctx.fill(sl); }
    ctx.filter = 'none'; ctx.restore();
    // the hands, composed off screen: a soft contour (the silhouette stroked, behind), the fills, then strokes / creases / pads / tooth
    // painted only where the hand is (source-atop) — so the contour is the outer edge only
    hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W, H); hx.setTransform(M0);
    const sets = [-1, 1].map(sgn => ({ sgn, curl: HAND.FING.map((f, i) => .6 + .05 * Math.sin(t * .8 + i * 1.3 + (sgn > 0 ? 0 : 2)) + .06 * fill), thumbA: .62 + .05 * Math.sin(t * .6 + sgn) }));
    for (const st of sets) { hx.setTransform(MH(st.sgn)); st.parts = handParts(st.sgn, st.curl, st.thumbA); hx.strokeStyle = 'rgba(122,64,70,.85)'; hx.lineWidth = .02; hx.lineJoin = 'round'; for (const p of st.parts) hx.stroke(p); }
    for (const st of sets) { hx.setTransform(MH(st.sgn)); const pc = [st.sgn * .3, -.26], g = hx.createRadialGradient(pc[0], pc[1], .02, pc[0], pc[1], .6);
      g.addColorStop(0, 'rgb(' + (lerp(172, 255, fill) | 0) + ',' + (lerp(108, 212, fill) | 0) + ',' + (lerp(96, 150, fill) | 0) + ')'); g.addColorStop(.45, '#d6987e'); g.addColorStop(1, '#efc29c');
      hx.fillStyle = g; for (const p of st.parts) hx.fill(p); }
    hx.globalCompositeOperation = 'source-atop'; hx.lineCap = 'round';
    for (const st of sets) { const sgn = st.sgn, pc = [sgn * .3, -.26]; hx.setTransform(MH(sgn));
      for (const [x0, y0, da, L, wd, rr] of HAND.strokes) { const x = x0 * sgn, y = y0, dc = Math.hypot(x - pc[0], (y - pc[1]) * 1.15), edge = clamp((dc - .22) / .35), pool = Math.exp(-dc * dc / .03) * fill;
        const cr = lerp(lerp(196, 244, edge), 255, pool), cg = lerp(lerp(124, 190, edge), 228, pool), cb = lerp(lerp(114, 152, edge), 170, pool), j = (rr - .5) * 18, a = -.7 + da;
        hx.strokeStyle = 'rgba(' + (cr + j | 0) + ',' + (cg + j * .8 | 0) + ',' + (cb + j * .6 | 0) + ',.5)'; hx.lineWidth = wd; hx.beginPath(); hx.moveTo(x, y); hx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); hx.stroke(); }
      hx.strokeStyle = 'rgba(146,82,80,.32)'; hx.lineWidth = .008;   // the palm creases (heart, head, life line)
      for (const c of [[[.1, -.07], [.24, -.12], [.38, -.1], [.5, -.17]], [[.1, -.2], [.24, -.24], [.38, -.26], [.52, -.34]], [[.45, -.06], [.36, -.2], [.36, -.38], [.44, -.54]]]) { hx.beginPath(); hx.moveTo(c[0][0] * sgn, c[0][1]); hx.bezierCurveTo(c[1][0] * sgn, c[1][1], c[2][0] * sgn, c[2][1], c[3][0] * sgn, c[3][1]); hx.stroke(); }
      HAND.FING.forEach((f, i) => { const c = fingerPts(f, sgn, st.curl[i]), nx = c.k[1] - c.b[1], ny = -(c.k[0] - c.b[0]), l = Math.hypot(nx, ny) || 1;
        hx.strokeStyle = 'rgba(150,86,82,.3)'; hx.lineWidth = .007; hx.beginPath(); hx.moveTo(c.k[0] - nx / l * c.w * .34, c.k[1] - ny / l * c.w * .34); hx.lineTo(c.k[0] + nx / l * c.w * .34, c.k[1] + ny / l * c.w * .34); hx.stroke();
        const pg = hx.createRadialGradient(c.t[0], c.t[1] - .008, 0, c.t[0], c.t[1], c.w * .5); pg.addColorStop(0, 'rgba(255,228,200,.55)'); pg.addColorStop(1, 'rgba(255,228,200,0)'); hx.fillStyle = pg; hx.fillRect(c.t[0] - c.w, c.t[1] - c.w, c.w * 2, c.w * 2);
        // the shadow line between touching fingers (they lie together, a hand at rest)
        if (i < 3) { const c2 = fingerPts(HAND.FING[i + 1], sgn, st.curl[i + 1]); hx.strokeStyle = 'rgba(140,76,76,.28)'; hx.lineWidth = .008; hx.beginPath(); hx.moveTo((c.b[0] + c2.b[0]) / 2, (c.b[1] + c2.b[1]) / 2 + .02); hx.lineTo((c.k[0] + c2.k[0]) / 2, (c.k[1] + c2.k[1]) / 2); hx.stroke(); } }); }
    hx.setTransform(1, 0, 0, 1, 0, 0); hx.globalCompositeOperation = 'source-atop'; hx.globalAlpha = .16; hx.fillStyle = hx.createPattern(HAND.tooth, 'repeat'); hx.fillRect(0, 0, W, H);   // the paper's tooth, on the hands only
    hx.globalAlpha = 1; hx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(HC, 0, 0);
    // the light pooling in the cupped palms, then filling them (soft, never an orb)
    if (fill > 0) { ctx.setTransform(M0); ctx.globalCompositeOperation = 'lighter';
      for (const sgn of [-1, 1]) { ctx.setTransform(MH(sgn)); const g = ctx.createRadialGradient(sgn * .3, -.26, 0, sgn * .3, -.26, .18 + .3 * fill); g.addColorStop(0, 'rgba(255,200,130,' + (.4 * fill) + ')'); g.addColorStop(.5, 'rgba(255,160,110,' + (.16 * fill) + ')'); g.addColorStop(1, 'rgba(255,140,100,0)'); ctx.fillStyle = g; ctx.fillRect(-1.2, -1.2, 2.4, 2.4); } }
    ctx.restore();
  }
  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    frame(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    if (t >= T.cut2 && t < T.end + .5) drawHands(ctx, t);
  }

  S.updateMatrixWorld(true);
  return { film, draw, beats: () => T, people: { F, D, king, GIRL } };
}
