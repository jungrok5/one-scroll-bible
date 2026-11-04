/* oil-journey.js — 「메시아」 3부의 여정을 레밍턴 서부 유화로 (2026-11-03 2차; OPUSCAR 65 — Remington's sunset plains and nocturnes).
   One wide painting of the hill country: a red-gold sunset in long horizontal strokes, the land and the two travellers dark warm
   silhouettes with a thin warm rim; the same land painted again as a blue-green nocturne. The camera trucks with Mary and Joseph
   along the ridge toward the hill of Bethlehem (Luke 2:4); as the sun goes the painting turns to night, and the town's windows
   light one by one (Micah 5:2 fulfilled). 76.6–95.2 s. Uses film.html's profileTravellers. */
const JOIL = { S: 1.15, sun: null, night: null };
function buildJourneyOil() {
  const S = JOIL.S, WP = W * (V ? 2.5 : 1.9), HP = H * 1.1, PW = Math.round(WP * S), PH = Math.round(HP * S), hz = HP * (V ? .56 : .6);
  const crest = x => hz + (V ? 170 : 120) - (V ? 46 : 36) * Math.sin(x * .0021 + 1.2) - 18 * Pilot.fbm(x * .006, 3, 3);   // the ridge they walk on
  const town = { x: WP * .86, y: hz - (V ? 20 : 16) }, rnd = rng(41), houses = [];
  for (let i = 0; i < 30; i++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()); houses.push({ x: town.x + Math.cos(a) * d * (V ? 150 : 120), y: town.y + Math.sin(a) * d * 22 - 4, w: 16 + rnd() * 16, h: 12 + rnd() * 12, lamp: rnd() < .6 ? rnd() * 4.4 : -1 }); }
  houses.sort((a, b) => a.y - b.y);
  Object.assign(JOIL, { WP, HP, hz, crest, town, houses });
  const paintLand = night => {
    const plate = canvas(PW, PH), g = plate.getContext('2d'); g.scale(S, S);
    const col = (a, b) => night ? b : a;
    // the sky: sunset — orange into deep red, a pale gold sun on the horizon; nocturne — blue-green, moonlit cloud edges
    { const gr = g.createLinearGradient(0, 0, 0, hz); (night ? [[0, '#0b1c22'], [.55, '#17333a'], [1, '#2a4a4c']] : [[0, '#4a1424'], [.35, '#9a2a22'], [.7, '#e2682a'], [.92, '#f6a640'], [1, '#ffd27a']]).forEach(([k, c]) => gr.addColorStop(k, c)); g.fillStyle = gr; g.fillRect(0, 0, WP, hz + 4); }
    // cloud bands: long horizontal shapes, lit from below at sunset, silvered at night
    { const r = rng(night ? 5 : 5); for (let i = 0; i < 26; i++) { const y = hz * (.08 + .7 * r() ** 1.3), x = r() * WP, w = WP * (.12 + .3 * r()), h = 10 + 26 * r() * (1 - y / hz);
      const c = night ? `rgba(${40 + 30 * r() | 0},${70 + 40 * r() | 0},${74 + 30 * r() | 0},${.55})` : `rgba(${110 + 80 * (y / hz) + 40 * r() | 0},${30 + 60 * (y / hz) ** 2 | 0},${28 + 20 * r() | 0},${.6})`;
      g.fillStyle = c; g.beginPath(); g.ellipse(x, y, w / 2, h / 2, 0, 0, 6.283); g.fill();
      g.fillStyle = night ? 'rgba(156,196,188,.35)' : 'rgba(255,190,90,.4)'; g.beginPath(); g.ellipse(x, y + h * .28, w * .42, h * .16, 0, 0, 6.283); g.fill(); } }
    if (!night) { const sx = WP * .42, sy = hz - 6, gr = g.createRadialGradient(sx, sy, 0, sx, sy, HP * .5); gr.addColorStop(0, 'rgba(255,236,170,1)'); gr.addColorStop(.06, 'rgba(255,210,120,.85)'); gr.addColorStop(.3, 'rgba(240,130,50,.35)'); gr.addColorStop(1, 'rgba(200,60,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, WP, hz + 4);
      g.fillStyle = '#fff1c8'; g.beginPath(); g.arc(sx, sy, V ? 46 : 40, Math.PI, 0); g.fill(); JOIL.sun = [sx, sy]; }
    else { const mx = WP * .2, my = hz * .2, gr = g.createRadialGradient(mx, my, 0, mx, my, HP * .3); gr.addColorStop(0, 'rgba(200,226,220,.5)'); gr.addColorStop(1, 'rgba(120,170,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, WP, hz); g.fillStyle = '#dcebe6'; g.beginPath(); g.arc(mx, my, V ? 26 : 22, 0, 6.283); g.fill(); JOIL.moon = [mx, my]; }
    // far hills, layer on layer; a thin warm (or moonlit) rim on each crest
    const layer = (base, amp, f, ph, c, rim) => { const pts = []; for (let x = -20; x <= WP + 20; x += 10) pts.push([x, base - amp * (.5 + .5 * Math.sin(x * f + ph)) - amp * .35 * Pilot.fbm(x * f * 3, ph, 3)]);
      g.fillStyle = c; g.beginPath(); g.moveTo(-20, HP); pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(WP + 20, HP); g.closePath(); g.fill();
      g.strokeStyle = rim; g.lineWidth = 3; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1] + 1.5) : g.moveTo(p[0], p[1] + 1.5)); g.stroke(); };
    layer(hz + 4, V ? 60 : 46, .0026, 1, col('#7a3a3a', '#1d3034'), col('rgba(255,170,90,.5)', 'rgba(156,196,188,.35)'));
    layer(hz + (V ? 40 : 30), V ? 50 : 40, .0039, 3, col('#4a2228', '#18242a'), col('rgba(255,160,80,.45)', 'rgba(156,196,188,.3)'));
    // the hill of Bethlehem, far right, its flat roofs on the crest
    { const bx = town.x, by = town.y; g.fillStyle = col('#3a1c22', '#141e22'); g.beginPath(); g.moveTo(bx - (V ? 520 : 420), hz + 80); g.quadraticCurveTo(bx - 120, by - 30, bx, by - 34); g.quadraticCurveTo(bx + 160, by - 30, bx + (V ? 560 : 460), hz + 80); g.closePath(); g.fill();
      for (const hs of houses) { g.fillStyle = col('#2c141a', '#10181c'); g.fillRect(hs.x - hs.w / 2, hs.y - hs.h - 30, hs.w, hs.h + 30); g.fillStyle = col('rgba(255,170,90,.55)', 'rgba(156,196,188,.3)'); g.fillRect(hs.x - hs.w / 2, hs.y - hs.h - 31, hs.w, 2); } }
    layer(hz + (V ? 90 : 70), V ? 40 : 30, .0052, 6, col('#2e1418', '#121a1c'), col('rgba(255,150,70,.4)', 'rgba(156,196,188,.25)'));
    // the near ridge and its dry grass
    { const gr = g.createLinearGradient(0, hz + 100, 0, HP); gr.addColorStop(0, col('#2a1410', '#1e1c16')); gr.addColorStop(.35, col('#4a2416', '#22241c')); gr.addColorStop(1, col('#2a140c', '#16160f')); g.fillStyle = gr; g.beginPath(); g.moveTo(-20, HP); for (let x = -20; x <= WP + 20; x += 6) g.lineTo(x, crest(x)); g.lineTo(WP + 20, HP); g.closePath(); g.fill();
      g.strokeStyle = col('rgba(255,150,70,.55)', 'rgba(156,196,188,.3)'); g.lineWidth = 3; g.beginPath(); for (let x = -20; x <= WP + 20; x += 6) x < -10 ? g.moveTo(x, crest(x) + 2) : g.lineTo(x, crest(x) + 2); g.stroke();
      const r = rng(7); g.lineCap = 'round'; for (let i = 0; i < 1400; i++) { const x = r() * WP, y = crest(x) + 2 + r() ** 2 * (HP - crest(x)); g.strokeStyle = night ? `rgba(${40 + 30 * r() | 0},${48 + 30 * r() | 0},${40 + 20 * r() | 0},.5)` : `rgba(${140 + 90 * r() | 0},${60 + 50 * r() | 0},${26 + 24 * r() | 0},${.35 + .3 * clamp(1 - (y - crest(x)) / 500)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 8, y - 8 - 14 * r()); g.stroke(); } }
    // Remington's strokes: the sky in long horizontal strokes, the land along its slope
    return OIL.paint(plate, { key: 'remington', S, seed: night ? 23 : 17, dirAt: (px, py) => py / S < hz ? 0 : -.08 * Math.cos(px / S * .0021 + 1.2) });
  };
  JOIL.sunArt = paintLand(false); JOIL.nightArt = paintLand(true);
}
// the travellers' place on the ridge at time t (plate units), and the camera
function journeyAt(t) { const k = eio(clamp((t - 76.6) / 18.6)), x = lerp(JOIL.WP * (V ? .16 : .2), JOIL.WP * (V ? .66 : .64), k); return { x, y: JOIL.crest(x) + 2, k }; }
function partJourney(ctx, t) {
  const { S, WP, HP } = JOIL, me = journeyAt(t), z = lerp(1.0, 1.14, eio(clamp((t - 76.6) / 18.6)));
  // follow them, then (as night falls) turn to the town ahead so its windows are seen lighting
  const fx = Math.min(WP - W / 2 / z, lerp(me.x + (V ? 150 : 260) / z, JOIL.town.x - (V ? 120 : 260) / z, eio(ss(87.5, 92, t)))), fy = HP * (V ? .54 : .56) - 20 * me.k;
  const night = ss(85.5, 90.2, t);
  OIL.view(ctx, JOIL.sunArt, S, fx * S, fy * S, z);
  if (night > 0) { ctx.save(); ctx.globalAlpha = night; OIL.view(ctx, JOIL.nightArt, S, fx * S, fy * S, z); ctx.restore(); }
  // round 3 (look review: the half-way sky went olive-mud): dusk passes through violet — the sky's hue is pulled to dusk purple
  // while the two plates cross, a last orange kept on the horizon
  { const b = Math.sin(Math.PI * night); if (b > .01) { const hz = H / 2 + (JOIL.hz - fy) * z; ctx.save(); ctx.globalCompositeOperation = 'color'; const g = ctx.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, `rgba(58,44,104,${.55 * b})`); g.addColorStop(.75, `rgba(132,70,120,${.5 * b})`); g.addColorStop(1, `rgba(220,120,70,${.45 * b})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz); ctx.restore(); } }
  const P2 =(x, y) => [W / 2 + (x - fx) * z, H / 2 + (y - fy) * z];
  // the sun's glow while it lasts; at night a few stars
  if (night < 1) { const [sx, sy] = P2(...JOIL.sun); W3.bloom(ctx, sx, sy, [255, 196, 120], .7 * (1 - night) * (1 - ss(84, 88, t) * .5), { r: (V ? 240 : 200) * z, streak: .8 }); }
  if (night > 0) { const r = rng(3); ctx.save(); ctx.fillStyle = '#e8f2ee'; for (let i = 0; i < 160; i++) { const [x, y] = P2(r() * WP, r() * JOIL.hz * .8); ctx.globalAlpha = night * (.3 + .6 * r()) * (.8 + .2 * Math.sin(t * 2 + i)); ctx.fillRect(x, y, 1.6, 1.6); } ctx.restore(); }
  // the town's windows light one by one (89.6 → 94)
  for (const hs of JOIL.houses) if (hs.lamp >= 0) { const on = ss(89.6 + hs.lamp, 90.2 + hs.lamp, t) * night; if (on <= 0) continue; const [x, y] = P2(hs.x, hs.y - hs.h * .5 - 26);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; const R = 18 * z, gr = ctx.createRadialGradient(x, y, 0, x, y, R * 2.4); gr.addColorStop(0, `rgba(255,204,106,${on})`); gr.addColorStop(.3, `rgba(255,170,80,${.5 * on})`); gr.addColorStop(1, 'rgba(255,160,70,0)'); ctx.fillStyle = gr; ctx.fillRect(x - R * 2.4, y - R * 2.4, R * 4.8, R * 4.8); ctx.restore();
    ctx.fillStyle = `rgba(255,214,130,${on})`; ctx.fillRect(x - 3 * z, y - 4 * z, 6 * z, 8 * z); }
  // Mary and Joseph: dark warm silhouettes walking right, a thin warm rim sunward (moonlit later)
  { const [x, y] = P2(me.x, me.y); profileTravellers(ctx, x, y, (V ? 124 : 100) * z, t * .9, .5 * (1 - night) + .15 * night); }
  OIL.varnish(ctx, .6, [140, 60, 30]); W3.finish(ctx, t, { vignette: .42, grain: .06 });
  textBand(ctx);
}
