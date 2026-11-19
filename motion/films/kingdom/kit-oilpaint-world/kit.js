// kit-oilpaint-world/kit.js — copied 2026-11-19 from motion-skills/oil-paint-world/lib/kit.js (skill commit f0feca9; the skill repo
// is not modified). Changed for 「kingdom」 A2 (valley-oil.js), all driven by the shared rule-of-light uniforms in paint.js:
// ground's flat paint graded; growth leans toward the light (uLean), wilts where life has gone and thins out seen from the air;
// trees: leaves turn and fall where life goes (uFallMode 1) or bud back (0), crowns may carry branch strokes (crown.twigs, also on
// far trees) so a bare tree is painted limbs, never a stick; solid: an optional lift (a grave that rises and sinks); water: flow
// that follows a river (flowAt) and glints only in the light. Original header follows.
// oil-paint-world · kit.js — the things a painted world is made of. Each takes the world and what the topic decides
// (palettes, sizes, where), and returns a thing for W.add(): { name, group, shade, colliders, count, follow, drawn }.
//
//   sky      a dome of broad strokes: zenith to horizon, the glow round the sun, clouds, a disc, stars
//   ranges   far hills in rows, laid far to near
//   ground   the carpet: dabs lying flat, up to four covers (the base and one for each of the land map's r g b)
//   growth   clumps of blades, fronds and flower heads standing on the ground
//   trees    trunks, limbs, bark and leaves: round, column, cone, flat or bare crowns
//   solid    paint on anything made of triangles (a wall, a roof, a boulder, a boat, a GLB): strokes along its grain
//   water    a level of strokes that give back the sky and glint toward the sun
//   flecks   what falls or drifts through the air: leaves, petals, snow, seeds, embers
//   dabs     your own: positions in buffers and a makeDab in GLSL (references/PAINT.md)
// Palettes are three mixes — pal(light, half, shade) or mix3(colour) from world.js. Nothing here is the style's content:
// a topic chooses what stands where and in what colours; the marks and the way they are laid are the style.
import * as THREE from 'three';
import * as P from './paint.js';
import { rgb, rng, cl, lerp, noise, fbm } from './world.js';

const f = (x) => { const s = (+x).toFixed(4); return s.includes('.') ? s : s + '.0'; };
const v3 = (c) => `vec3(${rgb(c).map(f).join(', ')})`;
const farr = (name, a) => `const float ${name}[${a.length}] = float[${a.length}](${a.map(f).join(', ')});\n`;
const iarr = (name, a) => `const int ${name}[${a.length}] = int[${a.length}](${a.join(', ')});\n`;
const count = (W, n, least = 1) => Math.max(least, Math.round(n * W.q));

// ------------------------------------------------------------------------------------------------------------- sky
/** zenith, horizon: the sky's two colours; glow: the colour round the sun; clouds: { pal, amount 0..1, scale, drift, low };
 *  disc: { colour, size (degrees), dir: [x, y, z] (the sun's unless given: a moon) }; stars: how many. */
export function sky(W, { zenith = '#5d8fc9', horizon = '#cfe0ea', glow = '#fff1c4', glowSize = 1, n = 2600, clouds = null, disc = null, stars = 0, starColour = '#fff6dc' } = {}) {
  const S = W.shared, group = new THREE.Group(), R = 1400;
  const head = `const vec3 ZEN = ${v3(zenith)}; const vec3 HOR = ${v3(horizon)}; const vec3 GLO = ${v3(glow)};\n` + (clouds ? P.paletteGLSL('CL', [clouds.pal]) : '') + /* glsl */ `
    vec3 skyAt(vec3 dir) {
      float el = max(dir.y, 0.0);
      vec3 c = mix(HOR, ZEN, pow(el, 0.55));
      float sunward = max(dot(dir, uSunDir), 0.0);
      return mix(c, GLO, clamp(pow(sunward, ${f(7 / glowSize)}) * 0.7 + pow(sunward, ${f(70 / glowSize)}) * 0.6, 0.0, 1.0));
    }`;
  // under the strokes: the same sky, flat, so that no gap shows the canvas
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 1.2, 24, 12), new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms: S, side: THREE.BackSide, depthTest: false, depthWrite: false,
    vertexShader: `${P.COMMON}\nout vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * viewMatrix * vec4(position + cameraPosition, 1.0); }`,
    fragmentShader: `${P.COMMON}\n${head}\nin vec3 vDir; layout(location = 0) out vec4 outC; void main() { vec3 d = normalize(vDir); vec3 c = skyAt(d); c = mix(c, airColour(d), (1.0 - smoothstep(0.0, 0.16, d.y)) * 0.8); outC = vec4(c, 1.0); }`,
  }));
  dome.frustumCulled = false; dome.renderOrder = -40; group.add(dome);

  n = count(W, n, 600);
  const dirs = new Float32Array(n * 3), rs = rng(W.seed + 17), gap = Math.sqrt((4 * Math.PI * 0.56) / n);
  for (let i = 0, k = 0; k < n; i++) { // a spiral of even points over the sphere, each nudged off it so no rows show; keep those above a little under the horizon
    const y = 1 - (i + 0.5) / (n * 1.78), a = i * 2.39996323, r = Math.sqrt(Math.max(0, 1 - y * y));
    if (y < -0.12) break;
    const d = new THREE.Vector3(Math.cos(a) * r + (rs() - 0.5) * gap * 1.5, y + (rs() - 0.5) * gap * 1.5, Math.sin(a) * r + (rs() - 0.5) * gap * 1.5).normalize();
    dirs.set([d.x, d.y, d.z], k * 3); k++;
  }
  const size = R * gap * 1.7;
  const c = clouds || {};
  const strokes = P.dabMesh(P.dabGeometry(n, { aDir: [dirs, 3] }), P.dabMaterial(S, {
    head: `in vec3 aDir;\n${head}`,
    body: /* glsl */ `
      void makeDab(inout Dab d) {
        vec3 dir = normalize(aDir);
        vec4 r = hash4(float(gl_InstanceID) + 3.7);
        vec3 c = skyAt(dir);
        vec2 cp = dir.xz / (dir.y + 0.45) * 2.4 * ${f(c.scale ?? 1)} + uWind.xy * uTime * ${f(c.drift ?? 0.004)};
        float cover = 0.0;
        ${clouds ? /* glsl */ `
        float cn = texture(tNoise, cp * 0.11).r * 0.65 + texture(tNoise, cp * 0.31 + 0.4).g * 0.35;
        cover = smoothstep(${f(1 - (c.amount ?? 0.45) - 0.1)}, ${f(1 - (c.amount ?? 0.45) + 0.1)}, cn) * smoothstep(${f(c.low ?? 0.03)}, ${f((c.low ?? 0.03) + 0.1)}, dir.y);
        // a cloud is lit on the side the sun is on: is there more cloud that way, or less?
        vec2 sunward = normalize(uSunDir.xz + 1e-4) * 0.9;
        float cn2 = texture(tNoise, (cp + sunward) * 0.11).r * 0.65 + texture(tNoise, (cp + sunward) * 0.31 + 0.4).g * 0.35;
        float lit = clamp(0.5 + (cn - cn2) * 3.2 + 0.25 * dir.y + (r.y - 0.5) * 0.3, 0.0, 1.0);
        c = mix(c, paint3(CL_L[0], CL_M[0], CL_S[0], lit, r.x), cover);` : ''}
        c = jitter(c, r.yzw, 0.34 + 0.15 * cover);
        c = mix(c, airColour(dir), (1.0 - smoothstep(0.0, 0.16, dir.y)) * 0.8);
        d.pos = cameraPosition + dir * ${f(R)};
        // strokes run level and curl a little; a cloud is laid in rounder marks
        vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), dir) + 1e-4);
        float tilt = (texture(tNoise, cp * 0.07 + 0.2).b - 0.5) * 1.5;
        d.dir = normalize(east + cross(dir, east) * tilt);
        d.size = vec2(${f(size)} * (0.7 + 0.6 * r.y), ${f(size)} * (1.7 + 1.1 * r.z)) * (1.0 - 0.15 * cover);
        d.c1 = c; d.c2 = jitter(c * 1.05, r.wxy, 0.3);
        d.lift = 0.0; d.turnabout = 1.0;
        d.cell = cover > 0.5 ? 4.0 + floor(r.w * 1.99) : -1.0;
      }`,
    minPx: [5, 9], maxPx: [4000, 4000], cells: [0, 3], depthTest: false, depthWrite: false, relief: 0.5,
  }), -30);
  group.add(strokes);
  let total = n;
  if (disc) {
    const dd = disc.dir ? new THREE.Vector3(...disc.dir).normalize() : null, k = 7, sz = Math.tan(THREE.MathUtils.degToRad(disc.size ?? 3)) * R;
    group.add(P.dabMesh(P.dabGeometry(k), P.dabMaterial(S, {
      body: /* glsl */ `
        void makeDab(inout Dab d) {
          vec4 r = hash4(float(gl_InstanceID) * 3.1 + 0.7);
          vec3 dir = ${dd ? `vec3(${f(dd.x)}, ${f(dd.y)}, ${f(dd.z)})` : 'uSunDir'};
          vec3 e = normalize(cross(vec3(0.0, 1.0, 0.0), dir)), n = cross(dir, e);
          float a = r.x * TAU, rad = gl_InstanceID == 0 ? 0.0 : 0.45;
          d.pos = cameraPosition + (dir + (e * cos(a) + n * sin(a)) * rad * ${f(sz / R)}) * ${f(R * 0.99)};
          d.dir = e * cos(a * 2.0) + n * sin(a * 2.0);
          d.size = vec2(${f(sz)}) * (gl_InstanceID == 0 ? vec2(2.0, 2.0) : vec2(1.2, 1.5));
          d.c1 = jitter(${v3(disc.colour || '#fff4d0')}, r.yzw, 0.12); d.c2 = d.c1 * 1.04; d.cell = 4.0 + floor(r.w * 1.99); d.lift = 0.0;
        }`,
      minPx: [6, 6], maxPx: [4000, 4000], depthTest: false, depthWrite: false,
    }), -29));
    total += k;
  }
  if (stars) {
    const ns = count(W, stars, 50), sd = new Float32Array(ns * 3), rand = rng(W.seed + 51);
    for (let i = 0; i < ns; i++) { const y = rand() * 0.98 + 0.02, a = rand() * 6.2832, r = Math.sqrt(1 - y * y); sd.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3); }
    group.add(P.dabMesh(P.dabGeometry(ns, { aDir: [sd, 3] }), P.dabMaterial(S, {
      head: 'in vec3 aDir;',
      body: /* glsl */ `
        void makeDab(inout Dab d) {
          vec4 r = hash4(float(gl_InstanceID) * 1.7 + 9.0);
          d.pos = cameraPosition + aDir * ${f(R * 0.98)};
          float tw = 0.75 + 0.25 * sin(uTime * (1.0 + 2.0 * r.x) + r.y * 40.0);
          d.size = vec2(${f(R * 0.004)}) * (0.5 + 1.6 * r.z * r.z);
          d.c1 = jitter(${v3(starColour)}, r.yzw, 0.3) * tw * smoothstep(0.02, 0.2, aDir.y); d.c2 = d.c1; d.cell = 4.0; d.lift = 0.0;
        }`,
      minPx: [2, 2], maxPx: [9, 9], depthTest: false, depthWrite: false, additive: true,
    }), -28));
    total += ns;
  }
  return { name: 'sky', group, count: total, drawn: () => total };
}

