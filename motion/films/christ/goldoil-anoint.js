/* 「그리스도」 2부 세 기름 부음 + 5부 세 빛 — 화풍 goldoil (kit-goldoil.js). 사람은 작은 역광 실루엣(얼굴·손 세부 없음), 주인공은 기름과 빛.
     goldAnoint(ctx, u, which)
       'horn'   u 0..2.2  (영상에서 빠짐, 관리자 2026-11-14 — 표본용으로만 남김)  화면 밖 등잔 빛 속에서 돌아가는 기름 뿔병, 끝에 금빛 방울이 맺힘
       'david'  u 0..13.3 (23.2–36.5, N04 K1 삼상 16:13)  노을의 베들레헴 언덕이 첫 프레임부터 보임(검은 페이드 없음: 제목이 바로 언덕으로 녹아듦) —
                0–5.7 사무엘이 걸어와 뿔병을 들어 올림, 5.7부터(영상 28.9) 기울여 기름이 어린 목동 머리 위로
       'aaron'  u 0..4.1  (35.8–39.9, K2 레 8:12)  회막 문 앞, 성막 휘장 뒤 등불 — 관(금 패)·흉패의 아론 머리 위로 모세가 관유를 부음(작은 병)
       'elisha' u 0..4.4  (39.9–44.3, K3 왕상 19:16·19)  기름은 붓지 않음 — 겨릿소로 밭 가는 엘리사에게 엘리야가 겉옷을 던짐, 겉옷 가장자리에 금빛
     goldRecall(ctx, u, which)  u 0..3.4 (5부 148–155.8)  2부 장면을 기름 부은 뒤로 다시 보여 줌 — 천천히 다가가며 기름/겉옷의 금빛이 위로 떠오름
     goldThree(ctx, u)   u 0..5.2  (155.4–160.4, N16)  세 장면의 빛이 세 방향에서 와서 한 빛(요단의 성령 빛 색) 안으로 들어가고, 그 빛이 먼 언덕 빈 십자가 뒤의 해돋이가 됨 — 사람 없음
   세 기름 부음은 같은 구도(붓는 이 왼쪽·받는 이 오른쪽, 빛은 뒤에서). 글자는 그리지 않는다.
   사람은 모두 남자로 읽혀야 한다(관리자 2026-11-14): 넓고 각진 어깨, 곧은 겉옷(A자 드레스 윤곽 금지), 어른은 머릿수건(끈 두름, 목덜미까지만)이나
   짧은 머리 + 수염(역광에 수염 가장자리가 빛남), 소년 다윗은 짧은 곱슬머리·무릎 길이 속옷·다리·목자 지팡이. 긴 머리처럼 흘러내리는 선은 그리지 않는다.
   엘리야의 겉옷은 무거운 직물 메시(접힘 음영·두꺼운 단·술·가장자리 역광) — 단순하게(관리자 6차 #1): 엘리야는 몸 앞으로 내민 팔뚝에 접은 겉옷을
   걸치고 서 있다가(팔이 몸 밖으로 보임, 어깨에서 나옴) 겉옷이 손으로 모이며 팔을 조금 내렸다가 앞위로 한 번 고르게 휘둘러 놓는다. 겉옷은 혼자
   짧고 부드러운 호를 날아(뒤처지는 모서리·펄럭임, 날 때는 늘 면이 보임 — 막대·판 모양 없음) 엘리사의 뒤에서 어깨와 등 위로 내려앉아 한 번 흔들린 뒤
   늘어진다(가장자리 고르지 않게, 주름 몇 개). 엘리야 몸을 감아 돌지 않고, 엘리사 머리는 절대 덮지 않는다(머리·목을 겉옷 위에 다시 그림).
   엘리사는 젊은 농부: 곧게 서서 두 손으로 쟁기 손잡이를 잡고(지팡이처럼 기대지 않음), 겉옷이 올 때 엘리야 쪽으로 고개를 돌려 올려다본다. */
