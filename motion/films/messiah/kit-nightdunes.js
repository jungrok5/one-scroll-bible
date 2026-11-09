/* kit-nightdunes.js — house style "night desert" (global: window.DUNES). Kits: canvas-film kits/nightdunes (STYLE.md). From one-scroll-bible
   「메시아 예언과 성탄」 (2026-11-07: the magi crossing the desert under the star, magi-desert.js). A cinematic night desert: a real
   heightfield of transverse dunes (a long windward slope facing the camera, a sharp crest, a steep slip face behind, haze held
   in the troughs) raycast per screen column into depth bins, so a shot can put its own objects between them (a city behind the
   far sand, a caravan on a crest). Above it an enormous starfield, a milky way and one star brighter than all; the sand is lit
   by a cool key from the left and beyond, with a starlit sheen on every crest that turns away from the eye. A low pinhole
   camera (position, yaw, focal length — a dolly-zoom is a focal ramp against a pull-back), then vignette, a dark band for the
   words and film grain. Closed-form in time: any frame can be drawn in any order.
     const D = DUNES.world({ star: [-.6, .3], plain, extra, bin, bins: 3, peaks });   // after Pilot.W/H are set (in init)
     const C = D.camera({ x, y, z, yaw, F, hz, k });   // k 0 … 1: how far pulled back (the shadowed near sand widens with it)
     D.sky(ctx, C, ts); D.land(C, { lights }); D.layer(ctx, 0); …your far objects…; D.layer(ctx, 1); …; D.drift(ctx, C, ts, farX, nearX); D.finish(ctx, ts);
   World units are metres: x to the right, z away from the camera at yaw 0, y up. Crest 1 (D.crestZ(x)) is the stage: the line a
   figure walks on; D.crestZ(x) - D.lam is the dune right before it (the dark foreground edge). */
