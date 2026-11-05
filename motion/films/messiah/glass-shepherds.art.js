// ---------- the shepherds' window (art for make-glass-shepherds.mjs; engine = advent.html) ----------
// central lancet: night over the fields of Bethlehem — an angel in the arch with raised arms and gold wings, rays of gold glass,
// three shepherds below (one kneels, one shields his eyes, one stands with his crook) and their sheep on the dark hills
function shepherdsArt(x, clip) {
  quarries(x, clip, COB, 30, [-170, -780, 170, 0]);
  // rays of the glory from the angel (gold and white glass wedges)
  for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + (i - 5) * .27, r0 = 70, r1 = 330, w = .055;
    piece(x, P2([[Math.cos(a - w) * r0, -600 + Math.sin(a - w) * r0], [Math.cos(a + w) * r0, -600 + Math.sin(a + w) * r0], [Math.cos(a + w * 2.2) * r1, -600 + Math.sin(a + w * 2.2) * r1], [Math.cos(a - w * 2.2) * r1, -600 + Math.sin(a - w * 2.2) * r1]]), i % 2 ? '#f6dc7a' : '#fff2c4', { streaks: 6, lw: 2.2 }); }
  piece(x, circ(0, -600, 74), '#ffe58a', { streaks: 12, lw: 2.6, shade: .12 });
  // the angel: gold wings, a white robe, arms raised, a halo
  piece(x, sv('M-14 -620 C-60 -660 -120 -690 -150 -640 C-130 -620 -110 -600 -86 -592 C-70 -584 -40 -580 -16 -588 Z'), GOLD, { lw: 2.4 });
  piece(x, sv('M14 -620 C60 -660 120 -690 150 -640 C130 -620 110 -600 86 -592 C70 -584 40 -580 16 -588 Z'), GOLD, { lw: 2.4 });
  piece(x, sv('M-28 -600 C-34 -560 -44 -500 -52 -446 L52 -446 C44 -500 34 -560 28 -600 C16 -612 -16 -612 -28 -600 Z'), '#f4f1e2', { lw: 2.6 });
  piece(x, sv('M-26 -596 C-46 -626 -60 -650 -66 -676 L-56 -680 C-48 -656 -32 -632 -14 -606 Z'), '#f4f1e2', { lw: 2 });
  piece(x, sv('M26 -596 C46 -626 60 -650 66 -676 L56 -680 C48 -656 32 -632 14 -606 Z'), '#f4f1e2', { lw: 2 });
  piece(x, circ(0, -636, 30), '#f2b72e', { streaks: 4, lw: 2.4, shade: .15 });
  piece(x, ell(0, -630, 14, 17), FLESH, { streaks: 0, lw: 2 });
  // stars
  [[-120, -500], [118, -470], [-96, -420], [100, -380], [-130, -720], [126, -700]].forEach(([a, b], i) => piece(x, star(a, b, i % 2 ? 7 : 9, 3, 4 + (i % 2) * 4, i), '#ffd75a', { streaks: 0, bubbles: 0, mat: 1, lw: 1.4 }));
  // the hills of Bethlehem
  piece(x, sv('M-170 -230 C-120 -270 -60 -250 0 -262 C60 -276 120 -246 170 -258 L170 -150 L-170 -150 Z'), '#2a5a3a', { lw: 2.6 });
  piece(x, sv('M-170 -170 C-100 -196 -30 -176 40 -186 C100 -194 140 -176 170 -182 L170 0 L-170 0 Z'), DGREEN, { lw: 2.6 });
  // sheep
  const sheep = (cx, cy, s, d) => { piece(x, ell(cx, cy, 26 * s, 15 * s), '#ece6d2', { streaks: 4, lw: 2 }); piece(x, ell(cx + d * 24 * s, cy - 8 * s, 9 * s, 7 * s, d * .3), '#2a2420', { streaks: 0, lw: 1.6 });
    for (const lx of [-12, -4, 6, 14]) piece(x, rect(cx + lx * s, cy + 12 * s, 3.5 * s, 12 * s), '#2a2420', { streaks: 0, bubbles: 0, lw: 1.2 }); };
  sheep(-120, -70, 1, 1); sheep(-60, -46, .9, -1); sheep(70, -60, 1, 1); sheep(128, -38, .85, -1); sheep(10, -30, .8, 1);
  // three shepherds: kneeling (left), shielding his eyes (centre), standing with the crook (right)
  piece(x, sv('M-150 -100 C-150 -150 -138 -186 -118 -200 C-100 -208 -88 -196 -86 -180 L-80 -150 C-74 -132 -70 -116 -66 -100 Z'), MURREY, { lw: 2.6 });
  piece(x, ell(-108, -214, 13, 15, -.4), FLESH, { streaks: 0, lw: 2 }); piece(x, sv('M-124 -222 C-122 -236 -104 -242 -92 -232 C-96 -224 -110 -220 -124 -222 Z'), '#7a4a22', { streaks: 0, lw: 1.8 });
  piece(x, sv('M-44 -100 C-48 -160 -44 -220 -30 -262 C-22 -282 -2 -284 6 -268 C16 -230 20 -170 22 -100 Z'), GREEN, { lw: 2.6 });
  piece(x, ell(-14, -290, 13, 16), FLESH, { streaks: 0, lw: 2 }); piece(x, sv('M-30 -296 C-28 -312 0 -318 6 -300 C-4 -306 -20 -304 -30 -296 Z'), '#c98a2e', { streaks: 0, lw: 1.8 });
  piece(x, sv('M2 -270 C14 -282 24 -294 30 -306 L22 -312 C14 -300 4 -290 -6 -280 Z'), GREEN, { streaks: 0, lw: 1.8 }); piece(x, ell(28, -312, 8, 6), FLESH, { streaks: 0, lw: 1.6 });
  piece(x, sv('M80 -100 C76 -170 80 -230 92 -270 C100 -292 122 -294 130 -276 C138 -230 140 -170 140 -100 Z'), BROWN, { lw: 2.6 });
  piece(x, ell(110, -298, 13, 16), FLESH, { streaks: 0, lw: 2 }); piece(x, sv('M94 -304 C96 -322 124 -326 128 -308 C118 -314 104 -312 94 -304 Z'), '#e8dcb8', { streaks: 0, lw: 1.8 });
  piece(x, sv('M150 -380 C164 -392 176 -380 170 -364 L166 -366 C170 -378 162 -384 154 -376 L156 -100 L148 -100 Z'), '#6a4220', { streaks: 2, lw: 2 });
  gris(x, 1.6, g => { curve(g, 'M-130 -110 C-126 -140 -118 -168 -104 -186'); curve(g, 'M-30 -110 C-30 -160 -26 -210 -18 -250'); curve(g, 'M-6 -110 C-4 -160 -2 -210 2 -250');
    curve(g, 'M96 -110 C94 -160 96 -210 102 -258'); curve(g, 'M122 -110 C124 -160 122 -210 118 -258'); curve(g, 'M-20 -560 C-24 -520 -30 -480 -36 -450'); curve(g, 'M20 -560 C24 -520 30 -480 36 -450');
    g.beginPath(); g.ellipse(-4, -632, 2, 1.4, 0, 0, 6.28); g.fill(); g.beginPath(); g.ellipse(6, -632, 2, 1.4, 0, 0, 6.28); g.fill(); curve(g, 'M-4 -620 C-1 -618 2 -618 5 -620'); });
}
function mHost(x) {            // a medallion angel of the host: gold wings, white robe, a trumpet of light
  piece(x, sv('M-6 -10 C-30 -30 -56 -36 -60 -14 C-46 -6 -24 0 -8 0 Z'), GOLD, { streaks: 4, lw: 1.8 }); piece(x, sv('M6 -10 C30 -30 56 -36 60 -14 C46 -6 24 0 8 0 Z'), GOLD, { streaks: 4, lw: 1.8 });
  piece(x, sv('M-16 -6 C-20 20 -26 44 -30 60 L30 60 C26 44 20 20 16 -6 C8 -12 -8 -12 -16 -6 Z'), '#f4f1e2', { lw: 2 });
  piece(x, circ(0, -26, 17), '#f2b72e', { streaks: 2, lw: 1.8 }); piece(x, ell(0, -24, 9, 11), FLESH, { streaks: 0, lw: 1.6 });
}
function mStarField(x) {       // the star over Bethlehem above a small town on its hill
  piece(x, star(0, -18, 30, 12, 8), '#ffc93a', { streaks: 6, lw: 2.2 }); piece(x, circ(0, -18, 7), '#fff7da', { streaks: 0, lw: 1.6 });
  piece(x, sv('M-60 40 C-30 24 30 24 60 40 L60 70 L-60 70 Z'), DGREEN, { lw: 2 });
  for (const [hx, hw] of [[-30, 18], [-6, 22], [22, 16]]) piece(x, rect(hx - hw / 2, 26, hw, 16), '#c9a978', { streaks: 0, lw: 1.6 });
}
function buildArt() {
  R = rng(21); const sL = finish(lancetSprite(LAN.L, (x, clip) => { quarries(x, clip, COB, 28, [-440, -620, -200, 0]);
    medallion(x, -320, -150, 78, '#2f7a8c', mHost); medallion(x, -320, -380, 78, COB2, mHost); bars(x, LAN.L, [-56, -265, -470]); }));
  R = rng(22); const sR = finish(lancetSprite(LAN.R, (x, clip) => { quarries(x, clip, COB, 28, [200, -620, 440, 0]);
    medallion(x, 320, -150, 78, '#5a86c0', mHost); medallion(x, 320, -380, 78, RUBY, mStarField); bars(x, LAN.R, [-56, -265, -470]); }));
  R = rng(23); const sRose = finish((() => { const o = LAN.rose, b = [o.x - o.r - 8, o.y - o.r - 8, o.x + o.r + 8, o.y + o.r + 8], c = canvas((b[2] - b[0]) * SS | 0, (b[3] - b[1]) * SS | 0), x = c.getContext('2d');
    x.scale(SS, SS); x.translate(-b[0], -b[1]); const outer = circ(o.x, o.y, o.r); x.save(); x.clip(outer); piece(x, outer, COB2, { lw: 2 }); x.translate(o.x, o.y);
    piece(x, star(0, 0, 52, 20, 8), '#ffc93a', { streaks: 8, lw: 2.4 }); piece(x, circ(0, 0, 12), '#fff7da', { streaks: 0, lw: 2 }); x.restore();
    const rr = new Path2D(); rr.addPath(circ(o.x, o.y, o.r)); rr.addPath(circ(o.x, o.y, o.r - 8)); x.save(); x.clip(rr, 'evenodd'); piece(x, circ(o.x, o.y, o.r), RUBY, { lw: 2 }); x.restore();
    x.strokeStyle = LEAD; x.lineWidth = 6; x.stroke(outer); return { c, b, outline: outer }; })());
  R = rng(24); const sC = finish(lancetSprite(LAN.C, (x, clip) => { shepherdsArt(x, clip); bars(x, LAN.C, [-120, -330, -480, -660]); }));
  // the glory (Lk 2:9 "주의 영광이 그들을 두루 비추매"): the angel's lancet first, then every pane in a quick cascade (local seconds)
  regions = [
    { sp: sC, rb: sC.b.slice(), t0: .7, gain: 1.25 }, { sp: sRose, rb: sRose.b.slice(), t0: 1.0, gain: 1 },
    { sp: sL, rb: [sL.b[0], sL.b[1], sL.b[2], -265], t0: 1.25, gain: 1 }, { sp: sR, rb: [sR.b[0], sR.b[1], sR.b[2], -265], t0: 1.4, gain: 1 },
    { sp: sL, rb: [sL.b[0], -265, sL.b[2], 6], t0: 1.6, gain: 1 }, { sp: sR, rb: [sR.b[0], -265, sR.b[2], 6], t0: 1.75, gain: 1 }];
  regions.forEach(rg => { rg.patch = buildPatch(rg.sp, rg.rb); });
  let mw = 0, mh = 0; regions.forEach(rg => { mw = Math.max(mw, (rg.rb[2] - rg.rb[0]) * SS); mh = Math.max(mh, (rg.rb[3] - rg.rb[1]) * SS); });
  tmpC = canvas(Math.ceil(mw), Math.ceil(mh)); tmpX = tmpC.getContext('2d');
  const r = rng(78); for (let i = 0; i < 260; i++) dust.push({ x: -500 + r() * 1300, y: -400 + r() * 1100, r: .8 + r() * 1.8, a: .3 + r() * .7, f: .2 + r() * .5, p: r() * 6.28, vx: (r() - .5) * 4, vy: 4 + r() * 10 });
}
// the camera: close on the shepherds in the dark glass → as the glory comes, back to the whole window and the light on the floor
const CAMS = V ? [[0, 0, -250, 1.55], [.6, 0, -260, 1.5], [3.2, 0, -330, 1.12], [10, 0, -300, .98]] : [[0, 0, -300, 1.35], [.6, 0, -310, 1.3], [3.2, 0, -400, .98], [10, 0, -380, .9]];
function cam(t) { let i = 0; while (i < CAMS.length - 2 && t > CAMS[i + 1][0]) i++; const a = CAMS[i], b = CAMS[i + 1], k = eio(clamp((t - a[0]) / (b[0] - a[0])));
  return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)]; }
