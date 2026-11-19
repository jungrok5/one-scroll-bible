// valley-oil.js — 「kingdom」 2부 시안 A2 (2026-11-19): the valley of concept A rebuilt in the owner's oil-paint-world skill
// (motion-skills/oil-paint-world, copied into ./kit-oilpaint-world/ — see the headers there). Every blade, leaf, cloud, stone and fold
// of the robe is a dab of a loaded brush pinned to the world, in three mixed paints; brush relief, linen weave, varnish. A1 (valley3d.js)
// read as a storybook game (round blob trees, lollipop dead trees, a river like a blurred path, a hazy opening) — here the same beats are
// painted: crowns of leaf dabs on real limbs, bare trees as branch strokes, the river as long flow strokes giving back the gold sky.
// "햇빛 = 왕의 다스림": the light is the protagonist; the paint itself drains and comes back (paint.js gradeC: uSunK · uLife · front · pools).
//   Block 1 (110 → 142.3, one camera, no cuts): above a sea of gold cloud, looking into the sun (no figure) → down through a gap into the
//     golden valley at Q40 (fields, an orchard, the river glinting, shafts of sun through cloud gaps, grass leaning toward the light) →
//     a small man in a plain robe stands in a pool of light, facing it (N41) → he turns his back on it while the camera swings round with
//     him (we stay behind him: the light goes out of the frame behind us, his shadow lies ahead) → he walks down the valley → (N42) the
//     cloud closes, the shafts go out one by one, the paint drains to grey-umber, the leaves turn and fall, the trees stand as bare
//     branch strokes; a grave mound and a standing stone come up beside him, rain; he turns to it and bows → (~140) far down the valley one
//     shaft breaks through on the horizon → (142.3) the eye pushes gently into it → white → heal-village.js S1 (its sun, x .37 W y .29 H).
//   Block 2 (215.7 → 237.6, same place): from black, the grey valley; the cloud parts from the horizon and a front of light sweeps up the
//     valley; where it touches, green and gold paint return, leaves bud on the bare trees, the grave sinks into the grass → (N47) he turns
//     toward the light and lifts his head → the camera pulls back and rises over the restored valley.
// Two suns, each baked once (the skill's one-hour rule, per block): A behind the meadow (block 1), B on the far horizon (block 2).
// API: const VO = await (await import('./valley-oil.js')).build(W, H);  VO.draw(ctx, t, B)  t = FILM seconds, B = line times.
import { World, THREE, P, pal, mix3, noise, fbm, sm, lerp, rng } from './kit-oilpaint-world/world.js';
import * as kit from './kit-oilpaint-world/kit.js';
import { Figure } from './kit-oilpaint-world/figure.js';

const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => sm(a, b, x);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const dirOf = (az, el) => { const a = az * D2R, e = el * D2R; return V(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)); };
const C3 = (h) => { const c = h.replace('#', ''); return new THREE.Vector3(parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255); };
const mixU = (u, a, b, k) => u.value.copy(a).lerp(b, k);
const h2 = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------- the land (metres; the river runs along z; down the valley is −z)
const riverX = (z) => -26 + 16 * Math.sin(z * 0.012 + 0.4) + 7 * Math.sin(z * 0.031 + 1.3);
const riverDX = (z) => 16 * 0.012 * Math.cos(z * 0.012 + 0.4) + 7 * 0.031 * Math.cos(z * 0.031 + 1.3);
function height(x, z) {
  const d = x - riverX(z), ad = Math.abs(d);
  let h = 0.55 + 0.7 * fbm(x / 38, z / 38, 3, 1);                                       // the meadow's swell
  h += 52 * (1 - Math.exp(-((d / 150) ** 2))) * (0.6 + 0.8 * fbm(x / 300 + 7, z / 300, 3, 2));   // the valley's walls
  h += 26 * fbm(x / 85, z / 85, 3, 3) * sm(60, 220, ad);                                // ridges on the slopes
  h -= 2.3 * Math.exp(-((d / 5.6) ** 2));                                              // the river's bed (water at 0)
  return h;
}

// the places
const SUN_A = dirOf(178, 21), SUN_B = dirOf(357, 9);   // A straight up the valley (behind the meadow), B on the far horizon down it
const sunH = V(SUN_A.x, 0, SUN_A.z).normalize();          // the light's way on the ground (block 1)
const F1 = sunH.clone().negate();                          // he walks away from it, down the valley
const RIGHT1 = V(-F1.z, 0, F1.x);                          // his right while he walks
const P0 = V(0, 0, 0), P1 = P0.clone().addScaledVector(F1, 8);
const GRAVE = P1.clone().addScaledVector(RIGHT1, 1.3).addScaledVector(F1, 1.2);
const TREE = P1.clone().addScaledVector(RIGHT1, 5.0).addScaledVector(F1, 4.0);
const F2 = GRAVE.clone().sub(P1).setY(0).normalize();      // facing the grave
const G = V(riverX(-1100) - 20, 105, -1100);               // the far gap where one shaft breaks through (block 1 end) — the light of block 2
const CLOUD_Y = 118;

export function beats(B) {
  const T = { n40: B.N40, q40: B.Q40, n41: B.N41, n42: B.N42, n43: B.N43, q44: B.Q44, n47: B.N47, end2: B.C2 };
  T.turn = [T.n41 + 0.9, T.n41 + 3.4];          // he turns his back on the light (the camera swings round with him)
  T.walk = [T.n41 + 3.4, T.n42 + 2.6];          // and walks down the valley, out of the light
  T.face = [T.walk[1] - 0.1, T.walk[1] + 0.9];  // turns to the grave
  T.bow = [T.walk[1] + 0.5, T.walk[1] + 2.0];
  T.dark = [T.n42 - 0.6, T.n42 + 3.0];          // the cloud closes, the shafts go out one by one
  T.wither = [T.n42 + 0.2, T.n42 + 5.0];        // the paint drains, the leaves turn and fall
  T.rain = T.n42 + 1.6;
  T.grave = [T.n42 + 1.8, T.n42 + 3.8];
  T.pierce = T.n43 - 2.3;                       // one shaft on the horizon
  T.flare = [T.n43 - 1.25, T.n43];              // into it, to white
  T.front0 = T.q44 + 0.9;                       // block 2: the front of light sets out from the horizon
  T.lift = [T.n47 - 2.2, T.n47 - 0.2];          // the light reaches him: his head comes up a little
  T.turnBack = [T.n47 + 0.3, T.n47 + 1.8];
  return T;
}

