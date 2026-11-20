// impasto-tomb.js — 「kingdom」 6부 첫 장면 C5 · N27 (film 620.5 → 632.4): "십자가에서 죽으신 지 사흘 만에, 그 왕은 / 죽음을 이기고
// 다시 살아나셨습니다." The garden tomb at dawn, painted with the palette knife — the first film's 「부활」 (motion/pilot/rise.html: knife
// strokes laid over a value-planned reference, a grey painting and a colour painting of the same strokes, the colour re-laid stroke by
// stroke in a wave that starts at the empty tomb). Ref 「바람과 함께 사라지다」 (1939, OPUSCAR 12): Technicolor impasto, the sky burning
// gold, black silhouettes of trees. Engine copied from motion/pilot/rise.html (knifePath / paint / grey / layered / the stroke-ordered
// reveal mask), recomposed for portrait and for this film's beats; rise.html itself is not changed.
//   620.5  in from the veil scene's open-door light (sample-veil.html, veil-temple.js): the door-shaped white light gathers into the
//          tomb's doorway at the same place (match cut on the door of light) while the grey painting comes up out of the dark
//   C5     the world before dawn, grey; the camera creeps; the sky warms behind the hills on the right
//   N27    the first sunlight rakes across the rock from the right and reaches the open doorway; it goes IN — the inside lights up
//          (the burial bench, the linen cloths lying there, the head cloth apart — Jn 20:5–7; nobody there) — the first colour of the
//          picture; the camera follows the light in (dolly in, 3.6 s, eased, peak log-zoom .25/s); the colour re-laid from the doorway outward, flowers
//          appear in the grass with it; the light keeps filling the chamber
// No people. No words. The great round stone stands rolled back in its channel to the left of the door (Mk 16:4).
// Camera: one slow creep, one eased dolly (log-zoom rate ≤ 0.25/s), one slow drift. The paint never moves; only light moves.
// API: const T = await (await import('./impasto-tomb.js')).build(W, H);  T.draw(ctx, t, B)  t = FILM seconds, B = line times
//      (C5, N27, N27b). Pure in t (the reveal mask is rebuilt when t goes backwards). Needs window.Pilot (lib.js).
const P = window.Pilot;
const { clamp, lerp, ss, eio, rng, fbm, noise, canvas, mix, rgb } = P;

export function beats(B) {
  const c5 = B.C5, n = B.N27, e = B.N27b;
  return {
    start: c5, morph: [c5, c5 + 1.3],             // the veil's door of light gathers into the doorway; the painting comes up
    warm: [c5 + .8, n + 1.2],                     // the sky warms behind the hills
    rake: [n + .3, n + 1.5],                      // the sunlight rakes across the rock to the doorway
    inn: [n + 1.2, n + 2.6],                      // the light goes in: the chamber lights up
    wave0: n + 1.7,                               // the colour starts at the doorway
    dolly: [n + 1.2, n + 4.8],                    // the camera follows the light in (3.6 s, eased: peak log-zoom rate .25/s)
    end: e + .55,                                 // (the dissolve to the courtyard is the page's: e − .5 … e + .5)
  };
}

