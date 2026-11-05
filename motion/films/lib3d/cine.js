// cinematic-3d · cine.js — the shot engine.
// A Film owns a three.js scene and camera and renders every frame through one fixed "photographic" pipeline:
//   (mirror)  planar reflection from a virtual camera under the ground plane + its own atmosphere + a streak blur
//   scene     HDR (half float), MSAA ×4, depth texture
//   atmos     exponential height fog + analytic in-scatter of every lamp (the glow halos) + optional raymarched cloud slab
//   bloom     6-level mip chain (13-tap down, tent up)
//   dof       physical-ish circle of confusion from depth, 64-tap golden-spiral gather at half res, near-field bleed
//   precip    rain streaks / snow flakes drawn after DOF, each defocused by its own depth (so near flakes become bokeh)
//   finish    exposure → AgX → look (contrast, saturation, split tone, lift/gain) → vignette, chromatic aberration, film grain
// Everything is a function of t: window.seek(t) renders frame t, nothing carries over between frames.
// Contract (same as the other skills): window.seek(t), window.DURATION, window.__ready; ?render=1 hides UI;
// ?t=3.2 freezes a frame; ?scale=0.5 renders at half size; ?pass=scene|atmos|dof|coc|mirror shows one stage.
import * as THREE from 'three';
export { THREE };

const Q = new URLSearchParams(location.search);

// Height fog is computed inside every material (patched fog chunks), not in a post pass: with MSAA the colour resolves per
// sample but the depth texture keeps one sample, so a post-pass fog erases thin geometry (twigs, wires) against the sky.
// Uniforms come from Film.fogU (added to every material on first render). The post pass only adds the lamp in-scatter.
THREE.ShaderChunk.fog_pars_vertex = `#ifdef USE_FOG\n varying vec3 vFogWP;\n#endif`;
THREE.ShaderChunk.fog_vertex = `#ifdef USE_FOG\n { vec4 fwp = vec4(transformed, 1.0);\n #ifdef USE_INSTANCING\n fwp = instanceMatrix * fwp;\n #endif\n vFogWP = (modelMatrix * fwp).xyz; }\n#endif`;
THREE.ShaderChunk.fog_pars_fragment = `#ifdef USE_FOG\n varying vec3 vFogWP; uniform float uFogDensity, uFogFalloff, uFogBase, uFogStart; uniform vec3 uFogColor, uFogColorUp;\n#endif`;
THREE.ShaderChunk.fog_fragment = `#ifdef USE_FOG
  { vec3 fd = vFogWP - cameraPosition; float fL = length(fd); vec3 frd = fd / max(fL, 1e-4);
    float fa = uFogDensity * exp(-uFogFalloff * (cameraPosition.y - uFogBase)); float fk = uFogFalloff * frd.y;
    float fs = min(uFogStart, fL);
    float fod = fa * (abs(fk) > 1e-4 ? (exp(-fk * fs) - exp(-fk * fL)) / fk : fL - fs);
    float fT = exp(-fod);
    gl_FragColor.rgb = gl_FragColor.rgb * fT + mix(uFogColor, uFogColorUp, smoothstep(-.05, .6, frd.y)) * (1. - fT); }
#endif`;
// GLSL for the same fog along a ray of length L (sky dome, post passes)
export const FOG_GLSL = /* glsl */`
  uniform float uFogDensity, uFogFalloff, uFogBase, uFogStart; uniform vec3 uFogColor, uFogColorUp;
  float fogT(vec3 o, vec3 d, float L){ float a = uFogDensity * exp(-uFogFalloff * (o.y - uFogBase)); float k = uFogFalloff * d.y; float s = min(uFogStart, L);
    return exp(-a * (abs(k) > 1e-4 ? (exp(-k * s) - exp(-k * L)) / k : L - s)); }
  vec3 fogCol(vec3 d){ return mix(uFogColor, uFogColorUp, smoothstep(-.05, .6, d.y)); }
`;
// depth of a pixel that thin geometry only partly covers: the resolved depth may be the sky's, the alpha (= coverage) knows better
const DEPTH_GLSL = /* glsl */`
  float sceneDepth(sampler2D tD, sampler2D tCov, vec2 uv, vec2 px){
    float d = texture2D(tD, uv).x;
    if (d >= .99999 && texture2D(tCov, uv).a > .08){
      for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) d = min(d, texture2D(tD, uv + vec2(x, y) * px).x);
    }
    return d;
  }
`;
export const RENDER = Q.has('render');
const PROF = Q.has('prof');
const OFF = new Set((Q.get('off') || '').split(',').filter(Boolean));   // debug: ?off=lights,scatter,mirror,precip,bloom,dof,fog,grain

// ---------- deterministic helpers ----------
export function rng(seed = 1) {   // mulberry32
  let a = (seed >>> 0) || 1;
  const f = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.range = (lo, hi) => lo + (hi - lo) * f();
  f.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * f());
  f.pick = arr => arr[Math.floor(f() * arr.length)];
  f.sign = () => (f() < 0.5 ? -1 : 1);
  f.gauss = () => { let s = 0; for (let i = 0; i < 4; i++) s += f(); return (s - 2) / 0.577; };
  return f;
}
export const hash1 = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export function noise1(x, seed = 0) {   // smooth 1D value noise in [-1,1]
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return (hash1(i + seed * 57.3) * (1 - u) + hash1(i + 1 + seed * 57.3) * u) * 2 - 1;
}
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const ease = {
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
};
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
// sRGB hex → linear THREE.Color (what every uniform here expects)
export const col = (hex, k = 1) => new THREE.Color(hex).multiplyScalar(k);

// ---------- shared GLSL ----------
export const GLSL = {
  hash: /* glsl */`
    float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    vec2 h22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
    float h13(vec3 p3){ p3 = fract(p3 * .1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
    float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
      return mix(mix(h12(i), h12(i+vec2(1,0)), u.x), mix(h12(i+vec2(0,1)), h12(i+vec2(1,1)), u.x), u.y); }
    float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
  `,
};

// ---------- fullscreen pass ----------
const FS_VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
class FSPass {
  constructor(frag, uniforms = {}, opts = {}) {
    this.mat = new THREE.ShaderMaterial({ vertexShader: FS_VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, ...opts });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat); this.mesh.frustumCulled = false;
    this.scene = new THREE.Scene(); this.scene.add(this.mesh);
    this.u = this.mat.uniforms;
  }
  render(renderer, target) { renderer.setRenderTarget(target); renderer.render(this.scene, FSPass.cam); }
}
FSPass.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const rt = (w, h, o = {}) => new THREE.WebGLRenderTarget(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)), {
  type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
  depthBuffer: false, generateMipmaps: false, ...o,
});

