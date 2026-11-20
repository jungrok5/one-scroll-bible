// tree3d-mustard.js — 「kingdom」 4부 「겨자씨와 보화」: the mustard tree (Mt 13:31–32) as ONE 3D tree that is drawn two ways.
//   * On the tent cloth (puppet-tent.js) it is a shadow: the same tree, the same camera, rendered flat as dyed leather (sil()) —
//     dark limbs with punched lace dots, leaves as thin translucent hide that darkens where it overlaps (multiply). It grows from
//     the seed by a growth uniform (every segment has its birth on the path from the root), shadow birds fly in and settle.
//   * At N18 the shadow DEVELOPS into the lit tree (lit()): backlit by a low sun standing exactly where the lamp's hot spot was,
//     haze, a long shadow across the field toward us, translucent leaves; then one continuous camera — tilt up + crane up through
//     the branches (6 s) — and, under N18b, small lamps light on the branches one by one from the trunk outward while the sun goes
//     down, until the whole crown is lit (「갈릴리 어부 몇 사람 → 온 세상에」).
// After 「타이타닉」 (1997, OPUSCAR 70: the drawing dissolves into the living picture) and the first film's 「귀환」 (blueprint → 3D).
// Craft sources (copied, never edited at the source): motion-skills cinematic-3d (lib3d/cine.js engine; kit.js tree() recursion,
// leafMesh() leaf card, sky()), heal-village.js (low sun lamp in the haze, palette, godRays), cinecode camera-moves.md
// ("tilt up — awe, scale", "crane / pedestal up — scale, a reveal"). Rules kept: no words; frame index frozen (no per-frame
// dither — 「kingdom」 r3 flicker); no lollipop crowns (leaf lace on twigs, gaps); everything a function of t.
//
// API: const TR = await (await import('./tree3d-mustard.js')).build(W, H);
//      TR.sil(t, view) → canvas   the leather tree for the cloth (view = { s, ax, ay, cx, cy }: screen = c + (p − a)·s)
//      TR.lit(t, view) → canvas   the lit tree at the cloth camera (view) or, view = null, on the 3D camera path of t
//      TR.project(v3, view) → [x, y] · TR.G(t) growth · TR.beats(B) · TR.perch · TR.seedPx
import { Film, THREE, V, col, rng } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eio2 = x => { x = clamp(x); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };

// ---------------------------------------------------------------- the one table: every time from the line times
// B: { Q8, N18, N18b, Q9, pc: { Q8: [piece starts], N18: [...], N18b: [...] } }
export function beats(B) {
  const q8 = B.pc.Q8, n18 = B.N18, n18b = B.pc.N18b;
  const T = {};
  T.sprout = [q8[1] - 1.1, q8[1] + .5];              // the seedling (2D, puppet-tent.js) — the 3D tree is not there yet
  T.grow = [q8[1] + .45, q8[2] - .1];                // 「자란 후에는 풀보다 커서 나무가 되매」 — the tree grows out of the seedling to fill the cloth
  T.birds = [q8[2] - .1, B.N18 - .6];                // 「공중의 새들이 와서 그 가지에 깃들이느니라」
  T.dev = [n18 + .15, n18 + .75];                    // the cloth gives way to the 3D world round the (still leather) tree
  T.devS = [n18 + .5, n18 + 2.45];                   // then the develop runs up the trunk and out through every branch to the leaves
  T.crane = [n18, n18 + 6];                          // tilt up + crane up through the branches (6 s)
  T.few = [n18b[0] + .5, n18b[1] - .5];              // 「처음엔 갈릴리 어부 몇 사람」 — a few lamps at the fork
  T.all = [n18b[1] + .1, B.Q9 - .6];                 // 「지금은 온 세상에」 — the lamps run out to every branch
  T.dusk = [n18b[0] + 1.2, B.Q9 + .4];                     // the sun goes down behind the hills
  T.end = B.Q9 + .9;                                 // the dissolve to the tent ends
  return T;
}

// growth G(t): 0 = the seed, ~.012 a shoot, 1.3 = full grown (segments are born at s ∈ [0, 1] on the path from the root)
function growth(T, t) {
  const sp = 0;
  const g = T.grow, u = clamp((t - g[0]) / (g[1] - g[0]));
  const k = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;   // slow start, fastest in the middle, eases to full
  return sp + (1.3 - .014) * Math.pow(k, 1.15);
}

// ---------------------------------------------------------------- the tree (seeded, built once)
// A broad spreading tree (in the manner of an old field tree — the mustard "greater than all herbs"): a short trunk that forks into
// four limbs leaning out, recursive branches bending up and out, twigs, leaves in clusters at the twig ends (lace with gaps).
function makeTree(seed = 7) {
  const R = rng(seed), segs = [], tips = [], nodes = [];
  const add = (a, b, r0, r1, s0, s1, lvl) => { segs.push({ a: a.clone(), b: b.clone(), r0, r1, s0, s1, lvl }); };
  const DEPTH = 6;
  const branch = (p, dir, len, r, lvl, s) => {
    let q = p.clone(), d = dir.clone();
    const n = lvl < 2 ? 4 : lvl < 4 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const bend = V(R() - .5, R() - .5, R() - .5).multiplyScalar(.22 + lvl * .04);
      d.add(bend).add(V(0, lvl < 3 ? .05 : -.015 * (lvl - 2), 0)).normalize();
      const l = len / n, e = q.clone().addScaledVector(d, l), r1 = Math.max(.012, r * (1 - .2 / n));
      add(q, e, Math.max(r, .012), r1, s, s + l, lvl); q = e; r = r1; s += l;
      if (lvl >= 2 && i === n - 1) nodes.push({ p: q.clone(), s, lvl, d: d.clone() });
    }
    if (lvl >= DEPTH) { tips.push({ p: q.clone(), d: d.clone(), s, r }); return; }
    const kids = lvl === 0 ? 4 : (R() < .55 ? 2 : 3);
    for (let k = 0; k < kids; k++) {
      let nd;
      if (lvl === 0) {   // the four main limbs: out and up, round the trunk
        const az = (k / kids) * Math.PI * 2 + .4 + (R() - .5) * .5, out = .62 + R() * .18;
        nd = V(Math.cos(az) * out, 1, Math.sin(az) * out * .85).normalize();
      } else {
        const ax = V(R() - .5, R() - .2, R() - .5).normalize();
        nd = d.clone().applyAxisAngle(ax, .5 + R() * .45);
        const h = V(nd.x, 0, nd.z); if (h.lengthSq() > 1e-4) nd.addScaledVector(h.normalize(), .18);   // spread outward
        nd.y = Math.max(nd.y, -.12); nd.add(V(0, lvl < 3 ? .22 : .06, 0)).normalize();
      }
      branch(q.clone(), nd, len * (.68 + R() * .16), r * (.6 + R() * .1), lvl + 1, s);
    }
    if (lvl >= 1 && lvl < DEPTH - 1 && R() < .4) branch(q.clone(), d.clone(), len * .62, r * .62, lvl + 1, s);
  };
  // trunk: two slightly bent segments to the fork at 5.2 m (flared at the root)
  const t0 = V(0, 0, 0), t1 = V(.18, 2.6, .05), t2 = V(-.1, 5.2, -.06);
  add(t0, V(.06, .9, .02), .78, .56, 0, .9, 0); add(V(.06, .9, .02), t1, .56, .5, .9, 2.6, 0); add(t1, t2, .5, .44, 2.6, 5.2, 0);
  // the four main limbs straight from the fork (no further trunk): out and up, round the trunk
  for (let k = 0; k < 4; k++) { const az = (k / 4) * Math.PI * 2 + .4 + (R() - .5) * .5, out = .78 + R() * .2;
    branch(t2.clone(), V(Math.cos(az) * out, 1, Math.sin(az) * out * .8).normalize(), 4.0 + R() * .6, .3, 1, 5.2); }
  let sMax = 0; for (const g of segs) sMax = Math.max(sMax, g.s1);
  for (const g of segs) { g.s0 /= sMax; g.s1 /= sMax; }
  for (const t of tips) t.s /= sMax; for (const n of nodes) n.s /= sMax;
  return { segs, tips, nodes, sMax };
}