export async function build(W, H) {
  const S = 1.5, PW = Math.round(W * S), PH = Math.round(H * S);   // the painting: plate px = S × frame px (sharp at the dolly's end)
  const V = H > W;
  // ---------------------------------------------------------------- the composition (frame px)
  const DOOR = { x0: W * .421, x1: W * .616, y0: H * .5, y1: H * .645, r: W * .03 };   // the low doorway (a dressed-stone frame round it)
  const DC = [(DOOR.x0 + DOOR.x1) / 2, (DOOR.y0 + DOOR.y1) / 2];
  const HOR = H * .36;                                                                  // where the far hills meet the sky
  const rockTop = x => H * .3 + H * .036 * fbm(x * .006, 2.3, 3) + H * .02 * Math.sin(x * .009) + Math.max(0, x - W * .7) * .55 + Math.max(0, W * .12 - x) * .2;
  const rockBot = x => H * .672 + H * .012 * fbm(x * .01, 4.1, 3) - Math.max(0, x - W * .8) * .1;
  const RT = new Float32Array(PW + 1), RB = new Float32Array(PW + 1), FH = new Float32Array(PW + 1), MH = new Float32Array(PW + 1);   // profiles, tabulated per plate column
  const col = x => Math.max(0, Math.min(PW, Math.round(x * S)));
  const inRock = (x, y) => { const i = col(x); return y > RT[i] && y < RB[i]; };
  const inDoor = (x, y) => { const n = (fbm(x * .04, y * .04, 2) - .5) * 3; if (x < DOOR.x0 + n || x > DOOR.x1 + n || y > DOOR.y1 || y < DOOR.y0) return false;
    const r = DOOR.r, cx = x < DOOR.x0 + r ? DOOR.x0 + r : x > DOOR.x1 - r ? DOOR.x1 - r : x; return y > DOOR.y0 + r || Math.hypot(x - cx, y - (DOOR.y0 + r)) < r; };
  const STONE = { x: W * .27, y: H * .6, rx: W * .118, ry: H * .074 };                    // rolled back to the left, in its channel
  const inStone = (x, y) => ((x - STONE.x) / STONE.rx) ** 2 + ((y - STONE.y) / STONE.ry) ** 2 < 1;
  const TREES = [[W * .86, H * .41, W * .15], [W * .99, H * .37, W * .16], [W * .74, H * .45, W * .1], [W * .93, H * .47, W * .12], [W * .06, H * .29, W * .11], [W * -.03, H * .33, W * .13]];
  const inTree = (x, y) => TREES.some(([cx, cy, r]) => Math.abs(x - cx) < r * 1.25 && Math.abs(y - cy) < r * .95 && ((x - cx) / r) ** 2 + ((y - cy) / (r * .72)) ** 2 < 1 + (fbm(x * .02, y * .02, 3) - .5) * .5);
  const TRUNKS = [[W * .86, H * .43, W * .022, H * .63], [W * .97, H * .4, W * .026, H * .64], [W * .05, H * .31, W * .018, H * .36]];
  const trunkPath = (s = 1) => { const p = new Path2D(); for (const [x0, ty, w, by] of TRUNKS) { p.moveTo((x0 - w) * s, by * s); p.quadraticCurveTo((x0 - w * .3) * s, (by - (by - ty) * .4) * s, (x0 - w * .3) * s, ty * s); p.lineTo((x0 + w * .3) * s, ty * s); p.quadraticCurveTo((x0 + w * .4) * s, (by - (by - ty) * .4) * s, (x0 + w) * s, by * s); p.closePath(); } return p; };
  const farHill0 = x => HOR - H * .03 * fbm(x * .004, 5, 3), midHill0 = x => HOR + H * .032 - H * .022 * fbm(x * .005, 9, 3);
  for (let i = 0; i <= PW; i++) { const x = i / S; RT[i] = rockTop(x); RB[i] = rockBot(x); FH[i] = farHill0(x); MH[i] = midHill0(x); }
  const farHill = x => FH[col(x)], midHill = x => MH[col(x)];
  const SUN = [W * .93, HOR - H * .01];                                                // low on the right, behind the olives
  // ---------------------------------------------------------------- the value-planned reference (colour, sunlit)
  function buildRef(lit) {
    const c = canvas(PW, PH), x = c.getContext('2d'); x.setTransform(S, 0, 0, S, 0, 0);
    // a Technicolor dawn (「바람과 함께 사라지다」): deep blue overhead burning down through rose to orange and gold at the hills
    const sk = x.createLinearGradient(0, 0, 0, HOR + H * .04); sk.addColorStop(0, '#2c3f88'); sk.addColorStop(.3, '#6a6aa8'); sk.addColorStop(.55, '#d27a7c'); sk.addColorStop(.8, '#ff9e5e'); sk.addColorStop(1, '#ffd27a');
    x.fillStyle = sk; x.fillRect(0, 0, W, H);
    const sun = x.createRadialGradient(SUN[0], SUN[1], 0, SUN[0], SUN[1], W * .62); sun.addColorStop(0, 'rgba(255,242,196,.95)'); sun.addColorStop(.35, 'rgba(255,214,150,.45)'); sun.addColorStop(1, 'rgba(255,214,150,0)'); x.fillStyle = sun; x.fillRect(0, 0, W, H);
    // a few long clouds lit from below
    for (const [cx, cy, w, h] of [[W * .3, H * .14, W * .5, H * .016], [W * .62, H * .2, W * .42, H * .012], [W * .18, H * .235, W * .3, H * .01]]) { const g = x.createLinearGradient(0, cy - h, 0, cy + h); g.addColorStop(0, 'rgba(150,140,190,.0)'); g.addColorStop(.5, 'rgba(176,150,170,.55)'); g.addColorStop(1, 'rgba(255,190,150,.7)'); x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, w / 2, h, 0, 0, 6.283); x.fill(); }
    x.fillStyle = '#8a7fae'; x.beginPath(); x.moveTo(0, H); for (let px = 0; px <= W; px += 20) x.lineTo(px, farHill(px)); x.lineTo(W, H); x.fill();
    x.fillStyle = '#9c9a6a'; x.beginPath(); x.moveTo(0, H); for (let px = 0; px <= W; px += 20) x.lineTo(px, midHill(px)); x.lineTo(W, H); x.fill();
    // ground: grass planes, the worn path from the doorway down to the left
    const gg = x.createLinearGradient(0, H * .62, 0, H); gg.addColorStop(0, '#8aa04a'); gg.addColorStop(.4, '#6a8436'); gg.addColorStop(1, '#2f4420'); x.fillStyle = gg; x.fillRect(0, H * .62, W, H * .38);
    x.fillStyle = '#c9a26a'; x.beginPath(); x.moveTo(DOOR.x0 + W * .01, H * .66); x.bezierCurveTo(DOOR.x0 - W * .02, H * .75, W * .22, H * .84, W * .02, H); x.lineTo(W * .5, H); x.bezierCurveTo(W * .56, H * .84, DOOR.x1 + W * .02, H * .74, DOOR.x1 - W * .01, H * .66); x.fill();
    // the rock: lit planes to the right (the sun), shade to the left; strata, cracks
    const d = x.getImageData(0, 0, PW, PH), D = d.data;
    for (let py = 0; py < PH; py++) { const y = py / S; for (let pxx = 0; pxx < PW; pxx++) { const xx = pxx / S; if (!inRock(xx, y)) continue; const k = (py * PW + pxx) * 4;
      const f = fbm(xx * .01, y * .01, 3), li = clamp((xx - W * .1) / (W * .95)), strata = .5 + .5 * Math.sin(y * .05 + f * 6), crev = Math.max(0, Math.sin(xx * .045 + f * 9) - .94) * 6;
      const top = clamp((y - RT[col(xx)]) / (H * .05));   // the brow of the rock catches the sky
      let v = clamp(.12 + .62 * li + .1 * (strata - .5) + (f - .5) * .3 - crev * .3 + .12 * (1 - top));
      const ov = y > DOOR.y0 - H * .07 && y < DOOR.y1 + H * .01 && xx > DOOR.x0 - W * .16 && xx < DOOR.x0 - W * .02 ? .55 + .45 * clamp((DOOR.x0 - W * .02 - xx) / (W * .14)) : 1;   // the doorway's shadow on the face to its left
      v *= ov; const cc = v < .45 ? mix([92, 62, 76], [186, 122, 82], v / .45) : mix([186, 122, 82], [246, 204, 144], (v - .45) / .55);   // violet-brown shade → ochre → cream in the sun
      D[k] = cc[0]; D[k + 1] = cc[1]; D[k + 2] = cc[2]; } }
    x.putImageData(d, 0, 0); x.setTransform(S, 0, 0, S, 0, 0);
    // the channel the stone rolled in, and the stone (a great disc, lit on its right face, its rim in shade)
    x.fillStyle = 'rgba(70,48,32,.75)'; x.beginPath(); x.moveTo(W * .12, H * .668); x.lineTo(DOOR.x1, H * .66); x.lineTo(DOOR.x1, H * .675); x.lineTo(W * .12, H * .684); x.fill();
    { const g = x.createRadialGradient(STONE.x + STONE.rx * .35, STONE.y - STONE.ry * .3, 0, STONE.x, STONE.y, STONE.rx * 1.05); g.addColorStop(0, '#e6d0a4'); g.addColorStop(.6, '#b49a74'); g.addColorStop(1, '#6e5a44');
      x.fillStyle = g; x.beginPath(); x.ellipse(STONE.x, STONE.y, STONE.rx, STONE.ry, 0, 0, 6.283); x.fill();
      x.strokeStyle = 'rgba(70,52,36,.55)'; x.lineWidth = 5; x.beginPath(); x.ellipse(STONE.x, STONE.y, STONE.rx * .97, STONE.ry * .97, 0, 0, 6.283); x.stroke();
      x.fillStyle = 'rgba(60,40,28,.45)'; x.beginPath(); x.ellipse(STONE.x - STONE.rx * .9, STONE.y + STONE.ry * .1, STONE.rx * .16, STONE.ry * .92, 0, 0, 6.283); x.fill(); }
    // the dressed frame round the doorway (pale cut stone), its shadow to the left; the threshold step
    { const m = W * .02; x.fillStyle = 'rgba(214,172,118,.85)'; x.beginPath(); x.roundRect(DOOR.x0 - m, DOOR.y0 - m, DOOR.x1 - DOOR.x0 + 2 * m, DOOR.y1 - DOOR.y0 + m, DOOR.r + m); x.fill();   // the cut face round the opening
      x.fillStyle = 'rgba(96,62,52,.55)'; x.beginPath(); x.roundRect(DOOR.x0 - m * .35, DOOR.y0 - m * .35, DOOR.x1 - DOOR.x0 + m * .7, DOOR.y1 - DOOR.y0 + m * .35, DOOR.r + m * .35); x.fill();   // its inner lip in shade
      x.fillStyle = '#d4bb8a'; x.fillRect(DOOR.x0 - m * 1.4, DOOR.y1, DOOR.x1 - DOOR.x0 + m * 2.8, H * .012); x.fillStyle = 'rgba(80,58,40,.5)'; x.fillRect(DOOR.x0 - m * 1.4, DOOR.y1 + H * .01, DOOR.x1 - DOOR.x0 + m * 2.8, H * .004); }
    // inside the doorway: the chamber (dark), the bench along the back, the linen lying on it, the head cloth rolled apart (Jn 20:7)
    { x.save(); const p = new Path2D(); p.roundRect(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0 + 2, [DOOR.r, DOOR.r, 0, 0]); x.clip(p);
      const k = lit ? 1 : 0, dw = DOOR.x1 - DOOR.x0, dh = DOOR.y1 - DOOR.y0;
      x.fillStyle = lit ? '#46291a' : '#24170f'; x.fillRect(DOOR.x0, DOOR.y0, dw, dh + 2);                                    // the back wall (in shade even when lit)
      x.fillStyle = lit ? '#3e2818' : '#1a110a'; x.fillRect(DOOR.x0, DOOR.y0, dw * .1, dh); x.fillRect(DOOR.x1 - dw * .08, DOOR.y0, dw * .08, dh);   // the side walls' edges
      const by = DOOR.y0 + dh * .6, bh = dh * .08;                                                                               // the bench cut in the rock
      x.fillStyle = lit ? '#7a5236' : '#2e2016'; x.fillRect(DOOR.x0, by, dw, bh);
      x.fillStyle = lit ? '#4a3020' : '#1e140c'; x.fillRect(DOOR.x0, by + bh, dw, dh * .2);
      x.fillStyle = lit ? '#3a2618' : '#160e08'; x.fillRect(DOOR.x0, by + bh + dh * .2, dw, dh);                                // the floor
      if (lit) { // the sun from the right throws the doorway's shape in, shifted LEFT and down: it lies on the bench where the linen is
        // (the light goes to what the line is about — the place where he lay), the back wall above it and the floor below in a warm glow
        x.save(); x.filter = `blur(${(4 * S).toFixed(1)}px)`; const sx = -dw * .3, sy = dh * .32, p2 = new Path2D(); p2.roundRect(DOOR.x0 + sx, DOOR.y0 + sy, dw, dh, [DOOR.r, DOOR.r, 0, 0]);
        x.fillStyle = 'rgba(255,196,118,.8)'; x.fill(p2); x.globalCompositeOperation = 'screen'; x.fillStyle = 'rgba(255,214,150,.25)'; x.fill(p2); x.restore();
        x.fillStyle = 'rgba(246,190,124,.5)'; x.fillRect(DOOR.x0, by, dw * .7, bh * .35); }
      x.restore(); }
    // the olive trees: grey-green leaves, dark trunks
    const d2 = x.getImageData(0, 0, PW, PH), D2 = d2.data;
    for (const [cx, cy, r] of TREES) { const x0 = Math.max(0, (cx - r * 1.3) * S | 0), x1 = Math.min(PW, (cx + r * 1.3) * S | 0), y0 = Math.max(0, (cy - r) * S | 0), y1 = Math.min(PH, (cy + r) * S | 0);
      for (let py = y0; py < y1; py++) for (let pxx = x0; pxx < x1; pxx++) { const xx = pxx / S, y = py / S; if (!inTree(xx, y)) continue; const k = (py * PW + pxx) * 4, f = fbm(xx * .03, y * .03, 3);
        const li = clamp((xx - cx + r) / (2 * r)) * .5 + (1 - (y - cy + r) / (2 * r)) * .4, cc = f > .58 ? [184, 200, 160] : f > .44 ? [143, 164, 120] : [104, 128, 90];
        D2[k] = cc[0] * (.75 + li * .4); D2[k + 1] = cc[1] * (.75 + li * .4); D2[k + 2] = cc[2] * (.75 + li * .4); } }
    x.putImageData(d2, 0, 0); x.setTransform(1, 0, 0, 1, 0, 0);
    x.fillStyle = '#3e2c20'; x.fill(trunkPath(S));
    return c;
  }
  // the linen cloths lying on the bench (folded, long) and the head cloth rolled up by itself (Jn 20:6–7) — drawn crisp over the strokes
  // (small soft-edged shapes with a few folds; mode 0 grey · 1 colour in the chamber's shade · 2 lit by the sun)
  function linen(g, mode) {
    const dw = DOOR.x1 - DOOR.x0, dh = DOOR.y1 - DOOR.y0, by = DOOR.y0 + dh * .6;
    const base = mode === 2 ? [250, 236, 210] : mode === 1 ? [118, 102, 88] : [96, 92, 90], sh = mode === 2 ? [196, 150, 108] : mode === 1 ? [70, 58, 50] : [62, 60, 58];
    g.save(); g.setTransform(S, 0, 0, S, 0, 0); const cl = new Path2D(); cl.roundRect(DOOR.x0, DOOR.y0, dw, dh + 2, [DOOR.r, DOOR.r, 0, 0]); g.clip(cl);
    const cloth = (x0, x1, y1, h, sk) => { const p = new Path2D(); p.moveTo(x0, y1); p.bezierCurveTo(x0 - h * .2, y1 - h * .6, x0 + h * .3, y1 - h, x0 + h * .9, y1 - h * 1.02); p.lineTo(x1 - h * .7, y1 - h * (.95 + sk)); p.bezierCurveTo(x1 - h * .1, y1 - h * .9, x1 + h * .15, y1 - h * .4, x1, y1); p.closePath(); return p; };
    const L1 = cloth(DOOR.x0 + dw * .1, DOOR.x0 + dw * .62, by + 1, dh * .075, .08), L2 = cloth(DOOR.x0 + dw * .74, DOOR.x0 + dw * .9, by + 1, dh * .085, -.05);
    g.filter = `blur(${(1.1 * S).toFixed(1)}px)`;
    for (const p of [L1, L2]) { g.fillStyle = rgb(base); g.fill(p); }
    g.filter = 'none';
    for (const [p, x0, x1] of [[L1, DOOR.x0 + dw * .1, DOOR.x0 + dw * .62], [L2, DOOR.x0 + dw * .74, DOOR.x0 + dw * .9]]) { g.save(); g.clip(p);
      const gr = g.createLinearGradient(0, by - dh * .09, 0, by); gr.addColorStop(0, rgb(base, 0)); gr.addColorStop(1, rgb(sh, .7)); g.fillStyle = gr; g.fillRect(x0 - 4, by - dh * .1, x1 - x0 + 8, dh * .1);
      g.strokeStyle = rgb(sh, .8); g.lineWidth = 1.1; for (let i = 1; i < 5; i++) { const xx = lerp(x0, x1, i / 5 + .03 * Math.sin(i * 2.1)); g.beginPath(); g.moveTo(xx, by - dh * .07); g.quadraticCurveTo(xx + 2, by - dh * .035, xx - 1, by); g.stroke(); }
      g.restore(); }
    // a few small knife marks laid over the cloth (the same hand as the rest of the painting, not a vector shape)
    { const rr = rng(mode + 51); for (let i = 0; i < 70; i++) { const big = i < 52, x0 = big ? DOOR.x0 + dw * (.12 + .48 * rr()) : DOOR.x0 + dw * (.75 + .14 * rr()), y0 = by - dh * (.01 + .06 * rr());
      if (!g.isPointInPath(big ? L1 : L2, x0 * S, y0 * S)) continue; const k = .9 + .2 * rr(), c = [base[0] * k, base[1] * k, base[2] * k];
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); paint(g, { x: x0 * S, y: y0 * S, ang: (rr() - .5) * .5, len: (5 + 4 * rr()) * S, wid: (2 + 1.2 * rr()) * S, sl1: (rr() - .5) * .8, sl2: (rr() - .5) * .8, dr: rr(), run: .6, st: 1 }, c, mix(c, sh, .35)); g.restore(); } }
    g.restore(); }
  // ---------------------------------------------------------------- shape groups (each painted on its own layer, trimmed to its silhouette)
  // 0 sky · 1 far hills · 2 near hills · 3 ground · 4 rock · 5 doorway · 6 olive leaves · 7 trunks · 8 stone · 9 door frame
  const G = new Uint8Array(PW * PH);
  { const tcv = canvas(PW, PH), tc = tcv.getContext('2d'); tc.fillStyle = '#fff'; tc.fill(trunkPath(S)); const TA = tc.getImageData(0, 0, PW, PH).data, m = W * .022;
    for (let py = 0; py < PH; py++) { const y = py / S; for (let pxx = 0; pxx < PW; pxx++) { const x = pxx / S;
      let g = y >= H * .62 ? 3 : y > midHill(x) ? 2 : y > farHill(x) ? 1 : 0;
      if (inRock(x, y)) g = 4;
      if (x > DOOR.x0 - m * 1.9 && x < DOOR.x1 + m && y > DOOR.y0 - m && y < DOOR.y1 + H * .016) g = 9;
      if (inDoor(x, y)) g = 5;
      if (inStone(x, y)) g = 8;
      if (inTree(x, y)) g = 6;
      if (TA[(py * PW + pxx) * 4 + 3] > 127) g = 7;
      G[py * PW + pxx] = g; } } }
  const NG = 10;
  function groupMask(g) { const c = canvas(PW, PH), x = c.getContext('2d'), d = x.createImageData(PW, PH); for (let i = 0; i < PW * PH; i++) if (G[i] === g) d.data[i * 4 + 3] = 255;
    x.putImageData(d, 0, 0); const c2 = canvas(PW, PH), x2 = c2.getContext('2d'); x2.filter = 'blur(.8px)'; x2.drawImage(c, 0, 0); return c2; }
  // ---------------------------------------------------------------- knife strokes (rise.html)
  const grey = c => { const L = (c[0] * .3 + c[1] * .59 + c[2] * .11) * .78 + 8; return [L * .95 + c[0] * .03, L * .98 + c[1] * .02, L * 1.06 + c[2] * .02]; };
  const shade = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  function knifePath(s) { const p = new Path2D(), L = s.len / 2, w = s.wid / 2, a = s.sl1 * w, b = s.sl2 * w; p.moveTo(-L + a, -w); p.lineTo(L + b, -w * .92); p.lineTo(L - b, w); p.lineTo(-L - a, w * .95); p.closePath(); return p; }
  function paint(x, s, c, c2) {
    x.save(); x.translate(s.x, s.y); x.rotate(s.ang); const p = s.path || (s.path = knifePath(s)), rw = 2.4 * S * .8;
    x.fillStyle = rgb(c); x.fill(p); x.save(); x.clip(p);
    x.fillStyle = rgb(c2, s.calm ? .3 : .55); x.fillRect(-s.len / 2, s.wid * (s.dr - .5), s.len, s.wid * .35);                                   // a second colour dragged in
    const up = Math.cos(s.ang) >= 0 ? -1 : 1;
    const ka = s.calm ? .35 : 1; x.fillStyle = rgb(shade(c, 1.22), .8 * ka); x.fillRect(-s.len / 2, up * s.wid / 2 - (up > 0 ? rw : 0), s.len * (.7 + s.run * .3), rw);   // the ridge catching the light
    x.fillStyle = rgb(shade(c, .68), .55 * ka); x.fillRect(-s.len / 2, -up * s.wid / 2 - (up > 0 ? 0 : rw * 1.08), s.len, rw * 1.08);         // the lip in shadow
    x.strokeStyle = rgb(shade(c, s.st), .35); x.lineWidth = S * .8; x.beginPath(); x.moveTo(-s.len / 2, s.wid * (s.dr * .6 - .3)); x.lineTo(s.len * (s.run - .5), s.wid * (s.dr * .6 - .3)); x.stroke();
    x.restore(); x.restore(); }
  const strokes = [];
  const ref = buildRef(false), refLit = buildRef(true);
  { const R = ref.getContext('2d').getImageData(0, 0, PW, PH).data, r = rng(3);
    const at = (px, py) => { px = clamp(px | 0, 0, PW - 1); py = clamp(py | 0, 0, PH - 1); const k = (py * PW + px) * 4; return [R[k], R[k + 1], R[k + 2]]; };
    const edge = (px, py) => { const e = 4 * S, a = at(px - e, py), b = at(px + e, py), c = at(px, py - e), d = at(px, py + e); return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(c[0] - d[0]) + Math.abs(c[2] - d[2]); };
    const grp = (px, py) => G[clamp(py | 0, 0, PH - 1) * PW + clamp(px | 0, 0, PW - 1)];
    const dir = (g, px, py) => g === 5 ? (r() - .5) * .35 : g === 9 ? (py / S < DOOR.y0 + DOOR.r * .6 ? 0 : 1.57) + (r() - .5) * .15 : g === 8 ? .35 + (r() - .5) * .9
      : g === 4 ? 1.3 + (r() - .5) * .7 : g === 6 ? r() * 3.14 : g === 7 ? 1.5 + (r() - .5) * .3 : g === 3 ? (r() - .5) * .3 : g >= 1 ? (r() - .5) * .35 : (r() - .5) * .45;
    const add = (px, py, rad) => { const g = grp(px, py), calm = g <= 2, c = at(px, py), v = calm ? .97 + r() * .06 : .94 + r() * .12, cc = [c[0] * v, c[1] * v, c[2] * v]; if (calm) rad *= 1.7;
      strokes.push({ x: px, y: py, grp: g, calm, ang: dir(g, px, py) * (calm ? .45 : 1), len: rad * (1.7 + r() * 1.4) * (calm ? 1.5 : 1), wid: rad * (.95 + r() * .5), c: cc, c2: at(px + (r() - .5) * 30 * S, py + (r() - .5) * (calm ? 8 : 30) * S),
        sl1: (r() - .5) * .9, sl2: (r() - .5) * .9, dr: r(), run: .4 + r() * .6, st: .85 + r() * .3 }); };
    const sp = .72;   // stroke sizes in frame px (× S on the plate): a finer knife than 「부활」's (the portrait frame and the dolly enlarge it)
    for (let py = -10; py < PH + 20; py += 22 * S * sp) for (let pxx = -10; pxx < PW + 20; pxx += 27 * S * sp) add(pxx + r() * 27 * S * sp, py + r() * 22 * S * sp, (12 + r() * 5) * S * sp);   // big calm planes
    for (let i = 0; i < 90000; i++) { const px = r() * PW, py = r() * PH, e = edge(px, py); if (e > 50 && r() < .5) add(px, py, (6 + r() * 3) * S * sp); else if (r() < .07) add(px, py, (9 + r() * 4) * S * sp); }   // detail at edges
    for (let i = 0; i < 2600; i++) { const px = r() * PW, py = r() * PH; if (grp(px, py) === 7) add(px, py, (3.5 + r() * 2) * S); }   // trunks
    for (let i = 0; i < 9000; i++) { const px = (DOOR.x0 - W * .08 + r() * (DOOR.x1 - DOOR.x0 + W * .16)) * S, py = (DOOR.y0 - H * .03 + r() * (DOOR.y1 - DOOR.y0 + H * .05)) * S;   // the doorway gets the finest knife
      if (grp(px, py) === 5) add(px, py, (2.2 + r() * 1.2) * S); }
    for (let i = 0; i < 1400; i++) { const a = r() * 6.283, rr = Math.sqrt(r()), px = (STONE.x + Math.cos(a) * STONE.rx * rr) * S, py = (STONE.y + Math.sin(a) * STONE.ry * rr) * S; add(px, py, (5 + r() * 3) * S); }   // the stone
  }
  // reveal times: the colour starts at the doorway and runs outward (seconds after wave0)
  const WAVE_V = H * .2;   // px per second (frame px)
  for (const s of strokes) { s.g = grey(s.c); s.g2 = grey(s.c2); const d = Math.hypot(s.x / S - DC[0], (s.y / S - DC[1]) * .85); s.rt = d / WAVE_V + (noise(s.x * .007 / S, s.y * .007 / S) - .5) * 1.2 + (s.grp === 5 ? -.6 : 0); s.path = knifePath(s); }
  // flowers: anemones and yellow blooms in the grass — only in the colour painting, so they come with the wave
  { const r = rng(77), cl = Array.from({ length: 30 }, () => [r() * W, H * .7 + Math.pow(r(), .7) * H * .28]);
    for (let i = 0; i < 260; i++) { const c0 = cl[(r() * cl.length) | 0], fx = c0[0] + (r() - .5) * W * .12, fy = clamp(c0[1] + (r() - .5) * H * .03, H * .69, H);
      if (fx > W * .14 && fx < W * .6 && fy < H * .86 && fx > lerp(DOOR.x0 - W * .03, W * .05, (fy - H * .66) / (H * .34)) - W * .02 && fx < lerp(DOOR.x1, W * .48, (fy - H * .66) / (H * .34))) continue;   // not on the path
      const red = r() < .6, rad = (2.6 + (fy - H * .69) / (H * .3) * 5.5 * (.6 + r() * .6)) * S;
      const s = { x: fx * S, y: fy * S, ang: (r() - .5) * 3, len: rad * 2.2, wid: rad * 1.4, c: red ? [208, 51, 42] : [242, 194, 48], c2: red ? [240, 120, 110] : [255, 230, 140], sl1: .3, sl2: -.3, dr: r(), run: 1, st: 1, grp: 3, flower: true };
      s.path = knifePath(s); s.rt = Math.hypot(fx - DC[0], fy - DC[1]) / WAVE_V + .4; strokes.push(s); } }
  // the three paintings: grey (before), colour (after), and the lit chamber (the sun inside the doorway) — the same strokes in all
  const greyImg = canvas(PW, PH), colImg = canvas(PW, PH), litImg = canvas(PW, PH);
  { const gx = greyImg.getContext('2d'), cx = colImg.getContext('2d'), lx = litImg.getContext('2d');
    gx.filter = 'blur(1.5px)'; gx.drawImage(ref, 0, 0); gx.filter = 'grayscale(.92)'; gx.drawImage(greyImg, 0, 0); gx.filter = 'none';
    cx.filter = 'blur(1.5px)'; cx.drawImage(ref, 0, 0); cx.filter = 'none';
    lx.filter = 'blur(1.5px)'; lx.drawImage(refLit, 0, 0); lx.filter = 'none';
    const RL = refLit.getContext('2d').getImageData(0, 0, PW, PH).data, atL = (px, py) => { px = clamp(px | 0, 0, PW - 1); py = clamp(py | 0, 0, PH - 1); const k = (py * PW + px) * 4; return [RL[k], RL[k + 1], RL[k + 2]]; };
    const L = canvas(PW, PH), lc = L.getContext('2d');
    for (let g = 0; g < NG; g++) { const mk = groupMask(g);
      for (const [tgt, mode] of [[greyImg, 0], [colImg, 1], [litImg, 2]]) { if (mode === 2 && g !== 5 && g !== 9) continue;
        lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, PW, PH);
        for (const s of strokes) { if (s.grp !== g || (s.flower && mode === 0)) continue;
          if (mode === 0) paint(lc, s, s.g, s.g2); else if (mode === 1) paint(lc, s, s.c, s.c2);
          else { const lcN = atL(s.x, s.y), k = .94 + (s.dr - .5) * .1; paint(lc, s, [lcN[0] * k, lcN[1] * k, lcN[2] * k], atL(s.x + (s.run - .7) * 20 * S, s.y + (s.st - 1) * 40 * S)); } }
        lc.globalCompositeOperation = 'destination-in'; lc.drawImage(mk, 0, 0); tgt.getContext('2d').drawImage(L, 0, 0); } }
    for (const s of strokes) if (s.flower) paint(cx, s, s.c, s.c2);
    linen(gx, 0); linen(cx, 1); linen(lx, 2); }
  // the rock (with the stone and the doorway's frame) as a mask for the sunrise's light line
  const rockM = canvas(PW >> 1, PH >> 1); { const x = rockM.getContext('2d'), d = x.createImageData(PW >> 1, PH >> 1);
    for (let py = 0; py < PH >> 1; py++) for (let pxx = 0; pxx < PW >> 1; pxx++) { const g = G[(py * 2) * PW + pxx * 2]; if (g === 4 || g === 8 || g === 9 || g === 6 || g === 7) d.data[(py * (PW >> 1) + pxx) * 4 + 3] = g >= 6 ? 150 : 255; }
    x.putImageData(d, 0, 0); }
  const lightL = canvas(W, H), llx = lightL.getContext('2d');
  strokes.sort((a, b) => a.rt - b.rt);
  const mask2 = canvas(PW, PH), m2x = mask2.getContext('2d'), mask = canvas(PW, PH), mx = mask.getContext('2d'), tmp = canvas(PW, PH), tx = tmp.getContext('2d');
  const litMask = canvas(PW >> 2, PH >> 2), lmx = litMask.getContext('2d'), tmpL = canvas(PW, PH), tlx = tmpL.getContext('2d');
  let lastT = -1e9, idx = 0;
  // ---------------------------------------------------------------- frame
  let T = null;
  function cam(t) {   // the camera: a creep, the dolly into the doorway (eased; ≤ .25/s in log zoom), a slow drift on
    const c = ss(T.start, T.dolly[0], t) * .055, d = eio(clamp((t - T.dolly[0]) / (T.dolly[1] - T.dolly[0]))), af = clamp((t - T.dolly[1]) / 4);
    const z = (1 + c) * Math.exp(Math.log(1.42 / 1.055) * d) * (1 + .06 * af * (1 - af * .35));
    const cx = lerp(W * .5, DC[0] + W * .005, d), cy = lerp(lerp(H * .5, H * .52, ss(T.start, T.dolly[0], t)), DC[1] + H * .006, d);
    return { z, cx, cy };
  }
  function draw(ctx, t, TT) {
    T = TT;
    // the colour re-laid by the knife: accumulate the revealed strokes into the mask (deterministic for any seek order)
    const tw = t - T.wave0;
    if (t < lastT) { mx.clearRect(0, 0, PW, PH); idx = 0; }
    // each stroke fades in over FADE s as the knife lays it (no slab pops on): settled strokes accumulate in `mask`, the ones still
    // coming in are drawn each frame on a copy (`mask2`) at their partial strength
    const FADE = .35;
    while (idx < strokes.length && strokes[idx].rt <= tw - FADE) { const s = strokes[idx++]; mx.save(); mx.translate(s.x, s.y); mx.rotate(s.ang); mx.fillStyle = '#fff'; mx.fill(s.path); mx.restore(); }
    lastT = t;
    let mk2 = mask; if (idx < strokes.length && strokes[idx].rt <= tw) { m2x.globalCompositeOperation = 'copy'; m2x.drawImage(mask, 0, 0); m2x.globalCompositeOperation = 'source-over';
      for (let j = idx; j < strokes.length && strokes[j].rt <= tw; j++) { const s = strokes[j], k = (tw - s.rt) / FADE; m2x.save(); m2x.translate(s.x, s.y); m2x.rotate(s.ang); m2x.fillStyle = `rgba(255,255,255,${(k * k * (3 - 2 * k)).toFixed(3)})`; m2x.fill(s.path); m2x.restore(); }
      mk2 = mask2; }
    const { z, cx, cy } = cam(t), view = g => { g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy); g.scale(1 / S, 1 / S); };
    ctx.save(); ctx.fillStyle = '#100c0a'; ctx.fillRect(0, 0, W, H);
    ctx.save(); view(ctx); ctx.drawImage(greyImg, 0, 0);
    if (tw > 0) { tx.globalCompositeOperation = 'source-over'; tx.clearRect(0, 0, PW, PH); tx.drawImage(colImg, 0, 0); tx.globalCompositeOperation = 'destination-in'; tx.drawImage(mk2, 0, 0); ctx.drawImage(tmp, 0, 0); }
    // the sunlight inside the chamber: the lit painting through a door-shaped patch that grows in from the right
    const inn = ss(T.inn[0], T.inn[1], t);
    if (inn > 0) { lmx.setTransform(1, 0, 0, 1, 0, 0); lmx.clearRect(0, 0, litMask.width, litMask.height); lmx.setTransform(S / 4, 0, 0, S / 4, 0, 0);
      const dw = DOOR.x1 - DOOR.x0, x1 = DOOR.x1 + W * .01, x0 = lerp(DOOR.x1, DOOR.x0 - W * .02, eio(inn)); lmx.filter = `blur(${(3).toFixed(1)}px)`; lmx.fillStyle = '#fff';
      lmx.beginPath(); lmx.moveTo(x1, DOOR.y0 - H * .03); lmx.lineTo(x0, DOOR.y0 - H * .03); lmx.lineTo(x0 - dw * .1, DOOR.y1 + H * .02); lmx.lineTo(x1, DOOR.y1 + H * .02); lmx.fill(); lmx.filter = 'none';
      tlx.globalCompositeOperation = 'source-over'; tlx.clearRect(0, 0, PW, PH); tlx.drawImage(litImg, 0, 0); tlx.globalCompositeOperation = 'destination-in'; tlx.drawImage(litMask, 0, 0, PW, PH);
      ctx.globalAlpha = clamp(inn * 1.2); ctx.drawImage(tmpL, 0, 0); ctx.globalAlpha = 1; }
    ctx.restore();
    // light: the sky warming, the raking sun across the rock, rays into the doorway, the chamber's glow (all in frame space under the camera)
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
    const warm = ss(T.warm[0], T.warm[1], t), rk = ss(T.rake[0], T.rake[1], t), col = clamp(tw / 4.5);
    if (warm > 0) { ctx.globalCompositeOperation = 'soft-light'; const g = ctx.createRadialGradient(SUN[0], SUN[1], 0, SUN[0], SUN[1], W * 1.1); g.addColorStop(0, `rgba(255,200,130,${.85 * warm})`); g.addColorStop(.45, `rgba(255,180,120,${.35 * warm})`); g.addColorStop(1, 'rgba(255,180,120,0)'); ctx.fillStyle = g; ctx.fillRect(-W, -H, 3 * W, 3 * H);
      ctx.globalCompositeOperation = 'screen'; const g2 = ctx.createRadialGradient(SUN[0], SUN[1], 0, SUN[0], SUN[1], W * .5); g2.addColorStop(0, `rgba(255,236,190,${.55 * warm * (1 - .5 * col)})`); g2.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g2; ctx.fillRect(-W, -H, 3 * W, 3 * H); }
    if (rk > 0) {   // the first sun: its line comes down the face of the rock (slanting, from the right) to the doorway, and stays
      const yl = lerp(H * .24, DOOR.y1 + H * .05, eio(rk)), fade = 1 - .75 * col, sl = H * .09;
      llx.setTransform(1, 0, 0, 1, 0, 0); llx.globalCompositeOperation = 'source-over'; llx.clearRect(0, 0, W, H);
      llx.translate(W / 2, H / 2); llx.scale(z, z); llx.translate(-cx, -cy); llx.drawImage(rockM, 0, 0, W, H);
      llx.globalCompositeOperation = 'source-in'; const g = llx.createLinearGradient(0, yl - H * .06, 0, yl + H * .02); g.addColorStop(0, `rgba(255,196,124,${.95 * fade})`); g.addColorStop(1, 'rgba(255,196,124,0)');
      llx.fillStyle = g; llx.beginPath(); llx.moveTo(-W, -H); llx.lineTo(3 * W, -H); llx.lineTo(3 * W, yl + H * .02 - sl); llx.lineTo(-W, yl + H * .02 + sl * 1.6); llx.closePath(); llx.fill();
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'soft-light'; ctx.drawImage(lightL, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .28; ctx.drawImage(lightL, 0, 0); ctx.restore(); }
    if (inn > 0) {   // rays of the low sun reaching into the doorway, and the chamber's glow
      ctx.globalCompositeOperation = 'screen'; const dw = DOOR.x1 - DOOR.x0;
      for (let i = 0; i < 9; i++) { const yy = lerp(DOOR.y0 + H * .01, DOOR.y1 - H * .02, i / 8), a = (.05 + .035 * Math.sin(i * 2.3 + t * .7)) * inn * (1 - .35 * ss(T.dolly[1], T.dolly[1] + 3, t));
        const g = ctx.createLinearGradient(W * 1.05, yy - H * .08, DOOR.x0 + dw * .3, yy); g.addColorStop(0, 'rgba(255,230,180,0)'); g.addColorStop(.7, `rgba(255,230,180,${a})`); g.addColorStop(1, `rgba(255,236,196,${a * 1.4})`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(W * 1.1, yy - H * .1); ctx.lineTo(W * 1.1, yy - H * .07); ctx.lineTo(DOOR.x0 + dw * .25, yy + H * .008); ctx.lineTo(DOOR.x0 + dw * .25, yy - H * .002); ctx.fill(); }
      const grow = inn * (.75 + .25 * ss(T.dolly[1], T.end, t)), g = ctx.createRadialGradient(DC[0] - dw * .1, DC[1] + H * .02, 0, DC[0] - dw * .1, DC[1] + H * .02, dw * 1.1);
      g.addColorStop(0, `rgba(255,236,196,${.32 * grow})`); g.addColorStop(1, 'rgba(255,220,170,0)'); ctx.fillStyle = g; ctx.fillRect(DC[0] - dw * 1.2, DC[1] - dw * 1.2, dw * 2.4, dw * 2.4);
      // a few motes turning in the light inside the doorway (only there, few)
      const r = rng(17); for (let i = 0; i < 28; i++) { const u = r(), v = r(), ph = r() * 6.28, sp2 = .015 + r() * .02;
        const mxp = DOOR.x0 + dw * ((u + t * sp2) % 1), myp = DOOR.y0 + (DOOR.y1 - DOOR.y0) * (.15 + .7 * ((v + Math.sin(t * .3 + ph) * .03 + 1) % 1)), al = .35 * inn * (.4 + .6 * r()) * Math.sin(Math.PI * ((u + t * sp2) % 1));
        ctx.fillStyle = `rgba(255,240,210,${al})`; ctx.beginPath(); ctx.arc(mxp, myp, .9 + r() * 1.2, 0, 6.283); ctx.fill(); } }
    ctx.restore();
    // the veil scene's door of light gathering into the doorway (match cut in), and the painting coming up out of the dark
    const mk = eio(clamp((t - T.morph[0]) / (T.morph[1] - T.morph[0]))), up = ss(T.morph[0], T.morph[1] + .3, t);
    if (up < 1) { ctx.fillStyle = `rgba(14,10,8,${.55 * (1 - up)})`; ctx.fillRect(0, 0, W, H); }
    if (mk < 1) { const vr = [W * .3, H * .155, W * .7, H * .69], { z: z0, cx: cx0, cy: cy0 } = cam(t), sx = X => W / 2 + (X - cx0) * z0, sy = Y => H / 2 + (Y - cy0) * z0;
      const tr = [sx(DOOR.x0), sy(DOOR.y0), sx(DOOR.x1), sy(DOOR.y1)], q = vr.map((v, i) => lerp(v, tr[i], mk)), a = (1 - mk) * (1 - mk * .3);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = `blur(${(10 + 26 * mk).toFixed(0)}px)`;
      ctx.fillStyle = `rgba(255,246,222,${.95 * a})`; ctx.fillRect(q[0], q[1], q[2] - q[0], q[3] - q[1]);
      ctx.fillStyle = `rgba(255,236,200,${.5 * a})`; ctx.fillRect(q[0] - W * .06, q[1] - H * .03, q[2] - q[0] + W * .12, q[3] - q[1] + H * .06); ctx.restore(); }
    // grade: a warm vignette (no film grain — it eats the knife edges, as in 「부활」)
    const vg = ctx.createRadialGradient(W / 2, H * .46, H * .32, W / 2, H * .5, H * .78); vg.addColorStop(0, 'rgba(20,16,12,0)'); vg.addColorStop(1, 'rgba(20,16,12,.42)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  return { draw, DOOR, cam: t => cam(t) };
}
