// bw-rooster.js — 「kingdom」 5부 「닭이 울 때」, film 541.2 (C13) → 627.3 (C14): Peter swears, draws a sword, warms himself, denies, breaks.
// Look: high-contrast black-and-white film rendered from 3D, coarse FIXED grain, haloed highlights, after 「쉰들러 리스트」 (1993, OPUSCAR 66):
// one colour kept, the orange of fire #ff8a2a (lamp, torches a little, the charcoal fire most). The alley (R6) is fully colourless.
// The channel's reference: the first film's 「사사」 and 「십자가」 black-and-white shots (motion/pilot/judges.html, cross.html).
// Skills: cinematic-3d (lib3d/cine.js: fog, lamp in-scatter, bloom, DOF), cinecode camera-moves (push-in, lateral track, crane down,
// reverse, hold), photoreal-film (one source per shot, practical light), canvas-film BODY-CHECK (IK, planted feet, hands on what they hold).
// Shots (all times from script `at`, see beats()):
//   R1  room    C13–N141   one lamp, seated shapes, Peter rises on Q109; on N141 the lamp dips and his shadow climbs the wall. Slow push.
//   R2a garden  N142       olive trunks, torches come through them. Lateral track.
//   R2b sword   N143       the blade flashes against a torch, a clean cut on the action, no wound. Slow arc.
//   R2c blade   N144       over his shoulder: the raised blade trembling against the shaking torches. Slow push.
//   R2d lead    N145       the blade lowers; one man (back view) reaches to the servant; the torches close and lead him off. Slow drift.
//   R3  court   N146–N148  high wide courtyard, one fire; crane down into the circle; she points; his head turns; the circle turns on him.
//   R4  roof    N149       first grey of dawn, a small rooster on the parapet. Everything stops. Very slow push.
//   R5a door    L105/Q114  far, in a lit doorway, a bound man stops and turns (backlit, no face). Long lens creep.
//   R5b back    Q114       reverse: Peter frozen by the fire, from behind. Hold with a creep.
//   R6  alley   Q115       Peter stumbles to a wall and goes down it, small in the frame, no colour left. Very slow push.
// Men: people3d robeMan (the film's approved body) with tied head cloth and beard, hem lifted so the legs show, varied build, a few bareheaded;
// only the servant woman is veiled. R3: a seated cluster at a small ember mound, others standing behind in shadow, Peter seated among them.
// Jesus: back view / far backlit silhouette only, no beard or face geometry drawn toward camera, never large or central, no halo.
// API: const M = await import('./bw-rooster.js'); const T = M.beats(B); const R = await M.build(W, H); R.draw(ctx, t, T)  (t = FILM seconds; pure in t).
import { Film, THREE, V, col, rng } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const { clamp, lerp, ss } = P;
const sine = x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
const face = (dx, dz) => Math.atan2(-dx, -dz);   // rotation.y that turns a figure (facing −z) toward (dx, dz)
const FIRE = '#ff8a2a', SILVER = '#e9e9e9';
// keyed value: smooth between keys (each segment eases), holds outside
const kf = (t, keys) => { if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return lerp(va, vb, sine((t - a) / (b - a))); }
  return keys[keys.length - 1][1]; };
const wob = (t, a, b, ph = 0) => Math.sin(t * a + ph) * .6 + Math.sin(t * b + ph * 1.7) * .4;
const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

// ---------------------------------------------------------------- the one table: every visual time from the line times
export function beats(B) {
  const pc = B.pc || {}, T = { ...B, start: B.C13, end: B.C14 };
  T.rise = [B.Q109 + .35, B.Q109 + 2.75];                 // Peter gets up from the floor
  T.vow = [B.Q109 + 2.6, B.Q109 + 3.8];                   // his hand comes to his chest
  T.dip = [B.N141 + .15, B.N141 + 3.6];                   // the lamp dips, his shadow climbs
  T.cutGarden = B.N142; T.cutSword = B.N143; T.cutBlade = B.N144; T.cutLead = B.N145; T.cutCourt = B.N146; T.cutRoof = B.N149; T.cutDoor = B.L105; T.cutAlley = B.Q115;
  T.cutBack = lerp(B.Q114, B.Q115, .56);                  // R5a | R5b
  const c = pc.N143 ? pc.N143[1] : B.N143 + 2.9;
  T.draw = [B.N143 + .25, B.N143 + 1.2]; T.raise = [B.N143 + 1.2, c + .1]; T.strike = [c + .32, c + .68]; T.flash = c + .52;   // on 「대제사장의 종의 귀를 베었습니다」
  T.lower = [B.N145 + .25, B.N145 + 2.3];                 // the blade comes down
  T.step = [B.N145 + .5, B.N145 + 1.9];                   // he goes to the servant
  T.reach = [B.N145 + 1.75, B.N145 + 3.0]; T.reachOff = [B.N145 + 3.5, B.N145 + 4.1];
  T.close = [B.N145 + 2.2, B.N145 + 5.2]; T.lead = [B.N145 + 5.1, B.N146 + 1.6];
  const n147b = pc.N147 ? pc.N147[1] : B.N147 + 3.3;
  T.point = [B.N147 + .45, B.N147 + 1.5]; T.away = [n147b - .1, n147b + .75];
  T.two = B.N148 + .02; T.three = B.N148 + (B.N149 - B.N148) * .52;
  T.crow = pc.N149 ? pc.N149[1] : B.N149 + 2.7;
  T.doorStop = B.L105 + .95; T.doorTurn = [B.L105 + 1.05, B.L105 + 2.15];
  T.fall = { walk: [B.Q115 + .05, B.Q115 + 1.35], turn: [B.Q115 + 1.38, B.Q115 + 2.35], hand: [B.Q115 + 1.75, B.Q115 + 2.3], sink: [B.Q115 + 2.4, B.Q115 + 5.0], fold: [B.Q115 + 3.5, B.Q115 + 5.7] };
  return T;
}

const NOISE = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
  float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;

