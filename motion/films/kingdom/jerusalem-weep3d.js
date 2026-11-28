// jerusalem-weep3d.js — 「kingdom」 4부 「예루살렘을 보시고 우심」, 10-3 test cut of the four-person plan (rounds/r10-pilot/council/test-brief.md §B,
// plan.md, bold.md; owner 2026-11-28 "이대로 시험컷 만들어봐"). Back to 3D: the world, people and light of fix 1 (3365dae9) with the 9e9fa17f
// long lens and haze; the 2D panorama of fix 2 is gone. film 496.1 (N133) → 554.1 (C13). All times from script.json through beats().
// The test covers three shots (the full scene comes later; N135b and N137 are placeholders that only continue the camera before them):
//   JA N133 → N134b     「그림자의 강」: hundreds of long crowd and palm shadows flowing toward the city, cast by bodies that are NOT drawn
//                       (layer 3: the sun's shadow camera only — the pentecost3d layer-3 method); the procession's head far down the road as
//                       4–8 px dots. The camera cranes down from 30 m to 1 m along the river. On 「그런데」 one shadow stops — his.   crane down
//   JB N134b → N135b    His small back (≤ 8 % of the frame height), backlit, opaque, behind the haze, the horizon (the city's base line) above
//                       his shoulder, a rim only on the TOP of the head cloth and shoulders (rimTop); the golden city beyond, the Temple a
//                       silhouette in haze, the sun right of it. Push in + truck (parallax), easing to a hold on Q108b.
//                       Q108b: the SAME camera, fixed — the sun off, an ash-grey sky, the Temple pulled down to a heap and three stubs,
//                       the walls broken, the houses stumps, three smoke columns (the same scene graph, setRuin). On 「보살핌 받는 날을」 a
//                       clean cut back to the golden city with his small figure in frame; the push resumes.
//   J6 N136             「산 그림자가 성을 덮다」 (stage director): the sun sinks behind the Mount of Olives behind the camera; the Mount's shadow
//                       edge crosses the Kidron in time-lapse, climbs the walls and swallows the city; the gold on the Temple top goes out
//                       last. Locked camera; only the sun's azimuth and elevation move. No bodies, no close buildings.
//                       (The Mount's summit is a shadow-only ridge east of the camera, layer 3.)
// Rules: Jesus never by face or profile, never large or central, no halo, no light behind his head (the sun ≥ 300 px from it); men in a tied
// head cloth with a level top ending at the shoulder (tidyCloth), broad level shoulders; no waist light; words never on art.
// API: const M = await import('./jerusalem-weep3d.js'); const T = M.beats(B); const JW = await M.build(W, H); JW.draw(ctx, t, T)
//      t = FILM seconds; B = line times + B.pc (Film.pieces second-piece times). JW.probe(t, T) · JW.proj(t, T) for the checks.
// Code copied with a note (never edited there): crowd-evening3d.js (rimSun, ground, tufts, motes, shimmer, godRays), olivet3d.js (wallM, the
// Temple and walls), pastel-children.js (pastel pass, famTau stop); people3d.js imported.
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
  const pc = B.pc || {}, P = (id, i, d) => (pc[id] ? pc[id][i] : d);
  const T = { t0: B.N133, end: B.C13 };
  T.n134b = P('N134', 1, B.N134 + 1.6);      // 「그 성을 보며」
  T.q44b = P('Q108b', 1, B.Q108b + 4.2);      // 「이는 네가 …」
  T.cuts = [B.N133, T.n134b, B.N135b, B.N136, B.N137];
  T.names = ['JA', 'JB', 'JN', 'J6', 'J7'];   // JN, J7: placeholders (full scene later)
  T.crane = [B.N133, B.N134 + .1];          // JA: the crane lands as his shadow stops
  T.jStop = B.N134 + .1;                     // on 「그런데」 his last step lands — one shadow stops, the others flow on
  T.jDec = 1.6;                              // he slows over two steps
  T.bow = [B.N134 + .7, B.N134 + 2.5];       // a slight bow of the head (read in his shadow, then his small back)
  T.drop = B.N134 + 2.0;                     // the shoulders drop once
  T.hold = B.Q108b;                          // JB: the push eases to a hold here — the ruin is the same frame
  T.ruin = [B.Q108b, T.q44b + .7];           // clean cut to the ruin; clean cut back on 「보살핌 받는 날을」
  T.sunset = [B.N136 + .2, B.N137 - .4];     // J6: the Mount's shadow edge from the near slope to the Temple's gold
  T.dark = [B.C13 - 2.0, B.C13];
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
  const CRIM = { value: col('#ffd58a', .9) }, WINK = { value: 1 };   // the gold edge on the city's sunward rims
  const GU = { uShK: { value: 0 }, uShD: { value: 0 }, uShO: { value: new THREE.Vector2() }, uShDir: { value: new THREE.Vector2(0, -1) }, uSunG: { value: V(0, .05, -1) }, uSheen: { value: .2 }, uRd: { value: RD.map(([x, z]) => new THREE.Vector2(x, z)) } };
  const groundM = key => { const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(.44, .36, .25), roughness: 1 });
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, GU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform vec3 uSunG; uniform float uSheen, uShK, uShD; uniform vec2 uShO, uShDir; uniform vec2 uRd[${RD.length}];\n` + hashGLSL + `
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
            { float dd = dot(vWP.xz - uShO, uShDir); float sh = uShK * smoothstep(uShD - 2.5, uShD + 2.5, dd + (fb(vWP.xz * .07) - .5) * 6.); c *= mix(1., .45, sh); c = mix(c, c * vec3(.86, .8, 1.12), sh * .6); }
            diffuseColor.rgb = c; }`); };
    m.customProgramCacheKey = () => 'jw-ground-' + key; return m; };
  const terrain = (cx, cz, size, seg, key, dy = 0) => { const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + cx, z = p.getZ(i) + cz; p.setY(i, hT(x, z)); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, groundM(key)); m.position.set(cx, dy, cz); m.receiveShadow = true; S.add(m); return m; };
  const TFAR = terrain(0, -500, 3600, 360, 'far');                        // 10 m cells
  const TNEAR = terrain(20, -70, 380, 380, 'near', .03);                   // 1 m round the road where the crowd walks
  const S4C = { x: -205, z: -640 };                          // the lower city patch the S4 camera looks down on
  const HILLS = [];
  // far hills beyond the city to the west (and the Mount's shoulders behind the camera in S1)
  { const hm = new THREE.MeshStandardMaterial({ color: '#9a7e6c', roughness: 1 });
    for (let i = 0; i < 11; i++) { const g = new THREE.SphereGeometry(1, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), r = rng(31 + i), pos = g.attributes.position;
      for (let k = 0; k < pos.count; k++) pos.setY(k, pos.getY(k) * (1 + .22 * noise1(pos.getX(k) * 3 + i, i)));
      g.computeVertexNormals(); const m = new THREE.Mesh(g, hm); m.scale.set(260 + r() * 260, 50 + r() * 45, 160 + r() * 120); m.position.set((i - 5) * 330 + r() * 120, -20, -2000 - r() * 500); S.add(m); HILLS.push({ x: m.position.x, z: m.position.z, sx: m.scale.x, sy: m.scale.y * 1.1, sz: m.scale.z }); } }

  // ---------------------------------------------------------------- the city (olivet3d.js wallM + the Temple's layout, copied and re-placed)
  const nCity0 = S.children.length, PLATREF = {}, CAP = {}, RIMSEG = [];   // CAP: index ranges of the city parts the ruin pulls down
  const wallM = (base, key, { win = 0 } = {}) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .92 });
    m.onBeforeCompile = sh => { sh.uniforms.uCSun = RIMU.uSunV; sh.uniforms.uCRim = CRIM; sh.uniforms.uWin = WINK;
      sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n { vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 4.); totalEmissiveRadiance += uCRim * fr * smoothstep(.15, .75, dot(normal, uCSun)); }').replace('#include <common>', '#include <common>\nuniform vec3 uCSun, uCRim; uniform float uWin;');
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
              c *= 1. - hole * .72 * uWin; }` : ''}
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
  CAP.w0 = S.children.length;
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
  CAP.w1 = S.children.length;
  // the Temple Mount: platform, Solomon's Porch along the east edge facing us, the Royal Stoa south, the courts, the sanctuary facing east
  const ALTAR = V(20, TMB.top + 4, -540);
  { const { x0, x1, z0, z1, top } = TMB, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, base = -60;
    PLATREF.v = box(x1 - x0, top - base, z1 - z0, cx, cz, M.stone, { y: base }); CAP.t0 = S.children.length;
    box(26, 20, z1 - z0 - 10, x0 + 13, cz, M.pale, { y: top }); box(20, 7, z1 - z0 - 14, x0 + 25.6, cz, M.dark, { y: top + 2, cast: false });
    box(x1 - x0 - 30, 1.6, 14, cx + 6, z1 - 9, M.pale, { y: top + 11 }); box(x1 - x0 - 32, 10.5, 9, cx + 6, z1 - 10, M.shade, { y: top, cast: false });
    for (let i = 0; i < 26; i++) box(1.2, 10.6, 1.2, x0 + 22 + i * ((x1 - x0 - 34) / 25), z1 - 4.6, M.pale, { y: top });
    box(14, 1.6, z1 - z0 - 40, x1 - 8, cz, M.pale, { y: top + 10 });
    const tx = cx + 10;
    for (const [w, d, x, z] of [[104, 4, tx, -520], [104, 4, tx, -660], [4, 140, tx - 52, -590], [4, 140, tx + 52, -590]]) box(w, 13, d, x, z, M.pale, { y: top });
    box(30, 40, 64, tx, -612, M.pale, { y: top });                 // the sanctuary
    box(46, 38, 12, tx, -575, M.stone, { y: top });                // the porch, facing east (toward the Mount) … (test cut: a darker face, pale columns on it)
    box(60, 14, 12, tx, -575, M.pale, { y: top + 38 });            // … wider above, as Herod's porch was
    box(61, 1.3, 12.8, tx, -575, M.stone2, { y: top + 37.4 });
    box(13, 33, .6, tx, -568.7, M.dark, { y: top + 2, cast: false });   // its open doorway, tall and dark
    for (const s of [-20.5, -15, -9.5, 9.5, 15, 20.5]) { box(2.2, 35, 1.6, tx + s, -568.4, M.pale, { y: top + 1 }); box(3.2, 1.4, 2.2, tx + s, -568.3, M.gold, { y: top + 35.6, cast: false }); }
    // the backlight's thin gold rim (test brief: cornice and roof edge), in 2 m pieces so N136 can withdraw it up the edge (RIMSEG)
    { const rM = k => new THREE.MeshBasicMaterial({ color: col('#ffc878', k) }), top1 = rM(.85), edge = rM(.5), low = rM(.28);
      const seg = (w, h, d, x, y, z, m) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); S.add(o); RIMSEG.push({ m: o, y: y + h / 2 }); };
      for (let i = 0; i < 30; i++) seg(2.06, .32, .3, tx - 30 + 1.03 + i * 2.06 - .03, top + 53.1, -568.5, top1);   // the cornice: the brightest line
      for (let i = 0; i < 30; i++) if (Math.abs(i - 14.5) > 11) seg(2.06, .25, .3, tx - 30 + 1.03 + i * 2.06 - .03, top + 38.3, -568.5, edge);   // the wings' ledge
      for (const sd of [-1, 1]) { for (let y = top + 38.4; y < top + 53; y += 2) seg(.28, 2, .3, tx + sd * 30.15, y + 1, -568.6, edge);   // upper outer edges
        for (let y = top; y < top + 38; y += 2) seg(.25, 2, .3, tx + sd * 23.15, y + 1, -568.6, low); } }          // lower outer edges, faint
    box(61, 1.0, 12.6, tx, -575, M.gold, { y: top + 52 }); box(31, .8, 64.4, tx, -612, M.gold, { y: top + 40 });
    for (let i = 0; i < 9; i++) box(.5, 1.8, .5, tx - 28 + i * 7, -575, M.gold, { y: top + 53, cast: false });
    box(9, 4, 9, ALTAR.x, ALTAR.z, M.stone2, { y: top });
    CAP.t1 = S.children.length;
    // fix 2 (no plain box faces): pilasters along the upper courses of the east retaining wall, a dark band of shade under the porch roof
    for (let i = 0; i < 46; i++) box(1.3, 9, .8, x0 + 4 + i * ((x1 - x0 - 8) / 45), z1 + .3, M.stone2, { y: top - 9.5 });
    box(x1 - x0, 1.2, 1.4, cx, z1 + .5, M.stone2, { y: top - .6 }); }
  // the Antonia at the platform's north-west corner; Herod's towers in the west
  CAP.a0 = S.children.length;
  { const ax = 178, az = -700; box(56, 26, 42, ax, az, M.stone, { y: TMB.top - 6 });
    for (const [dx, dz, h] of [[-26, 19, 50], [26, 19, 38], [-26, -19, 38], [26, -19, 38]]) { box(13, h, 13, ax + dx, az + dz, M.stone2, { y: TMB.top - 6 }); box(14.6, 1.4, 14.6, ax + dx, az + dz, M.stone, { y: TMB.top - 6 + h }); } }
  for (const [x, z, h] of [[-40, -1290, 42], [-70, -1285, 36], [-100, -1280, 32]]) { box(13, h, 13, x, z, M.stone); box(14.6, 1.4, 14.6, x, z, M.stone2, { y: hT(x, z) + h }); }
  CAP.a1 = S.children.length;
  // the houses: a grid of blocks with streets between (streets at x = GX0 + i·PX, z = CITYZ − 2 − j·PZ, 4 m wide), lots of flat-roofed houses
  const PX = 26, PZ = 23, GX0 = -416, SW = 4.2;
  const streetX = i => GX0 + i * PX, streetZ = j => CITYZ - 6 - j * PZ;
  const HOUSES = [];
  CAP.h0 = S.children.length;
  { const r = rng(808), A = [[], []], C = [[], []], up = [], par = [], m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
    for (let i = 0; i < 30; i++) for (let j = 0; j < 38; j++) {
      const bx0 = streetX(i) + SW / 2, bx1 = streetX(i + 1) - SW / 2, bz0 = streetZ(j) - SW / 2, bz1 = streetZ(j + 1) + SW / 2;
      const nx = r() < .5 ? 2 : 3, nz = 2;
      for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) {
        const lx0 = lerp(bx0, bx1, a / nx), lx1 = lerp(bx0, bx1, (a + 1) / nx), lz0 = lerp(bz0, bz1, b / nz), lz1 = lerp(bz0, bz1, (b + 1) / nz);
        const x = (lx0 + lx1) / 2 + (r() - .5) * 3.2, z = (lz0 + lz1) / 2 + (r() - .5) * 3.2; if (r() < .14) { r(); r(); r(); continue; }   // test cut: broken rows, gaps
        if (!inPoly(x, z, CITY) || z > CITYZ - 6) { r(); r(); r(); continue; }
        if (x > TMB.x0 - 8 && x < TMB.x1 + 8 && z < TMB.z1 + 8 && z > TMB.z0 - 8) { r(); r(); r(); continue; }
        if (Math.hypot(x - 178, z + 700) < 45) { r(); r(); r(); continue; }
        const w = Math.abs(lx1 - lx0) - .3 - r() * 1.2, d = Math.abs(lz1 - lz0) - .3 - r() * 1.2, h = 3.2 + r() * r() * 8.5 + (r() < .1 ? 4.5 : 0), y = hT(x, z) - 1.2, k = r() < .62 ? 0 : 1; q4.setFromAxisAngle(V(0, 1, 0), (r() - .5) * .5);
        A[k].push(m4.compose(V(x, y + h / 2, z), q4, V(w, h, d)).clone()); const bb = .7 + r() * .4; C[k].push(new THREE.Color(bb, bb * (.95 + r() * .06), bb * (.88 + r() * .1)));
        HOUSES.push({ x, z, w, d, top: y + h });
        if (r() < .28) { const uw = w * (.35 + r() * .2), ud = d * (.35 + r() * .2); up.push(m4.compose(V(x + (r() - .5) * w * .3, y + h + 1.5, z + (r() - .5) * d * .3), q4, V(uw, 3.0, ud)).clone()); }
        if (r() < .6) par.push(m4.compose(V(x, y + h + .3, z), q4, V(w + .25, .6, d + .25)).clone()); } }
    const hg = new THREE.BoxGeometry(1, 1, 1);
    A.forEach((L, k) => { const inst = new THREE.InstancedMesh(hg, k ? M.house2 : M.house, L.length); L.forEach((mm, i) => { inst.setMatrixAt(i, mm); inst.setColorAt(i, C[k][i]); }); inst.castShadow = inst.receiveShadow = true; S.add(inst); });
    for (const [L, m] of [[up, M.house], [par, M.stone2]]) { const inst = new THREE.InstancedMesh(hg, m, L.length); L.forEach((mm, i) => inst.setMatrixAt(i, mm)); inst.castShadow = inst.receiveShadow = true; S.add(inst); } }
  CAP.h1 = S.children.length;
  const CITYHIDE = S.children.slice(nCity0).filter(o => o !== PLATREF.v);
  // ---------------------------------------------------------------- olive trees, rocks, tufts on the Mount and in the valley
  const leafM = K.std('#5e6648', { roughness: .9 }), trunkM = K.std('#3e3226', { roughness: .95 });
  { const r = rng(4242), pts = [];
    for (let n = 0; n < 6000 && pts.length < 520; n++) { const x = (r() - .5) * 900, z = 150 - r() * 560; if (z < -400) continue;
      const rn = roadNear(x, z); if (rn.d < 8) continue; if (z > -35 && z < 125 && Math.abs(x - 18) < 32) continue; if (z < -35 && z > -345 && Math.abs(x - 12) < 170) continue; const dens = .25 + .75 * ss(-200, -330, z) + .3 * ss(90, 40, z); if (r() > dens) continue; pts.push([x, z, 4.5 + r() * 2.5]); }
    const tg = new THREE.CylinderGeometry(.2, .32, 1, 6); tg.translate(0, .5, 0); const cg = new THREE.IcosahedronGeometry(1, 1);
    const ti = new THREE.InstancedMesh(tg, trunkM, pts.length), ci = new THREE.InstancedMesh(cg, leafM, pts.length * 7), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    pts.forEach(([x, z, h], i) => { const y = hT(x, z) - .1; ti.setMatrixAt(i, m4.compose(V(x, y, z), q.setFromEuler(new THREE.Euler((r() - .5) * .25, 0, (r() - .5) * .25)), V(1, h * .45, 1)));
      for (let k = 0; k < 7; k++) { const a = r() * 6.283, rr = r() * h * .32; ci.setMatrixAt(i * 7 + k, m4.compose(V(x + Math.cos(a) * rr, y + h * (.52 + r() * .3), z + Math.sin(a) * rr), q.setFromEuler(new THREE.Euler(r(), r() * 3, r())), V(1.1, .7, 1).multiplyScalar(.8 + r() * .9)));
        c.setHSL(.2 + r() * .05, .14 + r() * .08, .33 + r() * .08); ci.setColorAt(i * 7 + k, c); } });
    ti.castShadow = ci.castShadow = true; ti.receiveShadow = ci.receiveShadow = true; S.add(ti, ci); }
  { const r = rng(919), n = 1400, g = new THREE.IcosahedronGeometry(1, 1), pp = g.attributes.position; for (let k = 0; k < pp.count; k++) { const f = 1 + .3 * Math.sin(pp.getX(k) * 5 + pp.getZ(k) * 3); pp.setXYZ(k, pp.getX(k) * f, Math.max(-.2, pp.getY(k)) * f, pp.getZ(k) * f); } g.computeVertexNormals();
    const inst = new THREE.InstancedMesh(g, K.std('#8a7a62', { roughness: 1 }), n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    for (let i = 0; i < n; i++) { let x, z; do { x = (r() - .5) * 500; z = 160 - r() * 200; } while (roadNear(x, z).d < 4.5 || Math.abs(x - 12) < 110);
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
  const rimSun = (m, key, k = 1) => { const rs = { value: k }; m.userData.rimS = rs; m.onBeforeCompile = sh => { Object.assign(sh.uniforms, RIMU); sh.uniforms.uRimS = rs;
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
    mk(L([[.19, -.035], [.172, .03], [.152, .11], [.143, .185]], Math.PI + 1.0, Math.PI * 2 - 2.0), clothMat);
    { const sh = U.shoulders.children[0], ym = new THREE.Mesh(new THREE.CapsuleGeometry(.075 * s, .36 * s * (U.arms[1].S.x / (.235 * s)), 4, 10), sh ? sh.material : clothMat); ym.rotation.z = Math.PI / 2; ym.position.y = U.torsoH - .035 * s; ym.castShadow = ym.receiveShadow = true; if (!child0(g)) U.upper.add(ym); }
    return g; };
  const child0 = g => g.userData.s < .8;
  const mkMan = (r, o = {}) => { const head = r() < .75 || o.head === 'cloth' ? 'cloth' : 'bare'; delete o.head;
    const g = P.robeMan({ h: 1.66 + r() * .18, broad: 1.04 + r() * .14, head: 'cloth', mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0], face: faceM, ...o });
    P.headwear(g, head, { mat: mantles[(r() * mantles.length) | 0] }); if (head === 'cloth') tidyCloth(g); g.userData.kind = 'man'; return g; };
  const mkWoman = r => { const g = P.robeMan({ h: 1.5 + r() * .12, broad: .86 + r() * .08, head: 'veil', mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0], face: faceM }); g.userData.kind = 'woman'; return g; };
  const mkChild = r => { const hc = true || r() < .6, g = P.robeMan({ h: 1.0 + r() * .3, child: true, broad: .9, head: hc ? 'cloth' : 'veil', mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0], face: faceM }); if (hc) tidyCloth(g); g.userData.kind = 'child'; return g; };
  // HIM: the same clothes as the other men (oatmeal robe, grey-brown head cloth tied with a band), broad level shoulders
  // test brief §B: rim only on the head cloth and shoulders — a rim on world-UP-facing normals above the shoulder line (the level top of the
  // tied cloth, the shoulder line), never round the head's outline (no halo); the robe below is opaque, no rim.
  const JRIM = { uY0: { value: 0 }, uRimJ: { value: 1 } };
  const rimTop = (m, key) => { m.onBeforeCompile = sh => { Object.assign(sh.uniforms, RIMU, JRIM);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vJW; varying vec3 vJN;').replace('#include <project_vertex>', '#include <project_vertex>\nvJW = (modelMatrix * vec4(transformed, 1.)).xyz; vJN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunV, uRimC; uniform float uRimK, uY0, uRimJ; varying vec3 vJW; varying vec3 vJN;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 2.4);
            float top = smoothstep(.3, .75, normalize(vJN).y) * smoothstep(uY0, uY0 + .05, vJW.y);
            totalEmissiveRadiance += uRimC * fr * fr * smoothstep(-.3, .4, dot(normal, uSunV)) * uRimK * uRimJ * top; }`); };
    m.customProgramCacheKey = () => 'jw-rimtop-' + key; return m; };
  const jRobe = K.std('#6e604c', { roughness: .95, side: THREE.DoubleSide }), jCloth = rimTop(K.std('#7a6c5a', { roughness: .95, side: THREE.DoubleSide }), 'jc');
  const J = P.robeMan({ h: 1.78, broad: 1.18, head: 'cloth', mat: jRobe, cloth: jCloth, face: faceM }); P.headwear(J, 'cloth'); S.add(J);
tidyCloth(J);   // the tied head cloth (fix 2)
  const JTg = 1.15, JV = 1.0, JL = JV * JTg / 2;                    // his stride: one step per half stride at 1 m/s
  const S_STOP = roadNear(10, -15).s, J_U = 2.0;   // test cut: 25 m back from fix 1, on the level shoulder (the brow above his shoulder in JB)                     // where he stops (arclength along the road; lateral offset)
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
  const CROWD = [], CV = 1.35;   // test cut: a brisk procession, so the river visibly flows on past his still shadow
  let T = null;
  { const r = rng(4101), lanes = [-2.5, -1.7, -.9, -.1, .7, 1.5, 2.3, 3.1, 3.9];
    // the crowd stretches from 150 m behind his stop point to 70 m ahead (in s at the block's start)
    for (let s = S_STOP - 160; s < S_STOP + 75; ) { const core = s > S_STOP - 48 && s < S_STOP + 40; s += core ? 1.15 + r() * .4 : 2.3 + r() * .8;
     for (const u0 of lanes) {
      if (r() < (core ? .42 : .56)) continue;   // test cut: a dense river round his still shadow
      const u = u0 + (r() - .5) * .45, rel = s - (S_STOP - 7.5);           // relative to his own s at the block start (he is ≈7.5 m before his stop)
      if (Math.abs(u - J_U) < .9 && rel < 1.6 && rel > -46) continue;   // the lane behind him stays clear (the long lens sees him through it)
      if (Math.abs(u - J_U) < .8 && rel > -1.2 && rel < 1.6) continue;
      const kk = r(), g = kk < .12 ? mkChild(r) : mkMan(r, { head: 'cloth' }); S.add(g);
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
      const kk = r(), g = kk < .15 ? mkChild(r) : mkMan(r, { head: 'cloth' }); S.add(g);
      g.position.set(p.x, p.y, p.z); g.rotation.y = face(-p.tz * -sd, p.tx * -sd) + (r() - .5) * .8;   // facing the road
      const U = g.userData; U.sRoad = s; U.ph = r(); U.act = r() < .55 ? 'palm' : 'cheer'; U.wph = r() * 6.283; U.wT = 1.1 + r() * .4; U.wA = .12 + r() * .08;
      if (U.act === 'palm') { const pm = new THREE.Mesh(palmGeo, palmM); pm.castShadow = true; pm.scale.setScalar(U.kind === 'child' ? .7 : 1); S.add(pm); U.palm = pm; U.side = 1; }
      SIDE.push(g); } }
  // cloaks spread on the road (Luke 19:36) — flat cloths laid on the ground, following it
  const CLOAKS = [];
  { const r = rng(6006), cols = ['#8e3b2e', '#3b4f6b', '#a58f6f', '#b7893f', '#8e3b2e', '#a58f6f'];
    for (let i = 0; i < 30; i++) { const s = S_STOP - 60 + r() * 90, u = (r() - .5) * 4.2, c = posOn(s, u), a = r() * 6.283, w = 1.3 + r() * .5, d = .9 + r() * .4;
      const g = new THREE.PlaneGeometry(w, d, 8, 6); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
      for (let k = 0; k < p.count; k++) { const lx = p.getX(k), lz = p.getZ(k), x = c.x + lx * Math.cos(a) - lz * Math.sin(a), z = c.z + lx * Math.sin(a) + lz * Math.cos(a);
        p.setXYZ(k, x, hT(x, z) + .025 + .025 * Math.sin(lx * 7 + i) * Math.sin(lz * 5 + i), z); }
      g.computeVertexNormals(); const m = new THREE.Mesh(g, K.std(cols[i % cols.length], { roughness: .95, side: THREE.DoubleSide })); m.receiveShadow = true; S.add(m); CLOAKS.push(m); } }

  // the crowd's clock: 1× until the drain, then down to 0.3× (an integral of a smoothstep — no step in speed); after S3 it stays 0.3×
  const crowdTau = t => t;   // test brief §B: the others flow on at one pace while his shadow stops
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
    if (shot === 'J7') {   // he sets off down the road toward the gate: the gait eases in over 1.2 s (a time-warp), then walks on at 0.9 m/s
      const a = T.walk6, e = 1.2, u = (t - a) / e, tau = t <= a ? 0 : u < 1 ? e * rampI(u) : e * .5 + (t - a - e), L = 1.1 * JTg / 2;
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
    P.pose(J, { feet: stance, bob: lerp(-.02 * s, -.006, ss(0, 1, k)) - .1 * s * drop, lean: lerp(-.06, -.03, k) - .24 * bow - .12 * drop, side: 0, twist: 0,
      breath: lerp(.5 + .5 * Math.sin(t * 1.45 + 1.9), 1, inh) * (1 - drop) + .05 * drop, head: [-.03 - .72 * bow, 0], swing: [.02 * (1 - k) + .04 * drop, -.02 * (1 - k) + .04 * drop], abd: [.05, .05] });
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
  const LAMPS = []; { const r = rng(3131); for (const h of HOUSES) { if (r() > .05) continue; LAMPS.push({ p: V(h.x + (r() - .5) * h.w * .5, h.top - 1.6 - r() * 1.5, h.z + h.d / 2 + .05), k: .6 + r() * .6, t: r(), rank: 0 }); }
    { const ord = LAMPS.map((L, i) => [L.p.z > -1000 && Math.abs(L.p.x - 20) < 330 ? r() : 2 + r(), i]).sort((a, b) => a[0] - b[0]); ord.forEach(([, i], n) => { LAMPS[i].rank = n < 32 ? n : 1e9; }); }
    for (const sd of [-1, 1]) LAMPS.push({ p: V(GATE.x + sd * 7.5, hT(GATE.x, GATE.z) + (sd > 0 ? 6.0 : 4.5), GATE.z + 5.4), k: 1, t: 0, gate: true, sd }); }
  const J4L = LAMPS.map((L, i) => [L, i]).filter(([L]) => !L.gate && L.p.x > -150 && L.p.x < 200 && L.p.z < -470 && L.p.z > -820).slice(0, 4).map(([, i]) => i);
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
  function birdsAt(t, on, C = null, sc = 2.4) { for (const g of BIRDS) { g.visible = on; if (!on) continue; g.scale.setScalar(sc); const U = g.userData, a = U.ph + U.w * t, cx = C ? C.x + (U.cx - TEMPLE.x) * .6 : U.cx, cz = C ? C.z + (U.cz - TEMPLE.z) * .6 : U.cz, cy = C ? C.y + (U.h - 58) * .5 : U.h;
      g.position.set(cx + Math.cos(a) * U.r * (C ? .55 : 1), cy + 6 * Math.sin(t * .4 + U.ph), cz + Math.sin(a) * U.r * (C ? .55 : 1)); g.rotation.set(0, -a + (U.w > 0 ? 0 : Math.PI), 0);
      const f = Math.sin(t * U.fl + U.ph) * .6; U.w0.rotation.z = f; U.w1.rotation.z = -f; } }

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
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  GU.uShO.value.set(JSTOP.x, JSTOP.z); GU.uShDir.value.set(DIRC.x, DIRC.z);
  // ==== director's approach 1 「그분이 보신 성」 (rounds/r10-pilot/director3-plan.md §A2 + E1; batch3-director.md, owner 2026-11-26) ====
  // People are cast shadows, far backlit silhouettes under 8 % of the frame, or defocused backlit masses — never mid-distance bodies.
  const RIGHT = V(-DIRC.z, 0, DIRC.x);
  const rotY = (v, deg) => v.clone().applyAxisAngle(V(0, 1, 0), deg * D2R);   // + = to the left
  const lookFrom = (pos, dirH, pitchDeg, dist = 400) => pos.clone().add(V(dirH.x * Math.cos(pitchDeg * D2R), Math.sin(pitchDeg * D2R), dirH.z * Math.cos(pitchDeg * D2R)).multiplyScalar(dist));
  const jAlong = () => (J.position.x - JSTOP.x) * DIRC.x + (J.position.z - JSTOP.z) * DIRC.z;   // how far he has walked toward the city
  const setRimJ = k => { for (const m of [jRobe, jCloth]) if (m.userData.rimS) m.userData.rimS.value = 1.15 * k; };
  // crowd: near the lens a body is drawn into the shadow map only (layer 3), far it is a defocused backlit mass (layer 0)
  const meshesOf = g => g.userData.meshes || (g.userData.meshes = (() => { const a = []; g.traverse(o => { if (o.isMesh) a.push(o); }); if (g.userData.palm) a.push(g.userData.palm); return a; })());
  // shadow-only (the pentecost3d method that works, its line 221): an invisible material — no colour, no depth — so the lens sees nothing,
  // while the sun's shadow pass (its own depth material) still draws the body. (three r170 tests the MAIN camera's layers in the shadow pass,
  // so a layer-3 body never reaches the shadow map.)
  const INVIS = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
  const shadowOnly = (g, on) => { for (const m of meshesOf(g)) { if (on) { if (m.material !== INVIS) { m.userData.mat0 = m.material; m.material = INVIS; } } else if (m.userData.mat0) { m.material = m.userData.mat0; m.userData.mat0 = null; } } };
  const allFigs = () => [...CROWD, ...SIDE];
  const resetLayers = () => { for (const g of [...allFigs(), J]) if (g.userData.meshes && g.userData.meshes.some(m => m.material === INVIS)) shadowOnly(g, false); };
  const lerp3 = (A, B, k) => A.clone().lerp(B, clamp(k));
  const sunAt = (h, e) => V(h.x * Math.cos(e * D2R), Math.sin(e * D2R), h.z * Math.cos(e * D2R)).normalize();
  const ATM0 = film.atmos.color.clone(), ATMU0 = film.atmos.colorUp.clone();

  // ---------------------------------------------------------------- JA: the procession's head far down the road (4–8 px dots, cheap instances)
  const FAR = (() => { const r = rng(9191), pts = [];
    for (let s = S_STOP + 92; s < ROADLEN - 6; s += .9 + r() * 1.5) for (const u0 of [-2, -.7, .6, 1.9]) { if (r() < .45) continue; pts.push({ s, u: u0 + (r() - .5) * .5, h: 1.55 + r() * .25, ph: r() * 6.283 }); }
    const geo = K.mergeGeometries([[new THREE.CylinderGeometry(.16, .3, .86, 7).translate(0, .43, 0), new THREE.Matrix4()], [new THREE.SphereGeometry(.12, 8, 6), new THREE.Matrix4().makeTranslation(0, .93, 0)]]);
    const m = new THREE.InstancedMesh(geo, K.std('#2a2026', { roughness: 1 }), pts.length); m.castShadow = false; m.receiveShadow = false; m.frustumCulled = false; S.add(m);
    return { m, pts }; })();
  const m4f = new THREE.Matrix4(), qf = new THREE.Quaternion(), sf = V(), pf = V();
  function farAt(t, on) { FAR.m.visible = on; if (!on) return;
    FAR.pts.forEach((q, i) => { const s = q.s + CV * (t - T.t0); if (s > ROADLEN - 3) { FAR.m.setMatrixAt(i, m4f.makeScale(0, 0, 0)); return; }
      const p = posOn(s, q.u); FAR.m.setMatrixAt(i, m4f.compose(pf.set(p.x, p.y + .035 * Math.abs(Math.sin(t * 5.6 + q.ph)), p.z), qf.identity(), sf.set(1, q.h, 1))); });
    FAR.m.instanceMatrix.needsUpdate = true; }

  // ---------------------------------------------------------------- Q108b: the ruin in the SAME scene graph (same camera, the sun off)
  const TEMPLEPARTS = S.children.slice(CAP.t0, CAP.t1), WALLPARTS = S.children.slice(CAP.w0, CAP.w1), TOWERS = S.children.slice(CAP.a0, CAP.a1), HOUSEM = S.children.slice(CAP.h0, CAP.h1);
  const RUINSET = [], TX = (TMB.x0 + TMB.x1) / 2 + 10;
  { const r = rng(4444);
    for (const o of [...WALLPARTS, ...TOWERS]) { if (!o.isMesh) continue;
      if (o.isInstancedMesh || o.geometry.type !== 'BoxGeometry') { o.userData.rz = { hide: true }; continue; }
      const h = o.geometry.parameters.height; o.userData.rz = { hide: r() < .2, sy: .2 + r() * .45, y0: o.position.y, base: o.position.y - h / 2, h }; }
    const top = TMB.top, sg = new THREE.IcosahedronGeometry(1, 0), n = 340, heap = new THREE.InstancedMesh(sg, M.stone2, n), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()), x = TX + Math.cos(a) * rr * 50, z = -600 + Math.sin(a) * rr * 44, hy = 15 * Math.pow(1 - rr * rr, .8), sz = 2 + r() * 4.5;
      q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)); heap.setMatrixAt(i, mm.compose(V(x, top + hy * (.55 + .45 * r()), z), q, V(sz, sz * (.5 + .4 * r()), sz * (.7 + .5 * r())))); c.setHSL(.08, .04, .14 + r() * .12); heap.setColorAt(i, c); }
    heap.castShadow = heap.receiveShadow = true; S.add(heap); RUINSET.push(heap);
    for (const [dx, h, w] of [[-19, 24, 7], [-5, 10, 9], [16, 17, 6], [27, 7, 5]]) RUINSET.push(box(w, h, 9, TX + dx, -575, M.stone, { y: top + 4 }));   // three jagged stubs of the porch
    const hs = HOUSES.filter((h, i) => i % 3 === 0), stub = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.house2, hs.length);
    hs.forEach((h, i) => { const ht = .6 + r() * r() * 4.5, y = hT(h.x, h.z) - 1.2; q.setFromEuler(new THREE.Euler((r() - .5) * .3, r() * 3, (r() - .5) * .3)); stub.setMatrixAt(i, mm.compose(V(h.x + (r() - .5) * 4, y + ht / 2, h.z + (r() - .5) * 4), q, V(h.w * (.4 + .5 * r()), ht, h.d * (.4 + .5 * r())))); });
    { const cc = new THREE.Color(); for (let i = 0; i < hs.length; i++) { cc.setHSL(.07, .05, .18 + r() * .22); stub.setColorAt(i, cc); } }
    stub.castShadow = stub.receiveShadow = true; S.add(stub); RUINSET.push(stub);
    RUINSET.forEach(o => { o.visible = false; }); }
  const FARZ = -740, farHid = [];
  for (const o of HOUSEM) if (o.isInstancedMesh) { const a0 = o.instanceMatrix.array.slice(), a1 = a0.slice(); for (let i = 0; i < o.count; i++) if (a0[i * 16 + 14] < FARZ) for (let k = 0; k < 16; k++) a1[i * 16 + k] = 0; farHid.push({ o, a0, a1 }); }
  const farMesh = [...WALLPARTS, ...TOWERS].filter(o => o.isMesh && !o.isInstancedMesh && o.position.z < FARZ - 10);
  let farOn = null;
  function setFarCity(hide) { if (hide === farOn) return; farOn = hide; for (const f of farHid) { f.o.instanceMatrix.array.set(hide ? f.a1 : f.a0); f.o.instanceMatrix.needsUpdate = true; } for (const o of farMesh) o.visible = !hide; }
  let ruinOn = null;
  function setRuin(on) { if (on === ruinOn) return; ruinOn = on;
    for (const o of TEMPLEPARTS) o.visible = !on; for (const o of HOUSEM) o.visible = !on; for (const o of RUINSET) o.visible = on;
    for (const o of [...WALLPARTS, ...TOWERS]) { const z = o.userData.rz; if (!z) continue; if (z.hide) { o.visible = !on; continue; }
      o.scale.y = on ? z.sy : 1; o.position.y = on ? z.base + z.h * z.sy / 2 : z.y0; } }
  // three smoke columns over the ruin (dark, rising, leaning with the wind), each lit low from behind by its embers
  const RSRC = [V(TX - 6, TMB.top + 8, -596), V(TX - 62, hT(TX - 62, -690) + 2, -690), V(TX + 58, hT(TX + 58, -780) + 2, -780)];
  const NRS = 3 * 64, rsPos = new Float32Array(NRS * 3), rsSz = new Float32Array(NRS), rsA = new Float32Array(NRS);
  const rsU = { uPx: { value: 1000 }, uC: { value: col('#262220', 1) }, uE: { value: col('#a0502a', 1) } };
  const ruinSmoke = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(rsPos, 3)); g.setAttribute('aSz', new THREE.BufferAttribute(rsSz, 1)); g.setAttribute('aA', new THREE.BufferAttribute(rsA, 1));
    const m = new THREE.ShaderMaterial({ uniforms: rsU, transparent: true, depthWrite: false,
      vertexShader: `attribute float aSz, aA; uniform float uPx; varying float vA, vK; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(uPx * aSz / -mv.z, 1., 1000.); vA = abs(aA); vK = aA < 0. ? 1. : 0.; }`,
      fragmentShader: `uniform vec3 uC, uE; varying float vA, vK; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 7.) - .03; if (a <= 0.) discard; gl_FragColor = vec4(mix(uC, uE, vK * (.6 + .4 * smoothstep(.1, -.4, c.y))), a * vA); }` });
    const p = new THREE.Points(g, m); p.frustumCulled = false; p.visible = false; S.add(p); return p; })();
  function ruinSmokeAt(t) {
    RSRC.forEach((b, k) => { for (let i = 0; i < 64; i++) { const j = k * 64 + i, L = 14, age = ((t / L + i / 64 + k * .31) % 1) * L, kk = age / L, ember = i % 13 === 0;
      const lean = age * age * .14 * (1 + .3 * k);
      rsPos[j * 3] = b.x + RIGHT.x * lean + Math.sin(i * 2.1 + age * .5) * 3 * kk; rsPos[j * 3 + 1] = b.y + 10 * age * (1 - .25 * kk); rsPos[j * 3 + 2] = b.z + RIGHT.z * lean;
      rsSz[j] = (ember ? 13 : 9 + 30 * kk) * (k ? .8 : 1); rsA[j] = ember ? -(.6 * (1 - ss(0, .1, kk))) : .55 * ss(0, .04, kk) * (1 - ss(.15, .95, kk)); } });
    const g = ruinSmoke.geometry; g.attributes.position.needsUpdate = true; g.attributes.aSz.needsUpdate = true; g.attributes.aA.needsUpdate = true; }
  function ashSky() { SKY.top.value.copy(col('#b4b6b8', 2.1)); SKY.mid.value.copy(col('#cfd0d0', 2.5)); SKY.horizon.value.copy(col('#dcdcda', 2.7)); SKY.sunColor.value.setRGB(0, 0, 0); SKY.sunGlow.value.setRGB(0, 0, 0);
    SKY.clouds.value = .5; SKY.cloudColor.value.copy(col('#d0d0ce', 1.6)); SKY.cloudShade.value.copy(col('#8a8c8e', 1.1)); }

  // ---------------------------------------------------------------- J6: the Mount's summit east of the camera — a shadow-only ridge (layer 3)
  const RIDGE = { z: 420, y: 112 };
  const ridgeY = x => RIDGE.y + 13 * noise1(x * .005, 5) + 6 * noise1(x * .021, 9);
  const ridge = (() => { const g = new THREE.PlaneGeometry(2800, 240, 280, 1), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) - 400; p.setX(i, x); p.setY(i, p.getY(i) > 0 ? ridgeY(x) : -130); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, INVIS); m.position.z = RIDGE.z; m.castShadow = true; m.visible = false; S.add(m); return m; })();
  // where the shadow edge is (k 0 → 1): the near slope → the Kidron's floor → the wall's foot → its top → the roofs → the Temple's gold → over
  const EDGE = [[0, 18, null], [.06, -330, -70], [.28, -452, -32], [.42, -452, -14], [.68, -540, -4], [.9, -575, TMB.top + 54], [1, -575, TMB.top + 80]];
  const H6 = V(-.44, 0, .9).normalize();   // the sun's bearing: east-south-east, behind the camera's left shoulder
  function sunElev6(k) { let i = 1; while (i < EDGE.length - 1 && EDGE[i][0] < k) i++; const [ka, za, ya0] = EDGE[i - 1], [kb, zb, yb0] = EDGE[i], u = clamp((k - ka) / (kb - ka));
    const ya = ya0 ?? hT(J6P.x, za), yb = yb0 ?? hT(J6P.x, zb), z = lerp(za, zb, u), y = lerp(ya, yb, u);
    return Math.atan((RIDGE.y - y) * H6.z / (RIDGE.z - z)) / D2R; }
  const J6P = (() => { const p = V(25, 0, 35); p.y = hT(p.x, p.z) + 26; return p; })();

  // ---------------------------------------------------------------- the shots
  // JA · 「그림자의 강」 (N133 → N134b): only shadows. Every walker near and mid is drawn into the shadow map alone; the head of the procession
  //      far down the road is dots. The camera starts 30 m over the road looking down into the river of shadows (streaming back toward the
  //      lens from the low sun over the city) and cranes down along it to 1 m, slower than the walkers so the river keeps flowing away
  //      toward the city. His lane is clear behind him: his shadow is the one in the middle, and on 「그런데」 it stops.
  const DBG = QS.get('dbg') || '';
  const JA = { s0: S_STOP - 22, s1: S_STOP - 14.5 };
  STAGE.JA = t => {
    const [a, b] = T.crane, u = clamp((t - a) / (b - a)), e = sine(u), after = Math.max(0, t - b);
    jPose(t, 'JA'); crowdAt(t); setVis(SIDE, false); J.visible = true;
    if (!DBG.includes('body')) for (const g of [...CROWD, ...SIDE, J]) if (g.visible) shadowOnly(g, true);
    farAt(t, true);
    const s = lerp(JA.s0, JA.s1, .45 * u + .55 * e), p = posOn(s, J_U + lerp(-2.6, -.35, e));   // after landing the lens holds its place (his shadow still, theirs flowing)
    const pos = V(p.x, hT(p.x, p.z) + lerp(30, 1.0, e) + .12 * after, p.z);
    const look = lookFrom(pos, rotY(DIRC, lerp(5, 0, e)), lerp(-50, -7.5, e)); setFov(lerp(44, 40, e)); setCam(pos, look);
    const f = pos.clone().addScaledVector(DIRC, lerp(42, 46, e)); f.y = hT(f.x, f.z);
    setSun(sunAt(rotY(DIRC, -.8), 8.5), 8.5, f, 66, 5.2);
    SKY.sunColor.value.copy(col('#fff0cc', 16)); SKY.sunGlow.value.copy(col('#ffb070', 2.2)); hemi.intensity = .045; film.bloomCfg.strength = .2;
    film.dofCfg.focus = Math.max(8, pos.distanceTo(J.position)); film.dofCfg.aperture = .6;
    film.atmos.density = .0015; film.look.exposure = 1.0; film.look.contrast = 1.22; lamp.shimmer = .3 * e; lamp.god = .45;
    dustU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2); moteU.uA.value = .5 * e; moteU.uC.value.set(pos.x, pos.y, pos.z - 3);
    RIMU.uRimC.value.copy(col('#ffd58a', 2.0)); pastelP.u.violet.value = .2; pastelP.u.gild.value = 0;
  };
  // JB · his small back and the golden city (N134b → N135b). Long lens (9e9fa17f) from 90 m behind and 5 m up, so the city's base line sits
  //      above his shoulder and he stands against the hazy valley; push in + truck, easing to a hold on Q108b. Q108b is this camera, fixed,
  //      with setRuin(true); on 「보살핌 받는 날을」 a clean cut back to the golden frame (he is in it) and the push resumes.
  const JBD = [72, 54], JBX = [2.0, 6.0], JBH = [6.4, 4.6], JBYT = 400, JBXT = 620;   // the city and the sun sit below the Q108 label band   // a clear push (18 m) with a slight crane down: he grows 6 → 8 %, his place in the frame holds
  const inRuin = t => t >= T.ruin[0] && t < T.ruin[1];
  const jbK = t => { const a = T.cuts[1], h = T.hold, r1 = T.ruin[1], e1 = T.cuts[3];
    const v = .8 / (h - a - .25);   // k per second at full speed (a .6 s soft start: ∫ of a 1.2 s smoothstep ramp)
    if (t < h) { const x = t - a; return x < .5 ? v * .5 * rampI(x / .5) : v * (x - .25); }
    if (t < r1) return .8; return .8 + v * (t - r1); };
  const TTOP = V(TX, TMB.top + 53, -575);
  STAGE.JB = t => {
    const ru = inRuin(t); setRuin(ru);
    setVis(SIDE, false); setVis(CROWD, false); jPose(t, 'JB'); J.visible = !ru;
    const k = jbK(t), kd = Math.min(k, 1.1), d = lerp(JBD[0], JBD[1], kd), pos = V(JSTOP.x, 0, JSTOP.z).addScaledVector(DIRC, -d).addScaledVector(RIGHT, lerp(JBX[0], JBX[1], kd)); pos.y = hT(pos.x, pos.z) + lerp(JBH[0], JBH[1], kd);
    const fov = 26; setFov(fov);
    const hf = 2 * Math.atan(Math.tan(fov / 2 * D2R) * W / H) / D2R, dT = V(TTOP.x - pos.x, 0, TTOP.z - pos.z), dist = dT.length(); dT.normalize();
    const pitch = Math.atan2(TTOP.y - pos.y, dist) / D2R - (H / 2 - JBYT) / (H / 2) * fov / 2, dir = rotY(dT, (JBXT - W / 2) / (W / 2) * hf / 2);
    setCam(pos, lookFrom(pos, dir, pitch, 600));
    setSun(sunAt(rotY(dT, -3.4), 1.8), 4.5, V(JSTOP.x, JSTOP.y, JSTOP.z).addScaledVector(DIRC, -12), 40, 3.4);
    SKY.sunColor.value.copy(col('#fff4d8', 28)); SKY.sunGlow.value.copy(col('#ffb878', 3.4)); SKY.horizon.value.copy(col('#ffcc8c', 2.3)); SKY.mid.value.copy(col('#e8aa78', 1.25)); hemi.intensity = .03; goldM.emissiveIntensity = .5; sunLamp.power = 5200; film.bloomCfg.strength = .36;
    film.dofCfg.focus = pos.distanceTo(J.position); film.dofCfg.aperture = .5;
    film.atmos.density = .00065; film.look.exposure = 1.0; film.look.contrast = 1.38; lamp.shimmer = .15; lamp.god = .32;
    moteU.uA.value = .7; moteU.uC.value.set(pos.x, pos.y - 1, pos.z).addScaledVector(DIRC, 8); RIMU.uRimC.value.copy(col('#ffc070', 1.5)); JRIM.uY0.value = J.position.y + 1.36; pastelP.u.violet.value = .3; pastelP.u.gild.value = 0;
    if (ru) {   // the same frame, years later: no sun, an ash sky, flat grey light, smoke; nothing else moves
      ashSky(); sunL.intensity = 0; sunLamp.power = 0; hemi.intensity = .55; hemi.color.copy(col('#a4aab0')); hemi.groundColor.copy(col('#2a2a2c'));
      goldM.emissiveIntensity = 0; CRIM.value.setRGB(0, 0, 0); film.atmos.color.copy(col('#b8babc', 1.05)); film.atmos.colorUp.copy(col('#cdd0d2', 1.15)); film.atmos.density = .0009;
      film.look.exposure = 1.08; film.look.contrast = 1.55; film.look.saturation = .12; film.bloomCfg.strength = .07; lamp.god = 0; lamp.shimmer = 0; pastelP.u.violet.value = 0; moteU.uA.value = .45;   // ash and sparks drifting past the lens (the frame is fixed; the air is not)
      ruinSmoke.visible = true; ruinSmokeAt(t); rsU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2); }
  };
  STAGE.JN = t => STAGE.JB(t);   // placeholder for N135b (full scene later): the JB push simply goes on
  // J6 · 「산 그림자가 성을 덮다」 (N136): from high on the Mount (26 m over the slope) a locked long lens on the city across the Kidron. The sun is
  //      behind the camera's left shoulder and sinks behind the Mount's summit: its shadow edge comes out from under the lens, crosses the
  //      valley floor, climbs the wall, takes the roofs and last the Temple's gold. Only the sun's bearing and elevation move.
  const J6YT = 520;
  // the sun's elevation over N136 (s after N136 → degrees): the Temple top's shadow tops the brow ≈ 3.8°, reaches his feet ≈ 3.3°, the lens
  // ≈ 2.9°; below ≈ 2.6° the far hills take the Temple's foot and the rim climbs; the gold top goes out ≈ 1.1°
  const EL6 = [[0, 5.2], [1.4, 3.9], [4.6, 3.3], [6.2, 2.85], [8.1, 1.05], [12, .3]];
  const el6 = x => { let i = 1; while (i < EL6.length - 1 && EL6[i][0] < x) i++; const [a, ea] = EL6[i - 1], [b, eb] = EL6[i]; return lerp(ea, eb, sine(clamp((x - a) / (b - a)))); };
  STAGE.J6 = t => {
    setVis(SIDE, false); setVis(CROWD, false); jPose(t, 'J6'); J.visible = true;
    const fov = 28; setFov(fov);
    const pos = V(JSTOP.x, 0, JSTOP.z).addScaledVector(DIRC, -52).addScaledVector(RIGHT, 3.4); pos.y = hT(pos.x, pos.z) + 5.5;
    const hf = 2 * Math.atan(Math.tan(fov / 2 * D2R) * W / H) / D2R, dT = V(TTOP.x - pos.x, 0, TTOP.z - pos.z), dist = dT.length(); dT.normalize();
    const pitch = Math.atan2(TTOP.y - pos.y, dist) / D2R - (H / 2 - 360) / (H / 2) * fov / 2;
    setCam(pos, lookFrom(pos, rotY(dT, (620 - W / 2) / (W / 2) * hf / 2), pitch, 600));
    const x = t - T.cuts[3], el = el6(x), u = clamp(x / 8.1);
    // the sun stands straight behind the Temple as seen from where he stands, so the Temple's own shadow is the one that reaches him
    const sH = V(TTOP.x - JSTOP.x, 0, TTOP.z - JSTOP.z).normalize();
    setSun(sunAt(sH, el), el, V(JSTOP.x, -10, -280), 110, lerp(3.6, 2.4, u)); sunL.shadow.normalBias = .3; sunL.shadow.bias = -.001;
    sunL.color.copy(lerp3(col('#ffc890'), col('#ff9a58'), u));
    SKY.sunColor.value.copy(lerp3(col('#fff0cc', 22), col('#ffb070', 9), u)); SKY.sunGlow.value.copy(lerp3(col('#ffb070', 2.4), col('#ff8a50', 1.6), u));
    SKY.top.value.copy(lerp3(col('#6a6478', .5), col('#3a3040', .4), u)); SKY.mid.value.copy(lerp3(col('#d89a6c', .95), col('#a8684c', .8), u)); SKY.horizon.value.copy(lerp3(col('#ffb870', 1.35), col('#d8784a', .95), u));
    hemi.intensity = lerp(.08, .05, u); hemi.color.copy(col('#b89878')); hemi.groundColor.copy(col('#3a2a1e'));
    film.atmos.color.copy(lerp3(col('#d49c6c', .6), col('#a8643c', .5), u)); film.atmos.density = .0012; sunLamp.power = lerp(3600, 1800, u); film.bloomCfg.strength = .3;
    film.dofCfg.focus = pos.distanceTo(J.position); film.dofCfg.aperture = .5; film.look.exposure = .86; film.look.contrast = 1.22; lamp.shimmer = 0; lamp.god = .18;
    moteU.uA.value = .6; moteU.uC.value.set(pos.x, pos.y - 1, pos.z).addScaledVector(DIRC, 8);
    RIMU.uRimC.value.copy(col('#ffc070', 1.5)); JRIM.uY0.value = J.position.y + 1.36; JRIM.uRimJ.value = ss(3.2, 3.45, el);   // his rim goes out as the shadow takes him
    // the far hills' shadow climbs the Temple: the rim withdraws up its edges; the gold on top goes out last
    const rimY = lerp(TMB.top - 2, TMB.top + 56, ss(2.65, 1.05, el)); for (const q of RIMSEG) q.m.visible = q.y > rimY;
    goldM.emissiveIntensity = .55 * (1 - ss(TMB.top + 50, TMB.top + 55, rimY)); CRIM.value.copy(col('#ffd58a', .9 * (1 - ss(2.6, 1.6, el))));
    pastelP.u.violet.value = .1; pastelP.u.gild.value = .25 + .35 * u;
    if (T.names.indexOf('J7') > -1 && t >= T.cuts[4]) {   // J7 placeholder (full scene later): the same frame settles toward a dark gold
      const dk = ss(T.dark[0], T.dark[1], t); film.look.exposure = lerp(.86, .5, dk); pastelP.u.gild.value = .6 + .3 * dk; }
  };
  STAGE.J7 = t => STAGE.J6(t);

  function stage(t) {
    const nm = shotOf(t);
    skyGold(); WINK.value = 0; film.bloomCfg.strength = .08; for (const q of RIMSEG) q.m.visible = true; sunL.color.copy(col('#ffc890')); hemi.intensity = .55; hemi.color.copy(col('#b4a8b8')); hemi.groundColor.copy(col('#6e5236')); goldM.emissiveIntensity = .12; CRIM.value.copy(col('#ffd58a', .9));
    film.look.saturation = 1; film.look.contrast = 1; film.atmos.color.copy(ATM0); film.atmos.colorUp.copy(ATMU0); sunLamp.power = 2000; sunL.shadow.normalBias = .06; sunL.shadow.bias = -.0005;
    TFAR.castShadow = TNEAR.castShadow = false; ridge.visible = false; ruinSmoke.visible = false; lamps.visible = false; lampA.fill(0); lamps.geometry.attributes.aA.needsUpdate = true;
    gateLamps.forEach(g => { g.power = 0; }); smkU.uC.value.copy(col('#d8c4b0', 1)); JRIM.uRimJ.value = 1;
    resetLayers(); setFarCity(false); setRuin(false); farAt(t, false);
    for (const c of CLOAKS) c.visible = nm === 'JA';
    dust.visible = nm === 'JA'; TUFTS.visible = true; smoke.visible = nm === 'JB' || nm === 'JN'; motes.visible = nm === 'JA';
    film.dofCfg.maxCoc = 22; film.atmos.scatter = 1; STAGE[nm](t);
    birdsAt(t, (nm === 'JB' || nm === 'JN' || nm === 'J6') && !inRuin(t), null, 9); motes.visible = nm === 'JA' || nm === 'JB' || nm === 'J6'; if (inRuin(t)) smoke.visible = false;
    if (dust.visible) dustAt(t); smokeAt(t); smkU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2);
    tuftU.uT.value = t; moteU.uT.value = t; GU.uSunG.value.copy(SUN);
    RIMU.uSunV.value.copy(SUN).transformDirection(cam.matrixWorldInverse.copy(cam.matrixWorld).invert());
    return nm;
  }

  // ---- screen-space light scattering from the sun (crowd-evening3d.js godRays, copied)
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
    if (lamp.god > .01 && tmpV.z < 1) { const e = Math.max(Math.abs(tmpV.x), Math.abs(tmpV.y)), k = lamp.god * (1 - ss(.95, 1.55, e)); if (k > .004) godRays(ctx, (tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H, k); }
  }
  // ---------------------------------------------------------------- the checks (no render)
  function probe(t, TB) { T = TB; const nm = stage(t); const d = V(); cam.getWorldDirection(d);
    return { shot: nm, p: cam.position.toArray(), d: d.toArray(), fov: cam.fov, sunEl: Math.asin(SUN.y) / D2R, ruin: inRuin(t) ? 1 : 0 }; }
  // where things land in the frame (px) at t — for framing checks (J: top of the head cloth; Jfeet; the Temple's gold top; the sun)
  function proj(t, TB, pts) { T = TB; const nm = stage(t); S.updateMatrixWorld(true);
    const named = { J: J.position.clone().add(V(0, 1.78, 0)), Jsh: J.position.clone().add(V(0, 1.45, 0)), Jfeet: J.position.clone(), temple: TTOP.clone(), sun: cam.position.clone().addScaledVector(SUN, 900) };
    const out = { shot: nm }; for (const [k, p] of Object.entries(named)) { const q = p.clone().project(cam); out[k] = [Math.round((q.x + 1) / 2 * W), Math.round((1 - q.y) / 2 * H), +q.z.toFixed(3)]; }
    (pts || []).forEach((p, i) => { const q = V(...p).project(cam); out['p' + i] = [Math.round((q.x + 1) / 2 * W), Math.round((1 - q.y) / 2 * H)]; });
    return out; }
  S.updateMatrixWorld(true);
  return { film, draw, probe, proj, people: { J, CROWD, SIDE } };
}
