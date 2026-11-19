// kit-oilpaint-world/paint.js — copied 2026-11-19 from motion-skills/oil-paint-world/lib/paint.js (skill commit f0feca9; the skill
// repo is not modified). Changed here for 「kingdom」 2부 시안 A2 (valley-oil.js): one grading every dab, underpaint and flat
// paint goes through after it is mixed — the King's rule (uSunK: sun ↔ overcast · uLife: colour ↔ grey-umber · a front of light
// sweeping from uFront, and pools of light under the shafts uPool) — so the same pinned paint drains and comes back; the ground's
// LOD reads the eye's height too (uEyeH: seen from the air, coarser strokes); and createFrame lays shafts of sun through cloud
// gaps (uBeam*, analytic, like the skill's own sun-in-the-mist). Original header follows.
// oil-paint-world · paint.js — the painter. A three.js scene drawn as thick oil paint, stroke by stroke: nothing is
// filtered after the fact, everything in the picture is a dab of the brush pinned to the world.
//
//   createShared()        the sun, wind, mist and maps every dab reads (one uniforms object shared by every material)
//   createBrushSheet()    eight marks of a loaded bristle brush, made in code (thickness, cover, streak)
//   dabMaterial / dabGeometry / dabMesh    dabs of your own: you write makeDab in GLSL and fill in a Dab
//   groundRings()         an endless ground of dabs that never shift as the eye moves, drawn in tiles the eye can see
//   dabChunks()           dabs that stay put, in squares of ground: unseen squares are skipped, far ones thinned
//   pinDabs()             dabs pinned to points of moving parts and carried with them
//   underpaint()          the flat three-mix paint under the dabs of a solid thing, so no gap shows the canvas
//   createShade()         where the sun reaches: the still world once, a moving thing each frame
//   createFrame()         the canvas: sun standing in the mist, the weave, the varnish
//
// Adapted from "Oil paint" by Blendi / Patch (https://patch.gg/blendi/oil-paint, src/oilpaint/, MIT © 2026 Patch — see
// LICENSE-oil-paint): the dab, the brush sheet, the ground rings, the pins, the shade and the canvas pass are theirs.
// Changed here: one file; the land map's size and the shade's box as parameters; palettes written from JS; pins for rigid
// parts and for cloth; the underpaint material; strokes that add (light); the ground drawn in tiles and still dabs in
// chunks, so that what the eye can't see costs nothing (a film is rendered on the CPU, where every dab's vertex shader
// counts); the card as one triangle there. Everything is driven by uTime, so a frame is a pure function of t (world.js).
import * as THREE from 'three';

export const BRUSH_COLS = 4, BRUSH_ROWS = 2;

const blank = (r, g, b, a) => { const t = new THREE.DataTexture(new Uint8Array([r, g, b, a]), 1, 1); t.needsUpdate = true; return t; };

/** A tiling noise sheet: four unrelated smooth noises in the four channels, with mipmaps. */
function noiseSheet(size = 256, seed = 7) {
  let s = seed >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const data = new Uint8Array(size * size * 4);
  for (let ch = 0; ch < 4; ch++) {
    const field = new Float32Array(size * size);
    for (const [cells, amp] of [[8, 1], [16, 0.5], [32, 0.25], [64, 0.125]]) { // lattices that divide the sheet, so it tiles
      const lat = new Float32Array(cells * cells);
      for (let i = 0; i < lat.length; i++) lat[i] = rnd();
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const fx = (x / size) * cells, fy = (y / size) * cells, x0 = Math.floor(fx), y0 = Math.floor(fy);
        let tx = fx - x0, ty = fy - y0; tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
        const a = lat[(x0 % cells) + (y0 % cells) * cells], b = lat[((x0 + 1) % cells) + (y0 % cells) * cells];
        const c = lat[(x0 % cells) + ((y0 + 1) % cells) * cells], d = lat[((x0 + 1) % cells) + ((y0 + 1) % cells) * cells];
        field[x + y * size] += amp * (a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty);
      }
    }
    let lo = Infinity, hi = -Infinity;
    for (const v of field) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    for (let i = 0; i < field.length; i++) data[i * 4 + ch] = Math.round(((field[i] - lo) / (hi - lo)) * 255);
  }
  const t = new THREE.DataTexture(data, size, size);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.minFilter = t.magFilter = THREE.LinearFilter; // no mipmaps: it is read in vertex shaders, where every tap counts
  t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}

export function createShared({ extent = 128, landRes = 513 } = {}) {
  return {
    uTime: { value: 0 },
    uPixel: { value: 0.001 }, // metres one pixel covers at one metre from the eye
    uSunDir: { value: new THREE.Vector3(-0.44, 0.5, -0.75).normalize() },
    uWind: { value: new THREE.Vector3(0.8, 0.6, 1) }, // direction on the ground (x, z) and strength
    uExtent: { value: extent }, // the land map covers -extent..extent metres both ways
    uLandRes: { value: landRes },
    tHeight: { value: blank(0, 0, 0, 0) },
    tLand: { value: blank(0, 0, 0, 0) }, // four masks the page gives meaning to (r is the way by convention)
    tNoise: { value: noiseSheet() },
    tBrush: { value: blank(255, 255, 128, 255) },
    tStillShade: { value: null },
    uStillShadeMat: { value: new THREE.Matrix4() },
    tFigShade: { value: null },
    uFigShadeMat: { value: new THREE.Matrix4() },
    uOpen: { value: 1 }, // beyond the picture of the shade: 1 open sun, 0 broken patches of it (a wood with no end)
    uHaze: { value: new THREE.Color(0.6, 0.6, 0.67) },
    uHazeSun: { value: new THREE.Color(1.0, 0.89, 0.62) },
    uHazeDensity: { value: 0.0105 },
    uHazeGlow: { value: new THREE.Color(0.1, 0.08, 0.02) }, // what the air adds right round the sun
    uShadeBias: { value: 0.0009 },
    uBounce: { value: new THREE.Color(0.1, 0.045, 0.0) }, // light the ground throws up into a figure's shade
    uLamp: { value: new THREE.Vector4(0, 0, 0, 0) }, // a light carried through the picture: where, and how strong (0: none)
    uLampCol: { value: new THREE.Color(1.0, 0.62, 0.25) },
    uGlazeMul: { value: new THREE.Color(0.5, 0.38, 0.46) }, // the glaze a moving thing's shadow lays over the ground
    uGlazeAdd: { value: new THREE.Color(0.03, 0.02, 0.06) },
    uImpasto: { value: 1 },
    uFocus: { value: new THREE.Vector3() }, // where the wanderer stands
    // 「kingdom」 A2: the rule of the light (see the header)
    uLife: { value: 1 }, uSunK: { value: 1 }, uFront: { value: new THREE.Vector4(0, 0, -1e4, -1e4) }, uFrontOn: { value: 0 },
    uPool: { value: Array.from({ length: 8 }, () => new THREE.Vector4()) }, uEyeH: { value: 0 },
    uLean: { value: new THREE.Vector3(0, -1, 0) }, uFallMode: { value: 1 },
  };
}

