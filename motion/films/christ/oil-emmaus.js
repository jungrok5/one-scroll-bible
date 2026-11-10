/* oil-emmaus.js — 「그리스도」 6부 엠마오 길 (kit-oilpaint.js key 'remington', after Remington's sunset plains and nocturnes;
   the same key as 「메시아」 oil-journey.js). Luke 24:13–31: on the evening of the resurrection two disciples walk west from
   Jerusalem to Emmaus; Jesus walks with them unrecognised, opens the Scriptures, and they ask him in at the village.
   People are small backlit silhouettes with a thin rim — no faces, no hand detail.
     'walk'  (u 0–6.2, 153.4–159.6 s): from behind — a country road at sunset running straight into the low sun; three small figures
             walk away from us, their long shadows stretching back toward the camera; at the road's end a small village. The camera
             follows, pushing in slowly.
     'speak' (u 0–6.9, 159.6–166.5 s): from the side — the three walk right (west) under the sunset; the camera trucks with them
             (near ground and far sky move at different speeds). The middle one half-turns back to the man behind him (0.8–2.0)
             and raises one hand toward the road ahead (1.6–2.8), gesturing as he speaks; the front one turns his head to listen.
     'lamp'  (u 0–9.5, 166.5–176 s): the same road as 'walk' after sunset — a blue-green nocturne; in the first house of the village
             a lamp is lit in a window (u ≈ 1.5); the three walk toward it and are taken into its shadow. The camera tilts down very
             slowly so that from u ≈ 4.2 the lit house sits small at 0.15–0.3 of the frame and the rest is calm dark (end card).
   async buildEmmausOil() paints the plates once (~3–5 s); emmausOil(ctx, u, mode) is a pure function of (u, mode). No words drawn.
   Needs Pilot (lib.js) and kit-oilpaint.js (window.OIL). */
