// short-scenes.js — 「kingdom」 10-3 C: three short scenes the round-10 script added (rounds/r10-pilot/batch3.md §C). One module, three scenes:
//   room   2부 N111  film 162.2 → 168.7 (6.5 s)  "베드로의 집에서는, / 열병으로 누워 있던 장모가 일어났습니다."
//   road   6부 N150  film 709.0 → 714.0 (5.0 s)  "함께 죽겠다던 그 곁에, 베드로는 없었습니다."           (was 699.2: every `at` from N135b on moved +9.8 s)
//   alley  7부 N159  film 828.7 → 835.5 (6.8 s)  "제자들과, 베드로. / 세 번 부인한 그 사람의 이름이 따로 불렸습니다."  (was 818.9, +9.8 s)
// (windows = [line, next line] from script.json `at`; every visual time comes from beats(B); only the page names the windows.)
//
// ROOM — director's approach 1 「빈 자리, 그리고 물동이」 (director3-plan.md C1), as cut down by batch3-director-fix2.md C (관리자 2026-11-26 "그래"):
//   the bed, the body and the empty mat are gone (five rounds showed code-drawn beds and bodies fail; light, shadow and far shapes work).
//   Mk 1:31 / Lk 4:39 — she rose and served them. Two shots:
//   1 (r0 → p2, N111's first piece): a dark stone room toward its door, the day in a thin line round the shut door's edges; the door opens (T.open,
//     the leaf swings in) and the light floods across the floor toward us as a real wedge (the doorway traced along a low sun onto the floor,
//     reaching out with T.reach), lighting the haze and dust. Dolly in. Refs: Ford 「The Searchers」 (the door opening on the dark room).
//     Engine: the WebGL2 ray-cast room of approach 1 (walls, beams, floor, door leaf, courtyard beyond, haze, fixed dither) without the bench.
//   2 (p2 → end): the sunlit courtyard wall, large and clear: her shadow — a woman in a veil, a water jar on her shoulder — crosses it right → left
//     in ~3 s with a natural walk (planted feet, legs inside the robe and the hem following them, the free arm swinging, the jar steady); the
//     light through the madder veil falls a little warmer. Then the wall with only the light. Push in. Refs: Lee Chang-dong 「밀양」's patch of
//     sun, the shadow walls of part 5 approach 1. Painted wall (lime wash on mud plaster, plinth stones, beaten earth) in 2D, fixed in the frame.
//   Jesus is not drawn.
// ROAD — part 6's Gothic charcoal (kit-charcoal.js = motion-skills canvas-film/kits/charcoal, vendored; charcoal-calvary.js's hand:
//   rubbed tone, eraser lifts, vine strokes, the paper tooth moving with the camera; one red point = the title board, far). After
//   「Rebecca」 (OPUSCAR 13) and 「Schindler's List」's one red. The hill with the three crosses very small at the top edge; the road comes
//   down from it toward us, empty; the wind lifts dust off the road (puffs born at an even rate, each 2.6 s) and bends the dry grass
//   on its edges in two gusts; a pale lifted pool of light lies on the empty road where someone should be (the light on the line's
//   subject: the absence). Camera: slow push-in 1.00 → 1.07 toward that pool.
// ALLEY — continues part 5's last shot (bw-rooster-p1.js S5): ALLEY_END (camera, light edge, head) imported; the alley ray-caster and
//   Peter's drawing are copied from bw-rooster-p1.js (ALLEY shader, drawPeterAlley, mass(), grain — not exported there), his pose is the
//   module's own poseAlley at S5's end (imported through its build()). It starts in the same black and white with the same frame; the
//   edge of the dawn light comes on down the left wall (from ALLEY_END.lightEdgeH), reaches his head cloth on 「베드로」 and goes on over
//   his shoulders; colour returns with that light (gold on the wall at the edge first, then on his head cloth #3b4f6b and his shoulder);
//   he lifts his head a little from his forearm (back view, no face). Camera: S5's dolly-in continued, slower (×1.75 → ×1.90).
//   Ends with the light on him (N160 is the night lake, cool blue).
// Skills used (C:/Project/motion-skills, read, nothing edited): canvas-film (SCENE-RULES, BODY-CHECK: fixed lengths / one bend side /
//   planted contacts; LESSONS: no close hands or faces, the light on the line's subject), canvas-film/kits/charcoal (via kit-charcoal.js),
//   cinematic-3d (per-pixel ray cast + in-scatter haze + bloom/grain finish, done here in one WebGL2 pass as in bw-rooster-p1),
//   cinecode references/camera-moves.md (dolly in / push in, one move per shot, eased), doodle-styles `charcoal` (lifted light, rubbed dark).
//
// Sound cue table (film seconds; for the sound stage):
//   ROOM 162.2–168.7 (fix 2; times through beats: r0 = 162.2, p2 = N111's second piece)
//     r0           a dark room: a fevered breath off screen, one fly; the day outside heard faint through the door
//     T.open[0]    the wooden bar lifted, the door creaks open; N44's village pours in (dusty road, a child, a dog, far voices); the light's hush
//     p2 − 0.3     (J-cut) a blanket thrown back, two bare steps on stone — the getting up is HEARD, not seen
//     p2           the courtyard: water poured into a jar, swallows
//     T.shadow     her light quick steps on the yard's stones (1.7 steps/s), the jar's water sloshing once; then the men's low voices off screen
//     music        part 2's 'wonder' cue (strings) opens one chord in shot 2;  L41 / Q41 follows (hard cut)
//   ROAD 709.0–714.0  wind only: a low steady wind; gust 1 at T.gust[0] (1.8 s, dry grass hiss, dust ticks on stone); gust 2 at T.gust2[0];
//     no footsteps, no voices; far, very faint: nothing from the hill (silence is the point)
//   ALLEY 828.7–835.5  the alley's room tone from part 5 (wet stone drip, far city), then
//     T.edge  (≈ a0+.3 → a1-.8)  a held high string, very soft, rising with the light (not a swell)
//     T.lift  (≈ q1-.35, 1.6 s)  his breath in as the head lifts (a man's breath, close, no sob); cloth on stone as the forearm stays
//     T.color (≈ a0+.9 → a1-.3)  a first bird far off at ≈ a0+2.5 (dawn), a second at ≈ a1-1.5
// API: const S = await import('./short-scenes.js'); const T = S.beats(B); const R = await S.build(W, H, { P5B });
//      R.draw(ctx, scene, t, T)  (scene 'room' | 'road' | 'alley', t = FILM seconds, pure in t);  R.measure(T) → tables for the report.
import * as P5 from './bw-rooster-p1.js';

const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const sine = x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
const rngOf = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const VW = 1080, VH = 1920;
export const IDS = ['N111', 'L41', 'Q41', 'N150', 'N25', 'N159', 'N160'];
export const WINDOWS = { room: ['N111', 'L41'], road: ['N150', 'N25'], alley: ['N159', 'N160'] };

// ---------------------------------------------------------------- the one table
export function beats(B) {
  const pc = B.pc || {}, T = { ...B };
  // ROOM: the second piece 「열병으로 누워 있던 장모가 일어났습니다」 starts the rise
  // ROOM (approach 1): the plan's seconds (162.2 / 163.4 / 164.3 / ≈164.9 …) mapped through the line and its second piece p2:
  //   r1 = r0 → p2 (the door opens at 44 % of r1, its light stops on the blanket at 78 %, the breath slows from there to the cut);
  //   r2 = p2 → r1: pan left 3.0 s; her shadow at p2 + 1.5 (「장모가」) for 1.4 s; she herself crosses at p2 + 2.25 for 1.2 s; the light stays.
  const r0 = B.N111, r1 = B.L41, p2 = pc.N111 ? pc.N111[1] : r0 + 2.7, r1len = p2 - r0;
  T.room = [r0, r1]; T.p2 = p2;
  T.open = [r0 + .444 * r1len, r0 + .444 * r1len + .55]; T.reach = [T.open[0], r0 + .778 * r1len]; T.calm = [T.reach[1], p2]; T.jcut = p2 - .3;
  T.reach = [T.open[0] + .05, p2 - .05]; T.shadow = [p2 + .2, Math.min(p2 + 3.6, r1 - .1)];   // fix 2: shot 1 = the door and its light; shot 2 = her shadow on the courtyard wall
  // ROAD
  const d0 = B.N150, d1 = B.N25; T.road = [d0, d1]; T.gust = [d0 + .5, d0 + 2.6]; T.gust2 = [d0 + 2.7, d0 + 4.9];
  // ALLEY: the name is said at the end of the first piece 「제자들과, 베드로.」; the head lifts as the second piece begins
  const a0 = B.N159, a1 = B.N160, q1 = pc.N159 ? pc.N159[1] : a0 + 2.2;
  T.alley = [a0, a1]; T.q1 = q1; T.edge = [a0, a1 - .5]; T.atHead = q1 - .45; T.lift = [q1 - .35, q1 + 1.3]; T.color = [a0 + .5, a1 - .4];
  return T;
}

