// pentecost3d.js — 「kingdom」 8부 「오순절」 N170–N172 (film 961.0 → 977.0, batch 10-3 B: rounds/r10-pilot/batch3.md).
// N170 "약속하신 대로 성령이 오신 날, / 여종 앞에서 떨던 그 베드로가 일어나 예수님을 전했습니다."
// N172 "그날, 삼천 명이 세례를 받았습니다. / 사람을 취하리라던 그 말씀대로."   (next: N173 at 977, bread outside a door, warm light)
// One 3D Jerusalem morning, one world: a stepped street (the pilgrim road) climbing toward the sun and the temple's bulk in the haze,
// a small square on it where the crowd stands below a landing, and at the bottom of the city a stepped pool.
// Light is the subject: the street starts in cool cloud-shadow; the sun comes out and a front of warm light runs down the street like
// a gust (walls, treads and the air light up behind it; dust glows only inside it; cloth awnings stir as it passes). No flames, no dove.
// Skills read first (rules.json skills-first; nothing edited at the source):
//   motion-skills/cinematic-3d (lib3d/cine.js + kit.js: height fog with lamp in-scatter, bloom, DOF, AgX, grain) ·
//   cinecode/references/camera-moves.md ("push in", "dolly in", "crane up") · canvas-film/references/BODY-CHECK.md (people3d.js
//   two-bone IK, planted feet, elbows down/out) · canvas-film/references/SCENE-RULES.md, LESSONS.md, STYLE-INDEX.md.
// Copied (source comments at each place): heal-village.js plastered-wall shader; lake-peter3d-b.js rimify (here patch()), tiedHead,
//   dressMan, peter(), person(), corona(), godRays(); galilee3d.js via lake: the lens overlays.
// Film refs: 「벤허」(1959) the low sun and dust in stone streets; 「아라비아의 로렌스」 cloud shadow running across the land (the front);
//   「쉰들러 리스트」/「대부」 high top shots of crowds gathering (shot 3); Tissot / Doré's Siloam for the stepped pool.
// Shots (every time from beats(B), B = script.json line times; N170b = the second piece of N170 through Film.pieces):
//   s1 N170 → N170b   push in, low in the lower street toward the sun: cool shadow; the sun comes out (top left) and the light front
//                     runs down the street (≈ 45 m/s), past three walkers and two men at their doors, who lift their heads to it;
//                     far up the street the crowd in the square and one small figure on the landing above them (Peter)
//   s2 N170b → N172   dolly in over the heads of the crowd (soft, dark) toward Peter on the landing, small and backlit, the sun up-left of
//                     him: he straightens from a bowed stance (일어나), then his right arm rises once, slowly; a second, gentler band of
//                     light passes from him over the crowd toward the lens; the light and the god rays grow
//   s3 N172 → N173    crane up, high over the stepped pool at the bottom of the city (pitch 57°, the pool's long axis tilted like the hull
//                     in part 1's net shot ~u 26–29): people come down five streets from all sides and fill the steps from the water up,
//                     ring by ring — the full net; in the water men are baptised (a dip, a ring on the water); Peter's indigo head cloth
//                     among those in the water. Ends warm and bright for N173.
// Rules kept: Peter = broad shoulders, indigo tied head cloth #3b4f6b, undyed tunic #a58f6f, rope belt, short beard; small/backlit;
// no close-up hands or faces; Jesus not in this block; men only in the crowds of s1/s2 (Acts 2:14), no long hair; no blood; no words
// in the art; fixed dither (film.frame frozen); everything a pure function of t; clean cuts (no dissolve ghosts).
// Sound cue table (film seconds, from the default script times; all derive from beats()):
//   961.0  cool street, low wind, a few far voices of the square (bed, to 964.2)
//   961.1  the sun comes out: a soft swell (0.9 s)
//   961.2  the light front: a rising gust of wind down the street, 3.0 s, passing the lens at ≈ 963.7 (whoosh past, cloth flaps 963.0–964.0)
//   963.0  the walkers' footsteps on stone (until the cut), two men turn (cloth rustle 963.4, 963.7)
//   964.2  CUT — the square: crowd murmur hushes (0.8 s)
//   964.4  Peter straightens (cloth, 1.3 s) · 965.9 his arm rises (sleeve rustle, 1.9 s) · 965.4–968.6 the second band of wind over the crowd
//   966–970 the light swells (tone rises under the voice)
//   970.0  CUT — high over the pool: many footsteps from all sides, water lapping; 970.6, 971.6, 972.5, 973.4, 974.3, 975.2, 976.0 baptism
//          dips (water: a soft plunge + ring, ≈ 1.2 s each); the crowd thickens to 977.0
// API: const PC = await (await import('./pentecost3d.js')).build(W, H); T = beats(B); PC.draw(ctx, t, T)  ·  PC.probe(t, T) · PC.joints(t, T)
import { Film, THREE, V, col, rng, GLSL } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const D2R = Math.PI / 180;
const hsh = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const yawTo = d => Math.atan2(-d.x, -d.z);   // a figure faces −z: the root yaw that makes him face world direction d

// ---------------------------------------------------------------- the street: a stepped road climbing toward −z (the sun's side)
const ZS0 = -10, RISE = .16, RUN = 1.6, ZST0 = -48.2, ZST1 = -50.6, NST = 6;
const hS = z => RISE * Math.floor(Math.max(0, ZS0 - z) / RUN);
const Y0ST = hS(ZST0 + 1e-6), PLAT = Y0ST + 2.1;   // fix 2: a taller stair, Peter higher against the sky
const gY = z => z > ZST0 ? hS(z) : z > ZST1 ? Y0ST + Math.ceil((ZST0 - z) / ((ZST0 - ZST1) / NST) - 1e-9) * (PLAT - Y0ST) / NST : Math.max(hS(z), PLAT);
const PLZ = z => ss(-26, -30, z) * (1 - ss(-49.6, -50.8, z));   // the square: the street widens
const halfW = z => 3.6 + 4.9 * PLZ(z);
const PETER = V(-.5, PLAT, -52.2);
// the sun up the street and to the left: it rakes the right-hand walls (the front reads on them) and backlights Peter from his left
const SUN1 = V(Math.sin(-22 * D2R) * Math.cos(16 * D2R), Math.sin(16 * D2R), -Math.cos(22 * D2R) * Math.cos(16 * D2R));   // fix 1: lower, so Peter stands against the bright sky near the sun
// ---------------------------------------------------------------- the pool (shot 3), far from the street (fog hides one from the other)
const PO = V(0, 0, 640), PSI = 14 * D2R, NR = 6, A0 = 7.4, B0 = 4.1, DR = .85, STEP = .3, YW = -(NR * STEP) - .36, YF = YW - .95;
const SUN3 = V(Math.sin(-12 * D2R) * Math.cos(13 * D2R), Math.sin(13 * D2R), -Math.cos(12 * D2R) * Math.cos(13 * D2R));   // fix 1: a low sun beyond the pool — long shadows toward the lens

export function beats(B) {
  const T = { ...B }, c1 = B.N170b, c2 = B.N172, end = B.N173;
  T.shots = [['s1', B.N170, c1], ['s2', c1, c2], ['s3', c2, end]];
  T.t0 = B.N170; T.c1 = c1; T.c2 = c2; T.end = end;
  T.sun = [B.N170 + .05, B.N170 + 1.0];        // the sun comes out of the cloud
  T.fr0 = B.N170;                               // the front: z = −110 at fr0, +45 m/s toward the lens (passes it ≈ fr0 + 2.8)
  T.bow = [c1 + .2, c1 + 1.5];                  // s2: Peter straightens (일어나)
  T.arm = [c1 + 1.5, c1 + 4.0];                 // s2: his right arm rises once
  T.sweep = [c1 + 1.2, c1 + 4.4];               // s2: the second band of light, from him over the crowd to the lens
  return T;
}

