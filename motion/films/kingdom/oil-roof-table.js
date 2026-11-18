/* oil-roof-table.js — 「kingdom」 2부, Caravaggio tenebrism in oil (kit-oilpaint.js key 'caravaggio', vendored untouched):
   N45 · Q42 · N45b — the roof opened above the paralytic (Mk 2:4–5), and N46 · Q43 · N46b — the tax collector's table (Lk 15:2).
   After Caravaggio's 「The Calling of Saint Matthew」 (1600: one shaft of window light crossing a dark room to a table of tax
   collectors) and 「The Godfather」's top light (OPUSCAR 45): black-brown glazed darks, loaded strokes only where the light is.

   Two painted rooms, each painted twice from one value plan: LIT (everything as the light would show it) and DARK (the same
   strokes sunk into the umber). The light is a live shape that reveals the LIT painting through the DARK one — so the light
   really travels over the paint (the shaft lands on the man, the window beam crosses the table) instead of a glow laid on top.
     ROOF  (a tall plate, tilt down): daylight pours through a hole torn in the roof (match cut from the village sun); four men
           lower the stretcher on ropes into the crowded room (the camera tilts down with it, 4 s, slow); it settles in the
           shaft. Q42: the light comes down and rests on the man — a small figure in the foreground, from behind, faces him (the
           King: back only, head cloth to the shoulders, no glow). N45b: the resting light warms.
     TABLE (locked off, a slow push at the end): a dark room, a high window at the right; its beam crosses the table and the
           people at it, right to left (N46). The King sits with his back to us at the near side. Q43: in the bright doorway at
           the back, three silhouettes lean together and point; their long shadows reach into the room toward the table. N46b:
           they withdraw, their shadows pull back, only the table's light remains.
   Rules kept: the light is the subject's light (on the stretcher, on the table); the King is never seen from the front; men in
   head cloths; no words in the art. API (classic script, global OilRoofTable): OilRoofTable.build(W, H) → { draw(ctx, t, B) }
   t = FILM seconds; B from script.json (N45 L42 Q42 N45b N46 Q43 N46b N46c). Pure in t (plates painted once, seeded). */
