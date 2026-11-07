/* inkmap-jeru.js — 「메시아」 3차 7부 N24 "대제사장과 서기관들은 미가의 그 한 줄로 답했습니다. 베들레헴, 걸어서 두어 시간."
   (2026-11-07). The same parchment ink map as 2부 (inkmap-narrow.js, kit-inkmap.js): the camera starts where 2부 left the land —
   Nazareth far in the north, the long dotted way of "며칠 길" — and dives south to Jerusalem; its lamp lights (the king's city), then
   Bethlehem's, and a short dotted way joins them: two towns almost touching. What took Mary and Joseph days is two hours from the
   palace. Names are the script's label lines (M1 나사렛 · M2 베들레헴 · M3 예루살렘). partJeru(ctx, ts), ts = seconds into the shot
   (0 … 9.4; the Micah line is laid over the first ~3.6 s by film.html). */
(function () {
  const M = InkMap, { clamp, lerp, ss } = Pilot;
  const LAND = { scale: 320, lat: 32, lon0: 31, lat0: 36 };
  let ok = false, landMap, longWay, shortWay;
  // [ts, lon, lat, visible height in degrees]: the whole way north → the two towns
  const KEYS = [[0, 35.26, 32.24, 1.75], [3.0, 35.25, 32.12, 1.55], [6.2, 35.21, 31.74, .62], [9.4, 35.21, 31.74, .56]];
  function build() {
    M.projection(LAND);
    const D = Object.assign({}, M.MED, { extent: [39.5, 28.5], seed: 31, compass: [38.6, 29.4], grid: { lon: [31, 40], lat: [28, 36], step: 1 },
      seas: M.MED.seas.concat([[[35.52, 32.9], [35.6, 32.88], [35.65, 32.8], [35.62, 32.72], [35.57, 32.7], [35.52, 32.78]],
        [[35.4, 31.77], [35.56, 31.78], [35.6, 31.55], [35.55, 31.25], [35.47, 31.1], [35.38, 31.3], [35.42, 31.55]]]),
      ranges: [[35.0, 35.4, 31.3, 32.4, 16, 9, 13], [35.2, 35.6, 32.5, 33.2, 12, 8, 12], [35.6, 36.6, 33.2, 34.6, 14, 9, 13], [35.7, 36.2, 30.5, 31.6, 10, 8, 12]],
      desert: { lon: [34.2, 36.5], lat: [29.0, 31.0], n: 4000 } });
    landMap = M.build(D, { labels: [], cityDots: false });
    longWay = M.arcPts('nazareth', 'bethlehem', .14); shortWay = M.arcPts('jerusalem', 'bethlehem', .25);
    ok = true;
  }
  const zoomFor = (span, sc) => Pilot.H / (span * sc);
  window.partJeru = function (ctx, ts) {
    if (!ok) build();
    const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v', [lon, lat, span] = M.camAt(KEYS, ts), z = zoomFor(span, LAND.scale);
    ctx.fillStyle = M.BG; ctx.fillRect(0, 0, W, H); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    M.projection(LAND);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-M.mx(lon), -M.my(lat)); ctx.drawImage(landMap, 0, 0);
    // the long way of 2부, already there, fading as the camera leaves it
    { const a = .55 * (1 - ss(3.0, 5.4, ts)); if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = M.INK; ctx.lineWidth = 2.4 / z; ctx.setLineDash([3 / z, 9 / z]); M.partial(ctx, longWay, 1); ctx.restore(); } }
    M.cityLamp(ctx, 'nazareth', 1 - ss(2.6, 4.6, ts), z, ts, 2);
    // Jerusalem lights first (the king's city), then Bethlehem answers; a short dotted way between them
    M.cityLamp(ctx, 'jerusalem', ss(4.4, 5.2, ts), z, ts, 5);
    M.cityLamp(ctx, 'bethlehem', ss(5.6, 6.4, ts) * (1 + .3 * ss(6.4, 7.4, ts)), z, ts, 1);
    { const k = ss(6.6, 8.6, ts); if (k > 0) { ctx.save(); ctx.globalAlpha = .75; ctx.strokeStyle = M.INK; ctx.lineWidth = 3 / z; ctx.setLineDash([3 / z, 8 / z]); M.partial(ctx, shortWay, k); ctx.restore(); } }
    const S = V ? 1.5 : 1.25, L = id => Film.text(id);
    M.label(ctx, L('M1'), 'nazareth', (1 - ss(2.4, 4.0, ts)) * .9, { size: 42 * S / z * (span / 1.75), dx: -30 / z, dy: 40 / z, al: 'right' });
    M.label(ctx, L('M3'), 'jerusalem', ss(4.8, 5.8, ts), { size: 40 * S / z, dx: 28 / z, dy: -30 / z, al: 'left' });
    M.label(ctx, L('M2'), 'bethlehem', ss(6.0, 7.0, ts), { size: 40 * S / z, dx: 28 / z, dy: 36 / z, al: 'left' });
    ctx.restore();
    M.bands(ctx, V ? 300 : 170);
    // the Micah line lies over the first seconds: the map dims under it, then comes up
    { const d = .55 * (1 - ss(3.2, 4.4, ts)); if (d > 0) { ctx.fillStyle = `rgba(14,9,5,${d})`; ctx.fillRect(0, 0, W, H); } }
    { const y0 = Film.SAFE() - (V ? 300 : 140), g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, 'rgba(10,6,3,0)'); g.addColorStop(.3, 'rgba(10,6,3,.46)'); g.addColorStop(.55, 'rgba(10,6,3,.78)'); g.addColorStop(1, 'rgba(10,6,3,.9)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }
    W3.finish(ctx, ts + 142, { vignette: .4, grain: .05 });
  };
})();
