/* engrave-shepherds.js — 「메시아」 4부의 목자들을 도레풍 동판화로 (2026-11-03 2차; kit-doreline.js).
   Night on the hill above Bethlehem in dense engraved lines; "주의 영광이 그들을 두루 비추매" — the hatching parts from the top of the
   sky down and the light is bare paper; an angel stands in it; the shepherds' and sheep's upper edges catch the light. 104.6–113.8 s.
   Uses film.html's sil/SIL. */
let EPL = null;
// shepherds (metres, facing right, feet at the origin): hooded, a crook in the front hand; B shields his eyes from the light
const SHEP_A = [['M', -.2, 0], ['C', -.24, -.5, -.24, -1.0, -.17, -1.38], ['C', -.2, -1.55, -.14, -1.76, .02, -1.79], ['C', .14, -1.79, .19, -1.7, .17, -1.6], ['L', .14, -1.56], ['C', .16, -1.5, .15, -1.45, .12, -1.42],
  ['C', .2, -1.36, .26, -1.2, .3, -1.1], ['L', .34, -1.05], ['C', .29, -1.0, .23, -.99, .19, -.97], ['C', .2, -.6, .22, -.3, .24, 0]];
const SHEP_B = [['M', -.21, 0], ['C', -.25, -.5, -.25, -1.0, -.18, -1.36], ['C', -.21, -1.55, -.15, -1.74, .0, -1.78], ['C', .1, -1.8, .16, -1.74, .17, -1.68], ['L', .26, -1.7], ['C', .3, -1.69, .3, -1.64, .26, -1.62],
  ['C', .22, -1.56, .18, -1.48, .14, -1.42], ['C', .16, -1.3, .17, -1.1, .18, -.98], ['C', .2, -.6, .22, -.3, .24, 0]];
