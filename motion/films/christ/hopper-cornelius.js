/* 「그리스도」 — N20 (film 125.0–129.7 s, u = 0..4.7): "'그리 마옵소서' 하던 베드로가 / 훗날 전한 말."
   Hopper-style quiet realism (kit-hopper.js, global Hopper). Acts 10: the house of Cornelius the centurion at Caesarea, in
   the morning. A nearly empty one-point room of white lime plaster and a stone floor; at the back an open doorway on a
   courtyard, red-tiled roofs and the bright sea beyond. Peter stands at the back, one hand raised as he speaks; Cornelius
   sits with his back to us in a red military cloak (the film's one strong colour here), another man on a stool, a kinsman
   standing by the wall. The low morning sun comes in through the doorway as a hard parallelogram on the floor; from
   u ≈ 1.2 it slowly swings across the stones until its edge reaches Peter's feet (≈ 3.3), and he is lit. The camera is low
   (1 m), still, and closes in by 4 %. The warm morning light runs on into the next shot (the Jordan, spirit mode).
   Words are not drawn here; the floor under the words (portrait 0.62–0.78) stays in shade.
   API: buildCornelius() (sync; builds the layers) · corneliusScene(ctx, u) */
(function () {
  const P = Pilot, { clamp, lerp, ss, eo, eio } = P;
  let C = null;
  const SUN = '#FCDDA0', ACC = '#a3241a';
  const DOOR = { u0: -.62, u1: .6, v0: 0, v1: 2.5 }, ZB = 6.5;
  const PETER = [.72, 4.6];
  // the sun's sideways drift (dx per metre of travel): the patch lies off to the left, then swings right to Peter's feet
  const dxAt = u => lerp(-.5, .06, eio(clamp((u - 1.2) / 2.2))), E = .78;
  const sunAt = u => Hopper.sun([dxAt(u), -E, -1]);
  // a seated person seen from behind (metres, feet at v 0): stool legs, the back of the robe/cloak falling to the floor,
  // shoulders, neck, the back of the head — the same part keys as Hopper.figureParts, so Hopper.figure paints it
  function seatedBack(h = 1.25, cloak = false) {
    const s = h / 1.25, S = ([u, v]) => [u * s, v * s];
    const arc = (a0, a1, n, r, ry, cy, cx = 0) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.sin(a) * r, cy + Math.cos(a) * ry]; });
    const stool = [[-.2, 0], [-.17, 0], [-.15, .42], [.15, .42], [.17, 0], [.2, 0], [.19, .46], [-.19, .46]];
    const back = [[-.2, .44], [-.22, .62], [-.2, .8], [-.19, .95], [-.2, 1.0], [-.13, 1.04], [-.05, 1.06], [.05, 1.06], [.13, 1.04], [.2, 1.0], [.19, .95], [.2, .8], [.22, .62], [.2, .44]];
    const drape = cloak ? [[-.21, 1.02], [-.27, .8], [-.31, .45], [-.3, .15], [-.1, .1], [.1, .1], [.3, .15], [.31, .45], [.27, .8], [.21, 1.02], [.1, 1.06], [-.1, 1.06]]
      : [[-.2, .5], [-.24, .3], [-.22, .1], [.22, .1], [.24, .3], [.2, .5]];
    const neck = [[-.035, 1.04], [.035, 1.04], [.032, 1.12], [-.032, 1.12]], head = arc(0, Math.PI * 2 * 23 / 24, 23, .08, .1, 1.17);
    const parts = [{ poly: stool, c: 'legs' }, { poly: drape, c: 'body' }, { poly: back, c: 'body' }, { poly: neck, c: 'skin' }, { poly: head, c: 'hair' }].map(p => ({ ...p, poly: p.poly.map(S) }));
    return { parts, sil: back.map(S), h };
  }
  // Peter: Hopper's standing figure (a knee-length tunic), the right forearm raised as he speaks
  function speaker() {
    const F = Hopper.figureParts({ h: 1.72, skirt: true, w: .2 }), s = 1.72 / 1.7;
    const arms = F.parts.filter(p => p.c === 'body' && p.poly.length === 8);   // the two hanging arms: replace the right one
    const right = arms.find(p => p.poly[0][0] > 0);
    if (right) { right.poly = [[.17, 1.42], [.24, 1.36], [.26, 1.2], [.27, 1.1], [.34, 1.16], [.39, 1.3], [.33, 1.34], [.29, 1.24], [.25, 1.28], [.16, 1.32]].map(([u, v]) => [u * s, v * s]); }
    const hand = F.parts.filter(p => p.c === 'skin' && Math.abs(p.poly[0][1] - .76 * s) < .2 * s).find(p => p.poly.some(q => q[0] > 0));
    // the raised hand: an open palm turned to the listeners, four fingers and a thumb (reads as a silhouette)
    if (hand) { const hx = .37, hy = 1.37, pts = [[hx - .045, hy - .05], [hx + .04, hy - .05], [hx + .05, hy + .02], [hx + .085, hy + .045], [hx + .09, hy + .06], [hx + .045, hy + .05],
        [hx + .042, hy + .12], [hx + .03, hy + .125], [hx + .022, hy + .07], [hx + .018, hy + .14], [hx + .005, hy + .145], [hx - .002, hy + .075], [hx - .008, hy + .14], [hx - .021, hy + .14], [hx - .024, hy + .07],
        [hx - .032, hy + .12], [hx - .045, hy + .118], [hx - .048, hy + .03]]; hand.poly = pts.map(([u, v]) => [u * s, v * s]); }
    F.parts.push({ poly: [[-.062, 1.53], [.062, 1.53], [.05, 1.47], [0, 1.445], [-.05, 1.47]].map(([u, v]) => [u * s, v * s]), c: 'hair' });   // beard
    return F;
  }
  function buildCornelius() {
    const V = P.ori === 'v', cam = Hopper.camera(V ? { x: .2, y: 1.0, f: 1650, px: 540, py: 780 } : { x: .2, y: 1.0, f: 900, px: 960, py: 470 });
    const R = Hopper.room({ xl: -1.6, xr: 1.9, h: 3.7, zn: .7, zb: ZB }, cam), BACK = R.wall('back');
    const plaster = (k, sun) => { const f = c => sun ? Hopper.lit(c, sun, .45, 1.04) : k === 1 ? c : Hopper.shade(c, k);
      return { bg: f('#2a2622'), ceiling: f('#d9cdb4'), left: f('#c9bda4'), right: f('#e4dac4'), back: [f('#dcd0b8'), f('#e8dec8'), f('#d6c9ae')],
        st: { back: { n: 220, seed: 11, len: [.12, .35], slant: .12, w: .045, a: .028 }, left: { n: 110, seed: 12, len: [.12, .3], slant: .12, w: .05, a: .028 }, right: { n: 110, seed: 13, len: [.12, .3], slant: .12, w: .05, a: .028 } },
        corner: { px: 160, a: .14 }, sideFrom: 1 }; };
    const stone = '#8c8170';
    const paintRoom = (x, k, sun) => { R.paint(x, plaster(k, sun)); R.boards(x, sun ? Hopper.boardsLook(Hopper.lit(stone, sun), 1) : Hopper.boardsLook(stone, k), { seed: 21, width: .48, n: 600 });
      const sh = c => k === 1 || sun ? c : Hopper.shade(c, k); R.baseboards(x, { gaps: [[DOOR.u0 - .02, DOOR.u1 + .02]], back: sh('#9a8c74'), left: sh('#857a64'), right: sh('#a2947c'), line: ['rgba(240,232,214,.25)', 'rgba(240,232,214,.25)'] }); };
    const base = Hopper.layer(x => {
      const k = .66; paintRoom(x, k);
      const op = Hopper.opening(x, cam, BACK, { ...DOOR, depth: .42, hole: '#efe2c4', reveal: Hopper.shade('#d6c9ae', .55), head: Hopper.shade('#d6c9ae', .45), sill: Hopper.shade('#d6c9ae', .6),
        casing: { w: .1, head: .14, c: Hopper.shade('#cdbf9f', .7), shadow: .18, st: { n: 70, seed: 31, len: [.15, .5], slant: .01, w: .012, a: .06 } } });
      // beyond the door: the sunlit courtyard, a column, red-tiled roofs, the bright morning sea and sky
      Hopper.within(x, cam, [op.poly], c => {
        const t0 = cam.P(0, 9, 30)[1], t1 = cam.P(0, 0, 30)[1], g = c.createLinearGradient(0, t0, 0, t1); g.addColorStop(0, '#d9dccb'); g.addColorStop(.7, '#f6ecd0'); g.addColorStop(1, '#fff3d6'); c.fillStyle = g; c.fillRect(0, 0, P.W, P.H);
        const sea = cam.P(0, .75, 30)[1]; c.fillStyle = '#e9e4cf'; c.fillRect(0, sea - 2, P.W, 6); c.fillStyle = '#b9bba8'; c.fillRect(0, sea + 4, P.W, P.H);   // the sea's bright line
        Hopper.box(c, cam, [-6, .1, 0, 2.1, 16, 19], { front: '#e6d2ac', top: '#a4442c' }, { n: 40, seed: 61, len: [.1, .3], slant: .05, w: .05, a: .08 });                 // a house across the court
        c.fillStyle = '#a4442c'; cam.path(c, [[-6, 2.1, 16], [.3, 2.1, 16], [-.2, 2.9, 17.5], [-6, 2.9, 17.5]]); c.fill();                                           // its red tile roof
        Hopper.box(c, cam, [1.2, 8, 0, 1.6, 20, 24], { front: '#dcc8a2', top: '#9c3e28', left: '#b8a07e' }, { n: 30, seed: 62, len: [.1, .3], slant: .05, w: .05, a: .08 });
        c.fillStyle = '#9c3e28'; cam.path(c, [[1.2, 1.6, 20], [8, 1.6, 20], [8, 2.3, 21.6], [1.6, 2.3, 21.6]]); c.fill();
        Hopper.box(c, cam, [.95, 1.2, 0, 3.0, 9.5, 9.75], { front: '#efe2c6', left: '#c9b994' });                                                                // a column of the peristyle
        cam.fill(c, Hopper.Q.y(0, -4, 4, 6.9, 16), '#d9c7a0');                                                                                                   // the court's sunlit paving
        c.fillStyle = 'rgba(255,244,220,.12)'; c.fillRect(0, 0, P.W, P.H);
      });
      // a low bench along the left wall (the room's only furniture)
      Hopper.box(x, cam, [-1.6, -1.25, 0, .42, 2.6, 5.4], { front: Hopper.shade('#7a6a54', .7), top: Hopper.shade('#8e7c62', .75), right: Hopper.shade('#6c5e4a', .7) });
    });
    const lit = Hopper.layer(x => paintRoom(x, 1, SUN));
    const pts = []; for (const v of [.15, .5, .9, 1.3, 1.6]) for (const du of [-.12, .12]) pts.push([PETER[0] + du, v, PETER[1]]);
    C = { cam, R, base, lit, door: [[[DOOR.u0, 0, ZB], [DOOR.u1, 0, ZB], [DOOR.u1, DOOR.v1, ZB], [DOOR.u0, DOOR.v1, ZB]]], peter: speaker(), pts,
      sitters: [{ F: seatedBack(1.24, true), x: -.72, z: 3.5, colors: { body: Hopper.shade(ACC, .78), legs: '#4a3f33', skin: '#3e3128', hair: '#2c2420' }, litColors: { body: ACC } },
        { F: seatedBack(1.2, false), x: 1.3, z: 3.7, colors: { body: '#6d6656', legs: '#4a3f33', skin: '#3e3128', hair: '#3a3029' } }],
      kin: { F: (() => { const F = Hopper.figureParts({ h: 1.66, skirt: true }); F.parts.forEach(p => { if (p.c === 'skin' && p.poly.length > 20) p.c = 'hair'; }); return F; })(), x: -1.15, z: 5.4, colors: { body: '#77705e', legs: '#5a5144', skin: '#3e3229', hair: '#2e2620' } } };
  }
  // a figure standing against the doorway's light: one value darker than the room, a thin warm rim where the light wraps
  // its edges (shoulders, head, the raised hand) — the rim = the shape minus its own copy shifted both ways (left ∩ right ∩ down)
  const BL = {};
  function backlit(ctx, cam, F, x, z, colors, rimK) {
    const k = cam.ppm(z), foot = cam.P(x, 0, z), pad = 16, hw = .5 * k, hh = F.h * 1.12 * k, w = Math.ceil(hw * 2 + pad * 2), h = Math.ceil(hh + pad * 2), ox = pad + hw, oy = pad + hh;
    if (!BL.a || BL.a.width !== w || BL.a.height !== h) { BL.a = P.canvas(w, h); BL.m = P.canvas(w, h); BL.b = P.canvas(w, h); }
    const draw = (g, dx, dy, colOf) => { for (const p of F.parts) { g.beginPath(); p.poly.forEach(([u, v], i) => { const X = ox + dx + u * k, Y = oy + dy - v * k; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.fillStyle = colOf(p.c); g.fill(); } };
    const r = Math.max(1.5, k * .014), a = BL.a.getContext('2d'), m = BL.m.getContext('2d'), b = BL.b.getContext('2d');
    for (const g of [a, m, b]) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h); }
    draw(a, 0, 0, () => 'rgb(255,222,170)');                                   // the whole shape in the light's colour
    draw(m, r, r * .6, () => '#000'); draw(b, -r, r * .6, () => '#000'); m.globalCompositeOperation = 'destination-in'; m.drawImage(BL.b, 0, 0);   // where both shifted copies cover (one destination-in draw: each such draw clears all outside itself)
    b.clearRect(0, 0, w, h); draw(b, 0, 0, c => colors[c]); b.globalCompositeOperation = 'destination-in'; b.drawImage(BL.m, 0, 0);
    a.globalCompositeOperation = 'source-atop'; a.globalAlpha = 1; a.drawImage(BL.b, 0, 0);
    if (rimK < 1) { a.globalAlpha = 1 - rimK; draw(a, 0, 0, c => colors[c]); a.globalAlpha = 1; }
    // darker toward the feet, as the kit's figures; then soften the edges a little
    a.globalCompositeOperation = 'source-atop'; const gr = a.createLinearGradient(0, oy - .6 * k, 0, oy); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.25)'); a.fillStyle = gr; a.fillRect(0, 0, w, h); a.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.filter = 'blur(1.2px)'; ctx.drawImage(BL.a, foot[0] - ox, foot[1] - oy); ctx.restore();
  }
  function corneliusScene(ctx, u) {
    if (!C) buildCornelius(); u = clamp(u, 0, 4.7);
    const { cam, R, base, lit } = C, W = P.W, H = P.H, L = sunAt(u), V = P.ori === 'v';
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.save(); Hopper.push(ctx, 1 + .04 * ss(0, 4.7, u), cam.P(PETER[0] - .3, 1.3, PETER[1]));
    ctx.drawImage(base, 0, 0);
    // the morning sun through the doorway: its parallelogram on the stone floor, with the standing figures' shadows in it
    const patch = L.project(C.door[0], Hopper.FLOOR), across = [1, 0];
    const shadowOf = (F, x, z) => L.cast(F.sil, { place: (a, b) => [x + a, b, z], plane: Hopper.FLOOR });
    const shadows = [shadowOf(C.peter, ...PETER), shadowOf(C.kin.F, C.kin.x, C.kin.z)].filter(Boolean);
    ctx.save(); Hopper.clip(ctx, cam, [R.poly.floor]); Hopper.clip(ctx, cam, [patch]);
    Hopper.drawLit(ctx, ss(0, .6, u) * .95 + .05, lit); Hopper.shadowIn(ctx, cam, shadows, c => c.drawImage(base, 0, 0)); ctx.restore();
    // the patch's glow on the plaster around the door and the bounce into the room
    const mid = L.onto([0, 1.2, ZB], Hopper.FLOOR);
    Hopper.glow(ctx, cam.P(mid[0], 0, mid[2]), V ? 700 : 600, '255,222,170', .16);
    Hopper.glow(ctx, cam.P(0, 1.3, ZB), V ? 380 : 330, '255,236,200', .22);
    // the people: the kinsman by the wall, Peter at the back, the two seated listeners nearer us (far → near)
    Hopper.figure(ctx, cam, C.kin.F, { x: C.kin.x, z: C.kin.z, lit: .12, side: 1, colors: C.kin.colors, sun: SUN });
    const pl = Hopper.litFraction(L, C.pts, C.door, Hopper.wallZ(ZB));
    backlit(ctx, cam, C.peter, PETER[0], PETER[1], { body: '#3e3428', legs: '#30281f', skin: '#33291f', hair: '#211b16' }, .35 + .65 * pl);
    for (const s of C.sitters) Hopper.figure(ctx, cam, s.F, { x: s.x, z: s.z, lit: .25, side: s.x < 0 ? 1 : -1, colors: s.colors, litColors: s.litColors, sun: SUN });
    // the beat: as the light reaches his feet, a breath of warmth over the room
    const hit = 3.3, b = u < hit ? 0 : Math.exp(-(u - hit) * 3.5) * ss(hit, hit + .1, u);
    Hopper.flash(ctx, .12 * b, '255,226,176');
    ctx.restore();
    // the floor nearest us sinks into shade (the words sit there)
    { const y0 = H * (V ? .58 : .66), g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, 'rgba(14,10,8,0)'); g.addColorStop(1, 'rgba(14,10,8,.45)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }
    Hopper.finish(ctx, { grain: .45 });
  }
  window.buildCornelius = buildCornelius; window.corneliusScene = corneliusScene;
})();
