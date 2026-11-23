// bw-rooster-b.js — 「kingdom」 5부 「닭이 울 때」 B안, film 541.2 (C13) → 627.3 (C14): the same lines as version A, the action told in shadows.
// Rule of this version: nobody performs an action in full view. Fire throws the action onto walls and tree trunks; people are dark masses, far, or out of focus.
// Look: German Expressionist / film-noir black and white (「노스페라투」 1922 stair shadow, 「칼리가리」 1920, 「제3의 사나이」 1949 wall shadows), one colour kept: fire #ff8a2a.
// Skills: no motion-skills file was opened for this version. Carried over from bw-rooster.js (version A): page structure, text layer, the fire and ember shader.
// Not built in 3D: surfaces are shaded in WebGL, figures and trunks are 2D silhouettes in layers (arms use fixed-length two-bone IK).
// Method: each surface (plaster, bark, stone, alley) is baked once to a normal + albedo texture, so it is fixed in the frame. Shadows are drawn as shapes on a mask in
// wall space and read back through a penumbra that widens with the distance from the flame; the surface relief keeps showing through them.
// Shots (all times from script `at`, see beats()):
//   R1   room     C13–N141   lamp at the left third; seated shadows; Peter's shadow rises on Q109; on N141 the lamp dips and it swells, head inside the frame. Slow push.
//   R2a  garden   N142       torches come through black olive trunks. Lateral track.
//   R2b  bark     N143–N145  one lit trunk: an arm's shadow draws and swings once, a glint crosses; the blade trembles; it lowers; a hand reaches to a bowed head. Slow push.
//   R2e  wall     N145 end   torches and shadows slide along a stone wall, one held by the arms and led away. Lateral track.
//   R3   court    N146–N148  low ember fire; seated men's shadows on the wall; a woman's pointing arm; his shadow turns; the others turn and close in. Slow push.
//   R4   roof     N149       a black roofline and the first thin grey of dawn. Everything stops. No rooster on screen. Very slow push.
//   R5   door     L105/Q114  one shot: Peter's dark shoulders near, a far lit doorway with a small held figure who stops and turns. Rack focus, hold.
//   R6   alley    Q115       a dark mass against the wall, a thin grey line on shoulder and bowed head. No colour. Very slow push.
// API: const M = await import('./bw-rooster-b.js'); const T = M.beats(B); const R = await M.build(W, H); R.draw(ctx, t, T)  (t = FILM seconds; pure in t).

const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const sine = x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
const kf = (t, keys) => { if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return lerp(va, vb, sine((t - a) / (b - a))); }
  return keys[keys.length - 1][1]; };
const wob = (t, a, b, ph = 0) => Math.sin(t * a + ph) * .6 + Math.sin(t * b + ph * 1.7) * .4;
const rngOf = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const VW = 1080, VH = 1920, MARG = 140;

// ---------------------------------------------------------------- the one table: every visual time from the line times
export function beats(B) {
  const pc = B.pc || {}, T = { ...B, start: B.C13, end: B.C14 };
  T.rise = [B.Q109 + .3, B.Q109 + 2.9]; T.fist = [B.Q109 + 2.1, B.Q109 + 4.7]; T.dip = [B.N141 + .1, B.N141 + 4.4];
  const c = pc.N143 ? pc.N143[1] : B.N143 + 2.9;
  T.draw = [B.N143 + .15, B.N143 + 1.4]; T.raise = [B.N143 + 1.2, c + .22]; T.strike = [c + .28, c + .72]; T.flash = c + .5;
  const h = pc.N145 ? pc.N145[1] : B.N145 + 3.6;
  T.lower = [B.N145 + .3, h - .02]; T.reach = [h - .42, h + 1.5];
 T.touch = h + 1.5; T.wall = B.N146 - 2.35;
  const n147b = pc.N147 ? pc.N147[1] : B.N147 + 3.3;
  T.enter = [B.N147 - .3, B.N147 + .9]; T.point = [B.N147 + .55, B.N147 + 1.8]; T.away = [n147b - .15, n147b + .85];
  T.two = B.N148 + .05; T.three = B.N148 + (B.N149 - B.N148) * .52;
  T.crow = pc.N149 ? pc.N149[1] : B.N149 + 2.7;
  T.doorStop = B.L105 + 1.0; T.doorTurn = [B.L105 + 1.05, B.L105 + 2.3]; T.rack = [B.L105 + .5, B.L105 + 2.9];
  return T;
}

const NOISE = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
  float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;
const VS = `#version 300 es
  in vec2 aP; uniform vec4 uRect; out vec2 vUv; void main(){ vUv = aP * .5 + .5; gl_Position = vec4(uRect.xy + aP * uRect.zw, 0., 1.); }`;
// one surface, baked once: rg = normal, b = albedo, a = height
const BAKE = `#version 300 es
  precision highp float; uniform int uKind; uniform vec2 uMarg; out vec4 o; ${NOISE}
  float brick(vec2 p){ vec2 q = p * .0052; float n = fb(q * 1.3) * .6 + fb(q * 6.1) * .4;
    float rw = q.y + (fb(q * vec2(.35, .1)) - .5) * .5; vec2 b = vec2(q.x, rw) / vec2(.56, .23); float row = floor(b.y); b.x += hh(vec2(row, 2.)) * 3. + (vn(vec2(q.x * .8, row)) - .5) * .8; vec2 id = floor(b), f = fract(b);
    float e = min(min(f.x, 1. - f.x) * 2.2, min(f.y, 1. - f.y)) + (fb(q * 7.) - .5) * .34; float br = mix(.62, 1., smoothstep(.0, .2, e)) * (.76 + .24 * hh(id + .7)) * .72 + n * .36;
    return mix(n * .82 + .08, br, smoothstep(.56, .72, fb(q * .55 + 4.)) * .8); }
  float bark(vec2 p){ vec2 w = vec2(fb(p * .0017), fb(p * .0017 + 7.)) - .5; vec2 q = (p + w * vec2(150., 70.)) * vec2(.0135, .0021);
    float r = 1. - abs(2. * fb(q) - 1.), r2 = 1. - abs(2. * fb(q * vec2(2.3, 1.7) + 5.) - 1.);
    return (1. - pow(r, 7.)) * .56 + (1. - pow(r2, 9.)) * .18 + fb((p + w * 50.) * vec2(.042, .011)) * .3 + fb(p * vec2(.16, .05)) * .06; }
  float stone(vec2 p){ float yy = p.y + (fb(p * .0021) - .5) * 58.; vec2 b = vec2(p.x, yy) / vec2(312., 172.); float row = floor(b.y); b.x += hh(vec2(row, 3.)) * 2. + (vn(vec2(p.x * .0026, row)) - .5) * .42; vec2 f = fract(b), id = floor(b);
    float e = min(min(f.x, 1. - f.x) * 1.82, min(f.y, 1. - f.y)) + (fb(p * .022) - .5) * .17; return smoothstep(-.01, .085, e) * .2 + (.36 + .2 * hh(id + .7)) + fb(p * .0085 + id) * .38 + fb(p * .05) * .16 - .1; }
  float alley(vec2 p){ return brick(p * 1.25) * .7 + fb(p * vec2(.012, .004) + 3.) * .4; }
  float H(vec2 p){ return uKind == 1 ? bark(p) : uKind == 2 ? stone(p) : uKind == 3 ? alley(p) : brick(p); }
  void main(){ vec2 p = gl_FragCoord.xy - uMarg; float e = 1.5, h = H(p), hx = H(p + vec2(e, 0.)) - H(p - vec2(e, 0.)), hy = H(p + vec2(0., e)) - H(p - vec2(0., e));
    float amp = uKind == 1 ? 2.5 : uKind == 2 ? 1.5 : uKind == 3 ? 2.6 : 1.25;
 vec3 N = normalize(vec3(-hx * amp, -hy * amp, 1.));
    if (uKind == 1) N = normalize(N + vec3((p.x - 520.) / 560., 0., 0.));
    float big = fb(p * .0021 + 3.1), al = (.56 + .5 * h) * mix(.72, 1.18, big); if (uKind == 1) al *= .72; if (uKind == 3) al *= mix(.55, 1., smoothstep(.3, .7, fb(p * vec2(.006, .0016) + 9.)));
    o = vec4(N.xy * .5 + .5, clamp(al * .72, 0., 1.), h); }`;
