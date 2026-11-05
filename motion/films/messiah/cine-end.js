// partEnd (25 "그 약속은 오늘, 당신을 위한 약속입니다" + the reading card) in cinematic-3d (engine in ../lib3d).
// Round 8b (관리자 2026-11-05: "오일 느낌이랑 3D 맵이 제법 많이 나오네"; look review r1–r8: "the opening's town a third time"):
// the film no longer ends where it began. It comes from the dawn over the empty tomb into today — a small room at first light,
// an open Bible on a table under the window, an oil lamp still burning from the night (the lamps of Bethlehem) while the
// morning comes in through the window and lies across the open pages. The camera draws back from the book and rises toward the
// window; the reading card sits on the dim wall above. No words on the picture: the pages are lines of tone, not letters.
// build(W, H) → { film, canvas, draw(ctx, u) } — u = seconds into the scene (0 … 20.4).
import { Film, THREE, V, col, rng, ease, noise1 } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

export function build(W, H) {
  const vert = H > W, DUR = 20.4;
  const film = new Film({
    W, H, dur: DUR, fov: vert ? 50 : 34, near: .02, far: 400,
    atmos: { density: .022, falloff: .02, start: .6, color: col('#4a3e36', .3), colorUp: col('#3a3442', .25), max: 200, scatter: .6, anisotropy: .85, phaseMix: .92 },
    bloom: { strength: .09, radius: 1.1, tint: col('#ffe6c4') },
    dof: { focus: 1.2, aperture: 5, maxCoc: 26 },
    look: { exposure: .9, contrast: 1.12, saturation: 1.04, lift: col('#0a0806'), shadowTint: col('#c8c4d8'), highTint: col('#fff0d6'), vignette: .4, grain: .045, ca: .4 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, R = rng(31);
  // outside: the morning sky low over the hills, the sun just risen
  const sunDir = V(-.15, .12, -1).normalize();
  K.sky(film, { top: col('#5a6a92', .9), mid: col('#c89a7a', .8), horizon: col('#ffc890', 1.25), sunDir, sunColor: col('#fff0d0', 30), sunGlow: col('#ffbe80', 2) });
  S.add(new THREE.HemisphereLight(col('#8a8aa8'), col('#2a2018'), .35));

  // the room: plaster walls, a beamed ceiling, a wooden floor; the window in the back wall
  const plaster = K.stoneMaterial({ color: '#cbbca4', course: 3, block: 4, grime: .2, roughness: .95 });   // large soft "blocks" read as old plaster
  const wood = K.std('#5a3e26', { roughness: .75 }), woodDark = K.std('#3a2818', { roughness: .8 });
  const wz = -2.4, ww = 1.1, wh = 1.3, wy = 1.25;   // window: centre height wy, back wall at z = wz
  const wall = (w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .2), plaster); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; S.add(m); return m; };
  // back wall with a hole for the window (four pieces)
  wall(4, 3.2 - (wy + wh / 2), 0, (3.2 + wy + wh / 2) / 2, wz);
  wall(4, wy - wh / 2, 0, (wy - wh / 2) / 2, wz);
  wall(2 - ww / 2, wh, -(1 + ww / 4), wy, wz); wall(2 - ww / 2, wh, 1 + ww / 4, wy, wz);
  wall(5, 3.2, -1.8, 1.6, .2, Math.PI / 2);   // left wall
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), K.std('#4a3424', { roughness: .85 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; S.add(floor);
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(4, .16, .14), woodDark); b.position.set(0, 3.1, wz + .5 + i * .9); S.add(b); }
  // the window frame and its mullions (four panes), a deep sill
  const frame = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .16), woodDark); m.position.set(x, y, wz + .02); m.castShadow = true; S.add(m); };
  frame(ww + .1, .06, 0, wy + wh / 2); frame(ww + .1, .06, 0, wy - wh / 2); frame(.06, wh, -ww / 2, wy); frame(.06, wh, ww / 2, wy);
  frame(.04, wh, 0, wy); frame(ww, .04, 0, wy + .1);
  { const sill = new THREE.Mesh(new THREE.BoxGeometry(ww + .3, .06, .34), wood); sill.position.set(0, wy - wh / 2 - .03, wz + .14); S.add(sill); }
  // far hills seen through the window
  { const hill = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 12), K.std('#6a5a5a', { roughness: 1 })); hill.scale.set(2.2, .18, 1); hill.position.set(-20, -4, -140); S.add(hill);
    const hill2 = hill.clone(); hill2.scale.set(2.6, .14, 1); hill2.position.set(60, -4, -180); S.add(hill2); }

  // the table under the window: an open Bible, the oil lamp from the night, a cup
  const ty = .78, tz = -1.6;
  { const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, .06, .8), wood); top.position.set(0, ty, tz); top.castShadow = top.receiveShadow = true; S.add(top);
    for (const [x, z] of [[-.68, -.34], [.68, -.34], [-.68, .34], [.68, .34]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.06, ty, .06), woodDark); l.position.set(x, ty / 2, tz + z); S.add(l); } }
  // the book: two gently curved pages on a dark cover; the page "text" is faint lines of tone (never letters)
  // the page: cream paper with two columns of faint grey lines (the shape of a printed Bible page — no letters)
  const pc = document.createElement('canvas'); pc.width = 340; pc.height = 460; { const g = pc.getContext('2d'), r = rng(7); g.fillStyle = '#f2e7cf'; g.fillRect(0, 0, 340, 460);
    for (const x0 of [28, 178]) for (let y = 36; y < 430; y += 11) { if (r() < .06) continue; const w = 134 * (r() < .12 ? .3 + .5 * r() : 1); g.fillStyle = `rgba(70,60,48,${.32 + .1 * r()})`; g.fillRect(x0, y, w, 4); }
    g.fillStyle = 'rgba(120,40,30,.5)'; g.fillRect(28, 20, 60, 6); }
  const pageTex = new THREE.CanvasTexture(pc); pageTex.colorSpace = THREE.SRGBColorSpace; pageTex.anisotropy = 8;
  const pageMat = new THREE.MeshStandardMaterial({ map: pageTex, roughness: .9, side: THREE.DoubleSide });
  const page = side => { const g = new THREE.PlaneGeometry(.34, .46, 12, 1), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) + .17; p.setX(i, side * x); p.setZ(i, Math.sin(x / .34 * Math.PI) * .03 + x * .09); } g.computeVertexNormals();
    const m = new THREE.Mesh(g, side < 0 ? (() => { const t = pageTex.clone(); t.repeat.x = -1; t.offset.x = 1; t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, roughness: .9, side: THREE.DoubleSide }); })() : pageMat); m.rotation.x = -Math.PI / 2; m.position.set(0, ty + .066, tz + .08); m.receiveShadow = true; S.add(m); };   // above the cover
  page(-1); page(1);
  { const gut = new THREE.Mesh(new THREE.BoxGeometry(.02, .004, .46), K.std('#7a6a52', { roughness: 1 })); gut.position.set(0, ty + .068, tz + .08); S.add(gut);   // the gutter's shadow
    for (const sd of [-1, 1]) { const ed = new THREE.Mesh(new THREE.BoxGeometry(.34, .018, .46), K.std('#e2d6bc', { roughness: 1 })); ed.position.set(sd * .17, ty + .068, tz + .08); ed.scale.y = .01; S.add(ed); } }
  { const cover = new THREE.Mesh(new THREE.BoxGeometry(.72, .03, .49), K.std('#3a1a14', { roughness: .7 })); cover.position.set(0, ty + .045, tz + .08); S.add(cover); }
  // the oil lamp (the same clay lamp as Bethlehem's windows), its flame small and alive
  const clay = K.std('#8a5a38', { roughness: .9 });
  { const pts = [[0, 0], [.07, .005], [.08, .025], [.05, .045], [.02, .05], [0, .05]].map(([a, b]) => new THREE.Vector2(a, b));
    const lampM = new THREE.Mesh(new THREE.LatheGeometry(pts, 16), clay); lampM.scale.set(1, 1, 1.5); lampM.position.set(-.54, ty + .03, tz + .14); lampM.castShadow = true; S.add(lampM); }
  const flame = new THREE.Mesh(new THREE.SphereGeometry(.012, 10, 8), K.glow('#ffcc70', 40)); flame.scale.set(1, 2.2, 1); flame.position.set(-.54, ty + .1, tz + .05); S.add(flame);
  const flameLamp = film.lamp(flame.position.clone(), '#ffb45a', { power: .8, size: .05, light: 1.2, distance: 3, fog: 1.6 });
  { const pts = [[0, 0], [.04, 0], [.045, .08], [.05, .09], [0, .09]].map(([a, b]) => new THREE.Vector2(a, b)); const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 16), clay); cup.position.set(.46, ty + .03, tz - .12); cup.castShadow = true; S.add(cup); }

  // the morning: sun through the window — a warm low key light with shadows of the frame, its glow in the air of the room
  const sun = new THREE.DirectionalLight(col('#ffd8a8'), 0); sun.position.set(.6, wy + 1.2, wz - 4); sun.target.position.set(0, ty, tz + .2);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -2; sun.shadow.camera.right = 2; sun.shadow.camera.top = 2; sun.shadow.camera.bottom = -2; sun.shadow.bias = -.0005;
  S.add(sun, sun.target);
  const glowWin = film.lamp(V(0, wy, wz - .6), '#ffd8a8', { power: 0, size: .6, fog: 2.5 });   // the light hanging in the window
  const glowBeam = film.lamp(V(.1, ty + .45, tz + .1), '#ffe2b8', { power: 0, size: .5, fog: 2 });   // dust lit over the pages

  film.onFrame((u, f) => {
    const k = ease.inOut(Math.min(1, u / DUR)), cam = f.camera;
    // from close over the book and the lamp, drawing back and rising toward the window
    const p0 = V(.22, ty + .46, tz + .95), p1 = V(.35, ty + .62, tz + 2.1);   // close on the open book and the lamp, drawing back into the room as the day comes
    cam.position.copy(p0.lerp(p1, k)).add(V(noise1(u * .4, 1) * .006, noise1(u * .5, 2) * .004, 0));
    const look = V(-.05, ty + .1, tz + .05).lerp(V(0, vert ? wy - .2 : wy - .3, wz), ease.inOut(Math.min(1, Math.max(0, (u - 6) / 11))));   // the book stays in the frame below the window
    cam.lookAt(look); f.dofCfg.focus = cam.position.distanceTo(V(0, ty, tz + .05)) * (1 - .3 * k) + cam.position.distanceTo(V(0, wy, wz)) * .3 * k;
    // the day comes in: the sun from almost nothing to full, the lamp's flame stays (it was lit for the night)
    const d = ease.inOut(Math.min(1, u / 9));
    sun.intensity = 3.6 * d; glowWin.power = .7 * d; glowBeam.power = .35 * d;
    f.look.exposure = .72 + .2 * d;
    const fl = .85 + .15 * noise1(u * 3.1, 7); flameLamp.power = .8 * fl; if (flameLamp.light) flameLamp.light.intensity = 1.2 * fl;
    flame.scale.set(1, 2.2 + .25 * noise1(u * 4.3, 9), 1);
  });
  return { film, canvas: film.canvas, draw(ctx, u) { film.render(Math.max(0, Math.min(DUR, u))); ctx.drawImage(film.canvas, 0, 0, W, H); } };
}