// ---------- the atmosphere pass (also used on the mirror image) ----------
const MAX_LAMPS = 24;
const ATMOS_FRAG = /* glsl */`
  precision highp float; precision highp sampler3D;
  #include <packing>
  varying vec2 vUv;
  uniform sampler2D tColor, tDepth; uniform sampler3D tNoise;
  uniform mat4 projInv, camWorld; uniform vec3 camPos; uniform float near, far, time, frame;
  uniform vec3 fogColor, fogColorUp, skyGlow; uniform float fogDensity, fogFalloff, fogBase, fogMax;
  uniform int lampCount; uniform vec4 lampPos[${MAX_LAMPS}]; uniform vec4 lampCol[${MAX_LAMPS}];
  uniform float scatter, anisotropy, phaseMix, fogInMat; uniform vec2 px;
  uniform float cloudOn, cloudBottom, cloudTop, cloudDensity, cloudScale, cloudCover, cloudSteps;
  uniform vec3 cloudWind, cloudLitTop, cloudLitBottom, cloudShadow;
  ${GLSL.hash}
  ${DEPTH_GLSL}
  float hg(float c, float g){ float g2 = g*g; return (1. - g2) / (4. * 3.14159 * pow(max(1. + g2 - 2.*g*c, 1e-4), 1.5)); }
  // optical depth of exp height fog along a ray (closed form)
  float fogOD(vec3 o, vec3 d, float L){
    float a = fogDensity * exp(-fogFalloff * (o.y - fogBase));
    float k = fogFalloff * d.y;
    return a * (abs(k) > 1e-4 ? (1. - exp(-k * L)) / k : L);
  }
  float cloudD(vec3 p){
    vec3 q = p * cloudScale + cloudWind * time;
    float n = texture(tNoise, q).r * .62 + texture(tNoise, q * 2.71 + .37).r * .26 + texture(tNoise, q * 6.3 - .19).r * .12;
    float h = clamp((p.y - cloudBottom) / (cloudTop - cloudBottom), 0., 1.);
    float shape = smoothstep(0., .12, h) * smoothstep(1., .62, h);       // soft floor, rounded tops
    return max(0., n * shape - cloudCover) / (1. - cloudCover) * cloudDensity;   // coverage remap: clear sky between the billows
  }
  void main(){
    vec4 c = texture2D(tColor, vUv);
    float dz = sceneDepth(tDepth, tColor, vUv, px);
    vec4 ndc = vec4(vUv * 2. - 1., dz * 2. - 1., 1.);
    vec4 vp = projInv * ndc; vp /= vp.w;
    vec3 wp = (camWorld * vec4(vp.xyz, 1.)).xyz;
    vec3 rd = normalize(wp - camPos);
    float D = dz >= .99999 ? fogMax : min(length(wp - camPos), fogMax);
    // height fog
    vec3 col = c.rgb;
    if (fogInMat < .5){ float T = exp(-fogOD(camPos, rd, D)); col = col * T + mix(fogColor, fogColorUp, smoothstep(-.05, .6, rd.y)) * (1. - T); }
    // lamps: single-scatter integral of 1/r^2 along the ray, closed form, attenuated by the fog in front
    vec3 ins = vec3(0.);
    for (int i = 0; i < ${MAX_LAMPS}; i++){
      if (i >= lampCount) break;
      vec3 L = lampPos[i].xyz; float sz = lampPos[i].w;
      vec3 oc = L - camPos; float t0 = dot(oc, rd);
      float h = max(length(oc - t0 * rd), sz);
      float I = (atan((D - t0) / h) + atan(t0 / h)) / h;
      float sigma = fogDensity * exp(-fogFalloff * (L.y - fogBase)) * lampCol[i].w;
      float cosT = dot(rd, normalize(oc));
      float ph = mix(1. / (4. * 3.14159), hg(cosT, anisotropy), phaseMix);
      float att = exp(-fogOD(camPos, rd, clamp(t0, 0., D)));
      ins += lampCol[i].rgb * sigma * I * ph * att;
    }
    col += ins * scatter;
    // sky glow: light pollution low on the horizon (only where we see sky)
    if (dz >= .99999) col += skyGlow * exp(-max(rd.y, 0.) * 6.) * (1. - c.a);
    // cloud / ground-fog slab, raymarched through a tiling 3D noise
    if (cloudOn > .5){
      float t0 = (cloudBottom - camPos.y) / rd.y, t1 = (cloudTop - camPos.y) / rd.y;
      float ta = max(0., min(t0, t1)), tb = min(D, max(t0, t1));
      if (abs(rd.y) < 1e-4){ ta = (camPos.y > cloudBottom && camPos.y < cloudTop) ? 0. : 1e9; tb = D; }
      if (tb > ta){
        tb = min(tb, ta + 700.);
        float n = cloudSteps, dt = (tb - ta) / n;
        float j = h12(gl_FragCoord.xy + fract(frame * .6180339) * 97.);
        float trans = 1.; vec3 acc = vec3(0.);
        for (int s = 0; s < 64; s++){
          if (float(s) >= n || trans < .01) break;
          vec3 p = camPos + rd * (ta + (float(s) + j) * dt);
          float d = cloudD(p);
          if (d > .001){
            float hh = clamp((p.y - cloudBottom) / (cloudTop - cloudBottom), 0., 1.);
            // sky light from above: two samples up the column; city glow from below: two samples down
            float up = exp(-(cloudD(p + vec3(0., 8., 0.)) * 8. + cloudD(p + vec3(3., 24., 2.)) * 16.));
            float dn = exp(-(cloudD(p - vec3(0., 10., 0.)) * 8. + cloudD(p - vec3(-2., 30., 3.)) * 14.));
            float powder = 1. - exp(-d * 40.);
            vec3 lit = cloudLitTop * (.12 + up * .88) * mix(.55, 1., powder) + cloudLitBottom * dn * (1. - hh * .7) + cloudShadow;
            // lamps under/inside the fog light it from below
            for (int i = 0; i < ${MAX_LAMPS}; i++){ if (i >= lampCount) break;
              vec3 dl = lampPos[i].xyz - p; lit += lampCol[i].rgb * lampCol[i].w * .004 / (dot(dl, dl) + 30.); }
            float a = 1. - exp(-d * dt);
            acc += trans * a * lit; trans *= 1. - a;
          }
        }
        col = col * trans + acc;
      }
    }
    gl_FragColor = vec4(col, c.a);
  }
`;

// streak blur for wet reflections: long in screen-vertical, short across
const STREAK_FRAG = /* glsl */`
  varying vec2 vUv; uniform sampler2D tIn; uniform vec2 dir; uniform float taps;
  void main(){
    vec3 s = vec3(0.); float w = 0.;
    for (int i = -12; i <= 12; i++){ float x = float(i) / 12.; float k = exp(-x * x * 3.);
      s += texture2D(tIn, vUv + dir * x).rgb * k; w += k; }
    gl_FragColor = vec4(s / w, 1.);
  }`;

// ---------- bloom ----------
const DOWN_FRAG = /* glsl */`
  varying vec2 vUv; uniform sampler2D tIn; uniform vec2 texel; uniform float first, threshold;
  vec3 t(vec2 o){ return texture2D(tIn, vUv + o * texel).rgb; }
  float lum(vec3 c){ return dot(c, vec3(.2126, .7152, .0722)); }
  void main(){
    vec3 a = t(vec2(-2,2)), b = t(vec2(0,2)), c = t(vec2(2,2)), d = t(vec2(-2,0)), e = t(vec2(0,0)), f = t(vec2(2,0));
    vec3 g = t(vec2(-2,-2)), h = t(vec2(0,-2)), i = t(vec2(2,-2)), j = t(vec2(-1,1)), k = t(vec2(1,1)), l = t(vec2(-1,-1)), m = t(vec2(1,-1));
    vec3 r;
    if (first > .5){ // Karis average on the first level kills fireflies
      vec3 g0 = (j+k+l+m) * .25, g1 = (a+b+d+e) * .25, g2 = (b+c+e+f) * .25, g3 = (d+e+g+h) * .25, g4 = (e+f+h+i) * .25;
      float w0 = 1./(1.+lum(g0)), w1 = 1./(1.+lum(g1)), w2 = 1./(1.+lum(g2)), w3 = 1./(1.+lum(g3)), w4 = 1./(1.+lum(g4));
      r = (g0*w0*.5 + (g1*w1 + g2*w2 + g3*w3 + g4*w4) * .125) / (w0*.5 + (w1+w2+w3+w4) * .125);
      r = max(r - threshold, 0.);
    } else r = e * .125 + (a+c+g+i) * .03125 + (b+d+f+h) * .0625 + (j+k+l+m) * .125;
    gl_FragColor = vec4(r, 1.);
  }`;
const UP_FRAG = /* glsl */`
  varying vec2 vUv; uniform sampler2D tIn, tBase; uniform vec2 texel; uniform float radius, baseW;
  void main(){
    vec2 o = texel * radius; vec3 s = vec3(0.);
    s += texture2D(tIn, vUv + vec2(-o.x, o.y)).rgb + texture2D(tIn, vUv + vec2(o.x, o.y)).rgb + texture2D(tIn, vUv + vec2(-o.x, -o.y)).rgb + texture2D(tIn, vUv + vec2(o.x, -o.y)).rgb;
    s += 2. * (texture2D(tIn, vUv + vec2(0., o.y)).rgb + texture2D(tIn, vUv + vec2(0., -o.y)).rgb + texture2D(tIn, vUv + vec2(o.x, 0.)).rgb + texture2D(tIn, vUv + vec2(-o.x, 0.)).rgb);
    s += 4. * texture2D(tIn, vUv).rgb;
    gl_FragColor = vec4(s / 16. + texture2D(tBase, vUv).rgb * baseW, 1.);
  }`;

