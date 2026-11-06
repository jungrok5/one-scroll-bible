/* oil-nazareth.js — 「메시아」 3차 3부, 나사렛의 방 (2026-11-07: 호퍼풍은 "약간 호러틱" → 페르메이르풍 창가 빛 유화).
   After Vermeer's single-window interiors: soft morning light from a window on the left, a cool-warm plaster wall, Mary standing
   in profile toward the light, veiled in blue, one hand on her child; on the table by the window a clay jar, bread and a spindle.
   Through the open shutter: a pale sky over the hills and the road out of the village — empty (N09 "떠날 이유는 아무것도 없었습니다").
   Mary lives (motion-skills live-character's recipe, closed-form so any frame can be rendered alone): she is painted as parts —
   the body (breathes), the head (turns on the neck), the hand (rests and strokes her child), the eye (drawn each frame: lowered,
   blinking, lifted to the window). `looks` = [[t0, t1], …] when she lifts her eyes to the road: the eyes go first, the head follows
   on a spring with a small overshoot, a blink on each shift.
   Uses film.html's (or the sample page's) W/H/V, Pilot helpers and bez(); kit-oilpaint.js paints the plates (key 'vermeer'). */
const NOIL = { S: 1.5, room: null, body: null, head: null, looks: [[2.4, 6.4]], PIV: [-.03, -1.36] };
function buildNazarethOil() {
  const S = NOIL.S, PW = Math.round(W * S), PH = Math.round(H * S);
  const gy = H * (V ? .66 : .7);                                         // floor line
  const wx0 = W * (V ? .05 : .1), wx1 = W * (V ? .36 : .34), wy0 = H * (V ? .2 : .14), wy1 = gy - H * (V ? .2 : .22);   // the window
  const LP = [(wx0 + wx1) / 2, (wy0 + wy1) / 2];
  const tx0 = wx0 - 10, tx1 = wx1 + (V ? 50 : 70), ty = gy - H * (V ? .12 : .14);   // the table
  const sM = V ? 470 : 360, mx = wx1 + (V ? 230 : 330), my = gy + (V ? 60 : 40);  // Mary: metres → px, feet at (mx, my)
  Object.assign(NOIL, { gy, LP, wx0, wx1, wy0, wy1, M: [mx, my, sM] });
  NOIL.mary = [mx, my - sM * 1.47, sM];
  const path = cmds => { const q = new Path2D(); bez(q, cmds); return q; };
  const mantle = path([['M', .26, 0], ['C', .26, -.55, .23, -1.05, .2, -1.3], ['C', .19, -1.48, .14, -1.62, .03, -1.67], ['C', -.06, -1.7, -.12, -1.66, -.13, -1.6],
    ['C', -.115, -1.5, -.1, -1.42, -.1, -1.36], ['C', -.13, -1.25, -.16, -1.15, -.17, -1.08], ['C', -.26, -.98, -.3, -.78, -.23, -.6], ['C', -.2, -.42, -.25, -.16, -.32, 0]]);
  const face = path([['M', -.095, -1.6], ['C', -.12, -1.595, -.14, -1.56, -.148, -1.52], ['L', -.153, -1.495], ['C', -.162, -1.48, -.168, -1.47, -.17, -1.462], ['L', -.154, -1.452],
    ['C', -.157, -1.444, -.158, -1.436, -.153, -1.43], ['C', -.157, -1.424, -.156, -1.414, -.15, -1.408], ['C', -.15, -1.396, -.142, -1.386, -.128, -1.382], ['C', -.115, -1.38, -.104, -1.374, -.096, -1.36], ['L', -.09, -1.6]]);
  const neck = path([['M', -.142, -1.44], ['L', -.09, -1.44], ['L', -.082, -1.33], ['L', -.108, -1.335], ['C', -.12, -1.37, -.13, -1.4, -.142, -1.44]]);
  const dress = path([['M', -.105, -1.34], ['C', -.13, -1.24, -.155, -1.15, -.165, -1.08], ['C', -.25, -.98, -.285, -.8, -.225, -.62], ['L', -.19, -.64],
    ['C', -.24, -.8, -.21, -.96, -.13, -1.06], ['C', -.11, -1.16, -.09, -1.25, -.08, -1.33], ['Z']]);
  const HEAD_Y = -1.28, BODY_Y = -1.44;                                   // the head part reaches down to HEAD_Y, the body up to BODY_Y
  const plate = () => { const c = canvas(PW, PH), g = c.getContext('2d'); g.save(); g.scale(S, S); room(g); g.restore(); return c; };
  const inMary = (c, fn) => { const g = c.getContext('2d'); g.save(); g.scale(S, S); g.translate(mx, my); g.scale(sM, sM); fn(g, 1 / sM); g.restore(); };
  const side = (g, c0, c1, x0 = -.32, x1 = .26) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };
  function room(g) {
    const radial = (x, y, R, stops, op = 'source-over') => { g.save(); g.globalCompositeOperation = op; const gr = g.createRadialGradient(x, y, 0, x, y, R); stops.forEach(([k, c]) => gr.addColorStop(k, c)); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R); g.restore(); };
    // the back wall: lime plaster, warm cream near the window falling to a warm shadow across the room
    { const gr = g.createLinearGradient(wx0, 0, W, 0); gr.addColorStop(0, '#f2e8cc'); gr.addColorStop(.4, '#cdbf9c'); gr.addColorStop(.75, '#8e8064'); gr.addColorStop(1, '#4e4434'); g.fillStyle = gr; g.fillRect(0, 0, W, gy); }
    radial(wx1 + W * .12, (wy0 + gy) / 2, W * .5, [[0, 'rgba(255,246,222,.75)'], [.5, 'rgba(240,226,190,.2)'], [1, 'rgba(200,186,150,0)']]);
    { const gr = g.createLinearGradient(0, 0, 0, H * .2); gr.addColorStop(0, 'rgba(70,58,40,.45)'); gr.addColorStop(1, 'rgba(70,58,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H * .2); }   // the ceiling falls off
    // plaster unevenness (values only — the strokes make the texture)
    { const r = rng(8); for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * gy, R = 30 + r() * 90; radial(x, y, R, [[0, `rgba(${r() < .5 ? '120,104,76' : '250,240,214'},.12)`], [1, 'rgba(0,0,0,0)']]); } }
    // the floor: beaten earth, warm grey, lit in a long patch from the window
    { const gr = g.createLinearGradient(0, gy, 0, H); gr.addColorStop(0, '#8a7a5e'); gr.addColorStop(1, '#4e4434'); g.fillStyle = gr; g.fillRect(0, gy, W, H - gy); }
    g.fillStyle = 'rgba(60,50,36,.5)'; g.fillRect(0, gy - 3, W, 5);
    { g.save(); g.globalCompositeOperation = 'screen'; const p = new Path2D(); p.moveTo(wx0 + 40, gy); p.lineTo(wx1 + 40, gy); p.lineTo(wx1 + W * .5, H); p.lineTo(wx0 + W * .22, H); p.closePath();
      const gr = g.createLinearGradient(0, gy, 0, H); gr.addColorStop(0, 'rgba(255,236,196,.42)'); gr.addColorStop(1, 'rgba(255,236,196,.08)'); g.fillStyle = gr; g.filter = 'blur(14px)'; g.fill(p); g.restore(); }
    // the window: deep reveal in a thick wall, an open wooden shutter, outside a pale morning sky, the hills and the empty road
    { const rv = V ? 26 : 22;
      const sky = g.createLinearGradient(0, wy0, 0, wy1); sky.addColorStop(0, '#d9e4ea'); sky.addColorStop(.62, '#f6efd8'); sky.addColorStop(1, '#efe0bc'); g.fillStyle = sky; g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
      g.save(); g.beginPath(); g.rect(wx0, wy0, wx1 - wx0, wy1 - wy0); g.clip();
      const hz = wy0 + (wy1 - wy0) * .66;
      g.fillStyle = '#b8b28e'; g.beginPath(); g.moveTo(wx0, hz); for (let x = wx0; x <= wx1; x += 6) g.lineTo(x, hz - 18 - 14 * Math.sin((x - wx0) / 40) - 10 * Math.sin((x - wx0) / 17)); g.lineTo(wx1, wy1); g.lineTo(wx0, wy1); g.fill();
      g.fillStyle = '#c9c099'; g.beginPath(); g.moveTo(wx0, hz + 16); for (let x = wx0; x <= wx1; x += 6) g.lineTo(x, hz + 8 - 8 * Math.sin((x - wx0) / 55 + 1)); g.lineTo(wx1, wy1); g.lineTo(wx0, wy1); g.fill();
      // the road: a pale ribbon winding off toward the south, nobody on it
      g.strokeStyle = '#efe4c4'; g.lineCap = 'round'; g.lineWidth = 9; g.beginPath(); g.moveTo(wx0 + (wx1 - wx0) * .2, wy1); g.bezierCurveTo(wx0 + (wx1 - wx0) * .55, wy1 - 30, wx0 + (wx1 - wx0) * .4, hz + 30, wx0 + (wx1 - wx0) * .78, hz + 4); g.stroke();
      g.lineWidth = 3.5; g.beginPath(); g.moveTo(wx0 + (wx1 - wx0) * .78, hz + 4); g.quadraticCurveTo(wx0 + (wx1 - wx0) * .9, hz - 4, wx1, hz - 2); g.stroke();
      g.restore();
      // the reveal (thickness of the wall): lit on the right jamb, shaded on the left and above
      g.fillStyle = '#a8977a'; g.fillRect(wx0 - rv, wy0 - rv, rv, wy1 - wy0 + 2 * rv); g.fillStyle = '#f0e6cc'; g.fillRect(wx1, wy0 - rv, rv, wy1 - wy0 + 2 * rv);
      g.fillStyle = '#9a8a6c'; g.fillRect(wx0 - rv, wy0 - rv, wx1 - wx0 + 2 * rv, rv); g.fillStyle = '#e4d8bc'; g.fillRect(wx0 - rv, wy1, wx1 - wx0 + 2 * rv, rv * .8);
      // the open shutter against the wall to the right of the window: weathered wood, a cool shadow beside it
      const sw = (wx1 - wx0) * .42; g.fillStyle = 'rgba(80,70,52,.35)'; g.filter = 'blur(8px)'; g.fillRect(wx1 + rv + 8, wy0 + 6, sw, wy1 - wy0); g.filter = 'none';
      g.fillStyle = '#6a5034'; g.fillRect(wx1 + rv, wy0 - 4, sw, wy1 - wy0 + 8); g.fillStyle = 'rgba(40,28,16,.45)'; for (let i = 1; i < 4; i++) g.fillRect(wx1 + rv + sw * i / 4, wy0 - 4, 2.5, wy1 - wy0 + 8);
      g.fillStyle = 'rgba(220,190,140,.35)'; g.fillRect(wx1 + rv, wy0 - 4, 4, wy1 - wy0 + 8); }
    // a table under the window: linen, a clay jar, a round loaf, a spindle with wool
    { g.fillStyle = '#5a4430'; g.fillRect(tx0, ty, tx1 - tx0, 18); g.fillRect(tx0 + 14, ty + 18, 14, gy - ty - 18); g.fillRect(tx1 - 28, ty + 18, 14, gy - ty - 18);
      g.fillStyle = '#e8e0cc'; g.beginPath(); g.moveTo(tx0 + 40, ty); g.lineTo(tx1 - 60, ty); g.lineTo(tx1 - 50, ty + 46); g.quadraticCurveTo((tx0 + tx1) / 2, ty + 58, tx0 + 34, ty + 50); g.closePath(); g.fill();
      const jx = tx0 + (tx1 - tx0) * .3, jr = V ? 34 : 30; const jg = g.createRadialGradient(jx - jr * .4, ty - jr * 1.2, 2, jx, ty - jr, jr * 1.3); jg.addColorStop(0, '#e8b48a'); jg.addColorStop(.6, '#a8643c'); jg.addColorStop(1, '#5a3018');
      g.fillStyle = jg; g.beginPath(); g.ellipse(jx, ty - jr, jr, jr * 1.05, 0, 0, 6.283); g.fill(); g.fillRect(jx - jr * .35, ty - jr * 2.4, jr * .7, jr * .5); g.beginPath(); g.ellipse(jx, ty - jr * 2.4, jr * .5, jr * .14, 0, 0, 6.283); g.fillStyle = '#c47c4c'; g.fill();
      const bx = tx0 + (tx1 - tx0) * .6, br = V ? 30 : 26; const bg = g.createRadialGradient(bx - br * .4, ty - br * .5, 2, bx, ty - br * .2, br * 1.2); bg.addColorStop(0, '#f0cc8c'); bg.addColorStop(1, '#8a5a2a');
      g.fillStyle = bg; g.beginPath(); g.ellipse(bx, ty - br * .4, br, br * .5, 0, 0, 6.283); g.fill();
      const sx = tx0 + (tx1 - tx0) * .8; g.strokeStyle = '#7a5a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(sx, ty - 2); g.lineTo(sx + 10, ty - 70); g.stroke();
      g.fillStyle = '#f2ead8'; g.beginPath(); g.ellipse(sx + 6, ty - 40, 14, 22, .12, 0, 6.283); g.fill(); }
    // Mary's contact shadow on the floor, falling away from the window (it stays put; she does not walk)
    { g.save(); g.translate(mx, my); g.scale(sM, sM); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(60,48,32,.55)'; g.beginPath(); g.ellipse(.12, 0, .34, .045, 0, 0, 6.283); g.fill(); g.restore(); }
  }
  // the window light itself: a soft shaft through the air and a glaze over everything near the window (over Mary too)
  function light(c) { const g = c.getContext('2d'); g.save(); g.scale(S, S);
    { g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(30px)'; const p = new Path2D(); p.moveTo(wx0, wy0); p.lineTo(wx1, wy0); p.lineTo(mx + sM * .2, gy + 40); p.lineTo(wx0 + 60, gy + 60); p.closePath(); g.fillStyle = 'rgba(255,240,206,.16)'; g.fill(p); g.restore(); }
    { g.save(); g.globalCompositeOperation = 'screen'; const R = Math.max(W, H) * .5, gr = g.createRadialGradient(LP[0], LP[1], 0, LP[0], LP[1], R);
      gr.addColorStop(0, 'rgba(255,246,224,.35)'); gr.addColorStop(.4, 'rgba(250,234,200,.12)'); gr.addColorStop(1, 'rgba(240,220,180,0)'); g.fillStyle = gr; g.fillRect(LP[0] - R, LP[1] - R, 2 * R, 2 * R); g.restore(); }
    g.restore(); return c; }
  // the parts, each drawn into its own copy of the room (so the brush meets the right neighbours at the edges)
  function body(g, lw) {   // the mantle below the neck, the red dress, the throat (seen when she lifts her chin), the sleeve
    g.save(); g.beginPath(); g.rect(-1, BODY_Y, 2, 2); g.clip();
    g.fillStyle = side(g, '#7d9ad6', '#121c40'); g.fill(mantle);
    g.save(); g.clip(mantle);
    { const gr = g.createRadialGradient(-.3, -1.1, .02, -.3, -1.1, .55); gr.addColorStop(0, 'rgba(190,210,245,.55)'); gr.addColorStop(1, 'rgba(190,210,245,0)'); g.fillStyle = gr; g.fillRect(-.4, -1.8, .8, 1.8); }
    g.lineCap = 'round'; g.filter = 'blur(3px)';
    for (const [x0, y0, x1, y1, w, a] of [[.08, -1.32, .14, 0, .03, .5], [.0, -1.2, .02, 0, .025, .45], [-.08, -1.12, -.12, 0, .02, .35], [.16, -1.1, .22, 0, .02, .4], [-.16, -.6, -.26, 0, .018, .3]]) {
      g.strokeStyle = `rgba(8,12,34,${a * .45})`; g.lineWidth = w * 1.8; g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(x0 + .03, (y0 * 2 + y1) / 3, x1 - .03, (y0 + y1 * 2) / 3, x1, y1); g.stroke(); }
    g.filter = 'none'; g.restore();
    g.fillStyle = side(g, '#e8b898', '#8a5a40', -.15, -.08); g.fill(neck);
    g.fillStyle = side(g, '#d8705a', '#5a1a14', -.3, -.05); g.fill(dress);
    // the sleeve from the shoulder down to the hand on her child (the hand itself is drawn each frame)
    g.strokeStyle = side(g, '#6a88c8', '#1a2856', -.25, .05); g.lineWidth = .085; g.lineCap = 'round'; g.beginPath(); g.moveTo(-.02, -1.27); g.bezierCurveTo(-.03, -1.08, -.1, -.95, -.19, -.9); g.stroke();
    // the lit rim along the front (the window light skims the cloth)
    g.save(); g.clip(mantle); g.strokeStyle = 'rgba(214,228,255,.55)'; g.lineWidth = .02; g.beginPath(); g.moveTo(-.17, -1.08); g.bezierCurveTo(-.26, -.98, -.3, -.78, -.23, -.6); g.bezierCurveTo(-.2, -.42, -.25, -.16, -.32, 0); g.stroke(); g.restore();
    g.restore(); }
  function head(g) {        // the veil over the head down to the shoulders, the face in profile toward the window
    g.save(); g.beginPath(); g.rect(-1, -2, 2, 2 + HEAD_Y); g.clip();
    g.fillStyle = side(g, '#7d9ad6', '#121c40'); g.fill(mantle);
    g.save(); g.clip(mantle);
    { const gr = g.createRadialGradient(-.3, -1.1, .02, -.3, -1.1, .55); gr.addColorStop(0, 'rgba(190,210,245,.55)'); gr.addColorStop(1, 'rgba(190,210,245,0)'); g.fillStyle = gr; g.fillRect(-.4, -1.8, .8, 1.8); }
    g.strokeStyle = 'rgba(10,14,36,.55)'; g.lineWidth = .025; g.beginPath(); g.moveTo(-.12, -1.61); g.bezierCurveTo(-.1, -1.52, -.085, -1.43, -.09, -1.35); g.stroke();   // the veil's inner edge, in shadow
    g.restore(); g.restore();
    faceDetail(g); }
  function faceDetail(g, lw = 1 / sM) {   // also drawn again over the painting, so the profile stays crisp
    g.fillStyle = side(g, '#ffe2c4', '#b07a58', -.17, -.09); g.fill(face);
    // volume: the window lights the brow, nose and cheek; the cheek turns away into warm shade toward the veil; a little colour
    g.save(); g.clip(face);
    { const gr = g.createRadialGradient(-.15, -1.49, .005, -.14, -1.47, .07); gr.addColorStop(0, 'rgba(255,240,220,.5)'); gr.addColorStop(1, 'rgba(255,240,220,0)'); g.fillStyle = gr; g.fillRect(-.2, -1.6, .15, .25); }
    { const gr = g.createLinearGradient(-.125, 0, -.09, 0); gr.addColorStop(0, 'rgba(120,70,46,0)'); gr.addColorStop(1, 'rgba(120,70,46,.45)'); g.fillStyle = gr; g.fillRect(-.2, -1.6, .15, .25); }
    { const gr = g.createRadialGradient(-.124, -1.452, .002, -.124, -1.452, .022); gr.addColorStop(0, 'rgba(226,128,104,.28)'); gr.addColorStop(1, 'rgba(226,128,104,0)'); g.fillStyle = gr; g.fillRect(-.16, -1.49, .08, .08); }
    g.strokeStyle = 'rgba(130,78,56,.28)'; g.lineWidth = lw * 2; g.beginPath(); g.moveTo(-.13, -1.384); g.quadraticCurveTo(-.112, -1.39, -.1, -1.41); g.stroke();   // the jaw
    g.restore();
    g.fillStyle = 'rgba(120,64,48,.5)'; g.beginPath(); g.ellipse(-.158, -1.4665, .003, .0016, -.3, 0, 6.283); g.fill();   // the nostril
    g.strokeStyle = 'rgba(160,78,62,.7)'; g.lineWidth = lw * 2.2; g.beginPath(); g.moveTo(-.156, -1.4265); g.quadraticCurveTo(-.15, -1.423, -.143, -1.425); g.stroke();   // the lips
    g.strokeStyle = 'rgba(110,70,50,.42)'; g.lineWidth = lw * 2.6; g.beginPath(); g.moveTo(-.148, -1.5045); g.quadraticCurveTo(-.137, -1.511, -.122, -1.506); g.stroke();   // the brow
    // the veil comes forward over the cheek: its inside in deep shade, hugging the face, then its lit front edge
    g.save(); g.clip(mantle); g.fillStyle = side(g, 'rgba(34,48,100,.9)', 'rgba(60,78,140,0)', -.112, -.082); g.beginPath(); g.moveTo(-.135, -1.75); g.lineTo(-.128, -1.63); g.bezierCurveTo(-.112, -1.54, -.098, -1.46, -.103, -1.37);
    g.lineTo(-.06, -1.37); g.lineTo(-.06, -1.75); g.closePath(); g.fill(); g.restore();
    g.save(); g.clip(mantle); g.strokeStyle = 'rgba(176,198,240,.6)'; g.lineWidth = .012; g.lineCap = 'round'; g.beginPath(); g.moveTo(.03, -1.665); g.bezierCurveTo(-.06, -1.695, -.12, -1.655, -.128, -1.6); g.bezierCurveTo(-.116, -1.53, -.104, -1.45, -.104, -1.38); g.stroke(); g.restore();
  }
  // a layer = the painted copy, kept only inside the part's silhouette (plate px)
  function layer(art, mask) { const c = canvas(PW, PH); inMary(c, mask); const g = c.getContext('2d'); g.save(); g.globalCompositeOperation = 'source-in'; g.drawImage(art, 0, 0); g.restore(); return c; }
  const paint = (c, seed = 23) => OIL.paint(c, { key: 'vermeer', S, seed });
  NOIL.room = paint(light(plate()));
  { const c = plate(); inMary(c, body); NOIL.body = layer(paint(light(c)), g => {
      g.save(); g.beginPath(); g.rect(-1, BODY_Y, 2, 2); g.clip(); g.fillStyle = '#fff'; g.fill(mantle); g.restore(); g.fillStyle = '#fff'; g.fill(neck); g.fill(dress); }); }
  { const c = plate(); inMary(c, head); NOIL.head = layer(paint(light(c)), g => {
      g.save(); g.beginPath(); g.rect(-1, -2, 2, 2 + HEAD_Y); g.clip(); g.fillStyle = '#fff'; g.fill(mantle); g.restore(); g.fillStyle = '#fff'; g.fill(face);
      // fade the lower edge out between the chin and the cut, so the turn leaves no seam on the shoulders
      g.globalCompositeOperation = 'destination-in'; const gr = g.createLinearGradient(0, -1.36, 0, HEAD_Y - .01); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(-1, -2, 2, 1);
      // and off the back of the shoulder, where the turn would push the veil's edge out past the body's silhouette
      g.globalCompositeOperation = 'destination-out'; const rr = g.createRadialGradient(.22, -1.3, .02, .22, -1.3, .11); rr.addColorStop(0, '#fff'); rr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = rr; g.fillRect(0, -1.5, .4, .3); });
    inMary(NOIL.head, g => { g.globalAlpha = .92; faceDetail(g); }); }
  // pearly highlights where the light catches (Vermeer's pointillé): the jar, the loaf
  { const a = NOIL.room.getContext('2d'), r = rng(31); a.save(); a.scale(S, S); a.fillStyle = 'rgba(255,250,236,.85)';
    for (let i = 0; i < 26; i++) { const x = tx0 + (tx1 - tx0) * (.24 + r() * .5), y = ty - 4 - r() * 60; if (r() < .5) { a.beginPath(); a.arc(x, y, .9 + r() * 1.4, 0, 6.283); a.fill(); } } a.restore(); }
  // blink times (calm adult: every 2.2–7 s, a second blink 18 % of the time)
  { const r = rng(57); NOIL.blinks = []; for (let t = 1.1; t < 240; t += 2.2 + r() * 4.8) { NOIL.blinks.push(t); if (r() < .18) NOIL.blinks.push(t + .32); } }
}
// Mary's pose at time t — closed form (a spring's step response instead of a running spring), so stills and seeks match playback
function maryPose(t, looks = NOIL.looks) {
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => (x = cl(x), x * x * (3 - 2 * x));
  const spring = (x, w, z) => { if (x <= 0) return 0; const d = Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * x) * (Math.cos(w * d * x) + z / d * Math.sin(w * d * x)); };
  const vn = x => { const h = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return (s - Math.floor(s)) * 2 - 1; }, i = Math.floor(x), f = x - i, u = (1 - Math.cos(f * Math.PI)) / 2; return h(i) * (1 - u) + h(i + 1) * u; };
  let head = 0, eye = 0; const shifts = [];
  for (const [a, b] of looks) { head += spring(t - a - .18, 6, .72) - spring(t - b - .12, 4, .9); eye += sm((t - a) / .16) - sm((t - b) / .22); shifts.push(a + .04, b + .04); }
  let shut = 0; for (const bt of NOIL.blinks.concat(shifts)) { const d = t - bt; if (d >= 0 && d < .075) shut = Math.max(shut, d / .075); else if (d >= .075 && d < .195) shut = Math.max(shut, 1 - (d - .075) / .12); }
  const T = 4.6, p = ((t + .7 + .25 * vn(t * .2)) / T) % 1, breath = p < .4 ? sm(p / .4) : p < .88 ? 1 - sm((p - .4) / .48) : 0;   // in 40 %, out 48 %, rest
  const still = cl(eye);   // while she looks out the hand rests
  return { th: .085 * head + .012 * vn(t * .35 + 4) + .006 * breath, open: (.32 + .68 * cl(eye)) * (1 - shut), eye: cl(eye), breath,
    hand: .009 * Math.sin(t * 2 * Math.PI / 5.2) * (1 - still) };
}
function nazarethOil(ctx, t, fx, fy, z, looks) {
  const S = NOIL.S, [mx, my, sM] = NOIL.M, pz = maryPose(t, looks), lw = 1 / sM;
  OIL.view(ctx, NOIL.room, S, fx * S, fy * S, z);
  ctx.save(); ctx.translate(W / 2 - fx * z, H / 2 - fy * z); ctx.scale(z, z);
  // the body breathes from the feet: the shoulders rise a few px, the chest widens a little
  ctx.translate(mx, my); ctx.scale(1 + .004 * pz.breath, 1 + .007 * pz.breath); ctx.translate(-mx, -my);
  ctx.drawImage(NOIL.body, 0, 0, NOIL.body.width / S, NOIL.body.height / S);
  // the hand on her child, stroking slowly along the curve of the belly
  { ctx.save(); ctx.translate(mx, my); ctx.scale(sM, sM); const dx = -.45 * pz.hand, dy = .89 * pz.hand, hx = -.225 + dx, hy = -.89 + dy;
    // the back of the hand out of the sleeve, the fingers lying along the curve of her child, the window on the knuckles
    const gr = ctx.createLinearGradient(hx - .05, 0, hx + .04, 0); gr.addColorStop(0, '#ffe0c2'); gr.addColorStop(1, '#a06a4c');
    ctx.globalAlpha = .95; ctx.fillStyle = gr; ctx.strokeStyle = gr; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(hx + .006, hy - .004, .03, .02, -.75, 0, 6.283); ctx.fill();
    for (let k = 0; k < 4; k++) { const a = 2.05 + k * .13, L = [.036, .042, .04, .032][k], x0 = hx - .012 + k * .007, y0 = hy + .002 + k * .006;
      ctx.lineWidth = .0105 - k * .0007; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + Math.cos(a) * L * .6 - .004, y0 + Math.sin(a) * L * .6, x0 + Math.cos(a + .25) * L, y0 + Math.sin(a + .25) * L); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(120,72,50,.45)'; ctx.lineWidth = lw * 1.3; for (let k = 0; k < 3; k++) { const x0 = hx - .009 + k * .007, y0 = hy + .006 + k * .006;   // the gaps between the fingers
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 - .016, y0 + .026); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,240,220,.6)'; ctx.lineWidth = lw * 1.6; ctx.beginPath(); ctx.moveTo(hx - .02, hy - .012); ctx.quadraticCurveTo(hx - .026, hy + .004, hx - .03, hy + .02); ctx.stroke();   // the window catches the knuckles
    ctx.restore(); }
  // the head turns on the neck (+ = the chin lifts toward the window)
  { const px = mx + sM * NOIL.PIV[0], py = my + sM * NOIL.PIV[1]; ctx.translate(px, py); ctx.rotate(pz.th); ctx.translate(-px, -py);
    ctx.drawImage(NOIL.head, 0, 0, NOIL.head.width / S, NOIL.head.height / S);
    ctx.translate(mx, my); ctx.scale(sM, sM); maryEye(ctx, pz, lw); }
  ctx.restore();
  // dust turning slowly in the window light
  { const r = rng(41); ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 80; i++) { const ph = r(), x0 = NOIL.LP[0] + r() * W * .5, y0 = NOIL.wy0 + r() * (NOIL.gy - NOIL.wy0),
      x = W / 2 + (x0 + Math.sin(t * .25 + i) * 18 - fx) * z, y = H / 2 + (y0 + Math.sin(t * .18 + i * 1.7) * 14 - ((t * 3 + ph * 60) % 60) - fy) * z;
    ctx.fillStyle = `rgba(255,246,220,${.18 + .3 * r()})`; ctx.beginPath(); ctx.arc(x, y, .8 + r() * 1.4, 0, 6.283); ctx.fill(); } ctx.restore(); }
  OIL.varnish(ctx, .55, [110, 92, 50]);
}
// the eye in profile (Mary's units): open = 0 shut … .32 lowered to her child … 1 lifted to the window
function maryEye(g, pz, lw) {
  // in profile the eye is a wedge open toward the front; the iris sits at that front edge
  const o = pz.open, f = [-.146, -1.489], b = [-.121, -1.4855];   // the front corner (toward the window) and the back corner
  const up = -1.489 - .011 * o, lo = -1.4855 + .003 * o, sag = -1.4835;
  if (o > .08) { g.save(); const p = new Path2D(); p.moveTo(f[0], f[1]); p.quadraticCurveTo(-.137, up, b[0], b[1]); p.quadraticCurveTo(-.138, lo, f[0], f[1]); p.closePath();
    g.fillStyle = 'rgba(240,228,214,.95)'; g.fill(p); g.clip(p);
    // lowered it sits low under the lid, toward her child; lifted it looks straight out of the window
    g.fillStyle = '#2e1c12'; g.beginPath(); g.arc(-.1405, -1.4885 + .0025 * (1 - pz.eye), .0052, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(255,250,240,.9)'; g.beginPath(); g.arc(-.1428, -1.4905, .0013, 0, 6.283); g.fill(); g.restore(); }   // the window in her eye
  // the upper lid with its lashes (a closed eye is the same line, sagging)
  const ly = o > .08 ? up : sag;
  g.strokeStyle = 'rgba(52,30,20,.92)'; g.lineWidth = lw * 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(f[0] - .0015, f[1] + .0005); g.quadraticCurveTo(-.137, ly, b[0], b[1]); g.stroke();
  g.lineWidth = lw * 1.6; for (let k = 0; k < 3; k++) { const u = .15 + k * .14, x = (1 - u) * (1 - u) * f[0] + 2 * u * (1 - u) * -.137 + u * u * b[0], y = (1 - u) * (1 - u) * f[1] + 2 * u * (1 - u) * ly + u * u * b[1];
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - .0045, y + (o > .5 ? -.0028 : .0032)); g.stroke(); }
  g.strokeStyle = 'rgba(120,76,56,.3)'; g.lineWidth = lw * 1.5; g.beginPath(); g.moveTo(-.142, -1.4955 - .002 * o); g.quadraticCurveTo(-.133, -1.501 - .003 * o, -.122, -1.4935); g.stroke();   // the lid's crease
}