// ---------------------------------------------------------------------------------------------------------- ranges
/** rows: [{ dist, height, base, pal, haze 0..1, rough, snow: { above 0..1, pal }, seed, arc: [from, to] degrees }], far to near. */
export function ranges(W, { rows = [], centre = [0, 0] } = {}) {
  const S = W.shared, group = new THREE.Group(); let total = 0;
  rows.forEach((row, ri) => {
    const { dist = 600, height = 120, base = -10, haze = 0.55, rough = 1, seed = ri * 7 + 3, arc = [0, 360] } = row;
    const pals = [row.pal, row.snow ? row.snow.pal : row.pal], rand = rng(seed * 131 + 7);
    const a0 = THREE.MathUtils.degToRad(arc[0]), a1 = THREE.MathUtils.degToRad(arc[1]), stepLen = Math.max(14, dist * 0.028), steps = Math.ceil(((a1 - a0) * dist) / stepLen);
    const ridge = (a) => base + height * (0.3 + 0.7 * fbm(a * 2.3 * rough + seed, seed * 0.37, 4, seed)) * (arc[1] - arc[0] < 359 ? Math.sin(Math.PI * cl((a - a0) / (a1 - a0))) ** 0.5 : 1);
    const pos = [], dir = [], data = [], strip = [], sp = [];
    const sun = S.uSunDir.value;
    for (let i = 0; i <= steps; i++) {
      const a = a0 + ((a1 - a0) * i) / steps, cx = Math.sin(a), cz = -Math.cos(a), h = ridge(a), h2 = ridge(a + 0.01);
      const slope = (h2 - h) / (0.01 * dist), nx = -cx * 0.75 - slope * cz * -1, nz = -cz * 0.75 - slope * cx;
      const n = new THREE.Vector3(nx + cz * slope, 0.7, nz - cx * slope).normalize();
      const lit = cl(n.dot(sun) * 0.9 + 0.45);
      strip.push(centre[0] + cx * dist, h, centre[1] + cz * dist, centre[0] + cx * dist, base - 40, centre[1] + cz * dist);
      sp.push(lit, h > base + height * (row.snow?.above ?? 9) ? 1 : 0, lit, 0);
      const stack = Math.max(2, Math.ceil((h - base) / (stepLen * 1.5)));
      for (let j = 0; j < stack; j++) {
        const y = h - (j + rand() * 0.6) * stepLen * 1.3; if (y < base - 5) break;
        const snow = y > base + height * (row.snow?.above ?? 9) ? 1 : 0;
        pos.push(centre[0] + cx * (dist - j * 2), y, centre[1] + cz * (dist - j * 2));
        const down = j === 0 ? slope : slope + (rand() - 0.5) * 1.2; // the top strokes follow the ridge; lower ones run down the flank
        dir.push(-cz, j === 0 ? down : -0.8 - rand(), cx);
        data.push(rand() * 1000, stepLen * (1.2 + rand() * 0.7), snow, cl(lit + (rand() - 0.5) * 0.25 - j * 0.03));
      }
    }
    const idx = []; for (let i = 0; i < steps; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(strip, 3)); g.setAttribute('aLit', new THREE.Float32BufferAttribute(sp, 2)); g.setIndex(idx);
    const palGLSL = P.paletteGLSL('RG', pals);
    const under = new THREE.Mesh(g, new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms: S, side: THREE.DoubleSide, depthTest: false, depthWrite: false,
      vertexShader: `${P.COMMON}\nin vec2 aLit; out vec2 vLit; out vec3 vW; void main() { vLit = aLit; vW = position; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `${P.COMMON}\n${palGLSL}\nin vec2 vLit; in vec3 vW; layout(location = 0) out vec4 outC; void main() { int k = int(vLit.y + 0.5); vec3 c = paint3(RG_L[k], RG_M[k], RG_S[k], vLit.x, 0.5) * 0.94; outC = vec4(mix(c, airColour(normalize(vW - cameraPosition)), ${f(haze)}), 1.0); }`,
    }));
    under.frustumCulled = false; under.renderOrder = -20 + ri * 2; group.add(under);
    const n = data.length / 4;
    group.add(P.dabMesh(P.dabGeometry(n, { aPos: [new Float32Array(pos), 3], aDir: [new Float32Array(dir), 3], aData: [new Float32Array(data), 4] }), P.dabMaterial(S, {
      head: `in vec3 aPos; in vec3 aDir; in vec4 aData;\n${palGLSL}`,
      body: /* glsl */ `
        void makeDab(inout Dab d) {
          vec4 r = hash4(aData.x);
          int k = int(aData.z + 0.5);
          vec3 c = jitter(paint3(RG_L[k], RG_M[k], RG_S[k], aData.w, r.x), r.yzw, 0.35);
          vec3 air = airColour(normalize(aPos - cameraPosition));
          d.pos = aPos; d.dir = aDir; d.size = vec2(aData.y, aData.y * (1.8 + r.y));
          d.c1 = mix(c, air, ${f(haze)}); d.c2 = mix(jitter(c * 1.12, r.wxy, 0.4), air, ${f(haze)}); d.seed = aData.x; d.lift = 0.0; d.turnabout = 1.0;
        }`,
      minPx: [6, 12], maxPx: [4000, 4000], cells: [0, 4], depthTest: false, depthWrite: false, relief: 0.45,
    }), -19 + ri * 2));
    total += n;
  });
  return { name: 'ranges', group, count: total, drawn: () => total };
}

// ---------------------------------------------------------------------------------------------------------- ground
const COVERS = (covers) => {
  const pals = [], off = [], num = [];
  for (const c of covers) { off.push(pals.length); num.push(c.pals.length); pals.push(...c.pals); }
  while (off.length < 4) { off.push(0); num.push(covers[0].pals.length); }
  return P.paletteGLSL('GR', pals) + iarr('GR_OFF', off) + iarr('GR_N', num) + /* glsl */ `
    const int NC = ${covers.length};
    // r: this dab's own chances; m: the land's masks
    int coverOf(vec3 r, vec4 m) {
      if (NC > 1 && r.x < m.r * 0.92) return 1;
      if (NC > 2 && r.y < m.g) return 2;
      if (NC > 3 && r.z < m.b) return 3;
      return 0;
    }
    // v drifts slowly over the ground, so strokes of one colour lie together
    vec3 groundPaint(int cover, float v, float lit, float r) {
      int k = GR_OFF[cover] + int(floor(fract(v) * float(GR_N[cover]) * 0.999));
      return paint3(GR_L[k], GR_M[k], GR_S[k], lit, r);
    }`;
};
/** covers: [{ pals: [pal, …] }] — the base, then one for each of the land map's r, g, b (r is the way by convention).
 *  size: a dab in finest squares [across, along]; patch: how large the drifts of one colour are, metres; sunny: how
 *  fully a level ground takes a low sun; wet: now and then a dab in the shade gives back this colour (the sky). */
export function ground(W, { covers, size = [1.05, 1.7], per = 3, n = 160, cell0 = 0.14, levels = 6, patch = 13, sunny = 2.4, wet = null, rough = 0.5 } = {}) {
  const S = W.shared, group = new THREE.Group(), head = COVERS(covers);
  per = count(W, per);
  const rings = P.groundRings(S, {
    head, per, n, cell0, levels, minPx: [5, 9], maxPx: [4000, 4000], cells: [0, 8], tall: 1,
    body: /* glsl */ `
      void makeDab(inout Dab d) {
        vec2 cell; float sub;
        if (!ringCell(0.0, true, cell, sub)) { d.alive = 0.0; return; }
        vec4 r = hash4(cell, sub * 3.0 + 1.0);
        vec4 q = hash4(cell + 31.7, sub + 11.0);
        vec2 xz = (cell + r.xy) * uCell0;
        float lod;
        d.alive = ringGrow(distance(xz, cameraPosition.xz), lod);
        if (d.alive <= 0.0) return;
        vec4 land = texture(tHeight, landUv(xz));
        vec3 P = vec3(xz.x, land.r, xz.y);
        if (unseen(P, uCell0 * 4.0 * lod)) { d.alive = 0.0; return; }
        vec3 Nn = slopeOf(land);
        vec4 m = landAt(xz);
        float lit = ovc(stillSunAt(P + vec3(0.0, 0.2, 0.0)) * clamp(dot(Nn, uSunDir) * ${f(sunny)}, 0.0, 1.0), P);
        vec4 nz = texture(tNoise, xz / ${f(patch)});
        float drift = nz.r * 1.9 + nz.g * 0.5;
        vec3 c1 = groundPaint(coverOf(q.xyz, m), drift + (q.z - 0.5) * 0.3, lit, q.y);
        vec3 c2 = groundPaint(coverOf(q.zwx, m), drift + 0.2 + (q.w - 0.5) * 0.5, lit, q.w);
        ${wet ? `if (lit < 0.2 && q.w > 0.93) c1 = mix(${v3(wet)}, c1 * 0.5, q.z * 0.6);` : ''}
        c1 = jitter(c1, r.wzy, ${f(rough)});
        c2 = jitter(c2, q.wzy, ${f(rough)});
        // strokes lie any way round, though those laid together lie much alike
        float a = (nz.a * 2.4 + nz.b * 1.3 + q.y * 0.8) * TAU;
        d.dir = vec3(cos(a), 0.0, sin(a));
        d.pos = P;
        d.size = uCell0 * vec2(${f(size[0])} + 0.5 * r.z, ${f(size[1])} + 0.9 * r.w) * lod;
        d.c1 = hazed(c1, P);
        d.c2 = hazed(c2, P);
        d.seed = dot(cell, vec2(1.0, 57.0)) + sub * 0.37;
        d.turnabout = 1.0;
        d.lie = 1.0;
        d.nrm = Nn;
        d.height = (0.03 + 0.07 * q.z) * pow(lod, 0.35);
        d.glaze = 1.0;
      }`,
  });
  group.add(rings.group);
  // under the carpet: the land itself in flat paint, out past the edge of the map
  const e = W.extent, seg = 96, pos = [], idx = [], far = e * 12;
  for (let j = 0; j <= seg; j++) for (let i = 0; i <= seg; i++) {
    let x = -e + (2 * e * i) / seg, z = -e + (2 * e * j) / seg; const y = W.groundAt(x, z);
    if (i === 0) x = -far; if (i === seg) x = far; if (j === 0) z = -far; if (j === seg) z = far;
    pos.push(x, y, z);
  }
  for (let j = 0; j < seg; j++) for (let i = 0; i < seg; i++) { const a = i + j * (seg + 1); idx.push(a, a + seg + 1, a + 1, a + 1, a + seg + 1, a + seg + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const under = new THREE.Mesh(g, new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms: S,
    vertexShader: `${P.COMMON}\nout vec3 vW; void main() { vW = position; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `${P.COMMON}\n${head}
      in vec3 vW; layout(location = 0) out vec4 outC;
      void main() {
        vec2 xz = vW.xz; vec4 m = landAt(xz); vec3 Nn = normalAt(xz);
        float lit = ovc(stillSunAt(vW + vec3(0.0, 0.2, 0.0)) * clamp(dot(Nn, uSunDir) * ${f(sunny)}, 0.0, 1.0), vW);
        vec4 nz = texture(tNoise, xz / ${f(patch)}), gr = texture(tNoise, xz * 0.9);
        float drift = nz.r * 1.9 + nz.g * 0.5, g = gr.b;
        vec3 c = groundPaint(coverOf(gr.bar, m), drift, lit, g) * (0.74 + 0.2 * g);
        outC = vec4(gradeC(hazed(c, vW), vW), 1.0);
      }`,
  }));
  under.frustumCulled = false; under.renderOrder = 1; group.add(under);
  return { name: 'ground', group, count: rings.count, follow: (c, fr, w) => rings.follow(c.position.x, c.position.z, fr, (x, z) => w.groundAt(x, z)), drawn: () => rings.drawn };
}

// ---------------------------------------------------------------------------------------------------------- growth
/** kinds (up to 8): { pal, tall: [least, most] m, wide (m), fan (how far the strokes of a clump lean out: 0.2 grass,
 *  1.5 fern), mark: 'blade' | 'frond' | 'dab', share (how common), mask: 'r' | 'g' | 'b' | 'a' (only where that mask
 *  is, '!r' only where it is not), drifts 0..1 (grows in drifts rather than evenly), head: { pal, size } (a flower) }.
 *  density: the chance a square holds a clump; offWay: keeps off the way (the r mask). */
export function growth(W, { kinds, per = 6, n = 96, cell0 = 0.42, levels = 4, density = 0.6, offWay = 1, name = 'growth' } = {}) {
  const S = W.shared, K = kinds.length, total = kinds.reduce((a, k) => a + (k.share ?? 1), 0);
  per = count(W, per, 2);
  let acc = 0;
  const cum = kinds.map((k) => (acc += (k.share ?? 1) / total)), ch = { r: 0, g: 1, b: 2, a: 3 };
  const mark = (k) => ({ blade: [0, 3], frond: [3, 1], curl: [7, 1], dab: [4, 2] }[k.mark || 'blade']);
  const head = P.paletteGLSL('GW', kinds.map((k) => k.pal)) + P.paletteGLSL('GH', kinds.map((k) => (k.head ? k.head.pal : k.pal)))
    + farr('GW_CUM', cum) + farr('GW_T0', kinds.map((k) => k.tall[0])) + farr('GW_T1', kinds.map((k) => k.tall[1])) + farr('GW_WIDE', kinds.map((k) => k.wide ?? 0.05))
    + farr('GW_FAN', kinds.map((k) => k.fan ?? 0.3)) + farr('GW_CELL', kinds.map((k) => mark(k)[0])) + farr('GW_CELLN', kinds.map((k) => mark(k)[1]))
    + iarr('GW_MASK', kinds.map((k) => (k.mask ? ch[k.mask.replace('!', '')] : -1))) + farr('GW_INV', kinds.map((k) => (k.mask?.startsWith('!') ? 1 : 0)))
    + farr('GW_DRIFT', kinds.map((k) => k.drifts ?? 0.6)) + farr('GW_HEAD', kinds.map((k) => (k.head ? k.head.size : 0))) + farr('GW_STIFF', kinds.map((k) => k.stiff ?? 0));
  const rings = P.groundRings(S, {
    head, per, n, cell0, levels, minPx: [2.5, 12], maxPx: [60, 420], cells: [0, 4], tall: Math.max(...kinds.map((k) => k.tall[1])) + 1,
    body: /* glsl */ `
      void makeDab(inout Dab d) {
        vec2 cell; float sub;
        if (!ringCell(40.0, false, cell, sub)) { d.alive = 0.0; return; }
        vec4 r = hash4(cell, 40.0);
        vec4 q = hash4(cell + 17.3, 51.0);
        vec4 f = hash4(cell + sub * 7.7 + 3.1, sub * 13.0 + 3.0);
        vec2 foot = (cell + r.xy) * uCell0;
        float lod;
        d.alive = ringGrow(distance(foot, cameraPosition.xz), lod) * (1.0 - smoothstep(45.0, 95.0, uEyeH));
        if (d.alive <= 0.0) return;
        if (unseen(vec3(foot.x, uFocus.y, foot.y), 3.0 + abs(heightAt(foot) - uFocus.y))) { d.alive = 0.0; return; }
        float LIFE = lifeAt(foot);
        vec4 m = landAt(foot);
        int k = 0;
        for (int i = 0; i < ${K - 1}; i++) if (q.y > GW_CUM[i]) k = i + 1;
        float where = GW_MASK[k] < 0 ? 1.0 : m[GW_MASK[k]];
        where = mix(where, 1.0 - where, GW_INV[k]);
        float drift = mix(1.0, smoothstep(0.46, 0.7, texture(tNoise, foot / 37.0 + float(k) * 0.37).a) * 1.3, GW_DRIFT[k]);
        if (q.x > ${f(density)} * where * drift * (1.0 - m.r * ${f(offWay)})) { d.alive = 0.0; return; }
        float big = min(pow(lod, 0.6), 2.2);
        float fanK = GW_FAN[k];
        float a = (sub + f.x) / ${f(per)} * TAU + r.z * TAU;
        vec2 fan = vec2(cos(a), sin(a));
        vec2 xz = foot + fan * mix(0.03, 0.1, min(fanK, 1.0)) * big;
        vec3 P = vec3(xz.x, heightAt(xz), xz.y);
        float gust = gustAt(xz);
        float lit = sunAt(P + vec3(0.0, 0.3, 0.0));
        float tall = mix(GW_T0[k], GW_T1[k], f.z) * mix(0.62, 1.0, LIFE);
        float sway = sin(uTime * (1.6 + f.z) + f.w * 40.0) * (0.04 + 0.1 * gust);
        vec2 lean = fan * fanK * (0.4 + 0.9 * f.y) + uWind.xy * (0.08 + 0.6 * gust + sway) * (1.0 - GW_STIFF[k]) * mix(0.35, 1.0, LIFE);
        lean += uLean.xy * uLean.z * LIFE * (0.6 + 0.6 * f.y) * (1.0 - GW_STIFF[k] * 0.5) + fan * (1.0 - LIFE) * 0.55;   // toward the light; slumped where life has gone
        vec3 up = normalize(vec3(lean.x, 1.0, lean.y));
        if (GW_HEAD[k] > 0.0 && sub < 0.5) {
          // the flower: one pressed dab at the top of its stem
          vec3 c = jitter(paint3(GH_L[k], GH_M[k], GH_S[k], 0.3 + 0.7 * lit, f.w), f.zwx, 0.4);
          vec3 T = P + up * tall * (0.85 + 0.3 * f.x);
          d.pos = T; d.dir = vec3(fan.x, 0.3, fan.y);
          d.size = vec2(GW_HEAD[k]) * (0.75 + 0.5 * f.y) * big;
          d.cell = 4.0 + floor(f.x * 1.99);
          d.c1 = hazed(c, T); d.c2 = hazed(jitter(c * 1.15, f.xzy, 0.5), T);
          d.seed = dot(cell, vec2(1.0, 57.0)) + 0.25; d.lift = 0.9;
          return;
        }
        vec3 c = jitter(paint3(GW_L[k], GW_M[k], GW_S[k], lit, f.w), f.zwx, 0.55);
        d.dir = up;
        d.pos = P - vec3(0.0, 0.02, 0.0);
        d.size = vec2(GW_WIDE[k] * big * (0.8 + 0.5 * f.x), tall);
        d.cell = GW_CELL[k] + floor(f.y * GW_CELLN[k] * 0.999);
        d.c1 = hazed(c, P);
        d.c2 = hazed(jitter(c * 1.2, f.xzy, 0.8), P);
        d.seed = dot(cell, vec2(1.0, 57.0)) + sub * 0.37 + 0.5;
        d.base = 1.0;
        d.lift = 0.25;
      }`,
  });
  return { name, group: rings.group, count: rings.count, follow: (c, fr, w) => rings.follow(c.position.x, c.position.z, fr, (x, z) => w.groundAt(x, z)), drawn: () => rings.drawn };
}

// ----------------------------------------------------------------------------------------------------------- trees
function tube(out, pts, radii, sides, pal) { // a tapered pipe through pts; the frame is carried along it, which keeps it from twisting
  const base = out.position.length / 3, t = new THREE.Vector3(), n = new THREE.Vector3(), b = new THREE.Vector3(), p = new THREE.Vector3();
  let ref = new THREE.Vector3(1, 0, 0.3).normalize();
  for (let i = 0; i < pts.length; i++) {
    t.copy(pts[Math.min(i + 1, pts.length - 1)]).sub(pts[Math.max(i - 1, 0)]).normalize();
    n.copy(ref).addScaledVector(t, -ref.dot(t)).normalize(); ref = n.clone(); b.crossVectors(t, n);
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a);
      p.copy(pts[i]).addScaledVector(n, dx * radii[i]).addScaledVector(b, dy * radii[i]);
      out.position.push(p.x, p.y, p.z); out.normal.push(n.x * dx + b.x * dy, n.y * dx + b.y * dy, n.z * dx + b.z * dy); out.pal.push(pal);
    }
  }
  for (let i = 0; i < pts.length - 1; i++) for (let s = 0; s < sides; s++) { const a = base + i * sides + s, c = base + i * sides + ((s + 1) % sides); out.index.push(a, c, a + sides, c, c + sides, a + sides); }
}
const range = (v, rand) => (Array.isArray(v) ? lerp(v[0], v[1], rand()) : v);

