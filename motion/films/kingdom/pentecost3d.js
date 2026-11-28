// pentecost3d.js — 「kingdom」 8부 「오순절」 N170–N172 (film 973.9 → 989.9 at the 2026-11-28 script): 10-3 test cut A
// (rounds/r10-pilot/council/test-brief.md A · plan.md · bold.md — the stage director's drone start overrides the camera director's).
// N170 "약속하신 대로 성령이 오신 날, / 여종 앞에서 떨던 그 베드로가 일어나 예수님을 전했습니다."
// N172 "그날, 삼천 명이 세례를 받았습니다. / 사람을 취하리라던 그 말씀대로."   (next: N173, bread outside a door, warm light)
// Skills read first (rules.json skills-first; nothing edited at the source): motion-skills/cinematic-3d (lib3d/cine.js + kit.js) ·
//   cinecode camera-moves.md ("crane up", "push in", the drone reveal) · canvas-film BODY-CHECK / SCENE-RULES / LESSONS. Copied with
//   source notes: heal-village.js walls/olive/palm; lake-peter3d-b.js tiedHead/dressMan/peter/person, corona/godRays, the motes; the
//   first-draft aerial's world (git 38392d88 s3 = the still r10-pentecost-still-10.5.jpg, see P4 below).
// Film refs: 「노인을 위한 나라는 없다」 low sun for P3; George Steinmetz's caravans from the air (the body a speck, the shape in the long
//   shadow) and 「간디」's funeral from the air (a crowd as a river) for P4; FPV-drone reveals that skim a crowd and pull up over it.
// Shots (every time from beats(B); c1 = N170's second piece, c2b = N172's second piece):
//   P1 s1  N170 → c1        kept: push in, the stepped street: cool shadow, a front of warm light runs down it, dust only in its band
//   (P2, the bowed wall shadow, is removed — council plan.)
//   P3     c1 → N172        lengthened: telephoto from the foot of the steps, crane up 1.0 → 4.4 m: small upright Peter against the bright
//                           sky (he straightens on 「일어나」, the right arm rises once and goes slowly forward); the square's men before
//                           him as backlit silhouettes, each on his own long shadow (rule shadow-has-caster: no invisible casters); the sun
//                           up-left of him, never behind his head. Last 0.6 s: the
//                           camera pushes forward over the crowd's shadows toward the sun (accelerating into the drone's speed and heading).
//   P4     N172 → N173      the drone over the first draft's world, sun LOCKED at 15° (shadows ≈ 3.7× height, dark-brown and hard):
//                           skim  N172 → c2b      ≈ 5 m up, 35° down, 7 m/s along the street of walkers toward the pool and the sun:
//                                                 backlit dark figures with a thin gold rim, their long shadows streaming at the lens
//                           rise  c2b → c2b+2.0   「사람을 취하리라던」: ease in-out up to the aerial (5 → ≈ 57 m, 35° → 52°, fov 62 → 36),
//                                                 curving onto the first draft's axis; no roll
//                           land  → N173          「말씀대로」: the first-draft framing, still craning up slowly and orbiting 4°; no stop
//                           (motion blur: 5 sub-frames while the camera is fast; no net shape, no rope lines)
// Rules kept: Peter = broad shoulders, tied head cloth, no face, small/backlit; no close heads; no flames, no dove; no words in the
//   art; fixed dither; everything a pure function of t; clean cuts.
// Sound cue table (film seconds at the current script; all from beats()):
//   973.9–977.2  P1 as before: low wind, far voices; the light front a rising gust down the street, cloth flaps
//   977.2  P3: Peter's voice far off, firm (words not intelligible), stone reverb; cloth as he straightens (977.5) · sleeve as the arm rises (978.8)
//   979.5  a low 「아…」 spreads through the crowd; the second band of wind passes down over the steps
//   982.3  the push: wind rising into a rush (0.6 s)
//   982.9  P4: the rush of the drone low over many footsteps, cloth, voices passing under the lens (Doppler, 3.6 s)
//   986.5  「슈욱」: the rush lifts and thins into open air (2.0 s), the footsteps fall away below
//   988.5  the aerial: water lapping, baptisms far below (a soft plunge + ring, 1.2 s), the crowd's murmur as one sound
//   989.6  a chord opens into N173 · 989.9 cut
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
// LOCKED (council plan.md: sun 15–19°, shadows 4–6× height, dark-brown hard shadows; later briefs may not change it): the first draft's
// azimuth (38392d88: −12°, beyond the pool, shadows toward the lens), elevation 15° — the low end of the lock (13° in the first draft)
const SUN_EL = 15, SUN3 = V(Math.sin(-12 * D2R) * Math.cos(SUN_EL * D2R), Math.sin(SUN_EL * D2R), -Math.cos(12 * D2R) * Math.cos(SUN_EL * D2R));