(function () {
  const P = Pilot, { clamp, lerp, ss, eio, eo } = P;
  const css = GOLD.css;

  // ---------------- a standing figure, backlit (side view, facing d = +1 right / -1 left) ----------------
  // f: { x, y (ground), h, d, kind: 'elder'|'youth'|'priest'|'man', stoop, bow, hands: [near, far] screen targets or null,
  //      rim [r,g,b], light [x,y] (where the light comes from), glow (0..1 halo), walk (phase, robe sway) }
  // returns { head: [x, y, r], crown: [x, y], top, sh: [shoulder x, y], hands: [[x,y],[x,y]], elbows }
  // men's robe: broad square shoulders, straight body, hardly flared at the hem (the old A-line read as a dress, 관리자 2026-11-14)
  const ROBE = [[-.05, -.848], [-.13, -.825], [-.158, -.768], [-.142, -.66], [-.126, -.50], [-.13, -.28], [-.148, -.03], [-.14, 0], [.14, 0], [.148, -.03], [.125, -.28], [.115, -.50], [.128, -.66], [.118, -.75], [.078, -.818], [.04, -.845]];
  const TUNIC = [[-.05, -.848], [-.13, -.825], [-.158, -.768], [-.142, -.66], [-.124, -.50], [-.13, -.36], [-.146, -.25], [-.138, -.232], [.138, -.232], [.146, -.25], [.125, -.36], [.113, -.50], [.128, -.66], [.118, -.75], [.078, -.818], [.04, -.845]];
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
    const parts = [], lines = [];          // lines: inner edges that catch the backlight (beard, head cloth, hair) so a man reads as a man
    // robe (a little sway when walking); a working man / the boy wear the knee-length tunic and the legs show
    const tun = !!f.tunic, sw = f.walk == null ? 0 : Math.sin(f.walk) * .015;
    const rp = new Path2D(), pts = (tun ? TUNIC : ROBE).map(([a, b]) => T(a + (b > (tun ? -.3 : -.1) ? sw * (a > 0 ? 1 : -1) : 0), b));
    rp.moveTo((pts[0][0] + pts[pts.length - 1][0]) / 2, (pts[0][1] + pts[pts.length - 1][1]) / 2);
    for (let i = 0; i < pts.length; i++) { const q = pts[(i + 1) % pts.length]; rp.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + q[0]) / 2, (pts[i][1] + q[1]) / 2); }
    rp.closePath(); parts.push(rp);
    if (tun) for (const s of [1, -1]) {                       // legs: hip → knee → ankle, knees bend forward; a sandalled foot
      const ph = f.walk == null ? 0 : Math.sin(f.walk + (s > 0 ? 0 : Math.PI)), hip = T(s * .035, -.30), kn = T(s * .03 + .03 * ph + .012, -.15), an = T(s * .03 + .045 * ph, -.025);
      parts.push(limb([hip, kn, an], [.036 * h, .028 * h, .021 * h]));
      const ft = new Path2D(); ft.ellipse(an[0] + d * .028 * h, an[1] + .006 * h, .036 * h, .014 * h, 0, 0, 6.2832); parts.push(ft);
    }
    // neck + head
    const hr = (k === 'youth' ? .066 : .062) * h, hc = T(.015 + bw * .04, -.915 + bw * .02);
    const nk = new Path2D(); const n1 = T(-.03, -.85), n2 = T(.045, -.85); nk.moveTo(...n1); nk.lineTo(...n2); nk.lineTo(hc[0] + d * hr * .45, hc[1]); nk.lineTo(hc[0] - d * hr * .55, hc[1]); nk.closePath(); parts.push(nk);
    const hp = new Path2D(); hp.arc(hc[0], hc[1], hr, 0, 6.2832); parts.push(hp);
    const hs = f.hs == null ? 1 : f.hs;                                         // head turn: 1 faces d, -1 looks back over the shoulder (through a frontal 0)
    const Hp = (a, b) => [hc[0] + d * hs * hr * a, hc[1] + hr * b];          // head-local (a forward, b down), in head radii
    const poly = (q, closed = true) => { const p = new Path2D(); p.moveTo(...Hp(...q[0])); q.slice(1).forEach(v => p.lineTo(...Hp(...v))); if (closed) p.closePath(); return p; };
    const curve = (q) => { const p = new Path2D(), r = q.map(v => Hp(...v)); p.moveTo(...r[0]); for (let i = 1; i < r.length - 1; i++) p.quadraticCurveTo(r[i][0], r[i][1], (r[i][0] + r[i + 1][0]) / 2, (r[i][1] + r[i + 1][1]) / 2); p.lineTo(...r[r.length - 1]); return p; };
    // brow and nose so the profile reads which way he faces; a square jaw
    parts.push(poly([[.78, -.32], [1.13, .12], [.86, .36]]));
    parts.push(poly([[.9, .3], [.82, .92], [.1, .98], [-.5, .3]]));
    let top = hc[1] - hr;
    const cloth = k === 'elder' || f.cloth;
    if (cloth) {                          // a head cloth (not a veil): over the crown, its back corner square, falling only to the nape and shoulder; a cord round the brow
      parts.push(curve([[.86, -.42], [.72, -1.18], [-.25, -1.36], [-1.12, -1.12], [-1.34, -.2], [-1.42, .95], [-1.2, 1.78], [-.35, 1.85], [-.3, .7], [.2, .1], [.86, -.42]]));
      { const cd = new Path2D(), cc = Hp(-.16, -.74); cd.ellipse(cc[0], cc[1], hr * 1.1, hr * .2, d * .12, 0, 6.2832); parts.push(cd); }
      lines.push(curve([[.9, -.66], [.0, -.9], [-1.2, -.72]]));                               // the cord round the brow
      top = hc[1] - hr * 1.3;
    } else if (k === 'youth') {           // the boy: short curls close to the head, above the ear; no beard
      parts.push(curve([[.72, -.55], [.4, -1.1], [-.4, -1.12], [-1.05, -.55], [-1.0, .05], [-.62, .28], [-.2, -.2], [.72, -.55]]));
      for (let i = 0; i < 7; i++) { const th = -Math.PI / 2 + (.62 - i * .3), c = new Path2D(), cc = Hp(Math.cos(th) * .9, Math.sin(th) * .9); c.arc(cc[0], cc[1], hr * (.22 + .04 * Math.sin(i * 2.1)), 0, 6.2832); parts.push(c); }
      lines.push(curve([[.68, -.6], [.25, -.3], [-.2, -.15], [-.62, .26]]));
      top = hc[1] - hr * 1.12;
    } else if (k === 'priest') {          // the turban (mitre) of fine linen
      const m = new Path2D(); const mw = hr * 1.1, mt = hc[1] - hr * 1.95; m.moveTo(hc[0] - mw * .95, hc[1] - hr * .1); m.bezierCurveTo(hc[0] - mw * 1.25, mt + hr * .5, hc[0] - mw * .7, mt, hc[0], mt); m.bezierCurveTo(hc[0] + mw * .7, mt, hc[0] + mw * 1.25, mt + hr * .5, hc[0] + mw * .95, hc[1] - hr * .1); m.closePath(); parts.push(m);
      top = mt;
    } else {                              // a grown man: short hair, cut above the ear and the nape
      parts.push(curve([[.74, -.6], [.35, -1.16], [-.55, -1.1], [-1.1, -.5], [-1.05, .2], [-.7, .42], [-.2, .0], [.74, -.6]]));
      lines.push(curve([[.72, -.62], [.3, -.42], [-.25, -.05], [-.7, .4]]));
      top = hc[1] - hr * 1.14;
    }
    if (k === 'elder' || k === 'priest' || f.beard === 'long') {        // a full beard: from under the nose, past the chin, to a point on the chest
      parts.push(curve([[.96, .28], [1.2, .9], [1.14, 1.5], [.86, 2.05], [.42, 1.78], [-.1, 1.2], [-.5, .35], [.96, .28]]));
      lines.push(curve([[.98, .3], [1.2, .9], [1.14, 1.5], [.86, 2.05], [.45, 1.85]]));
    } else if (k === 'man') {             // a short beard
      parts.push(curve([[.96, .3], [1.04, .9], [.78, 1.42], [.1, 1.3], [-.5, .4], [.96, .3]]));
      lines.push(curve([[.98, .32], [1.04, .9], [.78, 1.42], [.35, 1.4]]));
    }
    // a shepherd's staff in the near hand
    let hands0 = f.hands;
    if (f.staff) { const sb = T(-.21, 0), stp = T(-.18, -1.0); parts.push(limb([sb, stp], [.012 * h, .011 * h])); hands0 = [null, [lerp(sb[0], stp[0], .57), lerp(sb[1], stp[1], .57)]]; }
    // arms: shoulder → elbow → hand, fixed bone lengths, elbows bend down (ik)
    const S = T(.01, -.785), L1 = .19 * h, L2 = .17 * h, hands = [], elbows = [];
    for (let a = 0; a < 2; a++) {
      const tgt = hands0 && hands0[a] ? hands0[a] : T(a ? .08 : .13, a ? -.58 : -.56);
      const r = ik([S[0] + (a ? -1 : 1) * d * .01 * h, S[1]], tgt, L1, L2, true);
      const sh = [S[0] + (a ? -1 : 1) * d * .01 * h, S[1]];
      parts.push(limb([sh, r.E, r.Hd], [.05 * h, .04 * h, .042 * h]));
      const jt = new Path2D(); jt.arc(r.E[0], r.E[1], .041 * h, 0, 6.2832); jt.moveTo(sh[0] + .055 * h, sh[1]); jt.arc(sh[0], sh[1], .055 * h, 0, 6.2832); parts.push(jt);
      const sv = new Path2D(), mx = lerp(r.E[0], r.Hd[0], .55), my = lerp(r.E[1], r.Hd[1], .55);      // the wide sleeve hangs below the forearm
      sv.moveTo(...r.E); sv.lineTo(r.Hd[0], r.Hd[1]); sv.quadraticCurveTo(r.Hd[0] - (r.Hd[0] - r.E[0]) * .15, r.Hd[1] + .075 * h, mx, my + .055 * h); sv.closePath(); parts.push(sv);
      const hn = new Path2D(); hn.arc(r.Hd[0], r.Hd[1], .024 * h, 0, 6.2832); parts.push(hn);
      hands.push(r.Hd); elbows.push(r.E); if (!r.reach && hands0 && hands0[a]) console.warn('reach', k, a, (Math.hypot(tgt[0] - S[0], tgt[1] - S[1]) / (L1 + L2)).toFixed(2));
    }
    // draw: light wrapping the edge (offset towards the light, with a halo), then the silhouette, then the inner edges in the light
    const lx = f.light ? f.light[0] - f.x : 0, ly = f.light ? f.light[1] - (f.y - h * .5) : -1, ll = Math.hypot(lx, ly) || 1, o = Math.max(1.5, h * .006);
    ctx.save(); ctx.translate(lx / ll * o, ly / ll * o); ctx.fillStyle = css(f.rim || [255, 180, 96], .95);
    if (f.glow) { ctx.shadowColor = css(f.rim || [255, 180, 96], .7 * f.glow); ctx.shadowBlur = h * .06; }
    parts.forEach(p => ctx.fill(p)); ctx.restore();
    ctx.save(); ctx.fillStyle = f.fill || '#0d0704'; parts.forEach(p => ctx.fill(p)); ctx.restore();
    if (lines.length) { ctx.save(); ctx.strokeStyle = css(f.rim || [255, 180, 96], (f.fill ? .5 : .75) * Math.min(1, Math.abs(hs) * 2.5));   // (the inner lines fade while the head turns through frontal) ctx.lineWidth = Math.max(1.2, h * .004); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.shadowColor = css(f.rim || [255, 180, 96], .6); ctx.shadowBlur = h * .012; lines.forEach(p => ctx.stroke(p)); ctx.restore(); }
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
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, hz + 2 + H);
    g = ctx.createRadialGradient(sun[0], sun[1], 0, sun[0], sun[1], Math.max(W, H) * .6); g.addColorStop(0, 'rgba(255,232,170,1)'); g.addColorStop(.05, 'rgba(255,196,110,.9)'); g.addColorStop(.25, 'rgba(220,120,50,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  function ridge(ctx, W, H, y, amp, f, seed, col, z = 1) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-W * .6, H * 2);
    for (let x = -W * .6; x <= W * 1.6; x += 16) ctx.lineTo(x, y - amp * (P.fbm(x * f / z + seed, seed * .7, 4) - .3));
    ctx.lineTo(W * 1.6, H * 2); ctx.fill();
  }
  // warm light lying on the near ground (the subtitle band stays calm, but is not black)
  function groundLight(ctx, W, H, gy, k = 1) { const g = ctx.createLinearGradient(0, gy, 0, H); g.addColorStop(0, `rgba(176,104,46,${.56 * k})`); g.addColorStop(.35, `rgba(120,70,30,${.42 * k})`); g.addColorStop(1, `rgba(72,42,20,${.32 * k})`);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(-W, gy, W * 3, H * 2); ctx.restore(); }
  function camera(ctx, W, H, z, fx, fy) { ctx.setTransform(z, 0, 0, z, fx * (1 - z), fy * (1 - z)); }

  // ---------------- 'horn' : a horn flask turning in lamplight ----------------
  function hornScene(ctx, u) {
    const W = P.W, H = P.H, V = P.ori === 'v';
    const ex = ss(0, .25, u), z = 1 + .06 * u / 2.2;
    ctx.fillStyle = '#100906'; ctx.fillRect(0, 0, W, H);
    // the lamp is outside the frame (low left): only its warm light and haze come in — no floor, nothing for the horn to stand on
    const LX = -W * .12, LY = H * (V ? .62 : .80), fl = 1 + .06 * Math.sin(u * 11) + .04 * Math.sin(u * 23 + 1) + .05 * (P.noise(u * 3, 1) - .5);
    let g = ctx.createRadialGradient(LX, LY, 0, LX, LY, Math.max(W, H) * 1.05);
    g.addColorStop(0, `rgba(255,190,110,${ex * fl})`); g.addColorStop(.18, `rgba(214,130,58,${.85 * ex * fl})`); g.addColorStop(.5, `rgba(126,72,32,${.75 * ex})`); g.addColorStop(1, `rgba(44,26,13,${.7 * ex})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // haze in the lamp's light, drifting
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++) { const hx = W * (.15 + .18 * i) + Math.sin(u * .3 + i) * W * .05, hy = H * (.30 + .1 * Math.sin(i * 1.7)) - u * H * .006, hr = W * (.35 + .1 * (i % 2));
      g = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr); g.addColorStop(0, `rgba(170,100,44,${.10 * ex})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(hx - hr, hy - hr, 2 * hr, 2 * hr); }
    ctx.restore();
    GOLD.bokeh(ctx, { n: 9, seed: 31, x: 0, y: 0, w: W, h: H * .8, r: W * .06, a: .08 * ex, t: u });
    GOLD.bloom(ctx, 0, LY, [255, 170, 80], .45 * ex * fl, { r: Math.max(W, H) * .35, streak: 0, ghosts: false });

    // the horn in 3D: a sphere-swept tube turning about the vertical axis, lit by the flame
    const hcx = W * (V ? .54 : .56), hcy = H * (V ? .40 : .44), L = V ? W * .70 : H * .70;
    const yaw = -.75 + u * .45, tilt = -.18 + .32 * eio(clamp((u - 1.3) / .9));            // turns; at the end its tip starts to dip (next cut pours)
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
    const bead = ss(.15, 1.5, u);
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
    const ex = o.fade === 0 ? 1 : ss(0, o.fade || .35, u), z = 1 + (o.lead ? .24 : .14) * u / dur, pan = (u / dur - .5) * U * (o.lead ? .18 : .10);
    // the anointed
    const ah = U * o.aH, ax = cx + U * .16;
    const aTop0 = gy - ah * (o.aKind === 'priest' ? 1.04 : .99);
    const tip = [ax - ah * .02, aTop0 - U * (o.gap || .19)], pH = o.pH || 1;
    const sun = o.sun(W, H, gy, ax, U);
    const fyFocus = tip[1] + U * .1;
    // world
    ctx.save(); camera(ctx, W, H, z, ax, fyFocus); ctx.translate(-pan, 0);
    o.back(ctx, W, H, gy, sun, u, U, ex);
    groundLight(ctx, W, H, gy, ex);
    // the pour: vessel tilts in (0–1.2), oil starts (1.0–1.7) and keeps flowing
    const lead = o.lead || 0, ui = u - lead;
    const walkK = lead ? eio(clamp(u / (lead - .9))) : 1, liftK = lead ? eio(clamp((u - (lead - 1.5)) / 1.5)) : 1;
    const tiltIn = eio(clamp(ui / 1.2)), flow = ss(.9, 1.6, ui);
    const sx = tip[0] - U * (o.sxOff || .42) - U * .55 * (1 - walkK);
    const pre = o.preTilt == null ? .3 : o.preTilt, vangP = (o.pourAng || -2.6) - pre * (1 - tiltIn);
    const vtipP = [tip[0] - U * .05 * pre / .3 * (1 - tiltIn), tip[1] - U * .03 * pre / .3 * (1 - tiltIn)];
    // carried in front of the chest, tip up so nothing spills; then lifted and turned over the young man's head
    // (the horn first comes out in front of him, then turns over: its wide end never passes over his own head)
    const cr = o.carry || [.15, .84, 1.25], posK = o.posEase ? o.posEase(liftK) : liftK, angK = o.angEase ? o.angEase(liftK) : liftK;
    const vang = lerp(cr[2], vangP + 6.2832, angK), vtip = [lerp(sx + U * cr[0] * pH, vtipP[0], posK), lerp(gy - U * cr[1] * pH, vtipP[1], posK)];
    // vessel first into a scratch path to know where the hands go: draw it after the bodies (it is in front)
    const ghost = GH || (GH = P.canvas(2, 2).getContext('2d'));
    const vs = o.vessel === 'jar' ? GOLD.jar(ghost, vtip[0], vtip[1], U * .16, vang) : GOLD.horn(ghost, vtip[0], vtip[1], U * (o.hornL || .34), vang, { curl: o.hornCurl || .7, wide: .11 });
    const gi = o.vessel === 'jar' ? [Math.round((vs.C.length - 1) * .42), Math.round((vs.C.length - 1) * .9)] : (o.grip || [.35, .75]).map(k => Math.round((vs.C.length - 1) * k));
    const grip = i => { const [x, y, a, w] = vs.C[i]; return [x + Math.sin(a) * w * .2, y - Math.cos(a) * w * .2]; };
    const pourer = figure(ctx, { x: sx, y: gy, h: U * pH, d: 1, kind: 'elder', stoop: o.pStoop == null ? .5 : o.pStoop, bow: o.pBow == null ? .3 : o.pBow, walk: walkK < 1 ? u * 4.5 : null, hands: [grip(gi[0]), grip(gi[1])], light: sun, rim: o.rim, glow: .6 });
    const anointed = figure(ctx, { ...(o.aFig || {}), x: ax, y: gy, h: ah, d: -1, kind: o.aKind, bow: lead ? lerp(.05, .55, ss(lead - 1.2, lead + .2, u)) : .55, light: sun, rim: o.rim, glow: .6 });
    if (o.aKind === 'priest') o.priestGold(ctx, anointed, ah, u);
    // the vessel in their hands, then the oil: a stream to the crown and running down the head
    if (o.vessel === 'jar') GOLD.jar(ctx, vtip[0], vtip[1], U * .16, vang, { rim: o.rim, light: Math.atan2(sun[1] - vtip[1], sun[0] - vtip[0]) });
    else GOLD.horn(ctx, vtip[0], vtip[1], U * (o.hornL || .34), vang, { curl: o.hornCurl || .7, wide: .11, rim: o.rim, light: Math.atan2(sun[1] - vtip[1], sun[0] - vtip[0]) });
    // hands drawn again over the vessel (fingers wrap it)
    ctx.fillStyle = '#0d0704'; pourer.hands.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, U * pH * .024, 0, 6.2832); ctx.fill(); });
    { const m = ctx.getTransform(), q = m.transformPoint(new DOMPoint(anointed.crown[0], anointed.crown[1])); SRC = [q.x, q.y, U * m.a]; }   // (for goldRecall)
    if (o.after) {                       // recalled in part 5: the pour is over — the oil lies on his head and catches the light
      headOil(ctx, anointed, -1, .9, u, U * .007);
      GOLD.bloom(ctx, anointed.crown[0], anointed.crown[1], [255, 196, 110], .4, { r: U * .22, streak: .2, ghosts: false });
    } else if (flow > 0) {
      const crown = anointed.crown;
      GOLD.stream(ctx, GOLD.path(vtip[0], vtip[1], crown[0], crown[1] + U * .005), flow, { w: U * .011, t: u, back: true, glints: 3, speed: U * .5 });
      headOil(ctx, anointed, -1, ss(1.5, dur - lead, ui) * .9, u, U * .007);
      GOLD.bloom(ctx, crown[0], crown[1], [255, 196, 110], .45 * flow, { r: U * .22, streak: .2, ghosts: false });
    }
    ctx.restore();
    GOLD.bloom(ctx, ...toScr(sun, z, ax, fyFocus), [255, 170, 80], .35 * ex, { r: U * .5, streak: 0 });
    GOLD.motes(ctx, u * 2.2, { n: 130, seed: o.seed || 3, light: [...toScr(sun, z, ax, fyFocus), W * .8], a: ex, size: 1.2 });
    GOLD.glow(ctx, .5, { wide: .5 });
    GOLD.finish(ctx, u, { vignette: .5 });
    if (ex < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - ex})`; ctx.fillRect(0, 0, W, H); }
    return { pourer, anointed };
  }
  let GH = null, BEAM = null, SRC = [0, 0, 1], OFF = null, RISE = null;
  const toScr = (p, z, fx, fy) => [fx + (p[0] - fx) * z, fy + (p[1] - fy) * z];

  // David: Bethlehem hills at sunset, his brothers on the slope behind
  const DAVID = {
    // Samuel stands back from the boy: both arms reach forward and up from the shoulder (upper arm, elbow, forearm against the sky),
    // the horn held above the BOY's head, tilted to pour — never over his own head (관리자 6차 #4)
    dur: 13.3, lead: 5.7, fade: 0, aFig: { tunic: true, staff: true }, aKind: 'youth', aH: .70, pH: .90, gap: .06, sxOff: .37, hornL: .24, pourAng: -2.3, hornCurl: .15, vessel: 'horn', rim: [255, 184, 100], seed: 4,
    pStoop: .2, pBow: .15, preTilt: .1, grip: [.27, .64], carry: [.17, .70, 1.45], posEase: p => eo(clamp(p / .7)), angEase: p => eio(clamp((p - .3) / .7)),
    sun: (W, H, gy, ax, U) => [ax + U * .02, gy - U * .30],
    back(ctx, W, H, gy, sun, u, U, ex) {
      dusk(ctx, W, H, gy - U * .2, sun, { top: '#2c1812', mid: '#8a4420', low: '#eea050' });
      ridge(ctx, W, H, gy - U * .24, U * .18, .002, 3, 'rgba(150,74,36,.55)');
      ridge(ctx, W, H, gy - U * .16, U * .16, .0028, 8, 'rgba(96,44,20,.75)');
      // a few roofs of Bethlehem far on the ridge (tiny, no lights)
      ridge(ctx, W, H, gy - U * .06, U * .10, .0035, 13, 'rgba(46,22,11,.92)');
      // the brothers, smaller, standing on the slope behind
      const bros = [[-1.05, .58, 1], [-.80, .62, 1], [.62, .60, -1], [.88, .56, -1], [1.12, .59, -1]];
      bros.forEach(([dx, hh, d], i) => figure(ctx, { cloth: i % 2 === 0, x: W * .5 + dx * U, y: gy - U * .045, h: U * hh, d, kind: 'man', bow: .1 * Math.sin(u * .7 + i), light: sun, rim: [255, 170, 90], fill: '#1c0e07' }));
      ctx.fillStyle = '#100804'; ctx.beginPath(); ctx.moveTo(-W * .6, H * 2); ctx.lineTo(-W * .6, gy + U * .01);
      for (let x = -W * .6; x <= W * 1.6; x += 14) ctx.lineTo(x, gy - U * .012 * P.noise(x * .02, 4) + (x > W * .2 && x < W * .8 ? 0 : U * .03 * Math.abs(x / W - .5)));
      ctx.lineTo(W * 1.6, H * 2); ctx.fill();
      // grass blades on the near ground, backlit
      ctx.strokeStyle = 'rgba(30,15,7,1)'; ctx.lineWidth = 1.5; const R = P.rng(9);
      for (let i = 0; i < 220; i++) { const x = -W * .3 + R() * W * 1.6, h2 = U * (.02 + .04 * R()), lean = (R() - .5) * .5 + .08 * Math.sin(u * 1.3 + x * .01); ctx.beginPath(); ctx.moveTo(x, gy + 2); ctx.quadraticCurveTo(x + lean * h2 * .5, gy - h2 * .6, x + lean * h2, gy - h2); ctx.stroke(); }
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

  function priestFront(ctx, f, u) {       // Aaron facing the viewer, head bowed; the gold of his garments catches the lamplight
    const h = f.h, x = f.x, y = f.y, bw = f.bow || 0, T = (lx, ly) => [x + lx * h, y + ly * h];
    const parts = [];
    const R = [[-.06, -.86], [-.125, -.82], [-.15, -.77], [-.135, -.56], [-.145, -.30], [-.20, -.03], [-.19, 0], [.19, 0], [.20, -.03], [.145, -.30], [.135, -.56], [.15, -.77], [.125, -.82], [.06, -.86]];
    const rp = new Path2D(), q = R.map(([a, b]) => T(a, b)); rp.moveTo((q[0][0] + q[q.length - 1][0]) / 2, (q[0][1] + q[q.length - 1][1]) / 2);
    for (let i = 0; i < q.length; i++) { const n = q[(i + 1) % q.length]; rp.quadraticCurveTo(q[i][0], q[i][1], (q[i][0] + n[0]) / 2, (q[i][1] + n[1]) / 2); } rp.closePath(); parts.push(rp);
    const hr = .064 * h, hc = T(0, -.912 + bw * .035), nk = new Path2D(); nk.rect(x - .035 * h, hc[1], .07 * h, T(0, -.85)[1] - hc[1]); parts.push(nk);
    const hp = new Path2D(); hp.arc(hc[0], hc[1], hr, 0, 6.2832); parts.push(hp);
    // arms in wide sleeves hanging at his sides, a little apart from the body
    for (const sd of [-1, 1]) { const S = T(sd * .14, -.79), E = T(sd * .205, -.63), Hd = T(sd * .19, -.47);
      parts.push(limb([S, E, Hd], [.045 * h, .04 * h, .05 * h])); const j = new Path2D(); j.arc(E[0], E[1], .04 * h, 0, 6.2832); j.moveTo(S[0] + .045 * h, S[1]); j.arc(S[0], S[1], .045 * h, 0, 6.2832); j.moveTo(Hd[0] + .024 * h, Hd[1] + .012 * h); j.arc(Hd[0], Hd[1] + .012 * h, .024 * h, 0, 6.2832); parts.push(j); }
    // the turban of fine linen (Ex 28:39): white cloth wound round the head, soft and full
    const mw = hr * 1.25, mt = hc[1] - hr - .065 * h, mb = hc[1] - hr * .3, m = new Path2D();
    m.moveTo(hc[0] - mw * .92, mb); m.bezierCurveTo(hc[0] - mw * 1.2, mb - hr * .8, hc[0] - mw * .85, mt - hr * .05, hc[0], mt); m.bezierCurveTo(hc[0] + mw * .85, mt - hr * .05, hc[0] + mw * 1.2, mb - hr * .8, hc[0] + mw * .92, mb);
    m.quadraticCurveTo(hc[0], mb + hr * .22, hc[0] - mw * .92, mb); m.closePath();
    const lx = f.light[0] - x, ly = f.light[1] - (y - h * .5), ll = Math.hypot(lx, ly) || 1, o = Math.max(1.5, h * .006);
    ctx.save(); ctx.translate(lx / ll * o, ly / ll * o); ctx.fillStyle = css(f.rim, .95); ctx.shadowColor = css(f.rim, .7); ctx.shadowBlur = h * .06; parts.forEach(p => ctx.fill(p)); ctx.restore();
    ctx.fillStyle = '#120a05'; parts.forEach(p => ctx.fill(p));
    // the linen: pale cloth, the lamplight through its edge, the wraps crossing as soft folds
    ctx.save(); ctx.translate(lx / ll * o * 1.5, ly / ll * o * 1.5); ctx.fillStyle = css(f.rim, .95); ctx.shadowColor = css(f.rim, .8); ctx.shadowBlur = h * .05; ctx.fill(m); ctx.restore();
    const lg = ctx.createLinearGradient(0, mt, 0, mb + hr * .2); lg.addColorStop(0, 'rgb(214,190,160)'); lg.addColorStop(.5, 'rgb(150,128,104)'); lg.addColorStop(1, 'rgb(96,80,64)'); ctx.fillStyle = lg; ctx.fill(m);
    ctx.save(); ctx.clip(m); ctx.strokeStyle = 'rgba(70,52,38,.5)'; ctx.lineWidth = Math.max(1.2, h * .004);
    for (let i = 0; i < 6; i++) { const t0 = i / 6, yA = lerp(mb, mt, t0) + hr * .15, yB = lerp(mb, mt, t0 + .28) + hr * .1; ctx.beginPath(); ctx.moveTo(hc[0] - mw * 1.1, i % 2 ? yA : yB); ctx.bezierCurveTo(hc[0] - mw * .3, (i % 2 ? yA : yB) + hr * .2, hc[0] + mw * .3, (i % 2 ? yB : yA) + hr * .2, hc[0] + mw * 1.1, i % 2 ? yB : yA); ctx.stroke(); }
    ctx.restore();
    const gold = (a) => `rgba(255,${200},${120},${a})`, glint = (gx, gy, r, a) => { const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r); g.addColorStop(0, `rgba(255,236,170,${a})`); g.addColorStop(.4, `rgba(255,190,90,${a * .5})`); g.addColorStop(1, 'rgba(255,180,80,0)'); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(gx - r, gy - r, 2 * r, 2 * r); ctx.restore(); };
    const lw = Math.max(1.5, h * .006), sh = .0;
    // the ephod: shoulder pieces down to the breastpiece, onyx stones on the shoulders, the woven band at the waist
    ctx.strokeStyle = gold(.75); ctx.lineWidth = lw * 1.4; ctx.lineCap = 'round';
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(...T(sd * .105, -.815)); ctx.lineTo(...T(sd * .06, -.735)); ctx.stroke(); glint(...T(sd * .11, -.81), h * .03, .7); }
    ctx.beginPath(); ctx.moveTo(...T(-.13, -.555)); ctx.quadraticCurveTo(...T(0, -.545), ...T(.13, -.555)); ctx.stroke();
    ctx.globalAlpha = .55; ctx.beginPath(); ctx.moveTo(...T(-.13, -.535)); ctx.quadraticCurveTo(...T(0, -.525), ...T(.13, -.535)); ctx.stroke(); ctx.globalAlpha = 1;
    // the breastpiece: a square of gold settings, twelve stones in four rows of three (Ex 28:15–21)
    const b0 = T(-.06, -.735), bs = .12 * h; ctx.strokeStyle = gold(.9); ctx.lineWidth = lw; ctx.strokeRect(b0[0], b0[1], bs, bs);
    const stones = [[255, 120, 90], [255, 214, 140], [140, 220, 170], [255, 160, 100], [150, 170, 255], [255, 240, 220], [255, 170, 110], [210, 255, 200], [200, 140, 255], [255, 220, 120], [255, 190, 150], [170, 255, 230]];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const sx = b0[0] + bs * (.2 + c * .3), sy = b0[1] + bs * (.14 + r * .24), st = stones[r * 3 + c], tw = .55 + .35 * Math.sin(u * 2.5 + r * 1.3 + c * 2.1);
      ctx.fillStyle = `rgba(${st[0]},${st[1]},${st[2]},${.55 * tw + .2})`; ctx.fillRect(sx - bs * .07, sy - bs * .07, bs * .14, bs * .12); }
    glint(b0[0] + bs * .5, b0[1] + bs * .4, bs * 1.1, .35);
    // the gold plate on the front of the turban
    ctx.fillStyle = 'rgba(236,180,96,.95)'; ctx.fillRect(hc[0] - hr * .28, mb - hr * .42, hr * .56, hr * .2); glint(hc[0], mb - hr * .32, hr * .55, .3);
    return { head: [hc[0], hc[1], hr], crown: [hc[0], mt], top: mt, tw: mw };
  }
  function aaronScene(ctx, u, after) {
    const W = P.W, H = P.H, V = P.ori === 'v', dur = 4.1;
    const U = V ? .30 * H : .48 * H, gy = H * (V ? .62 : .80);
    const ex = ss(0, .35, u), z = 1 + .12 * u / dur, pan = (u / dur - .5) * U * .08;
    const ax = W * .5 + U * .14, ah = U * .96, bow = .6;
    const lamp = [ax - U * .1, gy - U * .75];                         // the lampstand's glow, behind the screen
    // where Aaron's turban ends, and the jug above it
    const hc = gy + (-.912 + bow * .035) * ah, mtop = hc - .064 * ah - .065 * ah, tip = [ax - U * .01, mtop - U * .07];
    const fy = tip[1] + U * .2;
    ctx.save(); camera(ctx, W, H, z, ax, fy); ctx.translate(-pan, 0);
    ctx.fillStyle = '#1c100a'; ctx.fillRect(-W, -H, W * 3, H * 3);
    // the screen of the door fills the frame: woven, lit from within, hanging in folds
    const x0 = -W, x1 = W * 2, y0 = -H;
    let g = ctx.createRadialGradient(lamp[0], lamp[1], 0, lamp[0], lamp[1], U * 1.7); g.addColorStop(0, 'rgba(255,224,160,1)'); g.addColorStop(.3, 'rgba(240,160,80,1)'); g.addColorStop(.75, 'rgba(170,90,44,1)'); g.addColorStop(1, 'rgba(110,56,28,1)');
    ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, gy - y0);
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    for (let x = x0; x < x1; x += 3) { const v = .80 + .20 * Math.sin((x - x0) / U * 30 + Math.sin(u * .9 + x * .002) * .4) * (.6 + .4 * P.noise(x * .01, 2)); ctx.fillStyle = `rgb(${255 * v | 0},${238 * v | 0},${224 * v | 0})`; ctx.fillRect(x, y0, 3, gy - y0); }
    [[.16, 'rgba(110,90,160,.5)'], [.21, 'rgba(170,60,70,.45)'], [.26, 'rgba(90,100,170,.45)'], [.74, 'rgba(110,90,160,.35)'], [.78, 'rgba(170,60,70,.32)']].forEach(([f, c]) => { ctx.fillStyle = c; ctx.fillRect(x0, y0 + (gy - y0) * f, x1 - x0, (gy - y0) * .02); });
    ctx.restore();
    // two pillars (gold-covered, bronze bases) framing the door, the tent's covering above
    [ax - U * 1.12, ax + U * 1.02].forEach(px => {
      const pw = U * .075, gp = ctx.createLinearGradient(px - pw, 0, px + pw, 0), lit = px < lamp[0] ? 1 : -1;
      gp.addColorStop(0, lit > 0 ? '#1a0f07' : '#7a5228'); gp.addColorStop(.3, lit > 0 ? '#3a2410' : '#c8964e'); gp.addColorStop(.55, '#5a3a1a'); gp.addColorStop(.8, lit > 0 ? '#c8964e' : '#3a2410'); gp.addColorStop(1, lit > 0 ? '#7a5228' : '#1a0f07');
      ctx.fillStyle = gp; ctx.fillRect(px - pw, -H, pw * 2, gy + H);
      ctx.strokeStyle = 'rgba(30,16,6,.35)'; ctx.lineWidth = 1.5; for (let i = 0; i < 7; i++) { const gx = px - pw * .8 + i * pw * .27; ctx.beginPath(); ctx.moveTo(gx, -H); for (let yy = -H; yy <= gy; yy += 40) ctx.lineTo(gx + 3 * Math.sin(yy * .01 + i), yy); ctx.stroke(); }   // grain under the gold
      ctx.fillStyle = 'rgba(160,110,56,.95)'; ctx.fillRect(px - pw * 1.3, gy - U * .06, pw * 2.6, U * .06);                                      // bronze base
    });
    // the court's sand, warm in the light from the door
    g = ctx.createLinearGradient(0, gy, 0, H * 1.2); g.addColorStop(0, 'rgba(150,90,44,1)'); g.addColorStop(.25, 'rgba(90,54,26,1)'); g.addColorStop(1, 'rgba(40,24,12,1)'); ctx.fillStyle = g; ctx.fillRect(-W, gy, W * 3, H);
    groundLight(ctx, W, H, gy, ex);
    // Moses (as tall as Aaron, side view) pours from the jug; Aaron faces us, head bowed
    const tiltIn = eio(clamp(u / 1.0)), flow = ss(.7, 1.3, u), vang = -2.8 - .35 * (1 - tiltIn);
    const vtip = [tip[0] - U * .04 * (1 - tiltIn), tip[1] - U * .02 * (1 - tiltIn)];
    const ghost = GH || (GH = P.canvas(2, 2).getContext('2d'));
    const vs = GOLD.jar(ghost, vtip[0], vtip[1], U * .15, vang), n = vs.C.length - 1;
    const grip = i => { const [x, y, a, w] = vs.C[i]; return [x + Math.sin(a) * w * .25, y - Math.cos(a) * w * .25]; };
    const mh = U * 1.07, mx = ax - U * .33;
    const moses = figure(ctx, { x: mx, y: gy, h: mh, d: 1, kind: 'elder', stoop: .25, bow: .2, hands: [grip(Math.round(n * .42)), grip(Math.round(n * .9))], light: lamp, rim: [255, 200, 130], glow: .6 });
    const aaron = priestFront(ctx, { x: ax, y: gy, h: ah, bow, light: lamp, rim: [255, 200, 130] }, u);
    GOLD.jar(ctx, vtip[0], vtip[1], U * .15, vang, { rim: [255, 200, 130], light: Math.atan2(lamp[1] - vtip[1], lamp[0] - vtip[0]) });
    ctx.fillStyle = '#0d0704'; moses.hands.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, mh * .024, 0, 6.2832); ctx.fill(); });
    { const m = ctx.getTransform(), q = m.transformPoint(new DOMPoint(aaron.crown[0], aaron.crown[1])); SRC = [q.x, q.y, U * m.a]; }
    if (flow > 0) {
      if (!after) GOLD.stream(ctx, GOLD.path(vtip[0], vtip[1], aaron.crown[0], aaron.crown[1] + U * .004), flow, { w: U * .010, t: u, back: true, glints: 3, speed: U * .5 });
      // the oil runs over the turban's side
      const [hx, hy, hr] = aaron.head, tw = aaron.tw, run = [[hx, aaron.top], [hx + tw * .5, aaron.top + hr * .2], [hx + tw * .95, aaron.top + hr * .8], [hx + tw * 1.0, hy - hr * .25], [hx + hr * 1.0, hy + hr * .5]];
      GOLD.stream(ctx, run, ss(1.1, dur, u) * .85, { w: U * .006, t: u, back: true, glints: 2, speed: hr * 2, taper: .4 });
      GOLD.bloom(ctx, aaron.crown[0], aaron.crown[1], [255, 200, 120], .45 * flow, { r: U * .2, streak: .2, ghosts: false });
    }
    ctx.restore();
    GOLD.bloom(ctx, ...toScr([lamp[0] - pan, lamp[1]], z, ax, fy), [255, 190, 110], .35 * ex, { r: U * .6, streak: 0 });
    GOLD.motes(ctx, u * 2, { n: 120, seed: 6, light: [...toScr([lamp[0] - pan, lamp[1]], z, ax, fy), W * .8], a: ex, size: 1.2 });
    GOLD.glow(ctx, .5, { wide: .5 });
    GOLD.finish(ctx, u, { vignette: .45 });
    if (ex < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - ex})`; ctx.fillRect(0, 0, W, H); }
  }

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
  // a heavy woven mantle as a mesh G[row][col] = [x, y, z] (rows: top edge → hem), backlit by the sun behind it
  function mantle(ctx, G, sun, U, u, fk = 1) {
    const NB = G.length, NA = G[0].length, hem = G[NB - 1];
    const per = [...G[0], ...G.slice(1, -1).map(r => r[NA - 1]), ...hem.slice().reverse(), ...G.slice(1, -1).reverse().map(r => r[0])];
    const path = new Path2D(); per.forEach((q, i) => i ? path.lineTo(q[0], q[1]) : path.moveTo(q[0], q[1])); path.closePath();
    let area = 0; for (let i = 0; i < per.length; i++) { const a = per[i], b = per[(i + 1) % per.length]; area += a[0] * b[1] - b[0] * a[1]; }
    // the fringe at the hem (short knotted threads, hanging with the cloth's fall)
    ctx.save(); ctx.lineCap = 'round';
    const fr = [];
    for (let i = 0; i < NA - 1; i++) for (let k = 0; k < 3; k++) { const t = k / 3, A = hem[i], B = hem[i + 1], A2 = G[NB - 2][i], B2 = G[NB - 2][i + 1];
      const x = lerp(A[0], B[0], t), y = lerp(A[1], B[1], t), dx = x - lerp(A2[0], B2[0], t), dy = y - lerp(A2[1], B2[1], t), dl = Math.hypot(dx, dy) || 1;
      const L = U * (.012 + .006 * P.noise(i * 3 + k, 5)) * fk, ra = .25 * Math.sin(u * 3.5 + i * .7 + k);
      const ux = (dx / dl) * Math.cos(ra) - (dy / dl) * Math.sin(ra), uy = (dx / dl) * Math.sin(ra) + (dy / dl) * Math.cos(ra); fr.push([x, y, x + ux * L, y + uy * L]); }
    ctx.strokeStyle = '#120904'; ctx.lineWidth = Math.max(1.2, U * .003); ctx.beginPath(); fr.forEach(([a, b, c, d]) => { ctx.moveTo(a, b); ctx.lineTo(c, d); }); ctx.stroke();
    ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = 'rgba(255,186,96,.22)'; ctx.lineWidth = Math.max(.8, U * .0013); ctx.beginPath();
    const sd0 = Math.sign(sun[0] - hem[NA >> 1][0]) || 1; fr.forEach(([a, b, c, d]) => { ctx.moveTo(a + sd0, b); ctx.lineTo(c + sd0, d); }); ctx.stroke();
    ctx.restore();
    // thickness: the rolled hem shows as a dark lip under the edge
    ctx.save(); ctx.strokeStyle = '#0b0603'; ctx.lineWidth = U * .011; ctx.lineJoin = ctx.lineCap = 'round'; ctx.beginPath(); hem.forEach((q, i) => i ? ctx.lineTo(q[0], q[1] + U * .003) : ctx.moveTo(q[0], q[1] + U * .003)); ctx.stroke(); ctx.restore();
    // the cloth: each cell lit by how far it turns edge-on toward the sun (the crests of the folds), dark where it faces us
    const base = [17, 9, 5], lit = [196, 110, 46];
    for (let j = 0; j < NB - 1; j++) for (let i = 0; i < NA - 1; i++) {
      const A = G[j][i], B = G[j][i + 1], C = G[j + 1][i + 1], D = G[j + 1][i];
      const ea = [(B[0] - A[0] + C[0] - D[0]) / 2, (B[1] - A[1] + C[1] - D[1]) / 2, (B[2] - A[2] + C[2] - D[2]) / 2];
      const eb = [(D[0] - A[0] + C[0] - B[0]) / 2, (D[1] - A[1] + C[1] - B[1]) / 2, (D[2] - A[2] + C[2] - B[2]) / 2];
      let n = [ea[1] * eb[2] - ea[2] * eb[1], ea[2] * eb[0] - ea[0] * eb[2], ea[0] * eb[1] - ea[1] * eb[0]]; const nl = Math.hypot(...n) || 1; n = n.map(v => v / nl); if (n[2] > 0) n = n.map(v => -v);
      const qx = (A[0] + C[0]) / 2, qy = (A[1] + C[1]) / 2, sx = sun[0] - qx, sy = sun[1] - qy, sl = Math.hypot(sx, sy) || 1, nxy = Math.hypot(n[0], n[1]) || 1e-6;
      const face = clamp((n[0] * sx + n[1] * sy) / (sl * nxy)), rimK = Math.pow(nxy, 1.4) * face;
      const tex = .88 + .24 * P.noise(i * .7 + j * .35, 7), b = j / (NB - 2);
      const side = (n[0] * sx + n[1] * sy) / sl;
      let k = clamp((.07 + 1.1 * rimK + .1 * side) * tex), c = [lerp(base[0], lit[0], k), lerp(base[1], lit[1], k), lerp(base[2], lit[2], k)];
      if ((b > .70 && b < .78) || (b > .84 && b < .88)) c = [c[0] * 1.18 + 7, c[1] * 1.02 + 3, c[2] * .92 + 1];     // two woven bands near the hem
      ctx.fillStyle = ctx.strokeStyle = css(c); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.lineTo(D[0], D[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.save(); ctx.clip(path);
    // the weave: faint warp threads running down the cloth, following its folds
    ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = 'rgba(150,88,44,.05)'; ctx.lineWidth = Math.max(1, U * .0016);
    for (let i = 1; i < NA - 1; i += 2) { ctx.beginPath(); G.forEach((r, j) => j ? ctx.lineTo(r[i][0], r[i][1]) : ctx.moveTo(r[i][0], r[i][1])); ctx.stroke(); }
    // where the wool is thin at the edge the sun comes through it: a warm glow just inside the outline, strongest on the sun's side
    let g = ctx.createRadialGradient(sun[0], sun[1], 0, sun[0], sun[1], U * .7); g.addColorStop(0, 'rgba(230,140,60,.5)'); g.addColorStop(1, 'rgba(120,60,24,.12)');
    ctx.strokeStyle = g; ctx.lineWidth = U * .028; ctx.filter = `blur(${Math.max(1, U * .006).toFixed(1)}px)`; ctx.stroke(path); ctx.filter = 'none';
    ctx.restore();
    // the rim: the backlight along the edge — bright where the edge faces the sun, a thin thread of gold where it faces away
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'butt'; ctx.shadowColor = 'rgba(255,170,70,.85)'; ctx.shadowBlur = U * .03;
    for (let i = 0; i < per.length; i++) {
      const a = per[i], b = per[(i + 1) % per.length], dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1;
      const ox = (area > 0 ? dy : -dy) / dl, oy = (area > 0 ? -dx : dx) / dl, mx = (a[0] + b[0]) / 2 - sun[0], my = (a[1] + b[1]) / 2 - sun[1], ml = Math.hypot(mx, my) || 1;
      const k = (.08 + .92 * Math.pow(clamp(-(ox * mx + oy * my) / ml), .9)) * (.7 + .3 * P.noise(i * .15, 11));
      ctx.strokeStyle = `rgba(255,${190 + 30 * k | 0},${100 + 40 * k | 0},${.35 + .6 * k})`; ctx.lineWidth = Math.max(1.2, U * .0055) * (.45 + .8 * k);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.restore();
  }
  function elishaScene(ctx, u) {
    const W = P.W, H = P.H, V = P.ori === 'v', dur = 4.4;
    const U = V ? .24 * H : .40 * H, gy = H * (V ? .60 : .76);
    const ex = ss(0, .35, u), z = 1 + .10 * u / dur;
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
    // the plough's handle rises back to the ploughman's hands at hip height (the far handle a little behind it)
    const handle = [plX - U * .11, gy - U * .38]; ctx.beginPath(); ctx.moveTo(plX, gy); ctx.lineTo(...handle); ctx.moveTo(plX - U * .01, gy - U * .01); ctx.lineTo(handle[0] - U * .035, handle[1] + U * .01); ctx.stroke();
    ctx.fillStyle = '#0d0704'; ctx.beginPath(); ctx.moveTo(plX - U * .03, gy - U * .02); ctx.lineTo(plX + U * .07, gy + U * .005); ctx.lineTo(plX - U * .02, gy + U * .01); ctx.closePath(); ctx.fill();   // the share                                         // handle
    const elX = handle[0] - U * .15;
    // light from above on Elisha (a single beam) — grows as the mantle comes down
    const bm = ss(2.2, 3.4, u);
    if (bm > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const bxx = elX + U * .78 * .03; const g = ctx.createLinearGradient(bxx - U * .12, 0, bxx + U * .12, 0); g.addColorStop(0, 'rgba(255,200,110,0)'); g.addColorStop(.5, `rgba(255,206,120,${.32 * bm})`); g.addColorStop(1, 'rgba(255,200,110,0)'); ctx.fillStyle = g; ctx.fillRect(bxx - U * .12, -H, U * .24, gy - U * .78 * .9 + H); ctx.restore(); }
    // Elisha: the young ploughman (1 Ki 19:19) — upright, short dark beard, both hands on the plough handles (not leaning on them);
    // as Elijah swings the cloak he turns his head back towards him and looks up
    const eh = U * .78, est = 0, turn = eio(clamp((u - 1.7) / .45));
    const elFig = { x: elX, y: gy, h: eh, d: 1, kind: 'man', tunic: true, bow: .1 - .25 * turn, hs: 1 - 1.85 * turn, stoop: est, walk: u * 3,
      hands: [handle, [handle[0] - U * .035, handle[1] + U * .012]], light: sun, rim: [255, 180, 100], glow: .4 + .5 * ss(2.0, 3.2, u) };
    const elisha = figure(ctx, elFig);
    // Elijah's mantle (1 Ki 19:19): a heavy woven cloth, not a sheet or a board. One simple throw (관리자 6차 #1): he stands holding it
    // folded over his forearm (his arm out in front of him, clear of his body), draws the arm down and back a little as the cloth slips into
    // his hand, swings it forward and up once and lets go; the cloak flies a short soft arc on its own and settles over Elisha's shoulders
    // and back from behind. It never circles his own body and never passes over Elisha's head.
    const t1 = 2.5, NA = 33, NB = 21;
    const Te = (lx, ly) => { if (ly < -.5) lx += est * Math.pow((-ly - .5) / .45, 2) * .08; return [elX + lx * eh, gy + ly * eh]; };
    const bez = (p0, c, p1, s) => [(1 - s) * (1 - s) * p0[0] + 2 * (1 - s) * s * c[0] + s * s * p1[0], (1 - s) * (1 - s) * p0[1] + 2 * (1 - s) * s * c[1] + s * s * p1[1]];
    // at rest: the top edge round the back of the neck and over the shoulder, the cloth falling over the round of the shoulder and the upper
    // arm, then hanging (heavy) in a few deep folds — longer behind than in front, the hem and the sides soft and uneven
    const rT = [Te(.085, -.765), Te(-.035, -.862), Te(-.17, -.775)], rB = [Te(.15, -.54), Te(-.02, -.38), Te(-.185, -.26)];
    const since = u - t1, swing = since > 0 ? Math.sin(since * 6.2) * Math.exp(-since * 2.6) : 0;
    const rest = (s, b) => {          // s 0 front → 1 back, b 0 shoulders → 1 hem
      const tp = bez(...rT, s), bt = bez(...rB, s), fb = Math.pow(b, .7);
      const ctl = [lerp(tp[0], bt[0], .35) + (.5 - s) * 2 * eh * .028, lerp(tp[1], bt[1], .22)];
      const p = bez(tp, ctl, bt, b);
      const ph = s * Math.PI * 3.3 + .5, ph2 = s * Math.PI * 5.1 + 1.3, fold = Math.sin(ph) + .3 * Math.sin(ph2), dfold = Math.cos(ph) + .45 * Math.cos(ph2);
      const z = dfold * eh * .035 * fb - Math.sin(b * Math.PI) * eh * .02;
      const edge = Math.pow(Math.abs(1 - 2 * s), 6);                                                       // the side edges wave
      return [p[0] + fold * eh * .02 * fb + swing * eh * .045 * Math.pow(b, 1.5) + Math.sin(u * 1.7 + b * 2) * eh * .003 * b
          + edge * eh * .03 * Math.sin(b * 5.1 + s * 3) * b,
        p[1] + fold * eh * .012 * b * b + (1 - fold) * eh * .022 * b * b + (P.noise(s * 6, 3) - .5) * eh * .06 * b * b - Math.abs(swing) * eh * .012 * b * b, z];
    };
    // Elijah, at the left, facing Elisha's back; his near hand in polar coordinates about the shoulder [angle, radius / U]
    const ejX = elX - U * .62, eSt = .3;
    const sh = [ejX + U * (.01 + eSt * Math.pow(.285 / .45, 2) * .08 + .01), gy - U * .785];
    const A0 = [.52, .335], A1 = [.92, .345], A2 = [-.15, .33], A3 = [-.25, .32], A4 = [1.15, .27];
    const mixA = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
    const es = x => .5 - .5 * Math.cos(Math.PI * clamp(x));                                        // one even swing, no whip
    const armA = t => t < 1.36 ? A0 : t < 1.74 ? mixA(A0, A1, es((t - 1.36) / .38)) : t < 2.24 ? mixA(A1, A2, es((t - 1.74) / .5))
      : t < 2.4 ? mixA(A2, A3, eo((t - 2.24) / .16)) : mixA(A3, A4, eio(clamp((t - 2.4) / .6)));
    const HD = t => { const [a, r] = armA(t); return [sh[0] + Math.cos(a) * r * U, sh[1] + Math.sin(a) * r * U]; };
    const elijah = figure(ctx, { x: ejX, y: gy, h: U, d: 1, kind: 'elder', stoop: eSt, hands: [HD(u), null], light: sun, rim: [255, 180, 100] });
    // where the cloth is held: over the forearm (under it, past the elbow), then gathered in the hand; free after tr
    const tr = 2.0, Tf = t1 - tr, gat = t => ss(1.36, 1.74, t);
    const heldC = t => { const Hd = HD(t), E = ik(sh, Hd, U * .19, U * .17, true).E, k = gat(t);
      return [lerp(lerp(E[0], Hd[0], .6), Hd[0], k), lerp(lerp(E[1], Hd[1], .6) + U * .035, Hd[1] + U * .012, k)]; };
    const Pr = heldC(tr), rc0 = rest(.5, 0), C1 = [Pr[0] + U * .10, Pr[1] - U * .10], C2 = [rc0[0] - U * .12, rc0[1] - U * .09];
    const fx = t => { const x = clamp((t - tr) / Tf); return x * (2 - x); };                       // slows as it settles
    const bz3 = p => { const q = 1 - p, a = q * q * q, b2 = 3 * q * q * p, c = 3 * q * p * p, d = p * p * p; return [a * Pr[0] + b2 * C1[0] + c * C2[0] + d * rc0[0], a * Pr[1] + b2 * C1[1] + c * C2[1] + d * rc0[1]]; };
    const topC = t => t <= tr ? heldC(t) : bz3(fx(t));
    const flyK = t => ss(tr - .04, tr + .12, t) * (1 - ss(t1 - .22, t1 + .05, t));
    const Vs = U * .9;
    const gdir = t => { const a = topC(t), b = topC(t - .03), vx = (a[0] - b[0]) / .03, vy = (a[1] - b[1]) / .03;   // the cloth trails behind its held edge: weight + drag
      let x = -vx / Vs, y = (1 - .6 * flyK(t)) - vy / Vs; let l = Math.hypot(x, y) || 1; const k = ss(tr + .05, t1 - .08, t);   // the weight takes over through the second half of the flight
      x = lerp(x / l, 0, k); y = lerp(y / l, 1, k); l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
    // the sheet: top-edge centre, half-widths (top/hem) and length change with the phase — folded on the arm, gathered in the hand, opening in the air
    const gk = gat(u), ok = ss(tr + .05, t1, u), fk0 = flyK(u);
    const wT = U * lerp(lerp(.095, .022, gk), .105, ok), wH = U * lerp(lerp(.105, .085, gk), .115, ss(tr, t1, u)), Lh = U * lerp(lerp(.23, .29, gk), .33, ss(tr, t1, u));
    const F = [], T0 = topC(u), cD = .1;
    let cx = T0[0], cy = T0[1];
    for (let j = 0; j < NB; j++) {
      const b = j / (NB - 1), t = u - cD * b, fk = flyK(t);
      let [gx, gy2] = gdir(t);
      const del = ((.05 + .22 * fk) * Math.sin(Math.PI * 2 * 1.1 * b - 8 * u) + .04 * Math.sin(u * 1.3 + b * 2)) * (.15 + .85 * b), cd = Math.cos(del), sd = Math.sin(del);
      [gx, gy2] = [gx * cd - gy2 * sd, gx * sd + gy2 * cd];
      if (j) { const seg = Lh / (NB - 1); cx += gx * seg; cy += gy2 * seg; }
      const ex = gy2, ey = -gx;                                                                      // across the cloth, square to its fall (never edge-on)
      const w = lerp(wT, wH, Math.pow(b, .6)) * (1 + .1 * Math.sin(b * 6 - u * 3) * fk);
      const row = [];
      for (let i = 0; i < NA; i++) {
        const s = i / (NA - 1), a = 1 - 2 * s, fo = Math.sin(s * Math.PI * 3.3 + .5);
        const lag = -U * .045 * a * a * fk * (.4 + .6 * b) + U * .02 * b * fk * Math.sin(Math.PI * 2 * 1.4 * s - 7 * u + 3 * b)   // in the air the corners trail, the hem flutters
          + U * (.03 * (1 - fk) + .012) * b * b * fo + U * .02 * b * b * (P.noise(s * 5 + 2, 9) - .5);                  // the hem scalloped by its folds, uneven
        const side = U * .012 * b * Math.sin(s * Math.PI * 4.4 + 1.7 + u * 2) + U * .015 * Math.pow(Math.abs(a), 5) * Math.sin(b * 6 + u * 2.5) * b;  // the sides not straight
        const z = U * .04 * fo * Math.min(1, b * 3) * (1 - .5 * fk) + U * .03 * fk * Math.cos(Math.PI * 2 * 1.1 * b - 8 * u + 2.4 * s) * (.25 + .75 * b) + U * .035 * fk * Math.sin(Math.PI * s) * Math.sin(Math.PI * b);
        row.push([cx + a * w * ex + gx * lag + ex * side, cy + a * w * ey + gy2 * lag + ey * side, z]);
      }
      F.push(row);
    }
    const G = [];
    for (let j = 0; j < NB; j++) { const b = j / (NB - 1), land = ss(t1 - .3 + .08 * b, t1 + .2 + .3 * b, u), row = [];
      for (let i = 0; i < NA; i++) { const s = i / (NA - 1), Fp = F[j][i], R = rest(s, b); row.push([lerp(Fp[0], R[0], land), lerp(Fp[1], R[1], land), lerp(Fp[2], R[2], land)]); }
      G.push(row); }
    mantle(ctx, G, sun, U, u, .3 + .7 * ss(t1 - .1, t1 + .6, u));
    { const m = ctx.getTransform(), c0 = G[5][NA >> 1], q = m.transformPoint(new DOMPoint(c0[0], c0[1])); SRC = [q.x, q.y, U * m.a]; }   // (for goldRecall: the cloak on his shoulders)
    // while he holds it, his arm lies over the cloth (it hangs from his forearm, then from his hand)
    if (u < tr + .02) {
      const Hd = elijah.hands[0], E = elijah.elbows[0], s0 = [sh[0], sh[1]];
      ctx.fillStyle = '#0d0704'; ctx.fill(limb([s0, E, Hd], [.05 * U, .04 * U, .042 * U]));
      ctx.beginPath(); ctx.arc(E[0], E[1], .041 * U, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.arc(Hd[0], Hd[1], U * .027, 0, 6.2832); ctx.fill();
    }
    // the cloak comes down from behind him: it passes behind his head, never over it (his head and neck drawn again over the cloth)
    { const [hx, hy, hr] = elisha.head; ctx.save(); ctx.beginPath(); ctx.rect(hx - hr * 2.2, hy - hr * 3, hr * 4.4, hr * 4.05); ctx.clip(); figure(ctx, { ...elFig, glow: 0 }); ctx.restore(); }
    ctx.restore();
    GOLD.bloom(ctx, ...toScr(sun, z, W * .5 + U * .1, gy - U * .6), [255, 170, 80], .3 * ex, { r: U * .45, streak: 0 });
    GOLD.motes(ctx, u * 2, { n: 110, seed: 17, light: [W * .5, gy - U * .4, W * .8], a: ex, size: 1.2 });
    GOLD.glow(ctx, .5, { wide: .5 });
    GOLD.finish(ctx, u, { vignette: .5 });
    if (ex < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - ex})`; ctx.fillRect(0, 0, W, H); }
  }

  // ---------------- 5부 climax: soft light (quarter resolution, blurred, screened — never a hard-edged beam) ----------------
  const lerpC = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  function softLight(ctx, draw, o = {}) {
    const W = P.W, H = P.H, q = .25, bw = Math.round(W * q), bh = Math.round(H * q), [z, fx, fy] = o.cam || [1, 0, 0];
    if (!RISE || RISE.c.width !== bw || RISE.c.height !== bh) { const c = P.canvas(bw, bh), c2 = P.canvas(bw, bh); RISE = { c, x: c.getContext('2d'), c2, x2: c2.getContext('2d') }; }
    const g = RISE.x; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, bw, bh);
    g.setTransform(q * z, 0, 0, q * z, q * fx * (1 - z), q * fy * (1 - z)); g.globalCompositeOperation = 'lighter';
    draw(g);
    const g2 = RISE.x2; g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalCompositeOperation = 'copy'; g2.filter = `blur(${Math.max(1, Math.round(Math.max(bw, bh) * (o.blur || .012)))}px)`; g2.drawImage(RISE.c, 0, 0); g2.filter = 'none'; g2.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; ctx.imageSmoothingEnabled = true; ctx.drawImage(RISE.c2, 0, 0, W, H); ctx.restore();
  }
  const blob = (g, x, y, r, col, a, sy = 1) => { if (a <= .002 || r < .5) return; g.save(); g.translate(x, y); g.scale(1, sy); const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, css(col, Math.min(1, a))); gr.addColorStop(.45, css(col, Math.min(1, a) * .38)); gr.addColorStop(1, css(col, 0)); g.fillStyle = gr; g.fillRect(-r, -r, 2 * r, 2 * r); g.restore(); };

  // the anointing rises: from the oil on the head (or the cloak on the shoulders) a stream of gold light lifts out of the scene and up
  // past the top of the frame — soft lumps of light flowing upward, wavering, widening and paling as they go; sparks drift up with it
  function riseLight(ctx, src, u, S, o = {}) {
    const H = P.H, gold = [255, 192, 104], pale = [255, 236, 200], top = -H * .15, len = src[1] - top, reach = eo(clamp((u - .25) / 1.7)), on = ss(0, .7, u), w0 = o.w0 || .05;
    softLight(ctx, g => {
      blob(g, src[0], src[1], S * (w0 * 2.2 + .08 * reach), gold, .5 * on);                                             // the oil itself glows
      blob(g, src[0], src[1] - S * .06, S * (w0 * 3.5 + .12 * reach), [255, 176, 90], .22 * on);
      const n = 70;
      for (let i = 0; i < n; i++) {
        const s = ((i / n) + u * .24) % 1; if (s > reach) continue;                                                  // flowing upward
        const y = src[1] - s * len, x = src[0] + S * (.06 * Math.sin(s * 4.6 - u * 1.2 + 1.3) * s + .05 * (P.noise(s * 2.4 - u * .35, 7) - .5) * s);
        const a = .3 * Math.pow(1 - s, 1.7) * clamp((reach - s) / .12) * on, r = S * (w0 + .11 * s);      // brightest at the oil, thinning as it rises
        blob(g, x, y, r, lerpC(gold, pale, ss(.1, .8, s)), a, 1.5);
      }
    }, { blur: .014 });
    // sparks carried up in it (full resolution, tiny)
    ctx.save(); ctx.globalCompositeOperation = 'screen'; const R = P.rng(o.seed || 23);
    for (let i = 0; i < 46; i++) { const sp = .12 + .2 * R(), ph = R(), s = (ph + u * sp) % 1, sx = (R() - .5) * 2; if (s > reach * 1.05) continue;
      const y = src[1] - s * len * .9, x = src[0] + S * (sx * (.03 + .14 * s) + .06 * Math.sin(s * 4.6 - u * 1.2 + 1.3) * s), a = (1 - s) * on * (.4 + .6 * Math.abs(Math.sin(u * 3 + i)));
      ctx.fillStyle = css(lerpC([255, 214, 140], [255, 244, 222], s), .8 * a); ctx.beginPath(); ctx.arc(x, y, Math.max(1, S * .005 * (1.3 - s)), 0, 6.2832); ctx.fill(); }
    ctx.restore();
    GOLD.bloom(ctx, src[0], src[1], [255, 200, 120], .35 * on, { r: S * .35, streak: .1, ghosts: false });
  }

  // a part-2 anointing remembered (film 148–155.8, u 0..~3.4): the scene already after the anointing, in its own look, a slow push-in,
  // and the gold of the oil / the cloak rising out of it as a stream of light — "this one's anointing rises". No replay of the pour or the throw.
  function goldRecall(ctx, u, which) {
    const W = P.W, H = P.H;
    if (!OFF || OFF.width !== W || OFF.height !== H) OFF = P.canvas(W, H);
    const o = OFF.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.filter = 'none';
    let w0 = .05;
    if (which === 'david') pourScene(o, 11.4 + u * .3, { ...DAVID, after: true });
    else if (which === 'aaron') aaronScene(o, 3.5 + u * .15, true);
    else { elishaScene(o, 3.6 + u * .3); w0 = .09; }
    const src = SRC.slice(), z = 1 + .12 * eio(clamp(u / 3.4));
    ctx.save(); ctx.setTransform(z, 0, 0, z, src[0] * (1 - z), src[1] * (1 - z)); ctx.drawImage(OFF, 0, 0); ctx.restore();
    riseLight(ctx, src, u, src[2] * z, { w0, seed: which.length * 7 });
  }

  // ---------------- 5부: "세 직분이, 한 분에게" (film 155.4–160.4, u 0..5.2) ----------------
  // A dawn sky over a real horizon. The three remembered lights come in from three directions (the hill's from the left, the tent's from
  // high on the right, the field's from the low right), each arriving at its own moment, and are taken into ONE light low over a far hill:
  // as they arrive that light turns from the oil's amber to the pale, soft, dove-like light of the Jordan (jordan3d.js 'spirit': cream-white
  // core, wing-glows, a cool pale haze — Acts 10:38: the oil pointed ahead to the anointing God gave by the Spirit). It is not a sum of three
  // lights and makes no triple sign: the streams fade into it as they arrive. That light becomes the sun rising behind the far hill, where a
  // small EMPTY cross stands as a backlit silhouette, a little to the side of the sun (the light is the sunrise behind it, never stuck on it).
  // No person anywhere. Peak ≈ u 2.1–3.1, then a still breath with the dawn spreading — haze and dust keep moving.
  function goldThree(ctx, u) {
    const W = P.W, H = P.H, V = P.ori === 'v';
    const U = V ? .24 * H : .40 * H, gy = H * (V ? .60 : .72), cx = W * .5;
    const z = 1 + .07 * eio(clamp(u / 5.2)), crestX = cx - U * .06, crestY = gy - U * .17, fx = cx, fy = crestY;
    const hillY = x => { const d = (x - crestX) / (U * 1.25); return crestY + (gy - U * .02 - crestY) * Math.min(1, d * d * (1.2 - .2 * Math.min(1, Math.abs(d)))) + U * .006 * (P.noise(x * .012, 5) - .5); };
    const meet = ss(1.35, 2.05, u), spirit = ss(1.55, 2.4, u), dawn = ss(2.0, 3.8, u), sunUp = eo(clamp((u - 2.2) / 3.0)), breathe = .5 + .5 * Math.sin(u * 1.6);
    const sun = [crestX + U * .16, crestY + U * .025 - U * .085 * sunUp];
    const M = [sun[0], crestY - U * .045];                                          // where the three lights are taken in, just over the crest
    ctx.save(); camera(ctx, W, H, z, fx, fy);
    // the sky: before dawn (deep blue-violet above, a low ember at the horizon), spreading to a warm dawn
    { const g = ctx.createLinearGradient(0, -H * .1, 0, gy);
      g.addColorStop(0, css(lerpC([44, 40, 62], [66, 60, 84], dawn))); g.addColorStop(.45, css(lerpC([100, 74, 90], [158, 114, 108], dawn)));
      g.addColorStop(.8, css(lerpC([176, 112, 86], [236, 168, 118], dawn))); g.addColorStop(1, css(lerpC([214, 140, 94], [255, 206, 150], dawn)));
      ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, gy + H + 2); }
    // the low glow where the sun will come, there from the first frame, growing
    { const R = U * (1.1 + 1.6 * dawn), g = ctx.createRadialGradient(sun[0], crestY, 0, sun[0], crestY, R), k = .35 + .65 * dawn;
      g.addColorStop(0, `rgba(255,214,150,${.55 * k})`); g.addColorStop(.3, `rgba(240,150,90,${.32 * k})`); g.addColorStop(1, 'rgba(120,60,50,0)');
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.restore(); }
    // high thin clouds catching the first light, drifting
    { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 6; i++) { const y = gy - U * (.75 + .32 * i), x = W * (((i * .37 + u * .006) % 1.4) - .2), rx = U * (1.3 + .3 * (i % 3)), ry = U * .16;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(${lerp(150, 255, dawn) | 0},${lerp(100, 190, dawn) | 0},${lerp(110, 150, dawn) | 0},${.07 + .07 * dawn})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.fillStyle = g; ctx.fillRect(-rx, -rx, 2 * rx, 2 * rx); ctx.restore(); } ctx.restore(); }
    // the far ranges, hazed by distance (aerial perspective), warming as the dawn comes
    ridge(ctx, W, H, gy - U * .22, U * .14, .0018, 61, css(lerpC([84, 62, 78], [176, 120, 104], dawn), .75));
    ridge(ctx, W, H, gy - U * .12, U * .12, .0026, 67, css(lerpC([56, 40, 52], [120, 78, 70], dawn), .88));
    // the sun's disc rising behind the hill (the hill is drawn over it)
    { const sr = U * .05, a = ss(2.0, 3.0, u), g = ctx.createRadialGradient(sun[0], sun[1], 0, sun[0], sun[1], sr * 2.2);
      g.addColorStop(0, `rgba(255,250,236,${a})`); g.addColorStop(.42, `rgba(255,240,206,${a})`); g.addColorStop(.5, `rgba(255,214,150,${.6 * a})`); g.addColorStop(1, 'rgba(255,190,110,0)');
      ctx.fillStyle = g; ctx.fillRect(sun[0] - sr * 2.2, sun[1] - sr * 2.2, sr * 4.4, sr * 4.4); }
    // haze lying in the valleys, lit from the sun's side, drifting slowly
    { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 7; i++) { const y = gy - U * (.02 + .05 * (i % 3)), x = cx + U * (-1.6 + .55 * i) + u * U * .03 * (i % 2 ? 1 : -.6), rx = U * .7, k = .5 + .5 * clamp(1 - Math.abs(x - sun[0]) / (U * 2));
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(255,200,150,${(.08 + .14 * dawn) * k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save(); ctx.translate(x, y); ctx.scale(1, .13); ctx.fillStyle = g; ctx.fillRect(-rx, -rx, 2 * rx, 2 * rx); ctx.restore(); } ctx.restore(); }
    ctx.restore();

    // the three lights and the one light they come into (soft layer, in the camera's frame)
    const gold = [255, 184, 92], pale = [255, 240, 214];
    const streams = [   // [start, control, t0, t1] — the hill's light from the left, the tent's from high right, the field's from the low right
      [[-U * .4, crestY - U * 1.1], [cx - U * .8, crestY - U * .1], .0, 1.55],
      [[cx + U * .5, -H * .06], [cx + U * .8, crestY - U * .9], .25, 1.8],
      [[W + U * .3, crestY - U * .55], [cx + U * 1.1, crestY], .45, 2.0]];
    softLight(ctx, g => {
      streams.forEach(([P0, C, t0, t1], si) => {
        const h = eio(clamp((u - t0) / (t1 - t0))), fade = 1 - ss(t1 + .05, t1 + .8, u); if (h <= 0 || fade <= 0) return;
        const pt = s => { const q = 1 - s; return [q * q * P0[0] + 2 * q * s * C[0] + s * s * M[0], q * q * P0[1] + 2 * q * s * C[1] + s * s * M[1]]; };
        const n = 54;
        for (let i = 0; i <= n; i++) { const s = h - .85 * i / n; if (s < 0) break; const p = pt(s), p2 = pt(Math.min(1, s + .01)), tx = p2[0] - p[0], ty = p2[1] - p[1], tl = Math.hypot(tx, ty) || 1;
          const wob = U * .035 * Math.sin(s * 9 - u * 2.2 + si * 2) * (1 - s) + U * .03 * (P.noise(s * 3 + si * 5, u * .5 + si) - .5);
          const x = p[0] - ty / tl * wob, y = p[1] + tx / tl * wob, tail = 1 - i / n, r = U * (.05 + .05 * (1 - s) * tail), cl = lerpC(gold, pale, ss(.8, 1, s) * spirit);
          blob(g, x, y, r, cl, .55 * Math.pow(tail, 1.1) * fade, 1); blob(g, x, y, U * .022, lerpC(cl, [255, 236, 190], .5), .55 * tail * tail * fade, 1); }
        // its head, brighter
        const ph = pt(h); blob(g, ph[0], ph[1], U * .1, lerpC([255, 214, 140], pale, ss(.85, 1, h) * spirit), .8 * fade * (1 - .5 * ss(.95, 1, h)));
      });
      // the one light: amber at first, turning pale and soft as the lights arrive — a bright core and two wing-glows that open,
      // beat once slowly and fold as it sinks into the dawn and becomes the sunrise
      const L = meet * (1 - .55 * ss(2.6, 3.6, u)), wing = spirit * (1 - ss(2.3, 3.1, u)), beat = Math.sin((u - 1.6) * 2.4), sp = .22 + .14 * (.5 + .5 * beat) * (1 - ss(2.2, 2.8, u));
      if (L > 0) { const col = lerpC([255, 200, 110], pale, spirit), my = lerp(M[1], sun[1], ss(2.2, 3.2, u));
        blob(g, M[0], my, U * (.15 + .12 * meet), col, .85 * L); blob(g, M[0], my, U * (.5 + .3 * spirit), lerpC([255, 170, 90], [226, 226, 232], spirit), .3 * L);
        for (const sd of [-1, 1]) { g.save(); g.translate(M[0] + sd * U * .2, my - U * sp * .5); g.rotate(sd * -sp * .8); blob(g, 0, 0, U * .3, lerpC(col, [255, 228, 170], .5), .75 * wing * L, .36); g.restore(); } }
      // the dawn spreading: a wide soft wash from the sun along the horizon, breathing a little
      blob(g, sun[0], sun[1], U * (.6 + 1.2 * dawn), [255, 214, 160], .28 * dawn * (.9 + .1 * breathe), .45);
    }, { cam: [z, fx, fy], blur: .016 });

    ctx.save(); camera(ctx, W, H, z, fx, fy);
    // the far hill with the cross on its top (dark, the sun behind it); the near land below in shadow, its edge catching the sky
    ctx.fillStyle = css(lerpC([28, 18, 22], [46, 28, 26], dawn)); ctx.beginPath(); ctx.moveTo(-W, H * 2); for (let x = -W; x <= W * 2; x += 10) ctx.lineTo(x, hillY(x)); ctx.lineTo(W * 2, H * 2); ctx.fill();
    { const bx = crestX, by = hillY(crestX) + U * .004, ch = U * (V ? .12 : .11), cw = ch * .08, ay = by - ch * .72, aw = ch * .56;   // the empty cross: small, far, a silhouette
      ctx.fillStyle = '#140c0c'; ctx.fillRect(bx - cw / 2, by - ch, cw, ch); ctx.fillRect(bx - aw / 2, ay - cw / 2, aw, cw * .95); }
    { const g = ctx.createLinearGradient(0, gy - U * .02, 0, H); g.addColorStop(0, css(lerpC([30, 20, 20], [64, 40, 30], dawn))); g.addColorStop(.25, css(lerpC([18, 12, 12], [34, 22, 18], dawn))); g.addColorStop(1, 'rgb(10,7,7)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-W, H * 2); for (let x = -W; x <= W * 2; x += 14) ctx.lineTo(x, gy + U * .02 + U * .025 * (P.fbm(x * .004, 3, 3) - .5)); ctx.lineTo(W * 2, H * 2); ctx.fill(); }
    groundLight(ctx, W, H, gy + U * .02, .35 + .5 * dawn);
    ctx.restore();
    // the sun's light wraps the hill's edge and the cross (backlight), dust drifts in it — it keeps moving through the still breath
    const ss2 = toScr(sun, z, fx, fy);
    GOLD.bloom(ctx, ss2[0], ss2[1], [255, 214, 150], .2 + .4 * dawn, { r: U * (.4 + .4 * dawn), streak: .12 * dawn, ghosts: false });
    GOLD.motes(ctx, u, { n: 90, seed: 53, light: [ss2[0], ss2[1], W * .7], a: .4 + .6 * ss(1.5, 3, u), size: 1.1 });
    GOLD.glow(ctx, .5, { wide: .5 });
    GOLD.finish(ctx, u, { vignette: .5 });
  }

  function goldAnoint(ctx, u, which) {
    if (which === 'horn') return hornScene(ctx, u);
    if (which === 'david') return pourScene(ctx, u, DAVID);
    if (which === 'aaron') return aaronScene(ctx, u);
    if (which === 'elisha') return elishaScene(ctx, u);
  }

  window.goldAnoint = goldAnoint; window.goldThree = goldThree; window.goldRecall = goldRecall;
})();
