// jerusalem-weep3d.js — 「kingdom」 4부 「예루살렘을 보시고 우심」, the director's approach 1 「그분이 보신 성」 (rounds/r10-pilot/director3-plan.md §A2 + E1,
// batch3-director.md, owner 2026-11-26 "그래"): film 494.7 (N133) → 551.0 (C13), 56.3 s, with Q108b (눅 19:44, P-J1 가) after Q108.
//   N133 · N134 「예수님은 우셨습니다」 · L102/Q108 눅 19:42 · Q108b 눅 19:44 · N135b · N136 · N137. All times from script.json through beats().
// Why He weeps, in pictures: all eyes are on Him, His eyes are on the city (the look cut J2 → J4); the city's end (the ruin in a cloud's
// shadow, Luke 19:43–44); the doors close in front of Him (J5); and still He walks into that city, into its shadow (J7).
// Bodies: never a mid-distance body. People are cast shadows (J2), far backlit silhouettes under 8 % (J1, J6, J7), or defocused backlit
// masses (J2). He: back only, head yaw 0, no rim round the head (shoulders only), the sun ≥ 300 px from His head; men in a tied head
// cloth with a level top ending at the shoulder (tidyCloth), women veiled.
// Look: part 4's pastel sunset 3D (the pastel pass, fixed in frame) — sky #f2c48e → #f6dca8 round the sun, haze #d9a983, shadow violet,
// the city as backlit layers with a gold edge #ffd58a only on sunward rims (CRIM), lamps #ffb35c; the future city only in kit-charcoal
// (OPUSCAR 13 「레베카」) greys, no gold. Film refs: Simonet 「Flevit super illam」 (1892), Tissot's watercolours, 「노인을 위한 나라는
// 없다」 (Deakins: shadows toward the lens), 「아라비아의 로렌스」 (telephoto, a cloud's shadow over the land), 「수색자」 (the door),
// Malick's magic hour, Bresson (an object carries the feeling: the drop on the cloak).
// Shots (one slow named move each; hard cuts):
//   J1 N133a            the far procession, the golden city: long lens from high on the Mount, people 18–32 px, palms, dust, shimmer.   crane down
//   J2 N133b → L102     the lens 0.5 m over the road into the low sun: long shadows stream over the cloaks toward us (near people exist only
//                       in the shadow map); He is a defocused backlit mass left of centre; His shadow slows and stops (T.jStop, the script's
//                       beat N134), the head bows, the shoulders drop once; the crowd's clock runs down; the light stays warm. tracking → stop
//   J3 L102 → +1.2      macro: one drop falls on a madder wool cloak (0.4×), gold glint, a wet mark spreads along the weave.   push in, 3 %
//   J4 Q108 + Q108b     His eyes: the city across the valley (backlit layers, gold edge, swifts, the evening smoke, four lamps); on Q108b a
//                       cloud's shadow comes from the right and stays — inside it the city is a charcoal ruin (no porch, a heap where the
//                       Temple stood, broken walls, three smoke columns); at 「보살핌 받는 날을」 it moves on, the golden city is back. zoom in 1.6 %/s
//   J5 N135b            inside the city from the east rampart: distant shutters close one by one (their light → thin gold lines); on
//                       「그 성은 알아보지 못했습니다」 the near door closes from inside, the warm wedge on the street narrows and goes out.  truck
//   J6 N136             the sun touches the hills right of the Temple; His small back (≤ 6 %) lower left; the city's shadow climbs the
//                       slope toward Him; lamps one by one (1.75/s), the gate's two on the line's second half.                 crane up
//   J7 N137             the lens 1.2 m over the road 25 m behind; He walks the whole shot (8 % → < 4 %), into the shadow's edge on the
//                       line's second half (His rim goes out with it); lamps on; the last 2 s sink to a calm dark gold.   crane up, not following
//
// Sound cue table (film seconds; for the sound stage — director3-plan.md E4 mapped to the new times):
//   494.7–498.8  a great crowd far off, 「호산나」 in waves (unintelligible), wind on the slope
//   498.8        close: the crowd, sandals, feet on cloaks, palm fronds sweeping L→R, one child's shout
//   ≈500.8, 502.0  His two slowing steps (the second a little heavier)
//   502.3–504.2  the crowd low-passed and pulled down −20 dB — a long exhale of sound
//   504.15       one breath, close (no sob)
//   505.95       the drop: a tiny 'tok' into wool; otherwise near silence and wind
//   506.8–515.2  wind, swifts far off, the Temple's evening trumpet ≈510.2
//   515.5–518.1  the cloud comes: every sound of the city drains, one low string harmonic held
//   ≈520.4–523.3 the cloud leaves on 「보살핌 받는 날을」: the swifts come back
//   525.2–527.8  five distant shutters, wood on wood, one by one
//   ≈528.6       the near door shuts, heavy, and the bar; 0.8 s of silence
//   532.0        the wind drops; one low string held (viola/cello harmonics, no melody)
//   ≈536.3       the gate lamps (no sound) · 540.35 His footsteps begin, even, receding · city evening sounds faintly ahead
//   549.0        room tone only · 551.0 hard cut to C13
// API: const M = await import('./jerusalem-weep3d.js'); const T = M.beats(B); const JW = await M.build(W, H); JW.draw(ctx, t, T)
//      t = FILM seconds; B = line times + B.pc (Film.pieces second-piece times). The page loads kit-charcoal.js (window.Charcoal) for J4's ruin.
//      JW.probe(t, T) · JW.joints(t, T) · JW.proj(t, T) for the checks.
// Skills read first: cinematic-3d (lib3d), cinecode camera-moves, canvas-film BODY-CHECK/SCENE-RULES, feeling-pastel (method), kit-charcoal.
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
  T.n133b = P('N133', 1, B.N133 + 4.1); T.q108b = P('Q108', 1, B.Q108 + 5.2); T.q44b = P('Q108b', 1, B.Q108b + 4.2);
  T.n135bb = P('N135b', 1, B.N135b + 3.5); T.n136b = P('N136', 1, B.N136 + 4.3); T.n137b = P('N137', 1, B.N137 + 3.2);
  T.cuts = [B.N133, T.n133b, B.L102 + 1.2, B.N135b, B.N136, B.N137];   // J1 J2 J4 J5 J6 J7 starts (fix 1: no J3; J4 carries Q108 and Q108b in one camera)
  T.names = ['J1', 'J2', 'J4', 'J5', 'J6', 'J7'];
  T.ruin = [B.Q108b, T.q44b + .7];             // J4: a clean cut to the charcoal ruin, held, a clean cut back on 「보살핌 받는 날을」
  T.jStop = B.N134 - .25;                    // his last step lands just before 「예수님은 우셨습니다」 (the one stop in the block)
  T.jDec = 1.9;                              // he slows over two steps
  T.drain = [B.N134 - .35, B.N134 + 1.6];    // the crowd's clock runs down (1 → 0.3)
  T.bow = [B.N134 + .3, B.N134 + 2.1];       // his shadow's head bows (≈ 1.8 s, ease-in-out)
  T.drop = B.N134 + 1.55;                    // the shoulders drop once (.35 s in-breath, then .9 s out)
  T.drop3 = [B.L102 - .15, B.L102 + .35];    // J3: the drop falls (0.4× speed) and touches the cloak
  T.cloud = [B.Q108b + .3, B.Q108b + 2.9, T.q44b + 1.0, T.q44b + 3.9];   // J4: the cloud's shadow comes, stays, leaves at 「보살핌 받는 날을」
  T.shut = [B.N135b + .2, B.N135b + 2.8];    // J5: distant shutters close one by one
  T.door = [T.n135bb + .05, T.n135bb + 1.15]; T.wedgeOff = T.n135bb + 1.35;   // the near door closes; the wedge goes out
  T.sunset = [B.N136 + .3, B.N136 + 4.8];    // J6: the sun touches the hills and sinks two thirds
  T.gateLamps = T.n136b;                     // J6: the gate's two lamps
  T.walk6 = B.N137 + .25;                    // J7: he sets off (1.2 s to speed) and walks to the end
  T.cross = T.n137b;                         // J7: he walks into the city's shadow
  T.dark = [B.C13 - 2.0, B.C13];             // the frame settles to a calm dark gold
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
  const CRIM = { value: col('#ffd58a', .9) };   // the gold edge on the city's sunward rims
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
  terrain(0, -500, 3600, 360, 'far');                        // 10 m cells
  terrain(20, -70, 380, 380, 'near', .03);                   // 1 m round the road where the crowd walks
  const S4C = { x: -205, z: -640 };                          // the lower city patch the S4 camera looks down on
  terrain(S4C.x, S4C.z, 160, 160, 'city', .04);
  const HILLS = [];
  // far hills beyond the city to the west (and the Mount's shoulders behind the camera in S1)
  { const hm = new THREE.MeshStandardMaterial({ color: '#9a7e6c', roughness: 1 });
    for (let i = 0; i < 11; i++) { const g = new THREE.SphereGeometry(1, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), r = rng(31 + i), pos = g.attributes.position;
      for (let k = 0; k < pos.count; k++) pos.setY(k, pos.getY(k) * (1 + .22 * noise1(pos.getX(k) * 3 + i, i)));
      g.computeVertexNormals(); const m = new THREE.Mesh(g, hm); m.scale.set(260 + r() * 260, 50 + r() * 45, 160 + r() * 120); m.position.set((i - 5) * 330 + r() * 120, -20, -2000 - r() * 500); S.add(m); HILLS.push({ x: m.position.x, z: m.position.z, sx: m.scale.x, sy: m.scale.y * 1.1, sz: m.scale.z }); } }

  // ---------------------------------------------------------------- the city (olivet3d.js wallM + the Temple's layout, copied and re-placed)
  const nCity0 = S.children.length, PLATREF = {};
  const wallM = (base, key, { win = 0 } = {}) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .92 });
    m.onBeforeCompile = sh => { sh.uniforms.uCSun = RIMU.uSunV; sh.uniforms.uCRim = CRIM;
      sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n { vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 4.); totalEmissiveRadiance += uCRim * fr * smoothstep(.15, .75, dot(normal, uCSun)); }').replace('#include <common>', '#include <common>\nuniform vec3 uCSun, uCRim;');
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
    PLATREF.v = box(x1 - x0, top - base, z1 - z0, cx, cz, M.stone, { y: base });
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
  const jRobe = rimSun(K.std('#c8b694', { roughness: .95, side: THREE.DoubleSide }), 'jr', 1.15), jCloth = rimSun(K.std('#8a7a66', { roughness: .95, side: THREE.DoubleSide }), 'jc', 1.15);
  const J = P.robeMan({ h: 1.78, broad: 1.18, head: 'cloth', mat: jRobe, cloth: jCloth, face: faceM }); P.headwear(J, 'cloth'); S.add(J);
