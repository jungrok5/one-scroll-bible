// dawn-wall3d.js — 「kingdom」 4부 「겨자씨와 보화」 opening (film 317.1–327.3: C3 · N16): the chapter title over the great ashlar
// wall of the city in the morning; under N16 「예수님이 말씀하신 하나님 나라는, 어떤 나라였을까요?」 the eye rises — a slow pedestal
// up the courses and a tilt past the parapet to the sky, birds wheeling, the clouds parting on a light. That light is where the next
// shot's lamp burns behind the tent cloth (puppet-tent.js: the dissolve is light to light, the same place in the frame).
// Round 4 (owner 2026-11-20: "the round-1 camera, framing and timing were better — just add the wall detail"): the round-1 camera,
// sky and birds exactly (git 45f31f16), with the round-2/3 wall on that geometry: Herodian blocks with the drafted margin round a
// raised boss, courses of three heights and two master courses of tall long stones, every course set back a finger's width,
// weathering (pits, drips, lichen), capers and hyssop in the joints, a low raking morning light across the face; the round-3 cloud
// break (darker deck, ragged silver-edged opening, sky kept sharp).
// Round 5 (owner: "군대가 지키는 성벽"): the wall is the earthly kingdom guarded by an army — a regular line of legionaries along
// the wall-walk between the merlons (crested helmets, scuta, upright pila whose points catch the light), a signum and two red
// vexilla stirring in the wind, one sentry turning his head; silhouettes against the bright sky as the round-1 camera rises past
// them into the light (the camera's path and timing untouched). people3d.js legionary() / soldierPose() (fixed-length IK).
// After 「벤허」 (1959, OPUSCAR 32: Herodian stone in raking light) and the first film's 「귀환」 walls; cinecode camera-moves.md
// "tilt up — awe, scale" + "crane / pedestal up — a reveal over something". Engine: motion-skills cinematic-3d (lib3d/cine.js,
// kit.js mergeGeometries, tubesGeometry); god rays after heal-village.js. No words; frame index frozen (fixed dither).
//
// API: const DW = await (await import('./dawn-wall3d.js')).build(W, H);  DW.draw(ctx, t, B)   B = { C3, N16, N17 }
import { Film, THREE, V, col, rng, GLSL, FOG_GLSL } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

export function beats(B) {
  return { start: B.C3, rise: [B.N16 + .2, B.N16 + 4.4], part: [B.N16 + 3.0, B.N17 + .8], end: B.N17 + .8 };
}

