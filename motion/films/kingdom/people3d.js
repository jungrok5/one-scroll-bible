// people3d.js — 「kingdom」 2부: posable 3D people for the village (heal-village.js) and the rooms (roof-table-3d.js).
// After the owner's note on round 1 (2026-11-19): "캐릭터가 뒤뚱거리며 걷거나 다들 가만히 있거나 한 게 어색해".
//   * Limbs are bones between points: shoulder → elbow → hand and hip → knee → ankle are solved by a two-bone IK with fixed
//     lengths and a bend direction (elbows back/out, knees forward), so a chain never breaks or stretches and a hand that holds
//     something is drawn AT the grip point (BODY-CHECK.md §2.1–2.4).
//   * walk(): a real gait — feet planted in the world while the body passes over them (the stance foot moves backward in the
//     body's frame at exactly the body's speed, so nothing slides), the swing foot lifts and reaches, the long robe's hem swings
//     with the legs, a small vertical bob (≈ 2.3 % of height) at twice the step rate, torso steady and a little forward, arms
//     swinging opposite the legs. No side-to-side rocking of the whole body.
//   * life(): nobody is frozen — breathing (shoulders rise), a slow weight shift, a small head drift — each on its own phase.
// A man faces −z; his root stands on the ground at his feet. Coordinates in metres.
import { THREE, V } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const Y = V(0, 1, 0);

// the elbow/knee of a two-bone chain from S to T (lengths a, b), bending toward `pole`. Returns [E, T'] (T' = T clamped to reach)
export function ik2(S, T, a, b, pole) {
  const d = T.clone().sub(S); let L = d.length(); const mx = (a + b) * .998, mn = Math.abs(a - b) + 1e-3;
  if (L < 1e-5) { d.set(0, -1, 0); L = mn; }
  const dir = d.clone().normalize(); L = clamp(L, mn, mx); const T2 = S.clone().addScaledVector(dir, L);
  const x = (a * a - b * b + L * L) / (2 * L), h = Math.sqrt(Math.max(0, a * a - x * x));
  const p = pole.clone().addScaledVector(dir, -pole.dot(dir)); if (p.lengthSq() < 1e-8) p.set(0, 0, 1).addScaledVector(dir, -dir.z); p.normalize();
  return [S.clone().addScaledVector(dir, x).addScaledVector(p, h), T2];
}
// put a bone mesh (built along +Y, centred) between A and B
const q0 = new THREE.Quaternion(), tv = V();
function boneTo(m, A, B) { tv.copy(B).sub(A); const L = tv.length(); m.position.copy(A).add(B).multiplyScalar(.5); if (L > 1e-6) m.quaternion.copy(q0.setFromUnitVectors(Y, tv.divideScalar(L))); }

// ---------------------------------------------------------------- a robed man (round 3, the rooms): lathe profiles, not cylinders
// Owner 2026-11-19: close up the primitive figures read as bowling pins / chess pieces / dolls. Proportions after a figure
// drawing canon: head ≈ 1/7.5 of the height, shoulders about 2.3 heads wide, a hood that drapes over the shoulders with the
// face set back in its shadow (never a lit featureless face), a mantle falling past the hips, a robe that widens to the hem with
// folds; seated men bend at hip and knee (thighs forward under the robe, the cloth falling from the knees). Same U structure
// as man(), so pose()/walk()/idle() drive it unchanged.
const lathe = (pts, seg = 28, phi0 = 0, phiL = Math.PI * 2, folds = 0, foldK = 0) => {
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, phi0, phiL);
  if (folds) { const p = g.attributes.position, y0 = pts[0][1], y1 = pts[pts.length - 1][1];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i), a = Math.atan2(z, x), k = foldK * Math.pow(clamp((y1 - y) / (y1 - y0)), 1.4);
      const f = 1 + k * (Math.sin(a * folds) * .6 + Math.sin(a * folds * 1.7 + 1.3) * .4); p.setX(i, x * f); p.setZ(i, z * f); } }
  g.computeVertexNormals(); return g; };
