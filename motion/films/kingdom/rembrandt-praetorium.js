// rembrandt-praetorium.js — 「kingdom」 3부 block 4b-1: Pilate's praetorium at dawn, film 288.3 → 317.1
//   N14 「십자가에 달리시던 날 새벽, / 총독 빌라도 앞에서도 말씀하셨습니다.」 · L5/Q5 요 18:36 「내 나라는 이 세상에 속한 것이 아니니라」 ·
//   N14b 「이 세상에서 나온 나라가 아니라는 말씀, / 칼과 군대로 지키는 나라가 아니라는 말씀이었습니다.」
// Look (review.json looks "4:47–5:16"): Rembrandt-key oil — the cold dawn through one high window and one brazier. After 「The Godfather」
// (1972, OPUSCAR 45: warm light from above only, thin glazes in the dark) and 「Hamlet」 (1948, OPUSCAR 21: deep focus, a cold dawn).
// One locked-off camera; the only things that move are the light and the big shadow on the wall:
//   288.3   the hall before sunrise: blue light falls from the high window on the right in a shaft full of dust; a brazier low on the
//           left throws the shadow of the high seat (the bema, the curule chair, the governor in it) huge up the back wall; in front of
//           it, small, a man stands with his back to us, his hands bound behind him; two soldiers by the wall, their spears' shadows.
//           Focus on the wall (the man is a soft dark shape).
//   N14 piece 2  the governor leans forward toward the man and lifts a hand — his shadow looms up the wall over the small figure.
//   L5      rack focus 1 s: the shadow of the seat → the bound hands (the rope round the wrists).
//   Q5      the sun clears the hills: the shaft warms from blue to gold, brightens and swings down onto the bound man (the patch of
//           light slides across the paving to his feet and climbs him); the governor sits back — his shadow shrinks.
//   N14b    the brazier sinks to embers (the seat's shadow fades); on 「칼과 군대로」 the torch by the soldiers gutters — the spears'
//           shadows soften and go; the room is held by the dawn alone.
//   end     (round 2, coordinator: 4a opens with the wall → sky move, so no tilt here) the dawn settles on the bound man — the patch
//           of light on him brightens while the room round him sinks to warm dark — and on that calm beat the cut to 4a's sunlit wall
//           (dark-to-warm, not sky-to-sky). Round 2 also: warm shadows (no bluish blotches round the soldiers' shadows), the soldiers
//           darker and further back (only a rim), the picture lifted to ≥ 78 with the blacks kept.
// Opening: the previous block ends on a lone silhouette on the night hill (Doré lines, x ≈ .73 W) — here the bound man stands at
// x ≈ .66 W, small, the same lone figure; the bright gap (the shaft) is in the upper right as the engraved sky was.
// Engine: motion-skills cinematic-3d (lib3d/cine.js, kit.js) + people3d.js (robeMan / legionary, two-bone IK with fixed lengths,
// elbows down and out). Passes after this film's roof-table-3d.js (2부 「카라바조 방」, same author's code, copied and changed here):
//   shaft  a ray march to the scene depth; a sample is lit when the line from it toward the sun passes the window opening;
//   oil    Kuwahara patches + a brush grain along the form, thick in the light, glazed in the dark — with NO per-frame noise
//          (owner: no flicker), the film's frame index frozen (fixed dither/grain), as dawn-wall3d.js does;
// then the page lays OIL.varnish (kit-oilpaint.js = canvas-film kits/oilpaint, key rembrandt) over the frame.
// Skills read: canvas-film kits/oilpaint STYLE.md (rembrandt key: readable umber darks ≈ 70 %, one light; caravaggio key: a king's
// shadow on the wall by firelight — example.caravaggio.js 'shadow'), cinecode camera-moves (locked off · rack focus · tilt up = awe),
// cinematic-3d (DOF, height fog, PCF shadows), oil-paint-world (looked at; its world-pinned dabs need a baked world — the room's
// moving shadows are the point here, so the screen-space oil pass of roof-table-3d.js was chosen).
// No face anywhere: the bound man is seen only from behind; the governor is mostly his shadow (his face set back and dark).
// API: const PR = await (await import('./rembrandt-praetorium.js')).build(W, H);  PR.draw(ctx, t, B)  t = FILM seconds,
//      B = { N14, L5, Q5, N14b, END, pc: { N14: [..], N14b: [..] } } (pc = the '/' piece times on screen). Pure in t.
import { Film, THREE, V, col } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const { clamp, lerp, ss } = P;
const sine = x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