// ---------- depth of field ----------
const COC_GLSL = /* glsl */`
  uniform float near, far, focus, aperture, maxCoc, cocScale;
  float viewDist(float dz){ return -perspectiveDepthToViewZ(dz, near, far); }
  // signed circle of confusion in full-res pixels: + behind focus, − in front. aperture = blur (px) at infinity
  float coc(float z){ return clamp(aperture * (1. - focus / z), -maxCoc, maxCoc) * cocScale; }
`;
const DOF_PREP = /* glsl */`
  #include <packing>
  varying vec2 vUv; uniform sampler2D tColor, tDepth; uniform vec2 texel;
  ${COC_GLSL}
  ${DEPTH_GLSL}
  void main(){
    vec3 c = texture2D(tColor, vUv).rgb;                       // bilinear = 2×2 box at half res
    float d0 = sceneDepth(tDepth, tColor, vUv + texel * vec2(-.5,-.5), texel), d1 = sceneDepth(tDepth, tColor, vUv + texel * vec2(.5,-.5), texel);
    float d2 = sceneDepth(tDepth, tColor, vUv + texel * vec2(-.5,.5), texel), d3 = sceneDepth(tDepth, tColor, vUv + texel * vec2(.5,.5), texel);
    float z = viewDist(min(min(d0, d1), min(d2, d3)));         // nearest of the 4: keeps near edges from shrinking
    gl_FragColor = vec4(c, coc(z) * .5);                       // half-res pixels
  }`;
const DOF_GATHER = /* glsl */`
  varying vec2 vUv; uniform sampler2D tIn, tTile; uniform vec2 texel; uniform float maxR, frame;
  ${GLSL.hash}
  void main(){
    vec4 C = texture2D(tIn, vUv); float cc = C.a;
    // sample only as far as the largest blur nearby (tile max, dilated): small blurs get all 64 samples, not a handful
    float R = clamp(texture2D(tTile, vUv).r + .5, 1., maxR);
    vec3 acc = vec3(0.); float ws = 0., nearW = 0.;
    float rot = h12(gl_FragCoord.xy + frame * 1.7) * 6.2831;
    const int N = 64;
    for (int i = 0; i < N; i++){
      float fi = float(i) + .5;
      float r = sqrt(fi / float(N)) * R;
      float a = fi * 2.39996323 + rot;
      vec2 off = vec2(cos(a), sin(a)) * r;
      vec4 S = texture2D(tIn, vUv + off * texel);
      float sc = S.a;
      float reach = abs(sc);
      if (sc > cc) reach = min(reach, max(abs(cc), 0.) * 2. + .5);  // far stuff may not spread over a nearer centre
      float w = smoothstep(r - 1.2, r + .3, reach);
      // brighter samples count a little more: punchy bokeh from HDR highlights
      w *= 1. + .25 * clamp(dot(S.rgb, vec3(.3, .5, .2)) - 1., 0., 6.);
      acc += S.rgb * w; ws += w;
      if (sc < -1. && sc < cc - .5) nearW += smoothstep(r - 1.2, r + .3, -sc);
    }
    vec3 b = ws > 0. ? acc / ws : C.rgb;
    gl_FragColor = vec4(b, clamp(nearW / float(N) * 3., 0., 1.));
  }`;
const DOF_TILE = /* glsl */`
  uniform sampler2D tIn; uniform vec2 srcTexel;
  void main(){ vec2 base = floor(gl_FragCoord.xy) * 8.; float m = 0.;
    for (int y = 0; y < 8; y++) for (int x = 0; x < 8; x++) m = max(m, abs(texture2D(tIn, (base + vec2(x, y) + .5) * srcTexel).a));
    gl_FragColor = vec4(m, 0., 0., 1.); }`;
const DOF_DILATE = /* glsl */`
  varying vec2 vUv; uniform sampler2D tIn; uniform vec2 texel;
  void main(){ float m = 0.; for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) m = max(m, texture2D(tIn, vUv + vec2(x, y) * texel).r);
    gl_FragColor = vec4(m, 0., 0., 1.); }`;
const DOF_TENT = /* glsl */`
  varying vec2 vUv; uniform sampler2D tIn; uniform vec2 texel;
  void main(){ vec4 s = vec4(0.);
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){ float w = (x == 0 ? 2. : 1.) * (y == 0 ? 2. : 1.); s += texture2D(tIn, vUv + vec2(x, y) * texel) * w; }
    gl_FragColor = s / 16.; }`;

// ---------- finish ----------
const FINISH_FRAG = /* glsl */`
  #include <packing>
  varying vec2 vUv;
  uniform sampler2D tSharp, tBlur, tBloom, tDepth, tPrecip; uniform float dofOn, precipOn;
  uniform vec2 res; uniform float frame, exposure, bloom, contrast, saturation, vignette, grain, grainSize, ca, flip;
  uniform vec3 lift, gain, shadowTint, highTint, bloomTint; uniform float showCoc;
  ${COC_GLSL}
  ${GLSL.hash}
  ${DEPTH_GLSL}
  // AgX (Troy Sobotka) with the polynomial fit by Benjamin Wrensch
  vec3 agxCurve(vec3 x){ vec3 x2 = x*x, x4 = x2*x2; return 15.5*x4*x2 - 40.14*x4*x + 31.96*x4 - 6.868*x2*x + .4298*x2 + .1191*x - .00232; }
  vec3 agx(vec3 v){
    const mat3 m = mat3(.842479062253094, .0423282422610123, .0423756549057051, .0784335999999992, .878468636469772, .0784336, .0792237451477643, .0791661274605434, .879142973793104);
    const float lo = -12.47393, hi = 4.026069;
    v = m * max(v, 1e-10); v = clamp(log2(v), lo, hi); v = (v - lo) / (hi - lo); return agxCurve(v);
  }
  vec3 agxEotf(vec3 v){
    const mat3 mi = mat3(1.19687900512017, -.0528968517574562, -.0529716355144438, -.0980208811401368, 1.15190312990417, -.0980434501171241, -.0990297440797205, -.0989611768448433, 1.15107367264116);
    return pow(max(mi * v, 0.), vec3(2.2));
  }
  vec3 scene(vec2 uv){
    vec3 s = texture2D(tSharp, uv).rgb;
    if (dofOn > .5){
      float z = viewDist(sceneDepth(tDepth, tSharp, uv, 1. / res));
      vec4 b = texture2D(tBlur, uv);
      float k = max(smoothstep(.7, 2.2, abs(coc(z))), b.a);
      s = mix(s, b.rgb, k);
    }
    s += texture2D(tBloom, uv).rgb * bloom * bloomTint;
    if (precipOn > .5) s += texture2D(tPrecip, uv).rgb;
    return s;
  }
  void main(){
    vec2 uv = flip > .5 ? 1. - vUv : vUv;
    vec2 cd = uv - .5;
    vec3 c;
    if (ca > 0.){ vec2 o = cd * dot(cd, cd) * ca * 14. / res;
      c = vec3(scene(uv - o).r, scene(uv).g, scene(uv + o).b); }
    else c = scene(uv);
    if (showCoc > .5){ float z = viewDist(texture2D(tDepth, uv).x); float k = coc(z) / maxCoc; gl_FragColor = vec4(max(k,0.), .1, max(-k,0.), 1.); return; }
    c *= exposure;
    c = agxEotf(agx(c));                                        // linear, display-referred
    // grade in a log-ish space: lift / gain, split tone, contrast around mid grey, saturation
    float L = dot(c, vec3(.2126, .7152, .0722));
    c = c * gain + lift * (1. - c);
    c *= mix(shadowTint, highTint, smoothstep(.02, .45, L));
    vec3 lg = log2(max(c, 1e-5)); lg = (lg + 2.47) * contrast - 2.47; c = exp2(lg);
    L = dot(c, vec3(.2126, .7152, .0722)); c = max(mix(vec3(L), c, saturation), 0.);
    // vignette (cos^4-ish)
    float r2 = dot(cd * vec2(res.x / res.y, 1.), cd * vec2(res.x / res.y, 1.));
    c *= mix(1., pow(max(1. - r2 * 1.1, 0.), 1.6), vignette);
    // to sRGB
    c = mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c));
    // film grain: two-hash gaussian-ish, strongest in the mid tones, a touch of colour; also dithers away banding
    vec2 gp = floor(gl_FragCoord.xy / grainSize);
    float fr = mod(frame, 977.);
    float n = (h12(gp + fr * 13.37) + h12(gp * 1.37 + fr * 7.1 + 3.) + h12(gp * .71 - fr * 3.3 + 9.) - 1.5) * .816;
    vec3 nc = vec3(n) + (vec3(h12(gp + fr + 1.1), h12(gp + fr + 2.2), h12(gp + fr + 3.3)) - .5) * .35;
    float Lg = dot(c, vec3(.299, .587, .114));
    c += nc * grain * (.35 + 2.4 * Lg * (1. - Lg));
    gl_FragColor = vec4(c, 1.);
  }`;

