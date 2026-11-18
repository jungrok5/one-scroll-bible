// heal-village.js — 「kingdom」 2부: "왕이 오신 곳에서는 무슨 일이 일어났을까요?" (N43 · N44 · Q41 Lk 7:22), a painted 3D Galilee
// village at the end of the afternoon, in the cinematic-3d engine (lib3d/cine.js: height fog, sun in-scatter, bloom, depth of
// field, grain). After 「Ben-Hur」 (OPUSCAR 32): low sun, dust, a light that washes the leper clean; the rack focus is the blind
// man's eyes.
// Round 2 (owner, 2026-11-19): the village starts at N43 (the King already walking the road while "하나님 나라가 가까이 왔다"
// is said), the healings breathe (≈ 3.5 s each, soft dissolves, slow moves), every healing is a mid-distance backlit framing
// (no big toy-like figures), and nobody walks like a doll or stands frozen (people3d.js: planted feet, IK limbs, life).
// Seven shots, soft dissolves (0.6 s) between them:
//   S1 N43  tracking behind the King (back only, small, on the sun's axis) walking up the road; people sitting by it lift their
//           heads as he passes, one after another (a ripple, not in unison). In from the white of the gold point.
//   S2      high and wide: the King small in the road from above; heads turn after him; a child tugs at a seated man's sleeve.
//   S3 N44→ the blind man's eyes: the picture is a blur under "왕이 오신 곳에서는 …?" and racks into focus (2.8 s) on the road,
//           the sun, the man standing far off in it; then the eye-line rises — he gets up.
//   S4 못 걷는 사람이 걸으며  side-back, mid distance: he straightens off his crutch, it falls into the dust, he walks (real steps).
//   S5 나병환자가 깨끗함을 받으며  3/4 from behind (the owner accepted round 1's version), pulled back: the band of light washes the
//           spots off his wrappings, his arms rise into the light.
//   S6 귀먹은 사람이 들으며 · 죽은 자가 살아나며  one shot: the deaf man by the wall lifts his head and his hand goes to his ear;
//           focus pulls past him to the bier in the road, where the young man sits up; the mourners step back, one by one.
//   S7 가난한 자에게 복음이  crane up over the ring round the small figure in the road, people still coming out of the houses;
//           the camera tilts to the sun and the light from above fills the frame (match cut to the roof hole, N45).
// Rules kept: the King is never shown by face — from behind, small from high, or far off against the sun; no halo; men in
// head cloths to the shoulders, no long hair; no words.
//
// API: const HV = await (await import('./heal-village.js')).build(W, H);  HV.draw(ctx, t, B)  t = FILM seconds,
//      B = line times from script.json (N43 N44 Q41 N45). Every visual time comes from B in beats(). Pure in t.
import { Film, THREE, V, col, rng, noise1 } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const lv = (a, b, k) => a.clone().lerp(b, k);

// ---------------------------------------------------------------- the one table: shots from the line times
export function beats(B) {
  const n43 = B.N43, n44 = B.N44, q = B.Q41, e = B.N45, D = .3;   // D: half a dissolve
  const T = { start: n43, white1: n43 + 1.2, end: e };
  const cuts = [n43, n43 + 5.2, n44 + 1.7, q + 1.4, q + 5.0, q + 8.5, q + 12.0, e];   // S1 … S7
  T.shots = cuts.slice(0, -1).map((a, i) => [i ? a - D : a, i < 6 ? cuts[i + 1] + D : e]);
  T.walk0 = n43 - .6;                           // the King's walk (he is already walking as we arrive)
  T.rack = [n44 + 2.0, n44 + 4.8];              // S3 the blur racks into focus (2.8 s) — under N44's question
  T.rise = [n44 + 4.4, q + 1.2];                   // S3 he gets up (the eye-line rises)
  T.straight = [q + 1.7, q + 2.6];              // S4 the lame man straightens off the crutch
  T.crutch = q + 2.55;                          // S4 the crutch tips (falls .7 s)
  T.step = q + 3.0;                             // S4 his first step
  T.wash = [q + 5.6, q + 7.4];                  // S5 the band of light climbs over the leper
  T.lift = [q + 8.8, q + 9.9];                  // S6 the deaf man's head lifts and turns
  T.ear = [q + 9.0, q + 9.9];                   // S6 his hand goes to his ear
  T.birds = q + 9.1;
  T.rackB = [q + 9.8, q + 10.5];                // S6 focus pulls to the bier
  T.sit = [q + 10.1, q + 11.7];                 // S6 the young man sits up
  T.tilt = [e - 1.25, e];                       // S7 tilt to the sun, light fills the frame
  return T;
}

