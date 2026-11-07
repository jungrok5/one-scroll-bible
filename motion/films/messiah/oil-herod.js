/* oil-herod.js — 「메시아」 3차, 헤롯의 궁 (마 2:1–8), 카라바조풍 테네브리즘 유화 (kit-oilpaint.js key 'caravaggio').
   After Caravaggio's night interiors: one warm fire per area, black-brown darks that eat half the frame, ochre and vermilion where
   the fire touches cloth and stone. Two shots, both lit by fire only:
     'hall'   (~4 s, under "유대인의 왕으로 나신 이가 어디 계시냐 … 경배하러 왔노라"): a deep stone throne hall. Far end: the king on a
              raised throne, in shadow, a brazier on the steps below him throwing his shadow huge onto the red curtain behind.
              Near us, three travellers from the east (tall headcloths, no crowns, no halos) in a pool of firelight, one bowing,
              one asking. The fire on the right breathes; when the question lands (HOIL.flinch) the brazier on the steps gusts
              and the king leans — his shadow on the curtain flinches. The camera dollies slowly toward the throne (the near
              figures and their brazier are a separate painted layer that grows faster: parallax).
     'shadow' (~7.8 s, under "찾거든 내게 고하여 나도 가서 그에게 경배하게 하라", then silence): a plastered wall, one torch low-left.
              On the wall only the king's shadow, long and huge (cast from below, the crowned head largest): one hand raised in a
              gentle blessing, while the other slowly comes to rest on the hilt of a dagger at his belt (HOIL.grip). The dagger
              is only touched, never drawn. The torch breathes, embers drift; at the end it gutters (light −40 %) and the frame
              sinks toward near-black (never pure black — the next scene dissolves in).
   Closed form: herodOil(ctx, shot, ts) depends only on (shot, ts) — any frame renders alone; ts may run ~1 s outside the shot.
   Uses the page's W/H/V and Pilot; kit-oilpaint.js paints the plates once in buildHerodOil(). */
const HOIL = { S: 1.5, flinch: 1.7, grip: [3.0, 5.0], gutter: [6.0, 6.6], fade: [6.3, 7.8], hall: null, kingL: null, near: null, wall: null };

// the fire's strength at t (≈ .62–1.18, mean ≈ .9): slow breath + quick flutter, deterministic
function herodFlick(t, seed) { const n = Pilot.noise; return .62 + .3 * n(t * 2.1, seed) + .18 * n(t * 6.3, seed + 7) + .08 * n(t * 13.7, seed + 3); }
const herodFract = x => x - Math.floor(x);

// a flame standing on (x, y), h px tall: nested tongues from red-orange to a white core, swaying on noise; glow around it
function herodFlame(ctx, x, y, h, t, seed, a = 1) {
  if (a <= .01 || h < 1) return; const N = Pilot.noise;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  { const R = h * 2.8, cy = y - h * .4, gl = ctx.createRadialGradient(x, cy, 0, x, cy, R);
    gl.addColorStop(0, `rgba(255,160,70,${.3 * a})`); gl.addColorStop(.3, `rgba(220,96,36,${.12 * a})`); gl.addColorStop(1, 'rgba(120,40,10,0)');
    ctx.fillStyle = gl; ctx.fillRect(x - R, cy - R, 2 * R, 2 * R); }
  ctx.filter = `blur(${Math.max(.6, h * .03).toFixed(1)}px)`;
  const sway = (N(t * 1.9, seed + 3) - .5) * h * .55, flut = (N(t * 6.1, seed + 4) - .5) * h * .22;
  const layers = [[1, .5, '200,58,14', .5], [.84, .4, '255,116,30', .55], [.64, .28, '255,184,72', .7], [.4, .16, '255,240,196', .9]];
  for (let i = 0; i < layers.length; i++) { const [hk, wk, col, al] = layers[i];
    const hh = h * hk * (.88 + .24 * N(t * 3.7 + i * 1.3, seed + i)), ww = h * wk * (.92 + .16 * N(t * 2.9, seed + 9 + i));
    const tx = x + (sway + flut) * hk, ty = y - hh;
    ctx.fillStyle = `rgba(${col},${al * a})`; ctx.beginPath(); ctx.moveTo(x - ww * .5, y);
    ctx.bezierCurveTo(x - ww * .8, y - hh * .32, x - ww * .25 + sway * .45 * hk, y - hh * .72, tx, ty);
    ctx.bezierCurveTo(x + ww * .25 + sway * .45 * hk, y - hh * .72, x + ww * .8, y - hh * .32, x + ww * .5, y);
    ctx.quadraticCurveTo(x, y + ww * .28, x - ww * .5, y); ctx.fill(); }
  // tongues that tear off the top and vanish
  for (let k = 0; k < 3; k++) { const P = .5 + .17 * k, u = herodFract(t / P + k * .37 + seed * .13);
    const yy = y - h * (.72 + .75 * u), xx = x + sway * (1 + u) + (N(t * 3 + k * 7, seed + k) - .5) * h * .3, s = h * .11 * (1 - u), al = (1 - u) * (1 - u) * .7 * a;
    if (s < .5) continue; ctx.fillStyle = `rgba(255,${130 + 60 * (1 - u) | 0},50,${al})`;
    ctx.beginPath(); ctx.moveTo(xx, yy - s * 1.8); ctx.quadraticCurveTo(xx + s, yy, xx, yy + s * .6); ctx.quadraticCurveTo(xx - s, yy, xx, yy - s * 1.8); ctx.fill(); }
  ctx.restore();
}
// sparks rising from a fire at (x, y) of height h; drift = sideways pull (× h); a = strength
function herodEmbers(ctx, x, y, h, t, seed, n, a = 1, drift = .6) {
  if (a <= .01) return; const r = Pilot.rng(seed); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const P = 1.4 + r() * 2.4, ph = r(), dx = r() - .5, rise = 1.6 + 4.2 * r(), sz = .7 + r() * 1.5, wob = r() * 6.283, dr = .5 + r();
    const u = herodFract(t / P + ph), px = x + dx * h * .45 + drift * dr * u * u * h * 2.2 + Math.sin(t * 2.6 + wob) * h * .16 * u, py = y - h * .55 - rise * h * u;
    const al = a * Math.min(1, u / .08) * Math.pow(1 - u, 1.4) * (.55 + .45 * Math.sin(t * 17 + wob * 3)); if (al <= .02) continue;
    ctx.fillStyle = `rgba(255,${150 + 90 * (1 - u) | 0},${70 * (1 - u) | 0},${al})`; ctx.beginPath(); ctx.arc(px, py, sz * (1 - .5 * u), 0, 6.283); ctx.fill(); }
  ctx.restore();
}

