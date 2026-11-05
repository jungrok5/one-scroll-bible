// cinematic-3d · kit.js — procedural props for stylized 3D shots. Everything is seeded and built once; animation happens in
// the shot's onFrame(t). Units: metres, y up. Colours are sRGB hex strings (three converts them to linear).
import { THREE, rng, col, V, GLSL, FOG_GLSL } from './cine.js';

// ---------- geometry helpers ----------
// Merge many tapered segments into one BufferGeometry (trees, wires, frames). seg: [ax,ay,az, bx,by,bz, ra, rb]
export function tubesGeometry(segs, sides = 5) {
  const n = segs.length / 8, pos = new Float32Array(n * sides * 2 * 3), nor = new Float32Array(n * sides * 2 * 3), idx = [];
  const a = V(), b = V(), ax = V(), u = V(), w = V(), tmp = V();
  for (let s = 0; s < n; s++) {
    const o = s * 8; a.set(segs[o], segs[o + 1], segs[o + 2]); b.set(segs[o + 3], segs[o + 4], segs[o + 5]);
    const ra = segs[o + 6], rb = segs[o + 7];
    ax.subVectors(b, a).normalize();
    tmp.set(Math.abs(ax.y) < .9 ? 0 : 1, Math.abs(ax.y) < .9 ? 1 : 0, 0);
    u.crossVectors(ax, tmp).normalize(); w.crossVectors(ax, u);
    for (let k = 0; k < sides; k++) {
      const ang = (k / sides) * Math.PI * 2, c = Math.cos(ang), si = Math.sin(ang);
      const nx = u.x * c + w.x * si, ny = u.y * c + w.y * si, nz = u.z * c + w.z * si;
      const i0 = ((s * sides + k) * 2) * 3;
      pos[i0] = a.x + nx * ra; pos[i0 + 1] = a.y + ny * ra; pos[i0 + 2] = a.z + nz * ra;
      pos[i0 + 3] = b.x + nx * rb; pos[i0 + 4] = b.y + ny * rb; pos[i0 + 5] = b.z + nz * rb;
      nor[i0] = nor[i0 + 3] = nx; nor[i0 + 1] = nor[i0 + 4] = ny; nor[i0 + 2] = nor[i0 + 5] = nz;
      const v0 = (s * sides + k) * 2, v1 = (s * sides + (k + 1) % sides) * 2;
      idx.push(v0, v1, v0 + 1, v1, v1 + 1, v0 + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setIndex(idx); return g;
}
// Flat ribbons for segments too thin to need volume (twigs): 2 triangles each, the flat side facing `view` (toward the camera).
export function ribbonsGeometry(segs, view = V(0, 0, 1)) {
  const n = segs.length / 8, pos = new Float32Array(n * 12), nor = new Float32Array(n * 12), idx = new Uint32Array(n * 6);
  const a = V(), b = V(), d = V(), w = V(), vn = view.clone().normalize();
  for (let s = 0; s < n; s++) {
    const o = s * 8; a.set(segs[o], segs[o + 1], segs[o + 2]); b.set(segs[o + 3], segs[o + 4], segs[o + 5]);
    d.subVectors(b, a).normalize(); w.crossVectors(d, vn); if (w.lengthSq() < 1e-6) w.set(1, 0, 0); w.normalize();
    const ra = segs[o + 6], rb = segs[o + 7], p = s * 12;
    pos.set([a.x - w.x * ra, a.y - w.y * ra, a.z - w.z * ra, a.x + w.x * ra, a.y + w.y * ra, a.z + w.z * ra, b.x + w.x * rb, b.y + w.y * rb, b.z + w.z * rb, b.x - w.x * rb, b.y - w.y * rb, b.z - w.z * rb], p);
    for (let k = 0; k < 4; k++) nor.set([vn.x, vn.y, vn.z], p + k * 3);
    idx.set([s * 4, s * 4 + 1, s * 4 + 2, s * 4, s * 4 + 2, s * 4 + 3], s * 6);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}
export function mergeGeometries(list) {   // non-indexed merge of (geometry, matrix, color?) — keeps normals, adds vertex colours
  let total = 0; const parts = list.map(([g, m, c]) => { const gg = (g.index ? g.toNonIndexed() : g.clone()); gg.applyMatrix4(m || new THREE.Matrix4()); total += gg.attributes.position.count; return [gg, c]; });
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), clr = new Float32Array(total * 3); let o = 0;
  for (const [g, c] of parts) {
    const p = g.attributes.position.array, nn = g.attributes.normal.array, cc = new THREE.Color(c || '#ffffff');
    pos.set(p, o * 3); nor.set(nn, o * 3);
    for (let i = 0; i < g.attributes.position.count; i++) { clr[(o + i) * 3] = cc.r; clr[(o + i) * 3 + 1] = cc.g; clr[(o + i) * 3 + 2] = cc.b; }
    o += g.attributes.position.count;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(clr, 3));
  return g;
}
const M = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(sx, sy, sz));
export { M as mat };
// rounded box (bevelled by an extruded rounded rect) — w along x, h along y, d along z, centred
export function roundedBox(w, h, d, r = .05, seg = 3) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y); s.lineTo(x + ww + r, y + hh);
  s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r); s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh);
  s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r * .999, bevelSegments: seg, curveSegments: seg });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals(); return g;
}
export const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, metalness: 0, ...o });
export const glow = (color, k = 1) => new THREE.MeshBasicMaterial({ color: col(color, k) });   // pure emission (HDR: k > 1 blooms)

// ---------- sky ----------
// A dome with a vertical gradient, optional sun disc/glow and soft clouds. Colours are linear and may exceed 1.
export function sky(film, o = {}) {
  const c = Object.assign({ top: col('#05070d', .2), mid: col('#101826', .25), horizon: col('#202838', .35), sunDir: null, sunColor: col('#fff1d0', 20), sunGlow: col('#ffcf8a', 1.2), clouds: 0, cloudColor: col('#ffffff', 1), cloudShade: col('#a0a8c0', .6), radius: 1800, stars: 0 }, o);
  const u = { ...film.fogU, top: { value: c.top }, mid: { value: c.mid }, horizon: { value: c.horizon }, sunDir: { value: (c.sunDir || V(0, -1, 0)).clone().normalize() }, sunColor: { value: c.sunColor }, sunGlow: { value: c.sunGlow }, sunOn: { value: c.sunDir ? 1 : 0 }, clouds: { value: c.clouds }, cloudColor: { value: c.cloudColor }, cloudShade: { value: c.cloudShade }, time: { value: 0 }, stars: { value: c.stars }, skyFogMax: { value: film.atmos.max } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 0.)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.)).xyz, 1.); gl_Position = p.xyww; }`,
    fragmentShader: `varying vec3 vD; uniform vec3 top, mid, horizon, sunDir, sunColor, sunGlow, cloudColor, cloudShade; uniform float sunOn, clouds, time, stars, skyFogMax;
      ${GLSL.hash}
      ${FOG_GLSL}
      void main(){ vec3 d = normalize(vD); float y = d.y;
        vec3 c = mix(horizon, mid, smoothstep(-.02, .22, y)); c = mix(c, top, smoothstep(.2, .9, y));
        if (sunOn > .5){ float s = max(dot(d, sunDir), 0.); c += sunGlow * (pow(s, 8.) * .5 + pow(s, 64.) * 1.5) + sunColor * smoothstep(.99965, .9998, s); }
        if (clouds > 0. && y > 0.){ vec2 p = d.xz / (y + .12) * 1.6 + vec2(time * .01, 0.);
          float n = fbm(p * 1.3) * .7 + fbm(p * 3.7) * .3; float m = smoothstep(.62 - clouds * .25, .85, n) * smoothstep(0., .25, y);
          vec3 cc = mix(cloudShade, cloudColor, smoothstep(.55, .9, n)); if (sunOn > .5) cc += sunGlow * pow(max(dot(d, sunDir), 0.), 6.) * .6;
          c = mix(c, cc, m * .85); }
        if (stars > 0. && y > .1){ vec2 g = floor(d.xz / (y + .3) * 260.); float st = step(.9985, h12(g)); c += vec3(st * stars * h12(g + 3.)); }
        float T = fogT(cameraPosition, d, skyFogMax); c = c * T + fogCol(d) * (1. - T);
        gl_FragColor = vec4(c, 0.); }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(c.radius, 48, 24), m); mesh.frustumCulled = false; mesh.renderOrder = -10;
  film.onFrame((t, f) => { mesh.position.setFromMatrixPosition(f.camera.matrixWorld); u.time.value = t; });
  // the mirror camera must see the sky around itself too: follow whichever camera renders
  mesh.onBeforeRender = (r, s, cam) => { mesh.position.setFromMatrixPosition(cam.matrixWorld); mesh.updateMatrixWorld(); };
  film.scene.add(mesh); return { mesh, u };
}

