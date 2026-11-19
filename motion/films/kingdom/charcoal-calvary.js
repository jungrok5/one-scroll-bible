// charcoal-calvary.js — 「kingdom」 5부 「왕이 가신 길」 block 3b: the charcoal cross scene, film 482.8 → 566.8
// (N23c · L8/Q12b · N24 · N24b · Q12a · N24c · N25 · N25d · L8c/Q13a · N25b · Q13 · Q14), the most solemn part of the film.
//
// Look: Gothic charcoal + one red point (review.json looks "8:01–9:29"). After 「Rebecca」 (1940, OPUSCAR 13 — velvet blacks,
// smudged greys, mist and light lifted out with the eraser) and 「Schindler's List」 (1993, OPUSCAR 66 — one red thing in black
// and white: here the title board above the middle cross, Mk 15:26; never close).
// Engine: charcoal-cross.js (the end of this scene, approved with the veil pilot) + kit-charcoal.js (= motion-skills
// canvas-film/kits/charcoal, vendored untouched). This module only passes charcoalCross() its additive options
// (camera, plate transform for the dolly zoom, value-canvas extras, figures) — so at 566.8 the frame IS charcoalCross's frame
// and the veil scene (sample-veil.html, veil-temple.js) continues it without a seam.
// Skills read first (C:/Project/motion-skills): canvas-film kits/charcoal STYLE.md (frame skeleton, palimpsest, "light as
// erasure", "darkness as rubbing", the one colour drawn on), doodle-styles STYLES.md `charcoal` ("erased and redrawn" — the
// disciples' ghost at N24c), cinecode references/camera-moves.md (dolly zoom: 2–4 s, slow, ease-in-out, once per film; same
// subject size, background grows), feeling-pastel lib/tools.js (charcoal/eraser as dry media — no code copied; the kit already
// has stick/finger/eraser). No code copied from them into this file.
//
// ROUND 2 (2026-11-20, coordinator: "84 s of one framing is too static; the bow is invisible"): six framings, each with one
// slow move, joined by soft charcoal smudge dissolves (a fixed noise field thresholded over 1.3 s — never a hard pop):
//   (a) wide establishing, the dark coming down (charcoalCross framing, slow widen)    482.8 – 488.9
//   (b) long lens on the middle cross against big moving cloud masses, slow push 2.3 → 2.55 (the cross ≤ 25 % of the frame;
//       the red point reads, we stay far; N24: all darker but the red point)        487.6 – 500.4
//   (c) lateral truck along the hill below (near slope parallax 1.3×): the left cross out of the dark, the right one enters;
//       the cold eraser rims on "우편에 / 좌편에"                                      499.1 – 514.3
//   (d) the wide frame again: the disciples' ghost, then the dolly zoom (once in the film)   513.1 – 521.5
//   (e) low-angle telephoto on the LEFT (repentant) thief's cross, ~36–39 % of the frame height, slow push, the cloud gap
//       opening behind him, the faint light on him growing; his bow reads on a phone   520.2 – 551.6
//   (f) slow pull-back to charcoalCross's own framing (zm 1.02 + its creep at Q14) — the 0.8 s stillness, the shaft, the
//       hand-off exactly as round 1                                                  550.2 – 566.8
// The close framings are their own drawings at screen scale (the paper tooth is not magnified: it follows only the relative
// push / the truck), drawn with the same charcoal kit, the same cross geometry (charcoalCross.parts) and the same figure pose
// (charcoalCross.pose) as the wide frame. Jesus is never close: in (b) his cross is ≤ 25 % of the frame and his figure is one
// dark backlit mass with his cross (never lit, no face); (e) frames the thief and keeps the middle cross out of frame.
//
// Camera (round 1 notes, still true for the wide framings): before the dolly zoom the crosses sit at 1.2× over the plate at 1.0 (more sky, the crosses a
// little larger — the red point and the rims read on a phone). N24c "그곳에는 십자가가": dolly zoom 3 s, sine ease-in-out —
// the crosses keep their size, the sky behind grows 1.2× and the near ground recedes. Then everything is at 1.2 and drifts back
// to charcoalCross's own framing (zm 1.02 at Q14, its 0.014/s creep after) at ≤ 0.9 %/s — below what reads as a move. The
// paper tooth follows the sky plate (the largest area), so no grain slides over the sky in the dolly zoom.
//
// Motion events (the only ones, besides the light): the penitent thief bows his head at Q13a (silhouette, two-bone IK arms
// with fixed lengths, hands stay on the bar — charcoalCross.pose); the disciples' ghost (N24c) is rubbed in and erased.
// Life without fidgeting: cloud masses drifting 3–7 px/s, mist bands, the light breathing slowly. Nothing is re-seeded per
// frame (no boil): every mark is fixed in the world and moves only with t, so there is no dither flicker.
//
// API: const CV = await (await import('./charcoal-calvary.js')).build(W, H);   (after buildCharcoalCross())
//      CV.draw(ctx, t, B) — t = film seconds; B = line times (Film.lines[id].at) for the ids in IDS.  CV.beats() → the table.
//      CV.tail(t) → the options the veil scene's prev must pass to keep the figures after 566.8 (see the report / film.html).
const C = window.Charcoal, P0 = window.Pilot;
const { clamp, lerp, ss, eio } = P0;
const sine = x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
export const IDS = ['N23c', 'L8', 'Q12b', 'N24', 'N24b', 'Q12a', 'N24c', 'N25', 'N25d', 'L8c', 'Q13a', 'N25b', 'Q13', 'Q14', 'N25c'];

