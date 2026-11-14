/* lamp-scrolls.js — 「그리스도」 등잔 아래 두루마리 (kits/lamplit — 「침묵의 400년」의 화풍)
   밤의 방. 창 아래 낮은 탁자에 두루마리 한 권이 놓이고, 그 너머 흙 등잔 하나가 유일한 빛이다. 카메라는 실제 공간 속에
   있다(탁자·두루마리·등잔·벽·창을 한 원근으로 투영 — 두루마리는 탁자 위에 누운 면으로 원근 변형). 글줄은 읽히는 글자가
   아니라 히브리어 같은 획의 리듬(굵은 윗획·가는 세로획)으로 쓴 잉크 결 — 성경 구절 글자는 본 세션이 위에 얹는다.

   buildScrolls()                — 한 번(동기, ~0.4초): 양피지·잉크·금빛 줄·탁자·벽·창밖 텍스처. Lamplit.init()도 부른다.
   scrollScene(ctx, u, which)    — which 'isaiah': u 0..7.6 (영상 79.8–87.6초). u −3.8..0도 그린다(76초 N10: 펼쳐지기 시작).
                                     u 0–1.5 펼쳐짐의 끝 → 1.7–3.4 등잔 불꽃이 바람에 휘었다 다시 섬 → 2.6–5.2 불빛 너머 창밖
                                     먼 언덕 하나가 어둠에서 떠오름(초점이 불꽃에서 창으로). 카메라는 내내 천천히 들리며 창 쪽으로.
                                   which 'psalm': u 0..16.5 (영상 97.7–114.2초). u 0–3 흑백 기운이 남은 어둠에서 금빛 불씨가
                                     내려와 하나가 꺼진 심지에 붙고(0.95) 나머지는 시편 22편 첫 줄에 내려앉음, 색이 돌아옴 →
                                     6.0–6.9 첫 줄이 오른쪽에서 왼쪽으로 금빛으로 깨어남(사건) → 11.6–13.0 두루마리가 조금 더
                                     펼쳐지고 12.2–13.2 왼쪽 단 아래쪽 한 줄이 깨어남(사건). 카메라: 첫 줄로 다가갔다 아래 줄로.
   글자 자리(세로 0.62–0.78, 가로 아래 1/4)는 탁자 앞쪽 어둠이라 차분하다. 결정적: u의 함수일 뿐(Pilot.rng/fbm만). */