// ---------- facades with procedural windows ----------
// Works on any box-ish mesh: windows are laid out in world space on every vertical face.
// cell: [width, floor height]; win: [w, h] fraction of the cell; lit: fraction lit; base/top: y range with windows;
// mode 'punched' (masonry with holes) | 'curtain' (glass tower with mullions, reflects sky)
export function facadeMaterial(o = {}) {
  const c = Object.assign({ wall: '#3a3633', roughness: .9, cell: [3.2, 3.1], win: [.42, .58], lit: .25, litColor: col('#ffb25c', 6), litColor2: col('#6fa8ff', 4), cool: .05, glass: col('#0a0d12', 1), base: 3.2, top: 1e4, seed: 1, cluster: .4, mode: 'punched', skyLow: col('#2a3a66', .25), skyHigh: col('#0b1430', .25), ledge: .25, groundShop: 0, shopColor: col('#ffcc88', 5), blinds: .35, flicker: 0, mullion: col('#9aa3b4', .2), sill: col('#8a8278', 1), clusterScale: [.35, .6] }, o);
  const m = new THREE.MeshStandardMaterial({ color: c.wall, roughness: c.roughness, metalness: 0 });
  const U = {
    fCell: { value: new THREE.Vector2(...c.cell) }, fWin: { value: new THREE.Vector2(...c.win) }, fLit: { value: c.lit }, fLitC: { value: c.litColor }, fLitC2: { value: c.litColor2 },
    fCool: { value: c.cool }, fGlass: { value: c.glass }, fBase: { value: c.base }, fTop: { value: c.top }, fSeed: { value: c.seed }, fCluster: { value: c.cluster },
    fCurtain: { value: c.mode === 'curtain' ? 1 : 0 }, fSkyLo: { value: c.skyLow }, fSkyHi: { value: c.skyHigh }, fLedge: { value: c.ledge }, fShop: { value: c.groundShop },
    fShopC: { value: c.shopColor }, fBlinds: { value: c.blinds }, fTime: { value: 0 }, fFlicker: { value: c.flicker }, fMull: { value: c.mullion }, fSill: { value: new THREE.Color(c.sill) }, fClS: { value: new THREE.Vector2(...c.clusterScale) },
  };
  m.userData.u = U;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN; attribute float aSeed;\nflat varying float vSeed;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal); vSeed = aSeed;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWP; varying vec3 vWN; flat varying float vSeed;
      uniform vec2 fCell, fWin; uniform float fLit, fCool, fBase, fTop, fSeed, fCluster, fCurtain, fLedge, fShop, fBlinds, fTime, fFlicker;
      uniform vec3 fLitC, fLitC2, fGlass, fSkyLo, fSkyHi, fShopC, fMull, fSill; uniform vec2 fClS;
      ${GLSL.hash}
      float fWinM, fLitM, fEdge, fRoof; vec3 fEmis; vec2 fCellId, fF;`)
      .replace('#include <map_fragment>', `#include <map_fragment>
      {
        vec3 N = normalize(vWN); fRoof = step(.5, abs(N.y)); fEmis = vec3(0.); fWinM = 0.;
        vec3 T = normalize(vec3(-N.z, 0., N.x) + 1e-5);
        // which face (per-face window seed). Round with a margin: floor(N + 2.) flips per pixel when N is 0 ± float noise
        float faceId = floor(N.x + 1.5) * 5. + floor(N.z + 1.5);
        vec2 q = vec2(dot(vWP, T), vWP.y - fBase);
        fCellId = floor(q / fCell); fF = fract(q / fCell);
        // the building seed is flat and rounded: an interpolated 89.00001 hashes to a different window every pixel
        float seed = mod(fSeed + floor(vSeed + .5) * 17.31 + faceId * 3.7, 289.);
        float inRange = step(0., q.y) * step(vWP.y, fTop) * (1. - fRoof);
        vec2 hw = fWin * .5;
        vec2 dd = abs(fF - .5) - hw;
        float win = inRange * step(dd.x, 0.) * step(dd.y, 0.);
        float edge = inRange * (1. - smoothstep(0., .035, max(dd.x, dd.y) + .035)) * (1. - win);   // reveal around the hole
        fEdge = edge;
        // wall variation: big blotches + floor ledges
        float wv = mix(.8, 1.12, fbm(vWP.xy * .23 + vWP.zy * .19 + seed));
        float ledge = inRange * fLedge * smoothstep(.04, .0, abs(fF.y - .02)) * (1. - fCurtain);
        diffuseColor.rgb *= wv * (1. + ledge * .8) * (1. - edge * .55);
        // sill under each window
        float sill = inRange * (1. - fCurtain) * step(abs(fF.x - .5), hw.x + .03) * smoothstep(.03, .0, abs(fF.y - (.5 - hw.y) + .015));
        diffuseColor.rgb = mix(diffuseColor.rgb, fSill * .5, sill * .6);
        float r = h12(fCellId + seed);
        float cl = vnoise(fCellId * fClS + seed * 1.3) * .75 + vnoise(fCellId * fClS * 3.1 + seed) * .25;
        float fl = h12(vec2(fCellId.y, seed + 3.3));                         // whole floors on or off together
        float lit = step(mix(r, mix(1. - cl, fl, .55) * .85 + r * .15, fCluster), fLit) * win;
        fLitM = lit; fWinM = win;
        if (win > .5){
          vec3 gl = fGlass;
          if (fCurtain > .5){
            vec3 V = normalize(vWP - cameraPosition); vec3 R = reflect(V, N);
            float fr = .04 + .96 * pow(1. - max(dot(-V, N), 0.), 5.);
            gl = mix(fSkyLo, fSkyHi, smoothstep(-.1, .6, R.y)) * (.35 + fr * 1.6) * mix(.7, 1.3, h12(fCellId * 1.3 + seed));
          }
          diffuseColor.rgb = fGlass;
          float kind = h12(fCellId + seed + 9.1);
          vec3 lc = kind < fCool ? fLitC2 : fLitC * mix(vec3(1.), vec3(1.08, .92, .8), h12(fCellId + seed + 4.4));
          float tvf = kind < fCool ? (.75 + .25 * sin(fTime * 9. + r * 40.) * sin(fTime * 3.7 + r * 13.) * fFlicker) : 1.;
          // inside the window: ceiling-lit gradient, a curtain or blind now and then
          vec2 w = (fF - (.5 - hw)) / (2. * hw);
          float grad = mix(.55, 1.15, w.y) * (1. - .35 * pow(abs(w.x - .5) * 2., 2.));
          float bl = step(.75 - fBlinds * .5, h12(fCellId + seed + 2.2));
          float bh = mix(.35, .9, h12(fCellId + seed + 6.1)); float blinds = mix(1., mix(.18, 1., smoothstep(bh + .02, bh - .02, w.y)), bl * step(.5, h12(fCellId + 7.7 + seed)));
          float curtain = mix(1., smoothstep(.0, .25, abs(w.x - .5) * 2. - .45) * .7 + .3, bl * (1. - step(.5, h12(fCellId + 7.7 + seed))));
          float bri = mix(.35, 1.1, h12(fCellId + seed + 1.9));
          fEmis = lit * lc * grad * blinds * curtain * bri * tvf;
          if (fCurtain > .5) fEmis += (1. - lit) * gl;
          if (fCurtain > .5){ float mu = step(.5, max(step(abs(fF.x - .5), .485), 0.)) ; }
        }
        if (fCurtain > .5 && inRange > .5){   // mullions: thin bright frame lines everywhere on a curtain wall
          vec2 e = min(fF, 1. - fF) * fCell;
          float mull = 1. - smoothstep(.02, .06, min(e.x, e.y));
          fEmis = mix(fEmis, fMull, mull * .8); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.12), mull);
        }
        // ground-floor shop windows
        if (fShop > 0. && fRoof < .5 && vWP.y < fBase && vWP.y > .25){
          float sx = fract(dot(vWP, T) / (fCell.x * 2.)); float shopOn = step(1. - fShop, h12(vec2(floor(dot(vWP, T) / (fCell.x * 2.)), seed)));
          float sw = step(abs(sx - .5), .38) * step(vWP.y, fBase - .55) * shopOn;
          fEmis += sw * fShopC * mix(.6, 1., vWP.y / fBase); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.05), sw);
        }
      }`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, .08, fWinM);')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += fEmis;');
  };
  m.customProgramCacheKey = () => 'facade';
  return m;
}
// A box building with its own seed so two buildings never share a window pattern. Returns the mesh (origin at the footprint centre).
export function building({ w = 12, d = 10, h = 20, x = 0, z = 0, ry = 0, mat, seed = 1 }) {
  const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0);
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(seed), 1));
  const m = new THREE.Mesh(g, mat); m.position.set(x, 0, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; return m;
}
export const seeded = (g, seed) => { g.setAttribute('aSeed', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(seed), 1)); return g; };

// ---------- bare trees ----------
// A deciduous winter tree: trunk, recursive branches bending upward, a fine crown of twigs. Returns a Mesh.
export function tree({ seed = 1, height = 9, trunk = .22, depth = 8, spread = .55, up = .35, twig = 4, twigR = .009, minR = .012, droop = 0, lean = 0, color = '#17130f', mat, sides = 5, crown = 1, view = V(0, 0, 1), layer = 2 } = {}) {
  const R = rng(seed), segs = [], mid = [], tw = [];
  const branch = (p, dir, len, r, lvl) => {
    // a branch is a few short segments with a little random bend
    let q = p.clone(), d = dir.clone();
    const n = lvl < 2 ? 4 : 2;
    for (let i = 0; i < n; i++) {
      const bend = V(R() - .5, R() - .5, R() - .5).multiplyScalar(.28 + lvl * .03);
      d.add(bend).add(V(0, up * .15 - droop * lvl * .02, 0)).normalize();
      const e = q.clone().addScaledVector(d, len / n);
      const r1 = Math.max(minR, r * (1 - .25 / n));
      (r < .06 ? mid : segs).push(q.x, q.y, q.z, e.x, e.y, e.z, Math.max(r, minR), r1); q = e; r = r1;
    }
    if (lvl >= depth) {
      for (let k = 0; k < twig; k++) {   // fine twigs at the tips: they make the crown read as a dark lace
        const td = d.clone().add(V(R() - .5, R() - .2, R() - .5).multiplyScalar(1.5)).normalize();
        const e = q.clone().addScaledVector(td, len * (.6 + R() * .7));
        tw.push(q.x, q.y, q.z, e.x, e.y, e.z, twigR, twigR * .6);
      }
      return;
    }
    const kids = lvl === 0 ? 3 + Math.floor(R() * 2) : (R() < .6 ? 2 : 3);
    for (let k = 0; k < kids; k++) {
      const ax = V(R() - .5, 0, R() - .5).normalize();
      const nd = d.clone().applyAxisAngle(ax, spread * (.6 + R() * .8)).add(V(0, up * (lvl < 2 ? .6 : .3), 0)).normalize();
      if (lvl === 0) nd.applyAxisAngle(V(0, 1, 0), (k / kids) * Math.PI * 2 + R());
      branch(q.clone(), nd, len * (.7 + R() * .18), r * (.64 + R() * .1), lvl + 1);
    }
    if (lvl > 0 && lvl < depth - 1 && R() < .5) branch(q.clone(), d.clone(), len * .7, r * .7, lvl + 1);   // a leader keeps going
  };
  const trunkLen = height * (.28 + R() * .1);
  const top = V(lean, trunkLen, 0);
  segs.push(0, 0, 0, top.x, top.y, top.z, trunk, trunk * .78);
  // first branch length so the whole crown (a geometric series of ~.79 per level) ends near `height`
  const k = .79, sum = (1 - Math.pow(k, depth + 1)) / (1 - k);
  branch(top, V(lean * .2, 1, 0).normalize(), (height - trunkLen) / sum * 1.25 * crown, trunk * .75, 0);
  const m = mat || std(color, { roughness: .95 });
  const g = new THREE.Group();
  // trunk and limbs as tubes, thin branches as 3-sided tubes, twigs as flat ribbons facing the camera
  // (rotate the tree with tree.rotation.y? then pass `view` in the tree's own frame)
  const parts = [new THREE.Mesh(tubesGeometry(segs, sides), m), new THREE.Mesh(tubesGeometry(mid, 3), m), new THREE.Mesh(ribbonsGeometry(tw, view), m)];
  for (const p of parts) { p.castShadow = true; p.layers.set(layer); g.add(p); }
  g.userData.segments = (segs.length + mid.length + tw.length) / 8; return g;
}

// ---------- street lamps ----------
// style 'pole' (tall thin pole, small bulb) | 'lantern' (cast-iron post with a glass lantern) | 'arm' (curved arm, hanging head)
export function streetLamp(film, { x = 0, z = 0, h = 6, style = 'pole', color = '#ffd9a0', power = 1, light = 0, distance = 30, shadow = false, bulb = 14, fog = 1, size = .25, poleColor = '#141414' } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pm = std(poleColor, { roughness: .5, metalness: .6 });
  let head;
  if (style === 'lantern') {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.06, .1, h, 8), pm); post.position.y = h / 2; g.add(post);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .6, 8), pm); base.position.y = .3; g.add(base);
    // the cage is six thin iron bars and two rings: the glass glows between them (a solid cage hid the light)
    const bars = [];
    for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI * 2 + Math.PI / 6;
      bars.push(Math.cos(an) * .145, h, Math.sin(an) * .145, Math.cos(an) * .245, h + .5, Math.sin(an) * .245, .012, .012); }
    for (let k = 0; k < 6; k++) for (const [r, y] of [[.145, h], [.245, h + .5]]) { const a0 = (k / 6 + 1 / 12) * Math.PI * 2, a1 = ((k + 1) / 6 + 1 / 12) * Math.PI * 2;
      bars.push(Math.cos(a0) * r, y, Math.sin(a0) * r, Math.cos(a1) * r, y, Math.sin(a1) * r, .015, .015); }
    g.add(new THREE.Mesh(tubesGeometry(bars, 4), pm));
    const cap = new THREE.Mesh(new THREE.ConeGeometry(.3, .25, 6), pm); cap.position.y = h + .62; g.add(cap);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(.235, .135, .48, 6), glow(color, bulb)); lens.position.y = h + .25; g.add(lens);
    head = V(x, h + .25, z);
  } else if (style === 'arm') {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, h, 8), pm); post.position.y = h / 2; g.add(post);
    const curve = new THREE.QuadraticBezierCurve3(V(0, h - .3, 0), V(0, h + .5, 0), V(.9, h + .35, 0));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 12, .04, 6), pm));
    const sh = new THREE.Mesh(new THREE.ConeGeometry(.28, .3, 10, 1, true), std('#1a1a1a', { side: THREE.DoubleSide, roughness: .5 })); sh.position.set(.9, h + .2, 0); g.add(sh);
    const b = new THREE.Mesh(new THREE.SphereGeometry(.11, 12, 8), glow(color, bulb)); b.position.set(.9, h + .06, 0); g.add(b);
    head = V(x + .9, h + .06, z);
  } else {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.045, .07, h, 8), pm); post.position.y = h / 2; g.add(post);
    const b = new THREE.Mesh(new THREE.SphereGeometry(.13, 14, 10), glow(color, bulb)); b.position.y = h + .08; g.add(b);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.06, .16, .1, 10), pm); c.position.y = h + .2; g.add(c);
    head = V(x, h + .08, z);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = false; });
  film.scene.add(g);
  const L = film.lamp(head, color, { power, light, distance, shadow, size, fog });
  return { group: g, lamp: L, head };
}

// overhead wire through points (catenary sag between them)
export function wire(points, { r = .012, sag = .25, color = '#0b0b0b', mat } = {}) {
  const segs = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1], n = 10;
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n;
      const p0 = a.clone().lerp(b, t0); p0.y -= sag * 4 * t0 * (1 - t0);
      const p1 = a.clone().lerp(b, t1); p1.y -= sag * 4 * t1 * (1 - t1);
      segs.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, r, r);
    }
  }
  return new THREE.Mesh(tubesGeometry(segs, 4), mat || std(color, { roughness: .6 }));
}

// ---------- tram ----------
// A 1960s-style city tram: lofted shell (red lower body, cream window band and roof), lit interior with seats and passengers,
// destination sign, headlights. Local axes: +x forward, y up, z across. Length ~14 m. Returns { group, headlights, lights }.
export function tram(film, { seed = 4, length = 14, red = '#9c1414', cream = '#e7dcc4', interior = '#ffcf87', interiorPower = 2.6, passengers = 7, sign = '#ffc35a' } = {}) {
  const R = rng(seed), G = new THREE.Group();
  const L = length, W = 2.45, y0 = .28, ySill = 1.5, yHead = 2.55, yRoof = 3.35;
  const taper0 = L / 2 - 1.7, noseX = L / 2 + .1;
  // plan shape: straight sides, then a rounded nose (the half width shrinks toward noseX)
  const halfW = x => { const n = Math.max(0, (x - taper0) / (noseX - taper0)); return W / 2 * Math.sqrt(Math.max(0, 1 - Math.pow(n, 2.2) * .5)); };
  const xs = []; for (let i = 0; i <= 40; i++) xs.push(-L / 2 + (taper0 + L / 2) * i / 40);
  for (let i = 1; i <= 14; i++) xs.push(taper0 + (noseX - taper0) * i / 14);
  // loft a profile (list of [z,y]) along xs; optional fan cap at the front (and back)
  const loft = (prof, colorAt, cap) => {
    const pos = [], clr = [], idx = []; const n = prof(xs[0]).length;
    xs.forEach((x, i) => {
      prof(x).forEach(([z, y]) => { pos.push(x, y, z); const c = new THREE.Color(colorAt(y)); clr.push(c.r, c.g, c.b); });
      if (i > 0) for (let k = 0; k < n - 1; k++) { const a = (i - 1) * n + k, b = i * n + k; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    });
    if (cap) for (const [end, flip] of [[xs.length - 1, false], [0, true]]) {
      const P = prof(xs[end]); let cy = 0; P.forEach(([, y]) => cy += y / P.length);
      const ci = pos.length / 3; pos.push(xs[end], cy, 0); const c = new THREE.Color(colorAt(cy)); clr.push(c.r, c.g, c.b);
      for (let k = 0; k < n - 1; k++) { const a = end * n + k; flip ? idx.push(ci, a, a + 1) : idx.push(ci, a + 1, a); }
      const a = end * n + n - 1, b = end * n; flip ? idx.push(ci, a, b) : idx.push(ci, b, a);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(clr, 3));
    g.setIndex(idx); g.computeVertexNormals(); return g;
  };
  const body = std('#ffffff', { roughness: .3, metalness: .05, vertexColors: true });
  const skirtLift = x => (x > taper0 ? Math.pow((x - taper0) / (noseX - taper0), 2) * .12 : 0);
  const lowerCol = y => (y < .5 ? '#1a0606' : (y > 1.1 && y < 1.17) ? cream : red);
  // profiles run counter-clockwise seen from the front (+x): right side up = −z … so faces point outward
  const lowerProf = x => { const h = halfW(x), yb = y0 + skirtLift(x); return [[-h, ySill], [-h, yb + .1], [-h + .08, yb], [h - .08, yb], [h, yb + .1], [h, ySill]]; };
  const roofAt = x => yRoof - (x > taper0 ? Math.pow((x - taper0) / (noseX - taper0), 2) * .32 : 0);
  const upperProf = x => {
    const h = halfW(x), top = roofAt(x), r = .5, pts = [[h, yHead], [h, top - r * .7]];
    for (let k = 1; k < 8; k++) { const a = (k / 8) * Math.PI / 2; pts.push([h - r + Math.cos(a) * r, top - r * .7 + Math.sin(a) * r * .7]); }
    for (let k = 7; k >= 1; k--) { const a = (k / 8) * Math.PI / 2; pts.push([-(h - r + Math.cos(a) * r), top - r * .7 + Math.sin(a) * r * .7]); }
    pts.push([-h, top - r * .7], [-h, yHead]); return pts;
  };
  const upperCol = y => (y < 2.8 ? red : cream);
  const lm = new THREE.Mesh(loft(lowerProf, lowerCol, true), body), um = new THREE.Mesh(loft(upperProf, upperCol, true), body);
  G.add(lm, um);
  // glass all round the window band (sides follow the nose curve; the windshield caps the front)
  // the glass carries a warm haze of the lit interior (what makes tram windows read as glowing panes from outside)
  const glassM = new THREE.MeshStandardMaterial({ color: '#d0dae6', roughness: .04, metalness: 0, transparent: true, opacity: .12, depthWrite: false, side: THREE.DoubleSide, emissive: col(interior), emissiveIntensity: interiorPower * .55 });
  const glassG = loft(x => { const h = halfW(x) - .015; return [[h, ySill], [h, yHead], [-h, yHead], [-h, ySill]]; }, () => '#ffffff', false);
  // drop the ceiling quad strip (middle segment) — keep only the two sides
  { const idx = glassG.index.array, keep = []; for (let i = 0; i < idx.length; i += 6) { const k = (i / 6) % 3; if (k !== 1) keep.push(...idx.slice(i, i + 6)); } glassG.setIndex(keep); }
  G.add(new THREE.Mesh(glassG, glassM));
  const wsW = halfW(noseX) * 2;
  const shield = new THREE.Mesh(new THREE.PlaneGeometry(wsW, yHead - ySill), glassM); shield.position.set(noseX - .01, (yHead + ySill) / 2, 0); shield.rotation.y = Math.PI / 2; G.add(shield);
  // cream pillars and rails following the shell
  const pillarM = std(cream, { roughness: .35 });
  const pillar = (x, z, w = .11) => { const p = new THREE.Mesh(new THREE.BoxGeometry(w, yHead - ySill, .06), pillarM); p.position.set(x, (yHead + ySill) / 2, z); G.add(p); return p; };
  const doors = new Set([2, 6]);
  for (let i = 0, x = -L / 2 + .25; x <= taper0 + .1; x += 1.22, i++) for (const s of [-1, 1]) { pillar(x, s * (halfW(x) - .01), doors.has(i) ? .16 : .1); }
  // corner posts of the windshield, slightly raked
  for (const s of [-1, 1]) { const x = noseX - .32, p = pillar(x, s * (halfW(x) - .03), .12); p.rotation.y = s * -.5; }
  const mid = pillar(noseX - .02, 0, .06); mid.rotation.y = Math.PI / 2;
  const railStrip = (y, hgt) => { const g = loft(x => { const h = halfW(x) + .012; return [[h, y - hgt / 2], [h, y + hgt / 2]]; }, () => cream, false); const g2 = loft(x => { const h = halfW(x) + .012; return [[-h, y + hgt / 2], [-h, y - hgt / 2]]; }, () => cream, false); G.add(new THREE.Mesh(g, pillarM), new THREE.Mesh(g2, pillarM)); };
  railStrip(ySill + .035, .07); railStrip(yHead - .04, .08);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(wsW, .08), pillarM); front.position.set(noseX + .005, ySill + .035, 0); front.rotation.y = Math.PI / 2; G.add(front);
  const fh = front.clone(); fh.position.y = yHead - .04; G.add(fh);
  // interior (ends before the nose): bright ceiling panel, low wall below the sills, floor, seats, poles, people
  const inner = new THREE.Group(); G.add(inner);
  const iL = taper0 + L / 2 - .4, ix = (-L / 2 + .2 + taper0 - .2) / 2;
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(iL, .03, W - .5), glow(interior, interiorPower)); ceil.position.set(ix, yHead + .12, 0); inner.add(ceil);
  const ceilSide = std('#e8dcc0', { roughness: .8, emissive: col(interior), emissiveIntensity: .35 });
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(iL, .03, .25), ceilSide); c.position.set(ix, yHead + .08, s * (W / 2 - .22)); c.rotation.x = s * .5; inner.add(c); }
  const wallM = std('#c9b48e', { roughness: .8, emissive: col(interior), emissiveIntensity: .6 });
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(iL, ySill - .9, .04), wallM); w.position.set(ix, (ySill + .9) / 2, s * (W / 2 - .12)); inner.add(w); }
  const floor = new THREE.Mesh(new THREE.BoxGeometry(iL + 1.5, .04, W - .26), std('#2b1e16', { emissive: col(interior), emissiveIntensity: .12 })); floor.position.set(ix + .7, .92, 0); inner.add(floor);
  const endWall = new THREE.Mesh(new THREE.BoxGeometry(.04, yHead - .9, W - .3), wallM); endWall.position.set(-L / 2 + .22, (yHead + .9) / 2, 0); inner.add(endWall);
  // driver's cab: low dark partition, the driver, a small lamp
  const cab = new THREE.Mesh(new THREE.BoxGeometry(.04, .6, W - .6), std('#1b120e')); cab.position.set(taper0 - .1, 1.25, 0); inner.add(cab);
  const cabCeil = new THREE.Mesh(new THREE.BoxGeometry(1.4, .03, 1.2), glow(interior, interiorPower * .45)); cabCeil.position.set(taper0 + .6, yHead + .05, 0); inner.add(cabCeil);
  const seatM = std('#5a1e14', { roughness: .7, emissive: col('#ff7a3a'), emissiveIntensity: .05 });
  const seatXs = []; for (let x = -L / 2 + .9; x < taper0 - .9; x += 1.22) seatXs.push(x);
  for (const x of seatXs) for (const s of [-1, 1]) {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(.5, .12, .82), seatM); seat.position.set(x, 1.38, s * .62); inner.add(seat);
    const bk = new THREE.Mesh(roundedBox(.09, .72, .82, .04, 2), seatM); bk.position.set(x - .25, 1.75, s * .62); bk.rotation.z = .12; inner.add(bk);
  }
  const poleM = std('#c9b38a', { roughness: .3, metalness: .7 });
  for (let x = -L / 2 + 1.5; x < taper0 - .5; x += 2.45) for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, yHead - .95, 6), poleM); p.position.set(x, (yHead + .95) / 2, s * .2); inner.add(p); }
  const hand = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, iL, 6), poleM); hand.rotation.z = Math.PI / 2; hand.position.set(ix, yHead - .05, .35); inner.add(hand);
  const h2 = hand.clone(); h2.position.z = -.35; inner.add(h2);
  const personM = std('#120b08', { roughness: .9 });
  const taken = new Set();
  for (let i = 0; i < passengers; i++) {
    let k, tries = 0; do { k = R.int(0, seatXs.length * 2 - 1); } while (taken.has(k) && ++tries < 50); taken.add(k);
    const x = seatXs[k >> 1], s = k & 1 ? 1 : -1;
    const p = person({ seated: true, seed: seed + i * 7, mat: personM }); p.position.set(x + .02, .98, s * .62); p.rotation.y = (R() - .5) * .5; inner.add(p);
  }
  const stand = person({ seed: 77, mat: personM }); stand.position.set(-L / 2 + 3.6, .94, .05); stand.rotation.y = 2.6; inner.add(stand);
  const driver = person({ seated: true, seed: 99, mat: personM }); driver.position.set(taper0 + .55, .98, .4); inner.add(driver);
  // destination sign (in the roof dome above the windshield), headlights, marker lamp
  const sgnY = yHead + .3;
  const sgn = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .26), glow(sign, 3)); sgn.position.set(noseX + .03, sgnY, 0); sgn.rotation.y = Math.PI / 2; G.add(sgn);
  const signFrame = new THREE.Mesh(new THREE.BoxGeometry(.03, .34, 1.4), std('#121212')); signFrame.position.set(noseX + .012, sgnY, 0); G.add(signFrame);
  const heads = [];
  const lampM = glow('#fff2d8', 60), rimM = std('#b8b8b8', { metalness: 1, roughness: .2 });
  for (const s of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.CircleGeometry(.1, 20), lampM); hl.position.set(noseX + .025, .86, s * .62); hl.rotation.y = Math.PI / 2; G.add(hl);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.11, .022, 6, 20), rimM); rim.position.copy(hl.position); rim.rotation.y = Math.PI / 2; G.add(rim);
    heads.push(hl);
  }
  const mk = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), glow('#ffd9a0', 25)); mk.position.set(noseX + .02, 1.22, 0); G.add(mk);
  const bumper = new THREE.Mesh(roundedBox(.12, .1, wsW + .2, .04), std('#151515', { roughness: .5 })); bumper.position.set(noseX + .04, .66, 0); G.add(bumper);
  // bogies, wheels, roof gear
  const dark = std('#0c0c0c', { roughness: .7 });
  for (const x of [-L / 2 + 2.4, L / 2 - 2.6]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, .36, 1.8), dark); b.position.set(x, .3, 0); G.add(b);
    for (const dx of [-.7, .7]) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .12, 16), dark); w.rotation.x = Math.PI / 2; w.position.set(x + dx, .33, s * .72); G.add(w); }
  }
  const panto = [], px = -1.2, ph = .9;
  panto.push(px - .6, yRoof, 0, px, yRoof + ph * .5, 0, .02, .02, px, yRoof + ph * .5, 0, px - .55, yRoof + ph, 0, .02, .02, px + .6, yRoof, 0, px, yRoof + ph * .5, 0, .02, .02);
  panto.push(px - .55, yRoof + ph, -.6, px - .55, yRoof + ph, .6, .025, .025);
  G.add(new THREE.Mesh(tubesGeometry(panto, 5), dark));
  const roofBox = new THREE.Mesh(roundedBox(3, .25, 1.3, .08), std('#cfc4ad', { roughness: .5 })); roofBox.position.set(2.2, yRoof - .02, 0); G.add(roofBox);
  G.traverse(o => { if (o.isMesh && o.material !== glassM) o.castShadow = true; });
  // interior light that spills through the windows onto the stones
  const lights = [];
  for (const x of [-L / 4, L / 4 - .5]) { const pl = new THREE.PointLight(col(interior), 8 * interiorPower / 2.6, 13, 2); pl.position.set(x, 2.2, 0); G.add(pl); lights.push(pl); }
  film.scene.add(G);
  return { group: G, length: L, heads, lights, noseX, ySign: sgnY };
}

// ---------- people & dogs (silhouette-grade) ----------
// A simple person: coat body, head, legs that walk with phase. seated → no legs, shorter.
export function person({ seated = false, seed = 1, mat, coat = '#1a1512', height = 1.75, hat = false } = {}) {
  const R = rng(seed), g = new THREE.Group(), m = mat || std(coat, { roughness: .9 });
  const s = height / 1.75;
  if (seated) {
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.19 * s, .38 * s, 4, 8), m); torso.position.y = .62 * s; g.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.115 * s, 12, 10), m); head.position.y = 1.04 * s + R() * .04; g.add(head);
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(.42 * s, .14 * s, .34 * s), m); thigh.position.set(.18 * s, .42 * s, 0); g.add(thigh);
    return g;
  }
  const body = new THREE.Group(); g.add(body);
  const coatG = new THREE.CylinderGeometry(.17 * s, .27 * s, .85 * s, 12); coatG.translate(0, 1.0 * s, 0);
  body.add(new THREE.Mesh(coatG, m));
  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(.19 * s, .3 * s, 4, 10), m); chest.position.y = 1.36 * s; body.add(chest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.11 * s, 14, 12), m); head.position.y = 1.66 * s; body.add(head);
  if (hat) { const ht = new THREE.Mesh(new THREE.CylinderGeometry(.13 * s, .13 * s, .08 * s, 12), m); ht.position.y = 1.75 * s; body.add(ht); }
  const legs = [], arms = [];
  for (const sd of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(0, .62 * s, sd * .09 * s);
    const lg = new THREE.Mesh(new THREE.CapsuleGeometry(.065 * s, .5 * s, 3, 8), m); lg.position.y = -.3 * s; leg.add(lg);
    const ft = new THREE.Mesh(new THREE.BoxGeometry(.22 * s, .07 * s, .09 * s), m); ft.position.set(.05 * s, -.6 * s, 0); leg.add(ft);
    g.add(leg); legs.push(leg);
    const arm = new THREE.Group(); arm.position.set(0, 1.47 * s, sd * .22 * s);
    const am = new THREE.Mesh(new THREE.CapsuleGeometry(.055 * s, .5 * s, 3, 8), m); am.position.y = -.3 * s; arm.add(am);
    body.add(arm); arms.push(arm);
  }
  // walk(phase): legs swing, arms counter-swing, body bobs. Faces +x.
  g.userData.walk = (ph, amt = 1) => {
    const a = Math.sin(ph) * .42 * amt;
    legs[0].rotation.z = a; legs[1].rotation.z = -a;
    arms[0].rotation.z = -a * .7; arms[1].rotation.z = a * .7;
    body.position.y = Math.abs(Math.cos(ph)) * .03 * s * amt;
  };
  g.userData.arms = arms; g.userData.legs = legs; g.userData.body = body;
  // pedal(phase): seated on a saddle, legs cycling forward, arms reaching to the bars (faces +x)
  g.userData.pedal = ph => { legs[0].rotation.z = .9 + Math.sin(ph) * .45; legs[1].rotation.z = .9 - Math.sin(ph) * .45; arms[0].rotation.z = arms[1].rotation.z = 1.1; body.position.y = 0; };
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
export function dog({ seed = 2, mat, color = '#14100d', size = 1 } = {}) {
  const g = new THREE.Group(), m = mat || std(color, { roughness: .9 }), s = size;
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.14 * s, .5 * s, 4, 10), m); body.rotation.z = Math.PI / 2; body.position.y = .48 * s; g.add(body);
  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(.07 * s, .18 * s, 3, 8), m); neck.position.set(.36 * s, .62 * s, 0); neck.rotation.z = -.7; g.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.1 * s, 12, 10), m); head.position.set(.45 * s, .74 * s, 0); g.add(head);
  const snout = new THREE.Mesh(new THREE.CapsuleGeometry(.05 * s, .1 * s, 3, 8), m); snout.rotation.z = Math.PI / 2; snout.position.set(.57 * s, .71 * s, 0); g.add(snout);
  for (const sd of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(.04 * s, .1 * s, 6), m); e.position.set(.42 * s, .85 * s, sd * .05 * s); g.add(e); }
  const tail = new THREE.Group(); tail.position.set(-.38 * s, .55 * s, 0); const tl = new THREE.Mesh(new THREE.CapsuleGeometry(.025 * s, .28 * s, 3, 6), m); tl.position.y = .14 * s; tail.add(tl); tail.rotation.z = .9; g.add(tail);
  const legs = [];
  for (const [x, z] of [[.26, .08], [.26, -.08], [-.26, .08], [-.26, -.08]]) {
    const l = new THREE.Group(); l.position.set(x * s, .42 * s, z * s); const lm = new THREE.Mesh(new THREE.CapsuleGeometry(.035 * s, .32 * s, 3, 6), m); lm.position.y = -.2 * s; l.add(lm); g.add(l); legs.push(l);
  }
  g.userData.walk = ph => {
    const a = Math.sin(ph) * .5, b = Math.sin(ph + Math.PI * .5) * .5;
    legs[0].rotation.z = a; legs[3].rotation.z = a; legs[1].rotation.z = -a; legs[2].rotation.z = -a;
    tail.rotation.z = .9 + Math.sin(ph * 2) * .15; g.children[0].position.y = .48 * s + Math.abs(b) * .02;
  };
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// ---------- cars (boxy sedans, optionally snowed in) ----------
export function car({ seed = 1, color = '#2a2e33', snow = 0, length = 4.6, tail = true } = {}) {
  const R = rng(seed), g = new THREE.Group(), L = length, Wd = 1.78;
  // side profile extruded across the width, with bevels → soft edges
  const s = new THREE.Shape();
  const p = [[-L / 2, .32], [-L / 2, .78], [-L / 2 + .25, .86], [-L / 2 + 1.05, .9], [-L / 2 + 1.45, 1.36], [L / 2 - 1.75, 1.38], [L / 2 - 1.15, .92], [L / 2 - .15, .86], [L / 2, .7], [L / 2, .32]];
  s.moveTo(...p[0]); for (let i = 1; i < p.length; i++) s.lineTo(...p[i]); s.lineTo(...p[0]);
  const bodyG = new THREE.ExtrudeGeometry(s, { depth: Wd - .16, bevelEnabled: true, bevelThickness: .08, bevelSize: .06, bevelSegments: 3 });
  bodyG.translate(0, 0, -(Wd - .16) / 2); bodyG.computeVertexNormals();
  const paint = std(color, { roughness: .35, metalness: .3 });
  const bodyM = new THREE.Mesh(bodyG, paint); g.add(bodyM);
  // windows: a dark inset band on the greenhouse
  const ws = new THREE.Shape(); const q = [[-L / 2 + 1.12, .95], [-L / 2 + 1.5, 1.32], [L / 2 - 1.8, 1.33], [L / 2 - 1.22, .95]];
  ws.moveTo(...q[0]); for (let i = 1; i < q.length; i++) ws.lineTo(...q[i]); ws.lineTo(...q[0]);
  const wg = new THREE.ExtrudeGeometry(ws, { depth: Wd + .005, bevelEnabled: false }); wg.translate(0, 0, -(Wd + .005) / 2);
  g.add(new THREE.Mesh(wg, std('#07090c', { roughness: .08, metalness: .2 })));
  for (const [x, z] of [[-L / 2 + .85, 1], [-L / 2 + .85, -1], [L / 2 - .85, 1], [L / 2 - .85, -1]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .22, 18), std('#0a0a0a', { roughness: .8 })); w.rotation.x = Math.PI / 2; w.position.set(x, .33, z * (Wd / 2 - .05)); g.add(w);
  }
  if (tail) for (const z of [-1, 1]) { const tl = new THREE.Mesh(new THREE.BoxGeometry(.04, .1, .32), glow('#ff2a1a', .9)); tl.position.set(-L / 2 - .02, .7, z * .6); g.add(tl); }
  for (const z of [-1, 1]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(.04, .12, .3), std('#c8c8c0', { roughness: .1, metalness: .5 })); hl.position.set(L / 2 + .02, .66, z * .6); g.add(hl); }
  const bump = new THREE.Mesh(roundedBox(.12, .14, Wd + .04, .04), std('#8a8a8a', { metalness: .9, roughness: .3 })); bump.position.set(-L / 2 - .04, .42, 0); g.add(bump);
  const bump2 = bump.clone(); bump2.position.x = L / 2 + .04; g.add(bump2);
  if (snow > 0) {   // snow slabs: roof, hood, trunk, a soft rounded heap
    const sm = std('#e8eef8', { roughness: .95 });
    const slab = (w, d, x, y, th) => { const m = new THREE.Mesh(roundedBox(w, th, d, Math.min(th * .48, .12), 3), sm); m.position.set(x, y + th / 2 - .02, 0); g.add(m); m.scale.y = 1; return m; };
    slab(L - 3.15 + .08, Wd - .02, -L / 2 + 1.45 + (L - 3.2) / 2 - .02, 1.38, .18 * snow);
    slab(1.18, Wd - .05, L / 2 - .6, .9, .14 * snow);
    slab(1.0, Wd - .05, -L / 2 + .55, .88, .14 * snow);
    if (snow > .6) slab(.6, Wd - .3, -L / 2 + 1.25, 1.0, .1 * snow);
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// ---------- skyscraper (stepped tower with crown and aviation lights) ----------
export function skyscraper(film, { x = 0, z = 0, w = 30, d = 30, h = 200, seed = 1, steps = 0, crown = 0, spire = 0, mat, blink = true, redLights = 2 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  let cw = w, cd = d, y = 0; const tiers = steps + 1;
  for (let i = 0; i < tiers; i++) {
    const th = i === 0 ? h * (steps ? .62 : 1) : h * (.38 / steps);
    const b = new THREE.Mesh(seeded(new THREE.BoxGeometry(cw, th, cd), seed + i), mat); b.position.y = y + th / 2; g.add(b);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(cw + .6, .9, cd + .6), std('#1c2029', { roughness: .6 })); rim.position.y = y + th + .45; g.add(rim);
    y += th + .9; cw *= .78; cd *= .78;
  }
  const top = V(x, y, z);
  if (crown) {
    const lit = new THREE.Mesh(new THREE.BoxGeometry(cw * .9, crown, cd * .9), glow('#ffd9a0', 2.2)); lit.position.y = y + crown / 2; g.add(lit);
    const fr = new THREE.Mesh(new THREE.BoxGeometry(cw * .95, .8, cd * .95), std('#20242c')); fr.position.y = y + crown + .4; g.add(fr);
    y += crown + .8;
  }
  const lights = [];
  if (spire) {
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(.35, 1.1, spire, 8), std('#2a2e36', { metalness: .6, roughness: .4 })); sp.position.y = y + spire / 2; g.add(sp);
    for (let k = 0; k < 3; k++) lights.push(V(x, y + spire * (.22 + k * .36), z + 1.4));
    y += spire;
  } else if (redLights) {
    for (let k = 0; k < redLights; k++) lights.push(V(x + (k - (redLights - 1) / 2) * cw * .8, y + .6, z + cd * .3 * (k % 2 ? 1 : -1)));
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, 8, 6), std('#22262e')); mast.position.y = y + 4; g.add(mast); lights.push(V(x, y + 8.2, z));
  }
  const reds = lights.map((p, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), glow('#ff2a2a', 30)); m.position.copy(p).sub(g.position); g.add(m);
    const L = film.lamp(p, '#ff3030', { power: 6, size: .4 });
    return { m, L, ph: (seed * .37 + i * .13) % 1 };
  });
  if (blink) film.onFrame(t => { for (const r of reds) { const on = .25 + .75 * Math.pow(Math.max(0, Math.sin((t * .8 + r.ph) * Math.PI * 2)), 6); r.m.material.color.setRGB(30 * on, 30 * on * .08, 30 * on * .08); r.L.power = 6 * on; } });
  film.scene.add(g);
  return { group: g, top: V(x, y, z) };
}

// ---------- dressed stone ----------
// Coursed ashlar: horizontal courses (course m), staggered joints, per-block tone, rain streaks and grime low down.
export function stoneMaterial({ color = '#c9b48f', course = .42, block = .9, grime = .35, roughness = .85 } = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness });
  const U = { sCourse: { value: course }, sBlock: { value: block }, sGrime: { value: grime } };
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSWP; varying vec3 vSWN;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvSWP = (modelMatrix * vec4(transformed, 1.)).xyz; vSWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vSWP; varying vec3 vSWN; uniform float sCourse, sBlock, sGrime; ${GLSL.hash}`)
      .replace('#include <map_fragment>', `#include <map_fragment>
      { vec3 N = normalize(vSWN); vec3 T = normalize(vec3(-N.z, 0., N.x) + 1e-5);
        vec2 q = vec2(dot(vSWP, T), vSWP.y);
        if (abs(N.y) > .7) q = vSWP.xz;
        float row = floor(q.y / sCourse); vec2 b = vec2(q.x / sBlock + h12(vec2(row, 1.)) , q.y / sCourse);
        vec2 id = floor(b), f = fract(b);
        float joint = 1. - smoothstep(.0, .06, min(min(f.x, 1. - f.x) * sBlock, min(f.y, 1. - f.y) * sCourse) * 4.);
        float tone = mix(.82, 1.12, h12(id + 3.1)) * mix(.9, 1.06, vnoise(q * 1.7));
        float streak = vnoise(vec2(q.x * 6., q.y * .25)) ;
        float grime = sGrime * (smoothstep(4., 0., vSWP.y) * .5 + smoothstep(.55, .9, streak) * .35);
        diffuseColor.rgb *= tone * (1. - joint * .35) * (1. - grime);
      }`);
  };
  m.customProgramCacheKey = () => 'stone';
  return m;
}

