// pentecost3d.js — 「kingdom」 8부 「오순절」 N170–N172 (film 970.8 → 986.8): the director's approach (rounds/r10-pilot/director3-plan.md B,
// batch3-director.md; owner 2026-11-26 "그래"), built on the first draft's aerial (git edc61537 s3).
// N170 "약속하신 대로 성령이 오신 날, / 여종 앞에서 떨던 그 베드로가 일어나 예수님을 전했습니다."
// N172 "그날, 삼천 명이 세례를 받았습니다. / 사람을 취하리라던 그 말씀대로."   (next: N173 at 986.8, bread outside a door, warm light)
// A shot that grows in three steps: one shadow → one man before many → three thousand from above.
// Skills read first (rules.json skills-first; nothing edited at the source): motion-skills/cinematic-3d (lib3d/cine.js + kit.js) ·
//   canvas-film/kits/fresco (kit-fresco.js: the limewashed wall, loaded by the page as window.FRESCO) · cinecode camera-moves.md ·
//   canvas-film BODY-CHECK / SCENE-RULES / LESSONS. Copied with source notes: bw-rooster-p1.js's 2D shadow rig (part 5 approach 1);
//   heal-village.js walls/olive/palm; lake-peter3d-b.js tiedHead/dressMan/peter/person, corona/godRays, the motes.
// Film refs: Tarkovsky 「거울」 (wind passing over the field: the invisible shown by matter) for P1/P2; part 5's wall shadows, reversed;
//   「노인을 위한 나라는 없다」 low sun for P3; George Steinmetz's camel caravans from the air (the body a speck, the shape in the long
//   shadow) and 「간디」's funeral from the air (a crowd as a river) for P4; 「아웃 오브 아프리카」 for the warm haze by height.
// Shots (every time from beats(B); c1 = N170's second piece, c2b = N172's second piece):
//   P1 s1  N170 → c1        push in, the stepped street: cool shadow, a front of warm light runs down it (45 m/s), dust only in its band
//   P2     c1 → c1+3.2      2D: Peter's shadow on a limewashed portico wall (#f3d29a; shadow #6b5f73, 9–24 px penumbra), bowed (part 5's
//                           body) → the band of light crosses the wall right → left → the shadow rises (waist and shoulders, +6 %) → the
//                           crowd's head-and-shoulder shadows turn to him one by one (0.15 s apart) → his right arm rises once (IK, elbow
//                           down/out, open hand, 35° above level). Dolly out 1.00 → 0.92, ease-in-out.
//   P3     c1+3.2 → N172    telephoto from the foot of the steps, crane up with inertia: Peter small (≈ 5 %) against the bright sky, the arm
//                           already up (match on P2's action), it goes once slowly forward; the crowd only as long shadows on the treads
//                           (shadow-camera layer), the tread edges lines of gold; the sun up-left of him (x 230, y 520), never behind his head
//   P4     N172 → N173      the aerial: low sun 19° (shadows to the lower left, 4.9 m), crane up D 140 → 300 m, pitch 66° → 84°, fov 30°,
//                           yaw 6°, NO depth of field; five streets flow into a funnel narrowing onto the stepped pool (part 1's net bag);
//                           people matte cloth patches (≤ 12 px at the start, ≈ 5 px at the end) drawn by their shadows; golden rings 1 → 6/s,
//                           glints that live .3–.6 s; on 「사람을 취하리라던」 the sun flares in from the upper right and the frame warms (≥ 120 at the end)
//   ?var=b (page): a 1.0 s hard cut at c2b to part 1's underwater net (lake-peter3d-b.js uwA, u 27.9–28.9) and back.
// Rules kept: Peter = broad shoulders, tied head cloth, no face, small/backlit/shadow only; no close heads; no flames, no dove; no words in the
//   art; fixed dither; everything a pure function of t; clean cuts.
// Sound cue table (film seconds at the current script; all from beats()):
//   970.8–974.1  P1 as before: low wind, far voices; the light front a rising gust down the street passing the lens ≈ 973.5, cloth flaps
//   974.1  P2: the crowd's murmur hushes (0.8 s) · 974.5 wind sweeps the wall with the band (cloth flapping) · 974.9 cloth straightens
//   975.7  Peter's voice begins: firm, loud, words not intelligible, 1.4 s stone-portico reverb · 975.5–977.0 crowd shadows turn (cloth, 0.15 s apart)
//   976.1  sleeve brushing as the arm rises (1.2 s)
//   977.3  P3: the voice goes on; a low 「아…」 spreads through the crowd; the second band of wind passes down over the steps
//   979.8  P4: many footsteps from all sides, water lapping; baptisms (a soft plunge + ring, 1.2 s) one by one, then overlapping (1 → 6/s)
//   983.4  part 1's net rhyme: the rope tightening and creaking and the silver shoal cutting water, −14 dB, 1.4 s (var b: the cut itself)
//   986.3  a chord opens into N173 · 986.8 cut
// API: const PC = await (await import('./pentecost3d.js')).build(W, H); T = beats(B); PC.draw(ctx, t, T)  ·  PC.probe(t, T) · PC.joints(t, T)
import { Film, THREE, V, col, rng, GLSL } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const D2R = Math.PI / 180;
const hsh = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const yawTo = d => Math.atan2(-d.x, -d.z);   // a figure faces −z: the root yaw that makes him face world direction d

// ---------------------------------------------------------------- the street: a stepped road climbing toward −z (the sun's side)
const ZS0 = -10, RISE = .16, RUN = 1.6, ZST0 = -48.2, ZST1 = -50.6, NST = 6;
const hS = z => RISE * Math.floor(Math.max(0, ZS0 - z) / RUN);
const Y0ST = hS(ZST0 + 1e-6), PLAT = Y0ST + 2.1;   // fix 2: a taller stair, Peter higher against the sky
const gY = z => z > ZST0 ? hS(z) : z > ZST1 ? Y0ST + Math.ceil((ZST0 - z) / ((ZST0 - ZST1) / NST) - 1e-9) * (PLAT - Y0ST) / NST : Math.max(hS(z), PLAT);
const PLZ = z => ss(-26, -30, z) * (1 - ss(-49.6, -50.8, z));   // the square: the street widens
const halfW = z => 3.6 + 4.9 * PLZ(z);
const PETER = V(-.5, PLAT, -52.2);
// the sun up the street and to the left: it rakes the right-hand walls (the front reads on them) and backlights Peter from his left
const SUN1 = V(Math.sin(-22 * D2R) * Math.cos(16 * D2R), Math.sin(16 * D2R), -Math.cos(22 * D2R) * Math.cos(16 * D2R));   // fix 1: lower, so Peter stands against the bright sky near the sun
// ---------------------------------------------------------------- the pool (shot 3), far from the street (fog hides one from the other)
const PO = V(0, 0, 640), PSI = 14 * D2R, NR = 6, A0 = 7.4, B0 = 4.1, DR = .85, STEP = .3, YW = -(NR * STEP) - .36, YF = YW - .95;
const SUN3 = V(Math.sin(-12 * D2R) * Math.cos(13 * D2R), Math.sin(13 * D2R), -Math.cos(12 * D2R) * Math.cos(13 * D2R));   // fix 1: a low sun beyond the pool — long shadows toward the lens

// ---------------------------------------------------------------- the 2D shadow rig: copied unchanged from bw-rooster-p1.js (part 5 approach 1, owner-approved)
const TAU = Math.PI * 2;
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
// director fix: a FRONTAL man's shadow — the rooster head() drapes both sides at turn 0 and reads as a hood/veil. Here: a level-topped cloth,
// straight down past the jaw to the shoulder, a beard under the chin; no knot, no point, no ring on the head.
function fhead(g, cx, cy, r) { blob(g, [[cx - r * .9, cy + r * .62], [cx - r * .56, cy + r * 1.08], [cx, cy + r * 1.2], [cx + r * .56, cy + r * 1.08], [cx + r * .9, cy + r * .62], [cx + r * 1.02, cy - r * .1], [cx + r * .96, cy - r * .9], [cx + r * 1.3, cy - r * 1.55], [cx + r * 1.75, cy - r * 1.95],
    [cx - r * 1.75, cy - r * 1.95], [cx - r * 1.3, cy - r * 1.55], [cx - r * .96, cy - r * .9], [cx - r * 1.02, cy - r * .1]]); blob(g, [[cx - r * .62, cy - r * .55], [cx + r * .62, cy - r * .55], [cx + r * .5, cy - r * 1.32], [cx, cy - r * 1.52], [cx - r * .5, cy - r * 1.32]]); }
function fman(g, b, x, y, s, o = {}) { const { h = 1.2, br = 1, lean = 0, sv = 1.06, hx = 0, hy = 0 } = o; atf(g, b, x, y, s, lean, 1, sv); const sh = h - .36, hc = h - .15, r = .116;
  robe(g, sh, br); limb(g, 0, sh + .02, .074, hx * .6, hc - .07 + hy * .5, .058); fhead(g, hx, hc + hy, r); return { sh, hc }; }
function sman(g, b, x, y, s, o = {}) { const { h = 1.2, br = 1, turn = 0, lean = 0, sv = 1.06, jesus = false, veil = false, beard = true, hx = 0, hy = 0 } = o; atf(g, b, x, y, s, lean, 1, sv); const sh = h - .36, hc = h - .15, r = .116;
  robe(g, sh, br); limb(g, 0, sh + .02, .074, turn * .018 + hx * .6, hc - .07 + hy * .5, .058);
 head(g, turn * .022 + hx, hc + hy, r, turn, { jesus, veil, beard }); return { sh, hc }; }

export function beats(B) {
  const T = { ...B }, c1 = B.N170b, c2 = B.N172, end = B.N173;
  const p2 = c1, p3 = c1 + 3.2;                 // director3-plan B1: P2 the wall 3.2 s, P3 the far steps to N172
  T.shots = [['s1', B.N170, c1], ['p2', p2, p3], ['p3', p3, c2], ['p4', c2, end]];
  T.t0 = B.N170; T.c1 = c1; T.p2 = p2; T.p3 = p3; T.c2 = c2; T.c2b = B.N172b ?? c2 + 3.6; T.end = end;
  T.sun = [B.N170 + .05, B.N170 + 1.0];        // the sun comes out of the cloud
  T.fr0 = B.N170;                               // the front: z = −110 at fr0, +45 m/s toward the lens (passes it ≈ fr0 + 2.8)
  T.bow = [c1 + .2, c1 + 1.0];                  // the 3D Peter straightens behind P2 (unseen) …
  T.arm = [c1 + 1.2, c1 + 2.6];                 // … and his arm is already up when P3 opens (a match on the action of P2's shadow)
  T.sweep = [c1 + 1.2, c1 + 4.4];               // s2: the second band of light, from him over the crowd to the lens
  return T;
}

