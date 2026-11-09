/* magi-desert.js — 「메시아」 동방 박사들 (마 2:1–2): "얼마 뒤, 동방의 박사들이 예루살렘 왕궁에 와서 물었습니다." (~133.0–139.2 s)
   A cinematic night shot, closed-form in ts (seconds since the shot began; -1 … 7.5 for dissolves):
   0–3.5 s  a vast deep-blue desert of dunes under an enormous starfield and one star brighter than all; a small caravan
            (three riders and a pack camel, starlit rims, a pacing walk) crosses a dune crest. Camera low, trucking with them.
   3.5–6.5  the camera pulls back and rises while the lens closes in (a slow dolly-zoom) and pans right: the great star leaves
            the top of the frame, the dark mass of a walled hill city rises above the dunes (Jerusalem), towers, a few torch-lit
            windows, and a gate with two fires; the caravan, now tiny, walks toward it. Warm gate fire against the cold night = unease.
   The look — the dune heightfield raycast per column into depth bins, the starfield and the great star, the starlit sand, the
   finish — is the kit kit-nightdunes.js (window.DUNES; canvas-film kits/nightdunes). This file is the shot: the city's hill and
   the stony plain before it, the city, the caravan, the camera and the timing. Three depth bins put the city and the caravan
   between them. No words on the art. Needs Pilot + kit-nightdunes.js.
   API: buildMagi() (optional; also built lazily), magiScene(ctx, ts). */