// ---------- precipitation (rain streaks / snow) ----------
const PRECIP_VERT = /* glsl */`
  #include <packing>
  attribute vec4 aSeed; attribute vec2 corner;
  uniform float time, kind, speed, speedVar, size, sway, streak, shutter;
  uniform vec3 boxMin, boxSize, wind; uniform vec2 res; uniform float fadeFar;
  uniform int lampCount; uniform vec4 lampPos[${MAX_LAMPS}]; uniform vec4 lampCol[${MAX_LAMPS}];
  uniform vec3 ambient; uniform float bright;
  ${COC_GLSL}
  varying vec2 vC; varying float vA, vZ, vSoft; varying vec3 vL;
  vec3 posAt(float t){
    float sp = speed * (1. + speedVar * (aSeed.w - .5) * 2.);
    vec3 v = vec3(wind.x, -sp, wind.z);
    vec3 p = aSeed.xyz * boxSize + v * t;
    if (kind > .5){ // snow: flutter
      float ph = aSeed.w * 40.;
      p.x += sin(t * 1.3 + ph) * sway + sin(t * .37 + ph * 2.) * sway * 1.6;
      p.z += cos(t * 1.1 + ph * 1.7) * sway;
    }
    return boxMin + mod(p, boxSize);
  }
  void main(){
    vec3 p = posAt(time);
    vec3 v = vec3(wind.x, -speed * (1. + speedVar * (aSeed.w - .5) * 2.), wind.z);
    vec4 cpA = projectionMatrix * viewMatrix * vec4(p, 1.);
    vec4 cpB = projectionMatrix * viewMatrix * vec4(p - v * shutter * streak, 1.);
    float z = cpA.w;
    if (cpA.w < .1 || cpB.w < .1){ gl_Position = vec4(2., 2., 2., 1.); return; }
    vec2 a = cpA.xy / cpA.w, b = cpB.xy / cpB.w;
    vec2 aPx = a * res * .5, bPx = b * res * .5;
    float c = abs(coc(z));                                    // own defocus
    float w0 = size * 900. / z;                              // projected size (px) for a flake/drop of 'size'
    float w = max(w0, .9) + c;
    vec2 d = bPx - aPx; float len = length(d);
    vec2 dir = len > .01 ? d / len : vec2(0., 1.); vec2 nrm = vec2(-dir.y, dir.x);
    vec2 px;
    if (kind > .5){ px = aPx + (corner.x * 2. - 1.) * w * vec2(1., 0.) * .5 + corner.y * w * vec2(0., 1.) * .5; vC = vec2(corner.x * 2. - 1., corner.y); }
    else { px = mix(aPx - dir * w * .5, bPx + dir * w * .5, corner.x) + nrm * corner.y * w * .5; vC = vec2(corner.x * 2. - 1., corner.y); }
    gl_Position = vec4(px / (res * .5), 0., 1.);
    // light: ambient + every lamp (inverse square, soft core)
    vec3 L = ambient;
    for (int i = 0; i < ${MAX_LAMPS}; i++){ if (i >= lampCount) break; vec3 dl = lampPos[i].xyz - p; L += lampCol[i].rgb * .9 / (dot(dl, dl) + 1.5); }
    vL = L * bright;
    // energy spreads over the defocused area; far drops fade
    float spread = (max(w0, .9) / w); spread *= kind > .5 ? spread : 1.;
    vA = spread * smoothstep(fadeFar, fadeFar * .3, z) * (kind > .5 ? 1. : clamp(4. / max(len, 4.), .15, 1.) );
    vZ = z; vSoft = clamp(c / w, 0., 1.);
  }`;
const PRECIP_FRAG = /* glsl */`
  #include <packing>
  uniform sampler2D tDepth; uniform vec2 res; uniform float near, far, kind;
  varying vec2 vC; varying float vA, vZ, vSoft; varying vec3 vL;
  void main(){
    float sz = -perspectiveDepthToViewZ(texture2D(tDepth, gl_FragCoord.xy / res).x, near, far);
    float occ = smoothstep(0., .6, sz - vZ);
    float m;
    if (kind > .5){ float r = length(vC); m = 1. - smoothstep(mix(.55, .0, vSoft) , 1., r); m *= mix(1., .85 + .3 * smoothstep(.6, .95, r), vSoft); }
    else { m = (1. - vC.y * vC.y) * smoothstep(1., .55, abs(vC.x)); }
    gl_FragColor = vec4(vL * m * vA * occ, 1.);
  }`;

// ---------- 3D noise texture for clouds (tiling, seeded, built once) ----------
function noise3DTexture(N = 64, seed = 7) {
  const R = rng(seed), g = new Float32Array(N * N * N);
  // tiling gradient-free value noise at 3 lattice sizes + worley for billows
  const lat = (n) => { const a = new Float32Array(n * n * n); for (let i = 0; i < a.length; i++) a[i] = R(); return a; };
  const sample = (a, n, x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), fx = x - xi, fy = y - yi, fz = z - zi;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
    const I = (i, j, k) => a[(((i % n) + n) % n) + ((((j % n) + n) % n) + (((k % n) + n) % n) * n) * n];
    const l = (j, k) => I(xi, j, k) * (1 - ux) + I(xi + 1, j, k) * ux;
    const m = k => l(yi, k) * (1 - uy) + l(yi + 1, k) * uy;
    return m(zi) * (1 - uz) + m(zi + 1) * uz;
  };
  const L1 = lat(4), L2 = lat(8), L3 = lat(16);
  // worley at three cell counts per tile (4, 8, 16), each tiling exactly
  const mkPts = P => { const a = []; for (let i = 0; i < P * P * P; i++) a.push([R(), R(), R()]); return a; };
  const worley = (pts, P, x, y, z) => {   // x,y,z in [0,P)
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z); let d = 9;
    for (let k = -1; k <= 1; k++) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const cx = xi + i, cy = yi + j, cz = zi + k;
      const p = pts[(((cx % P) + P) % P) + ((((cy % P) + P) % P) + (((cz % P) + P) % P) * P) * P];
      const dx = cx + p[0] - x, dy = cy + p[1] - y, dz = cz + p[2] - z; d = Math.min(d, dx * dx + dy * dy + dz * dz);
    }
    return Math.min(1, Math.sqrt(d));
  };
  const W1 = mkPts(4), W2 = mkPts(8), W3 = mkPts(16);
  const f = new Float32Array(N * N * N); let lo = 1e9, hi = -1e9;
  for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N, w = z / N;
    const vn = sample(L1, 4, u * 4, v * 4, w * 4) * .6 + sample(L2, 8, u * 8, v * 8, w * 8) * .28 + sample(L3, 16, u * 16, v * 16, w * 16) * .12;
    const wf = (1 - worley(W1, 4, u * 4, v * 4, w * 4)) * .6 + (1 - worley(W2, 8, u * 8, v * 8, w * 8)) * .27 + (1 - worley(W3, 16, u * 16, v * 16, w * 16)) * .13;
    const val = wf * .7 + vn * .45;   // billows from the worley, large-scale variation from the value noise
    f[x + (y + z * N) * N] = val; lo = Math.min(lo, val); hi = Math.max(hi, val);
  }
  const out = new Uint8Array(N * N * N);
  for (let i = 0; i < f.length; i++) out[i] = Math.round((f[i] - lo) / (hi - lo) * 255);   // use the full range
  const t = new THREE.Data3DTexture(out, N, N, N);
  t.format = THREE.RedFormat; t.type = THREE.UnsignedByteType; t.minFilter = t.magFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = t.wrapR = THREE.RepeatWrapping; t.unpackAlignment = 1; t.needsUpdate = true;
  return t;
}

