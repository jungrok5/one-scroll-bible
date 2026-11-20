// dawn-wall3d.js — 「kingdom」 4부 「겨자씨와 보화」 opening (film 317.1–327.3: C3 · N16): the chapter title over the city's great wall
// in the early morning; under N16 「예수님이 말씀하신 하나님 나라는, 어떤 나라였을까요?」 the eye climbs it — along the courses, up the
// receding face into the haze, past the top — to a break in the clouds where the light stands. That light is where the next shot's
// lamp burns behind the tent cloth (puppet-tent.js: the dissolve is light to light, the same place in the frame).
// Round 2 (owner 2026-11-20: "a flat yellow brick wall, game-like"): Herod's ashlar as it is — big dressed blocks with the drafted
// margin round a slightly raised, pecked boss, tight joints without mortar, every course set back a finger's width, tones that vary
// block to block, weathering (pits, dark drips from the joints, lichen, worn arrises), capers and hyssop growing out of the joints;
// a long low morning light raking across the face so every margin and boss draws a line; aerial haze as the wall recedes upward;
// the camera tilting up along the courses with the near plants passing (parallax), then the long tilt to the sky; a cloud deck dark
// against the light with a ragged, silver-edged break.
// After 「벤허」 (1959, OPUSCAR 32: Herodian stone in raking light) and the Western Wall's own faces; cinecode camera-moves.md
// "tilt up — awe, scale" + "crane / pedestal up — a reveal over something". Engine: motion-skills cinematic-3d (lib3d/cine.js,
// kit.js mergeGeometries); god rays after heal-village.js. No words; frame index frozen (fixed dither).
//
// API: const DW = await (await import('./dawn-wall3d.js')).build(W, H);  DW.draw(ctx, t, B)   B = { C3, N16, N17 }
import { Film, THREE, V, col, rng, GLSL, FOG_GLSL } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

export function beats(B) {
  return { start: B.C3, n16: B.N16, part: [B.N16 + 3.0, B.N17 + .8], end: B.N17 + .8 };
}