export const COMMON = /* glsl */ `
precision highp float;
precision highp sampler2DShadow;
#define TAU 6.28318530718
uniform float uTime;
uniform float uPixel;
uniform vec3 uSunDir;
uniform vec3 uWind;
uniform float uExtent;
uniform float uLandRes;
uniform sampler2D tHeight;
uniform sampler2D tLand;
uniform sampler2D tNoise;
uniform sampler2D tBrush;
uniform sampler2DShadow tStillShade;
uniform mat4 uStillShadeMat;
uniform sampler2DShadow tFigShade;
uniform mat4 uFigShadeMat;
uniform float uOpen;
uniform vec3 uHaze;
uniform vec3 uHazeSun;
uniform float uHazeDensity;
uniform vec3 uHazeGlow;
uniform float uShadeBias;
uniform vec3 uBounce;
uniform vec4 uLamp;
uniform vec3 uLampCol;
uniform vec3 uGlazeMul;
uniform vec3 uGlazeAdd;
uniform float uImpasto;
uniform vec3 uFocus;
uniform float uLife;
uniform float uSunK;
uniform vec4 uFront;
uniform float uFrontOn;
uniform vec4 uPool[8];
uniform float uEyeH;
uniform vec3 uLean;
uniform float uFallMode;

vec4 hash4(vec2 p, float salt) {
  vec4 q = fract(vec4(p.xyxy) * vec4(0.1031, 0.1030, 0.0973, 0.1099) + salt * 0.0713);
  q += dot(q, q.wzxy + 33.33);
  return fract((q.xxyz + q.yzzw) * q.zywx);
}
vec4 hash4(float n) {
  vec4 q = fract(vec4(n) * vec4(0.1031, 0.1030, 0.0973, 0.1099));
  q += dot(q, q.wzxy + 33.33);
  return fract((q.xxyz + q.yzzw) * q.zywx);
}

vec2 landUv(vec2 xz) { return (xz + uExtent) / (2.0 * uExtent) * ((uLandRes - 1.0) / uLandRes) + 0.5 / uLandRes; }
// the land map holds the ground's height and the way it faces, so one look gives both
float heightAt(vec2 xz) { return texture(tHeight, landUv(xz)).r; }
vec4 landAt(vec2 xz) { return texture(tLand, landUv(xz)); }
vec3 slopeOf(vec4 h) { return normalize(vec3(h.g, sqrt(max(1.0 - h.g * h.g - h.b * h.b, 0.01)), h.b)); }
vec3 normalAt(vec2 xz) { return slopeOf(texture(tHeight, landUv(xz))); }

// Wind: bands crossing the land with the wind, stretched along their fronts, with finer squalls inside.
float gustAt(vec2 xz) {
  vec2 w = uWind.xy;
  vec2 q = vec2(dot(xz, w), dot(xz, vec2(-w.y, w.x)));
  float a = texture(tNoise, vec2(q.x - uTime * 4.0, q.y * 0.45) / 95.0).r;
  float b = texture(tNoise, vec2(q.x - uTime * 6.5, q.y * 0.6) / 23.0 + 0.37).g;
  return clamp(smoothstep(0.36, 0.74, a) * 0.8 + (b - 0.5) * 0.6, 0.0, 1.0) * uWind.z;
}

// 「kingdom」 A2 — the rule of the light. The front is a ragged circle round uFront.xy: light inside uFront.z, colour inside uFront.w.
float frontD(vec2 p) { return length(p - uFront.xy) + 22.0 * sin(p.x * 0.031) * sin(p.y * 0.023) + 14.0 * (texture(tNoise, p / 140.0).r - 0.5); }
float frontM(vec2 p, float R) { return uFrontOn * (1.0 - smoothstep(R - 26.0, R + 26.0, frontD(p))); }
float lifeAt(vec2 p) { return max(uLife, frontM(p, uFront.w)); }
float lightAt(vec2 p) { return max(uSunK, frontM(p, uFront.z)); }
// 1 in the sun, 0 in the still world's shade. That shade never moves, so a dab can take it whole.
// A2: under cloud there is no cast shade — every spot takes the same soft light (the half-tone toward the light mix)
float stillSunAt0(vec3 world) {
  vec4 t = uStillShadeMat * vec4(world, 1.0);
  if (t.x > 0.0 && t.x < 1.0 && t.y > 0.0 && t.y < 1.0 && t.z < 1.0) return texture(tStillShade, vec3(t.xy, t.z - uShadeBias));
  if (uOpen > 0.99) return 1.0;
  return mix(smoothstep(0.56, 0.62, texture(tNoise, world.xz / 29.0).r), 1.0, uOpen); // beyond the picture of the shade
}
float stillSunAt(vec3 world) { float L = lightAt(world.xz); return L > 0.999 ? stillSunAt0(world) : mix(0.6, stillSunAt0(world), L); }
// A2: how lit a spot is, overcast where the light has gone (neither the sun's angle nor its shade counts under cloud)
float ovc(float lit, vec3 world) { return mix(0.58, lit, lightAt(world.xz)); }
// The wanderer's own shadow moves all the time, so it is read soft: a few looks round the spot, which turns its edge
// into a gradual thing instead of a line that dabs flick across.
float figSunSoft(vec3 f) {
  if (f.x <= 0.0 || f.x >= 1.0 || f.y <= 0.0 || f.y >= 1.0 || f.z >= 1.0) return 1.0;
  float z = f.z - 0.004;
  #ifdef ONE_LOOK
  return texture(tFigShade, vec3(f.xy, z));
  #endif
  const float e = 0.013;
  float s = texture(tFigShade, vec3(f.xy, z)) * 0.28;
  s += texture(tFigShade, vec3(f.xy + vec2(e, e * 0.4), z)) * 0.18;
  s += texture(tFigShade, vec3(f.xy + vec2(-e * 0.4, e), z)) * 0.18;
  s += texture(tFigShade, vec3(f.xy + vec2(-e, -e * 0.4), z)) * 0.18;
  s += texture(tFigShade, vec3(f.xy + vec2(e * 0.4, -e), z)) * 0.18;
  return s;
}
float figSunAt(vec3 world) { return figSunSoft((uFigShadeMat * vec4(world, 1.0)).xyz); }
float sunAt(vec3 world) { return min(stillSunAt(world), figSunAt(world)); }

// The painter's three mixes. x is how lit the spot is; r moves the edges about so that one zone breaks into the next
// dab by dab.
vec3 paint3(vec3 cl, vec3 cm, vec3 cs, float x, float r) {
  x += (r - 0.5) * 0.2;
  vec3 c = mix(cs, cm, smoothstep(0.24, 0.36, x));
  return mix(c, cl, smoothstep(0.56, 0.7, x));
}

// Broken colour: every dab is mixed a little differently on the palette (value, hue, strength).
vec3 jitter(vec3 c, vec3 r, float amount) {
  float a = (r.y - 0.5) * 0.9 * amount;
  vec3 k = vec3(0.57735);
  c = c * cos(a) + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - cos(a));
  float g = dot(c, vec3(0.3, 0.59, 0.11));
  c = mix(vec3(g), c, 1.0 + (r.z - 0.5) * 0.7 * amount);
  return max(c * (1.0 + (r.x - 0.5) * 0.5 * amount), 0.0);
}

// Mist: it lies low, takes the sun's colour toward the sun and the haze colour away from it, and is what puts distance
// between one row of things and the next.
vec3 airColour(vec3 v) {
  float sunward = max(dot(v, uSunDir), 0.0);
  vec3 air = mix(uHaze, uHazeSun, sunward * sunward);
  return air + uHazeGlow * pow(sunward, 12.0);
}
// A light carried through the picture, a lantern: how much of it falls on a spot that faces n.
float lampAt(vec3 world, vec3 n) {
  vec3 to = uLamp.xyz - world;
  float d2 = dot(to, to);
  float face = clamp(dot(n, to) * inversesqrt(d2 + 1e-4) * 0.7 + 0.4, 0.0, 1.0);
  return uLamp.w * face / (1.0 + d2 * 0.2);
}
float mistBetween(vec3 world) {
  vec3 d = world - cameraPosition;
  float dist = length(d);
  float sunward = max(dot(d / dist, uSunDir), 0.0);
  float up = clamp((0.5 * (world.y + cameraPosition.y) - uFocus.y - 2.0) / 22.0, 0.0, 1.0);
  return 1.0 - exp(-dist * uHazeDensity * mix(1.2, 0.4, up) * (1.0 + 0.7 * sunward * sunward));
}
vec3 hazed(vec3 c, vec3 world) { return mix(c, airColour(normalize(world - cameraPosition)), mistBetween(world)); }

float poolAt(vec2 p) { float s = 0.0; for (int i = 0; i < 8; i++) { vec4 q = uPool[i]; vec2 d = p - q.xy; s += q.w * exp(-dot(d, d) / (q.z * q.z)); } return s; }
// after a dab is mixed: grey-umber where life has gone, the sun's light and shade pressed together under cloud, warm under a shaft
vec3 gradeC(vec3 c, vec3 world) {
  float L = lifeAt(world.xz), S = lightAt(world.xz);
  float lum = dot(c, vec3(0.3, 0.59, 0.11));
  vec3 dead = vec3(lum) * vec3(1.04, 0.97, 0.88);
  c = mix(dead, c, mix(0.1, 1.0, L));
  float l2 = max(dot(c, vec3(0.3, 0.59, 0.11)), 1e-3);
  c *= mix((0.46 + (l2 - 0.46) * 0.6) / l2, 1.0, S);
  c = mix(c * vec3(0.93, 0.97, 1.06), c, S);
  float ed = uFrontOn * exp(-pow((frontD(world.xz) - uFront.z) / 18.0, 2.0));
  c += c * vec3(1.0, 0.8, 0.46) * (min(poolAt(world.xz), 0.6) * (0.35 + 0.65 * S) + ed * 0.55);
  return c;
}
`;

