/* oil-rock.js — 「그리스도」 3부, 가이사랴 빌립보의 바위 벼랑 (마 16:13–23), 카라바조풍 테네브리즘 유화 (kit-oilpaint.js key 'caravaggio').
   One light: the setting sun, low on the right. A huge rock cliff fills the left of the frame (a dark cave mouth at its foot — no
   temple, no carving): thick ochre and orange paint where the sun strikes it, thin black-brown glazes in its shadow, a few great
   cracks. At its foot the band of thirteen in three depths (three near and large, five in the middle, five small by the cave),
   sitting, leaning on staffs, turned to one another — robed, head-covered silhouettes, no faces, no hands drawn; the sun rims their
   heads, shoulders and the tops of their arms and the rim thins away down the body (the lesson of the first scene).
     'confess'  (u 0–7.7, video 51.4–59.1): the band under the cliff in the sunset (N07); at Q2 (u≈3.5) Peter steps forward into
                the light and the light swells over the rock.
     'foretell' (u 0–8.0, 59.1–67.1): the sun goes down; their shadows stretch long over the ground; Jesus (a silhouette like the
                rest, no halo) stands a little ahead, his hand moving as he speaks; the light ebbs.
     'protest'  (u 0–4.3, 67.1–71.4, 마 16:22 "베드로가 예수를 붙들고 항변하여"): two figures, nearer. Jesus, turned toward the sun, goes
                on; Peter comes in from the side, turned back to him, takes his upper arm with one hand and holds the other up before
                his chest to stop him, leaning in and pulling; the last of the sun between their heads.
     'alone'    (u 0–4.6, 71.4–76.0): Peter alone under the darkened rock; the afterglow fading; the first star.
   Three plates painted with the same seed (sun · dusk · night), crossfaded as the light goes. Figures are drawn over the painting
   (sprites made once; the two in 'protest' are solved each frame with fixed bone lengths). Closed form: rockOil(ctx, u, mode)
   depends only on (u, mode). No words are drawn. Needs Pilot (lib.js) and kit-oilpaint.js (window.OIL). */
const RCK = {};

function rockLayout() {
  const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v';
  const L = V ? { hz: H * .5, sun: [W * .74, H * .47], sunR: W * .045, groundY: H * .54, fh: H * .062, cliffX: W * .57 }
              : { hz: H * .54, sun: [W * .76, H * .48], sunR: H * .05, groundY: H * .6, fh: H * .1, cliffX: W * .56 };
  return Object.assign(L, { W, H, V, S: 1.6 });
}

// a robed, head-covered person in units of the height (feet at the origin, y up negative), through a map P(x, y) → canvas:
// a head on a neck (never a bullet), the head cloth falling behind (its length and its peak differ person to person), sloping
// shoulders, the robe widening to a hem that flares or hangs. face +1 looks right, -1 left; lean moves the top forward; sit folds
// the figure (seated on the ground, knees toward its face); staff adds a staff held in front
function rockPerson(P, o) {
  const { w = 1, lean: l = 0, face: f = 1, staff = false, sit = false, cloth = 1, hem = 1, peak = 0 } = o, q = new Path2D();
  const add = pts => { pts = pts.map(([x, y]) => P(x, y)); let a = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; } if (a < 0) pts.reverse();
    const n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2]; q.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) q.quadraticCurveTo(pts[i][0], pts[i][1], ...m(i)); q.closePath(); };
  const k = sit ? .62 : 1, Y = y => y * k, hx = l * .95 + .016 * f;
  if (sit) add([[-.24 * f, .0], [-.24 * f, -.04], [-.16 * f, -.12], [.12 * f, -.16], [.3 * f, -.13], [.34 * f, -.03], [.3 * f, .0]]);   // the lap and knees on the ground
  add([[0, 0], [-.2 * w * hem, -.005], [-.2 * w * hem, -.06], [-.185 * w + l * .4, Y(-.42)], [-.15 * w + l * .72, Y(-.735)], [-.1 * w + l * .8, Y(-.79)], [-.042 + hx, Y(-.825)], [.042 + hx, Y(-.825)],
    [.1 * w + l * .8, Y(-.79)], [.15 * w + l * .72, Y(-.735)], [.185 * w + l * .4, Y(-.42)], [.21 * w * hem, -.06], [.21 * w * hem, -.005]]);
  add(Array.from({ length: 18 }, (_, i) => { const a = i / 18 * 6.283; return [hx + Math.cos(a) * .068, Y(-.905) + Math.sin(a) * .074 * Math.min(1, k + .3)]; }));   // the head
  add([[hx + .02 * f, Y(-.978) - peak], [hx - .07 * f, Y(-.95)], [hx - .1 * f, Y(-.87)], [(-.14 * w * f + l * .7) * (.7 + .3 * cloth), Y(-.75 + .2 * (cloth - 1))], [hx - .01 * f, Y(-.8)]]);   // the cloth falling behind
  if (staff) add([[.2 * f + .012, 0], [.24 * f + .012, Y(-1.08)], [.24 * f - .012, Y(-1.08)], [.2 * f - .012, 0]]);
  return q;
}
// a rim for a set of paths on a canvas: the shape minus itself shifted away from the light (so the band sits on the edges that
// face it), kept strong at the top (head, shoulders, the tops of the arms) and thinning to nothing down the body, softly blurred
function rockRim(w, h, paths, light, d, y0, y1, col = '#ffc070', tf = null) {
  const { canvas } = Pilot, ll = Math.hypot(...light), lx = light[0] / ll, ly = light[1] / ll;
  const m = canvas(w, h), g = m.getContext('2d'); if (tf) g.setTransform(...tf); g.fillStyle = '#fff'; paths.forEach(p => g.fill(p));
  const b = canvas(w, h), r = b.getContext('2d'); r.drawImage(m, 0, 0); r.globalCompositeOperation = 'destination-out'; r.drawImage(m, -lx * d, -ly * d);
  r.globalCompositeOperation = 'source-in'; r.fillStyle = col; r.fillRect(0, 0, w, h);
  r.globalCompositeOperation = 'destination-in'; const gr = r.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(0,0,0,.4)'); gr.addColorStop(.36, 'rgba(0,0,0,1)'); gr.addColorStop(.6, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); r.fillStyle = gr; r.fillRect(0, 0, w, h);   // softer on the head (no halo ring), strongest on the shoulders, gone below
  const out = canvas(w, h), o = out.getContext('2d'); o.filter = `blur(${(d * 1.6).toFixed(1)}px)`; o.globalAlpha = .55; o.drawImage(b, 0, 0); o.filter = `blur(${(d * .25).toFixed(1)}px)`; o.globalAlpha = 1; o.drawImage(b, 0, 0);
  return out;
}
// faint folds in the robe (lighter brown curves from the waist to the hem), so the dark is cloth, not a hole
function rockFolds(g, P, o, a = .3) {
  const { w = 1, lean: l = 0, sit = false } = o, k = sit ? .62 : 1; g.save(); g.strokeStyle = `rgba(74,50,34,${a})`; g.lineCap = 'round';
  for (const [x0, x1, wd] of [[-.06, -.1, .012], [.04, .08, .01], [.12, .16, .008]]) { const A = P(x0 * w + l * .35, -.45 * k), B = P(x1 * w, -.03), C = P((x0 + x1) / 2 * w + .02 + l * .2, -.25 * k);
    const s = Math.hypot(P(0, 0)[0] - P(1, 0)[0], P(0, 0)[1] - P(1, 0)[1]); g.lineWidth = wd * s; g.beginPath(); g.moveTo(...A); g.quadraticCurveTo(...C, ...B); g.stroke(); }
  g.restore();
}
// a figure sprite: body (very dark brown with its folds) and rim, each on a canvas of its own (feet at foot)
function rockSprite(o, hpx, sc, light = [1, -.2]) {
  const { canvas } = Pilot, bw = Math.ceil(1.0 * hpx * sc), bh = Math.ceil(1.3 * hpx * sc), foot = [bw / 2, bh - .12 * hpx * sc], s = hpx * sc;
  const P = (x, y) => [foot[0] + x * s, foot[1] + y * s], path = rockPerson(P, o);
  const body = canvas(bw, bh), b = body.getContext('2d'); b.fillStyle = '#1c120b'; b.fill(path); b.save(); b.clip(path); rockFolds(b, P, o, .22); b.restore();
  const k = o.sit ? .62 : 1, rim = rockRim(bw, bh, [path], light, .03 * s, foot[1] - 1.0 * k * s, foot[1] - .2 * s);
  return { body, rim, bw, bh, sc, foot };
}

