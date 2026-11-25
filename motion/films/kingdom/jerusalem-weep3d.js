// jerusalem-weep3d.js — 「kingdom」 10-3 A: 4부 「예루살렘을 보시고 우심」, film 494.7 (N133) → 541.2 (C13), 46.5 s (rounds/r10-pilot/batch3.md §A).
//   N133 「그리고 마침내 예루살렘이 보이는 길. / 사람들이 왕이 오신다고 환호하던 그때,」 · N134 「예수님은 우셨습니다.」 · L102/Q108 눅 19:42 ·
//   N135b 「평화를 주러 오신 왕을 눈앞에 두고도, / 그 성은 알아보지 못했습니다.」 · N136 「예수님이 꿈꾸신 나라는, …」 · N137 「그 꿈을 이루시려고, / 그분은 그 성으로 들어가셨습니다.」
// Look: part 4's "pastel sunset" — a 3D world at golden hour (the engine and people of crowd-evening3d.js / pastel-children.js) under a SOFT pastel
//   pass fixed in the frame (chalk patches, coloured shadows, the paper's tooth only in the darks; no slanted strokes over the whole frame — the
//   owner read a uniform texture as rain). Film refs: 「아라비아의 로렌스」(1962) telephoto crowds in heat haze, small figures; Enrique Simonet
//   「Flevit super illam」(1892): Jerusalem across the Kidron at sunset from the Mount of Olives, the Temple white and gold.
// Shots (every time from beats(B); hard cuts; one slow named move per shot). Fix 1 (rounds/r10-pilot/batch3-fix1.md, owner 2026-11-25):
// people are only backlit silhouettes, far small silhouettes or cast shadows; no mid-distance bodies with lit surfaces, no top-down street.
//   S1 N133a        long lens from high behind the procession, into the low sun over the city: a stream of backlit silhouettes with palm
//                   branches, long shadows back toward us, dust lit, heat shimmer; the city a hazy silhouette above.  move: slow truck right
//   S2 N133b–N134   long lens on the road behind him, into the sun (right of his head, never behind it): backlit silhouettes with a rim,
//                   long shadows along the road toward the lens. He slows over two steps and stops; the others flow on over the brow
//                   (their clock runs down to 0.3x, the lens softens them); his head bows a little, the shoulders drop once. Nobody within
//                   34 m of the lens.                                                                         move: tracking, then push in
//   S3 L102–Q108    (the shoulder shot is cut) far back on the ridge: his small backlit back at the left edge (about 6 % of the frame),
//                   the city across the valley at sunset in layers of haze, the Temple's gold catching the light, altar smoke, swifts.
//                                                                                                               move: slow zoom in
//   S4 N135b        from the east rampart, a low angle across the lower city's roofs rising into the haze at dusk: lamps in windows,
//                   smoke, washing, a few tiny far figures; nobody looks up.                                   move: slow truck/pan right
//   S5 N136         the sun sinks onto the hills right of the Temple; his back small at the left edge.          move: slow crane up
//   S6 N137         his small far silhouette walks away down the road toward the gate, off centre (the lit smoke is to the right, never
//                   above him), lamps lighting in the city and at the gate; settles to a calm dark gold.        move: slow crane up
// People: people3d.js robeMan (two-bone IK, fixed lengths, elbows down/out, planted feet; walks start/stop by a time-warp of the gait, ending on
//   a completed step — pastel-children.js famTau). Palm branches are HELD: each is placed at the solved hand every frame (BODY-CHECK §4).
// Rules kept: Jesus never by face or profile (back view, far, or a soft shoulder edge; head yaw 0 throughout; no halo — the sun is never behind
//   his head); same clothes as other men; men in tied head cloths / turbans with broad level shoulders; no long hair; no blood; no words in art.
// Skills read first (rules.json skills-first; nothing edited at the source): cinematic-3d (lib3d/cine.js + kit.js), cinecode/references/
//   camera-moves.md (the named moves above), canvas-film/references/BODY-CHECK.md + SCENE-RULES.md, feeling-pastel (method only: tooth catch,
//   coloured shadows), oil-paint-world/landmark-map-3d looked at for the city (not this look). Code copied with a note (never edited there):
//   crowd-evening3d.js (rimSun, ground shader, tufts, dust motes, heat shimmer, godRays), olivet3d.js (wallM + the Temple/walls layout),
//   pastel-children.js (the pastel pass, rewritten softer; famTau stop), people3d.js (imported).
//
// Sound cue table for the sound stage (film seconds; durations):
//   494.7–498.9 (4.2)  S1: a great crowd far off, "호산나" swelling in waves (Hebrew/Aramaic, unintelligible), wind on the slope, palm fronds rustle
//   498.9–502.3 (3.4)  S2: the crowd close and around: sandals on the stony road, fronds swishing past (L→R), a child's shout, cloaks underfoot
//   ≈500.8–502.0 (1.2) his two slowing steps: two soft sandal steps, the second a little heavier (the stop)
//   502.3–504.2 (1.9)  the noise drains away: the crowd low-passed and pulled down −20 dB as the picture slows (a long exhale of sound)
//   503.6–504.5 (0.9)  one breath, close and quiet, as the shoulders drop (no sob)
//   505.6–515.2 (9.6)  S3: near silence; wind; very far the crowd; swifts' cries over the city (they circle on screen) ≈507–514; the Temple's evening trumpet far off ≈512 (soft)
//   515.2–522.2 (7.0)  S4: the city's evening murmur from above: a pot set down, a door, water poured, a donkey far off, children; nobody calls up
//   522.2–530.3 (8.1)  S5: the wind drops; one low sustained string note under the setting sun
//   530.3–539.0 (8.7)  S6: his footsteps on the road, slow and even, receding; the city's evening sounds rising faintly ahead
//   539.0–541.2 (2.2)  everything thins to room tone for the chapter title C13
// API: const M = await import('./jerusalem-weep3d.js'); const T = M.beats(B); const JW = await M.build(W, H); JW.draw(ctx, t, T)
//      t = FILM seconds, B = { N133, N134, L102, Q108, N135b, N136, N137, C13, pc: { N133: [piece times], N137: [...] } }. Pure in t.
//      JW.probe(t, T) (camera + emission, no render) · JW.joints(t, T) (bone directions) for the checks.
import { Film, THREE, V, col, rng, noise1 } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const { clamp, lerp, ss } = P;
const sine = x => (1 - Math.cos(Math.PI * clamp(x))) / 2;
const rampI = u => u * u * u - u * u * u * u / 2;   // ∫₀ᵘ smoothstep
const D2R = Math.PI / 180;
const face = (dx, dz) => Math.atan2(-dx, -dz);       // the rotation.y that turns a figure (facing −z) toward (dx, dz)
const NOPASS = typeof location !== 'undefined' && /[?&]nopass=1/.test(location.search);

// ---------------------------------------------------------------- the one table: every visual time from the line times
export function beats(B) {
  const pc = B.pc || {}, n133b = pc.N133 ? pc.N133[1] : B.N133 + 4.1, n137b = pc.N137 ? pc.N137[1] : B.N137 + 3.2;
  const T = { t0: B.N133, end: B.C13 };
  T.cuts = [B.N133, n133b, B.L102, B.N135b, B.N136, B.N137];   // S1 … S6 starts
  T.names = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
  T.jStop = B.N134 - .25;                    // his last step lands just before 「예수님은 우셨습니다」
  T.jDec = 1.9;                              // he slows over two steps
  T.drain = [B.N134 - .35, B.N134 + 1.6];    // the crowd's clock runs down (1 → 0.3) and the lens opens
  T.bow = [B.N134 + .5, B.N134 + 2.3];       // his head bows a little
  T.drop = B.N134 + 1.55;                    // the shoulders drop once (an exhale)
  T.walk6 = B.N137 + .25;                    // S6: he sets off toward the gate (eases in over 1.2 s)
  T.n137b = n137b;
  T.sunset = [B.N136 + .3, B.N137 - .2];     // S5: the disc sinks to the hills
  T.dark = [B.C13 - 2.6, B.C13];             // the frame settles to a calm dark gold
  return T;
}

// ---------------------------------------------------------------- the land: the Mount's west slope, the Kidron, the city's shelf
// x: north (+) / south (−); z: east (+) / west (−); the camera mostly looks west, toward the city. Metres.
const RD = [[95, 120], [62, 78], [30, 40], [11.5, 6], [11, -36], [12, -80], [9, -122], [3, -168], [-10, -214], [-15, -258], [-8, -302], [3, -336], [12, -372], [17, -410], [18, -452]];
const RL = [0]; for (let i = 1; i < RD.length; i++) RL.push(RL[i - 1] + Math.hypot(RD[i][0] - RD[i - 1][0], RD[i][1] - RD[i - 1][1]));
const ROADLEN = RL[RL.length - 1];
function roadAt(s) {   // point + unit tangent (downhill) at arclength s
  s = clamp(s, 0, ROADLEN - 1e-3); let i = 1; while (RL[i] < s) i++;
  const k = (s - RL[i - 1]) / (RL[i] - RL[i - 1]), [ax, az] = RD[i - 1], [bx, bz] = RD[i], L = RL[i] - RL[i - 1];
  // a soft corner: blend the tangent with the next/previous segment's near the joints
  let tx = (bx - ax) / L, tz = (bz - az) / L;
  const nb = (j, w) => { if (j < 1 || j >= RD.length) return; const L2 = RL[j] - RL[j - 1]; tx = lerp(tx, (RD[j][0] - RD[j - 1][0]) / L2, w); tz = lerp(tz, (RD[j][1] - RD[j - 1][1]) / L2, w); };
  if (k > .7) nb(i + 1, ss(.7, 1, k) * .5); if (k < .3) nb(i - 1, ss(.3, 0, k) * .5);
  const n = Math.hypot(tx, tz); return { x: lerp(ax, bx, k), z: lerp(az, bz, k), tx: tx / n, tz: tz / n };
}
function roadNear(x, z) {
  let best = 1e9, bs = 0, bx = 0, bz = 0;
  for (let i = 1; i < RD.length; i++) { const [ax, az] = RD[i - 1], [cx, cz] = RD[i], dx = cx - ax, dz = cz - az, L2 = dx * dx + dz * dz;
    const k = clamp(((x - ax) * dx + (z - az) * dz) / L2), px = ax + dx * k, pz = az + dz * k, d = Math.hypot(x - px, z - pz);
    if (d < best) { best = d; bs = RL[i - 1] + k * Math.sqrt(L2); bx = px; bz = pz; } }
  return { d: best, s: bs, px: bx, pz: bz };
}
function hBase(x, z) {
  const zz = z + 22 * Math.sin(x / 260 + .6) * ss(-70, -170, z), city = ss(-430, -470, z);
  // a level shoulder (z +80 … −40) where the road crests and the city comes into view, then the steep fall to the Kidron
  let y = 10 + 8 * ss(60, 240, zz) - 4 * ss(80, -40, zz) - 76 * ss(-40, -330, zz) + 38 * ss(-345, -445, zz) + 44 * ss(-470, -1050, zz);
  y += 16 * ss(160, 700, Math.abs(x)) * ss(-280, 60, zz);   // the Mount's shoulders rise north and south of the saddle the road crosses
  const flat = 1 - .85 * ss(150, 90, z) * ss(-120, -75, z) * (1 - ss(60, 140, Math.abs(x - 12)));
  y += (3.2 * noise1(x * .013 + z * .007, 3) * flat + 1.4 * noise1(x * .041 - z * .029, 7) * (.4 + .6 * flat) + .5 * noise1(x * .11 + z * .13, 11)) * (1 - .75 * city);
  return y;
}
export function hT(x, z) { const r = roadNear(x, z); if (r.d > 9) return hBase(x, z); const yr = hBase(r.px, r.pz) - .12; return lerp(yr, hBase(x, z), ss(2.6, 9, r.d)); }
const CITYZ = -452;   // the east wall's line

