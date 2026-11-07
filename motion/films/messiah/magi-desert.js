/* magi-desert.js — 「메시아」 동방 박사들 (마 2:1–2): "얼마 뒤, 동방의 박사들이 예루살렘 왕궁에 와서 물었습니다." (~133.0–139.2 s)
   A cinematic night shot, closed-form in ts (seconds since the shot began; -1 … 7.5 for dissolves):
   0–3.5 s  a vast deep-blue desert of dunes under an enormous starfield and one star brighter than all; a small caravan
            (three riders and a pack camel, starlit rims, a pacing walk) crosses a dune crest. Camera low, trucking with them.
   3.5–6.5  the camera pulls back and rises while the lens closes in (a slow dolly-zoom) and pans right: the great star leaves
            the top of the frame, the dark mass of a walled hill city rises above the dunes (Jerusalem), towers, a few torch-lit
            windows, and a gate with two fires; the caravan, now tiny, walks toward it. Warm gate fire against the cold night = unease.
   The land is a real heightfield (transverse dunes, sharp crests, slip faces, haze held in the troughs), raycast per column
   into three depth bins so the city and the caravan sit between them. No words on the art. Self-contained (Pilot only).
   API: buildMagi() (optional; also built lazily), magiScene(ctx, ts). */
(function () {
  const { clamp, lerp, ss, eio, rng, noise, fbm } = Pilot;
  let W, H, V, M = null;

  // ------------------------------------------------------------------------------------------------ world
  const LAM = 34, AF = .55, OFF = .524, SKEW = .45;                         // dune spacing (m), crest position in the profile, phase
  const CITY = { x: 205, z: 840, rx: 190, rz: 120, hill: 58 };   // Jerusalem: a walled hill city on the far side of the sand
  const wob = (x, z) => 12 * Math.sin(x * .026 + 2.3 + z * .003) + 5 * Math.sin(x * .061 + 3.54 + z * .006) + .6 * Math.sin(x * .13 + z * .02);
  let PROF = 0, HILL = 0;   // set by hgt(): the dune profile (0 trough … 1 crest) and the city hill's weight at that point
  function hgt(x, z) {
    // transverse dunes: a long windward slope facing the camera, a sharp crest, a steep slip face behind
    const u = (z + SKEW * x + wob(x, z)) / LAM + OFF, f = u - Math.floor(u);
    let p; if (f < AF) { const q = f / AF; p = q * q * (2 - q); } else { const q = (f - AF) / (1 - AF); p = (1 - q) * (1 - q); }
    const flat = 1 - ss(430, 640, z);                              // the sand gives way to a stony plain before the city
    const A = (5.4 + 2.2 * Math.sin(x * .013 + z * .009)) * flat;
    const swell = (8 * (.5 + .5 * Math.sin(z * .011 + x * .0045 + 2.2)) + 4 * Math.sin(x * .006 - z * .003)) * flat;
    // one tall draa ridge across the middle distance: it hides the city while the camera is low
    const draa = 6 * Math.exp(-(((z + .1 * x) - 230) ** 2) / (2 * 50 * 50)) * (.7 + .3 * Math.sin(x * .013));
    const dx = x - CITY.x, dz = z - CITY.z, hill = CITY.hill * Math.exp(-(dx * dx / (2 * 230 * 230) + dz * dz / (2 * 150 * 150)));
    const rock = flat < 1 ? (1 - flat) * (3 * fbm(x * .02, z * .02, 2) - 1.5) : 0;
    PROF = p * flat + (1 - flat); HILL = hill / CITY.hill;
    return A * p + swell + draa + hill + rock - 3;
  }
  // the crest the caravan walks on (k = 1 crest line, z ≈ 28 m)
  const crestZ = x => { let z = 30; for (let i = 0; i < 3; i++) z = LAM * (1 + AF - OFF) - wob(x, z) - SKEW * x; return z; };
  const GATE = () => M.gate;

  // ------------------------------------------------------------------------------------------------ camera
  const LEAD0 = -6, SPEED = 1.45;                                // the lead camel's x at ts = 0 and the caravan's pace (m/s)
  const leadX = ts => LEAD0 + SPEED * ts;
  function camera(ts) {
    const k = eio(clamp((ts - 3.0) / 4.0)), kz = eio(clamp((ts - 3.0) / 4.3));
    const F0 = V ? 1750 : 1700, F1 = V ? 4900 : 4400;
    // 1: low, just behind the crest of our own dune (a dark edge across the bottom of the frame), the eye a little above the crest
    //    the caravan walks, so their heads stand in the sky and the far ridges lie in haze behind their legs
    const cx7 = leadX(ts) - 7, hc = hgt(cx7, crestZ(cx7)), x1 = leadX(ts) + (V ? 14.5 : 25.6), eye = hc + 2.4;
    const c0 = crestZ(x1) - LAM, h0 = hgt(x1, c0), z1 = c0 - clamp((eye - h0) / .24, 5, 16);
    // 2: back and up while the lens closes in
    const x = lerp(x1, V ? -30 : -36, k), z = lerp(z1, -250, kz), ground = hgt(x, z), y = Math.max(lerp(eye, 17, Math.pow(k, .85)), ground + 1.4);
    const yaw = lerp(V ? -.44 : -.6, V ? .19 : .17, k), F = lerp(F0, F1, k * k * (3 - 2 * k) * .25 + k * .75);
    const hz = H * lerp(V ? .6 : .63, V ? .62 : .6, k);
    return { x, y, z, yaw, F, hz, sy: Math.sin(yaw), cy: Math.cos(yaw), k };
  }
  function P(C, x, y, z) { const dx = x - C.x, dz = z - C.z, d = dx * C.sy + dz * C.cy; if (d < .3) return null;
    return [W / 2 + C.F * (dx * C.cy - dz * C.sy) / d, C.hz - C.F * (y - C.y) / d, d]; }
  function Pdir(C, az, el) { const ce = Math.cos(el), vx = Math.sin(az) * ce, vy = Math.sin(el), vz = Math.cos(az) * ce, d = vx * C.sy + vz * C.cy; if (d < .05) return null;
    return [W / 2 + C.F * (vx * C.cy - vz * C.sy) / d, C.hz - C.F * vy / d]; }

  // ------------------------------------------------------------------------------------------------ light
  const L = (() => { const v = [-.6, .36, -.5], l = Math.hypot(...v); return v.map(a => a / l); })();   // cool key, from the left and beyond
  const ALB = [.95, .88, .76], KEY = [.42, .5, .76], AMB = [.04, .055, .12], HAZE = [.14, .19, .32], WARM = [1.0, .56, .26];
  const fogK = (d, h) => 1 - Math.exp(-d * (1 / 2600 + Math.exp(-Math.max(0, h + 2) / 5) / 120));

  // ------------------------------------------------------------------------------------------------ build
  window.buildMagi = function () {
    W = Pilot.W; H = Pilot.H; V = Pilot.ori === 'v';
    M = { W, H };
    M.bins = [0, 1, 2].map(() => { const c = Pilot.canvas(W, H), x = c.getContext('2d'), im = x.createImageData(W, H); return { c, x, im, u: new Uint32Array(im.data.buffer) }; });
    // stars: directions on the sky (azimuth, elevation), brightness, tint
    const r = rng(2024); M.stars = [];
    for (let i = 0; i < 9000; i++) { const az = -1.2 + r() * 1.9, el = Math.asin(r() * .9) - .02, m = Math.pow(r(), 3.2), tint = r();
      M.stars.push([az, el, m, tint, r() * 6.28]); }
    // the milky way: a band of soft light and dense faint stars
    M.mw = []; for (let i = 0; i < 2600; i++) { const s = r(), az = -1.25 + s * 1.5, el = .04 + s * .9 + (r() - .5) * .16 * (1 - Math.abs(s - .5)) + .04 * Math.sin(s * 9);
      M.mw.push([az, el, r(), r()]); }
    M.mwGlow = []; for (let i = 0; i < 260; i++) { const s = r(); M.mwGlow.push([-1.25 + s * 1.5, .04 + s * .9 + (r() - .5) * .09, .35 + r() * .5, r()]); }
    M.STAR = V ? [-.36, .4] : [-.78, .3];                          // the great star (az, el)
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
    // grain
    M.grain = Pilot.speckle(256, 256, 60, 5);
  };

  // ------------------------------------------------------------------------------------------------ the land (raycast per column)
  function land(C, ts) {
    const [bF, bM, bB] = M.bins; bF.u.fill(0); bM.u.fill(0); bB.u.fill(0);
    const F = C.F, hz = C.hz, g = M.gate, gk = gateK(ts), cx0 = C.x, cz0 = C.z;
    const pack = (r, gg, b) => (255 << 24) | (Math.min(255, b * 255) << 16) | (Math.min(255, gg * 255) << 8) | Math.min(255, r * 255);
    for (let X = 0; X < W; X++) {
      const dxr = (X + .5 - W / 2) / F, rx = C.sy + dxr * C.cy, rz = C.cy - dxr * C.sy;
      // nearest approach of this ray to the city decides how tall the land can get along it (early out)
      const tC = ((CITY.x - cx0) * rx + (CITY.z - cz0) * rz) / (rx * rx + rz * rz), qx = cx0 + tC * rx - CITY.x, qz = cz0 + tC * rz - CITY.z, nearCity = qx * qx + qz * qz < 520 * 520;
      const HM = nearCity ? CITY.hill + 6 : 26;
      const shadeAt = (d, px, pz, h, prof, hill) => {
            // normal from the smoothed surface
            const e = Math.max(.06, d * .004), hx = hgt(px + e, pz) - hgt(px - e, pz), hzz = hgt(px, pz + e) - hgt(px, pz - e);
            let nx = -hx, ny = 2 * e, nz = -hzz;
            // wind ripples near the camera (in the normal only, fading with distance)
            const rf = clamp(1 - d / 130) * clamp(F / d / 9 - .4); if (rf > 0) { const rp = Math.sin(pz * 14 + px * 3 + 3 * Math.sin(px * .5 + pz * .2)) * .13 * rf * e * 2; nz += rp; nx += rp * .25; }
            const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
            const ndl = nx * L[0] + ny * L[1] + nz * L[2], wrap = Math.max(0, (ndl + .2) / 1.2);
            // a sheen where the surface turns away from the eye (starlit crests)
            const vx = cx0 - px, vy = C.y - h, vz = cz0 - pz, vl = Math.hypot(vx, vy, vz), ndv = (nx * vx + ny * vy + nz * vz) / vl, rim = Math.pow(1 - Math.max(0, ndv), 5) * .4 * clamp(ny * 1.4) * clamp(1.2 - d / 160);
            const sky = .55 + .45 * ny, stone = (1 - ss(430, 640, pz) * .35) * (.86 + .24 * noise(px * .012 + 3, pz * .012)) * (.9 + .2 * noise(px * .07 + 9, pz * .55)) * (1 - .5 * hill);
            let r = ALB[0] * stone * (AMB[0] * sky + KEY[0] * wrap) + rim * .5, gg = ALB[1] * stone * (AMB[1] * sky + KEY[1] * wrap) + rim * .58, b = ALB[2] * stone * (AMB[2] * sky + KEY[2] * wrap) + rim * .82;
            // the gate fires light the ground in front of them
            if (gk > 0) { const ddx = px - g.x, ddz = pz - g.z, wl = gk * (1.1 / (1 + (ddx * ddx + ddz * ddz) / 300) + .05 / (1 + (ddx * ddx + ddz * ddz) / 4000)) * (.4 + .6 * clamp(-nz + ny)); r += WARM[0] * wl; gg += WARM[1] * wl; b += WARM[2] * wl; }
            const nd = .36 + .64 * ss(3 + 110 * C.k, 24 + 190 * C.k, d); r *= nd; gg *= nd; b *= nd;   // the near sand in shadow
            const fk = 1 - Math.exp(-d * (1 / 2600 + (1 - prof) * (1 - prof) / 150 + Math.exp(-Math.max(0, h + 2) / 5) / 400));   // haze lies in the troughs
            r = lerp(r, HAZE[0], fk); gg = lerp(gg, HAZE[1], fk); b = lerp(b, HAZE[2], fk);
            return [pack(r, gg, b), pz < crestZ(px) - .35 ? bB : (pz > M.splitZ(px) ? bF : bM)];
      };
      const Yof = dd => { const h = hgt(cx0 + dd * rx, cz0 + dd * rz); return hz - F * (h - C.y) / dd; };
      let yb = H, d = .5, dA = 0, YA = 1e9, dB = 0, YB = 1e9;
      while (d < 3400) {
        const px = cx0 + d * rx, pz = cz0 + d * rz, h = hgt(px, pz), prof = PROF, hill = HILL, Yf = hz - F * (h - C.y) / d;
        // a crest passed between the last samples: find its true top (no stair-stepped ridges)
        if (YB < YA && YB <= Yf && dA > 0) { let lo = dA, hi = d; for (let it = 0; it < 7; it++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (Yof(m1) < Yof(m2)) hi = m2; else lo = m1; }
          const dm = (lo + hi) / 2, Ym = Yof(dm), Yc = Ym <= 0 ? 0 : Math.ceil(Ym);
          if (Yc < yb) { const qx = cx0 + dm * rx, qz = cz0 + dm * rz, qh = hgt(qx, qz), [col, bin] = shadeAt(dm, qx, qz, qh, PROF, HILL), u = bin.u; for (let y = Yc, o = Yc * W + X; y < yb; y++, o += W) u[o] = col; yb = Yc; if (yb <= 0) break; } }
        if (Yf < yb) {
          const Y = Yf <= 0 ? 0 : Math.ceil(Yf);
          if (Y < yb) { const [col, bin] = shadeAt(d, px, pz, h, prof, hill), u = bin.u; for (let y = Y, o = Y * W + X; y < yb; y++, o += W) u[o] = col; yb = Y; if (yb <= 0) break; }
        }
        dA = dB; YA = YB; dB = d; YB = Yf;
        if (hz - F * (HM - C.y) / d >= yb) break;
        d += d * .0048 + .025;
      }
    }
    for (const b of M.bins) b.x.putImageData(b.im, 0, 0);
  }

  // ------------------------------------------------------------------------------------------------ sky
  function sky(ctx, C, ts) {
    const elY = e => C.hz - C.F * Math.tan(e), g = ctx.createLinearGradient(0, elY(.9), 0, C.hz + 40);
    const st = [[0, [3, 6, 18]], [.4, [7, 13, 36]], [.72, [17, 29, 62]], [.9, [32, 46, 82]], [1, [42, 57, 94]]];
    st.forEach(([k, c]) => g.addColorStop(k, `rgb(${c})`)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    // the milky way: soft light first, then its grains
    for (const [az, el, s, q] of M.mwGlow) { const p = Pdir(C, az, el); if (!p) continue; const R = s * C.F * .07; const gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], R);
      gr.addColorStop(0, `rgba(150,165,215,${.025 + .025 * q})`); gr.addColorStop(1, 'rgba(150,165,215,0)'); ctx.fillStyle = gr; ctx.fillRect(p[0] - R, p[1] - R, 2 * R, 2 * R); }
    ctx.fillStyle = '#dfe6ff'; for (const [az, el, a] of M.mw) { const p = Pdir(C, az, el); if (!p || p[1] > C.hz) continue; ctx.globalAlpha = .18 + .4 * a; ctx.fillRect(p[0], p[1], 1.1, 1.1); }
    // stars
    for (const [az, el, m, tint, ph] of M.stars) { const p = Pdir(C, az, el); if (!p || p[0] < -4 || p[0] > W + 4 || p[1] < -4 || p[1] > C.hz + 30) continue;
      const tw = .82 + .18 * Math.sin(ts * (2 + 3 * tint) + ph), a = (.22 + .78 * m) * tw * (.55 + .45 * ss(0, .12, el)), s = m > .75 ? 2.6 : m > .4 ? 1.8 : 1.15;
      ctx.globalAlpha = a; ctx.fillStyle = tint < .2 ? '#ffe6c8' : tint < .45 ? '#cfdcff' : '#f4f6ff'; ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s);
      if (m > .93) { const gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 9); gr.addColorStop(0, 'rgba(210,222,255,.35)'); gr.addColorStop(1, 'rgba(210,222,255,0)'); ctx.fillStyle = gr; ctx.fillRect(p[0] - 9, p[1] - 9, 18, 18); } }
    ctx.globalAlpha = 1;
    // a glow over the horizon (air light)
    { const gr = ctx.createLinearGradient(0, C.hz - (V ? 380 : 260), 0, C.hz + 30); gr.addColorStop(0, 'rgba(80,104,150,0)'); gr.addColorStop(1, 'rgba(80,104,150,.28)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    // the great star
    const p = Pdir(C, ...M.STAR); M.starXY = p;
    if (p) greatStar(ctx, p[0], p[1], ts);
  }
  function greatStar(ctx, x, y, ts) {
    const s = V ? 1 : .9, pulse = 1 + .04 * Math.sin(ts * 1.7) + .025 * Math.sin(ts * 4.3 + 1);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (const [R, a] of [[520 * s, .1], [220 * s, .2], [70 * s, .45], [22 * s, .8]]) { const gr = ctx.createRadialGradient(x, y, 0, x, y, R * pulse);
      gr.addColorStop(0, `rgba(236,236,255,${a})`); gr.addColorStop(.35, `rgba(200,212,255,${a * .35})`); gr.addColorStop(1, 'rgba(190,205,255,0)'); ctx.fillStyle = gr; ctx.fillRect(x - R * pulse, y - R * pulse, 2 * R * pulse, 2 * R * pulse); }
    // soft cross glints (long vertical/horizontal, short diagonals), tapered
    const spike = (ang, len, wd, a) => { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); const gr = ctx.createLinearGradient(-len, 0, len, 0);
      gr.addColorStop(0, 'rgba(220,228,255,0)'); gr.addColorStop(.5, `rgba(250,250,255,${a})`); gr.addColorStop(1, 'rgba(220,228,255,0)'); ctx.fillStyle = gr;
      ctx.beginPath(); ctx.moveTo(-len, 0); ctx.quadraticCurveTo(0, -wd, len, 0); ctx.quadraticCurveTo(0, wd, -len, 0); ctx.fill(); ctx.restore(); };
    spike(0, 190 * s * pulse, 4, .5); spike(Math.PI / 2, 240 * s * pulse, 4, .55); spike(0, 60 * s, 2.2, .7); spike(Math.PI / 2, 70 * s, 2.2, .7); spike(Math.PI / 4, 46 * s, 1.6, .25); spike(-Math.PI / 4, 46 * s, 1.6, .25);
    ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(x, y, 4.2 * s, 0, 6.283); ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------------------------------------------------ the city
  function gateK(ts) { return .25 + .75 * ss(2.6, 5.6, ts); }
  const fl = (ts, k) => .82 + .1 * Math.sin(ts * 13 + k * 7) + .08 * Math.sin(ts * 23.7 + k * 3);
  function stoneCol(n, d, h, warm = 0) {   // n = face normal (x, z), d = distance
    const ndl = n[0] * L[0] + n[1] * L[2], w = Math.max(0, (ndl + .25) / 1.25), A = [.42, .45, .55];
    let c = [0, 1, 2].map(i => A[i] * (AMB[i] * 1.1 + KEY[i] * .62 * w) + WARM[i] * warm);
    const fk = fogK(d, h) * .9; c = c.map((v, i) => lerp(v, HAZE[i], fk));
    return `rgb(${c.map(v => Math.min(255, v * 255) | 0)})`;
  }
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
    const gk = gateK(ts), nb = M.bins[1].u, bb = M.bins[2].u;
    for (const [x, y, s, i] of M.fires || []) {
      const ix = Math.round(x), iy = Math.round(y - s); if (ix >= 0 && ix < W && iy >= 0 && iy < H && (nb[iy * W + ix] || bb[iy * W + ix])) continue;   // hidden behind the dunes
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
    const sx = M.starXY ? M.starXY[0] : W * .3, sy = M.starXY ? M.starXY[1] : -H;
    for (const c of out) {
      const [X, Y] = c.p, tl = Math.hypot(sx - X, sy - Y), tow = [(sx - X) / tl, (sy - Y) / tl], rimPx = clamp(c.s * .045, .9, 3.2), rimA = .9;
      ctx.save(); ctx.translate(X, Y + c.s * .03); ctx.rotate(c.ang * .6);
      const bob = .025 * Math.cos(c.ph * 2) * c.s; ctx.translate(0, bob);
      const far = new Path2D(), body = new Path2D();
      camelLegs(far, c.ph, true); camelLegs(body, c.ph, false); camelBody(body, c.ph, c.i === 3); if (c.i < 3) rider(body, c.ph, c.i, ts, c.i * 3.1);
      ctx.scale(c.s, c.s);
      const draw = (path, base) => { ctx.save(); ctx.clip(path); ctx.fillStyle = 'rgba(190,206,246,1)'; ctx.globalAlpha = rimA; ctx.fill(path); ctx.globalAlpha = 1;
        ctx.translate(-tow[0] * rimPx / c.s, -tow[1] * rimPx / c.s); ctx.fillStyle = base; ctx.fill(path); ctx.restore(); };
      draw(far, 'rgb(22,26,44)'); draw(body, 'rgb(9,11,22)');
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

  // sand blown off the crest the caravan walks on, and off the near dunes
  function drift(ctx, C, ts) {
    const r = rng(404); ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 700; i++) {
      const fg = i >= 420, per = 1.2 + r() * 1.6, age = ((ts / per + r()) % 1 + 1) % 1, span = fg ? 34 : 70, x0 = r() * span, lift = r();
      const c = fg ? C.x + 9 * C.sy : leadX(ts) - 7, xw = c - span / 2 + ((x0 + ts * 4.2 - (c - span / 2)) % span + span) % span;
      const zc = fg ? crestZ(xw) - LAM : crestZ(xw), hh = hgt(xw, zc), y = hh + .03 + lift * (fg ? .5 : 1.2) * age + .2 * age * age, p = P(C, xw + age * 1.8, y, zc + .3);
      if (!p || p[0] < -10 || p[0] > W + 10 || p[1] < 0 || p[1] > H) continue;
      const s = C.F / p[2], a = Math.sin(Math.PI * age) * (fg ? .16 : .45) * clamp(s / 14), len = clamp(.12 * s, 1.2, 7);
      ctx.fillStyle = `rgba(180,196,236,${a})`; ctx.fillRect(p[0], p[1], len, 1);
    }
    ctx.restore();
  }


  function tufts(ctx, C, ts) {
    const c = C.x + 10 * C.sy, x0 = Math.floor((c - 16) / 1.3);
    const fade = 1 - ss(0, .25, C.k); if (fade <= 0) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = fade;
    for (let j = x0; j < x0 + 26; j++) { const r = rng(j * 977 + 13); if (r() < .6) continue;
      const x = j * 1.3 + r() * 1.1, z = crestZ(x) - LAM - .05 - r() * .3, base = P(C, x, hgt(x, z) - .05, z); if (!base || base[2] < 2 || base[2] > 30) continue;
      const s = C.F / base[2], n = 5 + (r() * 8 | 0), hgtM = .14 + r() * .26;
      for (let i = 0; i < n; i++) { const a = (r() - .5) * 1.1 + .25 + .08 * Math.sin(ts * 2.4 + j + i), l = hgtM * (.5 + r() * .6) * s;
        ctx.strokeStyle = 'rgb(9,11,20)'; ctx.lineWidth = Math.max(1, .018 * s); ctx.beginPath(); ctx.moveTo(base[0] + (r() - .5) * .12 * s, base[1]);
        ctx.quadraticCurveTo(base[0] + Math.sin(a) * l * .4, base[1] - l * .6, base[0] + Math.sin(a) * l, base[1] - Math.cos(a) * l); ctx.stroke(); } }
    ctx.restore();
  }
  // ------------------------------------------------------------------------------------------------ the shot
  window.magiScene = function (ctx, ts) {
    if (!M || M.W !== Pilot.W || M.H !== Pilot.H) window.buildMagi();
    const C = camera(ts);
    // terrain beyond the city's near wall is drawn behind the city; split per x
    M.splitZ = x => { const q = (x - CITY.x) / (CITY.rx * 1.05); return Math.abs(q) < 1 ? CITY.z - CITY.rz * 1.05 * Math.sqrt(1 - q * q) : CITY.z + 60; };
    ctx.save();
    sky(ctx, C, ts);
    land(C, ts);
    ctx.drawImage(M.bins[0].c, 0, 0);
    city(ctx, C, ts);
    ctx.drawImage(M.bins[1].c, 0, 0);
    { const b = P(C, CITY.x, CITY.hill * .55, CITY.z - CITY.rz); if (b) { const s = C.F / b[2], y0 = b[1] - 26 * s, y1 = b[1] + 10 * s, g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, 'rgba(40,54,88,0)'); g.addColorStop(.7, 'rgba(40,54,88,.32)'); g.addColorStop(1, 'rgba(40,54,88,0)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); } }
    caravan(ctx, C, ts);
    ctx.drawImage(M.bins[2].c, 0, 0);
    // tufts(ctx, C, ts);   // dry grass on our crest: off (it floated below the visible edge)
    drift(ctx, C, ts);
    fires(ctx, ts);
    // grade: a low haze breathing over the sand, the vignette, the darker band for the words, grain
    { const g = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .35, W / 2, H * .5, Math.max(W, H) * .78); g.addColorStop(0, 'rgba(0,0,8,0)'); g.addColorStop(1, 'rgba(0,0,8,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    { const y0 = H * .7, g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, 'rgba(2,4,12,0)'); g.addColorStop(1, 'rgba(2,4,12,.6)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }
    { const fr = Math.floor(ts * 24), rr = rng(fr * 7 + 3); ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .1; const ox = -rr() * 256, oy = -rr() * 256;
      for (let y = oy; y < H; y += 256) for (let x = ox; x < W; x += 256) ctx.drawImage(M.grain, x, y); ctx.restore(); }
    ctx.restore();
  };
})();
