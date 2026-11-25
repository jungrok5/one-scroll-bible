// short-scenes.js — 「kingdom」 10-3 C: three short scenes the round-10 script added (rounds/r10-pilot/batch3.md §C). One module, three scenes:
//   room   2부 N111  film 162.2 → 168.7 (6.5 s)  "베드로의 집에서는, / 열병으로 누워 있던 장모가 일어났습니다."
//   road   6부 N150  film 699.2 → 704.2 (5.0 s)  "함께 죽겠다던 그 곁에, 베드로는 없었습니다."
//   alley  7부 N159  film 818.9 → 825.7 (6.8 s)  "제자들과, 베드로. / 세 번 부인한 그 사람의 이름이 따로 불렸습니다."
// (windows = [line, next line] from script.json `at`; every visual time comes from beats(B); only the page names the windows.)
//
// ROOM — Peter's house, a dark stone room lit by one high window (Vermeer 「The Milkmaid」/「Woman Reading a Letter」: one window, a
//   slanted patch on a plaster wall; Caravaggio 「The Calling of St Matthew」: the beam over the heads, the dark figure against the lit
//   wall; Georges de La Tour for the stillness). Engine: one WebGL2 pass ray-casts the room per pixel (back wall, ceiling beams, floor,
//   the stone bench-bed, a doorway with a sunlit lane behind it) with the window light traced back to the window opening (soft edges
//   growing with distance), warm bounce from the lit patch, the door's daylight, and in-scattered haze marched along every ray (fixed
//   per-pixel dither: no frame noise); a second pass adds only the haze in front of the woman, after the figures.
//   Figures are 2D silhouettes of 3D skeletons (fixed limb lengths, two-bone IK) projected through the same pinhole:
//   the woman (veil) lies on the bench, below the beam; she sits up INTO the beam (head curls, the near elbow plants, the arm straightens
//   and pushes, the hand leaves the mattress for her lap, the knees draw up under the blanket); her shadow rises on the lit wall.
//   Jesus is not shown (batch3.md §C allows it): every place by the bed where his back faces us put a big dark figure in front of her on a
//   phone; drawJesus/poseJesus are kept (SHOW_JESUS) for a later choice. Peter: frontal dark silhouette in the bright doorway (broad level
//   shoulders, head cloth tied with a band to the shoulder), his right hand on the jamb; he takes it off and straightens as she rises.
//   Camera: one slow push-in (zoom 1.50 → 1.64 over the shot, sine, ≤ 2.2 %/s) toward her sitting place.
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
//   ROOM 162.2–168.7  room tone of a stone house, a fly far off, the lane outside (a child, a dog, far) through the doorway
//     T.curl  (≈ p2+.1, .45 s)   a breath in, cloth rustle (her head lifts off the roll)
//     T.rise  (≈ p2+.2, 2.4 s)   the straw mattress creaks under the elbow (at +.5) and the hand (at +.9); wool sliding; her long exhale at the end
//     T.peter (≈ p2+1.3, 1.1 s)  Peter's palm leaves the wooden jamb (a soft knock of the wood), one sandal shifts on the threshold
//     T.knees (≈ p2+1.6, 1.6 s)  the blanket drawn over the knees (soft wool)
//     T.lean  (≈ p2+.6, 2.3 s)   no sound for Him; the beam gets a high, quiet shimmer (strings harmonic) as she enters it
//   ROAD 699.2–704.2  wind only: a low steady wind; gust 1 at T.gust[0] (1.8 s, dry grass hiss, dust ticks on stone); gust 2 at T.gust2[0];
//     no footsteps, no voices; far, very faint: nothing from the hill (silence is the point)
//   ALLEY 818.9–825.7  the alley's room tone from part 5 (wet stone drip, far city), then
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
  const r0 = B.N111, r1 = B.L41, p2 = pc.N111 ? pc.N111[1] : r0 + 1.6;
  T.room = [r0, r1]; T.p2 = p2;
  T.curl = [p2 + .05, p2 + .6]; T.rise = [p2 + .25, p2 + 2.75]; T.knees = [p2 + 1.7, p2 + 3.4]; T.turn = [p2 + 2.5, p2 + 3.9];
  T.lean = [p2 + .55, p2 + 2.9]; T.warm = [p2 - .5, p2 + 2.9]; T.peter = [p2 + 1.3, p2 + 2.6];
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

