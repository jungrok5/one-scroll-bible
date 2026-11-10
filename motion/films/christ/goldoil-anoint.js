/* 「그리스도」 2부 세 기름 부음 + 5부 세 빛 — 화풍 goldoil (kit-goldoil.js). 사람은 작은 역광 실루엣(얼굴·손 세부 없음), 주인공은 기름과 빛.
     goldAnoint(ctx, u, which)
       'horn'   u 0..6.0  (영상 22.9–28.9, N04)  등잔 빛 속에서 천천히 돌아가는 기름 뿔병, 끝에 금빛 방울이 맺힘 → 끝에서 기울기 시작
       'david'  u 0..6.9  (28.9–35.8, K1 삼상 16:13)  노을의 베들레헴 언덕 — 형들 사이의 어린 목동, 사무엘이 뿔병을 기울여 기름이 머리 위로
       'aaron'  u 0..4.1  (35.8–39.9, K2 레 8:12)  회막 문 앞, 성막 휘장 뒤 등불 — 관(금 패)·흉패의 아론 머리 위로 모세가 관유를 부음(작은 병)
       'elisha' u 0..4.4  (39.9–44.3, K3 왕상 19:16·19)  기름은 붓지 않음 — 겨릿소로 밭 가는 엘리사에게 엘리야가 겉옷을 던짐, 겉옷 가장자리에 금빛
     goldThree(ctx, u)   u 0..3.8  (142.7–146.5, N16)  세 기름 줄기의 금빛이 어둠에서 한 사람 위로 모여 하나의 빛
   세 기름 부음은 같은 구도(붓는 이 왼쪽·받는 이 오른쪽, 빛은 뒤에서). 글자는 그리지 않는다. */