export function beats(B) {
  const T = { ...B }, c1 = B.N170b, c2 = B.N172, end = B.N173;
  T.shots = [['s1', B.N170, c1], ['p3', c1, c2], ['p4', c2, end]];   // 10-3 test: P2 removed, P3 lengthened
  T.t0 = B.N170; T.c1 = c1; T.p3 = c1; T.c2 = c2; T.c2b = B.N172b ?? c2 + 3.6; T.end = end;
  T.push = [c2 - .6, c2];                       // P3's last 0.6 s: the push into the drone
  T.rise = [T.c2b + .1, T.c2b + 2.1];           // 「사람을 취하리라던」: the drone rises (2 s, ease in-out) …
  T.land = T.rise[1];                           // … and lands on the first-draft framing at 「말씀대로」
  T.sun = [B.N170 + .05, B.N170 + 1.0];        // the sun comes out of the cloud
  T.fr0 = B.N170;                               // the front: z = −110 at fr0, +45 m/s toward the lens (passes it ≈ fr0 + 2.8)
  T.bow = [c1 + .3, c1 + 1.3];                  // P3: small Peter straightens on 「일어나」 …
  T.arm = [c1 + 1.7, c1 + 3.1];                 // … his right arm rises once …
  T.fwd = [c1 + 3.1, c1 + 5.1];                 // … and goes slowly forward
  T.sweep = [c1 + .4, c1 + 4.4];                // P3: the second band of light, from him over the crowd to the lens
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
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
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
  const LU = { uGold: { value: 0 }, uFront: { value: -1e4 }, uEdgeK: { value: 0 }, uEdgeW: { value: 5 }, uEdgeC: { value: col('#ffd8a0', 1) }, uShade: { value: 1 }, uSunV: { value: V(0, 0, -1) }, uRimC: { value: col('#ffb070', 1.15) }, uT: { value: 0 } };
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
          varying vec3 vLWP; varying vec3 vLWN; uniform float uFront, uEdgeK, uEdgeW, uShade, uRimS, uT, uGold; uniform vec3 uEdgeC, uSunV, uRimC; float gE = 0.;
          ${GLSL.hash}
          float frontZ(vec3 p){ return p.z + (vnoise(p.xz * .05 + 3.) - .5) * 7. - p.y * .3; }   // director fix: smooth in z only — the .3-frequency term flickered the left wall`)
        .replace('#include <map_fragment>', '#include <map_fragment>\n' + map)
        .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
          { float fz = frontZ(vLWP), lit = 1. - smoothstep(uFront - 9., uFront + 9., fz), ed = exp(-pow((fz - uFront) / uEdgeW, 2.)) * uEdgeK;
            float sh = mix(uShade, 1., lit); reflectedLight.directDiffuse *= sh; reflectedLight.directSpecular *= sh;
            totalEmissiveRadiance += diffuseColor.rgb * uEdgeC * ed + vec3(1., .835, .54) * gE * uGold * 2.6 * smoothstep(.0, .004, dot(reflectedLight.directDiffuse, vec3(.33)));   /* the gold edge is sunlight: the crowd's shadows cut it */
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
      if (N.y < .5) c *= .88;
      { float fe = fract((-10. - vLWP.z) / 1.6); gE = step(.7, N.y) * (1. - smoothstep(.0, .08, fe)) * step(vLWP.z, -10.); }   // the tread's front edge (P3: a line of gold)
      diffuseColor.rgb = c; }`;
  const M = {
    wall: patch(K.std('#d8c09c', { roughness: .92 }), 'w1', { map: WALL }), wall2: patch(K.std('#c9a57c', { roughness: .92 }), 'w2', { map: WALL }), wall3: patch(K.std('#e0ccaa', { roughness: .92 }), 'w3', { map: WALL }),
    wall4: patch(K.std('#b8986f', { roughness: .95 }), 'w4', { map: WALL }), wall5: patch(K.std('#d2cabb', { roughness: .9 }), 'w5', { map: WALL }), wall6: patch(K.std('#a8957c', { roughness: .95 }), 'w6', { map: WALL }),
    pave: patch(K.std('#cdb898', { roughness: .9 }), 'pv', { map: PAVE }), ashlar: patch(K.std('#d6c6a6', { roughness: .9 }), 'as', { map: WALL }),
    dark: K.std('#1a120c', { roughness: 1 }), wood: patch(K.std('#5a4028', { roughness: .85 }), 'wd'), roof: patch(K.std('#a8906e', { roughness: .95 }), 'rf'),
    leaf: patch(K.std('#5f6a4a', { roughness: .9 }), 'lf'), trunk: patch(K.std('#4a3a2a', { roughness: .95 }), 'tk'),
  };
  const awnCols = ['#9a6a3a', '#7a3a2a', '#b89a6a', '#4c5a6a', '#8a7a52'].map((c, i) => patch(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'aw' + i, { wave: true }));

  // the far street beyond the landing (P3 hides it: from the foot of the steps Peter then stands against the open sky)
  const FAR = new THREE.Group(); G.street.add(FAR);
  // ---------------------------------------------------------------- the street's ground: one merged mesh of treads (40 m wide, under the houses)
  { const br = new Set([80, ZS0, ZST0, ZST1, -290]); for (let z = ZS0; z > -290; z -= RUN) br.add(+z.toFixed(4)); for (let i = 1; i < NST; i++) br.add(+(ZST0 - i * (ZST0 - ZST1) / NST).toFixed(4));
    const zs = [...br].sort((a, b) => b - a), parts = [], partsF = [];
    for (let i = 0; i < zs.length - 1; i++) { const z0 = zs[i], z1 = zs[i + 1], y = gY((z0 + z1) / 2), g = new THREE.BoxGeometry(46, y + 3, z0 - z1); g.translate(0, (y - 3) / 2, (z0 + z1) / 2); (z0 > -64 ? parts : partsF).push([g]); }
    for (const [pp, grp] of [[parts, G.street], [partsF, FAR]]) { const m = new THREE.Mesh(K.mergeGeometries(pp), M.pave); m.receiveShadow = true; m.castShadow = true; grp.add(m); } }

  // ---------------------------------------------------------------- houses on both sides (irregular, plaster and bare brick, doors, awnings)
  const R = rng(7070), boxes = [], beamM4 = [], lampAt = [];
  const addBox = (grp, w, h, d, x, y, z, ry, mat, r = .06) => { const b = new THREE.Mesh(K.roundedBox(w, h, d, r, 2), mat); b.position.set(x, y, z); b.rotation.y = ry; b.castShadow = b.receiveShadow = true; grp.add(b); return b; };
  const archG = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0); return new THREE.ShapeGeometry(s, 10); };
  const glowM = K.glow('#ffb468', 1.5), WALLS = [M.wall, M.wall2, M.wall3, M.wall4, M.wall5, M.wall6];
  for (const sd of [-1, 1]) { let z = 46; while (z > -290) {
      const wz = 3.6 + R() * 4.4, d = 6 + R() * 4, z1 = z - wz, zc = (z + z1) / 2; let hw = 0; for (let k = 0; k <= 6; k++) hw = Math.max(hw, halfW(lerp(z, z1, k / 6)));
      const x0 = sd * (hw + .1 + R() * .9), base = gY(z) - .5, lowZ = zc < -47, top = gY(z1) + (lowZ ? 2.2 + R() * .7 : 3 + R() * 3.6 + (R() < .3 ? 2.6 : 0)), m = WALLS[(R() * WALLS.length) | 0], ry = (R() - .5) * .06, far = zc < -150;   // fix 1: low houses round the landing — the sky opens behind Peter
      const hg = new THREE.Group(); hg.position.set(x0 + sd * d / 2, 0, zc); hg.rotation.y = ry; (zc < -57 ? FAR : G.street).add(hg);
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
      if (R() < .55 && zc >= -57) for (let k = 0; k < bn; k++) beamM4.push(new THREE.Matrix4().compose(hg.position.clone().add(V(fx - sd * .16, top - .32, (k + .5) * wz / bn - wz / 2).applyAxisAngle(V(0, 1, 0), 0)), new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), Math.PI / 2), V(1, 1, 1)));
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
    const zt = -900; addBox(G.street, 230, 40, 30, -300, gt + 20 - 6, zt, 0, M.ashlar, .3);
    for (let k = 0; k < 9; k++) addBox(G.street, 3, 4, 3, -410 + k * 28, gt + 36, zt + 14, 0, M.ashlar, .2);   // the colonnade's line along the top, far off
    addBox(G.street, 34, 44, 50, -306, gt + 34 + 22, zt - 60, 0, M.wall5, .4); addBox(G.street, 54, 22, 40, -306, gt + 34 + 11, zt - 40, 0, M.wall5, .4);
    addBox(G.street, 36, 1.2, 52, -306, gt + 34 + 44.6, zt - 60, 0, patch(K.std('#e8d0a0', { roughness: .5, metalness: .3 }), 'tg'), .2); }
  { const bm = new THREE.InstancedMesh(new THREE.CylinderGeometry(.07, .08, .42, 6), M.wood, beamM4.length); beamM4.forEach((q, i) => bm.setMatrixAt(i, q)); bm.castShadow = true; G.street.add(bm); }
  const P3L = V(0, .3, -1);
  let hsOn = true; const houseShadows = on => { if (on === hsOn) return; hsOn = on; for (const hg of boxes) hg.traverse(o => { if (o.isMesh) o.castShadow = on; }); };
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
  // (10-3 shadow-has-caster: no invisible casters any more — every shadow on screen has its man on screen; layer 3 is no longer used)
  let crowdL = -1;
  const crowdLayer = n => { if (n === crowdL) return; crowdL = n; for (const p of crowd) { p.userData.lay = undefined; p.traverse(o => o.layers.set(n)); } };
  const PT = peter(); PT.position.copy(PETER); PT.rotation.y = Math.PI + .45; G.street.add(PT);
  // the crowd in the square, facing him (an aisle kept clear for the s2 camera)
  const crowd = []; { const r = rng(1702); for (let i = 0; i < 400 && crowd.length < 104; i++) { const x = -7.6 + r() * 15.2, z = -47.2 + r() * 16.6;
      if (Math.abs(x - 2.05) < .95 && z > -44.7) continue; if (crowd.some(q => Math.hypot(q.position.x - x, q.position.z - z) < 1.0)) continue;
      if (Math.abs(x) > halfW(z) - .5) continue;
      const p = man(r); p.position.set(x, gY(z), z); p.rotation.y = yawTo(PETER.clone().sub(p.position)) + (r() - .5) * .3; G.street.add(p); crowd.push(p); } }
  // P3 only (10-3 shadow-has-caster): the crowd goes on down the street toward the lens — men standing, facing him, each on his own long
  // shadow (the shadows that test A drew with invisible casters now have their men); hidden in P1, which is kept as it was
  const crowdNear = []; { const r = rng(1703); for (let i = 0; i < 900 && crowdNear.length < 70; i++) { const z = -29 + r() * 31, x = (r() * 2 - 1) * (halfW(z) - .5);
      if (crowdNear.some(q => Math.hypot(q.position.x - x, q.position.z - z) < 1.05)) continue;
      const p = man(r); p.position.set(x, gY(z), z); p.rotation.y = yawTo(PETER.clone().sub(p.position)) + (r() - .5) * .35; p.visible = false; G.street.add(p); crowdNear.push(p); } }
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
      const lit = (zF > 1e3 || shot === 's2' || shot === 'p3') ? 1 : 1 - ss(zF - 3.5, zF + 3.5, z), ed = Math.exp(-Math.pow((z - zF) / edW, 2)) * edK, base = shot === 's2' ? .2 : .12;
      moA[i] = clamp((base * lit + (shot === 's1' ? .1 : 0) + ed * .85) * (.5 + .5 * hsh(i, 8)) * Math.sin(Math.PI * ((ph * 3) % 1))); }
    moG.attributes.position.needsUpdate = true; moG.attributes.aK.needsUpdate = true; }

  // ================================================================ P4: the drone (10-3 test, council/test-brief.md A) over the FIRST DRAFT's world
  // The world and light of the first-draft aerial (r10-pentecost-still-10.5.jpg — the working tree right after git edc61537, committed as
  // 38392d88 s3; edc61537 itself still had the 80° top-down crane): the stepped pool, five streets, dark small figures, long hard shadows.
  // Copied unchanged except: the sun locked at 15° (council plan), the first draft's riser shade (pave3), and one street of walkers added
  // for the drone to skim (STR[1], toward the lens; its own random stream, so the first draft's crowd is the same).
  const pave3 = patch(K.std('#cdb898', { roughness: .9 }), 'pv3', { map: PAVE.replace('if (N.y < .5) c *= .88;', 'if (N.y < .5) c *= .72;') });
  // ================================================================ shot 3: the pool at the bottom of the city
  const pool = new THREE.Group(); pool.position.copy(PO); pool.rotation.y = PSI; G.pool.add(pool);
  const seP = (a, b, th, n = 4) => { const c = Math.cos(th), s = Math.sin(th); return [a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)]; };
  const ring = (a, b, N = 120) => { const pts = []; for (let i = 0; i < N; i++) { const [x, y] = seP(a, b, i / N * Math.PI * 2); pts.push(new THREE.Vector2(x, y)); } return pts; };
  const RA = k => A0 + k * DR, RB = k => B0 + k * DR;
  const treadY = k => -(NR - k) * STEP;   // tread k (between ring k and k+1), k = 0 … NR−1; the plaza (ring NR outward) at 0
  // the continuous ring index of a local point (bisection on the superellipse family): < 0 inside the water's edge
  function ringS(x, z) { let lo = -A0 + .2, hi = 80; const f = s => Math.pow(Math.abs(x) / (A0 + s), 4) + Math.pow(Math.abs(z) / (B0 + s), 4) - 1;
    for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return lo / DR; }
  const groundAt = (x, z) => { const s = ringS(x, z); if (s >= NR) return 0; if (s < 0) return YF; const k = Math.floor(s), fr = s - k, y0 = treadY(k), y1 = k + 1 >= NR ? 0 : treadY(k + 1);
    return lerp(y0, y1, ss(.86, 1, fr)); };   // the riser eased over its last 12 cm: no pop when a figure steps down
  { const parts = [];
    for (let k = 0; k < NR; k++) { const sh = new THREE.Shape(ring(RA(k + 1), RB(k + 1))); sh.holes.push(new THREE.Path(ring(RA(k), RB(k)))); const dep = treadY(k) - YF + .02, g = new THREE.ExtrudeGeometry(sh, { depth: dep, bevelEnabled: false, curveSegments: 1 }); g.rotateX(-Math.PI / 2); g.translate(0, YF - .02, 0); parts.push([g]); }
    { const sh = new THREE.Shape([V(-160, -160), V(160, -160), V(160, 160), V(-160, 160)].map(v => new THREE.Vector2(v.x, v.y))); sh.holes.push(new THREE.Path(ring(RA(NR), RB(NR)))); const g = new THREE.ShapeGeometry(sh, 1); g.rotateX(-Math.PI / 2); parts.push([g]); }
    { const g = new THREE.ShapeGeometry(new THREE.Shape(ring(RA(0) + .1, RB(0) + .1)), 1); g.rotateX(-Math.PI / 2); g.translate(0, YF, 0); parts.push([g]); }
    const m = new THREE.Mesh(K.mergeGeometries(parts), pave3); m.receiveShadow = true; m.castShadow = true; pool.add(m); }
  // the water: dark green-teal, the sky in it, a warm sheen that grows, rings where men are baptised (up to 8 at once)
  const NRIP = 8, waterU = { uT: { value: 0 }, uRip: { value: Array.from({ length: NRIP }, () => new THREE.Vector4(0, 0, -99, 0)) }, uWarm: { value: 0 } };
  const waterM = new THREE.MeshStandardMaterial({ color: '#173634', roughness: .2, metalness: 0 });
  waterM.onBeforeCompile = sh => { Object.assign(sh.uniforms, waterU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWL;').replace('#include <project_vertex>', '#include <project_vertex>\nvWL = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWL; uniform float uT, uWarm; uniform vec4 uRip[${NRIP}]; vec3 wGlow, wDir;\n${GLSL.hash}`)
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        { vec2 q = vWL.xy; float n = fbm(q * .9 + vec2(uT * .12, -uT * .08)), g = vnoise(q * 3.3 + vec2(-uT * .5, uT * .35));
          float rr = 0.; for (int i = 0; i < ${NRIP}; i++){ vec4 R = uRip[i]; float a = uT - R.z; if (a < 0. || a > 3.2) continue; float d = length(q - R.xy), w = a * 1.05 + .15; rr += R.w * exp(-pow((d - w) / (.12 + a * .1), 2.)) * pow(1. - a / 3.2, 2.) * .32 * smoothstep(0., .45, a); }
          vec3 sky = mix(vec3(.42, .5, .55), vec3(1., .84, .58), uWarm);
          float g2 = vnoise(q * 8.3 + vec2(uT * .9, -uT * .6)), far = smoothstep(-4., 4., q.y), gl = smoothstep(.6, .78, g * g2) * (.15 + 1.2 * far);   // sparse glints, more toward the sun
          wGlow = sky * (.012 + .016 * n) + vec3(1., .82, .52) * (gl * .9 + rr * .4 + far * .035 * (.6 + .4 * n)) * (.7 + uWarm * .6);
          wDir = reflectedLight.directDiffuse; }`)
      .replace('#include <opaque_fragment>', `outgoingLight = vec3(.006, .024, .024) + wDir * .25 + wGlow;
        #include <opaque_fragment>`); };
  waterM.customProgramCacheKey = () => 'pc-water';
  { const g = new THREE.ShapeGeometry(new THREE.Shape(ring(RA(0) + .05, RB(0) + .05)), 1); const w = new THREE.Mesh(g, waterM); w.rotation.x = -Math.PI / 2; w.position.y = YW; pool.add(w); }
  // five streets come down to the square round the pool; houses fill the rest (instanced: roofs seen from above)
  const STR = [18, 92, 158, 214, 300].map(a => a * D2R), PLA = RA(NR) + 11, PLB = RB(NR) + 11;
  const mouth = a => { const [x, z] = seP(PLA, PLB, a); return V(x, 0, z); };
  const dirOut = a => { const [x, z] = seP(PLA, PLB, a); return V(x, 0, z).normalize(); };
  const distStreet = (x, z) => { let d = 1e9; for (const a of STR) { const m = mouth(a), dv = dirOut(a), px = x - m.x, pz = z - m.z, along = px * dv.x + pz * dv.z; if (along < -2) continue; d = Math.min(d, Math.abs(px * dv.z - pz * dv.x)); } return d; };
  // 10-3 test: along the drone's street beyond the first draft's frame the houses take the first draft's 'near' height (2.6–4.2 m, no roof room),
  // so the 5 m drone flies just above the roofs; the random stream is unchanged, so every other house is the first draft's
  const droneZone = (x, z) => { const m = mouth(STR[1]), dv = dirOut(STR[1]), px = x - m.x, pz = z - m.z, al = px * dv.x + pz * dv.z; return al > 14 && Math.abs(px * dv.z - pz * dv.x) < 15; };
  { const r = rng(909), hm = [], hc = [], pm = [], trees = [];
    for (let gx = -86; gx <= 86; gx += 6.4) for (let gz = -86; gz <= 86; gz += 6.4) { const x = gx + (r() - .5) * 1.6, z = gz + (r() - .5) * 1.6;
      if (Math.pow(Math.abs(x) / (PLA + 1.5), 4) + Math.pow(Math.abs(z) / (PLB + 1.5), 4) < 1) continue; if (distStreet(x, z) < 5.4) continue;
      if (r() < .1) { if (r() < .6) trees.push([x, z]); continue; }   // a courtyard (sometimes a tree)
      const w = 4.6 + r() * 2.2, d = 4.6 + r() * 2.2, near = Math.hypot(x / PLA, z / PLB) < 2.0 || droneZone(x, z), h = near ? 2.6 + r() * 1.6 : 3 + r() * 4.5, ry = (r() - .5) * .12, c = new THREE.Color().setHSL(.08 + r() * .03, .18 + r() * .14, .62 + r() * .16);
      hm.push(new THREE.Matrix4().compose(V(x, h / 2 - .3, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(w, h + .6, d))); hc.push(c);
      if (r() < .65) { pm.push(new THREE.Matrix4().compose(V(x, h + .02, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(w * .78, .06, d * .78))); }
      if (r() < .3) { const uw = w * .45, ud = d * .45, uh = 2.4, ox = (r() - .5) * w * .3, oz = (r() - .5) * d * .3; if (!droneZone(x, z)) hm.push(new THREE.Matrix4().compose(V(x + ox, h + uh / 2, z + oz), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(uw, uh, ud))), hc.push(c.clone().multiplyScalar(.97)); } }
    const hg = K.roundedBox(1, 1, 1, .03, 1), him = new THREE.InstancedMesh(hg, M.wall, hm.length); hm.forEach((q, i) => { him.setMatrixAt(i, q); him.setColorAt(i, hc[i]); }); him.castShadow = him.receiveShadow = true; pool.add(him);
    // the roof's sunken middle (a darker, shallower plane inside the parapet line)
    const pim = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), patch(K.std('#8c7656', { roughness: 1 }), 'rf2'), pm.length); pm.forEach((q, i) => pim.setMatrixAt(i, q)); pim.receiveShadow = true; pool.add(pim);
    for (const [x, z] of trees) { const n = 22, inst = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.9, 0), M.leaf, n), m4 = new THREE.Matrix4(), q = rng((x * 13 + z * 7) | 0);
      for (let i = 0; i < n; i++) { const a = q() * 6.283, rr = Math.sqrt(q()) * 2.2; m4.compose(V(x + Math.cos(a) * rr, 3.4 + q() * 1.6, z + Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(q() * 3, q() * 3, 0)), V(1, .7, 1).multiplyScalar(.7 + q() * .7)); inst.setMatrixAt(i, m4); }
      inst.castShadow = true; pool.add(inst); } }
  // the people (instanced, read from above: shoulders and a head cloth; robes to the ground)
  const bodyG = (() => { const lg = new THREE.LatheGeometry([[.2, 0], [.22, .05], [.2, .6], [.175, 1.0], [.2, 1.28], [.15, 1.39], [.05, 1.45]].map(([r, y]) => new THREE.Vector2(r, y)), 14); lg.scale(1, 1, .78);
    const sh = new THREE.SphereGeometry(.17, 12, 8); sh.scale(1.42, .55, .82); sh.translate(0, 1.33, 0); return K.mergeGeometries([[lg], [sh]]); })();
  const headG = (() => { const hd = new THREE.SphereGeometry(.118, 12, 8); hd.scale(.95, 1.05, 1); hd.translate(0, 1.56, .01); const fall = new THREE.SphereGeometry(.15, 12, 8, Math.PI * .1, Math.PI * .8 + Math.PI, 0, Math.PI * .6); fall.scale(1, 1.1, .9); fall.translate(0, 1.5, .03);
    return K.mergeGeometries([[hd], [fall]]); })();
  const figM = patch(K.std('#241c15', { roughness: 1 }), 'fig', { rim: .35 }), figH = patch(K.std('#241c15', { roughness: 1 }), 'figh', { rim: .35 });   // fix 1: dark small silhouettes; their shadows draw the net
  const robeTop = ['#e9e1cf', '#dcd2bc', '#f0e8d8', '#cfc3a8', '#b8a688', '#d8ccb0', '#9a7c58', '#7c6448', '#5c6c7e', '#8a4a34', '#c8b48c', '#e4dac6'];
  const clothTop = ['#efe7d6', '#d8cdb4', '#3b4f6b', '#8a7a66', '#e6dcc8', '#a89070', '#c4b08a', '#6a5440', '#f2ead8'];
  const crowd3 = [];
  { const r = rng(4747);
    // slots: on the treads, two rows on the plaza round the top, a row standing in the water at its edge
    const slots = [];
    for (let k = -2; k <= NR + 1; k++) { const sA = k === -2 ? -1.9 : k < 0 ? -.75 : k + .5, a = A0 + sA * DR, b = B0 + sA * DR; let per = 0; const NS = 240; let prev = seP(a, b, 0);
      for (let i = 1; i <= NS; i++) { const c = seP(a, b, i / NS * Math.PI * 2); per += Math.hypot(c[0] - prev[0], c[1] - prev[1]); prev = c; }
      const sp = k === -2 ? .95 : k < 0 ? .8 : k >= NR ? .72 : .64, n = Math.floor(per / sp); for (let i = 0; i < n; i++) { const th = (i + (k & 1) * .5 + (r() - .5) * .3) / n * Math.PI * 2, [x, z] = seP(a, b, th), j = (r() - .5) * .26;
        if (k >= 0 && r() < .06) continue; slots.push({ x: x * (1 + j / a) + (r() - .5) * .16, z: z * (1 + j / b) + (r() - .5) * .16, ring: k, th }); } }
    // who arrives when: inner rings first (the net fills from the bottom); about a third are already there when the shot begins
    slots.forEach(s => s.o = s.ring === -2 ? 2.4 + r() * 1.6 : (s.ring + 1) * 1.0 + r() * 1.25);
    slots.sort((a, b) => a.o - b.o);
    slots.forEach((s, i) => { const f = i / slots.length; s.f = f; });
    for (const s of slots) { const a = Math.atan2(s.z, s.x); let best = STR[0], bd = 9; for (const q of STR) { const d = Math.abs(Math.atan2(Math.sin(a - q), Math.cos(a - q))); if (d < bd) { bd = d; best = q; } } s.st = best; }
    for (const s of slots) { const p = { ...s, v: 1.15 + r() * .4, lane: (r() - .5) * 3.2, body: new THREE.Color(robeTop[(r() * robeTop.length) | 0]), head: new THREE.Color(clothTop[(r() * clothTop.length) | 0]), ph: r() };
      if (s.ring < 0) { p.body.multiplyScalar(.95); } crowd3.push(p); }
    // extra walkers still on their way at the end (the streets stay full; they arrive after the cut), on the outer plaza rows
    for (let i = 0; i < 260; i++) { const q = STR[i % 5], m = mouth(q); crowd3.push({ x: m.x * .97, z: m.z * .97, ring: NR + 2, st: q, f: 1.05 + i / 260 * 1.9, v: 1.15 + r() * .4, lane: (r() - .5) * 3.2, body: new THREE.Color(robeTop[(r() * robeTop.length) | 0]), head: new THREE.Color(clothTop[(r() * clothTop.length) | 0]), ph: r(), late: true }); }
    // in the water: six pairs (one stands, one is dipped); Peter in the first pair, his indigo cloth, nearest the lens
    for (let i = 0; i < 6; i++) { const th = [1.4, -1.85, 1.95, -1.2, -.2, 3.3][i], [x, z] = seP(A0 - 3.7, B0 - 2.75, th), dx = Math.cos(th) * .34, dz = Math.sin(th) * .34;
      crowd3.push({ x, z, ring: -9, f: -1, v: 0, lane: 0, body: new THREE.Color(i ? '#d8ccb0' : '#a58f6f'), head: new THREE.Color(i ? '#c4b08a' : '#3b4f6b'), ph: r(), stand: true, face: th + Math.PI });
      crowd3.push({ x: x - dx * 2.2, z: z - dz * 2.2, ring: -9, f: -1, v: 0, lane: 0, body: new THREE.Color('#f0e8d8'), head: new THREE.Color('#efe7d6'), ph: r(), dip: i, face: th }); } }
  const NC = crowd3.length, bodyI = new THREE.InstancedMesh(bodyG, figM, NC), headI = new THREE.InstancedMesh(headG, figH, NC);
  crowd3.forEach((p, i) => { bodyI.setColorAt(i, p.body); headI.setColorAt(i, p.head); }); bodyI.castShadow = headI.castShadow = true; bodyI.receiveShadow = headI.receiveShadow = true; bodyI.frustumCulled = headI.frustumCulled = false; pool.add(bodyI, headI);
  // arrival schedule (film time): f ∈ [0, .32] arrived before the shot; [.32, 1] arrive through the shot (more early), > 1 after it
  const arrive = (f, T) => { const a = T.c2, b = T.end; if (f < .32) return a - 9 + f / .32 * 8.6; if (f <= 1) { const u = (f - .32) / .68; return a + .1 + (b - a + .6) * (1 - Math.pow(1 - u, 1.15)); } return b + .7 + (f - 1) * 14; };
  const DIPS = [0, 1, 2, 3, 4, 5, 0].map((p, i) => [p, .6 + i * .9]);   // which pair dips, seconds after the cut
  let ARR = 0;
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), one = V(1, 1, 1);
  function setCrowd3(t, T) { let arrived = 0; const rip = waterU.uRip.value; rip.forEach(v => v.set(0, 0, -99, 0)); let ri = 0;
    crowd3.forEach((p, i) => { let x, z, y, yaw, sway = 0;
      if (p.ring === -9) { x = p.x; z = p.z; yaw = p.face + Math.sin(t * .4 + p.ph * 6) * .05; y = YF - .05;
        if (p.dip != null) { let dip = 0; for (const [pi, dt] of DIPS) if (pi === p.dip) { const t0 = T.c2 + dt; const u = (t - t0) / 1.25; if (u > 0 && u < 1) dip = Math.sin(Math.PI * u) * ss(0, .25, u) * ss(1, .75, u) * 1.15 + Math.sin(Math.PI * u) * .0;
            if (t > t0 + .35 && ri < NRIP) { rip[ri++].set(x, -z, t0 + .35, 1); } }
          y -= dip * .9; }
        m4.compose(V(x, y, z), q4.setFromEuler(e4.set(0, yaw, 0)), one); bodyI.setMatrixAt(i, m4); headI.setMatrixAt(i, m4); return; }
      const ta = arrive(p.f, T), S = V(p.x, 0, p.z), Mo = mouth(p.st), D = dirOut(p.st), side = V(D.z, 0, -D.x), legB = S.distanceTo(Mo);
      const tau = .55, sR = ta - t, dRem = sR <= 0 ? 0 : sR < tau ? p.v * sR * sR / (2 * tau) : p.v * (sR - tau / 2);
      if (dRem <= 0) { arrived++; x = S.x; z = S.z; const toC = Math.atan2(-(-S.x), -(-S.z)); const walkYaw = Math.atan2(-(S.x - Mo.x), -(S.z - Mo.z));
        yaw = walkYaw + Math.atan2(Math.sin(toC - walkYaw), Math.cos(toC - walkYaw)) * ss(ta, ta + 1.1, t) + Math.sin(t * .3 + p.ph * 9) * .08; }
      else if (dRem <= legB) { const k = dRem / legB; x = lerp(S.x, Mo.x + side.x * p.lane * .4, k); z = lerp(S.z, Mo.z + side.z * p.lane * .4, k); yaw = Math.atan2(-(S.x - (Mo.x + side.x * p.lane * .4)), -(S.z - (Mo.z + side.z * p.lane * .4))); sway = 1; }
      else { const e = dRem - legB, lx = Mo.x + side.x * p.lane * (.4 + .6 * ss(0, 4, e)), lz = Mo.z + side.z * p.lane * (.4 + .6 * ss(0, 4, e)); x = lx + D.x * e; z = lz + D.z * e; yaw = Math.atan2(D.x, D.z); sway = 1; }
      if (p.ring < 0 && dRem <= 0) y = YF + .02; else y = groundAt(x, z);
      if (p.ring < 0 && dRem > 0) y = Math.max(YF, groundAt(x, z));
      if (p.late && p.st === STR[1]) y = -60;   // 10-3 test: STR[1] is walked by droneMen (below)
      const sw = sway * Math.sin(t * 5.6 * (p.v / 1.3) + p.ph * 6.283) * .035 * ss(0, .6, dRem);
      m4.compose(V(x, y, z), q4.setFromEuler(e4.set(0, yaw, sw, 'YXZ')), one); bodyI.setMatrixAt(i, m4); headI.setMatrixAt(i, m4); });
    bodyI.instanceMatrix.needsUpdate = headI.instanceMatrix.needsUpdate = true; ARR = arrived; }


  // 10-3 test: the drone's street (STR[1], toward the lens) walked by men — the same rig as the square's men in P1/P3 (tied head cloth, broad
  // level shoulders, dark backlit robes with a gold rim), not the first draft's pegs: the drone passes them at 3–25 m. A lane is kept clear
  // under the lens (|lane| ≥ 0.8 m), so they slide past on both sides and nobody passes directly beneath it.
  const droneMen = []; { const r = rng(5152); for (let i = 0; i < 3000 && droneMen.length < 150; i++) { const e0 = 2 + r() * 70, lane = (r() < .5 ? -1 : 1) * (.8 + r() * 3.8);
      if (droneMen.some(q => Math.hypot(q.userData.e0 - e0, q.userData.lane - lane) < 1.25)) continue;
      const p = man(r); p.userData.e0 = e0; p.userData.lane = lane; p.userData.t0 = -r() * 1.1; p.userData.T = 1.05 + r() * .2; G.pool.add(p); droneMen.push(p); } }

  // ================================================================ poses (s1, p3)
  function posePeter(t, T) { const U = PT.userData, s = U.s, id = P.idle(t, .17, { s }), bowK = 1 - ss(T.bow[0], T.bow[1], t), armK = ss(T.arm[0], T.arm[1], t), fwd = ss(T.fwd[0], T.fwd[1], t);
    const tg = V(.36, 1.74 - .08 * fwd + .03 * Math.sin(t * .9), -.37 - .1 * fwd);   // P3: the raised hand goes once slowly forward (2 s)
    P.pose(PT, { ...id, lean: -.3 * bowK - .03 - .03 * armK - .03 * fwd, head: [-.34 * bowK + .1 * (1 - bowK), id.head[1] * .5], swing: [id.swing[0] - .1 * bowK, id.swing[1]], hands: [null, tg], handsW: [0, armK] }); }
  function poseCrowd(t, near = false) { for (const p of near ? crowdNear : crowd) { const U = p.userData, id = P.idle(t, U.ph, { s: U.s }); P.pose(p, { ...id, head: [.12 + id.head[0], id.head[1]] }); } }
  function poseLower(t, T) { for (const p of lower) { const U = p.userData;
      const tPass = T.fr0 + (U.z0 + 72) / 30, k = ss(tPass - .1, tPass + .9, t);
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
  // P1 (= s1 of fix 1/2, kept): the wind of light down the street
  function s1(t, T) { houseShadows(true); for (const p of crowdNear) p.visible = false; FAR.visible = true; G.street.visible = true; G.pool.visible = false; sky.mesh.visible = true; crowdLayer(0); LU.uGold.value = 0; for (const p of lower) p.visible = true; SK.sunDir.value.copy(SUN1); shadowAt(V(0, 3, -24), 62, SUN1);
    const u = (t - T.t0) / (T.c1 - T.t0), sunK = 1, zF = -72 + 30 * (t - T.fr0);   // fix 1: slower, wider (no wall lighting in two frames)
    const warm = lerp(.3, .85, u); streetLight(warm, sunK); LU.uRimC.value.set('#ffc078').multiplyScalar(1.6);
    LU.uFront.value = zF; LU.uShade.value = .38; LU.uEdgeK.value = 0; LU.uEdgeW.value = 6;   // fix 2: no +60 flash on the near wall LU.uEdgeC.value.set('#ffd8a0');
    frontLamp.pos.set(0, gY(Math.min(zF, 20)) + 3.2, zF); frontLamp.power = 7 * sunK * ss(-60, -30, zF) * (1 - ss(-12, 6, zF)); frontLamp.size = 8;
    const cz = lerp(15.5, 12.1, u), c = V(lerp(1.2, 1.0, u), gY(cz) + lerp(3.3, 3.45, u), cz), l = V(-3.2, gY(-40) + 1.2, -40);
    setCam(c, l, FOV); film.dofCfg.focus = 13; film.dofCfg.aperture = .45; film.dofCfg.maxCoc = 14;
    posePeter(t, T); poseCrowd(t); poseLower(t, T); setMotes(t, 's1', zF, 1.0, 4.5); motes.visible = true; }
  // P3 (10-3 test: lengthened to the whole second piece of N170): Peter far up the steps, small and upright, a backlit silhouette against
  // the bright sky; below him the square's men, seen from behind as backlit silhouettes with a rim, their long shadows coming toward the lens
  // from their own feet (shadow-has-caster, 2026-11-28: the invisible casters of test A removed). Telephoto from the foot of the steps, crane up with inertia; in the last
  // 0.6 s the camera pushes forward over the crowd's shadows toward the sun, accelerating to the drone's 7 m/s (same heading, same backlight).
  const P3C = (t, T) => { const u = clamp((t - T.p3) / (T.c2 - T.p3)), e = u * u * .55 + u * .45, pk = clamp((t - T.push[0]) / (T.push[1] - T.push[0])), pd = .5 * (7 / .6) * Math.pow(pk * .6, 2);
    const c = V(.9, lerp(1.0, 4.4, e), 34 - pd), fov = (vert ? 19 : 12) * (1 + .12 * pk * pk);
    return { c, l: V(PETER.x + 1.25, PLAT - 2.3 + lerp(0, 2.3, e) - 1.6 * pk * pk, PETER.z), fov }; };
  let SUNP3 = null;
  function p3(t, T) { FAR.visible = false; G.street.visible = true; G.pool.visible = false; sky.mesh.visible = true; LU.uGold.value = 0; for (const p of lower) p.visible = false;
    if (!SUNP3) { const q = P3C((T.p3 + T.c2) / 2, T); setCam(q.c, q.l, q.fov); cam.updateMatrixWorld(); const d = V(230 / W * 2 - 1, 1 - 520 / H * 2, .5).unproject(cam).sub(cam.position).normalize(); SUNP3 = d; }   // the sun placed where the plan wants it (x 230, y 520), up-left of him
    houseShadows(false);
    crowdLayer(0);   // the square's men are SEEN: backlit silhouettes before small Peter, each on his own shadow (shadow-has-caster)
    SK.sunDir.value.copy(SUNP3); { const az = Math.atan2(SUNP3.x, -SUNP3.z), el = 14 * D2R; P3L.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)); } shadowAt(V(0, 3, -16), 46, P3L);
    const grow = ss(T.p3, T.c2, t); streetLight(1, 1); sunL.intensity = 4.2; film.atmos.density = .0012; hemi.intensity = .3; film.look.exposure = lerp(.78, .84, grow); LU.uRimC.value.set('#ffc078').multiplyScalar(1.8);
    SK.horizon.value.set('#f6e2b8').multiplyScalar(1.45); SK.mid.value.set('#f0d6a8').multiplyScalar(1.05);   // a little cooler than P4's gold (time passes before 「그날」)
    const zE = lerp(-50, 30, clamp((t - T.sweep[0]) / (T.sweep[1] - T.sweep[0]))), ek = ss(T.sweep[0], T.sweep[0] + .5, t) * (1 - ss(T.sweep[1] - .5, T.sweep[1], t));
    LU.uFront.value = zE; LU.uShade.value = 1; LU.uEdgeK.value = .22 * ek; LU.uEdgeW.value = 4; LU.uEdgeC.value.set('#ffdcaa');
    frontLamp.pos.set(PETER.x + .4, PLAT + 2.6, PETER.z - 2.5); frontLamp.power = 8; frontLamp.size = 5;
    const q = P3C(t, T); setCam(q.c, q.l, q.fov); film.dofCfg.focus = q.c.distanceTo(PETER); film.dofCfg.aperture = .9; film.dofCfg.maxCoc = 18;
    for (const p of crowdNear) p.visible = true;
    posePeter(t, T); poseCrowd(t); poseCrowd(t, true); setMotes(t, 'p3', zE, .5 * ek, 4); motes.visible = true; }
  // P4: the drone. skim (≈ 5 m, 35° down, 7 m/s along STR[1] toward the pool and the sun) → rise on 「사람을 취하리라던」 (2 s, smoothstep: peak
  // ≈ 39 m/s up, curving from the street's axis onto the first draft's) → land on the first-draft framing (38392d88 s3: pitch 52°, D ≈ 70, fov 36)
  // at 「말씀대로」, then a pure crane up (the horizontal distance held, the pitch 52° → 54.5°) with a 4° orbit to the end — no stop, no roll.
  const toW = v => v.clone().applyAxisAngle(V(0, 1, 0), PSI);
  const SMW = toW(mouth(STR[1])).add(PO), SDW = toW(dirOut(STR[1])), TG4 = PO.clone().add(V(0, -1.2, 7)), LR4 = 70 * Math.cos(52 * D2R), V4 = 7, H4 = 5, PIT4 = 35, FOV4 = vert ? 62 : 44;
  const E_END = (() => { let lo = 0, hi = 150; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, p = SMW.clone().addScaledVector(SDW, m); if (Math.hypot(p.x - TG4.x, p.z - TG4.z) < LR4) lo = m; else hi = m; } return lo; })();
  const angDir = (yaw, pit) => V(Math.sin(yaw) * Math.cos(pit), -Math.sin(pit), Math.cos(yaw) * Math.cos(pit));
  function P4C(t, T) { const [r0, r1] = T.rise, R = r1 - r0, eR0 = E_END + V4 * R / 2;
    const tau = clamp(t - r0, 0, R), e = t < r0 ? eR0 + V4 * (r0 - t) : eR0 - V4 * (tau - tau * tau / (2 * R));   // 7 m/s, easing to 0 over the rise
    const S = SMW.clone().addScaledVector(SDW, e); S.y = H4;
    const uL = (t - T.land) / (T.end - T.land), pitL = (52 + 2.5 * uL) * D2R, yawL = 4 * uL * D2R, DL = LR4 / Math.cos(pitL);   // crane up + orbit (linear: no start/stop)
    const L = TG4.clone().add(V(Math.sin(yawL) * Math.cos(pitL) * DL, Math.sin(pitL) * DL, Math.cos(yawL) * Math.cos(pitL) * DL));
    const k = ss(r0, r1, t), c = S.clone().lerp(L, k);
    const yS = Math.atan2(-SDW.x, -SDW.z), dL = TG4.clone().sub(L).normalize(), yLk = Math.atan2(dL.x, dL.z), pLk = Math.asin(-dL.y);
    const dy = Math.atan2(Math.sin(yLk - yS), Math.cos(yLk - yS)), dir = angDir(yS + dy * k, lerp(PIT4 * D2R, pLk, k));
    return { c, l: c.clone().add(dir), fov: lerp(FOV4, vert ? 36 : 24, k), k, S, L }; }
  // the shadow map follows the lens (texel-snapped in light space: no crawl on the shadow edges)
  function shadowSnap(c, half, dir) { const f = dir.clone().normalize(), r = V().crossVectors(V(0, 1, 0), f).normalize(), u = V().crossVectors(f, r), tx = 2 * half / 4096;
    const a = c.dot(r), b = c.dot(u); shadowAt(c.clone().addScaledVector(r, Math.round(a / tx) * tx - a).addScaledVector(u, Math.round(b / tx) * tx - b), half, f); }
  function p4(t, T) { G.street.visible = false; G.pool.visible = true; sky.mesh.visible = true; SK.sunDir.value.copy(SUN3); LU.uGold.value = 0;
    const q = P4C(t, T), k = q.k, warm = ss(T.c2, T.end, t);
    { const ahead = q.S.clone().addScaledVector(SDW, -16); ahead.y = 0; shadowSnap(ahead.lerp(PO, k), lerp(30, 58, k), SUN3); }
    // the first draft's light (38392d88 s3), unchanged but for the locked sun
    const a = film.atmos; a.color.set('#d8a878').multiplyScalar(.64); a.colorUp.set('#c8b4a0').multiplyScalar(.58); a.density = .0026; a.falloff = .012; a.base = 0; a.start = 30; a.scatter = .8; a.anisotropy = .7; a.phaseMix = .8; a.max = 2000;
    hemi.color.set('#a8b0c4'); hemi.groundColor.set('#6a5038'); hemi.intensity = lerp(.62, .42, k); sunL.color.set('#ffd29a'); sunL.intensity = lerp(4.2, 4.6, warm);   // skim: more sky fill on the backlit sides (mean 52 → ~75)
    SK.sunColor.value.set('#fff1d4').multiplyScalar(18); SK.sunGlow.value.set('#ffc583').multiplyScalar(1.4); sunLamp.power = 0; frontLamp.power = 0; doorLamps.forEach(d => d.power = 0);
    LU.uRimC.value.set('#ffc078').multiplyScalar(lerp(2.4, 1.4, k)); LU.uFront.value = 1e4; LU.uShade.value = 1; LU.uEdgeK.value = 0; waterU.uWarm.value = .25 + .55 * warm;   // the thin gold rim, stronger while the figures are near
    const L = film.look; L.exposure = lerp(1.1, 1.22, warm) * lerp(1.38, 1, k); L.saturation = 1.06; L.contrast = 1.1; L.shadowTint.set('#d4d0e4'); L.highTint.set('#fff2dc'); L.vignette = .3;   // skim: +38 % exposure, eased out over the rise
    setCam(q.c, q.l, q.fov); film.dofCfg.focus = lerp(14, q.c.distanceTo(PO), k); film.dofCfg.aperture = lerp(.35, .12, k); film.dofCfg.maxCoc = 8;
    setCrowd3(t, T); poseDroneMen(t, T); motes.visible = false; }
  function poseDroneMen(t, T) { const side = V(SDW.z, 0, -SDW.x), yaw = yawTo(SDW.clone().negate());
    for (const p of droneMen) { const U = p.userData, o = { T: U.T, L: .55 }, w = P.walk(p, t, T.c2 + U.t0 - 2, o), d0 = P.walk(p, T.c2, T.c2 + U.t0 - 2, o).dist, e = U.e0 - (w.dist - d0);
      p.position.copy(SMW).addScaledVector(SDW, e).addScaledVector(side, U.lane); p.position.y = 0; p.rotation.y = yaw; P.pose(p, { ...w, head: [.06, 0] }); } }
  const STAGE = { s1, p3, p4 };
  const tmpV = V();
  function render(name, t, T) { LU.uT.value = t; waterU.uT.value = t; STAGE[name](t, T); cam.updateMatrixWorld();
    sunLamp.pos.copy(cam.position).addScaledVector(SK.sunDir.value, 600); LU.uSunV.value.copy(SK.sunDir.value).transformDirection(cam.matrixWorldInverse); film.render(t); }

  // ---------------------------------------------------------------- the lens, after the frame (lake-peter3d-b.js godRays/corona, copied)
  const gS = mkCanvas(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkCanvas(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) { const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h); const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 175) / 80); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; } gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h); gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 24; i++) { const sc = 1 + i * .05; gbx.globalAlpha = Math.pow(.9, i) * .15; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); } gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.imageSmoothingEnabled = true; ctx.drawImage(gB, 0, 0, W, H); ctx.restore(); }
  function corona(ctx, x, y, I, k, rings2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [r, cA, cB, a] of rings2) { const R0 = r * k * (.8 + .2 * I), g = ctx.createRadialGradient(x, y, 0, x, y, R0); g.addColorStop(0, `rgba(${cA},${Math.min(1, a * I)})`); g.addColorStop(.3, `rgba(${cB},${Math.min(1, a * I * .45)})`); g.addColorStop(1, `rgba(${cB},0)`); ctx.fillStyle = g; ctx.fillRect(x - R0, y - R0, R0 * 2, R0 * 2); } ctx.restore(); }
  const SUN_RINGS = [[16, '255,255,252', '255,246,226', .9], [70, '255,244,214', '255,214,150', .55], [220, '255,214,160', '255,170,96', .24], [560, '255,190,130', '255,150,80', .1]];
  const rayc = new THREE.Raycaster(), _rd = V();
  function sunVis(sd0) { let v = 0; const P0 = cam.position, off = [[0, 0], [.012, 0], [-.012, 0], [0, .012], [0, -.012]]; const up = V(0, 1, 0), sd = sd0.clone(), rgt = V().crossVectors(sd, up).normalize(), u2 = V().crossVectors(rgt, sd);
    for (const [a, b] of off) { _rd.copy(sd).addScaledVector(rgt, a).addScaledVector(u2, b).normalize(); rayc.set(P0, _rd); rayc.far = 900; if (!rayc.intersectObjects(G.street.children, true).some(h => !h.object.isPoints)) v++; } return v / off.length; }
  const project = p => { tmpV.copy(p).project(cam); if (tmpV.z >= 1 || tmpV.z <= -1) return null; return [(tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H]; };
  function blit(ctx) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore(); }
  const shotAt = (t, T) => T.shots.find(s => t >= s[1] && t < s[2]) || (t < T.shots[0][1] ? T.shots[0] : T.shots[T.shots.length - 1]);
  // motion blur while the drone is fast: sub-frames over a 180° shutter, averaged (every sub-frame is a pure function of its own time)
  const blurN = (nm, t, T) => nm !== 'p4' ? 1 : t < T.rise[1] - .25 ? 6 : t < T.rise[1] + .2 ? 3 : 1;
  function draw(ctx, t, T) {
    const nm = shotAt(t, T)[0], n = blurN(nm, t, T);
    if (n === 1) { render(nm, t, T); blit(ctx); }
    else for (let i = 0; i < n; i++) { const ti = Math.max(T.c2, t + (i / (n - 1) - .5) / 60); render(nm, ti, T); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 / (i + 1); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore(); }
    if (nm === 's1' || nm === 'p3') { const sd = nm === 's1' ? SUN1 : SUNP3, q = project(cam.position.clone().addScaledVector(sd, 1500));
      if (q && q[0] > -W * .4 && q[0] < W * 1.4) { const sunK = sunVis(sd), grow = nm === 'p3' ? ss(T.p3, T.c2, t) : 0;
        corona(ctx, q[0], q[1], sunK * (nm === 's1' ? .62 : .72 + .2 * grow), nm === 's1' ? .85 : 1.05, SUN_RINGS);
        godRays(ctx, q[0], q[1], sunK * (nm === 's1' ? .28 : .34 + .12 * grow)); } }
    if (nm === 'p4') { // the first draft's warm light from the upper right (38392d88 s3), growing after the landing
      const k = ss(T.land - 1, T.end, t), lg = ctx.createRadialGradient(W * 1.05, -H * .05, 0, W * 1.05, -H * .05, W * 1.1); lg.addColorStop(0, `rgba(255,214,150,${.26 * k + .04})`); lg.addColorStop(.5, `rgba(255,190,120,${.07 * k})`); lg.addColorStop(1, 'rgba(255,170,100,0)');
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  // the checks (no render): the camera + what is being emitted; the bone directions
  function probe(t, T) { const nm = shotAt(t, T)[0]; STAGE[nm](t, T); cam.updateMatrixWorld(); const d = V(); cam.getWorldDirection(d);
    let em = 0; if (nm !== 'p4') for (let i = 0; i < NMO; i++) em += moA[i] > .05 ? 1 : 0;
    const out = { shot: nm, p: cam.position.toArray(), d: d.toArray(), fov: cam.fov, emit: em, front: LU.uFront.value };
    if (nm === 'p4') { out.arrived = ARR; out.pitch = Math.asin(-d.y) / D2R; out.k = P4C(t, T).k; }
    if (nm === 'p3') out.h = cam.position.y; return out; }
  const PS = { peter: PT, crowd0: crowd[0], crowd7: crowd[7], crowd30: crowd[30], walk0: lower[0], walk1: lower[1], door0: lower[3] };
  function joints(t, T) { const nm = shotAt(t, T)[0]; if (nm === 'p4') return {};
    STAGE[nm](t, T); const out = {}, Y = V(0, 1, 0);
    for (const [k, g] of Object.entries(PS)) { if (!g || !g.visible) continue; const U = g.userData; if (!U.arms[0].E) continue; const rec = {}; U.arms.forEach((A, i) => { rec['ua' + i] = A.E.clone().sub(A.S2 || A.S).normalize().toArray(); rec['fa' + i] = A.T.clone().sub(A.E).normalize().toArray(); });
      (U.legs || []).forEach((L, i) => { rec['th' + i] = Y.clone().applyQuaternion(L.thigh.quaternion).toArray(); rec['sh' + i] = Y.clone().applyQuaternion(L.shin.quaternion).toArray(); }); out[k] = rec; } return out; }
  return { film, draw, probe, joints, render };
}
