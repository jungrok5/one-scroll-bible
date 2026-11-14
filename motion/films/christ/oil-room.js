/* oil-room.js — 「그리스도」 처음(0:00–0:08)과 끝(2:26–2:33): 촛불 앞에 고개 숙인 노인의 뒷모습 (kit-oilpaint.js key 'rembrandt').
   After Rembrandt and Georges de La Tour, told like the first film (a small person, the light the protagonist): a dark room; seen
   from behind, a small old person sits bowed at a table; beyond them on the table a candle and a large open Bible, beyond that a
   small window. The body is an almost black shape — no face, no hands drawn; the candle lays a gold rim round the bowed head, the
   grey hair (it shines silver at the edge) and the round shoulders of the cardigan. That rim is the scene's protagonist.
     'open' (u 0–8.6, video 0:00–0:08.6): near the candle, the table and the dark room round it (it reads within 0.3 s); in one
            slow eased move (roomOpenCam) the camera draws back and the bowed figure, rimmed in gold, is found in front of it (N01);
            then it passes over the shoulder and comes down onto the open Bible (N02, from 4.9) — no letters, only the grain of
            lines, the candle in the paper, one page corner lifting.
     'dawn' (u 0–6.5, video 2:26.5–): the same figure and candle; the window beyond brightens with dawn, the figure stands in the
            dawn backlight and the shadows of the window bars fall across the table toward us (kept for compatibility).
     'end'  (u −0.1–21.5, video 2:39.4–3:01; 관리자 2026-11-14: the film returns to this room and ends here, the end card over it):
            the same room seen wider (roomLayoutEnd: a tall window on the left of the back wall, the old man small at the low table
            in the lower middle, the open Bible and the candle beside him). One slow pull back, z 1.52 → 1.0. N17 (159.6) candle-lit,
            the window starts to grey; Q14 (166.8) the window's light creeps across the table and reaches the place beyond his right
            shoulder where his folded hands rest (still no hands drawn), the dawn rim grows on him, the candle grows small; Q13 (172.6)
            the room fills — a shaft from the window to the floor, the sun still rising to the last frame; from 175.6 the quiet wall
            between window and table (portrait y .24–.50, x .2–.8) carries the end card. The man stays above the words' band (.64).
            (round 8: the man a person seen from behind — roomPersonPathsEnd, figEndOf — the dawn lying inside his shape on the
            window side, no rim round him; the window laid back crisp from the unpainted plate and the pull back pans left a little
            sooner so the whole window is in frame from ≈ 171.5 s; the second shaft's foot on him and the table before him.)
   The room is one painted plate (night and dawn, same seed); the figure is a layer of its own in front of it (parallax as the
   camera moves; the shoulders breathe very slightly; its rim flickers with the flame). Closed form: roomOil(ctx, u, mode) depends
   only on (u, mode). No words are drawn. Needs Pilot (lib.js) and kit-oilpaint.js (window.OIL).
   Check 'end' alone: node motion/render.mjs v --page films/christ/sample-room-end.html --stills 159.6,167,173,177 */
const ROIL = {};

function roomLayout() {
  const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
  const L = V ? { person: { cx: W * .37, top: H * .262, P: H * .3 }, win: [W * .1, H * .05, W * .32, H * .19], cand: { x: W * .74, top: H * .228, base: H * .3, r: 11 }, book: { cx: W * .63, cy: H * .385, w: W * .28, d: H * .06 }, tableY: H * .255, tableF: H * .47, floorY: H * .49 }
              : { person: { cx: W * .36, top: H * .3, P: H * .36 }, win: [W * .18, H * .05, W * .32, H * .3], cand: { x: W * .6, top: H * .33, base: H * .43, r: 8 }, book: { cx: W * .53, cy: H * .5, w: W * .105, d: H * .07 }, tableY: H * .36, tableF: H * .6, floorY: H * .625 };
  L.flame = [L.cand.x, L.cand.top - 2]; L.LP = [L.flame[0], L.flame[1] - (V ? 9 : 6)];
  L.zEnd = V ? 2.8 : 3.4;   // the close-up on the pages after the camera passes over his shoulder (2026-11-14: less close, was 4.7 : 6.5)
  return Object.assign(L, { W, H, V, S: V ? 2 : 1.6, R0: V ? W : H, sc: 1, tx0: -W * .15, tx1: W * 1.15 });
}
// 'end' (관리자 2026-11-14: the film returns to this room and ends here, the end card over it): the same room seen from further
// back — a tall window on the left of the back wall, the low table, the old man small in the lower middle. The quiet wall between
// the window and the table is where the end card sits (portrait y .24–.50, x .2–.8: no window edge, no detail there); the man,
// the candle and the key light stay above the words' band (.64). His folded hands (hidden by him, as in the opening) rest on the
// table just beyond his right shoulder — L.hands, where the dawn arrives at Q14 — and the open Bible lies beside them.
function roomLayoutEnd() {
  const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
  const L = V ? { person: { cx: W * .4, top: H * .517, P: H * .118 }, win: [W * .05, H * .11, W * .152, H * .43], cand: { x: W * .7, top: H * .515, base: H * .546, r: 5.5 }, tableY: H * .506, tableF: H * .578, floorY: H * .592, tx0: -W * .05, tx1: W * 1.08, bw: W * .17, bd: H * .024 }
              : { person: { cx: W * .44, top: H * .565, P: H * .175 }, win: [W * .1, H * .09, W * .19, H * .54], cand: { x: W * .625, top: H * .56, base: H * .615, r: 4.5 }, tableY: H * .555, tableF: H * .66, floorY: H * .675, tx0: -W * .05, tx1: W * 1.05, bw: W * .075, bd: H * .036 };
  const p = L.person, hx = p.cx + .25 * p.P, hy = p.top + .22 * p.P;
  L.hands = [hx, hy]; L.book = { cx: hx + L.bw * .4, cy: hy + L.bd * .15, w: L.bw, d: L.bd };
  L.flame = [L.cand.x, L.cand.top - 1]; L.LP = [L.flame[0], L.flame[1] - (V ? 5 : 4)];
  return Object.assign(L, { W, H, V, S: V ? 2 : 1.6, R0: (V ? W : H) * .45, sc: .45, end: true });
}

// the candle: brass holder, a pillar lit from its flame, wax run down one side (frame px)
function roomCandle(g, L, a = 1) {
  const { x: cx, top, base, r: cr } = L.cand, ch = base - top;
  const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([k, col]) => gr.addColorStop(k, col)); return gr; };
  g.save(); g.globalAlpha = a;
  g.fillStyle = '#3a2410'; g.beginPath(); g.ellipse(cx, base + cr * .25, cr * 2.3, cr * .62, 0, 0, 6.283); g.fill();
  g.fillStyle = lin(cx - cr * 2, 0, cx + cr * 2, 0, [[0, '#5a3a14'], [.55, '#d8a858'], [1, '#7a5220']]); g.beginPath(); g.ellipse(cx, base, cr * 2.1, cr * .5, 0, 0, 6.283); g.fill();
  g.fillStyle = lin(cx - cr, 0, cx + cr, 0, [[0, '#6a4c32'], [.4, '#e0ccaa'], [.68, '#fff0d4'], [1, '#a88866']]); g.fillRect(cx - cr, top, cr * 2, ch);
  g.fillStyle = lin(0, top, 0, base, [[0, 'rgba(255,238,196,.9)'], [.35, 'rgba(255,230,180,0)']]); g.fillRect(cx - cr, top, cr * 2, ch);
  g.fillStyle = '#fff0d0'; g.beginPath(); g.ellipse(cx, top, cr, cr * .3, 0, 0, 6.283); g.fill();
  g.fillStyle = '#e8d6b4'; g.beginPath(); g.moveTo(cx - cr * .2, top); g.quadraticCurveTo(cx - cr * 1.06, top + ch * .2, cx - cr * .8, top + ch * .46); g.quadraticCurveTo(cx - cr * .55, top + ch * .2, cx - cr * .05, top); g.fill();
  g.restore();
}

// the figure seen from behind, in units of its height P (origin = top of the head, y down): the back of a bowed head with short
// permed hair, the cardigan collar, round sloping shoulders, the upper arms with the elbows out a little, the back running down
function roomPersonPaths() {
  const smooth = pts => { const p = new Path2D(), n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
    p.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) p.quadraticCurveTo(pts[i][0], pts[i][1], ...m(i)); p.closePath(); return p; };
  const fuzz = (pts, a0 = .007) => { const out = [], r = Pilot.rng(29); for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; for (let k = 0; k < 4; k++) { const t = k / 4; out.push([a[0] + (b[0] - a[0]) * t + (r() - .5) * a0, a[1] + (b[1] - a[1]) * t + (r() - .5) * a0]); } } return out; };
  // the head: a core and a crown of curls of different sizes round its top and sides (no ball)
  const hc = [.004, .14], curls = [], rc = Pilot.rng(37);   // bowed: the head sunk toward the collar
  for (let i = 0; i < 17; i++) { const a = Math.PI * (.92 + 1.16 * i / 16) + (rc() - .5) * .12, R = .026 + rc() * .016, d = .07 + rc() * .01; curls.push([Math.cos(a) * d, Math.sin(a) * d * 1.05, R]); }
  const head = smooth(Array.from({ length: 120 }, (_, i) => { const a = i / 120 * 6.283, dx = Math.cos(a), dy = Math.sin(a);
    let t = 1 / Math.hypot(dx / .082, dy / .088);                                        // the core ellipse
    for (const [cx, cy, R] of curls) { const b = dx * cx + dy * cy, q = b * b - (cx * cx + cy * cy - R * R); if (q >= 0) t = Math.max(t, b + Math.sqrt(q)); }
    t *= 1.12; return [hc[0] + dx * t, hc[1] + .008 + dy * t]; }));   // (a touch larger than before: with the slighter body, ≈ 2.2 head widths across the shoulders)
  const neck = smooth([[-.05, .2], [.05, .2], [.06, .255], [-.06, .255]]);
  // 관리자 2026-11-14 "사람몸이 너무 덩치가 커 머리에비해": the shoulders ≈ 2.5 head widths (was ≈ 3.8), a slight old back that
  // narrows to the waist, the folded legs on the floor only a little wider than the shoulders — a slight seated old person
  const body = smooth(fuzz([[-.315, .985], [-.325, .93], [-.305, .86], [-.27, .79], [-.25, .72], [-.262, .64], [-.27, .56], [-.265, .47], [-.25, .395], [-.22, .335], [-.165, .29], [-.1, .262], [-.05, .248], [.0, .244],
    [.05, .248], [.1, .262], [.165, .29], [.22, .335], [.25, .395], [.265, .47], [.27, .56], [.262, .64], [.25, .72], [.27, .79], [.305, .86], [.325, .93], [.315, .985], [.0, 1.0]]));
  const collar = smooth([[-.115, .262], [-.06, .232], [.0, .225], [.065, .232], [.12, .262], [.065, .284], [.0, .29], [-.065, .284]]);
  return { head, neck, body, collar };
}