(function () {
  const P = Pilot, { clamp, lerp, ss, eio, eo } = P;
  const css = GOLD.css;

  // ---------------- a standing figure, backlit (side view, facing d = +1 right / -1 left) ----------------
  // f: { x, y (ground), h, d, kind: 'elder'|'youth'|'priest'|'man', stoop, bow, hands: [near, far] screen targets or null,
  //      rim [r,g,b], light [x,y] (where the light comes from), glow (0..1 halo), walk (phase, robe sway) }
  // returns { head: [x, y, r], crown: [x, y], top, sh: [shoulder x, y], hands: [[x,y],[x,y]], elbows }
  const ROBE = [[-.05, -.86], [-.105, -.80], [-.125, -.68], [-.115, -.48], [-.135, -.25], [-.175, -.03], [-.16, 0], [.15, 0], [.165, -.03], [.125, -.25], [.10, -.48], [.105, -.65], [.09, -.78], [.04, -.855]];
  function ik(S, T, L1, L2, down = true) {
    let dx = T[0] - S[0], dy = T[1] - S[1], D = Math.hypot(dx, dy); const Dm = Math.min(Math.max(D, Math.abs(L1 - L2) + 1), L1 + L2 - .5);
    const ux = dx / (D || 1), uy = dy / (D || 1), a = (L1 * L1 - L2 * L2 + Dm * Dm) / (2 * Dm), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const mx = S[0] + ux * a, my = S[1] + uy * a, e1 = [mx - uy * hh, my + ux * hh], e2 = [mx + uy * hh, my - ux * hh];
    const E = (down ? e1[1] >= e2[1] : e1[1] < e2[1]) ? e1 : e2;
    return { E, Hd: [S[0] + ux * Dm, S[1] + uy * Dm], reach: D <= L1 + L2 };
  }
  function limb(pts, ws) {           // a tapered polygon through points with half-widths
    const p = new Path2D(), L = [], R = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
      L.push([pts[i][0] - ty / tl * ws[i], pts[i][1] + tx / tl * ws[i]]); R.push([pts[i][0] + ty / tl * ws[i], pts[i][1] - tx / tl * ws[i]]); }
    p.moveTo(...L[0]); L.slice(1).forEach(q => p.lineTo(...q)); R.reverse().forEach(q => p.lineTo(...q)); p.closePath(); return p;
  }
  function figure(ctx, f) {
    const h = f.h, d = f.d || 1, k = f.kind || 'man', st = f.stoop || 0, bw = f.bow || 0, sl = k === 'youth' ? .85 : 1;
    const T = (lx, ly) => { if (ly < -.5) lx += st * Math.pow((-ly - .5) / .45, 2) * .08; return [f.x + lx * sl * h * d, f.y + ly * h]; };
    const parts = [];
    // robe (a little sway when walking)
    const sw = f.walk == null ? 0 : Math.sin(f.walk) * .015;
    const rp = new Path2D(), pts = ROBE.map(([a, b]) => T(a + (b > -.1 ? sw * (a > 0 ? 1 : -1) : 0), b));
    rp.moveTo((pts[0][0] + pts[pts.length - 1][0]) / 2, (pts[0][1] + pts[pts.length - 1][1]) / 2);
    for (let i = 0; i < pts.length; i++) { const q = pts[(i + 1) % pts.length]; rp.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + q[0]) / 2, (pts[i][1] + q[1]) / 2); }
    rp.closePath(); parts.push(rp);
    // neck + head
    const hr = (k === 'youth' ? .068 : .062) * h, hc = T(.015 + bw * .04, -.915 + bw * .02);
    const nk = new Path2D(); const n1 = T(-.025, -.85), n2 = T(.04, -.85); nk.moveTo(...n1); nk.lineTo(...n2); nk.lineTo(hc[0] + d * hr * .3, hc[1]); nk.lineTo(hc[0] - d * hr * .5, hc[1]); nk.closePath(); parts.push(nk);
    const hp = new Path2D(); hp.arc(hc[0], hc[1], hr, 0, 6.2832); parts.push(hp);
    // nose/brow bump so the profile reads which way the head faces
    const nb = new Path2D(); nb.moveTo(hc[0] + d * hr * .8, hc[1] - hr * .25); nb.lineTo(hc[0] + d * hr * 1.1, hc[1] + hr * .12); nb.lineTo(hc[0] + d * hr * .82, hc[1] + hr * .35); nb.closePath(); parts.push(nb);
    let top = hc[1] - hr;
    if (k === 'elder') {                  // mantle drawn over the head, and a beard
      const hd = new Path2D(); hd.arc(hc[0] - d * hr * .12, hc[1] - hr * .05, hr * 1.18, 0, 6.2832); parts.push(hd);
      const hb = new Path2D(); const b0 = T(-.03, -.97), b1 = T(-.112, -.80), b2 = T(-.02, -.80), bc = T(-.10, -.93); hb.moveTo(...b0); hb.quadraticCurveTo(...bc, ...b1); hb.lineTo(...b2); hb.closePath(); parts.push(hb);
      const bd = new Path2D(); bd.moveTo(hc[0] + d * hr * .55, hc[1] + hr * .3); bd.lineTo(hc[0] + d * hr * .75, hc[1] + hr * 1.5); bd.lineTo(hc[0] + d * hr * .1, hc[1] + hr * 1.75); bd.lineTo(hc[0] - d * hr * .2, hc[1] + hr * .6); bd.closePath(); parts.push(bd);
      top = hc[1] - hr * 1.23;
    } else if (k === 'youth') {           // curls
      for (let i = 0; i < 7; i++) { const th = -Math.PI / 2 + d * (.5 - i * .33), c = new Path2D(); c.arc(hc[0] + Math.cos(th) * hr * .9, hc[1] + Math.sin(th) * hr * .9, hr * (.28 + .05 * Math.sin(i * 2.1)), 0, 6.2832); parts.push(c); }
      top = hc[1] - hr * 1.15;
    } else if (k === 'priest') {          // the turban (mitre) of fine linen
      const m = new Path2D(); const mw = hr * 1.1, mt = hc[1] - hr * 1.95; m.moveTo(hc[0] - mw * .95, hc[1] - hr * .1); m.bezierCurveTo(hc[0] - mw * 1.25, mt + hr * .5, hc[0] - mw * .7, mt, hc[0], mt); m.bezierCurveTo(hc[0] + mw * .7, mt, hc[0] + mw * 1.25, mt + hr * .5, hc[0] + mw * .95, hc[1] - hr * .1); m.closePath(); parts.push(m);
      top = mt;
    }
    // arms: shoulder → elbow → hand, fixed bone lengths, elbows bend down (ik)
    const S = T(.01, -.785), L1 = .19 * h, L2 = .17 * h, hands = [], elbows = [];
    for (let a = 0; a < 2; a++) {
      const tgt = f.hands && f.hands[a] ? f.hands[a] : T(a ? -.03 : .045, -.47);
      const r = ik([S[0] + (a ? -1 : 1) * d * .01 * h, S[1]], tgt, L1, L2, true);
      const sh = [S[0] + (a ? -1 : 1) * d * .01 * h, S[1]];
      parts.push(limb([sh, r.E, r.Hd], [.05 * h, .04 * h, .05 * h]));
      const hn = new Path2D(); hn.arc(r.Hd[0], r.Hd[1], .024 * h, 0, 6.2832); parts.push(hn);
      hands.push(r.Hd); elbows.push(r.E); if (!r.reach && f.hands && f.hands[a]) console.warn('reach', k);
    }
    // draw: light wrapping the edge (offset towards the light, with a halo), then the silhouette
    const lx = f.light ? f.light[0] - f.x : 0, ly = f.light ? f.light[1] - (f.y - h * .5) : -1, ll = Math.hypot(lx, ly) || 1, o = Math.max(1.5, h * .006);
    ctx.save(); ctx.translate(lx / ll * o, ly / ll * o); ctx.fillStyle = css(f.rim || [255, 180, 96], .95);
    if (f.glow) { ctx.shadowColor = css(f.rim || [255, 180, 96], .7 * f.glow); ctx.shadowBlur = h * .06; }
    parts.forEach(p => ctx.fill(p)); ctx.restore();
    ctx.save(); ctx.fillStyle = f.fill || '#0d0704'; parts.forEach(p => ctx.fill(p)); ctx.restore();
    return { head: [hc[0], hc[1], hr], crown: [hc[0] - d * hr * .1, top], top, sh: S, hands, elbows };
  }
  // oil running from the crown down the back of the head (and onto the neck)
  function headOil(ctx, F, d, k, t, w) {
    const [hx, hy, hr] = F.head, pts = [];
    for (let a = -90; a <= 60; a += 6) { const r = (a - -90) / 150, th = (-90 - d * (a + 90) * 1.05) * Math.PI / 180; pts.push([hx + Math.cos(th) * hr * 1.03, hy + Math.sin(th) * hr * 1.03 + r * r * hr * .6]); }
    GOLD.stream(ctx, pts, k, { w, t, back: true, glints: 2, speed: hr * 2, taper: .4 });
  }

  // ---------------- skies, hills, ground ----------------
  function dusk(ctx, W, H, hz, sun, o = {}) {
    let g = ctx.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, o.top || '#2a1610'); g.addColorStop(.5, o.mid || '#7a3c1c'); g.addColorStop(1, o.low || '#e09048');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz + 2);
    g = ctx.createRadialGradient(sun[0], sun[1], 0, sun[0], sun[1], Math.max(W, H) * .6); g.addColorStop(0, 'rgba(255,232,170,1)'); g.addColorStop(.05, 'rgba(255,196,110,.9)'); g.addColorStop(.25, 'rgba(220,120,50,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  function ridge(ctx, W, H, y, amp, f, seed, col, z = 1) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-10, H + 10);
    for (let x = -10; x <= W + 20; x += 16) ctx.lineTo(x, y - amp * (P.fbm(x * f / z + seed, seed * .7, 4) - .3));
    ctx.lineTo(W + 20, H + 10); ctx.fill();
  }
  // warm light lying on the near ground (the subtitle band stays calm, but is not black)
  function groundLight(ctx, W, H, gy, k = 1) { const g = ctx.createLinearGradient(0, gy, 0, H); g.addColorStop(0, `rgba(170,100,44,${.42 * k})`); g.addColorStop(.35, `rgba(110,64,28,${.30 * k})`); g.addColorStop(1, `rgba(60,34,16,${.22 * k})`);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(-W, gy, W * 3, H * 2); ctx.restore(); }
  function camera(ctx, W, H, z, fx, fy) { ctx.setTransform(z, 0, 0, z, fx * (1 - z), fy * (1 - z)); }

  // ---------------- 'horn' : a horn flask turning in lamplight ----------------
  function hornScene(ctx, u) {
    const W = P.W, H = P.H, V = P.ori === 'v';
    const ex = ss(0, .4, u), z = 1 + .06 * u / 6;
    ctx.fillStyle = '#0d0805'; ctx.fillRect(0, 0, W, H);
    // the lamp (a clay oil lamp) low left, its flame the only light
    const LX = W * (V ? .26 : .30), LY = H * (V ? .58 : .70), fl = 1 + .06 * Math.sin(u * 11) + .04 * Math.sin(u * 23 + 1) + .05 * (P.noise(u * 3, 1) - .5);
    let g = ctx.createRadialGradient(LX, LY - H * .02, 0, LX, LY, Math.max(W, H) * .75);
    g.addColorStop(0, `rgba(255,200,124,${ex})`); g.addColorStop(.12, `rgba(226,142,64,${.9 * ex * fl})`); g.addColorStop(.45, `rgba(140,82,36,${.8 * ex})`); g.addColorStop(1, `rgba(56,34,16,${.75 * ex})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    GOLD.bokeh(ctx, { n: 8, seed: 31, x: W * .3, y: 0, w: W * .8, h: H * .5, r: W * .06, a: .07 * ex, t: u });
    // the table: dark wood, catching the lamp
    const ty = LY + H * .015;
    g = ctx.createLinearGradient(0, ty - H * .01, 0, H); g.addColorStop(0, `rgba(70,40,18,${ex})`); g.addColorStop(.12, `rgba(40,24,11,${ex})`); g.addColorStop(1, `rgba(14,8,4,${ex})`);
    ctx.fillStyle = g; ctx.fillRect(0, ty, W, H - ty);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(LX, ty + H * .01); ctx.scale(1, .18); g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * .5); g.addColorStop(0, `rgba(200,120,50,${.5 * ex})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-W, -W, 2 * W, 2 * W); ctx.restore();
    groundLight(ctx, W, H, ty, ex * .8);
    // lamp body + flame
    const ls = V ? W * .11 : H * .11;
    ctx.fillStyle = '#1a0f08'; ctx.beginPath(); ctx.ellipse(LX, ty - ls * .18, ls * .55, ls * .2, 0, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.moveTo(LX + ls * .4, ty - ls * .28); ctx.quadraticCurveTo(LX + ls * .75, ty - ls * .34, LX + ls * .8, ty - ls * .3); ctx.lineTo(LX + ls * .45, ty - ls * .14); ctx.fill();
    ctx.strokeStyle = 'rgba(255,170,80,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(LX, ty - ls * .2, ls * .55, ls * .2, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    const fx = LX + ls * .78, fy = ty - ls * .33, fh = ls * .5 * fl;
    g = ctx.createRadialGradient(fx, fy - fh * .35, 0, fx, fy - fh * .35, fh * .6); g.addColorStop(0, 'rgba(255,250,225,1)'); g.addColorStop(.35, 'rgba(255,200,100,.95)'); g.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(fx, fy - fh); ctx.quadraticCurveTo(fx + fh * .28, fy - fh * .3, fx, fy); ctx.quadraticCurveTo(fx - fh * .28, fy - fh * .3, fx, fy - fh); ctx.fill();
    GOLD.bloom(ctx, fx, fy - fh * .4, [255, 170, 80], .55 * ex, { r: ls * 1.6, streak: .25 });

    // the horn in 3D: a sphere-swept tube turning about the vertical axis, lit by the flame
    const hcx = W * (V ? .55 : .58), hcy = H * (V ? .37 : .40), L = V ? W * .66 : H * .66;
    const yaw = -1.1 + u * .36, tilt = -.18 + .32 * eio(clamp((u - 4.3) / 1.7));            // turns; at the end its tip starts to dip (next cut pours)
    const N = 150, pts = [];
    let px = 0, py = 0, a = 0;
    const raw = [];
    for (let i = 0; i <= N; i++) { const s = i / N; raw.push([px, py, .30 * Math.sin(s * Math.PI * .9) * L, L * (.010 + .13 * Math.pow(s, 1.1)), s]); a += 1.9 / N * (1 - .35 * s); px -= Math.cos(a) * L / N; py -= Math.sin(a) * L / N; }
    // centre it
    let mx = 0, my = 0; raw.forEach(q => { mx += q[0]; my += q[1]; }); mx /= raw.length; my /= raw.length;
    const cy = Math.cos(yaw), sy2 = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt), f = L * 3;
    for (const [x0, y0, z0, r, s] of raw) {
      let x = x0 - mx, y = y0 - my, zz = z0;
      const x1 = x * ct - y * st, y1 = x * st + y * ct;               // tilt (in the picture plane)
      const x2 = x1 * cy + zz * sy2, z2 = -x1 * sy2 + zz * cy;         // yaw
      const k = f / (f + z2); pts.push([hcx + x2 * k * z, hcy + y1 * k * z, z2, r * k * z, s]);
    }
    const tipP = pts[0];
    // the tube as quads between cross-sections, each shaded across its width (lamp side bright, a highlight band, the far side dark),
    // drawn far to near so the curl overlaps itself correctly
    const Ld = [LX - hcx, LY - hcy]; const ldl = Math.hypot(...Ld); Ld[0] /= ldl; Ld[1] /= ldl;
    const E = pts.map((q, i) => { const A = pts[Math.max(0, i - 1)], B = pts[Math.min(N, i + 1)], tx = B[0] - A[0], ty = B[1] - A[1], tl = Math.hypot(tx, ty) || 1; let nx = -ty / tl, ny = tx / tl;
      if (nx * Ld[0] + ny * Ld[1] < 0) { nx = -nx; ny = -ny; } return [q[0] + nx * q[3], q[1] + ny * q[3], q[0] - nx * q[3], q[1] - ny * q[3]]; });   // [lit edge, dark edge]
    const segs = []; for (let i = 0; i < N; i++) segs.push(i); segs.sort((i, j) => (pts[j][2] + pts[j + 1][2]) - (pts[i][2] + pts[i + 1][2]));
    ctx.save(); ctx.globalAlpha = ex;
    for (const i of segs) {
      const A = E[i], B = E[i + 1], s0 = pts[i][4], r = pts[i][3]; if (r < .5) continue;
      const rid = 1 - .16 * Math.pow(Math.abs(Math.sin(s0 * 64)), 8), near = clamp(.85 - pts[i][2] / L * .6), lit = (.8 + .2 * near) * rid, thin = 1 - ss(0, .45, s0);
      const g = ctx.createLinearGradient(A[0], A[1], A[2], A[3]);
      g.addColorStop(0, css([150 * lit, 98 * lit, 52 * lit])); g.addColorStop(.16, css([lerp(226, 255, thin) * lit, lerp(168, 196, thin) * lit, lerp(104, 120, thin) * lit]));
      g.addColorStop(.42, css([lerp(140, 200, thin) * lit, lerp(90, 130, thin) * lit, lerp(46, 64, thin) * lit])); g.addColorStop(.8, css([52 * lit, 32 * lit, 16 * lit])); g.addColorStop(1, css([24, 14, 7]));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(B[2], B[3]); ctx.lineTo(A[2], A[3]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.2; ctx.stroke();                       // close the hairline seams between quads
    }
    // the wide end: a wooden stopper seen at the angle the horn's mouth faces
    const bp = pts[N], bq = pts[N - 3], ta = Math.atan2(bp[1] - bq[1], bp[0] - bq[0]), tz = clamp(Math.abs(bp[2] - bq[2]) / (Math.hypot(bp[0] - bq[0], bp[1] - bq[1], bp[2] - bq[2]) || 1), .12, 1);
    ctx.save(); ctx.translate(bp[0], bp[1]); ctx.rotate(ta); ctx.beginPath(); ctx.ellipse(0, 0, bp[3] * tz, bp[3] * .98, 0, 0, 6.2832); ctx.fillStyle = '#3a2412'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, bp[3] * tz * .8, bp[3] * .78, 0, 0, 6.2832); ctx.fillStyle = '#22150a'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,196,120,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, bp[3] * tz, bp[3] * .98, 0, Math.PI * .6, Math.PI * 1.4); ctx.stroke(); ctx.restore();
    ctx.restore();
    // a golden bead gathering at the tip
    const bead = ss(.8, 4.2, u);
    if (bead > 0) {
      const br = (V ? W : H) * .022 * (.35 + .65 * bead), bg = GOLD.grab(ctx);
      GOLD.drop(ctx, tipP[0], tipP[1] + br * (.6 + .5 * bead), br, u, { bg, s: 1 + .25 * bead, tp: .3, neck: { top: tipP[1] - 2, hw: t => br * (.35 + .4 * t * t) }, caus: .6 });
      GOLD.bloom(ctx, tipP[0], tipP[1] + br, [255, 200, 110], .35 * bead, { r: br * 4, streak: .15, ghosts: false });
    }
    GOLD.motes(ctx, u, { n: 60, seed: 12, light: [LX, LY, W * .8], a: ex });
    GOLD.glow(ctx, .55, { wide: .5 });
    GOLD.finish(ctx, u, { vignette: .55 });
    if (ex < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - ex})`; ctx.fillRect(0, 0, W, H); }
  }

  // ---------------- the anointing: one grammar for David and Aaron ----------------
  // the pourer stands left facing right, the anointed right facing left, head bowed; the vessel above; light behind them.
  function pourScene(ctx, u, o) {
    const W = P.W, H = P.H, V = P.ori === 'v', dur = o.dur;
    const U = V ? .25 * H : .42 * H, gy = H * (V ? .60 : .76), cx = W * .5 + U * .05;
    const ex = ss(0, .35, u), z = 1 + .06 * u / dur;
    // the anointed
    const ah = U * o.aH, ax = cx + U * .16;
    const aTop0 = gy - ah * (o.aKind === 'priest' ? 1.04 : .99);
    const tip = [ax - ah * .02, aTop0 - U * .19];
    const sun = o.sun(W, H, gy, ax, U);
    const fyFocus = tip[1] + U * .1;
    // world
    ctx.save(); camera(ctx, W, H, z, ax, fyFocus);
    o.back(ctx, W, H, gy, sun, u, U, ex);
    groundLight(ctx, W, H, gy, ex);
    // the pour: vessel tilts in (0–1.2), oil starts (1.0–1.7) and keeps flowing
    const tiltIn = eio(clamp(u / 1.2)), flow = ss(.9, 1.6, u);
    const sx = tip[0] - U * (o.vessel === 'jar' ? .37 : .42);
    const vang = o.vessel === 'jar' ? -2.45 - .4 * (1 - tiltIn) : -2.6 - .3 * (1 - tiltIn);
    const vtip = [tip[0] - U * .05 * (1 - tiltIn), tip[1] - U * .03 * (1 - tiltIn)];
    // vessel first into a scratch path to know where the hands go: draw it after the bodies (it is in front)
    const ghost = GH || (GH = P.canvas(2, 2).getContext('2d'));
    const vs = o.vessel === 'jar' ? GOLD.jar(ghost, vtip[0], vtip[1], U * .16, vang) : GOLD.horn(ghost, vtip[0], vtip[1], U * .34, vang, { curl: .7, wide: .11 });
    const gi = o.vessel === 'jar' ? [Math.round((vs.C.length - 1) * .42), Math.round((vs.C.length - 1) * .9)] : [Math.round((vs.C.length - 1) * .35), Math.round((vs.C.length - 1) * .75)];
    const grip = i => { const [x, y, a, w] = vs.C[i]; return [x + Math.sin(a) * w * .2, y - Math.cos(a) * w * .2]; };
    const pourer = figure(ctx, { x: sx, y: gy, h: U, d: 1, kind: 'elder', stoop: .5, bow: .3, hands: [grip(gi[0]), grip(gi[1])], light: sun, rim: o.rim, glow: .6 });
    const anointed = figure(ctx, { x: ax, y: gy, h: ah, d: -1, kind: o.aKind, bow: .55, light: sun, rim: o.rim, glow: .6 });
    if (o.aKind === 'priest') o.priestGold(ctx, anointed, ah, u);
    // the vessel in their hands, then the oil: a stream to the crown and running down the head
    if (o.vessel === 'jar') GOLD.jar(ctx, vtip[0], vtip[1], U * .16, vang, { rim: o.rim, light: Math.atan2(sun[1] - vtip[1], sun[0] - vtip[0]) });
    else GOLD.horn(ctx, vtip[0], vtip[1], U * .34, vang, { curl: .7, wide: .11, rim: o.rim, light: Math.atan2(sun[1] - vtip[1], sun[0] - vtip[0]) });
    // hands drawn again over the vessel (fingers wrap it)
    ctx.fillStyle = '#0d0704'; pourer.hands.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, U * .024, 0, 6.2832); ctx.fill(); });
    if (flow > 0) {
      const crown = anointed.crown;
      GOLD.stream(ctx, GOLD.path(vtip[0], vtip[1], crown[0], crown[1] + U * .005), flow, { w: U * .011, t: u, back: true, glints: 3, speed: U * .5 });
      headOil(ctx, anointed, -1, ss(1.5, dur, u) * .9, u, U * .007);
      GOLD.bloom(ctx, crown[0], crown[1], [255, 196, 110], .45 * flow, { r: U * .22, streak: .2, ghosts: false });
    }
    ctx.restore();
    GOLD.bloom(ctx, ...toScr(sun, z, ax, fyFocus), [255, 170, 80], .35 * ex, { r: U * .5, streak: 0 });
    GOLD.motes(ctx, u, { n: 70, seed: o.seed || 3, light: [...toScr(sun, z, ax, fyFocus), W * .7], a: ex });
    GOLD.glow(ctx, .5, { wide: .5 });
    GOLD.finish(ctx, u, { vignette: .5 });
    if (ex < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - ex})`; ctx.fillRect(0, 0, W, H); }
    return { pourer, anointed };
  }
  let GH = null;
  const toScr = (p, z, fx, fy) => [fx + (p[0] - fx) * z, fy + (p[1] - fy) * z];

  // David: Bethlehem hills at sunset, his brothers on the slope behind
  const DAVID = {
    dur: 6.9, aKind: 'youth', aH: .63, vessel: 'horn', rim: [255, 184, 100], seed: 4,
    sun: (W, H, gy, ax, U) => [ax + U * .02, gy - U * .30],
    back(ctx, W, H, gy, sun, u, U, ex) {
      dusk(ctx, W, H, gy - U * .2, sun, { top: '#2c1812', mid: '#8a4420', low: '#eea050' });
      ridge(ctx, W, H, gy - U * .24, U * .18, .002, 3, 'rgba(150,74,36,.55)');
      ridge(ctx, W, H, gy - U * .16, U * .16, .0028, 8, 'rgba(96,44,20,.75)');
      // a few roofs of Bethlehem far on the ridge (tiny, no lights)
      ridge(ctx, W, H, gy - U * .06, U * .10, .0035, 13, 'rgba(46,22,11,.92)');
      // the brothers, smaller, standing on the slope behind
      const bros = [[-.95, .40, 1], [-.72, .43, 1], [.62, .42, -1], [.86, .39, -1], [1.08, .41, -1]];
      bros.forEach(([dx, hh, d], i) => figure(ctx, { x: W * .5 + dx * U, y: gy - U * .07, h: U * hh, d, kind: 'man', bow: .1 * Math.sin(u * .7 + i), light: sun, rim: [255, 170, 90], fill: '#1c0e07' }));
      ctx.fillStyle = '#100804'; ctx.beginPath(); ctx.moveTo(-10, H); ctx.lineTo(-10, gy + U * .01);
      for (let x = -10; x <= W + 20; x += 14) ctx.lineTo(x, gy - U * .012 * P.noise(x * .02, 4) + (x > W * .2 && x < W * .8 ? 0 : U * .03 * Math.abs(x / W - .5)));
      ctx.lineTo(W + 20, H); ctx.fill();
      // grass blades on the near ground, backlit
      ctx.strokeStyle = 'rgba(30,15,7,1)'; ctx.lineWidth = 1.5; const R = P.rng(9);
      for (let i = 0; i < 160; i++) { const x = R() * W, h2 = U * (.02 + .04 * R()), lean = (R() - .5) * .5 + .08 * Math.sin(u * 1.3 + x * .01); ctx.beginPath(); ctx.moveTo(x, gy + 2); ctx.quadraticCurveTo(x + lean * h2 * .5, gy - h2 * .6, x + lean * h2, gy - h2); ctx.stroke(); }
    },
  };
  // Aaron: before the door of the tent of meeting; lamplight through the screen behind; Moses pours from a small jug
  const AARON = {
    dur: 4.1, aKind: 'priest', aH: .70, vessel: 'jar', rim: [255, 196, 120], seed: 6,
    sun: (W, H, gy, ax, U) => [ax - U * .05, gy - U * .55],
    back(ctx, W, H, gy, sun, u, U, ex) {
      ctx.fillStyle = '#140b07'; ctx.fillRect(0, 0, W, H);
      // the screen of the door: woven curtain lit from inside (the lampstand), hanging in folds between pillars
      const x0 = W * .5 - U * 1.6, x1 = W * .5 + U * 1.6, y0 = gy - U * 1.55;
      let g = ctx.createRadialGradient(sun[0], sun[1], 0, sun[0], sun[1], U * 1.4); g.addColorStop(0, 'rgba(255,218,150,1)'); g.addColorStop(.3, 'rgba(232,150,70,.97)'); g.addColorStop(.75, 'rgba(150,76,36,.95)'); g.addColorStop(1, 'rgba(90,42,22,.95)');
      ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, gy - y0);
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      for (let x = x0; x < x1; x += 3) { const v = .78 + .22 * Math.sin((x - x0) / U * 38 + Math.sin(u * .8) * .2) * (.6 + .4 * P.noise(x * .01, 2)); ctx.fillStyle = `rgb(${255 * v | 0},${235 * v | 0},${220 * v | 0})`; ctx.fillRect(x, y0, 3, gy - y0); }
      // woven bands of blue, purple and scarlet (darkened by the light behind)
      [[.18, 'rgba(120,90,150,.55)'], [.24, 'rgba(160,60,70,.5)'], [.30, 'rgba(90,100,160,.5)']].forEach(([fy, c]) => { ctx.fillStyle = c; ctx.fillRect(x0, y0 + (gy - y0) * fy, x1 - x0, (gy - y0) * .025); });
      ctx.restore();
      // pillars (acacia, overlaid with gold; bronze bases) and the roof of the tent
      const pil = [x0 + (x1 - x0) * .12, x0 + (x1 - x0) * .36, x0 + (x1 - x0) * .64, x0 + (x1 - x0) * .88];
      pil.forEach((x, i) => { ctx.fillStyle = '#120a05'; ctx.fillRect(x - U * .035, y0 - U * .05, U * .07, gy - y0 + U * .05); ctx.fillStyle = 'rgba(255,190,100,.55)'; ctx.fillRect(x + (x < sun[0] ? U * .03 : -U * .035), y0 - U * .05, U * .006, gy - y0 + U * .05);
        ctx.fillStyle = 'rgba(200,140,70,.6)'; ctx.fillRect(x - U * .045, y0 - U * .08, U * .09, U * .03); });
      { const rg = ctx.createLinearGradient(0, 0, 0, y0); rg.addColorStop(0, '#120a06'); rg.addColorStop(1, '#4a2a16'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, y0 - U * .05);   // the tent's covering of skins, catching the glow
        ctx.fillStyle = 'rgba(255,190,110,.35)'; ctx.fillRect(0, y0 - U * .07, W, U * .012); } ctx.fillRect(0, 0, x0 - U * .1, H); ctx.fillRect(x1 + U * .04, 0, W, H);
      // the sand of the court
      g = ctx.createLinearGradient(0, gy, 0, H); g.addColorStop(0, 'rgba(110,64,30,1)'); g.addColorStop(.2, 'rgba(60,35,17,1)'); g.addColorStop(1, 'rgba(22,13,6,1)'); ctx.fillStyle = g; ctx.fillRect(0, gy, W, H - gy);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(sun[0], gy + U * .02); ctx.scale(1, .12); g = ctx.createRadialGradient(0, 0, 0, 0, 0, U * 1.4); g.addColorStop(0, 'rgba(220,140,60,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-U * 3, -U * 3, U * 6, U * 6); ctx.restore();
    },
    priestGold(ctx, F, h, u) {     // the gold plate on the turban, the breastpiece and the onyx stone on the shoulder catch the light
      const [hx, hy, hr] = F.head, d = -1;
      const glint = (x, y, r, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,236,170,${a})`); g.addColorStop(.4, `rgba(255,196,96,${a * .6})`); g.addColorStop(1, 'rgba(255,180,80,0)'); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); };
      ctx.fillStyle = 'rgba(255,206,120,.95)'; ctx.fillRect(hx + d * hr * 1.08 - hr * .08, hy - hr * 1.45, hr * .12, hr * .3);   // the plate on the front of the turban, above the brow
      glint(hx + d * hr * 1.05, hy - hr * 1.3, hr * .8, .45 + .15 * Math.sin(u * 3));
      const bx = hx + d * h * .10, by = F.head[1] + h * .24;                                                                        // breastpiece: gold settings catch the light at the chest
      glint(bx, by, h * .05, .5 + .2 * Math.sin(u * 2.3 + 1));
      glint(F.sh[0] + d * h * .005, F.sh[1], h * .04, .45);
    },
  };

  // ---------------- 'elisha' : no oil — Elijah casts his mantle over the young man at the plough ----------------
  function ox(ctx, x, y, s, ph, rim, light) {        // a side-view ox facing right; ph = gait phase
    const B = [[-.50, -.50], [-.44, -.60], [-.10, -.60], [.18, -.70], [.30, -.68], [.44, -.58], [.56, -.52], [.66, -.40], [.64, -.33], [.56, -.33], [.48, -.36], [.40, -.27], [.30, -.24], [.0, -.22], [-.30, -.25], [-.46, -.30], [-.53, -.40]];
    const body = new Path2D(), q = B.map(([a, b]) => [x + a * s, y + b * s]);
    body.moveTo((q[0][0] + q[q.length - 1][0]) / 2, (q[0][1] + q[q.length - 1][1]) / 2);
    for (let i = 0; i < q.length; i++) { const n = q[(i + 1) % q.length]; body.quadraticCurveTo(q[i][0], q[i][1], (q[i][0] + n[0]) / 2, (q[i][1] + n[1]) / 2); }
    body.closePath(); const parts = [body];
    const horn = new Path2D(); horn.moveTo(x + s * .52, y - s * .56); horn.quadraticCurveTo(x + s * .56, y - s * .70, x + s * .64, y - s * .69); horn.quadraticCurveTo(x + s * .58, y - s * .64, x + s * .57, y - s * .54); horn.closePath(); parts.push(horn);
    const ear = new Path2D(); ear.moveTo(x + s * .50, y - s * .55); ear.lineTo(x + s * .44, y - s * .60); ear.lineTo(x + s * .47, y - s * .52); ear.closePath(); parts.push(ear);
    const tail = new Path2D(); tail.moveTo(x - s * .50, y - s * .56); tail.quadraticCurveTo(x - s * .58, y - s * .42, x - s * .55, y - s * .16); tail.lineTo(x - s * .51, y - s * .17); tail.quadraticCurveTo(x - s * .53, y - s * .42, x - s * .47, y - s * .53); parts.push(tail);
    [[.26, 0, .07], [.16, .5, .065], [-.33, .5, .085], [-.42, 0, .08]].forEach(([lx, p, w]) => { const a = Math.sin(ph + p * Math.PI * 2) * .2, hx = x + lx * s, hy = y - s * .30, kx = hx + Math.sin(a) * s * .15, ky = y - s * .13, fx = kx + Math.sin(a * .6) * s * .12, fy = y;
      parts.push(limb([[hx, hy - s * .04], [kx, ky], [fx, fy]], [s * w, s * .03, s * .025])); });
    const lx = light[0] - x, ly = light[1] - y, ll = Math.hypot(lx, ly) || 1;
    ctx.save(); ctx.translate(lx / ll * 2, ly / ll * 2); ctx.fillStyle = css(rim, .9); parts.forEach(p => ctx.fill(p)); ctx.restore();
    ctx.fillStyle = '#0d0704'; parts.forEach(p => ctx.fill(p));
  }
  function elishaScene(ctx, u) {
    const W = P.W, H = P.H, V = P.ori === 'v', dur = 4.4;
    const U = V ? .24 * H : .40 * H, gy = H * (V ? .60 : .76);
    const ex = ss(0, .35, u), z = 1 + .06 * u / dur;
    const walk = u * .045 * U;                                                 // oxen plod slowly to the right
    const left = V ? W * .14 : W * .26, oxS = U * .48, ex2 = left + U * 1.33 + walk;
    const sun = [W * .5 + U * .10, gy - U * .22];
    ctx.save(); camera(ctx, W, H, z, W * .5 + U * .1, gy - U * .6);
    dusk(ctx, W, H, gy - U * .1, sun, { top: '#22140f', mid: '#6e3a1e', low: '#d88a44' });
    ridge(ctx, W, H, gy - U * .14, U * .12, .0022, 21, 'rgba(120,60,30,.6)');
    ridge(ctx, W, H, gy - U * .06, U * .07, .003, 27, 'rgba(70,34,16,.85)');
    // the other yokes ahead, small, far along the field
    [[-1.3, .30], [-.8, .27], [1.25, .28]].forEach(([dx, s], i) => { const bx = W * .5 + dx * U + walk * .6; ox(ctx, bx, gy - U * .05, U * s, u * 2.2 + i, [230, 150, 80], sun); ox(ctx, bx + U * s * .12, gy - U * .045, U * s, u * 2.2 + i + 1.3, [230, 150, 80], sun); });
    // the field: furrows towards the light
    ctx.fillStyle = '#120904'; ctx.fillRect(0, gy - U * .03, W, H);
    ctx.strokeStyle = 'rgba(150,84,40,.35)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) { const yy = gy - U * .03 + Math.pow(i / 26, 1.8) * (H - gy); ctx.beginPath(); ctx.moveTo(0, yy); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, yy + 3 * P.noise(x * .01, i)); ctx.stroke(); }
    groundLight(ctx, W, H, gy - U * .03, ex);
    // Elisha's yoke: two oxen, the plough, Elisha behind holding its handle
    ox(ctx, ex2 + oxS * .14, gy - U * .006, oxS, u * 2.4 + .9, [255, 176, 96], sun);
    ox(ctx, ex2, gy, oxS, u * 2.4, [255, 176, 96], sun);
    ctx.strokeStyle = '#0d0704'; ctx.lineWidth = U * .02; ctx.beginPath(); ctx.moveTo(ex2 + oxS * .38, gy - oxS * .62); ctx.lineTo(ex2 + oxS * .55, gy - oxS * .66); ctx.stroke();   // yoke
    const plX = ex2 - oxS * .95, beam0 = [ex2 + oxS * .30, gy - oxS * .60];
    ctx.lineWidth = U * .02; ctx.beginPath(); ctx.moveTo(...beam0); ctx.quadraticCurveTo(ex2 - oxS * .3, gy - oxS * .2, plX, gy - U * .01); ctx.stroke();          // plough beam to the share
    const handle = [plX - U * .08, gy - U * .43]; ctx.beginPath(); ctx.moveTo(plX, gy); ctx.lineTo(...handle); ctx.stroke();
    ctx.fillStyle = '#0d0704'; ctx.beginPath(); ctx.moveTo(plX - U * .03, gy - U * .02); ctx.lineTo(plX + U * .07, gy + U * .005); ctx.lineTo(plX - U * .02, gy + U * .01); ctx.closePath(); ctx.fill();   // the share                                         // handle
    const elX = handle[0] - U * .25;
    const t0 = .35, t1 = 3.0;
    // light from above on Elisha (a single beam) — grows as the mantle comes down
    const bm = ss(2.2, 3.4, u);
    if (bm > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const bxx = elX + U * .78 * .03; const g = ctx.createLinearGradient(bxx - U * .12, 0, bxx + U * .12, 0); g.addColorStop(0, 'rgba(255,200,110,0)'); g.addColorStop(.5, `rgba(255,206,120,${.32 * bm})`); g.addColorStop(1, 'rgba(255,200,110,0)'); ctx.fillStyle = g; ctx.fillRect(bxx - U * .12, -H, U * .24, gy - U * .78 * .9 + H); ctx.restore(); }
    const elisha = figure(ctx, { x: elX, y: gy, h: U * .78, d: 1, kind: 'man', bow: .25, stoop: .35, walk: u * 3, hands: [handle, [handle[0] - U * .012, handle[1] + U * .025]], light: sun, rim: [255, 180, 100], glow: .4 + .5 * ss(2.4, 3.6, u) });
    // Elijah at the left, casting his mantle: arm swings from behind to forward over 0–.5 s, then stays reaching
    const ejX = elX - U * .55, sh = [ejX + U * .03, gy - U * .785];
    const sw = eo(clamp(u / .55)), down = eio(clamp((u - 1.1) / 1.2)), ang = lerp(lerp(2.4, -.55, sw), .9, down), reach = U * lerp(.33, .30, down);
    const hand = [sh[0] + Math.cos(ang) * reach, sh[1] + Math.sin(ang) * reach];
    const elijah = figure(ctx, { x: ejX, y: gy, h: U, d: 1, kind: 'elder', stoop: .3, hands: [hand, null], light: sun, rim: [255, 180, 100] });
    // the mantle in flight: from Elijah's hand (0.35 s) over to Elisha's shoulders (3.0 s), unfolding, its edge catching the light
    const fk = clamp((u - t0) / (t1 - t0)), fe = eio(fk);
    const from = elijah.hands[0], to = [elisha.sh[0] - U * .01, elisha.sh[1] - U * .02];
    const mxp = lerp(from[0], to[0], fe), myp = lerp(from[1], to[1], fe) - Math.sin(fe * Math.PI) * U * .32;
    // a cloth: four corners (spread in flight, draped over his back when it lands), edges rippling
    const settle = ss(t1 - .25, t1 + .45, u), spread = u < t0 ? .2 : .35 + .65 * Math.sin(Math.min(1, fk * 1.15) * Math.PI * .5);
    const rot = lerp(-.5, .15, fe) + .15 * Math.sin(u * 5);
    const cw = U * lerp(.06, .17, spread), ch = U * lerp(.03, .07, spread), cr = Math.cos(rot), sr = Math.sin(rot);
    const fly = [[-cw, -ch * .6], [cw, -ch], [cw * .85, ch], [-cw * .9, ch * .8]].map(([a, b]) => [mxp + a * cr - b * sr, myp + a * sr + b * cr]);
    const sh2 = elisha.sh, cape = [[sh2[0] + U * .02, sh2[1] - U * .03], [sh2[0] - U * .085, sh2[1] - U * .01], [sh2[0] - U * .12, sh2[1] + U * .31], [sh2[0] - U * .02, sh2[1] + U * .27]];
    const C4 = fly.map((p, i) => [lerp(p[0], cape[i][0], settle), lerp(p[1], cape[i][1], settle)]);
    const pts = [];
    for (let e = 0; e < 4; e++) { const A = C4[e], Bq = C4[(e + 1) % 4], nx = -(Bq[1] - A[1]), ny = Bq[0] - A[0], nl = Math.hypot(nx, ny) || 1;
      for (let j = 0; j < 8; j++) { const t = j / 8, w = Math.sin(t * Math.PI) * (Math.sin(t * 9 + u * 10 + e) * U * .012 + Math.sin(t * 4 - u * 7 + e * 2) * U * .016) * (1 - .75 * settle);
        pts.push([lerp(A[0], Bq[0], t) + nx / nl * w, lerp(A[1], Bq[1], t) + ny / nl * w]); } }
    if (u >= t0 - .05) {
      ctx.fillStyle = '#100805'; ctx.beginPath(); pts.forEach(p => ctx.lineTo(...p)); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = 'rgba(255,200,110,.95)'; ctx.lineWidth = Math.max(2, U * .006); ctx.shadowColor = 'rgba(255,180,80,.9)'; ctx.shadowBlur = U * .04;
      ctx.beginPath(); pts.slice(0, 17).forEach(p => ctx.lineTo(...p)); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
    GOLD.bloom(ctx, ...toScr(sun, z, W * .5 + U * .1, gy - U * .6), [255, 170, 80], .3 * ex, { r: U * .45, streak: 0 });
    GOLD.motes(ctx, u, { n: 60, seed: 17, light: [W * .5, gy - U * .4, W * .7], a: ex });
    GOLD.glow(ctx, .5, { wide: .5 });
    GOLD.finish(ctx, u, { vignette: .5 });
    if (ex < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - ex})`; ctx.fillRect(0, 0, W, H); }
  }

  function goldAnoint(ctx, u, which) {
    if (which === 'horn') return hornScene(ctx, u);
    if (which === 'david') return pourScene(ctx, u, DAVID);
    if (which === 'aaron') return pourScene(ctx, u, AARON);
    if (which === 'elisha') return elishaScene(ctx, u);
  }

  // ---------------- 5부: three golden lights come down on one man and become one ----------------
  function goldThree(ctx, u) {
    const W = P.W, H = P.H, V = P.ori === 'v';
    const U = V ? .24 * H : .40 * H, gy = H * (V ? .60 : .76), cx = W * .5;
    const ex = ss(0, .35, u), z = 1 + .07 * u / 3.8, one = ss(2.3, 3.4, u);
    ctx.save(); camera(ctx, W, H, z, cx, gy - U * .6);
    ctx.fillStyle = '#0c0705'; ctx.fillRect(0, 0, W, H);
    let g = ctx.createRadialGradient(cx, gy - U * .2, 0, cx, gy - U * .2, Math.max(W, H) * .7); g.addColorStop(0, `rgba(226,146,70,${.92 * ex})`); g.addColorStop(.32, `rgba(140,84,36,${.82 * ex})`); g.addColorStop(1, `rgba(50,30,14,${.72 * ex})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ridge(ctx, W, H, gy - U * .05, U * .06, .002, 41, 'rgba(40,22,11,.95)');
    g = ctx.createLinearGradient(0, gy, 0, H); g.addColorStop(0, `rgba(80,48,22,${ex})`); g.addColorStop(.3, `rgba(36,22,11,${ex})`); g.addColorStop(1, `rgba(16,10,5,${ex})`); ctx.fillStyle = g; ctx.fillRect(0, gy, W, H);
    groundLight(ctx, W, H, gy, ex * (.7 + .5 * one));
    const man = figure(ctx, { x: cx, y: gy, h: U * .78, d: 1, kind: 'man', light: [cx, gy - U * 2], rim: [255, 200, 120], glow: .3 + .7 * one, fill: '#0b0603' });
    // three streams of gold light from the dark above (left, top, right) — the king's, the priest's, the prophet's — bending to him
    const tgt = [man.crown[0], man.crown[1] - U * .02];
    const src = [[cx - W * .55, -H * .05], [cx + W * .02, -H * .12], [cx + W * .55, -H * .05]];
    src.forEach((s, i) => { const k = ss(.15 + i * .25, 1.9 + i * .2, u), pts = [];
      const c1 = [lerp(s[0], tgt[0], .15) + (i - 1) * W * .1, lerp(s[1], tgt[1], .75)];
      for (let j = 0; j <= 40; j++) { const t = j / 40, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; pts.push([a * s[0] + b * c1[0] + c * tgt[0], a * s[1] + b * c1[1] + c * tgt[1]]); }
      const n = Math.max(2, Math.round(pts.length * k)); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.slice(0, n).forEach(p => ctx.lineTo(...p)); for (const [lw, a] of [[U * .16, .06], [U * .07, .10]]) { ctx.lineWidth = lw; ctx.strokeStyle = `rgba(255,180,90,${a * (1 - .5 * one)})`; ctx.stroke(); } ctx.restore();
      GOLD.stream(ctx, pts, k, { w: U * .014 * (1 - .5 * one), t: u, back: true, glints: 3, speed: U * 1.2, alpha: 1 - .6 * one, taper: .5 }); });
    // one light
    if (one > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      g = ctx.createLinearGradient(tgt[0] - U * .16, 0, tgt[0] + U * .16, 0); g.addColorStop(0, 'rgba(255,200,110,0)'); g.addColorStop(.5, `rgba(255,214,140,${.45 * one})`); g.addColorStop(1, 'rgba(255,200,110,0)');
      ctx.fillStyle = g; ctx.fillRect(tgt[0] - U * .16, -H, U * .32, tgt[1] + H);
      ctx.restore();
    }
    ctx.restore();
    const ts = toScr(tgt, z, cx, gy - U * .6);
    GOLD.bloom(ctx, ts[0], ts[1], [255, 196, 110], .25 + .6 * one, { r: U * (.3 + .4 * one), streak: .35 * one });
    GOLD.motes(ctx, u, { n: 80, seed: 51, light: [ts[0], ts[1], W * .6], pull: one > 0 ? [ts[0], ts[1], one * .6, U * .5, U * .3] : null, a: ex });
    GOLD.glow(ctx, .6, { wide: .5 });
    GOLD.finish(ctx, u, { vignette: .55 });
    if (ex < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - ex})`; ctx.fillRect(0, 0, W, H); }
  }

  window.goldAnoint = goldAnoint; window.goldThree = goldThree;
})();
