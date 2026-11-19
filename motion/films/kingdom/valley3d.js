// valley3d.js — 「kingdom」 2부 시안 A (2026-11-19, 수묵 동산 대신): "햇빛 = 왕의 다스림", a 3D valley in ONE take per block,
// in the same engine and light as heal-village.js (lib3d/cine.js: height fog, sun in-scatter, cloud slab, bloom, DOF, grain).
// After STYLE-INDEX C38 (storybook 3D aerial: sculpted green ridges, cotton cumulus, gusts in the grass) — but cinematic: low
// golden light, haze, small figures; the light is the protagonist.
//   Block 1 (110 → 142.3, one camera move): above a sea of gold cloud, looking up into the light (no figure in it) → the camera
//     tilts down and sinks through a gap → a lush valley, every field and tree lit gold and leaning toward the light, shafts of
//     light from above (Ps 103:19 "보좌를 하늘에") → a small man stands in a pool of light in the meadow (N41) → he turns his back
//     on it and walks out → (N42) the clouds close, the shafts die, the land drains to grey, leaves fall from the tree he stands
//     under, a grave mound by him, rain → the camera keeps drifting and turns down the valley: far off on the horizon one shaft
//     of sun pierces the cloud — the camera pushes into it to white = the sun at the end of the road in heal-village S1.
//   Block 2 (215.7 → 237.6, one camera move): the same grey valley from the same place → (Q44) the cloud parts and the light
//     sweeps across the land; green and gold come back where it touches (a front with a warm edge), the dead tree leafs again,
//     the grave sinks back into the grass → (N47) the man turns back toward the light → the camera cranes up and back.
// Rules kept: no figure in the light (no throne picture, no face), no words, no rings; the man is small and plain.
// API: const VL = await (await import('./valley3d.js')).build(W, H);  VL.draw(ctx, t, B)  t = FILM seconds, B = line times.
import { Film, THREE, V, col, rng } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const D2R = Math.PI / 180;

// ---------------------------------------------------------------- the land (JS and GLSL share these formulas)
const riverX = z => 18 * Math.sin(z * .006) + 9 * Math.sin(z * .017 + 1.3);
const hash2 = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
const vn2 = (x, z) => { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  return lerp(lerp(hash2(xi, zi), hash2(xi + 1, zi), u), lerp(hash2(xi, zi + 1), hash2(xi + 1, zi + 1), u), v); };
const fbm2 = (x, z) => { let s = 0, a = .5, n = 0; for (let i = 0; i < 4; i++) { s += a * vn2(x, z); n += a; x = x * 2.03 + 11.7; z = z * 2.03 + 5.3; a *= .5; } return s / n; };
function height(x, z) {
  const d = x - riverX(z), ad = Math.abs(d);
  let h = 1.4 * fbm2(x * .02, z * .02);                                                  // the meadow's swell
  h += 78 * (1 - Math.exp(-((d / 170) ** 2))) * (.6 + .8 * fbm2(x * .003 + 7, z * .003));  // the valley walls
  h += 32 * fbm2(x * .008, z * .008) * ss(50, 230, ad);                                  // ridges on the slopes
  h -= 2.6 * Math.exp(-((d / 6.5) ** 2));                                                // the river's bed
  h += ss(-650, -1350, z) * ss(70, 320, ad) * 150 * (.45 + fbm2(x * .004, z * .004));    // far ranges, the valley open between them
  return h;
}

export function beats(B) {
  const T = {};
  T.n40 = B.N40; T.q40 = B.Q40; T.n41 = B.N41; T.n42 = B.N42; T.n43 = B.N43; T.q44 = B.Q44; T.n47 = B.N47; T.end2 = B.C2;
  T.turn = [T.n41 + 1.2, T.n41 + 2.4];          // he turns his back on the light
  T.walk = T.n41 + 2.4;                         // and walks out of it (to the tree)
  T.walkEnd = T.n42 + 1.8;
  T.bow = [T.n42 + 1.8, T.n42 + 3.2];
  T.dark = [T.n42 - .6, T.n42 + 3.0];           // the cloud closes, the sun goes
  T.wither = [T.n42 + .4, T.n42 + 5.2];         // the land drains, the leaves fall
  T.rain = T.n42 + 1.6;
  T.grave = [T.n42 + 2.0, T.n42 + 3.8];
  T.pierce = T.n43 - 2.3;                       // one shaft of sun on the horizon
  T.flare = [T.n43 - 1.25, T.n43];              // into it, to white (heal-village S1 comes out of white)
  T.part = [T.q44 + .4, T.q44 + 8];             // block 2: the cloud parts
  T.front0 = T.q44 + .9;                        // the light's front starts out from under the first shaft
  T.turnBack = [T.n47 + .3, T.n47 + 1.7];
  return T;
}

