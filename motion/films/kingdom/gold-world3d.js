// gold-world3d.js — 「kingdom」 6부 끝 (film 711–737.6): the small world of the illuminated page rises into a golden 3D land
// (Q16 Rev 11:15 "세상 나라가 우리 주와 그의 그리스도의 나라가 되어"), the gold runs out to the horizon, part 1's lakeside villages
// show through it (N29c, the page superimposes galilee3d.js), and one village lights its lamps window by window while the camera
// comes down to one house's window (N29d "… 사람의 삶에, 지금 임합니다") — the light of that window carries into the prayer room (N30).
// Skills read first (rules.json skills-first; sources only copied, never edited):
//   motion-skills/cinematic-3d — the engine (lib3d/cine.js + kit.js are its vendored copies: height fog with in-scatter of every lamp,
//     bloom, DOF, AgX, grain); heal-village.js (the plastered-stone wall shader, olive clumps, the "blit" into the 2D page);
//   galilee3d.js (the lakeside villages lighting one by one, after 「반지의 제왕: 왕의 귀환」 beacons — here the windows of one village);
//   cinecode/references/camera-moves.md — "crane up" (scale: the world opens to the horizon) and a "push in" that is one long
//     log-distance glide (constant apparent speed, eased ends) down to the window; heritage-blueprint / the first film's 「귀환」
//     (a 2D drawing developing into 3D — here the illuminated miniature, see paintPass()).
// Film ref: 「브레이브하트」(1995, OPUSCAR 68) illuminated manuscript → 「타이타닉」(1997, OPUSCAR 70) develop (the drawing becomes
//   the world); the lamp village after 「반지의 제왕: 왕의 귀환」(OPUSCAR 76) beacons.
// The miniature on the page IS this world: paintPass() renders the same geometry from the develop camera (cam0, lift 0) in flat
// illuminated colours + an ID/depth pass for the ink contours, so the 2D page and the 3D world line up exactly when one dissolves
// into the other. The develop then lifts the land (terrain relief .55 → 1, houses and trees .7 → 1) as the camera cranes up.
// Ground: one terrain mesh on a fixed world grid (5 m cells near the villages, growing outward), smooth vertex normals, all
// texture world-anchored; the sun's shadow camera is FIXED (never follows the camera — no shimmer); terrain dips steeply under the
// lake so the shore never z-fights with the water plane. No people (the world is small); no words.
// API: const GW = await (await import('./gold-world3d.js')).build(W, H, B);  GW.draw(ctx, t)  (t = FILM seconds, pure in t)
//      GW.paint → { color: canvas, ink: canvas, water: canvas(mask), horizonY }  (the miniature, in screen px of the develop frame)
//      GW.T = beats(B): every time comes from the script's line times (Q16 N29c N29d N30).
import { Film, THREE, V, col, rng, noise1 } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const sine = x => { x = clamp(x); return .5 - .5 * Math.cos(Math.PI * x); };
const D2R = Math.PI / 180;

export function beats(B) {
  const q = B.Q16, c = B.N29c, d = B.N29d, e = B.N30;
  return { q, c, d, e,
    dev: [q + 1.0, q + 3.6],        // inside the arch: the painting dissolves into the world (the page module draws it)
    open: [q + 3.2, q + 6.2],       // the page's frame opens out past the screen (page module)
    lift: [q + 3.4, q + 7.6],       // the land swells up (relief .55 → 1)
    crane: [q + 3.4, c + 1.2],      // crane up and tilt toward the horizon (eased)
    gold: [q + 4.2, c + 1.6],       // the gold runs out from the middle of the land to the horizon
    approach: [c - .6, e - .15],    // one long glide down to the window
    dusk: [c - .6, d + 5.0],        // the sun goes down from N29c on: the lamps can read (r4)
    lamps: [c + .4, d + 5.5],       // r4: village after village across the land (N29c), the lamp village last (into N29d)
    target: d + 2.6,                // the window we go to lights on "사람의 삶에"
    glow: [e - 1.3, e + .2] };      // that window's light swells (the light-to-light dissolve into the room)
}

// ---------------------------------------------------------------- the land (metres; −z is "into the picture", toward the far hills)
const LAKE = { x: 0, z: -690, rx: 440, rz: 275 };
const lakeD = (x, z) => { const dx = (x - LAKE.x) / LAKE.rx, dz = (z - LAKE.z) / LAKE.rz, a = Math.atan2(dz, dx); return Math.hypot(dx, dz) * (1 + .05 * Math.sin(a * 3 + 1) + .03 * Math.sin(a * 5 + 2)); };
// villages: [x, z, r, houses, seed]; LV (index 1) is the lamp village the camera goes down to
const VILLS = [[-90, -335, 36, 9, 3], [52, -252, 42, 13, 7], [150, -1010, 46, 9, 11], [-170, -1065, 50, 10, 13], [-430, -700, 44, 8, 17], [390, -770, 40, 7, 19]];
const HILLS = [[-420, -1190, 220, 90], [-150, -1260, 200, 115], [130, -1230, 180, 80], [380, -1270, 240, 125], [-310, -1460, 260, 150], [70, -1500, 280, 165], [430, -1510, 260, 140], [-620, -1360, 260, 120], [660, -1390, 240, 110]];
const fbm2 = (x, z) => .5 * noise1(x * .0021 + noise1(z * .0013, 3) * 2, 1) + .3 * noise1(z * .0034 + x * .0011, 2) + .2 * noise1((x + z) * .006, 4);
function hRaw(x, z) {
  const d = lakeD(x, z);
  let y = lerp(-14, 3.5, ss(.86, 1.06, d));                                       // the lake bed rises steeply to the shore
  y += 16 * Math.pow(clamp(d - 1.04, 0, 2.6), 1.2);                               // the land rises gently away from the water (r3: was 34·x^1.35 — too steep)
  y += 200 * ss(-1300, -2100, z) * (.6 + .4 * noise1(x * .0016, 5));             // the far hills
  y += 120 * ss(-820, -1500, x) + 110 * ss(860, 1500, x);                         // ridges left and right
  y += 9 * fbm2(x, z) * ss(1.02, 1.3, d);                                          // rolling ground
  for (const [hx, hz, hr, hh] of HILLS) { const q = ((x - hx) ** 2 + (z - hz) ** 2) / (hr * hr); if (q < 9) y += hh * .5 * Math.exp(-q * 1.2); }   // rounded hills behind the far shore (the illuminator's stacked hills)
  return y;
}
function hgt(x, z) { let y = hRaw(x, z);
  for (const [vx, vz, r] of VILLS) { const k = ss(r * (vx === 52 ? 2.6 : 1.5), r * .7, Math.hypot(x - vx, z - vz)); if (k > 0) y = lerp(y, hRaw(vx, vz), k * .85); }   // each village on its own gentle shelf
  return y; }
// the fields: a near band between the camera and the lake, and one on the far shore (no hash: JS and GLSL agree)
const VEX_GLSL = VILLS.map(([x, z, r]) => `smoothstep(${(r * 1.1).toFixed(1)}, ${(r * 1.45).toFixed(1)}, length(p - vec2(${x}., ${z}.)))`).join(' * ');
const FIELD_GLSL = `float fieldM(vec2 p){ float d = lakeD(p); float a = smoothstep(-700., -620., p.x) * smoothstep(700., 620., p.x) * smoothstep(-500., -440., p.y) * smoothstep(200., 120., p.y);
    float b = smoothstep(-640., -560., p.x) * smoothstep(640., 560., p.x) * smoothstep(-1160., -1110., p.y) * smoothstep(-930., -980., p.y);
    return max(a, b) * smoothstep(1.1, 1.18, d) * ${VEX_GLSL}; }`;
const fieldM = (x, z) => { const d = lakeD(x, z); const a = ss(-700, -620, x) * ss(700, 620, x) * ss(-500, -440, z) * ss(200, 120, z), b = ss(-640, -560, x) * ss(640, 560, x) * ss(-1160, -1110, z) * ss(-930, -980, z);
  let v = 1; for (const [vx, vz, r] of VILLS) v *= ss(r * 1.1, r * 1.45, Math.hypot(x - vx, z - vz)); return Math.max(a, b) * ss(1.1, 1.18, d) * v; };
const LAKE_GLSL = `float lakeD(vec2 p){ vec2 q = vec2((p.x - ${LAKE.x.toFixed(1)}) / ${LAKE.rx.toFixed(1)}, (p.y - (${LAKE.z.toFixed(1)})) / ${LAKE.rz.toFixed(1)}); float a = atan(q.y, q.x); return length(q) * (1. + .05 * sin(a * 3. + 1.) + .03 * sin(a * 5. + 2.)); }`;
// the roads between the villages (segments in xz)
const ROADS = [[52, -252, -90, -335], [52, -252, 120, 300], [-90, -335, -430, -700], [52, -252, 390, -770], [-170, -1065, 150, -1010], [150, -1010, 390, -770], [-170, -1065, -430, -700], [-90, -335, -260, 300]];
const roadD = (x, z) => { let m = 1e9; for (const [ax, az, bx, bz] of ROADS) { const vx = bx - ax, vz = bz - az, k = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); m = Math.min(m, Math.hypot(x - ax - vx * k, z - az - vz * k)); } return m; };