// ---------------------------------------------------------------------------------------------------------- the brush
// Each cell holds one mark laid along +v: r is how thick the paint stands (for the light that rakes across it), g is
// where there is paint at all, b is a slow streak along the bristles (a second colour picked up and not mixed in).
const CW = 128, CH = 256;
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const smooth = (t) => t * t * (3 - 2 * t);
const n1 = (x, seed) => { const i = Math.floor(x), f = smooth(x - i); return hash(i + seed * 57.3) * (1 - f) + hash(i + 1 + seed * 57.3) * f; };
const n2 = (x, y, seed) => {
  const i = Math.floor(x), j = Math.floor(y), fx = smooth(x - i), fy = smooth(y - j), h = (a, b) => hash(a * 1.31 + b * 91.7 + seed * 13.9);
  return (h(i, j) * (1 - fx) + h(i + 1, j) * fx) * (1 - fy) + (h(i, j + 1) * (1 - fx) + h(i + 1, j + 1) * fx) * fy;
};
const sstep = (a, b, x) => smooth(Math.min(1, Math.max(0, (x - a) / (b - a))));

// one mark: kind 0 a long stroke that runs dry, 1 a short fat dab, 2 a stroke with a curve to it
function mark(u, v, seed, kind) {
  const bend = kind === 2 ? (seed % 2 ? 0.34 : -0.34) : (hash(seed * 3.1) - 0.5) * 0.12;
  const ub = u - bend * (4 * (v - 0.5) * (v - 0.5) - 0.5);
  const wob = (n1(v * 5, seed + 3) - 0.5) * 0.1;
  const a = Math.abs(ub + wob);
  if (kind === 1) { // a pressed dab: fat in the middle, ragged all round
    const r = Math.hypot(ub / 0.66, (v - 0.5) / 0.44);
    const edge = 1 + (n1(Math.atan2(v - 0.5, ub) * 2.2 + 9, seed) - 0.5) * 0.34;
    const inside = 1 - sstep(edge - 0.16, edge, r);
    const bristle = n1(ub * 11, seed + 11), dry = sstep(0.55, 1.0, r) * 0.9;
    const alpha = inside * (bristle > dry * 0.8 ? 1 : 0.25);
    const ridge = n1(ub * 13 + n1(v * 3, seed) * 1.5, seed + 31);
    const height = alpha * (0.4 + 0.22 * ridge * n1(ub * 9, seed + 5) + 0.3 * sstep(0.45, 0.95, r) + 0.12 * n2(ub * 4, v * 6, seed));
    return [height, alpha, n2(ub * 3.2, v * 1.3, seed + 20)];
  }
  const half = 0.6 * (0.8 + 0.2 * Math.sin(Math.PI * Math.min(1, v * 1.15))) * (1 + (n1(v * 7, seed + 1) - 0.5) * 0.1);
  const start = 0.05 + 0.05 * n1(ub * 5, seed + 2);
  const end = 0.95 - 0.3 * n1(ub * 4.5 + 2, seed + 4) - 0.06 * n1(ub * 19, seed + 6);
  const side = 1 - sstep(half - 0.07, half, a), head = sstep(start, start + 0.035, v), tail = 1 - sstep(end - 0.02, end + 0.015, v);
  const dryness = sstep(end - 0.2, end, v); // the brush runs dry toward the end: single bristles give out and leave gaps
  const bristle = n1(ub * 13, seed + 8) * 0.7 + n1(ub * 31, seed + 9) * 0.3;
  const gap = 1 - sstep(dryness * 0.55 - 0.08, dryness * 0.55, bristle) < 0.5 ? 1.0 : 0.0;
  const alpha = side * head * tail * gap;
  const furrow = n1(ub * 12 + n1(v * 2.5, seed + 12) * 1.2, seed + 33) * 0.7 + n1(ub * 29, seed + 34) * 0.3;
  const load = 1 - 0.55 * sstep(0.1, 0.9, v); // thick where the brush touched down, thin where it left
  const squeezed = sstep(half - 0.3, half - 0.06, a); // paint pushed out to the sides of the stroke
  const height = alpha * (0.3 + 0.22 * furrow * (0.5 + 0.5 * n1(ub * 11, seed + 13)) + 0.3 * squeezed + 0.25 * load * (1 - sstep(start, start + 0.25, v)) + 0.1 * n2(ub * 3, v * 7, seed + 14));
  return [Math.min(1, height), alpha, n2(ub * 3.4, v * 1.1, seed + 20)];
}