(function () {
  const P = Pilot, { clamp, lerp, ss, eio, rng, fbm, canvas, mix, rgb } = P;
  const W = P.W, H = P.H, V = P.ori === 'v';
  const E = {};

  // ---------------- the road (walk + lamp): one painted plate in frame units × S, a simple ground perspective ----------------
  // ground point at distance D (m) and lateral X (m) → plate (x, y); a person's scale at D = F / D px per metre
  const R = { S: V ? 1.1 : 1.05 };
  R.WP = W * 1.3; R.HP = H * (V ? 1.32 : 1.3); R.hz = R.HP * (V ? .36 : .37); R.vx = R.WP * .5; R.F = V ? 1500 : 1000; R.A = (R.HP - R.hz) * (V ? 3.4 : 4.8);
  const gy = D => R.hz + R.A / D, gx = (X, D) => R.vx + R.F * X / D, sc = D => R.F / D;
  const roadX = D => .9 * Math.sin(D / 38) - .4;
  const HOUSE = { D: 92, X: -9.5, w: 7, h: 4.6 };                       // the first house of the village (the lit window)
  const SUN = () => [R.vx + R.WP * .13, R.hz - R.HP * .018];

  function paintRoad(night) {
    const S = R.S, { WP, HP, hz, vx } = R, c = canvas(Math.round(WP * S), Math.round(HP * S)), g = c.getContext('2d'); g.scale(S, S);
    const col = (a, b) => night ? b : a, lin = (y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([k, cc]) => gr.addColorStop(k, cc)); return gr; };
    // sky
    g.fillStyle = lin(0, hz, night ? [[0, '#071419'], [.5, '#10282e'], [.85, '#24434a'], [1, '#4a4c46']] : [[0, '#3e1428'], [.3, '#8a2a26'], [.62, '#da5e2a'], [.86, '#f4a444'], [1, '#ffd88a']]);
    g.fillRect(0, 0, WP, hz + 6);
    const [sx, sy] = SUN();
    if (!night) { const gr = g.createRadialGradient(sx, sy, 0, sx, sy, HP * .45); gr.addColorStop(0, 'rgba(255,244,200,1)'); gr.addColorStop(.05, 'rgba(255,218,130,.9)'); gr.addColorStop(.25, 'rgba(245,140,60,.4)'); gr.addColorStop(1, 'rgba(200,60,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, WP, hz + 6);
      g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(sx, sy, V ? 34 : 26, Math.PI, 0); g.fill(); }
    else { const gr = g.createRadialGradient(sx, hz, 0, sx, hz, WP * .5); gr.addColorStop(0, 'rgba(150,110,80,.5)'); gr.addColorStop(1, 'rgba(60,70,70,0)'); g.fillStyle = gr; g.fillRect(0, 0, WP, hz + 6); }
    // long cloud bands
    { const r = rng(5); for (let i = 0; i < 24; i++) { const y = hz * (.06 + .78 * r() ** 1.2), x = r() * WP, w = WP * (.15 + .35 * r()), h = 6 + 22 * r() * (1 - y / hz);
      g.fillStyle = night ? `rgba(${30 + 25 * r() | 0},${58 + 30 * r() | 0},${62 + 26 * r() | 0},.6)` : `rgba(${120 + 80 * (y / hz) + 30 * r() | 0},${34 + 70 * (y / hz) ** 2 | 0},${30 + 20 * r() | 0},.6)`;
      g.beginPath(); g.ellipse(x, y, w / 2, h / 2, 0, 0, 6.283); g.fill();
      g.fillStyle = night ? 'rgba(140,180,172,.28)' : 'rgba(255,196,100,.45)'; g.beginPath(); g.ellipse(x, y + h * .3, w * .42, h * .15, 0, 0, 6.283); g.fill(); } }
    // far hills with a thin rim
    const ridge = (base, amp, f, ph, cc, rim) => { const pts = []; for (let x = -20; x <= WP + 20; x += 8) pts.push([x, base - amp * (.5 + .5 * Math.sin(x * f + ph)) - amp * .4 * fbm(x * f * 3, ph, 3)]);
      g.fillStyle = cc; g.beginPath(); g.moveTo(-20, HP); pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(WP + 20, HP); g.closePath(); g.fill();
      g.strokeStyle = rim; g.lineWidth = 2.5; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1] + 1.2) : g.moveTo(p[0], p[1] + 1.2)); g.stroke(); };
    ridge(hz + 2, V ? 34 : 24, .0042, 1, col('#8a4234', '#1b2e32'), col('rgba(255,184,100,.55)', 'rgba(140,180,172,.3)'));
    ridge(hz + 8, V ? 20 : 14, .0068, 4, col('#5e2a26', '#15242a'), col('rgba(255,170,90,.45)', 'rgba(140,180,172,.25)'));
    // the ground: warm dark fields falling toward us (sunward warmer)
    { g.fillStyle = lin(hz, HP, night ? [[0, '#1c2a2a'], [.25, '#162020'], [1, '#0c1212']] : [[0, '#7a3a20'], [.2, '#5a2a16'], [.6, '#3a1c10'], [1, '#22110a']]); g.fillRect(0, hz + 6, WP, HP - hz);
      // field strips and stone walls converging to the vanishing point
      g.lineCap = 'round'; for (const X of [-60, -38, -24, -14, 14, 22, 36, 58]) { g.strokeStyle = night ? 'rgba(90,120,110,.16)' : 'rgba(255,170,90,.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(gx(X, 400), gy(400)); g.lineTo(gx(X, 4), gy(4)); g.stroke(); }
      const r = rng(7); for (let i = 0; i < 2200; i++) { const D = 4 + 300 * r() ** 2.2, X = (r() - .5) * 120, x = gx(X, D), y = gy(D) + (r() - .5) * 4, len = Math.min(16, 140 / D + 2);
        g.strokeStyle = night ? `rgba(${40 + 30 * r() | 0},${58 + 30 * r() | 0},${54 + 20 * r() | 0},.5)` : `rgba(${150 + 80 * r() | 0},${70 + 50 * r() | 0},${30 + 24 * r() | 0},${.35 + .25 * clamp(1 - D / 200)})`;
        g.lineWidth = Math.max(1, 30 / D); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * len * .5, y - len); g.stroke(); } }
    // the road: pale dust that takes the sky's glow, ruts running to the village
    { const pts = []; for (let D = 2.4; D <= HOUSE.D + 6; D *= 1.04) pts.push(D); const L = [], Rr = [];
      for (const D of pts) { const c0 = roadX(D), hw = 1.55 * (1 + .06 * Math.sin(D * .7)); L.push([gx(c0 - hw, D), gy(D)]); Rr.push([gx(c0 + hw, D), gy(D)]); }
      g.beginPath(); g.moveTo(...L[0]); L.forEach(p => g.lineTo(...p)); Rr.reverse().forEach(p => g.lineTo(...p)); g.closePath();
      g.fillStyle = lin(hz, HP, night ? [[0, '#34403c'], [.25, '#1c2624'], [.6, '#121a18'], [1, '#0c1210']] : [[0, '#f6b86c'], [.15, '#c47a40'], [.5, '#7a4024'], [1, '#3e2012']]); g.fill();
      for (const o of [-.7, .7]) { g.strokeStyle = night ? 'rgba(20,30,28,.5)' : 'rgba(90,40,18,.45)'; g.lineWidth = 3; g.beginPath(); pts.forEach((D, i) => { const x = gx(roadX(D) + o, D), y = gy(D); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); } }
    // the village on its low rise at the road's end; the first house (the lamp) left of the road
    { const r = rng(41), hs = []; for (let i = 0; i < 26; i++) { const D = 105 + r() * 110, X = (r() - .5) * 60 + roadX(D) * .5; hs.push({ D, X, w: 5 + r() * 5, h: 3.5 + r() * 3 }); } hs.push({ ...HOUSE, main: true }); hs.sort((a, b) => b.D - a.D);
      // the rise
      g.fillStyle = col('#4a2220', '#121e22'); g.beginPath(); g.moveTo(gx(-80, 160), gy(160) + 4); g.quadraticCurveTo(gx(0, 160), gy(160) - (V ? 26 : 18), gx(80, 160), gy(160) + 4); g.closePath(); g.fill();
      for (const h of hs) { const x = gx(h.X, h.D), y = gy(h.D), s = sc(h.D), w = h.w * s, hh = h.h * s;
        g.fillStyle = col(h.main ? '#3a1a18' : '#4a2420', h.main ? '#0e1618' : '#121c20'); g.fillRect(x - w / 2, y - hh, w, hh);
        g.fillStyle = col('#2a1214', '#0a1214'); g.fillRect(x + w / 2, y - hh, w * .28, hh);   // the shaded side
        g.fillStyle = col('rgba(255,180,100,.7)', 'rgba(140,180,172,.3)'); g.fillRect(x - w / 2, y - hh - 1, w * 1.28, Math.max(1, s * .25));   // roof edge rim
        if (h.main) { E.win = { x: x - w * .12, y: y - hh * .52, w: w * .16, h: hh * .26, door: [x + w * .22, y - hh * .5, w * .16, hh * .5], gx: x, gy: y, s }; g.fillStyle = col('#1c0c0c', '#060a0a'); g.fillRect(E.win.x - E.win.w / 2, E.win.y - E.win.h / 2, E.win.w, E.win.h); g.fillRect(...E.win.door); } } }
    // olive trees: dark rounded crowns with a rim toward the sun; long shadows toward us
    { const r = rng(13); const trees = []; for (let i = 0; i < 34; i++) { const D = 7 + 150 * r() ** 1.7, side = r() < .5 ? -1 : 1, X = roadX(D) + side * (4.5 + r() * 22); if (Math.abs(X - HOUSE.X) < 9 && Math.abs(D - HOUSE.D) < 12) continue; trees.push({ D, X, s: .8 + r() * .5, k: r() }); }
      trees.sort((a, b) => b.D - a.D);
      for (const t of trees) { const x = gx(t.X, t.D), y = gy(t.D), s = sc(t.D) * t.s;
        g.fillStyle = night ? 'rgba(4,8,8,.4)' : 'rgba(30,10,6,.45)'; g.beginPath(); g.moveTo(x - 1.2 * s, y); g.lineTo(x + 1.2 * s, y); g.lineTo(gx(t.X - 3, t.D * .55), gy(t.D * .55)); g.lineTo(gx(t.X - 6, t.D * .55), gy(t.D * .55)); g.closePath(); g.fill();
        g.fillStyle = col('#24120c', '#0a1010'); g.fillRect(x - .18 * s, y - 1.5 * s, .36 * s, 1.5 * s);
        const rr = rng(100 + (t.k * 1e4 | 0)); for (let k = 0; k < 13; k++) { const cx = x + (rr() - .5) * 2.8 * s, cy = y - 2.3 * s + (rr() - .5) * 1.5 * s, rx = (.6 + rr() * .5) * s, ry = rx * .72;
          g.fillStyle = col(`rgb(${40 + 20 * rr() | 0},${26 + 12 * rr() | 0},${16 + 8 * rr() | 0})`, `rgb(${12 + 8 * rr() | 0},${22 + 10 * rr() | 0},${22 + 8 * rr() | 0})`); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.283); g.fill();
          g.strokeStyle = col('rgba(255,176,90,.5)', 'rgba(120,170,160,.2)'); g.lineWidth = Math.max(1, s * .1); g.beginPath(); g.ellipse(cx, cy, rx * .94, ry * .9, 0, -2.3, -.5); g.stroke(); } } }
    return OIL.paint(c, { key: 'remington', S, seed: night ? 31 : 29, dirAt: (px, py) => 0 });
  }

  // ---------------- the side view (speak): far sky plate + near ground plate (parallax) ----------------
  const SV = { S: V ? 1.1 : 1.05 };
  SV.feet = H * (V ? .585 : .7); SV.scale = V ? 140 : 100;   // px per metre for the walkers
  SV.travel = 1.3 * SV.scale * 6.9;                           // how far the near ground moves (px) over the shot
  SV.WN = W + SV.travel + 200; SV.WF = W + SV.travel * .28 + 200; SV.hzF = H * (V ? .49 : .6);
  function paintSide() {
    const S = SV.S, hz = SV.hzF;
    // far: sky, the sun ahead (right), clouds, far hills, Emmaus small on a far rise
    const far = canvas(Math.round(SV.WF * S), Math.round(H * S)), g = far.getContext('2d'); g.scale(S, S);
    { const gr = g.createLinearGradient(0, 0, 0, hz); [[0, '#3a1428'], [.32, '#86282a'], [.66, '#dc602a'], [.9, '#f6aa48'], [1, '#ffd88a']].forEach(([k, cc]) => gr.addColorStop(k, cc)); g.fillStyle = gr; g.fillRect(0, 0, SV.WF, H); }
    const sx = W * .8 + SV.travel * .28 * .6, sy = hz - (V ? 30 : 20); SV.sun = [sx, sy];
    { const gr = g.createRadialGradient(sx, sy, 0, sx, sy, H * .5); gr.addColorStop(0, 'rgba(255,244,200,1)'); gr.addColorStop(.05, 'rgba(255,214,130,.9)'); gr.addColorStop(.3, 'rgba(240,130,60,.35)'); gr.addColorStop(1, 'rgba(200,60,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, SV.WF, H);
      g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(sx, sy, V ? 36 : 28, 0, 6.283); g.fill(); }
    { const r = rng(15); for (let i = 0; i < 22; i++) { const y = hz * (.05 + .8 * r() ** 1.2), x = r() * SV.WF, w = SV.WF * (.12 + .3 * r()), h = 6 + 24 * r() * (1 - y / hz);
      g.fillStyle = `rgba(${120 + 80 * (y / hz) + 30 * r() | 0},${34 + 70 * (y / hz) ** 2 | 0},${30 + 20 * r() | 0},.6)`; g.beginPath(); g.ellipse(x, y, w / 2, h / 2, 0, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(255,196,100,.45)'; g.beginPath(); g.ellipse(x, y + h * .3, w * .42, h * .15, 0, 0, 6.283); g.fill(); } }
    const ridge = (base, amp, f, ph, cc, rim) => { const pts = []; for (let x = -20; x <= SV.WF + 20; x += 8) pts.push([x, base - amp * (.5 + .5 * Math.sin(x * f + ph)) - amp * .4 * fbm(x * f * 3, ph, 3)]);
      g.fillStyle = cc; g.beginPath(); g.moveTo(-20, H); pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(SV.WF + 20, H); g.closePath(); g.fill();
      g.strokeStyle = rim; g.lineWidth = 2.5; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1] + 1.2) : g.moveTo(p[0], p[1] + 1.2)); g.stroke(); };
    ridge(hz + 4, V ? 46 : 34, .0034, 2, '#8a4034', 'rgba(255,184,100,.55)');
    { const bx = sx + (V ? 160 : 200), by = hz + 2; g.fillStyle = '#5a2826'; const r = rng(3); for (let i = 0; i < 12; i++) { const w = 8 + r() * 10, h = 6 + r() * 8, x = bx + (r() - .5) * (V ? 150 : 180); g.fillRect(x, by - h - 8 * r(), w, h + 12); } }
    ridge(hz + (V ? 30 : 22), V ? 30 : 22, .0057, 5, '#5a2826', 'rgba(255,170,90,.45)');
    { const r = rng(61); for (let x = 40; x < SV.WF; x += 140 + r() * 260) { if (Math.abs(x - sx) < (V ? 260 : 300)) continue; const y = hz + (V ? 24 : 18) - (V ? 30 : 22) * (.5 + .5 * Math.sin(x * .0057 + 5)) + 10, s = (V ? 14 : 11) * (.7 + .6 * r());   // small far olive trees on the ridge (behind the walkers)
      g.fillStyle = '#3a1a18'; g.fillRect(x - s * .1, y - s * 1.2, s * .2, s * 1.2); for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(x + (r() - .5) * s * 1.6, y - s * 1.5 + (r() - .5) * s * .6, s * (.5 + r() * .3), s * .38, 0, 0, 6.283); g.fill(); }
      g.strokeStyle = 'rgba(255,176,90,.45)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y - s * 1.6, s * .9, s * .5, 0, -1.2, .4); g.stroke(); } }
    const farA = OIL.paint(far, { key: 'remington', S, seed: 41 });
    // near: the ground they walk on — a dusty path, dry grass, stones, olive trees that break the skyline; transparent above
    const near = canvas(Math.round(SV.WN * S), Math.round(H * S)), n = near.getContext('2d'); n.scale(S, S); n.drawImage(far, 0, 0, far.width, far.height, 0, 0, SV.WF, H);   // sky behind, for the strokes' colour (masked out after)
    const crest = x => SV.feet - (V ? 26 : 20) - 10 * Math.sin(x * .004 + 1) - 6 * fbm(x * .01, 2, 3);
    const mask = new Path2D(); mask.moveTo(-10, H); for (let x = -10; x <= SV.WN + 10; x += 6) mask.lineTo(x, crest(x)); mask.lineTo(SV.WN + 10, H); mask.closePath();
    const trees = []; { const r = rng(21); /* no near trees: nothing passes across the walkers */ }
    const tree = (t, gg) => { const y = crest(t.x) + 6, s = SV.scale * (t.back ? .7 : 1.1) * t.s, rr = rng(200 + (t.k * 1e4 | 0));
      gg.fillStyle = '#1c0e0a'; gg.beginPath(); gg.moveTo(t.x - .2 * s, y); gg.quadraticCurveTo(t.x - .05 * s, y - 1 * s, t.x - .25 * s, y - 1.8 * s); gg.lineTo(t.x + .1 * s, y - 1.8 * s); gg.quadraticCurveTo(t.x + .1 * s, y - 1 * s, t.x + .25 * s, y); gg.fill();
      for (let k = 0; k < 14; k++) { const cx = t.x + (rr() - .5) * 3 * s, cy = y - 2.6 * s + (rr() - .5) * 1.5 * s, rx = (.6 + rr() * .5) * s * .8, ry = rx * .7;
        gg.fillStyle = `rgb(${34 + 18 * rr() | 0},${22 + 10 * rr() | 0},${14 + 8 * rr() | 0})`; gg.beginPath(); gg.ellipse(cx, cy, rx, ry, 0, 0, 6.283); gg.fill();
        gg.strokeStyle = 'rgba(255,176,90,.55)'; gg.lineWidth = Math.max(1, s * .08); gg.beginPath(); gg.ellipse(cx, cy, rx * .94, ry * .9, 0, -1.3, .5); gg.stroke(); } };
    for (const t of trees) if (t.back) tree(t, n);
    { const gr = n.createLinearGradient(0, SV.feet - 40, 0, H); gr.addColorStop(0, '#7a3a1c'); gr.addColorStop(.12, '#5a2a16'); gr.addColorStop(.5, '#36190e'); gr.addColorStop(1, '#1e0e08'); n.fillStyle = gr; n.fill(mask);
      n.strokeStyle = 'rgba(255,170,90,.55)'; n.lineWidth = 3; n.beginPath(); for (let x = -10; x <= SV.WN + 10; x += 6) x < 0 ? n.moveTo(x, crest(x) + 1.5) : n.lineTo(x, crest(x) + 1.5); n.stroke();
      // the path: a band of pale dust, warm where the low sun catches it
      const py = SV.feet; n.fillStyle = 'rgba(214,140,80,.75)'; n.beginPath(); n.moveTo(-10, py - 8); for (let x = 0; x <= SV.WN + 10; x += 20) n.lineTo(x, py - 8 + 3 * Math.sin(x * .01)); for (let x = SV.WN + 10; x >= -10; x -= 20) n.lineTo(x, py + 14 + 4 * Math.sin(x * .013 + 2)); n.closePath(); n.fill();
      const r = rng(9); n.lineCap = 'round'; for (let i = 0; i < 2600; i++) { const x = r() * SV.WN, y = crest(x) + 4 + r() ** 1.6 * (H - crest(x)), d = (y - SV.feet) / (H - SV.feet);
        n.strokeStyle = `rgba(${140 + 90 * r() | 0},${64 + 50 * r() | 0},${28 + 24 * r() | 0},${.3 + .3 * clamp(1 - Math.abs(d))})`; n.lineWidth = 2 + 2 * clamp(d); n.beginPath(); n.moveTo(x, y); n.lineTo(x + (r() - .5) * 8, y - 8 - 14 * r() * (1 + clamp(d))); n.stroke(); }
      for (let i = 0; i < 40; i++) { const x = r() * SV.WN, y = SV.feet + 20 + r() * (H - SV.feet) * .6, s = 4 + r() * 10; n.fillStyle = '#2a140c'; n.beginPath(); n.ellipse(x, y, s * 1.4, s * .7, 0, 0, 6.283); n.fill(); n.fillStyle = 'rgba(255,170,90,.35)'; n.beginPath(); n.ellipse(x + s * .5, y - s * .3, s * .6, s * .25, 0, 0, 6.283); n.fill(); } }
    for (const t of trees) if (!t.back) tree(t, n);
    const nearA = OIL.paint(near, { key: 'remington', S, seed: 43 });
    const m = canvas(near.width, near.height), mg = m.getContext('2d'); mg.scale(S, S); mg.fillStyle = '#fff'; mg.fill(mask); for (const t of trees) { mg.save(); tree(t, mg); mg.restore(); }
    mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalCompositeOperation = 'source-in'; mg.drawImage(nearA, 0, 0);
    SV.farA = farA; SV.nearA = m; SV.crest = crest;
  }

  // ---------------- people: small backlit silhouettes (units: metres; origin at the feet, y up = negative) ----------------
  const LEN = { up: .32, fo: .29 };
  // 2-bone IK: shoulder (sx, sy) → hand (hx, hy), elbow on the side `bend` (+1 / −1) of the shoulder→hand line
  function ik(sx, sy, hx, hy, bend) { let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy); const mx = LEN.up + LEN.fo - 1e-3; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    const a = Math.acos(clamp((LEN.up * LEN.up + d * d - LEN.fo * LEN.fo) / (2 * LEN.up * d), -1, 1)), base = Math.atan2(dy, dx), ang = base + bend * a;
    const ex = sx + Math.cos(ang) * LEN.up, ey = sy + Math.sin(ang) * LEN.up; return [ex, ey, sx + dx, sy + dy]; }
  // seen from behind, walking away: head cloth, round shoulders, the robe widening to the hem, arms at the sides, heels showing
  function backFigure(g, ph, o = {}) {
    const bob = -.04 * Math.abs(Math.sin(ph)), sw = .035 * Math.sin(ph), k = o.k || 1;
    g.save(); g.translate(sw, bob);
    g.beginPath(); g.ellipse(0, -1.6 * k, .1, .115, 0, 0, 6.283); g.fill();                                           // head
    g.beginPath(); g.moveTo(-.11, -1.63 * k); g.quadraticCurveTo(-.115, -1.76 * k, 0, -1.765 * k); g.quadraticCurveTo(.115, -1.76 * k, .11, -1.63 * k);   // head cloth falling to the shoulders
    g.quadraticCurveTo(.14, -1.5 * k, .17, -1.42 * k); g.lineTo(-.17, -1.42 * k); g.quadraticCurveTo(-.14, -1.5 * k, -.11, -1.63 * k); g.fill();
    const hs = .065 * Math.sin(ph);
    g.beginPath(); g.moveTo(-.09, -1.49 * k); g.quadraticCurveTo(-.2, -1.47 * k, -.215, -1.36 * k); g.quadraticCurveTo(-.235, -1.0 * k, -.25 - hs, -.06); g.quadraticCurveTo(0, -.03, .25 - hs, -.06);
    g.quadraticCurveTo(.235, -1.0 * k, .215, -1.36 * k); g.quadraticCurveTo(.2, -1.47 * k, .09, -1.49 * k); g.closePath(); g.fill();
    g.lineCap = 'round'; g.lineWidth = .085;                                                                         // arms at the sides, swinging a little
    for (const sd of [-1, 1]) { const a = .09 * Math.sin(ph) * sd; g.beginPath(); g.moveTo(sd * .2, -1.38 * k); g.quadraticCurveTo(sd * .25, -1.1 * k, sd * (.25 + a * .3), -.82 * k + a); g.stroke(); }
    for (const sd of [-1, 1]) { const lift = Math.max(0, Math.sin(ph * 1 + (sd > 0 ? 0 : Math.PI))) * .07; g.beginPath(); g.ellipse(sd * .08, -.03 - lift, .055, .045 + lift * .3, 0, 0, 6.283); g.fill(); }   // heels
    g.restore(); }
  // in profile, facing right (dir +1), walking: o.turn 0..1 (head and shoulders turn back), o.arm 0..1 (near hand raised ahead),
  // o.look 0..1 (only the head turns back), o.gest (a small beat of the raised hand)
  function sideFigure(g, ph, o = {}) {
    const st = Math.sin(ph), bob = -.025 * Math.abs(Math.cos(ph)), turn = o.turn || 0, look = Math.max(turn, o.look || 0), lean = .07 * (1 - .6 * turn);
    g.save(); g.translate(0, bob); g.lineCap = 'round'; g.lineJoin = 'round';
    // only the ankles and feet show under the long robe; toes forward (right); the swinging foot lifts
    for (const i of [0, 1]) { const p = ph + i * Math.PI, fx = .23 * Math.sin(p), lift = .07 * Math.max(0, Math.cos(p));
      g.lineWidth = .07; g.beginPath(); g.moveTo(fx * .7, -.2); g.lineTo(fx - .01, -.07 - lift); g.stroke();
      g.beginPath(); g.moveTo(fx - .05, -.025 - lift); g.quadraticCurveTo(fx + .05, -.065 - lift, fx + .15, -.03 - lift * .5); g.lineTo(fx + .15, -.005 - lift * .5); g.lineTo(fx - .05, -.005 - lift); g.closePath(); g.fill(); }
    // the body leans into the walk (shear about the feet: the head is forward of the hips)
    g.transform(1, 0, -lean, 1, 0, 0);
    const bs = .15 + .06 * turn, hem = .08 * st, trail = .05 + .03 * Math.sin(ph * 2);
    g.beginPath(); g.moveTo(-.07, -1.49); g.quadraticCurveTo(-bs, -1.46, -bs - .01, -1.32); g.quadraticCurveTo(-.18, -.9, -.24 - trail + Math.min(0, hem), -.1);   // the back hem trails
    g.quadraticCurveTo(0, -.08, .22 + Math.max(0, hem), -.12); g.quadraticCurveTo(.18, -.9, .14, -1.3); g.quadraticCurveTo(.12, -1.45, .05, -1.49); g.closePath(); g.fill();
    // head: the cloth over the crown falls behind (away from where he looks) and past the shoulders; the face's line in front
    const hd = look > .5 ? -1 : 1, hx = .02 * hd;
    g.beginPath(); g.ellipse(hx, -1.6, .095, .112, 0, 0, 6.283); g.fill();
    g.beginPath(); g.moveTo(hx + .06 * hd, -1.69); g.quadraticCurveTo(hx - .02 * hd, -1.79, hx - .11 * hd, -1.71); g.quadraticCurveTo(hx - .2 * hd, -1.58, hx - .22 * hd, -1.3); g.lineTo(hx - .1 * hd, -1.36); g.quadraticCurveTo(hx - .06 * hd, -1.5, hx + .06 * hd, -1.69); g.fill();
    g.beginPath(); g.moveTo(hx + .085 * hd, -1.63); g.lineTo(hx + .13 * hd, -1.585); g.lineTo(hx + .09 * hd, -1.56); g.lineTo(hx + .1 * hd, -1.52); g.lineTo(hx + .06 * hd, -1.49); g.lineTo(hx, -1.55); g.closePath(); g.fill();   // brow, nose, chin (a line, no features)
    // the near arm: hangs and swings, or is raised toward the road ahead (IK with body-length bones, elbow below the line)
    const sx = .02, sy = -1.37, swing = .2 * Math.sin(ph + Math.PI), arm = o.arm || 0, gest = (o.gest || 0);
    const hang = [sx + swing * .9, sy + .56], up = [sx + .5 + .03 * gest, sy - .36 - .05 * gest];
    const hx2 = lerp(hang[0], up[0], arm), hy2 = lerp(hang[1], up[1], arm), [ex, ey, hx3, hy3] = ik(sx, sy, hx2, hy2, arm > .3 ? 1 : -1);
    // sleeve: wide at the shoulder, a little drape under the forearm
    const ux = ex - sx, uy = ey - sy, ul = Math.hypot(ux, uy) || 1, nx = -uy / ul, ny = ux / ul, fx2 = hx3 - ex, fy2 = hy3 - ey, fl = Math.hypot(fx2, fy2) || 1, mx = -fy2 / fl, my = fx2 / fl;
    g.beginPath(); g.moveTo(sx + nx * .06, sy + ny * .06); g.lineTo(ex + nx * .05, ey + ny * .05); g.lineTo(hx3 + mx * .035, hy3 + my * .035); g.lineTo(hx3 - mx * .045, hy3 - my * .045); g.lineTo(ex - nx * .07, ey - ny * .07 + .03 * arm); g.lineTo(sx - nx * .07, sy - ny * .07); g.closePath(); g.fill();
    g.lineWidth = .08; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx3, hy3); g.stroke();
    // the hand, open: a palm continuing the forearm, fingers together, and a thumb (shapes, no finger lines)
    const ha = Math.atan2(fy2, fx2) - .25 * arm, cs = Math.cos(ha), sn = Math.sin(ha);
    g.save(); g.translate(hx3, hy3); g.transform(cs, sn, -sn, cs, 0, 0);
    g.beginPath(); g.moveTo(0, -.03); g.quadraticCurveTo(.07, -.04, .13, -.025); g.quadraticCurveTo(.15, -.01, .13, .012); g.quadraticCurveTo(.07, .03, 0, .028); g.closePath(); g.fill();
    if (arm > .3) { g.beginPath(); g.moveTo(.03, -.025); g.quadraticCurveTo(.06, -.07, .085, -.075); g.lineTo(.09, -.06); g.quadraticCurveTo(.07, -.045, .06, -.02); g.closePath(); g.fill(); }   // the thumb
    g.restore();
    g.restore(); }

  // a figure drawn white into a small canvas (s px per metre), then: dark body, a warm rim on the edges facing the light,
  // optionally its shadow on the ground (the silhouette flipped and stretched)
  const FIG = { c: null, e: null, s: null };
  function figure(ctx, x, y, s, draw, o) {
    const bw = Math.ceil(1.6 * s), bh = Math.ceil(2.1 * s), ox = bw / 2, oy = bh - .15 * s;
    if (!FIG.c || FIG.c.width < bw || FIG.c.height < bh) { FIG.c = canvas(bw + 8, bh + 8); FIG.e = canvas(bw + 8, bh + 8); }
    const c = FIG.c.getContext('2d'), e = FIG.e.getContext('2d'), cw = FIG.c.width, ch = FIG.c.height;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cw, ch); c.globalCompositeOperation = 'source-over'; c.fillStyle = c.strokeStyle = '#fff';
    c.setTransform(s, 0, 0, s, ox, oy); draw(c); c.setTransform(1, 0, 0, 1, 0, 0);
    // shadow first (on the ground)
    if (o.shadow) { const [k, skew, a] = o.shadow; ctx.save(); ctx.globalAlpha = a; ctx.filter = 'blur(2px)'; ctx.setTransform(1, 0, skew, -k, x, y); ctx.globalCompositeOperation = 'source-over';
      const t = FIG.e.getContext('2d'); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, cw, ch); t.globalCompositeOperation = 'source-over'; t.drawImage(FIG.c, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = o.shadowCol || 'rgb(26,10,6)'; t.fillRect(0, 0, cw, ch);
      ctx.drawImage(FIG.e, -ox, -oy); ctx.restore(); }
    // rim = the figure minus itself eroded toward the light
    e.setTransform(1, 0, 0, 1, 0, 0); e.globalCompositeOperation = 'source-over'; e.clearRect(0, 0, cw, ch);
    const d = Math.max(1.2, (o.rimW || .035) * s), sh = o.rimShifts || [[-1, 0]];
    e.drawImage(FIG.c, sh[0][0] * d, sh[0][1] * d); e.globalCompositeOperation = 'destination-in'; for (let i = 1; i < sh.length; i++) e.drawImage(FIG.c, sh[i][0] * d, sh[i][1] * d);
    e.globalCompositeOperation = 'source-in'; e.fillStyle = '#000'; e.fillRect(0, 0, cw, ch);   // (eroded part)
    // body colour into c, then the rim where c is not eroded
    c.globalCompositeOperation = 'source-in'; c.fillStyle = o.body || 'rgb(22,12,10)'; c.fillRect(0, 0, cw, ch);
    const rimC = canvas(cw, ch), rc = rimC.getContext('2d'); rc.drawImage(FIG.c, 0, 0); rc.globalCompositeOperation = 'source-in'; rc.fillStyle = o.rim || 'rgb(255,190,120)'; rc.fillRect(0, 0, cw, ch);
    rc.globalCompositeOperation = 'destination-out'; rc.drawImage(FIG.e, 0, 0);
    ctx.save(); ctx.globalAlpha = o.alpha ?? 1; ctx.drawImage(FIG.c, x - ox, y - oy); ctx.globalAlpha = (o.alpha ?? 1) * (o.rimA ?? 1); ctx.drawImage(rimC, x - ox, y - oy); ctx.restore(); }

  // ---------------- build ----------------
  async function build() {
    const t0 = performance.now();
    E.roadSun = paintRoad(false); await new Promise(r => setTimeout(r, 0));
    E.roadNight = paintRoad(true); await new Promise(r => setTimeout(r, 0));
    paintSide();
    E.ms = performance.now() - t0; return E; }

  // ---------------- scenes ----------------
  const bloom = (ctx, x, y, r, col, a) => { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgb(col, a)); g.addColorStop(.2, rgb(col, a * .4)); g.addColorStop(1, rgb(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); };
  function finish(ctx, u, vig, warm, lift = 0) { OIL.varnish(ctx, .55, warm ? [140, 60, 30] : [40, 80, 80]);
    if (lift > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rgb(warm ? [44, 26, 16] : [16, 24, 24], lift); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    ctx.save(); const g = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vig})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    if (!E.grain) E.grain = P.speckle(256, 256, 30, 3); ctx.save(); ctx.globalAlpha = .05; ctx.globalCompositeOperation = 'overlay'; const ox = (Math.floor(u * 24) * 97) % 256, oy = (Math.floor(u * 24) * 151) % 256;
    for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) ctx.drawImage(E.grain, x, y); ctx.restore(); }
  // camera over the road plate: hz lands at frame y = hzF; z zoom about the vanishing point
  function roadCam(z, hzF, dx = 0) { const fx = R.vx + dx, fy = R.hz + (H / 2 - hzF) / z; return { fx, fy, z, P2: (x, y) => [W / 2 + (x - fx) * z, H / 2 + (y - fy) * z] }; }
  const WALKERS = [{ X: -.95, D: 13.7, ph: .0, k: 1 }, { X: .05, D: 14.2, ph: 2.1, k: 1.02 }, { X: .98, D: 13.9, ph: 4.0, k: .98 }];

  function walk(ctx, u) {
    const z = lerp(1, 1.22, eio(clamp(u / 6.2)) * .6 + u / 6.2 * .4), cam = roadCam(z, H * (V ? .35 : .39), 14 * Math.sin(u * .45));
    OIL.view(ctx, E.roadSun, R.S, cam.fx * R.S, cam.fy * R.S, z);
    const [sx, sy] = cam.P2(...SUN()); bloom(ctx, sx, sy, (V ? 520 : 420) * z, [255, 200, 120], .55);
    const adv = u * 1.1;   // they draw away from us a little
    for (const w of WALKERS.slice().sort((a, b) => b.D - a.D)) { const D = w.D + adv, X = roadX(D) + w.X, [x, y] = cam.P2(gx(X, D), gy(D)), s = sc(D) * z, ph = u * 4.4 + w.ph;
      figure(ctx, x, y, s, g => backFigure(g, ph, { k: w.k }), { shadow: [2.9, .42, .5], rim: 'rgb(255,196,120)', rimW: .03, rimShifts: [[0, 1.4], [.8, 0], [-.8, 0]], body: 'rgb(30,15,12)' }); }
    finish(ctx, u, .38, true, .45);
  }

  function speak(ctx, u) {
    const k = u / 6.9, nearX = SV.travel * k, farX = SV.travel * .28 * k;
    ctx.drawImage(SV.farA, farX * SV.S, 0, (W + 4) * SV.S, H * SV.S, 0, 0, W + 4, H);   // (drawn 1:1 into the frame)
    bloom(ctx, SV.sun[0] - farX, SV.sun[1], V ? 560 : 460, [255, 200, 120], .55);
    ctx.drawImage(SV.nearA, nearX * SV.S, 0, W * SV.S, H * SV.S, 0, 0, W, H);
    // the three, walking right at the ground's pace; front disciple, Jesus in the middle (a step farther), the other behind
    const s = SV.scale, x0 = W * (V ? .47 : .46), ph0 = u * 4.33;
    const turn = ss(.8, 2.0, u) * (1 - ss(6.2, 6.9, u) * .4), arm = ss(1.6, 2.8, u) * (1 - ss(6.0, 6.9, u) * .6), gest = Math.sin(Math.max(0, u - 2.8) * 3.1) * ss(2.8, 3.4, u);
    const people = [{ dx: -.95 * s, dy: 4, sc: .97, ph: 1.3, o: { look: 0 } }, { dx: 0, dy: -6, sc: .95, ph: 0, o: { turn, arm, gest }, mid: true }, { dx: .92 * s, dy: 5, sc: 1, ph: 2.6, o: { look: ss(2.2, 3.2, u) * (1 - ss(5.6, 6.6, u)) } }];
    for (const p of people) { const x = x0 + p.dx, y = SV.feet + p.dy, ss2 = s * p.sc;
      figure(ctx, x, y, ss2, g => sideFigure(g, ph0 + p.ph, p.o), { shadow: [.3, 1.7, .4], rim: 'rgb(255,190,116)', rimA: .8, rimW: .02, rimShifts: [[-1, .25]], body: 'rgb(30,15,12)' }); }
    finish(ctx, u, .3, true, 1);
  }

  function lamp(ctx, u) {
    const tilt = eio(clamp(u / 6.5)), z = lerp(1.04, 1.16, eio(clamp(u / 9.5))), hzF = lerp(H * (V ? .355 : .4), H * (V ? .205 : .22), tilt), cam = roadCam(z, hzF, 0);
    OIL.view(ctx, E.roadNight, R.S, cam.fx * R.S, cam.fy * R.S, z);
    // stars
    { const r = rng(5); ctx.save(); ctx.fillStyle = '#e4f0ec'; for (let i = 0; i < 120; i++) { const [x, y] = cam.P2(r() * R.WP, r() * R.hz * .85); if (y < 0 || y > H) continue; ctx.globalAlpha = (.25 + .6 * r()) * (.8 + .2 * Math.sin(u * 2 + i)); ctx.fillRect(x, y, 1.6, 1.6); } ctx.restore(); }
    // the window: a lamp is lit inside (u ≈ 1.5) — a warm square, its glow, light spilling on the ground before the house
    const on = ss(1.4, 1.9, u) * (.94 + .06 * Math.sin(u * 9) * Math.sin(u * 3.7)), Wn = E.win;
    if (on > 0) { const [wx, wy] = cam.P2(Wn.x, Wn.y), [gx0, gy0] = cam.P2(Wn.gx, Wn.gy);
      const spill = on * (1 - .55 * ss(4.2, 6.2, u)), RR = Wn.s * 52 * z;   // the lamp's light out along the road toward the walkers (wide, warm); it draws in for the end card
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(gx0, gy0 + RR * .25); ctx.scale(1.25, .62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, RR); sg.addColorStop(0, `rgba(255,170,80,${.5 * spill})`); sg.addColorStop(.35, `rgba(220,130,60,${.24 * spill})`); sg.addColorStop(1, 'rgba(160,90,40,0)'); ctx.fillStyle = sg; ctx.fillRect(-RR, -RR, RR * 2, RR * 2); ctx.restore();
      bloom(ctx, wx, wy, Wn.s * 40 * z, [255, 170, 90], .35 * spill);
      bloom(ctx, wx, wy, Wn.s * 14 * z, [255, 190, 100], .75 * on); bloom(ctx, wx, wy, Wn.s * 4 * z, [255, 230, 170], .9 * on);
      ctx.fillStyle = `rgba(255,214,140,${on})`; ctx.fillRect(wx - Wn.w / 2 * z, wy - Wn.h / 2 * z, Wn.w * z, Wn.h * z); }
    // the three walk on toward the house and are taken into its dark (u 0 → 6.4)
    const fade = 1 - ss(5.4, 6.6, u);
    if (fade > 0) for (const w of WALKERS.slice().sort((a, b) => b.D - a.D)) { const D = lerp(w.D + 8, HOUSE.D - 6 + w.X, eio(clamp(u / 6.6)) * .96) , X = lerp(roadX(D) + w.X, HOUSE.X + 3 + w.X * .6, ss(.55, 1, (D - 20) / (HOUSE.D - 26))), [x, y] = cam.P2(gx(X, D), gy(D)), s = sc(D) * z, ph = u * 4.4 + w.ph;
      figure(ctx, x, y, s, g => backFigure(g, ph, { k: w.k }), { rim: on > .1 ? 'rgb(255,190,110)' : 'rgb(140,180,172)', rimA: .55 + .45 * on, rimW: .04, rimShifts: [[0, 1.4], [.8, 0], [-.8, 0]], body: 'rgb(8,14,14)', alpha: fade }); }
    // after the question the frame settles for the end card: below the house a calm dark
    { const k = ss(3.4, 5.4, u); if (k > 0) { const y0 = hzF + H * .06, g = ctx.createLinearGradient(0, y0, 0, y0 + H * .25); g.addColorStop(0, 'rgba(6,10,10,0)'); g.addColorStop(1, `rgba(6,10,10,${.7 * k})`); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); } }
    finish(ctx, u, .5, false, 1 - ss(4.2, 6, u));
  }

  function scene(ctx, u, mode) {
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (mode === 'speak') speak(ctx, u); else if (mode === 'lamp') lamp(ctx, u); else walk(ctx, u);
    ctx.restore(); }
  window.__Emmaus = { build, scene, E, R, SV };
})();

async function buildEmmausOil() { return window.__Emmaus.build(); }
function emmausOil(ctx, u, mode) { return window.__Emmaus.scene(ctx, u, mode); }