export async function build(W, H) {
  const q = +(new URLSearchParams(location.search).get('q') || 1);
  const Wd = new World({
    embed: true, size: [W, H], name: 'valley', seed: 7, extent: 300, landRes: 1025, q,
    sun: { dir: [SUN_A.x, SUN_A.y, SUN_A.z] }, wind: { az: 215, strength: 0.55 },
    air: { haze: '#c4b69a', sun: '#ffe2a8', glow: '#2c1c08', density: 0.0028 },
    glaze: { mul: '#76707a', add: '#06050a' }, bounce: '#1c1200',
    finish: { shafts: 0.25, glow: '#ffdca0', varnish: 0.24, canvas: 1 },
    shade: { size: [3072, 3072], box: [170, 170], centre: [0, 4, -20], back: 600 },
  });
  const S = Wd.shared;
  // uniforms of this world's own things, shared by their materials
  const U = {
    uSkyZen: { value: C3('#3f6cb4') }, uSkyHor: { value: C3('#f3d49a') }, uSkyGlo: { value: C3('#fff1c8') }, uGlowDir: { value: SUN_A.clone() }, uGlowK: { value: 1 },
    uDiscDir: { value: SUN_A.clone() }, uDiscK: { value: 1 },
    uCover: { value: 0.42 }, uGaps: { value: Array.from({ length: 8 }, () => new THREE.Vector4()) }, uCloudPart: { value: 0 },
    uClTopL: { value: C3('#fff4d8') }, uClTopM: { value: C3('#f2d4a4') }, uClTopS: { value: C3('#c6a294') },
    uClBotL: { value: C3('#f6d9a8') }, uClBotM: { value: C3('#c9a184') }, uClBotS: { value: C3('#7d6c80') },
    uRain: { value: 0 }, uDust: { value: 0 }, uGraveLift: { value: -1.4 },
  };
  Object.assign(S, U);   // every dab material spreads the shared uniforms: declared once, read anywhere

  // ---------------------------------------------------------------- the way (his few metres) and the land
  Wd.way([[P0.x - F1.x * 2, P0.z - F1.z * 2], [P0.x, P0.z], [P1.x, P1.z], [P1.x + F1.x * 6, P1.z + F1.z * 6]]);
  const ORCH = [[16, 46, 14, 58], [8, 40, -72, -36]];   // x0 x1 z0 z1
  const inOrch = (x, z) => ORCH.some(([a, b, c, d]) => x > a - 3 && x < b + 3 && z > c - 3 && z < d + 3);
  Wd.land({
    height,
    cover: (x, z) => {
      const d = x - riverX(z), ad = Math.abs(d);
      const bank = sm(7.8, 4.4, ad);
      const fx = (x * 0.93 + z * 0.37) / 34, fz = (z * 0.93 - x * 0.37) / 21, ix = Math.floor(fx), iz = Math.floor(fz);
      const inner = sm(0, 0.05, fx - ix) * sm(1, 0.95, fx - ix) * sm(0, 0.09, fz - iz) * sm(1, 0.91, fz - iz);
      const floor = (1 - sm(60, 100, ad)) * sm(13, 20, ad), meadow = sm(20, 32, Math.hypot(x - P0.x, z - P0.z + 4));
      const field = (h2(ix, iz) < 0.42 ? 1 : 0) * inner * floor * meadow * (inOrch(x, z) ? 0 : 1);
      const rock = sm(0.56, 0.7, noise(x / 23, z / 23, 5)) * sm(120, 190, ad);
      return [bank, field, rock, 0];
    },
  });

  // ---------------------------------------------------------------- the sky: a dome of broad strokes whose colours the rule of light moves
  {
    const R = 1400, group = new THREE.Group();
    const head = /* glsl */ `uniform vec3 uSkyZen; uniform vec3 uSkyHor; uniform vec3 uSkyGlo; uniform vec3 uGlowDir; uniform float uGlowK;
      vec3 skyAt(vec3 dir) {
        float el = max(dir.y, 0.0);
        vec3 mid = mix(uSkyHor, uSkyZen, 0.42) * vec3(0.93, 1.02, 1.1);   // a cool band between the gold horizon and the blue
        vec3 c = mix(uSkyHor, mid, smoothstep(0.0, 0.22, el));
        c = mix(c, uSkyZen, smoothstep(0.2, 0.65, el));
        float sw = max(dot(dir, uGlowDir), 0.0);
        return mix(c, uSkyGlo, clamp((pow(sw, 26.0) * 0.5 + pow(sw, 220.0) * 0.9) * uGlowK, 0.0, 1.0));
      }`;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 1.2, 24, 12), new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms: S, side: THREE.BackSide, depthTest: false, depthWrite: false,
      vertexShader: `${P.COMMON}\nout vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * viewMatrix * vec4(position + cameraPosition, 1.0); }`,
      fragmentShader: `${P.COMMON}\n${head}\nin vec3 vDir; layout(location = 0) out vec4 outC; void main() { vec3 d = normalize(vDir); vec3 c = skyAt(d); c = mix(c, airColour(d), (1.0 - smoothstep(-0.05, 0.14, d.y)) * 0.75); outC = vec4(c, 1.0); }`,
    }));
    dome.frustumCulled = false; dome.renderOrder = -40; group.add(dome);
    const n = Math.round(4200 * Math.max(q, 0.5)), dirs = new Float32Array(n * 3), rs = rng(17), gap = Math.sqrt((4 * Math.PI * 0.6) / n);
    for (let i = 0, k = 0; k < n; i++) {
      const y = 1 - 1.2 * (i + 0.5) / n, a = i * 2.39996323, r = Math.sqrt(Math.max(0, 1 - y * y));   // the spiral runs from the zenith to just under the horizon
      if (y < -0.2) break;
      const d = V(Math.cos(a) * r + (rs() - 0.5) * gap * 1.5, y + (rs() - 0.5) * gap * 1.5, Math.sin(a) * r + (rs() - 0.5) * gap * 1.5).normalize();
      dirs.set([d.x, d.y, d.z], k * 3); k++;
    }
    const size = R * gap * 1.7;
    group.add(P.dabMesh(P.dabGeometry(n, { aDir: [dirs, 3] }), P.dabMaterial(S, {
      head: `in vec3 aDir;\n${head}`, grade: false,
      body: /* glsl */ `
        void makeDab(inout Dab d) {
          vec3 dir = normalize(aDir);
          vec4 r = hash4(float(gl_InstanceID) + 3.7);
          vec3 c = skyAt(dir);
          // high thin cloud: level strokes of the light colour where a slow field says so (fewer as the light goes)
          vec2 cp = dir.xz / (dir.y + 0.45) * 2.2;
          float cn = texture(tNoise, cp * 0.13 + 0.2).r * 0.65 + texture(tNoise, cp * 0.37).g * 0.35;
          float ci = smoothstep(0.44, 0.62, cn) * smoothstep(0.03, 0.16, dir.y) * 0.8;
          c = mix(c, mix(uSkyHor, uSkyGlo, 0.5) * 1.04, ci);
          c = jitter(c, r.yzw, 0.6);
          c = mix(c, airColour(dir), (1.0 - smoothstep(-0.05, 0.14, dir.y)) * 0.75);
          d.pos = cameraPosition + dir * ${R.toFixed(1)};
          vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), dir) + 1e-4);
          float tilt = (texture(tNoise, dir.xz * 3.0 + 0.2).b - 0.5) * 1.2;
          d.dir = normalize(east + cross(dir, east) * tilt);
          d.size = vec2(${size.toFixed(2)} * (0.7 + 0.6 * r.y), ${size.toFixed(2)} * (1.7 + 1.1 * r.z));
          d.c1 = c; d.c2 = jitter(c * 1.1, r.wxy, 0.45); d.lift = 0.0; d.turnabout = 1.0;
        }`,
      minPx: [5, 9], maxPx: [4000, 4000], cells: [0, 3], depthTest: false, depthWrite: false, relief: 0.7,
    }), -30));
    // the sun's disc (block 1 above the cloud) — a few pressed strokes, light that is light
    const sz = Math.tan(2.6 * D2R) * R;
    group.add(P.dabMesh(P.dabGeometry(9), P.dabMaterial(S, {
      head: 'uniform vec3 uDiscDir; uniform float uDiscK;', grade: false,
      body: /* glsl */ `
        void makeDab(inout Dab d) {
          vec4 r = hash4(float(gl_InstanceID) * 3.1 + 0.7);
          if (uDiscK < 0.01) { d.alive = 0.0; return; }
          vec3 dir = normalize(uDiscDir), e = normalize(cross(vec3(0.0, 1.0, 0.0), dir)), n = cross(dir, e);
          float a = r.x * TAU, rad = gl_InstanceID == 0 ? 0.0 : 0.5;
          d.pos = cameraPosition + (dir + (e * cos(a) + n * sin(a)) * rad * ${(sz / R).toFixed(4)}) * ${(R * 0.99).toFixed(1)};
          d.dir = e * cos(a * 2.0) + n * sin(a * 2.0);
          d.size = vec2(${sz.toFixed(2)}) * (gl_InstanceID == 0 ? vec2(1.7, 1.7) : vec2(0.7, 0.9));
          d.c1 = jitter(vec3(1.0, 0.96, 0.84), r.yzw, 0.1) * uDiscK; d.c2 = d.c1 * 1.03; d.cell = 4.0 + floor(r.w * 1.99); d.lift = 0.0;
        }`,
      minPx: [6, 6], maxPx: [4000, 4000], depthTest: false, depthWrite: false, additive: true,
    }), -29));
    Wd.add({ name: 'sky', group, count: n + 9, drawn: () => n + 9 });
  }

  // far ranges: up the valley (behind the sun) and down it, open where the valley goes out toward the far gap
  Wd.add(kit.ranges(Wd, { rows: [
    { dist: 1500, height: 150, base: -10, pal: pal('#c8b0b0', '#9c8ea6', '#76709a'), haze: 0.6, seed: 5, arc: [-40, 40] },
    { dist: 1150, height: 210, base: 0, pal: pal('#c9b38e', '#9a9078', '#6a6878'), haze: 0.48, seed: 9, arc: [8, 170] },
    { dist: 1150, height: 230, base: 0, pal: pal('#c9b38e', '#9a9078', '#6a6878'), haze: 0.48, seed: 13, arc: [190, 352] },
  ] }));

  // the river: long strokes along its flow, giving back the gold sky low and glinting toward the sun
  Wd.add(kit.water(Wd, { level: 0, deep: '#1f4e68', sky: '#d6d6bc', shallow: '#4f8a84', glint: '#fff7dc', speed: 0.7, stroke: [0.8, 3.4],
    flowAt: `float dx = 16.0 * 0.012 * cos(p.y * 0.012 + 0.4) + 7.0 * 0.031 * cos(p.y * 0.031 + 1.3); return normalize(vec2(dx, 1.0));` }));

  // the ground: meadow golds and greens; r the river's banks; g the fields (wheat); b scree on the high slopes
  Wd.add(kit.ground(Wd, { sunny: 2.6, patch: 14, levels: 7, covers: [
    { pals: [pal('#b9c45a', '#7c973e', '#33463c'), pal('#cdc864', '#93993f', '#3e4a3e'), pal('#9fba56', '#66883c', '#2f443c')] },
    { pals: [pal('#dccb9c', '#a8936e', '#5a4c52'), pal('#c8b88c', '#968466', '#52485a')] },
    { pals: [pal('#eab65a', '#b8863e', '#5e4434'), pal('#e2a850', '#ae7c3a', '#5a4234'), pal('#f0c46a', '#c09448', '#62483a')] },
    { pals: [pal('#d0bea2', '#958671', '#544c5c')] },
  ] }));
  Wd.add(kit.growth(Wd, { density: 0.78, offWay: 0, kinds: [
    { pal: pal('#c4cc5e', '#84a040', '#344a3c'), tall: [0.3, 0.62], wide: 0.035, fan: 0.3, share: 6, mask: '!g' },
    { pal: pal('#eab65a', '#b8863e', '#5e4434'), tall: [0.7, 1.05], wide: 0.03, fan: 0.14, share: 7, mask: 'g', head: { pal: pal('#f4cc78', '#c8984a', '#6e5038'), size: 0.07 } },
    { pal: pal('#a8b452', '#6f8640', '#34443a'), tall: [0.24, 0.42], wide: 0.03, fan: 0.5, share: 1.0, mask: '!g', head: { pal: pal('#fff4d0', '#e8d29a', '#8a7a6c'), size: 0.075 } },
    { pal: pal('#a8b452', '#6f8640', '#34443a'), tall: [0.22, 0.4], wide: 0.03, fan: 0.5, share: 0.7, mask: '!g', head: { pal: pal('#ffd560', '#e0a83a', '#8a5a30'), size: 0.07 } },
    { pal: pal('#a8bc5a', '#68863e', '#2f4236'), tall: [1.0, 1.7], wide: 0.04, fan: 0.22, share: 4, mask: 'r', stiff: 0.3 },
  ] }));

  // ---------------------------------------------------------------- trees: the meadow's, the orchards, the river's, groves on the slopes
  const TRUNK = pal('#8a6a4a', '#5e4636', '#2f2433'), LEAF = [pal('#b6ba5c', '#6e8c3a', '#2a4434'), pal('#d6c464', '#8c9040', '#36463a'), pal('#a6bc58', '#5e8238', '#283e34')];
  const at = [];
  at.push({ x: TREE.x, z: TREE.z, kind: 'meadow', scale: 1.05, hero: true });
  for (const [x, z, s] of [[-16, 6, 1], [20, 14, 0.95], [21, -5, 1.1], [-21, -21, 1], [11, -25, 0.9], [25, 22, 1.05], [-15, 26, 0.95], [13, 38, 1.1], [-27, 8, 1], [-22, -34, 1]]) at.push({ x, z, kind: 'meadow', scale: s });
  { const r = rng(91); for (const [x0, x1, z0, z1] of ORCH) for (let x = x0; x <= x1; x += 4.6) for (let z = z0; z <= z1; z += 5.2) at.push({ x: x + (r() - 0.5) * 0.8, z: z + (r() - 0.5) * 0.8, kind: 'orchard', scale: 0.9 + r() * 0.2 }); }
  { const r = rng(57); for (let z = -230; z < 260; z += 10 + r() * 5) for (const s of [-1, 1]) if (r() < 0.75) { const d = s * (8.5 + r() * 5), x = riverX(z) + d; if (Math.hypot(x - P0.x, z - P0.z) > 14) at.push({ x, z, kind: 'river', scale: 0.9 + r() * 0.3 }); } }
  Wd.add(kit.trees(Wd, {
    tiers: [40, 95], sway: 0.8,
    kinds: {
      meadow: { trunk: { pal: TRUNK, r: [0.22, 0.32], h: [7.5, 9.5], bark: 'long', moss: '#6a7a2a' }, crown: { shape: 'round', pals: LEAF, spread: [3.4, 4.5], dense: 120, leaf: 0.16, limbs: [6, 8], twigs: 16, dark: '#243424', through: 0.5 } },
      orchard: { trunk: { pal: pal('#7a5a40', '#56402f', '#2c2230'), r: [0.12, 0.16], h: [4, 4.8], moss: false }, crown: { shape: 'round', pals: [pal('#b8c25a', '#6e8c3a', '#2c4232'), pal('#dcc66a', '#a89a46', '#4a4436')], spread: [2.1, 2.6], dense: 80, leaf: 0.17, limbs: [4, 6], twigs: 12, dark: '#253523', through: 0.7 } },
      river: { trunk: { pal: pal('#7e6a56', '#584a40', '#2c2832'), r: [0.25, 0.36], h: [9, 12], bark: 'long' }, crown: { shape: 'round', pals: [pal('#a4bc5c', '#5e8442', '#263e38'), pal('#b8c060', '#6c8a44', '#2a4038')], spread: [3.6, 5], dense: 96, leaf: 0.19, limbs: [6, 8], twigs: 14, dark: '#203430', through: 0.7 } },
      grove: { trunk: { pal: TRUNK, r: [0.25, 0.4], h: [9, 13] }, crown: { shape: 'round', pals: [pal('#b8bc56', '#6a8a3a', '#2a4034'), LEAF[2]], spread: [3.8, 5.2], dense: 54, leaf: 0.28, twigs: 10, dark: '#22322a' } },
    },
    at,
    scatter: { grid: 15, fill: 0.5, offWay: 12, vary: 0.3, kind: (x, z, rand) => { const ad = Math.abs(x - riverX(z)); if (inOrch(x, z) || Math.hypot(x - P0.x, z - P0.z) < 34) return null; if (ad < 15) return null; const g = fbm(x / 70, z / 70, 3, 9); return (ad > 55 ? g > 0.52 : g > 0.66 && rand() < 0.5) && height(x, z) < 70 ? 'grove' : null; } },
  }));

  // ---------------------------------------------------------------- the grave: a mound of earth and a standing stone (rises in block 1, sinks in block 2)
  {
    const g = (x, z) => Wd.groundAt(x, z), Sh = kit.shape, gy = g(GRAVE.x, GRAVE.z), ry = Math.atan2(F2.x, F2.z);
    const mound = Sh.boulder(0.62, { pal: 0, at: [GRAVE.x, gy - 0.12, GRAVE.z], seed: 4, squash: 0.55, size: [0.14, 0.3], grain: 'across' });
    mound.scale.set(0.9, 1, 1.75); mound.rotation.y = ry + Math.PI / 2;
    const sx = GRAVE.x + F2.x * 0.9 * -1, sz = GRAVE.z + F2.z * 0.9 * -1;   // the stone at the mound's far end, as he faces it
    const stone = Sh.box(0.42, 0.95, 0.14, { pal: 1, at: [GRAVE.x + F2.x * 1.05, gy - 0.1, GRAVE.z + F2.z * 1.05], ry, grain: 'up', size: [0.1, 0.26] });
    stone.rotation.x = -0.06; stone.rotation.z = 0.05;
    const pebble = Sh.boulder(0.16, { pal: 1, at: [sx + RIGHT1.x * 0.6, gy, sz + RIGHT1.z * 0.6], seed: 8, size: [0.07, 0.12] });
    Wd.add(kit.solid(Wd, [mound, stone, pebble], { name: 'grave', density: 260, size: [0.13, 0.28], cast: false, lift: U.uGraveLift,
      pals: [pal('#a88e6a', '#7a6650', '#3e3440'), pal('#c8c0ae', '#928a80', '#504a5a')] }));
  }

  // ---------------------------------------------------------------- the cloud: a sea of big pressed strokes in three layers, pinned to the sky
  {
    const r = rng(311), pos = [], data = [];
    for (let x = -680; x <= 680; x += 9.5) for (let z = -1120; z <= 600; z += 9.5) for (let l = 0; l < 3; l++) {
      pos.push(x + (r() - 0.5) * 9, CLOUD_Y + l * 13 + (r() - 0.5) * 9, z + (r() - 0.5) * 9);
      data.push(r() * 1000, 10 + r() * 7, l / 2, 0);
    }
    const n = pos.length / 3;
    const chunks = P.dabChunks(S, { count: n, attributes: { aPos: [new Float32Array(pos), 3], aData: [new Float32Array(data), 4] } }, {
      head: /* glsl */ `in vec3 aPos; in vec4 aData;
        uniform float uCover; uniform vec4 uGaps[8]; uniform float uCloudPart; uniform float uGlowK; uniform vec3 uGlowDir; uniform vec3 uSkyGlo;
        uniform vec3 uClTopL; uniform vec3 uClTopM; uniform vec3 uClTopS; uniform vec3 uClBotL; uniform vec3 uClBotM; uniform vec3 uClBotS;
        float cloudField(vec2 p) { return texture(tNoise, p / 610.0).r * 0.62 + texture(tNoise, p / 190.0 + 0.31).g * 0.38; }`,
      grade: false,
      body: /* glsl */ `
        void makeDab(inout Dab d) {
          vec3 P = aPos; P.xz += vec2(0.18, -0.12) * (uTime - 110.0);
          if (unseen(P, aData.y * 1.6 + 30.0)) { d.alive = 0.0; return; }
          vec4 r = hash4(aData.x);
          float cn = cloudField(P.xz);
          P.y += (cn - 0.5) * 34.0 * aData.z + (cn - 0.5) * 10.0;   // heaped: where the cloud is thick its tops stand higher
          float th = cn - (1.0 - uCover) - aData.z * 0.07;
          float g = 0.0;
          for (int i = 0; i < 8; i++) { vec4 q = uGaps[i]; g = max(g, q.w * (1.0 - smoothstep(q.z * 0.55, q.z, length(P.xz - q.xy)))); }
          th -= g * 0.9 + uCloudPart * frontM(P.xz, uFront.z + 170.0);
          vec2 edge = min(aPos.xz - vec2(-680.0, -1120.0), vec2(680.0, 600.0) - aPos.xz);   // the layer's edge melts into the sky
          th -= 0.5 * (1.0 - smoothstep(0.0, 160.0 + 120.0 * texture(tNoise, aPos.xz / 300.0).b, min(edge.x, edge.y)));
          d.alive = smoothstep(0.0, 0.1, th) * smoothstep(16.0, 60.0, distance(P, cameraPosition));
          if (d.alive <= 0.0) return;
          vec2 sw = normalize(uSunDir.xz + 1e-4) * 70.0;
          float lit = clamp(0.58 + (cn - cloudField(P.xz + sw)) * 5.0 + (aData.z - 0.4) * 0.6 + (r.y - 0.5) * 0.3, 0.0, 1.0);
          float below = smoothstep(-10.0, 10.0, P.y - cameraPosition.y);
          vec3 top = paint3(uClTopL, uClTopM, uClTopS, lit, r.x);
          vec3 bot = paint3(uClBotL, uClBotM, uClBotS, mix(0.2, 0.8, 1.0 - clamp(th * 4.0, 0.0, 1.0)) + (r.z - 0.5) * 0.25, r.x);
          vec3 c = mix(top, bot, below);
          vec3 vd = normalize(P - cameraPosition);
          c += uSkyGlo * uGlowK * pow(max(dot(vd, uGlowDir), 0.0), 18.0) * (1.0 - clamp(th * 3.0, 0.0, 1.0) * 0.5) * 0.9;
          c = jitter(c, r.yzw, 0.3); c = mix(c, hazed(c, P), 0.32);
          vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), vd) + 1e-4);
          d.pos = P; d.dir = normalize(east + vec3(0.0, (r.w - 0.5) * 0.5, 0.0));
          float s = aData.y * (0.7 + 0.5 * smoothstep(0.0, 0.3, th));
          d.size = vec2(s, s * (1.3 + 0.5 * r.z));
          d.c1 = c; d.c2 = jitter(c * 1.06, r.wxy, 0.3);
          d.lift = 0.0; d.turnabout = 1.0;
          d.cell = r.w < 0.7 ? 4.0 + floor(r.z * 1.99) : (r.z < 0.5 ? 3.0 : 7.0);
        }`,
      minPx: [6, 9], maxPx: [1400, 1400], cells: [4, 2], relief: 0.55,
    }, { cell: 110, order: 1, lod: { near: 260, far: 900, keep: 0.45 }, pad: 50 });
    let stamp = 0; for (const ch of chunks.chunks) { const prev = ch.mesh.onBeforeRender; ch.mesh.onBeforeRender = (...a) => { ch.seen = stamp; prev(...a); }; }
    Wd.add({ name: 'cloud', group: chunks.group, count: n, follow: () => { stamp++; }, drawn: () => chunks.chunks.reduce((s, ch) => s + (ch.seen === stamp ? ch.drawn : 0), 0) });
  }

  // ---------------------------------------------------------------- rain (thin pale strokes round the eye) and dust in the shaft (light)
  {
    const n = Math.round(7000 * Math.max(q, 0.5));
    Wd.add({ name: 'rain', count: n, drawn: () => (U.uRain.value > 0.01 ? n : 0), group: P.dabMesh(P.dabGeometry(n), P.dabMaterial(S, {
      head: 'uniform float uRain;', grade: false,
      body: /* glsl */ `
        void makeDab(inout Dab d) {
          if (uRain < 0.01) { d.alive = 0.0; return; }
          float id = float(gl_InstanceID);
          vec4 r = hash4(id * 1.31 + 7.0), q = hash4(id * 0.77 + 31.0);
          vec3 B = vec3(30.0, 18.0, 30.0);
          vec3 p = r.xyz * B;
          p.y -= uTime * (7.5 + 2.0 * r.w);
          p.xz += vec2(0.9, 0.4) * uTime;
          vec3 fwd = -vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
          vec3 c0 = cameraPosition + normalize(vec3(fwd.x, 0.0, fwd.z) + 1e-4) * 11.0;
          p = c0 + mod(p - c0 + B * 0.5, B) - B * 0.5;
          vec3 e = abs(p - c0) / (B * 0.5);
          d.alive = uRain * (1.0 - smoothstep(0.75, 1.0, max(e.x, max(e.y, e.z)))) * step(heightAt(p.xz), p.y) * step(q.x, 0.85);
          if (d.alive <= 0.0) return;
          d.pos = p; d.dir = normalize(vec3(0.09, -1.0, 0.04));
          d.size = vec2(0.011, 0.45 + 0.35 * q.y);
          vec3 c = mix(vec3(0.7, 0.72, 0.76), vec3(0.85, 0.86, 0.88), q.z);
          d.c1 = hazed(c, p); d.c2 = d.c1 * 1.05; d.cell = floor(q.w * 2.99); d.lift = 0.0;
        }`,
      minPx: [1.6, 9], maxPx: [6, 140], cells: [0, 3],
    }), 6) });
    const nd = 340;
    Wd.add({ name: 'dust', count: nd, drawn: () => nd, group: P.dabMesh(P.dabGeometry(nd), P.dabMaterial(S, {
      head: 'uniform float uDust;', grade: false, additive: true,
      body: /* glsl */ `
        void makeDab(inout Dab d) {
          if (uDust < 0.01) { d.alive = 0.0; return; }
          float id = float(gl_InstanceID);
          vec4 r = hash4(id * 2.13 + 1.0), q = hash4(id * 0.61 + 17.0);
          vec3 c0 = vec3(${P0.x.toFixed(2)}, heightAt(vec2(${P0.x.toFixed(2)}, ${P0.z.toFixed(2)})) + 3.2, ${P0.z.toFixed(2)});
          vec3 p = c0 + (r.xyz - 0.5) * vec3(9.0, 6.5, 9.0);
          p.y += mod(uTime * (0.05 + 0.07 * q.x) + q.y * 6.5, 6.5) - 3.25 * q.y;
          p.xz += vec2(sin(uTime * 0.4 + q.z * 30.0), cos(uTime * 0.3 + q.w * 20.0)) * 0.35;
          d.alive = uDust * (0.4 + 0.6 * q.z) * (1.0 - smoothstep(3.5, 5.0, length((p - c0).xz)));
          d.pos = p; d.dir = vec3(0.0, 1.0, 0.0); d.size = vec2(0.03 + 0.03 * q.w);
          d.c1 = vec3(1.0, 0.84, 0.52) * 0.55; d.c2 = d.c1; d.cell = 4.0 + floor(q.w * 1.99); d.lift = 0.0;
        }`,
      minPx: [2, 2], maxPx: [7, 7],
    }), 7) });
  }

  // ---------------------------------------------------------------- the man: a plain undyed robe to the ankles, a head cloth to the shoulders
  const fig = Wd.figure(new Figure({
    height: 1.72, build: 1, hair: 'long', sleeves: 'long', coat: { length: 0.74, flare: 0.26 },
    palettes: { skin: mix3('#a8744e', { into: '#4a3030' }), hair: pal('#f0e8d6', '#cfc3a8', '#7a7266'), top: pal('#d6c29c', '#ae9878', '#6a5c4c'), legs: pal('#b09878', '#86705a', '#4c4238'),
      shoes: mix3('#5a3e2c'), coat: pal('#d6c29c', '#ae9878', '#6a5c4c') },
    paint: 520, seed: 4242,
  }));

  Wd.prepare();
  const SHADE_A = Wd.bakeShade(SUN_A), SHADE_B = Wd.bakeShade(SUN_B);
  const FR = Wd.frame.uniforms;

  // ---------------------------------------------------------------- the shafts (block 1: through gaps up the valley; block 2: as the front passes)
  const BEAM_A = dirOf(178, 36), BEAM_B = dirOf(355, 38);
  const gy = (x, z) => Wd.groundAt(x, z);
  const beamsA = [[-6, 52, 16], [34, 96, 20], [-44, 128, 22], [10, 170, 24], [52, 30, 14], [-30, -70, 18]].map(([x, z, r]) => ({ x, z, r, pool: r * 1.15 }));
  const meadowBeam = { x: P0.x, z: P0.z, r: 4.2, pool: 6.5, gain: 1.6, glow: 3.2 };
  const beamsB = [[-40, -120, 18], [12, -60, 16], [-20, -210, 24], [30, -160, 20], [P1.x, P1.z, 5]].map(([x, z, r]) => ({ x, z, r, pool: r * 1.2 }));
  const gapOf = (b, dir) => { const k = (CLOUD_Y + 6 - gy(b.x, b.z)) / dir.y; return [b.x + dir.x * k, b.z + dir.z * k]; };

  // ---------------------------------------------------------------- the man's place and pose at t
  const STRIDE = fig.strideFor(1.25), WALK_LEN = P1.distanceTo(P0);
  const yawOf = (v) => Math.atan2(v.x, v.z);
  const fromYaw = (a) => V(Math.sin(a), 0, Math.cos(a));
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  let T = null;
  function easeWalk(u) { const a = 0.14, b = 0.16, vmax = 1 / (1 - a / 2 - b / 2);   // accelerate over a, cruise, slow over b
    if (u < a) return vmax * u * u / (2 * a); if (u > 1 - b) { const w = 1 - u; return 1 - vmax * w * w / (2 * b); } return vmax * (u - a / 2); }
  const yaw0 = yawOf(sunH), yaw1 = yawOf(F1), yaw2 = yawOf(F2), yawG = yawOf(V(G.x - P1.x, 0, G.z - P1.z));
  const TURN_DIR = 1;   // he turns (and the camera swings) this way round: +1 counter-clockwise seen from above
  function manAt(t) {
    const st = { shot: { figure: true }, x: 0, z: 0, hx: 0, hz: 1, phase: 0, stride: STRIDE, speed: 0, look: null, lookK: 0, bow: 0 };
    let x, z, yaw, speed = 0, phase = 0, bow = 0, look = null, lookK = 0;
    if (t < 200) {
      if (t < T.walk[0]) {
        const k = ss(T.turn[0], T.turn[1], t); yaw = yaw0 + TURN_DIR * Math.PI * k; x = P0.x; z = P0.z;
        look = [P0.x + sunH.x * 20, 14, P0.z + sunH.z * 20]; lookK = 1 - ss(T.turn[0] - 0.4, T.turn[0] + 0.8, t);   // his face lifted into the light, then down
      } else {
        const s = WALK_LEN * easeWalk(cl((t - T.walk[0]) / (T.walk[1] - T.walk[0])));
        const e = 0.02, s2 = WALK_LEN * easeWalk(cl((t + e - T.walk[0]) / (T.walk[1] - T.walk[0])));
        speed = (s2 - s) / e; phase = s / STRIDE; x = P0.x + F1.x * s; z = P0.z + F1.z * s;
        yaw = yaw1 + wrap(yaw2 - yaw1) * ss(T.face[0], T.face[1], t);
        bow = ss(T.bow[0], T.bow[1], t);
      }
    } else {
      x = P1.x; z = P1.z; phase = WALK_LEN / STRIDE;
      const lit = frontAt(P1.x, P1.z, frontR(t)), k = ss(T.turnBack[0], T.turnBack[1], t);
      yaw = yaw2 + wrap(yawG - yaw2) * k;
      bow = lerp(1, 0.55, ss(T.lift[0], T.lift[1], t) * lit) * (1 - k);
      look = [G.x, 160, G.z]; lookK = ss(T.turnBack[0] + 0.6, T.turnBack[1] + 1.2, t) * 0.85;
    }
    const f = fromYaw(yaw);
    Object.assign(st, { x, z, hx: f.x, hz: f.z, phase, speed, look, lookK, bow, at: (ds) => ({ x: x + f.x * ds, z: z + f.z * ds, hx: f.x, hz: f.z }) });
    return st;
  }

  // ---------------------------------------------------------------- the front of light (block 2)
  const FC = V(-34, 0, -300);
  const frontR = (t) => { const e = Math.max(0, t - T.front0); return t > T.front0 ? 20 + 14 * e + 1.8 * e * e : -1e4; };
  const frontAt = (x, z, R) => { if (R < -1e3) return 0; const d = Math.hypot(x - FC.x, z - FC.z); return 1 - ss(R - 26, R + 26, d); };

  // ---------------------------------------------------------------- the camera: tracks (eye and target on centripetal curves, monotone timing), blended
  function mono(xs, ys) {
    const n = xs.length, d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const al = m[i] / d[i], be = m[i + 1] / d[i], h = al * al + be * be; if (h > 9) { const tt = 3 / Math.sqrt(h); m[i] = tt * al * d[i]; m[i + 1] = tt * be * d[i]; } }
    return (x) => { if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1]; let i = 0; while (xs[i + 1] < x) i++;
      const h = xs[i + 1] - xs[i], u = (x - xs[i]) / h, u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1]; };
  }
  function curveOf(pts, ts) {
    const c = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), div = 60, n = pts.length - 1, Ls = c.getLengths(n * div), tot = Ls[Ls.length - 1] || 1;
    c.arcLengthDivisions = n * div; const U = mono(ts, pts.map((_, i) => Ls[i * div] / tot));
    return (t) => c.getPointAt(cl(U(t)));
  }
  function track(keys) {   // [t, eye, target, fov]
    const ts = keys.map((k) => k[0]), E = curveOf(keys.map((k) => k[1]), ts), Tg = curveOf(keys.map((k) => k[2]), ts), Fv = mono(ts, keys.map((k) => k[3]));
    return (t) => ({ eye: E(t), look: Tg(t), fov: Fv(t) });
  }
  const blend = (A, B, t0, t1) => (t) => { if (t <= t0) return A(t); if (t >= t1) return B(t); const a = A(t), b = B(t), k = ss(t0, t1, t); return { eye: a.eye.lerp(b.eye, k), look: a.look.lerp(b.look, k), fov: lerp(a.fov, b.fov, k) }; };
  const g3 = (x, z, up) => V(x, gy(x, z) + up, z);
  // a target that puts G at (x .37 W, y .29 H) for an eye — the village's sun sits there after the white
  function aimG(eye, fov) {
    const d = G.clone().sub(eye).normalize(), th = Math.tan(fov / 2 * D2R), ax = Math.atan(0.26 * th * (W / H)), ay = Math.atan(0.42 * th);
    const yaw = Math.atan2(d.x, d.z) - ax, pitch = Math.asin(d.y) - ay;   // the centre turned right of G (− yaw) and below it: G sits up and left
    return eye.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(60));
  }
  let CAM1 = null, CAM2 = null;
  const FOV = 52;
  function cameras() {
    const sunAhead = (p, up = 30) => p.clone().addScaledVector(sunH, 200).add(V(0, up, 0));
    // A: above the cloud, looking into the light; down through a gap; down the golden valley to the man in the shaft
    const A = track([
      [110.0, V(-70, 186, -330), V(-70, 186, -330).addScaledVector(sunH, 200).add(V(0, -30, 0)), FOV],
      [113.0, V(-64, 180, -300), V(-64, 180, -300).addScaledVector(sunH, 200).add(V(0, -38, 0)), FOV],
      [115.6, V(-54, 160, -258), V(-30, 50, -120), FOV],
      [117.4, V(-46, 132, -222), V(-18, 10, -60), FOV],
      [119.0, V(-38, 104, -186), V(-10, 4, -40), FOV],
      [121.8, V(-28, 62, -130), V(-2, 4, -10), FOV],
      [124.6, V(-16, 26, -72), V(0, 2.5, 4), FOV],
      [127.2, g3(P0.x - sunH.x * 9.6, P0.z - sunH.z * 9.6, 3.2), V(P0.x + sunH.x * 0.6, gy(P0.x, P0.z) - 0.2, P0.z + sunH.z * 0.6), FOV],
    ]);
    // B: the swing round him as he turns (the eye stays behind him)
    const R0 = 9.6, Bf = (t) => {
      const k = ss(T.turn[0] - 0.5, T.turn[1] + 0.2, t), ph = yaw0 + TURN_DIR * Math.PI * k, f = fromYaw(ph), r = lerp(R0, 10.5, k);
      const eye = V(P0.x - f.x * r, 0, P0.z - f.z * r); eye.y = Math.max(gy(eye.x, eye.z) + lerp(3.2, 2.5, k), gy(eye.x, eye.z) + 0.6);
      return { eye, look: V(P0.x + f.x * lerp(0.6, 1.6, k), gy(P0.x, P0.z) + lerp(-0.2, 0.25, k), P0.z + f.z * lerp(0.6, 1.6, k)), fov: FOV };
    };
    // C: behind him as he walks down the valley; then the far shaft; then the push into it
    const Cf = (t) => {
      const m = manAt(t), fx = m.x, fz = m.z, base = V(fx, gy(fx, fz), fz);
      const walkEye = base.clone().addScaledVector(F1, -10.5).addScaledVector(RIGHT1, 0.8); walkEye.y = gy(walkEye.x, walkEye.z) + 2.4;
      const drift = ss(T.walk[1] - 0.8, T.flare[0], t);
      const eye = walkEye.addScaledVector(F1, -1.4 * drift).addScaledVector(RIGHT1, -1.2 * drift); eye.y += 0.2 * drift;
      const push = Math.pow(ss(T.flare[0], T.flare[1] + 0.2, t), 1.4);
      const fov = lerp(FOV, FOV - 7, push);
      const lookMan = base.clone().addScaledVector(F1, 2.0).add(V(0, 0.2, 0)), lookG = aimG(eye, fov);
      const look = lookMan.lerp(lookG, ss(T.pierce - 2.4, T.pierce + 0.6, t));
      const fwd = look.clone().sub(eye).normalize(); eye.addScaledVector(fwd, 3.4 * push); look.addScaledVector(fwd, 3.4 * push);
      return { eye, look, fov };
    };
    CAM1 = blend(blend(A, Bf, T.n41 - 0.4, T.n41 + 0.6), Cf, T.walk[0] - 0.6, T.walk[0] + 0.9);
    // block 2: the same place; slow drift; at N47 pull back and rise
    const e0 = Cf(T.flare[0] - 0.01).eye, l0 = aimG(e0, FOV), back = F1.clone().negate();
    const D = track([
      [215.7, e0.clone().addScaledVector(F1, -0.4), l0.clone(), FOV],
      [221.0, e0.clone().addScaledVector(F1, 0.2).add(V(0, 0.1, 0)), l0.clone().add(V(0, 1, 0)), FOV],
      [226.4, e0.clone().addScaledVector(F1, 0.9).add(V(0, 0.25, 0)), aimG(e0.clone().addScaledVector(F1, 0.9), FOV).add(V(0, 1.5, 0)), FOV],
      [229.6, e0.clone().addScaledVector(back, 2.6).add(V(0, 2.4, 0)), V(P1.x, gy(P1.x, P1.z) + 0.6, P1.z).addScaledVector(F1, 16), FOV],
      [233.4, e0.clone().addScaledVector(back, 7).add(V(0, 15, 0)), V(P1.x, 0, P1.z).addScaledVector(F1, 34), FOV],
      [237.7, e0.clone().addScaledVector(back, 16).add(V(0, 42, 0)), V(P1.x, 0, P1.z).addScaledVector(F1, 110), FOV],
    ]);
    CAM2 = D;
  }

  // ---------------------------------------------------------------- one frame
  const K = {
    rule: { zen: C3('#3f6cb4'), hor: C3('#f3d49a'), glo: C3('#fff1c8'), haze: C3('#c4b69a'), hsun: C3('#ffe2a8'), hglow: C3('#2c1c08'),
      tl: C3('#fff4d8'), tm: C3('#f2d4a4'), ts: C3('#c6a294'), bl: C3('#f6d9a8'), bm: C3('#c9a184'), bs: C3('#86727a'), gmul: C3('#76707a'), gadd: C3('#06050a') },
    dead: { zen: C3('#7a7b80'), hor: C3('#9d9993'), glo: C3('#aaa69e'), haze: C3('#8f8c88'), hsun: C3('#9c9894'), hglow: C3('#000000'),
      tl: C3('#a6a4a0'), tm: C3('#858380'), ts: C3('#5e5c62'), bl: C3('#9c9a98'), bm: C3('#7a7876'), bs: C3('#555358'), gmul: C3('#ffffff'), gadd: C3('#000000') },
    pierce: C3('#ffe0a0'),
  };
  const setCol = (u, k, key) => { if (u.value.isColor) u.value.setRGB(...K.rule[key].clone().lerp(K.dead[key], k).toArray(), THREE.LinearSRGBColorSpace); else mixU(u, K.rule[key], K.dead[key], k); };
  function frame(t) {
    const block2 = t > 200;
    if (!CAM1) cameras();
    let dead, sunK, life, cover, rain = 0, dust = 0, glowK = 1, discK = 0, cloudPart = 0, graveLift = -1.4, gk = 0;
    const gaps = [], beams = [], pools = [];
    S.uFrontOn.value = 0; S.uFront.value.set(FC.x, FC.z, -1e4, -1e4);
    if (!block2) {
      Wd.useShade(SHADE_A); S.uFallMode.value = 1; S.uLean.value.set(sunH.x, sunH.z, 0.32);
      dead = ss(T.dark[0], T.dark[1], t);
      sunK = (1 - dead) * (1 - 0.22 * ss(T.n41 + 1, T.n41 + 3.5, t));   // after N41 the land dims a little: the shaft stays where it is
      life = 1 - ss(T.wither[0], T.wither[1], t);
      cover = lerp(lerp(0.8, 0.42, ss(116.5, 121, t)), 1.0, ss(T.dark[0] - 0.4, T.dark[1] + 0.6, t));   // a sea of cloud above; it opens as the eye comes through; it closes at N42
      discK = 1 - ss(114.5, 117.5, t);
      gaps.push([-46, -222, 70, 1 - ss(119.5, 123, t)]);   // the gap the eye comes down through
      beamsA.forEach((b, i) => { const k = ss(110.3, 113.5, t) * (1 - ss(T.dark[0] + i * 0.42, T.dark[0] + 1.3 + i * 0.42, t)); beams.push([b, BEAM_A, k]); const [gx, gz] = gapOf(b, BEAM_A); gaps.push([gx, gz, b.r * 2.6, Math.max(k, 0.25 * (1 - dead))]); });
      const mk = ss(118.5, 121.5, t) * (1 - ss(T.dark[0] + 0.5, T.dark[0] + 2.2, t)); beams.push([meadowBeam, BEAM_A, mk]);
      { const [gx, gz] = gapOf(meadowBeam, BEAM_A); gaps.push([gx, gz, 22, mk]); }
      dust = mk * (t > 119 ? 1 : 0) * (1 - ss(T.walk[0], T.walk[0] + 2, t));
      rain = ss(T.rain, T.rain + 1.5, t) * (1 - 0.55 * ss(T.pierce, T.flare[1], t));
      graveLift = lerp(-1.4, 0, ss(T.grave[0], T.grave[1], t));
      gk = ss(T.pierce, T.pierce + 1.4, t);
      gaps.push([G.x, G.z + 60, 150, gk]);   // the far cloud opens over the horizon
    } else {
      Wd.useShade(SHADE_B); S.uFallMode.value = 0; { const lb = V(SUN_B.x, 0, SUN_B.z).normalize(); S.uLean.value.set(lb.x, lb.z, 0.3); }
      const R = frontR(t);
      S.uFrontOn.value = ss(T.front0, T.front0 + 1.6, t); S.uFront.value.set(FC.x, FC.z, R, R - 34);   // the front fades in: no pop when it starts
      dead = 1 - 0.85 * ss(T.front0, T.front0 + 9, t); sunK = 0; life = 0; cloudPart = 1;
      cover = 1.0 - 0.3 * ss(T.front0, T.front0 + 12, t);
      gk = 0.6 * (1 - ss(T.front0, T.front0 + 4, t));
      gaps.push([G.x, G.z + 60, 150 + 30 * ss(T.front0, T.front0 + 6, t), 0.7 + 0.3 * ss(T.front0 - 0.5, T.front0 + 2, t)]);
      beamsB.forEach((b) => { const d = Math.hypot(b.x - FC.x, b.z - FC.z), k = 1 - ss(R - 110, R - 15, d); beams.push([b, BEAM_B, k * (b.r < 6 ? 0.9 : 0.35)]); });
      rain = 0.6 * (1 - ss(T.q44 - 0.2, T.q44 + 2.4, t));
      graveLift = lerp(0, -1.0, ss(0.15, 0.95, frontAt(GRAVE.x, GRAVE.z, R - 34)));
      dust = frontAt(P1.x, P1.z, R) * 0.7;
    }
    // the far gap (block 1 end, block 2 start): the sky glows there and one shaft comes down
    if (gk > 0.01) beams.push([{ x: G.x + 20, z: G.z + 80, r: 34, pool: 0 }, V(0.04, 1, 0.12).normalize(), gk * 1.6]);
    // the light's colours: rule ↔ fallen
    S.uLife.value = life; S.uSunK.value = sunK;
    for (const [u, key] of [[U.uSkyZen, 'zen'], [U.uSkyHor, 'hor'], [U.uSkyGlo, 'glo'], [U.uClTopL, 'tl'], [U.uClTopM, 'tm'], [U.uClTopS, 'ts'], [U.uClBotL, 'bl'], [U.uClBotM, 'bm'], [U.uClBotS, 'bs']]) setCol(u, dead, key);
    for (const [u, key] of [[S.uHaze, 'haze'], [S.uHazeSun, 'hsun'], [S.uHazeGlow, 'hglow']]) setCol(u, dead, key);
    { const litMan = block2 ? frontAt(P1.x, P1.z, frontR(t)) : sunK; for (const [u, key] of [[S.uGlazeMul, 'gmul'], [S.uGlazeAdd, 'gadd']]) setCol(u, 1 - litMan, key); }
    S.uHazeDensity.value = lerp(block2 ? 0.0022 : 0.0028, 0.0055, dead);
    if (gk > 0.01) { U.uGlowDir.value.copy(G).sub(Wd.camera.position).normalize(); U.uSkyGlo.value.lerp(K.pierce, gk); glowK = 0.3 + 1.2 * gk; }
    else { U.uGlowDir.value.copy(block2 ? SUN_B : SUN_A); glowK = block2 ? 0.4 + 0.8 * (1 - dead) : 1 - 0.85 * dead; }
    U.uGlowK.value = glowK; U.uDiscK.value = discK; U.uCover.value = cover; U.uCloudPart.value = cloudPart; U.uRain.value = rain; U.uDust.value = dust; U.uGraveLift.value = graveLift;
    for (let i = 0; i < 8; i++) { const g = gaps[i]; U.uGaps.value[i].set(...(g || [0, 0, 1, 0])); }
    let pi = 0;
    for (let i = 0; i < 8; i++) {
      const bb = beams[i];
      if (!bb || bb[2] < 0.002) { FR.uBeam.value[i].set(0, 0, 1, 0); continue; }
      const [b, dir, k] = bb; FR.uBeam.value[i].set(b.x, b.z, b.r, k * (b.glow || b.gain || 1)); FR.uBeamDir.value[i].copy(dir);
      if (b.pool && pi < 8) S.uPool.value[pi++].set(b.x, b.z, b.pool, k * 0.85 * (b.gain || 1));
    }
    for (; pi < 8; pi++) S.uPool.value[pi].set(0, 0, 1, 0);
    FR.uBeamY.value.set(0.4, CLOUD_Y, 0, 0);
    FR.uExposure.value = lerp(0.58, 0.78, dead) * (block2 ? 1 : lerp(1, 0.92, ss(T.n41 + 1, T.n41 + 3.5, t) * (1 - dead)));
    FR.uShafts.value = (block2 ? 0.12 : 0.25) * Math.max(sunK, block2 ? 1 - dead : 0) * (1 - ss(14, 50, Wd.camera.position.y - gy(Wd.camera.position.x, Wd.camera.position.z)));   // the sun-in-the-mist veil only near the ground
    // the eye and the man
    const st = manAt(t), cam = (block2 ? CAM2 : CAM1)(t);
    cam.eye.y = Math.max(cam.eye.y, gy(cam.eye.x, cam.eye.z) + 0.4);
    S.uEyeH.value = Math.max(0, cam.eye.y - gy(cam.eye.x, cam.eye.z));
    Wd.paintWith(t, st, cam);
  }

  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    frame(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(Wd.canvas, 0, 0, W, H);
    if (t < 200) {   // the push into the far shaft → white (heal-village S1 comes out of white)
      const fk = ss(T.flare[0], T.flare[1], t);
      if (fk > 0) {
        const p = G.clone().project(Wd.camera), x = (p.x + 1) / 2 * W, y = (1 - p.y) / 2 * H, r = lerp(0.2, 1.6, fk) * H;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,246,226,${Math.min(1, fk * 1.4)})`); g.addColorStop(0.5, `rgba(255,236,200,${fk * 0.6})`); g.addColorStop(1, 'rgba(255,236,200,0)');
        ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        const wk = ss(T.flare[0] + 0.45, T.flare[1], t); ctx.fillStyle = `rgba(255,244,222,${wk})`; ctx.fillRect(0, 0, W, H);
      }
    } else { const wk = 1 - ss(T.q44 - 0.2, T.q44 + 0.6, t); if (wk > 0) { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(0,0,0,${wk})`; ctx.fillRect(0, 0, W, H); } }
    ctx.restore();
  }
  return { world: Wd, draw, beats: () => T, manAt: (t) => manAt(t), frame };
}
