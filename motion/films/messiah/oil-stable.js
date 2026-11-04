/* oil-stable.js — 「메시아」 4부의 마구간을 렘브란트 톱라이트 유화로 (2026-11-03 2차: "비주얼이 심심하다" → 장면마다 맞는 화풍).
   After Rembrandt's *Adoration of the Shepherds* (1646): the only light is the child; Mary kneels near us on the left, Joseph
   stands behind the manger on the right, through a doorway the blue night and one star. The plate is
   value-planned (kit-oilpaint.js paints it), the camera moves over the painting: a slow pull-back from the child (2:7), later a
   push in while the two verses are joined, and the light coming back onto the manger (W3). Uses film.html's bez/MARY_K/JOSEPH. */
const SOIL = { S: 1.5, art: null };
// Joseph for the painting: hooded head bowed toward the child, a beard, one arm forward on the staff (metres, facing left)
// Joseph for the painting (round 3: the look review read the old profile's hood point and nose as a beast's muzzle): a round hood
// bowed toward the child, a short beard, one hand held out over the manger — metres, facing left, feet at the origin
const JOSEPH_O = [['M', .3, 0], ['C', .3, -.5, .29, -.95, .26, -1.3], ['C', .24, -1.5, .2, -1.62, .12, -1.7], ['C', .04, -1.78, -.08, -1.78, -.14, -1.7], ['C', -.19, -1.64, -.2, -1.56, -.18, -1.5],
  ['C', -.17, -1.46, -.15, -1.43, -.13, -1.42], ['C', -.2, -1.38, -.28, -1.3, -.32, -1.2], ['C', -.34, -1.14, -.3, -1.1, -.25, -1.12], ['C', -.24, -.8, -.27, -.4, -.3, 0]];function buildStableOil() {
  const S = SOIL.S, PW = Math.round(W * S), PH = Math.round(H * S), plate = canvas(PW, PH), g = plate.getContext('2d'); g.scale(S, S);
  const cx = W / 2, gy = H * (V ? .56 : .58),   /* round 4: the TV cut's floor higher — Mary and the manger above the words */ lx = cx + (V ? 10 : 40), ly = gy - (V ? 44 : 36), LP = [lx, ly - 16];
  Object.assign(SOIL, { lx, ly, gy, LP });
  const radial = (x, y, R, stops, op = 'source-over') => { g.save(); g.globalCompositeOperation = op; const gr = g.createRadialGradient(x, y, 0, x, y, R); stops.forEach(([k, c]) => gr.addColorStop(k, c)); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R); g.restore(); };
  // the room: readable warm umber, the back wall lit by the child; near-black only in the far corners
  g.fillStyle = '#170d06'; g.fillRect(0, 0, W, H);
  // round 3 (look review: 'the whole wall is evenly orange — the light must come only from the child'): it falls off into the dark
  radial(lx, ly - 30, Math.max(W, H) * .46, [[0, 'rgba(214,150,76,1)'], [.28, 'rgba(150,96,46,.86)'], [.66, 'rgba(62,38,18,.62)'], [1, 'rgba(30,18,9,0)']]);
  // and the top third of the room falls into dark (the wall lit only near the manger)
  { const gr = g.createLinearGradient(0, 0, 0, H * .42); gr.addColorStop(0, 'rgba(12,7,3,.78)'); gr.addColorStop(1, 'rgba(12,7,3,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H * .42); }
  // boards of the back wall (values only; the strokes make the wood)
  { const r = rng(4); for (let x = W * .02; x < W; x += W * (.11 + .04 * r())) { g.fillStyle = 'rgba(28,16,8,.38)'; g.fillRect(x, H * .12, 3 + 2 * r(), gy - H * .1); } }
  // the doorway at the back, left: blue-green night and one star (the only cool colour)
  { const x0 = W * (V ? .08 : .1), x1 = W * (V ? .3 : .24), y0 = H * (V ? .2 : .16), y1 = gy - (V ? 150 : 120);
    const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#0e2430'); gr.addColorStop(1, '#23424a'); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (const [hx, hy, R] of [[x0 + (x1 - x0) * .62, y0 + (y1 - y0) * .22, 60]]) { radial(hx, hy, R, [[0, 'rgba(236,244,255,.95)'], [.1, 'rgba(190,214,230,.5)'], [1, 'rgba(120,160,180,0)']]); g.fillStyle = '#f4f8ff'; g.beginPath(); g.arc(hx, hy, 3.2, 0, 6.283); g.fill(); }
    g.fillStyle = '#1a0f07'; g.fillRect(x0 - 14, y0 - 14, 14, y1 - y0 + 28); g.fillRect(x1, y0 - 14, 14, y1 - y0 + 28); g.fillRect(x0 - 14, y0 - 16, x1 - x0 + 28, 16); }
  // beam and posts, their inner faces catching the light
  g.fillStyle = '#1c1008'; g.fillRect(0, H * (V ? .13 : .08), W, V ? 46 : 40);
  { const gr = g.createLinearGradient(0, H * (V ? .13 : .08) + (V ? 46 : 40), 0, H * (V ? .13 : .08) + (V ? 34 : 30)); gr.addColorStop(0, 'rgba(170,110,54,.7)'); gr.addColorStop(1, 'rgba(170,110,54,0)'); g.fillStyle = gr; g.fillRect(0, H * (V ? .13 : .08) + (V ? 30 : 26), W, 16); }
  for (const [x0, w0, side] of [[W * .03, V ? 54 : 60, 1], [W * .95, V ? 58 : 64, -1]]) { g.fillStyle = '#1a0e07'; g.fillRect(x0 - w0 / 2, 0, w0, H); const gr = g.createLinearGradient(x0 + side * w0 / 2, 0, x0 + side * (w0 / 2 - 16), 0); gr.addColorStop(0, 'rgba(170,108,50,.6)'); gr.addColorStop(1, 'rgba(170,108,50,0)'); g.fillStyle = gr; g.fillRect(Math.min(x0 + side * w0 / 2, x0 + side * (w0 / 2 - 16)), 0, 16, H); }
  // the floor: straw, warm near the manger
  { const gr = g.createLinearGradient(0, gy - 20, 0, H); gr.addColorStop(0, '#7a5228'); gr.addColorStop(.5, '#5a381a'); gr.addColorStop(1, '#3a2410'); g.fillStyle = gr; g.fillRect(0, gy - 8, W, H); }
  radial(lx, gy + 30, W * .52, [[0, 'rgba(226,170,96,.8)'], [.4, 'rgba(160,104,48,.4)'], [1, 'rgba(60,36,16,0)']]);
  { const r = rng(14); g.lineCap = 'round'; for (let i = 0; i < 900; i++) { const x = cx + (r() - .5) * W * 1.2, y = gy - 4 + r() * (H - gy), d = Math.hypot(x - lx, (y - ly) * 1.6) / (W * .62), k = clamp(1 - d); if (k <= .05) continue;
    g.strokeStyle = `rgba(${236 - 40 * r() | 0},${190 - 40 * r() | 0},${110 - 30 * r() | 0},${.75 * k})`; g.lineWidth = 1.6 + 1.4 * r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 34, y - 3 - r() * 9); g.stroke(); } }
  // a figure: its path (metres, feet at the origin) given volume by the one light (OIL.relief) — lit where it faces the child,
  // warm shadow elsewhere; zones: [{ at: [u, v, rx, ry] (metres, a soft ellipse) | none = the rest, base, lit }] (face, hands)
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  function figure(cmds, x, y, s, f, zones, box) {
    const p = new Path2D(); bez(p, cmds); const m = new DOMMatrix().scale(S, S).translate(x, y).scale(s * f, s);
    OIL.relief(g, p, m, box, zones.map(z => ({ w: z.at ? (u, v) => clamp(1.6 - 1.6 * Math.hypot((u - z.at[0]) / z.at[2], (v - z.at[1]) / z.at[3])) : null, base: hex(z.base), lit: hex(z.lit), k: z.k })),
      { x: LP[0] * S, y: LP[1] * S, z: 45 * S, R: H * .4 * S }, { soft: .05, height: 70 * S, amb: .22, wrap: .12 }); }  // Joseph behind the manger on the right, leaning on his staff, head bowed toward the child
  const sJ = V ? 340 : 280, jx = lx + (V ? 215 : 250), jy = gy - (V ? 20 : 20);   /* smaller, a man behind the manger */
  /* round 3: no staff — painted it broke into dots, drawn crisp it stood right over the child and cut the picture in two */
  figure(JOSEPH_O, jx, jy, sJ, 1, [{ at: [-.17, -1.55, .07, .14], base: '#2a1a10', lit: '#ffd8a8', k: 1.6 }, { at: [-.29, -1.15, .07, .07], base: '#2a1a10', lit: '#ffd8a8', k: 1.6 }, { base: '#24180e', lit: '#a87448', k: 1.0 }], [-.36, -1.8, .32, 0]);   /* round 3: his robe only warm-dim (lit bright, its edge read as a flame beside the manger); face and hand keep the light */
  // the manger: rough boards, its rim lit from the straw inside
  const mw = V ? 290 : 300, mh = V ? 92 : 92;
  { g.save(); const p = new Path2D(); p.moveTo(lx - mw / 2, ly); p.lineTo(lx + mw / 2, ly); p.lineTo(lx + mw * .4, ly + mh); p.lineTo(lx - mw * .4, ly + mh); p.closePath();
    g.fillStyle = '#3a2412'; g.fill(p); g.clip(p); const gr = g.createLinearGradient(0, ly, 0, ly + mh); gr.addColorStop(0, '#9a6a36'); gr.addColorStop(1, '#2a180b'); g.fillStyle = gr; g.globalAlpha = .9; g.fillRect(lx - mw, ly, 2 * mw, mh);
    g.globalAlpha = 1; g.fillStyle = 'rgba(20,12,6,.5)'; for (let i = 1; i < 4; i++) g.fillRect(lx - mw / 2, ly + i * mh / 4, mw, 3); g.restore();
    g.strokeStyle = '#2a180b'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx - mw * .36, ly + mh - 6); g.lineTo(lx - mw * .24, ly + mh + 40); g.moveTo(lx + mw * .36, ly + mh - 6); g.lineTo(lx + mw * .24, ly + mh + 40); g.stroke();
    g.fillStyle = '#f0c886'; g.fillRect(lx - mw / 2, ly - 3, mw, 6); }
  // straw over the rim, and the child: a swaddled bundle, the brightest thing in the picture
  { const r = rng(5); g.lineCap = 'round'; for (let i = 0; i < 160; i++) { const x = lx + (r() - .5) * mw * 1.08, y = ly - 2 + (r() - .5) * 12; g.strokeStyle = `rgba(255,${214 + 30 * r() | 0},${150 + 40 * r() | 0},${.6 + .4 * r()})`; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 26, y - 5 - r() * 12); g.stroke(); } }
  // the child, swaddled, lying along the manger with the head to the left (toward Mary): the brightest thing in the picture
  const child = (g) => { const bx = lx + mw * .04, by = ly - 18, bl = mw * .62, bw = mh * .42;
    g.save(); g.translate(bx, by); g.rotate(-.06); const sw = new Path2D(); sw.ellipse(bl * .08, 0, bl * .42, bw * .5, 0, 0, 6.283);
    const gr = g.createLinearGradient(0, -bw * .5, 0, bw * .5); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(.6, '#f2dcb4'); gr.addColorStop(1, '#c8a070'); g.fillStyle = gr; g.fill(sw);
    g.strokeStyle = 'rgba(190,150,100,.75)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-bl * .1 + i * bl * .17, -bw * .46); g.quadraticCurveTo(i * bl * .17, 0, -bl * .06 + i * bl * .17, bw * .46); g.stroke(); }
    const hx = -bl * .36, hy = -bw * .06, hr = bw * .36; const hg = g.createRadialGradient(hx + hr * .2, hy - hr * .3, 0, hx, hy, hr); hg.addColorStop(0, '#fff2e2'); hg.addColorStop(.7, '#f6d2ae'); hg.addColorStop(1, '#d8a47a'); g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, hr, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(150,96,60,.55)'; g.beginPath(); g.ellipse(hx - hr * .1, hy + hr * .05, hr * .12, hr * .05, 0, 0, 6.283); g.fill();   // the closed eye
    g.fillStyle = '#efe2c8'; g.beginPath(); g.ellipse(hx - hr * .55, hy - hr * .2, hr * .5, hr * .75, .3, 0, 6.283); g.fill();   // the swaddling over the head
    g.restore(); };
  radial(lx - mw * .1, ly - 18, mw * .6, [[0, 'rgba(255,240,206,.7)'], [.4, 'rgba(250,210,150,.35)'], [1, 'rgba(240,190,120,0)']]); child(g);   /* round 3: the red cloth over the rim is gone (it read as a flame beside the straw — the light is the child's alone) */
  // Mary near us on the left, kneeling toward the child, veiled; one red (her dress) — the only red in the film's stable
  const sM = V ? 560 : 420, mx = lx - (V ? 330 : 390), my = gy + (V ? 210 : 150);
  figure(MARY_K, mx, my, sM, 1, [{ at: [.13, -1.03, .06, .11], base: '#3a2418', lit: '#ffe4bc', k: 1.6 }, { at: [.2, -.93, .07, .06], base: '#3a2418', lit: '#ffe4bc', k: 1.6 },
    { base: '#17161c', lit: '#d6c2a2', k: 1.45 }], [-.5, -1.2, .4, 0]);
  // round 4 (look review: 'Mary and Joseph end in a straight cut — paper cut-outs floating'): where they meet the floor, a soft
  // contact shadow and straw laid over the base line, so they kneel and stand IN the straw
  for (const [bx, by, bw] of [[mx, my, .62 * sM], [jx, jy, .5 * sJ]]) {
    g.save(); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(26,15,7,.75)'; g.beginPath(); g.ellipse(bx, by + 4, bw * .62, bw * .09, 0, 0, 6.283); g.fill(); g.restore();
    const r = rng(Math.round(bx)); g.lineCap = 'round'; for (let i = 0; i < 140; i++) { const x = bx + (r() - .5) * bw * 1.3, y = by - 10 + r() * 28, d = Math.hypot(x - lx, (y - ly) * 1.6) / (W * .62), kk = clamp(1 - d);
      g.strokeStyle = `rgba(${150 + 70 * kk | 0},${104 + 60 * kk | 0},${50 + 30 * kk | 0},${.55 + .35 * r()})`; g.lineWidth = 1.8 + 1.6 * r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 40, y - 6 - r() * 14); g.stroke(); } }
  // the light itself, laid on as glaze over everything near the child
  radial(LP[0], LP[1], Math.max(W, H) * .4, [[0, 'rgba(255,236,190,.55)'], [.2, 'rgba(240,180,100,.25)'], [1, 'rgba(200,130,60,0)']], 'screen');
  SOIL.art = OIL.paint(plate, { key: 'rembrandt', S, seed: 11 });
  { const a = SOIL.art.getContext('2d'); a.save(); a.scale(S, S); a.globalAlpha = .9; child(a); a.restore(); }   // the focus stays crisp, as in the painting
}
// the camera over the painting: (fx, fy) in frame units of the plate, zoom z
function stableOil(ctx, t, fx, fy, z, o = {}) {
  const S = SOIL.S; OIL.view(ctx, SOIL.art, S, fx * S, fy * S, z);
  const sx = W / 2 + (SOIL.LP[0] - fx) * z, sy = H / 2 + (SOIL.LP[1] - fy) * z, br = .9 + .1 * Math.sin(t * 1.3) * Math.sin(t * .7 + 1);
  W3.bloom(ctx, sx, sy - 40 * z, [255, 214, 150], .3 * br * (o.glow ?? 1), { r: (V ? 360 : 300) * z, streak: .3 });
  // dust in the light, drifting up slowly
  { const r = rng(21); ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 70; i++) { const ph = r(), x0 = SOIL.LP[0] + (r() - .5) * W * .7, y0 = SOIL.LP[1] - r() * H * .45, x = W / 2 + (x0 + Math.sin(t * .3 + i) * 14 - fx) * z, y = H / 2 + (y0 - ((t * 6 + ph * 200) % 200) + 100 - fy) * z;
    const d = Math.hypot(x - sx, y - sy) / (W * .5), a = clamp(1 - d) * .5 * (o.glow ?? 1); if (a <= 0) continue; ctx.fillStyle = `rgba(255,228,180,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + r() * 1.6, 0, 6.283); ctx.fill(); } ctx.restore(); }
  OIL.varnish(ctx, 1); W3.finish(ctx, t, { vignette: .38, grain: .06 });
}
// 2:7 — the pull-back: from the child to the whole room (95.0–104.8)
function partStable(ctx, t) { const k = eio(clamp((t - 95) / 9.6)); stableOil(ctx, t, lerp(SOIL.lx, W / 2, k), lerp(SOIL.ly - 10, H * .5, k), lerp(1.55, 1.0, k)); textBand(ctx); }
// the two verses joined (113.6–137.2), round 3 after the look review (all four: "23 s of the same stable, nearly black"):
// W0–W1 (Gen 3:15) back in the garden — the charcoal tree and its one point of light, the camera pushing toward it;
// as the words cross to Gal 4:4 the point comes down and becomes the light of the child (the promise kept), the stable close
// on the child and Mary; W3: the light fuller, the camera on in, and behind the manger the post and beam throw a cross on the wall.
let PAIR_EDEN = null;
function partPair(ctx, t) {
  const eden = 1 - ss(121.0, 123.4, t), dsc = ss(120.6, 123.6, t);
  // the stable, close: from the child toward Mary's lit face, always pushing
  // the camera in three framings (look review r2: "the same stable for 18 s"), one continuous move: the child from close above
  // (Gal 4:4) → Mary's face and hands with the child (W3, "동정녀에게서") → back and up to the doorway's star ("우리 죄를 대신")
  const { lx, ly } = SOIL, back = ss(128.4, 131.4, t), KEYS = [[121, lx - 60, ly + 120, 1.55], [126.2, lx - 70, ly + 100, 1.72], [127.8, lx - 150, ly - 60, 1.6], [131.2, lx - 160, ly - 70, 1.75], [133, lx - 160, ly - 110, 1.5], [137.2, lx - 180, ly - 130, 1.3]];   /* round 3b: medium shots, the child always above the words */
  let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++; const [ta, xa, ya, za] = KEYS[i], [tb, xb, yb, zb] = KEYS[i + 1], u = eio(clamp((t - ta) / (tb - ta)));
  const fx = lerp(xa, xb, u), fy = lerp(ya, yb, u), z = lerp(za, zb, u);
  if (eden < 1) {
    stableOil(ctx, t, fx, fy, z, { glow: 1.25 + .55 * back });
    // W3: "우리 죄를 대신" — the cross the post and beam throw on the back wall, faint, warm-dark (the light is the child)
    const cr = ss(132.4, 135.4, t); if (cr > 0) { const cx = W / 2 + (SOIL.lx - 40 - fx) * z, cy = H / 2 + (SOIL.ly - 380 - fy) * z, s = z;   /* on the back wall above the child */
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = `blur(${10 * s}px)`; ctx.fillStyle = `rgba(70,40,20,${.5 * cr})`;
      ctx.fillRect(cx - 9 * s, cy - 150 * s, 18 * s, 330 * s); ctx.fillRect(cx - 82 * s, cy - 70 * s, 164 * s, 16 * s); ctx.restore(); }
  }
  if (eden > 0) {
    // the garden, remembered: the charcoal frame with the point lit, pushed in toward the point
    if (!PAIR_EDEN) PAIR_EDEN = canvas(W, H); const g = PAIR_EDEN.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    window.partEden(g, lerp(30.8, 32.4, clamp((t - 113.6) / 9.8))); const [px, py] = window.partEden.point(), ze = lerp(1.0, 1.45, eio(clamp((t - 113.6) / 9.8)));
    ctx.save(); ctx.globalAlpha = eden; ctx.translate(px, py); ctx.scale(ze, ze); ctx.translate(-px, -py); ctx.drawImage(PAIR_EDEN, 0, 0); ctx.restore();
    PAIR_EDEN.px = px; PAIR_EDEN.py = py;
  }
  // the point of light coming down from the garden into the manger
  if (dsc > 0 && dsc < 1 && PAIR_EDEN) { const cx = W / 2 + (SOIL.LP[0] - fx) * z, cy = H / 2 + (SOIL.LP[1] - fy) * z, u = eio(dsc);
    const x = lerp(PAIR_EDEN.px, cx, u), y = lerp(PAIR_EDEN.py, cy, u) - Math.sin(u * Math.PI) * H * .06, a = Math.sin(u * Math.PI);
    W3.bloom(ctx, x, y, [255, 214, 150], .8 * a, { r: V ? 150 : 130, streak: .2 }); ctx.fillStyle = `rgba(255,244,214,${a})`; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.283); ctx.fill(); }
  textBand(ctx);
}