/** Cells 0 1 2 6: long strokes · 3 7: curved strokes · 4 5: pressed dabs. */
export function createBrushSheet() {
  const W = CW * BRUSH_COLS, H = CH * BRUSH_ROWS, data = new Uint8Array(W * H * 4), kinds = [0, 0, 0, 2, 1, 1, 0, 2];
  for (let cell = 0; cell < 8; cell++) {
    const cx = cell % BRUSH_COLS, cy = Math.floor(cell / BRUSH_COLS);
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      const u = ((x + 0.5) / CW) * 2 - 1, v = (y + 0.5) / CH, m = 0.9; // a margin of nothing round each mark
      const [h, a, s] = Math.abs(u) > m || v < 0.04 || v > 0.96 ? [0, 0, 0.5] : mark(u / m, (v - 0.04) / 0.92, cell * 7 + 1, kinds[cell]);
      const i = ((cx * CW + x) + (cy * CH + y) * W) * 4;
      data[i] = Math.round(h * 255); data[i + 1] = Math.round(a * 255); data[i + 2] = Math.round(s * 255); data[i + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, W, H);
  t.minFilter = CARD.soft ? THREE.LinearMipmapNearestFilter : THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.anisotropy = CARD.soft ? 1 : 4; t.needsUpdate = true;
  return t;
}

// ------------------------------------------------------------------------------------------------------------ the dab
// A dab is one touch of the brush, pinned to a point of the world, turned to lie along a direction of the world, in one
// mixed colour. Most are cards that face the eye (leaves, bark, cloth). A dab on a surface lies flat on it instead
// (lie): it is foreshortened like the surface, never turns as the eye moves, and where two overlap the one laid higher
// is on top from every side. Sizes are in metres but are kept between a least and a most size on the canvas, so far
// things are painted with fewer, larger touches.
const VERT = (head, body) => /* glsl */ `
${COMMON}
uniform vec2 uMinPx;
uniform vec2 uMaxPx;
uniform vec2 uCells; // first cell of the brush sheet and how many to choose from
uniform vec3 uLod;   // a chunk drawn from afar: how many of its dabs are drawn, over how many the last ones grow in, how much larger
out vec2 vUv;
out vec2 vQ;
out vec3 vC1;
out vec3 vC2;
out vec4 vAxis;
out vec4 vGlaze;
struct Dab {
  vec3 pos;    // where it is pinned
  vec3 dir;    // the way the stroke runs, in the world
  vec2 size;   // across and along, metres
  vec3 c1;     // its colour
  vec3 c2;     // the colour streaked into it
  float seed;
  float alive; // 0 gone .. 1 whole (it grows in)
  float lift;  // how far it stands off its surface toward the eye, in its own sizes
  float base;  // 1: pinned by its foot instead of its middle
  float spin;  // a turn on the canvas, radians
  float turnabout; // 1: laid with either end first
  float cell;  // which mark of the brush sheet, or -1 to let it choose
  float lie;   // 1: lies flat on its surface (nrm) instead of facing the eye
  vec3 nrm;    // the surface it lies on
  float height; // how far above the surface it is laid, metres: higher is on top
  float glaze; // 1: the wanderer's shadow passes over it as a glaze, pixel by pixel
};
// A dab the eye can't see is not worth working out: call this first with where it is and how far it reaches (metres).
bool unseen(vec3 world, float reach) {
  vec4 c = projectionMatrix * viewMatrix * vec4(world, 1.0);
  float m = reach * max(projectionMatrix[0][0], projectionMatrix[1][1]);
  return c.w < -reach || abs(c.x) > c.w + m || abs(c.y) > c.w + m;
}
${head}
void makeDab(inout Dab d);
${body}
void main() {
  Dab d;
  d.pos = vec3(0.0); d.dir = vec3(0.0, 1.0, 0.0); d.size = vec2(0.1, 0.2);
  d.c1 = vec3(0.5); d.c2 = vec3(0.5); d.seed = float(gl_InstanceID); d.alive = 1.0; d.lift = 0.6; d.base = 0.0; d.spin = 0.0; d.turnabout = 0.0; d.cell = -1.0;
  d.lie = 0.0; d.nrm = vec3(0.0, 1.0, 0.0); d.height = 0.0; d.glaze = 0.0;
  makeDab(d);
  #ifndef NO_GRADE
  d.c1 = gradeC(d.c1, d.pos); d.c2 = gradeC(d.c2, d.pos);
  #endif
  d.alive *= smoothstep(0.0, uLod.y, uLod.x - float(gl_InstanceID));
  d.size *= uLod.z;
  vQ = position.xy;
  vec4 r = hash4(d.seed * 1.37 + 5.1);
  vec2 across, along;
  vec4 vc;
  vGlaze = vec4(0.0);
  if (d.lie > 0.5) {
    vec3 Nn = normalize(d.nrm);
    vec3 A = d.dir - Nn * dot(d.dir, Nn);
    A = dot(A, A) > 1e-8 ? normalize(A) : normalize(cross(Nn, vec3(1.0, 0.0, 0.0)));
    vec3 B = cross(Nn, A);
    vec3 P = d.pos + Nn * d.height;
    vc = viewMatrix * vec4(P, 1.0);
    float dist = -vc.z;
    if (d.alive < 0.004 || dist < 0.1) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec2 half_ = d.size * 0.5 * d.alive;
    vec3 world = P + A * position.y * half_.y + B * position.x * half_.x;
    if (d.glaze > 0.5) vGlaze = vec4((uFigShadeMat * vec4(world, 1.0)).xyz, 1.0);
    vec3 a = mat3(viewMatrix) * A * half_.y;
    vec3 b = mat3(viewMatrix) * B * half_.x;
    // on the canvas the patch is a slanted box; if its thin way is under the least size, stand it up to that
    float la = length(a.xy), lb = length(b.xy);
    float thin = abs(a.x * b.y - a.y * b.x) / max(max(la, lb), 1e-6);
    float need = uMinPx.x * 0.5 * dist * uPixel * d.alive;
    if (thin < need) {
      if (la > lb) {
        vec2 perp = vec2(-a.y, a.x) / max(la, 1e-6);
        b.xy += perp * (dot(b.xy, perp) < 0.0 ? -1.0 : 1.0) * (need - thin);
      } else {
        vec2 perp = vec2(-b.y, b.x) / max(lb, 1e-6);
        a.xy += perp * (dot(a.xy, perp) < 0.0 ? -1.0 : 1.0) * (need - thin);
      }
    }
    vc.xyz += a * position.y + b * position.x;
    along = normalize(a.xy + 1e-6);
    across = normalize(b.xy + 1e-6);
  } else {
    vc = viewMatrix * vec4(d.pos, 1.0);
    float dist = -vc.z;
    if (d.alive < 0.004 || dist < 0.1) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec3 vd = mat3(viewMatrix) * normalize(d.dir);
    float flatness = length(vd.xy);
    float a0 = r.x * TAU;
    along = flatness > 1e-4 ? vd.xy / flatness : vec2(0.0, 1.0);
    // a stroke that points at the eye has no direction on the canvas: give it its own
    along = normalize(mix(vec2(cos(a0), sin(a0)), along, smoothstep(0.08, 0.4, flatness)));
    float cs = cos(d.spin), sn = sin(d.spin);
    along = vec2(along.x * cs - along.y * sn, along.x * sn + along.y * cs);
    across = vec2(along.y, -along.x);
    float px = dist * uPixel;
    vec2 half_ = clamp(d.size, uMinPx * px, uMaxPx * px) * 0.5 * d.alive;
    float lift = d.lift * max(half_.x, half_.y) * (0.6 + 0.8 * r.y);
    vc.xyz *= 1.0 - min(lift / dist, 0.3);
    float t = mix(position.y, position.y + 1.0, d.base);
    vc.xy += across * position.x * half_.x + along * t * half_.y;
  }
  gl_Position = projectionMatrix * vc;
  float cell = d.cell >= 0.0 ? d.cell : uCells.x + floor(r.z * uCells.y * 0.999);
  float flip = r.w > 0.5 ? -1.0 : 1.0;
  float end_ = d.turnabout > 0.5 && fract(r.x * 7.13) > 0.5 ? -1.0 : 1.0;
  vec2 q = vec2(position.x * flip, position.y * end_) * 0.5 + 0.5;
  vUv = (vec2(mod(cell, ${BRUSH_COLS}.0), floor(cell / ${BRUSH_COLS}.0)) + q) / vec2(${BRUSH_COLS}.0, ${BRUSH_ROWS}.0);
  vC1 = d.c1;
  vC2 = d.c2;
  vAxis = vec4(across * flip, along * end_);
}
`;

const FRAG = (add) => /* glsl */ `
${COMMON}
in vec2 vUv;
in vec2 vQ;
in vec3 vC1;
in vec3 vC2;
in vec4 vAxis;
in vec4 vGlaze;
uniform float uRelief; // how much this thing's paint stands up (1: as the brush left it; a sky is laid thinner)
layout(location = 0) out vec4 outC;
void main() {
  if (max(abs(vQ.x), abs(vQ.y)) > 1.0) discard; // the card drawn as one triangle: outside the mark's square
  vec4 t = texture(tBrush, vUv);
  // how the paint's thickness changes across the mark, from one look at the sheet: the change from pixel to pixel
  // (which the rasteriser gives for nothing) turned back into the mark's own directions
  vec2 ux = dFdx(vUv), uy = dFdy(vUv);
  vec2 hd = vec2(dFdx(t.r), dFdy(t.r));
  float det = ux.x * uy.y - ux.y * uy.x;
  det = abs(det) < 1e-12 ? 1e-12 : det;
  float hu = (hd.x * uy.y - hd.y * ux.y) / det * (3.0 / 512.0);
  float hv = (hd.y * ux.x - hd.x * uy.x) / det * (3.0 / 512.0);
  if (t.g < 0.3) discard;
  hu = clamp(hu, -0.5, 0.5); hv = clamp(hv, -0.5, 0.5);
  // the paint stands up off the canvas and the room's light, from the upper left, rakes across it
  vec2 g = vAxis.xy * hu + vAxis.zw * hv;
  float rake = 0.5 * g.x - 0.7 * g.y;
  vec3 col = mix(vC1, vC2, smoothstep(0.52, 0.78, t.b));
  ${add ? /* light that is light: strokes that add up instead of covering */ `outC = vec4(col * smoothstep(0.3, 0.62, t.g) * mix(0.7, 1.1, t.r), 1.0); return;` : ''}
  if (vGlaze.w > 0.5) {
    // the wanderer's shadow: a soft glaze that slides over the paint and follows its streaks a little
    float lit = figSunSoft(vGlaze.xyz + vec3((t.b - 0.5) * 0.012, (t.r - 0.5) * 0.012, 0.0));
    col = mix(col * uGlazeMul + uGlazeAdd, col, lit);
  }
  col *= mix(0.95, 1.04, t.r);
  col *= 1.0 + rake * 1.25 * uImpasto * uRelief;
  col += vec3(1.0, 0.97, 0.9) * pow(max(rake, 0.0), 2.0) * 1.2 * uImpasto * uRelief;
  outC = vec4(col, smoothstep(0.3, 0.62, t.g));
}
`;

/** minPx / maxPx: least and most size on the canvas [across, along]; cells: [first, count] of the brush sheet;
 *  relief: how much the paint stands up (1);
 *  additive: the strokes are light (a flame, a glow, an aurora) and add up instead of covering. */
export function dabMaterial(shared, { head = '', body, uniforms = {}, minPx = [5, 9], maxPx = [400, 700], cells = [0, 8], depthTest = true, depthWrite = true, additive = false, relief = 1, grade = true } = {}) {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: VERT(head, body),
    fragmentShader: FRAG(additive),
    defines: { ...(CARD.soft ? { ONE_LOOK: 1 } : {}), ...(grade ? {} : { NO_GRADE: 1 }) },
    uniforms: { ...shared, uMinPx: { value: new THREE.Vector2(...minPx) }, uMaxPx: { value: new THREE.Vector2(...maxPx) }, uCells: { value: new THREE.Vector2(...cells) }, uLod: { value: new THREE.Vector3(1e9, 1, 1) }, uRelief: { value: relief }, ...uniforms },
    side: THREE.DoubleSide,
    alphaToCoverage: !additive,
    depthTest,
    depthWrite: additive ? false : depthWrite,
    ...(additive ? { blending: THREE.AdditiveBlending, transparent: true } : {}),
  });
}