const crook = (p, x) => { p.rect(x, -1.86, .035, 1.86); p.moveTo(x, -1.86); p.arc(x + .1, -1.86, .1, Math.PI, 0); p.lineTo(x + .165, -1.86); p.arc(x + .1, -1.86, .065, 0, Math.PI, true); p.closePath(); };
function partShepherds(ctx, t) {
  if (!EPL) { EPL = canvas(W, H); EPL.g = EPL.getContext('2d'); }
  const g = EPL.g, k = clamp((t - 104.6) / 9.2), open = ss(105.6, 108.6, t), hz = H * (V ? .5 : .6), z = 1 + .05 * eio(k);
  const crest = x => hz + (V ? 120 : 90) - (V ? 40 : 30) * Math.sin(x * .003 + 1), G = [W * .5, H * (V ? .27 : .22)];
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.save(); g.translate(W / 2, H * .55); g.scale(z, z); g.translate(-W / 2, -H * .55);
  // the values: a dark sky, a little lighter toward the horizon; stars
  { const gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, 'rgb(26,26,26)'); gr.addColorStop(1, 'rgb(74,74,74)'); g.fillStyle = gr; g.fillRect(-W, -H, 3 * W, 3 * H); }
  { const r = rng(33); g.fillStyle = '#fff'; for (let i = 0; i < 140; i++) { g.globalAlpha = (1 - open) * (.5 + .5 * r()); const s = r() < .15 ? 3 : 2; g.fillRect(r() * W, r() * hz * .9, s, s); } g.globalAlpha = 1; }
  // the glory: a burst of light that pushes the night back, with rays
  if (open > 0) { const R = Math.max(W, H) * (.25 + .85 * open), gr = g.createRadialGradient(G[0], G[1], 0, G[0], G[1], R); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, `rgba(255,255,255,${.85 * open})`); gr.addColorStop(.7, `rgba(200,200,200,${.4 * open})`); gr.addColorStop(1, 'rgba(160,160,160,0)'); g.fillStyle = gr; g.fillRect(-W, -H, 3 * W, 3 * H);
    g.save(); g.globalAlpha = .22 * open; g.fillStyle = '#fff'; const r = rng(4); for (let i = 0; i < 26; i++) { const a = (i / 26) * 6.283 + r() * .1, a2 = a + .035 + r() * .05; g.beginPath(); g.moveTo(G[0], G[1]); g.lineTo(G[0] + Math.cos(a) * W * 2, G[1] + Math.sin(a) * W * 2); g.lineTo(G[0] + Math.cos(a2) * W * 2, G[1] + Math.sin(a2) * W * 2); g.closePath(); g.fill(); } g.restore(); }
  // the angel of the Lord stood by them: not drawn as a figure — a standing column of light inside the glory
  { const a = ss(106.2, 108.4, t); if (a > 0) { const cx = G[0], top = G[1] - (V ? 60 : 50), bot = hz - (V ? 40 : 30), wdt = V ? 90 : 76;
    const gr = g.createLinearGradient(cx - wdt, 0, cx + wdt, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(cx - wdt, top, wdt * 2, bot - top);
    const g2 = g.createRadialGradient(cx, top + (bot - top) * .3, 0, cx, top + (bot - top) * .3, wdt * 2.6); g2.addColorStop(0, `rgba(255,255,255,${a})`); g2.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = g2; g.fillRect(cx - wdt * 3, top - wdt, wdt * 6, wdt * 6); } }  // the top stays engraved (the place name sits there)
  { const gr = g.createLinearGradient(0, 0, 0, H * .2); gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(.6, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(-W, -H, 3 * W, H + H * .2); }
  { const ly = V ? 236 : 62, gr = g.createRadialGradient(W / 2, ly, 0, W / 2, ly, V ? 300 : 260); gr.addColorStop(0, 'rgba(0,0,0,.95)'); gr.addColorStop(.55, 'rgba(0,0,0,.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.translate(W / 2, ly); g.scale(1, .3); g.translate(-W / 2, -ly); g.fillStyle = gr; g.fillRect(0, ly - 320, W, 640); g.restore(); }
  // the hills: far, then the shepherds' hill; their tops take the light
  const lit = c => `rgb(${c},${c},${c})`;
  hillLayer(g, hz, V ? 50 : 40, .005, 2, lit(54 + 90 * open), 20 * k);
  g.fillStyle = lit(34 + 40 * open); g.beginPath(); g.moveTo(-60, H + 60); for (let x = -60; x <= W + 60; x += 6) g.lineTo(x, crest(x)); g.lineTo(W + 60, H + 60); g.closePath(); g.fill();
  { const gr = g.createLinearGradient(0, crest(W / 2) - 10, 0, crest(W / 2) + 70); gr.addColorStop(0, `rgba(255,255,255,${.55 * open})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-60, H); for (let x = -60; x <= W + 60; x += 6) g.lineTo(x, crest(x)); g.lineTo(W + 60, H); g.closePath(); g.fill(); }
  // sheep, and three shepherds looking up, one shielding his eyes; upper edges lit by the glory
  const s = V ? 150 : 118, r = rng(31), rimA = .15 + .85 * open;
  for (let i = 0; i < 11; i++) { const x = W * (.06 + .9 * r()) - 30 * k, y = crest(x) + 10 + r() * 60; sil(g, x, y, s * (.75 + .2 * r()), r() < .5 ? 1 : -1, SIL.sheep, rimA * .8, 'rgb(250,250,250)', 'rgb(40,40,40)', [0, -1], 6); }
  for (const [fx, f, B] of [[.3, 1, 0], [.5, -1, 1], [.68, 1, 0]]) { const x = W * fx - 30 * k; sil(g, x, crest(x) + 4, s * 1.05, f, p => { bez(p, B ? SHEP_B : SHEP_A); if (!B) crook(p, .32); }, rimA, 'rgb(250,250,250)', 'rgb(16,16,16)', [0, -1], 7); }
  // the foreground under the words: deep shadow (solid ink), so the subtitles sit on black, not on lines
  { const y0 = Film.SAFE() - (V ? 170 : 80), gr = g.createLinearGradient(0, y0, 0, y0 + 160); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.94)'); g.fillStyle = gr; g.fillRect(-W, y0, 3 * W, 160); g.fillStyle = 'rgba(0,0,0,.94)'; g.fillRect(-W, y0 + 160, 3 * W, H); }
  g.restore();
  // cut it: lines follow the sky in slow swells and the hill's contour below
  const mean = crest(W / 2);
  ENG.engrave(ctx, EPL, { spacing: V ? 7 : 6.5, ink: [34, 24, 16], paper: [238, 226, 200], tint: [255, 214, 140, .25 * open], cross: .6,
    field: (x, y) => y + 5 * Math.sin(x * .011) - .9 * (crest(x) - mean) * ss(hz - 60, hz + 80, y) });
  // the glory's warmth on the paper
  if (open > 0) W3.bloom(ctx, G[0], G[1] + (V ? 160 : 120), [255, 220, 150], .45 * open, { r: V ? 520 : 440, streak: .5 });
  W3.finish(ctx, t, { vignette: .32, grain: .05 }); textBand(ctx);
}
