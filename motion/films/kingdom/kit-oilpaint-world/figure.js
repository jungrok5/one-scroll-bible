// kit-oilpaint-world/figure.js — copied 2026-11-19 from motion-skills/oil-paint-world/lib/figure.js (skill commit f0feca9; the skill
// repo is not modified). Changed for 「kingdom」 A2: pose() takes p.bow (0..1) — the chest leans forward (≤ 22°, inside LIM.lean),
// the head goes down (≤ 34°) and the hands come together in front of the face; and p.lookK (0..1) blends the look in. Original header follows.
// oil-paint-world · figure.js — the wanderer: a body made in code, walked by rule and painted in dabs.
//
// There is no model and no clip. A pose is worked out from where the wanderer is on their path: each foot is planted at
// a point of the path and stays there until it lifts (so it never slides), the legs reach it by two-bone IK with the
// knee always folding the one way a knee folds, the hips ride as high as the standing leg lets them, the arms swing
// against the legs and fold at the elbow the one way an elbow folds, the chest counter-turns and leans with speed, and
// a coat or cape hangs from the shoulders and trails by rule. The same pose comes back for the same place and time, so
// the film is a pure function of t. Every joint has a range (LIM) and audit() reports any pose that leaves it.
//
// Directions: the figure faces +z of its own space, y is up, and +x is its LEFT (right-handed). `side` is +1 for the
// left limb and -1 for the right. A thing carried "right" is in the right hand whichever way the figure is seen.
import * as THREE from 'three';
import * as P from './paint.js';
import { cl, lerp, sm, rng, mix3 } from './world.js';

/** joint ranges, degrees: what a body can do. audit() fails a pose outside them. */
export const LIM = {
  knee: [0, 150],        // folds back only: the shin never passes straight
  elbow: [0, 150],       // folds forward only
  hip: [-40, 120],       // thigh behind the body … in front of it
  shoulder: [-70, 175],  // arm behind … overhead
  neckYaw: [-80, 80], neckPitch: [-40, 40],
  twist: [-40, 40],      // chest against hips
  lean: [-10, 30],
};
const deg = THREE.MathUtils.radToDeg, rad = THREE.MathUtils.degToRad;
const V = () => new THREE.Vector3();

/** A sheet of cloth: cols × rows points written each frame by fn(i, j, out), its normals worked out from them. */
class Cloth {
  constructor(cols, rows, wrap) {
    this.cols = cols; this.rows = rows; this.wrap = wrap; const n = cols * rows;
    this.position = new Float32Array(n * 3); this.normal = new Float32Array(n * 3); this.down = new Float32Array(n * 3);
    const idx = [], cs = wrap ? cols : cols - 1;
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cs; i++) { const a = i + j * cols, b = ((i + 1) % cols) + j * cols; idx.push(a, a + cols, b, b, a + cols, b + cols); }
    const g = this.geometry = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.position, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('normal', new THREE.BufferAttribute(this.normal, 3).setUsage(THREE.DynamicDrawUsage));
    g.setIndex(idx); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  }
  write(fn) {
    const { cols, rows, position: p, normal: nm, down: dn, wrap } = this, o = V(), a = V(), b = V(), c = V();
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { fn(i, j, o); p.set([o.x, o.y, o.z], (i + j * cols) * 3); }
    const at = (i, j, out) => out.fromArray(p, (((i + cols) % cols) + cl(j, 0, rows - 1) * cols) * 3);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const i0 = wrap ? i - 1 : Math.max(0, i - 1), i1 = wrap ? i + 1 : Math.min(cols - 1, i + 1), k = (i + j * cols) * 3;
      at(i1, j, a).sub(at(i0, j, c)); at(i, j + 1, b).sub(at(i, j - 1, c));
      c.copy(b).normalize(); dn.set([c.x, c.y, c.z], k);
      c.crossVectors(a, b).normalize(); nm.set([c.x, c.y, c.z], k);
    }
    this.geometry.attributes.position.needsUpdate = true; this.geometry.attributes.normal.needsUpdate = true;
  }
  /** a pin at (u, v) of the sheet, 0..1: writes where it is, how the cloth faces and how it falls */
  pin(u, v) {
    const { cols, rows, wrap } = this, fu = u * (wrap ? cols : cols - 1), fv = v * (rows - 1), i = Math.floor(fu), j = Math.min(rows - 2, Math.floor(fv)), s = fu - i, t = fv - j;
    const ks = [[i, j, (1 - s) * (1 - t)], [i + 1, j, s * (1 - t)], [i, j + 1, (1 - s) * t], [i + 1, j + 1, s * t]].map(([a, b, w]) => [((wrap ? a % cols : Math.min(cols - 1, a)) + b * cols) * 3, w]);
    const mixTo = (arr, out) => { out.set(0, 0, 0); for (const [k, w] of ks) { out.x += arr[k] * w; out.y += arr[k + 1] * w; out.z += arr[k + 2] * w; } };
    return (Pp, N, D) => { mixTo(this.position, Pp); mixTo(this.normal, N); mixTo(this.down, D); };
  }
}