/** kinds: { name: { trunk: { pal, r, h, bark: 'long' | 'band', lean, scar: colour, moss: colour },
 *                    crown: { shape: 'round' | 'column' | 'cone' | 'flat' | 'bare', pals: [pal, …], spread, from (where up
 *                             the trunk it starts, 0..1), leaf (a touch, in lobe radii), dense (dabs a lobe), limbs,
 *                             dark: colour of its inside, shade (how solid a shadow it casts, 0..1), through (how much
 *                             a leaf glows with the sun behind it) } } }
 *  at: [{ x, z, kind, scale, hero }]; scatter: { grid (metres), fill 0..1, kind(x, z, rand) → name or null, offWay (m), reach (m from the way) }.
 *  tiers: [full, some] metres from the way: trees near it are painted in full, those behind with fewer, larger touches. */
export function trees(W, { kinds, at = [], scatter = null, tiers = [34, 80], seed = 4471, sway = 1, name = 'trees' } = {}) {
  const S = W.shared, names = Object.keys(kinds), rand = rng(seed), list = [];
  const leafPals = [], barkPals = [], off = {};
  names.forEach((nm, i) => { const k = kinds[nm]; k.i = i; off[nm] = leafPals.length; leafPals.push(...(k.crown.pals?.length ? k.crown.pals : [k.trunk.pal])); barkPals.push(k.trunk.pal); });
  const plant = (x, z, nm, scale = 1, hero = false) => {
    const k = kinds[nm]; if (!k) return;
    const wd = W.wayDist(x, z), tier = hero || wd < tiers[0] ? 0 : wd < tiers[1] ? 1 : 2, np = k.crown.pals?.length || 1;
    list.push({ x, z, y: W.groundAt(x, z), k, nm, tier, hero, r: range(k.trunk.r ?? [0.25, 0.5], rand) * scale, h: range(k.trunk.h ?? [14, 20], rand) * scale, spread: range(k.crown.spread ?? [4, 6], rand) * scale,
      family: off[nm] + (rand() < 0.7 ? 0 : Math.floor(rand() * np)), seed: rand() * 1000, lean: [(rand() - 0.5) * (k.trunk.lean ?? 0.09), (rand() - 0.5) * (k.trunk.lean ?? 0.09)] });
  };
  if (scatter) {
    const G = scatter.grid || 7, e = W.extent * 0.96, reach = scatter.reach ?? 1e9;
    for (let gz = Math.ceil(-e / G); gz * G < e; gz++) for (let gx = Math.ceil(-e / G); gx * G < e; gx++) {
      const x = (gx + 0.15 + rand() * 0.7) * G, z = (gz + 0.15 + rand() * 0.7) * G;
      if (rand() > (scatter.fill ?? 0.8)) continue;
      const wd = W.wayDist(x, z); if (wd < (scatter.offWay ?? 2.7) || wd > reach) continue;
      const nm = scatter.kind ? scatter.kind(x, z, rand, wd) : names[0]; if (nm) plant(x, z, nm, 1 + (rand() - 0.5) * (scatter.vary ?? 0.2));
    }
  }
  for (const t of at) plant(t.x, t.z, t.kind || names[0], t.scale ?? 1, t.hero ?? false);

  const wood = { position: [], normal: [], pal: [], index: [] };
  const bark = [], leaf = [], lobes = [], colliders = [], v = new THREE.Vector3();
  for (const t of list) {
    const k = t.k, cr = k.crown, shape = cr.shape || 'round', full = t.tier === 0, some = t.tier === 1, band = k.trunk.bark === 'band';
    const top = t.h * (shape === 'round' || shape === 'flat' ? 0.8 : 0.97);
    const rings = full ? 9 : some ? 5 : 3, pts = [], radii = [];
    for (let i = 0; i < rings; i++) {
      const u = i / (rings - 1), y = u * u * 0.4 + u * 0.6, bend = Math.sin(u * 2.4 + t.seed) * 0.25;
      pts.push(new THREE.Vector3(t.x + t.lean[0] * y * top + bend * t.lean[1] * 8, t.y - 0.3 + y * (top + 0.3), t.z + t.lean[1] * y * top - bend * t.lean[0] * 8));
      radii.push(t.r * (1 - (shape === 'cone' || shape === 'column' ? 0.85 : 0.6) * y) * (1 + 0.5 * Math.exp(-(y * top) / (0.35 + t.r * 0.6))));
    }
    tube(wood, pts, radii, full ? 9 : some ? 7 : 5, k.i);
    const trunkAt = (y, outP) => { // the trunk's middle and radius at a height above its foot
      let i = 0; while (i < rings - 2 && pts[i + 1].y - t.y < y) i++;
      const kk = cl((y - (pts[i].y - t.y)) / (pts[i + 1].y - pts[i].y)); outP.lerpVectors(pts[i], pts[i + 1], kk);
      return radii[i] + (radii[i + 1] - radii[i]) * kk;
    };
    if (full) colliders.push({ x: t.x, z: t.z, r: t.r * 1.15 });
    const crown = new THREE.Vector3(t.x + t.lean[0] * top, t.y + t.h * (t.hero ? 0.7 : 0.8), t.z + t.lean[1] * top), spread = t.spread, tl = [];
    const twig = (at, dir, len, w) => bark.push(at.x, at.y, at.z, dir.x, dir.y, dir.z, -dir.z, 0.3, dir.x, rand() * 1000, w, k.i, len);
    if (shape === 'round' || shape === 'flat' || shape === 'bare') {
      const flat = shape === 'flat', bare = shape === 'bare';
      if (full) {
        const limbs = Math.round(range(cr.limbs ?? [5, 7], rand) * (t.hero ? 1.5 : 1));
        for (let i = 0; i < limbs; i++) {
          const a = (i / limbs) * Math.PI * 2 + rand() * 1.2, from = top * (flat ? 0.7 + 0.25 * (i / limbs) : (cr.from ?? 0.48) + (0.93 - (cr.from ?? 0.48)) * (i / limbs));
          const p0 = new THREE.Vector3(), r0 = trunkAt(from, p0), tilt = flat ? 1.0 + rand() * 0.35 : 0.45 + rand() * 0.45;
          const len = (spread / Math.sin(tilt)) * (0.7 + rand() * 0.4) * (1 - 0.35 * (i / limbs)), out = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
          const p2 = p0.clone().addScaledVector(out, len * Math.sin(tilt)).add(new THREE.Vector3(0, len * Math.cos(tilt), 0));
          const p1 = p0.clone().lerp(p2, 0.45).add(new THREE.Vector3(0, -len * 0.1, 0)).addScaledVector(out, len * 0.12), lp = [], lr = [];
          for (let j = 0; j <= 5; j++) { const u = j / 5, w = 1 - u; lp.push(new THREE.Vector3().addScaledVector(p0, w * w).addScaledVector(p1, 2 * w * u).addScaledVector(p2, u * u)); lr.push(Math.max(0.035, r0 * 0.5 * (1 - 0.82 * u))); }
          tube(wood, lp, lr, 6, k.i);
          for (let j = 0; j < (bare ? 16 : cr.twigs ?? 6); j++) { // dark strokes for the limb and the branches off it
            const u = 0.15 + rand() * 0.8, seg = Math.min(4, Math.floor(u * 5)), dir = lp[seg + 1].clone().sub(lp[seg]).normalize(), pos = lp[seg].clone().lerp(lp[seg + 1], u * 5 - seg), tw = rand() < (bare ? 0.8 : 0.55);
            if (tw) { dir.add(v.set(rand() - 0.5, rand() * 0.6, rand() - 0.5).multiplyScalar(1.5)).normalize(); pos.addScaledVector(dir, 0.8); }
            twig(pos, dir, tw ? 1.7 + rand() * 1.5 : 1.6, tw ? 0.09 : lr[seg] * 2.4);
          }
          if (!bare) for (const u of t.hero ? [0.5, 0.68, 0.86, 1.02] : [0.7, 1.0]) {
            const w = 1 - u, c = new THREE.Vector3().addScaledVector(p0, w * w).addScaledVector(p1, 2 * w * u).addScaledVector(p2, u * u);
            c.add(v.set(rand() - 0.5, rand() * (flat ? 0.3 : 0.9), rand() - 0.5).multiplyScalar(1.6));
            tl.push([c.x, c.y, c.z, (t.hero ? 2.1 : 1.25) * (spread / 5) + rand() * 1.0 + t.r * 0.6]);
          }
        }
        if (!bare) for (let i = 0; i < (t.hero ? 7 : 3); i++) tl.push([crown.x + (rand() - 0.5) * spread * 0.9, t.y + t.h * (flat ? 0.9 : 0.96) + (rand() - 0.5) * (flat ? 1 : 3), crown.z + (rand() - 0.5) * spread * 0.9, (1.5 + rand() * 0.9) * (spread / 5)]);
      } else if (!bare) {
        for (let i = 0, nn = some ? 7 : 4; i < nn; i++) { const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * spread; tl.push([crown.x + Math.cos(a) * d, crown.y + (rand() - 0.45) * t.h * (flat ? 0.08 : 0.3), crown.z + Math.sin(a) * d, ((some ? 2.3 : 3.4) + rand() * 1.2) * (spread / 5)]); }
        if (cr.twigs) for (let i = 0; i < (some ? 9 : 5); i++) { const a = rand() * 6.28, dir = new THREE.Vector3(Math.cos(a) * 0.65, 0.75, Math.sin(a) * 0.65).normalize(), p = new THREE.Vector3(); trunkAt(top * (0.45 + rand() * 0.4), p); twig(p.addScaledVector(dir, spread * 0.3), dir, spread * (0.6 + rand() * 0.5), some ? 0.13 : 0.2); }
      } else for (let i = 0; i < (some ? 6 : 3); i++) { const a = rand() * 6.28, dir = new THREE.Vector3(Math.cos(a) * 0.6, 0.8, Math.sin(a) * 0.6).normalize(), p = new THREE.Vector3(); trunkAt(top * (0.5 + rand() * 0.4), p); twig(p.addScaledVector(dir, spread * 0.4), dir, spread * 0.9, 0.16); }
    } else {
      // a cone (spruce, fir) or a column (poplar, cypress): rings of lobes up the trunk
      const from = cr.from ?? (shape === 'cone' ? 0.16 : 0.12), tiersN = full ? (shape === 'cone' ? 7 : 8) : some ? 4 : 3;
      for (let i = 0; i < tiersN; i++) {
        const u = i / (tiersN - 1 || 1), y = t.h * (from + (1 - from) * u * 0.96), p = new THREE.Vector3();
        trunkAt(Math.min(y, top), p);
        const rad = shape === 'cone' ? spread * (1 - u * 0.93) : spread * (0.55 + 0.45 * Math.sin(Math.PI * (0.12 + 0.8 * u))) * (1 - 0.5 * u * u);
        const lr = Math.max(0.5, shape === 'cone' ? rad * 0.62 + 0.3 : rad * 0.7), around = full ? Math.max(3, Math.round((rad * 4.2) / lr)) : 2;
        for (let j = 0; j < around; j++) { const a = (j / around) * 6.283 + i * 1.7 + rand() * 0.5, d = Math.max(0, rad - lr * 0.55); tl.push([p.x + Math.cos(a) * d, t.y + y + (rand() - 0.5) * 0.4, p.z + Math.sin(a) * d, lr * (0.85 + rand() * 0.3)]); }
      }
    }
    const droop = shape === 'cone' ? 2 : 0, perLobe = Math.max(4, Math.round((cr.dense ?? 54) * (full ? (t.hero ? 2.4 : 1) : some ? 0.38 : 0.2) * W.q)), touch = (cr.leaf ?? 0.27) * (full ? (t.hero ? 0.8 : 1) : 1.5);
    for (const [lx, ly, lz, lr] of tl) {
      lobes.push(lx, ly, lz, lr * (cr.shade ?? 0.36));
      const away = v.set(lx - crown.x, ly - crown.y, lz - crown.z).normalize().clone();
      for (let j = 0; j < perLobe; j++) {
        const d = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize().addScaledVector(away, 0.5).add(new THREE.Vector3(0, 0.15, 0)).normalize(), reach = lr * (0.72 + rand() * 0.4);
        const px = lx + d.x * reach, py = ly + d.y * reach, pz = lz + d.z * reach, nn = d.multiplyScalar(0.6).addScaledVector(v.set(px - crown.x, py - crown.y, pz - crown.z).normalize(), 0.55).normalize();
        // a tree is mostly one colour, with a branch here and there that has turned ahead of the rest
        const family = rand() < 0.14 ? off[t.nm] + Math.floor(rand() * (cr.pals?.length || 1)) : t.family;
        leaf.push(px, py, pz, nn.x, nn.y, nn.z, rand() * 1000, lr * touch * (1 + rand() * 0.6), family, droop);
      }
      for (let j = 0; j < 2; j++) leaf.push(lx + (rand() - 0.5) * lr * 0.5, ly - lr * 0.15 * j, lz + (rand() - 0.5) * lr * 0.5, 0, -1, 0, rand() * 1000, lr * 1.25, t.family, 1); // the dark of the inside of the lobe, laid first
    }
    const marks = full ? Math.round((110 + t.r * 150) * Math.min(1, W.q + 0.3)) : some ? 30 : 0, barkTop = Math.min(top, full ? 14 : 18);
    for (let j = 0; j < marks; j++) {
      const y = Math.pow(rand(), 1.3) * barkTop, a = rand() * Math.PI * 2, p = new THREE.Vector3(), r = trunkAt(y, p), nx = Math.cos(a), nz = Math.sin(a);
      bark.push(p.x + nx * r, p.y, p.z + nz * r, t.lean[0], 1, t.lean[1], nx, 0, nz, rand() * 1000, Math.min(0.5, r * (band ? 1.5 : 0.75)) * (some ? 1.5 : 1), k.i, (band ? Math.min(0.5, r * 2.3) : 1.0 + rand() * 1.5) * (some ? 1.6 : 1));
    }
  }

  const group = new THREE.Group();
  const wg = new THREE.BufferGeometry();
  wg.setAttribute('position', new THREE.Float32BufferAttribute(wood.position, 3)); wg.setAttribute('normal', new THREE.Float32BufferAttribute(wood.normal, 3));
  wg.setAttribute('aPal', new THREE.Float32BufferAttribute(wood.pal, 1)); wg.setIndex(wood.index);
  const woodMesh = new THREE.Mesh(wg, P.underpaint(S, barkPals, { dim: 0.86 })); woodMesh.frustumCulled = false; woodMesh.renderOrder = 1; group.add(woodMesh);

  const BARK = P.paletteGLSL('BK', barkPals) + farr('BK_BAND', names.map((nm) => (kinds[nm].trunk.bark === 'band' ? 1 : 0)))
    + `const vec3 BK_SCAR[${names.length}] = vec3[${names.length}](${names.map((nm) => v3(kinds[nm].trunk.scar || '#211c26')).join(', ')});\n`
    + `const vec4 BK_MOSS[${names.length}] = vec4[${names.length}](${names.map((nm) => `vec4(${rgb(kinds[nm].trunk.moss || '#57661f').map(f).join(', ')}, ${f(kinds[nm].trunk.moss === false ? 0 : 1)})`).join(', ')});\n`;
  const nb = bark.length / 13, bp = new Float32Array(nb * 3), bd = new Float32Array(nb * 3), bn = new Float32Array(nb * 3), bx = new Float32Array(nb * 4);
  for (let i = 0; i < nb; i++) { for (let j = 0; j < 3; j++) { bp[i * 3 + j] = bark[i * 13 + j]; bd[i * 3 + j] = bark[i * 13 + 3 + j]; bn[i * 3 + j] = bark[i * 13 + 6 + j]; } for (let j = 0; j < 4; j++) bx[i * 4 + j] = bark[i * 13 + 9 + j]; }
  const barkChunks = nb ? P.dabChunks(S, { count: nb, attributes: { aPos: [bp, 3], aDir: [bd, 3], aNrm: [bn, 3], aData: [bx, 4] } }, {
    head: BARK + 'in vec3 aPos; in vec3 aDir; in vec3 aNrm; in vec4 aData;',
    body: /* glsl */ `
      void makeDab(inout Dab d) {
        if (unseen(aPos, 2.0)) { d.alive = 0.0; return; }
        vec4 r = hash4(aData.x);
        int k = int(aData.z + 0.5);
        vec3 Nn = normalize(aNrm);
        float foot = aPos.y - heightAt(aPos.xz);
        // a trunk is lit as a round thing, and from below by the bright ground
        float lit = ovc(stillSunAt(aPos + Nn * 0.35) * clamp(dot(Nn, uSunDir) * 1.2 + 0.25, 0.0, 1.0), aPos);
        vec3 c = paint3(BK_L[k], BK_M[k], BK_S[k], lit, r.x);
        c += uBounce * (1.0 - lit) * exp(-foot * 0.45);
        d.dir = aDir;
        // banded bark runs across the trunk; here and there one of its scars
        if (BK_BAND[k] > 0.5) { d.dir = cross(aDir, Nn); if (r.y < 0.16) c = BK_SCAR[k]; }
        // moss on the cold side, low down
        else if (BK_MOSS[k].a > 0.5 && foot < 2.2 && r.z < 0.3 * (1.0 - foot / 2.2) + 0.1 * max(-dot(Nn, uSunDir), 0.0)) c = mix(c, BK_MOSS[k].rgb * (0.5 + 0.9 * lit), 0.8);
        // the cold light of the sky on the shaded side
        if (r.w > 0.9 && dot(Nn, uSunDir) < 0.0) c = mix(c, uHaze * 0.6, 0.5);
        c = jitter(c, r.yzw, 0.7);
        c += BK_A[k] * uLampCol * lampAt(aPos, Nn);
        d.turnabout = 1.0;
        d.pos = aPos;
        d.size = vec2(aData.y, aData.w);
        d.c1 = hazed(c, aPos);
        d.c2 = hazed(jitter(c * 1.2 + vec3(0.02, 0.02, 0.05), r.wxy, 0.6), aPos);
        d.seed = aData.x;
        d.lift = 0.5;
      }`,
    minPx: [3, 10], maxPx: [120, 500], cells: [0, 4],
  }, { order: 3, lod: { near: 40, far: 110, keep: 0.4 } }) : null;
  if (barkChunks) group.add(barkChunks.group);

  const through = Math.max(...names.map((nm) => kinds[nm].crown.through ?? 0.6)), dark = names.map((nm) => kinds[nm].crown.dark || '#1f1a2b');
  const nl = leaf.length / 10, lp = new Float32Array(nl * 3), ln = new Float32Array(nl * 3), lx = new Float32Array(nl * 4);
  for (let i = 0; i < nl; i++) { for (let j = 0; j < 3; j++) { lp[i * 3 + j] = leaf[i * 10 + j]; ln[i * 3 + j] = leaf[i * 10 + 3 + j]; } for (let j = 0; j < 4; j++) lx[i * 4 + j] = leaf[i * 10 + 6 + j]; }
  const leafChunks = nl ? P.dabChunks(S, { count: nl, attributes: { aPos: [lp, 3], aNrm: [ln, 3], aData: [lx, 4] }, first: (i) => lx[i * 4 + 3] === 1 }, {
    head: P.paletteGLSL('LF', leafPals) + `const vec3 LF_DARK = ${v3(dark[0])};\nin vec3 aPos; in vec3 aNrm; in vec4 aData;`,
    body: /* glsl */ `
      void makeDab(inout Dab d) {
        if (unseen(aPos, aData.y * 2.0 + 1.0)) { d.alive = 0.0; return; }
        vec4 r = hash4(aData.x);
        vec4 q = hash4(aData.x + 271.3);
        vec3 toEye = cameraPosition - aPos;
        float dist = length(toEye);
        bool core = aData.w > 0.5 && aData.w < 1.5;
        float gust = gustAt(aPos.xz);
        vec3 P = aPos;
        float high = clamp((P.y - heightAt(P.xz)) / 20.0, 0.1, 1.0) * ${f(sway)};
        P.xz += uWind.xy * (gust * 0.5 + sin(uTime * (1.1 + r.x) + r.y * 30.0) * (0.05 + 0.16 * gust)) * high;
        P.y += sin(uTime * (1.7 + r.z) + r.w * 30.0) * (0.03 + 0.1 * gust) * high;
        // A2: where life goes a leaf turns, then falls and lies; where it comes back it buds (grows in)
        float LL = lifeAt(aPos.xz), th = 0.18 + 0.8 * q.w, gone = clamp((th - LL) / 0.16, 0.0, 1.0);
        P.xz += uLean.xy * uLean.z * 0.18 * high * LL;
        float turnK = 0.0, fallK = 0.0;
        if (gone > 0.0) {
          if (uFallMode > 0.5 && !core) {
            turnK = min(gone / 0.3, 1.0); fallK = clamp((gone - 0.3) / 0.7, 0.0, 1.0);
            float g0 = heightAt(P.xz) + 0.04;
            P.xz += (r.xy - 0.5) * 3.0 * fallK + uWind.xy * fallK * 1.6 + vec2(sin(uTime * 2.3 + r.z * 40.0), cos(uTime * 1.9 + r.w * 40.0)) * 0.25 * fallK * (1.0 - fallK);
            P.y = mix(P.y, g0, fallK * fallK);
            d.alive = 1.0 - smoothstep(0.82, 1.0, fallK);
          } else d.alive = 1.0 - gone;
        }
        vec3 Nn = aNrm;
        vec3 view = -toEye / dist;
        int k = int(aData.z + 0.5);
        vec3 c;
        if (core) {
          c = mix(LF_S[k] * 0.8, LF_DARK, 0.3);
        } else {
          // a crown is never wholly dark: light comes down through all the leaves above it
          float sun = mix(0.5, 1.0, stillSunAt(P + Nn * 0.9));
          // a leaf with the sun behind it is a lamp: the light comes through it
          float through = pow(max(dot(view, uSunDir), 0.0), 2.0);
          float x = ovc(sun * clamp(0.55 + 0.45 * dot(Nn, uSunDir) + ${f(through)} * through, 0.0, 1.0), P);
          x *= mix(0.6, 1.0, smoothstep(-0.7, 0.1, Nn.y));
          c = paint3(LF_L[k], LF_M[k], LF_S[k], x, r.x);
          c = mix(c, LF_DARK, (1.0 - smoothstep(0.1, 0.4, x)) * 0.14);
          // turned in a gust, the pale back of the leaf
          if (q.x < gust * 0.3) c = mix(c, LF_L[k] * 1.08 + 0.06, 0.4 * sun);
          c += LF_A[k] * uLampCol * lampAt(P, Nn);
        }
        c = mix(c, mix(vec3(0.62, 0.42, 0.18), vec3(0.42, 0.3, 0.2), r.z) * (0.8 + 0.4 * r.x), turnK * 0.85);
        c = jitter(c, r.yzw, core ? 0.3 : 0.55);
        float turn = (q.y - 0.5) * 2.0 + sin(uTime * 3.0 + r.w * 50.0) * 0.5 * gust + fallK * (uTime * 4.0 + r.x * 9.0);
        vec3 round_ = cross(Nn, view);
        d.dir = dot(round_, round_) > 1e-4 ? normalize(round_) : vec3(0.0, 1.0, 0.0);
        // a conifer's needles hang: its strokes run out and down
        if (aData.w > 1.5) { d.dir = normalize(vec3(Nn.x, -0.75, Nn.z)); turn *= 0.25; }
        d.spin = turn;
        d.pos = P;
        d.size = vec2(aData.y, aData.y * (core ? 1.2 : 1.5 + 0.5 * q.z));
        d.c1 = hazed(c, P);
        d.c2 = hazed(jitter(c * 1.16, q.zxy, 0.7), P);
        d.seed = aData.x;
        d.lift = core ? -0.2 : 0.5;
        d.turnabout = 1.0;
      }`,
    minPx: [5, 8], maxPx: [96, 150], cells: [4, 2],
  }, { order: 4, lod: { near: 35, far: 130, keep: 0.3 }, pad: 12 }) : null;
  if (leafChunks) group.add(leafChunks.group);

  // what stands in the sun's way
  const shade = new THREE.Group(), black = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  shade.add(new THREE.Mesh(wg, black));
  if (lobes.length) {
    const balls = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), black, lobes.length / 4), m4 = new THREE.Matrix4();
    for (let i = 0; i < lobes.length / 4; i++) { const r = lobes[i * 4 + 3]; m4.makeScale(r, r * 0.8, r).setPosition(lobes[i * 4], lobes[i * 4 + 1], lobes[i * 4 + 2]); balls.setMatrixAt(i, m4); }
    balls.frustumCulled = false; shade.add(balls);
  }
  const chunks = [...(barkChunks?.chunks || []), ...(leafChunks?.chunks || [])];
  let stamp = 0; for (const c of chunks) { const prev = c.mesh.onBeforeRender; c.mesh.onBeforeRender = (...a) => { c.seen = stamp; prev(...a); }; }
  return { name, group, shade, colliders, list, count: nb + nl, counts: { trees: list.length, bark: nb, leaves: nl },
    follow: () => { stamp++; }, drawn: () => chunks.reduce((a, c) => a + (c.seen === stamp ? c.drawn : 0), 0) };
}