// tubes with growth attributes: each ring vertex knows its segment's base, axis and birth (s0, s1) and which end it is on
function tubesGrow(segs, sides) {
  const n = segs.length, vc = n * sides * 2;
  const pos = new Float32Array(vc * 3), nor = new Float32Array(vc * 3), base = new Float32Array(vc * 3), dir = new Float32Array(vc * 3), gs = new Float32Array(vc * 3), idx = [];
  const ax = V(), u = V(), w = V(), tmp = V();
  segs.forEach((g, s) => {
    ax.subVectors(g.b, g.a); const L = ax.length(); ax.divideScalar(L || 1);
    tmp.set(Math.abs(ax.y) < .9 ? 0 : 1, Math.abs(ax.y) < .9 ? 1 : 0, 0); u.crossVectors(ax, tmp).normalize(); w.crossVectors(ax, u);
    for (let k = 0; k < sides; k++) {
      const an = k / sides * Math.PI * 2, c = Math.cos(an), si = Math.sin(an), nx = u.x * c + w.x * si, ny = u.y * c + w.y * si, nz = u.z * c + w.z * si;
      for (let e = 0; e < 2; e++) {
        const i = (s * sides + k) * 2 + e, P = e ? g.b : g.a, r = e ? g.r1 : g.r0, ov = (e ? .9 : -.25) * r;   // rings overlap into the next segment (no light through the bends)
        pos.set([P.x + nx * r + ax.x * ov, P.y + ny * r + ax.y * ov, P.z + nz * r + ax.z * ov], i * 3); nor.set([nx, ny, nz], i * 3);
        base.set([g.a.x, g.a.y, g.a.z], i * 3); dir.set([g.b.x - g.a.x, g.b.y - g.a.y, g.b.z - g.a.z], i * 3); gs.set([g.s0, g.s1, e], i * 3);
      }
      const v0 = (s * sides + k) * 2, v1 = (s * sides + (k + 1) % sides) * 2;
      idx.push(v0, v1, v0 + 1, v1, v1 + 1, v0 + 1);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('aBase', new THREE.BufferAttribute(base, 3)); geo.setAttribute('aDir', new THREE.BufferAttribute(dir, 3)); geo.setAttribute('aGS', new THREE.BufferAttribute(gs, 3));
  geo.setIndex(idx); geo.computeBoundingSphere(); return geo;
}

const GROW_GLSL = /* glsl */`
  attribute vec3 aBase; attribute vec3 aDir; attribute vec3 aGS; uniform float uG;
  vec3 growPos(vec3 p) {
    float e = clamp((uG - aGS.x) / max(aGS.y - aGS.x, 1e-4), 0., 1.);
    vec3 off = p - (aBase + aDir * aGS.z);
    float sR = mix(aGS.x, aGS.y, aGS.z);                       // this ring's own place on the path: neighbours match (no seams)
    float rk = uG <= aGS.x ? 0. : clamp(.06 + min(uG, .25) * .55 + max(uG - sR, 0.) * 2.0, 0., 1.);
    return aBase + aDir * (aGS.z * e) + off * rk;
  }`;
const LEAF_GLSL = /* glsl */`
  attribute vec3 aLeaf; uniform float uG, uT, uWind;
  vec3 leafPos(vec3 p) {
    float lk = clamp((uG - aLeaf.x) / .07, 0., 1.); lk = lk * lk * (3. - 2. * lk);
    float dk = 1. - smoothstep(aLeaf.y, aLeaf.y + .06, uG);
    float fl = (sin(uT * 1.9 + aLeaf.z * 6.283) * .6 + sin(uT * 3.1 + aLeaf.z * 17.) * .4) * .16 * uWind;
    float c = cos(fl), s = sin(fl);
    return vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c) * lk * dk;
  }`;
const NOISE_GLSL = /* glsl */`
  float th(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float tn(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(mix(th(i), th(i + vec3(1,0,0)), f.x), mix(th(i + vec3(0,1,0)), th(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(th(i + vec3(0,0,1)), th(i + vec3(1,0,1)), f.x), mix(th(i + vec3(0,1,1)), th(i + vec3(1,1,1)), f.x), f.y), f.z); }`;

// a leaf card along +x from its stalk (origin), tapered like a real leaf, a little cupped
function leafGeo(L = .2, Wd = .11) {
  const g = new THREE.PlaneGeometry(L, Wd, 6, 2); g.translate(L / 2, 0, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / L, y = p.getY(i); const w = Math.pow(Math.sin(Math.PI * Math.min(1, x * 1.02)), .8) * (1 - .25 * x); p.setY(i, y * Math.max(w, .04)); p.setZ(i, -(y * y) * 3 + x * x * .02); }
  g.computeVertexNormals(); return g;
}

// a small bird — a Group whose parts are posed by poseBird(): a body that tapers into a fanned tail, a small head and beak,
// long wings in two panels with the primaries splayed at the tip (reads as a bird from any side, not a ball)
const tri = (pts, mat) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts.flat()), 3)); g.computeVertexNormals(); return new THREE.Mesh(g, mat); };
function birdParts(mat) {
  const G = new THREE.Group();
  const bg = new THREE.SphereGeometry(.15, 16, 10); { const p = bg.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i) * 1.9, y = p.getY(i) * .8, z = p.getZ(i) * .78;
    if (x < 0) { const k = 1 + x / .34; y *= Math.max(.18, k); z *= Math.max(.18, k); y += (1 - Math.max(0, k)) * .02; } p.setXYZ(i, x, y, z); } bg.computeVertexNormals(); }
  G.add(new THREE.Mesh(bg, mat));
  const head = new THREE.Mesh(new THREE.SphereGeometry(.068, 10, 8), mat); head.position.set(.27, .07, 0); G.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(.02, .085, 6), mat); beak.rotation.z = -Math.PI / 2; beak.position.set(.37, .06, 0); head.parent.add(beak);
  const tail = tri([[-.24, .02, 0], [-.52, .04, -.12], [-.5, .04, 0], [-.24, .02, 0], [-.5, .04, 0], [-.52, .04, .12]], mat); G.add(tail);
  const wing = side => { const root = new THREE.Group(); root.position.set(.03, .06, .05 * side);
    root.add(tri([[.11, 0, 0], [-.1, 0, 0], [-.07, 0, .3 * side], [.11, 0, 0], [-.07, 0, .3 * side], [.08, 0, .27 * side]], mat));
    const tip = new THREE.Group(); tip.position.set(0, 0, .28 * side); root.add(tip);
    const pr = []; for (let k = 0; k < 4; k++) { const a = -.15 - k * .07; pr.push([.07 - k * .045, 0, 0], [.02 - k * .045, 0, 0], [a - .08, 0, (.3 - k * .03) * side]); }
    tip.add(tri([[.08, 0, 0], [-.07, 0, 0], [-.12, 0, .18 * side], [.08, 0, 0], [-.12, 0, .18 * side], [.02, 0, .2 * side], ...pr], mat));
    G.add(root); return { root, tip }; };
  const wl = wing(1), wr = wing(-1);
  G.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
  return { G, head, wl, wr, tail };
}
// pose: pos, heading (yaw), flap phase, fold 0..1 (1 = wings folded on the back), pitch
function poseBird(b, o) {
  b.G.position.copy(o.pos); b.G.rotation.set(0, o.yaw, o.pitch || 0, 'YXZ'); const sc = o.scale || 1; b.G.scale.setScalar(sc);
  const f = o.fold, fl = Math.sin(o.flap), up = (1 - f) * (fl * .95 + .1), tipB = (1 - f) * (fl * .55 - .15);
  b.wl.root.rotation.set(up, 0, 0); b.wr.root.rotation.set(-up, 0, 0);
  b.wl.tip.rotation.set(tipB, 0, 0); b.wr.tip.rotation.set(-tipB, 0, 0);
  // folded: the wing turns back along the body
  b.wl.root.rotation.y = -f * 1.25; b.wr.root.rotation.y = f * 1.25; b.wl.tip.rotation.y = -f * 1.6; b.wr.tip.rotation.y = f * 1.6;
  b.head.position.y = .09 + (o.bob || 0);
}

