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
  // arms: a target per hand (IK), or a hanging arm swung by `swing`.
  // 2026-11-19 (「kingdom」 3부 r3, owner: "팔꿈치가 비정상적으로 위로 꺾인 채로" — rule body-motion; BODY-CHECK §2.2):
  //   * the elbow's pole is BELOW and a little behind and outside the shoulder (was mostly behind: V(sd·.45, −.25, 1)). With a
  //     hand reaching forward at chest height the old pole projected sideways and the elbow cocked up and out (chicken wing);
  //     now the elbow hangs down and slightly out and the forearm comes up to the hand from below, whatever the reach.
  //   * the shoulder settles when a hand reaches forward and down (it moves ≤ 4.5 cm toward the hand and drops ≤ 1.5 cm — a body
  //     reaches with the shoulder, not by hiking it); the upper arm and forearm keep their lengths (two-bone IK, fixed la/lb).
  //   * P.handsW: [w, w] (optional) blends each hand between its free hanging/swinging place (0) and its target (1), so a pose can
  //     ease from arms-down to holding without a snap. Without handsW a given target is used fully (as before).
  up.updateMatrix(); inv.copy(up.matrix).invert();
  U.arms.forEach((A, i) => { let S = A.S.clone(), T;
    const sw = (P.swing && P.swing[i]) || 0, ab = ((P.abd && P.abd[i]) || 0) + .1, r = (U.la + U.lb) * .96;
    const free = S.clone().add(V(A.sd * Math.sin(ab) * r, -Math.cos(sw) * Math.cos(ab) * r, -Math.sin(sw) * r * .95));
    const tg = P.hands && P.hands[i], w = tg ? (P.handsW ? clamp(P.handsW[i] ?? 1) : 1) : 0;
    // the blend free → target swings round the shoulder (direction slerped, distance lerped), so a hand rising from the side to
    // overhead travels on an arc instead of a straight line through the shoulder (which folded the elbow shut and flipped the arm)
    if (w > 0 && w < 1) { const d0 = free.clone().sub(S), d1 = tg.clone().applyMatrix4(inv).sub(S), l0 = d0.length(), l1 = d1.length();
      const qa = new THREE.Quaternion().setFromUnitVectors(d0.clone().normalize(), d1.clone().normalize()), q = new THREE.Quaternion().slerp(qa, w);
      T = S.clone().addScaledVector(d0.normalize().applyQuaternion(q), lerp(l0, l1, w)); }
    else T = w > 0 ? tg.clone().applyMatrix4(inv) : free;
    if (w > 0) { const d = T.clone().sub(S), q = d.length() / (U.la + U.lb); d.normalize();
      const k = ss(.6, 1.02, q) * clamp(-d.z * 1.4) * (1 - ss(.05, .4, d.y)) * w;   // reaching forward (and not up) — all factors smooth
      S = S.addScaledVector(d, .045 * s * k); S.y -= .015 * s * k; }
    // soft reach: past 93 % of the arm's length the hand approaches full reach asymptotically, so the elbow never snaps
    // straight in a frame or two (the IK's singularity at full stretch — r3 measured a 0.28 rad/frame elbow flick on a pointing arm)
    { const L0 = U.la + U.lb, d = T.clone().sub(S), L = d.length(), a = .93 * L0, m = .995 * L0 - a;
      if (L > a) T = S.clone().addScaledVector(d, (a + m * (1 - Math.exp(-(L - a) / m))) / L); }
    const [E, T2] = ik2(S, T, U.la, U.lb, elbowPole(S, T, A.sd));
    boneTo(A.up, S, E); boneTo(A.fo, E, T2); A.hand.position.copy(T2); A.T = T2; A.E = E; A.S2 = S; });
}
// ---------------------------------------------------------------- the elbow's pole, with an anti-inversion check (round 8, 2026-11-20)
// 「kingdom」 6부 body check (owner: "팔 한쪽도 반대로 꺾이고"): the fixed pole V(sd·.35, −1, .45) (down, a little out and back) is right
// for every hand in front of or beside the body, but when a hand goes BEHIND the body or across the back (a target swinging round
// as a figure turns, hands clasped behind the back) its component across the reach flips: the elbow pointed forward into the chest
// or inward through the torso. elbowPole() keeps the old pole wherever it is sound — same result, other films unchanged — and only
// where the elbow it gives would point against the anatomical reference does it turn the pole round the shoulder→hand axis toward
// that reference, smoothly (no snap):
//   reference = out (sd·x) + down + back, with "out" growing and "back"/"down" shrinking as the hand goes behind (z > 0): a hand
//   reaching behind the back has its elbow out and back, a hand in front has it down and out;
//   sanity clamp: when the old pole is nearly parallel to the reach (|perp| < .2) the reference takes over (no arbitrary side);
//   anti-inversion: w = ss(.5, −.3, cos(old elbow, reference elbow)) — 0 while they agree within ~60°, 1 when opposed.
const _ax = V(), _p0 = V(), _pr = V(), _cr = V();
export function elbowPole(S, T, sd) {
  _ax.copy(T).sub(S); const L = _ax.length(); if (L < 1e-6) return V(sd * .35, -1, .45); _ax.divideScalar(L);
  const back = Math.max(0, _ax.z), pole0 = V(sd * .35, -1, .45);
  const ref = V(sd * (.35 + 1.2 * back), -(1 - .9 * back), .45 * (1 - back));
  _p0.copy(pole0).addScaledVector(_ax, -pole0.dot(_ax)); _pr.copy(ref).addScaledVector(_ax, -ref.dot(_ax));
  const l0 = _p0.length(), lr = _pr.length(); if (lr < 1e-6) return pole0;
  _pr.divideScalar(lr); if (l0 < 1e-6) return _pr.clone();
  _p0.divideScalar(l0);
  const c = clamp(_p0.dot(_pr), -1, 1), w = Math.max(ss(.5, -.3, c), 1 - ss(.08, .2, l0));
  if (w <= 0) return pole0;
  const ang = Math.atan2(_cr.copy(_p0).cross(_pr).dot(_ax), c);   // signed angle old → reference round the reach axis
  return _p0.clone().applyAxisAngle(_ax, ang * w);
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

// ================================================================ additions for part 3 (2026-11-19, sample-part3a: 「사람들이 기다린 나라」)
// Additive only — nothing above changes. soldier(): a Roman legionary for the spear column (crowd-evening3d.js): man()'s body with a
// short tunic instead of the long robe, a plain iron helmet with a neck guard, a curved shield on the left arm and a spear on the
// right shoulder, both HELD (the hands are solved onto the grips every frame by soldierPose — BODY-CHECK §4 contact).
export function soldier({ h = 1.74, mat, skin, metal, shieldM, wood, tip } = {}) {
  const g = man({ h, mat, skin, kind: 'stand', cloth: metal }), U = g.userData, s = U.s;
  // the tunic to the knee (replaces the robe's skirt geometry; pose() deforms it the same way)
  const tg = new THREE.CylinderGeometry(.205 * s, .27 * s, .44 * s, 18, 6, true); tg.translate(0, .55 * s + .22 * s, 0);
  U.skirt.geometry.dispose(); U.skirt.geometry = tg; U.skirtBase = tg.attributes.position.array.slice();
  // the helmet: man()'s cap in iron; its back cloth becomes a short neck guard
  const [, cap, drape] = U.neck.children; if (cap) cap.scale.set(1.04, 1.08, 1.06); if (drape) { drape.scale.set(1.02, .32, 1.02); drape.position.y += .1 * s; }
  const mk = (geo, m, parent) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const rim = mk(new THREE.TorusGeometry(.128 * s, .012 * s, 5, 20), metal, U.neck); rim.rotation.x = Math.PI / 2; rim.position.y = .15 * s;
  // the shield (scutum): a curved board, its boss outward, on the left forearm in front of the body
  const sh = new THREE.Group(); U.upper.add(sh); sh.position.set(-.3 * s, .12 * s, -.2 * s); sh.rotation.y = .5;
  const board = mk(new THREE.CylinderGeometry(.62 * s, .62 * s, 1.0 * s, 14, 1, true, Math.PI - .42, .84), shieldM, sh); board.position.z = .58 * s;
  mk(new THREE.SphereGeometry(.07 * s, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), metal, sh).rotation.x = -Math.PI / 2;
  U.shieldGrip = V(-.3 * s + .05 * s, .12 * s, -.2 * s + .1 * s);   // the hand-hold behind the boss (upper frame)
  // the spear (pilum): an ash shaft, an iron shank, a small bright point; upright, a little forward, on the right side
  const sp = new THREE.Group(); U.upper.add(sp); sp.position.set(.3 * s, -.25 * s, -.16 * s); sp.rotation.x = -.12;
  mk(new THREE.CylinderGeometry(.016 * s, .02 * s, 1.75 * s, 6), wood, sp).position.y = .7 * s;
  mk(new THREE.CylinderGeometry(.007 * s, .012 * s, .5 * s, 5), metal, sp).position.y = 1.82 * s;
  const pt = mk(new THREE.ConeGeometry(.02 * s, .1 * s, 4), tip || metal, sp); pt.position.y = 2.12 * s;
  U.spear = sp; U.spearTip = pt;
  U.spearGrip = V(.3 * s, -.25 * s + .62 * s * Math.cos(.12), -.16 * s - .62 * s * Math.sin(.12));   // where the right hand closes on the shaft
  return g;
}
// pose a soldier from P (walk()/idle() parts): both hands placed on their grips through the upper body's own transform
const _M = new THREE.Matrix4(), _E = new THREE.Euler(), _Q = new THREE.Quaternion();
export function soldierPose(g, P = {}) {
  const U = g.userData;
  _E.set(P.lean || 0, P.twist || 0, P.side || 0, 'YXZ'); _Q.setFromEuler(_E); _M.compose(V(0, U.hipY + (P.bob || 0), 0), _Q, V(1, 1, 1));
  const gS = U.shieldGrip.clone().applyMatrix4(_M), gP = U.spearGrip.clone().applyMatrix4(_M);
  pose(g, { ...P, hands: [gS, gP] });
}
// from kneeling/sitting back on the heels (k = 0) to standing (k = 1) with a robeMan/man 'stand' figure: the hips drop and the legs
// fold under the robe (IK keeps the bone lengths), the torso leans forward through the middle of the rise as a body does.
export function kneelRise(k, s = 1, ph = 0) {
  const e = k * k * (3 - 2 * k), mid = Math.sin(Math.PI * clamp(k));
  return { bob: lerp(-.44 * s, 0, e), lean: -.42 * mid + lerp(.02, -.02, e), feet: [{ u: lerp(.3 * s, .08 * s, e), lift: 0 }, { u: lerp(-.26 * s, -.06 * s, e), lift: 0, x: lerp(-.04 * s, 0, e) }] };
}

// ================================================================ additions for part 6 (2026-11-19, sample-part6a round 2: 「땅 끝까지」)
// Additive only — nothing above changes. The eleven on the Mount must not read as a choir (owner on part 2: "성가대처럼",
// "다들 가만히 있거나"): mixed headwear on the same robeMan body, men sitting on rocks, a staff held in the hand.
// headwear(g, kind, {mat, dark}): re-dress a robeMan built with head:'cloth' — 'cloth' (as built), 'turban' (cloth wound round
// the head in turns, a short tail at the back), 'bare' (short dark hair, a beard). Every adult man keeps a beard line (the
// silhouette reads as a man: 관리자 2026-11-14). The face stays set back and dark at this size.
export function headwear(g, kind = 'cloth', { mat, dark } = {}) {
  const U = g.userData, s = U.s, n = U.neck, hk = 1, mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = o.receiveShadow = true; n.add(o); return o; };
  const hair = dark || K.std('#1c140e', { roughness: 1 });
  if (kind === 'turban' || kind === 'bare') { while (n.children.length > 1) n.remove(n.children[n.children.length - 1]); }
  if (kind === 'turban') {
    const m = mat || U.skirt?.material;
    for (const [y, r, tilt] of [[.15, .138, .12], [.19, .142, -.1], [.228, .132, .07]]) { const t = mk(new THREE.TorusGeometry(r * s, .048 * s, 7, 24), m); t.rotation.set(Math.PI / 2 + tilt, 0, tilt * .6); t.position.set(0, y * s, .025 * s); t.scale.set(1, 1.08, 1); }
    const dome = mk(new THREE.SphereGeometry(.135 * s, 16, 8, 0, Math.PI * 2, 0, Math.PI * .5), m); dome.position.set(0, .2 * s, .025 * s); dome.scale.set(1, .62, 1.06);
    const tail = mk(lathe([[.1, -.1], [.09, 0], [.07, .1]].map(([r, y]) => [r * s, y * s]), 10, -.7, 1.4, 3, .05), m); tail.position.set(0, .15 * s, .07 * s);
  }
  if (kind === 'bare') { const cap = mk(new THREE.SphereGeometry(.118 * s, 14, 10, 0, Math.PI * 2, 0, Math.PI * .56), hair); cap.position.set(0, .135 * s, .04 * s); cap.scale.set(.9, 1, 1); }
  // the beard: a soft wedge under the jaw, forward (−z)
  const b = mk(new THREE.SphereGeometry(.07 * s, 10, 8), hair); b.position.set(0, .05 * s, -.045 * s); b.scale.set(.95, 1.15, .8);
  return g;
}
// sitting on a rock (a 'stand' robeMan): hips down onto the seat, thighs forward, shins down, feet planted a little apart, one
// tucked back; the robe falls from the knees. seat = height of the rock's top (m). Hands rest on the knees unless P.hands says.
export function rockSit(seat = .44, s = 1, { tuck = .08, lean = -.1 } = {}) {
  const hip = seat + .05, bob = hip - .86 * s;
  return { bob, lean, feet: [{ u: .4 * s, lift: 0, x: -.02 * s }, { u: (.4 - tuck * 2) * s, lift: 0, x: .03 * s }] };
}
export const kneeHand = (g, sd, P) => { const U = g.userData, s = U.s; return V(sd * .11 * s, U.hipY + (P.bob || 0) + .06 * s, -.34 * s); };
// a rock to sit on (or a stone in the grass): a squashed, lumpy icosahedron; its top is at height `top`
export function rock(mat, { w = .7, d = .55, top = .44, seed = 1 } = {}) {
  const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + .12 * Math.sin(x * 5.1 + seed) * Math.cos(z * 4.3 + seed * 1.7) + .06 * Math.sin(y * 9 + seed * 3);
    p.setXYZ(i, x * n, (y > 0 ? y * .85 : y) * n, z * n); }
  g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.scale.set(w / 2, top / .85 / 1.0, d / 2); m.position.y = 0; m.castShadow = m.receiveShadow = true; return m;
}

