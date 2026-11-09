/* 「그리스도」 N03 → T1 (영상 14.1–23.6 s): 어둠 속 금빛 기름 한 방울 → 보이지 않던 면에 닿아 빛으로 번짐 → 번진 빛이 제목 자리로
   고요히 모임. 화풍 goldoil (kit-goldoil.js, 이 영상에서 새로 만든 금빛 기름 매크로).
     goldTitle(ctx, u)   u = 0..9.5 s   0–1.15 매달린 방울(실이 가늘어짐) · 1.15 끊어짐 · –3.5 천천히 떨어짐(위성 방울이 뒤따름)
                                       3.5 닿음(튀지 않고 퍼짐) · –6 빛이 면으로 번짐 · 6–9.5 빛이 제목 자리(세로 0.45H)로 모임
     goldTease(ctx, u)   u = 0..3 s     2부 맛보기: 뿔병 → 역광 실루엣 머리 위로 흐르는 기름 줄기(다윗, 삼상 16:13)
   글자는 그리지 않는다(본 세션이 제목·자막을 얹음). 0–0.5 s 어둠에서 열림. */
(function () {
  const P = Pilot, { clamp, lerp, ss, eio, eo } = P;

  // ---------------- 제목 장면 ----------------
  // the floor: old dark wood (like the boards of the tabernacle), built once per orientation
  const FL = {};
  function floorFor(W, H, C) { const key = W + 'x' + H; return FL[key] || (FL[key] = GOLD.floor(W, H, { hor: C.hor * H, focus: C.surf * H, kind: 'wood', seed: 5 })); }
  function goldTitle(ctx, u) {
    const W = P.W, H = P.H, V = P.ori === 'v';
    const C = V
      ? { surf: .50, hor: .42, hang: .155, r: .085 * W, R: .38 * W, tilt: .28, title: .45 }
      : { surf: .60, hor: .45, hang: .15, r: .074 * H, R: .30 * W, tilt: .24, title: .45 };
    // camera: always pushing in, around the landing point (which stays put on screen)
    const z = 1 + .24 * (.55 * u / 9.5 + .45 * ss(0, 9.5, u)), S = C.surf * H, cx = W / 2;
    const sx = wx => cx + (wx - cx) * z, sy = wy => S + (wy - S) * z;
    const ex = ss(0, .5, u);                                                 // opens from the dark
    const gl = ss(3.5, 5.3, u) * (1 - .3 * ss(6.4, 9, u));                   // light the film carries
    const ga = eio(clamp((u - 5.8) / 3.4));                                  // light gathering to the title
    const r = C.r * z, surfS = S, horS = sy(C.hor * H);

    // ---- the room behind: a wide out-of-focus warm lamp right behind the drop
    ctx.fillStyle = '#120b06'; ctx.fillRect(0, 0, W, H);
    const pz = Math.pow(z, .3), bgK = ex * (1 - .25 * ga);
    const LX = W * .53, LY = H * (V ? .20 : .16) - (z - 1) * H * .04;
    let g = ctx.createRadialGradient(LX, LY, 0, LX, LY, Math.max(W, H) * (V ? .62 : .8) * pz);
    g.addColorStop(0, `rgba(246,184,100,${.97 * bgK})`); g.addColorStop(.14, `rgba(214,142,64,${.9 * bgK})`); g.addColorStop(.38, `rgba(130,78,32,${.8 * bgK})`); g.addColorStop(.7, `rgba(60,36,16,${.7 * bgK})`); g.addColorStop(1, `rgba(26,16,8,${.6 * bgK})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    GOLD.bokeh(ctx, { n: V ? 10 : 12, seed: 23, x: -W * .1, y: -H * .04, w: W * 1.2, h: H * (C.hor - .02), r: (V ? .075 : .05) * W * pz, a: .12 * bgK, t: u, col: [255, 200, 120] });

    // ---- the floor, its far edge melting into the lamp's haze; lit warm by the lamp, glossy under it
    ctx.save(); ctx.globalAlpha = ex; ctx.setTransform(z, 0, 0, z, cx * (1 - z), S * (1 - z)); ctx.drawImage(floorFor(W, H, C), 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    g = ctx.createLinearGradient(0, horS - H * .03, 0, horS + H * .10); g.addColorStop(0, 'rgba(150,92,40,0)'); g.addColorStop(.25, `rgba(150,92,40,${.55 * bgK})`); g.addColorStop(1, 'rgba(150,92,40,0)'); ctx.fillStyle = g; ctx.fillRect(0, horS - H * .03, W, H * .13);
    ctx.translate(LX, horS + H * .02); ctx.scale(1, V ? 1.6 : 1.0);                                           // the lamp mirrored in the waxed boards
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * .32); g.addColorStop(0, `rgba(190,120,52,${.42 * bgK})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-W, -W, 2 * W, 2 * W);
    ctx.restore();
    g = ctx.createLinearGradient(0, horS - H * .05, 0, horS + H * .07); g.addColorStop(0, 'rgba(120,74,32,0)'); g.addColorStop(.42, `rgba(132,82,36,${.75 * bgK})`); g.addColorStop(1, 'rgba(120,74,32,0)');
    ctx.fillStyle = g; ctx.fillRect(0, horS - H * .05, W, H * .12);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(cx, surfS); ctx.scale(1, C.tilt * 2.2);   // warm light on the boards around the spot
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * .75); g.addColorStop(0, `rgba(110,66,26,${.40 * ex})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-W, -W * 3, 2 * W, W * 6); ctx.restore();

    // ---- the drop's path (world y in px)
    const TP = 1.15, rw = C.r, hangY = (C.hang + .01 * ss(0, TP, u)) * H, yEnd = C.surf * H - rw, TL = 3.5;
    let dy, s, tp, al = 1, neck = null;
    if (u < TP) { dy = hangY; s = 1.16 + .16 * ss(0, TP, u); tp = .34; }
    else if (u < TL) { const uf = u - TP; dy = hangY + (yEnd - hangY) * Math.pow(uf / (TL - TP), 1.6); s = 1.03 + .2 * Math.exp(-uf * 1.1) * Math.cos(uf * 7.5); tp = .34 * Math.exp(-uf * 3); }
    else { const ui = u - TL; s = ui < .034 ? .8 : .62; dy = C.surf * H - rw * s * .72; tp = 0; al = ui < .067 ? 1 : 0; }   // two frames flattening into the film, then the film (its dome) carries on
    const dS = sy(dy);

    // ---- the film: it refracts the boards under it (soaked, golden), with the landing dome and faint rings
    const k0 = 1.05 * rw / C.R, kp = u > TL ? k0 + (1 - k0) * (1 - Math.exp(-(u - TL) * .75)) : 0;
    if (kp > 0) {
      const tt = u - TL, Rp = C.R * z;
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(cx, surfS); ctx.scale(1, C.tilt * 1.4);
      g = ctx.createRadialGradient(0, 0, 0, 0, 0, Rp * kp * 1.8); g.addColorStop(0, `rgba(200,124,48,${.30 * gl})`); g.addColorStop(.5, `rgba(120,70,24,${.18 * gl})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(-Rp * 2, -Rp * 2, Rp * 4, Rp * 4); ctx.restore();
      const under = GOLD.grab(ctx, .5);
      GOLD.pool(ctx, cx, surfS, Rp, kp, { bg: under, tilt: C.tilt, t: tt, caus: 0, glow: gl * (1 - .25 * ga), seed: 7,
        dome: Math.exp(-tt * 2.6), domeR: lerp(.9, .5, ss(0, .7, tt)), rings: [[.05, .9, .26], [.92, .5, .24], [2.3, .35, .2]] });
      const fl = ss(TL - .04, TL + .1, u) * (1 - ss(TL + .1, 5.2, u));
      GOLD.bloom(ctx, cx, surfS, [255, 176, 80], .55 * fl, { r: W * (V ? .22 : .15), streak: .2 });
      GOLD.bloom(ctx, cx, surfS, [255, 176, 80], .2 * gl * (1 - ga), { r: W * (V ? .24 : .16), streak: 0, ghosts: false });
    }
    const bg = GOLD.grab(ctx);

    // ---- reflection of the falling drop in the waxed boards
    if (al > 0 && u < TL) { const hgt = surfS - dS; if (hgt < H * .22) GOLD.drop(ctx, sx(cx), surfS + hgt * .9, r, u, { bg, s, tp: -tp, flip: true, alpha: .14 * ss(H * .22, H * .04, hgt) * al, spec: .5, caus: .2 }); }

    // ---- the thread above (before the pinch: one shape with the drop; after: it snaps back up) and the satellite droplet
    const topS = sy(-.06 * H);
    if (u < TP) {
      const dip = Math.pow(ss(.15, TP, u), 1.5), dTop = dS - r * s * 1.0, tw = (dTop - topS) / (dS - topS) - .05;
      neck = { top: topS, hw: t => { const base = r * (.065 + .10 * t * t), w = base * (1 - .96 * dip * Math.exp(-(((t - tw) / .06) ** 2))); return w + r * .06 * dip * Math.exp(-(((t - (tw - .12)) / .045) ** 2)); } };
    } else if (u < TP + .35) {
      const k = 1 - ss(0, .35, u - TP), dTop = dS - r * s;
      neck = { top: dTop - r * .9 * k, hw: t => r * .45 * Math.pow(ss(.55, 1, t), 1.4) * k + r * .05 * k };
    }
    if (u >= TP) {
      const k = eio(clamp((u - TP) / 1.4)), b0 = sy(hangY - rw * 1.75), b = lerp(b0, topS - r, k);
      if (b > -r) GOLD.drop(ctx, sx(cx), b, r * .12, u, { bg, neck: { top: topS - 40, hw: () => r * .075 * (1 - .4 * k) }, caus: .2 });
      const s0 = TP + .12, s1 = 4.42, ys0 = hangY - rw * 1.45, ys1 = C.surf * H - rw * .17;
      if (u < s1 + .2) { const f = clamp((u - s0) / (s1 - s0)), ysat = u < s0 ? ys0 : ys0 + (ys1 - ys0) * Math.pow(f, 1.55);
        GOLD.drop(ctx, sx(cx + rw * .02), sy(ysat), r * .17 * (u > s1 ? 1 - ss(s1, s1 + .2, u) * .6 : 1), u, { bg, s: (1 + .25 * Math.exp(-(u - s0) * 2) * Math.cos((u - s0) * 14)) * (u > s1 ? .6 : 1), alpha: 1 - ss(s1 + .03, s1 + .2, u), caus: .4, spec: .8 }); }
    }

    // ---- the drop
    if (al > 0) GOLD.drop(ctx, sx(cx), dS, r, u, { bg, s, tp, neck, alpha: al, caus: .55 });
    if (u < TL) GOLD.bloom(ctx, sx(cx) - r * .36, dS - r * s * .5, [255, 230, 180], .16 * ex, { r: r * 1.1, streak: 0, ghosts: false });

    // ---- light gathers to the title: the film's light lifts and settles, calm and wide
    if (ga > 0) {
      const ty = C.title * H;
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      g = ctx.createLinearGradient(0, surfS, 0, ty - H * .04); g.addColorStop(0, `rgba(160,92,30,${.22 * ga * (1 - .5 * ga)})`); g.addColorStop(1, 'rgba(160,92,30,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - W * .3, ty - H * .04, W * .6, surfS - ty + H * .04);
      ctx.translate(cx, ty); ctx.scale(1, V ? .42 : .30);
      const RR = lerp(.62, .44, ga) * W * (V ? 1 : .55);
      g = ctx.createRadialGradient(0, 0, 0, 0, 0, RR); g.addColorStop(0, `rgba(196,128,52,${.55 * ga})`); g.addColorStop(.35, `rgba(130,76,26,${.36 * ga})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(-RR, -RR, 2 * RR, 2 * RR); ctx.restore();
      GOLD.bloom(ctx, cx, ty, [255, 180, 90], .28 * ga, { r: W * (V ? .22 : .14), streak: .5, ghosts: false });
    }
    GOLD.motes(ctx, u, { n: V ? 90 : 110, seed: 41, light: [cx, lerp(H * .25, surfS, ss(2, 5, u)), W * (V ? .75 : .5)], pull: ga > 0 ? [cx, C.title * H, ga, W * (V ? .30 : .18), H * .018] : null, a: ex, size: V ? 1 : .9 });
    GOLD.glow(ctx, .5 + .25 * gl, { wide: .5 });
    GOLD.finish(ctx, u, { vignette: .45 + .1 * ga, vy: V ? .46 : .5 });
    if (ex < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - ex})`; ctx.fillRect(0, 0, W, H); }
  }

  // ---------------- 2부 맛보기: 뿔병 → 역광 실루엣 머리 위로 ----------------
  // a young man's head in profile facing right, bowed a little; local units (top of the head ≈ 0, chin ≈ .85).
  // cranium = a bumpy ellipse (curly hair), face = explicit profile points, then neck and shoulders to the bottom.
  const CR = [0, .42, .47, .45];                                        // cranium centre x,y and radii
  const crPt = (th, hair) => { const b = hair === 2 ? .028 : hair ? .03 + .012 * Math.sin(th * 13) + .009 * Math.sin(th * 29 + 1) + .02 * (P.noise(th * 4, 3.3) - .5) : 0;
    return [CR[0] + Math.cos(th) * (CR[2] + b), CR[1] + Math.sin(th) * (CR[3] + b)]; };
  const FACE = [[.43, .25], [.435, .34], [.445, .42], [.415, .47], [.47, .55], [.505, .60], [.445, .635], [.455, .67], [.43, .695], [.45, .72], [.42, .76], [.44, .82], [.38, .87], [.20, .87], [.16, .95], [.17, 1.12],
    [.45, 1.25], [.85, 1.36], [1.15, 1.58], [1.3, 2.6], [1.4, 6], [-1.5, 6], [-1.4, 2.6], [-1.15, 1.56], [-.72, 1.28], [-.36, 1.12], [-.30, .95], [-.33, .80]];
  function headPts() {
    const pts = []; const D = Math.PI / 180;
    for (let th = 135; th <= 335; th += 2.5) pts.push(crPt(th * D, th > 150 && th < 330));
    return pts.concat(FACE);
  }
  const HP = headPts();
  function headPath(ctx, X, Y, s, rot) {
    const c = Math.cos(rot), sn = Math.sin(rot), T = ([a, b]) => [X + (a * c - (b - .5) * sn) * s, Y + (a * sn + (b - .5) * c) * s];
    const p = HP.map(T); ctx.beginPath(); ctx.moveTo((p[0][0] + p[p.length - 1][0]) / 2, (p[0][1] + p[p.length - 1][1]) / 2);
    for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; ctx.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + q[0]) / 2, (p[i][1] + q[1]) / 2); }
    ctx.closePath(); return T;
  }
  function goldTease(ctx, u) {
    const W = P.W, H = P.H, V = P.ori === 'v';
    const hs = V ? .20 * H : .31 * H, HX = V ? .56 * W : .60 * W, HY = V ? .43 * H : .50 * H, rot = .2;
    const z = 1 + .07 * (u / 3), fx = HX, fy = HY;
    const Z = (x, y) => [fx + (x - fx) * z, fy + (y - fy) * z];
    const ex = ss(0, .35, u);
    // dusk behind: the sun low, just behind the back of the head
    let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#140b07'); g.addColorStop(.28, '#3d2011'); g.addColorStop(V ? .52 : .62, '#a85c24'); g.addColorStop(V ? .62 : .74, '#58290f'); g.addColorStop(1, '#0d0704');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const [sunX, sunY] = Z(HX - hs * .42, HY + hs * .20);
    g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(W, H) * .55); g.addColorStop(0, 'rgba(255,220,150,.95)'); g.addColorStop(.06, 'rgba(255,170,80,.75)'); g.addColorStop(.3, 'rgba(180,90,34,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // far hills of Bethlehem, hazy
    ctx.fillStyle = 'rgba(70,32,15,.7)'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, H * (V ? .60 : .70) - 40 * P.fbm(x * .004, 3) * z); ctx.lineTo(W, H); ctx.fill();
    ctx.fillStyle = 'rgba(30,14,7,.9)'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, H * (V ? .66 : .80) - 50 * P.fbm(x * .003 + 9, 5) * z); ctx.lineTo(W, H); ctx.fill();
    GOLD.bokeh(ctx, { n: 7, seed: 5, y: H * .15, h: H * .5, r: W * .05, a: .06, t: u });
    // the head: light wrapping its edge, then the silhouette
    const [X, Y] = Z(HX, HY), s = hs * z;
    ctx.save(); ctx.shadowColor = 'rgba(255,176,90,.85)'; ctx.shadowBlur = s * .07; headPath(ctx, X, Y, s, rot); ctx.fillStyle = '#ffc070'; ctx.fill(); ctx.restore();
    const ox = X - sunX, oy = Y - sunY, ol = Math.hypot(ox, oy) || 1;
    const T = headPath(ctx, X + ox / ol * s * .008, Y + oy / ol * s * .008, s, rot); ctx.fillStyle = '#0e0704'; ctx.fill();
    // the horn, held from outside the frame, tipped; its oil falls on the crown
    const crown = T(crPt(-Math.PI / 2 - .25, true)), tip = [crown[0] - s * .30, crown[1] - s * .52];
    GOLD.horn(ctx, tip[0], tip[1], s * 1.0, -2.95, { curl: .55, rim: [255, 190, 104], light: Math.PI * .55 });
    GOLD.stream(ctx, GOLD.path(tip[0], tip[1], crown[0], crown[1] + s * .01), 1, { w: s * .016, t: u, back: true, glints: 4, speed: s * .9 });
    // and runs down the hair, on the lit edge
    const D = Math.PI / 180, edge = (a0, a1) => { const p = []; for (let th = a0; a1 > a0 ? th <= a1 : th >= a1; th += a1 > a0 ? 4 : -4) p.push(T(crPt(th * D, 2))); return p; };
    const r1 = edge(256, 150), r2 = edge(262, 330);
    GOLD.stream(ctx, r1, lerp(.10, .38, ss(0, 3, u)), { w: s * .011, t: u, back: true, glints: 3, speed: s * .2, taper: .5 });
    GOLD.stream(ctx, r2, lerp(.06, .32, ss(0, 3, u)), { w: s * .009, t: u, back: true, glints: 2, speed: s * .2, taper: .5 });
    GOLD.bloom(ctx, crown[0], crown[1], [255, 190, 100], .4, { r: s * .22, streak: .25, ghosts: false });
    GOLD.bloom(ctx, sunX, sunY, [255, 170, 80], .45, { r: s * .5, streak: 0 });
    GOLD.motes(ctx, u, { n: 70, seed: 8, light: [sunX, sunY, W * .7], size: V ? 1 : .9 });
    GOLD.glow(ctx, .55, { wide: .5 });
    GOLD.finish(ctx, u, { vignette: .55 });
    if (ex < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - ex})`; ctx.fillRect(0, 0, W, H); }
  }

  window.goldTitle = goldTitle; window.goldTease = goldTease;
})();