tidyCloth(J);   // the tied head cloth (fix 2)
  { const hm = K.std('#8a7a66', { roughness: .95, side: THREE.DoubleSide }); J.userData.neck.children.forEach((c, i) => { if (i && c.material === jCloth) c.material = hm; }); }   // no rim round his head
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
  const crowdTau = t => { const a = T.drain[0], D = T.drain[1] - T.drain[0], k = .5; if (t <= a) return t; const u = (t - a) / D; return u < 1 ? t - k * D * rampI(u) : t - k * (D * .5 + (t - a - D)); };
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
  const shadowOnly = (g, on) => { for (const m of meshesOf(g)) m.layers.mask = on ? 8 : 1; };
  sunL.shadow.camera.layers.enable(3);
  const allFigs = () => [...CROWD, ...SIDE];
  const resetLayers = () => { for (const g of allFigs()) if (g.userData.meshes && g.userData.meshes[0].layers.mask !== 1) shadowOnly(g, false); };

  // J1 · the far procession, the golden city (494.7 → N133b): long lens from high on the Mount's slope (Simonet); people 18–32 px, dark
  //      dots half sunk in haze and dust, palm strokes catching light; the road flows from lower right to upper left. Move: crane down.
  STAGE.J1 = t => {
    const a = T.cuts[0], b = T.cuts[1], u = clamp((t - a) / (b - a)), k = .35 * u + .65 * (1 - Math.pow(1 - u, 1.6));   // inertia: arrives, still moving at the cut
    setVis(SIDE, true); crowdAt(t); jPose(t, 'J1'); setVis(CITYP, false); J.visible = true;
    const pos = V(22, 0, 262); pos.y = hT(pos.x, pos.z) + lerp(30, 21, k);
    const look = V(10, lerp(-30, -32, k), -330);
    setFov(22); setCam(pos, look);
    setSun(sunDirFrom(look.clone().sub(pos), -5.6, 6.2), 7, V(30, 5, 20), 140, 3.0);
    SKY.sunColor.value.copy(col('#fff0cc', 12)); SKY.sunGlow.value.copy(col('#ffb070', 1.7)); hemi.intensity = .22;
    film.dofCfg.focus = pos.distanceTo(V(20, 6, 10)); film.dofCfg.aperture = .5;
    film.atmos.density = .0019; film.look.exposure = 1.0; lamp.shimmer = .7; lamp.god = .45;
    dustU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2); moteU.uA.value = 0;
    RIMU.uRimC.value.copy(col('#ffd58a', 2.0)); pastelP.u.violet.value = .1; pastelP.u.gild.value = 0;
  };
  // J2 · the road with the cloaks, the shadow that stops (N133b → L102): the lens 0.5 m over the road looking west into the low sun;
  //      the crowd ahead is defocused backlit masses, the crowd near the lens exists only as long shadows streaming back over the
  //      cloaks toward us; he is a defocused backlit mass (≤ 12 %) left of centre and HIS shadow is the subject. Move: tracking at his
  //      pace, easing to a stop with his last two steps (T.jStop — the script's beat N134).
  STAGE.J2 = t => {
    setVis(SIDE, false); jPose(t, 'J2'); crowdAt(t); setVis(CITYP, false); J.visible = true;
    const u2 = clamp((t - T.cuts[1]) / (T.cuts[2] - T.cuts[1])), jp = J.position.clone(), pos = jp.clone().addScaledVector(DIRC, -48 + 10 * u2).addScaledVector(RIGHT, -2.4); pos.y = hT(pos.x, pos.z) + .5 + .5 * u2;   // tracking with him, and a slow push in on top that never stops   // a little to his left, over the crowd's lanes: their shadows stream at us; the Temple stands left of him, never behind his head
    const view = rotY(V(jp.x - pos.x, 0, jp.z - pos.z).normalize(), -2.2), look = lookFrom(pos, view, -6);
    setFov(26); setCam(pos, look);
    for (const g of CROWD) if (g.visible) shadowOnly(g, true);   // fix 2: the crowd is only its shadows
    for (const o of CITYHIDE) o.visible = false; PLATREF.v.visible = false; if (jRobe.userData.rimS) jRobe.userData.rimS.value = 0;   // no 3D city; no rim on the robe (the waist)
    const sv = sunDirFrom(view, -1.4, 3.6); SUN.copy(sv); SKY.sunDir.value.copy(SUN);
    { const f = pos.clone().addScaledVector(DIRC, 18); sunL.target.position.copy(f); sunL.position.copy(f).addScaledVector(SUN, 900); sunL.intensity = 30;
      const c = sunL.shadow.camera; if (c.right !== 26) { Object.assign(c, { left: -26, right: 26, top: 26, bottom: -26 }); c.updateProjectionMatrix(); } sunLamp.pos.copy(cam.position).addScaledVector(SUN, 1400); }
    SKY.sunColor.value.copy(col('#fff0cc', 10)); SKY.sunGlow.value.copy(col('#ffb070', 1.9)); hemi.intensity = .1;
    film.dofCfg.focus = 7.5; film.dofCfg.aperture = 9; film.dofCfg.maxCoc = 26;
    film.atmos.density = .0016; film.look.exposure = .86; lamp.shimmer = .25; lamp.god = .5;
    dustU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2); moteU.uA.value = .6; moteU.uC.value.set(pos.x, pos.y, pos.z - 3);
    RIMU.uRimC.value.copy(col('#ffb070', 2.2)); pastelP.u.violet.value = .25; pastelP.u.gild.value = 0;
  };
  // J4 · his eyes: the city across the valley (L102 + 1.2 → N135b), one camera for Q108 and Q108b. From where he stands, at his eye
  //      height, a long lens on the city (backlit layers, a gold edge only), swifts, the evening smoke, four lamps. Fix 1 (owner 2026-11-26):
  //      no cloud wipe — on Q108b a clean cut to the SAME camera drawn as the charcoal ruin (the Temple's place a heap, the walls broken,
  //      smoke rising; the sky the same sky), held, and a clean cut back to the golden city on 「보살핌 받는 날을」. Move: zoom in, 2.6 %/s,
  //      linear, never stopping, through both lines (the ruin frames are the same lens at the same moment).
  const J4P = V(JSTOP.x, JSTOP.y + 1.62, JSTOP.z), J4DIR = V(TEMPLE.x - J4P.x, 0, TEMPLE.z - J4P.z).normalize();
  const J4F0 = 36, j4fov = t => 2 * Math.atan(Math.tan(J4F0 / 2 * D2R) / Math.exp(.022 * Math.max(0, t - T.cuts[2]))) / D2R;
  const inRuin = t => t >= T.ruin[0] && t < T.ruin[1];
  const j4pos = t => J4P.clone().addScaledVector(RIGHT, lerp(-7, 7, clamp((t - T.cuts[2]) / (T.cuts[3] - T.cuts[2]))));
  STAGE.J4 = t => {
    setVis(SIDE, false); setVis(CROWD, false); jPose(t, 'J4'); setVis(CITYP, false); J.visible = false;
    const ru = inRuin(t); for (const o of CITYHIDE) o.visible = !ru;
    const p4 = j4pos(t); setFov(j4fov(t)); setCam(p4, lookFrom(p4, J4DIR, -8.1, 600));
    setSun(sunDirFrom(J4DIR, -6.0, 3.8), 5, V(0, -20, -700), 560, 2.6);
    SKY.sunColor.value.copy(col('#fff0cc', 14)); SKY.sunGlow.value.copy(col('#ffb070', 1.6)); hemi.intensity = .16; goldM.emissiveIntensity = .45;
    film.dofCfg.focus = 560; film.dofCfg.aperture = .6;
    film.atmos.density = .0014; film.look.exposure = 1.04; lamp.shimmer = 0; lamp.god = .4;
    moteU.uA.value = 0; RIMU.uRimC.value.copy(col('#ffd58a', 1.8)); pastelP.u.violet.value = .3; pastelP.u.gild.value = 0;
    if (!ru) J4L.forEach((i, n) => { const o = T.cuts[2] + [.7, 1.6, 2.4, 3.3][n]; lampA[i] = ss(o, o + 1.0, t) * .9; }); lamps.geometry.attributes.aA.needsUpdate = true;
  };
  // J5 · the city at dusk from the ridge (N135b): soft dark silhouettes, backlit; the lit windows go dark one by one across the city, from
  //      near to far, until only a few remain. No faces of boxes in light, no doors, no people. Move: truck right, slow, linear.
  const J5P = V(JSTOP.x, 0, JSTOP.z).addScaledVector(RIGHT, -62).addScaledVector(DIRC, 6);
  const J5L = (() => { const p0 = V(J5P.x, hT(J5P.x, J5P.z) + 22, J5P.z); return LAMPS.map((L, i) => [L, i]).filter(([L]) => !L.gate && L.p.z < -470 && L.p.z > -1000 && L.p.x > -380 && L.p.x < 220)
    .sort((a, b) => a[0].p.distanceTo(p0) - b[0].p.distanceTo(p0)).map(([, i]) => i); })();
  STAGE.J5 = t => {
    setVis(CROWD, false); setVis(SIDE, false); setVis(CITYP, false); J.visible = false;
    const a = T.cuts[3], b = T.cuts[4], u = clamp((t - a) / (b - a));
    const pos = J5P.clone().addScaledVector(RIGHT, lerp(-7, 7, u)); pos.y = hT(J5P.x, J5P.z) + 22;
    const look = V(-250, -27, -640).addScaledVector(RIGHT, lerp(-70, 70, .8 * u + .2 * sine(u)));
    setFov(26); setCam(pos, look);
    setSun(sunDirFrom(look.clone().sub(pos), -4, 1.6), 3, V(-100, -20, -700), 560, 1.6);
    SKY.horizon.value.copy(col('#ffb070', 1.4)); SKY.mid.value.copy(col('#c88a80', .8)); hemi.intensity = .1; goldM.emissiveIntensity = .3; CRIM.value.copy(col('#ffd58a', 1.2));
    film.dofCfg.focus = pos.distanceTo(look); film.dofCfg.aperture = .5;
    film.atmos.density = .0015; film.look.exposure = .82; lamp.shimmer = 0; lamp.god = .2;
    moteU.uA.value = 0; RIMU.uRimC.value.copy(col('#ff8a50', 1.4)); pastelP.u.violet.value = .45; pastelP.u.gild.value = 0;
    const n = J5L.length, keep = 6, t0 = a + .5, t1 = b - .8;
    J5L.forEach((i, k) => { lampA[i] = k >= n - keep ? 1 : 1 - ss(0, .35, t - lerp(t0, t1, k / Math.max(1, n - keep - 1))); });
    lamps.geometry.attributes.aA.needsUpdate = true;
  };
  // J6 · the sun on the hills, the city's shadow climbing (N136): a long lens from far behind him on the ridge — the sun's disc large on the
  //      hills right of the Temple, his small back (≈ 5 %) lower left at the brow, the valley below in which the city's shadow climbs
  //      toward him; lamps light one by one. Move: crane up, slow, never stopping. (J7 is a different shot: wide, low, near.)
  const camJ6 = kk => { const pos = V(JSTOP.x, 0, JSTOP.z).addScaledVector(DIRC, -120).addScaledVector(RIGHT, 6); pos.y = hT(pos.x, pos.z) + 2.6 + 6 * kk;
    return { pos, look: TEMPLE.clone().add(V(0, -34 - 7 * kk, 0)).addScaledVector(RIGHT, 1) }; };
  STAGE.J6 = t => {
    setVis(SIDE, false); setVis(CROWD, false); jPose(t, 'J6'); setVis(CITYP, false); J.visible = true;
    const a = T.cuts[4], b = T.cuts[5], u = clamp((t - a) / (b - a)), k = .35 * u + .65 * sine(u), { pos, look } = camJ6(k);
    setFov(15); setCam(pos, look);
    const el = lerp(2.4, 1.2, ss(T.sunset[0], T.sunset[1], t));
    setSun(sunDirFrom(look.clone().sub(pos), -2.2, el), 4, V(0, -20, -350), 560, lerp(2.4, 1.3, u));
    SKY.horizon.value.copy(col('#ffb070', 1.55)); SKY.mid.value.copy(lerp3(col('#d89a78', .88), col('#c08088', .75), u));
    hemi.intensity = .24; goldM.emissiveIntensity = .4; film.dofCfg.focus = pos.distanceTo(J.position); film.dofCfg.aperture = .45;
    film.atmos.density = .0013; film.look.exposure = 1.0; lamp.shimmer = 0; lamp.god = .4;
    moteU.uA.value = 0; RIMU.uRimC.value.copy(col('#ffd58a', 1.9)); pastelP.u.violet.value = .4 + .2 * u; pastelP.u.gild.value = 0;
    GU.uShK.value = 1; GU.uShD.value = shadowLine(t);
    cityLampsAt(t);
  };
  // J7 · into that city, into that shadow (N137): wide and low, 1.2 m over the road 25 m behind where he set off; he walks the whole shot,
  //      left third, into the shadow's edge on the line's second half (his rim goes out with it); lamps go on; the last 2 s sink to a calm
  //      dark gold (≈ 55). Move: crane up with a slow push, never stopping; the camera does not follow him.
  STAGE.J7 = t => {
    setVis(SIDE, false); setVis(CROWD, false); jPose(t, 'J7'); setVis(CITYP, false); J.visible = true;
    const a = T.cuts[5], b = T.end, u = clamp((t - a) / (b - a)), k = .5 * u + .5 * (1 - Math.pow(1 - u, 1.8));
    const pos = V(JSTOP.x, 0, JSTOP.z).addScaledVector(DIRC, -25 + 4 * k).addScaledVector(RIGHT, 1.4); pos.y = hT(pos.x, pos.z) + 1.2 + 5.5 * k;
    const look = lookFrom(pos, rotY(DIRC, -2.0), lerp(-1.6, -5.5, k), 300);
    setFov(44 - 4 * k); setCam(pos, look);
    setSun(sunDirFrom(DIRC, -3.6, lerp(1.2, .5, u)), 2, V(JSTOP.x, JSTOP.y, JSTOP.z - 20), 120, lerp(1.3, .5, u));
    SKY.sunColor.value.copy(lerp3(col('#fff0cc', 14), col('#ffc890', 4), u)); SKY.sunGlow.value.copy(lerp3(col('#ffb070', 1.4), col('#ff9a68', .9), u));
    SKY.top.value.copy(lerp3(col('#5a6a92', .5), col('#2c2f58', .38), u)); SKY.mid.value.copy(lerp3(col('#c08088', .75), col('#8a6a7e', .6), u)); SKY.horizon.value.copy(lerp3(col('#ffb070', 1.5), col('#e08a6a', 1.0), u));
    hemi.intensity = lerp(.26, .2, u); goldM.emissiveIntensity = lerp(.4, .2, u);
    film.dofCfg.focus = pos.distanceTo(J.position); film.dofCfg.aperture = .5;
    film.atmos.density = .0013; lamp.shimmer = 0; lamp.god = .3 * (1 - u); smkU.uC.value.copy(lerp3(col('#d8c4b0', 1), col('#9a8478', 1), u));
    const dk = ss(T.dark[0], T.dark[1], t); film.look.exposure = lerp(1.0, .33, dk); film.look.saturation = lerp(1, .75, dk);
    moteU.uA.value = 0; pastelP.u.violet.value = .6; pastelP.u.gild.value = .9 * dk + .15 * u;
    GU.uShK.value = 1; GU.uShD.value = shadowLine(t);
    setRimJ(1 - ss(-.6, .6, jAlong() - GU.uShD.value)); RIMU.uRimC.value.copy(lerp3(col('#ffd58a', 1.8), col('#ff9a68', .9), u));
    cityLampsAt(t);
  };
  // the edge of the city's shadow on the Mount, as a distance from where he stopped along the line to the Temple (+ = toward the city):
  // the valley floor at N136, 40 m in front of him at N137, and it reaches him on N137's second half while he walks into it.
  function shadowLine(t) { const a6 = T.cuts[4], a7 = T.cuts[5], j = 1.1 * Math.max(0, T.cross - T.walk6 - .6);
    if (t < a7) return lerp(300, 40, (t - a6) / (a7 - a6) * .6 + .4 * sine(clamp((t - a6) / (a7 - a6))));
    if (t < T.cross) return lerp(40, j, (t - a7) / (T.cross - a7));
    return j - 1.2 * (t - T.cross); }
  // the city's lamps: J6 one by one at 1.75 a second, evenly; on N136's second half the two gate lamps; J7 on at about one a second
  function cityLampsAt(t) { const a6 = T.cuts[4];
    LAMPS.forEach((L, i) => { const o = L.gate ? T.gateLamps + (L.sd > 0 ? .35 : 0) : a6 + .4 + L.rank / (L.rank < 14 ? 1.75 : 1.0) + (L.rank < 14 ? 0 : 14 / 1.75 - 14); lampA[i] = ss(o, o + .8, t) * (L.gate ? 1 : L.k); });
    lamps.geometry.attributes.aA.needsUpdate = true; gateLamps.forEach((g, i) => { g.power = 24 * ss(T.gateLamps + i * .35, T.gateLamps + i * .35 + 1.2, t); }); }

  const lerp3 = (A, B, k) => A.clone().lerp(B, clamp(k));
  function stage(t) {
    const nm = shotOf(t);
    skyGold(); hemi.intensity = .55; goldM.emissiveIntensity = .12; hemi.color.copy(col('#b4a8b8')); lamps.visible = nm === 'J4' || nm === 'J5' || nm === 'J6' || nm === 'J7'; for (const o of CITYHIDE) o.visible = true; PLATREF.v.visible = true; film.look.saturation = 1;
    gateLamps.forEach(g => { g.power = 0; }); smkU.uC.value.copy(col('#d8c4b0', 1)); lampA.fill(0); lamps.geometry.attributes.aA.needsUpdate = true;
    GU.uShK.value = 0; setRimJ(1); CRIM.value.copy(col('#ffd58a', .9)); if (nm !== 'J2') resetLayers(); J5.group.visible = false; for (const c of CLOAKS) c.visible = nm === 'J1' || nm === 'J2';
    dust.visible = nm === 'J1' || nm === 'J2'; TUFTS.visible = true; smoke.visible = !(nm === 'J4' && inRuin(t)); motes.visible = nm === 'J2'; birdsAt(t, (nm === 'J4' && !inRuin(t)) || nm === 'J6', null, nm === 'J4' ? 6 : 3); washAt(t);
    film.dofCfg.maxCoc = 22; film.atmos.scatter = 1; STAGE[nm](t);
    if (dust.visible) dustAt(t); smokeAt(t); smkU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2); lampU.uPx.value = (H / 2) / Math.tan(cam.fov * D2R / 2) * (nm === 'J4' ? 1.2 : nm === 'J5' ? 3.2 : 1.0);
    tuftU.uT.value = t; moteU.uT.value = t; GU.uSunG.value.copy(SUN);
    RIMU.uSunV.value.copy(SUN).transformDirection(cam.matrixWorldInverse.copy(cam.matrixWorld).invert());
    return nm;
  }

  // ---------------------------------------------------------------- J5: the near house's door and shutters, and the distant shutters
  const Q5 = (QS.get('q5') || '22,13,8,-26,-10,-5').split(',').map(Number);
  const J5 = (() => { const grp = new THREE.Group(); S.add(grp);
    // a house whose east face is on a street, near the east wall in the lower city
    const onStreet = h => { const fz = h.z + h.d / 2; for (let j = 0; j < 38; j++) if (Math.abs(fz - (streetZ(j) - SW / 2)) < 1.3) return true; return false; };
    const cand = HOUSES.filter(h => h.x < -150 && h.x > -280 && h.z > CITYZ - 22 && h.w > 6 && h.top - hT(h.x, h.z) > 5.5 && onStreet(h)).sort((p, q) => Math.abs(p.x + 200) - Math.abs(q.x + 200));
    const h = cand[0] || HOUSES.find(h => h.x < -150 && h.z < CITYZ - 25), gy = hT(h.x, h.z) - 1.2, fz = h.z + h.d / 2 + .03;
    const wood = K.std('#4a3424', { roughness: .9 }), glowM = c => new THREE.MeshBasicMaterial({ color: col(c, 2.6), fog: true });
    // the door: an opening (warm interior behind), a leaf hinged on its left that swings in from inside
    const dX = h.x - h.w * .18, door = new THREE.Group(); door.position.set(dX - .5, gy, fz - .02); grp.add(door);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.05, .07), wood); leaf.position.set(.5, 1.025, -.035); leaf.castShadow = true; door.add(leaf);
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.05), glowM('#ffb35c')); hole.position.set(dX, gy + 1.025, fz - .9); grp.add(hole);
    const jambs = []; for (const sd of [-1, 1]) { const j = new THREE.Mesh(new THREE.BoxGeometry(.12, 2.2, .9), K.std('#6a5440')); j.position.set(dX + sd * .56, gy + 1.1, fz - .45); grp.add(j); jambs.push(j); }
    const lint = new THREE.Mesh(new THREE.BoxGeometry(1.24, .14, .9), K.std('#6a5440')); lint.position.set(dX, gy + 2.12, fz - .45); grp.add(lint);
    // the wedge of warm light on the street in front of the door (its width follows the door's opening)
    const wg = new THREE.Shape(); wg.moveTo(-.5, 0); wg.lineTo(.5, 0); wg.lineTo(1.4, 4.2); wg.lineTo(-1.1, 4.2); wg.lineTo(-.5, 0);
    const wedge = new THREE.Mesh(new THREE.ShapeGeometry(wg), new THREE.MeshBasicMaterial({ color: col('#ffb35c', 1.6), transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
    wedge.rotation.x = -Math.PI / 2; wedge.position.set(dX, hT(dX, fz + 2) + .04, fz + .02); wedge.rotation.z = Math.PI; grp.add(wedge);
    // two shutters upstairs: a warm window, two leaves hinged outside that swing shut
    const shutters = [];
    for (const [ox, oy] of [[h.w * .14, 3.0], [h.w * .32, 3.0]]) { const wx = h.x + ox, win = new THREE.Mesh(new THREE.PlaneGeometry(.8, .95), glowM('#ffb35c')); win.position.set(wx, gy + oy, fz + .01); grp.add(win);
      const L = []; for (const sd of [-1, 1]) { const p = new THREE.Group(); p.position.set(wx + sd * .42, gy + oy, fz + .03); const s = new THREE.Mesh(new THREE.BoxGeometry(.42, 1.0, .05), wood); s.position.x = -sd * .21; p.add(s); grp.add(p); L.push({ p, sd }); }
      shutters.push({ win, L }); }
    // the distant shutters: warm windows on farther houses' east faces, each closed by one leaf; then only a thin gold line
    const far = []; { const r = rng(5959); const fh = HOUSES.filter(q => q !== h && q.x < -120 && q.x > -330 && q.z < h.z - 20 && q.z > h.z - 220 && q.top - hT(q.x, q.z) > 4.8).sort(() => r() - .5).slice(0, 7);
      fh.forEach((q, i) => { const fy = hT(q.x, q.z) - 1.2 + (q.top - hT(q.x, q.z) + 1.2) * .55, fzz = q.z + q.d / 2 + .04, wx = q.x + (r() - .5) * q.w * .4;
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.1), glowM('#ffb35c')); win.position.set(wx, fy, fzz); grp.add(win);
        const p = new THREE.Group(); p.position.set(wx - .52, fy, fzz + .03); const s = new THREE.Mesh(new THREE.BoxGeometry(1.04, 1.16, .06), wood); s.position.x = .52; p.add(s); grp.add(p); far.push({ win, p, i }); }); }
    const face = V(dX + 1.5, gy + 1.4, fz);
    const cam0 = V(face.x + Q5[0], gy + Q5[1], fz + Q5[2]), look0 = V(face.x + Q5[3], gy + Q5[4], fz + Q5[5]), right = V(-(look0.z - cam0.z), 0, look0.x - cam0.x).normalize().negate();
    return { group: grp, house: h, door, leaf, hole, wedge, shutters, far, face, cam: cam0, look: look0, right }; })();
  function doorsAt(t) { const J = J5, [s0, s1] = T.shut, [d0, d1] = T.door;
    // distant shutters: one by one over 2.6 s (evenly), each closing in .7 s; the window becomes a thin line of light
    J.far.forEach(({ win, p, i }) => { const o = s0 + i * (s1 - s0) / Math.max(1, J.far.length - 1) * .85, k = ss(o, o + .7, t); p.rotation.y = lerp(-1.9, -.02, k); win.scale.y = lerp(1, .06, ss(o + .45, o + .75, t)); });
    J.shutters.forEach(({ win, L }, n) => { const o = s0 + .5 + n * .9, k = ss(o, o + .8, t); L.forEach(({ p, sd }) => { p.rotation.y = sd * lerp(1.75, .02, k); }); win.scale.x = lerp(1, .05, ss(o + .55, o + .8, t)); });
    // the near door: open (swung in) → shut over 1.1 s, faster in the last .2 s; the wedge narrows with it and goes out at T.wedgeOff
    const u = clamp((t - d0) / (d1 - d0)), e = u < .82 ? .75 * sine(u / .82) : .75 + .25 * Math.pow((u - .82) / .18, 2), ang = lerp(-1.45, -.012, e);
    J.leaf.parent.rotation.y = ang; const open = Math.sin(-ang) / Math.sin(1.45);
    J.wedge.scale.set(Math.max(.02, open), 1, 1); J.wedge.material.opacity = .55 * Math.min(1, open * 4) * (1 - ss(T.wedgeOff - .3, T.wedgeOff, t));
    J.hole.material.color.copy(col('#ffb35c', 2.6 * (1 - .9 * ss(d1 - .1, d1 + .1, t)))); }

  // ---------------------------------------------------------------- J4: the charcoal ruin (kit-charcoal.js), fix 1 — a clean cut, same lens
  // The ruin frame is THE SAME 3D frame with the city's buildings hidden (only the Temple platform's retaining wall stays), turned into
  // charcoal through the kit's tooth pass, with the ruin's marks drawn on it in the same projection (a heap where the porch stood, broken
  // walls, house stumps, three smoke columns). Below the land's skyline everything is charcoal; above it the frame keeps its live sky.
  // Positions match exactly at every zoom (the marks are projected at J4's first lens and scaled about the centre with the zoom).
  const CH = typeof window !== 'undefined' ? window.Charcoal : null;
  let RUIN = null;
  function buildRuin() { if (RUIN || !CH) return; CH.init({ paper: '#b4ab9f', charcoal: '#34302e', tooth: 77 }); const r = rng(1919);
    const stones = []; for (let i = 0; i < 70; i++) { const ang = Math.PI * r(), rr = Math.sqrt(r()); stones.push([-1.35 * Math.cos(ang) * rr, Math.sin(ang) * .42 * rr * (.3 + .7 * r()), 4 + r() * 7, 3 + r() * 4, r() * 3]); }
    const walls = []; for (let i = 0; i <= 70; i++) { const k = i / 70, xw = lerp(-390, 300, k); if (xw > TMB.x0 - 4 && xw < TMB.x1 + 4) continue; walls.push([V(xw, -18 - (r() < .4 ? 6 * r() : 0), CITYZ), V(xw, -33, CITYZ), r() < .24]); }
    const stumps = []; for (let i = 0; i < 70; i++) { const xw = -380 + r() * 600, zw = -470 - r() * 650; if (xw > TMB.x0 - 10 && xw < TMB.x1 + 10 && zw > TMB.z0 - 10) continue;
      const g = hT(xw, zw) - 1.2; stumps.push([V(xw, g, zw), V(xw, g + 4 + r() * 6, zw), 3 + r() * 3, r()]); }
    RUIN = { stones, walls, stumps, smoke: [V(TEMPLE.x, TMB.top, -575), V(-200, -12, -700), V(150, 0, -900)] };
  }
  function ruinScreen() { cam.updateMatrixWorld(); const pr = p => { const q = p.clone().project(cam); return [(q.x + 1) / 2 * W, (1 - q.y) / 2 * H]; };
    const sky = []; for (let px = -12; px <= W + 12; px += 8) { const dw = V(px / W * 2 - 1, 0, .5).unproject(cam).sub(cam.position); const d = V(dw.x, 0, dw.z).normalize();
      let best = -1e9, bp = null; for (let dist = 380; dist < 3300; dist += 12) { const x = cam.position.x + d.x * dist, z = cam.position.z + d.z * dist; let h = hT(x, z);
        for (const q of HILLS) { const rr = ((x - q.x) / q.sx) ** 2 + ((z - q.z) / q.sz) ** 2; if (rr < 1) h = Math.max(h, -20 + q.sy * Math.sqrt(1 - rr)); }
        const e = (h - cam.position.y) / dist; if (e > best) { best = e; bp = V(x, h, z); } }
      sky.push([px, pr(bp)[1]]); }
    const pc = pr(RUIN.smoke[0]), pw = Math.abs(pr(V(TEMPLE.x + 30, TMB.top, -575))[0] - pc[0]);
    const heap = []; for (let i = 0; i <= 48; i++) { const k = i / 48, ang = Math.PI * k; heap.push([pc[0] - pw * 1.45 * Math.cos(ang), pc[1] + 2 - Math.pow(Math.sin(ang), .7) * pw * .46 * (.9 + .12 * Math.sin(i * 1.3))]); }
    const sc = pw / 60;
    return { sky, heap, stones: RUIN.stones.map(([dx, dy, a, b, c]) => [pc[0] + dx * pw, pc[1] - dy * pw, a * sc, b * sc, c]), walls: RUIN.walls.map(([a, b, g]) => [pr(a), pr(b), g]),
      stumps: RUIN.stumps.map(([b, tp, w, q]) => { const b0 = pr(b), t0 = pr(tp), w0 = Math.max(3, Math.abs(pr(b.clone().add(V(w, 0, 0)))[0] - b0[0])); return [b0, t0, w0, q]; }), smoke: RUIN.smoke.map(pr), sc }; }
  const mkC2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const maskC = mkC2(W, H), mx = maskC.getContext('2d'), ruC = mkC2(W, H), rx = ruC.getContext('2d');
  function ruinFrame(ctx, t) { buildRuin(); if (!RUIN) return; const R2 = ruinScreen(), s = 1, ss2 = R2.sc;
    const v = CH.begin(true);
    v.filter = 'grayscale(1) contrast(1.3) brightness(1.05) blur(1px)'; v.drawImage(film.canvas, 0, 0, W, H); v.filter = 'none';
    v.globalCompositeOperation = 'lighter'; v.fillStyle = 'rgb(0,0,255)'; v.fillRect(0, 0, W, H); v.globalCompositeOperation = 'source-over';   // rubbed tone (no stick grain): the land drawn smooth, as with a finger
    v.save();
    for (let i = 0; i < R2.walls.length - 1; i++) { const [a1, b1, gap] = R2.walls[i], [a2, b2] = R2.walls[i + 1]; if (gap) continue; CH.tone(v, [[a1[0], a1[1] + (i % 3 === 1 ? 7 : 0)], [a2[0], a2[1] + (i % 4 === 2 ? 9 : 0)], b2, b1], .78); }
    for (const [b0, t0, w0, q] of R2.stumps) CH.tone(v, [[b0[0], b0[1]], [b0[0] + w0, b0[1]], [b0[0] + w0, t0[1] + (q - .5) * 6], [b0[0] + w0 * .45, t0[1] - 3], [b0[0], t0[1] + 4]], .6);
    CH.smudgeFill(v, R2.heap, .8, 71, 8); for (const [x, y, rx0, ry0, a] of R2.stones) CH.blob(v, x, y, rx0, ry0, .5, a);
    R2.smoke.forEach(([sx, sy], n) => { for (let i = 0; i < 18; i++) { const L = 6, age = ((t * .8 + i / 18 * L + n * 1.7) % L), k = age / L; CH.blob(v, sx + (-12 * age * age * .5 + 6 * Math.sin(age + n)) * ss2, sy + (-16 - age * 58) * ss2, (20 + 44 * k) * ss2, (16 + 32 * k) * ss2, .42 * (1 - k) * ss(0, .08, k), n + i); } });
    v.restore();
    CH.setCam({ zm: 1, ox: 0, oy: 0, zc: [540, 960] }); CH.develop(rx);
    // the mask: everything below the land's skyline, plus the smoke and the stumps that rise above it (soft), in the same scaled space
    mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalCompositeOperation = 'source-over'; mx.clearRect(0, 0, W, H); mx.save();
    mx.fillStyle = '#fff'; mx.beginPath(); R2.sky.forEach(([x, y], i) => (i ? mx.lineTo(x, y + 1) : mx.moveTo(x, y + 1))); mx.lineTo(W + 600, H + 900); mx.lineTo(-600, H + 900); mx.closePath(); mx.fill();
    mx.filter = 'blur(10px)'; R2.smoke.forEach(([sx, sy], n) => { for (let i = 0; i < 18; i++) { const L = 6, age = ((t * .8 + i / 18 * L + n * 1.7) % L), k = age / L; mx.globalAlpha = .55 * (1 - k) * ss(0, .08, k); mx.beginPath(); mx.ellipse(sx + (-12 * age * age * .5 + 6 * Math.sin(age + n)) * ss2, sy + (-16 - age * 58) * ss2, (20 + 44 * k) * ss2, (16 + 32 * k) * ss2, 0, 0, 6.283); mx.fill(); } });
    mx.filter = 'none'; mx.globalAlpha = 1; for (const [b0, t0, w0] of R2.stumps) mx.fillRect(b0[0] - 1, t0[1] - 4, w0 + 2, b0[1] - t0[1] + 6); mx.restore();
    rx.globalCompositeOperation = 'destination-in'; rx.drawImage(maskC, 0, 0); rx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'blur(1.1px)'; ctx.drawImage(ruC, 0, 0); ctx.filter = 'none'; ctx.restore(); }

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
    T = TB; const nm0 = shotOf(t); if (nm0 !== 'J2') { drawPainted(ctx, t, nm0); return; }
    const nm = stage(t); renderAll(t); blit(ctx, t, lamp.shimmer);
    tmpV.copy(cam.position).addScaledVector(SUN, 900).project(cam);
    if (lamp.god > .01 && tmpV.z < 1) { const e = Math.max(Math.abs(tmpV.x), Math.abs(tmpV.y)), k = lamp.god * (1 - ss(.95, 1.55, e)); if (k > .004) godRays(ctx, (tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H, k); }
  }
  // ==== fix 2 (rounds/r10-pilot/batch3-director-fix2.md, owner 2026-11-26): the city is ONE PAINTED PANORAMA ====
  // After Simonet 「Flevit super illam」 (1892): Jerusalem across the Kidron from the Mount of Olives at sunset — the walls, the Temple's
  // white-and-gold porch catching the last light, roofs climbing the hill, haze between the layers. Painted once in code as layered 2D
  // planes (sky per frame; hills, upper city, Temple Mount, lower city, wall, valley, near slope), each in three states — lit, dusk, ruin —
  // so a 2D camera can truck, push and crane through them with parallax. The ruin is the same painting, same camera, redrawn in charcoal
  // greys (the porch gone, a heap of stones where it stood, walls broken, roofs fallen); the sky stays the same sky.
  // Pano coordinates: 2400 wide; hills on y ≈ 1440–1520; city 1460–1840; wall 1830–1905; Kidron valley 1880–2340; near slope 2330–3400.
  const PANO = (() => {
    const PW = 2400, cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const hx = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
    const mixc = (a, b, k) => { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k))).join(',')})`; };
    const HAZE = '#d9a983', SHADE = '#6e5a6e', GOLD = '#ffd58a';
    const mixH = (a, b, k) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k)).toString(16).padStart(2, '0')).join(''); };
    const pal = {   // by state: front face, roof, sunward rim, window, ground
      lit: { face: '#c48c62', roof: '#e3b27e', rim: GOLD, win: '#5a3a34', stone: '#dcbc90', white: '#f6e6c8', whiteS: '#c9ab92' },
      dusk: { face: '#7d5a5c', roof: '#8e6c6c', rim: null, win: '#3a2a30', stone: '#86686a', white: '#a08488', whiteS: '#6e5a6e' },
      ruin: { face: '#6c6664', roof: '#86807c', rim: null, win: '#3a3634', stone: '#7a7470', white: '#9a948e', whiteS: '#5a5452' } };
    // a layer: an offscreen canvas placed at (ox, oy) in pano coordinates, parallax p (0 far … 1 near)
    const layer = (ox, oy, w, h, p, paint) => { const out = { ox, oy, p, v: {} }; for (const st of ['lit', 'dusk', 'ruin']) { const c = cv(w, h), x = c.getContext('2d'); x.translate(-ox, -oy); paint(x, st, rng(9100 + oy));
      const c2 = cv(w, h), x2 = c2.getContext('2d'); x2.filter = 'blur(0.8px)'; x2.drawImage(c, 0, 0); x2.filter = 'none'; x2.globalAlpha = .45; x2.drawImage(c, 0, 0); out.v[st] = c2; } return out; };
    const dab = (x, x0, y0, x1, y1, n, col, a, r0, r1, R) => { x.fillStyle = col; for (let i = 0; i < n; i++) { x.globalAlpha = a * (.5 + .5 * R()); x.beginPath(); x.ellipse(lerp(x0, x1, R()), lerp(y0, y1, R()), r0 + R() * (r1 - r0), (r0 + R() * (r1 - r0)) * .6, R() * 3, 0, 6.283); x.fill(); } x.globalAlpha = 1; };
    const hazeOver = (x, x0, y0, w, h, k) => { if (k <= 0) return; x.save(); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = k; x.fillStyle = HAZE; x.fillRect(x0, y0, w, h); x.restore(); };
    // a house seen a little from above, the low sun to the right: front face, roof strip, a gold edge on the sunward side, dark windows
    function house(x, X, Y, w, h, st, hz, R) { const P = pal[st], k = hz, jit = (R() - .5) * .22;
      x.fillStyle = mixc(mixH(P.face, jit > 0 ? '#f0d0a8' : '#5a3e3a', Math.abs(jit)), HAZE, k * .8); x.fillRect(X, Y - h, w, h);
      x.fillStyle = mixc(P.face, '#000000', .28 + k * -.1); x.globalAlpha = .55; x.fillRect(X, Y - 3, w, 3); x.globalAlpha = 1;
      x.fillStyle = mixc(P.roof, HAZE, k * .7); x.beginPath(); x.moveTo(X, Y - h); x.lineTo(X + w, Y - h); x.lineTo(X + w - 3, Y - h - 4); x.lineTo(X + 3, Y - h - 4); x.closePath(); x.fill();
      if (P.rim) { x.fillStyle = P.rim; x.globalAlpha = .75 * (1 - k * .6); x.fillRect(X + w - 2.4, Y - h - 3, 2.4, h + 3); x.fillRect(X + 2, Y - h - 4.5, w - 4, 1.4); x.globalAlpha = 1; }
      x.fillStyle = mixc(P.win, HAZE, k * .6); const nw = Math.max(1, Math.floor(w / 14)); for (let i = 0; i < nw; i++) if (R() < .7) x.fillRect(X + 4 + i * (w - 8) / nw + R() * 3, Y - h * (.55 + .2 * R()), 2.6, 4 + R() * 3); }
    // a ruined house: a low broken stump of wall in grey, fallen stones at its foot
    function stump(x, X, Y, w, h, hz, R) { x.fillStyle = mixc('#5a5452', HAZE, hz * .5); x.beginPath(); x.moveTo(X, Y); x.lineTo(X, Y - h * (.3 + .5 * R())); x.lineTo(X + w * .3, Y - h * (.2 + .4 * R())); x.lineTo(X + w * .5, Y - h * (.5 + .4 * R())); x.lineTo(X + w * .75, Y - h * .15); x.lineTo(X + w, Y - h * (.1 + .3 * R())); x.lineTo(X + w, Y); x.closePath(); x.fill();
      dab(x, X - 4, Y - 6, X + w + 4, Y + 2, 6, mixc('#78726e', HAZE, hz * .5), .9, 2, 5, R); }
    function cityRows(x, st, R, x0, x1, yBack, yFront, rows, scale, skip) {
      for (let r = 0; r < rows; r++) { const k = r / (rows - 1), Y = lerp(yBack, yFront, k), sc = lerp(.55, 1, k) * scale, hz = (1 - k) * .55;
        for (let X = x0 + R() * 30; X < x1; X += (14 + R() * 30) * sc) { if (skip && skip(X, Y)) continue; const w = (14 + R() * 34) * sc, h = (12 + R() * 26) * sc + (R() < .1 ? 16 * sc : 0), yj = Y + (R() - .5) * 14 * sc;
          if (R() < .07) { X += 10 * sc; continue; }   // an alley
          if (st !== 'ruin' && R() < .06) { const tc = st === 'lit' ? mixc('#3e4430', HAZE, hz * .7) : mixc('#2e2a36', HAZE, hz * .5); x.fillStyle = tc; x.beginPath(); x.ellipse(X, yj - 14 * sc, 4 * sc, 16 * sc, 0, 0, 6.283); x.fill(); continue; }   // a cypress
          if (st === 'ruin') { if (R() < .75) stump(x, X, yj, w, h * .55, hz, R); else R(); } else house(x, X, yj, w, h, st, hz, R); } } }
    function patches(x, st, R, x0, y0, w, h) { if (st === 'ruin') return; x.save(); x.globalCompositeOperation = 'source-atop';
      for (let i = 0; i < 26; i++) { const X = x0 + R() * w, Y = y0 + R() * h, rx = 80 + R() * 220, g = x.createRadialGradient(X, Y, 0, X, Y, rx), warm = st === 'lit' && R() < .55;
        g.addColorStop(0, warm ? 'rgba(255,214,150,.22)' : 'rgba(90,70,100,.2)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(X - rx, Y - rx, rx * 2, rx * 2); } x.restore(); }
    // ---- the layers
    const hills = layer(0, 1360, PW, 220, .05, (x, st) => { const c1 = st === 'lit' ? '#a88a86' : st === 'dusk' ? '#7c6a7a' : '#8a8480', c2 = st === 'lit' ? '#977a7a' : st === 'dusk' ? '#6a5a6c' : '#7a7470';
      x.fillStyle = c1; x.beginPath(); x.moveTo(0, 1580); for (let X = 0; X <= PW; X += 20) x.lineTo(X, 1452 + 26 * Math.sin(X * .0021 + 1) + 12 * Math.sin(X * .0071)); x.lineTo(PW, 1580); x.closePath(); x.fill();
      x.fillStyle = c2; x.beginPath(); x.moveTo(0, 1580); for (let X = 0; X <= PW; X += 20) x.lineTo(X, 1490 + 18 * Math.sin(X * .0031 + 2.2) + 8 * Math.sin(X * .011)); x.lineTo(PW, 1580); x.closePath(); x.fill(); });
    const inTemple = (X, Y) => X > 800 && X < 1740;
    const cityBack = layer(0, 1420, PW, 260, .14, (x, st, R) => { cityRows(x, st, R, 0, PW, 1500, 1640, 11, .75, null); patches(x, st, R, 0, 1440, PW, 220); hazeOver(x, 0, 1420, PW, 260, st === 'ruin' ? .1 : .12); });
    const temple = layer(760, 1300, 1140, 440, .2, (x, st, R) => { const P = pal[st], L = st === 'lit';
      // the platform's retaining wall: courses, a lit top edge; in the ruin breached, its top jagged, stones at its foot
      x.fillStyle = P.stone; x.fillRect(820, 1598, 900, 104);
      x.strokeStyle = mixc(P.stone, '#000000', .18); x.lineWidth = 1.2; for (let y = 1610; y < 1700; y += 9) { x.beginPath(); x.moveTo(820, y); x.lineTo(1720, y); x.stroke(); }
      for (let y = 1606, i = 0; y < 1700; y += 9, i++) for (let X = 826 + (i % 2) * 14; X < 1716; X += 28) { x.beginPath(); x.moveTo(X, y); x.lineTo(X, y + 9); x.stroke(); }
      if (L) { x.fillStyle = '#f2d6a4'; x.fillRect(820, 1594, 900, 6); x.fillStyle = GOLD; x.globalAlpha = .8; x.fillRect(1716, 1594, 4, 108); x.globalAlpha = 1; }
      if (st === 'ruin') { x.fillStyle = '#5a5452'; for (let i = 0; i < 9; i++) { const X = 840 + R() * 860, w = 20 + R() * 50; x.beginPath(); x.moveTo(X, 1598); x.lineTo(X + w * .5, 1612 + R() * 16); x.lineTo(X + w, 1598); x.fill(); }
        dab(x, 820, 1690, 1720, 1712, 120, '#6a6462', .9, 3, 8, R); }
      if (st !== 'ruin') {
        // the Royal Stoa along the south: a long roof on a row of columns, deep shade between
        x.fillStyle = mixc(P.whiteS, '#000000', .25); x.fillRect(832, 1560, 230, 38); x.fillStyle = P.white; x.fillRect(828, 1552, 238, 9);
        for (let X = 836; X < 1060; X += 12) { x.fillStyle = P.white; x.fillRect(X, 1561, 4, 37); }
        // Solomon's Porch along the front (east) edge: a low colonnade
        x.fillStyle = mixc(P.whiteS, '#000000', .3); x.fillRect(1066, 1580, 640, 18); x.fillStyle = P.white; x.fillRect(1062, 1575, 650, 6);
        for (let X = 1068; X < 1706; X += 10) { x.fillStyle = mixc(P.white, '#000000', .05); x.fillRect(X, 1581, 3, 17); }
        // the court wall with its gate
        x.fillStyle = mixc(P.white, HAZE, .15); x.fillRect(1090, 1548, 380, 28); x.fillStyle = mixc(P.whiteS, '#000000', .35); x.fillRect(1255, 1556, 30, 20);
        // the sanctuary and its porch: white, gold on the cornice, a gold frame round the dark doorway, gold spikes on the roofline
        x.fillStyle = P.whiteS; x.fillRect(1206, 1440, 124, 112); x.fillStyle = P.white; x.fillRect(1206, 1440, 100, 112);
        x.fillStyle = P.white; x.fillRect(1170, 1450, 196, 102); x.fillRect(1160, 1386, 216, 66);
        x.fillStyle = mixc(P.whiteS, '#000000', .05); for (const X of [1186, 1214, 1316, 1344]) x.fillRect(X, 1452, 7, 98);   // engaged columns
        x.fillStyle = '#3a2420'; x.fillRect(1240, 1474, 54, 78);
        if (L) { x.fillStyle = GOLD; x.fillRect(1160, 1384, 216, 8); x.fillRect(1160, 1448, 216, 4); x.fillRect(1233, 1468, 6, 84); x.fillRect(1295, 1468, 6, 84); x.fillRect(1233, 1466, 68, 5);
          for (let X = 1164; X < 1376; X += 12) { x.beginPath(); x.moveTo(X, 1384); x.lineTo(X + 2, 1374); x.lineTo(X + 4, 1384); x.fill(); }
          x.globalAlpha = .7; x.fillRect(1372, 1386, 4, 166); x.fillRect(1326, 1440, 4, 110); x.globalAlpha = 1;
          const g = x.createLinearGradient(1160, 0, 1376, 0); g.addColorStop(0, 'rgba(255,214,150,0)'); g.addColorStop(1, 'rgba(255,214,150,.28)'); x.fillStyle = g; x.fillRect(1160, 1386, 216, 166); }
        else { x.fillStyle = '#9a8478'; x.fillRect(1160, 1384, 216, 6); }
        // the Antonia: a block with four towers at the north-west corner
        x.fillStyle = mixc(P.stone, '#000000', .12); x.fillRect(1730, 1540, 130, 160); x.fillStyle = mixc(P.stone, '#000000', .04);
        for (const [X, top] of [[1726, 1474], [1832, 1494]]) { x.fillRect(X, top, 32, 230); for (let c = 0; c < 4; c++) x.fillRect(X + c * 9, top - 7, 5, 8); }
        if (L) { x.fillStyle = GOLD; x.globalAlpha = .7; x.fillRect(1756, 1474, 3, 230); x.fillRect(1862, 1494, 3, 206); x.globalAlpha = 1; }
      } else {
        // where the porch stood: a long heap of stones; the Antonia a broken stump
        x.fillStyle = '#4e4846'; x.beginPath(); x.moveTo(1110, 1600); for (let i = 0; i <= 40; i++) { const k = i / 40; x.lineTo(lerp(1110, 1420, k), 1600 - Math.pow(Math.sin(Math.PI * k), .75) * (56 + 8 * Math.sin(i * 1.7))); } x.closePath(); x.fill();
        dab(x, 1120, 1548, 1410, 1600, 160, '#6e6866', .9, 3, 9, R); dab(x, 1130, 1556, 1400, 1598, 60, '#8a8480', .8, 2, 5, R);
        x.fillStyle = '#5e5856'; x.beginPath(); x.moveTo(1730, 1700); x.lineTo(1730, 1600); x.lineTo(1752, 1586); x.lineTo(1770, 1616); x.lineTo(1800, 1596); x.lineTo(1830, 1630); x.lineTo(1860, 1610); x.lineTo(1860, 1700); x.fill();
        dab(x, 1150, 1585, 1700, 1600, 80, '#6a6462', .9, 3, 7, R); }
      hazeOver(x, 760, 1300, 1140, 440, .08); });
    const cityFront = layer(0, 1580, PW, 300, .24, (x, st, R) => { cityRows(x, st, R, 0, PW, 1660, 1830, 9, 1.05, (X, Y) => X > 790 && X < 1750 && Y < 1720); patches(x, st, R, 0, 1600, PW, 260); hazeOver(x, 0, 1580, PW, 300, .04); });
    const wall = layer(0, 1780, PW, 150, .28, (x, st, R) => { const P = pal[st], L = st === 'lit';
      const breaks = st === 'ruin' ? [[300, 380], [610, 700], [980, 1050], [1460, 1560], [1900, 1980], [2160, 2210]] : [];
      const open = X => breaks.some(([a, b]) => X > a && X < b);
      for (let X = 0; X < PW; X += 6) { if (open(X)) { if (st === 'ruin') dab(x, X, 1888, X + 6, 1904, 2, '#6a6462', .9, 3, 6, R); continue; }
        const top = 1846 + (st === 'ruin' ? R() * 18 : 0); x.fillStyle = mixc(P.stone, '#000000', .1 + .06 * Math.sin(X * .05)); x.fillRect(X, top, 6.5, 1904 - top); }
      for (let X = 0; X < PW; X += 14) if (!open(X) && st !== 'ruin') { x.fillStyle = mixc(P.stone, '#000000', .1); x.fillRect(X, 1838, 8, 9); }
      for (let X = 80; X < PW; X += 170) { if (open(X) || (X > 1200 && X < 1340)) continue; const th = st === 'ruin' ? 20 + R() * 20 : 52; x.fillStyle = mixc(P.stone, '#000000', .04); x.fillRect(X, 1904 - th - 16, 34, th + 16); if (L) { x.fillStyle = GOLD; x.globalAlpha = .6; x.fillRect(X + 32, 1904 - th - 16, 2.5, th + 16); x.globalAlpha = 1; } }
      // the Golden Gate below the Temple: two arches between two towers
      if (st !== 'ruin') { x.fillStyle = mixc(P.stone, '#000000', .02); x.fillRect(1226, 1826, 96, 78); x.fillStyle = '#3a2824';
        for (const X of [1246, 1286]) { x.beginPath(); x.moveTo(X - 13, 1904); x.lineTo(X - 13, 1872); x.arc(X, 1872, 13, Math.PI, 0); x.lineTo(X + 13, 1904); x.fill(); } }
      else dab(x, 1220, 1870, 1330, 1904, 50, '#5e5856', .9, 3, 8, R); });
    const road = (x, pts, w0, w1, col) => { x.strokeStyle = col; x.lineCap = 'round'; for (let i = 0; i < pts.length - 1; i++) { x.lineWidth = lerp(w0, w1, i / (pts.length - 1)); x.beginPath(); x.moveTo(...pts[i]); x.lineTo(...pts[i + 1]); x.stroke(); } };
    const valley = layer(0, 1880, PW, 470, .45, (x, st, R) => { const lit = st === 'lit', d = st === 'dusk';
      const g = x.createLinearGradient(0, 1890, 0, 2340); g.addColorStop(0, lit ? '#8a7258' : d ? '#5e4c58' : '#7a7470'); g.addColorStop(.75, lit ? '#6a5a44' : d ? '#463a48' : '#5e5856'); g.addColorStop(1, lit ? '#7a6a4c' : d ? '#4e4250' : '#6a6462');
      x.fillStyle = g; x.fillRect(0, 1890, PW, 460);
      road(x, [[1272, 1904], [1258, 1990], [1296, 2080], [1236, 2170], [1262, 2250], [1214, 2336]], 9, 14, lit ? '#caa878' : d ? '#7a6670' : '#8e8884');
      for (let i = 0; i < 260; i++) { const X = R() * PW, Y = lerp(1930, 2320, Math.sqrt(R())), s2 = lerp(.6, 1.2, (Y - 1930) / 390);   // olive trees: low spreading crowns, short dark trunks
        x.fillStyle = lit ? '#3e3428' : d ? '#2e2630' : '#3a3634'; x.fillRect(X - 1.5 * s2, Y - 4 * s2, 3 * s2, 8 * s2);
        dab(x, X - 16 * s2, Y - 16 * s2, X + 16 * s2, Y - 4 * s2, 7, lit ? '#5e6648' : d ? '#3e3a48' : '#56524e', .95, 6 * s2, 11 * s2, R);
        if (lit) dab(x, X - 10 * s2, Y - 17 * s2, X + 14 * s2, Y - 12 * s2, 3, '#8a8a5a', .7, 3 * s2, 6 * s2, R); }
      hazeOver(x, 0, 1880, PW, 470, .06); });
    const near = layer(0, 2320, PW, 1080, 1, (x, st, R) => { const lit = st === 'lit', d = st === 'dusk';
      const g = x.createLinearGradient(0, 2330, 0, 3400); g.addColorStop(0, lit ? '#c49a6a' : d ? '#6e5a62' : '#8e8884'); g.addColorStop(1, lit ? '#a07a52' : d ? '#4e4048' : '#6e6866');
      x.fillStyle = g; x.beginPath(); x.moveTo(0, 2350); for (let X = 0; X <= PW; X += 30) x.lineTo(X, 2338 + 10 * Math.sin(X * .01) + 6 * Math.sin(X * .037)); x.lineTo(PW, 3400); x.lineTo(0, 3400); x.closePath(); x.fill();
      road(x, [[1214, 2340], [1180, 2440], [1120, 2560], [1080, 2700], [1060, 2900], [1080, 3150], [1120, 3400]], 16, 90, lit ? '#dcbc8c' : d ? '#86727a' : '#a09a94');
      for (let i = 0; i < 900; i++) { const X = R() * PW, Y = lerp(2360, 3400, Math.pow(R(), .8)), s2 = lerp(.5, 2.4, (Y - 2360) / 1040); x.strokeStyle = lit ? (R() < .5 ? '#8a7448' : '#b89a62') : d ? '#4e4250' : '#5e5856'; x.globalAlpha = .55; x.lineWidth = 1.2 * s2;
        x.beginPath(); x.moveTo(X, Y); x.lineTo(X + (R() - .3) * 4 * s2, Y - (5 + R() * 9) * s2); x.stroke(); }
      x.globalAlpha = 1; for (let i = 0; i < 40; i++) { const X = R() * PW, Y = lerp(2400, 3400, R()); if (Math.abs(X - lerp(1214, 1120, (Y - 2340) / 1060)) < 120) continue; const s2 = lerp(.6, 2, (Y - 2400) / 1000); dab(x, X - 10 * s2, Y - 6 * s2, X + 10 * s2, Y, 3, lit ? '#8a7a64' : d ? '#4a3e48' : '#5a5452', .9, 4 * s2, 8 * s2, R); } });
    const L = [hills, cityBack, temple, cityFront, wall, valley, near];
    // the lamps: windows of the lower city and the upper city (pano coords on their layer), and the gate's two (not level like eyes)
    const lamps = []; { const r = rng(5353); for (let i = 0; i < 70; i++) { const front = r() < .55, X = r() * PW, Y = front ? lerp(1680, 1820, r()) : lerp(1520, 1630, r()); if (X > 790 && X < 1750 && (!front || Y < 1720)) { i--; continue; } lamps.push({ x: X, y: Y, p: front ? .24 : .14, rank: i }); }
      lamps.push({ x: 1232, y: 1846, p: .28, rank: 1e9, gate: 1 }, { x: 1316, y: 1858, p: .28, rank: 1e9, gate: 2 }); }
    // charcoal paper (fixed to the frame) for the ruin
    const grain = cv(W, H); { const g = grain.getContext('2d'), im = g.createImageData(W, H), r = rng(77); for (let i = 0; i < W * H; i++) { const v = 200 + r() * 55 | 0; im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); }
    const scratch = cv(PW, 1100), sx = scratch.getContext('2d');
    const xf = (ctx, c, p) => { const Z = c.z * (1 + (c.push || 0) * p); ctx.setTransform(Z, 0, 0, Z, W / 2 - (c.cx + (c.tx || 0) * p) * Z, H / 2 - (c.cy + (c.ty || 0) * p) * Z); return Z; };
    // draw one layer; `split` = { y, feather, litAbove }: lit on one side of a pano line, dusk on the other
    function drawLayer(ctx, Ly, c, st, split) { const Z = xf(ctx, c, Ly.p);
      if (!split || st === 'ruin') { ctx.drawImage(Ly.v[st], Ly.ox, Ly.oy); return; }
      ctx.drawImage(Ly.v.dusk, Ly.ox, Ly.oy);
      const w = Ly.v.lit.width, h = Ly.v.lit.height, yl = split.y - Ly.oy, f = split.feather;
      if (split.litAbove ? yl <= -f : yl >= h + f) return;
      if (split.litAbove ? yl >= h + f : yl <= -f) { ctx.drawImage(Ly.v.lit, Ly.ox, Ly.oy); return; }
      sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalCompositeOperation = 'source-over'; sx.clearRect(0, 0, w, h); sx.drawImage(Ly.v.lit, 0, 0);
      sx.globalCompositeOperation = 'destination-in'; const g = sx.createLinearGradient(0, yl - f, 0, yl + f); g.addColorStop(0, split.litAbove ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0)'); g.addColorStop(1, split.litAbove ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)');
      sx.fillStyle = g; sx.fillRect(0, 0, w, h); sx.globalCompositeOperation = 'source-over'; ctx.drawImage(scratch, 0, 0, w, h, Ly.ox, Ly.oy, w, h); }
    function sky(ctx, c, s) { ctx.setTransform(1, 0, 0, 1, 0, 0); const Z = c.z, sxp = W / 2 + (s.sun.x - c.cx) * Z, syp = H / 2 + (s.sun.y - c.cy) * Z;
      const hyS = H / 2 + (1480 - c.cy) * Z, g = ctx.createLinearGradient(0, hyS - 1400 * Z, 0, hyS);
      g.addColorStop(0, s.top); g.addColorStop(.7, s.mid); g.addColorStop(1, s.hor); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const gl = ctx.createRadialGradient(sxp, syp, 0, sxp, syp, 520 * Z); gl.addColorStop(0, `rgba(246,220,168,${.75 * s.glow})`); gl.addColorStop(.35, `rgba(246,214,160,${.35 * s.glow})`); gl.addColorStop(1, 'rgba(246,214,160,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
      if (s.sunA > 0) { ctx.globalAlpha = s.sunA; const gd = ctx.createRadialGradient(sxp, syp, 0, sxp, syp, 44 * Z); gd.addColorStop(0, '#fff6dc'); gd.addColorStop(.8, '#fbe4b0'); gd.addColorStop(1, 'rgba(251,228,176,0)'); ctx.fillStyle = gd; ctx.beginPath(); ctx.arc(sxp, syp, 44 * Z, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; }
      // soft clouds lit from below, fixed to the sky (they drift very slowly)
      ctx.globalAlpha = .22 * s.glow; ctx.fillStyle = '#fbe0b8'; for (let i = 0; i < 6; i++) { const X = W / 2 + ((300 + i * 330 + s.t * 3) % 2400 - c.cx) * Z * .9, Y = H / 2 + (900 + 70 * Math.sin(i * 2.1) - c.cy) * Z; ctx.beginPath(); ctx.ellipse(X, Y, 180 * Z, 16 * Z, 0, 0, 6.283); ctx.fill(); } ctx.globalAlpha = 1; }
    // his small figure (2D, backlit): a tied head cloth with a level top ending at the shoulder, broad level shoulders, a robe to the
    // hem; walking shows in the hem; a rim (gold) on the head-cloth edge and shoulder line only — never at the waist
    function figure(ctx, X, Y, h, o = {}) { const s = h / 100, ph = o.ph || 0, walk = o.walk || 0, bow = o.bow || 0, col = o.col || '#2a1f22';
      ctx.save(); ctx.translate(X, Y); ctx.scale(s, s); const sw = Math.sin(ph * 6.283) * walk;
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-17, -66); ctx.lineTo(17, -66); ctx.lineTo(20, -60); ctx.lineTo(23 + 3 * sw, 0); ctx.lineTo(4 + 6 * sw, -1 - 2 * Math.abs(sw)); ctx.lineTo(-4 + 6 * sw, -1); ctx.lineTo(-23 + 3 * sw, 0); ctx.lineTo(-20, -60); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(10 * sw, 0, 6, 2, 0, 0, 6.283); ctx.ellipse(-10 * sw, 0, 6, 2, 0, 0, 6.283); ctx.fill();   // the two feet, stepping
      ctx.save(); ctx.translate(0, -68 + 3 * bow); ctx.rotate(.08 * bow);
      ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(-10, -16); ctx.lineTo(-8, -20); ctx.lineTo(8, -20); ctx.lineTo(10, -16); ctx.lineTo(10, 2); ctx.lineTo(16, 6); ctx.lineTo(-16, 6); ctx.closePath(); ctx.fill();   // the head cloth: level top, falling to the shoulders
      if (o.rim > 0) { ctx.strokeStyle = GOLD; ctx.globalAlpha = o.rim; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(8, -20); ctx.lineTo(10, -16); ctx.stroke(); ctx.globalAlpha = 1; }
      ctx.restore();
      if (o.rim > 0) { ctx.strokeStyle = GOLD; ctx.globalAlpha = o.rim; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-17, -66); ctx.lineTo(17, -66); ctx.lineTo(20, -60); ctx.stroke(); ctx.globalAlpha = 1; }
      if (o.shadow > 0) { ctx.globalAlpha = o.shadow; ctx.fillStyle = 'rgba(70,52,64,.75)'; ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(14, 2); ctx.lineTo(30 + 8 * sw, 300); ctx.lineTo(-2 - 8 * sw, 300); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.restore(); }
    // the scene: c = 2D camera {cx, cy, z, tx, ty, push}; s = {state, split (city), splitLow (valley/near), sun, sky colours, lamps(i)→a, birds, smoke, fig}
    function draw(ctx, c, s) { ctx.save(); sky(ctx, c, s);
      for (const Ly of L) { const st = s.state === 'ruin' ? 'ruin' : (s.allDusk ? 'dusk' : 'lit'); const low = Ly === valley || Ly === near;
        drawLayer(ctx, Ly, c, st, s.state === 'ruin' || s.allDusk ? null : low ? s.splitLow : s.split);
        if (Ly === temple && s.smoke != null) { xf(ctx, c, temple.p); ctx.filter = 'blur(6px)'; for (const [X, Y, n] of [[1265, 1560, 0], [560, 1640, 1], [1980, 1650, 2]]) for (let i = 0; i < 30; i++) { const Lf = 6, age = ((s.smoke * .8 + i / 30 * Lf + n * 1.7) % Lf), k = age / Lf;
            ctx.globalAlpha = .38 * (1 - k) * ss(0, .08, k); ctx.fillStyle = '#3e3a38'; ctx.beginPath(); ctx.ellipse(X - 10 * age * age * .6 + 5 * Math.sin(age + n), Y - 10 - age * 40, 14 + 30 * k, 12 + 22 * k, 0, 0, 6.283); ctx.fill(); } ctx.globalAlpha = 1; ctx.filter = 'none'; }
        if (Ly === temple && s.birds != null) { xf(ctx, c, temple.p); ctx.strokeStyle = '#3a2a2a'; ctx.lineWidth = 2.2; for (let i = 0; i < 14; i++) { const a = i * .9 + s.birds * (.35 + .05 * (i % 4)) * (i % 2 ? 1 : -1), rr = 70 + 18 * (i % 5), X = 1270 + Math.cos(a) * rr * 1.8, Y = 1330 + Math.sin(a) * rr * .45, f = 3 + 3 * Math.sin(s.birds * 9 + i);
            ctx.beginPath(); ctx.moveTo(X - 7, Y - f); ctx.lineTo(X, Y); ctx.lineTo(X + 7, Y - f); ctx.stroke(); } }
        if ((Ly === cityFront || Ly === wall) && s.lamps) { for (const Lp of lamps) { if ((Ly === wall) !== !!Lp.gate) continue; const a = s.lamps(Lp); if (a <= .01) continue; const Z = xf(ctx, c, Lp.p); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
            const X = W / 2 + (Lp.x - c.cx - (c.tx || 0) * Lp.p) * Z, Y = H / 2 + (Lp.y - c.cy - (c.ty || 0) * Lp.p) * Z, r = Math.max(3, 4 * Z);
            const gg = ctx.createRadialGradient(X, Y, 0, X, Y, r * 3.5); gg.addColorStop(0, `rgba(255,214,140,${a})`); gg.addColorStop(.3, `rgba(255,179,92,${.7 * a})`); gg.addColorStop(1, 'rgba(255,179,92,0)'); ctx.fillStyle = gg; ctx.fillRect(X - r * 4, Y - r * 4, r * 8, r * 8); ctx.restore(); } }
        if (Ly === near && s.fig) { const Z = xf(ctx, c, 1); figure(ctx, s.fig.x, s.fig.y, s.fig.h / Z, s.fig); } }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (s.state === 'ruin') { ctx.globalCompositeOperation = 'multiply'; const hy = H / 2 + (1452 - c.cy) * c.z; ctx.save(); ctx.beginPath(); ctx.rect(0, hy, W, H - hy); ctx.clip(); ctx.drawImage(grain, 0, 0); ctx.restore(); ctx.globalCompositeOperation = 'source-over'; }
      ctx.restore(); }
    return { draw, lamps, temple, near, valley };
  })();
  // ---- the painted shots: a 2D camera per shot (pano coordinates) and the painting's state
  const skyCols = u => ({ top: mixHex('#c9a28e', '#5e5070', u), mid: mixHex('#f2c48e', '#c58a7a', u), hor: mixHex('#f6dca8', '#e8a87a', u) });
  function mixHex(a, b, k) { const p = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }, A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k))).join(',')})`; }
  function pano(t, nm) {
    const S0 = { t, sun: { x: 1490, y: 1460 }, sunA: 1, glow: 1, ...skyCols(0), state: 'lit', split: null, splitLow: null };
    if (nm === 'J1') { const a = T.cuts[0], b = T.cuts[1], u = clamp((t - a) / (b - a)), k = .4 * u + .6 * sine(u);
      return { c: { cx: 1210, cy: 1980, z: .7, tx: 0, ty: lerp(90, -40, k), push: .04 * k }, s: { ...S0, birds: t } }; }
    if (nm === 'J4') { const a = T.cuts[2], b = T.cuts[3], u = clamp((t - a) / (b - a)), ru = t >= T.ruin[0] && t < T.ruin[1];
      return { c: { cx: 1270, cy: 1780, z: lerp(1.45, 1.62, u), tx: lerp(-60, 60, u), ty: 0, push: lerp(0, .14, u) }, s: { ...S0, state: ru ? 'ruin' : 'lit', birds: ru ? null : t, smoke: ru ? t : null, sunA: 1 } }; }
    if (nm === 'J5') { const a = T.cuts[3], b = T.cuts[4], u = clamp((t - a) / (b - a)), ly = lerp(1910, 1300, ss(0, .82, u)) - 160 * ss(.82, 1, u);
      return { c: { cx: 1200, cy: 1760, z: 1.05, tx: lerp(40, -40, u), ty: 0, push: 0 }, s: { ...S0, ...skyCols(.25 * u), sun: { x: 1490, y: lerp(1462, 1470, u) }, split: { y: ly, feather: 26, litAbove: true }, splitLow: { y: lerp(1900, 2600, ss(.1, .9, u)), feather: 60, litAbove: false } } }; }
    if (nm === 'J6') { const a = T.cuts[4], b = T.cuts[5], u = clamp((t - a) / (b - a)), k = .35 * u + .65 * sine(u), sy = lerp(1462, 1500, ss(T.sunset[0], T.sunset[1], t));
      return { c: { cx: 1250, cy: 2360, z: .78, tx: 0, ty: lerp(30, -60, k), push: .05 * k }, s: { ...S0, ...skyCols(.35 + .25 * u), sun: { x: 1490, y: sy }, allDusk: false, split: { y: 1200, feather: 10, litAbove: true }, splitLow: { y: lerp(2330, 2470, u), feather: 30, litAbove: false },
        lamps: Lp => Lp.gate ? ss(T.gateLamps + (Lp.gate - 1) * .45, T.gateLamps + (Lp.gate - 1) * .45 + .8, t) : Lp.rank < 32 ? ss(a + .4 + Lp.rank / (Lp.rank < 14 ? 1.75 : 1) + (Lp.rank < 14 ? 0 : 8 - 14), a + 1.2 + Lp.rank / (Lp.rank < 14 ? 1.75 : 1) + (Lp.rank < 14 ? 0 : 8 - 14), t) : 0,
        fig: { x: 1062, y: 2540, h: 108, walk: 0, rim: 1, shadow: 0 } } }; }
    // J7
    const a = T.cuts[5], b = T.end, u = clamp((t - a) / (b - a)), k = .5 * u + .5 * sine(u), e = 1.2, uu = (t - T.walk6) / e, tau = t <= T.walk6 ? 0 : uu < 1 ? e * rampI(uu) : e * .5 + (t - T.walk6 - e);
    const prog = clamp(tau / (b - T.walk6)), fy = lerp(2540, 2380, prog), fx = lerp(1066, 1176, prog), line = lerp(2420, 2650, u);
    const inL = 1 - ss(-8, 8, line - fy);   // 1 while he is on the lit (near) side of the shadow's edge
    return { c: { cx: 1150, cy: 2365, z: lerp(1.35, 1.45, k), tx: 0, ty: lerp(0, -50, k), push: .04 * k },
      s: { ...S0, ...skyCols(.6 + .3 * u), sun: { x: 1490, y: lerp(1500, 1530, u) }, sunA: 1 - ss(0, .6, u), glow: lerp(.8, .45, u), split: { y: 1200, feather: 10, litAbove: true }, splitLow: { y: line, feather: 26, litAbove: false },
        lamps: Lp => Lp.gate ? 1 : Lp.rank < 32 ? (Lp.rank < 14 ? 1 : ss(a + (Lp.rank - 14) / 1.0, a + .8 + (Lp.rank - 14) / 1.0, t)) : 0,
        fig: { x: fx, y: fy, h: lerp(150, 70, Math.pow(prog, .8)), walk: tau > 0 ? Math.min(1, tau) : 0, ph: tau / JTg, rim: inL, shadow: .8 * inL } } };
  }
  function drawPainted(ctx, t, nm) { const { c, s } = pano(t, nm); PANO.draw(ctx, c, s);
    if (nm === 'J7') { const dk = ss(T.dark[0], T.dark[1], t); if (dk > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(196,150,84,${dk})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(60,42,20,${.22 * dk})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } } }

  // ---------------------------------------------------------------- the checks (no render): camera + emission; bone directions
  function probe(t, TB) { T = TB; if (shotOf(t) !== 'J2') { const nm2 = shotOf(t), { c } = pano(t, nm2); return { shot: nm2, p: [(c.cx + (c.tx || 0) * .4) * c.z, (c.cy + (c.ty || 0) * .4) * c.z, 0], d: [0, 0, -1], fov: 40 / c.z / (1 + (c.push || 0) * .4), emit: { lamps: 0 } }; }
    const nm = stage(t); const d = V(); cam.getWorldDirection(d);
    return { shot: nm, p: cam.position.toArray(), d: d.toArray(), fov: cam.fov, focus: film.dofCfg.focus, emit: { smoke: smkAlive, dust: dust.visible ? dustAlive : 0, lamps: lampA.reduce((a, b) => a + (b > .05 ? 1 : 0), 0), ruin: nm === 'J4' && inRuin(t) ? 1 : 0 } }; }
  function joints(t, TB) { T = TB; if (shotOf(t) !== 'J2') return { shot: shotOf(t), figs: {} }; const nm = stage(t); const out = {}, Y = V(0, 1, 0);
    const figs = nm === 'S4' ? CITYP : [J, ...CROWD.slice(0, 400), ...SIDE];
    figs.forEach((g, n) => { if (!g.visible) return; const U = g.userData; if (!U.arms[0].E) return; const rec = {};
      U.arms.forEach((A, i) => { rec['ua' + i] = A.E.clone().sub(A.S2 || A.S).normalize().toArray(); rec['fa' + i] = A.T.clone().sub(A.E).normalize().toArray(); });
      (U.legs || []).forEach((L, i) => { rec['th' + i] = Y.clone().applyQuaternion(L.thigh.quaternion).toArray(); rec['sh' + i] = Y.clone().applyQuaternion(L.shin.quaternion).toArray(); });
      rec.neck = [U.neck.rotation.x, U.neck.rotation.y]; rec.up = [U.upper.rotation.x, U.upper.rotation.y]; out[(g === J ? 'J' : nm === 'S4' ? 'q' : 'c') + n] = rec; });
    return { shot: nm, figs: out, jHead: J.userData.neck.rotation.y, jYaw: J.rotation.y }; }
  // where things land in the frame (px) at t — for framing checks
  function proj(t, TB, pts) { T = TB; const nm = stage(t); S.updateMatrixWorld(true);
    const named = { door: J5.face.clone(), J: J.position.clone().add(V(0, 1.7, 0)), Jfeet: J.position.clone(), temple: TEMPLE.clone(), gate: V(GATE.x, hT(GATE.x, GATE.z) + 8, GATE.z), sun: cam.position.clone().addScaledVector(SUN, 900) };
    const out = { shot: nm }; for (const [k, p] of Object.entries(named)) { const q = p.clone().project(cam); out[k] = [Math.round((q.x + 1) / 2 * W), Math.round((1 - q.y) / 2 * H), +q.z.toFixed(3)]; }
    (pts || []).forEach((p, i) => { const q = V(...p).project(cam); out['p' + i] = [Math.round((q.x + 1) / 2 * W), Math.round((1 - q.y) / 2 * H)]; });
    return out; }
  S.updateMatrixWorld(true);
  return { film, draw, probe, joints, proj, people: { J, CROWD, SIDE, CITYP } };
}