// ---------------------------------------------------------------- shared GL bits (VS, NOISE: as bw-rooster-p1.js)
const NOISE = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
  float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }
  float fb3(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 3; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s / .875; }`;
const VS = `#version 300 es
  in vec2 aP; uniform vec4 uRect; out vec2 vUv; void main(){ vUv = aP * .5 + .5; gl_Position = vec4(uRect.xy + aP * uRect.zw, 0., 1.); }`;

// ================================================================ ROOM shader — approach 1 「빈 자리, 그리고 물동이」 (director3-plan.md C1, E3)
// World metres, y up. A real camera: position uO, yaw uYaw (− = left), pitch uPitch (− = down), focal uF px about the frame centre.
// Peter's house: back wall z = uZB with the door (uDoor: x0, x1, top) at its left; the stone bench-bed along the back wall (box uB0–uB1)
// carries a height field: in r1 (uState 0) a woman's body under a raw-wool blanket (three hills: shoulder, hip, knee; the madder veil on the
// roll at the right) breathing by uBreath; in r2 (uState 1) the empty straw mat, pressed where she lay, the blanket pushed to the foot.
// The door's light: traced back along the sun to the door plane, inside the open part of the doorway (the leaf's free edge moves with uOpen),
// and only as far along the beam as uReach (the light floods in across the floor and climbs onto the bed). Haze marched in that light.
// Through the door: a courtyard, its far wall in sun (#f4e0b8), the left part in shade. Fixed per-pixel dither, no frame noise.
const ROOM = `#version 300 es
  precision highp float; in vec2 vUv; out vec4 o; ${NOISE}
  uniform vec2 uRes; uniform vec3 uO, uSun, uB0, uB1; uniform float uYaw, uPitch, uF, uT, uGain, uVig, uXL, uXR, uZB, uYC, uOpen, uReach, uSunI, uHaze, uState, uBreath, uShoulder, uZc, uLeaf;
  uniform vec4 uDoor, uSlit, uNiche, uWin; uniform float uLW; uniform vec3 uDc, uDn;
  const vec3 SUNC = vec3(1., .902, .69);
  float stones(vec2 q, float sx, float sy){ float yy = q.y + (fb3(q * 1.3) - .5) * .1; vec2 b = vec2(q.x, yy) / vec2(sx, sy); float row = floor(b.y); b.x += hh(vec2(row, 3.)) * 2. + (vn(vec2(q.x * 1.7, row)) - .5) * .5;
    vec2 f = fract(b); return smoothstep(-.02, .1, min(min(f.x, 1. - f.x) * 1.6, min(f.y, 1. - f.y)) + (fb3(q * 11.) - .5) * .22); }
  float wallH(vec2 q){ float m = smoothstep(.84, .96, fb3(q * .55 + 3.1) + .22 * fb3(q * 2.3)); return mix(.55 + .25 * fb3(q * 3.1) + .12 * fb3(q * 17.), .3 + .55 * stones(q, .36, .21), m); }
  float floorH(vec2 q){ float m = smoothstep(.6, .7, fb3(q * .9 + 7.)); return mix(.45 + .35 * fb3(q * 2.2) + .15 * fb3(q * 13.), .4 + .5 * stones(q * vec2(1., 1.4), .5, .4), m); }
  float g2(float x, float c, float w){ float u = (x - c) / w; return exp(-u * u); }
  // the bed's height field above the mattress line (metres), and what lies there: 0 straw, 1 wool blanket, 2 madder veil, 3 linen roll
  float ell(vec2 q, vec2 c, vec2 r, float H){ vec2 d = (q - c) / r; float u = 1. - dot(d, d); return u > 0. ? H * sqrt(u) : 0.; }
  float smax(float a, float b, float k){ float h = clamp(.5 + .5 * (a - b) / k, 0., 1.); return mix(b, a, h) + k * h * (1. - h); }
  // fix 1 (b3-room-d1): the bed holds a readable lying woman — feet, shins, bent knees, thigh, hip, waist, shoulder, neck, the head on the raised
  // roll — under a raw-wool blanket that drapes down to the straw; the madder veil round the head and over the roll. Body coordinates: x along the
  // bed (q.x, head to the right), z across it about uZc. In r2 the same footprint is pressed into the straw and the blanket lies thrown back at the foot.
  float bodyH(vec2 q){ vec2 b = vec2(q.x, q.y - uZc); float h = 0., k = .11;   // one continuous body under the wool (strong soft union: no row of bumps)
    h = smax(h, ell(b, vec2(.0, .0), vec2(.3, .12), .12), k);            // feet and shins
    h = smax(h, ell(b, vec2(.42, -.08), vec2(.17, .16), .19), k);        // the bent knees, a little forward
    h = smax(h, ell(b, vec2(.86, -.01), vec2(.36, .2), .26), k);         // thigh into the hip (she lies on her side, the hip the high point)
    h = smax(h, ell(b, vec2(1.25, .02), vec2(.18, .17), .2), k);         // waist
    h = smax(h, ell(b, vec2(1.5, .02), vec2(.19, .19), .25 * (1. + uBreath)), k);   // shoulder and chest (the breath)
    return h; }
  float bedH(vec2 q0, out float kind){ vec2 q = q0 - vec2(.3, 0.), b = vec2(q.x, q.y - uZc); float h; kind = 0.;
    float roll = min(.17, ell(b, vec2(1.92, 0.), vec2(.2, .34), .26));
    if (uState < .5) {
      float body = bodyH(q), skirt = .07 * exp(-pow(b.y / .3, 2.)) * smoothstep(-.32, -.1, q.x) * smoothstep(1.72, 1.5, q.x);
      float blanket = smax(body, skirt, .06) + .008 * sin(q.x * 26. + b.y * 11. + 2. * fb3(q * 4.)) * smoothstep(.02, .1, body);   // wool folds
      float neck = ell(b, vec2(1.68, .03), vec2(.13, .14), .2), head = .14 + ell(b, vec2(1.84, .03), vec2(.15, .12), .11);
      float veil = smax(neck, head * step(.001, ell(b, vec2(1.84, .03), vec2(.2, .17), 1.)), .06) + .006 * sin(b.y * 40. + q.x * 12.);
      h = max(max(blanket, veil), roll);
      kind = veil >= h - .002 && veil > .01 ? 2. : roll >= h - .002 && roll > blanket ? 3. : blanket > .02 ? 1. : 0.;
      h += .005 * fb3(q * 23.) * step(.5, kind); }
    else {
      float foot = bodyH(q), press = -.045 * smoothstep(.0, .1, foot) + .012 * smoothstep(.0, .03, foot) * (1. - smoothstep(.03, .12, foot));   // her pressed shape, the straw pushed up at its rim
      float fx = smoothstep(-.42, -.25, q.x) * (1. - smoothstep(.12, .34, q.x)), heap = fx * (.05 + .05 * smoothstep(.3, -.2, q.x)) * smoothstep(.42, .2, abs(b.y)) * (1. + .22 * sin(q.x * 18. + .8 * sin(b.y * 5.)) + .1 * sin(b.y * 9. + q.x * 4.));   // the blanket thrown back toward the foot: long folds across the bed
      float rd = roll - .05 * exp(-pow((q.x - 1.88) / .09, 2.) - pow(b.y / .1, 2.));   // the roll keeps the dent of her head
      h = max(.02 + press, max(heap, rd)); kind = rd > heap && rd > .03 ? 3. : heap > .025 ? 1. : clamp(-press * 9., 0., .4); h += .008 * fb3(q * 19.); }   // (straw: kind 0…0.4 = how pressed)
    return h; }
  float bedHs(vec2 q){ float k; return bedH(q, k); }
  // the door's light at P (0..1)
  float doorLight(vec3 P){ float s, k, xf, pe, a0, a1, qa, qy;
    if (uLW > .5) { s = (P.x - uXL) / uSun.x; if (s < 0.) return 0.; vec3 Q = P - uSun * s; qa = Q.z; qy = Q.y; a0 = uWin.x; a1 = uWin.y; }
    else { s = (uZB - P.z) / (-uSun.z); if (s < 0.) return 0.; vec3 Q = P - uSun * s; qa = Q.x; qy = Q.y; a0 = uDoor.x; a1 = uDoor.y; }
    pe = .012 + .02 * s; xf = mix(a1, a0, uOpen);
    k = smoothstep(xf - pe, xf + pe, qa) * (1. - smoothstep(a1 - pe, a1 + pe, qa)) * (1. - smoothstep(uDoor.z - pe, uDoor.z + pe, qy)) * step(-.02, qy) * smoothstep(.0, .25, uOpen);   // (no light through the shut door)
    k *= smoothstep(uReach + .05, uReach - .5, s);
    if (k > 0.) { vec3 dir = -uSun, iv = 1. / dir, t0 = (uB0 - P) * iv, t1 = (vec3(uB1.x, uB1.y + .08, uB1.z) - P) * iv, a = min(t0, t1), b = max(t0, t1); float tn = max(max(a.x, a.y), a.z), tf = min(min(b.x, b.y), b.z); if (tn < tf && tf > .02 && tn < s && tn > .01) k = 0.; }
    // (optional) one shoulder's shadow at the light's edge: someone standing just outside the door, head never in the light's reach of the frame
    if (uShoulder > 0.) { float a = xf + .05; k *= 1. - uShoulder * .85 * smoothstep(a - .025, a + .025, qa) * (1. - smoothstep(a + .16, a + .21, qa)) * (1. - smoothstep(1.22, 1.32, qy)); }
    return k; }
  vec3 court(vec3 o3, vec3 d){   // the sunlit courtyard beyond the door
    float zw = uZB + .42 + 2., tW = (zw - o3.z) / d.z, tG = d.y < 0. ? -o3.y / d.y : 1e9; vec3 c; float shade;
    if (tG < tW) { vec3 P = o3 + d * tG; shade = smoothstep(uDoor.x - .5, uDoor.x + .4, P.x + (P.z - uZB) * .15); c = vec3(1., .86, .66) * (.9 + .25 * fb3(P.xz * 1.4)) * mix(.42, 1., shade); }
    else { vec3 P = o3 + d * tW; if (P.y > 3.4 + .3 * fb3(vec2(P.x * .8, 1.))) c = vec3(1., .97, .9) * 1.9;
      else { shade = smoothstep(uDoor.x - 1.6, uDoor.x - .5, P.x); c = vec3(.957, .878, .722) * (1.35 + .2 * fb3(P.xy * vec2(1.6, 2.6)) + .25 * wallH(P.xy * 1.3)) * mix(.45, 1., shade); } }
    return c; }
  vec3 camDir(vec2 p){ vec3 v = normalize(vec3((p.x - uRes.x * .5) / uF, -(p.y - uRes.y * .5) / uF, 1.)); float cp = cos(uPitch), sp = sin(uPitch), cy = cos(uYaw), sy = sin(uYaw);
    v = vec3(v.x, v.y * cp + v.z * sp, -v.y * sp + v.z * cp); return vec3(v.x * cy + v.z * sy, v.y, -v.x * sy + v.z * cy); }
  void main(){ vec2 fc = gl_FragCoord.xy; fc.y = uRes.y - fc.y; vec3 O = uO, d = camDir(fc);
    float tt = d.z > 0. ? (uZB - O.z) / d.z : 1e9; int id = 0; vec3 N = vec3(0., 0., -1.);
    if (d.x < 0.) { float t = (uXL - O.x) / d.x; if (t < tt) { tt = t; id = 1; N = vec3(1., 0., 0.); } }
    if (d.x > 0.) { float t = (uXR - O.x) / d.x; if (t < tt) { tt = t; id = 2; N = vec3(-1., 0., 0.); } }
    if (d.y < 0.) { float t = -O.y / d.y; if (t < tt) { tt = t; id = 3; N = vec3(0., 1., 0.); } }
    if (d.y > 0.) { float t = (uYC - O.y) / d.y; if (t < tt) { tt = t; id = 4; N = vec3(0., -1., 0.); } }
    // the bench (stone box below the mattress line)
    { vec3 iv = 1. / d, t0 = (uB0 - O) * iv, t1 = (uB1 - O) * iv, a = min(t0, t1), b = max(t0, t1); float tn = max(max(a.x, a.y), a.z), tf = min(min(b.x, b.y), b.z);
      if (tn < tf && tn > 0. && tn < tt) { tt = tn; id = 5; N = tn == a.x ? vec3(-sign(d.x), 0., 0.) : tn == a.y ? vec3(0., -sign(d.y), 0.) : vec3(0., 0., -sign(d.z)); } }
    // the mattress / blanket height field above it (marched)
    float bk = -1.; { vec3 bmin = vec3(uB0.x, uB1.y - .002, uB0.z), bmax = vec3(uB1.x, uB1.y + .3, uB1.z), iv = 1. / d, t0 = (bmin - O) * iv, t1 = (bmax - O) * iv, a = min(t0, t1), b = max(t0, t1);
      float tn = max(max(a.x, a.y), a.z), tf = min(min(b.x, b.y), b.z);
      if (tn < tf && tf > 0. && tn < tt) { tn = max(tn, 0.); float pt = tn;
        for (int i = 0; i < 56; i++) { float t = mix(tn, tf, float(i) / 55.); vec3 P = O + d * t; if (P.y <= uB1.y + bedHs(P.xz)) { float lo = pt, hi = t; for (int j = 0; j < 6; j++) { float m = (lo + hi) * .5; vec3 Q = O + d * m; if (Q.y <= uB1.y + bedHs(Q.xz)) hi = m; else lo = m; }
          if (hi < tt) { tt = hi; id = 6; vec3 Q = O + d * hi; float e = .006; N = normalize(vec3(-(bedHs(Q.xz + vec2(e, 0.)) - bedHs(Q.xz - vec2(e, 0.))) / (2. * e), 1., -(bedHs(Q.xz + vec2(0., e)) - bedHs(Q.xz - vec2(0., e))) / (2. * e))); bedH(Q.xz, bk); } break; } pt = t; } } }
    // the door leaf, hinged at the doorway's left edge, swung into the room by uLeaf (rad)
    { vec3 hA = vec3(uDoor.x, 0., uZB - .02), ax = vec3(cos(uLeaf), 0., -sin(uLeaf)), nL = vec3(-ax.z, 0., ax.x); float dn = dot(d, nL);
      if (abs(dn) > 1e-4) { float t = dot(hA - O, nL) / dn; vec3 P = O + d * t; float u = dot(P - hA, ax); if (t > 0. && t < tt && u > 0. && u < uDoor.y - uDoor.x && P.y < uDoor.z) { tt = t; id = 7; N = dn < 0. ? nL : -nL; } } }
    vec3 P = O + d * tt, col = vec3(0.);
    bool door = id == 0 && P.x > uDoor.x && P.x < uDoor.y && P.y < uDoor.z;
    if (door) {
      float tz = (uZB + .42 - O.z) / d.z, tj = 1e9;
      if (d.x < 0.) tj = min(tj, (uDoor.x - O.x) / d.x); if (d.x > 0.) tj = min(tj, (uDoor.y - O.x) / d.x); if (d.y > 0.) tj = min(tj, (uDoor.z - O.y) / d.y);
      if (tj < tz) { vec3 Q = O + d * tj; float k = smoothstep(uZB, uZB + .42, Q.z); col = vec3(.62, .52, .4) * (.05 + .95 * k * k) * (.8 + .4 * fb3(Q.zy * 5.)) * mix(.1, 1., uOpen); }
      else col = court(O + d * tz, d) * mix(.02, 1., uOpen);
    } else {
      vec2 q; vec3 Tg, Bt; float h, hx, hy, e = .006, amp = .9;
      if (id == 0 || (id == 5 || id == 7) && abs(N.z) > .5) { q = P.xy; Tg = vec3(1., 0., 0.); Bt = vec3(0., 1., 0.); }
      else if (id == 1 || id == 2 || id == 5 && abs(N.x) > .5) { q = P.zy; Tg = vec3(0., 0., 1.); Bt = vec3(0., 1., 0.); }
      else { q = P.xz; Tg = vec3(1., 0., 0.); Bt = vec3(0., 0., 1.); }
      vec3 alb;
      if (id == 6) { // straw, wool, madder veil, linen
        float n = fb3(P.xz * vec2(9., 30.)); alb = bk > 2.5 ? vec3(.68, .62, .52) * (.85 + .2 * n) : bk > 1.5 ? vec3(.557, .231, .18) * (.85 + .2 * n) : bk > .5 ? vec3(.42, .37, .31) * (.82 + .2 * fb3(P.xz * 14.)) : vec3(.64, .52, .27) * (.62 + .45 * fb3(P.xz * vec2(70., 5.)) + .1 * fb3(P.xz * vec2(9., 200.))) * (1. - 1.9 * bk);   // pressed straw is darker: her shape shows
        amp = 0.; hx = hy = 0.; }
      else if (id == 7) { alb = vec3(.32, .22, .14) * (.7 + .4 * fb3(P.xy * vec2(3., 40.))); amp = 0.; hx = hy = 0.; }
      else if (id == 3) { h = floorH(q); hx = floorH(q + vec2(e, 0.)) - h; hy = floorH(q + vec2(0., e)) - h; alb = vec3(.5, .41, .32) * (.62 + .5 * h); }
      else if (id == 4) { float bm = smoothstep(.06, .0, abs(fract(P.z / .7) - .5) - .36); alb = mix(vec3(.12, .09, .07), vec3(.3, .24, .18), bm) * (.7 + .5 * fb3(P.xz * vec2(6., 1.))); hx = hy = 0.; amp = 0.; }
      else if (id == 5) { alb = vec3(.55, .47, .38) * (.3 + .55 * stones(q, .3, .19) + .15 * fb3(q * 9.)) * .7; hx = hy = 0.; amp = 0.; }
      else { h = wallH(q); hx = wallH(q + vec2(e, 0.)) - h; hy = wallH(q + vec2(0., e)) - h; alb = vec3(.29, .255, .225) * (.55 + .62 * h);   // dark lime plaster #2b2622–#4a4038
        { float cx = (uNiche.x + uNiche.y) * .5, hw = (uNiche.y - uNiche.x) * .5, u = (P.x - cx) / hw, top = uNiche.w - hw * (1. - sqrt(max(0., 1. - u * u)));
          float inN = (1. - smoothstep(.96, 1., abs(u))) * smoothstep(uNiche.z - .005, uNiche.z + .005, P.y) * (1. - smoothstep(top - .01, top + .01, P.y));
          alb *= 1. - inN * (.45 + .25 * smoothstep(uNiche.z, top, P.y)); }   // the wall niche: an arched recess, darker toward its top
        if (id == 0 && P.y < .3) alb *= .8; }
      float leak = 0.; if (id == 7) { vec3 hA2 = vec3(uDoor.x, 0., uZB - .02), ax2 = vec3(cos(uLeaf), 0., -sin(uLeaf)); float lu = dot(P - hA2, ax2), wd = uDoor.y - uDoor.x;
        leak = max(max(smoothstep(.025, .0, lu), smoothstep(wd - .025, wd, lu)), smoothstep(uDoor.z - .03, uDoor.z, P.y)) * (1. - smoothstep(.0, .12, uOpen)); }   // the day round the shut door's edges
      vec3 Nb = amp > 0. ? normalize(N - (Tg * hx + Bt * hy) / e * amp * .08) : N;
      float s = id == 4 ? 0. : doorLight(P), sd = s * max(dot(Nb, -uSun), 0.);
      // the slit of the shutter, high on the back wall: a thin line of day and its faint fill
      vec3 Sc = vec3((uSlit.x + uSlit.y) * .5, (uSlit.z + uSlit.w) * .5, uZB - .05), Ls = Sc - P; float ds = length(Ls); Ls /= ds; float fillS = (.25 + .75 * max(dot(Nb, Ls), 0.)) * max(-Ls.z, .2) / (1. + ds * ds / 2.5);
      // the open door's daylight spill (soft, grows as the door opens) and the warm bounce off the lit floor and bed
      vec3 Ld = uDc - P; float dd = length(Ld); Ld /= dd; float dl = max(dot(Nb, Ld), 0.) * max(dot(-Ld, uDn), 0.) / (1. + dd * dd / 1.4) * uOpen;
      col = alb * (vec3(.03, .027, .026) + SUNC * uSunI * sd + vec3(1., .86, .7) * .13 * fillS + vec3(1., .82, .6) * .28 * dl + vec3(1., .74, .5) * .05 * uSunI * smoothstep(2.5, 4.5, uReach) * (.4 + .6 * max(Nb.y, 0.)));
      col += vec3(1., .85, .6) * 1.4 * leak;
      if (id == 0) { float fx = smoothstep(uSlit.x - .03, uSlit.x + .03, P.x) * (1. - smoothstep(uSlit.y - .03, uSlit.y + .03, P.x)), fy = smoothstep(uSlit.z - .012, uSlit.z + .012, P.y) * (1. - smoothstep(uSlit.w - .012, uSlit.w + .012, P.y));
        float slats = 1. - .75 * (1. - smoothstep(.0, .012, abs(fract((P.x - uSlit.x) / ((uSlit.y - uSlit.x) / 3.)) - .5) - .44));
        vec2 sc = vec2((uSlit.x + uSlit.y) * .5, (uSlit.z + uSlit.w) * .5), dv = (P.xy - sc) / vec2(.55, .22);
        col = mix(col, vec3(1., .9, .72) * .62 * slats, fx * fy) + vec3(1., .86, .66) * .035 * exp(-dot(dv, dv)); }   // a soft shuttered slit, not a lamp
    }
    // haze in the door's light (fixed dither per pixel), and a faint glow round the slit
    float hz = 0., j = hh(fc * .73 + 3.1), tm = min(tt, 14.); for (int i = 0; i < 26; i++) { float s = (float(i) + j) / 26. * tm; vec3 Q = O + d * s; if (Q.z > uZB) break; float k = doorLight(Q); if (k <= 0.) continue; hz += k * (.45 + 1.1 * fb3(vec2(Q.x * 1.6 + Q.z * .7 + uT * .06, Q.y * 2.2 - uT * .04))); }
    col += SUNC * hz * tm / 26. * uHaze * uSunI;
    vec3 c = 1. - exp(-col * uGain); c = pow(c, vec3(.4545)); c = mix(c, c * vec3(1.04, .99, .9), .5);
    vec2 v = (fc / uRes - vec2(.5, .47)) * vec2(1.05, .9); c *= 1. - uVig * smoothstep(.25, .78, length(v));
    o = vec4(c, 1.); }`;

// ================================================================ ALLEY shader — copied from bw-rooster-p1.js (ALLEY + the alley bake), with the dawn colour added:
// uWarm turns the light gold (strongest at the moving edge), uSat brings colour back (in the light first: lit wall, the slit), uHb the edge (m on the left wall)
const BAKE_ALLEY = `#version 300 es
  precision highp float; uniform vec2 uMarg; out vec4 o; ${NOISE}
  // bw-rooster-p1.js surfaces[3] is baked with kind 2 (stone), amp 1.5
  float stone(vec2 p){ float yy = p.y + (fb(p * .0021) - .5) * 58.; vec2 b = vec2(p.x, yy) / vec2(312., 172.); float row = floor(b.y); b.x += hh(vec2(row, 3.)) * 2. + (vn(vec2(p.x * .0026, row)) - .5) * .42; vec2 f = fract(b), id = floor(b);
    float e = min(min(f.x, 1. - f.x) * 1.82, min(f.y, 1. - f.y)) + (fb(p * .022) - .5) * .17; return smoothstep(-.01, .085, e) * .2 + (.36 + .2 * hh(id + .7)) + fb(p * .0085 + id) * .38 + fb(p * .05) * .16 - .1; }
  void main(){ vec2 p = gl_FragCoord.xy - uMarg; float e = 1.5, h = stone(p), hx = stone(p + vec2(e, 0.)) - stone(p - vec2(e, 0.)), hy = stone(p + vec2(0., e)) - stone(p - vec2(0., e));
    vec3 N = normalize(vec3(-hx * 1.5, -hy * 1.5, 1.)); float big = fb(p * .0021 + 3.1), al = (.56 + .5 * h) * mix(.72, 1.18, big);
    o = vec4(N.xy * .5 + .5, clamp(al * .72, 0., 1.), h); }`;
const ALLEY = `#version 300 es
  precision highp float; in vec2 vUv; out vec4 o; ${NOISE}
  uniform sampler2D tS; uniform vec2 uRes, uVP; uniform vec3 uCam, uLd; uniform float uF, uEye, uWL, uWR, uWH, uZE, uHb, uT, uGain, uVig, uAmb, uIb, uWarm, uSat; uniform vec3 uOcc;
  vec4 tex(vec2 w) { return texture(tS, w * 250. / vec2(1360., 2200.)); }
  vec3 dawn(float y) { return mix(vec3(.66, .68, .71), vec3(.2, .21, .22), smoothstep(.0, 5., y)) * mix(vec3(1.), vec3(1.16, .98, .78), uWarm * .8); }
  const vec2 SLX = vec2(-.32, .26); const float SLH = 5.2;
  void main(){ vec2 fc = gl_FragCoord.xy; fc.y = uRes.y - fc.y; vec2 p = (fc - uRes * .5) / uCam.z + uCam.xy;
    vec3 d = vec3((p.x - uVP.x) / uF, -(p.y - uVP.y) / uF, 1.);
    float tL = d.x < 0. ? -uWL / d.x : 1e9, tR = d.x > 0. ? uWR / d.x : 1e9, tF = d.y < 0. ? uEye / -d.y : 1e9;
    if (uEye + tL * d.y > uWH) tL = 1e9; if (uEye + tR * d.y > uWH) tR = 1e9;
    float tt = min(min(tL, tR), tF); vec3 col = vec3(0.); float litK = 0.;
    if (tt > uZE) { float y = uEye + uZE * d.y, x = uZE * d.x;
      if (y < 0.) col = vec3(0.);
      else if (y < uWH && x > -uWL && x < uWR) { bool slit = x > SLX.x && x < SLX.y && y < SLH; vec4 s = tex(vec2(x * 1.4 + 9., y)); col = slit ? dawn(y) * 1.25 : s.b * vec3(uAmb) * (1.2 + 2.4 * exp(-pow((x - (SLX.x + SLX.y) * .5) / .7, 2.))); litK = slit ? .8 : 0.;
      } else col = vec3(.03, .031, .034) * (1. + 1.8 * smoothstep(.0, .25, d.y));
    } else {
      vec3 P = vec3(0., uEye, 0.) + d * tt; float endK = exp(-(uZE - P.z) / 5.), slitK = exp(-pow(P.x / 1.1, 2.)) * exp(-(uZE - P.z) / 7.);
      if (tt == tF) { vec4 s = tex(vec2(P.x * 1.5 + 3., P.z * 1.5)); vec2 n = s.rg * 2. - 1.; float al = s.b * .6, wet = smoothstep(.45, .75, fb(P.xz * vec2(2.2, .9) + 3.)), gut = smoothstep(.1, .02, abs(P.x + .05));
        col = al * vec3(uAmb) * (.35 + .05 * smoothstep(.9, .0, abs(P.x))) * (1. + .3 * slitK) * (1. - .45 * gut);
        vec3 r = vec3(d.x, -d.y, 1.); vec3 refl = vec3(0.);
        if (r.x < 0.) { float zl = P.z + (-uWL - P.x) / r.x, yl = (zl - P.z) * r.y; if (zl < uZE && yl < uWH) refl = mix(vec3(.84, .86, .9), vec3(1., .8, .52), uWarm) * uIb * .12 * smoothstep(uHb - .05, uHb + .05, yl); }
        col += refl * mix(.01, .1, max(wet, gut * .8)) * (.6 + .4 * (1. - abs(n.x)));
        litK = .35 * length(refl) * 4.;
      } else { bool lw = tt == tL; vec4 s = tex(vec2(P.z, P.y) + (lw ? vec2(0.) : vec2(31., 7.))); vec2 n = s.rg * 2. - 1.; vec3 N = normalize(vec3(lw ? 1. : -1., n.y * 1.4, n.x * 1.4)); float al = s.b, sky = .3 + .7 * smoothstep(.0, uWH, P.y);
        float door = (!lw && P.z > 9.2 && P.z < 10.4 && P.y < 2.25) ? .25 : 1.;
        col = al * vec3(uAmb) * sky * (1. + 2.6 * endK + 1.5 * slitK) * (lw ? 1. : .55) * door;
        if (lw) { float soft = .03 + .02 * max(0., uWH - P.y), k = smoothstep(uHb - soft, uHb + soft, P.y);
          // the dawn turns gold, most at the moving edge (the first light), less above it
          vec3 lc = mix(vec3(.84, .86, .9), vec3(1.28, .74, .32), uWarm * (.45 + .55 * exp(-max(0., P.y - uHb) / 1.1)));
          col += al * lc * uIb * max(dot(N, uLd), 0.) * k; litK = k; }
      }
      if (tt < uZE) { vec3 Q = vec3(0., uEye, 0.) + d * tt; float occ = exp(-pow((Q.z - uOcc.z) / .55, 2.) - pow(max(0., Q.y - uOcc.y) / 1.0, 2.) - pow((Q.x - uOcc.x) / .6, 2.) * (tt == tF ? 1. : 0.)); col *= 1. - .55 * occ * (tt == tR ? 0. : 1.); }
      col += vec3(.6, .62, .66) * .014 * smoothstep(8., uZE, tt);
    }
    vec3 c = 1. - exp(-col * uGain); c = pow(c, vec3(.4545)); vec2 v = (fc / uRes - vec2(.5, .44)) * vec2(1.05, .92); c *= 1. - uVig * smoothstep(.22, .74, length(v));
    float lum = dot(c, vec3(.3, .59, .11)), sat = clamp(uSat * (.5 + 1.1 * clamp(litK, 0., 1.)), 0., 1.);
    o = vec4(mix(vec3(lum), c, sat), 1.); }`;

// ---------------------------------------------------------------- 2D craft (spline, hull, limb: copied from bw-rooster-p1.js)
function spline(g, P, close = true) { const n = P.length, at = i => close ? P[(i + n) % n] : P[clamp(i, 0, n - 1)]; g.moveTo(P[0][0], P[0][1]);
  for (let i = 0; i < (close ? n : n - 1); i++) { const a = at(i - 1), b = at(i), c = at(i + 1), d = at(i + 2); g.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]); }
  if (close) g.closePath(); }
const blob = (g, P) => { g.beginPath(); spline(g, P); g.fill(); };
function limb(g, ax, ay, ra, bx, by, rb) { const a = Math.atan2(by - ay, bx - ax); g.beginPath(); g.arc(ax, ay, ra, a + Math.PI / 2, a - Math.PI / 2); g.arc(bx, by, rb, a - Math.PI / 2, a + Math.PI / 2); g.closePath(); g.fill(); }
function hull(P) { const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1)); }
const fillHull = (g, P) => { const Hh = hull(P).filter((q, i, A) => { const n = A[(i + 1) % A.length]; return Math.hypot(n[0] - q[0], n[1] - q[1]) > 2.5; }); g.beginPath(); spline(g, Hh); g.fill(); };
// 2D two-bone IK: elbow/knee on the side `side` picks (a function scoring the two solutions: the lower score wins)
function ik2(S, W, l1, l2, pick) { let dx = W[0] - S[0], dy = W[1] - S[1], d = Math.hypot(dx, dy) || 1e-5; const mx = (l1 + l2) * .999; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), ux = dx / d, uy = dy / d, bx = S[0] + ux * a, by = S[1] + uy * a;
  const e1 = [bx - uy * h, by + ux * h], e2 = [bx + uy * h, by - ux * h]; return { E: pick(e1) <= pick(e2) ? e1 : e2, W: [S[0] + dx, S[1] + dy] }; }
const ang2 = (A, B, C) => { const a = Math.atan2(A[1] - B[1], A[0] - B[0]), c = Math.atan2(C[1] - B[1], C[0] - B[0]); return Math.abs(Math.atan2(Math.sin(a - c), Math.cos(a - c))); };
const add2 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const hermite = (keys, x) => { const n = keys.length; if (x <= keys[0][0]) return keys[0][1]; if (x >= keys[n - 1][0]) return keys[n - 1][1]; let i = 0; while (x > keys[i + 1][0]) i++; const [a, va] = keys[i], [b, vb] = keys[i + 1], h = b - a, u = (x - a) / h, m = (p, q) => (keys[q][1] - keys[p][1]) / (keys[q][0] - keys[p][0]), m0 = i > 0 ? m(i - 1, i + 1) : 0, m1 = i < n - 2 ? m(i, i + 2) : 0, u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * va + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * vb + (u3 - u2) * h * m1; };

export async function build(W, H, opt = {}) {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const glc = mk(VW, VH), gl = glc.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  if (!gl) throw new Error('webgl2 is required');
  const prog = (fs) => { const sh = (ty, src) => { const q = gl.createShader(ty); gl.shaderSource(q, src); gl.compileShader(q); if (!gl.getShaderParameter(q, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(q)); return q; };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'aP'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const cache = {}; return { p, u: n => cache[n] ?? (cache[n] = gl.getUniformLocation(p, n)) }; };
  const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const PR = prog(ROOM), PB = prog(BAKE_ALLEY), PA = prog(ALLEY);
  // the alley's stone, baked once (as bw-rooster-p1.js surfaces[3]: mirrored repeat, mipmapped)
  const MARG = 140, SW = VW + MARG * 2, SH = VH + MARG * 2;
  const alleyTex = (() => { const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, SW, SH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx, 0); gl.viewport(0, 0, SW, SH); gl.useProgram(PB.p);
    gl.uniform4f(PB.u('uRect'), 0, 0, 1, 1); gl.uniform2f(PB.u('uMarg'), MARG, MARG); gl.disable(gl.BLEND); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(fb);
    gl.bindTexture(gl.TEXTURE_2D, tx); gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    return tx; })();
  // offscreen frame + scratch layers
  const off = mk(VW, VH), o = off.getContext('2d'), hzC = mk(VW, VH), hzx = hzC.getContext('2d');
  const tA = mk(VW, VH), ta = tA.getContext('2d'), tB = mk(VW, VH), tb = tB.getContext('2d'), tC = mk(VW, VH), tcx = tC.getContext('2d');
  const bl = mk(VW >> 2, VH >> 2), blx = bl.getContext('2d');
  // fine film grain, fixed in the frame (bw-rooster-p1.js)
  const grainC = mk(VW >> 1, VH >> 1); { const q = grainC.getContext('2d'), im = q.createImageData(grainC.width, grainC.height), r = rngOf(4177); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 96; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } q.putImageData(im, 0, 0); }
  const grain = (g, a) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'overlay'; g.globalAlpha = a; g.drawImage(grainC, 0, 0, VW, VH); g.restore(); };
  const camT = (g, c) => g.setTransform(c[2], 0, 0, c[2], VW / 2 - c[0] * c[2], VH / 2 - c[1] * c[2]);
  const toScr = (c, p) => [(p[0] - c[0]) * c[2] + VW / 2, (p[1] - c[1]) * c[2] + VH / 2];
  // a dark mass with an optional rim on its lit side (bw-rooster-p1.js mass(), drawn in base px under camera c)
  function mass(out, c, fn, { blur = 0, rim = null, alpha = 1, fill = '#040404' } = {}) { ta.setTransform(1, 0, 0, 1, 0, 0); ta.clearRect(0, 0, VW, VH); ta.fillStyle = fill; camT(ta, c); fn(ta);
    out.save(); out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = alpha; if (blur > .05) out.filter = `blur(${blur.toFixed(2)}px)`; out.drawImage(tA, 0, 0);
    if (rim) { tb.setTransform(1, 0, 0, 1, 0, 0); tb.globalCompositeOperation = 'source-over'; tb.clearRect(0, 0, VW, VH); tb.drawImage(tA, 0, 0); tb.globalCompositeOperation = 'source-in'; tb.fillStyle = rim.c; tb.fillRect(0, 0, VW, VH); tb.globalCompositeOperation = 'destination-out'; tb.drawImage(tA, rim.dx, rim.dy); tb.globalCompositeOperation = 'source-over';
      out.globalCompositeOperation = 'lighter'; out.filter = `blur(${(rim.blur ?? Math.max(1.1, blur * .8)).toFixed(2)}px)`; out.globalAlpha = alpha * rim.a; out.drawImage(tB, 0, 0); }
    out.restore(); }
  // a soft bloom: the bright parts, blurred at quarter size, screened back
  function bloom(g, k, thr = 'brightness(.55) contrast(2.6)') { blx.setTransform(1, 0, 0, 1, 0, 0); blx.filter = `${thr} blur(7px)`; blx.clearRect(0, 0, bl.width, bl.height); blx.drawImage(off, 0, 0, bl.width, bl.height); blx.filter = 'none';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen'; g.globalAlpha = k; g.imageSmoothingEnabled = true; g.drawImage(bl, 0, 0, VW, VH); g.restore(); }
  function present(ctx) { const sc = Math.max(W / VW, H / VH), dw = VW * sc, dh = VH * sc; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(off, (W - dw) / 2, (H - dh) * (H > W ? .5 : .36), dw, dh); ctx.restore(); }

  // ============================================================== ROOM — fix 2 (batch3-director-fix2.md C; 관리자 2026-11-26 "그래"): two shots, no bed
  // Shot 1 (r0 → p2, N111's first piece): a dark stone room seen toward its door; the door opens (the leaf swings in) and the day floods in
  //   across the floor toward us as a real wedge (the door's opening traced along the sun onto the floor, reaching out with T.reach) and lights
  //   the haze. One slow move: dolly in. Nothing on the floor to read. (The WebGL2 ray-cast room of approach 1, the bed taken out.)
  // Shot 2 (p2 → end): the sunlit courtyard wall, large and clear: her shadow — a woman in a veil carrying a water jar on her shoulder — crosses
  //   it right → left with a natural walk (robe swinging with the legs, the free arm swinging, the jar steady on the shoulder), ~3 s; the light
  //   through her madder veil falls a soft red-brown; then the wall with only the light. One slow move: push in. She rose, and she serves.
  const RM = { XL: -2.7, XR: 2.9, ZB: 3.6, YC: 2.7, door: [-1.62, -.82, 1.9], b0: [60, 0, 60], b1: [61, .45, 61], zc: 60, slit: [60, 61, 60, 61], niche: [60, 61, 60, 61] };
  const dirTo = (a, b) => { const v = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...v); return v.map(q => q / l); };
  RM.sun = dirTo([(RM.door[0] + RM.door[1]) / 2, 1.0, RM.ZB], [-.62, 0, .55]);   // the low sun through the door, toward us and down: the wedge runs to the camera
  const VEIL = '#8e3b2e';
  const R1 = { O: [-.3, 1.4, -1.25], target: [(RM.door[0] + RM.door[1]) / 2 + .25, .8, RM.ZB], pitch: -13 * Math.PI / 180, F: 1150 };
  R1.yaw = Math.atan2(R1.target[0] - R1.O[0], R1.target[2] - R1.O[2]);
  function camRoomAt(t, T) { const u = clamp((t - T.room[0]) / (T.p2 - T.room[0])), d = .32 * (.3 * u + .7 * sine(u));   // dolly in (already moving at the cut in)
    return { O: [R1.O[0] + Math.sin(R1.yaw) * d, R1.O[1], R1.O[2] + Math.cos(R1.yaw) * d], yaw: R1.yaw, pitch: R1.pitch, F: R1.F, shot: t < T.p2 ? 1 : 2 }; }
  const projC = (c, P) => { const vx = P[0] - c.O[0], vy = P[1] - c.O[1], vz = P[2] - c.O[2], cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), x1 = vx * cy - vz * sy, z1 = vx * sy + vz * cy, cp = Math.cos(c.pitch), sp = Math.sin(c.pitch), y2 = vy * cp - z1 * sp, z2 = vy * sp + z1 * cp;
    return [VW / 2 + c.F * x1 / z2, VH / 2 - c.F * y2 / z2, c.F / z2]; };
  function doorLightJS(P, open, reach) { const d = RM.sun, s = (RM.ZB - P[2]) / (-d[2]); if (s < 0) return 0; const Qx = P[0] - d[0] * s, Qy = P[1] - d[1] * s, xf = lerp(RM.door[1], RM.door[0], open);
    return (Qx > xf && Qx < RM.door[1] && Qy > 0 && Qy < RM.door[2] ? 1 : 0) * clamp((reach - s) / .5) * ss(0, .25, open); }
  const openAt = (t, T) => sine((t - T.open[0]) / (T.open[1] - T.open[0]));
  const reachAt = (t, T) => 7.5 * hermite([[0, 0], [.45, .5], [1, 1]], clamp((t - T.reach[0]) / (T.reach[1] - T.reach[0])));   // the light runs across the floor to us
  const MOTES_R = Array.from({ length: 70 }, (_, i) => { const r = rngOf(331 + i * 17); r(); return [r(), r(), r(), r() * TAU, .4 + .6 * r()]; });
  function roomFrame(t, T) {
    if (t >= T.p2) return wallFrame(t, T);
    const c = camRoomAt(t, T), open = openAt(t, T), reach = reachAt(t, T);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, VW, VH); gl.disable(gl.BLEND); gl.useProgram(PR.p);
    const u1 = (n, v) => gl.uniform1f(PR.u(n), v), u3 = (n, v) => gl.uniform3f(PR.u(n), v[0], v[1], v[2]);
    gl.uniform4f(PR.u('uRect'), 0, 0, 1, 1); gl.uniform2f(PR.u('uRes'), VW, VH); u3('uO', c.O); u1('uYaw', c.yaw); u1('uPitch', c.pitch); u1('uF', c.F);
    u1('uXL', RM.XL); u1('uXR', RM.XR); u1('uZB', RM.ZB); u1('uYC', RM.YC); u1('uT', t); u1('uOpen', open); u1('uReach', reach); u1('uLeaf', open * 1.3);
    u1('uSunI', 3.2); u1('uHaze', .16); u1('uGain', 2.1); u1('uVig', .5); u1('uState', 0); u1('uBreath', 0); u1('uShoulder', 0); u1('uZc', RM.zc);
    gl.uniform4f(PR.u('uDoor'), RM.door[0], RM.door[1], RM.door[2], 0); gl.uniform4f(PR.u('uSlit'), ...RM.slit); gl.uniform4f(PR.u('uNiche'), ...RM.niche); u3('uSun', RM.sun); u1('uLW', 0);
    gl.uniform4f(PR.u('uWin'), 0, 0, 0, 0); u3('uDc', [(RM.door[0] + RM.door[1]) / 2, .95, RM.ZB]); u3('uDn', [0, 0, -1]); u3('uB0', RM.b0); u3('uB1', RM.b1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.filter = 'none'; o.drawImage(glc, 0, 0); o.restore();
    const id = g => g.setTransform(1, 0, 0, 1, 0, 0);
    // dust in the light only (fixed motes drifting; a constant count), soft by their distance
    o.save(); id(o); o.globalCompositeOperation = 'lighter';
    for (const [a, b, cc, ph, br] of MOTES_R) { const P = [lerp(-2.0, .4, a) + .05 * Math.sin(t * .31 + ph), lerp(.1, 1.9, b) + .04 * Math.sin(t * .23 + ph * 1.7), lerp(.4, 3.4, cc)];
      const k = doorLightJS(P, open, reach); if (k <= .01) continue; const q = projC(c, P); if (q[2] <= 0) continue; const df = 1.3 + Math.abs(q[2] - 300) * .004, al = .24 * br * k;
      const gr = o.createRadialGradient(q[0], q[1], 0, q[0], q[1], df * 2.2); gr.addColorStop(0, `rgba(255,232,186,${al})`); gr.addColorStop(1, 'rgba(255,232,186,0)'); o.fillStyle = gr; o.fillRect(q[0] - df * 2.2, q[1] - df * 2.2, df * 4.4, df * 4.4); }
    o.restore();
    bloom(o, .45); grain(o, .1);
    return { c, open, reach };
  }
  // ---- shot 2: the courtyard wall in the sun (painted once at 1.12× for the push), her shadow walking across it
  const WT = mk(Math.round(VW * 1.12), Math.round(VH * 1.12));
  { const g = WT.getContext('2d'), w = WT.width, h = WT.height, r = rngOf(9071), base = Math.round(h * .74);
    let gr = g.createLinearGradient(0, 0, 0, base); gr.addColorStop(0, '#d9bb8c'); gr.addColorStop(.25, '#efd6a8'); gr.addColorStop(1, '#f4e0b8'); g.fillStyle = gr; g.fillRect(0, 0, w, base);
    g.filter = 'blur(5px)'; for (let i = 0; i < 900; i++) { const x = r() * w, y = r() * base, rr = 6 + r() * 60, d = r() < .5; g.fillStyle = d ? `rgba(150,110,70,${.03 + .05 * r()})` : `rgba(255,248,230,${.04 + .06 * r()})`; g.beginPath(); g.ellipse(x, y, rr * (1 + r()), rr, r() * 3, 0, TAU); g.fill(); } g.filter = 'none';   // lime wash over mud plaster
    g.strokeStyle = 'rgba(120,85,55,.18)'; g.lineWidth = 1.6; for (let i = 0; i < 9; i++) { let x = r() * w, y = r() * base * .9; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 7; k++) { x += (r() - .5) * 50; y += 10 + r() * 30; g.lineTo(x, y); } g.stroke(); }   // a few hairline cracks
    for (let row = 0; row < 3; row++) for (let i = 0; i < 14; i++) { const x = (i + (row % 2) * .5) * w / 13, y = base - 70 - row * 62; g.fillStyle = 'rgba(160,120,80,.07)'; g.fillRect(x + 4, y, w / 13 - 8, 54); }   // the plinth's stones under the wash
    gr = g.createLinearGradient(0, base - 30, 0, base + 30); gr.addColorStop(0, 'rgba(90,60,40,0)'); gr.addColorStop(1, 'rgba(90,60,40,.35)'); g.fillStyle = gr; g.fillRect(0, base - 30, w, 60);
    gr = g.createLinearGradient(0, base, 0, h); gr.addColorStop(0, '#c9a77a'); gr.addColorStop(1, '#a8885f'); g.fillStyle = gr; g.fillRect(0, base, w, h - base);   // the beaten earth of the yard
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${r() < .5 ? '90,65,40' : '240,220,180'},${.08 + .1 * r()})`; g.beginPath(); g.ellipse(r() * w, base + r() * (h - base), 2 + r() * 7, 1 + r() * 3, 0, 0, TAU); g.fill(); }
    WT.base = base; }
  // the woman's shadow shape (side view, facing −x; metres, ground at 0): planted feet, legs inside the robe, the hem following them, a free arm
  // swinging against the legs, the other arm raised to the jar on her shoulder, the veil to the middle of her back with its end swinging
  function womanShadow(g, P, t, t0, x0, v, part) { const f = 1.7, Tc = 2 / f, L = v * Tc, xb = tt => x0 - v * (tt - t0), cyc = (t - t0) / Tc, X = xb(t), bob = .022 * Math.cos(cyc * 2 * TAU), sway = Math.sin(cyc * TAU);
    const foot = i => { const cc = cyc + i * .5, n = Math.floor(cc), u = cc - n, tl = t0 + (n - i * .5) * Tc, xl = xb(tl) - .3 * L, xl2 = xb(tl + Tc) - .3 * L;
      if (u < .62) return [xl, 0]; const k = (u - .62) / .38; return [lerp(xl, xl2, sine(k)), .07 * Math.sin(Math.PI * k)]; };
    const fillP = pts => { g.beginPath(); spline(g, pts.map(P)); g.fill(); }, s1 = Math.abs(P([1, 0])[0] - P([0, 0])[0]), cap = (a, b, ra, rb) => { const A = P(a), B = P(b); limb(g, A[0], A[1], ra * s1, B[0], B[1], rb * s1); };
    const hip = [X, .93 + bob], legs = [0, 1].map(i => { const ft = foot(i), A = [ft[0] + .03, ft[1] + .08]; return { A, K: ik2(hip, A, .47, .45, K => K[0]).E, ft }; });
    if (part !== 'veil') {
      for (const l of legs) { cap(hip, l.K, .085, .065); cap(l.K, l.A, .062, .04); fillP([[l.A[0] + .03, l.A[1] - .02], [l.A[0] - .02, l.A[1] + .02], [l.A[0] - .15, l.ft[1] + .02], [l.A[0] - .16, l.ft[1]], [l.A[0] + .04, l.ft[1]]]); }   // legs with body, feet
      const xs = legs.map(l => l.A[0]), lo = Math.min(...xs), hi = Math.max(...xs), kx = legs.map(l => l.K[0]);
      fillP([[X - .14, 1.4 + bob], [X - .15, 1.05 + bob], [lerp(X - .16, Math.min(...kx) - .07, .6), .55], [lo - .07, .17], [lo - .02, .13], [hi + .05, .14], [hi + .09, .18], [lerp(X + .17, Math.max(...kx) + .07, .6), .55], [X + .16, 1.0 + bob], [X + .12, 1.42 + bob]]);   // the robe swinging with the legs
      const S = [X - .02, 1.38 + bob], ah = sway * .45, H2 = [S[0] + Math.sin(ah) * .37, S[1] - Math.cos(ah) * .37], a2 = ik2(S, H2, .29, .26, E => -E[0]); cap(S, a2.E, .055, .045); cap(a2.E, a2.W, .045, .035);   // the free arm, swinging
      const jar = [X + .03, 1.86 + bob * 1.1], J = P(jar);
      g.save(); g.translate(J[0], J[1]); g.rotate(.32); g.beginPath(); g.ellipse(0, 0, .14 * s1, .18 * s1, 0, 0, TAU); g.fill(); g.fillRect(-.045 * s1, -.27 * s1, .09 * s1, .12 * s1); g.fillRect(-.07 * s1, -.29 * s1, .14 * s1, .03 * s1); g.restore();   // the jar on her shoulder, tilted back
      const H1 = [jar[0] - .1, jar[1] - .04], a1 = ik2(S, H1, .29, .26, E => E[0] - E[1] * .2); cap(S, a1.E, .055, .045); cap(a1.E, a1.W, .045, .035);   // the arm raised to it, the hand on the jar
      fillP([[X - .1, 1.46 + bob], [X - .12, 1.6 + bob], [X - .02, 1.69 + bob], [X + .1, 1.62 + bob], [X + .1, 1.46 + bob]]); }   // the head
    if (part !== 'body') { const sw = .03 * Math.sin(cyc * 2 * TAU + .9);
      fillP([[X - .12, 1.5 + bob], [X - .115, 1.65 + bob], [X - .02, 1.72 + bob], [X + .1, 1.66 + bob], [X + .15 + sw, 1.36 + bob], [X + .17 + sw * 1.4, 1.1 + bob], [X + .1, 1.12 + bob], [X + .05, 1.38 + bob], [X - .06, 1.45 + bob]]); }   // the veil
    return X; }
  function wallFrame(t, T) { const u = clamp((t - T.p2) / (T.room[1] - T.p2)), z = lerp(1.0, 1.06, .35 * u + .65 * sine(u)), id = g => g.setTransform(1, 0, 0, 1, 0, 0);
    o.save(); id(o); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.filter = 'none';
    const dw = WT.width / 1.12 * z, dh = WT.height / 1.12 * z; o.drawImage(WT, (VW - dw) / 2, (VH - dh) * .55, dw, dh); o.restore();
    o.save(); id(o); o.globalCompositeOperation = 'multiply'; o.fillStyle = 'rgb(176,158,140)'; o.fillRect(0, 0, VW, VH); o.restore();   // late-afternoon sun, not noon glare (mean ≈ 100)
    const toS = (x, y) => [(x - VW / 2) * z + VW / 2, (y - VH * .55) * z + VH * .55];
    const baseY = (VH - dh) * .55 + WT.base / 1.12 * z;
    // the eave's shadow along the top and a branch's shadow on the upper left, swaying slowly (the wall lives)
    o.save(); id(o); o.globalCompositeOperation = 'multiply'; o.fillStyle = 'rgb(196,170,140)'; o.filter = 'blur(16px)'; o.beginPath(); o.moveTo(-50, -50); o.lineTo(VW + 50, -50); for (let x = VW + 50; x >= -50; x -= 40) o.lineTo(x, 150 * z + 14 * Math.sin(x * .02) + 6 * Math.sin(x * .07)); o.closePath(); o.fill();
    o.restore();
    // her shadow: right → left; the light through the madder veil falls a soft red-brown, the rest of her shadow cool and dark
    const k = 480 * z, x0 = 1.55, Pw = p => { const v = [VW / 2 + (p[0] - 0) * k, baseY - p[1] * k]; return v; };
    if (t > T.shadow[0] - .05 && t < T.shadow[1] + .05) {
      tcx.setTransform(1, 0, 0, 1, 0, 0); tcx.globalCompositeOperation = 'source-over'; tcx.clearRect(0, 0, VW, VH);
      tcx.fillStyle = 'rgb(92,70,54)'; womanShadow(tcx, Pw, t, T.shadow[0], x0, SHADOW_V, 'body'); tcx.fillStyle = 'rgb(106,76,62)'; womanShadow(tcx, Pw, t, T.shadow[0], x0, SHADOW_V, 'veil');
      o.save(); id(o); o.globalCompositeOperation = 'multiply'; o.filter = 'blur(2.2px)'; o.globalAlpha = .93; o.drawImage(tC, 0, 0); o.restore();
      // her feet's short shadows on the ground at the wall's foot
      o.save(); id(o); o.globalCompositeOperation = 'multiply'; o.filter = 'blur(5px)'; o.fillStyle = 'rgba(110,84,60,.6)'; const X = x0 - SHADOW_V * (t - T.shadow[0]), q = Pw([X, 0]); o.beginPath(); o.ellipse(q[0], q[1] + 18, .3 * k, 16, 0, 0, TAU); o.fill(); o.restore(); }
    bloom(o, .3); grain(o, .09);
    return { z };
  }
  const SHADOW_V = 1.0;   // m/s (a calm walk with a full jar): she crosses the 1.9 m of wall in view in about 3 s

  // ============================================================== ROAD (charcoal)
  const C = window.Charcoal; let RD = null;
  function buildRoad() { if (RD) return RD; C.init({ tooth: 77, fog: 21 }); const SC = C.SC, Wd = C.W, Hd = C.H, V = Pilot.ori === 'v';
    // layout (authored at 1080×1920; landscape keeps the numbers around the centre)
    const ox = (Wd - 1080 * SC) / 2, X = x => ox + x * SC, Y = y => y * SC * (V ? 1 : 1);
    const crest = Y(V ? 360 : 300);
    // the road's centre line from the crest down to us, and its half width (perspective)
    const RC = [[560, 352], [536, 430], [505, 520], [540, 640], [610, 780], [590, 930], [500, 1080], [455, 1240], [500, 1420], [600, 1640], [680, 1960]].map(([x, y]) => [X(x), Y(y)]);
    const hwAt = y => lerp(5, 360, Math.pow(clamp((y - crest) / (Y(1960) - crest)), 1.45)) * SC;
    const cl = y => { for (let i = 1; i < RC.length; i++) if (y <= RC[i][1]) { const a = RC[i - 1], b = RC[i], k = (y - a[1]) / (b[1] - a[1]); return lerp(a[0], b[0], sine(k) * .2 + k * .8); } return RC[RC.length - 1][0]; };
    const edge = (sd, n = 60) => { const P = []; for (let i = 0; i <= n; i++) { const y = lerp(RC[0][1], RC[RC.length - 1][1], i / n); P.push([cl(y) + sd * hwAt(y) * (1 + .12 * (Pilot.noise(y * .01, sd + 3) - .5)), y]); } return P; };
    const L = edge(-1), R = edge(1);
    const plate = C.sheet(1.08), x = plate.getContext('2d'), R0 = Pilot.rng(150); let sd = 1500;
    // sky: heavy rubbed tone, dragged strokes, cloud masses; a paler band behind the hill
    // fix 1: one even tone over sky and ground first, the ground darkened on top of it (no overlap band, so no dark line on the crest)
    x.fillStyle = `rgba(${C.TONE},.6)`; x.fillRect(0, 0, Wd, Hd);
    for (let k = 0; k < 26; k++) { const y = R0() * crest * .95, x0 = -120 + R0() * Wd * .6; C.sweep(x, C.seg([x0, y], [x0 + (360 + R0() * 700) * SC, y + (R0() - .5) * 90 * SC], 8), (30 + R0() * 50) * SC, .04 + R0() * .06, sd++); }
    for (let k = 0; k < 8; k++) C.blob(x, R0() * Wd, R0() * crest * .7, (240 + R0() * 260) * SC, (80 + R0() * 70) * SC, .2, (R0() - .5) * .3);
    C.blob(x, Wd * .5, crest - 30 * SC, 820 * SC, 120 * SC, .4, 0, C.smudgeW); C.blob(x, Wd * .55, crest - 90 * SC, 600 * SC, 90 * SC, .3, 0, C.smudgeW);
    // the hill and the ground: dark slopes either side of the road
    const ridge = []; for (let i = 0; i <= 40; i++) { const xx = lerp(-80, Wd + 80, i / 40); ridge.push([xx, crest + 24 * SC * Math.pow((xx - X(560)) / (Wd * .5), 2) * 3 + (Pilot.noise(xx / Wd * 3, 4) - .5) * 22 * SC]); }
    C.smudgeFill(x, ridge.concat([[Wd + 80, Hd + 80], [-80, Hd + 80]]), .2, 151, 14);
    for (let k = 0; k < 40; k++) { const yy = lerp(crest + 30 * SC, Hd, Math.pow(R0(), .8)), xx = R0() * Wd; C.sweep(x, C.seg([xx - 160 * SC, yy], [xx + 160 * SC, yy + (R0() - .5) * 40 * SC], 6), (14 + R0() * 26) * SC, .06 + R0() * .08, sd++); }
    // a paler slope near us on the right (so the bottom is not one slab), lifted unevenly
    for (let k = 0; k < 10; k++) C.blob(x, lerp(Wd * .1, Wd * .95, R0()), lerp(crest + 200 * SC, Hd, R0()), (160 + R0() * 200) * SC, (40 + R0() * 40) * SC, .1 + R0() * .08, (R0() - .5) * .2, C.smudgeW);
    // the road: lifted out of the tone with the eraser, worn ruts in vine, stones
    C.lift(x, L.concat(R.slice().reverse()), .34);
    x.save(); C.poly(x, L.concat(R.slice().reverse())); x.clip();
    for (let k = 0; k < 70; k++) { const yy = lerp(crest, Hd, Math.pow(R0(), .7)), hw = hwAt(yy), xx = cl(yy) + (R0() - .5) * 1.6 * hw; C.sweep(x, C.seg([xx, yy - 30 * SC], [xx + (R0() - .5) * 20 * SC, yy + 70 * SC * (.4 + yy / Hd)], 4), Math.max(3, hw * .09), .05 + R0() * .05, sd++, C.stickW); }
    for (let k = 0; k < 9; k++) C.blob(x, cl(lerp(crest, Hd, R0())), lerp(crest + 100 * SC, Hd, R0()), 120 * SC, 40 * SC, .1, 0);
    for (const f of [-.42, .38]) { const pts = []; for (let i = 0; i <= 50; i++) { const yy = lerp(crest + 40 * SC, Hd + 20, i / 50); pts.push([cl(yy) + f * hwAt(yy), yy]); } C.vine(x, pts, 3 * SC, .32, sd++ , `rgba(${C.TONE},1)`, .15); }
    for (let k = 0; k < 60; k++) { const yy = lerp(crest + 60 * SC, Hd, Math.pow(R0(), .6)), hw = hwAt(yy), xx = cl(yy) + (R0() - .5) * 1.8 * hw, r = (2 + R0() * 7) * SC * (.3 + yy / Hd); x.fillStyle = `rgba(0,0,0,${.25 + R0() * .3})`; x.beginPath(); x.ellipse(xx, yy, r * 1.4, r * .7, 0, 0, TAU); x.fill(); }
    x.restore();
    for (const E of [L, R]) C.vine(x, E.filter((_, i) => i % 2 === 0), 3 * SC, .28, sd++, '#000', .3);
    // the three crosses, very small on the crest (the middle a little taller); their title board gets the red point after develop
    const CR = [[X(500), 34], [X(560), 44], [X(618), 32]].map(([cx, h]) => { const base = crest + 24 * SC * Math.pow((cx - X(560)) / (Wd * .5), 2) * 3 + 2 * SC; return { x: cx, y: base, h: h * SC, a: h * .28 * SC }; });
    for (const k of CR) { C.vine(x, [[k.x, k.y], [k.x, k.y - k.h]], 3.6 * SC, .95, sd++, '#000', 0); C.vine(x, [[k.x - k.a, k.y - k.h * .74], [k.x + k.a, k.y - k.h * .74]], 3 * SC, .95, sd++, '#000', 0); }
    // dry grass: tufts along both edges and in the near slopes, stems drawn per frame (they bend with the wind)
    const GR = [], gr = Pilot.rng(707);
    for (let i = 0; i < 170; i++) { const near = i < 110, yy = near ? lerp(Hd * .52, Hd * 1.02, Math.pow(gr(), .7)) : lerp(crest + 80 * SC, Hd * .55, gr()), sdx = gr() < .5 ? -1 : 1, hw = hwAt(yy);
      const bx = cl(yy) + sdx * hw * (1 + .05 + gr() * (near ? .9 : .5)), h = (near ? 40 + gr() * 70 : 10 + gr() * 18) * SC * (.4 + .9 * yy / Hd), n = near ? 3 + (gr() * 4 | 0) : 2;
      for (let j = 0; j < n; j++) GR.push({ x: bx + (gr() - .5) * 18 * SC * (yy / Hd), y: yy, h: h * (.7 + .5 * gr()), lean: (gr() - .4) * .35, w: (near ? 1.4 + gr() * 1.4 : .9 + gr() * .6) * SC, a: near ? .5 + gr() * .35 : .35 + gr() * .25, ph: gr() * TAU, seed: 9000 + GR.length, near }); }
    // dust puffs: born at an even rate (one every .4 s), each lives 2.6 s, lifted off the road and carried right by the wind
    const DU = Array.from({ length: 40 }, (_, i) => { const r = Pilot.rng(1300 + i * 7); r(); const yy = lerp(Hd * .42, Hd * .92, r()); return { b: i * .4, y: yy, x0: cl(yy) + (r() - .5) * 1.4 * hwAt(yy), s: (.6 + .7 * r()) * (.4 + yy / Hd), ph: r() * TAU }; });
    const pool = [cl(Y(1000)), Y(1000)];
    RD = { plate, CR, GR, DU, cl, hwAt, crest, pool, SC, Wd, Hd, X, Y }; return RD; }
  const wind = (t, T) => .55 + 1.0 * Math.pow(Math.sin(Math.PI * clamp((t - T.gust[0]) / (T.gust[1] - T.gust[0]))), 2) + .85 * Math.pow(Math.sin(Math.PI * clamp((t - T.gust2[0]) / (T.gust2[1] - T.gust2[0]))), 2);
  const zoomRoad = (t, T) => { const v = clamp((t - T.road[0]) / (T.road[1] - T.road[0])); return lerp(1, 1.13, .5 * v + .5 * sine(v)); };   // never at rest inside the shot
  function roadFrame(ctx, t, T) { const D = buildRoad(), SC = D.SC, Wd = D.Wd, Hd = D.Hd, zm = zoomRoad(t, T), tt = t - T.road[0], wd = wind(t, T);
    C.setCam({ zm, zc: [D.pool[0], D.pool[1] - 120 * SC], ox: 0, oy: 0 });
    const x = C.begin(); C.applyCam(x); C.drawSheet(x, D.plate);
    // clouds drifting with the wind (the sky lives without anything fast)
    { const r = Pilot.rng(88); for (let i = 0; i < 12; i++) { const span = Wd + 900 * SC, xx = ((r() * span + (9 + 6 * r()) * SC * tt * (1 + wd * .5)) % span) - 450 * SC, yy = r() * D.crest * .85, rx = (200 + r() * 240) * SC;
      C.blob(x, xx, yy, rx, rx * (.25 + .15 * r()), .1 + .08 * r(), (r() - .5) * .3, r() < .4 ? C.smudgeW : C.smudge); } }
    // the light: a pale pool lifted on the empty road where someone should be, and a soft slant toward it from a gap in the cloud
    { const br = .8 + .2 * Math.sin(tt * .9), p = D.pool; C.blob(x, p[0], p[1], 300 * SC, 90 * SC, .42 * br, -.05, C.smudgeW); C.blob(x, p[0] - 10 * SC, p[1] - 10 * SC, 170 * SC, 50 * SC, .35 * br, -.05, C.smudgeW);
      C.wedge(x, [[p[0] - 60 * SC, D.crest - 260 * SC], [p[0] + 90 * SC, D.crest - 260 * SC], [p[0] + 260 * SC, p[1] + 10 * SC], [p[0] - 250 * SC, p[1] + 10 * SC]], [p[0], D.crest - 250 * SC], [p[0], p[1]], .16 * br, { blur: 10, reach: 1, falloff: [[0, .3], [.6, .7], [1, .2]] }); }
    // dust lifting off the road in the wind
    for (const d of D.DU) { const age = ((tt - d.b) % 16 + 16) % 16; if (age > 2.6) continue; const k = age / 2.6, a = Math.sin(Math.PI * k) * .2 * (.5 + .7 * wd);
      const xx = d.x0 + (40 + 160 * wd) * SC * k * d.s + 14 * SC * Math.sin(age * 2 + d.ph), yy = d.y - (20 + 120 * k) * SC * d.s;
      C.blob(x, xx, yy, (40 + 120 * k) * SC * d.s, (16 + 40 * k) * SC * d.s, a, -.2, C.smudgeW); }
    // dust in sheets, blown across the road (long thin lifts moving with the wind; fixed in the world, only drifting with t)
    { const r = Pilot.rng(612); for (let i = 0; i < 14; i++) { const span = Wd + 1400 * SC, y0 = lerp(Hd * .36, Hd * .95, r()), v = (230 + 160 * r()) * SC, ph = r() * span, a0 = .16 + .08 * r();
      const xx = ((ph + v * (tt + .35 * wd * tt)) % span) - 700 * SC; for (let j = 0; j < 3; j++) C.blob(x, xx - j * 150 * SC, y0 - j * 8 * SC - 12 * SC * Math.sin(tt * 1.6 + i), (240 - 50 * j) * SC * (.5 + y0 / Hd), (18 + 6 * j) * SC * (.5 + y0 / Hd), a0 * (.55 + .6 * wd) * (1 - .25 * j), -.06, C.smudgeW); } }
    // grass bends with the wind (each stem a 3-point vine from its root; no re-seeding per frame, so no boil)
    for (const g of D.GR) { const sway = (wd * (.32 + .22 * Math.sin(tt * 2.7 - g.x * .011 / SC + g.ph * .3)) + .05 * Math.sin(tt * 1.3 + g.ph)) * (g.near ? 1 : .6), ang = g.lean + sway;   // waves run through the grass with the gust
      const pts = [[g.x, g.y], [g.x + Math.sin(ang * .5) * g.h * .5, g.y - Math.cos(ang * .5) * g.h * .5], [g.x + Math.sin(ang) * g.h, g.y - Math.cos(ang) * g.h * .96]];
      C.vine(x, pts, g.w, g.a, g.seed, '#000', 0); }
    C.fog(x, t, [[D.crest + 120 * SC, .32, 18 + 20 * wd], [D.crest + 380 * SC, .22, 26 + 30 * wd], [Hd * .7, .16, 34]]);
    // the one colour's place, taken under the drawing's camera; then the paper is developed with a FIXED tooth (the same grain every frame, fix 1)
    const k = D.CR[1], p = C.toScr([k.x, k.y - k.h * .9]), r = Pilot.rng(41);
    C.setCam({ zm: 1, zc: [Wd / 2, Hd / 2], ox: 0, oy: 0 }); C.develop(ctx);
    // the one colour: the title board on the middle cross, a red point (far, never close)
    C.pastel(ctx, [{ pts: C.pastelPath([p[0] - 3.5 * SC * zm, p[1]], [p[0] + 3.5 * SC * zm, p[1] + .5], 4 * SC * zm, 3.5 * SC * zm, 5, r), pr: 1 }].map(s => ({ pts: s.pts.map(q => ({ s: q.p, w: q.w, j1: q.j1, j2: q.j2 })), pr: s.pr })), 1);
    return { zm, wd }; }

  // ============================================================== ALLEY (part 5's S5 continued)
  // part 5's module: its build() fills ALLEY_END (camera, light edge, head) and gives poseAlley; one frame of S5 is drawn once as the reference
  const P5B = opt.P5B; const T5 = P5.beats(P5B); const R5 = await P5.build(VW, VH);
  const refC = mk(VW, VH), refx = refC.getContext('2d'); R5.draw(refx, T5.black[0] - .02, T5);   // also runs ensureEnd → ALLEY_END filled
  const AE = P5.ALLEY_END, AF = AE.focal, AH = AE.eye, AVP = AE.vanishing, AWL = 1.08, AWR = 1.08, AWH = 7.4, AZE = 26;
  const projA = P => [AVP[0] + AF * P[0] / P[2], AVP[1] + AF * (AH - P[1]) / P[2], AF / P[2]];
  const V = { add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k], len: a => Math.hypot(a[0], a[1], a[2]), lerp: (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)] };
  V.nrm = a => V.mul(a, 1 / (V.len(a) || 1)); V.dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const Q0 = R5.poseAlley(T5.end, T5);   // S5's last pose (sunk on his heels, forehead on the left forearm flat on the wall)
  // his head lifts a little off the forearm (k 0..1): the head turns about the neck toward up and away from the wall; the neck rises 2 cm; a slow breath
  function poseAlleyN(t, T) { const k = ss(T.lift[0], T.lift[1], t) + .12 * sine((t - T.lift[1]) / (T.alley[1] - T.lift[1])), br = .005 * Math.sin((t - T.alley[0]) * TAU / 3.4) * ss(T.alley[0], T.alley[0] + 1, t);
    const N = V.add(Q0.N, [0, .02 * k + br, .006 * k]), up = V.nrm([.35, 1, -.05]), Bd = V.nrm(V.lerp(Q0.Bd, up, .38 * k)), C = V.add(N, V.mul(Bd, .15));
    const SL = V.add(Q0.SL, [0, br * .6 + .01 * k, 0]), SR = V.add(Q0.SR, [0, br * .6 + .01 * k, 0]);
    return { ...Q0, N, C, Bd, SL, SR, k }; }
  // Peter in the alley (bw-rooster-p1.js drawPeterAlley, copied; split into the tunic and the head cloth for the colour that returns)
  function drawPeterAlley(g, Q, part = 'all') { const p = projA, cap = (A, B, ra, rb) => { const a = p(A), b = p(B); limb(g, a[0], a[1], ra * a[2], b[0], b[1], rb * b[2]); }, ball = (A, r) => { const a = p(A); g.beginPath(); g.arc(a[0], a[1], r * a[2], 0, TAU); g.fill(); };
    if (part !== 'cloth') {
      const pts = [], add = A => { const a = p(A); pts.push([a[0], a[1]]); }, ring = (c, r, n = 10, ax1 = Q.left, ax2 = Q.f) => { for (let i = 0; i < n; i++) { const a = i / n * TAU; add(V.add(c, V.add(V.mul(ax1, Math.cos(a) * r), V.mul(ax2, Math.sin(a) * r * .8)))); } };
      ring(V.add(Q.N, V.mul(Q.D, -.06)), .24, 12, Q.left, V.mul(Q.f, .55)); ring(V.add(Q.P, V.mul(Q.D, .22)), .19, 10); ring(Q.P, .18, 10);
      if (Q.dp > .001) for (const A of [Q.legL.E, Q.legR.E, Q.aL, Q.aR, V.add(Q.N, V.mul(Q.f, -.15)), V.add(V.lerp(Q.P, Q.N, .5), V.mul(Q.f, -.19)), V.add(Q.P, V.mul(Q.f, -.17))]) add(V.lerp(Q.P, A, Q.dp));
      const midA = V.mul(V.add(Q.aL, Q.aR), .5), midK = V.mul(V.add(Q.legL.E, Q.legR.E), .5), hemStand = V.add(midA, [0, .3, 0]), hemKneel = V.add(midK, [0, .1, 0]), hem = V.lerp(hemStand, hemKneel, Q.kneel);
      ring(hem, lerp(.18, .17, Q.kneel), 12, V.nrm(V.sub(Q.legR.E, Q.legL.E)), Q.f);
      fillHull(g, pts);
      { const gk = ss(.4, .85, Q.kneel); if (gk > .001) { pts.length = 0; const kc = midK, L2 = A => add(V.lerp(kc, A, gk)); for (let i = 0; i < 10; i++) { const an = i / 10 * TAU; add(V.add(hem, V.add(V.mul(V.nrm(V.sub(Q.legR.E, Q.legL.E)), Math.cos(an) * .17), V.mul(Q.f, Math.sin(an) * .136)))); }
        for (const A of [V.add(Q.legL.E, [0, .08, 0]), V.add(Q.legR.E, [0, .08, 0]), V.add(Q.legL.E, [0, -.03, 0]), V.add(Q.legR.E, [0, -.03, 0]), V.add(Q.aL, [0, .07, 0]), V.add(Q.aR, [0, .07, 0]), V.add(Q.aL, [0, -.08, 0]), V.add(Q.aR, [0, -.08, 0]), V.add(Q.tL, [0, -.01, 0]), V.add(Q.tR, [0, -.01, 0]), V.add(Q.P, [0, -.12, 0]), V.lerp(midK, V.add(Q.P, V.mul(Q.D, .3)), Q.dp), V.lerp(midK, V.add(Q.P, V.add(V.mul(Q.D, .2), V.mul(Q.f, .12))), Q.dp), V.lerp(midK, V.add(Q.N, V.mul(Q.f, -.15)), Q.dp), V.lerp(midK, V.add(V.lerp(Q.P, Q.N, .5), V.mul(Q.f, -.19)), Q.dp), V.lerp(midK, V.add(Q.P, V.mul(Q.f, -.17)), Q.dp)]) L2(A);
        fillHull(g, pts); } }
      for (const [leg, a, tp, Hh] of [[Q.legL, Q.aL, Q.tL, Q.HL], [Q.legR, Q.aR, Q.tR, Q.HR]]) { cap(Hh, leg.E, .08, .062); cap(leg.E, a, .058, .046); cap(a, tp, .046, .032); }
      cap(V.add(Q.SL, V.mul(Q.left, .05)), V.sub(Q.SR, V.mul(Q.left, .05)), .095, .095); cap(Q.SL, Q.armL.E, .068, .058);   // broad, level shoulders
      cap(Q.armL.E, Q.armL.W, .056, .05); if (Q.kneel < .5) { cap(Q.SR, Q.armR.E, .062, .052); cap(Q.armR.E, Q.armR.W, .05, .042); }
      cap(Q.N, V.lerp(Q.N, Q.C, .5), .08, .077); }
    if (part !== 'tunic') { cap(V.lerp(Q.N, Q.C, .45), Q.C, .078, .075); ball(Q.C, .118); cap(V.add(Q.C, V.mul(Q.f, -.05)), V.add(V.lerp(Q.C, Q.N, .7), V.mul(Q.f, -.05)), .085, .066); } }   // fix 2: a short tied head cloth, ending above the shoulder line (never long like hair)
  // the light's lower edge in the alley: on the left wall at height Hb; on things off the wall it lies a little higher (the light comes over the right wall)
  const SLOPE = .42, litY = (X, Hb) => Hb + (X + AWL) * SLOPE;
  const hbN = (t, T) => { const e0 = AE.lightEdgeH, a = T.alley[0], q = clamp((t - T.edge[0]) / (T.edge[1] - T.edge[0]));
    // from S5's last edge down to his mid back: an even start (no jump), steady through the name, easing to a stop near the end
    // keyed so the edge is at the top of his head cloth at T.atHead (on 「베드로」)
    const yHead = Q0.C[1] + .118 - (Q0.C[0] + AWL) * SLOPE, yEnd = Q0.N[1] - .38 - (Q0.N[0] + AWL) * SLOPE, qh = clamp((T.atHead - T.edge[0]) / (T.edge[1] - T.edge[0]), .1, .9), kh = clamp((yHead - e0) / (yEnd - e0), .05, .95);
    return lerp(e0, yEnd, .25 * q + .75 * hermite([[0, 0], [qh, kh], [1, 1]], q)); };   // (a linear part: the edge never stops inside the shot)
  const camAlleyN = (t, T) => { const v = clamp((t - T.alley[0]) / (T.alley[1] - T.alley[0])), E = .5 * v + .5 * sine(v), c0 = AE.cam; return [lerp(c0[0], 452, E), lerp(c0[1], 842, E), c0[2] * Math.exp(Math.log(1.9 / 1.75) * E)]; };
  const MOTES_A = Array.from({ length: 40 }, (_, i) => { const r = rngOf(2207 + i * 31); r(); return [-.9 + r() * 1.8, 2.0 + r() * 4.5, 4.2 + r() * 7, r() * 6.28, .5 + r() * .5]; });
  function alleyFrame(t, T) { const cam = camAlleyN(t, T), Hb = hbN(t, T), Q = poseAlleyN(t, T), wk = ss(T.color[0], T.color[0] + 2.6, t) * .9 + .1 * ss(T.color[0] + 2.6, T.color[1], t), sat = ss(T.color[0], T.color[1], t);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, VW, VH); gl.disable(gl.BLEND); gl.useProgram(PA.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, alleyTex); gl.uniform1i(PA.u('tS'), 0); gl.uniform4f(PA.u('uRect'), 0, 0, 1, 1);
    const f1 = (n, v) => gl.uniform1f(PA.u(n), v); gl.uniform2f(PA.u('uRes'), VW, VH); gl.uniform3f(PA.u('uCam'), cam[0], cam[1], cam[2]); gl.uniform2f(PA.u('uVP'), AVP[0], AVP[1]);
    f1('uF', AF); f1('uEye', AH); f1('uWL', AWL); f1('uWR', AWR); f1('uWH', AWH); f1('uZE', AZE); f1('uHb', Hb); f1('uT', t); f1('uGain', 1); f1('uVig', .55); f1('uAmb', .09); f1('uIb', 1.25 * (1 + 1.05 * wk)); f1('uWarm', wk); f1('uSat', sat);
    const Ld = V.nrm([.62, .6, .5]); gl.uniform3f(PA.u('uLd'), Ld[0], Ld[1], Ld[2]); gl.uniform3f(PA.u('uOcc'), Q.P[0] - .05, Q.N[1] - .2, Q.P[2] + .05); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.filter = 'none'; o.drawImage(glc, 0, 0); o.restore();
    const q = { k: cam[2] };
    // dust in the light only, soft by distance from his depth; warm as the colour returns
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter';
    for (const [mx, my, mz, ph, b] of MOTES_A) { const X = mx + .06 * Math.sin(t * .23 + ph), Yy = my + .05 * Math.sin(t * .17 + ph * 2) - .03 * (t - T.alley[0] + 16), Z = mz, sh = Hb + (X + AWL) * (AWH - .6 - Hb) / (AWL + AWR); if (Yy < sh + .05) continue;
      const pp = toScr(cam, projA([X, Yy, Z])), df = Math.abs(1 / Z - 1 / 6) * 60 * q.k + 1.2, al = .12 * b * clamp((Yy - sh) / .3), cc = [lerp(220, 255, sat), lerp(224, 214, sat), lerp(230, 168, sat)].map(v => v | 0).join(',');
      const g = o.createRadialGradient(pp[0], pp[1], 0, pp[0], pp[1], df * 2.2); g.addColorStop(0, `rgba(${cc},${al})`); g.addColorStop(1, `rgba(${cc},0)`); o.fillStyle = g; o.fillRect(pp[0] - df * 2.2, pp[1] - df * 2.2, df * 4.4, df * 4.4); } o.restore();
    // Peter: deep shadow with S5's cold edge; as colour returns the dark takes a trace of his clothes
    const dk = (a, b) => { const A = [10, 10, 10], Bc = b; return `rgb(${A.map((v, i) => Math.round(lerp(v, Bc[i], a))).join(',')})`; };
    mass(o, cam, g => drawPeterAlley(g, Q, 'tunic'), { fill: dk(sat, [20, 16, 13]), blur: 1.4 });
    mass(o, cam, g => drawPeterAlley(g, Q, 'cloth'), { fill: dk(sat, [13, 14, 18]), blur: 1.4 });
    mass(o, cam, g => drawPeterAlley(g, Q), { fill: 'rgba(0,0,0,0)', blur: 1.4, rim: { c: 'rgb(90,94,98)', dx: -2.6, dy: 2.4, a: .6 * (1 - .6 * sat) } });
    // the dawn on him: above the light's edge (at his depth), lit cloth colours, strongest at the top; a gold rim on the upper edges
    { const z = Q.N[2], e1 = toScr(cam, projA([-1.0, litY(-1.0, Hb), z])), e2 = toScr(cam, projA([-.3, litY(-.3, Hb), z])), nx = e2[1] - e1[1], ny = -(e2[0] - e1[0]), nl = Math.hypot(nx, ny), ux = nx / nl, uy = ny / nl;   // (ux, uy) points up off the edge
      const sx = (e1[0] + e2[0]) / 2, sy = (e1[1] + e2[1]) / 2, soft = 7;
      // fix 1: his head cloth and body stay dark (never lit blue); the dawn touches only a thin warm rim along the head cloth's edge and his shoulder line
      // the rim: upper edges in the light, gold
      ta.setTransform(1, 0, 0, 1, 0, 0); ta.clearRect(0, 0, VW, VH); camT(ta, cam); ta.fillStyle = '#fff'; drawPeterAlley(ta, Q);
      tcx.setTransform(1, 0, 0, 1, 0, 0); tcx.globalCompositeOperation = 'source-over'; tcx.clearRect(0, 0, VW, VH); tcx.drawImage(tA, 0, 0); tcx.globalCompositeOperation = 'destination-out'; tcx.drawImage(tA, -4.2, 4.4);
      tcx.globalCompositeOperation = 'source-in'; tcx.fillStyle = `rgb(255,${lerp(236, 172, wk) | 0},${lerp(210, 84, wk) | 0})`; tcx.fillRect(0, 0, VW, VH);
      tcx.globalCompositeOperation = 'destination-in'; { const gr = tcx.createLinearGradient(sx - ux * soft, sy - uy * soft, sx + ux * soft, sy + uy * soft); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); tcx.fillStyle = gr; tcx.fillRect(0, 0, VW, VH); }
      tcx.globalCompositeOperation = 'source-over';
      { o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.filter = 'blur(1.2px)'; o.globalAlpha = .95; o.drawImage(tC, 0, 0); o.restore(); } }
    // the near jamb on the right, black (as S5)
    mass(o, [540, 960, 1], (g) => { g.beginPath(); g.moveTo(1180, -50); const jx = lerp(880, 940, clamp((cam[2] - 1) / .75)); g.lineTo(jx, -50); for (let y = -50; y <= 1980; y += 60) g.lineTo(jx + 5 * Math.sin(y * .03), y); g.lineTo(1180, 1980); g.closePath(); g.fill(); }, { fill: '#040404', blur: 6, rim: { c: 'rgb(120,122,126)', dx: 3, dy: 0, a: .12 } });
    // the finish of S5 (bw-rooster-p1.js shoot(): a lift of the blacks, then the grain)
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.fillStyle = 'rgb(6,6,6)'; o.fillRect(0, 0, VW, VH); o.restore(); grain(o, .13);
    return { cam, Hb, Q, sat, wk }; }

  // ============================================================== draw / measure
  function draw(ctx, scene, t, T) {
    if (scene === 'road') { roadFrame(ctx, t, T); return; }
    if (scene === 'room') roomFrame(t, T); else if (scene === 'alley') alleyFrame(t, T); else if (scene === 'ref') { o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.drawImage(refC, 0, 0); o.restore(); }
    present(ctx); }
  // measurement for the report: every .25 s camera speed (px/s on screen at the focus) and zoom rate (%/s), emission; joints per frame
  function measure(T, dt = 1 / 30) { const rows = [], J = {}; let mx = { v: 0, t: 0, who: '' };
    const sp = (f, t, w) => { const a = f(t, T), b = f(Math.min(t + dt, w[1] - 1e-3), T); return [+(Math.hypot(b[0] - a[0], b[1] - a[1]) * a[2] / dt).toFixed(1), +(Math.abs(Math.log(b[2] / a[2])) / dt * 100).toFixed(2)]; };
    for (let t = T.room[0]; t < T.room[1] - .01; t += .25) { const a = camRoomAt(t, T), b = camRoomAt(Math.min(t + dt, T.room[1] - 1e-3), T);
      rows.push(['room', +t.toFixed(2), +(Math.abs(b.yaw - a.yaw) / dt * 180 / Math.PI).toFixed(2), +(Math.hypot(b.O[0] - a.O[0], b.O[2] - a.O[2]) / dt).toFixed(3), +reachAt(t, T).toFixed(2)]); }   // room: yaw °/s, dolly m/s, the light's reach m
    for (const [sc, f, w, em] of [['road', (t) => { const z = zoomRoad(t, T); return [540, 960, z]; }, T.road, () => 1 / .4], ['alley', camAlleyN, T.alley, () => 0]])
      for (let t = w[0]; t < w[1] - .01; t += .25) { const [v, z] = sp(f, t, w); rows.push([sc, +t.toFixed(2), v, z, +em(t).toFixed(2)]); }
    const note = (k, d, t) => { J[k] = Math.max(J[k] || 0, d); if (d > mx.v) mx = { v: d, t: +t.toFixed(2), who: k }; };
    let pa = null; for (let t = T.alley[0]; t < T.alley[1]; t += dt) { const Q = poseAlleyN(t, T), a = { pHeadLift: Math.acos(clamp(V.dot(Q.Bd, Q0.Bd), -1, 1)) }; if (pa) for (const k in a) note(k, Math.abs(a[k] - pa[k]), t); pa = a; }
    return { rows, maxJoint: { rad: +mx.v.toFixed(4), deg: +(mx.v * 180 / Math.PI).toFixed(2), t: mx.t, who: mx.who, per: Object.fromEntries(Object.entries(J).map(([k, v]) => [k, +(v * 180 / Math.PI).toFixed(2)])) },
      ALLEY_END: AE, room: { yaw: +(R1.yaw * 180 / Math.PI).toFixed(1), shadowSpeed: SHADOW_V }, edge: { start: +hbN(T.alley[0], T).toFixed(3), end: +hbN(T.alley[1], T).toFixed(3) } }; }
  return { draw, measure, refC, alleyFrame, roomFrame, camRoomAt, projC, R1, RM };
}