// 'end' (round 8: the old man read as a bell-shaped lump with a white sticker rim): the same old man seen from behind, a little
// turned toward the book on his right, as a person — the bowed head of grey permed hair on its nape, sloping shoulders, the cardigan
// with its two arms hanging from the shoulders to the elbows (bent forward: his hands rest on the table in front of him, hidden),
// a notch of shade under each elbow, the cardigan's ribbed hem across the small of the back, the folded legs on the floor a little
// wider. Units of his height P, origin = top of the head, y down. Parts: head, ear, neck, torso, arms[2], hem, collar; fillAll(g).
function roomPersonPathsEnd() {
  const smooth = pts => { const p = new Path2D(), n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
    p.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) p.quadraticCurveTo(pts[i][0], pts[i][1], ...m(i)); p.closePath(); return p; };
  const hc = [.012, .125], curls = [], rc = Pilot.rng(37);
  for (let i = 0; i < 19; i++) { const a = Math.PI * (.86 + 1.28 * i / 18) + (rc() - .5) * .12, R = .02 + rc() * .01, d = .068 + rc() * .008; curls.push([Math.cos(a) * d, Math.sin(a) * d * 1.05, R]); }
  const headPts = Array.from({ length: 120 }, (_, i) => { const a = i / 120 * 6.283, dx = Math.cos(a), dy = Math.sin(a);
    let t = 1 / Math.hypot(dx / .08, dy / .09);
    for (const [cx, cy, R] of curls) { const b = dx * cx + dy * cy, q = b * b - (cx * cx + cy * cy - R * R); if (q >= 0) t = Math.max(t, b + Math.sqrt(q)); }
    return [hc[0] + dx * t * 1.08, hc[1] + dy * t * 1.08]; });
  const head = smooth(headPts), ear = smooth([[.088, .14], [.1, .152], [.098, .185], [.086, .19], [.08, .16]]);
  const neck = smooth([[-.042, .19], [.05, .19], [.058, .262], [-.05, .262]]);
  const torsoPts = [[-.06, .246], [-.14, .272], [-.192, .31], [-.208, .36], [-.2, .46], [-.186, .56], [-.176, .64], [-.19, .7], [-.215, .77], [-.25, .835], [-.29, .875], [-.315, .925], [-.305, .972], [-.27, .996], [0, 1.0],
    [.27, .996], [.305, .972], [.315, .925], [.29, .875], [.25, .835], [.215, .77], [.19, .7], [.176, .64], [.186, .56], [.2, .46], [.208, .36], [.192, .31], [.14, .272], [.06, .246], [0, .24]];
  const torso = smooth(torsoPts);
  const armPts = s => [[s * .15, .282], [s * .208, .3], [s * .238, .35], [s * .25, .44], [s * .247, .53], [s * .232, .585], [s * .204, .604], [s * .176, .585], [s * .164, .5], [s * .158, .4], [s * .155, .32]];
  const arms = [-1, 1].map(s => smooth(armPts(s)));
  const hem = smooth([[-.184, .622], [.184, .622], [.19, .668], [-.192, .67]]);
  const collar = smooth([[-.1, .258], [-.05, .234], [.0, .228], [.055, .234], [.105, .258], [.06, .28], [.0, .286], [-.06, .28]]);
  const fillAll = g => { for (const p of [torso, ...arms, neck, ear, head]) g.fill(p); };   // (each on its own: their windings differ)
  return { head, ear, neck, torso, arms, hem, collar, fillAll };
}