export async function build(W, H) {
  const FOV = 46;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .05, far: 3000,
    atmos: { density: .009, falloff: .028, base: 0, start: 3, color: col('#cdb79a', .78), colorUp: col('#9fb0c8', .7), max: 2400, scatter: 1, anisotropy: .78, phaseMix: .86 },
    bloom: { strength: .06, radius: 1.0, tint: col('#ffe6c0') },
    dof: { focus: 7, aperture: 1.2, maxCoc: 22 },
    look: { exposure: 1.12, contrast: 1.1, saturation: .95, lift: col('#0b0a0a'), shadowTint: col('#c6cfe4'), highTint: col('#fff0d8'), vignette: .34, grain: .012, ca: .25 },
  });
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither (no per-frame shimmer)
  film.canvas.style.display = 'none';
  film.renderer.shadowMap.type = THREE.VSMShadowMap;                        // soft, stable shadow edges (no shimmering texels)
  const S = film.scene, cam = film.camera;
  let T = null;
  const GAP = V(.1, .97, -.2).normalize();                                 // where the light breaks through (aimed at the lamp's place in aimGap)

  // ---------------------------------------------------------------- light: a long low morning sun raking across the face from the left
  S.add(new THREE.HemisphereLight(col('#aebfda'), col('#7d6a54'), .55));
  const key = new THREE.DirectionalLight(col('#ffd9a8'), 4.6); key.position.set(-150, 92, 46); key.target.position.set(10, 10, 0);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); Object.assign(key.shadow.camera, { left: -34, right: 34, top: 30, bottom: -30, near: 60, far: 320 });
  key.shadow.bias = -.0002; key.shadow.normalBias = .01; key.shadow.radius = 2.5; key.shadow.blurSamples = 10; S.add(key, key.target);
  const bounce = new THREE.DirectionalLight(col('#c9d2e6'), .35); bounce.position.set(30, 10, 60); S.add(bounce);
  const gapLamp = film.lamp(GAP.clone().multiplyScalar(1500), '#ffe2b0', { power: 120, size: 60, fog: 1 });

  // ---------------------------------------------------------------- the wall: Herodian ashlar
  {
    const R = rng(11), parts = [], box = new THREE.BoxGeometry(1, 1, 1);
    const M = (x, y, z, sx, sy, sz) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion(), V(sx, sy, sz));
    const base = new THREE.Color('#e2cfa6');
    let y = 0;
    for (let row = 0; row < 30; row++) {
      // courses of three heights, and two master courses of tall long stones (as on the Herodian walls) — no tile repeat
      const master = row === 7 || row === 16, h = master ? 1.72 : row < 2 ? 1.25 : [.9, 1.06, 1.24][Math.floor(R() * 3)], zf = -row * .022;
      for (let x = -14 + R() * 2.5; x < 74; ) {
        const w = master ? 3.6 + R() * 3.4 : Math.min(5.2, 1.2 + R() * (R() < .12 ? 3.6 : 2.4)), cx = x + w / 2, tone = .78 + R() * .28, warm = R() * .08;
        const c = base.clone().multiplyScalar(tone); c.r += warm * .5; c.b -= warm * .3;
        const m = .08 + R() * .05, boss = .035 + R() * .04;                          // the drafted margin and the boss's rise
        parts.push([box, M(cx, y + h / 2, zf - .45, w - .012, h - .012, .9), c]);                                    // the block (its face = the margin plane)
        parts.push([box, M(cx, y + h / 2, zf + boss / 2, w - 2 * m, h - 2 * m, boss), c.clone().multiplyScalar(.97 + R() * .06)]);   // the boss
        x += w;
      }
      y += h;
    }
    const TOP = y;
    parts.push([box, M(30, TOP + .14, -.55, 92, .28, 1.3), base.clone().multiplyScalar(.85)]);                     // a plain coping course
    parts.push([box, M(30, TOP / 2, -1.2, 94, TOP + .5, .5), base.clone().multiplyScalar(.5)]);                   // the core behind (no light through the joints)
    const geo = K.mergeGeometries(parts);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9 });
    mat.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSW; varying vec3 vSN;').replace('#include <project_vertex>', '#include <project_vertex>\nvSW = (modelMatrix * vec4(transformed, 1.)).xyz; vSN = objectNormal;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vSW; varying vec3 vSN;\n${GLSL.hash}`)
        .replace('#include <map_fragment>', `#include <map_fragment>
        { vec2 q = vec2(vSW.x, vSW.y) + vSW.z * 3.;
          float big = fbm(q * .35), mid = fbm(q * 2.1 + 7.), fine = vnoise(q * 38.) * .5 + vnoise(q * 90.) * .5;
          float pits = smoothstep(.72, .9, vnoise(q * 26. + 3.)) * .35;                          // pecked and pitted
          float drip = smoothstep(.55, .85, vnoise(vec2(q.x * 7., q.y * .35))) * smoothstep(.2, .7, big) * .3;   // dark streaks down the face
          float lich = smoothstep(.62, .82, fbm(q * .8 + 21.)) * .5;                             // lichen
          vec3 c = diffuseColor.rgb * (.86 + .22 * mid) * (.93 + .12 * fine) * (1. - pits) * (1. - drip);
          c = mix(c, vec3(.48, .5, .42) * (.8 + .3 * mid), lich * .55);
          c *= mix(.92, 1.05, smoothstep(.0, 1., vSW.y / 32.));                                  // a little paler higher up, weathered
          diffuseColor.rgb = c; }`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = .82 + .15 * vnoise(vec2(vSW.x, vSW.y) * 30.);');
    };
    mat.customProgramCacheKey = () => 'herod-ashlar';
    const wall = new THREE.Mesh(geo, mat); wall.castShadow = wall.receiveShadow = true; S.add(wall);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#8a7860', roughness: 1 })); ground.receiveShadow = true; film.ground(ground); S.add(ground);

    // capers and hyssop out of the joints (and two near the lens, for the parallax), a few tufts on the coping against the sky
    const leafG = new THREE.PlaneGeometry(.16, .1, 3, 1); { const p = leafG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) / .16 + .5; p.setY(i, p.getY(i) * Math.sin(Math.PI * x)); p.setX(i, p.getX(i) + .08); } leafG.computeVertexNormals(); }
    const clumps = [];
    const RP = rng(23);
    for (let i = 0; i < 26; i++) clumps.push({ p: V(-2 + RP() * 34, .8 + RP() * 26, 0), r: .35 + RP() * .5, n: 26 + Math.floor(RP() * 26) });
    clumps.push({ p: V(2.2, 1.1, .1), r: .8, n: 90 }, { p: V(4.6, 2.6, .05), r: .6, n: 60 });                       // near the lens
    for (let i = 0; i < 9; i++) clumps.push({ p: V(4 + i * 3.2 + RP(), TOP + .3, -.4), r: .5 + RP() * .4, n: 40, top: true });
    const NL = clumps.reduce((a, c) => a + c.n, 0);
    const leaves = new THREE.InstancedMesh(leafG, new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .7, side: THREE.DoubleSide }), NL);
    const stems = [];
    let li = 0; const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler();
    for (const c of clumps) {
      const nS = 5 + Math.floor(RP() * 4);
      const tips = [];
      for (let k = 0; k < nS; k++) { const a = RP() * Math.PI * 2, out = V(Math.cos(a) * .9, c.top ? .6 + RP() * .5 : Math.sin(a) * .7 - .25, c.top ? Math.sin(a) * .5 : .45 + RP() * .4).normalize(), L = c.r * (.6 + RP() * .6);
        const mid = c.p.clone().addScaledVector(out, L * .5).add(V(0, c.top ? 0 : .06, 0)), end = c.p.clone().addScaledVector(out, L).add(V(0, c.top ? .1 : -.08 * L, 0));
        stems.push(c.p.x, c.p.y, c.p.z, mid.x, mid.y, mid.z, .012, .009, mid.x, mid.y, mid.z, end.x, end.y, end.z, .009, .005); tips.push([c.p, mid, end]); }
      for (let k = 0; k < c.n; k++) { const [a0, mid, end] = tips[k % tips.length], u = RP(), pt = u < .5 ? a0.clone().lerp(mid, u * 2) : mid.clone().lerp(end, (u - .5) * 2);
        pt.add(V(RP() - .5, RP() - .5, RP() - .5).multiplyScalar(.12)); e4.set(RP() * 6.3, RP() * 6.3, RP() * 6.3); q4.setFromEuler(e4); const sc = .7 + RP() * .7;
        m4.compose(pt, q4, V(sc, sc, sc)); leaves.setMatrixAt(li, m4); leaves.setColorAt(li, new THREE.Color(RP() < .3 ? '#5f6e38' : '#3f5428').multiplyScalar(.8 + RP() * .4)); li++; }
    }
    leaves.castShadow = true; leaves.frustumCulled = false; S.add(leaves);
    const st = new THREE.Mesh(K.tubesGeometry(stems, 4), new THREE.MeshStandardMaterial({ color: '#4a4a30', roughness: .9 })); st.castShadow = true; S.add(st);
  }
  const birds = []; { const bm = new THREE.MeshBasicMaterial({ color: '#2e2a26', side: THREE.DoubleSide });
    for (let i = 0; i < 5; i++) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3)); const b = new THREE.Mesh(g, bm); b.frustumCulled = false; S.add(b); birds.push(b); } }
  const setBird = (b, p, s, flap) => { const a = b.geometry.attributes.position, w = Math.sin(flap) * .55;
    [[0, 0, 0], [-s, s * w, -s * .35], [-s * .25, 0, s * .15], [0, 0, 0], [s, s * w, -s * .35], [s * .25, 0, s * .15]].forEach((q, i) => a.setXYZ(i, p.x + q[0], p.y + q[1], p.z + q[2])); a.needsUpdate = true; };

  // ---------------------------------------------------------------- the sky: a cloud deck dark against the light, a ragged break with silver edges
  const sky = (() => {
    const u = { ...film.fogU, gapDir: { value: GAP.clone() }, uGap: { value: 0 }, uT: { value: 0 }, skyFogMax: { value: 240 } };   // the sky takes only a thin veil of the haze (the break must keep its contrast)
    const m = new THREE.ShaderMaterial({ uniforms: u, side: THREE.BackSide, depthWrite: false,
      vertexShader: `varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 0.)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.)).xyz, 1.); gl_Position = p.xyww; }`,
      fragmentShader: `varying vec3 vD; uniform vec3 gapDir; uniform float uGap, uT, skyFogMax;
        ${GLSL.hash}
        ${FOG_GLSL}
        void main(){ vec3 d = normalize(vD); float y = d.y, s = max(dot(d, gapDir), 0.), ang = acos(clamp(dot(d, gapDir), -1., 1.));
          vec3 c = mix(vec3(.95, .84, .7), vec3(.42, .55, .76) * .9, smoothstep(-.02, .3, y)); c = mix(c, vec3(.2, .32, .56) * .9, smoothstep(.3, .95, y));
          c += vec3(1., .86, .62) * (pow(s, 60.) * .9 + pow(s, 600.) * 3.5);
          if (y > 0.) { vec2 p = d.xz / (y + .2) * 1.15 + vec2(uT * .006, uT * .003);
            float n = fbm(p * 1.5) * .62 + fbm(p * 4.6 + 3.) * .26 + fbm(p * 11. + 9.) * .12;
            // the break: not a circle — the cloud's own noise, stretched along the deck, opening as the eye arrives
            vec2 gp = vec2(dot(d - gapDir, vec3(1., 0., .3)), dot(d - gapDir, vec3(-.3, .1, 1.))) * vec2(.65, 1.4);
            float br = length(gp) - (.07 + uGap * .2) - (fbm(p * 3.1 + 5.) - .5) * .42 - (n - .5) * .25;
            float m = smoothstep(.34, .5, n) * smoothstep(0., .08, br) * smoothstep(0., .12, y);
            float thick = smoothstep(.48, .86, n);
            float rim = pow(s, 4.) * (1. - thick * .8) * smoothstep(.2, 0., br);                   // edges near the break burn silver-gold
            vec3 body = mix(vec3(.42, .44, .52), vec3(.12, .14, .2), thick);
            vec3 cc = body + vec3(1., .82, .55) * rim * 3. + vec3(1., .9, .75) * pow(s, 4.) * .18 * (1. - thick);
            c = mix(c, cc, m * .96); }
          float T = fogT(cameraPosition, d, skyFogMax); c = c * T + fogCol(d) * (1. - T);
          gl_FragColor = vec4(c, 0.); }` });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1800, 64, 32), m); mesh.frustumCulled = false; mesh.renderOrder = -10;
    film.onFrame((t, f) => { mesh.position.setFromMatrixPosition(f.camera.matrixWorld); u.uT.value = t; });
    S.add(mesh); return { mesh, u };
  })();

  // ---------------------------------------------------------------- the camera: one move (Catmull-Rom through keys in time)
  // tilt up along the courses with the near capers passing → up the receding face → past the coping → the break in the clouds
  const KEYS = () => [
    [T.start - .5, V(1.6, 1.25, 5.2), V(9, 4.6, 0)],
    [T.start, V(1.7, 1.25, 5.2), V(9.3, 4.9, 0)],
    [T.n16 + .2, V(2.6, 1.55, 5.35), V(11.5, 9.5, 0)],
    [T.n16 + 2.2, V(3.2, 2.4, 5.9), V(13, 20, -1)],
    [T.n16 + 4.0, V(3.6, 3.4, 6.6), null],
    [T.end, V(3.8, 3.8, 6.9), null],
    [T.end + .5, V(3.85, 3.9, 6.95), null]];
  let KK = null;
  const cr = (p0, p1, p2, p3, u) => { const u2 = u * u, u3 = u2 * u; return p1.clone().multiplyScalar(2).add(p2.clone().sub(p0).multiplyScalar(u)).add(p0.clone().multiplyScalar(2).sub(p1.clone().multiplyScalar(5)).add(p2.clone().multiplyScalar(4)).sub(p3).multiplyScalar(u2)).add(p1.clone().multiplyScalar(3).sub(p0).sub(p2.clone().multiplyScalar(3)).add(p3).multiplyScalar(u3)).multiplyScalar(.5); };
  function camAt(t) {
    let i = 1; while (i < KK.length - 3 && t > KK[i + 1][0]) i++;
    const u = clamp((t - KK[i][0]) / (KK[i + 1][0] - KK[i][0]));
    const at = j => KK[Math.max(0, Math.min(KK.length - 1, j))];
    return { pos: cr(at(i - 1)[1], at(i)[1], at(i + 1)[1], at(i + 2)[1], u), tgt: cr(at(i - 1)[2], at(i)[2], at(i + 1)[2], at(i + 2)[2], u) };
  }
  function aimGap() {
    // the end view looks almost straight up past the coping; the break is put where the next shot's lamp is (540 × 690)
    KK = KEYS();
    const endDir = V(.16, .985, -.12).normalize();
    for (const k of KK) if (!k[2]) k[2] = k[1].clone().addScaledVector(endDir, 25);
    const c = camAt(T.end); cam.position.copy(c.pos); cam.up.set(0, 1, 0); cam.lookAt(c.tgt); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const ndc = V((540 / W) * 2 - 1, 1 - (690 / H) * 2, .5).unproject(cam).sub(cam.position).normalize();
    GAP.copy(ndc); sky.u.gapDir.value.copy(GAP);
  }

  function frame(t) {
    if (!T) return;
    const c = camAt(t); cam.position.copy(c.pos); cam.up.set(0, 1, 0); cam.lookAt(c.tgt); cam.updateMatrixWorld();
    const pk = ss(T.part[0], T.part[1], t);
    sky.u.uGap.value = pk;
    gapLamp.pos.copy(GAP).multiplyScalar(1500).add(cam.position); gapLamp.power = lerp(120, 520, pk);
    film.look.exposure = lerp(1.05, 1.1, pk);
    film.dofCfg.focus = Math.min(30, c.pos.distanceTo(c.tgt) * .75); film.dofCfg.aperture = lerp(1.2, .05, ss(T.n16, T.n16 + 2.6, t));   // the sky sharp: the break keeps its edges
    birds.forEach((b, i) => { const a = t * .25 + i * 1.3; setBird(b, V(4 + i * 3 + Math.sin(a) * 4, 38 + i * 1.5 + Math.sin(a * 1.7) * 1.2, -4 - i * 2 + Math.cos(a) * 3), .45, t * (7 + i) + i); });
    film.render(t);
  }
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const gS = mkC(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkC(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) {
    const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h);
    const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 180) / 75); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; }
    gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h);
    gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 24; i++) { const sc = 1 + i * .05; gbx.globalAlpha = Math.pow(.9, i) * .15; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); }
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.drawImage(gB, 0, 0, W, H); ctx.restore();
  }
  const tmp = V();
  function draw(ctx, t, B) {
    if (!T) { T = beats(B); aimGap(); }
    frame(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    tmp.copy(cam.position).add(GAP.clone().multiplyScalar(500)).project(cam);
    if (tmp.z < 1 && Math.abs(tmp.x) < 1.6 && Math.abs(tmp.y) < 1.6) godRays(ctx, (tmp.x + 1) / 2 * W, (1 - tmp.y) / 2 * H, .3 + .5 * ss(T.part[0], T.part[1], t));
  }
  return { film, draw, beats: () => T };
}