(function () {
  const P = Pilot, { clamp, lerp, ss, eio, rng, fbm, canvas, mix, rgb } = P;
  const W = P.W, H = P.H, V = P.ori === 'v';
  const S = {};   // built textures

  // ---------------- world (units ≈ mm; table top is Y = 0; +Z away from the camera) ----------------
  const XMIN = -960, XMAX = 860, SD = 560, TS = 1.35;            // sheet: X range, depth (Z 0 near … SD far), texture px per unit
  const COLS = [-760, -420, -80, 260, 600], CW = 290;             // column centres and width (Hebrew: right column first)
  const ROW0 = SD - 50, LH = 21, GS = 11.5, NROW = 22;            // first row's Z, row pitch, glyph size
  const TX0 = -2800, TX1 = 2800, TZ0 = -440, TZ1 = 1300, TT = .32; // table texture
  const ZW = 1300, WIN = { x0: 230, x1: 690, y0: 210, y1: 780, th: 70 };   // back wall and its arched window
  const LAMP = { x: 470, z: 700 }, FLAME = { x: 470 - 58, y: 30, z: 700 };   // saucer lamp; its spout points left
  const JAR = { x: -720, z: 1080, r: 92, h: 400 };
  const tx = X => (X - XMIN) * TS, ty = Z => (SD - Z) * TS;
  const rowZ = i => ROW0 - i * LH;
  // key lines (psalm): A = first line of Ps 22 (right column, after a blank row), B = a lower line in the next column left
  const ROLL_R = 50;   // the wound rolls' radius (diameter ≈ 1/5.6 of the sheet's height)
  const KEY = { A: { col: 4, row: 4 }, B: { col: 2, row: 15 } };

  // ---------------- camera ----------------
  let cam = null;
  const setCam = c => { cam = Object.assign({}, c); cam.sp = Math.sin(c.p); cam.cp = Math.cos(c.p); cam.cyp = c.cy * H; };
  const proj = (X, Y, Z) => { const dy = Y - cam.h, dz = Z - cam.z, d = -dy * cam.sp + dz * cam.cp, up = dy * cam.cp + dz * cam.sp;
    return [W / 2 + cam.f * (X - cam.x) / d, cam.cyp - cam.f * up / d, d]; };
  const zAtY = sy => { const a = (cam.cyp - sy) / cam.f, dY = -cam.sp + a * cam.cp, dZ = cam.cp + a * cam.sp; if (dY >= -1e-4) return Infinity; return cam.z + (-cam.h / dY) * dZ; };
  const D2R = Math.PI / 180;
  // Catmull-Rom through camera keys [[u, {x,z,h,p(deg),cy,f}], …]
  function camAt(keys, u) {
    if (u <= keys[0][0]) return conv(keys[0][1]); const n = keys.length; if (u >= keys[n - 1][0]) return conv(keys[n - 1][1]);
    let i = 0; while (u > keys[i + 1][0]) i++; const s = (u - keys[i][0]) / (keys[i + 1][0] - keys[i][0]);
    const k0 = keys[Math.max(0, i - 1)][1], k1 = keys[i][1], k2 = keys[i + 1][1], k3 = keys[Math.min(n - 1, i + 2)][1], o = {};
    for (const p of Object.keys(k1)) { const a = k0[p], b = k1[p], c = k2[p], d = k3[p];
      o[p] = .5 * ((2 * b) + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s * s * s); }
    return conv(o); }
  const conv = k => ({ x: k.x, z: k.z, h: k.h, p: k.p * D2R, cy: k.cy, f: k.f });

  // ---------------- Hebrew-like ink (not letters: the rhythm of square script) ----------------
  // glyph kinds: b (ב), d (ד), h (ה), w (ו narrow), y (י tiny), l (ל ascender), m (מ), s (ש), n (ן descender), q (ק), a (א)
  const KINDS = 'bbddhhwwyylmmssnqqaa', NARROW = { w: .42, y: .36, n: .42 };
  function makeRows(seed) {
    const r = rng(seed), cols = [];
    for (let c = 0; c < COLS.length; c++) { const rows = [];
      for (let i = 0; i < NROW; i++) {
        const blank = (seed === 22 && c === 4 && i === 3);   // the gap between Ps 21 and Ps 22
        const short = (seed === 22 && c === 4 && i === 2) ? .42 : (r() < .06 ? .3 + r() * .4 : 1);
        const gl = []; if (!blank) { let x = 0; const end = CW * short * (.94 + r() * .06);
          while (x < end) { const nw = 2 + (r() * 5 | 0); for (let k = 0; k < nw && x < end; k++) { const kd = KINDS[r() * KINDS.length | 0], w = (NARROW[kd] || (.78 + r() * .16)) * GS;
              gl.push({ x, kd, w, a: .74 + r() * .26, j: (r() - .5) * 1.4, v: r() }); x += w + GS * (.16 + r() * .06); }
            x += GS * (.55 + r() * .3); } }
        rows.push(gl); }
      cols.push(rows); }
    return cols; }
  // draw one row of glyphs right-to-left from tex x `xr`, top tex y `yt`, at tex scale k (px per unit)
  function drawRow(c, gl, xr, yt, k, col, aMul = 1) {
    const s = GS * k, hb = s * .19, vb = s * .105;
    for (const g of gl) { const w = g.w * k, x = xr - g.x * k - w, y = yt + g.j * k;
      c.globalAlpha = g.a * aMul; c.fillStyle = col;
      const bar = (x0, y0, ww) => c.fillRect(x0, y0, ww, hb), st = (x0, y0, hh) => c.fillRect(x0, y0, vb, hh);
      switch (g.kd) {
        case 'b': bar(x, y, w * .92); st(x + w * .8, y, s * .95); bar(x - w * .06, y + s * .86, w * 1.04); break;
        case 'd': bar(x, y, w); st(x + w * .78, y, s * 1.02); break;
        case 'h': bar(x, y, w); st(x + w * .8, y, s * 1.02); st(x + w * .06, y + s * .38, s * .64); break;
        case 'w': c.fillRect(x, y, w * .9, hb * 1.1); st(x + w * .55, y, s * 1.02); break;
        case 'y': c.fillRect(x, y, w, hb * 1.3); c.fillRect(x + w * .5, y, vb, s * .38); break;
        case 'l': st(x + w * .08, y - s * .55, s * .6); bar(x + w * .08, y, w * .86); st(x + w * .82, y, s * .66); c.fillRect(x + w * .3, y + s * .6, w * .6, hb * .8); break;
        case 'm': bar(x, y, w); st(x + w * .82, y, s); bar(x + w * .2, y + s * .86, w * .8); st(x + w * .06, y + s * .1, s * .4); break;
        case 's': st(x + w * .04, y, s * .9); st(x + w * .44, y + s * .05, s * .8); st(x + w * .84, y, s * .9); bar(x, y + s * .84, w); break;
        case 'n': c.fillRect(x, y, w * .9, hb); st(x + w * .55, y, s * 1.55); break;
        case 'q': bar(x, y, w); st(x + w * .8, y, s * .8); st(x + w * .08, y + s * .36, s * 1.05); break;
        default: c.save(); c.translate(x + w / 2, y + s / 2); c.rotate(.62); c.fillRect(-w * .62, -hb * .7, w * 1.24, hb * 1.4); c.restore();
          st(x + w * .2, y + s * .5, s * .5); st(x + w * .76, y, s * .45); }
      if (g.v < .05) { c.globalAlpha = .5 * aMul; c.beginPath(); c.arc(x + w * .5, y + s * .5, s * .14, 0, 6.283); c.fill(); } }
    c.globalAlpha = 1; }
  const colRight = c => COLS[c] + CW / 2;

  // ---------------- build ----------------
  function buildSheet(seed) {
    const w = Math.ceil((XMAX - XMIN) * TS), h = Math.ceil(SD * TS), cv = canvas(w, h), c = cv.getContext('2d');
    // parchment: low-res fbm stretched (soft fibres, blotches, ragged darkened near/far edges)
    const pw = 560, ph = 172, lo = canvas(pw, ph), lx = lo.getContext('2d'), d = lx.createImageData(pw, ph);
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      const n = fbm(i / 42 + seed, j / 30, 5), f = fbm(i / 5, j / 60 + seed, 2), st = fbm(i / 18 + 40, j / 14 + seed, 3);
      const ev = Math.min(j, ph - 1 - j) / ph + (fbm(i / 9 + seed * 3, j < ph / 2 ? 1 : 9, 3) - .5) * .05;
      const edge = ss(.0, .09, ev), a = ss(.004, .018, ev);
      let v = (.8 + (n - .5) * .32 + (f - .5) * .08) * (1 - .22 * ss(.62, .8, st)) * lerp(.5, 1, edge); const o = (j * pw + i) * 4;
      d.data[o] = 226 * v; d.data[o + 1] = 198 * v; d.data[o + 2] = 150 * v; d.data[o + 3] = 255 * a; }
    lx.putImageData(d, 0, 0); c.imageSmoothingQuality = 'high'; c.drawImage(lo, 0, 0, w, h);
    // fibre grain
    c.save(); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = .22; const sp = P.speckle(512, 256, 40, seed + 5, .6);
    for (let y = 0; y < h; y += 256) for (let x = 0; x < w; x += 512) c.drawImage(sp, x, y, 512, 256); c.restore();
    if (!S.plain) { S.plain = canvas(400, 600); S.plain.getContext('2d').drawImage(cv, w * .3, h * .1, 400, h * .8, 0, 0, 400, 600); }   // un-inked parchment for the rolls
    // dry-point ruling (faint) and the ink
    c.save(); c.globalCompositeOperation = 'source-atop';
    const rows = makeRows(seed);
    for (let ci = 0; ci < COLS.length; ci++) { const xr = tx(colRight(ci));
      c.fillStyle = 'rgba(90,60,30,.07)'; for (let i = 0; i < NROW; i++) c.fillRect(tx(COLS[ci] - CW / 2), ty(rowZ(i)) - 1, CW * TS, 1.2);
      rows[ci].forEach((gl, i) => drawRow(c, gl, xr, ty(rowZ(i)) + 2, TS, '#2b1a0b')); }
    c.restore();
    return { cv, rows };
  }
  function buildGold(sheet, key) {   // the key line's glyphs in burnished gold + its halo (tex px, crop with margin)
    const gl = sheet.rows[key.col][key.row], m = 30, wpx = Math.ceil(CW * TS + m * 2), hpx = Math.ceil(LH * TS * 1.6 + m * 2);
    const x0 = tx(COLS[key.col] - CW / 2) - m, y0 = ty(rowZ(key.row)) + 2 - m - GS * TS * .6;
    const gold = canvas(wpx, hpx), g = gold.getContext('2d'), yt = ty(rowZ(key.row)) + 2 - y0, xr = tx(colRight(key.col)) - x0;
    drawRow(g, gl, xr, yt, TS, '#f4b648');
    g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, yt, 0, yt + GS * TS); gr.addColorStop(0, 'rgba(255,250,225,.95)'); gr.addColorStop(.5, 'rgba(255,214,120,0)'); gr.addColorStop(1, 'rgba(170,90,10,.45)'); g.fillStyle = gr; g.fillRect(0, 0, wpx, hpx);
    const halo = canvas(wpx, hpx), hx = halo.getContext('2d'); hx.filter = 'blur(7px)'; drawRow(hx, gl, xr, yt, TS, 'rgb(255,190,90)'); hx.filter = 'blur(16px)'; drawRow(hx, gl, xr, yt, TS, 'rgb(255,170,70)');
    const ember = canvas(wpx, hpx), ex = ember.getContext('2d'); ex.filter = 'blur(3px)'; drawRow(ex, gl, xr, yt, TS, 'rgb(255,120,40)');
    let minX = 0; for (const q of gl) minX = Math.max(minX, q.x + q.w); const len = minX * TS;
    return { gold, halo, ember, x0, y0, xr, len, yt, Z: rowZ(key.row), X1: colRight(key.col), X0: colRight(key.col) - minX };
  }
  function buildTable() {
    const w = Math.ceil((TX1 - TX0) * TT), h = Math.ceil((TZ1 - TZ0) * TT), cv = canvas(w, h), c = cv.getContext('2d'), d = c.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const g = fbm(i / 160, j / 3.2, 4), k = fbm(i / 40, j / 12, 3), plank = (j % 46 < 1.2) ? .55 : 1;
      const v = (.62 + (g - .5) * .5 + (k - .5) * .25) * plank, o = (j * w + i) * 4;
      d.data[o] = 132 * v; d.data[o + 1] = 88 * v; d.data[o + 2] = 54 * v; d.data[o + 3] = 255; }
    c.putImageData(d, 0, 0); return cv; }
  function buildWall() { const s = 256, cv = canvas(s, s), c = cv.getContext('2d'), d = c.createImageData(s, s);
    for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) { const v = .7 + (fbm(i / 30, j / 30, 5) - .5) * .5 + (fbm(i / 4, j / 4, 2) - .5) * .12, o = (j * s + i) * 4;
      d.data[o] = 128 * v; d.data[o + 1] = 112 * v; d.data[o + 2] = 96 * v; d.data[o + 3] = 255; }
    c.putImageData(d, 0, 0); return cv; }
  function buildSky() {   // through the window: a night sky, faint stars, a far ridge and ONE hill (Golgotha only hinted: no crosses)
    const w = 420, h = 560, sky = canvas(w, h), c = sky.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#05070f'); g.addColorStop(.55, '#0b1024'); g.addColorStop(.86, '#1a1c34'); g.addColorStop(1, '#241f30'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = rng(77); for (let i = 0; i < 90; i++) { const b = Math.pow(r(), 3); c.fillStyle = `rgba(225,230,255,${.15 + b * .7})`; c.fillRect(r() * w, r() * h * .7, 1 + b * 1.4, 1 + b * 1.4); }
    const hillY = x => h * .8 - 120 * Math.exp(-(((x - w * .56) / (w * .2)) ** 2)) * (1 - .1 * Math.exp(-(((x - w * .6) / (w * .05)) ** 2))) - 8 * fbm(x / 30, 2, 3);
    const ridge = x => h * .84 - 26 * fbm(x / 90, 5, 3);
    c.fillStyle = '#0d1022'; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 4) c.lineTo(x, ridge(x)); c.lineTo(w, h); c.fill();
    const hill = canvas(w, h), hc = hill.getContext('2d'); hc.fillStyle = '#05060c'; hc.beginPath(); hc.moveTo(0, h); for (let x = 0; x <= w; x += 3) hc.lineTo(x, Math.min(hillY(x), ridge(x) + 6)); hc.lineTo(w, h); hc.fill();
    const rim = canvas(w, h), rc = rim.getContext('2d');   // moonlight behind the hill: a glow and a thin silver rim on its crest
    const mg = rc.createRadialGradient(w * .62, h * .62, 0, w * .62, h * .62, w * .55); mg.addColorStop(0, 'rgba(170,180,220,.55)'); mg.addColorStop(.4, 'rgba(110,120,170,.18)'); mg.addColorStop(1, 'rgba(60,70,120,0)'); rc.fillStyle = mg; rc.fillRect(0, 0, w, h);
    rc.drawImage(hill, 0, 0); rc.globalCompositeOperation = 'source-over'; rc.strokeStyle = 'rgba(205,215,245,.85)'; rc.lineWidth = 1.6; rc.beginPath();
    for (let x = w * .3; x <= w * .82; x += 3) { const y = hillY(x); if (y < ridge(x) + 5) x === w * .3 ? rc.moveTo(x, y) : rc.lineTo(x, y); } rc.stroke();
    const blur = (src, px) => { const o = canvas(w, h), x = o.getContext('2d'); x.filter = `blur(${px}px)`; x.drawImage(src, 0, 0); return o; };
    c.drawImage(hill, 0, 0);
    return { sky, skyB: blur(sky, 7), rim, rimB: blur(rim, 7), w, h }; }

  function build() {
    const t0 = performance.now();
    if (!Lamplit.parch) Lamplit.init();
    S.isa = buildSheet(53); S.psa = buildSheet(22);
    S.goldA = buildGold(S.psa, KEY.A); S.goldB = buildGold(S.psa, KEY.B);
    S.work = canvas(S.isa.cv.width, S.isa.cv.height);
    S.table = buildTable(); S.twork = canvas(S.table.width, S.table.height);
    S.wall = buildWall(); S.sky = buildSky();
    S.shadow = (() => { const c = canvas(200, 120), x = c.getContext('2d'); x.filter = 'blur(12px)'; x.fillStyle = '#000'; x.fillRect(30, 30, 140, 60); return c; })();
    S.embers = makeEmbers();
    S.ms = performance.now() - t0; return S; }

  // ---------------- light ----------------
  // stops for a multiply light: ambient + lamp falloff (r in units from the flame's foot)
  function lightStops(g, R, lampI, amb, ambCol = [70, 74, 92], warm = [255, 224, 176], r0 = .2) {
    for (const s of [0, .08, .18, .32, .5, .72, 1]) { const f = lampI / (1 + (s / r0) ** 2) * (1 - s * .35);
      const c = [0, 1, 2].map(i => Math.min(255, ambCol[i] * amb + warm[i] * f)); g.addColorStop(s, rgb(c)); } }
  const flick = u => 1 + .045 * Math.sin(u * 7.3) * Math.sin(u * 2.9 + 1) + .03 * Math.sin(u * 17.1) + .02 * Math.sin(u * 31.3);

  // ---------------- drawing pieces ----------------
  // a plane texture lying on the table (Y = 0) warped by horizontal strips (exact perspective along each row)
  function warp(ctx, src, sX0, sZ1, k, xa, xb, za, zb) {
    const pa = proj(0, 0, za), pb = proj(0, 0, zb); let y = Math.max(0, Math.floor(pb[1])); const yEnd = Math.min(H, Math.ceil(pa[1])), step = 2;
    for (; y < yEnd; y += step) {
      let z0 = zAtY(y), z1 = zAtY(y + step); if (!isFinite(z0)) continue; z0 = Math.min(z0, zb); z1 = Math.max(z1, za); if (z0 <= z1) continue;
      const zm = (z0 + z1) / 2, l = proj(xa, 0, zm), r = proj(xb, 0, zm), sy0 = (sZ1 - z0) * k, sy1 = (sZ1 - z1) * k;
      const dy0 = proj(0, 0, z0)[1], dy1 = proj(0, 0, z1)[1];
      ctx.drawImage(src, (xa - sX0) * k, sy0, (xb - xa) * k, Math.max(.5, sy1 - sy0), l[0], dy0, r[0] - l[0], dy1 - dy0 + .7); } }

  function drawWall(ctx, lampI, amb) {
    const base = proj(0, 0, ZW)[1];
    ctx.fillStyle = '#0a0806'; ctx.fillRect(0, 0, W, Math.min(H, base + 4));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, Math.max(0, base + 4)); ctx.clip(); ctx.globalAlpha = .85;
    const s = Math.max(W, H) * .6; for (let y = 0; y < base; y += s) for (let x = 0; x < W; x += s) ctx.drawImage(S.wall, x, y, s, s); ctx.restore();
    // multiply: lamp light on the wall (round the lamp's projection on the wall) + a cool ambient
    const lp = proj(FLAME.x, 140, ZW), sc = cam.f / lp[2], g = ctx.createRadialGradient(lp[0], lp[1], 0, lp[0], lp[1], 1500 * sc);
    lightStops(g, 1, lampI * 1.9, amb * .7, [60, 66, 90], [255, 200, 140], .3);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, base + 4); ctx.restore();
  }
  function winPath(ctx, z, inset = 0) {   // the arched window outline on the plane Z = z
    const { x0, x1, y0, y1 } = WIN, cx = (x0 + x1) / 2, r = (x1 - x0) / 2 - inset, ys = y1 - r;
    ctx.beginPath(); let p = proj(cx - r, y0 + inset, z); ctx.moveTo(p[0], p[1]); p = proj(cx - r, ys, z); ctx.lineTo(p[0], p[1]);
    for (let a = 1; a <= 16; a++) { const t = Math.PI - a / 16 * Math.PI; p = proj(cx + Math.cos(t) * r, ys + Math.sin(t) * r, z); ctx.lineTo(p[0], p[1]); }
    p = proj(cx + r, y0 + inset, z); ctx.lineTo(p[0], p[1]); ctx.closePath(); }
  function drawWindow(ctx, u, lampI, focus, hillK) {
    const a = proj(WIN.x0, WIN.y1, ZW), b = proj(WIN.x1, WIN.y0, ZW); if (b[1] < -50 || a[1] > H) return;
    // the reveal (wall thickness), faintly lit by the lamp
    winPath(ctx, ZW); const rg = ctx.createLinearGradient(a[0], 0, b[0], 0); rg.addColorStop(0, rgb([40, 30, 24].map(v => v * (.5 + lampI * .6)))); rg.addColorStop(1, rgb([20, 15, 12].map(v => v * (.5 + lampI * .6))));
    ctx.fillStyle = rg; ctx.fill();
    ctx.save(); winPath(ctx, ZW); ctx.clip(); winPath(ctx, ZW + WIN.th, 4); ctx.clip();
    const t = proj(WIN.x0 - 40, WIN.y1 + 30, ZW + WIN.th), bt = proj(WIN.x1 + 40, WIN.y0 - 10, ZW + WIN.th), K = S.sky;
    const dx = t[0], dy = t[1], dw = bt[0] - t[0], dh = bt[1] - t[1];
    ctx.globalAlpha = 1 - focus; ctx.drawImage(K.skyB, dx, dy, dw, dh); ctx.globalAlpha = focus; ctx.drawImage(K.sky, dx, dy, dw, dh);
    if (hillK > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = hillK * (1 - focus) * .6; ctx.drawImage(K.rimB, dx, dy, dw, dh); ctx.globalAlpha = hillK * focus * .6; ctx.drawImage(K.rim, dx, dy, dw, dh); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .35 - .12 * hillK; ctx.fillStyle = '#0a0806'; ctx.fillRect(dx, dy, dw, dh);   // haze: the room's dark between us and the night
    ctx.restore();
    // sill edge catching lamplight
    const s0 = proj(WIN.x0, WIN.y0, ZW), s1 = proj(WIN.x1, WIN.y0, ZW); ctx.strokeStyle = `rgba(255,190,120,${.12 + .2 * lampI})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.lineTo(s1[0], s1[1]); ctx.stroke(); }

  function drawTable(ctx, lampI, amb, xl, xr) {
    const c = S.twork.getContext('2d'), tw = S.twork.width, th = S.twork.height; c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.drawImage(S.table, 0, 0);
    const X = x => (x - TX0) * TT, Z = z => (TZ1 - z) * TT;
    // shadows on the table: the sheet (its rolls), the jar, the lamp's foot (cast away from the flame)
    c.globalAlpha = .8; c.drawImage(S.shadow, X(xl - 90) , Z(SD + 40), (xr - xl + 180) * TT, (SD + 120) * TT);
    c.globalAlpha = .9; for (const x of [xl, xr]) c.drawImage(S.shadow, X(x - ROLL_R * 2.1), Z(SD + 110), ROLL_R * 4.2 * TT, (SD + 230) * TT);
    c.globalAlpha = .7; c.drawImage(S.shadow, X(JAR.x - JAR.r * 2.4), Z(JAR.z + JAR.r * 1.6), JAR.r * 4 * TT, JAR.r * 3.4 * TT);
    c.globalAlpha = .6; c.drawImage(S.shadow, X(LAMP.x - 60), Z(LAMP.z + 60), 200 * TT, 120 * TT); c.globalAlpha = 1;
    const fx = X(FLAME.x), fz = Z(FLAME.z), g = c.createRadialGradient(fx, fz, 0, fx, fz, 2300 * TT);
    lightStops(g, 1, lampI * 1.75, amb * 1.3, [60, 64, 82], [255, 214, 160], .72);
    c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(0, 0, tw, th); c.globalCompositeOperation = 'source-over';
    warp(ctx, S.twork, TX0, TZ1, TT, TX0, TX1, TZ0, TZ1);
    // the table's near edge and front face
    const e0 = proj(TX0, 0, TZ0), e1 = proj(TX1, 0, TZ0);
    if (e0[1] < H) { const y0 = Math.min(e0[1], e1[1]), fg = ctx.createLinearGradient(0, y0, 0, y0 + 90 * cam.f / e0[2]); fg.addColorStop(0, rgb([58, 38, 24].map(v => v * (.4 + .5 * lampI)))); fg.addColorStop(1, '#070504');
      ctx.fillStyle = '#070504'; ctx.fillRect(0, y0, W, H); ctx.fillStyle = fg; ctx.fillRect(0, y0, W, 90 * cam.f / e0[2]); ctx.strokeStyle = `rgba(255,200,140,${.2 + .25 * lampI})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.stroke(); }
  }

  function drawJar(ctx, lampI) {   // a tall clay scroll jar in the dark, its right side touched by the lamp
    const b = proj(JAR.x, 0, JAR.z), tp = proj(JAR.x, JAR.h, JAR.z), sc = cam.f / b[2], r = JAR.r * sc, hh = b[1] - tp[1]; if (b[0] + r < 0) return;
    ctx.save(); ctx.translate(b[0], b[1]);
    const path = () => { ctx.beginPath(); ctx.moveTo(-r * .5, 0); ctx.bezierCurveTo(-r * 1.25, -hh * .18, -r * 1.2, -hh * .62, -r * .62, -hh * .8); ctx.lineTo(-r * .56, -hh * .86);
      ctx.lineTo(-r * .7, -hh * .88); ctx.quadraticCurveTo(0, -hh * 1.04, r * .7, -hh * .88); ctx.lineTo(r * .56, -hh * .86); ctx.lineTo(r * .62, -hh * .8);
      ctx.bezierCurveTo(r * 1.2, -hh * .62, r * 1.25, -hh * .18, r * .5, 0); ctx.quadraticCurveTo(0, r * .15, -r * .5, 0); ctx.closePath(); };
    path(); const g = ctx.createLinearGradient(-r, 0, r, 0); g.addColorStop(0, '#060403'); g.addColorStop(.62, rgb([28, 19, 13].map(v => v * (.4 + .7 * lampI)))); g.addColorStop(.86, rgb([92, 60, 38].map(v => v * (.3 + .7 * lampI)))); g.addColorStop(1, '#0c0806');
    ctx.fillStyle = g; ctx.fill(); ctx.restore(); }

  function drawLamp(ctx, u, lampOn, gust, lampI) {   // a clay saucer lamp; the flame is drawn separately (flame())
    const b = proj(LAMP.x, 0, LAMP.z), sc = cam.f / b[2], R = 58 * sc, el = clamp(.25 + .55 * Math.sin(Math.atan2(cam.h, LAMP.z - cam.z))), rimY = -26 * sc;
    ctx.save(); ctx.translate(b[0], b[1]);
    const lit = .35 + .65 * lampI;
    ctx.fillStyle = rgb([44, 28, 16].map(v => v * lit)); ctx.beginPath(); ctx.ellipse(0, rimY * .5, R * .92, R * el * .8 - rimY * .5, 0, 0, Math.PI); ctx.lineTo(-R * .92, rimY * .5); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, rimY, R, R * el, 0, 0, 6.283); ctx.fillStyle = rgb([70, 46, 28].map(v => v * lit)); ctx.fill();
    // the pinched spout (left), and the oil
    ctx.beginPath(); ctx.moveTo(-R * .7, rimY - R * el * .55); ctx.quadraticCurveTo(-R * 1.25, rimY - R * el * .1, -R * 1.18, rimY + R * el * .05); ctx.quadraticCurveTo(-R * 1.1, rimY + R * el * .35, -R * .7, rimY + R * el * .55); ctx.fill();
    ctx.beginPath(); ctx.ellipse(R * .05, rimY, R * .8, R * el * .78, 0, 0, 6.283); ctx.fillStyle = rgb([20, 13, 8].map(v => v * lit)); ctx.fill();
    const hl = ctx.createLinearGradient(-R, 0, R * .4, 0); hl.addColorStop(0, `rgba(255,200,130,${.45 * lampI})`); hl.addColorStop(1, 'rgba(255,200,130,0)');
    ctx.strokeStyle = hl; ctx.lineWidth = Math.max(1, 3 * sc); ctx.beginPath(); ctx.ellipse(0, rimY, R, R * el, 0, Math.PI * .55, Math.PI * 1.45); ctx.stroke();
    ctx.restore(); }
  function flame(ctx, u, on, gust) {   // the living flame at the spout + its smoke; on 0..1
    const f = proj(FLAME.x, FLAME.y, FLAME.z), sc = cam.f / f[2]; if (on <= 0) return f;
    const b = 1 + .1 * Math.sin(u * 9.1) + .06 * Math.sin(u * 23.7) + .04 * Math.sin(u * 41), hgt = 70 * sc * b * (.35 + .65 * on) * (1 + .35 * gust), sway = (Math.sin(u * 3.3) * .07 - .55 * gust) * hgt;
    const x = f[0], y = f[1], wd = 14 * sc * (1 + .2 * gust);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = on;
    const g = ctx.createLinearGradient(x, y, x + sway, y - hgt); g.addColorStop(0, 'rgba(120,150,255,.55)'); g.addColorStop(.12, 'rgba(255,236,190,1)'); g.addColorStop(.5, 'rgba(255,186,80,.95)'); g.addColorStop(1, 'rgba(255,110,30,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - wd, y); ctx.bezierCurveTo(x - wd * 1.25, y - hgt * .45, x + sway * .6 - wd * .2, y - hgt * .75, x + sway, y - hgt);
    ctx.bezierCurveTo(x + sway * .6 + wd * .3, y - hgt * .7, x + wd * 1.25, y - hgt * .45, x + wd, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,252,235,.95)'; ctx.beginPath(); ctx.ellipse(x + sway * .15, y - hgt * .22, wd * .42, hgt * .2, -sway / hgt * .4, 0, 6.283); ctx.fill();
    ctx.restore(); return f; }
  function smoke(ctx, u, f, a) {   // a thin thread of smoke rising from the flame (world-scaled noise)
    if (a <= 0) return; const sc = cam.f / f[2]; ctx.save(); ctx.lineCap = 'round';
    for (let k = 0; k < 2; k++) { ctx.beginPath(); let px = f[0], py = f[1] - 50 * sc; ctx.moveTo(px, py);
      for (let i = 1; i <= 22; i++) { const s = i / 22, yy = f[1] - (60 + s * 300) * sc, xx = f[0] + (P.noise(s * 2.5 - u * .7 + k * 9, u * .4 + k) - .5) * 150 * sc * s + Math.sin(s * 11 - u * 2.1 + k * 2) * 18 * sc * s; ctx.lineTo(xx, yy); }
      const g = ctx.createLinearGradient(0, f[1] - 60 * sc, 0, f[1] - 360 * sc); g.addColorStop(0, `rgba(200,180,160,${.1 * a})`); g.addColorStop(.6, `rgba(200,180,160,${.04 * a})`); g.addColorStop(1, 'rgba(200,180,160,0)');
      ctx.strokeStyle = g; ctx.lineWidth = (5 + k * 6) * sc; ctx.filter = 'blur(2px)'; ctx.stroke(); ctx.filter = 'none'; }
    ctx.restore(); }
  function bloom(ctx, f, on, I) {   // the flame as a light source seen through a lens: soft halo, hot core, a faint anamorphic streak
    if (on <= 0) return; const sc = cam.f / f[2], x = f[0], y = f[1] - 22 * sc;
    Lamplit.glow(ctx, x, y, 1000 * sc, [255, 160, 80], .26 * on * I);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    Lamplit.glow(ctx, x, y, 300 * sc, [255, 190, 110], .42 * on * I); Lamplit.glow(ctx, x, y, 80 * sc, [255, 240, 210], .6 * on * I);
    ctx.translate(x, y); ctx.scale(1, .018); const s = ctx.createRadialGradient(0, 0, 0, 0, 0, 1100 * sc); s.addColorStop(0, `rgba(255,190,120,${.12 * on * I})`); s.addColorStop(1, 'rgba(255,190,120,0)'); ctx.fillStyle = s; ctx.fillRect(-1100 * sc, -1100 * sc, 2200 * sc, 2200 * sc);
    ctx.restore(); }

  // the sheet: texture → lit (multiply) → gold lines → masked → warped onto the table; then its two rolls
  function drawSheet(ctx, sheet, xl, xr, lampI, amb, gust, golds) {
    const c = S.work.getContext('2d'), w = S.work.width, h = S.work.height;
    c.globalCompositeOperation = 'copy'; c.globalAlpha = 1; c.drawImage(sheet.cv, 0, 0); c.globalCompositeOperation = 'source-over';
    const fx = tx(FLAME.x - gust * 50), fz = ty(FLAME.z), g = c.createRadialGradient(fx, fz, 0, fx, fz, 2000 * TS);
    lightStops(g, 1, lampI * 1.15, amb, [70, 74, 92], [255, 226, 180], .42);
    c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(0, 0, w, h);
    // the sheet curls into its rolls: shade toward both
    for (const [x, d] of [[xl, 1], [xr, -1]]) { const a = tx(x + d * ROLL_R * .7), lg = c.createLinearGradient(a, 0, a + d * 46 * TS, 0); lg.addColorStop(0, 'rgba(120,96,76,1)'); lg.addColorStop(1, 'rgba(255,255,255,1)'); c.fillStyle = lg; c.fillRect(Math.min(a, a + d * 46 * TS), 0, 46 * TS, h); }
    c.globalCompositeOperation = 'source-over';
    for (const G of golds) drawGold(c, G);
    c.globalCompositeOperation = 'destination-in'; c.drawImage(sheet.cv, 0, 0); c.globalCompositeOperation = 'source-over';
    warp(ctx, S.work, XMIN, SD, TS, xl, xr, 0, SD);
    roll(ctx, xl, lampI, 1); roll(ctx, xr, lampI, -1);
  }
  // a key line: o = { G, warm (ember-lit 0..1), dots [[X, a]], reveal 0..1 (right → left), lit 0..1, pulse }
  function drawGold(c, o) {
    const G = o.G;
    if (o.warm > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = .35 * o.warm * (1 - o.lit); c.drawImage(G.ember, G.x0, G.y0); }
    if (o.dots) for (const [X, a] of o.dots) { if (a <= 0) continue; const x = tx(X), y = G.y0 + G.yt + GS * TS * .5; c.globalCompositeOperation = 'lighter'; c.globalAlpha = 1;
      const rg = c.createRadialGradient(x, y, 0, x, y, 26); rg.addColorStop(0, `rgba(255,220,150,${a})`); rg.addColorStop(.3, `rgba(255,140,50,${a * .5})`); rg.addColorStop(1, 'rgba(255,100,30,0)'); c.fillStyle = rg; c.fillRect(x - 26, y - 26, 52, 52); }
    if (o.reveal > 0) { const xr = G.x0 + G.xr, xh = xr - G.len * o.reveal;
      c.save(); c.beginPath(); c.rect(xh, G.y0, xr - xh + 4, G.gold.height); c.clip();
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, (.8 + .4 * (o.pulse || 0)) * o.lit); c.drawImage(G.halo, G.x0, G.y0); c.globalAlpha *= .6; c.drawImage(G.halo, G.x0, G.y0);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.drawImage(G.gold, G.x0, G.y0); c.restore();
      if (o.reveal < 1) { c.save(); c.beginPath(); c.rect(xh - 6, G.y0, 34, G.gold.height); c.clip(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 1; c.drawImage(G.halo, G.x0, G.y0); c.drawImage(G.halo, G.x0, G.y0); c.restore();
        const y = G.y0 + G.yt + GS * TS * .45, rg = c.createRadialGradient(xh, y, 0, xh, y, 60); rg.addColorStop(0, 'rgba(255,250,225,.95)'); rg.addColorStop(.25, 'rgba(255,200,110,.5)'); rg.addColorStop(1, 'rgba(255,160,60,0)');
        c.globalCompositeOperation = 'lighter'; c.fillStyle = rg; c.fillRect(xh - 60, y - 60, 120, 120); } }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; }
  // the parchment wound on its roller: a round cylinder (axis along Z, lying on the table) drawn as many cross-sections, each
  // shaded across by a matte diffuse light from the lamp (lit face → mid → core shadow → a little bounce from the table at the
  // far edge); paper grain, faint layer edges and creases on top; the near end shows the wound paper's spiral; wooden rods.
  function roll(ctx, X, lampI, side) {
    const r = ROLL_R, z0 = -16, z1 = SD + 16, P0 = [212, 184, 140], n = 64, lit = .3 + .75 * lampI, secs = [];
    const lx = FLAME.x - X, la = Math.atan2(lx, 140) ;   // light's angle round the roll (0 = straight up, + toward +X)
    for (let i = 0; i <= n; i++) { const z = lerp(z1, z0, i / n), c = proj(X, r, z), top = proj(X, 2 * r, z), bot = proj(X, 0, z), rx = r * cam.f / c[2];
      secs.push({ z, c, rx, ry: Math.max(rx * .3, Math.abs(bot[1] - top[1]) / 2), cy: (top[1] + bot[1]) / 2 }); }
    lathe(ctx, X, r, z1, 1, lit);   // far rod (mostly hidden behind the roll)
    const shade = (z) => { const d = Math.hypot(FLAME.x - X, FLAME.z - z) / 900; return Math.min(1.25, .32 + lampI * 1.05 / (1 + d * d)); };
    for (const q of secs) { const I = shade(q.z), g = ctx.createLinearGradient(q.c[0] - q.rx, 0, q.c[0] + q.rx, 0);
      for (let k = 0; k <= 10; k++) { const sx = -1 + k / 5, th = Math.asin(Math.max(-1, Math.min(1, sx))), dif = Math.max(0, Math.cos(th - la)),
          bounce = .24 * Math.max(0, Math.abs(sx) - .6) / .4 * (Math.sign(sx) !== Math.sign(la) ? 1 : .3), v = .12 + .98 * Math.pow(dif, .8) + bounce;
        g.addColorStop(k / 10, rgb(P0.map(c => Math.min(255, c * v * I * .82)))); }
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(q.c[0], q.cy, q.rx, q.ry, 0, 0, 6.283); ctx.fill(); }
    // surface: grain, wound layers' edges (along the roll), soft creases (across) — clipped to the roll
    const clip = () => { ctx.beginPath(); for (const q of secs) { ctx.moveTo(q.c[0] + q.rx, q.cy); ctx.ellipse(q.c[0], q.cy, q.rx, q.ry, 0, 0, 6.283); } };
    ctx.save(); clip(); ctx.clip();
    let bx = 1e9, by = 1e9, ex = -1e9, ey = -1e9; for (const q of secs) { bx = Math.min(bx, q.c[0] - q.rx); ex = Math.max(ex, q.c[0] + q.rx); by = Math.min(by, q.cy - q.ry); ey = Math.max(ey, q.cy + q.ry); }
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .5; ctx.drawImage(S.plain, 0, 0, 400, 600, bx, by, ex - bx, ey - by); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const rr = rng(side > 0 ? 71 : 37); ctx.lineCap = 'round';
    for (let k = 0; k < 5; k++) { const th = -1.1 + k * .55 + (rr() - .5) * .2; ctx.beginPath();
      for (let i = 0; i <= 18; i++) { const z = lerp(z1, z0, i / 18), t2 = th + Math.sin(i * 1.3 + k) * .03, p = proj(X + Math.sin(t2) * r, r + Math.cos(t2) * r, z); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.strokeStyle = `rgba(90,64,38,${(.07 + rr() * .07) * lit})`; ctx.lineWidth = 1; ctx.stroke(); }
    for (let k = 0; k < 26; k++) { const z = lerp(z0 + 24, z1 - 24, rr()), a0 = -1.3 + rr() * .7, a1 = a0 + .8 + rr() * 1.2, dz = (rr() - .5) * 30; ctx.beginPath();
      for (let i = 0; i <= 8; i++) { const t = lerp(a0, a1, i / 8), p = proj(X + Math.sin(t) * r, r + Math.cos(t) * r, z + dz * i / 8); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.strokeStyle = `rgba(90,62,36,${(.05 + rr() * .07) * lit})`; ctx.lineWidth = .9; ctx.stroke(); }
    ctx.restore();
    // the near end (round, in perspective): the paper wound in a spiral of thin layers, the rod's hole in the middle
    { const q = secs[n], I = shade(q.z), rx = q.rx, ry = q.ry, cx = q.c[0], cy = q.cy;
      const g2 = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry); g2.addColorStop(side > 0 ? 1 : 0, rgb(P0.map(c => c * .78 * I * .82))); g2.addColorStop(side > 0 ? 0 : 1, rgb(P0.map(c => c * .5 * I * .82)));
      ctx.fillStyle = g2; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.283); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.283); ctx.clip(); const turns = 4.2, a0 = side * 1.3; ctx.beginPath();
      for (let i = 0; i <= 320; i++) { const k = i / 320, ang = a0 + k * turns * 6.283 * side, rad = .26 + .74 * k + .025 * Math.sin(ang * 2.3 + k * 7); const x = cx + Math.cos(ang) * rx * rad, y = cy + Math.sin(ang) * ry * rad; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = `rgba(96,70,42,${.4 * lit})`; ctx.lineWidth = Math.max(.7, rx / 40); ctx.stroke();
      ctx.fillStyle = `rgba(40,26,14,${.55 * lit})`; ctx.beginPath(); ctx.ellipse(cx, cy, rx * .22, ry * .22, 0, 0, 6.283); ctx.fill(); ctx.restore(); }
    lathe(ctx, X, r, z0, -1, lit);
  }
  // a turned wooden handle (etz chayim) on the roller axis, from the roll's end at z outward (dir −1 toward the camera,
  // +1 away), coming straight out of the paper roll: a neck, a carved bulb, then a short round knob (no point). Drawn as stacked cross-sections.
  const PROFILE = [[0, .3], [12, .3], [16, .44], [23, .54], [30, .44], [34, .33], [38, .35], [43, .45], [48, .47], [53, .42], [57, .3], [59.5, .14], [60, 0]];
  const profR = d => { for (let i = 0; i < PROFILE.length - 1; i++) { const [a, ra] = PROFILE[i], [b, rb] = PROFILE[i + 1]; if (d <= b) return lerp(ra, rb, (d - a) / (b - a)); } return 0; };
  function lathe(ctx, X, ay, z, dir, lit, k = 34) {
    const n = 34, ds = []; for (let i = 0; i <= n; i++) ds.push(i / n * 80); if (dir > 0) ds.reverse();
    for (const dd of ds) { const rad = profR(dd) * k, zz = z + dir * (dd + 2); if (rad <= 0) continue; const c = proj(X, ay, zz), tp = proj(X, ay + rad, zz), sc = cam.f / c[2], rx = rad * sc, ry = Math.max(rx * .4, Math.abs(c[1] - tp[1]));
      const flange = false, g = ctx.createLinearGradient(c[0] - rx, 0, c[0] + rx, 0), base = flange ? [84, 54, 30] : [96, 62, 34];
      g.addColorStop(0, rgb(base.map(v => v * lit * .35))); g.addColorStop(.62, rgb(base.map(v => v * lit * 1.25))); g.addColorStop(.8, rgb([210, 160, 104].map(v => v * lit * .75))); g.addColorStop(1, rgb(base.map(v => v * lit * .4)));
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(c[0], c[1], rx, ry, 0, 0, 6.283); ctx.fill(); }
  }

  // ---------------- embers (psalm): gold sparks from the cry above; one lights the wick, the rest settle on line A ----------------
  function makeEmbers() {
    const r = rng(2214), out = [], G = S.goldA, n = 15;
    out.push({ s: [FLAME.x + 120, 980, FLAME.z - 60], c: [FLAME.x + 60, 500, FLAME.z - 40], e: [FLAME.x, FLAME.y + 6, FLAME.z], t0: -1.2, t1: .95, sz: 1.3, wick: true });
    for (let i = 0; i < n; i++) { const k = (i + .5) / n, X = lerp(G.X1 - 8, G.X0 + 8, k) + (r() - .5) * 8, t1 = 1.75 + k * 1.35 + (r() - .5) * .12;
      out.push({ s: [X + (r() - .3) * 700, 900 + r() * 900, G.Z + 200 + r() * 700], c: [X + (r() - .5) * 300, 260 + r() * 300, G.Z + 80 + r() * 200], e: [X, 0, G.Z - LH * .1], t0: t1 - 1.9 - r() * 1.1, t1, sz: .8 + r() * .6, land: X }); }
    for (let i = 0; i < 26; i++) { const t0 = -1.5 + r() * 4.2, X = -100 + r() * 1100;   // drifting ones that never land: they cool and vanish
      out.push({ s: [X, 800 + r() * 1100, 200 + r() * 1100], c: [X + (r() - .5) * 400, 300 + r() * 500, 200 + r() * 900], e: [X + (r() - .5) * 600, 60 + r() * 300, 100 + r() * 900], t0, t1: t0 + 2.2 + r() * 1.6, sz: .5 + r() * .7, drift: true }); }
    return out; }
  const bez = (a, b, c, k) => [0, 1, 2].map(i => (1 - k) * (1 - k) * a[i] + 2 * (1 - k) * k * b[i] + k * k * c[i]);
  function emberPos(e, u) { const k = clamp((u - e.t0) / (e.t1 - e.t0)), q = e.drift ? k : 1 - Math.pow(1 - k, 1.6), p = bez(e.s, e.c, e.e, q);
    p[0] += Math.sin(u * 2.3 + e.t0 * 7) * 14 * (1 - k); p[2] += Math.cos(u * 1.9 + e.t1 * 5) * 10 * (1 - k); return p; }
  function drawEmbers(ctx, u) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const e of S.embers) { if (u < e.t0 || u > e.t1 + (e.drift ? 0 : .05)) continue; const k = clamp((u - e.t0) / (e.t1 - e.t0));
      const a = e.drift ? Math.sin(Math.PI * k) * .9 : ss(0, .12, k), fl = .75 + .25 * Math.sin(u * 23 + e.t1 * 13);
      for (let j = 4; j >= 0; j--) { const p = emberPos(e, u - j * .035), q = proj(p[0], p[1], p[2]); if (q[2] < 50) continue; const sc = cam.f / q[2], rr = Math.max(1.4, 5.5 * e.sz * sc);
        if (j === 0) { Lamplit.glow(ctx, q[0], q[1], rr * 7, [255, 170, 70], .5 * a * fl); ctx.fillStyle = `rgba(255,240,200,${a * fl})`; ctx.beginPath(); ctx.arc(q[0], q[1], rr * .55, 0, 6.283); ctx.fill(); }
        else { ctx.fillStyle = `rgba(255,170,70,${a * .22 * (1 - j / 5)})`; ctx.beginPath(); ctx.arc(q[0], q[1], rr * .5, 0, 6.283); ctx.fill(); } } }
    ctx.restore(); }

  // ---------------- grade ----------------
  function finish(ctx, u, lx, ly, light) {
    Lamplit.dust(ctx, u, [lx, ly], clamp(light), .9);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgb(32,23,16)'; ctx.fillRect(0, 0, W, H); ctx.restore();   // lifted film blacks
    Lamplit.vignette(ctx, .55); Lamplit.filmGrain(ctx, u, .07); }

  // ---------------- the two scenes ----------------
  const CAM = {
    isaiah: V ? [[-3.8, { x: 300, z: -700, h: 680, p: 31, cy: .34, f: 1200 }], [1.5, { x: 390, z: -780, h: 600, p: 23, cy: .37, f: 1200 }], [7.6, { x: 400, z: -820, h: 560, p: 16, cy: .385, f: 1250 }]]
              : [[-3.8, { x: 120, z: -920, h: 880, p: 38, cy: .38, f: 1150 }], [1.5, { x: 170, z: -980, h: 730, p: 26, cy: .38, f: 1150 }], [7.6, { x: 260, z: -960, h: 560, p: 14, cy: .395, f: 1150 }]],
    psalm: V ? [[0, { x: 420, z: -520, h: 620, p: 30, cy: .33, f: 1200 }], [4, { x: 500, z: -450, h: 560, p: 31, cy: .33, f: 1200 }], [9.5, { x: 550, z: -380, h: 510, p: 32, cy: .335, f: 1200 }],
               [11.4, { x: 470, z: -400, h: 520, p: 33, cy: .335, f: 1200 }], [14.0, { x: 40, z: -430, h: 520, p: 33, cy: .34, f: 1200 }], [16.5, { x: 10, z: -500, h: 560, p: 32, cy: .345, f: 1200 }]]
             : [[0, { x: 320, z: -760, h: 740, p: 34, cy: .36, f: 1150 }], [4, { x: 420, z: -640, h: 640, p: 35, cy: .36, f: 1150 }], [9.5, { x: 500, z: -500, h: 560, p: 36, cy: .36, f: 1150 }],
               [11.4, { x: 430, z: -520, h: 560, p: 37, cy: .36, f: 1150 }], [14.0, { x: 90, z: -560, h: 560, p: 39, cy: .35, f: 1150 }], [16.5, { x: 50, z: -640, h: 600, p: 38, cy: .355, f: 1150 }]],
  };

  function isaiah(ctx, u) {
    setCam(camAt(CAM.isaiah, u));
    const open = eio(clamp((u + 3.8) / 5.3)), xc = V ? 110 : -250, xl = lerp(xc - 30, V ? 70 : -330, open), xr = lerp(xc + 30, V ? 740 : 780, open);   // closed, it lies left of the lamp (never under the flame); the right roll unrolls toward it
    const gust = ss(1.7, 2.1, u) * (1 - ss(2.5, 3.5, u)), flare = ss(2.9, 3.3, u) * (1 - ss(3.4, 4.6, u));
    const lampI = (1.76 - .22 * gust + .18 * flare) * flick(u), amb = .66, focus = ss(2.2, 4.8, u), hillK = ss(2.6, 5.2, u);
    drawWall(ctx, lampI, amb); drawWindow(ctx, u, lampI, focus, hillK);
    drawTable(ctx, lampI, amb, xl, xr); drawJar(ctx, lampI);
    drawLamp(ctx, u, 1, gust, lampI);
    drawSheet(ctx, S.isa, xl, xr, lampI, amb, gust, []);
    const f = flame(ctx, u, 1, gust); smoke(ctx, u, f, .8 - .5 * gust);
    // the bloom dims before the dissolve into the cross (87.4): it sat right behind the middle cross like a halo (6차, 2026-11-14)
    bloom(ctx, f, (1 - .5 * focus * .4) * (1 - .85 * ss(6.9, 7.7, u)), lampI);
    finish(ctx, u, f[0], f[1] + 200, lampI);
  }

  // the lamp's light (psalm). 8차 이상 확인 (97.87: the whole room jumped brighter in one frame, luma 33→41): the ignition flare
  // was a step (0 → .25 the frame the ember touched the wick). The room's light now rises over ~0.5 s (flare eased in, then
  // decaying); only the flame itself catches at once (a small flame the instant the ember lands — flameOn).
  const psalmLight = u => { const ign = ss(.95, 1.7, u), flare = .25 * ss(.95, 1.45, u) * Math.exp(-Math.max(0, u - 1.25) * 3);
    return { ign, lampI: (ign * 1.26 + flare) * flick(u), amb: .34 + .7 * (1 - ign), flameOn: Math.max(ign, .45 * ss(.95, 1.12, u)) }; };
  const xlPsalm = u => lerp(90, V ? -330 : -420, eio(clamp((u - 11.6) / 1.4)));
  function psalm(ctx, u, sub = false) {
    setCam(camAt(CAM.psalm, u));
    const color = ss(.6, 3.2, u), { ign, lampI, amb, flameOn } = psalmLight(u);
    const xr = 780, xl = xlPsalm(u);
    // line A: embers settle (dots), the line warms, then at 6.0 it wakes to gold right → left; line B wakes at 12.2
    const dots = S.embers.filter(e => e.land).map(e => [e.land, u < e.t1 ? 0 : (Math.exp(-(u - e.t1) * 1.4) * .9 + .25) * (1 - ss(6, 7, u))]);
    const A = { G: S.goldA, warm: ss(1.8, 3.3, u) * (.85 + .15 * Math.sin(u * 5)), dots, reveal: clamp((u - 6.0) / .9), lit: ss(6.0, 6.9, u), pulse: Math.exp(-Math.max(0, u - 6.9) * .8) };
    const B = { G: S.goldB, warm: ss(11.9, 12.3, u), reveal: clamp((u - 12.2) / 1.0), lit: ss(12.2, 13.2, u), pulse: Math.exp(-Math.max(0, u - 13.2) * .8) };
    drawWall(ctx, lampI, amb);
    drawTable(ctx, lampI, amb, xl, xr);   // (no jar here: the camera pans along the scroll and the jar showed cut off at the edge)
    drawLamp(ctx, u, ign, 0, lampI);
    drawSheet(ctx, S.psa, xl, xr, lampI, amb, 0, [A, B]);
    const f = flame(ctx, u, flameOn, 0); smoke(ctx, u, f, u < 1 ? .9 : .7);
    // light blooms where a line wakes (screen space, over the paper)
    for (const [L, t0] of [[A, 6.0], [B, 12.2]]) { if (L.lit <= 0) continue; const G = L.G, k = L.reveal, xm = lerp(G.X1, G.X0, Math.min(k, 1) * .5 + (k >= 1 ? .0 : 0)), p = proj(lerp(G.X1, G.X0, Math.min(1, k) * .5), 6, G.Z), sc = cam.f / p[2];
      const burst = Math.exp(-Math.max(0, u - t0 - .3) * 1.6) * ss(t0, t0 + .3, u);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(p[0], p[1]); ctx.scale(2.6, 1);
      Lamplit.glow(ctx, 0, 0, 260 * sc, [255, 196, 100], (.3 * L.lit + .5 * burst)); ctx.restore(); }
    bloom(ctx, f, flameOn, lampI);
    // the black-and-white of the scene before still lingers, then colour comes back (the embers keep their gold)
    if (color < 1) { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 1 - color; ctx.fillStyle = 'rgb(128,128,128)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = (1 - color) * .5; ctx.fillStyle = 'rgb(150,155,170)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (ign < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; Lamplit.glow(ctx, W * .6, -H * .05, Math.max(W, H) * .7, [200, 190, 175], .22 * (1 - ign)); ctx.restore(); }   // the light of the cry above, before the lamp
    drawEmbers(ctx, u);
    if (!sub) finish(ctx, u, f[0], f[1] + 200, lampI + .3);
  }
  // 8차 이상 확인 (108.5–109.5 "두루마리·글줄이 두 겹"): while the camera panned along the scroll the ink moved ~18 px a frame —
  // more than the spacing of its own strokes, so at 30 fps the rows strobed into two overlapping copies. The pan is now slower
  // (11.4–14.0 instead of 11.6–13.4) and, while the picture moves, each frame is the average of a few instants across half a
  // frame (a 180° film shutter): the lines smear a little along the motion instead of doubling. Grain/vignette once, on top.
  function psalmShutter(ctx, u) {
    const h = 1 / 120, a = camAt(CAM.psalm, u - h), b = camAt(CAM.psalm, u + h);
    const move = 1.8 * Math.max(Math.hypot(b.x - a.x, b.z - a.z, b.h - a.h), .5 * Math.abs(xlPsalm(u + h) - xlPsalm(u - h)));   // ≈ px moved in half a frame (f/d ≈ 1.8 at the near rows)
    const n = Math.min(7, Math.ceil(move / 2));
    if (n <= 1) { psalm(ctx, u); return; }
    if (!S.acc || S.acc.width !== W) { S.acc = canvas(W, H); S.sub = canvas(W, H); }
    const A = S.acc.getContext('2d'), B = S.sub.getContext('2d');
    for (let i = 0; i < n; i++) { const ui = u + (i / (n - 1) - .5) * 2 * h;
      B.setTransform(1, 0, 0, 1, 0, 0); B.globalAlpha = 1; B.globalCompositeOperation = 'source-over'; B.filter = 'none'; B.fillStyle = '#050403'; B.fillRect(0, 0, W, H);
      B.save(); psalm(B, ui, true); B.restore();
      A.setTransform(1, 0, 0, 1, 0, 0); A.globalCompositeOperation = 'source-over'; A.globalAlpha = 1 / (i + 1); A.drawImage(S.sub, 0, 0); }   // running average
    A.globalAlpha = 1; ctx.drawImage(S.acc, 0, 0);
    setCam(camAt(CAM.psalm, u)); const f = proj(FLAME.x, FLAME.y, FLAME.z);
    finish(ctx, u, f[0], f[1] + 200, psalmLight(u).lampI + .3);
  }

  function scene(ctx, u, which) {
    if (!S.isa) build();
    ctx.save(); ctx.fillStyle = '#050403'; ctx.fillRect(0, 0, W, H);
    if (which === 'psalm') psalmShutter(ctx, u); else isaiah(ctx, u);
    ctx.restore(); }

  window.__LampScrolls = { build, scene, S };
})();

function buildScrolls() { return window.__LampScrolls.build(); }
function scrollScene(ctx, u, which) { return window.__LampScrolls.scene(ctx, u, which); }