// ================================================================ ROOM shader
// world metres, y up, camera at (0, uEye, 0) looking down +z; screen base px (1080×1920) = uVP + uF·(x/z, −(y−eye)/z); 2D zoom uCam (x, y, k)
const ROOM = `#version 300 es
  precision highp float; in vec2 vUv; out vec4 o; ${NOISE}
  uniform vec2 uRes, uVP; uniform vec3 uCam; uniform float uF, uEye, uXL, uXR, uZB, uYC, uT, uSunI, uHaze, uGain, uZf, uVig, uWarm; uniform int uMode;
  uniform vec4 uWin; uniform vec3 uSun; uniform vec4 uDoor; uniform vec3 uB0, uB1, uBc;
  const vec3 SUNC = vec3(1., .80, .56);
  // the window light reaching P: back along the sun ray to the right wall, inside the opening (penumbra grows with the distance)
  float sunAt(vec3 P){ float s = (uXR - P.x) / (-uSun.x); if (s < 0.) return 0.; vec3 Q = P - uSun * s; float pe = .012 + .028 * s;
    return smoothstep(uWin.x - pe, uWin.x + pe, Q.z) * (1. - smoothstep(uWin.y - pe, uWin.y + pe, Q.z)) * smoothstep(uWin.z - pe, uWin.z + pe, Q.y) * (1. - smoothstep(uWin.w - pe, uWin.w + pe, Q.y)); }
  float stones(vec2 q, float sx, float sy){ float yy = q.y + (fb3(q * 1.3) - .5) * .1; vec2 b = vec2(q.x, yy) / vec2(sx, sy); float row = floor(b.y); b.x += hh(vec2(row, 3.)) * 2. + (vn(vec2(q.x * 1.7, row)) - .5) * .5;
    vec2 f = fract(b); return smoothstep(-.02, .1, min(min(f.x, 1. - f.x) * 1.6, min(f.y, 1. - f.y)) + (fb3(q * 11.) - .5) * .22); }
  // plaster over rubble stone: where the plaster has fallen the stones show (never one texture over the whole wall)
  float wallH(vec2 q){ float m = smoothstep(.88, .98, fb3(q * .55 + 3.1) + .22 * fb3(q * 2.3)); return mix(.55 + .25 * fb3(q * 3.1) + .12 * fb3(q * 17.), .3 + .55 * stones(q, .36, .21), m); }
  float floorH(vec2 q){ float m = smoothstep(.6, .7, fb3(q * .9 + 7.)); return mix(.45 + .35 * fb3(q * 2.2) + .15 * fb3(q * 13.), .4 + .5 * stones(q * vec2(1., 1.4), .5, .4), m); }
  vec3 lane(vec3 o3, vec3 d){   // the sunlit lane outside the doorway: the opposite house wall, the ground, a strip of sky
    float tW = (uZB + 2.6 - o3.z) / d.z, tG = d.y < 0. ? -o3.y / d.y : 1e9; vec3 c;
    if (tG < tW) { vec3 P = o3 + d * tG; c = vec3(1., .84, .62) * (.5 + .2 * fb3(P.xz * 1.4)) * (.75 + .25 * smoothstep(uZB + 2.6, uZB + 1., P.z)); }
    else { vec3 P = o3 + d * tW; if (P.y > 3.3 + .3 * fb3(vec2(P.x * .8, 1.))) c = vec3(1., .96, .88) * 1.3; else c = vec3(1., .82, .58) * (.38 + .3 * fb3(P.xy * vec2(1.6, 2.6)) + .4 * wallH(P.xy * 1.3)) * (P.y < 1.1 + .4 * fb3(vec2(P.x, 4.)) ? .8 : 1.); }
    return c; }
  void main(){ vec2 fc = gl_FragCoord.xy; fc.y = uRes.y - fc.y; vec2 p = (fc - uRes * .5) / uCam.z + uCam.xy;
    vec3 O = vec3(0., uEye, 0.), d = normalize(vec3((p.x - uVP.x) / uF, -(p.y - uVP.y) / uF, 1.));
    float tt = (uZB - O.z) / d.z; int id = 0; vec3 N = vec3(0., 0., -1.);
    if (d.x < 0.) { float t = (uXL - O.x) / d.x; if (t < tt) { tt = t; id = 1; N = vec3(1., 0., 0.); } }
    if (d.x > 0.) { float t = (uXR - O.x) / d.x; if (t < tt) { tt = t; id = 2; N = vec3(-1., 0., 0.); } }
    if (d.y < 0.) { float t = -O.y / d.y; if (t < tt) { tt = t; id = 3; N = vec3(0., 1., 0.); } }
    if (d.y > 0.) { float t = (uYC - O.y) / d.y; if (t < tt) { tt = t; id = 4; N = vec3(0., -1., 0.); } }
    { vec3 iv = 1. / d, t0 = (uB0 - O) * iv, t1 = (uB1 - O) * iv, a = min(t0, t1), b = max(t0, t1); float tn = max(max(a.x, a.y), a.z), tf = min(min(b.x, b.y), b.z);
      if (tn < tf && tn > 0. && tn < tt) { tt = tn; id = 5; N = tn == a.x ? vec3(-sign(d.x), 0., 0.) : tn == a.y ? vec3(0., -sign(d.y), 0.) : vec3(0., 0., -sign(d.z)); } }
    vec3 P = O + d * tt, col = vec3(0.); float lit = 0.;
    bool door = id == 0 && P.x > uDoor.x && P.x < uDoor.y && P.y < uDoor.z;
    if (door) {   // through the doorway: the reveal (jambs and lintel, 0.42 m deep), then the lane
      float tz = (uZB + .42 - O.z) / d.z, tj = 1e9; vec3 Nj = vec3(0.);
      if (d.x < 0.) { float t = (uDoor.x - O.x) / d.x; if (t < tj) { tj = t; Nj = vec3(1., 0., 0.); } } if (d.x > 0.) { float t = (uDoor.y - O.x) / d.x; if (t < tj) { tj = t; Nj = vec3(-1., 0., 0.); } }
      if (d.y > 0.) { float t = (uDoor.z - O.y) / d.y; if (t < tj) { tj = t; Nj = vec3(0., -1., 0.); } }
      if (tj < tz) { vec3 Q = O + d * tj; float k = smoothstep(uZB, uZB + .42, Q.z); col = vec3(.62, .52, .4) * (.06 + .9 * k * k) * (.8 + .4 * fb3(Q.zy * 5.)); }
      else col = lane(O + d * tz, d);
    } else {
      vec2 q; vec3 Tg, Bt; float h, hx, hy, e = .006, amp = .9;
      // surface coordinates and the height field for a little relief in the raking light
      if (id == 0 || id == 5 && abs(N.z) > .5) { q = P.xy; Tg = vec3(1., 0., 0.); Bt = vec3(0., 1., 0.); }
      else if (id == 1 || id == 2 || id == 5 && abs(N.x) > .5) { q = P.zy; Tg = vec3(0., 0., 1.); Bt = vec3(0., 1., 0.); }
      else { q = P.xz; Tg = vec3(1., 0., 0.); Bt = vec3(0., 0., 1.); }
      bool mat = id == 5 && (N.y > .5 || P.y > uB1.y - .13);   // the mattress (top and its front lip): woven cloth
      if (id == 3) { h = floorH(q); hx = floorH(q + vec2(e, 0.)) - h; hy = floorH(q + vec2(0., e)) - h; }
      else if (mat) { h = .6 + .2 * fb3(q * vec2(2.5, 6.)) + .06 * sin(q.x * 90. + fb3(q * 3.) * 4.); hx = 0.; hy = 0.; amp = 0.; }
      else { h = wallH(q * (id == 5 ? 1.6 : 1.)); hx = wallH((q + vec2(e, 0.)) * (id == 5 ? 1.6 : 1.)) - h; hy = wallH((q + vec2(0., e)) * (id == 5 ? 1.6 : 1.)) - h; }
      vec3 Nb = normalize(N - (Tg * hx + Bt * hy) / e * amp * .08);
      vec3 alb = id == 3 ? vec3(.58, .47, .36) * (.62 + .5 * h) : mat ? vec3(.74, .63, .47) * h : id == 4 ? vec3(.3, .23, .17) : vec3(.78, .68, .54) * (.5 + .62 * h);
      if (id == 4) { float bm = smoothstep(.06, .0, abs(fract(P.z / .7) - .5) - .36); alb = mix(vec3(.16, .12, .09), vec3(.36, .29, .21), bm) * (.7 + .5 * fb3(P.xz * vec2(6., 1.))); }
      if (id == 5 && !mat) alb = vec3(.62, .53, .42) * (.3 + .55 * stones(q, .3, .19) + .15 * fb3(q * 9.)) * .62;   // the bench's front: rough stones, in its own shade
      if (id == 0 && P.y < .32) alb *= .78;   // a darker plinth where feet and water wear the wall
      float s = id == 4 ? 0. : sunAt(P); lit = s;
      vec3 L = -uSun; float sd = s * max(dot(Nb, L), 0.);
      vec3 Lb = uBc - P; float db = length(Lb); Lb /= db; float bounce = (.3 + .7 * max(dot(Nb, Lb), 0.)) / (1. + db * db / 1.1);
      vec3 Dc = vec3((uDoor.x + uDoor.y) * .5, uDoor.z * .5, uZB), Ld = Dc - P; float dd = length(Ld); Ld /= dd; float dl = max(dot(Nb, Ld), 0.) * max(-Ld.z, 0.) / (1. + dd * dd / 1.6);
      if (id == 0 && P.x > uDoor.x - .12 && P.x < uDoor.y + .12 && P.y < uDoor.z + .12) dl *= .3;   // the wall round the door sees little of it
      col = alb * (vec3(.045, .04, .042) + SUNC * uSunI * sd * mix(.85, 1.12, uWarm) + vec3(1., .72, .46) * .1 * uSunI * bounce * (1. - .75 * s) + vec3(1., .82, .6) * .45 * dl);
    }
    // haze in the beam, marched along the ray (fixed per-pixel dither); uMode 0: beyond uZf only, 1: in front of uZf only
    float hz = 0., j = hh(fc * .73 + 3.1); for (int i = 0; i < 28; i++) { float s = (float(i) + j) / 28. * tt; vec3 Q = O + d * s; bool fr = Q.z < uZf; if ((uMode == 1) != fr) continue;
      float k = sunAt(Q); if (k <= 0.) continue; hz += k * (.45 + 1.1 * fb3(vec2(Q.x * 1.6 + Q.z * .7 + uT * .06, Q.y * 2.2 - uT * .04))); }
    hz *= tt / 28.; vec3 hc = SUNC * hz * uHaze * uSunI;
    // the doorway's daylight glows a little in the air of the room
    { vec2 dc = vec2(uVP.x + uF * (uDoor.x + uDoor.y) * .5 / uZB, uVP.y - uF * (uDoor.z * .5 - uEye) / uZB); vec2 dv = (p - dc) / vec2(170., 330.); hc += vec3(1., .8, .58) * .05 * exp(-dot(dv, dv)) * (uMode == 1 ? 0. : 1.); }
    if (uMode == 1) { vec3 c = 1. - exp(-hc * uGain); o = vec4(pow(c, vec3(.4545)), 1.); return; }
    col += hc;
    vec3 c = 1. - exp(-col * uGain); c = pow(c, vec3(.4545));
    c = mix(c, c * vec3(1.04, .99, .9), .6);   // warm grade (the village is golden late afternoon)
    vec2 v = (fc / uRes - vec2(.5, .45)) * vec2(1.05, .9); c *= 1. - uVig * smoothstep(.25, .78, length(v));
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

  // ============================================================== ROOM
  const RM = { F: 1200, eye: 1.35, VP: [560, 860], XL: -2.75, XR: 2.3, ZB: 5.6, YC: 3.05, win: [3.55, 4.42, .62, 1.75], door: [-1.7, -.86, 1.98], b0: [-.85, 0, 4.55], b1: [1.6, .45, 5.6], Zw: 5.08, Zf: 4.98 };
  // fix 1 (관리자 2026-11-25): a low late sun through a low window, almost level, so her SHADOW on the wall reads from lying to sitting (shadow play)
  { const v = [-.15, -.1, .98], l = Math.hypot(...v); RM.sun = v.map(q => q / l);
    // the window (on the right wall, behind the camera's side) sized so that its light on the back wall covers x −0.8 … 1.4, y 0.3 … 1.9 there
    const sv = RM.sun, back = (x, y) => { const sd = (RM.XR - x) / (-sv[0]); return [RM.ZB - sv[2] * sd, y - sv[1] * sd]; }, a = back(1.4, .3), b = back(-.8, 1.9);
    RM.win = [b[0], a[0], back(1.4, .3)[1], back(-.8, 1.9)[1]]; }
  const projR = (x, y, z) => [RM.VP[0] + RM.F * x / z, RM.VP[1] - RM.F * (y - RM.eye) / z];
  // the lit band at depth z: the window opening carried along the sun ray (for the figures' light)
  const beamAt = (z) => { const s = RM.sun, P = []; for (const [wz, wy] of [[RM.win[0], RM.win[2]], [RM.win[0], RM.win[3]], [RM.win[1], RM.win[3]], [RM.win[1], RM.win[2]]]) { const t = (z - wz) / s[2]; P.push([RM.XR + s[0] * t, wy + s[1] * t]); } return P; };
  const camRoom = (t, T) => { const k = sine((t - T.room[0]) / (T.room[1] - T.room[0])); return [lerp(578, 562, k), lerp(935, 915, k), lerp(1.42, 1.53, k)]; };
  // ---- the woman: a side-view skeleton in the bed's plane (x, y metres at z = RM.Zw); lying head to the right, she sits up facing left
  const WH = [.56, .58], LEN = { torso: .47, neck: .09, ua: .27, fa: .25, th: .42, sh: .41 };
  function poseWoman(t, T) { const r = clamp((t - T.rise[0]) / (T.rise[1] - T.rise[0])), cu = ss(T.curl[0], T.curl[1], t), kn = ss(T.knees[0], T.knees[1], t), tu = ss(T.turn[0], T.turn[1], t);
    // the torso's angle from the mattress: slow start (the push), faster through the middle, eased into upright, a small settle
    const th = hermite([[0, 0], [.18, .12], [.45, .52], [.72, 1.2], [1, 1.6]], r);
    const u = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];   // u along the spine toward the head, n her front
    const Hh = [WH[0] - .015 * ss(.3, 1, r), WH[1] - .012 * ss(.3, 1, r)], S = add2(Hh, u, LEN.torso);
    // the head: chin curls to the chest first (curl), comes up as she sits, then turns a little toward Him (left, down)
    const nod = .42 * cu * (1 - .75 * ss(.55, 1, r)) + .12 * tu, hd = [u[0] * Math.cos(nod) + n[0] * Math.sin(nod), u[1] * Math.cos(nod) + n[1] * Math.sin(nod)];
    const Nk = add2(S, u, .05), Hc = add2(Nk, hd, .13);
    // the near arm: lying straight by her side → as the torso starts up (r .08 → .44, ~0.9 s) the hand slides to a point beside her hip and plants; it pushes (the arm straightens) until r .64; then (0.9 s) it lifts into her lap
    const Wside = [WH[0] - .06, WH[1] - .07], Wplant = [WH[0] + .1, WH[1] - .105], lap = add2(Hh, [-.2, .1]);
    const pl = ss(.08, .44, r), off = ss(.64, 1, r);
    let Wr = [lerp(Wside[0], Wplant[0], sine(pl)), lerp(Wside[1], Wplant[1], sine(pl)) + .025 * Math.sin(Math.PI * pl)];
    if (off > 0) Wr = [lerp(Wr[0], lap[0], sine(off)), lerp(Wr[1], lap[1], sine(off)) + .06 * Math.sin(Math.PI * off)];
    const Sh = add2(S, u, -.04), arm = ik2(Sh, Wr, LEN.ua, LEN.fa, E => E[0] * n[0] + E[1] * n[1]);   // the elbow always on her back side (bends down/back, never forward)
    // legs: ankle slides toward her as the knees come up (knee by IK, bending upward)
    const A = add2(Hh, [lerp(-.82, -.6, kn), -.06]), leg = ik2(Hh, A, LEN.th, LEN.sh, K => -K[1]);
    return { r, th, u, n, H: Hh, S, Sh, Nk, Hc, hd, arm, A, K: leg.E, kn, tu }; }
  function drawWoman(g, Q, part) {   // world (x, y) at z = RM.Zw → base px; part: 'all' | 'veil' | 'torso' | 'arm' | 'dress' (= torso + arm) | 'blanket' | 'skin'
    const z = RM.Zw, P = a => projR(a[0], a[1], z), k = RM.F / z, u = Q.u, n = Q.n;
    const at = (b, du, dn) => P([b[0] + u[0] * du + n[0] * dn, b[1] + u[1] * du + n[1] * dn]);
    if (part === 'all' || part === 'blanket') {   // the blanket over the legs, down to the mattress on both sides; tented over the knee
      const K = Q.K, A = Q.A, Hh = Q.H, ml = RM.b1[1] + .03;
      const pts = [P([Hh[0] + .1, ml - .03]), P([Hh[0] + .02, Hh[1] + .05]), P([lerp(Hh[0], K[0], .5), lerp(Hh[1], K[1], .5) + .085]), P([K[0] + .02, K[1] + .09]), P([K[0] - .07, K[1] + .06]),
        P([lerp(K[0], A[0], .55), lerp(K[1], A[1], .55) + .075]), P([A[0] + .02, A[1] + .1]), P([A[0] - .09, A[1] + .07]), P([A[0] - .16, ml - .02]), P([Hh[0] + .1, ml - .06])];
      g.beginPath(); spline(g, pts); g.fill(); }
    if (part === 'all' || part === 'dress' || part === 'torso') {   // the dress: one loose hull from the shoulders to the hips, into the lap
      const cv = .055 * Math.sin(Math.PI * clamp(Q.r * 1.15));   // the back rounds as she curls up, straightens once she sits
      const pts = [at(Q.H, -.1, -.11), at(Q.H, -.06, .12), at(Q.H, .12, .12 - cv * .4), at(Q.H, .3, .115 - cv * .3), at(Q.H, .42, .085), at(Q.H, .47, .02), at(Q.H, .44, -.09 - cv * .5), at(Q.H, .25, -.105 - cv), at(Q.H, .06, -.12 - cv * .3), P(add2(Q.H, [-.16, .07])), P(add2(Q.H, [-.14, -.06]))];
      fillHull(g, pts); }
    if (part === 'all' || part === 'dress' || part === 'arm') { const a = Q.arm, s = P(Q.Sh), e = P(a.E), w = P(a.W); limb(g, s[0], s[1], .055 * k, e[0], e[1], .046 * k); limb(g, e[0], e[1], .044 * k, w[0], w[1], .034 * k); }
    if (part === 'all' || part === 'skin') { const a = Q.arm, e = P(a.E), w = P(a.W), dx = w[0] - e[0], dy = w[1] - e[1], l = Math.hypot(dx, dy) || 1;   // the hand: small, a soft oval past the wrist
      g.beginPath(); g.ellipse(w[0] + dx / l * .045 * k, w[1] + dy / l * .045 * k, .05 * k, .028 * k, Math.atan2(dy, dx), 0, TAU); g.fill(); }
    if (part === 'all' || part === 'veil') {   // the veil: over the head, forward past the face as a hood, down the back to the shoulder blades
      const hd = Q.hd, hn = [-hd[1], hd[0]], c = Q.Hc, at2 = (du, dn) => P([c[0] + hd[0] * du + hn[0] * dn, c[1] + hd[1] * du + hn[1] * dn]);
      const pts = [at2(.112, .0), at2(.095, .07), at2(.035, .108), at2(-.06, .1), at2(-.1, .06), at(Q.S, .03, .045), at(Q.S, -.03, .0), at(Q.S, -.09, -.085), at2(-.08, -.105), at2(.04, -.1), at2(.1, -.055)];
      g.beginPath(); spline(g, pts); g.fill(); }
  }
  // the hood's opening (the face, never drawn): a dark recess where the light cannot reach
  function faceShade(g, Q) { const z = RM.Zw, P = a => projR(a[0], a[1], z), k = RM.F / z, hd = Q.hd, hn = [-hd[1], hd[0]], c = Q.Hc, f = P([c[0] + hd[0] * -.01 + hn[0] * .075, c[1] + hd[1] * -.01 + hn[1] * .075]);
    g.beginPath(); g.ellipse(f[0], f[1], .05 * k, .072 * k, Math.atan2(-hd[1], hd[0]) - Math.PI / 2, 0, TAU); g.fill(); }
  // ---- Jesus: standing at the foot of the bed, three-quarter back to us; leans toward her, straightens as she rises
  const JG = [-.32, 0, 4.3], SHOW_JESUS = false;
  function poseJesus(t, T) { const s = ss(T.lean[0], T.lean[1], t), br = .004 * Math.sin((t - T.room[0]) * TAU / 3.6); return { lean: lerp(.2, .05, s), br }; }
  function drawJesus(g, J) { const z = JG[2], k = RM.F / z, P = (x, y) => projR(JG[0] + x, y, z), hip = [0, .95], rot = (x, y) => { const dx = x - hip[0], dy = y - hip[1], c = Math.cos(-J.lean), s = Math.sin(-J.lean); return [hip[0] + dx * c - dy * s, hip[1] + dx * s + dy * c]; };
    const Q = (x, y) => { const r = y > .95 ? rot(x, y + J.br * ss(.95, 1.4, y)) : [x, y]; return P(r[0], r[1]); };
    // robe from the hem to the broad shoulders (level), sleeves at the sides; no waist
    // the sleeves hang a little away from the robe at the elbows (arms, not a sack), the hands in front of him
    const pts = [Q(-.25, .04), Q(-.235, .5), Q(-.24, .86), Q(-.275, 1.05), Q(-.265, 1.25), Q(-.262, 1.38), Q(-.25, 1.45), Q(-.15, 1.48), Q(.15, 1.48), Q(.25, 1.45), Q(.262, 1.38), Q(.265, 1.25), Q(.275, 1.05), Q(.24, .86), Q(.235, .5), Q(.26, .04)];
    g.beginPath(); spline(g, pts); g.fill();
    const a = Q(-.03, 1.48), h = Q(-.02 + .0, 1.63); limb(g, a[0], a[1], .075 * k, h[0], h[1], .06 * k);
    // the head from behind: a round cloth, falling to the shoulders (no face, no profile)
    const hc = Q(0, 1.66); g.beginPath(); g.ellipse(hc[0], hc[1], .108 * k, .118 * k, 0, 0, TAU); g.fill();
    g.beginPath(); spline(g, [Q(-.098, 1.66), Q(-.115, 1.56), Q(-.13, 1.47), Q(.13, 1.47), Q(.115, 1.56), Q(.098, 1.66)]); g.fill();
    // feet: the hem just touches the floor; a dark foot edge in front
    const f1 = P(-.1, .015), f2 = P(.12, .015); g.beginPath(); g.ellipse(f1[0], f1[1], .07 * k, .02 * k, 0, 0, TAU); g.ellipse(f2[0], f2[1], .07 * k, .02 * k, 0, 0, TAU); g.fill(); }
  // ---- Peter: frontal in the doorway, his right hand on the jamb (screen left), then down at his side
  const PG = [-1.28, 0, RM.ZB + .2];
  function posePeter(t, T) { const s = ss(T.peter[0], T.peter[1], t), u = t - T.room[0], br = .013 * Math.sin(u * TAU / 3.2 + 1), sw = .012 * Math.sin(u * TAU / 5.1) + .02 * sine(s); return { s, br, sw }; }
  function drawPeter(g, Q) { const z = PG[2], k = RM.F / z, P = (x, y) => projR(PG[0] + x + Q.sw * clamp(y / 1.8), y, z), s = Q.s, b = Q.br;
    const sh = 1.46 + b + .012 * s;   // he straightens a little as he takes the hand off the jamb
    // tunic to mid-calf, belted, broad level shoulders
    g.beginPath(); spline(g, [P(-.25, .04), P(-.24, .9), P(-.25, 1.2), P(-.27, sh - .04), P(-.2, sh + .03), P(.2, sh + .03), P(.27, sh - .04), P(.25, 1.2), P(.24, .9), P(.25, .04)]); g.fill();
    // legs and feet (planted)
    // (his feet are behind the threshold: no feet drawn)
    // neck, head, head cloth tied with a band (the knot's ends at the side), falling to the shoulders
    // neck, then the head in its cloth: a level top, straight sides, the cloth tied at the back and falling only to the shoulders (no bump, no ring, no veil)
    { const n0 = P(0, sh), n1 = P(0, sh + .13); limb(g, n0[0], n0[1], .068 * k, n1[0], n1[1], .062 * k);
      g.beginPath(); spline(g, [P(-.175, sh + .02), P(-.138, sh + .12), P(-.124, sh + .22), P(-.11, sh + .29), P(-.06, sh + .322), P(.06, sh + .322), P(.11, sh + .29), P(.124, sh + .22), P(.138, sh + .12), P(.175, sh + .02)]); g.fill(); }
    // the arms: his right (screen left) up on the jamb → down at his side; the left hangs
    const SR = [-.23, sh - .03], SL = [.23, sh - .03], jamb = [-.3, 1.02], side = [-.3, .8];
    const WR = [lerp(jamb[0], side[0], sine(s)), lerp(jamb[1], side[1], sine(s)) + .05 * Math.sin(Math.PI * s)];
    const aR = ik2(SR, WR, .3, .28, E => E[1] - E[0] * .3), aL = ik2(SL, [.31, .8], .3, .28, E => E[1] - E[0] * .3);   // elbows down and out
    for (const [S0, a] of [[SR, aR], [SL, aL]]) { const p0 = P(...S0), e = P(...a.E), w = P(...a.W); limb(g, p0[0], p0[1], .062 * k, e[0], e[1], .05 * k); limb(g, e[0], e[1], .048 * k, w[0], w[1], .036 * k); g.beginPath(); g.arc(w[0], w[1], .04 * k, 0, TAU); g.fill(); }
    return { aR, aL }; }
  // ---- still things: a jar by the door, a net hung on a peg (Peter is a fisherman), the pillow roll
  function drawJar(g) { const z = RM.ZB - .35, P = (x, y) => projR(x, y, z); g.beginPath(); spline(g, [[-1.05, .02], [-1.24, .2], [-1.25, .4], [-1.16, .55], [-1.11, .62], [-1.12, .68], [-.98, .68], [-.99, .62], [-.94, .55], [-.85, .4], [-.86, .2]].map(([x, y]) => P(x - .8, y))); g.fill(); }
  function drawNet(g, t) { const z = RM.ZB - .04, P = (x, y) => projR(x, y, z), sw = .004 * Math.sin(t * 1.1); g.beginPath(); spline(g, [P(1.12, 2.05), P(1.02 + sw, 1.6), P(.98 + sw, 1.15), P(1.1 + sw, .98), P(1.3 + sw, .96), P(1.42 + sw, 1.12), P(1.44, 1.6), P(1.32, 2.05), P(1.22, 2.1)]); g.fill(); }
  function drawPillow(g) { const z = RM.Zw, P = (x, y) => projR(x, y, z); g.beginPath(); spline(g, [[.86, .53], [.88, .63], [.98, .69], [1.18, .69], [1.27, .62], [1.24, .53]].map(([x, y]) => P(x + .16, y - .08))); g.fill(); }
  // dust in the beam: fixed motes drifting slowly (no births: a constant count), soft by their distance from the focus (her depth)
  const MOTES_R = Array.from({ length: 46 }, (_, i) => { const r = rngOf(331 + i * 17); r(); return [r(), r(), r(), r() * TAU, .4 + .6 * r()]; });
  function roomFrame(t, T) {
    const cam = camRoom(t, T), warm = ss(T.warm[0], T.warm[1], t);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, VW, VH); gl.disable(gl.BLEND); gl.useProgram(PR.p);
    const u1 = (n, v) => gl.uniform1f(PR.u(n), v), u3 = (n, v) => gl.uniform3f(PR.u(n), v[0], v[1], v[2]);
    gl.uniform4f(PR.u('uRect'), 0, 0, 1, 1); gl.uniform2f(PR.u('uRes'), VW, VH); gl.uniform2f(PR.u('uVP'), RM.VP[0], RM.VP[1]); u3('uCam', cam);
    u1('uF', RM.F); u1('uEye', RM.eye); u1('uXL', RM.XL); u1('uXR', RM.XR); u1('uZB', RM.ZB); u1('uYC', RM.YC); u1('uT', t); u1('uSunI', lerp(1.35, 1.6, warm)); u1('uHaze', .03); u1('uGain', 1.6); u1('uZf', RM.Zf); u1('uVig', .5); u1('uWarm', warm);
    gl.uniform4f(PR.u('uWin'), ...RM.win); u3('uSun', RM.sun); gl.uniform4f(PR.u('uDoor'), RM.door[0], RM.door[1], RM.door[2], 0); u3('uB0', RM.b0); u3('uB1', RM.b1); u3('uBc', [-.3, .8, 5.45]);
    gl.uniform1i(PR.u('uMode'), 1); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); hzx.setTransform(1, 0, 0, 1, 0, 0); hzx.drawImage(glc, 0, 0);   // the haze in front of her, kept for later
    gl.uniform1i(PR.u('uMode'), 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.filter = 'none'; o.drawImage(glc, 0, 0); o.restore();
    const Qw = poseWoman(t, T), Qj = poseJesus(t, T), Qp = posePeter(t, T);
    // her shadow on the lit wall behind: her shape carried along the sun ray to the wall (z = ZB), only where the wall is lit and above the bed
    { const sdz = (RM.ZB - RM.Zw) / RM.sun[2], dx = RM.sun[0] * sdz, dy = RM.sun[1] * sdz, Sg = RM.F / RM.ZB, Wg = RM.F / RM.Zw;
      ta.setTransform(1, 0, 0, 1, 0, 0); ta.clearRect(0, 0, VW, VH); camT(ta, cam); ta.save();
      // only where the wall is lit (the window's patch) and above the bed's top: clip first, then draw her carried shape
      const bp = beamAt(RM.ZB).map(q => projR(q[0], q[1], RM.ZB)), bt = projR(0, RM.b1[1], RM.ZB)[1];
      ta.beginPath(); ta.moveTo(...bp[0]); for (const q of bp.slice(1)) ta.lineTo(...q); ta.closePath(); ta.clip(); ta.beginPath(); ta.rect(-400, -400, VW + 800, bt + 400); ta.clip(); { const d0 = projR(RM.door[1], 0, RM.ZB); ta.beginPath(); ta.rect(d0[0], -400, VW + 800, VH + 800); ta.clip(); }
      // map: woman base px p (at Zw) → the same world point carried along the sun to the wall (z = ZB), in base px: p·r + VP·(1 − r) + Sg·(dx, −dy), r = Sg/Wg
      const rr = Sg / Wg; ta.transform(rr, 0, 0, rr, RM.VP[0] * (1 - rr) + Sg * dx, RM.VP[1] * (1 - rr) - Sg * dy);
      ta.fillStyle = '#000'; drawPillow(ta); drawWoman(ta, Qw, 'blanket'); drawWoman(ta, Qw, 'veil'); drawWoman(ta, Qw, 'dress'); drawWoman(ta, Qw, 'skin'); ta.restore();
      tcx.setTransform(1, 0, 0, 1, 0, 0); tcx.globalCompositeOperation = 'source-over'; tcx.clearRect(0, 0, VW, VH); tcx.fillStyle = 'rgb(58,44,34)'; tcx.fillRect(0, 0, VW, VH); tcx.globalCompositeOperation = 'destination-in'; tcx.drawImage(tA, 0, 0); tcx.globalCompositeOperation = 'source-over';
      o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'multiply'; o.filter = 'blur(3.2px)'; o.globalAlpha = .92; o.drawImage(tC, 0, 0); o.restore(); }
    // still things (dark, soft)
    mass(o, cam, g => { drawJar(g); }, { fill: '#120d0a', blur: 1.2, rim: { c: 'rgb(255,190,130)', dx: 2.4, dy: 0, a: .35 } });
    // the woman herself stays in the dark (fix 1): one soft dark shape, the beam only grazing a thin warm edge on her back; the wall tells it
    mass(o, cam, g => { drawPillow(g); drawWoman(g, Qw, 'torso'); drawWoman(g, Qw, 'blanket'); drawWoman(g, Qw, 'arm'); drawWoman(g, Qw, 'skin'); drawWoman(g, Qw, 'veil'); }, { fill: '#17100c', blur: 2.4 });
    // a thin warm rim where the beam grazes her back and the top of the veil
    { ta.setTransform(1, 0, 0, 1, 0, 0); ta.clearRect(0, 0, VW, VH); camT(ta, cam); ta.fillStyle = '#fff'; drawWoman(ta, Qw, 'veil'); drawWoman(ta, Qw, 'dress');
      tb.setTransform(1, 0, 0, 1, 0, 0); tb.globalCompositeOperation = 'source-over'; tb.clearRect(0, 0, VW, VH); tb.drawImage(tA, 0, 0); tb.globalCompositeOperation = 'destination-out'; tb.drawImage(tA, -3, 2.2); tb.globalCompositeOperation = 'source-in'; tb.fillStyle = 'rgb(255,214,150)'; tb.fillRect(0, 0, VW, VH);
      camT(tb, cam); const z = RM.Zw, bp = beamAt(z).map(q => projR(q[0], q[1], z)); tb.globalCompositeOperation = 'destination-in'; tb.filter = 'blur(5px)'; tb.beginPath(); tb.moveTo(...bp[0]); for (const q of bp.slice(1)) tb.lineTo(...q); tb.closePath(); tb.fillStyle = '#000'; tb.fill(); tb.filter = 'none'; tb.globalCompositeOperation = 'source-over';
      o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.filter = 'blur(1.6px)'; o.globalAlpha = .3 + .2 * warm; o.drawImage(tB, 0, 0); o.restore(); }
    // the haze in front of her (over her, behind Jesus, who stands nearer than the beam)
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter'; o.globalAlpha = .15; o.drawImage(hzC, 0, 0); o.restore();   // (fix 2: kept faint, the frontal beam's haze must not wash her out)
    // Jesus: dark against the lit wall, a faint warm edge on the doorway side and a cool one from the beam's scatter
    // (Jesus is not shown here — batch3.md §C allows it: every place by the bed where his back would face us put a large dark figure in front of her;
    //  drawJesus/poseJesus stay for a later choice. The light that comes onto her as she rises carries the line.)
    if (SHOW_JESUS) mass(o, cam, g => drawJesus(g, Qj), { fill: '#120e0b', blur: 1.3, rim: { c: 'rgb(255,200,140)', dx: 2.6, dy: 1.2, a: .3 } });
    // Peter in the doorway: black against the day; the bloom eats his edges
    mass(o, cam, g => drawPeter(g, Qp), { fill: '#0d0907', blur: 2.6 });
    // the threshold: a raised stone sill across the doorway hides his feet
    mass(o, cam, g => { const z = RM.ZB + .02, a = projR(RM.door[0] - .04, .17, z), b = projR(RM.door[1] + .04, 0, z); g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }, { fill: '#241a13', blur: 1, rim: { c: 'rgb(255,200,140)', dx: 0, dy: 2, a: .35 } });
    // the dust motes in the beam
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'lighter';
    { const s = RM.sun, k = cam[2]; for (const [a, b, c, ph, br] of MOTES_R) { const zz = lerp(4.2, 5.5, c), wz = lerp(RM.win[0], RM.win[1], a), tt = (zz - wz) / s[2]; let x = RM.XR + s[0] * tt, y = lerp(RM.win[2], RM.win[3], b) + s[1] * tt;
      x += .05 * Math.sin(t * .31 + ph); y += .04 * Math.sin(t * .23 + ph * 1.7) - .012 * ((t - T.room[0]) % 4); if (x < -1.0 || y < .45) continue;
      const q = toScr(cam, projR(x, y, zz)), df = Math.abs(1 / zz - 1 / RM.Zw) * 900 * k + 1.3, al = .2 * br * (1 - .5 * Math.abs(zz - RM.Zw));
      const gr = o.createRadialGradient(q[0], q[1], 0, q[0], q[1], df * 2); gr.addColorStop(0, `rgba(255,226,180,${al})`); gr.addColorStop(1, 'rgba(255,226,180,0)'); o.fillStyle = gr; o.fillRect(q[0] - df * 2, q[1] - df * 2, df * 4, df * 4); } }
    o.restore();
    bloom(o, .45);
    grain(o, .1);
    return { cam, Qw, Qj, Qp };
  }

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
    for (const [sc, f, w, em] of [['room', camRoom, T.room, () => 0], ['road', (t) => { const z = zoomRoad(t, T); return [540, 960, z]; }, T.road, () => 1 / .4], ['alley', camAlleyN, T.alley, () => 0]])
      for (let t = w[0]; t < w[1] - .01; t += .25) { const [v, z] = sp(f, t, w); rows.push([sc, +t.toFixed(2), v, z, +em(t).toFixed(2)]); }
    const note = (k, d, t) => { J[k] = Math.max(J[k] || 0, d); if (d > mx.v) mx = { v: d, t: +t.toFixed(2), who: k }; };
    let pw = null; for (let t = T.room[0]; t < T.room[1]; t += dt) { const Q = poseWoman(t, T), a = { wElbow: ang2(Q.Sh, Q.arm.E, Q.arm.W), wKnee: ang2(Q.H, Q.K, Q.A), wTorso: Q.th, wHead: Math.atan2(Q.hd[1], Q.hd[0]) };
      if (pw) for (const k in a) note(k, Math.abs(a[k] - pw[k]), t); pw = a; }
    let pa = null; for (let t = T.alley[0]; t < T.alley[1]; t += dt) { const Q = poseAlleyN(t, T), a = { pHeadLift: Math.acos(clamp(V.dot(Q.Bd, Q0.Bd), -1, 1)) }; if (pa) for (const k in a) note(k, Math.abs(a[k] - pa[k]), t); pa = a; }
    // planted contacts: her wrist while planted, Peter's feet in the doorway (fixed by construction), Peter's wrist on the alley wall (Q0, unchanged)
    let slip = 0, prevW = null; for (let t = T.rise[0] + .45 * (T.rise[1] - T.rise[0]); t < T.rise[0] + .63 * (T.rise[1] - T.rise[0]); t += dt) { const Q = poseWoman(t, T); if (prevW) slip = Math.max(slip, Math.hypot(Q.arm.W[0] - prevW[0], Q.arm.W[1] - prevW[1])); prevW = Q.arm.W; }
    const reach = []; for (let t = T.room[0]; t < T.room[1]; t += dt) { const Q = poseWoman(t, T); reach.push(Math.hypot(Q.arm.W[0] - Q.Sh[0], Q.arm.W[1] - Q.Sh[1]) - (LEN.ua + LEN.fa)); }
    return { rows, maxJoint: { rad: +mx.v.toFixed(4), deg: +(mx.v * 180 / Math.PI).toFixed(2), t: mx.t, who: mx.who, per: Object.fromEntries(Object.entries(J).map(([k, v]) => [k, +(v * 180 / Math.PI).toFixed(2)])) },
      wristSlip: +slip.toFixed(5), armOverReach: +Math.max(...reach).toFixed(4), ALLEY_END: AE, edge: { start: +hbN(T.alley[0], T).toFixed(3), end: +hbN(T.alley[1], T).toFixed(3) } }; }
  return { draw, measure, refC, poseWoman, alleyFrame, roomFrame };
}