export async function build(W, H) {
  const isV = H > W, VS = isV ? .13 : .02;   // the picture's centre rides above the word band
  const film = new Film({ W, H, dur: 1e4, fov: 40, near: .05, far: 700,
    atmos: { density: .02, falloff: .12, base: 0, start: 1, color: col('#8c8c8c', .25), colorUp: col('#9a9a9a', .2), max: 240, scatter: 1, anisotropy: .72, phaseMix: .7 },
    bloom: { strength: .12, radius: 1.12, tint: col('#ffffff') },
    dof: { focus: 6, aperture: 5, maxCoc: 22 },
    look: { exposure: 1, contrast: 1.03, saturation: 1.06, lift: col('#000000'), vignette: .3, grain: 0, ca: .1 } });
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither (no shimmer)
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera, R = film.renderer;
  cam.setViewOffset(W, H, 0, VS * H, W, H);

  // ---------------------------------------------------------------- materials: world-space mud brick / packed earth with real relief
  let mid = 0;
  function texM(base, { brick = 0, scale = 1, amp = .9, rough = .96, grime = 0 } = {}) {
    const m = new THREE.MeshStandardMaterial({ color: base, roughness: rough }), id = ++mid;
    m.onBeforeCompile = sh => {
      sh.uniforms.uBrick = { value: brick }; sh.uniforms.uSc = { value: scale }; sh.uniforms.uAmp = { value: amp }; sh.uniforms.uGrime = { value: grime };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
        .replace('#include <project_vertex>', `#include <project_vertex>
          { vec4 wp = vec4(transformed, 1.); vec3 wn = objectNormal;
            #ifdef USE_INSTANCING
            wp = instanceMatrix * wp; wn = mat3(instanceMatrix) * wn;
            #endif
            vWP = (modelMatrix * wp).xyz; vWN = normalize(mat3(modelMatrix) * wn); }`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vWP; varying vec3 vWN; uniform float uBrick, uSc, uAmp, uGrime; float gH; ${NOISE}
        float hgt(vec2 q){ q *= uSc; float n = fb(q * 1.3) * .62 + fb(q * 5.7) * .38;
          if (uBrick < .5) return n;
          if (uBrick > 1.5) {   // flagstones: irregular cells (Voronoi border distance), worn edges
            vec2 c = q * 1.15 + (vec2(fb(q * .9), fb(q * .9 + 5.)) - .5) * .5, ic = floor(c), fc = fract(c); float d1 = 8., d2 = 8.; vec2 best = ic;
            for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){ vec2 g = vec2(x, y), o = vec2(hh(ic + g), hh(ic + g + 17.)), r = g + o - fc; float d = dot(r, r); if (d < d1){ d2 = d1; d1 = d; best = ic + g; } else if (d < d2) d2 = d; }
            float e = sqrt(d2) - sqrt(d1); return mix(.7, 1., smoothstep(.0, .03, e + (vn(q * 7.) - .5) * .012)) * (.6 + .1 * hh(best + .3)) + n * .24; }
          // mud brick under worn plaster: courses of uneven height, the brick shows only where the plaster has fallen
          float rowW = q.y + (fb(q * vec2(.35, .1)) - .5) * .34; vec2 b = vec2(q.x, rowW) / vec2(.5, .21); float row = floor(b.y); b.x += hh(vec2(row, 2.)) * 3. + (vn(vec2(q.x * .8, row)) - .5) * .5; vec2 id = floor(b), f = fract(b);
          float e = min(min(f.x, 1. - f.x) * 2.2, min(f.y, 1. - f.y)) + (vn(q * 8.) - .5) * .16 + uGrime * (vn(q * 3.7) - .5) * .36;
          float br = mix(.5, 1., smoothstep(.0, .18, e)) * (.72 + .28 * hh(id + .7)) * .72 + n * .34, patchy = smoothstep(.42, .62, fb(q * .42 + 4.)), pl = n * .78 + .12;
          return mix(pl, br, patchy); }`)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 Nw = normalize(vWN); vec2 q = abs(Nw.y) > .7 ? vWP.xz : (abs(Nw.x) > abs(Nw.z) ? vWP.zy : vWP.xy);
            gH = hgt(q); float big = fb(q * .17 + 3.1);
            diffuseColor.rgb *= (.64 + .46 * gH) * mix(.66, 1.22, big);
            if (uBrick > 1.5) diffuseColor.rgb *= mix(1., .3, smoothstep(1.5, 8., length(vWP.xz)));
            if (uGrime > 0.) diffuseColor.rgb *= 1. - uGrime * (.5 * smoothstep(.35, .7, fb(vec2(q.x * 2.4, q.y * .32) + 7.)) + .3 * (1. - smoothstep(.0, 1.5, q.y))); }`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
          { vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition), r1 = cross(sy, normal), r2 = cross(normal, sx); float det = dot(sx, r1);
            vec3 gr = sign(det) * (dFdx(gH) * r1 + dFdy(gH) * r2), nn = abs(det) * normal - uAmp * .05 * gr; if (abs(det) > 1e-9 && dot(nn, nn) > 1e-18) normal = normalize(nn); }`);
    };
    m.customProgramCacheKey = () => 'bwr-' + id; return m; }
  const grey = hex => { const c = new THREE.Color(hex); const l = Math.pow(.3 * Math.pow(c.r, 1 / 2.2) + .59 * Math.pow(c.g, 1 / 2.2) + .11 * Math.pow(c.b, 1 / 2.2), 1); const v = Math.round(l * 255).toString(16).padStart(2, '0'); return '#' + v + v + v; };
  // the people's cloth: nearly black, read by a rim of light from the shot's source (silhouettes, never lit dolls)
  const RIM = { pos: { value: V(0, 1, 0) }, k: { value: .6 }, col: { value: new THREE.Color('#ffffff') }, dark: { value: .13 } };
  const cloth = (hex, rimMul = 1) => { const m = K.std(hex, { roughness: .96, side: THREE.DoubleSide });
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, { uRimP: RIM.pos, uRimK: RIM.k, uRimC: RIM.col, uDarkK: RIM.dark, uRimM: { value: rimMul } });
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uRimP, uRimC; uniform float uRimK, uDarkK, uRimM;')
        .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= uDarkK;')
        .replace('#include <aomap_fragment>', '#include <aomap_fragment>\n{ float spK = min(1., uDarkK * 2.); reflectedLight.directSpecular *= spK; reflectedLight.indirectSpecular *= spK; }')
        .replace('#include <opaque_fragment>', `{ vec3 Vv = normalize(vViewPosition), Rd = normalize(uRimP + vViewPosition + vec3(0., 1e-4, 0.)); float fr = pow(max(1. - clamp(abs(dot(normal, Vv)), 0., 1.), 1e-4), 5.2), sd = smoothstep(.0, .75, dot(normal, Rd)), rk = uRimK * uRimM * fr * sd * smoothstep(.025, .14, fr); if (rk >= 0. && rk < 10.) outgoingLight += uRimC * rk; }
          #include <opaque_fragment>`); };
    m.customProgramCacheKey = () => 'bwr-cloth'; return m; };
  const setRim = (world, k, c = '#ffffff', dark = .13) => { RIM.pos.value.copy(world).applyMatrix4(cam.matrixWorldInverse); RIM.k.value = k; RIM.col.value.set(c); RIM.dark.value = dark; };
  const faceM = cloth('#0b0b0b', 0), beardM = cloth('#0c0c0c', 0);
  const M = { wall: texM('#7f7f7f', { brick: 1, amp: .26 }), wall2: texM('#6a6a6a', { brick: 1, scale: 1.15, amp: .26 }), plaster: texM('#a0a0a0', { amp: .55 }), floor: texM('#5e5e5e', { amp: .7 }),
    paving: texM('#626262', { brick: 2, scale: .42, amp: .2 }), earth: texM('#4c4c4c', { scale: .8, amp: 1.2 }), dark: K.std('#090909', { roughness: 1 }), beam: K.std('#191919', { roughness: 1 }),
    wood: K.std('#242424', { roughness: .9 }), bark: texM('#2e2e2e', { scale: 2.3, amp: 1.5 }), leaf: K.std('#0a0a0a', { roughness: 1 }), clay: K.std('#4a4a4a', { roughness: .8 }) };
    const robes = ['#3f3f3f', '#565656', '#343434', '#646464', '#4a4a4a', '#2c2c2c', '#5c5c5c'].map(c => cloth(c)), cloths = ['#2a2a2a', '#4e4e4e', '#3a3a3a', '#6c6c6c'].map(c => cloth(c, .16));
  const MP = cloth(grey('#a58f6f')), MPc = cloth(grey('#3b4f6b'), .16), MJ = cloth(grey('#c8b694')), MJc = cloth(grey('#8a7a66'), .16);

  M.alley = texM('#5a5a5a', { brick: 1, amp: .5, grime: 1 }); M.alley2 = texM('#4b4b4b', { brick: 1, scale: 1.15, amp: .5, grime: 1 });
  // Round 3 (main session): the film's approved body, people3d robeMan, as in every other scene: loose robe with real drape, natural
  // shoulders, tied head cloth and beard (headwear), walk/idle/IK. The hem is lifted a little so the legs show. poseM only records the
  // leg joints for the measurement.
  const poseM = (g, Q = {}) => { P.pose(g, Q); const U = g.userData; if (U.kind !== 'stand' || !U.legs.length) return; const sc = U.s, bob = Q.bob || 0, F = Q.feet || [{ u: .06 * sc, lift: 0 }, { u: -.04 * sc, lift: 0 }];
    U.legs.forEach((L, i) => { const f = F[i], H = V(L.sd * .095 * sc, U.hipY + bob - .04 * sc, .02 * sc), An = V(L.sd * .1 * sc + (f.x || 0), U.ank + (f.lift || 0), -f.u), r = P.ik2(H, An, U.lt, U.ls, V(0, 0, -1)); L.H = H; L.E = r[0]; L.A = r[1]; }); };
  // a turn on the feet: each foot lifts and steps in its turn, the planted one stays in the world (optional start stance fs)
  const rotY = (x, z, a) => [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
  function stepTurn(g, p0, p1, ry0, ry1, k, fs) { const sc = g.userData.s, e = sine(k), ry = ry0 + angDiff(ry0, ry1) * e, x = lerp(p0[0], p1[0], e), z = lerp(p0[1], p1[1], e), rest = [[-.1 * sc, -.09 * sc], [.1 * sc, .07 * sc]];
    const start = fs ? fs.map((f, i) => [(i ? 1 : -1) * .1 * sc + (f.x || 0), -f.u]) : rest;
    const feet = [0, 1].map(i => { const A0 = rotY(start[i][0], start[i][1], ry0), A1 = rotY(rest[i][0], rest[i][1], ry1), kk = i ? clamp((k - .42) / .58) : clamp(k / .58), ke = sine(kk), wx = lerp(p0[0] + A0[0], p1[0] + A1[0], ke), wz = lerp(p0[1] + A0[1], p1[1] + A1[1], ke), L = rotY(wx - x, wz - z, -ry);
      return { u: -L[1], x: L[0] - (i ? 1 : -1) * .1 * sc, lift: Math.sin(kk * Math.PI) * .055 * sc, pitch: 0 }; });
    g.position.set(x, 0, z); g.rotation.y = ry; return { feet, e, ry }; }
  const person = (o = {}) => { const rm = o.mat || robes[0], cm = o.cloth || cloths[0];
    if (o.veil) { const g = P.robeMan({ h: o.h || 1.6, broad: o.broad || 1, mat: rm, cloth: cm, face: faceM, head: 'veil', kind: 'stand' }); g.userData.ph = o.ph ?? .3; return g; }
    const g = P.robeMan({ h: o.h || 1.74, broad: o.broad || 1, mat: rm, cloth: cm, face: faceM, head: 'cloth', kind: o.kind || 'stand' }), U = g.userData;
    if (o.bare) P.headwear(g, 'bare', { dark: beardM }); else if (!o.noBeard) P.headwear(g, 'cloth', { dark: beardM });
    U.ph = o.ph ?? .3; U.b = o.broad || 1;
    if (U.skirt) { const k = .8, top = .99 * U.s; U.skirt.scale.set(.76, k, .76); U.skirt.position.y = top * (1 - k); }   // the hem at the shin: legs and feet show
    U.mantY = .62; U.shoulders.children[0].scale.y = U.mantY;
    if (!o.bare) { const nc = U.neck.children; nc[3].scale.set(.72, .8, .8); nc[2].scale.z = 2; }
    { const nk = new THREE.Mesh(new THREE.CylinderGeometry(.05 * U.s, .06 * U.s, .13 * U.s, 10), faceM); nk.position.y = .03 * U.s; nk.castShadow = true; U.neck.add(nk); }
    U.neck.traverse(q => { if (q.isMesh && q.material === rm) q.material = cm; });
    return g; };
  const place = (parent, g, x, z, ry) => { g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g); return g; };
  const toLocal = (g, w) => { g.updateMatrix(); return w.clone().applyMatrix4(g.matrix.clone().invert()); };
  const box = (parent, w, h, d, x, y, z, m, ry = 0) => { const b = new THREE.Mesh(K.roundedBox(w, h, d, Math.min(.05, h * .2), 2), m); b.position.set(x, y, z); b.rotation.y = ry; b.castShadow = b.receiveShadow = true; parent.add(b); return b; };
  const plane = (parent, w, d, m, y = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); p.rotation.x = -Math.PI / 2; p.position.y = y; p.receiveShadow = true; parent.add(p); return p; };

  // Peter and Jesus: one body each, carried from set to set (the same man in every shot)
  const PETER = person({ h: 1.78, broad: 1.14, mat: MP, cloth: MPc, ph: .13 }), JESUS = person({ h: 1.75, broad: 1, mat: MJ, cloth: MJc, noBeard: true, ph: .61 });
  S.add(PETER, JESUS);

  // ---------------------------------------------------------------- fire: a flame card with its own moving noise; coals; embers; haze
  const flameG = new THREE.PlaneGeometry(1, 1);
  const flameMat = (seed, k = 1) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { time: { value: 0 }, seed: { value: seed }, k: { value: k } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec2 vUv; uniform float time, seed, k; ${NOISE}
      void main(){ vec2 p = vec2(vUv.x * 2. - 1., vUv.y); float y = clamp(p.y, 0., 1.);
        float n = fb(vec2(p.x * 2.1 + seed * 7., y * 2.2 - time * 1.9 + seed)), m = fb(vec2(p.x * 4.3 - seed, y * 4. - time * 3.1));
        float x = p.x + (n - .5) * .62 * y + (m - .5) * .2 * y;
        float w = mix(.46, .02, pow(y, .8)) * (.82 + .36 * n), b = smoothstep(w, w * .22, abs(x)) * smoothstep(0., .07, y) * (1. - smoothstep(.72 + .2 * n, 1., y));
        vec3 c = mix(vec3(1., .3, .035), vec3(1., .62, .17), smoothstep(.25, .95, b)) * (b * b) * 3.6 * k;
        c += vec3(1., .3, .05) * exp(-dot(p - vec2(0., .28), p - vec2(0., .28)) * 7.) * .12 * k;
        gl_FragColor = vec4(c, 1.); }` });
  const allFlames = [];
  const flame = (parent, w, h, seed, k = 1) => { const f = new THREE.Mesh(flameG, flameMat(seed, k)); f.scale.set(w, h, 1); f.userData.k0 = k; f.frustumCulled = false; f.renderOrder = 5; parent.add(f); allFlames.push(f); return f; };
  const camQ = new THREE.Quaternion();
  const wq = new THREE.Quaternion();
  const tickFlames = t => { cam.updateMatrixWorld(); cam.getWorldQuaternion(camQ);
    for (const f of allFlames) { f.material.uniforms.time.value = t; f.parent.getWorldQuaternion(wq); f.quaternion.copy(wq.invert().multiply(camQ)); } };
  // a soft halo (the highlight's film halation around each small source)
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.18, 'rgba(255,255,255,.42)'); r.addColorStop(.5, 'rgba(255,255,255,.1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const halo = (parent, s, color, k) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: col(color, k), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })); sp.scale.set(s, s, 1); sp.renderOrder = 6; parent.add(sp); return sp; };
  // embers: pure functions of t in the vertex shader; a steady emission (one every ~.08 s), no bursts
  const EMB = 16, emG = new THREE.BufferGeometry(), emS = new Float32Array(EMB * 4); { const r = rng(917); for (let i = 0; i < emS.length; i++) emS[i] = r(); }
  emG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(EMB * 3), 3)); emG.setAttribute('aS', new THREE.BufferAttribute(emS, 4));
  const emM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { time: { value: 0 }, amt: { value: 1 }, ps: { value: H / 1920 } },
    vertexShader: `attribute vec4 aS; uniform float time, amt, ps; varying float vA; void main(){ float life = 2.6 + aS.w * 1.5, ph = fract(time / life + aS.x), a = aS.y * 6.283;
      vec3 p = position + vec3(cos(a) * (.04 + .16 * aS.z), .2, sin(a) * (.04 + .16 * aS.z)); p.y += ph * (.42 + .5 * aS.z);
      p.x += sin(ph * 6. + aS.x * 9.) * .12 * ph + ph * .14; p.z += cos(ph * 5. + aS.y * 7.) * .1 * ph;
      vA = sin(ph * 3.14159) * (.45 + .55 * aS.w) * amt; vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = ps * (2.6 + 3.6 * aS.z) * 6. / max(1., -mv.z); }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - .5) * 2.; float a = smoothstep(1., .1, d) * vA; gl_FragColor = vec4(vec3(1., .42, .08) * a * 3.2, 1.); }` });
  const embers = new THREE.Points(emG, emM); embers.frustumCulled = false; embers.renderOrder = 7;
  // haze: a few big soft cards, fixed noise drifting slowly (no flicker)
  const hazeMat = seed => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide, uniforms: { time: { value: 0 }, seed: { value: seed }, a: { value: .1 }, tone: { value: new THREE.Color(1, 1, 1) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec2 vUv; uniform float time, seed, a; uniform vec3 tone; ${NOISE}
      void main(){ vec2 p = vUv * 2. - 1.; float r = 1. - smoothstep(.35, 1., length(p)); float n = fb(vUv * 2.6 + vec2(time * .035 + seed, -time * .05 + seed * 2.)); n = smoothstep(.33, .78, n);
        gl_FragColor = vec4(tone * n * r * a, 1.); }` });
  const hazes = Array.from({ length: 7 }, (_, i) => { const h = new THREE.Mesh(flameG, hazeMat(i * 3.7 + 1)); h.frustumCulled = false; h.renderOrder = 4; h.visible = false; S.add(h); return h; });
  // layout: [[x, y, z, size], …], amt, tone (grey unless the fire tints it)
  const setHaze = (t, list, amt, tone = '#ffffff', flat = false) => { hazes.forEach((h, i) => { const q = list[i]; h.visible = !!q && amt > 0; if (!q) return;
    h.position.set(q[0] + Math.sin(t * .11 + i) * .25, q[1] + Math.sin(t * .09 + i * 2) * .1, q[2]); h.scale.set(q[3], q[3] * .62, 1); if (flat) h.quaternion.identity(); else h.quaternion.copy(camQ);
    h.material.uniforms.time.value = t; h.material.uniforms.a.value = amt; h.material.uniforms.tone.value.set(tone); }); };

  // ---------------------------------------------------------------- the light pool (fixed counts, so no shader recompiles between sets)
  const key = new THREE.SpotLight('#ffffff', 0, 60, 1, .6, 1.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0005; key.shadow.normalBias = .025; key.shadow.radius = 5; key.shadow.camera.near = .12; key.shadow.camera.far = 70; S.add(key, key.target);
  const pts = [0, 1, 2, 3].map(() => { const l = new THREE.PointLight('#ffffff', 0, 20, 1.7); S.add(l); return l; });
  const hemi = new THREE.HemisphereLight('#ffffff', '#1c1c1c', .1); S.add(hemi);
  const sky = K.sky(film, { top: col('#000000'), mid: col('#000000'), horizon: col('#000000'), radius: 500 });
  const lampPool = Array.from({ length: 18 }, () => ({ pos: V(), color: col(FIRE), power: 0, size: .2, fog: 1 }));
  function light({ k, p = [], h = .1, fog = [.02, .12], fogC = .25, skyC = ['#000000', '#000000', '#000000'], skyK = 1, lamps = [] }) {
    if (k) { key.position.copy(k.pos); key.target.position.copy(k.at); key.target.updateMatrixWorld(); key.color.set(k.c || SILVER); key.intensity = k.I; key.angle = k.a ?? .7; key.penumbra = k.pen ?? .6; key.distance = k.d ?? 60; key.decay = k.dec ?? 1.5; } else key.intensity = 0;
    pts.forEach((l, i) => { const q = p[i]; if (!q) { l.intensity = 0; l.position.set(0, -50, 0); return; } l.position.copy(q.pos); l.color.set(q.c || FIRE); l.intensity = q.I; l.distance = q.d ?? 18; });
    hemi.intensity = h; const A = film.atmos; A.density = fog[0]; A.falloff = fog[1]; A.color.set('#8c8c8c').multiplyScalar(fogC); A.colorUp.set('#9a9a9a').multiplyScalar(fogC * .85);
    sky.u.top.value.set(skyC[0]).multiplyScalar(skyK); sky.u.mid.value.set(skyC[1]).multiplyScalar(skyK); sky.u.horizon.value.set(skyC[2]).multiplyScalar(skyK);
    film.lamps.length = 0; lamps.slice(0, lampPool.length).forEach((q, i) => { const L = lampPool[i]; L.pos.copy(q.pos); L.color.set(q.c || FIRE); L.power = q.power; L.size = q.size ?? .2; film.lamps.push(L); });
  }
  function shoot(pos, at, fov, focus, ap, roll = 0) { cam.position.copy(pos); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(at); if (cam.fov !== fov) cam.fov = fov; film.dofCfg.focus = focus; film.dofCfg.aperture = ap; }

  // ---------------------------------------------------------------- walking from A to B on planted feet (time-warped gait)
  function stepper(a, b, t0, t1, g, { minSteps = 2 } = {}) {
    const D = Math.hypot(b[0] - a[0], b[1] - a[1]); let n = Math.max(minSteps, Math.round(D / .58)); if (n % 2) n++;
    const L = D / n, Tg = Math.max(.82, Math.min(1.4, 2 * (t1 - t0) / n * .86)), tMax = n * Tg / 2, e = .26, vm = 1 / (1 - e);
    const W = u => u <= 0 ? 0 : u >= 1 ? 1 : u < e ? vm * u * u / (2 * e) : u < 1 - e ? vm * (u - e / 2) : 1 - vm * (1 - u) * (1 - u) / (2 * e);
    return t => { const k = W((t - t0) / (t1 - t0)), w = P.walk(g, k * tMax, 0, { T: Tg, L }), d = k * D; return { x: a[0] + (b[0] - a[0]) * (d / (D || 1)), z: a[1] + (b[1] - a[1]) * (d / (D || 1)), w, moving: k > 0 && k < 1, k }; };
  }
  // a standing body at rest with breathing, keeping the feet where they are
  const rest = (g, t, feet, extra = {}) => { const id = P.idle(t, g.userData.ph, { s: g.userData.s }); return { ...id, feet: feet || id.feet, ...extra }; };

  // ================================================================ R1: the upper room
  const ROOM = new THREE.Group(); S.add(ROOM);
  { plane(ROOM, 9, 18, M.floor).position.z = 2; const wb = box(ROOM, 9, 4.6, .3, 0, 2.3, -4.05, M.plaster);
    for (const sx of [-1, 1]) box(ROOM, .3, 4.6, 18, sx * 3.5, 2.3, 3, M.plaster); box(ROOM, 9, .2, 18, 0, 3.75, 3, M.beam);
    for (let i = 0; i < 6; i++) box(ROOM, .18, .2, 9.6, -3 + i * 1.2 + .1, 3.55, -.4, M.beam).rotation.y = Math.PI / 2 * 0;
    // a niche and a shelf: the wall has things on it, not a flat plate
    box(ROOM, .9, .08, .22, -1.9, 1.5, -3.86, M.wood); box(ROOM, .16, .24, .16, -2.1, 1.66, -3.86, M.clay); box(ROOM, .12, .18, .12, -1.75, 1.63, -3.86, M.clay);
    box(ROOM, .62, .9, .06, 1.95, 1.75, -3.89, M.dark);
    box(ROOM, 1.5, .3, .78, 0, .15, -.95, M.wood); }
  const lampBody = new THREE.Mesh(new THREE.SphereGeometry(.075, 14, 10), M.clay); lampBody.scale.set(1.4, .5, 1); lampBody.position.set(0, .335, -.95); lampBody.castShadow = false; ROOM.add(lampBody);
  const lampF = flame(ROOM, .12, .24, 1.3, .95); const lampH = halo(ROOM, .95, FIRE, .3);
  const seated = [[-1.0, .28], [.98, .36], [-1.55, -.9], [1.62, -.72], [-1.15, -2.15], [1.0, -2.25]].map(([x, z], i) => { const g = person({ h: 1.66 + (i * 37 % 5) * .045, broad: .95 + (i % 3) * .08, bare: i === 2, kind: 'sit', mat: robes[i % robes.length], cloth: cloths[i % cloths.length], ph: i * .17 + .1 });
    return place(ROOM, g, x, z, face(-x, -.95 - z)); });
  const JR = [1.32, -1.32], PR = [.05, -2.12];   // where Jesus sits (turned away, toward Peter), where Peter kneels

  function shotRoom(t, T) {
    const u = clamp((t - T.start) / (T.N142 - T.start)), e = lerp(u, sine(u), .35);
    const dip = ss(T.dip[0], T.dip[1], t), fl = .88 + .12 * wob(t, 7.1, 11.3), dipF = 1 - .62 * Math.pow(Math.sin(Math.PI * clamp((t - T.dip[0]) / 1.7)), 2);
    const flY = .395, lx = .03 * Math.sin(t * 2.3);
    lampF.position.set(lx, flY + .1 * lerp(1, .68, dip), -.95); lampF.scale.set(.12, .24 * lerp(1, .62, dip) * (.9 + .1 * fl), 1); lampF.material.uniforms.k.value = lerp(.95, .7, dip) * dipF;
    lampH.position.set(lx, flY + .07, -.95); lampH.material.color.set(FIRE).multiplyScalar(.15 * lerp(1, .6, dip));
    // the shadow's source creeps low and toward him (a film cheat): the shadow climbs the wall and grows
    const kp = V(lx, lerp(.5, .3, dip), lerp(-.95, -1.38, dip)), I = lerp(15, 17, dip) * fl * (.82 + .18 * dipF);
    light({ k: { pos: kp, at: V(.05, lerp(1.8, 2.4, dip), -3.9), I, a: 1.18, pen: .5, d: 8, dec: 1.35, c: '#ffe2c8' },
      p: [{ pos: V(lx, .62, -.75), I: .55 * fl * lerp(1, .68, dip), d: 5.5, c: '#ffb070' }, { pos: V(0, 2.8, 3.6), I: 1.1, d: 11, c: '#d9d9d9' }],
      h: .025, fog: [.03, .1], fogC: .06, lamps: [{ pos: V(lx, flY + .08, -.95), power: lerp(.13, .08, dip) * fl * dipF, size: .12 }] });
    // seated shapes: breathing, heads to the lamp, then to Peter when he stands
    const look = ss(T.rise[0], T.rise[1], t);
    seated.forEach((g, i) => { const b = P.breath(t, g.userData.ph), dx = PR[0] - g.position.x, dz = PR[1] - g.position.z, yaw = clamp(angDiff(g.rotation.y, face(dx, dz)), -.7, .7);
      const l2 = ss(T.rise[0] + i * .1, T.rise[1] + i * .1, t);
      poseM(g, { breath: b, lean: -.06 - .02 * Math.sin(t * .3 + i), head: [-.05 + .05 * l2, yaw * l2 + .04 * Math.sin(t * .23 + i)], hands: [V(-.14, .36, -.32), V(.14, .36, -.32)], handsW: [.9, .9] }); });
    // Jesus, among them, turned away from us toward Peter
    JESUS.visible = true; JESUS.position.set(JR[0], 0, JR[1]); JESUS.rotation.y = face(PR[0] - JR[0], PR[1] - JR[1]) ; const kj = { bob: -.47 * JESUS.userData.s, feet: [{ u: -.33 * JESUS.userData.s, lift: 0 }, { u: -.36 * JESUS.userData.s, lift: 0 }] };
    poseM(JESUS, { ...kj, lean: -.05, breath: P.breath(t, .61), head: [.02, 0], hands: [V(-.15, .46, -.28), V(.15, .46, -.28)], handsW: [.85, .85] });
    // Peter: from sitting back on his heels to his feet, on the vow; the hand comes to his chest
    const kr = ss(T.rise[0], T.rise[1], t), krE = kr * kr * (3 - 2 * kr), prD = Math.hypot(.2, 1);
    PETER.visible = true; PETER.position.set(PR[0] + .2 / prD * .22 * krE, 0, PR[1] + 1 / prD * .22 * krE); PETER.rotation.y = face(.2, 1);
    const pr = P.kneelRise(kr, PETER.userData.s); pr.feet[1].lift = Math.sin(Math.PI * kr) * .05 * PETER.userData.s; const v = ss(T.vow[0], T.vow[1], t), s = PETER.userData.s;
    poseM(PETER, { ...pr, breath: P.breath(t, .13) * (1 + .5 * v), side: .02 * Math.sin(t * .4), head: [lerp(-.14, .03, kr), .06 * Math.sin(t * .3)],
      hands: [V(-.15, .47 + pr.bob * .2, -.26), V(.04 * s, 1.26 * s + (pr.bob || 0), -.2 * s)], handsW: [(1 - ss(.05, .8, kr)) * .85, v] });
    shoot(V(lerp(.16, .08, e), lerp(1.12, 1.04, e), lerp(6.1, 4.9, e)), V(.02, 1.3, -2.6), 38, lerp(8.2, 7, e), 2.6);
    cam.updateMatrixWorld(); setRim(V(lx, 1.7, -3.4), lerp(.3, .85, dip), '#f2e6da', .0007);
  }

  // ================================================================ R2: the garden of olives at night
  const GARDEN = new THREE.Group(); S.add(GARDEN);
  const R0 = rng(4410);
  plane(GARDEN, 140, 140, M.earth);
  function olive(x, z, h, seed, tr = 1) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = seed * .7; GARDEN.add(g); const r = rng(seed);
    const geo = new THREE.CylinderGeometry(.13 * tr, .46 * tr, 2.7, 12, 11), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const px = p.getX(i), py = p.getY(i) + 1.35, pz = p.getZ(i), a = Math.atan2(pz, px), uu = clamp(py / 2.7), prof = (.1 + .36 * Math.pow(1 - uu, 2.6)) / lerp(.46, .13, uu), fd = 1 - .75 * uu, f = prof * (1 + fd * (.3 * Math.sin(a * 3 + py * 2.2 + seed) + .14 * Math.sin(a * 7 - py * 3.1 + seed * 2)));
      p.setXYZ(i, px * f + Math.sin(py * 1.5 + seed) * .22 * py * .6, py, pz * f + Math.cos(py * 1.3 + seed) * .18 * py * .6); }
    geo.computeVertexNormals(); const tm = new THREE.Mesh(geo, M.bark); tm.castShadow = tm.receiveShadow = true; g.add(tm);
    const t2 = K.tree({ seed, height: h, trunk: .12 * tr, depth: 5, spread: .78, up: .25, twig: 0, mat: M.bark, layer: 0 }); t2.position.y = 1.5; g.add(t2); t2.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const n = 190, ig = new THREE.IcosahedronGeometry(.17, 0), inst = new THREE.InstancedMesh(ig, M.leaf, n), m4 = new THREE.Matrix4(), lobes = Array.from({ length: 7 }, () => { const a = r() * 6.283, rr = (.25 + r() * .75) * h * .46; return [Math.cos(a) * rr, h * (.74 + r() * .42), Math.sin(a) * rr, .5 + r() * .55]; });
    for (let i = 0; i < n; i++) { const L = lobes[i % lobes.length], u = r() * 6.283, v = Math.acos(2 * r() - 1), d = Math.cbrt(r()) * L[3] * 1.25; m4.compose(V(L[0] + Math.sin(v) * Math.cos(u) * d, L[1] + Math.cos(v) * d * .62, L[2] + Math.sin(v) * Math.sin(u) * d), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)), V(1.3, .34, .7).multiplyScalar(.7 + r() * .9)); inst.setMatrixAt(i, m4); }
    inst.castShadow = true; g.add(inst); return g; }
  { const spots = [[-5.4, 3.2, 4.9], [8.8, 3.1, 5.2], [-9.6, 5.4, 4.6], [6.8, 1.0, 5], [-8.4, .6, 5.3], [-3.4, -9.2, 5.4], [4.6, -12.5, 5.6], [-6.8, -6.2, 5.1], [7.8, -7.4, 5.3], [-1.2, -13.4, 5.2], [10.2, -13, 5.4], [-10, -12.4, 5.4], [1.9, -17.5, 5.6], [-5.2, -17, 5.2], [8.2, -19, 5.6], [-11, -20, 5.4], [13.8, -7.2, 5.2], [-14, -5, 5.4], [14, 1.2, 5.2], [-13.2, 3.4, 5.1]];
    spots.forEach(([x, z, h], i) => olive(x, z, h, 40 + i * 3, 1 + (i < 5 ? .4 : 0))); }
  // the men with torches: they walk through the trunks and gather in a loose arc behind the servant
  const TC = V(.4, 0, -4.5), DIRW = [-.5, .866];
  const torchMen = Array.from({ length: 13 }, (_, i) => { const r = rng(610 + i), a = -Math.PI * (.05 + .9 * (i + (r() - .5) * .6) / 12), rad = 3.5 + r() * 2.3, sx = TC.x + Math.cos(a) * rad, sz = TC.z + Math.sin(a) * rad;
    const g = person({ h: 1.62 + r() * .24, broad: .92 + r() * .26, bare: i % 5 === 2, mat: robes[i % robes.length], cloth: cloths[(i + 1) % cloths.length], ph: r() });
    GARDEN.add(g); const stick = new THREE.Mesh(new THREE.CylinderGeometry(.018, .026, .86, 6), M.wood); stick.castShadow = true; g.add(stick); const f = flame(g, .24, .44, r() * 9, .85), hs = halo(g, .95, FIRE, .13);
    const dist = 5.2 + r() * 2.4, t0Off = r() * .9, stop = [sx, sz], start = [sx - DIRW[0] * dist, sz - DIRW[1] * dist];
    return { g, stick, f, hs, stop, start, t0Off, r: r() * 6.28, i }; });
  const SERV = person({ h: 1.7, mat: robes[3], cloth: cloths[2], ph: .47 }); GARDEN.add(SERV);
  // the sword: a short blade, a guard and a grip, drawn from the hand's own position every frame
  const SW = new THREE.Group(); GARDEN.add(SW);
  const bladeM = new THREE.MeshStandardMaterial({ color: '#d9d9d9', metalness: .85, roughness: .24, emissive: '#b8b8b8', emissiveIntensity: .25 });
  const edgeM = new THREE.MeshBasicMaterial({ color: col('#ffffff', 1.6), fog: false });
  { const bg = new THREE.CylinderGeometry(.0015, .024, .62, 4); bg.translate(0, .31, 0); const b = new THREE.Mesh(bg, bladeM); b.scale.z = .24; b.castShadow = true; SW.add(b);
    const eg = new THREE.BoxGeometry(.0022, .6, .003); eg.rotateZ(.0365); eg.translate(.0125, .305, 0); const e1 = new THREE.Mesh(eg, edgeM); SW.add(e1);
    const gd = new THREE.Mesh(new THREE.BoxGeometry(.13, .018, .03), M.wood); SW.add(gd); const gp = new THREE.Mesh(new THREE.CylinderGeometry(.016, .018, .11, 8), M.wood); gp.position.y = -.06; SW.add(gp); }
  const flashS = halo(SW, .62, '#ffffff', 0); flashS.position.y = .42;
  const PG = [-.35, -3.9], SG = [.95, -4.3], JG0 = [2.1, -3.0], JG1 = [.42, -3.6];
  let PGR = face(SG[0] - PG[0], SG[1] - PG[1]);
  // the servant's flinch (N143 on) and his crouch by N145
  function poseServant(t, T) { const g = SERV; g.visible = true; g.position.set(SG[0], 0, SG[1]); g.rotation.y = face(PG[0] - SG[0], PG[1] - SG[1]);
    const fl = ss(T.strike[1] - .06, T.strike[1] + .5, t), cr = ss(T.lower[0] - .6, T.lower[0] + 1.2, t), rel = ss(T.reach[1] + .2, T.reachOff[1], t), s = g.userData.s;
    const bob = -.16 * fl * (1 - .2 * cr) - .2 * cr * (1 - .25 * rel), lean = .12 * fl - .34 * cr + .1 * rel, id = P.idle(t, g.userData.ph, { s });
    const hand = V(.16 * s, 1.5 * s + bob, -.05 * s);
    poseM(g, { ...id, feet: [{ u: .12 * s - .1 * fl, lift: 0 }, { u: -.14 * s, lift: 0 }], bob, lean, side: -.06 * fl, head: [-.1 * fl - .3 * cr * (1 - rel), -.1 * fl], hands: [null, hand], handsW: [0, Math.max(fl, cr) * (1 - rel * .9)] }); }
  // Peter in the garden: draws, raises, strikes; holds; lowers
  function posePeterSword(t, T) { const g = PETER, s = g.userData.s; g.visible = true; g.position.set(PG[0], 0, PG[1]); g.rotation.y = PGR;
    const hx = kf(t, [[T.draw[0], .3], [T.draw[1], .16], [T.raise[1], .22], [T.strike[1], .15], [T.strike[1] + .5, .2], [T.lower[0], .22], [T.lower[1], .3]]) * s;
    const hy = kf(t, [[T.draw[0], .92], [T.draw[1], 1.22], [T.raise[1], 1.8], [T.strike[0], 1.86], [T.strike[1], 1.14], [T.strike[1] + .5, 1.2], [T.cutBlade + .5, 1.34], [T.lower[0], 1.32], [T.lower[1], .9]]) * s;
    const hz = kf(t, [[T.draw[0], -.08], [T.draw[1], -.28], [T.raise[1], -.1], [T.strike[0], -.02], [T.strike[1], -.6], [T.strike[1] + .5, -.5], [T.cutBlade + .5, -.5], [T.lower[0], -.5], [T.lower[1], -.26]]) * s;
    const b = t > T.strike[1] ? clamp(t - T.strike[1]) * (1 - ss(T.lower[0], T.lower[1], t)) : 0;   // he is shaking after the blow
    const trem = b * .012, hand = V(hx + trem * wob(t, 31, 23), hy + trem * wob(t, 27, 19, 1), hz + trem * wob(t, 37, 29, 2));
    const strikeL = ss(T.strike[0], T.strike[1], t) * (1 - ss(T.lower[0], T.lower[1], t)), bl = t < T.strike[0] ? ss(T.draw[0], T.draw[1], t) : 1;
    const feet = [{ u: lerp(.09, .3, ss(T.strike[0] - .1, T.strike[1], t)) * s, lift: 0 }, { u: -.14 * s, lift: 0 }];
    poseM(g, { ...P.idle(t, .13, { s }), feet, bob: -.03 * strikeL, lean: lerp(-.02, -.2, strikeL), twist: -.1 * strikeL, side: 0, breath: .5 + .5 * Math.sin(t * (2.1 + b)), head: [-.08 * strikeL - .16 * ss(T.lower[0], T.lower[1], t), .1 * ss(T.lower[1], T.lower[1] + 1, t)], hands: [null, hand], handsW: [0, bl] });
    g.updateMatrix(); const hw = P.handAt(g, 1).applyMatrix4(g.matrix), U = g.userData, E = U.arms[1].E.clone().applyMatrix4(U.upper.matrix).applyMatrix4(g.matrix);
    // the blade goes on from the fist: its pitch is keyed (up on the raise, forward at the strike, down at rest), roll fixed
    const pitch = kf(t, [[T.draw[0], 2.5], [T.draw[1], 1.05], [T.raise[1], -.25], [T.strike[0], -.4], [T.strike[1], 1.72], [T.strike[1] + .5, 1.34], [T.cutBlade + .5, .55], [T.lower[0], .6], [T.lower[1], 2.45]]);
    const local = V(.08 * Math.sin(pitch) * .4, Math.cos(pitch), -Math.sin(pitch)).normalize(), dir = local.applyQuaternion(g.quaternion);
    { const fx = (t - T.flash) / .07; flashS.material.color.set('#ffffff').multiplyScalar(.95 * Math.exp(-fx * fx)); }
    SW.visible = bl > .02; SW.position.copy(hw); SW.quaternion.setFromUnitVectors(V(0, 1, 0), dir); SW.rotateY(.7); }
  // the torch in the hand: the grip is solved first, the stick and flame are children of the body at that grip
  function poseTorchMan(m, t, gait, extra = {}) { const g = m.g, s = g.userData.s, gr = V(.3 * s, 1.38 * s + (gait.bob || 0) * .6 + .012 * Math.sin(t * 2 + m.r), -.27 * s);
    poseM(g, { ...gait, ...extra, hands: [null, gr], handsW: [0, 1] });
    m.stick.position.set(gr.x, gr.y + .22, gr.z); m.stick.rotation.set(-.14, 0, .1); const tip = V(gr.x + -.05, gr.y + .68, gr.z - .06);
    m.f.position.set(tip.x, tip.y + .16, tip.z); const fk = .84 + .16 * wob(t, 8.7, 13.1, m.r); m.f.scale.set(.24 * (.92 + .08 * fk), .44 * fk, 1); m.hs.position.copy(tip).setY(tip.y + .13); m.hs.material.color.set(FIRE).multiplyScalar(.15 * fk); }
  const leadIdx = [2, 5, 7, 10];   // the four who close round him
  const LO = [-.06, -.998], RING = [[-.1, .8], [1.05, .4], [-.3, -1.1], [1.25, -1.15]];
  let leadPlan = null;
  function garden(t, T, shot) {
    if (!leadPlan) { leadPlan = {};
      torchMen.forEach(m => { m.w = stepper(m.start, m.stop, T.cutGarden - .3 + m.t0Off, T.cutSword + .4 + m.t0Off * .8, m.g); });
      leadIdx.forEach((id, j) => { const m = torchMen[id], r = [JG1[0] + RING[j][0], JG1[1] + RING[j][1]]; m.tc = T.close[0] + j * .12; m.tl = T.lead[0] + j * .08; m.wc = stepper(m.stop, r, m.tc, m.tl - .03, m.g); m.ring = r; m.lead = [r[0] + LO[0] * 3.4, r[1] + LO[1] * 3.4]; m.wl = stepper(r, m.lead, T.lead[0] + j * .08, T.lead[1], m.g); });
      leadPlan.j = stepper(JG0, JG1, T.step[0], T.step[1], JESUS); leadPlan.jl = stepper(JG1, [JG1[0] + LO[0] * 3.4, JG1[1] + LO[1] * 3.4], T.lead[0] + .1, T.lead[1], JESUS); }
    // torches: walk in, stop, stand with their fires up (the four close in and go)
    torchMen.forEach(m => { const g = m.g; let q = m.w(t), ry = face(m.stop[0] - m.start[0], m.stop[1] - m.start[1]), gait = q.w, twT = face(.4 - m.stop[0], -4.5 - m.stop[1]);
      if (q.k >= 1) { ry += angDiff(ry, twT) * ss(T.cutSword + .4, T.cutSword + 1.8, t); }
      if (m.wc) { if (t >= m.tc) { const c = m.wc(t), f0 = m.w(1e9).w.feet, bc = ss(m.tc, m.tc + .3, t); q = c; gait = { ...c.w, feet: c.w.feet.map((f, n) => ({ ...f, u: lerp(f0[n].u, f.u, bc), lift: f.lift * bc })) }; ry = lerp(ry, ry + angDiff(ry, face(m.ring[0] - m.stop[0], m.ring[1] - m.stop[1])), ss(T.close[0], T.close[0] + .5, t)); }
        if (t >= m.tl) { const l = m.wl(t), f0 = m.wc(m.tl).w.feet, bc = ss(m.tl, m.tl + .3, t); q = l; gait = { ...l.w, feet: l.w.feet.map((f, n) => ({ ...f, u: lerp(f0[n].u, f.u, bc), lift: f.lift * bc })) }; const ta = face(LO[0], LO[1]); ry += angDiff(ry, ta) * ss(T.lead[0], T.lead[0] + .7, t); } }
      g.position.set(q.x, 0, q.z); g.rotation.y = ry; g.visible = !(shot === 'r2c' && Math.hypot(q.x - PG[0], q.z - PG[1]) < 3.9); const mv = q.moving;
      const pose = mv ? { ...gait, breath: .5, head: [0, 0] } : { ...P.idle(t, g.userData.ph, { s: g.userData.s }), feet: gait.feet };
      poseTorchMan(m, t, pose); });
    poseServant(t, T); SERV.visible = shot !== 'r2c'; posePeterSword(t, T); film.dofCfg.maxCoc = shot === 'r2c' ? 46 : 22;
    // Jesus: walks two steps to the servant, reaches, then is led away
    JESUS.visible = shot !== 'r2c'; const J = t < T.lead[0] ? leadPlan.j(t) : leadPlan.jl(t), jry0 = face(SG[0] - JG1[0], SG[1] - JG1[1]), jryL = face(LO[0], LO[1]);
    if (t >= T.lead[0]) { const f0 = leadPlan.j(T.step[1] + 1).w.feet, bc = ss(T.lead[0] + .1, T.lead[0] + .42, t); J.w = { ...J.w, feet: J.w.feet.map((f, n) => ({ ...f, u: lerp(f0[n].u, f.u, bc), lift: f.lift * bc })) }; }
    const jryW = face(JG1[0] - JG0[0], JG1[1] - JG0[1]), jryA = jryW + angDiff(jryW, jry0) * ss(T.step[1] - .55, T.step[1] + .1, t);
    JESUS.position.set(J.x, 0, J.z); JESUS.rotation.y = jryA + angDiff(jryA, jryL) * ss(T.lead[0] - .4, T.lead[0] + .5, t);
    const rK = ss(T.reach[0], T.reach[1], t) * (1 - ss(T.reachOff[0], T.reachOff[1], t)), jg = J.moving ? { ...J.w } : rest(JESUS, t, J.w.feet), target = toLocal(JESUS, V(SG[0] - .03, 1.5 * SERV.userData.s + (t > T.lower[0] ? -.26 : 0), SG[1] + .02));
    const bound = ss(T.lead[0] - .2, T.lead[0] + .5, t), bH = [V(-.06, .96, -.24), V(.06, .96, -.24)];
    poseM(JESUS, { ...jg, head: [lerp(-.14, -.04, bound), 0], lean: lerp(-.06 * rK, -.03, bound), hands: [bH[0], t < T.lead[0] - .3 ? target : bH[1]], handsW: [bound, t < T.lead[0] - .3 ? rK : bound] });
    // the light: torches (orange a little, silver haze in the trees), a cold sky far off
    const lamps = [], fl = i => .84 + .16 * wob(t, 8.7, 13.1, torchMen[i].r); const ts = torchMen.slice(0, 13);
    ts.forEach((m, i) => { const w = m.f.getWorldPosition(V()); lamps.push({ pos: w, power: .2 * fl(i), size: .16, c: '#f2ddc8' }); });
    const near = [...ts].map(m => m.f.getWorldPosition(V())).sort((a, b) => a.distanceTo(cam.position) - b.distanceTo(cam.position)).slice(0, 3);
    const rimMult = shot === 'r2c' ? 1.2 : 1;
    light({ k: { pos: V(-10, 15, -18), at: V(0, 0, -5), I: 34, a: .5, pen: .7, d: 60, dec: 1.2, c: '#dcdcdc' },
      p: near.map((n, i) => ({ pos: n, I: (i ? 2.4 : 3.3) * rimMult * fl(i), d: 11, c: '#ece6e0' })).concat([{ pos: V(1, 3.8, -13), I: 4, d: 22, c: '#d8d8d8' }]),
      h: .03, fog: [.022, .07], fogC: .1, skyC: ['#0d0d0d', '#171717', '#2c2c2c'], skyK: .5, lamps });
    { const c = shot === 'r2c' ? near[0] : V(.6, 1.9, -9); setRim(c, shot === 'r2c' ? .4 : .24, '#f0ebe6', shot === 'r2c' ? .012 : .02); }
    setHaze(t, [[-3, 1.6, -9, 10], [3, 2.1, -11, 12], [0, 3.2, -7, 9], [-6, 2.5, -13, 12], [6, 1.5, -6, 8]], shot === 'r2c' ? .018 : .035);
    // cameras
    if (shot === 'r2a') { const u = clamp((t - T.cutGarden) / (T.cutSword - T.cutGarden)), x = lerp(-3.7, -1.15, u); shoot(V(x, 1.6, 7.2), V(x + .95, 1.52, -8), 36, 12.5, 3); }
    if (shot === 'r2b') { const u = clamp((t - T.cutSword) / (T.cutBlade - T.cutSword)), a = lerp(.34, .22, u), z = lerp(2.5, 2.1, u); shoot(V(.08 + a * 1.2, 1.12, z + 3.4), V(.06, 1.34, -4.1), 33, 9.8, 3.4); }
    if (shot === 'r2c') { const u = clamp((t - T.cutBlade) / (T.cutLead - T.cutBlade)), k = sine(u) * .3 + u * .7, dirx = Math.sin(PGR), dirz = Math.cos(PGR), back = lerp(1.72, 1.34, k), c = V(PG[0] + dirx * back + .34, lerp(1.72, 1.67, k), PG[1] + dirz * back + .12), hw = V(.22 * PETER.userData.s, 1.34 * PETER.userData.s, -.5 * PETER.userData.s).applyMatrix4(PETER.matrix);
      shoot(c, hw.clone().add(V(.02, .22, -.05)), 31, c.distanceTo(hw) + .12, 16, .012 * Math.sin(t * 2.1)); }
    if (shot === 'r2d') { const u = clamp((t - T.cutLead) / (T.cutCourt - T.cutLead)), k = lerp(u, sine(u), .4); shoot(V(lerp(5.3, 4.8, k), lerp(1.86, 1.74, k), lerp(6.3, 5.6, k)), V(.68, 1.42, -4.6), 31, lerp(11.6, 10.8, k), 3); }
  }

  // ================================================================ R3 / R5: the high priest's courtyard
  const COURT = new THREE.Group(); S.add(COURT);
  plane(COURT, 90, 90, M.paving);
  { const r = rng(2201), W0 = (x, z, w, d, h, m) => box(COURT, w, h, d, x, h / 2, z, m);
    // the ring of walls: uneven heights, set-backs, an upper storey and parapets (irregular mud brick, not grey boxes)
    for (let i = -3; i <= 3; i++) { const w = 3.4 + r() * 1.2, h = 4.4 + r() * 2.2, x = i * 3.4 + r() * .4; if (!(i === 0)) W0(x, -10.2 - r() * .3, w, 1.6, h, r() < .5 ? M.wall : M.wall2); W0(x + .6, 10.4 + r() * .3, w, 1.6, h - .4, r() < .5 ? M.wall : M.wall2); W0(x, -11.7, w * .94, 1.6, h + 1.2 + r() * .8, M.wall2); }
    for (let i = -3; i <= 3; i++) { const d = 3.1 + r(), h = 4.6 + r() * 2.1; W0(-11.3 - r() * .3, i * 3.15, 1.7, d, h, r() < .5 ? M.wall : M.wall2); W0(11.4 + r() * .3, i * 3.15 + .4, 1.7, d, h, r() < .5 ? M.wall : M.wall2); }
    // the stair and a gallery on the east, an arcade on the west, dark doorways
    for (let i = 0; i < 10; i++) box(COURT, 1.3, .2 * (i + 1), .4, 9.6, .1 * (i + 1), -5 + i * .4, M.wall);
    for (let i = 0; i < 4; i++) { box(COURT, .08, 2.1, 1.1, -10.42, 1.05, -6 + i * 3.6, M.dark); box(COURT, 1.1, 2.0, .08, -6 + i * 3.8, 1, 9.56, M.dark); } }
  // the far doorway: a real opening, bright inside (silver), with a lintel and jambs
  const DOOR = V(.9, 0, -9.6);
  const doorTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(32, 84, 4, 32, 84, 96); r.addColorStop(0, '#ffffff'); r.addColorStop(.5, '#c8c8c8'); r.addColorStop(1, '#6a6a6a'); g.fillStyle = r; g.fillRect(0, 0, 64, 128); return new THREE.CanvasTexture(c); })();
  const doorM = new THREE.MeshBasicMaterial({ map: doorTex, color: col('#ffffff', 1), fog: false }); const doorP = new THREE.Mesh(new THREE.PlaneGeometry(1.72, 2.66), doorM); doorP.position.set(DOOR.x, 1.33, -10.82); COURT.add(doorP);
  box(COURT, .38, 3, 1.4, DOOR.x - 1.05, 1.5, -10.2, M.wall2); box(COURT, .38, 3, 1.4, DOOR.x + 1.05, 1.5, -10.2, M.wall2); box(COURT, 2.6, .5, 1.5, DOOR.x, 3.0, -10.2, M.wall); box(COURT, 3, 1.8, 1.4, DOOR.x, 4.1, -10.2, M.wall2);
  // the charcoal fire: a low ring of stones, a bed of coals (each coal lit from inside), low flames
  const FIREG = new THREE.Group(); COURT.add(FIREG);
  { const r = rng(1771), sg = [0, 1, 2].map(j => { const q = new THREE.IcosahedronGeometry(1, 1), a = q.attributes.position; for (let i = 0; i < a.count; i++) { const x = a.getX(i), y = a.getY(i), z = a.getZ(i), f = 1 + .26 * Math.sin(x * 3.1 + j * 2) * Math.cos(z * 2.7 + j) + .16 * Math.sin(y * 5 + j * 3); a.setXYZ(i, x * f, y * f, z * f); } q.computeVertexNormals(); return q; }), stM = K.std('#0e0e0e', { roughness: 1 });
    for (let i = 0; i < 27; i++) { if (i % 9 === 4) continue; const an = i / 27 * 6.283 + r() * .13, rr = .36 + r() * .05, st = new THREE.Mesh(sg[i % 3], stM), q = .02 + r() * .022; st.position.set(Math.cos(an) * rr, q * .32, Math.sin(an) * rr); st.scale.set(q * (1 + r() * .5), q * .62, q * (.8 + r() * .4)); st.rotation.y = r() * 6; st.castShadow = st.receiveShadow = true; FIREG.add(st); } }
  const bedU = { time: { value: 0 }, amt: { value: 1 } }, bedG = new THREE.PlaneGeometry(1.64, 1.64, 56, 56);
  const bedM = new THREE.ShaderMaterial({ uniforms: bedU, transparent: true, depthWrite: true, fog: false,
    vertexShader: `varying vec2 vP; ${NOISE} void main(){ vP = position.xy; vec3 q = position; float r = length(q.xy) / .76; q.z += max(0., 1. - r * r) * (.035 + .05 * fb(q.xy * 4.)); gl_Position = projectionMatrix * modelViewMatrix * vec4(q, 1.); }`,
    fragmentShader: `varying vec2 vP; uniform float time, amt; ${NOISE}
      void main(){ vec2 p = vP; float r = length(p) / .72 + (fb(p * 3.1) - .5) * .34; if (r > 1.) discard;
        vec2 c = p * 12. + (vec2(fb(p * 6.), fb(p * 6. + 4.)) - .5) * 1.5, ic = floor(c), fc = fract(c); float d1 = 8., d2 = 8.; vec2 bst = ic;
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){ vec2 g = vec2(x, y), o = vec2(hh(ic + g), hh(ic + g + 17.)), w = g + o - fc; float d = dot(w, w); if (d < d1){ d2 = d1; d1 = d; bst = ic + g; } else if (d < d2) d2 = d; }
        float e = sqrt(d2) - sqrt(d1), id = hh(bst + .7), heat = 1. - smoothstep(.3, 1., r), br = .58 + .42 * sin(time * (.6 + id * .9) + id * 40.), n = fb(p * 4.6 + vec2(time * .025, -time * .018));
        float crack = 1. - smoothstep(.0, .085, e), glow = crack * (.4 + .6 * br) * heat * smoothstep(.26, .6, n + heat * .32), lump = smoothstep(.7, .97, id) * heat * br * smoothstep(.34, .62, n);
        float ash = smoothstep(.5, .86, fb(p * 7.4 + 9.) + r * .3) * (1. - crack * .85);
        vec3 base = mix(vec3(.018, .016, .015) * (.6 + id), vec3(.012, .0115, .011) * (.65 + .6 * id), ash), fire = vec3(1., .33, .05) * (glow * 2.5 + lump * 1.05) * amt * (1. - ash * .8);
        gl_FragColor = vec4(base + fire, 1. - smoothstep(.86, 1., r)); }` });
  { const bed = new THREE.Mesh(bedG, bedM); bed.rotation.x = -Math.PI / 2; bed.position.y = .012; bed.scale.set(.36, .36, 2.5); bed.renderOrder = 1; bed.frustumCulled = false; FIREG.add(bed);
    const r = rng(801), n = 120, cg = new THREE.IcosahedronGeometry(.026, 0), cm = K.std('#121212', { roughness: .95 }), inst = new THREE.InstancedMesh(cg, cm, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * .25, q = .4 + r() * r() * .8; m4.compose(V(Math.cos(a) * rr, .03 + (1 - rr * rr / .07) * .15, Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)), V(q * (.7 + r() * .7), q * .55, q * (.7 + r() * .6))); inst.setMatrixAt(i, m4); } FIREG.add(inst); }
  const fireF = [[0, 0, .26, .34, .95], [-.1, .06, .17, .24, .8], [.11, -.03, .19, .27, .85], [.03, .1, .15, .2, .7], [-.04, -.1, .16, .21, .75]].map(([x, z, w, h, k], i) => { const f = flame(FIREG, w, h, i * 1.9 + .4, k); f.position.set(x, h * .44 + .1, z); f.userData.h0 = h; f.userData.w0 = w; return f; });
  const fireH = halo(FIREG, 1.15, FIRE, .1); fireH.position.y = .42; FIREG.add(embers);
  function tickFire(t, amt = 1) {
    bedU.time.value = t; bedU.amt.value = amt; fireF.forEach((f, i) => { const k = .9 + .1 * wob(t, 6.1 + i, 9.7 + i, i); f.scale.set(f.userData.w0 * k, f.userData.h0 * (.92 + .08 * wob(t, 4.2 + i, 7.3, i * 2)), 1); f.material.uniforms.k.value = f.userData.k0 * amt * .34; });
    emM.uniforms.time.value = t; emM.uniforms.amt.value = amt; fireH.material.color.set(FIRE).multiplyScalar(.045 * amt * (.92 + .08 * wob(t, 5.1, 8.3))); }
  // the circle (P = Peter on the near side at +z). [x, z, standing?, group: 1 turns on 「두 번」, 2 on 「세 번」, nearer]
  const PC = [-.62, .86];
  const CIRCLE = [[.98, .62, 0, 1], [.62, -.82, 0, 2], [-.35, -1.0, 0, 1], [-1.15, -.18, 0, 2], [-1.95, -3.2, 1, 1], [-1.15, -3.55, 1, 2], [.62, -3.6, 1, 1], [1.3, -3.2, 1, 2], [-.45, -3.3, 1, 2]].map(([x, z, st, gr], i) => {
    const g = person({ h: [1.72, 1.7, 1.76, 1.68, 1.82, 1.7, 1.78, 1.86, 1.74][i], broad: [1.04, .98, 1.08, 1, 1.12, .96, 1.06, 1.14, 1][i], bare: i === 2 || i === 5, kind: st ? 'stand' : 'sit', mat: robes[(i * 2) % robes.length], cloth: cloths[i % cloths.length], ph: i * .13 + .05 });
    return { g: place(COURT, g, x, z, face(-x, -z)), gr, x, z, st, out: i === 4, ry0: face(-x, -z) + [0, 0, 0, 0, 1.2, 1.7, -1.75, -1.7, 1.6][i], ord: [0, 0, 1, 1, 2, 2, 3, 3, 1.5][i] }; });
  { const pr = P.rock(K.std('#111111', { roughness: 1 }), { w: .58, d: .48, top: .34, seed: 3 }); pr.position.set(PC[0], 0, PC[1] + .02); COURT.add(pr); }
  const YARD = [[-5.6, -6.2, 2.2], [-4.7, -6.75, -.6], [6.1, -5.9, -1.1], [6.5, 3.6, -2.2], [-6.8, 4.4, 1.3]].map(([x, z, ry], i) => place(COURT, person({ h: 1.72 + i * .02, mat: robes[(i + 3) % robes.length], cloth: cloths[(i + 2) % cloths.length], ph: i * .19 + .11 }), x, z, ry));
  const WOMAN = place(COURT, person({ h: 1.6, veil: true, mat: robes[1], cloth: cloth('#6c6c6c', 0), ph: .71 }), 1.45, -.35, face(PC[0] - 1.45, PC[1] + .35));
  // the guards and the bound man in the doorway (R5)
  const GUARD = [0, 1].map(i => { const g = person({ h: 1.76, broad: 1.06, mat: robes[5], cloth: cloths[0], ph: .3 + i * .33 }); COURT.add(g); return g; });
  const DY0 = [3.3, -8.55], DY1 = [DOOR.x + .1, -8.55];
  const dJ = stepper(DY0, DY1, 0, 1, JESUS), dG = [[-1.42, .62], [.72, .14]].map(([dx, dz], i) => ({ dx, dz, s: stepper([DY0[0] + dx, DY0[1] + dz], [DY1[0] + dx, DY1[1] + dz], 0, 1, GUARD[i]) }));

  function tickCircle(t, T, shot) {
    CIRCLE.forEach((m, i) => { const g = m.g, sc = g.userData.s, b = P.breath(t, g.userData.ph), t0 = (m.gr === 1 ? T.two : T.three) + (m.ord || 0) * .1, k = m.gr ? clamp((t - t0) / .82) : 0, ke = sine(k), d = Math.hypot(PC[0] - m.x, PC[1] - m.z), dx = (PC[0] - m.x) / d, dz = (PC[1] - m.z) / d;
      if (m.st) { const q = stepTurn(g, [m.x, m.z], [m.x + dx * .36, m.z + dz * .36], m.ry0, face(dx, dz), k), w = m.out ? .82 * (1 - q.e) : 0, h0 = [V(-.16, 1.04, -.46), V(.16, 1.0, -.46)];
        poseM(g, { ...P.idle(t, g.userData.ph, { s: sc }), feet: q.feet, bob: 0, breath: b, lean: -.05 - .07 * q.e, twist: .12 * Math.sin(Math.PI * k), head: [-.06 * (1 - q.e) + .02 * q.e, .05 * Math.sin(t * .2 + i) * (1 - q.e) + .3 * Math.sin(Math.PI * k) * Math.sign(angDiff(m.ry0, face(dx, dz)))], hands: m.out ? h0 : [null, null], handsW: [w, w] }); }
      else { const yaw = clamp(angDiff(g.rotation.y, face(dx, dz)), -1.25, 1.25), w = .82 * (1 - .6 * ke), warm = [V(-.13, .52 + .02 * Math.sin(t * .5 + i), -.46), V(.13, .5 + .02 * Math.sin(t * .43 + i), -.46)];
        poseM(g, { breath: b, lean: -.12 + .04 * ke, twist: yaw * .62 * ke, head: [-.12 * (1 - ke) + .02 * ke, yaw * .5 * ke + .05 * Math.sin(t * .2 + i)], hands: warm, handsW: [w, w] }); } });
    YARD.forEach(g => { g.visible = shot === 'r3'; if (g.visible) poseM(g, P.idle(t, g.userData.ph, { s: g.userData.s })); });
    { const g = WOMAN, sc = g.userData.s, pt = ss(T.point[0], T.point[1], t), Pp = V(PC[0], 1.0, PC[1]), W0 = g.position.clone().setY(1.28 * sc), target = toLocal(g, W0.clone().add(Pp.clone().sub(W0).normalize().multiplyScalar(.72 * sc)).setY(1.24 * sc));
      poseM(g, { ...P.idle(t, .71, { s: sc }), lean: -.03 - .05 * pt, head: [-.08, .03 * Math.sin(t * .3)], hands: [V(-.12, .95, -.3), target], handsW: [.75, pt] }); }
    // Peter sits on a stone among them, hands to the heat; on her word his shoulders and head turn away and his hands come back to his knees
    if (shot !== 'r5b') { const g = PETER, sc = g.userData.s, base = P.rockSit(.34, sc, { tuck: .07, lean: -.2 }), a = ss(T.away[0], T.away[1] + .25, t), two = ss(T.two, T.two + .7, t), thr = ss(T.three, T.three + .7, t); g.visible = true; g.position.set(PC[0], 0, PC[1]); g.rotation.y = face(-PC[0], -PC[1]);
      const hd = [-1, 1].map(sd => V(sd * .15 * sc, .74 * sc, -.56 * sc).lerp(P.kneeHand(g, sd, base), a));
      poseM(g, { ...base, breath: P.breath(t, .13), lean: base.lean - .04 * two - .06 * thr, side: -.012 * two + .012 * thr + .17 * a, twist: .95 * a, head: [-lerp(.3, .14, a) - .16 * thr, .72 * a + .04 * Math.sin(t * .2) * (1 - a)], hands: hd, handsW: [.9, .9] }); }
  }
  const shTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 160; const g = c.getContext('2d'); g.filter = 'blur(5px)'; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(25, 160); g.lineTo(39, 160); g.lineTo(55, 50); g.quadraticCurveTo(32, 2, 9, 50); g.closePath(); g.fill(); g.filter = 'none'; g.globalCompositeOperation = 'destination-in'; const f = g.createLinearGradient(0, 160, 0, 0); f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(.55, 'rgba(0,0,0,.62)'); f.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = f; g.fillRect(0, 0, 64, 160); return new THREE.CanvasTexture(c); })();
  const shGeo = new THREE.PlaneGeometry(1, 1); shGeo.translate(0, .5, 0); shGeo.rotateX(-Math.PI / 2);
  const cards = [...CIRCLE.map(m => m.g), WOMAN, PETER].map(g => { const c = new THREE.Mesh(shGeo, new THREE.MeshBasicMaterial({ map: shTex, color: '#000000', transparent: true, opacity: .52, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 })); c.renderOrder = 2; c.frustumCulled = false; COURT.add(c); return { g, c }; });
  function courtShadows(sh) { const on = sh === 'r3' || sh === 'r5b'; for (const { g, c } of cards) { c.visible = on && g.visible; if (!c.visible) continue; const x = g.position.x, z = g.position.z, d = Math.hypot(x, z) || 1; c.position.set(x, .02, z); c.rotation.y = face(x / d, z / d); c.scale.set(.72 * (g.userData.b || .9), 1, 1.1 + d * .62); } }
  function courtLight(t, shot, strength = 1) {
    const dk = shot === 'r3' ? .34 : 1; doorM.color.set('#ffffff').multiplyScalar(shot === 'r3' ? .17 : shot === 'r5b' ? .22 : .3);
    const fl = .84 + .16 * wob(t, 6.3, 10.1), Pf = V(0, .5 + .05 * wob(t, 7.7, 3.2), 0);
    light({ k: { pos: V(-7, 31, 13), at: V(1, 0, -3), I: 66, a: .5, pen: .6, d: 70, dec: 1.1, c: '#e2e2e2' },
      p: [{ pos: Pf, I: 10 * fl * strength, d: 5.6, c: '#ff9a50' }, { pos: V(.2, .9, 0), I: 2.5 * fl * strength, d: 3.4, c: '#ff9a4a' }, { pos: V(DOOR.x, 1.6, -9.1), I: shot === 'r3' ? 2 : 3, d: 7, c: '#e6e6e6' }],
      h: .035, fog: [.011, .08], fogC: .1, skyC: ['#0e0e0e', '#1b1b1b', '#303030'], skyK: .6,
      lamps: [{ pos: V(0, .42, 0), power: .05 * fl * strength, size: .2 }, { pos: V(DOOR.x, 1.5, -10.6), power: (shot === 'r3' ? .12 : .2), size: .9, c: '#ffffff' }] });
  }
  function shotCourt(t, T) {
    FIREG.visible = true; tickFire(t); tickCircle(t, T, 'r3'); courtLight(t, 'r3'); CIRCLE.forEach(m => { m.g.visible = true; }); WOMAN.visible = true; JESUS.visible = false; GUARD.forEach(g => { g.visible = false; });
    const u = clamp((t - T.cutCourt) / (T.cutRoof - T.cutCourt)), k = .6 * (1 - Math.pow(1 - u, 2)) + .4 * u;
    // the crane: from high over the yard, down and in; it never stops
    const C0 = V(5.6, 15.5, 8.9), C1 = V(.42, 1.86, 10.3), A0 = V(-.6, .2, -1.7), A1 = V(.1, 1.2, .4), p = C0.clone().lerp(C1, k); p.y = lerp(C0.y, C1.y, k);
    shoot(p, A0.clone().lerp(A1, k), lerp(50, 31, k), p.distanceTo(V(.2, .8, 1)), lerp(1.2, 3.6, k));
    cam.updateMatrixWorld(); setRim(V(0, .55, 0), .3, '#ffb276', .075);
    setHaze(t, [[-1.6, 2.1, -5, 7], [1.8, 2.8, -5.6, 7], [0, 3.8, -6.2, 8], [-3.4, 3.2, -6.6, 8], [3.4, 3.4, -7, 8]], lerp(.025, .04, k), '#e8ddd0');
  }
  function shotDoor(t, T) {   // R5a: across the yard, the lit door; a bound man stops, a guard's hand on his arm, and he turns his whole body
    tickFire(t); tickCircle(t, T, 'r5a'); courtLight(t, 'r5a', .3); key.intensity = 22; FIREG.visible = false; PETER.visible = false; WOMAN.visible = false; CIRCLE.forEach(m => { m.g.visible = false; });
    const u = clamp((t - T.cutDoor) / (T.cutBack - T.cutDoor)), sc = JESUS.userData.s, tA = T.cutDoor - 1.6, tB = T.doorStop, wK = (t - tA) / (tB - tA), ry0 = face(-1, 0), trn = clamp((t - T.doorTurn[0]) / (T.doorTurn[1] - T.doorTurn[0]));
    JESUS.visible = true; GUARD.forEach(g => { g.visible = true; }); const J = dJ(wK), end = dJ(1), bound = [V(-.05 * sc, .98 * sc, -.25 * sc), V(.05 * sc, .98 * sc, -.25 * sc)];
    if (t < T.doorTurn[0]) { JESUS.position.set(J.x, 0, J.z); JESUS.rotation.y = ry0; const id = J.moving ? J.w : rest(JESUS, t, J.w.feet); poseM(JESUS, { ...id, lean: -.03, head: [-.04, 0], hands: bound, handsW: [1, 1] }); }
    else { const q = stepTurn(JESUS, [end.x, end.z], [end.x, end.z + .1], ry0, Math.PI, trn, end.w.feet); poseM(JESUS, { ...rest(JESUS, t, q.feet), lean: -.03, twist: .1 * Math.sin(Math.PI * trn), head: [-.04, .12 * Math.sin(Math.PI * trn)], hands: bound, handsW: [1, 1] }); }
    const grip = ss(T.doorStop - .55, T.doorStop - .05, t);
    dG.forEach((q, i) => { const G = GUARD[i], w = q.s(wK); if (i === 0) { G.position.set(-.72, 0, -9.24); G.rotation.y = face(1, .15); G.scale.setScalar(.93); poseM(G, P.idle(t, G.userData.ph, { s: G.userData.s })); return; } G.position.set(w.x, 0, w.z); G.rotation.y = ry0; const pose = w.moving ? { ...w.w, breath: .5 } : { ...P.idle(t, G.userData.ph, { s: G.userData.s }), feet: w.w.feet };
      if (i === 1) { const tg = toLocal(G, V(JESUS.position.x + .2 * sc, 1.28 * sc, JESUS.position.z + .03)); poseM(G, { ...pose, hands: [tg, null], handsW: [grip, 0] }); } else poseM(G, pose); });
    const p = V(lerp(.92, .9, u), 1.46, lerp(8.1, 7.7, u)); shoot(p, V(1.22, 1.34, -9), 27, p.distanceTo(V(1, 1, -8.55)), 1.6);
    cam.updateMatrixWorld(); setRim(V(DOOR.x, 1.6, -10.6), .5, '#ffffff', .012);
    setHaze(t, [[.2, 1.6, -8.9, 7], [1.8, 2.3, -9.0, 8], [-.8, 2.6, -9.1, 8]], .06, '#ffffff', true);
  }
  function shotBack(t, T) {   // R5b: reverse, over the fire: Peter from behind, frozen, the door tiny beyond him
    FIREG.visible = true; tickFire(t); tickCircle(t, T, 'r5b'); courtLight(t, 'r5b'); WOMAN.visible = true; CIRCLE.forEach((m, i) => { m.g.visible = i === 1; }); WOMAN.visible = false; JESUS.visible = false; GUARD.forEach(g => { g.visible = false; });
    const g = PETER, s = g.userData.s; g.visible = true; g.position.set(PC[0], 0, PC[1]); g.rotation.y = face(-PC[0], -PC[1]);
    const u = clamp((t - T.cutBack) / (T.cutAlley - T.cutBack)), br = .35 + .12 * Math.sin(t * .9);
    { const base = P.rockSit(.34, s, { tuck: .07, lean: -.14 }); poseM(g, { ...base, breath: br, twist: .12, head: [.06, .1], hands: [P.kneeHand(g, -1, base), P.kneeHand(g, 1, base)], handsW: [.9, .9] }); }
    const p = V(lerp(-2.1, -2.04, u), 1.72, lerp(9.05, 8.75, u)); shoot(p, V(-.02, 1.08, -4), 35, p.distanceTo(g.position), 3.2);
    cam.updateMatrixWorld(); setRim(V(0, .55, 0), .3, '#ffb276', .06);
    setHaze(t, [[.6, 2, -7, 8], [-1.4, 2.4, -8, 8], [1.8, 2.9, -9, 9]], .055, '#ffffff', true);
  }

  // ================================================================ R4: the rooftop at first grey
  const ROOF = new THREE.Group(); S.add(ROOF);
  { box(ROOF, 16, .4, 1.1, 0, -.2, 0, M.wall2); box(ROOF, 30, 3, 8, 0, -1.8, 3, M.wall2); const r = rng(77);
    for (let i = 0; i < 14; i++) { const w = 2.4 + r() * 4, h = 1.2 + r() * 3.2; box(ROOF, w, h, 3, -16 + i * 2.6 + r(), -3.4 + h / 2 - r() * .6, -13 - r() * 12, M.dark); }
    for (let i = 0; i < 6; i++) { const o = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.dark); o.position.set(-30 + i * 14 + r() * 4, -3, -60 - r() * 10); o.scale.set(34, 3.4 + r() * 2.4, 10); ROOF.add(o); } }
  // the rooster: a real little bird, built from smooth parts; neck and head on pivots
  const RST = new THREE.Group(); RST.position.set(0, 0, 0); ROOF.add(RST);
  const birdM = K.std('#070707', { roughness: .8 }), rmk = (geo, p, sc, rot, par = RST) => { const m = new THREE.Mesh(geo, birdM); if (p) m.position.set(...p); if (sc) m.scale.set(...sc); if (rot) m.rotation.set(...rot); par.add(m); return m; };
  rmk(new THREE.SphereGeometry(.13, 18, 14), [0, .25, 0], [1.25, .95, .82], [0, 0, .2]);   // breast and body
  rmk(new THREE.SphereGeometry(.1, 14, 10), [-.13, .28, 0], [1.25, .85, .75], [0, 0, -.35]);
  const rNeck = new THREE.Group(); rNeck.position.set(.13, .32, 0); RST.add(rNeck);
  rmk(new THREE.CapsuleGeometry(.052, .14, 5, 10), [.015, .08, 0], null, [0, 0, -.18], rNeck);
  const rHead = new THREE.Group(); rHead.position.set(.035, .19, 0); rNeck.add(rHead);
  rmk(new THREE.SphereGeometry(.046, 12, 10), [.02, .02, 0], [1.1, .95, .85], null, rHead);
  { const bg = new THREE.ConeGeometry(.016, .06, 6); rmk(bg, [.087, .012, 0], null, [0, 0, -1.45], rHead); }                 // beak
  { const cs = new THREE.Shape(); cs.moveTo(-.04, 0); for (let i = 0; i <= 4; i++) { const x = -.04 + i * .024; cs.quadraticCurveTo(x - .006, .056 + .012 * Math.sin(i * 2), x + .012, .004); } cs.lineTo(.07, 0); const g = new THREE.ExtrudeGeometry(cs, { depth: .008, bevelEnabled: false }); g.translate(0, 0, -.004); rmk(g, [.008, .054, 0], null, null, rHead); }   // comb
  rmk(new THREE.SphereGeometry(.014, 8, 6), [.066, -.032, 0], [.8, 1.5, .5], null, rHead);                                       // wattle
  // the tail: sickle feathers, curved tubes
  for (let i = 0; i < 7; i++) { const a = -.15 + i * .26, L = .36 - i * .018, pts = []; for (let j = 0; j <= 8; j++) { const u = j / 8; pts.push(V(-.18 - Math.cos(a) * L * u * .85, .33 + Math.sin(a) * L * u + L * .8 * Math.sin(u * 2.4) * (1 - u * .3) - .6 * L * u * u, (i - 3) * .012)); }
    rmk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, .012 - i * .0004, 5), null, null, null); }
  for (const [x, z] of [[-.015, -.04], [.055, .04]]) { rmk(new THREE.CylinderGeometry(.009, .012, .16, 6), [x, .08, z]); rmk(new THREE.BoxGeometry(.09, .012, .03), [x + .022, .006, z]); }
  function shotRoof(t, T) {
    JESUS.visible = false; PETER.visible = false;
    const u = clamp((t - T.cutRoof) / (T.cutDoor - T.cutRoof)), cr = ss(T.crow - .32, T.crow + .25, t) * (1 - ss(T.crow + 1.5, T.crow + 1.95, t)), id = .02 * Math.sin(t * .9);
    RST.rotation.y = 0; RST.position.set(-.3, 0, .1); rNeck.rotation.z = lerp(-.1 + id, .42, cr); rHead.rotation.z = lerp(-.1, .5, cr); RST.rotation.z = lerp(0, -.05, cr);
    RST.scale.setScalar(1.0);
    const p = V(lerp(.42, .32, u), lerp(.42, .38, u), lerp(11.4, 10.6, u));
    light({ k: { pos: V(-5, 6, -14), at: V(0, 0, 0), I: 48, a: .7, pen: .8, d: 40, dec: 1.1, c: '#e0e0e0' }, p: [], h: .22, fog: [.009, .03], fogC: .78,
      skyC: ['#3e3e3e', '#8a8a8a', '#d6d6d6'], skyK: .95, lamps: [] });
    shoot(p, V(-.1, 1.34, -4), 25, p.distanceTo(RST.position), 1.6); setHaze(t, [[-4, .4, -8, 16], [5, .9, -11, 18], [0, 1.6, -15, 22]], .05);
  }

  // ================================================================ R6: the dark alley
  const ALLEY = new THREE.Group(); S.add(ALLEY);
  { plane(ALLEY, 60, 30, M.earth); const r = rng(991); for (let i = -7; i <= 7; i++) { const w = 3.4 + r() * 1.5, h = 4.8 + r() * 2.4, x = i * 3.7 + r() * .4; box(ALLEY, w, h, 1.4, x, h / 2, -2.75, r() < .5 ? M.alley : M.alley2); }
    box(ALLEY, 1.1, 2, .1, -3.6, 1, -2.03, M.dark); { const dO = new THREE.Mesh(new THREE.PlaneGeometry(.92, 2.05), new THREE.MeshBasicMaterial({ color: '#050505' })); dO.position.set(-1.62, 1.025, -2.035); ALLEY.add(dO); const dS = texM('#343434', { amp: .6 }); box(ALLEY, .16, 2.15, .2, -2.14, 1.07, -2.0, dS); box(ALLEY, .16, 2.15, .2, -1.1, 1.07, -2.0, dS); box(ALLEY, 1.34, .2, .24, -1.62, 2.14, -1.99, dS); } box(ALLEY, 1.2, 5.4, 1.5, 2.72, 2.7, -.55, M.dark); box(ALLEY, 2.6, .24, .4, 3.4, 2.5, -2.05, M.wall2); }
  // a buttress standing out from the alley wall: his back goes against it, so he is seen from the side against the lit wall
  const BX = -.45; box(ALLEY, 1.15, 4.6, 1.35, BX - .575, 2.3, -1.375, M.alley2);
  ALLEY.traverse(o => { if (o.isMesh) o.castShadow = false; });
  // the robe as he sits: one cloth from the shoulders over the knees to the feet, its side profile morphing from standing to sitting, so the
  // silhouette has long straight falls and no hip or seat shape. Limbs stay on IK inside it. (f = forward of the root, y = up, metres / s)
  const DR_A = [[-.2, .16], [-.22, .4], [-.22, .65], [-.22, .9], [-.22, 1.12], [-.19, 1.3], [-.05, 1.38], [.08, 1.34], [.18, 1.2], [.22, 1], [.22, .82], [.22, .62], [.23, .42], [.24, .25], [.22, .16], [.15, .14], [.05, .14], [-.05, .14], [-.12, .14], [-.18, .15]];
  const DR_B = [[-.24, 0], [-.25, .16], [-.24, .32], [-.21, .46], [-.17, .58], [-.1, .67], [-.01, .71], [.1, .68], [.2, .63], [.3, .57], [.39, .5], [.45, .39], [.51, .27], [.57, .14], [.63, .02], [.5, 0], [.3, 0], [.1, 0], [-.08, 0], [-.18, 0]];
  const DRN = DR_A.length, DRJ = 7, drapeG = new THREE.BufferGeometry(), drP = new Float32Array(DRN * DRJ * 3), drI = [];
  for (let i = 0; i < DRN; i++) for (let j = 0; j < DRJ - 1; j++) { const a = i * DRJ + j, b = ((i + 1) % DRN) * DRJ + j; drI.push(a, b, a + 1, b, b + 1, a + 1); }
  drapeG.setAttribute('position', new THREE.BufferAttribute(drP, 3)); drapeG.setIndex(drI);
  const drape = new THREE.Mesh(drapeG, new THREE.MeshBasicMaterial({ color: '#040404', side: THREE.DoubleSide, fog: false })); drape.frustumCulled = false; drape.visible = false; PETER.add(drape);
  function setDrape(m, sob, sc) { let fc = 0, yc = 0; const q = DR_A.map((a, i) => { const b = DR_B[i], f = lerp(a[0], b[0], m) * sc, y = (lerp(a[1], b[1], m) + (i >= 4 && i <= 9 ? sob : 0)) * sc; fc += f; yc += y; return [f, y]; }); fc /= DRN; yc /= DRN;
    for (let i = 0; i < DRN; i++) for (let j = 0; j < DRJ; j++) { const th = -Math.PI / 2 + Math.PI * j / (DRJ - 1), c = Math.cos(th), k = i * DRJ + j; drP[k * 3] = Math.sin(th) * .3 * sc; drP[k * 3 + 1] = yc + (q[i][1] - yc) * c; drP[k * 3 + 2] = -(fc + (q[i][0] - fc) * c); }
    drapeG.attributes.position.needsUpdate = true; drapeG.computeVertexNormals(); }
  const WZ = -2.03, PA0 = [2.5, -1.2], PA1 = [BX + .72, -1.58];
  const pW = stepper(PA0, PA1, 0, 1, PETER, { minSteps: 4 });
  function shotAlley(t, T) {
    JESUS.visible = false; const g = PETER, s = g.userData.s; g.visible = true;
    const F = T.fall, Pc = [BX + .66, -1.62], xSeat = BX + .25, q = pW((t - F.walk[0]) / (F.walk[1] - F.walk[0])), end = pW(1), ry0 = face(PA1[0] - PA0[0], PA1[1] - PA0[1]), ryS = -Math.PI / 2;
    const tk = clamp((t - F.turn[0]) / (F.turn[1] - F.turn[0])), sink = sine((t - F.sink[0]) / (F.sink[1] - F.sink[0])), back = sine((t - F.sink[0]) / 1.5), fold = ss(F.fold[0], F.fold[1], t), hk = ss(F.hand[0], F.hand[1], t);
    let feet, moving = false, gaitBob = -.015, swing = [0, 0], x, z, ry;
    if (t < F.turn[0]) { x = q.x; z = q.z; ry = ry0; feet = q.w.feet; moving = q.moving; if (moving) { gaitBob = q.w.bob; swing = q.w.swing; } }
    else { const tt = stepTurn(g, [end.x, end.z], Pc, ry0, ryS, tk, end.w.feet); x = g.position.x; z = g.position.z; ry = g.rotation.y; feet = tt.feet; }
    if (t >= F.sink[0]) {   // the feet stay where the turn left them; the hips go back to the wall and down
      const rest = [[-.1 * s, -.09 * s], [.1 * s, .07 * s]]; x = lerp(Pc[0], xSeat, back); z = Pc[1]; ry = ryS;
      feet = [0, 1].map(i => { const A = rotY(rest[i][0], rest[i][1], ryS), L = rotY(Pc[0] + A[0] - x, Pc[1] + A[1] - z, -ryS), dk = ss(F.sink[0] + .6 + i * .22, F.fold[1] - .3 + i * .22, t); return { u: lerp(-L[1], (.56 + (i ? -.03 : .03)) * s, dk), x: lerp(L[0] - (i ? 1 : -1) * .1 * s, 0, dk), lift: Math.sin(Math.PI * dk) * .035 * s }; }); }
    g.position.set(x, 0, z); g.rotation.y = ry; g.updateMatrix(); g.userData.shoulders.children[0].scale.y = lerp(g.userData.mantY, .42, sink); g.userData.neck.children[3].scale.set(lerp(.72, .62, fold), lerp(.8, .34, fold), lerp(.8, .42, fold));
    const stum = Math.sin(clamp((t - F.walk[0]) / (F.walk[1] - F.walk[0])) * Math.PI * 3) * .05 * (1 - hk), bob = lerp(moving ? gaitBob : -.015, -.685 * s, sink), wt = t * (1.12 + .3 * fold), br = .5 + .5 * Math.sin(wt), sob = fold * Math.pow(Math.max(0, Math.sin(t * 1.52)), 2);
    const wallP = toLocal(g, V(x + .06 * s, lerp(1.42, .62, sink), WZ + .03)), kneeL = V(-.05 * s, .43 * s, -.42 * s), kneeR = V(.05 * s, .41 * s, -.42 * s), hL = wallP.clone().lerp(kneeL, ss(F.fold[0] + .1, F.fold[1] - .1, t)), hR = kneeR.clone();
    poseM(g, { feet, bob: bob + sob * .004, lean: lerp(lerp(moving ? -.12 + stum : -.06, .08, tk), -.44, fold), side: moving ? stum * .8 : 0, breath: br * (.6 + .5 * fold) + sob * .6, swing, head: [lerp(-.06, -1.0, fold), .03 * fold], hands: [hL, hR], handsW: [hk, ss(F.fold[0] - .2, F.fold[1] - .3, t)] });
    { const m = ss(F.sink[0] + .05, F.sink[1] - .1, t); drape.visible = m > .01; if (drape.visible) setDrape(m, (.006 + .008 * br) * fold + sob * .012, s); }
    const u = clamp((t - T.cutAlley) / (T.end - T.cutAlley)), k = u * .6 + sine(u) * .4;
    light({ k: { pos: V(3.4, 4.4, 11.5), at: V(-.1, .72, -2), I: 66, a: .26, pen: 1, d: 50, dec: 1.18, c: '#efefef' },
      p: [{ pos: V(.1, 2.2, 1.8), I: .25, d: 9, c: '#d6d6d6' }], h: .012, fog: [.005, .13], fogC: .06, skyC: ['#0a0a0a', '#121212', '#2a2a2a'], skyK: .6, lamps: [] });
    shoot(V(lerp(.9, .82, k), lerp(1.6, 1.42, k), lerp(11.2, 10.25, k)), V(.1, lerp(1.0, .84, k), WZ), 21.5, lerp(12.2, 11.2, k), 1.6);
    cam.updateMatrixWorld(); setRim(V(-6, 3.4, -1.6), 0, '#e8e8e8', .004);
    setHaze(t, [[-3, .9, -1.88, 7], [2.6, 1.3, -1.86, 7], [-.3, 2.1, -1.9, 8]], .045, '#ffffff', true);
  }

  // ================================================================ black-and-white finish (fixed in the frame: nothing per frame)
  const FS = (frag, uniforms) => { const m = new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: frag, uniforms, depthTest: false, depthWrite: false }); const sc = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); q.frustumCulled = false; sc.add(q); return { m, sc, u: m.uniforms }; };
  const ocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), rtA = new THREE.WebGLRenderTarget(film.w, film.h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const bw = FS(`varying vec2 vUv; uniform sampler2D tIn; uniform float keep, gain, sc, lift, time; uniform vec3 heat; ${NOISE}
    void main(){ vec2 uv = vUv; if (heat.z > 0.) { vec2 d = (vUv - heat.xy - vec2(0., .045)) / vec2(.12, .06); float w = exp(-dot(d, d)); uv.x += heat.z * w * (.0016 * sin(vUv.y * 150. - time * 5.2) + .001 * sin(vUv.y * 310. - time * 7.7 + vUv.x * 40.)); }
      vec3 c = texture2D(tIn, uv).rgb; float l = dot(c, vec3(.3, .59, .11));
      float ch = clamp((c.r - c.b) / max(c.r, .035), 0., 1.), m = smoothstep(.05, .8, ch) * keep;
      float g = clamp((l - .03) * 1.04 * gain, 0., 1.); g = mix(g, g * g * (3. - 2. * g), .82); g += lift * smoothstep(.34, .66, vUv.y) * smoothstep(.025, .2, g) * (1. - g);
      // coarse grain, fixed in the frame, strongest in the mids, gone in the deep blacks and the clipped whites
      vec2 p = gl_FragCoord.xy / sc; float n = vn(p / 2.3) * .55 + vn(p / 1.15 + 7.) * .3 + vn(p / 4.7 + 3.) * .15; float mi = smoothstep(.015, .22, g) * (1. - smoothstep(.72, .98, g));
      float gr = (n - .5) * (.1 * mi + .018); float bwv = clamp(g + gr * (.3 + g), 0., 1.);
      vec3 O = vec3(1., .541, .165); vec3 f = O * clamp(bwv * 1.46 + .03, 0., 1.); f = mix(f, vec3(1., .86, .62), smoothstep(.9, 1., l));
      gl_FragColor = vec4(mix(vec3(bwv), f, m), 1.); }`, { tIn: { value: null }, keep: { value: 1 }, gain: { value: 1 }, sc: { value: film.scale }, lift: { value: 0 }, time: { value: 0 }, heat: { value: V() } });
  const realSRT = R.setRenderTarget.bind(R);
  function pass(t, keep, gain, liftV, sh) {
    if (window.__NOREN) return;
    R.setRenderTarget = (tg, ...a) => realSRT(tg === null ? rtA : tg, ...a);
    try { film.render(t); } finally { R.setRenderTarget = realSRT; }
    bw.u.tIn.value = rtA.texture; bw.u.keep.value = keep; bw.u.gain.value = gain; bw.u.lift.value = liftV; bw.u.time.value = t; if (sh === 'r3' || sh === 'r5b') { const q = V(0, .55, 0).project(cam); bw.u.heat.value.set(q.x * .5 + .5, q.y * .5 + .5, 1); } else bw.u.heat.value.set(0, 0, 0); realSRT(null); R.render(bw.sc, ocam);
  }

  // ---------------------------------------------------------------- the shot table
  const shotOf = (t, T) => t < T.cutGarden ? 'r1' : t < T.cutSword ? 'r2a' : t < T.cutBlade ? 'r2b' : t < T.cutLead ? 'r2c' : t < T.cutCourt ? 'r2d' : t < T.cutRoof ? 'r3' : t < T.cutDoor ? 'r4' : t < T.cutBack ? 'r5a' : t < T.cutAlley ? 'r5b' : 'r6';
  const SETS = { r1: ROOM, r2a: GARDEN, r2b: GARDEN, r2c: GARDEN, r2d: GARDEN, r3: COURT, r4: ROOF, r5a: COURT, r5b: COURT, r6: ALLEY };
  const KEEP = { r1: .92, r2a: .88, r2b: .88, r2c: .8, r2d: .88, r3: 1, r4: 0, r5a: .3, r5b: 1, r6: 0 };
  const GAIN = { r1: 1.26, r2a: 1.26, r2b: 1.24, r2c: 1.3, r2d: 1.26, r3: 1.3, r4: 1.05, r5a: 1.16, r5b: 1.24, r6: 1.26 };
  const LIFT = { r1: .38, r2a: .32, r2b: .32, r2c: .35, r2d: .32, r3: .4, r4: .02, r5a: .24, r5b: .28, r6: .1 };
  function update(t, T) {
    const sh = shotOf(t, T); for (const g of [ROOM, GARDEN, COURT, ROOF, ALLEY]) g.visible = g === SETS[sh];
    hazes.forEach(h => { h.visible = false; }); PETER.userData.shoulders.children[0].scale.y = PETER.userData.mantY; PETER.userData.neck.children[3].scale.set(.72, .8, .8); drape.visible = false;
    if (sh === 'r1') shotRoom(t, T); else if (sh[1] === '2') garden(t, T, sh); else if (sh === 'r3') shotCourt(t, T); else if (sh === 'r4') shotRoof(t, T); else if (sh === 'r5a') shotDoor(t, T); else if (sh === 'r5b') shotBack(t, T); else shotAlley(t, T);
    courtShadows(sh); cam.updateMatrixWorld(); tickFlames(t); return sh;
  }
  function draw(ctx, t, T) { const sh = update(t, T); pass(t, KEEP[sh], GAIN[sh], LIFT[sh], sh); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore(); }

  // ---------------------------------------------------------------- measurement (no GPU): camera speed, emission, max joint-angle change per frame
  function measure(T, dt = 1 / 30) {
    const old = window.__NOREN; window.__NOREN = true; const rows = [], people = () => [PETER, JESUS, SERV, WOMAN, ...GUARD, ...torchMen.map(m => m.g), ...CIRCLE.map(m => m.g), ...seated];
    const ang = (A, B, C) => { const a = A.clone().sub(B).normalize(), b = C.clone().sub(B).normalize(); return Math.acos(clamp(a.dot(b), -1, 1)); };
    let prevJ = new Map(), prevC = null, prevD = null, maxJ = { v: 0, t: 0, who: '' }; const series = [], perShot = {}, perKnee = {};
    const n = Math.round((T.end - T.start) / dt);
    for (let i = 0; i <= n; i++) { const t = T.start + i * dt, sh = update(Math.min(t, T.end - .001), T), cp = cam.position.clone(), cd = cam.getWorldDirection(V());
      const sp = prevC && prevC.sh === sh ? cp.distanceTo(prevC.p) / dt : null, rot = prevD && prevC.sh === sh ? cd.angleTo(prevD) / dt : null; prevC = { p: cp, sh }; prevD = cd; series.push({ t, sh, sp, rot });
      for (const g of people()) { if (!g.visible || !g.parent?.visible) continue; const U = g.userData; if (!U.arms) continue; const J = []; for (const A of U.arms) if (A.E && A.T && A.S2) J.push(ang(A.S2, A.E, A.T)); const nA = J.length; for (const L of U.legs || []) if (L.H && L.E && L.A) J.push(ang(L.H, L.E, L.A)); const pv = prevJ.get(g);
        if (pv && pv.sh === sh) J.forEach((v, j) => { const d = Math.abs(v - pv.J[j]); if (j >= nA) { if (d > (perKnee[sh] || 0)) perKnee[sh] = +d.toFixed(3); } else if (d > (perShot[sh] || 0)) perShot[sh] = +d.toFixed(3); if (d > maxJ.v) maxJ = { v: d, t, who: g === PETER ? 'Peter' : g === JESUS ? 'Jesus' : g === SERV ? 'servant' : g === WOMAN ? 'woman' : 'other', sh }; }); prevJ.set(g, { J, sh }); } }
    for (let k = 0; Math.round(k * 7.5) < series.length; k++) rows.push(series[Math.round(k * 7.5)]); window.__NOREN = old;
    return { rows: rows.map(q => [+q.t.toFixed(2), q.sh, q.sp == null ? null : +q.sp.toFixed(3), q.rot == null ? null : +q.rot.toFixed(4)]), maxJoint: { rad: +maxJ.v.toFixed(3), t: +maxJ.t.toFixed(2), who: maxJ.who, shot: maxJ.sh, perShot, perKnee }, emberPerSec: +(EMB / 3.35).toFixed(1) };
  }
  S.updateMatrixWorld(true);
  return { film, draw, measure };
}
