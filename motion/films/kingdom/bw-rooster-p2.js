// bw-rooster-p2.js — 「kingdom」 5부 「닭이 울 때」, the director's approach 2 「등 뒤의 카메라」 (rounds/r10-pilot/director-plan.md §4): one take behind Peter's right shoulder.
// Built from version B (bw-rooster-b.js, left unchanged): everything before N148 (606.2) is B's. From N148 to Q115 (630.0 held) one take. The owner's scope (2026-11-24: approach 2 is the
// costliest) is a SAMPLE of its heart only — the page renders film 608.8 → 630.0: the crow → the Lord stops, turns and looks → Peter's reaction (the colour dies). Plan rows 4–5 (he rises and
// goes out, the alley) are not built: after Q115 the module draws black.
// Holds (the page's time map; script.json untouched): Q114 +11.3 s (4.7 → 16.0 s), Q115 +11.4 s (8.6 → 20.0 s) — the plan's shared timetable (§2). Block from 541.2 would be 108.8 s.
// Film refs: 「사울의 아들」 (Nemes 2015) and the Dardennes' 「로제타」 — the camera on the back of a head, shallow focus, the world blurred; Rembrandt 「베드로의 부인」 (1660) — Christ small and far at
//   the edge of the dark, the light on the one who is seen; Bresson — sound and the off-screen carry it; Kurosawa 「란」 — smash to silence at the crow.
// Look: B's black and white with one colour, the fire #ff8a2a; the colour drains from the whole frame 628.6 → 629.6 and does not come back in part 5.
// Camera (cinecode camera-moves): one operated take, moves overlapping — orbit ≈6° right round his head (the arch opens past his shoulder) → rack focus Peter → walkway → dolly in past his
//   shoulder (his head leaves the frame left at ≈621) → one U-shaped arc back onto his eye-line (his head in front of Him) → rack focus to Peter → a slow drift back; focus goes back to Him as
//   Peter's head drops. Operator, not a game camera: keys through Hermite (no stops) → a spring with weight (ω 4.2/s, ζ .9: half a beat of lag, a soft settle) → breathing drift ≤ 2.2 mm and
//   ≤ 2 px of yaw at 0.13–0.33 Hz; the lens never chases a walker; no roll, no shake. Depth of field is real: every plane is blurred by its own circle of confusion (24 px·m × |1/d − 1/focus|).
// Skills: cinecode (camera-moves: orbit, rack focus, dolly in, arc), canvas-film BODY-CHECK (fixed-length two-bone arms, planted feet that never slide, eased bodies) and SCENE-RULES; B's surface and flame shaders.
// The take (held film seconds):
//   606.2–613.6 over his right shoulder: head cloth and shoulder sharp at lower left, an orange line along their top; the fire and the men round it as bokeh; the arch opens past his shoulder.
//               607.6 his head shakes "no"; ≈611.5 the third "no" is cut off by the crow — his head stays where it stopped, the men stop, even his breath catches.
//   613.6–625.0 613.7 his head lifts toward the walkway; 614.0–615.2 rack focus to it: three men walking (the front guard holds His upper arm). 616.4 He alone stops (two slowing steps), the
//               guards go on a step; 617.0 the tug, He does not follow, the guard lets go and 617.6 looks back at Him; 616.8–618.8 He turns, shoulders first, the head a plain round dark cloth
//               throughout (no profile, darkest mid-turn); 618.8 square to us, the yard's firelight faint on his shoulders only (he faces the fire = he faces us). 618.4–620.9 the guards
//               leave out of the arch, torches lowered; the wall torch dims 40 %. Meanwhile the camera dollies in past Peter's shoulder; 621–624.6 Him alone.
//   625.0–630.0 the arc brings Peter's head back in from the left, in front of Him; focus to Peter; 625.2 a jolt through his shoulders; 628.6–629.6 the colour dies (his rim greys, the fire −30 %);
//               629.1–630.0 his head drops out of the frame and the arch is there again — He is still looking.
// Text: N149 608.8 (two pieces) · L105 613.8 → 624.6 · Q114 618.8 → 624.6.
// Sound cue table (for the sound stage; held film seconds):
//   608.8   yard murmur, embers close            ≈611.5 (pc.N149[1], the comma) the yard cut in one frame + ONE distant rooster (stone-yard reverb 2.2 s), then ≈1.0 s near silence (wind)
//   613.8   embers −28 dB; three pairs of sandals on stone across the yard, panned to the arch
//   616.4   one pair stops; the other two go on a step and stop          617.0 cloth: the tug          618.8–624.6 the deepest silence of the film (room tone −45 dB, torches out too)
//   620.9   one ember ticks                       624.6 Peter's sharp in-breath, close (J-cut into the arc)          625.2 cloth: the jolt
//   625.4–628.6 the memory voice: N141 「오늘 닭이 울기 전에, 네가 세 번 나를 모른다고 할 것이라고」 as an echo, −16 dB, 3 kHz low-pass, stone reverb 2.5 s (script.json unchanged)
//   628.6–630.0 silence; one broken exhale as his head drops.   (Not built in the sample: 630.2 he rises, steps, 632.6 the gate; alley 633.6 shoulder on stone; sobs 636.2 / 637.9 / 639.4 /
//               642.8 / 644.6 / 646.4; cello ppp 639.4 → stops on the leading note ≈646, gone by 649.0; black 650.0.)
// Below: version B's own header (the shots before 606.2 are B's).
//
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
//   R5a  Peter    L105       very close, his profile lost in black, one thin orange rim; frozen, his head slowly lifts toward something across the yard. Slow push.
//   R5b  his eyes Q114       Peter's point of view through a rough stone arch: a bound man led along a walkway in smoke stops and turns square to us. Very slow push.
//   R5p  Peter    Q114       one second back on Peter, frozen (shot / reverse shot). Locked.
//   R5b' his eyes Q114       back to Him, a little closer, the push going on: he holds the gaze. Very slow push.
//   R5c  Peter    Q114       the orange drains out of the rim until no colour is left; one jolt through the shoulders; his head sinks. The caption has gone before this cut.
//   R6   alley    Q115       one shot: he staggers in close to the wall, hits it shoulder first, slides down to his knees; irregular sobs, then folded to the ground,
//                            arms over his head; one long slow pull back of the whole scene, ending at about 14% of the frame; cold light grows across the stone onto his back.
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
export const HOLDS = { Q114: 11.3, Q115: 11.4 };   // extra seconds on these two lines, applied by the page's local time map

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
  const b0 = B.L105 + 2.4; T.look = { a: B.L105, b: b0, stop: b0 + .7, turn: [b0 + .85, b0 + 2.75], p: b0 + 2.95, q: b0 + 3.95, c: B.Q115 - 2.0 };
  T.caption114 = T.look.q; T.caption114end = T.look.c - .4;   // the words come with his finished gaze (after the one-second cut to Peter) and are gone .4 s before Peter's profile returns
  T.flee = B.Q115; T.weep = B.Q115 + 6.6;
  // approach 2, the one take (all from the held line times: q = Q114 614.0, e = Q115 630.0)
  const q = B.Q114, e = B.Q115;
  T.p2 = { crow: T.crow, shake1: [B.N148 + 1.15, 0], shake2: [T.crow - .5, T.crow + .25], lift: [B.L105 - .1, B.L105 + .7], rack1: [q, q + 1.2],
    stop: [q + 1.5, q + 2.6], g1stop: [q + 1.8, q + 2.95], g2stop: [q + 1.85, q + 3.05], tug: q + 2.95, release: q + 3.3, g1look: q + 3.6, turnSh: [q + 2.8, q + 4.0], turnHd: [q + 3.4, q + 4.8], front: q + 4.8,
    leave: [q + 4.4, q + 6.2], g1go: [q + 4.4, q + 5.1], g2turn: [q + 4.8, q + 5.5], g2go: [q + 5.2, q + 5.8], rack2: [q + 11, q + 12.2], flinch: q + 11.2, drain: [e - 1.4, e - .4], drop: [e - .9, e], rack3: [e - .55, e + .7] };
  T.caption114 = q + 4.8; T.caption114end = q + 10.6;   // Q114 618.8 -> 624.6
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
  function poseR3(t, T) { const g1 = ss(T.two, T.two + 1.05, t), g2 = ss(T.three, T.three + 1.05, t), pt = ss(T.point[0], T.point[1], t) * (1 - ss(T.two - .75, T.two + .35, t)), aw = ss(T.away[0], T.away[1], t), en = ss(T.enter[0], T.enter[1], t) * (1 - ss(T.two - .35, T.two + 1.15, t)),
 St = [0, 0], Wt = [lerp(.16, .534, pt), lerp(-.36, .094, pt)], q = ik(St, Wt, .36, .32, -1); return { pt, aw, en, g1, g2, St, W: q.W, E: q.E }; }
  function r3(t, T) { const u = clamp((t - T.N146) / (T.N149 - T.N146)), zz = lerp(1.0, 1.11, u), cam = [lerp(536, 552, u), FIRE3[1] - 206 / zz, zz],
 f = fl(t, .4), Q = poseR3(t, T), { aw, en, g1, g2 } = Q;
    maskBegin(); const fan = x => (x - FIRE3[0]) / 1000 * .24, by = 1252;
    MEN3.forEach((m, i) => { const g = i === 1 ? g1 : i === 2 ? g2 : g2 * .5, side = m.x < PX3 ? 1 : -1, sc = m.s * (1 + g * .26), turn = lerp(m.t0, side * .92, g), lean = fan(m.x) + side * g * .13; man(mg, MB, m.x + side * g * 62, by, sc, { h: m.h, br: m.br * (1 - .3 * Math.sin(Math.PI * g)), turn, lean, sv: 1.1, hx: side * .04 * g }); });   // the shoulders narrow through the turn and the head turns with them
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
  const poseR5c = (t, T) => { const c = T.look.c, e = T.Q115, j = t < c + .6 ? 0 : t < c + .7 ? sine((t - c - .6) / .1) : 1 - sine((t - c - .7) / .5), sink = ss(c + .85, e - .05, t); return { pitch: lerp(-.07, .4, sink), pf: lerp(1, .9, sink), lift: 15 * j, sink, drain: ss(c + .1, c + 1.1, t) }; };
  function closeShot(t, P, z) { const cam = [540, 900, z], d = P.drain;
    return { kind: 0, cam, t, L: [{ x: 1040, y: 1120, z: 240, I: lerp(.62, .42, d) * fl(t, .4), r: 400, c: [1, .5, .15] }, { x: 90, y: 280, z: 700, I: .05, r: 900, c: [.86, .87, .9] }], amb: .0022, haze: .07, shD: 0, vig: .74, mono: d, hzS: 1.8, hzV: 1.6,
      over(o) { const q = camBase(cam), fxp = q.k * (PX + 125 * PC) + q.ox, fyp = q.k * (PY + 40 * PC) + q.oy, gr = tb.createRadialGradient(fxp, fyp, 30, fxp, fyp, 290 * q.k), R = lerp(255, 128, d) | 0, G = lerp(138, 126, d) | 0, B = lerp(48, 122, d) | 0, A = 1 - d * .9;
        gr.addColorStop(0, `rgba(${R},${G},${B},${A})`); gr.addColorStop(.6, `rgba(${R},${G},${B},${A * .78})`); gr.addColorStop(1, `rgba(${R},${G},${B},0)`);
        mass(o, cam, (g, b) => peterClose(g, b, P), { fill: '#030303', blur: .8, rim: { c: gr, dx: -3, dy: 1.8, a: .95 } }); } }; }
  function r5a(t, T) { const u = clamp((t - T.look.a + .4) / (T.look.b - T.look.a + .4)); return closeShot(t, poseR5a(t, T), lerp(1, 1.035, u)); }
  function r5p(t, T) { return closeShot(t, poseR5a(T.look.b - .001, T), 1.035); }   // one second back on Peter, frozen
  function r5c(t, T) { const u = clamp((t - T.look.c) / (T.Q115 - T.look.c)); return closeShot(t, poseR5c(t, T), lerp(1.035, 1.075, u)); }

  // R5b: Peter's eyes, through a rough stone arch across the smoky yard. The walkway recedes to the right; the guards walk on into the dark under the arch and their light goes with them.
  const WALK = 1008, GV = 96, pathY = x => WALK - (x - 540) * .07, pathS = x => 158 * clamp(1 - (x - 540) * .00105, .5, 1.15);
  const EDGE = (() => { const r = rngOf(5519), P = []; let x = -260; while (x < 1560) { const w = 46 + r() * 70, top = (r() - .55) * 9; P.push([x + 2, pathY(x) + top], [x + w * .5, pathY(x + w * .5) + top + (r() - .5) * 2.4], [x + w - 3, pathY(x + w) + top + (r() - .5) * 2], [x + w - 1, pathY(x + w) + 4 + r() * 5]); x += w; } return P; })();
  const ARCH = (() => { const r = rngOf(6113), P = [], j = a => a + (r() - .5) * 9; for (let y = 1120; y > 690; y -= 34) P.push([j(58), y]); for (let a = Math.PI; a >= 0; a -= .075) P.push([485 + Math.cos(a) * 428 + (r() - .5) * 8, 690 - Math.sin(a) * 440 + (r() - .5) * 8]); for (let y = 690; y < 1120; y += 34) P.push([j(914), y]); return P; })();
  // one body, two hand-drawn outlines with the same points: square to us (sloping shoulders, weight on one leg, robe in folds, arms bent to wrists bound low in front) and walking side-on
  const BF = [[-.27, -.01], [-.285, .16], [-.262, .36], [-.282, .56], [-.262, .72], [-.268, .86], [-.272, .94], [-.312, 1.02], [-.33, 1.14], [-.315, 1.26], [-.25, 1.35], [-.14, 1.42], [-.066, 1.5], [.062, 1.505], [.125, 1.43], [.235, 1.365], [.305, 1.285], [.33, 1.16], [.318, 1.03], [.285, .95], [.28, .84], [.298, .6], [.272, .38], [.3, .16], [.285, -.01]];
  const BS = [[-.2, -.01], [-.19, .16], [-.215, .36], [-.19, .56], [-.205, .72], [-.2, .87], [-.195, .93], [-.205, 1.01], [-.205, 1.16], [-.195, 1.3], [-.15, 1.385], [-.085, 1.43], [-.045, 1.5], [.07, 1.505], [.11, 1.45], [.15, 1.4], [.18, 1.33], [.2, 1.2], [.31, .99], [.3, .93], [.2, .84], [.215, .6], [.19, .38], [.235, .16], [.22, -.01]];
  function manBody(g, side, sideL, br = 0) { blob(g, BF.map((f, i) => { const q = BS[i], k = f[1] > 1.02 ? side : f[1] < .82 ? sideL : lerp(sideL, side, (f[1] - .82) / .2); const o = 1 - k, tilt = .04 * o, hip = .022 * (1 - sideL) * Math.sin(Math.PI * clamp(f[1] / .95)), x0 = lerp(f[0], q[0], k), y0 = lerp(f[1], q[1], k), up = Math.max(0, y0 - .85); return [x0 + hip - up * tilt * .6, y0 + (y0 > .85 ? x0 * tilt : 0) + (y0 > 1.2 ? br * ss(1.2, 1.38, y0) : 0)]; })); }
  // the head is a plain round tied cloth from every angle: no nose, no brow, no beard at any moment of the turn
  function clothHead(g, cx, cy, inc) { g.save(); g.translate(cx, cy); g.rotate(-inc); g.beginPath(); g.ellipse(0, 0, .118, .132, 0, 0, TAU); g.fill(); blob(g, [[-.085, .112], [0, .135], [.085, .112], [.122, .045], [.134, .012], [.126, -.02], [.132, -.09], [.145, -.17], [.1, -.2], [.05, -.15], [-.05, -.15], [-.09, -.215], [-.15, -.18], [-.134, -.09], [-.126, -.02], [-.136, .012], [-.121, .045]]); g.restore(); }
  function poseR5b(t, T) { const L = T.look, k = clamp((t - L.b) / (L.stop - L.b)), x0 = 540 - GV * (L.stop - L.b) / 2, jx = lerp(x0, 540, 1 - (1 - k) * (1 - k)), side = 1 - ss(L.turn[0], L.turn[0] + 1.25, t), sideL = 1 - ss(L.turn[0] + .25, L.turn[1], t), headK = 1 - ss(L.turn[0] + .65, L.turn[1], t), walk = 1 - ss(L.stop - .2, L.stop + .1, t);
    return { jx, side, sideL, headK, walk, bob: 2 * Math.sin(t * 3.1) * walk, gx: i => 540 - GV * (L.stop - t) + 200 + i * 152, leave: ss(L.stop + .3, L.turn[1] + .2, t), dark: ss(L.turn[1] - .2, L.c - .9, t) }; }
  function r5b(t, T, second = false) { const L = T.look, Q = poseR5b(t, T), k = second ? clamp((t - L.q) / (L.c - L.q)) : clamp((t - L.b) / (L.p - L.b)), z = second ? lerp(1.42, 1.68, k) : lerp(1, 1.28, k), cam = [540, second ? lerp(938, 950, k) : lerp(902, 930, k), z], s = 158, G = [0, 1, 2, 3, 4, 5].map(i => { const x = Q.gx(i), sc = pathS(x); return { i, x, sc, y: pathY(x) + 1.8 * Math.sin(t * 3.1 + i * 1.3) * sc / s, torch: i % 2 === 0, fade: 1 - ss(760, 1040, x) }; }), T2 = G.filter(q => q.torch).map(q => ({ x: q.x + .36 * q.sc, y: q.y - 1.82 * q.sc, sc: q.sc, fade: q.fade })); maskBegin();
    const glow = lerp(1, .78, Q.dark), lights = T2.slice(0, 2).map((q, i) => ({ x: q.x, y: q.y, z: 130, I: q.fade * (1 - Q.leave * .75) * (.92 + .08 * Math.sin(t * 2.4 + i * 2)), r: 150, c: [1, .54, .18] }));
    while (lights.length < 2) lights.push({ x: 0, y: 0, z: 100, I: 0, r: 100 });
    const still = 1 - Q.side, lean = .022 * still, breathe = .0045 * still * Math.sin(t * 1.25);   // a slight lean, weight on one leg, a very small rise of the shoulders: still, not idle
    return { kind: 2, cam, t, flames: T2.map((q, i) => [q.x, q.y + 6, 34 * q.sc / s, 60 * q.sc / s, i * 2.3, .95 * q.fade, 0]), L: [...lights, { x: 452, y: WALK - 104, z: 150, I: .56 * glow, r: 150, c: [.8, .82, .86] }, { x: 668, y: WALK - 176, z: 150, I: .38 * glow, r: 125, c: [.8, .82, .86] }], amb: lerp(.0036, .0012, Q.dark), haze: .44, shD: 0, vig: .72, mono: lerp(0, .75, Q.leave), hzS: 2.6, hzV: 2.6,
      over(o) { const walker2 = (g, b, q) => { atf(g, b, q.x, q.y, q.sc, 0, 1, 1.04); manBody(g, 1, 1); head(g, .03, 1.615, .116, .92, { beard: true, cl: .7 }); if (q.torch) { sleeveArm(g, [.08, 1.32], [.31, 1.18], .3, .28, -1, fist, .3); g.save(); g.translate(.36, 1.12); g.rotate(-.04); g.fillRect(-.016, -.2, .032, .86); g.restore(); } else sleeveArm(g, [.08, 1.32], [.14, .88], .3, .28, -1, fist, -1.2); };
        mass(o, cam, (g, b) => { for (const q of G) walker2(g, b, q); }, { blur: .9, rim: { c: 'rgb(255,150,76)', dx: 2, dy: 1.6, a: .5 * (1 - Q.leave * .6) } });
        for (const q of T2) if (q.fade > .02) halo(o, cam, q.x, q.y - 16, 130 * q.sc / s, '255,136,50', .3 * q.fade);
        // the man himself: robe falling closed, no hands showing; only a faint edge on one shoulder
        const qb = camBase(cam), Y0 = pathY(Q.jx) + Q.bob, gx = qb.k * (Q.jx + .27 * s) + qb.ox, gy = qb.k * (Y0 - 1.36 * s) + qb.oy, gr = tb.createRadialGradient(gx, gy, 4, gx, gy, 48 * qb.k); gr.addColorStop(0, 'rgba(190,190,192,.8)'); gr.addColorStop(1, 'rgba(190,190,192,0)');
        mass(o, cam, (g, b) => { atf(g, b, Q.jx, Y0, s, lean, 1, 1.04); manBody(g, Q.side, Q.sideL, breathe); clothHead(g, lerp(.012, .03, Q.headK), 1.625 + breathe, lerp(.075, .03, Q.headK)); }, { fill: '#020202', blur: .6, rim: { c: gr, dx: -1.8, dy: 1.5, a: .55 } });
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); const f = ta.createLinearGradient(0, WALK - 40, 0, WALK + 520); f.addColorStop(0, '#0b0b0b'); f.addColorStop(.25, '#060606'); f.addColorStop(1, '#030303'); g.fillStyle = f; g.beginPath(); g.moveTo(EDGE[0][0], EDGE[0][1]); for (const q of EDGE) g.lineTo(q[0], q[1]); g.lineTo(1600, 2300); g.lineTo(-300, 2300); g.closePath(); g.fill(); }, { rim: { c: 'rgb(150,140,128)', dx: 0, dy: 2.2, a: .3 * lerp(1, .55, Q.dark) } });
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); g.beginPath(); g.rect(-400, -400, 1900, 1720); g.moveTo(ARCH[0][0], ARCH[0][1]); for (const q of ARCH) g.lineTo(q[0], q[1]); g.closePath(); g.fill('evenodd'); }, { fill: '#030303', blur: 4.5 }); } };
  }
  const r5b2 = (t, T) => r5b(t, T, true);

  // ================================================================ R6: the alley, one shot (no colour; a real body on fixed limbs; no hand ever shown)
  // He staggers in from the left on planted, uneven steps, is thrown against the wall shoulder first, slides down it to his knees and sinks back on his heels.
  // The sobs are events, not a sine: a catch of breath (.4 s), a collapse (.9 s), a pause, each with its own size and spacing; then folded, arms over his head.
  const addv = (a, v, k) => [a[0] + v[0] * k, a[1] + v[1] * k];
  const PIER = .3, A6 = [-.24, .08], AF = [-.19, .08], H0 = [-.1, .88], H1 = [-.217, .264];
  const STEPS6 = [[-.7, -2.05, 0], [-.25, -1.72, .02], [.3, -1.32, .04], [.78, -1.0, .1], [1.4, -.66, .03], [1.75, -.47, .12], [2.25, -.24, .04], [2.55, -.19, 0]];
  const hermite = (keys, x) => { const n = keys.length; if (x <= keys[0][0]) return keys[0][1]; if (x >= keys[n - 1][0]) return keys[n - 1][1]; let i = 0; while (x > keys[i + 1][0]) i++; const [a, va] = keys[i], [b, vb] = keys[i + 1], h = b - a, u = (x - a) / h, m = (p, q) => (keys[q][1] - keys[p][1]) / (keys[q][0] - keys[p][0]), m0 = i > 0 ? m(i - 1, i + 1) : m(i, i + 1), m1 = i < n - 2 ? m(i, i + 2) : m(i, i + 1), u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * va + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * vb + (u3 - u2) * h * m1; };
  const PELV6 = STEPS6.slice(1).map((q, i) => [q[0], (q[1] + STEPS6[i][1]) / 2 + .07]), PDIP6 = STEPS6.map(q => [q[0], q[2]]);
  function foot6(f, x) { const own = STEPS6.map((q, i) => ({ i, t: q[0], x: q[1] })).filter(q => q.i % 2 === f); let j = 0; while (j < own.length - 1 && x >= own[j + 1].t) j++; const p = own[j], n = own[j + 1]; if (!n) return [p.x, .08]; const lift = STEPS6[p.i + 1][0] + .06, k = clamp((x - lift) / (n.t - lift)); return [lerp(p.x, n.x, sine(k)), .08 + Math.sin(Math.PI * k) * .1]; }
  const shoulderX = (hx, th) => hx + .55 * Math.sin(th) + .13 * Math.cos(th), thFor = hx => { let a = 0, b = 1.3; for (let i = 0; i < 24; i++) { const m = (a + b) / 2; if (shoulderX(hx, m) < PIER) a = m; else b = m; } return Math.min(1.0, (a + b) / 2); };
  const SOBS = [[.55, .8], [2.85, .42], [4.75, 1], [6.9, .38], [8.1, .3], [9.75, .26], [10.95, .18], [12.35, .1]];
  const sobAt = x => { let v = 0; for (const [a, k] of SOBS) { const q = x - a; if (q <= 0 || q >= 2.7) continue; v += k * (q < .4 ? sine(q / .4) : q < 1.3 ? 1 - 1.62 * sine((q - .4) / .9) : -.62 * (1 - sine((q - 1.3) / 1.4))); } return v; };
  function poseR6(t, T) { const x = t - T.flee, w = t - T.weep, sob = w > 0 ? sobAt(w) : 0, fold = kf(w, [[-3, .05], [0, .16], [5, .3], [7.2, .4], [9.2, 1]]), toWall = ss(2.3, 2.75, x), drop = sine(clamp((x - 3.9) / 1.7)), back = ss(.6, 1, drop), settle = ss(5.2, 6.6, x);
    const Hw = [hermite(PELV6, x), .92 - hermite(PDIP6, x) * .7], Hs = [lerp(Hw[0], H0[0], toWall), lerp(Hw[1], H0[1], toWall)], H = [lerp(Hs[0], H1[0], back), lerp(Hs[1], H1[1], drop) + Math.max(0, sob) * .018];
    const heave = x > 2.75 && x < 3.9 ? .03 * Math.sin((x - 2.75) * 5.2) * (1 - ss(3.4, 3.9, x)) : 0;
    let th = lerp(.28 + hermite(PDIP6, x), thFor(H[0]), toWall) + heave; th = lerp(th, .5, settle); if (w > 0) th += .36 * fold - sob * .24; th = clamp(th, -.08, 1.0);
    const u = [Math.sin(th), Math.cos(th)], n = [-u[1], u[0]], jolt = x > 2.75 ? Math.exp(-(x - 2.75) * 9) * .025 : 0, N = [H[0] + u[0] * (.55 - jolt), H[1] + u[1] * (.55 - jolt) + Math.max(0, sob) * .012];
    const ph = th + (w > 0 ? lerp(.42, 1.02, fold) - sob * .2 : lerp(.35, .55, ss(2.3, 3.2, x))), C = [N[0] + Math.sin(ph) * .165 + .012, N[1] + Math.cos(ph) * .165];
    const fN = foot6(0, x), fF = foot6(1, x), legN = ik(H, x < 2.6 ? fN : A6, .46, .44, 1), legF = ik([H[0] + .03, H[1]], x < 2.6 ? [fF[0] + .05, fF[1]] : [AF[0] + .05, AF[1]], .46, .44, 1);
    const Sn = [N[0] + n[0] * .02 - u[0] * .06, N[1] + n[1] * .02 - u[1] * .06], Sf = [Sn[0] + .05, Sn[1] - .01], over = ss(8.3, 9.3, w), hd = ph - .32, fc = [Math.cos(hd), -Math.sin(hd)], hu = [Math.sin(hd), Math.cos(hd)];
    const chestF = [N[0] - u[0] * .2 - n[0] * .07, N[1] - u[1] * .2 - n[1] * .07], clutch = [N[0] - u[0] * .1 + .17, N[1] - u[1] * .1 + .02], top = [C[0] + hu[0] * .06 - fc[0] * .1, C[1] + hu[1] * .06 - fc[1] * .1], top2 = [C[0] + hu[0] * .05 - fc[0] * .03, C[1] + hu[1] * .05 - fc[1] * .03];
    const c0 = w > 0 ? ss(0, .8, w) : 0, Wn0 = [lerp(chestF[0], clutch[0], c0), lerp(chestF[1], clutch[1], c0)], Wn = [lerp(Wn0[0], top[0], over), lerp(Wn0[1], top[1], over)], Wf = [lerp(Wn0[0] + .03, top2[0], over), lerp(Wn0[1] - .02, top2[1], over)], armN = ik(Sn, Wn, .32, .29, -1), armF = ik(Sf, Wf, .32, .29, -1);
    return { x, w, drop, sob, fold, th, u, n, H, N, ph, C, legN, legF, Sn, Sf, armN, armF, over }; }
  function drawKneeler(g, Q) { const { H, N, u, n, legN, legF, C, drop } = Q, br = Math.max(0, Q.sob) * .018, p = f => addv(H, u, .55 * f), kn = legN.E, gb = Math.min(H[0] - .23, A6[0] - .16), a = p(.34), c = p(.72), belt = p(.18), hb = Math.min(legN.E[0], legF.E[0]) - .13, hf = Math.max(legN.E[0], legF.E[0]) + .09, dk = ss(.15, .9, drop);
    for (const L of [legF, legN]) { limb(g, H[0], H[1], lerp(.115, .07, dk), L.E[0], L.E[1], .074); limb(g, L.E[0], L.E[1], .064, L.W[0], L.W[1], .042); blob(g, [[L.W[0] - .07, L.W[1] + .02], [L.W[0] + .06, L.W[1] + .03], [L.W[0] + .19, L.W[1] - .05], [L.W[0] + .18, L.W[1] - .085], [L.W[0] - .08, L.W[1] - .085]]); }
    // standing: a belted tunic to mid-calf. Knelt: it falls from the shoulders in one long line to the ground behind the heels, so there is no hip shape.
    const K0 = [[hb, .35], addv(H, n, .142), addv(belt, n, .136), addv(p(.62), n, .18), addv(N, n, .17), addv(N, u, .05), addv(N, n, -.12), addv(p(.62), n, -.15), addv(belt, n, -.125), addv(H, n, -.16), [kn[0] + .08, kn[1] + .03], [hf, .38], [(hb + hf) / 2, .33]];
    const K1 = [[gb, 0], [lerp(gb, a[0] + n[0] * .17, .58), lerp(0, a[1] + n[1] * .17, .58) + .05], addv(a, n, .165), addv(c, n, .185 + br), addv(N, n, .17), addv(N, u, .05), addv(N, n, -.13), addv(c, n, -.16), addv(a, n, -.14), [lerp(a[0], kn[0], .62) + .015, lerp(a[1], kn[1], .62) + .08], [kn[0] + .07, kn[1] + .035], [kn[0] + .085, lerp(.02, kn[1] - .04, .3)], [(gb + kn[0]) / 2, -.004]];
    blob(g, K0.map((q, i) => [lerp(q[0], K1[i][0], dk), lerp(q[1], K1[i][1], dk)]));
    limb(g, N[0], N[1], .07, lerp(N[0], C[0], .62), lerp(N[1], C[1], .62), .056); g.save(); g.translate(C[0], C[1]); g.rotate(-Q.ph + .32); head(g, 0, 0, .116, .92, { beard: true, cl: .62 }); g.restore();
    // the hands stay inside the silhouette: folded against the chest, then over the head; a closed hand, never an open one in the light
    const sleeve = (S, q) => { limb(g, S[0], S[1], .088, q.E[0], q.E[1], .058); limb(g, q.E[0], q.E[1], .052, q.W[0], q.W[1], .036); g.beginPath(); g.arc(q.W[0], q.W[1], .045, 0, TAU); g.fill(); };
    sleeve(Q.Sf, Q.armF); sleeve(Q.Sn, Q.armN); }
  const X6 = 452, F6 = 1212, S6 = 200;
  // the corner of the alley: quoins of rough stone, shaded by the soft light rather than cut with a line
  const QUOIN = (() => { const r = rngOf(8123), px = X6 + PIER * S6, P = [[px + 3, F6 + 4]]; let y = F6, odd = false; while (y > -260) { const h = 38 + r() * 26, atBody = y > 900 && y < 1170, o = atBody ? (r() - .5) * 4 : y > 860 ? (r() - .5) * 15 : odd ? 12 + r() * 10 : (r() - .5) * 8; P.push([px + o + (r() - .5) * 3, y - 2], [px + o + (r() - .5) * 3, y - h + 2]); y -= h; odd = !odd; } P.push([VW + MARG + 20, y], [VW + MARG + 20, F6 + 4]); return P; })();
  const quoinPath = g => { g.beginPath(); g.moveTo(QUOIN[0][0], QUOIN[0][1]); for (const q of QUOIN) g.lineTo(q[0], q[1]); g.closePath(); };
  // one long, very slow pull back of the whole scene (wall and ground together); cold light grows from the upper left across the wall and ends on his back
  function r6(t, T) { const v = clamp((t - T.flee) / (T.end - T.flee)), E = v * .4 + sine(v) * .6, z = Math.exp(lerp(Math.log(2.45), Math.log(2.15), E)), cam = [501, 1108, z], Q = poseR6(t, T), lg = sine(clamp((t - T.flee - .5) / (T.end - T.flee - 1)));
    maskBegin(); mg.setTransform(MB.k, 0, 0, MB.k, MB.ox, MB.oy); quoinPath(mg); mg.fill();
    return { kind: 2, cam, t, det: lerp(.2, .12, E), L: [{ x: 130, y: 480, z: 420, I: lerp(.7, 1.62, lg), r: lerp(240, 800, lg), c: [.84, .86, .9] }, { x: 960, y: 560, z: 760, I: .62, r: 1000, c: [.86, .87, .9] }], amb: .006, haze: .025, shD: .7, soft: 1.5, softD: 0, vig: .6, mono: 1, hzS: 1.4, hzV: 1.2,
      over(o) { mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); quoinPath(g); g.fill(); }, { fill: 'rgba(0,0,0,.14)', blur: 3.5, rim: { c: 'rgb(160,162,166)', dx: 2.4, dy: 0, a: .16 + .1 * lg } });
        mass(o, cam, (g, b) => { g.setTransform(b.k, 0, 0, b.k, b.ox, b.oy); const f = ta.createLinearGradient(0, F6, 0, F6 + 260); f.addColorStop(0, '#121212'); f.addColorStop(.3, '#0a0a0a'); f.addColorStop(1, '#050505'); g.fillStyle = f; g.beginPath(); g.moveTo(-300, F6 + 1); for (let x = -300; x <= 1500; x += 22) g.lineTo(x, F6 + 1 + .8 * Math.sin(x * .09) + .5 * Math.sin(x * .23)); g.lineTo(1500, 2400); g.lineTo(-300, 2400); g.closePath(); g.fill(); });
        mass(o, cam, (g, b) => { atf(g, b, X6, F6, S6); drawKneeler(g, Q); }, { fill: '#030303', blur: .9, rim: { c: 'rgb(200,204,212)', dx: 3.2, dy: 3.6, a: lerp(.16, .62, lg) } }); } };
  }

  // ================================================================ P2 「등 뒤의 카메라」: one take behind Peter's right shoulder (film N148 → Q115; the owner's sample renders 608.8 → 630.0)
  // A camera in metres: Peter's head is the origin, x right, y up, z forward (across the yard to the walkway). Every layer is a flat plane at its own depth seen
  // through one lens (F2 px) and blurred by its own circle of confusion, so the orbit's parallax, the rack focus and the dolly past his shoulder are physical.
  // The operator: the camera follows a smooth key path through a slightly under-damped spring (ω 4.2/s, ζ .9: weight, a half-beat of lag, a soft settle),
  // plus a slow breathing drift (0.13–0.33 Hz, ≤ 2.2 mm, ≤ 2 px of yaw). Nothing above 2 Hz but the fire. No roll, no shake.
  const F2 = 1650, PXW = 150, WY0 = 1250, DOFA = 24;
  const Z_WALK = 6.4, Z_ARCH = 5.75, Z_BACK = 7.5, FLOOR = -.2, GROUND = -.9, XS = -.914, STEP = .55, VWALK = .72, ARCH_W = 1.5, ARCH_SPRING = 2.05;
  const FIRE2 = [.2, GROUND, 3.0], MEN2 = [{ x: -1.45, z: 3.9, t0: .35, br: 1.02, seed: 1 }, { x: .85, z: 4.7, t0: -.3, br: .96, seed: 2 }, { x: .78, z: 2.05, t0: -.92, br: 1.06, seed: 3, lean: 1 }];
  const plane = (C, Z) => { const d = Math.max(.04, Z - C.z), k = F2 / d; return { k, ox: 540 - k * C.x - F2 * C.yaw, oy: 960 + k * C.y + F2 * C.pitch, d }; };
  const scr = (C, X, Y, Z) => { const p = plane(C, Z); return [p.k * X + p.ox, -p.k * Y + p.oy, p.k]; };
  const lay = (g, p) => g.setTransform(p.k, 0, 0, -p.k, p.ox, p.oy);   // draw in metres, y up, on that plane
  const bOf = p => ({ k: p.k, ox: p.ox, oy: p.oy });                    // for atf(): x = X, y = −Y, s = 1
  const coc = (C, Z, D) => DOFA * Math.abs(1 / Math.max(.05, Z - C.z) - D);

  // ---- the operator's path: keys → Hermite (Catmull-Rom tangents, so the moves overlap and never stop) → a spring with weight → breathing drift
  const camKeys = T => { const q = T.Q114, e = T.Q115, p = -.085;
    return [[T.N148, .30, .06, -1.15, -.036, p], [q - .4, .40, .06, -1.115, -.128, p],     // orbit ≈6° right round his head: the arch opens past his shoulder
      [q + 7.0, .50, .074, -.72, -.175, p],                                                     // dolly in, past his shoulder: his head leaves the frame on the left ≈ q+7
      [q + 9.6, .43, .078, -.60, -.172, p], [q + 12.4, .30, .07, -1.10, -.174, p],               // one U-shaped arc: forward, turning left, back onto his eye-line (never stopping)
      [e - .8, .29, .07, -1.18, -.174, p], [e + 2, .285, .07, -1.25, -.174, p]]; };   // then drifting back slowly behind his head  // arc back onto his eye-line (his head in front of Him), then a breath of a push
  let CAMT = null;
  function camTable(T) { if (CAMT && CAMT.key === T.N148 + T.Q115) return CAMT; const K = camKeys(T), ch = j => K.map(k => [k[0], k[j]]), cols = [1, 2, 3, 4, 5].map(ch), t0 = T.N148 - .01, t1 = T.Q115 + 2, dt = 1 / 240, w = 4.2, z = .9;
    const tgt = t => cols.map(c => hermite(c, t)), n = Math.ceil((t1 - t0) / dt) + 1, out = new Float32Array(n * 5); let x = tgt(t0), v = tgt(t0 + dt).map((q, i) => (q - x[i]) / dt);
    for (let i = 0; i < n; i++) { const tt = t0 + i * dt, g = tgt(tt); for (let j = 0; j < 5; j++) { const a = w * w * (g[j] - x[j]) - 2 * z * w * v[j]; v[j] += a * dt; x[j] += v[j] * dt; out[i * 5 + j] = x[j]; } }
    return (CAMT = { key: T.N148 + T.Q115, t0, dt, n, out }); }
  function camAt(t, T) { const C = camTable(T), f = clamp((t - C.t0) / C.dt, 0, C.n - 1.001), i = Math.floor(f), u = f - i, g = j => lerp(C.out[i * 5 + j], C.out[(i + 1) * 5 + j], u), S = Math.sin, P2 = TAU;
    return { x: g(0) + .0022 * S(P2 * .17 * t + 1) + .0012 * S(P2 * .29 * t + 2), y: g(1) + .0016 * S(P2 * .21 * t + .5) + .001 * S(P2 * .33 * t + 3), z: g(2) + .0018 * S(P2 * .15 * t + 4),
      yaw: g(3) + .0011 * S(P2 * .13 * t + .3) + .0006 * S(P2 * .27 * t + 1.1), pitch: g(4) + .0008 * S(P2 * .19 * t + 2.2) }; }
  // focus as a distance in dioptres: Peter → the walkway (q … q+1.2) → back to Peter (his breath) → back to Him when Peter's head has gone
  function focusD(t, T, C) { const P = T.p2, dP = 1 / Math.max(.3, -C.z), dF = 1 / (Z_WALK - C.z), r = ss(P.rack1[0], P.rack1[1], t) * (1 - ss(P.rack2[0], P.rack2[1], t)) + ss(P.rack3[0], P.rack3[1], t); return lerp(dP, dF, clamp(r)); }

  // ---- Peter, from behind: head cloth tied with a band, a short tied end at the nape, the cloth falling to broad shoulders; a sliver of beard at the right jaw
  const PHEAD = [[0, .14], [.062, .13], [.098, .1], [.112, .062], [.121, .036], [.124, .018], [.114, .002], [.112, -.04], [.122, -.09], [.142, -.14], [.168, -.19], [.192, -.24], [0, -.235], [-.192, -.24], [-.168, -.19], [-.142, -.14], [-.122, -.09], [-.112, -.04], [-.114, .002], [-.124, .018], [-.121, .036], [-.112, .062], [-.098, .1], [-.062, .13]];
  const PBODY = [[-.1, -.19], [-.235, -.225], [-.305, -.29], [-.345, -.4], [-.365, -.8], [-.375, -1.7], [.36, -1.7], [.33, -.8], [.3, -.42], [.262, -.31], [.19, -.245], [.08, -.195]];
  function poseP(t, T) { const P = T.p2, br = .0028 * Math.sin(TAU * .22 * t + .4) * (1 - .6 * ss(P.crow, P.crow + .4, t) * (1 - ss(P.crow + 1.6, P.crow + 3, t)));   // even his breath catches at the crow
    const shake = kf(t, [[P.shake1[0], 0], [P.shake1[0] + .3, -.022], [P.shake1[0] + .65, .018], [P.shake1[0] + 1, 0], [P.shake2[0], 0], [P.shake2[0] + .35, -.024], [P.shake2[1], -.013]]);   // the third "no", cut off by the crow, held where it stopped
    const lift = ss(P.lift[0], P.lift[1], t), f = P.flinch, j = t < f ? 0 : t < f + .2 ? sine((t - f) / .2) : 1 - sine((t - f - .2) / .6), drop = sine(clamp((t - P.drop[0]) / (P.drop[1] - P.drop[0])));
    return { hx: shake + .006 * lift - .012 * drop, hy: .017 * lift - .4 * drop + .0095 * j + br * 1.2, hz: .2 * drop, tilt: -.06 * lift + .2 * drop + 4 * shake, by: br + .0095 * j + .045 * drop, bz: .05 * drop, drop }; }
  function peterBack(g, C, Q) { const pb = plane(C, -.04 + Q.bz); lay(g, pb); g.save(); g.translate(0, Q.by); blob(g, PBODY); g.restore();
    const ph = plane(C, Q.hz); lay(g, ph); g.translate(Q.hx, Q.hy); g.rotate(Q.tilt * .5); blob(g, PHEAD);
    }

  // ---- the walkers on the far walkway (the same robed men as B's procession; legs are feet stepping under the hem, planted feet never slide)
  function sMove(t, o) { const d1 = o.tb - o.ta; let s = o.v * (Math.min(t, o.ta) - o.tR); if (t > o.ta) { const x = clamp((t - o.ta) / d1); s += o.v * d1 * (x - x ** 3 + x ** 4 / 2); }
    if (o.tc != null && t > o.tc) { const d2 = o.td - o.tc, x = clamp((t - o.tc) / d2); s += o.v2 * d2 * (x ** 3 - x ** 4 / 2) + o.v2 * Math.max(0, t - o.td); } return s; }
  const sEnd = o => o.v * (o.ta - o.tR) + o.v * (o.tb - o.ta) / 2;
  // tR is chosen so the walk ends on a whole step: both feet planted when he stands
  const mover = (v, ta, tb, xEnd, tStart, extra = {}) => { const d = tb - ta, m = Math.ceil((ta + d / 2 - tStart) * v / STEP), tR = ta + d / 2 - m * STEP / v, o = { v, ta, tb, tR, ...extra }; o.x0 = xEnd - sEnd(o); return o; };
  function feet(s, h = STEP) { return [0, 1].map(f => { const u = s / (2 * h) + .5 * f, c = Math.floor(u), fr = u - c, sw = fr < .5 ? 0 : sine((fr - .5) * 2); return { x: 2 * h * (c + .25 - .5 * f) + 2 * h * sw, lift: fr < .5 ? 0 : Math.sin(Math.PI * (fr - .5) * 2) * .07, planted: fr < .5 }; }); }
  function drawFeet(g, pw, X0, s, side, dir) { lay(g, pw); for (const q of feet(s)) { const x = X0 - s + q.x, rx = lerp(.06, .125, side); g.beginPath(); g.ellipse(x + dir * .045 * side, FLOOR + .032 + q.lift, rx, .036, dir * q.lift * 1.4, 0, TAU); g.fill(); } }
  function poseFar(t, T) { const P = T.p2, tS = T.N148 - 2;
    const J = mover(VWALK, P.stop[0], P.stop[1], XS, tS), G1 = mover(VWALK, P.g1stop[0], P.g1stop[1], XS + .66, tS, { tc: P.g1go[0], td: P.g1go[1], v2: 1.0 }), G2 = mover(VWALK, P.g2stop[0], P.g2stop[1], XS - .7, tS, { tc: P.g2go[0], td: P.g2go[1], v2: -1.0 });
    const sJ = sMove(t, J), s1 = sMove(t, G1), s2 = sMove(t, G2), xJ = J.x0 + sJ, x1 = G1.x0 + s1, x2 = G2.x0 + s2, bob = s => .011 * (.5 - .5 * Math.cos(TAU * s / STEP));
    const side = 1 - ss(P.turnSh[0], P.turnSh[1], t), sideL = 1 - ss(P.turnSh[0] + .3, P.turnHd[1], t), headK = 1 - ss(P.turnHd[0], P.turnHd[1], t), front = sine(1 - side) * ss(P.turnSh[0] + .5, P.front + .6, t);
    const rimK = 1 - .75 * Math.sin(Math.PI * clamp((t - P.turnSh[0]) / (P.turnHd[1] - P.turnSh[0])));   // darkest at the middle of the turn
    const grip = 1 - ss(P.release, P.release + .45, t), tug = Math.sin(Math.PI * clamp((t - P.tug) / .45)) * (1 - ss(P.release, P.release + .2, t)), look1 = ss(P.g1look, P.g1look + .7, t) * (1 - ss(P.g1go[0] - .1, P.g1go[0] + .5, t));
    const turn2 = ss(P.g2turn[0], P.g2turn[1], t), down = ss(P.leave[0], P.leave[0] + 1.0, t), dim = ss(P.leave[0], P.leave[0] + 2, t);
    return { J: { x: xJ, s: sJ, bob: bob(sJ), side, sideL, headK, front, rimK }, G1: { x: x1, s: s1, bob: bob(s1), grip, tug, look1, down }, G2: { x: x2, s: s2, bob: bob(s2), turn2, down }, dim }; }

  // the far layer: back wall (shaded stone, a wall torch at the left, a cool fill low at the right), walkway, three men, the dark house front with the stone arch
  const ARCH2 = (() => { const r = rngOf(7717), P = [], j = a => a + (r() - .5) * .05; for (let y = FLOOR - .02; y < FLOOR + ARCH_SPRING; y += .2) P.push([j(XS - ARCH_W), y]); for (let a = Math.PI; a >= 0; a -= .07) P.push([XS + Math.cos(a) * ARCH_W + (r() - .5) * .045, FLOOR + ARCH_SPRING + Math.sin(a) * ARCH_W * .98 + (r() - .5) * .045]); for (let y = FLOOR + ARCH_SPRING; y > FLOOR - .02; y -= .2) P.push([j(XS + ARCH_W), y]); return P; })();
  const LEDGE = (() => { const r = rngOf(4471), P = []; let x = XS - ARCH_W - .3; while (x < XS + ARCH_W + .3) { const w = .22 + r() * .3, top = (r() - .55) * .03; P.push([x + .01, FLOOR + top], [x + w * .5, FLOOR + top + (r() - .5) * .01], [x + w - .012, FLOOR + top], [x + w - .004, FLOOR - .02 - r() * .02]); x += w; } return P; })();
  const WTORCH = [XS - 1.33, FLOOR + 1.95];
  function farLayer(o, t, T, C, F) { const pw = plane(C, Z_WALK), pa = plane(C, Z_ARCH), pbk = plane(C, Z_BACK), z = pbk.k / PXW, cx = 540 - (pbk.ox - 540) / z, cy = WY0 - (pbk.oy - 960) / z;
    const toWall = (X, Y, Z) => { const [sx, sy] = scr(C, X, Y, Z); return [cx + (sx - 540) / z, cy + (sy - 960) / z]; }, wp = (X, Y) => [540 + PXW * X, WY0 - PXW * Y];
    const f = fl(t, 1.7), torchK = lerp(1, .6, F.dim);
    // the guards' torches: in the far hand, raised; lowered as they leave
    const torchOf = (x, dir, down, bob, fs = 1) => { const W = [.31 - .06 * down, 1.18 - .2 * down], a = Math.PI / 2 - .05 - 1.2 * down, tip = [W[0] + Math.cos(a) * .7, W[1] + Math.sin(a) * .7]; return { W, a, fs, tipW: [x + dir * tip[0] * fs, FLOOR + .03 + bob + tip[1]] }; };   // lowered = pointing forward and down, well clear of the head
    const d2 = F.G2.turn2 > .5 ? -1 : 1, t1 = torchOf(F.G1.x, 1, F.G1.down, F.G1.bob), t2 = torchOf(F.G2.x, d2, F.G2.down, F.G2.bob, Math.max(.2, Math.abs(Math.cos(Math.PI * F.G2.turn2))));   // foreshortened through his turn
    const pierL = XS - ARCH_W, pierR = XS + ARCH_W, vis = x => 1 - ss(pierR - .25, pierR + .25, x) * 1 - ss(pierL + .25, pierL - .25, x) * 1;   // a torch behind a pier lights the back wall less
    const fl1 = .9 + .1 * Math.sin(t * 2.6 + 1), fl2 = .9 + .1 * Math.sin(t * 2.3 + 4);
    const flames = [[...wp(WTORCH[0], WTORCH[1] + .02), .17 * PXW, .32 * PXW, 5.1, .95 * torchK * fl(t, 3), 0]];
    for (const [tt, fk] of [[t1, fl1], [t2, fl2]]) { const [fx, fy] = toWall(tt.tipW[0], tt.tipW[1] - .02, Z_WALK), s = pw.k / z; flames.push([fx, fy, .3 * s, .5 * s, 2.3 + fk, .95 * fk * torchK, 0]); }
    const L = [{ x: wp(...WTORCH)[0], y: wp(...WTORCH)[1] + 20, z: 70, I: .85 * torchK * fl(t, 3), r: 120, c: [1, .56, .2] },
      { ...(([x, y]) => ({ x, y }))(wp(t1.tipW[0], t1.tipW[1])), z: (Z_BACK - Z_WALK) * PXW, I: .45 * fl1 * torchK * clamp(vis(F.G1.x)), r: 140, c: [1, .55, .2] },
      { ...(([x, y]) => ({ x, y }))(wp(t2.tipW[0], t2.tipW[1])), z: (Z_BACK - Z_WALK) * PXW, I: .45 * fl2 * torchK * clamp(vis(F.G2.x)), r: 140, c: [1, .55, .2] },
      { x: wp(XS - .35, 0)[0], y: wp(0, FLOOR + .45)[1], z: 250, I: .62 * lerp(1, .85, F.dim), r: 300, c: [.8, .82, .86] }];
    glFrame({ kind: 2, cam: [cx, cy, z], t, flames, L, amb: .0016, haze: .14, shD: 0, vig: .25, gain: 1.75, hzS: 2.4, hzV: 2.4 });
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.filter = 'none'; o.drawImage(glc, 0, 0); o.restore();
    massP(o, g => { lay(g, pbk); const [x, y] = WTORCH; g.beginPath(); g.moveTo(x - .012, y + .02); g.lineTo(x + .012, y + .02); g.lineTo(x + .02, y - .34); g.lineTo(x - .004, y - .34); g.closePath(); g.fill(); g.fillRect(x - .05, y - .26, .1, .028); g.fillRect(x - .05, y - .3, .016, .06); }, { fill: '#0a0807', blur: .5, rim: { c: 'rgb(255,150,70)', dx: 0, dy: 1.5, a: .5 * torchK } });
    // the walkway floor between the arch face and the back wall: a thin dark band the feet stand on
    massP(o, g => { const a = scr(C, 0, FLOOR, Z_ARCH)[1], b = scr(C, 0, FLOOR, Z_BACK)[1]; g.setTransform(1, 0, 0, 1, 0, 0); const gr = g.createLinearGradient(0, b, 0, a); gr.addColorStop(0, '#2a2a2a'); gr.addColorStop(1, '#141414'); g.fillStyle = gr; g.fillRect(-10, b, VW + 20, a - b + 2); }, { fill: '#1a1a1a' });
    // the men. Rear guard (left, a torch), Jesus (middle), front guard (right, a torch; his near hand holds Jesus' upper arm until he lets go)
    const guard = (g, G, dir, tor, gripTo) => { const b = bOf(pw); drawFeet(g, pw, G.x, G.s, 1, dir); atf(g, b, G.x, -(FLOOR + G.bob + .03), 1, 0, dir, 1.0); manBody(g, 1, 1);
      head(g, .03, 1.615, .116, lerp(.92, -.92, G.look1 || 0), { beard: true, cl: .7 }); sleeveArm(g, [.08, 1.32], tor.W, .3, .28, -1, fist, tor.a - .05); g.save(); g.translate(tor.W[0], tor.W[1]); g.rotate(tor.a - Math.PI / 2); g.fillRect(-.02, -.2, .04, .84); g.beginPath(); g.ellipse(0, .66, .036, .06, 0, 0, TAU); g.fill(); g.restore();
      if (gripTo) { const S = [-.05, 1.33], loc = [(gripTo[0] - G.x) * dir, gripTo[1] - (FLOOR + G.bob + .03)], rest = [-.06, .9], W = [lerp(rest[0], loc[0], G.grip), lerp(rest[1], loc[1], G.grip)]; sleeveArm(g, S, W, .3, .28, 1, fist, Math.PI + .2); } };
    const J = F.J, jY = FLOOR + J.bob * (1 - ss(T.p2.stop[1] - .3, T.p2.stop[1], t)) + .03, still = 1 - J.side, breathe = .0045 * still * Math.sin(t * 1.25);
    const gripPt = [J.x + .1, FLOOR + 1.2 + J.bob];
    massP(o, g => { const b = bOf(pw); g.setTransform(1, 0, 0, 1, 0, 0);
      // rear guard: turns about (through square-on) and walks off left behind the pier
      const k2 = F.G2.turn2, sd2 = Math.abs(Math.cos(Math.PI * k2)), dir2 = k2 < .5 ? 1 : -1; drawFeet(g, pw, F.G2.x, F.G2.s, sd2, dir2); atf(g, b, F.G2.x, -(FLOOR + F.G2.bob + .03), 1, 0, dir2, 1); manBody(g, sd2, sd2); head(g, .03 * sd2, 1.615, .116, .92 * sd2, { beard: true, cl: .7 });
      g.save(); g.scale(t2.fs, 1); sleeveArm(g, [.08, 1.32], t2.W, .3, .28, -1, fist, t2.a - .05); g.restore(); g.save(); g.scale(t2.fs, 1); g.translate(t2.W[0], t2.W[1]); g.rotate(t2.a - Math.PI / 2); g.fillRect(-.02, -.2, .04, .84); g.beginPath(); g.ellipse(0, .66, .036, .06, 0, 0, TAU); g.fill(); g.restore();
      const G1 = { ...F.G1, look1: F.G1.look1 }; guard(g, G1, 1, t1, F.G1.grip > .01 ? gripPt : null); }, { blur: .5, fill: '#060606', rim: { c: 'rgb(255,150,76)', dx: 2, dy: 1.6, a: .45 * torchK } });
    // Jesus: one body, square-on or side-on (B's two outlines), the head a plain round tied cloth from every angle, completely dark: no feature, no rim, nothing behind it
    massP(o, g => { const b = bOf(pw); drawFeet(g, pw, J.x, J.s, J.sideL, 1); atf(g, b, J.x, -jY, 1, .022 * still, 1, 1.0); manBody(g, J.side, J.sideL, breathe); },
      { fill: '#050505', blur: .4, rim: { c: 'rgb(154,160,166)', dx: -1.8, dy: 1.2, a: .5 * J.rimK * (1 - .4 * F.dim) },
        lit: [{ ...(([x, y]) => ({ x, y }))(scr(C, J.x, FLOOR + 1.52, Z_WALK)), r: pw.k * .36, c: '255,138,42', a: .13 * J.front * fl(t, .4), ymax: scr(C, 0, FLOOR + 1.16, Z_WALK)[1] }] });
    massP(o, g => { const b = bOf(pw); atf(g, b, J.x, -jY, 1, .022 * still, 1, 1.0); clothHead(g, lerp(.012, .03, J.headK), 1.625 + breathe - .014 * (1 - J.headK), lerp(.075, .03, J.headK)); }, { fill: '#0b0b0b', blur: .4 });
    for (const [tt, fk] of [[t1, fl1], [t2, fl2]]) { const [hx, hy] = scr(C, tt.tipW[0], tt.tipW[1] + .08, Z_WALK); haloS(o, hx, hy, pw.k * .5, '255,136,50', .3 * fk * torchK); }
    { const [hx, hy] = scr(C, WTORCH[0], WTORCH[1] + .12, Z_BACK); haloS(o, hx, hy, pbk.k * .6, '255,136,50', .32 * torchK * fl(t, 3)); }
    // the house front: the stone arch face (it hides whoever walks behind its piers), the walkway's ledge stones, the wall down to the yard
    massP(o, g => { lay(g, pa); g.beginPath(); g.rect(-30, GROUND - 1, 60, 40); g.moveTo(ARCH2[0][0], ARCH2[0][1]); for (const q of ARCH2) g.lineTo(q[0], q[1]); g.closePath(); g.fill('evenodd'); }, { fill: '#040404', blur: 1.5, rim: { c: 'rgb(120,122,126)', dx: 0, dy: 0, a: 0 } });
    massP(o, g => { lay(g, pa); g.beginPath(); g.moveTo(LEDGE[0][0], LEDGE[0][1]); for (const q of LEDGE) g.lineTo(q[0], q[1]); g.lineTo(XS + ARCH_W + .3, GROUND); g.lineTo(XS - ARCH_W - .3, GROUND); g.closePath(); g.fill(); }, { fill: '#0d0b0a', blur: .8, rim: { c: 'rgb(150,144,136)', dx: 0, dy: 2.2, a: .28 } }); }

  // ---- the yard: ground, the fire as bokeh, the men round it (dark, lit from below, no features), a few sparks
  const SP2 = Array.from({ length: 14 }, (_, i) => { const r = rngOf(1301 + i * 17); r(); return [r(), r(), r(), r()]; }), SPARK_RATE = SP2.length / (SP2.reduce((s, q) => s + 2.6 + q[3] * 1.2, 0) / SP2.length);
  function poseMen(t, T) { const P = T.p2, live = 1 - ss(P.crow - .05, P.crow + .4, t) * (1 - .5 * ss(P.crow + 2.4, P.crow + 5, t));   // the crow stops them; afterwards only breath
    return MEN2.map((m, i) => ({ sway: .012 * Math.sin(TAU * (.21 + i * .04) * t + m.seed) * live, turn: m.t0 + (m.lean ? .4 * ss(T.N148, T.N148 + .9, t) : 0), lean: m.lean ? .1 * ss(T.N148 + .05, T.N148 + .9, t) : 0 })); }
  function seated(g, br) { blob(g, [[-.4 * br, 0], [-.42 * br, .3], [-.38 * br, .6], [-.31 * br, .76], [-.16, .84], [-.06, .87], [.06, .87], [.16, .84], [.31 * br, .76], [.38 * br, .6], [.42 * br, .3], [.4 * br, 0]]); }
  function yardLayer(o, t, T, C, D, sat) { const f = fl(t, .4), heat = lerp(1, .7, ss(T.p2.drain[0], T.p2.drain[1], t)), [fx, fy, fk] = scr(C, FIRE2[0], FIRE2[1], FIRE2[2]), cF = coc(C, FIRE2[2], D);
    // ground: dark, the fire's pool of light on it
    massP(o, g => { const pa = plane(C, Z_ARCH), y0 = -pa.k * GROUND + pa.oy; g.setTransform(1, 0, 0, 1, 0, 0); g.fillRect(-20, y0, VW + 40, VH); }, { fill: '#0a0807', blur: 2,
      lit: [{ x: fx, y: fy, r: fk * 2.6, c: '255,118,38', a: .24 * f * heat }] });
    haloS(o, fx, fy - fk * .5, fk * 3.2, '255,110,34', .1 * f * heat);
    // the men round the fire, each blurred by its own distance
    const M = poseMen(t, T);
    MEN2.forEach((m, i) => { const pm = plane(C, m.z), q = M[i], [hx, hy] = scr(C, m.x, GROUND + .98, m.z); massP(o, g => { const b = bOf(pm); atf(g, b, m.x + q.sway, -GROUND, 1, q.lean * (m.x < FIRE2[0] ? 1 : -1), 1, 1); seated(g, m.br); limb(g, 0, .86, .07, 0, .94, .056); head(g, 0, .99, .112, q.turn, { beard: true, cl: .7 }); },
      { fill: '#050403', blur: coc(C, m.z, D), lit: [{ x: fx, y: fy - fk * .1, r: Math.hypot(hx - fx, hy - fy) * 1.1, c: '255,128,44', a: .4 * f * heat }] }); });
    // the charcoal bed and three low flames, all as soft light (it is out of focus most of the take)
    { const k = fk * .84 / 280; glFrame({ kind: 0, cam: [540, 960, 1], t, sky: { a: [0, 0, 0], b: [0, 0, 0], y: [0, 1, 0] }, L: [], haze: 0, shD: 0, vig: 0,
        flames: [[fx, fy + 22 * k, 280 * k, 64 * k, 0, .86 * heat, 1], [fx - 62 * k, fy + 6 * k, 118 * k, 30 * k, 2.1, .3 * f * heat, 2], [fx - 6 * k, fy + 4 * k, 142 * k, 40 * k, 4.7, .37 * f * heat, 2], [fx + 60 * k, fy + 7 * k, 110 * k, 27 * k, 7.3, .27 * f * heat, 2]] });
      o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.filter = `blur(${Math.max(.5, cF).toFixed(2)}px)`; o.drawImage(glc, 0, 0); o.restore(); }
    haloS(o, fx, fy - fk * .1, fk * 1.3, '255,122,34', .3 * f * heat);
    // sparks: one every ~.2 s, rising from the bed; each a disc as big as its blur (bokeh), fainter the larger it is
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter';
    for (const [a, b, d, e] of SP2) { const life = 2.6 + e * 1.2, ph = (t / life + a) % 1, X = FIRE2[0] + (b - .5) * .4 + Math.sin(ph * 4 + a * 9) * .06 * ph, Y = GROUND + .1 + ph * (.7 + .6 * d), Zs = FIRE2[2] + (d - .5) * .3, [sx, sy] = scr(C, X, Y, Zs), r = Math.max(1.2, coc(C, Zs, D) * .55), al = Math.sin(ph * Math.PI) * (.45 + .45 * e) * heat / (1 + (r / 4) ** 2) * 1.6;
      if (al <= .01) continue; o.fillStyle = `rgba(255,${130 + 30 * e | 0},50,${Math.min(1, al)})`; o.beginPath(); o.arc(sx, sy, r, 0, TAU); o.fill(); }
    o.restore(); }

  const haloS = (g, X, Y, R, col, a) => { const gr = g.createRadialGradient(X, Y, 0, X, Y, R); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.22, `rgba(${col},${a * .42})`); gr.addColorStop(.55, `rgba(${col},${a * .1})`); gr.addColorStop(1, `rgba(${col},0)`); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(X - R, Y - R, R * 2, R * 2); g.restore(); };
  // a dark shape drawn in screen space (fn sets its own transform), optionally lit from a point (radial light kept inside the shape), with a rim, blurred by its depth
  function massP(out, fn, { blur = 0, rim = null, alpha = 1, fill = '#040404', lit = null } = {}) { ta.setTransform(1, 0, 0, 1, 0, 0); ta.globalCompositeOperation = 'source-over'; ta.clearRect(0, 0, VW, VH); ta.fillStyle = fill; ta.save(); fn(ta); ta.restore();
    if (lit) { ta.setTransform(1, 0, 0, 1, 0, 0); ta.globalCompositeOperation = 'source-atop'; for (const L of lit) { if (!(L.a > .002)) continue; const gr = ta.createRadialGradient(L.x, L.y, 0, L.x, L.y, Math.max(1, L.r)); gr.addColorStop(0, `rgba(${L.c},${L.a})`); gr.addColorStop(1, `rgba(${L.c},0)`); ta.fillStyle = gr; ta.fillRect(0, 0, VW, L.ymax ?? VH); } ta.globalCompositeOperation = 'source-over'; }
    out.save(); out.setTransform(1, 0, 0, 1, 0, 0); out.globalCompositeOperation = 'source-over'; out.globalAlpha = alpha; out.filter = blur > .05 ? `blur(${blur.toFixed(2)}px)` : 'none'; out.drawImage(tA, 0, 0);
    if (rim && rim.a > .003) { tb.setTransform(1, 0, 0, 1, 0, 0); tb.globalCompositeOperation = 'source-over'; tb.clearRect(0, 0, VW, VH); tb.drawImage(tA, 0, 0); tb.globalCompositeOperation = 'source-in'; tb.fillStyle = rim.c; tb.fillRect(0, 0, VW, VH); tb.globalCompositeOperation = 'destination-out'; tb.drawImage(tA, rim.dx, rim.dy); tb.globalCompositeOperation = 'source-over';
      out.globalCompositeOperation = 'lighter'; out.filter = `blur(${Math.max(1.1, blur * .8 + (rim.soft || 0)).toFixed(2)}px)`; out.globalAlpha = alpha * rim.a; out.drawImage(tB, 0, 0); }
    out.restore(); }

  // ---- the whole take, one frame
  const farC = mk(VW, VH), fc2 = farC.getContext('2d');
  function take(t, T, o) { const P = T.p2, C = camAt(t, T), D = focusD(t, T, C), sat = 1 - ss(P.drain[0], P.drain[1], t), Q = poseP(t, T), F = poseFar(t, T);
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.filter = 'none'; o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.fillStyle = '#000'; o.fillRect(0, 0, VW, VH); o.restore();
    // far: drawn sharp into its own canvas, then laid in with the blur of its distance
    fc2.setTransform(1, 0, 0, 1, 0, 0); fc2.clearRect(0, 0, VW, VH); farLayer(fc2, t, T, C, F);
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); const cf = coc(C, Z_WALK, D); o.filter = cf > .3 ? `blur(${cf.toFixed(2)}px)` : 'none'; o.drawImage(farC, 0, 0); o.restore();
    yardLayer(o, t, T, C, D, sat);
    // near: Peter. The fire is in front of him: one thin orange line along the top of his head cloth and shoulders, going grey when the colour dies
    const cP = coc(C, 0, D), rimC = `rgb(${lerp(255, 150, 1 - sat) | 0},${lerp(138, 146, 1 - sat) | 0},${lerp(42, 140, 1 - sat) | 0})`, heat = lerp(1, .7, 1 - sat);
    massP(o, g => peterBack(g, C, Q), { fill: '#030303', blur: cP, rim: { c: rimC, dx: 0, dy: 3.4, a: .92 * heat * fl(t, .9), soft: 2 } });
    // finish: vignette, grain (fixed in the frame), and the colour leaving the world
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); const vg = o.createRadialGradient(540, 880, 380, 540, 900, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); o.fillStyle = vg; o.fillRect(0, 0, VW, VH);
    o.globalCompositeOperation = 'lighter'; o.fillStyle = 'rgb(5,5,5)'; o.fillRect(0, 0, VW, VH); o.globalCompositeOperation = 'overlay'; o.globalAlpha = .13; o.drawImage(grainC, 0, 0, VW, VH); o.restore();
    if (sat < .999) { ta.setTransform(1, 0, 0, 1, 0, 0); ta.globalCompositeOperation = 'copy'; ta.filter = 'none'; ta.drawImage(o.canvas, 0, 0); ta.globalCompositeOperation = 'source-over'; o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'copy'; o.filter = `saturate(${sat.toFixed(3)})`; o.drawImage(tA, 0, 0); o.restore(); } }

  // ---- the take's measurements: camera, focus, sparks every 0.25 s; joints, feet and heads per frame
  function measureTake(T, a = T.N149, b = T.Q115, dt = 1 / 30) { const rows = [], J = {}, JT = {}; let t = a; const note = (k, v) => { if (v > (J[k] || 0)) { J[k] = v; JT[k] = +t.toFixed(2); } }; let pv = null, slide = 0;
    const elbow = (S, W, l1, l2, bend) => { const q = ik(S, W, l1, l2, bend); return elbowAngle(S, q.E, q.W); };
    for (t = a; t <= b + 1e-6; t += dt) { const C = camAt(t, T), D = focusD(t, T, C), F = poseFar(t, T), Q = poseP(t, T), pw = plane(C, Z_WALK), [jx] = scr(C, XS, FLOOR + 1, Z_WALK), [hx, hy, hk] = scr(C, Q.hx, Q.hy, Q.hz);
      const gl = F.G1, W = [lerp(-.06, (F.J.x + .1 - gl.x), gl.grip), lerp(.9, 1.2 + F.J.bob - gl.bob - .03, gl.grip)], cur = { t, C, D, k: pw.k, jx, hx, hy, el: elbow([-.05, 1.33], W, .3, .28, 1), side: F.J.side, feet: [F.J, F.G1, F.G2].map(G => feet(G.s).map(q => ({ x: G.x - G.s + q.x, p: q.planted }))) };
      if (pv) { const d = (x, y) => Math.abs(x - y) / dt; note('cam m/s', Math.hypot(C.x - pv.C.x, C.y - pv.C.y, C.z - pv.C.z) / dt); note('guard elbow °/frame', Math.abs(cur.el - pv.el) * 180 / Math.PI); note('His turn (side) /frame', Math.abs(cur.side - pv.side)); note('Peter head px/frame', Math.hypot(cur.hx - pv.hx, cur.hy - pv.hy));
        cur.feet.forEach((fs, i) => fs.forEach((q, j) => { const p = pv.feet[i][j]; if (q.p && p.p) slide = Math.max(slide, Math.abs(q.x - p.x)); }));
        if (Math.abs(((t - a) / .25) - Math.round((t - a) / .25)) < dt / .5) rows.push({ t: +t.toFixed(2), u: +(t - a).toFixed(2), camMS: +(Math.hypot(C.x - pv.C.x, C.y - pv.C.y, C.z - pv.C.z) / dt).toFixed(3), yawDS: +(Math.abs(C.yaw - pv.C.yaw) / dt * 180 / Math.PI).toFixed(2), farPX: +(d(cur.jx, pv.jx)).toFixed(1), zoom: +(Math.abs(Math.log(cur.k / pv.k)) / dt).toFixed(4), focusDS: +(Math.abs(D - pv.D) / dt).toFixed(3), sparks: +SPARK_RATE.toFixed(2) }); }
      pv = cur; }
    return { rows, perFrame: Object.fromEntries(Object.entries(J).map(([k, v]) => [k, [+v.toFixed(4), JT[k]]])), plantedFootSlideM: +slide.toFixed(5) }; }

  // ---------------------------------------------------------------- shots, dissolves, finish
  const SHOT = { r1, r2a, r2b, r2e, r3, r4, r5a, r5b, r5p, r5b2, r5c, r6, take: null, blk: null };
  const plan = T => [['r1', T.start, T.N142, .55], ['r2a', T.N142, T.N143, 0], ['r2b', T.N143, T.wall, .5], ['r2e', T.wall, T.N146, .7], ['r3', T.N146, T.N148, 0], ['take', T.N148, T.Q115, 0], ['blk', T.Q115, T.end, 0]];   // approach 2: B up to N148, then one take; after Q115 (plan rows 4-5) not built in this sample
  const offA = mk(VW, VH), oa = offA.getContext('2d'), offB = mk(VW, VH), ob = offB.getContext('2d');
  const GK = { r1: 1.92, r2a: 3.5, r2b: 1.34, r2e: 1.62, r3: 2.15, r4: 1.6, r5a: 2.2, r5b: 2.4, r5p: 2.2, r5b2: 2.4, r5c: 2.2, r6: 1.9 };   // the shot's exposure (a night, but the light must read on a phone)
  function shoot(id, t, T, o) { if (id === 'take') return take(t, T, o); if (id === 'blk') { o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.filter = 'none'; o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.fillStyle = '#000'; o.fillRect(0, 0, VW, VH); o.restore(); return; }
    const sp = SHOT[id](t, T); sp.gain = (sp.gain ?? 1) * GK[id]; glFrame(sp);
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
    const arms = t => { const a = {}; const s = idOf(t); if (s === 'r1') { const q = poseR1(t, T); a.vow = elbowAngle(q.S, q.E, q.W); } if (s === 'r2b') { const q = poseSword(t, T), h = poseHeal(t, T); a.sword = elbowAngle(q.S, q.E, q.W); if (h.r > 0) a.heal = elbowAngle(h.S, h.E, h.W); } if (s === 'r3') { const q = poseR3(t, T); if (q.en > 0) a.point = elbowAngle(q.St, q.E, q.W); } if (s === 'r6') { const q = poseR6(t, T); a.armNear = elbowAngle(q.Sn, q.armN.E, q.armN.W); a.armFar = elbowAngle(q.Sf, q.armF.E, q.armF.W); a.kneeNear = elbowAngle(q.H, q.legN.E, q.legN.W); a.kneeFar = elbowAngle(q.H, q.legF.E, q.legF.W); } return { s, a }; };
    const n = Math.round((T.end - T.start) / dt); for (let i = 0; i <= n; i++) { const t = Math.min(T.start + i * dt, T.end - .001), id = idOf(t); if (id === 'take' || id === 'blk') continue; const c = SHOT[id](t, T).cam, ar = arms(t);
      if (prev && prev.id === id) { const sp = Math.hypot(c[0] - prev.c[0], c[1] - prev.c[1]) * c[2] / dt, zr = Math.abs(Math.log(c[2] / prev.c[2])) / dt; if (i % Math.round(.25 / dt) === 0 || Math.abs((i * dt) % .25) < dt / 2) rows.push([+(t - T.start).toFixed(2), id, +sp.toFixed(1), +zr.toFixed(4), id === 'r3' ? +(EM.length / 3.9).toFixed(1) : 0]); }
      if (prev && prev.ar.s === ar.s) for (const k in ar.a) if (k in prev.ar.a) { const d = Math.abs(ar.a[k] - prev.ar.a[k]); J[k] = Math.max(J[k] || 0, d); if (d > mx.v) mx = { v: d, t: +(t - T.start).toFixed(2), who: k }; }
      prev = { id, c, ar }; }
    return { rows, maxJoint: { rad: +mx.v.toFixed(3), deg: +(mx.v * 180 / Math.PI).toFixed(1), t: mx.t, who: mx.who, per: Object.fromEntries(Object.entries(J).map(([k, v]) => [k, +v.toFixed(3)])) } }; }
  return { draw, measure, measureTake };
}