export async function build(W, H) {
  const FOV = 46;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .1, far: 3000,
    atmos: { density: .0026, falloff: .03, base: 0, start: 4, color: col('#b8a48c', .7), colorUp: col('#8fa4c4', .62), max: 2400, scatter: 1, anisotropy: .78, phaseMix: .86 },
    bloom: { strength: .05, radius: 1.0, tint: col('#ffe6c0') },
    dof: { focus: 12, aperture: .6, maxCoc: 18 },
    look: { exposure: 1.0, contrast: 1.05, saturation: .96, lift: col('#0c0a0a'), shadowTint: col('#cdd4e6'), highTint: col('#fff0d6'), vignette: .32, grain: .012, ca: .25 },
  });
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither (no per-frame shimmer)
  film.canvas.style.display = 'none';
  film.renderer.shadowMap.type = THREE.VSMShadowMap;                        // soft, stable shadow edges (no shimmering texels)
  const S = film.scene, cam = film.camera;
  let T = null;

  // the sun high behind the wall (morning), so the face toward us is in soft shade and the parapet takes a gold rim
  const SUN = V(.05, .74, -1).normalize();
  // the sky of this shot (after kit.js sky()): deep morning blue, a broken deck of cloud that is dark where the sun is behind it
  // with a silver-gold edge, and a gap that opens round the sun as the eye arrives (uGap) — the light between the clouds
  const sky = (() => {
    const u = { ...film.fogU, sunDir: { value: SUN.clone() }, uGap: { value: 0 }, uT: { value: 0 }, skyFogMax: { value: 240 } };   // a thin veil of haze on the sky
    const m = new THREE.ShaderMaterial({ uniforms: u, side: THREE.BackSide, depthWrite: false,
      vertexShader: `varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 0.)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.)).xyz, 1.); gl_Position = p.xyww; }`,
      fragmentShader: `varying vec3 vD; uniform vec3 sunDir; uniform float uGap, uT, skyFogMax;
        ${GLSL.hash}
        ${FOG_GLSL}
        void main(){ vec3 d = normalize(vD); float y = d.y, s = max(dot(d, sunDir), 0.);
          vec3 c = mix(vec3(.95, .84, .7), vec3(.42, .55, .76) * .9, smoothstep(-.02, .3, y)); c = mix(c, vec3(.2, .32, .56) * .9, smoothstep(.3, .95, y));
          c += vec3(1., .86, .62) * (pow(s, 60.) * .9 + pow(s, 600.) * 3.5);
          c += vec3(1., .96, .88) * 12. * smoothstep(.99955, .99975, s);                         // the sun's disc, as in round 1
          if (y > 0.) { vec2 p = d.xz / (y + .2) * 1.15 + vec2(uT * .006, uT * .003);
            float n = fbm(p * 1.5) * .62 + fbm(p * 4.6 + 3.) * .26 + fbm(p * 11. + 9.) * .12;
            // the break: not a circle — the cloud's own noise, stretched along the deck, opening as the eye arrives
            vec2 gp = vec2(dot(d - sunDir, vec3(1., 0., .3)), dot(d - sunDir, vec3(-.3, .1, 1.))) * vec2(.65, 1.4);
            float br = length(gp) - (.07 + uGap * .2) - (fbm(p * 3.1 + 5.) - .5) * .42 - (n - .5) * .25;
            float m = smoothstep(.34, .5, n) * smoothstep(0., .08, br) * smoothstep(0., .12, y);
            float thick = smoothstep(.48, .86, n);
            float rim = pow(s, 4.) * (1. - thick * .8) * smoothstep(.2, 0., br);
            vec3 body = mix(vec3(.42, .44, .52), vec3(.12, .14, .2), thick);
            vec3 cc = body + vec3(1., .82, .55) * rim * 3. + vec3(1., .9, .75) * pow(s, 4.) * .18 * (1. - thick);
            c = mix(c, cc, m * .96); }
          float T = fogT(cameraPosition, d, skyFogMax); c = c * T + fogCol(d) * (1. - T);
          gl_FragColor = vec4(c, 0.); }` });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1800, 64, 32), m); mesh.frustumCulled = false; mesh.renderOrder = -10;
    film.onFrame((t, f) => { mesh.position.setFromMatrixPosition(f.camera.matrixWorld); u.uT.value = t; });
    S.add(mesh); return { mesh, u };
  })();
  S.add(new THREE.HemisphereLight(col('#b4c2da'), col('#7a6450'), .62));
  // the morning light raking across the face from the left: every boss throws a small shadow, the margins catch it
  const key = new THREE.DirectionalLight(col('#ffd6a4'), 3.4); key.position.set(-120, 46, 70);   // round 1's raking light key.target.position.set(0, 9, 0);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); Object.assign(key.shadow.camera, { left: -30, right: 30, top: 24, bottom: -24, near: 60, far: 320 });
  key.shadow.bias = -.0002; key.shadow.normalBias = .01; key.shadow.radius = 2.5; key.shadow.blurSamples = 10; S.add(key, key.target);   // the stone's own shadows crisp and full
  const sunL = new THREE.DirectionalLight(col('#ffe0b0'), 2.4); sunL.position.copy(SUN).multiplyScalar(200); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048);
  Object.assign(sunL.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 500 }); sunL.shadow.bias = -.0005; sunL.shadow.radius = 3; sunL.shadow.blurSamples = 10; S.add(sunL, sunL.target);
  const sunLamp = film.lamp(SUN.clone().multiplyScalar(1500), '#ffd9a0', { power: 140, size: 60, fog: 1 });

  let ZT = 0;
  // the wall: Herodian ashlar on the round-1 face (x −26…26, the walk at 17 m, the merlons above)
  {
    const R = rng(11), parts = [], box = new THREE.BoxGeometry(1, 1, 1);
    const M = (x, y, z, sx, sy, sz) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion(), V(sx, sy, sz));
    const base = new THREE.Color('#d9be8c'), TOP = 17;
    // courses of three heights and two master courses of tall long stones (row heights scaled so the courses end at the walk)
    const rows = []; { let y = 0, row = 0; while (y < TOP - .5) { const master = row === 5 || row === 11, h = master ? 1.72 : row < 1 ? 1.25 : [.9, 1.06, 1.24][Math.floor(R() * 3)]; rows.push({ h, master }); y += h; row++; }
      const k = TOP / rows.reduce((a, r) => a + r.h, 0); rows.forEach(r => r.h *= k); }
    let y = 0;
    rows.forEach(({ h, master }, row) => {
      const zf = -row * .022;                                                         // every course set back a finger's width
      for (let x = -28 + R() * 2.5; x < 28; ) {
        const w = master ? 3.6 + R() * 3.4 : Math.min(5.2, 1.2 + R() * (R() < .12 ? 3.6 : 2.4)), cx = x + w / 2, tone = .78 + R() * .28, warm = R() * .08;
        const c = base.clone().multiplyScalar(tone); c.r += warm * .5; c.b -= warm * .3;
        const m = .1 + R() * .05, boss = .06 + R() * .04;                            // the drafted margin and the boss's rise (round 1's relief)
        parts.push([box, M(cx, y + h / 2, zf - .45, w - .05, h - .05, .9), c]);
        parts.push([box, M(cx, y + h / 2, zf + boss / 2, w - 2 * m, h - 2 * m, boss), c.clone().multiplyScalar(.97 + R() * .06)]);
        x += w;
      }
      y += h;
    });
    const zt = -rows.length * .022; ZT = zt;
    // the parapet with merlons on top (round 1), in the same stone
    for (let x = -26; x < 26; x += 2.2) parts.push([box, M(x + .7, TOP + .7, zt - .45, 1.4, 1.4, .9), base.clone().multiplyScalar(.82 + R() * .14)]);
    parts.push([box, M(0, TOP + .05, zt - .4, 56, .1, 1.1), base.clone().multiplyScalar(.78)]);
    parts.push([box, M(0, TOP / 2, -1.6, 58, TOP + .2, .5), base.clone().multiplyScalar(.22)]);   // the core behind (no light through the joints)
    const geo = K.mergeGeometries(parts);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9 });
    mat.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSW; varying vec3 vSN;').replace('#include <project_vertex>', '#include <project_vertex>\nvSW = (modelMatrix * vec4(transformed, 1.)).xyz; vSN = objectNormal;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vSW; varying vec3 vSN;\n${GLSL.hash}`)
        .replace('#include <map_fragment>', `#include <map_fragment>
        { vec2 q = vec2(vSW.x, vSW.y) + vSW.z * 3.;
          float big = fbm(q * .35), mid = fbm(q * 2.1 + 7.), fine = vnoise(q * 38.) * .5 + vnoise(q * 90.) * .5;
          float pits = smoothstep(.8, .97, vnoise(q * 61. + 3.)) * .22 * smoothstep(.3, .7, vnoise(q * 4. + 11.));   // pecked and pitted, here and there
          // run-offs only below some joints: sparse, per course band, each its own width and length (no regular stripes)
          float band = floor(vSW.y * .95), fy = fract(vSW.y * .95);
          float sel = smoothstep(.74, .92, vnoise(vec2(vSW.x * .55 + band * 7.3, band * 3.1)));
          float run = smoothstep(.45, .8, vnoise(vec2(vSW.x * (2. + 2. * vnoise(vec2(band, 1.))), vSW.y * .5 + band)));
          float drip = sel * run * smoothstep(.0, .5, fy) * (.12 + .18 * vnoise(vec2(vSW.x * .3, band)));
          float lich = smoothstep(.62, .82, fbm(q * .8 + 21.)) * .5;                             // lichen
          vec3 c = diffuseColor.rgb * (.86 + .22 * mid) * (.93 + .12 * fine) * (1. - pits) * (1. - drip);
          c = mix(c, vec3(.48, .5, .42) * (.8 + .3 * mid), lich * .28);
          c *= mix(.92, 1.05, smoothstep(.0, 1., vSW.y / 32.));                                  // a little paler higher up, weathered
          diffuseColor.rgb = c; }`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = .82 + .15 * vnoise(vec2(vSW.x, vSW.y) * 30.);');
    };
    mat.customProgramCacheKey = () => 'herod-ashlar';
    const wallM = new THREE.Mesh(geo, mat); wallM.castShadow = wallM.receiveShadow = true; S.add(wallM);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800, 160, 160).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#8a7860', roughness: 1 })); ground.receiveShadow = true; film.ground(ground); S.add(ground);
    // capers and hyssop out of the joints, a few tufts between the merlons against the sky
    const leafG = new THREE.PlaneGeometry(.16, .1, 3, 1); { const p = leafG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) / .16 + .5; p.setY(i, p.getY(i) * Math.sin(Math.PI * x)); p.setX(i, p.getX(i) + .08); } leafG.computeVertexNormals(); }
    const clumps = [], RP = rng(23);
    for (let i = 0; i < 22; i++) clumps.push({ p: V(-9 + RP() * 16, .8 + RP() * 15.5, 0), r: .22 + RP() * .26, n: 18 + Math.floor(RP() * 16) });   // small tufts that hug the joints (short shadows)
    for (let i = 0; i < 7; i++) clumps.push({ p: V(-8 + i * 2.6 + RP(), TOP + .15, zt - .2), r: .45 + RP() * .35, n: 36, top: true });
    const NL = clumps.reduce((a, c) => a + c.n, 0);
    const leaves = new THREE.InstancedMesh(leafG, new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .7, side: THREE.DoubleSide }), NL);
    const stems = [];
    let li = 0; const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler();
    for (const c of clumps) {
      const nS = 5 + Math.floor(RP() * 4);
      const tips = [];
      for (let k = 0; k < nS; k++) { const a = RP() * Math.PI * 2, out = V(Math.cos(a) * .9, c.top ? .6 + RP() * .5 : Math.sin(a) * .7 - .25, c.top ? Math.sin(a) * .5 : .14 + RP() * .16).normalize(), L = c.r * (.6 + RP() * .6);
        const mid = c.p.clone().addScaledVector(out, L * .5).add(V(0, c.top ? 0 : .06, 0)), end = c.p.clone().addScaledVector(out, L).add(V(0, c.top ? .1 : -.08 * L, 0));
        stems.push(c.p.x, c.p.y, c.p.z, mid.x, mid.y, mid.z, .012, .009, mid.x, mid.y, mid.z, end.x, end.y, end.z, .009, .005); tips.push([c.p, mid, end]); }
      for (let k = 0; k < c.n; k++) { const [a0, mid, end] = tips[k % tips.length], u = RP(), pt = u < .5 ? a0.clone().lerp(mid, u * 2) : mid.clone().lerp(end, (u - .5) * 2);
        pt.add(V(RP() - .5, RP() - .5, RP() - .5).multiplyScalar(.12)); e4.set(RP() * 6.3, RP() * 6.3, RP() * 6.3); q4.setFromEuler(e4); const sc = (c.top ? .7 : .5) + RP() * .5;
        m4.compose(pt, q4, V(sc, sc, sc)); leaves.setMatrixAt(li, m4); leaves.setColorAt(li, new THREE.Color(RP() < .3 ? '#5f6e38' : '#3f5428').multiplyScalar(.8 + RP() * .4)); li++; }
    }
    leaves.castShadow = false; leaves.frustumCulled = false; S.add(leaves);   // the plants cast no shadow: the stone keeps the strong light
    const st = new THREE.Mesh(K.tubesGeometry(stems, 4), new THREE.MeshStandardMaterial({ color: '#4a4a30', roughness: .9 })); st.castShadow = false; S.add(st);
  }

  // ---------------------------------------------------------------- the garrison on the wall-walk (round 5)
  const walk = new THREE.Mesh(new THREE.BoxGeometry(56, .3, 3.2), new THREE.MeshStandardMaterial({ color: '#7d6a50', roughness: .95 }));
  walk.position.set(0, 17 - .05, ZT - .9 - 1.6); walk.receiveShadow = true; S.add(walk);   // the walk behind the parapet (the soldiers stand on it)
  const dk = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .9, side: THREE.DoubleSide, ...o });
  const tunic = dk('#3a1611'), skinM = dk('#3a2a20'), iron = dk('#2c2c30', { roughness: .45, metalness: .6 }), shieldM = dk('#4e1710'), ash = dk('#3a2c1e'), crestM = dk('#6a1a12'), bindM = dk('#8a7656', { roughness: .35, metalness: .7 });
  const tipMat = () => new THREE.MeshStandardMaterial({ color: '#d8c8a8', roughness: .2, metalness: .9, emissive: col('#ffd8a0'), emissiveIntensity: 1.5 });
  const clothM = dk('#7a1a12', { roughness: .85 }), goldM = dk('#a8823a', { roughness: .3, metalness: .85, emissive: col('#ffcf80'), emissiveIntensity: .3 });
  const FEET = 17.1, GZ = ZT - .3;                                                        // standing in the embrasures between the merlons (seen from below)
  // a soldier in every gap between the merlons across the view, the standards among them
  const gaps = []; for (let x = -26 + 1.8; x < 26; x += 2.2) if (x > -11 && x < 11) gaps.push(x);
  const STD = { 2: 'vexillum', 5: 'signum', 8: 'vexillum' };
  const garrison = [], bearers = [];
  const RG = rng(515);
  gaps.forEach((x, i) => {
    if (STD[i]) {
      const b = P.legionary({ h: 1.76, mat: tunic, skin: skinM, metal: iron, shieldM, wood: ash, tip: tipMat(), crestM, bind: bindM }); b.userData.spear.visible = false;
      b.position.set(x, FEET, GZ - .35); b.rotation.y = Math.PI; S.add(b);
      const std = new THREE.Group(), mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; std.add(o); return o; };
      mk(new THREE.CylinderGeometry(.022, .028, 3.3, 6), ash).position.y = 1.65;
      if (STD[i] === 'vexillum') { const bar = mk(new THREE.CylinderGeometry(.013, .013, .86, 5), ash); bar.rotation.z = Math.PI / 2; bar.position.y = 3.12;
        const geo = new THREE.PlaneGeometry(.8, .74, 12, 9); geo.translate(0, -.37, 0); const cl = mk(geo, clothM); cl.position.set(0, 3.1, .015);
        const fr = mk(new THREE.PlaneGeometry(.8, .07, 12, 1), crestM); fr.position.set(0, 2.33, .015); mk(new THREE.ConeGeometry(.03, .16, 4), goldM).position.y = 3.38;
        std.userData = { cloth: cl, base: geo.attributes.position.array.slice(), fringe: fr }; }
      else { mk(new THREE.ConeGeometry(.035, .2, 4), goldM).position.y = 3.4; const bar = mk(new THREE.CylinderGeometry(.012, .012, .42, 5), goldM); bar.rotation.z = Math.PI / 2; bar.position.y = 3.18;
        for (const sd of [-1, 1]) mk(new THREE.CylinderGeometry(.01, .025, .2, 5), clothM).position.set(sd * .2, 3.06, 0);
        for (let k = 0; k < 6; k++) { const d = mk(new THREE.CylinderGeometry(.095, .095, .022, 18), goldM); d.rotation.x = Math.PI / 2; d.position.y = 2.62 - k * .22; } }
      S.add(std); bearers.push({ b, std, ph: RG() });
    } else {
      const tip = tipMat(), sd = P.legionary({ h: 1.7 + RG() * .1, mat: tunic, skin: skinM, metal: iron, shieldM, wood: ash, tip, crestM, bind: bindM });
      sd.position.set(x + (RG() - .5) * .12, FEET, GZ + (RG() - .5) * .1); sd.rotation.y = Math.PI + (RG() - .5) * .12; S.add(sd);
      garrison.push({ s: sd, tip, ph: RG(), gph: RG(), sentry: i === 4 });
    }
  });
  function garrisonAt(t) {
    for (const g of garrison) { const I = P.idle(t, g.ph);
      // the sentry slowly turns his head to look along the wall and back (eased, ~5 s), the others breathe and shift their weight
      const look = g.sentry ? .55 * Math.sin(Math.PI * 2 * (t - 318) / 5.2) * Math.min(1, Math.max(0, (t - 318.5) / 1.2)) : 0;
      P.soldierPose(g.s, { ...I, lean: -.02, head: [I.head[0], I.head[1] + look], twist: I.twist + look * .15 });
      const gl = Math.pow(Math.max(0, Math.sin(6.2832 * (t * .37 + g.gph))), 18); g.tip.emissiveIntensity = 1.5 + 9 * gl; }   // the points catch the light
    for (const { b, std, ph } of bearers) { const I = P.idle(t, ph);
      b.updateMatrix(); const gl = V(0, 1.24 + I.bob, -.36), gr = V(0, .94 + I.bob, -.36);
      P.pose(b, { ...I, lean: -.02, hands: [gl, gr] });                                     // both hands on the pole
      const gw = gr.clone().applyMatrix4(b.matrix); std.position.set(gw.x, gw.y - .94 + .03, gw.z); std.rotation.set(0, Math.PI + .3, 0);
      if (std.userData.cloth) { const q = std.userData.cloth.geometry.attributes.position, B0 = std.userData.base;
        for (let i = 0; i < q.count; i++) { const px = B0[i * 3], py = B0[i * 3 + 1], dn = -py / .74;
          q.setZ(i, (.06 * Math.sin(px * 7 - t * 2.4 + py * 3 + ph * 6) + .03 * Math.sin(px * 13 + t * 3.5)) * (.3 + dn)); q.setX(i, px + .02 * dn * Math.sin(t * 1.2 + ph * 5)); }
        q.needsUpdate = true; std.userData.cloth.geometry.computeVertexNormals(); std.userData.fringe.position.z = .015 + .04 * Math.sin(-t * 2.4 + 1.2 + ph * 6); } }
  }
  window.__GARRISON = t => garrison.map(g => ({ J: g.s.userData }));
  const birds = []; { const bm = new THREE.MeshBasicMaterial({ color: '#3a342e', side: THREE.DoubleSide });
    for (let i = 0; i < 5; i++) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3)); const b = new THREE.Mesh(g, bm); b.frustumCulled = false; S.add(b); birds.push(b); } }
  const setBird = (b, p, s, flap) => { const a = b.geometry.attributes.position, w = Math.sin(flap) * .55;
    [[0, 0, 0], [-s, s * w, -s * .35], [-s * .25, 0, s * .15], [0, 0, 0], [s, s * w, -s * .35], [s * .25, 0, s * .15]].forEach((q, i) => a.setXYZ(i, p.x + q[0], p.y + q[1], p.z + q[2])); a.needsUpdate = true; };

  // the camera: a slow pedestal up the courses, then the tilt past the parapet to the light in the clouds
  function camAt(t) {
    const k0 = clamp((t - T.start) / (T.rise[0] - T.start)), k = eio((t - T.rise[0]) / (T.rise[1] - T.rise[0])), drift = (t - T.start) * .06;
    const pos = V(-1.2 + drift * .4, lerp(1.6 + k0 * .9, 9.5, k), lerp(9.5, 11.5, k));
    const pitch = lerp(9 + k0 * 3, 58, k) * Math.PI / 180 + ss(T.rise[1], T.end, t) * .03, yaw = lerp(.04, -.02, k);
    return { pos, dir: V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)) };
  }
  const tmp = V();
  // where the light stands at the end (the lamp of the next shot, screen 540 × 690): put the sun's direction there
  function aimSun() {
    const c = camAt(T.end); cam.position.copy(c.pos); cam.up.set(0, 1, 0); cam.lookAt(c.pos.clone().add(c.dir)); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const ndc = V((540 / W) * 2 - 1, 1 - (690 / H) * 2, .5).unproject(cam).sub(cam.position).normalize();
    SUN.copy(ndc); sky.u.sunDir.value.copy(SUN); sunL.position.copy(SUN).multiplyScalar(200); sunLamp.pos.copy(SUN).multiplyScalar(1500);
  }

  function frame(t) {
    if (!T) return;
    const c = camAt(t); cam.position.copy(c.pos); cam.up.set(0, 1, 0); cam.lookAt(c.pos.clone().add(c.dir)); cam.updateMatrixWorld();
    const pk = ss(T.part[0], T.part[1], t);
    sky.u.uGap.value = pk;
    sunLamp.pos.copy(SUN).multiplyScalar(1500).add(cam.position); sunLamp.power = lerp(140, 700, pk);
    film.look.exposure = lerp(1.0, 1.12, pk);
    film.dofCfg.focus = lerp(9.5, 30, ss(T.rise[0], T.rise[1], t)); film.dofCfg.aperture = lerp(.6, .05, ss(T.rise[0], T.rise[1], t));
    birds.forEach((b, i) => { const a = t * .25 + i * 1.3; setBird(b, V(-6 + i * 3 + Math.sin(a) * 4, 24 + i * 1.5 + Math.sin(a * 1.7) * 1.2, -6 - i * 2 + Math.cos(a) * 3), .35, t * (7 + i) + i); });
    garrisonAt(t);
    film.render(t);
  }
  // screen-space scatter from the sun (after heal-village.js godRays): bright pixels zoom-blurred from the light
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const gS = mkC(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkC(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) {
    const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h);
    const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 175) / 80); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; }
    gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h);
    gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 24; i++) { const sc = 1 + i * .05; gbx.globalAlpha = Math.pow(.9, i) * .15; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); }
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.drawImage(gB, 0, 0, W, H); ctx.restore();
  }
  function draw(ctx, t, B) {
    if (!T) { T = beats(B); aimSun(); }
    frame(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    tmp.copy(cam.position).add(SUN.clone().multiplyScalar(500)).project(cam);
    if (tmp.z < 1 && Math.abs(tmp.x) < 1.6 && Math.abs(tmp.y) < 1.6) godRays(ctx, (tmp.x + 1) / 2 * W, (1 - tmp.y) / 2 * H, .35 + .45 * ss(T.part[0], T.part[1], t));
  }
  return { film, draw, beats: () => T };
}