// head: 'hood' | 'cloth' (a headcloth: cap, cord, cloth falling at the sides and back) | 'veil' (a woman: one long veil over head,
// shoulders and back, no mantle); child: a bigger head for the height, no mantle fold
export function robeMan({ h = 1.74, broad = 1, mat, skin, kind = 'stand', cloth, face, head: headKind = 'hood', child = false } = {}) {
  const s = h / 1.75, b = broad, m = mat, cm = cloth || m, fm = face || skin || m;
  const g = new THREE.Group(), lower = new THREE.Group(), upper = new THREE.Group(); g.add(lower, upper);
  const U = { s, kind, upper, lower, hipY: .9 * s, arms: [], legs: [], ph: 0, robe: true };
  const mesh = (geo, mt, parent) => { const o = new THREE.Mesh(geo, mt); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  U.la = .3 * s; U.lb = .27 * s; U.lt = .45 * s; U.ls = .44 * s; U.ank = .075 * s;
  if (kind === 'stand') {   // the robe's skirt: widening to the hem, folds deepening toward it (deformed by the legs in pose())
    const sg = lathe([[.3 * b, .03], [.295 * b, .1], [.27 * b, .35], [.235 * b, .65], [.2 * b, .9], [.19 * b, .99]].map(([r, y]) => [r * s, y * s]), 30, 0, Math.PI * 2, 9, .07);
    U.skirt = mesh(sg, m, g); U.skirtBase = sg.attributes.position.array.slice();
    for (let i = 0; i < 2; i++) { const sd = i ? 1 : -1, thigh = mesh(new THREE.CapsuleGeometry(.07 * s, U.lt - .14 * s, 3, 8), m, g), shin = mesh(new THREE.CapsuleGeometry(.05 * s, U.ls - .1 * s, 3, 8), m, g);
      const foot = mesh(K.roundedBox(.09 * s, .06 * s, .24 * s, .025 * s, 2), m, g); U.legs.push({ sd, thigh, shin, foot }); }
  } else {   // seated on the floor: hips and thighs forward under the robe, knees up a little, the cloth falling from the knees
    U.hipY = .16 * s;
    const seat = mesh(new THREE.SphereGeometry(.2 * s * b, 18, 12), m, lower); seat.scale.set(1.15, .7, 1.05); seat.position.set(0, .14 * s, .02 * s);
    const lap = mesh(new THREE.CapsuleGeometry(.13 * s, .32 * s, 4, 12), m, lower); lap.rotation.x = Math.PI / 2 - .18; lap.scale.set(1.55 * b, 1, 1); lap.position.set(0, .2 * s, -.24 * s);
    const fall = lathe([[.3, .0], [.27, .12], [.2, .26]].map(([r, y]) => [r * s * b, y * s]), 20, Math.PI * .6, Math.PI * .8, 6, .06); const fl = mesh(fall, m, lower); fl.position.set(0, 0, -.38 * s); fl.scale.set(1, 1, .6);
  }
  upper.position.y = U.hipY;
  // torso: waist → chest → the shoulders' slope → the neck (shoulders ≈ 2.3 head-widths)
  const torsoH = .52 * s; U.torsoH = torsoH;
  mesh(lathe([[.19 * b, 0], [.215 * b, .2], [.235 * b, .4], [.225 * b, .47], [.15 * b, .52], [.07, .55]].map(([r, y]) => [r * s, y * s]), 24), m, upper).scale.z = .8;
  // the mantle over the shoulders, falling past the hips (folds below); breath lifts it a little (pivot at the shoulder line)
  U.shoulders = new THREE.Group(); U.shoulders.position.y = torsoH; upper.add(U.shoulders);
  const mh = kind === 'stand' ? .5 : .28, veil = headKind === 'veil';
  const mant = veil ? null : mesh(lathe([[.285 * b, -mh], [.28 * b, -mh * .6], [.27 * b, -.2], [.262 * b, -.06], [.2 * b, .0], [.12, .04]].map(([r, y]) => [r * s, y * s]), 30, 0, Math.PI * 2, 7, .06), cm, U.shoulders);
  if (mant) mant.scale.z = .85;
  // a fold of the mantle thrown over the left shoulder and across the chest (breaks the column), a sash at the waist
  if (!veil && !child) { const fold = mesh(new THREE.TorusGeometry(.22 * s * b, .035 * s, 6, 20, Math.PI * 1.1), cm, upper); fold.position.set(0, torsoH * .62, -.02 * s); fold.rotation.set(-.15, 0, .95); fold.scale.set(1, 1.25, .62); }
  const sash = mesh(new THREE.TorusGeometry(.205 * s * b, .022 * s, 5, 24), m, upper); sash.rotation.x = Math.PI / 2; sash.position.y = .02 * s; sash.scale.y = .8;
  // the head inside a hood: the hood's opening faces forward, the face set back and dark (no lit face anywhere)
  const neck = new THREE.Group(); neck.position.y = torsoH + .06 * s; neck.rotation.order = 'YXZ'; upper.add(neck); U.neck = neck;
  const hr = (child ? .13 : veil ? .105 : .112) * s, head = mesh(new THREE.SphereGeometry(hr, 16, 12), fm, neck); head.position.set(0, .12 * s, .03 * s); head.scale.set(.86, 1.05, .95);
  const hk = hr / (.112 * s);
  if (headKind === 'hood') { const hood = lathe([[.2, -.03], [.17, .05], [.15, .14], [.145, .2], [.12, .26], [.07, .3], [.0, .315]].map(([r, y]) => [r * s * hk, y * s * hk]), 26, Math.PI + .85, Math.PI * 2 - 1.7);   // opening toward −z (phi = π)
    mesh(hood, cm, neck); }
  else if (headKind === 'cloth') {   // headcloth: a cap on the crown, a cord round it, the cloth falling to the shoulders at the sides and back
    mesh(lathe([[.128, .14], [.13, .2], [.11, .26], [.06, .29], [0, .3]].map(([r, y]) => [r * s * hk, y * s * hk]), 22), cm, neck);
    const cord = mesh(new THREE.TorusGeometry(.125 * s * hk, .012 * s, 5, 22), m, neck); cord.rotation.x = Math.PI / 2; cord.position.y = .2 * s * hk;
    mesh(lathe([[.21, -.06], [.17, .04], [.14, .14], [.132, .2]].map(([r, y]) => [r * s * hk, y * s * hk]), 22, Math.PI + 1.0, Math.PI * 2 - 2.0, 5, .05), cm, neck); }
  else {   // veil: from the crown over the shoulders and down the back to the waist, open only round the face
    mesh(lathe([[.3, -.62], [.28, -.35], [.24, -.12], [.19, .02], [.15, .12], [.135, .2], [.1, .27], [.05, .3], [0, .31]].map(([r, y]) => [r * s * b, y * s]), 28, Math.PI + .6, Math.PI * 2 - 1.2, 8, .06), cm, neck); }
  for (const sd of [-1, 1]) {   // sleeves: narrow at the shoulder, wide at the wrist; a small dark hand
    const up = mesh(new THREE.CylinderGeometry(.062 * s, .068 * s, U.la, 10), m, upper), fo = mesh(new THREE.CylinderGeometry(.085 * s, .06 * s, U.lb, 10, 1, true), m, upper);
    const hand = mesh(new THREE.CapsuleGeometry(.026 * s, .05 * s, 3, 6), fm, upper); hand.scale.set(1.25, 1, .7);   // a hand, longer than wide
    U.arms.push({ sd, up, fo, hand, S: V(sd * .235 * s * b, torsoH - .04 * s, 0) }); }
  g.userData = U; return g;
}

// ---------------------------------------------------------------- a man
// kind: 'stand' | 'sit' (cross-legged on the ground) | 'kneel' (on his knees, sitting back or leaning forward)
export function man({ h = 1.74, broad = 1, mat, skin, kind = 'stand', hood = false, child = false, cloth } = {}) {
  const s = h / 1.75, b = broad, m = mat, sk = hood ? m : skin, cm = cloth || m;
  const g = new THREE.Group(), lower = new THREE.Group(), upper = new THREE.Group(); g.add(lower, upper);
  const U = { s, kind, upper, lower, hipY: .9 * s, sh: [], hands: [], arms: [], legs: [], feet: [], ph: 0 };
  const mesh = (geo, mt, parent) => { const o = new THREE.Mesh(geo, mt); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  // the arms: upper .29, fore .27 (× s); the legs: thigh .45, shin .44, ankle .07 above the ground
  U.la = .29 * s; U.lb = .27 * s; U.lt = .45 * s; U.ls = .44 * s; U.ank = .075 * s;
  if (kind === 'stand') {
    // the skirt of the robe (waist → hem), deformed every frame by the legs; open cylinder with a turned-in hem
    const sg = new THREE.CylinderGeometry(.2 * s * b, .31 * s * b, .9 * s, 18, 8, true); sg.translate(0, .09 * s + .45 * s, 0);
    U.skirt = mesh(sg, m, g); U.skirtBase = sg.attributes.position.array.slice(); U.skirt.material = m;
    for (let i = 0; i < 2; i++) {   // legs: shin + foot visible under the hem (thigh hidden inside)
      const sd = i ? 1 : -1, thigh = mesh(new THREE.CapsuleGeometry(.075 * s, U.lt - .15 * s, 3, 8), m, g), shin = mesh(new THREE.CapsuleGeometry(.055 * s, U.ls - .11 * s, 3, 8), sk === m ? m : m, g);
      const foot = mesh(K.roundedBox(.1 * s, .07 * s, .25 * s, .03 * s, 2), hood ? m : (cloth || skin || m), g);   // bare foot / sandal
      U.legs.push({ sd, thigh, shin, foot, u: 0, lift: 0 }); }
  } else if (kind === 'sit') {
    const lap = mesh(new THREE.CylinderGeometry(.34 * s * b, .4 * s * b, .3 * s, 16), m, lower); lap.position.y = .15 * s; lap.scale.z = .85;
    const knees = mesh(new THREE.CapsuleGeometry(.12 * s, .42 * s, 4, 10), m, lower); knees.rotation.z = Math.PI / 2; knees.position.set(0, .26 * s, -.16 * s);
    U.hipY = .2 * s;
  } else {   // kneel: knees on the ground, shins back, thighs up to the hips
    for (const sd of [-1, 1]) { const th = mesh(new THREE.CapsuleGeometry(.085 * s, .34 * s, 3, 8), m, lower); th.position.set(sd * .1 * s, .26 * s, -.08 * s); th.rotation.x = .5;
      const sn = mesh(new THREE.CapsuleGeometry(.065 * s, .36 * s, 3, 8), m, lower); sn.rotation.x = Math.PI / 2; sn.position.set(sd * .1 * s, .07 * s, .12 * s); }
    U.hipY = .5 * s;
  }
  // the upper body (pivot at the hips): torso and mantle, shoulders, neck → head in its cloth; arms solved in this frame
  upper.position.y = U.hipY;
  const torsoH = .52 * s;
  const torso = mesh(new THREE.CylinderGeometry(.21 * s * b, .23 * s * b, torsoH, 14), m, upper); torso.position.y = torsoH / 2;
  // the mantle: from the shoulders down past the hips when standing (one long fall of cloth — no ledge at the waist)
  const mh = kind === 'stand' ? .95 * s : torsoH * .95, mantle = mesh(new THREE.CylinderGeometry(.25 * s * b, (kind === 'stand' ? .33 : .3) * s * b, mh, 16, 1, true, -2.6, 5.2), m, upper); mantle.position.y = torsoH - mh / 2 + .02 * s;
  const shoulders = mesh(new THREE.CapsuleGeometry(.17 * s, .2 * s, 4, 10), m, upper); shoulders.scale.set(1.35 * b, 1, .82); shoulders.position.y = torsoH;
  U.shoulders = shoulders; U.torsoH = torsoH;
  const neck = new THREE.Group(); neck.position.y = torsoH + .12 * s; neck.rotation.order = 'YXZ'; upper.add(neck); U.neck = neck;
  const hr = (child ? .12 : .105) * s;
  mesh(new THREE.SphereGeometry(hr, 16, 12), sk || m, neck).position.y = .14 * s;
  const capG = new THREE.SphereGeometry(hr * 1.24, 16, 8, 0, Math.PI * 2, 0, Math.PI * .58); mesh(capG, cm, neck).position.y = .16 * s;
  if (!child) { const drape = mesh(new THREE.CylinderGeometry(hr * 1.22, .2 * s, .3 * s, 16, 1, true, -2.25, 4.5), cm, neck); drape.position.set(0, -.04 * s, .015 * s); }   // the cloth falls behind to the shoulders (no hair)
  else { mesh(new THREE.SphereGeometry(hr * 1.02, 14, 8, 0, Math.PI * 2, 0, Math.PI * .45), K.std('#1a120c', { roughness: 1 }), neck).position.y = .15 * s; }   // a child: short dark hair
  for (const sd of [-1, 1]) {
    const up = mesh(new THREE.CapsuleGeometry(.058 * s, U.la - .1 * s, 3, 8), m, upper), fo = mesh(new THREE.CapsuleGeometry(.05 * s, U.lb - .09 * s, 3, 8), m, upper);
    const hand = mesh(new THREE.SphereGeometry(.048 * s, 10, 8), sk || m, upper); hand.scale.set(.85, 1.15, .7);
    U.arms.push({ sd, up, fo, hand, S: V(sd * .2 * s * b, torsoH - .02 * s, 0) }); }
  g.userData = U; return g;
}

// ---------------------------------------------------------------- posing
// P: { bob, lean (torso pitch, − = forward), twist (torso yaw), side (torso roll), breath (0..1), head: [pitch, yaw],
//      feet: [{u, lift, x?}, {…}] (stand; u = metres forward of the hips, lift = metres above the ground),
//      hands: [target|null, target|null] in the ROOT frame (world-style metres, before the root's own transform),
//      swing: [a, a] (arm swing, rad, + = forward) used when a hand has no target, abd: [a, a] (arm out to the side) }
const tmpM = new THREE.Matrix4(), inv = new THREE.Matrix4();
export function pose(g, P = {}) {
  const U = g.userData, s = U.s, up = U.upper;
  const bob = P.bob || 0, br = P.breath || 0;
  up.position.y = U.hipY + bob; up.rotation.set(P.lean || 0, P.twist || 0, P.side || 0, 'YXZ');
  U.shoulders.scale.y = 1 + .05 * br; U.shoulders.position.y = U.torsoH + .012 * s * br;
  U.neck.rotation.x = (P.head && P.head[0]) || 0; U.neck.rotation.y = (P.head && P.head[1]) || 0;
  // legs + the skirt (standing)
  if (U.kind === 'stand') {
    const F = P.feet || [{ u: .06 * s, lift: 0 }, { u: -.04 * s, lift: 0 }];
    U.legs.forEach((L, i) => { const f = F[i], hip = V(L.sd * .095 * s, U.hipY + bob - .04 * s, .02 * s);
      const ank = V(L.sd * .1 * s + (f.x || 0), U.ank + (f.lift || 0), -f.u);
      const [E, A] = ik2(hip, ank, U.lt, U.ls, V(0, 0, -1));   // knee forward
      boneTo(L.thigh, hip, E); boneTo(L.shin, E, A);
      L.foot.position.set(A.x, Math.max(.035 * s, A.y - .04 * s), A.z - .06 * s); L.foot.rotation.x = (f.pitch || 0); L.u = f.u; });
    // the hem follows the legs: forward of the body it reaches with the front leg, behind with the back leg; a little lift
    const pos = U.skirt.geometry.attributes.position, B0 = U.skirtBase, top = .99 * s, uf = Math.max(F[0].u, F[1].u, 0), ub = Math.min(F[0].u, F[1].u, 0);
    for (let i = 0; i < pos.count; i++) { const x = B0[i * 3], y = B0[i * 3 + 1], z = B0[i * 3 + 2], k = Math.pow(clamp((top - y) / (top - .09 * s)), 1.25);
      const front = clamp(-z / (.25 * s), -1, 1), wl = clamp(.5 - x / (.36 * s)), lu = wl * F[0].u + (1 - wl) * F[1].u;
      const reach = (front > 0 ? uf * front : -ub * front) * .55 + lu * .35;
      const lift = Math.max(F[0].lift || 0, F[1].lift || 0) * k * .25;
      pos.setXYZ(i, x * (1 + .1 * k * Math.abs(uf - ub) / (.5 * s)), y + bob * (1 - k) + lift * (front > 0 ? 1 : .3), z - reach * k + (P.lean || 0) * -.2 * (1 - k) * s); }
    pos.needsUpdate = true; U.skirt.geometry.computeVertexNormals();
  }
  // arms: a target per hand (IK, elbow back and out), or a hanging arm swung by `swing`
  up.updateMatrix(); inv.copy(up.matrix).invert();
  U.arms.forEach((A, i) => { const S = A.S.clone(); let T;
    const tg = P.hands && P.hands[i];
    if (tg) T = tg.clone().applyMatrix4(inv);
    else { const sw = (P.swing && P.swing[i]) || 0, ab = ((P.abd && P.abd[i]) || 0) + .1, r = (U.la + U.lb) * .96;
      T = S.clone().add(V(A.sd * Math.sin(ab) * r, -Math.cos(sw) * Math.cos(ab) * r, -Math.sin(sw) * r * .95)); }
    const [E, T2] = ik2(S, T, U.la, U.lb, V(A.sd * .45, -.25, 1));
    boneTo(A.up, S, E); boneTo(A.fo, E, T2); A.hand.position.copy(T2); A.T = T2; });
}
// where a hand is now (root frame) — for objects held in it
export function handAt(g, i) { const U = g.userData; return U.arms[i].T.clone().applyMatrix4(U.upper.matrix); }

// ---------------------------------------------------------------- gait
// The body moves at exactly L per half stride (one step), so the stance foot, which moves backward at that speed in the body's
// frame, stays put on the ground. T = stride time (two steps). Returns the pose parts and `dist` (metres walked since t0).
export function walk(g, t, t0, { T = 1.1, L = .52, amt = 1 } = {}) {
  const U = g.userData, s = U.s, e = Math.max(0, t - t0), ph = (e / T) % 1, L2 = L * amt;
  const foot = p => { p = (p % 1 + 1) % 1;
    if (p < .5) return { u: L2 / 2 - L2 * (p / .5), lift: 0, pitch: 0 };                       // stance: planted
    const k = (p - .5) / .5, kk = k * k * (3 - 2 * k);                                           // swing: lift and reach
    return { u: -L2 / 2 + L2 * kk, lift: Math.sin(k * Math.PI) * .07 * s * amt, pitch: Math.sin(k * Math.PI) * -.25 * amt }; };
  const F = [foot(ph), foot(ph + .5)];
  const bob = .04 * s * amt * (1 - Math.cos(ph * 4 * Math.PI)) / 2 - .02 * s * amt;
  const sw = .32 * amt * Math.sin(ph * 2 * Math.PI);   // the left arm swings with the right leg
  return { feet: F, bob, lean: -.06 * amt, swing: [sw, -sw], dist: e / (T / 2) * L2, ph };
}
// standing still with a little life: feet a short stride apart, weight shifting, breathing (phase `ph` 0..1 per person)
export function idle(t, ph = 0, o = {}) {
  const s = o.s || 1, w = Math.sin(t * .35 + ph * 6.283);
  return { feet: [{ u: .09 * s + .02 * w, lift: 0 }, { u: -.07 * s, lift: 0 }], bob: -.006 * Math.abs(w), side: .012 * w, twist: .03 * Math.sin(t * .21 + ph * 9),
    breath: .5 + .5 * Math.sin(t * 1.45 + ph * 6.283), swing: [.04 * Math.sin(t * .5 + ph * 7), .04 * Math.sin(t * .43 + ph * 3)], head: [0, .05 * Math.sin(t * .27 + ph * 11)] };
}
export const breath = (t, ph) => .5 + .5 * Math.sin(t * 1.45 + ph * 6.283);