// ----------------------------------------------------------------------------------------------------------- solid
/** Shapes to build with. Each is a THREE.Mesh whose userData says how it is painted: pal (index into the solid's
 *  palettes), grain ('up' strokes run up the face · 'across' level · [x, y, z]), size [across, along], density. */
const shaped = (g, o = {}) => { const m = new THREE.Mesh(g); m.userData = { pal: o.pal || 0, grain: o.grain, size: o.size, density: o.density }; if (o.at) m.position.set(...o.at); if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; return m; };
export const shape = {
  box: (w, h, d, o) => shaped(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), o),
  cyl: (rTop, rBot, h, o = {}) => shaped(new THREE.CylinderGeometry(rTop, rBot, h, o.sides || 14, 1, !!o.open).translate(0, h / 2, 0), o),
  cone: (r, h, o = {}) => shaped(new THREE.ConeGeometry(r, h, o.sides || 14).translate(0, h / 2, 0), o),
  ball: (r, o = {}) => shaped(new THREE.SphereGeometry(r, 14, 10), o),
  /** a roof: a prism w wide, h high at the ridge, d long, the ridge along z */
  gable: (w, h, d, o) => { const g = new THREE.BufferGeometry(), x = w / 2, z = d / 2; g.setAttribute('position', new THREE.Float32BufferAttribute([-x, 0, -z, 0, h, -z, x, 0, -z, -x, 0, z, 0, h, z, x, 0, z], 3)); g.setIndex([0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2]); const flat = g.toNonIndexed(); flat.computeVertexNormals(); return shaped(flat, o); },
  /** a rounded stone: a ball pushed about by noise */
  boulder: (r, o = {}) => { const g = new THREE.IcosahedronGeometry(r, 2), p = g.attributes.position, s = o.seed || 1; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 0.72 + 0.5 * fbm(x / r + s, z / r + y / r, 3, s); p.setXYZ(i, x * k, y * k * (o.squash ?? 0.7), z * k); } g.computeVertexNormals(); return shaped(g, o); },
  /** any geometry of your own */
  of: (geometry, o) => shaped(geometry, o),
};
/** Paint on anything made of triangles. object: a Mesh, a Group or a list of them, placed in the world (W.groundAt for
 *  their y). pals: the palettes its meshes' userData.pal index. size: a stroke [across, along] m; density: strokes a m²;
 *  grain: the way strokes run unless a mesh says otherwise; collide: [{ x, z, r }] kept clear of the wanderer and the eye. */