export class Figure {
  /** height (m); build (shoulder and hip breadth, 1 = average); palettes: { skin, hair, top, legs, shoes, coat, hat,
   *  pack, scarf, prop } each a three-mix palette (pal / mix3); sleeves: 'long' | 'short';
   *  coat: { length 0..1 of the way from shoulder to ground, flare, open (true, or how many degrees it stands open at the front) } or null;
   *  hat: { kind: 'brim' | 'cone' | 'cap' | 'beanie', r } or null; hair: 'short' | 'long' | 'bun' | null;
   *  pack: true; scarf: { length }; carry: { kind: 'lantern' | 'staff' | 'bag', side: 'right' | 'left', glow } */
  constructor(o = {}) {
    this.o = o; this.height = o.height || 1.72; this.k = this.height / 1.72; this.build = o.build || 1;
    const names = ['skin', 'hair', 'top', 'legs', 'shoes', 'coat', 'hat', 'pack', 'scarf', 'prop'];
    const dflt = { skin: mix3('#e8b796', { into: '#5a3040' }), hair: mix3('#4a3526'), top: mix3('#c9c2ae'), legs: mix3('#5b5348'), shoes: mix3('#3a2c24'), coat: mix3('#b9482e'), hat: mix3('#d8b56a'), pack: mix3('#8a6a44'), scarf: mix3('#e9e2cf'), prop: mix3('#7a5a3a') };
    this.palettes = names.map((n) => (o.palettes && o.palettes[n]) || dflt[n]); this.pi = Object.fromEntries(names.map((n, i) => [n, i]));
    this.group = new THREE.Group(); this.group.matrixAutoUpdate = false; this.parts = {}; this.cloths = []; this.rand = rng(o.seed || 9151);
    this.J = {}; this.A = {}; this.issues = [];
  }
  /** stride (two steps), metres, at a speed: a walk lengthens a little with speed, a run a lot */
  strideFor(v) { const g = sm(2.2, 3.0, v); return this.k * (v < 0.3 ? 1.0 : lerp(0.9 + 0.32 * v, 1.5 + 0.42 * v, g)); }