/** How the card is drawn, and how much is spent on it. tri: one triangle that covers the quad (the fragment shader cuts
 *  it back to the square): three runs of makeDab a dab instead of four, and twice the pixels (?card=tri). soft: the
 *  picture is being drawn on the CPU (a film rendered without a GPU), where pixels are the cost: one look at the
 *  wanderer's shadow where a GPU takes five, and the brush sheet read plainly. world.js sets both. */
export const CARD = { tri: false, soft: false };

/** The card every dab is drawn with, `count` times; `attributes` are per dab: { name: [Float32Array, itemSize] }. */
export function dabGeometry(count, attributes = {}, dynamic = false) {
  const g = new THREE.InstancedBufferGeometry();
  if (CARD.tri) g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  else { g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]); }
  for (const [name, [array, size]] of Object.entries(attributes)) {
    const a = new THREE.InstancedBufferAttribute(array, size);
    if (dynamic) a.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute(name, a);
  }
  g.instanceCount = count;
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  return g;
}

export function dabMesh(geometry, material, order = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.frustumCulled = false; m.matrixAutoUpdate = false; m.renderOrder = order;
  return m;
}

// --------------------------------------------------------------------------------------------------------- the ground
// Dabs for a ground with no end: grids of small squares round the eye, each square holding dabs that are only its
// number. Every dab belongs to one finest square for good, so its place, direction and colour never change; with
// distance, one dab in four (then one in sixteen …) is drawn larger to stand for its neighbours, and as the eye nears
// it shrinks back while the others grow in round it. Nothing is stored and nothing is swapped.
// A ground gives `body` (makeDab), which calls ringCell (which square am I?) and ringGrow (how whole, and how much
// larger than true size things are at this distance).
export const RING = (n, tn) => /* glsl */ `
uniform float uCell;   // this level's square of ground
uniform float uCell0;  // the finest square
uniform vec2 uOrigin;
uniform vec2 uTile;    // this tile's first square within the level's grid
uniform float uLevel;
uniform float uTop;
uniform float uNear;   // within this, everything is drawn at its true size
const float RN = ${n}.0;
const float TN = ${tn}.0;
// each: every dab of a square has its own descent (a carpet); otherwise they share it (the fronds of one clump)
bool ringCell(float salt, bool each, out vec2 cell, out float sub) {
  float id = float(gl_InstanceID);
  sub = floor(id / (TN * TN));
  float k = id - sub * TN * TN;
  vec2 block = uOrigin + uTile + vec2(mod(k, TN), floor(k / TN)) - RN * 0.5;
  float s = salt + (each ? sub * 17.0 : 0.0);
  if (uLevel < uTop - 0.5) {
    vec2 parent = floor(block * 0.5);
    vec2 pick = parent * 2.0 + step(0.5, hash4(parent, s + (uLevel + 1.0) * 3.3).xy);
    if (pick == block) return false;
  }
  cell = block;
  for (float i = uLevel; i > 0.5; i -= 1.0) cell = cell * 2.0 + step(0.5, hash4(cell, s + i * 3.3).xy);
  return true;
}
float ringGrow(float dist, out float lod) {
  dist = length(vec2(dist, uEyeH));   // A2: seen from the air the ground is laid in coarser strokes
  lod = max(dist / uNear, 1.0);
  if (uLevel > uTop - 0.5) return 1.0 - smoothstep(0.86, 1.0, dist / (RN * 0.5 * uCell));
  return smoothstep(0.0, 1.0, uLevel + 1.0 - log2(lod));
}
`;

/** n: squares a side of each level's grid (a multiple of `tiles`); per: dabs a square; cell0: the finest square, metres;
 *  levels: each twice the last. Each level is drawn as tiles × tiles pieces, and follow() leaves out the pieces the eye
 *  can't see (most of them: the grid goes all round it), which is what makes a ground affordable. tall: how far above
 *  and below the ground its dabs may reach, for that test. */
