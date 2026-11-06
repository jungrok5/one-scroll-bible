// partShepherds, alternative B — the fields of Bethlehem, cinematic-3d (engine ../lib3d). Round 2 (관리자 2026-11-06: "너무 저퀄리티야,
// 퀄리티에 집착해봐 — 빛도 환상적으로 하늘에 쫙 퍼지는 애니 같은 것 없이 같은 크기로 떠 있고, 캐릭터나 동물도 너무 단순"):
// the glory is choreographed, not switched on. A quiet night (fire, a low cloud deck, stars in its gaps) → one point of light pierces the
// clouds → a ring of light rolls outward THROUGH the cloud deck (lamps inside the slab light it from within) until the whole sky is gold,
// and the field is lit from above → the host streams out of the light on curved paths with trails and settles into a vast formation at
// many depths that twinkles and turns slowly → golden motes drift down past the lens. Three robed shepherds with mantles, head-cloths and
// crooked staffs (one kneels, one shields his eyes, one looks up), woolly sheep whose heads lift, swaying grass, a dry-stone sheepfold.
// build(W, H) → { film, canvas, draw(ctx, u) } — u = seconds into the scene (0 … 9.8); the glory's first light at u 0.5.
import { Film, THREE, V, col, rng, ease, noise1 } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

const clamp01 = x => Math.min(1, Math.max(0, x));
const win = (u, a, b) => clamp01((u - a) / (b - a));