  attach(W) {
    this.W = W; const k = this.k, o = this.o, b = this.build, S = W.shared;
    this.under = P.underpaint(S, this.palettes, { dim: 0.86, rigid: true });
    this.pins = P.pinDabs(S, this.palettes, { seed: o.seed || 9151 });
    const dens = (o.paint ?? 300) * Math.min(1, W.q + 0.4);
    const cap = (r, len, sx = 1, sz = 1) => new THREE.CapsuleGeometry(r, Math.max(0.001, len - 0.0 * r), 4, 10).translate(0, len / 2, 0).scale(sx, 1, sz);
    const part = (name, geometry, pal, { size = [0.05 * k, 0.11 * k], run = [0, -1, 0], density = dens } = {}) => {
      const g = geometry.index ? geometry.toNonIndexed() : geometry; g.computeVertexNormals();
      g.setAttribute('aPal', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(this.pi[pal]), 1));
      const m = new THREE.Mesh(g, this.under); m.matrixAutoUpdate = false; m.frustumCulled = false; m.layers.enable(1); m.renderOrder = 4;
      this.group.add(m); this.parts[name] = m;
      // pins spread evenly over the surface: larger faces are chosen more often
      const pos = g.attributes.position, nrm = g.attributes.normal, a = V(), bb = V(), c = V(), tris = pos.count / 3, sums = new Float32Array(tris); let total = 0;
      for (let t = 0; t < tris; t++) { a.fromBufferAttribute(pos, t * 3); bb.fromBufferAttribute(pos, t * 3 + 1); c.fromBufferAttribute(pos, t * 3 + 2); total += bb.sub(a).cross(c.sub(a)).length() / 2; sums[t] = total; }
      for (let i = 0, n = Math.max(3, Math.round(total * density)); i < n; i++) {
        const want = this.rand() * total; let lo = 0, hi = tris - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (sums[mid] < want) lo = mid + 1; else hi = mid; }
        let s = this.rand(), t = this.rand(); if (s + t > 1) { s = 1 - s; t = 1 - t; }
        a.fromBufferAttribute(pos, lo * 3); bb.fromBufferAttribute(pos, lo * 3 + 1); c.fromBufferAttribute(pos, lo * 3 + 2);
        const p = a.clone().addScaledVector(bb.sub(a), s).addScaledVector(c.sub(a), t), nn = V().fromBufferAttribute(nrm, lo * 3);
        this.pins.add({ part: m, p, n: nn, d: V().set(...run), pal: this.pi[pal], size });
      }
      return m;
    };
    const arm = o.sleeves === 'short' ? 'skin' : 'top';
    part('pelvis', cap(0.11 * k, 0.2 * k, 1.35 * b, 1), 'legs');
    part('chest', cap(0.12 * k, 0.325 * k, 1.4 * b, 0.95), 'top');
    part('neck', cap(0.047 * k, 0.13 * k), 'skin', { size: [0.035 * k, 0.06 * k] });
    part('head', new THREE.SphereGeometry(0.105 * k, 12, 9).scale(0.92, 1.1, 1), 'skin', { size: [0.035 * k, 0.065 * k], run: [1, 0, 0] });
    for (const s of ['L', 'R']) {
      part('upperArm' + s, cap(0.046 * k, 0.28 * k), 'top');
      part('foreArm' + s, cap(0.038 * k, 0.25 * k), arm);
      part('hand' + s, new THREE.SphereGeometry(0.042 * k, 8, 6), 'skin', { size: [0.03 * k, 0.05 * k] });
      part('thigh' + s, cap(0.072 * k, 0.45 * k), 'legs');
      part('shin' + s, cap(0.052 * k, 0.42 * k), 'legs');
      part('foot' + s, cap(0.045 * k, 0.2 * k, 1, 0.8), 'shoes', { size: [0.04 * k, 0.09 * k], run: [0, 1, 0] });
    }
    // the head's own things
    const hair = o.hair === undefined ? 'short' : o.hair, hat = o.hat;
    if (hair) part('hair', new THREE.SphereGeometry(0.113 * k, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52).rotateX(-0.62).scale(0.95, 1.08, 1.04).translate(0, 0.006 * k, -0.008 * k), 'hair', { size: [0.035 * k, 0.08 * k], run: [0, -1, 0.2] });
    if (hair === 'long') part('hairBack', cap(0.075 * k, 0.24 * k, 1.2, 0.6), 'hair', { size: [0.04 * k, 0.12 * k] });
    if (hair === 'bun') part('hairBun', new THREE.SphereGeometry(0.052 * k, 8, 6), 'hair', { size: [0.03 * k, 0.05 * k] });
    if (hat) {
      const r = (hat.r || 0.2) * k, kind = hat.kind || 'brim';
      const g = kind === 'brim' ? [new THREE.CylinderGeometry(r, r * 1.04, 0.018 * k, 18).translate(0, 0.06 * k, 0), new THREE.SphereGeometry(0.112 * k, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1, 0.85, 1.05).translate(0, 0.062 * k, 0)]
        : kind === 'cone' ? [new THREE.ConeGeometry(r * 1.15, 0.15 * k, 18).translate(0, 0.125 * k, 0)]
        : kind === 'cap' ? [new THREE.SphereGeometry(0.126 * k, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1, 0.9, 1.04).translate(0, 0.022 * k, -0.004 * k), new THREE.CylinderGeometry(0.08 * k, 0.08 * k, 0.012 * k, 10).scale(1, 1, 1.5).translate(0, 0.03 * k, 0.14 * k)]
        : [new THREE.SphereGeometry(0.126 * k, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.56).scale(1, 1.1, 1.04).translate(0, 0.012 * k, -0.004 * k)];
      g.forEach((gg, i) => part('hat' + i, gg, 'hat', { size: [0.04 * k, kind === 'brim' && i === 0 ? 0.1 * k : 0.07 * k], run: kind === 'brim' && i === 0 ? [1, 0, 0] : [0, -1, 0.3] }));
    }
    if (o.pack) part('pack', new THREE.BoxGeometry(0.27 * k * b, 0.36 * k, 0.15 * k).translate(0, 0.18 * k, 0), 'pack', { size: [0.05 * k, 0.1 * k] });
    const carry = o.carry;
    if (carry) {
      if (carry.kind === 'staff') part('carry', new THREE.CylinderGeometry(0.014 * k, 0.018 * k, 1.42 * k, 6).translate(0, 0.71 * k, 0), 'prop', { size: [0.03 * k, 0.16 * k], density: dens * 1.5 });
      else if (carry.kind === 'lantern') part('carry', new THREE.CylinderGeometry(0.05 * k, 0.06 * k, 0.15 * k, 8).translate(0, -0.2 * k, 0), 'prop', { size: [0.04 * k, 0.06 * k], density: dens * 2 });
      else part('carry', new THREE.BoxGeometry(0.26 * k, 0.2 * k, 0.16 * k).translate(0, -0.2 * k, 0), 'prop', { size: [0.045 * k, 0.08 * k] });
    }
    // cloth: the coat, the scarf
    const cloth = (name, c, pal, n, size) => {
      const g = c.geometry; g.setAttribute('aPal', new THREE.Float32BufferAttribute(new Float32Array(c.cols * c.rows).fill(this.pi[pal]), 1));
      const m = new THREE.Mesh(g, this.clothPaint || (this.clothPaint = P.underpaint(S, this.palettes, { dim: 0.86 })));
      m.frustumCulled = false; m.matrixAutoUpdate = false; m.layers.enable(1); m.renderOrder = 4; this.group.add(m); this.cloths.push(c); this[name] = c;
      for (let i = 0; i < n; i++) this.pins.add({ at: c.pin(this.rand(), Math.pow(this.rand(), 0.8)), pal: this.pi[pal], size });
    };
    if (o.coat) cloth('coat', new Cloth(18, 9, !o.coat.open), 'coat', Math.round(330 * Math.min(1, W.q + 0.4) * (o.coat.length ?? 0.6) / 0.6), [0.07 * k, 0.17 * k]);
    if (o.scarf) cloth('scarf', new Cloth(3, 7, false), 'scarf', Math.round(40 * Math.min(1, W.q + 0.4)), [0.04 * k, 0.09 * k]);
    this.pins.build(); this.group.add(this.pins.mesh); this.count = this.pins.count;
    W.scene.add(this.group);
  }

  /** Put the body where it is: { t, x, y, z (the ground under it), hx, hz (the way it faces), phase (strides walked),
   *  stride (m), speed (m/s), at(ds) → { x, z } the path ds metres ahead (behind if negative), ground(x, z), look: [x, y, z] } */
  pose(p) {
    const k = this.k, o = this.o, J = this.J, A = this.A, b = this.build, v = p.speed || 0, up = V().set(0, 1, 0);
    const g = sm(2.2, 3.0, v), m = sm(0.05, 0.5, v), tau = Math.PI * 2;
    const f = V().set(p.hx, 0, p.hz).normalize(), left = V().set(p.hz, 0, -p.hx).normalize();
    const L = p.stride, duty = lerp(0.62, 0.3, g), l1 = 0.45 * k, l2 = 0.42 * k, ankleH = 0.07 * k, hipHalf = 0.09 * k * b;
    this.issues = [];
    // --- feet: planted on the path, lifted over to the next plant
    const feet = {};
    for (const [s, side, off] of [['L', 1, 0], ['R', -1, 0.5]]) {
      const ph = p.phase + off, q = ph - Math.floor(ph), stance = q < duty, u = stance ? 0 : (q - duty) / (1 - duty);
      const ds = lerp(0.03 * side * k, -q * L + (duty * L) / 2 + (stance ? 0 : L * (u * u * (3 - 2 * u))), m);
      const w = p.at(ds), lat = hipHalf * lerp(1.05, lerp(0.9, 0.45, g), m) * side;
      const x = w.x + left.x * lat, z = w.z + left.z * lat, gy = p.ground(x, z);
      const heel = stance ? sm(duty * 0.72, duty, q) : 0; // the heel comes up before the toe leaves
      const lift = stance ? heel * lerp(0.055, 0.12, g) * k : lerp(lerp(0.055, 0.12, g) * k, 0, sm(0, 0.3, u)) + Math.sin(Math.PI * u) * lerp(0.085, 0.24, g) * k;
      // toes down as it pushes off and trails, up as it reaches for the ground
      const pitch = stance ? heel * rad(38) : lerp(rad(38), rad(-16), sm(0.1, 0.85, u)) * (1 - sm(0.93, 1, u) * 0.7);
      feet[s] = { ankle: V().set(x, gy + ankleH + lift * m, z), pitch: pitch * m, stance, gy, q, flat: stance && heel < 0.02 };
    }
    // --- hips: as high as the legs allow, a little side to side over the standing leg, a bounce in a run
    const reach = (l1 + l2) * 0.992; let hy = p.y + (0.93 - 0.012) * k;
    const sway = Math.sin(tau * p.phase + 0.6) * 0.016 * k * m * (1 - g * 0.5), twist = rad(lerp(5, 9, g)) * m * Math.cos(tau * p.phase);
    const hx = p.x + left.x * sway, hz = p.z + left.z * sway;
    for (const [s, side] of [['L', 1], ['R', -1]]) {
      const a = feet[s].ankle, jx = hx + left.x * hipHalf * side, jz = hz + left.z * hipHalf * side, d2 = (a.x - jx) ** 2 + (a.z - jz) ** 2;
      const top = a.y + Math.sqrt(Math.max(0.01, reach * reach - d2));
      if (feet[s].stance || top < hy) hy = Math.min(hy, top) - (top < hy + 0.03 ? 0.25 * Math.max(0, 0.03 - Math.abs(top - hy)) : 0);
    }
    hy += g * 0.03 * k * Math.sin(2 * tau * p.phase + 1.2) - g * 0.03 * k + Math.sin((p.t || 0) * 1.3) * 0.003 * k * (1 - m);
    const hips = J.hips = V().set(hx, hy, hz);
    const fP = f.clone().applyAxisAngle(up, twist), leftP = left.clone().applyAxisAngle(up, twist);
    const bow = p.bow || 0, lean = rad(lerp(3, 12, g) * m + 1 + bow * 22), spine = up.clone().multiplyScalar(Math.cos(lean)).addScaledVector(f, Math.sin(lean));
    const ct = -twist * 1.25, fC = f.clone().applyAxisAngle(up, ct), leftC = left.clone().applyAxisAngle(up, ct);
    A.twist = deg(twist - ct); A.lean = deg(lean);
    J.chest = hips.clone().addScaledVector(spine, 0.12 * k); J.neck = hips.clone().addScaledVector(spine, 0.47 * k);
    // --- legs
    for (const [s, side] of [['L', 1], ['R', -1]]) {
      const H = J['hip' + s] = hips.clone().addScaledVector(leftP, hipHalf * side), ft = feet[s], d = V().subVectors(ft.ankle, H);
      const vf = d.dot(f), vu = d.dot(up), vl = d.dot(left); let len = Math.hypot(vf, vu);
      if (len > l1 + l2 - 0.002) { if (len > l1 + l2 + 0.02) this.issues.push(`${s === 'L' ? 'left' : 'right'} foot is ${((len - l1 - l2) * 100).toFixed(0)} cm out of the leg's reach`); len = l1 + l2 - 0.002; }
      const flex = Math.PI - Math.acos(cl((l1 * l1 + l2 * l2 - len * len) / (2 * l1 * l2), -1, 1));
      const th = Math.atan2(vf, -vu) + Math.acos(cl((l1 * l1 + len * len - l2 * l2) / (2 * l1 * len), -1, 1)), sh = th - flex;
      const K = J['knee' + s] = H.clone().addScaledVector(f, Math.sin(th) * l1).addScaledVector(up, -Math.cos(th) * l1).addScaledVector(left, vl * (l1 / (l1 + l2)));
      const An = J['ankle' + s] = K.clone().addScaledVector(f, Math.sin(sh) * l2).addScaledVector(up, -Math.cos(sh) * l2).addScaledVector(left, vl * (l2 / (l1 + l2)));
      A['knee' + s] = deg(flex); A['hip' + s] = deg(th) - A.lean * 0;
      const fd = f.clone().multiplyScalar(Math.cos(ft.pitch)).addScaledVector(up, -Math.sin(ft.pitch));
      J['heel' + s] = An.clone().addScaledVector(fd, -0.055 * k).addScaledVector(up, -ankleH + 0.04 * k); J['toe' + s] = J['heel' + s].clone().addScaledVector(fd, 0.2 * k);
      A['foot' + s] = { flat: ft.flat, off: An.y - ankleH - ft.gy };
      this.#limb('thigh' + s, H, K, fP); this.#limb('shin' + s, K, An, fP); this.#limb('foot' + s, J['heel' + s], J['toe' + s], up);
    }
    // --- torso and head
    this.#limb('pelvis', hips.clone().addScaledVector(up, -0.09 * k), hips.clone().addScaledVector(spine, 0.11 * k), fP);
    this.#limb('chest', J.chest, hips.clone().addScaledVector(spine, 0.445 * k), fC);
    let yaw = Math.sin((p.t || 0) * 0.45) * rad(9) * (1 - m), pitch = 0;
    if (p.look) { const lk = p.lookK ?? 1, d = V().set(p.look[0] - hips.x, 0, p.look[2] - hips.z).normalize(); yaw = lerp(yaw, cl(Math.atan2(d.dot(left), d.dot(f)), rad(-70), rad(70)), lk); pitch = lerp(0, cl(Math.atan2(p.look[1] - (hy + 0.66 * k), Math.hypot(p.look[0] - hips.x, p.look[2] - hips.z)), rad(-30), rad(30)), lk); }
    pitch -= bow * rad(34); yaw *= 1 - bow;
    A.neckYaw = deg(yaw - ct); A.neckPitch = deg(pitch);
    const fH = f.clone().applyAxisAngle(up, yaw), leftH = left.clone().applyAxisAngle(up, yaw), upH = up.clone().applyAxisAngle(leftH, -pitch);
    const head = J.head = J.neck.clone().addScaledVector(up, 0.19 * k).addScaledVector(fH, 0.015 * k);
    this.#limb('neck', J.neck.clone().addScaledVector(up, -0.03 * k), head.clone().addScaledVector(up, -0.07 * k), fC);
    const hf = fH.clone().applyAxisAngle(leftH, -pitch);
    this.#place('head', head, upH, hf); for (const n of ['hair', 'hat0', 'hat1']) this.#place(n, head, upH, hf);
    if (this.parts.hairBack) this.#limb('hairBack', head.clone().addScaledVector(hf, -0.07 * k).addScaledVector(up, -0.02 * k), J.neck.clone().addScaledVector(fC, -0.11 * k).addScaledVector(up, -0.2 * k), fC);
    if (this.parts.hairBun) this.#place('hairBun', head.clone().addScaledVector(hf, -0.1 * k).addScaledVector(up, 0.06 * k), upH, hf);
    if (this.parts.pack) this.#place('pack', hips.clone().addScaledVector(spine, 0.14 * k).addScaledVector(fC, -0.185 * k), spine, fC);
    // --- arms: each swings against the leg on its own side
    const amp = rad(lerp(24, 44, g)) * m, carry = o.carry, cs = carry ? (carry.side === 'left' ? 'L' : 'R') : null;
    for (const [s, side] of [['L', 1], ['R', -1]]) {
      const Sh = J['shoulder' + s] = hips.clone().addScaledVector(spine, 0.43 * k).addScaledVector(leftC, 0.19 * k * b * side);
      let sig = -side * amp * Math.cos(tau * p.phase) + rad(4), el = rad(lerp(14, 80, g) * m + 8) + Math.max(0, sig) * 0.5;
      if (cs === s) { sig = rad(carry.kind === 'staff' ? 30 : 12) + sig * 0.2; el = rad(carry.kind === 'staff' ? 62 : 38); }
      if (bow > 0) { sig = lerp(sig, rad(26), bow); el = lerp(el, rad(104), bow); }
      const ab = rad(7), dU = up.clone().multiplyScalar(-Math.cos(sig)).addScaledVector(fC, Math.sin(sig)).addScaledVector(leftC, side * Math.sin(ab)).normalize();
      const E = J['elbow' + s] = Sh.clone().addScaledVector(dU, 0.28 * k);
      const dF = up.clone().multiplyScalar(-Math.cos(sig + el)).addScaledVector(fC, Math.sin(sig + el)).addScaledVector(leftC, -side * (0.08 + 0.55 * bow)).normalize();
      const Wr = J['wrist' + s] = E.clone().addScaledVector(dF, 0.25 * k); J['hand' + s] = Wr.clone().addScaledVector(dF, 0.05 * k);
      A['shoulder' + s] = deg(sig); A['elbow' + s] = deg(el);
      this.#limb('upperArm' + s, Sh, E, fC); this.#limb('foreArm' + s, E, Wr, fC); this.#place('hand' + s, J['hand' + s], dF, fC);
    }
    if (cs) {
      const h = J['hand' + cs], sw = Math.sin(2 * tau * p.phase) * 0.05 * m;
      if (carry.kind === 'staff') { const d = up.clone().addScaledVector(fC, 0.2).normalize(); this.#place('carry', h.clone().addScaledVector(d, -0.95 * k), d, fC); }
      else { const d = up.clone().addScaledVector(fC, -sw).normalize(); this.#place('carry', h, d, fC); J.carry = h.clone().addScaledVector(d, -0.2 * k); }
      if (carry.kind === 'lantern') this.W.shared.uLamp.value.set(J.carry.x, J.carry.y, J.carry.z, carry.glow ?? 1.2);
    }
    // --- cloth, by rule: it hangs from the shoulders, trails with speed, swings with the stride and lifts in the wind
    const wind = this.W.shared.uWind.value, t = p.t || 0;
    if (this.coat) {
      const c = o.coat, len = (c.length ?? 0.6) * (hy - p.y + 0.46 * k), flare = c.flare ?? 0.5, open = c.open ? 1 - (c.open === true ? 100 : c.open) / 360 : 1, collar = hips.clone().addScaledVector(spine, 0.455 * k), C = this.coat;
      C.write((i, j, out) => {
        const a = (C.wrap ? i / C.cols : i / (C.cols - 1)) * tau * open - Math.PI * open, vv = j / (C.rows - 1), back = 0.5 + 0.5 * Math.cos(a);
        const grow = 1 + flare * Math.pow(vv, 0.8), sh = Math.min(1, vv * 5); // over the shoulders first, then down
        const rx = lerp(0.085, 0.215 * b, sh) * k * grow, rz = lerp(0.075, 0.15, sh) * k * (1 + flare * 1.25 * Math.pow(vv, 0.8));
        const v2 = vv * vv, trail = v2 * (0.03 + 0.085 * v + 0.05 * g) * k * (0.35 + 0.65 * back);
        const flut = v2 * (0.012 + 0.02 * m + 0.02 * wind.z) * k * Math.sin(2 * tau * p.phase - vv * 3 + a * 2) + v2 * 0.03 * wind.z * k * Math.sin(t * 3.1 + a * 3 + vv * 4);
        out.copy(collar).addScaledVector(fC, -rz * Math.cos(a) - trail).addScaledVector(leftC, rx * Math.sin(a)).addScaledVector(up, -len * vv * (1 - 0.1 * g * v2 * back) - (1 - sh) * 0.0)
          .addScaledVector(fC, -Math.cos(a) * flut).addScaledVector(leftC, Math.sin(a) * flut);
        out.x += wind.x * v2 * 0.05 * wind.z * k; out.z += wind.y * v2 * 0.05 * wind.z * k;
      });
    }
    if (this.scarf) {
      const len = (o.scarf.length ?? 0.5) * k, C = this.scarf, root = J.neck.clone().addScaledVector(fC, -0.07 * k).addScaledVector(up, 0.02 * k);
      C.write((i, j, out) => {
        const vv = j / (C.rows - 1), w = (i - 1) * 0.045 * k, lift = cl(0.25 + 0.2 * v + 0.25 * wind.z, 0, 0.92);
        const wave = Math.sin(t * 4.2 + vv * 5 + p.phase * tau) * 0.05 * k * vv;
        out.copy(root).addScaledVector(fC, -vv * len * lift).addScaledVector(up, -vv * len * (1 - lift) * 0.9 + wave * 0.5 + w * 0.6).addScaledVector(leftC, w * 0.5 + wave);
      });
    }
    this.pins.update();
    return this;
  }
  #limb(name, a, b, front) { // a part that runs from a to b, its front turned to `front`
    const m = this.parts[name]; if (!m) return;
    const y = V().subVectors(b, a).normalize(), z = front.clone().addScaledVector(y, -front.dot(y));
    if (z.lengthSq() < 1e-6) z.set(1, 0, 0).addScaledVector(y, -y.x); z.normalize();
    m.matrix.makeBasis(V().crossVectors(y, z), y, z).setPosition(a); m.matrixWorld.copy(m.matrix);
  }
  #place(name, at, upDir, front) { this.#limb(name, at, at.clone().add(upDir), front); }

  /** what is wrong with the pose just made, as sentences (none: the body is possible) */
  audit() {
    const A = this.A, out = [...this.issues], side = { L: 'left', R: 'right' };
    const inside = (name, val, lim) => { if (val < lim[0] - 0.5 || val > lim[1] + 0.5) out.push(`${name} at ${val.toFixed(0)}° is outside ${lim[0]}°…${lim[1]}°`); };
    for (const s of ['L', 'R']) {
      inside(`${side[s]} knee`, A['knee' + s], LIM.knee); inside(`${side[s]} elbow`, A['elbow' + s], LIM.elbow);
      inside(`${side[s]} hip`, A['hip' + s], LIM.hip); inside(`${side[s]} shoulder`, A['shoulder' + s], LIM.shoulder);
      const ft = A['foot' + s];
      if (ft.flat && Math.abs(ft.off) > 0.035) out.push(`${side[s]} foot is ${(ft.off * 100).toFixed(0)} cm ${ft.off > 0 ? 'above' : 'under'} the ground while it stands on it`);
    }
    inside('neck (turn)', A.neckYaw, LIM.neckYaw); inside('neck (nod)', A.neckPitch, LIM.neckPitch); inside('chest against hips', A.twist, LIM.twist); inside('lean', A.lean, LIM.lean);
    return out;
  }

  /** the cast sheet: the wanderer from every side, in every gait. yaw 0 is the eye behind them; negative, on their right. */
  cast() {
    const w = 1.4, r = 4.2;
    return [
      { label: 'front', yaw: 180, speed: 0, phase: 0 }, { label: 'front 3/4, facing right', yaw: -135, speed: 0, phase: 0 }, { label: 'side, facing right (their right side)', yaw: -90, speed: 0, phase: 0 },
      { label: 'back 3/4, facing right', yaw: -45, speed: 0, phase: 0 }, { label: 'back', yaw: 0, speed: 0, phase: 0 }, { label: 'back 3/4, facing left', yaw: 45, speed: 0, phase: 0 },
      { label: 'side, facing left (their left side)', yaw: 90, speed: 0, phase: 0 }, { label: 'front 3/4, facing left', yaw: 135, speed: 0, phase: 0 },
      ...[0, 0.25, 0.5, 0.75].map((ph) => ({ label: `walk ${ph}, facing right`, yaw: -90, speed: w, phase: ph })),
      { label: 'walk 0.1, facing left', yaw: 90, speed: w, phase: 0.1 }, { label: 'walk 0.6, facing left', yaw: 90, speed: w, phase: 0.6 },
      { label: 'walk, from behind', yaw: 0, speed: w, phase: 0.3 }, { label: 'walk, front 3/4', yaw: -145, speed: w, phase: 0.8 },
      ...[0.05, 0.3, 0.55, 0.8].map((ph) => ({ label: `run ${ph}, facing right`, yaw: -90, speed: r, phase: ph })),
      { label: 'run, facing left', yaw: 90, speed: r, phase: 0.2 }, { label: 'run, back 3/4', yaw: 35, speed: r, phase: 0.45 },
    ];
  }
}