(function () {
  const { clamp, lerp, ss, eio, rng, noise, fbm } = Pilot;
  let W, H, V, M = null, D = null, P, hgt, crestZ, stoneCol;

  // ------------------------------------------------------------------------------------------------ world
  const CITY = { x: 205, z: 840, rx: 190, rz: 120, hill: 58 };   // Jerusalem: a walled hill city on the far side of the sand
  const plain = (x, z) => ss(430, 640, z);                        // the sand gives way to a stony plain before the city
  function extra(h, x, z, flat, D) {
    // one tall draa ridge across the middle distance: it hides the city while the camera is low
    const draa = 6 * Math.exp(-(((z + .1 * x) - 230) ** 2) / (2 * 50 * 50)) * (.7 + .3 * Math.sin(x * .013));
    const dx = x - CITY.x, dz = z - CITY.z, hill = CITY.hill * Math.exp(-(dx * dx / (2 * 230 * 230) + dz * dz / (2 * 150 * 150)));
    const rock = flat < 1 ? (1 - flat) * (3 * fbm(x * .02, z * .02, 2) - 1.5) : 0;
    D.dim = hill / CITY.hill;                                     // the hill's ground is darker
    return h + draa + hill + rock;
  }
  // terrain beyond the city's near wall is drawn behind the city (bin 0); our own crest's near side in front of the caravan (bin 2)
  const splitZ = x => { const q = (x - CITY.x) / (CITY.rx * 1.05); return Math.abs(q) < 1 ? CITY.z - CITY.rz * 1.05 * Math.sqrt(1 - q * q) : CITY.z + 60; };
  const bin = (x, z) => z < crestZ(x) - .35 ? 2 : (z > splitZ(x) ? 0 : 1);
  const GATE = () => M.gate;

  // ------------------------------------------------------------------------------------------------ camera
  const LEAD0 = -6, SPEED = 1.45;                                // the lead camel's x at ts = 0 and the caravan's pace (m/s)
  const leadX = ts => LEAD0 + SPEED * ts;
  function camera(ts) {
    const LAM = D.lam, k = eio(clamp((ts - 3.0) / 4.0)), kz = eio(clamp((ts - 3.0) / 4.3));
    const F0 = V ? 1750 : 1700, F1 = V ? 4900 : 4400;
    // 1: low, just behind the crest of our own dune (a dark edge across the bottom of the frame), the eye a little above the crest
    //    the caravan walks, so their heads stand in the sky and the far ridges lie in haze behind their legs
    const cx7 = leadX(ts) - 7, hc = hgt(cx7, crestZ(cx7)), x1 = leadX(ts) + (V ? 14.5 : 25.6), eye = hc + 2.4;
    const c0 = crestZ(x1) - LAM, h0 = hgt(x1, c0), z1 = c0 - clamp((eye - h0) / .24, 5, 16);
    // 2: back and up while the lens closes in (DUNES.dolly: the focal ramp of a dolly-zoom)
    const x = lerp(x1, V ? -30 : -36, k), z = lerp(z1, -250, kz), ground = hgt(x, z), y = Math.max(lerp(eye, 17, Math.pow(k, .85)), ground + 1.4);
    const yaw = lerp(V ? -.44 : -.6, V ? .19 : .17, k), F = DUNES.dolly(F0, F1, k);
    const hz = H * lerp(V ? .6 : .63, V ? .62 : .6, k);
    return D.camera({ x, y, z, yaw, F, hz, k });
  }

  // ------------------------------------------------------------------------------------------------ build
  window.buildMagi = function () {
    W = Pilot.W; H = Pilot.H; V = Pilot.ori === 'v';
    D = DUNES.world({ plain, extra, bins: 3, bin, peaks: [{ x: CITY.x, z: CITY.z, r: 520, h: CITY.hill + 6 }], star: V ? [-.36, .4] : [-.78, .3] });   // the great star (az, el)
    P = D.P; hgt = D.hgt; crestZ = D.crestZ; stoneCol = D.faceCol;
    M = { W, H };
    // the city: a wall ring on the hill, towers, houses and a palace inside, a gate with two fires on the near side
    const C = CITY, wall = [];
    for (let i = 0; i <= 96; i++) { const a = i / 96 * 6.2832, rr = 1 + .07 * Math.sin(a * 3 + 1) + .04 * Math.sin(a * 7), x = C.x + C.rx * rr * Math.cos(a), z = C.z + C.rz * rr * Math.sin(a);
      wall.push({ a, x, z, y: hgt(x, z) - 1 }); }
    M.wall = wall;
    const ga = -1.72, gi = Math.round(((ga + 6.2832) % 6.2832) / 6.2832 * 96), gw = wall[gi];
    M.gate = { x: gw.x, z: gw.z - .5, y: gw.y + 1, i: gi };
    M.towers = []; for (let i = 0; i < 96; i += 6) { if (Math.abs(i - gi) < 3) continue; const w = wall[i]; M.towers.push({ x: w.x, z: w.z, y: w.y, s: 10 + (i % 12 ? 0 : 2), h: 33 + (i * 37 % 7) }); }
    for (const o of [-2, 2]) { const w = wall[(gi + o + 96) % 96]; M.towers.push({ x: w.x, z: w.z, y: w.y, s: 11, h: 38, gate: 1 }); }
    const rb = rng(71); M.houses = [];
    for (let i = 0; i < 150; i++) { const a = rb() * 6.2832, rr = Math.sqrt(rb()) * .86, x = C.x + C.rx * rr * Math.cos(a), z = C.z + C.rz * rr * Math.sin(a);
      M.houses.push({ x, z, y: hgt(x, z) - 1, w: 9 + rb() * 14, d: 9 + rb() * 12, h: 14 + rb() * 10 + 8 * (1 - rr), lit: rb() < .06 ? rb() : -1, k: rb() }); }
    // the palace on the west side with its three great towers; the temple platform's long wall beyond
    M.houses.push({ x: C.x - 95, z: C.z - 10, y: hgt(C.x - 95, C.z - 10) - 1, w: 70, d: 40, h: 30, lit: .3, k: .2, big: 1 });
    for (const [ox, h] of [[-120, 52], [-104, 46], [-88, 49]]) M.houses.push({ x: C.x + ox, z: C.z - 30, y: hgt(C.x + ox, C.z - 30) - 1, w: 11, d: 11, h, lit: .6, k: ox, big: 1 });
    M.houses.push({ x: C.x + 85, z: C.z + 40, y: hgt(C.x + 85, C.z + 40) - 1, w: 110, d: 70, h: 30, lit: -1, k: .5, big: 1 });
    M.houses.sort((a, b) => b.z - a.z);
  };

  // ------------------------------------------------------------------------------------------------ the city
  function gateK(ts) { return .25 + .75 * ss(2.6, 5.6, ts); }
  const fl = (ts, k) => .82 + .1 * Math.sin(ts * 13 + k * 7) + .08 * Math.sin(ts * 23.7 + k * 3);
  function quad(ctx, C, pts) { const q = pts.map(p => P(C, ...p)); if (q.some(v => !v)) return false; ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); return true; }
  function box(ctx, C, b, ts, gk) {
    const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, y0 = b.y, y1 = b.y + b.h, d = Math.hypot(b.x - C.x, b.z - C.z);
    const g = M.gate, wk = gk * .9 / (1 + ((b.x - g.x) ** 2 + (b.z - g.z) ** 2) / 260);
    // side face toward the camera, then the front
    const side = C.x < x0 ? [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0]] : C.x > x1 ? [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [1, 0]] : null;
    if (side && quad(ctx, C, side.slice(0, 4))) { ctx.fillStyle = stoneCol(side[4], d, y1, wk * .1); ctx.fill(); }
    if (quad(ctx, C, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]])) { ctx.fillStyle = stoneCol([0, -1], d, y1, wk * .15); ctx.fill(); }
    if (b.big && b.h > 40) { const pa = P(C, x0, y1, z0), pb = P(C, x1, y1, z0); if (pa && pb) { const sc = C.F / pa[2]; ctx.fillStyle = stoneCol([0, -1], d, y1, 0); for (let j = 0; j < 4; j++) ctx.fillRect(lerp(pa[0], pb[0], j / 3.5), pa[1] - 1.8 * sc, (pb[0] - pa[0]) / 7 + .5, 1.8 * sc + 1); } }
    if (C.y > y1 && quad(ctx, C, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])) { ctx.fillStyle = stoneCol([0, 0], d * .8, y1, 0); ctx.fill(); }
    // its top edge catches the starlight
    const a = P(C, x0, y1, z0), c = P(C, x1, y1, z0); if (b.big && a && c) { ctx.strokeStyle = 'rgba(150,170,220,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); }
    return d;
  }
  function windowLight(ctx, C, x, y, z, ts, k, a = 1) { const p = P(C, x, y, z); if (!p) return; const s = C.F / p[2], f = fl(ts, k) * a, w = Math.max(1.6, 1.1 * s), h = Math.max(2.2, 1.7 * s);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; const R = Math.max(8, 7 * s), gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], R);
    gr.addColorStop(0, `rgba(255,170,80,${.42 * f})`); gr.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = gr; ctx.fillRect(p[0] - R, p[1] - R, 2 * R, 2 * R);
    ctx.fillStyle = `rgba(255,206,130,${f})`; ctx.fillRect(p[0] - w / 2, p[1] - h / 2, w, h); ctx.restore(); }
  function city(ctx, C, ts) {
    const gk = gateK(ts), g = M.gate, wall = M.wall, WH = 20;
    // back wall (the far half of the ring), then the houses and the palace, then the near wall with its towers
    const drawWall = near => { for (let i = 0; i < 96; i++) { const a = wall[i], b = wall[i + 1], mz = (a.z + b.z) / 2, isNear = mz < CITY.z; if (isNear !== near) continue;
        if (quad(ctx, C, [[a.x, a.y, a.z], [b.x, b.y, b.z], [b.x, b.y + WH, b.z], [a.x, a.y + WH, a.z]])) {
          const tx = b.x - a.x, tz = b.z - a.z, tl = Math.hypot(tx, tz), n = [tz / tl, -tx / tl], d = Math.hypot(a.x - C.x, a.z - C.z), wk = gk * 1.1 / (1 + ((a.x - g.x) ** 2 + (a.z - g.z) ** 2) / 220);
          ctx.fillStyle = stoneCol(near ? n : n.map(v => -v), d, a.y + WH, wk * .2); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke();
          // crenellations: small merlons along the top
          const pa = P(C, a.x, a.y + WH, a.z), pb = P(C, b.x, b.y + WH, b.z); if (pa && pb) { const s = C.F / pa[2], n2 = Math.max(1, Math.round(tl / 3)); ctx.fillStyle = stoneCol(n, d, a.y + WH, wk * .2);
            for (let j = 0; j < n2; j++) { const k0 = (j + .15) / n2, k1 = (j + .6) / n2; ctx.fillRect(lerp(pa[0], pb[0], k0), lerp(pa[1], pb[1], k0) - 1.4 * s, (pb[0] - pa[0]) * (k1 - k0) + .5, 1.4 * s + 1); } }
        } } };
    drawWall(false);
    for (const b of M.houses) { box(ctx, C, b, ts, gk); }
    for (const b of M.houses) if (b.lit >= 0) windowLight(ctx, C, b.x + (b.k - .5) * b.w * .6, b.y + b.h * (.45 + .3 * b.lit), b.z - b.d / 2 - .2, ts, b.k * 9, .9);
    drawWall(true);
    // the towers, far first
    const tw = M.towers.slice().sort((a, b) => Math.hypot(b.x - C.x, b.z - C.z) - Math.hypot(a.x - C.x, a.z - C.z));
    for (const t of tw) { box(ctx, C, { x: t.x, z: t.z - 2, y: t.y, w: t.s, d: t.s, h: t.h }, ts, gk);
      const pa = P(C, t.x - t.s / 2, t.y + t.h, t.z - 2 - t.s / 2), pb = P(C, t.x + t.s / 2, t.y + t.h, t.z - 2 - t.s / 2);
      if (pa && pb) { const s = C.F / pa[2]; ctx.fillStyle = stoneCol([0, -1], pa[2], t.y + t.h, 0); for (let j = 0; j < 4; j++) ctx.fillRect(lerp(pa[0], pb[0], j / 3.5), pa[1] - 1.6 * s, (pb[0] - pa[0]) / 7 + .5, 1.6 * s + 1); }
      if (t.gate || (t.x * 7 | 0) % 5 === 0) windowLight(ctx, C, t.x, t.y + t.h * .72, t.z - 2 - t.s / 2 - .2, ts, t.x, t.gate ? 1 : .7); }
    // the gate: a dark arch with a faint warm inside, two fires on posts before it
    const gp = P(C, g.x, g.y, g.z - 1.5); if (!gp) return; const s = C.F / gp[2];
    ctx.save(); ctx.translate(gp[0], gp[1]); ctx.scale(s, s);
    ctx.fillStyle = 'rgb(14,10,14)'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-3, -6); ctx.arc(0, -6, 3, Math.PI, 0); ctx.lineTo(3, 0); ctx.closePath(); ctx.fill();
    { const gr = ctx.createLinearGradient(0, 0, 0, -8); gr.addColorStop(0, `rgba(255,150,70,${.55 * gk})`); gr.addColorStop(1, 'rgba(255,150,70,0)'); ctx.fillStyle = gr; ctx.fill(); }
    ctx.restore();
    { const b0 = P(C, g.x, g.y + 1, g.z - 2); if (b0) { const sc = C.F / b0[2], R = 24 * sc; ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (const o of [-6.5, 6.5]) { const q = P(C, g.x + o, g.y + 3, g.z - 2.5); if (!q) continue; const gr = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], R);
        gr.addColorStop(0, `rgba(255,150,70,${.42 * gk})`); gr.addColorStop(.35, `rgba(220,110,50,${.16 * gk})`); gr.addColorStop(1, 'rgba(200,90,40,0)'); ctx.fillStyle = gr; ctx.fillRect(q[0] - R, q[1] - R, 2 * R, 2 * R); }
      ctx.restore(); } }
    M.fires = [-6.5, 6.5].map((o, i) => { const p = P(C, g.x + o, g.y + 2.6, g.z - 3); return p ? [p[0], p[1], C.F / p[2], i] : null; }).filter(Boolean);
    for (const [x, y, s, i] of M.fires) { ctx.fillStyle = 'rgb(16,12,14)'; ctx.fillRect(x - .2 * s, y, .4 * s, 2.6 * s); ctx.beginPath(); ctx.moveTo(x - .9 * s, y - .3 * s); ctx.lineTo(x + .9 * s, y - .3 * s); ctx.lineTo(x + .5 * s, y + .3 * s); ctx.lineTo(x - .5 * s, y + .3 * s); ctx.fill(); }
  }
  function fires(ctx, ts) {
    const gk = gateK(ts);
    for (const [x, y, s, i] of M.fires || []) {
      const ix = Math.round(x), iy = Math.round(y - s); if (ix >= 0 && ix < W && iy >= 0 && iy < H && D.covered(ix, iy, 1)) continue;   // hidden behind the dunes
      const f = fl(ts, i * 5);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (const [R, a, c] of [[Math.max(90, 34 * s), .32, '255,140,60'], [Math.max(34, 11 * s), .55, '255,170,90'], [Math.max(10, 3 * s), .9, '255,214,150']]) {
        const gr = ctx.createRadialGradient(x, y - s * .8, 0, x, y - s * .8, R * f); gr.addColorStop(0, `rgba(${c},${a * gk * f})`); gr.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = gr; ctx.fillRect(x - R, y - s * .8 - R, 2 * R, 2 * R); }
      // the flame itself: three tongues that flicker
      for (let j = 0; j < 3; j++) { const fh = (2.2 - j * .45 + .7 * noise(ts * 6 + j * 3 + i * 11, j)) * s * gk, fw = (.75 - j * .2) * s, sw = (noise(ts * 5 + j, i * 7) - .5) * .5 * s;
        ctx.fillStyle = j === 2 ? 'rgba(255,240,200,.95)' : j ? 'rgba(255,190,90,.9)' : 'rgba(255,120,40,.8)';
        const yb = y - .3 * s; ctx.beginPath(); ctx.moveTo(x - fw, yb); ctx.quadraticCurveTo(x - fw * .9, yb - fh * .5, x + sw, yb - fh); ctx.quadraticCurveTo(x + fw * .9, yb - fh * .5, x + fw, yb); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      // smoke, lit from below, drifting up and left
      ctx.save(); for (let j = 0; j < 6; j++) { const age = ((ts * .35 + j / 6 + i * .37) % 1), sx = x - age * 9 * s + Math.sin(ts + j) * s, sy = y - s * (2 + age * 14), R = s * (1.2 + age * 4.5);
        const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, R); gr.addColorStop(0, `rgba(${lerp(150, 60, age) | 0},${lerp(96, 62, age) | 0},${lerp(74, 80, age) | 0},${.22 * (1 - age) * gk})`); gr.addColorStop(1, 'rgba(60,60,80,0)'); ctx.fillStyle = gr; ctx.fillRect(sx - R, sy - R, 2 * R, 2 * R); }
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------------------------------------ the caravan
  function shape(p, pts) {   // a closed smooth outline through midpoints; [x, y, 1] = a sharp corner; always wound the same way
    let a = 0; for (let i = 0; i < pts.length; i++) { const q = pts[i], r = pts[(i + 1) % pts.length]; a += q[0] * r[1] - r[0] * q[1]; }
    if (a < 0) pts = pts.slice().reverse();
    const n = pts.length, mid = i => { const q = pts[i % n], r = pts[(i + 1) % n]; return [(q[0] + r[0]) / 2, (q[1] + r[1]) / 2]; }, m0 = mid(n - 1);
    p.moveTo(m0[0], m0[1]); for (let i = 0; i < n; i++) { const q = pts[i], m = mid(i); if (q[2]) { p.lineTo(q[0], q[1]); p.lineTo(m[0], m[1]); } else p.quadraticCurveTo(q[0], q[1], m[0], m[1]); } p.closePath(); }
  function limb(p, joints) {   // joints: [x, y, width]; an outline down one side and up the other
    const L = [], R = [];
    for (let i = 0; i < joints.length; i++) { const a = joints[Math.max(0, i - 1)], b = joints[Math.min(joints.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w = joints[i][2] / 2;
      L.push([joints[i][0] + nx * w, joints[i][1] + ny * w]); R.push([joints[i][0] - nx * w, joints[i][1] - ny * w]); }
    shape(p, L.concat(R.reverse())); }
  function camelLegs(p, ph, far) {
    const front = (hx, hy, o) => { const f = ph + o, a = .3 * Math.sin(f), lift = Math.max(0, Math.cos(f)), b = -1.25 * lift * lift, L1 = .7, L2 = .66;
        const k = [hx + L1 * Math.sin(a), hy + L1 * Math.cos(a)], ft = [k[0] + L2 * Math.sin(a + b), k[1] + L2 * Math.cos(a + b)];
        limb(p, [[hx, hy - .1, .26], [hx + .02, hy + .25, .17], [k[0], k[1], .12], [lerp(k[0], ft[0], .5), lerp(k[1], ft[1], .5), .065], [ft[0], ft[1] - .06, .08]]);
        shape(p, [[ft[0] - .1, ft[1] + .02, 1], [ft[0] - .06, ft[1] - .07], [ft[0] + .09, ft[1] - .06], [ft[0] + .15, ft[1] + .02, 1]]); },
      hind = (hx, hy, o) => { const f = ph + o, a = -.2 + .28 * Math.sin(f), lift = Math.max(0, Math.cos(f)), b = .34 - .9 * lift * lift, L1 = .8, L2 = .72;
        const k = [hx + L1 * Math.sin(a), hy + L1 * Math.cos(a)], ft = [k[0] + L2 * Math.sin(a + b), k[1] + L2 * Math.cos(a + b)];
        limb(p, [[hx + .05, hy - .15, .42], [hx - .02, hy + .25, .26], [k[0], k[1], .11], [lerp(k[0], ft[0], .5), lerp(k[1], ft[1], .5), .065], [ft[0], ft[1] - .06, .08]]);
        shape(p, [[ft[0] - .1, ft[1] + .02, 1], [ft[0] - .06, ft[1] - .07], [ft[0] + .09, ft[1] - .06], [ft[0] + .15, ft[1] + .02, 1]]); };
    // a pacing gait: the legs of one side move together
    const o = far ? Math.PI : 0;
    front(far ? .5 : .6, -1.4, o); hind(far ? -.78 : -.68, -1.52, o);
  }
  function camelBody(p, ph, pack) {
    shape(p, [[-.98, -1.72], [-.8, -1.98], [-.5, -2.08], [-.28, -2.36], [.02, -2.46], [.28, -2.3], [.5, -2.02], [.7, -1.9], [.86, -1.62], [.72, -1.36], [.4, -1.28], [-.2, -1.26], [-.62, -1.34], [-.9, -1.46]]);
    // neck and head, bobbing with the stride: the neck dips forward and rises to a head held level
    const nb = new Path2D(), bob = .06 * Math.sin(ph * 2 + .6), ex = .04 * Math.sin(ph * 2);
    shape(nb, [[.55, -2.02], [.82, -1.92], [1.05, -1.74], [1.2 + ex, -1.78], [1.36 + ex, -2.02 + bob], [1.44 + ex, -2.22 + bob], [1.6 + ex, -2.3 + bob], [1.78 + ex, -2.26 + bob], [1.96 + ex, -2.13 + bob], [1.97 + ex, -2.04 + bob], [1.78 + ex, -2.0 + bob],
      [1.56 + ex, -1.98 + bob], [1.42 + ex, -1.72 + bob * .5], [1.28 + ex, -1.46], [1.06, -1.38], [.8, -1.42], [.6, -1.6]]);
    shape(nb, [[1.52 + ex, -2.26 + bob], [1.5 + ex, -2.38 + bob], [1.58 + ex, -2.29 + bob]]);   // the ear
    p.addPath(nb);
    // the tail, hanging, with a tuft
    limb(p, [[-.95, -1.76, .07], [-1.02, -1.5, .05], [-1.04, -1.3, .07]]);
    if (pack) {   // bundles slung on both sides, a rolled carpet on top
      shape(p, [[-.62, -2.25], [-.3, -2.5], [.1, -2.56], [.44, -2.42], [.6, -2.18], [.56, -1.66], [.2, -1.58], [-.2, -1.6], [-.58, -1.7]]);   // sacks
      shape(p, [[-.42, -2.5], [-.1, -2.84], [.28, -2.8], [.4, -2.5]]);                                                                   // a lashed bale
      limb(p, [[-.5, -2.66, .16], [.36, -2.7, .16]]); }
    else {   // the saddle cloth with a fringe
      const fr = []; for (let i = 0; i <= 8; i++) fr.push([.42 - i * .12, -1.74 + (i % 2 ? .06 : 0), 1]);
      shape(p, [[-.52, -2.26], [-.15, -2.5], [.3, -2.45], [.46, -2.2]].concat(fr)); }
  }
  function rider(p, ph, kind, ts, seed) {
    const sway = .03 * Math.sin(ph * 2 + .3), x = -.05 + sway, flap = noise(ts * 2.2 + seed, seed) - .5;
    // the robe from the seat up to the shoulders; one leg forward over the shoulder; the cloth falling down the camel's side
    shape(p, [[x - .3, -2.36], [x - .24, -2.8], [x - .14, -3.06], [x + .1, -3.06], [x + .17, -2.86], [x + .3, -2.52], [x + .48, -2.34], [x + .44, -1.98, 1], [x + .1, -1.9, 1], [x - .2, -2.0]]);
    // a cloak streaming back in the night wind
    shape(p, [[x - .1, -3.04], [x - .38, -2.9 + flap * .1], [x - .7, -2.58 + flap * .16], [x - .64 + flap * .05, -2.36, 1], [x - .4, -2.44], [x - .22, -2.5]]);
    // the arm to the reins
    limb(p, [[x + .1, -2.94, .11], [x + .26, -2.7, .09], [x + .42, -2.62, .07]]);
    p.ellipse(x + .03, -3.18, .1, .12, 0, 0, 6.283);
    if (kind === 0) p.ellipse(x + .02, -3.28, .15, .1, 0, 0, 6.283);                                         // a turban
    else if (kind === 1) shape(p, [[x - .1, -3.24, 1], [x - .08, -3.46], [x + .02, -3.58], [x + .08, -3.46], [x + .12, -3.24, 1]]);   // a tall cap
    else shape(p, [[x - .12, -3.3], [x + .02, -3.36], [x + .14, -3.26], [x + .1, -3.1], [x - .2, -2.95, 1], [x - .16, -3.18]]);   // a hood
  }
  function caravan(ctx, C, ts) {
    const n = 4, out = [];
    for (let i = 0; i < n; i++) {
      const x = leadX(ts) - i * 4.7 + (i === 3 ? -.4 : 0), z = crestZ(x), y = hgt(x, z) - .02, p = P(C, x, y, z); if (!p) continue;
      const ph = (leadX(ts) - i * 4.7) / 2.7 * 6.2832 + i * 1.3, s = C.F / p[2] * (i === 1 ? 1.03 : i === 3 ? .95 : 1);
      // slope of the crest along the walk: the camel tilts with it
      const ang = Math.atan2(-(hgt(x + 1.2, crestZ(x + 1.2)) - hgt(x - 1.2, crestZ(x - 1.2))) * C.F / p[2], 2.4 * C.F / p[2]);
      out.push({ i, x, z, p, s, ph, ang });
    }
    out.sort((a, b) => b.p[2] - a.p[2]);
    // the rim faces the great star
    const sx = D.starXY ? D.starXY[0] : W * .3, sy = D.starXY ? D.starXY[1] : -H;
    for (const c of out) {
      const [X, Y] = c.p, tl = Math.hypot(sx - X, sy - Y), tow = [(sx - X) / tl, (sy - Y) / tl], rimPx = clamp(c.s * .045, .9, 3.2), rimA = .9;
      ctx.save(); ctx.translate(X, Y + c.s * .03); ctx.rotate(c.ang * .6);
      const bob = .025 * Math.cos(c.ph * 2) * c.s; ctx.translate(0, bob);
      const far = new Path2D(), body = new Path2D();
      camelLegs(far, c.ph, true); camelLegs(body, c.ph, false); camelBody(body, c.ph, c.i === 3); if (c.i < 3) rider(body, c.ph, c.i, ts, c.i * 3.1);
      ctx.scale(c.s, c.s);
      D.rimFill(ctx, far, c.s, tow, 'rgb(22,26,44)', rimPx, rimA); D.rimFill(ctx, body, c.s, tow, 'rgb(9,11,22)', rimPx, rimA);
      ctx.restore();
      c.head = [X + 1.95 * c.s, Y - 2.1 * c.s]; c.tailp = [X - 1.0 * c.s, Y - 1.7 * c.s];
    }
    // lead ropes from each camel's saddle to the next one's head
    ctx.save(); ctx.strokeStyle = 'rgba(12,14,26,.9)'; ctx.lineWidth = 1;
    const byI = []; out.forEach(c => byI[c.i] = c);
    for (let i = 1; i < n; i++) { const a = byI[i - 1], b = byI[i]; if (!a || !b) continue; const x0 = a.tailp[0] + .3 * a.s, y0 = a.tailp[1] - .3 * a.s, x1 = b.head[0], y1 = b.head[1];
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + .5 * a.s, x1, y1); ctx.stroke(); }
    ctx.restore();
  }

  // ------------------------------------------------------------------------------------------------ the shot
  window.magiScene = function (ctx, ts) {
    if (!M || M.W !== Pilot.W || M.H !== Pilot.H) window.buildMagi();
    const C = camera(ts), g = M.gate;
    ctx.save();
    D.sky(ctx, C, ts);
    D.land(C, { lights: [{ x: g.x, z: g.z, k: gateK(ts) }] });   // the gate fires light the ground in front of them
    D.layer(ctx, 0);
    city(ctx, C, ts);
    D.layer(ctx, 1);
    { const b = P(C, CITY.x, CITY.hill * .55, CITY.z - CITY.rz); if (b) { const s = C.F / b[2], y0 = b[1] - 26 * s, y1 = b[1] + 10 * s, g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, 'rgba(40,54,88,0)'); g.addColorStop(.7, 'rgba(40,54,88,.32)'); g.addColorStop(1, 'rgba(40,54,88,0)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); } }
    caravan(ctx, C, ts);
    D.layer(ctx, 2);
    D.drift(ctx, C, ts, leadX(ts) - 7, C.x + 9 * C.sy);   // sand blown off the caravan's crest and off the near dune
    fires(ctx, ts);
    D.finish(ctx, ts);   // vignette, the darker band for the words, grain
    ctx.restore();
  };
})();