export async function build(W, H) {
  const vert = H > W;
  const film = new Film({
    W, H, dur: 1e4, fov: 30, near: .3, far: 6000,
    atmos: { density: .0016, falloff: .011, base: -70, start: 4, color: col('#d49c6c', .6), colorUp: col('#b8a08e', .52), max: 3500, scatter: 1, anisotropy: .8, phaseMix: .85 },
    bloom: { strength: .08, radius: 1.1, tint: col('#ffd8b0') },
    dof: { focus: 40, aperture: 1.2, maxCoc: 22 },
    look: { exposure: 1.0, contrast: 1.0, saturation: 1.0, lift: col('#1a1420'), shadowTint: col('#cfc6e2'), highTint: col('#fff0d8'), vignette: .3, grain: 0, ca: .2 },
  });
  film.canvas.style.display = 'none';
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither: no per-frame shimmer (owner: no flicker)
  const S = film.scene, cam = film.camera, R = film.renderer;
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;

  // ---------------------------------------------------------------- light (crowd-evening3d.js setSun, copied)
  const sky = K.sky(film, { top: col('#56688c', .5), mid: col('#d49c72', .9), horizon: col('#ffc080', 1.6), sunDir: V(0, .1, -1).normalize(), sunColor: col('#fff0cc', 18), sunGlow: col('#ffb070', 1.5), clouds: .3, cloudColor: col('#ffd2a0', 1.0), cloudShade: col('#a07a7a', .6) });
  const SKY = sky.u;
  const hemi = new THREE.HemisphereLight(col('#b4a8b8'), col('#6e5236'), .55); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffc890'), 3.0); sunL.castShadow = true; sunL.shadow.mapSize.set(4096, 4096);
  Object.assign(sunL.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 2500 }); sunL.shadow.bias = -.0005; sunL.shadow.normalBias = .06;
  S.add(sunL, sunL.target);
  const sunLamp = film.lamp(V(0, 30, -900), '#ffc890', { power: 2000, size: 80, fog: 1 });
  let SUN = V(0, .1, -1).normalize();
  // dirSeen: where the sun is in the sky (the disc, the glow); elevLight: the light's own elevation (a little higher for clean shadows)
  function setSun(dirSeen, elevLight, focus, box, power = 3.0) {
    SUN = dirSeen.clone().normalize(); SKY.sunDir.value.copy(SUN);
    const L = V(SUN.x, 0, SUN.z).normalize(); L.y = Math.tan(elevLight * D2R); L.normalize();
    sunL.target.position.copy(focus); sunL.position.copy(focus).addScaledVector(L, 1200); sunL.intensity = power;
    const c = sunL.shadow.camera; if (c.right !== box) { Object.assign(c, { left: -box, right: box, top: box, bottom: -box }); c.updateProjectionMatrix(); }
    sunLamp.pos.copy(cam.position).addScaledVector(SUN, 1400);
  }
  const sunDirFrom = (view, yawDeg, elevDeg) => { const h = V(view.x, 0, view.z).normalize().applyAxisAngle(V(0, 1, 0), yawDeg * D2R); return V(h.x * Math.cos(elevDeg * D2R), Math.sin(elevDeg * D2R), h.z * Math.cos(elevDeg * D2R)).normalize(); };

  // ---------------------------------------------------------------- the ground (crowd-evening3d.js groundM, copied; the road painted from the polyline)
  const GU = { uSunG: { value: V(0, .05, -1) }, uSheen: { value: .2 }, uRd: { value: RD.map(([x, z]) => new THREE.Vector2(x, z)) } };
  const groundM = key => { const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(.44, .36, .25), roughness: 1 });
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, GU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform vec3 uSunG; uniform float uSheen; uniform vec2 uRd[${RD.length}];\n` + hashGLSL + `
        float roadD(vec2 p){ float d = 1e9; for (int i = 1; i < ${RD.length}; i++){ vec2 a = uRd[i - 1], b = uRd[i], ab = b - a; float k = clamp(dot(p - a, ab) / dot(ab, ab), 0., 1.); d = min(d, length(p - a - ab * k)); } return d; }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec3 vd = normalize(vWP - cameraPosition); float b = pow(max(dot(vd, uSunG), 0.), 5.); totalEmissiveRadiance += diffuseColor.rgb * vec3(1., .72, .45) * b * uSheen; }`)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec2 q = vWP.xz; float n = fb(q * .045), f = fb(q * .6), g = fb(q * 2.7 + 3.);
            vec3 c = mix(diffuseColor.rgb, vec3(.53, .45, .31), smoothstep(.35, .75, fb(q * .12 + 7.)));
            c = mix(c, vec3(.36, .37, .24), smoothstep(-40., -66., vWP.y) * .6 * smoothstep(.4, .6, fb(q * .05 + 2.)));   // the Kidron's floor: groves, greener
            c *= mix(.8, 1.1, n) * mix(.9, 1.06, f) * mix(.94, 1.04, g);
            float steep = 1. - smoothstep(.7, .95, normalize(vWN).y); c = mix(c, vec3(.5, .44, .36), steep * .5);
            float st = smoothstep(.74, .8, fb(q * 1.9 + 5.)); c = mix(c, vec3(.4, .35, .29), st * .45);
            float rd = roadD(q), road = 1. - smoothstep(2.4, 3.6, rd), rut = road * exp(-pow((rd - .9) / .25, 2.)) * .25;
            c = mix(c, vec3(.74, .63, .47) * mix(.9, 1.05, f), road * .85); c *= 1. - rut;
            float city = smoothstep(${CITYZ + 4}., ${CITYZ - 4}., vWP.z); c = mix(c, vec3(.66, .58, .46) * mix(.9, 1.05, f), city * .9);   // inside the walls: beaten earth and stone
            diffuseColor.rgb = c; }`); };
    m.customProgramCacheKey = () => 'jw-ground-' + key; return m; };
  const terrain = (cx, cz, size, seg, key, dy = 0) => { const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + cx, z = p.getZ(i) + cz; p.setY(i, hT(x, z)); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, groundM(key)); m.position.set(cx, dy, cz); m.receiveShadow = true; S.add(m); return m; };
  terrain(0, -500, 3600, 360, 'far');                        // 10 m cells
  terrain(20, -70, 380, 380, 'near', .03);                   // 1 m round the road where the crowd walks
  const S4C = { x: -205, z: -640 };                          // the lower city patch the S4 camera looks down on
  terrain(S4C.x, S4C.z, 160, 160, 'city', .04);
  // far hills beyond the city to the west (and the Mount's shoulders behind the camera in S1)
  { const hm = new THREE.MeshStandardMaterial({ color: '#9a7e6c', roughness: 1 });
    for (let i = 0; i < 11; i++) { const g = new THREE.SphereGeometry(1, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), r = rng(31 + i), pos = g.attributes.position;
      for (let k = 0; k < pos.count; k++) pos.setY(k, pos.getY(k) * (1 + .22 * noise1(pos.getX(k) * 3 + i, i)));
      g.computeVertexNormals(); const m = new THREE.Mesh(g, hm); m.scale.set(260 + r() * 260, 50 + r() * 45, 160 + r() * 120); m.position.set((i - 5) * 330 + r() * 120, -20, -2000 - r() * 500); S.add(m); } }

  // ---------------------------------------------------------------- the city (olivet3d.js wallM + the Temple's layout, copied and re-placed)
  const wallM = (base, key, { win = 0 } = {}) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .92 });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvec4 wp4 = vec4(transformed, 1.);\n#ifdef USE_INSTANCING\nwp4 = instanceMatrix * wp4;\n#endif\nvWP = (modelMatrix * wp4).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + hashGLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 N = normalize(vWN); vec2 q = abs(N.y) > .7 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
            float big = fb(q * .08 + 3.1), fine = fb(q * .9), course = smoothstep(.42, .5, fract(q.y * 1.1 + floor(q.x * .55) * .37)) * (1. - abs(N.y));
            vec3 c = diffuseColor.rgb * mix(.84, 1.1, big) * mix(.93, 1.05, fine) * (1. - course * .06);
            c *= mix(1., .84, smoothstep(.62, .8, fb(vec2(q.x * 1.2, q.y * .15))) * (1. - abs(N.y)));
            ${win ? `{ float side = 1. - abs(N.y); vec2 cell = vec2(q.x * .32, q.y * .3); vec2 f = fract(cell), ci = floor(cell);
              vec2 fw = max(fwidth(cell), vec2(1e-4)); float aa = clamp(max(fw.x, fw.y) * 3.5, 0., 1.);
              float hx = smoothstep(.38 - fw.x, .38 + fw.x, f.x) * (1. - smoothstep(.62 - fw.x, .62 + fw.x, f.x)), hy = smoothstep(.35 - fw.y, .35 + fw.y, f.y) * (1. - smoothstep(.7 - fw.y, .7 + fw.y, f.y));
              float hole = mix(hx * hy * step(.55, hh(ci + 7.)), .038, aa) * side;
              c *= 1. - hole * .72; }` : ''}
            diffuseColor.rgb = c; }`); };
    m.customProgramCacheKey = () => 'jw-wall-' + key; return m; };
  const goldM = new THREE.MeshStandardMaterial({ color: '#d8aa50', roughness: .35, metalness: .5, emissive: col('#ffcf80'), emissiveIntensity: .12 });
  const M = { stone: wallM('#dcc8a2', 'a'), stone2: wallM('#c9b08a', 'b'), pale: wallM('#efe6d2', 'c'), house: wallM('#d4be98', 'h', { win: 1 }), house2: wallM('#c4a47e', 'h2', { win: 1 }),
    dark: K.std('#1c140e', { roughness: 1 }), shade: K.std('#3a2e24', { roughness: 1 }), gold: goldM, wood: K.std('#5a4028', { roughness: .9 }) };
  const box = (w, h, d, x, z, mat, { y = null, ry = 0, cast = true } = {}) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); b.position.set(x, (y ?? hT(x, z)) + h / 2, z); b.rotation.y = ry; b.castShadow = cast; b.receiveShadow = true; S.add(b); return b; };
  const CITY = [[300, CITYZ], [-390, CITYZ], [-430, -820], [-390, -1320], [250, -1330], [330, -900]];
  const inPoly = (x, z, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if (((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi)) c = !c; } return c; };
  const TMB = { x0: -130, x1: 150, z0: -720, z1: CITYZ - 1, top: -14 };
  const GATE = { x: 18, z: CITYZ };
  // walls with towers and a toothed top; the gate (two towers, a dark double arch) where the road arrives
  { const crenG = new THREE.BoxGeometry(1.3, 1.5, 1.3), cren = [], m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
    for (let i = 0; i < CITY.length; i++) { const [ax, az] = CITY[i], [bx, bz] = CITY[(i + 1) % CITY.length], L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az);
      const n = Math.ceil(L / 24);
      for (let j = 0; j < n; j++) { const k0 = j / n, k1 = (j + 1) / n, x = lerp(ax, bx, (k0 + k1) / 2), z = lerp(az, bz, (k0 + k1) / 2);
        if (i === 0 && Math.abs(x - GATE.x) < 13) continue;   // the gate's gap
        const y = Math.min(hT(lerp(ax, bx, k0), lerp(az, bz, k0)), hT(lerp(ax, bx, k1), lerp(az, bz, k1))) - 3;
        const onTemple = i === 0 && x > TMB.x0 && x < TMB.x1, wh = onTemple ? TMB.top - y + 3 : 15, wl = L / n + .5;
        const w = box(3.6, wh, wl, x, z, onTemple ? M.stone : M.stone2, { y }); w.rotation.y = ry;
        for (let c = 0; c < wl / 2.6; c++) { const kk = (c + .5) / (wl / 2.6) - .5; cren.push(m4.compose(V(x + Math.sin(ry) * kk * wl, y + wh + .7, z + Math.cos(ry) * kk * wl), q4.setFromEuler(new THREE.Euler(0, ry, 0)), V(1, 1, 1)).clone()); } }
      for (let j = 0; j <= Math.floor(L / 70); j++) { const k = j / Math.max(1, Math.floor(L / 70)), x = lerp(ax, bx, k), z = lerp(az, bz, k); if (i === 0 && Math.abs(x - GATE.x) < 16) continue;
        const y = hT(x, z) - 3, th = (i === 0 && x > TMB.x0 && x < TMB.x1) ? TMB.top - y + 9 : 24;
        box(9, th, 9, x, z, M.stone, { y }).rotation.y = ry; box(10.4, 1.4, 10.4, x, z, M.stone2, { y: y + th }).rotation.y = ry; } }
    const inst = new THREE.InstancedMesh(crenG, M.stone2, cren.length); cren.forEach((mm, i) => inst.setMatrixAt(i, mm)); inst.castShadow = inst.receiveShadow = true; S.add(inst); }
  { const y = hT(GATE.x, GATE.z) - 2, gh = TMB.top - y + 8;
    box(24, gh, 14, GATE.x, GATE.z - 2, M.stone, { y }); box(25.6, 1.4, 15.6, GATE.x, GATE.z - 2, M.stone2, { y: y + gh });
    for (const sd of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(-2.4, 0); sh.lineTo(-2.4, 5.5); sh.absarc(0, 5.5, 2.4, Math.PI, 0, true); sh.lineTo(2.4, 0); sh.lineTo(-2.4, 0);
      const a = new THREE.Mesh(new THREE.ShapeGeometry(sh, 12), M.dark); a.position.set(GATE.x + sd * 3.3, y + 2.1, GATE.z + 5.05); S.add(a); } }
  // the Temple Mount: platform, Solomon's Porch along the east edge facing us, the Royal Stoa south, the courts, the sanctuary facing east
  const ALTAR = V(20, TMB.top + 4, -540);
  { const { x0, x1, z0, z1, top } = TMB, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, base = -60;
    box(x1 - x0, top - base, z1 - z0, cx, cz, M.stone, { y: base });
    box(26, 20, z1 - z0 - 10, x0 + 13, cz, M.pale, { y: top }); box(20, 7, z1 - z0 - 14, x0 + 25.6, cz, M.dark, { y: top + 2, cast: false });
    box(x1 - x0 - 30, 1.6, 14, cx + 6, z1 - 9, M.pale, { y: top + 11 }); box(x1 - x0 - 32, 10.5, 9, cx + 6, z1 - 10, M.shade, { y: top, cast: false });
    for (let i = 0; i < 26; i++) box(1.2, 10.6, 1.2, x0 + 22 + i * ((x1 - x0 - 34) / 25), z1 - 4.6, M.pale, { y: top });
    box(14, 1.6, z1 - z0 - 40, x1 - 8, cz, M.pale, { y: top + 10 });
    const tx = cx + 10;
    for (const [w, d, x, z] of [[104, 4, tx, -520], [104, 4, tx, -660], [4, 140, tx - 52, -590], [4, 140, tx + 52, -590]]) box(w, 13, d, x, z, M.pale, { y: top });
    box(30, 40, 64, tx, -612, M.pale, { y: top });                 // the sanctuary
    box(46, 38, 12, tx, -575, M.pale, { y: top });                 // the porch, facing east (toward the Mount) …
    box(60, 14, 12, tx, -575, M.pale, { y: top + 38 });            // … wider above, as Herod's porch was
    box(61, 1.3, 12.8, tx, -575, M.stone2, { y: top + 37.4 });
    box(12, 26, .6, tx, -568.7, M.dark, { y: top + 6, cast: false });   // its open doorway
    for (const s of [-17, -10.5, 10.5, 17]) box(1.8, 33, .9, tx + s, -568.6, M.stone, { y: top + 1 });
    box(61, 1.0, 12.6, tx, -575, M.gold, { y: top + 52 }); box(31, .8, 64.4, tx, -612, M.gold, { y: top + 40 });
    for (let i = 0; i < 9; i++) box(.5, 1.8, .5, tx - 28 + i * 7, -575, M.gold, { y: top + 53, cast: false });
    box(9, 4, 9, ALTAR.x, ALTAR.z, M.stone2, { y: top });
    // fix 2 (no plain box faces): pilasters along the upper courses of the east retaining wall, a dark band of shade under the porch roof
    for (let i = 0; i < 46; i++) box(1.3, 9, .8, x0 + 4 + i * ((x1 - x0 - 8) / 45), z1 + .3, M.stone2, { y: top - 9.5 });
    box(x1 - x0, 1.2, 1.4, cx, z1 + .5, M.stone2, { y: top - .6 }); }
  // the Antonia at the platform's north-west corner; Herod's towers in the west
  { const ax = 178, az = -700; box(56, 26, 42, ax, az, M.stone, { y: TMB.top - 6 });
    for (const [dx, dz, h] of [[-26, 19, 50], [26, 19, 38], [-26, -19, 38], [26, -19, 38]]) { box(13, h, 13, ax + dx, az + dz, M.stone2, { y: TMB.top - 6 }); box(14.6, 1.4, 14.6, ax + dx, az + dz, M.stone, { y: TMB.top - 6 + h }); } }
  for (const [x, z, h] of [[-40, -1290, 42], [-70, -1285, 36], [-100, -1280, 32]]) { box(13, h, 13, x, z, M.stone); box(14.6, 1.4, 14.6, x, z, M.stone2, { y: hT(x, z) + h }); }
  // the houses: a grid of blocks with streets between (streets at x = GX0 + i·PX, z = CITYZ − 2 − j·PZ, 4 m wide), lots of flat-roofed houses
  const PX = 26, PZ = 23, GX0 = -416, SW = 4.2;
  const streetX = i => GX0 + i * PX, streetZ = j => CITYZ - 6 - j * PZ;
  const HOUSES = [];
  { const r = rng(808), A = [[], []], C = [[], []], up = [], par = [], m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
    for (let i = 0; i < 30; i++) for (let j = 0; j < 38; j++) {
      const bx0 = streetX(i) + SW / 2, bx1 = streetX(i + 1) - SW / 2, bz0 = streetZ(j) - SW / 2, bz1 = streetZ(j + 1) + SW / 2;
      const nx = r() < .5 ? 2 : 3, nz = 2;
      for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) {
        const lx0 = lerp(bx0, bx1, a / nx), lx1 = lerp(bx0, bx1, (a + 1) / nx), lz0 = lerp(bz0, bz1, b / nz), lz1 = lerp(bz0, bz1, (b + 1) / nz);
        const x = (lx0 + lx1) / 2 + (r() - .5) * .6, z = (lz0 + lz1) / 2 + (r() - .5) * .6;
        if (!inPoly(x, z, CITY) || z > CITYZ - 6) { r(); r(); r(); continue; }
        if (x > TMB.x0 - 8 && x < TMB.x1 + 8 && z < TMB.z1 + 8 && z > TMB.z0 - 8) { r(); r(); r(); continue; }
        if (Math.hypot(x - 178, z + 700) < 45) { r(); r(); r(); continue; }
        const w = Math.abs(lx1 - lx0) - .3 - r() * 1.2, d = Math.abs(lz1 - lz0) - .3 - r() * 1.2, h = 4.4 + r() * 3.6 + (r() < .14 ? 3.5 : 0), y = hT(x, z) - 1.2, k = r() < .62 ? 0 : 1;
        A[k].push(m4.compose(V(x, y + h / 2, z), q4.identity(), V(w, h, d)).clone()); const bb = .84 + r() * .24; C[k].push(new THREE.Color(bb, bb * (.95 + r() * .06), bb * (.88 + r() * .1)));
        HOUSES.push({ x, z, w, d, top: y + h });
        if (r() < .28) { const uw = w * (.35 + r() * .2), ud = d * (.35 + r() * .2); up.push(m4.compose(V(x + (r() - .5) * w * .3, y + h + 1.5, z + (r() - .5) * d * .3), q4, V(uw, 3.0, ud)).clone()); }
        if (r() < .6) par.push(m4.compose(V(x, y + h + .3, z), q4, V(w + .25, .6, d + .25)).clone()); } }
    const hg = new THREE.BoxGeometry(1, 1, 1);
    A.forEach((L, k) => { const inst = new THREE.InstancedMesh(hg, k ? M.house2 : M.house, L.length); L.forEach((mm, i) => { inst.setMatrixAt(i, mm); inst.setColorAt(i, C[k][i]); }); inst.castShadow = inst.receiveShadow = true; S.add(inst); });
    for (const [L, m] of [[up, M.house], [par, M.stone2]]) { const inst = new THREE.InstancedMesh(hg, m, L.length); L.forEach((mm, i) => inst.setMatrixAt(i, mm)); inst.castShadow = inst.receiveShadow = true; S.add(inst); } }
  // awnings over a few doors in the S4 patch (cloth, warm colours): life in the streets
  { const r = rng(2024), cols = ['#9a5a3a', '#7a6a42', '#8a3a2a', '#6a5a6a', '#a88a5a'];
    for (const h of HOUSES) { if (Math.abs(h.x - S4C.x) > 45 || Math.abs(h.z - S4C.z) > 50 || r() > .3) continue;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), K.std(cols[(r() * cols.length) | 0], { side: THREE.DoubleSide, roughness: .9 }));
      const sd = r() < .5 ? -1 : 1; m.position.set(h.x + sd * (h.w / 2 + .6), hT(h.x, h.z) + 1.0, h.z); m.rotation.set(0, Math.PI / 2, .55 * sd); m.rotation.order = 'YZX'; m.castShadow = true; S.add(m); } }

  // ---------------------------------------------------------------- olive trees, rocks, tufts on the Mount and in the valley
  const leafM = K.std('#5e6648', { roughness: .9 }), trunkM = K.std('#3e3226', { roughness: .95 });
  { const r = rng(4242), pts = [];
    for (let n = 0; n < 6000 && pts.length < 520; n++) { const x = (r() - .5) * 900, z = 150 - r() * 560; if (z < -400) continue;
      const rn = roadNear(x, z); if (rn.d < 8) continue; if (z > -35 && z < 125 && Math.abs(x - 18) < 32) continue; const dens = .25 + .75 * ss(-200, -330, z) + .3 * ss(90, 40, z); if (r() > dens) continue; pts.push([x, z, 4.5 + r() * 2.5]); }
    const tg = new THREE.CylinderGeometry(.2, .32, 1, 6); tg.translate(0, .5, 0); const cg = new THREE.IcosahedronGeometry(1, 1);
    const ti = new THREE.InstancedMesh(tg, trunkM, pts.length), ci = new THREE.InstancedMesh(cg, leafM, pts.length * 7), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    pts.forEach(([x, z, h], i) => { const y = hT(x, z) - .1; ti.setMatrixAt(i, m4.compose(V(x, y, z), q.setFromEuler(new THREE.Euler((r() - .5) * .25, 0, (r() - .5) * .25)), V(1, h * .45, 1)));
      for (let k = 0; k < 7; k++) { const a = r() * 6.283, rr = r() * h * .32; ci.setMatrixAt(i * 7 + k, m4.compose(V(x + Math.cos(a) * rr, y + h * (.52 + r() * .3), z + Math.sin(a) * rr), q.setFromEuler(new THREE.Euler(r(), r() * 3, r())), V(1.1, .7, 1).multiplyScalar(.8 + r() * .9)));
        c.setHSL(.2 + r() * .05, .14 + r() * .08, .33 + r() * .08); ci.setColorAt(i * 7 + k, c); } });
    ti.castShadow = ci.castShadow = true; ti.receiveShadow = ci.receiveShadow = true; S.add(ti, ci); }
  { const r = rng(919), n = 1400, g = new THREE.IcosahedronGeometry(1, 1), pp = g.attributes.position; for (let k = 0; k < pp.count; k++) { const f = 1 + .3 * Math.sin(pp.getX(k) * 5 + pp.getZ(k) * 3); pp.setXYZ(k, pp.getX(k) * f, Math.max(-.2, pp.getY(k)) * f, pp.getZ(k) * f); } g.computeVertexNormals();
    const inst = new THREE.InstancedMesh(g, K.std('#8a7a62', { roughness: 1 }), n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    for (let i = 0; i < n; i++) { let x, z; do { x = (r() - .5) * 500; z = 160 - r() * 520; } while (roadNear(x, z).d < 4.5);
      const sz = .2 + r() * r() * .7; q.setFromEuler(new THREE.Euler(0, r() * 6, 0)); inst.setMatrixAt(i, m4.compose(V(x, hT(x, z), z), q, V(sz * (1 + r() * .4), sz * (.6 + r() * .3), sz))); c.setHSL(.09 + r() * .04, .14 + r() * .08, .4 + r() * .12); inst.setColorAt(i, c); }
    inst.castShadow = inst.receiveShadow = true; S.add(inst); }
  const tuftU = { uT: { value: 0 } };
  { const blades = [], r = rng(77);
    for (let i = 0; i < 6; i++) { const a = r() * 6.283, h = .16 + r() * .22, g = new THREE.PlaneGeometry(.02, h, 1, 3); g.translate(0, h / 2, 0);
      const p = g.attributes.position; for (let k = 0; k < p.count; k++) { const y = p.getY(k), u = y / h; p.setX(k, p.getX(k) * (1 - u * .85)); p.setZ(k, u * u * .09); }
      g.rotateY(a); g.translate(Math.cos(a) * .05, 0, Math.sin(a) * .05); blades.push(g); }
    const geo = K.mergeGeometries(blades.map(g => [g, new THREE.Matrix4()]));
    const tm = new THREE.MeshStandardMaterial({ color: '#c8b070', roughness: .9, side: THREE.DoubleSide, emissive: col('#6a4a20'), emissiveIntensity: .45 });
    tm.onBeforeCompile = sh => { Object.assign(sh.uniforms, tuftU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <begin_vertex>', `#include <begin_vertex>
        { vec2 ip = vec2(instanceMatrix[3].x, instanceMatrix[3].z); float w = sin(uT * 1.1 + ip.x * .15 + ip.y * .09) * .6 + sin(uT * 2.3 + ip.x * .4) * .25; transformed.x += w * .05 * position.y * 3.; }`); };
    tm.customProgramCacheKey = () => 'jw-tuft';
    const pts = []; for (let i = 0; i < 9000; i++) { const x = 20 + (r() - .5) * 90, z = -10 - r() * 90, rn = roadNear(x, z); if (rn.d < 3.4 && r() < .9) continue; pts.push([x, z]); }
    const inst = new THREE.InstancedMesh(geo, tm, pts.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    pts.forEach(([x, z], i) => { q.setFromAxisAngle(V(0, 1, 0), r() * 6.283); inst.setMatrixAt(i, m4.compose(V(x, hT(x, z) + .02, z), q, V(1, .7 + r() * .7, 1))); c.setHSL(.12 + r() * .04, .32 + r() * .15, .45 + r() * .14); inst.setColorAt(i, c); });
    inst.receiveShadow = true; S.add(inst); var TUFTS = inst; }

  // ---------------------------------------------------------------- people: materials (crowd-evening3d.js rimSun, copied)
  const RIMU = { uSunV: { value: V(0, 0, -1) }, uRimC: { value: col('#ff9a5a', 1.3) }, uRimK: { value: 1 } };
  const rimSun = (m, key, k = 1) => { m.onBeforeCompile = sh => { Object.assign(sh.uniforms, RIMU); sh.uniforms.uRimS = { value: k };
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunV, uRimC; uniform float uRimK, uRimS;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 3.2);
            totalEmissiveRadiance += uRimC * fr * smoothstep(-.2, .55, dot(normal, uSunV)) * uRimK * uRimS; }`); };
    m.customProgramCacheKey = () => 'jw-rim-' + key; return m; };
  const robeCols = ['#5a4a38', '#4a3e30', '#6a5440', '#3e3428', '#584632', '#4e4234', '#62503c', '#46382a', '#6e5a48'];
  const mantleCols = ['#8a6a32', '#5e5a32', '#7a3424', '#a89a80', '#5a4030', '#4a4640', '#9a8458', '#6a4a2c', '#7c6a48', '#4a5060', '#8a5a4a'];
  const robes = robeCols.map((c, i) => rimSun(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'r' + i));
  const mantles = mantleCols.map((c, i) => rimSun(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'm' + i));
  const faceM = K.std('#1c120a', { roughness: 1 });
  // fix 2 (owner): men read as men in silhouette — a head cloth with a LEVEL top, tied with a FLUSH band (no ring, no bump), ending at the
  // shoulder without flaring (never a veil or long hair). Rebuilds the robeMan 'cloth' head (people3d.js is not edited); keeps head + beard.
  const bandM = K.std('#3a2e24', { roughness: .95 });
  const tidyCloth = g => { const U = g.userData, n = U.neck, s = U.s, head = n.children[0], hk = head.geometry.parameters.radius / (.112 * s), clothMat = n.children[1].material;
    for (const c of n.children.slice(1)) if (!(c.geometry && c.geometry.type === 'SphereGeometry' && c.geometry.parameters.radius < .08 * s)) n.remove(c);
    const L = (pts, a0 = 0, aL = Math.PI * 2) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r * s * hk, y * s * hk)), 24, a0, aL);
    const mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = o.receiveShadow = true; n.add(o); return o; };
    mk(L([[.137, .12], [.142, .2], [.14, .236], [.12, .253], [0, .257]]), clothMat);
    mk(new THREE.CylinderGeometry(.145 * s * hk, .145 * s * hk, .032 * s * hk, 24, 1, true), bandM).position.y = .2 * s * hk;
    mk(L([[.235, -.06], [.2, .02], [.162, .11], [.145, .185]], Math.PI + 1.0, Math.PI * 2 - 2.0), clothMat); return g; };
  const mkMan = (r, o = {}) => { const head = r() < .75 ? 'cloth' : 'bare';
    const g = P.robeMan({ h: 1.66 + r() * .18, broad: 1.04 + r() * .14, head: 'cloth', mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0], face: faceM, ...o });
    P.headwear(g, head, { mat: mantles[(r() * mantles.length) | 0] }); if (head === 'cloth') tidyCloth(g); g.userData.kind = 'man'; return g; };
  const mkWoman = r => { const g = P.robeMan({ h: 1.5 + r() * .12, broad: .86 + r() * .08, head: 'veil', mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0], face: faceM }); g.userData.kind = 'woman'; return g; };
  const mkChild = r => { const hc = r() < .6, g = P.robeMan({ h: 1.0 + r() * .3, child: true, broad: .9, head: hc ? 'cloth' : 'veil', mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0], face: faceM }); if (hc) tidyCloth(g); g.userData.kind = 'child'; return g; };
  // HIM: the same clothes as the other men (oatmeal robe, grey-brown head cloth tied with a band), broad level shoulders
  const jRobe = rimSun(K.std('#c8b694', { roughness: .95, side: THREE.DoubleSide }), 'jr', 1.15), jCloth = rimSun(K.std('#8a7a66', { roughness: .95, side: THREE.DoubleSide }), 'jc', 1.15);
  const J = P.robeMan({ h: 1.78, broad: 1.18, head: 'cloth', mat: jRobe, cloth: jCloth, face: faceM }); P.headwear(J, 'cloth'); S.add(J);
