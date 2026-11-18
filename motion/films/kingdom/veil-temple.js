// veil-temple.js — 「kingdom」 5부 절정 2: "성전 휘장이 위로부터 아래까지" (N25e – N26b · Q14a), the film's climax.
//
// One continuous shot (after 「Birdman」, hidden joins):
//   1. the charcoal sheet of the cross scene turns like a page (material change) and an iron-gall-ink plan of the Herodian
//      temple draws itself on aged paper (Leonardo codex: brown ink, hatched wall sections, faint red-chalk construction;
//      NO letters) — the veil line between the Holy Place and the Most Holy Place is the one red line, drawn last;
//   2. the plan tilts and stands up into a lit 3D temple (the first film's 「귀환」 blueprint → 3D, after 「Titanic」): the ink
//      lines rise into walls, the colour develops outward from the sanctuary;
//   3. the camera cranes down into the court and travels through the doors into the dark Holy Place (lampstand, incense
//      haze — 「Hamlet」's fog interior) until the huge veil fills the frame;
//   4. on "위로부터 아래까지" the veil tears from the TOP down (God's act) — the film's one speed ramp, the world slows to
//      0.25× while it tears; warm white-gold light pours through the gap (bloom, haze, dust; 「Oppenheimer」, restrained);
//   5. N25f: through the tear into the empty Most Holy Place filled with light (no ark, no figure — light only);
//   6. N25g: the camera draws back out the way it came while the light flows out of the tear, across the Holy Place, out of
//      the doors onto the court, to small figures standing with their backs to us (long shadows toward the viewer);
//   7. N26: the darkness closes; the light settles into the shape of an open door (the temple doorway, and its door-shaped
//      pool on the pavement);
//   8. N26b: slow push toward the door; beyond it, faintly, part 2's ink-wash garden with its point of gold.
//
// Rules kept here: words never drawn into the art (the plan has no labels); light always on the subject's axis (the veil
// centre, the gap, the door); no person's face (all figures from behind, far, small); God never depicted (light only);
// one slow primary move per beat, the speed ramp the one big technique.
//
// API: const VT = await (await import('./veil-temple.js')).build(W, H);
//      VT.draw(ctx, t, B, { prev })  — t = FILM seconds; B = line times from script.json (Film.lines[id].at) for
//      N25c N25e L8d Q14a N25f N25g N26 N26b C5; prev(ctx, t) draws the scene before (the charcoal crosses) for the page turn.
//      Every visual time is derived from B in beats() below — when the voice retimes the lines, the picture follows.
//      Pure in t: everything (camera, tear, light, dust) is recomputed from t each frame; nothing carries between frames.
import { Film, THREE, V, col, rng, noise1 } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const sine = x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
const win = (t, a, b, fi, fo) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));

// ---------------------------------------------------------------- the one table: visual beats from the line times
export function beats(B) {
  const T = {};
  T.turn0 = B.N25e + .55; T.turn1 = T.turn0 + 1.45;          // "숨지시던 그때": the charcoal page turns
  T.draw0 = B.N25e + .9; T.draw1 = B.N25e + 3.25;            // the pen draws the plan (the red veil line last)
  T.move0 = B.N25e + 3.05;                                    // the plan stands up: the long move begins (2D → 3D join)
  T.join0 = T.move0 - .1; T.join1 = T.move0 + .5;
  T.rise0 = T.move0 + .25; T.rise1 = T.move0 + 2.7;           // ink lines rise into walls
  T.dev0 = T.move0 + .9; T.dev1 = T.move0 + 3.6;              // colour develops outward from the sanctuary
  T.tear0 = B.Q14a + 2.25;                                    // the tear starts as "위로부터" is read
  T.move1 = T.tear0 + .35;                                    // the camera comes to rest before the veil
  T.ramp = [T.tear0 + .3, T.tear0 + .8, T.tear0 + 3.5, T.tear0 + 4.3];   // speed ramp: 1× → 0.25× → 1×
  T.enter0 = B.N25f + .2; T.enter1 = B.N25f + 7.4;            // through the tear into the Most Holy Place
  T.out0 = B.N25g + .1; T.out1 = B.N25g + 8.2;                // drawing back out to the court (the move runs to N26)
  T.N26 = B.N26 + .1;                                          // from here one long slow push to the end
  T.flow0 = B.N25g + .2; T.flow1 = B.N25g + 6.8;              // the light front runs out to the people
  T.dark0 = B.N26 + .3; T.dark1 = B.N26 + 5.2;                // the darkness closes; the door of light remains
  T.push1 = B.C5 + .2;                                         // the push (from T.N26) ends just after the part title comes
  T.garden0 = B.N26b + 1.2; T.garden1 = B.N26b + 5.5;         // the ink-wash garden shows faintly in the door
  T.end = B.C5;
  return T;
}
// time warp for the speed ramp: tau(t) = ∫ rate; rate 0.25 between ramp[1] and ramp[2]
const RATE_SLOW = .25;
const SMOKE = false;   // incense ribbons before the veil (off: they read as a crack)
function makeTau(T) {
  const [a, b, c, d] = T.ramp, rate = t => 1 - (1 - RATE_SLOW) * ss(a, b, t) * (1 - ss(c, d, t));
  const t0 = a - 1, dt = 1 / 240, n = Math.ceil((d + 1 - t0) / dt), acc = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) { const tm = t0 + (i - .5) * dt; acc[i] = acc[i - 1] + rate(tm) * dt; }
  const tau = t => { if (t <= t0) return t; const f = (t - t0) / dt; if (f >= n) return t0 + acc[n] + (t - (t0 + n * dt)); const i = Math.floor(f), k = f - i; return t0 + lerp(acc[i], acc[i + 1], k); };
  tau.rate = rate; return tau;
}

// ---------------------------------------------------------------- the temple: one list of pieces = the plan and the 3D
// World metres: x across (− = left/south), z along the axis (camera comes from +z, the sanctuary door at z = 0, the veil at
// z = −25), y up. A piece = an axis-aligned block [x0,x1]×[z0,z1] from y0 to y1, its group (rise order), plan drawing order.
// Sizes after the Herodian temple (Middot, Josephus), simplified: Holy Place 10 × 20 × 20 m, Most Holy Place 10 × 10 × 20 m.
function pieces() {
  const P = [], add = (g, x0, x1, z0, z1, y1, o = {}) => P.push({ g, x0, x1, z0, z1, y0: o.y0 || 0, y1, mat: o.mat || 'stone', plan: o.plan !== false, hatch: o.hatch !== false, ord: o.ord ?? 0 });
  // outer wall of the temple mount (the porticoes' back wall), gate in the east wall
  add('outer', -56, 56, -72, -70, 13, { ord: .1 }); add('outer', -56, -54, -70, 52, 13, { ord: .14 }); add('outer', 54, 56, -70, 52, 13, { ord: .14 });
  add('outer', -56, -6, 52, 54, 13, { ord: .18 }); add('outer', 6, 56, 52, 54, 13, { ord: .18 });
  // portico roofs along the inside of the outer wall (3D only: from above they cover the colonnades)
  for (const r of [[-54, 54, -70, -65], [-54, -49, -65, 52], [49, 54, -65, 52], [-49, -6, 47, 52], [6, 49, 47, 52]]) add('outer', r[0], r[1], r[2], r[3], 11, { y0: 10, plan: false, mat: 'roof' });
  // inner court wall with its gates (east gate on the axis, north and south gates)
  add('inner', -24, 24, -46, -43, 15, { ord: .3 }); add('inner', -24, -21, -43, 8, 15, { ord: .33 }); add('inner', -24, -21, 12, 27, 15, { ord: .35 });
  add('inner', 21, 24, -43, 8, 15, { ord: .33 }); add('inner', 21, 24, 12, 27, 15, { ord: .35 });
  add('inner', -24, -8, 27, 30, 15, { ord: .37 }); add('inner', 8, 24, 27, 30, 15, { ord: .37 });
  add('inner', -8, -4, 26, 31, 19, { ord: .38 }); add('inner', 4, 8, 26, 31, 19, { ord: .38 });   // the gatehouse towers
  add('inner', -4, 4, 26, 31, 19, { y0: 13, plan: false });                                       // its lintel (overhead)
  // the low parapet before the priests' court, open on the axis; the altar of burnt offering (off the axis, to the left)
  // (the low parapet before the priests' court is left out: at eye level it read as two plain boxes beside the people)
  add('court', -13, -5, 6, 14, 5, { ord: .5 });
  // the sanctuary: the wide porch front (opening on the axis 6 × 14 m), the house behind it, the back wall
  add('sanct', -14, -3, -6, 0, 30, { ord: .4, mat: 'facade' }); add('sanct', 3, 14, -6, 0, 30, { ord: .42, mat: 'facade' });
  add('sanct', -3, 3, -6, 0, 30, { y0: 14, plan: false, mat: 'facade' });                         // over the door
  add('sanct', -9, -5, -35, -6, 22, { ord: .46 }); add('sanct', 5, 9, -35, -6, 22, { ord: .46 });
  add('sanct', -9, 9, -38, -35, 22, { ord: .5 });
  add('sanct', -9, 9, -35, -6, 22, { y0: 20, plan: false, mat: 'roof' });                          // the roof
  return P;
}
const PLAN = { s: 7.6, cx: 540, cy: 700, Zc: -9, pivot: [0, -20] };   // portrait plan framing at 1080×1920 (scaled by H/1920)
const TEX = { X0: -150, X1: 150, Z0: -240, Z1: 240, ppm: 8 };            // the plan texture's world rectangle