export function solid(W, object, { pals, size = [0.16, 0.5], density = 14, grain = 'up', collide = [], cast = true, cells = [0, 4], rough = 0.5, name = 'solid', lift = null } = {}) {
  const S = W.shared, rand = rng(W.seed * 7 + 99), root = new THREE.Group();
  for (const o of Array.isArray(object) ? object : [object]) root.add(o);
  root.updateMatrixWorld(true);
  const position = [], normal = [], pala = [], pos = [], dir = [], nrm = [], data = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), p = new THREE.Vector3(), d = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  root.traverse((m) => {
    if (!m.isMesh) return;
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry, P3 = g.attributes.position, u = m.userData || {}, sz = u.size || size, gr = u.grain || grain, dens = (u.density || density) * W.q;
    const nm = new THREE.Matrix3().getNormalMatrix(m.matrixWorld);
    if (!g.attributes.normal) g.computeVertexNormals();
    for (let i = 0; i < P3.count; i += 3) {
      a.fromBufferAttribute(P3, i).applyMatrix4(m.matrixWorld); b.fromBufferAttribute(P3, i + 1).applyMatrix4(m.matrixWorld); c.fromBufferAttribute(P3, i + 2).applyMatrix4(m.matrixWorld);
      for (const [q, k] of [[a, i], [b, i + 1], [c, i + 2]]) { n.fromBufferAttribute(g.attributes.normal, k).applyMatrix3(nm).normalize(); position.push(q.x, q.y, q.z); normal.push(n.x, n.y, n.z); pala.push(u.pal || 0); }
      const fn = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)), area = fn.length() / 2; fn.normalize();
      let want = area * dens, k = Math.floor(want) + (rand() < want % 1 ? 1 : 0);
      for (; k > 0; k--) {
        let s = rand(), t = rand(); if (s + t > 1) { s = 1 - s; t = 1 - t; }
        p.copy(a).addScaledVector(d.subVectors(b, a), s).addScaledVector(d.subVectors(c, a), t);
        if (Array.isArray(gr)) d.set(...gr); else if (gr === 'across') d.crossVectors(fn, up); else d.copy(up);
        d.addScaledVector(fn, -d.dot(fn)); if (d.lengthSq() < 1e-4) d.set(1, 0, 0).addScaledVector(fn, -fn.x); d.normalize();
        pos.push(p.x, p.y, p.z); nrm.push(fn.x, fn.y, fn.z); dir.push(d.x, d.y, d.z); data.push(rand() * 1000, sz[0], u.pal || 0, sz[1]);
      }
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(position, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3)); g.setAttribute('aPal', new THREE.Float32BufferAttribute(pala, 1));
  const group = new THREE.Group(), under = new THREE.Mesh(g, P.underpaint(S, pals, { rigid: !!lift })); under.frustumCulled = false; under.renderOrder = 1; group.add(under);
  const nd = data.length / 4, LIFT = lift ? '(aPos + vec3(0.0, uLift, 0.0))' : 'aPos';
  const chunks = P.dabChunks(S, { count: nd, attributes: { aPos: [new Float32Array(pos), 3], aDir: [new Float32Array(dir), 3], aNrm: [new Float32Array(nrm), 3], aData: [new Float32Array(data), 4] } }, {
    head: P.paletteGLSL('SO', pals) + 'in vec3 aPos; in vec3 aDir; in vec3 aNrm; in vec4 aData;' + (lift ? 'uniform float uLift;' : ''),
    uniforms: lift ? { uLift: lift } : {},
    body: (/* glsl */ `
      void makeDab(inout Dab d) {
        vec4 r = hash4(aData.x);
        int k = int(aData.z + 0.5);
        vec3 Nn = normalize(aNrm);
        if (dot(Nn, cameraPosition - aPos) < 0.0 || unseen(aPos, 1.5)) { d.alive = 0.0; return; } // the far side of a wall
        float lit = ovc(sunAt(aPos + Nn * 0.3) * clamp(dot(Nn, uSunDir) * 1.2 + 0.25, 0.0, 1.0), aPos);
        vec3 c = paint3(SO_L[k], SO_M[k], SO_S[k], lit, r.x);
        c += uBounce * (1.0 - lit) * max(-Nn.y + 0.3, 0.0);
        if (r.w > 0.88 && dot(Nn, uSunDir) < 0.0) c = mix(c, uHaze * 0.6, 0.4); // the sky's cold light in the shade
        c = jitter(c, r.yzw, ${f(rough)});
        c += SO_A[k] * uLampCol * lampAt(aPos, Nn);
        d.pos = aPos; d.dir = aDir; d.size = vec2(aData.y, aData.w) * (0.8 + 0.5 * r.y);
        d.c1 = hazed(c, aPos); d.c2 = hazed(jitter(c * 1.18, r.wxy, 0.5), aPos);
        d.seed = aData.x; d.turnabout = 1.0; d.lie = 1.0; d.nrm = Nn; d.height = 0.012 + 0.04 * r.z;
      }`).replace(/\baPos\b/g, LIFT),
    minPx: [4, 8], maxPx: [300, 600], cells,
  }, { order: 3, lod: { near: 45, far: 160, keep: 0.35 }, cell: 24 });
  group.add(chunks.group);
  let stamp = 0; for (const ch of chunks.chunks) { const prev = ch.mesh.onBeforeRender; ch.mesh.onBeforeRender = (...x) => { ch.seen = stamp; prev(...x); }; }
  return { name, group, shade: cast ? new THREE.Mesh(g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })) : null, colliders: collide, count: nd,
    follow: () => { stamp++; if (lift) under.position.y = lift.value; }, drawn: () => chunks.chunks.reduce((s, ch) => s + (ch.seen === stamp ? ch.drawn : 0), 0) };
}