// ---------------------------------------------------------------- the one table: every visual time from the line times
export function beats(B) {
  const pc = B.pc || {}, n14b = pc.N14b ? pc.N14b[1] : B.N14b + 5.7, n14 = pc.N14 ? pc.N14[1] : B.N14 + 4.6;
  const T = { start: B.N14, end: B.END };
  T.lean = [n14 - .1, n14 + 2.3];                 // the governor leans toward the man, a hand lifts (his shadow looms)
  T.hand = [n14 + .5, n14 + 2.6];
  T.rack = [B.L5 + .35, B.L5 + 1.35];              // rack focus 1 s: the seat's shadow → the bound hands
  T.dawn = [B.Q5 + .15, B.Q5 + 4.6];               // the sun clears the hills: blue → gold, the shaft swings onto him
  T.back = [B.Q5 + .7, B.Q5 + 3.6];                // the governor sits back: the shadow shrinks
  T.sink = [B.N14b + .3, B.N14b + 3.8];            // the brazier sinks to embers
  T.spear = [n14b + .15, n14b + 2.6];              // 「칼과 군대로」: the torch gutters, the spears' shadows soften and go
  T.tilt = [n14b + 3.0, n14b + 6.4];               // (round 2: no tilt any more — the reference time for the end beat)
  T.settle = [n14b + 2.6, B.END - .3];             // round 2 end: the dawn settles on the bound man, the room sinks to warm dark (cut to 4a's wall)
  return T;
}

