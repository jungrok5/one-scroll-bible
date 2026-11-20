// puppet-tent.js — 「kingdom」 4부 「겨자씨와 보화」 (film 326.5–390.7: N17 · Q7 · Q8 · N18 · N18b · Q9 · N19): the parables told as a
// shadow play on a lamp-lit tent cloth — a NEW look for this film.
//   N17   out of the light between the clouds into the lamp behind the cloth: an iris opens (0.5 s, the curtain) on a little
//         toy theatre — the lamp-lit cloth, a gilt frame, clay oil lamps along the front (「올리버!」 1968, OPUSCAR 41: candle
//         footlights, layered flats) — and the camera eases in to an empty field.
//   Q7    a jointed leather hand comes down on its rod holding one tiny seed between finger and thumb; it plants it; only the
//         seed glows (the one accent of the play: gold light).
//   Q8    push-in on the seed (「모든 씨보다 작은 것」), it splits, a shoot with two seed leaves rises past the grass, and the tree
//         (tree3d-mustard.js, drawn as dyed leather) grows to fill the cloth as the camera eases back; shadow birds fly in and
//         settle in its branches.
//   N18   the light behind the cloth swells and the shadow DEVELOPS into the real tree, from the trunk outward (「타이타닉」 1997,
//         OPUSCAR 70 · the first film's blueprint → 3D 「귀환」); the camera, already moving, tilts and cranes up into the
//         branches (tree3d-mustard.js carries N18–N18b: the lamps on every branch).
//   Q9    light to light, back on the cloth: an ox and a man ploughing; under the soil ahead a faint gold glint (the hidden
//         treasure); the share catches, the man kneels, brushes the soil away — gold light leaks from the gap of the lid; he
//         looks about, covers it; jumps up, runs home with planted steps, comes out with all he has in a bundle and gives it away.
//   N19   push-in on detail: the gold through a pinhole in the leather of the soil; the man comes back and stands before his
//         field, arms opening; the lamp warms and the camera eases back to the little theatre.
// Puppets move like rod puppets: jointed limbs on 2-bone IK with FIXED bone lengths and a fixed bend side per limb (knees
// forward, elbows back/down — never up), planted feet (the phase of a step is distance ÷ stride), continuous eased motion on
// ones (no pose snaps, no stepping on twos), a turn is the puppeteer's flip (the figure narrows and widens, mirrored).
// Men in head cloths to the shoulder, beards. No words. Light = lamp × what the leather lets through (kit-puppet.js).
// Craft sources (copied, never edited at the source): motion-skills canvas-film kits/puppet (kit-puppet.js: lamp, cloth,
// carve/place, buildHand/drawHand, rivets, rods, bloom, post) · kits/shadowstage (the jointed-figure rig: BODY proportions,
// walk with planted feet, walkAlong/stopStride, closeStep, kneel, mix, armTo — ported here with a fixed IK bend side) ·
// claude-drawing-skill "Shadow puppetry" (punched leather lace) · cinecode camera-moves.md (iris, push-in on detail, crane).
//
// API: const PT = await (await import('./puppet-tent.js')).build(W, H, TR);  PT.draw(ctx, t, B)   t = FILM seconds,
//      B = { N17, Q7, Q8, N18, N18b, Q9, N19, N20, pc: { <id>: [piece start times] } } from script.json (the page builds it).
const P = window.Puppet;
const { clamp, lerp, ss, eo, eio, rng, noise } = Pilot;
const TAU = Math.PI * 2;
const ease2 = x => { x = clamp(x); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
const mixv = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the one table: every time from the line times
export function beats(B) {
  const T = {}, q7 = B.pc.Q7, q8 = B.pc.Q8, q9 = B.pc.Q9, n19 = B.pc.N19;
  T.in = [B.N17, B.N17 + .8];                       // the dissolve from the clouds (the page's wall scene ends at in[1])
  T.iris = [B.N17 + .45, B.N17 + .95];              // iris open 0.5 s — the curtain (inside the dissolve: never a black frame)
  T.ease = [B.N17 + 1.2, B.Q7 + 1.2];               // the camera eases in from the theatre to the cloth
  // Q7 — the hand and the seed
  T.handIn = [B.Q7 - .2, q7[1] + .9];               // comes on (soft → pressed) and over the field
  T.handDown = [q7[1] + .9, q7[1] + 2.2];           // lowers to the soil
  T.release = [q7[1] + 2.25, q7[1] + 2.65];         // fingers open, the seed drops into the furrow
  T.tap = [q7[1] + 2.9, q7[1] + 4.1];               // the fingertip presses the soil over it (two taps)
  T.handOff = [B.Q8 + .5, B.Q8 + 1.6];              // lifts off the cloth (grows soft, fades)
  // Q8 — the push, the sprout, the tree, the birds (tree3d-mustard beats() carries the growth)
  T.push = [B.Q8 + .2, q8[1] - .1];                 // push-in on the seed
  T.back = [q8[1] + .1, q8[2] - .1];                // ease back as the tree fills the cloth
  T.seedFade = [q8[1] - .6, q8[1] + .8];
  T.surge = [B.N18 - .3, B.N18 + .5];               // the lamp swells: the light breaks through
  T.dev = [B.N18, B.N18 + .8];                      // the cloth gives way to the 3D world round the still-leather tree (tree3d-mustard
                                                    // devS then runs the develop up the trunk and out through every branch)
  T.seed = [q8[1] - 1.05, q8[1] + .55];             // the seedling: a hooked shoot, two seed leaves opening, true leaves, the stem curving up
  T.seedOut = [q8[1] + 1.0, q8[1] + 1.8];           // it gives way to the young tree growing out of it
  // Q9 — the field and the treasure
  T.q9in = [B.Q9, B.Q9 + .8];                       // dissolve in from the lit tree (light to light)
  T.catch = q9[1] - .65;                            // the share catches on the chest (end of 「밭에 감추인 보화와 같으니」)
  T.letGo = [T.catch + .3, T.catch + .75];          // he lets go of the handle, the back foot closes up, he looks down
  T.step = [T.catch + .8, T.catch + 1.5];           // two steps forward past the handle
  T.kneel = [T.catch + 1.5, T.catch + 2.1];         // down on one knee at the chest
  T.dig = [T.catch + 2.0, T.catch + 2.7];           // 「발견한 후」 — brushes the soil away, the lump slides aside
  T.gold = [T.catch + 2.25, T.catch + 2.8];         // gold leaks from the gap of the lid; he sits back
  T.look = [T.catch + 2.8, T.catch + 3.35];         // he looks about (head up, back, round)
  T.cover = [q9[2] - 1.0, q9[2] - .1];              // 「숨겨 두고」 — he pushes the soil back; a pinhole stays lit
  T.rise = [q9[2] + .05, q9[2] + .8];               // up off his knee, arms lifting (「기뻐하며」)
  T.armsDown = [q9[2] + .85, q9[2] + 1.25];         // the joy settles, arms come down before he turns
  T.flip1 = [q9[2] + 1.3, q9[2] + 1.42];            // the puppeteer turns him toward home (arms down, quick)
  T.run = [q9[2] + 1.45, q9[2] + 2.95];             // runs home (left), planted steps
  T.inside = [q9[2] + 2.75, q9[2] + 3.35];          // behind the house; comes out with the bundle
  T.out = [q9[2] + 3.0, q9[2] + 4.15];              // walks out to the buyer
  T.merchIn = [q9[1] + .55, q9[1] + 2.35];          // the buyer walks in from beside the house while the man digs (after the plough has passed)
  T.merchTurn = [q9[1] + 2.55, q9[1] + 2.67];       // one clear turn to face the house door (arms down, away from anyone): he waits there
  T.give = [q9[2] + 4.15, q9[2] + 5.85];              // 「자기의 소유를 다 팔아」 — the bundle into the buyer's hands
  T.merchOut = [q9[2] + 6.0, B.N19 + 3.4];         // the buyer goes off left with it on his shoulder
  T.flip2 = [1e9, 1e9];                             // (no second turn: he comes out of the house already facing the field)
  T.walkBack = [B.N19 + .55, n19[1] + .9];           // walks back to stand before his field (「그 밭을 사느니라」 → N19)
  T.detail = [B.N19 + .1, n19[1] - .2];             // N19 push-in on detail: the gold through the pinhole
  T.detailBack = [n19[1] - .2, n19[2] - .1];
  T.joy = [n19[2] - .2, n19[2] + 1.6];              // he stands before the field, arms opening
  T.warm = [n19[2] - .5, B.N20];                    // the lamp warms
  T.outro = [B.N20 - 2.6, B.N20];                   // eases back to the little theatre
  T.end = B.N20;
  return T;
}

// ---------------------------------------------------------------- the jointed figure (after kits/shadowstage, with a fixed bend side)
const BD = { ANK: 7, SHIN: 46, THIGH: 48, UARM: 38, FARM: 36, SHO: 60, HIP: 97 };
// 2-bone IK with FIXED bone lengths; sgn picks the side of the middle joint (never flips between frames)
function ik2(a, t, l1, l2, sgn) {
  const dx = t[0] - a[0], dy = t[1] - a[1], d = Math.hypot(dx, dy) || 1e-6, dd = clamp(d, Math.abs(l1 - l2) + .5, l1 + l2 - .3);
  const tx = a[0] + dx / d * dd, ty = a[1] + dy / d * dd, an = Math.atan2(ty - a[1], tx - a[0]);
  const b = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1)), j = an + sgn * b;
  return [[a[0] + Math.cos(j) * l1, a[1] + Math.sin(j) * l1], [tx, ty]];
}
const frameOf = F => { const up = [Math.sin(F.ang), -Math.cos(F.ang)], fw = [F.f * Math.cos(F.ang), F.f * Math.sin(F.ang)], s = F.s;
  return { up, fw, P: (a, b) => [F.hip[0] + fw[0] * a * s + up[0] * b * s, F.hip[1] + fw[1] * a * s + up[1] * b * s] }; };
const shoulderOf = (F, i) => frameOf(F).P(i ? 3 : -2, BD.SHO - (i ? 1 : 0));
const frac = x => x - Math.floor(x);
// the highest hip (smallest y) ≤ nominal height from which every leg still reaches its foot (fixed bone lengths)
function hipY(feet, x, s, nom, gy, f = 1) { let y = gy - nom; const L = (BD.THIGH + BD.SHIN) * s * .965;
  const smax = (a, b, k = 5 * s) => (a + b + Math.sqrt((a - b) * (a - b) + k * k)) / 2;   // a soft max: the hip never kinks when a foot leaves the ground
  feet.forEach(([fx, fy], i) => { const dx = fx - (x + f * (i ? 3 : -3) * s); y = smax(y, fy - BD.ANK * s - Math.sqrt(Math.max(0, L * L - dx * dx)) - 2 * s); }); return y; }