// ----------------------------------------------------------------------------------------------------------- water
/** A level of water wherever the land is below it. deep, sky (what it gives back, looked at low), shallow, glint: its
 *  colours; flow: [x, z] the way it runs; speed; stroke: [across, along] in finest squares. */
export function water(W, { level = 0, deep = '#27506b', sky: skyc = '#bcd3e0', shallow = '#6f9a8f', glint = '#fff6d8', flow = [1, 0.2], flowAt = null, speed = 0.35, stroke = [0.9, 2.6], per = 2, n = 96, cell0 = 0.5, levels = 7, name = 'water' } = {}) {
  const S = W.shared, group = new THREE.Group(), fl = new THREE.Vector2(...flow).normalize();
  per = count(W, per);
  const rings = P.groundRings(S, {
    per, n, cell0, levels, minPx: [5, 9], maxPx: [4000, 4000], cells: [0, 3], order: 2, tall: 1,
    body: /* glsl */ `
      const vec2 FLOW0 = vec2(${f(fl.x)}, ${f(fl.y)});
      ${flowAt ? `vec2 flowAt(vec2 p) { ${flowAt} }` : 'vec2 flowAt(vec2 p) { return FLOW0; }'}
      void makeDab(inout Dab d) {
        vec2 cell; float sub;
        if (!ringCell(70.0, true, cell, sub)) { d.alive = 0.0; return; }
        vec4 r = hash4(cell, sub * 3.0 + 71.0);
        vec2 xz = (cell + r.xy) * uCell0;
        float lod;
        d.alive = ringGrow(distance(xz, cameraPosition.xz), lod);
        if (d.alive <= 0.0) return;
        vec3 P = vec3(xz.x, ${f(level)}, xz.y);
        if (unseen(P, uCell0 * 5.0 * lod)) { d.alive = 0.0; return; }
        float depth = ${f(level)} - heightAt(xz);
        if (depth < 0.02) { d.alive = 0.0; return; }
        vec2 FLOW = flowAt(xz);
        vec3 view = normalize(P - cameraPosition);
        // ripples: slow bands that travel with the flow
        float rip = texture(tNoise, (xz + FLOW * uTime * ${f(speed)}) / 9.0).r * 0.6 + texture(tNoise, (xz * vec2(1.0, 2.3) - FLOW * uTime * ${f(speed * 0.6)}) / 3.1).g * 0.4;
        float low = pow(1.0 - max(-view.y, 0.0), 3.0);
        vec3 mirror = reflect(view, normalize(vec3((rip - 0.5) * 0.5, 1.0, (r.z - 0.5) * 0.3)));
        float lit = stillSunAt(P + vec3(0.0, 0.3, 0.0));
        float spark = pow(max(dot(mirror, uSunDir), 0.0), 24.0) * lit * lightAt(xz);
        vec3 c = mix(${v3(deep)}, ${v3(skyc)}, clamp(0.16 + low * 0.72 + (rip - 0.5) * 0.8, 0.0, 1.0));
        c = mix(c, ${v3(shallow)}, smoothstep(0.7, 0.0, depth) * 0.6);
        c *= mix(0.72, 1.0, lit);
        c = mix(c, ${v3(glint)}, clamp(spark * 2.2 + step(0.975, r.w + spark * 0.4) * lit * lightAt(xz), 0.0, 1.0));
        c = jitter(c, r.wzy, 0.3);
        float a = atan(FLOW.y, FLOW.x) + (texture(tNoise, xz / 17.0).a - 0.5) * 0.9;
        d.dir = vec3(cos(a), 0.0, sin(a));
        d.pos = P;
        d.size = uCell0 * vec2(${f(stroke[0])} + 0.4 * r.z, ${f(stroke[1])} + 1.6 * r.w) * lod;
        d.c1 = hazed(c, P);
        d.c2 = hazed(mix(c, ${v3(skyc)}, 0.35), P);
        d.seed = dot(cell, vec2(1.0, 57.0)) + sub * 0.37 + 0.7;
        d.lie = 1.0; d.nrm = vec3(0.0, 1.0, 0.0); d.height = (0.01 + 0.03 * r.y) * pow(lod, 0.35); d.turnabout = 1.0; d.glaze = 1.0;
      }`,
  });
  group.add(rings.group);
  const far = W.extent * 14, plane = new THREE.Mesh(new THREE.PlaneGeometry(far * 2, far * 2).rotateX(-Math.PI / 2).translate(0, level - 0.03, 0), new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms: S,
    vertexShader: `${P.COMMON}\nout vec3 vW; void main() { vW = position; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `${P.COMMON}\nin vec3 vW; layout(location = 0) out vec4 outC; void main() { vec3 view = normalize(vW - cameraPosition); float low = pow(1.0 - max(-view.y, 0.0), 3.0); vec3 c = mix(${v3(deep)}, ${v3(skyc)}, low * 0.85) * 0.94; outC = vec4(hazed(c, vW), 1.0); }`,
  }));
  plane.frustumCulled = false; plane.renderOrder = 1; group.add(plane);
  return { name, group, count: rings.count, level, follow: (c, fr) => rings.follow(c.position.x, c.position.z, fr, () => level), drawn: () => rings.drawn };
}

// ---------------------------------------------------------------------------------------------------------- flecks
/** What falls or drifts in the air round the wanderer: pals, size [across, along] m, box [w, h, d] m, fall (m/s, negative
 *  rises), drift (how far the wind carries it, m/s), sway (m), spin (turns of tumbling). */
export function flecks(W, { n = 500, pals, size = [0.1, 0.16], box = [44, 16, 44], fall = 0.9, drift = 1.2, sway = 0.5, spin = 2.2, additive = false, name = 'flecks' } = {}) {
  const S = W.shared; n = count(W, n, 20);
  const mesh = P.dabMesh(P.dabGeometry(n), P.dabMaterial(S, {
    head: P.paletteGLSL('FK', pals),
    body: /* glsl */ `
      void makeDab(inout Dab d) {
        float id = float(gl_InstanceID);
        vec4 r = hash4(id * 1.31 + 2.0), q = hash4(id * 0.77 + 91.0);
        vec3 B = vec3(${f(box[0])}, ${f(box[1])}, ${f(box[2])});
        vec3 p = r.xyz * B;
        p.y -= uTime * ${f(fall)} * (0.6 + 0.8 * r.w);
        p.xz += uWind.xy * uWind.z * ${f(drift)} * uTime + vec2(sin(uTime * (0.7 + q.x) + q.y * 40.0), cos(uTime * (0.6 + q.z) + q.w * 40.0)) * ${f(sway)};
        // wrapped round the wanderer: the fall goes with them, and each fleck is still a thing of the world
        vec3 c0 = uFocus + vec3(0.0, B.y * 0.5 - 1.5, 0.0);
        p = c0 + mod(p - c0 + B * 0.5, B) - B * 0.5;
        float ground = heightAt(p.xz);
        vec3 e = abs(p - c0) / (B * 0.5);
        d.alive = (1.0 - smoothstep(0.8, 1.0, max(e.x, max(e.y, e.z)))) * smoothstep(0.02, 0.35, p.y - ground);
        if (d.alive <= 0.0) return;
        int k = int(floor(q.x * ${f(pals.length)} * 0.999));
        vec3 c = jitter(paint3(FK_L[k], FK_M[k], FK_S[k], 0.35 + 0.65 * sunAt(p), r.x), q.yzw, 0.5);
        float turn = uTime * ${f(spin)} * (0.5 + q.y) + q.z * TAU;
        d.pos = p;
        d.dir = vec3(cos(turn), sin(turn * 0.7), sin(turn));
        d.spin = turn * 0.5;
        // tumbling: it shows its edge and its face by turns
        d.size = vec2(${f(size[0])} * (0.45 + 0.55 * abs(cos(turn * 1.3))), ${f(size[1])}) * (0.7 + 0.6 * q.w);
        d.c1 = hazed(c, p); d.c2 = hazed(c * 1.2, p);
        d.cell = 4.0 + floor(q.w * 1.99); d.lift = 0.0;
      }`,
    minPx: [2.5, 3.5], maxPx: [80, 120], additive,
  }), 6);
  const group = new THREE.Group(); group.add(mesh);
  return { name, group, count: n, drawn: () => n };
}

// ------------------------------------------------------------------------------------------------------------ dabs
/** Dabs of your own that stay where they are. attributes: { aPos: [Float32Array, 3], … }; head declares them (`in vec3
 *  aPos;`), body is makeDab (references/PAINT.md). They are sorted into squares the eye can skip, and thinned far off. */
export function dabs(W, { count: n, attributes, head = '', body, minPx, maxPx, cells, additive, order = 3, lod, cell, shade = null, name = 'dabs' }) {
  const chunks = P.dabChunks(W.shared, { count: n, attributes }, { head, body, minPx, maxPx, cells, additive }, { order, lod, cell });
  let stamp = 0; for (const ch of chunks.chunks) { const prev = ch.mesh.onBeforeRender; ch.mesh.onBeforeRender = (...x) => { ch.seen = stamp; prev(...x); }; }
  return { name, group: chunks.group, shade, count: n, follow: () => { stamp++; }, drawn: () => chunks.chunks.reduce((s, ch) => s + (ch.seen === stamp ? ch.drawn : 0), 0) };
}
