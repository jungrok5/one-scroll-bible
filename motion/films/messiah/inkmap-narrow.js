/* inkmap-narrow.js — 「메시아」 2부 끝 "약속은 점점 좁혀졌습니다" → 3부 첫 "나사렛"을 양피지 잉크 지도로 (2026-11-03 2차;
   kit-inkmap.js = motion-skills kits/inkmap, vendored). One camera over the map, no cut (51.0–70.6 s):
   "모든 사람 가운데" — gold threads rise from all over the ancient world; "아브라함의 자손으로, 유다 지파로, 다윗의 집안으로" — they gather
   into the land and narrow; "베들레헴으로" — one strand ends at one small town, whose lamp lights (S3b 57.6). "그런데 … 북쪽 갈릴리의
   나사렛" — the camera goes north and Nazareth's lamps light (E4 64.0); a faint dotted way between the two towns.
   Two sheets of the same map: the whole Mediterranean (52 px/°) and the land itself (320 px/°, with the Sea of Galilee and the
   Dead Sea), cross-faded where the views match — so the towns are far enough apart on a phone and the sheet never blurs.
   Camera keys give the visible height in degrees of latitude. Place names are the script's label lines (M1–M5). */
(function () {
  const M = InkMap, { clamp, lerp, ss, eio, rng } = Pilot;
  const WIDE = { scale: 52, lat: 35, lon0: -14, lat0: 58 }, LAND = { scale: 320, lat: 32, lon0: 31, lat0: 36 };
  let ok = false, wideMap, landMap, threads, strand, way;
  const KEYS = [[51.0, 28, 36, 40], [54.4, 35.4, 33.2, 11], [56.9, 35.2, 32.0, 3.6], [58.4, 35.2, 31.78, 1.5], [62.6, 35.2, 31.82, 1.45], [65.6, 35.28, 32.25, 2.0], [70.6, 35.3, 32.62, 1.25]];
  function build() {
    M.projection(WIDE); wideMap = M.build(M.MED, { labels: [], cityDots: false });
    const r = rng(17), gate = [36.0, 33.3], judah = [35.15, 31.95];
    threads = []; for (let i = 0; i < 26; i++) { const s = [lerp(2, 56, r()), lerp(27, 44, r())], g = [gate[0] + (r() - .5) * .9, gate[1] + (r() - .5) * .9];
      threads.push(M.arcPts(s, g, (r() - .5) * .5).concat(M.arcPts(g, judah, (r() - .5) * .2).slice(1))); }
    M.projection(LAND);
    const D = Object.assign({}, M.MED, { extent: [39.5, 28.5], seed: 31, compass: [38.6, 29.4], grid: { lon: [31, 40], lat: [28, 36], step: 1 },
      seas: M.MED.seas.concat([[[35.52, 32.9], [35.6, 32.88], [35.65, 32.8], [35.62, 32.72], [35.57, 32.7], [35.52, 32.78]],                          // the Sea of Galilee
        [[35.4, 31.77], [35.56, 31.78], [35.6, 31.55], [35.55, 31.25], [35.47, 31.1], [35.38, 31.3], [35.42, 31.55]]]),                            // the Dead Sea
      ranges: [[35.0, 35.4, 31.3, 32.4, 16, 9, 13], [35.2, 35.6, 32.5, 33.2, 12, 8, 12], [35.6, 36.6, 33.2, 34.6, 14, 9, 13], [35.7, 36.2, 30.5, 31.6, 10, 8, 12]],   // Judea, Galilee, Lebanon, Moab
      desert: { lon: [34.2, 36.5], lat: [29.0, 31.0], n: 4000 } });
    landMap = M.build(D, { labels: [], cityDots: false });
    strand = M.arcPts([35.15, 31.95], 'bethlehem', .1); way = M.arcPts('nazareth', 'bethlehem', .14);
    ok = true;
  }
  // the camera: [lon, lat, visible height in degrees] → a zoom for a sheet of `scale` px per degree
  const zoomFor = (span, sc) => Pilot.H / (span * sc);
  function sheet(ctx, map, lon, lat, z, a) { ctx.save(); ctx.globalAlpha = a; ctx.translate(Pilot.W / 2, Pilot.H / 2); ctx.scale(z, z); ctx.translate(-M.mx(lon), -M.my(lat)); ctx.drawImage(map, 0, 0); }
  window.partNarrow = function (ctx, t) {
    if (!ok) build();
    const [lon, lat, span] = M.camAt(KEYS, t), V = Pilot.ori === 'v', land = ss(56.0, 57.2, t);
    ctx.fillStyle = M.BG; ctx.fillRect(0, 0, Pilot.W, Pilot.H); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // the whole world, and the many threads gathering into the land (51.6 → 55.6)
    if (land < 1) { M.projection(WIDE); const z = zoomFor(span, WIDE.scale); sheet(ctx, wideMap, lon, lat, z, 1);
      const p = ss(51.6, 55.6, t); ctx.globalAlpha = .85; for (const th of threads) { ctx.shadowColor = 'rgba(255,200,90,.95)'; ctx.shadowBlur = 14; ctx.strokeStyle = '#f6d27a'; ctx.lineWidth = 5 / z; M.partial(ctx, th, p); } ctx.restore(); }
    // the land: one strand left, to Bethlehem; the lamps; the names
    if (land > 0) { M.projection(LAND); const z = zoomFor(span, LAND.scale); sheet(ctx, landMap, lon, lat, z, land); ctx.globalAlpha = land;
      M.goldRoute(ctx, strand, ss(56.4, 58.0, t), z);
      M.cityLamp(ctx, 'bethlehem', ss(57.6, 58.4, t) * (1 + .3 * ss(58, 59, t)), z, t, 1);
      M.cityLamp(ctx, 'nazareth', ss(64.0, 64.8, t), z, t, 2); M.cityLamp(ctx, [35.24, 32.73], ss(65.4, 66.2, t) * .7, z, t, 3); M.cityLamp(ctx, [35.34, 32.69], ss(66.8, 67.6, t) * .6, z, t, 4);
      { const k = ss(66.4, 69.6, t); if (k > 0) { ctx.save(); ctx.globalAlpha = .55 * land; ctx.strokeStyle = M.INK; ctx.lineWidth = 2.4 / z; ctx.setLineDash([3 / z, 9 / z]); M.partial(ctx, way, k); ctx.restore(); } }
      const L = id => Film.text(id), S = V ? 1.2 : 1;
      const region = (s, p, a, size) => { if (a <= 0) return; const [px, py] = M.P(p); ctx.save(); ctx.globalAlpha = a * land; ctx.font = `600 ${size}px ${M.FONT}`; ctx.letterSpacing = (size * .3) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round'; ctx.lineWidth = size * .22; ctx.strokeStyle = 'rgba(236,224,198,.85)'; ctx.strokeText(s, px, py); ctx.fillStyle = M.INK; ctx.fillText(s, px, py); ctx.restore(); };   // a region: no dot
      region(L('M5'), [34.92, 31.98], ss(57.0, 58.0, t) * (1 - ss(62.8, 63.8, t)), 56 * S / z);
      M.label(ctx, L('M2'), 'bethlehem', ss(57.8, 58.8, t) * land, { size: 42 * S / z, dx: 18 / z, dy: 34 / z, al: 'left' });
      M.label(ctx, L('M3'), 'jerusalem', ss(59.4, 60.4, t) * .8 * land, { size: 34 * S / z, dx: 18 / z, dy: -28 / z, al: 'left' });
      region(L('M4'), [35.55, 33.05], ss(63.8, 64.8, t), 56 * S / z);
      M.label(ctx, L('M1'), 'nazareth', ss(64.4, 65.4, t) * land, { size: 42 * S / z, dx: -18 / z, dy: 34 / z, al: 'right' });
      ctx.restore(); }
    M.bands(ctx, V ? 300 : 170, Film.SAFE() - (V ? 170 : 80));
    W3.finish(ctx, t, { vignette: .4, grain: .05 });
  };
})();
