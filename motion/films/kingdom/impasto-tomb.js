// impasto-tomb.js — 「kingdom」 6부 첫 장면 C5 · N27 (film 620.5 → 632.4): "십자가에서 죽으신 지 사흘 만에, 그 왕은 / 죽음을 이기고
// 다시 살아나셨습니다." The garden tomb at dawn, painted with the palette knife — the first film's 「부활」 (motion/pilot/rise.html: knife
// strokes laid over a value-planned reference, a grey painting and a colour painting of the same strokes, colour spreading from the empty
// tomb). Ref 「바람과 함께 사라지다」 (1939, OPUSCAR 12): Technicolor impasto, the sky burning gold, dark silhouettes of trees. Engine copied
// from motion/pilot/rise.html (knifePath / paint / grey / layered), recomposed for portrait and this film's beats; rise.html is not changed.
// Round 2 (coordinator 2026-11-20): the stone is a heavy disc with a chiselled rim standing in its groove, the doorway a clean cut in the
// rock with a dark chamber (both laid crisp over the knife strokes — knife strokes made a ball of yarn and a blotchy rim); the sun comes in
// as a soft shaft and lies on the folded linen (bigger, clear) on the stone bench; the colour spreads as a soft warm wash from the doorway
// (the stroke-by-stroke reveal read as orange flames); the dolly ends with the doorway where the courtyard's gateway will be on screen.
//   620.5  in from the veil scene's open-door light (sample-veil.html, veil-temple.js): the door-shaped white light gathers into the
//          tomb's doorway at the same place (match cut on the door of light) while the grey painting comes up out of the dark
//   C5     the world before dawn, grey; the camera creeps; the sky warms behind the hills on the right
//   N27    the first sun comes down the face of the rock to the open doorway and goes IN: a soft shaft across the dark chamber onto the
//          linen cloths lying folded on the bench and the head cloth rolled apart (Jn 20:5–7; nobody there); the camera follows the light
//          in (dolly in, 4.2 s, eased, peak log-zoom .25/s) and settles with the doorway at SCR; the colour washes outward from the doorway,
//          flowers come with it; at the end the doorway fills with warm light (light-to-light into the courtyard's gateway)
// No people. No words. Camera: one slow creep, one eased dolly, the doorway held. The paint never moves; only light moves.
// API: const T = await (await import('./impasto-tomb.js')).build(W, H);  T.draw(ctx, t, T.beats(B))  t = FILM seconds, B = line times
//      (C5, N27, N27b). Pure in t. Needs window.Pilot (lib.js).
const P = window.Pilot;
const { clamp, lerp, ss, eio, rng, fbm, noise, canvas, mix, rgb } = P;