// solve the joints of a pose (for drawing and for the joint-speed check)
function joints(F) {
  const s = F.s, f = F.f, { P: Pt } = frameOf(F), J = {};
  J.leg = [0, 1].map(i => { const T = F.feet[i], hp = Pt(i ? 3 : -3, 2), ank = [T[0], T[1] - BD.ANK * s];
    const [kn, an] = ik2(hp, ank, BD.THIGH * s, BD.SHIN * s, -f); return { hp, kn, an, foot: T, i }; });
  J.arm = [0, 1].map(i => { const sh = shoulderOf(F, i); let T = F.hands[i]; if (!T) T = [sh[0] - f * 5 * s, sh[1] + 70 * s];
    const [el, hd] = ik2(sh, T, BD.UARM * s, BD.FARM * s, f); return { sh, el, hd }; });
  return J;
}
// poses (pure data)
function gyAt(x) { return fieldTop(x); }
function walkPose(x, s, f, ph, stride, o = {}) {
  const lift = (o.lift ?? 13) * s, st = o.stance ?? .6, sw = 1 - st;
  const feet = [0, 1].map(i => { const p = frac(ph + i * .5); let off, up = 0;
    if (p < st) off = stride * (st / 2 - p); else { const u = (p - st) / sw; off = -stride * st / 2 + stride * st * (.5 - .5 * Math.cos(Math.PI * u)); up = lift * (.5 - .5 * Math.cos(2 * Math.PI * u)); }
    const fx = x + f * off; return [fx, gyAt(fx) - up]; });
  const gy = gyAt(x), bounce = (o.bounce || 0) * s * Math.cos(TAU * 2 * ph);
  const hy = hipY(feet, x, s, BD.HIP * s * (o.crouch ?? .955), gy, f) - bounce;
  const F = { s, f, gy, hip: [x, hy], ang: f * (o.lean ?? .05), feet, hands: [null, null], tilt: o.tilt ?? 0, sway: 5 * Math.sin(TAU * ph), ph };
  const swa = (o.armSwing ?? 14) * Math.sin(TAU * ph) * s, shN = shoulderOf(F, 1), shF = shoulderOf(F, 0);
  if (o.pump) F.hands = [[shF[0] + f * swa * 1.6 + f * 16 * s, shF[1] + 46 * s], [shN[0] - f * swa * 1.6 + f * 16 * s, shN[1] + 46 * s]];   // running: elbows bent, hands pumping
  else F.hands = [[shF[0] + f * swa, shF[1] + 68 * s], [shN[0] - f * swa, shN[1] + 68 * s]];
  return F;
}
function walkAlong(t, t0, t1, x0, x1, stride, easeIn = .2, easeOut = .25) {   // planted: ph = |x − x0| / stride
  const u = clamp((t - t0) / (t1 - t0)), a = easeIn, b = easeOut, vmax = 1 / (1 - a / 2 - b / 2);
  let k; if (u < a) k = vmax * u * u / (2 * a); else if (u < 1 - b) k = vmax * (a / 2 + (u - a)); else { const r = 1 - u; k = 1 - vmax * r * r / (2 * b); }
  const x = lerp(x0, x1, clamp(k)); return { x, ph: Math.abs(x - x0) / stride };
}
const stopStride = (dist, nom) => { const n = Math.max(1, Math.round(dist / nom - .05)); return dist / (n + .05); };
function standPose(x, s, f, o = {}) { const sp = (o.spread ?? 12) * s, feet = [[x - f * sp, gyAt(x - f * sp)], [x + f * sp * .8, gyAt(x + f * sp * .8)]], gy = gyAt(x);
  return { s, f, gy, hip: [x, hipY(feet, x, s, (BD.HIP - 1) * s, gy, f)], ang: f * (o.lean ?? .02), feet, hands: [null, null], tilt: o.tilt ?? 0, sway: 0 }; }
// stand with the given feet (both planted) — the hip over them
function standOn(feet, s, f, o = {}) { const x = (feet[0][0] + feet[1][0]) / 2 + f * 2 * s, gy = gyAt(x);
  return { s, f, gy, hip: [x, hipY(feet, x, s, (BD.HIP - 1) * s, gy, f)], ang: f * (o.lean ?? .02), feet: feet.map(q => q.slice()), hands: [null, null], tilt: o.tilt ?? 0, sway: 0 }; }
// kneel on leg `k` (its shin flat behind, toes tucked), the other foot planted at `front`
function kneelOn(front, k, s, f, lean = .3) { const x = front[0] - f * 34 * s, gy = gyAt(x), feet = [];
  feet[1 - k] = front.slice(); feet[k] = [x - f * 52 * s, gyAt(x - f * 52 * s) - 2 * s];
  const kn = [false, false]; kn[k] = true;
  return { s, f, gy, hip: [x, gy - 50 * s], ang: f * lean, feet, kneel: kn, hands: [null, null], tilt: .15, sway: 0 }; }
// the foot that moves between two poses lifts on an arc (nothing slides on the ground)
function stepBlend(A, Bp, k, lift = 11) { const F = mixPose(A, Bp, k); if (k <= 0 || k >= 1) return F;
  F.feet = F.feet.map((q, i) => { const d = Math.hypot(A.feet[i][0] - Bp.feet[i][0], A.feet[i][1] - Bp.feet[i][1]); return d > 2 ? [q[0], q[1] - lift * A.s * Math.sin(Math.PI * k) * clamp(d / 30)] : q; }); return F; }
const clonePose = F => ({ ...F, hip: F.hip.slice(), feet: F.feet.map(q => q.slice()), hands: F.hands.map(h => h && h.slice()), kneel: F.kneel && F.kneel.slice(), toes: F.toes && F.toes.slice() });
function mixPose(A, Bp, k) {
  if (k <= 0) return clonePose(A); if (k >= 1) return clonePose(Bp);
  const pick = k < .5 ? A : Bp, hang = F => [0, 1].map(i => { const sh = shoulderOf(F, i); return [sh[0] - F.f * 5 * F.s, sh[1] + 70 * F.s]; }), hA = hang(A), hB = hang(Bp);
  return { ...pick, s: lerp(A.s, Bp.s, k), gy: lerp(A.gy, Bp.gy, k), hip: mixv(A.hip, Bp.hip, k), ang: lerp(A.ang, Bp.ang, k), feet: [mixv(A.feet[0], Bp.feet[0], k), mixv(A.feet[1], Bp.feet[1], k)],
    hands: [0, 1].map(i => mixv(A.hands[i] || hA[i], Bp.hands[i] || hB[i], k)), tilt: lerp(A.tilt || 0, Bp.tilt || 0, k), sway: lerp(A.sway || 0, Bp.sway || 0, k), kneel: k < .5 ? A.kneel : Bp.kneel };
}
// a hand swung along the arc in front of the body: th 0 hanging, π/2 forward, ~2.6 raised (blend th, never the position)
function armTo(F, i, th, r = 70) { const sh = shoulderOf(F, i), s = F.s; F.hands = F.hands.slice(); F.hands[i] = [sh[0] + F.f * (Math.sin(th) * r - 4 * Math.cos(th)) * s, sh[1] + Math.cos(th) * r * s]; return F; }

// ---------------------------------------------------------------- the field
// the top edge of the soil (cloth px): low and a little uneven; figures stand on it
function fieldTop(x) { return 1078 + 2.6 * Math.sin(x * .011 + .4) + 1.6 * Math.sin(x * .029 + 1.3) + 1.2 * Math.sin(x * .061); }