export async function build(W, H) {
  const vert = H > W, SC = vert ? H / 1920 : W / 1920, FOV = vert ? 50 : 34;
  const PL = vert ? { s: PLAN.s * SC, cx: W / 2, cy: PLAN.cy * SC, Zc: PLAN.Zc } : { s: 5.4, cx: W / 2, cy: 460, Zc: PLAN.Zc };
  const PCS = pieces();

  // ================================================================ 1. the codex plan (2D strokes in world metres)
  const INK = [59, 36, 20], RED = [158, 52, 34], SANG = [168, 82, 52];
  const strokes = [];   // { pts:[[x,z]…], len:[…], w (m), c:[r,g,b], a, t0, t1 }
  const Rk = rng(1203);
  const mk = (pts, w, c, a, t0, t1, jit = .1) => {
    // densify every ~1.6 m with a small hand wobble across the line (seeded), then cumulative lengths
    const out = []; for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(L / 1.6)), nx = -(z1 - z0) / (L || 1), nz = (x1 - x0) / (L || 1);
      for (let k = 0; k < n; k++) { const f = k / n, wob = (Rk() - .5) * jit; out.push([lerp(x0, x1, f) + nx * wob, lerp(z0, z1, f) + nz * wob]); } }
    const last = pts[pts.length - 1]; out.push([last[0] + (Rk() - .5) * jit * .5, last[1] + (Rk() - .5) * jit * .5]);
    const len = [0]; for (let i = 1; i < out.length; i++) len.push(len[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
    strokes.push({ pts: out, len, w, c, a, t0, t1 });
  };
  // construction first, faint red chalk: the axis, the cross line through the veil, a compass circle, two diagonals
  mk([[0, -78], [0, 60]], .22, SANG, .28, 0, .14, .05);
  mk([[-62, -25], [62, -25]], .2, SANG, .24, .04, .17, .05);
  { const c = []; for (let i = 0; i <= 64; i++) { const a = -Math.PI / 2 + i / 64 * Math.PI * 2; c.push([Math.cos(a) * 50, -18 + Math.sin(a) * 50]); } mk(c, .18, SANG, .2, .02, .24, .2); }
  mk([[-24, -46], [24, 30]], .16, SANG, .16, .08, .2, .05); mk([[24, -46], [-24, 30]], .16, SANG, .16, .1, .22, .05);
  // the walls: each piece's outline in ink, hatched (poché) inside, in its drawing order
  const planP = PCS.filter(p => p.plan).sort((a, b) => a.ord - b.ord);
  for (const p of planP) {
    const t0 = .08 + p.ord * .95, d = .1;
    const w = p.g === 'sanct' ? .34 : .26;
    mk([[p.x0, p.z0], [p.x1, p.z0], [p.x1, p.z1], [p.x0, p.z1], [p.x0, p.z0 - .2]], w, INK, .9, t0, t0 + d, .14);
    if (!p.hatch) continue;
    // 45° hatching clipped to the block: x − z = c lines, spaced .55 m (sanctuary .42 m: darker), drawn as the wall is outlined
    const sp = p.g === 'sanct' ? .42 : .6, cs = [p.x0 - p.z1, p.x1 - p.z0], n = Math.floor((cs[1] - cs[0]) / sp);
    for (let k = 1; k < n; k++) { const c = cs[0] + k * sp;   // points with x − z = c inside the rectangle
      const xa = Math.max(p.x0, p.z0 + c), xb = Math.min(p.x1, p.z1 + c); if (xb - xa < .15) continue;
      const tt = t0 + d * .6 + (k / n) * .14; mk([[xa, xa - c], [xb, xb - c]], .12, INK, .55, tt, tt + .02, .03); }
  }
  // the colonnades: small circles (column bases) along the inside of the outer wall
  const COLS = [];
  for (let z = -66; z <= 46; z += 4.5) { COLS.push([-50.5, z], [50.5, z]); }
  for (let x = -46; x <= 46; x += 4.5) if (Math.abs(x) > 6) { COLS.push([x, -66.5], [x, 48.5]); }
  COLS.forEach(([x, z], i) => { const c = []; for (let k = 0; k <= 8; k++) { const a = k / 8 * Math.PI * 2; c.push([x + Math.cos(a) * .6, z + Math.sin(a) * .6]); } const tt = .3 + (i / COLS.length) * .25; mk(c, .14, INK, .75, tt, tt + .015, .04); });
  // the Holy Place furniture, tiny: the lampstand (seven points on an arc), the table, the incense altar before the veil
  for (let k = 0; k < 7; k++) { const a = Math.PI * (k / 6), x = -3.1 + Math.cos(a) * .8, z = -19 + Math.sin(a) * .25; const c = []; for (let j = 0; j <= 6; j++) c.push([x + Math.cos(j / 6 * 6.283) * .14, z + Math.sin(j / 6 * 6.283) * .14]); mk(c, .1, INK, .8, .74 + k * .006, .75 + k * .006, .01); }
  mk([[2.6, -19.6], [3.6, -19.6], [3.6, -18.4], [2.6, -18.4], [2.6, -19.6]], .1, INK, .8, .78, .8, .02);
  mk([[-.4, -22.9], [.4, -22.9], [.4, -22.1], [-.4, -22.1], [-.4, -22.9]], .1, INK, .85, .8, .82, .02);
  // the veil: the one red line, drawn last and a little heavier (the title board's red point becomes this line)
  mk([[-5, -25.05], [5, -25.05]], .42, [150, 28, 24], .95, .86, .97, .03);
  mk([[-5, -24.7], [5, -24.75]], .16, [150, 28, 24], .6, .9, .99, .03);

  // paper: aged cream, mottled, foxing, fibres — built once at the texture's resolution; the 2D frames sample it
  const TW = Math.round((TEX.X1 - TEX.X0) * TEX.ppm), TH = Math.round((TEX.Z1 - TEX.Z0) * TEX.ppm);
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const paper = mkC(TW, TH);
  { const g = paper.getContext('2d'), R = rng(77);
    g.fillStyle = '#ddcdab'; g.fillRect(0, 0, TW, TH);
    // low-frequency mottling (quarter res, upscaled smooth)
    const lw = TW >> 3, lh = TH >> 3, lo = mkC(lw, lh), lg = lo.getContext('2d'), im = lg.createImageData(lw, lh);
    for (let j = 0; j < lh; j++) for (let i = 0; i < lw; i++) { const n = .55 * fbm(i * .02, j * .02) + .3 * fbm(i * .09 + 7, j * .09) + .15 * fbm(i * .3, j * .3 + 3), k = (j * lw + i) * 4;
      const v = (n - .5) * 2; im.data[k] = 120 - v * 60; im.data[k + 1] = 95 - v * 55; im.data[k + 2] = 60 - v * 40; im.data[k + 3] = clamp(.06 + Math.abs(v) * .2) * 255; }
    lg.putImageData(im, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(lo, 0, 0, TW, TH);
    // foxing: small brown spots, a few larger water stains
    for (let k = 0; k < 900; k++) { const x = R() * TW, y = R() * TH, r = (1 + R() * R() * 9) * TEX.ppm * .25, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(140,88,40,${.08 + R() * .16})`); gr.addColorStop(1, 'rgba(140,88,40,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let k = 0; k < 26; k++) { const x = R() * TW, y = R() * TH, r = (8 + R() * 30) * TEX.ppm; g.strokeStyle = `rgba(150,105,55,${.05 + R() * .06})`; g.lineWidth = 2 + R() * 4; g.beginPath(); g.ellipse(x, y, r, r * (.6 + R() * .4), R() * 3, 0, 6.283); g.stroke(); }
    // fibres: short faint strokes
    g.lineWidth = 1; for (let k = 0; k < 7000; k++) { const x = R() * TW, y = R() * TH, a = R() * 6.283, l = 3 + R() * 10; g.strokeStyle = `rgba(${R() < .5 ? '120,90,55' : '255,250,235'},${.06 + R() * .08})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  }
  // draw the ink strokes into a 2D context through a world→px map, up to drawing progress p (0..1)
  const drawInk = (g, map, ppm, p) => {
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const s of strokes) {
      if (p <= s.t0) continue; const f = clamp((p - s.t0) / (s.t1 - s.t0)), L = s.len[s.len.length - 1] * f;
      const pts = []; for (let i = 0; i < s.pts.length; i++) { if (s.len[i] <= L) pts.push(s.pts[i]); else { const a = s.pts[i - 1], b = s.pts[i], k = (L - s.len[i - 1]) / (s.len[i] - s.len[i - 1]); pts.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); break; } }
      if (pts.length < 2) continue;
      const path = () => { g.beginPath(); pts.forEach((q, i) => { const [x, y] = map(q[0], q[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); };
      // the ink bleeds a little into the paper (a faint wide pass), then the line itself
      path(); g.strokeStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.a * .13})`; g.lineWidth = Math.max(1, s.w * ppm * 2.4); g.stroke();
      path(); g.strokeStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.a})`; g.lineWidth = Math.max(.8, s.w * ppm); g.stroke();
      if (f < 1) { const [x, y] = map(pts[pts.length - 1][0], pts[pts.length - 1][1]); g.fillStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.a * .9})`; g.beginPath(); g.arc(x, y, Math.max(1.2, s.w * ppm * .9), 0, 6.283); g.fill(); }   // the wet nib
    }
  };
  // the full plan into the texture (world → texture px)
  const planCanvas = mkC(TW, TH);
  { const g = planCanvas.getContext('2d'); g.drawImage(paper, 0, 0); drawInk(g, (x, z) => [(x - TEX.X0) * TEX.ppm, (z - TEX.Z0) * TEX.ppm], TEX.ppm, 1); }

  // the 2D plan frame: zoom k about the pivot (slow creep while it draws)
  const plan2D = (k) => {
    const s = PL.s * k, pv = [PL.cx, PL.cy + (PLAN.pivot[1] - PL.Zc) * PL.s];
    const map = (x, z) => [pv[0] + (PL.cx + x * PL.s - pv[0]) * k, pv[1] + (PL.cy + (z - PL.Zc) * PL.s - pv[1]) * k];
    const inv = (sx, sy) => [((sx - pv[0]) / k + pv[0] - PL.cx) / PL.s, ((sy - pv[1]) / k + pv[1] - PL.cy) / PL.s + PL.Zc];
    return { s, map, inv };
  };
  const planZoom = t => 1 + .05 * sine((t - T.draw0 + .6) / (T.move0 - T.draw0 + .6));
  const burn = (() => { const c = mkC(W, H), g = c.getContext('2d'), gr = g.createRadialGradient(W / 2, H * .42, Math.min(W, H) * .3, W / 2, H * .45, Math.max(W, H) * .75);
    gr.addColorStop(0, 'rgba(90,60,30,0)'); gr.addColorStop(1, 'rgba(90,60,30,.42)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return c; })();
  function codex(ctx, t) {
    const P2 = plan2D(planZoom(t)), [wx0, wz0] = P2.inv(0, 0), [wx1, wz1] = P2.inv(W, H);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true;
    ctx.drawImage(paper, (wx0 - TEX.X0) * TEX.ppm, (wz0 - TEX.Z0) * TEX.ppm, (wx1 - wx0) * TEX.ppm, (wz1 - wz0) * TEX.ppm, 0, 0, W, H);
    drawInk(ctx, P2.map, P2.s, clamp((t - T.draw0) / (T.draw1 - T.draw0)));
    ctx.drawImage(burn, 0, 0); ctx.restore();
  }

  // ================================================================ 2. the 3D world (cinematic-3d engine)
  let T = null, tau = null;   // set on the first draw from B
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .1, far: 2500,
    atmos: { density: .0005, falloff: .03, base: 0, start: 1, color: col('#3a332c', .4), colorUp: col('#2a2a30', .3), max: 900, scatter: .7, anisotropy: .8, phaseMix: .9 },
    bloom: { strength: .03, radius: 1.1, tint: col('#ffe8c8') },
    dof: { focus: 200, aperture: 2, maxCoc: 22 },
    look: { exposure: 1, contrast: 1, saturation: 1, lift: col('#000000'), shadowTint: col('#ffffff'), highTint: col('#ffffff'), vignette: .2, grain: .02, ca: .3 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera;

  // shared uniforms for the "develop" (paper drawing → lit stone) on every surface and the ink lines
  // PG: per-channel gain found by inverting the finish (AgX + saturation .95) so paper #ddcdab displays ≈ (222,205,170), the 2D
  // sheet under its burn vignette — the 2D → 3D join then has no jump in colour (exposure is 1 while it is paper)
  const PG = new THREE.Vector3(2.16, 1.5, .78), gained = hex => { const c = col(hex); return c.setRGB(c.r * PG.x, c.g * PG.y, c.b * PG.z); };
  const UD = { uDev: { value: new THREE.Vector4(0, -18, -60, 14) }, uPaper: { value: gained('#ddcdab') }, uInk: { value: gained('#3b2414') }, uLineA: { value: 1 }, uHatch: { value: 1 } };
  const devPatch = (m, key, kind = 'surf') => {
    const prev = m.onBeforeCompile;
    m.onBeforeCompile = function (sh, r) {
      if (prev) prev.call(this, sh, r);
      Object.assign(sh.uniforms, UD);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vDevP; varying vec3 vDevN;')
        .replace('#include <project_vertex>', kind === 'line' ? '#include <project_vertex>\nvDevP = (modelMatrix * vec4(transformed, 1.)).xyz; vDevN = vec3(0.,1.,0.);'
          : '#include <project_vertex>\nvDevP = (modelMatrix * vec4(transformed, 1.)).xyz; vDevN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vDevP; varying vec3 vDevN; uniform vec4 uDev; uniform vec3 uPaper, uInk; uniform float uLineA, uHatch;')
        .replace('#include <opaque_fragment>', '#include <opaque_fragment>\n' + (kind === 'line'
          ? `{ float dv = clamp((uDev.z - length(vDevP.xz - uDev.xy)) / uDev.w, 0., 1.); gl_FragColor.a *= (1. - dv) * uLineA; }`
          : `{ float dv = clamp((uDev.z - length(vDevP.xz - uDev.xy)) / uDev.w, 0., 1.);
               vec3 N = normalize(vDevN); float side = 1. - smoothstep(.55, .8, abs(N.y));
               float shade = mix(1., .84 + .06 * N.x + .04 * N.z, side);
               float hv = (vDevP.x * .7 + vDevP.y + vDevP.z * .7) * 1.6, fw = fwidth(hv), f = fract(hv);
               float ln = (1. - smoothstep(.07, .07 + 1.5 * fw, min(f, 1. - f))) * (1. - smoothstep(.25, .45, fw)) * side * uHatch;
               vec3 pc = mix(uPaper * shade, uInk, ln * .5);
               gl_FragColor.rgb = mix(pc, gl_FragColor.rgb, dv); }`));
    };
    const pk = m.customProgramCacheKey.bind(m); m.customProgramCacheKey = () => pk() + '|dev-' + key;
    return m;
  };
  // materials
  const M = {
    stone: devPatch(K.stoneMaterial({ color: '#ddd2b8', course: 1.6, block: 4.6, grime: .22, roughness: .88 }), 'stone'),     // massive Herodian ashlar
    facade: devPatch(K.stoneMaterial({ color: '#ece2cc', course: 1.4, block: 3.6, grime: .12, roughness: .8 }), 'facade'),
    roof: devPatch(K.std('#9c8e74', { roughness: .9 }), 'roof'),
    col: devPatch(K.std('#cfc2a6', { roughness: .85 }), 'col'),
    line: devPatch(new THREE.LineBasicMaterial({ color: gained('#3b2414').multiplyScalar(.8), transparent: true, depthWrite: false }), 'line', 'line'),
    gold: devPatch(K.std('#a8823c', { roughness: .38, metalness: .55, emissive: col('#3a2408'), emissiveIntensity: .25 }), 'gold'),
    goldDark: devPatch(K.std('#6a4e22', { roughness: .5, metalness: .4 }), 'golddark'),
    person: devPatch(K.std('#16110d', { roughness: .95 }), 'person'),
  };
  // the stone materials share K.stoneMaterial's cache key 'stone' — make each unique (they differ in uniforms only, but safe)
  const groups = {};
  for (const g of ['outer', 'inner', 'court', 'sanct', 'people']) { groups[g] = new THREE.Group(); S.add(groups[g]); }
  for (const p of PCS) {
    const w = p.x1 - p.x0, d = p.z1 - p.z0, h = p.y1 - p.y0, geo = new THREE.BoxGeometry(w, h, d);
    geo.translate((p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, (p.z0 + p.z1) / 2);
    const m = new THREE.Mesh(geo, M[p.mat]); m.castShadow = m.receiveShadow = true; groups[p.g].add(m);
    groups[p.g].add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), M.line));
  }
  // the colonnade: instanced columns
  { const g = new THREE.CylinderGeometry(.55, .62, 10, 10); g.translate(0, 5, 0);
    const im = new THREE.InstancedMesh(g, M.col, COLS.length), mm = new THREE.Matrix4();
    COLS.forEach(([x, z], i) => { mm.makeTranslation(x, 0, z); im.setMatrixAt(i, mm); }); im.castShadow = true; groups.outer.add(im); }
  // facade: a gilded frame round the door, a gilded band under the cornice (they catch the light at the end)
  { const fr = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .5), M.gold); m.position.set(x, y, .2); groups.sanct.add(m); };
    fr(.6, 14.4, -3.25, 7.2); fr(.6, 14.4, 3.25, 7.2); fr(7.1, .6, 0, 14.3); fr(28.2, 1.1, 0, 27.6); }

  // the ground: one plane — the plan on paper where it is undeveloped, limestone pavement where the colour has come
  const planTex = new THREE.CanvasTexture(planCanvas); planTex.flipY = false; planTex.colorSpace = THREE.SRGBColorSpace; planTex.anisotropy = 8;   // flipY off: canvas row 0 = z0 (flipped, the plan lay mirrored under its own walls)
  const UG = { uPG: { value: PG }, uPlan: { value: planTex }, uPlanMin: { value: new THREE.Vector2(TEX.X0, TEX.Z0) }, uPlanSize: { value: new THREE.Vector2(TEX.X1 - TEX.X0, TEX.Z1 - TEX.Z0) }, uPaperOut: { value: col('#ddcdab') } };
  const groundM = K.std('#b8aa8c', { roughness: .72 });
  groundM.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, UD, UG);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vGP;').replace('#include <project_vertex>', '#include <project_vertex>\nvGP = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vGP; uniform vec4 uDev; uniform vec3 uPG; uniform sampler2D uPlan; uniform vec2 uPlanMin, uPlanSize; uniform vec3 uPaperOut;
      float gh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }`)
      .replace('#include <map_fragment>', `#include <map_fragment>
      { vec2 q = vGP.xz / vec2(2.2, 1.6); float row = floor(q.y); q.x += gh(vec2(row, 3.)) ; vec2 id = floor(q), f = fract(q);
        float j = 1. - smoothstep(0., .035, min(min(f.x, 1. - f.x) * 2.2, min(f.y, 1. - f.y) * 1.6));
        diffuseColor.rgb *= mix(.8, 1.12, gh(id)) * (1. - .45 * j); }`)
      .replace('#include <opaque_fragment>', `#include <opaque_fragment>
      { vec2 uv = (vGP.xz - uPlanMin) / uPlanSize; vec3 pc = (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) ? texture2D(uPlan, uv).rgb : uPaperOut; pc *= uPG;
        float dv = clamp((uDev.z - length(vGP.xz - uDev.xy)) / uDev.w, 0., 1.);
        gl_FragColor.rgb = mix(pc, gl_FragColor.rgb, dv); }`);
  };
  groundM.customProgramCacheKey = () => 'kingdom-ground';
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), groundM); ground.rotation.x = -Math.PI / 2; ground.position.z = -20; ground.receiveShadow = true; S.add(ground);

  // the sky: the darkness over the land at the ninth hour (Mk 15:33) — slate cloud, a dim amber band low; paper while undeveloped
  const SKY = { top: col('#1a1d24', .6), mid: col('#34343a', .7), hor: col('#8a6a48', .9), paper: gained('#ddcdab') };
  const sky = K.sky(film, { top: SKY.paper.clone(), mid: SKY.paper.clone(), horizon: SKY.paper.clone(), clouds: .55, cloudColor: col('#4a4846', .5), cloudShade: col('#17171b', .4) });
  const hemi = new THREE.HemisphereLight(col('#8c8e98'), col('#3a3026'), .0); S.add(hemi);
  // a low warm light from the left front (the amber band under the dark cloud): edges and long shadows give the masses depth
  const dirL = new THREE.DirectionalLight(col('#e6c08e'), 0); dirL.position.set(-70, 42, 60); dirL.target.position.set(0, 0, -10);
  dirL.castShadow = true; dirL.shadow.mapSize.set(2048, 2048); Object.assign(dirL.shadow.camera, { left: -95, right: 95, top: 95, bottom: -95, near: 1, far: 300 }); dirL.shadow.bias = -.0005; dirL.shadow.normalBias = .05;
  S.add(dirL, dirL.target);

  // ---- the interior (only seen from the door on): gilded cedar lining, a dark ceiling, the furniture
  const inner = new THREE.Group(); S.add(inner);
  { const lin = (w, h, x, y, z, ry, m) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; p.receiveShadow = true; inner.add(p); return p; };
    const panelTex = (() => { const c = mkC(256, 512), g = c.getContext('2d'), R = rng(9);   // one tile = one panel, 2.5 m × 5 m
      g.fillStyle = '#8a6630'; g.fillRect(0, 0, 256, 512);                                     // gilded frame
      g.fillStyle = '#4a3218'; g.fillRect(18, 18, 220, 476);                                    // cedar field with its grain
      for (let k = 0; k < 90; k++) { const x = 18 + R() * 220; g.strokeStyle = `rgba(${R() < .5 ? '30,18,8' : '110,80,40'},${.15 + R() * .2})`; g.lineWidth = 1 + R() * 2; g.beginPath(); g.moveTo(x, 18); g.bezierCurveTo(x + (R() - .5) * 20, 180, x + (R() - .5) * 20, 330, x + (R() - .5) * 10, 494); g.stroke(); }
      g.strokeStyle = 'rgba(200,160,80,.55)'; g.lineWidth = 4; g.strokeRect(34, 34, 188, 444);   // gilded inner bead
      g.strokeStyle = 'rgba(20,12,6,.6)'; g.lineWidth = 2; g.strokeRect(18, 18, 220, 476);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
    const pm = (rx, ry) => { const t = panelTex.clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return K.std('#ffffff', { map: t, roughness: .45, metalness: .45 }); };
    lin(19, 20, -4.98, 10, -15.5, Math.PI / 2, pm(7.6, 4)); lin(19, 20, 4.98, 10, -15.5, -Math.PI / 2, pm(7.6, 4));
    { const c = new THREE.Mesh(new THREE.PlaneGeometry(10, 29), K.std('#2a1c10', { roughness: .8 })); c.rotation.x = Math.PI / 2; c.position.set(0, 19.98, -20.5); inner.add(c); }
    // inside face of the front wall round the door (seen when we look back in from the Most Holy Place: it is lit gold)
    { const m = pm(.5, 5); lin(2, 20, -4, 10, -6.02, Math.PI, m); lin(2, 20, 4, 10, -6.02, Math.PI, m); lin(6, 6, 0, 17, -6.02, Math.PI, pm(1.5, 1.5)); }
  }
  // the Most Holy Place: walls that become the light (emissive gold-white) once the veil is torn — no ark, no figure
  const mhpU = { e: 0 }, mhpMats = [];
  // the light has a shape (not a flat white): brightest behind the axis, high, falling off to the corners and toward the veil
  { const glowTex = (cx, cy, rx, ry, k0) => { const c = mkC(256, 512), g = c.getContext('2d');
      g.fillStyle = '#5a3a14'; g.fillRect(0, 0, 256, 512);
      // gilded panels first (three across — no joint on the axis, which drew a glowing cross), then the light over them:
      // the panels show toward the edges and dissolve in the bright middle
      g.strokeStyle = 'rgba(30,18,6,.45)'; g.lineWidth = 3; for (let y = 0; y < 512; y += 128) for (let x = 0; x < 256; x += 85.3) g.strokeRect(x + 8, y + 8, 69, 112);
      g.save(); g.translate(cx * 256, cy * 512); g.scale(rx, ry); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 256);
      gr.addColorStop(0, '#fffaf0'); gr.addColorStop(.3, 'rgba(255,234,192,.97)'); gr.addColorStop(.62, `rgba(240,190,110,${k0})`); gr.addColorStop(1, 'rgba(150,100,40,0)'); g.fillStyle = gr; g.fillRect(-256, -256, 512, 512); g.restore();
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const wall = (w, h, x, y, z, ry, tex) => { const m = new THREE.MeshStandardMaterial({ color: col('#c89c58'), roughness: .5, metalness: .3, emissive: col('#ffffff'), emissiveMap: tex, emissiveIntensity: 0 }); mhpMats.push(m);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; inner.add(p); };
    // (the frame inside sees ~4 × 7 m of the back wall: the glow must fall off within that, or it reads as a flat lit wall)
    wall(10, 20, 0, 10, -34.98, 0, glowTex(.5, .44, .5, .55, .8));
    wall(10, 20, -4.97, 10, -30, Math.PI / 2, glowTex(0, .44, .7, .7, .5)); wall(10, 20, 4.97, 10, -30, -Math.PI / 2, glowTex(1, .44, .7, .7, .5));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), (() => { const m = new THREE.MeshStandardMaterial({ color: col('#c8a060'), emissive: col('#ffe8c0'), emissiveIntensity: 0 }); mhpMats.push(m); return m; })()); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 19.97, -30); inner.add(ceil);
  }
  // the lampstand (left, by the wall), the table (right), the incense altar on the axis before the veil
  const flames = [], flameLamps = [];
  { const g = new THREE.Group(); g.position.set(-3.1, 0, -19); g.rotation.y = .45; inner.add(g);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.18, .42, .35, 16), M.gold); base.position.y = .18; g.add(base);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, 2.5, 10), M.gold); stem.position.y = 1.55; g.add(stem);
    for (const r of [.32, .62, .92]) { const curve = new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => { const a = Math.PI * i / 12; return V(-Math.cos(a) * r, 2.8 - Math.sin(a) * r * 1.15, 0); }));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, .045, 6), M.gold); g.add(tube); }
    for (let k = 0; k < 7; k++) { const x = (k - 3) * .307, cup = new THREE.Mesh(new THREE.CylinderGeometry(.08, .04, .12, 10), M.gold); cup.position.set(x, 2.86, 0); g.add(cup);
      const f = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), K.glow('#ffc870', 60)); f.scale.set(1, 2.4, 1); f.position.set(x, 3.0, 0); g.add(f); flames.push(f); }
    g.updateMatrixWorld(true);
    for (const f of flames) { const wp = V(); f.getWorldPosition(wp); flameLamps.push(film.lamp(wp, '#ffb860', { power: .55, size: .06, fog: 1.4 })); }
  }
  const lampLight = new THREE.PointLight(col('#ffb868'), 0, 30, 1.6); lampLight.position.set(-3.1, 3.2, -18.6); lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -.003; inner.add(lampLight);
  { const tb = new THREE.Mesh(new THREE.BoxGeometry(1, .08, .55), M.gold); tb.position.set(3.1, .95, -19); inner.add(tb);
    for (const [x, z] of [[-.45, -.24], [.45, -.24], [-.45, .24], [.45, .24]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.06, .92, .06), M.gold); l.position.set(3.1 + x, .46, -19 + z); inner.add(l); }
    for (let k = 0; k < 12; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.3, .07, .2), K.std('#a07848', { roughness: .9 })); b.position.set(3.1 + (k < 6 ? -.2 : .2), 1.03 + (k % 6) * .075, -19); inner.add(b); }
    const al = new THREE.Mesh(new THREE.BoxGeometry(.7, 1.15, .7), M.gold); al.position.set(0, .575, -22.4); al.castShadow = true; inner.add(al);
    for (const [x, z] of [[-.31, -.31], [.31, -.31], [-.31, .31], [.31, .31]]) { const h = new THREE.Mesh(new THREE.BoxGeometry(.1, .14, .1), M.gold); h.position.set(x, 1.22, -22.4 + z); inner.add(h); }
    const coal = new THREE.Mesh(new THREE.PlaneGeometry(.55, .55), K.glow('#ff7a30', 6)); coal.rotation.x = -Math.PI / 2; coal.position.set(0, 1.16, -22.4); inner.add(coal); }
  const coalLight = new THREE.PointLight(col('#ff9a50'), 0, 18, 1.8); coalLight.position.set(0, 1.9, -22.0); inner.add(coalLight);
  const coalLamp = film.lamp(V(0, 1.5, -22.4), '#ff9a50', { power: .5, size: .35, fog: 1.6 });
  // incense smoke rising before the veil (two crossed soft ribbons, scrolled by the warped time: it slows with the ramp)
  const smokeU = { uT: { value: 0 }, uA: { value: .0 } };
  { const m = new THREE.ShaderMaterial({ uniforms: smokeU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `varying vec2 vUv; uniform float uT, uA; ${hashGLSL}
        void main(){ float y = vUv.y, sway = sin(y * 5. - uT * .5) * .08 * y + (vn(vec2(y * 2. - uT * .2, 3.)) - .5) * .25 * y;
          float x = (vUv.x - .5 - sway) / (.13 + .45 * y); float body = exp(-x * x * 3.);
          float n = fb(vec2(vUv.x * 3. + sway * 4., y * 2.2 - uT * .35)); float a = body * smoothstep(.35, .8, n + .25 * (1. - y)) * smoothstep(0., .08, y) * (1. - smoothstep(.55, 1., y));
          gl_FragColor = vec4(vec3(.62, .5, .42) * (1.2 - .6 * y), a * uA); }` });
    // (pilot 1: left out — even faint, the rising ribbon on the axis read as a crack already in the veil before the tear)
    if (SMOKE) for (const ry of [0, Math.PI / 2]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(3, 11), m); p.position.set(0, 1.2 + 5.5, -22.4); p.rotation.y = ry + .3; inner.add(p); } }

  // ---- the veil: two halves of one heavy woven curtain (blue, purple, scarlet — Ex 26:31, no figures), torn from the top
  const VEIL = { z: -25, w: 5.25, h: 20.3, ns: 30, nv: 90 };
  const veilTex = (() => { const c = mkC(512, 1024), g = c.getContext('2d'), R = rng(31);
    g.fillStyle = '#2a1e46'; g.fillRect(0, 0, 512, 1024);
    // woven bands (horizontal): deep blue, purple, scarlet, a thin linen thread between; lozenge damask faint in the field
    const bands = ['#1e2a5a', '#3e1d4c', '#7a1a22', '#1e2a5a', '#3e1d4c'];
    for (let y = 0; y < 1024; y += 128) bands.forEach((b, i) => { g.fillStyle = b; g.globalAlpha = .55; g.fillRect(0, y + 8 + i * 22, 512, 16); });
    g.globalAlpha = 1;
    for (let y = 0; y < 1024; y += 128) { g.fillStyle = 'rgba(220,205,180,.18)'; g.fillRect(0, y + 4, 512, 2); g.fillRect(0, y + 122, 512, 2); }
    g.strokeStyle = 'rgba(160,60,70,.16)'; g.lineWidth = 2; for (let y = 0; y < 1024; y += 64) for (let x = 0; x < 512; x += 64) { g.beginPath(); g.moveTo(x + 32, y + 6); g.lineTo(x + 58, y + 32); g.lineTo(x + 32, y + 58); g.lineTo(x + 6, y + 32); g.closePath(); g.stroke(); }
    const im = g.getImageData(0, 0, 512, 1024); for (let i = 0; i < im.data.length; i += 4) { const px = (i >> 2) % 512, py = (i >> 2) / 512 | 0, wv = ((px + py) % 4 < 2 ? 1 : .88) * (.9 + .2 * R());
      im.data[i] *= wv; im.data[i + 1] *= wv; im.data[i + 2] *= wv; } g.putImageData(im, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
  const veilM = new THREE.MeshStandardMaterial({ map: veilTex, roughness: .82, metalness: 0, side: THREE.DoubleSide, color: col('#ffffff', 2.1) });   // (albedo lifted: in lamplight the woven colours must read, not a black wall)
  const jag = y => .16 * noise1(y * 1.4, 5) + .07 * noise1(y * 5.3, 8);   // the tear line (shared by both edges)
  const halves = [-1, 1].map(side => {
    const g = new THREE.BufferGeometry(), n = (VEIL.ns + 1) * (VEIL.nv + 1), pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = [];
    for (let j = 0; j <= VEIL.nv; j++) for (let i = 0; i <= VEIL.ns; i++) { const k = j * (VEIL.ns + 1) + i, s = i / VEIL.ns; uv[k * 2] = side < 0 ? s * .5 : 1 - s * .5; uv[k * 2 + 1] = j / VEIL.nv; }
    for (let j = 0; j < VEIL.nv; j++) for (let i = 0; i < VEIL.ns; i++) { const a = j * (VEIL.ns + 1) + i, b = a + 1, c = a + VEIL.ns + 1, d = c + 1; if (side < 0) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d); }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.Mesh(g, veilM); m.castShadow = m.receiveShadow = true; m.frustumCulled = false; inner.add(m); return { side, g, pos, m };
  });
  // the rod the veil hangs from
  { const rod = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 10.4, 10), M.gold); rod.rotation.z = Math.PI / 2; rod.position.set(0, 20.15, VEIL.z + .3); inner.add(rod); }
  // where the tear front is (y) and how far the cloth has parted at height y, from the warped time
  const tearFront = tt => 20.6 - 11 * Math.max(0, tt);               // 11 m/s in warped time
  const openAt = (y, tt) => { if (tt <= 0) return 0; const yT = tearFront(tt); return ss(0, 5.5, y - yT) * lerp(.55, 1, ss(20.3, 16.5, y)) * (.82 + .18 * ss(0, 3, tt)); };
  function veilShape(tt, tauNow) {
    for (const H2 of halves) { const { side, pos } = H2;
      for (let j = 0; j <= VEIL.nv; j++) { const v = j / VEIL.nv, y = -.25 + v * VEIL.h, o = openAt(y, tt), edge = jag(y);
        for (let i = 0; i <= VEIL.ns; i++) { const s = i / VEIL.ns, k = (j * (VEIL.ns + 1) + i) * 3;
          let x = lerp(side * VEIL.w, edge - side * .035, s);   // the halves overlap 7 cm while whole: no seam of light before the tear
          // heavy vertical folds; when torn the inner part is pulled aside (bunching), the torn edge curls toward us and sways
          const fold = .11 * Math.sin(x * 3.3 + 1.3) + .05 * Math.sin(x * 7.9 + .4);
          const pull = 2.05 * o * Math.pow(s, 1.6);
          x += side * pull;
          let z = VEIL.z + (side < 0 ? .03 : 0) + fold * (1 + 1.6 * o * s) + .34 * o * Math.pow(s, 1.2) * Math.sin(s * 13 + y * .35)
            + .85 * o * Math.pow(s, 4) + .09 * o * Math.sin(tauNow * 1.1 + y * .22 + side) * s;
          // the cloth right at the tear front shivers (seeded by the warped time — it slows with the ramp)
          if (tt > 0) { const yT = tearFront(tt), near = Math.exp(-Math.pow((y - yT) / 1.2, 2)) * Math.pow(s, 3); z += near * .12 * noise1(tauNow * 14 + y, 3); }
          pos[k] = x; pos[k + 1] = y - .18 * o * Math.pow(s, 3); pos[k + 2] = z; } }
      H2.g.attributes.position.needsUpdate = true; H2.g.computeVertexNormals(); }
  }

  // ---- the light behind the veil: a spot that throws the tear's shape out through the doors; the gap's glow in the haze
  // (43° half-angle: it must not light the Most Holy Place's own walls — that flattened the radiance to a lit wall)
  const spot = new THREE.SpotLight(col('#ffe6bc'), 0, 0, .75, .55, 1.25);
  spot.position.set(0, 4.6, -34.3); spot.target.position.set(0, 2.6, 10); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048);
  spot.shadow.camera.near = .5; spot.shadow.camera.far = 160; spot.shadow.bias = -.0006; spot.shadow.normalBias = .03; S.add(spot, spot.target);
  const mhpLight = new THREE.PointLight(col('#ffe4b8'), 0, 26, 1.2); mhpLight.position.set(0, 10, -30); S.add(mhpLight);
  const gapLamps = [2, 5, 8, 11, 14, 17].map(y => film.lamp(V(0, y, VEIL.z + .6), '#ffe2b4', { power: 0, size: 1.4, fog: 2.2 }));
  const sparkLamp = film.lamp(V(0, 20, VEIL.z + .4), '#fff0d0', { power: 0, size: .45, fog: 2 });
  const mhpLamp = film.lamp(V(0, 9, -30), '#ffe8c4', { power: 0, size: 5, fog: 2.5 });
  const doorLamp = film.lamp(V(0, 6.5, .8), '#ffe2b4', { power: 0, size: 3.2, fog: 2 });
  const courtLamps = [[0, 2.2, 7], [0, 1.4, 16]].map(p => film.lamp(V(...p), '#ffe2b4', { power: 0, size: 1.8, fog: 1.4 }));   // (near the camera their glow whitened the frame's bottom)

  // ---- dust in the light (few, inside the beam only — rules: tens, not a field of white points)
  const dustU = { uT: { value: 0 }, uA: { value: 0 }, uPx: { value: H / 1920 } };
  { const n = 110, R = rng(57), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { const z = lerp(-33, -6, R()), spread = 1.2 + Math.max(0, z - VEIL.z) * .11; p[i * 3] = (R() - .5) * 2 * spread; p[i * 3 + 1] = .6 + R() * 15; p[i * 3 + 2] = z; sd[i] = R(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx; varying float vA;
        void main(){ vec3 q = position; q.y += mod(uT * (.08 + .1 * aS) + aS * 15., 15.) - 7.5 * aS; q.x += sin(uT * .3 + aS * 30.) * .25; q.z += cos(uT * .23 + aS * 17.) * .25;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (2.5 + 5. * aS) * 14. / d, 1., 14.) ; vA = clamp(1.3 - d / 30., 0., 1.) * (.55 + .45 * aS); }`,
      fragmentShader: `uniform float uA; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 14.); gl_FragColor = vec4(vec3(1., .9, .72) * 2.2, a * vA * uA); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; inner.add(pts); }

  // ---- people in the court: small men from behind, head cloths to the shoulders (no long hair), some with staffs
  { const R = rng(808), placed = [];
    // a man: tunic, an outer mantle hanging from broad shoulders (a little open at the front edge), arms under it, the head
    // cloth falling to the shoulders behind; bodies vary (build, height, a bowed head, a staff) so a crowd is not a row of pawns
    const man = (x, z, h, staff, bow, broad) => { const g = new THREE.Group(), m = M.person, s = h / 1.75, b = broad;
      const robe = new THREE.Mesh(new THREE.CylinderGeometry(.19 * s * b, .3 * s * b, 1.3 * s, 12), m); robe.position.y = .65 * s; g.add(robe);
      const mantle = new THREE.Mesh(new THREE.CylinderGeometry(.25 * s * b, .36 * s * b, 1.05 * s, 14, 1, true, -2.6, 5.2), m); mantle.position.y = .88 * s; mantle.material.side = THREE.DoubleSide; g.add(mantle);
      const sh = new THREE.Mesh(new THREE.CapsuleGeometry(.18 * s, .2 * s, 4, 10), m); sh.scale.set(1.35 * b, 1, .82); sh.position.y = 1.36 * s; g.add(sh);
      const neck = new THREE.Group(); neck.position.y = 1.5 * s; neck.rotation.x = -bow; g.add(neck);   // a bowed head leans forward (away from us)
      const head = new THREE.Mesh(new THREE.SphereGeometry(.105 * s, 12, 10), m); head.position.y = .15 * s; neck.add(head);
      const cloth = new THREE.Mesh(new THREE.SphereGeometry(.13 * s, 12, 8, 0, Math.PI * 2, 0, Math.PI * .58), m); cloth.position.y = .17 * s; neck.add(cloth);
      const drape = new THREE.Mesh(new THREE.CylinderGeometry(.13 * s, .2 * s, .3 * s, 10, 1, true, -1.2, 2.4), m); drape.position.set(0, -.06 * s, .02 * s); neck.add(drape);   // head cloth down to the shoulders, behind (its top ring stays under the cap: no points)
      if (staff) { const st = new THREE.Mesh(new THREE.CylinderGeometry(.02, .022, 1.95 * s, 6), m); st.position.set(.32 * s * b, .97 * s, -.06); st.rotation.z = -.06; g.add(st); }
      g.position.set(x, 0, z); g.rotation.y = (R() - .5) * .5; g.userData.ph = R() * 6.283; g.userData.ry = g.rotation.y; g.traverse(o => { if (o.isMesh) o.castShadow = true; }); groups.people.add(g); };
    M.person.side = THREE.DoubleSide;
    // they stand loosely in groups between the altar's line and z 19.5, a clear aisle on the axis (≥ 3 m): the camera passes
    // high over them and the last push stops behind them — none comes near enough to read as a lump
    let tries = 0; while (placed.length < 26 && tries++ < 4000) { const side = R() < .5 ? -1 : 1, x = side * (3 + R() * 8.5), z = 6 + R() * 13.5;
      if (x < -4.5 && z < 15.5 && x > -13.8) continue;   // not on the altar
      if (Math.abs(z - 22) < .9) continue;                // not in the parapet
      if (placed.some(([a, b]) => Math.hypot(a - x, b - z) < 1.25)) continue;
      placed.push([x, z]); man(x, z, 1.62 + R() * .2, R() < .25, R() < .3 ? .3 + R() * .15 : (R() - .5) * .1, .9 + R() * .25); } }

  // ================================================================ 3. the camera
  // (a) the long move: from straight above the plan (exactly the 2D framing) round 30° and down into the court, through the
  //     doors to rest before the veil. Positions on one smooth curve; timed so the distance to the veil shrinks at an even
  //     log rate (the picture grows at a steady pace, no rush at the end), with a gentle start and a long settle.
  const VEILC = V(0, 10, VEIL.z);
  const creep = c => Math.max(0, c) - .7 * (1 - Math.exp(-Math.max(0, c) / .7));   // warped seconds of creep, starting from rest
  let move = null;
  const buildMove = () => {
    const k = planZoom(T.move0), pxpm = PL.s * k, pv = [PL.cx, PL.cy + (PLAN.pivot[1] - PL.Zc) * PL.s];
    const zc = ((H / 2 - pv[1]) / k + pv[1] - PL.cy) / PL.s + PL.Zc, xc = ((W / 2 - pv[0]) / k + pv[0] - PL.cx) / PL.s;
    const h0 = (H / 2) / (pxpm * Math.tan(FOV * Math.PI / 360));
    // round 30° to the right while it stands up, then on the axis from the front: through the inner gate (under its lintel at
    // 13 m), the facade growing frontally with the door centred, through the porch to the veil
    const P = [V(xc, h0, zc), V(xc + 16, h0 * .7, zc + 46), V(40, 90, 118), V(16, 34, 84), V(2.5, 13, 50), V(0, 10.2, 30), V(0, 8.4, 10), V(0, 7.4, 0), V(0, 7.1, -3.4)];
    const curve = new THREE.CatmullRomCurve3(P, false, 'centripetal', .5), N = 1400, pts = [], ld = [];
    for (let i = 0; i <= N; i++) { const p = curve.getPointAt(i / N); pts.push(p); ld.push(Math.log(p.distanceTo(VEILC))); }
    for (let i = 1; i <= N; i++) ld[i] = Math.min(ld[i], ld[i - 1] - 1e-6);   // monotone envelope
    move = { pts, ld, N, h0, zc, xc };
  };
  // trapezoid velocity profile on [0,1]: accelerate over a, decelerate over d (smooth corners), constant between
  const trap = (x, a, d) => { x = clamp(x); const vmax = 1 / (1 - a / 2 - d / 2);
    if (x < a) return vmax * x * x / (2 * a); if (x > 1 - d) { const y = 1 - x; return 1 - vmax * y * y / (2 * d); } return vmax * (x - a / 2); };
  const sCam = new THREE.Matrix4();
  function placeMove(t) {
    const e = trap((t - T.move0) / (T.move1 - T.move0), .24, .42), target = lerp(move.ld[0], move.ld[move.N], e);
    let lo = 0, hi = move.N; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (move.ld[mid] > target) lo = mid; else hi = mid; }
    const f = (move.ld[lo] - target) / Math.max(1e-9, move.ld[lo] - move.ld[hi]), p = move.pts[lo].clone().lerp(move.pts[hi], clamp(f)), s = (lo + f) / move.N;
    // look: straight down at first (the plan), then toward the sanctuary, finally the veil's upper half (so its top is in frame)
    const w = ss(0, .42, s), down = V(0, -1, 0), tgt = V(0, lerp(4, 13.2, ss(.55, 1, s)), lerp(-14, VEIL.z, ss(.45, 1, s)));
    const dir = down.clone().lerp(tgt.clone().sub(p).normalize(), w).normalize();
    const up = V(0, 0, -1).lerp(V(0, 1, 0), ss(.02, .35, s)).normalize();
    return { p, dir, up, s };
  }
  const setCam = (p, dir, up) => { cam.position.copy(p); sCam.lookAt(p, p.clone().add(dir), up); cam.quaternion.setFromRotationMatrix(sCam); };
  const lookDir = (p, target) => target.clone().sub(p).normalize();
  const hermite = (a, b, k) => a.clone().lerp(b, k);

  // ================================================================ 4. one frame
  const tmp = V();
  function frame3D(t) {
    const ta = tau(t), tt = ta - tau(T.tear0);   // tt: warped seconds since the tear began
    // ---- the camera, beat by beat (each beat one move; a slow drift under it so nothing freezes)
    let p, dir, up = V(0, 1, 0), focus;
    if (t < T.move1) { const m = placeMove(t); p = m.p; dir = m.dir; up = m.up; focus = p.distanceTo(VEILC) * .8; }
    else {
      const pA = V(0, 7.1, -3.4);
      if (t < T.enter0) {   // before the veil: creep in (in warped time — it nearly holds in the slow motion), tilt down with the tear
        const c = creep(ta - tau(T.move1)); p = pA.clone().add(V(0, -.05 * c, -.32 * c));
        const yl = lerp(13.2, 9.5, ss(.35, 2.9, tt)); dir = lookDir(p, V(0, yl, VEIL.z)); focus = p.distanceTo(V(0, yl, VEIL.z));
      } else {
        const c0 = creep(tau(T.enter0) - tau(T.move1)), pB0 = pA.clone().add(V(0, -.05 * c0, -.32 * c0));
        // pIn: inside the Most Holy Place, risen a little and looking up into the light; pOut: in the court behind the people at
        // their eye height (they stand at 52–60 % of the frame, above the caption band); pPush: the end of the last push (the
        // people stay ahead of it — none comes near the lens)
        // pOut at eye height (1.9 m): the figures stand against the door's light, heads on the horizon (≈ 54–61 % of the frame)
        const pIn = V(0, 9.2, -29.4), pOut = V(0, 1.9, 44), pPush = V(0, 2.2, 25.5), lkIn = V(0, 13.5, -35), lkDoor = V(0, 3.2, 0);
        if (t < T.out0) {   // N25f: one move through the tear into the radiance, rising, the whole line long (no hold: the light fills)
          const k = trap((t - T.enter0) / (T.out0 - T.enter0), .25, .5); p = pB0.clone().lerp(pIn, k);
          p.y = lerp(pB0.y, pIn.y, ss(.35, 1, k));
          const yl0 = lerp(13.2, 9.5, ss(.35, 2.9, tau(T.enter0) - tau(T.tear0)));   // where the tilt had got to (no jump: frame-qa pop 17.93)
          const lk = V(0, lerp(yl0, lkIn.y, ss(.2, 1, k)), lerp(VEIL.z, lkIn.z, ss(0, .6, k))); dir = lookDir(p, lk); focus = Math.max(3, p.distanceTo(lk));
        } else if (t < T.N26) {   // N25g: drawing back out the way we came, facing in, past the veil and the lamps, out to the people
          const k = trap((t - T.out0) / (T.N26 - T.out0), .3, .3), z = lerp(pIn.z, pOut.z, k);
          // height by place: high in the house, down through the door, above the heads over the crowd, then to their eye height
          const y = z < 0 ? lerp(pIn.y, 6.2, ss(-29.4, 0, z)) : lerp(6.2, pOut.y, ss(21, 44, z));   // high over the crowd, down only behind it
          p = V(0, y, z);
          const lk = V(0, lerp(lkIn.y, lkDoor.y, ss(.15, .9, k)), lerp(lkIn.z, lkDoor.z, ss(.25, .95, k))); dir = lookDir(p, lk); focus = p.distanceTo(V(0, 4, Math.min(p.z - 8, 0)));
        } else {   // N26 + N26b: one long slow push toward the door of light (light moves on N26, the garden shows on N26b)
          const k = sine((t - T.N26) / (T.push1 - T.N26));
          p = pOut.clone().lerp(pPush, k); dir = lookDir(p, lkDoor.clone().lerp(V(0, 4.2, 0), k)); focus = p.z;
        }
      }
    }
    // a breath of hand-held float (tiny, seeded), less while it is still a drawing
    const hh = ss(T.move0 + 1.5, T.move0 + 3.5, t);
    p = p.clone().add(V(noise1(t * .35, 1) * .05 * hh, noise1(t * .4, 2) * .035 * hh, 0));
    setCam(p, dir, up);
    film.dofCfg.focus = focus; film.dofCfg.aperture = lerp(1.2, 3.2, ss(T.move1 - 1, T.move1, t));

    // ---- the plan rises into walls and the colour develops
    const riseK = (g, a, b) => { const k = eio(clamp((t - a) / (b - a))); groups[g].visible = k > .002; groups[g].scale.y = Math.max(.002, k); };
    riseK('sanct', T.rise0, T.rise0 + 1.7); riseK('inner', T.rise0 + .35, T.rise0 + 2.0); riseK('court', T.rise0 + .6, T.rise0 + 2.2); riseK('outer', T.rise0 + .7, T.rise1); riseK('people', T.rise0 + 1.4, T.rise1 + .3);
    // the crowd is alive: each man sways a little on his feet (seeded phase; ±0.6°, a breath of weight shifting)
    for (const g of groups.people.children) { const ph = g.userData.ph; g.rotation.z = .011 * Math.sin(ta * .7 + ph); g.rotation.y = g.userData.ry + .02 * Math.sin(ta * .4 + ph * 1.7); }
    inner.visible = t > T.rise0 + 1.75;   // only once the house is up (the lining would show over half-risen walls)
    const dv = ss(T.dev0, T.dev1, t); UD.uDev.value.set(0, -18, lerp(-20, 330, Math.pow(dv, 1.4)), 26);
    UD.uLineA.value = 1 - ss(T.dev1 - .6, T.dev1 + .4, t); UD.uHatch.value = 1 - dv;
    const skyK = ss(T.dev0 + .3, T.dev1, t);
    sky.u.top.value.copy(SKY.paper).lerp(SKY.top, skyK); sky.u.mid.value.copy(SKY.paper).lerp(SKY.mid, skyK); sky.u.horizon.value.copy(SKY.paper).lerp(SKY.hor, skyK); sky.u.clouds.value = .55 * skyK;

    // ---- the tear and its light
    veilShape(tt, ta);
    const gap = tt > 0 ? clamp(openAt(10, tt)) : 0, burst = ss(0, 1.4, tt), full = ss(.8, 3.2, tt);
    const inMHP = ss(T.enter0 + 3.5, T.enter1, t) * (1 - ss(T.out0 + .8, T.out0 + 3.2, t));
    for (const [i, L] of gapLamps.entries()) { const y = [2, 5, 8, 11, 14, 17][i]; L.power = (tt > 0 ? openAt(y, tt) : 0) * 1.6 * (1 - .85 * inMHP); L.pos.x = jag(y); }
    if (tt > 0 && tt < 3) { const yT = tearFront(tt); sparkLamp.pos.set(jag(yT), Math.max(0, yT), VEIL.z + .3); sparkLamp.power = 2.4 * ss(0, .3, tt) * (1 - ss(2.2, 2.9, tt)); } else sparkLamp.power = 0;
    const mhpE = lerp(0, 1, burst) * (1 + .35 * full) * (1 + .3 * ss(T.enter0 + 1.5, T.out0, t));   // N25f: the room fills with light
    mhpMats.forEach(m => { m.emissiveIntensity = 2.6 * mhpE * (1 - .62 * inMHP); });
    mhpLight.intensity = 28 * mhpE; mhpLamp.power = .8 * mhpE * (1 - .7 * inMHP);
    // the spot throws the tear's light out; its reach grows with the flow (N25g) and settles into the door's shape (N26)
    const flow = ss(T.flow0, T.flow1, t), dark = ss(T.dark0, T.dark1, t);
    spot.intensity = 1450 * burst * (1 + .2 * flow) * (1 - .45 * dark); spot.distance = lerp(30, 88, Math.pow(flow, .8)) * (1 - .22 * dark);
    // N26: as the dark closes, the doorway's light widens and brightens — a door-shaped opening of light in the dark, its pool
    // on the pavement sharpening into the door's shape
    spot.penumbra = lerp(.55, .18, dark);
    doorLamp.power = 1.3 * flow * (1 + .6 * dark); doorLamp.size = lerp(3.2, 4.6, dark); courtLamps.forEach((L, i) => { L.power = .3 * ss(.15 + i * .25, .45 + i * .25, flow) * (1 - .35 * dark); });
    // the lamps of the Holy Place: alive before the tear, outshone after it
    const fl = .86 + .14 * noise1(ta * 3.1, 7), lampsOn = ss(T.rise0 + 1.2, T.move1, t);
    lampLight.intensity = 115 * fl * lampsOn * (1 - .55 * burst); coalLight.intensity = 40 * (.9 + .1 * noise1(ta * 2.3, 4)) * lampsOn * (1 - .5 * burst);
    flameLamps.forEach((L, i) => { L.power = .55 * (.8 + .2 * noise1(ta * 4 + i, 9)) * lampsOn; }); flames.forEach((f, i) => f.scale.set(1, 2.4 + .3 * noise1(ta * 5 + i * 1.7, 11), 1));
    coalLamp.power = .5 * lampsOn; smokeU.uT.value = ta; smokeU.uA.value = .2 * lampsOn * (1 - full);   /* faint and wide: a bright thin ribbon read as a crack in the veil */   // gone before the camera passes through it
    dustU.uT.value = ta; dustU.uA.value = burst * (1 - .5 * dark);

    // ---- light on the world outside (the ninth hour's darkness), the haze, the exposure, the look
    const outsideK = ss(T.dev0, T.dev0 + 1.4, t) * (1 - .9 * dark);   // the light comes with the colour: pale limestone under the dark sky
    hemi.intensity = 1.0 * outsideK; dirL.intensity = 1.9 * outsideK;
    const inside = ss(T.move1 - 1.4, T.move1 - .2, t) * (1 - ss(T.out0 + 3.8, T.out0 + 6.5, t));
    const A = film.atmos; A.density = lerp(.0005, lerp(.01, lerp(.026, .012, inMHP), inside), skyK); A.falloff = lerp(.03, .012, inside);
    A.color.copy(col('#4a4238', .5)).lerp(col('#2a2018', .4), inside).multiplyScalar(1 - .75 * dark); A.colorUp.copy(A.color);
    const Lk = film.look;
    // paper (developed 0): neutral, bright, as the 2D sheet. Developed: a dim, warm, contrasty night interior. Burst: eye adapts.
    Lk.exposure = lerp(1, lerp(1.25, 1.2, inside), ss(T.dev0 + .4, T.dev1, t)) * lerp(1, .62, burst * (1 - .2 * flow)) * lerp(1, .5, inMHP);
    Lk.contrast = lerp(1, 1.1, skyK); Lk.saturation = lerp(.95, 1.04, skyK); Lk.vignette = lerp(.22, .42, skyK); Lk.grain = lerp(.025, .045, skyK);
    Lk.shadowTint.copy(col('#ffffff')).lerp(col('#c8c0d8'), skyK); Lk.highTint.copy(col('#ffffff')).lerp(col('#fff0d4'), skyK); Lk.lift.copy(col('#000000')).lerp(col('#0b0907'), skyK);
    film.bloomCfg.strength = lerp(.02, .06, skyK) + .08 * burst - .03 * inMHP;
    film.render(t);
  }

  // ---- 2D overlays after the 3D frame: the garden beyond the door (N26b), from the door's projected corners
  const garden = (() => { const gw = 600, gh = 1400, c = mkC(gw, gh), g = c.getContext('2d'), R = rng(2024);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, gw, gh);
    // ink-wash hills on rice paper, soft, two layers; every grass stroke leans toward the point of light in the middle (part 2)
    const hill = (y0, amp, a, blur, seed) => { g.save(); g.filter = `blur(${blur}px)`; g.fillStyle = `rgba(40,48,58,${a})`; g.beginPath(); g.moveTo(-20, gh); for (let x = -20; x <= gw + 20; x += 10) g.lineTo(x, y0 + Math.sin(x * .01 + seed) * amp + (noise1(x * .02, seed) * amp * .6)); g.lineTo(gw + 20, gh); g.closePath(); g.fill(); g.restore(); };
    hill(gh * .56, 46, .16, 12, 7); hill(gh * .62, 40, .24, 9, 1); hill(gh * .7, 30, .32, 5, 4);
    const P0 = [gw * .5, gh * .615];   // the point of gold, on the far hill's line in the middle
    // grass in dry-brush strokes, every one leaning toward the point (no tree: a lone trunk + blurred crown read as a lollipop)
    g.lineCap = 'round'; for (let k = 0; k < 320; k++) { const x = R() * gw, y = gh * (.68 + R() * .32), a = Math.atan2(P0[1] - y, P0[0] - x), l = 18 + R() * 46; g.strokeStyle = `rgba(30,36,42,${.1 + R() * .2})`; g.lineWidth = 1 + R() * 2.6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .35, y - l * .55, x + Math.cos(a) * l * .75, y + Math.sin(a) * l * .45 - l * .45); g.stroke(); }
    // feather every edge to white (white = no change under multiply), so it never reads as a picture inside the door
    for (const [x0, y0, x1, y1, w, h] of [[0, 0, gw * .22, 0, gw * .22, gh], [gw, 0, gw * .78, 0, gw * .22, gh], [0, 0, 0, gh * .3, gw, gh * .3], [0, gh, 0, gh * .8, gw, gh * .2]]) {
      const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(Math.min(x0, x1), Math.min(y0, y1), w, h); }
    return { c, P0: [P0[0] / gw, P0[1] / gh] }; })();
  function doorOverlay(ctx, t) {
    const gk = ss(T.garden0, T.garden1, t); if (t < T.dark0) return;
    const pr = (x, y, z) => { tmp.set(x, y, z).project(cam); return [(tmp.x + 1) / 2 * W, (1 - tmp.y) / 2 * H]; };
    const a = pr(-3, 14, .05), b = pr(3, 14, .05), c = pr(-3, 0, .05);   // the door's top-left, top-right, bottom-left
    ctx.save(); ctx.setTransform((b[0] - a[0]) / garden.c.width, (b[1] - a[1]) / garden.c.width, (c[0] - a[0]) / garden.c.height, (c[1] - a[1]) / garden.c.height, a[0], a[1]);
    // the doorway fills with light (N26 → N26b), so the garden has a field of light to show in, not the busy room behind
    const gw = garden.c.width, gh = garden.c.height, fk = .32 * ss(T.dark0, T.dark1, t) + .25 * gk;
    if (fk > 0) { const lg = ctx.createRadialGradient(gw / 2, gh * .58, 0, gw / 2, gh * .58, gh * .62); lg.addColorStop(0, `rgba(255,244,220,${fk})`); lg.addColorStop(.6, `rgba(255,232,190,${fk * .7})`); lg.addColorStop(1, 'rgba(255,225,180,0)');
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(0, 0, gw, gh); }
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .42 * gk; ctx.drawImage(garden.c, 0, 0);
    ctx.globalCompositeOperation = 'lighter'; const gx = garden.P0[0] * garden.c.width, gy = garden.P0[1] * garden.c.height, r = 46, gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
    gr.addColorStop(0, `rgba(255,220,130,${.95 * gk})`); gr.addColorStop(.12, `rgba(250,196,96,${.6 * gk})`); gr.addColorStop(.4, `rgba(240,180,80,${.18 * gk})`); gr.addColorStop(1, 'rgba(240,170,70,0)'); ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.fillRect(gx - r, gy - r, 2 * r, 2 * r);
    ctx.restore();
  }

  // ---- the page turn: the front sheet (charcoal) folds away along a line sweeping from the lower right to the upper left;
  //      the turned-over flap shows the back of the paper, with a soft shadow on the new sheet
  const front = mkC(W, H), fctx = front.getContext('2d'), back = mkC(W, H), bctx = back.getContext('2d');
  function pageTurn(ctx, k) {
    k = eio(k); const diag = Math.hypot(W, H), ang = Math.atan2(H, W * .8), nx = Math.cos(ang), ny = Math.sin(ang);
    // fold line: points q with (q − O)·n = d, d moves from beyond the corner (W,H) back past the origin
    const d = lerp(W * nx + H * ny + 40, -80, k), half = q => (q[0] * nx + q[1] * ny) - d;   // > 0: turned
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(back, 0, 0);
    // the part of the front sheet not yet turned
    const L = 3 * diag, px = nx * d, py = ny * d, tx = -ny, ty = nx;
    const keep = [[px + tx * L, py + ty * L], [px - tx * L, py - ty * L], [px - tx * L - nx * L, py - ty * L - ny * L], [px + tx * L - nx * L, py + ty * L - ny * L]];
    ctx.save(); ctx.beginPath(); keep.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.clip(); ctx.drawImage(front, 0, 0);
    // the flap's shadow on the front sheet near the fold
    const sg = ctx.createLinearGradient(px, py, px - nx * 120, py - ny * 120); sg.addColorStop(0, 'rgba(20,14,8,.35)'); sg.addColorStop(1, 'rgba(20,14,8,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H); ctx.restore();
    // the flap: the turned region mirrored across the fold line (back of the paper: plain, lit across the curl)
    const frame = [[0, 0], [W, 0], [W, H], [0, H]], turned = clipHalf(frame, q => half(q) > 0, half);
    if (turned.length > 2) { const refl = turned.map(q => { const s = half(q); return [q[0] - 2 * s * nx, q[1] - 2 * s * ny]; });
      // shadow cast on the new sheet beyond the fold
      ctx.save(); ctx.beginPath(); turned.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.clip();
      const sh = ctx.createLinearGradient(px, py, px + nx * 160, py + ny * 160); sh.addColorStop(0, 'rgba(30,20,10,.45)'); sh.addColorStop(1, 'rgba(30,20,10,0)'); ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.beginPath(); refl.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
      const fg = ctx.createLinearGradient(px, py, px - nx * 260, py - ny * 260); fg.addColorStop(0, '#b9b2a6'); fg.addColorStop(.35, '#ddd7cc'); fg.addColorStop(1, '#cfc8bb');
      ctx.fillStyle = fg; ctx.fill(); ctx.strokeStyle = 'rgba(60,50,40,.25)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }

  // ================================================================ public: one frame at film time t
  function draw(ctx, t, B, o = {}) {
    if (!T) { T = beats(B); tau = makeTau(T); buildMove(); }
    if (t < T.turn0) { if (o.prev) o.prev(ctx, t); return; }
    if (t < T.turn1) { if (o.prev) o.prev(fctx, t); codex(bctx, t); pageTurn(ctx, (t - T.turn0) / (T.turn1 - T.turn0)); return; }
    if (t < T.join0) { codex(ctx, t); return; }
    frame3D(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    if (t < T.join1) { ctx.save(); ctx.globalAlpha = 1 - ss(T.join0, T.join1, t); codex(ctx, t); ctx.restore(); }
    doorOverlay(ctx, t);
  }
  return { film, draw, beats: () => T };
}

// ---------------------------------------------------------------- small helpers
// polygon ∩ half-plane (Sutherland–Hodgman, one edge): keeps points where inside(q); f(q) is the signed distance
function clipHalf(poly, inside, f) {
  const out = []; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], ia = inside(a), ib = inside(b);
    if (ia) out.push(a); if (ia !== ib) { const fa = f(a), fb = f(b), k = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); } }
  return out;
}
// value noise / fbm for the paper (JS)
function hash2(x, y) { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; }
function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function fbm(x, y) { let s = 0, a = .5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, y * f); f *= 2; a *= .5; } return s / .9375; }
const hashGLSL = /* glsl */`
  float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
  float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;