export function beats(B) {
  const c5 = B.C5, n = B.N27, e = B.N27b;
  return {
    start: c5, morph: [c5, c5 + 1.3],             // the veil's door of light gathers into the doorway; the painting comes up
    warm: [c5 + .8, n + 1.2],                     // the sky warms behind the hills
    rake: [n + .3, n + 1.5],                      // the sunlight rakes across the rock to the doorway
    inn: [n + 1.2, n + 2.6],                      // the light goes in: the chamber lights up
    wave0: n + 1.7,                               // the colour starts at the doorway (a soft warm wash outward)
    dolly: [n + 1.0, n + 5.2],                    // the camera follows the light in (4.2 s, eased: peak log-zoom rate .25/s)
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
  // the rock (with the trees) as a mask for the sunrise's light line
  const rockM = canvas(PW >> 1, PH >> 1); { const x = rockM.getContext('2d'), d = x.createImageData(PW >> 1, PH >> 1);
    for (let py = 0; py < PH >> 1; py++) for (let pxx = 0; pxx < PW >> 1; pxx++) { const g = G[(py * 2) * PW + pxx * 2]; if (g === 4 || g === 8 || g === 9 || g === 6 || g === 7) d.data[(py * (PW >> 1) + pxx) * 4 + 3] = g >= 6 ? 150 : 255; }
    x.putImageData(d, 0, 0); }
  const lightL = canvas(W, H), llx = lightL.getContext('2d');
  // the two paintings: grey (before) and colour (after) — the same strokes in both. The stone, the doorway's cut and the chamber are
  // NOT knife-painted (round 2, 2026-11-20: the knife made the stone a ball of yarn and the doorway's rim a blotchy smear): they are laid
  // crisp over the strokes (crisp()), and the chamber is its own sprite so the sun can come into it (interior()).
  const greyImg = canvas(PW, PH), colImg = canvas(PW, PH);
  { const gx = greyImg.getContext('2d'), cx = colImg.getContext('2d');
    gx.filter = 'blur(1.5px)'; gx.drawImage(ref, 0, 0); gx.filter = 'grayscale(.92)'; gx.drawImage(greyImg, 0, 0); gx.filter = 'none';
    cx.filter = 'blur(1.5px)'; cx.drawImage(ref, 0, 0); cx.filter = 'none';
    const L = canvas(PW, PH), lc = L.getContext('2d');
    for (let g = 0; g < NG; g++) { if (g === 5 || g === 8 || g === 9) continue; const mk = groupMask(g);
      for (const [tgt, mode] of [[greyImg, 0], [colImg, 1]]) {
        lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, PW, PH);
        for (const s of strokes) { if (s.grp !== g || (s.flower && mode === 0)) continue; if (mode === 0) paint(lc, s, s.g, s.g2); else paint(lc, s, s.c, s.c2); }
        lc.globalCompositeOperation = 'destination-in'; lc.drawImage(mk, 0, 0); tgt.getContext('2d').drawImage(L, 0, 0); } }
    for (const s of strokes) if (s.flower) paint(cx, s, s.c, s.c2);
    crisp(gx, 0); crisp(cx, 1); }
  // the great stone and the rock-cut doorway, crisp (mode 0 grey · 1 colour)
  function crisp(g, mode) {
    const C = c => mode ? c : grey(c), dw = DOOR.x1 - DOOR.x0, dh = DOOR.y1 - DOOR.y0;
    g.save(); g.setTransform(S, 0, 0, S, 0, 0);
    // the groove cut along the foot of the rock, from the doorway to the left: a dark channel with a lit lip
    { const y0 = H * .655, y1 = H * .676; g.fillStyle = rgb(C([58, 40, 30])); g.beginPath(); g.moveTo(W * .08, y0 + 4); g.lineTo(DOOR.x0 + 6, y0); g.lineTo(DOOR.x0 + 6, y1); g.lineTo(W * .08, y1 + 6); g.fill();
      g.fillStyle = rgb(C([214, 170, 118]), .9); g.fillRect(W * .08, y1 + 2, DOOR.x0 - W * .08 + 6, 5); }
    // the stone: a heavy disc standing on edge in the groove, its face a little turned so its thickness shows on the right (the sun's
    // side); the rim chiselled into short flat facets; tool marks across the face; it casts a shadow onto the rock to its left
    const sx = STONE.x, sy = STONE.y, rx = STONE.rx, ry = STONE.ry, th = rx * .2, r = rng(5);
    const rimPts = (cx0, k) => { const a = []; for (let i = 0; i < 26; i++) { const t = i / 26 * 6.283, j = 1 + (rng(i + 9)() - .5) * .035; a.push([cx0 + Math.cos(t) * rx * k * j, sy + Math.sin(t) * ry * k * j]); } return a; };
    const poly = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
    g.save(); g.filter = `blur(${(10 * S).toFixed(0)}px)`; g.fillStyle = 'rgba(40,24,18,.45)'; g.beginPath(); g.ellipse(sx - rx * .35, sy + ry * .08, rx * .9, ry * .96, 0, 0, 6.283); g.fill(); g.restore();
    g.fillStyle = rgb(C([96, 76, 58])); poly(rimPts(sx + th, 1)); g.fill();                                                         // the far rim / thickness
    g.fillStyle = rgb(C([150, 122, 90])); g.beginPath(); g.rect(sx, sy - ry, th, ry * 2); g.fill();
    { const gr = g.createLinearGradient(sx, 0, sx + th * 1.6, 0); gr.addColorStop(0, rgb(C([168, 136, 98]))); gr.addColorStop(1, rgb(C([214, 178, 128]))); g.fillStyle = gr; poly(rimPts(sx + th * .55, .995)); g.fill(); }   // the edge in the sun
    { const gr = g.createRadialGradient(sx + rx * .35, sy - ry * .35, rx * .1, sx, sy, rx * 1.05); gr.addColorStop(0, rgb(C([226, 200, 156]))); gr.addColorStop(.55, rgb(C([186, 158, 118]))); gr.addColorStop(1, rgb(C([126, 102, 76])));
      g.fillStyle = gr; poly(rimPts(sx, 1)); g.fill(); }                                                                           // the face
    g.strokeStyle = rgb(C([104, 84, 62]), .55); g.lineWidth = 2.2; poly(rimPts(sx, .9)); g.stroke();                               // the chiselled bevel
    g.fillStyle = rgb(C([240, 214, 168]), .28); poly(rimPts(sx, .9)); g.save(); g.clip(); g.beginPath(); g.ellipse(sx + rx * .55, sy - ry * .5, rx * .7, ry * .5, -.5, 0, 6.283); g.fill(); g.restore();
    g.save(); poly(rimPts(sx, .97)); g.clip(); g.lineCap = 'round';                                                                // tool marks: short parallel cuts in rows
    for (let i = 0; i < 160; i++) { const x0 = sx + (r() - .5) * 2 * rx, y0 = sy + (r() - .5) * 2 * ry, l = 5 + r() * 9, a = .45 + (r() - .5) * .25, dk = r() < .55;
      g.strokeStyle = dk ? rgb(C([92, 72, 54]), .22 + .14 * r()) : rgb(C([244, 222, 180]), .14 + .12 * r()); g.lineWidth = 1.2 + r(); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); g.stroke(); }
    g.restore();
    g.fillStyle = rgb(C([150, 112, 78])); g.beginPath(); g.moveTo(sx - rx * 1.1, H * .668); g.lineTo(sx + rx * 1.4, H * .666); g.lineTo(sx + rx * 1.4, H * .684); g.lineTo(sx - rx * 1.1, H * .686); g.fill();   // the groove's front lip hides the stone's foot
    // the doorway: cut straight into the rock — a recessed, squared frame (the lintel's shadow, the left jamb's inner face catching the
    // sun from the right, the threshold), the opening itself is the chamber sprite
    { const m = W * .016; g.fillStyle = rgb(C([132, 92, 70]), .9); g.beginPath(); g.roundRect(DOOR.x0 - m, DOOR.y0 - m, dw + 2 * m, dh + m, DOOR.r + m); g.fill();   // the cut margin, a step back from the face
      g.fillStyle = rgb(C([70, 46, 36]), .55); g.fillRect(DOOR.x0 - m, DOOR.y0 - m, dw + 2 * m, m * .55);                       // the lintel's shadow on it
      g.fillStyle = rgb(C([22, 14, 10])); g.beginPath(); g.roundRect(DOOR.x0, DOOR.y0, dw, dh, [DOOR.r, DOOR.r, 0, 0]); g.fill();
      g.fillStyle = rgb(C([206, 158, 108])); g.fillRect(DOOR.x0 - m * 1.3, DOOR.y1, dw + m * 2.6, H * .009);                     // the threshold
      g.fillStyle = rgb(C([92, 64, 46]), .6); g.fillRect(DOOR.x0 - m * 1.3, DOOR.y1 + H * .009, dw + m * 2.6, H * .004); }
    g.restore(); }
  // the chamber seen through the doorway, crisp, at 3× (two states: in the dark · with the sun in it): the back wall, the burial bench cut
  // along it, the linen cloths lying folded on the bench, the head cloth rolled up by itself at its end (Jn 20:5–7). Nobody.
  const IS = 3, DW = DOOR.x1 - DOOR.x0, DH = DOOR.y1 - DOOR.y0, BY = DH * .58;
  const interior = lit => { const c = canvas(Math.ceil(DW * IS), Math.ceil(DH * IS)), g = c.getContext('2d'); g.scale(IS, IS);
    const cl = new Path2D(); cl.roundRect(0, 0, DW, DH, [DOOR.r, DOOR.r, 0, 0]); g.clip(cl);
    let gr = g.createLinearGradient(0, 0, 0, DH); gr.addColorStop(0, '#120b07'); gr.addColorStop(1, '#22160e'); g.fillStyle = gr; g.fillRect(0, 0, DW, DH);   // the back wall in the dark
    g.fillStyle = '#2c1d13'; g.fillRect(0, BY, DW, DH * .07);                                                                     // the bench top
    g.fillStyle = '#1a110a'; g.fillRect(0, BY + DH * .07, DW, DH * .2); g.fillStyle = '#140d08'; g.fillRect(0, BY + DH * .27, DW, DH);   // its face, the floor
    // the linen: a long cloth folded lengthwise, lying along the bench (soft rolls, the folds' shadows), and the head cloth rolled apart
    const cloth = (x0, x1, h, a, b) => { const p = new Path2D(), y1 = BY + 1.5; p.moveTo(x0, y1); p.bezierCurveTo(x0 - h * .25, y1 - h * .55, x0 + h * .2, y1 - h * 1.05, x0 + h * .9, y1 - h * a);
      p.bezierCurveTo((x0 + x1) * .5, y1 - h * 1.1, (x0 + x1) * .5, y1 - h * .86, x1 - h * .8, y1 - h * b); p.bezierCurveTo(x1 - h * .1, y1 - h * .92, x1 + h * .25, y1 - h * .45, x1, y1); p.closePath(); return p; };
    const L1 = cloth(DW * .08, DW * .7, DH * .1, 1.0, .95), L2 = cloth(DW * .77, DW * .93, DH * .095, 1.02, 1.0);
    const base = lit ? [252, 240, 218] : [86, 76, 66], sh = lit ? [196, 150, 108] : [48, 40, 34];
    for (const [p, x0, x1] of [[L1, DW * .08, DW * .7], [L2, DW * .77, DW * .93]]) { g.fillStyle = rgb(base); g.fill(p); g.save(); g.clip(p);
      gr = g.createLinearGradient(0, BY - DH * .11, 0, BY); gr.addColorStop(0, rgb(base, 0)); gr.addColorStop(1, rgb(sh, .75)); g.fillStyle = gr; g.fillRect(x0 - 4, BY - DH * .12, x1 - x0 + 8, DH * .12);
      g.lineCap = 'round'; const n = x1 - x0 > DW * .3 ? 7 : 2;
      for (let i = 1; i < n; i++) { const xx = lerp(x0, x1, (i + .25 * Math.sin(i * 2.7)) / n); g.strokeStyle = rgb(sh, .6); g.lineWidth = 1.1; g.beginPath(); g.moveTo(xx, BY - DH * .085); g.bezierCurveTo(xx + 2, BY - DH * .055, xx - 1.5, BY - DH * .03, xx + 1, BY); g.stroke();
        g.strokeStyle = rgb([255, 252, 240], lit ? .5 : .12); g.lineWidth = .8; g.beginPath(); g.moveTo(xx - 1.6, BY - DH * .08); g.bezierCurveTo(xx + .4, BY - DH * .055, xx - 3, BY - DH * .03, xx - .6, BY); g.stroke(); }
      if (n === 2) { g.strokeStyle = rgb(sh, .7); g.lineWidth = 1; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse((x0 + x1) / 2, BY - DH * .048, (x1 - x0) * (.18 + k * .12), DH * .035, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } }   // the wrapping of the rolled cloth
      g.restore(); }
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(DW * .05, BY + 1.5, DW * .9, 2.5);                                                 // contact shadow on the bench
    if (lit) {   // the sun's soft patch: on the bench and the linen, a little up the back wall and down the bench's face (warm, feathered)
      g.globalCompositeOperation = 'screen'; gr = g.createRadialGradient(DW * .38, BY - DH * .02, 0, DW * .38, BY - DH * .02, DW * .55); gr.addColorStop(0, 'rgba(255,196,120,.75)'); gr.addColorStop(.5, 'rgba(232,150,84,.32)'); gr.addColorStop(1, 'rgba(200,120,60,0)');
      g.fillStyle = gr; g.fillRect(0, 0, DW, DH); g.globalCompositeOperation = 'source-over'; }
    g.filter = 'none'; return c; };
  const INT_DIM = interior(false), INT_LIT = interior(true);
  // the colour wash: a soft warm front advancing from the doorway (round 2: the stroke-by-stroke reveal read as orange flames)
  const WM = canvas(PW >> 2, PH >> 2), wmx = WM.getContext('2d'), tmp = canvas(PW, PH), tx = tmp.getContext('2d');
  // ---------------------------------------------------------------- frame
  let T = null;
  // the camera: a creep; then the dolly into the doorway (eased, peak log-zoom .25/s) that ends with the doorway at the place where the
  // courtyard's gateway will be (SCR — light-to-light match on the dissolve); then the doorway held there while the zoom drifts on
  const SCR = [W * .593, H * .365];
  function cam(t) {
    const c = ss(T.start, T.dolly[0], t) * .055, d = eio(clamp((t - T.dolly[0]) / (T.dolly[1] - T.dolly[0]))), af = clamp((t - T.dolly[1]) / 4);
    const z = (1 + c) * Math.exp(Math.log(1.5 / 1.055) * d) * (1 + .025 * af);
    const c0 = [W * .5, lerp(H * .5, H * .52, ss(T.start, T.dolly[0], t))];
    if (d >= 1) return { z, cx: DC[0] - (SCR[0] - W / 2) / z, cy: DC[1] - (SCR[1] - H / 2) / z };
    const z1 = 1.5, c1 = [DC[0] - (SCR[0] - W / 2) / z1, DC[1] - (SCR[1] - H / 2) / z1];
    return { z, cx: lerp(c0[0], c1[0], d), cy: lerp(c0[1], c1[1], d) };
  }
  function draw(ctx, t, TT) {
    T = TT;
    const tw = t - T.wave0, { z, cx, cy } = cam(t), view = g => { g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy); g.scale(1 / S, 1 / S); };
    ctx.save(); ctx.fillStyle = '#100c0a'; ctx.fillRect(0, 0, W, H);
    ctx.save(); view(ctx); ctx.drawImage(greyImg, 0, 0);
    if (tw > 0) { const R = H * 1.5 * S * eio(clamp(tw / 5.2)) + H * .05 * S, F = H * .26 * S; wmx.setTransform(.25, 0, 0, .25, 0, 0); wmx.clearRect(0, 0, PW, PH);
      const gr = wmx.createRadialGradient(DC[0] * S, DC[1] * S, Math.max(0, R - F), DC[0] * S, DC[1] * S, R + 1); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); wmx.fillStyle = gr; wmx.fillRect(0, 0, PW, PH);
      tx.globalCompositeOperation = 'source-over'; tx.clearRect(0, 0, PW, PH); tx.drawImage(colImg, 0, 0); tx.globalCompositeOperation = 'destination-in'; tx.drawImage(WM, 0, 0, PW, PH); ctx.drawImage(tmp, 0, 0);
      const fr = clamp(1 - tw / 6.5); if (fr > 0) { ctx.globalCompositeOperation = 'soft-light'; const g2 = ctx.createRadialGradient(DC[0] * S, DC[1] * S, Math.max(0, R - F * 1.2), DC[0] * S, DC[1] * S, R + F * .3);   // the warm front itself
        g2.addColorStop(0, 'rgba(255,190,120,0)'); g2.addColorStop(.7, `rgba(255,190,120,${.55 * fr})`); g2.addColorStop(1, 'rgba(255,190,120,0)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, PW, PH); ctx.globalCompositeOperation = 'source-over'; } }
    ctx.restore();
    // the chamber: dark, then the sun comes in and lies on the bench and the linen
    const inn = ss(T.inn[0], T.inn[1], t), fill = ss(T.end - 1.6, T.end - .45, t);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
    ctx.drawImage(INT_DIM, DOOR.x0, DOOR.y0, DW, DH); if (inn > 0) { ctx.globalAlpha = inn; ctx.drawImage(INT_LIT, DOOR.x0, DOOR.y0, DW, DH); ctx.globalAlpha = 1; }
    // light: the sky warming, the first sun down the rock, the shaft into the doorway, the chamber filling at the end
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
    if (inn > 0) {   // a soft shaft of the low sun: in at the top right of the doorway, down across the dark to the bench and the linen
      ctx.globalCompositeOperation = 'screen'; ctx.save(); const cl = new Path2D(); cl.rect(DOOR.x0 - W * .3, DOOR.y0 - H * .2, DW + W * .6, DH + H * .25); ctx.clip(cl);
      ctx.filter = `blur(${(DW * .06 * z).toFixed(1)}px)`;
      const top0 = [DOOR.x1 + DW * .9, DOOR.y0 - DH * .55], top1 = [DOOR.x1 + DW * 1.25, DOOR.y0 - DH * .2], b0 = [DOOR.x0 + DW * .1, DOOR.y0 + BY - DH * .03], b1 = [DOOR.x0 + DW * .72, DOOR.y0 + BY + DH * .02];
      const g = ctx.createLinearGradient(top0[0], top0[1], b0[0], b0[1]); g.addColorStop(0, 'rgba(255,226,170,0)'); g.addColorStop(.5, `rgba(255,222,164,${.16 * inn})`); g.addColorStop(1, `rgba(255,232,186,${.34 * inn})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(...top0); ctx.lineTo(...top1); ctx.lineTo(...b1); ctx.lineTo(...b0); ctx.closePath(); ctx.fill(); ctx.filter = 'none'; ctx.restore();
      // a few motes turning in the shaft (only there, few)
      const r = rng(17); for (let i = 0; i < 26; i++) { const u = r(), v = r(), ph = r() * 6.28, sp2 = .012 + r() * .016, k = (u + t * sp2) % 1;
        const ax = lerp(lerp(top0[0], top1[0], v), lerp(b0[0], b1[0], v), k), ay = lerp(lerp(top0[1], top1[1], v), lerp(b0[1], b1[1], v), k) + Math.sin(t * .4 + ph) * 3;
        if (ax > DOOR.x1 + 4 || ay < DOOR.y0) continue; ctx.fillStyle = `rgba(255,240,210,${.4 * inn * Math.sin(Math.PI * k)})`; ctx.beginPath(); ctx.arc(ax, ay, .8 + r() * .9, 0, 6.283); ctx.fill(); }
      // light-to-light: at the end the doorway fills with warm light (the courtyard's gateway glare takes it over on the dissolve)
      if (fill > 0) { const g3 = ctx.createRadialGradient(DC[0], DC[1], 0, DC[0], DC[1], DH * (.6 + .5 * fill)); g3.addColorStop(0, `rgba(255,240,214,${.95 * fill})`); g3.addColorStop(.55, `rgba(255,226,180,${.55 * fill})`); g3.addColorStop(1, 'rgba(255,214,160,0)');
        ctx.fillStyle = g3; ctx.fillRect(DC[0] - DH * 1.2, DC[1] - DH * 1.2, DH * 2.4, DH * 2.4); } }
    ctx.restore();
    // the veil scene's door of light gathering into the doorway (match cut in), and the painting coming up out of the dark
    const mk = eio(clamp((t - T.morph[0]) / (T.morph[1] - T.morph[0]))), up = ss(T.morph[0], T.morph[1] + .3, t);
    if (up < 1) { ctx.fillStyle = `rgba(14,10,8,${.55 * (1 - up)})`; ctx.fillRect(0, 0, W, H); }
    if (mk < 1) { const vr = [W * .3, H * .155, W * .7, H * .69], sx = X => W / 2 + (X - cx) * z, sy = Y => H / 2 + (Y - cy) * z;
      const tr = [sx(DOOR.x0), sy(DOOR.y0), sx(DOOR.x1), sy(DOOR.y1)], q = vr.map((v, i) => lerp(v, tr[i], mk)), a = (1 - mk) * (1 - mk * .3);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = `blur(${(10 + 26 * mk).toFixed(0)}px)`;
      ctx.fillStyle = `rgba(255,246,222,${.95 * a})`; ctx.fillRect(q[0], q[1], q[2] - q[0], q[3] - q[1]);
      ctx.fillStyle = `rgba(255,236,200,${.5 * a})`; ctx.fillRect(q[0] - W * .06, q[1] - H * .03, q[2] - q[0] + W * .12, q[3] - q[1] + H * .06); ctx.restore(); }
    // grade: a warm vignette (no film grain — it eats the knife edges, as in 「부활」)
    const vg = ctx.createRadialGradient(W / 2, H * .46, H * .32, W / 2, H * .5, H * .78); vg.addColorStop(0, 'rgba(20,16,12,0)'); vg.addColorStop(1, 'rgba(20,16,12,.42)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  return { draw, DOOR, SCR, cam: t => cam(t) };
}