// ---------- the Film ----------
export class Film {
  constructor(o = {}) {
    this.W = o.W || 1080; this.H = o.H || 1920; this.dur = o.dur || 6; this.fps = o.fps || 30;
    const fit = RENDER ? 1 : Math.min(1, (innerHeight * devicePixelRatio) / this.H, (innerWidth * devicePixelRatio) / this.W);
    this.scale = +(Q.get('scale') || (RENDER ? 1 : Math.max(.35, fit)));
    this.w = Math.round(this.W * this.scale); this.h = Math.round(this.H * this.scale);
    const canvas = document.createElement('canvas'); document.body.appendChild(canvas); this.canvas = canvas;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance', stencil: false });
    r.setPixelRatio(1); r.setSize(this.w, this.h, false);
    r.toneMapping = THREE.NoToneMapping; r.outputColorSpace = THREE.LinearSRGBColorSpace;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.shadowMap.autoUpdate = true;
    this.scene = new THREE.Scene(); this.scene.background = null;
    this.camera = new THREE.PerspectiveCamera(o.fov || 40, this.W / this.H, o.near || .1, o.far || 2000);
    this.time = 0; this.frame = 0;
    this.lamps = [];
    this.updaters = [];
    // look defaults (override any field)
    this.atmos = Object.assign({ density: .02, falloff: .08, base: 0, start: 0, max: 1500, color: col('#1a2233', .5), colorUp: null, skyGlow: col('#000000'), scatter: 1, anisotropy: .55, phaseMix: .6 }, o.atmos || {});
    this.cloud = o.cloud ? Object.assign({ bottom: 0, top: 60, density: .06, scale: .004, cover: .45, steps: 28, wind: V(.01, 0, .004), litTop: col('#9fb0d8', .5), litBottom: col('#c08a5a', .5), shadow: col('#1c2440', .2) }, o.cloud) : null;
    this.bloomCfg = Object.assign({ strength: .07, radius: 1, threshold: 0, tint: col('#ffffff') }, o.bloom || {});
    this.dofCfg = o.dof === false ? null : Object.assign({ focus: 10, aperture: 18, maxCoc: 36 }, o.dof || {});
    this.look = Object.assign({ exposure: 1, contrast: 1.05, saturation: 1, lift: col('#000000'), gain: col('#ffffff'), shadowTint: col('#ffffff'), highTint: col('#ffffff'), vignette: .35, grain: .035, grainSize: 1, ca: .6, flip: 0 }, o.look || {});
    this.mirrorCfg = null; this.precip = [];
    const a = this.atmos;
    this.fogU = { uFogDensity: { value: a.density }, uFogFalloff: { value: a.falloff }, uFogBase: { value: a.base }, uFogStart: { value: a.start }, uFogColor: { value: a.color.clone() }, uFogColorUp: { value: (a.colorUp || a.color).clone() } };
    this.scene.fog = new THREE.Fog(0x000000, 1, 2);   // only switches USE_FOG on; the patched chunks use fogU
    this._initPasses();
  }

  // a light that also glows in the fog. pos: Vector3, color: hex, power: in-scatter strength, light: candela for a real PointLight (0 = none)
  lamp(pos, color = '#ffc77a', { power = 1, size = .25, light = 0, distance = 0, shadow = false, fog = 1 } = {}) {
    const c = col(color);
    const L = { pos: pos.clone(), color: c, power, size, fog };
    if (light > 0) {
      const pl = new THREE.PointLight(c, light, distance, 2); pl.position.copy(pos);
      if (shadow) { pl.castShadow = true; pl.shadow.mapSize.set(1024, 1024); pl.shadow.bias = -.002; pl.shadow.radius = 3; pl.shadow.camera.near = .2; }
      this.scene.add(pl); L.light = pl;
    }
    this.lamps.push(L); return L;
  }
  onFrame(fn) { this.updaters.push(fn); return this; }

