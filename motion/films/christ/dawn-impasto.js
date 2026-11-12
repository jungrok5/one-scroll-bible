/* dawn-impasto.js — 「그리스도」 5부: the black-and-white film repainted in dawn light with the palette knife (impasto, after the first
   film's 「부활」 and 「메시아」 impasto-dawn.js). Kit: kit-oilpaint.js (OIL.paint, key 'impasto'). People are small silhouettes.
   await buildDawn() once, then dawnOil(ctx, u, mode):
     'tomb'  u 0..5.2  (film 120.1–125.3, N15): starts in the grey grain of the black-and-white film; the knife repaints it stroke by
             stroke outward from the rising sun; the rock tomb — its stone rolled aside, empty within — fills with the sun at the end.
     'peter' u 0..4.2  (film 125.3–129.5, N20): the same dawn; under the great rock (the frame of part 3, «alone under the darkened
             rock», now at sunrise) Peter's small silhouette stands again and lifts his head.
     'tree'  u 0..6.7  (film 136.0–142.7, Q10 Acts 10:39–40): out of the dove's light of the scene before, the pre-dawn ground with the
             shadow of the tree (the cross) lying across it; at «다시 살리사» (u ≈ 3.4) the shadow draws back and the empty tomb's
             entrance fills with dawn, the painting spreading out from it.
   No words drawn. Deterministic. */
