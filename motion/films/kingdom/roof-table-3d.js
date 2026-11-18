// roof-table-3d.js — 「kingdom」 2부, round 2: the two Caravaggio rooms rebuilt in 3D (owner, 2026-11-19: "네 제안대로").
//   N45 · Q42 · N45b — the roof opened above the paralytic (Mk 2:4–5)   ·   N46 · Q43 · N46b · N46c — the tax collector's table (Lk 15:2)
// After Caravaggio's 「The Calling of Saint Matthew」 (one hard shaft from a high window across a dark room to a table) and his
// 「Supper at Emmaus」 darks; 「The Godfather」's top light (OPUSCAR 45). Same engine as the village (lib3d/cine.js), then:
//   shaft pass  the ONE hard light made visible: a ray march through the room per pixel up to the scene depth; a sample is lit
//               when the line from it to the sun passes the opening (roof hole / window / door) and nothing we know of blocks it
//               (the stretcher, the three in the doorway) — so the beam really has the hole's shape, dust drifting in it.
//   oil pass    the render repainted: a Kuwahara filter lays the picture in flat loaded patches, a brush grain runs along the
//               form (perpendicular to the luminance gradient), thick on the lit planes, thin glaze in the darks; then the page
//               lays OIL.varnish (amber + canvas weave) over it.
// Figures are dark masses with only an edge of light (a rim term toward the light in every robe), like the village's backlit
// silhouettes; the blacks are warm umber and lifted (the phone must read the room).
//   ROOF  four men kneel at the torn roof against the sky and pay the ropes out hand over hand; the stretcher comes down through
//         the light (the camera tilts down with it); it settles. Q42: the light settles on the man and breathes; N45b: it warms.
//         The King sits low in the foreground, from behind (head cloth, no face, no glow).
//   TABLE a shutter swings open and the window's shaft crosses the table (N46); they eat, pass the bread, turn to each other;
//         the King at the near side, his back to us, hands the bread across. Q43: three stand in the bright doorway, lean
//         together and point — their shadows stretch across the floor toward the table. N46b: they turn and walk off, the door
//         swings to; only the table's light remains. N46c: a slow push toward his back and the light on the table.
// API: const R = await (await import('./roof-table-3d.js')).build(W, H);  R.draw(ctx, t, B)  t = FILM seconds,
//      B from script.json (N45 Q42 N45b N46 Q43 N46b N46c Q44). Every visual time comes from beats(). Pure in t.
import { Film, THREE, V, col, rng } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const { clamp, lerp, ss } = P;
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const lv = (a, b, k) => a.clone().lerp(b, k);

export function beats(B) {
  const T = {};
  T.roof0 = B.N45; T.white1 = B.N45 + 1.0;                                // in from the white of the village sun
  T.down0 = B.N45 + .5; T.down1 = B.N45 + 7.4;                            // the stretcher comes down (6.9 s, slow)
  T.tilt0 = B.N45 + 1.1; T.tilt1 = B.N45 + 6.6;                           // the camera tilts down with it
  T.cut1 = B.N45 + 7.7;                                                     // to the room: the man in the light, the King in front
  T.rest = B.Q42 + .1; T.warm0 = B.N45b; T.warm1 = B.N45b + 3.5;           // the light settles and breathes; it warms
  T.cut2 = B.N45b;                                                          // closer, over the King's shoulder
  T.table0 = B.N46; T.shut0 = B.N46 + .3; T.shut1 = B.N46 + 4.8;           // the shutter swings open: the shaft crosses the table
  T.bread = [B.N46 + 1.6, B.N46 + 3.6];                                     // the King hands the bread across
  T.whisper0 = B.Q43 + .2; T.point = B.Q43 + 1.6;                           // three in the doorway; one points
  T.leave = B.N46b + .2; T.door0 = B.N46b + 2.6; T.door1 = B.N46b + 5.4;   // they turn and walk off; the door swings to
  T.side0 = 1e9; T.side1 = 1e9;                           // from the side: the doorway, the floor, their shadows
  T.push0 = B.N46b + 2.9; T.end = B.Q44 + 1.0;                                    // the slow push toward his back and the table light
  return T;
}

