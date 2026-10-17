/* Pilot scenes — shared helpers.
   Every scene is a pure function of time: draw(ctx, t). The same page plays in a browser
   (with controls + synced audio) and is recorded frame by frame by motion/render.mjs (?render=1). */
(function () {
  const P = {};
  P.clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  P.lerp = (a, b, k) => a + (b - a) * k;
  P.ss = (a, b, x) => { const k = P.clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  P.eo = x => { x = P.clamp(x); return 1 - Math.pow(1 - x, 3); };
  P.eio = x => { x = P.clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  // fade window: 0 before a, ramps to 1 over fi, holds, ramps down to 0 ending at b
  P.win = (t, a, b, fi = .8, fo = .8) => P.ss(a, a + fi, t) * (1 - P.ss(b - fo, b, t));

  P.rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let r = Math.imul(seed ^ seed >>> 15, 1 | seed); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; };

  // value noise + fbm (deterministic)
  const hash = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
  P.noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  P.fbm = (x, y, o = 4) => { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * P.noise(x * f, y * f); f *= 2; a *= .5; } return s / (1 - Math.pow(.5, o)); };

  P.canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  P.hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  P.mix = (a, b, k) => [0, 1, 2].map(i => a[i] + (b[i] - a[i]) * k);
  P.rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  // colour keyframes [[t, '#hex'], ...] → rgb at t
  P.ramp = (keys, t) => { let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++; const a = keys[i], b = keys[i + 1]; return P.mix(P.hex(a[1]), P.hex(b[1]), P.ss(a[0], b[0], t)); };

  // a grey speckle texture (tooth / grain), centred on 128
  P.speckle = (w, h, amp, seed, blur = 0) => { const c = P.canvas(w, h), x = c.getContext('2d'), d = x.createImageData(w, h), r = P.rng(seed);
    for (let i = 0; i < w * h; i++) { const v = 128 + (r() - .5) * 2 * amp; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    x.putImageData(d, 0, 0); if (blur) { const c2 = P.canvas(w, h), x2 = c2.getContext('2d'); x2.filter = `blur(${blur}px)`; x2.drawImage(c, 0, 0); return c2; } return c; };

  // multi-line text; lines split on \n
  P.text = (ctx, s, x, y, o = {}) => {
    const size = o.size || 44, lh = size * (o.lh || 1.55), lines = String(s).split('\n');
    ctx.save(); ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; ctx.font = `${o.weight || 400} ${size}px ${o.font || "'Noto Serif KR',serif"}`;
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic';
    if (o.ls) ctx.letterSpacing = o.ls + 'px';
    if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.shadowBlur || 18; }
    ctx.fillStyle = o.color || '#f3ece0';
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
    ctx.restore();
  };

  // ---------------- harness ----------------
  P.run = async function (cfg) {
    const RENDER = /[?&]render=1/.test(location.search);
    const { W = 1920, H = 1080 } = cfg;
    document.documentElement.style.cssText = 'margin:0;height:100%;background:#000;overflow:hidden';
    document.body.style.cssText = 'margin:0;height:100%;background:#000;overflow:hidden';
    const cv = P.canvas(W, H); cv.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0';
    document.body.appendChild(cv); const ctx = cv.getContext('2d');
    const fit = () => { if (RENDER) return; const s = Math.min(innerWidth / W, innerHeight / H); cv.style.transform = `translate(${(innerWidth - W * s) / 2}px,${(innerHeight - H * s) / 2}px) scale(${s})`; };
    fit(); addEventListener('resize', fit);
    try { for (const f of (cfg.fonts || [])) await document.fonts.load(f); await document.fonts.ready; } catch (e) {}
    if (cfg.init) await cfg.init();
    const draw = t => { ctx.save(); cfg.draw(ctx, Math.max(0, Math.min(cfg.dur - 1e-3, t))); ctx.restore(); };
    window.seek = draw; window.DURATION = cfg.dur; draw(0); window.__ready = true;
    if (RENDER) return;

    // viewer: play/pause, scrub, synced audio (if the scene ships one)
    const ui = document.createElement('div');
    ui.style.cssText = 'position:fixed;left:0;right:0;bottom:0;display:flex;gap:10px;align-items:center;padding:12px max(16px,env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));background:linear-gradient(0deg,rgba(0,0,0,.85),rgba(0,0,0,0));font:14px/1 system-ui,sans-serif;color:#eee;transition:opacity .4s';
    ui.innerHTML = '<button id="pp" type="button" style="min-width:48px;padding:9px 12px;border-radius:10px;border:1px solid #555;background:#222;color:#eee;font:inherit">▶ 소리와 함께</button><input id="sk" type="range" min="0" max="1000" value="0" aria-label="재생 위치" style="flex:1;min-width:0;accent-color:#f0b860"><span id="tm" style="font-variant-numeric:tabular-nums;color:#aaa">0:00</span>';
    document.body.appendChild(ui);
    const au = cfg.audio ? new Audio(cfg.audio) : null; if (au) au.preload = 'auto';
    let cur = 0, playing = false, last = performance.now(), hideT;
    const pp = ui.querySelector('#pp'), sk = ui.querySelector('#sk'), tm = ui.querySelector('#tm');
    const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    const poke = () => { ui.style.opacity = 1; clearTimeout(hideT); hideT = setTimeout(() => playing && (ui.style.opacity = 0), 2500); };
    const setPlay = p => { playing = p; pp.textContent = p ? '❚❚' : '▶'; if (au) { if (p) { au.currentTime = cur; au.play().catch(() => {}); } else au.pause(); } poke(); };
    pp.onclick = () => setPlay(!playing);
    cv.addEventListener('click', () => setPlay(!playing));
    sk.oninput = () => { cur = sk.value / 1000 * cfg.dur; if (au) au.currentTime = cur; poke(); };
    addEventListener('pointermove', poke);
    (function loop(now) {
      if (playing) { cur = au && !au.paused ? au.currentTime : cur + Math.min(.1, (now - last) / 1000); if (cur >= cfg.dur) { cur = 0; if (au) au.currentTime = 0; } }
      last = now; draw(cur); sk.value = Math.round(cur / cfg.dur * 1000); tm.textContent = fmt(cur) + ' / ' + fmt(cfg.dur);
      requestAnimationFrame(loop);
    })(last);
  };
  window.Pilot = P;
})();