// the lit wall: up to four flames, one shadow mask, haze in the light
const WALL = `#version 300 es
  precision highp float; in vec2 vUv; out vec4 o; ${NOISE}
  uniform sampler2D tS, tM; uniform vec2 uRes, uMarg, uWall; uniform vec3 uCam; uniform int uSurf;
  uniform vec4 uL[4]; uniform vec3 uLc[4]; uniform float uLr[4]; uniform float uAmb, uHaze, uT, uShD, uSoft, uSoftD, uGain, uMono, uDoorK, uVig;
  uniform vec3 uSky0, uSky1, uSkyB; uniform vec4 uDoor, uSlit;
  const vec2 PO[8] = vec2[8](vec2(-.61,.33), vec2(.2,-.72), vec2(.78,.27), vec2(-.2,.88), vec2(-.87,-.38), vec2(.45,.66), vec2(-.34,-.28), vec2(.28,.06));
  float shade(vec2 uv, float lod){ vec2 tx = 1. / vec2(textureSize(tM, 0)); float s = 0., r = pow(2., lod) * .9; for (int i = 0; i < 8; i++) s += textureLod(tM, uv + PO[i] * r * tx, lod).r; return s / 8.; }
  void main(){ vec2 fc = gl_FragCoord.xy; fc.y = uRes.y - fc.y; vec2 p = (fc - uRes * .5) / uCam.z + uCam.xy, uv = (p + uMarg) / (uWall + 2. * uMarg);
    vec3 col = vec3(0.), sc = vec3(0.); float hz = fb(p * .0024 + vec2(uT * .018, -uT * .026)); hz = smoothstep(.26, .78, hz);
    float al = .4; vec3 N = vec3(0., 0., 1.);
    if (uSurf == 1) { vec4 s = texture(tS, uv); N = vec3(s.xy * 2. - 1., 0.); N.z = sqrt(max(.04, 1. - dot(N.xy, N.xy))); al = s.b; col = vec3(uAmb * al); }
    else { float y = p.y; col = mix(uSky0, uSky1, smoothstep(0., uWall.y, y)); float b = (y - uSkyB.x) / uSkyB.y; col += vec3(.78, .79, .82) * uSkyB.z * exp(-b * b); }
    float S = 0.; if (uShD > 0.) S = shade(uv, clamp(uSoft + uSoftD * length(p - uL[0].xy) / 1000., 0., 5.2));
    float slit = 1.; if (uSlit.w > 0.) { vec2 d = vec2(cos(uSlit.z), sin(uSlit.z)); float q = dot(p - uSlit.xy, vec2(-d.y, d.x)); slit = exp(-q * q / (uSlit.w * uSlit.w)); }
    for (int i = 0; i < 4; i++) { float I = uL[i].w; if (I <= 0.) continue; vec3 L = vec3(uL[i].xy - p, uL[i].z); float d = length(L); L /= d; float a = I / pow(1. + d * d / (uLr[i] * uLr[i]), 1.8);
      vec3 c = mix(uLc[i], vec3(.9, .89, .875), smoothstep(170., 760., d) * .92), sh = vec3(i == 0 ? 1. - S * uShD : 1.);
      if (uSurf == 1) col += al * c * max(dot(N, L), 0.) * a * sh * (i == 0 ? slit : 1.);
      sc += c * a * (.28 + .72 * hz) * mix(1., .55, i == 0 ? S * uShD : 0.); }
    col += sc * uHaze;
    if (uDoorK > 0.) { vec2 m = smoothstep(uDoor.xy - 2., uDoor.xy + 2., p) * (1. - smoothstep(uDoor.zw - 2., uDoor.zw + 2., p)); vec2 cc = (uDoor.xy + uDoor.zw) * .5, sz = (uDoor.zw - uDoor.xy) * .5; float g = exp(-dot((p - cc) / sz, (p - cc) / sz) * .55);
      col = mix(col, vec3(1.32, 1.27, 1.16) * (.62 + .55 * g) * uDoorK, m.x * m.y); }
    vec3 c = 1. - exp(-col * uGain); c = pow(c, vec3(.4545)); vec2 v = (fc / uRes - vec2(.5, .44)) * vec2(1.05, .92); c *= 1. - uVig * smoothstep(.22, .74, length(v));
    if (uMono > 0.) c = mix(c, vec3(dot(c, vec3(.3, .59, .11))), uMono);
    o = vec4(c, 1.); }`;
// the flame card and the charcoal bed (from version A, as one shader)
const FLAME = `#version 300 es
  precision highp float; in vec2 vUv; out vec4 o; uniform float uT, uSeed, uK; uniform int uMode; ${NOISE}
  void main(){ if (uMode == 1) { vec2 p = (vUv - .5) * vec2(2., 2.); float r = length(p) + (fb(p * 2.2) - .5) * .3; if (r > 1.) { o = vec4(0.,0.,0.,1.); return; }
      vec2 c = p * vec2(8., 4.6) + (vec2(fb(p * 4.), fb(p * 4. + 4.)) - .5) * 1.5, ic = floor(c), fc = fract(c); float d1 = 8., d2 = 8.; vec2 bst = ic;
      for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){ vec2 g = vec2(x, y), q = vec2(hh(ic + g), hh(ic + g + 17.)), w = g + q - fc; float d = dot(w, w); if (d < d1){ d2 = d1; d1 = d; bst = ic + g; } else if (d < d2) d2 = d; }
      float e = sqrt(d2) - sqrt(d1), id = hh(bst + .7), heat = 1. - smoothstep(.2, 1., r), br = .55 + .45 * sin(uT * (.6 + id * .9) + id * 40.), n = fb(p * 3.1 + vec2(uT * .03, -uT * .02));
      float crack = 1. - smoothstep(.0, .11, e), glow = crack * (.42 + .58 * br) * heat * smoothstep(.2, .55, n + heat * .35), lump = smoothstep(.62, .96, id) * heat * br * smoothstep(.3, .6, n);
      vec3 f = vec3(1., .36, .05) * glow * 1.25 + vec3(1., .54, .13) * lump * .95; o = vec4(f * uK, 1.); return; }
    vec2 p = vec2(vUv.x * 2. - 1., vUv.y); float y = clamp(p.y, 0., 1.);
    float n = fb(vec2(p.x * 2.1 + uSeed * 7., y * 2.2 - uT * 1.9 + uSeed)), m = fb(vec2(p.x * 4.3 - uSeed, y * 4. - uT * 3.1));
    float x = p.x + (n - .5) * .62 * y + (m - .5) * .2 * y, w = (uMode == 2 ? mix(.68, .22, pow(y, 1.5)) : mix(.5, .03, pow(y, .8))) * (.82 + .36 * n), b = smoothstep(w, w * .22, abs(x)) * smoothstep(0., .07, y) * (1. - smoothstep(.72 + .2 * n, 1., y));
    vec3 c = mix(vec3(1., .3, .035), uMode == 2 ? vec3(1., .47, .1) : vec3(1., .6, .19), smoothstep(.25, .95, b)) * (b * b) * 2.2 * uK;
 c += vec3(1., .32, .06) * exp(-dot(p - vec2(0., .28), p - vec2(0., .28)) * 7.) * .1 * uK;
    o = vec4(c, 1.); }`;

// ---------------------------------------------------------------- silhouette craft: all shapes in metres, y up
const atf = (g, b, x, y, s = 1, rot = 0, flip = 1, sv = 1) => { const c = Math.cos(rot), n = Math.sin(rot), k = b.k * s; g.setTransform(k * c * flip, k * n * flip, k * n * sv, -k * c * sv, b.k * x + b.ox, b.k * y + b.oy); };
function spline(g, P, close = true) { const n = P.length, at = i => close ? P[(i + n) % n] : P[clamp(i, 0, n - 1)]; g.moveTo(P[0][0], P[0][1]);
  for (let i = 0; i < (close ? n : n - 1); i++) { const a = at(i - 1), b = at(i), c = at(i + 1), d = at(i + 2); g.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]); }
  if (close) g.closePath(); }
const blob = (g, P) => { g.beginPath(); spline(g, P); g.fill(); };
function limb(g, ax, ay, ra, bx, by, rb) { const a = Math.atan2(by - ay, bx - ax); g.beginPath(); g.arc(ax, ay, ra, a + Math.PI / 2, a - Math.PI / 2); g.arc(bx, by, rb, a - Math.PI / 2, a + Math.PI / 2); g.closePath(); g.fill(); }
function ik(S, W, l1, l2, bend) { let dx = W[0] - S[0], dy = W[1] - S[1], d = Math.hypot(dx, dy) || 1e-4; const mx = (l1 + l2) * .999; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)); return { E: [S[0] + dx / d * a - bend * dy / d * h, S[1] + dy / d * a + bend * dx / d * h], W: [S[0] + dx, S[1] + dy] }; }
const elbowAngle = (S, E, W) => { const a = Math.atan2(S[1] - E[1], S[0] - E[0]), b = Math.atan2(W[1] - E[1], W[0] - E[0]); return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))); };
// hands: wrist at the origin, +x along the hand
function fist(g) { blob(g, [[-.012, .034], [.04, .05], [.086, .054], [.118, .04], [.128, .006], [.118, -.03], [.086, -.05], [.04, -.046], [-.012, -.03]]);
  for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(.112 - i * .001, .036 - i * .024, .0165, 0, TAU); g.fill(); }
  limb(g, .03, -.04, .018, .088, -.054, .014); }
function pointing(g) { blob(g, [[-.012, .032], [.04, .046], [.09, .048], [.118, .034], [.12, .0], [.11, -.034], [.078, -.046], [.04, -.042], [-.012, -.03]]);
  limb(g, .1, .026, .0165, .178, .032, .0135); limb(g, .178, .032, .0135, .236, .028, .0098); for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(.118, .004 - i * .02, .0145, 0, TAU); g.fill(); } limb(g, .02, -.036, .018, .072, -.056, .013); }