export async function build(W, H) {
  const FOV = 46;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .05, far: 4000,
    atmos: { density: .003, falloff: .02, base: 0, start: 6, color: col('#e6b07a', .78), colorUp: col('#d7b896', .62), max: 2600, scatter: 1, anisotropy: .8, phaseMix: .88 },
    bloom: { strength: .07, radius: 1.05, tint: col('#ffe0b0') },
    dof: { focus: 40, aperture: .4, maxCoc: 22 },
    look: { exposure: 1.0, contrast: 1.04, saturation: 1.0, lift: col('#0e0906'), shadowTint: col('#d6cce4'), highTint: col('#fff0d6'), vignette: .3, grain: .012, ca: .25 },
  });
  // frozen frame index: the DOF spiral, the lamp in-scatter jitter and the grain stop changing from frame to frame (fixed dither)
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera, R = film.renderer;
  let T = null;
  const U = { uG: { value: 1.3 }, uT: { value: 0 }, uWind: { value: 1 } };

  // ---------------------------------------------------------------- the cloth camera: the frame of the shadow play
  // eye 2.1 m high, 40 m from the trunk, level: the trunk foot lands at y ≈ 1079 px, the 17 m tree fills the cloth above
  const CLOTH = { pos: V(0, 2.1, 40) };
  const F_PX = (H / 2) / Math.tan(FOV / 2 * Math.PI / 180);
  // the lamp's hot spot on the cloth (puppet-tent.js LAMP) is where the sun stands: world px (540, 640)
  const SUN0 = V(0, (H / 2 - 640) / F_PX, -1).normalize();
  const sunDir = SUN0.clone();

  // ---------------------------------------------------------------- light
  const skyO = { top: col('#7c8fb0', .62), mid: col('#e7b585', 1.0), horizon: col('#ffd59c', 1.75), sunDir, sunColor: col('#fff4dc', 30), sunGlow: col('#ffc47c', 1.9), clouds: .18, cloudColor: col('#ffe0b4', 1.15), cloudShade: col('#b88a72', .7) };
  const sky = K.sky(film, skyO);
  const hemi = new THREE.HemisphereLight(col('#a9b4cc'), col('#6e4f34'), .5); S.add(hemi);
  // the sun's shadow (round 2: the owner saw it jitter): the map was 2048² over an 80 m square and the sun only 8° up, so each texel
  // lay ~30 cm long on the ground and the PCF edges shimmered as the camera moved. Now a frustum fitted to the tree and its long
  // shadow, 4096², variance-filtered (VSM: a fixed blur, no random taps) — soft, stable penumbras like a real low sun.
  film.renderer.shadowMap.type = THREE.VSMShadowMap;
  const sunL = new THREE.DirectionalLight(col('#ffd29a'), 3.0); sunL.castShadow = true; sunL.shadow.mapSize.set(4096, 4096);
  Object.assign(sunL.shadow.camera, { left: -15, right: 15, top: 21, bottom: -11, near: 230, far: 420 }); sunL.shadow.bias = -.0003; sunL.shadow.normalBias = .02;
  sunL.shadow.radius = 20; sunL.shadow.blurSamples = 24;
  S.add(sunL, sunL.target);
  const sunLamp = film.lamp(V(0, 0, 0), '#ffcf96', { power: 1900, size: 70, fog: 1 });

  // ---------------------------------------------------------------- land: a ploughed field, the low hills of Galilee in the haze
  {
    const gm = new THREE.MeshStandardMaterial({ color: '#5a4430', roughness: .95 });
    gm.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vGW;').replace('#include <project_vertex>', '#include <project_vertex>\nvGW = (modelMatrix * vec4(transformed, 1.)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vGW;\n' + NOISE_GLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { float fur = .5 + .5 * sin(vGW.x * 4.2 + tn(vGW * .3) * 3.);
            float m = tn(vGW * .07) * .6 + tn(vGW * .6) * .4;
            diffuseColor.rgb *= mix(.72, 1.08, fur * .5 + m * .5); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.42, .40, .24), smoothstep(.55, .8, tn(vGW * .02)) * .35); }`);
    };
    // finely tessellated (12.5 m quads): on one huge quad the interpolated shadow coordinates lost precision and the shadow swam
    // as the camera moved (round 4: "그림자 떨리던데")
    const g = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000, 400, 400).rotateX(-Math.PI / 2), gm); g.receiveShadow = true; film.ground(g); S.add(g);
    // ridges: strips of low hills far behind the tree, each one more lost in the haze
    const hm = new THREE.MeshStandardMaterial({ color: '#6d5a4a', roughness: 1 });
    const RR = rng(31);
    for (const [z, hgt, n] of [[-420, 26, 1], [-800, 60, 2], [-1400, 110, 3]]) {
      const N = 160, w = 6000, pos = [], idx = [];
      const ph = RR() * 9;
      for (let i = 0; i <= N; i++) { const x = -w / 2 + w * i / N, y = hgt * (.55 + .3 * Math.sin(x * .0021 * n + ph) + .15 * Math.sin(x * .007 + ph * 2)); pos.push(x, -2, z, x, y, z - 30); }
      for (let i = 0; i < N; i++) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      S.add(new THREE.Mesh(geo, hm));
    }
  }

  // ---------------------------------------------------------------- the tree
  const TREE = makeTree(7);
  // the camera path is known now; branches and leaves that would brush the lens are left out (a clear way up through the crown)
    const KP = [V(0, 2.1, 40), V(.6, 3.4, 23), V(1.3, 5.6, 6.6), V(2.0, 11.0, 9.8), V(3.0, 17.5, 31)];
  const KT = [V(0, 2.1, -60), V(0, 6.6, 0), V(0, 13.2, -1), V(0, 10.8, -.5), V(0, 9.6, -.5)];
  const KL = [0]; for (let i = 1; i < KP.length; i++) KL.push(KL[i - 1] + KP[i].distanceTo(KP[i - 1]));
  const LEN = KL[KL.length - 1], LEN_A = KL[2];          // the crane ends at the third key (inside the crown front)
  function herm(P, sg) {
    let i = 0; while (i < KL.length - 2 && sg > KL[i + 1]) i++;
    const s0 = KL[i], s1 = KL[i + 1], h = s1 - s0, u = clamp((sg - s0) / h);
    const tan = j => { const a = Math.max(0, j - 1), b = Math.min(KL.length - 1, j + 1); return P[b].clone().sub(P[a]).divideScalar(KL[b] - KL[a]); };
    const m0 = tan(i).multiplyScalar(h), m1 = tan(i + 1).multiplyScalar(h), u2 = u * u, u3 = u2 * u;
    return P[i].clone().multiplyScalar(2 * u3 - 3 * u2 + 1).addScaledVector(m0, u3 - 2 * u2 + u).addScaledVector(P[i + 1], -2 * u3 + 3 * u2).addScaledVector(m1, u3 - u2);
  }
  const camPathPts = []; for (let i = 0; i <= 300; i++) camPathPts.push(herm(KP, i / 300 * LEN));
  const near = (p, r) => camPathPts.some(c => c.distanceToSquared(p) < r * r);
  const segsK = TREE.segs.filter(g => !(g.r0 < .07 && (near(g.a, .9) || near(g.b, .9))));
  const DEV = { uDev: { value: 2 }, uDevOn: { value: 0 }, uLeatherB: { value: col('#120a05', .35) }, uLeatherL: { value: col('#5a3418', .32) } };
  // round 3: no ring — the leather gives way over a long feathered stretch (~2 m on the trunk, a few diameters on a branch) and the
  // front is a soft amber warmth that only lifts the bark a little; colour and leaves bloom in behind it
  const DEV_FRAG = (leather) => `{ float fdv = smoothstep(uDev - .1, uDev + .03, vS) * uDevOn;
      float band = exp(-pow((vS - (uDev - .035)) / .07, 2.)) * uDevOn, tail = uDevOn * smoothstep(uDev, uDev - .06, vS) * exp(-max(uDev - vS, 0.) / .12);
      vec3 lit = outgoingLight * (1. + tail * .5 + band * .8) + vec3(1., .56, .22) * band * .1;
      outgoingLight = mix(lit, ${leather}, fdv); }
    #include <opaque_fragment>`;
  const bark = new THREE.MeshStandardMaterial({ color: '#3a2a1e', roughness: .92, side: THREE.DoubleSide });
  bark.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U, DEV);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + GROW_GLSL + '\nvarying vec3 vBW; varying float vS;')
      .replace('#include <begin_vertex>', 'vec3 transformed = growPos(vec3(position)); vS = mix(aGS.x, aGS.y, aGS.z);').replace('#include <project_vertex>', '#include <project_vertex>\nvBW = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vBW; varying float vS; uniform float uDev, uDevOn; uniform vec3 uLeatherB;\n' + NOISE_GLSL).replace('#include <opaque_fragment>', DEV_FRAG('uLeatherB'))
      .replace('#include <map_fragment>', `#include <map_fragment>
        { float rid = tn(vec3(vBW.x * 9., vBW.y * 1.6, vBW.z * 9.)); float sp = tn(vBW * 3.);
          diffuseColor.rgb *= mix(.6, 1.15, rid * .65 + sp * .35); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.33, .32, .27), smoothstep(.62, .85, tn(vBW * 1.3)) * .4); }`);
  };
  bark.customProgramCacheKey = () => 'mustard-bark';
  const trunkGeo = tubesGrow(segsK.filter(g => g.r0 >= .05), 9), twigGeo = tubesGrow(segsK.filter(g => g.r0 < .05), 4);
  const trunk = new THREE.Mesh(trunkGeo, bark), twigs = new THREE.Mesh(twigGeo, bark);
  for (const m of [trunk, twigs]) { m.castShadow = true; m.frustumCulled = false; m.layers.set(2); S.add(m); }

  // leaves: clusters at the twig ends and along the last two levels — lace with gaps
  const LR = rng(19), leafPts = [];
  const tipsK = TREE.tips.filter(tp => !near(tp.p, 1.1));
  for (const tp of tipsK) {
    const n = 15 + Math.floor(LR() * 9);
    for (let i = 0; i < n; i++) {
      const o = V(LR() - .5, LR() - .35, LR() - .5).multiplyScalar(.85);
      leafPts.push({ p: tp.p.clone().add(o), d: tp.d, s: tp.s });
    }
  }
  for (const g of segsK) if (g.lvl >= 4 && LR() < .7) {
    const k = LR(), p = g.a.clone().lerp(g.b, k), d = g.b.clone().sub(g.a).normalize();
    for (let i = 0; i < 5; i++) leafPts.push({ p: p.clone().add(V(LR() - .5, LR() - .5, LR() - .5).multiplyScalar(.35)), d, s: lerp(g.s0, g.s1, k) });
  }
  const NL = leafPts.length + 2;
  const lgeo = leafGeo(.22, .12);
  const leafAttr = new Float32Array(NL * 3);
  const leafMat = new THREE.MeshStandardMaterial({ roughness: .62, side: THREE.DoubleSide, color: '#ffffff' });
  const LU = { uSunV: { value: V() }, uSunC: { value: col('#ffcf8a', 1) }, uTrans: { value: 1 } };
  leafMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U, LU, DEV);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + LEAF_GLSL + '\nvarying float vS;').replace('#include <begin_vertex>', 'vec3 transformed = leafPos(vec3(position)); vS = aLeaf.x - .02;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunV, uSunC; uniform float uTrans; varying float vS; uniform float uDev, uDevOn; uniform vec3 uLeatherL;')
      .replace('#include <opaque_fragment>', `{ float bk = max(dot(normalize(-vViewPosition), uSunV), 0.);
          outgoingLight += diffuseColor.rgb * uSunC * (pow(bk, 4.) * .7 + pow(bk, 16.) * 1.6) * uTrans; }
        ` + DEV_FRAG('uLeatherL'));
  };
  leafMat.customProgramCacheKey = () => 'mustard-leaf';
  const leaves = new THREE.InstancedMesh(lgeo, leafMat, NL);
  const silLeafColors = [];
  {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = V(), cols = ['#3e5a22', '#4b6a26', '#566c2a', '#38511f', '#647032'];
    leafPts.forEach((L, i) => {
      e.set((LR() - .5) * 2.4, LR() * Math.PI * 2, (LR() - .3) * 1.6); q.setFromEuler(e);
      const s = .75 + LR() * .6; sc.set(s, s, s); m.compose(L.p, q, sc); leaves.setMatrixAt(i, m);
      leaves.setColorAt(i, new THREE.Color(cols[Math.floor(LR() * cols.length)]).multiplyScalar(.75 + LR() * .4));
      leafAttr.set([L.s + .015 + LR() * .03, 9, LR()], i * 3);
    });
    // the two seed leaves on the shoot: born first, gone once the stem turns to wood
    const sprout = [[V(.0, .26, 0), .55], [V(.0, .26, 0), Math.PI + .55]];
    sprout.forEach(([p, yaw], j) => { const i = leafPts.length + j; e.set(0, yaw, .55); q.setFromEuler(e); sc.set(1.05, 1.05, 1.05); m.compose(p, q, sc); leaves.setMatrixAt(i, m); leaves.setColorAt(i, new THREE.Color('#6f8a3a')); leafAttr.set([.004, .15, j * .5], i * 3); });
  }
  lgeo.setAttribute('aLeaf', new THREE.InstancedBufferAttribute(leafAttr, 3));
  leaves.castShadow = true; leaves.frustumCulled = false; leaves.layers.set(2); S.add(leaves);

  // ---------------------------------------------------------------- birds (one set for the lit scene, one for the leather)
  const PR = rng(53);
  // perches: branch nodes in the outer crown with little leaf around them, spread over the crown (screen-spread from the cloth)
  const cand = TREE.nodes.filter(n => n.lvl >= 3 && n.lvl <= 5 && n.p.y > 7.5 && n.p.z > -2 && !near(n.p, 8.5));
  const dens = p => leafPts.reduce((a, L) => a + (L.p.distanceToSquared(p) < 1.0 ? 1 : 0), 0);
  cand.forEach(c => c.dn = dens(c.p));
  const perch = [];
  for (const want of [[-6.5, 10.5], [4.8, 12.8], [-2.2, 14.6], [7.4, 9.6], [1.0, 11.0], [-8.2, 13.2]]) {
    let best = null, bs = 1e9; for (const c of cand) { const sc = Math.hypot(c.p.x - want[0], c.p.y - want[1]) * 2 + c.dn * .25; if (sc < bs && !perch.some(p => p.p.distanceTo(c.p) < 2.5)) { bs = sc; best = c; } }
    if (best) perch.push(best);
  }
  const birdMatL = new THREE.MeshStandardMaterial({ color: '#2a211b', roughness: .8, side: THREE.DoubleSide });
  const birdsL = perch.map(() => birdParts(birdMatL)); birdsL.forEach(b => S.add(b.G));
  // flight plans: from off the cloth (left/right/top), a curve to the perch, landing flare
  const plans = perch.map((p, i) => { const side = p.p.x < 0 ? -1 : 1, from = V(side * (19 + PR() * 6), p.p.y + 3 + PR() * 5, p.p.z + (PR() - .5) * 4);
    return { to: p.p.clone().add(V(0, .2, 0)), from, mid: V(lerp(from.x, p.p.x, .45), Math.max(from.y, p.p.y) + 2 + PR() * 2, p.p.z), dl: i * .32 + PR() * .25, dur: 2.3 + PR() * .6, ph: PR() * 6 }; });

  // ---------------------------------------------------------------- the lamps on the branches (N18b)
  // a lamp on almost every branch node (none brushing the lens); which ones come first is decided by the camera (rankLamps)
  const LRR = rng(77), LMP = [];
  for (const n of TREE.nodes) if (n.lvl >= 2 && !near(n.p, 1.7) && LRR() < .8) LMP.push({ p: n.p.clone().add(V(0, .06, 0)), first: false, s: n.s, rank: 1 });
  // each lamp: a small clay oil lamp set on the branch and its flame (a teardrop of light; the bloom makes the glow)
  const flameGeo = new THREE.SphereGeometry(.026, 10, 8); flameGeo.translate(0, .026, 0); { const p = flameGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) / .052; p.setX(i, p.getX(i) * (1 - .6 * y * y)); p.setZ(i, p.getZ(i) * (1 - .6 * y * y)); p.setY(i, p.getY(i) * 2.0); } }
  const lampMesh = new THREE.InstancedMesh(flameGeo, new THREE.MeshBasicMaterial({ color: '#ffffff' }), LMP.length);
  const cupMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(.055, 10, 6, 0, Math.PI * 2, Math.PI * .45, Math.PI * .55), new THREE.MeshStandardMaterial({ color: '#4a3020', roughness: .9, side: THREE.DoubleSide }), LMP.length);
  { const m = new THREE.Matrix4(), mc = new THREE.Matrix4(); LMP.forEach((l, i) => { m.compose(l.p, new THREE.Quaternion(), V(1, 1, 1)); lampMesh.setMatrixAt(i, m); lampMesh.setColorAt(i, new THREE.Color(0, 0, 0));
    mc.compose(l.p.clone(), new THREE.Quaternion(), V(1, .55, 1)); cupMesh.setMatrixAt(i, mc); }); }
  for (const m of [lampMesh, cupMesh]) { m.frustumCulled = false; m.layers.set(2); S.add(m); }
  // the in-scatter halos: a fixed set (assigned once, never switched between frames)
  const glows = Array.from({ length: 18 }, () => ({ l: null, L: film.lamp(V(0, -100, 0), '#ffc57a', { power: 0, size: .18, fog: 1 }) }));
  // round 6 (owner "남은 점도 개선하자" — of the first six only 1–2 read): the first six are chosen so the eye can find every one of
  // them for the whole of 「처음엔 갈릴리 어부 몇 사람」 and the start of the spread — in the frame (clear of the words), a few metres
  // off, not behind the trunk or a limb at any moment of that stretch (rays against the wood; leaves, which are lace, only counted),
  // spread apart; and each gets a soft halo on screen (firstHalos) so it reads as a warm point against the bright haze.
  const ray = new THREE.Raycaster(); ray.layers.enableAll();
  function blocked(p) {   // 99 = behind wood; otherwise the number of leaves in the way
    const d = p.clone().sub(cam.position), L = d.length(); ray.set(cam.position, d.divideScalar(L)); ray.near = .05; ray.far = L - .32;   // the lamp sits on its own branch: stop short of it
    if (ray.intersectObjects([trunk, twigs], false).length) return 99;
    return ray.intersectObject(leaves, false).length;
  }
  function pickFirst() {
    // each of the six has its own moment (slot) inside 「처음엔 …」; a lamp can take a slot only if, from a beat before that moment
    // until the spread is under way, it never leaves the frame and never goes behind the wood (sampled every 0.1 s)
    S.updateMatrixWorld(true);
    // the six moments: one by one over 「…갈릴리 어부 몇 사람이었습니다」 once the crane has settled (before it the camera is still
    // rising through the crown and nothing stays in view long enough to be found)
    const slots = Array.from({ length: 6 }, (_, i) => lerp(T.few[0] + 1.4, T.few[1] + .15, i / 5)), tEnd = T.all[0] + 1.4, dt = .1;
    const ts = []; for (let t = T.few[0] - .3; t <= tEnd + 1e-6; t += dt) ts.push(t);
    const st = LMP.map(l => ({ l, xy: [], ok: [] }));
    ts.forEach(t => { setPath(t);
      for (const s of st) { const q = s.l.p.clone().project(cam), d = s.l.p.distanceTo(cam.position), x = (q.x + 1) / 2 * W, y = (1 - q.y) / 2 * H;
        s.xy.push([x, y, d]); s.ok.push(q.z < 1 && x > 90 && x < W - 150 && y > 150 && y < H * .6 && d > 2.2 && d < 32); } });
    // rays only where the frame test passed
    ts.forEach((t, k) => { setPath(t); for (const s of st) if (s.ok[k]) { const b = blocked(s.l.p); if (b >= 99) s.ok[k] = false; else s.xy[k].push(b); } });
    for (const s of st) { let k = ts.length - 1; if (!s.ok[k]) { s.from = Infinity; continue; } while (k > 0 && s.ok[k - 1]) k--; s.from = ts[k];
      s.leaf = s.xy.slice(k).reduce((a, v) => a + (v[3] || 0), 0) / (ts.length - k); }
    const first = [], idx = t => Math.min(ts.length - 1, Math.max(0, Math.round((t - ts[0]) / dt)));
    const pass = (lead, gap, leafMax) => slots.forEach((sl, i) => { if (first.some(f => f.slot === i)) return; const k = idx(sl), ke = ts.length - 1; let best = null, bs = Infinity;
      for (const s of st) { if (s.from > sl - lead || first.some(f => f.l === s.l) || s.leaf > leafMax) continue;
        const [x, y, d] = s.xy[k], [xe, ye] = s.xy[ke];
        if (!first.every(f => Math.hypot(f.xy[k][0] - x, f.xy[k][1] - y) > gap && Math.hypot(f.xy[ke][0] - xe, f.xy[ke][1] - ye) > gap * .8)) continue;
        const sc = Math.hypot(x - W / 2, y - H * .38) * .6 + d * 18 + s.leaf * 60; if (sc < bs) { bs = sc; best = s; } }
      if (best) { best.l.t0 = sl; first.push({ l: best.l, xy: best.xy, slot: i, x: best.xy[k][0], y: best.xy[k][1] }); } });
    pass(.1, 170, 1.5); pass(0, 130, 3); pass(-.2, 100, 6);
    const hist = {}; for (const s of st) if (s.from < Infinity) { const b = Math.floor(s.from * 2) / 2; hist[b] = (hist[b] || 0) + 1; }
    pickDbg = [hist, first.map(f => f.slot)];
    return first;
  }
  function rankLamps() {
    // where the eye is a beat into N18b: the lamps it sees near the middle of the frame, a few metres off, spread apart
    let first = pickFirst();
    if (!first.length) {   // fallback: the round-5 choice
      setPath(T.few[0] + .5);
      const vis = LMP.map(l => { const q = l.p.clone().project(cam), d = l.p.distanceTo(cam.position); return { l, x: (q.x + 1) / 2 * W, y: (1 - q.y) / 2 * H, d, ok: q.z < 1 && Math.abs(q.x) < .55 && q.y > -.15 && q.y < .62 && d > 3 && d < 11 }; }).filter(v => v.ok);
      vis.sort((a, b) => Math.hypot(a.x - W / 2, a.y - H * .4) - Math.hypot(b.x - W / 2, b.y - H * .4));
      for (const v of vis) { if (first.length >= 6) break; if (first.every(f => f.l !== v.l && Math.hypot(f.x - v.x, f.y - v.y) > 150)) first.push(v); }
    }
    firstPicked = first.length;
    if (first.every(v => v.slot != null)) first.forEach(v => { v.l.first = true; v.l.rank = v.slot; });   // each takes its own moment
    else first.sort((a, b) => a.y - b.y || a.x - b.x).forEach((v, i) => { v.l.first = true; v.l.rank = i; });
    // the rest spread from the first ones outward through the tree
    const c = first.reduce((a, v) => a.add(v.l.p), V()).divideScalar(Math.max(1, first.length));
    const rest = LMP.filter(l => !l.first).map(l => [l, l.p.distanceTo(c) + (LRR() - .5) * 1.2]).sort((a, b) => a[1] - b[1]);
    rest.forEach(([l], i) => l.rank = i / Math.max(1, rest.length - 1));
    const gl = [...LMP.filter(l => l.first), ...rest.slice(0, 40).filter((_, i) => i % 3 === 0).map(r => r[0])].slice(0, glows.length);
    gl.forEach((l, i) => { glows[i].l = l; glows[i].L.pos.copy(l.p).add(V(0, .05, 0)); });
    // the first few are the ones the eye must find: larger flames
    const m = new THREE.Matrix4(); LMP.forEach((l, i) => { if (!l.first) return; m.compose(l.p, new THREE.Quaternion(), V(3.0, 3.0, 3.0)); lampMesh.setMatrixAt(i, m); }); lampMesh.instanceMatrix.needsUpdate = true;
  }
  let firstPicked = 0, pickDbg = null;
  // the halos of the first six, on screen over the lit frame: a hot small core and a wide warm bloom (screen blend, so it never
  // turns the haze grey and never clips flat); strength follows the wick (lampOn), size with distance; no per-frame noise
  const comp = document.createElement('canvas'); comp.width = W; comp.height = H; const cx2 = comp.getContext('2d');
  function firstHalos(t, src) {
    const on = LMP.filter(l => l.first).map(l => [l, lampOn(l, t)]).filter(([, k]) => k > 0);
    if (!on.length) return src;
    cx2.setTransform(1, 0, 0, 1, 0, 0); cx2.globalCompositeOperation = 'source-over'; cx2.globalAlpha = 1; cx2.drawImage(src, 0, 0, W, H);
    const fade = 1 - .35 * ss(T.all[0] + 1, T.all[1], t);   // they stay the brightest as the rest spread, a little quieter at the end
    for (const [l, k0] of on) { const q = l.p.clone().add(V(0, .07, 0)).project(cam); if (q.z >= 1) continue;
      const x = (q.x + 1) / 2 * W, y = (1 - q.y) / 2 * H, d = l.p.distanceTo(cam.position), r = clamp(330 / d, 26, 96), k = k0 * fade;
      cx2.globalCompositeOperation = 'screen';
      let g = cx2.createRadialGradient(x, y, 0, x, y, r * 2.4); g.addColorStop(0, `rgba(255,170,80,${.68 * k})`); g.addColorStop(.25, `rgba(255,150,64,${.36 * k})`); g.addColorStop(.6, `rgba(240,120,48,${.12 * k})`); g.addColorStop(1, 'rgba(240,120,48,0)');
      cx2.fillStyle = g; cx2.fillRect(x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
      cx2.globalCompositeOperation = 'lighter';
      g = cx2.createRadialGradient(x, y, 0, x, y, r * .42); g.addColorStop(0, `rgba(255,236,190,${.95 * k})`); g.addColorStop(.35, `rgba(255,200,120,${.55 * k})`); g.addColorStop(1, 'rgba(255,170,80,0)');
      cx2.fillStyle = g; cx2.fillRect(x - r * .42, y - r * .42, r * .84, r * .84); }
    return comp;
  }
  const lampOn = (l, t) => {   // 0..1 with a wick's stutter as it catches
    if (!T || !l) return 0;
    const t0 = l.first ? (l.t0 ?? lerp(T.few[0], T.few[1] - .5, l.rank / 5)) : T.all[0] + Math.pow(l.rank, .8) * (T.all[1] - T.all[0] - .4);
    const k = clamp((t - t0) / .45); if (k <= 0) return 0;
    return k * (k < 1 ? (.75 + .25 * Math.sin(k * 26)) : 1) * (.93 + .07 * Math.sin(t * 7.3 + l.s * 40));
  };

  // ---------------------------------------------------------------- the leather render (the shadow on the cloth)
  const silR = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false, stencil: false });
  silR.setPixelRatio(1); silR.setSize(W, H, false); silR.outputColorSpace = THREE.LinearSRGBColorSpace; silR.toneMapping = THREE.NoToneMapping;
  const silS = new THREE.Scene();
  const silBranchMat = new THREE.ShaderMaterial({ uniforms: { ...U }, side: THREE.DoubleSide,
    vertexShader: GROW_GLSL + `\nvarying vec3 vW; varying float vR; void main(){ vec3 p = growPos(position); vW = (modelMatrix * vec4(p, 1.)).xyz; vR = length(position - (aBase + aDir * aGS.z)); gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.); }`,
    fragmentShader: NOISE_GLSL + `\nvarying vec3 vW; varying float vR;
      void main(){ vec3 dye = vec3(.105, .062, .034) * (.82 + .3 * tn(vW * 2.3));
        // punched lace on the trunk and the thick limbs: little round holes on a 3D lattice (they stay on the wood as it grows)
        if (vR > .14) { vec3 c = vW / .55; vec3 id = floor(c), f = fract(c) - .5 + (vec3(th(id), th(id + 7.), th(id + 3.)) - .5) * .3;
          float hole = 1. - smoothstep(.17, .21, length(f)); dye = mix(dye, vec3(.88, .74, .55), hole * .85); }
        gl_FragColor = vec4(dye, 1.); }` });
  const silLeafMat = new THREE.ShaderMaterial({ uniforms: { ...U }, side: THREE.DoubleSide, transparent: true, depthWrite: false, blending: THREE.MultiplyBlending, premultipliedAlpha: true,
    vertexShader: LEAF_GLSL + `\nvarying vec3 vW; void main(){ vec3 p = leafPos(position); vec4 w = modelMatrix * instanceMatrix * vec4(p, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: NOISE_GLSL + `\nvarying vec3 vW; void main(){ vec3 c = vec3(.52, .36, .2) * (.85 + .25 * tn(vW * 6.)); gl_FragColor = vec4(c, 1.); }` });
  const silTrunk = new THREE.Mesh(trunkGeo, silBranchMat), silTwigs = new THREE.Mesh(twigGeo, silBranchMat), silLeaves = new THREE.InstancedMesh(lgeo, silLeafMat, NL);
  silLeaves.instanceMatrix = leaves.instanceMatrix; silLeaves.count = NL;
  for (const m of [silTrunk, silTwigs, silLeaves]) { m.frustumCulled = false; silS.add(m); }
  const birdMatS = new THREE.MeshBasicMaterial({ color: new THREE.Color(.07, .045, .028), side: THREE.DoubleSide });
  const birdsS = perch.map(() => birdParts(birdMatS)); birdsS.forEach(b => silS.add(b.G));

  // ---------------------------------------------------------------- birds over time
  function birdsAt(t) {
    plans.forEach((pl, i) => {
      const a = T.birds[0] + pl.dl, u = clamp((t - a) / pl.dur), on = t >= a;
      for (const b of [birdsL[i], birdsS[i]]) b.G.visible = on;
      if (!on) return;
      const e = 1 - Math.pow(1 - u, 2.2);                                   // decelerates into the landing
      const p = V().copy(pl.from).multiplyScalar((1 - e) * (1 - e)).addScaledVector(pl.mid, 2 * e * (1 - e)).addScaledVector(pl.to, e * e);
      const d = V().copy(pl.mid).sub(pl.from).multiplyScalar(2 * (1 - e)).addScaledVector(V().copy(pl.to).sub(pl.mid), 2 * e);
      const yaw = Math.atan2(-d.z, d.x), fold = ss(.88, 1, u), flap = pl.ph + (t - a) * 2 * Math.PI * lerp(3.6, 2.2, u) * (.85 + .3 * ((i * .618) % 1));
      const pitch = u < 1 ? clamp(d.y / (Math.hypot(d.x, d.z) + 1e-3), -.5, .5) * .6 + ss(.75, .95, u) * .45 * (1 - fold) : 0;
      const yawP = u >= 1 ? (pl.to.x < 0 ? 0 : Math.PI) + .25 * Math.sin(t * .7 + i) : yaw;   // perched: facing along the branch, a slow look about
      const bob = u >= 1 ? .012 * Math.sin((t - a) * 3.1 + i * 2) : 0;
      for (const b of [birdsL[i], birdsS[i]]) poseBird(b, { pos: p, yaw: yawP, flap, fold, pitch, bob, scale: 2.0 });
    });
  }

  // ---------------------------------------------------------------- the 3D camera path (N18 · N18b): one continuous move
  // From the cloth view (level, 40 m off) forward and up into the front of the crown, tilting up to its heart (the crane, 6 s,
  // inside N18), then — slowing all the way — on up and back out over the crown until the whole lit tree lies below the eye.
  // Positions and look targets are C1 Hermite splines on chord-length knots, so the speed is the profile's speed alone.
  // speed: up from rest over 2.2 s, steady to the crown at the crane's end, then easing to rest at the end of the shot
  let SIG = null;
  function buildSigma() {
    const a = T.crane[0], b = T.crane[1], e = T.end + .2, ramp = 2.2, vA = LEN_A / (ramp / 2 + (b - a - ramp)), dB = 2 * (LEN - LEN_A) / vA;
    const N = 2400, dt = (e - a) / N; SIG = { a, dt, v: new Float32Array(N + 1) }; let sg = 0;
    for (let k = 0; k <= N; k++) { SIG.v[k] = Math.min(sg, LEN); const t = a + k * dt;
      const v = t < b ? vA * ss(a, a + ramp, t) * (t < a + ramp ? 1 : 1) : vA * (1 - ss(b, b + dB, t)); sg += v * dt; }
    // the ramp's smoothstep makes the crane end a hair early or late: rescale so the crane ends exactly at its key
    const kb = Math.round((b - a) / dt), sb = SIG.v[kb]; for (let k = 0; k <= N; k++) SIG.v[k] = k <= kb ? SIG.v[k] * LEN_A / sb : LEN_A + (SIG.v[k] - sb) * (LEN - LEN_A) / Math.max(1e-6, SIG.v[N] - sb);
  }
  const sigma = t => { if (!SIG) buildSigma(); const k = (t - SIG.a) / SIG.dt; if (k <= 0) return 0; const i = Math.min(SIG.v.length - 2, Math.floor(k)), f = k - i; return lerp(SIG.v[i], SIG.v[i + 1], clamp(f)); };
  function pathPos(u) { return herm(KP, u * LEN); }
  const camU = t => T ? clamp(sigma(t) / LEN) : 0;
  function setView(view) {   // the cloth camera with the 2D zoom of the shadow play as a view offset (screen = c + (p − a)·s)
    cam.position.copy(CLOTH.pos); cam.up.set(0, 1, 0); cam.lookAt(CLOTH.pos.x, CLOTH.pos.y, CLOTH.pos.z - 10); cam.fov = FOV;
    const v = view || { s: 1, ax: W / 2, ay: H / 2, cx: W / 2, cy: H / 2 };
    cam.setViewOffset(W, H, v.ax - v.cx / v.s, v.ay - v.cy / v.s, W / v.s, H / v.s); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  }
  function setPath(t) {
    const u = camU(t), P = herm(KP, u * LEN), Tg = herm(KT, u * LEN);
    cam.clearViewOffset(); cam.position.copy(P); cam.up.set(0, 1, 0); cam.lookAt(Tg); cam.fov = FOV; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    camTgtDist = P.distanceTo(Tg); return u;
  }
  let camTgtDist = 40;

  function common(t) {
    if (!T) return;
    U.uG.value = growth(T, t); U.uT.value = t;
    { const k = clamp((t - T.devS[0]) / (T.devS[1] - T.devS[0])); DEV.uDevOn.value = t < T.devS[1] + .4 ? 1 : 0; DEV.uDev.value = lerp(-.06, 1.12, k * k * (3 - 2 * k) * .35 + k * .65); }
    // the sun: at the lamp's place, then down behind the hills under N18b
    const dk = ss(T.dusk[0], T.dusk[1], t), el = lerp(Math.asin(SUN0.y), -.035, dk);
    sunDir.set(0, Math.sin(el), -Math.cos(el)).normalize();
    sky.u.sunDir.value.copy(sunDir);
    sky.u.top.value.copy(col('#7c8fb0', .62)).lerp(col('#2c3a64', .5), dk); sky.u.mid.value.copy(col('#e7b585', 1.0)).lerp(col('#8a6a8a', .55), dk);
    sky.u.horizon.value.copy(col('#ffd59c', 1.75)).lerp(col('#f09a62', 1.0), dk); sky.u.sunGlow.value.copy(col('#ffc47c', 1.9)).lerp(col('#ff8a4a', 1.3), dk);
    sky.u.sunColor.value.copy(col('#fff4dc', 30)).multiplyScalar(1 - dk * .9);
    // the shadow-casting sun stays where it is: if the shadow map turned with the setting sun, every texel edge would crawl from frame
    // to frame (round 2: '그림자가 덜덜거린다'); the sun in the sky goes down, the shadows only fade with its light
    sunL.position.copy(SUN0).multiplyScalar(300); sunL.target.position.set(0, 0, 0); sunL.intensity = 3.0 * (1 - dk * .85); sunL.color.copy(col('#ffd29a')).lerp(col('#ff9a5a'), dk);
    hemi.intensity = lerp(.5, .28, dk);
    sunLamp.pos.copy(sunDir).multiplyScalar(1500).add(cam.position); sunLamp.power = lerp(1900, 700, dk);
    film.atmos.color.copy(col('#e6b07a', .78)).lerp(col('#7a5a6a', .42), dk); film.fogU.uFogColor.value.copy(film.atmos.color);
    film.fogU.uFogColorUp.value.copy(col('#d7b896', .62)).lerp(col('#4a4a6e', .35), dk);
    LU.uSunV.value.copy(sunDir).transformDirection(cam.matrixWorldInverse); LU.uSunC.value.copy(col('#ffcf8a', 1)).lerp(col('#ff8a50', .5), dk);
    // lamps
    LMP.forEach((l, i) => { const k = lampOn(l, t); lampMesh.setColorAt(i, new THREE.Color(1.0, .62, .26).multiplyScalar(k * 14)); });
    lampMesh.instanceColor.needsUpdate = true;
    glows.forEach(g => { g.L.power = g.l ? lampOn(g.l, t) * (g.l.first ? 7 : 2.2) : 0; });
    birdsAt(t);
  }

  function lit(t, view) {
    if (!T) return film.canvas;
    if (view) setView(view); else setPath(t);
    common(t);
    // focus: far while level, onto the near branches going up, the crown at the end
    const u = view ? 0 : camU(t);
    film.dofCfg.focus = view ? 40 : Math.min(40, camTgtDist); film.dofCfg.aperture = view ? .4 : lerp(.4, 1.5, ss(.15, .5, u)) * (1 - .45 * ss(.75, 1, u));
    film.look.exposure = .92 + .25 * ss(T.dusk[0], T.dusk[1], t);
    film.render(t);
    return view ? film.canvas : firstHalos(t, film.canvas);
  }
  function sil(t, view) {
    if (!T) return silR.domElement;
    if (view) setView(view); else setPath(t); common(t);
    silR.setClearColor(0xffffff, 1); silR.clear(); silR.render(silS, cam);
    return silR.domElement;
  }
  const trunkSegs = TREE.segs.slice(0, 3), forkS = trunkSegs[2].s1;
  function trunkTip(G) { let g = trunkSegs[0]; for (const q of trunkSegs) if (G > q.s0) g = q; const e = clamp((G - g.s0) / (g.s1 - g.s0)); return g.a.clone().lerp(g.b, e); }
  function project(p, view) { if (view) setView(view); else setPath(_t); const v = p.clone().project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; }
  // where the cloth (the plane of the trunk, z = 0) lands on screen while the 3D camera starts to move: a similarity from two
  // points, so the 2D cloth layers stay locked to the developing 3D picture (screen = c + (p − a)·s)
  const clothPt = (X, Y) => V((X - W / 2) / F_PX * CLOTH.pos.z, CLOTH.pos.y - (Y - H / 2) / F_PX * CLOTH.pos.z, 0);
  let _t = 0;
  function clothView(t) { _t = t; const A = project(clothPt(540, 1079), null), Bp = project(clothPt(540, 300), null);
    return { s: Math.hypot(Bp[0] - A[0], Bp[1] - A[1]) / 779, ax: 540, ay: 1079, cx: A[0], cy: A[1] }; }

  return {
    film, lit, sil, project, clothView, beats: B => { T = beats(B); SIG = null; rankLamps(); return T; }, G: t => (T ? growth(T, t) : 0), T: () => T,
    perch: perch.map(p => p.p.clone()), seed: V(0, 0, 0), sunPx: [540, 640], camU, trunkTip, forkS, sunL,
    firstAt: t => { setPath(t); return LMP.filter(l => l.first).map(l => { const q = l.p.clone().project(cam); return { rank: l.rank, on: +lampOn(l, t).toFixed(2), x: Math.round((q.x + 1) / 2 * W), y: Math.round((1 - q.y) / 2 * H), d: +l.p.distanceTo(cam.position).toFixed(1), occ: blocked(l.p) }; }); },
    firstPicked: () => [firstPicked, pickDbg],
    stats: { segs: TREE.segs.length, kept: segsK.length, leaves: NL, lamps: LMP.length, perch: perch.length },
  };
}
