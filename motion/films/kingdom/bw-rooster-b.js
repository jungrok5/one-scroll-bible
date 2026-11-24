// bw-rooster-b.js — 「kingdom」 5부 「닭이 울 때」 B안, film 541.2 (C13) → 627.3 (C14): the same lines as version A, the action told in shadows.
// Rule of this version: nobody performs an action in full view. Fire throws the action onto walls and tree trunks; people are dark masses, far, or out of focus.
// Look: German Expressionist / film-noir black and white (「노스페라투」 1922 stair shadow, 「칼리가리」 1920, 「제3의 사나이」 1949 wall shadows), one colour kept: fire #ff8a2a.
// Skills: cinecode camera-moves (dolly in, pull-back reveal, truck, pan; one move per shot, a reason for each), canvas-film BODY-CHECK and SCENE-RULES (two-bone IK, one bend sign per limb,
// hand drawn at the contact, planted feet). Carried over from bw-rooster.js (version A): page structure, text layer, the fire and ember shader.
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
//   R5a  Peter    L105       close, his profile in black, one thin orange rim; frozen, his head slowly lifts toward something across the yard. Slow push.
//   R5b  his eyes Q114       Peter's point of view through a rough stone arch: guards lead a bound man along a walkway in smoke; he alone stops, turns square on, and looks at us. Very slow push.
//   R5c  Peter    Q114       the same close framing; the orange drains out of the rim until no colour is left; one jolt through the shoulders; his head sinks.
//   R6a  flight   Q115       his huge shadow stumbles along an alley wall on uneven planted steps, one hand dragging on the stone. Slow pan.
//   R6b  fall     Q115       he hits a buttress with a flat hand, his knees give, he drops to his knees, side-on. Locked.
//   R6c  weeping  Q115       irregular sobs, visible breath in the cold, one silent cry, then folded to the ground; one long pull back that stops at about 14% of the frame; cold light grows across the stone onto his back.
// Holds (this page only, script.json untouched; see HOLDS): Q114 runs 12.0 s instead of 4.7 (+7.3), Q115 runs 20.0 s instead of 8.6 (+11.4). Block 86.1 → 104.8 s.
// Flicker changes brightness only, slowly (under 1.2 Hz). No shadow, mask, figure or lamp position moves at flicker rate (owner, 2026-11-24).
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
export const HOLDS = { Q114: 7.3, Q115: 11.4 };   // extra seconds on these two lines, applied by the page's local time map

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
  const b0 = B.L105 + 2.4; T.look = { a: B.L105, b: b0, stop: b0 + .7, turn: [b0 + .85, b0 + 2.75], c: B.Q115 - 2.8 }; T.caption114 = T.look.turn[1] - .25;   // the caption comes as he finishes turning
  T.flee = B.Q115; T.fall = B.Q115 + 3.6; T.weep = B.Q115 + 6.6;
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
  float bark(vec2 p){ vec2 w = vec2(fb(p * .0022), fb(p * .0022 + 7.)) - .5; vec2 c = (p + w * vec2(130., 80.)) * vec2(.0075, .0026), ic = floor(c), fc = fract(c); float d1 = 8., d2 = 8.; vec2 bs = ic;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){ vec2 g = vec2(x, y), o = vec2(hh(ic + g), hh(ic + g + 17.)) * .85 + .07, r = g + o - fc; float d = dot(r, r); if (d < d1){ d2 = d1; d1 = d; bs = ic + g; } else if (d < d2) d2 = d; }
    float e = sqrt(d2) - sqrt(d1) + (fb(p * .03) - .5) * .22; return smoothstep(.0, .26, e) * .24 + (.34 + .2 * hh(bs + .7)) + fb(p * .012 + bs * .3) * .34 + fb(p * vec2(.11, .06)) * .16; }
  float stone(vec2 p){ float yy = p.y + (fb(p * .0021) - .5) * 58.; vec2 b = vec2(p.x, yy) / vec2(312., 172.); float row = floor(b.y); b.x += hh(vec2(row, 3.)) * 2. + (vn(vec2(p.x * .0026, row)) - .5) * .42; vec2 f = fract(b), id = floor(b);
    float e = min(min(f.x, 1. - f.x) * 1.82, min(f.y, 1. - f.y)) + (fb(p * .022) - .5) * .17; return smoothstep(-.01, .085, e) * .2 + (.36 + .2 * hh(id + .7)) + fb(p * .0085 + id) * .38 + fb(p * .05) * .16 - .1; }
  float alley(vec2 p){ return brick(p * 1.25) * .7 + fb(p * vec2(.012, .004) + 3.) * .4; }
  float H(vec2 p){ return uKind == 1 ? bark(p) : uKind == 2 ? stone(p) : uKind == 3 ? alley(p) : brick(p); }
  void main(){ vec2 p = gl_FragCoord.xy - uMarg; float e = 1.5, h = H(p), hx = H(p + vec2(e, 0.)) - H(p - vec2(e, 0.)), hy = H(p + vec2(0., e)) - H(p - vec2(0., e));
    float amp = uKind == 1 ? 1.3 : uKind == 2 ? 1.5 : uKind == 3 ? 2.6 : 1.25;
 vec3 N = normalize(vec3(-hx * amp, -hy * amp, 1.));
    if (uKind == 1) N = normalize(N + vec3((p.x - 520.) / 560., 0., 0.));
    float big = fb(p * .0021 + 3.1), al = (.56 + .5 * h) * mix(.72, 1.18, big); if (uKind == 1) al *= .72; if (uKind == 3) al *= mix(.55, 1., smoothstep(.3, .7, fb(p * vec2(.006, .0016) + 9.)));
    o = vec4(N.xy * .5 + .5, clamp(al * .72, 0., 1.), h); }`;
// the lit wall: up to four flames, one shadow mask, haze in the light
const WALL = `#version 300 es
  precision highp float; in vec2 vUv; out vec4 o; ${NOISE}
  uniform sampler2D tS, tM; uniform vec2 uRes, uMarg, uWall; uniform vec3 uCam; uniform int uSurf;
  uniform vec4 uL[4]; uniform vec3 uLc[4]; uniform float uLr[4]; uniform float uAmb, uHaze, uT, uShD, uSoft, uSoftD, uGain, uMono, uDoorK, uVig;
  uniform vec3 uSky0, uSky1, uSkyB; uniform vec4 uDoor, uSlit; uniform float uDet, uHzS, uHzV;
  const vec2 PO[8] = vec2[8](vec2(-.61,.33), vec2(.2,-.72), vec2(.78,.27), vec2(-.2,.88), vec2(-.87,-.38), vec2(.45,.66), vec2(-.34,-.28), vec2(.28,.06));
  float shade(vec2 uv, float lod){ vec2 tx = 1. / vec2(textureSize(tM, 0)); float s = 0., r = pow(2., lod) * .9; for (int i = 0; i < 8; i++) s += textureLod(tM, uv + PO[i] * r * tx, lod).r; return s / 8.; }
  void main(){ vec2 fc = gl_FragCoord.xy; fc.y = uRes.y - fc.y; vec2 p = (fc - uRes * .5) / uCam.z + uCam.xy, uv = (p + uMarg) / (uWall + 2. * uMarg);
    vec3 col = vec3(0.), sc = vec3(0.); float hz = fb(p * .0024 * uHzS + vec2(uT * .018, -uT * .026) * uHzV); hz = smoothstep(.26, .78, hz);
    float al = .4; vec3 N = vec3(0., 0., 1.);
    if (uSurf == 1) { vec4 s = texture(tS, uv); N = vec3(s.xy * 2. - 1., 0.); N.z = sqrt(max(.04, 1. - dot(N.xy, N.xy))); al = s.b; if (uDet > 0.) al *= 1. + uDet * (fb(p * vec2(.21, .11) + 2.) - .5); col = vec3(uAmb * al); }
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
function flatHand(g) { blob(g, [[-.03, .05], [.03, .058], [.08, .05], [.12, .04], [.155, .032], [.178, .02], [.184, .004], [.172, -.01], [.13, -.016], [.08, -.022], [.03, -.028], [-.03, -.026]]); limb(g, .02, .04, .014, .062, .062, .01); }
function inHand(g, W, ang, fn) { g.save(); g.translate(W[0], W[1]); g.rotate(ang); fn(g); g.restore(); }
function sleeveArm(g, S, W, l1, l2, bend, hand, ang) { const q = ik(S, W, l1, l2, bend), E = q.E, Wr = q.W;
  limb(g, S[0], S[1], .088, E[0], E[1], .058); const mx = lerp(E[0], Wr[0], .46), my = lerp(E[1], Wr[1], .46); limb(g, E[0], E[1], .058, mx, my, .052); limb(g, E[0], E[1], .046, Wr[0], Wr[1], .031);
  const a = Math.atan2(Wr[1] - E[1], Wr[0] - E[0]), nx = -Math.sin(a), ny = Math.cos(a); blob(g, [[mx + nx * .058, my + ny * .058], [mx + Math.cos(a) * .02 + nx * .03, my + Math.sin(a) * .02 + ny * .03], [mx + Math.cos(a) * .012 - nx * .02, my + Math.sin(a) * .012 - ny * .02], [mx - nx * .058, my - ny * .058], [mx - Math.cos(a) * .05, my - Math.sin(a) * .05]]);
  inHand(g, Wr, ang, hand); return { E, W: Wr }; }
// the head: round cloth, band and knot, cloth to the shoulder; turn −1…1 = facing left…right. Jesus and the veiled woman have no features at all.
function head(g, cx, cy, r, turn, o = {}) { const { jesus = false, veil = false, beard = true, cl = 1 } = o, a = Math.abs(turn), f = turn < 0 ? -1 : 1;
  g.beginPath(); g.ellipse(cx, cy, r, r * 1.1, 0, 0, TAU); g.fill();
  if (jesus || veil) { for (const sd of [-1, 1]) { const e = r * (veil ? 1.18 : 1.05), dn = (veil ? 2.9 : 1.75) * cl; blob(g, [[cx + sd * r * .62, cy + r * .66], [cx + sd * e, cy - r * .1], [cx + sd * e * 1.08, cy - r * dn * .8], [cx + sd * r * .52, cy - r * dn], [cx + sd * r * .1, cy - r * .6]]); } return; }
  // the cloth goes over the crown and falls behind the neck to the shoulder; a short tied end hangs at the nape (no brim, nothing at the brow)
  const b = -f, bk = lerp(.3, 1, a); blob(g, [[cx + b * r * .08, cy + r * 1.08], [cx + b * r * .8, cy + r * .72], [cx + b * r * (1.04 + .1 * bk), cy + r * .02], [cx + b * r * (1.14 + .2 * bk), cy - r * 1.0 * cl], [cx + b * r * (.84 + .2 * bk), cy - r * 1.8 * cl], [cx + b * r * .2, cy - r * 1.4 * cl], [cx - b * r * .2, cy - r * .3]]);
  if (a < .55) { const k = 1 - a / .55; blob(g, [[cx + f * r * .62, cy + r * .66], [cx + f * r * 1.0, cy], [cx + f * r * 1.02, cy - r * (.7 + .6 * k)], [cx + f * r * .58, cy - r * (.95 + .7 * k)], [cx + f * r * .14, cy - r * .5]]); }
  limb(g, cx + b * r * (.98 + .1 * bk), cy - r * .62, r * .16, cx + b * r * (1.18 + .12 * bk), cy - r * 1.24 * cl, r * .09);
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
    const f1 = (n, v) => gl.uniform1f(PW.u(n), v); f1('uAmb', sp.amb ?? .012); f1('uHaze', sp.haze ?? .12); f1('uT', sp.t); f1('uShD', sp.shD ?? .96); f1('uSoft', sp.soft ?? .6); f1('uSoftD', sp.softD ?? 2.2); f1('uGain', sp.gain ?? 1); f1('uMono', sp.mono ?? 0); f1('uDoorK', sp.door ? sp.doorK ?? 1 : 0); f1('uVig', sp.vig ?? .62); f1('uDet', sp.det ?? 0); f1('uHzS', sp.hzS ?? 1); f1('uHzV', sp.hzV ?? 1);
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
  const FIREC = [1, .54, .165], fl = (t, p = 0) => .92 + .08 * (.62 * Math.sin(t * 2.6 + p) + .38 * Math.sin(t * 6.1 + p * 1.7));   // under 1 Hz, multiplies light only

  // ================================================================ R1: the upper room
  const LAMP = [340, 1168];
  function poseR1(t, T) { const rise = ss(T.rise[0], T.rise[1], t), fk = ss(T.fist[0], T.fist[1], t), dip = ss(T.dip[0], T.dip[1], t), h = lerp(1.2, 1.8, rise), sh = h - .36, S = [-.29, sh * .97], W = [lerp(-.2, -.68, fk), lerp(sh * .7, h - .16, fk)]; return { rise, dip, fk, h, S, W, ...ik(S, W, .33, .3, 1) }; }
  function r1(t, T) { const u = clamp((t - T.start) / (T.N142 + .5 - T.start)), { rise, dip, S, W, h } = poseR1(t, T), f = fl(t), dipF = 1 - .34 * Math.pow(Math.sin(Math.PI * clamp((t - T.dip[0]) / 2.2)), 2);
    const zz = lerp(1.0, 1.085, u), cam = [lerp(548, 566, u), 1214 - 236 / zz, zz], lx = LAMP[0], ly = LAMP[1] + 10 * dip;
    maskBegin(); const sc = lerp(420, 530, sine(dip)), bx = 652, by = 1286, ln = lerp(.05, -.015, rise);
    man(mg, MB, 118, 1270, 300, { h: 1.2, br: .96, turn: .5, lean: -.05 }); man(mg, MB, 952, 1286, 330, { h: 1.18, br: 1, turn: -.7, lean: .07 }); man(mg, MB, 432, 1286, 290, { h: 1.1, br: .92, jesus: true, lean: .01 });
    man(mg, MB, bx, by, sc, { h, br: 1.18, turn: -.82, lean: ln }); atf(mg, MB, bx, by, sc, ln, 1, 1.06); const arm = ik(S, W, .33, .3, 1); sleeveArm(mg, S, W, .33, .3, 1, fist, Math.atan2(arm.W[1] - arm.E[1], arm.W[0] - arm.E[0]) - .2);
    const flames = [[lx, ly - 2, 38 * lerp(1, .86, dip), 92 * lerp(1, .7, dip), 1.3, 1.1 * dipF * f]];
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
  function r2a(t, T) { const u = clamp((t - T.N142 + .6) / (T.N143 + .4 - T.N142 + .6)), camX = lerp(430, 650, u), cam = [camX, 842, 1.02], par = p => (x) => x - (camX - 540) * p, tr = TORCH.map(q => { const k = clamp((t - T.N142 + 1.2 - q.dl) / 7.4), adv = k * 200 * q.z, X = par(q.z * .84)(q.x0 + (t - T.N142) * q.sp * q.z + 40), bob = (1 + Math.sin((t + q.ph) * 3.2)) * 2.4 * q.z, s = lerp(96, 214, q.z) * (1 + k * .14), Y = q.y + adv * .12, fk = .9 + .1 * Math.sin(t * 2.7 + q.ph); return { q, X, Y, s, bob, fk, tipX: X + q.side * .34 * s, tipY: Y - 1.86 * s - bob }; });
    maskBegin(); const near = [...tr].sort((a, b) => b.q.z - a.q.z).slice(0, 3), flames = tr.map(p => [p.tipX, p.tipY - p.s * .04, p.s * .34, p.s * .5, p.q.seed, .95 * p.fk, 0]);
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
  function poseSword(t, T) { const set = T.strike[1] + 1.1, K = (a, b, c, d, e, f) => [[T.draw[0], a], [T.draw[1], b], [T.raise[1], c], [T.strike[1], d], [set, e], [T.lower[0], e], [T.lower[1], f]];
    const S = [kf(t, K(.6, .6, .64, .52, .58, .82)), kf(t, K(-.08, -.05, .02, -.06, -.04, -.34))];
    const Wp = [kf(t, K(.36, .24, .3, .0, .1, .66)), kf(t, K(-.2, .1, .36, .2, .28, -.74))];
    const ang = kf(t, K(5.0, 7.34, 8.14, 9.5, 8.6, 5.7)), q = ik(S, Wp, .32, .29, 1);
    return { S, W: q.W, E: q.E, ang, vis: 1 - ss(T.lower[1] - .3, T.lower[1], t) }; }
  // the reaching arm comes down from above-left, so it can only be another man's arm; the fingers rest at the side of the bowed head
  function poseHeal(t, T) { const r = ss(T.reach[0], T.reach[1], t), off = ss(T.touch + .6, T.wall + .2, t), Tg = [-.438, -.012], S = [lerp(-1.06, -.92, r), lerp(.46, .38, r)], Wp = [lerp(-1.12, Tg[0], r) - off * .02, lerp(.12, Tg[1], r) + off * .012], q = ik(S, Wp, .34, .32, -1); return { r, S, W: q.W, E: q.E }; }
  function r2b(t, T) { const u = clamp((t - T.N143) / (T.wall + .6 - T.N143)), cam = [lerp(540, 476, u), lerp(790, 796, u), lerp(1.03, 1.14, u)], toH = ss(T.lower[0] + .6, T.reach[1], t), swell = ss(T.N144, T.N145, t) * (1 - ss(T.N145, T.N145 + 1.6, t));
    const lx = lerp(510, 424, toH), ly = lerp(640, 768, toH), Q = poseSword(t, T), H = poseHeal(t, T), flin = ss(T.strike[0] + .12, T.strike[1] + .25, t), bow = lerp(.05, .36, flin) * (1 - .25 * ss(T.touch, T.touch + .8, t)), tn = lerp(.86, -.74, ss(T.strike[0] + .08, T.strike[1] + .5, t));
    maskBegin(); const sx = 384, sy = 1306, ss0 = 560; man(mg, MB, sx - 14 * flin, sy + 18 * flin, ss0, { h: 1.0, br: 1.02, turn: tn, lean: -bow * .34, hx: bow * .1 * Math.sign(tn || 1), hy: -bow * .1, sv: 1.03 });
    if (Q.vis > .01) { atf(mg, MB, AO.x, AO.y, AO.s); mg.globalAlpha = Q.vis; const ca = Math.cos(Q.ang), sa = Math.sin(Q.ang); limb(mg, Q.S[0], Q.S[1], .1, Q.S[0] + .6, Q.S[1] - .34, .26);
      sleeveArm(mg, Q.S, Q.W, .32, .29, 1, fist, Q.ang); const hx = Q.W[0] + ca * .074, hy = Q.W[1] + sa * .074; mg.save(); mg.translate(hx, hy); mg.rotate(Q.ang); mg.beginPath(); mg.moveTo(-.008, -.02); mg.lineTo(.1, -.024); mg.lineTo(.53, -.012); mg.lineTo(.6, 0); mg.lineTo(.53, .012); mg.lineTo(.1, .024); mg.lineTo(-.008, .02); mg.closePath(); mg.fill(); mg.fillRect(.004, -.058, .018, .116); mg.restore(); mg.globalAlpha = 1; }
    if (H.r > .001) { atf(mg, MB, AO.x, AO.y, AO.s); sleeveArm(mg, H.S, H.W, .34, .32, -1, openHand, lerp(-.2, -.6, H.r)); }
    let glint = 0; { const x = (t - T.flash) / .13; glint = Math.exp(-x * x); }
    return { kind: 1, cam, t, L: [{ x: lx, y: ly, z: 300, I: 6.6 * fl(t, 1) * (1 + .26 * swell), r: lerp(430, 490, swell), c: [1, .66, .36] }, { x: 880, y: 1300, z: 500, I: .16, r: 330, c: [1, .52, .18] }], amb: .007, haze: .05, soft: .3, softD: 2.0, gain: 1.05, vig: .72,
      over(o) { if (glint < .004) return; const b = camBase(cam), W0 = [AO.x + Q.W[0] * AO.s, AO.y - Q.W[1] * AO.s], px = b.k * W0[0] + b.ox, py = b.k * W0[1] + b.oy, a = -Q.ang, L = 760; o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.translate(px, py); o.rotate(a); const g = o.createLinearGradient(40, 0, 600 * b.k, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.44,
`rgba(255,255,255,${.95 * glint})`); g.addColorStop(1, 'rgba(255,255,255,0)');  o.fillStyle = g; o.filter = 'blur(1.6px)'; o.fillRect(40, -1.1, 560 * b.k, 2.2); o.restore(); const hp = (t - T.flash) / .26 + .5, hd = lerp(.08, .56, clamp(hp)) * AO.s * b.k, hx = px + Math.cos(a) * hd, hy = py + Math.sin(a) * hd, gr = o.createRadialGradient(hx, hy, 0, hx, hy, 46); gr.addColorStop(0, `rgba(255,255,255,${.85 * glint})`); gr.addColorStop(.25, `rgba(255,250,240,${.26 * glint})`); gr.addColorStop(1, 'rgba(255,250,240,0)'); o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.fillStyle = gr; o.fillRect(hx - 46, hy - 46, 92, 92); o.restore(); } };
  }

  // ================================================================ R2e: the procession on the stone wall
  // a robed man walking side-on, facing right (side 1) or turned square to us (side 0); Jesus' head stays a plain round cloth at every angle
  function walker(g, b, x, y, s, o = {}) { const { h = 1.74, br = 1, jesus = false, side = 1, bow = 0, headK = side } = o, sh = h - .36, hc = h - .15; atf(g, b, x, y, s, 0, 1, 1.04);
    if (jesus) { const w = lerp(1, .68, side) * br; blob(g, [[-.235 * w, -.5], [-.215 * w, sh * .4], [-.2 * w, sh * .68], [-.25 * w, sh * .9], [-.27 * w, sh * .98], [-.16 * w, sh + .04], [-.07, sh + .08], [.07, sh + .08], [.16 * w, sh + .04], [.27 * w, sh * .98], [.25 * w, sh * .9], [.2 * w, sh * .68], [.215 * w, sh * .4], [.235 * w, -.5]]); } else robe(g, sh, lerp(1, .6, side) * br);
    limb(g, .01 * side, sh + .02, .074, .03 * headK, hc - .07 - bow * .5, .058);
    if (jesus) head(g, .04 * headK, hc - bow, .126, 0, { jesus: true, cl: .7 }); else head(g, .026, hc, .116, .92, { beard: true }); return { sh, hc }; }
  const PROC = [{ o: -790, s: 430, h: 1.72, br: .98, spear: 1 }, { o: -520, s: 445, h: 1.74, br: 1, torch: 1 }, { o: -228, s: 440, h: 1.76, br: 1.04, grip: -1 }, { o: 0, s: 425, h: 1.68, br: .9, jesus: true }, { o: 292, s: 452, h: 1.76, br: 1.04, grip: 1 }, { o: 560, s: 445, h: 1.74, br: 1, torch: 1 }, { o: 830, s: 436, h: 1.7, br: .98, spear: 1 }];
  function r2e(t, T) { const u = clamp((t - T.wall) / (T.N146 + .8 - T.wall)), cam = [lerp(516, 590, u), 944, 1.03], base = lerp(330, 760, u), f = fl(t, 2), Y = m => 1290 + 3 * Math.sin((t + m.o * .0031) * 3.4), J = PROC[3], Jx = base + J.o, Jy = Y(J);
    maskBegin(); for (const m of PROC) { const X = base + m.o, y = Y(m); walker(mg, MB, X, y, m.s, { h: m.h, br: m.br, jesus: m.jesus, bow: m.jesus ? .05 : 0 }); atf(mg, MB, X, y, m.s, 0, 1, 1.04);
      if (m.spear) { mg.fillRect(.33, -.3, .024, 2.46); mg.beginPath(); mg.moveTo(.316, 2.14); mg.lineTo(.368, 2.14); mg.lineTo(.342, 2.42); mg.closePath(); mg.fill(); sleeveArm(mg, [.08, 1.32], [.31, 1.12], .3, .28, -1, fist, .1); }
      if (m.torch) { sleeveArm(mg, [.08, 1.32], [.31, 1.16], .3, .28, -1, fist, .3); mg.save(); mg.translate(.36, 1.1); mg.rotate(-.12); mg.fillRect(-.013, -.2, .026, .92); mg.restore(); }
      if (m.grip) { const sx = m.grip * .1 * J.s + Jx, sy = Jy - 1.22 * J.s * 1.04, Wg = [(sx - X) / m.s - m.grip * .05, (y - sy) / (m.s * 1.04)], S = [-m.grip * .07, 1.32]; sleeveArm(mg, S, Wg, .3, .28, m.grip > 0 ? 1 : -1, fist, m.grip > 0 ? Math.PI - .12 : .12); }
      if (m.jesus) { const W = [.3, .95], q = ik([.05, 1.32], W, .3, .26, -1); limb(mg, .05, 1.32, .074, q.E[0], q.E[1], .052); limb(mg, q.E[0], q.E[1], .05, q.W[0], q.W[1], .034); inHand(mg, q.W, .08, fist); mg.fillRect(q.W[0] - .018, q.W[1] - .05, .036, .1); limb(mg, q.W[0] + .01, q.W[1] - .04, .009, q.W[0] + .05, q.W[1] - .2, .006); } }
    mg.setTransform(MB.k, 0, 0, MB.k, MB.ox, MB.oy); mg.beginPath(); mg.moveTo(-MARG, 912); for (let x = -MARG; x <= VW + MARG; x += 50) mg.lineTo(x, 908 + 5 * Math.sin(x * .017) + 3 * Math.sin(x * .049)); mg.lineTo(VW + MARG, 1450); mg.lineTo(-MARG, 1450); mg.closePath(); mg.fill();   // the low wall in front: below the waist everything is its one shadow
    const fls = [[base - 420, 1094], [base + 262, 1096]].map(([x, y], i) => ({ x, y, f: .9 + .1 * Math.sin(t * 2.7 + i * 2) }));
    return { kind: 2, cam, t, flames: fls.map((q, i) => [q.x, q.y - 26, 58, 104, 3.4 + i, q.f, 0]), L: [{ x: base, y: 1110, z: 420, I: 6.2 * f, r: 520, c: [1, .62, .3] }, { x: fls[0].x, y: fls[0].y, z: 90, I: .8 * fls[0].f, r: 200, c: [1, .5, .15] }, { x: fls[1].x, y: fls[1].y, z: 90, I: .8 * fls[1].f, r: 200, c: [1, .5, .15] }], amb: .006, haze: .07, soft: .45, softD: 1.9, gain: 1.05, vig: .66,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-200, 1200); for (let x = -200; x <= 1400; x += 60) g.lineTo(x, 1188 + 9 * Math.sin(x * .021) + 5 * Math.sin(x * .07)); g.lineTo(1400, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill(); g.lineWidth = 7; g.lineCap = 'round'; g.strokeStyle = '#050505'; for (const q of fls) { g.beginPath(); g.moveTo(q.x, q.y - 10); g.lineTo(q.x - 20, 1240); g.stroke(); } }, { blur: 2 }); for (const q of fls) halo(o, cam, q.x, q.y - 26, 200, '255,136,50', .32 * q.f); } };
  }

  // ================================================================ R3: the courtyard fire and the shadows around it
  const FIRE3 = [470, 1166], MEN3 = [{ x: 8, s: 420, h: 1.1, br: .98, t0: .5 }, { x: 244, s: 486, h: 1.2, br: 1.04, t0: .4 },
 { x: 902, s: 470, h: 1.16, br: 1.02, t0: -.45 }, { x: 1060, s: 430, h: 1.12, br: .96, t0: -.55 }], PX3 = 650;
  function poseR3(t, T) { const g1 = ss(T.two, T.two + 1.05, t), g2 = ss(T.three, T.three + 1.05, t), pt = ss(T.point[0], T.point[1], t) * (1 - ss(T.two - .75, T.two + .35, t)), aw = ss(T.away[0], T.away[1], t), en = ss(T.enter[0], T.enter[1], t) * (1 - ss(T.two - .35, T.two + 1.15, t)),
 St = [0, 0], Wt = [lerp(.16, .534, pt), lerp(-.36, .094, pt)], q = ik(St, Wt, .36, .32, -1); return { pt, aw, en, g1, g2, St, W: q.W, E: q.E }; }
  function r3(t, T) { const u = clamp((t - T.N146) / (T.N149 - T.N146)), zz = lerp(1.0, 1.11, u), cam = [lerp(536, 552, u), FIRE3[1] - 206 / zz, zz],
 f = fl(t, .4), Q = poseR3(t, T), { aw, en, g1, g2 } = Q;
    maskBegin(); const fan = x => (x - FIRE3[0]) / 1000 * .24, by = 1252;
    MEN3.forEach((m, i) => { const g = i === 1 ? g1 : i === 2 ? g2 : g2 * .5, side = m.x < PX3 ? 1 : -1, sc = m.s * (1 + g * .26), turn = lerp(m.t0, side * .92, g), lean = fan(m.x) + side * g * .13; man(mg, MB, m.x + side * g * 62, by, sc, { h: m.h, br: m.br, turn, lean, sv: 1.1 }); });
    { const k = sine(aw), turn = lerp(-.86, .9, k), lean = fan(PX3) + k * .17; man(mg, MB, PX3 + k * 44, by, 560, { h: lerp(1.25, 1.19, k), br: lerp(1.26, .9, k), turn, lean, sv: 1.1, hx: k * .075, hy: -.05 * k }); }   // shoulders narrow, head and back swing away together
    if (en > .001) { const wx = lerp(-330, 110, en), wy = by + 26, ws = 430; man(mg, MB, wx, wy, ws, { h: 1.75, br: .76, veil: true, lean: .015, sv: 1.06 }); atf(mg, MB, wx, wy, ws, .015, 1, 1.06); mg.translate(.2, 1.31); mg.scale(1.15, 1); blob(mg, [[-.1, .06], [Q.E[0] * .7, Q.E[1] + .05], [lerp(Q.E[0], Q.W[0], .52), lerp(Q.E[1], Q.W[1], .52) - .02], [lerp(Q.E[0], Q.W[0], .4), Q.E[1] - .3], [.02, -.58], [-.22, -.6]]); sleeveArm(mg, Q.St, Q.W, .36, .32, -1, pointing,
 Math.atan2(Q.W[1] - Q.E[1], Q.W[0] - Q.E[0]) * .6 + .06); }
    mg.setTransform(MB.k, 0, 0, MB.k, MB.ox, MB.oy); { const ny = lerp(884, 772, ss(0, .6, en)); mg.beginPath(); mg.moveTo(170, 1010); mg.lineTo(250, 856); mg.lineTo(380, ny); mg.quadraticCurveTo(476, ny + 44, 600, ny); mg.lineTo(880, 856); mg.lineTo(960, 1010); mg.lineTo(960, 1446); mg.lineTo(170, 1446); mg.closePath(); mg.fill(); }   // below the shoulders the seated men are one shadow (no sliver of wall between them)
    const flames = [[FIRE3[0], FIRE3[1] + 22, 280, 64, 0, .86, 1], [FIRE3[0] - 62, FIRE3[1] + 6, 118, 30, 2.1, .3 * f, 2], [FIRE3[0] - 6, FIRE3[1] + 4, 142, 40, 4.7, .37 * f, 2], [FIRE3[0] + 60, FIRE3[1] + 7, 110, 27, 7.3, .27 * f, 2]];
    return { kind: 0, cam, t, flames, L: [{ x: FIRE3[0], y: FIRE3[1] - 26, z: 230, I: 5.2 * f, r: 520, c: [1, .5, .15] }, { x: FIRE3[0], y: FIRE3[1] + 2, z: 62, I: .55 * f, r: 130, c: [1, .4, .08] }]
, amb: .004, haze: .1, soft: .5, softD: 2.0, gain: 1.05, vig: .68,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-200, 1244); for (let x = -200; x <= 1400; x += 60) g.lineTo(x, 1230 + 7 * Math.sin(x * .024) + 3 * Math.sin(x * .09)); g.lineTo(1400, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill();
          }, { blur: 1.6, rim: { c: 'rgb(255,138,52)', dx: 0, dy: 3.4, a: .5 } });
        embers(o, cam, FIRE3[0], FIRE3[1], .9, t); halo(o, cam, FIRE3[0], FIRE3[1] - 2, 280, '255,122,34', .24 * f); } };
  }

  // ================================================================ R4: the roofline, first grey of dawn
  const ROOF = (() => { const r = rngOf(3301), K = [[-200, 900], [60, 896], [66, 872], [150, 870], [156, 862], [232, 860], [238, 884], [352, 880], [356, 868], [372, 866], [376, 880], [470, 878], [474, 846], [520, 844], [524, 834], [566, 832], [570, 843], [612, 842], [618, 874], [700, 872], [728, 870], [752, 846], [790, 826], [826, 816], [860, 820], [892, 838], [916, 866], [990, 864], [994, 852], [1012, 851], [1016, 864], [1120, 860], [1126, 884], [1400, 880]], out = [];
    K.forEach((q, i) => { out.push(q); const n = K[i + 1]; if (!n || Math.abs(n[0] - q[0]) < 40) return; const m = Math.floor(Math.abs(n[0] - q[0]) / 26); for (let j = 1; j < m; j++) { const k = j / m, x = lerp(q[0], n[0], k), y = lerp(q[1], n[1], k) + (r() - .5) * 3.4; out.push([x, y]); if (r() < .14) { out.push([x + 1, y + 3 + r() * 4], [x + 5 + r() * 5, y + 3 + r() * 4], [x + 11, y]); j++; } } }); return out; })();
  function r4(t, T) { const u = clamp((t - T.N149) / (T.L105 + .7 - T.N149)), cam = [540, lerp(860, 846, u), lerp(1.0, 1.03, u)], d = lerp(.3, .78, sine(u)); maskBegin();
    return { kind: 0, cam, t, sky: { a: [.002, .002, .0024], b: [.008, .008, .009], y: [866, 16 + 8 * u, d] }, L: [], haze: 0, shD: 0, mono: 1, vig: .5,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(ROOF[0][0], ROOF[0][1]); for (const q of ROOF) g.lineTo(q[0], q[1]); g.lineTo(1400, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill(); }, { fill: '#020202', blur: .7 }); } };
  }

  // ================================================================ R5: the look, as an eyeline sequence (Peter · what he sees · Peter)
  // R5a / R5c: Peter very close, in profile facing right. Most of the head is lost in black; a thin rim traces forehead, a straight nose and a beard that follows the jaw.
  const PROFILE = [[-128, -20], [-118, -92], [-62, -142], [20, -152], [78, -132], [104, -104], [114, -84], [111, -70], [120, -54], [127, -32], [131, -15], [122, 2], [131, 22], [143, 46], [150, 60], [143, 67], [129, 68], [124, 74], [129, 84], [125, 94], [131, 106], [130, 128], [118, 152], [96, 172], [64, 180], [30, 168], [2, 148], [-40, 170], [-110, 120], [-130, 50]], PC = 1.46, PX = 300, PY = 640;
  function peterClose(g, b, o) { const { pitch, pf, lift = 0, sink = 0 } = o, fx = q => q > 96 ? 96 + (q - 96) * lerp(.22, 1, pf) : q; g.setTransform(b.k * PC, 0, 0, b.k * PC, b.ox + b.k * PX, b.oy + b.k * (PY - lift));
    blob(g, [[-400, 1600], [-392, 1000], [-380, 620], [-312, 372 - lift * .5], [-214, 280 - lift * .8], [-96, 232 - lift], [-24, 214], [70, 214], [168, 262 - lift], [262, 348 - lift * .8], [326, 500 - lift * .5], [356, 760], [376, 1100], [386, 1600]]);
    g.translate(0, 190 + sink * 34); g.rotate(pitch); g.translate(0, -190);
    limb(g, -18, 204, 80, 6, 118, 78); blob(g, [[-92, -60], [-122, -34], [-128, -8], [-150, 62], [-178, 176], [-186, 250], [-112, 268], [-30, 228], [-30, 60]]); blob(g, [[-116, -48], [-146, -42], [-154, -18], [-132, -6], [-112, -14]]); blob(g, PROFILE.map(([px, py]) => [fx(px), py])); }
  const poseR5a = (t, T) => { const k = ss(T.look.a + .25, T.look.b - .05, t); return { pitch: lerp(.26, -.07, k), pf: lerp(.3, 1, k), lift: 0, sink: 0, drain: 0 }; };
  const poseR5c = (t, T) => { const c = T.look.c, e = T.Q115, j = t < c + 1 ? 0 : t < c + 1.1 ? sine((t - c - 1) / .1) : 1 - sine((t - c - 1.1) / .55), sink = ss(c + 1.25, e - .05, t); return { pitch: lerp(-.07, .4, sink), pf: lerp(1, .9, sink), lift: 15 * j, sink, drain: ss(c + .15, c + 1.55, t) }; };
  function closeShot(t, P, z) { const cam = [540, 900, z], d = P.drain;
    return { kind: 0, cam, t, L: [{ x: 1040, y: 1120, z: 240, I: lerp(.62, .42, d) * fl(t, .4), r: 400, c: [1, .5, .15] }, { x: 90, y: 280, z: 700, I: .05, r: 900, c: [.86, .87, .9] }], amb: .0022, haze: .07, shD: 0, vig: .74, mono: d, hzS: 1.8, hzV: 1.6,
      over(o) { const q = camBase(cam), fxp = q.k * (PX + 125 * PC) + q.ox, fyp = q.k * (PY + 40 * PC) + q.oy, gr = tb.createRadialGradient(fxp, fyp, 30, fxp, fyp, 290 * q.k), R = lerp(255, 128, d) | 0, G = lerp(138, 126, d) | 0, B = lerp(48, 122, d) | 0, A = 1 - d * .9;
        gr.addColorStop(0, `rgba(${R},${G},${B},${A})`); gr.addColorStop(.6, `rgba(${R},${G},${B},${A * .78})`); gr.addColorStop(1, `rgba(${R},${G},${B},0)`);
        mass(o, cam, (g, b) => peterClose(g, b, P), { fill: '#030303', blur: .8, rim: { c: gr, dx: -3, dy: 1.8, a: .95 } }); } }; }
  function r5a(t, T) { const u = clamp((t - T.look.a + .4) / (T.look.b - T.look.a + .4)); return closeShot(t, poseR5a(t, T), lerp(1, 1.035, u)); }
  function r5c(t, T) { const u = clamp((t - T.look.c) / (T.Q115 - T.look.c)); return closeShot(t, poseR5c(t, T), lerp(1.035, 1.075, u)); }

  // R5b: Peter's eyes, through a rough stone arch across the smoky yard. The walkway recedes to the right; the guards walk on into the dark under the arch and their light goes with them.
  const WALK = 1008, GV = 96, pathY = x => WALK - (x - 540) * .07, pathS = x => 158 * clamp(1 - (x - 540) * .00105, .5, 1.15);
  const EDGE = (() => { const r = rngOf(5519), P = []; let x = -260; while (x < 1560) { const w = 46 + r() * 70, top = (r() - .55) * 9; P.push([x + 2, pathY(x) + top], [x + w * .5, pathY(x + w * .5) + top + (r() - .5) * 2.4], [x + w - 3, pathY(x + w) + top + (r() - .5) * 2], [x + w - 1, pathY(x + w) + 4 + r() * 5]); x += w; } return P; })();
  const ARCH = (() => { const r = rngOf(6113), P = [], j = a => a + (r() - .5) * 9; for (let y = 1120; y > 690; y -= 34) P.push([j(58), y]); for (let a = Math.PI; a >= 0; a -= .075) P.push([485 + Math.cos(a) * 428 + (r() - .5) * 8, 690 - Math.sin(a) * 440 + (r() - .5) * 8]); for (let y = 690; y < 1120; y += 34) P.push([j(914), y]); return P; })();
  // one body, two hand-drawn outlines with the same points: square to us (sloping shoulders, weight on one leg, robe in folds, arms bent to wrists bound low in front) and walking side-on
  const BF = [[-.27, -.01], [-.285, .16], [-.262, .36], [-.282, .56], [-.262, .72], [-.268, .86], [-.272, .94], [-.312, 1.02], [-.33, 1.14], [-.315, 1.26], [-.25, 1.35], [-.14, 1.42], [-.066, 1.5], [.062, 1.505], [.125, 1.43], [.235, 1.365], [.305, 1.285], [.33, 1.16], [.318, 1.03], [.285, .95], [.28, .84], [.298, .6], [.272, .38], [.3, .16], [.285, -.01]];
  const BS = [[-.2, -.01], [-.19, .16], [-.215, .36], [-.19, .56], [-.205, .72], [-.2, .87], [-.195, .93], [-.205, 1.01], [-.205, 1.16], [-.195, 1.3], [-.15, 1.385], [-.085, 1.43], [-.045, 1.5], [.07, 1.505], [.11, 1.45], [.15, 1.4], [.18, 1.33], [.2, 1.2], [.31, .99], [.3, .93], [.2, .84], [.215, .6], [.19, .38], [.235, .16], [.22, -.01]];
  function manBody(g, side, sideL) { blob(g, BF.map((f, i) => { const q = BS[i], k = f[1] > 1.02 ? side : f[1] < .82 ? sideL : lerp(sideL, side, (f[1] - .82) / .2); const o = 1 - k, tilt = .04 * o, hip = .022 * (1 - sideL) * Math.sin(Math.PI * clamp(f[1] / .95)), x0 = lerp(f[0], q[0], k), y0 = lerp(f[1], q[1], k), up = Math.max(0, y0 - .85); return [x0 + hip - up * tilt * .6, y0 + (y0 > .85 ? x0 * tilt : 0)]; })); }
  // the head is a plain round tied cloth from every angle: no nose, no brow, no beard at any moment of the turn
  function clothHead(g, cx, cy, inc) { g.save(); g.translate(cx, cy); g.rotate(-inc); g.beginPath(); g.ellipse(0, 0, .118, .132, 0, 0, TAU); g.fill(); blob(g, [[-.085, .112], [0, .135], [.085, .112], [.122, .045], [.134, .012], [.126, -.02], [.132, -.09], [.145, -.17], [.1, -.2], [.05, -.15], [-.05, -.15], [-.09, -.215], [-.15, -.18], [-.134, -.09], [-.126, -.02], [-.136, .012], [-.121, .045]]); g.restore(); }
  function poseR5b(t, T) { const L = T.look, k = clamp((t - L.b) / (L.stop - L.b)), x0 = 540 - GV * (L.stop - L.b) / 2, jx = lerp(x0, 540, 1 - (1 - k) * (1 - k)), side = 1 - ss(L.turn[0], L.turn[0] + 1.25, t), sideL = 1 - ss(L.turn[0] + .25, L.turn[1], t), headK = 1 - ss(L.turn[0] + .65, L.turn[1], t), walk = 1 - ss(L.stop - .2, L.stop + .1, t);
    return { jx, side, sideL, headK, walk, bob: 2 * Math.sin(t * 3.1) * walk, gx: i => 540 - GV * (L.stop - t) + 200 + i * 152, leave: ss(L.stop + .3, L.turn[1] + .2, t), dark: ss(L.turn[1] - .2, L.c - .9, t) }; }
  function r5b(t, T) { const L = T.look, u = clamp((t - L.b) / (L.c - L.b)), Q = poseR5b(t, T), z = lerp(1, 1.62, u), cam = [540, lerp(902, 946, u), z], s = 158, G = [0, 1, 2, 3, 4, 5].map(i => { const x = Q.gx(i), sc = pathS(x); return { i, x, sc, y: pathY(x) + 1.8 * Math.sin(t * 3.1 + i * 1.3) * sc / s, torch: i % 2 === 0, fade: 1 - ss(760, 1040, x) }; }), T2 = G.filter(q => q.torch).map(q => ({ x: q.x + .36 * q.sc, y: q.y - 1.82 * q.sc, sc: q.sc, fade: q.fade })); maskBegin();
    const glow = lerp(1, .78, Q.dark), lights = T2.slice(0, 2).map((q, i) => ({ x: q.x, y: q.y, z: 130, I: q.fade * (1 - Q.leave * .75) * (.92 + .08 * Math.sin(t * 2.4 + i * 2)), r: 150, c: [1, .54, .18] }));
    while (lights.length < 2) lights.push({ x: 0, y: 0, z: 100, I: 0, r: 100 });
    return { kind: 2, cam, t, flames: T2.map((q, i) => [q.x, q.y + 6, 34 * q.sc / s, 60 * q.sc / s, i * 2.3, .95 * q.fade, 0]), L: [...lights, { x: 452, y: WALK - 104, z: 150, I: .56 * glow, r: 150, c: [.8, .82, .86] }, { x: 668, y: WALK - 176, z: 150, I: .38 * glow, r: 125, c: [.8, .82, .86] }], amb: lerp(.0036, .0012, Q.dark), haze: .44, shD: 0, vig: .72, mono: lerp(0, .75, Q.leave), hzS: 2.6, hzV: 2.6,
      over(o) { const walker2 = (g, b, q) => { atf(g, b, q.x, q.y, q.sc, 0, 1, 1.04); manBody(g, 1, 1); head(g, .03, 1.615, .116, .92, { beard: true, cl: .7 }); if (q.torch) { sleeveArm(g, [.08, 1.32], [.31, 1.18], .3, .28, -1, fist, .3); g.save(); g.translate(.36, 1.12); g.rotate(-.04); g.fillRect(-.016, -.2, .032, .86); g.restore(); } else sleeveArm(g, [.08, 1.32], [.14, .88], .3, .28, -1, fist, -1.2); };
        mass(o, cam, (g, b) => { for (const q of G) walker2(g, b, q); }, { blur: .9, rim: { c: 'rgb(255,150,76)', dx: 2, dy: 1.6, a: .5 * (1 - Q.leave * .6) } });
        for (const q of T2) if (q.fade > .02) halo(o, cam, q.x, q.y - 16, 130 * q.sc / s, '255,136,50', .3 * q.fade);
        // the man himself: only a faint edge on one shoulder
        const qb = camBase(cam), Y0 = pathY(Q.jx) + Q.bob, gx = qb.k * (Q.jx + .27 * s) + qb.ox, gy = qb.k * (Y0 - 1.36 * s) + qb.oy, gr = tb.createRadialGradient(gx, gy, 4, gx, gy, 48 * qb.k), open = 1 - Q.side; gr.addColorStop(0, 'rgba(190,190,192,.8)'); gr.addColorStop(1, 'rgba(190,190,192,0)');
        mass(o, cam, (g, b) => { atf(g, b, Q.jx, Y0, s, 0, 1, 1.04); manBody(g, Q.side, Q.sideL); clothHead(g, lerp(.012, .03, Q.headK), 1.625, lerp(.075, .03, Q.headK));
          if (open > .02) { g.save(); g.globalCompositeOperation = 'destination-out'; g.globalAlpha = ss(.2, .8, open); g.globalAlpha *= .62; blob(g, [[-.242, 1.17], [-.254, 1.1], [-.25, 1.05], [-.234, 1.08], [-.232, 1.13]]); blob(g, [[.25, 1.16], [.262, 1.1], [.256, 1.05], [.24, 1.08], [.238, 1.12]]); g.restore(); } }, { fill: '#020202', blur: .6, rim: { c: gr, dx: -1.8, dy: 1.5, a: .55 } });
        if (open > .05) { o.save(); atf(o, qb, Q.jx, Y0, s, 0, 1, 1.04); o.globalCompositeOperation = 'lighter'; o.filter = 'blur(.8px)'; o.filter = 'blur(1.3px)'; o.strokeStyle = `rgba(92,92,96,${.2 * ss(.3, .9, open)})`; o.lineWidth = .018; o.lineCap = 'round'; o.beginPath(); /* wrists bound at the belt, well above the hips (a V at the groin could read as something else) */ o.moveTo(-.27, 1.0); o.quadraticCurveTo(-.15, .95, -.03, 1.0); o.moveTo(.27, 1.01); o.quadraticCurveTo(.15, .96, .035, 1.0); o.moveTo(-.045, 1.025); o.lineTo(.05, .985); o.moveTo(-.045, .985); o.lineTo(.05, 1.025); o.stroke(); o.strokeStyle = `rgba(82,82,86,${.13 * ss(.3, .9, open)})`; o.lineWidth = .012; o.beginPath(); o.moveTo(-.12, .68); o.bezierCurveTo(-.16, .46, -.1, .26, -.15, .03); o.moveTo(.06, .68); o.bezierCurveTo(.02, .44, .09, .22, .04, .03); o.moveTo(.19, .72); o.bezierCurveTo(.22, .48, .16, .26, .2, .04); o.stroke(); o.restore(); }
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); const f = ta.createLinearGradient(0, WALK - 40, 0, WALK + 520); f.addColorStop(0, '#0b0b0b'); f.addColorStop(.25, '#060606'); f.addColorStop(1, '#030303'); g.fillStyle = f; g.beginPath(); g.moveTo(EDGE[0][0], EDGE[0][1]); for (const q of EDGE) g.lineTo(q[0], q[1]); g.lineTo(1600, 2300); g.lineTo(-300, 2300); g.closePath(); g.fill(); }, { rim: { c: 'rgb(150,140,128)', dx: 0, dy: 2.2, a: .3 * lerp(1, .55, Q.dark) } });
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.rect(-400, -400, 1900, 1720); g.moveTo(ARCH[0][0], ARCH[0][1]); for (const q of ARCH) g.lineTo(q[0], q[1]); g.closePath(); g.fill('evenodd'); }, { fill: '#030303', blur: 4.5 }); } };
  }

  // ================================================================ R6: flight, fall, weeping (no colour; a real body on fixed limbs)
  // R6a: planted steps at uneven times and spacing; the swing foot arcs, the standing foot never slides
  const STEPS = [[-1.05, -1.95, 0], [-.42, -1.48, .02], [.25, -1.03, .03], [.78, -.6, .1], [1.55, -.2, .02], [1.95, .12, .03], [2.72, .6, .12], [3.12, .88, .03], [3.92, 1.36, 0]];
  const hermite = (keys, x) => { const n = keys.length; if (x <= keys[0][0]) return keys[0][1]; if (x >= keys[n - 1][0]) return keys[n - 1][1]; let i = 0; while (x > keys[i + 1][0]) i++; const [a, va] = keys[i], [b, vb] = keys[i + 1], h = b - a, u = (x - a) / h, m = (p, q) => (keys[q][1] - keys[p][1]) / (keys[q][0] - keys[p][0]), m0 = i > 0 ? m(i - 1, i + 1) : m(i, i + 1), m1 = i < n - 2 ? m(i, i + 2) : m(i, i + 1), u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * va + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * vb + (u3 - u2) * h * m1; };
  const PELV = STEPS.slice(1).map((q, i) => [q[0], (q[1] + STEPS[i][1]) / 2 + .07]), PDIP = STEPS.map(q => [q[0], q[2]]);
  function footAt(f, x) { const own = STEPS.map((q, i) => ({ ...q, i, t: q[0], x: q[1] })).filter(q => q.i % 2 === f); let j = 0; while (j < own.length - 1 && x >= own[j + 1].t) j++; const p = own[j], n = own[j + 1]; if (!n) return [p.x, .08]; const lift = STEPS[p.i + 1][0] + .06, k = clamp((x - lift) / (n.t - lift)); return [lerp(p.x, n.x, sine(k)), .08 + Math.sin(Math.PI * k) * .11]; }
  function poseR6a(t, T) { const x = t - T.flee, px = hermite(PELV, x), dip = hermite(PDIP, x), lean = .16 + dip * 1.05, H = [px, .94 - dip * .7], u = [Math.sin(lean), Math.cos(lean)], N = [H[0] + u[0] * .55, H[1] + u[1] * .55], legs = [0, 1].map(f => { const A = footAt(f, x), q = ik(H, A, .47, .45, 1); return { A: q.W, K: q.E }; }), St = [N[0] - .05, N[1] - .05], Sf = [N[0] + .05, N[1] - .05], Wt = [hermite(PELV, x - .14) - .44, 1.02], Wf = [N[0] + .36, N[1] - .28 + .04 * Math.sin(x * 2.1)], back = ik(St, Wt, .32, .29, -1), front = ik(Sf, Wf, .32, .29, -1); return { H, N, u, lean, legs, St, Sf, back, front }; }
  const addv = (a, v, k) => [a[0] + v[0] * k, a[1] + v[1] * k];
  function drawStrider(g, Q) { const { H, N, u, legs } = Q, n = [-u[1], u[0]], p = f => addv(H, u, .55 * f);
    for (const L of legs) { limb(g, H[0], H[1], .115, L.K[0], L.K[1], .072); limb(g, L.K[0], L.K[1], .064, L.A[0], L.A[1], .04); blob(g, [[L.A[0] - .05, L.A[1] + .03], [L.A[0] + .05, L.A[1] + .02], [L.A[0] + .17, L.A[1] - .05], [L.A[0] + .16, L.A[1] - .08], [L.A[0] - .06, L.A[1] - .08]]); }
    const hb = Math.min(...legs.map(q => q.K[0])) - .12, hf = Math.max(...legs.map(q => q.K[0])) + .1, belt = p(.18);   // a belted working tunic to mid-calf: the legs stay visible below it
    blob(g, [[hb, .35], addv(H, n, .142), addv(belt, n, .136), addv(p(.6), n, .18), addv(N, n, .17), addv(N, u, .05), addv(N, n, -.12), addv(p(.62), n, -.15), addv(belt, n, -.125), addv(H, n, -.16), [hf, .38], [(hb + hf) / 2, .33]]);
    limb(g, belt[0] - n[0] * .125, belt[1] - n[1] * .125, .012, belt[0] - n[0] * .15 + .01, belt[1] - n[1] * .15 - .14, .007);
    limb(g, N[0], N[1], .07, N[0] + u[0] * .1 + .02, N[1] + u[1] * .1, .056); g.save(); g.translate(N[0] + u[0] * .17 + .035, N[1] + u[1] * .17); g.rotate(-Q.lean * .9); head(g, 0, 0, .116, .92, { beard: true, cl: .62 }); g.restore();
    sleeveArm(g, Q.St, Q.back.W, .32, .29, -1, flatHand, Math.PI + .25); sleeveArm(g, Q.Sf, Q.front.W, .32, .29, -1, fist, -.7); }
  function r6a(t, T) { const u = clamp((t - T.flee) / (T.fall - T.flee)), cam = [lerp(460, 610, u), 960, 1.0], Q = poseR6a(t, T), s = 540, X = 480, Y = 1238; maskBegin(); atf(mg, MB, X, Y, s); drawStrider(mg, Q);
    return { kind: 2, cam, t, L: [{ x: 360, y: 420, z: 980, I: 1.7, r: 1200, c: [.86, .87, .9] }], amb: .004, haze: .04, soft: .55, softD: 1.6, shD: .94, vig: .6, mono: 1,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-200, Y + 6); for (let x = -200; x <= 1400; x += 44) g.lineTo(x, Y + 6 + 2.4 * Math.sin(x * .03)); g.lineTo(1400, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill(); }, { fill: '#030303', blur: 1 }); } };
  }

  // R6b + R6c: one shot. The sobs are events, not a sine: a catch of breath (.4 s), a collapse (.9 s), a pause, each with its own size and spacing.
  const SOBS = [[.55, .8], [2.85, .42], [4.75, 1], [9.75, .26], [10.95, .18], [12.35, .1]], CRY = 7.25;
  const sobAt = x => { let v = 0; for (const [a, k] of SOBS) { const q = x - a; if (q <= 0 || q >= 2.7) continue; v += k * (q < .4 ? sine(q / .4) : q < 1.3 ? 1 - 1.62 * sine((q - .4) / .9) : -.62 * (1 - sine((q - 1.3) / 1.4))); } return v; };
  const PIER = .55, A6 = [-.24, .08];
  function poseR6(t, T) { const x = t - T.fall, w = t - T.weep, K = keys => kf(x, keys), drop = ss(1.0, 2.2, x) * ss(1.0, 2.2, x) * (3 - 2 * ss(1.0, 2.2, x)) * .0 + sine(clamp((x - 1) / 1.2)) * sine(clamp((x - 1) / 1.2)), sob = sobAt(w), cry = w < CRY ? 0 : ss(CRY, CRY + .45, w) * (1 - ss(CRY + .95, CRY + 1.55, w)), fold = kf(w, [[-3, .05], [0, .16], [5, .3], [7, .4], [CRY + 1.1, .42], [CRY + 2, 1]]);
    const H = [lerp(lerp(-.22, -.1, ss(0, .32, x)), -.217, drop), lerp(.92, .264, drop) + Math.max(0, sob) * .018];
    let th = lerp(lerp(.14, .32, ss(0, .32, x)), .5, drop) + (w > 0 ? lerp(0, .72, fold) : 0) - sob * .24 - cry * .62; th = clamp(th, -.08, 1.24);
    const u = [Math.sin(th), Math.cos(th)], n = [-u[1], u[0]], N = [H[0] + u[0] * .55, H[1] + u[1] * .55 + Math.max(0, sob) * .012], ph = th + lerp(.42, .86, fold) + sob * -.2 - cry * 1.38, C = [N[0] + Math.sin(ph) * .165 + .012, N[1] + Math.cos(ph) * .165], legN = ik(H, A6, .46, .44, 1), legF = ik([H[0] + .03, H[1]], [A6[0] + .05, A6[1]], .46, .44, 1);
    const Sn = [N[0] + n[0] * .02 + u[0] * -.06, N[1] + n[1] * .02 + u[1] * -.06], Sf = [Sn[0] + .05, Sn[1] - .01], over = ss(CRY + 1.0, CRY + 2.05, w), hit = ss(-.12, .5, x), slide = ss(1.35, 2.3, x), off = ss(2.25, 3.0, x);
    const wall = [PIER - .05, lerp(1.2, .64, slide)], fromSide = [lerp(.24, wall[0], hit), lerp(1.06, wall[1], hit)], onThigh = [H[0] + .3, H[1] + .03], clutch = [N[0] + u[0] * -.1 + .17, N[1] + u[1] * -.1 + .02], rest = w < 0 ? onThigh : [lerp(onThigh[0], clutch[0], ss(0, .8, w)), lerp(onThigh[1], clutch[1], ss(0, .8, w))], hd = ph - .32, fc = [Math.cos(hd), -Math.sin(hd)], hu = [Math.sin(hd), Math.cos(hd)], top = [C[0] + hu[0] * .06 - fc[0] * .1, C[1] + hu[1] * .06 - fc[1] * .1], top2 = [C[0] + hu[0] * .05 - fc[0] * .03, C[1] + hu[1] * .05 - fc[1] * .03];
    const Wn0 = [lerp(fromSide[0], rest[0], off), lerp(fromSide[1], rest[1], off)], Wn = [lerp(Wn0[0], top[0], over), lerp(Wn0[1], top[1], over)], Wf0 = [lerp(H[0] + u[0] * .32 + .08, rest[0] + .05, ss(1, 2.5, x)), lerp(H[1] + u[1] * .32, rest[1] - .02, ss(1, 2.5, x))], Wf = [lerp(Wf0[0], top2[0], over), lerp(Wf0[1], top2[1], over)], armN = ik(Sn, Wn, .32, .29, -1), armF = ik(Sf, Wf, .32, .29, -1);
    return { x, w, drop, sob, cry, fold, th, u, n, H, N, ph, C, legN, legF, Sn, Sf, armN, armF, hit, slide, off, over }; }
  function drawKneeler(g, Q) { const { H, N, u, n, legN, legF, C, drop } = Q, br = Math.max(0, Q.sob) * .018, p = f => addv(H, u, .55 * f), kn = legN.E, gb = Math.min(H[0] - .23, A6[0] - .16), a = p(.34), c = p(.72), belt = p(.18), hb = Math.min(legN.E[0], legF.E[0]) - .13, hf = Math.max(legN.E[0], legF.E[0]) + .09, dk = ss(.15, .9, drop);
    for (const L of [legF, legN]) { limb(g, H[0], H[1], lerp(.115, .07, dk), L.E[0], L.E[1], .074); limb(g, L.E[0], L.E[1], .064, L.W[0], L.W[1], .042); } blob(g, [[A6[0] - .07, .1], [A6[0] + .06, .11], [A6[0] + .19, .03], [A6[0] + .18, -.005], [A6[0] - .08, -.005]]);
    // standing: a belted tunic to mid-calf. Knelt: it falls from the shoulders in one long line to the ground behind the heels, so there is no hip shape.
    const K0 = [[hb, .35], addv(H, n, .142), addv(belt, n, .136), addv(p(.62), n, .18), addv(N, n, .17), addv(N, u, .05), addv(N, n, -.12), addv(p(.62), n, -.15), addv(belt, n, -.125), addv(H, n, -.16), [kn[0] + .08, kn[1] + .03], [hf, .38], [(hb + hf) / 2, .33]];
    const K1 = [[gb, 0], [lerp(gb, a[0] + n[0] * .17, .58), lerp(0, a[1] + n[1] * .17, .58) + .05], addv(a, n, .165), addv(c, n, .185 + br), addv(N, n, .17), addv(N, u, .05), addv(N, n, -.13), addv(c, n, -.16), addv(a, n, -.14), [lerp(a[0], kn[0], .62) + .015, lerp(a[1], kn[1], .62) + .08], [kn[0] + .07, kn[1] + .035], [kn[0] + .085, lerp(.02, kn[1] - .04, .3)], [(gb + kn[0]) / 2, -.004]];
    blob(g, K0.map((q, i) => [lerp(q[0], K1[i][0], dk), lerp(q[1], K1[i][1], dk)]));
    limb(g, N[0], N[1], .07, lerp(N[0], C[0], .62), lerp(N[1], C[1], .62), .056); g.save(); g.translate(C[0], C[1]); g.rotate(-Q.ph + .32); head(g, 0, 0, .116, .92, { beard: true, cl: .62 }); g.restore();
    const wf = (Q.w < 0 ? Q.hit : 0) * (1 - ss(0, .4, Q.off)), fa = q => Math.atan2(q.W[1] - q.E[1], q.W[0] - q.E[0]) - .25, flat = gg => { gg.translate(0, -.03 * wf); const q = lerp(1, .68, Q.over); gg.scale(q, q); flatHand(gg); }, chest = addv(addv(N, u, -.16), n, -.04);
    const lay = q => { const f = fa(q), d = Math.hypot(q.W[0] - C[0], q.W[1] - C[1]), k = 1 - ss(.2, .36, d), x = lerp(chest[0], C[0], k), y = lerp(chest[1], C[1], k), tg = Math.atan2(y - q.W[1], x - q.W[0]), lim = lerp(1.35, 2.2, Q.over), de = clamp(Math.atan2(Math.sin(tg - f), Math.cos(tg - f)), -lim, lim); return f + de * Q.off; };   // wrist within its range
    const sm = lerp(1, .68, Q.over), small = gg => { gg.scale(sm, sm); flatHand(gg); }; sleeveArm(g, Q.Sf, Q.armF.W, .32, .29, -1, small, lay(Q.armF)); sleeveArm(g, Q.Sn, Q.armN.W, .32, .29, -1, flat, lerp(lay(Q.armN), Math.PI / 2, wf)); }
  // every sob spends a breath: a small burst of vapour from the mouth, smaller at the end (John 18:18, a cold night)
  const PUFFS = [[.95, .8], [3.25, .44], [5.15, 1], [CRY + .4, .86], [10.15, .34], [11.35, .24], [12.75, .15]], PR = Array.from({ length: 7 }, (_, i) => { const r = rngOf(7001 + i * 31); r(); return [r(), r(), r()]; });
  function breath(o, cam, t, T, X, Y, s) { const b = camBase(cam); o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter';
    for (const [a, k] of PUFFS) { const age = t - T.weep - a; if (age <= 0 || age > 2.1) continue; const Q = poseR6(T.weep + a + .3, T), h = Q.ph - .32, fc = [Math.cos(h), -Math.sin(h)], up = [Math.sin(h), Math.cos(h)], mx = Q.C[0] + fc[0] * .125 - up[0] * .06, my = Q.C[1] + fc[1] * .125 - up[1] * .06, e = 1 - Math.pow(1 - age / 2.1, 2.2), al = Math.pow(1 - age / 2.1, 1.6) * ss(0, .34, age) * .062 * Math.sqrt(k);
      for (const [p, q, w] of PR) { const reach = (.07 + .26 * p + .62 * e * (.2 + p)) * Math.sqrt(k), side = (q - .5) * (.04 + .16 * e), rise = .08 * e, ex = mx + Math.max(.5, fc[0]) * reach + up[0] * side, ey = my + Math.min(.15, fc[1]) * reach + up[1] * side + rise, R = (.045 + .13 * e * (.55 + w)) * Math.sqrt(k) * s * b.k, px = b.k * (X + ex * s) + b.ox, py = b.k * (Y - ey * s) + b.oy, g = o.createRadialGradient(px, py, 0, px, py, R); g.addColorStop(0, `rgba(226,228,232,${al})`); g.addColorStop(.55, `rgba(226,228,232,${al * .4})`); g.addColorStop(1, 'rgba(226,228,232,0)'); o.fillStyle = g; o.fillRect(px - R, py - R, R * 2, R * 2); } }
    o.restore(); }
  const X6 = 452, F6 = 1212, S6 = 200;
  // the corner of the alley: quoins of rough stone, shaded by the soft light rather than cut with a line
  const QUOIN = (() => { const r = rngOf(8123), px = X6 + PIER * S6, P = [[px + 3, F6 + 4]]; let y = F6, odd = false; while (y > -260) { const h = 38 + r() * 26, atHand = y > 930 && y < 1140, o = atHand ? (r() - .5) * 4 : y > 900 ? (r() - .5) * 15 : odd ? 12 + r() * 10 : (r() - .5) * 8; P.push([px + o + (r() - .5) * 3, y - 2], [px + o + (r() - .5) * 3, y - h + 2]); y -= h; odd = !odd; } P.push([VW + MARG + 20, y], [VW + MARG + 20, F6 + 4]); return P; })();
  const quoinPath = g => { g.beginPath(); g.moveTo(QUOIN[0][0], QUOIN[0][1]); for (const q of QUOIN) g.lineTo(q[0], q[1]); g.closePath(); };
  function alleyShot(t, T, cam, E) { const Q = poseR6(t, T), lg = sine(clamp((t - T.fall - .5) / (T.end - T.fall - 1))); maskBegin(); mg.setTransform(MB.k, 0, 0, MB.k, MB.ox, MB.oy); quoinPath(mg); mg.fill();
    return { kind: 2, cam, t, det: lerp(.22, .12, E), L: [{ x: 130, y: 480, z: 420, I: lerp(.7, 1.62, lg), r: lerp(240, 800, lg), c: [.84, .86, .9] }, { x: 960, y: 560, z: 760, I: .62, r: 1000, c: [.86, .87, .9] }], amb: .006, haze: .025, shD: .5, soft: 1.7, softD: 0, vig: .6, mono: 1, hzS: 1.4, hzV: 1.2,   // cold light grows slowly from the upper left across the wall and ends on his back
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); quoinPath(g); g.fill(); }, { fill: 'rgba(0,0,0,.08)', blur: 5, rim: { c: 'rgb(150,152,156)', dx: 2, dy: 0, a: .05 + .07 * lg } });
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-300, F6 + 1); for (let x = -300; x <= 1500; x += 22) g.lineTo(x, F6 + 1 + .8 * Math.sin(x * .09) + .5 * Math.sin(x * .23)); g.lineTo(1500, 2400); g.lineTo(-300, 2400); g.closePath(); g.fill(); }, { fill: '#060606' });
        mass(o, cam, (g, b) => { atf(g, b, X6, F6, S6); drawKneeler(g, Q); }, { fill: '#030303', blur: .9, rim: { c: 'rgb(200,204,212)', dx: 3.2, dy: 3.6, a: lerp(.16, .62, lg) } }); breath(o, cam, t, T, X6, F6, S6); } }; }
  // R6b locked in close on the fall (a very slow push); R6c cuts closer on the landing, then one long slow pull back that stops with him about 14% of the frame high
  function r6b(t, T) { const v = clamp((t - T.fall) / (T.weep - T.fall)), z = lerp(2.22, 2.36, v); return alleyShot(t, T, [X6 + 120 / z, F6 - 255 / z, z], 0); }
  function r6c(t, T) { const v = clamp((t - T.weep) / (T.end - T.weep)), E = v * .4 + sine(v) * .6, z = Math.exp(lerp(Math.log(3.75), Math.log(2.15), E)); return alleyShot(t, T, [X6 + (540 - lerp(420, 470, E)) / z, F6 - 255 / z, z], E); }

  // ---------------------------------------------------------------- shots, dissolves, finish
  const SHOT = { r1, r2a, r2b, r2e, r3, r4, r5a, r5b, r5c, r6a, r6b, r6c };
  const plan = T => [['r1', T.start, T.N142, .55], ['r2a', T.N142, T.N143, 0], ['r2b', T.N143, T.wall, .5], ['r2e', T.wall, T.N146, .7], ['r3', T.N146, T.N149, 0], ['r4', T.N149, T.L105, .6], ['r5a', T.L105, T.look.b, 0], ['r5b', T.look.b, T.look.c, 0], ['r5c', T.look.c, T.Q115, 0], ['r6a', T.Q115, T.fall, 0], ['r6b', T.fall, T.weep, 0], ['r6c', T.weep, T.end, 0]];
  const offA = mk(VW, VH), oa = offA.getContext('2d'), offB = mk(VW, VH), ob = offB.getContext('2d');
  const GK = { r1: 1.92, r2a: 3.5, r2b: 1.34, r2e: 1.62, r3: 2.15, r4: 1.6, r5a: 2.2, r5b: 2.4, r5c: 2.2, r6a: 1.75, r6b: 1.9, r6c: 1.9 };   // the shot's exposure (a night, but the light must read on a phone)
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
    const arms = t => { const a = {}; const s = idOf(t); if (s === 'r1') { const q = poseR1(t, T); a.vow = elbowAngle(q.S, q.E, q.W); } if (s === 'r2b') { const q = poseSword(t, T), h = poseHeal(t, T); a.sword = elbowAngle(q.S, q.E, q.W); if (h.r > 0) a.heal = elbowAngle(h.S, h.E, h.W); } if (s === 'r3') { const q = poseR3(t, T); if (q.en > 0) a.point = elbowAngle(q.St, q.E, q.W); } if (s === 'r6a') { const q = poseR6a(t, T); a.flightArmBack = elbowAngle(q.St, q.back.E, q.back.W); a.flightArmFront = elbowAngle(q.Sf, q.front.E, q.front.W); q.legs.forEach((L, i) => { a['flightKnee' + i] = elbowAngle(q.H, L.K, L.A); }); } if (s === 'r6b' || s === 'r6c') { const q = poseR6(t, T); a.fallArmNear = elbowAngle(q.Sn, q.armN.E, q.armN.W); a.fallArmFar = elbowAngle(q.Sf, q.armF.E, q.armF.W); a.fallKnee = elbowAngle(q.H, q.legN.E, q.legN.W); } return { s, a }; };
    const n = Math.round((T.end - T.start) / dt); for (let i = 0; i <= n; i++) { const t = Math.min(T.start + i * dt, T.end - .001), id = idOf(t), c = SHOT[id](t, T).cam, ar = arms(t);
      if (prev && prev.id === id) { const sp = Math.hypot(c[0] - prev.c[0], c[1] - prev.c[1]) * c[2] / dt, zr = Math.abs(Math.log(c[2] / prev.c[2])) / dt; if (i % Math.round(.25 / dt) === 0 || Math.abs((i * dt) % .25) < dt / 2) rows.push([+(t - T.start).toFixed(2), id, +sp.toFixed(1), +zr.toFixed(4), id === 'r3' ? +(EM.length / 3.9).toFixed(1) : 0]); }
      if (prev && prev.ar.s === ar.s) for (const k in ar.a) if (k in prev.ar.a) { const d = Math.abs(ar.a[k] - prev.ar.a[k]); J[k] = Math.max(J[k] || 0, d); if (d > mx.v) mx = { v: d, t: +(t - T.start).toFixed(2), who: k }; }
      prev = { id, c, ar }; }
    return { rows, maxJoint: { rad: +mx.v.toFixed(3), deg: +(mx.v * 180 / Math.PI).toFixed(1), t: mx.t, who: mx.who, per: Object.fromEntries(Object.entries(J).map(([k, v]) => [k, +v.toFixed(3)])) } }; }
  return { draw, measure };
}