export async function build(W, H) {
  const vert = H > W, FOV = vert ? 46 : 32;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .1, far: 3000,
    atmos: { density: .006, falloff: .035, base: 0, start: 2, color: col('#c49a70', .6), colorUp: col('#a8a8b0', .55), max: 2000, scatter: 1, anisotropy: .8, phaseMix: .85 },
    bloom: { strength: .07, radius: 1.1, tint: col('#ffe2b8') },
    dof: { focus: 20, aperture: .6, maxCoc: 18 },
    look: { exposure: 1.0, contrast: 1.05, saturation: 1.0, lift: col('#0a0908'), shadowTint: col('#d0d4e8'), highTint: col('#fff0d8'), vignette: .3, grain: .024, ca: .3 },
  });
  film.canvas.style.display = 'none';
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither: no per-frame shimmer (lake-peter3d-b.js)
  const S = film.scene, cam = film.camera;
  const G = {}; for (const n of ['street', 'pool']) { const g = new THREE.Group(); S.add(g); G[n] = g; }

  // ---------------------------------------------------------------- light
  const sky = K.sky(film, { top: col('#56739f', .6), mid: col('#cfae8e', .95), horizon: col('#ffd39a', 1.6), sunDir: SUN1, sunColor: col('#fff1d4', 18), sunGlow: col('#ffc583', 1.5), clouds: .3, cloudColor: col('#ffe2c0', 1.1), cloudShade: col('#a48a84', .7) });
  const SK = sky.u;
  const hemi = new THREE.HemisphereLight(col('#a8b6cc'), col('#6a5240'), .6); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffd7a2'), 3.2); sunL.castShadow = true; sunL.shadow.mapSize.set(4096, 4096);
  sunL.shadow.bias = -.0004; sunL.shadow.normalBias = .04; S.add(sunL, sunL.target);
  const sunLamp = film.lamp(V(0, 200, -2000), '#ffcf96', { power: 900, size: 6, fog: 1 });
  const frontLamp = film.lamp(V(0, 5, -60), '#ffd49a', { power: 0, size: 7, fog: 1 });
  let shadowKey = '';
  function shadowAt(c, half, dir) { const k = c.x.toFixed(1) + c.z.toFixed(1) + half + dir.x.toFixed(3); if (k === shadowKey) return; shadowKey = k;
    sunL.target.position.copy(c); sunL.position.copy(c).addScaledVector(dir, 400); const sc = sunL.shadow.camera; Object.assign(sc, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 900 }); sc.updateProjectionMatrix(); sunL.target.updateMatrixWorld(); }

  // ---------------------------------------------------------------- one patch for every lit surface: the light front + the rim light
  // The sun's direct light is masked by a front in world space (lit where z < uFront, the edge broken by noise like a cloud shadow's);
  // uShade = how much direct light the shadowed side keeps; the edge itself adds a warm glow (the band). Rim after lake-peter3d-b.js rimify.
  const LU = { uFront: { value: -1e4 }, uEdgeK: { value: 0 }, uEdgeW: { value: 5 }, uEdgeC: { value: col('#ffd8a0', 1) }, uShade: { value: 1 }, uSunV: { value: V(0, 0, -1) }, uRimC: { value: col('#ffb070', 1.15) }, uT: { value: 0 } };
  function patch(m, key, { rim = 0, map = '', wave = false } = {}) {
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, LU); sh.uniforms.uRimS = { value: rim };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLWP; varying vec3 vLWN; uniform float uFront, uEdgeK, uT;')
        .replace('#include <begin_vertex>', wave ? `#include <begin_vertex>
          { vec4 wz = modelMatrix * vec4(position, 1.); float ed = exp(-pow((wz.z - uFront) / 7., 2.)) * uEdgeK;
            transformed.z += (sin(uT * 5.3 + wz.z * 1.3 + wz.x) * .025 + ed * sin(uT * 10.5 + wz.x * 2.1 + wz.z) * .1) * uv.y; }` : '#include <begin_vertex>')
        .replace('#include <project_vertex>', `#include <project_vertex>
          { vec4 lw = vec4(transformed, 1.); vec3 ln = objectNormal;
            #ifdef USE_INSTANCING
            lw = instanceMatrix * lw; ln = mat3(instanceMatrix) * ln;
            #endif
            vLWP = (modelMatrix * lw).xyz; vLWN = normalize(mat3(modelMatrix) * ln); }`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
          varying vec3 vLWP; varying vec3 vLWN; uniform float uFront, uEdgeK, uEdgeW, uShade, uRimS, uT; uniform vec3 uEdgeC, uSunV, uRimC;
          ${GLSL.hash}
          float frontZ(vec3 p){ return p.z + (vnoise(p.xz * .07 + 3.) - .5) * 9. + (vnoise(p.xz * .3 + 9.) - .5) * 2. - p.y * .4; }`)
        .replace('#include <map_fragment>', '#include <map_fragment>\n' + map)
        .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
          { float fz = frontZ(vLWP), lit = 1. - smoothstep(uFront - 3.5, uFront + 3.5, fz), ed = exp(-pow((fz - uFront) / uEdgeW, 2.)) * uEdgeK;
            float sh = mix(uShade, 1., lit); reflectedLight.directDiffuse *= sh; reflectedLight.directSpecular *= sh;
            totalEmissiveRadiance += diffuseColor.rgb * uEdgeC * ed;
            if (uRimS > 0.) { vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 3.2); totalEmissiveRadiance += uRimC * fr * smoothstep(-.2, .55, dot(normal, uSunV)) * uRimS * mix(.25, 1., lit); } }`); };
    m.customProgramCacheKey = () => 'pc-' + key; return m; }
  // plastered fieldstone / mud brick where the plaster fell (heal-village.js wallM, copied; brick courses added)
  const WALL = `{ vec3 N = normalize(vLWN); vec2 q = abs(N.y) > .7 ? vLWP.xz : (abs(N.x) > abs(N.z) ? vLWP.zy : vLWP.xy);
      float big = fbm(q * .35 + 3.1), fine = vnoise(q * 3.1) * .6 + vnoise(q * 7.3) * .4;
      vec3 c = diffuseColor.rgb * mix(.8, 1.1, big) * mix(.9, 1.06, fine);
      vec2 bq = vec2(q.x * 2.3 + floor(q.y * 3.1) * .5, q.y * 3.1); float brick = smoothstep(.0, .08, fract(bq.x)) * smoothstep(.0, .1, fract(bq.y));
      float bare = smoothstep(.5, .6, fbm(q * .45 + 11.)) * (1. - abs(N.y));
      c = mix(c, c * mix(.55, .95, brick) * vec3(1.04, .93, .82), bare * .9);
      c *= mix(1., .82, smoothstep(.62, .8, vnoise(vec2(q.x * 4., q.y * .4))) * (1. - abs(N.y)));
      diffuseColor.rgb = c; }`;
  // limestone treads: slabs across the street, worn paler in the middle where feet go, darker risers
  const PAVE = `{ vec3 N = normalize(vLWN); vec2 q = vLWP.xz; float n = fbm(q * .4), f = vnoise(q * 4.1);
      vec3 c = diffuseColor.rgb * mix(.84, 1.08, n) * mix(.93, 1.05, f);
      { float row = floor(q.y * 1.1), sx = q.x * .7 + h12(vec2(row, 3.)) * 5., slab = floor(sx);
        float jx = smoothstep(.0, .05, fract(sx)) * smoothstep(1., .95, fract(sx)), jz = smoothstep(.0, .06, fract(q.y * 1.1)) * smoothstep(1., .94, fract(q.y * 1.1));
        c *= mix(.86, 1.08, h12(vec2(slab, row))) * mix(.62, 1., jx * jz * step(.7, N.y) + (1. - step(.7, N.y))); }
      c *= mix(1., 1.08, (1. - smoothstep(1.2, 3.2, abs(vLWP.x))) * step(.7, N.y));
      if (N.y < .5) c *= .72;
      diffuseColor.rgb = c; }`;
  const M = {
    wall: patch(K.std('#d8c09c', { roughness: .92 }), 'w1', { map: WALL }), wall2: patch(K.std('#c9a57c', { roughness: .92 }), 'w2', { map: WALL }), wall3: patch(K.std('#e0ccaa', { roughness: .92 }), 'w3', { map: WALL }),
    wall4: patch(K.std('#b8986f', { roughness: .95 }), 'w4', { map: WALL }), wall5: patch(K.std('#d2cabb', { roughness: .9 }), 'w5', { map: WALL }), wall6: patch(K.std('#a8957c', { roughness: .95 }), 'w6', { map: WALL }),
    pave: patch(K.std('#cdb898', { roughness: .9 }), 'pv', { map: PAVE }), ashlar: patch(K.std('#d6c6a6', { roughness: .9 }), 'as', { map: WALL }),
    dark: K.std('#1a120c', { roughness: 1 }), wood: patch(K.std('#5a4028', { roughness: .85 }), 'wd'), roof: patch(K.std('#a8906e', { roughness: .95 }), 'rf'),
    leaf: patch(K.std('#5f6a4a', { roughness: .9 }), 'lf'), trunk: patch(K.std('#4a3a2a', { roughness: .95 }), 'tk'),
  };
  const awnCols = ['#9a6a3a', '#7a3a2a', '#b89a6a', '#4c5a6a', '#8a7a52'].map((c, i) => patch(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'aw' + i, { wave: true }));

  // ---------------------------------------------------------------- the street's ground: one merged mesh of treads (40 m wide, under the houses)
  { const br = new Set([80, ZS0, ZST0, ZST1, -290]); for (let z = ZS0; z > -290; z -= RUN) br.add(+z.toFixed(4)); for (let i = 1; i < NST; i++) br.add(+(ZST0 - i * (ZST0 - ZST1) / NST).toFixed(4));
    const zs = [...br].sort((a, b) => b - a), parts = [];
    for (let i = 0; i < zs.length - 1; i++) { const z0 = zs[i], z1 = zs[i + 1], y = gY((z0 + z1) / 2), g = new THREE.BoxGeometry(46, y + 3, z0 - z1); g.translate(0, (y - 3) / 2, (z0 + z1) / 2); parts.push([g]); }
    const geo = K.mergeGeometries(parts), m = new THREE.Mesh(geo, M.pave); m.receiveShadow = true; m.castShadow = true; G.street.add(m); }

  // ---------------------------------------------------------------- houses on both sides (irregular, plaster and bare brick, doors, awnings)
  const R = rng(7070), boxes = [], beamM4 = [], lampAt = [];
  const addBox = (grp, w, h, d, x, y, z, ry, mat, r = .06) => { const b = new THREE.Mesh(K.roundedBox(w, h, d, r, 2), mat); b.position.set(x, y, z); b.rotation.y = ry; b.castShadow = b.receiveShadow = true; grp.add(b); return b; };
  const archG = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0); return new THREE.ShapeGeometry(s, 10); };
  const glowM = K.glow('#ffb468', 1.5), WALLS = [M.wall, M.wall2, M.wall3, M.wall4, M.wall5, M.wall6];
  for (const sd of [-1, 1]) { let z = 46; while (z > -290) {
      const wz = 3.6 + R() * 4.4, d = 6 + R() * 4, z1 = z - wz, zc = (z + z1) / 2; let hw = 0; for (let k = 0; k <= 6; k++) hw = Math.max(hw, halfW(lerp(z, z1, k / 6)));
      const x0 = sd * (hw + .1 + R() * .9), base = gY(z) - .5, lowZ = zc < -47 && zc > -150, top = gY(z1) + (lowZ ? 2.2 + R() * .7 : 3 + R() * 3.6 + (R() < .3 ? 2.6 : 0)), m = WALLS[(R() * WALLS.length) | 0], ry = (R() - .5) * .06, far = zc < -150;   // fix 1: low houses round the landing — the sky opens behind Peter
      const hg = new THREE.Group(); hg.position.set(x0 + sd * d / 2, 0, zc); hg.rotation.y = ry; G.street.add(hg);
      addBox(hg, d, top - base, wz, 0, (top + base) / 2, 0, 0, m);
      addBox(hg, d + .12, .18, wz + .12, 0, top + .04, 0, 0, M.roof, .04);
      // an irregular roof line: parapets of different heights, a room on the roof, a low dome, beam ends under the roof
      const ph = .25 + R() * .55; for (const s2 of [-1, 1]) addBox(hg, d, ph, .18, 0, top + ph / 2 + .1, s2 * (wz / 2 - .09), 0, m, .04);
      addBox(hg, .18, ph * (.6 + R() * .6), wz, -sd * (d / 2 - .09), top + ph / 2 + .1, 0, 0, m, .04);
      const roofK = lowZ ? .8 + R() * .2 : R();
      if (roofK < .4) { const uw = d * (.35 + R() * .25), ud = wz * (.4 + R() * .3), uh = 2.2 + R() * .8, ux = sd * (d / 2 - uw / 2 - .4) * R(), uz = (R() - .5) * (wz - ud) * .6; addBox(hg, uw, uh, ud, ux, top + uh / 2, uz, 0, m);
        addBox(hg, uw + .1, .14, ud + .1, ux, top + uh + .05, uz, 0, M.roof, .03);
        if (R() < .5) { const dm = new THREE.Mesh(new THREE.SphereGeometry(Math.min(uw, ud) * .38, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), m); dm.position.set(ux, top + uh + .1, uz); dm.castShadow = dm.receiveShadow = true; hg.add(dm); } }
      else if (roofK < .58) { const r0 = Math.min(d, wz) * (.28 + R() * .08), dm = new THREE.Mesh(new THREE.SphereGeometry(r0, 20, 9, 0, Math.PI * 2, 0, Math.PI / 2), m); dm.position.set(sd * .3, top + .1, 0); dm.scale.y = .8; dm.castShadow = dm.receiveShadow = true; hg.add(dm); }
      else if (roofK < .72) { for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const po = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 2.1, 5), M.wood); po.position.set(-sd * (d / 2 - 1.6) + px * .9, top + 1.05, pz * Math.min(1.3, wz / 2 - .4)); po.castShadow = true; hg.add(po); }   // a pergola on the roof (vine poles, slats)
        for (let k = 0; k < 6; k++) { const sl = new THREE.Mesh(new THREE.BoxGeometry(2.0, .06, .08), M.wood); sl.position.set(-sd * (d / 2 - 1.6), top + 2.1, (k / 5 - .5) * Math.min(2.6, wz - .8)); sl.castShadow = true; hg.add(sl); } }
      const fy = gY(zc), fx = -sd * (d / 2 + .012), bn = Math.floor(wz / .55);
      if (R() < .55) for (let k = 0; k < bn; k++) beamM4.push(new THREE.Matrix4().compose(hg.position.clone().add(V(fx - sd * .16, top - .32, (k + .5) * wz / bn - wz / 2).applyAxisAngle(V(0, 1, 0), 0)), new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), Math.PI / 2), V(1, 1, 1)));
      if (wz > 3.8 && R() < .85) { const dw = .9 + R() * .3, dh = 1.8 + R() * .35, arch = R() < .5, door = new THREE.Mesh(arch ? archG(dw, dh + .3) : new THREE.PlaneGeometry(dw, dh), M.dark); door.rotation.y = -sd * Math.PI / 2; const dz = (R() - .5) * (wz - 2.2); door.position.set(fx, fy + (arch ? 0 : dh / 2), dz); hg.add(door);
        if (!arch) addBox(hg, .28, .2, dw + .5, fx + sd * -.08, fy + dh + .1, dz, 0, M.wood, .03);
        else { const ar = new THREE.Mesh(new THREE.TorusGeometry(dw / 2 + .08, .09, 5, 14, Math.PI), m); ar.rotation.y = -sd * Math.PI / 2; ar.position.set(fx - sd * .03, fy + dh + .3 - dw / 2, dz); hg.add(ar); }
        if (!far && zc > -80 && R() < .3 && lampAt.length < 8) { const gl = new THREE.Mesh(new THREE.PlaneGeometry(dw * .7, dh * .5), glowM); gl.rotation.y = -sd * Math.PI / 2; gl.position.set(fx + sd * .25, fy + dh * .3, dz); hg.add(gl); lampAt.push(hg.position.clone().add(V(fx - sd * .4, fy + .9, dz))); } }
      // a wooden balcony, or an outside stair up to the roof
      if (!far && R() < .16) { const bz = (R() - .5) * (wz - 2.4), bwz = Math.min(2.4, wz - 1); addBox(hg, .9, .14, bwz, fx - sd * .45, fy + 3.0, bz, 0, M.wood, .02); for (let k = 0; k <= 4; k++) { const po = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .8, 5), M.wood); po.position.set(fx - sd * .86, fy + 3.45, bz + (k / 4 - .5) * bwz); hg.add(po); } addBox(hg, .06, .06, bwz, fx - sd * .86, fy + 3.85, bz, 0, M.wood, .01); }
      else if (!far && R() < .15 && wz > 4.5) { const nS = Math.max(4, Math.round((top - fy) / .32)); for (let k = 0; k < nS; k++) addBox(hg, .85, (k + 1) * (top - fy) / nS, .34, fx - sd * .43, fy + (k + 1) * (top - fy) / nS / 2, wz / 2 - .3 - k * (wz - .6) / nS, 0, m, .03); }
      for (let k = 0; k < 4; k++) if (R() < .55 && top - fy > 4) { const win = new THREE.Mesh(new THREE.PlaneGeometry(.42, .55), M.dark); win.rotation.y = -sd * Math.PI / 2; win.position.set(fx, fy + 2.9 + R() * (top - fy - 3.8), (R() - .5) * (wz - 1.2)); hg.add(win); }
      if (R() < .4) { const aw = 1.0 + R() * .5, al = Math.min(wz - .6, 2.2 + R() * 1.8), ag = new THREE.PlaneGeometry(al, aw, 10, 4); const awn = new THREE.Mesh(ag, awnCols[(R() * awnCols.length) | 0]);
        awn.rotation.order = 'YXZ'; awn.rotation.y = -sd * Math.PI / 2; awn.rotation.x = -(Math.PI / 2 - .38); awn.position.set(fx - sd * aw * .46, fy + 2.35, (R() - .5) * (wz - al)); awn.castShadow = awn.receiveShadow = true; hg.add(awn);
        // poles to the street (the awning hangs on them)
        for (const e of [-1, 1]) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2.0, 5), M.wood); pl.position.set(fx - sd * aw * .9, fy + 1.0, awn.position.z + e * (al / 2 - .1)); pl.castShadow = true; hg.add(pl); } }
      if (R() < .3) { const jar = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .55, 10), patch(K.std('#9a6a48', { roughness: .9 }), 'jar')); jar.position.set(fx - sd * .3, fy + .27, (R() - .5) * (wz - 1)); jar.castShadow = true; hg.add(jar); }
      boxes.push(hg);
      z = z1 - (R() < .22 ? 1.2 + R() * .9 : 0); } }
  // the landing's low wall behind Peter is the street going on up; beyond the city: the temple's platform and sanctuary in the haze
  { const gt = gY(-290); const pl = new THREE.Mesh(new THREE.PlaneGeometry(900, 700), M.pave); pl.rotation.x = -Math.PI / 2; pl.position.set(0, gt, -640); pl.receiveShadow = true; G.street.add(pl);
    const zt = -560; addBox(G.street, 230, 40, 30, -300, gt + 20 - 6, zt, 0, M.ashlar, .3);
    for (let k = 0; k < 9; k++) addBox(G.street, 3, 4, 3, -410 + k * 28, gt + 36, zt + 14, 0, M.ashlar, .2);   // the colonnade's line along the top, far off
    addBox(G.street, 34, 44, 50, -306, gt + 34 + 22, zt - 60, 0, M.wall5, .4); addBox(G.street, 54, 22, 40, -306, gt + 34 + 11, zt - 40, 0, M.wall5, .4);
    addBox(G.street, 36, 1.2, 52, -306, gt + 34 + 44.6, zt - 60, 0, patch(K.std('#e8d0a0', { roughness: .5, metalness: .3 }), 'tg'), .2); }
  { const bm = new THREE.InstancedMesh(new THREE.CylinderGeometry(.07, .08, .42, 6), M.wood, beamM4.length); beamM4.forEach((q, i) => bm.setMatrixAt(i, q)); bm.castShadow = true; G.street.add(bm); }
  const doorLamps = lampAt.map(p => film.lamp(p, '#ffb466', { power: 0, size: .25, fog: 1 }));
  // olive trees and palms rising behind the roofs (heal-village.js olive/palm, copied)
  const olive = (grp, x, z, h, seed, y0) => { const tr = K.tree({ seed, height: h, trunk: .2, depth: 4, spread: .7, up: .2, twig: 0, mat: M.trunk, layer: 0 }); tr.position.set(x, y0, z); grp.add(tr);
    const r = rng(seed), n = 46, geo = new THREE.IcosahedronGeometry(.55, 0), inst = new THREE.InstancedMesh(geo, M.leaf, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * h * .38, y = y0 + h * (.55 + r() * .35); m4.compose(V(x + Math.cos(a) * rr, y, z + Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, 0)), V(1, .7, 1).multiplyScalar(.7 + r() * .8)); inst.setMatrixAt(i, m4); }
    inst.castShadow = true; grp.add(inst); };
  for (const [x, z, h] of [[-13, -20, 7], [14, -42, 8], [-15, -70, 7.5], [13, -96, 7], [-14, 4, 6.5], [16, -8, 7]]) olive(G.street, x, z, h, (x * 7 + z) | 0, gY(z) + 2.5);
  const palm = (grp, x, z, h, seed, y0) => { const r = rng(seed), segs = [], g = new THREE.Group(); let p = V(x, y0, z), d = V((r() - .5) * .3, 1, (r() - .5) * .3).normalize();
    for (let i = 0; i < 10; i++) { const e = p.clone().addScaledVector(d, h / 10); segs.push(p.x, p.y, p.z, e.x, e.y, e.z, .2 - i * .008, .19 - i * .008); p = e; d.add(V(.02, 0, 0)).normalize(); }
    g.add(new THREE.Mesh(K.tubesGeometry(segs, 7), M.trunk));
    const pm = patch(K.std('#4f6a3c', { roughness: .85, side: THREE.DoubleSide }), 'palm');
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + r(), L = 2.6 + r() * .8, fg = new THREE.PlaneGeometry(L, .45, 8, 1); fg.translate(L / 2, 0, 0);
      const pos = fg.attributes.position; for (let k = 0; k < pos.count; k++) { const u = pos.getX(k) / L; pos.setY(k, pos.getY(k) * (1 - u * .7) - u * u * 1.2); } fg.computeVertexNormals();
      const f = new THREE.Mesh(fg, pm); f.position.copy(p); f.rotation.set(0, a, .35 + r() * .3); f.castShadow = true; g.add(f); }
    grp.add(g); };
  palm(G.street, -12.5, -36, 11, 3, gY(-36)); palm(G.street, 12, -60, 12, 5, gY(-60)); palm(G.street, -11.5, -112, 12, 7, gY(-112));

  // ---------------------------------------------------------------- people (lake-peter3d-b.js: one Peter, tied head cloth, loose robe; person())
  const tunicM = patch(K.std('#2c2219', { roughness: .95, side: THREE.DoubleSide }), 'pt', { rim: 1.2 }), clothM = patch(K.std('#1b2432', { roughness: .95, side: THREE.DoubleSide }), 'pc', { rim: 1.1 });
  const faceM = K.std('#2a1a10', { roughness: 1 }), hairM = K.std('#1c140e', { roughness: 1 }), legM = K.std('#17110c', { roughness: 1 }), ropeM = K.std('#3a2e20', { roughness: 1 });
  const tiedHead = (g, m, beard) => { const U = g.userData, s = U.s, n = U.neck; n.children.slice(1).forEach(o => n.remove(o));   // lake-peter3d-b.js
    const mk = (geo, mt) => { const o = new THREE.Mesh(geo, mt); o.castShadow = o.receiveShadow = true; n.add(o); return o; };
    mk(new THREE.CylinderGeometry(.056 * s, .07 * s, .17 * s, 12), legM).position.set(0, -.005 * s, .012 * s);
    const cap = mk(new THREE.SphereGeometry(.124 * s, 20, 12, 0, 6.283, 0, Math.PI * .56), m); cap.position.set(0, .122 * s, .03 * s); cap.scale.set(.92, 1.04, 1.02);
    const bd = mk(new THREE.TorusGeometry(.116 * s, .014 * s, 6, 28), ropeM); bd.rotation.x = Math.PI / 2; bd.position.set(0, .158 * s, .03 * s); bd.scale.set(.93, 1.02, 1);
    mk(new THREE.LatheGeometry([[.116, .16], [.112, .11], [.097, .055], [.09, .01], [.104, -.04], [.132, -.088]].map(([r, y]) => new THREE.Vector2(r * s, y * s)), 20, Math.PI + .9, Math.PI * 2 - 1.8), m).position.z = .03 * s;
    if (beard) { const b = mk(new THREE.SphereGeometry(.066 * s, 12, 9), hairM); b.position.set(0, .052 * s, -.07 * s); b.scale.set(.92, 1.18, .78); U.beard = b; } };
  const dressMan = (g, { hem = 1, flare = .9 } = {}) => { const U = g.userData, s = U.s, B0 = U.skirtBase, top = .99 * s;   // lake-peter3d-b.js
    for (let i = 0; i < B0.length; i += 3) { B0[i] *= flare; B0[i + 2] *= flare; B0[i + 1] = top - (top - B0[i + 1]) * hem; }
    U.skirt.geometry.attributes.position.array.set(B0); U.skirt.geometry.attributes.position.needsUpdate = true; U.skirt.geometry.computeVertexNormals();
    U.shoulders.children.forEach(o => { if (o.geometry && o.geometry.type === 'LatheGeometry') o.visible = false; });
    U.upper.children.forEach(o => { if (o.geometry && o.geometry.type === 'TorusGeometry') { if (o.geometry.parameters.arc < 6) o.visible = false; else { o.material = ropeM; o.scale.set(1.04, .82, 1.6); } } });
    U.arms.forEach(A => { A.S.x *= .97; A.fo.scale.set(.74, 1, .74); }); };
  const peter = () => { const g = P.robeMan({ h: 1.78, broad: 1.02, mat: tunicM, cloth: tunicM, face: faceM, head: 'cloth' }), U = g.userData; tiedHead(g, clothM, true); dressMan(g, { hem: .84, flare: .92 }); U.legs.forEach(L => { L.shin.material = legM; L.foot.material = legM; }); U.ph = .17; return g; };
  const robeCols = ['#5e4c38', '#4c4032', '#6a5642', '#403628', '#5a4834', '#504436', '#64523e', '#48392b', '#8a7458', '#a08a6a'], mantleCols = ['#8a6a34', '#5e5a34', '#7a3626', '#a89a80', '#5a4030', '#4c4842', '#9a8458', '#6a4a2c', '#7c6a48', '#4c5262', '#c8b89a'];
  const dk = c => new THREE.Color(c).multiplyScalar(.3);   // fix 1: dark backlit bodies, the rim carries the shape
  const robes = robeCols.map((c, i) => patch(K.std(dk(c), { roughness: .95, side: THREE.DoubleSide }), 'r' + i, { rim: 1.3 })), mantles = mantleCols.map((c, i) => patch(K.std(dk(c), { roughness: .95, side: THREE.DoubleSide }), 'm' + i, { rim: 1 }));
  const HEADW = ['cloth', 'cloth', 'bare', 'cloth'];   // (turbans read as tubes at this distance in round 1)
  function man(r) { const base = { mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0], face: faceM, kind: 'stand' };   // lake-peter3d-b.js person(), men only
    // round 2: the same tied head cloth as Peter (cap, band, a fall ending at the shoulder) and a beard; no mantle bell — the draped
    // 'cloth' heads read as hooded nuns in the s2 crowd (shared.md: men must read as men, broad level shoulders)
    const p = P.robeMan({ ...base, h: 1.64 + r() * .18, head: 'cloth', broad: 1.04 + r() * .14 }); tiedHead(p, base.cloth, true); dressMan(p, { hem: .86 + r() * .1, flare: .92 });
    p.userData.legs.forEach(L => { L.shin.material = legM; L.foot.material = legM; }); p.userData.ph = r(); return p; }
  // fix 2: in s2 the crowd is not seen — only its long shadows on the steps (layer 3: drawn by the sun's shadow camera, not by the lens)
  sunL.shadow.camera.layers.enable(3); let crowdL = -1;
  const crowdLayer = n => { if (n === crowdL) return; crowdL = n; for (const p of crowd) p.traverse(o => o.layers.set(n)); };
  const PT = peter(); PT.position.copy(PETER); PT.rotation.y = Math.PI + .45; G.street.add(PT);
  // the crowd in the square, facing him (an aisle kept clear for the s2 camera)
  const crowd = []; { const r = rng(1702); for (let i = 0; i < 400 && crowd.length < 104; i++) { const x = -7.6 + r() * 15.2, z = -47.2 + r() * 16.6;
      if (Math.abs(x - 2.05) < .95 && z > -44.7) continue; if (crowd.some(q => Math.hypot(q.position.x - x, q.position.z - z) < 1.0)) continue;
      if (Math.abs(x) > halfW(z) - .5) continue;
      const p = man(r); p.position.set(x, gY(z), z); p.rotation.y = yawTo(PETER.clone().sub(p.position)) + (r() - .5) * .3; G.street.add(p); crowd.push(p); } }
  // the lower street (s1): three walkers going up toward the square, two men at their doors, one more far up
  const lower = []; { const r = rng(331);
    for (const [x, z, kind, ry] of [[-1.3, 3.4, 'walk', 0], [1.5, 1.2, 'walk', 0], [.3, -4.5, 'walk', 0], [-3.1, 6.8, 'stand', -1.2], [3.2, -1.5, 'stand', 1.6], [-2.6, -12, 'stand', -.6], [2.2, -18, 'walk', 0]]) {
      const p = man(r); p.position.set(x, gY(z), z); p.rotation.y = ry; p.userData.kind = kind; p.userData.z0 = z; p.userData.t0 = -r() * 1.1; G.street.add(p); lower.push(p); } }

  // ---------------------------------------------------------------- dust in the light (few, only where the light is; DOF applies)
  const NMO = 110, moG = new THREE.BufferGeometry(), moP = new Float32Array(NMO * 3), moA = new Float32Array(NMO);
  moG.setAttribute('position', new THREE.BufferAttribute(moP, 3)); moG.setAttribute('aK', new THREE.BufferAttribute(moA, 1));
  const dotM = (size, c) => new THREE.ShaderMaterial({ uniforms: { uPx: { value: H / 1920 * size }, uC: { value: col(c, 1) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,   // lake-peter3d-b.js
    vertexShader: `attribute float aK; varying float vK; uniform float uPx; void main(){ vK = aK; vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = clamp(uPx / -mv.z, 1.5, 22.) * (.6 + aK * .6); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vK; uniform vec3 uC; void main(){ if (vK <= .001) discard; vec2 q = gl_PointCoord - .5; float d = length(q); float a = smoothstep(.5, .08, d); gl_FragColor = vec4(uC * (1. + a * 1.2) * vK, a * vK); }` });
  const motes = new THREE.Points(moG, dotM(30, '#ffe6c0')); motes.frustumCulled = false; G.street.add(motes);
  // the frontZ() of the shader, on the CPU (same noise is not needed: the motes use the plain z with a small per-mote offset)
  function setMotes(t, shot, zF, edK, edW) {
    const z0 = shot === 's1' ? -62 : -58, z1 = shot === 's1' ? 12 : -30, wind = shot === 's1' ? 1.6 : .9;
    for (let i = 0; i < NMO; i++) { const per = 14 + hsh(i, 3) * 8, ph = ((t * wind / per) + hsh(i, 4)) % 1, z = lerp(z0, z1, (hsh(i, 5) + ph * .35) % 1), x = (hsh(i, 6) - .5) * 2 * (halfW(z) - .4) + Math.sin(t * .4 + i) * .2;
      const y = gY(z) + .4 + hsh(i, 7) * 4.2 + Math.sin(t * .6 + i * 1.7) * .15; moP[i * 3] = x; moP[i * 3 + 1] = y; moP[i * 3 + 2] = z;
      const lit = (zF > 1e3 || shot === 's2') ? 1 : 1 - ss(zF - 3.5, zF + 3.5, z), ed = Math.exp(-Math.pow((z - zF) / edW, 2)) * edK, base = shot === 's2' ? .2 : .12;
      moA[i] = clamp((base * lit + (shot === 's1' ? .1 : 0) + ed * .85) * (.5 + .5 * hsh(i, 8)) * Math.sin(Math.PI * ((ph * 3) % 1))); }
    moG.attributes.position.needsUpdate = true; moG.attributes.aK.needsUpdate = true; }

  // ================================================================ shot 3 (fix 2, owner 2026-11-26): under the water, looking up — the rhyme with part 1's net
  // (lake-peter3d-b.js uwA: teal water, shafts from above, the light of the surface; the idea and values copied, nothing imported). The three
  // thousand are never drawn from above: from under the surface we see the bright morning water, and one after another, all over it, people
  // step in — a dark soft hem and legs breaking the surface, a ring of light spreading from each — until the whole surface is alive with rings,
  // the way the net filled with fish. The camera rises slowly toward the light; it ends warm and bright for N173.
  const uw = new THREE.Group(); uw.position.copy(PO); G.pool.add(uw);
  const uwU = { uT: { value: 0 }, uWarm: { value: 0 }, uCam: { value: V() } };
  // the surface from below: Snell's window (bright within ~45° of straight up, the dark mirror outside), wobbling with the waves, caustic veins
  const surfM = new THREE.ShaderMaterial({ uniforms: uwU, side: THREE.DoubleSide,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `varying vec3 vW; uniform float uT, uWarm; uniform vec3 uCam; ${GLSL.hash}
      void main(){ vec3 d = normalize(vW - uCam); vec2 q = vW.xz;
        vec2 wv = vec2(vnoise(q * .5 + vec2(uT * .32, -uT * .2)), vnoise(q * .5 + vec2(-uT * .26, uT * .3) + 7.)) - .5;
        float c = d.y + dot(wv, vec2(.16, .13)), win = smoothstep(.62, .78, c);
        float caus = pow(1. - abs(vnoise(q * 2.7 + wv * 2.4 + uT * .18) * 2. - 1.), 4.) * .55;   // a fine, soft caustic web (the net's cords)
        vec3 sky = mix(vec3(.42, .66, .68), vec3(.95, .78, .55), uWarm) * (.72 + .9 * caus) * (.8 + .4 * smoothstep(.75, .98, c));
        vec3 deep = mix(vec3(.025, .1, .11), vec3(.08, .11, .08), uWarm) * (.8 + .6 * caus);
        float sun = pow(max(0., c), 22.) * (1.2 + 1.4 * uWarm);
        gl_FragColor = vec4((mix(deep, sky, win) + vec3(1., .88, .66) * sun * win) * (.3 + .16 * uWarm), 1.); }` });
  { const g = new THREE.PlaneGeometry(500, 500, 1, 1); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, surfM); m.frustumCulled = false; uw.add(m); }
  // the entries: when and where each one steps in (more and more, all across the surface)
  const NEV = 230, evs = [], LK = V(0, 0, 2);
  { const r = rng(5151); for (let i = 0; i < NEV; i++) { const a = r() * 6.283, rad = 6 + r() * 14, inF = i % 4 !== 0, ex = inF ? (r() - .5) * 7 : Math.cos(a) * rad, ez = inF ? -5.5 + r() * 11.5 : LK.z + Math.sin(a) * rad; if (Math.hypot(ex, ez - 5.6) < 1.4) { i--; continue; } /* three in four inside the lens's narrow footprint on the surface */ evs.push({ x: ex, z: ez, f: r(), ph: r(), yaw: r() * 6.283, sz: .92 + r() * .2, dep: .2 + r() * .35 }); }
    evs.sort((a, b) => a.f - b.f); evs.forEach((e, i) => e.f = i / NEV); }
  const entry = (f, T) => T.c2 - 1.1 + (T.end - T.c2 + .9) * Math.pow(f, .78);
  // rings of light on the surface (instanced quads, additive; the age is a per-instance attribute)
  const ringAge = new THREE.InstancedBufferAttribute(new Float32Array(NEV), 1), ringK = new THREE.InstancedBufferAttribute(new Float32Array(NEV).map((_, i) => .7 + .3 * hsh(i, 9)), 1);
  const ringG = new THREE.PlaneGeometry(1, 1); ringG.rotateX(Math.PI / 2); ringG.setAttribute('aAge', ringAge); ringG.setAttribute('aK', ringK);
  const ringM = new THREE.ShaderMaterial({ uniforms: uwU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `attribute float aAge, aK; varying float vA, vK; varying vec2 vUv; void main(){ vA = aAge; vK = aK; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float uWarm; varying float vA, vK; varying vec2 vUv; void main(){ if (vA <= 0. || vA > 3.) discard; vec2 p = (vUv - .5) * 2.; float d = length(p), R = vA / 3.;
      float w = .045 + .06 * R, f = (1. - R) * (1. - R) * smoothstep(0., .25, vA);
      float ring = exp(-pow((d - R * .95) / w, 2.)) + .55 * exp(-pow((d - R * .7) / (w * 1.3), 2.)) + .3 * exp(-pow((d - R * .45) / (w * 1.6), 2.));
      gl_FragColor = vec4(mix(vec3(.8, 1., .95), vec3(1., .9, .7), uWarm) * ring * f * vK * 1.8, 1.); }` });
  const rings = new THREE.InstancedMesh(ringG, ringM, NEV); rings.frustumCulled = false; rings.renderOrder = 5; uw.add(rings);
  { const mm = new THREE.Matrix4(); evs.forEach((e, i) => { mm.compose(V(e.x, -.04, e.z), new THREE.Quaternion(), V(2.8, 1, 2.8)); rings.setMatrixAt(i, mm); }); }
  // the people stepping in: a dark robe hem and two legs (soft, fogged, never more than that)
  const legDark = new THREE.MeshBasicMaterial({ color: col('#0a2626'), transparent: true, opacity: .82, depthWrite: false }), hemG = (() => { const g = new THREE.SphereGeometry(.26, 16, 10); g.scale(1, .42, .78); g.translate(0, .04, 0); return g; })(),   // the robe floating at the waist: one soft dark lens shape
    _u = 0, legG = new THREE.CylinderGeometry(.07, .05, .56, 8); legG.translate(0, -.28, 0);   // fix 2b: soft, see-through shadows, no blocks
  const legFG = legG; legG.translate(0, 0, 0);
  const hemI = new THREE.InstancedMesh(hemG, legDark, NEV), legL = new THREE.InstancedMesh(legFG, legDark, NEV), legR = new THREE.InstancedMesh(legFG, legDark, NEV);
  for (const o of [legL, legR]) { o.frustumCulled = false; uw.add(o); }   // legs only — a robe blob over them read as jellyfish
  // shafts from the surface (billboards, additive) and a few motes rising
  const NSH = 14, shaftM = new THREE.ShaderMaterial({ uniforms: uwU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float uWarm; varying vec2 vUv; void main(){ float a = smoothstep(0., .5, vUv.x) * smoothstep(1., .5, vUv.x) * pow(vUv.y, 1.6); gl_FragColor = vec4(mix(vec3(.5, .8, .78), vec3(1., .86, .6), uWarm) * a * .16, 1.); }` });
  const shG = new THREE.PlaneGeometry(1, 1); shG.translate(0, -.5, 0); const shafts = new THREE.InstancedMesh(shG, shaftM, NSH); shafts.frustumCulled = false; shafts.renderOrder = 4; uw.add(shafts);
  const shS = Array.from({ length: NSH }, (_, i) => ({ x: (hsh(i, 31) - .5) * 22, z: LK.z + (hsh(i, 32) - .5) * 20, w: .8 + hsh(i, 33) * 1.8, l: 7 + hsh(i, 34) * 6, ph: hsh(i, 35) * 6 }));
  const NUM = 70, umG = new THREE.BufferGeometry(), umP = new Float32Array(NUM * 3), umA = new Float32Array(NUM); umG.setAttribute('position', new THREE.BufferAttribute(umP, 3)); umG.setAttribute('aK', new THREE.BufferAttribute(umA, 1));
  const umotes = new THREE.Points(umG, dotM(20, '#d8fff2')); umotes.frustumCulled = false; uw.add(umotes);
  let ARR = 0, ALIVE = 0;
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler();
  function setUnder(t, T, camW) { let arr = 0, alive = 0;
    evs.forEach((e, i) => { const te = entry(e.f, T), age = t - te; ringAge.setX(i, age); if (age > 0) { arr++; if (age < 3) alive++; }
      // the step in: from above the surface (hidden by it) down through it over ~0.8 s, then a slow wade deeper; the legs stride while moving
      const far = Math.hypot(e.x, e.z - 6) > 4.6;   // legs only away from the lens ("at the edge of sight", in the haze); overhead: rings only
      const k = far ? ss(te - .55, te + .3, t) : 0, wade = ss(te + .2, te + 3, t), y = (1 - k) * 1.25 - e.dep - .3 * wade, fw = .35 * k + .5 * wade, dx = Math.sin(e.yaw) * -fw, dz = Math.cos(e.yaw) * -fw;
      const mv = clamp((1 - k) + (wade > 0 && wade < 1 ? .6 : 0)), sw = Math.sin((t - te) * 5.2 + e.ph * 6) * .32 * mv * (t > te - .6 ? 1 : 0), s = far ? e.sz : 1e-4, qy = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, e.yaw, 0));
      m4.compose(V(e.x + dx, y - .62 * s, e.z + dz), qy, V(s, s, s)); hemI.setMatrixAt(i, m4);
      for (const [L, sd] of [[legL, -1], [legR, 1]]) { const hip = V(sd * .1 * s, 0, 0).applyQuaternion(qy); q4.setFromEuler(e4.set(sd * sw, e.yaw, 0, 'YXZ')); m4.compose(V(e.x + dx + hip.x, y - .62 * s, e.z + dz + hip.z), q4, V(s, s, s)); L.setMatrixAt(i, m4); } });
    ringAge.needsUpdate = true; hemI.instanceMatrix.needsUpdate = legL.instanceMatrix.needsUpdate = legR.instanceMatrix.needsUpdate = true; ARR = arr; ALIVE = alive;
    const cl = camW.clone().sub(PO); shS.forEach((h, i) => { const a = Math.atan2(cl.x - h.x, cl.z - h.z); q4.setFromAxisAngle(V(0, 1, 0), a); m4.compose(V(h.x + Math.sin(t * .2 + h.ph) * .3, 0, h.z), q4, V(h.w, h.l, 1)); shafts.setMatrixAt(i, m4); }); shafts.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NUM; i++) { const per = 8 + hsh(i, 41) * 6, ph = ((t + hsh(i, 42) * per) / per) % 1; umP[i * 3] = cl.x + (hsh(i, 43) - .5) * 9; umP[i * 3 + 1] = -7 + ph * 6.6; umP[i * 3 + 2] = cl.z - 3 + (hsh(i, 44) - .5) * 9; umA[i] = Math.sin(ph * Math.PI) * (.25 + .4 * hsh(i, 45)); }
    umG.attributes.position.needsUpdate = true; umG.attributes.aK.needsUpdate = true; }

  // ================================================================ poses (s1, s2)
  function posePeter(t, T) { const U = PT.userData, s = U.s, id = P.idle(t, .17, { s }), bowK = 1 - ss(T.bow[0], T.bow[1], t), armK = ss(T.arm[0], T.arm[1], t);
    const tg = V(.36, 1.74 + .04 * Math.sin(t * .9), -.37);
    P.pose(PT, { ...id, lean: -.3 * bowK - .03 - .03 * armK, head: [-.34 * bowK + .1 * (1 - bowK), id.head[1] * .5], swing: [id.swing[0] - .1 * bowK, id.swing[1]], hands: [null, tg], handsW: [0, armK] }); }
  function poseCrowd(t) { for (const p of crowd) { const U = p.userData, id = P.idle(t, U.ph, { s: U.s }); P.pose(p, { ...id, head: [.12 + id.head[0], id.head[1]] }); } }
  function poseLower(t, T) { for (const p of lower) { const U = p.userData;
      const tPass = T.fr0 + (U.z0 + 110) / 45, k = ss(tPass - .1, tPass + .9, t);
      if (U.kind === 'walk') { const w = P.walk(p, t, T.t0 + U.t0 - 2, { T: 1.15, L: .55 }); const d0 = P.walk(p, T.t0, T.t0 + U.t0 - 2, { T: 1.15, L: .55 }).dist; const z = U.z0 - (w.dist - d0);
        p.position.set(p.position.x, Math.max(gY(z) - .06, RISE * Math.max(0, ZS0 - z) / RUN - RISE * .5), z); P.pose(p, { ...w, head: [.12 * k, 0] }); }
      else { const id = P.idle(t, U.ph, { s: U.s }), turn = Math.atan2(Math.sin(0 - p.rotation.y), Math.cos(0 - p.rotation.y)); P.pose(p, { ...id, twist: id.twist + turn * .25 * k, head: [.16 * k, turn * .45 * k] }); } } }

  // ================================================================ the shots
  const setCam = (p, l, fov) => { cam.position.copy(p); cam.lookAt(l); if (fov) { cam.fov = fov; cam.updateProjectionMatrix(); } };
  const _c1 = new THREE.Color(), _c2 = new THREE.Color();
  const mixC = (out, a, ka, b, kb, f) => out.copy(_c1.set(a).multiplyScalar(ka)).lerp(_c2.set(b).multiplyScalar(kb), f);
  function streetLight(warm, sunK) {   // warm: 0 cool shadow → 1 warm morning;  sunK: the sun out of the cloud
    const a = film.atmos; mixC(a.color, '#7e8aa4', .5, '#d0a274', .62, warm); mixC(a.colorUp, '#7a88a6', .5, '#b4aca4', .56, warm); a.density = lerp(.0034, .0026, warm); a.falloff = .03; a.base = 0; a.start = 2; a.scatter = 1; a.anisotropy = .8; a.phaseMix = .85; a.max = 2000;
    mixC(hemi.color, '#8c9cc4', 1, '#c4bcaa', 1, warm); mixC(hemi.groundColor, '#4a4440', 1, '#7a5e42', 1, warm); hemi.intensity = lerp(.5, .46, warm);
    sunL.color.set('#ffd7a2'); sunL.intensity = 3.3;
    mixC(SK.top.value, '#4a628c', .6, '#56739f', .62, warm); mixC(SK.mid.value, '#98a0b0', .8, '#d2ae8a', .95, warm); mixC(SK.horizon.value, '#c0b0a0', 1.1, '#ffd39a', 1.6, warm);
    SK.sunColor.value.set('#fff1d4').multiplyScalar(18 * sunK); SK.sunGlow.value.set('#ffc583').multiplyScalar(lerp(.35, 1.6, sunK)); SK.clouds.value = .3;
    mixC(SK.cloudColor.value, '#c8c4c4', .9, '#ffe2c0', 1.1, warm); mixC(SK.cloudShade.value, '#6c6c7c', .7, '#a48a84', .7, warm);
    sunLamp.power = 900 * sunK; const L = film.look; L.exposure = lerp(.9, 1.0, warm); L.saturation = lerp(.86, 1.05, warm); doorLamps.forEach(d => d.power = .9); mixC(L.shadowTint, '#c4cce8', 1, '#d6d2e6', 1, warm); mixC(L.highTint, '#e8ecf4', 1, '#fff0d8', 1, warm); L.contrast = 1.05; L.vignette = .3; }
  function s1(t, T) { G.street.visible = true; G.pool.visible = false; sky.mesh.visible = true; crowdLayer(0); for (const p of lower) p.visible = true; SK.sunDir.value.copy(SUN1); shadowAt(V(0, 3, -24), 62, SUN1);
    const u = (t - T.t0) / (T.c1 - T.t0), sunK = 1, zF = -110 + 45 * (t - T.fr0);
    const warm = lerp(.3, .85, u); streetLight(warm, sunK); LU.uRimC.value.set('#ffc078').multiplyScalar(1.6);
    LU.uFront.value = zF; LU.uShade.value = .1; LU.uEdgeK.value = 1.0; LU.uEdgeW.value = 3.6; LU.uEdgeC.value.set('#ffd8a0');
    frontLamp.pos.set(0, gY(Math.min(zF, 20)) + 3.2, zF); frontLamp.power = 60 * sunK * (1 - ss(14, 30, zF)); frontLamp.size = 8;
    // push in: already moving at the first frame, the same speed to the cut (≈ 1.1 m/s)
    const cz = lerp(15.5, 12.1, u), c = V(lerp(1.2, 1.0, u), gY(cz) + lerp(3.3, 3.45, u), cz), l = V(-3.2, gY(-40) + 1.2, -40);
    setCam(c, l, FOV); film.dofCfg.focus = 13; film.dofCfg.aperture = .45; film.dofCfg.maxCoc = 14;
    posePeter(t, T); poseCrowd(t); poseLower(t, T); setMotes(t, 's1', zF, 1.0, 4.5); motes.visible = true; }
  function s2(t, T) { G.street.visible = true; G.pool.visible = false; sky.mesh.visible = true; crowdLayer(3); SK.sunDir.value.copy(SUN1); shadowAt(V(0, 3, -36), 40, SUN1);
    const u = (t - T.c1) / (T.c2 - T.c1), grow = ss(T.c1, T.c2, t);
    streetLight(1, 1); film.look.exposure = lerp(.76, .86, grow); film.atmos.density = .0017; hemi.intensity = .34; LU.uRimC.value.set('#ffc078').multiplyScalar(1.5 + .5 * grow);
    const zE = lerp(-58, -26, clamp((t - T.sweep[0]) / (T.sweep[1] - T.sweep[0]))), ek = ss(T.sweep[0], T.sweep[0] + .6, t) * (1 - ss(T.sweep[1] - .6, T.sweep[1], t));
    LU.uFront.value = zE; LU.uShade.value = 1; LU.uEdgeK.value = .3 * ek; LU.uEdgeW.value = 3.2; LU.uEdgeC.value.set('#ffdcaa');
    frontLamp.pos.set(PETER.x + .4, PLAT + 2.6, PETER.z - 2.5); frontLamp.power = lerp(5, 13, grow); frontLamp.size = 5;
    // dolly in over the heads, toward him (≈ 0.6 m/s, already moving)
    const cz = lerp(-23.6, -26.2, u), c = V(lerp(1.7, 1.5, u), RISE * (ZS0 - cz) / RUN - RISE * .5 + .95, cz),   /* a smooth ramp, not the treads: no bump per step */ l = V(PETER.x - .9, PLAT - .7, PETER.z);
    setCam(c, l, FOV); film.dofCfg.focus = c.distanceTo(PETER.clone().setY(PLAT + 1.3)); film.dofCfg.aperture = 1.2; film.dofCfg.maxCoc = 20;
    posePeter(t, T); poseCrowd(t); for (const p of lower) p.visible = false; setMotes(t, 's2', zE, .5 * ek, 3.2); motes.visible = true; }
  function s3(t, T) { G.street.visible = false; G.pool.visible = true; sky.mesh.visible = false;
    const u = (t - T.c2) / (T.end - T.c2), warm = ss(T.c2 + 1, T.end, t);
    // under the water (values after lake-peter3d-b.js under(): teal fog, no sun lamp), warming toward the end
    const a = film.atmos; mixC(a.color, '#0e4a50', .2, '#5a5a38', .22, warm); a.colorUp.copy(a.color); a.density = lerp(.05, .04, warm); a.falloff = .001; a.base = 0; a.start = 1.5; a.max = 3000; a.scatter = 0; a.anisotropy = 0; a.phaseMix = 0;
    sunLamp.power = 0; frontLamp.power = 0; doorLamps.forEach(d => d.power = 0); hemi.intensity = .5; uwU.uWarm.value = warm;
    const Lk = film.look; Lk.exposure = lerp(.6, .7, warm); Lk.saturation = 1.06; Lk.contrast = 1.08; Lk.shadowTint.set('#b8e4e0'); mixC(Lk.highTint, '#f0fff8', 1, '#fff0d8', 1, warm); Lk.vignette = .34;
    // rise toward the light: along one line up to the surface, constant log rate (already moving at the cut)
    const dist = 8.6 * Math.exp(Math.log(6.0 / 8.6) * u), pit = 57 * D2R, look = PO.clone().add(V(0, 0, 2)), c = look.clone().add(V(0, -Math.sin(pit) * dist, Math.cos(pit) * dist));
    setCam(c, look, FOV); film.dofCfg.focus = dist * 1.25; film.dofCfg.aperture = 2.4; film.dofCfg.maxCoc = 22;
    uwU.uCam.value.copy(c); uwU.uT.value = t; setUnder(t, T, c); motes.visible = false; }
  const STAGE = { s1, s2, s3 };
  const tmpV = V();
  function render(name, t, T) { LU.uT.value = t; STAGE[name](t, T); cam.updateMatrixWorld();
    sunLamp.pos.copy(cam.position).addScaledVector(SK.sunDir.value, 600); LU.uSunV.value.copy(SK.sunDir.value).transformDirection(cam.matrixWorldInverse); film.render(t); }

  // ---------------------------------------------------------------- the lens, after the frame (lake-peter3d-b.js godRays/corona, copied)
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const gS = mkC(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkC(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) { const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h); const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 175) / 80); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; } gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h); gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 24; i++) { const sc = 1 + i * .05; gbx.globalAlpha = Math.pow(.9, i) * .15; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); } gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.imageSmoothingEnabled = true; ctx.drawImage(gB, 0, 0, W, H); ctx.restore(); }
  function corona(ctx, x, y, I, k, rings2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [r, cA, cB, a] of rings2) { const R0 = r * k * (.8 + .2 * I), g = ctx.createRadialGradient(x, y, 0, x, y, R0); g.addColorStop(0, `rgba(${cA},${Math.min(1, a * I)})`); g.addColorStop(.3, `rgba(${cB},${Math.min(1, a * I * .45)})`); g.addColorStop(1, `rgba(${cB},0)`); ctx.fillStyle = g; ctx.fillRect(x - R0, y - R0, R0 * 2, R0 * 2); } ctx.restore(); }
  const SUN_RINGS = [[16, '255,255,252', '255,246,226', .9], [70, '255,244,214', '255,214,150', .55], [220, '255,214,160', '255,170,96', .24], [560, '255,190,130', '255,150,80', .1]];
  const rayc = new THREE.Raycaster(), _rd = V();
  function sunVis() { let v = 0; const P0 = cam.position, off = [[0, 0], [.012, 0], [-.012, 0], [0, .012], [0, -.012]]; const rt = V(), up = V(0, 1, 0), sd = SUN1.clone(), rgt = V().crossVectors(sd, up).normalize(), u2 = V().crossVectors(rgt, sd);
    for (const [a, b] of off) { _rd.copy(sd).addScaledVector(rgt, a).addScaledVector(u2, b).normalize(); rayc.set(P0, _rd); rayc.far = 900; if (!rayc.intersectObjects(G.street.children, true).some(h => !h.object.isPoints)) v++; } return v / off.length; }
  const project = p => { tmpV.copy(p).project(cam); if (tmpV.z >= 1 || tmpV.z <= -1) return null; return [(tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H]; };
  function blit(ctx) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore(); }
  function draw(ctx, t, T) {
    const sh = T.shots.find(s => t >= s[1] && t < s[2]) || (t < T.shots[0][1] ? T.shots[0] : T.shots[T.shots.length - 1]), nm = sh[0];
    render(nm, t, T); blit(ctx);
    if (nm === 's1' || nm === 's2') { const q = project(cam.position.clone().addScaledVector(SUN1, 1500));
      if (q && q[0] > -W * .4 && q[0] < W * 1.4) { const sunK = sunVis(), grow = nm === 's2' ? ss(T.c1, T.c2, t) : 0, arm = nm === 's2' ? ss(T.arm[0], T.arm[1], t) : 0;
        corona(ctx, q[0], q[1], sunK * (nm === 's1' ? .62 : .66 + .26 * grow), nm === 's1' ? .85 : .95 + .15 * arm, SUN_RINGS);
        godRays(ctx, q[0], q[1], sunK * (nm === 's1' ? .28 : .3 + .16 * grow)); } }
    if (nm === 's3') { const k = ss(T.c2 + 2, T.end, t), lg = ctx.createRadialGradient(W * 1.05, -H * .05, 0, W * 1.05, -H * .05, W * 1.1); lg.addColorStop(0, `rgba(255,214,150,${.26 * k + .04})`); lg.addColorStop(.5, `rgba(255,190,120,${.07 * k})`); lg.addColorStop(1, 'rgba(255,170,100,0)');
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  // the checks (no render): the camera + what is being emitted; the bone directions
  function probe(t, T) { const sh = T.shots.find(s => t >= s[1] && t < s[2]) || T.shots[T.shots.length - 1], nm = sh[0]; STAGE[nm](t, T); cam.updateMatrixWorld(); const d = V(); cam.getWorldDirection(d);
    let em = 0; if (nm !== 's3') for (let i = 0; i < NMO; i++) em += moA[i] > .05 ? 1 : 0;
    return { shot: nm, p: cam.position.toArray(), d: d.toArray(), fov: cam.fov, emit: em, arrived: nm === 's3' ? ARR : 0, rings: nm === 's3' ? ALIVE : 0, front: LU.uFront.value }; }
  const PS = { peter: PT, crowd0: crowd[0], crowd7: crowd[7], crowd30: crowd[30], walk0: lower[0], walk1: lower[1], door0: lower[3] };
  function joints(t, T) { const sh = T.shots.find(s => t >= s[1] && t < s[2]) || T.shots[T.shots.length - 1], nm = sh[0]; if (nm === 's3') return {}; STAGE[nm](t, T); const out = {}, Y = V(0, 1, 0);
    for (const [k, g] of Object.entries(PS)) { if (!g || !g.visible) continue; const U = g.userData; if (!U.arms[0].E) continue; const rec = {}; U.arms.forEach((A, i) => { rec['ua' + i] = A.E.clone().sub(A.S2 || A.S).normalize().toArray(); rec['fa' + i] = A.T.clone().sub(A.E).normalize().toArray(); });
      (U.legs || []).forEach((L, i) => { rec['th' + i] = Y.clone().applyQuaternion(L.thigh.quaternion).toArray(); rec['sh' + i] = Y.clone().applyQuaternion(L.shin.quaternion).toArray(); }); rec.neck = [U.neck.rotation.x, U.neck.rotation.y]; rec.up = [U.upper.rotation.x, U.upper.rotation.y]; out[k] = rec; } return out; }
  return { film, draw, probe, joints, render };
}
