/* Verse links — two verses, far apart in time, shown as one promise (after lib-film.js; uses W3.bloom when present).
   Film.link(ctx, t, idA, idB, a, b, { style }) draws verse A, then verse B, and the passage between them; each verse's
   script.json `hl` (the shared words) is lit in gold. One verse is read at a time; the link is made by light, not by a
   diagram line. Styles:
     carry   — A's other words go dark, its shared words gather into a point of light, the light moves a little and B
               forms around it: the same promise carried across time (one place on screen, nothing to follow)
     depth   — A recedes into the dark like something long ago (smaller, softer, dimmer) while B comes forward under it;
               the two shared phrases breathe in the same light
     horizon — one horizon of gold light; the camera trucks along it: A passes out to the left, B arrives from the right
               (time runs the way the film's thread runs)
     ember   — A's shared words break into gold embers that drift and settle into B's shared words
   Timing inside [a, b]: A in (0–.8 s), its words lit (1.4 s), the passage (4.2–6.8 s), B's words lit, out at b. */
(function () {
  const P = window.Pilot, F = window.Film, { clamp, lerp, ss, eio } = P;
  const GOLD = '#f2cf7a', B3 = (ctx, x, y, k, r) => window.W3 && W3.bloom(ctx, x, y, [255, 214, 150], k, { r, streak: .18 });

  // lay a verse out centred on (cx, cy): lines, and where its shared words sit
  function lay(ctx, id, cx, cy, size) {
    const txt = F.text(id), hl = (F.lines[id] || {}).hl || ''; ctx.save(); ctx.font = F.font(size, 600);
    const lines = F.wrapEven(ctx, txt, P.ori === 'v' ? P.W * .82 : P.W * .66), lh = size * 1.55, y0 = cy - (lines.length - 1) * lh / 2;
    const L = lines.map((l, i) => { const w = ctx.measureText(l).width, x0 = cx - w / 2, j = hl ? l.indexOf(hl) : -1;
      return { l, x0, y: y0 + i * lh, j, pre: j >= 0 ? ctx.measureText(l.slice(0, j)).width : 0, hw: j >= 0 ? ctx.measureText(hl).width : 0 }; });
    ctx.restore(); const h = L.find(r => r.j >= 0);
    return { id, hl, size, lh, L, cx, cy, y0, yEnd: y0 + (lines.length - 1) * lh, hx: h ? h.x0 + h.pre + h.hw / 2 : cx, hy: h ? h.y - size * .35 : cy };
  }
  // draw it: o.a overall alpha, o.rest alpha of the words that are not shared, o.hlk gold on the shared words, o.cite alpha
  function draw(ctx, v, o) {
    const a = o.a ?? 1; if (a <= .003) return; ctx.save();
    if (o.s && o.s !== 1) { ctx.translate(o.ox ?? v.cx, o.oy ?? v.cy); ctx.scale(o.s, o.s); ctx.translate(-(o.ox ?? v.cx), -(o.oy ?? v.cy)); }
    if (o.dx || o.dy) ctx.translate(o.dx || 0, o.dy || 0);
    if (o.blur) ctx.filter = `blur(${o.blur}px)`;
    ctx.font = F.font(v.size, 600); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 24;
    const rest = (o.rest ?? 1) * a, hla = (o.hla ?? o.rest ?? 1) * a, colA = o.col || [246, 234, 208], col = P.rgb(colA);
    for (const r of v.L) {
      if (r.j < 0) { ctx.globalAlpha = rest; ctx.fillStyle = col; ctx.fillText(r.l, r.x0, r.y); continue; }
      const pre = r.l.slice(0, r.j), mid = v.hl, post = r.l.slice(r.j + mid.length);
      ctx.globalAlpha = rest; ctx.fillStyle = col; if (pre) ctx.fillText(pre, r.x0, r.y); if (post) ctx.fillText(post, r.x0 + r.pre + r.hw, r.y);
      ctx.globalAlpha = hla; ctx.fillStyle = P.rgb(P.mix(colA, [242, 207, 122], o.hlk || 0)); ctx.fillText(mid, r.x0 + r.pre, r.y);
      if (o.hlk > 0) { ctx.shadowColor = 'rgba(233,185,73,.85)'; ctx.shadowBlur = 26 * o.hlk; ctx.globalAlpha = hla * o.hlk; ctx.fillStyle = GOLD; ctx.fillText(mid, r.x0 + r.pre, r.y); ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 24; }
    }
    const c = F.cite(v.id), ca = (o.cite ?? 1) * a; if (c && ca > .003) { ctx.shadowBlur = 12; ctx.globalAlpha = ca * .95; ctx.font = `400 ${P.ori === 'v' ? 28 : 26}px 'Noto Sans KR',sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#d9b56a'; ctx.fillText(c, v.cx, v.yEnd + v.size * .55 + 30); }
    ctx.restore();
  }
  // a verse's shared words as points (for embers)
  function points(v, step) { const c = P.canvas(P.W, P.H), g = c.getContext('2d'); g.font = F.font(v.size, 600); g.textBaseline = 'alphabetic'; g.fillStyle = '#fff';
    for (const r of v.L) if (r.j >= 0) g.fillText(v.hl, r.x0 + r.pre, r.y);
    const d = g.getImageData(0, 0, P.W, P.H).data, out = []; for (let y = 0; y < P.H; y += step) for (let x = 0; x < P.W; x += step) if (d[(y * P.W + x) * 4 + 3] > 120) out.push([x, y]); return out; }
  const cache = {};

  F.link = (ctx, t, idA, idB, a, b, o = {}) => {
    if (t < a - .1 || t > b + .1) return;
    const V = P.ori === 'v', W = P.W, H = P.H, style = o.style || 'carry', size = o.size || (V ? 54 : 48), cy = o.y || H * (V ? .42 : .44);
    const T0 = a + (o.pass ?? 4.2), T1 = T0 + 2.6, out = 1 - ss(b - .8, b, t), inA = ss(a, a + .8, t), hlA = ss(a + 1.4, a + 2.4, t), hlB = ss(T1 + .4, T1 + 1.4, t);
    const key = [idA, idB, style, P.ori].join('|'); let S = cache[key];
    if (!S) { S = cache[key] = {};
      if (style === 'depth') { S.A = lay(ctx, idA, W / 2, cy, size); S.B = lay(ctx, idB, W / 2, cy + H * (V ? .1 : .12), size); }
      else if (style === 'horizon') { S.line = cy + H * (V ? .07 : .1); S.A = lay(ctx, idA, W / 2, S.line - size * 2.2, size); S.B = lay(ctx, idB, W / 2, S.line - size * 2.2, size); }
      else { S.A = lay(ctx, idA, W / 2, cy, size); S.B = lay(ctx, idB, W / 2, cy, size); }
      if (style === 'ember') { S.pa = points(S.A, 3); S.pb = points(S.B, 3); const r = P.rng(7); S.seed = S.pa.map(() => [r(), r(), r()]); } }
    const { A, B } = S;
    if (style === 'carry') {
      const g = ss(T0, T0 + 1.1, t), m = eio(clamp((t - T0 - .9) / 1.6)), lit = ss(T0 + .6, T0 + 1.4, t) * (1 - ss(T1, T1 + .6, t));
      draw(ctx, A, { a: inA * out, rest: 1 - g, hla: 1 - ss(T0 + .7, T0 + 1.3, t), hlk: hlA, cite: 1 - g });
      // the shared words become one light; it moves to where the new words will be
      const lx = lerp(A.hx, B.hx, m), ly = lerp(A.hy, B.hy, m);
      if (lit > 0) { B3(ctx, lx, ly, .8 * lit * out, V ? 120 : 110); ctx.save(); ctx.globalAlpha = lit * out; ctx.fillStyle = 'rgb(255,244,214)'; ctx.beginPath(); ctx.arc(lx, ly, 4, 0, 6.283); ctx.fill(); ctx.restore(); }
      const flash = ss(T1 - .2, T1 + .3, t) * (1 - ss(T1 + .3, T1 + 1.4, t)); if (flash > 0) B3(ctx, B.hx, B.hy, .7 * flash * out, V ? 200 : 180);
      draw(ctx, B, { a: out, rest: ss(T1 + .2, T1 + 1.2, t), hla: ss(T1 - .2, T1 + .3, t), hlk: Math.max(hlB, ss(T1 - .2, T1 + .3, t)), cite: ss(T1 + .6, T1 + 1.4, t) });
    } else if (style === 'depth') {
      const r = eio(clamp((t - T0) / 2.6)), sync = .75 + .25 * Math.sin((t - T1) * 2.2);
      draw(ctx, A, { a: inA * out * lerp(1, .5, r), s: lerp(1, .6, r), ox: W / 2, oy: A.cy, dy: -H * (V ? .17 : .2) * r, blur: 1.6 * r, col: P.mix([246, 234, 208], [190, 196, 220], r), hlk: r > .9 ? hlA * sync : hlA, cite: 1 });
      const bin = ss(T0 + 1.2, T1 + .4, t); draw(ctx, B, { a: bin * out, s: lerp(1.08, 1, eio(bin)), hlk: hlB * (t > T1 + 1.4 ? sync : 1) });
    } else if (style === 'horizon') {
      const p = eio(clamp((t - T0) / 2.6)), span = W * 1.15, lineA = inA * out;
      // the horizon: a fine gold line across the frame, brightest in the middle; small motes on it show the camera moving
      ctx.save(); ctx.globalCompositeOperation = 'screen'; const gl = ctx.createLinearGradient(0, 0, W, 0); gl.addColorStop(0, 'rgba(255,214,140,0)'); gl.addColorStop(.5, `rgba(255,214,140,${.9 * lineA})`); gl.addColorStop(1, 'rgba(255,214,140,0)');
      for (const [w, al] of [[12, .12], [4, .4], [1.4, 1]]) { ctx.globalAlpha = al; ctx.fillStyle = gl; ctx.fillRect(0, S.line - w / 2, W, w); }
      ctx.globalAlpha = 1; const r = P.rng(3); for (let i = 0; i < 26; i++) { const x = ((r() * span * 3 - p * span) % (span * 3) + span * 3) % (span * 3) - span, k = 1 - Math.abs(x - W / 2) / (W * .6); if (k > 0) { ctx.fillStyle = `rgba(255,236,190,${.7 * k * lineA})`; ctx.fillRect(x, S.line - 1.5, 3, 3); } }
      ctx.restore();
      draw(ctx, A, { a: inA * out * (1 - ss(.55, .9, p)), dx: -span * p, hlk: hlA });
      draw(ctx, B, { a: out * ss(.1, .45, p), dx: span * (1 - p), hlk: hlB });
      if (p > 0 && p < 1) B3(ctx, W / 2, S.line, .5 * Math.sin(p * Math.PI) * out, V ? 140 : 120);
    } else if (style === 'ember') {
      const u = clamp((t - T0 - .4) / 2.4);
      draw(ctx, A, { a: inA * out, rest: 1 - ss(T0 - .4, T0 + .6, t), hla: 1 - ss(T0 + .2, T0 + .7, t), hlk: hlA, cite: 1 - ss(T0 - .4, T0 + .6, t) });
      if (u > 0 && u < 1.05) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const nb = S.pb.length;
        for (let i = 0; i < S.pa.length; i++) { const [ax, ay] = S.pa[i], [bx, by] = S.pb[Math.floor(i * nb / S.pa.length)], [r1, r2, r3] = S.seed[i];
          const ui = eio(clamp((u - r1 * .25) / .75)), lift = Math.sin(ui * Math.PI) * (60 + 120 * r2), sw = Math.sin(ui * Math.PI) * (r3 - .5) * 140;
          const x = lerp(ax, bx, ui) + sw + Math.sin(t * 3 + i) * 3 * Math.sin(ui * Math.PI), y = lerp(ay, by, ui) - lift;
          const al = (ui < .1 ? ui / .1 : ui > .92 ? (1 - ui) / .08 + .2 : 1) * out; ctx.fillStyle = `rgba(255,${200 + 40 * r2 | 0},140,${.75 * al})`; ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4); }
        ctx.restore(); B3(ctx, lerp(A.hx, B.hx, eio(u)), lerp(A.hy, B.hy, eio(u)) - 80 * Math.sin(u * Math.PI), .35 * Math.sin(u * Math.PI) * out, V ? 160 : 140); }
      draw(ctx, B, { a: out, rest: ss(T1 + .1, T1 + 1.1, t), hla: ss(T1 - .3, T1 + .3, t), hlk: Math.max(hlB, ss(T1 - .3, T1 + .3, t)), cite: ss(T1 + .6, T1 + 1.4, t) });
    }
  };
})();
