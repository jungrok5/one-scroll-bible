// illum-world.js — 「kingdom」 6부 끝, N29 · L10 · Q16 (film 700.3–716.6): "그리고 예수님이 다시 오시는 날, 그 나라는 다 이루어집니다"
// — an illuminated manuscript page lying in candlelight: vellum, a lapis bar border with white tracery and gold, a vine of ivy in
// gold leaf down the margin, rows of script-like ornament (strokes only — no letter is readable), and in the middle a pointed arch
// framed in lapis with gold stars: a small world of villages, fields and a lake under a burnished gold-leaf sky with punched dots.
// After 「브레이브하트」(1995, OPUSCAR 68): burnished gold with punched dots, lapis and vermilion, a miniature framed like a window.
// Beats (every time from the line times):
//   700.3  match cut from the night earth's gold lights (part 6a): the page is still in the dark, only its gold catches — points
//          of gold where the earth's lamps were; the candle comes up over 1.6 s.
//   N29    the gold leaf is laid along the frame round the miniature (a bright head runs round the band; 금빛이 테두리를 따라 퍼짐).
//          The camera pushes in on the miniature the whole time (slow, log zoom .64 → 1).
//   Q16    a glint sweeps every gold surface at once (the sky of the small world, the band, the stars, the ivy) — 금박이 빛을 받아
//          반짝이며 한 면을 채움 — then the miniature dissolves into the 3D world it was painted from (gold-world3d.js paint: the
//          same camera and geometry, so nothing shifts) and the page's frame opens out past the screen; the world rises.
// Skills read first (sources copied, never edited): motion-skills canvas-film kits/illuminated (kit-illuminated.js — gold leaf
//   texture, punch, fillInk, the candle sheen and glint), the first film's motion/pilot/kingdom.html (the page in candlelight);
//   heritage-blueprint / the first film's 「귀환」 for the 2D → 3D develop.
// No words: the script rows are stroke rhythm only. Deterministic (seeded); pure in t.
// API: const IW = buildIllum(W, H, paint, B)  (paint from gold-world3d.js);  IW.draw(ctx, t, draw3D)  draw3D(ctx) draws the 3D frame.
export function buildIllum(W, H, paint, B) {
  const P = window.Pilot, I = window.Illum, { clamp, lerp, ss, eio, rng, fbm, canvas } = P;
  if (!I.init.done) { I.init(); I.init.done = true; }
  const T = { start: B.N29, light: [B.N29 + .15, B.N29 + 1.9], lay: [B.N29 + 1.6, B.L10 - .3], q: B.Q16, glint: [B.Q16 + .05, B.Q16 + 1.55],
    dev: [B.Q16 + 1.0, B.Q16 + 3.6], open: [B.Q16 + 3.0, B.Q16 + 7.4], push: [B.N29, B.Q16 + 1.0] };
  // develop coordinates D: at zoom 1 a D point lands on the screen at (x, y − DY) — the miniature then sits exactly on the 3D frame
  const DY = 80, C0 = [540, 900];
  const ARCH = { x: 0, y: 300, w: 1080, h: 1200, r: .66 };
  const FR = 46, PAGE = { x: -176, y: 104, w: 1432, h: 1666 };
  function archP(o = ARCH, inset = 0) { const x0 = o.x + inset, w = o.w - 2 * inset, y0 = o.y + inset, h = o.h - inset, p = new Path2D(), half = w / 2, r = w * o.r, al = Math.acos((r - half) / r), base = y0 + r * Math.sin(al);
    p.moveTo(x0, y0 + h); p.lineTo(x0, base); p.arc(x0 + r, base, r, Math.PI, Math.PI + al, false); p.arc(x0 + w - r, base, r, -al, 0, false); p.lineTo(x0 + w, y0 + h); p.closePath(); return p; }
  const RS = 1.5;                                   // page canvas px per D unit (crisp when the frame opens past the screen)
  const PX0 = PAGE.x - 40, PY0 = PAGE.y - 40, PCW = Math.ceil((PAGE.w + 80) * RS), PCH = Math.ceil((PAGE.h + 80) * RS);
  const mkP = () => { const c = canvas(PCW, PCH), g = c.getContext('2d'); g.setTransform(RS, 0, 0, RS, -PX0 * RS, -PY0 * RS); return [c, g]; };
  const INK = I.INK, LAP = I.LAP, VERM = I.VERM, WHT = '#fbf6e6';
  // ---------------------------------------------------------------- vellum
  const vel = (() => { const n = 384, c = canvas(n, n), x = c.getContext('2d'), d = x.createImageData(n, n), base = [236, 220, 180];
    for (let y = 0; y < n; y++) for (let px = 0; px < n; px++) { const v = (fbm(px * .02, y * .02, 4) - .5) * 30 + (fbm(px * .15 + 7, y * .15, 2) - .5) * 9, k = (y * n + px) * 4;
      d.data[k] = base[0] + v; d.data[k + 1] = base[1] + v * .95 - 2; d.data[k + 2] = base[2] + v * .8 - 6; d.data[k + 3] = 255; } x.putImageData(d, 0, 0); return c; })();
  // ---------------------------------------------------------------- the page (static) with the arch as a hole, and its gold layer
  const [pageC, pg] = mkP(), [goldC, gg] = mkP(), [boleC, bg] = mkP();
  const bandPath = (() => { const p = new Path2D(); p.rect(ARCH.x - FR, ARCH.y - FR, ARCH.w + 2 * FR, ARCH.h + 2 * FR); p.rect(ARCH.x - FR + 22, ARCH.y - FR + 22, ARCH.w + 2 * FR - 44, ARCH.h + 2 * FR - 44); return p; })();
  {
    const g = pg, r = rng(4);
    g.save(); g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 60; g.shadowOffsetY = 22; g.fillStyle = '#d9c79c'; g.fillRect(PAGE.x, PAGE.y, PAGE.w, PAGE.h); g.restore();
    g.save(); g.beginPath(); g.rect(PAGE.x, PAGE.y, PAGE.w, PAGE.h); g.clip(); g.fillStyle = g.createPattern(vel, 'repeat'); g.fillRect(PAGE.x, PAGE.y, PAGE.w, PAGE.h);
    const e = g.createRadialGradient(PAGE.x + PAGE.w / 2, PAGE.y + PAGE.h / 2, PAGE.w * .35, PAGE.x + PAGE.w / 2, PAGE.y + PAGE.h / 2, PAGE.h * .72); e.addColorStop(0, 'rgba(120,80,40,0)'); e.addColorStop(1, 'rgba(110,72,36,.38)');
    g.fillStyle = e; g.fillRect(PAGE.x, PAGE.y, PAGE.w, PAGE.h);
    g.fillStyle = 'rgba(120,90,50,.35)'; for (let i = 0; i < 1600; i++) { g.globalAlpha = .12 + r() * .3; g.beginPath(); g.arc(PAGE.x + r() * PAGE.w, PAGE.y + r() * PAGE.h, .6 + r() * 1.2, 0, 6.28); g.fill(); } g.globalAlpha = 1;
    // ruling lines (dry point, faint) for the script rows
    g.strokeStyle = 'rgba(150,110,70,.14)'; g.lineWidth = .8; for (const y0 of [206, 248]) { g.beginPath(); g.moveTo(PAGE.x + 120, y0); g.lineTo(PAGE.x + PAGE.w - 120, y0); g.stroke(); }
    g.restore();
    // the bar border (left and top): lapis | gold | white tracery, a vermilion roundel at the corner
    const bw = 30, segs = [[PAGE.x + 34, PAGE.y + 34, bw, PAGE.h - 68], [PAGE.x + 34, PAGE.y + 34, PAGE.w - 68, bw]];
    for (const [x0, y0, ww, hh] of segs) { I.fillInk(g, I.rectP(x0, y0, ww, hh), LAP, 2); const vt = hh > ww;
      I.gold(g, vt ? I.rectP(x0 + bw * .32, y0 + bw * .32, bw * .36, hh - bw * .64) : I.rectP(x0 + bw * .32, y0 + bw * .32, ww - bw * .64, bw * .36), { lw: 1.4 });
      g.fillStyle = 'rgba(250,246,232,.85)'; for (let s = 10; s < (vt ? hh : ww) - 10; s += 22) { const qx = vt ? x0 + bw * .16 : x0 + s, qy = vt ? y0 + s : y0 + bw * .16; g.beginPath(); g.arc(qx, qy, 1.9, 0, 6.28); g.fill();
        const zx = vt ? x0 + bw * .84 : x0 + s + 11, zy = vt ? y0 + s + 11 : y0 + bw * .84; g.beginPath(); g.arc(zx, zy, 1.9, 0, 6.28); g.fill(); } }
    { const cx = PAGE.x + 34 + bw / 2, cy = PAGE.y + 34 + bw / 2, a = new Path2D(); a.arc(cx, cy, bw * 1.15, 0, 6.28); I.fillInk(g, a, VERM, 2); const b = new Path2D(); b.arc(cx, cy, bw * .6, 0, 6.28); I.gold(g, b, { lw: 1.4 });
      g.fillStyle = WHT; for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4; g.beginPath(); g.arc(cx + Math.cos(an) * bw * .88, cy + Math.sin(an) * bw * .88, 2.2, 0, 6.28); g.fill(); } }
    // a vine down the right margin and along the foot: ink stems, vermilion and lapis buds, gold ivy leaves
    const vine = [], vr = rng(12);
    { let x = PAGE.x + PAGE.w - 70, y = PAGE.y + 120; while (y < PAGE.y + PAGE.h - 110) { const nx = PAGE.x + PAGE.w - 70 + Math.sin(y * .012) * 18, ny = y + 26; vine.push([x, y, nx, ny]); x = nx; y = ny; } }
    g.strokeStyle = INK; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); vine.forEach(([a, b, c, d], i) => { if (!i) g.moveTo(a, b); g.lineTo(c, d); }); g.stroke();
    const leaf = (x, y, s, an) => { const p = new Path2D(); p.moveTo(x, y); const c = Math.cos(an), sn = Math.sin(an), L = 26 * s, Wd = 12 * s;
      p.quadraticCurveTo(x + c * L * .5 - sn * Wd, y + sn * L * .5 + c * Wd, x + c * L, y + sn * L); p.quadraticCurveTo(x + c * L * .5 + sn * Wd, y + sn * L * .5 - c * Wd, x, y); return p; };
    vine.forEach(([a, b], i) => { if (i % 3) return; const sd = (i / 3) % 2 ? 1 : -1; const lp = leaf(a, b, .9 + vr() * .3, sd > 0 ? -.4 : Math.PI + .4); I.gold(g, lp, { lw: 1.4 }); g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo(a + sd * 10, b + 4, a + sd * 18, b - 6); g.stroke();
      if (i % 6 === 0) { const bud = I.ell(a - sd * 14, b + 8, 6.5, 9, sd * .5); I.fillInk(g, bud, (i / 6) % 2 ? VERM : LAP, 1.6); } });
    // the script-like rows under the miniature: textura rhythm (minims, feet, a few ascenders) — never a letter
    { const rr = rng(77); for (const [y0, x0, x1] of [[206, PAGE.x + 190, PAGE.x + PAGE.w - 130], [248, PAGE.x + 190, PAGE.x + PAGE.w - 380]]) {
      let x = x0; g.strokeStyle = 'rgba(38,24,14,.9)'; g.lineCap = 'butt';
      while (x < x1) { const n = 2 + (rr() * 5 | 0); for (let k = 0; k < n && x < x1; k++) { const hgt = 22, asc = rr() < .12 ? 10 : 0, des = rr() < .06 ? 6 : 0;
          g.lineWidth = 4.2; g.beginPath(); g.moveTo(x, y0 - hgt - asc); g.lineTo(x, y0 + des); g.stroke();
          g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 2, y0 - hgt + 3); g.lineTo(x + 3, y0 - hgt - 1); g.moveTo(x - 2, y0 + 1); g.lineTo(x + 3, y0 - 3); g.stroke(); x += 8.5; }
        x += 13 + rr() * 6; if (rr() < .07) { g.fillStyle = VERM; g.fillRect(x - 6, y0 - 14, 7, 7); x += 12; } } } }
    // the decorated block at the head of the rows (a lapis square, vermilion field, gold vine — an ornament, no letter in it)
    { const x0 = PAGE.x + 92, y0 = 178, s = 74; I.fillInk(g, I.rectP(x0, y0, s, s), LAP, 2.2); I.fillInk(g, I.rectP(x0 + 9, y0 + 9, s - 18, s - 18), VERM, 1.6);
      const knot = new Path2D(); for (let k = 0; k < 4; k++) { const an = k * Math.PI / 2 + Math.PI / 4; knot.addPath(leaf(x0 + s / 2, y0 + s / 2, 1.1, an)); } I.gold(g, knot, { lw: 1.4 });
      const ring = new Path2D(); ring.arc(x0 + s / 2, y0 + s / 2, 9, 0, 6.28); I.fillInk(g, ring, WHT, 1.4); }
    // the frame round the arch: lapis with gold stars (the band itself is drawn in two states: bole and gold)
    I.fillInk(g, I.rectP(ARCH.x - FR, ARCH.y - FR, ARCH.w + 2 * FR, ARCH.h + 2 * FR), LAP, 2.5);
    { const sr = rng(5); g.fillStyle = 'rgba(255,240,200,.9)'; const stars = [];
      for (let i = 0; i < 60; i++) { const x = ARCH.x - FR + 20 + sr() * (ARCH.w + 2 * FR - 40), y = ARCH.y - FR + 20 + sr() * (ARCH.h * .5); stars.push([x, y]); }
      const ap = archP(); for (const [x, y] of stars) { if (g.isPointInPath(ap, x * RS - PX0 * RS, y * RS - PY0 * RS)) continue; const st = new Path2D(); for (let k = 0; k < 10; k++) { const an = k * Math.PI / 5 - Math.PI / 2, rad = k % 2 ? 2.6 : 7; st[k ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rad, y + Math.sin(an) * rad); } st.closePath(); I.gold(g, st, { lw: .8 }); } }
    // the arch's rim: vermilion with a white dotted line (on the page, so it opens out with it)
    { const ap = archP(); g.save(); g.lineWidth = 12; g.strokeStyle = VERM; g.stroke(ap); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(ap); g.setLineDash([1, 10]); g.lineCap = 'round'; g.lineWidth = 3.4; g.strokeStyle = WHT; g.stroke(ap); g.restore(); }
    // cut the arch out of the page (the miniature/world shows through)
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(archP(ARCH, 5)); g.restore();
    // the band: red bole (before the gold is laid) and the burnished gold with punched dots
    bg.fillStyle = '#9a4a2c'; bg.fill(bandPath, 'evenodd'); bg.strokeStyle = INK; bg.lineWidth = 2; bg.stroke(bandPath);
    I.gold(gg, bandPath, { lw: 2 }); gg.save(); gg.clip(bandPath, 'evenodd'); I.punch(gg, [ARCH.x - FR, ARCH.y - FR, ARCH.x + ARCH.w + FR, ARCH.y + ARCH.h + FR, 22]); gg.restore();
    gg.save(); gg.globalCompositeOperation = 'destination-in'; gg.fill(bandPath, 'evenodd'); gg.restore();
  }
  // the band's centre line as a path from the top-left corner round both ways (for the gold being laid)
  const bandLine = (() => { const x0 = ARCH.x - FR + 11, y0 = ARCH.y - FR + 11, x1 = ARCH.x + ARCH.w + FR - 11, y1 = ARCH.y + ARCH.h + FR - 11;
    return { a: [[x0, y0], [x1, y0], [x1, y1]], b: [[x0, y0], [x0, y1], [x1, y1]], len: (x1 - x0) + (y1 - y0) }; })();
  const along = (pts, d) => { for (let i = 0; i + 1 < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay); if (d <= L) return [ax + (bx - ax) * d / L, ay + (by - ay) * d / L]; d -= L; } return pts[pts.length - 1]; };
  // ---------------------------------------------------------------- the miniature (static): gold sky, the painted world, water, ink
  const [miniC, mg] = mkP(), [skyMask, sm] = mkP();
  {
    const ab = archP();
    mg.save(); mg.clip(ab);
    // the gold-leaf sky with punched rosettes (the whole arch first; the land covers its lower part)
    mg.fillStyle = '#b8862e'; mg.fillRect(ARCH.x, ARCH.y, ARCH.w, ARCH.h);
    I.gold(mg, I.rectP(ARCH.x, ARCH.y, ARCH.w, ARCH.h), { lw: 0, punch: [ARCH.x, ARCH.y, ARCH.x + ARCH.w, ARCH.y + paint.horizonY + DY + 40, 44] });
    // the world
    mg.drawImage(paint.color, 0, DY);
    // water: rows of small pale wave strokes (the illuminator's water), only on the lake
    { const wc = canvas(W, H), wx = wc.getContext('2d'), rr = rng(21); wx.lineCap = 'round';
      for (let y = paint.horizonY; y < H; y += 9) { const s = clamp((y - paint.horizonY) / 700, .3, 1.2); for (let x = (y * 13) % 31; x < W; x += 46 * s + rr() * 40 * s) {
          wx.strokeStyle = rr() < .5 ? 'rgba(240,244,250,.75)' : 'rgba(150,180,230,.7)'; wx.lineWidth = 1.2 + .8 * s; wx.beginPath(); wx.moveTo(x, y); wx.quadraticCurveTo(x + 5 * s, y - 3.5 * s, x + 10 * s, y); wx.quadraticCurveTo(x + 15 * s, y + 3 * s, x + 20 * s, y); wx.stroke(); } }
      wx.globalCompositeOperation = 'destination-in'; wx.drawImage(paint.water, 0, 0); mg.drawImage(wc, 0, DY); }
    // paint texture (a little mottling in the flat colour, as tempera) and the ink
    mg.globalCompositeOperation = 'multiply'; mg.globalAlpha = .55; mg.fillStyle = mg.createPattern(vel, 'repeat'); mg.fillRect(ARCH.x, ARCH.y, ARCH.w, ARCH.h); mg.globalAlpha = 1; mg.globalCompositeOperation = 'source-over';
    mg.drawImage(paint.ink, 0, DY);
    mg.restore();
    // where the gold shows in the miniature (the sky) — for the glint
    sm.save(); sm.clip(ab); sm.fillStyle = '#fff'; sm.fillRect(ARCH.x, ARCH.y, ARCH.w, ARCH.h); sm.globalCompositeOperation = 'destination-out'; sm.drawImage(paint.color, 0, DY); sm.restore();
  }
  // ---------------------------------------------------------------- the desk (walnut in candlelight)
  const desk = (() => { const c = canvas(W, H), x = c.getContext('2d'), d = x.createImageData(W >> 1, H >> 1), r = rng(8), w2 = W >> 1, h2 = H >> 1;
    for (let y = 0; y < h2; y++) for (let px = 0; px < w2; px++) { const gr = fbm(px * .004 + y * .0004, y * .06, 3), n = fbm(px * .03, y * .03, 2), k = (y * w2 + px) * 4, v = 44 + gr * 30 + n * 9;
      d.data[k] = v * 1.25; d.data[k + 1] = v * .85; d.data[k + 2] = v * .55; d.data[k + 3] = 255; }
    const t = canvas(w2, h2); t.getContext('2d').putImageData(d, 0, 0); x.imageSmoothingEnabled = true; x.drawImage(t, 0, 0, W, H); return c; })();
  // ---------------------------------------------------------------- frame
  const O = canvas(W, H), og = O.getContext('2d');
  const zoomAt = t => { const k = clamp((t - T.push[0]) / (T.push[1] - T.push[0])), a = .18, v = 1 / (1 - a), e = k < a ? v * k * k / (2 * a) : k > 1 - a ? 1 - v * (1 - k) * (1 - k) / (2 * a) : v * (k - a / 2);
    return .64 * Math.pow(1 / .64, e); };   // log zoom: even apparent speed, eased ends
  const sOf = t => { if (t < T.open[0]) return zoomAt(t); const k = eio((t - T.open[0]) / (T.open[1] - T.open[0])); return Math.pow(2.3, k); };
  const xf = (g, s) => { g.translate(540, C0[1] - DY); g.scale(s, s); g.translate(-C0[0], -C0[1]); };   // D → screen (zoom 1: y − DY)
  function lightK(t) { return .08 + .92 * ss(T.light[0], T.light[1], t); }
  function draw(ctx, t, draw3D) {
    const s = sOf(t), dev = ss(T.dev[0], T.dev[1], t), open = clamp((t - T.open[0]) / (T.open[1] - T.open[0])), lk = lightK(t), fl = 1 + .035 * Math.sin(t * 6.1) * Math.sin(t * 2.3 + 1) + .02 * Math.sin(t * 13.7);
    const glint = t >= T.glint[0] && t <= T.glint[1] ? (t - T.glint[0]) / (T.glint[1] - T.glint[0]) : -1;
    if (dev > 0 && draw3D) draw3D(ctx); else { ctx.fillStyle = '#060403'; ctx.fillRect(0, 0, W, H); }
    // the miniature (under the page; while the develop runs it dissolves into the world behind it)
    if (dev < 1) { ctx.save(); xf(ctx, s); ctx.globalAlpha = 1 - dev; ctx.drawImage(miniC, PX0, PY0, PCW / RS, PCH / RS); ctx.restore(); }
    // the desk + the page (with its hole), drawn together and faded out as the frame opens past the screen
    const oa = 1 - ss(.35, 1, open); if (oa > 0) {
      og.setTransform(1, 0, 0, 1, 0, 0); og.globalAlpha = 1; og.globalCompositeOperation = 'source-over'; og.clearRect(0, 0, W, H);
      og.drawImage(desk, 0, 0);   // (always: the page grows over it — dropping it when the frame starts to open made a pop)
      og.save(); xf(og, s); og.drawImage(pageC, PX0, PY0, PCW / RS, PCH / RS);
      // the band: bole, then the gold laid round it from the top-left corner both ways (a bright head where it is being laid)
      const lay = eio(clamp((t - T.lay[0]) / (T.lay[1] - T.lay[0])));
      og.drawImage(boleC, PX0, PY0, PCW / RS, PCH / RS);
      if (lay > 0) { const tmp = scratch(), tg = tmp.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, PCW, PCH); tg.drawImage(goldC, 0, 0);
        tg.globalCompositeOperation = 'destination-in'; tg.setTransform(RS, 0, 0, RS, -PX0 * RS, -PY0 * RS); tg.lineWidth = 30; tg.lineCap = 'butt';
        for (const pts of [bandLine.a, bandLine.b]) { tg.beginPath(); tg.moveTo(...pts[0]); let d = 0; const D2 = lay * bandLine.len; for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d + L >= D2) { const k = (D2 - d) / L; tg.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k); break; } tg.lineTo(...pts[i]); d += L; } tg.stroke(); }
        tg.globalCompositeOperation = 'source-over'; og.drawImage(tmp, PX0, PY0, PCW / RS, PCH / RS);
        if (lay < 1) for (const pts of [bandLine.a, bandLine.b]) { const [hx, hy] = along(pts, lay * bandLine.len); og.save(); og.globalCompositeOperation = 'screen'; I.glow(og, hx, hy, 70, [255, 226, 150], .85); I.glow(og, hx, hy, 18, [255, 250, 225], .9); og.restore(); } }
      og.globalCompositeOperation = 'destination-out'; og.fill(archP(ARCH, 5)); og.globalCompositeOperation = 'source-over';   // the arch is a window: neither desk nor page in it
      og.restore();
      ctx.save(); ctx.globalAlpha = oa; ctx.drawImage(O, 0, 0); ctx.restore();
    }
    // the candle: the room light over the page and its miniature, from the upper left (before it comes up only the gold catches);
    // it lets go as the miniature becomes the world (multiplied toward white by the develop)
    if (dev < 1) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; const cg = ctx.createRadialGradient(W * .1, -H * .08, 0, W * .1, -H * .08, H * 1.25);
      const L0 = 255 * lk * fl, c = v => Math.min(255, Math.round(lerp(Math.min(255, v), 255, dev))); cg.addColorStop(0, `rgb(${c(L0 * 1.06)},${c(L0 * .98)},${c(L0 * .86)})`); cg.addColorStop(.6, `rgb(${c(L0 * .92)},${c(L0 * .82)},${c(L0 * .68)})`); cg.addColorStop(1, `rgb(${c(L0 * .7)},${c(L0 * .6)},${c(L0 * .48)})`);
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (oa > 0) {
      // the gold catching the dark at the start (points of gold where the night earth's lamps were) — fades as the candle comes up
      const dark = 1 - ss(T.light[0], T.light[1] - .3, t); if (dark > 0) { ctx.save(); xf(ctx, s); ctx.globalCompositeOperation = 'screen'; const r = rng(3);
        for (let i = 0; i < 70; i++) { const x = ARCH.x - FR + r() * (ARCH.w + 2 * FR), y = ARCH.y - FR + r() * (ARCH.h * .55), tw = .6 + .4 * Math.sin(t * 2.2 + i * 1.7); I.glow(ctx, x, y, 22 + 18 * r(), [255, 214, 130], .5 * dark * tw); }
        ctx.restore(); }
    }
    // the glint across every gold surface at once (Q16) — the sky of the small world, the band, the stars, the ivy
    if (glint >= 0 && dev < 1) { const a = Math.sin(Math.PI * glint), ux = .74, uy = .67, Dd = (W + H) * 1.25, pos = -Dd * .25 + glint * Dd, cx = pos * ux, cy = pos * uy, wd = 300;
      const gc = scratch2(), gx = gc.getContext('2d'); gx.setTransform(1, 0, 0, 1, 0, 0); gx.globalCompositeOperation = 'source-over'; gx.clearRect(0, 0, W, H);
      const lg = gx.createLinearGradient(cx - ux * wd, cy - uy * wd, cx + ux * wd, cy + uy * wd); lg.addColorStop(0, 'rgba(255,230,150,0)'); lg.addColorStop(.38, `rgba(255,226,140,${.4 * a})`); lg.addColorStop(.5, `rgba(255,252,226,${.95 * a})`); lg.addColorStop(.62, `rgba(255,226,140,${.4 * a})`); lg.addColorStop(1, 'rgba(255,230,150,0)');
      gx.fillStyle = lg; gx.fillRect(0, 0, W, H); gx.globalCompositeOperation = 'destination-in'; gx.save(); xf(gx, s); gx.globalAlpha = 1; gx.drawImage(skyMask, PX0, PY0, PCW / RS, PCH / RS); gx.drawImage(goldC, PX0, PY0, PCW / RS, PCH / RS); gx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = (1 - dev) * oa; ctx.drawImage(gc, 0, 0); ctx.restore(); }
  }
  let SC = null, SC2 = null; const scratch = () => SC || (SC = canvas(PCW, PCH)), scratch2 = () => SC2 || (SC2 = canvas(W, H));
  return { draw, T, sOf, mini: miniC, page: pageC };
}