export async function build(W, H) {
  const FOV = 52;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .05, far: 400,
    atmos: { density: .0045, falloff: .02, base: 0, start: .5, color: col('#1c2030', .4), colorUp: col('#20263a', .45), max: 60, scatter: .8, anisotropy: .6, phaseMix: .6 },
    bloom: { strength: .07, radius: 1.1, tint: col('#ffd9a8') },
    dof: { focus: 13, aperture: 26, maxCoc: 22 },
    look: { exposure: 1.0, contrast: 1.3, saturation: .98, lift: col('#120c08'), shadowTint: col('#ead8c2'), highTint: col('#ffeacc'), vignette: .42, grain: .02, ca: .2 },
  });
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither / grain (no per-frame shimmer)
  film.canvas.style.display = 'none';
  const R = film.renderer; R.shadowMap.type = THREE.PCFShadowMap;           // PCF (not soft): shadow.radius blurs (the spears' shadows soften)
  const S = film.scene, cam = film.camera;
  let T = null;
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;

  // ---------------------------------------------------------------- the hall (metres; the back wall at z = −10, the camera at z ≈ 3)
  const ZW = -10, XL = -7, XR = 4.6, HC = 8.6;                              // back wall, left wall, right wall, ceiling
  const WIN = { y0: 4.1, y1: 6.7, z0: -7.9, z1: -6.1 };                    // the high window in the right wall
  const OPEN = { x0: -2.7, x1: 3.3, z0: -4.8, z1: 1.8 };                    // the compluvium (the roof's opening)
  const stone = K.stoneMaterial({ color: '#b8ab94', course: .52, block: 1.15, grime: .25, roughness: .9 });
  const pave = K.stoneMaterial({ color: '#b09c80', course: .9, block: 1.3, grime: .12, roughness: .8 });
  const plaster = (base, key) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .95 });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + hashGLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 N = normalize(vWN); vec2 q = abs(N.y) > .7 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
            float big = fb(q * .45 + 3.1), fine = fb(q * 3.3);
            diffuseColor.rgb *= mix(.8, 1.1, big) * mix(.92, 1.05, fine) * (1. - .22 * smoothstep(1.4, 0., vWP.y)); }`); };
    m.customProgramCacheKey = () => 'pr-pl-' + key; return m; };
  const wallM = plaster('#a89a84', 'w'), darkWood = K.std('#2a1a10', { roughness: .9 }), iron = K.std('#2a2420', { roughness: .6, metalness: .4 });
  const box = (w, h, d, x, y, z, m, cast = true) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = cast; b.receiveShadow = true; S.add(b); return b; };
  // floor (the pavement), back wall (ashlar to the cornice, plaster above), side walls (the right one with the window hole), ceiling with the opening
  box(XR - XL + 2, .2, 22, (XR + XL) / 2, -.1, -.5, pave);
  box(XR - XL, 6.2, .5, (XR + XL) / 2, 3.1, ZW - .25, stone);
  box(XR - XL, HC - 6.2, .5, (XR + XL) / 2, 6.2 + (HC - 6.2) / 2, ZW - .25, wallM);
  box(XR - XL, .32, .34, (XR + XL) / 2, 6.25, ZW + .05, stone);                                       // the cornice band
  for (const px of [-4.6, 3.55]) box(.7, 6.1, .26, px, 3.05, ZW + .1, stone);                          // pilasters at the edges (clear of the shadow)
  box(.5, HC, 22, XL - .25, HC / 2, -.5, wallM);
  { const zA = ZW, zB = 8; // right wall around the window: below, above, behind, in front
    box(.5, WIN.y0, zB - zA, XR + .25, WIN.y0 / 2, (zA + zB) / 2, wallM);
    box(.5, HC - WIN.y1, zB - zA, XR + .25, (HC + WIN.y1) / 2, (zA + zB) / 2, wallM);
    box(.5, WIN.y1 - WIN.y0, WIN.z0 - zA, XR + .25, (WIN.y0 + WIN.y1) / 2, (zA + WIN.z0) / 2, wallM);
    box(.5, WIN.y1 - WIN.y0, zB - WIN.z1, XR + .25, (WIN.y0 + WIN.y1) / 2, (WIN.z1 + zB) / 2, wallM);
    box(.12, .12, WIN.z1 - WIN.z0, XR + .1, (WIN.y0 + WIN.y1) / 2, (WIN.z0 + WIN.z1) / 2, darkWood); }   // the window's crossbar
  { const z0 = ZW, z1 = 8, x0 = XL, x1 = XR, t = .4, y = HC + t / 2;                                     // the roof slab round the opening
    box(x1 - x0, t, OPEN.z0 - z0, (x0 + x1) / 2, y, (z0 + OPEN.z0) / 2, darkWood);
    box(x1 - x0, t, z1 - OPEN.z1, (x0 + x1) / 2, y, (OPEN.z1 + z1) / 2, darkWood);
    box(OPEN.x0 - x0, t, OPEN.z1 - OPEN.z0, (x0 + OPEN.x0) / 2, y, (OPEN.z0 + OPEN.z1) / 2, darkWood);
    box(x1 - OPEN.x1, t, OPEN.z1 - OPEN.z0, (OPEN.x1 + x1) / 2, y, (OPEN.z0 + OPEN.z1) / 2, darkWood);
    for (let i = 0; i < 9; i++) { const bz = ZW + .9 + i * 2.1; if (bz > OPEN.z0 - .3 && bz < OPEN.z1 + .3) continue; box(x1 - x0, .34, .26, (x0 + x1) / 2, HC - .17, bz, darkWood); }
    // the opening's frame: a stone kerb with a lip, and two beams across it (the sky reads between them)
    for (const [w, d, x, z] of [[OPEN.x1 - OPEN.x0 + .6, .3, (OPEN.x0 + OPEN.x1) / 2, OPEN.z0 - .15], [OPEN.x1 - OPEN.x0 + .6, .3, (OPEN.x0 + OPEN.x1) / 2, OPEN.z1 + .15], [.3, OPEN.z1 - OPEN.z0, OPEN.x0 - .15, (OPEN.z0 + OPEN.z1) / 2], [.3, OPEN.z1 - OPEN.z0, OPEN.x1 + .15, (OPEN.z0 + OPEN.z1) / 2]])
      box(w, .5, d, x, HC + .1, z, stone);
  }
  // the bema (the judgment seat): a stone platform with two steps, a curule chair with X legs on it
  const BEMA = { x: -3.1, z: -7.35, w: 2.5, d: 1.9, h: .72 };
  box(BEMA.w, BEMA.h, BEMA.d, BEMA.x, BEMA.h / 2, BEMA.z, stone);
  box(BEMA.w + .5, BEMA.h * .5, .45, BEMA.x, BEMA.h * .25, BEMA.z + BEMA.d / 2 + .22, stone);
  box(BEMA.w + .4, .06, BEMA.d + .1, BEMA.x, BEMA.h + .03, BEMA.z, K.std('#3a1c14', { roughness: .95 }));   // a red cloth on it
  const SEAT = { x: BEMA.x + .1, z: BEMA.z - .25, y: BEMA.h + .5 };
  { const g = new THREE.Group(); g.position.set(SEAT.x, BEMA.h, SEAT.z); S.add(g); g.rotation.y = -2.19;
    for (const sd of [-1, 1]) for (const fb2 of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .62, 6), iron); l.position.set(sd * .24, .26, 0); l.rotation.x = fb2 * .62; l.castShadow = true; g.add(l); }
    const seat = new THREE.Mesh(new THREE.BoxGeometry(.56, .05, .44), darkWood); seat.position.y = .5; seat.castShadow = true; g.add(seat);
    for (const sd of [-1, 1]) { const k = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), iron); k.position.set(sd * .27, .54, 0); g.add(k); } }   // a curule chair (no back): the man on it IS the high seat's shadow

  // ---------------------------------------------------------------- people
  const faceM = K.std('#1a110a', { roughness: 1 });
  const govM = K.std('#d2c6ae', { roughness: .95, side: THREE.DoubleSide }), govT = K.std('#7a2a1e', { roughness: .95, side: THREE.DoubleSide });
  const gov = P.robeMan({ h: 1.76, broad: 1.08, mat: govM, cloth: govT, face: faceM, head: 'cloth' });
  P.headwear(gov, 'bare', { dark: K.std('#1a120c', { roughness: 1 }) });
  { const n = gov.userData.neck; const beard = n.children[n.children.length - 1]; n.remove(beard); }   // a Roman: clean-shaven
  gov.position.set(SEAT.x, BEMA.h, SEAT.z + .04); gov.rotation.y = -2.19; S.add(gov);   // facing the bound man (off frame: we see his shadow)
  const robeJ = K.std('#76664e', { roughness: .95, side: THREE.DoubleSide }), clothJ = K.std('#8a7a60', { roughness: .95, side: THREE.DoubleSide });
  const man = P.robeMan({ h: 1.76, mat: robeJ, cloth: clothJ, face: faceM, head: 'hood' });
  { const mt = man.userData.shoulders.children[0]; if (mt) mt.scale.y = .42; }   // a short shawl (not the long mantle): the bound hands show below it
  const MANP = V(1.05, 0, -4.7); man.position.copy(MANP); man.rotation.y = .32; S.add(man);   // facing the seat (back to us), a little turned
  // the rope: two turns round the crossed wrists and a short hanging end (placed at his hands every frame)
  const rope = new THREE.Group(); man.add(rope); const ropeM = K.std('#b09a70', { roughness: 1 });
  for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.048, .013, 6, 16), ropeM); r.position.x = (i - 1) * .022; r.rotation.y = Math.PI / 2; r.castShadow = true; rope.add(r); }
  { const e = new THREE.Mesh(new THREE.CylinderGeometry(.007, .006, .32, 5), ropeM); e.position.set(.01, -.17, .02); e.rotation.z = .12; rope.add(e); }
  const metal = K.std('#5a5048', { roughness: .45, metalness: .6 }), shieldM = K.std('#3a1a14', { roughness: .8 }), wood = K.std('#4a3420', { roughness: .9 }), crestM = K.std('#4a1810', { roughness: .9 });
  const darkMetal = K.std('#2a2420', { roughness: .5, metalness: .5 }), darkShield = K.std('#1e120e', { roughness: .85 });   // round 2: the soldiers sink into the gloom (only a rim catches)
  const soldiers = [[2.85, -9.45, -.35, .13], [-1.05, -9.55, .25, .61]].map(([x, z, ry, ph]) => { const s = P.legionary({ h: 1.68, mat: K.std('#1c1410', { roughness: .95, side: THREE.DoubleSide }), skin: faceM, metal: darkMetal, shieldM: darkShield, wood, crestM, bind: metal });
    s.position.set(x, 0, z); s.rotation.y = ry; s.userData.ph = ph; S.add(s); return s; });
  S.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // ---------------------------------------------------------------- lights
  // the brazier low on the floor in front of the bema, left of the governor (off frame left): its fire throws the seat up the wall
  const BRZ = V(-3.95, .78, -6.1);
  { const g = new THREE.Group(); g.position.set(BRZ.x, 0, BRZ.z); S.add(g);
    for (let i = 0; i < 3; i++) { const a = i * 2.094, l = new THREE.Mesh(new THREE.CylinderGeometry(.018, .022, .72, 5), iron); l.position.set(Math.cos(a) * .16, .34, Math.sin(a) * .16); l.rotation.set(Math.sin(a) * .22, 0, -Math.cos(a) * .22); g.add(l); }
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(.26, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), iron); bowl.position.y = .7; g.add(bowl); }
  const coals = new THREE.Mesh(new THREE.CircleGeometry(.24, 18), K.glow('#ff7a2a', 3)); coals.rotation.x = -Math.PI / 2; coals.position.set(BRZ.x, .69, BRZ.z); S.add(coals);
  const fire = new THREE.PointLight(col('#ffa45a'), 30, 0, 2); fire.position.copy(BRZ); fire.castShadow = true;
  fire.shadow.mapSize.set(2048, 2048); fire.shadow.bias = -.0015; fire.shadow.radius = 2.5; fire.shadow.camera.near = .15; S.add(fire);
  const fireLamp = film.lamp(BRZ.clone().add(V(0, .1, 0)), '#ff9a50', { power: 1.2, size: .3, fog: 1 });
  // a torch in an iron bracket on the right pilaster (off frame right, near the soldiers): it throws the spears across the wall
  const TOR = V(4.05, 2.45, -8.25);
  const torch = new THREE.PointLight(col('#ffa860'), 9, 0, 2); torch.position.copy(TOR); torch.castShadow = true;
  torch.shadow.mapSize.set(1024, 1024); torch.shadow.bias = -.002; torch.shadow.radius = 2; torch.shadow.camera.near = .15; S.add(torch);
  const torchLamp = film.lamp(TOR, '#ffb070', { power: .5, size: .2, fog: 1 });
  // the dawn: a sun low over the hills (east, through the window on the right); its direction swings up as it clears them
  const Ld0 = V(1.0, .98, .12).normalize(), Ld1 = V(.62, 1, -.33).normalize();   // patch near the wall → patch on the bound man
  const sun = new THREE.DirectionalLight(col('#9fb4e0'), 0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: .5, far: 60 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02; sun.shadow.radius = 7;
  S.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(col('#8a8070'), col('#3a2c20'), .5); S.add(hemi);   // the sky light through the roof opening
  const amb = new THREE.AmbientLight(col('#5a4030'), .1); S.add(amb);
  // the dawn sky over the opening — after dawn-wall3d.js's sky (this film, 4부 opening: a broken deck of cloud lit at its edges),
  // rewritten for a sky seen straight up at sunrise: the sun just over the eastern hills (+x), the undersides of the cloud deck
  // catching it rose-gold, pale clear sky between; uK brightens it as the sun clears the hills (no per-frame noise: the clouds
  // drift with t only).
  const SKYSUN = V(.93, .1, -.36).normalize();
  const sky = (() => {
    const u = { ...film.fogU, sunDir: { value: SKYSUN.clone() }, uK: { value: 0 }, uT: { value: 0 }, skyFogMax: { value: film.atmos.max } };
    const m = new THREE.ShaderMaterial({ uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: `varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 0.)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.)).xyz, 1.); gl_Position = p.xyww; }`,
      fragmentShader: `varying vec3 vD; uniform vec3 sunDir; uniform float uK, uT;
        ${hashGLSL}
        void main(){ vec3 d = normalize(vD); float y = max(d.y, 0.), s = max(dot(d, sunDir), 0.);
          vec3 c = mix(vec3(1.0, .72, .5), vec3(.42, .54, .78), smoothstep(.0, .4, y)); c = mix(c, vec3(.2, .32, .58), smoothstep(.4, 1., y));
          c += vec3(1., .78, .5) * pow(s, 3.) * .55;
          vec2 p = d.xz / (y + .3) * 4.2 + vec2(uT * .02, uT * .008);
          float n = fb(p * 1.1) * .6 + fb(p * 3.3 + 3.) * .28 + fb(p * 9. + 7.) * .12, m = smoothstep(.44, .58, n), thick = smoothstep(.56, .78, n);
          float lit = (.35 + .65 * pow(clamp(dot(normalize(vec3(d.x, 0., d.z) + 1e-4), normalize(vec3(sunDir.x, 0., sunDir.z))) * .5 + .5, 0., 1.), 2.)) * (1. - thick * .55);
          vec3 cc = mix(vec3(.46, .4, .52), vec3(.22, .2, .3), thick) + vec3(1.35, .58, .28) * lit * (.8 + 1.0 * uK) * (1. - .6 * thick) + vec3(1., .9, .7) * pow(1. - thick, 3.) * lit * .5 * uK;
          c = mix(c, cc, m * .93);
          gl_FragColor = vec4(c * (.2 + .16 * uK), 0.); }` });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(300, 48, 24), m); mesh.frustumCulled = false; mesh.renderOrder = -10;
    film.onFrame((t, f) => { mesh.position.setFromMatrixPosition(f.camera.matrixWorld); u.uT.value = t; });
    S.add(mesh); return { mesh, u };
  })();

  // ---------------------------------------------------------------- the shaft pass and the oil pass (after roof-table-3d.js)
  const FS = (frag, uniforms) => { const m = new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    const sc = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); q.frustumCulled = false; sc.add(q); return { m, sc, u: m.uniforms }; };
  const ocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const rtOpt = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
  const rtA = new THREE.WebGLRenderTarget(film.w, film.h, rtOpt), rtB = new THREE.WebGLRenderTarget(film.w, film.h, rtOpt);
  const shaftP = FS(`varying vec2 vUv; uniform sampler2D tColor, tDepth; uniform mat4 projInv, camWorld; uniform vec3 camPos, sunCol, L; uniform float time, kS, manK; uniform vec3 manP;
    ${hashGLSL}
    float n3(vec3 p){ return vn(p.xz * 1.7 + p.y * .9 + vec2(time * .12, -time * .07)) * .6 + vn(p.zy * 4.1 - p.x * 1.3 + vec2(time * .16, time * .05)) * .4; }   // dust drifting through the beam
    float inWin(vec3 p){ if (p.x > ${XR.toFixed(2)}) return 0.; vec3 q = p + L * ((${XR.toFixed(2)} - p.x) / L.x);
      float k = smoothstep(${WIN.y0.toFixed(2)} - .03, ${WIN.y0.toFixed(2)} + .06, q.y) * smoothstep(${WIN.y1.toFixed(2)} + .03, ${WIN.y1.toFixed(2)} - .06, q.y) * smoothstep(${WIN.z0.toFixed(2)} - .03, ${WIN.z0.toFixed(2)} + .06, q.z) * smoothstep(${WIN.z1.toFixed(2)} + .03, ${WIN.z1.toFixed(2)} - .06, q.z);
      k *= 1. - smoothstep(.05, .02, abs(q.y - ${((WIN.y0 + WIN.y1) / 2).toFixed(2)}));   // the crossbar
      // the man stands in the light at the end: the shaft behind him (between him and the floor patch) is his shadow
      vec3 r = p + L * ((manP.z - p.z) / L.z); float body = r.y < manP.y + 1.45 ? .2 : .12;
      k *= 1. - manK * smoothstep(body + .03, body - .03, abs(r.x - manP.x)) * step(r.y, manP.y + 1.78) * step(0., r.y) * step(p.z, manP.z + 4.) * step(manP.z, p.z + 20.) * step(0., (p.z - manP.z) * -sign(L.z));
      return k; }
    void main(){
      vec4 c = texture2D(tColor, vUv); float dz = texture2D(tDepth, vUv).x;
      vec4 ndc = vec4(vUv * 2. - 1., dz * 2. - 1., 1.), vp = projInv * ndc; vp /= vp.w; vec3 wp = (camWorld * vec4(vp.xyz, 1.)).xyz, rd = normalize(wp - camPos);
      float D = min(length(wp - camPos), 22.); const int N = 56; float dt = D / float(N), j = hh(gl_FragCoord.xy);   // a FIXED dither
      vec3 acc = vec3(0.);
      for (int i = 0; i < N; i++){ vec3 p = camPos + rd * dt * (float(i) + j);
        float k = inWin(p); if (k > 0.){ float dust = .2 + 1.6 * smoothstep(.45, .88, n3(p * 1.2)); acc += sunCol * k * dust * (1. + 1.4 * pow(max(dot(rd, L), 0.), 6.)); } }
      vec3 s = acc * dt * .075 * kS;
      gl_FragColor = vec4(c.rgb + s * (1. - c.rgb * .5), 1.);
    }`, { tColor: { value: null }, tDepth: { value: null }, projInv: { value: new THREE.Matrix4() }, camWorld: { value: new THREE.Matrix4() }, camPos: { value: V() }, sunCol: { value: col('#9fb4e0') }, L: { value: Ld0.clone() }, time: { value: 0 }, kS: { value: 1 }, manK: { value: 0 }, manP: { value: MANP.clone() } });
  const oilP = FS(`varying vec2 vUv; uniform sampler2D tIn; uniform vec2 px;
    ${hashGLSL}
    float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
    void main(){
      // Kuwahara (4 quadrants, radius 4): flat loaded patches, edges kept
      const int R = 4; vec3 m[4]; vec3 s2[4]; for (int k = 0; k < 4; k++){ m[k] = vec3(0.); s2[k] = vec3(0.); }
      for (int y = 0; y <= R; y++) for (int x = 0; x <= R; x++){
        vec3 a = texture2D(tIn, vUv + vec2(-x, -y) * px).rgb, b = texture2D(tIn, vUv + vec2(x, -y) * px).rgb, c = texture2D(tIn, vUv + vec2(x, y) * px).rgb, d = texture2D(tIn, vUv + vec2(-x, y) * px).rgb;
        m[0] += a; s2[0] += a * a; m[1] += b; s2[1] += b * b; m[2] += c; s2[2] += c * c; m[3] += d; s2[3] += d * d; }
      float n = float((R + 1) * (R + 1)), best = 1e9; vec3 col = vec3(0.);
      for (int k = 0; k < 4; k++){ vec3 mu = m[k] / n, v = abs(s2[k] / n - mu * mu); float sv = v.r + v.g + v.b; if (sv < best){ best = sv; col = mu; } }
      // the brush: a grain along the form (perpendicular to the brightness gradient), loaded on the lights, glazed in the darks
      float l = lum(col), gx = lum(texture2D(tIn, vUv + vec2(3., 0.) * px).rgb) - lum(texture2D(tIn, vUv - vec2(3., 0.) * px).rgb), gy = lum(texture2D(tIn, vUv + vec2(0., 3.) * px).rgb) - lum(texture2D(tIn, vUv - vec2(0., 3.) * px).rgb);
      float ang = atan(gy, gx) + 1.5708; if (abs(gx) + abs(gy) < .012) ang = .35 + .18 * (vn(vUv * vec2(2.2, 1.3)) - .5);   // flat areas: calm, nearly level strokes (no swirl)
      vec2 p = gl_FragCoord.xy, d = vec2(cos(ang), sin(ang)), e = vec2(-d.y, d.x); vec2 q = vec2(dot(p, d) / 13., dot(p, e) / 2.6);
      float br = vn(q) * .65 + vn(q * 2.1 + 7.) * .35, load = smoothstep(.1, .55, l);
      col *= 1. + (br - .5) * mix(.04, .15, load);
      col += vec3(1., .94, .82) * smoothstep(.72, .95, br) * smoothstep(.4, .8, l) * .06;   // a ridge of light paint
      gl_FragColor = vec4(col, 1.);
    }`, { tIn: { value: null }, px: { value: new THREE.Vector2(1 / film.w, 1 / film.h) } });
  const realSRT = R.setRenderTarget.bind(R);
  function renderAll(t) {
    if (window.__NOREN) return;   // debug (joint measurement): poses only, no GPU work
    R.setRenderTarget = (tg, ...a) => realSRT(tg === null ? rtA : tg, ...a);
    try { film.render(t); } finally { R.setRenderTarget = realSRT; }
    const u = shaftP.u; u.tColor.value = rtA.texture; u.tDepth.value = film.sceneRT.depthTexture;
    u.projInv.value.copy(cam.projectionMatrixInverse); u.camWorld.value.copy(cam.matrixWorld); u.camPos.value.setFromMatrixPosition(cam.matrixWorld); u.time.value = t;
    realSRT(rtB); R.render(shaftP.sc, ocam);
    oilP.u.tIn.value = rtB.texture; realSRT(null); R.render(oilP.sc, ocam);
  }

  // ---------------------------------------------------------------- the frame
  const CAM = V(.45, 1.0, 3.0);
  const flick = t => .87 + .08 * Math.sin(t * 2.3) + .05 * Math.sin(t * 3.7 + 1.3);   // the fire breathes (smooth — never a flicker)
  function frame(t) {
    // the governor: seated on the curule chair; leans toward the man and lifts a hand (N14 piece 2), sits back at Q5
    const lean = eio((t - T.lean[0]) / (T.lean[1] - T.lean[0])) * (1 - eio((t - T.back[0]) / (T.back[1] - T.back[0]))), hk = ss(T.hand[0], T.hand[1], t) * (1 - ss(T.back[0], T.back[0] + 1.8, t));
    const chin = ss(T.back[1] - .4, T.back[1] + 1.8, t) * (1 - ss(T.tilt[0] - 2.5, T.tilt[0] - .3, t)), away = sine((t - T.back[1]) / 4.5) * (1 - ss(T.tilt[0] - 2, T.tilt[0], t));
    { const U = gov.userData, s = U.s, sit = P.rockSit(.5, s, { tuck: .06, lean: -.05 }), id = P.idle(t, .3, { s }), br = P.breath(t, .3);
      const hR = V(.13 * s, U.hipY + sit.bob + .1 * s, -.34 * s).lerp(V(.2 * s, 1.18 * s + sit.bob, -.52 * s), hk);   // the right hand from the knee up into a gesture
      const hL = V(-.12 * s, U.hipY + sit.bob + .07 * s, -.32 * s).lerp(V(-.06 * s, 1.2 * s + sit.bob, -.2 * s), chin);   // later the hand to the chin
      P.pose(gov, { bob: sit.bob, feet: sit.feet, lean: -.08 - .55 * lean + .04 * Math.sin(t * .55), twist: .05 * lean + id.twist * .5 + .06 * Math.sin(t * .31), side: .03 * Math.sin(t * .23), breath: br,
        head: [-.05 + .12 * lean - .08 * chin, -.08 + .05 * Math.sin(t * .3) + .45 * away], hands: [hL, hR] }); }
    // the bound man: upright and still but alive (breath, a slow weight shift); hands crossed behind at the small of the back
    { const U = man.userData, s = U.s, id = P.idle(t, .62, { s });
      const wR = V(.03 * s, .9 * s + id.bob, .16 * s), wL = V(-.03 * s, .92 * s + id.bob, .16 * s);
      P.pose(man, { ...id, side: id.side * .6, twist: id.twist * .4, head: [.02 + .015 * Math.sin(t * .31), .04 * Math.sin(t * .17)], hands: [wL, wR] });
      man.updateMatrix(); const a = P.handAt(man, 0), b = P.handAt(man, 1); rope.position.copy(a).add(b).multiplyScalar(.5); }
    soldiers.forEach((p, i) => { const id = P.idle(t, p.userData.ph, { s: p.userData.s }); P.soldierPose(p, { ...id, head: [-.03, .1 * Math.sin(t * .2 + i)] }); });
    // light
    const dk = sine((t - T.dawn[0]) / (T.dawn[1] - T.dawn[0])), sink = sine((t - T.sink[0]) / (T.sink[1] - T.sink[0])), sp = sine((t - T.spear[0]) / (T.spear[1] - T.spear[0]));
    const Ld = Ld0.clone().lerp(Ld1, dk).normalize();
    sun.position.copy(Ld).multiplyScalar(30).add(V(0, 0, -6)); sun.target.position.set(0, 0, -6);
    const st = sine((t - T.settle[0]) / (T.settle[1] - T.settle[0]));
    sun.color.copy(col('#c8bcae')).lerp(col('#ffc27a'), dk); sun.intensity = lerp(3.4, 9.5, dk) + 2.5 * st;
    shaftP.u.L.value.copy(Ld); shaftP.u.sunCol.value.copy(col('#cac0b4')).lerp(col('#ffcf8a'), dk); shaftP.u.kS.value = lerp(1.7, 2.1, dk) + .5 * st; shaftP.u.manK.value = dk;
    const fk = flick(t) * lerp(1, .62, dk) * lerp(1, .2, sink);
    fire.intensity = 30 * fk; fireLamp.power = 1.2 * fk; coals.material.color.copy(col('#ff7a2a', 3 * lerp(1, .5, sink)));
    torch.intensity = 9 * flick(t + 3.1) * (1 - sp) * lerp(1, .8, dk); torchLamp.power = .5 * (1 - sp); torch.shadow.radius = lerp(2, 14, sp);
    hemi.intensity = lerp(.5, .55, dk) * (1 - .7 * st); hemi.color.copy(col('#8a8070')).lerp(col('#c8b49a'), dk); film.look.vignette = .42 + .3 * st;   // the room sinks into warm dark round him
    film.look.exposure = lerp(3.75, 3.4, dk) + .1 * sink;
    sky.u.uK.value = dk;
    // camera: nearly locked off (a slow creep in); rack focus
    const pk = 0, pitch = .4 * Math.PI / 180;   // round 2: no tilt (4a opens with the wall → sky move)
    const cu = clamp((t - T.start) / (T.end - T.start)), creep = (cu * .8 + .2 * sine(cu)) * 1.25; cam.position.copy(CAM).add(V(.2 * creep, .05 * creep, -1.55 * creep)); cam.up.set(0, 1, 0); cam.lookAt(cam.position.clone().add(V(-.012, Math.sin(pitch), -Math.cos(pitch))));   // a slow creep in (≈ 4 cm/s) toward him (he stays near the right third): nearly locked off — the shadow and the light carry the shot
    const rk = sine((t - T.rack[0]) / (T.rack[1] - T.rack[0])), dWall = cam.position.z - ZW + .2, dMan = Math.hypot(MANP.x - cam.position.x, MANP.z - cam.position.z) + .15;   // from where the camera is now (it creeps)
    film.dofCfg.focus = Math.exp(lerp(lerp(Math.log(dWall), Math.log(dMan), rk), Math.log(14), pk));
    film.dofCfg.aperture = lerp(26, 0, pk);
    renderAll(t);
  }
  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    frame(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    if (window.OIL) OIL.varnish(ctx, .32);
  }
  S.updateMatrixWorld(true);
  return { film, draw, beats: () => T, people: { gov, man, soldiers } };
}