tidyCloth(J);   // the tied head cloth (fix 2)
  const JTg = 1.15, JV = 1.0, JL = JV * JTg / 2;                    // his stride: one step per half stride at 1 m/s
  const S_STOP = roadNear(9, -40).s, J_U = 2.0;                     // where he stops (arclength along the road; lateral offset)
  const posOn = (s, u) => { const p = roadAt(s); const x = p.x - p.tz * u, z = p.z + p.tx * u; return { x, z, y: hT(x, z), tx: p.tx, tz: p.tz }; };
  const JSTOP = posOn(S_STOP, J_U);
  const TEMPLE = V(20, TMB.top + 22, -580);
  const DIRC = V(TEMPLE.x - JSTOP.x, 0, TEMPLE.z - JSTOP.z).normalize();   // from where he stops to the Temple

  // palm branches: a stem with two rows of drooping leaflets, built along +y with the GRIP at the origin
  const palmGeo = (() => { const parts = [], L0 = -.32, L1 = 1.25;
    const stem = new THREE.CylinderGeometry(.01, .017, L1 - L0, 5); stem.translate(0, (L0 + L1) / 2, 0); parts.push([stem, new THREE.Matrix4()]);
    // leaflets: thin blades from the stem, pointing up and out at ≈38° (a feathered V, the two rows folded ±28° round the stem), longest
    // low, shortening to the tip, each bowing outward a little — in silhouette a frond, not a fan of stripes
    for (let i = 0; i < 22; i++) { const y = .12 + i * (L1 - .12) / 22, len = .36 * Math.pow(1 - i / 22, .7) + .05;
      for (const sd of [-1, 1]) { const g = new THREE.PlaneGeometry(.022, len, 1, 3); g.translate(0, len / 2, 0); const p = g.attributes.position;
        for (let k = 0; k < p.count; k++) { const u = p.getY(k) / len; p.setX(k, p.getX(k) * (1 - u * .8) + u * u * .05 * len); }
        const m = new THREE.Matrix4().makeTranslation(0, y, 0).multiply(new THREE.Matrix4().makeRotationY(sd * .75)).multiply(new THREE.Matrix4().makeRotationZ(-sd * .6));
        parts.push([g, m]); } }
    return K.mergeGeometries(parts); })();
  const palmM = rimSun(K.std('#5a6a34', { roughness: .8, side: THREE.DoubleSide }), 'palm', 1.4);

  // ---------------------------------------------------------------- the crowd on the road (S1, S2, S3; far down the road in S5/S6)
  // every walker: s(τ) = s0 + V·(τ − T0) along the road, lateral u; τ = the crowd's clock (slows to 0.3× at N134); one speed for all (planted feet)
  const CROWD = [], CV = 1.0;
  let T = null;
  { const r = rng(4101), lanes = [-2.5, -1.7, -.9, -.1, .7, 1.5, 2.3];
    // the crowd stretches from 150 m behind his stop point to 70 m ahead (in s at the block's start)
    for (let s = S_STOP - 160; s < S_STOP + 75; ) { const core = s > S_STOP - 48 && s < S_STOP + 40; s += core ? 1.15 + r() * .4 : 2.3 + r() * .8;
     for (const u0 of lanes) {
      if (r() < (core ? (s > S_STOP - 7 ? .72 : .6) : .56)) continue;
      const u = u0 + (r() - .5) * .45, rel = s - (S_STOP - 7.5);           // relative to his own s at the block start (he is ≈7.5 m before his stop)
      if (Math.abs(u - J_U) < .9 && rel < 1.6 && rel > -46) continue;   // the lane behind him stays clear (the long lens sees him through it)
      if (Math.abs(u - J_U) < .8 && rel > -1.2 && rel < 1.6) continue;
      const kk = r(), g = kk < .14 ? mkChild(r) : kk < .44 ? mkWoman(r) : mkMan(r); S.add(g);
      const U = g.userData, child = U.kind === 'child', Tg = child ? .78 + r() * .1 : 1.05 + r() * .14;
      U.s0 = s; U.u = u; U.Tg = Tg; U.L = CV * Tg / 2; U.ph = r(); U.gp = r() * Tg;
      const a = r(); U.act = child ? (a < .45 ? 'palm' : 'walk') : U.kind === 'woman' ? (a < .35 ? 'palm' : a < .45 ? 'cheer' : 'walk') : (a < .5 ? 'palm' : a < .64 ? 'cheer' : 'walk');
      U.wph = r() * 6.283; U.wT = 1.15 + r() * .35; U.wA = .12 + r() * .07;
      if (U.act === 'palm') { const pm = new THREE.Mesh(palmGeo, palmM); pm.castShadow = true; pm.scale.setScalar(child ? .7 : 1); S.add(pm); U.palm = pm; U.side = r() < .75 ? 1 : 0; }
      CROWD.push(g); } } }
  // people standing on the slope beside the road, cheering as it passes (they do not walk)
  const SIDE = [];
  { const r = rng(5150);
    for (let i = 0; i < 46; i++) { const s = S_STOP - 120 + r() * 170, sd = r() < .5 ? -1 : 1, u = sd * (4.2 + r() * 4.5), p = posOn(s, u);
      const kk = r(), g = kk < .2 ? mkChild(r) : kk < .45 ? mkWoman(r) : mkMan(r); S.add(g);
      g.position.set(p.x, p.y, p.z); g.rotation.y = face(-p.tz * -sd, p.tx * -sd) + (r() - .5) * .8;   // facing the road
      const U = g.userData; U.sRoad = s; U.ph = r(); U.act = r() < .55 ? 'palm' : 'cheer'; U.wph = r() * 6.283; U.wT = 1.1 + r() * .4; U.wA = .12 + r() * .08;
      if (U.act === 'palm') { const pm = new THREE.Mesh(palmGeo, palmM); pm.castShadow = true; pm.scale.setScalar(U.kind === 'child' ? .7 : 1); S.add(pm); U.palm = pm; U.side = 1; }
      SIDE.push(g); } }
  // cloaks spread on the road (Luke 19:36) — flat cloths laid on the ground, following it
  const CLOAKS = [];
  { const r = rng(6006), cols = ['#7a3424', '#5e5a32', '#8a6a32', '#4a5060', '#9a8458', '#6a4a2c', '#a89a80'];
    for (let i = 0; i < 30; i++) { const s = S_STOP - 60 + r() * 90, u = (r() - .5) * 4.2, c = posOn(s, u), a = r() * 6.283, w = 1.3 + r() * .5, d = .9 + r() * .4;
      const g = new THREE.PlaneGeometry(w, d, 8, 6); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
      for (let k = 0; k < p.count; k++) { const lx = p.getX(k), lz = p.getZ(k), x = c.x + lx * Math.cos(a) - lz * Math.sin(a), z = c.z + lx * Math.sin(a) + lz * Math.cos(a);
        p.setXYZ(k, x, hT(x, z) + .025 + .025 * Math.sin(lx * 7 + i) * Math.sin(lz * 5 + i), z); }
      g.computeVertexNormals(); const m = new THREE.Mesh(g, K.std(cols[i % cols.length], { roughness: .95, side: THREE.DoubleSide })); m.receiveShadow = true; S.add(m); CLOAKS.push(m); } }

  // the crowd's clock: 1× until the drain, then down to 0.3× (an integral of a smoothstep — no step in speed); after S3 it stays 0.3×
  const crowdTau = t => { const a = T.drain[0], D = T.drain[1] - T.drain[0], k = .7; if (t <= a) return t; const u = (t - a) / D; return u < 1 ? t - k * D * rampI(u) : t - k * (D * .5 + (t - a - D)); };
  function poseWave(g, t, tc, w, extra = {}) {   // a walking/standing figure with its arms: a palm waved high, or both hands up
    const U = g.userData, s = U.s, act = U.act, ph = tc * 6.283 / U.wT + U.wph;
    const P0 = { ...w, ...extra };
    if (act === 'palm') { const sd = U.side ? 1 : -1, i = U.side ? 1 : 0, lat = U.wA * Math.sin(ph);
      const hand = V(sd * (.42 * s + .7 * lat), (1.44 + .04 * Math.sin(ph * 2 + 1)) * s, -.36 * s), hands = [null, null]; hands[i] = hand; P0.hands = hands;
      P0.head = [.06 + .03 * Math.sin(ph * .5), 0]; }
    else if (act === 'cheer') { const k = .5 + .5 * Math.sin(ph * .5);
      P0.hands = [V(-.42 * s, (1.48 + .08 * k) * s, -.3 * s), V(.42 * s, (1.48 + .08 * (1 - k)) * s, -.3 * s)]; P0.head = [.12, 0]; }
    P.pose(g, P0);
    if (U.palm) { g.updateMatrix(); const i = U.side ? 1 : 0, hw = P.handAt(g, i).applyMatrix4(g.matrix);
      const tilt = .42 * Math.sin(ph - .55) + (U.side ? -.12 : .12), d = V(Math.sin(tilt), Math.cos(tilt), -.22).normalize().applyAxisAngle(V(0, 1, 0), g.rotation.y);
      U.palm.position.copy(hw); U.palm.quaternion.setFromUnitVectors(V(0, 1, 0), d); }
  }
  // offset: seconds added to the crowd's clock (later shots: they have gone on down the road); sMin: nobody shown behind this arclength
  function crowdAt(t, offset = 0, sMin = -1e9, sMax = 1e9) {
    const tc = crowdTau(t) + offset;
    for (const g of CROWD) { const U = g.userData, s = U.s0 + CV * (tc - T.t0);
      const show = s < ROADLEN - 2 && s > sMin && s < sMax; g.visible = show; if (U.palm) U.palm.visible = show; if (!show) continue;
      const p = posOn(s, U.u); g.position.set(p.x, p.y, p.z); g.rotation.y = face(p.tx, p.tz);
      const w = P.walk(g, tc + U.gp + 50, 0, { T: U.Tg, L: U.L });
      poseWave(g, t, tc, w); }
    for (const g of SIDE) { const U = g.userData; if (!g.visible) continue; poseWave(g, t, tc, P.idle(tc, U.ph, { s: U.s })); }
  }
  const setVis = (arr, v) => { for (const g of arr) { g.visible = v; if (g.userData.palm) g.userData.palm.visible = v; if (g.userData.obj) g.userData.obj.visible = v; if (g.userData.stool) g.userData.stool.visible = v; } };

  // ---------------------------------------------------------------- HIM: walks, slows over two steps, stops (famTau: the walk ends on a completed step)
  function jClock(t) { const tStop = T.jStop, dec = T.jDec, tD = tStop - dec, half = JTg / 2;
    const nh = Math.ceil((tD - (T.t0 - 6) + dec / 2) / half), total = nh * half, tRef = tD - (total - dec / 2);
    let tau; if (t < tD) tau = t - tRef; else if (t < tStop) { const u = (t - tD) / dec; tau = (total - dec / 2) + dec * (u - rampI(u)); } else tau = total;
    return { tau, total, nh, stopped: t >= tStop }; }
  function jPose(t, shot) {
    const s = J.userData.s;
    if (shot === 'S6') {   // he sets off down the road toward the gate: the gait eases in over 1.2 s (a time-warp), then walks on at 0.9 m/s
      const a = T.cuts[5] + .1, e = .7, u = (t - a) / e, tau = t <= a ? 0 : u < 1 ? e * rampI(u) : e * .5 + (t - a - e), L = 1.15 * JTg / 2;
      const dist = tau / (JTg / 2) * L, p = posOn(S_STOP + dist, J_U); J.position.set(p.x, p.y, p.z); J.rotation.y = face(p.tx, p.tz);
      const w = P.walk(J, tau, 0, { T: JTg, L }), k = ss(a, a + 1.4, t);
      const id = P.idle(t, .3, { s });
      P.pose(J, { ...(tau > 0 ? w : { ...id, feet: [{ u: L / 2, lift: 0 }, { u: -L / 2, lift: 0 }] }), head: [lerp(-.58, -.08, ss(a, a + 2.5, t)), 0], lean: (tau > 0 ? w.lean : 0) - .2 * (1 - ss(a, a + 2, t)), swing: tau > 0 ? w.swing.map(v => v * .8) : [0, 0], breath: P.breath(t, .3) });
      return; }
    const c = jClock(t), dist = c.tau / (JTg / 2) * JL, sNow = S_STOP - (c.total / (JTg / 2) * JL - dist), p = posOn(sNow, J_U);
    J.position.set(p.x, p.y, p.z);
    // he turns from the road's line to face the city squarely as he slows (yaw eased; back to the camera — never a profile)
    const yRoad = face(p.tx, p.tz), yCity = face(DIRC.x, DIRC.z), ky = ss(T.jStop - T.jDec, T.jStop + .4, t); J.rotation.y = yRoad + Math.atan2(Math.sin(yCity - yRoad), Math.cos(yCity - yRoad)) * ky;
    const bow = ss(T.bow[0], T.bow[1], t), dp = T.drop, inh = ss(dp - .7, dp - .1, t) * (1 - ss(dp - .1, dp + .9, t)), drop = ss(dp - .05, dp + .95, t);
    if (!c.stopped) { const w = P.walk(J, c.tau, 0, { T: JTg, L: JL }); P.pose(J, { ...w, head: [-.03, 0], breath: P.breath(t, .3), swing: w.swing.map(v => v * .7) }); return; }
    const n = c.nh, odd = n % 2 === 1, k = clamp((t - T.jStop) / .9), id = P.idle(t, .3, { s });
    const stance = odd ? [{ u: -JL / 2, lift: 0 }, { u: JL / 2, lift: 0 }] : [{ u: JL / 2, lift: 0 }, { u: -JL / 2, lift: 0 }];
    P.pose(J, { feet: stance, bob: lerp(-.02 * s, -.006, ss(0, 1, k)) - .1 * s * drop, lean: lerp(-.06, -.03, k) - .14 * bow - .12 * drop, side: 0, twist: 0,
      breath: lerp(.5 + .5 * Math.sin(t * 1.45 + 1.9), 1, inh) * (1 - drop) + .05 * drop, head: [-.03 - .55 * bow, 0], swing: [.02 * (1 - k) + .04 * drop, -.02 * (1 - k) + .04 * drop], abd: [.05, .05] });
  }

  // ---------------------------------------------------------------- the city's people (S4): busy in the streets and on the roofs, nobody looks up
  const CITYP = [];
  { const r = rng(7077), ix = Math.round((S4C.x - GX0) / PX), jz = Math.round((CITYZ - 6 - S4C.z) / PZ);
    const streets = []; for (let i = ix - 2; i <= ix + 2; i++) streets.push({ kind: 'x', c: streetX(i) }); for (let j = jz - 2; j <= jz + 2; j++) streets.push({ kind: 'z', c: streetZ(j) });
    for (let n = 0; n < 46; n++) { const st = n < 22 ? streets[2] : streets[(r() * streets.length) | 0], along = (r() - .5) * 90, off = (r() - .5) * 2.2, dir = r() < .5 ? 1 : -1;
      const kk = r(), g = kk < .45 ? mkWoman(r) : kk < .85 ? mkMan(r) : mkChild(r); S.add(g);
      const U = g.userData; Object.assign(U, { st, along, off, dir, Tg: U.kind === 'child' ? .8 : 1.1 + r() * .15, ph: r(), gp: r() * 2 });
      U.L = U.kind === 'child' ? .42 : .5 + r() * .1; U.v = U.L / (U.Tg / 2);
      U.carry = U.kind === 'woman' && r() < .55 ? 'jar' : U.kind === 'man' && r() < .45 ? 'sack' : null;
      if (U.carry === 'jar') { const j = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.1, .02], [.13, .12], [.11, .24], [.05, .3], [.06, .34]].map(([a, b]) => new THREE.Vector2(a, b)), 12), rimSun(K.std('#a8704a', { roughness: .8 }), 'jar', 1.2)); j.castShadow = true; S.add(j); U.obj = j; }
      if (U.carry === 'sack') { const k2 = new THREE.Mesh(new THREE.SphereGeometry(.2, 10, 8), rimSun(K.std('#8a7a5a', { roughness: 1 }), 'sack', 1.1)); k2.scale.set(1.2, .8, .9); k2.castShadow = true; S.add(k2); U.obj = k2; }
      CITYP.push(g); }
    // on the roofs: people sitting at the parapet, one bent over spreading cloth to dry, one walking across — heads down at their work
    const roofs = HOUSES.filter(h => Math.abs(h.x - S4C.x) < 26 && Math.abs(h.z - S4C.z) < 32 && h.w > 4 && h.d > 4);
    for (let n = 0; n < Math.min(12, roofs.length); n++) { const h = roofs[(r() * roofs.length) | 0]; if (h.used) continue; h.used = true;
      const kk = r(), g = kk < .5 ? mkWoman(r) : mkMan(r); S.add(g); const U = g.userData;
      U.roof = h; U.mode = n % 3 === 0 ? 'sit' : n % 3 === 1 ? 'spread' : 'stand'; U.ph = r(); U.yaw = r() * 6.283;
      g.position.set(h.x + (r() - .5) * h.w * .4, h.top, h.z + (r() - .5) * h.d * .4); g.rotation.y = U.yaw;
      if (U.mode === 'spread') { const cl = new THREE.Mesh(new THREE.PlaneGeometry(.62, .78, 4, 4), K.std(['#e8dcc0', '#c8a878', '#b07050'][n % 3], { roughness: .95, side: THREE.DoubleSide })); cl.castShadow = true; S.add(cl); U.obj = cl; U.clBase = cl.geometry.attributes.position.array.slice(); }
      if (U.mode === 'sit') { const st = new THREE.Mesh(K.roundedBox(.42, .4, .36, .04, 2), K.std('#8a7458', { roughness: 1 })); st.castShadow = st.receiveShadow = true;
        const back = V(-Math.sin(U.yaw), 0, -Math.cos(U.yaw)).multiplyScalar(-.05); st.position.set(g.position.x + back.x, h.top + .2, g.position.z + back.z); st.rotation.y = U.yaw; S.add(st); U.stool = st; }
      CITYP.push(g); } }
  function cityPeopleAt(t) {
    for (const g of CITYP) { const U = g.userData;
      if (U.roof) { const id = P.idle(t, U.ph, { s: U.s });
        if (U.mode === 'sit') { const rs = P.rockSit(.4, U.s); P.pose(g, { ...rs, head: [-.32, .1 * Math.sin(t * .3 + U.ph * 9)], breath: id.breath, hands: [P.kneeHand(g, -1, rs), P.kneeHand(g, 1, rs)] }); }
        else if (U.mode === 'spread') {   // shaking out a cloth to dry: both hands on its top edge, the cloth hanging from them (it never leaves the hands)
          const s = U.s, k = Math.sin(t * 2.1 + U.ph * 6), hy = (1.02 + .05 * k) * s, hz = -.34 * s;
          P.pose(g, { ...id, lean: -.08, head: [-.38, 0], hands: [V(-.25 * s, hy, hz), V(.25 * s, hy, hz)] });
          g.updateMatrix(); const c = V(0, hy - .39, hz - .02).applyMatrix4(g.matrix); U.obj.position.copy(c); U.obj.rotation.set(0, g.rotation.y, 0);
          const p = U.obj.geometry.attributes.position, B0 = U.clBase; for (let i = 0; i < p.count; i++) { const y = B0[i * 3 + 1], dn = (.39 - y) / .78; p.setZ(i, .06 * dn * Math.sin(t * 2.1 + U.ph * 6 - dn * 2.2)); } p.needsUpdate = true; }
        else P.pose(g, { ...id, head: [-.4, .15 * Math.sin(t * .25 + U.ph * 5)] });   // standing at the parapet, looking down into the street
        continue; }
      const tt = t + U.gp, along = U.along + U.dir * U.v * (tt - 500), st = U.st;
      const wrap = ((along + 60) % 120 + 120) % 120 - 60;   // they walk out of the patch and come back from the other end (never in view: ±60 m)
      const x = st.kind === 'x' ? st.c + U.off : S4C.x + wrap, z = st.kind === 'z' ? st.c + U.off : S4C.z + wrap;
      g.position.set(x, hT(x, z), z); g.rotation.y = st.kind === 'x' ? (U.dir > 0 ? Math.PI : 0) : (U.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
      const w = P.walk(g, tt + 50, 0, { T: U.Tg, L: U.L }), s = U.s;
      const ex = { head: [U.carry === 'jar' ? 0 : -.24, 0] }, bob = w.bob || 0;
      if (U.carry === 'jar') ex.hands = [null, V(.14 * s, 1.9 * s + bob, 0)];            // a jar balanced on the head, one hand on its side
      if (U.carry === 'sack') ex.hands = [V(-.13 * s, 1.6 * s + bob, -.13 * s), null];   // a sack on the left shoulder, the hand on its front
      P.pose(g, { ...w, ...ex, swing: [U.carry === 'sack' ? 0 : w.swing[0], U.carry === 'jar' ? 0 : w.swing[1]] });
      if (U.obj) { g.updateMatrix(); const hp = U.carry === 'jar' ? V(0, 1.78 * s + bob, 0) : V(-.2 * s, 1.58 * s + bob, .02 * s); const pw = hp.applyMatrix4(g.matrix); U.obj.position.copy(pw); U.obj.rotation.y = g.rotation.y; }
    }
  }

  // ---------------------------------------------------------------- particles: dust from the feet (S1/S2), motes in the sun, smoke from the altar and the houses, lamps
  // smoke: soft sprites whose whole life is a function of t (seeded) — a steady emission, nothing per frame random
  const SMK = []; { const r = rng(909);
    const add = (x, y, z, n, rise, spread, k) => { for (let i = 0; i < n; i++) SMK.push({ x, y, z, ph: i / n + r() * .02, life: 9 + r() * 5, rise: rise * (.8 + r() * .4), spread, k, sd: r() * 6.283, a: .07 + r() * .07 }); };
    for (const h of HOUSES.filter((h, i) => i % 97 === 13).slice(0, 14)) add(h.x, h.top + .5, h.z, 26, 2.2, 6, .7); }
  const NS = SMK.length, smkPos = new Float32Array(NS * 3), smkSz = new Float32Array(NS), smkA = new Float32Array(NS);
  const smkU = { uPx: { value: 1000 }, uC: { value: col('#d8c4b0', 1) } };
  const smoke = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(smkPos, 3)); g.setAttribute('aSz', new THREE.BufferAttribute(smkSz, 1)); g.setAttribute('aA', new THREE.BufferAttribute(smkA, 1));
    const m = new THREE.ShaderMaterial({ uniforms: smkU, transparent: true, depthWrite: false,
      vertexShader: `attribute float aSz, aA; uniform float uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(uPx * aSz / -mv.z, 1., 400.); vA = aA * smoothstep(1., 5., gl_PointSize); }`,
      fragmentShader: `uniform vec3 uC; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 8.) - .03; if (a <= 0.) discard; gl_FragColor = vec4(uC, a * vA); }` });
    const p = new THREE.Points(g, m); p.frustumCulled = false; S.add(p); return p; })();
  let smkAlive = 0;
  function smokeAt(t) { smkAlive = 0;
    SMK.forEach((q, i) => { const L = q.life, age = ((t / L + q.ph) % 1) * L, k = age / L, wind = V(-.35, 0, -.6);
      const y = q.y + q.rise * age * (1 - .25 * k), dx = wind.x * age * age * .05 * q.k + Math.sin(q.sd + age * .4) * .5 * k * q.k, dz = wind.z * age * age * .05 * q.k + Math.cos(q.sd + age * .3) * .5 * k * q.k;
      smkPos[i * 3] = q.x + dx; smkPos[i * 3 + 1] = y; smkPos[i * 3 + 2] = q.z + dz; smkSz[i] = (1.2 + q.spread * k) * q.k; smkA[i] = q.a * ss(0, .12, k) * (1 - ss(.5, 1, k)); if (smkA[i] > .01) smkAlive++; });
    const g = smoke.geometry; g.attributes.position.needsUpdate = true; g.attributes.aSz.needsUpdate = true; g.attributes.aA.needsUpdate = true; }
  // dust kicked up by the procession's feet: born along the crowd (each particle's whole life from t), lit warm in the low sun
  const ND = 220, dPos = new Float32Array(ND * 3), dSz = new Float32Array(ND), dA = new Float32Array(ND), DSEED = [];
  { const r = rng(4040); for (let i = 0; i < ND; i++) DSEED.push({ s: -150 + r() * 220, u: (r() - .5) * 5.4, life: 2.6 + r() * 2.4, ph: r(), up: .2 + r() * .45, drift: .2 + r() * .4, s0: .35 + r() * .5, a: .03 + r() * .05 }); }
  const dustU = { uPx: { value: 1000 } };
  const dust = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(dPos, 3)); g.setAttribute('aSz', new THREE.BufferAttribute(dSz, 1)); g.setAttribute('aA', new THREE.BufferAttribute(dA, 1));
    const m = new THREE.ShaderMaterial({ uniforms: dustU, transparent: true, depthWrite: false,
      vertexShader: `attribute float aSz, aA; uniform float uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(uPx * aSz / -mv.z, 1., 480.); vA = aA * smoothstep(1., 6., gl_PointSize); }`,
      fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 9.) - .02; if (a <= 0.) discard; gl_FragColor = vec4(vec3(.9, .68, .46), a * vA); }` });
    const p = new THREE.Points(g, m); p.frustumCulled = false; S.add(p); return p; })();
  let dustAlive = 0;
  function dustAt(t) { const tc = crowdTau(t); dustAlive = 0;
    DSEED.forEach((q, i) => { const L = q.life, tb = Math.floor((tc + q.ph * L) / L) * L - q.ph * L, age = tc - tb, k = age / L;
      const p = posOn(S_STOP + q.s + CV * (tb - T.t0) * .0, q.u);   // born where the feet are (the crowd fills this stretch through the block)
      dPos[i * 3] = p.x + q.drift * age * .5; dPos[i * 3 + 1] = p.y + .05 + q.up * (1 - Math.exp(-age * .8)) * 1.6; dPos[i * 3 + 2] = p.z - q.drift * age * .3;
      dSz[i] = q.s0 + 1.6 * k; dA[i] = q.a * ss(0, .25, k) * (1 - ss(.45, 1, k)); if (dA[i] > .01) dustAlive++; });
    const g = dust.geometry; g.attributes.position.needsUpdate = true; g.attributes.aSz.needsUpdate = true; g.attributes.aA.needsUpdate = true; }
  // the city's lamps (S6): small warm points in windows and on the roofs, lighting one after another as the light goes; two at the gate
  const LAMPS = []; { const r = rng(3131); for (const h of HOUSES) { if (r() > (Math.abs(h.x - S4C.x) < 70 && Math.abs(h.z - S4C.z) < 110 ? .3 : .05)) continue; LAMPS.push({ p: V(h.x + (r() - .5) * h.w * .5, h.top - 1.6 - r() * 1.5, h.z + h.d / 2 + .05), k: .5 + r() * .7, t: r() }); }
    for (const sd of [-1, 1]) LAMPS.push({ p: V(GATE.x + sd * 7.5, hT(GATE.x, GATE.z) + 4.5, GATE.z + 5.4), k: 3.2, t: 0, gate: true }); }
  const lampPos = new Float32Array(LAMPS.length * 3), lampA = new Float32Array(LAMPS.length), lampS = new Float32Array(LAMPS.length);
  LAMPS.forEach((L, i) => { lampPos.set([L.p.x, L.p.y, L.p.z], i * 3); lampS[i] = L.gate ? 1.6 : .8; });
  const lampU = { uPx: { value: 1000 } };
  const lamps = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(lampPos, 3)); g.setAttribute('aA', new THREE.BufferAttribute(lampA, 1)); g.setAttribute('aSz', new THREE.BufferAttribute(lampS, 1));
    const m = new THREE.ShaderMaterial({ uniforms: lampU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aA, aSz; uniform float uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(uPx * aSz / -mv.z, 6., 30.); vA = aA; }`,
      fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 18.); gl_FragColor = vec4(vec3(1., .66, .3) * 3.2, a * vA); }` });
    const p = new THREE.Points(g, m); p.frustumCulled = false; S.add(p); return p; })();
  const gateLamps = LAMPS.filter(L => L.gate).map(L => film.lamp(L.p, '#ffb060', { power: 0, size: 3, fog: 1 }));
  // motes in the low sun near the camera (crowd-evening3d.js dust, copied; tens, depth-faded)
  const moteU = { uT: { value: 0 }, uA: { value: 1 }, uPx: { value: H / 1920 }, uC: { value: V() } };
  { const n = 90, Rr = rng(57), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (Rr() - .5) * 10; p[i * 3 + 1] = Rr() * 4; p[i * 3 + 2] = -Rr() * 16; sd[i] = Rr(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: moteU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx; uniform vec3 uC; varying float vA;
        void main(){ vec3 q = position + uC; q.y += mod(uT * (.05 + .06 * aS) + aS * 4., 4.) - 2. * aS; q.x += sin(uT * .4 + aS * 30.) * .3; q.z += cos(uT * .3 + aS * 17.) * .3;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (2. + 4. * aS) * 12. / d, 1., 12.); vA = clamp(1.2 - d / 16., 0., 1.) * (.4 + .6 * aS); }`,
      fragmentShader: `uniform float uA; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 14.); gl_FragColor = vec4(vec3(1., .82, .58) * 1.4, a * vA * uA); }` });
    var motes = new THREE.Points(g, m); motes.frustumCulled = false; S.add(motes); }

  // ---------------------------------------------------------------- swifts over the city at dusk (S3–S5): small dark V's circling, wings beating — pure in t
  const BIRDS = []; { const r = rng(6161), bm = new THREE.MeshBasicMaterial({ color: '#2a2026', side: THREE.DoubleSide });
    for (let i = 0; i < 16; i++) { const g = new THREE.Group(), wing = sd => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(sd * .55, .06); sh.lineTo(sd * .5, -.05); sh.lineTo(0, -.08); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), bm); g.add(m); return m; };
      const w0 = wing(1), w1 = wing(-1); g.userData = { w0, w1, r: 40 + r() * 90, h: 38 + r() * 40, w: (.25 + r() * .2) * (r() < .5 ? 1 : -1), ph: r() * 6.283, fl: 7 + r() * 3, cx: TEMPLE.x - 60 + r() * 120, cz: TEMPLE.z - 40 + r() * 80 };
      g.scale.setScalar(2.4); S.add(g); BIRDS.push(g); } }
  function birdsAt(t, on, C = null) { for (const g of BIRDS) { g.visible = on; if (!on) continue; const U = g.userData, a = U.ph + U.w * t, cx = C ? C.x + (U.cx - TEMPLE.x) * .6 : U.cx, cz = C ? C.z + (U.cz - TEMPLE.z) * .6 : U.cz, cy = C ? C.y + (U.h - 58) * .5 : U.h;
      g.position.set(cx + Math.cos(a) * U.r * (C ? .55 : 1), cy + 6 * Math.sin(t * .4 + U.ph), cz + Math.sin(a) * U.r * (C ? .55 : 1)); g.rotation.set(0, -a + (U.w > 0 ? 0 : Math.PI), 0);
      const f = Math.sin(t * U.fl + U.ph) * .6; U.w0.rotation.z = f; U.w1.rotation.z = -f; } }
  // washing on lines between posts on the lower city's roofs (S4): cloths swaying a little in the evening wind
  const WASH = []; { const r = rng(7373), cm = ['#e8dcc0', '#c8a878', '#b07050', '#8a7a9a', '#d8c8a0'];
    for (const h of HOUSES.filter(h => Math.abs(h.x - S4C.x - 10) < 45 && h.z < CITYZ - 10 && h.z > CITYZ - 170 && h.w > 4.5).slice(0, 34)) { if (r() < .4) continue;
      const len = Math.min(h.w, 5) * .8, y = h.top + 1.5, line = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, len, 4), K.std('#3a2e26')); line.rotation.z = Math.PI / 2; line.position.set(h.x, y, h.z); S.add(line);
      for (const sd of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.5, 5), K.std('#4a3a2a')); p.position.set(h.x + sd * len / 2, h.top + .75, h.z); S.add(p); }
      const n = 2 + ((r() * 3) | 0); for (let k = 0; k < n; k++) { const w = .5 + r() * .5, ht = .6 + r() * .5, g = new THREE.PlaneGeometry(w, ht, 2, 3); g.translate(0, -ht / 2, 0);
        const c = new THREE.Mesh(g, K.std(cm[(r() * cm.length) | 0], { side: THREE.DoubleSide, roughness: .95 })); c.position.set(h.x - len / 2 + (k + .5) * len / n, y, h.z); c.userData.ph = r() * 6; S.add(c); WASH.push(c); } } }
  function washAt(t) { for (const c of WASH) c.rotation.x = .12 * Math.sin(t * 1.3 + c.userData.ph) + .05 * Math.sin(t * 2.9 + c.userData.ph * 2); }

  S.traverse(o => { if (o.isMesh && o.material !== M.dark) { o.castShadow = o.castShadow !== false; o.receiveShadow = true; } });

  // ---------------------------------------------------------------- the pastel pass (pastel-children.js, rewritten softer — fixed in the frame)
  // chalk: a soft Kuwahara (R 3) lays the colour in flat dusty patches; coloured shadows (violet-blue, never grey) and cream lights; the paper's
  // tooth shows only where the pigment is thin (the darks). No directional strokes across the frame (they read as rain); a faint low-frequency
  // paper mottle keeps big flat skies from looking digital.
  const FS = (frag, uniforms) => { const m = new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    const sc = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); q.frustumCulled = false; sc.add(q); return { m, sc, u: m.uniforms }; };
  const ocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const rtA = new THREE.WebGLRenderTarget(film.w, film.h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const pastelP = FS(`varying vec2 vUv; uniform sampler2D tIn; uniform vec2 px; uniform vec3 paper; uniform float violet, gild;
    ${hashGLSL}
    float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
    void main(){
      const int R = 3; vec3 m[4]; vec3 s2[4]; for (int k = 0; k < 4; k++){ m[k] = vec3(0.); s2[k] = vec3(0.); }
      for (int y = 0; y <= R; y++) for (int x = 0; x <= R; x++){
        vec3 a = texture2D(tIn, vUv + vec2(-x, -y) * px).rgb, b = texture2D(tIn, vUv + vec2(x, -y) * px).rgb, c = texture2D(tIn, vUv + vec2(x, y) * px).rgb, d = texture2D(tIn, vUv + vec2(-x, y) * px).rgb;
        m[0] += a; s2[0] += a * a; m[1] += b; s2[1] += b * b; m[2] += c; s2[2] += c * c; m[3] += d; s2[3] += d * d; }
      float n = float((R + 1) * (R + 1)), best = 1e9; vec3 col = vec3(0.);
      for (int k = 0; k < 4; k++){ vec3 mu = m[k] / n, v = abs(s2[k] / n - mu * mu); float sv = v.r + v.g + v.b; if (sv < best){ best = sv; col = mu; } }
      vec3 src = texture2D(tIn, vUv).rgb; col = mix(col, src, .5);   // keep a little of the drawing's edge (small figures stay legible)
      vec2 p = gl_FragCoord.xy; float l = lum(col);
      float tooth = vn(p * .13) * .55 + vn(p * .31 + 3.) * .3 + vn(p * .06 + 7.) * .15;
      float thin = 1. - smoothstep(.04, .3, l);                          // the pigment is thin in the darks
      float cover = 1.;   // fix 2: no tooth speckle (it read as dither on the robes)
      vec3 g = mix(vec3(l), col, 1.08);
      g = mix(g, g * vec3(.84, .8, 1.08) + vec3(.06, .04, .1), (1. - smoothstep(.1, .5, l)) * (.3 + .35 * violet));   // coloured shadows
      g = mix(g, g * vec3(1.04, 1., .9) + vec3(.03, .02, 0.), smoothstep(.55, .95, l));                                // cream lights
      g = mix(g, g * vec3(1.06, .96, .78), gild);                                                                       // the last light: dark gold
      g *= 1. + (fb(p * .004) - .5) * .05;                                                                              // paper mottle (very low, fixed)
      gl_FragColor = vec4(mix(paper, g, cover), 1.);
    }`, { tIn: { value: null }, px: { value: new THREE.Vector2(1 / film.w, 1 / film.h) }, paper: { value: new THREE.Vector3(.36, .27, .3) }, violet: { value: 0 }, gild: { value: 0 } });
  const realSRT = R.setRenderTarget.bind(R);
  function renderAll(t) {
    R.setRenderTarget = (tg, ...a) => realSRT(tg === null ? rtA : tg, ...a);
    try { film.render(t); } finally { R.setRenderTarget = realSRT; }
    if (NOPASS) { film.copyLinear(rtA.texture, null); return; }
    pastelP.u.tIn.value = rtA.texture; realSRT(null); R.render(pastelP.sc, ocam);
  }

  // ---------------------------------------------------------------- the shots: camera, sun, lens, what is seen
  function setCam(pos, look, roll = 0) { cam.position.copy(pos); cam.position.y = Math.max(pos.y, hT(pos.x, pos.z) + .8); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(look); cam.updateMatrixWorld(); }
  function setFov(f) { if (cam.fov !== f) { cam.fov = f; cam.updateProjectionMatrix(); } }
  const skyGold = () => { SKY.top.value.copy(col('#5a6a92', .5)); SKY.mid.value.copy(col('#d8a074', .9)); SKY.horizon.value.copy(col('#ffc284', 1.6)); SKY.sunColor.value.copy(col('#fff0cc', 18)); SKY.sunGlow.value.copy(col('#ffb070', 1.5)); SKY.clouds.value = .3; };
  const lamp = { shimmer: 0, god: .4, sunScreen: null };
  const shotOf = t => { let k = 0; for (let i = 1; i < T.cuts.length; i++) if (t >= T.cuts[i]) k = i; return T.names[k]; };
  const STAGE = {};
  const QS = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new Map();
  // ==== fix 1 (rounds/r10-pilot/batch3-fix1.md, owner 2026-11-25): people are cast shadows, far small silhouettes, or backlit silhouettes —
  // never mid-distance bodies with visible surfaces, never a top-down street of figures.
  const QN = (k, d) => (QS.get(k) != null ? +QS.get(k) : d), QV = (k, d) => (QS.get(k) || d).split(',').map(Number);
  const S1P = QV('s1p', '13,20,140'), S1L = QV('s1l', '16,-12,-300'), S1F = QN('s1f', 20);
  const S2H = QN('s2h', 1.0), S2L = QN('s2l', .9), S2F = QN('s2f', 10.5);
  const S3D = QN('s3d', 125), S3X = QN('s3x', 9), S3P = QN('s3p', -2.0), S3F = QN('s3f', 17);
  const S4X = QN('s4x', -60), S4P = QN('s4p', 13), S4F = QN('s4f', 20), S4H = QN('s4h', 30);
  const S5D = QN('s5d', 36), S5X = QN('s5x', 3.3), S5P = QN('s5p', -47);
  const S6D = QN('s6d', 28), S6X = QN('s6x', 2.2), S6H = QN('s6h', 2.2), S6Y = QN('s6y', -3), S6F = QN('s6f', 30);
  const RIGHT = V(-DIRC.z, 0, DIRC.x);
  // S1: a long lens from high behind the procession, looking west into the low sun over the city: the procession is a stream of backlit
  //     silhouettes (each well under 12 % of the frame) with palm branches against the glowing haze, their long shadows streaming back
  //     toward us; the city a layered silhouette above. He is not picked out here. Move: a slow truck right.
  STAGE.S1 = t => {
    const a = T.cuts[0], b = T.cuts[1], u = (t - a) / (b - a), k = u * .8 + .2 * sine(u);
    setVis(SIDE, true); crowdAt(t); jPose(t, 'S1'); setVis(CITYP, false); J.visible = true;
    const pos = V(S1P[0] + 8 * k, S1P[1], S1P[2] - 3 * k), look = V(S1L[0] + 3 * k, S1L[1] - .6 * k, S1L[2]);
    setFov(S1F); setCam(pos, look);
    setSun(sunDirFrom(look.clone().sub(pos), -1.5, 4.2), 5, V(JSTOP.x, JSTOP.y, JSTOP.z + 30), 110, 3.0);
    SKY.sunColor.value.copy(col('#fff0cc', 10)); SKY.sunGlow.value.copy(col('#ffb070', 1.8));
    hemi.intensity = .2;
    { const f = posOn(S_STOP - 20, 0); film.dofCfg.focus = pos.distanceTo(V(f.x, f.y, f.z)); } film.dofCfg.aperture = .8;
    film.atmos.density = .0017; film.look.exposure = 1.0; lamp.shimmer = .8; lamp.god = .5;
    dustU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2); moteU.uA.value = 0;
    RIMU.uRimC.value.copy(col('#ffa060', 2.2)); pastelP.u.violet.value = .1; pastelP.u.gild.value = 0;
  };
  // S2: the long lens on the road behind him, into the low sun: the people are backlit silhouettes with a thin rim, their long shadows
  //     streaming back along the road toward us. He walks, slows over two steps and stops; the others flow on past him and over the brow
  //     (their clock runs down to 0.3x, the lens softens them; he stays sharp); his head bows a little, his shoulders drop once. Back view
  //     only, the sun to the right of his head (never behind it). Move: tracking, then a slow push in.
  const camS2 = t => { const uu = clamp((t - T.cuts[1]) / (T.cuts[2] - T.cuts[1])), D = 70 - 8 * (uu * .55 + .45 * sine(uu)), jp = J.position;
    const x = jp.x - DIRC.x * D + .5, z = jp.z - DIRC.z * D; return V(x, hT(x, z) + S2H, z); };
  STAGE.S2 = t => {
    setVis(SIDE, true); jPose(t, 'S2'); crowdAt(t); setVis(CITYP, false); J.visible = true; { const cp = camS2(t); for (const g of [...CROWD, ...SIDE]) if (g.visible && g.position.distanceTo(cp) < 50) { g.visible = false; if (g.userData.palm) g.userData.palm.visible = false; } }   // nobody near the lens: silhouettes stay far
    const pos = camS2(t), jp = J.position.clone(), look = jp.clone().add(V(0, S2L, 0)).addScaledVector(DIRC, 6).addScaledVector(RIGHT, 1.3);
    setFov(S2F); setCam(pos, look);
    setSun(sunDirFrom(look.clone().sub(pos), -3.4, 3.0), 4, jp.clone().addScaledVector(DIRC, -15), 40, 3.2);
    SKY.sunColor.value.copy(col('#fff0cc', 9)); SKY.sunGlow.value.copy(col('#ffb070', 1.9));
    hemi.intensity = .18;
    const dr = ss(T.drain[0], T.drain[1] + .6, t);
    film.dofCfg.focus = pos.distanceTo(jp.clone().add(V(0, 1.2, 0))); film.dofCfg.aperture = lerp(1.1, 14, dr); film.dofCfg.maxCoc = lerp(22, 30, dr);
    film.atmos.density = .0016; film.look.exposure = lerp(1.0, .97, dr); lamp.shimmer = .3 * (1 - dr); lamp.god = .5;
    dustU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2); moteU.uA.value = 0;
    RIMU.uRimC.value.copy(col('#ffa060', lerp(2.2, 2.6, dr))); pastelP.u.violet.value = .15 + .15 * dr; pastelP.u.gild.value = 0;
  };
  // S3: (the shoulder shot is cut) from far back on the ridge, a long lens over his small backlit back at the frame's left edge onto the
  //     city across the valley at sunset: layered silhouettes in haze, the Temple's gold catching the last light, altar smoke, swifts
  //     circling. One slow zoom in.
  STAGE.S3 = t => {
    setVis(SIDE, false); crowdAt(t, 16, S_STOP + 55); jPose(t, 'S3'); setVis(CITYP, false); J.visible = true;
    const a = T.cuts[2], b = T.cuts[3], u = (t - a) / (b - a), jp = J.position;
    const kk = u * .8 + .2 * sine(u), pos = jp.clone().addScaledVector(DIRC, -S3D).addScaledVector(RIGHT, S3X - 3.4 + 3.6 * kk); pos.y = hT(pos.x, pos.z) + 1.4 + .8 * kk;
    const h = V(TEMPLE.x - pos.x, 0, TEMPLE.z - pos.z).normalize(), look = pos.clone().addScaledVector(h, 600); look.y = pos.y + 600 * Math.tan(S3P * D2R);
    setFov(lerp(S3F, S3F * .86, u * .8 + .2 * sine(u))); setCam(pos, look);
    setSun(sunDirFrom(look.clone().sub(pos), -2.2, 3.3), 5, V(0, -20, -700), 520, 2.4);
    hemi.intensity = .12; goldM.emissiveIntensity = .55; film.dofCfg.focus = pos.distanceTo(TEMPLE); film.dofCfg.aperture = .8;
    film.atmos.density = .0014; film.look.exposure = 1.04; lamp.shimmer = 0; lamp.god = .4;
    moteU.uA.value = 0; RIMU.uRimC.value.copy(col('#ff8a50', 1.8)); pastelP.u.violet.value = .3 + .1 * u; pastelP.u.gild.value = 0;
  };
  // S4: from the ridge at a low angle onto the lower city's roofs at dusk: lamps in windows, smoke, washing on lines, a few tiny figures on
  //     the roofs at their work, nobody looking up. One slow pan right across the roofs toward the Temple.
  STAGE.S4 = t => {
    setVis(CROWD, false); setVis(SIDE, false); setVis(CITYP, true); J.visible = false; cityPeopleAt(t);
    const a = T.cuts[3], b = T.cuts[4], u = (t - a) / (b - a), k = u * .8 + .2 * sine(u);
    const pos = V(S4C.x + 28 + lerp(-12, 12, k), 0, CITYZ + 2); pos.y = hT(pos.x, pos.z) + S4H;   // on the east rampart
    const look = V(S4C.x - 20 + lerp(-30, 34, k), hT(S4C.x, S4C.z) + S4P, S4C.z + 20);
    setFov(S4F); setCam(pos, look);
    setSun(sunDirFrom(look.clone().sub(pos), -14, 4), 5, V(S4C.x, -20, S4C.z - 40), 300, 2.4);
    hemi.intensity = .3; film.dofCfg.focus = pos.distanceTo(look); film.dofCfg.aperture = .5;
    film.atmos.density = .0009; film.look.exposure = 1.1; lamp.shimmer = 0; lamp.god = 0;
    moteU.uA.value = 0; RIMU.uRimC.value.copy(col('#ff8a50', 1.6)); pastelP.u.violet.value = .4; pastelP.u.gild.value = 0;
    LAMPS.forEach((L, i) => { lampA[i] = L.gate ? 0 : (L.t < .5 ? ss(a - 1 + L.t * 8, a + L.t * 8, t) * Math.min(1, L.k * 1.1) : 0); }); lamps.geometry.attributes.aA.needsUpdate = true;
  };
  // S5: the sun sets over the city (the disc sinks onto the hills right of the Temple); his back small at the left edge. A slow crane up.
  // S6 continues S5's camera without a break (fix 2: the 35.25 s jump cut): the crane goes on rising and pushes in a little while he walks.
  const camS5 = kk => { const pos = V(JSTOP.x, 0, JSTOP.z).addScaledVector(DIRC, -S5D).addScaledVector(RIGHT, S5X); pos.y = hT(pos.x, pos.z) + 1.5 + 3.4 * kk;
    return { pos, look: TEMPLE.clone().add(V(0, S5P - QN('l5', 20) * kk, 0)) }; };
  STAGE.S5 = t => {
    setVis(SIDE, false); crowdAt(t, 95, S_STOP + 32); jPose(t, 'S5'); setVis(CITYP, false); J.visible = true;
    const a = T.cuts[4], b = T.cuts[5], u = (t - a) / (b - a), k = u * .75 + .25 * sine(u), jp = J.position.clone();
    const { pos, look } = camS5(k);
    setFov(24); setCam(pos, look);
    const el = lerp(2.0, .5, ss(T.sunset[0], T.sunset[1], t));
    setSun(sunDirFrom(look.clone().sub(pos), -2.6, el), Math.max(2.5, el + 2.5), V(0, -20, -400), 520, lerp(2.8, 1.5, ss(T.sunset[0], T.sunset[1], t)));
    hemi.intensity = .3; goldM.emissiveIntensity = .5; film.dofCfg.focus = pos.distanceTo(jp); film.dofCfg.aperture = .8;
    film.atmos.density = .0013; film.look.exposure = 1.02; lamp.shimmer = 0; lamp.god = .45;
    moteU.uA.value = .5; moteU.uC.value.set(pos.x, pos.y - 2, pos.z - 2);
    RIMU.uRimC.value.copy(col('#ff7a48', 1.7)); pastelP.u.violet.value = .4 + .2 * u; pastelP.u.gild.value = 0;
    SKY.horizon.value.copy(col('#ffb070', 1.55)); SKY.mid.value.copy(lerp3(col('#d89a78', .88), col('#c08088', .75), u));
  };
  // S6: his small far silhouette walks away down the road toward the gate for the whole shot (steps in the hem and the long shadow
  //     streaming back from the last sun), getting smaller, off centre; lamps begin in the city, two at the gate; a calm dark gold to end.
  STAGE.S6 = t => {
    setVis(SIDE, false); crowdAt(t, 95, S_STOP + 32); jPose(t, 'S6'); setVis(CITYP, false); J.visible = true;
    const a = T.cuts[5], b = T.end, u = clamp((t - a) / (b - a)), k = u * .6 + .4 * sine(u);
    const c5 = camS5(1), pos = c5.pos.clone().addScaledVector(DIRC, 4 * k); pos.y += 2.4 * k;
    const look = c5.look.clone().add(V(0, -QN('l6', 26) * k, 0));
    setFov(24 - 2.5 * k); setCam(pos, look);
    setSun(sunDirFrom(look.clone().sub(pos), -2.6, lerp(.5, .05, u)), Math.max(1.2, 3 - 2 * u), V(JSTOP.x, JSTOP.y, JSTOP.z - 10), 80, lerp(1.5, .6, u));
    SKY.sunColor.value.copy(lerp3(col('#fff0cc', 18), col('#ffc890', 4), u)); SKY.sunGlow.value.copy(lerp3(col('#ffb070', 1.5), col('#ff9a68', .9), u));
    SKY.top.value.copy(lerp3(col('#5a6a92', .5), col('#2c2f58', .38), u)); SKY.mid.value.copy(lerp3(col('#c08088', .75), col('#8a6a7e', .6), u)); SKY.horizon.value.copy(lerp3(col('#ffb070', 1.55), col('#e08a6a', 1.0), u));
    hemi.intensity = lerp(.3, .22, u); hemi.color.copy(lerp3(col('#b4a8b8'), col('#a8a0c8'), u)); goldM.emissiveIntensity = lerp(.5, .25, u);
    film.dofCfg.focus = pos.distanceTo(J.position); film.dofCfg.aperture = .8;
    film.atmos.density = .0013; lamp.shimmer = 0; lamp.god = .45 * (1 - ss(0, .5, u)); smkU.uC.value.copy(lerp3(col('#d8c4b0', 1), col('#9a8478', 1), ss(0, .4, u)));
    const dk = ss(T.dark[0], T.dark[1], t); film.look.exposure = lerp(1.02, .74, dk);
    moteU.uA.value = .5 * (1 - ss(0, .3, u)); moteU.uC.value.set(pos.x, pos.y - 2, pos.z - 2);
    RIMU.uRimC.value.copy(lerp3(col('#ff7a48', 1.7), col('#ff9a68', .8), u)); pastelP.u.violet.value = .6; pastelP.u.gild.value = .55 * dk + .15 * u;
    LAMPS.forEach((L, i) => { const o = a + 1.0 + 7 * Math.acos(1 - 2 * L.t) / Math.PI; lampA[i] = ss(o, o + 1.2, t) * L.k; }); lamps.geometry.attributes.aA.needsUpdate = true;
    gateLamps.forEach(g => { g.power = 30 * ss(a + 1.5, a + 4.5, t); });
  };
  const lerp3 = (A, B, k) => A.clone().lerp(B, clamp(k));
  function stage(t) {
    const nm = shotOf(t);
    skyGold(); hemi.intensity = .55; goldM.emissiveIntensity = .12; hemi.color.copy(col('#b4a8b8')); lamps.visible = nm === 'S6' || nm === 'S4'; gateLamps.forEach(g => { g.power = 0; }); smkU.uC.value.copy(col('#d8c4b0', 1)); if (nm !== 'S6' && nm !== 'S4') { lampA.fill(0); lamps.geometry.attributes.aA.needsUpdate = true; }
    dust.visible = nm === 'S1'; TUFTS.visible = true; smoke.visible = true; motes.visible = true; birdsAt(t, nm === 'S3' || nm === 'S4' || nm === 'S5', nm === 'S3' ? V(-10, 30, -330) : nm === 'S4' ? V(S4C.x - 10, 10, S4C.z + 60) : null); washAt(t);
    film.dofCfg.maxCoc = 22; film.atmos.scatter = nm === 'S6' ? .15 : 1; STAGE[nm](t);
    if (dust.visible) dustAt(t); smokeAt(t); smkU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2); lampU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2) * (nm === 'S4' ? 2.6 : .5);
    tuftU.uT.value = t; moteU.uT.value = t; GU.uSunG.value.copy(SUN);
    RIMU.uSunV.value.copy(SUN).transformDirection(cam.matrixWorldInverse.copy(cam.matrixWorld).invert());
    return nm;
  }

  // ---- screen-space light scattering from the sun (crowd-evening3d.js godRays, copied)
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
  // heat shimmer (「아라비아의 로렌스」, crowd-evening3d.js blit, copied): thin strips nudged by slow travelling waves — smooth in t and y
  function blit(ctx, t, k) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    if (k <= .01) ctx.drawImage(film.canvas, 0, 0, W, H);
    else { const sh = 4; ctx.drawImage(film.canvas, 0, 0, W, H);
      for (let y = 0; y < H; y += sh) { const v = y / H, amp = k * (.8 + 2.6 * ss(.2, .75, v)) * (H / 1920);
        const dx = amp * (Math.sin(y * .051 + t * 6.1 + Math.sin(y * .013 - t * 1.7) * 2.2) * .7 + Math.sin(y * .17 - t * 9.3) * .3);
        ctx.drawImage(film.canvas, 0, y * film.canvas.height / H, film.canvas.width, sh * film.canvas.height / H, dx, y, W, sh); } }
    ctx.restore();
  }
  const tmpV = V();
  function draw(ctx, t, TB) {
    T = TB; stage(t); renderAll(t); blit(ctx, t, lamp.shimmer);
    tmpV.copy(cam.position).addScaledVector(SUN, 900).project(cam);
    if (lamp.god > .01 && tmpV.z < 1 && Math.abs(tmpV.x) < 1.6 && Math.abs(tmpV.y) < 1.6) godRays(ctx, (tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H, lamp.god);
  }
  // ---------------------------------------------------------------- the checks (no render): camera + emission; bone directions
  function probe(t, TB) { T = TB; const nm = stage(t); const d = V(); cam.getWorldDirection(d);
    return { shot: nm, p: cam.position.toArray(), d: d.toArray(), fov: cam.fov, focus: film.dofCfg.focus, emit: { smoke: smkAlive, dust: dust.visible ? dustAlive : 0, lamps: nm === 'S6' ? lampA.reduce((a, b) => a + (b > .05 ? 1 : 0), 0) : 0 } }; }
  function joints(t, TB) { T = TB; const nm = stage(t); const out = {}, Y = V(0, 1, 0);
    const figs = nm === 'S4' ? CITYP : [J, ...CROWD.slice(0, 400), ...SIDE];
    figs.forEach((g, n) => { if (!g.visible) return; const U = g.userData; if (!U.arms[0].E) return; const rec = {};
      U.arms.forEach((A, i) => { rec['ua' + i] = A.E.clone().sub(A.S2 || A.S).normalize().toArray(); rec['fa' + i] = A.T.clone().sub(A.E).normalize().toArray(); });
      (U.legs || []).forEach((L, i) => { rec['th' + i] = Y.clone().applyQuaternion(L.thigh.quaternion).toArray(); rec['sh' + i] = Y.clone().applyQuaternion(L.shin.quaternion).toArray(); });
      rec.neck = [U.neck.rotation.x, U.neck.rotation.y]; rec.up = [U.upper.rotation.x, U.upper.rotation.y]; out[(g === J ? 'J' : nm === 'S4' ? 'q' : 'c') + n] = rec; });
    return { shot: nm, figs: out, jHead: J.userData.neck.rotation.y, jYaw: J.rotation.y }; }
  // where things land in the frame (px) at t — for framing checks
  function proj(t, TB, pts) { T = TB; const nm = stage(t); S.updateMatrixWorld(true);
    const named = { J: J.position.clone().add(V(0, 1.7, 0)), Jfeet: J.position.clone(), temple: TEMPLE.clone(), gate: V(GATE.x, hT(GATE.x, GATE.z) + 8, GATE.z), sun: cam.position.clone().addScaledVector(SUN, 900) };
    const out = { shot: nm }; for (const [k, p] of Object.entries(named)) { const q = p.clone().project(cam); out[k] = [Math.round((q.x + 1) / 2 * W), Math.round((1 - q.y) / 2 * H), +q.z.toFixed(3)]; }
    (pts || []).forEach((p, i) => { const q = V(...p).project(cam); out['p' + i] = [Math.round((q.x + 1) / 2 * W), Math.round((1 - q.y) / 2 * H)]; });
    return out; }
  S.updateMatrixWorld(true);
  return { film, draw, probe, joints, proj, people: { J, CROWD, SIDE, CITYP } };
}
