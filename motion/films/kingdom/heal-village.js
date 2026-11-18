// heal-village.js — 「kingdom」 2부: "왕이 오신 곳에서는 무슨 일이 일어났을까요?" (N44 · Q41 Lk 7:22), a painted 3D Galilee village
// at the end of the afternoon, in the cinematic-3d engine (lib3d/cine.js: height fog, sun in-scatter, bloom, depth of field, grain).
//
// After 「Ben-Hur」 (OPUSCAR 32): low sun, dust, a light that washes the leper clean; the rack focus is the blind man's eyes.
// Seven shots, hard cuts, each a different size and direction (rules: one visible event per verse clause, nothing still > 3 s):
//   S1 N44  tracking behind a small walking man (the King: back only, small, on the sun's axis) up the village road through
//           dust; people sitting by the road lift their heads as he passes. Starts from the white of the gold point (match).
//   S2 맹인이 보며      POV of the blind man: total blur racks into focus (1.2 s) — the road, the sun, the man standing in it.
//   S3 못 걷는 사람이 걸으며  ground level: a crutch tips over and drops into the dust beside two feet; a foot steps forward.
//   S4 나병환자가 깨끗함을 받으며  close: a raised hand, the pale patches on its back washed away by a band of light.
//   S5 귀먹은 사람이 들으며  over the shoulder of a man sitting by a wall: his bowed head lifts and turns toward the sound (J-cut:
//           the sound comes first — 소리 연출), birds lift off the roof beyond.
//   S6 죽은 자가 살아나며  a bier set down on the road, mourners round it; the shrouded young man sits up, the cloth slides back.
//   S7 가난한 자에게 복음이  crane up over the road: people sitting round the small figure in the middle, more coming out of the
//           houses; the camera tilts to the sun and the light from above fills the frame (match cut to the roof hole, N45).
// Rules kept: the King is never shown by face — S1 from behind, S2 a backlit silhouette far on the sun's axis, S7 small from
// high above; no halo (the sun is behind him, not around him); men in head cloths to the shoulders, no long hair; no words.
//
// API: const HV = await (await import('./heal-village.js')).build(W, H);  HV.draw(ctx, t, B)  t = FILM seconds,
//      B = line times from script.json (N44 Q41 N45). Every visual time comes from B in beats(). Pure in t.
import { Film, THREE, V, col, rng, noise1 } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const lv = (a, b, k) => a.clone().lerp(b, k);