// ---------- gothic clock tower ----------
export function clockTower(film, { x = 0, z = 0, h = 46, w = 7, stone = '#c9b48f', roof = '#4a4038', time = [10, 8], seed = 2, spireShare = .45 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const sm = stoneMaterial({ color: stone });
  const dk = std('#3a3028', { roughness: .9 });
  const shaftH = h * (1 - spireShare) * 1.05;   // spireShare: fraction of the height above the shaft (belfry + spire)
  // shaft with buttress strips and string courses
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(w, shaftH, w), sm); shaft.position.y = shaftH / 2; g.add(shaft);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.8, shaftH + 1.5, .8), sm); b.position.set(sx * w / 2, (shaftH + 1.5) / 2, sz * w / 2); g.add(b); }
  for (let k = 1; k < 4; k++) { const sc = new THREE.Mesh(new THREE.BoxGeometry(w + .5, .35, w + .5), sm); sc.position.y = shaftH * k / 4; g.add(sc); }
  // tall lancet windows on the shaft (dark insets)
  const winM = std('#2a241e', { roughness: .6 });
  for (let f = 0; f < 4; f++) for (let k = 0; k < 3; k++) {
    const a = f * Math.PI / 2, yy = shaftH * (.18 + k * .25);
    for (const off of [-.9, .9]) {
      const wm = new THREE.Mesh(new THREE.BoxGeometry(.7, 2.6, .2), winM);
      wm.position.set(Math.sin(a) * (w / 2 + .02) + Math.cos(a) * off, yy, Math.cos(a) * (w / 2 + .02) - Math.sin(a) * off); wm.rotation.y = a; g.add(wm);
      const arch = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, .2, 12, 1, false, 0, Math.PI), winM); arch.rotation.set(Math.PI / 2, 0, a + Math.PI / 2); arch.rotation.order = 'YXZ'; arch.rotation.set(0, a, 0);
      const ar = new THREE.Mesh(new THREE.CircleGeometry(.35, 12, 0, Math.PI), winM); ar.position.copy(wm.position); ar.position.y += 1.3; ar.rotation.y = a; ar.translateZ(.11); g.add(ar);
    }
  }
  // clock stage
  const cy = shaftH + 3.2, cs = w + .6;
  const stage = new THREE.Mesh(new THREE.BoxGeometry(cs, 6.4, cs), sm); stage.position.y = cy; g.add(stage);
  const frameM = std('#b08a3a', { roughness: .35, metalness: .8 });
  const faceM = std('#efe6cf', { roughness: .5 });
  const handM = std('#1b1612', { roughness: .5 });
  for (let f = 0; f < 4; f++) {
    const a = f * Math.PI / 2, fg = new THREE.Group(); fg.rotation.y = a; fg.position.y = cy; g.add(fg);
    const pl = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.2, .5), frameM); pl.position.z = cs / 2 + .05;   // layers ≥ .15 m apart: the mirror's oblique projection leaves little depth precision fg.add(pl);
    const face = new THREE.Mesh(new THREE.CircleGeometry(1.75, 48), faceM); face.position.z = cs / 2 + .45; fg.add(face);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.78, .09, 8, 48), frameM); ring.position.z = cs / 2 + .47; fg.add(ring);
    for (let k = 0; k < 12; k++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(.07, k % 3 ? .2 : .34, .03), handM); const an = k / 12 * Math.PI * 2; tk.position.set(Math.sin(an) * 1.5, Math.cos(an) * 1.5, cs / 2 + .62); tk.rotation.z = -an; fg.add(tk); }
    const hh = new THREE.Mesh(new THREE.BoxGeometry(.11, .9, .04), handM), mh = new THREE.Mesh(new THREE.BoxGeometry(.07, 1.35, .04), handM);
    const ha = -((time[0] % 12) + time[1] / 60) / 12 * Math.PI * 2, ma = -time[1] / 60 * Math.PI * 2;
    hh.geometry.translate(0, .38, 0); mh.geometry.translate(0, .6, 0);
    hh.position.z = cs / 2 + .8; mh.position.z = cs / 2 + .95; hh.rotation.z = ha; mh.rotation.z = ma; fg.add(hh, mh);
    fg.children.forEach(c => { if (c !== pl) c.userData.noShadow = true; });   // hands and ticks would throw long star-shaped shadows at a low sun
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .1, 12), frameM); hub.rotation.x = Math.PI / 2; hub.position.z = cs / 2 + 1; fg.add(hub);
  }
  // belfry with open arches, pinnacles, spire
  const by = cy + 3.2, bh = 6;
  const corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const [sx, sz] of corners) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, bh, 1.2), sm); p.position.set(sx * (w / 2 - .3), by + bh / 2, sz * (w / 2 - .3)); g.add(p); }
  for (let f = 0; f < 4; f++) {
    const a = f * Math.PI / 2;
    for (const off of [-1.2, 0, 1.2]) { const c = new THREE.Mesh(new THREE.BoxGeometry(.35, bh - 1.5, .35), sm); c.position.set(Math.sin(a) * (w / 2 - .3) + Math.cos(a) * off, by + (bh - 1.5) / 2, Math.cos(a) * (w / 2 - .3) - Math.sin(a) * off); g.add(c); }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(w - .2, 1.5, .5), sm); lintel.position.set(Math.sin(a) * (w / 2 - .3), by + bh - .75, Math.cos(a) * (w / 2 - .3)); lintel.rotation.y = a; g.add(lintel);
  }
  const inner = new THREE.Mesh(new THREE.BoxGeometry(w - 2.4, bh, w - 2.4), dk); inner.position.y = by + bh / 2; g.add(inner);
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + .8, .6, w + .8), sm); cornice.position.y = by + bh + .3; g.add(cornice);
  for (const [sx, sz] of corners) {
    const pn = new THREE.Mesh(new THREE.ConeGeometry(.55, 4.2, 4), sm); pn.position.set(sx * (w / 2), by + bh + 2.6, sz * (w / 2)); pn.rotation.y = Math.PI / 4; g.add(pn);
    const pb = new THREE.Mesh(new THREE.BoxGeometry(.9, 1.2, .9), sm); pb.position.set(sx * (w / 2), by + bh + .9, sz * (w / 2)); g.add(pb);
    const fin = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 6), sm); fin.position.set(sx * (w / 2), by + bh + 4.75, sz * (w / 2)); g.add(fin);
  }
  // small gables on each face + the spire
  for (let f = 0; f < 4; f++) { const a = f * Math.PI / 2; const gb = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.6, 4, 1), sm); gb.scale.z = .3; gb.position.set(Math.sin(a) * (w / 2 - .2), by + bh + 1.6, Math.cos(a) * (w / 2 - .2)); gb.rotation.y = a + Math.PI / 4; g.add(gb); }
  const spireH = h - (by + bh + .6);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(w * .3, spireH, 8), sm); spire.position.y = by + bh + .6 + spireH / 2; spire.rotation.y = Math.PI / 8; g.add(spire);
  for (let k = 1; k < 4; k++) { const band = new THREE.Mesh(new THREE.CylinderGeometry(w * .3 * (1 - k / 4) + .12, w * .3 * (1 - k / 4) + .18, .3, 8), sm); band.position.y = by + bh + .6 + spireH * k / 4; band.rotation.y = Math.PI / 8; g.add(band); }
  const fin = new THREE.Mesh(new THREE.CylinderGeometry(.04, .07, 2.2, 6), frameM); fin.position.y = h + 1; g.add(fin);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.18, 10, 8), frameM); ball.position.y = h + .2; g.add(ball);
  // clock details neither cast nor receive: the face is a triangle fan, and shadow acne on a fan shows as radial wedges
  g.traverse(o => { if (o.isMesh) { o.castShadow = !o.userData.noShadow; o.receiveShadow = !o.userData.noShadow; } });
  film.scene.add(g); return g;
}

