// partRise (Mt 1:21 "이름을 예수라 하라") in cinematic-3d (motion-skills, three.js — engine vendored in ../lib3d).
// Round 8 (look review r1–r7, every reviewer: "the opening's 3D town again — floating boxes, nothing new at the peak of
// the film"): the camera no longer looks at Bethlehem from the hills. It walks INTO it — a narrow stone lane at night at
// eye height, lamps in small windows, haze, toward one low doorway at the end where warm light spills out and a man stands
// in it; above that roof, one star, and its light rests on that roof alone. Light is the main character; the figure is small.
// build(W, H) → { canvas, draw(ctx, u) } — u = seconds into the scene (0 … 9.2). Every frame is a function of u only.
import { Film, THREE, V, col, rng, ease, noise1 } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

export function build(W, H) {
  const vert = H > W;
  const film = new Film({
    W, H, dur: 9.2, fov: vert ? 52 : 36, near: .1, far: 900,
    // haze that starts beyond the first metres: every lamp gets its halo, the far end of the lane softens
    atmos: { density: .02, falloff: .11, start: 5, color: col('#1c2642', .5), colorUp: col('#131a30', .3), max: 600, scatter: .5, anisotropy: .78, phaseMix: .92 },
    bloom: { strength: .085, radius: 1.1, tint: col('#ffe2bc') },
    dof: { focus: 14, aperture: 3, maxCoc: 24 },
    look: { exposure: 1.05, contrast: 1.08, saturation: 1.06, lift: col('#05070e'), shadowTint: col('#bccbf0'), highTint: col('#fff0d8'), vignette: .42, grain: .05, ca: .5 },
  });
  film.canvas.style.display = 'none';   // drawn into the film's 2D canvas (render.mjs reads the first canvas)
  const S = film.scene, R = rng(21);
  K.sky(film, { top: col('#04060f', .16), mid: col('#0e1630', .26), horizon: col('#25304e', .34), stars: .9 });
  S.add(new THREE.HemisphereLight(col('#5a6c9c'), col('#120e0a'), .38));
  const moon = new THREE.DirectionalLight(col('#9fb2e0'), 1.1); moon.position.set(-24, 40, 6); S.add(moon);   // the moon from the left: the right-hand walls catch it, the left ones stay in shade

  // the lane: z runs from the camera (+) to the doorway (−11); 3.2 m between the walls, rising gently toward the end
  const rise = z => Math.max(0, -z) * .045;
  const groundM = K.stoneMaterial({ color: '#8f7d63', course: .55, block: .7, grime: .25, roughness: .96 });
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(40, 60, 1, 30), groundM); lane.rotation.x = -Math.PI / 2;
  { const p = lane.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, rise(-p.getY(i)) + (R() - .5) * .02); lane.geometry.computeVertexNormals(); }
  S.add(lane);

  // houses: flat-roofed limestone boxes, set back and forth so the walls are ragged, each sitting into the slope
  const stone = K.stoneMaterial({ color: '#c8b28c', course: .38, block: .8, grime: .45 });
  const stoneDark = K.stoneMaterial({ color: '#a8946f', course: .42, block: .9, grime: .5 });
  const winGlow = (k = 1) => K.glow('#ffad55', 1.6 * k);
  const lamps = [];
  const house = (side, z0, len, h, depth, mat) => {
    const x = side * (1.6 + depth / 2 + (R() - .5) * .35), y0 = rise(-z0 - len / 2) - .6;
    const b = new THREE.Mesh(new THREE.BoxGeometry(depth, h + .6, len), mat); b.position.set(x, y0 + (h + .6) / 2, z0 - len / 2); S.add(b);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(depth + .16, .18, len + .16), stoneDark); lip.position.set(x, y0 + h + .6 + .09, z0 - len / 2); S.add(lip);   // the roof's parapet
    return { x, y0: y0 + .6, z0, len, h, inner: side * 1.6 + side * ((R() - .5) * .35) };
  };
  const window_ = (side, hs, zc, y, w = .45, h = .6, lit = 1) => {
    const bx = hs.x - side * boxHalf(hs);   // the lane-facing face of the house
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lit > 0 ? winGlow(lit) : K.std('#0b0907'));
    m.position.set(bx - side * .01, y, zc); m.rotation.y = -side * Math.PI / 2; S.add(m);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(.12, .07, w + .14), stoneDark); sill.position.set(bx - side * .05, y - h / 2 - .04, zc); S.add(sill);
    if (lit > 0) lamps.push({ L: film.lamp(V(bx - side * .25, y, zc), '#ffbf70', { power: .7 * lit, size: .16, fog: 1.2, light: 3 * lit, distance: 5 }), k: lit, seed: lamps.length + 1 });   // a little real light on the lane below the window
    return m;
  };
  const halves = new Map(); const boxHalf = hs => halves.get(hs);
  const row = (side, spec) => { let z = 9; for (const [len, h, depth, wins] of spec) {
    const hs = house(side, z, len, h, depth, R() < .5 ? stone : stoneDark); halves.set(hs, depth / 2);
    for (const [dz, y, lit] of wins) window_(side, hs, z - dz, hs.y0 + y, .34, .46, lit);
    z -= len + .05; } };
  // [length along the lane, height, depth, windows: [distance from the house's near end, height, lit 0..1]]
  row(-1, [[4.2, 3.4, 5, [[1.4, 1.6, 0]]], [3.6, 4.6, 5.5, [[1.8, 2.9, .8]]], [4.4, 3.2, 5, [[1.1, 1.5, 0], [3.0, 1.6, .55]]], [3.2, 4.2, 5, [[1.6, 2.6, .9]]], [4, 3.4, 6, []]]);
  row(1, [[3.8, 3.8, 5, [[2.0, 2.2, .65]]], [4.6, 3.0, 5.5, [[1.2, 1.5, 0]]], [3.4, 4.4, 5, [[1.7, 2.8, 1]]], [4.2, 3.6, 5, [[1.2, 1.6, 0], [3.0, 1.7, .5]]], [4, 3.6, 6, []]]);
  // what people leave by their doors: clay jars, a stone bench, a dark wooden door (the lane is lived in, not a set)
  const clay = K.std('#8a5a38', { roughness: .9 }), wood = K.std('#2a1c12', { roughness: .9 });
  const jar = (x, z, s = 1) => { const pts = [[0, 0], [.16, .02], [.22, .2], [.2, .42], [.1, .52], [.11, .6], [0, .6]].map(([a, b]) => new THREE.Vector2(a * s, b * s));
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), clay); m.position.set(x, rise(-z), z); S.add(m); };
  jar(-1.35, 6.2); jar(-1.2, 5.75, .8); jar(1.38, 1.4, 1.1); jar(-1.38, -3.6, .9);
  { const b = new THREE.Mesh(new THREE.BoxGeometry(.4, .42, 1.6), stoneDark); b.position.set(1.38, rise(4) + .21, 4); S.add(b); }
  for (const [x, z, ry] of [[-1.59, 2.2, Math.PI / 2], [1.59, -2.4, -Math.PI / 2]]) { const d = new THREE.Mesh(new THREE.BoxGeometry(.9, 1.8, .08), wood); d.position.set(x, rise(-z) + .9, z); d.rotation.y = ry; S.add(d); }
  // steps up at the far end, where the lane meets the low house built against the rock (the stable)
  for (let i = 0; i < 3; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(3.2, .16, .42), stoneDark); st.position.set(0, rise(8.4 + i * .42) + .08 + i * .16, -8.4 - i * .42); S.add(st); }

  // the stable: a low stone house against a dark hill of rock, its doorway open, lamplight inside
  const zS = -11.6, yS = rise(-zS) + .5, doorW = 1.1, doorH = 1.9;
  const hill = new THREE.Mesh(new THREE.IcosahedronGeometry(14, 3), K.std('#2a2620', { roughness: 1 }));
  { const p = hill.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)); v.multiplyScalar(1 + .12 * noise1(v.x * .3 + v.z * .2, 3) + .06 * noise1(v.y * .7, 5)); p.setXYZ(i, v.x, v.y * .55, v.z); } hill.geometry.computeVertexNormals(); }
  hill.position.set(1.5, yS - 5.2, zS - 13); S.add(hill);
  const front = new THREE.Group(); front.position.set(0, yS, zS); S.add(front);
  const fw = 5.4, fh = 2.9, fd = 2.6, side = (fw - doorW) / 2;
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(side, fh, fd), stone); w.position.set(sx * (doorW / 2 + side / 2), fh / 2, -fd / 2); front.add(w); }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW + .5, fh - doorH, fd), stone); lintel.position.set(0, doorH + (fh - doorH) / 2, -fd / 2); front.add(lintel);
  const roofS = new THREE.Mesh(new THREE.BoxGeometry(fw + .3, .22, fd + .3), stoneDark); roofS.position.set(0, fh + .11, -fd / 2); front.add(roofS);
  const back = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, .3), K.std('#3a2a1a', { roughness: 1 })); back.position.set(0, fh / 2, -fd - .1); front.add(back);
  // inside: straw on the floor, the manger's edge, all lit warm from a lamp low on the left
  const straw = new THREE.Mesh(new THREE.BoxGeometry(fw - .4, .12, fd - .3), K.std('#d8a650', { roughness: 1 })); straw.position.set(0, .06, -fd / 2 - .1); front.add(straw);
  const manger = new THREE.Mesh(new THREE.BoxGeometry(1.0, .55, .5), K.std('#5a3e22', { roughness: .9 })); manger.position.set(.35, .3, -fd + .55); front.add(manger);
  const inside = film.lamp(V(-.4, yS + .9, zS - 1.6), '#ffb45c', { power: 1.8, size: .3, light: 45, distance: 10, fog: 2.2 });
  // the doorway's warm light lies on the steps and the lane in front of it
  const spill = new THREE.SpotLight(col('#ffb766'), 26, 14, .62, .9, 2); spill.position.set(0, yS + 1.4, zS - 1.2); spill.target.position.set(0, rise(7) , -6); S.add(spill, spill.target);
  // a man in the doorway (Joseph), small, against the light; he lifts his head toward the star near the end
  const man = K.person({ seed: 5, coat: '#16110d', height: 1.72 }); man.rotation.y = -Math.PI / 2; man.position.set(-.18, yS, zS + .15); S.add(man);

  // the star over that roof and the light that rests on the roof alone (a soft spot from above — no visible beam edge)
  const starPos = vert ? V(-.6, 44, -96) : V(-.6, 25, -96);
  const star = new THREE.Mesh(new THREE.SphereGeometry(.55, 16, 12), K.glow('#fff4de', 60)); star.position.copy(starPos); S.add(star);
  const halo = film.lamp(starPos.clone(), '#fff0d6', { power: 2.2, size: 1.4, fog: 6 });
  const above = film.lamp(V(0, yS + 4.6, zS - 1.4), '#ffe8c2', { power: 1.2, size: 2.2, fog: 3 }), above2 = film.lamp(V(-.2, yS + 10, zS - 3), '#fff0d8', { power: .5, size: 4, fog: 3 });   // the haze glows faintly over the roof, fading upward toward the star
  // the roof itself is above the eye, so the light shows where it can be seen: the house's face and parapet, washed from above
  const roofLight = new THREE.SpotLight(col('#ffe6bc'), 0, 40, .2, 1, 1.2); roofLight.position.set(0, yS + 18, zS + 5); roofLight.target.position.set(0, yS + fh * .7, zS); S.add(roofLight, roofLight.target);

  film.onFrame((u, f) => {
    const k = ease.inOut(Math.min(1, u / 9.2)), cam = f.camera;
    // the walk: from the lane's mouth to a few steps before the door, at eye height, a breath of handheld
    const z = 14 - 9.5 * k, y = rise(-z) + 1.55 - .1 * k;
    cam.position.set(.25 - .35 * k + noise1(u * .5, 1) * .03, y + noise1(u * .7, 2) * .015, z);
    // the gaze rises with the man's toward the roof and the star — only so far that the doorway stays above the verse
    const g = ease.inOut(Math.min(1, Math.max(0, (u - 3.6) / 5)));
    const look = V(0, yS + 1.2, zS).lerp(V(0, yS + (vert ? 3.6 : 2.9), zS - 6), g);
    cam.lookAt(look);
    f.dofCfg.focus = cam.position.distanceTo(V(0, yS + 1.2, zS));
    // light: eyes adjust after the cut (never black — frame-qa), the star comes in, then it rests on the roof
    f.look.exposure = .62 + .43 * ease.out(Math.min(1, u / 1.8));
    const s = ease.inOut(Math.min(1, Math.max(0, (u - .6) / 2.4)));
    star.material.color.copy(col('#fff4de', 60 * s)); halo.power = 2.2 * s;
    const r = ease.inOut(Math.min(1, Math.max(0, (u - 3.2) / 2.6)));
    roofLight.intensity = 260 * r; above.power = 1.2 * r; above2.power = .5 * r;
    for (const l of lamps) l.L.power = .7 * l.k * (.88 + .12 * noise1(u * 2.3, l.seed * 7));
    inside.power = 1.8 * (.9 + .1 * noise1(u * 2.9, 41)); if (inside.light) inside.light.intensity = 45 * (.9 + .1 * noise1(u * 2.9, 41));
    man.userData.body.rotation.z = .07 * g;   // leans back a little, looking up (the person faces +x in its own frame)
  });
  return { film, canvas: film.canvas, draw(ctx, u) { film.render(Math.max(0, Math.min(9.2, u))); ctx.drawImage(film.canvas, 0, 0, W, H); } };
}