// ---------------------------------------------------------------- the one table: shots from the line times
export function beats(B) {
  const q = B.Q41, e = B.N45;
  // the quote's three pieces are shown by length (lib-film F.pieces); the five events sit on the words of piece 1 and 2
  const T = { start: B.N44, white1: B.N44 + 1.1, end: e };
  const cuts = [B.N44, q, q + 2.05, q + 4.1, q + 6.2, q + 8.4, q + 10.7, e];   // S1 … S7
  T.shots = cuts.slice(0, -1).map((a, i) => [a, cuts[i + 1]]);
  T.rack = [q + .25, q + 1.45];                 // S2 rack focus 1.2 s
  T.crutch = q + 2.05 + .35;                    // S3 the crutch tips (falls .7 s)
  T.step = q + 2.05 + 1.25;                     // S3 a foot steps forward
  T.wash = [q + 4.1 + .3, q + 4.1 + 1.8];       // S4 the band of light crosses the hand
  T.lift = [q + 6.2 + .55, q + 6.2 + 1.7];      // S5 the head lifts and turns (the sound came at q + 6.2)
  T.birds = q + 6.2 + .9;
  T.sit = [q + 8.4 + .45, q + 8.4 + 2.0];       // S6 the young man sits up
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

  // ---------------------------------------------------------------- people
  const robes = ['#8a7356', '#6e5a44', '#a08a6a', '#5a5048', '#7c6650', '#9a7a52', '#4e5a66', '#6a5a4a'];
  const personMats = robes.map(c => K.std(c, { roughness: .95, side: THREE.DoubleSide }));
  const skinM = K.std('#8a5e3e', { roughness: .8 });
  // a man (veil-temple.js people, posable): tunic, mantle from broad shoulders, head cloth to the shoulders behind, arms in
  // groups (raise/lower), a neck that bows and turns. Faces −z by default. seated: legs folded under the robe on the ground.
  const man = ({ h = 1.72, broad = 1, mat, seated = false, staff = false, hood = false } = {}) => {
    const g = new THREE.Group(), m = mat || personMats[0], s = h / 1.75, b = broad, body = new THREE.Group(); g.add(body);
    if (!seated) {
      const robe = new THREE.Mesh(new THREE.CylinderGeometry(.19 * s * b, .3 * s * b, 1.3 * s, 14), m); robe.position.y = .65 * s; body.add(robe);
      const mantle = new THREE.Mesh(new THREE.CylinderGeometry(.25 * s * b, .36 * s * b, 1.05 * s, 14, 1, true, -2.6, 5.2), m); mantle.position.y = .88 * s; body.add(mantle);
    } else {
      const lap = new THREE.Mesh(new THREE.CylinderGeometry(.34 * s * b, .4 * s * b, .3 * s, 16), m); lap.position.y = .15 * s; lap.scale.z = .85; body.add(lap);
      const knees = new THREE.Mesh(new THREE.CapsuleGeometry(.12 * s, .42 * s, 4, 10), m); knees.rotation.z = Math.PI / 2; knees.position.set(0, .26 * s, -.16 * s); body.add(knees);
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(.2 * s * b, .3 * s * b, .62 * s, 14), m); torso.position.y = .55 * s; body.add(torso);
    }
    const y0 = seated ? .72 * s : 1.36 * s;
    const sh = new THREE.Mesh(new THREE.CapsuleGeometry(.18 * s, .2 * s, 4, 10), m); sh.scale.set(1.35 * b, 1, .82); sh.position.y = y0; body.add(sh);
    const neck = new THREE.Group(); neck.position.y = y0 + .14 * s; body.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.105 * s, 14, 10), hood ? m : skinM); head.position.y = .15 * s; neck.add(head);
    const cloth = new THREE.Mesh(new THREE.SphereGeometry(.13 * s, 14, 8, 0, Math.PI * 2, 0, Math.PI * .58), m); cloth.position.y = .17 * s; neck.add(cloth);
    const drape = new THREE.Mesh(new THREE.CylinderGeometry(.13 * s, .2 * s, .3 * s, 12, 1, true, -1.2, 2.4), m); drape.position.set(0, -.06 * s, .02 * s); neck.add(drape);
    const arms = [-1, 1].map(sd => { const a = new THREE.Group(); a.position.set(sd * .21 * s * b, y0 + .02 * s, 0); const am = new THREE.Mesh(new THREE.CapsuleGeometry(.06 * s, .48 * s, 3, 8), m); am.position.y = -.28 * s; a.add(am);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(.045 * s, 8, 6), hood ? m : skinM); hand.position.y = -.58 * s; a.add(hand); a.rotation.z = sd * .08; body.add(a); return a; });
    if (staff) { const st = new THREE.Mesh(new THREE.CylinderGeometry(.02, .022, 1.95 * s, 6), M.wood); st.position.set(.32 * s * b, .97 * s, -.06); st.rotation.z = -.06; g.add(st); }
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    g.userData = { neck, arms, body, s, seated };
    return g;
  };
  const place = (o, x, z, ry) => { o.position.set(x, 0, z); o.rotation.y = ry; S.add(o); return o; };
  // the King: a plain undyed robe, a darker mantle, the same head cloth as every man — no mark, no glow, small, from behind
  const king = place(man({ h: 1.74, mat: K.std('#b9a88a', { roughness: .95, side: THREE.DoubleSide }) }), 0, -8, 0);
  // the seated people along the road (they lift their heads as he passes in S1, gather round him in S7)
  const sitters = [];
  { const r = rng(91); for (let i = 0; i < 16; i++) { const side = i % 2 ? 1 : -1, z = -9 - i * 2.2 - r() * 1.2, x = side * (2.7 + r() * .6);
      const p = place(man({ seated: true, h: 1.6 + r() * .2, mat: personMats[(r() * 8) | 0], broad: .9 + r() * .2 }), x, z, side < 0 ? -Math.PI / 2 + (r() - .5) * .6 : Math.PI / 2 + (r() - .5) * .6);
      p.userData.bow = .35 + r() * .2; p.userData.ph = r(); sitters.push(p); } }
  // S2: the blind man's place (the camera is his eyes); S3 the lame man; S4 the leper; S5 the deaf man; S6 the bier; S7 the ring
  const P2 = V(-1.7, 0, -36), P3 = V(2.2, 0, -46), P4 = V(-1.4, 0, -53), P5 = V(2.2, 0, -60), P6 = V(0, 0, -76), P7 = V(0, 0, -92);
  // S3: the lame man, bent over his crutch (a staff with a crosspiece under his arm) — he straightens, it drops, he steps
  const lame = place(man({ h: 1.72, mat: personMats[3], broad: .95 }), P3.x, P3.z, Math.PI / 2);
  const crutch = new THREE.Group(); { const st = new THREE.Mesh(new THREE.CylinderGeometry(.022, .026, 1.3, 7), M.wood); st.position.y = .65; crutch.add(st);
    const top = new THREE.Mesh(K.roundedBox(.06, .05, .34, .02, 2), M.wood); top.position.y = 1.31; crutch.add(top); crutch.traverse(o => { if (o.isMesh) o.castShadow = true; }); S.add(crutch); }
  // S4: the leper — covered head to foot (Lev 13:45), patches on his wrappings and arms; a band of light climbs over him and
  // the patches are gone behind it; he lifts his hands into the light
  const washU = { uW: { value: -1 }, uO: { value: V() } };
  const lepM = new THREE.MeshStandardMaterial({ color: '#a39478', roughness: .95, side: THREE.DoubleSide });
  lepM.onBeforeCompile = sh => { Object.assign(sh.uniforms, washU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform float uW; uniform vec3 uO;\n' + hashGLSL)
      .replace('#include <map_fragment>', `#include <map_fragment>
        { vec3 q = vWP - uO; float dk = smoothstep(.55, .63, fb(q.xy * 7. + q.z * 5.)), pl = smoothstep(.62, .68, fb(q.yz * 9. + 3.));
          float clean = smoothstep(-.03, .03, uW - q.y);   // the band climbs: below it the wrappings are clean
          vec3 c = diffuseColor.rgb; c = mix(c, vec3(.22, .14, .1), dk * .9 * (1. - clean)); c = mix(c, vec3(.95, .88, .8), pl * .8 * (1. - clean));
          diffuseColor.rgb = mix(c, c * 1.12, clean); }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { vec3 q = vWP - uO; float band = exp(-pow((uW - q.y) / .06, 2.)); totalEmissiveRadiance += vec3(1., .8, .5) * band * 2.6 * (1. - smoothstep(1.2, 1.55, uW));   // the band fades before it reaches his head (no glow round a head) }`); };
  lepM.customProgramCacheKey = () => 'hv-leper';
  const leper = place(man({ h: 1.7, mat: lepM, hood: true }), P4.x, P4.z, .1);   // faces up the road toward the sun (and us)
  // S5: the deaf man sitting at the road's edge facing up the road, head bowed
  const deaf = place(man({ seated: true, h: 1.7, mat: personMats[4], broad: 1.05 }), P5.x, P5.z, .1);
  // S6: the bier (two poles, a plank bed), the shroud over a young man who sits up, four mourners and bearers round it
  const bier = new THREE.Group(); { const pole = (sd) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 2.9, 7), M.wood); p.rotation.x = Math.PI / 2; p.position.set(sd * .36, .42, 0); return p; };
    bier.add(pole(-1), pole(1)); const bed = new THREE.Mesh(K.roundedBox(.78, .05, 1.95, .02, 2), M.wood); bed.position.y = .45; bier.add(bed);
    for (const [x, z] of [[-.36, -.8], [.36, -.8], [-.36, .8], [.36, .8]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .42, 6), M.wood); l.position.set(x, .21, z); bier.add(l); }
    bier.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); bier.position.copy(P6); bier.rotation.y = .35; S.add(bier); }
  // the shroud: a grid draped over the body's height field; the upper body (and the cloth on it) rotates up about the hips
  const shroudU = 36, shroudV = 14, SL = 1.9, SW = .82;
  const shroudG = new THREE.PlaneGeometry(SW, SL, shroudV, shroudU); shroudG.rotateX(-Math.PI / 2);
  const shroudM = K.std('#e9e2d2', { roughness: .9, side: THREE.DoubleSide }), shroud = new THREE.Mesh(shroudG, shroudM); shroud.castShadow = shroud.receiveShadow = true; bier.add(shroud);
  const sBase = shroudG.attributes.position.array.slice();
  const bodyH = (x, z) => { // z: −SL/2 (head) … +SL/2 (feet), the body's height above the bed
    const u = (z + SL / 2) / SL, head = Math.exp(-(((u - .08) / .05) ** 2)) * .17, chest = Math.exp(-(((u - .32) / .16) ** 2)) * .2, legs = Math.exp(-(((u - .7) / .25) ** 2)) * .13, feet = Math.exp(-(((u - .95) / .04) ** 2)) * .14;
    const w = Math.exp(-((x / (u < .14 ? .1 : u < .55 ? .22 : .16)) ** 2) * 1.4); return (Math.max(head, chest, legs, feet)) * w; };
  // the young man: a torso hinged at the hips (linen grave clothes, short dark hair); the legs stay under the cloth
  const hipZ = -SL / 2 + SL * .5, young = new THREE.Group(); young.position.set(0, .5, hipZ); bier.add(young);
  { const lin = K.std('#ddd3bf', { roughness: .9 }), torso = new THREE.Mesh(new THREE.CapsuleGeometry(.16, .42, 4, 12), lin); torso.scale.set(1.25, 1, .8); torso.position.y = .32; young.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.1, 14, 10), skinM); head.position.y = .72; young.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.104, 14, 8, 0, Math.PI * 2, 0, Math.PI * .45), K.std('#1c1410', { roughness: 1 })); hair.position.y = .72; hair.rotation.x = -.35; young.add(hair);
    for (const sd of [-1, 1]) { const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.05, .38, 3, 8), lin); arm.position.set(sd * .2, .3, -.04); arm.rotation.x = .25; young.add(arm); }
    young.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); }
  function shroudAt(k) {   // k 0 → 1: lying → sitting up; the cloth over the upper body falls into a fold at the waist
    const pos = shroudG.attributes.position, a = eio(k), fall = eio(clamp((k - .05) / .6));
    young.rotation.x = lerp(-Math.PI / 2 + .06, -.12, a);   // lying back toward the head end → sitting up
    for (let i = 0; i < pos.count; i++) { const x = sBase[i * 3], z0 = sBase[i * 3 + 2];
      let y = .48 + bodyH(x, z0) + .012, z = z0;
      if (z0 < hipZ) { const d = hipZ - z0; z = lerp(z0, hipZ - d * .18, fall); y = lerp(y, .5 + .14 + .1 * Math.sin(d * 9) * (1 - d / SL) + bodyH(x, hipZ) * .5, fall); }   // gathered at the waist
      pos.setXYZ(i, x * (1 + .06 * Math.sin(z * 9)) * (z0 < hipZ ? lerp(1, .9, fall) : 1), y, z); }
    pos.needsUpdate = true; shroudG.computeVertexNormals(); young.visible = k > .02; }
  shroudAt(0);
  const mourners = [[-1.3, -.7], [1.35, -.5], [-.6, -1.7], [.75, -1.8], [-2.1, .3], [2.2, .1]].map(([x, z], i) => { const p = man({ h: 1.62 + (i % 3) * .06, mat: personMats[(i * 3 + 1) % 8], staff: i === 4 }); p.position.set(x, 0, z); p.rotation.y = Math.atan2(x, z) + Math.PI; p.userData.neck.rotation.x = -.35; bier.add(p); return p; });
  // S7: the ring of people sitting round him in the road, more coming from the doors
  const ring = new THREE.Group(); ring.position.copy(P7); S.add(ring);
  const kingR = man({ h: 1.74, mat: king.children[0].children[0].material }); ring.add(kingR);
  { const r = rng(717); for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283 + r() * .2, rr = 2.0 + (i % 3) * .75 + r() * .3; const p = man({ seated: true, h: 1.55 + r() * .25, mat: personMats[(r() * 8) | 0] });
      p.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); p.rotation.y = Math.atan2(Math.cos(a), Math.sin(a)); p.userData.neck.rotation.x = .12; ring.add(p); } }
  const comers = [0, 1, 2, 3, 4, 5].map(i => { const p = man({ h: 1.66, mat: personMats[(i * 5) % 8], staff: i === 2 }); S.add(p); p.userData.i = i; return p; });
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
  function frame3D(t) {
    const Lk = film.look, D = film.dofCfg; let shot = T.shots.findIndex(([a, b]) => t >= a && t < b); if (shot < 0) shot = t < T.shots[0][0] ? 0 : 6;
    const [a, b] = T.shots[shot], k = clamp((t - a) / (b - a));
    // defaults (the whole village at rest)
    for (const p of sitters) p.userData.neck.rotation.x = -p.userData.bow; king.visible = true; lame.visible = crutch.visible = leper.visible = false; deaf.visible = true; puffU.uK.value = 0;
    birds.forEach(bd => bd.visible = false); comers.forEach(c => c.visible = false);
    D.aperture = 2.4; D.maxCoc = 24; Lk.exposure = 1.05; washU.uW.value = -1; sunLamp.power = 2200;
    if (shot === 0) {   // S1: tracking behind him, walking pace, linear
      const z = lerp(-6, -12.4, (t - a) / 5.4), ph = (t - a) * 1.9 * Math.PI;
      king.position.set(.25, Math.abs(Math.sin(ph)) * .025, z); king.rotation.y = 0; king.userData.body.rotation.z = Math.sin(ph) * .02;
      king.userData.arms[0].rotation.x = Math.sin(ph) * .22; king.userData.arms[1].rotation.x = -Math.sin(ph) * .22;
      setCam(V(.55, 1.45, z + 9.6), V(.05, 1.3, z - 20));
      for (const p of sitters) { const ah = z - p.position.z, L = ss(6.5, 2.5, ah); p.userData.neck.rotation.x = lerp(-p.userData.bow, .14, L); }   // heads lift as he comes near
      D.focus = 9.6; D.aperture = 2.2; dustU.uC.value.set(0, 0, z + 8);
      Lk.exposure = lerp(2.6, 1.05, eo((t - T.start) / 1.2));
    } else if (shot === 1) {   // S2: the blind man's eyes — blur racks into focus on the man standing in the sun
      king.position.set(P2.x + 1.4, 0, P2.z - 9); king.rotation.y = Math.PI; king.userData.arms[0].rotation.x = 0; king.userData.arms[1].rotation.x = -.5 * ss(T.rack[0], T.rack[1], t);   // facing us, backlit, far
      const rk = eio((t - T.rack[0]) / (T.rack[1] - T.rack[0]));
      setCam(V(P2.x, .95, P2.z).add(V(0, rk * .03, 0)), V(P2.x + .7, 1.45, P2.z - 12));
      D.focus = lerp(.25, 9, rk); D.aperture = lerp(60, 3, rk); D.maxCoc = 40;
      Lk.exposure = lerp(1.5, 1.08, rk); dustU.uC.value.set(P2.x, 0, P2.z - 1);
    } else if (shot === 2) {   // S3: side-on, backlit: he straightens, the crutch drops into the dust, he steps out
      king.visible = false; lame.visible = crutch.visible = true;
      const st = ss(T.crutch - .75, T.crutch - .05, t), U = lame.userData;
      U.body.rotation.x = lerp(-.3, 0, st); U.neck.rotation.x = lerp(-.35, .15, st); U.arms[0].rotation.x = lerp(.45, 0, st); U.arms[1].rotation.x = lerp(.25, .1, st);
      const sk = clamp((t - T.step) / .6); lame.position.set(P3.x - eio(sk) * .45, Math.sin(sk * Math.PI) * .03, P3.z);
      const fk = clamp((t - T.crutch) / .7), ang = lerp(-.18, 1.47, Math.pow(fk, 2.3)) - (fk >= 1 ? Math.sin(clamp((t - T.crutch - .7) / .22) * Math.PI) * .05 : 0);
      crutch.position.copy(P3).add(V(-.05, 0, .5)); crutch.rotation.set(ang, 0, 0);   // pivots on its foot, falls toward us
      puffU.uK.value = t > T.crutch + .66 ? clamp((t - T.crutch - .66) / 1.3) : 0; puffU.uP.value.copy(P3).add(V(-.05, .02, 1.65));
      setCam(V(P3.x - .6, 1.0, P3.z + 5.4 - k * .4), V(P3.x - .35, .2, P3.z));
      D.focus = 4.5; D.aperture = 3; dustU.uC.value.set(P3.x - 1, 0, P3.z + 4);
    } else if (shot === 3) {   // S4: 3/4 from behind: the band of light climbs over the covered man; he lifts his hands into it
      king.visible = false; leper.visible = true;
      const wk = clamp((t - T.wash[0]) / (T.wash[1] - T.wash[0])), U = leper.userData;
      washU.uO.value.copy(P4); washU.uW.value = lerp(-.15, 1.95, eio(wk));
      for (const [i, sd] of [[0, -1], [1, 1]]) { U.arms[i].rotation.x = lerp(.15, 2.5, ss(.35, 1, wk)); U.arms[i].rotation.z = sd * lerp(.08, .45, ss(.35, 1, wk)); }   // both hands lifted into the light
      U.neck.rotation.x = lerp(-.25, .3, ss(.4, 1, wk));
      setCam(V(P4.x + .7, 1.25, P4.z + 3.6 - k * .3), V(P4.x - .1, 1.45, P4.z - 8));
      D.focus = 3.7; D.aperture = 3; dustU.uC.value.set(P4.x, 0, P4.z + 3);
    } else if (shot === 4) {   // S5: over his shoulder — the bowed head lifts toward the sound up the road; birds lift off a roof
      king.position.set(.4, 0, P5.z - 11.5); king.rotation.y = Math.PI;   // far up the road, small, against the sun
      const lk = eio((t - T.lift[0]) / (T.lift[1] - T.lift[0])), U = deaf.userData;
      U.neck.rotation.x = lerp(-.6, .12, lk); U.neck.rotation.y = lerp(-.05, .14, lk); U.body.rotation.x = lerp(-.12, 0, lk);
      setCam(V(P5.x + 1.05, 1.0, P5.z + 2.6 + k * .15), V(P5.x - .1, 1.3, P5.z - 10));   // he sits lower left, the road and the far figure to his right
      D.focus = 2.4; D.aperture = 3; dustU.uC.value.set(P5.x - 1, 0, P5.z + 1);
      const bk = clamp((t - T.birds) / 2.2); birds.forEach((bd, i) => { if (bk <= 0) return; bd.visible = true; const r0 = rng(i + 9)(); setBird(bd, V(-4.6 + i * .4 - bk * (2 + i * .5), 3.9 + bk * (2.5 + r0 * 2.5) + Math.sin(bk * 8 + i) * .15, P5.z - 7 - i * .6 - bk * 2), .14, t * 22 + i * 2); });
    } else if (shot === 5) {   // S6: the bier set down in the road, backlit; the shrouded young man sits up
      king.visible = false; dustU.uC.value.set(P6.x + 1.5, 0, P6.z + 5);
      shroudAt(clamp((t - T.sit[0]) / (T.sit[1] - T.sit[0])));
      for (const m of mourners) m.userData.neck.rotation.x = lerp(-.35, .05, ss(T.sit[0] + .4, T.sit[1], t));
      setCam(V(P6.x + 3.3 - k * .3, 2.5 - k * .15, P6.z + 7.0 - k * .4), V(P6.x - .15, .5, P6.z - .5));
      D.focus = 7.6; D.aperture = 2.6;
    } else {   // S7: crane up over the ring; the tilt to the sun at the end
      king.visible = false;
      comers.forEach(c => { const i = c.userData.i, side = i % 2 ? 1 : -1, ck = clamp((t - a) / (b - a) * 1.2 + i * .05); c.visible = true; c.position.set(side * lerp(4.4, 3.2, ck), 0, P7.z - 6 + i * 2.2 - ck * 1.5 * side); c.rotation.y = Math.atan2(P7.x - c.position.x, P7.z - c.position.z) + Math.PI; });
      const ck = eio(k * 1.05), tk = eio((t - T.tilt[0]) / (T.tilt[1] - T.tilt[0]));
      const pos = V(lerp(1.4, .3, ck), lerp(2.8, 8.5, ck), P7.z + lerp(9.5, 13, ck)), look = lv(V(P7.x, .6, P7.z), pos.clone().add(SUN.clone().multiplyScalar(300)), tk * .9);
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

  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    frame3D(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    tmpV.copy(cam.position).add(SUN.clone().multiplyScalar(500)).project(cam);
    if (tmpV.z < 1 && Math.abs(tmpV.x) < 1.6 && Math.abs(tmpV.y) < 1.6) godRays(ctx, (tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H, .55);
    // in from the white of the gold point; out into the light from above
    const wIn = 1 - ss(T.start, T.white1, t), wOut = ss(T.tilt[0] + .3, T.end, t) * .8, wk = Math.max(wIn, wOut);
    if (wk > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,244,222,${wk})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  return { film, draw, beats: () => T };
}