export function build(W, H) {
  const vert = H > W, DUR = 9.8;
  const film = new Film({
    W, H, dur: DUR, fov: vert ? 56 : 40, near: .1, far: 2000,
    atmos: { density: .012, falloff: .035, start: 6, color: col('#18223e', .42), colorUp: col('#10182e', .3), max: 1400, scatter: .9, anisotropy: .72, phaseMix: .85 },
    cloud: { bottom: 30, top: 62, density: .085, scale: .0048, cover: .6, steps: 40, wind: V(.012, 0, .004), litTop: col('#7a88b8', .18), litBottom: col('#2a3050', .12), shadow: col('#0c1024', .06) },
    bloom: { strength: .11, radius: 1.25, tint: col('#fff0d0') },
    dof: { focus: 7, aperture: 2.6, maxCoc: 22 },
    look: { exposure: 1.0, contrast: 1.1, saturation: 1.06, lift: col('#03050c'), shadowTint: col('#b4c0ea'), highTint: col('#fff0d8'), vignette: .44, grain: .05, ca: .45 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, R = rng(51);
  const sky = K.sky(film, { top: col('#02040b', .12), mid: col('#08102a', .2), horizon: col('#1a2546', .3), stars: 1.1 });
  const hemi = new THREE.HemisphereLight(col('#4e5e92'), col('#120e0a'), .28); S.add(hemi);
  const moon = new THREE.DirectionalLight(col('#8fa2d6'), .35); moon.position.set(-40, 50, 30); S.add(moon);
  const std = (c, r = .95, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...o });

  // ---------- the land ----------
  const hz = (x, z) => .9 * Math.sin(x * .045 + 1) * Math.cos(z * .035) + .35 * noise1(x * .21 + z * .17, 3) + Math.max(0, -z - 70) * .1;
  { const g = new THREE.PlaneGeometry(500, 500, 180, 180), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, hz(p.getX(i), -p.getY(i))); g.computeVertexNormals();
    const m = new THREE.Mesh(g, std('#2a2618')); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; S.add(m); }
  // the far ridge and Bethlehem's few lamps
  { const r = new THREE.Mesh(new THREE.SphereGeometry(160, 40, 14), std('#121216', 1)); r.scale.set(2.6, .16, 1); r.position.set(40, -6, -320); S.add(r); }
  for (let i = 0; i < 3; i++) film.lamp(V(10 + i * 11 + (R() - .5) * 5, 18 + R() * 3, -300), '#ffb860', { power: .3, size: .5, fog: 1 });
  // swaying grass: instanced blades around the flock, bent by a slow wind (vertex shader, a function of time only)
  const grassU = { uT: { value: 0 } };
  { const blade = new THREE.PlaneGeometry(.03, .28, 1, 4); blade.translate(0, .14, 0); const bp = blade.attributes.position;
    for (let i = 0; i < bp.count; i++) { const y = bp.getY(i); bp.setX(i, bp.getX(i) * (1 - y / .5)); bp.setZ(i, y * y * .25); }
    const gm = std('#6a6634', 1, { side: THREE.DoubleSide });
    gm.onBeforeCompile = sh => { Object.assign(sh.uniforms, grassU); sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        { vec3 ip = vec3(instanceMatrix[3][0], 0., instanceMatrix[3][2]); float w = sin(uT * 1.3 + ip.x * .35 + ip.z * .22) * .5 + sin(uT * 2.1 + ip.x * .9) * .2;
          transformed.x += w * position.y * position.y * .9; }`); };
    gm.customProgramCacheKey = () => 'grass';
    const N = 14000, inst = new THREE.InstancedMesh(blade, gm, N), M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V(1, 1, 1), gr = rng(7);
    for (let i = 0; i < N; i++) { let x = (gr() - .5) * 26, z = 4 - gr() * 30; if (Math.hypot(x - 3.6, z + .4) < 2.2) x += 4; const s = .6 + gr() * .9; q.setFromEuler(new THREE.Euler((gr() - .5) * .3, gr() * 6.283, (gr() - .5) * .3)); sc.set(s, s * (.7 + gr() * .8), s);
      M.compose(V(x, hz(x, z) - .02, z), q, sc); inst.setMatrixAt(i, M); }
    inst.receiveShadow = true; S.add(inst); }
  // a dry-stone sheepfold curving behind the flock
  { const st = std('#5c5648', .98), gr = rng(12);
    for (let i = 0; i < 70; i++) { const a = -2.6 + i * .045, r = 13 + (gr() - .5) * .3, x = Math.cos(a) * r + 1, z = Math.sin(a) * r - 9, h = gr();
      for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.DodecahedronGeometry(.22 + gr() * .12, 0), st); b.scale.set(1.4, .7, 1); b.position.set(x + (gr() - .5) * .2, hz(x, z) + .14 + k * .26, z + (gr() - .5) * .2); b.rotation.set(gr() * 3, gr() * 3, gr() * 3); b.castShadow = b.receiveShadow = true; if (k < 2 || h > .4) S.add(b); } } }

  // ---------- the fire ----------
  const fireP = V(0, hz(0, -6.3) + .25, -6.3), fire = film.lamp(fireP, '#ff9440', { power: 1.8, size: .25, light: 55, distance: 22, fog: 1.4 });
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, s = new THREE.Mesh(new THREE.DodecahedronGeometry(.13, 0), std('#3a342c')); s.position.set(fireP.x + Math.cos(a) * .42, fireP.y - .2, fireP.z + Math.sin(a) * .42); S.add(s); }
  const flames = []; for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(.16 - i * .03, .55 - i * .1, 8), K.glow(['#ff8a30', '#ffb050', '#ffe0a0'][i], 6 + i * 3)); f.position.copy(fireP); f.position.x += (i - 1) * .07; S.add(f); flames.push(f); }
  const embers = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: col('#ffb060', 4), size: .03, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  embers.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(60 * 3), 3)); S.add(embers);

  // ---------- shepherds: robe + open mantle + head-cloth with band + sleeves + hands + a crooked staff ----------
  const skin = std('#8a5a3c', .7);
  function shepherd({ robe, mantle, cloth, h = 1.72, seed = 1 }) {
    const g = new THREE.Group(), s = h / 1.72, L = pts => pts.map(([r, y]) => new THREE.Vector2(r * s, y * s));
    const body = new THREE.Group(); g.add(body);
    const robeM = new THREE.Mesh(new THREE.LatheGeometry(L([[0, 0], [.3, 0], [.32, .04], [.29, .45], [.25, .9], [.255, 1.16], [.285, 1.29], [.25, 1.39], [.1, 1.46], [0, 1.47]]), 44), std(robe)); robeM.castShadow = true; body.add(robeM);
    // a few heavy folds down the robe (thin dark ridges) so it reads as cloth, not a cone
    for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283 + seed, f = new THREE.Mesh(new THREE.CylinderGeometry(.012 * s, .03 * s, 1.0 * s, 5), std(robe, 1)); f.position.set(Math.cos(a) * .25 * s, .5 * s, Math.sin(a) * .25 * s); f.rotation.z = Math.cos(a) * .06; f.rotation.x = -Math.sin(a) * .06; body.add(f); }
    const mant = new THREE.Mesh(new THREE.LatheGeometry(L([[.37, .32], [.34, .7], [.31, 1.05], [.31, 1.24], [.29, 1.36], [.13, 1.47]]), 44, Math.PI * .35, Math.PI * 1.3), std(mantle, 1, { side: THREE.DoubleSide })); mant.castShadow = true; body.add(mant);
    const head = new THREE.Group(); head.position.y = 1.56 * s; body.add(head);
    const face = new THREE.Mesh(new THREE.SphereGeometry(.105 * s, 18, 14), skin); face.scale.set(.92, 1.08, .95); head.add(face);
    const beard = new THREE.Mesh(new THREE.SphereGeometry(.075 * s, 12, 10), std('#2a2018', 1)); beard.position.set(0, -.07 * s, .06 * s); beard.scale.set(1, .9, .7); head.add(beard);
    const hood = new THREE.Mesh(new THREE.LatheGeometry(L([[.0, .185], [.055, .18], [.095, .165], [.125, .135], [.145, .095], [.155, .04], [.157, -.03], [.17, -.12], [.22, -.2], [.3, -.27], [.33, -.42]]), 44, Math.PI * .22, Math.PI * 1.56), std(cloth, 1, { side: THREE.DoubleSide })); hood.castShadow = true; head.add(hood);
    const band = new THREE.Mesh(new THREE.TorusGeometry(.115 * s, .012 * s, 6, 24), std('#2a1a10')); band.rotation.x = Math.PI / 2 + .15; band.position.y = .08 * s; head.add(band);
    const belt = new THREE.Mesh(new THREE.TorusGeometry(.225 * s, .022 * s, 6, 28), std('#6a3a1e')); belt.rotation.x = Math.PI / 2; belt.position.y = .95 * s; body.add(belt);
    const arm = side => { const p = new THREE.Group(); p.position.set(side * .3 * s, 1.33 * s, 0); p.rotation.z = side * .1; body.add(p);
      const sl = new THREE.Mesh(new THREE.CylinderGeometry(.06 * s, .1 * s, .62 * s, 12), std(mantle)); sl.position.y = -.29 * s; p.add(sl);
      const hd = new THREE.Mesh(new THREE.SphereGeometry(.045 * s, 10, 8), skin); hd.position.y = -.6 * s; p.add(hd); p.userData.hand = hd; return p; };
    const armL = arm(-1), armR = arm(1);
    const curve = new THREE.CatmullRomCurve3([V(0, 0, 0), V(0, 1.2, 0), V(0, 1.85, 0), V(.06, 1.97, 0), V(.16, 1.95, 0), V(.19, 1.86, 0)].map(v => v.multiplyScalar(s)));
    const staff = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .016 * s, 6), std('#3a2614', .8)); staff.castShadow = true; g.add(staff);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return { g, body, head, armL, armR, staff };
  }
  const men = [
    { ...shepherd({ robe: '#5a4430', mantle: '#3a2a1e', cloth: '#d8cdb4', h: 1.7, seed: 1 }), x: -1.1, z: -5.5, ry: 0 },    // kneels
    { ...shepherd({ robe: '#4a4a3a', mantle: '#6a3a26', cloth: '#c8bea2', h: 1.76, seed: 2 }), x: 1.3, z: -5.9, ry: 0 },    // shields his eyes
    { ...shepherd({ robe: '#3e3226', mantle: '#4e4436', cloth: '#e2d8c0', h: 1.62, seed: 3 }), x: .1, z: -7.2, ry: 0 },    // looks up
  ];
  for (const m of men) { m.g.position.set(m.x, hz(m.x, m.z), m.z); m.g.rotation.y = Math.atan2(-60 - m.x, -150 - m.z) + m.ry;   /* each faces the light (front = +z) */ m.staff.position.set(.34, 0, .05); S.add(m.g); }

  // ---------- sheep: fluffy wool (displaced icosphere), dark head with ears, legs; some lying ----------
  const wool = std('#c9bfa6', 1), dark = std('#241e18', .9);
  function sheepG(seed, lying) {
    const g = new THREE.Group(), r = rng(seed), bg = new THREE.SphereGeometry(.42, 40, 28), p = bg.attributes.position;
    for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)), k = 1 + .07 * noise1(v.x * 9 + v.y * 7 + v.z * 5 + seed, 4) + .035 * noise1(v.x * 23 - v.z * 19 + v.y * 11, 5); v.multiplyScalar(k); p.setXYZ(i, v.x, v.y, v.z); }
    bg.computeVertexNormals(); const b = new THREE.Mesh(bg, wool); b.scale.set(1.35, .82, .92); b.position.y = lying ? .28 : .5; g.add(b);
    const neck = new THREE.Group(); neck.position.set(.5, lying ? .38 : .62, 0); g.add(neck);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.12, 24, 16), dark); hd.scale.set(1.7, .9, .8); hd.position.set(.14, -.03, 0); neck.add(hd);
    const poll = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 14), wool); poll.scale.set(1, .8, 1); poll.position.set(-.02, .06, 0); neck.add(poll);
    for (const sd of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), dark); e.scale.set(.5, .25, 1.2); e.position.set(.02, .05, sd * .12); e.rotation.x = sd * .6; neck.add(e); }
    if (!lying) for (const [lx, lz] of [[-.3, -.15], [-.3, .15], [.3, -.15], [.3, .15]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.035, .03, .4, 6), dark); l.position.set(lx, .2, lz); g.add(l); }
    g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.userData.neck = neck; g.userData.seed = r(); return g;
  }
  const flock = [];
  { const fr = rng(31); for (let i = 0; i < 30; i++) { const x = (fr() - .5) * 18, z = 1 - fr() * 18; if (Math.hypot(x, z + 6.3) < 2.6 || z > -2.5) continue;   /* the flock lies beyond the group, none at the lens */
    const sh = sheepG(100 + i, fr() < .45); sh.position.set(x, hz(x, z), z); sh.rotation.y = fr() * 6.283; S.add(sh); flock.push(sh); } }

  // ---------- the glory ----------
  const GC = V(-60, 46, -150);                                   // where it breaks through: inside the cloud deck, ahead and high
  const core = film.lamp(GC.clone(), '#fff4dc', { power: 0, size: 3, fog: 8 });
  const ring = []; for (let i = 0; i < 12; i++) ring.push({ L: film.lamp(GC.clone(), i % 2 ? '#ffe2a8' : '#fff0d0', { power: 0, size: 6, fog: 7 }), a: i / 12 * 6.283, f: 1 });
  for (let i = 0; i < 6; i++) ring.push({ L: film.lamp(GC.clone(), '#ffd89a', { power: 0, size: 9, fog: 5 }), a: i / 6 * 6.283 + .26, f: .55 });
  const coreSprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: col('#fff6e0', 9), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); coreSprite.position.copy(GC).add(V(0, -14, 10)); coreSprite.scale.set(26, 26, 1); S.add(coreSprite);
  const sun = new THREE.DirectionalLight(col('#ffe6c0'), 0); sun.position.set(0, 90, -120); sun.target.position.set(.5, 0, -6); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 300 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; S.add(sun, sun.target);
  // the host: many small lights that stream out of the glory along curved paths and settle into a great formation, twinkling
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,240,210,.8)'); g.addColorStop(.6, 'rgba(255,220,160,.18)'); g.addColorStop(1, 'rgba(255,210,150,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const HN = 640, hr = rng(77), host = [];
  for (let i = 0; i < HN; i++) { const ring2 = Math.pow(hr(), .6), th = hr() * 6.283;   // a great disc of the host tilted toward us, thicker near the glory
    host.push({ end: V(GC.x + Math.cos(th) * ring2 * 170, 40 + Math.sin(th) * ring2 * 30 + (hr() - .5) * 16, -150 + Math.sin(th) * ring2 * 70 + (hr() - .5) * 40),
      t0: 1.4 + hr() * 2.6 + ring2 * 1.2, dur: 1.4 + hr() * 1.2, bend: (hr() - .5) * 2, ph: hr() * 6.283, tw: 1.5 + hr() * 3, g: i % 3 }); }
  const mkPts = (size, k) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(HN * 3), 3)); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(HN * 3), 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ size, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, color: col('#ffe8c0', k) })); p.frustumCulled = false; S.add(p); return p; };
  const hostP = mkPts(3.4, 9), trail1 = mkPts(2.4, 4), trail2 = mkPts(1.6, 2);
  const pathAt = (h, u) => { const k = ease.out(clamp01((u - h.t0) / h.dur)); if (k <= 0) return null;
    const p = GC.clone().lerp(h.end, k), side = V(h.end.z - GC.z, 0, -(h.end.x - GC.x)).normalize().multiplyScalar(Math.sin(k * Math.PI) * 30 * h.bend); p.add(side); p.y += Math.sin(k * Math.PI) * 10;
    if (k >= 1) { const w = u - h.t0 - h.dur; p.x += Math.sin(w * .5 + h.ph) * 1.6; p.y += Math.sin(w * .7 + h.ph * 2) * 1.2; } return { p, k }; };
  // golden motes drifting down past the lens after the light comes
  film.addPrecip({ kind: 'snow', count: 2600, box: [V(-14, 0, -24), V(28, 14, 30)], speed: .35, size: .02, sway: .5, ambient: col('#ffd8a0', .35), bright: 0, seed: 9, far: 30 });
  const motes = film.precip[film.precip.length - 1];

  film.onFrame((u, f) => {
    grassU.uT.value = u;
    const pierce = ease.inOut(win(u, .45, .9)), spread = ease.out(win(u, .8, 3.4)), lit = ease.inOut(win(u, .9, 3.0));
    // 1 the first light through the clouds  2 the ring rolling outward through the deck  3 the field lit from above
    core.power = 40 * pierce * (1 - .45 * win(u, 1.2, 4)) + 6 * Math.sin(Math.min(1, pierce) * Math.PI) * 2;
    for (const r of ring) { const rad = (6 + spread * 260) * r.f; r.L.pos.set(GC.x + Math.cos(r.a) * rad, GC.y - 4 + Math.sin(u * .4 + r.a) * 2, GC.z + Math.sin(r.a) * rad * .7);
      r.L.power = (r.f === 1 ? 60 : 22) * win(u, .8, 1.05) * (1 - .6 * spread) * (.9 + .1 * Math.sin(u * 2 + r.a * 3)); }
    coreSprite.material.opacity = pierce * (1 - .5 * win(u, 1.5, 5));
    const after = ease.inOut(win(u, 3.0, 6.0)); f.cloud.litBottom.copy(col('#2a3050', .12).lerp(col('#e8a860', .55), after)); f.cloud.litTop.copy(col('#7a88b8', .18).lerp(col('#ffe8c8', .45), after));
    sun.intensity = 2.2 * lit; hemi.intensity = .28 + .7 * lit; hemi.color.copy(col('#4e5e92').lerp(col('#ffe6c4'), lit)); hemi.groundColor.copy(col('#120e0a').lerp(col('#4a3a24'), lit));
    f.atmos.color.copy(col('#18223e', .42).lerp(col('#4a3a2a', .45), after)); f.atmos.colorUp.copy(col('#10182e', .3).lerp(col('#6a5034', .4), after));
    f.look.exposure = 1.0 - .15 * lit + .1 * Math.exp(-Math.pow((u - 1.0) / .35, 2));   // a breath of overexposure as it breaks, then the eye adjusts
    // the host
    const P = hostP.geometry.attributes.position, C = hostP.geometry.attributes.color, P1 = trail1.geometry.attributes.position, C1 = trail1.geometry.attributes.color, P2 = trail2.geometry.attributes.position, C2 = trail2.geometry.attributes.color;
    for (let i = 0; i < HN; i++) { const h = host[i], a = pathAt(h, u), b = pathAt(h, u - .1), c = pathAt(h, u - .22), tw = .65 + .35 * Math.sin(u * h.tw + h.ph);
      const put = (PA, CA, q, k) => { if (!q) { PA.setXYZ(i, GC.x, GC.y, GC.z); CA.setXYZ(i, 0, 0, 0); return; } PA.setXYZ(i, q.p.x, q.p.y, q.p.z); CA.setXYZ(i, k, k, k); };
      put(P, C, a, a ? (a.k < 1 ? 1.2 : tw) : 0); put(P1, C1, b, b && b.k < 1 ? .7 : 0); put(P2, C2, c, c && c.k < 1 ? .45 : 0); }
    for (const a of [P, C, P1, C1, P2, C2]) a.needsUpdate = true;
    motes.u.bright.value = 1.1 * win(u, 2.4, 4.4);
    // the fire, its embers
    const fl = .85 + .15 * noise1(u * 4.2, 2); fire.power = 1.8 * fl * (1 - .5 * lit); if (fire.light) fire.light.intensity = 55 * fl * (1 - .4 * lit);
    flames.forEach((m, i) => { m.scale.set(1, .8 + .35 * noise1(u * (5 + i), 4 + i), 1); m.rotation.y = u * (1 + i); });
    { const ep = embers.geometry.attributes.position, er = rng(5); for (let i = 0; i < 60; i++) { const ph = er(), sp = .6 + er() * .8, tt = i < 30 ? (u * sp + ph * 3) % 2 : 99;
      ep.setXYZ(i, fireP.x + Math.sin(tt * 2 + i) * .12 * tt, fireP.y + .15 + tt * .35, fireP.z + Math.cos(tt * 1.7 + i) * .12 * tt); } ep.needsUpdate = true; }
    // the shepherds react on twos: the near one sinks to his knees, the right one lifts his arm to shield his eyes, the far one looks up
    const r = Math.floor(win(u, 1.0, 2.6) * 6) / 6;
    men[0].body.position.y = -.42 * r; men[0].body.rotation.x = .28 * r; men[0].body.scale.y = 1 - .18 * r; men[0].armL.rotation.x = -1.1 * r; men[0].armR.rotation.x = -1.1 * r;
    men[1].armR.rotation.x = -2.5 * r; men[1].armR.rotation.z = -.4 * r; men[1].head.rotation.x = -.25 * r; men[1].body.rotation.x = -.06 * r;
    men[2].head.rotation.x = -.5 * r; men[2].body.rotation.x = -.08 * r; men[2].armL.rotation.x = -.5 * r;
    for (const sh of flock) sh.userData.neck.rotation.z = .55 * Math.floor(win(u, 1.2 + sh.userData.seed * 1.5, 2.2 + sh.userData.seed * 1.5) * 4) / 4;   // heads lift toward the light
    // the camera: low among the flock behind the shepherds; as the sky opens it cranes up and back and the gaze lifts with them
    const k = ease.inOut(u / DUR), up = ease.inOut(win(u, 1.0, 5.5)), cam = f.camera;
    cam.position.set(4.6 - .6 * k + noise1(u * .5, 1) * .02, hz(4.6, 3.4) + 1.15 + .25 * up, 3.4 + .6 * up);
    cam.lookAt(V(-.4, 1.7, -6.4).lerp(V(-12, 8, -40), up * (vert ? .1 : .18)));   /* the sky is already the upper half: the group never sinks into the verse */
    f.dofCfg.focus = cam.position.distanceTo(V(0, 1.4, -6.3));
  });
  return { film, canvas: film.canvas, draw(ctx, u) { film.render(Math.max(0, Math.min(DUR, u))); ctx.drawImage(film.canvas, 0, 0, W, H); } };
}