async function buildHerodOil() {
  const { clamp, lerp, rng, canvas } = Pilot, S = HOIL.S, PW = Math.round(W * S), PH = Math.round(H * S);
  const plate = () => { const c = canvas(PW, PH), g = c.getContext('2d'); g.scale(S, S); return [c, g]; };
  const radial = (g, x, y, R, stops, op = 'source-over', sy = 1) => { g.save(); g.globalCompositeOperation = op; g.translate(x, y); g.scale(1, sy);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, R); stops.forEach(([k, c]) => gr.addColorStop(k, c)); g.fillStyle = gr; g.fillRect(-R, -R, 2 * R, 2 * R); g.restore(); };
  const path = cmds => { const p = new Path2D(); for (const c of cmds) { if (c[0] === 'M') p.moveTo(c[1], c[2]); else if (c[0] === 'L') p.lineTo(c[1], c[2]); else if (c[0] === 'C') p.bezierCurveTo(c[1], c[2], c[3], c[4], c[5], c[6]); else p.closePath(); } return p; };
  const quad = (g, pts, fill) => { g.fillStyle = fill; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  // fire light for the light map: k = multiplier on the surface colour (the map stores k / 2.5)
  const FL = k => `rgba(255,150,70,${clamp(k / 2.5)})`;
  const spot = (g, x, y, R, I, sy = 1) => radial(g, x, y, R, [[0, FL(I)], [.1, FL(I * .72)], [.3, FL(I * .34)], [.6, FL(I * .1)], [1, FL(0)]], 'lighter', sy);
  // develop: surface colours × light map, rolled off like film (1 − e^−Ev), warm black floor; a little dither against banding
  function develop(alb, lm, E = 1.35, floor = [10, 6, 4]) {
    const a = alb.getContext('2d'), A = a.getImageData(0, 0, PW, PH), d = A.data, L = lm.getContext('2d').getImageData(0, 0, PW, PH).data;
    const N = 1024, lut = new Float32Array(N); for (let i = 0; i < N; i++) lut[i] = 255 * (1 - Math.exp(-E * (i / (N - 1)) * 2.5));
    const r = rng(77);
    for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 3;
      for (let c = 0; c < 3; c++) { const p = d[i + c] * L[i + c] / 65025 * (N - 1) + n; d[i + c] = floor[c] + lut[p < 0 ? 0 : p > N - 1 ? N - 1 : p | 0] * (1 - floor[c] / 255); } }
    a.putImageData(A, 0, 0); return alb;
  }
  const layer = (art, maskFn) => { const c = canvas(PW, PH), g = c.getContext('2d'); g.save(); g.scale(S, S); maskFn(g); g.restore();
    g.save(); g.globalCompositeOperation = 'source-in'; g.drawImage(art, 0, 0); g.restore(); return c; };
  const paint = c => OIL.paint(c, { key: 'caravaggio', S, seed: 13 });

  /* ---------------- shot 1: the hall ---------------- */
  // a simple camera: X right, Y up, Z depth (metres); portrait looks a little down over the travellers' heads
  const C = V ? { f: 1100, ch: 2.5, hy: H * .5, HW: 4.6, mz: 6.2 } : { f: 1000, ch: 1.7, hy: H * .5, HW: 6.6, mz: 6.2 };   // (round 5: TV camera lower and nearer the travellers)
  const Pj = (X, Y, Z) => [W / 2 + C.f * X / Z, C.hy - C.f * (Y - C.ch) / Z];
  const HW = C.HW, ZW = 16, ZK = 14.3, YD = 2.2, Z0 = 12.6, ZT = 13.8, NST = 7, HY = 12, SW = 2.5;   // back wall, king, dais top, the steps Z0→ZT, wall height, step half-width
  // brazier on the steps just below the king (round 3: nearer him → a bigger shadow, looming over the whole curtain) · brazier near us · torch on the left wall
  const L2b = YD * 5 / NST, L2 = [-.65, L2b + 1.2, 13.5], L1 = V ? [1.3, 1.3, 4.4] : [2.3, 1.3, 5.0], L3 = [-HW + .3, 3.5, 12];
  const L2s = Pj(...L2), L1s = Pj(...L1), L3s = Pj(...L3);
  const h = HOIL.h = { C, ZW, ZK, YD, L2, L1s, L2s, L3s };
  // the king and his throne, front view (metres, origin = the dais top under him, y up = negative)
  // (round 2: the back stops at his shoulders — a high back swallowed the crowned head in the shadow; two finials flank him)
  // (round 5: a solid seat block threw a box onto the curtain → an open frame: legs, a slab, posts and scrolled armrests, so the
  // fire shows through under the arms. All subpaths run the same way round, so the union has no holes)
  const R4 = (x0, t, x1, b) => [['M', x0, b], ['L', x0, t], ['L', x1, t], ['L', x1, b], ['Z']];
  const THRONE = path([['M', -.52, -.52], ['L', -.52, -1.3], ['L', -.6, -1.35], ['L', -.55, -1.42], ['L', -.52, -1.7], ['L', -.49, -1.42], ['L', -.44, -1.35], ['L', .44, -1.35], ['L', .49, -1.42],
    ['L', .52, -1.7], ['L', .55, -1.42], ['L', .6, -1.35], ['L', .52, -1.3], ['L', .52, -.52], ['Z'],
    ...R4(-.67, -.42, -.57, 0), ...R4(.57, -.42, .67, 0), ...R4(-.7, -.52, .7, -.42), ...R4(-.67, -.88, -.59, -.52), ...R4(.59, -.88, .67, -.52),
    ['M', -.73, -.88], ['L', -.73, -.95], ['C', -.73, -1.03, -.64, -1.05, -.6, -1.0], ['L', -.52, -.96], ['L', -.52, -.88], ['Z'],
    ['M', .52, -.88], ['L', .52, -.96], ['L', .6, -1.0], ['C', .64, -1.05, .73, -1.03, .73, -.95], ['L', .73, -.88], ['Z']]);
  const KBODY = [['M', -.3, -.1], ['C', -.34, -.3, -.39, -.5, -.39, -.6], ['C', -.43, -.7, -.5, -.94, -.53, -1.02], ['C', -.51, -1.1, -.45, -1.15, -.41, -1.18], ['C', -.37, -1.3, -.34, -1.45, -.27, -1.5],
    // the crown (round 3: bigger — it has to read in the shadow): a broad band and three tall points
    ['C', -.19, -1.53, -.13, -1.53, -.1, -1.55], ['C', -.12, -1.6, -.12, -1.7, -.1, -1.76], ['L', -.15, -1.79], ['L', -.17, -2.04], ['L', -.08, -1.89], ['L', 0, -2.12],
    ['L', .08, -1.89], ['L', .17, -2.04], ['L', .15, -1.79], ['L', .1, -1.76], ['C', .12, -1.7, .12, -1.6, .1, -1.55], ['C', .13, -1.53, .19, -1.53, .27, -1.5],
    ['C', .34, -1.45, .37, -1.3, .41, -1.18], ['C', .45, -1.15, .51, -1.1, .53, -1.02], ['C', .5, -.94, .43, -.7, .39, -.6], ['C', .39, -.5, .34, -.3, .3, -.1], ['Z']];
  const KING = path(KBODY), STOOL = path([['M', -.36, 0], ['L', .36, 0], ['L', .33, -.12], ['L', -.33, -.12], ['Z']]);
  HOIL.paths = { THRONE, KING, STOOL };
  const kp = Pj(0, YD, ZK); h.k = [kp[0], kp[1], C.f / ZK * 1.15];   // (a big man on a big throne)
  h.T = [kp[0], kp[1] - 1.5 * C.f / ZK];   // the push-in aims at the king's chest
  h.wall = [Pj(-HW, 0, ZW)[0], Pj(0, HY, ZW)[1], Pj(HW, 0, ZW)[0], Pj(0, YD, ZW)[1]];
  // the travellers (metres, feet at the origin): A stands (seen from behind), B bows (profile, toward the throne), C asks, one arm up
  // (round 2: pointed tops read as bishops' mitres / chess pawns → rounded wrapped turbans, sloping shoulders, elbows under the cloak)
  // (round 3: cloaks flare to the floor — straight sides read as pillars; A leans on a traveller's staff, drawn with him)
  const MA = [['M', .38, 0], ['C', .34, -.4, .29, -.8, .3, -1.05], ['C', .31, -1.15, .29, -1.28, .25, -1.36], ['C', .21, -1.43, .15, -1.46, .1, -1.48],
    // (round 5: the turban wider than the head, wound high, a flatter crown — a bald dome read as an egg)
    ['C', .1, -1.53, .14, -1.57, .155, -1.64], ['C', .17, -1.72, .16, -1.84, .12, -1.9], ['C', .08, -1.95, .03, -1.965, 0, -1.965], ['C', -.04, -1.965, -.1, -1.945, -.135, -1.89],
    ['C', -.17, -1.82, -.17, -1.7, -.15, -1.63], ['C', -.13, -1.57, -.095, -1.53, -.1, -1.48], ['C', -.15, -1.46, -.21, -1.43, -.25, -1.36], ['C', -.29, -1.28, -.31, -1.15, -.3, -1.05], ['C', -.3, -.8, -.34, -.4, -.41, 0], ['Z']];
  const MB = [['M', -.42, 0], ['C', -.44, -.3, -.38, -.7, -.24, -.92], ['C', -.12, -1.08, .04, -1.12, .14, -1.08], ['C', .18, -1.1, .2, -1.14, .23, -1.16], ['C', .27, -1.22, .35, -1.22, .39, -1.15],
    ['C', .42, -1.1, .42, -1.03, .39, -.99], ['C', .385, -.96, .375, -.93, .36, -.91], ['C', .35, -.88, .33, -.86, .3, -.85], ['C', .34, -.79, .4, -.71, .44, -.63], ['C', .46, -.59, .46, -.55, .43, -.54],
    ['C', .38, -.54, .32, -.55, .27, -.53], ['C', .32, -.4, .38, -.22, .44, 0], ['Z']];
  const MCARM = [['M', .2, -1.42], ['C', .28, -1.5, .35, -1.62, .4, -1.74], ['C', .41, -1.78, .43, -1.8, .45, -1.79], ['C', .47, -1.78, .47, -1.75, .455, -1.72], ['C', .44, -1.69, .43, -1.67, .42, -1.65],
    ['C', .38, -1.55, .33, -1.42, .29, -1.25], ['Z']];
  const MAARM = [['M', -.26, -1.34], ['C', -.32, -1.29, -.36, -1.22, -.385, -1.14], ['C', -.39, -1.1, -.37, -1.07, -.35, -1.08], ['C', -.33, -1.12, -.3, -1.17, -.27, -1.2], ['Z']];   // A's hand on his staff
  const mags = (V ? [[-1.45, 0, MA.concat(MAARM), 'A'],[-.18, .5, MA.concat(MCARM), 'C'], [-.8, -.35, MB, 'B']] : [[-2.65, 0, MA.concat(MAARM), 'A'], [-1.3, .5, MA.concat(MCARM), 'C'], [-1.95, -.35, MB, 'B']])
    .map(([X, dz, cmds, id]) => ({ X, Z: C.mz + dz, p: path(cmds), id })).sort((a, b) => b.Z - a.Z);
  const ROBE = { A: ['#22150a', '#e0a048'], B: ['#2a0d07', '#e8603a'], C: ['#1a110a', '#b08458'] };
  const HEAD = { A: [0, -1.76, .15, .22], B: [.32, -1.08, .1, .12], C: [0, -1.76, .15, .22] };

  function hallAlbedo(g) {
    g.fillStyle = '#2a2018'; g.fillRect(0, 0, W, H);
    quad(g, [Pj(-HW, HY, ZW), Pj(HW, HY, ZW), Pj(HW, HY, 1), Pj(-HW, HY, 1)], '#30251a');
    for (let z = 2; z < ZW; z += 2) quad(g, [Pj(-HW, HY, z), Pj(HW, HY, z), Pj(HW, HY, z + .45), Pj(-HW, HY, z + .45)], '#1c140e');   // beams
    // back wall: dressed stone courses
    { const [x0, y0] = Pj(-HW, HY, ZW), [x1, y1] = Pj(HW, 0, ZW); g.fillStyle = '#8e7658'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.strokeStyle = 'rgba(40,28,18,.4)'; g.lineWidth = 1.2;
      for (let Y = .6, row = 0; Y < HY; Y += .6, row++) { const y = Pj(0, Y, ZW)[1], yb = Pj(0, Y - .6, ZW)[1]; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
        for (let X = -HW + (row % 2) * .65; X < HW; X += 1.3) { const x = Pj(X, 0, ZW)[0]; g.beginPath(); g.moveTo(x, y); g.lineTo(x, yb); g.stroke(); } } }
    // side walls
    for (const sd of [-1, 1]) { const X = sd * HW; quad(g, [Pj(X, 0, ZW), Pj(X, HY, ZW), Pj(X, HY, 1), Pj(X, 0, 1)], '#7c664e');
      g.strokeStyle = 'rgba(40,28,18,.35)'; g.lineWidth = 1.2; for (let Y = .6; Y < HY; Y += .6) { const a = Pj(X, Y, ZW), b = Pj(X, Y, 1.5); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } }
    // floor: polished stone in a chequer
    { const nx = Math.round(2 * HW / 1.15), sx = 2 * HW / nx; for (let zi = 0, z = 1.2; z < ZW; z += 1.1, zi++) for (let xi = 0; xi < nx; xi++) { const X = -HW + xi * sx, z2 = Math.min(ZW, z + 1.1);
      quad(g, [Pj(X, 0, z), Pj(X + sx, 0, z), Pj(X + sx, 0, z2), Pj(X, 0, z2)], (xi + zi) % 2 ? '#72604a' : '#5c4c3a'); } }
    // the red curtain behind the throne, in deep folds, its top lost in the dark
    { const [x0, y0] = Pj(-2.9, 10, ZW), [x1, y1] = Pj(2.9, YD, ZW), gr = g.createLinearGradient(x0, 0, x1, 0), r = rng(3);
      for (let i = 0; i <= 28; i++) { const v = Math.pow(.5 + .5 * Math.sin(i * 1.75 + r() * 1.4), 1.4); gr.addColorStop(i / 28, `rgb(${80 + 120 * v | 0},${14 + 24 * v | 0},${10 + 10 * v | 0})`); }
      g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
    // columns (far ones first; the steps between)
    const col = Z => { for (const sd of [-1, 1]) { const X = sd * (HW - .9), r = .42, [cx, yb] = Pj(X, 0, Z), yt = Pj(X, 9.6, Z)[1], hw = C.f * r / Z, u = C.f / Z;
      const gr = g.createLinearGradient(cx - hw, 0, cx + hw, 0), st = [[0, '#3a3024'], [.5, '#8a765a'], [.78, '#b49c78'], [1, '#5a4c3a']];
      st.forEach(([k, c]) => gr.addColorStop(sd < 0 ? k : 1 - k, c)); g.fillStyle = gr; g.fillRect(cx - hw, yt, 2 * hw, yb - yt);
      g.strokeStyle = 'rgba(30,22,14,.22)'; g.lineWidth = Math.max(1, u * .02); for (let k = 1; k < 6; k++) { const x = cx - hw + 2 * hw * k / 6; g.beginPath(); g.moveTo(x, yt); g.lineTo(x, yb); g.stroke(); }
      g.fillStyle = gr; g.fillRect(cx - hw * 1.32, yb - u * .4, hw * 2.64, u * .4); g.fillRect(cx - hw * 1.42, yt - u * .55, hw * 2.84, u * .55);
      g.fillStyle = 'rgba(20,14,10,.35)'; g.fillRect(cx - hw * 1.32, yb - u * .4, hw * 2.64, u * .06); g.fillRect(cx - hw * 1.42, yt - u * .1, hw * 2.84, u * .1); } };
    const colZ = V ? [15, 11.5, 8, 4.6] : [15, 11.5, 8, 5.2];
    colZ.filter(z => z > ZT).forEach(col);
    quad(g, [Pj(-SW, YD, ZT), Pj(SW, YD, ZT), Pj(SW, YD, ZW), Pj(-SW, YD, ZW)], '#8a7658');   // the landing
    for (let i = NST - 1; i >= 0; i--) { const z0 = Z0 + (ZT - Z0) * i / NST, z1 = Z0 + (ZT - Z0) * (i + 1) / NST, y0 = YD * i / NST, y1 = YD * (i + 1) / NST;
      quad(g, [Pj(-SW, y1, z0), Pj(SW, y1, z0), Pj(SW, y1, z1), Pj(-SW, y1, z1)], '#a08a68'); quad(g, [Pj(-SW, y0, z0), Pj(SW, y0, z0), Pj(SW, y1, z0), Pj(-SW, y1, z0)], '#5a4836'); }
    colZ.filter(z => z <= ZT).forEach(col);
  }
  function hallLight(g) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.save(); g.globalCompositeOperation = 'lighter';
    // (round 2: the hall read evenly lit — ambient almost nothing now, each fire a tight pool, the dark eats the rest)
    const amb = g.createLinearGradient(0, 0, 0, H); amb.addColorStop(0, 'rgb(2,2,1)'); amb.addColorStop(.45, 'rgb(9,7,5)'); amb.addColorStop(.75, 'rgb(10,8,6)'); amb.addColorStop(1, 'rgb(5,4,3)'); g.fillStyle = amb; g.fillRect(0, 0, W, H);
    g.restore();
    const tight = (x, y, R, I, sy = 1) => radial(g, x, y, R, [[0, FL(I)], [.07, FL(I * .78)], [.2, FL(I * .4)], [.42, FL(I * .14)], [.7, FL(I * .035)], [1, FL(0)]], 'lighter', sy);
    // the brazier on the steps: the king, the steps, the curtain behind him
    tight(L2s[0], L2s[1], H * .3, 2.8); tight(...Pj(.6, 4.6, ZW), H * .2, .9); { const [x, y] = Pj(L2[0] + .3, YD * .6, L2[2] - .3); tight(x, y, C.f * 3.4 / L2[2], 1.3, .4); }
    // the brazier near us: the travellers and the floor around them
    tight(L1s[0], L1s[1], H * .46, 2.7); { const [x, y] = Pj(V ? -.7 : -1.9, 0, C.mz); tight(x, y, C.f * 3.2 / C.mz, 1.4, C.ch / C.mz * 1.3); }
    { const [x, y] = Pj(L1[0], 0, L1[2]); tight(x, y, C.f * 2.6 / L1[2], 1.6, C.ch / L1[2] * 1.3); }
    // the torch on the left wall
    tight(L3s[0], L3s[1], H * .13, 1.8);
  }
  // an iron brazier on a tripod, bowl rim at Yb + 1 m; its coals glowing (drawn after develop: it makes its own light)
  function brazier(g, X, Yb, Z, r) { const sc = C.f / Z, [bx, by] = Pj(X, Yb + 1.0, Z), fy0 = Pj(X, Yb, Z)[1];
    g.lineCap = 'round'; g.strokeStyle = '#140d08'; g.lineWidth = .055 * sc;
    for (const dx of [-1, 0, 1]) { const leg = () => { g.beginPath(); g.moveTo(bx + dx * r * .45 * sc, by + .12 * sc); g.quadraticCurveTo(bx + dx * r * 1.0 * sc, by + .5 * sc, bx + dx * r * 1.25 * sc, fy0 + (dx ? 0 : -.05 * sc)); };
      g.strokeStyle = '#140d08'; g.lineWidth = .055 * sc; leg(); g.stroke();
      const lg = g.createLinearGradient(0, by, 0, fy0); lg.addColorStop(0, 'rgba(255,150,70,.65)'); lg.addColorStop(.5, 'rgba(200,100,40,.18)'); lg.addColorStop(1, 'rgba(200,100,40,0)');
      g.save(); g.translate(-dx * .012 * sc, 0); g.strokeStyle = lg; g.lineWidth = .014 * sc; leg(); g.stroke(); g.restore(); }
    g.fillStyle = '#1c120a'; g.beginPath(); g.moveTo(bx - r * sc, by); g.bezierCurveTo(bx - r * sc, by + r * .9 * sc, bx + r * sc, by + r * .9 * sc, bx + r * sc, by); g.closePath(); g.fill();
    const gr = g.createLinearGradient(bx - r * sc, 0, bx + r * sc, 0); gr.addColorStop(0, 'rgba(255,140,60,0)'); gr.addColorStop(.5, 'rgba(255,150,70,.5)'); gr.addColorStop(1, 'rgba(255,140,60,0)');
    g.strokeStyle = gr; g.lineWidth = .03 * sc; g.beginPath(); g.moveTo(bx - r * .9 * sc, by + .03 * sc); g.bezierCurveTo(bx - r * .8 * sc, by + r * .7 * sc, bx + r * .8 * sc, by + r * .7 * sc, bx + r * .9 * sc, by + .03 * sc); g.stroke();
    const cg = g.createRadialGradient(bx, by, 0, bx, by, r * sc); cg.addColorStop(0, '#fff0b0'); cg.addColorStop(.4, '#ffa040'); cg.addColorStop(1, '#a02c08');
    g.fillStyle = cg; g.beginPath(); g.ellipse(bx, by, r * .95 * sc, r * .24 * sc, 0, 0, 6.283); g.fill();
    return [bx, by - r * .05 * sc, sc]; }
  function sconce(g, x, y, s) {   // an iron torch holder on the wall: the flame stands on (x, y)
    g.strokeStyle = '#140d08'; g.lineCap = 'round'; g.lineWidth = s * .05; g.beginPath(); g.moveTo(x, y + s * .05); g.lineTo(x - s * .04, y + s * .55); g.stroke();
    g.lineWidth = s * .03; g.beginPath(); g.moveTo(x - s * .02, y + s * .3); g.lineTo(x - s * .16, y + s * .34); g.stroke();
    g.fillStyle = '#ffb060'; g.beginPath(); g.ellipse(x, y, s * .05, s * .025, 0, 0, 6.283); g.fill(); }

  const [ha, hg] = plate(); hallAlbedo(hg);
  const [hl, hlg] = plate(); hallLight(hlg);
  develop(ha, hl);
  // the king on his throne: shapes given volume by the brazier on the steps (OIL.relief) — rim-lit, the face never more than a dark mass
  const mK = new DOMMatrix().scale(S, S).translate(h.k[0], h.k[1]).scale(h.k[2], h.k[2]);
  const lightK = { x: L2s[0] * S, y: L2s[1] * S, z: 30 * S, R: H * .2 * S };
  const zone = (at, base, lit, k = 1) => ({ w: at ? (u, v) => clamp(1.6 - 1.6 * Math.hypot((u - at[0]) / at[2], (v - at[1]) / at[3])) : null, base: hex(base), lit: hex(lit), k });
  OIL.relief(hg, THRONE, mK, [-.7, -3.25, .7, 0], [zone(null, '#120904', '#b07a34', 1.0)], lightK, { soft: .05, height: 30 * S, amb: .12, wrap: .1 });
  OIL.relief(hg, STOOL, mK, [-.4, -.15, .4, 0], [zone(null, '#120904', '#8a5a2a', 1.0)], lightK, { soft: .1, height: 20 * S, amb: .12, wrap: .1 });
  OIL.relief(hg, KING, mK, [-.56, -2.15, .56, 0], [zone([0, -1.93, .2, .12], '#2a1a08', '#ffd27a', 1.9), zone([0, -1.66, .08, .1], '#0e0604', '#4a2818', .55),
    zone(null, '#150705', '#b8422a', 1.05)], lightK, { soft: .06, height: 34 * S, amb: .1, wrap: .15 });
  // glints of gold on the crown and the throne's finials
  { hg.save(); hg.fillStyle = 'rgba(255,230,160,.9)'; for (const [u, v] of [[-.17, -2.03], [0, -2.11], [-.15, -1.8], [-.52, -1.69], [.52, -1.69], [-.68, -1.0]]) { const x = h.k[0] + u * h.k[2], y = h.k[1] + v * h.k[2]; hg.beginPath(); hg.arc(x, y, 1.1, 0, 6.283); hg.fill(); } hg.restore(); }
  // step nosings catching the brazier
  { hg.save(); hg.globalCompositeOperation = 'screen'; for (let i = 0; i < NST; i++) { const z0 = Z0 + (ZT - Z0) * i / NST, y1 = YD * (i + 1) / NST, a = Pj(-SW, y1, z0), b = Pj(SW, y1, z0);
    const gr = hg.createLinearGradient(a[0], 0, b[0], 0); gr.addColorStop(0, 'rgba(255,170,90,0)'); gr.addColorStop(.32, `rgba(255,170,90,${.5 - i * .04})`); gr.addColorStop(.7, 'rgba(255,170,90,.06)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
    hg.strokeStyle = gr; hg.lineWidth = 1.6; hg.beginPath(); hg.moveTo(a[0], a[1]); hg.lineTo(b[0], b[1]); hg.stroke(); } hg.restore(); }
  // the braziers and the sconce are drawn over the painting afterwards (painted, the thin iron legs broke into stripes)
  { const s = C.f / L3[2]; h.F3 = [L3s[0], L3s[1] + s * .2, .45 * s]; }
  // the near layer: the travellers, their shadows, the brazier near us — painted on a copy of the hall, then cut out
  const [na, ng] = plate(); ng.drawImage(ha, 0, 0, W, H);
  const F1 = Pj(L1[0], 0, L1[2]);
  const shadowsOf = (g, fill) => { for (const m of mags) { const sc = C.f / m.Z, [x, y] = Pj(m.X, 0, m.Z), dx = x - F1[0], dy = y - F1[1], dl = Math.hypot(dx, dy), ux = dx / dl, uy = dy / dl, L = sc * 1.4, wd = sc * .32;
      g.fillStyle = fill(.85); g.beginPath(); g.moveTo(x - uy * wd, y + ux * wd); g.lineTo(x + ux * L - uy * wd * .5, y + uy * L + ux * wd * .5); g.lineTo(x + ux * L + uy * wd * .5, y + uy * L - ux * wd * .5); g.lineTo(x + uy * wd, y - ux * wd); g.closePath(); g.fill();
      g.fillStyle = fill(1); g.beginPath(); g.ellipse(x, y, sc * .42, sc * .07, 0, 0, 6.283); g.fill(); } };
  { ng.save(); ng.filter = 'blur(10px)'; shadowsOf(ng, a => `rgba(8,5,3,${.78 * a})`); ng.restore(); }
  // the travellers, shaded by hand (round 3: OIL.relief left them grey pillars): the near brazier rakes in from the right — the lit
  // flank in its colour (ochre, vermilion, umber), the far flank sinks into the dark, falling darker toward the floor; folds with
  // a lit ridge on the fire's side; linen turbans; a rim of fire along the edge that faces it
  const mixc = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => v + (B[i] - v) * k | 0).join(',')})`; };
  for (const m of mags) { const sc = C.f / m.Z, [x, y] = Pj(m.X, 0, m.Z), [rb, rl] = ROBE[m.id], top = m.id === 'B' ? -1.22 : -1.96;
    ng.save(); ng.translate(x, y); ng.scale(sc, sc); ng.lineCap = 'round'; const lw = 1 / sc, r = rng(m.id.charCodeAt(0));
    if (m.id === 'A') { ng.strokeStyle = '#1a0f07'; ng.lineWidth = .042; ng.beginPath(); ng.moveTo(-.35, -2.14); ng.lineTo(-.43, .01); ng.stroke();
      ng.strokeStyle = 'rgba(255,170,90,.3)'; ng.lineWidth = .012; ng.beginPath(); ng.moveTo(-.335, -2.12); ng.lineTo(-.415, -.25); ng.stroke(); }
    const gr = ng.createLinearGradient(-.4, 0, .44, 0); gr.addColorStop(0, rb); gr.addColorStop(.4, mixc(rb, rl, .22)); gr.addColorStop(.78, rl); gr.addColorStop(1, mixc(rl, '#fff4dc', .12));
    ng.fillStyle = gr; ng.fill(m.p);
    ng.save(); ng.clip(m.p);
    // the turban: linen given volume by the fire (round 4: striped wraps read as bandaged eggs → a soft round form, one shaded fold)
    { const [hx, hy, rx, ry] = HEAD[m.id], tg = ng.createRadialGradient(hx + rx * .45, hy - ry * .35, 0, hx + rx * .2, hy - ry * .1, rx * 1.5);
      tg.addColorStop(0, '#f6e4c0'); tg.addColorStop(.35, '#c8ae84'); tg.addColorStop(.75, '#5a4630'); tg.addColorStop(1, '#2a1e12');
      ng.fillStyle = tg; ng.beginPath(); if (m.id === 'B') ng.ellipse(hx - .01, hy - .03, rx * 1.05, ry, -.5, 0, 6.283); else ng.ellipse(hx, hy - .03, rx * 1.12, ry * .92, 0, 0, 6.283); ng.fill();
      // the wound band where it sits on the head, and the cloth's lower edge in its own shadow
      if (m.id !== 'B') { const bg = ng.createLinearGradient(0, hy + .06, 0, hy + .2); bg.addColorStop(0, 'rgba(30,18,8,0)'); bg.addColorStop(.5, 'rgba(30,18,8,.55)'); bg.addColorStop(1, 'rgba(30,18,8,.2)'); ng.fillStyle = bg; ng.fillRect(-.2, hy + .06, .4, .16); }
      else { ng.save(); ng.translate(hx, hy); ng.rotate(-.5); const bg = ng.createLinearGradient(0, .02, 0, .12); bg.addColorStop(0, 'rgba(30,18,8,0)'); bg.addColorStop(1, 'rgba(30,18,8,.55)'); ng.fillStyle = bg; ng.fillRect(-.15, .02, .3, .12); ng.restore(); } }
    { const vg = ng.createLinearGradient(0, top, 0, 0); vg.addColorStop(0, 'rgba(8,4,2,.1)'); vg.addColorStop(.45, 'rgba(8,4,2,.08)'); vg.addColorStop(1, 'rgba(8,4,2,.62)'); ng.fillStyle = vg; ng.fillRect(-1, top - .1, 2, -top + .1); }
    // folds: (round 4: five even lines read as corduroy) two or three broad soft troughs, a lit ridge beside each on the fire's side
    ng.filter = `blur(${Math.max(.8, sc * .016).toFixed(1)}px)`;
    const folds = m.id === 'B' ? [[-.08, -1.04, -.32, -.08], [.2, -.62, .3, -.05], [-.26, -.85, -.42, -.3]]
      : [[-.12 + (r() - .5) * .05, -1.36, -.2, 0], [.06 + (r() - .5) * .05, -1.3, .12, 0], [.2, -1.0, .3, 0]];
    for (const [x0, y0, x1, y1] of folds) { const fp = new Path2D(); fp.moveTo(x0, y0); fp.bezierCurveTo(x0 + .02, (2 * y0 + y1) / 3, x1 - .03, (y0 + 2 * y1) / 3, x1, y1);
      ng.strokeStyle = 'rgba(10,4,2,.42)'; ng.lineWidth = .05; ng.stroke(fp);
      const lit = clamp((x0 + .15) / .45); if (lit > 0) { ng.save(); ng.translate(.035, 0); ng.strokeStyle = `rgba(255,206,140,${.26 * lit})`; ng.lineWidth = .025; ng.stroke(fp); ng.restore(); } }
    if (m.id !== 'B') { ng.strokeStyle = 'rgba(200,180,140,.35)'; ng.lineWidth = .055; ng.beginPath(); ng.moveTo(.03, -1.6); ng.bezierCurveTo(.06, -1.5, .05, -1.42, .08, -1.28); ng.stroke(); }   // the turban's tail down the back
    { const [hx, hy] = HEAD[m.id]; ng.strokeStyle = 'rgba(40,26,14,.45)'; ng.lineWidth = .03; ng.beginPath(); ng.ellipse(hx, hy + .02, .15, .07, m.id === 'B' ? -.6 : -.18, .3, Math.PI - .4); ng.stroke(); }   // one fold of the wrap
    ng.filter = 'none';
    { const rg = ng.createLinearGradient(-.05, 0, .42, 0); rg.addColorStop(0, 'rgba(255,180,100,0)'); rg.addColorStop(.6, 'rgba(255,180,100,.35)'); rg.addColorStop(1, 'rgba(255,200,130,.7)'); ng.strokeStyle = rg; ng.lineWidth = .035; ng.stroke(m.p); }
    ng.restore(); ng.restore(); }
  HOIL.hall = paint(ha);
  const over = (c, fn) => { const g = c.getContext('2d'); g.save(); g.scale(S, S); const out = fn(g); g.restore(); return out; };
  { const b2 = over(HOIL.hall, g => brazier(g, L2[0], L2b, L2[2], .28)); h.F2 = [b2[0], b2[1], .5 * b2[2]]; }
  over(HOIL.hall, g => sconce(g, h.F3[0], h.F3[1], C.f / L3[2]));
  // the king again, cut from the painting, so his shadow can move behind him
  HOIL.kingL = layer(HOIL.hall, g => { g.translate(h.k[0], h.k[1]); g.scale(h.k[2], h.k[2]); g.fillStyle = '#fff'; g.fill(THRONE); g.fill(KING); g.fill(STOOL); });
  const nPaint = paint(na);
  HOIL.near = layer(nPaint, g => { g.fillStyle = '#fff';
    for (const m of mags) { const sc = C.f / m.Z, [x, y] = Pj(m.X, 0, m.Z); g.save(); g.translate(x, y); g.scale(sc, sc); g.fill(m.p);
      if (m.id === 'A') { g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineWidth = .05; g.beginPath(); g.moveTo(-.35, -2.14); g.lineTo(-.43, .01); g.stroke(); } g.restore(); }
    g.save(); g.filter = 'blur(10px)'; shadowsOf(g, a => `rgba(255,255,255,${a})`); g.restore();
    { const sc = C.f / L1[2], [bx, by] = Pj(L1[0], 1.0, L1[2]), fy0 = Pj(L1[0], 0, L1[2])[1], r = .32; g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineWidth = .07 * sc;
      for (const dx of [-1, 0, 1]) { g.beginPath(); g.moveTo(bx + dx * r * .45 * sc, by + .12 * sc); g.quadraticCurveTo(bx + dx * r * sc, by + .5 * sc, bx + dx * r * 1.25 * sc, fy0 + (dx ? 0 : -.05 * sc)); g.stroke(); }
      g.beginPath(); g.moveTo(bx - r * sc * 1.03, by); g.bezierCurveTo(bx - r * sc, by + r * .95 * sc, bx + r * sc, by + r * .95 * sc, bx + r * sc * 1.03, by); g.ellipse(bx, by, r * 1.03 * sc, r * .28 * sc, 0, 0, Math.PI, true); g.fill(); } });
  { const b1 = over(HOIL.near, g => brazier(g, L1[0], 0, L1[2], .32)); h.F1 = [b1[0], b1[1], .62 * b1[2]]; }

  /* ---------------- shot 2: the shadow on the wall ---------------- */
  const T = V ? [W * .085, H * .63] : [W * .12, H * .6], ts = V ? 1 : .8;   // the torch flame stands on T; ts = the torch's size
  const LP = [T[0] + 10, T[1] - 70 * ts];   // centre of the light
  const w = HOIL.w = { T, LP, ts, cx: V ? W * .6 : W * .53, y0: V ? H * .045 : H * .04, sc: V ? H * .98 : H * 1.12 };
  const [wa, wg] = plate();
  { wg.fillStyle = '#c49c68'; wg.fillRect(0, 0, W, H);
    // the plaster: broad unevenness, then small bumps the raking light picks out (lit on the lower-left, dark on the upper-right)
    const nw = 48, nh = Math.round(48 * H / W), nc = canvas(nw, nh), nx = nc.getContext('2d'), im = nx.createImageData(nw, nh);
    for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) { const v = Pilot.fbm(x * .18, y * .18, 4), i = (y * nw + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 90 + 150 * v; im.data[i + 3] = 255; }
    nx.putImageData(im, 0, 0); wg.save(); wg.globalCompositeOperation = 'overlay'; wg.globalAlpha = .55; wg.imageSmoothingQuality = 'high'; wg.drawImage(nc, 0, 0, W, H); wg.restore();
    { const r = rng(17); for (let i = 0; i < 700; i++) { const x = r() * W, y = r() * H, R = 3 + r() * r() * 26;
      wg.fillStyle = `rgba(255,236,200,${.05 + .06 * r()})`; wg.beginPath(); wg.arc(x - R * .3, y + R * .3, R, 0, 6.283); wg.fill();
      wg.fillStyle = `rgba(60,40,24,${.05 + .06 * r()})`; wg.beginPath(); wg.arc(x + R * .3, y - R * .3, R * .9, 0, 6.283); wg.fill(); } }
    // old cracks
    { const r = rng(29); wg.lineCap = 'round'; for (let k = 0; k < 6; k++) { let x = r() * W, y = r() * H * .75, a = r() * 6.283; wg.strokeStyle = 'rgba(50,32,20,.55)'; wg.lineWidth = 1.4;
      wg.beginPath(); wg.moveTo(x, y); for (let s = 0; s < 22; s++) { a += (r() - .5) * 1.1; x += Math.cos(a) * 9; y += Math.sin(a) * 9; wg.lineTo(x, y); } wg.stroke(); } }
    // a painted dado low on the wall (red ochre, Herodian panels) — under the words, kept simple
    wg.fillStyle = '#7a3a22'; wg.fillRect(0, H * .8, W, H * .2); wg.fillStyle = '#4a2214'; wg.fillRect(0, H * .79, W, H * .012); wg.fillStyle = '#d8b07a'; wg.fillRect(0, H * .778, W, H * .006); }
  const [wl, wlg] = plate();
  // (round 2: the wall read evenly lit) a hot core at the torch falling off fast, plus a long wedge of light raking up the wall
  // toward the upper right (Caravaggio's diagonal) — the shadow stands in the wedge; the corners away from it sink to black
  { wlg.fillStyle = 'rgb(3,2,2)'; wlg.fillRect(0, 0, W, H); const D = Math.hypot(W, H);
    radial(wlg, LP[0], LP[1], D * .62, [[0, FL(2.7)], [.05, FL(2.0)], [.14, FL(1.2)], [.3, FL(.5)], [.55, FL(.14)], [.8, FL(.03)], [1, FL(0)]], 'lighter');
    // (round 3: the wedge aims at the crowned head — the crown is what has to read; the wedge ends just past it)
    const ex = w.cx - .02 * w.sc, ey = w.y0 + .1 * w.sc, ang = Math.atan2(ey - LP[1], ex - LP[0]), len = Math.hypot(ex - LP[0], ey - LP[1]) * .62;
    wlg.save(); wlg.globalCompositeOperation = 'lighter'; wlg.translate(LP[0] + (ex - LP[0]) * .62, LP[1] + (ey - LP[1]) * .62); wlg.rotate(ang); wlg.scale(1, V ? .62 : .55);
    const gr = wlg.createRadialGradient(0, 0, 0, 0, 0, len * 1.05); gr.addColorStop(0, FL(1.05)); gr.addColorStop(.45, FL(.75)); gr.addColorStop(.8, FL(.22)); gr.addColorStop(1, FL(0));
    wlg.fillStyle = gr; wlg.fillRect(-len * 1.1, -len * 1.1, len * 2.2, len * 2.2); wlg.restore(); }
  develop(wa, wl, 1.4);
  // (round 5: brushed along the form, the wall swirled in rings round the torch — Van Gogh, not Caravaggio → one diagonal brush)
  HOIL.wall = OIL.paint(wa, { key: 'caravaggio', S, seed: 13, dir: -.95 });
  // the torch, over the painting: a pitch-wrapped head on a wooden shaft, held out from the wall by an iron arm and ring;
  // everything lit from the flame above (warm tops, black undersides), its own soft shadow thrown down the wall
  { const g = HOIL.wall.getContext('2d'), s = H * .12 * ts, [x, y] = T, tilt = -.16; g.save(); g.scale(S, S); g.lineCap = 'round';
    g.save(); g.filter = `blur(${(s * .06).toFixed(1)}px)`; g.globalCompositeOperation = 'multiply'; g.strokeStyle = 'rgba(40,24,14,.6)'; g.lineWidth = s * .13; g.beginPath(); g.moveTo(x + s * .25, y + s * .5); g.lineTo(x + s * .45, y + s * 1.6); g.stroke(); g.restore();
    g.translate(x, y); g.rotate(tilt);
    // the iron wall plate and arm
    g.strokeStyle = '#100a06'; g.lineWidth = s * .055; g.beginPath(); g.moveTo(s * .02, s * .62); g.quadraticCurveTo(s * .25, s * .6, s * .42, s * .7); g.stroke();
    g.fillStyle = '#120b07'; g.beginPath(); g.ellipse(s * .44, s * .72, s * .06, s * .14, -tilt, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(255,160,80,.5)'; g.lineWidth = s * .014; g.beginPath(); g.moveTo(s * .04, s * .6); g.quadraticCurveTo(s * .25, s * .58, s * .4, s * .67); g.stroke();
    // the shaft: wood, lit along its left edge
    { const gr = g.createLinearGradient(-s * .06, 0, s * .06, 0); gr.addColorStop(0, '#8a5a32'); gr.addColorStop(.35, '#4a2e18'); gr.addColorStop(1, '#140c06');
      g.fillStyle = gr; g.beginPath(); g.moveTo(-s * .055, s * .18); g.lineTo(s * .055, s * .18); g.lineTo(s * .045, s * 1.35); g.lineTo(-s * .04, s * 1.35); g.closePath(); g.fill();
      const fall = g.createLinearGradient(0, s * .2, 0, s * 1.35); fall.addColorStop(0, 'rgba(10,6,3,0)'); fall.addColorStop(1, 'rgba(10,6,3,.7)'); g.fillStyle = fall; g.fillRect(-s * .06, s * .2, s * .12, s * 1.16); }
    // the ring round the shaft
    g.strokeStyle = '#0e0905'; g.lineWidth = s * .05; g.beginPath(); g.ellipse(0, s * .62, s * .085, s * .03, 0, 0, 6.283); g.stroke();
    g.strokeStyle = 'rgba(255,170,90,.55)'; g.lineWidth = s * .014; g.beginPath(); g.ellipse(0, s * .6, s * .085, s * .03, 0, Math.PI, 6.283); g.stroke();
    // the head: wrapped pitch-cloth, a bulb wider than the shaft, glowing at the top where it burns
    { const gr = g.createLinearGradient(0, -s * .02, 0, s * .26); gr.addColorStop(0, '#5a2a10'); gr.addColorStop(.3, '#24140a'); gr.addColorStop(1, '#0c0704');
      g.fillStyle = gr; g.beginPath(); g.moveTo(-s * .1, s * .02); g.bezierCurveTo(-s * .13, s * .12, -s * .1, s * .22, -s * .055, s * .26); g.lineTo(s * .055, s * .26); g.bezierCurveTo(s * .1, s * .22, s * .13, s * .12, s * .1, s * .02); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = s * .012; for (let i = 0; i < 4; i++) { const yy = s * (.07 + i * .05); g.beginPath(); g.moveTo(-s * .11, yy - s * .02); g.quadraticCurveTo(0, yy + s * .025, s * .11, yy - s * .03); g.stroke(); }
      const eg = g.createRadialGradient(0, s * .02, 0, 0, s * .02, s * .12); eg.addColorStop(0, 'rgba(255,220,140,.95)'); eg.addColorStop(.5, 'rgba(255,120,40,.6)'); eg.addColorStop(1, 'rgba(160,40,10,0)');
      g.fillStyle = eg; g.beginPath(); g.ellipse(0, s * .03, s * .11, s * .05, 0, 0, 6.283); g.fill(); }
    g.restore(); }
  // the shadow figure (shadow units: x = u, y = v; crown top at v = 0, facing left) — head, robe; arms/dagger are drawn per frame
  HOIL.SH = {
    head: path([['M', .055, .175], ['C', .075, .14, .075, .095, .058, .072], ['L', .062, .056], ['L', .058, .0], ['L', .036, .036], ['L', .008, -.014], ['L', -.018, .036], ['L', -.046, .002], ['L', -.052, .056],
      // (round 4: the round chin read as a puppet's) a long pointed beard
      ['L', -.05, .076], ['C', -.058, .09, -.061, .1, -.058, .108], ['L', -.079, .13], ['L', -.06, .137], ['C', -.063, .142, -.065, .146, -.061, .15], ['C', -.066, .175, -.064, .21, -.05, .245],
      ['C', -.03, .228, -.005, .21, .01, .192], ['L', .006, .228], ['L', .046, .226], ['Z']]),
    body: path([['M', .04, .214], ['C', .062, .224, .1, .234, .116, .26], ['C', .132, .33, .122, .42, .126, .5], ['C', .142, .7, .172, .95, .205, 1.4], ['L', -.15, 1.4], ['C', -.125, 1.0, -.098, .75, -.087, .55],
      ['C', -.09, .5, -.092, .47, -.084, .44], ['C', -.076, .37, -.07, .3, -.045, .256], ['C', -.02, .238, 0, .228, .006, .222], ['Z']]),
    // the wide royal sleeve slid down the raised forearm, hanging in a long fold (round 2: was a balloon)
    sleeve: path([['M', -.166, .18], ['C', -.172, .22, -.17, .27, -.163, .31], ['C', -.157, .328, -.142, .33, -.132, .316], ['C', -.115, .3, -.085, .29, -.058, .288], ['L', -.128, .232], ['Z']]),
  };
  HOIL.shc = canvas(W, H);
  { const g = canvas(256, 256), x = g.getContext('2d'), im = x.createImageData(256, 256), r = rng(91); for (let i = 0; i < 65536; i++) { const v = 128 + (r() - .5) * 120; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0); HOIL.grain = g; }
}

// the king's shadow figure at grip k (0 hand hanging … 1 resting on the hilt), raise = the blessing hand's lift (radians)
function herodShadowFigure(g, k, raise) {
  const SH = HOIL.SH; g.fill(SH.head); g.fill(SH.body);
  const pt = (p, a, L) => [p[0] + Math.cos(a) * L, p[1] + Math.sin(a) * L], line = (a, b, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  g.strokeStyle = g.fillStyle; g.lineCap = 'round'; g.lineJoin = 'round';
  // the raised hand: upper arm forward, forearm up, the open palm turned out — a blessing, a dismissal; the wide sleeve hangs below
  const S1 = [-.03, .268], a1 = Math.PI + .2 + raise * .5, E1 = pt(S1, a1, .115), a2 = -1.95 + raise, W1 = pt(E1, a2, .1);
  g.save(); g.translate(E1[0] + .138, E1[1] - .242); g.fill(SH.sleeve); g.restore();
  line(S1, E1, .046); line(E1, W1, .036);
  { const ah = a2 + .12, P0 = pt(W1, ah, .018); g.save(); g.translate(P0[0], P0[1]); g.rotate(ah); g.beginPath(); g.ellipse(.008, 0, .022, .017, 0, 0, 6.283); g.fill(); g.restore();
    for (let i = 0; i < 4; i++) { const af = ah + (i - 1.5) * .13, b = pt(P0, ah + (i - 1.5) * .5, .012); line(b, pt(b, af, [.034, .04, .038, .03][i]), .0085); }
    const tb = pt(P0, ah - 1.4, .012); line(tb, pt(tb, ah - 1.0, .024), .009); }
  // the lower hand: from hanging at his side (hidden in the robe) it comes forward and closes over the hilt
  const ease = k * k * k * (k * (k * 6 - 15) + 10), S2 = [-.02, .28], E2 = [-.03 + .008 * ease, .395 - .012 * ease], a3 = 1.69 + .8 * ease, W2 = pt(E2, a3, .11 - .022 * ease);
  line(S2, E2, .044); line(E2, W2, .036);
  { const F = pt(W2, a3, .018); g.save(); g.translate(F[0], F[1]); g.rotate(a3 + .4 * ease); g.beginPath(); g.ellipse(0, 0, .022, .018 + .002 * ease, 0, 0, 6.283); g.fill(); g.restore();
    if (ease > .6) { const c = (ease - .6) / .4; for (let i = 0; i < 3; i++) { const b = pt(F, a3 + 1.2, -.006 + i * .009); line(b, pt(b, a3 + 1.9, .014 * c), .008); } } }   // the fingers curl round the grip
  // the dagger's hilt in his sash: guard, grip, pommel — it stays sheathed
  { const B = [-.084, .47], d = [-.819, -.573], p = [.573, -.819], q = (s, t) => [B[0] + d[0] * s + p[0] * t, B[1] + d[1] * s + p[1] * t];
    // (round 4: a thin guard read as a lollipop — a broad crossguard with flared tips, a bound grip, a small pommel)
    line(q(0, -.03), q(0, .03), .011); line(q(-.004, -.034), q(.006, -.036), .009); line(q(-.004, .034), q(.006, .036), .009);
    line(q(0, 0), q(.048, 0), .014); g.beginPath(); const P = q(.055, 0); g.arc(P[0], P[1], .0085, 0, 6.283); g.fill(); }
}

function herodFinish(ctx, t) {
  OIL.varnish(ctx, .7, [120, 66, 28]);
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  { const R = Math.hypot(W, H) * .62, gr = ctx.createRadialGradient(W / 2, H * .45, R * .3, W / 2, H * .45, R); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgb(96,74,62)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  { const b = ctx.createLinearGradient(0, H * .72, 0, H); b.addColorStop(0, '#fff'); b.addColorStop(1, 'rgb(130,118,108)'); ctx.fillStyle = b; ctx.fillRect(0, H * .72, W, H * .28); }   // the words' band a little darker
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07; const o = Math.floor(t * 24); ctx.translate(-((o * 73) % 256), -((o * 151) % 256));
  ctx.fillStyle = ctx.createPattern(HOIL.grain, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
}

// fire light breathing over the frame around (x, y): dims near the fire when it sinks, warms when it flares
function herodBreath(ctx, x, y, R, fn, k = 1) {
  const dim = Math.min(1, 1 - .32 * k * (1.02 - fn)), v = 255 * Math.max(0, dim) | 0;
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; let gr = ctx.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, `rgb(${v},${v},${v})`); gr.addColorStop(1, '#fff'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  const wa = Math.max(0, (fn - .9) * .45 * k); if (wa > 0) { ctx.globalCompositeOperation = 'screen'; gr = ctx.createRadialGradient(x, y, 0, x, y, R * .6); gr.addColorStop(0, `rgba(255,140,60,${wa})`); gr.addColorStop(1, 'rgba(255,140,60,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

function herodHallShot(ctx, ts) {
  const { clamp, lerp } = Pilot, S = HOIL.S, h = HOIL.h, C = h.C;
  const u = clamp(ts / 4.4), k = .55 * u * u * (3 - 2 * u) + .45 * u;   // a steady dolly that never quite stops
  const z = lerp(1.03, 1.3, k), fx = clamp(lerp(W / 2, h.T[0], k), W / 2 / z, W - W / 2 / z), fy = clamp(lerp(H / 2, h.T[1], k), H / 2 / z, H - H / 2 / z);
  const cam = (x, y) => [W / 2 + (x - fx) * z, H / 2 + (y - fy) * z];
  OIL.view(ctx, HOIL.hall, S, fx * S, fy * S, z);
  // the question lands: the brazier on the steps gusts, the king leans back — his shadow on the curtain jumps and settles
  const fl = ts - HOIL.flinch, kick = fl > 0 ? Math.exp(-fl * 3.2) * Math.sin(fl * 10) : 0, lean = fl > 0 ? (1 - Math.exp(-fl * 5)) * Math.exp(-Math.max(0, fl - .6) * .8) : 0;
  const f2 = herodFlick(ts, 23), N = Pilot.noise;
  const XL = h.L2[0] + .05 * (N(ts * 2.4, 31) - .5) + .15 * kick, YL = h.L2[1] + .06 * (f2 - .9) - .11 * kick, ZL = h.L2[2], ZW = h.ZW, ZK = h.ZK;
  const kk = (ZW - ZL) / (ZK - ZL), s = kk * ZK / ZW, tx = (1 - s) * W / 2 + C.f / ZW * XL * (1 - kk), ty = (1 - s) * C.hy - C.f / ZW * (1 - kk) * (YL - C.ch);
  { const sg = HOIL.shc.getContext('2d'); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalAlpha = 1; sg.filter = 'none'; sg.fillStyle = '#fff'; sg.fillRect(0, 0, W, H);
    sg.setTransform(z, 0, 0, z, W / 2 - fx * z, H / 2 - fy * z); const [x0, y0, x1, y1] = h.wall; sg.beginPath(); sg.rect(x0, y0, x1 - x0, y1 - y0); sg.clip();
    sg.transform(s, 0, 0, s, tx, ty); sg.translate(h.k[0], h.k[1]); sg.scale(h.k[2], h.k[2]); sg.fillStyle = 'rgb(58,30,18)';
    sg.fill(HOIL.paths.THRONE); sg.fill(HOIL.paths.STOOL); sg.translate(.08 * lean + .02 * kick, -.04 * lean); sg.rotate(.06 * lean); sg.fill(HOIL.paths.KING);
    // the lower curtain takes bounce light off the lit steps: the shadow thins out toward them
    sg.setTransform(z, 0, 0, z, W / 2 - fx * z, H / 2 - fy * z); { const fb = sg.createLinearGradient(0, y1, 0, y1 - (y1 - y0) * .28); fb.addColorStop(0, 'rgba(255,255,255,.6)'); fb.addColorStop(1, 'rgba(255,255,255,0)'); sg.fillStyle = fb; sg.fillRect(x0, y0, x1 - x0, y1 - y0); }
    sg.restore();   // (save/restore: no clip may leak into the next frame)
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = `blur(${(2.2 * z).toFixed(1)}px)`; ctx.globalAlpha = .92; ctx.drawImage(HOIL.shc, 0, 0); ctx.restore(); }
  OIL.view(ctx, HOIL.kingL, S, fx * S, fy * S, z);
  { const [x, y] = cam(h.L2s[0], h.L2s[1]); herodBreath(ctx, x, y, H * .3 * z, f2 + .15 * kick, .8); }
  // the near layer grows faster than the hall (parallax: they are nearer the camera)
  const zn = 1.03 + (z - 1.03) * (V ? 1.6 : 1.35), camN = (x, y) => [W / 2 + (x - fx) * zn, H / 2 + (y - fy) * zn];
  OIL.view(ctx, HOIL.near, S, fx * S, fy * S, zn);
  const f1 = herodFlick(ts, 11), f3 = herodFlick(ts, 47);
  { const [x, y] = camN(h.L1s[0], h.L1s[1]); herodBreath(ctx, x, y, H * .55, f1, 1); }
  // fire
  { const [x, y] = cam(h.F2[0], h.F2[1]); herodFlame(ctx, x, y, h.F2[2] * z * (f2 + .25 * Math.max(0, kick)), ts, 23); }
  { const [x, y] = cam(h.F3[0], h.F3[1]); herodFlame(ctx, x, y, h.F3[2] * z * f3, ts, 47, .85); }
  { const [x, y] = camN(h.F1[0], h.F1[1]), fh = h.F1[2] * zn * f1; herodFlame(ctx, x, y, fh, ts, 11); herodEmbers(ctx, x, y, fh, ts, 61, 26, .9, .3); }
  herodFinish(ctx, ts);
}

function herodShadowShot(ctx, ts) {
  const { clamp, lerp, ss } = Pilot, S = HOIL.S, w = HOIL.w;
  const u = clamp(ts / 7.8), k = .5 * u * u * (3 - 2 * u) + .5 * u;
  const z = lerp(1.02, 1.12, k), fx = clamp(lerp(W * .5, W * .47, k), W / 2 / z, W - W / 2 / z), fy = clamp(lerp(H * .44, H * .48, k), H / 2 / z, H - H / 2 / z);
  const cam = (x, y) => [W / 2 + (x - fx) * z, H / 2 + (y - fy) * z];
  OIL.view(ctx, HOIL.wall, S, fx * S, fy * S, z);
  // the torch: breathing, then guttering (−40 %) as the last words fade, then the frame sinks
  const gut = ss(HOIL.gutter[0], HOIL.gutter[1], ts), sput = gut * (1 - gut) * 4 * (Pilot.noise(ts * 22, 5) - .5) * .5;
  const fn = herodFlick(ts, 5) * (1 - .4 * gut) + sput, fade = ss(HOIL.fade[0], HOIL.fade[1], ts);
  // the shadow: the figure, scaled about the flame as it breathes (a lower flame throws a taller shadow), slightly soft
  { const sg = HOIL.shc.getContext('2d'); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalAlpha = 1; sg.filter = 'none'; sg.fillStyle = '#fff'; sg.fillRect(0, 0, W, H);
    sg.setTransform(z, 0, 0, z, W / 2 - fx * z, H / 2 - fy * z);
    const m = 1 + .022 * (.9 - fn) + .01 * Pilot.noise(ts * 1.3, 8), [lx, ly] = w.LP; sg.translate(lx, ly); sg.scale(m, m); sg.rotate(.006 * (Pilot.noise(ts * .9, 4) - .5)); sg.translate(-lx, -ly);
    sg.translate(w.cx, w.y0); sg.scale(w.sc, w.sc); sg.fillStyle = 'rgb(52,30,18)';
    const raise = .07 * (1 - Pilot.eio(clamp(ts / 1.8))) + .018 * Math.sin(ts * .8);
    herodShadowFigure(sg, clamp((ts - HOIL.grip[0]) / (HOIL.grip[1] - HOIL.grip[0])), raise); sg.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = `blur(${(16 * z).toFixed(1)}px)`; ctx.globalAlpha = .45; ctx.drawImage(HOIL.shc, 0, 0);
    ctx.filter = `blur(${(3.5 * z).toFixed(1)}px)`; ctx.globalAlpha = .92; ctx.drawImage(HOIL.shc, 0, 0); ctx.restore(); }
  { const [x, y] = cam(w.LP[0], w.LP[1]); herodBreath(ctx, x, y, H * .9, fn, 1.3); }
  if (fade > 0) { const v = 255 * (1 - .9 * fade) | 0; ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  { const [x, y] = cam(w.T[0], w.T[1]), fh = H * .075 * w.ts * z * fn; herodFlame(ctx, x, y, fh, ts, 5, 1 - .55 * fade); herodEmbers(ctx, x, y, fh, ts, 71, 22, (1 - .7 * fade) * (1 - .5 * gut), 1.0); }
  herodFinish(ctx, ts);
}

function herodOil(ctx, shot, ts) { if (shot === 'shadow') herodShadowShot(ctx, ts); else herodHallShot(ctx, ts); }
