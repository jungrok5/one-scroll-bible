/* oil-nazareth.js — 「메시아」 3차 3부, 나사렛의 방 (2026-11-07: 호퍼풍은 "약간 호러틱" → 페르메이르풍 창가 빛 유화).
   After Vermeer's single-window interiors: soft morning light from a window on the left, a cool-warm plaster wall, Mary standing
   in profile toward the light, veiled in blue, one hand on her child; on the table by the window a clay jar, bread and a spindle.
   Through the open shutter: a pale sky over the hills and the road out of the village — empty (N09 "떠날 이유는 아무것도 없었습니다").
   Uses film.html's (or the sample page's) W/H/V, Pilot helpers and bez(); kit-oilpaint.js paints the plate (key 'vermeer'). */
const NOIL = { S: 1.5, art: null };
// Mary standing, facing left toward the window, head a little bowed, the mantle over her head, her belly round (metres, feet at 0)
const MARY_S = [['M', .27, 0], ['C', .27, -.5, .25, -1.0, .2, -1.3], ['C', .2, -1.45, .15, -1.6, .05, -1.66], ['C', -.03, -1.7, -.1, -1.66, -.13, -1.58],
  ['C', -.15, -1.53, -.16, -1.49, -.155, -1.45], ['C', -.15, -1.41, -.12, -1.385, -.095, -1.375], ['C', -.12, -1.3, -.14, -1.22, -.15, -1.12],
  ['C', -.24, -1.02, -.29, -.82, -.22, -.62], ['C', -.19, -.42, -.24, -.16, -.31, 0], ['Z']];
