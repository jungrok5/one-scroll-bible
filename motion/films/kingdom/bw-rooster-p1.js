// bw-rooster-p1.js — 「kingdom」 5부 「닭이 울 때」 감독 1안 「뜰 건너 한 시선」 (rounds/r10-pilot/director-plan.md §3), film 541.2 (C13) → 650.0 (C14 with the holds).
// Everything before film 606.2 is version B (bw-rooster-b.js, copied: upper room, garden, procession, courtyard). The only change before 606.2 follows the plan's S1 note
// ("가능하면 N146 591.3부터 같은 회랑이 보이게"): the courtyard shot R3 now has the house above its wall with one stone arch (cloister) in which a procession walks;
// the wall, the fire, the shadows and the camera of R3 are unchanged. From 606.2 on, the director's approach 1 is built shot by shot.
// Look: German Expressionist / film-noir black and white (「노스페라투」, 「칼리가리」, 「제3의 사나이」 wall shadows), one colour kept: fire #ff8a2a — and from 629.6 none at all.
// Film refs (plan §1): Rembrandt 「베드로의 부인」 1660 (He small at the dark edge, the light on the one who is seen → S3c), Caravaggio (light from His side → S3b front light),
// La Tour 「베드로의 눈물」 (one source → S5), El Greco (dawn planted in grief → the stopped light), Dreyer (the longest, quietest shot → S3b/S3d), Bresson (sound, not acting),
// Kurosawa 「란」 (smash to silence at the crow), Kieślowski 「블루」 (memory by J-cut, hard cut out → S3f), Ozu (the same frame, emptied → S4), Lee Chang-dong 「밀양」 (a patch of
// light → S5 end), Nemes 「사울의 아들」 (over the shoulder instead of the comic profile → S3a/S3e), Tarkovsky 「루블료프」 (colour taken away, returned in part 7).
// Skills: cinecode camera-moves (dolly in / rack focus / locked; one move per shot, each with its reason), canvas-film BODY-CHECK and SCENE-RULES (two-bone IK with fixed lengths,
// one bend direction per limb, planted feet and a planted wrist that never slide; S5's body is a 3D skeleton projected through the alley camera), canvas-film LESSONS (no faces close,
// no hands in action, the light on the line's subject), cinematic-3d (the alley is ray-cast per pixel: two receding walls, wet floor, a sky slit; the cloister floor of S3c the same way).
// Shots from 606.2 (film seconds with the holds; all from script `at` through beats()):
//   S1  606.2–608.8 court (R3)   N148  the shadow wall; above it the house and the cloister arch with the procession (planted, not pointed at). Two shadows turn on 「두 번」/「세 번」 (.6 s),
//                                      on 「세 번」 Peter's shadow shakes its head once. Camera: R3's dolly in continues (it began at 591.3; no new move mid-shot).
//   S2  608.8–613.6 roof (R4)    N149  low angle, black roofline at y≈640, a thin dawn line; in the black wall below, the same arch, the procession faint. Dolly in 1.5 %/s toward the arch.
//   S3a 613.6–615.8 OTS          L105  behind Peter's right shoulder: his head and shoulder a dark mass lower left, orange rim on top only; fire bokeh; the arch across the yard.
//                                      His head lifts 24 px (613.8–614.6). Locked; rack focus 614.4–615.6 Peter → arch (Peter blur 0 → 18 px).
//   S3b 615.8–620.2 his eyes     Q114  telephoto through the arch: three men walk; He alone stops (616.4, over two steps), the front guard's pull does not move Him (617.0); He turns,
//                                      shoulders 616.8–618.0, head 617.4–618.8, the head a plain round cloth every frame; square to us at 618.8 with the yard's firelight on His chest;
//                                      the guards lower their torches and go out of both sides (front guard out right ≈619.6). Dolly in 2 %/s on (470, 900), running on through S3c.
//   S3c 620.2–621.8 His eyes     Q114  reverse: the yard from the cloister, 35° down; seven men round the fire, six with heads bowed, Peter alone looking up, a warm patch for a face.
//                                      Dolly in 5 %/s (8 % on Peter).
//   S3d 621.8–625.0 Him again    Q114  the same push as S3b, as if it never stopped; the torches gone, cold edge on the shoulder and the warm chest only; breath and smoke. Q114 out 624.6.
//   S3e 625.0–625.8 OTS close           Peter's head and shoulder fill the left 60 %, soft; the arch tiny; flinch at 625.15 (14 px up in .2 s, down in .6 s). Locked.
//   S3f 625.8–628.6 memory              the upper room (R1) redrawn at film 557.5 → 559.9 (0.85×), feathered, bloom, heavier grain — the last full orange. In by a .35 s dissolve, out by a hard cut.
//   S3g 628.6–630.0 OTS close           as S3e; the colour dies 628.6 → 629.6 (whole frame, ease-in), the fire −30 %, the rim turns grey; his head sinks 70 px (628.8–629.9).
//   S4  630.0–633.0 court, grey  Q115  S1's frame, no colour: Peter's shadow rises (630.2–631.2), takes two heavy steps left and leaves the light (631.2–632.4); the gap stays. Locked.
//   S5  633.0–650.0 alley               a real alley in perspective (ray-cast walls, wet floor, the dawn slit at its end); he staggers in on two steps, hits the wall shoulder first (633.6),
//                                      slides to his knees with his forehead on his left forearm on the wall (–635.4), sobs as events, sinks onto his heels (640.8–642.0).
//                                      A cold wedge of dawn on the upper wall comes down and stops above his head (646.5). Dolly in 17 s, ease-in-out, ×1.75, ending on (480, 820).
//                                      Black from 649.3 to 650.0.
// Holds (page time map only, script.json untouched): Q114 4.7 → 16.0 s (+11.3), Q115 8.6 → 20.0 s (+11.4). Block 108.8 s (B: 104.8 with +7.3/+11.4).
// Text: L105 613.8–624.6 · Q114 618.8–624.6 (in .5 s, out .4 s) · Q115 630.2–637.8, gone over 1.0 s; from 638.8 the band stays empty.
// Colour: sat(t) = 1 to 628.6, 0 at 629.6 (ease-in), 0 to the end — applied to the whole picture; S3f (memory) lies before 628.6 so it keeps the full orange.
// Exports for part 7: FIRE_OTS (S3a/S3e camera, focus, rim) for N166, ALLEY_END (S5's last frame, light edge) for N159.
//
// Sound cue table for the sound stage (film seconds with holds; the memory voice reuses N141's recorded second half as an echo — script.json unchanged):
//   606.2–608.8  charcoal crackle, low murmur of the yard; at the end a voice like Peter's rises, unintelligible, cut by the cut
//   ≈611.5       pc.N149[1] (the comma in 「세 번째 말이 끝나기도 전에,」): yard sound cut in one frame; one distant rooster, stone-yard reverb 2.2 s (Luke: once)
//   611.5–612.5  near silence (wind only), then 「닭이 울었습니다.」
//   613.6–615.8  crackle at −28 dB; three pairs of sandals on stone, panned toward the arch
//   616.4        one pair of sandals stops; the other two take two more steps and stop
//   618.8–624.6  the deepest silence of the film: room tone −45 dB, the torches out of the mix
//   620.9        one coal pops, very small (S3c)
//   624.6        Peter's sharp intake of breath, close (J-cut ahead of S3e)
//   625.4–628.6  memory voice: N141 「오늘 닭이 울기 전에, 네가 세 번 나를 모른다고 할 것이라고」 at −16 dB, 3 kHz low-pass, stone reverb 2.5 s; the lamp's hiss very low (S3f)
//   628.6–630.0  silence; one broken exhale
//   630.2–632.4  his footsteps going away; 632.6 a wooden gate creaks open off screen left
//   633.6        shoulder against stone (dull thud), cloth dragging down the wall
//   635.4–636.2  silence
//   636.2        first sob, an intake (a man's voice, muffled by the sleeve; never a wail) · 637.9 small · 639.4 the largest · 642.8 · 644.6 small · 646.4 small
//   639.4–649.0  cello solo under sob 2, ppp sul tasto: Peter's theme, the first phrase falling chromatically, stopping on the leading note ≈646, unresolved, gone by 649.0
//   649.0–650.0  room tone; 650.0 black 0.7 s → C14
// No big swell here (the film's two are kept for the cross and part 7).
// API: const M = await import('./bw-rooster-p1.js'); const T = M.beats(B); const R = await M.build(W, H); R.draw(ctx, t, T)  (t = FILM seconds; pure in t).

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
export const HOLDS = { Q114: 11.3, Q115: 11.4 };
// for part 7 (N166 / N159): the over-the-shoulder fire frame of S3a/S3e, and S5's last frame with its light edge (lightEdgeH, head, cam filled in by build/measure)
export const FIRE_OTS = { camera: 'locked, 0.6 m behind Peter at his head height, over his right shoulder (S3a); closer for S3e/S3g (Peter ×1.36, head to (285, 795))',
  peterHead: [256, 952], peterHeadR: 125, peterMass: 'x −60–600, y 820–1440 (S3a)', fire: [690, 1215], fireR: 110, fireE: [850, 1190], fireER: 150,
  focus: { rack: 'Q114 + .4 → + 1.6 s, ease-in-out', peterBlur: [0, 18], archBlur: [14, 0] }, rim: { color: '#ff8a2a', widthPx: 3, blurPx: 4, alpha: .7, edge: 'top only (mask minus itself shifted 0, +3 px)' },
  arch: { cx: 680, hw: 120, top: 420, spring: 540, sill: 700 },
  note: 'Part 7 N166: the same lens and axis (Peter → fire → Him); no arch, no guards; He sits across the fire, backlit by the sunrise over the lake (the sun beside His head, never behind it); the orange rim returns on Peter in the same place.' };
