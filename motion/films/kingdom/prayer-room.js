// prayer-room.js — 「kingdom」 1부 N06–N06b (film 66.8–90.3): "그래서 예수님은 제자들에게 이렇게 기도하라 가르치셨습니다" — the Lord's
// Prayer (Mt 6:10) in a window-lit room, painted after Vermeer (kit-oilpaint.js key 'vermeer' = canvas-film kits/oilpaint; the light of
// *The Milkmaid* and *Woman Reading a Letter at an Open Window*): a lime-plastered room under dark beams, one window in the left wall, the
// daylight laid across a stone-and-earth floor. A man kneels in prayer, small, his back to us, in the middle of the room; two more kneel
// further off in the half-shade; an open scroll lies on the floor in the light beside him.
// Built as a reusable module: the ending of the film returns to this composition (bookend) — build(W, H, { people: 1 }) for the ending,
// and the caller passes its own timing object (see beatsPart1 for the fields).
// Craft: the room is painted ONCE as two plates of the same room (OIL.paint over value-planned plates, as oil-cornelius.js / oil-nazareth.js):
// `dim` (the room before the sun comes round) and `lit` (the window's sun on the floor and wall, warm bounce); every frame shows `dim` and
// reveals `lit` through a soft mask that is the sun patch's shape at that moment — so the light MOVES while every brush stroke stays put.
// The kneeling men are painted sprites (OIL.relief volume, lit from the window) drawn each frame: breath in the shoulders, the main man's
// head bows at the prayer and lifts toward the light at the end. The air in the beam: a soft shaft from the window to the floor, few
// motes (tens) only inside it. The marks on the scroll (「뷰티풀 마인드」, OPUSCAR 74 — figures light up and join in gold): as each piece of
// Q2 is read, marks along the scroll's lines light (a soft rise, a small flare, a held glow — after luminous-score) and are joined by thin
// gold lines drawn with a moving bright head (after lineage-glow); at the end all the groups are joined.
// Camera: locked off (z 1.16) while the light moves → a very slow dolly out over 4 s as the light widens (z 1.16 → 1.0) → a last drift.
// Rules kept: no faces (backs only), men in head cloths, no long hair; no words in the art (the scroll's writing is stroke texture);
// the light goes to the man and the scroll (the protagonists), never beside them.
// API: const R = await import('./prayer-room.js'); const ROOM = await R.build(W, H, { people: 3 });  ROOM.draw(ctx, t, R.beatsPart1(B))
//      t = FILM seconds. Pure in t. Needs window.Pilot (lib.js) and window.OIL (kit-oilpaint.js).
const P = window.Pilot;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const sine = x => { x = clamp(x); return .5 - .5 * Math.cos(Math.PI * x); };

// part 1 timing from the line times: { start, end, cross:[a,b], reach:[a,b], pieces:[[a,b]…], widen:[a,b], dolly:[a,b], bow:[a,b], lift:[a,b] }
export function beatsPart1(B) {
  const q0 = B.Q2, q1 = B.N06b - .1, F = window.Film;
  const pcs = F && F.pieces ? F.pieces(F.text('Q2'), q0, q1).map(r => [r[1], r[2]]) : [[q0, q0 + 2.6], [q0 + 2.6, q0 + 5.6], [q0 + 5.6, q1]];
  return { start: B.N06, end: B.N08, cross: [B.N06 + .3, B.L2 + .3], reach: [B.Q2 - .2, B.Q2 + 2.6], pieces: pcs, join: [q1 - 1.6, q1 + 1.2],
    widen: [B.N06b + .3, B.N06b + 4.6], dolly: [B.N06b + .4, B.N06b + 4.4], bow: [B.Q2 + .2, B.Q2 + 2.2], lift: [B.N06b + .6, B.N06b + 3.4] };
}