// ---------------------------------------------------------------- the one table: every visual time from the line times
// piece(id, i): when the i-th '/' piece of a line comes up on screen (Film.pieces, the same split the captions use)
function piece(id, i) {
  const F = window.Film, L = F.script.lines, l = F.lines[id], spoken = x => (x.kind === 'narr' || x.kind === 'quote') && x.voice !== null;
  const nx = L.filter(spoken).sort((a, b) => a.at - b.at).find(x => x.at > l.at + .01), b = nx.at - (l.kind === 'quote' ? .1 : .25);
  return F.pieces(F.text(id), l.at, b)[i][1];
}
export function beats(B) {
  const T = {};
  T.dark0 = piece('N23c', 1) - .3; T.dark1 = B.Q12b - .3;              // "결국 십자가에 달리셨습니다": the sky darkens
  T.red0 = B.Q12b + .9; T.red1 = T.red0 + 1.1;                        // "죄패에": the red point is drawn on (pastel pr 0 → 1)
  T.n24a = B.N24 + .4; T.n24b = B.N24 + 3.8;                          // all darker but the red point; the side crosses sink
  T.rev0 = B.N24b + .5; T.rev1 = B.N24b + 3.6;                        // the two side crosses come back out of the dark
  const q2 = piece('Q12a', 1), q2d = B.N24c - .1 - q2;
  T.rimL = q2 + q2d * .3; T.rimR = q2 + q2d * .62; T.rimDur = 1.3;    // "우편에" / "좌편에": a cold eraser rim on each side cross
  T.gh0 = B.N24c + .15; T.gh1 = B.N24c + 1.1;                         // the disciples' ghost rubbed in over the side crosses
  T.dz0 = piece('N24c', 1) + .05; T.dz1 = T.dz0 + 3;                  // "그곳에는 십자가가": the dolly zoom (once in the film)
  T.ghE0 = T.dz0 - 1.5; T.ghE1 = T.dz0 + .2;                          // the ghost erased (top → bottom), gone as the move starts
  T.rimOff0 = B.N24c; T.rimOff1 = B.N24c + 1.4;                       // the rims fade as the ghost comes
  T.pb0 = T.dz1 + 1.5; T.pb1 = B.Q13 - 1;                             // the imperceptible drift back to charcoalCross's framing
  T.tilt0 = piece('N25', 1) + .1; T.tilt1 = T.tilt0 + 3.6;            // "한 사람이 달라졌습니다": the light leans to one cross
  T.faint0 = B.N25d + .4; T.faint1 = B.N25d + 3.6;                    // a very faint light above that cross
  T.bow0 = B.Q13a + 1.3; T.bow1 = T.bow0 + 2.6;                       // he bows his head (2.6 s, eased)
  T.front0 = B.N25b + .3; T.front1 = B.N25b + 4.6;                    // the dark lowers (no time left)
  T.q13a = B.Q13 + .2; T.q13b = B.Q13 + 4;                            // the dark closes in; only between the two crosses
  T.still0 = B.Q14; T.still1 = B.Q14 + .8;                            // 0.8 s stillness (charcoalCross starts its shaft here)
  T.rel0 = B.Q14 + .8; T.rel1 = B.N25c;                               // every extra is released as the shaft comes down
  T.end = B.N25c; T.T0 = B.N23c;
  // round 2: the shots and their dissolves [a, b] (overlaps = smudge dissolves), all from the line times
  T.ab = [B.L8 - .5, B.L8 + .8]; T.bc = [B.N24b - .4, B.N24b + .9]; T.cd = [B.N24c - .5, B.N24c + .7];
  T.de = [B.N25 - .2, B.N25 + 1.1]; T.ef = [B.N25b - .2, B.N25b + 1.2];
  T.gh0 = T.cd[1] - .2; T.gh1 = T.gh0 + .9;                          // (the ghost comes once the wide frame is back)
  T.ghE0 = T.dz0 - .9; T.ghE1 = T.dz0 + .4;                          // (erased as the dolly zoom starts)
  T.SHOTS = [['a', T.T0, T.ab[1]], ['b', T.ab[0], T.bc[1]], ['c', T.bc[0], T.cd[1]], ['d', T.cd[0], T.de[1]], ['e', T.de[0], T.ef[1]], ['f', T.ef[0], T.end + 5]];
  return T;
}