async function buildRoomOil() {
  const { clamp, lerp, rng, canvas } = Pilot, L0 = roomLayout(), { W, H, V, S } = L0;
  ROIL.L = L0; ROIL.S = S; ROIL.LE = roomLayoutEnd();
  // the room's painter for a layout (the opening's, or the wider 'end' view of the same room); R0 = the layout's radius unit
  const painter = L => { const { book: B, cand: C, R0 } = L;
  // a page's row k (0 back … 1 front) as a quadratic gutter → outer edge; side -1 left, +1 right
  const pageRow = (side, k) => { const y = B.cy - B.d / 2 + B.d * k, f = lerp(.8, 1, k), lift = lerp(.07, .05, k) * B.d; return [B.cx, y + .015 * B.d, B.cx + side * B.w * .17 * f, y - lift, B.cx + side * B.w / 2 * f, y - lerp(.015, 0, k) * B.d]; };   // the far edge narrower (it lies on the table)

  function plate(dawn, S = ROIL.S, rect = [0, 0, W, H]) {
    const c = canvas(Math.round(rect[2] * S), Math.round(rect[3] * S)), g = c.getContext('2d'); g.save(); g.scale(S, S); g.translate(-rect[0], -rect[1]);
    const radial = (x, y, R, stops, op = 'source-over') => { g.save(); g.globalCompositeOperation = op; const gr = g.createRadialGradient(x, y, 0, x, y, R); stops.forEach(([k, col]) => gr.addColorStop(k, col)); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R); g.restore(); };
    const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([k, col]) => gr.addColorStop(k, col)); return gr; };
    const LP = L.LP, [wx0, wy0, wx1, wy1] = L.win, ww = wx1 - wx0, wh = wy1 - wy0;
    // the wall: warm darkness, warmer round the flame
    g.fillStyle = '#0b0705'; g.fillRect(0, 0, W, H);
    { const a = L.end && dawn ? .3 : 1; radial(LP[0], LP[1], .75 * R0, [[0, `rgba(176,110,54,${.95 * a})`], [.25, `rgba(100,62,30,${.75 * a})`], [.6, `rgba(40,24,12,${.5 * a})`], [1, 'rgba(11,7,5,0)']]); }   // ('end' at dawn: the candle's pool small in the day)
    // the small window beyond: deep blue before dawn (far darker than the candle) — at dawn pale gold, the room lit from it
    { g.fillStyle = dawn ? lin(0, wy0, 0, wy1, L.end ? [[0, '#b4b6c0'], [.35, '#efdcbc'], [.7, '#ffd896'], [1, '#f4b870']] : [[0, '#8ea6c4'], [.5, '#ecdcbc'], [.8, '#ffe2a8'], [1, '#f2c088']]) : lin(0, wy0, 0, wy1, [[0, '#060b13'], [.7, '#0c1827'], [1, '#122233']]); g.fillRect(wx0, wy0, ww, wh);
      g.save(); g.beginPath(); g.rect(wx0, wy0, ww, wh); g.clip();
      if (dawn && L.end) radial(wx0 + ww * .55, wy0 + wh * .86, ww * 1.6, [[0, 'rgba(255,246,214,1)'], [.3, 'rgba(255,214,140,.7)'], [1, 'rgba(255,180,100,0)']]);   // the sun low behind the far hill
      if (dawn) radial(wx0 + ww * .62, wy0 + wh * .75, ww * .9, [[0, 'rgba(255,248,226,1)'], [.25, 'rgba(255,228,176,.65)'], [1, 'rgba(255,200,140,0)']]);
      g.fillStyle = dawn ? (L.end ? '#8a7462' : '#5e6070') : '#04070c'; g.beginPath(); g.moveTo(wx0, wy1); for (let x = wx0; x <= wx1 + 4; x += 4) g.lineTo(x, wy0 + wh * (L.end ? .93 : .78) - .008 * R0 * Math.sin((x - wx0) / (.03 * R0)) - .004 * R0); g.lineTo(wx1, wy1); g.fill();
      if (!dawn) { const r = rng(9); for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(210,222,255,${.3 + .4 * r()})`; g.beginPath(); g.arc(wx0 + r() * ww, wy0 + r() * wh * .55, .9 + r(), 0, 6.283); g.fill(); } }
      g.restore();
      const fw = L.end ? .013 * W : .011 * R0; g.strokeStyle = dawn ? '#2e2016' : '#140c08'; g.lineWidth = fw * 1.6; g.strokeRect(wx0, wy0, ww, wh); g.lineWidth = fw;
      g.beginPath(); g.moveTo(wx0 + ww / 2, wy0); g.lineTo(wx0 + ww / 2, wy1); for (const k of L.end ? [.25, .5, .75] : [1 / 3, 2 / 3]) { g.moveTo(wx0, wy0 + wh * k); g.lineTo(wx1, wy0 + wh * k); } g.stroke();
      g.fillStyle = dawn ? 'rgba(236,206,160,.6)' : 'rgba(150,94,48,.4)'; g.fillRect(wx0 - fw, wy1 + fw * .4, ww + fw * 2, fw * .5);
      if (dawn) { radial(wx0 + ww / 2, wy0 + wh / 2, 1.0 * R0, [[0, 'rgba(230,220,206,.45)'], [.35, 'rgba(170,170,180,.18)'], [1, 'rgba(120,120,130,0)']], 'screen'); } }
    // the low table: its top lit round the candle and from the pages, a dark front edge, short legs; beyond and below, the oiled
    // paper floor (장판) warm in the candle light, falling into dark toward us
    { const y0 = L.tableY, yf = L.tableF, yF = L.floorY, x0 = L.tx0, x1 = L.tx1, hs = H * L.sc;
      g.fillStyle = lin(0, yF, 0, H, [[0, '#6a4622'], [.35, '#4e3218'], [1, '#1a0f07']]); g.fillRect(0, y0, W, H - y0);
      radial(L.cand.x - .15 * R0, yF + .08 * R0, 1.05 * R0, [[0, 'rgba(226,164,90,.75)'], [.4, 'rgba(160,104,52,.42)'], [1, 'rgba(40,24,12,0)']]);
      { const r = rng(5); g.strokeStyle = 'rgba(20,12,6,.18)'; g.lineWidth = .002 * R0; for (let i = -6; i < 12; i++) { const y = yF + (H - yF) * (i / 10) ** 1.4; if (y < yF) continue; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        if (!L.end) for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(W * .5 + i * .09 * R0, yF); g.lineTo(W * .5 + i * .26 * R0, H); g.stroke(); } }   // the floor's paper squares, faint
      g.fillStyle = lin(0, yf, 0, yF + .04 * hs, [[0, '#1a0f07'], [1, '#0c0704']]); g.fillRect(x0, yf, x1 - x0, yF - yf + .005 * hs);
      g.fillRect(x0 + .02 * R0, yF, .025 * R0, .035 * hs); g.fillRect(x1 - .045 * R0, yF, .025 * R0, .035 * hs);   // the legs
      g.fillStyle = lin(0, y0, 0, yf, [[0, '#24150a'], [.5, '#3a2210'], [1, '#2a180a']]); g.fillRect(x0, y0, x1 - x0, yf - y0);
      g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, yf - y0); g.clip();
      radial(L.cand.x - .03 * R0, L.cand.base + .03 * R0, .55 * R0, [[0, 'rgba(244,170,94,.95)'], [.35, 'rgba(180,112,58,.6)'], [1, 'rgba(60,36,18,0)']]);
      radial(B.cx, B.cy + B.d * .5, .4 * R0, [[0, 'rgba(226,166,104,.4)'], [1, 'rgba(120,80,40,0)']]);
      const r = rng(17); g.lineCap = 'round'; for (let y = y0; y < yf; y += .004 * R0 + r() * .008 * R0) { g.strokeStyle = `rgba(${r() < .55 ? '10,6,3' : '190,128,72'},${.06 + .08 * r()})`; g.lineWidth = .0015 * R0 + r() * .002 * R0; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y + (r() - .5) * .004 * R0); g.stroke(); }
      g.restore();
      g.fillStyle = 'rgba(230,150,80,.5)'; g.fillRect(x0, yf - .003 * R0, x1 - x0, .003 * R0);   // the front edge catches the flame
      g.fillStyle = lin(0, y0, 0, y0 + .03 * hs, [[0, 'rgba(10,6,4,.7)'], [1, 'rgba(10,6,4,0)']]); g.fillRect(x0, y0, x1 - x0, .03 * hs); }
    { g.save(); g.filter = `blur(${(.006 * R0 * S).toFixed(1)}px)`; g.fillStyle = 'rgba(10,5,2,.75)'; g.beginPath(); g.ellipse(L.cand.x + .004 * R0, L.cand.base + L.cand.r * .4, L.cand.r * 2.6, L.cand.r * .75, 0, 0, 6.283); g.fill(); g.restore(); }   // the holder's shadow on the table
    roomCandle(g, L);
    // the open Bible: dark cover, two pages bowed up from the gutter, the gilt page block toward us, a red ribbon
    { const x0 = B.cx - B.w / 2, x1 = B.cx + B.w / 2, yb = B.cy - B.d / 2, yf = B.cy + B.d / 2;
      g.save(); g.filter = `blur(${(.012 * R0 * S).toFixed(1)}px)`; g.fillStyle = 'rgba(8,4,2,.6)'; g.beginPath(); g.moveTo(B.cx - B.w * .42, yb + .08 * B.d); g.lineTo(B.cx + B.w * .42, yb + .08 * B.d); g.lineTo(x1 + .02 * R0, yf + .2 * B.d); g.lineTo(x0 - .02 * R0, yf + .2 * B.d); g.closePath(); g.fill(); g.restore();   // its shadow on the table
      g.fillStyle = '#0c0705'; g.beginPath(); g.moveTo(B.cx - B.w * .41 - 6, yb + 4); g.lineTo(B.cx + B.w * .41 + 6, yb + 4); g.lineTo(x1 + 12, yf + .1 * B.d); g.lineTo(x0 - 12, yf + .1 * B.d); g.closePath(); g.fill();
      for (const side of [-1, 1]) { const a = pageRow(side, 0), b = pageRow(side, 1), t = .07 * B.d;
        g.fillStyle = lin(0, b[1], 0, b[1] + t, [[0, '#c89a50'], [1, '#6a4a20']]); g.beginPath(); g.moveTo(b[0], b[1]); g.quadraticCurveTo(b[2], b[3], b[4], b[5]); g.lineTo(b[4], b[5] + t); g.quadraticCurveTo(b[2], b[3] + t * 1.1, b[0], b[1] + t); g.closePath(); g.fill();
        const pg = new Path2D(); pg.moveTo(a[0], a[1]); pg.quadraticCurveTo(a[2], a[3], a[4], a[5]); pg.lineTo(b[4], b[5]); pg.quadraticCurveTo(b[2], b[3], b[0], b[1]); pg.closePath();
        g.fillStyle = lin(B.cx + side * B.w / 2, 0, B.cx, 0, side > 0 ? [[0, '#e8d0a2'], [.45, '#fae8c4'], [.9, '#e2c494'], [1, '#9a744a']] : [[0, '#a88458'], [.5, '#e4c898'], [.9, '#d8b888'], [1, '#8a6640']]); g.fill(pg); }
      g.strokeStyle = 'rgba(50,28,14,.6)'; g.lineWidth = .005 * R0; g.beginPath(); g.moveTo(B.cx, yb + .02 * B.d); g.lineTo(B.cx, yf + .03 * B.d); g.stroke();
      g.strokeStyle = '#741410'; g.lineWidth = .009 * R0; g.lineCap = 'round'; g.beginPath(); g.moveTo(B.cx + .004 * R0, B.cy - B.d * .2); g.bezierCurveTo(B.cx + .014 * R0, B.cy + B.d * .3, B.cx, B.cy + B.d * .5, B.cx + .03 * R0, yf + .25 * B.d); g.stroke(); }
    // the candle bleeds into the paper; the light itself glazed over what is near it
    radial(C.x, B.cy - B.d * .2, .5 * R0, [[0, 'rgba(255,200,130,.45)'], [1, 'rgba(255,180,110,0)']], 'screen');
    radial(LP[0], LP[1], .42 * R0, [[0, 'rgba(255,236,190,.5)'], [.25, 'rgba(240,180,100,.2)'], [1, 'rgba(200,130,60,0)']], 'screen');
    // dawn: the window's bars cast long soft shadows across the table toward us
    // 'end' at dawn: the light of the tall window lies on the floor toward us (a long patch leaning right, the bars' soft shadows in
    // it), the room lifts with its bounce; the window wall stays the quieter plane (the end card sits on it)
    if (dawn && L.end) { g.save(); const ty = L.tableY, pr = [wx0 - .02 * W, wx1 + .03 * W, W * .98, -W * .02];   // patch: sill corners → bottom corners
      g.globalCompositeOperation = 'screen';
      g.fillStyle = lin(0, 0, 0, H, [[0, 'rgba(84,70,60,.5)'], [.45, 'rgba(112,92,72,.5)'], [.6, 'rgba(168,128,84,.6)'], [1, 'rgba(130,96,60,.5)']]); g.fillRect(0, 0, W, H);
      radial(wx0 + ww * .5, ty, .9 * W, [[0, 'rgba(255,226,180,.42)'], [.4, 'rgba(220,180,130,.18)'], [1, 'rgba(160,120,80,0)']], 'screen');
      g.filter = `blur(${(.03 * W * S).toFixed(1)}px)`;
      const fan = new Path2D(); fan.moveTo(pr[0], ty); fan.lineTo(pr[1], ty); fan.lineTo(pr[2], H); fan.lineTo(pr[3], H); fan.closePath();
      g.fillStyle = lin(0, ty, 0, H, [[0, 'rgba(255,232,190,.75)'], [.35, 'rgba(250,214,160,.55)'], [1, 'rgba(220,170,110,.38)']]); g.fill(fan);
      g.save(); g.clip(fan); g.globalCompositeOperation = 'multiply'; g.strokeStyle = 'rgba(120,96,80,.8)'; g.lineWidth = .012 * W;
      const fx0 = (pr[0] + pr[1]) / 2, fx1 = (pr[2] + pr[3]) / 2; g.beginPath(); g.moveTo(fx0, ty); g.lineTo(fx1, H); g.stroke();
      for (const k of [.22, .5]) { const y = ty + (H - ty) * k * k * 1.6; g.beginPath(); g.moveTo(lerp(pr[0], pr[3], (y - ty) / (H - ty)), y); g.lineTo(lerp(pr[1], pr[2], (y - ty) / (H - ty)), y + .01 * H); g.stroke(); }
      g.restore(); g.restore(); }
    else if (dawn) { g.save(); g.globalCompositeOperation = 'screen'; g.filter = `blur(${(.02 * R0 * S).toFixed(1)}px)`;
      const fan = new Path2D(); fan.moveTo(wx0, wy1); fan.lineTo(wx1, wy1); fan.lineTo(W * .95, H); fan.lineTo(-W * .25, H); fan.closePath();
      g.fillStyle = lin(0, wy1, 0, H, [[0, 'rgba(210,214,226,.32)'], [.4, 'rgba(200,204,220,.2)'], [1, 'rgba(180,190,210,.06)']]); g.fill(fan);
      g.globalCompositeOperation = 'multiply'; g.strokeStyle = 'rgba(70,66,76,.7)'; g.lineWidth = .026 * R0;
      const bar = (x0, x1) => { g.beginPath(); g.moveTo(x0, L.tableY + .01 * H); g.lineTo(x1, H); g.stroke(); };
      bar(wx0 + ww / 2, W * .35); g.lineWidth = .02 * R0; for (const k of [.3, .55]) { g.beginPath(); g.moveTo(-W * .1, L.floorY + (H - L.floorY) * k); g.lineTo(W * 1.1, L.floorY + (H - L.floorY) * k + .03 * H); g.stroke(); }
      g.restore(); }
    g.restore(); return c;
  }
  // over the painting: the print (no letters), the candle crisp; then the near table out of focus
  function crisp(art, S = ROIL.S, rect = [0, 0, W, H]) {
    const a = art.getContext('2d'), CW = art.width, CH = art.height;
    { const tc = canvas(CW, CH), t = tc.getContext('2d'); t.scale(S, S); t.translate(-rect[0], -rect[1]); const r = rng(35);
      for (const side of [-1, 1]) for (let k = .07; k < .95; k += .036) { const [x0, y0, qx, qy, x1, y1] = pageRow(side, k);
        for (const [c0, c1] of [[.08, .47], [.53, .92]]) { let t0 = c0; while (t0 < c1) { const t1 = Math.min(c1, t0 + .08 + r() * .2), pt = u => { const m = 1 - u; return [m * m * x0 + 2 * m * u * qx + u * u * x1, m * m * y0 + 2 * m * u * qy + u * u * y1]; };
            const A = pt(t0), Bq = pt(t1); t.strokeStyle = `rgba(90,60,36,${.15 + .08 * r()})`; t.lineWidth = (V ? .9 : .7) * Math.max(1, 2 / S * 1.6); t.beginPath(); t.moveTo(...A); t.lineTo(...Bq); t.stroke(); t0 = t1 + .006 + r() * .008; } } }
      a.drawImage(tc, 0, 0); }
    a.save(); a.scale(S, S); a.translate(-rect[0], -rect[1]); roomCandle(a, L, .55); a.restore();
    { const y0 = Math.round(((V ? H * .66 : H * .8) - rect[1]) * S); if (y0 < CH) { const yy = Math.max(0, y0), tc = canvas(CW, CH - yy), t = tc.getContext('2d');
      t.filter = `blur(${(V ? 9 : 7) * S}px)`; t.drawImage(art, 0, -yy); t.filter = 'none';
      t.globalCompositeOperation = 'destination-in'; const gr = t.createLinearGradient(0, y0 - yy, 0, y0 - yy + (V ? H * .34 : H * .2) * S * .6); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); t.fillStyle = gr; t.fillRect(0, 0, CW, CH - yy);
      a.drawImage(tc, 0, yy); } }
  }
  return { pageRow, plate, crisp }; };
  const L = L0, B = L.book, { pageRow, plate, crisp } = painter(L); ROIL.pageRow = pageRow;
  const paintOpt = { key: 'rembrandt', S, seed: 17, len: [4, 7.5], jit: .04, wid: V ? 1 / 150 : 1 / 200, cell: V ? 6 : 5.5, dirAt: (x, y) => -1.25 + 1.1 * (Pilot.noise(x / 420, y / 420) - .5) };
  for (const dawn of [false, true]) { const art = OIL.paint(plate(dawn), paintOpt); crisp(art); ROIL[dawn ? 'dawn' : 'night'] = art; }
  // 'end': the wider view of the same room, night and dawn, painted with the same hand
  // (round 8: the window's edge, painted over, showed as a ragged white strip at the frame's edge) the window itself is laid back
  // in from the unpainted plate — straight frame, bars and sill — through a mask feathered just outside the frame, so the brush
  // texture of the wall meets a clean window
  { const pE = painter(ROIL.LE), LE = ROIL.LE; for (const dawn of [false, true]) { const pl = pE.plate(dawn), art = OIL.paint(pl, paintOpt); pE.crisp(art);
      const [x0, y0, x1, y1] = LE.win, fw = .013 * W, m = fw * 1.15, R = [(x0 - m) * S, (y0 - m) * S, (x1 - x0 + 2 * m) * S, (y1 - y0 + 2 * m) * S].map(Math.round), mc = canvas(art.width, art.height), mx = mc.getContext('2d');
      mx.filter = `blur(${(fw * .2 * S).toFixed(1)}px)`; mx.fillStyle = '#fff'; mx.fillRect(...R); mx.filter = 'none'; mx.globalCompositeOperation = 'source-in'; mx.drawImage(pl, 0, 0);
      art.getContext('2d').drawImage(mc, 0, 0); ROIL[dawn ? 'endD' : 'endN'] = art; } }
  // the page close-up: the same room repainted for a rectangle round the right-hand page, finer (the camera ends L.zEnd times in)
  { const page = [B.cx + B.w * .24, B.cy - B.d * .05], mid = [(L.person.cx + L.flame[0]) / 2 + .02 * W, L.person.top + .3 * L.person.P], ze = L.zEnd;
    const rw = W / ze * 3.2, rh = H / ze * 2.6, cx = page[0] + .25 * (mid[0] - page[0]), cy = page[1] + .25 * (mid[1] - page[1]), rect = [cx - rw / 2, cy - rh / 2, rw, rh], Sc = ze * .85;
    const art = OIL.paint(plate(false, Sc, rect), { ...paintOpt, S: Sc, wid: paintOpt.wid * 2.2 / ze, cell: paintOpt.cell * 2.2 / ze }); crisp(art, Sc, rect);
    ROIL.close = { art, rect, Sc }; }

  // the figure: a canvas of its own (plate scale), body almost black with a faint warm turn at the edges; its rim on a second
  // canvas (gold from the candle, silver on the grey hair; at dawn a cool rim from the window as well), so the rim can flicker
  // ('end': the same figure at its smaller size — still no hands drawn: the dawn reaches them on the table beyond his shoulder)
  const figOf = L => { const Pp = L.person.P, Pa = roomPersonPaths(), pad = .25, bw = Math.ceil((1 + 2 * pad) * Pp * S), bh = Math.ceil((1 + 2 * pad) * Pp * S);
    const toP = g => { g.setTransform(Pp * S, 0, 0, Pp * S, (.5 + pad) * Pp * S, pad * Pp * S); };   // P units → layer px (head top-centre at (.5+pad, pad)·P)
    const mask = canvas(bw, bh), mg = mask.getContext('2d'); toP(mg); mg.fillStyle = '#fff'; mg.fill(Pa.body); mg.fill(Pa.neck); mg.fill(Pa.head);
    const body = canvas(bw, bh), bg = body.getContext('2d'); toP(bg);
    bg.save(); bg.filter = `blur(${(.03 * Pp * S).toFixed(1)}px)`; bg.fillStyle = 'rgba(8,4,2,.7)'; bg.beginPath(); bg.ellipse(0, .99, .37, .045, 0, 0, 6.283); bg.fill(); bg.restore();   // its shadow on the floor
    { const gr = bg.createLinearGradient(0, 0, 0, 1); gr.addColorStop(0, '#1a110b'); gr.addColorStop(.4, '#120b07'); gr.addColorStop(1, '#0a0604'); bg.fillStyle = gr; bg.fill(Pa.body); }
    bg.fillStyle = '#100a07'; bg.fill(Pa.neck); bg.fillStyle = '#17110c'; bg.fill(Pa.head);
    // inside the dark: the hair's mass a touch lighter (grey), the collar's fold, the shoulder blades under the wool — barely there
    bg.save(); bg.clip(Pa.head); bg.filter = `blur(${(.008 * Pp * S).toFixed(1)}px)`; const r = rng(23);
    for (let i = 0; i < 70; i++) { const a = r() * 6.283, rr = r() * .1, x = .012 + Math.cos(a) * rr, y = .118 + Math.sin(a) * rr * 1.1; bg.fillStyle = `rgba(${70 + 40 * r() | 0},${64 + 34 * r() | 0},${58 + 30 * r() | 0},.06)`; bg.beginPath(); bg.ellipse(x, y, .012 + r() * .012, .008 + r() * .008, r() * 3, 0, 6.283); bg.fill(); }
    bg.restore();
    bg.save(); bg.filter = `blur(${(.006 * Pp * S).toFixed(1)}px)`; bg.fillStyle = 'rgba(48,32,22,.6)'; bg.fill(Pa.collar); bg.fillStyle = 'rgba(4,2,1,.7)'; bg.beginPath(); bg.ellipse(.0, .29, .12, .02, 0, 0, 6.283); bg.fill();
    bg.strokeStyle = 'rgba(2,1,0,.85)'; bg.lineWidth = .016; for (const s of [-1, 1]) { bg.beginPath(); bg.moveTo(s * .19, .38); bg.quadraticCurveTo(s * .215, .52, s * .212, .68); bg.stroke(); }   // the arm parting from the back
    bg.strokeStyle = 'rgba(70,48,32,.18)'; bg.lineWidth = .008; for (const s of [-1, 1]) { bg.beginPath(); bg.moveTo(s * .178, .385); bg.quadraticCurveTo(s * .2, .52, s * .198, .67); bg.stroke(); }
    bg.strokeStyle = 'rgba(90,62,40,.45)'; bg.lineWidth = .008; bg.beginPath(); bg.moveTo(-.11, .258); bg.quadraticCurveTo(0, .218, .115, .258); bg.stroke();   // the collar's top edge
    bg.restore();
    // a rim: the shape minus itself shifted away from the light (so the band sits on the edges that face it), blurred, coloured
    const rimOf = (lx, ly, k, col, hairCol) => { const c = canvas(bw, bh), g = c.getContext('2d'), d = k * Pp * S;
      g.drawImage(mask, 0, 0); g.globalCompositeOperation = 'destination-out'; g.drawImage(mask, -lx * d, -ly * d);
      g.globalCompositeOperation = 'source-in'; toP(g); g.fillStyle = col; g.fillRect(-1, -1, 3, 3);
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';                                  // the hair part of the band silver
      { const hm = canvas(bw, bh), h = hm.getContext('2d'); toP(h); h.fillStyle = hairCol; h.fill(Pa.head); g.drawImage(hm, 0, 0); }
      const out = canvas(bw, bh), o = out.getContext('2d');
      o.filter = `blur(${(.02 * Pp * S).toFixed(1)}px)`; o.globalAlpha = .9; o.drawImage(c, 0, 0);                    // the glow beyond the edge
      o.filter = `blur(${(.0035 * Pp * S).toFixed(1)}px)`; o.globalAlpha = 1; o.drawImage(c, 0, 0);                   // the bright edge itself
      return out; };
    // the candle is beyond the figure, up and to the right of its head: the light comes from there
    const [hx, hy] = [L.person.cx, L.person.top + .12 * Pp], ldx = L.LP[0] - hx, ldy = L.LP[1] - hy - .9 * Pp, ll = Math.hypot(ldx, ldy), lx = ldx / ll, ly = ldy / ll;
    return { body, bw, bh, pad, Pp, rimN: rimOf(lx, ly, .011, '#ffc070', '#f4ece0'),
      rimD: rimOf(-.7, -.7, .02, '#cfdcf0', '#eef4ff'),   // dawn: the window is up and to the left
      rimW: L.end ? rimOf(-.85, -.53, .03, '#f6c486', '#f4e2c4') : null };   // 'end' Q14: the warm dawn shaft arriving on his shoulders and the left of his head
  };
  // 'end' (round 8): the old man as a person seen from behind (roomPersonPathsEnd), in two states painted once — night (almost black,
  // the candle on his right finding the edge of his hair and right shoulder) and day (the room's dawn fill: the grey of his hair, the
  // cardigan's wool, the arms parted from the back by shade) — and the dawn from the window on his left as a soft warm light lying
  // INSIDE his shape on the head, the nape and the left shoulder and arm, strongest at the top, gone by the small of the back: no
  // outline round him, no rim on the far side
  const figEndOf = (L, near) => {   // near: the opening's close view (the candle's edge is the protagonist there: wider, brighter)
 const Pp = L.person.P, Pa = roomPersonPathsEnd(), pad = .25, bw = Math.ceil((1 + 2 * pad) * Pp * S), bh = Math.ceil((1 + 2 * pad) * Pp * S), U = Pp * S;
    const toP = g => { g.setTransform(U, 0, 0, U, (.5 + pad) * U, pad * U); }, mk = () => { const c = canvas(bw, bh); return [c, c.getContext('2d')]; };
    const [mask, mg] = mk(); toP(mg); mg.fillStyle = '#fff'; Pa.fillAll(mg);
    const lg = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([k, c]) => gr.addColorStop(k, c)); return gr; };
    const blob = (g, x, y, rx, ry, col) => { g.save(); g.translate(x, y); g.scale(rx, ry); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, col); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)')); g.fillStyle = gr; g.fillRect(-1, -1, 2, 2); g.restore(); };
    // the light's directions in the plate: the window up on his left, the candle on the table to his right
    const [hx, hy] = [L.person.cx, L.person.top + .12 * Pp], wcx = (L.win[0] + L.win[2]) / 2, wcy = (L.win[1] + L.win[3]) / 2, wl = Math.hypot(wcx - hx, wcy - hy), WL = [(wcx - hx) / wl, (wcy - hy) / wl];
    const cl = Math.hypot(L.LP[0] - hx, L.LP[1] - hy - .5 * Pp), CL = [(L.LP[0] - hx) / cl, (L.LP[1] - hy - .5 * Pp) / cl];
    const paint = (day) => { const [c, g] = mk(); toP(g);
      g.save(); g.filter = `blur(${(.03 * U).toFixed(1)}px)`; g.fillStyle = day ? 'rgba(20,10,4,.55)' : 'rgba(8,4,2,.7)'; g.beginPath(); g.ellipse(day ? .06 : 0, .99, .4, .045, 0, 0, 6.283); g.fill(); g.restore();   // his shadow on the floor (by day thrown a little right)
      const C = day ? { t0: '#3e3229', t1: '#2a201a', t2: '#231a14', arm: '#45382e', hem: '#4c3e33', hair: '#66615a', hairD: '#36322d', neck: '#5e4434', ear: '#6e4e3e' }
                    : { t0: '#1c130d', t1: '#150e09', t2: '#0c0705', arm: '#1e150e', hem: '#21170f', hair: '#2a241f', hairD: '#17120e', neck: '#120b07', ear: '#1a110b' };
      g.fillStyle = lg(g, 0, .25, 0, 1, [[0, C.t0], [.45, C.t1], [1, C.t2]]); g.fill(Pa.torso);
      g.save(); g.clip(Pa.torso);   // the back: its bowed top a little lighter, the spine's soft valley, the far (right) side away from the window darker
      g.fillStyle = lg(g, -.2, 0, .22, 0, [[0, 'rgba(255,230,200,0)'], [.55, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${day ? .32 : .2})`]]); g.fillRect(-.4, 0, .8, 1.05);
      blob(g, -.02, .34, .17, .1, `rgba(255,236,210,${day ? .1 : .03})`); blob(g, .0, .46, .022, .14, `rgba(0,0,0,${day ? .22 : .1})`);
      g.fillStyle = C.hem; g.fill(Pa.hem); g.strokeStyle = `rgba(0,0,0,${day ? .22 : .12})`; g.lineWidth = .006; for (let x = -.185; x < .19; x += .018) { g.beginPath(); g.moveTo(x, .626); g.lineTo(x + .002, .666); g.stroke(); }   // the ribbed hem
      g.fillStyle = `rgba(0,0,0,${day ? .22 : .2})`; g.fillRect(-.3, .668, .6, .018);
      g.fillStyle = lg(g, 0, .68, 0, 1, [[0, 'rgba(0,0,0,.08)'], [1, `rgba(0,0,0,${day ? .22 : .45})`]]); g.fillRect(-.4, .68, .8, .4);   // the folded legs below, in their own shade
      g.restore();
      for (const [i, s] of [[0, -1], [1, 1]]) { const A = Pa.arms[i];   // the arms: shade where each parts from the back, the sleeve rounder toward the window
        g.save(); g.filter = `blur(${(.012 * U).toFixed(1)}px)`; g.fillStyle = `rgba(0,0,0,${day ? .55 : .7})`; g.translate(-s * .012, .006); g.fill(A); g.restore();
        g.fillStyle = lg(g, s * .15, 0, s * .25, 0, s < 0 ? [[0, C.arm], [1, C.arm]] : [[0, C.arm], [1, C.t1]]); g.fill(A);
        g.save(); g.clip(A); g.fillStyle = lg(g, 0, .3, 0, .6, [[0, 'rgba(255,236,210,0)'], [.7, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${day ? .3 : .2})`]]); g.fillRect(-.4, .25, .8, .4);
        g.strokeStyle = `rgba(0,0,0,${day ? .25 : .15})`; g.lineWidth = .008; g.beginPath(); g.moveTo(s * .2, .5); g.quadraticCurveTo(s * .215, .555, s * .232, .575); g.stroke(); g.restore(); }   // the elbow's crease
      g.fillStyle = C.neck; g.fill(Pa.neck); g.fillStyle = C.ear; g.fill(Pa.ear);
      g.save(); g.filter = `blur(${(.006 * U).toFixed(1)}px)`; g.fillStyle = day ? 'rgba(70,54,44,.9)' : 'rgba(40,26,18,.7)'; g.fill(Pa.collar); g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(.005, .272, .07, .016, 0, 0, 6.283); g.fill(); g.restore();   // the collar under the nape, the head's shade on it
      g.fillStyle = lg(g, -.08, .05, .1, .2, [[0, C.hair], [1, C.hairD]]); g.fill(Pa.head);
      g.save(); g.clip(Pa.head); g.filter = `blur(${(.005 * U).toFixed(1)}px)`; const r = rng(23);   // the permed curls: small lighter and darker turns
      for (let i = 0; i < 90; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * .1, x = .012 + Math.cos(a) * rr, y = .125 + Math.sin(a) * rr; const lt = r() < .5;
        g.fillStyle = lt ? `rgba(${day ? '170,164,156' : '90,80,70'},${day ? .16 : .1})` : `rgba(0,0,0,${day ? .22 : .15})`; g.beginPath(); g.ellipse(x, y, .007 + r() * .008, .005 + r() * .005, r() * 3, 0, 6.283); g.fill(); }
      g.restore(); return c; };
    // a light lying inside the shape on the edges that face it (the shape minus itself moved away from the light, blurred, kept inside),
    // weighted by where it falls (wt: [cx, cy, rx, ry] in P units — strongest there, fading out)
    const inside = (dir, k, col, blurK, wt, sharpA) => { const [e, eg] = mk(), d = k * U;
      eg.drawImage(mask, 0, 0); eg.globalCompositeOperation = 'destination-out'; eg.drawImage(mask, -dir[0] * d, -dir[1] * d);
      eg.globalCompositeOperation = 'source-in'; eg.fillStyle = col; eg.fillRect(0, 0, bw, bh);
      const [o, og] = mk(); og.filter = `blur(${(blurK * U).toFixed(1)}px)`; og.drawImage(e, 0, 0); og.filter = `blur(${(.004 * U).toFixed(1)}px)`; og.globalAlpha = sharpA; og.drawImage(e, 0, 0); og.globalAlpha = 1; og.filter = 'none';
      og.globalCompositeOperation = 'destination-in'; og.drawImage(mask, 0, 0);
      toP(og); const [cx, cy, rx, ry] = wt; og.translate(cx, cy); og.scale(rx, ry); const gr = og.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, '#000'); gr.addColorStop(.5, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); og.fillStyle = gr; og.fillRect(-1, -1, 2, 2);
      return o; };
    const sideX = Math.sign(WL[0]) || -1;
    return { body: paint(false), bodyD: paint(true), bw, bh, pad, Pp,
      rimN: near ? inside(CL, .03, '#ffc274', .014, [.14, .24, .36, .42], 1) : inside(CL, .022, '#ffbe6a', .012, [.12, .2, .3, .34], .9),                              // the candle: the right of his hair and his right shoulder
      lightW: inside(WL, .07, '#ffd49a', .032, [sideX * .1, .24, .36, .44], 1),                   // the dawn: head, nape, the left shoulder and arm
      lightW2: inside([WL[0] * .4, -1], .03, '#ffd9a6', .025, [0, .18, .26, .2], .5),             // and a little on the tops of the head and shoulders
      lightK: inside(WL, .05, '#f0c48c', .03, [sideX * .2, .86, .2, .18], .6) };                   // and the near knee on the floor            // and a little on the tops of the head and shoulders
  };
  // (round 8: the same old man at the start and the end) 'open' uses the end's figure too, in its night state; the old figure stays only for 'dawn'
  ROIL.figOld = figOf(L); ROIL.fig = figEndOf(L, true); ROIL.figE = figEndOf(ROIL.LE);
  { const g = canvas(256, 256), x = g.getContext('2d'), im = x.createImageData(256, 256), r = rng(91); for (let i = 0; i < 65536; i++) { const v = 128 + (r() - .5) * 120; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0); ROIL.grain = g; }
}

// the candle's breath: 0.7…1.15, slow sway plus a quicker flutter
function roomFlick(t) { const n = Pilot.noise; return .86 + .16 * (n(t * 1.3, 4) - .5) * 2 + .07 * (n(t * 4.7, 9) - .5) * 2 + .03 * (n(t * 11, 2) - .5) * 2; }
// the flame: a candle teardrop standing on the wick at (x, y), h px tall
function roomFlame(ctx, x, y, h, t, a = 1) {
  const N = Pilot.noise, lean = (N(t * .9, 31) - .5) * h * .22 + (N(t * 3.1, 32) - .5) * h * .08, hh = h * (.9 + .2 * N(t * 2.3, 33));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  { const R = h * 3.2, gl = ctx.createRadialGradient(x, y - hh * .5, 0, x, y - hh * .5, R); gl.addColorStop(0, `rgba(255,200,120,${.42 * a})`); gl.addColorStop(.25, `rgba(255,150,70,${.14 * a})`); gl.addColorStop(1, 'rgba(160,70,20,0)');
    ctx.fillStyle = gl; ctx.fillRect(x - R, y - hh * .5 - R, 2 * R, 2 * R); }
  // the flame body is drawn soft in a small canvas of its own (a blur filter on the whole frame costs ~140 ms)
  const B = Math.ceil(h * 2.4), fc = ROIL.fc && ROIL.fc.width >= B ? ROIL.fc : (ROIL.fc = Pilot.canvas(B, B)), f = fc.getContext('2d'), ox = fc.width / 2, oy = fc.height * .72;
  f.setTransform(1, 0, 0, 1, 0, 0); f.globalCompositeOperation = 'source-over'; f.filter = 'none'; f.clearRect(0, 0, fc.width, fc.height); f.filter = `blur(${Math.max(.6, h * .05).toFixed(1)}px)`;
  const tear = (k, w, col) => { const th = hh * k, tw = h * w, tx = ox + lean * k; f.fillStyle = col; f.beginPath(); f.moveTo(ox, oy + tw * .25);
    f.bezierCurveTo(ox - tw * .62, oy + tw * .1, ox - tw * .5, oy - th * .45, tx, oy - th); f.bezierCurveTo(ox + tw * .5, oy - th * .45, ox + tw * .62, oy + tw * .1, ox, oy + tw * .25); f.fill(); };
  f.globalCompositeOperation = 'lighter'; tear(1, .42, `rgba(255,140,40,${.55 * a})`); tear(.86, .34, `rgba(255,196,90,${.8 * a})`); tear(.6, .24, `rgba(255,244,214,${.95 * a})`);
  f.fillStyle = `rgba(90,120,255,${.35 * a})`; f.beginPath(); f.ellipse(ox, oy + h * .02, h * .1, h * .07, 0, 0, 6.283); f.fill();   // the blue at the root
  f.filter = 'none'; ctx.drawImage(fc, x - ox, y - oy);
  ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = `rgba(30,16,8,${.8 * a})`; ctx.lineWidth = Math.max(1, h * .045); ctx.beginPath(); ctx.moveTo(x, y + h * .14); ctx.lineTo(x + lean * .1, y - h * .08); ctx.stroke();   // the wick
  ctx.restore();
}

// 'open' camera (관리자 2026-11-14 "첫시작에 카메라 워킹이 좀 과격하다"): ONE slow eased move over the whole shot (u 0–8.6) —
// near the candle (the table and the room already around it, z 2.2) → drawing back until the old man is found (z 1.3, u ≈ 3.8) →
// over his shoulder down onto the open Bible (z 2.8 = L.zEnd at 8.6). Each coordinate (x, y, log z) is one parabola through the
// three points in an eased progress p, so speed and zoom rate change smoothly (zoom turns from out to in without a jolt, never a
// stop, no clamping at the frame's edge): ≤ 0.24 log-zoom/s, ≤ 15 px/frame at the frame's corners (was 0.55/s, 45 px, jumps).
function roomOpenCam(L, u, page, mid) {
  const { W, H, V } = L, t = Pilot.clamp(u / 8.6), p = .3 * t + .7 * t * t * (3 - 2 * t), pm = .44, zm = 1.3;
  const P0 = [L.flame[0] - .05 * W, L.flame[1] + .06 * H, Math.log(V ? 2.2 : 2.3)], Pm = [mid[0] + .01 * W, Math.max(mid[1], H / 2 / zm + .02 * H), Math.log(zm)], P1 = [page[0], page[1], Math.log(L.zEnd)];
  const a = (p - pm) * (p - 1) / pm, b = p * (p - 1) / (pm * (pm - 1)), c = p * (p - pm) / (1 - pm);
  return [a * P0[0] + b * Pm[0] + c * P1[0], a * P0[1] + b * Pm[1] + c * P1[1], Math.exp(a * P0[2] + b * Pm[2] + c * P1[2])];
}
// camera keys → (fx, fy, z) in frame units: Catmull-Rom through the keys (velocity continuous, never a stop)
function roomCam(keys, u) {
  let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)], t = Pilot.clamp((u - k1[0]) / (k2[0] - k1[0]));
  return [1, 2, 3].map(j => { const p0 = k0[j], p1 = k1[j], p2 = k2[j], p3 = k3[j], d1 = k1 === k0 ? (p2 - p1) : (p2 - p0) / 2 * (k2[0] - k1[0]) / (k2[0] - k0[0]) * 2, d2 = k3 === k2 ? (p2 - p1) : (p3 - p1) / 2 * (k2[0] - k1[0]) / (k3[0] - k1[0]) * 2;
    const t2 = t * t, t3 = t2 * t; return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * d1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * d2; });
}

function roomOil(ctx, u, mode = 'open') {
  const { clamp, ss } = Pilot, dawnM = mode === 'dawn', endM = mode === 'end', openM = !dawnM && !endM, L = endM ? ROIL.LE : ROIL.L, { W, H, V, book: B } = L, S = ROIL.S, R0 = L.R0, Fg = endM ? ROIL.figE : dawnM ? ROIL.figOld : ROIL.fig;
  const page = [B.cx + B.w * .24, B.cy - B.d * .05], mid = [(L.person.cx + L.flame[0]) / 2 + .02 * W, L.person.top + .3 * L.person.P];
  // 'end' (u −0.1…21.5, film 159.4–181): one slow pull back from the man, the candle and the book (the window's edge just in at
  // the left) to the whole quiet room; the man's feet stay above the words' band all the way
  // (2026-11-14: it starts looking a little right of him — the candle where the sun of goldThree was, the man at the left edge, never
  // where the far cross stood during the 1.4 s dissolve — and drifts left as it pulls back until he sits in the room's middle-left)
  const KEYS = endM ? (V ? [[-.2, .66 * W, .552 * H, 1.52], [5.5, .565 * W, .545 * H, 1.4], [10.5, .47 * W, .528 * H, 1.22], [16.1, .48 * W, .51 * H, 1.08], [21.6, .5 * W, .5 * H, 1.0]]
                          : [[-.2, .66 * W, .6 * H, 1.52], [5.5, .575 * W, .585 * H, 1.37], [10.5, .5 * W, .56 * H, 1.2], [16.1, .49 * W, .53 * H, 1.07], [21.6, .5 * W, .5 * H, 1.0]])
    : dawnM
    ? [[0, mid[0], mid[1] - .02 * H, 1.18], [3.2, mid[0] - .02 * W, mid[1] - .04 * H, 1.26], [6.5, mid[0] - .05 * W, mid[1] - .07 * H, 1.36]]
    : null;
  let [fx, fy, z] = openM ? roomOpenCam(L, u, page, mid) : roomCam(KEYS, u); z = Math.max(1.0, z);
  fx = clamp(fx, W / 2 / z, W - W / 2 / z); fy = clamp(fy, H / 2 / z, H - H / 2 / z);
  const k = dawnM ? ss(.2, 5.2, u) : endM ? .1 + .9 * ss(.4, 15.5, u) : 0;          // how far the dawn has come ('end': the window greys at N17, full by Q13)
  const T = dawnM ? 146.5 + u : endM ? 159.5 + u : u, fl = roomFlick(T);              // the candle runs on film time
  const sc = (px, py) => [W / 2 + (px - fx) * z, H / 2 + (py - fy) * z];
  OIL.view(ctx, ROIL[endM ? 'endN' : 'night'], S, fx * S, fy * S, z); if (k > 0) { ctx.save(); ctx.globalAlpha = k; OIL.view(ctx, ROIL[endM ? 'endD' : 'dawn'], S, fx * S, fy * S, z); ctx.restore(); }
  if (openM) { const a = ss(L.zEnd * .6, L.zEnd * .78, z); if (a > 0) { const C = ROIL.close, [rx, ry, rw, rh] = C.rect; ctx.save(); ctx.globalAlpha = a; ctx.drawImage(C.art, W / 2 + (rx - fx) * z, H / 2 + (ry - fy) * z, rw * z, rh * z); ctx.restore(); } }   // the fine page close-up
  // the candle's light breathes over the room
  const [lx, ly] = sc(L.LP[0], L.LP[1]);
  { ctx.save(); ctx.globalCompositeOperation = 'multiply'; const dim = Math.min(1, 1 - .3 * (1.04 - fl) * (1 - .5 * k)), v = 255 * Math.max(0, dim) | 0, R = 1.4 * R0 * z;
    let gr = ctx.createRadialGradient(lx, ly, 0, lx, ly, R); gr.addColorStop(0, `rgb(${v},${v},${v})`); gr.addColorStop(1, '#fff'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen'; const wa = (.1 + Math.max(0, (fl - .9) * .5)) * (endM ? 1 - .6 * k : 1); gr = ctx.createRadialGradient(lx, ly, 0, lx, ly, .35 * R0 * z); gr.addColorStop(0, `rgba(255,170,90,${wa})`); gr.addColorStop(1, 'rgba(255,150,80,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.restore(); }
  // 'open' N02: the light spreads across the open pages, and the corner of the right-hand page lifts a little in the candle's draught
  if (openM) { const g2 = ss(4.4, 7.2, u);
    if (g2 > 0) { const [bx, by] = sc(page[0], page[1]); ctx.save(); ctx.globalCompositeOperation = 'screen';
      const gr = ctx.createRadialGradient(bx + .04 * R0 * z, by - .02 * R0 * z, 0, bx, by, .45 * R0 * z); gr.addColorStop(0, `rgba(255,226,170,${.32 * g2})`); gr.addColorStop(.5, `rgba(240,180,110,${.12 * g2})`); gr.addColorStop(1, 'rgba(200,130,70,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    const lift = ss(5.0, 7.0, u) * (.75 + .25 * Math.sin(u * 2.1)); if (lift > 0) { const [, , , , ox, oy] = ROIL.pageRow(1, .02), Lc = .05 * B.w * lift;
      const A = [ox - .07 * B.w, oy], Bp = [ox - .002 * B.w, oy + .16 * B.d], Cp = [ox, oy], C2 = [ox - Lc * .7, oy - Lc * .45], m = q => sc(q[0], q[1]);
      ctx.save(); ctx.filter = `blur(${(3 * z).toFixed(1)}px)`; ctx.fillStyle = `rgba(40,22,10,${.45 * lift})`; ctx.beginPath(); ctx.moveTo(...m(A)); ctx.lineTo(...m([Cp[0] + 4, Cp[1] + 6])); ctx.lineTo(...m(Bp)); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.save(); const gA = m(A), gC = m(C2), gr = ctx.createLinearGradient(gA[0], gA[1], gC[0], gC[1]); gr.addColorStop(0, 'rgba(232,206,160,.85)'); gr.addColorStop(1, 'rgba(255,240,208,.95)'); ctx.filter = `blur(${(.8 * z).toFixed(1)}px)`;
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(...m(A)); ctx.quadraticCurveTo(...m([(A[0] + C2[0]) / 2, (A[1] + C2[1]) / 2 - Lc * .2]), ...m(C2)); ctx.quadraticCurveTo(...m([(Bp[0] + C2[0]) / 2 + Lc * .1, (Bp[1] + C2[1]) / 2]), ...m(Bp)); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  // 'end' Q14: the window's light creeps across the table top from the left until it reaches the folded hands (u ≈ 10)
  if (endM) { const e = L.tx0 + (L.hands[0] + .02 * W - L.tx0) * ss(3, 9.5, u), [ax, ay] = sc(L.tx0, L.tableY), [ex, ey] = sc(e, L.tableF), soft = .06 * W * z;
    if (ex > ax) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const gr = ctx.createLinearGradient(ax, 0, ex + soft, 0), a = .34 * k;
      gr.addColorStop(0, `rgba(255,226,178,${a})`); gr.addColorStop(clamp((ex - ax) / (ex + soft - ax)), `rgba(255,220,170,${a * .8})`); gr.addColorStop(1, 'rgba(255,210,160,0)');
      ctx.filter = `blur(${(6 * z).toFixed(1)}px)`; ctx.fillStyle = gr; ctx.fillRect(ax, ay, ex + soft - ax, ey - ay); ctx.restore(); } }
  // Q14: where the light arrives, a warm pool on the table just beyond his right shoulder, where his folded hands rest (the figure
  // in front hides them, as in the opening; the rim of the dawn grows on him at the same time)
  // (2026-11-14: by ≈ 169 s (u 9.5) — a warm glow also comes up in front of his chest, where the hands are: drawn behind him, it
  // shows round his shoulders and sides, so he sits dark against it, seen from behind)
  if (endM) { const hl = ss(6.5, 9.5, u) * (.92 + .08 * fl), [hx, hy] = sc(L.hands[0], L.hands[1]), R = .22 * L.person.P * z;
    if (hl > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; let gr = ctx.createRadialGradient(hx, hy, 0, hx, hy, R); gr.addColorStop(0, `rgba(255,222,170,${.38 * hl})`); gr.addColorStop(.45, `rgba(240,190,130,${.16 * hl})`); gr.addColorStop(1, 'rgba(200,150,100,0)');
      ctx.fillStyle = gr; ctx.fillRect(hx - R, hy - R, 2 * R, 2 * R);
      const p = L.person, [cx2, cy2] = sc(p.cx + .08 * p.P, p.top + .42 * p.P), R2 = .9 * p.P * z; gr = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, R2);
      gr.addColorStop(0, `rgba(255,216,160,${.5 * hl})`); gr.addColorStop(.45, `rgba(250,196,130,${.24 * hl})`); gr.addColorStop(1, 'rgba(220,160,100,0)'); ctx.fillStyle = gr; ctx.fillRect(cx2 - R2, cy2 - R2, 2 * R2, 2 * R2);
      // (round 8) the dawn lies on the table top in front of him, on both sides of his shoulders (he sits dark against it)
      const [tx, ty] = sc(p.cx + .12 * p.P, L.tableY + .45 * (L.tableF - L.tableY)), rx = .95 * p.P * z, ry = .32 * p.P * z;
      ctx.save(); ctx.translate(tx, ty); ctx.scale(rx, ry); gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, `rgba(255,222,168,${.42 * hl})`); gr.addColorStop(.5, `rgba(250,204,146,${.22 * hl})`); gr.addColorStop(1, 'rgba(230,180,120,0)'); ctx.fillStyle = gr; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
      ctx.restore(); } }
  // the flame and its lens bloom (a soft horizontal streak) — behind the figure, which stands nearer ('end': it grows small in the day)
  { const [fx2, fy2] = sc(L.flame[0], L.flame[1]), h = L.cand.r * 2.3 * z * (endM ? 1 - .25 * k : 1);
    roomFlame(ctx, fx2, fy2, h, T, endM ? 1 - .45 * k : 1);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const bl = .16 * (fl - .2) * (1 - .4 * k), st = ctx.createLinearGradient(fx2 - W * .4, 0, fx2 + W * .4, 0);
    st.addColorStop(0, 'rgba(255,170,90,0)'); st.addColorStop(.5, `rgba(255,200,140,${bl})`); st.addColorStop(1, 'rgba(255,170,90,0)'); ctx.fillStyle = st; ctx.fillRect(fx2 - W * .4, fy2 - h * .5 - 2 * z, W * .8, 4 * z);
    const R = .3 * R0 * z * (endM ? 1 - .45 * k : 1), gr = ctx.createRadialGradient(fx2, fy2 - h * .5, 0, fx2, fy2 - h * .5, R); gr.addColorStop(0, `rgba(255,214,150,${.32 * fl})`); gr.addColorStop(.3, `rgba(255,170,90,${.1 * fl})`); gr.addColorStop(1, 'rgba(255,150,70,0)');
    ctx.fillStyle = gr; ctx.fillRect(fx2 - R, fy2 - h * .5 - R, 2 * R, 2 * R); ctx.restore(); }
  // 'end': the shaft of the dawn from the tall window down through the air to the floor beside him, and the sun still rising
  // (the window keeps blooming to the last frame) — all of it left of and below the end card's wall
  if (endM && k > .1) { const [x0, y0, x1, y1] = L.win, s2 = ss(11, 21.5, u), a = (k - .1) / .9;
    const q = [sc(x0 + (x1 - x0) * .1, y0 + (y1 - y0) * .35), sc(x1, y0 + (y1 - y0) * .5), sc(x1 + .42 * W, L.floorY + .16 * H), sc(x0 + .06 * W, L.floorY + .16 * H)];
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = `blur(${(18 * z).toFixed(1)}px)`;
    const gr = ctx.createLinearGradient(q[1][0], q[1][1], (q[2][0] + q[3][0]) / 2, q[2][1]); gr.addColorStop(0, `rgba(255,226,170,${.3 * a + .1 * s2})`); gr.addColorStop(.6, `rgba(250,206,140,${.18 * a + .08 * s2})`); gr.addColorStop(1, 'rgba(240,190,120,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(...q[0]); for (const v of q.slice(1)) ctx.lineTo(...v); ctx.closePath(); ctx.fill(); ctx.filter = 'none';
    const [wx, wy] = sc((x0 + x1) / 2, y0 + (y1 - y0) * .85), R = (.2 + .06 * s2) * W * z, g2 = ctx.createRadialGradient(wx, wy, 0, wx, wy, R);
    g2.addColorStop(0, `rgba(255,230,180,${.3 * a + .15 * s2})`); g2.addColorStop(.35, `rgba(255,200,130,${.1 * a + .06 * s2})`); g2.addColorStop(1, 'rgba(240,180,110,0)'); ctx.fillStyle = g2; ctx.fillRect(wx - R, wy - R, 2 * R, 2 * R); ctx.restore(); }
  // Q14 (2026-11-14: the dawn reaches HIM by ≈ 169 s): a second, narrower shaft from the upper window travels down across the floor
  // (its far end runs from the window to him, u 3 → 9.5) and lies over his shoulders, the table in front of him and the floor round him
  if (endM) { const a2 = ss(3, 9.5, u), p = L.person; if (a2 > 0) { const [x0, y0, x1, y1] = L.win, lp = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
    const s0 = [x0 + (x1 - x0) * .3, y0 + (y1 - y0) * .25], s1 = [x1, y0 + (y1 - y0) * .6], e1 = lp(s1, [p.cx + .8 * p.P, L.tableY + .004 * H], a2), e0 = lp(s0, [p.cx - .5 * p.P, L.floorY + .03 * H], a2);   // (round 8: its foot on him and the table before him, not the floor to his left)
    const q = [s0, s1, e1, e0].map(v => sc(v[0], v[1])), m0 = [(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2], m1 = [(q[2][0] + q[3][0]) / 2, (q[2][1] + q[3][1]) / 2], al = .26 * k * (.5 + .5 * a2);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = `blur(${(14 * z).toFixed(1)}px)`;
    const gr = ctx.createLinearGradient(m0[0], m0[1], m1[0], m1[1]); gr.addColorStop(0, `rgba(255,224,170,${al * .5})`); gr.addColorStop(.85, `rgba(255,212,150,${al})`); gr.addColorStop(1, `rgba(250,200,140,${al * .7})`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(...q[0]); for (const v of q.slice(1)) ctx.lineTo(...v); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  // dawn: the window blooms like a lens
  if (k > 0) { const [x0, y0, x1, y1] = L.win, [wx, wy] = sc((x0 + x1) / 2, y0 + (y1 - y0) * .7); ctx.save(); ctx.globalCompositeOperation = 'screen';
    const R = (x1 - x0) * 1.3 * z, gr = ctx.createRadialGradient(wx, wy, 0, wx, wy, R); gr.addColorStop(0, `rgba(255,240,210,${.45 * k})`); gr.addColorStop(.4, `rgba(240,220,190,${.14 * k})`); gr.addColorStop(1, 'rgba(220,200,170,0)');
    ctx.fillStyle = gr; ctx.fillRect(wx - R, wy - R, 2 * R, 2 * R); ctx.restore(); }
  // the figure, nearer than the table: it moves a little more than the room (parallax) and, as the camera passes over its
  // shoulder (open, after 4.9), it sinks out of the bottom of the frame. Its shoulders breathe; its rim flickers with the flame
  { const p = L.person, pf = 1 + .22 * (z - 1.2), drop = openM ? ss(4.4, 9.4, u) : 0, zf = z * pf * (1 + .35 * drop);   // (2026-11-14: slow, with the slower push)
    const sm = x => (x = clamp(x), x * x * (3 - 2 * x)), ph = ((T + 1.3) / 5.2) % 1, br = ph < .4 ? sm(ph / .4) : ph < .88 ? 1 - sm((ph - .4) / .48) : 0;
    const ax = p.cx, ay = p.top + .55 * p.P;                                                    // the parallax pivot (the figure's middle)
    const sx = W / 2 + (ax - fx) * z * pf, sy = H / 2 + (ay - fy) * z * pf + drop * H * .7;
    ctx.save(); ctx.translate(sx, sy); ctx.scale(zf, zf); ctx.translate(-ax, -ay);
    const ox = p.cx - (.5 + Fg.pad) * p.P, oy = p.top - Fg.pad * p.P, dw = Fg.bw / S, dh = Fg.bh / S;
    ctx.translate(p.cx, p.top + .98 * p.P); ctx.scale(1 + .004 * br, 1 + .01 * br); ctx.translate(-p.cx, -(p.top + .98 * p.P));   // breathing from below the shoulders
    ctx.drawImage(Fg.body, ox, oy, dw, dh);
    if (Fg.bodyD) {   // (round 8) the day comes into his wool and hair; the candle's edge fades; the dawn lies on his head and left shoulder
      const dk = clamp((k - .12) / .55), ar = endM ? ss(4.5, 9.5, u) * (.9 + .1 * Math.sin(T * .7)) : 0;
      if (dk > 0) { ctx.globalAlpha = dk; ctx.drawImage(Fg.bodyD, ox, oy, dw, dh); }
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (1 - k) * (.6 + .3 * fl); ctx.drawImage(Fg.rimN, ox, oy, dw, dh); if (openM) { ctx.globalAlpha = .55 + .3 * fl; ctx.drawImage(Fg.rimN, ox, oy, dw, dh); }   // (the opening: the candle edge stronger)
      if (ar > 0) { ctx.globalAlpha = ar; ctx.drawImage(Fg.lightW, ox, oy, dw, dh); ctx.globalAlpha = .3 * ar; ctx.drawImage(Fg.lightW, ox, oy, dw, dh); ctx.globalAlpha = .25 * ar; ctx.drawImage(Fg.lightW2, ox, oy, dw, dh); ctx.globalAlpha = .7 * ar; ctx.drawImage(Fg.lightK, ox, oy, dw, dh); }
    } else {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (1 - .55 * k) * (.72 + .3 * fl); ctx.drawImage(Fg.rimN, ox, oy, dw, dh);
      if (k > 0) { ctx.globalAlpha = k; ctx.drawImage(Fg.rimD, ox, oy, dw, dh); }
    }
    ctx.restore(); }
  // dust in the candle light; at dawn in the light from the window
  { const r = Pilot.rng(41); ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 70; i++) { const ph = r(), x0 = L.LP[0] + (r() - .6) * R0 * .8, y0 = L.LP[1] + (r() - .4) * R0 * .6, x = W / 2 + (x0 + Math.sin(T * .3 + i) * 10 - fx) * z, y = H / 2 + (y0 - ((T * 5 + ph * 140) % 140) + 70 - fy) * z;
      const d = Math.hypot(x - lx, y - ly) / (R0 * .5 * z), a = clamp(1 - d) * (.3 + .3 * r()); if (a <= .01) continue; ctx.fillStyle = `rgba(255,226,180,${a})`; ctx.beginPath(); ctx.arc(x, y, (.9 + r() * 1.4) * z * .7, 0, 6.283); ctx.fill(); }
    if (k > .2) { const [x0, y0, x1, y1] = L.win; for (let i = 0; i < 60; i++) { const ph = r(), xa = x0 + (r() - .3) * (x1 - x0) * 2.5, ya = y1 + r() * H * .45, x = W / 2 + (xa + Math.sin(T * .2 + i) * 14 - fx) * z, y = H / 2 + (ya + Math.sin(T * .17 + i * 1.3) * 10 - ((T * 2 + ph * 50) % 50) - fy) * z;
      ctx.fillStyle = `rgba(236,240,250,${(.1 + .2 * r()) * (k - .2)})`; ctx.beginPath(); ctx.arc(x, y, (.8 + r() * 1.2) * z * .7, 0, 6.283); ctx.fill(); } }
    ctx.restore(); }
  // 'end': the day keeps coming after the last words — the floor toward us warms (below the man, never behind the end card)
  if (endM) { const s3 = ss(13, 21.5, u); if (s3 > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const y0 = sc(0, L.floorY)[1], g3 = ctx.createLinearGradient(0, y0, 0, H);
    g3.addColorStop(0, 'rgba(255,214,160,0)'); g3.addColorStop(.25, `rgba(240,190,130,${.16 * s3})`); g3.addColorStop(1, `rgba(200,150,100,${.1 * s3})`); ctx.fillStyle = g3; ctx.fillRect(0, y0, W, H - y0); ctx.restore(); } }
  // 'end' (2026-11-14): the first seconds carry the sunrise of goldThree over the dissolve — a warm glow round the candle (where the
  // sun stood) that settles into the room by u ≈ 6.5 (a little of it stays), so the picture does not drop from ≈106 to the room's night at once
  if (endM) { const wg = 1 - .7 * ss(.8, 6.5, u); if (wg > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const [gx, gy] = sc(L.flame[0], L.flame[1]), R = .95 * W;
    const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, R); gr.addColorStop(0, `rgba(255,214,160,${.5 * wg})`); gr.addColorStop(.35, `rgba(236,170,110,${.3 * wg})`); gr.addColorStop(1, `rgba(150,100,70,${.12 * wg})`);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  // varnish, vignette, the words' band a little darker, film grain
  OIL.varnish(ctx, .45, [120, 74, 30]);
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  { const R = Math.hypot(W, H) * .6, gr = ctx.createRadialGradient(W / 2, H * .42, R * .35, W / 2, H * .42, R); const e = endM ? k : 0; gr.addColorStop(0, '#fff'); gr.addColorStop(1, `rgb(${150 + 30 * e | 0},${130 + 30 * e | 0},${116 + 28 * e | 0})`); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }   // ('end': the day opens the corners)
  { const y0 = V ? H * .6 : H * .72, y1 = V ? H * .8 : H, b = ctx.createLinearGradient(0, y0, 0, y1), lift = endM ? ss(15.6, 18.5, u) : 0;   // ('end': no more words below after Q13 — the floor may open up)
    const bc = `rgb(${176 + 46 * lift | 0},${166 + 50 * lift | 0},${156 + 52 * lift | 0})`; b.addColorStop(0, '#fff'); b.addColorStop(1, bc); ctx.fillStyle = b; ctx.fillRect(0, y0, W, y1 - y0); if (V) { ctx.fillStyle = bc; ctx.fillRect(0, y1, W, H - y1); } }
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07; const o = Math.floor(u * 24); ctx.translate(-((o * 73) % 256), -((o * 151) % 256));
  ctx.fillStyle = ctx.createPattern(ROIL.grain, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
}