function draw(ctx, t) {   // t = seconds into the scene
  const [cx, cy, z] = cam(t);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
  ctx.drawImage(room, ROOM[0], ROOM[1]);
  const ls = regions.map(rg => lit(rg, t));
  ctx.globalCompositeOperation = 'lighter';
  regions.forEach((rg, i) => { const a = ls[i] * sun(t); if (a <= 0) return; const [x0, y0, x1, y1] = rg.rb, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const g = ctx.createRadialGradient(mx, my, 20, mx, my, 520 + (i === 0 ? 360 : 0)); g.addColorStop(0, rgb(rg.sp.avg, .18 * a)); g.addColorStop(1, rgb(rg.sp.avg, 0)); ctx.fillStyle = g; ctx.fillRect(mx - 900, my - 900, 1800, 1800); });
  regions.forEach((rg, i) => { const a = ls[i] * sun(t); if (a <= 0) return; ctx.globalAlpha = a * (i === 0 ? 1.7 : 1); ctx.drawImage(rg.patch.c, rg.patch.ox, rg.patch.oy); });
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.beginPath(); ctx.rect(-2000, -2000, 4000, 2000); ctx.clip();
  ctx.globalAlpha = .55 + .45 * ss(0, .8, t); regions.forEach((rg, i) => drawRegion(ctx, rg, t, ls[i])); ctx.globalAlpha = 1; ctx.restore();
  // the glory itself: a white-gold burst from the angel as the glass ignites, then a steady radiance
  const gb = ss(.5, .9, t) * (1 - .6 * ss(1.4, 3.4, t));
  if (gb > 0) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, -600, 0, 0, -600, 520); g.addColorStop(0, `rgba(255,248,220,${.9 * gb})`); g.addColorStop(.3, `rgba(255,214,120,${.35 * gb})`); g.addColorStop(1, 'rgba(255,200,90,0)'); ctx.fillStyle = g; ctx.fillRect(-560, -1140, 1120, 1080);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + .15 * Math.sin(t * .5), l = 420 * gb; ctx.strokeStyle = `rgba(255,238,190,${.3 * gb})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -600); ctx.lineTo(Math.cos(a) * l, -600 + Math.sin(a) * l); ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over'; }
  const clipAll = new Path2D();
  regions.forEach((rg, i) => { const a = ls[i] * sun(t); if (a > 0) clipAll.addPath(shaft(ctx, rg, a * (i === 0 ? 1.5 : 1))); });
  if (ls.some(v => v > 0)) { ctx.save(); ctx.clip(clipAll); ctx.globalCompositeOperation = 'lighter';
    for (const d of dust) { const px = d.x + Math.sin(t * d.f + d.p) * 30 + t * d.vx, py = d.y + ((t * d.vy + d.p * 40) % 500) - 250, a = .35 + .35 * Math.sin(t * 2 + d.p);
      ctx.fillStyle = `rgba(255,236,200,${a * d.a})`; ctx.beginPath(); ctx.arc(px, py, d.r, 0, 6.28); ctx.fill(); }
    ctx.restore(); }
  ctx.restore();
}