(function () {
  const P = Pilot, { clamp, lerp, ss, rng, noise } = P;
  // the night: a cool key from the left and beyond, sand albedo, ambient sky, trough haze, a warm accent (fire, lamp)
  const L = (() => { const v = [-.6, .36, -.5], l = Math.hypot(...v); return v.map(a => a / l); })();
  const ALB = [.95, .88, .76], KEY = [.42, .5, .76], AMB = [.04, .055, .12], HAZE = [.14, .19, .32], WARM = [1.0, .56, .26];
  const fogK = (d, h) => 1 - Math.exp(-d * (1 / 2600 + Math.exp(-Math.max(0, h + 2) / 5) / 120));
  const SKY = [[0, [3, 6, 18]], [.4, [7, 13, 36]], [.72, [17, 29, 62]], [.9, [32, 46, 82]], [1, [42, 57, 94]]];

  function world(o = {}) {
    const W = P.W, H = P.H, V = P.ori === 'v';
    const LAM = o.lam ?? 34, AF = o.crest ?? .55, OFF = o.off ?? .524, SKEW = o.skew ?? .45;
    const wob = o.wobble || ((x, z) => 12 * Math.sin(x * .026 + 2.3 + z * .003) + 5 * Math.sin(x * .061 + 3.54 + z * .006) + .6 * Math.sin(x * .13 + z * .02));
    const amp = o.amp || ((x, z) => 5.4 + 2.2 * Math.sin(x * .013 + z * .009));
    const swl = o.swell || ((x, z) => 8 * (.5 + .5 * Math.sin(z * .011 + x * .0045 + 2.2)) + 4 * Math.sin(x * .006 - z * .003));
    const plain = o.plain, extra = o.extra, base = o.base ?? -3, nb = o.bins || 1, binOf = o.bin || (() => 0);
    const D = { W, H, V, lam: LAM, crest: AF, off: OFF, skew: SKEW, wob, L, ALB, KEY, AMB, HAZE, WARM, fogK, prof: 0, dim: 0, star: o.star === undefined ? (V ? [-.36, .4] : [-.78, .3]) : o.star, starXY: null };

    // ---------------------------------------------------------------------------------------------- the land
    // height (m) at (x, z); sets D.prof (0 trough … 1 crest; 1 on a plain) and D.dim (0 … 1, set by extra: darker ground, e.g. a hill)
    D.hgt = function (x, z) {
      // transverse dunes: a long windward slope facing the camera, a sharp crest, a steep slip face behind
      const u = (z + SKEW * x + wob(x, z)) / LAM + OFF, f = u - Math.floor(u);
      let p; if (f < AF) { const q = f / AF; p = q * q * (2 - q); } else { const q = (f - AF) / (1 - AF); p = (1 - q) * (1 - q); }
      const fl = plain ? 1 - plain(x, z) : 1;                       // the sand gives way to a plain where plain(x, z) → 1
      const A = amp(x, z) * fl, sw = swl(x, z) * fl;
      D.dim = 0;
      let h = A * p + sw; if (extra) h = extra(h, x, z, fl, D);     // extra terrain (a ridge, a hill, rock): add terms to h and return it
      D.prof = p * fl + (1 - fl);
      return h + base;
    };
    // the z of crest k along x (k = 1: the stage)
    D.crestZ = (x, k = 1, z = 30 + (k - 1) * LAM) => { for (let i = 0; i < 3; i++) z = LAM * (k + AF - OFF) - wob(x, z) - SKEW * x; return z; };

    // ---------------------------------------------------------------------------------------------- camera
    D.camera = c => ({ x: c.x, y: c.y, z: c.z, yaw: c.yaw, F: c.F, hz: c.hz, sy: Math.sin(c.yaw), cy: Math.cos(c.yaw), k: c.k || 0 });
    D.P = (C, x, y, z) => { const dx = x - C.x, dz = z - C.z, d = dx * C.sy + dz * C.cy; if (d < .3) return null;
      return [W / 2 + C.F * (dx * C.cy - dz * C.sy) / d, C.hz - C.F * (y - C.y) / d, d]; };
    D.Pdir = (C, az, el) => { const ce = Math.cos(el), vx = Math.sin(az) * ce, vy = Math.sin(el), vz = Math.cos(az) * ce, d = vx * C.sy + vz * C.cy; if (d < .05) return null;
      return [W / 2 + C.F * (vx * C.cy - vz * C.sy) / d, C.hz - C.F * vy / d]; };

    // ---------------------------------------------------------------------------------------------- build
    D.bins = Array.from({ length: nb }, () => { const c = P.canvas(W, H), x = c.getContext('2d'), im = x.createImageData(W, H); return { c, x, im, u: new Uint32Array(im.data.buffer) }; });
    // stars: directions on the sky (azimuth, elevation), brightness, tint
    const so = o.stars || {}, r = rng(so.seed ?? 2024), az0 = so.az0 ?? -1.2, azW = so.azW ?? 1.9; D.stars = [];
    for (let i = 0, n = so.n ?? 9000; i < n; i++) { const az = az0 + r() * azW, el = Math.asin(r() * .9) - .02, m = Math.pow(r(), 3.2), tint = r();
      D.stars.push([az, el, m, tint, r() * 6.28]); }
    // the milky way: a band of soft light and dense faint stars
    const ma = so.mw0 ?? -1.25, mw = so.mwW ?? 1.5;
    D.mw = []; for (let i = 0, n = so.mwN ?? 2600; i < n; i++) { const s = r(), az = ma + s * mw, el = .04 + s * .9 + (r() - .5) * .16 * (1 - Math.abs(s - .5)) + .04 * Math.sin(s * 9);
      D.mw.push([az, el, r(), r()]); }
    D.mwGlow = []; for (let i = 0; i < 260; i++) { const s = r(); D.mwGlow.push([ma + s * mw, .04 + s * .9 + (r() - .5) * .09, .35 + r() * .5, r()]); }
    D.grain = P.speckle(256, 256, 60, 5);

    // ---------------------------------------------------------------------------------------------- the land (raycast per column)
    // fills the depth bins; lights: [{ x, z, k }] warm ground lights (a fire, a lamp) of strength k
    D.land = function (C, lo = {}) {
      for (const b of D.bins) b.u.fill(0);
      const F = C.F, hz = C.hz, lights = lo.lights || [], cx0 = C.x, cz0 = C.z, hgt = D.hgt, peaks = o.peaks || [], HM0 = o.maxH ?? 26, far = o.far ?? 2600;
      const pack = (r, gg, b) => (255 << 24) | (Math.min(255, b * 255) << 16) | (Math.min(255, gg * 255) << 8) | Math.min(255, r * 255);
      for (let X = 0; X < W; X++) {
        const dxr = (X + .5 - W / 2) / F, rx = C.sy + dxr * C.cy, rz = C.cy - dxr * C.sy;
        // the tallest land this ray can meet decides when it may stop (early out): peaks = [{ x, z, r, h }] (hills taller than maxH)
        let HM = HM0;
        for (const pk of peaks) { const tC = ((pk.x - cx0) * rx + (pk.z - cz0) * rz) / (rx * rx + rz * rz), qx = cx0 + tC * rx - pk.x, qz = cz0 + tC * rz - pk.z; if (qx * qx + qz * qz < pk.r * pk.r && pk.h > HM) HM = pk.h; }
        const shadeAt = (d, px, pz, h, prof, dim) => {
              // normal from the smoothed surface
              const e = Math.max(.06, d * .004), hx = hgt(px + e, pz) - hgt(px - e, pz), hzz = hgt(px, pz + e) - hgt(px, pz - e);
              let nx = -hx, ny = 2 * e, nz = -hzz;
              // wind ripples near the camera (in the normal only, fading with distance)
              const rf = clamp(1 - d / 130) * clamp(F / d / 9 - .4); if (rf > 0) { const rp = Math.sin(pz * 14 + px * 3 + 3 * Math.sin(px * .5 + pz * .2)) * .13 * rf * e * 2; nz += rp; nx += rp * .25; }
              const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
              const ndl = nx * L[0] + ny * L[1] + nz * L[2], wrap = Math.max(0, (ndl + .2) / 1.2);
              // a sheen where the surface turns away from the eye (starlit crests)
              const vx = cx0 - px, vy = C.y - h, vz = cz0 - pz, vl = Math.hypot(vx, vy, vz), ndv = (nx * vx + ny * vy + nz * vz) / vl, rim = Math.pow(1 - Math.max(0, ndv), 5) * .4 * clamp(ny * 1.4) * clamp(1.2 - d / 160);
              const sky = .55 + .45 * ny, stone = (1 - (plain ? plain(px, pz) : 0) * .35) * (.86 + .24 * noise(px * .012 + 3, pz * .012)) * (.9 + .2 * noise(px * .07 + 9, pz * .55)) * (1 - .5 * dim);
              let r = ALB[0] * stone * (AMB[0] * sky + KEY[0] * wrap) + rim * .5, gg = ALB[1] * stone * (AMB[1] * sky + KEY[1] * wrap) + rim * .58, b = ALB[2] * stone * (AMB[2] * sky + KEY[2] * wrap) + rim * .82;
              // warm lights (fires, lamps) light the ground in front of them
              for (const g of lights) { const gk = g.k; if (gk > 0) { const ddx = px - g.x, ddz = pz - g.z, wl = gk * (1.1 / (1 + (ddx * ddx + ddz * ddz) / 300) + .05 / (1 + (ddx * ddx + ddz * ddz) / 4000)) * (.4 + .6 * clamp(-nz + ny)); r += WARM[0] * wl; gg += WARM[1] * wl; b += WARM[2] * wl; } }
              const nd = .36 + .64 * ss(3 + 110 * C.k, 24 + 190 * C.k, d); r *= nd; gg *= nd; b *= nd;   // the near sand in shadow
              const fk = 1 - Math.exp(-d * (1 / far + (1 - prof) * (1 - prof) / 150 + Math.exp(-Math.max(0, h + 2) / 5) / 400));   // haze lies in the troughs
              r = lerp(r, HAZE[0], fk); gg = lerp(gg, HAZE[1], fk); b = lerp(b, HAZE[2], fk);
              return [pack(r, gg, b), D.bins[binOf(px, pz)]];
        };
        const Yof = dd => { const h = hgt(cx0 + dd * rx, cz0 + dd * rz); return hz - F * (h - C.y) / dd; };
        let yb = H, d = .5, dA = 0, YA = 1e9, dB = 0, YB = 1e9;
        while (d < 3400) {
          const px = cx0 + d * rx, pz = cz0 + d * rz, h = hgt(px, pz), prof = D.prof, dim = D.dim, Yf = hz - F * (h - C.y) / d;
          // a crest passed between the last samples: find its true top (no stair-stepped ridges)
          if (YB < YA && YB <= Yf && dA > 0) { let lo = dA, hi = d; for (let it = 0; it < 7; it++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (Yof(m1) < Yof(m2)) hi = m2; else lo = m1; }
            const dm = (lo + hi) / 2, Ym = Yof(dm), Yc = Ym <= 0 ? 0 : Math.ceil(Ym);
            if (Yc < yb) { const qx = cx0 + dm * rx, qz = cz0 + dm * rz, qh = hgt(qx, qz), [col, bin] = shadeAt(dm, qx, qz, qh, D.prof, D.dim), u = bin.u; for (let y = Yc, o = Yc * W + X; y < yb; y++, o += W) u[o] = col; yb = Yc; if (yb <= 0) break; } }
          if (Yf < yb) {
            const Y = Yf <= 0 ? 0 : Math.ceil(Yf);
            if (Y < yb) { const [col, bin] = shadeAt(d, px, pz, h, prof, dim), u = bin.u; for (let y = Y, o = Y * W + X; y < yb; y++, o += W) u[o] = col; yb = Y; if (yb <= 0) break; }
          }
          dA = dB; YA = YB; dB = d; YB = Yf;
          if (hz - F * (HM - C.y) / d >= yb) break;
          d += d * .0048 + .025;
        }
      }
      for (const b of D.bins) b.x.putImageData(b.im, 0, 0);
    };
    D.layer = (ctx, i) => ctx.drawImage(D.bins[i].c, 0, 0);
    // is pixel (ix, iy) covered by land in bin `from` or nearer? (e.g. hide a fire behind a dune)
    D.covered = (ix, iy, from = 0) => { for (let i = from; i < nb; i++) if (D.bins[i].u[iy * W + ix]) return true; return false; };

    // ---------------------------------------------------------------------------------------------- sky
    D.sky = function (ctx, C, ts) {
      const elY = e => C.hz - C.F * Math.tan(e), g = ctx.createLinearGradient(0, elY(.9), 0, C.hz + 40);
      SKY.forEach(([k, c]) => g.addColorStop(k, `rgb(${c})`)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      // the milky way: soft light first, then its grains
      for (const [az, el, s, q] of D.mwGlow) { const p = D.Pdir(C, az, el); if (!p) continue; const R = s * C.F * .07; const gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], R);
        gr.addColorStop(0, `rgba(150,165,215,${.025 + .025 * q})`); gr.addColorStop(1, 'rgba(150,165,215,0)'); ctx.fillStyle = gr; ctx.fillRect(p[0] - R, p[1] - R, 2 * R, 2 * R); }
      ctx.fillStyle = '#dfe6ff'; for (const [az, el, a] of D.mw) { const p = D.Pdir(C, az, el); if (!p || p[1] > C.hz) continue; ctx.globalAlpha = .18 + .4 * a; ctx.fillRect(p[0], p[1], 1.1, 1.1); }
      // stars
      for (const [az, el, m, tint, ph] of D.stars) { const p = D.Pdir(C, az, el); if (!p || p[0] < -4 || p[0] > W + 4 || p[1] < -4 || p[1] > C.hz + 30) continue;
        const tw = .82 + .18 * Math.sin(ts * (2 + 3 * tint) + ph), a = (.22 + .78 * m) * tw * (.55 + .45 * ss(0, .12, el)), s = m > .75 ? 2.6 : m > .4 ? 1.8 : 1.15;
        ctx.globalAlpha = a; ctx.fillStyle = tint < .2 ? '#ffe6c8' : tint < .45 ? '#cfdcff' : '#f4f6ff'; ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s);
        if (m > .93) { const gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 9); gr.addColorStop(0, 'rgba(210,222,255,.35)'); gr.addColorStop(1, 'rgba(210,222,255,0)'); ctx.fillStyle = gr; ctx.fillRect(p[0] - 9, p[1] - 9, 18, 18); } }
      ctx.globalAlpha = 1;
      // a glow over the horizon (air light)
      { const gr = ctx.createLinearGradient(0, C.hz - (V ? 380 : 260), 0, C.hz + 30); gr.addColorStop(0, 'rgba(80,104,150,0)'); gr.addColorStop(1, 'rgba(80,104,150,.28)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
      // the great star (D.star = [az, el], or null for none); D.starXY = where it is on screen (rims can face it)
      const p = D.star ? D.Pdir(C, ...D.star) : null; D.starXY = p;
      if (p) D.greatStar(ctx, p[0], p[1], ts);
    };
    D.greatStar = function (ctx, x, y, ts, s = V ? 1 : .9) {
      const pulse = 1 + .04 * Math.sin(ts * 1.7) + .025 * Math.sin(ts * 4.3 + 1);
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
    };

    // ---------------------------------------------------------------------------------------------- objects in the same night
    // the colour of a flat face (stone, cloth, a tent): n = its normal (x, z), d = distance, h = height (for the haze), warm = fire light on it
    D.faceCol = function (n, d, h, warm = 0, A = [.42, .45, .55]) {
      const ndl = n[0] * L[0] + n[1] * L[2], w = Math.max(0, (ndl + .25) / 1.25);
      let c = [0, 1, 2].map(i => A[i] * (AMB[i] * 1.1 + KEY[i] * .62 * w) + WARM[i] * warm);
      const fk = fogK(d, h) * .9; c = c.map((v, i) => lerp(v, HAZE[i], fk));
      return `rgb(${c.map(v => Math.min(255, v * 255) | 0)})`;
    };
    // a figure as a silhouette with a starlit rim toward (sx, sy): path in its own units, drawn at scale s (ctx already placed)
    D.rimFill = function (ctx, path, s, tow, base, rimPx, rimA = .9, rimCol = 'rgba(190,206,246,1)') {
      ctx.save(); ctx.clip(path); ctx.fillStyle = rimCol; ctx.globalAlpha = rimA; ctx.fill(path); ctx.globalAlpha = 1;
      ctx.translate(-tow[0] * rimPx / s, -tow[1] * rimPx / s); ctx.fillStyle = base; ctx.fill(path); ctx.restore();
    };
    // sand blown off crest 1 (around x = farX) and off the dune before it (around x = nearX)
    D.drift = function (ctx, C, ts, farX, nearX) {
      const r = rng(404); ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 700; i++) {
        const fg = i >= 420, per = 1.2 + r() * 1.6, age = ((ts / per + r()) % 1 + 1) % 1, span = fg ? 34 : 70, x0 = r() * span, lift = r();
        const c = fg ? nearX : farX, xw = c - span / 2 + ((x0 + ts * 4.2 - (c - span / 2)) % span + span) % span;
        const zc = fg ? D.crestZ(xw) - LAM : D.crestZ(xw), hh = D.hgt(xw, zc), y = hh + .03 + lift * (fg ? .5 : 1.2) * age + .2 * age * age, p = D.P(C, xw + age * 1.8, y, zc + .3);
        if (!p || p[0] < -10 || p[0] > W + 10 || p[1] < 0 || p[1] > H) continue;
        const s = C.F / p[2], a = Math.sin(Math.PI * age) * (fg ? .16 : .45) * clamp(s / 14), len = clamp(.12 * s, 1.2, 7);
        ctx.fillStyle = `rgba(180,196,236,${a})`; ctx.fillRect(p[0], p[1], len, 1);
      }
      ctx.restore();
    };

    // ---------------------------------------------------------------------------------------------- finish
    // vignette, a darker band from H × band down for the words (null: none), film grain (24 fps)
    D.finish = function (ctx, ts, fo = {}) {
      const band = fo.band === undefined ? .7 : fo.band;
      { const g = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .35, W / 2, H * .5, Math.max(W, H) * .78); g.addColorStop(0, 'rgba(0,0,8,0)'); g.addColorStop(1, 'rgba(0,0,8,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      if (band !== null) { const y0 = H * band, g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, 'rgba(2,4,12,0)'); g.addColorStop(1, 'rgba(2,4,12,.6)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }
      { const fr = Math.floor(ts * 24), rr = rng(fr * 7 + 3); ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .1; const ox = -rr() * 256, oy = -rr() * 256;
        for (let y = oy; y < H; y += 256) for (let x = ox; x < W; x += 256) ctx.drawImage(D.grain, x, y); ctx.restore(); }
    };
    return D;
  }
  // the dolly-zoom focal ramp: F0 → F1 as the camera pulls back over k 0 … 1 (eases in, mostly linear)
  const dolly = (F0, F1, k) => lerp(F0, F1, k * k * (3 - 2 * k) * .25 + k * .75);
  window.DUNES = { world, dolly, L, ALB, KEY, AMB, HAZE, WARM, fogK };
})();