export async function build(W, H) {
  const vert = H > W, FOV = vert ? 46 : 32;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .1, far: 3000,
    atmos: { density: .006, falloff: .035, base: 0, start: 2, color: col('#c49a70', .6), colorUp: col('#a8a8b0', .55), max: 2000, scatter: 1, anisotropy: .8, phaseMix: .85 },
    bloom: { strength: .07, radius: 1.1, tint: col('#ffe2b8') },
    dof: { focus: 20, aperture: .6, maxCoc: 18 },
    look: { exposure: 1.0, contrast: 1.05, saturation: 1.0, lift: col('#0a0908'), shadowTint: col('#d0d4e8'), highTint: col('#fff0d8'), vignette: .3, grain: .024, ca: .3 },
  });
  film.canvas.style.display = 'none';
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither: no per-frame shimmer (lake-peter3d-b.js)
  const S = film.scene, cam = film.camera;
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const G = {}; for (const n of ['street', 'pool']) { const g = new THREE.Group(); S.add(g); G[n] = g; }

  // ---------------------------------------------------------------- light
  const sky = K.sky(film, { top: col('#56739f', .6), mid: col('#cfae8e', .95), horizon: col('#ffd39a', 1.6), sunDir: SUN1, sunColor: col('#fff1d4', 18), sunGlow: col('#ffc583', 1.5), clouds: .3, cloudColor: col('#ffe2c0', 1.1), cloudShade: col('#a48a84', .7) });
  const SK = sky.u;
  const hemi = new THREE.HemisphereLight(col('#a8b6cc'), col('#6a5240'), .6); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffd7a2'), 3.2); sunL.castShadow = true; sunL.shadow.mapSize.set(4096, 4096);
  sunL.shadow.bias = -.0004; sunL.shadow.normalBias = .04; S.add(sunL, sunL.target);
  const sunLamp = film.lamp(V(0, 200, -2000), '#ffcf96', { power: 900, size: 6, fog: 1 });
  const frontLamp = film.lamp(V(0, 5, -60), '#ffd49a', { power: 0, size: 7, fog: 1 });
  let shadowKey = '';
  function shadowAt(c, half, dir) { const k = c.x.toFixed(1) + c.z.toFixed(1) + half + dir.x.toFixed(3); if (k === shadowKey) return; shadowKey = k;
    sunL.target.position.copy(c); sunL.position.copy(c).addScaledVector(dir, 400); const sc = sunL.shadow.camera; Object.assign(sc, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 900 }); sc.updateProjectionMatrix(); sunL.target.updateMatrixWorld(); }

  // ---------------------------------------------------------------- one patch for every lit surface: the light front + the rim light
  // The sun's direct light is masked by a front in world space (lit where z < uFront, the edge broken by noise like a cloud shadow's);
  // uShade = how much direct light the shadowed side keeps; the edge itself adds a warm glow (the band). Rim after lake-peter3d-b.js rimify.
  const LU = { uGold: { value: 0 }, uFront: { value: -1e4 }, uEdgeK: { value: 0 }, uEdgeW: { value: 5 }, uEdgeC: { value: col('#ffd8a0', 1) }, uShade: { value: 1 }, uSunV: { value: V(0, 0, -1) }, uRimC: { value: col('#ffb070', 1.15) }, uT: { value: 0 } };
  function patch(m, key, { rim = 0, map = '', wave = false } = {}) {
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, LU); sh.uniforms.uRimS = { value: rim };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLWP; varying vec3 vLWN; uniform float uFront, uEdgeK, uT;')
        .replace('#include <begin_vertex>', wave ? `#include <begin_vertex>
          { vec4 wz = modelMatrix * vec4(position, 1.); float ed = exp(-pow((wz.z - uFront) / 7., 2.)) * uEdgeK;
            transformed.z += (sin(uT * 5.3 + wz.z * 1.3 + wz.x) * .025 + ed * sin(uT * 10.5 + wz.x * 2.1 + wz.z) * .1) * uv.y; }` : '#include <begin_vertex>')
        .replace('#include <project_vertex>', `#include <project_vertex>
          { vec4 lw = vec4(transformed, 1.); vec3 ln = objectNormal;
            #ifdef USE_INSTANCING
            lw = instanceMatrix * lw; ln = mat3(instanceMatrix) * ln;
            #endif
            vLWP = (modelMatrix * lw).xyz; vLWN = normalize(mat3(modelMatrix) * ln); }`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
          varying vec3 vLWP; varying vec3 vLWN; uniform float uFront, uEdgeK, uEdgeW, uShade, uRimS, uT, uGold; uniform vec3 uEdgeC, uSunV, uRimC; float gE = 0.;
          ${GLSL.hash}
          float frontZ(vec3 p){ return p.z + (vnoise(p.xz * .05 + 3.) - .5) * 7. - p.y * .3; }   // director fix: smooth in z only — the .3-frequency term flickered the left wall`)
        .replace('#include <map_fragment>', '#include <map_fragment>\n' + map)
        .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
          { float fz = frontZ(vLWP), lit = 1. - smoothstep(uFront - 5., uFront + 5., fz), ed = exp(-pow((fz - uFront) / uEdgeW, 2.)) * uEdgeK;
            float sh = mix(uShade, 1., lit); reflectedLight.directDiffuse *= sh; reflectedLight.directSpecular *= sh;
            totalEmissiveRadiance += diffuseColor.rgb * uEdgeC * ed + vec3(1., .835, .54) * gE * uGold * 2.6 * smoothstep(.0, .004, dot(reflectedLight.directDiffuse, vec3(.33)));   /* the gold edge is sunlight: the crowd's shadows cut it */
            if (uRimS > 0.) { vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 3.2); totalEmissiveRadiance += uRimC * fr * smoothstep(-.2, .55, dot(normal, uSunV)) * uRimS * mix(.25, 1., lit); } }`); };
    m.customProgramCacheKey = () => 'pc-' + key; return m; }
  // plastered fieldstone / mud brick where the plaster fell (heal-village.js wallM, copied; brick courses added)
  const WALL = `{ vec3 N = normalize(vLWN); vec2 q = abs(N.y) > .7 ? vLWP.xz : (abs(N.x) > abs(N.z) ? vLWP.zy : vLWP.xy);
      float big = fbm(q * .35 + 3.1), fine = vnoise(q * 3.1) * .6 + vnoise(q * 7.3) * .4;
      vec3 c = diffuseColor.rgb * mix(.8, 1.1, big) * mix(.9, 1.06, fine);
      vec2 bq = vec2(q.x * 2.3 + floor(q.y * 3.1) * .5, q.y * 3.1); float brick = smoothstep(.0, .08, fract(bq.x)) * smoothstep(.0, .1, fract(bq.y));
      float bare = smoothstep(.5, .6, fbm(q * .45 + 11.)) * (1. - abs(N.y));
      c = mix(c, c * mix(.55, .95, brick) * vec3(1.04, .93, .82), bare * .9);
      c *= mix(1., .82, smoothstep(.62, .8, vnoise(vec2(q.x * 4., q.y * .4))) * (1. - abs(N.y)));
      diffuseColor.rgb = c; }`;
  // limestone treads: slabs across the street, worn paler in the middle where feet go, darker risers
  const PAVE = `{ vec3 N = normalize(vLWN); vec2 q = vLWP.xz; float n = fbm(q * .4), f = vnoise(q * 4.1);
      vec3 c = diffuseColor.rgb * mix(.84, 1.08, n) * mix(.93, 1.05, f);
      { float row = floor(q.y * 1.1), sx = q.x * .7 + h12(vec2(row, 3.)) * 5., slab = floor(sx);
        float jx = smoothstep(.0, .05, fract(sx)) * smoothstep(1., .95, fract(sx)), jz = smoothstep(.0, .06, fract(q.y * 1.1)) * smoothstep(1., .94, fract(q.y * 1.1));
        c *= mix(.86, 1.08, h12(vec2(slab, row))) * mix(.62, 1., jx * jz * step(.7, N.y) + (1. - step(.7, N.y))); }
      c *= mix(1., 1.08, (1. - smoothstep(1.2, 3.2, abs(vLWP.x))) * step(.7, N.y));
      if (N.y < .5) c *= .72;
      { float fe = fract((-10. - vLWP.z) / 1.6); gE = step(.7, N.y) * (1. - smoothstep(.0, .08, fe)) * step(vLWP.z, -10.); }   // the tread's front edge (P3: a line of gold)
      diffuseColor.rgb = c; }`;
  const M = {
    wall: patch(K.std('#d8c09c', { roughness: .92 }), 'w1', { map: WALL }), wall2: patch(K.std('#c9a57c', { roughness: .92 }), 'w2', { map: WALL }), wall3: patch(K.std('#e0ccaa', { roughness: .92 }), 'w3', { map: WALL }),
    wall4: patch(K.std('#b8986f', { roughness: .95 }), 'w4', { map: WALL }), wall5: patch(K.std('#d2cabb', { roughness: .9 }), 'w5', { map: WALL }), wall6: patch(K.std('#a8957c', { roughness: .95 }), 'w6', { map: WALL }),
    pave: patch(K.std('#cdb898', { roughness: .9 }), 'pv', { map: PAVE }), ashlar: patch(K.std('#d6c6a6', { roughness: .9 }), 'as', { map: WALL }),
    dark: K.std('#1a120c', { roughness: 1 }), wood: patch(K.std('#5a4028', { roughness: .85 }), 'wd'), roof: patch(K.std('#a8906e', { roughness: .95 }), 'rf'),
    leaf: patch(K.std('#5f6a4a', { roughness: .9 }), 'lf'), trunk: patch(K.std('#4a3a2a', { roughness: .95 }), 'tk'),
  };
  const awnCols = ['#9a6a3a', '#7a3a2a', '#b89a6a', '#4c5a6a', '#8a7a52'].map((c, i) => patch(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'aw' + i, { wave: true }));

  // the far street beyond the landing (P3 hides it: from the foot of the steps Peter then stands against the open sky)
  const FAR = new THREE.Group(); G.street.add(FAR);
  // ---------------------------------------------------------------- the street's ground: one merged mesh of treads (40 m wide, under the houses)
  { const br = new Set([80, ZS0, ZST0, ZST1, -290]); for (let z = ZS0; z > -290; z -= RUN) br.add(+z.toFixed(4)); for (let i = 1; i < NST; i++) br.add(+(ZST0 - i * (ZST0 - ZST1) / NST).toFixed(4));
    const zs = [...br].sort((a, b) => b - a), parts = [], partsF = [];
    for (let i = 0; i < zs.length - 1; i++) { const z0 = zs[i], z1 = zs[i + 1], y = gY((z0 + z1) / 2), g = new THREE.BoxGeometry(46, y + 3, z0 - z1); g.translate(0, (y - 3) / 2, (z0 + z1) / 2); (z0 > -64 ? parts : partsF).push([g]); }
    for (const [pp, grp] of [[parts, G.street], [partsF, FAR]]) { const m = new THREE.Mesh(K.mergeGeometries(pp), M.pave); m.receiveShadow = true; m.castShadow = true; grp.add(m); } }

  // ---------------------------------------------------------------- houses on both sides (irregular, plaster and bare brick, doors, awnings)
  const R = rng(7070), boxes = [], beamM4 = [], lampAt = [];
  const addBox = (grp, w, h, d, x, y, z, ry, mat, r = .06) => { const b = new THREE.Mesh(K.roundedBox(w, h, d, r, 2), mat); b.position.set(x, y, z); b.rotation.y = ry; b.castShadow = b.receiveShadow = true; grp.add(b); return b; };
  const archG = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0); return new THREE.ShapeGeometry(s, 10); };
  const glowM = K.glow('#ffb468', 1.5), WALLS = [M.wall, M.wall2, M.wall3, M.wall4, M.wall5, M.wall6];
  for (const sd of [-1, 1]) { let z = 46; while (z > -290) {
      const wz = 3.6 + R() * 4.4, d = 6 + R() * 4, z1 = z - wz, zc = (z + z1) / 2; let hw = 0; for (let k = 0; k <= 6; k++) hw = Math.max(hw, halfW(lerp(z, z1, k / 6)));
      const x0 = sd * (hw + .1 + R() * .9), base = gY(z) - .5, lowZ = zc < -47, top = gY(z1) + (lowZ ? 2.2 + R() * .7 : 3 + R() * 3.6 + (R() < .3 ? 2.6 : 0)), m = WALLS[(R() * WALLS.length) | 0], ry = (R() - .5) * .06, far = zc < -150;   // fix 1: low houses round the landing — the sky opens behind Peter
      const hg = new THREE.Group(); hg.position.set(x0 + sd * d / 2, 0, zc); hg.rotation.y = ry; (zc < -57 ? FAR : G.street).add(hg);
      addBox(hg, d, top - base, wz, 0, (top + base) / 2, 0, 0, m);
      addBox(hg, d + .12, .18, wz + .12, 0, top + .04, 0, 0, M.roof, .04);
      // an irregular roof line: parapets of different heights, a room on the roof, a low dome, beam ends under the roof
      const ph = .25 + R() * .55; for (const s2 of [-1, 1]) addBox(hg, d, ph, .18, 0, top + ph / 2 + .1, s2 * (wz / 2 - .09), 0, m, .04);
      addBox(hg, .18, ph * (.6 + R() * .6), wz, -sd * (d / 2 - .09), top + ph / 2 + .1, 0, 0, m, .04);
      const roofK = lowZ ? .8 + R() * .2 : R();
      if (roofK < .4) { const uw = d * (.35 + R() * .25), ud = wz * (.4 + R() * .3), uh = 2.2 + R() * .8, ux = sd * (d / 2 - uw / 2 - .4) * R(), uz = (R() - .5) * (wz - ud) * .6; addBox(hg, uw, uh, ud, ux, top + uh / 2, uz, 0, m);
        addBox(hg, uw + .1, .14, ud + .1, ux, top + uh + .05, uz, 0, M.roof, .03);
        if (R() < .5) { const dm = new THREE.Mesh(new THREE.SphereGeometry(Math.min(uw, ud) * .38, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), m); dm.position.set(ux, top + uh + .1, uz); dm.castShadow = dm.receiveShadow = true; hg.add(dm); } }
      else if (roofK < .58) { const r0 = Math.min(d, wz) * (.28 + R() * .08), dm = new THREE.Mesh(new THREE.SphereGeometry(r0, 20, 9, 0, Math.PI * 2, 0, Math.PI / 2), m); dm.position.set(sd * .3, top + .1, 0); dm.scale.y = .8; dm.castShadow = dm.receiveShadow = true; hg.add(dm); }
      else if (roofK < .72) { for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const po = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 2.1, 5), M.wood); po.position.set(-sd * (d / 2 - 1.6) + px * .9, top + 1.05, pz * Math.min(1.3, wz / 2 - .4)); po.castShadow = true; hg.add(po); }   // a pergola on the roof (vine poles, slats)
        for (let k = 0; k < 6; k++) { const sl = new THREE.Mesh(new THREE.BoxGeometry(2.0, .06, .08), M.wood); sl.position.set(-sd * (d / 2 - 1.6), top + 2.1, (k / 5 - .5) * Math.min(2.6, wz - .8)); sl.castShadow = true; hg.add(sl); } }
      const fy = gY(zc), fx = -sd * (d / 2 + .012), bn = Math.floor(wz / .55);
      if (R() < .55 && zc >= -57) for (let k = 0; k < bn; k++) beamM4.push(new THREE.Matrix4().compose(hg.position.clone().add(V(fx - sd * .16, top - .32, (k + .5) * wz / bn - wz / 2).applyAxisAngle(V(0, 1, 0), 0)), new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), Math.PI / 2), V(1, 1, 1)));
      if (wz > 3.8 && R() < .85) { const dw = .9 + R() * .3, dh = 1.8 + R() * .35, arch = R() < .5, door = new THREE.Mesh(arch ? archG(dw, dh + .3) : new THREE.PlaneGeometry(dw, dh), M.dark); door.rotation.y = -sd * Math.PI / 2; const dz = (R() - .5) * (wz - 2.2); door.position.set(fx, fy + (arch ? 0 : dh / 2), dz); hg.add(door);
        if (!arch) addBox(hg, .28, .2, dw + .5, fx + sd * -.08, fy + dh + .1, dz, 0, M.wood, .03);
        else { const ar = new THREE.Mesh(new THREE.TorusGeometry(dw / 2 + .08, .09, 5, 14, Math.PI), m); ar.rotation.y = -sd * Math.PI / 2; ar.position.set(fx - sd * .03, fy + dh + .3 - dw / 2, dz); hg.add(ar); }
        if (!far && zc > -80 && R() < .3 && lampAt.length < 8) { const gl = new THREE.Mesh(new THREE.PlaneGeometry(dw * .7, dh * .5), glowM); gl.rotation.y = -sd * Math.PI / 2; gl.position.set(fx + sd * .25, fy + dh * .3, dz); hg.add(gl); lampAt.push(hg.position.clone().add(V(fx - sd * .4, fy + .9, dz))); } }
      // a wooden balcony, or an outside stair up to the roof
      if (!far && R() < .16) { const bz = (R() - .5) * (wz - 2.4), bwz = Math.min(2.4, wz - 1); addBox(hg, .9, .14, bwz, fx - sd * .45, fy + 3.0, bz, 0, M.wood, .02); for (let k = 0; k <= 4; k++) { const po = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .8, 5), M.wood); po.position.set(fx - sd * .86, fy + 3.45, bz + (k / 4 - .5) * bwz); hg.add(po); } addBox(hg, .06, .06, bwz, fx - sd * .86, fy + 3.85, bz, 0, M.wood, .01); }
      else if (!far && R() < .15 && wz > 4.5) { const nS = Math.max(4, Math.round((top - fy) / .32)); for (let k = 0; k < nS; k++) addBox(hg, .85, (k + 1) * (top - fy) / nS, .34, fx - sd * .43, fy + (k + 1) * (top - fy) / nS / 2, wz / 2 - .3 - k * (wz - .6) / nS, 0, m, .03); }
      for (let k = 0; k < 4; k++) if (R() < .55 && top - fy > 4) { const win = new THREE.Mesh(new THREE.PlaneGeometry(.42, .55), M.dark); win.rotation.y = -sd * Math.PI / 2; win.position.set(fx, fy + 2.9 + R() * (top - fy - 3.8), (R() - .5) * (wz - 1.2)); hg.add(win); }
      if (R() < .4) { const aw = 1.0 + R() * .5, al = Math.min(wz - .6, 2.2 + R() * 1.8), ag = new THREE.PlaneGeometry(al, aw, 10, 4); const awn = new THREE.Mesh(ag, awnCols[(R() * awnCols.length) | 0]);
        awn.rotation.order = 'YXZ'; awn.rotation.y = -sd * Math.PI / 2; awn.rotation.x = -(Math.PI / 2 - .38); awn.position.set(fx - sd * aw * .46, fy + 2.35, (R() - .5) * (wz - al)); awn.castShadow = awn.receiveShadow = true; hg.add(awn);
        // poles to the street (the awning hangs on them)
        for (const e of [-1, 1]) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2.0, 5), M.wood); pl.position.set(fx - sd * aw * .9, fy + 1.0, awn.position.z + e * (al / 2 - .1)); pl.castShadow = true; hg.add(pl); } }
      if (R() < .3) { const jar = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .55, 10), patch(K.std('#9a6a48', { roughness: .9 }), 'jar')); jar.position.set(fx - sd * .3, fy + .27, (R() - .5) * (wz - 1)); jar.castShadow = true; hg.add(jar); }
      boxes.push(hg);
      z = z1 - (R() < .22 ? 1.2 + R() * .9 : 0); } }
  // the landing's low wall behind Peter is the street going on up; beyond the city: the temple's platform and sanctuary in the haze
  { const gt = gY(-290); const pl = new THREE.Mesh(new THREE.PlaneGeometry(900, 700), M.pave); pl.rotation.x = -Math.PI / 2; pl.position.set(0, gt, -640); pl.receiveShadow = true; G.street.add(pl);
    const zt = -900; addBox(G.street, 230, 40, 30, -300, gt + 20 - 6, zt, 0, M.ashlar, .3);
    for (let k = 0; k < 9; k++) addBox(G.street, 3, 4, 3, -410 + k * 28, gt + 36, zt + 14, 0, M.ashlar, .2);   // the colonnade's line along the top, far off
    addBox(G.street, 34, 44, 50, -306, gt + 34 + 22, zt - 60, 0, M.wall5, .4); addBox(G.street, 54, 22, 40, -306, gt + 34 + 11, zt - 40, 0, M.wall5, .4);
    addBox(G.street, 36, 1.2, 52, -306, gt + 34 + 44.6, zt - 60, 0, patch(K.std('#e8d0a0', { roughness: .5, metalness: .3 }), 'tg'), .2); }
  { const bm = new THREE.InstancedMesh(new THREE.CylinderGeometry(.07, .08, .42, 6), M.wood, beamM4.length); beamM4.forEach((q, i) => bm.setMatrixAt(i, q)); bm.castShadow = true; G.street.add(bm); }
  const doorLamps = lampAt.map(p => film.lamp(p, '#ffb466', { power: 0, size: .25, fog: 1 }));
  // olive trees and palms rising behind the roofs (heal-village.js olive/palm, copied)
  const olive = (grp, x, z, h, seed, y0) => { const tr = K.tree({ seed, height: h, trunk: .2, depth: 4, spread: .7, up: .2, twig: 0, mat: M.trunk, layer: 0 }); tr.position.set(x, y0, z); grp.add(tr);
    const r = rng(seed), n = 46, geo = new THREE.IcosahedronGeometry(.55, 0), inst = new THREE.InstancedMesh(geo, M.leaf, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * h * .38, y = y0 + h * (.55 + r() * .35); m4.compose(V(x + Math.cos(a) * rr, y, z + Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, 0)), V(1, .7, 1).multiplyScalar(.7 + r() * .8)); inst.setMatrixAt(i, m4); }
    inst.castShadow = true; grp.add(inst); };
  for (const [x, z, h] of [[-13, -20, 7], [14, -42, 8], [-15, -70, 7.5], [13, -96, 7], [-14, 4, 6.5], [16, -8, 7]]) olive(G.street, x, z, h, (x * 7 + z) | 0, gY(z) + 2.5);
  const palm = (grp, x, z, h, seed, y0) => { const r = rng(seed), segs = [], g = new THREE.Group(); let p = V(x, y0, z), d = V((r() - .5) * .3, 1, (r() - .5) * .3).normalize();
    for (let i = 0; i < 10; i++) { const e = p.clone().addScaledVector(d, h / 10); segs.push(p.x, p.y, p.z, e.x, e.y, e.z, .2 - i * .008, .19 - i * .008); p = e; d.add(V(.02, 0, 0)).normalize(); }
    g.add(new THREE.Mesh(K.tubesGeometry(segs, 7), M.trunk));
    const pm = patch(K.std('#4f6a3c', { roughness: .85, side: THREE.DoubleSide }), 'palm');
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + r(), L = 2.6 + r() * .8, fg = new THREE.PlaneGeometry(L, .45, 8, 1); fg.translate(L / 2, 0, 0);
      const pos = fg.attributes.position; for (let k = 0; k < pos.count; k++) { const u = pos.getX(k) / L; pos.setY(k, pos.getY(k) * (1 - u * .7) - u * u * 1.2); } fg.computeVertexNormals();
      const f = new THREE.Mesh(fg, pm); f.position.copy(p); f.rotation.set(0, a, .35 + r() * .3); f.castShadow = true; g.add(f); }
    grp.add(g); };
  palm(G.street, -12.5, -36, 11, 3, gY(-36)); palm(G.street, 12, -60, 12, 5, gY(-60)); palm(G.street, -11.5, -112, 12, 7, gY(-112));

  // ---------------------------------------------------------------- people (lake-peter3d-b.js: one Peter, tied head cloth, loose robe; person())
  const tunicM = patch(K.std('#2c2219', { roughness: .95, side: THREE.DoubleSide }), 'pt', { rim: 1.2 }), clothM = patch(K.std('#1b2432', { roughness: .95, side: THREE.DoubleSide }), 'pc', { rim: 1.1 });
  const faceM = K.std('#2a1a10', { roughness: 1 }), hairM = K.std('#1c140e', { roughness: 1 }), legM = K.std('#17110c', { roughness: 1 }), ropeM = K.std('#3a2e20', { roughness: 1 });
  const tiedHead = (g, m, beard) => { const U = g.userData, s = U.s, n = U.neck; n.children.slice(1).forEach(o => n.remove(o));   // lake-peter3d-b.js
    const mk = (geo, mt) => { const o = new THREE.Mesh(geo, mt); o.castShadow = o.receiveShadow = true; n.add(o); return o; };
    mk(new THREE.CylinderGeometry(.056 * s, .07 * s, .17 * s, 12), legM).position.set(0, -.005 * s, .012 * s);
    const cap = mk(new THREE.SphereGeometry(.124 * s, 20, 12, 0, 6.283, 0, Math.PI * .56), m); cap.position.set(0, .122 * s, .03 * s); cap.scale.set(.92, 1.04, 1.02);
    const bd = mk(new THREE.TorusGeometry(.116 * s, .014 * s, 6, 28), ropeM); bd.rotation.x = Math.PI / 2; bd.position.set(0, .158 * s, .03 * s); bd.scale.set(.93, 1.02, 1);
    mk(new THREE.LatheGeometry([[.116, .16], [.112, .11], [.097, .055], [.09, .01], [.104, -.04], [.132, -.088]].map(([r, y]) => new THREE.Vector2(r * s, y * s)), 20, Math.PI + .9, Math.PI * 2 - 1.8), m).position.z = .03 * s;
    if (beard) { const b = mk(new THREE.SphereGeometry(.066 * s, 12, 9), hairM); b.position.set(0, .052 * s, -.07 * s); b.scale.set(.92, 1.18, .78); U.beard = b; } };
  const dressMan = (g, { hem = 1, flare = .9 } = {}) => { const U = g.userData, s = U.s, B0 = U.skirtBase, top = .99 * s;   // lake-peter3d-b.js
    for (let i = 0; i < B0.length; i += 3) { B0[i] *= flare; B0[i + 2] *= flare; B0[i + 1] = top - (top - B0[i + 1]) * hem; }
    U.skirt.geometry.attributes.position.array.set(B0); U.skirt.geometry.attributes.position.needsUpdate = true; U.skirt.geometry.computeVertexNormals();
    U.shoulders.children.forEach(o => { if (o.geometry && o.geometry.type === 'LatheGeometry') o.visible = false; });
    U.upper.children.forEach(o => { if (o.geometry && o.geometry.type === 'TorusGeometry') { if (o.geometry.parameters.arc < 6) o.visible = false; else { o.material = ropeM; o.scale.set(1.04, .82, 1.6); } } });
    U.arms.forEach(A => { A.S.x *= .97; A.fo.scale.set(.74, 1, .74); }); };
  const peter = () => { const g = P.robeMan({ h: 1.78, broad: 1.02, mat: tunicM, cloth: tunicM, face: faceM, head: 'cloth' }), U = g.userData; tiedHead(g, clothM, true); dressMan(g, { hem: .84, flare: .92 }); U.legs.forEach(L => { L.shin.material = legM; L.foot.material = legM; }); U.ph = .17; return g; };
  const robeCols = ['#5e4c38', '#4c4032', '#6a5642', '#403628', '#5a4834', '#504436', '#64523e', '#48392b', '#8a7458', '#a08a6a'], mantleCols = ['#8a6a34', '#5e5a34', '#7a3626', '#a89a80', '#5a4030', '#4c4842', '#9a8458', '#6a4a2c', '#7c6a48', '#4c5262', '#c8b89a'];
  const dk = c => new THREE.Color(c).multiplyScalar(.3);   // fix 1: dark backlit bodies, the rim carries the shape
  const robes = robeCols.map((c, i) => patch(K.std(dk(c), { roughness: .95, side: THREE.DoubleSide }), 'r' + i, { rim: 1.3 })), mantles = mantleCols.map((c, i) => patch(K.std(dk(c), { roughness: .95, side: THREE.DoubleSide }), 'm' + i, { rim: 1 }));
  const HEADW = ['cloth', 'cloth', 'bare', 'cloth'];   // (turbans read as tubes at this distance in round 1)
  function man(r) { const base = { mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0], face: faceM, kind: 'stand' };   // lake-peter3d-b.js person(), men only
    // round 2: the same tied head cloth as Peter (cap, band, a fall ending at the shoulder) and a beard; no mantle bell — the draped
    // 'cloth' heads read as hooded nuns in the s2 crowd (shared.md: men must read as men, broad level shoulders)
    const p = P.robeMan({ ...base, h: 1.64 + r() * .18, head: 'cloth', broad: 1.04 + r() * .14 }); tiedHead(p, base.cloth, true); dressMan(p, { hem: .86 + r() * .1, flare: .92 });
    p.userData.legs.forEach(L => { L.shin.material = legM; L.foot.material = legM; }); p.userData.ph = r(); return p; }
  // fix 2: in s2 the crowd is not seen — only its long shadows on the steps (layer 3: drawn by the sun's shadow camera, not by the lens)
  sunL.shadow.camera.layers.enable(3); let crowdL = -1;
  const crowdLayer = n => { if (n === crowdL) return; crowdL = n; for (const p of crowd) { p.userData.lay = undefined; p.traverse(o => o.layers.set(n)); } };
  const PT = peter(); PT.position.copy(PETER); PT.rotation.y = Math.PI + .45; G.street.add(PT);
  // the crowd in the square, facing him (an aisle kept clear for the s2 camera)
  const crowd = []; { const r = rng(1702); for (let i = 0; i < 400 && crowd.length < 104; i++) { const x = -7.6 + r() * 15.2, z = -47.2 + r() * 16.6;
      if (Math.abs(x - 2.05) < .95 && z > -44.7) continue; if (crowd.some(q => Math.hypot(q.position.x - x, q.position.z - z) < 1.0)) continue;
      if (Math.abs(x) > halfW(z) - .5) continue;
      const p = man(r); p.position.set(x, gY(z), z); p.rotation.y = yawTo(PETER.clone().sub(p.position)) + (r() - .5) * .3; G.street.add(p); crowd.push(p); } }
  // the lower street (s1): three walkers going up toward the square, two men at their doors, one more far up
  const lower = []; { const r = rng(331);
    for (const [x, z, kind, ry] of [[-1.3, 3.4, 'walk', 0], [1.5, 1.2, 'walk', 0], [.3, -4.5, 'walk', 0], [-3.1, 6.8, 'stand', -1.2], [3.2, -1.5, 'stand', 1.6], [-2.6, -12, 'stand', -.6], [2.2, -18, 'walk', 0]]) {
      const p = man(r); p.position.set(x, gY(z), z); p.rotation.y = ry; p.userData.kind = kind; p.userData.z0 = z; p.userData.t0 = -r() * 1.1; G.street.add(p); lower.push(p); } }

  // ---------------------------------------------------------------- dust in the light (few, only where the light is; DOF applies)
  const NMO = 110, moG = new THREE.BufferGeometry(), moP = new Float32Array(NMO * 3), moA = new Float32Array(NMO);
  moG.setAttribute('position', new THREE.BufferAttribute(moP, 3)); moG.setAttribute('aK', new THREE.BufferAttribute(moA, 1));
  const dotM = (size, c) => new THREE.ShaderMaterial({ uniforms: { uPx: { value: H / 1920 * size }, uC: { value: col(c, 1) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,   // lake-peter3d-b.js
    vertexShader: `attribute float aK; varying float vK; uniform float uPx; void main(){ vK = aK; vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = clamp(uPx / -mv.z, 1.5, 22.) * (.6 + aK * .6); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vK; uniform vec3 uC; void main(){ if (vK <= .001) discard; vec2 q = gl_PointCoord - .5; float d = length(q); float a = smoothstep(.5, .08, d); gl_FragColor = vec4(uC * (1. + a * 1.2) * vK, a * vK); }` });
  const motes = new THREE.Points(moG, dotM(30, '#ffe6c0')); motes.frustumCulled = false; G.street.add(motes);
  // the frontZ() of the shader, on the CPU (same noise is not needed: the motes use the plain z with a small per-mote offset)
  function setMotes(t, shot, zF, edK, edW) {
    const z0 = shot === 's1' ? -62 : -58, z1 = shot === 's1' ? 12 : -30, wind = shot === 's1' ? 1.6 : .9;
    for (let i = 0; i < NMO; i++) { const per = 14 + hsh(i, 3) * 8, ph = ((t * wind / per) + hsh(i, 4)) % 1, z = lerp(z0, z1, (hsh(i, 5) + ph * .35) % 1), x = (hsh(i, 6) - .5) * 2 * (halfW(z) - .4) + Math.sin(t * .4 + i) * .2;
      const y = gY(z) + .4 + hsh(i, 7) * 4.2 + Math.sin(t * .6 + i * 1.7) * .15; moP[i * 3] = x; moP[i * 3 + 1] = y; moP[i * 3 + 2] = z;
      const lit = (zF > 1e3 || shot === 's2' || shot === 'p3') ? 1 : 1 - ss(zF - 3.5, zF + 3.5, z), ed = Math.exp(-Math.pow((z - zF) / edW, 2)) * edK, base = shot === 's2' ? .2 : .12;
      moA[i] = clamp((base * lit + (shot === 's1' ? .1 : 0) + ed * .85) * (.5 + .5 * hsh(i, 8)) * Math.sin(Math.PI * ((ph * 3) % 1))); }
    moG.attributes.position.needsUpdate = true; moG.attributes.aK.needsUpdate = true; }

  // ================================================================ P4 (director3-plan B1, owner 2026-11-26): the three thousand from above
  // The first draft's aerial (git edc61537 s3: the stepped pool where the streets meet, the crane) rebuilt to the plan: a low afternoon sun (19°)
  // so that a person is a 4–8 px patch of cloth and the person's SHAPE is drawn by a long shadow (Steinmetz's camel caravans); five streets
  // flowing in like rivers (「간디」's funeral from the air); the crowd filling a funnel that narrows onto the pool — the same direction and
  // outline as part 1's net bag (lake-peter3d-b.js uwA). No DOF, no tilt-shift (a miniature is a board game): depth by warm haze only.
  const sq = new THREE.Group(); sq.position.copy(PO); G.pool.add(sq);
  const SUN4 = V(Math.cos(19 * D2R) * Math.sin(42 * D2R), Math.sin(19 * D2R), -Math.cos(19 * D2R) * Math.cos(42 * D2R));   // upper right: shadows lie to the lower left
  const PA0 = 15, PB0 = 5.2, PNR = 5, PDR = .85, PST = .3, PYW = -(PNR * PST) - .34, PYF = PYW - 1.0;
  const seP = (a, b, th, n = 6) => { const c = Math.cos(th), s = Math.sin(th); return [a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)]; };
  const ring = (a, b, N = 140) => { const pts = []; for (let i = 0; i < N; i++) { const [x, y] = seP(a, b, i / N * Math.PI * 2); pts.push(new THREE.Vector2(x, y)); } return pts; };
  const RA = k => PA0 + k * PDR, RB = k => PB0 + k * PDR, treadY = k => -(PNR - k) * PST;
  function ringS(x, z) { let lo = -PB0 + .2, hi = 200; const f = s => Math.pow(Math.abs(x) / (PA0 + s), 6) + Math.pow(Math.abs(z) / (PB0 + s), 6) - 1; for (let i = 0; i < 28; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return lo / PDR; }
  const groundAt = (x, z) => { const s = ringS(x, z); if (s >= PNR) return 0; if (s < 0) return PYF; const k = Math.floor(s), fr = s - k, y0 = treadY(k), y1 = k + 1 >= PNR ? 0 : treadY(k + 1); return lerp(y0, y1, ss(.86, 1, fr)); };
  { const parts = [];
    for (let k = 0; k < PNR; k++) { const sh = new THREE.Shape(ring(RA(k + 1), RB(k + 1))); sh.holes.push(new THREE.Path(ring(RA(k), RB(k)))); const dep = treadY(k) - PYF + .02, g = new THREE.ExtrudeGeometry(sh, { depth: dep, bevelEnabled: false, curveSegments: 1 }); g.rotateX(-Math.PI / 2); g.translate(0, PYF - .02, 0); parts.push([g]); }
    { const sh = new THREE.Shape([[-400, -400], [400, -400], [400, 400], [-400, 400]].map(([x, y]) => new THREE.Vector2(x, y))); sh.holes.push(new THREE.Path(ring(RA(PNR), RB(PNR)))); const g = new THREE.ShapeGeometry(sh, 1); g.rotateX(-Math.PI / 2); parts.push([g]); }
    { const g = new THREE.ShapeGeometry(new THREE.Shape(ring(RA(0) + .1, RB(0) + .1)), 1); g.rotateX(-Math.PI / 2); g.translate(0, PYF, 0); parts.push([g]); }
    const m = new THREE.Mesh(K.mergeGeometries(parts), M.pave); m.receiveShadow = true; m.castShadow = true; sq.add(m); }
  // the water: dark, the warm sky in it, a sheen toward the sun; glints and rings are separate (below)
  const pwU = { uT: { value: 0 }, uWarm: { value: 0 } };
  const pwM = new THREE.MeshStandardMaterial({ color: '#17302e', roughness: .25 });
  pwM.onBeforeCompile = sh => { Object.assign(sh.uniforms, pwU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWL;').replace('#include <project_vertex>', '#include <project_vertex>\nvWL = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWL; uniform float uT, uWarm;\n${GLSL.hash}`)
      .replace('#include <opaque_fragment>', `{ vec2 q = vWL.xy; float n = fbm(q * .35 + vec2(uT * .05, -uT * .04)), sun = smoothstep(-8., 14., q.x + q.y * .6);
        outgoingLight = vec3(.03, .055, .05) * (.8 + .4 * n) + reflectedLight.directDiffuse * .2 + mix(vec3(.16, .17, .15), vec3(.42, .32, .18), uWarm) * (.25 + .45 * sun) * (.7 + .5 * n); }
        #include <opaque_fragment>`); };
  pwM.customProgramCacheKey = () => 'pc-pw';
  { const w = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(ring(RA(0) + .05, RB(0) + .05)), 1), pwM); w.rotation.x = -Math.PI / 2; w.position.y = PYW; w.receiveShadow = true; sq.add(w); }
  // the funnel the crowd fills (wide at the top, narrowing onto the pool: part 1's net bag), the five streets, and the town round them
  const FZ0 = RB(PNR) + 1.5, FZ1 = 60, fHW = z => RA(PNR) * .92 + .62 * (-z - FZ0), inFun = (x, z, m = 0) => z <= -FZ0 + m && z >= -FZ1 - m && Math.abs(x) <= fHW(z) + m;
  const inPlaza = (x, z, m = 0) => Math.pow(Math.abs(x) / (RA(PNR) + 4 + m), 6) + Math.pow(Math.abs(z) / (RB(PNR) + 4 + m), 6) < 1;
  const STRS = [[-30, -FZ1, -.42, -1], [30, -FZ1, .42, -1], [-fHW(-34) + 1, -34, -1, -.18], [fHW(-34) - 1, -34, 1, -.18], [RA(PNR) * .7, RB(PNR) + 2, .72, 1]].map(([x, z, dx, dz]) => { const d = V(dx, 0, dz).normalize(); return { m: V(x, 0, z), d }; });
  const distStr = (x, z) => { let best = 1e9; for (const s of STRS) { const px = x - s.m.x, pz = z - s.m.z, al = px * s.d.x + pz * s.d.z; if (al < -3) continue; best = Math.min(best, Math.abs(px * s.d.z - pz * s.d.x)); } return best; };
  { const r = rng(9091), hm = [], hc = [], rm = [], jm = [], am = [], ac = [], trees = [], palms = [];
    for (let gx = -150; gx <= 150; gx += 7) for (let gz = -200; gz <= 110; gz += 7) { const x = gx + (r() - .5) * 2, z = gz + (r() - .5) * 2;
      if (inFun(x, z, 1.5) || inPlaza(x, z, 2) || distStr(x, z) < 6.5) continue;
      if (r() < .09) { (r() < .5 ? trees : palms).push([x, z]); continue; }   // a courtyard with a tree
      const w = 5 + r() * 2.6, d = 5 + r() * 2.6, h = 3 + Math.pow(r(), 1.4) * 7, ry = (r() - .5) * .14, c = new THREE.Color().setHSL(.085 + r() * .03, .16 + r() * .12, .6 + r() * .17), q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry);
      hm.push(new THREE.Matrix4().compose(V(x, h / 2 - .3, z), q, V(w, h + .6, d))); hc.push(c);
      rm.push(new THREE.Matrix4().compose(V(x, h + .03, z), q, V(w * .8, .06, d * .8)));   // the sunk roof inside the parapet
      if (r() < .45) { const uw = w * .42, ud = d * .42, uh = 2.4; hm.push(new THREE.Matrix4().compose(V(x + (r() - .5) * w * .3, h + uh / 2, z + (r() - .5) * d * .3), q, V(uw, uh, ud))); hc.push(c.clone().multiplyScalar(.96)); }
      for (let k = 0, n = (r() * 3) | 0; k < n; k++) jm.push(new THREE.Matrix4().compose(V(x + (r() - .5) * w * .6, h + .35, z + (r() - .5) * d * .6), new THREE.Quaternion(), V(1, 1, 1)));   // jars
      if (r() < .3) { am.push(new THREE.Matrix4().compose(V(x + (r() - .5) * w * .4, h + 1.9, z + (r() - .5) * d * .4), new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + .1, 0, r() * 3)), V(2.2, 1.6, 1))); ac.push(new THREE.Color(['#a8664a', '#c9b48c', '#5f6c86', '#b08a48', '#e2d6bc'][(r() * 5) | 0])); } }   // an awning / washing
    const him = new THREE.InstancedMesh(K.roundedBox(1, 1, 1, .03, 1), M.wall, hm.length); hm.forEach((q, i) => { him.setMatrixAt(i, q); him.setColorAt(i, hc[i]); }); him.castShadow = him.receiveShadow = true; sq.add(him);
    const rim = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), patch(K.std('#9a8466', { roughness: 1 }), 'rf4'), rm.length); rm.forEach((q, i) => rim.setMatrixAt(i, q)); rim.receiveShadow = true; sq.add(rim);
    const jim = new THREE.InstancedMesh(new THREE.CylinderGeometry(.26, .3, .7, 8), patch(K.std('#8e5c40', { roughness: .9 }), 'jar4'), jm.length); jm.forEach((q, i) => jim.setMatrixAt(i, q)); jim.castShadow = true; sq.add(jim);
    const aim = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), patch(K.std('#ffffff', { roughness: .95, side: THREE.DoubleSide }), 'aw4'), am.length); am.forEach((q, i) => { aim.setMatrixAt(i, q); aim.setColorAt(i, ac[i]); }); aim.castShadow = true; sq.add(aim);
    { const n = trees.length * 18, im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.95, 0), M.leaf, n), m4 = new THREE.Matrix4(); let k = 0;
      for (const [x, z] of trees) { const q = rng((x * 13 + z * 7) | 0); for (let i = 0; i < 18; i++) { const a = q() * 6.283, rr = Math.sqrt(q()) * 2.4; m4.compose(V(x + Math.cos(a) * rr, 3.2 + q() * 1.8, z + Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(q() * 3, q() * 3, 0)), V(1, .7, 1).multiplyScalar(.7 + q() * .7)); im.setMatrixAt(k++, m4); } }
      im.castShadow = true; sq.add(im); }
    { const n = palms.length * 9, im = new THREE.InstancedMesh(new THREE.BoxGeometry(3.4, .08, .42), patch(K.std('#4f6a3c', { roughness: .85 }), 'palm4'), n), m4 = new THREE.Matrix4(); let k = 0;   // a palm seen from above: a star
      for (const [x, z] of palms) { for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + x; m4.compose(V(x + Math.cos(a) * 1.6, 9 - .3 * (i % 2), z + Math.sin(a) * 1.6), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -a, -.25)), V(1, 1, 1)); im.setMatrixAt(k++, m4); } }
      im.castShadow = true; sq.add(im); } }
  // the people: cloth patches with a matte head of the same value (no bright crown, no speculars — the bowling pins of f1), the shape in the shadow
  const p4G = (() => { const lg = new THREE.LatheGeometry([[.2, 0], [.22, .05], [.2, .6], [.175, 1.0], [.21, 1.3], [.15, 1.4], [.05, 1.46]].map(([r, y]) => new THREE.Vector2(r, y)), 10); lg.scale(1.05, 1, .72);
    const hd = new THREE.SphereGeometry(.12, 10, 7); hd.scale(1, 1.05, 1); hd.translate(0, 1.57, 0); const cl = new THREE.SphereGeometry(.16, 10, 6, 0, Math.PI * 2, 0, Math.PI * .62); cl.scale(1.05, 1.1, 1); cl.translate(0, 1.5, .02);
    return K.mergeGeometries([[lg], [hd], [cl]]); })();
  const p4M = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, metalness: 0 });
  const CLOTH = ['#cfc4ab', '#c4b89e', '#d8cfbb', '#a4766a', '#94695e', '#6c788a', '#5e6b80', '#a99068', '#b39a6c', '#8c8070', '#bcae92'];
  const crowd4 = [];
  { const r = rng(2026), slots = [];
    for (let k = -1; k <= PNR + 1; k++) { const sA = k < 0 ? -.7 : k + .5, a = PA0 + sA * PDR, b = PB0 + sA * PDR, sp = k < 0 ? 1.2 : .72; let per = 0, pv = seP(a, b, 0); for (let i = 1; i <= 300; i++) { const c = seP(a, b, i / 300 * 6.283); per += Math.hypot(c[0] - pv[0], c[1] - pv[1]); pv = c; }
      const n = Math.floor(per / sp); for (let i = 0; i < n; i++) { const [x, z] = seP(a, b, (i + r() * .4) / n * 6.283); slots.push({ x: x + (r() - .5) * .2, z: z + (r() - .5) * .2, d: Math.max(0, k) * 1.2 + r() * 2.5, w: k < 0 }); } }
    for (let z = -FZ0 - .5; z >= -FZ1; z -= 1.22) for (let x = -fHW(z); x <= fHW(z); x += 1.22) { const jx = x + (r() - .5) * .7, jz = z + (r() - .5) * .7; if (!inFun(jx, jz) || r() > 1 - .42 * ss(14, FZ1, -jz)) continue; slots.push({ x: jx, z: jz, d: 7 + (-jz - FZ0) * .85 + r() * 5 }); }
    slots.sort((a, b) => a.d - b.d);
    const nearestStr = s => { if (s.z > 0) return 4; let bi = 0, bd = 1e9; STRS.forEach((t, i) => { if (i === 4) return; const d = Math.hypot(s.x - t.m.x, s.z - t.m.z); if (d < bd) { bd = d; bi = i; } }); return bi; };
    slots.forEach((s, i) => crowd4.push({ ...s, f: i / slots.length, st: nearestStr(s), v: 1.1 + r() * .25, lane: (r() - .5) * 4.6, col: new THREE.Color(CLOTH[(r() * CLOTH.length) | 0]).multiplyScalar(.82 + r() * .26), ph: r() }));
    for (let i = 0; i < 1100; i++) { const st = i % 5, m = STRS[st].m; crowd4.push({ x: m.x, z: m.z, f: 1.02 + i / 1100 * 2.2, st, v: 1.1 + r() * .25, lane: (r() - .5) * 4.6, col: new THREE.Color(CLOTH[(r() * CLOTH.length) | 0]).multiplyScalar(.82 + r() * .26), ph: r(), late: true }); } }
  const NP4 = crowd4.length, p4I = new THREE.InstancedMesh(p4G, p4M, NP4); crowd4.forEach((p, i) => p4I.setColorAt(i, p.col)); p4I.castShadow = true; p4I.receiveShadow = false; p4I.frustumCulled = false; sq.add(p4I);
  const arrive4 = (f, T) => { const a = T.c2, b = T.end; if (f < .28) return a - 14 + f / .28 * 13.6; if (f <= 1) return a + .05 + (b - a - .35) * Math.pow((f - .28) / .72, .92); return b + .3 + (f - 1) * 12; };
  // the baptisms: golden rings on the water, their rate rising smoothly 1 → 6 a second (one pure table of events)
  const RINGS4 = []; { const r = rng(77); let acc = .5; for (let t = -2.5; t < 9.5; t += .01) { acc += .01 * (1 + 5 * ss(.4, 6.2, t)); if (acc >= 1) { acc -= 1; let x, z; do { x = (r() - .5) * 2 * (PA0 - 1.5); z = (r() - .5) * 2 * (PB0 - 1.2); } while (Math.pow(Math.abs(x) / (PA0 - 1.2), 6) + Math.pow(Math.abs(z) / (PB0 - 1), 6) > 1); RINGS4.push({ dt: t, x, z }); } } }
  const NR4 = RINGS4.length, r4Age = new THREE.InstancedBufferAttribute(new Float32Array(NR4), 1), r4G = new THREE.PlaneGeometry(1, 1); r4G.rotateX(-Math.PI / 2); r4G.setAttribute('aAge', r4Age);
  const r4M = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aAge; varying float vA; varying vec2 vUv; void main(){ vA = aAge; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying float vA; varying vec2 vUv; void main(){ if (vA <= 0. || vA > 1.6) discard; float k = vA / 1.6, d = length(vUv - .5) * 2., R = k; float a = .45 * (1. - k) * smoothstep(0., .12, vA);
      float ring = exp(-pow((d - R) / (.035 + .04 * k), 2.)); gl_FragColor = vec4(vec3(1., .886, .627) * ring * a, 1.); }` });
  const r4I = new THREE.InstancedMesh(r4G, r4M, NR4); { const mm = new THREE.Matrix4(); RINGS4.forEach((e, i) => { mm.compose(V(e.x, PYW + .03, e.z), new THREE.Quaternion(), V(6, 1, 6)); r4I.setMatrixAt(i, mm); }); } r4I.frustumCulled = false; r4I.renderOrder = 6; sq.add(r4I);
  // silver glints: each lives .3–.6 s, eases in and out, then is born again elsewhere (a pure function of t — never re-drawn at random per frame)
  const NGL = 70, glG = new THREE.BufferGeometry(), glP = new Float32Array(NGL * 3), glA = new Float32Array(NGL); glG.setAttribute('position', new THREE.BufferAttribute(glP, 3)); glG.setAttribute('aK', new THREE.BufferAttribute(glA, 1));
  const glints = new THREE.Points(glG, dotM(46, '#fff2d6')); glints.frustumCulled = false; glints.renderOrder = 7; sq.add(glints);
  function setGlints(t, warm) { for (let i = 0; i < NGL; i++) { const per = 1.1 + hsh(i, 51) * .9, life = .3 + hsh(i, 52) * .3, c = Math.floor((t + hsh(i, 53) * per) / per), ph = (t + hsh(i, 53) * per) / per - c, s = hsh(i * 7 + c, 54), u2 = hsh(i * 7 + c, 55);
      let x = (s - .5) * 2 * (PA0 - 1), z = (u2 - .5) * 2 * (PB0 - .8); if (Math.pow(Math.abs(x) / (PA0 - .8), 6) + Math.pow(Math.abs(z) / (PB0 - .6), 6) > 1) { x *= .7; z *= .7; }
      const L = ph * per / life; glP[i * 3] = x; glP[i * 3 + 1] = PYW + .05; glP[i * 3 + 2] = z; glA[i] = L < 1 ? Math.sin(Math.PI * L) * (.35 + .35 * (x + 18) / 36) * (.7 + .6 * warm) : 0; }
    glG.attributes.position.needsUpdate = true; glG.attributes.aK.needsUpdate = true; }
  let VIS4 = 0, ARR4 = 0;
  const m4b = new THREE.Matrix4(), q4b = new THREE.Quaternion(), e4b = new THREE.Euler(), one = V(1, 1, 1);
  function setCrowd4(t, T) { let arr = 0;
    crowd4.forEach((p, i) => { const ta = arrive4(p.f, T), S = V(p.x, 0, p.z), st = STRS[p.st], Mo = st.m, D = st.d, side = V(D.z, 0, -D.x), legB = p.late ? 0 : S.distanceTo(Mo);
      const tau = .5, sR = ta - t, dRem = sR <= 0 ? 0 : sR < tau ? p.v * sR * sR / (2 * tau) : p.v * (sR - tau / 2); let x, z, yaw;
      if (dRem <= 0) { arr++; x = S.x; z = S.z; yaw = Math.atan2(-(0 - x), -(0 - z)) + Math.sin(t * .3 + p.ph * 9) * .1; }
      else if (dRem <= legB) { const k = dRem / legB, mx = Mo.x + side.x * p.lane * .3, mz = Mo.z + side.z * p.lane * .3; x = lerp(S.x, mx, k); z = lerp(S.z, mz, k); yaw = Math.atan2(-(S.x - mx), -(S.z - mz)); }
      else { const e = dRem - legB, lx = Mo.x + side.x * p.lane * (.3 + .7 * ss(0, 5, e)), lz = Mo.z + side.z * p.lane * (.3 + .7 * ss(0, 5, e)); x = lx + D.x * e; z = lz + D.z * e; yaw = Math.atan2(D.x, D.z); }
      const y = p.w && dRem <= 0 ? PYF + .02 : groundAt(x, z), sw = dRem > 0 ? Math.sin(t * 5.4 + p.ph * 6.283) * .03 : 0;
      m4b.compose(V(x, y, z), q4b.setFromEuler(e4b.set(0, yaw, sw, 'YXZ')), one); p4I.setMatrixAt(i, m4b); });
    p4I.instanceMatrix.needsUpdate = true; ARR4 = arr;
    RINGS4.forEach((e, i) => r4Age.setX(i, t - (T.c2 + e.dt))); r4Age.needsUpdate = true; }
  function countVisible4() { let n = 0; const v = V(); cam.updateMatrixWorld(); for (let i = 0; i < NP4; i++) { p4I.getMatrixAt(i, m4b); v.setFromMatrixPosition(m4b).add(PO); v.y += .8; v.project(cam); if (v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1) n++; } return n; }

  // ================================================================ P2 (director3-plan B1): the shadow on the wall rises — 2D, on a limewashed stone wall
  // The figures are bw-rooster-p1.js's shadow rig, copied (atf, spline, blob, limb, ik, openHand, inHand, sleeveArm, head, robe, man — the
  // owner-approved part 5 shadows; nothing imported). The wall is kit-fresco.js's plaster (window.FRESCO, loaded by the page).
  const p2Wall = mkCanvas(Math.ceil(W / .9), Math.ceil(H / .9)), p2Mask = mkCanvas(W, H), p2Tmp = mkCanvas(W, H), p2Band = mkCanvas(W, H);
  { const g = p2Wall.getContext('2d'), WW = p2Wall.width, WH = p2Wall.height, F = window.FRESCO;
    const gr = g.createLinearGradient(0, 0, WW, WH * .3); gr.addColorStop(0, '#e2bf88'); gr.addColorStop(.55, '#f3d29a'); gr.addColorStop(1, '#f7dca8'); g.fillStyle = gr; g.fillRect(0, 0, WW, WH);
    const wm = (X, Y) => [(X + 4) / 7 * WW, WH - Y / 7.2 * WH];
    if (F) { g.globalAlpha = .55; F.plaster(g, [wm(-4, 0), wm(3, 0), wm(3, 7.2), wm(-4, 7.2)], 'rgba(243,210,154,0)', 31, wm, { patches: 0, mottle: 110, MY: [0, 7.2] }); g.globalAlpha = 1; }
    const r = rng(404); g.strokeStyle = 'rgba(90,64,44,.28)'; g.lineWidth = 1.6;
    for (let k = 0; k < 6; k++) { let x = r() * WW, y = r() * WH; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 14; i++) { x += (r() - .5) * 46; y += 18 + r() * 26; g.lineTo(x, y); } g.stroke(); }   // hairline cracks
    const pil = g.createLinearGradient(0, 0, WW * .14, 0); pil.addColorStop(0, 'rgba(70,58,70,.5)'); pil.addColorStop(.75, 'rgba(70,58,70,.32)'); pil.addColorStop(1, 'rgba(70,58,70,0)'); g.fillStyle = pil; g.fillRect(0, 0, WW * .14, WH);   // a column of the portico, its shadow at the left edge
    const foot = g.createLinearGradient(0, WH * .86, 0, WH); foot.addColorStop(0, 'rgba(70,52,36,0)'); foot.addColorStop(1, 'rgba(70,52,36,.4)'); g.fillStyle = foot; g.fillRect(0, WH * .86, WW, WH * .14);
    if (F) F.grain(g, WW, WH, 9); }
  const P2DUST = Array.from({ length: 14 }, (_, i) => [hsh(i, 61), hsh(i, 62), hsh(i, 63)]);
  const P2CROWD = Array.from({ length: 11 }, (_, i) => { const row = i % 2, x = 20 + (i / 10) * 1040 + (hsh(i, 71) - .5) * 70; return { x, y: row ? 2180 : 2010, s: 640 + hsh(i, 72) * 70, t0: hsh(i, 73) > .5 ? .75 : -.75, t1: x < 480 ? .55 : -.55, br: .96 + hsh(i, 74) * .12, h: 1.14 + hsh(i, 75) * .08, ord: i }; }).sort((a, b) => Math.abs(a.x - 480) - Math.abs(b.x - 480));
  function p2Arm(t, T) { const a = T.p2; const rise = ss(a + .8, a + 1.8, t), arm = ss(a + 2.0, a + 3.15, t), h = lerp(1.14, 1.26, rise), sh = h - .36, S = [.255, sh * .9];   // the shoulder joint inside the robe's outline (no knob)
    const ang = lerp(-1.47, 35 * D2R, arm), L = lerp(.5, .53, arm), W2 = [S[0] + Math.cos(ang) * L + .04 * (1 - arm), S[1] + Math.sin(ang) * L + .006 * Math.sin(t * 1.6) * arm]; return { rise, arm, h, S, W: W2, ...ik(S, W2, .33, .3, -1) }; }
  function drawP2(ctx, t, T) { const a = T.p2, u = clamp((t - a) / (T.p3 - a)), zoom = lerp(1, .92, eio(u)), cx = W / 2, cy = H * .42, b = { k: zoom, ox: cx * (1 - zoom), oy: cy * (1 - zoom) };
    ctx.save(); ctx.setTransform(zoom, 0, 0, zoom, cx * (1 - zoom), cy * (1 - zoom)); ctx.drawImage(p2Wall, -(p2Wall.width - W) / 2, -(p2Wall.height - H) / 2); ctx.restore();
    // the band of light crossing the wall, right → left (P1's front, same way), only on the sunlit wall
    const bx = lerp(W * 1.25, -W * .3, clamp((t - (a + .4)) / .9)), bw = 260, bg = p2Band.getContext('2d'); bg.setTransform(1, 0, 0, 1, 0, 0); bg.clearRect(0, 0, W, H);
    if (bx > -bw * 2 && bx < W + bw * 2) { const gr = bg.createLinearGradient(bx - bw, 0, bx + bw, 0); gr.addColorStop(0, 'rgba(255,236,196,0)'); gr.addColorStop(.5, 'rgba(255,236,196,.2)'); gr.addColorStop(1, 'rgba(255,236,196,0)'); bg.fillStyle = gr; bg.fillRect(0, 0, W, H);
      bg.globalCompositeOperation = 'lighter'; for (const [p, q, s] of P2DUST) { const x = bx + (p - .5) * bw * 1.2 - (t - a) * 30, y = 200 + q * 1100 + Math.sin(t * .8 + s * 9) * 14, al = Math.exp(-Math.pow((x - bx) / (bw * .55), 2)) * (.45 + .4 * s); bg.fillStyle = `rgba(255,240,205,${al})`; bg.beginPath(); bg.arc(x, y, 2.2 + 2.4 * s, 0, 6.283); bg.fill(); } bg.globalCompositeOperation = 'source-over'; }
    // the shadows: Peter (near the wall: a 14 px penumbra), the crowd (further from it: 24 px)
    const mg = p2Mask.getContext('2d'), pose = p2Arm(t, T);
    const layer = (blur, fn) => { mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, W, H); mg.fillStyle = '#fff'; fn(mg);
      const tg = p2Tmp.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, H); tg.filter = `blur(${blur}px)`; tg.drawImage(p2Mask, 0, 0); tg.filter = 'none'; return tg; };
    const shade = (tg, k = 1) => { tg.globalCompositeOperation = 'source-in'; tg.fillStyle = `rgba(128,120,168,${k})`; tg.fillRect(0, 0, W, H); tg.globalCompositeOperation = 'source-over';   // #6b5f73 over #f3d29a: a cool violet-grey, never black
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(p2Tmp, 0, 0); ctx.restore(); };
    shade(layer(9 * zoom, g => { for (const c of P2CROWD) { const k = ss(a + 1.4 + c.ord * .15, a + 2.0 + c.ord * .15, t); fman(g, b, c.x, c.y, c.s, { h: c.h, br: c.br, hx: lerp(c.t0, c.t1, k) * .05, hy: .02 * k, lean: lerp(c.t0, c.t1, k) * -.04 }); } }));
    shade(layer(9 * zoom, g => { const P0 = [480, 1103], s = 560; fman(g, b, P0[0], P0[1], s, { h: pose.h, br: .98, hy: lerp(-.1, 0, pose.rise), lean: lerp(.03, 0, pose.rise) });
      atf(g, b, P0[0], P0[1], s, lerp(.03, 0, pose.rise), 1, 1.06); sleeveArm(g, pose.S, pose.W, .33, .3, -1, openHand, Math.atan2(pose.W[1] - pose.E[1], pose.W[0] - pose.E[0])); }));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const bt = p2Tmp.getContext('2d'); bt.globalCompositeOperation = 'source-over'; bt.clearRect(0, 0, W, H); bt.drawImage(p2Band, 0, 0); bt.globalCompositeOperation = 'destination-out'; bt.filter = 'blur(14px)'; bt.drawImage(p2Mask, 0, 0); bt.filter = 'none'; bt.globalCompositeOperation = 'source-over';
    ctx.globalCompositeOperation = 'screen'; ctx.drawImage(p2Tmp, 0, 0); ctx.globalCompositeOperation = 'source-over';
    const vg = ctx.createRadialGradient(W / 2, H * .44, H * .3, W / 2, H * .44, H * .78); vg.addColorStop(0, 'rgba(40,26,20,0)'); vg.addColorStop(1, 'rgba(40,26,20,.38)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.restore(); }

  // ================================================================ poses (s1, p3)
  function posePeter(t, T) { const U = PT.userData, s = U.s, id = P.idle(t, .17, { s }), bowK = 1 - ss(T.bow[0], T.bow[1], t), armK = ss(T.arm[0], T.arm[1], t), fwd = ss(T.p3, T.p3 + 2, t);
    const tg = V(.36, 1.74 - .08 * fwd + .03 * Math.sin(t * .9), -.37 - .1 * fwd);   // P3: the raised hand goes once slowly forward (2 s)
    P.pose(PT, { ...id, lean: -.3 * bowK - .03 - .03 * armK - .03 * fwd, head: [-.34 * bowK + .1 * (1 - bowK), id.head[1] * .5], swing: [id.swing[0] - .1 * bowK, id.swing[1]], hands: [null, tg], handsW: [0, armK] }); }
  function poseCrowd(t) { for (const p of crowd) { const U = p.userData, id = P.idle(t, U.ph, { s: U.s }); P.pose(p, { ...id, head: [.12 + id.head[0], id.head[1]] }); } }
  function poseLower(t, T) { for (const p of lower) { const U = p.userData;
      const tPass = T.fr0 + (U.z0 + 110) / 45, k = ss(tPass - .1, tPass + .9, t);
      if (U.kind === 'walk') { const w = P.walk(p, t, T.t0 + U.t0 - 2, { T: 1.15, L: .55 }); const d0 = P.walk(p, T.t0, T.t0 + U.t0 - 2, { T: 1.15, L: .55 }).dist; const z = U.z0 - (w.dist - d0);
        p.position.set(p.position.x, Math.max(gY(z) - .06, RISE * Math.max(0, ZS0 - z) / RUN - RISE * .5), z); P.pose(p, { ...w, head: [.12 * k, 0] }); }
      else { const id = P.idle(t, U.ph, { s: U.s }), turn = Math.atan2(Math.sin(0 - p.rotation.y), Math.cos(0 - p.rotation.y)); P.pose(p, { ...id, twist: id.twist + turn * .25 * k, head: [.16 * k, turn * .45 * k] }); } } }

  // ================================================================ the shots
  const setCam = (p, l, fov) => { cam.position.copy(p); cam.lookAt(l); if (fov) { cam.fov = fov; cam.updateProjectionMatrix(); } };
  const _c1 = new THREE.Color(), _c2 = new THREE.Color();
  const mixC = (out, a, ka, b, kb, f) => out.copy(_c1.set(a).multiplyScalar(ka)).lerp(_c2.set(b).multiplyScalar(kb), f);
  function streetLight(warm, sunK) {   // warm: 0 cool shadow → 1 warm morning;  sunK: the sun out of the cloud
    const a = film.atmos; mixC(a.color, '#7e8aa4', .5, '#d0a274', .62, warm); mixC(a.colorUp, '#7a88a6', .5, '#b4aca4', .56, warm); a.density = lerp(.0034, .0026, warm); a.falloff = .03; a.base = 0; a.start = 2; a.scatter = 1; a.anisotropy = .8; a.phaseMix = .85; a.max = 2000;
    mixC(hemi.color, '#8c9cc4', 1, '#c4bcaa', 1, warm); mixC(hemi.groundColor, '#4a4440', 1, '#7a5e42', 1, warm); hemi.intensity = lerp(.5, .46, warm);
    sunL.color.set('#ffd7a2'); sunL.intensity = 3.3;
    mixC(SK.top.value, '#4a628c', .6, '#56739f', .62, warm); mixC(SK.mid.value, '#98a0b0', .8, '#d2ae8a', .95, warm); mixC(SK.horizon.value, '#c0b0a0', 1.1, '#ffd39a', 1.6, warm);
    SK.sunColor.value.set('#fff1d4').multiplyScalar(18 * sunK); SK.sunGlow.value.set('#ffc583').multiplyScalar(lerp(.35, 1.6, sunK)); SK.clouds.value = .3;
    mixC(SK.cloudColor.value, '#c8c4c4', .9, '#ffe2c0', 1.1, warm); mixC(SK.cloudShade.value, '#6c6c7c', .7, '#a48a84', .7, warm);
    sunLamp.power = 900 * sunK; const L = film.look; L.exposure = lerp(.9, 1.0, warm); L.saturation = lerp(.86, 1.05, warm); doorLamps.forEach(d => d.power = .9); mixC(L.shadowTint, '#c4cce8', 1, '#d6d2e6', 1, warm); mixC(L.highTint, '#e8ecf4', 1, '#fff0d8', 1, warm); L.contrast = 1.05; L.vignette = .3; }
  // P1 (= s1 of fix 1/2, kept): the wind of light down the street
  function s1(t, T) { FAR.visible = true; G.street.visible = true; G.pool.visible = false; sky.mesh.visible = true; crowdLayer(0); LU.uGold.value = 0; for (const p of lower) p.visible = true; SK.sunDir.value.copy(SUN1); shadowAt(V(0, 3, -24), 62, SUN1);
    const u = (t - T.t0) / (T.c1 - T.t0), sunK = 1, zF = -110 + 45 * (t - T.fr0);
    const warm = lerp(.3, .85, u); streetLight(warm, sunK); LU.uRimC.value.set('#ffc078').multiplyScalar(1.6);
    LU.uFront.value = zF; LU.uShade.value = .1; LU.uEdgeK.value = 1.0; LU.uEdgeW.value = 3.6; LU.uEdgeC.value.set('#ffd8a0');
    frontLamp.pos.set(0, gY(Math.min(zF, 20)) + 3.2, zF); frontLamp.power = 60 * sunK * (1 - ss(14, 30, zF)); frontLamp.size = 8;
    const cz = lerp(15.5, 12.1, u), c = V(lerp(1.2, 1.0, u), gY(cz) + lerp(3.3, 3.45, u), cz), l = V(-3.2, gY(-40) + 1.2, -40);
    setCam(c, l, FOV); film.dofCfg.focus = 13; film.dofCfg.aperture = .45; film.dofCfg.maxCoc = 14;
    posePeter(t, T); poseCrowd(t); poseLower(t, T); setMotes(t, 's1', zF, 1.0, 4.5); motes.visible = true; }
  // P3: Peter far up the steps, a backlit silhouette against the bright sky; below him the treads' edges are lines of gold and the crowd is
  // only its long shadows flowing down them toward the lens (the bodies are drawn by the sun's shadow camera alone, layer 3); a few soft dark
  // shapes at the top. Telephoto from the foot of the steps, crane up with inertia — handed on to P4's crane in the same direction.
  const P3C = (t, T) => { const u = clamp((t - T.p3) / (T.c2 - T.p3)), e = u * u * .55 + u * .45, c = V(.9, lerp(1.25, 3.6, e), 34), fov = vert ? 19 : 12;
    return { c, l: V(PETER.x + 1.25, PLAT - 2.3 + lerp(0, 1.6, e), PETER.z), fov }; };
  let SUNP3 = null;
  function p3(t, T) { FAR.visible = false; G.street.visible = true; G.pool.visible = false; sky.mesh.visible = true; LU.uGold.value = 1; for (const p of lower) p.visible = false;
    if (!SUNP3) { const q = P3C((T.p3 + T.c2) / 2, T); setCam(q.c, q.l, q.fov); cam.updateMatrixWorld(); const d = V(230 / W * 2 - 1, 1 - 520 / H * 2, .5).unproject(cam).sub(cam.position).normalize(); SUNP3 = d; }   // the sun placed where the plan wants it (x 230, y 520), up-left of him
    for (const p of crowd) { const keep = p.position.z < -47; if (p.userData.lay !== keep) { p.userData.lay = keep; p.traverse(o => o.layers.set(keep ? 0 : 3)); } } crowdL = -1;
    SK.sunDir.value.copy(SUNP3); shadowAt(V(0, 3, -30), 46, SUNP3);
    const grow = ss(T.p3, T.c2, t); streetLight(1, 1); film.atmos.density = .0012; hemi.intensity = .3; film.look.exposure = lerp(.78, .84, grow); LU.uRimC.value.set('#ffc078').multiplyScalar(1.8);
    SK.horizon.value.set('#f6e2b8').multiplyScalar(1.45); SK.mid.value.set('#f0d6a8').multiplyScalar(1.05);   // a little cooler than P4's gold (time passes before 「그날」)
    const zE = lerp(-50, 30, clamp((t - T.p3 - .3) / 2.2)), ek = ss(T.p3 + .3, T.p3 + .8, t) * (1 - ss(T.c2 - .4, T.c2, t));
    LU.uFront.value = zE; LU.uShade.value = 1; LU.uEdgeK.value = .22 * ek; LU.uEdgeW.value = 4; LU.uEdgeC.value.set('#ffdcaa');
    frontLamp.pos.set(PETER.x + .4, PLAT + 2.6, PETER.z - 2.5); frontLamp.power = 8; frontLamp.size = 5;
    const q = P3C(t, T); setCam(q.c, q.l, q.fov); film.dofCfg.focus = q.c.distanceTo(PETER); film.dofCfg.aperture = .9; film.dofCfg.maxCoc = 18;
    posePeter(t, T); poseCrowd(t); setMotes(t, 'p3', zE, .5 * ek, 4); motes.visible = true; }
  // P4: the aerial
  const P4C = (t, T) => { const u = clamp((t - T.c2) / (T.end - T.c2)), D = 140 * Math.exp(Math.log(300 / 140) * u), pit = lerp(66, 84, u * .85 + u * u * .15) * D2R, yaw = (-3 + 6 * u) * D2R, fov = vert ? 30 : 20;
    const off = D * Math.tan(3.1 * D2R) / Math.sin(pit), tgt = PO.clone().add(V(0, 0, -off - 2)), dir = V(Math.sin(yaw) * Math.cos(pit), Math.sin(pit), Math.cos(yaw) * Math.cos(pit));
    return { c: tgt.clone().addScaledVector(dir, D), l: tgt, fov, D }; };
  function p4(t, T) { G.street.visible = false; G.pool.visible = true; sky.mesh.visible = false; LU.uGold.value = 0; shadowAt(PO.clone().add(V(0, 0, -30)), 100, SUN4);
    const u = clamp((t - T.c2) / (T.end - T.c2)), late = ss(T.c2b - .3, T.c2b + 1.6, t), warm = .35 + .65 * ss(T.c2, T.end, t);
    const a = film.atmos; a.color.set('#e9c48c').multiplyScalar(.78); a.colorUp.copy(a.color); a.density = lerp(.0002, .00072, u); a.falloff = .0005; a.base = 0; a.start = 20; a.scatter = .5; a.anisotropy = .6; a.phaseMix = .7; a.max = 3000;
    hemi.color.set('#b8bccc'); hemi.groundColor.set('#7a5c40'); hemi.intensity = .46; sunL.color.set('#ffd49c'); sunL.intensity = 3.9; sunLamp.power = 0; frontLamp.power = 0; doorLamps.forEach(d => d.power = 0);
    LU.uFront.value = 1e4; LU.uShade.value = 1; LU.uEdgeK.value = 0; LU.uRimC.value.set('#ffc078').multiplyScalar(.6); pwU.uWarm.value = warm; pwU.uT.value = t;
    const L = film.look; L.exposure = lerp(1.5, 1.82, late) + .1 * ss(T.end - 1.2, T.end, t); L.saturation = 1.02; L.contrast = 1.06; L.shadowTint.set('#c8c4dc'); L.highTint.set('#fff0d6'); L.vignette = .26;
    const q = P4C(t, T); setCam(q.c, q.l, q.fov); film.dofCfg.focus = q.D; film.dofCfg.aperture = 0; film.dofCfg.maxCoc = 1;   // no DOF, no tilt-shift
    setCrowd4(t, T); setGlints(t, warm); motes.visible = false; }
  const STAGE = { s1, p3, p4 };
  const tmpV = V();
  function render(name, t, T) { LU.uT.value = t; STAGE[name](t, T); cam.updateMatrixWorld();
    sunLamp.pos.copy(cam.position).addScaledVector(SK.sunDir.value, 600); LU.uSunV.value.copy(name === 'p4' ? SUN4 : SK.sunDir.value).transformDirection(cam.matrixWorldInverse); film.render(t); }

  // ---------------------------------------------------------------- the lens, after the frame (lake-peter3d-b.js godRays/corona, copied)
  const gS = mkCanvas(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkCanvas(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) { const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h); const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 175) / 80); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; } gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h); gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 24; i++) { const sc = 1 + i * .05; gbx.globalAlpha = Math.pow(.9, i) * .15; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); } gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.imageSmoothingEnabled = true; ctx.drawImage(gB, 0, 0, W, H); ctx.restore(); }
  function corona(ctx, x, y, I, k, rings2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [r, cA, cB, a] of rings2) { const R0 = r * k * (.8 + .2 * I), g = ctx.createRadialGradient(x, y, 0, x, y, R0); g.addColorStop(0, `rgba(${cA},${Math.min(1, a * I)})`); g.addColorStop(.3, `rgba(${cB},${Math.min(1, a * I * .45)})`); g.addColorStop(1, `rgba(${cB},0)`); ctx.fillStyle = g; ctx.fillRect(x - R0, y - R0, R0 * 2, R0 * 2); } ctx.restore(); }
  const SUN_RINGS = [[16, '255,255,252', '255,246,226', .9], [70, '255,244,214', '255,214,150', .55], [220, '255,214,160', '255,170,96', .24], [560, '255,190,130', '255,150,80', .1]];
  const rayc = new THREE.Raycaster(), _rd = V();
  function sunVis(sd0) { let v = 0; const P0 = cam.position, off = [[0, 0], [.012, 0], [-.012, 0], [0, .012], [0, -.012]]; const up = V(0, 1, 0), sd = sd0.clone(), rgt = V().crossVectors(sd, up).normalize(), u2 = V().crossVectors(rgt, sd);
    for (const [a, b] of off) { _rd.copy(sd).addScaledVector(rgt, a).addScaledVector(u2, b).normalize(); rayc.set(P0, _rd); rayc.far = 900; if (!rayc.intersectObjects(G.street.children, true).some(h => !h.object.isPoints)) v++; } return v / off.length; }
  const project = p => { tmpV.copy(p).project(cam); if (tmpV.z >= 1 || tmpV.z <= -1) return null; return [(tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H]; };
  function blit(ctx) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore(); }
  const shotAt = (t, T) => T.shots.find(s => t >= s[1] && t < s[2]) || (t < T.shots[0][1] ? T.shots[0] : T.shots[T.shots.length - 1]);
  function draw(ctx, t, T) {
    const nm = shotAt(t, T)[0];
    if (nm === 'p2') { drawP2(ctx, t, T); return; }
    render(nm, t, T); blit(ctx);
    if (nm === 's1' || nm === 'p3') { const sd = nm === 's1' ? SUN1 : SUNP3, q = project(cam.position.clone().addScaledVector(sd, 1500));
      if (q && q[0] > -W * .4 && q[0] < W * 1.4) { const sunK = sunVis(sd), grow = nm === 'p3' ? ss(T.p3, T.c2, t) : 0;
        corona(ctx, q[0], q[1], sunK * (nm === 's1' ? .62 : .72 + .2 * grow), nm === 's1' ? .85 : 1.05, SUN_RINGS);
        godRays(ctx, q[0], q[1], sunK * (nm === 's1' ? .28 : .34 + .12 * grow)); } }
    if (nm === 'p4') { // the sun, off the frame at the upper right, flares in on 「사람을 취하리라던」; the end blooms gold for the cut to N173
      const k = ss(T.c2b - .3, T.c2b + 1.8, t), e = ss(T.end - 1.0, T.end, t), lg = ctx.createRadialGradient(W * 1.15, -H * .08, 0, W * 1.15, -H * .08, W * 1.5);
      lg.addColorStop(0, `rgba(255,222,160,${.1 + .38 * k + .12 * e})`); lg.addColorStop(.45, `rgba(255,196,124,${.03 + .14 * k + .08 * e})`); lg.addColorStop(1, 'rgba(255,170,100,0)');
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  // the checks (no render): the camera + what is being emitted; the bone directions; P4's people on screen
  function probe(t, T) { const nm = shotAt(t, T)[0]; if (nm === 'p2') { const a = p2Arm(t, T); return { shot: nm, zoom: lerp(1, .92, eio(clamp((t - T.p2) / (T.p3 - T.p2)))), emit: 14, arm: [a.S, a.E, a.W] }; }
    STAGE[nm](t, T); cam.updateMatrixWorld(); const d = V(); cam.getWorldDirection(d);
    let em = 0; if (nm !== 'p4') for (let i = 0; i < NMO; i++) em += moA[i] > .05 ? 1 : 0;
    const out = { shot: nm, p: cam.position.toArray(), d: d.toArray(), fov: cam.fov, emit: em, front: LU.uFront.value };
    if (nm === 'p4') { out.arrived = ARR4; out.visible = countVisible4(); out.D = P4C(t, T).D; out.rings = RINGS4.filter(e => { const a = t - (T.c2 + e.dt); return a > 0 && a < 1.6; }).length; }
    if (nm === 'p3') out.h = cam.position.y; return out; }
  const PS = { peter: PT, crowd0: crowd[0], crowd7: crowd[7], crowd30: crowd[30], walk0: lower[0], walk1: lower[1], door0: lower[3] };
  function joints(t, T) { const nm = shotAt(t, T)[0]; if (nm === 'p4') return {};
    if (nm === 'p2') { const a = p2Arm(t, T), dir = (A, B) => [B[0] - A[0], B[1] - A[1], 0].map((v, i, s) => v / Math.hypot(s[0], s[1])); return { p2: { ua: dir(a.S, a.E), fa: dir(a.E, a.W) } }; }
    STAGE[nm](t, T); const out = {}, Y = V(0, 1, 0);
    for (const [k, g] of Object.entries(PS)) { if (!g || !g.visible) continue; const U = g.userData; if (!U.arms[0].E) continue; const rec = {}; U.arms.forEach((A, i) => { rec['ua' + i] = A.E.clone().sub(A.S2 || A.S).normalize().toArray(); rec['fa' + i] = A.T.clone().sub(A.E).normalize().toArray(); });
      (U.legs || []).forEach((L, i) => { rec['th' + i] = Y.clone().applyQuaternion(L.thigh.quaternion).toArray(); rec['sh' + i] = Y.clone().applyQuaternion(L.shin.quaternion).toArray(); }); out[k] = rec; } return out; }
  return { film, draw, probe, joints, render };
}
