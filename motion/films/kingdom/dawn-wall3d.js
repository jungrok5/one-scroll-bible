// dawn-wall3d.js — 「kingdom」 4부 「겨자씨와 보화」 opening (film 317.1–327.3: C3 · N16): the chapter title over the great ashlar
// wall of the city in the morning shade; under N16 「예수님이 말씀하신 하나님 나라는, 어떤 나라였을까요?」 the eye rises — a slow
// pedestal up the courses and a tilt past the parapet to the sky, where the clouds part on a light. That light is where the next
// shot's lamp burns behind the tent cloth (puppet-tent.js: the dissolve is light to light, the same place in the frame).
// After 「벤허」 (1959, OPUSCAR 32: Herodian stone in raking light) and the first film's 「귀환」 walls; cinecode camera-moves.md
// "tilt up — awe, scale" + "crane / pedestal up — a reveal over something". Engine: motion-skills cinematic-3d (lib3d/cine.js,
// kit.js sky, stoneMaterial); god rays after heal-village.js (screen-space scatter from the sun). No words; frame index frozen.
//
// API: const DW = await (await import('./dawn-wall3d.js')).build(W, H);  DW.draw(ctx, t, B)   B = { C3, N16, N17 }
import { Film, THREE, V, col, rng, GLSL, FOG_GLSL } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

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
  const S = film.scene, cam = film.camera;
  let T = null;

  // the sun high behind the wall (morning), so the face toward us is in soft shade and the parapet takes a gold rim
  const SUN = V(.05, .74, -1).normalize();
  // the sky of this shot (after kit.js sky()): deep morning blue, a broken deck of cloud that is dark where the sun is behind it
  // with a silver-gold edge, and a gap that opens round the sun as the eye arrives (uGap) — the light between the clouds
  const sky = (() => {
    const u = { ...film.fogU, sunDir: { value: SUN.clone() }, uGap: { value: 0 }, uT: { value: 0 }, skyFogMax: { value: film.atmos.max } };
    const m = new THREE.ShaderMaterial({ uniforms: u, side: THREE.BackSide, depthWrite: false,
      vertexShader: `varying vec3 vD; void main(){ vD = normalize((modelMatrix * vec4(position, 0.)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.)).xyz, 1.); gl_Position = p.xyww; }`,
      fragmentShader: `varying vec3 vD; uniform vec3 sunDir; uniform float uGap, uT, skyFogMax;
        ${GLSL.hash}
        ${FOG_GLSL}
        void main(){ vec3 d = normalize(vD); float y = d.y, s = max(dot(d, sunDir), 0.), ang = acos(clamp(dot(d, sunDir), -1., 1.));
          vec3 c = mix(vec3(1.05, .86, .66) * 1.05, vec3(.42, .55, .76) * .9, smoothstep(-.02, .3, y)); c = mix(c, vec3(.16, .27, .5) * .85, smoothstep(.3, .95, y));
          c += vec3(1., .82, .55) * (pow(s, 24.) * .5 + pow(s, 200.) * 2.5) + vec3(1., .96, .88) * 12. * smoothstep(.99955, .99975, s);
          if (y > 0.) { vec2 p = d.xz / (y + .18) * 1.25 + vec2(uT * .004, uT * .002);
            float n = fbm(p * 1.6) * .68 + fbm(p * 4.3 + 3.) * .32;
            float ge = .06 + uGap * .24 + (fbm(p * 2.2 + 9.) - .5) * .34; float gap = smoothstep(ge, ge + .16, ang);   // the opening round the sun, ragged
            float m = smoothstep(.40, .62, n) * gap * smoothstep(0., .12, y);
            float thick = smoothstep(.5, .85, n);
            float lit = pow(s, 6.) * (1. - thick * .85);                                    // thin edges facing the sun glow
            vec3 body = mix(vec3(.62, .62, .7), vec3(.26, .28, .36), thick) * (.9 + .3 * smoothstep(.0, .8, y));
            vec3 cc = body + vec3(1., .78, .48) * lit * 2.2 + vec3(1., .9, .75) * pow(s, 3.) * .25;
            c = mix(c, cc, m * .92); }
          float T = fogT(cameraPosition, d, skyFogMax); c = c * T + fogCol(d) * (1. - T);
          gl_FragColor = vec4(c, 0.); }` });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1800, 64, 32), m); mesh.frustumCulled = false; mesh.renderOrder = -10;
    film.onFrame((t, f) => { mesh.position.setFromMatrixPosition(f.camera.matrixWorld); u.uT.value = t; });
    S.add(mesh); return { mesh, u };
  })();
  S.add(new THREE.HemisphereLight(col('#b4c2da'), col('#7a6450'), .62));
  // the morning light raking across the face from the left: every boss throws a small shadow, the margins catch it
  const key = new THREE.DirectionalLight(col('#ffd6a4'), 3.1); key.position.set(-120, 46, 70); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 400 }); key.shadow.bias = -.0004; key.shadow.normalBias = .03; key.target.position.set(0, 8, 0); S.add(key, key.target);
  const sunL = new THREE.DirectionalLight(col('#ffe0b0'), 2.4); sunL.position.copy(SUN).multiplyScalar(200); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048);
  Object.assign(sunL.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 500 }); sunL.shadow.bias = -.0005; S.add(sunL, sunL.target);
  const sunLamp = film.lamp(SUN.clone().multiplyScalar(1500), '#ffd9a0', { power: 140, size: 60, fog: 1 });

  // the wall: Herodian ashlar — each block a box with a drafted margin and a raised boss, courses of 1 m, laid in a bond
  {
    const stone = new THREE.MeshStandardMaterial({ color: '#ddcca8', roughness: .88 });
    const R = rng(11), parts = [];
    const box = new THREE.BoxGeometry(1, 1, 1);
    const M = (x, y, z, sx, sy, sz) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion(), V(sx, sy, sz));
    for (let row = 0; row < 17; row++) {
      const h = .98, y = row * 1.0 + h / 2, off = (row % 2) * 1.2 + R() * .4;
      for (let x = -26 + off; x < 26; ) {
        const w = 1.8 + R() * 1.6, cx = x + w / 2, tone = .86 + R() * .2;
        parts.push([box, M(cx, y, -.45, w - .07, h - .07, .9), new THREE.Color('#ddcca8').multiplyScalar(tone)]);
        parts.push([box, M(cx, y, .02, w - .34, h - .3, .06 + R() * .04), new THREE.Color('#ddcca8').multiplyScalar(tone * (1.02 + R() * .05))]);
        x += w;
      }
    }
    // the parapet with merlons on top
    for (let x = -26; x < 26; x += 2.2) { parts.push([box, M(x + .7, 17.7, -.45, 1.4, 1.4, .9), new THREE.Color('#c2ae8e')]); }
    parts.push([box, M(0, 17.05, -.4, 52, .1, 1.1), new THREE.Color('#b6a282')]);
    parts.push([box, M(0, 8.5, -1.05, 54, 17.2, .5), new THREE.Color('#8a7a62')]);   // the core behind the facing (no light through the joints)
    const geo = K.mergeGeometries(parts); const mat = stone.clone(); mat.vertexColors = true;
    const wall = new THREE.Mesh(geo, mat); wall.castShadow = wall.receiveShadow = true; S.add(wall);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#8a7860', roughness: 1 })); ground.receiveShadow = true; film.ground(ground); S.add(ground);
    // a few birds wheeling high over the wall (alive, small)
  }
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
    film.dofCfg.focus = lerp(9.5, 30, ss(T.rise[0], T.rise[1], t));
    birds.forEach((b, i) => { const a = t * .25 + i * 1.3; setBird(b, V(-6 + i * 3 + Math.sin(a) * 4, 24 + i * 1.5 + Math.sin(a * 1.7) * 1.2, -6 - i * 2 + Math.cos(a) * 3), .35, t * (7 + i) + i); });
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
