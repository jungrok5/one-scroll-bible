// partShepherds, alternative B (관리자 2026-11-05 "목동 판화씬 … 성탄 느낌 뿜뿜하는 거 — 시네마틱 3D 들판이랑 스테인드글라스 둘 다"):
// the fields of Bethlehem at night in cinematic-3d. A low camera among the sheep behind three shepherds by a small fire, ground mist,
// stars; at 105.4 s the sky above them opens — a great soft light in the haze, then a multitude of small lights (the host, Lk 2:13)
// spreading through it — and the whole field is lit from above; one shepherd kneels, one shields his eyes. No angel figure.
// build(W, H) → { film, canvas, draw(ctx, u) } — u = seconds into the scene (0 … 9.8).
import { Film, THREE, V, col, rng, ease, noise1 } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

export function build(W, H) {
  const vert = H > W, DUR = 9.8, GLORY = .8;
  const film = new Film({
    W, H, dur: DUR, fov: vert ? 54 : 38, near: .1, far: 1200,
    atmos: { density: .016, falloff: .05, start: 4, color: col('#1a2440', .45), colorUp: col('#121a30', .3), max: 900, scatter: .7, anisotropy: .7, phaseMix: .85 },
    bloom: { strength: .1, radius: 1.2, tint: col('#fff0d0') },
    dof: { focus: 12, aperture: 2.5, maxCoc: 20 },
    look: { exposure: .95, contrast: 1.08, saturation: 1.05, lift: col('#04060c'), shadowTint: col('#b8c4ec'), highTint: col('#fff2dc'), vignette: .42, grain: .05, ca: .4 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, R = rng(41);
  const sky = K.sky(film, { top: col('#03050c', .14), mid: col('#0a1228', .22), horizon: col('#1e2a48', .32), stars: 1 });
  const hemi = new THREE.HemisphereLight(col('#5a6a9c'), col('#14100c'), .3); S.add(hemi);
  const moon = new THREE.DirectionalLight(col('#9fb2e0'), .5); moon.position.set(-30, 40, 10); S.add(moon);
  // the field: gentle hills of dry grass, a stone wall line, the far ridge with Bethlehem's few lamps
  const g = new THREE.PlaneGeometry(400, 400, 120, 120), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 1.4 * Math.sin(x * .05) * Math.cos(y * .04) + .6 * noise1(x * .2 + y * .13, 3) + Math.max(0, -y - 60) * .08); }
  g.computeVertexNormals(); const ground = new THREE.Mesh(g, K.std('#2e2a1e', { roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; S.add(ground);
  const hz = (x, z) => 1.4 * Math.sin(x * .05) * Math.cos(-z * .04) + .6 * noise1(x * .2 - z * .13, 3) + Math.max(0, z - 60) * .08;
  const ridge = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 12), K.std('#1a1a1c', { roughness: 1 })); ridge.scale.set(2.4, .16, 1); ridge.position.set(30, -4, -230); S.add(ridge);
  for (let i = 0; i < 7; i++) film.lamp(V(-20 + i * 9 + (R() - .5) * 4, 14 + R() * 3, -205 - R() * 10), '#ffb860', { power: .35, size: .4, fog: 1 });   // Bethlehem far off
  // the fire, its light on the shepherds
  const fireP = V(1.2, hz(1.2, -9) + .3, -9), fire = film.lamp(fireP, '#ff9a40', { power: 1.6, size: .3, light: 40, distance: 18, fog: 1.6 });
  for (let i = 0; i < 6; i++) { const st = new THREE.Mesh(new THREE.DodecahedronGeometry(.16, 0), K.std('#3a342c')); const a = i / 6 * 6.283; st.position.set(fireP.x + Math.cos(a) * .45, fireP.y - .22, fireP.z + Math.sin(a) * .45); S.add(st); }
  const flame = new THREE.Mesh(new THREE.ConeGeometry(.22, .6, 8), K.glow('#ffb050', 8)); flame.position.copy(fireP); S.add(flame);
  // three shepherds with their crooks, facing the fire then the sky
  const coats = ['#3a2418', '#2a2a1c', '#2c1e18'], men = [];
  for (const [x, z, h, ry] of [[-.4, -10.2, 1.72, -.3], [2.6, -10.6, 1.68, .5], [.8, -11.6, 1.75, .1]]) {
    const m = K.person({ seed: men.length + 3, coat: coats[men.length], height: h }); m.position.set(x, hz(x, z), z); m.rotation.y = Math.PI / 2 + ry; S.add(m);
    const crook = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1.9, 6), K.std('#2a1a10')); crook.position.set(.32, .95, -.15); m.add(crook); men.push(m); }
  // the sheep, resting in the grass between the camera and the fire
  const wool = K.std('#b8ae96', { roughness: 1 }), dark = K.std('#1e1a16');
  for (let i = 0; i < 26; i++) { const x = (R() - .5) * 16, z = -3 - R() * 16; if (Math.hypot(x - 1.2, z + 9) < 2.4) continue;
    const s = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.42, 12, 8), wool); b.scale.set(1.3, .75, .85); b.position.y = .32; s.add(b);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), dark); hd.scale.set(1.3, 1, .9); hd.position.set(.55, .42, 0); s.add(hd);
    s.position.set(x, hz(x, z), z); s.rotation.y = R() * 6.283; s.traverse(o => { if (o.isMesh) o.castShadow = true; }); S.add(s); }
  // the glory: a great soft light high in the haze over the field, and the host — many small lights spreading through the sky
  const gloryP = V(0, 20, -46)   /* in the frame, above the shepherds */, glory = film.lamp(gloryP, '#fff2d8', { power: 0, size: 6, fog: 5 });
  const gloryLight = new THREE.PointLight(col('#fff0d8'), 0, 160, 1.2); gloryLight.position.copy(gloryP); S.add(gloryLight);
  const host = []; const hr = rng(9);
  for (let i = 0; i < 22; i++) { const a = hr() * 6.283, d = 3 + hr() * 26, pos = V(Math.cos(a) * d, 20 + Math.sin(a) * d * .55 + hr() * 4, -46 - hr() * 10);
    host.push({ L: film.lamp(pos, '#ffe2b0', { power: 0, size: 1.2, fog: 4 }), t0: GLORY + .4 + hr() * 2.4, k: .7 + hr() * .8 }); }
  const sparks = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: col('#ffdca0', 5), size: .5, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false }));
  { const n = 600, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const r = 2 + Math.pow(hr(), .7) * 40, th = hr() * 6.283; a[i * 3] = Math.cos(th) * r; a[i * 3 + 1] = 20 + Math.sin(th) * r * .5; a[i * 3 + 2] = -46 - hr() * 14; }
    sparks.geometry.setAttribute('position', new THREE.BufferAttribute(a, 3)); } S.add(sparks);

  film.onFrame((u, f) => {
    const cam = f.camera, k = ease.inOut(Math.min(1, u / DUR)), gl = ease.out(Math.min(1, Math.max(0, (u - GLORY) / 1.2)));
    // low among the sheep behind the shepherds; as the light comes, the camera rises a little and the gaze lifts to the sky
    cam.position.set(-1.2 + .8 * k + noise1(u * .5, 1) * .02, hz(-1.2, 2) + .8 + .3 * k, 2 - 1.2 * k);
    const look = V(.8, 1.0, -11).lerp(V(.4, 3.6, -30), ease.inOut(Math.min(1, Math.max(0, (u - GLORY - .3) / 4))) * (vert ? 1 : .7));   // the shepherds stay above the verse
    cam.lookAt(look); f.dofCfg.focus = cam.position.distanceTo(V(.8, 1.4, -10.8));
    glory.power = 9 * gl; gloryLight.intensity = 700 * gl; hemi.intensity = .3 + .45 * gl; hemi.color.copy(col('#5a6a9c').lerp(col('#ffe8c8'), gl));
    f.look.exposure = .95 - .12 * gl + .08 * Math.sin(Math.min(1, gl) * Math.PI);
    for (const h of host) h.L.power = h.k * ease.out(Math.min(1, Math.max(0, (u - h.t0) / 1.6))) * (.85 + .15 * noise1(u * 1.7, h.t0 * 10));
    sparks.material.opacity = .9 * ease.inOut(Math.min(1, Math.max(0, (u - GLORY - .8) / 3)));
    const fl = .85 + .15 * noise1(u * 4, 2); fire.power = 1.6 * fl * (1 - .4 * gl); if (fire.light) fire.light.intensity = 40 * fl; flame.scale.set(1, .85 + .3 * noise1(u * 5, 4), 1);
    // the shepherds: one kneels, one shields his eyes, one looks up — on twos, not a slide
    const s = Math.floor(Math.min(1, Math.max(0, (u - GLORY - .2) / 1.4)) * 4) / 4;
    men[0].userData.body.rotation.z = -.35 * s; men[0].position.y = hz(-.4, -10.2) - .38 * s;
    men[1].userData.arms[1].rotation.z = -2.2 * s; men[1].userData.body.rotation.z = .12 * s;
    men[2].userData.body.rotation.z = .16 * s;
  });
  return { film, canvas: film.canvas, draw(ctx, u) { film.render(Math.max(0, Math.min(DUR, u))); ctx.drawImage(film.canvas, 0, 0, W, H); } };
}