export async function build(W, H) {
  const vert = H > W, FOV = vert ? 46 : 32;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .05, far: 3000,
    atmos: { density: .012, falloff: .045, base: 0, start: 2, color: col('#c99a64', .62), colorUp: col('#b7a58c', .55), max: 1400, scatter: 1, anisotropy: .78, phaseMix: .85 },
    bloom: { strength: .06, radius: 1.1, tint: col('#ffe2b8') },
    dof: { focus: 12, aperture: 3, maxCoc: 26 },
    look: { exposure: 1.05, contrast: 1.04, saturation: 1.02, lift: col('#0c0906'), shadowTint: col('#d8d0e8'), highTint: col('#fff0d8'), vignette: .3, grain: .035, ca: .35 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera;
  let T = null;

  // ---------------------------------------------------------------- light: a low sun up the road (−z), a little to the left
  const SUN = V(-.06, .16, -1).normalize(), SUNP = SUN.clone().multiplyScalar(300);
  const sky = K.sky(film, { top: col('#5d7aa6', .55), mid: col('#d6aa78', .95), horizon: col('#ffcf8c', 1.7), sunDir: SUN, sunColor: col('#fff1d0', 26), sunGlow: col('#ffc27a', 1.6), clouds: .3, cloudColor: col('#ffe2b8', 1.1), cloudShade: col('#b88e72', .7) });
  const hemi = new THREE.HemisphereLight(col('#a6b4cc'), col('#7a5a3a'), .55); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffd39a'), 3.2); sunL.position.copy(SUN.clone().multiplyScalar(120)).add(V(0, 0, -40)); sunL.target.position.set(0, 0, -40);
  sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); Object.assign(sunL.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 400 }); sunL.shadow.bias = -.0004; sunL.shadow.normalBias = .04;
  S.add(sunL, sunL.target);
  const sunLamp = film.lamp(SUNP, '#ffcf90', { power: 2200, size: 60, fog: 1 });

  // ---------------------------------------------------------------- materials
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;
  // plastered fieldstone (Galilean basalt below, lime plaster above, weathered): world-space, no UVs needed
  const wallM = (base, key) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .92 });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + hashGLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 N = normalize(vWN); vec2 q = abs(N.y) > .7 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
            float big = fb(q * .35 + 3.1), fine = fb(q * 3.1), stone = smoothstep(.45, .6, fb(q * 1.6 + 7.)) ;
            float base = 1. - smoothstep(.6, 1.6, vWP.y + (big - .5) * .8);                 // the dark stone footing
            vec3 c = diffuseColor.rgb * mix(.82, 1.1, big) * mix(.9, 1.06, fine);
            c = mix(c, vec3(.16, .14, .13) * mix(.8, 1.2, fine), base * .75 * (1. - stone * .3));
            c *= mix(1., .82, smoothstep(.62, .8, fb(vec2(q.x * 4., q.y * .4))) * (1. - abs(N.y)));   // rain streaks
            diffuseColor.rgb = c; }`); };
    m.customProgramCacheKey = () => 'hv-wall-' + key; return m; };
  const M = {
    wall: wallM('#d8bf98', 'a'), wall2: wallM('#c9a47a', 'b'), wall3: wallM('#e2cfae', 'c'),
    roof: K.std('#8a7458', { roughness: .95 }), dark: K.std('#1a120c', { roughness: 1 }), wood: K.std('#6a4a2c', { roughness: .85 }),
    leaf: K.std('#5f6a4a', { roughness: .9 }), trunk: K.std('#4a3a2a', { roughness: .95 }), palm: K.std('#4f6a3c', { roughness: .85, side: THREE.DoubleSide }),
  };
  // the ground: packed dust, ruts along the road, scattered stones, darker at the edges
  const groundM = new THREE.MeshStandardMaterial({ color: '#c8a678', roughness: 1 });
  groundM.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;\n' + hashGLSL)
      .replace('#include <map_fragment>', `#include <map_fragment>
        { vec2 q = vWP.xz; float n = fb(q * .25), f = fb(q * 2.3), road = 1. - smoothstep(2.2, 3.4, abs(vWP.x + sin(vWP.z * .05) * .6));
          float rut = road * (exp(-pow((abs(vWP.x) - .75) / .16, 2.)) * .5) * (.6 + .4 * fb(vec2(q.y * .5, 0.)));
          float st = smoothstep(.72, .78, fb(q * 3.7 + 5.)) * (1. - road * .7);
          vec3 c = diffuseColor.rgb * mix(.8, 1.08, n) * mix(.92, 1.05, f);
          c = mix(c, c * vec3(1.06, 1.02, .95), road * .6); c *= 1. - rut * .25; c = mix(c, vec3(.42, .36, .3), st * .6);
          c = mix(c, vec3(.5, .52, .36), smoothstep(.55, .75, fb(q * .6 + 9.)) * (1. - road) * .45);   // dry grass off the road
          diffuseColor.rgb = c; }`); };
  groundM.customProgramCacheKey = () => 'hv-ground';
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600, 1, 1), groundM); ground.rotation.x = -Math.PI / 2; ground.position.z = -300; ground.receiveShadow = true; S.add(ground);

  // ---------------------------------------------------------------- the village
  const R = rng(4242), V3 = [];
  const house = (x, z, w, d, h, side, m) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
    const box = (bw, bh, bd, px, py, pz, mat) => { const b = new THREE.Mesh(K.roundedBox(bw, bh, bd, .08, 2), mat); b.position.set(px, py, pz); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
    box(w, h, d, 0, h / 2, 0, m);
    box(w + .16, .22, d + .16, 0, h + .05, 0, M.roof);                                                          // the flat roof's edge
    for (const s2 of [-1, 1]) box(w, .35, .14, 0, h + .3, s2 * d / 2, m);                                       // the parapet
    if (R() < .5) box(w * .45, h * .6, d * .5, (R() - .5) * w * .3, h + h * .3, (R() - .5) * d * .3, m);         // an upper room
    const door = new THREE.Mesh(new THREE.PlaneGeometry(.95, 1.85), M.dark); door.position.set(-side * (w / 2 + .01) * 0, .93, 0);   // placed below
    door.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; door.position.set(side < 0 ? w / 2 + .012 : -w / 2 - .012, .93, (R() - .5) * d * .4); g.add(door);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(.4, .45), M.dark); win.rotation.y = door.rotation.y; win.position.set(door.position.x, h * .7, door.position.z + (R() < .5 ? 1.4 : -1.4)); g.add(win);
    if (R() < .45) { const st = box(.9, .1, d * .7, (side < 0 ? 1 : -1) * 0, 0, 0, m); st.position.set((side < 0 ? -1 : 1) * (w / 2 + .45), h / 2, 0); st.rotation.x = Math.atan2(h, d * .7) * (R() < .5 ? 1 : -1); }   // outside stair
    return g;
  };
  // both sides of the road, from behind the camera's start to the far end; lanes between some houses
  for (const side of [-1, 1]) { let z = 22; while (z > -150) { const w = 5 + R() * 3.5, d = 6 + R() * 3, h = 2.7 + R() * 1.5, x = side * (4.3 + w / 2 + R() * 1.4);
      const m = [M.wall, M.wall2, M.wall3][(R() * 3) | 0];
      if (!(side < 0 && z < -60 && z > -80)) house(x, z - d / 2, w, d, h, side, m);   // an opening on the left for the bier's square
      // a low courtyard wall in the gap to the next house
      const gap = 1.5 + R() * 3.5, cw = new THREE.Mesh(K.roundedBox(.45, 1.1 + R() * .4, gap, .08, 2), m); cw.position.set(side * (4.5 + R() * .4), .6, z - d - gap / 2); cw.castShadow = cw.receiveShadow = true; S.add(cw);
      z -= d + gap; } }
  // olive trees (bare kit tree + grey-green leaf clumps), a few date palms, far hills in the haze
  const olive = (x, z, h, seed) => { const tr = K.tree({ seed, height: h, trunk: .2, depth: 4, spread: .7, up: .2, twig: 0, mat: M.trunk, layer: 0 }); tr.position.set(x, 0, z); S.add(tr);
    const r = rng(seed), n = 46, geo = new THREE.IcosahedronGeometry(.55, 0), inst = new THREE.InstancedMesh(geo, M.leaf, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * h * .38, y = h * (.55 + r() * .35); m4.compose(V(x + Math.cos(a) * rr, y, z + Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, 0)), V(1, .7, 1).multiplyScalar(.7 + r() * .8)); inst.setMatrixAt(i, m4); }
    inst.castShadow = true; S.add(inst); };
  for (const [x, z, h] of [[-9, -18, 5.5], [10, -34, 6], [-12, -52, 6.5], [9, -86, 5], [-8, -104, 6], [13, -6, 5], [-14, 4, 6]]) olive(x, z, h, (x * 7 + z) | 0);
  const palm = (x, z, h, seed) => { const r = rng(seed), segs = [], g = new THREE.Group(); let p = V(x, 0, z), d = V((r() - .5) * .3, 1, (r() - .5) * .3).normalize();
    for (let i = 0; i < 10; i++) { const e = p.clone().addScaledVector(d, h / 10); segs.push(p.x, p.y, p.z, e.x, e.y, e.z, .2 - i * .008, .19 - i * .008); p = e; d.add(V(.02, 0, 0)).normalize(); }
    g.add(new THREE.Mesh(K.tubesGeometry(segs, 7), M.trunk));
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + r(), L = 2.6 + r() * .8, fg = new THREE.PlaneGeometry(L, .45, 8, 1); fg.translate(L / 2, 0, 0);
      const pos = fg.attributes.position; for (let k = 0; k < pos.count; k++) { const u = pos.getX(k) / L; pos.setY(k, pos.getY(k) * (1 - u * .7) - u * u * 1.2); } fg.computeVertexNormals();
      const f = new THREE.Mesh(fg, M.palm); f.position.copy(p); f.rotation.set(0, a, .35 + r() * .3); f.castShadow = true; g.add(f); }
    S.add(g); };
  palm(-8.5, -40, 9, 3); palm(11, -60, 10, 5); palm(-10, -128, 11, 7);
  { const hm = new THREE.MeshStandardMaterial({ color: '#a48a6c', roughness: 1 });
    for (let i = 0; i < 9; i++) { const g = new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), r = rng(70 + i), pos = g.attributes.position;
      for (let k = 0; k < pos.count; k++) { const y = pos.getY(k); pos.setY(k, y * (1 + .25 * noise1(pos.getX(k) * 3 + i, i))); } g.computeVertexNormals();
      const m = new THREE.Mesh(g, hm); m.scale.set(140 + r() * 120, 26 + r() * 30, 80 + r() * 60); m.position.set((i - 4) * 120 + r() * 60, -4, -380 - r() * 260); S.add(m); } }

  // ---------------------------------------------------------------- people (people3d.js: IK limbs, planted feet, life)
  const robes = ['#8a7356', '#6e5a44', '#a08a6a', '#5a5048', '#7c6650', '#9a7a52', '#4e5a66', '#6a5a4a'];
  const personMats = robes.map(c => K.std(c, { roughness: .95, side: THREE.DoubleSide }));
  const skinM = K.std('#8a5e3e', { roughness: .8 });
  const mk = (o) => P.man({ skin: skinM, ...o, mat: o.mat || personMats[0] });
  const place = (o, x, z, ry) => { o.position.set(x, 0, z); o.rotation.y = ry; S.add(o); return o; };
  const face = (dx, dz) => Math.atan2(-dx, -dz);   // the rotation.y that turns a man (facing −z) toward (dx, dz)
  // the King: a plain undyed robe, a darker head cloth like every man's — no mark, no glow; small, from behind or far off
  const kingM = K.std('#b9a88a', { roughness: .95, side: THREE.DoubleSide }), kingC = K.std('#8c7a5e', { roughness: .95, side: THREE.DoubleSide });
  const king = place(mk({ h: 1.74, mat: kingM, cloth: kingC }), 0, -5, 0);
  const KX = .3, KV = .52 / .55;   // his line up the road and his speed (one step = .52 m every .55 s)
  const kingZ = t => -5 - Math.max(0, t - T.walk0) * KV;
  // the seated people along the road (S1/S2): each has his own phase, his own delay; the child tugging at a sleeve
  const sitters = [];
  { const r = rng(91); for (let i = 0; i < 18; i++) { const side = i % 2 ? 1 : -1, z = -6 - i * 1.2 - r() * .8, x = side * (2.6 + r() * .7);
      const p = place(mk({ kind: 'sit', h: 1.6 + r() * .2, mat: personMats[(r() * 8) | 0], broad: .9 + r() * .2 }), x, z, face(-side, (r() - .5) * .8));
      p.userData.bow = .3 + r() * .25; p.userData.ph = r(); p.userData.dl = r() * .9; p.userData.point = r() < .2; sitters.push(p); } }
  const child = place(mk({ h: 1.08, mat: personMats[5], child: true }), 0, 0, 0), parent = sitters[7];
  child.position.set(parent.position.x + (parent.position.x > 0 ? -.55 : .55), 0, parent.position.z + .45);
  child.rotation.y = face(parent.position.x - child.position.x, parent.position.z - child.position.z);
  // the healings' places (S3 the blind man's eyes, S4 the lame man, S5 the leper, S6 the deaf man and the bier, S7 the ring)
  const P2 = V(-2.6, 0, -30), P3 = V(2.3, 0, -46), P4 = V(-1.4, 0, -55), P5 = V(2.8, 0, -61.5), P6 = V(-.9, 0, -71), P7 = V(0, 0, -86);
  const KB = V(-.5, 0, -42);   // where the King stands in the blind man's eyes (12 m off, against the sun, small)
  // the few others the blind man sees, sitting along the road (they stay where they are)
  const others = [[-3.0, -37.5, 1], [2.8, -39.5, -1], [3.1, -42.5, -1], [-3.2, -46, 1]].map(([x, z, sd], i) => { const p = place(mk({ kind: 'sit', h: 1.65, mat: personMats[(i * 3 + 2) % 8] }), x, z, face(sd, -.2)); p.userData.ph = i * .37; return p; });
  // S4: the lame man, bent over his crutch (a staff with a crosspiece under his right arm, his right hand on the grip)
  const lame = place(mk({ h: 1.72, mat: personMats[3], broad: .95 }), P3.x, P3.z, face(-.35, -1));
  const crutch = new THREE.Group(); { const st = new THREE.Mesh(new THREE.CylinderGeometry(.022, .026, 1.3, 7), M.wood); st.position.y = .65; crutch.add(st);
    const top = new THREE.Mesh(K.roundedBox(.34, .05, .06, .02, 2), M.wood); top.position.y = 1.31; crutch.add(top); crutch.traverse(o => { if (o.isMesh) o.castShadow = true; }); S.add(crutch); }
  // S5: the leper — covered head to foot (Lev 13:45), patches on his wrappings; a band of light climbs over him and the patches
  // are gone behind it; he lifts his hands into the light
  const washU = { uW: { value: -1 }, uO: { value: V() } };
  const lepM = new THREE.MeshStandardMaterial({ color: '#a39478', roughness: .95, side: THREE.DoubleSide });
  lepM.onBeforeCompile = sh => { Object.assign(sh.uniforms, washU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform float uW; uniform vec3 uO;\n' + hashGLSL)
      .replace('#include <map_fragment>', `#include <map_fragment>
        { vec3 q = vWP - uO; float dk = smoothstep(.55, .63, fb(q.xy * 7. + q.z * 5.)), pl = smoothstep(.62, .68, fb(q.yz * 9. + 3.));
          float clean = smoothstep(-.03, .03, uW - q.y);
          vec3 c = diffuseColor.rgb; c = mix(c, vec3(.22, .14, .1), dk * .9 * (1. - clean)); c = mix(c, vec3(.95, .88, .8), pl * .8 * (1. - clean));
          diffuseColor.rgb = mix(c, c * 1.12, clean); }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { vec3 q = vWP - uO; float band = exp(-pow((uW - q.y) / .06, 2.)); totalEmissiveRadiance += vec3(1., .8, .5) * band * 2.6 * (1. - smoothstep(1.2, 1.55, uW)); }`); };
  lepM.customProgramCacheKey = () => 'hv-leper';
  const leper = place(mk({ h: 1.7, mat: lepM, hood: true }), P4.x, P4.z, .1);
  // S6: the deaf man sitting by the wall, facing up the road, head bowed
  const deaf = place(mk({ kind: 'sit', h: 1.7, mat: personMats[4], broad: 1.05 }), P5.x, P5.z, face(-.25, -1));
  // S6: the bier (two poles, a plank bed), the shroud over a young man who sits up, mourners round it
  const bier = new THREE.Group(); { const pole = (sd) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 2.9, 7), M.wood); p.rotation.x = Math.PI / 2; p.position.set(sd * .36, .42, 0); return p; };
    bier.add(pole(-1), pole(1)); const bed = new THREE.Mesh(K.roundedBox(.78, .05, 1.95, .02, 2), M.wood); bed.position.y = .45; bier.add(bed);
    for (const [x, z] of [[-.36, -.8], [.36, -.8], [-.36, .8], [.36, .8]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .42, 6), M.wood); l.position.set(x, .21, z); bier.add(l); }
    bier.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); bier.position.copy(P6); bier.rotation.y = .35; S.add(bier); }
  const shroudU = 36, shroudV = 14, SL = 1.9, SW = .82;
  const shroudG = new THREE.PlaneGeometry(SW, SL, shroudV, shroudU); shroudG.rotateX(-Math.PI / 2);
  const shroudM = K.std('#e2d9c6', { roughness: .9, side: THREE.DoubleSide }), shroud = new THREE.Mesh(shroudG, shroudM); shroud.castShadow = shroud.receiveShadow = true; bier.add(shroud);
  const sBase = shroudG.attributes.position.array.slice();
  const bodyH = (x, z) => { const u = (z + SL / 2) / SL, head = Math.exp(-(((u - .08) / .05) ** 2)) * .17, chest = Math.exp(-(((u - .32) / .16) ** 2)) * .2, legs = Math.exp(-(((u - .7) / .25) ** 2)) * .13, feet = Math.exp(-(((u - .95) / .04) ** 2)) * .14;
    const w = Math.exp(-((x / (u < .14 ? .1 : u < .55 ? .22 : .16)) ** 2) * 1.4); return (Math.max(head, chest, legs, feet)) * w; };
  const hipZ = -SL / 2 + SL * .5, young = new THREE.Group(); young.position.set(0, .5, hipZ); bier.add(young);
  { const lin = K.std('#ddd3bf', { roughness: .9 }), torso = new THREE.Mesh(new THREE.CapsuleGeometry(.16, .42, 4, 12), lin); torso.scale.set(1.25, 1, .8); torso.position.y = .32; young.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.1, 14, 10), skinM); head.position.y = .72; young.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.104, 14, 8, 0, Math.PI * 2, 0, Math.PI * .45), K.std('#1c1410', { roughness: 1 })); hair.position.y = .72; hair.rotation.x = -.35; young.add(hair);
    for (const sd of [-1, 1]) { const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.05, .38, 3, 8), lin); arm.position.set(sd * .2, .3, -.04); arm.rotation.x = .25; young.add(arm); }
    young.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); }
  function shroudAt(k) {
    const pos = shroudG.attributes.position, a = eio(k), fall = eio(clamp((k - .05) / .6));
    young.rotation.x = lerp(-Math.PI / 2 + .06, -.12, a);
    for (let i = 0; i < pos.count; i++) { const x = sBase[i * 3], z0 = sBase[i * 3 + 2];
      let y = .48 + bodyH(x, z0) + .012, z = z0;
      if (z0 < hipZ) { const d = hipZ - z0; z = lerp(z0, hipZ - d * .18, fall); y = lerp(y, .5 + .14 + .1 * Math.sin(d * 9) * (1 - d / SL) + bodyH(x, hipZ) * .5, fall); }
      pos.setXYZ(i, x * (1 + .06 * Math.sin(z * 9)) * (z0 < hipZ ? lerp(1, .9, fall) : 1), y, z); }
    pos.needsUpdate = true; shroudG.computeVertexNormals(); young.visible = k > .02; }
  shroudAt(0);
  // the mourners stand round the bier (bier frame); each reacts on his own delay when the young man sits up
  const mourners = [[-1.3, -.7], [1.35, -.5], [-.6, -1.75], [.75, -1.85], [-2.1, .3], [2.2, .1], [1.0, 1.9]].map(([x, z], i) => { const p = mk({ h: 1.62 + (i % 3) * .06, mat: personMats[(i * 3 + 1) % 8] });
    p.position.set(x, 0, z); p.rotation.y = face(-x, -z); p.userData.ph = i * .23 + .1; p.userData.dl = [0, .25, .55, .15, .7, .4, .9][i]; p.userData.x0 = x; p.userData.z0 = z; bier.add(p); return p; });
  // S7: the ring of people sitting round him in the road; more coming from the doors (they walk, feet planted)
  const ring = new THREE.Group(); ring.position.copy(P7); S.add(ring);
  const kingR = mk({ h: 1.74, mat: kingM, cloth: kingC }); kingR.rotation.y = .4; ring.add(kingR);
  const ringP = []; { const r = rng(717); for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283 + r() * .2, rr = 2.0 + (i % 3) * .75 + r() * .3; const p = mk({ kind: 'sit', h: 1.55 + r() * .25, mat: personMats[(r() * 8) | 0] });
      p.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); p.rotation.y = face(-Math.cos(a), -Math.sin(a)); p.userData.ph = r(); ring.add(p); ringP.push(p); } }
  const comers = [0, 1, 2, 3, 4].map(i => { const side = i % 2 ? 1 : -1, p = mk({ h: 1.64 + (i % 2) * .06, mat: personMats[(i * 5 + 2) % 8] }); S.add(p);
    const p0 = V(side * 4.4, 0, P7.z + [-9, -7, 7, 9, -11][i]), dir = V(P7.x - p0.x, 0, P7.z - p0.z).normalize(); p.userData.i = i; p.userData.p0 = p0; p.userData.dir = dir; p.position.copy(p0); p.rotation.y = face(dir.x, dir.z); return p; });
  const everyone = [king, child, lame, leper, deaf, ...sitters, ...others, ...comers];
  const life = (p, t, extra = {}) => { const ph = p.userData.ph || 0, U = p.userData;
    if (U.kind === 'stand') return P.pose(p, { ...P.idle(t, ph, { s: U.s }), ...extra });
    P.pose(p, { breath: P.breath(t, ph), lean: .03 * Math.sin(t * .3 + ph * 7), twist: .04 * Math.sin(t * .23 + ph * 5), head: [-(U.bow ?? .1) + .04 * Math.sin(t * .4 + ph * 9), .06 * Math.sin(t * .19 + ph * 4)],
      hands: [V(-.17 * U.s, .32 * U.s, -.3 * U.s), V(.17 * U.s, .32 * U.s, -.28 * U.s)], ...extra }); };
  // a walker: from p0 along dir, feet planted (P.walk), facing dir
  const walkOn = (p, t, t0, p0, dir, o = {}) => { const w = P.walk(p, t, t0, o); p.position.copy(p0).addScaledVector(dir, w.dist); p.position.y = 0; p.rotation.y = face(dir.x, dir.z); P.pose(p, { ...w, breath: .5, head: o.head || [0, 0] }); return w; };

  // dust in the low sun: a few lit motes near the camera (tens, not a field), and the S3 puff
  const dustU = { uT: { value: 0 }, uA: { value: 1 }, uPx: { value: H / 1920 }, uC: { value: V() } };
  { const n = 140, Rr = rng(57), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (Rr() - .5) * 7; p[i * 3 + 1] = Rr() * 3.5; p[i * 3 + 2] = -Rr() * 12; sd[i] = Rr(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx; uniform vec3 uC; varying float vA;
        void main(){ vec3 q = position + uC; q.y += mod(uT * (.05 + .06 * aS) + aS * 3.5, 3.5) - 1.75 * aS; q.x += sin(uT * .4 + aS * 30.) * .3; q.z += cos(uT * .3 + aS * 17.) * .3;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (2. + 4. * aS) * 12. / d, 1., 12.); vA = clamp(1.2 - d / 12., 0., 1.) * (.4 + .6 * aS); }`,
      fragmentShader: `uniform float uA; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 14.); gl_FragColor = vec4(vec3(1., .86, .62) * 1.6, a * vA * uA); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; S.add(pts); }
  const puffU = { uK: { value: 0 }, uP: { value: V() } };
  { const n = 60, Rr = rng(5), p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = Rr() * 6.283; p[i * 3] = Math.cos(a) * Rr(); p[i * 3 + 1] = Rr() * .5; p[i * 3 + 2] = Math.sin(a) * Rr(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.ShaderMaterial({ uniforms: puffU, transparent: true, depthWrite: false,
      vertexShader: `uniform float uK; uniform vec3 uP; varying float vA; void main(){ vec3 q = uP + position * vec3(.6, 1., .6) * (.15 + uK * .9); q.y *= .4 + uK; vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(220. / -mv.z * (.5 + uK), 2., 120.); vA = (1. - uK) * step(.001, uK); }`,
      fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 10.); gl_FragColor = vec4(vec3(.86, .72, .54), a * vA * .16); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; S.add(pts); }
  // birds that lift off a roof in S5 (small dark V shapes)
  const birds = []; { const bm = new THREE.MeshBasicMaterial({ color: '#2a2018', side: THREE.DoubleSide }); for (let i = 0; i < 7; i++) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9 * 2), 3)); const b = new THREE.Mesh(g, bm); b.frustumCulled = false; S.add(b); birds.push(b); } }
  const setBird = (b, p, s, flap) => { const a = b.geometry.attributes.position, w = Math.sin(flap) * .5; const pts = [[0, 0, 0], [-s, s * w, -s * .3], [-s * .2, 0, s * .2], [0, 0, 0], [s, s * w, -s * .3], [s * .2, 0, s * .2]]; pts.forEach((q, i) => a.setXYZ(i, p.x + q[0], p.y + q[1], p.z + q[2])); a.needsUpdate = true; };

  // ---------------------------------------------------------------- the shots
  const tmpV = V();
  function setCam(pos, look, roll = 0) { cam.position.copy(pos); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(look); }
  // the King walking his line up the road (S1, S2): position, pose
  function kingWalk(t) { const w = P.walk(king, t, T.walk0, { T: 1.1, L: .52 }); king.position.set(KX, 0, -5 - w.dist); king.rotation.y = 0; P.pose(king, { ...w, breath: .5, head: [0, .06 * Math.sin(t * .3)] }); return king.position.z; }
  // the sitters: heads lift and follow him as he comes near — each on his own delay (a ripple); a few point; breathing all along
  function sittersLife(t, kz) {
    for (const p of sitters) { const U = p.userData;
      const tPass = T.walk0 + (-5 - p.position.z - 4) / KV + U.dl, k = ss(tPass, tPass + 1.1, t);
      const toK = Math.atan2(-(KX - p.position.x), -(kz - p.position.z)) - p.rotation.y, yaw = Math.atan2(Math.sin(toK), Math.cos(toK));
      const ex = { head: [lerp(-U.bow, .1, k) + .03 * Math.sin(t * .4 + U.ph * 9), clamp(yaw, -1.1, 1.1) * k], lean: lerp(.03 * Math.sin(t * .3 + U.ph * 7), -.06, k) };
      if (U.point) { const pk = ss(tPass + .5, tPass + 1.4, t); ex.hands = [V(-.17 * U.s, .32 * U.s, -.3 * U.s), lv(V(.17 * U.s, .32 * U.s, -.28 * U.s), V(.3 * U.s, .95 * U.s, -.5 * U.s), pk)]; }
      life(p, t, ex); }
  }
  function frame3D(shot, t) {
    const Lk = film.look, D = film.dofCfg, [a, b] = T.shots[shot], k = clamp((t - a) / (b - a));
    // defaults: who is visible, the light, the lens
    for (const p of [king, child, lame, crutch, leper, deaf, bier, ring, ...comers, ...others]) p.visible = false;
    puffU.uK.value = 0; birds.forEach(bd => bd.visible = false);
    D.aperture = 2.4; D.maxCoc = 24; Lk.exposure = 1.05; washU.uW.value = -1; sunLamp.power = 2200;
    if (shot === 0 || shot === 1) {   // S1 behind him, S2 high and wide
      king.visible = true; const kz = kingWalk(t); sittersLife(t, kz);
      child.visible = shot === 1; if (shot === 1) {   // the child tugs at the seated man's sleeve, looking where he looks
        parent.updateMatrix(); child.updateMatrix(); const hp = P.handAt(parent, 0).applyMatrix4(parent.matrix), pull = .5 + .5 * Math.sin(t * 5.2);
        const tg = hp.clone().applyMatrix4(child.matrix.clone().invert());
        P.pose(child, { ...P.idle(t, .3, { s: child.userData.s }), lean: -.12 - .05 * pull, hands: [tg.clone().add(V(0, 0, .04 * pull)), null], head: [.1, -.5 * ss(T.walk0 + 6, T.walk0 + 7, t)] }); }
      if (shot === 0) {   // tracking behind at walking pace, a little to the side, low
        setCam(V(1.1, 1.55, kz + 8.6), V(.1, 1.15, kz - 20)); dustU.uC.value.set(0, 0, kz + 7); D.focus = 8.6; D.aperture = 2.0;
        Lk.exposure = lerp(2.6, 1.05, eo((t - T.start) / 1.2));
      } else {   // high, wide, the camera rising slowly; he is small in the middle of the road
        const pos = V(lerp(5.2, 4.4, k), lerp(6.5, 8.2, k), kz + lerp(7.5, 8.5, k)); setCam(pos, V(KX - .2, .3, kz + 1.2)); D.focus = pos.distanceTo(king.position); D.aperture = 1.6; dustU.uC.value.set(0, 0, kz + 4);
      }
    } else if (shot === 2) {   // S3: the blind man's eyes: a blur that racks into focus on the man standing far off in the sun; he gets up
      king.visible = true; king.position.copy(KB); king.rotation.y = Math.PI; P.pose(king, { ...P.idle(t, .2, { s: king.userData.s }), head: [-.05, 0] });   // facing us, far, backlit
      for (const p of others) { p.visible = true; const r = ss(T.rack[1] - .4, T.rack[1] + .8, t); life(p, t, { head: [lerp(-.25, .05, r), 0] }); }
      const rk = eio((t - T.rack[0]) / (T.rack[1] - T.rack[0])), up = eio((t - T.rise[0]) / (T.rise[1] - T.rise[0]));
      setCam(V(P2.x + up * .15, lerp(.92, 1.58, up) + .01 * Math.sin(t * 1.4), P2.z - up * .25 - .5 * k), V(P2.x + 1.5 + up * .2, lerp(1.4, 1.2, up), P2.z - 14));
      D.focus = lerp(.25, 12, rk); D.aperture = lerp(70, 2.4, rk); D.maxCoc = 44;
      Lk.exposure = lerp(1.55, 1.08, rk); dustU.uC.value.set(P2.x, 0, P2.z - 1);
    } else if (shot === 3) {   // S4: side-back, mid distance: he straightens off the crutch, it drops into the dust, he walks out
      lame.visible = crutch.visible = true; const U = lame.userData, st = ss(T.straight[0], T.straight[1], t), dir = V(-.35, 0, -1).normalize();
      const grip0 = V(.27, .98, -.25);   // his right hand on the crutch's grip (root frame), the crosspiece under his arm
      if (t < T.step) { lame.position.copy(P3); lame.rotation.y = face(dir.x, dir.z);
        const id = P.idle(t, .6, { s: U.s }), letGo = ss(T.crutch - .25, T.crutch + .4, t);
        P.pose(lame, { ...id, feet: [{ u: .22, lift: 0 }, { u: -.22, lift: 0 }], bob: -.02 * U.s, lean: lerp(-.32, -.04, st), side: lerp(.08, 0, st), head: [lerp(-.45, .12, st), lerp(.1, 0, st)],
          hands: [lv(V(-.2, .82, -.28), V(-.25, .86, -.02), st), lv(grip0, V(.25, .86, -.02), letGo)] });
      } else { const w = walkOn(lame, t, T.step, P3, dir, { T: 1.25, L: .44, head: [.12, 0] }); }
      const fk = clamp((t - T.crutch) / .7), ang = lerp(-.05, 1.5, Math.pow(fk, 2.3)) - (fk >= 1 ? Math.sin(clamp((t - T.crutch - .7) / .22) * Math.PI) * .05 : 0);
      { const foot = V(.42, 0, -.2).applyAxisAngle(V(0, 1, 0), face(dir.x, dir.z)).add(P3); crutch.position.copy(foot); crutch.rotation.set(0, face(dir.x, dir.z), 0); crutch.rotateX(fk > 0 ? ang : lerp(-.05, -.02, st)); crutch.rotateZ(.17); }
      puffU.uK.value = t > T.crutch + .66 ? clamp((t - T.crutch - .66) / 1.3) : 0; puffU.uP.value.copy(P3).add(V(.42, .02, 1.1));
      setCam(V(P3.x - 3.6 - k * .6, 1.6, P3.z + 6.2 - k * .8), V(P3.x - .3 - k * .4, -.35, P3.z - 1.6));
      D.focus = 7.2; D.aperture = 2.4; dustU.uC.value.set(P3.x - 1.5, 0, P3.z + 4);
      for (const p of others) { if (p.position.z < -39) { p.visible = true; life(p, t, { head: [ss(T.crutch, T.crutch + 1, t) * .1, .4 * ss(T.crutch + .2 + p.userData.ph, T.crutch + 1.2 + p.userData.ph, t)] }); } }
    } else if (shot === 4) {   // S5: 3/4 from behind, pulled back: the band of light climbs over the covered man; his hands rise into it
      leper.visible = true; const wk = clamp((t - T.wash[0]) / (T.wash[1] - T.wash[0])), U = leper.userData, ar = ss(.35, 1, wk);
      washU.uO.value.copy(P4); washU.uW.value = lerp(-.15, 1.95, eio(wk));
      P.pose(leper, { ...P.idle(t, .45, { s: U.s }), lean: lerp(-.12, .04, ar), head: [lerp(-.3, .32, ss(.4, 1, wk)), 0],
        hands: [lv(V(-.22, .9, -.18), V(-.2, 1.7, -.48), ar), lv(V(.22, .9, -.18), V(.2, 1.7, -.48), ar)] });
      setCam(V(P4.x + 2.5 - k * .6, 1.7, P4.z + 7.6 - k * 1.6), V(P4.x - .5, -.25, P4.z - 6));
      D.focus = 7.9 - k * 1.6; D.aperture = 2.6; dustU.uC.value.set(P4.x, 0, P4.z + 3);
    } else if (shot === 5) {   // S6: the deaf man by the wall (right foreground), then focus to the bier where the young man sits up
      deaf.visible = bier.visible = true; const U = deaf.userData, lk = eio((t - T.lift[0]) / (T.lift[1] - T.lift[0])), ek = ss(T.ear[0], T.ear[1], t);
      P.pose(deaf, { breath: P.breath(t, .4), lean: lerp(-.16, 0, lk), head: [lerp(-.62, .08, lk), lerp(-.05, .32, lk)], twist: .08 * lk,
        hands: [V(-.17 * U.s, .32 * U.s, -.3 * U.s), lv(V(.17 * U.s, .32 * U.s, -.28 * U.s), V(.19 * U.s, .88 * U.s, -.02 * U.s), ek)] });
      const sk = clamp((t - T.sit[0]) / (T.sit[1] - T.sit[0])); shroudAt(sk);
      for (const m of mourners) { const U2 = m.userData, rk = ss(T.sit[0] + .3 + U2.dl, T.sit[0] + 1.3 + U2.dl, t);
        P.pose(m, { ...P.idle(t, U2.ph, { s: U2.s }), lean: lerp(-.1, .1, rk), head: [lerp(-.35, .05, rk), 0],
          hands: U2.dl > .5 ? [lv(V(-.22, .85, -.1), V(-.3, 1.55, -.35), rk), lv(V(.22, .85, -.1), V(.3, 1.55, -.35), rk)] : null }); }
      const pos = V(P5.x - 2.4 - k * .4, 1.6 - k * .05, P5.z + 5.6 - k * 1.0), look = lv(V(P5.x - .1, .55, P5.z - 2.2), V(P6.x + .6, .35, P6.z + .5), eio((t - T.rackB[0] + .3) / (T.rackB[1] - T.rackB[0] + .8)));
      setCam(pos, look); const fk = eio((t - T.rackB[0]) / (T.rackB[1] - T.rackB[0])); D.focus = lerp(pos.distanceTo(P5) , pos.distanceTo(P6), fk); D.aperture = 3.2;
      dustU.uC.value.set(P5.x - 1, 0, P5.z + 2);
      const bk = clamp((t - T.birds) / 2.2); birds.forEach((bd, i) => { if (bk <= 0) return; bd.visible = true; const r0 = rng(i + 9)(); setBird(bd, V(-3.8 + i * .4 - bk * (2 + i * .5), 3.9 + bk * (2.5 + r0 * 2.5) + Math.sin(bk * 8 + i) * .15, P5.z - 8 - i * .6 - bk * 2), .14, t * 22 + i * 2); });
    } else {   // S7: crane up over the ring; people still coming from the doors; the tilt to the sun at the end
      ring.visible = true; P.pose(kingR, { ...P.idle(t, .7, { s: kingR.userData.s }), hands: [null, null], swing: [.15, .25 * (1 + Math.sin(t * .6)) / 2], head: [-.1, .2 * Math.sin(t * .3)] });
      for (const p of ringP) { const U = p.userData; P.pose(p, { breath: P.breath(t, U.ph), lean: -.08 + .03 * Math.sin(t * .3 + U.ph * 9), head: [.14 + .05 * Math.sin(t * .5 + U.ph * 7), .08 * Math.sin(t * .2 + U.ph * 5)], twist: .04 * Math.sin(t * .25 + U.ph * 3),
          hands: [V(-.17 * U.s, .32 * U.s, -.3 * U.s), U.ph > .8 ? V(.2 * U.s, (.5 + .25 * (1 + Math.sin(t * .7 + U.ph * 8)) / 2) * U.s, -.4 * U.s) : V(.17 * U.s, .32 * U.s, -.28 * U.s)] }); }
      for (const c of comers) { c.visible = true; walkOn(c, t, a - c.userData.i * .5 - 1, c.userData.p0, c.userData.dir, { T: 1.15, L: .5 }); }
      const ck = eio(k * 1.05), tk = eio((t - T.tilt[0]) / (T.tilt[1] - T.tilt[0]));
      const pos = V(lerp(1.6, .4, ck), lerp(3.2, 8.5, ck), P7.z + lerp(10, 13, ck)), look = lv(V(P7.x, .4, P7.z - .5), pos.clone().add(SUN.clone().multiplyScalar(300)), tk * .9);
      setCam(pos, look); dustU.uC.value.set(0, 0, P7.z + 5);
      D.focus = pos.distanceTo(P7); D.aperture = 1.8; Lk.exposure = lerp(1.05, 1.9, tk); sunLamp.power = lerp(2200, 5200, tk);
    }
    film.render(t);
  }

  // ---- screen-space light scattering from the sun (veil-temple.js godRays): bright pixels, zoom-blurred from the sun's position
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const gS = mkC(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkC(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) {
    const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h);
    const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 170) / 85); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; }
    gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h);
    gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 24; i++) { const sc = 1 + i * .05; gbx.globalAlpha = Math.pow(.9, i) * .15; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); }
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.imageSmoothingEnabled = true; ctx.drawImage(gB, 0, 0, W, H); ctx.restore();
  }

  function blit(ctx, k) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore(); }
  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    const on = []; T.shots.forEach(([a, b], i) => { if (t >= a && t < b) on.push(i); });
    if (!on.length) on.push(t < T.shots[0][0] ? 0 : 6);
    frame3D(on[0], t); blit(ctx, 1);
    if (on.length > 1) { const i1 = on[1]; frame3D(i1, t); blit(ctx, ss(T.shots[i1][0], T.shots[on[0]][1], t)); }   // a soft dissolve
    tmpV.copy(cam.position).add(SUN.clone().multiplyScalar(500)).project(cam);
    if (tmpV.z < 1 && Math.abs(tmpV.x) < 1.6 && Math.abs(tmpV.y) < 1.6) godRays(ctx, (tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H, .55);
    // in from the white of the gold point; out into the light from above
    const wIn = 1 - ss(T.start, T.white1, t), wOut = ss(T.tilt[0] + .3, T.end, t) * .8, wk = Math.max(wIn, wOut);
    if (wk > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,244,222,${wk})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  return { film, draw, beats: () => T, people: { king, lame, comers, mourners, P } };
}