  // ---------- passes ----------
  _initPasses() {
    const { w, h } = this, R = this.renderer;
    const depth = new THREE.DepthTexture(w, h); depth.type = THREE.FloatType;
    this.sceneRT = rt(w, h, { depthBuffer: true, depthTexture: depth, samples: +(Q.get('msaa') || 4) });
    this.atmosRT = rt(w, h);
    this.noise3D = this.cloud ? noise3DTexture(64, 11) : new THREE.Data3DTexture(new Uint8Array(8), 2, 2, 2);
    const lampU = () => ({ lampCount: { value: 0 }, lampPos: { value: Array.from({ length: MAX_LAMPS }, () => new THREE.Vector4()) }, lampCol: { value: Array.from({ length: MAX_LAMPS }, () => new THREE.Vector4()) } });
    const atmosU = () => ({
      tColor: { value: null }, tDepth: { value: null }, tNoise: { value: this.noise3D },
      projInv: { value: new THREE.Matrix4() }, camWorld: { value: new THREE.Matrix4() }, camPos: { value: V() },
      near: { value: .1 }, far: { value: 1000 }, time: { value: 0 }, frame: { value: 0 },
      fogColor: { value: new THREE.Color() }, fogColorUp: { value: new THREE.Color() }, skyGlow: { value: new THREE.Color() },
      fogDensity: { value: 0 }, fogFalloff: { value: 0 }, fogBase: { value: 0 }, fogMax: { value: 1000 },
      scatter: { value: 1 }, anisotropy: { value: .5 }, phaseMix: { value: .6 }, fogInMat: { value: 1 }, px: { value: new THREE.Vector2(1 / w, 1 / h) },
      cloudOn: { value: 0 }, cloudBottom: { value: 0 }, cloudTop: { value: 1 }, cloudDensity: { value: 0 }, cloudScale: { value: 1 }, cloudCover: { value: .5 }, cloudSteps: { value: 24 },
      cloudWind: { value: V() }, cloudLitTop: { value: new THREE.Color() }, cloudLitBottom: { value: new THREE.Color() }, cloudShadow: { value: new THREE.Color() },
      ...lampU(),
    });
    this.atmosPass = new FSPass(ATMOS_FRAG, atmosU());
    // bloom chain from half res
    this.bloomRTs = []; let bw = w / 2, bh = h / 2;
    for (let i = 0; i < 6; i++) { this.bloomRTs.push(rt(bw, bh)); bw /= 2; bh /= 2; }
    this.bloomUpRTs = this.bloomRTs.slice(0, 5).map(t => rt(t.width, t.height));
    this.downPass = new FSPass(DOWN_FRAG, { tIn: { value: null }, texel: { value: new THREE.Vector2() }, first: { value: 0 }, threshold: { value: 0 } });
    this.upPass = new FSPass(UP_FRAG, { tIn: { value: null }, tBase: { value: null }, texel: { value: new THREE.Vector2() }, radius: { value: 1 }, baseW: { value: 1 } });
    // dof
    const cocU = () => ({ near: { value: .1 }, far: { value: 1000 }, focus: { value: 10 }, aperture: { value: 10 }, maxCoc: { value: 30 }, cocScale: { value: this.scale } });
    this.dofA = rt(w / 2, h / 2); this.dofB = rt(w / 2, h / 2);
    this.prepPass = new FSPass(DOF_PREP, { tColor: { value: null }, tDepth: { value: null }, texel: { value: new THREE.Vector2(1 / w, 1 / h) }, ...cocU() });
    const tw = Math.ceil(w / 16), th = Math.ceil(h / 16), near = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter };
    this.tileA = rt(tw, th, near); this.tileB = rt(tw, th, near);
    this.tilePass = new FSPass(DOF_TILE, { tIn: { value: null }, srcTexel: { value: new THREE.Vector2(2 / w, 2 / h) } });
    this.dilatePass = new FSPass(DOF_DILATE, { tIn: { value: null }, texel: { value: new THREE.Vector2(1 / tw, 1 / th) } });
    this.gatherPass = new FSPass(DOF_GATHER, { tIn: { value: null }, tTile: { value: this.tileB.texture }, texel: { value: new THREE.Vector2(2 / w, 2 / h) }, maxR: { value: 10 }, frame: { value: 0 } });
    this.tentPass = new FSPass(DOF_TENT, { tIn: { value: null }, texel: { value: new THREE.Vector2(2 / w, 2 / h) } });
    // precip target (additive light from drops/flakes)
    this.precipRT = rt(w, h);
    this.finishPass = new FSPass(FINISH_FRAG, {
      tSharp: { value: null }, tBlur: { value: null }, tBloom: { value: null }, tDepth: { value: null }, tPrecip: { value: null },
      dofOn: { value: 0 }, precipOn: { value: 0 }, res: { value: new THREE.Vector2(w, h) }, frame: { value: 0 },
      exposure: { value: 1 }, bloom: { value: .05 }, contrast: { value: 1 }, saturation: { value: 1 }, vignette: { value: .3 }, grain: { value: .03 }, grainSize: { value: 1 }, ca: { value: 0 }, flip: { value: 0 },
      lift: { value: new THREE.Color() }, gain: { value: new THREE.Color() }, shadowTint: { value: new THREE.Color() }, highTint: { value: new THREE.Color() }, bloomTint: { value: new THREE.Color() },
      showCoc: { value: 0 }, ...cocU(),
    });
    this.copyPass = new FSPass(/* glsl */`varying vec2 vUv; uniform sampler2D tIn; uniform float gain; void main(){ vec3 c = texture2D(tIn, vUv).rgb * gain; c = c / (1. + c); gl_FragColor = vec4(pow(c, vec3(1./2.2)), 1.); }`, { tIn: { value: null }, gain: { value: 1 } });
    this.streakPass = new FSPass(STREAK_FRAG, { tIn: { value: null }, dir: { value: new THREE.Vector2() } });
    this._lampU = lampU;
  }

  // ---------- planar reflection (wet ground / puddle) ----------
  // res: fraction of the frame size. Ground meshes go on layer 1 (use film.ground(mesh)) so the mirror camera skips them.
  mirror({ y = 0, res = .5, streak = 1, atmos = true } = {}) {
    const mw = this.w * res, mh = this.h * res;
    const depth = new THREE.DepthTexture(mw, mh); depth.type = THREE.FloatType;
    this.mirrorCfg = { y, res, streak, atmos };
    this.mirrorRT = rt(mw, mh, { depthBuffer: true, depthTexture: depth, samples: res >= .99 ? 4 : 0 });
    this.mirrorAtmosRT = rt(mw, mh); this.mirrorBlurA = rt(mw / 2, mh / 2); this.mirrorBlurB = rt(mw / 2, mh / 2);
    this.mirrorCam = new THREE.PerspectiveCamera();
    this.mirrorAtmos = new FSPass(ATMOS_FRAG, THREE.UniformsUtils.clone(this.atmosPass.mat.uniforms));
    this.mirrorAtmos.u.tNoise.value = this.noise3D;
    this.mirrorU = { tMirror: { value: this.mirrorAtmosRT.texture }, tMirrorBlur: { value: this.mirrorBlurB.texture }, tMirrorDepth: { value: depth }, mirrorMatrix: { value: new THREE.Matrix4() }, mirrorProjInv: { value: new THREE.Matrix4() }, mirrorWorld: { value: new THREE.Matrix4() }, mirrorY: { value: y }, mainViewProj: { value: new THREE.Matrix4() } };
    return this.mirrorU;
  }
  ground(mesh) { mesh.layers.set(1); return mesh; }

  // ---------- precipitation ----------
  // kind 'rain' | 'snow'. box: [min Vector3, size Vector3] in world space (keep it around the camera's view)
  addPrecip({ kind = 'rain', count = 20000, box = [V(-20, 0, -40), V(40, 25, 50)], speed = kind === 'rain' ? 9 : 1.1, speedVar = .25, size = kind === 'rain' ? .006 : .012, sway = kind === 'snow' ? .35 : 0, wind = V(0, 0, 0), streak = 1, shutter = 1 / 50, ambient = col('#7f8aa0', .06), bright = 1, seed = 3, far = 0 } = {}) {
    const R = rng(seed), g = new THREE.InstancedBufferGeometry();
    g.setAttribute('corner', new THREE.Float32BufferAttribute([0, -1, 1, -1, 1, 1, 0, 1], 2));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    const s = new Float32Array(count * 4); for (let i = 0; i < s.length; i++) s[i] = R();
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(s, 4)); g.instanceCount = count;
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    const u = {
      time: { value: 0 }, kind: { value: kind === 'snow' ? 1 : 0 }, speed: { value: speed }, speedVar: { value: speedVar }, size: { value: size }, sway: { value: sway }, streak: { value: streak }, shutter: { value: shutter },
      boxMin: { value: box[0] }, boxSize: { value: box[1] }, fadeFar: { value: far || box[1].z * .98 }, wind: { value: wind }, res: { value: new THREE.Vector2(this.w, this.h) }, ambient: { value: ambient }, bright: { value: bright },
      tDepth: { value: this.sceneRT.depthTexture }, near: { value: .1 }, far: { value: 1000 }, focus: { value: 10 }, aperture: { value: 0 }, maxCoc: { value: 30 }, cocScale: { value: this.scale },
      ...this._lampU(),
    };
    const m = new THREE.ShaderMaterial({ vertexShader: PRECIP_VERT, fragmentShader: PRECIP_FRAG, uniforms: u, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false;
    const sc = new THREE.Scene(); sc.add(mesh);
    const p = { kind, mesh, u, scene: sc }; this.precip.push(p); return p;
  }

  _debugOff() {
    if (OFF.has('lights')) this.scene.traverse(o => { if (o.isLight && !o.isHemisphereLight) o.intensity = 0; });
    if (OFF.has('ambient')) this.scene.traverse(o => { if (o.isHemisphereLight || o.isAmbientLight) o.intensity = 0; });
    if (OFF.has('scatter')) this.atmos.scatter = 0;
    if (OFF.has('fog')) this.atmos.density = 0;
    if (OFF.has('precip')) this.precip.length = 0;
    if (OFF.has('bloom')) this.bloomCfg.strength = 0;
    if (OFF.has('dof') && this.dofCfg) this.dofCfg.aperture = 0;
    if (OFF.has('grain')) this.look.grain = 0;
    if (OFF.has('mirror') && this.mirrorU) { this.mirrorCfg.atmos = false; this._mirrorOff = true; }
  }
  // give every material in the scene the shared fog uniforms (once per material)
  _fogMaterials() {
    const U = this.fogU, a = this.atmos;
    U.uFogDensity.value = a.density; U.uFogFalloff.value = a.falloff; U.uFogBase.value = a.base; U.uFogStart.value = a.start; U.uFogColor.value.copy(a.color); U.uFogColorUp.value.copy(a.colorUp || a.color);
    this.scene.traverse(o => {
      const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of ms) {
        if (m.userData.cineFog) continue; m.userData.cineFog = true;
        const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey.bind(m);
        m.onBeforeCompile = function (sh, r) { Object.assign(sh.uniforms, U); if (prev) prev.call(this, sh, r); };
        m.customProgramCacheKey = () => prevKey() + '|cf';
        if (m.isShaderMaterial && m.uniforms) Object.assign(m.uniforms, U);
        m.needsUpdate = true;
      }
    });
  }
  _fillLamps(u, cam) {
    const n = Math.min(this.lamps.length, MAX_LAMPS); u.lampCount.value = n;
    for (let i = 0; i < n; i++) {
      const L = this.lamps[i]; const p = L.light ? L.light.position : L.pos;
      u.lampPos.value[i].set(p.x, p.y, p.z, L.size);
      u.lampCol.value[i].set(L.color.r * L.power, L.color.g * L.power, L.color.b * L.power, L.fog);
    }
  }
  _fillAtmos(u, cam, colorTex, depthTex) {
    const a = this.atmos, c = this.cloud;
    u.tColor.value = colorTex; u.tDepth.value = depthTex;
    u.projInv.value.copy(cam.projectionMatrixInverse); u.camWorld.value.copy(cam.matrixWorld); u.camPos.value.setFromMatrixPosition(cam.matrixWorld);
    u.near.value = cam.near; u.far.value = cam.far; u.time.value = this.time; u.frame.value = this.frame;
    u.fogColor.value.copy(a.color); u.fogColorUp.value.copy(a.colorUp || a.color); u.skyGlow.value.copy(a.skyGlow);
    u.fogDensity.value = a.density; u.fogFalloff.value = a.falloff; u.fogBase.value = a.base; u.fogMax.value = a.max;
    u.scatter.value = a.scatter; u.anisotropy.value = a.anisotropy; u.phaseMix.value = a.phaseMix;
    u.cloudOn.value = c ? 1 : 0;
    if (c) { u.cloudBottom.value = c.bottom; u.cloudTop.value = c.top; u.cloudDensity.value = c.density; u.cloudScale.value = c.scale; u.cloudCover.value = c.cover; u.cloudSteps.value = c.steps; u.cloudWind.value.copy(c.wind); u.cloudLitTop.value.copy(c.litTop); u.cloudLitBottom.value.copy(c.litBottom); u.cloudShadow.value.copy(c.shadow); }
    this._fillLamps(u, cam);
  }
  _fillCoc(u, cam) {
    const d = this.dofCfg || { focus: 10, aperture: 0, maxCoc: 1 };
    u.near.value = cam.near; u.far.value = cam.far; u.focus.value = d.focus; u.aperture.value = d.aperture; u.maxCoc.value = d.maxCoc; u.cocScale.value = this.scale;
  }

  _renderMirror() {
    const cam = this.camera, mc = this.mirrorCam, y = this.mirrorCfg.y, R = this.renderer;
    const p = V().setFromMatrixPosition(cam.matrixWorld); p.y = 2 * y - p.y;
    const dir = V(); cam.getWorldDirection(dir); dir.y = -dir.y;
    const up = V(0, 1, 0).applyQuaternion(cam.quaternion); up.y = -up.y;
    mc.position.copy(p); mc.up.copy(up); mc.lookAt(p.clone().add(dir));
    mc.near = cam.near; mc.far = cam.far; mc.fov = cam.fov; mc.aspect = cam.aspect; mc.updateProjectionMatrix(); mc.updateMatrixWorld();
    mc.layers.set(0);
    // oblique near plane = the mirror plane, so nothing under it leaks in (Lengyel)
    const plane = new THREE.Plane(V(0, 1, 0), -y).applyMatrix4(mc.matrixWorldInverse);
    const cp = new THREE.Vector4(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
    const pm = mc.projectionMatrix, q = new THREE.Vector4();
    q.x = (Math.sign(cp.x) + pm.elements[8]) / pm.elements[0]; q.y = (Math.sign(cp.y) + pm.elements[9]) / pm.elements[5]; q.z = -1; q.w = (1 + pm.elements[10]) / pm.elements[14];
    cp.multiplyScalar(2 / cp.dot(q));
    pm.elements[2] = cp.x; pm.elements[6] = cp.y; pm.elements[10] = cp.z + 1; pm.elements[14] = cp.w;
    mc.projectionMatrixInverse.copy(pm).invert();
    R.setRenderTarget(this.mirrorRT); R.setClearColor(0x000000, 0); R.clear(); R.render(this.scene, mc);
    const mu = this.mirrorU;
    mu.mirrorMatrix.value.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1).multiply(mc.projectionMatrix).multiply(mc.matrixWorldInverse);
    mu.mirrorProjInv.value.copy(mc.projectionMatrixInverse); mu.mirrorWorld.value.copy(mc.matrixWorld);
    mu.mainViewProj.value.copy(cam.projectionMatrix).multiply(cam.matrixWorldInverse);
    if (this.mirrorCfg.atmos) { this._fillAtmos(this.mirrorAtmos.u, mc, this.mirrorRT.texture, this.mirrorRT.depthTexture); this.mirrorAtmos.render(R, this.mirrorAtmosRT); }
    else { this.copyLinear(this.mirrorRT.texture, this.mirrorAtmosRT); }
    // streaks: long along the image vertical, then a little across
    const s = this.mirrorCfg.streak;
    this.streakPass.u.tIn.value = this.mirrorAtmosRT.texture; this.streakPass.u.dir.value.set(0, .045 * s); this.streakPass.render(R, this.mirrorBlurA);
    this.streakPass.u.tIn.value = this.mirrorBlurA.texture; this.streakPass.u.dir.value.set(.006 * s, 0); this.streakPass.render(R, this.mirrorBlurB);
  }
  copyLinear(tex, target) {
    if (!this._lin) this._lin = new FSPass(`varying vec2 vUv; uniform sampler2D tIn; void main(){ gl_FragColor = texture2D(tIn, vUv); }`, { tIn: { value: null } });
    this._lin.u.tIn.value = tex; this._lin.render(this.renderer, target);
  }

  // ---------- one frame ----------
  _mark(label) {   // ?prof=1: wait for the GPU after each stage and log the time it took
    if (!PROF) return; this.renderer.setRenderTarget(null); const gl = this.renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    const now = performance.now(); (this.prof = this.prof || {})[label] = (this.prof[label] || 0) + now - this._t; this._t = now;
  }
  render(t) {
    this._t = performance.now();
    this.time = t; this.frame = Math.round(t * this.fps);
    for (const f of this.updaters) f(t, this);
    const R = this.renderer, cam = this.camera;
    cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    cam.layers.enable(1); cam.layers.enable(2);   // 1 = ground (not mirrored), 2 = not in reflections (trees)
    this._fogMaterials();
    if (OFF.size) this._debugOff();
    this._mark('update');
    if (this.mirrorCfg && !this._mirrorOff) this._renderMirror();
    this._mark('mirror');
    // scene
    R.setRenderTarget(this.sceneRT); R.setClearColor(0x000000, 0); R.clear(); R.render(this.scene, cam);
    this._mark('scene');
    const depth = this.sceneRT.depthTexture;
    const pass = Q.get('pass');
    if (pass === 'scene') { this.copyPass.u.tIn.value = this.sceneRT.texture; this.copyPass.render(R, null); return; }
    if (pass === 'noise') { const P = new FSPass(`precision highp sampler3D; varying vec2 vUv; uniform sampler3D tN; void main(){ gl_FragColor = vec4(vec3(texture(tN, vec3(vUv * 2., .3)).r), 1.); }`, { tN: { value: this.noise3D } }); P.render(R, null); return; }
    if (pass === 'mirror' && this.mirrorCfg) { this.copyPass.u.tIn.value = this.mirrorAtmosRT.texture; this.copyPass.render(R, null); return; }
    // atmosphere
    this._fillAtmos(this.atmosPass.u, cam, this.sceneRT.texture, depth); this.atmosPass.render(R, this.atmosRT);
    this._mark('atmos');
    if (pass === 'atmos') { this.copyPass.u.tIn.value = this.atmosRT.texture; this.copyPass.render(R, null); return; }
    // bloom
    const B = this.bloomCfg; let src = this.atmosRT;
    for (let i = 0; i < this.bloomRTs.length; i++) {
      const d = this.downPass.u; d.tIn.value = src.texture; d.texel.value.set(1 / src.width, 1 / src.height); d.first.value = i === 0 ? 1 : 0; d.threshold.value = B.threshold;
      this.downPass.render(R, this.bloomRTs[i]); src = this.bloomRTs[i];
    }
    let up = this.bloomRTs[this.bloomRTs.length - 1];
    for (let i = this.bloomRTs.length - 2; i >= 0; i--) {
      const u = this.upPass.u; u.tIn.value = up.texture; u.tBase.value = this.bloomRTs[i].texture; u.texel.value.set(1 / up.width, 1 / up.height); u.radius.value = B.radius; u.baseW.value = 1;
      this.upPass.render(R, this.bloomUpRTs[i]); up = this.bloomUpRTs[i];
    }
    this._mark('bloom');
    // dof
    const F = this.finishPass.u;
    if (this.dofCfg) {
      const P = this.prepPass.u; P.tColor.value = this.atmosRT.texture; P.tDepth.value = depth; this._fillCoc(P, cam); this.prepPass.render(R, this.dofA);
      this.tilePass.u.tIn.value = this.dofA.texture; this.tilePass.render(R, this.tileA);
      this.dilatePass.u.tIn.value = this.tileA.texture; this.dilatePass.render(R, this.tileB);
      const G = this.gatherPass.u; G.tIn.value = this.dofA.texture; G.maxR.value = this.dofCfg.maxCoc * this.scale * .5; G.frame.value = this.frame; this.gatherPass.render(R, this.dofB);
      this.tentPass.u.tIn.value = this.dofB.texture; this.tentPass.render(R, this.dofA);
    }
    this._mark('dof');
    // precip
    if (this.precip.length) {
      R.setRenderTarget(this.precipRT); R.setClearColor(0x000000, 1); R.clear();
      for (const p of this.precip) { const u = p.u; u.time.value = t; this._fillCoc(u, cam); u.tDepth.value = depth; this._fillLamps(u, cam); R.render(p.scene, cam); }
    }
    this._mark('precip');
    // finish
    const L = this.look;
    F.tSharp.value = this.atmosRT.texture; F.tBlur.value = this.dofA.texture; F.tBloom.value = up.texture; F.tDepth.value = depth; F.tPrecip.value = this.precipRT.texture;
    F.dofOn.value = this.dofCfg ? 1 : 0; F.precipOn.value = this.precip.length ? 1 : 0; F.frame.value = this.frame;
    F.exposure.value = L.exposure; F.bloom.value = B.strength; F.bloomTint.value.copy(B.tint); F.contrast.value = L.contrast; F.saturation.value = L.saturation;
    F.vignette.value = L.vignette; F.grain.value = L.grain; F.grainSize.value = Math.max(1, L.grainSize * this.scale); F.ca.value = L.ca * this.scale; F.flip.value = L.flip;
    F.lift.value.copy(L.lift); F.gain.value.copy(L.gain); F.shadowTint.value.copy(L.shadowTint); F.highTint.value.copy(L.highTint);
    F.showCoc.value = pass === 'coc' ? 1 : 0; this._fillCoc(F, cam);
    R.setRenderTarget(null); R.render(this.finishPass.scene, FSPass.cam);
    this._mark('finish');
  }

  // ---------- page contract ----------
  start() {
    window.DURATION = this.dur; window.FPS = this.fps;
    window.seek = t => { this.render(Math.max(0, Math.min(this.dur, t))); return true; };
    window.__film = this;
    const css = document.createElement('style');
    css.textContent = `html,body{margin:0;height:100%;background:#000;overflow:hidden}canvas{position:absolute;inset:0;margin:auto;max-width:100%;max-height:100%;width:auto;height:100%;aspect-ratio:${this.W}/${this.H};object-fit:contain}`;
    document.head.appendChild(css);
    const tq = Q.get('t');
    if (RENDER || tq != null) { this.render(+(tq || 0)); window.__ready = true; return; }
    // live: loop with the clock; click / space pauses
    let paused = false, t0 = performance.now(), tp = 0;
    const toggle = () => { paused = !paused; if (!paused) t0 = performance.now() - tp * 1000; };
    addEventListener('click', toggle); addEventListener('keydown', e => { if (e.code === 'Space') toggle(); });
    const loop = () => {
      if (!paused) { tp = ((performance.now() - t0) / 1000) % this.dur; this.render(tp); }
      requestAnimationFrame(loop);
    };
    window.__ready = true; loop();
  }
}