export function groundRings(shared, { head = '', body, per, n, cell0, levels, minPx, maxPx, cells, uniforms = {}, order = 2, tiles = 8, tall = 2 }) {
  const tn = n / tiles;
  if (tn !== Math.floor(tn)) throw new Error(`groundRings: n (${n}) must be a multiple of tiles (${tiles})`);
  const group = new THREE.Group(), geometry = dabGeometry(tn * tn * per), list = [];
  for (let k = 0; k < levels; k++) {
    const cell = cell0 * 2 ** k;
    const material = dabMaterial(shared, {
      head: head + RING(n, tn), body, minPx, maxPx, cells,
      uniforms: { ...uniforms, uCell: { value: cell }, uCell0: { value: cell0 }, uOrigin: { value: new THREE.Vector2() }, uTile: { value: new THREE.Vector2() }, uLevel: { value: k }, uTop: { value: levels - 1 }, uNear: { value: (n * cell0 / 4) * 0.92 } },
    });
    const level = { cell, material, tiles: [] };
    for (let ty = 0; ty < tiles; ty++) for (let tx = 0; tx < tiles; tx++) {
      const mesh = dabMesh(geometry, material, order);
      mesh.onBeforeRender = () => { material.uniforms.uTile.value.set(tx * tn, ty * tn); material.uniformsNeedUpdate = true; };
      group.add(mesh); level.tiles.push({ mesh, tx, ty });
    }
    list.push(level);
  }
  const sphere = new THREE.Sphere();
  return {
    group, count: n * n * per * levels, reach: n * 0.5 * cell0 * 2 ** (levels - 1), drawn: 0,
    /** x, z: the eye; frustum: what it sees (or null: draw everything); heightAt(x, z): the ground, to place the test */
    follow(x, z, frustum, heightAt) {
      let drawn = 0;
      for (const l of list) {
        const ox = Math.floor(x / l.cell), oz = Math.floor(z / l.cell), w = tn * l.cell;
        l.material.uniforms.uOrigin.value.set(ox, oz);
        for (const t of l.tiles) {
          const cx = (ox + t.tx * tn - n * 0.5) * l.cell + w * 0.5, cz = (oz + t.ty * tn - n * 0.5) * l.cell + w * 0.5;
          sphere.center.set(cx, heightAt ? heightAt(cx, cz) : 0, cz); sphere.radius = w * 0.75 + tall + l.cell * 2;
          t.mesh.visible = !frustum || frustum.intersectsSphere(sphere);
          if (t.mesh.visible) drawn += tn * tn * per;
        }
      }
      this.drawn = drawn;
    },
  };
}

// --------------------------------------------------------------------------------------------------------- chunks
// Dabs that stay where they are (leaves, bark, the paint on a wall), sorted into squares of ground. A square the eye
// can't see is not drawn at all, and one seen from afar draws only the first part of its dabs, each a little larger:
// the dabs of a square are shuffled, so any first part of them is spread evenly over it, and the last ones drawn grow
// in instead of appearing. `first` dabs of every square are always drawn (the darks laid under a crown).
/** dabs: { count, attributes: { name: [Float32Array, itemSize] }, pos: 'aPos' (which attribute places a dab), first: (i) => bool }
 *  lod: { near, far, keep }: full within near metres, `keep` of them beyond far. */
export function dabChunks(shared, dabs, materialOptions, { cell = 20, order = 3, lod = { near: 30, far: 120, keep: 0.3 }, pad = 3, seed = 4177 } = {}) {
  const material = dabMaterial(shared, materialOptions), group = new THREE.Group(), chunks = [];
  const P = dabs.attributes[dabs.pos || 'aPos'][0], bins = new Map();
  let s = seed >>> 0;
  const rand = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < dabs.count; i++) {
    const key = Math.floor(P[i * 3] / cell) + ',' + Math.floor(P[i * 3 + 2] / cell);
    let b = bins.get(key); if (!b) bins.set(key, (b = { a: [], b: [] }));
    (dabs.first && dabs.first(i) ? b.a : b.b).push(i);
  }
  for (const bin of bins.values()) {
    for (let i = bin.b.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)), t = bin.b[i]; bin.b[i] = bin.b[j]; bin.b[j] = t; }
    const ids = bin.a.concat(bin.b), count = ids.length, attrs = {};
    for (const [name, [array, size]] of Object.entries(dabs.attributes)) {
      const out = new Float32Array(count * size);
      for (let i = 0; i < count; i++) for (let k = 0; k < size; k++) out[i * size + k] = array[ids[i] * size + k];
      attrs[name] = [out, size];
    }
    const geometry = dabGeometry(count, attrs), box = new THREE.Box3();
    for (const i of ids) box.expandByPoint(new THREE.Vector3(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]));
    geometry.boundingSphere = box.getBoundingSphere(new THREE.Sphere()); geometry.boundingSphere.radius += pad;
    const mesh = dabMesh(geometry, material, order), sphere = geometry.boundingSphere, first = bin.a.length;
    mesh.frustumCulled = true;
    const chunk = { mesh, count, drawn: count };
    mesh.onBeforeRender = (renderer, scene, camera) => {
      const dist = Math.max(0, camera.position.distanceTo(sphere.center) - sphere.radius * 0.5);
      const keep = 1 - (1 - lod.keep) * Math.min(1, Math.max(0, (dist - lod.near) / (lod.far - lod.near)));
      const n = first + (count - first) * keep;
      geometry.instanceCount = chunk.drawn = Math.min(count, Math.ceil(n));
      material.uniforms.uLod.value.set(keep >= 1 ? 1e9 : n, Math.max(1, (count - first) * 0.08), 1 / Math.sqrt(keep));
      material.uniformsNeedUpdate = true;
    };
    group.add(mesh); chunks.push(chunk);
  }
  return { group, material, chunks, count: dabs.count };
}

// ------------------------------------------------------------------------------------------------------- palettes
// colours are paint, written as they are: '#rrggbb' is read as the numbers it holds, never converted
const hex3 = (c) => (typeof c === 'string' ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255) : c);
/** GLSL for a list of three-mix palettes: const vec3 NAME_L[n], NAME_M[n], NAME_S[n], NAME_A[n] (its own colour, for a lamp). */
export function paletteGLSL(name, palettes) {
  const n = palettes.length, list = (k) => palettes.map((p) => `vec3(${hex3(p[k] ?? p[0]).map((x) => (+x).toFixed(3)).join(', ')})`).join(', ');
  return `const vec3 ${name}_L[${n}] = vec3[${n}](${list(0)});\nconst vec3 ${name}_M[${n}] = vec3[${n}](${list(1)});\nconst vec3 ${name}_S[${n}] = vec3[${n}](${list(2)});\nconst vec3 ${name}_A[${n}] = vec3[${n}](${list(3)});\n`;
}

// ----------------------------------------------------------------------------------------------------- underpaint
/** The flat paint under a solid thing's dabs: the three mixes chosen pixel by pixel, a little grain, mist. The mesh
 *  needs position, normal and aPal (which palette, a float per vertex). Positions are in the world. */
