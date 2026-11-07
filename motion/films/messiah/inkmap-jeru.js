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
  const KEYS = [[0, 35.25, 31.75, 2.6], [3.0, 35.24, 31.68, 2.0], [6.2, 35.21, 31.6, 1.0], [9.6, 35.21, 31.59, .9]];   // 4차: partWay의 끝 화면에서 이어 받음, 두 마을은 화면 위쪽 절반에(아래는 자막 띠)
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
  // a way walked, in ink: bold dashes that read on a phone (the kit's trail is a hair at this zoom), a red head while it moves
  const way = (ctx, pts, k, z, a = 1) => { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = M.INK; ctx.lineWidth = 5 / z; ctx.setLineDash([13 / z, 9 / z]); const hd = M.partial(ctx, pts, k); ctx.setLineDash([]);
    if (k < 1) { ctx.fillStyle = M.RED; ctx.beginPath(); ctx.arc(hd[0], hd[1], 9 / z, 0, 6.283); ctx.fill(); } ctx.restore(); };
  // 4차 (2026-11-07, 관리자: "노란 선이 정신없이 많이 … 예쁘지도 않고 무슨 의미인지 모르겠어"): 2부의 실타래 지도 대신, N07 "나사렛에서
  // 베들레헴까지는, 걸어서 며칠 길." 한 줄만 보여 주는 같은 양피지 지도. 나사렛 등불("나사렛에서") → 베들레헴 등불("베들레헴까지는") →
  // 점선 길 하나가 남쪽으로 그어지고 카메라가 그 끝을 따라 내려가 두 마을을 한 화면에("걸어서 며칠 길"). 이 길은 7부 지도(partJeru)
  // 첫 화면에 그대로 남아 있다 — "며칠 길"과 "두어 시간". partWay(ctx, ts), ts = 0 … 7.6 (N07은 ts 0.7–4.2).
  // the words band darkens the lower half of a portrait frame, so the towns are kept in its upper half
  const WAY = [[0, 35.3, 32.42, 1.4], [.7, 35.3, 32.4, 1.45], [3.0, 35.25, 31.72, 2.9], [7.6, 35.25, 31.72, 2.75]];
  window.partWay = function (ctx, ts) {
    if (!ok) build();
    const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v', [lon, lat, span] = M.camAt(WAY, ts), z = zoomFor(span, LAND.scale);
    ctx.fillStyle = M.BG; ctx.fillRect(0, 0, W, H); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    M.projection(LAND);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-M.mx(lon), -M.my(lat)); ctx.drawImage(landMap, 0, 0);
    M.cityLamp(ctx, 'nazareth', ss(.2, 1.0, ts), z, ts, 2);
    M.cityLamp(ctx, 'bethlehem', ss(2.3, 3.0, ts) * (1 + .3 * ss(4.2, 5.2, ts)), z, ts, 1);
    { const k = ss(1.2, 4.4, ts); if (k > 0) way(ctx, longWay, k, z, .9); }
    const S = V ? 1.5 : 1.25, L = id => Film.text(id);
    M.label(ctx, L('M1'), 'nazareth', ss(.5, 1.3, ts), { size: 40 * S / z, dx: -30 / z, dy: 36 / z, al: 'right' });
    M.label(ctx, L('M2'), 'bethlehem', ss(2.5, 3.2, ts), { size: 40 * S / z, dx: -30 / z, dy: 36 / z, al: 'right' });
    ctx.restore();
    M.bands(ctx, V ? 300 : 170);
    { const y0 = Film.SAFE() - (V ? 300 : 140), g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, 'rgba(10,6,3,0)'); g.addColorStop(.3, 'rgba(10,6,3,.46)'); g.addColorStop(.55, 'rgba(10,6,3,.78)'); g.addColorStop(1, 'rgba(10,6,3,.9)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }
    W3.finish(ctx, ts + 33, { vignette: .4, grain: .05 });
  };
  window.partJeru = function (ctx, ts) {
    if (!ok) build();
    const W = Pilot.W, H = Pilot.H, V = Pilot.ori === 'v', [lon, lat, span] = M.camAt(KEYS, ts), z = zoomFor(span, LAND.scale);
    ctx.fillStyle = M.BG; ctx.fillRect(0, 0, W, H); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    M.projection(LAND);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-M.mx(lon), -M.my(lat)); ctx.drawImage(landMap, 0, 0);
    // the long way of 2부, already there, fading as the camera leaves it
    way(ctx, longWay, 1, z, .9 - .55 * ss(3.0, 5.4, ts));   // 4차: partWay의 그 점선 그대로, 끝까지 흐리게 남음(며칠 길 ↔ 두어 시간)
    M.cityLamp(ctx, 'nazareth', 1 - ss(2.6, 4.6, ts), z, ts, 2);
    // Jerusalem lights first (the king's city), then Bethlehem answers; a short dotted way between them
    M.cityLamp(ctx, 'jerusalem', ss(4.4, 5.2, ts), z, ts, 5);
    M.cityLamp(ctx, 'bethlehem', ss(5.6, 6.4, ts) * (1 + .3 * ss(6.4, 7.4, ts)), z, ts, 1);
    { const k = ss(6.6, 8.6, ts); if (k > 0) way(ctx, shortWay, k, z); }
    const S = V ? 1.5 : 1.25, L = id => Film.text(id);
    M.label(ctx, L('M1'), 'nazareth', (1 - ss(2.4, 4.0, ts)) * .9, { size: 40 * S / z, dx: -30 / z, dy: 36 / z, al: 'right' });
    M.label(ctx, L('M3'), 'jerusalem', ss(4.8, 5.8, ts), { size: 40 * S / z, dx: 28 / z, dy: -30 / z, al: 'left' });
    M.label(ctx, L('M2'), 'bethlehem', ss(6.0, 7.0, ts), { size: 40 * S / z, dx: 28 / z, dy: 36 / z, al: 'left' });
    ctx.restore();
    M.bands(ctx, V ? 300 : 170);
    // the Micah line lies over the first seconds: the map dims under it, then comes up
    { const d = .55 * (1 - ss(4.2, 5.2, ts)); if (d > 0) { ctx.fillStyle = `rgba(14,9,5,${d})`; ctx.fillRect(0, 0, W, H); } }
    { const y0 = Film.SAFE() - (V ? 300 : 140), g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, 'rgba(10,6,3,0)'); g.addColorStop(.3, 'rgba(10,6,3,.46)'); g.addColorStop(.55, 'rgba(10,6,3,.78)'); g.addColorStop(1, 'rgba(10,6,3,.9)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }
    W3.finish(ctx, ts + 142, { vignette: .4, grain: .05 });
  };
})();