// gabled houses (a row) — European town fronts
export function gabledHouse({ w = 8, d = 9, h = 10, roofH = 5, wall = '#c7b496', roofC = '#5a4a40', seed = 1, windows = true, mat } = {}) {
  const g = new THREE.Group();
  const wm = mat || std(wall, { roughness: .9 });
  const box = new THREE.Mesh(seeded(new THREE.BoxGeometry(w, h, d), seed), wm); box.position.y = h / 2; g.add(box);
  const s = new THREE.Shape(); s.moveTo(-w / 2 - .3, 0); s.lineTo(0, roofH); s.lineTo(w / 2 + .3, 0); s.lineTo(-w / 2 - .3, 0);
  const rg = new THREE.ExtrudeGeometry(s, { depth: d + .6, bevelEnabled: false }); rg.translate(0, h, -(d + .6) / 2);
  const roof = new THREE.Mesh(rg, std(roofC, { roughness: .8 })); g.add(roof);
  // the gable end wall in the wall colour (slightly inset so the roof overhangs)
  const gs = new THREE.Shape(); gs.moveTo(-w / 2, 0); gs.lineTo(0, roofH - .25); gs.lineTo(w / 2, 0); gs.lineTo(-w / 2, 0);
  const gg = new THREE.ExtrudeGeometry(gs, { depth: d - .02, bevelEnabled: false }); gg.translate(0, h, -(d - .02) / 2);
  g.add(new THREE.Mesh(seeded(gg, seed), wm));
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// ---------- leaves (instanced, tumbling) ----------
// A curved leaf card; returns an InstancedMesh you place each frame with setLeaf(i, pos, rot, scale).
export function leafMesh(count, { colors = ['#d98a2b', '#c4621f', '#e3b13c', '#9c4a1c', '#b8862e'], seed = 5, size = .12 } = {}) {
  const g = new THREE.PlaneGeometry(size * 1.6, size, 6, 3);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); const w = 1 - Math.pow(Math.abs(x) / (size * .8), 2); p.setY(i, y * Math.max(w, .05)); p.setZ(i, (x * x) * 3 - Math.abs(y) * .6); }
  g.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ roughness: .6, side: THREE.DoubleSide });
  const im = new THREE.InstancedMesh(g, m, count); const R = rng(seed);
  for (let i = 0; i < count; i++) im.setColorAt(i, new THREE.Color(R.pick(colors)).multiplyScalar(.7 + R() * .5));
  im.castShadow = true; im.frustumCulled = false; return im;
}