function buildNazarethOil() {
  const S = NOIL.S, PW = Math.round(W * S), PH = Math.round(H * S), plate = canvas(PW, PH), g = plate.getContext('2d'); g.scale(S, S);
  const gy = H * (V ? .66 : .7);                                         // floor line
  const wx0 = W * (V ? .05 : .1), wx1 = W * (V ? .36 : .34), wy0 = H * (V ? .2 : .14), wy1 = gy - H * (V ? .2 : .22);   // the window
  const LP = [(wx0 + wx1) / 2, (wy0 + wy1) / 2]; Object.assign(NOIL, { gy, LP, wx0, wx1, wy0, wy1 });
  const radial = (x, y, R, stops, op = 'source-over') => { g.save(); g.globalCompositeOperation = op; const gr = g.createRadialGradient(x, y, 0, x, y, R); stops.forEach(([k, c]) => gr.addColorStop(k, c)); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R); g.restore(); };
  // the back wall: lime plaster, warm cream near the window falling to a cool grey-ochre on the right
  { const gr = g.createLinearGradient(wx0, 0, W, 0); gr.addColorStop(0, '#f2e8cc'); gr.addColorStop(.4, '#cdbf9c'); gr.addColorStop(.75, '#8e8064'); gr.addColorStop(1, '#4e4434'); g.fillStyle = gr; g.fillRect(0, 0, W, gy); }
  radial(wx1 + W * .12, (wy0 + gy) / 2, W * .5, [[0, 'rgba(255,246,222,.75)'], [.5, 'rgba(240,226,190,.2)'], [1, 'rgba(200,186,150,0)']]);
  { const gr = g.createLinearGradient(0, 0, 0, H * .2); gr.addColorStop(0, 'rgba(70,58,40,.45)'); gr.addColorStop(1, 'rgba(70,58,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H * .2); }   // the ceiling falls off
  // plaster unevenness (values only — the strokes make the texture)
  { const r = rng(8); for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * gy, R = 30 + r() * 90; radial(x, y, R, [[0, `rgba(${r() < .5 ? '120,104,76' : '250,240,214'},.12)`], [1, 'rgba(0,0,0,0)']]); } }
  // the floor: beaten earth and a few flagstones, warm grey, lit in a long patch from the window
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
  const tx0 = wx0 - 10, tx1 = wx1 + (V ? 50 : 70), ty = gy - H * (V ? .12 : .14);
  { g.fillStyle = '#5a4430'; g.fillRect(tx0, ty, tx1 - tx0, 18); g.fillRect(tx0 + 14, ty + 18, 14, gy - ty - 18); g.fillRect(tx1 - 28, ty + 18, 14, gy - ty - 18);
    g.fillStyle = '#e8e0cc'; g.beginPath(); g.moveTo(tx0 + 40, ty); g.lineTo(tx1 - 60, ty); g.lineTo(tx1 - 50, ty + 46); g.quadraticCurveTo((tx0 + tx1) / 2, ty + 58, tx0 + 34, ty + 50); g.closePath(); g.fill();
    const jx = tx0 + (tx1 - tx0) * .3, jr = V ? 34 : 30; const jg = g.createRadialGradient(jx - jr * .4, ty - jr * 1.2, 2, jx, ty - jr, jr * 1.3); jg.addColorStop(0, '#e8b48a'); jg.addColorStop(.6, '#a8643c'); jg.addColorStop(1, '#5a3018');
    g.fillStyle = jg; g.beginPath(); g.ellipse(jx, ty - jr, jr, jr * 1.05, 0, 0, 6.283); g.fill(); g.fillRect(jx - jr * .35, ty - jr * 2.4, jr * .7, jr * .5); g.beginPath(); g.ellipse(jx, ty - jr * 2.4, jr * .5, jr * .14, 0, 0, 6.283); g.fillStyle = '#c47c4c'; g.fill();
    const bx = tx0 + (tx1 - tx0) * .6, br = V ? 30 : 26; const bg = g.createRadialGradient(bx - br * .4, ty - br * .5, 2, bx, ty - br * .2, br * 1.2); bg.addColorStop(0, '#f0cc8c'); bg.addColorStop(1, '#8a5a2a');
    g.fillStyle = bg; g.beginPath(); g.ellipse(bx, ty - br * .4, br, br * .5, 0, 0, 6.283); g.fill();
    const sx = tx0 + (tx1 - tx0) * .8; g.strokeStyle = '#7a5a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(sx, ty - 2); g.lineTo(sx + 10, ty - 70); g.stroke();
    g.fillStyle = '#f2ead8'; g.beginPath(); g.ellipse(sx + 6, ty - 40, 14, 22, .12, 0, 6.283); g.fill(); }
  // Mary: standing between the table and us, in profile toward the window, lit from it (OIL.relief)
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  // round 2 (the relief blob read as a faceless ghost): drawn part by part — a profile face, the veil framing it, the sleeve and
  // the hand on her child, the red dress where the mantle parts, folds; lit from the window on the left, smaller in the room
  const sM = V ? 470 : 360, mx = wx1 + (V ? 230 : 330), my = gy + (V ? 60 : 40);
  { g.save(); g.translate(mx, my); g.scale(sM, sM); const lw = 1 / sM;
    const path = cmds => { const q = new Path2D(); bez(q, cmds); return q; };
    const side = (c0, c1, x0 = -.32, x1 = .26) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };
    // contact shadow on the floor, falling away from the window
    g.save(); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(60,48,32,.55)'; g.beginPath(); g.ellipse(.12, 0, .34, .045, 0, 0, 6.283); g.fill(); g.restore();
    // the mantle: over the head and down to the floor, round over her child
    const mantle = path([['M', .26, 0], ['C', .26, -.55, .23, -1.05, .2, -1.3], ['C', .19, -1.48, .14, -1.62, .03, -1.67], ['C', -.06, -1.7, -.12, -1.66, -.13, -1.6],
      ['C', -.115, -1.5, -.1, -1.42, -.1, -1.36], ['C', -.13, -1.25, -.16, -1.15, -.17, -1.08], ['C', -.26, -.98, -.3, -.78, -.23, -.6], ['C', -.2, -.42, -.25, -.16, -.32, 0]]);
    g.fillStyle = side('#7d9ad6', '#121c40'); g.fill(mantle);
    g.save(); g.clip(mantle);
    // the light wraps the front; folds fall from the shoulder and the belly
    { const gr = g.createRadialGradient(-.3, -1.1, .02, -.3, -1.1, .55); gr.addColorStop(0, 'rgba(190,210,245,.55)'); gr.addColorStop(1, 'rgba(190,210,245,0)'); g.fillStyle = gr; g.fillRect(-.4, -1.8, .8, 1.8); }
    g.lineCap = 'round';
    for (const [x0, y0, x1, y1, w, a] of [[.08, -1.32, .14, 0, .03, .5], [.0, -1.2, .02, 0, .025, .45], [-.08, -1.12, -.12, 0, .02, .35], [.16, -1.1, .22, 0, .02, .4], [-.16, -.6, -.26, 0, .018, .3]]) {
      g.strokeStyle = `rgba(8,12,34,${a * .45})`; g.lineWidth = w * 1.8; g.filter = 'blur(3px)'; g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(x0 + .03, (y0 * 2 + y1) / 3, x1 - .03, (y0 + y1 * 2) / 3, x1, y1); g.stroke(); } g.filter = 'none';
    // the inner edge of the veil around the face, in shadow
    g.strokeStyle = 'rgba(10,14,36,.55)'; g.lineWidth = .025; g.beginPath(); g.moveTo(-.12, -1.61); g.bezierCurveTo(-.1, -1.52, -.085, -1.43, -.09, -1.35); g.stroke();
    g.restore();
    // the red dress where the mantle parts, from the throat to the belly
    g.fillStyle = side('#d8705a', '#5a1a14', -.3, -.05); g.beginPath(); g.moveTo(-.105, -1.34); g.bezierCurveTo(-.13, -1.24, -.155, -1.15, -.165, -1.08); g.bezierCurveTo(-.25, -.98, -.285, -.8, -.225, -.62);
    g.lineTo(-.19, -.64); g.bezierCurveTo(-.24, -.8, -.21, -.96, -.13, -1.06); g.bezierCurveTo(-.11, -1.16, -.09, -1.25, -.08, -1.33); g.closePath(); g.fill();
    maryDetail(g, lw, side, path);
    // the lit rim along the whole front (the window light skims the cloth)
    g.save(); g.clip(mantle); g.strokeStyle = 'rgba(214,228,255,.55)'; g.lineWidth = .02; g.beginPath(); g.moveTo(-.17, -1.08); g.bezierCurveTo(-.26, -.98, -.3, -.78, -.23, -.6); g.bezierCurveTo(-.2, -.42, -.25, -.16, -.32, 0); g.stroke(); g.restore();
    g.restore(); }
  NOIL.mary = [mx, my - sM * 1.47, sM];
  function maryDetail(g, lw, side, path) {
    // the face in profile, toward the window: forehead, nose, lips, chin — lit warm
    const face = path([['M', -.095, -1.6], ['C', -.12, -1.595, -.14, -1.56, -.148, -1.52], ['L', -.153, -1.495], ['C', -.162, -1.48, -.168, -1.47, -.17, -1.462], ['L', -.154, -1.452],
      ['C', -.157, -1.444, -.158, -1.436, -.153, -1.43], ['C', -.157, -1.424, -.156, -1.414, -.15, -1.408], ['C', -.15, -1.396, -.142, -1.386, -.128, -1.382], ['C', -.115, -1.38, -.104, -1.374, -.096, -1.36], ['L', -.09, -1.6]]);
    g.fillStyle = side('#ffe2c4', '#b07a58', -.17, -.09); g.fill(face);
    g.fillStyle = 'rgba(120,70,50,.6)'; g.beginPath(); g.ellipse(-.131, -1.487, .009, .0035, -.2, 0, 6.283); g.fill();          // the eye, lowered
    g.strokeStyle = 'rgba(150,80,60,.6)'; g.lineWidth = lw * 2; g.beginPath(); g.moveTo(-.155, -1.426); g.lineTo(-.145, -1.424); g.stroke();   // the lips
    // the veil's front edge over the brow, catching the light
    g.strokeStyle = '#a8c0ee'; g.lineWidth = .016; g.beginPath(); g.moveTo(-.04, -1.665); g.bezierCurveTo(-.1, -1.66, -.135, -1.63, -.15, -1.56); g.stroke();
    // the sleeve from the shoulder down, and the hand resting on her child
    g.strokeStyle = side('#6a88c8', '#1a2856', -.25, .05); g.lineWidth = .085; g.beginPath(); g.moveTo(-.02, -1.27); g.bezierCurveTo(-.03, -1.08, -.1, -.95, -.19, -.9); g.stroke();
    g.fillStyle = side('#ffdcbc', '#a87050', -.27, -.17); g.beginPath(); g.ellipse(-.225, -.89, .05, .028, -.5, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(140,90,60,.5)'; g.lineWidth = lw * 1.6; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-.24 + k * .012, -.9 - k * .006); g.lineTo(-.262 + k * .012, -.878 - k * .006); g.stroke(); }
  }
  // the window light itself: a soft shaft through the air and a glaze over everything near the window
  { g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(30px)'; const p = new Path2D(); p.moveTo(wx0, wy0); p.lineTo(wx1, wy0); p.lineTo(mx + sM * .2, gy + 40); p.lineTo(wx0 + 60, gy + 60); p.closePath(); g.fillStyle = 'rgba(255,240,206,.16)'; g.fill(p); g.restore(); }
  radial(LP[0], LP[1], Math.max(W, H) * .5, [[0, 'rgba(255,246,224,.35)'], [.4, 'rgba(250,234,200,.12)'], [1, 'rgba(240,220,180,0)']], 'screen');
  NOIL.art = OIL.paint(plate, { key: 'vermeer', S, seed: 23 });
  { const a = NOIL.art.getContext('2d'); a.save(); a.scale(S, S); a.translate(mx, my); a.scale(sM, sM); a.globalAlpha = .92;
    maryDetail(a, 1 / sM, (c0, c1, x0 = -.32, x1 = .26) => { const gr = a.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; }, cmds => { const q = new Path2D(); bez(q, cmds); return q; }); a.restore(); }
  // pearly highlights where the light catches (Vermeer's pointillé): the jar, the loaf, the veil's edge
  { const a = NOIL.art.getContext('2d'), r = rng(31); a.save(); a.scale(S, S); a.fillStyle = 'rgba(255,250,236,.85)';
    for (let i = 0; i < 26; i++) { const x = tx0 + (tx1 - tx0) * (.24 + r() * .5), y = ty - 4 - r() * 60; if (r() < .5) { a.beginPath(); a.arc(x, y, .9 + r() * 1.4, 0, 6.283); a.fill(); } } a.restore(); }
}
function nazarethOil(ctx, t, fx, fy, z) {
  const S = NOIL.S; OIL.view(ctx, NOIL.art, S, fx * S, fy * S, z);
  // dust turning slowly in the window light
  { const r = rng(41); ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 80; i++) { const ph = r(), x0 = NOIL.LP[0] + r() * W * .5, y0 = NOIL.wy0 + r() * (NOIL.gy - NOIL.wy0),
      x = W / 2 + (x0 + Math.sin(t * .25 + i) * 18 - fx) * z, y = H / 2 + (y0 + Math.sin(t * .18 + i * 1.7) * 14 - ((t * 3 + ph * 60) % 60) - fy) * z;
    ctx.fillStyle = `rgba(255,246,220,${.18 + .3 * r()})`; ctx.beginPath(); ctx.arc(x, y, .8 + r() * 1.4, 0, 6.283); ctx.fill(); } ctx.restore(); }
  OIL.varnish(ctx, .55, [110, 92, 50]);
}