(function () {
  const { clamp, lerp, ss, eo, eio, rng, noise, canvas } = Pilot;
  let D = null;

  async function buildDawn() {
    if (D) return D;
    const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
    const PW = Math.ceil(W * 1.12), PH = Math.ceil(H * 1.12), ox = (PW - W) / 2, oy = (PH - H) / 2;
    const L = V ? { hz: .4, gl: .55, tomb: [.37, .505], tw: .15, th: .09, stone: [.555, .482], sr: .068, sun: [.9, .4], peter: [.585, .6], ph: .1, cliff: .52, pgl: .5,
                    olive: [[.12, .9, .1, .72, .2], [.93, .72, .92, .6, .12]], wallR: .78 }
                : { hz: .45, gl: .68, tomb: [.36, .605], tw: .12, th: .15, stone: [.53, .57], sr: .11, sun: [.88, .42], peter: [.55, .66], ph: .16, cliff: .44, pgl: .52,
                    olive: [[.1, .98, .1, .78, .12], [.88, .8, .88, .66, .075]], wallR: .72 };
    D = { W, H, V, PW, PH, ox, oy, L };
    const X = f => f * W, Y = f => f * H;
    // dawn sky: gold at the horizon rising through rose to blue-grey; clouds as thin bands spread with the knife
    const sky = (g, dawn, hz) => { const gr = g.createLinearGradient(0, -oy, 0, Y(hz));
      (dawn ? [[0, 'rgb(70,86,120)'], [.45, 'rgb(136,136,158)'], [.75, 'rgb(232,170,128)'], [1, 'rgb(255,220,158)']] : [[0, 'rgb(70,80,124)'], [.55, 'rgb(130,132,170)'], [1, 'rgb(190,176,190)']]).forEach(([a, c]) => gr.addColorStop(a, c));
      g.fillStyle = gr; g.fillRect(-ox, -oy, PW, Y(hz) + oy + 4);
      const r = rng(dawn ? 3 : 4); g.lineCap = 'round';
      for (let i = 0; i < 22; i++) { const v = r(), cy = Y(.03 + v * (hz - .07)), cx = X(r() * 1.3 - .15), cw = X(.25 + r() * .55), th = Y(.003 + r() * .008), low = v > .6;
        const col = dawn ? (low ? `rgba(255,${190 + r() * 30 | 0},${146 + r() * 30 | 0},${.4 + r() * .35})` : `rgba(${170 + r() * 30 | 0},${168 + r() * 20 | 0},${186 + r() * 20 | 0},${.35 + r() * .3})`) : `rgba(${140 + r() * 30 | 0},${138 + r() * 30 | 0},${168},${.3 + r() * .3})`;
        g.strokeStyle = col; g.lineWidth = th; g.beginPath(); g.moveTo(cx - cw / 2, cy); g.bezierCurveTo(cx - cw / 6, cy - th * (r() * 2), cx + cw / 6, cy + th * (r() * 2), cx + cw / 2, cy - th * r()); g.stroke();
        if (dawn && low) { g.strokeStyle = 'rgba(255,236,190,.5)'; g.lineWidth = th * .35; g.beginPath(); g.moveTo(cx - cw * .4, cy + th * .45); g.lineTo(cx + cw * .4, cy + th * .45); g.stroke(); } }   // their lit undersides
      if (dawn) { const [sx, sy] = [X(L.sun[0]), Y(L.sun[1])], sg = g.createRadialGradient(sx, sy, 0, sx, sy, X(.75)); sg.addColorStop(0, 'rgba(255,246,214,1)'); sg.addColorStop(.1, 'rgba(255,214,150,.7)'); sg.addColorStop(1, 'rgba(255,200,140,0)');
        g.fillStyle = sg; g.fillRect(-ox, -oy, PW, PH); g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(sx, sy, X(.034), 0, 6.283); g.fill(); }
      g.fillStyle = dawn ? 'rgb(156,112,116)' : 'rgb(96,92,116)'; g.beginPath(); g.moveTo(-ox, Y(hz) + 6); for (let x = -ox; x <= W + ox; x += 10) g.lineTo(x, Y(hz) - Y(.012) - Y(.018) * (Pilot.fbm(x * .004, 2.2, 3) - .35)); g.lineTo(W + ox, Y(hz) + 6); g.fill(); };
    const ground = (g, dawn, top) => { const gr = g.createLinearGradient(0, Y(top), 0, H + oy);
      (dawn ? [[0, 'rgb(170,136,88)'], [.25, 'rgb(112,84,54)'], [.5, 'rgb(78,56,36)'], [1, 'rgb(58,40,26)']] : [[0, 'rgb(134,126,140)'], [1, 'rgb(86,82,98)']]).forEach(([a, c]) => gr.addColorStop(a, c));
      g.fillStyle = gr; g.fillRect(-ox, Y(top), PW, H - Y(top) + oy); };
    // an olive tree: a twisted trunk, silver-green leaves laid in small strokes, only their edges lit against the low sun
    const olive = (g, dawn, [bx, by, cx, cy, cr], seed) => { const r = rng(seed), R = X(cr);
      g.lineCap = 'round'; for (let s = 0; s < 3; s++) { g.strokeStyle = dawn ? ['rgb(58,42,30)', 'rgb(74,56,40)', 'rgb(46,34,26)'][s] : 'rgb(50,48,58)'; g.lineWidth = R * (.2 - s * .045);   // trunk strands twisting round each other
        g.beginPath(); g.moveTo(X(bx) + (s - 1) * R * .08, Y(by)); g.bezierCurveTo(X(bx) + R * (.35 - s * .3), lerp(Y(by), Y(cy), .3), X(cx) - R * (.3 - s * .25), lerp(Y(by), Y(cy), .65), X(cx) + (s - 1) * R * .2, Y(cy) + R * .25); g.stroke(); }
      g.lineWidth = R * .06; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (r() - .5) * 2.2, l = R * (.5 + r() * .5); g.beginPath(); g.moveTo(X(cx), Y(cy) + R * .2); g.quadraticCurveTo(X(cx) + Math.cos(a) * l * .5 + R * .1 * (r() - .5), Y(cy) + Math.sin(a) * l * .5, X(cx) + Math.cos(a) * l, Y(cy) + Math.sin(a) * l * .8); g.stroke(); }
      const blobs = []; for (let i = 0; i < 7; i++) { const a = r() * 6.283, d = R * .5 * Math.sqrt(r()); blobs.push([X(cx) + Math.cos(a) * d, Y(cy) + Math.sin(a) * d * .6 - R * .25, R * (.4 + r() * .3)]); }
      for (let i = 0; i < 1500; i++) { const [bx2, by2, br] = blobs[i % 7], a = r() * 6.283, d = br * Math.sqrt(r()), lx = bx2 + Math.cos(a) * d, ly = by2 + Math.sin(a) * d * .75;
        const edge = d / br, sunSide = (lx - bx2) / br * .7 - (ly - by2) / br * .5, lit = dawn && edge > .7 && sunSide > .1;
        g.fillStyle = lit ? `rgb(${214 + r() * 30 | 0},${198 + r() * 30 | 0},${140 + r() * 30 | 0})` : dawn ? `rgb(${86 + r() * 40 | 0},${96 + r() * 34 | 0},${74 + r() * 26 | 0})` : `rgb(${70 + r() * 20 | 0},${74 + r() * 20 | 0},${86})`;
        g.save(); g.translate(lx, ly); g.rotate(r() * 3); g.beginPath(); g.ellipse(0, 0, R * .07, R * .022, 0, 0, 6.283); g.fill(); g.restore(); } };
    // the tomb hewn in the rock: a near-vertical limestone face with its beds and cracks, a low square doorway at its foot, a groove
    // along the foot of the face and the round, flat stone rolled along it; inside, the shelf and the folded cloth in the light
    const tombPlate = (dawn, closed) => { const c = canvas(PW, PH), g = c.getContext('2d'); g.translate(ox, oy); sky(g, dawn, L.hz); ground(g, dawn, L.hz);
      const r = rng(11), gl = Y(L.gl), wr = X(L.wallR);
      const topY = x => Y(V ? .19 : .15) + Y(.03) * Math.sin(x / W * 4 + 1) + Y(.025) * (Pilot.fbm(x * .008, 5, 3) - .5) + Y(.012) * Math.abs(noise(x * .03, 2) - .5) * 2;
      const wall = new Path2D(); wall.moveTo(-ox, gl + 4); for (let x = -ox; x <= wr; x += 6) wall.lineTo(x, topY(x));
      for (let i = 0; i <= 14; i++) { const v = i / 14; wall.lineTo(wr + X(.06) * v + X(.025) * Math.sin(v * 13) + X(.02) * (noise(v * 7, 3) - .5), lerp(topY(wr), gl + 4, v)); } wall.closePath();
      const wg = g.createLinearGradient(0, 0, wr + X(.06), 0); (dawn ? [[0, 'rgb(118,94,74)'], [.55, 'rgb(176,146,108)'], [1, 'rgb(226,190,138)']] : [[0, 'rgb(88,86,104)'], [1, 'rgb(130,126,144)']]).forEach(([a, cc]) => wg.addColorStop(a, cc));
      g.fillStyle = wg; g.fill(wall);
      g.save(); g.clip(wall);
      for (let i = 0; i < 11; i++) { const y0 = lerp(Y(.17), gl, i / 11) + Y(.01) * (r() - .5), hb = Y(.012 + r() * .022);   // bedding planes
        g.fillStyle = (i % 2) ? (dawn ? `rgba(80,58,44,${.1 + r() * .12})` : `rgba(50,50,64,${.2 + r() * .15})`) : (dawn ? `rgba(255,232,190,${.1 + r() * .12})` : `rgba(170,166,184,${.1 + r() * .1})`);
        g.beginPath(); g.moveTo(-ox, y0); for (let x = -ox; x <= W; x += 30) g.lineTo(x, y0 + Y(.006) * Math.sin(x * .01 + i)); for (let x = W; x >= -ox; x -= 30) g.lineTo(x, y0 + hb + Y(.006) * Math.sin(x * .012 + i * 2)); g.fill(); }
      g.strokeStyle = dawn ? 'rgba(52,36,28,.65)' : 'rgba(36,36,48,.6)'; g.lineCap = 'round';   // cracks
      for (let i = 0; i < 16; i++) { let x = X(r() * L.wallR), y = topY(x) + Y(.01); g.lineWidth = X(.003 + r() * .005); g.beginPath(); g.moveTo(x, y); const n = 5 + (r() * 6 | 0); for (let j = 0; j < n; j++) { x += X(.012) * (r() - .5); y += Y(.02 + r() * .025); g.lineTo(x, y); } g.stroke(); }
      const lip = g.createLinearGradient(0, Y(.17), 0, Y(.27)); lip.addColorStop(0, 'rgba(30,20,14,0)'); lip.addColorStop(.35, dawn ? 'rgba(40,26,18,.4)' : 'rgba(30,30,42,.4)'); lip.addColorStop(1, 'rgba(30,20,14,0)'); g.fillStyle = lip; g.fillRect(-ox, Y(.15), wr + X(.1), Y(.14));   // under the overhanging top
      g.restore();
      if (dawn) { g.strokeStyle = 'rgba(255,224,170,.85)'; g.lineWidth = X(.007); g.beginPath(); for (let x = X(.2); x <= wr; x += 6) { const y = topY(x) + 2; x === X(.2) ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }   // the sun along the top edge
      for (let i = 0; i < 40; i++) { const x = X(r() * L.wallR), y = topY(x); g.strokeStyle = dawn ? 'rgb(84,82,52)' : 'rgb(60,62,70)'; g.lineWidth = 2; for (let j = 0; j < 4; j++) { const a = -Math.PI / 2 + (r() - .5) * 1.4, l = Y(.008 + r() * .014); g.beginPath(); g.moveTo(x, y + 2); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }   // dry grass on the top
      // the doorway: low, squared, cut into the foot of the face
      const [tx, ty] = [X(L.tomb[0]), Y(L.tomb[1])], tw = X(L.tw), th = Y(L.th), x0 = tx - tw / 2, y0 = gl - th;
      g.fillStyle = dawn ? 'rgba(70,50,38,.75)' : 'rgba(44,42,56,.75)'; g.fillRect(x0 - tw * .1, y0 - th * .14, tw * 1.2, th * 1.14 + 2);   // the cut recess
      if (dawn) { g.fillStyle = 'rgba(255,220,166,.8)'; g.fillRect(x0 + tw * 1.06, y0 - th * .1, tw * .05, th * 1.1); }                   // its lit jamb
      g.fillStyle = dawn ? 'rgb(30,20,14)' : 'rgb(20,20,28)'; g.fillRect(x0, y0, tw, th + 2);
      g.save(); g.beginPath(); g.rect(x0, y0, tw, th + 2); g.clip();
      g.fillStyle = dawn ? 'rgb(118,86,60)' : 'rgb(46,44,56)'; g.fillRect(x0 + tw * .06, y0 + th * .42, tw * .5, th * .16);              // the stone shelf inside — empty
      g.fillStyle = dawn ? 'rgb(244,234,212)' : 'rgb(128,126,136)'; g.fillRect(x0 + tw * .3, y0 + th * .34, tw * .16, th * .09);          // the cloth, folded by itself (Jn 20:7)
      if (dawn) { g.fillStyle = 'rgba(255,214,150,.75)'; g.beginPath(); g.moveTo(x0 + tw, y0); g.lineTo(x0 + tw, y0 + th + 2); g.lineTo(x0 + tw * .15, y0 + th + 2); g.lineTo(x0 + tw * .45, y0 + th * .3); g.fill(); }   // the sun reaching in
      g.restore();
      // the groove along the foot of the face, and the round flat stone rolled along it
      if (!closed) { g.fillStyle = dawn ? 'rgba(40,26,18,.7)' : 'rgba(30,30,40,.7)'; g.fillRect(x0 + tw, gl - Y(.006), X(.32), Y(.014)); }
      const sr = closed ? Math.min(X(L.tw) * .42, Y(L.th) * .5) : Y(L.sr), [sx2, sy2] = closed ? [tx + X(L.tw) * .06, gl - sr * 1.02] : [X(L.stone[0]), Y(L.stone[1])];   // sealed: the stone covers the whole doorway
      g.fillStyle = 'rgba(30,20,14,.5)'; g.beginPath(); g.ellipse(sx2 - sr * .4, gl + Y(.004), sr * 1.1, sr * .14, 0, 0, 6.283); g.fill();
      g.fillStyle = dawn ? 'rgb(84,64,50)' : 'rgb(58,56,70)'; g.beginPath(); g.ellipse(sx2 - sr * .16, sy2, sr * .96, sr, 0, 0, 6.283); g.fill();          // its thickness
      const sgd = g.createLinearGradient(sx2 - sr, sy2 - sr, sx2 + sr, sy2 + sr * .3); (dawn ? [[0, 'rgb(92,72,58)'], [.6, 'rgb(146,120,92)'], [1, 'rgb(198,166,122)']] : [[0, 'rgb(72,70,86)'], [1, 'rgb(118,114,130)']]).forEach(([a, cc]) => sgd.addColorStop(a, cc));
      g.fillStyle = sgd; g.beginPath(); g.ellipse(sx2, sy2, sr * .96, sr, 0, 0, 6.283); g.fill();
      g.strokeStyle = dawn ? 'rgba(80,58,44,.55)' : 'rgba(44,44,56,.55)'; g.lineWidth = sr * .05; g.beginPath(); g.ellipse(sx2, sy2, sr * .3, sr * .32, 0, 0, 6.283); g.stroke();   // the hub
      if (dawn) { g.strokeStyle = 'rgba(255,232,180,1)'; g.lineWidth = sr * .12; g.beginPath(); g.ellipse(sx2, sy2, sr * .93, sr * .97, 0, -1.25, 1.0); g.stroke(); }   // the rim of light on its edge
      // a narrow earth path coming in slantwise from the lower corner between rocks
      g.fillStyle = dawn ? 'rgb(122,94,62)' : 'rgb(112,106,120)'; g.beginPath(); g.moveTo(x0 + tw * .2, gl); g.quadraticCurveTo(X(.28), Y(.75), X(V ? .02 : .2), H + oy); g.lineTo(X(V ? .14 : .28), H + oy); g.quadraticCurveTo(X(.36), Y(.76), x0 + tw * .65, gl); g.fill();
      for (let i = 0; i < 26; i++) { const side = i % 2 ? 1 : -1, v = r(), px = lerp(x0 + tw * .4, X(V ? .08 : .24), v) + side * X(.06 + r() * .1), py = lerp(gl + Y(.02), H + oy, v), rr = X(.02 + r() * .04) * (.6 + v) * (V ? 1 : .5);   // rocks either side
        g.fillStyle = dawn ? 'rgba(30,22,16,.4)' : 'rgba(30,30,40,.4)'; g.beginPath(); g.ellipse(px - rr * .3, py + rr * .4, rr * 1.1, rr * .3, 0, 0, 6.283); g.fill();
        const rg2 = g.createLinearGradient(px - rr, py - rr, px + rr, py + rr * .4); (dawn ? [[0, 'rgb(78,60,46)'], [1, 'rgb(164,132,94)']] : [[0, 'rgb(70,68,84)'], [1, 'rgb(120,116,132)']]).forEach(([a, cc]) => rg2.addColorStop(a, cc));
        g.fillStyle = rg2; g.beginPath(); for (let j = 0; j < 7; j++) { const a = j / 7 * 6.283 + r() * .3, q = .75 + r() * .35; g.lineTo(px + Math.cos(a) * rr * q, py + Math.sin(a) * rr * q * .62); } g.closePath(); g.fill(); }
      L.olive.forEach((o, i) => olive(g, dawn, o, 70 + i));
      if (dawn) for (let i = 0; i < 160; i++) { const fx = X(r()), fy = Y(L.gl + .03 + Math.pow(r(), 1.3) * (1 - L.gl)); g.fillStyle = ['#f0d070', '#e8b060', '#f6ecd0', '#d06048'][r() * 4 | 0]; g.beginPath(); g.arc(fx, fy, 2 + r() * 3, 0, 6.283); g.fill(); }   // flowers
      return c; };
    // the great rock of Caesarea Philippi at sunrise (part 3's «alone under the darkened rock», answered)
    const peterPlate = () => { const c = canvas(PW, PH), g = c.getContext('2d'); g.translate(ox, oy); sky(g, true, L.pgl); ground(g, true, L.pgl);
      const r = rng(23), edge = []; for (let i = 0; i <= 18; i++) { const v = i / 18; edge.push([X(L.cliff - .1 + .12 * v + .06 * Math.sin(v * 9) + .04 * (Pilot.fbm(v * 4, 1.1, 3) - .5)), lerp(-oy, Y(L.pgl + .08), v)]); }
      const cg = g.createLinearGradient(0, 0, X(L.cliff + .1), 0); cg.addColorStop(0, 'rgb(70,48,42)'); cg.addColorStop(.7, 'rgb(132,92,70)'); cg.addColorStop(1, 'rgb(214,152,100)');
      g.fillStyle = cg; g.beginPath(); g.moveTo(-ox, -oy); edge.forEach(p => g.lineTo(...p)); g.lineTo(-ox, Y(L.pgl + .08)); g.fill();
      g.strokeStyle = 'rgba(46,30,26,.55)'; g.lineWidth = X(.008); for (let i = 0; i < 16; i++) { const y0 = Y(r() * (L.pgl + .05)), x1 = edge[Math.min(18, Math.round(clamp(y0 / Y(L.pgl + .08)) * 18))][0]; g.beginPath(); g.moveTo(-ox, y0 + Y(.02) * (r() - .5)); g.quadraticCurveTo(x1 * .5, y0 + Y(.02) * (r() - .5), x1 - X(.02), y0); g.stroke(); }   // ledges
      // the grottoes: a lit lip, darkness deepening inward
      for (const [nx, ny, nw] of [[.16, .3, .09], [.3, .42, .06]]) { const cx = X(nx), cy = Y(ny), rw = X(nw), rh = Y(nw * .7);
        const arch = new Path2D(); arch.ellipse(cx, cy, rw, rh, 0, Math.PI, 0); arch.lineTo(cx + rw, cy + Y(.02)); arch.lineTo(cx - rw, cy + Y(.02)); arch.closePath();
        g.save(); g.clip(arch); const ig = g.createRadialGradient(cx - rw * .25, cy + rh * .1, rw * .05, cx, cy, rw * 1.1); ig.addColorStop(0, 'rgb(14,8,6)'); ig.addColorStop(.55, 'rgb(46,30,22)'); ig.addColorStop(1, 'rgb(112,78,56)');
        g.fillStyle = ig; g.fillRect(cx - rw * 1.2, cy - rh * 1.2, rw * 2.4, rh * 1.4 + Y(.03)); g.restore();
        g.strokeStyle = 'rgba(255,214,150,.7)'; g.lineWidth = X(.006); g.beginPath(); g.ellipse(cx, cy, rw, rh, 0, -.9, 0); g.lineTo(cx + rw, cy + Y(.02)); g.stroke();   // the sun on its right lip
        g.strokeStyle = 'rgba(40,26,20,.6)'; g.lineWidth = X(.01); g.beginPath(); g.moveTo(cx - rw, cy + Y(.02)); g.lineTo(cx + rw, cy + Y(.02)); g.stroke(); }
      g.strokeStyle = 'rgba(255,214,150,.75)'; g.lineWidth = X(.006); g.beginPath(); edge.forEach((p, i) => i ? g.lineTo(p[0] - X(.004), p[1]) : g.moveTo(p[0] - X(.004), p[1])); g.stroke();   // the sun on the cliff's edge
      for (let i = 0; i < 160; i++) { const fx = X(L.cliff + r() * .6), fy = Y(L.pgl + .05 + Math.pow(r(), 1.3) * .45); g.fillStyle = ['#f0d070', '#e8b060', '#f6ecd0'][r() * 3 | 0]; g.beginPath(); g.arc(fx, fy, 2 + r() * 3, 0, 6.283); g.fill(); }
      return c; };
    D.dawn = OIL.paint(tombPlate(true), { key: 'impasto', S: 1, seed: 29, cell: 8, wid: V ? 1 / 55 : 1 / 95 });
    D.pre = OIL.paint(tombPlate(false, true), { key: 'impasto', S: 1, seed: 31, cell: 8, wid: V ? 1 / 55 : 1 / 95 });
    D.peter = OIL.paint(peterPlate(), { key: 'impasto', S: 1, seed: 33, cell: 8, wid: V ? 1 / 55 : 1 / 95 });
    D.grey = canvas(PW, PH); { const g = D.grey.getContext('2d'); g.filter = 'grayscale(1) contrast(1.2) brightness(.82)'; g.drawImage(D.dawn, 0, 0); }
    // the knife strokes that repaint: ordered outward from the sun (tomb), from the tomb's doorway (tree)
    const mk = (cx, cy, seed) => { const r = rng(seed), a = []; for (let i = 0; i < 2600; i++) { const x = r() * PW, y = r() * PH, d = Math.hypot(x - cx, (y - cy) * .85) / Math.hypot(PW, PH) + r() * .07;
        a.push({ x, y, d, a: (r() - .5) * .8 + Math.atan2(y - cy, x - cx) + Math.PI / 2, w: X(.065) * (.6 + .8 * r()), l: X(.14) * (.6 + .8 * r()) }); } return a.sort((p, q) => p.d - q.d); };
    D.kSun = mk(X(L.sun[0]) + ox, Y(L.sun[1]) + oy, 41); D.kDoor = mk(X(L.tomb[0]) + ox, Y(L.tomb[1]) + oy, 43);
    D.mask = canvas(PW, PH);
    D.grain = []; for (let i = 0; i < 6; i++) D.grain.push(Pilot.speckle(W >> 1, H >> 1, 60, 610 + i));
    return D;
  }
  window.buildDawn = buildDawn;

  // the knife repainting: the first n strokes of the list, as a mask over the painting
  function reveal(ctx, art, list, k, cam) {
    if (k <= 0) return; const m = D.mask.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, D.PW, D.PH); m.fillStyle = '#fff';
    const n = Math.floor(list.length * clamp(k / .8)); for (let i = 0; i < n; i++) { const s = list[i]; m.save(); m.translate(s.x, s.y); m.rotate(s.a); m.beginPath(); m.ellipse(0, 0, s.l / 2, s.w / 2, 0, 0, 6.283); m.fill(); m.restore(); }
    if (k > .75) { m.globalAlpha = clamp((k - .75) / .25); m.fillRect(0, 0, D.PW, D.PH); m.globalAlpha = 1; }
    m.globalCompositeOperation = 'source-in'; m.drawImage(art, 0, 0); cam(); ctx.drawImage(D.mask, -D.ox, -D.oy);
  }
  function bloom(ctx, x, y, r, a, col = [255, 222, 160]) {
    if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.18, `rgba(${col},${a * .45})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = a * .14; ctx.fillStyle = `rgba(${col},1)`; ctx.beginPath(); ctx.ellipse(x, y, r * .7, r * .01, 0, 0, 6.283); ctx.fill(); ctx.restore();   // a lens streak
  }
  // film: the black-and-white grain and gate flicker of the scene before, fading out as the colour comes
  function film(ctx, t, bw) {
    const { W, H } = D, fi = Math.floor(t * 24), r = rng(fi * 7 + 1);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .12 + .3 * bw; ctx.drawImage(D.grain[fi % 6], 0, 0, W, H);
    const fl = (noise(t * 9.3, 4.1) - .5) * .1 * bw; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.abs(fl); ctx.fillStyle = fl > 0 ? '#fff' : '#000'; ctx.fillRect(0, 0, W, H);
    if (bw > .2 && r() < .5) { ctx.globalAlpha = .12 * bw; ctx.strokeStyle = '#eee'; ctx.lineWidth = 1.4; const x = r() * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 3, H); ctx.stroke(); }
    ctx.restore();
  }
  function finishDawn(ctx, k) {
    const { W, H, V } = D; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); OIL.varnish(ctx, .55 * k);
    const bg = ctx.createLinearGradient(0, H * (V ? .55 : .7), 0, H); bg.addColorStop(0, 'rgba(20,12,6,0)'); bg.addColorStop(.18, 'rgba(20,12,6,.38)'); bg.addColorStop(1, 'rgba(20,12,6,.55)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);   // calm under the words
    const R = Math.hypot(W, H) / 2, gv = ctx.createRadialGradient(W / 2, H * .45, R * .45, W / 2, H * .5, R * 1.05); gv.addColorStop(0, 'rgba(20,10,4,0)'); gv.addColorStop(1, 'rgba(20,10,4,.5)'); ctx.fillStyle = gv; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // Peter: a small silhouette, robe and mantle, the sun's rim on him; head bowed → lifted
  function peter(ctx, x, y, h, lift, t) {
    const head = lerp(.55, -.12, lift), w = Math.sin(t * 1.3) * .5 + noise(t * .7, 4) - .5;
    const body = g => { g.beginPath(); g.moveTo(x - h * .13, y); g.quadraticCurveTo(x - h * .16, y - h * .4, x - h * .12, y - h * .7); g.quadraticCurveTo(x - h * .1, y - h * .8, x - h * .03, y - h * .82);
      g.lineTo(x + h * .05, y - h * .82); g.quadraticCurveTo(x + h * .12, y - h * .78, x + h * .12, y - h * .66); g.quadraticCurveTo(x + h * (.15 + w * .02), y - h * .4, x + h * (.17 + w * .03), y); g.closePath(); g.fill();   // robe and mantle
      g.save(); g.translate(x + h * .01, y - h * .84); g.rotate(head * .5); g.beginPath(); g.ellipse(h * .02 + head * h * .03, -h * .07, h * .062, h * .075, head, 0, 6.283); g.fill(); g.restore();   // head: bowed, then raised to the light
      g.beginPath(); g.ellipse(x + h * .03, y + h * .005, h * .12, h * .02, 0, 0, 6.283); g.fill(); };
    ctx.save(); ctx.fillStyle = 'rgba(255,214,150,.95)'; body(ctx); ctx.translate(-h * .02, h * .004); ctx.fillStyle = 'rgb(40,26,22)'; body(ctx); ctx.restore();   // the rim of sun on his right side
    ctx.save(); ctx.globalAlpha = .45; ctx.fillStyle = 'rgb(40,26,22)'; ctx.beginPath(); ctx.moveTo(x - h * .1, y); ctx.lineTo(x - h * .9, y + h * .06); ctx.lineTo(x - h * .85, y + h * .1); ctx.lineTo(x + h * .1, y + h * .01); ctx.fill(); ctx.restore();   // his shadow, long, away from the sun
  }

  function dawnOil(ctx, u, mode = 'tomb') {
    const { W, H, V, L, ox, oy } = D, X = f => f * W, Y = f => f * H;
    const tbase = { tomb: 120.1, peter: 125.3, tree: 136 }[mode] || 0, t = tbase + u;
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const camAt = (z, fx, fy, dx = 0) => () => ctx.setTransform(z, 0, 0, z, fx - fx * z + dx, fy - fy * z);
    if (mode === 'tomb') {
      const z = 1 + .07 * eio(u / 5.2), cam = camAt(z, X(L.tomb[0]), Y(L.tomb[1]), lerp(6, -6, u / 5.2)), rep = clamp((u - .45) / 3.7);
      cam(); ctx.drawImage(D.grey, -ox, -oy);
      reveal(ctx, D.dawn, D.kSun, eo(rep), cam);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const s = [X(L.sun[0]), Y(L.sun[1])].map((v, i) => (i ? Y(L.tomb[1]) : X(L.tomb[0])) + (v - (i ? Y(L.tomb[1]) : X(L.tomb[0]))) * z);
      bloom(ctx, s[0], s[1], X(.5), .85 * ss(.6, 2.6, u));
      const dIn = ss(3.0, 5.0, u), dx = X(L.tomb[0]) + X(L.tw) * .05, dy = Y(L.tomb[1]) + Y(L.th) * .2;   // the sun reaches in through the doorway
      bloom(ctx, dx, dy, X(.28), .75 * dIn, [255, 226, 170]);
      film(ctx, t, 1 - ss(.4, 2.8, u)); finishDawn(ctx, ss(.5, 2.5, u));
    } else if (mode === 'peter') {
      const z = 1.03 + .06 * eio(u / 4.2), fx = X(L.peter[0]), fy = Y(L.peter[1] - L.ph * .5), cam = camAt(z, fx, fy, lerp(-8, 8, u / 4.2));
      cam(); ctx.drawImage(D.peter, -ox, -oy);
      peter(ctx, X(L.peter[0]), Y(L.peter[1]), Y(L.ph), eio(clamp((u - .8) / 1.9)), t);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const sx = fx + (X(L.sun[0]) - fx) * z, sy = fy + (Y(L.sun[1]) - fy) * z; bloom(ctx, sx, sy, X(.55), .8 + .1 * Math.sin(t * .8));
      { const r = rng(5); ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 24; i++) { const x = ((r() + t * (.005 + r() * .01)) % 1) * W, y = (r() * .6 + Math.sin(t * .5 + i) * .01) * H, rr = (3 + r() * 7) * W / 1080;
          const mg = ctx.createRadialGradient(x, y, 0, x, y, rr); mg.addColorStop(0, `rgba(255,236,190,${.25 * r()})`); mg.addColorStop(1, 'rgba(255,236,190,0)'); ctx.fillStyle = mg; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2); } ctx.restore(); }   // dust in the morning air
      film(ctx, t, 0); finishDawn(ctx, 1);
    } else {   // 'tree'
      const z = 1 + .1 * eio(u / 6.7), fx = X(L.tomb[0]), fy = Y(L.tomb[1]), cam = camAt(z, fx, fy), rep = clamp((u - 3.4) / 2.6);
      cam(); ctx.drawImage(D.pre, -ox, -oy);
      // the tree's shadow lying across the ground towards us; at «다시 살리사» it draws back as the sun comes up
      { const back = eio(clamp((u - 3.4) / 2.2)), a = .66 * (1 - back * .9), len = lerp(1, .15, back);
        const foot = [X(V ? .5 : .52), Y(V ? 1.12 : 1.05)], head = [X(V ? .4 : .42), Y(V ? .56 : .69)], hd = [lerp(foot[0], head[0], len), lerp(foot[1], head[1], len)];
        const wAt = y => lerp(X(V ? .085 : .05), X(V ? .03 : .018), clamp((foot[1] - y) / (foot[1] - head[1])));   // nearer is wider
        ctx.save(); ctx.fillStyle = `rgba(16,12,28,${a})`; ctx.filter = 'blur(3px)';
        ctx.beginPath(); ctx.moveTo(foot[0] - wAt(foot[1]) / 2, foot[1]); ctx.lineTo(hd[0] - wAt(hd[1]) / 2, hd[1]); ctx.lineTo(hd[0] + wAt(hd[1]) / 2, hd[1]); ctx.lineTo(foot[0] + wAt(foot[1]) / 2, foot[1]); ctx.fill();
        const fb = .9; if (len > fb + .04) { const cy = lerp(foot[1], head[1], fb), cx = lerp(foot[0], head[0], fb), half = X(V ? .26 : .15) * lerp(1, .55, fb), th = wAt(cy) * .8;   // the beam, square across
          ctx.beginPath(); ctx.moveTo(cx - half, cy - th * .5); ctx.lineTo(cx + half, cy - th * .42); ctx.lineTo(cx + half, cy + th * .42); ctx.lineTo(cx - half, cy + th * .5); ctx.fill(); }
        ctx.restore(); }
      reveal(ctx, D.dawn, D.kDoor, eo(rep), cam);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      bloom(ctx, X(L.tomb[0]), Y(L.tomb[1]) + Y(L.th) * .15, X(.42), .95 * ss(3.4, 4.6, u), [255, 230, 176]);   // the doorway floods with light
      { const dv = 1 - ss(0, 1.1, u); if (dv > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(W / 2, H * .3, 0, W / 2, H * .3, Math.max(W, H) * .8); g.addColorStop(0, `rgba(255,244,214,${.42 * dv})`); g.addColorStop(.45, `rgba(255,234,196,${.2 * dv})`); g.addColorStop(1, 'rgba(255,230,190,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); } }   // the dove's light of the scene before, withdrawing
      film(ctx, t, 0); finishDawn(ctx, .5 + .5 * ss(3.4, 5, u));
    }
    ctx.restore();
  }
  window.dawnOil = dawnOil;
})();