export async function build(W, H) {
  const vert = H > W, FOV = vert ? 46 : 32;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .3, far: 6000,
    atmos: { density: .0007, falloff: .006, base: 0, start: 0, color: col('#c8c0ac', .42), colorUp: col('#98b4dc', .5), max: 2600, scatter: 1, anisotropy: .78, phaseMix: .85 },
    cloud: { bottom: 110, top: 215, density: .055, scale: .0021, cover: .5, steps: 40, wind: V(.004, 0, .0015), litTop: col('#fff1d2', 2.1), litBottom: col('#e0b17a', .9), shadow: col('#5a5048', .12) },
    bloom: { strength: .07, radius: 1.1, tint: col('#ffe2b8') },
    dof: { focus: 40, aperture: 0, maxCoc: 18 },
    look: { exposure: 1.0, contrast: 1.05, saturation: 1.08, lift: col('#0b0907'), shadowTint: col('#d6d6e8'), highTint: col('#fff0d6'), vignette: .3, grain: .035, ca: .3 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera, R = rng(777);
  let T = null;

  // ---------------------------------------------------------------- light: the light above (THR, high, ahead-left) and the far sun (G)
  const THR = V(-.3, .5, -.81).normalize();   // 30° up, ahead-left
  const THRh = V(THR.x, 0, THR.z).normalize();
  const G = V(riverX(-1400) - 40, 104, -1400);   // the gap in the cloud at the valley's end where the sun breaks through
  const sky = K.sky(film, { top: col('#1b4a9a', .62), mid: col('#7e9ec6', .62), horizon: col('#f2d29a', .95), sunDir: THR, sunColor: col('#fff6e0', 40), sunGlow: col('#ffd59a', 2.2), clouds: .25, cloudColor: col('#fff0d4', 1.3), cloudShade: col('#c9a07a', .8) });
  const SKY = { rule: { top: col('#1b4a9a', .62), mid: col('#7e9ec6', .62), horizon: col('#f2d29a', .95) }, dead: { top: col('#40464f', .45), mid: col('#6d727a', .55), horizon: col('#8c9096', .62) } };
  const hemi = new THREE.HemisphereLight(col('#c4d2e6'), col('#6a5a40'), .8); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffe0aa'), 3.2);
  // P1: the tree he walks to (on one line with the low camera and the far gap G); P0: the shaft of light 6 m to its left —
  // he stands in it, turns, and walks across the frame out of it
  const P1 = V(15.7, 0, -324.7); P1.y = height(P1.x, P1.z);
  const P0 = P1.clone().add(V(-6.2, 0, -1.5)); P0.y = height(P0.x, P0.z);
  sunL.position.copy(P0).addScaledVector(THR, 200); sunL.target.position.copy(P0);
  sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); Object.assign(sunL.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 500 }); sunL.shadow.bias = -.0005; sunL.shadow.normalBias = .05;
  S.add(sunL, sunL.target);
  const gLamp = film.lamp(G, '#ffd9a0', { power: 0, size: 30, fog: 1 });

  // ---------------------------------------------------------------- the shared world grading: light (sun) and life (colour)
  // uSunG: the sun on the whole land (1 rule → 0 fallen); uLifeG: green on the whole land; the front (block 2): a circle from uFC
  // growing with uFR (light) / uFR2 (life, a little behind), with a warm edge; pools: the shafts' footprints (x, z, r, k).
  const WU = { uLifeG: { value: 1 }, uSunG: { value: 1 }, uFR: { value: 0 }, uFR2: { value: 0 }, uFrontOn: { value: 0 }, uFC: { value: new THREE.Vector2() },
    uPool: { value: Array.from({ length: 8 }, () => new THREE.Vector4()) }, uPoolK: { value: 1 }, uTime: { value: 0 }, uLightH: { value: new THREE.Vector2(THRh.x, THRh.z) } };
  const GL_COMMON = `
    uniform float uLifeG, uSunG, uFR, uFR2, uFrontOn, uPoolK, uTime; uniform vec2 uFC, uLightH; uniform vec4 uPool[8];
    float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }
    float riverX(float z){ return 18. * sin(z * .006) + 9. * sin(z * .017 + 1.3); }
    float frontD(vec2 p){ return length(p - uFC) + 30. * sin(p.x * .021) * sin(p.y * .017) + 18. * (vn(p * .02) - .5); }
    float frontM(vec2 p, float R){ return uFrontOn * (1. - smoothstep(R - 45., R + 45., frontD(p))); }
    float lifeAt(vec2 p){ return max(uLifeG, frontM(p, uFR2)); }
    float lightAt(vec2 p){ return max(uSunG, frontM(p, uFR)); }
    float poolAt(vec2 p){ float s = 0.; for (int i = 0; i < 8; i++){ vec4 q = uPool[i]; vec2 d = p - q.xy; s += q.w * exp(-dot(d, d) / (q.z * q.z)); } return s; }`;
  // JS twins (trees and leaves are updated on the CPU)
  const FR = { on: 0, c: new THREE.Vector2(), r: 0, r2: 0 }, G_ = { life: 1, sun: 1 };
  const frontM = (x, z, r) => { if (!FR.on) return 0; const d = Math.hypot(x - FR.c.x, z - FR.c.y) + 30 * Math.sin(x * .021) * Math.sin(z * .017); return 1 - ss(r - 45, r + 45, d); };
  const lifeAt = (x, z) => Math.max(G_.life, frontM(x, z, FR.r2));

  const GRADE = `
    { float Lf = lifeAt(vWP.xz), Sn = lightAt(vWP.xz);
      vec3 c = outgoingLight; float lum = dot(c, vec3(.3, .59, .11));
      c = mix(vec3(lum) * vec3(.9, .94, 1.02), c, mix(.22, 1., Lf));
      c *= mix(.46, 1., Sn);
      c += diffuseColor.rgb * vec3(1., .8, .46) * poolAt(vWP.xz) * uPoolK * (.35 + .65 * Sn);
      float ed = uFrontOn * exp(-pow((frontD(vWP.xz) - uFR) / 34., 2.));
      c += diffuseColor.rgb * vec3(1., .78, .45) * ed * 1.1;
      outgoingLight = c; }
    #include <opaque_fragment>`;
  // patch a standard material: world position varying, the grading at the end, plus optional vertex/fragment hooks
  function worldPatch(m, key, o = {}) {
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, WU, o.uniforms || {});
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN; varying float vLife;\n' + GL_COMMON + (o.vpre || ''))
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + (o.vbegin || ''))
        .replace('#include <project_vertex>', `#include <project_vertex>
          #ifdef USE_INSTANCING
            vWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);
          #else
            vWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);
          #endif`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN; varying float vLife;\n' + GL_COMMON)
        .replace('#include <map_fragment>', '#include <map_fragment>\n' + (o.frag || ''))
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + (o.emis || ''))
        .replace('#include <opaque_fragment>', GRADE);
    };
    m.customProgramCacheKey = () => 'vl-' + key; return m;
  }
  const wstd = (color, key, o = {}, mo = {}) => worldPatch(new THREE.MeshStandardMaterial({ color, roughness: .9, ...mo }), key, o);

  // ---------------------------------------------------------------- the terrain: fixed world grid (README §7), fields on the floor
  {
    const X0 = -760, X1 = 760, Z0 = -1650, Z1 = 520, NX = 300, NZ = 430;
    const g = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, NX, NZ); g.rotateX(-Math.PI / 2); g.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
    const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
    g.computeVertexNormals();
    const m = wstd('#ffffff', 'terrain', { frag: `
      { vec2 q = vWP.xz; vec3 N = normalize(vWN); float slope = 1. - N.y, d = vWP.x - riverX(q.y), ad = abs(d);
        float n = fb(q * .018), f = fb(q * .35), big = fb(q * .004 + 3.);
        vec3 c = mix(vec3(.16, .36, .07), vec3(.33, .52, .12), n); c = mix(c, vec3(.5, .56, .17), smoothstep(.55, .8, big) * .7);
        // fields and orchards on the valley floor (rotated grid, hedges between)
        float onFloor = (1. - smoothstep(130., 210., ad)) * smoothstep(20., 34., ad) * (1. - smoothstep(.06, .16, slope));
        vec2 fq = vec2(q.x * .92 + q.y * .3, q.y - q.x * .22) / vec2(52., 30.); vec2 id = floor(fq), fr = fract(fq); float hs = hh(id);
        vec3 fc = hs < .28 ? vec3(.66, .54, .14) : hs < .52 ? vec3(.24, .46, .08) : hs < .76 ? vec3(.42, .56, .14) : vec3(.74, .62, .24);
        fc *= mix(.88, 1.08, fb(vec2(fq.x * 9., fq.y * 1.5) + hs * 9.));
        float inner = smoothstep(0., .035, fr.x) * smoothstep(1., .965, fr.x) * smoothstep(0., .06, fr.y) * smoothstep(1., .94, fr.y);
        c = mix(c, mix(vec3(.1, .2, .05), fc, inner), onFloor * step(.2, hh(id + 7.)));
        // the river's banks: lush dark green; rock on the steep; far ranges blue-grey with height
        c = mix(c, vec3(.12, .3, .07), exp(-pow(ad / 14., 2.)) * .8);
        c = mix(c, vec3(.4, .37, .31) * mix(.8, 1.12, f), smoothstep(.32, .58, slope));
        c = mix(c, vec3(.42, .45, .4), smoothstep(120., 260., vWP.y) * .6);
        // the fallen land: dust, straw and grey stone
        vec3 dead = mix(vec3(.36, .33, .28), vec3(.46, .41, .33), n) * mix(.85, 1.08, f);
        dead = mix(dead, vec3(.34, .32, .3) * mix(.8, 1.1, f), smoothstep(.32, .58, slope));
        float L = lifeAt(q); diffuseColor.rgb = mix(dead, c, L); }` });
    const ground = new THREE.Mesh(g, m); ground.receiveShadow = true; S.add(ground);
  }
  // ---------------------------------------------------------------- the river: a ribbon down the valley; it shines with the sky
  {
    const zs = []; for (let z = 500; z >= -1600; z -= 6) zs.push(z);
    const pts = [], idx = [];
    zs.forEach((z, i) => { const x = riverX(z), w = 6.5 + 2.5 * Math.sin(z * .013), y = height(x, z) + 1.55;
      pts.push(x - w / 2, y, z, x + w / 2, y, z); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = wstd('#0e3346', 'river', { emis: `
      { vec3 Vd = normalize(cameraPosition - vWP); float fr = pow(1. - max(Vd.y, 0.), 4.);
        float rip = fb(vec2(vWP.x * .6, vWP.z * .15 - uTime * .4)), sp = smoothstep(.72, .8, fb(vWP.xz * 1.3 + vec2(0., uTime * .6)));
        float Sn = lightAt(vWP.xz); vec3 skyc = mix(vec3(.16, .19, .22), mix(vec3(.08, .22, .34), vec3(1.4, 1.15, .75), fr), Sn);
        totalEmissiveRadiance += skyc * (.45 + .55 * fr) * mix(.7, 1.15, rip) + vec3(2.2, 1.8, 1.1) * sp * Sn; }` }, { roughness: .7 });
    const river = new THREE.Mesh(g, m); river.receiveShadow = true; S.add(river);
  }

  // ---------------------------------------------------------------- trees: far groves (instanced) + near trees with leaves that fall
  const canopyM = wstd('#ffffff', 'canopy', {}, { roughness: .85 }), trunkM = wstd('#4a3a2a', 'trunk', {}, { roughness: .95 });
  const far = [];
  {
    for (let i = 0; i < 2600 && far.length < 1500; i++) {
      const z = 380 - R() * 1650, side = R() < .5 ? -1 : 1, ad = 12 + Math.pow(R(), 1.6) * 300, x = riverX(z) + side * ad;
      const rip = ad < 24, grove = fbm2(x * .012, z * .012) > .5;
      if (!(rip || grove)) continue;
      if (Math.hypot(x - P0.x, z - P0.z) < 62 || Math.hypot(x - 17.6, z + 300) < 45) continue;   // the meadow and the low camera stay open
      if (x > 6 && x < 40 && z > -315 && z < -200) continue;       // the camera's corridor down to the meadow
      const y = height(x, z); if (y > 120) continue;
      const h = 7 + R() * 7; far.push({ x, y, z, h, w: .75 + R() * .5, c: new THREE.Color().setHSL(.2 + R() * .08, .55 + R() * .2, .2 + R() * .12), dead: new THREE.Color().setHSL(.07, .1, .16 + R() * .05), ph: R() * 6.28, th: .25 + R() * .5 });
    }
    // canopy: four lumps merged (one geometry for all), centre at the origin
    const parts = []; const r2 = rng(5); for (let k = 0; k < 5; k++) { const s = .55 + r2() * .45, ge = new THREE.IcosahedronGeometry(1, 1); ge.scale(s, s * .85, s); ge.translate((r2() - .5) * .9, (r2() - .4) * .6, (r2() - .5) * .9); parts.push(ge.toNonIndexed()); }
    const merged = mergeG(parts);
    const cI = new THREE.InstancedMesh(merged, canopyM, far.length), tI = new THREE.InstancedMesh(new THREE.CylinderGeometry(.16, .26, 1, 6).translate(0, .5, 0), trunkM, far.length);
    cI.castShadow = tI.castShadow = true; cI.receiveShadow = true; S.add(cI, tI);
    far.cI = cI; far.tI = tI;
    for (let i = 0; i < far.length; i++) cI.setColorAt(i, far[i].c);
  }
  function mergeG(list) { let n = 0; for (const g of list) n += g.attributes.position.count; const p = new Float32Array(n * 3), nr = new Float32Array(n * 3); let o = 0;
    for (const g of list) { p.set(g.attributes.position.array, o * 3); nr.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nr, 3)); return g; }
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), cTmp = new THREE.Color(), axis = V(-THRh.z, 0, THRh.x);   // leaning toward the light = rotating about this axis
  function updateFar(t) {
    const { cI, tI } = far;
    for (let i = 0; i < far.length; i++) { const f = far[i], L = lifeAt(f.x, f.z), sway = .025 * Math.sin(t * .9 + f.ph);
      const lean = (.1 * L + sway * L) - (1 - L) * .05;
      q4.setFromAxisAngle(axis, lean);
      m4.compose(V(f.x, f.y - .3, f.z), q4, V(f.w, f.h * .55, f.w)); tI.setMatrixAt(i, m4);
      const top = V(0, f.h * .55, 0).applyQuaternion(q4).add(V(f.x, f.y - .3, f.z)), cs = f.h * .34 * lerp(.36, 1, L);
      m4.compose(top.add(V(0, cs * .35, 0)), q4, V(cs * f.w * 1.1, cs, cs * f.w * 1.1)); cI.setMatrixAt(i, m4);
      cTmp.copy(f.dead).lerp(f.c, L); cI.setColorAt(i, cTmp); }
    cI.instanceMatrix.needsUpdate = tI.instanceMatrix.needsUpdate = true; cI.instanceColor.needsUpdate = true;
  }

  // near trees round the meadow: a real branching skeleton (kit tree) with leaf clumps that fall when the land dies
  const DT = P1.clone().add(V(1.5, 0, -.9)); DT.y = height(DT.x, DT.z);   // the tree he walks to
  const leafM = wstd('#ffffff', 'leaf', {}, { roughness: .85 });
  const near = [];
  function nearTree(x, z, h, seed, nLeaf = 800) {
    const y = height(x, z), grp = new THREE.Group(); grp.position.set(x, y - .1, z); S.add(grp);
    const sk = K.tree({ seed, height: h, trunk: h * .035, depth: 4, spread: .75, up: .25, twig: 2, twigR: .02, minR: .025, mat: trunkM, layer: 0 }); grp.add(sk);
    const r = rng(seed * 3 + 1), inst = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(h * .028, 1), leafM, nLeaf); inst.castShadow = true; inst.receiveShadow = true; grp.add(inst);
    const L = []; for (let i = 0; i < nLeaf; i++) { const a = r() * 6.283, u = Math.cbrt(r()), cy = r() * 2 - 1, rr = u * Math.sqrt(1 - cy * cy) * h * .4, yy = h * (.7 + cy * u * .24);
      L.push({ p: V(Math.cos(a) * rr, yy, Math.sin(a) * rr), s: .6 + r() * .9, th: .15 + r() * .75, ph: r() * 6.28, c: new THREE.Color().setHSL(.22 + r() * .08, .5 + r() * .15, .13 + r() * .1), rot: new THREE.Euler(r() * 3, r() * 3, 0), drift: V(r() - .5, 0, r() - .5) }); }
    const o = { grp, inst, L, h }; near.push(o); return o;
  }
  const deadTree = nearTree(DT.x, DT.z, 6.8, 31, 1300);
  for (const [dx, dz, h, sd] of [[-26, -18, 8, 3], [-34, 6, 9, 5], [18, -30, 8.5, 7], [-14, -40, 7.5, 9], [30, -12, 9, 11], [-44, -26, 10, 13], [8, -52, 9, 15], [-30, 30, 8, 17], [40, 14, 8.5, 19], [-52, 4, 9.5, 21], [26, -48, 10, 23]]) nearTree(P0.x + dx, P0.z + dz, h, sd);
  function updateNear(t, block2) {
    for (const o of near) { const L = lifeAt(o.grp.position.x, o.grp.position.z);
      o.grp.quaternion.setFromAxisAngle(axis, .07 * L + .012 * Math.sin(t * .8 + o.h) * L);
      o.L.forEach((l, i) => {
        const k = clamp((l.th - L) / .22);                               // 0 on the tree … 1 gone
        let p = l.p, s = l.s * (1 - k);
        if (!block2 && k > 0) { const fall = clamp(k / .7); p = l.p.clone().addScaledVector(l.drift, fall * 2); p.y = lerp(l.p.y, .1, fall * fall); s = l.s * .55 * (1 - fall); }
        e4.copy(l.rot); e4.z += .1 * Math.sin(t * 1.1 + l.ph); q4.setFromEuler(e4);
        m4.compose(p, q4, V(s, s * .8, s)); o.inst.setMatrixAt(i, m4);
        if (block2) cTmp.copy(l.c); else cTmp.setHSL(.09, .45, .3).lerp(l.c, clamp(1 - k * 2.5)); o.inst.setColorAt(i, cTmp); });
      o.inst.instanceMatrix.needsUpdate = true; o.inst.instanceColor.needsUpdate = true; }
  }

  // ---------------------------------------------------------------- grass in the meadow: blades lean to the light, flatten and straw when dead
  {
    const n = 34000, ge = new THREE.PlaneGeometry(.032, .6, 1, 3); ge.translate(0, .3, 0);
    { const p = ge.attributes.position; for (let i = 0; i < p.count; i++) { const v = p.getY(i) / .6; p.setX(i, p.getX(i) * (1 - v * .85)); } ge.computeVertexNormals(); }
    const m = wstd('#ffffff', 'grass', {
      vbegin: `{ vec3 ip = (modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.)).xyz; float L = lifeAt(ip.xz); vLife = L;
          float v = position.y / .6, w = sin(uTime * 1.3 + ip.x * .35 + ip.z * .22) * .06 + sin(uTime * 2.1 + ip.x * 1.1) * .025;
          transformed.y *= mix(.45, 1., L);
          vec3 lh = vec3(uLightH.x, 0., uLightH.y) * mat3(instanceMatrix);   // the light's direction in the blade's own frame
          transformed += (lh * (.22 * L) + vec3(w, 0., w * .6) - vec3(0., 0., .18 * (1. - L))) * v * v; }`,
      frag: `diffuseColor.rgb = mix(vec3(.42, .37, .27) * diffuseColor.rgb / max(.001, dot(diffuseColor.rgb, vec3(.33))) * .33, diffuseColor.rgb, vLife);`,
    }, { side: THREE.DoubleSide, roughness: .8 });
    const inst = new THREE.InstancedMesh(ge, m, n), r = rng(41), c = new THREE.Color(); let k = 0;
    while (k < n) { const a = r() * 6.283, rr = Math.sqrt(r()) * 30, x = (P0.x + P1.x) / 2 + Math.cos(a) * rr * 1.3, z = (P0.z + P1.z) / 2 - 4 + Math.sin(a) * rr;
      if (Math.abs(x - riverX(z)) < 7 || Math.hypot(x - 17.6, z + 300.5) < 6) continue;
      const s = .7 + r() * .8; m4.compose(V(x, height(x, z) - .05, z), q4.setFromEuler(e4.set(0, r() * 6.28, 0)), V(s, s * (.7 + r() * .7), s)); inst.setMatrixAt(k, m4);
      c.setHSL(.2 + r() * .08, .55 + r() * .2, .22 + r() * .14); if (r() < .025) c.setHSL(r() < .5 ? .13 : .0, .7, .55); inst.setColorAt(k, c); k++; }
    inst.receiveShadow = true; S.add(inst);
  }

  // ---------------------------------------------------------------- the grave by the tree (rises in the fall, sinks back in block 2)
  const grave = new THREE.Group(); {
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), wstd('#8a7458', 'earth')); earth.scale.set(.62, .34, 1.1); grave.add(earth);
    const stone = new THREE.Mesh(K.roundedBox(.42, 1.0, .13, .05, 2), wstd('#a8a49a', 'stone')); stone.position.set(0, .42, -1.2); stone.rotation.set(-.08, .12, .05); grave.add(stone);
    const st2 = new THREE.Mesh(new THREE.DodecahedronGeometry(.16, 0), wstd('#6c6860', 'stone')); st2.position.set(.45, .06, .5); grave.add(st2);
    grave.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    const GP = P1.clone().add(V(-1.9, 0, .6)); grave.position.copy(GP); grave.position.y = height(GP.x, GP.z); grave.rotation.y = Math.atan2(THRh.x, THRh.z) + Math.PI / 2 + .15; S.add(grave); grave.userData.y0 = grave.position.y;
  }

  // ---------------------------------------------------------------- the man (people3d.js): plain undyed robe, small
  const robe = wstd('#d8cdb2', 'robe', {}, { side: THREE.DoubleSide, roughness: .95 }), cloth = wstd('#b8a888', 'cloth', {}, { side: THREE.DoubleSide, roughness: .95 }), skin = wstd('#8a5e3e', 'skin', {}, { roughness: .8 });
  const man = P.man({ h: 1.74, mat: robe, skin, cloth }); man.position.copy(P0); S.add(man);
  const face = (dx, dz) => Math.atan2(-dx, -dz);
  const yawToL = face(THRh.x, THRh.z), yawAway = face(-THRh.x, -THRh.z);
  function manAt(t) {
    const U = man.userData;
    if (t < 200) {   // block 1
      if (t < T.walk) { man.position.copy(P0); const k = ss(T.turn[0], T.turn[1], t); man.rotation.y = yawToL + k * Math.PI * .999;
        const id = P.idle(t, .3, { s: U.s }); P.pose(man, { ...id, head: [lerp(.28, -.05, k), 0], hands: k < .5 ? [V(-.26, 1.0 + .05 * Math.sin(t * .7), -.22), V(.26, 1.0 + .05 * Math.sin(t * .7 + 1), -.22)] : null }); return; }
      const dir = V(P1.x - P0.x, 0, P1.z - P0.z), len = dir.length(); dir.normalize();
      const w = P.walk(man, t, T.walk, { T: 1.0, L: .55 });
      if (w.dist < len) { man.position.copy(P0).addScaledVector(dir, w.dist); man.position.y = height(man.position.x, man.position.z); man.rotation.y = face(dir.x, dir.z); P.pose(man, { ...w, breath: .5, head: [-.12, 0] }); return; }
      man.position.copy(P1); man.rotation.y = face(dir.x, dir.z); const tA = T.walk + len / 1.1, b0 = Math.max(T.bow[0], tA + .3), b = ss(b0, b0 + 1.4, t);   // he stops, then bows
      P.pose(man, { ...P.idle(t, .6, { s: U.s }), lean: -.22 * b, head: [lerp(-.12, -.62, b), 0], hands: b > .2 ? [V(-.14, lerp(.85, 1.35, b), -.3), V(.14, lerp(.85, 1.35, b), -.3)] : null });   // hands to his face
      return;
    }
    // block 2: under the tree, bowed, back to the light → the light reaches him → (N47) he turns back toward it, lifts his head
    man.position.copy(P1); const k = ss(T.turnBack[0], T.turnBack[1], t), lit = frontM(P1.x, P1.z, FR.r);
    man.rotation.y = yawAway + k * (yawToL - yawAway + (yawToL - yawAway < -Math.PI ? 2 * Math.PI : 0));
    P.pose(man, { ...P.idle(t, .6, { s: U.s }), lean: lerp(-.22, .03, Math.max(lit * .4, k)), head: [lerp(-.62, -.3, lit) * (1 - k) + .3 * k, 0],
      hands: k < .6 ? [V(-.14, lerp(1.35, .95, lit), -.3), V(.14, lerp(1.35, .95, lit), -.3)] : [V(-.3, lerp(.95, 1.2, k), -.25), V(.3, lerp(.95, 1.2, k), -.25)] });
  }

  // ---------------------------------------------------------------- shafts of light from the cloud base down to the land
  const BEAMS = [];
  const beamM = (k0) => new THREE.ShaderMaterial({ uniforms: { uK: { value: 0 }, uCol: { value: col('#ffe1a8', 1.7) }, uT: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec3 vN, vV; varying vec2 vUv; void main(){ vec4 wp = modelMatrix * vec4(position, 1.); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); vUv = uv; gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform float uK, uT; uniform vec3 uCol; varying vec3 vN, vV; varying vec2 vUv;
      float h1(float x){ return fract(sin(x * 91.3) * 43758.5); }
      void main(){ float f = abs(dot(normalize(vN), vV)); float a = pow(f, 1.6) * smoothstep(0., .18, vUv.y) * (.45 + .55 * vUv.y) * smoothstep(1., .9, vUv.y);
        float st = .75 + .25 * sin(vUv.x * 40. + uT * .3) * sin(vUv.x * 17. - uT * .2);
        gl_FragColor = vec4(uCol * a * uK * st, 1.); }` });
  function beam(base, r, dir, topY, o = {}) {
    const len = (topY - base.y) / dir.y, g = new THREE.CylinderGeometry(r * (o.spread || 1.5), r, len, 32, 1, true); g.translate(0, len / 2, 0);
    const m = new THREE.Mesh(g, beamM()); m.position.copy(base); m.quaternion.setFromUnitVectors(V(0, 1, 0), dir); m.frustumCulled = false; S.add(m);
    const b = { m, base, r, k: 0, ...o }; BEAMS.push(b); return b;
  }
  const meadowBeam = beam(P0.clone().add(V(0, -1, 0)), 4.5, THR, 112, { pool: 1, poolR: 7, spread: 1.5, gain: 1.8 });
  const ruleBeams = [[-120, -520, 22], [60, -700, 26], [-40, -900, 30], [130, -430, 18], [10, -1100, 34]].map(([dx, z, r]) => { const x = riverX(z) + dx; return beam(V(x, height(x, z) - 2, z), r, THR, 112, { pool: 1, poolR: r * 1.2 }); });
  const farBeam = beam(V(G.x - 30, height(G.x - 30, G.z + 60) - 2, G.z + 60), 26, V(.02, 1, .06).normalize(), 104, { pool: 1, poolR: 40, spread: 1.25 });
  const treeBeam = beam(P1.clone().add(V(0, -1, 0)), 4.5, THR, 112, { pool: 1, poolR: 8, spread: 1.4, gain: 1.5 });
  for (const b of BEAMS) b.m.visible = false;

  // ---------------------------------------------------------------- dust in the meadow's light; rain in the fall
  const dustU = { uT: { value: 0 }, uA: { value: 1 }, uPx: { value: H / 1920 }, uC: { value: P0.clone() } };
  { const n = 260, Rr = rng(57), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (Rr() - .5) * 16; p[i * 3 + 1] = Rr() * 8; p[i * 3 + 2] = (Rr() - .5) * 16; sd[i] = Rr(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx; uniform vec3 uC; varying float vA;
        void main(){ vec3 q = position + uC; q.y += mod(uT * (.05 + .06 * aS) + aS * 8., 8.) - 4. * aS; q.x += sin(uT * .4 + aS * 30.) * .4; q.z += cos(uT * .3 + aS * 17.) * .4;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (2. + 4. * aS) * 26. / d, 1., 9.); vA = clamp(1.3 - d / 60., 0., 1.) * (.4 + .6 * aS); }`,
      fragmentShader: `uniform float uA; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 14.); gl_FragColor = vec4(vec3(1., .86, .6) * 1.7, a * vA * uA); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; S.add(pts); }
  const rain = film.addPrecip({ kind: 'rain', count: 26000, box: [V(P0.x - 45, P0.y - 2, P0.z - 30), V(80, 36, 75)], speed: 10, size: .005, wind: V(.6, 0, .3), ambient: col('#c8d0dc', .32), bright: 0, seed: 7 });

  // ---------------------------------------------------------------- the camera: one Hermite spline per block (position + yaw/pitch)
  // keys: [t, x, y, z, yaw°, pitch°] (yaw + = left of −z). Tangents from the neighbours (C1: no velocity jump), zero at the ends.
  const aim = (from, to) => { const d = to.clone().sub(from); return [Math.atan2(-d.x, -d.z) / D2R, Math.atan2(d.y, Math.hypot(d.x, d.z)) / D2R]; };
  // the far sun sits where heal-village S1 has its sun: x .37 W, y .29 H (camera-space ≈ 3.6° left, 10.1° up of the axis)
  const aimG = from => { const [y, p] = aim(from, G); return [y - 3.6, p - 7]; };
  const gy = (x, z, o) => V(x, height(x, z) + o, z);   // a camera point o metres over the ground
  const CM = gy(17.6, -299.8, 2.6);                   // the low camera by the meadow: G, the man and the tree in one line
  function keys1() {
    const K1 = [];
    const add = (t, p, look) => { const yp = Array.isArray(look) ? look : aim(p, look); K1.push([t, p.x, p.y, p.z, yp[0], yp[1]]); };
    const thrYaw = Math.atan2(-THR.x, -THR.z) / D2R;
    add(110.0, V(40, 330, 130), [thrYaw - 8, 14]);
    add(113.0, V(36, 314, 92), [thrYaw - 6, 5]);
    add(115.6, V(28, 256, 34), [thrYaw * .6, -17]);
    add(117.3, V(22, 172, -16), [thrYaw * .45, -19]);
    add(119.0, V(18, 106, -66), [thrYaw * .35, -15]);
    add(121.8, V(17, 70, -128), [thrYaw * .25, -12]);
    add(124.6, V(17.5, 40, -196), aim(V(17.5, 40, -196), P0.clone().add(V(-4, -6, -30))));
    add(127.2, gy(17.8, -262, 11), aim(gy(17.8, -262, 11), P0.clone().add(V(0, -1, -6))));
    add(129.6, gy(17.7, -293, 3.6), aim(gy(17.7, -293, 3.6), P0.clone().add(V(0, 1.4, 0))));
    add(134.4, gy(17.6, -298.4, 2.7), aim(gy(17.6, -298.4, 2.7), P1.clone().add(V(0, 1.3, 0))));
    add(137.6, gy(17.55, -299.4, 2.6), (() => { const q = gy(17.55, -299.4, 2.6), a = aim(q, P1.clone().add(V(0, 1.3, 0))), b = aimG(q); return [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5)]; })());
    add(140.4, gy(17.5, -300.8, 2.7), aimG(gy(17.5, -300.8, 2.7)));
    add(142.4, gy(17.4, -303.6, 2.9), aimG(gy(17.4, -303.6, 2.9)));
    return K1;
  }
  function keys2() {
    const K2 = [], add = (t, p, look) => { const yp = Array.isArray(look) ? look : aim(p, look); K2.push([t, p.x, p.y, p.z, yp[0], yp[1]]); };
    const lk = (p, k) => { const a = aim(p, P1.clone().add(V(0, 1.3, 0))), b = aimG(p); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; };
    add(215.7, gy(17.6, -299.8, 2.6), lk(gy(17.6, -299.8, 2.6), .5));
    add(219.5, gy(17.55, -299.0, 2.7), lk(gy(17.55, -299.0, 2.7), .4));
    add(223.5, gy(17.5, -297.6, 3.0), lk(gy(17.5, -297.6, 3.0), .2));
    add(227.0, gy(17.8, -295.4, 3.9), lk(gy(17.8, -295.4, 3.9), 0));
    add(231.5, V(23, 21, -283), aim(V(23, 21, -283), P1.clone().add(V(-2, -1.5, -14))));
    add(237.7, V(38, 66, -248), aim(V(38, 66, -248), P1.clone().add(V(-10, -6, -110))));
    return K2;
  }
  // Fritsch–Carlson monotone cubic: C1, never overshoots a key (no back-and-forth between keys)
  function mono(xs, ys) {
    const n = xs.length, d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const al = m[i] / d[i], be = m[i + 1] / d[i], h = al * al + be * be; if (h > 9) { const tt = 3 / Math.sqrt(h); m[i] = tt * al * d[i]; m[i + 1] = tt * be * d[i]; } }
    return x => { if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1]; let i = 0; while (xs[i + 1] < x) i++;
      const h = xs[i + 1] - xs[i], u = (x - xs[i]) / h, u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1]; };
  }
  // a path: the positions on a centripetal Catmull-Rom curve, travelled by a monotone u(t); yaw and pitch monotone per key
  function path(Kk) { const ts = Kk.map(k => k[0]), curve = new THREE.CatmullRomCurve3(Kk.map(k => V(k[1], k[2], k[3])), false, 'centripetal');
    const div = 60, n = Kk.length - 1, Ls = curve.getLengths(n * div), tot = Ls[Ls.length - 1];   // arc length at each key: the speed is continuous
    curve.arcLengthDivisions = n * div;
    const U = mono(ts, Kk.map((k, i) => Ls[i * div] / tot)), Y = mono(ts, Kk.map(k => k[4])), Pp = mono(ts, Kk.map(k => k[5]));
    return t => { const p = curve.getPointAt(clamp(U(t))); return [p.x, p.y, p.z, Y(t), Pp(t)]; }; }
  let K1 = null, K2 = null;
  function setCam(v) { cam.position.set(v[0], v[1], v[2]); const y = v[3] * D2R, p = v[4] * D2R; cam.up.set(0, 1, 0); cam.lookAt(cam.position.clone().add(V(-Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p)))); }

  // ---------------------------------------------------------------- one frame
  const cl = film.cloud, A = film.atmos, Lk = film.look, Dd = film.dofCfg;
  const CL = { rule: { cover: .5, density: .055, litTop: col('#ffe9c4', 1.55), litBottom: col('#d9a46c', .8), shadow: col('#4a4450', .14) }, dead: { cover: .1, density: .075, litTop: col('#9ea3aa', .95), litBottom: col('#545a62', .42), shadow: col('#2a2e34', .16) } };
  const FOG = { rule: [col('#c8c0ac', .42), col('#98b4dc', .5)], dead: [col('#80858c', .55), col('#878c94', .55)] };
  const mixC = (a, b, k, out) => out.copy(a).lerp(b, k);
  function frame3D(t) {
    if (!T) return; const block2 = t > 200;
    if (!K1) { K1 = path(keys1()); K2 = path(keys2()); }
    setCam((block2 ? K2 : K1)(t));
    WU.uTime.value = t; dustU.uT.value = t;
    for (const b of BEAMS) b.k = 0;
    let dead = 0, sunG = 1, lifeG = 1, gk = 0, rainK = 0;
    FR.on = 0; WU.uFrontOn.value = 0;
    if (!block2) {
      dead = ss(T.dark[0], T.dark[1], t); sunG = (1 - dead) * (1 - .32 * ss(T.n41 + .8, T.n41 + 3.2, t)); lifeG = 1 - ss(T.wither[0], T.wither[1], t);   // the land dims a little after N41: the shaft stays where it is
      ruleBeams.forEach((b, i) => { b.k = ss(110.5, 113.5, t) * (1 - ss(T.dark[0] + i * .35, T.dark[0] + 1.4 + i * .35, t)); });
      meadowBeam.k = ss(119, 122, t) * (1 - ss(T.dark[0] + .6, T.dark[0] + 2.4, t));
      gk = ss(T.pierce, T.pierce + 1.4, t); farBeam.k = gk * 1.5;
      rainK = ss(T.rain, T.rain + 1.5, t) * (1 - ss(T.pierce, T.flare[1], t) * .6);
      grave.position.y = grave.userData.y0 + lerp(-.85, 0, ss(T.grave[0], T.grave[1], t));
    } else {
      // block 2: the fallen land; the cloud parts; the front of light grows from under the first shaft
      const part = ss(T.part[0], T.part[1], t), e = Math.max(0, t - T.front0);
      dead = 1 - part * .9; sunG = 0; lifeG = 0;
      FR.on = t > T.front0 ? 1 : 0; FR.c.set(ruleBeams[0].base.x, ruleBeams[0].base.z); FR.r = 40 + 25 * e + 2.2 * e * e; FR.r2 = FR.r - 55;
      WU.uFrontOn.value = FR.on; WU.uFC.value.copy(FR.c); WU.uFR.value = FR.r; WU.uFR2.value = FR.r2;
      const firstK = ss(T.q44 + .2, T.q44 + 1.6, t);
      ruleBeams.forEach((b, i) => { const d = Math.hypot(b.base.x - FR.c.x, b.base.z - FR.c.y); b.k = i === 0 ? firstK : 1 - ss(FR.r - 140, FR.r - 20, d); });
      treeBeam.k = 1 - ss(FR.r - 140, FR.r - 20, Math.hypot(P1.x - FR.c.x, P1.z - FR.c.y));
      rainK = .6 * (1 - ss(T.q44 - .2, T.q44 + 1.8, t));
      grave.position.y = grave.userData.y0 + lerp(0, -.9, ss(0, 1, frontM(grave.position.x, grave.position.z, FR.r2) * 1.2 - .1));
      // the far gap stays open as the light's source on the horizon at the start, then fades as the sky clears
      gk = .55 * (1 - ss(T.part[0], T.part[0] + 4, t)); farBeam.k = gk * 1.4;
    }
    G_.sun = sunG; G_.life = lifeG; WU.uSunG.value = sunG; WU.uLifeG.value = lifeG;
    // the clouds, the sky, the fog: rule → dead
    const dk = dead;
    cl.cover = lerp(CL.rule.cover, CL.dead.cover, dk); cl.density = lerp(CL.rule.density, CL.dead.density, dk);
    mixC(CL.rule.litTop, CL.dead.litTop, dk, cl.litTop); mixC(CL.rule.litBottom, CL.dead.litBottom, dk, cl.litBottom); mixC(CL.rule.shadow, CL.dead.shadow, dk, cl.shadow);
    mixC(FOG.rule[0], FOG.dead[0], dk, A.color); mixC(FOG.rule[1], FOG.dead[1], dk, A.colorUp);
    for (const kk of ['top', 'mid', 'horizon']) mixC(SKY.rule[kk], SKY.dead[kk], dk, sky.u[kk].value);
    sky.u.clouds.value = lerp(.25, .0, dk);
    // the sun in the sky: the light above (rule / restored) or the far gap (the pierce)
    const sunUp = 1 - dk;
    if (gk > .02) { sky.u.sunDir.value.copy(G).sub(cam.position).normalize(); sky.u.sunColor.value.set(1, .9, .72).multiplyScalar(34 * gk); sky.u.sunGlow.value.set(1, .78, .5).multiplyScalar(2.6 * gk); }
    else { sky.u.sunDir.value.copy(THR); sky.u.sunColor.value.set(1, .96, .88).multiplyScalar(40 * sunUp); sky.u.sunGlow.value.set(1, .8, .55).multiplyScalar(.6 * sunUp); }
    gLamp.power = 900 * gk; gLamp.pos.copy(G);
    // the lights: warm sun ↔ grey sky light
    sunL.intensity = lerp(3.2, 1.5, dk); mixC(col('#ffe0aa'), col('#c4ccd8'), dk, sunL.color);
    hemi.intensity = lerp(.8, 1.05, dk); mixC(col('#c4d2e6'), col('#a8b0bc'), dk, hemi.color); mixC(col('#6a5a40'), col('#4c4a48'), dk, hemi.groundColor);
    // the shafts and their pools on the land
    let pi = 0; for (const b of BEAMS) { const near = ss(b.r * 1.2, b.r * 4, Math.hypot(cam.position.x - b.base.x, cam.position.z - b.base.z) - Math.max(0, cam.position.y - b.base.y) * .6); const high = b.gain ? 1 - ss(12, 36, cam.position.y - b.base.y) * .85 : 1; b.m.visible = b.k > .002; b.m.material.uniforms.uK.value = b.k * (b.gain || 1) * near * high; b.m.material.uniforms.uT.value = t;
      if (b.pool && b.k > .002 && pi < 8) WU.uPool.value[pi++].set(b.base.x, b.base.z, b.poolR, b.k * .9 * (b.gain ? 1.7 : 1)); }
    for (; pi < 8; pi++) WU.uPool.value[pi].set(0, 0, 1, 0);
    farBeam.m.material.uniforms.uCol.value.set(1, .86, .6).multiplyScalar(.7);
    dustU.uA.value = Math.max(sunG, block2 ? frontM(P1.x, P1.z, FR.r) : 0) * (t > 121 ? 1 : 0);
    dustU.uC.value.copy(block2 ? P1 : (t < T.walk ? P0 : P1));
    rain.u.bright.value = rainK; rain.mesh.visible = rainK > .01;
    // the land: trees, leaves, the man
    updateFar(t); updateNear(t, block2); manAt(t);
    // the lens: deep focus in the air, the man in focus near the ground
    const toMan = cam.position.distanceTo(man.position);
    Dd.focus = toMan; Dd.aperture = toMan < 80 ? lerp(1.6, 0, clamp((toMan - 25) / 55)) : 0;
    Lk.saturation = lerp(1.18, .82, dk); Lk.contrast = lerp(1.12, 1.0, dk);
    Lk.exposure = lerp(.5, .86, dk) * (block2 ? 1 : lerp(1, 4.2, Math.pow(ss(T.flare[0], T.flare[1], t), 1.6)));
    film.render(t);
  }

  // ---- screen-space light scattering from the sun (as heal-village.js godRays)
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const gS = mkC(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkC(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) {
    const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h);
    const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 222) / 33); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; }
    gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h);
    gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 24; i++) { const sc = 1 + i * .05; gbx.globalAlpha = Math.pow(.9, i) * .15; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); }
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.imageSmoothingEnabled = true; ctx.drawImage(gB, 0, 0, W, H); ctx.restore();
  }
  const tmpV = V();
  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    frame3D(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    // rays from wherever the sun is in the frame
    tmpV.copy(cam.position).addScaledVector(sky.u.sunDir.value, 1000).project(cam);
    const sk = Math.max(sky.u.sunColor.value.r / 40, 0);
    if (sk > .02 && tmpV.z < 1 && Math.abs(tmpV.x) < 1.6 && Math.abs(tmpV.y) < 1.6) godRays(ctx, (tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H, .6 * Math.min(1, sk * 1.5));
    if (t < 200) { const wk = ss(T.flare[0] + .35, T.flare[1], t); if (wk > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,244,222,${wk})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
    else { const wk = 1 - ss(T.q44 - .2 - .0, T.q44 + .5, t); if (t < T.q44 + .5 && wk > 0) { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${wk})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  }
  return { film, draw, beats: () => T, man, P0, P1 };
}