// ================================================================ additions for part 3, round 2 (2026-11-19, sample-part3a r2)
// Additive only. legionary(): the spear column seen through a long lens has to read as Roman soldiers at a glance (owner, round 1:
// "too small to read as soldiers") — so the silhouette carries the signs: a helmet with a front-to-back horsehair CREST and cheek
// guards, a tall RECTANGULAR curved scutum carried on the left side with its face outward (iron binding round the edge and a boss —
// the binding catches the low sun as a lit outline even when the board is in shadow), a pilum on the right shoulder with a bright
// point. Same body and IK as soldier() (man() + a knee tunic); posed by soldierPose() (both hands solved onto their grips).
//   crestM: the crest (red), bind: the binding/boss metal; tip: the point's material (pass one per soldier to let points glint
//   on their own beats).
export function legionary({ h = 1.74, mat, skin, metal, shieldM, wood, tip, crestM, bind } = {}) {
  const g = man({ h, mat, skin, kind: 'stand', cloth: metal }), U = g.userData, s = U.s, bm = bind || metal;
  const mk = (geo, m, parent) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  // the tunic to the knee (as soldier())
  const tg = new THREE.CylinderGeometry(.205 * s, .27 * s, .44 * s, 18, 6, true); tg.translate(0, .55 * s + .22 * s, 0);
  U.skirt.geometry.dispose(); U.skirt.geometry = tg; U.skirtBase = tg.attributes.position.array.slice();
  // the helmet: the cap in iron, a short neck guard, a brim, cheek guards, and the crest on top (a half-disc brush front to back
  // with a round edge so its outline takes the rim light)
  const [, cap, drape] = U.neck.children; if (cap) cap.scale.set(1.04, 1.08, 1.06); if (drape) { drape.scale.set(1.02, .32, 1.02); drape.position.y += .1 * s; }
  const rim = mk(new THREE.TorusGeometry(.128 * s, .012 * s, 5, 20), metal, U.neck); rim.rotation.x = Math.PI / 2; rim.position.y = .15 * s;
  for (const sd of [-1, 1]) { const ch = mk(new THREE.BoxGeometry(.012 * s, .1 * s, .08 * s), metal, U.neck); ch.position.set(sd * .118 * s, .1 * s, -.03 * s); ch.rotation.z = sd * .12; }
  const cR = .14 * s, crest = new THREE.Group(); crest.position.set(0, .27 * s, .01 * s); U.neck.add(crest);
  const fan = mk(new THREE.CircleGeometry(cR, 18, 0, Math.PI), crestM || mat, crest); fan.rotation.y = Math.PI / 2; fan.material.side = THREE.DoubleSide;
  const edge = mk(new THREE.TorusGeometry(cR * .93, .022 * s, 5, 18, Math.PI), crestM || mat, crest); edge.rotation.y = Math.PI / 2; edge.scale.z = 1.4;
  U.crest = crest;
  // the scutum: a curved rectangle 1.05 × 0.66 m, convex face to the left (−x), carried at the left side, the hand on the grip
  // behind the boss; iron binding round the edge and a boss
  const sh = new THREE.Group(); U.upper.add(sh); sh.position.set(-.37 * s, .08 * s, -.04 * s); sh.rotation.set(0, -.12, .04);
  const R = .72 * s, hh = 1.05 * s, span = .66 * s / R;
  const board = mk(new THREE.CylinderGeometry(R, R, hh, 16, 1, true, -Math.PI / 2 - span / 2, span), shieldM, sh); board.position.x = R;
  for (const y of [-hh / 2, hh / 2]) { const b = mk(new THREE.TorusGeometry(R, .014 * s, 4, 16, span), bm, sh); b.rotation.set(Math.PI / 2, 0, Math.PI - span / 2); b.position.set(R, y, 0); }
  for (const sd of [-1, 1]) { const a = -Math.PI / 2 + sd * span / 2, e = mk(new THREE.CylinderGeometry(.014 * s, .014 * s, hh, 4), bm, sh); e.position.set(R + R * Math.sin(a), 0, R * Math.cos(a)); }
  const boss = mk(new THREE.SphereGeometry(.085 * s, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), bm, sh); boss.rotation.z = Math.PI / 2; boss.position.x = -.005 * s;
  const spine = mk(new THREE.BoxGeometry(.02 * s, hh * .92, .035 * s), bm, sh); spine.position.x = -.004 * s;
  U.shield = sh; U.shieldGrip = V(-.37 * s + .07 * s, .08 * s, -.04 * s);   // the hand-hold behind the boss (upper frame)
  // the pilum (as soldier())
  const sp = new THREE.Group(); U.upper.add(sp); sp.position.set(.3 * s, -.25 * s, -.16 * s); sp.rotation.x = -.12;
  mk(new THREE.CylinderGeometry(.016 * s, .02 * s, 1.75 * s, 6), wood, sp).position.y = .7 * s;
  mk(new THREE.CylinderGeometry(.007 * s, .012 * s, .5 * s, 5), metal, sp).position.y = 1.82 * s;
  const pt = mk(new THREE.ConeGeometry(.024 * s, .12 * s, 4), tip || metal, sp); pt.position.y = 2.13 * s;
  U.spear = sp; U.spearTip = pt;
  U.spearGrip = V(.3 * s, -.25 * s + .62 * s * Math.cos(.12), -.16 * s - .62 * s * Math.sin(.12));
  return g;
}
