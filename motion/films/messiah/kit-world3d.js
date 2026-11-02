/* World3D — a painted 3D world in Canvas 2D, after the first film's 「포로 귀환」 (motion/pilot/return.html): one camera that
   moves through real space (position and look-at keys, monotone cubic, height and focal length in log space), a light that
   changes over time (sun, ambient, sky, haze), every face shaded and fogged by distance, drawn far to near. What makes it
   read as film, not as CG: low sun and long light, haze that eats the distance, small people in a large land, a lens bloom
   from the light's own position, grain and a vignette over everything.
   API: W3.cam(keys, ori) → camAt(t)   keys [[t, x, y, z, tx, ty, tz, Fh, Fv], …]
        W3.light(keys) → lightAt(t)     keys [[t, elev, az, sunI, sunC, amb, skyT, skyH, glow, fog, fogD, night], …]
        W3.P(c, X, Y, Z) → [sx, sy, scale, depth] | null     W3.poly(ctx, c, pts) → bool (path set)
        W3.shade(alb, n, dist, L) → [r,g,b]     W3.sky(ctx, c, L, t)     W3.bloom(ctx, x, y, L, k)     W3.finish(ctx, t)  */
(function () {
  const P = Pilot, { clamp, lerp, ss } = P, D2R = Math.PI / 180, NEAR = .5;
  const W = () => P.W, H = () => P.H;
  function mono(ts, vs) { const n = ts.length, d = [], m = new Array(n); for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
    m[0] = 0; m[n - 1] = 0; for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } } return m; }
  function curve(ts, vs) { const ms = mono(ts, vs); return t => { let i = 0; while (i < ts.length - 2 && t > ts[i + 1]) i++; const h = ts[i + 1] - ts[i], u = clamp((t - ts[i]) / h), u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * ms[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * ms[i + 1]; }; }
  // camera from keys; y and focal length move in log space so climbs and zooms feel even
  function cam(keys) {
    const ts = keys.map(k => k[0]), V = P.ori === 'v', ch = [1, 2, 3, 4, 5, 6, V ? 8 : 7].map(j => curve(ts, keys.map(k => j === 2 || j >= 7 ? Math.log(k[j]) : k[j])));
    return t => { const x = ch[0](t), y = Math.exp(ch[1](t)), z = ch[2](t), tx = ch[3](t), ty = ch[4](t), tz = ch[5](t), F = Math.exp(ch[6](t));
      const dx = tx - x, dz = tz - z, hd = Math.hypot(dx, dz), yaw = Math.atan2(dx, dz), pitch = Math.atan2(ty - y, hd);
      const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw);
      const f = [sy * cp, sp, cy * cp], r = [cy, 0, -sy], u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];
      return { x, y, z, F, f, r, u, cy: H() / 2 }; };
  }
  const toC = (c, X, Y, Z) => { const dx = X - c.x, dy = Y - c.y, dz = Z - c.z; return [dx * c.r[0] + dz * c.r[2], dx * c.u[0] + dy * c.u[1] + dz * c.u[2], dx * c.f[0] + dy * c.f[1] + dz * c.f[2]]; };
  function Pr(c, X, Y, Z) { const p = toC(c, X, Y, Z); if (p[2] < NEAR) return null; const s = c.F / p[2]; return [W() / 2 + p[0] * s, c.cy - p[1] * s, s, p[2]]; }
  function poly(ctx, c, pts) {
    let Q = pts.map(p => toC(c, p[0], p[1], p[2])), n = 0; for (const q of Q) if (q[2] >= NEAR) n++; if (!n) return false;
    if (n < Q.length) { const o = []; for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length], ia = a[2] >= NEAR, ib = b[2] >= NEAR; if (ia) o.push(a);
      if (ia !== ib) { const k = (NEAR - a[2]) / (b[2] - a[2]); o.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, NEAR]); } } Q = o; }
    ctx.beginPath(); Q.forEach((q, i) => { const x = W() / 2 + c.F * q[0] / q[2], y = c.cy - c.F * q[1] / q[2]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); return true;
  }
  // light keys: t, sun elevation°, azimuth° (0 = +z), sun intensity, sun colour, ambient, sky top, sky horizon, glow, fog colour,
  // fog distance, night (0..1: stars, lamps)
  function light(keys) { return t => { let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++; const a = keys[i], b = keys[i + 1], k = ss(a[0], b[0], t);
    const L = { elev: lerp(a[1], b[1], k), az: lerp(a[2], b[2], k), sunI: lerp(a[3], b[3], k), fogD: lerp(a[10], b[10], k), night: lerp(a[11], b[11], k) };
    ['sunC', 'amb', 'skyT', 'skyH', 'glow', 'fog'].forEach((nm, j) => { L[nm] = P.mix(a[4 + j], b[4 + j], k); });
    const e = L.elev * D2R, z = L.az * D2R; L.sd = [Math.sin(z) * Math.cos(e), Math.sin(e), Math.cos(z) * Math.cos(e)]; return L; }; }
  const tone = v => 272 * (1 - Math.exp(-v / 205));
  function shade(alb, n, dist, L, k = 1) { const dif = Math.max(0, n[0] * L.sd[0] + n[1] * L.sd[1] + n[2] * L.sd[2]) * L.sunI, f = (1 - Math.exp(-dist / L.fogD)) * .94;
    return [0, 1, 2].map(i => { const v = tone(alb[i] * (L.amb[i] * .9 + L.sunC[i] * dif * 1.1) * k); return v + (L.fog[i] - v) * f; }); }
  const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  // the sky: a stepped painted gradient (top → horizon), a soft glow around the sun, stars at night; returns the sun's screen point
  function sky(ctx, c, L, t, o = {}) {
    const hz = Pr(c, c.x + c.f[0] * 1e5, c.y, c.z + c.f[2] * 1e5), hy = hz ? hz[1] : H() * .5;
    const g = ctx.createLinearGradient(0, hy - H() * .9, 0, hy + 10); g.addColorStop(0, css(L.skyT)); g.addColorStop(.62, css(P.mix(L.skyT, L.skyH, .55))); g.addColorStop(1, css(L.skyH));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H());
    if (L.night > 0 && o.stars) { const r = P.rng(5); ctx.fillStyle = '#fff'; for (let i = 0; i < 260; i++) { const x = r() * W(), y = r() * hy * .95, s = r() < .1 ? 2 : 1.2; ctx.globalAlpha = L.night * (.3 + .7 * r()) * (.75 + .25 * Math.sin(t * (1 + r() * 2) + i)); ctx.fillRect(x, y, s, s); } ctx.globalAlpha = 1; }
    const s = Pr(c, c.x + L.sd[0] * 1e5, c.y + L.sd[1] * 1e5, c.z + L.sd[2] * 1e5);
    if (s) { const R = Math.max(W(), H()) * .7, gr = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], R); gr.addColorStop(0, css(L.glow, .75 * L.sunI)); gr.addColorStop(.25, css(L.glow, .3 * L.sunI)); gr.addColorStop(1, css(L.glow, 0));
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W(), H()); }
    return { sun: s, hy };
  }
  // what a lens does with a bright source: an exposure bloom with falloff, a soft anamorphic streak, two faint ghosts
  function bloom(ctx, x, y, col, k, o = {}) {
    if (k <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen';
    const R = (o.r || 140) * (.8 + .4 * k); let g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, css([255, 250, 236], .95 * k)); g.addColorStop(.18, css(col, .7 * k)); g.addColorStop(1, css(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    const sw = W() * (o.streak || .55); g = ctx.createLinearGradient(x - sw, 0, x + sw, 0); g.addColorStop(0, css(col, 0)); g.addColorStop(.5, css(P.mix(col, [255, 250, 236], .5), .32 * k)); g.addColorStop(1, css(col, 0));
    ctx.fillStyle = g; ctx.fillRect(x - sw, y - 2.5, 2 * sw, 5);
    const cx = W() / 2, cy = H() / 2; for (const [m, r, a] of [[-.45, 26, .12], [-.9, 60, .07]]) { const gx = cx + (x - cx) * m, gy = cy + (y - cy) * m, gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, r); gg.addColorStop(0, css(col, a * k)); gg.addColorStop(1, css(col, 0)); ctx.fillStyle = gg; ctx.fillRect(gx - r, gy - r, 2 * r, 2 * r); }
    ctx.restore();
  }
  // film finish: grain locked to nothing (it is the film), a vignette, a slight warm lift of the blacks
  let GRAIN = null;
  function finish(ctx, t, o = {}) {
    if (!GRAIN) { GRAIN = []; for (let k = 0; k < 4; k++) { const c = P.canvas(512, 512), g = c.getContext('2d'), d = g.createImageData(512, 512), r = P.rng(31 + k); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - .5) * 90; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); GRAIN.push(c); } }
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain ?? .09; const gc = GRAIN[Math.floor(t * 12) % 4], pat = ctx.createPattern(gc, 'repeat'); ctx.fillStyle = pat; ctx.fillRect(0, 0, W(), H()); ctx.restore();
    const vg = ctx.createRadialGradient(W() / 2, H() * .48, Math.min(W(), H()) * .35, W() / 2, H() / 2, Math.max(W(), H()) * .78); vg.addColorStop(0, 'rgba(10,6,4,0)'); vg.addColorStop(1, `rgba(10,6,4,${o.vignette ?? .62})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W(), H());
  }
  // solid things as faces: { pts: [[x,y,z]…] (counter-clockwise seen from outside), alb, n? , k? (brightness), glow? }
  // back faces culled, sorted far → near, shaded and fogged. Helpers build boxes and prisms (columns).
  function normal(p) { const a = p[0], b = p[1], c = p[2], u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], l = Math.hypot(...n) || 1; return [n[0] / l, n[1] / l, n[2] / l]; }
  function faces(ctx, c, L, list, o = {}) {
    const vis = [];
    for (const f of list) { const n = f.n || (f.n = normal(f.pts)); let cx = 0, cy = 0, cz = 0; for (const p of f.pts) { cx += p[0]; cy += p[1]; cz += p[2]; } const m = f.pts.length; cx /= m; cy /= m; cz /= m;
      if (!f.two && (n[0] * (c.x - cx) + n[1] * (c.y - cy) + n[2] * (c.z - cz)) <= 0) continue; const q = toC(c, cx, cy, cz); if (q[2] < NEAR && f.pts.every(p => toC(c, ...p)[2] < NEAR)) continue; vis.push([q[2], f, Math.hypot(cx - c.x, cy - c.y, cz - c.z)]); }
    vis.sort((a, b) => b[0] - a[0]);
    for (const [, f, d] of vis) if (poly(ctx, c, f.pts)) { const col = shade(f.alb, f.n, d, L, f.k || 1); ctx.fillStyle = css(col); ctx.fill(); if (o.seam !== false) { ctx.strokeStyle = css(col); ctx.lineWidth = .7; ctx.stroke(); } }
  }
  function box(x0, y0, z0, x1, y1, z1, alb, k = 1) { const P8 = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], F = (a, b, c2, d) => ({ pts: [P8[a], P8[b], P8[c2], P8[d]], alb, k });
    return [F(0, 3, 2, 1), F(4, 5, 6, 7), F(0, 4, 7, 3), F(1, 2, 6, 5), F(3, 7, 6, 2), F(0, 1, 5, 4)]; }
  function prism(x, z, r, y0, y1, n, alb, k = 1) { const out = []; for (let i = 0; i < n; i++) { const a0 = i / n * 6.283, a1 = (i + 1) / n * 6.283; out.push({ pts: [[x + Math.cos(a0) * r, y0, z + Math.sin(a0) * r], [x + Math.cos(a0) * r, y1, z + Math.sin(a0) * r], [x + Math.cos(a1) * r, y1, z + Math.sin(a1) * r], [x + Math.cos(a1) * r, y0, z + Math.sin(a1) * r]], alb, k }); } return out; }
  window.W3 = { cam, light, P: Pr, poly, shade, sky, bloom, finish, css, toC, curve, tone, faces, box, prism, normal };
})();