export const ALLEY_END = { focal: 1800, eye: 1.4, vanishing: [620, 700], wallX: -1.08, gapScreenPx: 90, lightStop: 'Q115 + 16.5 s', cam: [470, 860, 1.75], lightEdgeH: null, headTopBaseY: null, head: null,
  note: 'S5 last frame (film 650.0). Part 7 N159: the same camera; the light edge comes on down from lightEdgeH (metres on the left wall) onto his head cloth and shoulder, with a first faint gold.' };   // extra seconds on these two lines, applied by the page's local time map (plan §2)

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
  // approach 1 (plan §3): offsets from Q114 for the look, from Q115 for the weeping
  const q = B.Q114, e = B.Q115;
  T.jArch = B.N148 + .6;                                      // the bound man passes the middle of the cloister arch in S1
  T.s2 = B.L105 - .2; T.lift = [B.L105, B.L105 + .8]; T.rack = [q + .4, q + 1.6];
  T.s3b = q + 1.8; T.stop = q + 2.4; T.halt = q + 3.2; T.pull = q + 3.0; T.turnSh = [q + 2.8, q + 4.0]; T.turnHd = [q + 3.4, q + 4.8]; T.guardLook = q + 3.6; T.front = q + 4.8; T.exitR = q + 5.6;
  T.s3c = q + 6.2; T.coal = q + 6.9; T.s3d = q + 7.8; T.s3e = q + 11.0; T.flinch = q + 11.15; T.s3f = q + 11.8; T.memAt = B.N141 + 1.0;
  T.s3g = e - 1.4; T.drain = [e - 1.4, e - .4]; T.sink = [e - 1.2, e - .1];
  T.up4 = [e + .2, e + 1.2]; T.go4 = [e + 1.2, e + 2.4]; T.gate = e + 2.6;
  T.s5 = e + 3.0; T.hit = e + 3.6; T.knelt = e + 5.4; T.deeper = [e + 10.8, e + 12.0]; T.lightStop = e + 16.5; T.slow = e + 17.0;
  // sobs: [time, amplitude px, catch of breath s, collapse s] — events, never a sine
  T.sobs = [[e + 6.2, 18, .35, .9], [e + 7.9, 6, .18, .32], [e + 9.4, 22, .35, 1.1], [e + 12.8, 14, .32, .9], [e + 14.6, 8, .3, .8], [e + 16.4, 5, .3, .7]];
  T.label105 = [B.L105, q + 10.6];
  T.textWin = { Q114: [q + 4.8, q + 10.6, .5, .4], Q115: [e + .2, e + 8.8, .8, 1.0] };
  T.black = [B.C14 - .7, B.C14];
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
  uniform vec3 uSky0, uSky1, uSkyB; uniform vec4 uDoor, uSlit, uPersp; uniform vec2 uPZ; uniform float uDet, uHzS, uHzV;
  const vec2 PO[8] = vec2[8](vec2(-.61,.33), vec2(.2,-.72), vec2(.78,.27), vec2(-.2,.88), vec2(-.87,-.38), vec2(.45,.66), vec2(-.34,-.28), vec2(.28,.06));
  float shade(vec2 uv, float lod){ vec2 tx = 1. / vec2(textureSize(tM, 0)); float s = 0., r = pow(2., lod) * .9; for (int i = 0; i < 8; i++) s += textureLod(tM, uv + PO[i] * r * tx, lod).r; return s / 8.; }
  void main(){ vec2 fc = gl_FragCoord.xy; fc.y = uRes.y - fc.y; vec2 p = (fc - uRes * .5) / uCam.z + uCam.xy;
    // a floor seen from above (S3c): tilt uPersp.x, focal .y, eye height .z (m), .w px per metre on the baked texture; uPZ = (Z at texture y uPZ.y, that y)
    if (uPersp.y > 0.) { float cs = cos(uPersp.x), sn = sin(uPersp.x), yc = p.y - 960., dy = yc * cs + uPersp.y * sn, dz = -yc * sn + uPersp.y * cs, tt = uPersp.z / max(dy, 1.); p = vec2(540. + tt * (p.x - 540.) * uPersp.w, uPZ.y - (tt * dz - uPZ.x) * uPersp.w); }
    vec2 uv = (p + uMarg) / (uWall + 2. * uMarg);
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

// S5's alley, ray-cast per pixel through a pinhole (focal uF, eye height uEye, vanishing point uVP): the left and right walls (baked stone, mirrored), the wet floor
// (it mirrors the slit and the lit wall), the slit of dawn at the alley's end, a strip of sky over the wall tops. One light: the dawn over the right wall, falling on the
// left wall above the shadow line uHb (metres), which comes down with time. No colour.
const ALLEY = `#version 300 es
  precision highp float; in vec2 vUv; out vec4 o; ${NOISE}
  uniform sampler2D tS; uniform vec2 uRes, uVP; uniform vec3 uCam, uLd; uniform float uF, uEye, uWL, uWR, uWH, uZE, uHb, uT, uGain, uVig, uAmb, uIb; uniform vec3 uOcc;
  vec4 tex(vec2 w) { return texture(tS, w * 250. / vec2(1360., 2200.)); }
  vec3 dawn(float y) { return mix(vec3(.66, .68, .71), vec3(.2, .21, .22), smoothstep(.0, 5., y)); }
  const vec2 SLX = vec2(-.32, .26); const float SLH = 5.2;
  void main(){ vec2 fc = gl_FragCoord.xy; fc.y = uRes.y - fc.y; vec2 p = (fc - uRes * .5) / uCam.z + uCam.xy;
    vec3 d = vec3((p.x - uVP.x) / uF, -(p.y - uVP.y) / uF, 1.);
    float tL = d.x < 0. ? -uWL / d.x : 1e9, tR = d.x > 0. ? uWR / d.x : 1e9, tF = d.y < 0. ? uEye / -d.y : 1e9;
    if (uEye + tL * d.y > uWH) tL = 1e9; if (uEye + tR * d.y > uWH) tR = 1e9;
    float tt = min(min(tL, tR), tF); vec3 col = vec3(0.);
    if (tt > uZE) { float y = uEye + uZE * d.y, x = uZE * d.x;
      if (y < 0.) col = vec3(0.);
      else if (y < uWH && x > -uWL && x < uWR) { bool slit = x > SLX.x && x < SLX.y && y < SLH; vec4 s = tex(vec2(x * 1.4 + 9., y)); col = slit ? dawn(y) * 1.25 : s.b * vec3(uAmb) * (1.2 + 2.4 * exp(-pow((x - (SLX.x + SLX.y) * .5) / .7, 2.)));   // the end: a wall with one narrow gap of dawn
      } else col = vec3(.03, .031, .034) * (1. + 1.8 * smoothstep(.0, .25, d.y));   // the strip of sky between the wall tops
    } else {
      vec3 P = vec3(0., uEye, 0.) + d * tt; float endK = exp(-(uZE - P.z) / 5.), slitK = exp(-pow(P.x / 1.1, 2.)) * exp(-(uZE - P.z) / 7.);
      if (tt == tF) { vec4 s = tex(vec2(P.x * 1.5 + 3., P.z * 1.5)); vec2 n = s.rg * 2. - 1.; float al = s.b * .6, wet = smoothstep(.45, .75, fb(P.xz * vec2(2.2, .9) + 3.)), gut = smoothstep(.1, .02, abs(P.x + .05));
        col = al * vec3(uAmb) * (.35 + .2 * smoothstep(.9, .0, abs(P.x))) * (1. + 3. * slitK) * (1. - .45 * gut);
        // wet stone gives back the gap of dawn as a broken streak, and a little of the lit wall
        vec3 r = vec3(d.x, -d.y, 1.); float ye = (uZE - P.z) * r.y, xe = P.x + (uZE - P.z) * r.x; vec3 refl = vec3(0.);
        if (xe > SLX.x && xe < SLX.y && ye < SLH) refl = dawn(ye) * 1.25;
        else if (r.x < 0.) { float zl = P.z + (-uWL - P.x) / r.x, yl = (zl - P.z) * r.y; if (zl < uZE && yl < uWH) refl = vec3(.84, .86, .9) * uIb * .12 * smoothstep(uHb - .05, uHb + .05, yl); }
        col += refl * mix(.015, .2, max(wet, gut * .8)) * (.6 + .4 * (1. - abs(n.x)));
      } else { bool lw = tt == tL; vec4 s = tex(vec2(P.z, P.y) + (lw ? vec2(0.) : vec2(31., 7.))); vec2 n = s.rg * 2. - 1.; vec3 N = normalize(vec3(lw ? 1. : -1., n.y * 1.4, n.x * 1.4)); float al = s.b, sky = .3 + .7 * smoothstep(.0, uWH, P.y);
        float door = (!lw && P.z > 9.2 && P.z < 10.4 && P.y < 2.25) ? .25 : 1.;   // a door recess in the right wall
        col = al * vec3(uAmb) * sky * (1. + 2.6 * endK + 1.5 * slitK) * (lw ? 1. : .55) * door;
        if (lw) { float soft = .03 + .02 * max(0., uWH - P.y); col += al * vec3(.84, .86, .9) * uIb * max(dot(N, uLd), 0.) * smoothstep(uHb - soft, uHb + soft, P.y); }
      }
      if (tt < uZE) { vec3 Q = vec3(0., uEye, 0.) + d * tt; float occ = exp(-pow((Q.z - uOcc.z) / .55, 2.) - pow(max(0., Q.y - uOcc.y) / 1.0, 2.) - pow((Q.x - uOcc.x) / .6, 2.) * (tt == tF ? 1. : 0.)); col *= 1. - .55 * occ * (tt == tR ? 0. : 1.); }
      col += vec3(.6, .62, .66) * .014 * smoothstep(8., uZE, tt);
    }
    vec3 c = 1. - exp(-col * uGain); c = pow(c, vec3(.4545)); vec2 v = (fc / uRes - vec2(.5, .44)) * vec2(1.05, .92); c *= 1. - uVig * smoothstep(.22, .74, length(v)); c = vec3(dot(c, vec3(.3, .59, .11)));
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
  const PB = prog(BAKE), PW = prog(WALL), PF = prog(FLAME), PA = prog(ALLEY);
  const SW = VW + MARG * 2, SH = VH + MARG * 2;
  const surfaces = [0, 1, 2, 2, 2].map((kind, idx) => { const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, SW, SH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx, 0); gl.viewport(0, 0, SW, SH); gl.useProgram(PB.p);
    gl.uniform4f(PB.u('uRect'), 0, 0, 1, 1); gl.uniform1i(PB.u('uKind'), kind); gl.uniform2f(PB.u('uMarg'), MARG, MARG); gl.disable(gl.BLEND); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(fb);
    if (idx >= 3) { gl.bindTexture(gl.TEXTURE_2D, tx); gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); if (idx === 3) { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT); } }
    return tx; });
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
    const sk = sp.sky || { a: [0, 0, 0], b: [0, 0, 0], y: [900, 40, 0] }; gl.uniform3fv(PW.u('uSky0'), sk.a); gl.uniform3fv(PW.u('uSky1'), sk.b); gl.uniform3fv(PW.u('uSkyB'), sk.y); gl.uniform4fv(PW.u('uDoor'), sp.door || [0, 0, 0, 0]); gl.uniform4fv(PW.u('uSlit'), sp.slit || [0, 0, 0, 0]); gl.uniform4fv(PW.u('uPersp'), sp.persp || [0, 0, 0, 0]); gl.uniform2fv(PW.u('uPZ'), sp.pz || [0, 0]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (sp.flames?.length) { gl.useProgram(PF.p); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.uniform1f(PF.u('uT'), sp.t);
      for (const [x, y, w, h, seed, k, mode] of sp.flames) { const sx = (x - c[0]) * c[2] + VW / 2, sy = (y - c[1]) * c[2] + VH / 2, hw = w * c[2] / 2, hh = h * c[2] / 2; gl.uniform4f(PF.u('uRect'), sx / VW * 2 - 1, 1 - (sy - hh) / VH * 2, hw / VW * 2, hh / VH * 2); gl.uniform1f(PF.u('uSeed'), seed); gl.uniform1f(PF.u('uK'), k); gl.uniform1i(PF.u('uMode'), mode || 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      gl.disable(gl.BLEND); } }
  // dark masses over the wall, with an optional rim from the side of the light
  const tA = mk(VW, VH), ta = tA.getContext('2d'), tB = mk(VW, VH), tb = tB.getContext('2d');
  function mass(out, c, fn, { blur = 0, rim = null, alpha = 1, fill = '#040404' } = {}) { ta.setTransform(1, 0, 0, 1, 0, 0); ta.clearRect(0, 0, VW, VH); ta.fillStyle = fill; fn(ta, camBase(c));
    out.save(); out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = alpha; if (blur > .05) out.filter = `blur(${blur.toFixed(2)}px)`; out.drawImage(tA, 0, 0);
    if (rim) { tb.setTransform(1, 0, 0, 1, 0, 0); tb.globalCompositeOperation = 'source-over'; tb.clearRect(0, 0, VW, VH); tb.drawImage(tA, 0, 0); tb.globalCompositeOperation = 'source-in'; tb.fillStyle = rim.c; tb.fillRect(0, 0, VW, VH); tb.globalCompositeOperation = 'destination-out'; tb.drawImage(tA, rim.dx, rim.dy); tb.globalCompositeOperation = 'source-over';
      out.globalCompositeOperation = 'lighter'; out.filter = `blur(${(rim.blur ?? Math.max(1.1, blur * .8)).toFixed(2)}px)`; out.globalAlpha = alpha * rim.a; out.drawImage(tB, 0, 0); }
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
  // a robed man walking side-on, facing right; Jesus' head is a plain round tied cloth with no features
  function walker(g, b, x, y, s, o = {}) { const { h = 1.74, br = 1, jesus = false, bow = 0 } = o, sh = h - .36, hc = h - .15; atf(g, b, x, y, s, 0, 1, 1.04);
    g.save(); g.scale(br, h / 1.72); manBody(g, 1, 1); g.restore(); limb(g, .01, sh + .02, .074, .03, hc - .07 - bow * .5, .058);
    if (jesus) head(g, .04 + bow * .3, hc - bow, .118, 0, { jesus: true, cl: .7 }); else head(g, .026, hc, .116, .92, { beard: true, cl: .7 }); return { sh, hc }; }
  const PROC = [{ o: -600, h: 1.72, br: .98, spear: 1 }, { o: -400, h: 1.74, br: 1, torch: 1 }, { o: -178, h: 1.76, br: 1.02, grip: -1 }, { o: 0, h: 1.75, br: 1.02, jesus: true }, { o: 214, h: 1.76, br: 1.02, grip: 1 }, { o: 430, h: 1.74, br: 1, torch: 1 }, { o: 640, h: 1.7, br: .98, spear: 1 }], WS2 = 330, WB2 = 1150;
  function r2e(t, T) { const u = clamp((t - T.wall) / (T.N146 + .8 - T.wall)), cam = [lerp(516, 590, u), 944, 1.03], base = lerp(330, 760, u), f = fl(t, 2), Y = m => WB2 + 2.4 * Math.sin((t + m.o * .0031) * 3.4), J = PROC[3], Jx = base + J.o, Jy = Y(J);
    maskBegin(); mg.save(); mg.setTransform(MB.k, 0, 0, MB.k, MB.ox, MB.oy); mg.beginPath(); mg.rect(-MARG, -MARG, VW + MARG * 2, WB2 + 1 + MARG); mg.clip();   // the hems end on the ground: whole figures, nothing cut at the hips
    for (const m of PROC) { const X = base + m.o, y = Y(m); walker(mg, MB, X, y, WS2, { h: m.h, br: m.br, jesus: m.jesus, bow: m.jesus ? .05 : 0 }); atf(mg, MB, X, y, WS2, 0, 1, 1.04);
      if (m.spear) { mg.fillRect(.33, -.02, .024, 2.2); mg.beginPath(); mg.moveTo(.316, 2.14); mg.lineTo(.368, 2.14); mg.lineTo(.342, 2.42); mg.closePath(); mg.fill(); sleeveArm(mg, [.08, 1.32], [.31, 1.12], .3, .28, -1, fist, .1); }
      if (m.torch) { sleeveArm(mg, [.08, 1.32], [.31, 1.16], .3, .28, -1, fist, .3); mg.save(); mg.translate(.36, 1.1); mg.rotate(-.12); mg.fillRect(-.013, -.2, .026, .92); mg.restore(); }
      if (m.grip) { const sx = Jx + m.grip * .09 * WS2, sy = Jy - 1.24 * WS2 * 1.04, Wg = [(sx - X) / WS2 - m.grip * .05, (y - sy) / (WS2 * 1.04)], S = [-m.grip * .07, 1.34]; sleeveArm(mg, S, Wg, .3, .28, m.grip > 0 ? 1 : -1, fist, m.grip > 0 ? Math.PI - .2 : .2); } }
    mg.restore();
    const fls = [[base - 420, 1094], [base + 262, 1096]].map(([x, y], i) => ({ x, y, f: .9 + .1 * Math.sin(t * 2.7 + i * 2) }));
    return { kind: 2, cam, t, flames: fls.map((q, i) => [q.x, q.y - 26, 58, 104, 3.4 + i, q.f, 0]), L: [{ x: base, y: 1110, z: 420, I: 6.2 * f, r: 520, c: [1, .62, .3] }, { x: fls[0].x, y: fls[0].y, z: 90, I: .8 * fls[0].f, r: 200, c: [1, .5, .15] }, { x: fls[1].x, y: fls[1].y, z: 90, I: .8 * fls[1].f, r: 200, c: [1, .5, .15] }], amb: .006, haze: .07, soft: .45, softD: 1.9, gain: 1.05, vig: .66,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-200, 1200); for (let x = -200; x <= 1400; x += 60) g.lineTo(x, 1188 + 9 * Math.sin(x * .021) + 5 * Math.sin(x * .07)); g.lineTo(1400, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill(); g.lineWidth = 7; g.lineCap = 'round'; g.strokeStyle = '#050505'; for (const q of fls) { g.beginPath(); g.moveTo(q.x, q.y - 10); g.lineTo(q.x - 20, 1240); g.stroke(); } }, { blur: 2 }); for (const q of fls) halo(o, cam, q.x, q.y - 26, 200, '255,136,50', .32 * q.f); } };
  }

  // ================================================================ R3: the courtyard fire and the shadows around it
  const FIRE3 = [470, 1166], MEN3 = [{ x: 8, s: 420, h: 1.1, br: .98, t0: .5 }, { x: 244, s: 486, h: 1.2, br: 1.04, t0: .4 },
 { x: 902, s: 470, h: 1.16, br: 1.02, t0: -.45 }, { x: 1060, s: 430, h: 1.12, br: .96, t0: -.55 }], PX3 = 650;
  function poseR3(t, T) { const g1 = ss(T.two, T.two + .6, t), g2 = ss(T.three, T.three + .6, t), pt = ss(T.point[0], T.point[1], t) * (1 - ss(T.two - .75, T.two + .35, t)), aw = ss(T.away[0], T.away[1], t), en = ss(T.enter[0], T.enter[1], t) * (1 - ss(T.two - .35, T.two + 1.15, t)),
 St = [0, 0], Wt = [lerp(.16, .534, pt), lerp(-.36, .094, pt)], q = ik(St, Wt, .36, .32, -1); return { pt, aw, en, g1, g2, St, W: q.W, E: q.E }; }
  function r3(t, T, gone = false) { const u = gone ? 1 : clamp((t - T.N146) / (T.N149 - T.N146)), zz = lerp(1.0, 1.11, u), cam = [lerp(536, 552, u), FIRE3[1] - 206 / zz, zz],
 f = fl(t, .4), Q = poseR3(gone ? T.N149 - .001 : t, T), { aw, en, g1, g2 } = Q;
    maskBegin(); const fan = x => (x - FIRE3[0]) / 1000 * .24, by = 1252;
    MEN3.forEach((m, i) => { const g = i === 1 ? g1 : i === 2 ? g2 : g2 * .5, side = m.x < PX3 ? 1 : -1, sc = m.s * (1 + g * .26), turn = lerp(m.t0, side * .92, g), lean = fan(m.x) + side * g * .13; man(mg, MB, m.x + side * g * 62, by, sc, { h: m.h, br: m.br * (1 - .3 * Math.sin(Math.PI * g)), turn, lean, sv: 1.1, hx: side * .04 * g }); });   // the shoulders narrow through the turn and the head turns with them
    if (!gone) { const k = sine(aw), turn = lerp(-.86, .9, k), lean = fan(PX3) + k * .17, sk = clamp((t - T.three) / .56), shake = Math.sin(TAU * sk) * Math.sin(Math.PI * sk);   // on 「세 번」 his shadow shakes its head once (left–right, .56 s)
      man(mg, MB, PX3 + k * 44, by, 560, { h: lerp(1.25, 1.19, k), br: lerp(1.26, .9, k), turn, lean, sv: 1.1, hx: k * .075 + .05 * shake, hy: -.05 * k }); }   // shoulders narrow, head and back swing away together
    else { // S4: his shadow stands up (and, nearer the wall, smaller), turns to the left, two heavy steps, and walks out of the firelight: softer, fainter, gone. The gap stays.
      const r = ss(T.up4[0], T.up4[1], t), tn = ss(T.up4[0], T.up4[0] + .9, t), go = clamp((t - T.go4[0]) / (T.go4[1] - T.go4[0])), x = PX3 + 44 - 150 * sine(go), dip = 9 * Math.abs(Math.sin(Math.PI * 2 * go)), a = 1 - ss(.3, 1, go), bl = 16 * ss(.25, 1, go);
      mg.save(); mg.globalAlpha = a; if (bl > .05) mg.filter = `blur(${bl.toFixed(1)}px)`;
      man(mg, MB, x, by + dip, lerp(560, 410, r), { h: lerp(1.19, 1.72, r), br: lerp(.9, 1.04, tn) * (1 - .28 * Math.sin(Math.PI * tn)), turn: lerp(.9, -.86, tn), lean: fan(x) + lerp(.17, -.05, r) + .05 * Math.sin(Math.PI * r), sv: 1.1, hx: lerp(.075, -.03, tn), hy: -.05 });
      mg.restore(); }
    if (en > .001) { const wx = lerp(-330, 110, en), wy = by + 26, ws = 430; man(mg, MB, wx, wy, ws, { h: 1.75, br: .76, veil: true, lean: .015, sv: 1.06 }); atf(mg, MB, wx, wy, ws, .015, 1, 1.06); mg.translate(.2, 1.31); mg.scale(1.15, 1); blob(mg, [[-.1, .06], [Q.E[0] * .7, Q.E[1] + .05], [lerp(Q.E[0], Q.W[0], .52), lerp(Q.E[1], Q.W[1], .52) - .02], [lerp(Q.E[0], Q.W[0], .4), Q.E[1] - .3], [.02, -.58], [-.22, -.6]]); sleeveArm(mg, Q.St, Q.W, .36, .32, -1, pointing,
 Math.atan2(Q.W[1] - Q.E[1], Q.W[0] - Q.E[0]) * .6 + .06); }
    mg.setTransform(MB.k, 0, 0, MB.k, MB.ox, MB.oy); { const ny = lerp(884, 772, ss(0, .6, en)); mg.beginPath(); mg.moveTo(170, 1010); mg.lineTo(250, 856); mg.lineTo(380, ny); mg.quadraticCurveTo(476, ny + 44, 600, ny); mg.lineTo(880, 856); mg.lineTo(960, 1010); mg.lineTo(960, 1446); mg.lineTo(170, 1446); mg.closePath(); mg.fill(); }   // below the shoulders the seated men are one shadow (no sliver of wall between them)
    const flames = [[FIRE3[0], FIRE3[1] + 22, 280, 64, 0, .86, 1], [FIRE3[0] - 62, FIRE3[1] + 6, 118, 30, 2.1, .3 * f, 2], [FIRE3[0] - 6, FIRE3[1] + 4, 142, 40, 4.7, .37 * f, 2], [FIRE3[0] + 60, FIRE3[1] + 7, 110, 27, 7.3, .27 * f, 2]];
    return { kind: 0, cam, t, flames, L: [{ x: FIRE3[0], y: FIRE3[1] - 26, z: 230, I: 5.2 * f, r: 520, c: [1, .5, .15] }, { x: FIRE3[0], y: FIRE3[1] + 2, z: 62, I: .55 * f, r: 130, c: [1, .4, .08] }]
, amb: .004, haze: .1, soft: .5, softD: 2.0, gain: 1.05, vig: .68,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-200, 1244); for (let x = -200; x <= 1400; x += 60) g.lineTo(x, 1230 + 7 * Math.sin(x * .024) + 3 * Math.sin(x * .09)); g.lineTo(1400, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill();
          }, { blur: 1.6, rim: { c: 'rgb(255,138,52)', dx: 0, dy: 3.4, a: .5 } });
        embers(o, cam, FIRE3[0], FIRE3[1], .9, t); halo(o, cam, FIRE3[0], FIRE3[1] - 2, 280, '255,122,34', .24 * f); house3(o, cam, t, T, gone); } };
  }

  // ================================================================ R4: the roofline, first grey of dawn
  const ROOF = (() => { const r = rngOf(3301), K = [[-200, 900], [60, 896], [66, 872], [150, 870], [156, 862], [232, 860], [238, 884], [352, 880], [356, 868], [372, 866], [376, 880], [470, 878], [474, 846], [520, 844], [524, 834], [566, 832], [570, 843], [612, 842], [618, 874], [700, 872], [728, 870], [752, 846], [790, 826], [826, 816], [860, 820], [892, 838], [916, 866], [990, 864], [994, 852], [1012, 851], [1016, 864], [1120, 860], [1126, 884], [1400, 880]], out = [];
    K.forEach((q, i) => { out.push(q); const n = K[i + 1]; if (!n || Math.abs(n[0] - q[0]) < 40) return; const m = Math.floor(Math.abs(n[0] - q[0]) / 26); for (let j = 1; j < m; j++) { const k = j / m, x = lerp(q[0], n[0], k), y = lerp(q[1], n[1], k) + (r() - .5) * 3.4; out.push([x, y]); if (r() < .14) { out.push([x + 1, y + 3 + r() * 4], [x + 5 + r() * 5, y + 3 + r() * 4], [x + 11, y]); j++; } } }); return out; })();
  // ================================================================ figure parts kept from B (R2e's walker uses them): one robe outline in two views, a plain round cloth head
  const BF = [[-.27, -.01], [-.285, .16], [-.262, .36], [-.282, .56], [-.262, .72], [-.268, .86], [-.272, .94], [-.312, 1.02], [-.33, 1.14], [-.315, 1.26], [-.25, 1.35], [-.14, 1.42], [-.066, 1.5], [.062, 1.505], [.125, 1.43], [.235, 1.365], [.305, 1.285], [.33, 1.16], [.318, 1.03], [.285, .95], [.28, .84], [.298, .6], [.272, .38], [.3, .16], [.285, -.01]];
  const BS = [[-.2, -.01], [-.19, .16], [-.215, .36], [-.19, .56], [-.205, .72], [-.2, .87], [-.195, .93], [-.205, 1.01], [-.205, 1.16], [-.195, 1.3], [-.15, 1.385], [-.085, 1.43], [-.045, 1.5], [.07, 1.505], [.11, 1.45], [.15, 1.4], [.18, 1.33], [.2, 1.2], [.31, .99], [.3, .93], [.2, .84], [.215, .6], [.19, .38], [.235, .16], [.22, -.01]];
  BF.forEach(q => { if (q[1] > .9) q[0] *= lerp(1, .84, clamp((q[1] - .9) / .14)); });   // approach 1: the square-on outline a little narrower above the elbows (sloping shoulders)
  // hem: the bottom of the robe swings a little with the stride (metres at the ground, nothing above the calf)
  function manBody(g, side, sideL, br = 0, hem = 0) { blob(g, BF.map((f, i) => { const q = BS[i], k = f[1] > 1.02 ? side : f[1] < .82 ? sideL : lerp(sideL, side, (f[1] - .82) / .2); const o = 1 - k, tilt = .04 * o, hip = .022 * (1 - sideL) * Math.sin(Math.PI * clamp(f[1] / .95)), x0 = lerp(f[0], q[0], k), y0 = lerp(f[1], q[1], k), up = Math.max(0, y0 - .85);
    return [x0 + hip - up * tilt * .6 + (y0 < .34 ? hem * (.34 - y0) / .34 : 0), y0 + (y0 > .85 ? x0 * tilt : 0) + (y0 > 1.2 ? br * ss(1.2, 1.38, y0) : 0)]; })); }
  function clothHead(g, cx, cy, inc) { g.save(); g.translate(cx, cy); g.rotate(-inc); g.beginPath(); g.ellipse(0, 0, .118, .132, 0, 0, TAU); g.fill(); blob(g, [[-.085, .112], [0, .135], [.085, .112], [.122, .045], [.134, .012], [.128, -.02], [.14, -.09], [.17, -.17], [.2, -.235], [.08, -.25], [0, -.2], [-.08, -.25], [-.2, -.235], [-.17, -.17], [-.14, -.09], [-.128, -.02], [-.136, .012], [-.121, .045]]); g.restore(); }
  const hermite = (keys, x) => { const n = keys.length; if (x <= keys[0][0]) return keys[0][1]; if (x >= keys[n - 1][0]) return keys[n - 1][1]; let i = 0; while (x > keys[i + 1][0]) i++; const [a, va] = keys[i], [b, vb] = keys[i + 1], h = b - a, u = (x - a) / h, m = (p, q) => (keys[q][1] - keys[p][1]) / (keys[q][0] - keys[p][0]), m0 = i > 0 ? m(i - 1, i + 1) : 0, m1 = i < n - 2 ? m(i, i + 2) : 0, u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * va + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * vb + (u3 - u2) * h * m1; };
  const pushCam = (tx, ty, z) => [tx - (tx - 540) / z, ty - (ty - 960) / z, z];   // a dolly in that keeps (tx, ty) where it is in the frame
  const pathOf = (g, P) => { g.moveTo(P[0][0], P[0][1]); for (const q of P) g.lineTo(q[0], q[1]); g.closePath(); };
  // a rough round-headed stone opening: piers from the sill, a half circle stretched to (top, spring)
  function archPts(cx, hw, top, spring, sill, seed) { const r = rngOf(seed), P = [], j = a => a + (r() - .5) * hw * .035;
    for (let y = sill; y > spring; y -= hw * .16) P.push([j(cx - hw), y]);
    for (let a = Math.PI; a >= -1e-6; a -= .09) P.push([cx + Math.cos(a) * hw + (r() - .5) * hw * .03, spring - Math.sin(a) * (spring - top) + (r() - .5) * hw * .03]);
    for (let y = spring; y < sill; y += hw * .16) P.push([j(cx + hw), y]); P.push([cx + hw, sill]); return P; }
  // a second scratch layer (mass() owns tA/tB)
  const lay = mk(VW, VH), lgc = lay.getContext('2d');
  function layer(out, fn, { blur = 0, alpha = 1, comp = 'source-over' } = {}) { lgc.setTransform(1, 0, 0, 1, 0, 0); lgc.globalAlpha = 1; lgc.globalCompositeOperation = 'source-over'; lgc.filter = 'none'; lgc.clearRect(0, 0, VW, VH); fn(lgc);
    out.save(); out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = alpha; out.globalCompositeOperation = comp; if (blur > .05) out.filter = `blur(${blur.toFixed(2)}px)`; out.drawImage(lay, 0, 0); out.restore(); }
  // the file of men led along the cloister: guards with torches, the bound man in the middle (index 4); all the same height and dress
  const FILE = [{ torch: 1 }, {}, { torch: 1 }, {}, { jesus: 1 }, {}, { torch: 1 }, {}, { torch: 1 }];
  function smallWalker(g, b, f, s) { atf(g, b, f.x, f.y, s, 0, 1, 1.04); manBody(g, 1, 1, 0, .02 * Math.sin(f.ph)); if (f.jesus) clothHead(g, .03, 1.62, .07); else head(g, .03, 1.615, .116, .92, { beard: true, cl: .7 });
    if (f.torch) { sleeveArm(g, [.08, 1.32], [.31, 1.18], .3, .28, -1, fist, .3); g.save(); g.translate(.36, 1.12); g.rotate(-.04); g.fillRect(-.016, -.2, .032, .86); g.restore(); } else sleeveArm(g, [.08, 1.32], [.14, .88], .3, .28, -1, fist, -1.2); }
  // inside an arch: the cold grey of the walkway, the carried torches, the men in black
  function archInterior(o, cam, P, A) { const q = camBase(cam), L = A.lum;
    o.save(); o.setTransform(q.k, 0, 0, q.k, q.ox, q.oy); o.beginPath(); pathOf(o, P); o.clip();
    const gr = o.createLinearGradient(0, A.top, 0, A.sill); gr.addColorStop(0, `rgb(${22 * L | 0},${23 * L | 0},${24 * L | 0})`); gr.addColorStop(.6, `rgb(${54 * L | 0},${55 * L | 0},${57 * L | 0})`); gr.addColorStop(1, `rgb(${40 * L | 0},${41 * L | 0},${43 * L | 0})`);
    o.fillStyle = gr; o.fillRect(A.cx - 1200, A.top - 100, 2400, A.sill - A.top + 200);
    for (const f of A.figs) if (f.torch) { const tx = f.x + .36 * A.s, ty = f.y - 1.95 * A.s * 1.04, R = 1.3 * A.s, g2 = o.createRadialGradient(tx, ty, 0, tx, ty, R); g2.addColorStop(0, `rgba(255,140,50,${.42 * A.tk})`); g2.addColorStop(.35, `rgba(255,120,40,${.14 * A.tk})`); g2.addColorStop(1, 'rgba(255,120,40,0)'); o.globalCompositeOperation = 'lighter'; o.fillStyle = g2; o.fillRect(tx - R, ty - R, R * 2, R * 2); o.globalCompositeOperation = 'source-over'; }
    o.fillStyle = '#040404'; for (const f of A.figs) smallWalker(o, q, f, A.s);
    o.setTransform(q.k, 0, 0, q.k, q.ox, q.oy); o.globalCompositeOperation = 'lighter';
    for (const f of A.figs) if (f.torch) { const tx = f.x + .36 * A.s, ty = f.y - 1.93 * A.s * 1.04, w = .07 * A.s, h = .17 * A.s; o.fillStyle = `rgba(255,150,60,${.9 * A.tk})`; o.beginPath(); o.ellipse(tx, ty - h * .3, w, h, 0, 0, TAU); o.fill(); o.fillStyle = `rgba(255,220,160,${.7 * A.tk})`; o.beginPath(); o.ellipse(tx, ty - h * .1, w * .45, h * .5, 0, 0, TAU); o.fill(); }
    o.restore(); }
  const fileAt = (t, x0, v, t0, gap, y0, k = 1) => FILE.map((m, i) => ({ ...m, x: x0 + v * (t - t0) + (4 - i) * gap, y: y0 + 1.1 * k * Math.sin(t * 3.1 + i * 1.7), ph: t * 3.1 + i * 1.7 }));

  // ================================================================ S1 / S4: the house above the courtyard wall (added to R3)
  const WALLTOP = 420, ARCH3 = archPts(720, 118, 196, 300, 404, 7717);
  const COPING = (() => { const r = rngOf(4411), P = []; let x = -340; while (x < 1440) { const y = WALLTOP + (r() - .5) * 5 - (r() < .18 ? 5 : 0); P.push([x, y], [x + 34 + r() * 30, y]); x += 38 + r() * 34; } return P; })();
  function house3(o, cam, t, T, gone) {
    archInterior(o, cam, ARCH3, { cx: 720, top: 196, sill: 404, lum: gone ? .5 : 1, s: 66, tk: 1, figs: gone ? [] : fileAt(t, 720, 30, T.jArch, 64, 398) });
    mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-500, -600); g.lineTo(1600, -600); g.lineTo(1600, COPING[COPING.length - 1][1]); for (let i = COPING.length - 1; i >= 0; i--) g.lineTo(COPING[i][0], COPING[i][1]); g.lineTo(-500, COPING[0][1]); g.closePath(); pathOf(g, ARCH3); g.fill('evenodd'); },
      { fill: '#050505', blur: 1.1, rim: { c: 'rgb(150,112,80)', dx: 0, dy: -2.2, a: .3 } }); }

  // ================================================================ S2: the roofline, the dawn line, the same arch in the house wall (R4 rebuilt)
  const ARCH4 = archPts(660, 100, 900, 990, 1120, 9931), ROOFDY = -220;
  function r4(t, T) { const u = clamp((t - T.N149) / (T.s2 + .5 - T.N149)), z = Math.exp(.015 * Math.max(0, t - T.N149)), cam = pushCam(660, 1010, z); maskBegin();
    return { kind: 0, cam, t, sky: { a: [.006, .006, .0066], b: [.085, .085, .09], y: [628, 9 + 5 * u, lerp(.34, .62, sine(u))] }, L: [], haze: 0, shD: 0, mono: 1, vig: .5,
      over(o) { archInterior(o, cam, ARCH4, { cx: 660, top: 900, sill: 1120, lum: .55, s: 61, tk: .8, figs: fileAt(t, 660, 26, T.N149 + 2.6, 58, 1116) });
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(ROOF[0][0], ROOF[0][1] + ROOFDY); for (const q of ROOF) g.lineTo(q[0], q[1] + ROOFDY); g.lineTo(1400, 2400); g.lineTo(-200, 2400); g.closePath(); pathOf(g, ARCH4); g.fill('evenodd'); }, { fill: '#020202', blur: .7 }); } };
  }

  // ================================================================ S3a / S3e / S3g: over Peter's right shoulder (FIRE_OTS)
  // the back of his head cloth (round over the crown, the knot of the band, the end falling to the shoulder) and his right shoulder — one dark mass, base-frame px
  function peterBack(g, P) { const { lift = 0, rot = 0, sway = 0, sh = 0, sink = 0 } = P, hy = -lift + sink;
    g.save(); g.translate(250, 1200); g.rotate(rot); g.translate(-250, -1200);
    blob(g, [[-260, 1760], [-250, 1290 - sh], [-120, 1186 - sh], [20, 1130 - sh], [140, 1104 - sh], [262, 1098 - sh], [380, 1112 - sh], [478, 1156 - sh], [548, 1236 - sh], [590, 1340 - sh * .5], [612, 1760]]);
    // the head cloth from behind: a dome over the crown, tied with a band, the cloth falling over the nape and widening onto the shoulders (no neck shows)
    blob(g, [[112, 1150 - sh], [136, 1066 + hy * .6], [150, 994 + hy], [148, 930 + hy], [168, 872 + hy], [210, 834 + hy], [258, 822 + hy], [308, 832 + hy], [350, 868 + hy], [370, 926 + hy], [370, 992 + hy], [386, 1062 + hy * .6], [414, 1148 - sh]]);
    // the knot of the band and its two short ends, at the back on the right
    g.beginPath(); g.ellipse(352, 950 + hy, 27, 20, .5, 0, TAU); g.fill();
    blob(g, [[348, 950 + hy], [376 + sway * .6, 982 + hy], [388 + sway, 1040 + hy * .8], [370 + sway, 1048 + hy * .8], [350, 994 + hy]]);
    g.restore(); }
  const BOK = Array.from({ length: 8 }, (_, i) => { const r = rngOf(733 + i * 11); r(); return [(r() - .5) * 1.5, (r() - .5) * 1.0, .32 + r() * .3, r() * 6.28, .7 + r() * .5]; });
  // an out-of-focus charcoal fire: soft discs, a glow, the sparks as small bokeh (brightness flickers below 1.2 Hz; nothing moves fast)
  function bokehFire(o, x, y, R, k, t, blur) { o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; if (blur > .05) o.filter = `blur(${blur.toFixed(1)}px)`;
    const g0 = o.createRadialGradient(x, y, 0, x, y, R * 2.8); g0.addColorStop(0, `rgba(255,120,34,${.3 * k})`); g0.addColorStop(.4, `rgba(255,110,30,${.1 * k})`); g0.addColorStop(1, 'rgba(255,100,30,0)'); o.fillStyle = g0; o.fillRect(x - R * 3, y - R * 3, R * 6, R * 6);
    for (const [dx, dy, r, ph, w] of BOK) { const cx = x + dx * R, cy = y + dy * R * .42, rr = r * R, a = (.34 + .1 * Math.sin(t * 1.1 * w + ph)) * k, g = o.createRadialGradient(cx, cy, rr * .7, cx, cy, rr); g.addColorStop(0, `rgba(255,${130 + 30 * w | 0},44,${a})`); g.addColorStop(1, 'rgba(255,130,44,0)'); o.fillStyle = g; o.beginPath(); o.arc(cx, cy, rr, 0, TAU); o.fill(); }
    for (const [a, b, d, e] of EM) { const life = 3.2 + e * 1.4, ph = (t / life + a) % 1, ex = x + (b - .5) * R * 1.4 + Math.sin(ph * 5 + a * 9) * R * .2 * ph, ey = y - R * .2 - ph * R * (2.2 + 2.6 * d), al = Math.sin(ph * Math.PI) * (.25 + .4 * e) * k, rr = 3 + 4 * d; if (al <= .01) continue; o.fillStyle = `rgba(255,${130 + 30 * e | 0},50,${al})`; o.beginPath(); o.arc(ex, ey, rr, 0, TAU); o.fill(); }
    o.restore(); }
  const ARCHO = archPts(680, 120, 420, 540, 700, 3313);
  const OTS_A = { head: [256, 952], k: 1, at: [0, 0] }, OTS_E = { k: 1.36, at: [285 - 256 * 1.36, 795 - 952 * 1.36] };
  const poseOTS = (t, T, which) => { if (which === 'a') { const l = ss(T.lift[0], T.lift[1], t); return { lift: 24 * l, rot: -.05 * l, sway: 10 * Math.sin(Math.PI * clamp((t - T.lift[0]) / 1.4)) * (1 - .4 * l), sh: 4 * l, sink: 0 }; }
    const f = T.flinch, j = t < f ? 0 : t < f + .2 ? sine((t - f) / .2) : 1 - sine(clamp((t - f - .2) / .6)), sk = ss(T.sink[0], T.sink[1], t); return { lift: 0, rot: .03 * sk, sway: 4 * sk, sh: 14 * j - 8 * sk, sink: 70 * sk, jolt: j }; };
  function ots(t, T, which) { const A = which === 'a', P = poseOTS(t, T, which), pf = A ? ss(T.rack[0], T.rack[1], t) : 0, drain = ss(T.drain[0], T.drain[1], t), f = fl(t, .4) * (1 - .3 * drain), cam = [540, 960, 1];
    const pBlur = A ? 18 * pf : 5, bgBlur = A ? 14 * (1 - pf) : 9, fBlur = A ? lerp(9, 6, pf) : 7, bg = A ? [540, 960, 1] : [(540 - (760 - 680 * .42)) / .42, (960 - (480 - 560 * .42)) / .42, .42];
    const walk = fileAt(t, 640, 40, T.s3b - 1.2, 60, 698, 1).slice(2, 7);   // rear guard, …, the bound man, … (150 px tall)
    return { kind: 2, cam, t, L: [{ x: 690, y: 1500, z: 520, I: .38 * f, r: 640, c: [1, .52, .17] }, { x: 680, y: 610, z: 170, I: .12, r: 240, c: [.8, .82, .86] }], amb: .0024, haze: .05, shD: 0, vig: .7, bgBlur,
      over(o) { layer(o, g => { archInterior(g, bg, ARCHO, { cx: 680, top: 420, sill: 700, lum: .8, s: 83, tk: 1, figs: walk }); }, { blur: bgBlur });
        layer(o, g => { const q = camBase(bg); g.setTransform(q.k, 0, 0, q.k, q.ox, q.oy); g.fillStyle = '#060606'; g.beginPath(); pathOf(g, ARCHO); g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,.6)'; g.stroke(); }, { blur: bgBlur + 1 });
        // the yard floor and a man across the fire, both far out of focus
        layer(o, g => { const gr = g.createLinearGradient(0, 1020, 0, 1500); gr.addColorStop(0, 'rgba(8,7,6,0)'); gr.addColorStop(.25, 'rgba(8,7,6,.92)'); gr.addColorStop(1, 'rgba(5,5,5,1)'); g.fillStyle = gr; g.fillRect(0, 1000, VW, 920);
          g.fillStyle = '#070605'; blob(g, A ? [[880, 1500], [890, 1190], [930, 1110], [990, 1080], [1060, 1096], [1120, 1150], [1140, 1500]] : [[960, 1500], [966, 1240], [1000, 1170], [1060, 1150], [1120, 1180], [1140, 1500]]); }, { blur: fBlur + 4 });
        const fx = A ? 690 : 850, fy = A ? 1215 : 1190, fr = A ? 110 : 150;
        bokehFire(o, fx, fy, fr, f, t, fBlur);
        const tr = A ? OTS_A : OTS_E, rk = 1 - drain, rimC = `rgb(${lerp(255, 168, drain) | 0},${lerp(138, 166, drain) | 0},${lerp(42, 160, drain) | 0})`;
        mass(o, [ (540 - tr.at[0]) / tr.k, (960 - tr.at[1]) / tr.k, tr.k ], (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); peterBack(g, P); }, { fill: '#050403', blur: pBlur, rim: { c: rimC, dx: 0, dy: 3 / tr.k, a: lerp(.7, .5, drain) * (A ? 1 : .9), blur: Math.max(1.6, pBlur * .8 + 1.2) } });
        if (!A) { const q = 1 - .5 * drain; halo(o, [540, 960, 1], fx - 60, fy - 40, 320, '255,122,34', .08 * f * q); } } };
  }

  // ================================================================ S3b / S3d: through the arch, Him — and the guards
  const ARCHL = archPts(540, 400, 300, 700, 1150, 6113), LS = 209, FLOOR = 1146;
  // body x over time (base px) — He walks, slows over two steps, stands; the front guard takes one more step, pulls, lets go and walks off right; the rear guard steps up, turns, walks off left
  const easeGo = (tau, v, k) => tau <= 0 ? 0 : v * (tau - k * (1 - Math.exp(-tau / k)));
  const jxAt = (t, T) => { const v = 150, d = .8, tau = t - T.stop; return tau < 0 ? 410 + v * tau : tau < d ? 410 + v * (tau - tau * tau / (2 * d)) : 410 + v * d / 2; };
  const fxAt = (t, T) => jxAt(Math.min(t, T.stop), T) + 118 + 26 * sine(clamp((t - T.stop) / .6)) + easeGo(t - (T.front - .6), 255, .35);   // one short step more: his arm comes straight (the pull)
  const rxAt = (t, T) => { const base = jxAt(Math.min(t, T.stop), T) - 196, tau = clamp(t - T.stop, 0, .8); return base + 150 * (tau - tau * tau / 1.6) - easeGo(t - (T.front + .35), 255, .35); };
  // footsteps [time of landing, x] alternate feet; a foot lifts .3 s before it lands
  function stepsFor(times, xb, ahead, extra = []) { return [...times.map(tt => [tt, xb(tt) + ahead]), ...extra]; }
  function footAt(St, f, t, sw = .3) { const own = St.filter((_, i) => i % 2 === f); let j = -1; for (let i = 0; i < own.length; i++) if (own[i][0] <= t) j = i; const p = own[Math.max(0, j)], n = own[j + 1];
    if (j < 0) return [own[0][1], 0]; if (!n || t < n[0] - sw) return [p[1], 0]; const k = clamp((t - (n[0] - sw)) / sw); return [lerp(p[1], n[1], sine(k)), Math.sin(Math.PI * k) * .05]; }
  function lookSteps(T) { if (lookSteps.c && lookSteps.T === T) return lookSteps.c; const J = t => jxAt(t, T), F = t => fxAt(t, T), R = t => rxAt(t, T);
    const jt = [-1.5, -1, -.5, 0].map(d => T.stop + d), c = {
      J: stepsFor(jt, J, 20, [[T.stop + .45, 470 + 28], [T.stop + .8, 470 - 30]]),
      F: stepsFor([-1.3, -.8, -.3, .2].map(d => T.stop + d), F, 20, [[T.stop + .65, F(T.stop + .9) - 26], ...[0, .4, .8, 1.2, 1.6, 2.0].map(d => [T.front - .25 + d, F(T.front - .25 + d) + 26])]),
      R: stepsFor([-1.2, -.7, -.2, .3].map(d => T.stop + d), R, 20, [[T.stop + .75, R(T.stop + .9) + 26], ...[0, .4, .8, 1.2, 1.6].map(d => [T.front + .65 + d, R(T.front + .65 + d) - 26])]) };
    lookSteps.T = T; lookSteps.c = c; return c; }
  // one walker in the walkway: robe (side ↔ square), feet that stay where they land, a head; dir = +1 facing right, −1 facing left
  function feet(g, b, St, t, xb, y, s, side, dir) { for (const f of [0, 1]) { const [fx, lift] = footAt(St, f, t), lx = (fx - xb) / s, ly = lift; const L = lerp(.13, .24, side);
      g.save(); atf(g, b, xb, y, s, 0, 1, 1.04); limb(g, clamp(lx, -.1, .12) * .5, .34, .05, lx + dir * L * .02, ly + .07, .04); g.translate(lx, ly); g.scale(dir, 1); blob(g, [[-L * .38, 0], [L * .62, 0], [L * .6, .045], [L * .1, .085], [-L * .38, .07]]); g.restore(); } }
  function poseLook(t, T) { const side = 1 - ss(T.turnSh[0], T.turnSh[1], t), sideL = 1 - ss(T.turnSh[0] + .25, T.turnHd[1] - .3, t), headK = 1 - ss(T.turnHd[0], T.turnHd[1], t), walk = 1 - ss(T.stop - .1, T.halt, t), still = 1 - side;
    const breathe = .006 * still * Math.sin((t - T.front) * TAU / 4), front = ss(T.front, T.front + .6, t) * still;
    const torchK = kf(t, [[T.front, 1], [T.front + 2, .6], [T.s3d, .12], [T.s3e, .07]]);
    const fLook = ss(T.guardLook, T.guardLook + .45, t) * (1 - ss(T.guardLook + .75, T.guardLook + 1.15, t)), grip = 1 - ss(T.guardLook + .2, T.guardLook + .55, t), fLow = ss(T.front - .2, T.front + .6, t);
    const rTurn = ss(T.front, T.front + .6, t), rLow = ss(T.front + .1, T.front + .7, t);
    return { side, sideL, headK, walk, still, breathe, front, torchK, fLook, grip, fLow, rTurn, rLow, jx: jxAt(t, T), fx: fxAt(t, T), rx: rxAt(t, T) }; }
  function lookShot(t, T) { const Q = poseLook(t, T), St = lookSteps(T), z = Math.exp(.02 * Math.max(0, t - T.s3b)), cam = pushCam(470, 900, z), s = LS, Y = FLOOR;
    const ft = Q.fx + .36 * s * lerp(1, .62, Q.fLow) + .14 * s * Q.fLow, fty = Y - lerp(1.7, 1.42, Q.fLow) * s * 1.04, rdir = Q.rTurn < .5 ? 1 : -1, rt = Q.rx + .36 * s * rdir * lerp(1, .62, Q.rLow) + .14 * s * Q.rLow * rdir, rty = Y - lerp(1.7, 1.42, Q.rLow) * s * 1.04;
    const fIn = 1 - ss(980, 1060, Q.fx), rIn = 1 - ss(-60, 100, -Q.rx + 160);
    const flames = [[221, 622, 40, 66, 1.7, .95 * Q.torchK + .08, 0]]; if (fIn > .02) flames.push([ft, fty + 6, 30, 56, 2.3, .9 * fIn, 0]); if (rIn > .02) flames.push([rt, rty + 6, 30, 56, 4.1, .9 * rIn, 0]);
    const glow = 1 - .2 * ss(T.turnSh[0] + .6, T.turnSh[0] + 1.1, t) * (1 - ss(T.turnHd[0] + .6, T.turnHd[1], t));   // darkest at the most side-on moment of the turn, as a torch passes between them
    return { kind: 2, cam, t, flames, L: [{ x: 220, y: 640, z: 110, I: 1.5 * Q.torchK * fl(t, 3), r: 300, c: [1, .56, .2] }, { x: ft, y: fty, z: 120, I: .55 * fIn, r: 170, c: [1, .54, .18] }, { x: rt, y: rty, z: 120, I: .55 * rIn, r: 170, c: [1, .54, .18] }, { x: 820, y: 360, z: 1250, I: .27 * glow * lerp(1, .8, ss(T.front, T.s3d, t)), r: 1500, c: [.8, .82, .86] }],
      amb: .003, haze: .3, shD: 0, vig: .7, hzS: 2.2, hzV: 2.2, det: .1,
      over(o) { const q = camBase(cam);
        // the wall torch's bracket
        o.save(); o.setTransform(q.k, 0, 0, q.k, q.ox, q.oy); o.fillStyle = '#050505'; o.translate(220, 616); o.rotate(-.3); o.beginPath(); o.moveTo(-7, -2); o.lineTo(7, -2); o.lineTo(4, 74); o.lineTo(-4, 74); o.closePath(); o.fill(); o.restore();
        // guards: side-on, torches in the outer hand; the front guard's rear hand on His upper arm until he lets go
        mass(o, cam, (g, b) => {
          { const x = Q.fx, w = Q.walk + ss(T.front - .6, T.front - .2, t), ph = (x / (.36 * s)) * Math.PI, y = Y + 1.4 * Math.abs(Math.sin(ph)) * Math.min(1, w + (1 - ss(T.stop, T.stop + .9, t))) - 1.4;
            atf(g, b, x, y, s, -.03 * Math.sin(Math.PI * clamp((t - T.pull) / .6)), 1, 1.04); manBody(g, 1, 1, 0, .018 * Math.sin(ph)); head(g, .03, 1.615, .116, lerp(.92, -.92, Q.fLook), { beard: true, cl: .7 });
            sleeveArm(g, [.08, 1.32], [lerp(.31, .3, Q.fLow), lerp(1.18, .9, Q.fLow)], .3, .28, -1, fist, lerp(.3, -.4, Q.fLow)); g.save(); g.translate(lerp(.36, .33, Q.fLow), lerp(1.12, .84, Q.fLow)); g.rotate(lerp(-.04, .3, Q.fLow)); g.fillRect(-.017, -.12, .034, .64); g.beginPath(); g.ellipse(0, .5, .034, .06, 0, 0, TAU); g.fill(); g.restore();
            const ax = (Q.jx + lerp(.27, .05, Q.side) * s - x) / s, ay = (y - (Y - 1.26 * s * 1.04)) / (s * 1.04), rest = [-.06, .86], W = [lerp(rest[0], ax, Q.grip), lerp(rest[1], ay, Q.grip)]; sleeveArm(g, [-.07, 1.34], W, .3, .28, 1, fist, Math.PI - .3);
            feet(g, b, St.F, t, x, y, s, 1, 1); }
          { const turn = Q.rTurn, dir = turn < .5 ? 1 : -1, sd = Math.abs(1 - 2 * turn), x = Q.rx, ph = (x / (.36 * s)) * Math.PI, y = Y - 1.4 + 1.4 * Math.abs(Math.sin(ph)) * (1 - ss(T.stop, T.stop + .9, t) + ss(T.front + .4, T.front + .8, t));
            atf(g, b, x, y, s, 0, dir, 1.04); manBody(g, sd, sd, 0, .018 * Math.sin(ph)); head(g, .03 * sd, 1.615, .116, .92 * sd, { beard: true, cl: .7 });
            sleeveArm(g, [.08 * sd, 1.32], [lerp(.31, .3, Q.rLow) * sd + .05 * (1 - sd), lerp(1.18, .9, Q.rLow)], .3, .28, -1, fist, lerp(.3, -.4, Q.rLow)); g.save(); g.translate(lerp(.36, .33, Q.rLow) * sd + .06 * (1 - sd), lerp(1.12, .84, Q.rLow)); g.rotate(lerp(-.04, .3, Q.rLow)); g.fillRect(-.017, -.12, .034, .64); g.beginPath(); g.ellipse(0, .5, .034, .06, 0, 0, TAU); g.fill(); g.restore();
            g.setTransform(1, 0, 0, 1, 0, 0); feet(g, b, St.R, t, x, y, s, sd, dir); } }, { blur: 1, fill: '#050505', rim: { c: 'rgb(255,150,76)', dx: 2, dy: 1.6, a: .4 } });
        // Him: robe falling closed, no hands showing; a cold edge on one shoulder (none on the head), the yard's firelight on the chest once He is square to us (head 0, below the waist 0)
        drawHim(o, cam, Q, t, St);
        // the walkway's front edge, and the black wall below it
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.moveTo(-400, FLOOR + 2); for (let x = -400; x <= 1500; x += 40) g.lineTo(x, FLOOR + 2 + 2 * Math.sin(x * .05) + 1.4 * Math.sin(x * .17)); g.lineTo(1500, 2400); g.lineTo(-400, 2400); g.closePath(); g.fill(); }, { fill: '#060606', rim: { c: 'rgb(150,146,140)', dx: 0, dy: 2.2, a: .28 * Q.torchK + .1 } });
        // the arch, near and soft
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.rect(-600, -600, 2300, 3200); pathOf(g, ARCHL); g.fill('evenodd'); }, { fill: '#030303', blur: 4.5 }); } };
  }
  function drawHim(o, cam, Q, t, St) { const s = LS, Y = FLOOR, x = Q.jx, bobv = Q.walk * 1.6 * Math.abs(Math.sin(x / (.36 * s) * Math.PI)), y = Y - bobv, lean = .022 * Q.still, b = camBase(cam);
    const draw = g => { atf(g, b, x, y, s, lean, 1, 1.04); manBody(g, Q.side, Q.sideL, Q.breathe, .018 * Q.walk * Math.sin(x / (.36 * s) * Math.PI)); clothHead(g, lerp(.006, .03, Q.headK), 1.625 + Q.breathe - .02 * (1 - Q.headK), lerp(.012, .065, Q.headK)); g.setTransform(1, 0, 0, 1, 0, 0); feet(g, b, St.J, t, x, y, s, Q.sideL, 1); };
    ta.setTransform(1, 0, 0, 1, 0, 0); ta.clearRect(0, 0, VW, VH); ta.fillStyle = '#060606'; draw(ta);
    const neckY = b.k * (y - 1.47 * s * 1.04) + b.oy, waistY = b.k * (y - 1.0 * s * 1.04) + b.oy, shY = b.k * (y - 1.36 * s * 1.04) + b.oy, sx = b.k * (x + .26 * s) + b.ox;
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.filter = 'blur(.6px)'; o.drawImage(tA, 0, 0); o.restore();
    // cold edge: the shape minus itself shifted down-left, kept to one shoulder, cut off above the neck
    tb.setTransform(1, 0, 0, 1, 0, 0); tb.globalCompositeOperation = 'source-over'; tb.clearRect(0, 0, VW, VH); tb.drawImage(tA, 0, 0); tb.globalCompositeOperation = 'source-in';
    const gr = tb.createRadialGradient(sx, shY + 6, 4, sx, shY + 6, 42 * b.k); gr.addColorStop(0, 'rgba(154,160,166,1)'); gr.addColorStop(1, 'rgba(154,160,166,0)'); tb.fillStyle = gr; tb.fillRect(0, 0, VW, VH);
    tb.globalCompositeOperation = 'destination-out'; tb.drawImage(tA, -1.8, 1.6); tb.fillStyle = '#000'; tb.fillRect(0, 0, VW, neckY + 4); tb.globalCompositeOperation = 'source-over';
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.filter = 'blur(1.1px)'; o.globalAlpha = .5; o.drawImage(tB, 0, 0); o.restore();
    // the firelight of the yard (Peter's side) on the front of the robe: shoulders, chest, the tops of the sleeves only
    if (Q.front > .002) { tb.globalCompositeOperation = 'source-over'; tb.clearRect(0, 0, VW, VH); tb.drawImage(tA, 0, 0); tb.globalCompositeOperation = 'source-in';
      const cx2 = b.k * x + b.ox, cy2 = b.k * (y - 1.25 * s * 1.04) + b.oy, g2 = tb.createRadialGradient(cx2, cy2, 0, cx2, cy2, .34 * s * b.k); g2.addColorStop(0, 'rgba(255,138,42,1)'); g2.addColorStop(.6, 'rgba(255,138,42,.55)'); g2.addColorStop(1, 'rgba(255,138,42,0)'); tb.fillStyle = g2; tb.fillRect(0, 0, VW, VH);
      tb.globalCompositeOperation = 'destination-out'; tb.fillStyle = '#000'; tb.fillRect(0, 0, VW, neckY + 2); tb.fillRect(0, waistY, VW, VH); tb.globalCompositeOperation = 'source-over';
      o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.filter = 'blur(4px)'; o.globalAlpha = .13 * Q.front; o.drawImage(tB, 0, 0); o.restore(); } }

  // ================================================================ S3c: what He sees — the yard from the cloister, 35° down (reverse shot)
  const RV = { th: 35 * Math.PI / 180, f: 2600, h: 5, S: 160, Z0: 5, Y0: 1500 };
  const projR = (X, Yw, Z) => { const c = Math.cos(RV.th), sn = Math.sin(RV.th), zc = -(Yw - RV.h) * sn + Z * c, yu = (Yw - RV.h) * c + Z * sn; return [540 + RV.f * X / zc, 960 - RV.f * yu / zc, RV.f / zc]; };
  const FIRE_R = [0, 5.99];
  const RING = Array.from({ length: 7 }, (_, i) => { const a = [0, 50, -50, 100, -100, 150, -150][i] * Math.PI / 180, r = 1.3 + [0, .06, -.04, .03, .08, -.02, .05][i]; return { peter: i === 0, X: FIRE_R[0] + Math.sin(a) * r, Z: FIRE_R[1] + Math.cos(a) * r, bow: [0, .9, 1, .85, .95, 1, .9][i], sz: [1, 1.02, .97, 1.04, .98, 1.03, 1][i] }; });
  // a seated man seen from above: the hull of his cloak (footprint, knees toward the fire, shoulders) and a round head — bowed toward the fire, or (Peter) lifted
  function seated(g, m, breath, b) { const dx = FIRE_R[0] - m.X, dz = FIRE_R[1] - m.Z, d = Math.hypot(dx, dz), fx = dx / d, fz = dz / d, base = projR(m.X, .05, m.Z), top = projR(m.X, 1.1, m.Z), sc = base[2] * m.sz,
      sv = (base[1] - top[1]) / (1.05 * base[2]), toF = (projR(m.X + fx * .3, .5, m.Z + fz * .3)[0] - projR(m.X, .5, m.Z)[0]) / (.3 * base[2]), far = fz < 0;
    const lean = m.peter ? -.01 : clamp(toF, -1, 1) * .08, hx = m.peter ? 0 : clamp(toF, -1, 1) * .07 * m.bow, hy = m.peter ? .03 + breath : (far ? -.11 : -.07) * m.bow;
    const r = man(g, b, base[0], base[1], sc, { h: 1.08, br: 1.06, turn: m.peter ? 0 : clamp(toF, -1, 1) * .25, lean, sv: sv * 1.02, hx, hy });
    const hp = [b.k * (base[0] + hx * sc) + b.ox, b.k * (base[1] - (r.hc + hy) * sc * sv * 1.02) + b.oy];
    return { hp, hr: .116 * sc * b.k, sc }; }
  function hull(P) { const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1)); }
  function rev(t, T) { const P0 = projR(0, 1.16, FIRE_R[1] + 1.3), z = Math.exp(.048 * Math.max(0, t - T.s3c)), cam = pushCam(P0[0], P0[1], z), f = fl(t, .4), FP = projR(0, 0, FIRE_R[1]), breath = .006 * Math.sin((t - T.s3c) * TAU / 3.2);
    const fyP = RV.Y0 - (FIRE_R[1] - RV.Z0) * RV.S;
    return { kind: 4, cam, t, persp: [RV.th, RV.f, RV.h, RV.S], pz: [RV.Z0, RV.Y0], flames: [[FP[0], FP[1] + 30, 220, 110, 1.3, .9, 1], [FP[0] - 30, FP[1] + 8, 70, 46, 2.1, .35 * f, 2], [FP[0] + 26, FP[1] + 4, 80, 54, 5.3, .4 * f, 2]],
      L: [{ x: 540, y: fyP, z: 58, I: 3.4 * f, r: 250, c: [1, .5, .15] }, { x: 540, y: fyP, z: 30, I: .5 * f, r: 90, c: [1, .4, .08] }], amb: .006, haze: .04, shD: 0, vig: .66, hzS: 2, hzV: 2,
      over(o) { const order = [...RING].sort((a, b) => b.Z - a.Z);
        for (const m of order) { let info = null; ta.setTransform(1, 0, 0, 1, 0, 0);
          const q = camBase(cam), fd = (() => { const a = projR(m.X, .9, m.Z), b2 = projR(FIRE_R[0], .3, FIRE_R[1]); const vx = b2[0] - a[0], vy = b2[1] - a[1], l = Math.hypot(vx, vy); return [vx / l, vy / l]; })();
          mass(o, cam, (g, b) => { g.fillStyle = m.Z < FIRE_R[1] ? '#060403' : '#0d0805'; info = seated(g, m, m.peter ? breath : 0, b); }, { blur: .9 + 5 * clamp((FIRE_R[1] + 1.3 - m.Z) / 2.6) ** 1.5, rim: { c: 'rgb(255,138,42)', dx: -fd[0] * 3, dy: -fd[1] * 3, a: .8 } });
          if (m.peter && info) { const X = info.hp[0], Y2 = info.hp[1] + info.hr * .18, w = info.hr * .62, h = info.hr * .72, g2 = o.createRadialGradient(X, Y2 + h * .3, 1, X, Y2, h * 1.15);
            g2.addColorStop(0, 'rgba(255,150,64,.78)'); g2.addColorStop(.55, 'rgba(230,112,40,.42)'); g2.addColorStop(1, 'rgba(200,90,30,0)'); o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.fillStyle = g2; o.beginPath(); o.ellipse(X, Y2, w, h, 0, 0, TAU); o.fill(); o.restore(); } }
        embers(o, cam, FP[0], FP[1] - 10, .55, t); halo(o, cam, FP[0], FP[1], 240, '255,122,34', .2 * f);
        // smoke going up toward us, a few slow veils
        o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.filter = 'blur(26px)'; for (let i = 0; i < 3; i++) { const ph = ((t - T.s3c) * .18 + i / 3) % 1, X = camBase(cam).k * (FP[0] + (i - 1) * 60 + 40 * ph) + camBase(cam).ox, Yy = camBase(cam).k * (FP[1] - 80 - ph * 520) + camBase(cam).oy; o.fillStyle = `rgba(120,116,110,${.07 * Math.sin(Math.PI * ph)})`; o.beginPath(); o.ellipse(X, Yy, 90 + 120 * ph, 60 + 70 * ph, 0, 0, TAU); o.fill(); } o.restore();
        // the cloister's stone edge across the top: near, out of focus — we stand where He stands
        mass(o, [540, 960, 1], (g, b) => { g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.moveTo(-100, -100); g.lineTo(1200, -100); g.lineTo(1200, 150); for (let x = 1200; x >= -100; x -= 50) g.lineTo(x, 150 + 10 * Math.sin(x * .013) + 6 * Math.sin(x * .041)); g.closePath(); g.fill(); }, { fill: '#070707', blur: 14, rim: { c: 'rgb(150,150,150)', dx: 0, dy: -4, a: .16 } }); } };
  }

  // ================================================================ S3f: the memory — the upper room, retimed
  function mem(t, T) { const tm = T.memAt + (t - T.s3f) * .85, sp = r1(tm, T); sp.vig = .78; sp.grainA = .24; sp.memK = 1; return sp; }

  // ================================================================ S5: the alley (ray-cast, see ALLEY) and Peter on fixed limbs, seen from behind
  const AF = 1800, AH = 1.4, AWL = 1.08, AWR = 1.08, AWH = 7.4, AZE = 26, AVP = [620, 700];
  const projA = P => [AVP[0] + AF * P[0] / P[2], AVP[1] + AF * (AH - P[1]) / P[2], AF / P[2]];
  const V = { add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k], len: a => Math.hypot(a[0], a[1], a[2]), lerp: (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)] };
  V.nrm = a => V.mul(a, 1 / (V.len(a) || 1)); V.cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; V.dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const H3 = (keys, x) => [0, 1, 2].map(i => hermite(keys.map(([k, v]) => [k, v[i]]), x));
  // two-bone IK in 3D: the elbow/knee goes toward the pole
  function ik3(S, W, l1, l2, pole) { let d = V.sub(W, S), L = V.len(d); const mx = (l1 + l2) * .999; if (L > mx) { d = V.mul(d, mx / L); L = mx; } const u = V.nrm(d), a = (l1 * l1 - l2 * l2 + L * L) / (2 * L), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const pp = V.sub(pole, V.mul(u, V.dot(pole, u))), pn = V.nrm(V.len(pp) < 1e-5 ? [0, 1, 0] : pp); return { E: V.add(V.add(S, V.mul(u, a)), V.mul(pn, h)), W: V.add(S, d) }; }
  const ang3 = (A, B, C) => { const a = V.nrm(V.sub(A, B)), c = V.nrm(V.sub(C, B)); return Math.acos(clamp(V.dot(a, c), -1, 1)); };
  const TOE_L = [[-.40, 0, 5.2], [-.452, 0, 5.79]], TOE_R = [[-.26, 0, 5.45], [-.38, 0, 5.98]], WALLW = [-1.03, 1.06, 6.14];
  function sobOf(x, T) { let up = 0, down = 0; for (const [a, amp, ci, co] of T.sobs) { const q = x - a; if (q <= 0 || q > ci + co + 1.6) continue; const m = amp / 300;
      if (q < ci) up += m * sine(q / ci); else if (q < ci + co) { const k = sine((q - ci) / co); up += m * (1 - k); down += m * .9 * k; } else { const k = sine((q - ci - co) / 1.6); down += m * .9 * (1 - k); } } return { up, down }; }
  function poseAlley(t, T) { const x = t - T.s5, dp = ss(T.deeper[0], T.deeper[1], t), sb = sobOf(t, T), bk = t > T.slow ? lerp(3, 2, clamp((t - T.slow) / 3)) / 300 * Math.sin((t - T.slow) * TAU / 2.4) : 0;
    const psi = hermite([[0, .12], [.3, .22], [.6, .35], [1.5, .9], [2.4, 1.2], [3, 1.2]], x), f = [-Math.sin(psi), 0, Math.cos(psi)], left = [-Math.cos(psi), 0, -Math.sin(psi)], up = [0, 1, 0];
    let P = H3([[0, [-.36, .85, 5.2]], [.3, [-.48, .84, 5.45]], [.6, [-.68, .84, 5.72]], [.8, [-.68, .82, 5.76]], [1.5, [-.76, .66, 5.92]], [2.4, [-.8, .53, 6.05]], [3, [-.8, .53, 6.05]]], x);
    P = V.lerp(P, [-.52, .38, 5.95], dp);
    let D = V.nrm(H3([[0, [-.1, .95, .3]], [.3, [-.2, .94, .26]], [.6, [-.38, .92, .1]], [.8, [-.3, .94, .14]], [1.5, [-.18, .97, .12]], [2.4, [-.06, .99, .1]], [3, [-.06, .99, .1]]], x));
    D = V.nrm(V.add(V.lerp(D, V.nrm([-.6, .78, .1]), dp), V.mul(f, .5 * sb.down)));
    const N = V.add(V.add(P, V.mul(D, .52)), [0, sb.up - sb.down * .3 + bk, 0]);
    const hb = H3([[0, [1, .25, 0]], [.6, [.85, .3, .1]], [2.4, [.55, .8, 0]], [3, [.55, .8, 0]]], x), hb2 = V.lerp(hb, [.35, .9, 0], dp), Bd = V.nrm(V.add(V.add(V.mul(D, hb2[0]), V.mul(f, hb2[1] + .25 * sb.down / .06)), V.mul(left, hb2[2])));
    const C = V.add(N, V.mul(Bd, .15));
    const SL = V.add(V.add(N, V.mul(left, .19)), V.mul(D, -.05)), SR = V.add(V.add(N, V.mul(left, -.19)), V.mul(D, -.05));
    // left hand: hangs, then goes up onto the wall and stays there (planted)
    const w = ss(.9, 2.1, x), hang = V.add(SL, [-.02, -.5, .1]), WL = V.lerp(hang, WALLW, w), armL = ik3(SL, WL, .3, .28, V.nrm(V.lerp(V.add(V.mul(f, -1), V.mul(left, .4)), [-.3, -.6, -.7], w)));
    const WR = V.add(V.add(P, V.mul(f, .2)), V.add(V.mul(up, .26), V.mul(left, .02))), armR = ik3(SR, WR, .3, .28, V.nrm(V.add(V.mul(f, -.6), V.add(V.mul(left, -.5), [0, -.3, 0]))));
    // feet: toes planted where they land; from the hit the heels come up and the toes stay (kneeling on curled toes)
    const toe = (TT, t0, t1, tl) => x < t0 ? TT[0] : x < t1 ? (() => { const u = (x - t0) / (t1 - t0), k = sine(u); const p = V.lerp(TT[0], TT[1], k); p[1] = Math.pow(Math.sin(Math.PI * u), 2) * .05; return p; })() : TT[1];
    const tL = toe(TOE_L, -.04, .32), tR = toe(TOE_R, .26, .6), piv = ss(.7, 2.2, x), ffL = V.nrm(V.lerp(V.nrm(V.sub(TOE_L[1], TOE_L[0])), f, piv)), ffR = V.nrm(V.lerp(V.nrm(V.sub(TOE_R[1], TOE_R[0])), f, piv));
    const phi = 1.4 * ss(.9, 2.2, x), ank = (tp, ff, sw) => { const b = .18 * Math.cos(phi) - .08 * Math.sin(phi), u = .18 * Math.sin(phi) + .08 * Math.cos(phi) + sw; return V.add(tp, [-ff[0] * b, u, -ff[2] * b]); };
    const aL = ank(tL, ffL, tL[1]), aR = ank(tR, ffR, tR[1]), HL = V.add(P, V.mul(left, .1)), HR = V.add(P, V.mul(left, -.1));
    const legL = ik3(HL, aL, .46, .43, V.nrm(V.add(ffL, [0, .15, 0]))), legR = ik3(HR, aR, .46, .43, V.nrm(V.add(ffR, [0, .15, 0])));
    const kneel = ss(.7, 2.3, x);
    return { x, f, left, up, P, D, N, C, Bd, SL, SR, WL, armL, WR, armR, tL, tR, aL, aR, ffL, ffR, HL, HR, legL, legR, kneel, phi, dp }; }
  function drawPeterAlley(g, Q) { const p = projA, cap = (A, B, ra, rb) => { const a = p(A), b = p(B); limb(g, a[0], a[1], ra * a[2], b[0], b[1], rb * b[2]); }, ball = (A, r) => { const a = p(A); g.beginPath(); g.arc(a[0], a[1], r * a[2], 0, TAU); g.fill(); };
    const pts = [], add = A => { const a = p(A); pts.push([a[0], a[1]]); }, ring = (c, r, n = 10, ax1 = Q.left, ax2 = Q.f) => { for (let i = 0; i < n; i++) { const a = i / n * TAU; add(V.add(c, V.add(V.mul(ax1, Math.cos(a) * r), V.mul(ax2, Math.sin(a) * r * .8)))); } };
    // the robe: one hull from the shoulders to the hem (a belted tunic to mid-calf standing; knelt, it falls over the thighs to the ground around the knees and heels — no hip shape)
    ring(V.add(Q.N, V.mul(Q.D, -.06)), .24, 12, Q.left, V.mul(Q.f, .55)); ring(V.add(Q.P, V.mul(Q.D, .22)), .19, 10); ring(Q.P, .18, 10);
    const midA = V.mul(V.add(Q.aL, Q.aR), .5), midK = V.mul(V.add(Q.legL.E, Q.legR.E), .5), hemStand = V.add(midA, [0, .3, 0]), hemKneel = V.add(midK, [0, .1, 0]), hem = V.lerp(hemStand, hemKneel, Q.kneel);
    ring(hem, lerp(.18, .17, Q.kneel), 12, V.nrm(V.sub(Q.legR.E, Q.legL.E)), Q.f);
    const fillHull = P => { const Hh = hull(P).filter((q, i, A) => { const n = A[(i + 1) % A.length]; return Math.hypot(n[0] - q[0], n[1] - q[1]) > 2.5; }); g.beginPath(); spline(g, Hh); g.fill(); };   // rounded: a cloth outline, not a polygon
    fillHull(pts);
    // knelt, the tunic lies over the calves to the heels and curled toes: a second shape along the floor, so the outline is an L (it grows from the knees as he goes down)
    { const gk = ss(.4, .85, Q.kneel); if (gk > .001) { pts.length = 0; const kc = midK, L2 = A => add(V.lerp(kc, A, gk)); for (let i = 0; i < 10; i++) { const an = i / 10 * TAU; add(V.add(hem, V.add(V.mul(V.nrm(V.sub(Q.legR.E, Q.legL.E)), Math.cos(an) * .17), V.mul(Q.f, Math.sin(an) * .136)))); }
      for (const A of [V.add(Q.legL.E, [0, .08, 0]), V.add(Q.legR.E, [0, .08, 0]), V.add(Q.legL.E, [0, -.03, 0]), V.add(Q.legR.E, [0, -.03, 0]), V.add(Q.aL, [0, .07, 0]), V.add(Q.aR, [0, .07, 0]), V.add(Q.aL, [0, -.08, 0]), V.add(Q.aR, [0, -.08, 0]), V.add(Q.tL, [0, -.01, 0]), V.add(Q.tR, [0, -.01, 0]), V.add(Q.P, [0, -.12, 0]), V.lerp(midK, V.add(Q.P, V.mul(Q.D, .3)), Q.dp), V.lerp(midK, V.add(Q.P, V.add(V.mul(Q.D, .2), V.mul(Q.f, .12))), Q.dp), V.lerp(midK, V.add(Q.N, V.mul(Q.f, -.15)), Q.dp), V.lerp(midK, V.add(V.lerp(Q.P, Q.N, .5), V.mul(Q.f, -.19)), Q.dp), V.lerp(midK, V.add(Q.P, V.mul(Q.f, -.17)), Q.dp)]) L2(A);
      fillHull(pts); } }
    // legs and feet below the hem
    for (const [leg, a, tp, H] of [[Q.legL, Q.aL, Q.tL, Q.HL], [Q.legR, Q.aR, Q.tR, Q.HR]]) { cap(H, leg.E, .08, .062); cap(leg.E, a, .058, .046); cap(a, tp, .046, .032); }
    // shoulders, arms (the left one up on the wall, the hand beyond the head), the right arm folded in front
    cap(Q.SL, Q.SR, .085, .085); cap(Q.SL, Q.armL.E, .068, .058); cap(Q.armL.E, Q.armL.W, .058, .05); cap(Q.SR, Q.armR.E, .062, .052); cap(Q.armR.E, Q.armR.W, .05, .042);
    // neck, head: round cloth over the crown, the knot of the band at the back, the cloth's end falling to the upper back
    cap(Q.N, Q.C, .075, .07); ball(Q.C, .118); ball(V.add(Q.C, V.add(V.mul(Q.f, -.1), V.mul(Q.Bd, .01))), .04);
    cap(V.add(Q.C, V.mul(Q.f, -.07)), V.add(V.add(Q.N, V.mul(Q.f, -.08)), V.mul(Q.D, -.06)), .07, .06); }
  // the cold wedge of dawn on the upper left wall: its lower edge comes down and stops above his head
  let ALLEY_HB_END = 1.3;
  const hbAt = (t, T) => { const k = clamp((t - T.s5) / (T.lightStop - T.s5)); return lerp(AH + (AVP[1] - 300) * 6 / AF, ALLEY_HB_END, 1 - Math.pow(1 - k, 2.2) * (1 - k * .35)); };
  const MOTES = Array.from({ length: 16 }, (_, i) => { const r = rngOf(2207 + i * 31); r(); return [-.9 + r() * 1.8, 2.0 + r() * 4.5, 4.2 + r() * 7, r() * 6.28, .5 + r() * .5]; });
  const camAlley = (t, T) => { const v = clamp((t - T.s5) / (T.end - T.s5)), E = .22 * v + .78 * sine(v); return [lerp(540, 470, E), lerp(960, 860, E), Math.exp(lerp(0, Math.log(1.75), E))]; };
  function alley(t, T) { ensureEnd(T); const Q = poseAlley(t, T), cam = camAlley(t, T), Hb = hbAt(t, T), fade = ss(T.black[0], T.black[1], t);
    return { alley: true, cam, t, Hb, fade, occ: [Q.P[0] - .05, Q.N[1] - .2, Q.P[2] + .05],
      over(o) { const q = camBase(cam);
        // dust in the beam only, soft by its distance from the focus (his depth)
        o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter';
        for (const [mx, my, mz, ph, b] of MOTES) { const X = mx + .06 * Math.sin(t * .23 + ph), Yy = my + .05 * Math.sin(t * .17 + ph * 2) - .015 * (t - T.s5), Z = mz; const sh = Hb + (X + AWL) * (AWH - .6 - Hb) / (AWL + AWR); if (Yy < sh + .05) continue;
          const pp = projA([X, Yy, Z]), sx = q.k * pp[0] + q.ox, sy = q.k * pp[1] + q.oy, df = Math.abs(1 / Z - 1 / 6) * 60 * q.k + 1.2, al = .12 * b * clamp((Yy - sh) / .3) * (1 - fade);
          const g = o.createRadialGradient(sx, sy, 0, sx, sy, df * 2.2); g.addColorStop(0, `rgba(220,224,230,${al})`); g.addColorStop(1, 'rgba(220,224,230,0)'); o.fillStyle = g; o.fillRect(sx - df * 2.2, sy - df * 2.2, df * 4.4, df * 4.4); } o.restore();
        // Peter: deep shadow, a cold edge behind the shoulders only
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); drawPeterAlley(g, Q); }, { fill: '#0a0a0a', blur: 1.4, rim: { c: 'rgb(90,94,98)', dx: -2.6, dy: 2.4, a: .35 + .25 * clamp((t - T.s5 - 6) / 10) } });
        // the near jamb on the right, black
        mass(o, [540, 960, 1], (g) => { g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.moveTo(1180, -50); g.lineTo(lerp(880, 940, clamp((cam[2] - 1) / .75)), -50); for (let y = -50; y <= 1980; y += 60) g.lineTo(lerp(880, 940, clamp((cam[2] - 1) / .75)) + 5 * Math.sin(y * .03), y); g.lineTo(1180, 1980); g.closePath(); g.fill(); }, { fill: '#040404', blur: 6, rim: { c: 'rgb(120,122,126)', dx: 3, dy: 0, a: .12 } });
        if (fade > 0) { o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.fillStyle = `rgba(0,0,0,${fade})`; o.fillRect(0, 0, VW, VH); o.restore(); } } };
  }
  function alleyFrame(sp) { const c = sp.cam; gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, VW, VH); gl.disable(gl.BLEND); gl.useProgram(PA.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, surfaces[3]); gl.uniform1i(PA.u('tS'), 0); gl.uniform4f(PA.u('uRect'), 0, 0, 1, 1);
    const f1 = (n, v) => gl.uniform1f(PA.u(n), v); gl.uniform2f(PA.u('uRes'), VW, VH); gl.uniform3f(PA.u('uCam'), c[0], c[1], c[2]); gl.uniform2f(PA.u('uVP'), AVP[0], AVP[1]);
    f1('uF', AF); f1('uEye', AH); f1('uWL', AWL); f1('uWR', AWR); f1('uWH', AWH); f1('uZE', AZE); f1('uHb', sp.Hb); f1('uT', sp.t); f1('uGain', sp.gain ?? 1); f1('uVig', .55); f1('uAmb', sp.amb ?? .09); f1('uIb', sp.ib ?? 1.25);
    const Ld = V.nrm([.62, .6, .5]); gl.uniform3f(PA.u('uLd'), Ld[0], Ld[1], Ld[2]); gl.uniform3f(PA.u('uOcc'), sp.occ[0], sp.occ[1], sp.occ[2]); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }

  // ---------------------------------------------------------------- 7부용 상수: computed from the same geometry the shots use
  // the light edge stops 90 screen px above his head in the last frame: solved from the same pose and camera, once per timing table
  let endFor = null;
  function ensureEnd(T) { if (endFor === T) return; endFor = T; const Qe = poseAlley(T.end, T), cE = camAlley(T.end, T), hp = projA(Qe.C), top = hp[1] - .118 * hp[2], yb = top - 90 / cE[2];
    ALLEY_HB_END = AH - (yb - AVP[1]) * Qe.C[2] / AF;
    Object.assign(ALLEY_END, { cam: cE.map(v => +v.toFixed(3)), lightEdgeH: +ALLEY_HB_END.toFixed(3), headTopBaseY: +top.toFixed(1), head: Qe.C.map(v => +v.toFixed(3)) }); }

  // ---------------------------------------------------------------- shots, dissolves, colour, finish
  const SHOT = { r1, r2a, r2b, r2e, r3, r4, ots1: (t, T) => ots(t, T, 'a'), look: lookShot, rev, look2: lookShot, ots2: (t, T) => ots(t, T, 'e'), mem, ots3: (t, T) => ots(t, T, 'e'), gone: (t, T) => r3(t, T, true), alley };
  const plan = T => [['r1', T.start, T.N142, .55], ['r2a', T.N142, T.N143, 0], ['r2b', T.N143, T.wall, .5], ['r2e', T.wall, T.N146, .7], ['r3', T.N146, T.N149, 0], ['r4', T.N149, T.s2, .5],
    ['ots1', T.s2, T.s3b, 0], ['look', T.s3b, T.s3c, 0], ['rev', T.s3c, T.s3d, 0], ['look2', T.s3d, T.s3e, 0], ['ots2', T.s3e, T.s3f, .35], ['mem', T.s3f, T.s3g, 0], ['ots3', T.s3g, T.Q115, 0], ['gone', T.Q115, T.s5, 0], ['alley', T.s5, T.end, 0]];
  const offA = mk(VW, VH), oa = offA.getContext('2d'), offB = mk(VW, VH), ob = offB.getContext('2d'), offC = mk(VW, VH), oc = offC.getContext('2d');
  const GK = { r1: 1.92, r2a: 3.5, r2b: 1.34, r2e: 1.62, r3: 2.15, r4: 1.6, ots1: 3.2, look: 2.5, rev: 3.0, look2: 2.5, ots2: 3.2, mem: 1.92, ots3: 3.2, gone: 2.15, alley: 1 };   // the shot's exposure
  function shoot(id, t, T, o) { const sp = SHOT[id](t, T); sp.gain = (sp.gain ?? 1) * GK[id]; if (sp.alley) alleyFrame(sp); else glFrame(sp);
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.filter = sp.bgBlur > .05 ? `blur(${sp.bgBlur.toFixed(2)}px)` : 'none'; o.drawImage(glc, 0, 0); o.restore(); sp.over?.(o);
    if (sp.memK) { // memory: a soft bloom, the edges feathered to black
      oc.save(); oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalCompositeOperation = 'source-over'; oc.globalAlpha = 1; oc.filter = 'blur(18px)'; oc.clearRect(0, 0, VW, VH); oc.drawImage(o.canvas, 0, 0); oc.restore();
      o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.globalAlpha = .3; o.drawImage(offC, 0, 0); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1;
      const g = o.createRadialGradient(540, 980, 300, 540, 980, 1150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.62, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,.92)'); o.fillStyle = g; o.fillRect(0, 0, VW, VH); o.restore(); }
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.fillStyle = 'rgb(6,6,6)'; o.fillRect(0, 0, VW, VH); o.globalCompositeOperation = 'overlay'; o.globalAlpha = sp.grainA ?? .13;
    o.imageSmoothingEnabled = true; o.drawImage(grainC, 0, 0, VW, VH); o.restore(); }
  // the whole picture's colour: full until 628.6, gone at 629.6 (ease-in), none after
  const satAt = (t, T) => 1 - Math.pow(clamp((t - T.drain[0]) / (T.drain[1] - T.drain[0])), 2);
  function draw(ctx, t, T) { const P = plan(T); let i = P.findIndex(q => t < q[2]); if (i < 0) i = P.length - 1; const q = P[i], nx = P[i + 1], fade = nx && q[3] > 0 ? clamp((t - (q[2] - q[3] * .5)) / q[3]) : 0, pv = P[i - 1], fadeIn = pv && pv[3] > 0 ? clamp((t - (pv[2] - pv[3] * .5)) / pv[3]) : 1;
    shoot(q[0], t, T, oa); let img = offA, ig = oa;
    if (fade > 0 && nx) { shoot(nx[0], t, T, ob); oa.save(); oa.setTransform(1, 0, 0, 1, 0, 0); oa.globalAlpha = sine(fade); oa.drawImage(offB, 0, 0); oa.restore(); }
    else if (fadeIn < 1 && pv) { shoot(pv[0], t, T, ob); ob.save(); ob.setTransform(1, 0, 0, 1, 0, 0); ob.globalAlpha = sine(fadeIn); ob.drawImage(offA, 0, 0); ob.restore(); img = offB; ig = ob; }
    const sat = satAt(t, T); if (sat < 1) { ig.save(); ig.setTransform(1, 0, 0, 1, 0, 0); ig.globalCompositeOperation = 'saturation'; ig.globalAlpha = 1 - sat; ig.fillStyle = '#808080'; ig.fillRect(0, 0, VW, VH); ig.restore(); }
    const sc = Math.max(W / VW, H / VH), dw = VW * sc, dh = VH * sc; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(img, (W - dw) / 2, (H - dh) * (H > W ? .5 : .36), dw, dh); ctx.restore(); }

  // ---------------------------------------------------------------- measurement: camera speed + emission every .25 s from 606.2, joints per frame, planted contacts
  function measure(T, dt = 1 / 30) { ensureEnd(T); const P = plan(T), idOf = t => (P.find(q => t < q[2]) || P[P.length - 1])[0], rows = [], J = {}; let mx = { v: 0, t: 0, who: '' }, slip = { wrist: 0, toeL: 0, toeR: 0, feetLook: 0 }, prevA = null, prevJ = null;
    const camOf = (id, t) => SHOT[id](t, T).cam, emis = id => (/^(r3|gone|ots|rev)/.test(id) ? +(EM.reduce((s, q) => s + 1 / (3.2 + q[3] * 1.4), 0)).toFixed(1) : id === 'alley' ? MOTES.length : 0);
    for (let t = T.N148; t < T.end - .01; t += .25) { const id = idOf(t), c0 = camOf(id, t), c1 = camOf(id, Math.min(t + dt, P.find(q => q[0] === id)[2] - .001));
      rows.push([+t.toFixed(2), id, +(Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) * c0[2] / dt).toFixed(1), +(Math.abs(Math.log(c1[2] / c0[2])) / dt * 100).toFixed(2), emis(id)]); }
    for (let t = T.s5; t < T.end; t += dt) { const Q = poseAlley(t, T), a = { elbowL: ang3(Q.SL, Q.armL.E, Q.armL.W), elbowR: ang3(Q.SR, Q.armR.E, Q.armR.W), kneeL: ang3(Q.HL, Q.legL.E, Q.legL.W), kneeR: ang3(Q.HR, Q.legR.E, Q.legR.W) };
      if (prevA) { for (const k in a) { const d = Math.abs(a[k] - prevA.a[k]); J[k] = Math.max(J[k] || 0, d); if (d > mx.v) mx = { v: d, t: +t.toFixed(2), who: k }; }
        if (t - T.s5 > 2.15) slip.wrist = Math.max(slip.wrist, V.len(V.sub(Q.armL.W, prevA.Q.armL.W)));
        if (t - T.s5 > .335) slip.toeL = Math.max(slip.toeL, V.len(V.sub(Q.tL, prevA.Q.tL))); if (t - T.s5 > .61) slip.toeR = Math.max(slip.toeR, V.len(V.sub(Q.tR, prevA.Q.tR))); }
      prevA = { a, Q }; }
    const lims = { arm: .58, leg: .89 }, reach = { wristOnWall: +V.len(V.sub(poseAlley(T.end - .01, T).armL.W, WALLW)).toFixed(4) };
    return { rows, maxJoint: { rad: +mx.v.toFixed(3), deg: +(mx.v * 180 / Math.PI).toFixed(1), t: mx.t, who: mx.who, per: Object.fromEntries(Object.entries(J).map(([k, v]) => [k, +(v * 180 / Math.PI).toFixed(2)])) },
      slip: Object.fromEntries(Object.entries(slip).map(([k, v]) => [k, +v.toFixed(5)])), reach, lims, ALLEY_END, FIRE_OTS }; }
  return { draw, measure, poseAlley, hbAt };
}