export async function build(W, H, TR) {
  P.init({ world: [1080, 1300], vignette: { cy: .4, inner: .28, outer: .62, stops: [[0, '#fff'], [.62, '#ecd6ba'], [1, '#7a4c28']] } });
  const CW = 1080, CH = 1300;
  let T = null, BB = null;
  const LAMP = { x: 540, y: 640 };                            // the hot spot = where the 3D sun stands (tree3d-mustard SUN0)
  const DYE = { body: '#1d1109', far: '#3a2413', robe: '#24140a', ox: '#22140a', oxFar: '#3e2716', wood: '#2a180b' };
  const R0 = rng(5);

  // dyed hide tiles (the leather's fibre in every figure, fixed to the cloth: it zooms with the camera)
  const tint = (hex, k = 1) => { const c = Pilot.canvas(256, 256), g = c.getContext('2d'); g.drawImage(P.HIDE, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = hex; g.fillRect(0, 0, 256, 256); return c; };
  const TILE = Object.fromEntries(Object.entries(DYE).map(([k, v]) => [k, tint(v)]));
  const FIG = Pilot.canvas(W, H), fg = FIG.getContext('2d');
  const PAT = {}; const pat = (g, key) => PAT[key] || (PAT[key] = g.createPattern(TILE[key], 'repeat'));   // the CTM maps the cloth to the screen

  // ---------------------------------------------------------------- set pieces (carved once)
  // the field: soil with furrows cut as half-lit slits (thinned leather), clods on the top edge
  const field = P.carve({ box: [-20, 1060, 1100, 1310], res: 1.5, dye: '#2c190b', seed: 3, cutAlpha: .4, rim: 0, outline: 1.6,
    shape: g => { g.moveTo(-20, 1310); for (let x = -20; x <= 1100; x += 6) g.lineTo(x, fieldTop(x)); g.lineTo(1100, 1310); g.closePath(); },
    detail: g => { P.cutLine(g, 1.6, q => { for (const [y, a, ph] of [[1108, 4, 0], [1140, 5, 1.7], [1178, 6, .6], [1222, 7, 2.4], [1272, 8, 1.1]]) { q.moveTo(-10, y); for (let x = -10; x <= 1090; x += 10) q.lineTo(x, y + a * Math.sin(x * .006 + ph) + 1.2 * Math.sin(x * .05)); } });
      P.dots(g, Array.from({ length: 70 }, (_, i) => [8 + i * 15.4, 1124 + 3 * Math.sin(i * 1.7)]), 1.3);
      P.dots(g, Array.from({ length: 56 }, (_, i) => [14 + i * 19.3, 1196 + 4 * Math.sin(i * 2.3)]), 1.6); } });
  // far hills: a flat held off the cloth (soft, paler) — the layered flats of a toy theatre
  const hills = P.silhouette([-40, 930, 1120, 1100], .5, g => { g.beginPath(); g.moveTo(-40, 1100); for (let x = -40; x <= 1120; x += 10) g.lineTo(x, 1010 - 38 * Math.sin(x * .004 + .8) - 16 * Math.sin(x * .013 + 2) - 26 * Math.exp(-(((x - 820) / 120) ** 2))); g.lineTo(1120, 1100); g.closePath(); g.fill(); });
  // grass tufts on the edge of the field near the seed — the shoot outgrows them
  const tuft = (seed, h) => P.carve({ box: [-34, -h - 6, 34, 6], res: 3, dye: '#24150a', seed, rim: 0, outline: 1.2,
    shape: g => { const r = rng(seed); g.moveTo(-30, 4); for (let i = 0; i < 9; i++) { const x = -26 + i * 6.5, hh = h * (.45 + r() * .55), lean = (r() - .5) * 16; g.lineTo(x - 2, 0); g.quadraticCurveTo(x + lean * .4, -hh * .6, x + lean, -hh); g.quadraticCurveTo(x + lean * .3 + 2, -hh * .5, x + 3, 0); } g.lineTo(30, 4); g.closePath(); } });
  const TUFTS = [[452, 34, 11], [492, 26, 12], [598, 30, 13], [640, 38, 14], [356, 28, 15], [728, 32, 16], [205, 30, 17], [905, 34, 18]].map(([x, h, sd]) => ({ x, p: tuft(sd, h) }));
  // the house at the left edge: flat roof with a parapet, a door (bare cloth = the light inside), a lattice window
  const house = P.carve({ box: [-40, 720, 214, 1090], res: 2, dye: '#2b1a0d', seed: 21, outline: 1.8,
    shape: g => { g.moveTo(-40, 1084); g.lineTo(-40, 752); g.lineTo(-14, 752); g.lineTo(-14, 738); g.lineTo(172, 738); g.lineTo(172, 752); g.lineTo(196, 752); g.lineTo(196, 1084); g.closePath(); },
    detail: g => { P.lattice(g, 22, 778, 78, 832, 9, 1.6); P.cut(g, q => { q.moveTo(98, 1084); q.lineTo(98, 840); q.quadraticCurveTo(132, 798, 166, 840); q.lineTo(166, 1084); q.closePath(); });
      for (let x = -32; x < 190; x += 22) P.cut(g, q => q.rect(x, 742, 12, 4)); P.ink(g, 1.4, q => { q.moveTo(-40, 756); q.lineTo(196, 756); });
      P.dots(g, Array.from({ length: 9 }, (_, i) => [-26 + i * 24, 900 + (i % 2) * 40]), 1.5); } });
  const DOOR = { x0: 98, x1: 166, top: 800 };
  // the chest: a small iron-bound box, the lid's gap is where the gold comes through
  const chest = P.carve({ box: [-40, -30, 40, 26], res: 3, dye: '#1e1108', seed: 31, rim: 0, outline: 1.4, smooth: false,
    shape: [[-34, -18], [34, -18], [36, -12], [36, 22], [-36, 22], [-36, -12]],
    detail: g => { P.ink(g, 2, q => { q.moveTo(-36, -9); q.lineTo(36, -9); }, '#090402'); P.dots(g, [[-28, 4], [28, 4], [-28, 16], [28, 16], [0, 12]], 1.6); } });
  const CHEST = { x: 520, y: 1121 };
  // the soil lump over it (he brushes it aside and puts it back)
  const lump = P.carve({ box: [-48, -22, 48, 18], res: 2, dye: '#2c190b', seed: 33, rim: 0, outline: 1.2, shape: [[-44, 14], [-38, -6], [-18, -16], [8, -18], [30, -12], [44, 2], [42, 14]] });
  // the bundle: everything he has, tied in a cloth
  const bundle = P.carve({ box: [-40, -46, 40, 34], res: 2.5, dye: '#2a170b', seed: 41, outline: 1.6, punch: { kind: 'dots', step: 13, r: 1.6 },
    shape: [[-34, 26], [-38, 2], [-26, -22], [-8, -30], [-14, -42], [0, -36], [14, -44], [10, -30], [28, -20], [38, 4], [32, 26]] });
  // the ox: a carved body and head (lace on the flank), legs and tail jointed
  const oxBody = P.carve({ box: [-40, -150, 200, -40], res: 2, dye: DYE.ox, seed: 61, punch: [{ kind: 'crescents', area: [20, -120, 150, -70], r: 7, w: 1.5 }], rim: 6, outline: 1.8,
    shape: [[-22, -96], [-14, -122], [20, -126], [70, -124], [120, -134], [150, -140], [176, -128], [186, -104], [176, -82], [150, -70], [100, -64], [40, -66], [0, -70], [-20, -80]] });
  const oxHead = P.carve({ box: [-30, -60, 96, 50], res: 2.5, dye: DYE.ox, seed: 63, rim: 0, outline: 1.6,
    shape: g => { g.moveTo(-18, -26); g.quadraticCurveTo(4, -40, 26, -34); g.lineTo(34, -48); g.quadraticCurveTo(46, -60, 60, -54); g.quadraticCurveTo(48, -50, 44, -36);
      g.quadraticCurveTo(66, -24, 80, 6); g.quadraticCurveTo(88, 22, 76, 30); g.quadraticCurveTo(60, 36, 48, 26); g.quadraticCurveTo(26, 12, 4, 18); g.quadraticCurveTo(-14, 16, -22, -2); g.closePath(); },
    detail: g => { P.dots(g, [[56, -8]], 2.6); P.cutLine(g, 1.4, q => { q.moveTo(20, -26); q.quadraticCurveTo(10, -32, 0, -24); }); } });
  const sleeve = P.carve({ box: [-10, -50, 780, 70], res: 1.2, dye: '#22140a', seed: 53, rim: 0, outline: 1.6, punch: { kind: 'crescents', area: [40, -20, 760, 40], r: 9, w: 1.6 },
    shape: [[0, -26], [200, -32], [480, -40], [770, -48], [770, 64], [480, 52], [200, 40], [0, 30]], detail: g => P.ink(g, 2.2, q => { q.moveTo(26, -28); q.lineTo(30, 33); }) });
  const OX = { s: 1.0, stride: 92, len: { fu: 50, fl: 50, hu: 52, hl: 50 }, hipF: [150, -98], hipR: [8, -100] };

  // ---------------------------------------------------------------- the camera of the play: screen = c + (p − a)·s
  const VW = { theatre: { s: .8, ax: 540, ay: 640, cx: 540, cy: 690 }, cloth: { s: 1, ax: 540, ay: 650, cx: 540, cy: 650 } };
  const mixView = (A, Bv, k) => ({ s: Math.exp(lerp(Math.log(A.s), Math.log(Bv.s), k)), ax: lerp(A.ax, Bv.ax, k), ay: lerp(A.ay, Bv.ay, k), cx: lerp(A.cx, Bv.cx, k), cy: lerp(A.cy, Bv.cy, k) });
  const Mof = v => new DOMMatrix().translate(v.cx, v.cy).scale(v.s).translate(-v.ax, -v.ay);
  // close in (s ≥ 1) the frame stays on the cloth: its edges never come into view (blended in near s = 1, no jump)
  const inCloth = v => { const w = ss(.95, 1.06, v.s); if (w <= 0) return v; const ax = clamp(v.ax, v.cx / v.s, CW - (W - v.cx) / v.s), ay = Math.max(v.ay, v.cy / v.s);
    return { ...v, ax: lerp(v.ax, ax, w), ay: lerp(v.ay, ay, w) }; };
  function view(t) {
    if (t < T.q9in[0] - .01) {   // the first play: theatre → cloth → the hand → the seed → back as the tree grows
      const sow = { s: 1.1, ax: 600, ay: 900, cx: 540, cy: 840 }, seed = { s: 1.95, ax: 540, ay: 1079, cx: 540, cy: 890 };
      let v = mixView(VW.theatre, VW.cloth, eio((t - T.ease[0]) / (T.ease[1] - T.ease[0])));
      v = mixView(v, sow, ease2((t - T.ease[1]) / (T.push[0] - T.ease[1])));
      v = mixView(v, seed, eio((t - T.push[0]) / (T.push[1] - T.push[0])));
      v = mixView(v, VW.cloth, eio((t - T.back[0]) / (T.back[1] - T.back[0])));
      return inCloth(v);   // exactly the cloth camera at N18, where the 3D camera takes over
    }
    // the second play: close enough that the people read on a phone; the camera follows the action (eased between keys),
    // the push-in on detail to the pinhole, back, and out to the little theatre at the end
    const C0 = { cx: 540, cy: 900 }, K = [
      [T.q9in[0], { s: 1.5, ax: 330, ay: 985 }], [T.catch, { s: 1.5, ax: 430, ay: 985 }],
      [T.kneel[0], { s: 1.72, ax: 470, ay: 1006 }], [T.cover[1], { s: 1.72, ax: 472, ay: 1006 }],
      [T.rise[1] + .2, { s: 1.52, ax: 410, ay: 985 }], [T.run[1] + .4, { s: 1.5, ax: 262, ay: 985 }],
      [T.give[1] + .2, { s: 1.5, ax: 262, ay: 985 }], [T.detail[0], { s: 1.5, ax: 300, ay: 985 }],
      [T.detail[1], { s: 2.5, ax: CHEST.x + 6, ay: CHEST.y - 22, cx: 540, cy: 880 }], [T.detailBack[1], { s: 1.45, ax: 410, ay: 985 }],
      [T.outro[0], { s: 1.4, ax: 420, ay: 980 }], [T.outro[1], VW.theatre]].map(([t, v]) => [t, { ...C0, ...v }]);
    let i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++;
    return inCloth(mixView(K[i][1], K[i + 1][1], eio((t - K[i][0]) / (K[i + 1][0] - K[i][0]))));
  }

  // ---------------------------------------------------------------- the people and the ox over time
  const S = 1.12;
  const MAN = { s: S }, BUY = { s: S * .98 };
  // plough geometry from the ox's hip x (o) — the share in the soil, the beam to the yoke, the handle the man holds
  const plough = (ox, k) => { const sh = [ox.x - 120, gyAt(ox.x - 120) + 13], yoke = [ox.x + OX.hipF[0] + 18, gyAt(ox.x + 150) + OX.hipF[1] - 22 + ox.headY * .3];
    return { share: sh, yoke, heel: [sh[0] - 16, sh[1] - 12], top: [sh[0] - 58 - 6 * k, sh[1] - 104 + 10 * k] }; };
  function oxAt(t) {
    // walks right with the plough until the catch; a jolt; then stands and grazes
    const xc = CHEST.x + 62, x0 = xc - 300, str = OX.stride;
    const a = T.q9in[0] - 1.6, w = walkAlong(t, a, T.catch, x0, xc, str, .02, .02);
    const after = t - T.catch, jolt = after > 0 ? Math.exp(-after * 5) * Math.sin(after * 18) * 4 : 0;
    const settle = after > 0 ? 6 * eo(clamp(after / .5)) : 0;
    const graze = ss(T.catch + 1.6, T.catch + 3.2, t) * (.55 + .12 * Math.sin((t - T.catch) * 1.3));
    const headY = after > 0 ? -10 * Math.exp(-after * 2.2) * clamp(after * 6) : 0;
    return { x: w.x + settle, ph: w.ph + settle / str, jolt, graze, headY, walking: t < T.catch };
  }
  function oxLegs(o) {   // four legs: lateral walk (LH 0 · LF .25 · RH .5 · RF .75), hooves planted while in stance
    const legs = []; const st = .68, lift = 11;
    for (const [i, base, ph0, far] of [[0, OX.hipR, 0, true], [1, OX.hipF, .25, true], [2, OX.hipR, .5, false], [3, OX.hipF, .75, false]]) {
      const p = frac(o.ph + ph0); let off, up = 0;
      if (p < st) off = OX.stride * (st / 2 - p); else { const u = (p - st) / (1 - st); off = -OX.stride * st / 2 + OX.stride * st * eio(u); up = lift * Math.sin(Math.PI * u); }
      const hx = o.x + base[0] + (far ? -6 : 0), fx = hx + off;
      legs.push({ i, far, front: base === OX.hipF, hip: [hx, gyAt(hx) + base[1] - o.bob], foot: [fx, gyAt(fx) - up] });
    }
    return legs;
  }
  // the man's way through the second play, built from anchors so every phase starts where the last one ended
  const STR = 120 * S, HOLD = pg => [[pg.top[0] - 15, pg.top[1] + 19], [pg.top[0], pg.top[1]]];
  const ploughPose = t => { const pg = plough(oxAt(t), 0), hx = pg.top[0] - 52 * S; const F = walkPose(hx, S, 1, (hx - 60) / STR, STR, { lean: .16, armSwing: 0 }); F.hands = HOLD(pg); return F; };
  const hangOf = (F, i) => [shoulderOf(F, i)[0] + F.f * (i ? -4 : 9) * F.s, shoulderOf(F, i)[1] + (i ? 70 : 62) * F.s];
  let A = null;   // anchors (computed once T is known)
  function anchors() {
    const Wc = ploughPose(T.catch);
    // close step: the back foot comes up beside the front one
    const back = Wc.feet[0][0] < Wc.feet[1][0] ? 0 : 1, fr = Wc.feet[1 - back];
    const feetC = []; feetC[1 - back] = fr.slice(); feetC[back] = [fr[0] - 20 * S, gyAt(fr[0] - 20 * S)];
    const Sc = standOn(feetC, S, 1, { lean: .1 });
    // two steps forward to the kneeling place
    const x0 = Sc.hip[0], x1 = CHEST.x - 100, str = stopStride(x1 - x0, 62);
    const Wend = walkPose(x1, S, 1, (x1 - x0) / str + .05, str, { lean: .06 });
    const front = Wend.feet[0][0] > Wend.feet[1][0] ? 0 : 1;
    const Kn = kneelOn(Wend.feet[front], 1 - front, S, 1, 1.22);
    const Kup = kneelOn(Wend.feet[front], 1 - front, S, 1, .42);
    const feetR = []; feetR[front] = Wend.feet[front].slice(); feetR[1 - front] = [Wend.feet[front][0] - 22 * S, gyAt(Wend.feet[front][0] - 22 * S)];
    const Sr = standOn(feetR, S, 1, { lean: -.04 });
    A = { Wc, Sc, x0, x1, str, Wend, Kn, Kup, Sr, front };
    A.runX0 = Sr.hip[0]; A.runX1 = 34; A.runStr = stopStride(A.runX0 - A.runX1, 150 * S);
    A.outX0 = 56; A.outX1 = 214; A.outStr = stopStride(A.outX1 - A.outX0, 128 * S);
    A.Wd = walkPose(A.outX1, S, 1, (A.outX1 - A.outX0) / A.outStr + .05, A.outStr, { lean: .1, armSwing: 0 });
    A.St0 = standOn(A.Wd.feet, S, 1, { lean: .03 });
    A.backX0 = A.St0.hip[0]; A.backX1 = CHEST.x - 132; A.backStr = stopStride(A.backX1 - A.backX0, 130 * S);
    A.We = walkPose(A.backX1, S, 1, (A.backX1 - A.backX0) / A.backStr + .05, A.backStr, { lean: .05 });
    A.Sf = standOn(A.We.feet, S, 1, { lean: .02 });
  }
  const joyArms = (F, up, t) => { armTo(F, 1, lerp(.15, 2.5, up) + .05 * Math.sin(t * 2.3) * up); armTo(F, 0, lerp(.1, 2.3, up)); return F; };
  function manAt(t) {
    if (!A) anchors();
    const o = oxAt(t), pg = plough(o, 0);
    let F, flip = null;
    if (t < T.catch) { F = ploughPose(t); }
    else if (t < T.step[0]) {   // the jolt; let go of the handle; the back foot closes up; he looks down
      const k = Math.exp(-(t - T.catch) * 4) * clamp((t - T.catch) * 10), hk = ease2((t - T.letGo[0]) / (T.letGo[1] - T.letGo[0]));
      F = stepBlend(A.Wc, A.Sc, hk);
      F.hands = [0, 1].map(i => mixv(HOLD(pg)[i], hangOf(F, i), hk));
      F.ang += k * .22; F.tilt = ss(T.catch + .15, T.catch + .5, t) * .5;
    } else if (t < T.kneel[0]) {   // two planted steps forward (from the stand: the walk's both-feet-down phase)
      const w = walkAlong(t, T.step[0], T.step[1], A.x0, A.x1, A.str, .3, .3);
      F = walkPose(w.x, S, 1, w.ph + .05, A.str, { lean: .06, armSwing: 8 });
      if (t < T.step[0] + .2) F = mixPose(A.Sc, F, ease2((t - T.step[0]) / .2));
      F.tilt = .45;
    } else if (t < T.rise[0]) {   // kneeling: dig, the gold, look about, cover
      F = stepBlend(A.Wend, A.Kn, ease2((t - T.kneel[0]) / (T.kneel[1] - T.kneel[0])), 14);
      const awe = ss(T.gold[0], T.gold[1], t) * (1 - ss(T.cover[0] - .75, T.cover[0], t));
      F.ang = lerp(F.ang, F.f * .42, awe); F.hip = [F.hip[0], F.hip[1] - 4 * S * awe];
      const dk = clamp((t - T.dig[0]) / (T.dig[1] - T.dig[0])), lk = clamp((t - T.look[0]) / (T.look[1] - T.look[0])), ck = clamp((t - T.cover[0]) / (T.cover[1] - T.cover[0]));
      const hk = ss(T.kneel[0] + .3, T.kneel[1], t);
      // the hands at the soil over the chest: brushing strokes, alternating; then pushing the soil back
      const br = Math.sin(dk * Math.PI * 4) * 14, cv = Math.sin(ck * Math.PI * 3) * 12, gy = gyAt(CHEST.x) + 3;
      const nearW = [CHEST.x + 4 + br - cv, gy + 2 - 3 * Math.abs(Math.sin(dk * Math.PI * 4))], farW = [CHEST.x - 18 - br * .6 + cv, gy + 1];
      const nearA = [F.hip[0] + 30 * S, F.hip[1] - 26 * S], farA = [F.hip[0] + 24 * S, F.hip[1] - 30 * S];   // sitting back: hands lifted before him
      const near = mixv(nearW, nearA, awe), far = mixv(farW, farA, awe);
      F.hands = [0, 1].map(i => mixv(hangOf(F, i), i ? near : far, hk));
      F.tilt = lerp(.4, .02, awe) * (1 - ss(T.look[0], T.look[0] + .2, t) * (1 - ss(T.look[1] - .2, T.look[1], t))) - .32 * Math.sin(lk * Math.PI) + .2 * Math.sin(lk * Math.PI * 2) * (lk > 0 && lk < 1 ? 1 : 0);
      if (t > T.cover[0]) F.tilt = Math.max(F.tilt, .38 * ss(T.cover[0], T.cover[0] + .3, t));
    } else if (t < T.run[0]) {   // up off the knee with joy; then the flip toward home
      const up = ease2((t - T.rise[0]) / (T.rise[1] - T.rise[0]));
      const Kc = { ...A.Kn, ang: A.Kn.f * lerp(1.22, .42, ss(T.rise[0], T.rise[0] + .3, t)) };
      F = stepBlend(Kc, A.Sr, up, 12); joyArms(F, ss(T.rise[0] + .15, T.rise[1], t) * (1 - ss(T.armsDown[0], T.armsDown[1], t)), t); F.tilt = lerp(.38, -.22, up) + .2 * ss(T.armsDown[0], T.armsDown[1], t);
      const H0 = manAt(T.rise[0] - .001).F.hands, hb = ss(T.rise[0], T.rise[0] + .4, t); F.hands = F.hands.map((h, i) => mixv(H0[i] || h, h, hb));
      if (t > T.flip1[0]) { const k = clamp((t - T.flip1[0]) / (T.flip1[1] - T.flip1[0])); flip = k < 1 ? k : null;
        if (k >= .5) { F = standOn(A.Sr.feet, S, -1, { lean: .02 }); F.tilt = -.02; } }
    } else if (t < T.out[0]) {   // runs home: a flight phase, planted feet, one arm still up for joy at first
      const w = walkAlong(t, T.run[0], T.run[1], A.runX0, A.runX1, A.runStr, .22, .02);
      F = walkPose(w.x, S, -1, w.ph + .05, A.runStr, { stance: .38, lift: 24, lean: .2, bounce: 3, pump: 1, armSwing: 15, crouch: .96 });
      if (t < T.run[0] + .3) { const St = standOn(A.Sr.feet, S, -1, { lean: .02 }); St.tilt = -.02; F = mixPose(St, F, ease2((t - T.run[0]) / .3)); }
      F.tilt = F.tilt ?? -.1;
    } else if (t < T.give[0]) {   // out of the door with the bundle in both arms
      const w = walkAlong(t, T.out[0], T.out[1], A.outX0, A.outX1, A.outStr, .05, .35);
      F = walkPose(w.x, S, 1, w.ph + .05, A.outStr, { lean: .1, armSwing: 0 });
      const c = frameOf(F).P(30, 14); F.carry = c; F.hands = [[c[0] - 30, c[1] + 20], [c[0] + 28, c[1] + 22]];
    } else if (t < T.walkBack[0]) {   // gives it; then the flip back to the field
      const gk = ease2((t - T.give[0]) / (T.give[1] - T.give[0]));
      F = { ...A.Wd, hands: A.Wd.hands.slice(), ang: A.Wd.f * lerp(.1, .03, ss(.6, 1, gk)) };
      const c0 = frameOf(A.Wd).P(30, 14), c1 = [c0[0] + 18 * gk, c0[1] - 4 * gk];
      F.carry = gk < .6 ? c1 : null;
      const hold = [[c1[0] - 30, c1[1] + 20], [c1[0] + 28, c1[1] + 22]];
      F.hands = [0, 1].map(i => mixv(hold[i], hangOf(F, i), ss(.6, .95, gk)));
      if (t > T.flip2[0]) { const k = clamp((t - T.flip2[0]) / (T.flip2[1] - T.flip2[0])); flip = k < 1 ? k : null; if (k >= .5) F = { ...A.St0, hands: [null, null] }; }
    } else {   // walks back to the field and stands before it; arms open
      const w = walkAlong(t, T.walkBack[0], T.walkBack[1], A.backX0, A.backX1, A.backStr, .25, .3);
      F = walkPose(w.x, S, 1, w.ph + .05, A.backStr, { lean: .05 });
      if (t < T.walkBack[0] + .3) F = mixPose(A.St0, F, ease2((t - T.walkBack[0]) / .3));
      if (t >= T.walkBack[1]) F = stepBlend(A.We, A.Sf, ease2((t - T.walkBack[1]) / .5));
      const jk = ease2((t - T.joy[0]) / (T.joy[1] - T.joy[0]));
      if (jk > 0) { armTo(F, 1, lerp(.12, 2.45, jk) + .04 * Math.sin(t * 1.3) * jk); armTo(F, 0, lerp(.08, 2.2, jk)); F.tilt = -.34 * jk; F.ang = F.f * lerp(.02, -.08, jk); }
    }
    return { F, flip, pg, o };
  }
  function buyerAt(t) {
    // the buyer stands by the house watching the field (breathing, weight shifting); after the man has run past him he turns once
    // toward the house (arms down, quick), takes the bundle, swings it onto his back and goes off left with it
    if (t < T.merchIn[0] || t > T.merchOut[1]) return null;
    const s = BUY.s, X = 296, life = (F, ph) => { const w = Math.sin(t * .35 + ph * 6.283); F.hip = [F.hip[0] + .8 * w, F.hip[1] - .6 * Math.abs(w)]; F.tilt = (F.tilt || 0) + .04 * Math.sin(t * .27 + ph * 11); return F; };
    const strI = stopStride(X - 20, 140 * s), We = walkPose(X, s, 1, (X - 20) / strI + .05, strI, { lean: .05 }), feet = We.feet.map(q => q.slice());
    if (t < T.merchIn[1]) { const w = walkAlong(t, T.merchIn[0], T.merchIn[1], 20, X, strI, .1, .3); return { F: walkPose(w.x, s, 1, w.ph + .05, strI, { lean: .05 }), flip: null, carry: null }; }
    if (t < T.merchTurn[0]) return { F: life(stepBlend(We, standOn(feet, s, 1, { lean: .02 }), ease2((t - T.merchIn[1]) / .2)), .3), flip: null, carry: null };
    if (t < T.merchTurn[1]) { const k = clamp((t - T.merchTurn[0]) / (T.merchTurn[1] - T.merchTurn[0])); return { F: life(standOn(feet, s, k < .5 ? 1 : -1, { lean: .02 }), .3), flip: k, carry: null }; }
    const St = life(standOn(feet, s, -1, { lean: .04 }), .3), gk = ease2((t - T.give[0]) / (T.give[1] - T.give[0]));
    const overArm = (F, th) => { armTo(F, 1, th * .86, 54); const h = F.hands[1]; return [h[0] - F.f * 16, h[1] + 54]; };   // the hand over the shoulder on its neck, the bundle on his back below it
    if (t < T.merchOut[0]) {
      const c0 = frameOf(A.Wd).P(30, 14), c = [c0[0] + 18 * gk, c0[1] - 4 * gk];
      const hang = [0, 1].map(i => hangOf(St, i)), grab = [[c[0] + 29, c[1] + 18], [c[0] - 27, c[1] + 22]];
      const sw = ss(.6, 1, gk), hand2 = ss(.55, .9, gk);
      St.hands = [0, 1].map(i => mixv(hang[i], grab[i], ss(.2, .55, gk)));
      let cc = null;
      if (gk >= .55) { const Fx = { ...St, hands: St.hands.slice() }; const back = overArm(Fx, lerp(1.45, 2.85, sw));
        St.hands[1] = mixv(grab[1], Fx.hands[1], hand2); St.hands[0] = mixv(grab[0], hang[0], ss(.6, .95, gk)); cc = mixv(c, back, hand2); }
      return { F: St, flip: null, carry: cc, behind: gk > .72 };
    }
    const str2 = stopStride(St.hip[0] + 110, 140 * s), w = walkAlong(t, T.merchOut[0], T.merchOut[1], St.hip[0], -110, str2, .25, .05);
    const F = walkPose(w.x, s, -1, w.ph + .05, str2, { lean: .12, armSwing: 8 });
    if (t < T.merchOut[0] + .4) { const k = ease2((t - T.merchOut[0]) / .4); F.hip = mixv(St.hip, F.hip, k); F.feet = F.feet.map((q, i) => mixv(St.feet[i], q, k)); F.hands = [mixv(hangOf(St, 0), F.hands[0], k), F.hands[1]]; }
    const back = overArm(F, 2.85);
    return { F, flip: null, carry: back, behind: true };
  }

  // ---------------------------------------------------------------- drawing figures into the leather layer (FIG, then × into T)
  const cap = (g, a, b, ra, rb) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    g.beginPath(); g.moveTo(a[0] + nx * ra, a[1] + ny * ra); g.lineTo(b[0] + nx * rb, b[1] + ny * rb); g.arc(b[0], b[1], rb, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
    g.lineTo(a[0] - nx * ra, a[1] - ny * ra); g.arc(a[0], a[1], ra, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true); g.closePath(); g.fill(); };
  const rivets = [];
  function drawHuman(g, F, M, o = {}) {
    const s = F.s, f = F.f, { P: Pt } = frameOf(F), J = joints(F);
    // far arm, far leg (thinner, paler leather)
    g.fillStyle = pat(g, 'far', M);
    const arm = (A, w) => { cap(g, A.sh, A.el, 6.2 * s, 5.2 * s); cap(g, A.el, A.hd, 5.2 * s, 4 * s); const an = Math.atan2(A.hd[1] - A.el[1], A.hd[0] - A.el[0]); g.beginPath(); g.ellipse(A.hd[0] + Math.cos(an) * 4 * s, A.hd[1] + Math.sin(an) * 4 * s, 6.4 * s, 4.6 * s, an, 0, TAU); g.fill(); };
    const leg = L => { cap(g, L.hp, L.kn, 8 * s, 6.2 * s); cap(g, L.kn, L.an, 6.2 * s, 4.6 * s);
      const lift = Math.max(0, gyAt(L.foot[0]) - L.foot[1]), toe = F.kneel && F.kneel[L.i] ? .9 : lift > 3 * s ? -.25 * clamp(lift / (10 * s)) : 0, cs = Math.cos(toe), sn = Math.sin(toe);
      g.beginPath(); [[-6, -8], [6, -8], [15, -4], [20, -1], [20, 1], [-7, 1]].forEach(([u, v], j) => { const x = L.an[0] + f * (u * cs - v * sn) * s, y = L.an[1] + BD.ANK * s + (u * sn + v * cs) * s; j ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); };
    if (o.carry && o.behind) { g.save(); g.translate(o.carry[0], o.carry[1]); g.scale(S * .82, S * .82); P.drawP(g, bundle); g.restore(); }
    arm(J.arm[0]); leg(J.leg[0]);
    g.fillStyle = pat(g, 'body', M); leg(J.leg[1]);
    // tunic: shoulders → belt → a skirt to mid-calf that hangs with gravity (turns with 30 % of the lean)
    g.fillStyle = pat(g, 'robe', M);
    const ha = F.ang * .3, hc = Math.cos(ha), hs = Math.sin(ha), W0 = Pt(0, 4), sw = F.sway || 0;
    const hem = (a, b) => { const u = f * a * s, v = -(b - 4) * s; return [W0[0] + u * hc - v * hs - f * sw * s * clamp(-b / 50), W0[1] + u * hs + v * hc]; };
    const poly = pts => { g.beginPath(); pts.forEach((p, i) => { const q = p.length === 3 ? hem(p[0], p[1]) : Pt(p[0], p[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fill(); };
    poly([[-14, 64], [11, 66], [18, 58], [18, 40], [16, 18], [14, 2], [-14, 2], [-17, 20], [-18, 44], [-17, 58]]);
    const kneeling = F.kneel && (F.kneel[0] || F.kneel[1]);
    poly(kneeling ? [[14, 6], [24, -12, 1], [30, -30, 1], [-30, -30, 1], [-22, -10, 1], [-16, 6]] : [[14, 6], [17, -22, 1], [23, -62, 1], [-24, -64, 1], [-19, -22, 1], [-16, 6]]);
    // neck, head: profile with a short beard; a head cloth over the crown falling to the shoulder, a cord round it
    const tilt = F.ang + (F.tilt || 0), N = Pt(3, 64), hu = [Math.sin(tilt), -Math.cos(tilt)], hf = [f * Math.cos(tilt), f * Math.sin(tilt)];
    g.fillStyle = pat(g, 'body', M); cap(g, N, [N[0] + hu[0] * 11 * s, N[1] + hu[1] * 11 * s], 5.6 * s, 5.6 * s);
    const Hc = [N[0] + hu[0] * 22 * s + hf[0] * 1.5 * s, N[1] + hu[1] * 22 * s + hf[1] * 1.5 * s];
    const HT = ([u, v]) => [Hc[0] + (hf[0] * u - hu[0] * v) * s, Hc[1] + (hf[1] * u - hu[1] * v) * s];
    const fillP = pts => { g.beginPath(); pts.forEach((p, i) => { const q = HT(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fill(); };
    fillP([[0, -16], [7, -14], [11, -9], [13, -4], [13.6, -1], [18, 3], [14, 5], [14.5, 8], [13, 10], [13.5, 12.5], [11, 17], [6, 22.5], [1, 21], [-5, 15], [-11, 8], [-13, 0], [-12, -9], [-7, -14]]);   // face + beard
    g.fillStyle = pat(g, 'robe', M);
    fillP([[-15, 6], [-16, -6], [-12, -15], [-4, -20], [6, -20], [13, -15], [15, -9], [12, -8], [8, -12], [0, -12], [-6, -6], [-8, 4], [-10, 14], [-16, 30], [-24, 34], [-22, 20]]);   // head cloth to the shoulder
    // carry: the bundle in front (between body and near arm)
    if (o.carry && !o.behind) { g.save(); g.translate(o.carry[0], o.carry[1]); g.scale(S * .82, S * .82); P.drawP(g, bundle); g.restore(); }
    g.fillStyle = pat(g, 'body', M); arm(J.arm[1]);
    // cut lace: the belt line, a row of holes round the hem, the cord of the head cloth (holes move with the body)
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,.85)';
    for (let i = 0; i < 5; i++) { const q = kneeling ? hem(-20 + i * 10, -24) : hem(-18 + i * 9, -55); g.beginPath(); g.arc(q[0], q[1], 1.8 * s, 0, TAU); g.fill(); }
    for (let i = 0; i < 4; i++) { const q = Pt(-11 + i * 7.5, 8); g.beginPath(); g.arc(q[0], q[1], 1.4 * s, 0, TAU); g.fill(); }
    for (let i = 0; i < 3; i++) { const q = HT([-6 + i * 6, -13.5]); g.beginPath(); g.arc(q[0], q[1], 1.2 * s, 0, TAU); g.fill(); }
    g.restore();
    rivets.push(J.arm[1].sh, J.arm[1].el, J.leg[1].hp, J.leg[1].kn);
    return J;
  }
  function drawOx(g, o, M) {
    const legs = oxLegs({ ...o, bob: 1.5 * Math.cos(TAU * 2 * o.ph) }), gy = gyAt(o.x + 80);
    const body = [o.x, gy + o.jolt * .2 - 1.5 * Math.cos(TAU * 2 * o.ph)];
    const legDraw = L => { const l1 = L.front ? OX.len.fu : OX.len.hu, l2 = L.front ? OX.len.fl : OX.len.hl, ank = [L.foot[0], L.foot[1] - 9];
      const [kn, an] = ik2(L.hip, ank, l1, l2, L.front ? -1 : 1);
      cap(g, L.hip, kn, L.front ? 12 : 14, 7.5); cap(g, kn, an, 7.5, 5.5);
      g.beginPath(); g.moveTo(an[0] - 6, an[1] - 2); g.lineTo(an[0] + 7, an[1] - 2); g.lineTo(an[0] + 8, L.foot[1]); g.lineTo(an[0] - 7, L.foot[1]); g.closePath(); g.fill(); return [kn, an]; };
    g.fillStyle = pat(g, 'oxFar', M); for (const L of legs.filter(l => l.far)) legDraw(L);
    // tail: hangs from the rump, swishes slowly
    const tb = [body[0] - 18, body[1] - 104], sw = .22 * Math.sin(Pilot.lerp(0, 1, 1) * 0 + (o.t || 0) * 1.7);
    g.fillStyle = pat(g, 'ox', M); g.save(); g.translate(tb[0], tb[1]); g.rotate(.12 + sw); g.beginPath(); g.moveTo(-3, 0); g.quadraticCurveTo(-10, 40, -6, 78); g.lineTo(2, 78); g.quadraticCurveTo(-2, 40, 3, 0); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(-2, 84, 5, 10, 0, 0, TAU); g.fill(); g.restore();
    g.save(); g.translate(body[0], body[1]); P.drawP(g, oxBody); g.restore();
    g.fillStyle = pat(g, 'ox', M); for (const L of legs.filter(l => !l.far)) legDraw(L);
    // head on the neck: nods with the walk, lifts at the jolt, goes down to graze
    const nk = [body[0] + 172, body[1] - 112], ang = .18 + .05 * Math.sin(TAU * 2 * o.ph) * (o.walking ? 1 : 0) + o.graze * 1.0 - o.headY * .02;
    g.save(); g.translate(nk[0], nk[1]); g.rotate(ang); P.drawP(g, oxHead); g.restore();
    rivets.push(nk, [body[0] + OX.hipF[0], body[1] + OX.hipF[1]], [body[0] + OX.hipR[0], body[1] + OX.hipR[1]]);
    return { nk, ang, body };
  }
  function drawPlough(g, pg, M) {
    g.fillStyle = pat(g, 'wood', M); g.strokeStyle = g.fillStyle;
    cap(g, pg.yoke, pg.heel, 4.2, 4.6);                         // the beam from the yoke down to the share
    cap(g, pg.heel, pg.top, 4, 3.4);                            // the handle (stilt) up to his hands
    cap(g, [pg.top[0] - 3, pg.top[1] + 15], [pg.top[0] - 17, pg.top[1] + 20], 2.8, 2.6);   // the second handle (a peg on the stilt) for the far hand
    g.beginPath(); g.moveTo(pg.heel[0] - 4, pg.heel[1] - 4); g.lineTo(pg.share[0] + 22, pg.share[1] + 3); g.lineTo(pg.heel[0] - 2, pg.heel[1] + 9); g.closePath(); g.fill();   // the share
    g.beginPath(); g.ellipse(pg.yoke[0], pg.yoke[1], 16, 5, -.2, 0, TAU); g.fill();   // the yoke on the neck
  }

  // ---------------------------------------------------------------- the seed hand (Q7)
  // A human hand seen from the back, fingers down: a broad palm with the middle, ring and little fingers folded under it,
  // a jointed index finger (three tapering pieces) and thumb (two) that meet in a pinch, the wrist, a forearm and a wide sleeve
  // that leaves the cloth at the top right. Rivets on every joint. Hand frame: the wrist at (0, 0), fingers toward +y.
  const HD = '#20120a';
  const segPiece = (L, w0, w1, seed, tip) => P.piece([-w0 * .7, -w0 * .7, L + w1 * .7, w0 * .7], 3, g => {
    g.fillStyle = HD; g.beginPath(); g.moveTo(0, -w0 / 2); g.quadraticCurveTo(L * .5, -w0 * .55, L, -w1 / 2); g.arc(L, 0, w1 / 2, -Math.PI / 2, Math.PI / 2);
    g.quadraticCurveTo(L * .5, w0 * .55, 0, w0 / 2); g.arc(0, 0, w0 / 2, Math.PI / 2, Math.PI * 1.5); g.fill();
    if (tip) P.cutLine(g, 1.1, q => { q.moveTo(L - w1 * .1, -w1 * .3); q.quadraticCurveTo(L + w1 * .25, 0, L - w1 * .1, w1 * .3); });   // the nail
    else P.cutLine(g, 1, q => { q.moveTo(L * .82, -w1 * .32); q.lineTo(L * .82, w1 * .32); });                                                          // the crease at the next joint
    P.ink(g, 1.1, q => { q.moveTo(0, -w0 / 2); q.quadraticCurveTo(L * .5, -w0 * .55, L, -w1 / 2); q.arc(L, 0, w1 / 2, -Math.PI / 2, Math.PI / 2); q.quadraticCurveTo(L * .5, w0 * .55, 0, w0 / 2); }, '#090402');
  }, seed);
  const IDX = { base: [-21, 74], a0: Math.PI / 2 - .05, lens: [30, 20, 16], bends: [.36, .62, .5], segs: [] };
  const THB = { base: [-37, 34], a0: Math.PI / 2 + .62, lens: [31, 23], bends: [-.5, -.6], segs: [] };
  IDX.segs = [[30, 16, 14], [20, 14, 12.4], [16, 12.4, 11]].map(([L, a, b], k) => segPiece(L, a, b, 71 + k, k === 2));
  THB.segs = [[31, 19, 16], [23, 16, 13]].map(([L, a, b], k) => segPiece(L, a, b, 75 + k, k === 1));
  const palmP = P.carve({ box: [-46, -12, 50, 112], res: 3, dye: HD, seed: 77, rim: 0, outline: 1.5,
    shape: g => { g.moveTo(-25, -4); g.lineTo(25, -4); g.quadraticCurveTo(38, 30, 42, 66);
      // the three folded fingers: knuckle bumps under the palm (little, ring, middle)
      g.quadraticCurveTo(46, 84, 36, 96); g.quadraticCurveTo(28, 102, 22, 94); g.quadraticCurveTo(18, 104, 9, 104); g.quadraticCurveTo(1, 104, -1, 96);
      g.quadraticCurveTo(-5, 106, -14, 104); g.quadraticCurveTo(-22, 100, -24, 82); g.quadraticCurveTo(-36, 76, -40, 58); g.quadraticCurveTo(-38, 26, -25, -4); g.closePath(); },
    detail: g => { P.cutLine(g, 1.2, q => { q.moveTo(22, 80); q.quadraticCurveTo(24, 88, 22, 94); q.moveTo(-1, 84); q.quadraticCurveTo(0, 90, -1, 96); q.moveTo(26, 30); q.quadraticCurveTo(14, 44, 8, 62); q.moveTo(8, 26); q.quadraticCurveTo(0, 44, -6, 62); });
      P.dots(g, [[30, 70], [10, 72], [-10, 72]], 1.5); P.ink(g, 1.3, q => { q.moveTo(-24, 8); q.quadraticCurveTo(0, 12, 26, 8); }); } });
  const foreP = P.carve({ box: [-12, -34, 166, 38], res: 2.5, dye: HD, seed: 79, rim: 0, outline: 1.5, shape: [[-6, -24], [50, -27], [110, -30], [162, -32], [162, 34], [110, 30], [50, 26], [-6, 23]],
    detail: g => P.dots(g, [[40, 0], [80, -2], [120, -3]], 1.5) });
  const sleeveP = P.carve({ box: [-12, -52, 780, 64], res: 1.3, dye: '#24150b', seed: 81, rim: 0, outline: 1.6,
    shape: [[0, -36], [180, -40], [480, -46], [776, -52], [776, 62], [480, 56], [180, 48], [0, 42]],
    detail: g => { P.cutLine(g, 1.5, q => { for (const [x0, x1, y] of [[60, 420, -10], [140, 600, 14], [260, 760, 32]]) { q.moveTo(x0, y); q.quadraticCurveTo((x0 + x1) / 2, y + 6, x1, y + 2); } });
      P.dots(g, Array.from({ length: 6 }, (_, i) => [16, -28 + i * 13]), 1.7); P.ink(g, 2, q => { q.moveTo(8, -36); q.lineTo(8, 42); }); } });
  const ARM = { ang: -1.08, len: 156 };   // the forearm leaves the wrist up and to the right; the sleeve carries on off the cloth
  const chain = (F, c, rest = .05) => { let a = F.a0, p = F.base.slice(); const J = [];
    F.lens.forEach((L, k) => { a += c * F.bends[k] + (1 - c) * rest * Math.sign(F.bends[k]); J.push([p, a]); p = [p[0] + Math.cos(a) * L, p[1] + Math.sin(a) * L]; }); return { J, tip: p }; };
  // the pinch: the index and thumb curls whose tips come closest (searched once)
  let PINCH = { c: .5, th: .5, d: 1e9 };
  for (let c = 0; c <= 1.0001; c += .02) for (let th = 0; th <= 1.0001; th += .02) { const a = chain(IDX, c).tip, b = chain(THB, th).tip, d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d < PINCH.d) PINCH = { c, th, d }; }
  const HS = 1.6;                                             // the hand's size on the cloth
  const SEED = { x: 540, y: 1083 };
  function drawSowerHand(q, pose) {
    q.save(); q.rotate(ARM.ang); P.drawP(q, foreP); q.translate(ARM.len - 6, 2); q.rotate(.05); P.drawP(q, sleeveP); q.restore();
    q.save(); q.rotate(pose.w);
    const ti = chain(THB, pose.th), ii = chain(IDX, pose.c);
    P.drawP(q, palmP);
    ii.J.forEach(([p, a], k) => { q.save(); q.translate(p[0], p[1]); q.rotate(a); P.drawP(q, IDX.segs[k]); q.restore(); });
    ti.J.forEach(([p, a], k) => { q.save(); q.translate(p[0], p[1]); q.rotate(a); P.drawP(q, THB.segs[k]); q.restore(); });
    for (const [p] of [...ti.J, ...ii.J]) P.rivet(q, p[0], p[1], 2.4);
    P.rivet(q, 0, 0, 3); q.globalCompositeOperation = 'source-over';
    q.restore();
  }
  // hand frame → cloth: origin (the wrist) + rotation rot + scale HS
  const handToW = (h, p) => { const c = Math.cos(h.rot), s = Math.sin(h.rot), K = HS * P.dist(h.dist || 0).scale, pw = [Math.cos(h.w) * p[0] - Math.sin(h.w) * p[1], Math.sin(h.w) * p[0] + Math.cos(h.w) * p[1]];
    return [h.origin[0] + (pw[0] * c - pw[1] * s) * K, h.origin[1] + (pw[0] * s + pw[1] * c) * K]; };
  function handAt(t) {
    const rel = clamp((t - T.release[0]) / (T.release[1] - T.release[0]));
    const c = lerp(PINCH.c, .12, ease2(rel)), th = lerp(PINCH.th, .2, ease2(rel));
    const tr = P.tremor(t, 7, .7);
    const k1 = ease2((t - T.handIn[0]) / (T.handIn[1] - T.handIn[0])), k2 = eio((t - T.handDown[0]) / (T.handDown[1] - T.handDown[0]));
    const w = .14 * (1 - k1) - .08 * k2 * (1 - rel) + .1 * rel;                    // the wrist follows through, settles
    const rot = -.06 + .05 * (1 - k1) + tr.r * .4;
    const h0 = { origin: [0, 0], rot, w, c, th };
    // where the pinch (the seed) or, after the release, the index tip should be
    const pinch = mixv(chain(IDX, c).tip, chain(THB, th).tip, .5), idx = chain(IDX, c).tip;
    const pathP = [[1190, 40], [650, 850], [SEED.x - 2, SEED.y - 16]];   // slides in from beyond the top-right corner, pressed on the cloth
    let target = mixv(mixv(pathP[0], pathP[1], k1), pathP[2], k2);
    // after the release the index tip goes to the soil just right of the seed and taps it twice, then rests there
    const tap = clamp((t - T.tap[0]) / (T.tap[1] - T.tap[0])), tapY = tap > 0 && tap < 1 ? -16 * Math.abs(Math.sin(tap * Math.PI * 2)) : 0;
    const soil = [SEED.x + 16, fieldTop(SEED.x + 16) + 1 + tapY], ok = ss(T.release[1] - .05, T.tap[0] + .05, t);
    const lo = P.liftOff(t, T.handOff[0], T.handOff[1] - T.handOff[0]);
    const refL = mixv(pinch, idx, ok), aim = mixv(target, soil, ok);
    const pw = handToW(h0, refL);
    const origin = [aim[0] - pw[0] + tr.x + lo * 120, aim[1] - pw[1] + tr.y - lo * 230];
    const press = t < T.handIn[0] + 1 ? P.press(t, T.handIn[0] - .05, 1.0) : 0;
    const h = { origin, rot, w, c, th, dist: lo * .9, rel };
    h.pinW = handToW(h, pinch);
    return h;
  }
  function seedPos(t) {   // in the pinch, then it drops into the furrow
    if (t < T.release[0] + .05) return handAt(t).pinW;
    const p0 = handAt(T.release[0] + .05).pinW, k = clamp((t - T.release[0] - .05) / .26);
    return [lerp(p0[0], SEED.x, k), lerp(p0[1], SEED.y, k * k)];
  }

  // ---------------------------------------------------------------- frame passes
  const glowSprite = (() => { const c = Pilot.canvas(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,236,170,1)'); gr.addColorStop(.18, 'rgba(255,196,96,.75)'); gr.addColorStop(.5, 'rgba(240,150,50,.22)'); gr.addColorStop(1, 'rgba(220,120,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c; })();
  function glow(ctx, x, y, r, a) { if (a <= .002) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(glowSprite, x - r, y - r, r * 2, r * 2); ctx.restore(); }
  // the toy theatre round the cloth (visible when the camera stands back): tent cloth in the dark, a gilt frame, the footlights
  const FOOT = [100, 245, 390, 540, 690, 835, 980];
  function theatre(ctx, M, t, I, fk = 1) {
    const p0 = M.transformPoint(new DOMPoint(0, 0)), p1 = M.transformPoint(new DOMPoint(CW, CH)), k = M.a;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over';
    // the dark of the tent round the frame: deep brown, folds of goat-hair cloth lit faintly by the lamp
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y); ctx.fillStyle = '#0d0805'; ctx.fill('evenodd');
    const sp = ctx.createRadialGradient((p0.x + p1.x) / 2, p0.y + (p1.y - p0.y) * .45, 80, (p0.x + p1.x) / 2, p0.y + (p1.y - p0.y) * .45, (p1.y - p0.y) * 1.05);
    sp.addColorStop(0, `rgba(150,92,44,${.2 * I})`); sp.addColorStop(1, 'rgba(150,92,44,0)'); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = sp; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 9; i++) { const x = (i + .5) / 9 * W, w = 30 + 20 * Math.sin(i * 2.1); const gg = ctx.createLinearGradient(x - w, 0, x + w, 0); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(.5, `rgba(80,48,24,${.10 * I})`); gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(p0.x - 2, p0.y - 2, p1.x - p0.x + 4, p1.y - p0.y + 4); ctx.fill('evenodd'); }
    // the frame: lacquered wood, a gilt line, studs along the top
    const bw = 26 * k;
    ctx.fillStyle = '#2a1007'; ctx.beginPath(); ctx.rect(p0.x - bw, p0.y - bw * 1.6, p1.x - p0.x + bw * 2, p1.y - p0.y + bw * 1.6 + bw * .9); ctx.rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y); ctx.fill('evenodd');
    ctx.strokeStyle = `rgba(206,158,82,${.55 + .2 * I})`; ctx.lineWidth = Math.max(1, 1.8 * k); ctx.strokeRect(p0.x - bw * .55, p0.y - bw * 1.15, p1.x - p0.x + bw * 1.1, p1.y - p0.y + bw * 1.6);
    ctx.fillStyle = `rgba(206,158,82,${.5 + .2 * I})`; for (let i = 0; i < 11; i++) { const x = p0.x + (p1.x - p0.x) * (i + .5) / 11; ctx.beginPath(); ctx.arc(x, p0.y - bw * .7, 3.2 * k, 0, TAU); ctx.fill(); }
    // the ledge in front with clay oil lamps (footlights): small live flames, their warmth on the ledge and the cloth's foot
    const ly = p1.y + bw * .1;
    ctx.fillStyle = '#1a0b05'; ctx.fillRect(p0.x - bw * 1.4, ly, p1.x - p0.x + bw * 2.8, 26 * k);
    if (fk > .001) for (const [i, fx] of FOOT.entries()) { const x = p0.x + fx * k, fl = .85 + .15 * noise(t * 6 + i * 3.1, i) + .05 * Math.sin(t * 13 + i * 2);
      glow(ctx, x + 18 * k, ly - 22 * k, 150 * k * fl, .5 * I * fk);
      ctx.fillStyle = '#2d170a'; ctx.beginPath(); ctx.ellipse(x, ly + 3 * k, 26 * k, 11 * k, 0, 0, Math.PI); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, ly + 2 * k, 26 * k, 5 * k, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 14 * k, ly - 2 * k); ctx.quadraticCurveTo(x + 24 * k, ly - 6 * k, x + 30 * k, ly - 4 * k); ctx.lineTo(x + 26 * k, ly + 4 * k); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.globalAlpha = fk; ctx.translate(x + 28 * k, ly - 5 * k); ctx.scale(k * 1.7, k * 1.7); const sw = 1.6 * Math.sin(t * 5.3 + i) + 1.2 * noise(t * 3 + i, 5);
      const fg2 = ctx.createLinearGradient(0, 0, 0, -20); fg2.addColorStop(0, 'rgba(255,150,50,.95)'); fg2.addColorStop(.5, 'rgba(255,210,120,.97)'); fg2.addColorStop(1, 'rgba(255,246,220,.95)'); ctx.fillStyle = fg2;
      ctx.beginPath(); ctx.moveTo(-3.8, 0); ctx.quadraticCurveTo(-5, -9, sw, -19 * fl); ctx.quadraticCurveTo(5, -9, 3.8, 0); ctx.closePath(); ctx.fill(); ctx.restore();
      glow(ctx, x + 28 * k, ly - 18 * k, 34 * k * fl, .8 * I * fk); }
    ctx.restore();
  }

  // the chest under the soil: the hole is bare cloth (light) round the chest; the lump slides aside and back
  let holeK = 0, lumpOff = 0;
  function treasureT(g, t, M) {
    const open = ss(T.dig[0] + .1, T.dig[1], t) * (1 - ss(T.cover[0] + .1, T.cover[1] - .05, t));
    holeK = open; lumpOff = open;
    if (open > .01) {   // the cavity: leather slid away (bare cloth) in an uneven pit, the chest sitting in it
      g.save(); g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(255,248,236,${.92 * open})`;
      g.beginPath(); g.moveTo(CHEST.x - 50, fieldTop(CHEST.x - 50) + 1); g.quadraticCurveTo(CHEST.x - 54, CHEST.y + 30, CHEST.x, CHEST.y + 32); g.quadraticCurveTo(CHEST.x + 54, CHEST.y + 30, CHEST.x + 50, fieldTop(CHEST.x + 50) + 1); g.closePath(); g.fill(); g.restore();
      g.globalCompositeOperation = 'multiply'; g.save(); g.translate(CHEST.x, CHEST.y); P.drawP(g, chest); g.restore();
    }
    // the lump of soil: over the chest, or pushed aside onto a little pile
    const lx = lerp(CHEST.x, CHEST.x + 74, ease2(lumpOff)), ly = lerp(CHEST.y - 14, fieldTop(CHEST.x + 74) - 10, ease2(lumpOff));
    g.save(); g.globalCompositeOperation = 'multiply'; g.translate(lx, ly); g.rotate(.3 * ease2(lumpOff)); g.globalAlpha = open > .01 ? 1 : 0; P.drawP(g, lump); g.restore();
  }

  // a control rod just off the cloth: a soft wide shadow with a faint core (it must never read as a staff in the hand)
  function softRod(g, a, b) { g.save(); g.lineCap = 'round';
    g.strokeStyle = 'rgba(70,46,26,.07)'; g.lineWidth = 16; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    g.strokeStyle = 'rgba(60,38,20,.09)'; g.lineWidth = 6; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.restore(); }
  // ---------------------------------------------------------------- one frame of the play
  function play(ctx, t, v, o = {}) {
    const M = Mof(v); rivets.length = 0;
    const lampI = o.I ?? 1;
    // figures for this frame (drawn into FIG, then multiplied into T)
    const g = P.beginT(M);
    const figs = () => {
      if (!o.figs) return;
      fg.setTransform(1, 0, 0, 1, 0, 0); fg.globalCompositeOperation = 'source-over'; fg.globalAlpha = 1; fg.clearRect(0, 0, W, H); fg.setTransform(M);
      const parts = o.figs(fg, M);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(FIG, 0, 0); g.restore();
      // rivets on the near joints (pale thread knots) and the control rods just off the cloth
      g.save(); g.setTransform(M); for (const r of rivets) P.rivet(g, r[0], r[1], 2.6); g.globalCompositeOperation = 'multiply';
      if (parts && parts.rods) for (const [a, b] of parts.rods) softRod(g, a, b); g.restore();
    };
    buildTInto(g, t, v, M, { sil: o.sil, treasure: o.treasure });
    figs();
    if (o.hand) o.hand(g, M);
    // light: lamp × cloth × T, the warm bloom; then the accent glows (seed, gold) on top; the theatre; the grade
    const lamp = { I: lampI, color: P.warm(o.warm ?? .3), x: LAMP.x, y: LAMP.y, R: 1600, lobe: 480, hot: 165, base: .045, gain: .96, wobble: [6, 5] };
    const lit = P.lamp(ctx, t, M, lamp);
    if (lit) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(P.Tc, 0, 0); ctx.globalCompositeOperation = 'source-over'; P.bloom(ctx, .55); }
    if (o.glows) o.glows(ctx, M);
    theatre(ctx, M, t, lampI, 1 - ss(.86, .99, v.s));   // always: the frame and the ledge come into view as the camera stands back (no pop)
    P.post(ctx, t, { grain: .045 });
  }
  function buildTInto(g, t, v, M, o) {
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .26; g.globalCompositeOperation = 'multiply'; g.filter = `blur(${(9 * v.s).toFixed(1)}px)`; g.setTransform(M); P.drawP(g, hills); g.restore(); g.filter = 'none';
    g.setTransform(M); g.globalCompositeOperation = 'multiply';
    if (o.sil) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(o.sil, 0, 0, W, H); g.restore(); }
    P.drawP(g, field);
    for (const tf of TUFTS) { const sw = .05 * Math.sin(t * 1.1 + tf.x * .03) + .02 * Math.sin(t * 2.3 + tf.x); g.save(); g.translate(tf.x, fieldTop(tf.x) + 3); g.rotate(sw); P.drawP(g, tf.p); g.restore(); }
    if (o.treasure) treasureT(g, t, M);
  }

  // ---------------------------------------------------------------- the first play (N17 · Q7 · Q8) and the develop (N18)
  function seedHand(g, M, t) {
    if (t < T.handIn[0] - .1 || t > T.handOff[1] + .1) return;
    const h = handAt(t);
    const rig = { box: [-60, -900, 600, 130], draw: q => drawSowerHand(q, h) };
    g.save(); g.setTransform(M); g.globalCompositeOperation = 'multiply';
    P.place(g, rig, { x: h.origin[0], y: h.origin[1], rot: h.rot, scale: HS, dist: h.dist, alpha: ss(T.handIn[0] - .1, T.handIn[0] + .45, t) * (1 - ss(T.handOff[1] - .35, T.handOff[1], t)) });
    g.restore();
  }
  // the seedling: a real shoot in carved leather — it comes up hooked, straightens, the two seed leaves open, the true leaves come
  // between them, and the stem curves as it rises; it gives way to the young tree (tree3d-mustard) growing out of the same place
  function seedling(g, M, t) {
    if (t < T.seed[0] || TR.G(t) > TR.forkS) return;
    const e1 = ss(T.seed[0], T.seed[0] + .7, t), e2 = ss(T.seed[0] + .45, T.seed[0] + 1.0, t), e3 = ss(T.seed[0] + .75, T.seed[0] + 1.25, t), e4 = ss(T.seed[0] + 1.05, T.seed[1], t), e5 = ss(T.seed[0] + .8, T.seed[1] + .3, t);
    const fade = 1;
    const L = 10 + 58 * e1 + 66 * e5, hook = 2.5 * (1 - e2), sway = .05 * Math.sin(t * 1.3);
    // the stem as points along its length; the hook bends the top over, then the stem stands with a soft S
    const N = 24, pts = []; let x = SEED.x, y = fieldTop(SEED.x) + 3, a = -Math.PI / 2;
    for (let i = 0; i <= N; i++) { const u = i / N; pts.push([x, y, a]); const da = (.22 * Math.cos(u * Math.PI * 1.4) + sway) / N * 2.2 + hook * ss(.5, 1, u) / N * 2.2; a += da; x += Math.cos(a) * L / N; y += Math.sin(a) * L / N; }
    const w0 = 3.6 + 2.6 * e5, w1 = 2.2 + 1.0 * e5; let top = pts[N];
    // the young tree's leader (3D) — when its tip stands above the seedling, the leaves go with it
    const G = TR.G(t); let ride = 0;
    if (G > 0) { const v = view(t), tp = TR.project(TR.trunkTip(G), v), Mi = M.inverse(), q = Mi.transformPoint(new DOMPoint(tp[0], tp[1]));
      ride = ss(TR.forkS * .26, TR.forkS * .42, G); top = [lerp(top[0], q.x, ride), lerp(top[1], q.y, ride), lerp(top[2], -Math.PI / 2 + .04 * Math.sin(t * 1.1), ride)]; }
    const lf = 1 - ss(TR.forkS * .55, TR.forkS * .95, G);   // the leaves give way as the tree forks into limbs
    g.save(); g.setTransform(M); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 1 - ss(TR.forkS * .2, TR.forkS * .4, G); g.fillStyle = '#24150a';
    g.beginPath(); pts.forEach(([px, py, pa], i) => { const w = lerp(w0, w1, i / N) / 2, nx = -Math.sin(pa), ny = Math.cos(pa); i ? g.lineTo(px + nx * w, py + ny * w) : g.moveTo(px + nx * w, py + ny * w); });
    for (let i = N; i >= 0; i--) { const [px, py, pa] = pts[i], w = lerp(w0, w1, i / N) / 2, nx = -Math.sin(pa), ny = Math.cos(pa); g.lineTo(px - nx * w, py - ny * w); } g.closePath(); g.fill();
    // a leaf: two halves with a hair of light between them (the midrib), rounded (seed leaf) or toothed (true leaf)
    const leaf = (len, wid, ang, toothed) => { if (len < 1) return; g.save(); g.translate(top[0], top[1]); g.rotate(ang);
      for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(0, sd * .5); const n = toothed ? 7 : 1;
        if (!toothed) { g.bezierCurveTo(len * .3, sd * wid * 1.1, len * 1.05, sd * wid * .9, len, sd * .5); }
        else for (let k = 1; k <= n; k++) { const u = k / n, wv = wid * Math.sin(Math.PI * Math.min(1, u * 1.05)) * (1 - .25 * u); g.quadraticCurveTo(len * (u - .5 / n), sd * (wv + wid * .18), len * u, sd * (wv * .78 + .5)); }
        g.lineTo(0, sd * .5); g.closePath(); g.fill(); }
      g.restore(); };
    g.globalAlpha = lf;
    const ta = top[2], op = e3 * 1.12, cs = 15 + 12 * e3 + 7 * e5;
    leaf(cs, cs * .48, ta - .12 - op, false); leaf(cs, cs * .48, ta + .12 + op, false);                      // the seed leaves open
    if (e4 > 0) { const ts = 38 * e4; leaf(ts, ts * .32, ta - .42 * e4, true); leaf(ts * .9, ts * .3, ta + .5 * e4, true); }   // the true leaves
    g.restore();
  }
  function firstPlay(ctx, t, v, sil, extra = {}) {
    const I = (1 + .55 * ss(T.surge[0], T.surge[1], t)) * P.flicker(t, { amt: .03, hz: 5, seed: 2.2 });
    play(ctx, t, v, { I, warm: .3, sil, hand: (g, M) => { seedling(g, M, t); seedHand(g, M, t); },
      glows: (c, M) => {   // the seed: the one thing that glows (gold), until the shoot takes its light
        if (t < T.handIn[0]) return;
        const sp = seedPos(t), q = M.transformPoint(new DOMPoint(sp[0], sp[1])), fade = ss(T.handIn[0], T.handIn[0] + .6, t) * (1 - ss(T.seedFade[0], T.seedFade[1], t));
        const pulse = .85 + .15 * Math.sin(t * 2.4);
        glow(c, q.x, q.y, (16 + 22 * v.s) * pulse, .95 * fade); glow(c, q.x, q.y, 5 * v.s, fade);
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(255,236,180,${fade})`; c.beginPath(); c.ellipse(q.x, q.y, 1.6 * v.s, 1.2 * v.s, .4, 0, TAU); c.fill(); c.restore();
      } });
    // before the iris opens: the dark curtain with the lamp seen through a small round opening
    const ik = eio((t - T.iris[0]) / (T.iris[1] - T.iris[0]));
    if (ik < 1) { const M = Mof(v), c = M.transformPoint(new DOMPoint(LAMP.x, LAMP.y)), r = lerp(46, 1500, ik);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(c.x, c.y, r, 0, TAU, true);
      const cg = ctx.createRadialGradient(c.x, c.y, r, c.x, c.y, r + 900); cg.addColorStop(0, '#6a3c18'); cg.addColorStop(.35, '#3a2210'); cg.addColorStop(1, '#1c0f07'); ctx.fillStyle = cg; ctx.fill(); ctx.restore();
      // the iris edge catches a little light
      ctx.save(); ctx.strokeStyle = `rgba(230,170,100,${.35 * (1 - ik)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, TAU); ctx.stroke(); ctx.restore(); }
  }
  const DEVC = Pilot.canvas(W, H), devg = DEVC.getContext('2d'), MASK = Pilot.canvas(W >> 2, H >> 2), mg = MASK.getContext('2d');
  function develop(ctx, t) {
    // the cloth locked to the plane of the moving 3D camera; the 3D world (with the tree still in leather) comes up behind it
    const k = ss(T.dev[0] + .15, T.dev[1] - .05, t);
    if (k < 1) firstPlay(ctx, t, TR.clothView(t), TR.sil(t, null));
    if (k > 0) { const lit = TR.lit(t, null); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.drawImage(lit, 0, 0, W, H); ctx.restore(); }
  }
  // a fixed noise field for the develop front (built once: seek-safe, no shimmer)
  const NOISE = (() => { const w = W >> 2, h = H >> 2, a = new Float32Array(w * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) a[y * w + x] = Pilot.fbm(x * .009 + 3, y * .009 + 7, 3); return a; })();

  // ---------------------------------------------------------------- the second play (Q9 · N19)
  function secondPlay(ctx, t, v) {
    const warm = lerp(.32, .82, ss(T.warm[0], T.warm[1], t)), I = (1 + .18 * ss(T.warm[0], T.warm[1], t)) * P.flicker(t, { amt: .03, hz: 5, seed: 4.1 });
    play(ctx, t, v, { I, warm, treasure: true,
      figs: (g, M) => {
        const rods = [];
        const o = oxAt(t); o.t = t;
        const man = manAt(t), buy = buyerAt(t);
        drawOx(g, o, M);
        drawPlough(g, man.pg, M);
        if (buy) drawFig(g, buy.F, M, buy.flip, { carry: buy.carry, behind: buy.behind }, rods);
        // the man (hidden while he is in the house)
        if (!man.F.hide) drawFig(g, man.F, M, man.flip, { carry: man.F.carry }, rods);
        // the house over everything near it: he passes behind it, seen only in the doorway
        g.save(); g.setTransform(M); P.drawP(g, house); g.restore();
        return { rods };
      },
      glows: (c, M) => {
        // the hidden treasure: a faint glint under the soil before it is found; the gold through the lid's gap; then a pinhole
        const q = M.transformPoint(new DOMPoint(CHEST.x, CHEST.y - 9));
        const pre = ss(T.q9in[0] + .6, T.q9in[0] + 1.8, t) * (1 - ss(T.dig[0], T.dig[0] + .3, t)) * (.6 + .4 * Math.sin(t * 2.1));
        const gold = ss(T.gold[0], T.gold[1], t) * (1 - ss(T.cover[0] + .2, T.cover[1], t));
        const pin = ss(T.cover[1] - .3, T.cover[1] + .3, t);
        const det = ss(T.detail[0], T.detail[1], t) * (1 - ss(T.detailBack[1] - 1, T.detailBack[1], t) * .4);
        glow(c, q.x, q.y + 4 * v.s, 26 * v.s, .32 * pre);
        if (gold > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen';
          const gw = c.createLinearGradient(q.x - 36 * v.s, 0, q.x + 36 * v.s, 0); gw.addColorStop(0, 'rgba(255,190,70,0)'); gw.addColorStop(.5, `rgba(255,226,140,${gold})`); gw.addColorStop(1, 'rgba(255,190,70,0)');
          c.fillStyle = gw; c.fillRect(q.x - 36 * v.s, q.y - 1.6 * v.s, 72 * v.s, 3.2 * v.s); c.restore();
          glow(c, q.x, q.y, 80 * v.s * (.9 + .1 * Math.sin(t * 3)), .85 * gold); glow(c, q.x, q.y - 30 * v.s, 120 * v.s, .35 * gold); }
        if (pin > 0) { const pq = M.transformPoint(new DOMPoint(CHEST.x + 6, CHEST.y - 22)), pu = .8 + .2 * Math.sin(t * 2.6);
          glow(c, pq.x, pq.y, (12 + 30 * det) * v.s * pu, (.6 + .4 * det) * pin); glow(c, pq.x, pq.y, 3.5 * v.s, pin);
          if (det > .01) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen'; c.translate(pq.x, pq.y);
            for (let r = 0; r < 7; r++) { const an = -Math.PI / 2 + (r - 3) * .22 + .05 * Math.sin(t * .7 + r), L = (60 + 30 * Math.sin(t * 1.1 + r * 1.7)) * v.s * det;
              const gr = c.createLinearGradient(0, 0, Math.cos(an) * L, Math.sin(an) * L); gr.addColorStop(0, `rgba(255,214,120,${.22 * det * pin})`); gr.addColorStop(1, 'rgba(255,200,100,0)');
              c.strokeStyle = gr; c.lineWidth = 2.2 * v.s; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(an) * L, Math.sin(an) * L); c.stroke(); } c.restore(); }
          c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(255,236,170,${pin})`; c.beginPath(); c.arc(pq.x, pq.y, 1.5 * v.s, 0, TAU); c.fill(); c.restore(); }
      } });
  }
  function drawFig(g, F, M, flip, o, rods) {
    // the puppeteer's turn: the figure narrows to its edge and widens mirrored (pose already in the new facing past half)
    const fxk = flip == null ? 1 : Math.max(.02, Math.abs(Math.cos(Math.PI * flip)));
    g.save();
    if (fxk < 1) { const cx = F.hip[0]; g.translate(cx, 0); g.scale(fxk, 1); g.translate(-cx, 0); }
    const J = drawHuman(g, F, M, o);
    g.restore();
    if (fxk < 1) rivets.splice(rivets.length - 4, 4);
    const nk = frameOf(F).P(0, 40); if (F.hip[0] < 200) return; rods.push([nk, [nk[0] - F.f * 30, 1300]]);
    if (F.hands[1] && J) rods.push([J.arm[1].hd, [J.arm[1].hd[0] + F.f * 40, 1300]]);
  }

  // ---------------------------------------------------------------- the module's frame
  function draw(ctx, t, B) {
    if (!T) { T = beats(B); BB = B; TR.beats(B); }
    ctx.save();
    if (t < T.dev[0]) { const v = view(t); const sil = TR.G(t) > 0 || TR.T() && t > TR.T().birds[0] - .1 ? TR.sil(t, v) : null; firstPlay(ctx, t, v, sil); }
    else if (t < T.dev[1]) develop(ctx, t);
    else if (t < T.q9in[0]) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(TR.lit(t, null), 0, 0, W, H); }
    else {
      secondPlay(ctx, t, view(t));
      const k = 1 - ss(T.q9in[0], T.q9in[1], t);   // light to light: the lit tree dissolves into the cloth
      if (k > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.drawImage(TR.lit(t, null), 0, 0, W, H); ctx.globalAlpha = 1; }
    }
    ctx.restore();
  }
  // for the page's checks: the poses of the jointed figures (no drawing)
  function posesAt(t) { if (!T) return null; const out = {};
    if (t >= T.q9in[0]) { const m = manAt(t); out.man = { J: joints(m.F), flip: m.flip }; const b = buyerAt(t); if (b) out.buyer = { J: joints(b.F), flip: b.flip }; const o = oxAt(t); out.ox = oxLegs({ ...o, bob: 0 }).map(L => { const l1 = L.front ? OX.len.fu : OX.len.hu, l2 = L.front ? OX.len.fl : OX.len.hl; const [kn, an] = ik2(L.hip, [L.foot[0], L.foot[1] - 9], l1, l2, L.front ? -1 : 1); return { hp: L.hip, kn, an }; }); }
    if (t >= T.handIn[0] && t <= T.handOff[1]) { const h = handAt(t); out.hand = { c: h.c, th: h.th, w: h.w, rot: h.rot, o: h.origin }; }
    return out; }
  return { draw, beats: () => T, view, posesAt, CHEST, SEED, LAMP, fieldTop };
}
