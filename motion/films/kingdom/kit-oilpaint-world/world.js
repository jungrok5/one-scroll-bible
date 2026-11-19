// kit-oilpaint-world/world.js — copied 2026-11-19 from motion-skills/oil-paint-world/lib/world.js (skill commit f0feca9; the skill
// repo is not modified). Changed for 「kingdom」 A2: o.embed — the World draws into a hidden canvas inside a film page (Pilot owns
// the picture, the camera and the clock), so it neither styles the body nor takes over window.seek; prepare() bakes the shade and
// the canvas pass without the live player; bakeShade(dir) bakes the still shade for another sun and hands it back (two lights in one
// valley: the shade is swapped per block, never moved); paintWith(t, st, cam) paints a frame from a walk state and an eye given by
// the page. Original header follows.
// oil-paint-world · world.js — a walkable world drawn as thick oil paint, and a film of someone walking through it.
//
// You describe the world in world.html: the light and the air, the way (a path), the land (height and what covers it),
// the things that stand in it (kit.js: sky, ranges, ground, growth, trees, solids, water, flecks — or dabs of your own),
// the wanderer (figure.js) and the shots (where they walk and where the eye is). start() bakes the land and the shade and
// from then on a frame is a pure function of t: seek(t) walks the wanderer to their place on the way, plants their feet,
// hangs their coat, puts the eye where the shot says and paints the picture. The same page plays live — and there you can
// take over and walk (W A S D, drag to look) — and renders to MP4 (scripts/render.mjs); scripts/check.mjs proves it first.
//
// Contract (set by start()): window.seek(t), renderAt(t), DURATION, FPS, SIZE, shotAt(t), runChecks(), showCast(i), film, READY.
// Query: ?render=1 (fixed canvas, no live loop) · ?t=12 (one frozen frame) · ?scale=.5 · ?q=.5 (how much paint: density)
//        · ?walk=1 (start walking) · ?off=shafts,canvas,figure,hud,<a thing's name> · ?card=tri · ?soft=0|1 (CPU shortcuts) · ?aa=0 (no multisampling)
import * as THREE from 'three';
import * as P from './paint.js';
export { THREE, P };

export const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const EASE = { linear: (p) => p, in: (p) => p * p, out: (p) => 1 - (1 - p) * (1 - p), inout: (p) => p * p * (3 - 2 * p) };
export function rng(seed = 1) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const h2 = (i, j, seed) => { const s = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); };
/** smooth value noise, 0..1 */
export function noise(x, z, seed = 0) {
  const i = Math.floor(x), j = Math.floor(z); let u = x - i, v = z - j; u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
  return lerp(lerp(h2(i, j, seed), h2(i + 1, j, seed), u), lerp(h2(i, j + 1, seed), h2(i + 1, j + 1, seed), u), v);
}
export function fbm(x, z, octaves = 4, seed = 0) { let a = 0, w = 0.5, t = 0; for (let o = 0; o < octaves; o++) { a += w * noise(x, z, seed + o * 13); t += w; x *= 2.03; z *= 2.03; w *= 0.5; } return a / t; }

// Colours are paint: written as they should look on the canvas, never converted and never tone-mapped.
export const rgb = (c) => { if (typeof c !== 'string') return c; const h = c.replace('#', ''), f = h.length === 3 ? [...h].map((x) => x + x).join('') : h; return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255); };
/** a three-mix palette: light, half-tone, shade (and its own colour, for a carried lamp's light) */
export const pal = (light, half, shade, own) => [rgb(light), rgb(half), rgb(shade), rgb(own || light)];
/** the three mixes from one colour: the half-tone a step down, the shade down and toward `into` (a cool violet unless told) */
export function mix3(c, { into = '#2b2440', deep = 0.5 } = {}) {
  const l = rgb(c), v = rgb(into);
  return [l, l.map((x, i) => x * 0.74 + v[i] * 0.02), l.map((x, i) => lerp(x * 0.44, v[i], deep * 0.6)), l];
}
const col = (u, c) => { const a = rgb(c); u.value.setRGB ? u.value.setRGB(a[0], a[1], a[2], THREE.LinearSRGBColorSpace) : u.value.set(...a); };
const dirOf = (az, el) => { const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el); return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)); };