export async function build(W, H) {
  const Pp = window.charcoalCross.parts(), { SC, L, CR, BOARD } = Pp, crest = L.crest;
  const ZC = [W / 2, crest - 60 * SC], PV = [W / 2, crest], ZD = 1.2, QD = 1.12;
  let T = null;
  // ---- camera: Z (crosses), pk (sky plate relative to the crosses), q (near ground), oy
  // wide framings (a, d, f) through charcoalCross: (a)/(d) the round-1 pre-dolly frame (crosses 1.2× over the plate at 1.0,
  // (a) widening 1.06 → 1 as the dark comes down), (d) + the dolly zoom; (f) a decelerating pull-back from ≈ 1.19 that lands on
  // charcoalCross's own camera at Q14 with the same value and slope (1.02, +0.014/s) — no seam when its creep takes over.
  function cam(t, B, shot) {
    if (shot === 'f') { const sq = B.Q14 - t, Z = sq > 0 ? 1.02 - .014 * sq + .0025 * sq * sq : 1.02 - .014 * sq, fz = 1 + (Z - 1) * 1.8;
      return { Z, cam: { zm: Z, zc: ZC, ox: 0, oy: 0 }, fgT: [fz, 0, 0, fz, ZC[0] * (1 - fz), ZC[1] * (1 - fz)], plateT: null, toothCam: null }; }
    const Z = ZD, e = sine((t - T.dz0) / (T.dz1 - T.dz0));
    const pk = Math.exp(lerp(Math.log(1 / Z), 0, e)), q = Math.exp(lerp(Math.log(QD), 0, e));
    const oy = -60 * SC * (Z - 1);
    const s = Z * pk, offx = ZC[0] * (1 - Z) + PV[0] * (1 - pk) * Z, offy = ZC[1] * (1 - Z) + PV[1] * (1 - pk) * Z + oy;
    const fz = (1 + (Z - 1) * 1.8) * q;
    const c = 1 + .06 * (1 - sine((t - T.T0) / (T.ab[1] - T.T0)));
    const cmp = (k, ox, oy2) => [k * c, 0, 0, k * c, ZC[0] * (1 - c) + ox * c, ZC[1] * (1 - c) + oy2 * c];
    const PT = cmp(s, offx, offy);
    // (the tooth lookup keeps a half-pixel offset: at an exact round zoom every sample lies on a pixel edge and the first tiny
    //  change flips a whole set of columns — a one-frame grain jump; found in round 1 at the dolly zoom's start and end)
    return { Z: Z * c, plateT: PT, fgT: cmp(fz, ZC[0] * (1 - fz), ZC[1] * (1 - fz) + oy),
      cam: { zm: Z * c, zc: ZC, ox: 0, oy: oy * c }, toothCam: { zm: s * c, zc: ZC, ox: PT[4] - ZC[0] * (1 - s * c) + .5, oy: PT[5] - ZC[1] * (1 - s * c) + .5 } };
  }
  // ---- fixed marks (seeded once; they only move with t)
  const R = P0.rng(5150);
  const clouds = Array.from({ length: 9 }, (_, i) => ({ x: lerp(-300, W + 300, (i + R() * .6) / 9), y: lerp(H * .02, crest * .78, R()), rx: (260 + R() * 260) * SC,
    ry: (70 + R() * 70) * SC, a: .07 + R() * .07, v: (i % 2 ? -1 : 1) * (2.5 + R() * 4) * SC, rot: (R() - .5) * .25, lift: i % 3 === 2 }));
  const frontBlobs = Array.from({ length: 14 }, (_, i) => ({ x: lerp(-120, W + 120, i / 13) + (R() - .5) * 60, dy: (R() - .5) * 50 * SC, rx: (150 + R() * 120) * SC, ry: (50 + R() * 40) * SC }));
  // live cloud masses: two layers drifting at two speeds, each mass slowly forming and thinning (its own 8–15 s breath), so the
  // sky lives everywhere without anything fast. Wrapped well outside the frame (no pop).
  const CL = []; { const r = P0.rng(902);
    for (let layer = 0; layer < 2; layer++) for (let i = 0; i < 30; i++) { const lift = i % 5 >= 3;
      CL.push({ x0: r() * (W + 1200 * SC), y: Math.pow(r(), lift ? 1.2 : .85) * (crest - 40 * SC), rx: lerp(layer ? 150 : 230, layer ? 340 : 520, r()) * SC, f: .26 + r() * .22,
        a: (lift ? .16 : .2) + r() * .14, v: (layer ? 19 : 9) * SC * (.85 + r() * .3), w: 2 * Math.PI / (8 + r() * 7), ph: r() * 6.28, rot: (r() - .5) * .3, lift }); } }
  // round 2: the near-ground lifts (frame px of the near-ground sheet, which charcoalCross draws from 0.6 H down)
  const FGB = [], FGRASS = []; { const r = P0.rng(4471);
    for (let i = 0; i < 16; i++) FGB.push({ x: lerp(-60, W + 60, (i + r() * .7) / 16), y: H * (.63 + r() * .32), rx: (300 + r() * 260) * SC, ry: (26 + r() * 30) * SC, a: .28 + r() * .16, rot: (r() - .5) * .08 });
    for (let i = 0; i < 46; i++) { const gx = r() * W, gy = H * (.61 + r() * .1), h = (18 + r() * 40) * SC, lean = (r() - .45) * 16 * SC;
      FGRASS.push({ pts: [[gx, gy], [gx + lean * .4, gy - h * .55], [gx + lean, gy - h]], w: (1.6 + r() * 1.2) * SC, a: .35 + r() * .35, seed: 5200 + i }); } }
  const gap = [CR[0].x + 40 * SC, H * .2];
  const leftTop = [CR[0].x, CR[0].y - CR[0].h * .74];
  const between = [(CR[0].x + CR[1].x) / 2, crest - 120 * SC];

  // outline of one cross (+ its figure's head) for the rim light, as one path the rim is drawn along
  function rimPath(i) {
    const k = CR[i], w = 7 * SC, bar = k.y - k.h * .74, bw = w * .8, p = window.charcoalCross.pose(i, 0);
    const pts = [[k.x - w, k.y], [k.x - w * .85, bar + bw], [k.x - k.a, bar + bw], [k.x - k.a - 1, bar - bw], [p.head[0] - p.hr * 1.3, bar - bw],
      [p.head[0] - p.hr, p.head[1] - p.hr * .6], [p.head[0], p.head[1] - p.hr * 1.1], [p.head[0] + p.hr, p.head[1] - p.hr * .6], [p.head[0] + p.hr * 1.3, bar - bw],
      [k.x - w * .8, bar - bw], [k.x - w * .8, k.y - k.h], [k.x + w * .8, k.y - k.h], [k.x + w * .8, bar - bw], [k.x + k.a + 1, bar - bw], [k.x + k.a, bar + bw],
      [k.x + w * .85, bar + bw], [k.x + w, k.y]];
    // even steps, so the draw-on runs at an even speed
    const out = [pts[0]]; for (let j = 1; j < pts.length; j++) { const a = pts[j - 1], b = pts[j], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / (6 * SC))); for (let m = 1; m <= n; m++) out.push([lerp(a[0], b[0], m / n), lerp(a[1], b[1], m / n)]); }
    return out;
  }
  const RIMS = [rimPath(0), rimPath(2)];
  // the disciples' ghost (from the woodcut scene: two men who asked for the right and the left): standing over the side
  // crosses, hooded to the shoulder, belted robe, one arm out toward the middle (asking). Frame px around a foot point.
  function ghost(x, foot, hgt, dir) {
    const u = hgt / 200, X = v => foot[0] + v * u * dir, Y = v => foot[1] - v * u;
    C.poly(x, [[X(-26), Y(0)], [X(-20), Y(70)], [X(-23), Y(128)], [X(-21), Y(150)], [X(-12), Y(158)], [X(-11), Y(172)], [X(-6), Y(184)], [X(4), Y(186)], [X(11), Y(176)], [X(12), Y(160)],
      [X(22), Y(151)], [X(24), Y(128)], [X(21), Y(70)], [X(27), Y(0)]]);
    x.fill();
    // the asking arm: shoulder → elbow (down) → hand reaching toward the middle
    x.lineCap = 'round'; x.lineWidth = 9 * u; x.beginPath(); x.moveTo(X(18), Y(146)); x.lineTo(X(34), Y(118)); x.lineTo(X(58), Y(124)); x.stroke(); x.lineCap = 'butt';
  }

  function opts(t, B, shot) {
    const cm = cam(t, B, shot), rel = ss(T.rel0, T.rel1, t), keep = 1 - rel;
    const o = {};
    if (t < B.Q14) { o.cam = cm.cam; if (cm.plateT) Object.assign(o, { plateT: cm.plateT, toothCam: cm.toothCam, fgT: cm.fgT }); }
    const plate = x => { if (t < B.Q14 && cm.plateT) x.setTransform(...cm.plateT); else C.applyCam(x); };   // (in (f) the plate is under the camera, as charcoalCross)
    const crossCam = x => C.applyCam(x);
    // ---- levels (0..1), each a smooth function of t
    const open = 1 - ss(T.dark0, T.dark1, t);                                     // the brighter sky at the start
    const n24 = ss(T.n24a, T.n24b, t) * (1 - ss(T.rev0 - .3, T.rev1 + 3, t) * .7) * keep;  // the darker frame (partly kept, released with the shaft)
    const sink = ss(T.n24a, T.n24b, t) * (1 - ss(T.rev0, T.rev1, t));              // the side crosses swallowed
    const reveal = ss(T.rev0, T.rev1, t) * (1 - ss(T.dz0, T.dz1 + 2, t) * .6) * keep;     // mist lifted behind them
    const cover = (lerp(.62, .45, ss(T.tilt0, T.tilt1, t)) - .07 * ss(T.faint0, T.faint1, t) + .14 * ss(T.q13a, T.q13b, t)) * keep;   // over the cloud gap (closes again in Q13's dark)
    // (+ when he bows, the light above him deepens a little: on a phone from far away the light carries what the small head does)
    const haze = (.1 * ss(T.tilt0, T.tilt1, t) + .1 * ss(T.faint0, T.faint1, t) + .07 * ss(T.bow0 + .4, T.bow1 + .6, t)) * (1 - .2 * ss(T.front0, T.front1, t)) * (1 - .6 * ss(T.q13a, T.q13b, t)) * keep;
    const front = ss(T.front0, T.front1, t) * keep, vig = ss(T.q13a, T.q13b, t) * keep;
    const life = keep;                                                            // drifting cloud masses, released with the shaft
    const breathe = .92 + .08 * Math.sin(t * .9);
    // the general lift (charcoal is dark; the film's bar is far brighter): mist over the sky and the slope, lifted with the
    // eraser — less in the dark beats, released with the shaft (its light and the open vignette take over)
    const skyLift = (.27 + .1 * open) * (1 - .3 * n24) * (1 - .1 * vig) * (1 - .15 * front) * keep;
    const hillLift = .26 * keep;

    o.sky = (x) => {
      plate(x);
      // drifting cloud masses (rubbed tone and soft lifts) — part of the sky, so they grow with it in the dolly zoom
      for (const c of clouds) C.blob(x, c.x + c.v * (t - 482.8), c.y, c.rx, c.ry, c.a * life * (c.lift ? 1.3 : 1), c.rot, c.lift ? C.smudgeW : C.smudge);
      { const span = W + 1200 * SC, tt = t - 482.8;
        for (const c of CL) { const xx = ((c.x0 + c.v * tt) % span + span) % span - 600 * SC, br = .62 + .38 * Math.sin(c.w * tt + c.ph), sz = 1 + .07 * Math.sin(c.w * .7 * tt + c.ph * 1.3);
          const fade = 1 - ss(crest - 260 * SC, crest - 40 * SC, c.y);   // thinner toward the horizon band (the plate's own mist stays)
          C.blob(x, xx, c.y, c.rx * sz, c.rx * c.f * sz, c.a * br * life * (.35 + .65 * fade), c.rot, c.lift ? C.smudgeW : C.smudge); } }
      // the brighter sky at the start (N23c) — lifted, then rubbed back
      if (skyLift > 0) { C.blob(x, W * .5, crest - 150 * SC, 950 * SC, 420 * SC, skyLift * 1.2, 0, C.smudgeW); C.blob(x, W * .42, H * .2, 760 * SC, 330 * SC, skyLift, .1, C.smudgeW);
        C.blob(x, W * .75, H * .1, 600 * SC, 260 * SC, skyLift * .7, -.15, C.smudgeW); }
      // N23c "하늘이 어두워짐": the dark comes down from the top (rubbed tone, a soft ragged front), and stays (released with the shaft)
      { const dk = ss(T.dark0, T.dark1, t) * keep; if (dk > 0) { const fy = lerp(-.12 * H, H * .14, eio(ss(T.dark0, T.dark1, t))), g = x.createLinearGradient(0, fy - 300 * SC, 0, fy + 60 * SC);
        g.addColorStop(0, `rgba(${C.TONE},${.17 * dk})`); g.addColorStop(1, `rgba(${C.TONE},0)`); x.fillStyle = g; x.fillRect(-300, fy - 300 * SC, W + 600, 360 * SC);
        x.fillStyle = `rgba(${C.TONE},${.17 * dk})`; x.fillRect(-300, -600, W + 600, fy - 300 * SC + 600);
        for (const b of frontBlobs) C.blob(x, b.x, fy - 80 * SC - b.dy, b.rx * .9, b.ry, .16 * dk); } }
      // the cloud gap: closed at first, opening by steps (N25, N25d), fully the plate's own gap when the shaft starts
      if (cover > 0) { C.blob(x, gap[0], gap[1], 230 * SC, 110 * SC, cover, -.2); C.blob(x, gap[0] - 10 * SC, gap[1], 120 * SC, 50 * SC, cover * .8, -.2); }
      // N24: the band behind the side crosses sinks (they vanish into the dark); N24b: lifted again
      if (sink > 0) for (const i of [0, 2]) C.blob(x, CR[i].x + (i ? 40 : -40) * SC, crest - 80 * SC, 260 * SC, 190 * SC, .42 * sink);
      // the light wandering slowly along the mist band behind the hill (two soft lifts, 9 s and 13 s breaths)
      { const tt = t - 482.8; for (const [px, per, ph, a] of [[.3, 9, 0, .1], [.72, 13, 2.1, .09]]) {
        const k = .5 + .5 * Math.sin(2 * Math.PI * tt / per + ph), xx = W * px + Math.sin(2 * Math.PI * tt / (per * 3.1) + ph) * 120 * SC;
        C.blob(x, xx, crest - 70 * SC, 360 * SC, 110 * SC, a * (.35 + .65 * k) * life * (1 - .6 * sink), 0, C.smudgeW); } }
      if (reveal > 0) for (const i of [0, 2]) C.blob(x, CR[i].x, crest - 75 * SC, 110 * SC, 90 * SC, .3 * reveal, 0, C.smudgeW);
      // N25b: the dark lowers from the top
      if (front > 0) { const fy = lerp(-.05 * H, H * .28, eio(front)), g = x.createLinearGradient(0, fy - 260 * SC, 0, fy + 40 * SC);
        g.addColorStop(0, `rgba(${C.TONE},${.14 * front})`); g.addColorStop(1, `rgba(${C.TONE},0)`);
        x.fillStyle = g; x.fillRect(-300, fy - 260 * SC, W + 600, 300 * SC); x.fillStyle = `rgba(${C.TONE},${.14 * front})`; x.fillRect(-300, -500, W + 600, fy - 260 * SC + 500);
        for (const b of frontBlobs) C.blob(x, b.x, fy - 60 * SC + b.dy, b.rx, b.ry, .2 * front); }
    };
    o.light = (x) => {
      // N25 → N25d: a faint haze leaning from the gap toward the left cross (on its axis: the light goes to the one who changed)
      // (soft lifted clouds, not a beam: the one beam is Q14's)
      if (haze > .002) { const a = gap, b = [leftTop[0] - 6 * SC, leftTop[1] - 60 * SC];
        crossCam(x); const hb = haze * breathe;
        C.blob(x, a[0], a[1] + 10 * SC, 220 * SC, 120 * SC, hb, -.2, C.smudgeW);
        C.blob(x, b[0] - 30 * SC, b[1] - 10 * SC, 260 * SC, 150 * SC, hb * .9, -.35, C.smudgeW); }
    };
    o.figures = { bow: ss(T.bow0, T.bow1, t) > 0 ? sineBow(t) : 0, rim: (.7 * ss(T.faint0, T.faint1, t) + .3 * ss(T.bow0, T.bow1, t)) * keep };
    o.rim = (x) => {
      // Q12a: the cold rims on the two side crosses, drawn along their outline (eraser), fading as the ghost comes
      const off = 1 - ss(T.rimOff0, T.rimOff1, t);
      for (let j = 0; j < 2; j++) { const pr = clamp((t - (j ? T.rimR : T.rimL)) / T.rimDur); if (pr <= 0 || off <= 0) continue;
        const pts = RIMS[j], n = Math.max(2, Math.ceil(eio(pr) * pts.length)); crossCam(x);
        C.glowLine(x, pts.slice(0, n), off, 4200 + j * 10, { w: [9 * SC, 3.4 * SC, 1.5 * SC], al: [.08, .26, .8], brk: [.05, .08, .14] }); }
      // N24c: the disciples' ghost over the side crosses — rubbed in, then erased from the top down
      const gin = ss(T.gh0, T.gh1, t), ger = ss(T.ghE0, T.ghE1, t);
      if (gin > 0 && ger < 1) C.layer(x, l => {
        l.fillStyle = `rgba(${C.TONE},1)`; l.strokeStyle = `rgba(${C.TONE},1)`;
        const drift = ss(T.gh0, T.ghE1, t) * 6 * SC;
        ghost(l, [CR[0].x - 30 * SC + drift, CR[0].y + 6 * SC], CR[0].h * 1.5, 1);
        ghost(l, [CR[2].x + 30 * SC - drift, CR[2].y + 6 * SC], CR[2].h * 1.5, -1);
        if (ger > 0) { const top = Math.min(CR[0].y, CR[2].y) - CR[0].h * 1.6, bot = Math.max(CR[0].y, CR[2].y) + 10 * SC, ey = lerp(top - 60 * SC, bot + 60 * SC, eio(ger));
          l.globalCompositeOperation = 'destination-out'; const g = l.createLinearGradient(0, ey - 60 * SC, 0, ey + 30 * SC);
          g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g; l.fillRect(-200, top - 400, W + 400, ey + 30 * SC - top + 400); }
      }, { blur: 3, alpha: .5 * gin });
    };
    o.mist = (x) => {
      // a lower, slower mist over the near slope (keeps the frame from sinking to black; released with the shaft)
      crossCam(x); C.fog(x, t, [[crest + 250 * SC, .36 * life, 14], [crest + 120 * SC, .22 * life, -10], [crest - 40 * SC, .16 * life * (1 - .5 * sink), -8]]);
      if (hillLift > 0) for (let i = 0; i < 4; i++) C.blob(x, W * (.12 + .26 * i) + Math.sin(t * .05 + i) * 30 * SC, crest + (150 + 40 * (i % 2)) * SC, 380 * SC, 120 * SC, hillLift, 0, C.smudgeW);
    };
    o.over = (x) => {
      // round 2 — the near ground is no longer a velvet-black slab: eraser lifts over it, grass catching the light, mist pooling
      // in the hollow below the crest; all in the near ground's own frame (it moves with it), released with the shaft
      const fl = keep; if (fl > 0) { x.setTransform(...cm.fgT);
        for (const b of FGB) C.blob(x, b.x, b.y, b.rx, b.ry, b.a * fl, b.rot, C.smudgeW);
        for (const g of FGRASS) C.vine(x, g.pts, g.w, g.a * fl, g.seed, '#fff', 0);
        C.applyCam(x); C.fog(x, t, [[crest + 330 * SC, .42 * fl, 7], [crest + 440 * SC, .3 * fl, -5]]); }
      x.setTransform(1, 0, 0, 1, 0, 0);
      // N24: everything darker except around the red point (a soft vignette, kept partly after)
      if (n24 > 0) { const b = C.toScr(BOARD), g = x.createRadialGradient(b[0], b[1], 60 * SC, b[0], b[1], 900 * SC);
        g.addColorStop(0, `rgba(${C.TONE},0)`); g.addColorStop(.5, `rgba(${C.TONE},${.12 * n24})`); g.addColorStop(1, `rgba(${C.TONE},${.24 * n24})`);
        x.fillStyle = g; x.fillRect(0, 0, W, H); }
      // Q13: the dark closes in; only the space between the middle and the left cross stays (where the light will come)
      if (vig > 0) { C.applyCam(x); C.blob(x, between[0], between[1] - 30 * SC, 280 * SC, 300 * SC, .32 * vig, 0, C.smudgeW); x.setTransform(1, 0, 0, 1, 0, 0); }
      if (vig > 0) { const c = C.toScr(between), g = x.createRadialGradient(c[0], c[1], 90 * SC, c[0], c[1], 760 * SC);
        g.addColorStop(0, `rgba(${C.TONE},0)`); g.addColorStop(.55, `rgba(${C.TONE},${.07 * vig})`); g.addColorStop(1, `rgba(${C.TONE},${.17 * vig})`);
        x.fillStyle = g; x.fillRect(0, 0, W, H); }
    };
    // the red point: drawn on at Q12b; before it the board is dark
    o.redPr = t < T.red0 ? 0 : eio(clamp((t - T.red0) / (T.red1 - T.red0)));
    o.redFade = 1;
    return o;
  }
  const sineBow = t => sine((t - T.bow0) / (T.bow1 - T.bow0));

  // ================================================================ round 2: the close framings (b), (c), (e)
  // Their cameras: base frame px (the wide frame's coordinates, so the same crosses, ridge and pose) → screen, by scale k about
  // base point P landing on screen point S. One slow move each.
  function shotCam(t, id) {
    if (id === 'b') { const e = sine((t - T.ab[0]) / (T.bc[1] - T.ab[0])); return { k: lerp(2.3, 2.55, e), P: [CR[1].x, 809 * SC], S: [W / 2, H * .42], k0: 2.3, shift: 0 }; }
    if (id === 'c') { const e = sine((t - T.bc[0]) / (T.cd[1] - T.bc[0])), cx = lerp(420, 560, e) * SC; return { k: 2.6, P: [cx, 830 * SC], S: [W / 2, H * .4], k0: 2.6, shift: (cx - 420 * SC) * 2.6 }; }
    const e = sine((t - T.de[0]) / (T.ef[1] - T.de[0])); return { k: lerp(4.5, 4.95, e), P: [CR[0].x, 837 * SC], S: [W * .62, H * .43], k0: 4.5, shift: 0 };
  }
  // fixed marks of the close framings, all in base px (fixed in the world: they move only with the camera → no flicker)
  const RID = []; for (let xx = 60; xx <= W - 60; xx += 3 * SC) RID.push([xx, Pp.ridgeY(xx)]);
  const HB = [], TUFT = [], NEAR = [], NGR = []; { const r = P0.rng(7313);
    for (let i = 0; i < 46; i++) HB.push({ x: lerp(120, W - 120, r()), y: crest + (20 + r() * 420) * SC, rx: (70 + r() * 150) * SC, ry: (5 + r() * 9) * SC, a: .12 + r() * .2, lift: i % 3 === 0 });
    for (let i = 0; i < 90; i++) { const tx = lerp(150, W - 150, r()); if (CR.some(c => Math.abs(c.x - tx) < 9 * SC)) continue;
      TUFT.push({ x: tx, n: 2 + (r() * 3 | 0), h: (4 + r() * 9) * SC, lean: (r() - .5) * 5 * SC, seed: 6100 + i, lift: r() < .25 }); }
    // the near slope of the truck shot (its own coordinates: screen px + parallax offset)
    for (let i = 0; i < 30; i++) NEAR.push({ x: r() * (W + 900), y: H * (.66 + r() * .3), rx: (200 + r() * 260), ry: (18 + r() * 26), a: .14 + r() * .18, lift: i % 2 === 0 });
    for (let i = 0; i < 70; i++) { const gx = r() * (W + 900), h = 30 + r() * 80; NGR.push({ x: gx, h, lean: (r() - .45) * 30, w: 2 + r() * 2.5, seed: 6400 + i, lift: r() < .3 }); } }
  const GAPB = [], GAPD = []; { const r = P0.rng(8123);   // the cloud gap of (e): ragged lifts + the dark edges of the clouds around it
    for (let i = 0; i < 9; i++) GAPB.push([(r() - .5) * 260 * SC, (r() - .5) * 90 * SC, (60 + r() * 150) * SC, (16 + r() * 34) * SC, .22 + r() * .25, -.3 + (r() - .5) * .5]);
    for (let i = 0; i < 7; i++) { const an = r() * 6.28; GAPD.push([Math.cos(an) * 230 * SC, Math.sin(an) * 110 * SC, (120 + r() * 120) * SC, (40 + r() * 40) * SC, .22 + r() * .14, (r() - .5) * .6]); } }
  const nearTop = xs => H * .645 + (P0.noise(xs / W * 2.2, 3.3) - .5) * 90 * SC + Math.sin(xs / W * 2.6) * 26 * SC;

  // one cross as vector charcoal at any scale (the same geometry as charcoal-cross.js buildCrosses): rubbed near-black wood,
  // a stick sweep along the upright, broken vine edges (screen widths, not magnified), the foot in the ground
  function crossVec(x, i, k) {
    const c = CR[i], w = 7 * SC, bar = c.y - c.h * .74, sw = 1 / k;
    C.tone(x, [[c.x - w, c.y + 6 * SC], [c.x - w * .8, c.y - c.h], [c.x + w * .8, c.y - c.h], [c.x + w, c.y + 6 * SC]], .95);
    C.tone(x, [[c.x - c.a, bar - w * .8], [c.x + c.a, bar - w * .7], [c.x + c.a, bar + w * .7], [c.x - c.a, bar + w * .8]], .95);
    C.sweep(x, [[c.x, c.y], [c.x, c.y - c.h]], w * 2.2, .8, 700 + i * 7);
    C.sweep(x, [[c.x - c.a, bar], [c.x + c.a, bar]], w * 1.6, .6, 703 + i * 7);
    C.vine(x, [[c.x - w, c.y], [c.x - w * .8, c.y - c.h]], 3 * sw, .85, 705 + i * 7); C.vine(x, [[c.x + w, c.y], [c.x + w * .8, c.y - c.h]], 3 * sw, .85, 706 + i * 7);
    C.blob(x, c.x, c.y + 6 * SC, 30 * SC, 8 * SC, .7);
    if (i === 1) { const b = BOARD; C.tone(x, [[b[0] - 13 * SC, b[1] - 9 * SC], [b[0] + 13 * SC, b[1] - 9 * SC], [b[0] + 13 * SC, b[1] + 8 * SC], [b[0] - 13 * SC, b[1] + 8 * SC]], .9); }
  }
  // one crucified figure as a close silhouette (charcoalCross.pose: the same joints as the far figures, two-bone IK arms with
  // fixed lengths, elbows below the shoulder–hand line). Tapered limbs, hands closed on the bar, loincloth, bent knees, feet
  // together; short hair and a beard line for a man; no face, no detail inside — one soft charcoal mass (half-res layer, blur)
  function figVec(x, i, bow, val) {
    const p = window.charcoalCross.pose(i, bow), c = p.k, bar = p.bar, u = SC, kn = i === 2 ? -1 : 1, sg = p.sag;
    C.layer(x, l => {
      const v = Math.round(255 * (1 - val)); l.fillStyle = `rgb(${v},${v},255)`;
      const limb = (a, b, wa, wb) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        l.beginPath(); l.moveTo(a[0] + nx * wa / 2, a[1] + ny * wa / 2); l.lineTo(b[0] + nx * wb / 2, b[1] + ny * wb / 2); l.lineTo(b[0] - nx * wb / 2, b[1] - ny * wb / 2); l.lineTo(a[0] - nx * wa / 2, a[1] - ny * wa / 2); l.closePath(); l.fill();
        l.beginPath(); l.arc(a[0], a[1], wa / 2, 0, 7); l.fill(); l.beginPath(); l.arc(b[0], b[1], wb / 2, 0, 7); l.fill(); };
      for (let s2 = 0; s2 < 2; s2++) { limb(p.sh[s2], p.el[s2], 5.6 * u, 4.3 * u); limb(p.el[s2], p.hd[s2], 4.3 * u, 3.1 * u);
        l.beginPath(); l.ellipse(p.hd[s2][0], p.hd[s2][1] - .4 * u, 2.6 * u, 2.2 * u, 0, 0, 7); l.fill(); }
      // chest wider than the waist (shoulders, ribcage, a narrow waist, the hips), a little sag with the bow
      C.poly(l, [[p.sh[0][0] - .8 * u, p.sh[0][1] - 1.4 * u], [c.x, p.sh[0][1] - 2.2 * u], [p.sh[1][0] + .8 * u, p.sh[1][1] - 1.4 * u], [c.x + 10.8 * u, bar + 8 * u + sg], [c.x + 10 * u, bar + 18 * u + sg * .8],
        [c.x + 6.6 * u, bar + 33 * u + sg * .4], [c.x + 7.4 * u, bar + 42 * u], [c.x - 7.4 * u, bar + 42 * u], [c.x - 6.6 * u, bar + 33 * u + sg * .4], [c.x - 10 * u, bar + 18 * u + sg * .8], [c.x - 10.8 * u, bar + 8 * u + sg]]); l.fill();
      // loincloth: wrapped, knotted on one side, one end hanging
      C.poly(l, [[c.x - 8.2 * u, bar + 38 * u], [c.x + 8.2 * u, bar + 38 * u], [c.x + 8.8 * u, bar + 46 * u], [c.x + 5.4 * u, bar + 49 * u], [c.x + 4.4 * u, bar + 57 * u], [c.x + 2 * u, bar + 50 * u], [c.x - 5.5 * u, bar + 49.5 * u], [c.x - 8.8 * u, bar + 46.5 * u]]); l.fill();
      const hipL = [c.x - 3.6 * u, bar + 46 * u], hipR = [c.x + 3.6 * u, bar + 46 * u], knL = [c.x + kn * 5.6 * u, bar + 67 * u], knR = [c.x + kn * 8.2 * u, bar + 66 * u], anL = [c.x - 1 * u, bar + 86 * u], anR = [c.x + 1.6 * u, bar + 86 * u];
      limb(hipL, knL, 6 * u, 4.6 * u); limb(knL, anL, 4.6 * u, 3 * u); limb(hipR, knR, 5.8 * u, 4.4 * u); limb(knR, anR, 4.4 * u, 2.9 * u);
      C.poly(l, [[c.x - 2.6 * u, bar + 85 * u], [c.x + 3.4 * u, bar + 85 * u], [c.x + 2.4 * u, bar + 91 * u], [c.x - 1.6 * u, bar + 91 * u]]); l.fill();
      limb([p.neck[0], p.neck[1] + 2 * u], p.head, 4.4 * u, 3.8 * u);
      l.globalAlpha = .5; C.sweep(l, [[c.x - 3 * u, bar + 6 * u + sg], [c.x - 2.4 * u, bar + 44 * u]], 5 * u, .5, 7800 + i, C.stickW); C.sweep(l, [[c.x + 3.4 * u, bar + 8 * u + sg], [c.x + 2.6 * u, bar + 42 * u]], 4 * u, .4, 7810 + i); l.globalAlpha = 1;
      const hr = p.hr * .8;   // (closer, the head at a man's proportion to the shoulders; the far figures keep theirs)
      l.beginPath(); l.ellipse(p.head[0], p.head[1], hr, hr * 1.14, p.tilt, 0, 7); l.fill();
      const bd = Math.max(0, Math.cos(p.phi * .8)); if (bd > .05) { const bx = p.head[0] - Math.sin(p.tilt) * hr * .7, by = p.head[1] + Math.cos(p.tilt) * hr * .74 * bd;
        l.beginPath(); l.ellipse(bx, by, hr * .74, hr * .55 * bd, p.tilt, 0, 7); l.fill(); }   // the beard line (hidden as the chin goes to the chest)
    }, { blur: 1.1 });
    return p;
  }
  function figRim(x, p, a, k) {   // the light from the upper left on his head, shoulder, arm and side (eraser lines, screen width)
    if (a <= 0) return; const sw = 1 / k, r = p.hr * .82, arc = [];   // (only the left side of the head — never a crescent over it: no halo)
    for (let j = 0; j <= 8; j++) { const an = lerp(Math.PI * .8, Math.PI * 1.28, j / 8) + p.tilt; arc.push([p.head[0] + Math.cos(an) * r, p.head[1] + Math.sin(an) * r * 1.14]); }
    C.glowLine(x, arc, a * .8, 4300, { w: [8 * sw, 3 * sw, 1.6 * sw], al: [.1, .3, .8], brk: [0, .05, .1] });
    const s0 = p.sh[0], e0 = p.el[0], h0 = p.hd[0];
    C.glowLine(x, [[s0[0] + 2 * SC, s0[1] - 2.6 * SC], [lerp(s0[0], e0[0], .5), lerp(s0[1], e0[1], .5) - 2.3 * SC], [e0[0], e0[1] - 2.1 * SC], [lerp(e0[0], h0[0], .6), lerp(e0[1], h0[1], .6) - 1.7 * SC]], a * .85, 4310, { w: [8 * sw, 3 * sw, 1.6 * sw], al: [.1, .3, .8], brk: [0, .05, .1] });
  }

  // the levels the close framings share with the wide ones (same times, same easing)
  function lv(t) { const n24 = ss(T.n24a, T.n24b, t) * (1 - ss(T.rev0 - .3, T.rev1 + 3, t) * .7);
    return { n24, sink: ss(T.n24a, T.n24b, t) * (1 - ss(T.rev0, T.rev1, t)), reveal: ss(T.rev0, T.rev1, t),
      tilt: ss(T.tilt0, T.tilt1, t), faint: ss(T.faint0, T.faint1, t), bowL: ss(T.bow0 + .4, T.bow1 + .6, t), front: ss(T.front0, T.front1, t),
      rimOff: 1 - ss(T.rimOff0, T.rimOff1, t), breathe: .92 + .08 * Math.sin(t * .9) }; }

  function closeShot(ctx, t, B, id) {
    const sc = shotCam(t, id), k = sc.k, L2 = lv(t), tt = t - 482.8, x = C.begin();
    C.setCam({ zm: k, zc: sc.P, ox: sc.S[0] - sc.P[0], oy: sc.S[1] - sc.P[1] });
    const scr = p => [sc.S[0] + (p[0] - sc.P[0]) * k, sc.S[1] + (p[1] - sc.P[1]) * k], hz = scr([0, crest])[1];
    // ---- sky (screen px): rubbed tone, heavier toward the top; long-lens cloud masses, big and slow, drifting and breathing
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = `rgba(${C.TONE},.5)`; x.fillRect(0, 0, W, H);
    { const g = x.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, `rgba(${C.TONE},.3)`); g.addColorStop(.6, `rgba(${C.TONE},.06)`); g.addColorStop(1, `rgba(${C.TONE},0)`); x.fillStyle = g; x.fillRect(0, 0, W, hz); }
    { const sk = id === 'e' ? 1.9 : 1.6, par = id === 'c' ? .3 : 0, span = (W + 1200 * SC) * sk;
      for (const c of CL) { const xx = (((c.x0 + c.v * tt * .8) * sk - sc.shift * par) % span + span) % span - 600 * SC * sk, yy = c.y / crest * hz * .95 - 40 * SC;
        const br = .62 + .38 * Math.sin(c.w * tt + c.ph), sz = sk * (1 + .07 * Math.sin(c.w * .7 * tt + c.ph * 1.3));
        C.blob(x, xx, yy, c.rx * sz, c.rx * c.f * sz, c.a * br * 1.15, c.rot, c.lift ? C.smudgeW : C.smudge); } }
    // the pale mist band behind the crest (the crosses stand dark against it), breathing slowly
    for (let j = 0; j < 6; j++) { const span = W * 1.2, bx = ((W * (.2 * j) - sc.shift * .6) % span + span) % span - W * .1;
      C.blob(x, bx, hz - (55 + 20 * Math.sin(j * 1.7)) * SC * Math.sqrt(k), 420 * SC, 120 * SC * Math.sqrt(k), .5 + .06 * Math.sin(tt * .5 + j), 0, C.smudgeW); }
    if (id === 'b') {   // N24: the side crosses' part of the band sinks; the frame darkens but for the red point
      if (L2.sink > 0) for (const i of [0, 2]) { const q = scr([CR[i].x, CR[i].y - CR[i].h * .5]); C.blob(x, q[0], q[1], 260 * SC, 420 * SC, .5 * L2.sink); } }
    if (id === 'c') {   // N24b: out of the dark — lifts behind each side cross as it comes into the light
      for (const i of [0, 2]) { const rv = i ? ss(T.rev0 + 3, T.rev1 + 4.5, t) : L2.reveal, q = scr([CR[i].x, CR[i].y - CR[i].h * .55]);
        if (rv > 0) C.blob(x, q[0], q[1], 300 * SC, 420 * SC, .38 * rv, 0, C.smudgeW); if (rv < 1) C.blob(x, q[0], q[1], 280 * SC, 440 * SC, .3 * (1 - rv)); } }
    if (id === 'e') {   // the cloud gap above-left of him opening (N25 → N25d → the bow), and a soft light leaning down to him (not a beam)
      const op = .2 + .35 * L2.tilt + .25 * L2.faint + .2 * L2.bowL, g0 = [W * .2, H * .17];
      for (const [dx, dy, rx, ry, a, rot] of GAPB) C.blob(x, g0[0] + dx * (.6 + .5 * op), g0[1] + dy * (.6 + .5 * op), rx * (.55 + .6 * op), ry * (.55 + .6 * op), a * (.35 + .65 * op), rot, C.smudgeW);
      for (const [dx, dy, rx, ry, a, rot] of GAPD) C.blob(x, g0[0] + dx, g0[1] + dy, rx, ry, a * (1 - .5 * op), rot);   // the cloud edges around it, thinning as it opens
      const hd = scr(window.charcoalCross.pose(0, 0).head), ha = (.08 + .14 * L2.tilt + .14 * L2.faint + .1 * L2.bowL) * L2.breathe;
      const keepCam = C.cam; C.cam = { zm: 1, zc: [0, 0], ox: 0, oy: 0 };   // (wedge paints under C.cam: here in screen px)
      C.wedge(x, [[g0[0] - 60 * SC, g0[1]], [g0[0] + 80 * SC, g0[1]], [hd[0] + 200 * SC, hd[1] + 60 * SC], [hd[0] - 160 * SC, hd[1] + 60 * SC]], g0, hd, ha, { reach: 1, falloff: [[0, .8], [.6, .5], [1, .25]], blur: 14 });
      C.cam = keepCam; }
    // ---- the hill (base px, under the camera): rubbed mass with fixed smudges and lifts, slope sweeps, the vine crest line
    C.applyCam(x);
    const hill = RID.concat([[W - 60, crest + 900 * SC], [60, crest + 900 * SC]]);
    x.save(); C.poly(x, hill); x.clip(); C.poly(x, hill); C.fillA(x, .6);
    for (const b of HB) C.blob(x, b.x, b.y, b.rx, b.ry, b.a, 0, b.lift ? C.smudgeW : C.smudge);
    for (let j = 0; j < 8; j++) C.sweep(x, RID.filter((_, n) => n % 6 === 0).map(q => [q[0], q[1] + (8 + j * 26) * SC]), (16 + j * 3) * SC, .16 + .02 * j, 7400 + j);
    x.restore();
    C.vine(x, RID, 3 / k, .85, 7390);
    for (const g of TUFT) { const y0 = Pp.ridgeY(g.x); for (let n = 0; n < g.n; n++) { const bx = g.x + (n - g.n / 2) * 1.6 * SC, hh = g.h * (.7 + .3 * ((n * 7 + g.seed) % 5) / 4);
      C.vine(x, [[bx, y0 + 1 * SC], [bx + g.lean * .5 + (n - 1) * .8 * SC, y0 - hh * .55], [bx + g.lean + (n - 1) * 1.5 * SC, y0 - hh]], 2.2 / k, g.lift ? .55 : .8, g.seed + n, g.lift ? '#fff' : '#000', 0); } }
    // lifted light on the ground at the crosses' feet (the eraser), more as the light comes
    for (let i = 0; i < 3; i++) C.blob(x, CR[i].x + 14 * SC, CR[i].y + 10 * SC, 44 * SC, 9 * SC, (id === 'e' && i === 0 ? .3 + .25 * L2.faint : .22), 0, C.smudgeW);
    // ---- the crosses and the figures (the middle one: one dark mass with his cross, never lit)
    for (let i = 0; i < 3; i++) crossVec(x, i, k);
    if (id === 'e') { const c0 = CR[0], w = 7 * SC; C.glowLine(x, [[c0.x - w, c0.y - 4 * SC], [c0.x - w * .8, c0.y - c0.h]], .45 * L2.faint + .25 * L2.bowL, 4330, { w: [8 / k, 3 / k, 1.5 / k], al: [.08, .25, .7], brk: [.05, .1, .2] }); }   // (before the figure: only on the wood)
    const bowNow = ss(T.bow0, T.bow1, t) > 0 ? sineBow(t) : 0;
    const pL = figVec(x, 0, bowNow, .89); figVec(x, 1, 0, .95); figVec(x, 2, 0, .89);
    C.applyCam(x);
    if (id === 'c') for (let j = 0; j < 2; j++) { const pr = clamp((t - (j ? T.rimR : T.rimL)) / T.rimDur); if (pr <= 0 || L2.rimOff <= 0) continue;   // "우편에 / 좌편에"
      const pts = RIMS[j], n = Math.max(2, Math.ceil(eio(pr) * pts.length));
      C.glowLine(x, pts.slice(0, n), L2.rimOff, 4200 + j * 10, { w: [14 / k, 5 / k, 2.2 / k], al: [.1, .3, .85], brk: [.04, .06, .1] }); }
    if (id === 'e') figRim(x, pL, (.25 * L2.tilt + .45 * L2.faint + .3 * L2.bowL) * L2.breathe, k);
    // ---- mist (screen px): valley mist below the crest, drifting; the near slope of the truck shot with parallax
    x.setTransform(1, 0, 0, 1, 0, 0);
    C.fog(x, t + (id === 'c' ? sc.shift * .9 / (16 * SC) : 0), [[hz + 70 * SC, .4, 12], [hz + 190 * SC, .34, -9], [hz - 30 * SC, .2, 6]]);
    if (id === 'c') {   // the near slope (we are low on the hill): it slides by faster than the crosses — the truck reads
      const off = sc.shift * 1.3, top = []; for (let xs = -20; xs <= W + 20; xs += 12) top.push([xs, nearTop(xs + off)]);
      const poly = top.concat([[W + 20, H + 20], [-20, H + 20]]), wrap = v => ((v % (W + 900)) + (W + 900)) % (W + 900) - 450;
      x.save(); C.poly(x, poly); x.clip(); C.poly(x, poly); C.fillA(x, .58);
      for (const b of NEAR) C.blob(x, wrap(b.x - off), b.y, b.rx, b.ry, b.a, 0, b.lift ? C.smudgeW : C.smudge);
      x.restore();
      for (const g of NGR) { const xs = wrap(g.x - off), y0 = nearTop(xs + off) + 4;
        C.vine(x, [[xs, y0], [xs + g.lean * .45, y0 - g.h * .55], [xs + g.lean, y0 - g.h]], g.w, g.lift ? .45 : .7, g.seed, g.lift ? '#fff' : '#000', 0); } }
    // ---- overlays: N24's darkening (all but the red point), the calm dark under the words (a soft gradient, no slab)
    x.setTransform(1, 0, 0, 1, 0, 0);
    if (id === 'b' && L2.n24 > 0) { const b = scr(BOARD), g = x.createRadialGradient(b[0], b[1], 70 * SC, b[0], b[1], 950 * SC);
      g.addColorStop(0, `rgba(${C.TONE},0)`); g.addColorStop(.45, `rgba(${C.TONE},${.18 * L2.n24})`); g.addColorStop(1, `rgba(${C.TONE},${.32 * L2.n24})`); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    { const y0 = Film.SAFE() - 260 * SC, g = x.createLinearGradient(0, y0, 0, H); g.addColorStop(0, `rgba(${C.TONE},0)`); g.addColorStop(1, `rgba(${C.TONE},.32)`); x.fillStyle = g; x.fillRect(0, y0, W, H - y0); }
    // ---- develop: the tooth at screen scale, following only the relative push / the truck (+ the half-pixel offset)
    // (the truck keeps the tooth still on the screen: the grain lookup moves in whole pixels, and a slow truck stepped it every
    //  few frames — a stutter in the grain (round-2 frame check). The close framings are rubbed tone almost everywhere, where the
    //  tooth hardly shows, so a still tooth under the truck does not read as crawling.)
    C.cam = { zm: k / sc.k0, zc: sc.S, ox: .37, oy: .41 };
    C.develop(ctx);
    // the red point (after develop), restrained: smaller than the board's true scale would make it
    if (id !== 'e') { const rp = t < T.red0 ? 0 : eio(clamp((t - T.red0) / (T.red1 - T.red0))), b = scr(BOARD), r = 9 * SC * Math.pow(k, .8), R2 = P0.rng(5);
      if (rp > 0) C.pastel(ctx, [{ pr: rp, pts: C.pastelPath([b[0] - r, b[1]], [b[0] + r, b[1] + 1], r * 1.3, r * 1.1, 6, R2, 1.5).map(q => ({ s: q.p, w: q.w, j1: q.j1, j2: q.j2 })) }], 1); }
  }

  // ---- the smudge dissolve: a fixed low-res noise field (soft blobs, a slight sweep across), thresholded by the eased progress;
  //      the new framing comes through the old one patch by patch, like charcoal rubbed away (never a hard cut, never a pop)
  const MW = 135, MH = 240, NZ = new Float32Array(MW * MH); { let mn = 9, mx = -9;
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) { const v = .55 * P0.noise(i / 26, j / 26) + .3 * P0.noise(i / 11 + 5, j / 11) + .15 * P0.noise(i / 5, j / 5 + 9); NZ[j * MW + i] = v; mn = Math.min(mn, v); mx = Math.max(mx, v); }
    for (let n = 0; n < NZ.length; n++) NZ[n] = (NZ[n] - mn) / (mx - mn); }
  const mask = P0.canvas(MW, MH), mctx = mask.getContext('2d'), mimg = mctx.createImageData(MW, MH), aux = P0.canvas(W, H), actx = aux.getContext('2d');
  function dissolve(ctx, kk, dir) {
    const s = .55; for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) { const n = .68 * NZ[j * MW + i] + .32 * (dir > 0 ? i / MW : 1 - i / MW), a = clamp((kk * (1 + s) - n) / s);
      mimg.data[(j * MW + i) * 4 + 3] = a * 255; }
    mctx.putImageData(mimg, 0, 0);
    actx.setTransform(1, 0, 0, 1, 0, 0); actx.globalCompositeOperation = 'destination-in'; actx.imageSmoothingEnabled = true; actx.imageSmoothingQuality = 'high'; actx.filter = `blur(${22 * SC}px)`; actx.drawImage(mask, -40, -40, W + 80, H + 80); actx.filter = 'none'; actx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(aux, 0, 0); ctx.restore();
  }
  function renderShot(c2, t, B, id) {
    c2.setTransform(1, 0, 0, 1, 0, 0); c2.globalAlpha = 1; c2.globalCompositeOperation = 'source-over';
    if (id === 'a' || id === 'd' || id === 'f') window.charcoalCross(c2, t, B, opts(t, B, id)); else closeShot(c2, t, B, id);
  }

  return {
    IDS, beats: () => T, cam: (t, B) => { if (!T) T = beats(B); return cam(t, B); },
    draw(ctx, t, B) { if (!T) T = beats(B);
      const on = T.SHOTS.filter(([, a, b]) => t >= a && t < b);
      renderShot(ctx, t, B, on[0][0]);
      if (on.length > 1) { const [id, a] = on[1], e = on[0][2], kk = sine((t - a) / (e - a)); renderShot(actx, t, B, id); dissolve(ctx, kk, 'bd'.includes(id) ? -1 : 1); } },
    shotAt: t => (T ? T.SHOTS.filter(([, a, b]) => t >= a && t < b).map(s => s[0]).join('+') : ''),
    // after 566.8 (the veil scene's first 4.65 s, before its page turn): the figures stay, his head bowed — pass this as the
    // 4th argument of charcoalCross in the veil's prev. Everything else is already charcoalCross's own frame.
    tail: () => window.charcoalCross.tail(),   // (= charcoal-cross.js; the veil's prev: charcoalCross.prev(B))
  };
}