export function underpaint(shared, palettes, { dim = 0.82, rigid = false } = {}) {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: shared,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      ${COMMON}
      in float aPal;
      out vec3 vWorld; out vec3 vN; out float vPal;
      void main() {
        vec4 w = ${rigid ? 'modelMatrix * ' : ''}vec4(position, 1.0);
        vWorld = w.xyz; vN = ${rigid ? 'mat3(modelMatrix) * ' : ''}normal; vPal = aPal;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${COMMON}
      ${paletteGLSL('UP', palettes)}
      in vec3 vWorld; in vec3 vN; in float vPal;
      layout(location = 0) out vec4 outC;
      void main() {
        vec3 Nn = normalize(vN);
        int k = int(vPal + 0.5);
        float grain = texture(tNoise, vWorld.xz * 0.21 + vWorld.y * 0.13).r;
        float lit = ovc(sunAt(vWorld + Nn * 0.3) * clamp(dot(Nn, uSunDir) * 1.2 + 0.25, 0.0, 1.0), vWorld);
        vec3 c = paint3(UP_L[k], UP_M[k], UP_S[k], lit, grain) * (${dim.toFixed(2)} - 0.12 + 0.24 * grain);
        c += UP_A[k] * uLampCol * lampAt(vWorld, Nn);
        outC = vec4(gradeC(hazed(c, vWorld), vWorld), 1.0);
      }`,
  });
}

// ------------------------------------------------------------------------------------------------------------ pins
// Paint on things that move. Dabs are pinned to points of rigid parts (a point, the way its surface faces, the way its
// stroke runs, all in the part's own space) or to vertices of a cloth whose positions are rewritten every frame. Each
// frame every pin is carried to the world with its part.
/** palettes: [[light, half, shade, (own)], …]. Returns { mesh, count, add(pin), build(), update() }.
 *  pin: { part: Object3D, p, n, d: Vector3 in the part's space, pal, size: [across, along] }
 *    or { at(P, N, D): writes where it is, how its surface faces and how its stroke runs, in the world; pal, size } */
export function pinDabs(shared, palettes, { minPx = [2.5, 4], maxPx = [200, 400], cells = [0, 6], order = 5, seed = 9151 } = {}) {
  let s = seed >>> 0;
  const rand = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const pins = [];
  let aPos, aDir, aNrm, geometry, mesh;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), nm = new THREE.Matrix3();
  const api = {
    pins, mesh: null, count: 0,
    add(pin) { pins.push({ ...pin, seed: rand() * 1000 }); },
    build() {
      const count = pins.length;
      aPos = new Float32Array(count * 3); aDir = new Float32Array(count * 3); aNrm = new Float32Array(count * 3);
      const aData = new Float32Array(count * 4);
      pins.forEach((pin, i) => aData.set([pin.seed, pin.size[0], pin.size[1], pin.pal], i * 4));
      geometry = dabGeometry(count, { aPos: [aPos, 3], aDir: [aDir, 3], aNrm: [aNrm, 3] }, true);
      geometry.setAttribute('aData', new THREE.InstancedBufferAttribute(aData, 4));
      mesh = dabMesh(geometry, dabMaterial(shared, {
        head: /* glsl */ `in vec3 aPos; in vec3 aDir; in vec3 aNrm; in vec4 aData;\n${paletteGLSL('FIG', palettes)}`,
        body: /* glsl */ `
          void makeDab(inout Dab d) {
            vec3 Nn = normalize(aNrm);
            // on the far side: not ours to paint
            if (dot(Nn, normalize(cameraPosition - aPos)) < -0.05) { d.alive = 0.0; return; }
            vec4 r = hash4(aData.x);
            int k = int(aData.w + 0.5);
            float lit = ovc(sunAt(aPos + Nn * 0.08) * clamp(dot(Nn, uSunDir) * 0.85 + 0.42, 0.0, 1.0), aPos);
            vec3 c = paint3(FIG_L[k], FIG_M[k], FIG_S[k], lit, r.x);
            // warm light thrown up by the ground, cool light from the sky into the shade
            c += uBounce * max(-Nn.y, 0.0) * (1.0 - lit);
            c = mix(c, c * vec3(0.86, 0.92, 1.18), (1.0 - lit) * max(Nn.y, 0.0) * 0.6);
            c = jitter(c, r.yzw, 0.45);
            c += FIG_A[k] * uLampCol * lampAt(aPos, Nn);
            d.pos = aPos;
            d.dir = aDir;
            d.size = aData.yz * (0.8 + 0.45 * r.y);
            d.c1 = hazed(c, aPos);
            d.c2 = hazed(jitter(c * 1.22, r.wxy, 0.5), aPos);
            d.seed = aData.x;
            d.lift = 0.3;
            d.turnabout = 1.0;
          }`,
        minPx, maxPx, cells,
      }), order);
      api.mesh = mesh; api.count = count;
      return api;
    },
    update() {
      for (let i = 0; i < pins.length; i++) {
        const pin = pins[i], k = i * 3;
        if (pin.at) {
          pin.at(a, b, c);
          aPos[k] = a.x; aPos[k + 1] = a.y; aPos[k + 2] = a.z; aNrm[k] = b.x; aNrm[k + 1] = b.y; aNrm[k + 2] = b.z; aDir[k] = c.x; aDir[k + 1] = c.y; aDir[k + 2] = c.z;
          continue;
        }
        const m = pin.part.matrixWorld;
        nm.setFromMatrix4(m);
        a.copy(pin.p).applyMatrix4(m); aPos[k] = a.x; aPos[k + 1] = a.y; aPos[k + 2] = a.z;
        b.copy(pin.n).applyMatrix3(nm); aNrm[k] = b.x; aNrm[k + 1] = b.y; aNrm[k + 2] = b.z;
        b.copy(pin.d).applyMatrix3(nm); aDir[k] = b.x; aDir[k + 1] = b.y; aDir[k + 2] = b.z;
      }
      for (const name of ['aPos', 'aDir', 'aNrm']) geometry.attributes[name].needsUpdate = true;
    },
  };
  return api;
}

// ----------------------------------------------------------------------------------------------------------- shade
// Where the sun reaches. The still world's shade is drawn once, from the sun, into a depth picture that every dab asks
// about for itself; the wanderer's own shadow is a second, small picture that follows them and is redrawn each frame.
const BIAS = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
function depthTarget(w, h) {
  const target = new THREE.WebGLRenderTarget(w, h, { depthBuffer: true, generateMipmaps: false });
  target.depthTexture = new THREE.DepthTexture(w, h, THREE.UnsignedIntType);
  target.depthTexture.compareFunction = THREE.LessEqualCompare;
  target.depthTexture.minFilter = target.depthTexture.magFilter = THREE.LinearFilter;
  return target;
}

/** still: a scene of the things that never move (drawn black). box: half the width and half the height of the picture
 *  as the sun sees it, round `centre`; size: its pixels. */
export function createShade(renderer, shared, still, { size = [2048, 2048], box = [80, 80], centre: at = [0, 6, 0], back = 300, near = 10, far = 700, figBox = 3.2 } = {}) {
  const sun = shared.uSunDir.value;
  const wood = depthTarget(size[0], size[1]);
  const sunCam = new THREE.OrthographicCamera(-box[0], box[0], box[1], -box[1], near, far);
  const centre = new THREE.Vector3(...at);
  sunCam.position.copy(centre).addScaledVector(sun, back);
  sunCam.lookAt(centre);
  sunCam.updateMatrixWorld(true); sunCam.updateProjectionMatrix();
  const before = renderer.getRenderTarget();
  renderer.setRenderTarget(wood); renderer.clear(); renderer.render(still, sunCam); renderer.setRenderTarget(before);
  shared.tStillShade.value = wood.depthTexture;
  shared.uStillShadeMat.value.copy(BIAS).multiply(sunCam.projectionMatrix).multiply(sunCam.matrixWorldInverse);

  // the wanderer: a few metres round them, drawn from the things on layer 1
  const fig = depthTarget(256, 256);
  const figCam = new THREE.OrthographicCamera(-figBox, figBox, figBox, -figBox, 1, 60);
  figCam.layers.set(1);
  shared.tFigShade.value = fig.depthTexture;
  const depthOnly = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  return {
    update(scene, at) {
      figCam.position.set(at.x, at.y + 1.0, at.z).addScaledVector(sun, 30);
      figCam.lookAt(at.x, at.y + 1.0, at.z);
      figCam.updateMatrixWorld(true);
      shared.uFigShadeMat.value.copy(BIAS).multiply(figCam.projectionMatrix).multiply(figCam.matrixWorldInverse);
      const keep = scene.overrideMaterial, target = renderer.getRenderTarget();
      scene.overrideMaterial = depthOnly;
      renderer.setRenderTarget(fig); renderer.clear(); renderer.render(scene, figCam); renderer.setRenderTarget(target);
      scene.overrideMaterial = keep;
    },
  };
}

// ---------------------------------------------------------------------------------------------------------- the canvas
// The world is painted into a picture with a depth beside it; this then lays in the one thing dabs can't do, the sun
// standing in the mist between things, and finishes the surface: the weave of the canvas under thin paint, a little
// varnish.
export function createFrame(renderer, shared, { samples = 4, shafts = 1, steps = 22, reach = 85, glow = [1.0, 0.86, 0.56], canvas = 1, varnish = 0.22 } = {}) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(size.x, size.y, { samples, depthBuffer: true, generateMipmaps: false });
  target.depthTexture = new THREE.DepthTexture(size.x, size.y, THREE.UnsignedIntType);
  target.texture.minFilter = target.texture.magFilter = THREE.LinearFilter;
  const uniforms = {
    ...shared,
    tColor: { value: target.texture }, tDepth: { value: target.depthTexture },
    uInvViewProj: { value: new THREE.Matrix4() }, uEye: { value: new THREE.Vector3() },
    uShafts: { value: shafts }, uSteps: { value: steps }, uReach: { value: reach }, uGlow: { value: new THREE.Color(...glow) },
    uCanvas: { value: canvas }, uVarnish: { value: varnish }, uSize: { value: size.clone() }, uWeave: { value: 1 },
    uExposure: { value: 1 },
    uBeam: { value: Array.from({ length: 8 }, () => new THREE.Vector4()) }, uBeamY: { value: new THREE.Vector4(0, 120, 0, 0) },
    uBeamDir: { value: Array.from({ length: 8 }, () => new THREE.Vector3(0, 1, 0)) }, uBeamCol: { value: new THREE.Color(1.0, 0.86, 0.58) },
  };
  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms, depthTest: false, depthWrite: false,
    vertexShader: /* glsl */ `out vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      ${COMMON}
      uniform sampler2D tColor;
      uniform sampler2D tDepth;
      uniform mat4 uInvViewProj;
      uniform vec3 uEye;
      uniform float uShafts;
      uniform float uSteps;
      uniform float uReach;
      uniform vec3 uGlow;
      uniform float uCanvas;
      uniform float uVarnish;
      uniform float uWeave;
      uniform vec2 uSize;
      uniform vec4 uBeam[8];     // x, z of where it meets the ground, radius, strength
      uniform vec3 uBeamDir[8];  // up toward its gap
      uniform vec4 uBeamY;       // y of its foot, y of the cloud base it comes through
      uniform vec3 uBeamCol;
      uniform float uExposure;   // A2: how much light the whole canvas holds (a darker world, the light in it the brighter)
      // A2: a shaft of sun from a gap in the cloud — how much of this line of sight runs through it, and how near its middle
      float beam(int i, vec3 eye, vec3 ray, float far) {
        vec4 b = uBeam[i]; if (b.w < 0.002) return 0.0;
        vec3 A = normalize(uBeamDir[i]), B = vec3(b.x, uBeamY.x, b.y), w = eye - B;
        vec3 rp = ray - A * dot(ray, A), wp = w - A * dot(w, A);
        float a = max(dot(rp, rp), 1e-6), tc = clamp(-dot(rp, wp) / a, 0.0, far);
        vec3 off = wp + rp * tc; float dmin = length(off);
        if (dmin > b.z * 1.6) return 0.0;
        float chord = 2.0 * sqrt(max(b.z * b.z * 2.56 - dmin * dmin, 0.0)) / sqrt(a);
        vec3 p = eye + ray * tc; float h = dot(p - B, A);
        float top = (uBeamY.y - uBeamY.x) / max(A.y, 0.05);
        float along = smoothstep(-2.0, 6.0, h) * (1.0 - smoothstep(top * 0.75, top, h)) * (0.55 + 0.45 * smoothstep(0.0, top * 0.6, h));
        vec3 e1 = normalize(cross(A, vec3(0.0, 1.0, 0.0)) + 1e-4);
        float st = texture(tNoise, vec2(dot(off, e1) / b.z * 0.9 + float(i) * 0.37, h * 0.004)).g;
        float prof = 1.0 - smoothstep(0.25, 1.0, dmin / (b.z * 1.6));
        return b.w * prof * along * min(chord / (b.z * 2.0), 1.4) * (0.45 + 1.0 * st * st);
      }
      in vec2 vUv;
      layout(location = 0) out vec4 outC;
      float weave(vec2 p) { // warp and weft of a medium linen, each thread a little uneven
        vec2 q = p / 2.6;
        float n = texture(tNoise, p / 310.0).r;
        float a = sin(q.x * 3.14159) * sin(q.y * 3.14159 + floor(q.x) * 3.14159);
        return a * (0.3 + 1.4 * n * n);
      }
      void main() {
        vec3 col = texture(tColor, vUv).rgb;
        if (uShafts > 0.0) {
          // sun in the mist: walk the line of sight and count how much of the air along it stands in the light
          float depth = texture(tDepth, vUv).r;
          vec4 h = uInvViewProj * vec4(vUv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
          vec3 world = h.xyz / h.w;
          vec3 ray = world - uEye;
          float far = length(ray);
          ray /= far;
          float reach = min(far, uReach);
          float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          float lit = 0.0, weight = 0.0;
          for (float i = 0.0; i < uSteps; i++) {
            float t = (i + jit) / uSteps;
            float w = exp(-t * reach * 0.022);
            lit += stillSunAt(uEye + ray * (t * reach)) * w;
            weight += w;
          }
          lit /= max(weight, 1e-3);
          float sunward = max(dot(ray, uSunDir), 0.0);
          float thick = 1.0 - exp(-reach * 0.03);
          float streak = 0.75 + 0.5 * texture(tNoise, vec2(dot(world.xz, vec2(uSunDir.z, -uSunDir.x)) * 0.11, world.y * 0.02)).g;
          vec3 glow = uGlow * (0.16 + 0.95 * pow(sunward, 2.5));
          col += glow * (lit - 0.34) * thick * streak * uShafts * 0.8;
        }
        {
          float depthB = texture(tDepth, vUv).r;
          vec4 hb = uInvViewProj * vec4(vUv * 2.0 - 1.0, depthB * 2.0 - 1.0, 1.0);
          vec3 wb = hb.xyz / hb.w, rb = wb - uEye; float farB = length(rb); rb /= farB;
          float g = 0.0; for (int i = 0; i < 8; i++) g += beam(i, uEye, rb, farB);
          col += uBeamCol * g * 0.2 * (1.0 - col * 0.6);
        }
        if (uCanvas > 0.0) {
          vec2 px = vUv * uSize / uWeave;
          float w = weave(px);
          float dx = weave(px + vec2(1.0, 0.0)) - w, dy = weave(px + vec2(0.0, 1.0)) - w;
          col *= 1.0 + (0.6 * dx - 0.8 * dy) * 0.022 * uCanvas + w * 0.006 * uCanvas;
        }
        col *= mix(uExposure, min(1.0, uExposure + 0.22), step(0.99999, texture(tDepth, vUv).r));   // the open sky keeps more of its light
        // the brightest passages roll off toward the white of the paint and never past it
        vec3 over = max(col - 0.8, 0.0);
        col = min(col, 0.8) + over / (1.0 + over * 5.0);
        // varnish: a little more depth in the darks, the lights left alone
        col = mix(col, col * col * (3.0 - 2.0 * col), uVarnish);
        outC = vec4(col, 1.0);
      }`,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material); quad.frustumCulled = false;
  const scene = new THREE.Scene(); scene.add(quad);
  const flat = new THREE.Camera(), viewProj = new THREE.Matrix4();
  return {
    target, uniforms,
    resize() { renderer.getDrawingBufferSize(size); target.setSize(size.x, size.y); uniforms.uSize.value.copy(size); },
    render(world, camera) {
      renderer.setRenderTarget(target); renderer.clear(); renderer.render(world, camera); renderer.setRenderTarget(null);
      viewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      uniforms.uInvViewProj.value.copy(viewProj).invert();
      uniforms.uEye.value.copy(camera.position);
      renderer.render(scene, flat);
    },
  };
}