function openHand(g) { blob(g, [[-.014, .03], [.04, .046], [.092, .052], [.116, .036], [.118, -.016], [.092, -.044], [.04, -.04], [-.014, -.028]]);
  // four fingers lying together, gently curved: a hand at rest, not a claw
  const F = [[.04, .098, -.012], [.016, .112, -.016], [-.008, .104, -.02], [-.03, .086, -.024]];
  for (const [y0, l, c] of F) { limb(g, .106, y0, .0148, .106 + l * .55, y0 + c * .4, .0132); limb(g, .106 + l * .55, y0 + c * .4, .0132, .106 + l, y0 + c * 1.25, .0102); }
  limb(g, .03, -.034, .019, .074, -.066, .0145); limb(g, .074, -.066, .0145, .108, -.074, .0108); }
function inHand(g, W, ang, fn) { g.save(); g.translate(W[0], W[1]); g.rotate(ang); fn(g); g.restore(); }
function sleeveArm(g, S, W, l1, l2, bend, hand, ang) { const q = ik(S, W, l1, l2, bend), E = q.E, Wr = q.W;
  limb(g, S[0], S[1], .088, E[0], E[1], .058); const mx = lerp(E[0], Wr[0], .46), my = lerp(E[1], Wr[1], .46); limb(g, E[0], E[1], .058, mx, my, .052); limb(g, E[0], E[1], .046, Wr[0], Wr[1], .031);
  const a = Math.atan2(Wr[1] - E[1], Wr[0] - E[0]), nx = -Math.sin(a), ny = Math.cos(a); blob(g, [[mx + nx * .058, my + ny * .058], [mx + Math.cos(a) * .02 + nx * .03, my + Math.sin(a) * .02 + ny * .03], [mx + Math.cos(a) * .012 - nx * .02, my + Math.sin(a) * .012 - ny * .02], [mx - nx * .058, my - ny * .058], [mx - Math.cos(a) * .05, my - Math.sin(a) * .05]]);
  inHand(g, Wr, ang, hand); return { E, W: Wr }; }
// the head: round cloth, band and knot, cloth to the shoulder; turn −1…1 = facing left…right. Jesus and the veiled woman have no features at all.
function head(g, cx, cy, r, turn, o = {}) { const { jesus = false, veil = false, beard = true } = o, a = Math.abs(turn), f = turn < 0 ? -1 : 1;
  g.beginPath(); g.ellipse(cx, cy, r, r * 1.1, 0, 0, TAU); g.fill();
  if (jesus || veil) { for (const sd of [-1, 1]) { const e = r * (veil ? 1.18 : 1.05), dn = veil ? 2.9 : 1.75; blob(g, [[cx + sd * r * .62, cy + r * .66], [cx + sd * e, cy - r * .1], [cx + sd * e * 1.08, cy - r * dn * .8], [cx + sd * r * .52, cy - r * dn], [cx + sd * r * .1, cy - r * .6]]); } return; }
  // the cloth goes over the crown and falls behind the neck to the shoulder; a short tied end hangs at the nape (no brim, nothing at the brow)
  const b = -f, bk = lerp(.3, 1, a); blob(g, [[cx + b * r * .08, cy + r * 1.08], [cx + b * r * .8, cy + r * .72], [cx + b * r * (1.04 + .1 * bk), cy + r * .02], [cx + b * r * (1.14 + .2 * bk), cy - r * 1.0], [cx + b * r * (.84 + .2 * bk), cy - r * 1.8], [cx + b * r * .2, cy - r * 1.4], [cx - b * r * .2, cy - r * .3]]);
  if (a < .55) { const k = 1 - a / .55; blob(g, [[cx + f * r * .62, cy + r * .66], [cx + f * r * 1.0, cy], [cx + f * r * 1.02, cy - r * (.7 + .6 * k)], [cx + f * r * .58, cy - r * (.95 + .7 * k)], [cx + f * r * .14, cy - r * .5]]); }
  limb(g, cx + b * r * (.98 + .1 * bk), cy - r * .62, r * .16, cx + b * r * (1.18 + .12 * bk), cy - r * 1.24, r * .09);
  if (beard) blob(g, [[cx + f * r * .06, cy - r * .5], [cx + f * r * (.66 + .26 * a), cy - r * .42], [cx + f * r * (.84 + .3 * a), cy - r * .92], [cx + f * r * (.56 + .24 * a), cy - r * 1.46], [cx + f * r * .12, cy - r * 1.42], [cx - f * r * .2, cy - r * 1.08]]); }
// a robed body from the base up: straight sides, no waist, no legs (it always stands behind something or runs out of the light)
function robe(g, sh, br = 1) { blob(g, [[-.43 * br, -.5], [-.42 * br, sh * .36], [-.37 * br, sh * .76], [-.31 * br, sh * .95], [-.18 * br, sh + .022], [-.08, sh + .08], [.08, sh + .08], [.18 * br, sh + .022], [.31 * br, sh * .95], [.37 * br, sh * .76], [.42 * br, sh * .36], [.43 * br, -.5]]); }
function man(g, b, x, y, s, o = {}) { const { h = 1.2, br = 1, turn = 0, lean = 0, sv = 1.06, jesus = false, veil = false, beard = true, hx = 0, hy = 0 } = o; atf(g, b, x, y, s, lean, 1, sv); const sh = h - .36, hc = h - .15, r = .116;
  robe(g, sh, br); limb(g, 0, sh + .02, .074, turn * .018 + hx * .6, hc - .07 + hy * .5, .058);
 head(g, turn * .022 + hx, hc + hy, r, turn, { jesus, veil, beard }); return { sh, hc }; }