async function buildRockOil() {
  const { clamp, lerp, rng, canvas } = Pilot, L = rockLayout(), { W, H, V, S, hz } = L, PW = Math.round(W * S), PH = Math.round(H * S), R0 = V ? W : H;
  RCK.L = L; RCK.hillY = x => hz - .012 * H - .01 * H * Math.sin(x / (.11 * W)) - .006 * H * Math.sin(x / (.037 * W) + 1);
  // the cliff's outline (frame px): its top off the frame, its sunward face stepping down to the ground on the right
  const cliff = (() => { const p = new Path2D(), cx = L.cliffX, r = rng(5); p.moveTo(-20, -20); p.lineTo(cx - .02 * W, -20);
    const pts = V ? [[cx - .01 * W, .06 * H], [cx + .04 * W, .14 * H], [cx, .22 * H], [cx + .05 * W, .3 * H], [cx + .02 * W, .38 * H], [cx + .07 * W, .45 * H], [cx + .1 * W, L.groundY]]
                  : [[cx - .01 * W, .08 * H], [cx + .03 * W, .2 * H], [cx, .3 * H], [cx + .04 * W, .42 * H], [cx + .06 * W, .5 * H], [cx + .09 * W, L.groundY]];
    const face = new Path2D(); face.moveTo(cx - .02 * W, -20); for (const [x, y] of pts) { const q = [x + (r() - .5) * .01 * W, y]; p.lineTo(...q); face.lineTo(...q); } p.lineTo(-20, L.groundY + .02 * H); p.closePath(); RCK.face = face; RCK.cliff = p; return p; })();
  const cave = V ? [W * .3, L.groundY, W * .13, H * .1] : [W * .28, L.groundY, W * .075, H * .17];   // the cave mouth: centre x, base y, half width, height

  function plate(ph) {   // ph 0 sun · 1 dusk (the sun on the hill line) · 2 night (afterglow)
    const c = canvas(PW, PH), g = c.getContext('2d'); g.save(); g.scale(S, S);
    const radial = (x, y, R, stops, op = 'source-over') => { g.save(); g.globalCompositeOperation = op; const gr = g.createRadialGradient(x, y, 0, x, y, R); stops.forEach(([k, col]) => gr.addColorStop(k, col)); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R); g.restore(); };
    const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([k, col]) => gr.addColorStop(k, col)); return gr; };
    const blur = b => `blur(${(b * S).toFixed(1)}px)`;
    const [sx, sy0] = L.sun, sy = sy0 + [0, .045 * H, .09 * H][ph];
    // the sky
    const SK = [[['#3a2230', 0], ['#94402e', .45], ['#ee8a44', .8], ['#ffdc9a', 1]], [['#2a1c30', 0], ['#843838', .45], ['#e07040', .82], ['#ffae64', 1]], [['#222a48', 0], ['#4a4664', .45], ['#b06460', .78], ['#f09a5c', 1]]][ph];
    g.fillStyle = lin(0, 0, 0, hz, SK.map(([col, k]) => [k, col])); g.fillRect(0, 0, W, hz + 4);
    radial(sx, hz, .9 * R0, [[0, ['rgba(255,210,140,.9)', 'rgba(255,160,90,.8)', 'rgba(240,140,90,.6)'][ph]], [.4, ['rgba(240,140,70,.35)', 'rgba(220,100,60,.32)', 'rgba(160,90,80,.28)'][ph]], [1, 'rgba(0,0,0,0)']]);
    if (ph === 2) { const r = rng(4); for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(220,226,255,${.15 + .3 * r()})`; g.beginPath(); g.arc(r() * W, r() * hz * .5, .6 + r() * .8, 0, 6.283); g.fill(); } }
    // the far hills on the horizon (the sun goes down behind them)
    const hillY = RCK.hillY;
    g.fillStyle = ['#3a1c1a', '#2a1418', '#1e1620'][ph]; g.beginPath(); g.moveTo(L.cliffX - .1 * W, hz + .02 * H); for (let x = L.cliffX - .1 * W; x <= W + 10; x += 8) g.lineTo(x, hillY(x)); g.lineTo(W + 10, hz + .05 * H); g.lineTo(L.cliffX - .1 * W, hz + .05 * H); g.fill();
    g.strokeStyle = ['rgba(255,190,110,.6)', 'rgba(255,140,80,.45)', 'rgba(170,100,80,.3)'][ph]; g.lineWidth = 2; g.beginPath(); for (let x = L.cliffX - .1 * W; x <= W + 10; x += 8) x === L.cliffX - .1 * W ? g.moveTo(x, hillY(x)) : g.lineTo(x, hillY(x)); g.stroke();
    // the ground: warm where the sun grazes it, dark toward us
    g.fillStyle = lin(0, L.groundY - .02 * H, 0, H, [[0, ['#5a3018', '#5e3620', '#4e3e44'][ph]], [.3, ['#3a2010', '#3e2414', '#342a30'][ph]], [1, '#140c09']]); g.fillRect(0, hz, W, H - hz);
    radial(sx - .1 * W, L.groundY + .02 * H, 1.1 * R0, [[0, ['rgba(240,150,70,.7)', 'rgba(220,110,60,.6)', 'rgba(170,100,90,.45)'][ph]], [1, 'rgba(0,0,0,0)']]);
    // rock ledges across the ground, their tops catching the light; dry grass in tufts, larger toward us
    { const r = rng(7), lit = ['255,180,100', '240,130,80', '170,120,120'][ph];
      for (let i = 0; i < 9; i++) { const y = L.groundY + (.06 + .9 * (i / 9) ** 1.2) * (H - L.groundY), x0 = (r() - .3) * W, wd = (.3 + .5 * r()) * W, th = (.012 + .02 * r()) * H * (1 + 1.5 * (y - L.groundY) / H);
        const sh = new Path2D(); sh.moveTo(x0, y); for (let x = x0; x <= x0 + wd; x += wd / 8) sh.lineTo(x, y - th * (.3 + .7 * Math.sin((x - x0) / wd * Math.PI)) + (r() - .5) * th * .3); sh.lineTo(x0 + wd, y + th * .4); sh.lineTo(x0, y + th * .5); sh.closePath();
        g.fillStyle = `rgba(14,8,5,${.55 + .25 * r()})`; g.fill(sh);
        g.save(); g.clip(sh); g.filter = blur(.004 * R0); g.strokeStyle = `rgba(${lit},${.35 * clamp(1.2 - Math.abs(x0 + wd - sx) / W)})`; g.lineWidth = .006 * R0; g.beginPath(); for (let x = x0; x <= x0 + wd; x += wd / 8) { const yy = y - th * (.3 + .7 * Math.sin((x - x0) / wd * Math.PI)); x === x0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); g.restore();
        g.save(); g.filter = blur(.01 * R0); g.fillStyle = 'rgba(6,3,2,.35)'; g.fillRect(x0 - .1 * W, y + th * .3, wd, th * .8); g.restore(); }
      g.lineCap = 'round';
      for (let i = 0; i < 140; i++) { const t = r() ** .7, y = L.groundY + .01 * H + t * (H - L.groundY), x = r() * W, sz = (.006 + .022 * t) * R0, n = 5 + (r() * 6 | 0), bright = clamp(1.3 - Math.abs(x - sx) / (.9 * W));
        for (let j = 0; j < n; j++) { const a = -Math.PI / 2 + (r() - .5) * 1.4, len = sz * (.6 + .8 * r()), bx = x + (r() - .5) * sz * .5;
          const gr = g.createLinearGradient(bx, y, bx + Math.cos(a) * len, y + Math.sin(a) * len); gr.addColorStop(0, 'rgba(20,12,6,.7)'); gr.addColorStop(1, `rgba(${lit},${(.25 + .4 * bright) * (ph === 2 ? .5 : 1)})`);
          g.strokeStyle = gr; g.lineWidth = Math.max(1, sz * .07); g.beginPath(); g.moveTo(bx, y); g.quadraticCurveTo(bx + Math.cos(a) * len * .5 + sz * .1, y + Math.sin(a) * len * .5, bx + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke(); } } }
    // the cliff, Caravaggio: smooth black-brown glaze in its shadow, thick ochre and orange where the sun strikes it, a few great cracks
    g.save(); g.clip(cliff);
    g.fillStyle = lin(0, 0, L.cliffX + .1 * W, 0, [[0, '#0c0705'], [.6, ['#1e1209', '#1c1009', '#1c1620'][ph]], [1, ['#3a2210', '#36200e', '#2e2430'][ph]]]); g.fillRect(-20, -20, W + 40, H);
    { const lit = [['#e08a3a', '#f2b45a'], ['#c06030', '#e08a4a'], ['#5a4450', '#7a5a60']][ph];
      g.save(); g.filter = blur(.03 * R0); g.strokeStyle = lit[0]; g.globalAlpha = [.95, .8, .5][ph]; g.lineWidth = .22 * R0; g.stroke(RCK.face); g.restore();                  // the sunlit band down the face
      g.save(); g.filter = blur(.012 * R0); g.strokeStyle = lit[1]; g.globalAlpha = [.9, .7, .35][ph]; g.lineWidth = .07 * R0; g.stroke(RCK.face); g.restore();                  // its brightest edge
      const r = rng(19); for (let i = 0; i < 12; i++) { const y = (.04 + .9 * r()) * L.groundY, x1 = L.cliffX + (r() - .2) * .06 * W, x0 = x1 - (.12 + .2 * r()) * W, th = (.008 + .016 * r()) * H;   // ledges lit on top
        g.save(); g.filter = blur(.006 * R0); g.fillStyle = lit[r() < .5 ? 0 : 1]; g.globalAlpha = [.7, .5, .25][ph] * (.6 + .4 * r()); g.beginPath(); g.moveTo(x0, y + th); g.quadraticCurveTo((x0 + x1) / 2, y - th * .4, x1, y); g.lineTo(x1, y + th * .7); g.quadraticCurveTo((x0 + x1) / 2, y + th * 1.4, x0, y + th * 1.6); g.fill();
        g.globalAlpha = .5; g.fillStyle = '#0a0503'; g.fillRect(x0, y + th * 1.5, x1 - x0, th * 1.4); g.restore(); }
      for (const [x0, y0, x1, y1] of V ? [[.5, .02, .44, .2], [.3, .08, .36, .32], [.55, .26, .5, .44], [.12, .2, .18, .4]] : [[.45, .04, .4, .28], [.25, .1, .3, .38], [.5, .3, .46, .52]]) {   // the great cracks
        const r2 = rng(Math.round(x0 * 100)), A = [x0 * W, y0 * H], B = [x1 * W, y1 * H], pts = [A]; for (let k = 1; k < 6; k++) pts.push([A[0] + (B[0] - A[0]) * k / 6 + (r2() - .5) * .03 * W, A[1] + (B[1] - A[1]) * k / 6]); pts.push(B);
        g.save(); g.filter = blur(.002 * R0); g.fillStyle = 'rgba(3,1,0,.8)'; g.beginPath(); pts.forEach((q, k) => k ? g.lineTo(q[0] - .006 * R0 * Math.sin(k / 6 * Math.PI), q[1]) : g.moveTo(...q)); for (let k = pts.length - 1; k >= 0; k--) g.lineTo(pts[k][0] + .006 * R0 * Math.sin(k / 6 * Math.PI), pts[k][1]); g.closePath(); g.fill(); g.restore();
        g.save(); g.filter = blur(.004 * R0); g.strokeStyle = `rgba(${['230,150,80', '200,110,70', '120,90,100'][ph]},.3)`; g.lineWidth = .005 * R0; g.beginPath(); pts.slice(1, 5).forEach((q, k) => k ? g.lineTo(q[0] + .01 * R0, q[1]) : g.moveTo(q[0] + .01 * R0, q[1])); g.stroke(); g.restore(); } }
    { const [cx, by, hw, ch] = cave; g.fillStyle = '#050302'; g.beginPath(); g.moveTo(cx - hw, by + 2); g.bezierCurveTo(cx - hw, by - ch * .7, cx - hw * .6, by - ch, cx, by - ch); g.bezierCurveTo(cx + hw * .6, by - ch, cx + hw, by - ch * .7, cx + hw, by + 2); g.closePath(); g.fill();
      g.strokeStyle = ['rgba(220,130,60,.4)', 'rgba(170,90,50,.3)', 'rgba(90,70,80,.18)'][ph]; g.lineWidth = .01 * R0; g.beginPath(); g.moveTo(cx + hw, by); g.bezierCurveTo(cx + hw, by - ch * .7, cx + hw * .6, by - ch, cx, by - ch); g.stroke(); }
    g.restore();
    g.fillStyle = lin(0, L.groundY - .03 * H, 0, L.groundY + .03 * H, [[0, 'rgba(6,3,2,0)'], [.5, 'rgba(6,3,2,.55)'], [1, 'rgba(6,3,2,0)']]); g.fillRect(0, L.groundY - .03 * H, L.cliffX + .1 * W, .06 * H);
    radial(sx, sy, 1.1 * R0, [[0, ['rgba(255,220,160,.35)', 'rgba(255,160,100,.25)', 'rgba(140,80,70,.12)'][ph]], [1, 'rgba(0,0,0,0)']], 'screen');
    g.restore(); return c;
  }
  const paintOpt = { key: 'caravaggio', S, seed: 21, wid: V ? 1 / 140 : 1 / 190, cell: V ? 6.5 : 6, dirAt: (x, y) => y < hz * S ? 0 : -1.4 + 1.2 * (Pilot.noise(x / 380, y / 380) - .5) };
  RCK.plates = [0, 1, 2].map(ph => OIL.paint(plate(ph), paintOpt));

  // the thirteen in three depths. [x (×W), group 0 far · 1 middle · 2 near, options]; Jesus and Peter in the middle group
  { const D = V ? [{ y: .548, h: .62 }, { y: .582, h: 1 }, { y: .632, h: 1.45 }] : [{ y: .61, h: .62 }, { y: .64, h: 1 }, { y: .72, h: 1.5 }];
    const list = V
      ? [[.2, 0, { face: 1, staff: true, cloth: 1.2 }], [.25, 0, { face: 1, sit: true }], [.3, 0, { face: -1, lean: .02 }], [.335, 0, { face: 1, lean: .02, peak: .02 }], [.39, 0, { face: 1, w: .9 }],
         [.42, 1, { face: 1, w: .95, cloth: 1.1 }], [.47, 1, { face: 1, sit: true, w: 1.1 }], [.52, 1, { face: -1, lean: .03, hem: 1.15 }], [.565, 1, { face: 1, lean: .05, staff: true }], [.61, 1, { face: 1, w: 1.05, peak: .025 }],
         [.12, 2, { face: 1, lean: .04, staff: true, cloth: 1.25 }], [.22, 2, { face: 1, sit: true, w: 1.1, hem: 1.1 }], [.3, 2, { face: -1, lean: .02, peak: .02 }]]
      : [[.25, 0, { face: 1, staff: true, cloth: 1.2 }], [.29, 0, { face: 1, sit: true }], [.33, 0, { face: -1, lean: .02 }], [.36, 0, { face: 1, lean: .02, peak: .02 }], [.4, 0, { face: 1, w: .9 }],
         [.45, 1, { face: 1, w: .95, cloth: 1.1 }], [.49, 1, { face: 1, sit: true, w: 1.1 }], [.53, 1, { face: -1, lean: .03, hem: 1.15 }], [.565, 1, { face: 1, lean: .05, staff: true }], [.6, 1, { face: 1, w: 1.05, peak: .025 }],
         [.16, 2, { face: 1, lean: .04, staff: true, cloth: 1.25 }], [.24, 2, { face: 1, sit: true, w: 1.1, hem: 1.1 }], [.31, 2, { face: -1, lean: .02, peak: .02 }]];
    const r = rng(13);
    RCK.band = list.map(([x, gi, o]) => { const h = L.fh * D[gi].h * (.94 + .12 * r()); return { x: x * W, y: D[gi].y * H + (r() - .5) * .004 * H, h, o, gi, sp: rockSprite(o, h, 3) }; });
    RCK.jesus = 5; RCK.peter = 9;
    RCK.peterBig = rockSprite(RCK.band[9].o, L.fh * 1.3, 3, [.8, -.5]); }
  { const g = canvas(256, 256), x = g.getContext('2d'), im = x.createImageData(256, 256), r = rng(91); for (let i = 0; i < 65536; i++) { const v = 128 + (r() - .5) * 120; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0); RCK.grain = g; }
}

function rockCam(keys, u) {   // Catmull-Rom through [t, fx, fy, z] keys (velocity continuous)
  let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)], t = Pilot.clamp((u - k1[0]) / (k2[0] - k1[0]));
  return [1, 2, 3].map(j => { const p0 = k0[j], p1 = k1[j], p2 = k2[j], p3 = k3[j], d1 = k1 === k0 ? (p2 - p1) : (p2 - p0) / 2 * (k2[0] - k1[0]) / (k2[0] - k0[0]) * 2, d2 = k3 === k2 ? (p2 - p1) : (p3 - p1) / 2 * (k2[0] - k1[0]) / (k3[0] - k1[0]) * 2;
    const t2 = t * t, t3 = t2 * t; return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * d1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * d2; });
}
// two-bone IK: from shoulder s to target t with bone lengths a, b; bend = +1/-1 picks the elbow side
function rockIK(s, t, a, b, bend) {
  const dx = t[0] - s[0], dy = t[1] - s[1], dd = Math.hypot(dx, dy), d = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, dd)), ang = Math.atan2(dy, dx);
  const c = (a * a + d * d - b * b) / (2 * a * d), e = ang + bend * Math.acos(Math.max(-1, Math.min(1, c)));
  const el = [s[0] + Math.cos(e) * a, s[1] + Math.sin(e) * a], k = d / (dd || 1);
  return { el, wr: [s[0] + dx * k, s[1] + dy * k] };
}

function rockOil(ctx, u, mode = 'confess') {
  const { clamp, lerp, ss } = Pilot, L = RCK.L, { W, H, V } = L, S = L.S, R0 = V ? W : H;
  // which light (sun 0 · dusk 1 · night 2) and where the sun's disc is: in 'foretell' it really goes down behind the hills (u 0–4)
  const set = mode === 'foretell' ? ss(0, 4, u) : mode === 'confess' ? 0 : 1;
  const ph = mode === 'confess' ? 0 : mode === 'foretell' ? 1.1 * set + .15 * ss(4, 8, u) : mode === 'protest' ? 1.2 + .1 * ss(0, 4.3, u) : 1.3 + .7 * ss(0, 3.5, u);
  const hill = RCK.hillY(L.sun[0]), sunY = lerp(L.sun[1], hill + 1.25 * L.sunR, set), sunA = clamp(1.3 - ph);
  const view = (fx, fy, z) => { const a = Math.floor(ph), k = ph - a; OIL.view(ctx, RCK.plates[Math.min(2, a)], S, fx * S, fy * S, z);
    if (k > 0 && a < 2) { ctx.save(); ctx.globalAlpha = k; OIL.view(ctx, RCK.plates[a + 1], S, fx * S, fy * S, z); ctx.restore(); } };
  let fx, fy, z;
  if (mode === 'protest') [fx, fy, z] = rockCam([[0, W * .6, L.hz - .01 * H, 1.32], [4.3, W * .6, L.hz - .012 * H, 1.4]], u);
  else { const lo = V ? H * .56 : H * .58, KEYS = { confess: [[0, W * .48, lo, 1.08], [7.7, W * .52, lo, 1.16]], foretell: [[0, W * .52, lo, 1.16], [8, W * .45, lo, 1.1]], alone: [[0, W * .55, H * .5, 1.12], [4.6, W * .53, H * .5, 1.22]] }[mode];
    [fx, fy, z] = rockCam(KEYS, u); }
  fx = clamp(fx, W / 2 / z, W - W / 2 / z); fy = clamp(fy, H / 2 / z, H - H / 2 / z);
  const sc = (x, y) => [W / 2 + (x - fx) * z, H / 2 + (y - fy) * z], cam = () => { ctx.translate(W / 2 - fx * z, H / 2 - fy * z); ctx.scale(z, z); };
  view(fx, fy, z);
  // the sun's disc, clipped by the hill line so it sinks behind it; its glow
  if (mode !== 'alone' && set < 1) { ctx.save(); cam(); const p = new Path2D(); p.moveTo(L.cliffX - .2 * W, -10); for (let x = L.cliffX - .2 * W; x <= W + 10; x += 8) p.lineTo(x, RCK.hillY(x) + 1); p.lineTo(W + 10, -10); p.closePath(); ctx.clip(p);
    const gr = ctx.createRadialGradient(L.sun[0], sunY, 0, L.sun[0], sunY, L.sunR * 3); gr.addColorStop(0, 'rgba(255,246,214,1)'); gr.addColorStop(.3, 'rgba(255,214,150,.7)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); ctx.fillStyle = gr; ctx.fillRect(L.sun[0] - L.sunR * 3, sunY - L.sunR * 3, L.sunR * 6, L.sunR * 6);
    ctx.fillStyle = set > .5 ? '#ffc880' : '#fff2d0'; ctx.beginPath(); ctx.arc(L.sun[0], sunY, L.sunR, 0, 6.283); ctx.fill(); ctx.restore(); }
  { const [x, y] = sc(L.sun[0], Math.min(sunY, hill)); ctx.save(); ctx.globalCompositeOperation = 'screen'; const R = .5 * R0 * z, gr = ctx.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, `rgba(255,220,150,${.38 * sunA})`); gr.addColorStop(.3, `rgba(255,150,80,${.14 * sunA})`); gr.addColorStop(1, 'rgba(255,120,60,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); }

  if (mode === 'protest') rockProtest(ctx, u, sc, z);
  else {
    // confess: at Q2 Peter steps out of the band toward the light, and the light swells over the rock above them
    const step = mode === 'confess' ? ss(3.3, 4.6, u) : 1, swell = mode === 'confess' ? ss(3.4, 5.4, u) * (1 - .3 * ss(6, 7.7, u)) : 0;
    if (swell > 0) { const [x, y] = sc(L.cliffX - .1 * W, L.groundY - .2 * H); ctx.save(); ctx.globalCompositeOperation = 'screen'; const R = .55 * R0 * z, gr = ctx.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, `rgba(255,190,110,${.45 * swell})`); gr.addColorStop(.5, `rgba(240,140,70,${.15 * swell})`); gr.addColorStop(1, 'rgba(200,100,50,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    const dim = mode === 'alone' ? .6 * (1 - .35 * ss(0, 4.6, u)) : mode === 'foretell' ? 1 - .55 * set : 1;
    // the low sun throws their shadows long: over the ground (to the left) and, in 'foretell', up the rock wall behind them; they go with the sun
    const sunUp = mode === 'alone' ? 0 : 1 - set, gLen = mode === 'foretell' ? lerp(1.6, 4.5, set) : 1.4, wall = mode === 'foretell' ? ss(0, .8, u) * (1 - ss(3.2, 4.6, u)) : mode === 'confess' ? .35 : 0;
    const who = mode === 'alone' ? [RCK.peter] : RCK.band.map((_, i) => i);
    const placed = who.map(i => { const f = RCK.band[i]; let x = f.x, y = f.y;
      if (i === RCK.peter) { x += .085 * W * step; y += .012 * H * step; }
      if (i === RCK.jesus && mode === 'foretell') { x += .015 * W; y += .004 * H; }
      if (mode === 'alone') { x = W * .47; y = L.groundY + .045 * H; }
      return { i, f, x, y, sp: mode === 'alone' ? RCK.peterBig : f.sp }; }).sort((a, b) => a.y - b.y);
    if (wall > 0) { ctx.save(); cam(); ctx.clip(RCK.cliff); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .42 * wall;   // shadows on the rock face (the middle group's, nearest the light)
      for (const { x, y, sp, f } of placed) { if (f.gi !== 1) continue; const st = lerp(1.3, 2.3, set), s = 1 / sp.sc, ox = x - (.05 + .07 * set) * W - (f.gi === 2 ? .04 * W : 0), oy = L.groundY + .004 * H;
        if (ox > L.cliffX - .03 * W) continue;   // a shadow that would fall past the rock's edge (into the corner of its foot) is not drawn
        ctx.save(); ctx.translate(ox, oy); ctx.transform(s * st * 1.5, 0, -s * st * .55, s * st, 0, 0); ctx.drawImage(sp.body, -sp.foot[0], -sp.foot[1]); ctx.restore(); }
      ctx.restore(); }
    for (const { i, f, x, y, sp } of placed) {
      const [px, py] = sc(x, y), s = z / sp.sc, k = Math.sin((u + i * 1.7) * 1.1) * .004;
      if (sunUp > .02) { ctx.save(); ctx.globalAlpha = .5 * sunUp; ctx.globalCompositeOperation = 'multiply'; ctx.setTransform(s * .12, s * .3, s * gLen * .9, s * .1 * gLen, px, py); ctx.drawImage(sp.body, -sp.foot[0], -sp.foot[1]); ctx.restore(); }
      ctx.save(); ctx.translate(px, py); ctx.scale(s, s); ctx.rotate(k); ctx.drawImage(sp.body, -sp.foot[0], -sp.foot[1]);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = dim * (i === RCK.peter && mode === 'confess' ? 1 + 1.4 * step : 1); ctx.drawImage(sp.rim, -sp.foot[0], -sp.foot[1]);
      if (i === RCK.peter && mode === 'confess' && step > 0) ctx.drawImage(sp.rim, -sp.foot[0], -sp.foot[1]);
      ctx.restore();
      if (i === RCK.jesus && mode === 'foretell') { const h = f.h * z, a = -.35 - .35 * (.5 + .5 * Math.sin(u * 1.4)) * ss(.6, 1.6, u), sx2 = px + .1 * h, sy2 = py - .7 * h, el = [sx2 + .06 * h, sy2 + .2 * h], wr = [el[0] + Math.cos(a) * .17 * h, el[1] + Math.sin(a) * .17 * h];
        ctx.save(); ctx.strokeStyle = '#1c120b'; ctx.lineCap = 'round'; ctx.lineWidth = .06 * h; ctx.beginPath(); ctx.moveTo(sx2, sy2); ctx.lineTo(...el); ctx.lineTo(...wr); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,180,100,${.45 * dim})`; ctx.lineWidth = .016 * h; ctx.beginPath(); ctx.moveTo(el[0] + .02 * h, el[1] - .012 * h); ctx.lineTo(wr[0] + .01 * h, wr[1] - .016 * h); ctx.stroke(); ctx.restore(); }
    }
    // confess: a pool of light on the ground where Peter steps
    if (mode === 'confess' && step > 0) { const [x, y] = sc(RCK.band[RCK.peter].x + .085 * W, RCK.band[RCK.peter].y + .012 * H); ctx.save(); ctx.globalCompositeOperation = 'screen'; const R = .12 * R0 * z, gr = ctx.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, `rgba(255,200,120,${.3 * step})`); gr.addColorStop(1, 'rgba(255,160,90,0)'); ctx.fillStyle = gr; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); ctx.restore(); }
    if (mode === 'alone') { const a = ss(1.2, 2.6, u), [x, y] = sc(W * .7, H * .2); if (a > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const tw = .85 + .15 * Math.sin(u * 7);
      const gr = ctx.createRadialGradient(x, y, 0, x, y, 30 * z); gr.addColorStop(0, `rgba(230,236,255,${.9 * a * tw})`); gr.addColorStop(.15, `rgba(200,214,255,${.35 * a})`); gr.addColorStop(1, 'rgba(160,180,255,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 30 * z, y - 30 * z, 60 * z, 60 * z);
      ctx.strokeStyle = `rgba(230,236,255,${.35 * a})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 14 * z, y); ctx.lineTo(x + 14 * z, y); ctx.moveTo(x, y - 14 * z); ctx.lineTo(x, y + 14 * z); ctx.stroke(); ctx.restore(); } }
  }
  // dust in the low light
  { const r = Pilot.rng(43), [sx, sy] = sc(L.sun[0], sunY); ctx.save(); ctx.globalCompositeOperation = 'screen'; const T = u + { confess: 0, foretell: 7.7, protest: 15.7, alone: 20 }[mode];
    for (let i = 0; i < 60; i++) { const x = W / 2 + (r() * W - fx + Math.sin(T * .3 + i) * 12) * z, y = H / 2 + (L.groundY - r() * .25 * H - ((T * 4 + r() * 120) % 120) + 60 - fy) * z, d = Math.hypot(x - sx, y - sy) / (R0 * .8 * z);
      const a = clamp(1 - d) * (.3 + .3 * r()) * clamp(1.4 - ph); if (a < .01) continue; ctx.fillStyle = `rgba(255,214,160,${a})`; ctx.beginPath(); ctx.arc(x, y, (.8 + r() * 1.2) * z * .7, 0, 6.283); ctx.fill(); } ctx.restore(); }
  // the sky's glow lifts the darks (a little always, more as the light goes: the scene darkens, it never goes black)
  { const lift = .1 + .42 * clamp(ph - .45); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = ph < .5 ? `rgba(120,80,50,${lift})` : `rgba(100,76,84,${lift})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  OIL.varnish(ctx, .35, [120, 66, 28]);
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  { const Rr = Math.hypot(W, H) * .6, gr = ctx.createRadialGradient(W / 2, H * .44, Rr * .35, W / 2, H * .44, Rr); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(170,152,140)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  { const y0 = V ? H * .6 : H * .72, y1 = V ? H * .8 : H, b = ctx.createLinearGradient(0, y0, 0, y1); b.addColorStop(0, '#fff'); b.addColorStop(1, 'rgb(176,166,156)'); ctx.fillStyle = b; ctx.fillRect(0, y0, W, y1 - y0); if (V) { ctx.fillStyle = 'rgb(176,166,156)'; ctx.fillRect(0, y1, W, H - y1); } }
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07; const o = Math.floor(u * 24); ctx.translate(-((o * 73) % 256), -((o * 151) % 256));
  ctx.fillStyle = ctx.createPattern(RCK.grain, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
}

// 'protest' (마 16:22): two small figures (as in the first scene), the last light on the horizon between them. Jesus (left), turned
// toward the light, goes on; Peter comes in from the light's side, turned back to him: his near arm reaches across the gap of sky and
// takes Jesus's upper arm just below the shoulder (the line of that arm clear against the sky), his other hand comes up before his
// chest, palm out — a stop; he leans in and pulls. Fixed bone lengths (two-bone IK from each shoulder to its target).
function rockProtest(ctx, u, sc, z) {
  const { ss, clamp, lerp } = Pilot, L = RCK.L, { W, H, V } = L;
  const h = V ? H * .2 : H * .3, cx = W * .5, fy = V ? H * .58 : H * .7, P = (x, y) => [cx + x * h, fy + y * h];   // units of figure height; head tops near 0.38 H
  const step = ss(0, 1.1, u), grip = ss(.55, 1.2, u), block = ss(.8, 1.5, u), pull = ss(1.3, 3.1, u) * (1 - .3 * ss(3.6, 4.3, u));
  const jx = -.36, jl = .035 - .035 * pull, jo = { w: .92, lean: jl, face: 1, cloth: 1.05, hem: 1.05 };
  const jesus = rockPerson((x, y) => P(jx + x, y), jo);
  const sJ = P(jx + .085 + jl * .72, -.745), aJ = rockIK(sJ, P(jx + .11 + .02 * pull, -.42), .19 * h, .16 * h, -1);   // his near arm hangs at his side
  const G = [sJ[0] + (aJ.el[0] - sJ[0]) * .3 + .045 * h, sJ[1] + (aJ.el[1] - sJ[1]) * .3];   // the grip: the outside of his upper arm, a hand below the shoulder
  const px = lerp(.5, .34, step), pl = -lerp(0, .1, step) - .025 * pull, po = { w: .95, lean: pl, face: -1, cloth: .9, hem: 1.0, peak: .015 };
  const Pp = (x, y) => P(px + x, y + .01), peter = rockPerson(Pp, po);
  const sP1 = Pp(-.085 + pl * .72, -.74), sP2 = Pp(-.06 + pl * .72, -.75);
  const rest1 = Pp(-.12 + pl * .4, -.47), rest2 = Pp(-.09 + pl * .4, -.46);
  const t1 = [lerp(rest1[0], G[0], grip), lerp(rest1[1], G[1], grip)], aP1 = rockIK(sP1, t1, .19 * h, .16 * h, -1);
  const stopAt = Pp(-.235 + pl * .9, -.69), t2 = [lerp(rest2[0], stopAt[0], block), lerp(rest2[1], stopAt[1], block)], aP2 = rockIK(sP2, t2, .19 * h, .16 * h, -1);
  const limb = (p, a, b, w0, w1) => { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); p.moveTo(a[0] + Math.cos(ang - Math.PI / 2) * w0, a[1] + Math.sin(ang - Math.PI / 2) * w0); p.arc(b[0], b[1], w1, ang - Math.PI / 2, ang + Math.PI / 2); p.arc(a[0], a[1], w0, ang + Math.PI / 2, ang + Math.PI * 1.5); p.closePath(); };
  const jArm = new Path2D(); limb(jArm, sJ, aJ.el, .048 * h, .042 * h); limb(jArm, aJ.el, aJ.wr, .04 * h, .03 * h); jArm.moveTo(aJ.wr[0] + .028 * h, aJ.wr[1] + .02 * h); jArm.ellipse(aJ.wr[0] + .006 * h, aJ.wr[1] + .02 * h, .024 * h, .032 * h, .2, 0, 6.283);
  const pArms = new Path2D(); limb(pArms, sP1, aP1.el, .046 * h, .04 * h); limb(pArms, aP1.el, aP1.wr, .038 * h, .028 * h); limb(pArms, sP2, aP2.el, .044 * h, .038 * h); limb(pArms, aP2.el, aP2.wr, .036 * h, .027 * h);
  pArms.moveTo(aP1.wr[0] + .032 * h, aP1.wr[1]); pArms.ellipse(aP1.wr[0], aP1.wr[1], .032 * h, .026 * h, .4, 0, 6.283);   // the gripping hand round the arm
  { const [hx, hy] = aP2.wr, a = -1.75; pArms.moveTo(hx + .026 * h, hy); pArms.ellipse(hx, hy - .02 * h, .026 * h, .042 * h, .1, 0, 6.283);   // the open hand, fingers up
    pArms.moveTo(hx + Math.cos(a + .9) * .03 * h + .01 * h, hy + .004 * h); pArms.ellipse(hx + Math.cos(a + .9) * .03 * h, hy + .004 * h, .01 * h, .016 * h, -.6, 0, 6.283); }
  // the last light on the horizon between them (the sun just gone): a bright seam and its glow behind the gap
  { const gx = cx, gy = fy - .45 * h, a = clamp(1.2 - .5 * ss(0, 4.3, u)); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    let gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, .9 * h); gr.addColorStop(0, `rgba(255,220,160,${.55 * a})`); gr.addColorStop(.25, `rgba(255,160,90,${.25 * a})`); gr.addColorStop(1, 'rgba(255,120,60,0)'); ctx.fillStyle = gr; ctx.fillRect(gx - .9 * h, gy - .9 * h, 1.8 * h, 1.8 * h); ctx.restore(); }
  // their shadows toward us on the ground, then the bodies (very dark brown, a few folds), Jesus behind, Peter nearer
  for (const [path, arms, Pm, o] of [[jesus, jArm, (x, y) => P(jx + x, y), jo], [peter, pArms, Pp, po]]) {
    ctx.save(); ctx.fillStyle = '#1c120b'; ctx.fill(path); ctx.fill(arms); ctx.clip(path); rockFolds(ctx, Pm, o, .2); ctx.restore(); }
  // rims from the light between them (Jesus's right edges, Peter's left), strong on shoulders and the tops of the arms, thinning down
  const rimA = clamp(1.2 - .45 * ss(2.5, 4.3, u)), top = fy - 1.0 * h, bot = fy - .35 * h;
  const rJ = rockRim(W, H, [jesus, jArm], [1, -.12], .035 * h, top, bot), rP = rockRim(W, H, [peter, pArms], [-1, -.12], .035 * h, top, bot);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = rimA; ctx.drawImage(rJ, 0, 0); ctx.drawImage(rP, 0, 0); ctx.restore();
  RCK.lastPose = { grip: G, gripHand: aP1.wr, stopHand: aP2.wr, elbows: [aP1.el, aP2.el, aJ.el], shoulders: [sP1, sP2, sJ] };   // for the body check
}