export async function build(W, H) {
  const film = new Film({
    W, H, dur: 1e4, fov: 50, near: .05, far: 200,
    atmos: { density: .02, falloff: 0, base: 0, start: .5, color: col('#3a2414', .5), colorUp: col('#3a2616', .5), max: 60, scatter: 1, anisotropy: .6, phaseMix: .6 },
    bloom: { strength: .08, radius: 1.1, tint: col('#ffd9a8') },
    dof: { focus: 4, aperture: 2, maxCoc: 18 },
    look: { exposure: 1.0, contrast: 1.12, saturation: .95, lift: col('#33200f'), shadowTint: col('#f2dcc0'), highTint: col('#fff0d4'), vignette: .42, grain: .045, ca: .25 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera, R = film.renderer;
  let T = null;
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;

  // ---------------------------------------------------------------- materials: plaster, earth, wood; robes with a rim of light
  const RIM = { uRimP: { value: [V(), V()] }, uRimC: { value: [col('#ffcf96', 1), col('#ffd9a8', 1)] }, uRimK: { value: [1, 0] } };
  const rimify = (m, key, k = 1) => { m.onBeforeCompile = sh => { Object.assign(sh.uniforms, RIM); sh.uniforms.uRimS = { value: k };
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uRimP[2]; uniform vec3 uRimC[2]; uniform float uRimK[2]; uniform float uRimS;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec3 vp = -vViewPosition, Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 4.5);
            for (int i = 0; i < 2; i++){ vec3 Lp = (viewMatrix * vec4(uRimP[i], 1.)).xyz, dl = Lp - vp;
              float dir = smoothstep(-.2, .65, dot(normal, normalize(dl)));
              totalEmissiveRadiance += uRimC[i] * fr * dir * uRimK[i] * uRimS * .35 / (1. + dot(dl, dl) * .15); } }`); };
    m.customProgramCacheKey = () => 'rt-rim-' + key; return m; };
  const surfM = (base, key, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .95, ...o });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + hashGLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 N = normalize(vWN); vec2 q = abs(N.y) > .7 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
            float big = fb(q * .8 + 3.1), fine = fb(q * 6.1), st = smoothstep(.5, .66, fb(q * 2.2 + 7.));
            diffuseColor.rgb *= mix(.72, 1.12, big) * mix(.88, 1.06, fine) * (1. - st * .18); }`); };
    m.customProgramCacheKey = () => 'rt-surf-' + key; return m; };
  const M = { plaster: surfM('#b89a76', 'pl'), plaster2: surfM('#a88a68', 'pl2'), earth: surfM('#7a5c40', 'ea'), wood: surfM('#5a3c22', 'wd'), dark: surfM('#3a2818', 'dk'),
    reed: surfM('#6a4c2c', 'rd', { side: THREE.DoubleSide }), cloth: surfM('#c9b48e', 'cl'), skyM: K.glow('#fff3dc', 5.5), street: K.glow('#f5dcb2', 2.4) };
  const robeCols = ['#3a281c', '#4a2216', '#30281e', '#4e3a24', '#2a221a', '#3e3022', '#4a1e14', '#322c22'];
  const robes = robeCols.map((c, i) => rimify(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'r' + i));
  const skin = rimify(K.std('#5e3a22', { roughness: .75 }), 'sk', .8);
  const kingM = rimify(K.std('#9a8a70', { roughness: .95, side: THREE.DoubleSide }), 'kg', 1.1), kingC = rimify(K.std('#6e5e48', { roughness: .95, side: THREE.DoubleSide }), 'kc', 1.1);
  // round 3: robed figures (lathe profiles, hooded, the face set back and dark — never a lit face)
  const faceM = K.std('#1c120a', { roughness: 1 });
  const mk = o => P.robeMan({ face: faceM, ...o, mat: o.mat || robes[0] });
  const box = (w, h, d, x, y, z, m, parent) => { const b = new THREE.Mesh(K.roundedBox(w, h, d, Math.min(.03, w / 4, h / 4, d / 4), 2), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; parent.add(b); return b; };
  const face = (dx, dz) => Math.atan2(-dx, -dz);

  // ================================================================ ROOF (room A at the origin)
  const A = new THREE.Group(); S.add(A);
  const RW = 4.5, RH = 3.4;   // half-width of the room, ceiling height
  // the hole: a superellipse with a torn edge; the same function shapes the mesh and the light in the shaft pass
  const HOLE = { cx: 0, cz: 0, hx: 1.35, hz: .82 };
  const holeR = a => { const c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)); return Math.pow(Math.pow(c / HOLE.hx, 4) + Math.pow(s / HOLE.hz, 4), -.25) * (1 + .07 * Math.sin(3 * a + 1) + .045 * Math.sin(7 * a + 2) + .03 * Math.sin(13 * a + .5)); };
  { // floor, walls, the ceiling slab with the hole, beams broken at the hole, reeds hanging from its edge
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), M.earth); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; A.add(fl);
    for (const [x, z, ry, m] of [[0, -RW, 0, M.plaster], [-RW, 0, Math.PI / 2, M.plaster2], [RW, 0, -Math.PI / 2, M.plaster2], [0, RW, Math.PI, M.plaster]]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(2 * RW, RH + .4), m); w.position.set(x, (RH + .4) / 2 - .01, z); w.rotation.y = ry; w.receiveShadow = true; A.add(w); }
    const sh = new THREE.Shape(); sh.moveTo(-6, -6); sh.lineTo(6, -6); sh.lineTo(6, 6); sh.lineTo(-6, 6); sh.closePath();
    const hp = new THREE.Path(); for (let i = 0; i <= 96; i++) { const a = i / 96 * 6.2832, r = holeR(a); const x = HOLE.cx + Math.cos(a) * r, z = HOLE.cz + Math.sin(a) * r; i ? hp.lineTo(x, -z) : hp.moveTo(x, -z); } sh.holes.push(hp);
    const sg = new THREE.ExtrudeGeometry(sh, { depth: .32, bevelEnabled: false, curveSegments: 4 }); sg.rotateX(-Math.PI / 2);
    const slab = new THREE.Mesh(sg, M.reed); slab.position.y = RH; slab.castShadow = slab.receiveShadow = true; A.add(slab);
    for (let x = -RW + .3; x <= RW - .29; x += .55) {   // the beams under the roof run front to back; over the hole they were cut out
      const inHole = Math.abs(x - HOLE.cx) < HOLE.hx * 1.05;
      if (!inHole) { box(.18, .22, 2 * RW, x, RH - .11, 0, M.wood, A); continue; }
      const zr = HOLE.hz * Math.sqrt(Math.max(0, 1 - Math.pow((x - HOLE.cx) / (HOLE.hx * 1.08), 4))) * 1.05 + .08;
      for (const sd of [-1, 1]) { const len = RW - zr; box(.18, .22, len, x, RH - .11, sd * (zr + len / 2), M.wood, A); } }
    const r = rng(12), reedG = new THREE.CylinderGeometry(.008, .012, 1, 4); reedG.translate(0, -.5, 0);
    for (let i = 0; i < 70; i++) { const a = r() * 6.283, rr = holeR(a) * (1.0 + r() * .06), m = new THREE.Mesh(reedG, M.dark); m.position.set(Math.cos(a) * rr, RH + .05 + r() * .25, Math.sin(a) * rr); m.scale.y = .12 + r() * .35;
      m.rotation.set((r() - .5) * .9, r() * 6, (r() - .5) * .9); m.castShadow = true; A.add(m); }
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.skyM); sky.rotation.x = Math.PI / 2; sky.position.y = 9; A.add(sky);
    // clay bits and a couple of baskets / jars against the walls, a bench
    for (let i = 0; i < 6; i++) { const j = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 10), M.dark); j.scale.set(1, 1.35, 1); j.position.set(-RW + .35, .28, -2.6 + i * .5 + r() * .2); j.castShadow = j.receiveShadow = true; A.add(j); }
    box(2.4, .42, .45, RW - .3, .21, -1.4, M.wood, A);
  }
  // the hard light: the sun above the roof, a little from the side; only the hole lets it in
  const L1 = V(.1, 1, .06).normalize();
  const sunA = new THREE.DirectionalLight(col('#ffe6c0'), 7); sunA.position.copy(L1.clone().multiplyScalar(30)); sunA.target.position.set(0, 0, 0);
  sunA.castShadow = true; sunA.shadow.mapSize.set(2048, 2048); Object.assign(sunA.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 60 }); sunA.shadow.bias = -.0005; sunA.shadow.normalBias = .03; A.add(sunA, sunA.target);
  const poolA = new THREE.PointLight(col('#ffbf80'), .3, 4, 2); poolA.position.set(-.25, .45, -.15); A.add(poolA);    // the bounce off the lit floor/stretcher
  const hemiA = new THREE.HemisphereLight(col('#5a4632'), col('#2a1a10'), .14); A.add(hemiA);
  const lampA = film.lamp(V(-.2, 1.4, -.1), '#ffd9a8', { power: 0, size: .8, fog: 1 });
  // the stretcher: a mat on two poles, the man lying on it under a striped wool blanket, his head on a rolled cloth
  const ST = new THREE.Group(); A.add(ST);
  { for (const sd of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2.3, 8), M.wood); p.rotation.z = Math.PI / 2; p.position.set(0, .03, sd * .4); p.castShadow = p.receiveShadow = true; ST.add(p); }
    box(1.95, .03, .78, 0, .05, 0, M.reed, ST);
    const roll = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .4, 3, 8), M.cloth); roll.rotation.x = Math.PI / 2; roll.position.set(-.82, .12, 0); roll.castShadow = true; ST.add(roll); }
  const blanketM = new THREE.MeshStandardMaterial({ color: '#6e4a2c', roughness: .95, side: THREE.DoubleSide });
  blanketM.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLP;\n' + hashGLSL).replace('#include <map_fragment>', `#include <map_fragment>
      { float st = step(.5, fract(vLP.x * 2.1)) * step(fract(vLP.x * 2.1), .56); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.42, .16, .09), st * .25); diffuseColor.rgb *= mix(.85, 1.08, fb(vLP.xz * 22.)); }`); };
  blanketM.customProgramCacheKey = () => 'rt-blanket';
  const BLX = 1.5, BLZ = .74, blG = new THREE.PlaneGeometry(BLX, BLZ, 40, 16); blG.rotateX(-Math.PI / 2);
  { const pos = blG.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), u = (x + BLX / 2) / BLX;   // u 0 = chest end, 1 = feet
      const chest = Math.exp(-(((u - .12) / .15) ** 2)) * .2, hips = Math.exp(-(((u - .4) / .13) ** 2)) * .17, legs = Math.exp(-(((u - .64) / .1) ** 2)) * .17 + Math.exp(-(((u - .8) / .12) ** 2)) * .09, feet = Math.exp(-(((u - .96) / .035) ** 2)) * .15;
      const w = Math.exp(-((z / (u < .5 ? .22 : .15)) ** 2) * 1.2), legSplit = u > .55 ? 1 - .25 * Math.exp(-((z / .04) ** 2)) : 1;
      pos.setY(i, .07 + Math.max(chest, hips, legs, feet) * w * legSplit + .015 * Math.sin(x * 23 + z * 7) + (1 - w) * .02); }
    blG.computeVertexNormals(); }
  const blanket = new THREE.Mesh(blG, blanketM); blanket.position.x = .15; blanket.castShadow = blanket.receiveShadow = true; ST.add(blanket);
  const lying = new THREE.Group(); lying.position.set(-.72, .16, 0); ST.add(lying);   // his head and shoulders above the blanket, one arm on it
  { const hg = new THREE.Group(); lying.add(hg); lying.userData.hg = hg; const head = new THREE.Mesh(new THREE.SphereGeometry(.105, 16, 12), faceM); head.scale.set(1, .95, 1.05); hg.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.112, 14, 10, 0, Math.PI * 2, 0, Math.PI * .62), K.std('#1a120c', { roughness: 1 })); hair.rotation.z = Math.PI / 2 + .25; hg.add(hair);
    const beard = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), K.std('#22160e', { roughness: 1 })); beard.position.set(.06, -.02, 0); beard.scale.set(.8, .6, 1); hg.add(beard);
    // (round 3: no tunic, no arm — he is the shape of a body under the blanket; only the dark-haired head shows, turned away)
    lying.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); lying.userData.head = head; lying.userData.hair = hair; lying.userData.beard = beard; }
  const LAND = V(-.12, 0, -.05);   // where the stretcher comes to rest (in the shaft's footprint)
  // the four at the roof's edge, kneeling, leaning over, paying the ropes out hand over hand
  const corners = [[-.95, .36], [-.95, -.36], [.95, -.36], [.95, .36]];
  const MENP = [[-1.5, -.88], [-.45, -1.18], [.45, -1.18], [1.5, -.88]];   // all four on the far rim, so from below all four stand against the sky
  const roofMen = corners.map(([cx, cz], i) => { const p = mk({ h: 1.7, mat: robes[(i * 3 + 2) % 8] }); const [mx, mz] = MENP[i], pos = V(mx, RH + .32, mz); p.position.copy(pos); p.rotation.y = face(-mx * .7, -mz); p.userData.ph = i * .31; A.add(p); return p; });
  const ropeG = new THREE.CylinderGeometry(.011, .011, 1, 5), ropeM = K.std('#3a2a1a', { roughness: 1 });
  const ropes = corners.map(() => { const m = new THREE.Mesh(ropeG, ropeM); m.castShadow = true; A.add(m); return m; });
  const slack = corners.map(() => { const m = new THREE.Mesh(ropeG, ropeM); A.add(m); return m; });
  const setRope = (m, a, b) => { const d = b.clone().sub(a), L = d.length(); m.position.copy(a).add(b).multiplyScalar(.5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); };
  // the King: seated low on the floor in front, facing the stretcher, back to the camera
  const kingA = mk({ kind: 'sit', h: 1.74, mat: kingM, cloth: kingC }); kingA.position.set(.6, 0, .95); kingA.rotation.y = face(LAND.x - .6, LAND.z - .95); A.add(kingA);
  // the crowd round the cleared floor: standing, each with his own phase and delay
  const crowdA = []; { const r = rng(33);
    // a packed room: rings round the cleared floor, a gap toward the camera corner (+x +z) and the King
    const spots = []; for (let n = 0; n < 400 && spots.length < 36; n++) { const a = r() * 6.283, rr = 1.85 + Math.sqrt(r()) * 2.3, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (Math.abs(x) > RW - .35 || Math.abs(z) > RW - .35) continue; const an = Math.atan2(z, x); if (an > .05 && an < 1.5) continue; if (spots.some(([u, v]) => Math.hypot(u - x, v - z) < .62)) continue; spots.push([x, z]); }
    for (const [x, z] of spots) { const p = mk({ h: 1.62 + r() * .18, mat: robes[(r() * 8) | 0], broad: .92 + r() * .18 }); p.position.set(x, 0, z); p.rotation.y = face(LAND.x - x, LAND.z - z) + (r() - .5) * .3;
      p.userData.ph = r(); p.userData.dl = r() * .9; p.userData.shade = r() < .2; A.add(p); crowdA.push(p); } }
  // dust in the shaft (bright only inside the light)
  const dustU = { uT: { value: 0 }, uL: { value: L1 }, uMode: { value: 0 }, uOpen: { value: 1 }, uK: { value: 1 } };
  const SHAFT_GLSL = `
    float holeR(float a){ float c = abs(cos(a)), s = abs(sin(a)); return pow(pow(c / ${HOLE.hx.toFixed(3)}, 4.) + pow(s / ${HOLE.hz.toFixed(3)}, 4.), -.25) * (1. + .07 * sin(3. * a + 1.) + .045 * sin(7. * a + 2.) + .03 * sin(13. * a + .5)); }
    float inHole(vec3 p, vec3 L){ if (p.y > ${RH.toFixed(2)}) return 0.; vec3 q = p + L * ((${RH.toFixed(2)} - p.y) / L.y); vec2 d = q.xz; float r = length(d), R = holeR(atan(d.y, d.x)); return smoothstep(R * 1.02, R * .9, r); }`;
  { const n = 900, r = rng(8), p = new Float32Array(n * 3), sd = new Float32Array(n); for (let i = 0; i < n; i++) { p[i * 3] = (r() - .5) * 3.4; p[i * 3 + 1] = r() * RH; p[i * 3 + 2] = (r() - .5) * 2.2; sd[i] = r(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: { ...dustU, uPx: { value: H / 1920 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx, uK; uniform vec3 uL; varying float vA; ${SHAFT_GLSL}
        void main(){ vec3 q = position; q.y = mod(q.y - uT * (.03 + .05 * aS) + aS * 3., ${RH.toFixed(2)}); q.x += sin(uT * .3 + aS * 30.) * .15; q.z += cos(uT * .25 + aS * 17.) * .12;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (1.5 + 3. * aS) * 9. / d, 1., 9.); vA = inHole((modelMatrix * vec4(q, 1.)).xyz, uL) * (.35 + .65 * aS) * uK * clamp(1.4 - d / 9., 0., 1.); }`,
      fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 14.); gl_FragColor = vec4(vec3(1., .88, .66) * 1.8, a * vA); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; A.add(pts); }

  // ================================================================ TABLE (room B, 40 m to the side)
  const Bm = new THREE.Group(); Bm.position.set(40, 0, 0); S.add(Bm);
  const BX = 3.0, BZ = 3.9, BH = 3.2, WIN = { z0: -.15, z1: .85, y0: 1.95, y1: 2.75 }, DOOR = { x0: -1.65, x1: .25, y1: 2.15 };
  const TZ = 1.15, TBg = new THREE.Group(); TBg.position.z = TZ; Bm.add(TBg);
  { const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), M.earth); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; Bm.add(fl);
    const wall = (w, h, x, y, z, ry, m) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; p.receiveShadow = true; p.castShadow = true; Bm.add(p); return p; };
    // back wall (z = −BZ) with the doorway; right wall (x = +BX) with the high window; left wall; the front (behind the camera)
    wall(DOOR.x0 + BX, BH, (-BX + DOOR.x0) / 2, BH / 2, -BZ, 0, M.plaster); wall(BX - DOOR.x1, BH, (DOOR.x1 + BX) / 2, BH / 2, -BZ, 0, M.plaster); wall(DOOR.x1 - DOOR.x0, BH - DOOR.y1, (DOOR.x0 + DOOR.x1) / 2, (BH + DOOR.y1) / 2, -BZ, 0, M.plaster);
    const rz = (a, b, y0, y1, m) => wall(b - a, y1 - y0, BX, (y0 + y1) / 2, (a + b) / 2, -Math.PI / 2, m);
    rz(-BZ, WIN.z0, 0, BH, M.plaster2); rz(WIN.z1, BZ, 0, BH, M.plaster2); rz(WIN.z0, WIN.z1, 0, WIN.y0, M.plaster2); rz(WIN.z0, WIN.z1, WIN.y1, BH, M.plaster2);
    wall(2 * BZ, BH, -BX, BH / 2, 0, Math.PI / 2, M.plaster2); wall(2 * BX, BH, 0, BH / 2, BZ, Math.PI, M.plaster);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(2 * BX, 2 * BZ), M.reed); ceil.rotation.x = Math.PI / 2; ceil.position.y = BH; ceil.castShadow = true; Bm.add(ceil);
    for (let x = -2.7; x <= 2.71; x += .6) box(.16, .2, 2 * BZ, x, BH - .1, 0, M.wood, Bm);
    // window: a deep sill and a frame; the street beyond the door: ground, a far wall in the sun
    box(.3, .08, WIN.z1 - WIN.z0 + .1, BX - .1, WIN.y0 - .04, (WIN.z0 + WIN.z1) / 2, M.wood, Bm);
    const st = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), M.earth); st.rotation.x = -Math.PI / 2; st.position.set(0, .001, -BZ - 5); st.receiveShadow = true; Bm.add(st);
    const far = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), M.street); far.position.set(-1, 3, -BZ - 6.5); Bm.add(far);
    const farL = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), M.street); farL.position.set(-6, 3, -BZ - 3); farL.rotation.y = Math.PI / 2; Bm.add(farL);
    // the low table, its cloth, bread, bowls, cups, a little heap of coins; cushions and a jar
    // (round 3: the table and the diners moved 1.15 m toward the camera — a wide floor between the doorway and the table, for the shadows)
    box(2.3, .06, .95, -.15, .42, -1.05, M.wood, TBg); for (const [x, z] of [[-1.2, -1.45], [.9, -1.45], [-1.2, -.65], [.9, -.65]]) box(.08, .4, .08, x, .2, z, M.wood, TBg);
    const cl = box(1.5, .012, .8, -.15, .456, -1.05, M.cloth, TBg);
    for (const [x, z] of [[-.75, -1.2], [.35, -1.0]]) { const bw = new THREE.Mesh(new THREE.SphereGeometry(.12, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.dark); bw.position.set(x, .53, z); bw.castShadow = true; TBg.add(bw); }
    for (const [x, z] of [[-.4, -.8], [.15, -1.3], [.62, -.85]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.045, .035, .1, 10), M.dark); c.position.set(x, .51, z); c.castShadow = true; TBg.add(c); }
    const coinM = K.std('#b8892e', { roughness: .4, metalness: .6 }); const r = rng(5); for (let i = 0; i < 18; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .005, 10), coinM); c.position.set(.62 + r() * .2, .465 + i * .002, -1.3 + r() * .12); c.rotation.set(r() * .3, 0, r() * .3); TBg.add(c); }
    for (let i = 0; i < 3; i++) { const j = new THREE.Mesh(new THREE.SphereGeometry(.24, 12, 10), M.dark); j.scale.set(1, 1.4, 1); j.position.set(-BX + .4, .32, 1.0 + i * .55); j.castShadow = j.receiveShadow = true; Bm.add(j); }
  }
  const breadM = surfM('#a8763e', 'br');
  const loaves = [[-.55, -1.0], [.1, -.85]].map(([x, z]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(.09, 14, 10), breadM); b.scale.set(1.3, .55, 1); b.position.set(x, .5, z); b.castShadow = true; TBg.add(b); return b; });
  const passed = new THREE.Mesh(new THREE.SphereGeometry(.08, 14, 10), breadM); passed.scale.set(1.25, .55, 1); passed.castShadow = true; TBg.add(passed);
  // the shutter (hinged on the window's front edge), the door leaf (hinged on the doorway's left)
  const shutter = new THREE.Group(); shutter.position.set(BX - .02, (WIN.y0 + WIN.y1) / 2, WIN.z1); Bm.add(shutter);
  box(.05, WIN.y1 - WIN.y0, WIN.z1 - WIN.z0, 0, 0, -(WIN.z1 - WIN.z0) / 2, M.wood, shutter);
  const door = new THREE.Group(); door.position.set(DOOR.x0, 0, -BZ + .03); Bm.add(door);
  box(DOOR.x1 - DOOR.x0, DOOR.y1, .06, (DOOR.x1 - DOOR.x0) / 2, DOOR.y1 / 2, 0, M.wood, door);
  // the lights: the sun through the window (high, from the right), the low sun in the street behind the doorway
  const L2 = V(1, .52, .2).normalize(), L3 = V(-.55, .3, -1).normalize();
  const sunB = new THREE.DirectionalLight(col('#ffe2b8'), 7.5); sunB.position.copy(L2.clone().multiplyScalar(25)).add(Bm.position); sunB.target.position.copy(Bm.position).add(V(0, 0, -.9 + TZ));
  sunB.castShadow = true; sunB.shadow.mapSize.set(2048, 2048); Object.assign(sunB.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 60 }); sunB.shadow.bias = -.0005; sunB.shadow.normalBias = .03; S.add(sunB, sunB.target);
  const sunD = new THREE.DirectionalLight(col('#ffcf96'), 5); sunD.position.copy(L3.clone().multiplyScalar(25)).add(Bm.position); sunD.target.position.copy(Bm.position).add(V(0, 0, -1));
  sunD.castShadow = true; sunD.shadow.mapSize.set(2048, 2048); Object.assign(sunD.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 60 }); sunD.shadow.bias = -.0005; sunD.shadow.normalBias = .03; S.add(sunD, sunD.target);
  const poolB = new THREE.PointLight(col('#ffbf80'), .8, 5, 2); poolB.position.set(-.2, .9, -1.0 + TZ); Bm.add(poolB);
  const hemiB = new THREE.HemisphereLight(col('#5a4632'), col('#2a1a10'), .3); Bm.add(hemiB);
  // the people at the table: three behind it (facing us), one at each end, the King at the near side (back to us), a guest
  const tbl = [[-.95, -1.85, 0], [-.15, -1.9, 0], [.65, -1.85, 0], [-1.65, -.95, 1], [1.35, -1.0, -1], [-.25, -.22, 2], [.95, -.35, 2]];
  const eaters = tbl.map(([x, z, side], i) => { const isK = i === 5, p = mk({ kind: 'sit', h: isK ? 1.74 : 1.66 + (i % 2) * .08, mat: isK ? kingM : robes[(i * 3 + 1) % 8], cloth: isK ? kingC : undefined });
    p.position.set(x, .08, z); p.rotation.y = side === 0 ? Math.PI + (x * -.12) : side === 1 ? -Math.PI / 2 : side === -1 ? Math.PI / 2 : face(-.05 - x * .2, -1); p.userData.ph = i * .17 + .05; TBg.add(p); return p; });
  const kingB = eaters[5];
  // the three in the doorway (outside, in the street's sun): they lean together, one points; then they turn and walk off
  const whis = [[-1.2, -4.45], [-.55, -4.7], [.05, -4.4]].map(([x, z], i) => { const p = mk({ h: 1.72 - i * .05, mat: robes[[4, 7, 2][i]] }); p.position.set(x, 0, z); p.rotation.y = face(.05 - x * .2, 1); p.userData.ph = i * .29; p.userData.x0 = x; p.userData.z0 = z; Bm.add(p); return p; });
  const crowdAll = [...crowdA, ...roofMen, kingA, ...eaters, ...whis];

  // ================================================================ the shaft pass and the oil pass
  const FS = (frag, uniforms) => { const m = new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    const sc = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); q.frustumCulled = false; sc.add(q); return { m, sc, u: m.uniforms }; };
  const ocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const rtOpt = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
  const rtA = new THREE.WebGLRenderTarget(film.w, film.h, rtOpt), rtB = new THREE.WebGLRenderTarget(film.w, film.h, rtOpt);
  const shaftP = FS(`#include <packing>
    varying vec2 vUv; uniform sampler2D tColor, tDepth; uniform mat4 projInv, camWorld; uniform vec3 camPos, sunCol, sunCol2; uniform float near, far, time, frame, mode, kA, kB, kD, open, dOpen, warm;
    uniform vec3 La, Lb, Ld; uniform vec4 stx; uniform vec4 wh[3]; uniform vec3 boff;
    ${hashGLSL}
    ${SHAFT_GLSL}
    float n3(vec3 p){ return vn(p.xz * 1.7 + p.y * .9 + vec2(time * .05, -time * .03)) * .6 + vn(p.zy * 4.1 - p.x * 1.3 + time * .08) * .4; }
    float inWin(vec3 p){ vec3 q = p + Lb * ((${BX.toFixed(2)} - p.x) / Lb.x); if (p.x > ${BX.toFixed(2)}) return 0.;
      float zz = mix(${WIN.z0.toFixed(2)}, ${WIN.z1.toFixed(2)}, open);   // hinged at the front edge: the gap opens from the back edge
      return smoothstep(${WIN.y0.toFixed(2)} - .02, ${WIN.y0.toFixed(2)} + .04, q.y) * smoothstep(${WIN.y1.toFixed(2)} + .02, ${WIN.y1.toFixed(2)} - .04, q.y) * smoothstep(${WIN.z0.toFixed(2)} - .02, ${WIN.z0.toFixed(2)} + .04, q.z) * smoothstep(zz + .03, zz - .03, q.z) * step(.001, open); }
    float inDoor(vec3 p){ if (p.z < -${BZ.toFixed(2)}) return 0.; vec3 q = p + Ld * ((-${BZ.toFixed(2)} - p.z) / Ld.z); float x1 = mix(${DOOR.x0.toFixed(2)}, ${DOOR.x1.toFixed(2)}, dOpen);
      float k = smoothstep(${DOOR.x0.toFixed(2)} - .02, ${DOOR.x0.toFixed(2)} + .03, q.x) * smoothstep(x1 + .02, x1 - .03, q.x) * smoothstep(${DOOR.y1.toFixed(2)} + .02, ${DOOR.y1.toFixed(2)} - .04, q.y) * step(0., q.y);
      for (int i = 0; i < 3; i++){ if (wh[i].w < .5) continue; vec3 r = p + Ld * ((wh[i].z - p.z) / Ld.z); float hx = abs(r.x - wh[i].x); float body = (r.y < wh[i].y - .2 ? .2 : .11);
        k *= 1. - smoothstep(body + .02, body - .03, hx) * step(r.y, wh[i].y) * step(0., r.y); }
      return k; }
    void main(){
      vec4 c = texture2D(tColor, vUv); float dz = texture2D(tDepth, vUv).x;
      vec4 ndc = vec4(vUv * 2. - 1., dz * 2. - 1., 1.), vp = projInv * ndc; vp /= vp.w; vec3 wp = (camWorld * vec4(vp.xyz, 1.)).xyz, rd = normalize(wp - camPos);
      float D = min(length(wp - camPos), 14.); const int N = 44; float dt = D / float(N), j = hh(gl_FragCoord.xy + fract(frame * .618) * 91.);
      vec3 acc = vec3(0.);
      for (int i = 0; i < N; i++){ vec3 p = camPos + rd * dt * (float(i) + j) - boff;
        float dust = (mode < .5 ? .08 : .4) + 1.1 * smoothstep(.42, .88, n3(p * 1.3));
        if (mode < .5){ float k = inHole(p, La); if (k > 0.){ vec3 q = p + La * ((stx.w - p.y) / La.y); if (p.y < stx.w && abs(q.x - stx.x) < 1.0 && abs(q.z - stx.y) < .42 * stx.z) k *= .08; acc += sunCol * k * dust * kA * (.45 + 2.6 * pow(max(dot(rd, La), 0.), 4.)); } }
        else { float k = inWin(p); if (k > 0.) acc += sunCol * k * dust * kB * (1. + 1.6 * pow(max(dot(rd, Lb), 0.), 6.));
          float kd = inDoor(p); if (kd > 0.) acc += sunCol2 * kd * dust * kD * (1. + 1.6 * pow(max(dot(rd, Ld), 0.), 6.)); } }
      vec3 s = acc * dt * (mode < .5 ? .05 : .11);
      gl_FragColor = vec4(c.rgb + s * (1. - c.rgb * .6), 1.);
    }`, { tColor: { value: null }, tDepth: { value: null }, projInv: { value: new THREE.Matrix4() }, camWorld: { value: new THREE.Matrix4() }, camPos: { value: V() }, sunCol: { value: col('#ffe2b4') }, sunCol2: { value: col('#ffcf96') },
    near: { value: .05 }, far: { value: 200 }, time: { value: 0 }, frame: { value: 0 }, mode: { value: 0 }, kA: { value: 1 }, kB: { value: 1 }, kD: { value: 1 }, open: { value: 0 }, dOpen: { value: 1 }, warm: { value: 0 },
    La: { value: L1 }, Lb: { value: L2 }, Ld: { value: L3 }, stx: { value: new THREE.Vector4(0, 0, 1, -10) }, wh: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] }, boff: { value: V() } });
  const oilP = FS(`varying vec2 vUv; uniform sampler2D tIn; uniform vec2 px; uniform float frame, grain;
    ${hashGLSL}
    float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
    void main(){
      // Kuwahara (4 quadrants, radius 5): each pixel takes the mean of its calmest neighbourhood — flat loaded patches, edges kept
      const int R = 5; vec3 m[4]; vec3 s2[4]; for (int k = 0; k < 4; k++){ m[k] = vec3(0.); s2[k] = vec3(0.); }
      for (int y = 0; y <= R; y++) for (int x = 0; x <= R; x++){
        vec3 a = texture2D(tIn, vUv + vec2(-x, -y) * px).rgb, b = texture2D(tIn, vUv + vec2(x, -y) * px).rgb, c = texture2D(tIn, vUv + vec2(x, y) * px).rgb, d = texture2D(tIn, vUv + vec2(-x, y) * px).rgb;
        m[0] += a; s2[0] += a * a; m[1] += b; s2[1] += b * b; m[2] += c; s2[2] += c * c; m[3] += d; s2[3] += d * d; }
      float n = float((R + 1) * (R + 1)), best = 1e9; vec3 col = vec3(0.);
      for (int k = 0; k < 4; k++){ vec3 mu = m[k] / n, v = abs(s2[k] / n - mu * mu); float sv = v.r + v.g + v.b; if (sv < best){ best = sv; col = mu; } }
      // the brush: grain along the form (perpendicular to the brightness gradient), loaded on the lights, glazed in the darks
      float l = lum(col), gx = lum(texture2D(tIn, vUv + vec2(3., 0.) * px).rgb) - lum(texture2D(tIn, vUv - vec2(3., 0.) * px).rgb), gy = lum(texture2D(tIn, vUv + vec2(0., 3.) * px).rgb) - lum(texture2D(tIn, vUv - vec2(0., 3.) * px).rgb);
      float ang = atan(gy, gx) + 1.5708; if (abs(gx) + abs(gy) < .012) ang = .9 + .4 * (vn(vUv * 6.) - .5);
      vec2 p = gl_FragCoord.xy, d = vec2(cos(ang), sin(ang)), e = vec2(-d.y, d.x); vec2 q = vec2(dot(p, d) / 13., dot(p, e) / 2.6);
      float br = vn(q) * .65 + vn(q * 2.1 + 7.) * .35, load = smoothstep(.12, .6, l);
      col *= 1. + (br - .5) * mix(.05, .16, load);
      col += vec3(1., .94, .82) * smoothstep(.72, .95, br) * smoothstep(.45, .85, l) * .06;   // a ridge of light paint
      col += (hh(p + frame * 1.37) - .5) * grain;
      gl_FragColor = vec4(col, 1.);
    }`, { tIn: { value: null }, px: { value: new THREE.Vector2(1 / film.w, 1 / film.h) }, frame: { value: 0 }, grain: { value: .02 } });
  // film.render() ends on the screen; aim its last pass at rtA instead, then shaft → rtB → oil → screen
  const realSRT = R.setRenderTarget.bind(R);
  function renderAll(t) {
    R.setRenderTarget = (tg, ...a) => realSRT(tg === null ? rtA : tg, ...a);
    try { film.render(t); } finally { R.setRenderTarget = realSRT; }
    const u = shaftP.u; u.tColor.value = rtA.texture; u.tDepth.value = film.sceneRT.depthTexture;
    u.projInv.value.copy(cam.projectionMatrixInverse); u.camWorld.value.copy(cam.matrixWorld); u.camPos.value.setFromMatrixPosition(cam.matrixWorld); u.time.value = t; u.frame.value = film.frame;
    realSRT(rtB); R.render(shaftP.sc, ocam);
    oilP.u.tIn.value = rtB.texture; oilP.u.frame.value = film.frame; realSRT(null); R.render(oilP.sc, ocam);
  }

  // ================================================================ the shots
  const setCam = (pos, look, up = null) => { cam.position.copy(pos); if (up) cam.up.copy(up); else cam.up.set(0, 1, 0); cam.lookAt(look); };
  const toY = (p, target) => { const d = target.clone().sub(p.getWorldPosition(V()).add(V(0, 1.5, 0))); const lp = Math.atan2(d.y, Math.hypot(d.x, d.z)); const yaw = Math.atan2(-d.x, -d.z) - p.rotation.y; return [lp, Math.atan2(Math.sin(yaw), Math.cos(yaw))]; };
  function roof(t) {
    A.visible = true; Bm.visible = sunB.visible = sunD.visible = false; sunA.visible = true;
    const dk = ss(T.down0, T.down1, t), sy = lerp(RH + 1.2, .02, dk), land = clamp((t - T.down1) / 1.4);
    const sway = (1 - dk) * Math.sin(t * 1.1) * .03, settle = -.025 * Math.sin(land * Math.PI * 2) * (1 - land);
    ST.position.set(lerp(HOLE.cx, LAND.x, dk), sy + settle, lerp(HOLE.cz, LAND.z, dk)); ST.rotation.set(sway * .6, lerp(.05, 0, dk), sway);
    // the man: breathing; at Q42 his head turns toward the King
    const lk = ss(T.rest + .4, T.rest + 2.4, t); lying.userData.hg.rotation.x = lerp(-.6, -.42, lk) + .02 * Math.sin(t * .7); lying.scale.y = 1 + .02 * Math.sin(t * 1.3);
    const ropeOut = (RH + 1.2 - sy);   // paid out
    roofMen.forEach((p, i) => { const U = p.userData, c = corners[i], cw = V(ST.position.x + c[0], ST.position.y + .06, ST.position.z + c[1]);   // the corner (room frame)
      // hand over hand: the gripping hand travels down the rope with it (grip length .32 m), the other reaches back up
      const g = .32, cyc = ropeOut / g + U.ph * 2, loc = ((cyc % 2) + 2) % 2, lowered = t > T.down1 + .3;
      const ancW = p.localToWorld(V(0, 1.0, -.42)), dir = cw.clone().sub(ancW).normalize();
      const sA = loc < 1 ? loc * g : lerp(g, 0, loc - 1), sB = loc < 1 ? lerp(g, 0, loc) : (loc - 1) * g, offA = loc < 1 ? 0 : Math.sin((loc - 1) * Math.PI) * .07, offB = loc < 1 ? Math.sin(loc * Math.PI) * .07 : 0;
      const hA = ancW.clone().addScaledVector(dir, sA - .16).add(V(0, offA, 0)), hB = ancW.clone().addScaledVector(dir, sB - .16).add(V(0, offB, 0));
      p.updateMatrix();
      const toRoot = w => w.clone().applyMatrix4(p.matrix.clone().invert());
      P.pose(p, { ...P.idle(t, U.ph, { s: U.s }), lean: -.32 + .04 * Math.sin(t * 2.4 + i), head: [-.5, 0], hands: lowered ? [toRoot(ancW.clone().addScaledVector(dir, -.12)), toRoot(ancW.clone().addScaledVector(dir, .1))] : [toRoot(hA), toRoot(hB)] });
      { const up = ss(T.down1 + .6, T.down1 + 3.2, t), bot = lv(cw, ancW.clone().addScaledVector(dir, .05), up); ropes[i].visible = up < .98; setRope(ropes[i], ancW, bot); }   // after it lands the ropes are drawn up
      setRope(slack[i], ancW.clone().addScaledVector(dir, -.2), p.localToWorld(V(.3, .05, -.15))); });
    // the crowd: heads follow the stretcher down, each on his own delay; a few shade their eyes; breathing, weight shifts
    const sp = ST.getWorldPosition(V());
    for (const p of crowdA) { const U = p.userData, [pt, yw] = toY(p, sp), k = ss(T.down0 + U.dl, T.down0 + U.dl + 1.2, t);
      P.pose(p, { ...P.idle(t, U.ph, { s: U.s }), head: [clamp(pt, -.6, .75) * k + (1 - k) * -.05, clamp(yw, -.9, .9) * k], lean: lerp(0, -.06, ss(T.down1, T.down1 + 2, t)),
        hands: U.shade && t < T.down1 ? [null, V(.06, 1.62 * U.s, -.12)] : null }); }
    // the King: seated, facing the man; at Q42 he leans toward him a little
    const kl = ss(T.rest, T.rest + 2, t); P.pose(kingA, { breath: P.breath(t, .2), lean: lerp(-.05, -.18, kl), head: [lerp(-.1, -.28, kl), .04 * Math.sin(t * .3)], hands: [V(-.17, .32, -.32), V(.17, .32, -.3)] });
    // the light: settles and breathes on him (Q42), warms (N45b)
    const rest = ss(T.rest - .3, T.rest + 1.6, t), warm = ss(T.warm0, T.warm1, t), br = 1 + rest * (.18 + .1 * Math.sin((t - T.rest) * 1.5));
    sunA.intensity = 6.2 * br; sunA.color.copy(col('#ffe6c0')).lerp(col('#ffc786'), warm * .8);
    poolA.intensity = (.08 + .17 * dk) * br * (1 + .25 * warm); poolA.color.copy(col('#ffbf80')).lerp(col('#ffa860'), warm * .7); poolA.position.set(ST.position.x, ST.position.y + .45, ST.position.z);
    lampA.power = .08 + .1 * rest; lampA.pos.set(ST.position.x, ST.position.y + 1.0, ST.position.z);
    shaftP.u.mode.value = 0; shaftP.u.kA.value = (1.0 + .35 * rest) * br; shaftP.u.sunCol.value.copy(col('#ffe2b4')).lerp(col('#ffbe78'), warm * .8); shaftP.u.stx.value.set(ST.position.x, ST.position.z, 1, ST.position.y + .1); shaftP.u.boff.value.set(0, 0, 0);
    dustU.uL.value = L1; dustU.uK.value = 1 + .4 * rest;
    RIM.uRimP.value[0].set(ST.position.x, ST.position.y + .8, ST.position.z); RIM.uRimK.value[0] = 2.2 * br; RIM.uRimC.value[0].copy(col('#ffcf96')).lerp(col('#ffb070'), warm * .6);
    RIM.uRimP.value[1].set(0, RH + 1.5, 0); RIM.uRimK.value[1] = 1.4;   // the sky above the hole
    // the camera
    const D = film.dofCfg, Lk = film.look;
    if (t < T.cut1) {   // looking up at the torn roof, the four against the sky; tilt down with the stretcher
      // from below and to the side (the mat end-on, so the hole and the four against the sky stay clear until late); the camera
      // rises and draws back with the descent — wide, the crowd small below, heads turned up
      const tk = eio((t - T.tilt0) / (T.tilt1 - T.tilt0)), pos = V(lerp(.55, 2.9, tk), lerp(.95, 2.75, tk), lerp(3.45, 3.95, tk)); cam.fov = lerp(58, 52, tk);
      const look = V(lerp(-.3, -.2, tk), lerp(RH + .9, .15, tk), lerp(-.1, -.25, tk)); setCam(pos, look); D.focus = pos.distanceTo(sp); D.aperture = 1.6; Lk.exposure = lerp(1.6, 2.6, tk);
    } else if (t < T.cut2) {   // the room: the man in the light, the crowd round him, the King low in front from behind
      const k = (t - T.cut1) / (T.cut2 - T.cut1), pos = V(lerp(3.95, 3.75, k), lerp(3.05, 2.95, k), lerp(3.95, 3.65, k)); setCam(pos, V(-.35, .25, -.35)); cam.fov = 52; D.focus = pos.distanceTo(sp); D.aperture = 1.8; Lk.exposure = 2.6;
    } else {   // closer, over the King's shoulder, a slow push; the light warms
      const k = (t - T.cut2) / (T.table0 - T.cut2), pos = V(lerp(3.6, 3.3, k), lerp(2.88, 2.75, k), lerp(3.45, 3.1, k)); setCam(pos, V(-.3, .15, -.3)); cam.fov = lerp(44, 40, k);   // the same high corner, a slow push while the light warms (figures stay small) D.focus = pos.distanceTo(sp); D.aperture = 2.2; Lk.exposure = 1.8 + .12 * warm;
    }
    renderAll(t);
  }
  function table(t) {
    A.visible = sunA.visible = false; Bm.visible = sunB.visible = sunD.visible = true;
    const open = eio((t - T.shut0) / (T.shut1 - T.shut0)); shutter.rotation.y = -open * 1.9;
    const dOpen = 1 - eio((t - T.door0) / (T.door1 - T.door0)); door.rotation.y = -1.55 * dOpen;
    // the eaters: bread to the mouth, a cup lifted, heads turning to each other; the King hands the bread across
    const wb = Bm.position;
    eaters.forEach((p, i) => { const U = p.userData, s = U.s, ph = U.ph; p.updateMatrix();
      const rest = [V(-.17 * s, .32 * s, -.32 * s), V(.17 * s, .32 * s, -.3 * s)], hands = rest.map(v => v.clone());
      const cyc = (t * .32 + ph * 3) % 1, eat = Math.sin(clamp(cyc / .35) * Math.PI);   // a bite every ~3 s
      if (i !== 5 && i !== 1) hands[1] = lv(V(.15 * s, .5 * s, -.45 * s), V(.05 * s, .82 * s, -.17 * s), eat);
      let head = [-.12 + .05 * Math.sin(t * .4 + ph * 9), .35 * Math.sin(t * .23 + ph * 11) * (i === 5 ? .4 : 1)];
      if (i === 1) head = [-.05, .25 * Math.sin(t * .5)];   // the one in the middle talks, turning between his neighbours
      P.pose(p, { breath: P.breath(t, ph), lean: -.1 + .04 * Math.sin(t * .3 + ph * 7) - .06 * eat, twist: .06 * Math.sin(t * .21 + ph * 5), head, hands }); });
    // the bread: from the King's right hand across to the man at the far middle (both hands on it at the hand-over)
    { const k = clamp((t - T.bread[0]) / (T.bread[1] - T.bread[0])), U = kingB.userData, s = U.s, recv = eaters[1];
      const tb = V(0, 0, TZ).add(wb), pick = V(.1, .5, -.85).add(tb), mid = V(-.12, .62, -1.15).add(tb), give = V(-.15, .55, -1.45).add(tb);
      let bw = pick.clone(); if (k > 0) bw = k < .5 ? lv(pick, mid, eio(k / .5)) : (k < .7 ? mid.clone() : lv(mid, give, eio((k - .7) / .3)));
      if (t > T.bread[1]) bw = give.clone().add(V(0, .12 * ss(T.bread[1], T.bread[1] + 1, t), .15 * ss(T.bread[1], T.bread[1] + 1, t)));
      passed.position.copy(bw).sub(tb); passed.visible = true; loaves[1].visible = false;
      kingB.updateMatrix(); recv.updateMatrix();
      const inK = w => w.clone().sub(tb).applyMatrix4(kingB.matrix.clone().invert()), inR = w => w.clone().sub(tb).applyMatrix4(recv.matrix.clone().invert());
      const kh = k > 0 && k < .78 ? inK(bw.clone().add(V(.03, .03, .04))) : lv(inK(bw), V(.17 * s, .32 * s, -.3 * s), ss(.78, 1, k));
      P.pose(kingB, { breath: P.breath(t, .2), lean: -.12 - .1 * Math.sin(clamp(k) * Math.PI), twist: -.05, head: [-.1 - .12 * Math.sin(clamp(k) * Math.PI), .12 * Math.sin(t * .27)], hands: [V(-.17 * s, .32 * s, -.32 * s), k <= 0 ? lv(V(.17 * s, .32 * s, -.3 * s), inK(pick), 0) : kh] });
      if (k > .5) { const rs = recv.userData.s; P.pose(recv, { breath: P.breath(t, recv.userData.ph), lean: -.18, head: [-.25, 0], hands: [inR(bw.clone().add(V(-.04, .02, -.03))), t > T.bread[1] + 1 ? V(.17 * rs, .32 * rs, -.3 * rs) : inR(bw.clone().add(V(.04, .02, -.03)))] }); }
    }
    // the three in the doorway
    const on = ss(T.whisper0 - .3, T.whisper0 + .6, t);
    whis.forEach((p, i) => { const U = p.userData; p.visible = t > T.whisper0 - .4;
      if (t < T.leave + i * .35) { p.position.set(U.x0 + (1 - on) * -1.2, 0, U.z0); const lean = [.25, -.1, -.3][i] * on;
        const ptk = i === 0 ? ss(T.point, T.point + .8, t) * (1 - ss(T.leave - .6, T.leave, t)) : 0;
        P.pose(p, { ...P.idle(t, U.ph, { s: U.s }), lean: -.12 - .1 * on * Math.abs(Math.sin(t * .9 + i)), side: lean * .4, twist: lean, head: [-.15 + .1 * Math.sin(t * 1.3 + i * 2), [-.45, .5, .45][i] * on],
          hands: i === 0 ? [null, lv(V(.25, .9, -.05), V(.32, 1.42, -.55), ptk)] : i === 2 ? [lv(V(-.25, .88, -.05), V(-.12, 1.1, -.3), on * (.5 + .5 * Math.sin(t * 2.1))), null] : null }); }
      else { const t0 = T.leave + i * .35, dir = V(-1, 0, -.12).normalize(); const w = P.walk(p, t, t0, { T: 1.1, L: .5 }); const turn = ss(0, .55, t - t0);
        p.position.set(U.x0, 0, U.z0).addScaledVector(dir, w.dist); { const a0 = face(.05 - U.x0 * .2, 1), a1 = face(dir.x, dir.z), da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0)); p.rotation.y = a0 + da * turn; } P.pose(p, { ...w, head: [-.05, 0] }); } });
    const wv = shaftP.u.wh.value; whis.forEach((p, i) => wv[i].set(p.position.x, p.position.z, 1.75 * p.userData.s, p.visible ? 1 : 0));
    // light levels
    const kB = open, rest = .25 + .75 * ss(T.shut0, T.shut1, t);
    shaftP.u.mode.value = 1; shaftP.u.open.value = open; shaftP.u.dOpen.value = dOpen; shaftP.u.kB.value = 1.0 * kB; shaftP.u.kD.value = .55; shaftP.u.boff.value.copy(wb);
    sunB.intensity = 7.5; sunD.intensity = 30 * dOpen;
    poolB.intensity = .35 + .8 * open + .7 * (1 - dOpen); hemiB.intensity = .28;
    RIM.uRimP.value[0].set(-.2, 1.2, -1.0 + TZ).add(wb); RIM.uRimK.value[0] = .6 + 1.8 * open; RIM.uRimC.value[0].copy(col('#ffcf96'));
    RIM.uRimP.value[1].set(-.5, 1.6, -3.4).add(wb); RIM.uRimK.value[1] = 2.4 * dOpen;
    dustU.uK.value = 0; lampA.power = 0;
    const D = film.dofCfg, Lk = film.look;
    if (t >= T.side0 && t < T.side1) { const k = (t - T.side0) / (T.side1 - T.side0), pos = V(lerp(2.55, 2.45, k), lerp(2.8, 2.72, k), lerp(.7, .4, k)).add(wb); setCam(pos, V(lerp(-.75, -.85, k), -.15, -3.3).add(wb)); D.focus = pos.distanceTo(V(-.5, .8, -3.9).add(wb)); D.aperture = 1.6; cam.fov = 50; }
    else if (t < T.push0) { const k = (t - T.table0) / (T.push0 - T.table0), pos = V(lerp(-2.75, -2.6, k), lerp(3.08, 3.02, k), lerp(3.7, 3.45, k)).add(wb); setCam(pos, V(lerp(-.15, -.2, k), .3, -1.55).add(wb)); D.focus = 5.0; D.aperture = 1.6; cam.fov = 50; }
    else { const k = eio((t - T.push0) / (T.end - T.push0)), pos = V(lerp(-2.6, -2.25, k), lerp(3.02, 2.9, k), lerp(3.45, 3.05, k)).add(wb); setCam(pos, V(lerp(-.2, -.22, k), lerp(.3, .45, k), lerp(-1.55, -.5, k)).add(wb)); D.focus = lerp(5.5, 4.2, k); cam.fov = 50; D.aperture = 2.4; }
    Lk.exposure = 1.35 + .75 * (1 - dOpen);
    renderAll(t);
  }
  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    if (t < T.table0) roof(t); else table(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    if (window.OIL) OIL.varnish(ctx, .55);
    const wi = 1 - ss(T.roof0, T.white1, t); if (wi > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,244,222,${wi * .9})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  S.updateMatrixWorld(true);
  return { film, draw, beats: () => T, people: { roofMen, crowdA, eaters, whis, kingA, kingB } };
}