(function () {
  const P = Pilot, { clamp, lerp, ss, eo, eio, rng, noise } = P;
  let W, H, T = null, ROOF = null, TABLE = null;
  function beats(B) {
    const T = {};
    T.roof0 = B.N45; T.tilt0 = B.N45 + .7; T.tilt1 = B.N45 + 5.2;          // tilt down with the stretcher (4.5 s, slow)
    T.down0 = B.N45 + .4; T.down1 = B.N45 + 7.6;                           // the stretcher comes down
    T.rest = B.Q42 + .2; T.warm0 = B.N45b; T.warm1 = B.N45b + 3.5;          // the light rests on him; it warms
    T.push0 = B.Q42; T.push1 = B.N46;                                        // a slow push while the light rests
    T.table0 = B.N46; T.beam0 = B.N46 + .3; T.beam1 = B.N46 + 4.8;           // the window beam crosses the table
    T.whisper0 = B.Q43 + .2; T.whisper1 = B.N46b + .6; T.gone = B.N46b + 4.6; // the silhouettes in the door, then they withdraw
    T.tpush0 = B.N46b; T.end = B.N46c + .8;
    return T;
  }
  // ---------------------------------------------------------------- painting helpers (plate px)
  const C = (w, h) => P.canvas(w, h);
  const hex = P.hex;
  const poly = (g, pts, fill) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } };
  const radial = (g, x, y, r, c0, c1) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
  // a man as a Path2D in his own units (1 unit ≈ his height from waist to crown): head, head cloth to the shoulders, torso.
  // view: 'front' | 'back' | 'side'. seated men are cut at the waist (the table or the crowd hides the rest)
  function manPath(view = 'front', o = {}) {
    const p = new Path2D(), lean = o.lean || 0, sh = o.shoulder || .3;
    p.ellipse(lean * .3, -.9, .12, .13, 0, 0, 6.283);                                  // head (in its cloth)
    p.moveTo(lean * .3 - .13, -.9); p.quadraticCurveTo(lean * .3 - .17, -.72, -sh * .8 + lean * .15, -.66); p.lineTo(sh * .8 + lean * .15, -.66); p.quadraticCurveTo(lean * .3 + .17, -.72, lean * .3 + .13, -.9); p.closePath();   // the cloth falling to the shoulders
    p.moveTo(-sh + lean * .12, -.66); p.quadraticCurveTo(-sh - .06, -.6, -sh - .04, -.4); p.lineTo(-sh - .02, 0); p.lineTo(sh + .02, 0); p.lineTo(sh + .04, -.4); p.quadraticCurveTo(sh + .06, -.6, sh + lean * .12, -.66); p.closePath();   // torso
    if (o.arms) for (const [ax, ay, bx, by] of o.arms) { p.moveTo(ax - .06, ay); p.lineTo(bx - .05, by); p.lineTo(bx + .05, by + .02); p.lineTo(ax + .06, ay + .02); p.closePath(); }
    return p;
  }
  // relief zones: the head cloth, the face (only when he faces us), the robe
  const zone = (test, base, lit, k = 1) => ({ test, base: hex(base), lit: hex(lit), k });
  // a man painted the tenebrist way: the silhouette laid in near-black, the light raking in from its source only on the side
  // that faces it (a lit edge, the head cloth's top, a cheek when he faces us) — figures that come out of the dark, not cut-outs
  function man(g, x, y, s, view, cloth, light, o = {}) {
    const fl = o.flip ? -1 : 1, m = new DOMMatrix([s * fl, 0, 0, s, x, y]), path = manPath(view, o), lean = o.lean || 0;
    const cx = x, cy = y - .55 * s; let dx = light.x - cx, dy = light.y - cy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const k = clamp(1 / (1 + (d * d) / (light.R * light.R)) * 1.25);
    g.save(); g.setTransform(m); g.fillStyle = cloth[0]; g.fill(path); g.clip(path); g.setTransform(1, 0, 0, 1, 0, 0);
    const [lr, lg, lb] = hex(cloth[1]);
    let gr = g.createLinearGradient(cx + dx * .5 * s, cy + dy * .5 * s, cx + dx * .12 * s, cy + dy * .12 * s);   // only the edge toward the light
    gr.addColorStop(0, `rgba(${lr},${lg},${lb},${.85 * k})`); gr.addColorStop(.4, `rgba(${lr},${lg},${lb},${.3 * k})`); gr.addColorStop(1, `rgba(${lr},${lg},${lb},0)`);
    g.fillStyle = gr; g.fillRect(x - s, y - 1.3 * s, 2 * s, 1.5 * s);
    // the head cloth catches the most light (its top and the side toward the source)
    const hx = x + fl * lean * .3 * s, hy = y - .92 * s, [cr, cg, cb] = hex(cloth[1]);
    gr = g.createRadialGradient(hx + dx * .1 * s, hy + dy * .1 * s, 0, hx, hy, .26 * s); gr.addColorStop(0, `rgba(${cr},${cg},${cb},${.32 * k})`); gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    g.fillStyle = gr; g.fillRect(hx - .3 * s, hy - .3 * s, .6 * s, .6 * s);
    if (view !== 'back') {   // a face in the cloth's opening: dark, its light side lit (no drawn features)
      const fx = hx + fl * (view === 'side' ? .05 : 0) * s, fy = y - .83 * s;
      g.save(); g.beginPath(); g.ellipse(fx, fy, .062 * s, .082 * s, 0, 0, 6.283); g.fillStyle = o.skin || '#6a442a'; g.fill(); g.clip();
      const [sr, sg, sb] = hex(o.skinLit || '#d89a62'); gr = g.createLinearGradient(fx + dx * .07 * s, fy + dy * .07 * s, fx - dx * .03 * s, fy - dy * .03 * s);
      gr.addColorStop(0, `rgba(${sr},${sg},${sb},${.95 * k})`); gr.addColorStop(1, `rgba(${sr},${sg},${sb},0)`); g.fillStyle = gr; g.fillRect(fx - .1 * s, fy - .1 * s, .2 * s, .2 * s); g.restore(); }
    g.restore();
    // a thin rim where the light grazes the edge (a lifted line of paint)
    g.save(); g.setTransform(m); g.lineWidth = 2.2 / s; g.strokeStyle = `rgba(${lr},${lg},${lb},${.35 * k})`; g.stroke(path); g.restore();
  }
  // a darker version of a painted canvas (the same strokes sunk into the umber)
  function sink(src, k = .3) { const c = C(src.width, src.height), g = c.getContext('2d'); g.filter = `brightness(${k}) saturate(.75) contrast(1.08)`; g.drawImage(src, 0, 0); g.filter = 'none';
    g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(255,226,190)'; g.fillRect(0, 0, c.width, c.height); return c; }

  // ---------------------------------------------------------------- ROOF: a tall plate (tilt down), hole at the top
  function buildRoof() {
    const PW = W, PH = Math.round(H * 1.9), plate = C(PW, PH), g = plate.getContext('2d'), R = rng(31);
    const hole = [[352, 380], [430, 330], [520, 352], [610, 318], [700, 350], [748, 420], [726, 520], [640, 566], [540, 548], [440, 572], [370, 520], [338, 450]];
    const HC = [545, 450], FLOOR = [560, PH - 900];
    // the dark air, the ceiling (beams and a mat of branches and clay), the walls hinted at the sides
    let gr = g.createLinearGradient(0, 0, 0, PH); gr.addColorStop(0, '#24170d'); gr.addColorStop(.3, '#160e08'); gr.addColorStop(.75, '#130b06'); gr.addColorStop(1, '#1c120a'); g.fillStyle = gr; g.fillRect(0, 0, PW, PH);
    for (let i = 0; i < 7; i++) { const y = 120 + i * 120 + R() * 30; poly(g, [[-20, y], [PW + 20, y - 20 + R() * 40], [PW + 20, y + 46], [-20, y + 40]], i % 2 ? '#2a1a0e' : '#3a2512'); }   // beams
    for (let i = 0; i < 260; i++) { const x = R() * PW, y = R() * 900; g.strokeStyle = `rgba(${R() < .5 ? '70,48,26' : '28,18,10'},.5)`; g.lineWidth = 2 + R() * 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 60 + R() * 90, y + (R() - .5) * 30); g.stroke(); }   // reeds and branches
    radial(g, HC[0], HC[1] + 40, 520, 'rgba(190,130,70,.55)', 'rgba(190,130,70,0)');   // the underside of the roof lit around the hole
    // the hole: sky (warm white), broken branch ends jutting in, the four men at the rim against the sky (dark, backlit)
    gr = g.createRadialGradient(HC[0], HC[1], 20, HC[0], HC[1], 260); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(.6, '#fbe7c2'); gr.addColorStop(1, '#f0c88a'); poly(g, hole, null); g.fillStyle = gr; g.fill();
    for (let i = 0; i < 26; i++) { const a = R() * 6.283, p0 = hole[(R() * hole.length) | 0]; g.strokeStyle = '#2a1a0c'; g.lineWidth = 3 + R() * 5; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p0[0] + (HC[0] - p0[0]) * (.12 + R() * .2) + Math.cos(a) * 10, p0[1] + (HC[1] - p0[1]) * (.12 + R() * .2) + Math.sin(a) * 10); g.stroke(); }
    for (const [x, y, s, fl] of [[420, 352, 120, 0], [650, 338, 130, 1], [372, 476, 110, 0], [712, 470, 115, 1]]) {   // the four, leaning over the edge, holding the ropes
      g.save(); g.translate(x, y); g.scale(fl ? -s / 100 : s / 100, s / 100); g.fillStyle = '#1e140c';
      g.beginPath(); g.ellipse(0, -30, 13, 15, 0, 0, 6.283); g.fill(); poly(g, [[-16, -26], [16, -26], [26, 8], [40, 30], [-30, 30]], '#1e140c');   // head cloth + shoulders bent over
      g.lineWidth = 9; g.strokeStyle = '#1e140c'; g.beginPath(); g.moveTo(14, -6); g.lineTo(36, 26); g.stroke(); g.restore(); }
    // the crowd at the bottom: rows of heads and shoulders round a cleared floor; lit from the hole above
    const hot = { x: HC[0], y: HC[1] + 300, R: 2600 };
    radial(g, FLOOR[0], FLOOR[1] + 40, 420, 'rgba(150,100,56,.75)', 'rgba(150,100,56,0)');   // the floor where the light lands
    g.save(); g.translate(FLOOR[0], FLOOR[1] + 40); g.scale(1, .32); radial(g, 0, 0, 300, 'rgba(230,190,130,.8)', 'rgba(230,190,130,0)'); g.restore();
    const robes = [['#1a120c', '#8a6a44'], ['#1c100a', '#9c4a2a'], ['#14100c', '#6a5a46'], ['#1a140e', '#a08860'], ['#120c08', '#5a4a3a']];
    for (let row = 0; row < 3; row++) for (let i = 0; i < 7; i++) {   // back rows first (smaller, higher), a ring round the floor
      const a = Math.PI * (.08 + .84 * i / 6), rx = 470 - row * 40, ry = 300 - row * 30, x = FLOOR[0] + Math.cos(a) * rx * (i % 2 ? 1.05 : .95), y = FLOOR[1] - 120 - Math.sin(a) * ry * .6 - row * 70 + R() * 30;
      if (Math.abs(x - FLOOR[0]) < 170 && row === 2) continue;
      man(g, x, y, 250 - row * 40 + R() * 20, R() < .5 ? 'side' : 'front', robes[(R() * 5) | 0], hot, { flip: x > FLOOR[0], lean: (FLOOR[0] - x) / 900 }); }
    // the King: in front, a little to the left, from behind, facing the man (dark; the light from above only on his cloth's edge)
    man(g, 330, FLOOR[1] + 560, 360, 'back', ['#120a06', '#6e5638'], hot, { lean: .12 });
    const art = OIL.paint(plate, { key: 'caravaggio', seed: 5, cell: 7 });
    // the hole stays bright in the dark version
    const dark = sink(art, .64), dg = dark.getContext('2d'); dg.save(); poly(dg, hole.map(([x, y]) => [x + (x - HC[0]) * .06, y + (y - HC[1]) * .06])); dg.clip(); dg.drawImage(art, 0, 0); dg.restore();
    // the stretcher (painted separately, from above at an angle): a mat on two poles, the man under a blanket, his head
    const sw = 520, sh2 = 300, sp = C(sw, sh2), sg = sp.getContext('2d');
    poly(sg, [[40, 120], [480, 100], [500, 190], [20, 214]], '#5a3a1e'); poly(sg, [[56, 130], [464, 112], [482, 182], [38, 202]], '#8a6a40');   // poles + mat
    sg.save(); sg.beginPath(); sg.ellipse(250, 150, 170, 48, -.04, 0, 6.283); sg.fillStyle = '#b8a07a'; sg.fill(); sg.restore();                 // the body under the blanket
    for (let i = 0; i < 8; i++) { sg.strokeStyle = 'rgba(80,60,40,.5)'; sg.lineWidth = 3; sg.beginPath(); sg.moveTo(130 + i * 30, 112); sg.quadraticCurveTo(140 + i * 30, 150, 128 + i * 32, 192); sg.stroke(); }   // blanket folds
    sg.beginPath(); sg.ellipse(426, 140, 34, 30, 0, 0, 6.283); sg.fillStyle = '#c08a5a'; sg.fill(); sg.beginPath(); sg.ellipse(440, 132, 26, 24, 0, 0, 6.283); sg.fillStyle = '#2a1a10'; sg.fill();   // head (short dark hair toward the top)
    const spArt = OIL.paint(sp, { key: 'caravaggio', seed: 9, cell: 5, S: 1 }), spg = spArt.getContext('2d'); spg.globalCompositeOperation = 'destination-in'; spg.drawImage(sp, 0, 0);
    ROOF = { art, dark, PW, PH, hole, HC, FLOOR, sp: spArt, spDark: (() => { const d = sink(spArt, .4), x = d.getContext('2d'); x.globalCompositeOperation = 'destination-in'; x.drawImage(sp, 0, 0); return d; })() };
  }
  // ---------------------------------------------------------------- TABLE: the tax collector's house
  function buildTable() {
    const PW = Math.round(W * 1.08), PH = Math.round(H * 1.08), plate = C(PW, PH), g = plate.getContext('2d'), R = rng(77);
    const WIN = [[800, 300], [1010, 280], [1010, 620], [800, 600]], DOOR = [[104, 640], [276, 632], [276, 1180], [104, 1190]];
    // wall, floor, the window frame (pale light in it), the doorway (the bright street outside)
    let gr = g.createLinearGradient(0, 0, PW, PH); gr.addColorStop(0, '#2a1c10'); gr.addColorStop(.5, '#1a110a'); gr.addColorStop(1, '#120a06'); g.fillStyle = gr; g.fillRect(0, 0, PW, PH);
    poly(g, [[0, 1180], [PW, 1150], [PW, PH], [0, PH]], '#1e130b');
    radial(g, 860, 520, 560, 'rgba(170,120,70,.5)', 'rgba(170,120,70,0)');   // the wall round the window, lit
    poly(g, WIN, '#f6e6c4'); poly(g, [[800, 300], [870, 296], [866, 604], [800, 600]], '#3a2614'); g.strokeStyle = '#2a1a0c'; g.lineWidth = 10; g.beginPath(); g.moveTo(905, 290); g.lineTo(905, 610); g.moveTo(805, 450); g.lineTo(1005, 448); g.stroke();   // shutter and bars
    gr = g.createLinearGradient(104, 640, 276, 1190); gr.addColorStop(0, '#f8ead0'); gr.addColorStop(1, '#e4c696'); poly(g, DOOR, null); g.fillStyle = gr; g.fill();
    poly(g, [[104, 1050], [276, 1044], [276, 1180], [104, 1190]], '#c8a474');   // the street's ground beyond the door
    // the table (dark wood) with a cloth, coins, a ledger, cups — where the beam lands
    const TB = [[150, 1080], [930, 1060], [970, 1210], [110, 1236]];
    poly(g, TB, '#3a2412'); poly(g, [[240, 1074], [760, 1062], [790, 1170], [220, 1184]], '#cdbb98');
    for (let i = 0; i < 26; i++) { const x = 430 + R() * 120, y = 1110 + R() * 40; g.beginPath(); g.ellipse(x, y, 7, 3.5, 0, 0, 6.283); g.fillStyle = R() < .5 ? '#c99a3a' : '#a8782a'; g.fill(); }   // coins
    poly(g, [[600, 1090], [700, 1086], [706, 1130], [604, 1134]], '#6a4a2a');   // a ledger
    for (const x of [300, 820]) { g.beginPath(); g.ellipse(x, 1106, 18, 8, 0, 0, 6.283); g.fillStyle = '#7a5a34'; g.fill(); }
    // the people at the table (behind it and at its ends), the King at the near side from behind, one more guest near right
    const light = { x: 980, y: 380, R: 1500 };
    const ppl = [[340, 1080, 320, 'side', ['#1a120a', '#8a6a3a'], { flip: true, lean: .1 }], [400, 1064, 340, 'front', ['#1a0e08', '#a8402a'], { lean: .05 }],
      [570, 1060, 330, 'front', ['#14100a', '#6a5a44'], { lean: -.04 }], [740, 1062, 345, 'front', ['#1a120c', '#9c8a62'], { lean: -.1 }], [905, 1080, 330, 'side', ['#120c08', '#7a5a3a'], {}]];
    for (const [x, y, s, v, c, o] of ppl) man(g, x, y, s, v, c, light, o);
    man(g, 470, 1500, 470, 'back', ['#120a06', '#5a4630'], light, { lean: -.05 });    // the King, seated at the near side, back to us
    man(g, 880, 1560, 440, 'back', ['#140c08', '#6a5236'], light, { lean: .1 });
    const art = OIL.paint(plate, { key: 'caravaggio', seed: 12, cell: 7 });
    const dark = sink(art, .62), dg = dark.getContext('2d'); for (const q of [WIN, DOOR]) { dg.save(); poly(dg, q); dg.clip(); dg.drawImage(art, 0, 0); dg.restore(); }   // window and door stay bright
    TABLE = { art, dark, PW, PH, WIN, DOOR };
  }

  // ---------------------------------------------------------------- live pieces
  const tmp = { c: null, g: null };
  const tmpCanvas = () => { if (!tmp.c) { tmp.c = C(W, H); tmp.g = tmp.c.getContext('2d'); } return tmp.g; };
  // reveal the LIT painting through a live light shape (feathered) over the DARK one; view: plate point (fx, fy) at the centre, zoom z
  function litView(ctx, A, fx, fy, z, shape, k = 1, warm = 0) {
    OIL.view(ctx, A.dark, 1, fx, fy, z);
    const g = tmpCanvas(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
    OIL.view(g, A.art, 1, fx, fy, z);
    g.globalCompositeOperation = 'destination-in'; g.setTransform(z, 0, 0, z, W / 2 - fx * z, H / 2 - fy * z); g.filter = `blur(${(22 * z).toFixed(0)}px)`; g.fillStyle = '#fff'; shape(g); g.filter = 'none';
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.globalAlpha = k; ctx.drawImage(tmp.c, 0, 0); ctx.restore();
    if (warm > 0) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = warm; ctx.drawImage(tmp.c, 0, 0); ctx.restore(); }
  }
  // the visible shaft (dust in the air): a soft additive wedge with slow streaks and a few motes
  function shaft(ctx, a0, a1, b0, b1, k, t, seed, warm = 0) {
    if (k <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen';
    const mid0 = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2], mid1 = [(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2];
    const gr = ctx.createLinearGradient(mid0[0], mid0[1], mid1[0], mid1[1]); const c = warm > 0 ? [255, 214 - 20 * warm, 150 - 40 * warm] : [255, 236, 200];
    gr.addColorStop(0, `rgba(${c},${.34 * k})`); gr.addColorStop(.7, `rgba(${c},${.14 * k})`); gr.addColorStop(1, `rgba(${c},${.04 * k})`);
    ctx.filter = 'blur(18px)'; poly(ctx, [a0, a1, b1, b0]); ctx.fillStyle = gr; ctx.fill(); ctx.filter = 'none';
    const r = rng(seed); for (let i = 0; i < 9; i++) { const u = r(), w = .02 + r() * .05, dr = .01 * Math.sin(t * .3 + i);   // streaks along the beam
      const p0 = [lerp(a0[0], a1[0], u + dr), lerp(a0[1], a1[1], u + dr)], p1 = [lerp(b0[0], b1[0], u + dr), lerp(b0[1], b1[1], u + dr)], q0 = [lerp(a0[0], a1[0], u + w), lerp(a0[1], a1[1], u + w)], q1 = [lerp(b0[0], b1[0], u + w), lerp(b0[1], b1[1], u + w)];
      ctx.fillStyle = `rgba(${c},${(.03 + .04 * r()) * k})`; poly(ctx, [p0, q0, q1, p1]); ctx.fill(); }
    for (let i = 0; i < 60; i++) { const u = r(), v = (r() + t * (.03 + .05 * r())) % 1, x = lerp(lerp(a0[0], a1[0], u), lerp(b0[0], b1[0], u), v) + 6 * Math.sin(t * .7 + i), y = lerp(lerp(a0[1], a1[1], u), lerp(b0[1], b1[1], u), v);
      const rr = 1 + r() * 2.2; ctx.fillStyle = `rgba(255,236,200,${(.2 + .4 * r()) * k * (1 - Math.abs(v - .5))})`; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.283); ctx.fill(); }
    ctx.restore();
  }
  // a standing man as a dark silhouette (the ones in the doorway), arm pointing by pt (0..1), head leaning by hl
  function silhouette(ctx, x, y, s, flip, pt, hl, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s); ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(hl * 8, -168, 12, 14, 0, 0, 6.283); ctx.fill();
    poly(ctx, [[-14 + hl * 8, -166], [14 + hl * 8, -166], [24, -140], [30, -60], [26, 0], [-26, 0], [-30, -60], [-24, -140]]); ctx.fill();   // head cloth, robe to the ground
    ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(18, -132); ctx.lineTo(18 + 34 * pt, -116 - 26 * pt); ctx.lineTo(18 + 64 * pt + 6 * (1 - pt), -112 - 30 * pt + 50 * (1 - pt)); ctx.stroke();   // the pointing arm
    ctx.restore();
  }

  // ---------------------------------------------------------------- frame
  function draw(ctx, t, B) {
    if (!T) T = beats(B);
    ctx.fillStyle = '#0e0805'; ctx.fillRect(0, 0, W, H);
    if (t < T.table0) {
      const A = ROOF, top = H / 2, bot = A.FLOOR[1] - 30;
      const fy = lerp(top, bot, eio((t - T.tilt0) / (T.tilt1 - T.tilt0))), z = 1 + .2 * eio((t - T.down1 + .6) / (T.push1 - T.down1 + .6)) + .02 * Math.sin(t * .35);
      const fx = W / 2 + 26 * Math.sin(t * .45) - 40 * eio((t - T.down1 + .6) / (T.push1 - T.down1 + .6));
      const warm = ss(T.warm0, T.warm1, t), rest = ss(T.rest - .4, T.rest + 1.6, t) * (1 + .18 * Math.sin((t - T.rest) * 1.6)) * ss(T.down1 - 1, T.down1, t) + 0;   // the resting light breathes
      // the shaft from the hole to the floor: its shape is the light that reveals the lit paint
      const sTop = [[A.HC[0] - 170, A.HC[1] + 40], [A.HC[0] + 170, A.HC[1] + 40]], sBot = [[A.FLOOR[0] - 300, A.FLOOR[1] + 120], [A.FLOOR[0] + 300, A.FLOOR[1] + 120]];
      const shape = g => { poly(g, [sTop[0], sTop[1], sBot[1], sBot[0]]); g.fill(); g.beginPath(); g.ellipse(A.FLOOR[0], A.FLOOR[1] + 60, 330 + 60 * rest, 120 + 30 * rest, 0, 0, 6.283); g.fill(); poly(g, A.hole); g.fill(); };
      litView(ctx, A, fx, fy, z, shape, .78 + .22 * rest, .5 * warm);
      { const c = [W / 2 + (A.FLOOR[0] - fx) * z, H / 2 + (A.FLOOR[1] - 500 - fy) * z]; ctx.save(); ctx.globalCompositeOperation = 'screen'; const r = 1100 * z, gr = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], r);
        gr.addColorStop(0, `rgba(200,150,100,${.2 + .08 * rest})`); gr.addColorStop(1, 'rgba(120,80,50,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); }   // the room's air, lit by the shaft
      // the stretcher on its four ropes: from the hole down into the light, settling on the floor
      const dk = eio((t - T.down0) / (T.down1 - T.down0)), sy = lerp(A.HC[1] + 60, A.FLOOR[1] - 90, dk) - 6 * Math.sin(clamp((t - T.down1) / 1.6) * Math.PI * 2) * (1 - clamp((t - T.down1) / 1.6)), sw = lerp(.62, 1, dk), sway = (1 - dk) * Math.sin(t * 1.3) * .04;   // a last settle on landing
      ctx.save(); ctx.setTransform(z, 0, 0, z, W / 2 - fx * z, H / 2 - fy * z);
      const cx = A.FLOOR[0] + (1 - dk) * -10, corners = [[-215, -40], [215, -48], [228, 40], [-226, 52]].map(([x, y]) => [cx + x * sw, sy + y * sw]);
      ctx.strokeStyle = 'rgba(70,50,30,.9)'; ctx.lineWidth = 2.4; const anchors = [[A.HC[0] - 140, A.HC[1] - 50], [A.HC[0] + 150, A.HC[1] - 60], [A.HC[0] + 170, A.HC[1] + 30], [A.HC[0] - 160, A.HC[1] + 40]];
      corners.forEach((c, i) => { const slack = ss(T.down1 - .2, T.down1 + 1.2, t); ctx.beginPath(); ctx.moveTo(anchors[i][0], anchors[i][1]); ctx.quadraticCurveTo(lerp(anchors[i][0], c[0], .5) + slack * 30, lerp(anchors[i][1], c[1], .5), c[0], c[1]); ctx.stroke(); });
      ctx.translate(cx, sy); ctx.rotate(sway); ctx.scale(sw, sw);
      ctx.drawImage(A.spDark, -260, -150); ctx.save(); ctx.globalAlpha = .55 + .45 * rest; ctx.drawImage(A.sp, -260, -150); ctx.restore();
      ctx.restore();
      // the air of the shaft (above everything): dust turning in the daylight; on Q42 the light comes down and rests on him
      const P2 = (x, y) => [W / 2 + (x - fx) * z, H / 2 + (y - fy) * z];
      shaft(ctx, P2(...sTop[0]), P2(...sTop[1]), P2(...sBot[0]), P2(...sBot[1]), .9 + .35 * rest, t, 3, warm);
      if (rest > 0) { const c = P2(A.FLOOR[0], A.FLOOR[1] - 60); ctx.save(); ctx.globalCompositeOperation = 'screen'; const r = 380 * z, gr = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], r);
        gr.addColorStop(0, `rgba(255,${226 - 30 * warm},${170 - 60 * warm},${.32 * rest})`); gr.addColorStop(1, 'rgba(255,200,140,0)'); ctx.fillStyle = gr; ctx.fillRect(c[0] - r, c[1] - r, 2 * r, 2 * r); ctx.restore(); }
      // falling bits of clay and straw while the roof is open (first seconds)
      const fk = 1 - ss(T.down0 + 2, T.down0 + 4, t); if (fk > 0) { const r = rng(17); for (let i = 0; i < 24; i++) { const ph = (t * (.5 + r() * .5) + r()) % 1, x = A.HC[0] + (r() - .5) * 300, y = A.HC[1] + ph * 1400; const p = P2(x, y); ctx.fillStyle = `rgba(60,40,20,${.7 * fk})`; ctx.fillRect(p[0], p[1], 3 + r() * 4, 2 + r() * 3); } }
      // the match cut: we arrive from the white of the sky above the village
      const wi = 1 - ss(T.roof0, T.roof0 + .9, t); if (wi > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,244,222,${wi * .85})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    } else {
      const A = TABLE, pk = eio((t - T.table0) / (T.end - T.table0)), z = 1.08 + .16 * pk + .1 * eio((t - T.gone + 1) / (T.end - T.gone + 1)) + .015 * Math.sin(t * .35), fx = A.PW / 2 - 40 * pk + 22 * Math.sin(t * .45), fy = A.PH / 2 - 130 + 60 * pk;
      // the beam from the window: its left edge sweeps across the people, right to left (N46), then holds
      const bk = eio((t - T.beam0) / (T.beam1 - T.beam0)) - .06 * ss(T.gone - 1, T.end, t) * (1 + Math.sin(t * .9)), w0 = [A.WIN[0][0] + 20, A.WIN[0][1] + 40], w1 = [A.WIN[2][0], A.WIN[2][1] - 20];
      const fl = [lerp(760, 150, bk), lerp(1120, 1260, bk)], fr = [990, 1190];
      const shape = g => { poly(g, [w0, w1, fr, [fr[0], 1700], [fl[0] - 80, 1700], fl]); g.fill(); poly(g, A.WIN); g.fill(); };
      litView(ctx, A, fx, fy, z, shape, .35 + .65 * ss(T.beam0 - .3, T.beam0 + 1.2, t));
      const P2 = (x, y) => [W / 2 + (x - fx) * z, H / 2 + (y - fy) * z];
      { const c = P2(560, 1080); ctx.save(); ctx.globalCompositeOperation = 'screen'; const r = 1000 * z, gr = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], r); gr.addColorStop(0, 'rgba(200,150,100,.22)'); gr.addColorStop(1, 'rgba(120,80,50,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); }   // the room's air
      shaft(ctx, P2(...w0), P2(...w1), P2(...fl), P2(...fr), .9 * ss(T.beam0 - .3, T.beam0 + 1.2, t), t, 8);
      // the doorway: three silhouettes lean together and point; their shadows reach into the room, then they withdraw
      const on = ss(T.whisper0 - .2, T.whisper0 + 1.2, t), off = ss(T.whisper1, T.gone, t);
      if (on > 0 && off < 1) {
        const D = A.DOOR, base = 1186, slide = off * 260;
        ctx.save(); ctx.setTransform(z, 0, 0, z, W / 2 - fx * z, H / 2 - fy * z);
        ctx.save(); poly(ctx, D); ctx.clip();
        const fig = [[146, .95, 0, .9], [196, 1.0, 1, .25], [246, .92, 1, .6]];
        fig.forEach(([x, s, flip, ph], i) => { const pt = i === 0 ? ss(T.whisper0 + .6, T.whisper0 + 1.6, t) * (1 - off) : 0, hl = Math.sin(t * 2.2 + ph * 6) * .6 * (i ? 1 : .3);
          ctx.globalAlpha = on; silhouette(ctx, x - slide * (i === 0 ? 1.1 : .9), base, s * 2.4, flip, pt, hl, 'rgba(34,22,14,.95)'); });
        ctx.restore();
        // their long shadows on the floor, toward the table (the street's low sun behind them)
        ctx.globalCompositeOperation = 'multiply'; ctx.filter = 'blur(10px)';
        fig.forEach(([x], i) => { const L = (520 - i * 60) * (1 - off), xs = x - slide; if (L < 10) return; poly(ctx, [[xs - 18, 1196], [xs + 18, 1196], [xs + 70 + L * .55, 1196 + L * .5], [xs + 20 + L * .55, 1210 + L * .55]]); ctx.fillStyle = `rgba(40,26,16,${.75 * on})`; ctx.fill(); });
        ctx.filter = 'none'; ctx.restore();
      }
    }
    // the blacks are warm umber, never pure black (the glazed darks of the paintings; and the phone must still read the room)
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgb(56,38,24)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    OIL.varnish(ctx, .6);
    const vg = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .35, W / 2, H * .45, Math.max(W, H) * .7); vg.addColorStop(0, 'rgba(10,6,3,0)'); vg.addColorStop(1, 'rgba(10,6,3,.32)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }
  function build(W0, H0) { W = W0; H = H0; buildRoof(); buildTable(); return { beats, draw }; }
  window.OilRoofTable = { build, beats };
})();
