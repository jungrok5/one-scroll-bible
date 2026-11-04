/* impasto-dawn.js — 「메시아」 5부의 십자가와 부활을 흑백 필름 → 임파스토 유화로 (2026-11-03 2차; after the first film's
   「십자가」 (black-and-white film, one colour) and 「부활」 (a grey world repainted in colour with the palette knife)).
   1Co 15:3–4 (146.0–159.2 s): "성경대로 그리스도께서 우리 죄를 위하여 죽으시고 / 장사 지낸 바 되셨다가" — a hill and a cross under a heavy
   grey sky, black-and-white film (grain, gate flicker, clouds moving); the only colour is the gold thread of the promise running
   along the hill (E1e 149, 4.4 s). "성경대로 사흘 만에 다시 살아나사" — from 152.4 the sun rises behind the cross and the whole picture
   is repainted in colour, stroke by stroke outward from the light (OIL.paint, key 'impasto'). */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, fbm, canvas } = Pilot;
  let W, H, V, hx, hz, crest, grey, clouds, art, strokes, mask;
  function hill(g, col) { g.fillStyle = col; g.beginPath(); g.moveTo(-60, H + 60); for (let x = -60; x <= W + 60; x += 6) g.lineTo(x, crest(x)); g.lineTo(W + 60, H + 60); g.closePath(); g.fill();
    const cxp = hx, cyp = crest(hx), s = V ? 2.4 : 2; g.fillRect(cxp - 6 * s, cyp - 120 * s, 12 * s, 122 * s); g.fillRect(cxp - 38 * s, cyp - 96 * s, 76 * s, 10 * s); }
  function build() {
    W = Pilot.W; H = Pilot.H; V = Pilot.ori === 'v'; hz = H * (V ? .56 : .62); hx = W * (V ? .44 : .42);
    crest = x => hz + (V ? 120 : 90) - (V ? 130 : 96) * Math.exp(-((x - hx) ** 2) / ((V ? 280 : 360) ** 2));
    // the grey world: an overcast sky in values, the far land, the hill and the cross black
    grey = canvas(W, H); { const g = grey.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, '#2a2a2a'); gr.addColorStop(.7, '#6a6a6a'); gr.addColorStop(1, '#8a8a8a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      hillLayer(g, hz + 10, V ? 50 : 40, .005, 5, '#3a3a3a'); hill(g, '#0e0e0e'); }
    // clouds: a tileable band of fbm, drifting (values only)
    clouds = canvas(W >> 1, H >> 2); { const g = clouds.getContext('2d'), im = g.createImageData(clouds.width, clouds.height), cw = clouds.width, ch = clouds.height;
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const u = x / cw, v = y / ch, n = lerp(fbm(u * 5, v * 2.2 + 3, 5), fbm(u * 5 - 5, v * 2.2 + 3, 5), u), a = clamp((n - .44) * 2.4) * (1 - v * .35), i = (y * cw + x) * 4;   // horizontal masses, tileable across x
        const c = 150 + 90 * n; im.data[i] = im.data[i + 1] = im.data[i + 2] = c; im.data[i + 3] = a * 255; } g.putImageData(im, 0, 0); }
    // the repainted world: sunrise behind the cross, painted with the palette knife
    const plate = canvas(W, H); { const g = plate.getContext('2d');
      skyGrad(g, [[0, 'rgb(46,92,170)'], [.45, 'rgb(130,150,200)'], [.72, 'rgb(246,170,120)'], [1, 'rgb(255,222,150)']], hz);
      const sx = W * (V ? .6 : .62), sy = hz - (V ? 80 : 60), R = Math.max(W, H), gr = g.createRadialGradient(sx, sy, 0, sx, sy, R); gr.addColorStop(0, 'rgba(255,240,200,.95)'); gr.addColorStop(.15, 'rgba(255,206,140,.55)'); gr.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(sx, sy, V ? 44 : 38, 0, 6.283); g.fill(); art = { sun: [sx, sy] };
      hillLayer(g, hz + 10, V ? 50 : 40, .005, 5, 'rgb(150,112,120)');
      { const gr2 = g.createLinearGradient(0, hz, 0, H); gr2.addColorStop(0, 'rgb(196,166,92)'); gr2.addColorStop(.25, 'rgb(140,138,70)'); gr2.addColorStop(1, 'rgb(70,78,44)');   /* round 3: olive and morning gold, not a golf-course green */ g.fillStyle = gr2; g.beginPath(); g.moveTo(-60, H + 60); for (let x = -60; x <= W + 60; x += 6) g.lineTo(x, crest(x)); g.lineTo(W + 60, H + 60); g.closePath(); g.fill();
        const cxp = hx, cyp = crest(hx), s = V ? 2.4 : 2; g.fillStyle = 'rgb(60,40,32)'; g.fillRect(cxp - 6 * s, cyp - 120 * s, 12 * s, 122 * s); g.fillRect(cxp - 38 * s, cyp - 96 * s, 76 * s, 10 * s);
        g.strokeStyle = 'rgba(255,214,150,.85)'; g.lineWidth = 3; g.strokeRect(cxp - 6 * s, cyp - 120 * s, 12 * s, 122 * s); g.strokeRect(cxp - 38 * s, cyp - 96 * s, 76 * s, 10 * s); }
      // round 3 (look review: "장사 지낸 바 되셨다가 … 다시 살아나사 — no tomb"): in the slope right of the cross the tomb, its stone
      // rolled aside, light coming out of the opening (the first film's resurrection tomb)
      { const tx = hx + W * (V ? .3 : .26), ty = crest(tx) + (V ? 70 : 54), s = V ? 1.3 : 1.1;
        g.fillStyle = 'rgb(120,98,80)'; g.beginPath(); g.ellipse(tx, ty - 10 * s, 120 * s, 70 * s, 0, Math.PI, 0); g.fill();
        g.fillStyle = 'rgb(255,232,180)'; g.beginPath(); g.moveTo(tx - 34 * s, ty); g.lineTo(tx - 34 * s, ty - 40 * s); g.arc(tx, ty - 40 * s, 34 * s, Math.PI, 0); g.lineTo(tx + 34 * s, ty); g.closePath(); g.fill();
        const gl = g.createRadialGradient(tx, ty - 30 * s, 0, tx, ty - 30 * s, 150 * s); gl.addColorStop(0, 'rgba(255,236,190,.7)'); gl.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = gl; g.fillRect(tx - 150 * s, ty - 180 * s, 300 * s, 300 * s);
        g.fillStyle = 'rgb(104,86,72)'; g.beginPath(); g.ellipse(tx + 74 * s, ty - 26 * s, 26 * s, 30 * s, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(255,214,150,.5)'; g.beginPath(); g.ellipse(tx + 66 * s, ty - 34 * s, 10 * s, 18 * s, 0, 0, 6.283); g.fill(); }
      { const r = rng(8); for (let i = 0; i < 260; i++) { const x = r() * W, y = crest(x) + 20 + r() ** 1.5 * (H - crest(x)); g.fillStyle = ['#e8c050', '#d8a040', '#f0e0a0', '#c84030', '#f4f0e0'][(r() * 5) | 0]; g.beginPath(); g.arc(x, y, 3 + r() * 5, 0, 6.283); g.fill(); } } }   // flowers on the hill
    art.c = OIL.paint(plate, { key: 'impasto', S: 1, seed: 29 });
    { const g = art.c.getContext('2d'), cxp = hx, cyp = crest(hx), s = V ? 2.4 : 2; g.fillStyle = 'rgb(54,34,28)'; g.fillRect(cxp - 6 * s, cyp - 120 * s, 12 * s, 122 * s); g.fillRect(cxp - 38 * s, cyp - 96 * s, 76 * s, 10 * s);   // the cross stays whole
      g.strokeStyle = 'rgba(255,214,150,.9)'; g.lineWidth = 3; g.strokeRect(cxp - 6 * s, cyp - 120 * s, 12 * s, 122 * s); g.strokeRect(cxp - 38 * s, cyp - 96 * s, 76 * s, 10 * s); }
    // the knife strokes that repaint it, ordered outward from the sun
    const r = rng(41); strokes = []; for (let i = 0; i < 2600; i++) { const x = r() * W, y = r() * H, d = Math.hypot(x - art.sun[0], (y - art.sun[1]) * .8) / Math.hypot(W, H) + r() * .08;
      strokes.push({ x, y, d, a: (r() - .5) * .8 + Math.atan2(y - art.sun[1], x - art.sun[0]) + Math.PI / 2, w: (V ? 70 : 60) * (.6 + .8 * r()), l: (V ? 150 : 130) * (.6 + .8 * r()) }); }
    strokes.sort((a, b) => a.d - b.d); mask = canvas(W, H);
  }
  window.partDawn = function (ctx, t) {
    if (!grey) build();
    const k = clamp((t - 146) / 13.2), z = 1 + .06 * eio(k), rep = clamp((t - 152.4) / 4.4), fr = Math.floor(t * 24), fl = rng(fr + 7)();
    ctx.save(); ctx.translate(W / 2, H * .55); ctx.scale(z, z); ctx.translate(-W / 2 + (fl - .5) * 1.5, -H * .55);
    // the grey world, moving: clouds drift over the sky, the gate flickers
    ctx.drawImage(grey, 0, 0);
    { const off = (t * 22) % W; ctx.save(); ctx.globalAlpha = .85; ctx.beginPath(); ctx.rect(0, 0, W, hz + 20); ctx.clip(); for (const o of [-W, 0]) ctx.drawImage(clouds, o + off, -H * .04, W, hz * 1.0); ctx.restore(); }
    hill(ctx, '#0e0e0e');
    // the repainting: knife strokes outward from the sun reveal the colour painting
    if (rep > 0) { const m = mask.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H); m.fillStyle = '#fff'; m.lineCap = 'round';
      const n = Math.floor(strokes.length * eo(rep)); for (let i = 0; i < n; i++) { const s = strokes[i]; m.save(); m.translate(s.x, s.y); m.rotate(s.a); m.beginPath(); m.ellipse(0, 0, s.l / 2, s.w / 2, 0, 0, 6.283); m.fill(); m.restore(); }
      if (rep >= 1) m.fillRect(0, 0, W, H);
      m.globalCompositeOperation = 'source-in'; m.drawImage(art.c, 0, 0); ctx.drawImage(mask, 0, 0); }
    ctx.restore();
    // black-and-white film until the colour comes (grain, flicker); the gold thread is the one colour
    const bw = 1 - ss(152.4, 154.4, t);
    if (bw > 0) { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = bw; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha = .06 * bw * fl; ctx.fillStyle = fl > .5 ? '#fff' : '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (rep > 0) { const [sx, sy] = art.sun; W3.bloom(ctx, W / 2 + (sx - W / 2) * z, H * .55 + (sy - H * .55) * z, [255, 214, 150], ss(152.4, 156.4, t), { r: V ? 320 : 280, streak: .9 }); }
    { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40, x = -40 + u * (W + 80); pts.push([W / 2 + (x - W / 2) * z, H * .55 + (crest(x) - 12 - H * .55) * z]); } thread2D(ctx, pts, clamp((t - 149) / 4.4), .9 * (1 - rep * .5)); }
    W3.finish(ctx, t, { vignette: .5, grain: .05 + .1 * bw }); textBand(ctx);
  };
})();