// ---------- materials ----------
// Wet ground: MeshStandardMaterial + the mirror (sharp in puddles, streaked on the wet surface), rain ripples, puddle mask.
// opts: puddle (0..1 how much is puddle), puddleScale, ripples (rain ripple strength), wet (base reflectivity), virtualDepth (write the
// reflected point's depth so DOF/fog treat the reflection as far away — use when the puddle IS the picture).
export function wetMaterial(film, mu, o = {}) {
  const cfg = Object.assign({ color: '#141516', roughness: .55, puddle: .55, puddleScale: .18, ripples: 1, wet: 1, streakMix: .75, distort: .012, virtualDepth: false, tint: col('#ffffff'), detail: 1, mask: null, setts: 0, settsAspect: 2, drops: [] }, o);
  const m = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: cfg.roughness, metalness: 0 });
  const U = { ...mu, uTime: { value: 0 }, uPuddle: { value: cfg.puddle }, uPScale: { value: cfg.puddleScale }, uRipples: { value: cfg.ripples }, uWet: { value: cfg.wet }, uStreakMix: { value: cfg.streakMix }, uDistort: { value: cfg.distort }, uTint: { value: cfg.tint }, uDetail: { value: cfg.detail }, uSetts: { value: cfg.setts }, uSettsA: { value: cfg.settsAspect }, uDrops: { value: Array.from({ length: 4 }, (_, i) => cfg.drops[i] ? new THREE.Vector3(...cfg.drops[i]) : new THREE.Vector3(0, 0, 1e4)) }, uRes: { value: new THREE.Vector2(film.w, film.h) } };
  film.onFrame(t => { U.uTime.value = t; });
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWP; uniform sampler2D tMirror, tMirrorBlur, tMirrorDepth; uniform mat4 mirrorMatrix, mirrorProjInv, mirrorWorld, mainViewProj; uniform float mirrorY;
      uniform float uTime, uPuddle, uPScale, uRipples, uWet, uStreakMix, uDistort, uDetail, uSetts, uSettsA; uniform vec3 uDrops[4];
      float grout; vec2 settN; uniform vec3 uTint; uniform vec2 uRes;
      ${GLSL.hash}
      float pmask; vec2 rip;
      // rain ripples: expanding rings in a jittered grid, each cell on its own clock
      vec2 ripples(vec2 p, float t){
        vec2 acc = vec2(0.);
        for (int layer = 0; layer < 2; layer++){
          vec2 q = p * (layer == 0 ? 2.2 : 3.7) + float(layer) * 7.3;
          vec2 i = floor(q), f = fract(q);
          for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
            vec2 c = i + vec2(x, y); vec2 o = h22(c);
            float ph = fract(t * (.9 + o.x * .6) + o.y);
            vec2 d = f - vec2(x, y) - o; float r = length(d);
            float ring = sin((r - ph * .55) * 70.) * smoothstep(.0, .05, ph * .55 - r + .05) * (1. - ph) * smoothstep(.55, .0, r);
            acc += normalize(d + 1e-4) * ring;
          }
        }
        return acc;
      }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        float pn = fbm(vWP.xz * uPScale) + (fbm(vWP.xz * uPScale * 5.3 + 3.1) - .5) * .25;
        pmask = smoothstep(1. - uPuddle - .04, 1. - uPuddle + .04, pn);
        ${cfg.mask ? `{ vec2 p = vWP.xz; pmask = clamp(${cfg.mask}, 0., 1.); }` : ''}
        float grit = fbm(vWP.xz * 3.1) * .6 + h12(floor(vWP.xz * 90.)) * .4;
        grout = 0.; settN = vec2(0.);
        if (uSetts > 0.){   // running-bond stone setts: each stone its own tone and tilt, grout lines rough and dark
          vec2 q = vWP.xz / vec2(uSetts * uSettsA, uSetts); q.x += step(1., mod(floor(q.y), 2.)) * .5;
          vec2 id = floor(q), f = fract(q);
          vec2 e = min(f, 1. - f) * vec2(uSettsA, 1.);
          float edge = min(e.x, e.y);
          grout = 1. - smoothstep(.02, .07, edge);
          settN = (h22(id) - .5) * .25 + (f - .5) * vec2(1., 1.) * smoothstep(.15, .0, edge) * .5;
          roughnessFactor = mix(roughnessFactor * mix(.8, 1.2, h12(id + 5.)), .9, grout * (1. - pmask));
        }
        roughnessFactor = mix(roughnessFactor * mix(.75, 1.25, grit * uDetail), .04, pmask);
        rip = uRipples * ripples(vWP.xz, uTime) * mix(.35, 1., pmask);
        for (int i = 0; i < 4; i++){   // single drops (a leaf landing): a train of rings spreading at 0.3 m/s
          vec2 d = vWP.xz - uDrops[i].xy; float r = length(d), age = uTime - uDrops[i].z;
          if (age > 0. && age < 6.){ float front = age * .3; float x = r - front;
            float w = sin(x * 55.) * exp(-x * x * 90.) * exp(-age * .55) * smoothstep(.0, .05, front - r + .12) / (1. + r * 4.);
            rip += normalize(d + 1e-5) * w * 2.2 * pmask; }
        }`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        diffuseColor.rgb *= mix(1., mix(.7, 1.15, fbm(vWP.xz * 1.7) ) * mix(.85, 1.05, h12(floor(vWP.xz * 60.))), uDetail);
        if (uSetts > 0.){ vec2 q = vWP.xz / vec2(uSetts * uSettsA, uSetts); q.x += step(1., mod(floor(q.y), 2.)) * .5; diffuseColor.rgb *= mix(.75, 1.25, h12(floor(q) + 1.3)); }`)
      .replace('#include <opaque_fragment>', `
        vec4 mp = mirrorMatrix * vec4(vWP, 1.);
        vec2 muv = mp.xy / mp.w;
        vec2 dist = rip * uDistort + (vec2(vnoise(vWP.xz * 4.), vnoise(vWP.xz * 4. + 9.)) - .5) * uDistort * .35 * (1. - pmask) + settN * uDistort * (1. - pmask);
        vec3 sharpR = texture2D(tMirror, muv + dist).rgb;
        vec3 blurR = texture2D(tMirrorBlur, muv + dist * 2.).rgb;
        vec3 V = normalize(cameraPosition - vWP);
        float cosT = clamp(V.y, 0., 1.);
        float fres = .02 + .98 * pow(1. - cosT, 5.);
        float refl = mix(uWet * mix(.25, .7, fres), mix(.35, 1., fres), pmask) * (1. - grout * .8 * (1. - pmask));
        vec3 R = mix(mix(sharpR, blurR, uStreakMix), sharpR, pmask);
        outgoingLight = outgoingLight * (1. - refl * .65 * pmask) + R * refl * uTint;
        #include <opaque_fragment>
        ${cfg.virtualDepth ? `
        float md = texture2D(tMirrorDepth, muv).x;
        if (md < .99999 && pmask > .5){
          vec4 mv = mirrorProjInv * vec4(muv * 2. - 1., md * 2. - 1., 1.); mv /= mv.w;
          vec3 X = (mirrorWorld * vec4(mv.xyz, 1.)).xyz; X.y = 2. * mirrorY - X.y;
          vec4 cp = mainViewProj * vec4(X, 1.); gl_FragDepth = clamp(cp.z / cp.w * .5 + .5, 0., 1.);
        } else if (md >= .99999 && pmask > .5) gl_FragDepth = .999999; else gl_FragDepth = gl_FragCoord.z;` : ''}`);
  };
  m.customProgramCacheKey = () => 'wet' + (cfg.virtualDepth ? 'v' : '') + (cfg.mask || '');
  return m;
}