export async function build(W, H) {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const glc = mk(VW, VH), gl = glc.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  if (!gl) throw new Error('webgl2 is required');
  const prog = (fs) => { const sh = (ty, src) => { const q = gl.createShader(ty); gl.shaderSource(q, src); gl.compileShader(q); if (!gl.getShaderParameter(q, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(q)); return q; };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'aP'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const cache = {}; return { p, u: n => cache[n] ?? (cache[n] = gl.getUniformLocation(p, n)) }; };
  const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const PB = prog(BAKE), PW = prog(WALL), PF = prog(FLAME);
  const SW = VW + MARG * 2, SH = VH + MARG * 2;
  const surfaces = [0, 1, 2, 3].map(kind => { const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, SW, SH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx, 0); gl.viewport(0, 0, SW, SH); gl.useProgram(PB.p);
    gl.uniform4f(PB.u('uRect'), 0, 0, 1, 1); gl.uniform1i(PB.u('uKind'), kind); gl.uniform2f(PB.u('uMarg'), MARG, MARG); gl.disable(gl.BLEND); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(fb); return tx; });
  // the shadow mask, in wall space at half size
  const mc = mk(SW >> 1, SH >> 1), mg = mc.getContext('2d'), MB = { k: .5, ox: MARG * .5, oy: MARG * .5 };
  const mTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, mTex); for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  const maskBegin = () => { mg.setTransform(1, 0, 0, 1, 0, 0); mg.fillStyle = '#000'; mg.fillRect(0, 0, mc.width, mc.height); mg.fillStyle = '#fff'; };
  const camBase = c => ({ k: c[2], ox: VW / 2 - c[0] * c[2], oy: VH / 2 - c[1] * c[2] });
  function glFrame(sp) { const c = sp.cam, L = sp.L || []; gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, VW, VH); gl.disable(gl.BLEND); gl.useProgram(PW.p);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, mTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mc); gl.generateMipmap(gl.TEXTURE_2D); gl.uniform1i(PW.u('tM'), 1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, surfaces[sp.kind ?? 0]); gl.uniform1i(PW.u('tS'), 0);
    gl.uniform4f(PW.u('uRect'), 0, 0, 1, 1); gl.uniform2f(PW.u('uRes'), VW, VH); gl.uniform2f(PW.u('uMarg'), MARG, MARG); gl.uniform2f(PW.u('uWall'), VW, VH); gl.uniform3f(PW.u('uCam'), c[0], c[1], c[2]); gl.uniform1i(PW.u('uSurf'), sp.sky ? 0 : 1);
    const a = new Float32Array(16), lc = new Float32Array(12), lr = new Float32Array(4); L.slice(0, 4).forEach((q, i) => { a.set([q.x, q.y, q.z, q.I], i * 4); lc.set(q.c || [1, .54, .165], i * 3); lr[i] = q.r || 560; }); gl.uniform4fv(PW.u('uL'), a); gl.uniform3fv(PW.u('uLc'), lc); gl.uniform1fv(PW.u('uLr'), lr);
    const f1 = (n, v) => gl.uniform1f(PW.u(n), v); f1('uAmb', sp.amb ?? .012); f1('uHaze', sp.haze ?? .12); f1('uT', sp.t); f1('uShD', sp.shD ?? .96); f1('uSoft', sp.soft ?? .6); f1('uSoftD', sp.softD ?? 2.2); f1('uGain', sp.gain ?? 1); f1('uMono', sp.mono ?? 0); f1('uDoorK', sp.door ? sp.doorK ?? 1 : 0); f1('uVig', sp.vig ?? .62);
    const sk = sp.sky || { a: [0, 0, 0], b: [0, 0, 0], y: [900, 40, 0] }; gl.uniform3fv(PW.u('uSky0'), sk.a); gl.uniform3fv(PW.u('uSky1'), sk.b); gl.uniform3fv(PW.u('uSkyB'), sk.y); gl.uniform4fv(PW.u('uDoor'), sp.door || [0, 0, 0, 0]); gl.uniform4fv(PW.u('uSlit'), sp.slit || [0, 0, 0, 0]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (sp.flames?.length) { gl.useProgram(PF.p); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.uniform1f(PF.u('uT'), sp.t);
      for (const [x, y, w, h, seed, k, mode] of sp.flames) { const sx = (x - c[0]) * c[2] + VW / 2, sy = (y - c[1]) * c[2] + VH / 2, hw = w * c[2] / 2, hh = h * c[2] / 2; gl.uniform4f(PF.u('uRect'), sx / VW * 2 - 1, 1 - (sy - hh) / VH * 2, hw / VW * 2, hh / VH * 2); gl.uniform1f(PF.u('uSeed'), seed); gl.uniform1f(PF.u('uK'), k); gl.uniform1i(PF.u('uMode'), mode || 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      gl.disable(gl.BLEND); } }
  // dark masses over the wall, with an optional rim from the side of the light
  const tA = mk(VW, VH), ta = tA.getContext('2d'), tB = mk(VW, VH), tb = tB.getContext('2d');
  function mass(out, c, fn, { blur = 0, rim = null, alpha = 1, fill = '#040404' } = {}) { ta.setTransform(1, 0, 0, 1, 0, 0); ta.clearRect(0, 0, VW, VH); ta.fillStyle = fill; fn(ta, camBase(c));
    out.save(); out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = alpha; if (blur > .05) out.filter = `blur(${blur.toFixed(2)}px)`; out.drawImage(tA, 0, 0);
    if (rim) { tb.setTransform(1, 0, 0, 1, 0, 0); tb.globalCompositeOperation = 'source-over'; tb.clearRect(0, 0, VW, VH); tb.drawImage(tA, 0, 0); tb.globalCompositeOperation = 'source-in'; tb.fillStyle = rim.c; tb.fillRect(0, 0, VW, VH); tb.globalCompositeOperation = 'destination-out'; tb.drawImage(tA, rim.dx, rim.dy); tb.globalCompositeOperation = 'source-over';
      out.globalCompositeOperation = 'lighter'; out.filter = `blur(${Math.max(1.1, blur * .8).toFixed(2)}px)`; out.globalAlpha = alpha * rim.a; out.drawImage(tB, 0, 0); }
    out.restore(); }
  const halo = (g, c, x, y, r, col, a) => { const q = camBase(c), X = q.k * x + q.ox, Y = q.k * y + q.oy, R = r * q.k, gr = g.createRadialGradient(X, Y, 0, X, Y, R); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.22, `rgba(${col},${a * .42})`); gr.addColorStop(.55, `rgba(${col},${a * .1})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(X - R, Y - R, R * 2, R * 2); g.restore(); };
  // fine film grain, fixed in the frame, only where there is light (overlay leaves black alone)
  const grainC = mk(VW >> 1, VH >> 1); { const q = grainC.getContext('2d'), im = q.createImageData(grainC.width, grainC.height), r = rngOf(4177); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 96; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } q.putImageData(im, 0, 0); }
  // embers: one every ~.17 s, a steady stream, pure in t
  const EM = Array.from({ length: 24 }, (_, i) => { const r = rngOf(917 + i * 13); r(); return [r(), r(), r(), r()]; });
  function embers(out, c, x, y, amt, t) { const q = camBase(c); out.save(); out.setTransform(1, 0, 0, 1, 0, 0); out.globalCompositeOperation = 'lighter';
    for (const [a, b, d, e] of EM) { const life = 3.2 + e * 1.4, ph = (t / life + a) % 1, ex = x + (b - .5) * 96 + Math.sin(ph * 5 + a * 9) * 22 * ph + 26 * ph, ey = y - 8 - ph * (150 + 210 * d), al = Math.sin(ph * Math.PI) * (.35 + .55 * e) * amt, R = (1.1 + 1.5 * d) * q.k; if (al <= .01) continue; out.fillStyle = `rgba(255,${120 + 30 * e | 0},40,${al})`; out.beginPath(); out.arc(q.k * ex + q.ox, q.k * ey + q.oy, R, 0, TAU); out.fill(); }
    out.restore(); }
  const FIREC = [1, .54, .165], fl = (t, p = 0) => .88 + .12 * wob(t, 7.1, 11.3, p);

  // ================================================================ R1: the upper room
  const LAMP = [340, 1168];
  function poseR1(t, T) { const rise = ss(T.rise[0], T.rise[1], t), fk = ss(T.fist[0], T.fist[1], t), dip = ss(T.dip[0], T.dip[1], t), h = lerp(1.2, 1.8, rise), sh = h - .36, S = [-.29, sh * .97], W = [lerp(-.2, -.68, fk), lerp(sh * .7, h - .16, fk)]; return { rise, dip, fk, h, S, W, ...ik(S, W, .33, .3, 1) }; }
  function r1(t, T) { const u = clamp((t - T.start) / (T.N142 + .5 - T.start)), { rise, dip, S, W, h } = poseR1(t, T), f = fl(t), dipF = 1 - .34 * Math.pow(Math.sin(Math.PI * clamp((t - T.dip[0]) / 2.2)), 2);
    const zz = lerp(1.0, 1.085, u), cam = [lerp(548, 566, u), 1214 - 236 / zz, zz], lx = LAMP[0]
 + 2.6 * Math.sin(t * 2.3), ly = LAMP[1] + 10 * dip, jit = (f - .88) * 18;
    maskBegin(); const sc = lerp(420, 530, sine(dip)) * (1 + (f - .88) * .03), bx = 652 + jit * .35, by = 1286, ln = lerp(.05, -.015, rise);
    man(mg, MB, 118, 1270, 300, { h: 1.2, br: .96, turn: .5, lean: -.05 }); man(mg, MB, 952, 1286, 330, { h: 1.18, br: 1, turn: -.7, lean: .07 }); man(mg, MB, 432, 1286, 290, { h: 1.1, br: .92, jesus: true, lean: .01 });
    man(mg, MB, bx, by, sc, { h, br: 1.18, turn: -.82, lean: ln }); atf(mg, MB, bx, by, sc, ln, 1, 1.06); const arm = ik(S, W, .33, .3, 1); sleeveArm(mg, S, W, .33, .3, 1, fist, Math.atan2(arm.W[1] - arm.E[1], arm.W[0] - arm.E[0]) - .2);
    const flames = [[lx, ly - 2, 38 * lerp(1, .86, dip), 92 * lerp(1, .7, dip) * (.92 + .08 * f), 1.3, 1.1 * dipF]];
    return { kind: 0, cam, t, flames, L: [{ x: lx, y: ly - 26, z: lerp(280, 215, dip), I: 4.5 * f * dipF, r: 520, c: [1, .56, .22] }, { x: lx, y: ly - 22, z: 70, I: .32 * f, r: 120, c: [1, .46, .12] }]
, amb: .006, haze: .1, soft: .5, softD: 2.1, gain: 1.05,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-200, 1214); g.lineTo(150, 1212); g.bezierCurveTo(260, 1206, 430, 1206, 560, 1214); g.lineTo(1400, 1236); g.lineTo(1400, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill();
          const m = (x, y, s, o2) => man(g, b, x, y, s, o2); m(34, 1362, 270, { h: 1.16, br: 1.02, turn: .6, lean: -.03 }); m(1016, 1372, 300, { h: 1.2, br: 1.05, turn: -.7 });
          m(690, 1460, 310, { h: lerp(1.0, 1.72, rise), br: 1.16, turn: -.75, lean: lerp(.03, -.01, rise) }); }, { rim: { c: 'rgb(255,158,84)', dx: 3, dy: 2.4, a: .6 } });
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); const x = LAMP[0], y = LAMP[1]; blob(g, [[x - 46, y + 48], [x - 38, y + 22], [x - 14, y + 8], [x + 12, y + 8], [x + 30, y + 16], [x + 56, y + 14], [x + 58, y + 26], [x + 40, y + 48]]); }, { rim: { c: 'rgb(255,172,94)', dx: 0, dy: 3, a: .85 } });
        halo(o, cam, lx, ly - 16, 150, '255,132,44', .3 * f * dipF); } };
  }

  // ================================================================ R2a: the olive garden (black trunks in three depths, torches between them)
  function trunk(g, x, base, w, seed) { const r = rngOf(seed * 97 + 11), n = 11, L = [], R = [], lean = (r() - .5) * .5, tw = r() * 6;
    for (let i = 0; i <= n; i++) { const k = i / n, y = base - k * 2100, wid = w * (.34 + .66 * Math.pow(1 - k, 2.1)) * (1 + .22 * Math.sin(k * 11 + tw) + .1 * Math.sin(k * 27 + tw * 2)), cx = x + lean * k * 620 + Math.sin(k * 4.6 + tw) * w * .42 * k; L.push([cx - wid * (.9 + .14 * Math.sin(k * 17 + tw)), y]); R.unshift([cx + wid * (.9 + .14 * Math.sin(k * 14 + tw * 3)), y]); }
    L[0][0] -= w * .34; R[n][0] += w * .34; blob(g, [...L, ...R]);
    const bough = (k0, dir, len) => { const i = Math.round(k0 * n), bx = (L[i][0] + R[n - i][0]) / 2, by = L[i][1], th = w * .3; g.beginPath(); const P = []; for (let j = 0; j <= 6; j++) { const q = j / 6; P.push([bx + dir * len * q + Math.sin(q * 5 + seed) * 22, by - len * (.52 * q + .36 * q * q) ]); } const up = P.map(([px, py], j) => [px, py - th * (1 - j / 7)]), dn = P.map(([px, py], j) => [px, py + th * (1 - j / 7)]).reverse(); spline(g, [...up, ...dn]); g.fill(); };
    bough(.42 + r() * .1, r() < .5 ? -1 : 1, w * 3.4); bough(.62 + r() * .1, r() < .5 ? -1 : 1, w * 2.8); }
  const GT = { far: [[-40, 54, 3], [210, 62, 5], [430, 48, 8], [690, 66, 9], [930, 52, 13], [1190, 60, 14], [1420, 56, 21]], mid: [[-70, 100, 22], [300, 112, 24], [850, 104, 29], [1300, 116, 31]], near: [[-120, 170, 41], [1270, 190, 44]] };
  const TORCH = Array.from({ length: 10 }, (_, i) => { const r = rngOf(610 + i * 7); r(); const z = .42 + r() * .5; return { x0: -260 + i * 150 + r() * 70, y: lerp(842, 1086, z), z, sp: 26 + r() * 8, ph: r() * 6.28, dl: r() * .7, seed: r() * 9, side: r() < .5 ? -1 : 1 }; });
  function r2a(t, T) { const u = clamp((t - T.N142 + .6) / (T.N143 + .4 - T.N142 + .6)), camX = lerp(430, 650, u), cam = [camX, 842, 1.02], par = p => (x) => x - (camX - 540) * p, tr = TORCH.map(q => { const k = clamp((t - T.N142 + 1.2 - q.dl) / 7.4), adv = k * 200 * q.z, X = par(q.z * .84)(q.x0 + (t - T.N142) * q.sp * q.z + 40), bob = Math.abs(Math.sin((t + q.ph) * 3.05)) * 7 * q.z, s = lerp(96, 214, q.z) * (1 + k * .14), Y = q.y + adv * .12, fk = .84 + .16 * wob(t, 8.7, 13.1, q.ph); return { q, X, Y, s, bob, fk, tipX: X + q.side * .34 * s, tipY: Y - 1.86 * s - bob }; });
    maskBegin(); const near = [...tr].sort((a, b) => b.q.z - a.q.z).slice(0, 3), flames = tr.map(p => [p.tipX, p.tipY - p.s * .04, p.s * .34, p.s * .5 * p.fk, p.q.seed, .95, 0]);
    return { kind: 0, cam, t, sky: { a: [.0, .0, .0], b: [.012, .011, .012], y: [960, 150, .012] }, flames, L: near.map(p => ({ x: p.tipX, y: p.tipY, z: 170, I: 2.1 * p.fk, r: 150 + p.s * .7, c: [1, .57, .2] })), haze: .5, shD: 0, vig: .6, gain: 1.05,
      over(o) { const figs = (g, b) => { for (const p of tr) { g.save(); g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.rect(p.X - p.s, p.Y - p.s * 2.4, p.s * 2, p.s * 2.4 + 3); g.clip(); man(g, b, p.X, p.Y + p.bob, p.s,
 { h: 1.62, br: .96 + p.q.seed * .025, turn: .6 * p.q.side, sv: 1 }); g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.lineWidth = Math.max(2, p.s * .03); g.strokeStyle = '#050505'; g.lineCap = 'round'; g.beginPath(); g.moveTo(p.tipX, p.tipY); g.lineTo(p.X + p.q.side * .27 * p.s, p.Y - .88 * p.s + p.bob); g.stroke(); atf(g, b, p.X, p.Y + p.bob, p.s); const d = p.q.side; limb(g, d * .3, 1.26, .07, d * .36, 1.0, .05); limb(g, d * .36, 1.0, .05, d * .3, 1.24, .036); g.restore(); } };
        const treeL = (lst, p, by) => (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox + (camX - 540) * (1 - p) * b.k, b.oy); for (const [x, w, s] of lst) trunk(g, x, by, w, s); };
        const ground = (y0, amp) => (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox - (camX - 540) * .2 * b.k, b.oy); g.beginPath(); g.moveTo(-300, y0 + 30); for (let x = -300; x <= 1600; x += 40) g.lineTo(x, y0 + amp * Math.sin(x * .007 + 1) + amp * .4 * Math.sin(x * .023)); g.lineTo(1600, 2300); g.lineTo(-300, 2300); g.closePath(); g.fill(); };
        mass(o, cam, ground(892, 12), { fill: '#090807', blur: 2 }); mass(o, cam, treeL(GT.far, .36, 1180), { blur: 2.4,
 fill: '#080808', rim: { c: 'rgb(255,170,110)', dx: 2, dy: 0, a: .2 } }); mass(o, cam, figs, { blur: 1.2, fill: '#060606', rim: { c: 'rgb(255,154,80)', dx: 0, dy: 3.2, a: .5 } });
        for (const p of tr) halo(o, cam, p.tipX, p.tipY - p.s * .05, p.s * 1.1, '255,136,50', .26 * p.fk);
        mass(o, cam, ground(1176, 16), { fill: '#040404' }); mass(o, cam, treeL(GT.mid, .78, 1300), { blur: 1.3, fill: '#040404', rim: { c: 'rgb(238,190,150)', dx: -3, dy: 0, a: .12 } });
 mass(o, cam, treeL(GT.near, 1.4, 1900), { blur: 16, fill: '#020202' }); } };
  }

  // ================================================================ R2b: one lit trunk — arm, sword, glint, then a hand and a bowed head
  const AO = { x: 540, y: 760, s: 880 };
  function poseSword(t, T) { const K = (a, b, c, d, e, f) => [[T.draw[0], a], [T.draw[1], b], [T.raise[1], c], [T.strike[1], d], [T.lower[0], e], [T.lower[1], f]];
    const tr = (t > T.strike[1] ? clamp((t - T.strike[1]) * 1.2) : 0) * (1 - ss(T.lower[0], T.lower[1], t)), shake = tr * .012;
    const S = [kf(t, K(.6, .6, .64, .52, .58, .82)), kf(t, K(-.08, -.05, .02, -.06, -.04, -.34))];
    const Wp = [kf(t, K(.36, .24, .3, .0, .1, .66)) + shake * wob(t, 31, 23), kf(t, K(-.2, .1, .36, .2, .28, -.74)) + shake * wob(t, 27, 19, 1)];
    const ang = kf(t, K(5.0, 7.34, 8.14, 9.5, 8.6, 5.7))
 + shake * 1.5 * wob(t, 37, 29, 2), q = ik(S, Wp, .32, .29, 1);
    return { S, W: q.W, E: q.E, ang, vis: 1 - ss(T.lower[1] - .3, T.lower[1], t) }; }
  // the reaching arm comes down from above-left, so it can only be another man's arm; the fingers rest at the side of the bowed head
  function poseHeal(t, T) { const r = ss(T.reach[0], T.reach[1], t), off = ss(T.touch + .6, T.wall + .2, t), Tg = [-.438, -.012], S = [lerp(-1.06, -.92, r), lerp(.46, .38, r)], Wp = [lerp(-1.12, Tg[0], r) - off * .02, lerp(.12, Tg[1], r) + off * .012], q = ik(S, Wp, .34, .32, -1); return { r, S, W: q.W, E: q.E }; }
  function r2b(t, T) { const u = clamp((t - T.N143) / (T.wall + .6 - T.N143)), cam = [lerp(540, 476, u), lerp(790, 796, u), lerp(1.03, 1.14, u)], sh = t > T.strike[1] ? clamp((t - T.strike[1]) * 1.4) * (1 - ss(T.lower[0], T.lower[1], t)) : 0, f = (fl(t, 1) - .88) * 1.5, shk = sh * (.5 + .5 * wob(t, 18, 27, 1)), toH = ss(T.lower[0] + .6, T.reach[1], t);
    const lx = lerp(510, 424, toH)
 + 30 * f + 15 * shk * Math.sin(t * 23), ly = lerp(640, 768, toH)
 + 14 * f + 9 * shk * Math.sin(t * 19), Q = poseSword(t, T), H = poseHeal(t, T), flin = ss(T.strike[0] + .12, T.strike[1] + .25, t), bow = lerp(.05, .36, flin) * (1 - .25 * ss(T.touch, T.touch + .8, t)), tn = lerp(.86, -.74, ss(T.strike[0] + .08, T.strike[1] + .5, t));
    maskBegin(); const MS = { k: MB.k, ox: MB.ox - MB.k * 11 * shk * Math.sin(t * 23), oy: MB.oy - MB.k * 7 * shk * Math.sin(t * 19) }, sx = 384, sy = 1306, ss0 = 560; man(mg, MS, sx - 14 * flin,
 sy + 18 * flin, ss0, { h: 1.0, br: 1.02, turn: tn, lean: -bow * .34, hx: bow * .1 * Math.sign(tn || 1), hy: -bow * .1, sv: 1.03 });
    if (Q.vis > .01) { atf(mg, MS, AO.x, AO.y, AO.s); mg.globalAlpha = Q.vis;
 const ca = Math.cos(Q.ang), sa = Math.sin(Q.ang); limb(mg, Q.S[0], Q.S[1], .1, Q.S[0] + .6, Q.S[1] - .34, .26);
      sleeveArm(mg, Q.S, Q.W, .32, .29, 1, fist, Q.ang); const hx = Q.W[0] + ca * .074, hy = Q.W[1] + sa * .074; mg.save(); mg.translate(hx, hy); mg.rotate(Q.ang); mg.beginPath(); mg.moveTo(-.008, -.02); mg.lineTo(.1, -.024); mg.lineTo(.53, -.012); mg.lineTo(.6, 0); mg.lineTo(.53, .012); mg.lineTo(.1, .024); mg.lineTo(-.008, .02); mg.closePath(); mg.fill(); mg.fillRect(.004, -.058, .018, .116); mg.restore(); mg.globalAlpha = 1; }
    if (H.r > .001) { atf(mg, MB, AO.x, AO.y, AO.s); sleeveArm(mg, H.S, H.W, .34, .32, -1, openHand, lerp(-.2, -.6, H.r));
 }
    let glint = 0; { const x = (t - T.flash) / .13; glint = Math.exp(-x * x); }
    return { kind: 1, cam, t, L: [{ x: lx, y: ly, z: 300, I: 7.2 * fl(t, 1) * (1 - .12 * shk), r: 450, c: [1, .66, .36] }, { x: 880, y: 1300, z: 500, I: .16, r: 330, c: [1, .52, .18] }], amb: .007, haze: .05, soft: .3, softD: 2.0, gain: 1.05, vig: .72,
      over(o) { if (glint < .004) return; const b = camBase(cam), W0 = [AO.x + Q.W[0] * AO.s, AO.y - Q.W[1] * AO.s], px = b.k * W0[0] + b.ox, py = b.k * W0[1] + b.oy, a = -Q.ang, L = 760; o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.translate(px, py); o.rotate(a); const g = o.createLinearGradient(40, 0, 600 * b.k, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.44,
`rgba(255,255,255,${.95 * glint})`); g.addColorStop(1, 'rgba(255,255,255,0)');  o.fillStyle = g; o.filter = 'blur(1.6px)'; o.fillRect(40, -1.1, 560 * b.k, 2.2); o.restore(); const hp = (t - T.flash) / .26 + .5, hd = lerp(.08, .56, clamp(hp)) * AO.s * b.k, hx = px + Math.cos(a) * hd, hy = py + Math.sin(a) * hd, gr = o.createRadialGradient(hx, hy, 0, hx, hy, 46); gr.addColorStop(0, `rgba(255,255,255,${.85 * glint})`); gr.addColorStop(.25, `rgba(255,250,240,${.26 * glint})`); gr.addColorStop(1, 'rgba(255,250,240,0)'); o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.fillStyle = gr; o.fillRect(hx - 46, hy - 46, 92, 92); o.restore(); } };
  }

  // ================================================================ R2e: the procession on the stone wall
  const PROC = [{ o: -730, s: 430, h: 1.72, br: .98, turn: .75, spear: 1 }, { o: -385, s: 445, h: 1.74, br: 1, turn: .8, torch: 1 }, { o: 0, s: 425, h: 1.68, br: .86, jesus: true }, { o: 385, s: 452, h: 1.76, br: 1.02, turn: .82, torch: 1 }, { o: 740, s: 436, h: 1.7, br: .98, turn: .7, spear: 1 }];
  function r2e(t, T) { const u = clamp((t - T.wall) / (T.N146 + .8 - T.wall)), cam = [lerp(516, 590, u), 944, 1.03],
 base = lerp(330, 760, u), f = fl(t, 2);
    maskBegin(); for (const m of PROC) { const X = base + m.o, bob = Math.abs(Math.sin((t + m.o * .002) * 3.1)) * 7, y = 1290 + bob; man(mg, MB, X, y, m.s, { h: m.h, br: m.br, turn: m.turn || 0, jesus: m.jesus, sv: 1.05, lean: .012 * Math.sin(t * 3.1 + m.o) }); atf(mg, MB, X, y, m.s, 0, 1, 1.05);
      if (m.spear) { mg.save(); mg.rotate(.03); mg.fillRect(.34, -.3, .024, 2.46); mg.beginPath(); mg.moveTo(.326, 2.14); mg.lineTo(.378, 2.14); mg.lineTo(.352, 2.42); mg.closePath(); mg.fill(); mg.restore(); limb(mg, .26, 1.3, .07, .35, 1.08, .046); }
      if (m.torch) { limb(mg, -.26, 1.3, .07, -.38, 1.1, .046); mg.save(); mg.rotate(-.1); mg.fillRect(-.42, .86, .028, .98); mg.restore(); }
      if (m.jesus) { for (const sd of [-1, 1]) { const Sx = sd * .29; void Sx; limb(mg, sd * .7, 1.34, .058, sd * .36, 1.24, .044); limb(mg, sd * .36, 1.24, .05, sd * .28, 1.22, .05);
 } } }
    mg.setTransform(MB.k, 0, 0, MB.k, MB.ox, MB.oy); mg.beginPath(); mg.moveTo(base - 730, 820); mg.lineTo(base - 275, 820); mg.quadraticCurveTo(base - 192, 884, base - 110, 820); mg.lineTo(base + 110, 820); mg.quadraticCurveTo(base + 192, 884, base + 275, 820); mg.lineTo(base + 740, 820); mg.lineTo(base + 740, 1420); mg.lineTo(base - 730, 1420); mg.closePath(); mg.fill();   // below the waist the bodies are one shadow (no slivers of wall between robes)
    const tx = p => base + p, fls =
[[tx(-420), 1094], [tx(262), 1096]]
.map(([x, y], i) => ({ x, y: y + 5 * Math.sin(t * 3.1 + i), f: .85 + .15 * wob(t, 8.7, 13.1, i * 2) }));
    return { kind: 2, cam, t, flames: fls.map((q, i) => [q.x, q.y - 26, 58, 104 * q.f, 3.4 + i, 1, 0]), L: [{ x: base, y: 1110, z: 420, I: 6.2 * f, r: 520, c: [1, .62, .3] }, { x: fls[0].x, y: fls[0].y, z: 90, I: .8, r: 200, c: [1, .5, .15] }, { x: fls[1].x, y: fls[1].y, z: 90, I: .8, r: 200, c: [1, .5, .15] }], amb: .006, haze: .07, soft: .45, softD: 1.9, gain: 1.05, vig: .66,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-200, 1200); for (let x = -200; x <= 1400; x += 60) g.lineTo(x, 1188 + 9 * Math.sin(x * .021) + 5 * Math.sin(x * .07)); g.lineTo(1400, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill(); g.lineWidth = 7; g.lineCap = 'round'; g.strokeStyle = '#050505'; for (const q of fls) { g.beginPath(); g.moveTo(q.x, q.y - 10); g.lineTo(q.x - 20, 1240); g.stroke(); } }, { blur: 2 }); for (const q of fls) halo(o, cam, q.x, q.y - 26, 200, '255,136,50', .32 * q.f); } };
  }

  // ================================================================ R3: the courtyard fire and the shadows around it
  const FIRE3 = [470, 1166], MEN3 = [{ x: 8, s: 420, h: 1.1, br: .98, t0: .5 }, { x: 244, s: 486, h: 1.2, br: 1.04, t0: .4 },
 { x: 902, s: 470, h: 1.16, br: 1.02, t0: -.45 }, { x: 1060, s: 430, h: 1.12, br: .96, t0: -.55 }], PX3 = 650;
  function poseR3(t, T) { const g1 = ss(T.two, T.two + 1.05, t), g2 = ss(T.three, T.three + 1.05, t), pt = ss(T.point[0], T.point[1], t) * (1 - ss(T.two - .75, T.two + .35, t)), aw = ss(T.away[0], T.away[1], t), en = ss(T.enter[0], T.enter[1], t) * (1 - ss(T.two - .35, T.two + 1.15, t)),
 St = [0, 0], Wt = [lerp(.16, .534, pt), lerp(-.36, .094, pt)], q = ik(St, Wt, .36, .32, -1); return { pt, aw, en, g1, g2, St, W: q.W, E: q.E }; }
  function r3(t, T) { const u = clamp((t - T.N146) / (T.N149 - T.N146)), zz = lerp(1.0, 1.11, u), cam = [lerp(536, 552, u), FIRE3[1] - 206 / zz, zz],
 f = fl(t, .4), j = (f - .88) * 22, Q = poseR3(t, T), { aw, en, g1, g2 } = Q;
    maskBegin(); const fan = x => (x - FIRE3[0]) / 1000 * .24, by = 1252;
    MEN3.forEach((m, i) => { const g = i === 1 ? g1 : i === 2 ? g2 : g2 * .5, side = m.x < PX3 ? 1 : -1, sc = m.s * (1 + g * .26) * (1 + (f - .88) * .05), turn = lerp(m.t0, side * .92, g), lean = fan(m.x) + side * g * .13; man(mg, MB, m.x + side * g * 62 + j * .35, by, sc, { h: m.h, br: m.br, turn, lean, sv: 1.1 }); });
    { const sc = 560 * (1 + (f - .88) * .05), turn = lerp(-.86, .88, sine(aw)), lean = fan(PX3) + aw * .12; man(mg, MB, PX3 + j * .35 + aw * 16, by, sc, { h: 1.25, br: 1.26, turn, lean, sv: 1.1, hx: aw * .045, hy: -.03 * aw }); }
    if (en > .001) { const wx = lerp(-330, 110, en), wy = by + 26, ws = 430; man(mg, MB, wx + j * .3, wy, ws, { h: 1.75, br: .76, veil: true, lean: .015, sv: 1.06 }); atf(mg, MB, wx + j * .3, wy, ws, .015, 1, 1.06); mg.translate(.2, 1.31); mg.scale(1.15, 1); blob(mg, [[-.1, .06], [Q.E[0] * .7, Q.E[1] + .05], [lerp(Q.E[0], Q.W[0], .52), lerp(Q.E[1], Q.W[1], .52) - .02], [lerp(Q.E[0], Q.W[0], .4), Q.E[1] - .3], [.02, -.58], [-.22, -.6]]); sleeveArm(mg, Q.St, Q.W, .36, .32, -1, pointing,
 Math.atan2(Q.W[1] - Q.E[1], Q.W[0] - Q.E[0]) * .6 + .06); }
    mg.setTransform(MB.k, 0, 0, MB.k, MB.ox, MB.oy); { const ny = lerp(884, 772, ss(0, .6, en)); mg.beginPath(); mg.moveTo(170, 1010); mg.lineTo(250, 856); mg.lineTo(380, ny); mg.quadraticCurveTo(476, ny + 44, 600, ny); mg.lineTo(880, 856); mg.lineTo(960, 1010); mg.lineTo(960, 1446); mg.lineTo(170, 1446); mg.closePath(); mg.fill(); }   // below the shoulders the seated men are one shadow (no sliver of wall between them)
    const flames = [[FIRE3[0], FIRE3[1] + 22, 280, 64, 0, .86, 1], [FIRE3[0] - 62, FIRE3[1] + 6, 118, 30 * f, 2.1, .3, 2], [FIRE3[0] - 6, FIRE3[1] + 4, 142, 40 * f, 4.7, .37, 2], [FIRE3[0] + 60, FIRE3[1] + 7, 110, 27 * f, 7.3, .27, 2]];
    return { kind: 0, cam, t, flames, L: [{ x: FIRE3[0] + j * .6, y: FIRE3[1] - 26, z: 230, I: 5.2 * f, r: 520, c: [1, .5, .15] }, { x: FIRE3[0], y: FIRE3[1] + 2, z: 62, I: .55 * f, r: 130, c: [1, .4, .08] }]
, amb: .004, haze: .1, soft: .5, softD: 2.0, gain: 1.05, vig: .68,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-200, 1244); for (let x = -200; x <= 1400; x += 60) g.lineTo(x, 1230 + 7 * Math.sin(x * .024) + 3 * Math.sin(x * .09)); g.lineTo(1400, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill();
          }, { blur: 1.6, rim: { c: 'rgb(255,138,52)', dx: 0, dy: 3.4, a: .5 } });
        embers(o, cam, FIRE3[0], FIRE3[1], .9, t); halo(o, cam, FIRE3[0], FIRE3[1] - 2, 280, '255,122,34', .24 * f); } };
  }

  // ================================================================ R4: the roofline, first grey of dawn
  function r4(t, T) { const u = clamp((t - T.N149) / (T.L105 + .7 - T.N149)), cam = [540, lerp(860, 846, u), lerp(1.0, 1.03, u)], d = lerp(.2, .62, sine(u)); maskBegin();
    return { kind: 0, cam, t, sky: { a: [.002, .002, .0024], b: [.012, .012, .014], y: [862, 40 + 26 * u, d] }
, L: [], haze: 0, shD: 0, mono: 1, vig: .5,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); const P = [[-200, 896], [70, 893], [78, 868], [250, 864], [256, 884], [470, 880], [476, 846], [612, 842], [620, 872], [760, 868], [790, 842], [846, 826], [902, 836], [930, 866], [1120, 862], [1126, 884], [1400, 880]]; g.beginPath(); g.moveTo(P[0][0], P[0][1]); P.forEach((q, i) => { const n = P[i + 1]; if (!n) return g.lineTo(q[0], q[1]); const seg = 6; for (let j = 0; j < seg; j++) { const k = j / seg; g.lineTo(lerp(q[0], n[0], k), lerp(q[1], n[1], k) + 1.6 * Math.sin((q[0] + (n[0] - q[0]) * k) * .13)); } }); g.lineTo(1400, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill(); }, { fill: '#020202', blur: .7 }); } };
  }

  // ================================================================ R5: Peter's shoulders near; a far doorway; rack focus
  const DOOR = [628, 362, 762, 644], walkDoor = (t, T) => lerp(DOOR[0] + 4, DOOR[0] + 56, sine((t - T.L105 + .4) / (T.doorStop - T.L105 + .4)));
  function poseR5(t, T) { const k = ss(T.doorTurn[0], T.doorTurn[1], t), rack = ss(T.rack[0], T.rack[1], t), x = walkDoor(t, T), wk = 1 - ss(T.doorStop - .3, T.doorStop + .05, t), bob = Math.abs(Math.sin(t * 4.3)) * 2.2 * wk; return { k, rack, x, bob, wk }; }
  function r5(t, T) { const u = clamp((t - T.L105 + .7) / (T.Q115 + 1 - T.L105 + .7)), cam = [lerp(536, 556, u), 804, lerp(1.015, 1.05, u)], Q = poseR5(t, T); maskBegin();
    return { kind: 0, cam, t, door: DOOR, doorK: 1.25, L: [{ x: (DOOR[0] + DOOR[2]) / 2, y: 520, z: 180, I: 1.5, r: 210, c: [.95, .92, .88] }, { x: -30, y: 1240, z: 330, I: .3, r: 420, c: [1, .5, .15] }], amb: .004, haze: .16, shD: 0, gain: 1.05, vig: .62, mono: .2,
      over(o) { const q = camBase(cam), Fy = q.k * DOOR[3] + q.oy, x0 = q.k * (DOOR[0] + 2) + q.ox, x1 = q.k * (DOOR[2] - 2) + q.ox; o.save(); o.setTransform(1, 0, 0, 1, 0, 0); { const g = o.createLinearGradient(0, Fy, 0, Fy + 520); g.addColorStop(0, '#191816'); g.addColorStop(.42, '#0b0b0a'); g.addColorStop(1, '#040404'); o.fillStyle = g; o.fillRect(0, Fy, VW, VH - Fy); }
        o.globalCompositeOperation = 'lighter'; o.filter = 'blur(9px)'; { const g = o.createLinearGradient(0, Fy, 0, Fy + 560); g.addColorStop(0, 'rgba(226,222,212,.42)'); g.addColorStop(.45, 'rgba(226,222,212,.09)'); g.addColorStop(1, 'rgba(226,222,212,0)'); o.fillStyle = g; o.beginPath(); o.moveTo(x0, Fy); o.lineTo(x1, Fy); o.lineTo(x1 - 40, Fy + 560); o.lineTo(x0 - 380, Fy + 560); o.closePath(); o.fill(); } o.restore();
        const dl = lerp(6.6, .35, Q.rack); mass(o, cam, (g, b) => { const fy = DOOR[3] + 2, s = 118; g.save(); g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.rect(DOOR[0] - 160, 0, 500, fy); g.clip(); const
 tn = lerp(.3, 0, Q.k), gx = Q.x + 62 + 6 * Q.k; atf(g, b, Q.x, fy - Q.bob, s); robe(g, 1.38, lerp(.68, .94, Q.k));
 limb(g, 0, 1.4, .08, 0, 1.52, .066); head(g, 0, 1.62, .124, 0, { jesus: true }); { const w = lerp(.68, 1, Q.k); limb(g, -.26 * w, 1.28, .07, -.31 * w, .9, .05); limb(g, .26 * w, 1.28, .07, .32 * w, .92, .05); }
          atf(g, b, gx, fy - Q.bob * .7, s * 1.05); robe(g, 1.4, 1.02); limb(g, 0, 1.42, .08, 0, 1.54, .066); head(g, tn * .4, 1.64, .118, tn - .5, { beard: true }); limb(g, -.28, 1.3, .07, -.42, 1.05, .048); limb(g, -.42, 1.05, .048, -.56, 1.03, .036); g.restore(); }, { blur: dl, fill: '#050505' });
        halo(o, cam, (DOOR[0] + DOOR[2]) / 2, 500, 300, '230,224,212', .13);
        const pb = lerp(1.4, 22, Q.rack), br = Math.sin(t * 1.5) * .006; mass(o, cam, (g, b) => { man(g, b, 214, 1590, 900, { h: 1.33 + br, br: 1.26, turn: .72, lean: -.02, beard: true }); }, { blur: pb, fill: '#030303', rim: { c: 'rgb(214,198,176)', dx: -3.2, dy: 2.2, a: lerp(.5, .16, Q.rack) } }); } };
  }

  // ================================================================ R6: the alley
  function poseR6(t, T) { const b = .5 + .5 * Math.sin((t - T.Q115) * 1.34), sob = Math.pow(Math.max(0, Math.sin((t - T.Q115) * .67)), 3); return { b, sob, y: b * 8 + sob * 13 }; }
  function r6(t, T) { const u = clamp((t - T.Q115 + .9) / (T.end - T.Q115 + .9)), cam = [lerp(600, 610, u), lerp(954, 974, u), lerp(1.0, 1.07, u)],
 Q = poseR6(t, T), slit = [742, 752, 2.2, 0]; maskBegin();
    // one draped shape, side-on: back to the wall, knees drawn up under the cloak, arms round the shins, forehead down on the knees (no hip, no gap)
    const body = (g, b) => { const y = Q.y; g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); blob(g, [[884, 1340], [878, 1190], [876, 1064], [856, 966], [814, 892 - y * .4], [760, 846 - y * .7], [704, 838 - y * .6], [656, 866 - y * .3], [606, 884 - y * .12], [552, 894], [496, 908], [444, 926], [404, 948], [388, 984], [392, 1050], [400, 1120], [396, 1186],
 [362, 1216], [332, 1244], [380, 1266], [520, 1266], [700, 1340]]);
      g.save(); g.translate(622, 836 - y * .66); g.rotate(-.5); g.beginPath(); g.ellipse(0, 0, 80, 70, 0, 0, TAU); g.fill(); g.restore(); blob(g, [[670, 790 - y * .66], [726, 806 - y * .64], [790, 868 - y * .55], [754, 892 - y * .5], [686, 868 - y * .6]]); };
    return { kind: 3, cam, t, L: [{ x: 1010, y: 470, z: 250, I: 1.12, r: 560, c: [.86, .87, .9] }], amb: .0042, haze: .07, shD: 0, gain: 1.05, vig: .56, mono: 1,
      over(o) { mass(o, cam, body, { fill: '#030303', blur: .9 });
        { const qb = camBase(cam), Fy = qb.k * 1236 + qb.oy; o.save(); o.setTransform(1, 0, 0, 1, 0, 0); const g = o.createLinearGradient(0, Fy - 40, 0, Fy + 60); g.addColorStop(0, 'rgba(3,3,3,0)'); g.addColorStop(.5, 'rgba(3,3,3,.92)'); g.addColorStop(1, 'rgba(3,3,3,1)'); o.fillStyle = g; o.fillRect(0, Fy - 40, VW, VH); o.restore(); }
        ta.setTransform(1, 0, 0, 1, 0, 0); ta.clearRect(0, 0, VW, VH); ta.fillStyle = '#fff'; body(ta, camBase(cam)); tb.setTransform(1, 0, 0, 1, 0, 0); tb.globalCompositeOperation = 'source-over'; tb.clearRect(0, 0, VW, VH); tb.drawImage(tA, 0, 0); tb.globalCompositeOperation = 'destination-out'; tb.drawImage(tA, -4, 5); tb.globalCompositeOperation = 'destination-in';
        { const q = camBase(cam), px = q.k * slit[0] + q.ox, py = q.k * slit[1] + q.oy, dx = -Math.sin(slit[2]), dy = Math.cos(slit[2]), W2 = 280, g = tb.createLinearGradient(px - dx * W2, py - dy * W2, px + dx * W2, py + dy * W2); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); tb.fillStyle = g; tb.fillRect(0, 0, VW, VH); } tb.globalCompositeOperation = 'source-over';
        o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.filter = 'blur(1.1px)'; o.globalAlpha = .9; o.drawImage(tB, 0, 0); o.restore(); } };
  }

  // ---------------------------------------------------------------- shots, dissolves, finish
  const SHOT = { r1, r2a, r2b, r2e, r3, r4, r5, r6 };
  const camOf = (id, t, T) => { const sv = { maskBegin }; void sv; return SHOT[id](t, T).cam; };
  const plan = T => [['r1', T.start, T.N142, .55], ['r2a', T.N142, T.N143, 0], ['r2b', T.N143, T.wall, .5], ['r2e', T.wall, T.N146, .7], ['r3', T.N146, T.N149, 0], ['r4', T.N149, T.L105, .75], ['r5', T.L105, T.Q115, .95], ['r6', T.Q115, T.end, 0]];
  const offA = mk(VW, VH), oa = offA.getContext('2d'), offB = mk(VW, VH), ob = offB.getContext('2d');
  const GK = { r1: 1.92, r2a: 3.5, r2b: 1.34, r2e: 1.62, r3: 2.15, r4: 1.6, r5: 3.3, r6: 1.75 };   // the shot's exposure (a night, but the light must read on a phone)
  function shoot(id, t, T, o) { const sp = SHOT[id](t, T); sp.gain = (sp.gain ?? 1) * GK[id]; glFrame(sp);
 o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.filter = 'none'; o.drawImage(glc, 0, 0); o.restore(); sp.over?.(o);
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.fillStyle = 'rgb(6,6,6)'; o.fillRect(0, 0, VW, VH); o.globalCompositeOperation = 'overlay'; o.globalAlpha = .13;
 o.imageSmoothingEnabled = true; o.drawImage(grainC, 0, 0, VW, VH); o.restore(); }
  function draw(ctx, t, T) { const P = plan(T); let i = P.findIndex(q => t < q[2]); if (i < 0) i = P.length - 1; const q = P[i], nx = P[i + 1], fade = nx && q[3] > 0 ? clamp((t - (q[2] - q[3] * .5)) / q[3]) : 0, pv = P[i - 1], fadeIn = pv && pv[3] > 0 ? clamp((t - (pv[2] - pv[3] * .5)) / pv[3]) : 1;
    shoot(q[0], t, T, oa); let img = offA;
    if (fade > 0 && nx) { shoot(nx[0], t, T, ob); oa.save(); oa.setTransform(1, 0, 0, 1, 0, 0); oa.globalAlpha = sine(fade); oa.drawImage(offB, 0, 0); oa.restore(); }
    else if (fadeIn < 1 && pv) { shoot(pv[0], t, T, ob); ob.save(); ob.setTransform(1, 0, 0, 1, 0, 0); ob.globalAlpha = sine(fadeIn); ob.drawImage(offA, 0, 0); ob.restore(); img = offB; }
    const sc = Math.max(W / VW, H / VH), dw = VW * sc, dh = VH * sc; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(img, (W - dw) / 2, (H - dh) * (H > W ? .5 : .36), dw, dh); ctx.restore(); }

  // ---------------------------------------------------------------- measurement: camera speed, ember rate, max joint-angle change per frame
  function measure(T, dt = 1 / 30) { const P = plan(T), idOf = t => (P.find(q => t < q[2]) || P[P.length - 1])[0], rows = [], J = {}; let prev = null, mx = { v: 0, t: 0, who: '' };
    const arms = t => { const a = {}; const s = idOf(t); if (s === 'r1') { const q = poseR1(t, T); a.vow = elbowAngle(q.S, q.E, q.W); } if (s === 'r2b') { const q = poseSword(t, T), h = poseHeal(t, T); a.sword = elbowAngle(q.S, q.E, q.W); if (h.r > 0) a.heal = elbowAngle(h.S, h.E, h.W); } if (s === 'r3') { const q = poseR3(t, T); if (q.en > 0) a.point = elbowAngle(q.St, q.E, q.W); } return { s, a }; };
    const n = Math.round((T.end - T.start) / dt); for (let i = 0; i <= n; i++) { const t = Math.min(T.start + i * dt, T.end - .001), id = idOf(t), c = SHOT[id](t, T).cam, ar = arms(t);
      if (prev && prev.id === id) { const sp = Math.hypot(c[0] - prev.c[0], c[1] - prev.c[1]) / dt, zr = Math.abs(c[2] - prev.c[2]) / dt; if (i % Math.round(.25 / dt) === 0 || Math.abs((i * dt) % .25) < dt / 2) rows.push([+(t - T.start).toFixed(2), id, +sp.toFixed(1), +zr.toFixed(4), id === 'r3' ? +(EM.length / 3.9).toFixed(1) : 0]); }
      if (prev && prev.ar.s === ar.s) for (const k in ar.a) if (k in prev.ar.a) { const d = Math.abs(ar.a[k] - prev.ar.a[k]); J[k] = Math.max(J[k] || 0, d); if (d > mx.v) mx = { v: d, t: +(t - T.start).toFixed(2), who: k }; }
      prev = { id, c, ar }; }
    return { rows, maxJoint: { rad: +mx.v.toFixed(3), deg: +(mx.v * 180 / Math.PI).toFixed(1), t: mx.t, who: mx.who, per: Object.fromEntries(Object.entries(J).map(([k, v]) => [k, +v.toFixed(3)])) } }; }
  return { draw, measure };
}