export async function build(W, H, opts = {}) {
  const OIL = window.OIL, people = opts.people ?? 1, V = H > W;
  const S = 1.3, M = .05;                                     // plate px per frame px; margin (fraction of the frame) round the frame
  const PW = Math.round(W * (1 + 2 * M) * S), PH = Math.round(H * (1 + 2 * M) * S);
  const OX = M * W, OY = M * H;                               // frame px → plate px: (x + OX) * S
  const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const mk = () => { const c = P.canvas(PW, PH), g = c.getContext('2d'); g.setTransform(S, 0, 0, S, OX * S, OY * S); return [c, g]; };
  // ---------------------------------------------------------------- the room's geometry (frame px at z = 1)
  const VPx = W * .56, VPy = H * .34;                         // the eye level
  const BW = { x0: W * .17, x1: W * 1.12, y0: H * .075, y1: H * .445 };   // the back wall (floor line at 0.445 H)
  const WIN = [[W * .035, H * .1], [W * .132, H * .145], [W * .132, H * .315], [W * .035, H * .355]];   // the window in the left wall (near edge taller)
  // the floor: (u lateral 0 left wall → 1 right; v depth 0 back wall → 1 front edge) → frame px (a perspective-ish map)
  const floorXY = (u, v) => { const yb = BW.y1, yf = H * 1.08, y = yb + (yf - yb) * Math.pow(v, 1.15);
    const xl = lerp(BW.x0, -W * .75, v), xr = lerp(BW.x1, W * 1.9, v); return [lerp(xl, xr, u), y]; };
  // the people: main man kneeling in the floor's middle (u .5, v .14), a second further right in half-shade, a third behind on the left
  const MEN = [{ u: .5, v: .2, s: 1, main: true }, { u: .7, v: .09, s: .92 }, { u: .27, v: .07, s: .9 }].slice(0, people);
  const manAt = m => { const [x, y] = floorXY(m.u, m.v), sc = (H * .078) * m.s * (1 + m.v * 1.1); return { x, y, sc }; };   // sc = his height on screen (px)
  // the scroll on the floor in the light, to his left at about his depth
  const SCR = (() => { const a = floorXY(.235, .19), b = floorXY(.395, .19), c = floorXY(.4, .235), d = floorXY(.23, .235); return [a, b, c, d]; })();
  // ---------------------------------------------------------------- the plates
  function room(g, lit) {
    const k = lit ? 1 : 0;
    // ceiling: dark beams over plaster
    { const gr = g.createLinearGradient(0, 0, 0, BW.y0); gr.addColorStop(0, '#2c2218'); gr.addColorStop(1, lit ? '#5a4632' : '#4a3a2a'); g.fillStyle = gr; g.fillRect(-OX, -OY, W + 2 * OX, BW.y0 + OY); }
    for (let i = -6; i <= 9; i++) { const xb = BW.x0 + (BW.x1 - BW.x0) * i / 7, xf = VPx + (xb - VPx) * 2.6, w0 = W * .016, w1 = W * .045;
      g.fillStyle = '#1e160f'; g.beginPath(); g.moveTo(xf - w1, -OY); g.lineTo(xf + w1, -OY); g.lineTo(xb + w0, BW.y0); g.lineTo(xb - w0, BW.y0); g.fill(); }
    g.fillStyle = '#241a12'; g.fillRect(BW.x0, BW.y0 - H * .012, BW.x1 - BW.x0, H * .016);
    // the back wall: lime plaster, cool grey-green in the shade, warm cream where the window light falls
    { const gr = g.createLinearGradient(BW.x0, 0, BW.x1, 0); gr.addColorStop(0, lit ? '#d8c49e' : '#b2a588'); gr.addColorStop(.35, lit ? '#cdb994' : '#a49a82'); gr.addColorStop(1, lit ? '#8e8470' : '#78705f');
      g.fillStyle = gr; g.fillRect(BW.x0, BW.y0, BW.x1 - BW.x0, BW.y1 - BW.y0); }
    const r = P.rng(7); for (let i = 0; i < 340; i++) { const x = BW.x0 + r() * (BW.x1 - BW.x0), y = BW.y0 + r() * (BW.y1 - BW.y0), R = (8 + r() * 46);
      g.fillStyle = r() < .5 ? `rgba(255,246,226,${.03 + .04 * r()})` : `rgba(80,72,58,${.03 + .05 * r()})`; g.beginPath(); g.ellipse(x, y, R, R * (.4 + r() * .6), r() * 3, 0, 6.283); g.fill(); }
    if (lit) { // the window's light on the back wall (low, right of centre) and the warm bounce
      const rg = g.createRadialGradient(W * .7, H * .44, 0, W * .7, H * .44, W * .42); rg.addColorStop(0, 'rgba(255,236,196,.55)'); rg.addColorStop(.5, 'rgba(250,222,176,.2)'); rg.addColorStop(1, 'rgba(240,210,170,0)');
      g.save(); g.beginPath(); g.rect(BW.x0, BW.y0, BW.x1 - BW.x0, BW.y1 - BW.y0); g.clip(); g.fillStyle = rg; g.fillRect(BW.x0, BW.y0, BW.x1, BW.y1); g.restore(); }
    // a niche with a clay lamp (unlit), a peg with a cloth, the wall's foot
    g.fillStyle = lit ? '#6a5a44' : '#5a4c3a'; g.fillRect(W * .82, H * .3, W * .07, H * .05); g.fillStyle = '#3a2e22'; g.beginPath(); g.ellipse(W * .855, H * .345, W * .022, H * .006, 0, 0, 6.283); g.fill();
    { const gr = g.createLinearGradient(0, BW.y1 - H * .03, 0, BW.y1); gr.addColorStop(0, 'rgba(50,40,30,0)'); gr.addColorStop(1, 'rgba(50,40,30,.4)'); g.fillStyle = gr; g.fillRect(BW.x0, BW.y1 - H * .03, BW.x1 - BW.x0, H * .03); }
    // the left wall (receding), with the window: a deep reveal, the bright morning beyond
    g.fillStyle = lit ? '#9c8e74' : '#857a66'; g.beginPath(); g.moveTo(-OX, -OY); g.lineTo(BW.x0, BW.y0); g.lineTo(BW.x0, BW.y1); g.lineTo(-OX, H * 1.2); g.closePath(); g.fill();
    { const gr = g.createLinearGradient(-OX, 0, BW.x0, 0); gr.addColorStop(0, 'rgba(30,22,16,.55)'); gr.addColorStop(1, 'rgba(30,22,16,0)'); g.fillStyle = gr; g.fill(); }
    // the reveal (thickness of the wall) and the opening
    g.fillStyle = lit ? '#c6b392' : '#a89a80'; g.beginPath(); g.moveTo(WIN[1][0], WIN[1][1]); g.lineTo(WIN[1][0] + W * .03, WIN[1][1] + H * .006); g.lineTo(WIN[2][0] + W * .03, WIN[2][1] - H * .004); g.lineTo(WIN[2][0], WIN[2][1]); g.fill();
    { const gr = g.createLinearGradient(0, WIN[0][1], 0, WIN[3][1]); gr.addColorStop(0, '#f6efe0'); gr.addColorStop(.55, '#f4e2bc'); gr.addColorStop(.8, '#d9c8a0'); gr.addColorStop(1, '#bfae8a');
      g.fillStyle = gr; g.beginPath(); WIN.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }
    // far hills seen through the window (a soft band low in the opening)
    g.save(); g.beginPath(); WIN.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
    g.fillStyle = 'rgba(170,150,118,.55)'; g.beginPath(); g.moveTo(0, H * .37); for (let x = 0; x <= W * .15; x += 6) g.lineTo(x, H * .365 + Math.sin(x * .05) * H * .006); g.lineTo(W * .15, H * .45); g.lineTo(0, H * .45); g.fill();
    // the mullion and the shutter's shadow
    g.fillStyle = 'rgba(60,46,32,.85)'; g.fillRect(W * .08, H * .16, W * .008, H * .3); g.restore();
    g.strokeStyle = 'rgba(50,38,26,.7)'; g.lineWidth = 5; g.beginPath(); WIN.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke();
    // an open shutter swung back on the left wall
    g.fillStyle = lit ? '#5a4632' : '#4a3a28'; g.beginPath(); g.moveTo(WIN[0][0] - W * .012, WIN[0][1] - H * .01); g.lineTo(WIN[0][0] - W * .05, WIN[0][1] - H * .03); g.lineTo(WIN[3][0] - W * .05, WIN[3][1] + H * .03); g.lineTo(WIN[3][0] - W * .012, WIN[3][1] + H * .01); g.fill();
    // the floor: worn stone flags and packed earth, warm near the window, sinking into shade toward us
    { const [a] = [floorXY(0, 0)], gr = g.createLinearGradient(0, BW.y1, 0, H * 1.08); gr.addColorStop(0, lit ? '#8e7458' : '#76624c'); gr.addColorStop(.35, lit ? '#6e5842' : '#5e4c3a'); gr.addColorStop(1, '#2e241a');
      g.fillStyle = gr; g.beginPath(); const p0 = floorXY(0, 0), p1 = floorXY(1, 0), p2 = floorXY(1, 1), p3 = floorXY(0, 1); g.moveTo(...p0); g.lineTo(...p1); g.lineTo(...p2); g.lineTo(...p3); g.closePath(); g.fill(); }
    g.strokeStyle = 'rgba(30,22,16,.22)'; g.lineWidth = 1.6;
    for (let i = 1; i < 14; i++) { const v = Math.pow(i / 14, 1.3); g.beginPath(); g.moveTo(...floorXY(0, v)); g.lineTo(...floorXY(1, v)); g.stroke(); }
    for (let i = 1; i < 12; i++) { const u = i / 12 + (i % 2) * .02; g.beginPath(); g.moveTo(...floorXY(u, 0)); g.lineTo(...floorXY(u + .01, 1)); g.stroke(); }
    { const rr = P.rng(3); for (let i = 0; i < 260; i++) { const [x, y] = floorXY(rr(), Math.pow(rr(), 1.2)); g.fillStyle = rr() < .5 ? `rgba(255,236,200,${.02 + .03 * rr()})` : `rgba(30,22,14,${.04 + .05 * rr()})`; g.beginPath(); g.ellipse(x, y, 10 + rr() * 40, 3 + rr() * 9, 0, 0, 6.283); g.fill(); } }
    if (lit) { // the window's warm bounce over the floor near the wall
      const [cx, cy] = floorXY(.35, .22), rg = g.createRadialGradient(cx, cy, 0, cx, cy, W * .6); rg.addColorStop(0, 'rgba(255,226,180,.32)'); rg.addColorStop(1, 'rgba(255,226,180,0)'); g.fillStyle = rg; g.fillRect(-OX, BW.y1, W + 2 * OX, H); }
    // a clay jar by the back wall, a low stool, a rolled mat
    { const [jx, jy] = floorXY(.83, .02); g.fillStyle = lit ? '#8a5a3a' : '#6e4a32'; g.beginPath(); g.ellipse(jx, jy - H * .03, W * .03, H * .03, 0, 0, 6.283); g.fill(); g.fillRect(jx - W * .012, jy - H * .068, W * .024, H * .012);
      g.fillStyle = 'rgba(20,14,10,.35)'; g.beginPath(); g.ellipse(jx + W * .02, jy, W * .035, H * .006, 0, 0, 6.283); g.fill(); }
    { const [mx, my] = floorXY(.06, .1); g.fillStyle = lit ? '#7a6a4c' : '#625640'; g.beginPath(); g.ellipse(mx, my - H * .012, W * .05, H * .014, -.1, 0, 6.283); g.fill(); }
    // a plank door in the back wall (right), a low bench along the wall, a basket
    { const x0 = W * .62, x1 = W * .76, y0 = H * .225, y1 = BW.y1 - H * .002; g.fillStyle = lit ? '#4e3a28' : '#3e2e20'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.strokeStyle = 'rgba(20,14,10,.5)'; g.lineWidth = 2; for (let i = 1; i < 5; i++) { const x = lerp(x0, x1, i / 5); g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
      g.fillStyle = lit ? '#6a5236' : '#56422c'; g.fillRect(x0 - W * .012, y0 - H * .01, x1 - x0 + W * .024, H * .012); }
    { const [bx0, by] = floorXY(.36, .015), [bx1] = floorXY(.56, .015); g.fillStyle = lit ? '#5a442e' : '#4a3826'; g.fillRect(bx0, by - H * .032, bx1 - bx0, H * .012); g.fillRect(bx0 + 8, by - H * .022, 10, H * .022); g.fillRect(bx1 - 18, by - H * .022, 10, H * .022); }
    { const [kx, ky] = floorXY(.93, .05); g.fillStyle = lit ? '#8a6e44' : '#6e5838'; g.beginPath(); g.ellipse(kx, ky - H * .016, W * .035, H * .018, 0, 0, 6.283); g.fill(); }
    // the plate's key: the room in shade (cool, low) or in the sun (warm, high)
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    if (!lit) { g.globalCompositeOperation = 'multiply'; g.fillStyle = '#c8c6ca'; g.fillRect(0, 0, PW, PH); }
    else { g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,214,150,.2)'; g.fillRect(0, 0, PW, PH); }
    g.restore();
    // the scroll on the floor (parchment, the rolled ends; the writing as stroke texture only)
    { const [a, b, c, d] = SCR; g.fillStyle = lit ? '#e2cfa6' : '#b8a684'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(...c); g.lineTo(...d); g.closePath(); g.fill();
      const rr = P.rng(41); g.strokeStyle = 'rgba(48,32,20,.6)'; g.lineWidth = 1.1;
      for (let row = 0; row < 7; row++) { const v = .14 + row * .11; for (let col = 0; col < 3; col++) { let u = .08 + col * .3; const u1 = u + .24;
          while (u < u1) { const w = .015 + rr() * .03, p = SQ(u, v), q = SQ(Math.min(u1, u + w), v); g.beginPath(); g.moveTo(p[0], p[1] - 1); g.lineTo(q[0], q[1] - 1); g.stroke(); u += w + .012; } } }
      g.fillStyle = lit ? '#cbb688' : '#a69470'; for (const [p, q] of [[a, d], [b, c]]) { g.beginPath(); g.moveTo(p[0] - 5, p[1] - 3); g.lineTo(p[0] + 5, p[1] - 3); g.lineTo(q[0] + 6, q[1] + 2); g.lineTo(q[0] - 6, q[1] + 2); g.fill(); } }
  }
  // a point on the scroll: (u along 0..1, v across 0..1) → frame px
  function SQ(u, v) { const [a, b, c, d] = SCR, top = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], bot = [lerp(d[0], c[0], u), lerp(d[1], c[1], u)]; return [lerp(top[0], bot[0], v), lerp(top[1], bot[1], v)]; }
  const [dimC, dimG] = mk(), [litC, litG] = mk(); room(dimG, false); room(litG, true);
  const paintOpt = { key: 'vermeer', S, seed: 11 };
  const DIM = OIL.paint(dimC, paintOpt), LIT = OIL.paint(litC, { ...paintOpt, seed: 11 });
  // bake the canvas weave into the paintings (it moves with the picture — no screen-fixed texture under the dolly)
  for (const c of [DIM, LIT]) { const g = c.getContext('2d'), wv = P.canvas(256, 256), wg = wv.getContext('2d'), im = wg.createImageData(256, 256), r = P.rng(19);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const v = 128 + 20 * Math.sin(x * 1.7) * Math.sin(y * .23) + 20 * Math.sin(y * 1.7) * Math.sin(x * .23) + (r() - .5) * 22, i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    wg.putImageData(im, 0, 0); g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .13; g.fillStyle = g.createPattern(wv, 'repeat'); g.fillRect(0, 0, PW, PH); g.restore(); }

  // ---------------------------------------------------------------- the kneeling men (painted sprites, dim and lit)
  // Round 1 lessons (this session): symmetric bell / pawn outlines read as ghosts and chess pieces, and robeMan rendered at this size
  // reads as a doll — so each man is a painter's figure: one irregular, asymmetric contour (the head bowed forward and a little to one
  // side so its crown sits just above the shoulders, one shoulder higher, the elbows out at his sides as his hands are together in front
  // of him, the robe pooled unevenly on the floor), a mantle across the back on a diagonal, a head cloth, given volume by the window's
  // light (OIL.relief from the upper left: the left edges catch the light, the right side turns away) and laid in with vermeer strokes.
  // local units: 1 = the kneeling height; origin at the middle of his knees on the floor; y up is negative. Seen from behind.
  const OUT = [[-.31, 0], [-.3, -.085], [-.258, -.2], [-.214, -.325], [-.236, -.405], [-.244, -.5], [-.226, -.59], [-.196, -.655], [-.14, -.684], [-.094, -.697],
    [-.088, -.748], [-.068, -.8], [-.03, -.832], [.014, -.836], [.057, -.82], [.086, -.778], [.097, -.728], [.136, -.706], [.192, -.69], [.228, -.638],
    [.244, -.556], [.252, -.458], [.226, -.36], [.262, -.222], [.302, -.1], [.334, .004], [.2, .018], [.06, .01], [-.1, .02], [-.22, .012]];
  function contour(r, j = 1) {   // Catmull-Rom through the points, each nudged a little (no two men alike)
    const pts = OUT.map(([x, y]) => [x + (r() - .5) * .012 * j, y + (r() - .5) * .01 * j]), q = new Path2D(), n = pts.length;
    q.moveTo(...pts[0]); for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      q.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
    q.closePath(); return q; }
  const fig = (lit, C, seed) => {
    const sc = 420, w = Math.round(.78 * sc), h = Math.round(1.0 * sc), ox = w / 2, oy = h - .07 * sc, c = P.canvas(w, h), g = c.getContext('2d');
    const m = new DOMMatrix([sc, 0, 0, sc, ox, oy]), path = contour(P.rng(seed)), L = { x: ox - sc * 1.5, y: oy - sc * 1.35, z: sc * .9, R: sc * 6 };
    const kd = lit ? .42 : .26, kl = lit ? .95 : .3,   // round 2: a dark figure against the light, only the window's rim on him
    LC = lit ? [255, 232, 196] : [150, 152, 164];
    const zone = col => ({ base: col.map(v => v * kd), lit: LC.map((v, i) => v * kl * (col[i] / 210 + .3)) });
    const cloth = (u, v) => v < -.69 && Math.abs(u - .005) < .105 || (v < -.62 && Math.abs(u) < .09);
    const mantle = (u, v) => v < -.13 - (u + .35) * .55 && !cloth(u, v);   // over the left shoulder and down to the right hip, on a diagonal
    OIL.relief(g, path, m, [-.34, -.85, .34, .03], [{ test: cloth, ...zone(C.cloth) }, { test: mantle, ...zone(C.mantle) }, zone(C.tunic)], L, { soft: .075, height: 85, amb: lit ? .2 : .3, wrap: .22 });
    g.save(); g.setTransform(m); g.strokeStyle = 'rgba(26,18,12,.3)'; g.lineWidth = .009; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-.36, -.12); g.bezierCurveTo(-.1, -.27, .12, -.38, .36, -.52); g.stroke();   // the mantle's edge
    for (const [x0, x1] of [[-.15, -.24], [-.02, -.06], [.12, .2]]) { g.beginPath(); g.moveTo(x0, -.3); g.bezierCurveTo(x0 - .01, -.18, (x0 + x1) / 2, -.08, x1, -.005); g.stroke(); }   // folds in the robe
    g.beginPath(); g.moveTo(-.082, -.77); g.bezierCurveTo(-.03, -.79, .04, -.79, .09, -.765); g.stroke(); g.restore();   // the cord round the head cloth
    const art = OIL.paint(c, { key: 'vermeer', S: .85, seed: seed + (lit ? 1 : 0) }), ag = art.getContext('2d');
    ag.save(); ag.globalCompositeOperation = 'destination-in'; ag.setTransform(m); ag.filter = 'blur(.004px)'; ag.fill(path); ag.restore();
    return { c: art, ox, oy, sc, lit };
  };
  const DRESS = [{ tunic: [176, 162, 136], mantle: [128, 94, 62], sash: [88, 66, 46], cloth: [170, 154, 124] },
    { tunic: [150, 132, 104], mantle: [84, 96, 110], sash: [70, 58, 44], cloth: [122, 106, 86] },
    { tunic: [140, 122, 96], mantle: [140, 110, 62], sash: [74, 60, 44], cloth: [106, 94, 78] }];
  const SPR = MEN.map((m, i) => ({ dim: fig(false, DRESS[i], 31 + i * 13), lit: fig(true, DRESS[i], 31 + i * 13) }));
  function drawMan(g, i, spr, t, T, zoomer) {
    const m = MEN[i], { x, y, sc } = manAt(m), k = sc / spr.sc, br = .5 + .5 * Math.sin(t * 1.35 + i * 2.1);
    // the main man bows a little deeper at the prayer and straightens toward the light at the end (top of the figure only: a gentle
    // shear about his knees, eased — no snap); everyone breathes
    const bow = m.main ? .035 * ss(T.bow[0], T.bow[1], t) - .05 * ss(T.lift[0], T.lift[1], t) : .012 * Math.sin(t * .31 + i * 1.7);
    g.save(); zoomer(g); g.translate(x, y);
    // contact shadow on the floor (and, in the sunlit layer, his shadow thrown to the right, away from the window)
    { const cs = g.createRadialGradient(0, 0, 0, 0, 0, sc * .42); cs.addColorStop(0, 'rgba(20,14,10,.5)'); cs.addColorStop(1, 'rgba(20,14,10,0)'); g.save(); g.scale(1, .22); g.fillStyle = cs; g.fillRect(-sc * .5, -sc * .5, sc, sc); g.restore();
      if (spr.lit) { g.save(); g.transform(1, 0, .9, .3, sc * .02, 0); const sh = g.createRadialGradient(sc * .05, -sc * .45, 0, sc * .05, -sc * .45, sc * .7); sh.addColorStop(0, 'rgba(30,20,12,.42)'); sh.addColorStop(1, 'rgba(30,20,12,0)'); g.fillStyle = sh; g.fillRect(-sc, -sc * 1.2, sc * 2.2, sc * 1.4); g.restore(); } }
    g.scale(k, k); g.transform(1, 0, 0, 1 + .005 * br - bow * .4, 0, 0); g.transform(1, 0, -bow * .3, 1, 0, 0);
    g.drawImage(spr.c, -spr.ox, -spr.oy); g.restore();
  }

  // ---------------------------------------------------------------- the light, frame by frame
  const QW = W >> 2, QH = H >> 2, maskC = P.canvas(QW, QH), mg = maskC.getContext('2d'), layC = P.canvas(W, H), lg = layC.getContext('2d');
  // the sun patch on the floor at "time" s (0..1 slides it from the wall toward the man) and width w (0..1)
  function patch(s, w) { const u0 = 0, u1 = lerp(.38, .62, s) + w * .3, v0 = lerp(.04, .12, s) - w * .03, dv = lerp(.12, .16, s) + w * .22, sk = lerp(.1, .16, s) + w * .08;
    return [[u0, v0], [u0, v0 + dv], [u1, v0 + dv + sk], [u1, v0 + sk]].map(([u, v]) => floorXY(u, v)); }
  function beamPoly(pp) { return [WIN[0], WIN[1], pp[3], pp[2], pp[1], WIN[3]]; }   // the air between the window and the patch
  const MARKS = (() => { const r = P.rng(23), out = []; for (let gi = 0; gi < 3; gi++) for (let i = 0; i < 4; i++) { const u = .08 + gi * .3 + r() * .22, v = .14 + Math.floor(r() * 7) * .11; out.push({ g: gi, u, v, d: r() * .3 }); } return out; })();
  let T = null;
  function draw(ctx, t, TT) {
    T = TT;
    // the camera: locked off, then the slow dolly out as the light widens, then a last drift
    // (a creep of 1.5 % while "locked off" — never read as a move, but the painting is never frozen — then the dolly out, then a drift)
    const dk = sine((t - T.dolly[0]) / (T.dolly[1] - T.dolly[0])), creep = .018 * (1 - clamp((t - T.start) / (T.dolly[0] - T.start)));
    const z = lerp(1.16 + creep * 3.6, 1.0, dk) - .022 * clamp((t - T.dolly[1]) / 4), cx = lerp(W * .47 + W * .012 * (1 - clamp((t - T.start) / (T.dolly[0] - T.start))), W * .5, dk), cy = H * .5;
    const zoomer = g => { g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy); };
    const view = (g, art) => { g.save(); zoomer(g); g.drawImage(art, -OX, -OY, PW / S, PH / S); g.restore(); };
    // the light's state: sliding across the floor (N06), reaching the man and the scroll (Q2), widening (N06b)
    const s = sine((t - T.cross[0]) / (T.cross[1] - T.cross[0])) * .8 + .2 * ss(T.reach[0], T.reach[1], t), w = sine((t - T.widen[0]) / (T.widen[1] - T.widen[0]));
    const bright = lerp(.62, 1, ss(T.reach[0], T.reach[1], t)) * (1 + .08 * w);
    // 1. the room in its base light, the men (dim)
    ctx.save(); view(ctx, DIM); SPR.forEach((sp, i) => drawMan(ctx, i, sp.dim, t, T, zoomer)); ctx.restore();
    // 2. the lit room and lit men, through the patch's soft mask (and a broad warm wash once the light widens)
    lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = 1; lg.clearRect(0, 0, W, H);
    view(lg, LIT); SPR.forEach((sp, i) => drawMan(lg, i, sp.lit, t, T, zoomer));
    mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, QW, QH); mg.save(); mg.scale(QW / W, QH / H); zoomer(mg);
    mg.filter = `blur(${(9 + 6 * w).toFixed(1)}px)`; mg.fillStyle = `rgba(255,255,255,${bright})`; const pp = patch(s, w);
    mg.beginPath(); pp.forEach(([x, y], i) => i ? mg.lineTo(x, y) : mg.moveTo(x, y)); mg.closePath(); mg.fill();
    // leaves outside the window: soft shadows drifting through the patch (the light is alive while the camera is still)
    { const [ax, ay] = pp[0], [bx, by] = pp[3], [cx2, cy2] = pp[2], [dx, dy] = pp[1]; mg.globalCompositeOperation = 'destination-out'; mg.filter = 'blur(10px)';
      for (let i = 0; i < 14; i++) { const ph = i * 2.39, u = (.5 + .45 * Math.sin(t * (.42 + .07 * (i % 4)) + ph) + .03 * Math.sin(t * 2.1 + ph)), v = (.5 + .42 * Math.sin(t * (.31 + .05 * (i % 3)) + ph * 1.7));
        const x = lerp(lerp(ax, bx, u), lerp(dx, cx2, u), v), y = lerp(lerp(ay, by, u), lerp(dy, cy2, u), v), R = W * (.025 + .02 * ((i * 7) % 5) / 5);
        mg.fillStyle = `rgba(0,0,0,${.32 + .18 * Math.sin(t * .4 + ph)})`; mg.beginPath(); mg.ellipse(x, y, R * 1.6, R * .55, .3, 0, 6.283); mg.fill(); }
      mg.globalCompositeOperation = 'source-over'; }
    // the man and the scroll inside the light catch it (a soft pool round them once the light has reached them)
    const reach = ss(T.reach[0], T.reach[1], t); if (reach > 0) { const { x, y, sc } = manAt(MEN[0]); const rg = mg.createRadialGradient(x - sc * .1, y - sc * .4, 0, x - sc * .1, y - sc * .4, sc * 1.1); rg.addColorStop(0, `rgba(255,255,255,${.85 * reach})`); rg.addColorStop(1, 'rgba(255,255,255,0)'); mg.filter = 'none'; mg.fillStyle = rg; mg.fillRect(x - sc * 2, y - sc * 2, sc * 4, sc * 3); }
    // the back wall's light and the window's glow on its reveal
    mg.filter = 'blur(14px)'; mg.fillStyle = `rgba(255,255,255,${.35 * bright + .4 * w})`; mg.beginPath(); mg.ellipse(W * .7, H * .44, W * (.12 + .14 * w), H * (.05 + .05 * w), 0, 0, 6.283); mg.fill();
    mg.filter = 'none'; mg.fillStyle = `rgba(255,255,255,${.25 * w})`; mg.fillRect(-W, -H, 3 * W, 3 * H);   // the broad wash as it widens
    mg.restore();
    lg.globalCompositeOperation = 'destination-in'; lg.imageSmoothingEnabled = true; lg.drawImage(maskC, 0, 0, W, H); lg.globalCompositeOperation = 'source-over';
    ctx.drawImage(layC, 0, 0);
    // 3. the air in the beam: a soft shaft and a few motes inside it (screen)
    ctx.save(); zoomer(ctx); ctx.globalCompositeOperation = 'screen';
    { const bp = beamPoly(pp), gr = ctx.createLinearGradient(WIN[1][0], WIN[1][1], pp[2][0], pp[2][1]); gr.addColorStop(0, `rgba(255,236,200,${.3 * bright})`); gr.addColorStop(1, `rgba(255,236,200,${.08 * bright})`);
      ctx.filter = 'blur(18px)'; ctx.fillStyle = gr; ctx.beginPath(); bp.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); ctx.filter = 'none';
      const r = P.rng(5); for (let i = 0; i < 150; i++) { const a = r(), b = r(), ph = r() * 6.28, sp = .02 + r() * .03;
        const u = (a + t * sp * .3) % 1, v = (b + Math.sin(t * .2 + ph) * .04 + 1) % 1, top = [lerp(WIN[1][0], WIN[0][0], v), lerp(WIN[1][1], WIN[3][1], v)], bot = [lerp(pp[3][0], pp[1][0], v), lerp(pp[3][1], pp[1][1], v)];
        const x = lerp(top[0], bot[0], u) + Math.sin(t * .5 + ph) * 6, y = lerp(top[1], bot[1], u) + Math.cos(t * .4 + ph) * 6, al = .25 * bright * Math.sin(Math.PI * u) * (.4 + .6 * r());
        ctx.fillStyle = `rgba(255,240,210,${al})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + r() * 1.6, 0, 6.283); ctx.fill(); } }
    ctx.restore();
    // 4. the marks on the scroll: each piece of the prayer lights its group; thin gold lines join them; at the end all are joined
    drawMarks(ctx, t, zoomer);
    // 5. a soft vignette (the painting's edge in shade)
    { const vg = ctx.createRadialGradient(W * .5, H * .42, H * .25, W * .5, H * .5, H * .78); vg.addColorStop(0, 'rgba(14,10,6,0)'); vg.addColorStop(1, 'rgba(14,10,6,.42)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); }
  }
  // a light that switches on with a soft rise, a small flare and a held glow (after luminous-score's intensity curve)
  const markI = (t, t0) => { if (t < t0) return 0; const a = ss(t0, t0 + .35, t); return a * (1 + .5 * Math.exp(-(t - t0 - .35) / .25) * (t > t0 + .35 ? 1 : 0)) * (1 - .25 * ss(t0 + .6, t0 + 3, t)); };
  function drawMarks(ctx, t, zoomer) {
    const pcs = T.pieces; if (!pcs || !pcs.length) return;
    const pts = MARKS.map(m => { const [a, b] = pcs[Math.min(m.g, pcs.length - 1)], t0 = lerp(a + .2, b - .9, (MARKS.filter(q => q.g === m.g).indexOf(m)) / 3) + m.d * .2; return { ...m, p: SQ(m.u, m.v), t0 }; });
    ctx.save(); zoomer(ctx); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round';
    // lines inside each group (drawn from mark to mark with a bright head), then between the groups at the end
    const seg = (A, Bp, k, al) => { if (k <= 0) return; const x = lerp(A.p[0], Bp.p[0], k), y = lerp(A.p[1], Bp.p[1], k);
      ctx.strokeStyle = `rgba(242,200,110,${.75 * al})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(A.p[0], A.p[1]); ctx.lineTo(x, y); ctx.stroke();
      if (k < 1) { const rg = ctx.createRadialGradient(x, y, 0, x, y, 9); rg.addColorStop(0, `rgba(255,236,180,${al})`); rg.addColorStop(1, 'rgba(255,236,180,0)'); ctx.fillStyle = rg; ctx.fillRect(x - 9, y - 9, 18, 18); } };
    for (let gi = 0; gi < 3; gi++) { const gp = pts.filter(q => q.g === gi); for (let i = 0; i + 1 < gp.length; i++) { const a = gp[i + 1].t0 - .05, k = ss(a, a + .6, t); seg(gp[i], gp[i + 1], k, 1 - .3 * ss(a + 2, a + 5, t)); } }
    { const firsts = [0, 1, 2].map(gi => pts.filter(q => q.g === gi)), J = T.join; for (let gi = 0; gi < 2; gi++) { const A = firsts[gi][firsts[gi].length - 1], Bq = firsts[gi + 1][0], a = lerp(J[0], J[1], gi * .4), k = ss(a, a + .9, t); seg(A, Bq, k, .9); } }
    for (const q of pts) { const I = markI(t, q.t0); if (I <= .01) continue; const [x, y] = q.p, R = 16 + 10 * I;
      const rg = ctx.createRadialGradient(x, y, 0, x, y, R); rg.addColorStop(0, `rgba(255,232,170,${.85 * Math.min(1, I)})`); rg.addColorStop(.25, `rgba(242,196,100,${.45 * Math.min(1, I)})`); rg.addColorStop(1, 'rgba(242,196,100,0)');
      ctx.fillStyle = rg; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); ctx.fillStyle = `rgba(255,246,214,${Math.min(1, I)})`; ctx.fillRect(x - 4, y - 1.2, 8, 2.4); }
    ctx.restore();
  }
  return { draw, MEN, manAt, beats: () => T };
}