export async function build(W, H, B) {
  const T = beats(B), vert = H > W, FOV = vert ? 46 : 32;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: 1, far: 9000,
    atmos: { density: .00007, falloff: .002, base: 0, start: 250, color: col('#c8a87a', .6), colorUp: col('#b8b4b0', .55), max: 7000, scatter: 1, anisotropy: .8, phaseMix: .85 },
    bloom: { strength: .07, radius: 1.15, tint: col('#ffe0a8') },
    dof: { focus: 600, aperture: .2, maxCoc: 18 },
    look: { exposure: 1.0, contrast: 1.12, saturation: 1.12, lift: col('#0e0a06'), shadowTint: col('#d8cfe6'), highTint: col('#fff0d4'), vignette: .28, grain: .022, ca: .25 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera;
  const R = rng(4711);

  // ---------------------------------------------------------------- light: a low sun ahead-left, going down over N29d
  const SUN0 = V(.95, .17, -.42).normalize(), SUN1 = V(.98, .015, -.3).normalize();
  const sky = K.sky(film, { top: col('#2848a0', .8), mid: col('#d9a85c', .85), horizon: col('#ffd286', 1.5), sunDir: SUN0, sunColor: col('#fff0c8', 24), sunGlow: col('#ffc070', 1.7), clouds: .22, cloudColor: col('#ffe2b0', 1.15), cloudShade: col('#c0906a', .7), radius: 8000 });
  const hemi = new THREE.HemisphereLight(col('#b0bcd4'), col('#7a5a36'), .5); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffd296'), 3.1); S.add(sunL, sunL.target);
  // FIXED shadow frustum over the near land and the lamp village (never moves with the camera: no shimmer)
  sunL.castShadow = true; sunL.shadow.mapSize.set(4096, 4096); Object.assign(sunL.shadow.camera, { left: -700, right: 700, top: 700, bottom: -700, near: 10, far: 3000 });
  sunL.shadow.bias = -.0005; sunL.shadow.normalBias = .9; sunL.shadow.radius = 2;
  const setSun = d => { sunL.position.set(150 + d.x * 1400, d.y * 1400, -380 + d.z * 1400); sunL.target.position.set(150, 0, -380); sunL.target.updateMatrixWorld(); sunL.shadow.camera.updateProjectionMatrix(); sky.u.sunDir.value.copy(d); };
  setSun(SUN0);
  const sunLamp = film.lamp(SUN0.clone().multiplyScalar(6000), '#ffcf90', { power: 260, size: 160, fog: 1 });

  // ---------------------------------------------------------------- the gold (uniforms shared by every lit material)
  const GU = { uGR: { value: -10 }, uGC: { value: new THREE.Vector2(52, -262) }, uGild: { value: 1 }, uGoldCol: { value: col('#e8b456') } };
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;
  const GU2 = { uAct: { value: 0 }, uShade: { value: new THREE.Vector3(.7, .74, .86) }, uLitK: { value: new THREE.Vector3(1.2, 1.05, .86) } };
  Object.assign(GU, GU2);
  const GILD_DECL = `uniform float uGR, uGild, uAct; uniform vec2 uGC; uniform vec3 uGoldCol, uShade, uLitK; float gIn, gFront;`;
  // a real light front (round 2): ahead of it the land lies in a cool soft shade (uAct comes up during the develop), behind it the
  // low gold sun; the front itself is a narrow bright edge of light running out to the horizon — no glow in the air
  const GILD_MAP = `{ float gd = length(vWP.xz - uGC) + (fb(vWP.xz * .006) - .5) * 90.; float wF = 10. + uGR * .008; gIn = smoothstep(uGR + wF, uGR - wF, gd) * step(1., uGR);
      gFront = exp(-pow((gd - uGR) / wF, 2.)) * step(1., uGR) * uGild; }`;
  const GILD_EMIT = ``;
  const GILD_OUT = `outgoingLight *= mix(vec3(1.), mix(uShade, uLitK, gIn), uAct); outgoingLight += uGoldCol * gFront * .7 * uAct;`;
  const litPatch = (m, key, mapExtra = '') => { m.onBeforeCompile = sh => { Object.assign(sh.uniforms, GU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', `#include <project_vertex>
        { vec4 wp = vec4(transformed, 1.);
          #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
          #endif
          vWP = (modelMatrix * wp).xyz; } vWN = normalize(mat3(modelMatrix) * objectNormal);`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + hashGLSL + GILD_DECL + LAKE_GLSL + FIELD_GLSL)
        .replace('#include <map_fragment>', '#include <map_fragment>\n' + mapExtra + GILD_MAP)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + GILD_EMIT).replace('#include <opaque_fragment>', GILD_OUT + '\n#include <opaque_fragment>'); };
    m.customProgramCacheKey = () => 'gw-' + key; return m; };

  // ---------------------------------------------------------------- terrain on a fixed world grid (finer near the villages)
  const axis = (a, b, c0, c1, fine, grow) => { const out = []; let x = c0; out.push(x); while (x > a) { const d = Math.abs(x - (c0 + c1) / 2) > (c1 - c0) / 2 ? Math.min(90, fine * Math.pow(grow, Math.max(0, (c0 - x) / fine))) : fine; x -= d; out.unshift(x); }
    x = c0; while (x < b) { const d = x > c1 ? Math.min(90, fine * Math.pow(grow, (x - c1) / fine)) : fine; x += d; out.push(x); } return out; };
  const XS = axis(-4200, 4200, -760, 760, 5, 1.012), ZS = axis(-4600, 1400, -1200, 330, 5, 1.012);
  const nx = XS.length, nz = ZS.length, tg = new THREE.BufferGeometry(), tpos = new Float32Array(nx * nz * 3), H0 = new Float32Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i, x = XS[i], z = ZS[j]; H0[k] = hgt(x, z); tpos[k * 3] = x; tpos[k * 3 + 1] = H0[k]; tpos[k * 3 + 2] = z; }
  const tidx = []; for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; tidx.push(a, c, b, b, c, d); }
  tg.setAttribute('position', new THREE.BufferAttribute(tpos, 3)); tg.setIndex(tidx); tg.computeVertexNormals();
  let liftNow = -1;
  const setLift = L => { if (Math.abs(L - liftNow) < 1e-5) return; liftNow = L; const s = lerp(.62, 1, L), p = tg.attributes.position.array;
    for (let k = 0; k < H0.length; k++) p[k * 3 + 1] = H0[k] > 0 ? H0[k] * s : H0[k]; tg.attributes.position.needsUpdate = true; tg.computeVertexNormals(); tg.computeBoundingSphere(); };
  const groundM = litPatch(new THREE.MeshStandardMaterial({ color: '#7a7a4a', roughness: 1 }), 'ground', `{
      vec2 q = vWP.xz; float n = fb(q * .02), f = fb(q * .35), d = lakeD(q), fm = fieldM(q);
      vec3 c = diffuseColor.rgb * mix(.82, 1.1, n) * mix(.93, 1.05, f);
      vec3 grass = vec3(.36, .48, .18) * mix(.82, 1.15, fb(q * .01 + 4.));
      c = mix(c, grass, (.45 + .45 * smoothstep(.35, .7, fb(q * .004 + 9.))) * (1. - fm));                 // dry grass and scrub on the open hills
      // the fields: a patchwork of strips (wheat, green barley, ploughed earth), furrows along each strip
      vec2 rq = mat2(.94, -.34, .34, .94) * q; vec2 cell = floor(rq / vec2(46., 30.)); float hc = hh(cell);
      vec3 fc = hc < .3 ? vec3(.86, .68, .3) : hc < .55 ? vec3(.46, .58, .24) : hc < .72 ? vec3(.6, .4, .24) : hc < .8 ? vec3(.8, .2, .1) : vec3(.74, .62, .32);   // wheat, barley, ploughed earth, an anemone field, stubble
      float fur = .5 + .5 * sin((hc < .5 ? rq.x : rq.y) * 2.1); fc *= mix(.9, 1.06, fur);
      vec2 fe = abs(fract(rq / vec2(46., 30.)) - .5) * vec2(46., 30.); float edge = smoothstep(21.4, 22.6, fe.x) + smoothstep(13.6, 14.6, fe.y);
      fc = mix(fc, vec3(.34, .36, .2), clamp(edge, 0., 1.) * .7);                                     // the low walls and hedges between
      c = mix(c, fc, fm);
      c = mix(c, vec3(.55, .5, .4), smoothstep(1.06, .99, d) * .6);                                   // the wet shore
      float slope = 1. - normalize(vWN).y, ter = fract(vWP.y / 3.4);
      c *= 1. - .3 * (1. - smoothstep(.02, .12, ter)) * smoothstep(.03, .1, slope) * (1. - fm) * step(1.06, d);   // the terraces' dry-stone walls on the slopes
      float an = smoothstep(.64, .72, fb(q * .022 + 3.)) * (1. - fm) * step(1.08, d), sp = step(.45, vn(q * 1.9));
      c = mix(c, vec3(.78, .1, .05) * (.8 + .4 * vn(q * 4.)), an * sp * .85);                           // red anemones (the lilies of the field) — the illuminator's vermilion
      float vy = smoothstep(.6, .66, fb(q * .012 + 21.)) * (1. - fm) * step(1.1, d) * smoothstep(.02, .06, slope);
      c = mix(c, c * (.62 + .38 * step(.5, fract(dot(q, vec2(.6, .8)) / 2.6))) * vec3(.85, 1.05, .8), vy * .8);   // vineyard rows
      diffuseColor.rgb = c; }
    { float rd = 1e9; ${ROADS.map(([ax, az, bx, bz]) => `{ vec2 a = vec2(${ax}., ${az}.), v = vec2(${bx - ax}., ${bz - az}.); float k = clamp(dot(vWP.xz - a, v) / dot(v, v), 0., 1.); rd = min(rd, length(vWP.xz - a - v * k)); }`).join(' ')}
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.82, .72, .54) * mix(.9, 1.05, fb(vWP.xz * .3)), smoothstep(3.4, 2.2, rd)); }`);
  const ground = new THREE.Mesh(tg, groundM); ground.receiveShadow = true; ground.castShadow = false; S.add(ground);
  ground.userData.ill = 'ground';
  setLift(0);

  // ---------------------------------------------------------------- the lake (r3: natural water, not a flat blue): dark blue-green body with
  // depth (lighter, greener and browner in the shallows by the shore), the sky in it by Fresnel — the lapis only from the reflected sky
  // above, the gold of the horizon at grazing angles — two scales of small waves, and sun glints in gold
  const WU = { uSun: { value: SUN0.clone() }, uSkyH: { value: col('#ffd286', 1.1) }, uSkyT: { value: col('#2848a0', .8) }, uDeep: { value: col('#0f3b3a', 1) }, uShal: { value: col('#4e6040', 1) }, uGlit: { value: 1 } };
  const waterM = new THREE.MeshStandardMaterial({ color: '#203050', roughness: 1 });
  waterM.onBeforeCompile = sh => { Object.assign(sh.uniforms, WU, GU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform vec3 uSun, uSkyH, uSkyT, uDeep, uShal; uniform float uGlit;\n' + hashGLSL + GILD_DECL + LAKE_GLSL)
      .replace('#include <opaque_fragment>', `{ vec3 Vd = normalize(cameraPosition - vWP); float dist = length(cameraPosition - vWP);
          vec2 w = (vec2(fb(vWP.xz * .03), fb(vWP.xz * .03 + 7.)) - .5) * .07 + (vec2(vn(vWP.xz * .35), vn(vWP.xz * .35 + 3.)) - .5) * .05 * exp(-dist / 900.) + (vec2(vn(vWP.xz * 1.7), vn(vWP.xz * 1.7 + 5.)) - .5) * .03 * exp(-dist / 250.);
          vec3 N = normalize(vec3(w.x, 1., w.y)); vec3 Rr = reflect(-Vd, N); float fr = .02 + .98 * pow(1. - clamp(dot(N, Vd), 0., 1.), 5.);
          vec3 skyc = mix(uSkyH * .85, uSkyT, smoothstep(.4, .95, Rr.y));
          float sh = smoothstep(.93, 1.0, lakeD(vWP.xz));                                                      // the shallows by the shore
          vec3 body = mix(uDeep * (1.5 + .45 * fb(vWP.xz * .008)), uShal, sh * .7) + uSkyH * .02;
          float s = max(dot(Rr, uSun), 0.);
          vec3 c = mix(body, skyc, clamp(pow(fr, 1.7) * .95, 0., 1.)) + uGoldCol * (pow(s, 300.) * 6. + pow(s, 40.) * .5) * uGlit;
          float gd = length(vWP.xz - uGC) + (fb(vWP.xz * .006) - .5) * 90.; float wF = 10. + uGR * .008, gi = smoothstep(uGR + wF, uGR - wF, gd) * step(1., uGR); c *= mix(vec3(1.), mix(vec3(.86, .88, .86), vec3(1.1, 1.06, .98), gi), uAct); c += uGoldCol * exp(-pow((gd - uGR) / wF, 2.)) * step(1., uGR) * uGild * .8 * uAct;
          outgoingLight = c; }
        #include <opaque_fragment>`); };
  waterM.customProgramCacheKey = () => 'gw-water';
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1400, 900, 1, 1), waterM); water.rotation.x = -Math.PI / 2; water.position.set(LAKE.x, 0, LAKE.z); S.add(water);
  water.userData.ill = 'water';

  // ---------------------------------------------------------------- the villages: flat-roofed plastered houses, courtyard walls, windows
  const wallM = (base, key) => litPatch(new THREE.MeshStandardMaterial({ color: base, roughness: .92 }), 'wall' + key, `{ vec3 N = normalize(vWN); vec2 q = abs(N.y) > .7 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
      float big = fb(q * .35 + 3.1), fine = fb(q * 3.1), grit = vn(q * 22.); vec3 c = diffuseColor.rgb * mix(.78, 1.1, big) * mix(.88, 1.06, fine) * mix(.95, 1.03, grit);
      c *= mix(1., .78, smoothstep(.6, .8, fb(vec2(q.x * 4., q.y * .4))) * (1. - abs(N.y)));                                  // rain streaks
      c = mix(c, c * vec3(.86, .8, .72), smoothstep(.66, .72, fb(q * .9 + 5.)) * (1. - abs(N.y)));                              // patches where the lime wash has worn
      diffuseColor.rgb = c; }`);
  const MW = [wallM('#dcc6a0', 'a'), wallM('#cfae84', 'b'), wallM('#e6d4b4', 'c')];
  const roofM = litPatch(new THREE.MeshStandardMaterial({ color: '#a88a62', roughness: .95 }), 'roof');
  const darkM = new THREE.MeshStandardMaterial({ color: '#1a120c', roughness: 1 });
  const woodM = litPatch(new THREE.MeshStandardMaterial({ color: '#6a4a2c', roughness: .85 }), 'wood');
  const footM = litPatch(new THREE.MeshStandardMaterial({ color: '#5e564c', roughness: .95 }), 'foot', `{ vec2 q = abs(vWN.x) > abs(vWN.z) ? vWP.zy : vWP.xy; vec2 c = floor(vec2(q.x / .55 + floor(q.y / .28) * .5, q.y / .28));
      float j = smoothstep(.0, .06, min(fract(q.x / .55 + floor(q.y / .28) * .5), fract(q.y / .28))); diffuseColor.rgb *= mix(.55, 1., j) * mix(.8, 1.15, hh(c)); }`);
  const HOUSES = [], WINS = [];   // houses: { g, x, z, y0, base }; windows: { m (mesh), mat, lamp?, t0, v (village), target }
  const winGeo = new THREE.PlaneGeometry(.62, .78);
  // the room seen through a window at dusk: warm walls lit from below by a clay lamp on the sill (its flame a bright drop)
  const winTex = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 160; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 132, 4, 64, 120, 150); g.addColorStop(0, '#fff2c8'); g.addColorStop(.18, '#ffc874'); g.addColorStop(.55, '#b8642c'); g.addColorStop(1, '#3a1a0c'); x.fillStyle = g; x.fillRect(0, 0, 128, 160);
    x.fillStyle = 'rgba(40,18,8,.55)'; x.fillRect(84, 20, 30, 112);                                   // a dark beam / a hanging cloth inside
    x.fillStyle = '#4a2a16'; x.beginPath(); x.ellipse(64, 150, 22, 7, 0, 0, 6.283); x.fill();           // the lamp's body on the sill
    const f = x.createRadialGradient(70, 136, 0, 70, 136, 14); f.addColorStop(0, '#ffffff'); f.addColorStop(.4, '#ffe0a0'); f.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = f; x.fillRect(50, 116, 40, 40);
    const sh = x.createLinearGradient(0, 0, 0, 30); sh.addColorStop(0, 'rgba(20,8,2,.85)'); sh.addColorStop(1, 'rgba(20,8,2,0)'); x.fillStyle = sh; x.fillRect(0, 0, 128, 30);   // the reveal's shade (the wall's depth)
    const sl = x.createLinearGradient(0, 0, 22, 0); sl.addColorStop(0, 'rgba(20,8,2,.7)'); sl.addColorStop(1, 'rgba(20,8,2,0)'); x.fillStyle = sl; x.fillRect(0, 0, 22, 160);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const revealM = litPatch(new THREE.MeshStandardMaterial({ color: '#8a7a64', roughness: 1 }), 'reveal');
  const mkWin = (g, x, y, z, ry, vi) => { const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0, 0), map: winTex }), m = new THREE.Mesh(winGeo, mat);
    const dz = .12, n = V(Math.sin(ry), 0, Math.cos(ry));                                              // a stone surround standing out of the wall
    m.position.set(x + n.x * .01, y, z + n.z * .01); m.rotation.y = ry; g.add(m); m.userData.ill = 'win';
    for (const [w2, h2, ox, oy] of [[.12, .9, -.37, 0], [.12, .9, .37, 0], [.86, .1, 0, .45], [.94, .1, 0, -.45]]) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, dz), revealM); r.position.set(x + Math.cos(ry) * ox + n.x * dz / 2, y + oy, z - Math.sin(ry) * ox + n.z * dz / 2); r.rotation.y = ry; r.castShadow = r.receiveShadow = true; g.add(r); r.userData.ill = 'door'; }
    const w = { m, mat, v: vi, t0: 1e9, k: 0 }; WINS.push(w); return w; };
  const box = (g, bw, bh, bd, px, py, pz, mat, ill) => { const b = new THREE.Mesh(K.roundedBox(bw, bh, bd, .07, 2), mat); b.position.set(px, py, pz); b.castShadow = b.receiveShadow = true; g.add(b); b.userData.ill = ill; return b; };
  function house(vi, x, z, w, d, h, ry, m, seed) {
    const r = rng(seed), g = new THREE.Group(), y0 = hgt(x, z); g.position.set(x, 0, z); g.rotation.y = ry; S.add(g);
    box(g, w, h + 1.2, d, 0, (h - 1.2) / 2, 0, m, 'wall');                                         // the body, its foot 1.2 m into the ground
    box(g, w + .14, .2, d + .14, 0, h + .04, 0, roofM, 'roof');                                     // the flat roof's edge
    for (const s2 of [-1, 1]) box(g, w, .34, .13, 0, h + .3, s2 * (d / 2 - .06), m, 'wall');        // the parapet
    if (r() < .45) box(g, w * .45, h * .55, d * .45, (r() - .5) * w * .3, h + h * .27, (r() - .5) * d * .3, m, 'wall');   // an upper room
    // the front (+z local): a door and one or two windows; the side: one window
    const door = new THREE.Mesh(new THREE.PlaneGeometry(.92, 1.8), darkM); door.position.set((r() - .5) * w * .4, .9, d / 2 + .015); g.add(door); door.userData.ill = 'door';
    { const li = new THREE.Mesh(K.roundedBox(1.25, .14, .16, .03, 2), woodM); li.position.set(door.position.x, 1.88, d / 2 + .05); li.castShadow = true; g.add(li); li.userData.ill = 'door'; }
    box(g, w + .1, .55, d + .1, 0, -.02, 0, footM, 'roof');                                            // the dark fieldstone footing
    for (let i = 0, nb = Math.max(3, Math.round(w / 1.1)); i < nb; i++) { const bm = new THREE.Mesh(new THREE.CylinderGeometry(.07, .08, .36, 14), woodM); bm.rotation.x = Math.PI / 2; bm.position.set(-w / 2 + (i + .5) * w / nb, h - .3, d / 2 + .12); bm.castShadow = true; g.add(bm); bm.userData.ill = 'door'; }   // the roof beams' ends
    const wins = [];
    const nw = w > 5.6 ? 2 : 1; for (let i = 0; i < nw; i++) { const wx = nw === 1 ? (door.position.x > 0 ? -w * .25 : w * .25) : (i ? w * .32 : -w * .32); if (Math.abs(wx - door.position.x) < .9) continue; wins.push(mkWin(g, wx, h * .62, d / 2 + .02, 0, vi)); }
    wins.push(mkWin(g, w / 2 + .02, h * .62, (r() - .5) * d * .3, Math.PI / 2, vi));
    const o = { g, x, z, y0, w, d, h, ry, wins, vi }; HOUSES.push(o); return o;
  }
  // ---------------------------------------------------------------- the house the camera comes to (round 2: real Galilean detail)
  // basalt courses below, lime-washed plaster above; a raised door on three basalt steps with a long wooden lintel, the door ajar with
  // a thread of lamplight; a tall window with a wooden lintel, a basalt sill and open shutters, the lamp inside spilling warm light
  // onto the sill, the shutters and the ground (a real point light); an outside stair to the roof; a fig tree, clay jars, potted herbs,
  // a vine on the wall. The window is tall and narrow like the prayer room's, and the last frame puts it where that window is.
  const whiteM = wallM('#efe8d8', 'w');
  const basaltM = litPatch(new THREE.MeshStandardMaterial({ color: '#3d3a37', roughness: .9 }), 'basalt', `{ vec2 q = abs(vWN.x) > abs(vWN.z) ? vWP.zy : vWP.xy; float row = floor(q.y / .32); float bw = .5 + .2 * hh(vec2(row, 3.)); vec2 c = floor(vec2(q.x / bw + row * .37, row));
      vec2 f = vec2(fract(q.x / bw + row * .37), fract(q.y / .32)); float j = smoothstep(.0, .07, min(min(f.x, 1. - f.x) * 1.6, min(f.y, 1. - f.y)));
      diffuseColor.rgb *= mix(.45, 1., j) * mix(.75, 1.2, hh(c)) * mix(.9, 1.08, vn(q * 9.)); }`);
  const clayM = litPatch(new THREE.MeshStandardMaterial({ color: '#9a5634', roughness: .85 }), 'clay');
  const herbM = litPatch(new THREE.MeshStandardMaterial({ color: '#4e6a34', roughness: .9 }), 'herb'), figM = litPatch(new THREE.MeshStandardMaterial({ color: '#3e5a2a', roughness: .85 }), 'fig');
  const doorM = litPatch(new THREE.MeshStandardMaterial({ color: '#4a3220', roughness: .8 }), 'door');
  // r3: the room through the window, painted larger — warm plaster lit from below by a clay lamp burning on the inner sill (its flame
  // and its glow), a niche with a jar, a hanging cloth in shadow; the reveal's shade on two sides (the wall's depth)
  const winTexT = (() => { const c = document.createElement('canvas'); c.width = 200; c.height = 420; const x = c.getContext('2d');
    const g = x.createRadialGradient(130, 280, 6, 110, 260, 380); g.addColorStop(0, '#fff6dc'); g.addColorStop(.12, '#ffd690'); g.addColorStop(.42, '#d8843c'); g.addColorStop(.8, '#6a3214'); g.addColorStop(1, '#2a1208'); x.fillStyle = g; x.fillRect(0, 0, 200, 420);
    x.fillStyle = 'rgba(70,30,10,.55)'; x.beginPath(); x.moveTo(126, 40); x.lineTo(176, 40); x.quadraticCurveTo(170, 180, 182, 300); x.lineTo(132, 300); x.quadraticCurveTo(124, 170, 126, 40); x.fill();   // a cloth hanging on the far wall
    x.fillStyle = 'rgba(60,24,8,.6)'; x.beginPath(); x.moveTo(20, 150); x.lineTo(78, 150); x.lineTo(78, 210); x.quadraticCurveTo(49, 196, 20, 210); x.fill();                      // a niche
    x.fillStyle = 'rgba(150,80,40,.9)'; x.beginPath(); x.ellipse(49, 192, 13, 17, 0, 0, 6.283); x.fill(); x.fillRect(44, 170, 10, 8);                                      // its jar
    x.fillStyle = 'rgba(80,40,18,.85)'; x.fillRect(0, 300, 200, 16);                                                                                                       // the inner sill
    x.fillStyle = '#5a3018'; x.beginPath(); x.moveTo(52, 300); x.quadraticCurveTo(56, 322, 96, 322); x.quadraticCurveTo(130, 320, 146, 298); x.quadraticCurveTo(100, 288, 52, 300); x.fill();   // the clay lamp
    const f = x.createRadialGradient(140, 270, 0, 140, 270, 46); f.addColorStop(0, '#ffffff'); f.addColorStop(.3, '#fff0b8'); f.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = f; x.fillRect(90, 220, 100, 100);
    x.fillStyle = '#fffbe8'; x.beginPath(); x.moveTo(134, 298); x.quadraticCurveTo(131, 274, 141, 250); x.quadraticCurveTo(150, 274, 146, 298); x.fill();                    // its flame
    const sh = x.createLinearGradient(0, 0, 0, 60); sh.addColorStop(0, 'rgba(20,8,2,.9)'); sh.addColorStop(1, 'rgba(20,8,2,0)'); x.fillStyle = sh; x.fillRect(0, 0, 200, 60);
    const sl = x.createLinearGradient(0, 0, 34, 0); sl.addColorStop(0, 'rgba(20,8,2,.75)'); sl.addColorStop(1, 'rgba(20,8,2,0)'); x.fillStyle = sl; x.fillRect(0, 0, 34, 420);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; })();
  let SPILL = null, DOORSLIT = null, TRUNK_M = null;
  const trunkMat = () => TRUNK_M || (TRUNK_M = litPatch(new THREE.MeshStandardMaterial({ color: '#5a4a3a', roughness: .95 }), 'figtrunk'));
  function targetHouse(x, z) {
    const g = new THREE.Group(), y0 = hgt(x, z), w = 6.6, d = 6.2, h = 3.6; g.position.set(x, 0, z); S.add(g);
    const add = (geo, mat, px, py, pz, ill, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; g.add(m); m.userData.ill = ill; return m; };
    box(g, w, h + 1.2, d, 0, (h - 1.2) / 2, 0, whiteM, 'wall');
    box(g, w + .1, 2.3, d + .1, 0, .15, 0, basaltM, 'roof');
    box(g, w + .16, .2, d + .16, 0, h + .04, 0, roofM, 'roof');
    for (const s2 of [-1, 1]) box(g, w, .38, .14, 0, h + .32, s2 * (d / 2 - .07), whiteM, 'wall');
    for (const s2 of [-1, 1]) box(g, .14, .38, d, s2 * (w / 2 - .07), h + .32, 0, whiteM, 'wall');
    for (let i = 0; i < 6; i++) { const bm = new THREE.Mesh(new THREE.CylinderGeometry(.075, .085, .34, 14), woodM); bm.rotation.x = Math.PI / 2; bm.position.set(-w / 2 + (i + .5) * w / 6, h - .3, d / 2 + .12); bm.castShadow = true; g.add(bm); bm.userData.ill = 'door'; }
    const dx = 1.15, dy = .48, fz = d / 2;
    add(new THREE.PlaneGeometry(.98, 1.98), darkM, dx, dy + .99, fz + .012, 'door');
    add(K.roundedBox(.8, 1.94, .06, .02, 2), doorM, dx + .12, dy + .97, fz + .2, 'door', -.55);
    DOORSLIT = add(new THREE.PlaneGeometry(.06, 1.9), new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0, 0) }), dx - .43, dy + .96, fz + .02, 'win'); DOORSLIT.castShadow = false;
    for (const s2 of [-1, 1]) add(K.roundedBox(.22, 2.1, .2, .03, 2), basaltM, dx + s2 * .6, dy + 1.0, fz + .06, 'roof');
    add(K.roundedBox(1.7, .2, .26, .03, 2), woodM, dx, dy + 2.12, fz + .08, 'door');
    for (let i = 0; i < 3; i++) add(K.roundedBox(1.7 - i * .1, .16, .38, .04, 2), basaltM, dx, dy - .08 - i * .16, fz + .2 + i * .36, 'roof');
    const wxl = -1.55, wyc = 2.05;
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0, 0), map: winTexT }), wm = add(new THREE.PlaneGeometry(.5, 1.05), mat, wxl, wyc, fz + .012, 'win'); wm.castShadow = false;
    for (const s2 of [-1, 1]) add(K.roundedBox(.16, 1.2, .16, .03, 2), basaltM, wxl + s2 * .33, wyc, fz + .07, 'roof');
    add(K.roundedBox(1.25, .18, .22, .03, 2), woodM, wxl, wyc + .66, fz + .1, 'door');
    add(K.roundedBox(.8, .1, .3, .03, 2), basaltM, wxl, wyc - .58, fz + .14, 'roof');
    for (const s2 of [-1, 1]) { const sh = add(K.roundedBox(.28, 1.02, .05, .015, 2), doorM, 0, wyc, 0, 'door'); sh.position.set(wxl + s2 * (.42 + .14 * Math.cos(1.4)), wyc, fz + .12 + .14 * Math.sin(1.4) * .5); sh.rotation.y = -s2 * 1.4; }   // swung back flat to the wall
    const tw = { m: wm, mat, v: 1, t0: 1e9, k: 0 }; WINS.push(tw);
    SPILL = new THREE.PointLight(col('#ffb070'), 0, 9, 2); SPILL.position.set(wxl, wyc - .25, fz + .75); g.add(SPILL);
    for (let i = 0; i < 9; i++) add(K.roundedBox(1.0, (i + 1) * .4, .44, .04, 2), i < 3 ? basaltM : whiteM, w / 2 + .52, (i + 1) * .2 - .02, fz - .45 - i * .44, i < 3 ? 'roof' : 'wall');
    const lathe = (pts, sc) => new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a * sc, b * sc)), 16);
    const jar = [[0, 0], [.16, .02], [.24, .2], [.25, .45], [.18, .66], [.09, .74], [.11, .8], [.0, .8]], pot = [[0, 0], [.13, 0], [.17, .18], [.19, .26], [0, .26]];
    add(lathe(jar, 1.1), clayM, -2.55, 0, fz + .34, 'roof'); add(lathe(jar, .9), clayM, -2.95, 0, fz + .5, 'roof');
    const herbs = (px, py, pz, sc) => { add(lathe(pot, sc), clayM, px, py, pz, 'roof'); const r = rng(Math.abs((px * 100 + pz * 10) | 0) + 1); for (let k = 0; k < 7; k++) { const a = r() * 6.283, rr = r() * .12 * sc; add(new THREE.IcosahedronGeometry(.11 * sc, 1), herbM, px + Math.cos(a) * rr, py + .3 * sc + r() * .16 * sc, pz + Math.sin(a) * rr, 'leaf'); } };
    herbs(dx + .7, dy - .08, fz + .25, 1.1); herbs(dx - .62, dy - .24, fz + .6, 1.0); herbs(dx + .62, dy - .4, fz + .95, 1.2);
    { const r = rng(77), leaf = new THREE.CircleGeometry(1, 6); for (let k = 0; k < 90; k++) { const u = r(), vx2 = dx - 1.05 + u * 2.1, arch = 2.62 + .32 * Math.sin(Math.PI * u), vy2 = arch + (r() - .3) * .42;
        const m = add(leaf, herbM, vx2, vy2 + dy, fz + .07 + r() * .07, 'leaf'); const sc = .09 + r() * .07; m.scale.set(sc, sc * (.8 + r() * .3), sc); m.rotation.set((r() - .5) * .8, (r() - .5) * .8, r() * 3); m.castShadow = true; }
      for (let k = 0; k < 14; k++) { const t = k / 14; const m = add(leaf, herbM, dx + .88 + Math.sin(t * 7) * .05, dy + .1 + t * 2.5, fz + .08, 'leaf'); const sc = .08 + r() * .05; m.scale.set(sc, sc, sc); m.rotation.z = r() * 3; } }   // and up the jamb from a root by the step
    { const fx = -w / 2 - 1.5, fz2 = fz - .8, tr = K.tree({ seed: 31, height: 3.6, trunk: .16, depth: 4, spread: .9, up: .25, twig: 0, mat: trunkMat(), layer: 0 }); tr.position.set(fx, 0, fz2); g.add(tr);
      const r = rng(32); for (let k = 0; k < 40; k++) { const a = r() * 6.283, rr = Math.sqrt(r()) * 1.6; const m = add(new THREE.IcosahedronGeometry(.42 + r() * .3, 1), figM, fx + Math.cos(a) * rr, 2.3 + r() * 1.4, fz2 + Math.sin(a) * rr, 'leaf'); m.rotation.set(r() * 3, r() * 3, 0); m.scale.y = .7; } }
    const o = { g, x, z, y0, w, d, h, ry: 0, wins: [tw], vi: 1 }; HOUSES.push(o); return o;
  }
  let TARGET = null;
  VILLS.forEach(([vx, vz, rad, n, seed], vi) => { const r = rng(seed * 31 + 1);
    const placed = [];
    if (vi === 1) {   // the lamp village: the house the camera goes to stands at its front edge, its face to the camera (+z)
      const th = targetHouse(vx - 12, vz + rad * .62); placed.push([th.x, th.z, 7]); TARGET = th;
    }
    for (let i = 0, tries = 0; i < n && tries < 400; tries++) { const a = r() * 6.283, rr = Math.sqrt(r()) * rad, x = vx + Math.cos(a) * rr, z = vz + Math.sin(a) * rr * .8;
      const w = 4.6 + r() * 3, d = 5 + r() * 2.6, h = 2.7 + r() * 1.4;
      if (placed.some(([px, pz, pr]) => Math.hypot(px - x, pz - z) < pr + Math.max(w, d) * .62 + 1.6)) continue;
      if (vi === 1 && TARGET && z > TARGET.z - 6 && Math.abs(x - TARGET.x) < 30) continue;   // nothing in front of the window's house
      if (roadD(x, z) < Math.max(w, d) * .55 + 2.5) continue;
      const ry = (r() - .5) * .35 + (vi === 1 ? 0 : (r() < .3 ? Math.PI / 2 : 0));
      house(vi, x, z, w, d, h, ry, MW[(r() * 3) | 0], seed * 100 + i); placed.push([x, z, Math.max(w, d) * .62]); i++;
      if (r() < .5) { const cw = new THREE.Mesh(K.roundedBox(.45, 1.2, 3 + r() * 4, .08, 2), MW[(r() * 3) | 0]); const ca = r() * 6.283; cw.position.set(x + Math.cos(ca) * (w * .9), hgt(x + Math.cos(ca) * (w * .9), z + Math.sin(ca) * (d * .9)) + .45, z + Math.sin(ca) * (d * .9)); cw.rotation.y = r() * 3; cw.castShadow = cw.receiveShadow = true; cw.userData.ill = 'wall'; cw.userData.y0 = cw.position.y; S.add(cw); HOUSES.push({ g: cw, wallOnly: true, y0: cw.position.y - .45 }); } }
  });
  const TW = TARGET.wins[0]; TW.target = true;
  const TWP = new THREE.Vector3(); const targetWorld = () => { TARGET.g.updateMatrixWorld(); return TW.m.getWorldPosition(TWP.set(0, 0, 0)); };
  // window lamps: the order they light (the lamp village one by one, the target early; far villages as small points)
  // r4 (N29c "하나님이 왕으로 다스리시는 것"): the light reaches village after village — far shore first, round the lake, the near
  // villages, the lamp village last — each village a quick ripple of its windows (0.15–1.1 s apart), every house in it
  const ORDER = [3, 2, 4, 0, 5, 1], VT = {}; { const c = B.N29c; ORDER.forEach((vi, k) => { VT[vi] = c + .4 + k * (vi === 1 ? 1.0 : .95); }); }
  { const r = rng(55); for (const w of WINS) { if (w.target) continue; const n = WINS.filter(q => q.v === w.v).indexOf(w); w.t0 = VT[w.v] + (w.v === 1 ? n * .2 : n * .09) + r() * .5; }
    TW.t0 = T.target; }
  // in-scatter halos for the nearest windows (cine.js has 24 lamps)
  const lampWins = [TW, ...WINS.filter(w => w.v === 1 && !w.target).slice(0, 18)];
  lampWins.forEach(w => { w.lamp = film.lamp(V(), '#ffb060', { power: 0, size: .9, fog: 1 }); });
  // a soft halo over each other village as its lamps come on (seen from the air the windows themselves are a few pixels)
  const GLOWS = (() => { const hs = HOUSES.filter(o => o.wins && o.wins.length), n = hs.length, pos = new Float32Array(n * 3), aK = new Float32Array(n), aS = new Float32Array(n);
    hs.forEach((o, i) => { pos[i * 3] = o.x; pos[i * 3 + 1] = o.y0 + 2.2; pos[i * 3 + 2] = o.z; aS[i] = .7 + (i * .37 % 1) * .6; });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aK', new THREE.BufferAttribute(aK, 1)); g.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
    const u = { uPx: { value: H / 2 / Math.tan(FOV / 2 * D2R) }, uLift: { value: 1 } };
    const m = new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: `attribute float aK, aS; uniform float uPx; varying float vK, vNear; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
        float d = -mv.z; gl_PointSize = clamp(uPx * 15. * aS / d, 3., 44.); vNear = smoothstep(90., 220., d); vK = aK; }`,
      fragmentShader: `varying float vK, vNear; void main(){ vec2 q = gl_PointCoord - .5; float r = length(q) * 2.; float a = exp(-r * r * 4.) * vK * vNear; if (a < .002) discard; gl_FragColor = vec4(vec3(3.4, 2.0, .8) * a, a); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 5; S.add(pts); return { pts, hs, aK, g }; })();
  const HALOS = VILLS.map(([vx, vz, rad], vi) => vi === 1 ? null : { vi, L: film.lamp(V(vx, hgt(vx, vz) + 6, vz), '#ffb468', { power: 0, size: rad * .55, fog: 1 }) }).filter(Boolean);

  // ---------------------------------------------------------------- olive trees (clumps of grey-green), a few palms; kept off fields, roads, water
  const leafM = litPatch(new THREE.MeshStandardMaterial({ color: '#66704c', roughness: .9 }), 'leaf'), trunkM = litPatch(new THREE.MeshStandardMaterial({ color: '#4a3a2a', roughness: .95 }), 'trunk');
  const TREES = [];
  { const n = 1400, NO = 2600, ico = new THREE.IcosahedronGeometry(1, 1), inst = new THREE.InstancedMesh(ico, leafM, (n + NO) * 3), trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.18, .28, 1, 6), trunkM, n + NO), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    let ti = 0, li = 0;
    for (let tries = 0; ti < n && tries < 40000; tries++) {
      const x = (R() - .5) * 2600, z = 300 - R() * 1500, d = lakeD(x, z);
      if (d < 1.08 || fieldM(x, z) > .2 || roadD(x, z) < 6) continue;
      let nearV = 99; for (const [vx, vz, rad] of VILLS) nearV = Math.min(nearV, Math.hypot(x - vx, z - vz) / rad);
      if (nearV < 1.05) continue;
      const dens = Math.max(ss(1.9, 1.1, nearV) * .9, .05 + .3 * ss(.3, .7, fbm2(x * 3, z * 3) * .5 + .5));
      if (R() > dens) continue;
      const hgtT = 4.5 + R() * 2.5, y = hgt(x, z);
      TREES.push({ x, z, y, h: hgtT, i0: li, ti });
      m4.compose(V(x, y + hgtT * .25, z), q.identity(), V(1, hgtT * .5, 1)); trunks.setMatrixAt(ti, m4);
      for (let k = 0; k < 3; k++) { const a = R() * 6.283, rr = R() * 1.3; m4.compose(V(x + Math.cos(a) * rr, y + hgtT * (.62 + R() * .22), z + Math.sin(a) * rr), q.setFromEuler(new THREE.Euler(R() * 3, R() * 3, 0)), V(1, .72, 1).multiplyScalar(1.4 + R() * 1.1)); inst.setMatrixAt(li++, m4); }
      ti++; }
    // orchards (round 2): olive groves planted in rows on the slopes round the villages and on the far shore, each grid on its own angle
    const OR = [[-250, -150, 190, 120, .3], [235, -125, 170, 110, -.2], [150, -335, 80, 60, .1], [-210, -415, 90, 60, -.35], [210, -1095, 220, 110, .05], [-360, -1000, 190, 120, .4], [-540, -520, 200, 170, .2], [520, -420, 180, 160, -.3], [-20, -1170, 200, 80, .15]];
    for (const [cx, cz, ow, od, an] of OR) { const ca = Math.cos(an), sa = Math.sin(an), dx = 8.5, dz = 9.5;
      for (let u = -ow / 2; u <= ow / 2 && ti < n + NO; u += dx) for (let v = -od / 2; v <= od / 2 && ti < n + NO; v += dz) {
        const x = cx + u * ca - v * sa + (R() - .5) * 1.4, z = cz + u * sa + v * ca + (R() - .5) * 1.4;
        if (lakeD(x, z) < 1.1 || roadD(x, z) < 5) continue; let nv = 99; for (const [vx, vz, rad] of VILLS) nv = Math.min(nv, Math.hypot(x - vx, z - vz) / rad); if (nv < 1.1) continue;
        if (R() < .08) continue;                                                                     // a gap here and there (an old tree gone)
        const hgtT = 3.8 + R() * 1.6, y = hgt(x, z); TREES.push({ x, z, y, h: hgtT, i0: li, ti });
        m4.compose(V(x, y + hgtT * .25, z), q.identity(), V(1, hgtT * .5, 1)); trunks.setMatrixAt(ti, m4);
        for (let k = 0; k < 3; k++) { const a = R() * 6.283, rr = R() * 1.0; m4.compose(V(x + Math.cos(a) * rr, y + hgtT * (.62 + R() * .2), z + Math.sin(a) * rr), q.setFromEuler(new THREE.Euler(R() * 3, R() * 3, 0)), V(1, .72, 1).multiplyScalar(1.3 + R() * .7)); inst.setMatrixAt(li++, m4); }
        ti++; } }
    inst.count = li; trunks.count = ti; inst.castShadow = trunks.castShadow = true; inst.receiveShadow = true; S.add(inst, trunks);
    inst.userData.ill = 'leaf'; trunks.userData.ill = 'trunk';
    TREES.inst = inst; TREES.trunks = trunks; }
  // lift the trees and houses with the land (trees/houses .7 → 1 high; they sit on the lifted ground)
  const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), tmpP = new THREE.Vector3(), tmpS = new THREE.Vector3();
  const treeBase = []; { for (let i = 0; i < TREES.inst.count; i++) { TREES.inst.getMatrixAt(i, m4); const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m4.decompose(p, q, s); treeBase.push([p, q, s]); } }
  const trunkBase = []; { for (let i = 0; i < TREES.trunks.count; i++) { TREES.trunks.getMatrixAt(i, m4); const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m4.decompose(p, q, s); trunkBase.push([p, q, s]); } }
  let objLift = -1;
  const liftObjects = L => { if (Math.abs(L - objLift) < 1e-5) return; objLift = L; const ts = lerp(.62, 1, L), hs = lerp(.7, 1, L);
    for (const o of HOUSES) { if (o.wallOnly) { o.g.position.y = o.y0 * ts + .45 * hs; o.g.scale.y = hs; continue; } o.g.position.y = o.y0 > 0 ? o.y0 * ts : o.y0; o.g.scale.y = hs; }
    for (const tr of TREES) { const gy = tr.y > 0 ? tr.y * ts : tr.y; for (let k = 0; k < 3; k++) { const [p, q, s] = treeBase[tr.i0 + k]; tmpP.set(p.x, gy + (p.y - tr.y) * hs, p.z); tmpS.set(s.x, s.y * hs, s.z); m4.compose(tmpP, q, tmpS); TREES.inst.setMatrixAt(tr.i0 + k, m4); }
      const [p, q, s] = trunkBase[tr.ti]; tmpP.set(p.x, gy + (p.y - tr.y) * hs, p.z); tmpS.set(s.x, s.y * hs, s.z); m4.compose(tmpP, q, tmpS); TREES.trunks.setMatrixAt(tr.ti, m4); }
    TREES.inst.instanceMatrix.needsUpdate = true; TREES.trunks.instanceMatrix.needsUpdate = true; };
  liftObjects(0);

  // ---------------------------------------------------------------- the camera
  const CAM0 = { pos: V(-20, 95, 60), yaw: 3.5 * D2R, pitch: -12.5 * D2R };    // the develop camera = the miniature's view
  const CAM1 = { pos: V(-20, 250, 150), yaw: 2.0 * D2R, pitch: -12.5 * D2R };   // r4: the crane tops out looking over the lake and every village round it     // the top of the crane
  const fwd = (yaw, pitch) => V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  function setCam(pos, look) { cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.updateMatrixWorld(); }
  function camAt(t) {
    // 1. the crane (lift + rise + tilt), eased
    const ck = eio((t - T.crane[0]) / (T.crane[1] - T.crane[0]));
    const cp = CAM0.pos.clone().lerp(CAM1.pos, ck); cp.y = CAM0.pos.y * Math.pow(CAM1.pos.y / CAM0.pos.y, ck);
    const cd = fwd(lerp(CAM0.yaw, CAM1.yaw, ck), lerp(CAM0.pitch, CAM1.pitch, sine(ck)));
    // 2. the glide down to the window: log distance (constant apparent speed) with eased ends; the direction swings from the
    //    crane's top to level in front of the facade by the time we are ~40 m away
    const wp = targetWorld(), ak = clamp((t - T.approach[0]) / (T.approach[1] - T.approach[0]));
    const kl = (() => { const a = .16, b = .12, v = 1 / (1 - a / 2 - b / 2); if (ak < a) return v * ak * ak / (2 * a); if (ak > 1 - b) return 1 - v * (1 - ak) * (1 - ak) / (2 * b); return v * (a / 2 + ak - a); })();   // quadratic ease in/out, even speed between
    const d1 = CAM1.pos.distanceTo(wp), dE = 3.5, dist = d1 * Math.pow(dE / d1, kl);
    const dir0 = CAM1.pos.clone().sub(wp).normalize(), dirE = V(.1, .04, 1).normalize(), dk = sine(clamp(kl * 1.22));   // round 2: we end a little to the side, the window at the frame's left
    const dir = dir0.clone().lerp(dirE, dk).normalize();
    const ap = wp.clone().addScaledVector(dir, dist);
    const lookA = CAM1.pos.clone().addScaledVector(fwd(CAM1.yaw, CAM1.pitch), 900), lk = sine(clamp((kl - .05) / .6));
    let al = lookA.clone().lerp(wp.clone().add(V(0, -.05, 0)), lk);
    // r3: the last stretch ends on the lit window itself, centred and a little low in the frame (the lamp on its sill in view) —
    // never on the wall (관리자 2026-11-20 "지금 임합니다 … 벽에서 끝나는 게 무슨 의미?")
    { const fk = sine(clamp((kl - .6) / .38)); if (fk > 0) al = al.clone().lerp(wp.clone().add(V(0, -.3, 0)), fk); }   // the window sits in the upper middle, clear of the captions
    // blend the crane into the glide (both are at rest at the joint: no jump in speed)
    const bw = ss(T.approach[0], T.approach[0] + 1.6, t);
    if (bw <= 0) return { pos: cp, look: cp.clone().addScaledVector(cd, 900) };
    const cl = cp.clone().addScaledVector(cd, 900);
    const pos = cp.lerp(ap, bw), g = hgt(pos.x, pos.z) * lerp(.62, 1, eio((t - T.lift[0]) / (T.lift[1] - T.lift[0]))) + 1.4;   // never under the ground (soft floor)
    if (pos.y < g + 1.5) pos.y = g + 1.5 * Math.exp((pos.y - g - 1.5) / 1.5);   // continuous in value and slope at g + 1.5; tends to g
    return { pos, look: cl.lerp(al, bw), dist };
  }

  // ---------------------------------------------------------------- the miniature: the same world, flat colours + ink (once, at init)
  const paint = paintPass();
  function paintPass() {
    setLift(0); liftObjects(0); setCam(CAM0.pos, CAM0.pos.clone().addScaledVector(fwd(CAM0.yaw, CAM0.pitch), 900));
    cam.updateProjectionMatrix(); S.updateMatrixWorld(true);
    const Rr = film.renderer, rtC = new THREE.WebGLRenderTarget(W, H, { samples: 4 }), rtD = new THREE.WebGLRenderTarget(W, H);
    const PAL = { wall: [.95, .9, .8], roof: [.86, .7, .44], door: [.42, .16, .08], win: [.16, .1, .06], leaf: [.2, .36, .2], trunk: [.3, .2, .12] };
    // the ground in the illuminator's flat tones: hills in three steps of light, the fields' patchwork, the roads in vellum
    const ILLG = `varying vec3 vWP; varying vec3 vN; uniform vec3 uSun; ${hashGLSL} ${LAKE_GLSL} ${FIELD_GLSL}
      void main(){ vec2 q = vWP.xz; float d = lakeD(q), fm = fieldM(q); float l = dot(normalize(vN), normalize(vec3(uSun.x, .55, uSun.z)));
        float far = smoothstep(500., 1700., length(vWP.xz - vec2(0., 250.)));
        vec3 g0 = mix(vec3(.30, .48, .24), vec3(.40, .5, .46), far), g1 = mix(vec3(.40, .58, .28), vec3(.5, .6, .52), far), g2 = mix(vec3(.55, .68, .34), vec3(.62, .7, .6), far);
        vec3 c = l < .42 ? g0 : l < .62 ? g1 : g2;
        vec2 rq = mat2(.94, -.34, .34, .94) * q; vec2 cell = floor(rq / vec2(46., 30.)); float hc = hh(cell);
        vec3 fc = hc < .3 ? vec3(.86, .7, .34) : hc < .55 ? vec3(.5, .62, .28) : hc < .8 ? vec3(.62, .4, .22) : vec3(.78, .66, .36);
        float fur = step(.72, fract((hc < .5 ? rq.x : rq.y) / 4.5)); fc *= 1. - fur * .07;
        c = mix(c, fc, step(.5, fm));
        float rd = 1e9; ${ROADS.map(([ax, az, bx, bz]) => `{ vec2 a = vec2(${ax}., ${az}.), v = vec2(${bx - ax}., ${bz - az}.); float k = clamp(dot(q - a, v) / dot(v, v), 0., 1.); rd = min(rd, length(q - a - v * k)); }`).join(' ')}
        c = mix(c, vec3(.93, .86, .7), step(rd, 3.2));
        c = mix(c, vec3(.8, .74, .58), step(d, 1.035) * step(.99, d));
        gl_FragColor = vec4(c, 1.); }`;
    const VS = `varying vec3 vWP; varying vec3 vN; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vWP = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`;
    const illGround = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: ILLG, uniforms: { uSun: { value: SUN0 } } });
    const flat = c => new THREE.MeshBasicMaterial({ color: new THREE.Color(...c) });
    const illWater = new THREE.MeshBasicMaterial({ color: new THREE.Color(.15, .27, .6) });
    // shaded flats for walls/leaves (two tones by the sun side), via a tiny shader that also works with instancing
    const shadedFlat = (c0, c1) => new THREE.ShaderMaterial({ uniforms: { uSun: { value: SUN0 } },
      vertexShader: `#include <common>
        varying vec3 vN; void main(){ vec3 objectNormal = normal; vec3 transformed = position;
          #ifdef USE_INSTANCING
          objectNormal = mat3(instanceMatrix) * objectNormal;
          #endif
          vN = normalize(mat3(modelMatrix) * objectNormal);
          #include <project_vertex>
        }`,
      fragmentShader: `varying vec3 vN; uniform vec3 uSun; void main(){ float l = dot(normalize(vN), normalize(vec3(uSun.x, .6, uSun.z))); gl_FragColor = vec4(l > .25 ? vec3(${c1.join(',')}) : vec3(${c0.join(',')}), 1.); }` });
    const MAT = { ground: illGround, water: illWater, wall: shadedFlat([.78, .7, .58], PAL.wall), roof: flat(PAL.roof), door: flat(PAL.door), win: flat(PAL.win), leaf: shadedFlat([.14, .27, .15], [.28, .46, .25]), trunk: flat(PAL.trunk) };
    // depth + id for the ink: r,g = log depth (16 bit), b = object class id
    const IDS = { ground: 1, water: 2, wall: 3, roof: 4, door: 5, win: 6, leaf: 7, trunk: 8 };
    const depthMat = id => new THREE.ShaderMaterial({ uniforms: { uId: { value: id / 16 } },
      vertexShader: `#include <common>
        varying float vZ; void main(){ vec3 transformed = position;
          #include <project_vertex>
          vZ = -mvPosition.z; }`,
      fragmentShader: `varying float vZ; uniform float uId; void main(){ float v = clamp(log2(max(vZ, 1.)) / 13., 0., 1.); float hi = floor(v * 255.) / 255.; gl_FragColor = vec4(hi, (v - hi) * 255., uId, 1.); }` });
    const DMAT = {}; for (const k in IDS) DMAT[k] = depthMat(IDS[k]);
    const saved = []; sky.mesh.visible = false;
    S.traverse(o => { if (!o.isMesh) return; const k = o.userData.ill || (o.parent && o.parent.userData.ill); saved.push([o, o.material, o.visible]); if (!k || !MAT[k]) { o.visible = false; return; } o.userData._k = k; });
    const pass = (rt, pick) => { for (const [o] of saved) if (o.userData._k) o.material = pick(o.userData._k); Rr.setRenderTarget(rt); Rr.setClearColor(0x000000, 0); Rr.clear(); Rr.render(S, cam); };
    const prevTone = Rr.outputColorSpace; Rr.outputColorSpace = THREE.LinearSRGBColorSpace;
    const sf = S.fog; S.fog = null;
    pass(rtC, k => MAT[k]); const pc = new Uint8Array(W * H * 4); Rr.readRenderTargetPixels(rtC, 0, 0, W, H, pc);
    pass(rtD, k => DMAT[k]); const pd = new Uint8Array(W * H * 4); Rr.readRenderTargetPixels(rtD, 0, 0, W, H, pd);
    S.fog = sf; Rr.outputColorSpace = prevTone;
    for (const [o, m, v] of saved) { o.material = m; o.visible = v; delete o.userData._k; } sky.mesh.visible = true; Rr.setRenderTarget(null);
    rtC.dispose(); rtD.dispose();
    // canvases (flip y: GL rows are bottom-up)
    const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
    const colC = mk(), cg = colC.getContext('2d'), ci = cg.createImageData(W, H);
    const inkC = mk(), ig = inkC.getContext('2d'), ii = ig.createImageData(W, H);
    const watC = mk(), wg = watC.getContext('2d'), wi = wg.createImageData(W, H);
    const dep = new Float32Array(W * H), cls = new Uint8Array(W * H);
    let horizonY = H;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = ((H - 1 - y) * W + x) * 4, o = (y * W + x) * 4;
      ci.data[o] = pc[s]; ci.data[o + 1] = pc[s + 1]; ci.data[o + 2] = pc[s + 2]; ci.data[o + 3] = pc[s + 3];
      dep[y * W + x] = pd[s + 3] ? (pd[s] + pd[s + 1] / 255) / 255 : 1.2; cls[y * W + x] = pd[s + 3] ? Math.round(pd[s + 2] / 255 * 16) : 0;
      if (cls[y * W + x] === 2) wi.data[o + 3] = 255; }
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (cls[y * W + x]) { horizonY = Math.min(horizonY, y); break; }
    // ink: a class change, or a jump in depth, or (inside one class) a change of the flat tone — then thickened by one px
    const E = new Uint8Array(W * H);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x, c0 = cls[i];
      let e = 0; for (const j of [i + 1, i + W]) { if (cls[j] !== c0) { e = 1; break; } const dz = Math.abs(dep[j] - dep[i]); if (dz > .006 + .0 * dep[i]) { e = Math.max(e, clamp((dz - .006) / .01) ); }
        const o1 = i * 4, o2 = j * 4, dc = Math.abs(ci.data[o1] - ci.data[o2]) + Math.abs(ci.data[o1 + 1] - ci.data[o2 + 1]) + Math.abs(ci.data[o1 + 2] - ci.data[o2 + 2]);
        if (dc > 40 && c0 !== 1) e = Math.max(e, .75); else if (dc > 75) e = Math.max(e, .5); }
      E[i] = Math.round(e * 255); }
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x, e = Math.max(E[i], E[i - 1] * .6, E[i - W] * .6); if (e < 20) continue; const o = i * 4;
      ii.data[o] = 42; ii.data[o + 1] = 26; ii.data[o + 2] = 16; ii.data[o + 3] = Math.min(255, e * 1.05); }
    cg.putImageData(ci, 0, 0); ig.putImageData(ii, 0, 0); wg.putImageData(wi, 0, 0);
    return { color: colC, ink: inkC, water: watC, horizonY };
  }

  // ---------------------------------------------------------------- one frame
  const Lk = film.look, D = film.dofCfg, A = film.atmos;
  const look0 = { exposure: Lk.exposure, contrast: Lk.contrast, saturation: Lk.saturation };
  function frame3D(t) {
    // the land rises with the develop
    const L = eio((t - T.lift[0]) / (T.lift[1] - T.lift[0])); setLift(L); liftObjects(L);
    // the gold runs out to the horizon
    const gk = clamp((t - T.gold[0]) / (T.gold[1] - T.gold[0])); GU.uGR.value = gk <= 0 ? -10 : 40 + 4200 * Math.pow(gk, 1.6); GU.uAct.value = ss(T.dev[0], T.dev[1], t);
    // dusk: the sun goes down, the gilding quiets so the lamps can read
    const dk = sine((t - T.dusk[0]) / (T.dusk[1] - T.dusk[0]));
    const sd = SUN0.clone().lerp(SUN1, dk).normalize(); setSun(sd); WU.uSun.value.copy(sd); sunLamp.pos.copy(sd.clone().multiplyScalar(6000));
    sunL.intensity = lerp(3.1, .55, dk); sunL.color.set(col('#ffd296').lerp(col('#ff9a58'), dk)); hemi.intensity = lerp(.5, .42, dk); hemi.color.copy(col('#b0bcd4').lerp(col('#7c88b8'), dk));
    sunLamp.power = lerp(260, 180, dk);
    const gl = 1 + .3 * Math.pow(gk, .7) * (1 - dk); sky.u.top.value.copy(col('#2848a0', .8).lerp(col('#1c2c6a', .5), dk)); sky.u.mid.value.copy(col('#d9a85c', .85 * gl).lerp(col('#b87060', .6), dk)); sky.u.horizon.value.copy(col('#ffd286', 1.5 * gl).lerp(col('#ff9858', 1.2), dk));
    A.color.copy(col('#c8a87a', .6).lerp(col('#7a5e62', .42), dk)); A.colorUp = (A.colorUp || A.color.clone()); A.colorUp.copy(col('#b8b4b0', .55).lerp(col('#605e80', .4), dk));
    WU.uSkyH.value.copy(col('#ffd286', 1.1).lerp(col('#ff9858', .9), dk)); WU.uSkyT.value.copy(col('#2848a0', .8).lerp(col('#1c2c6a', .5), dk));
    GU.uGild.value = lerp(1, .45, dk);
    Lk.exposure = look0.exposure * lerp(1, 1.62, dk); Lk.saturation = look0.saturation * lerp(1, 1.06, dk);
    // the windows
    for (const w of WINS) { const k = ss(w.t0, w.t0 + .7, t) * (1 + .05 * Math.sin(t * 5.3 + w.t0 * 7)); w.k = k;
      const glow = w.target ? 1 + 2.2 * ss(T.glow[0], T.glow[1], t) : (w.v === 1 ? 1 : 3.2); w.mat.color.setRGB(.02 + 3.4 * k * glow, .012 + 1.9 * k * glow, .004 + .62 * k * glow);
      if (w.target) { SPILL.intensity = k * glow * 3.5; DOORSLIT.material.color.setRGB(1.1 * k, .62 * k, .22 * k); }
      if (w.lamp) { w.m.getWorldPosition(w.lamp.pos); w.lamp.pos.add(V(0, 0, .5).applyQuaternion(w.m.getWorldQuaternion(qq))); w.lamp.power = k * (w.target ? 2.4 * glow : 1.6); } }
    for (const h of HALOS) { let sk = 0, n = 0; for (const w of WINS) if (w.v === h.vi) { sk += w.k; n++; } h.L.power = (n ? sk / n : 0) * 140; }
    { const ts = lerp(.62, 1, eio((t - T.lift[0]) / (T.lift[1] - T.lift[0]))), P2 = GLOWS.g.attributes.position.array;
      GLOWS.hs.forEach((o, i) => { let mk = 0; for (const w of o.wins) mk = Math.max(mk, w.k); GLOWS.aK[i] = mk; P2[i * 3 + 1] = (o.y0 > 0 ? o.y0 * ts : o.y0) + 2.2; });
      GLOWS.g.attributes.aK.needsUpdate = true; GLOWS.g.attributes.position.needsUpdate = true; }
    // camera
    const c = camAt(t); setCam(c.pos, c.look);
    const fd = c.dist != null ? lerp(c.pos.distanceTo(c.look), c.dist, ss(T.approach[0] + 6, T.approach[1] - 4, t)) : 650;
    D.focus = fd; D.aperture = lerp(.2, 1.6, ss(T.approach[1] - 7, T.approach[1] - 2, t));
    film.render(t);
  }
  function blit(ctx, k = 1) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore(); }
  function draw(ctx, t, k = 1) { frame3D(t); blit(ctx, k); }
  // where the target window is on screen at film time t (for the page's light-to-light dissolve)
  function windowScreen(t) { const c = camAt(t); setCam(c.pos, c.look); cam.updateProjectionMatrix(); const p = targetWorld().clone().project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; }
  return { draw, paint, T, film, windowScreen, CAM0 };
}
