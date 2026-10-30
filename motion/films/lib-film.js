/* Short films (motion/films/<slug>/film.html) — one page per film, drawn with motion/pilot/lib.js (Pilot).
   Text comes from the film's script.json by line id, never from strings inside the drawing code:
     script.json      { lines: [{ id, kind: narr|quote|label, text, voice, cite, usfm }] }   (Korean, the source)
     i18n/<lang>.json { "_dir": "ltr|rtl", "_fonts": {…}, "<id>": { "text": "…", "cite": "…" } }   (quote text = that
                      language's own Bible, verbatim — never translated)
   A '/' in a text is a preferred line break; anything longer than the frame wraps at spaces (or anywhere, for scripts
   without spaces). Narration sits in one place (Film.sub), clear of the phone UI at the bottom of a portrait frame. */
(function () {
  const P = window.Pilot, F = {};
  F.lines = {}; F.lang = P.lang;
  const get = (url) => new Promise((ok, no) => { const x = new XMLHttpRequest(); x.open('GET', url);
    x.onload = () => { try { ok(JSON.parse(x.responseText)); } catch (e) { no(e); } }; x.onerror = no; x.send(); });
  F.load = async () => {
    const s = await get('script.json'); F.script = s;
    for (const l of s.lines) F.lines[l.id] = { ...l };
    if (P.lang !== 'ko') { try { const j = await get('i18n/' + P.lang + '.json');
      for (const [id, v] of Object.entries(j)) if (F.lines[id] && v && typeof v === 'object') Object.assign(F.lines[id], v);
    } catch (e) { console.warn('no film language file for', P.lang); } }
  };
  F.text = id => (F.lines[id] || {}).text || '';
  F.cite = id => { const l = F.lines[id] || {}; return l.cite ? l.cite + (P.lang === 'ko' ? ' (개역개정)' : '') : ''; };

  // break a text into lines that fit maxW: '/' first, then spaces, then characters
  F.wrap = (ctx, s, maxW, joinIfFits = false) => {
    const segs = String(s).split(/\s*\/\s*/);
    if (joinIfFits) { const one = segs.join(' '); if (ctx.measureText(one).width <= maxW) return [one]; }
    const out = [];
    for (const seg of segs) {
      if (ctx.measureText(seg).width <= maxW) { out.push(seg); continue; }
      const words = /\s/.test(seg) ? seg.split(/(?<=\s)/) : P.chars(seg);
      let cur = '';
      for (const w of words) { if (cur && ctx.measureText(cur + w).width > maxW) { out.push(cur.trim()); cur = w.trimStart(); } else cur += w; }
      if (cur.trim()) out.push(cur.trim());
    }
    return out;
  };
  // the same, but each '/' segment that has to wrap is re-wrapped to even line lengths (no one-word last line)
  F.wrapEven = (ctx, s, maxW) => String(s).split(/\s*\/\s*/).flatMap(seg => {
    const a = F.wrap(ctx, seg, maxW); if (a.length < 2) return a;
    let lo = ctx.measureText(seg).width / a.length, best = a;
    for (let w = lo; w <= maxW; w += 8) { const b = F.wrap(ctx, seg, w); if (b.length === a.length) { best = b; break; } }
    return best; });
  F.font = (size, weight = 400, serif = true) => `${weight} ${size}px ${serif ? "'Noto Serif KR',serif" : "'Noto Sans KR',sans-serif"}`;

  // draw lines centred at (x, y = first baseline); per-character alpha via o.charAlpha(i, n) → 0..1 (i counts graphemes
  // across all lines). Returns the block height.
  F.block = (ctx, lines, x, y, o = {}) => {
    const size = o.size || 48, lh = size * (o.lh || 1.6); ctx.save();
    ctx.font = F.font(size, o.weight || 400, o.serif !== false); ctx.textBaseline = 'alphabetic';
    if (P.dir === 'rtl') ctx.direction = 'rtl';
    if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.shadowBlur || 18; }
    const total = lines.reduce((n, l) => n + P.chars(l).length, 0); let k = 0;
    lines.forEach((l, i) => {
      const ly = y + i * lh, col = (o.lineColor && o.lineColor(i)) || o.color || '#f3ece0';
      if (!o.charAlpha) { ctx.textAlign = 'center'; ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * ((o.lineAlpha && o.lineAlpha(i)) ?? 1); ctx.fillStyle = col; ctx.fillText(l, x, ly); k += P.chars(l).length; return; }
      // per character: lay out from the measured prefix widths so kerning/joining stays close to the whole-line look
      const cs = P.chars(l), w = ctx.measureText(l).width; ctx.textAlign = 'left'; let pre = '';
      for (const c of cs) { const a = o.charAlpha(k++, total, i);
        const cx = P.dir === 'rtl' ? x + w / 2 - ctx.measureText(pre + c).width : x - w / 2 + ctx.measureText(pre).width; pre += c;
        if (a <= 0.004) continue; const g = o.charGlow ? o.charGlow(k - 1, total) : 0;
        ctx.globalAlpha = a * (o.alpha == null ? 1 : o.alpha) * ((o.lineAlpha && o.lineAlpha(i)) ?? 1);
        ctx.fillStyle = g > 0 ? P.rgb(P.mix(P.hex(col.length === 7 ? col : '#f3ece0'), [255, 150, 60], g)) : col;
        ctx.fillText(c, cx, ly); }
    });
    ctx.restore(); return lines.length * lh;
  };

  // narration subtitle: the one place spoken words appear (always on screen — deaf viewers read every word)
  // The narration is anchored by its LAST line to one fixed baseline near the bottom (a longer translation grows upward),
  // and every picture keeps clear of the band above it (F.SAFE: the lowest y a picture may use) — so the words never sit on art.
  F.subBottom = () => P.ori === 'v' ? P.H * .79 : P.H - 104;
  F.SAFE = () => P.ori === 'v' ? P.H * .68 : P.H - 270;
  F.sub = (ctx, id, t, a, b, o = {}) => {
    const k = P.win(t, a, b, o.fi || .6, o.fo || .6); if (k <= 0) return;
    const size = o.size || (P.ori === 'v' ? 54 : 50); ctx.save(); ctx.font = F.font(size, 600);
    // landscape: one line if it fits, else the whole sentence re-broken into even lines (the '/' breaks are for portrait)
    const txt = F.text(id), mw = P.W * .72, segs = txt.split(/\s*\/\s*/);
    const lines = P.ori === 'v' ? F.wrap(ctx, txt, P.W - 140)
      : segs.length <= 2 ? F.wrap(ctx, txt, mw, true)                       // one line, or its own two natural lines
      : F.wrapEven(ctx, segs.join(' '), mw); ctx.restore();                   // three or more pieces: two even lines
    const lh = size * 1.55, rise = (1 - P.eo(P.clamp((t - a) / 1.2))) * 10, y = (o.y != null ? o.y - (lines.length - 1) * lh / 2 : F.subBottom() - (lines.length - 1) * lh) + rise;
    F.block(ctx, lines, P.W / 2, y, { size, weight: 600, alpha: k, color: o.color || '#f3ece0', shadow: 'rgba(0,0,0,.85)', shadowBlur: 22, lh: 1.55 });
  };
  // a verse on screen: the text (that language's Bible, verbatim) with its reference under it
  F.quote = (ctx, id, t, a, b, o = {}) => {
    const k = P.win(t, a, b, o.fi || .8, o.fo || .7); if (k <= 0) return;
    const size = o.size || (P.ori === 'v' ? 56 : 54); ctx.save(); ctx.font = F.font(size, 600);
    const txt = o.join ? F.text(id).replace(/\s*\/\s*/g, ' ') : F.text(id), lines = F.wrapEven(ctx, txt, o.maxW || (P.ori === 'v' ? P.W - 150 : P.W * .7)); ctx.restore();   // o.join: ignore the portrait breaks
    const lh = size * 1.55, rise = (1 - P.eo(P.clamp((t - a) / 1.4))) * 12;
    const y0 = (o.bottom != null ? o.bottom - 50 - (lines.length - 1) * lh : (o.y || P.H * .45) - (lines.length - 1) * lh / 2) + rise;   // o.bottom: the cite sits on it
    const x = o.x || P.W / 2;
    F.block(ctx, lines, x, y0, { size, weight: 600, alpha: k, color: o.color || '#f6ead0', shadow: o.shadow || 'rgba(0,0,0,.9)', shadowBlur: 26, lh: 1.55, ...(o.block || {}) });
    // o.hl: words to light in gold (the same words in two verses), o.hlk 0..1 — left-to-right scripts only
    if (o.hl && o.hlk > 0 && P.dir !== 'rtl') { ctx.save(); ctx.font = F.font(size, 600); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      lines.forEach((l, i) => { const j = l.indexOf(o.hl); if (j < 0) return; const lw = ctx.measureText(l).width, px = x - lw / 2 + ctx.measureText(l.slice(0, j)).width, py = y0 + i * lh;
        ctx.globalAlpha = k * o.hlk; ctx.shadowColor = 'rgba(233,185,73,.85)'; ctx.shadowBlur = 24 * o.hlk; ctx.fillStyle = '#f2cf7a'; ctx.fillText(o.hl, px, py); ctx.shadowBlur = 0; ctx.fillText(o.hl, px, py); }); ctx.restore(); }
    const c = F.cite(id); if (c) P.text(ctx, c, x, y0 + lines.length * lh - size * .35 + 18, { size: P.ori === 'v' ? 28 : 26, font: "'Noto Sans KR',sans-serif",
      color: o.citeColor || '#d9b56a', alpha: k * .95, shadow: o.citeShadow || 'rgba(0,0,0,.9)', shadowBlur: 12 });
  };
  // a section label (on screen only): small, tracked, gold, at the top — clear of the phone UI
  F.label = (ctx, id, t, a, b) => { const k = P.win(t, a, b, .8, .8); if (k <= 0) return;
    P.text(ctx, F.text(id), P.W / 2, P.ori === 'v' ? 226 : 66, { size: P.ori === 'v' ? 38 : 34, weight: 600, color: '#e9c77a', alpha: k * .95, ls: 4, shadow: 'rgba(0,0,0,.9)', shadowBlur: 14 }); };
  window.Film = F;
})();