export class World {
  constructor(o = {}) {
    const q = new URLSearchParams(location.search);
    this.o = o; this.name = o.name || document.title;
    [this.W, this.H] = o.size || [1920, 1080]; this.FPS = o.fps || 30;
    this.render = q.has('render'); this.frozen = q.has('t'); this.scale = +(q.get('scale') || 1); this.q = +(q.get('q') || o.q || 1);
    this.off = new Set((q.get('off') || '').split(',').filter(Boolean)); this.query = q;
    this.extent = o.extent || 128; this.landRes = o.landRes || 513; this.seed = o.seed || 1; this.rand = rng(this.seed);
    this.things = []; this.colliders = []; this.rules = []; this.counts = {}; this.list = []; this.DURATION = 0;

    // the canvas and the renderer come first: how the card is drawn depends on what draws it
    const canvas = this.canvas = document.createElement('canvas'); canvas.id = o.embed ? 'opw-frame' : 'frame';
    if (o.embed) { this.render = true; canvas.style.display = 'none'; }
    else document.body.style.cssText = 'margin:0;background:#16130f;overflow:hidden;height:100vh;display:grid;place-items:center';
    document.body.appendChild(canvas);
    const renderer = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: this.render, powerPreference: 'high-performance' });
    renderer.autoClear = false; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const gl = renderer.getContext(), dbg = gl.getExtension('WEBGL_debug_renderer_info');
    this.gpu = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
    this.software = /swiftshader|llvmpipe|software/i.test(this.gpu);
    // a live page with no GPU, or on a phone, lays less paint so that it still moves
    if (!this.render && !q.get('q')) { if (this.software) { this.q *= 0.35; this.scale *= 0.5; } else if (matchMedia('(pointer: coarse)').matches) this.q *= 0.5; }
    P.CARD.tri = q.get('card') === 'tri'; P.CARD.soft = q.get('soft') ? q.get('soft') === '1' : this.software;

    const S = this.shared = P.createShared({ extent: this.extent, landRes: this.landRes });
    S.tBrush.value = P.createBrushSheet();
    const sun = o.sun || {}, wind = o.wind || {}, air = o.air || {}, glaze = o.glaze || {};
    S.uSunDir.value.copy(sun.dir ? new THREE.Vector3(...sun.dir).normalize() : dirOf(sun.az ?? 215, sun.el ?? 26));
    const w = THREE.MathUtils.degToRad(wind.az ?? 60); S.uWind.value.set(Math.sin(w), -Math.cos(w), wind.strength ?? 1);
    col(S.uHaze, air.haze || '#9999ab'); col(S.uHazeSun, air.sun || '#ffe39e'); col(S.uHazeGlow, air.glow || '#1a1405');
    S.uHazeDensity.value = air.density ?? 0.0105;
    col(S.uGlazeMul, glaze.mul || '#806175'); col(S.uGlazeAdd, glaze.add || '#08050f'); col(S.uBounce, o.bounce || '#1a0b00');
    col(S.uLampCol, o.lamp || '#ff9e40');
    S.uImpasto.value = o.impasto ?? 1; S.uOpen.value = o.open ?? 1;
    this.clear = rgb(o.clear || air.haze || '#9999ab');

    this.scene = new THREE.Scene(); this.still = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, this.W / this.H, 0.1, 3000);
    this.frustum = new THREE.Frustum(); this.#size();
    this.land({});
  }

  #size() {
    const live = !this.render, fit = live ? Math.min(innerWidth / this.W, innerHeight / this.H) : 1;
    const dpr = live ? Math.min(devicePixelRatio || 1, 2) : 1, k = live && !this.frozen ? Math.min(fit * dpr, 1) * this.scale : this.scale;
    this.bw = Math.max(2, Math.round(this.W * k)); this.bh = Math.max(2, Math.round(this.H * k));
    this.renderer.setSize(this.bw, this.bh, false);
    if (!this.o.embed) { this.canvas.style.width = (live ? Math.round(this.W * fit) : this.W / 2) + 'px'; this.canvas.style.height = (live ? Math.round(this.H * fit) : this.H / 2) + 'px'; }
    if (this.frame) { this.frame.resize(); this.frame.uniforms.uWeave.value = this.bh / this.H; }
  }

  // ------------------------------------------------------------------------------------------------- the way
  /** The way through the world: points [x, z] joined by a smooth line. wayAt(s) is the point s metres along it. */
  way(points, { step = 0.25 } = {}) {
    const p = points.map(([x, z]) => new THREE.Vector3(x, 0, z)), curve = new THREE.CatmullRomCurve3(p, false, 'centripetal');
    const n = Math.max(8, Math.ceil(curve.getLength() / step)), pts = curve.getSpacedPoints(n);
    this.wayPts = pts; this.wayStep = curve.getLength() / n; this.wayLen = curve.getLength();
    return this;
  }
  wayAt(s) {
    const pts = this.wayPts, n = pts.length - 1, f = s / this.wayStep, i = cl(Math.floor(f), 0, n - 1), k = f - i, a = pts[i], b = pts[i + 1];
    const hx = b.x - a.x, hz = b.z - a.z, l = Math.hypot(hx, hz) || 1;
    return { x: a.x + hx * k, z: a.z + hz * k, hx: hx / l, hz: hz / l }; // beyond either end it runs on straight
  }
  /** how far (x, z) is from the way */
  wayDist(x, z) {
    const pts = this.wayPts; if (!pts) return 1e9; let best = 1e18, bi = 0;
    for (let i = 0; i < pts.length; i += 4) { const d = (pts[i].x - x) ** 2 + (pts[i].z - z) ** 2; if (d < best) { best = d; bi = i; } }
    for (let i = Math.max(0, bi - 4); i < Math.min(pts.length - 1, bi + 4); i++) {
      const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dz = b.z - a.z, t = cl(((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1));
      best = Math.min(best, (a.x + dx * t - x) ** 2 + (a.z + dz * t - z) ** 2);
    }
    return Math.sqrt(best);
  }

  // ------------------------------------------------------------------------------------------------ the land
  /** height(x, z) in metres; cover(x, z) → [r, g, b, a] 0..1: four masks the kit reads (the ground's covers 1–3, where
   *  growth and trees may stand). By convention r is the way. Both are baked into maps the dabs read. */
  land({ height = () => 0, cover = () => [0, 0, 0, 0] }) {
    const res = this.landRes, ext = this.extent, H = this.heights = new Float32Array(res * res), C = new Uint8Array(res * res * 4), half = new Uint16Array(res * res * 4);
    for (let j = 0; j < res; j++) for (let i = 0; i < res; i++) {
      const x = -ext + (2 * ext * i) / (res - 1), z = -ext + (2 * ext * j) / (res - 1), k = i + j * res, c = cover(x, z);
      H[k] = height(x, z);
      for (let m = 0; m < 4; m++) C[k * 4 + m] = Math.round(cl(c[m] || 0) * 255);
    }
    // height, and the way the ground faces (its normal's x and z), in one map: a dab reads both with one look
    const step = (2 * ext) / (res - 1), at = (i, j) => H[cl(i, 0, res - 1) + cl(j, 0, res - 1) * res], hf = THREE.DataUtils.toHalfFloat;
    for (let j = 0; j < res; j++) for (let i = 0; i < res; i++) {
      const k = (i + j * res) * 4, nx = -(at(i + 2, j) - at(i - 2, j)), nz = -(at(i, j + 2) - at(i, j - 2)), ny = 4 * step, l = Math.hypot(nx, ny, nz);
      half[k] = hf(H[i + j * res]); half[k + 1] = hf(nx / l); half[k + 2] = hf(nz / l); half[k + 3] = hf(1);
    }
    const th = new THREE.DataTexture(half, res, res, THREE.RGBAFormat, THREE.HalfFloatType), tc = new THREE.DataTexture(C, res, res);
    for (const t of [th, tc]) { t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true; }
    this.shared.tHeight.value?.dispose?.(); this.shared.tHeight.value = th; this.shared.tLand.value = tc; this.covers = C;
    return this;
  }
  /** the ground's height at (x, z), read from the baked map exactly as the dabs read it */
  groundAt(x, z) {
    const res = this.landRes, ext = this.extent, fx = cl(((x + ext) / (2 * ext)) * (res - 1), 0, res - 1.001), fz = cl(((z + ext) / (2 * ext)) * (res - 1), 0, res - 1.001);
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, H = this.heights, k = i + j * res;
    return lerp(lerp(H[k], H[k + 1], u), lerp(H[k + res], H[k + res + 1], u), v);
  }
  coverAt(x, z) {
    const res = this.landRes, ext = this.extent, i = cl(Math.round(((x + ext) / (2 * ext)) * (res - 1)), 0, res - 1), j = cl(Math.round(((z + ext) / (2 * ext)) * (res - 1)), 0, res - 1), k = (i + j * res) * 4, C = this.covers;
    return [C[k] / 255, C[k + 1] / 255, C[k + 2] / 255, C[k + 3] / 255];
  }

  // ------------------------------------------------------------------------------------------------- things
  /** thing: { name, group, shade (what stands in the sun's way, still), colliders: [{x, z, r}], count, follow(camera, frustum, world), update(t, world), drawn() } */
  add(thing) {
    if (!thing || this.off.has(thing.name)) return thing; // ?off=growth,trees leaves a thing out (to see what costs what)
    this.things.push(thing);
    if (thing.group) this.scene.add(thing.group);
    if (thing.shade) this.still.add(thing.shade);
    if (thing.colliders) this.colliders.push(...thing.colliders);
    if (thing.count) this.counts[thing.name || 'dabs'] = (this.counts[thing.name || 'dabs'] || 0) + thing.count;
    return thing;
  }
  /** the wanderer (figure.js) */
  figure(fig) { this.fig = fig; fig.attach(this); if (fig.count) this.counts.figure = fig.count; return fig; }
  /** a rule of your own: fn(world) → a string when it is broken (runChecks) */
  check(name, fn) { this.rules.push({ name, fn }); return this; }

  // -------------------------------------------------------------------------------------------------- shots
  /** shots: [{ name, dur, walk: [from, to] (metres along the way; left out: stands where the last shot ended), ease,
   *  look: [x, y, z] (what the wanderer turns their head to), figure: false (leave them out) | 'off-screen',
 *  cam: {…} or { from: {…}, to: {…}, ease } }]. A camera key: { back, side, up, yaw } round the wanderer (yaw 0 is
   *  behind them, 180 in front), or at: [x, up, z] / way: [s, side, up] for an eye that stays put; look: [side, up, ahead]
   *  from their feet, or lookAt: [x, y, z]; fov. */
  shots(list) {
    let t = 0, at = 0, phase = 0;
    this.list = list.map((s, i) => {
      const walk = s.walk || [at, at], dur = s.dur, speed = Math.abs(walk[1] - walk[0]) / dur;
      const stride = this.fig ? this.fig.strideFor(speed) : 1.4;
      const shot = { ...s, i, name: s.name || `shot ${i + 1}`, t0: t, t1: t + dur, walk, speed, stride, phase0: phase, ease: EASE[s.ease || 'linear'], cam: s.cam?.from ? s.cam : { from: s.cam || {}, to: s.cam || {} } };
      shot.camEase = EASE[shot.cam.ease || 'inout'];
      t += dur; at = walk[1]; phase += Math.abs(walk[1] - walk[0]) / stride;
      return shot;
    });
    this.DURATION = t;
    return this;
  }
  shotAt(t) { const s = this.list.find((s) => t < s.t1) || this.list[this.list.length - 1]; return s && { i: s.i, name: s.name, lt: t - s.t0, p: cl((t - s.t0) / s.dur) }; }

  /** where the wanderer is at t, and how they are moving */
  walkAt(t) {
    t = cl(t, 0, this.DURATION - 1e-4);
    const sh = this.list.find((s) => t < s.t1) || this.list[this.list.length - 1], p = cl((t - sh.t0) / sh.dur);
    const s = lerp(sh.walk[0], sh.walk[1], sh.ease(p)), e = 0.01, back = sh.walk[1] < sh.walk[0] ? -1 : 1;
    const speed = Math.abs(sh.walk[1] - sh.walk[0]) * (sh.ease(Math.min(1, p + e)) - sh.ease(Math.max(0, p - e))) / ((Math.min(1, p + e) - Math.max(0, p - e)) * sh.dur);
    const w = this.wayAt(s);
    return { shot: sh, p, s, speed, phase: sh.phase0 + Math.abs(s - sh.walk[0]) / sh.stride, stride: sh.stride, x: w.x, z: w.z, hx: w.hx * back, hz: w.hz * back, look: sh.look, at: (ds) => this.wayAt(s + ds * back) };
  }
  #key(k, st, out) {
    const g = (x, z) => this.groundAt(x, z), fx = st.x, fz = st.z, fy = g(fx, fz);
    // the way the wanderer is going, smoothed over a few metres so the eye doesn't twitch through a bend
    const a = st.at(-2.5), b = st.at(2.5); let hx = b.x - a.x, hz = b.z - a.z; const l = Math.hypot(hx, hz) || 1; hx /= l; hz /= l;
    if (k.at) out.eye.set(k.at[0], g(k.at[0], k.at[2]) + k.at[1], k.at[2]);
    else if (k.way) { const w = this.wayAt(k.way[0]); const x = w.x - w.hz * k.way[1], z = w.z + w.hx * k.way[1]; out.eye.set(x, g(x, z) + k.way[2], z); }
    else {
      const yaw = THREE.MathUtils.degToRad(k.yaw || 0), c = Math.cos(yaw), s = Math.sin(yaw), bx = hx * c - hz * s, bz = hx * s + hz * c, back = k.back ?? 5, side = k.side || 0;
      const x = fx - bx * back - bz * side, z = fz - bz * back + bx * side;
      out.eye.set(x, Math.max(fy + (k.up ?? 1.9), g(x, z) + 0.3), z);
    }
    if (k.lookAt) out.look.set(k.lookAt[0], k.lookAt[1], k.lookAt[2]);
    else { const lk = k.look || [0, 1.25, 0]; out.look.set(fx - hz * lk[0] + hx * lk[2], fy + lk[1], fz + hx * lk[0] + hz * lk[2]); }
    out.fov = k.fov || 50;
    return out;
  }
  /** the eye at t: { eye, look, fov } */
  camAt(t, st = this.walkAt(t)) {
    const A = this.#key(st.shot.cam.from, st, { eye: new THREE.Vector3(), look: new THREE.Vector3() });
    const B = this.#key(st.shot.cam.to, st, { eye: new THREE.Vector3(), look: new THREE.Vector3() }), e = st.shot.camEase(st.p);
    A.eye.lerp(B.eye, e); A.look.lerp(B.look, e); A.fov = lerp(A.fov, B.fov, e);
    A.eye.y = Math.max(A.eye.y, this.groundAt(A.eye.x, A.eye.z) + 0.3);
    return A;
  }

  // -------------------------------------------------------------------------------------------------- frames
  #paint(t, st, cam) {
    const S = this.shared, c = this.camera;
    S.uTime.value = t;
    if (this.fig) {
      const y = this.groundAt(st.x, st.z);
      this.fig.group.visible = !this.off.has('figure') && st.shot?.figure !== false;
      this.fig.pose({ t, x: st.x, y, z: st.z, hx: st.hx, hz: st.hz, phase: st.phase, stride: st.stride, speed: st.speed, at: st.at, ground: (x, z) => this.groundAt(x, z), look: st.look, lookK: st.lookK, bow: st.bow });
      S.uFocus.value.set(st.x, y, st.z);
    }
    c.fov = cam.fov; c.aspect = this.W / this.H; c.position.copy(cam.eye); c.up.set(0, 1, 0); c.lookAt(cam.look);
    c.updateProjectionMatrix(); c.updateMatrixWorld(true);
    S.uPixel.value = (2 * Math.tan(THREE.MathUtils.degToRad(c.fov) / 2)) / this.H; // metres a pixel of the full picture covers at 1 m
    this.frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse));
    for (const th of this.things) { th.follow?.(c, this.frustum, this); th.update?.(t, this); }
    if (this.fig && this.fig.group.visible) this.shade.update(this.scene, S.uFocus.value);
    this.frame.render(this.scene, c);
    this.now = { t, st, cam };
  }
  /** A2: paint a frame from a walk state st ({ shot: { figure }, x, z, hx, hz, phase, stride, speed, at(ds), look }) and an eye ({ eye, look, fov }) */
  paintWith(t, st, cam) { this.#paint(t, st, cam); }
  /** A2: the shade and the canvas pass, without the live player or window.* (embed) */
  prepare() {
    const o = this.o, f = o.finish || {}, sh = o.shade || {}, r = this.renderer, e = this.extent;
    r.setClearColor(new THREE.Color().setRGB(...this.clear, THREE.LinearSRGBColorSpace), 1);
    this.shadeOpts = { size: sh.size || [2048, 2048], box: sh.box || [e * 0.8, e * 0.8], centre: sh.centre || [0, this.groundAt(0, 0) + 6, 0], back: sh.back || e * 2.2, near: 5, far: e * 5, figBox: this.fig ? this.fig.height * 1.9 : 3.2 };
    this.shade = P.createShade(r, this.shared, this.still, this.shadeOpts);
    this.frame = P.createFrame(r, this.shared, { samples: f.samples ?? 4, shafts: f.shafts ?? 1, steps: f.steps ?? 22, reach: f.reach ?? 85, glow: rgb(f.glow || '#ffdb8f'), canvas: f.canvas ?? 1, varnish: f.varnish ?? 0.22 });
    this.frame.uniforms.uWeave.value = this.bh / this.H;
    this.total = Object.values(this.counts).reduce((a, b) => a + b, 0);
    return this;
  }
  /** A2: bake the still shade for a sun direction (THREE.Vector3, toward the sun); returns { dir, tex, mat } to swap in per frame */
  bakeShade(dir) {
    const S = this.shared, keep = S.uSunDir.value.clone();
    S.uSunDir.value.copy(dir).normalize();
    const one = P.createShade(this.renderer, S, this.still, { ...this.shadeOpts });
    const out = { dir: S.uSunDir.value.clone(), tex: S.tStillShade.value, mat: S.uStillShadeMat.value.clone(), fig: S.tFigShade.value, shade: one };
    S.uSunDir.value.copy(keep);
    return out;
  }
  useShade(b) { const S = this.shared; S.uSunDir.value.copy(b.dir); S.tStillShade.value = b.tex; S.uStillShadeMat.value.copy(b.mat); S.tFigShade.value = b.fig; this.shade = b.shade; }
  /** paint the film's frame at t (seconds) */
  renderAt(t) { const st = this.walkAt(t); this.#paint(t, st, this.camAt(t, st)); }
  /** how many dabs the last frame drew (those the eye could see) */
  drawn() { let n = 0; for (const th of this.things) n += th.drawn ? th.drawn() : 0; return n + (this.fig?.count || 0); }

  // --------------------------------------------------------------------------------------------------- start
  start() {
    const o = this.o, f = o.finish || {}, sh = o.shade || {}, r = this.renderer, e = this.extent;
    r.setClearColor(new THREE.Color().setRGB(...this.clear, THREE.LinearSRGBColorSpace), 1);
    if (!this.list.length) this.shots([{ dur: 8, walk: [0, Math.min(this.wayLen || 0, 10)], cam: {} }]);
    this.shade = P.createShade(r, this.shared, this.still, { size: sh.size || [2048, 2048], box: sh.box || [e * 0.8, e * 0.8], centre: sh.centre || [0, this.groundAt(0, 0) + 6, 0], back: sh.back || e * 2.2, near: 5, far: e * 5, figBox: this.fig ? this.fig.height * 1.9 : 3.2 });
    this.frame = P.createFrame(r, this.shared, { samples: +(this.query.get('aa') ?? f.samples ?? 4), shafts: this.off.has('shafts') ? 0 : f.shafts ?? 1, steps: f.steps ?? 22, reach: f.reach ?? 85, glow: rgb(f.glow || '#ffdb8f'), canvas: this.off.has('canvas') ? 0 : f.canvas ?? 1, varnish: f.varnish ?? 0.22 });
    this.frame.uniforms.uWeave.value = this.bh / this.H;
    this.total = Object.values(this.counts).reduce((a, b) => a + b, 0);

    Object.assign(window, {
      film: this, DURATION: this.DURATION, FPS: this.FPS, SIZE: { W: this.W, H: this.H },
      seek: (t) => { this.paused = true; this.renderAt(t); }, renderAt: (t) => this.renderAt(t), shotAt: (t) => this.shotAt(t),
      runChecks: () => this.runChecks(), showCast: (i) => this.showCast(i),
    });
    const t = this.query.get('t');
    this.renderAt(t != null ? +t : 0);
    if (!this.render && !this.frozen) this.#live(); else if (this.frozen) addEventListener('resize', () => { this.#size(); this.renderAt(+t); });
    window.READY = true;
    return this;
  }

  // ---------------------------------------------------------------------------------------------- the cast sheet
  /** the wanderer alone, turned every way and in every gait: view i of fig.cast(). Returns its label (or null past the end). */
  showCast(i) {
    const views = this.fig ? this.fig.cast() : [], v = views[i];
    if (!v) return null;
    const first = this.list[0], s0 = (first.walk[0] + first.walk[1]) / 2, w = this.wayAt(s0), stride = this.fig.strideFor(v.speed);
    const st = { shot: { figure: true }, p: 0, s: s0, speed: v.speed, phase: v.phase, stride, x: w.x, z: w.z, hx: w.hx, hz: w.hz, at: (ds) => this.wayAt(s0 + ds), look: v.look };
    const k = { back: v.dist || this.fig.height * 2.5, up: this.fig.height * 0.62, yaw: v.yaw, look: [0, this.fig.height * 0.52, 0], fov: 30 };
    const flat = { ...st, at: (ds) => ({ x: w.x + w.hx * ds, z: w.z + w.hz * ds, hx: w.hx, hz: w.hz }) }; // the eye turns round them on a straight line
    this.#paint(v.t || 0, st, this.#key(k, flat, { eye: new THREE.Vector3(), look: new THREE.Vector3() }));
    return v.label;
  }

  // ------------------------------------------------------------------------------------------------- the rules
  runChecks() {
    const fail = [], warn = [], info = [], g = (x, z) => this.groundAt(x, z), e = this.extent;
    info.push(`${this.list.length} shots · ${this.DURATION.toFixed(1)} s · ${this.total.toLocaleString('en')} dabs in the world (${Object.entries(this.counts).map(([k, v]) => `${k} ${v.toLocaleString('en')}`).join(' · ')})`);
    if (!this.wayPts) fail.push('no way: call W.way([[x, z], …]) — the wanderer and the shots are placed along it');
    for (const s of this.list) {
      if (s.dur < 1.5) fail.push(`${s.name}: ${s.dur} s is too short to read (≥ 1.5 s)`);
      if (Math.max(...s.walk) > this.wayLen + 0.01 || Math.min(...s.walk) < -0.01) fail.push(`${s.name}: walks to ${Math.max(...s.walk).toFixed(1)} m but the way is ${this.wayLen.toFixed(1)} m long`);
      if (s.speed > 0.05 && s.speed < 0.5) warn.push(`${s.name}: ${s.speed.toFixed(2)} m/s is a shuffle — stand still, or walk at 0.9–1.8 m/s`);
      if (s.speed > 2.2 && s.speed < 2.8) warn.push(`${s.name}: ${s.speed.toFixed(1)} m/s is between a walk and a run — walk ≤ 2 m/s or run 3–5.5 m/s`);
      if (s.speed > 6.5) fail.push(`${s.name}: ${s.speed.toFixed(1)} m/s is faster than anyone runs`);
    }
    for (const p of this.wayPts || []) if (Math.abs(p.x) > e * 0.92 || Math.abs(p.z) > e * 0.92) { fail.push(`the way leaves the land (±${e} m) at ${p.x.toFixed(0)}, ${p.z.toFixed(0)}`); break; }
    const body = new Map(), eyeIn = new Set(), lost = new Map(), cut = new Map();
    const v = new THREE.Vector3(), cam = new THREE.PerspectiveCamera(50, this.W / this.H, 0.1, 3000);
    for (let t = 0; t < this.DURATION; t += 1 / 10) {
      const st = this.walkAt(t), c = this.camAt(t, st), sn = st.shot.name;
      if (c.eye.y < g(c.eye.x, c.eye.z) + 0.25) fail.push(`${sn} @${t.toFixed(1)}: the eye is in the ground`);
      for (const k of this.colliders) if (Math.hypot(c.eye.x - k.x, c.eye.z - k.z) < k.r + 0.25 && c.eye.y < (k.top ?? 1e9)) eyeIn.add(`${sn}: the eye passes through something solid at ${k.x.toFixed(0)}, ${k.z.toFixed(0)} — move the eye or the thing`);
      for (const k of this.colliders) if (Math.hypot(st.x - k.x, st.z - k.z) < k.r + 0.2) eyeIn.add(`${sn}: the wanderer walks through something solid at ${k.x.toFixed(0)}, ${k.z.toFixed(0)} — keep things off the way`);
      if (this.fig && st.shot.figure !== false) {
        const y = g(st.x, st.z);
        this.fig.pose({ t, x: st.x, y, z: st.z, hx: st.hx, hz: st.hz, phase: st.phase, stride: st.stride, speed: st.speed, at: st.at, ground: g });
        for (const m of this.fig.audit()) body.set(`${sn}: ${m.replace(/-?\d+(\.\d+)?/g, '#')}`, `${sn} @${t.toFixed(1)}: ${m}`);
        cam.fov = c.fov; cam.position.copy(c.eye); cam.lookAt(c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
        const ins = [0.02, 0.98].map((h) => { v.set(st.x, y + this.fig.height * h, st.z).project(cam); return v.z < 1 && Math.abs(v.x) < 1.02 && Math.abs(v.y) < 1.02; }), on = ins[0] || ins[1];
        if (on && !(ins[0] && ins[1]) && st.shot.figure !== 'off-screen') cut.set(sn, `${sn} @${t.toFixed(1)}: the wanderer is cut by the frame's edge (their ${ins[0] ? 'head' : 'feet'} are out of the picture) — step the eye back or look lower`);
        if (!on && st.shot.figure !== 'off-screen') lost.set(sn, `${sn} @${t.toFixed(1)}: the wanderer is out of the picture (figure: 'off-screen' if that is the shot, figure: false to leave them out)`);
        if (c.eye.distanceTo(v.set(st.x, y + this.fig.height * 0.6, st.z)) < 0.7) fail.push(`${sn} @${t.toFixed(1)}: the eye is inside the wanderer`);
      }
    }
    // the wanderer alone, in every pose of the cast sheet
    if (this.fig) {
      const first = this.list[0], s0 = (first.walk[0] + first.walk[1]) / 2, w = this.wayAt(s0);
      for (const c of this.fig.cast()) {
        this.fig.pose({ t: 0, x: w.x, y: g(w.x, w.z), z: w.z, hx: w.hx, hz: w.hz, phase: c.phase, stride: this.fig.strideFor(c.speed), speed: c.speed, at: (ds) => this.wayAt(s0 + ds), ground: g });
        for (const m of this.fig.audit()) body.set(`cast: ${m.replace(/-?\d+(\.\d+)?/g, '#')}`, `cast "${c.label}": ${m}`);
      }
      info.push(`the wanderer: ${this.fig.count.toLocaleString('en')} dabs · ${this.fig.cast().length} cast poses and ${Math.round(this.DURATION * 10)} film poses audited against the joint ranges`);
    }
    fail.push(...body.values(), ...eyeIn, ...lost.values()); warn.push(...cut.values());
    for (const r of this.rules) { try { const m = r.fn(this); if (m) fail.push(`${r.name}: ${m}`); } catch (err) { fail.push(`${r.name}: threw ${err.message}`); } }
    if (this.now) this.renderAt(this.now.t);
    return { fail, warn, info };
  }

  /** for check.mjs: paint with a canvas no paint would be (magenta) and nothing laid over it, so bare canvas can be counted */
  bare(on) {
    const u = this.frame.uniforms; this.kept = this.kept || { s: u.uShafts.value, c: u.uCanvas.value, v: u.uVarnish.value };
    this.renderer.setClearColor(on ? new THREE.Color().setRGB(1, 0, 1, THREE.LinearSRGBColorSpace) : new THREE.Color().setRGB(...this.clear, THREE.LinearSRGBColorSpace), 1);
    u.uShafts.value = on ? 0 : this.kept.s; u.uCanvas.value = on ? 0 : this.kept.c; u.uVarnish.value = on ? 0 : this.kept.v;
  }

  // -------------------------------------------------------------------------------------------- the live page
  // The film plays in a loop. Press W A S D (or the Walk button) and the wanderer is yours: drag to look round, the
  // wheel steps the eye back or in, Shift runs, F (or the Film button) goes back to the film, H hides the bar.
  #live() {
    const ui = { film: 'Film', walk: 'Walk', hint: 'W A S D walk · Shift run · drag to look · F film · H hide', ...(this.o.ui || {}) };
    const keys = new Set(), fig = this.fig;
    let mode = 'film', t0 = performance.now(), last = t0, tf = +(this.query.get('t0') || 0);
    const wk = { x: 0, z: 0, ang: 0, speed: 0, s: 0, phase: 0, trail: [], yaw: 0, pitch: 0.16, dist: 5.2, auto: false };
    const bar = document.createElement('div');
    if (!this.off.has('hud')) {
      bar.style.cssText = 'position:fixed;left:14px;bottom:12px;display:flex;gap:8px;align-items:center;font:12px/1.2 ui-sans-serif,system-ui,sans-serif;color:#f4ecd8;text-shadow:0 1px 2px #0009;user-select:none';
      bar.innerHTML = `<button data-m="film"></button><button data-m="walk"></button><span></span>`;
      for (const b of bar.querySelectorAll('button')) { b.textContent = ui[b.dataset.m]; b.style.cssText = 'font:inherit;color:inherit;background:#0006;border:1px solid #fff5;border-radius:999px;padding:5px 12px;cursor:pointer'; b.onclick = () => set(b.dataset.m, true); }
      bar.querySelector('span').textContent = ui.hint;
      document.body.appendChild(bar);
    }
    const set = (m, auto) => {
      if (m === 'walk' && !fig) return;
      if (m === 'walk' && mode !== 'walk') {
        const st = this.now.st; Object.assign(wk, { x: st.x, z: st.z, ang: Math.atan2(st.hx, st.hz), s: 0, phase: st.phase, speed: 0, trail: [{ s: 0, x: st.x, z: st.z }], auto: !!auto && matchMedia('(pointer: coarse)').matches });
        const c = this.now.cam, dx = c.eye.x - st.x, dz = c.eye.z - st.z; wk.yaw = Math.atan2(-dx, -dz); wk.dist = cl(Math.hypot(dx, dz), 3, 9);
      } else if (m === 'walk') wk.auto = !wk.auto && matchMedia('(pointer: coarse)').matches;
      if (m === 'film' && mode !== 'film') t0 = performance.now() - tf * 1000;
      mode = m;
      for (const b of bar.querySelectorAll('button')) b.style.background = b.dataset.m === mode ? '#f4ecd8' : '#0006', b.style.color = b.dataset.m === mode ? '#221b12' : 'inherit';
    };
    set('film');
    addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { keys.add(k); if (mode !== 'walk') set('walk'); e.preventDefault(); }
      if (k === 'shift') keys.add(k);
      if (k === 'f' || k === 'escape') set('film');
      if (k === 'h') bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
    });
    addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => keys.clear());
    let drag = null;
    this.canvas.style.touchAction = 'none';
    this.canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; this.canvas.setPointerCapture(e.pointerId); });
    this.canvas.addEventListener('pointermove', (e) => { if (!drag || mode !== 'walk') return; wk.yaw -= (e.clientX - drag.x) * 0.006; wk.pitch = cl(wk.pitch + (e.clientY - drag.y) * 0.004, -0.12, 1.1); drag = { x: e.clientX, y: e.clientY }; });
    addEventListener('pointerup', () => { drag = null; });
    this.canvas.addEventListener('wheel', (e) => { if (mode === 'walk') { wk.dist = cl(wk.dist * (e.deltaY > 0 ? 1.1 : 0.9), 2.2, 14); e.preventDefault(); } }, { passive: false });
    addEventListener('resize', () => this.#size());

    const trailAt = (s) => {
      const tr = wk.trail, n = tr.length;
      if (s >= wk.s) return { x: wk.x + Math.sin(wk.ang) * (s - wk.s), z: wk.z + Math.cos(wk.ang) * (s - wk.s) };
      for (let i = n - 1; i > 0; i--) if (tr[i - 1].s <= s) { const a = tr[i - 1], b = tr[i], k = (s - a.s) / (b.s - a.s || 1); return { x: lerp(a.x, b.x, k), z: lerp(a.z, b.z, k) }; }
      const a = tr[0], b = tr[1] || { x: wk.x, z: wk.z, s: wk.s }, l = Math.hypot(b.x - a.x, b.z - a.z) || 1;
      return { x: a.x + ((b.x - a.x) / l || -Math.sin(wk.ang)) * (s - a.s), z: a.z + ((b.z - a.z) / l || -Math.cos(wk.ang)) * (s - a.s) };
    };
    const step = (dt, now) => {
      let mx = 0, mz = 0;
      if (keys.has('w') || keys.has('arrowup') || wk.auto) mz += 1;
      if (keys.has('s') || keys.has('arrowdown')) mz -= 1;
      if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
      if (keys.has('d') || keys.has('arrowright')) mx += 1;
      const moving = mx || mz, want = moving ? (keys.has('shift') ? 4.4 : 1.5) : 0;
      wk.speed += (want - wk.speed) * Math.min(1, dt * 6);
      if (moving) {
        const a = wk.yaw + Math.atan2(-mx, mz); let d = a - wk.ang; d = Math.atan2(Math.sin(d), Math.cos(d));
        wk.ang += d * Math.min(1, dt * 8);
      }
      const ds = wk.speed * dt; let x = wk.x + Math.sin(wk.ang) * ds, z = wk.z + Math.cos(wk.ang) * ds;
      for (const k of this.colliders) { const dx = x - k.x, dz = z - k.z, d = Math.hypot(dx, dz), r = k.r + 0.3; if (d < r) { x = k.x + (dx / d) * r; z = k.z + (dz / d) * r; } }
      const lim = this.extent * 0.86; x = cl(x, -lim, lim); z = cl(z, -lim, lim);
      const moved = Math.hypot(x - wk.x, z - wk.z); wk.x = x; wk.z = z; wk.s += moved;
      const stride = fig.strideFor(Math.max(wk.speed, 0.6)); wk.phase += moved / stride;
      if (moved > 0 && wk.s - wk.trail[wk.trail.length - 1].s > 0.1) { wk.trail.push({ s: wk.s, x, z }); if (wk.trail.length > 120) wk.trail.shift(); }
      const hx = Math.sin(wk.ang), hz = Math.cos(wk.ang), y = this.groundAt(x, z);
      const st = { shot: {}, p: 0, s: wk.s, speed: wk.speed, phase: wk.phase, stride, x, z, hx, hz, at: (d) => { const p = trailAt(wk.s + d); return { x: p.x, z: p.z, hx, hz }; } };
      const cp = Math.cos(wk.pitch), eye = new THREE.Vector3(x - Math.sin(wk.yaw) * cp * wk.dist, y + 1.3 + Math.sin(wk.pitch) * wk.dist, z - Math.cos(wk.yaw) * cp * wk.dist);
      eye.y = Math.max(eye.y, this.groundAt(eye.x, eye.z) + 0.3);
      this.#paint(now / 1000, st, { eye, look: new THREE.Vector3(x, y + fig.height * 0.75, z), fov: 50 });
    };
    if (this.query.has('walk')) set('walk', true);
    const tick = (now) => {
      requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (this.paused) return;
      if (mode === 'film') { tf = ((now - t0) / 1000) % this.DURATION; this.renderAt(tf); } else step(dt, now);
    };
    requestAnimationFrame(tick);
  }
}
