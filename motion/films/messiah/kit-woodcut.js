/* Woodcut — a relief print drawn in code. Our own renderer; the craft follows the woodcut brief of Lemo-Opuscar
   (github.com/lemomo-ai/lemo-opuscar styles/woodcut, MIT) and the wordless woodcut novels (Masereel, Ward) — no code or
   plates copied. Rules of the medium:
     · black is the wood left standing (it takes ink), white is what the knife cut away (the paper shows);
     · light is carved: bright = many wide cuts, dark = untouched wood; cut direction follows the form;
     · every cut is one stroke of a tool (blunt entry, tapered exit, chipped edges), never a machine line;
     · at most one colour plate, and it shows only through the cuts (here: gold, for the promise).
   A plate is authored in frame units (Pilot.W × Pilot.H) and kept at RES× resolution so the camera can push in.
   API: const pl = Woodcut.plate(seed, build)   build(pl) adds regions, cuts and gold plates once (init)
        pl.region(id, path2d|fn)  pl.reg(x,y)   pl.cut(pts, w, o)   pl.hatch(lines, o)   pl.stabs(list, o)
        pl.halo(path2d-points, o)  pl.gold(fn(g, t))   pl.render(ctx, t, cam = {x, y, z})   Woodcut.brayer(ctx, k)  */
(function () {
  const P = Pilot, { clamp, lerp } = P, RES = 1.25;
  const INK = '#16120e', PAPER = '#ebe1c9';
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const vn = (x, s) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f), a = hash(i * 1.37 + s * 17.1), b = hash((i + 1) * 1.37 + s * 17.1); return a + (b - a) * u; };

  // ---- one cut: the half-width along the stroke from the tool's profile -----------------------------------------------
  function profile(kind, s, L, w) {
    if (kind === 'stab') { const u = clamp(s / Math.max(L, .01)); return Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.3)), .6) * (1 - .3 * u); }
    if (kind === 'u') { const a = clamp(s / (.5 * w + .5)), b = clamp((L - s) / (.8 * w + .5)); return Math.sqrt(1 - (1 - a) * (1 - a)) * Math.sqrt(1 - (1 - b) * (1 - b)); }
    if (kind === 'k') return Math.pow(clamp(s / (1.4 * w + 1)), .5) * Math.pow(clamp((L - s) / (2.8 * w + 2)), .6);
    const a = clamp(s / (.9 * w + 1)), b = clamp((L - s) / (2.6 * w + 2));   // 'v' gouge: fairly blunt entry, long pointed exit
    return (.38 + .62 * a * (2 - a)) * Math.pow(b, .75);
  }
  function cutPath(g, c, pr) {
    const p = c.p, n = p.length >> 1; if (n < 2 || pr <= 0) return;
    const C = new Float32Array(n); let L = 0;
    for (let i = 1; i < n; i++) { L += Math.hypot(p[2 * i] - p[2 * i - 2], p[2 * i + 1] - p[2 * i - 1]); C[i] = L; }
    if (L < .4) return;
    const Lv = L * pr, live = pr < 1, Ls = [], Rs = [];
    for (let i = 0; i < n; i++) {
      let s = C[i], x = p[2 * i], y = p[2 * i + 1];
      if (s > Lv) { const f = (Lv - C[i - 1]) / Math.max(1e-6, s - C[i - 1]); x = p[2 * i - 2] + (x - p[2 * i - 2]) * f; y = p[2 * i - 1] + (y - p[2 * i - 1]) * f; s = Lv; }
      const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1); let tx = p[2 * i1] - p[2 * i0], ty = p[2 * i1 + 1] - p[2 * i0 + 1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const w = c.w.length ? c.w[i] : c.w;
      let hw = .5 * w * profile(c.kind, s, live ? Math.min(L, Lv + 6) : L, w); if (live) hw *= Math.sqrt(clamp((Lv - s) / 6 + .15));
      const el = 1 + c.chip * ((vn(s * .2, c.seed) - .5) * 2 + .8 * (vn(s * .9, c.seed + 3) - .5)), er = 1 + c.chip * ((vn(s * .2, c.seed + 7) - .5) * 2 + .8 * (vn(s * .9, c.seed + 11) - .5));
      Ls.push(x - ty * hw * el, y + tx * hw * el); Rs.push(x + ty * hw * er, y - tx * hw * er);
      if (s >= Lv) break;
    }
    const m = Ls.length >> 1; if (m < 2) return;
    g.moveTo(Ls[0], Ls[1]); for (let i = 1; i < m; i++) g.lineTo(Ls[2 * i], Ls[2 * i + 1]);
    for (let i = m - 1; i >= 0; i--) g.lineTo(Rs[2 * i], Rs[2 * i + 1]); g.closePath();
  }
  const progress = (c, t) => { const u = clamp((t - c.t0) / c.dur); return u < 1 ? u * (.55 + .45 * u) : 1; };

  // ---- polylines -----------------------------------------------------------------------------------------------------
  function resample(pts, step) { const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], d = Math.hypot(bx - ax, by - ay), k = Math.max(1, Math.ceil(d / step)); for (let j = 1; j <= k; j++) out.push([ax + (bx - ax) * j / k, ay + (by - ay) * j / k]); } return out; }

  function plate(seed, build) {
    const W = P.W, H = P.H, pw = Math.round(W * RES), ph = Math.round(H * RES), rnd = P.rng(seed);
    const pl = { W, H, rnd, cuts: [], golds: [], regions: [], seed };
    // region raster: one id per pixel (0 = none); later regions paint over earlier ones (draw back to front)
    const rc = P.canvas(Math.ceil(W / 2), Math.ceil(H / 2)), rg = rc.getContext('2d', { willReadFrequently: true }); rg.scale(.5, .5);
    let rdata = null;
    pl.region = (id, draw) => { rg.fillStyle = `rgb(${id},0,0)`; if (typeof draw === 'function') { rg.beginPath(); draw(rg); rg.fill(); } else rg.fill(draw); rdata = null; };
    pl.reg = (x, y) => { if (!rdata) rdata = rg.getImageData(0, 0, rc.width, rc.height).data; const xi = Math.round(x / 2), yi = Math.round(y / 2); if (xi < 0 || yi < 0 || xi >= rc.width || yi >= rc.height) return 0; return rdata[(yi * rc.width + xi) * 4]; };
    pl.cut = (pts, w, o = {}) => {   // short cuts are resampled so the tool profile has points to swell between
      if (Array.isArray(pts[0]) && typeof w === 'number') pts = resample(pts, Math.max(1.5, Math.min(4, w * .5)));
      const flat = pts.length && Array.isArray(pts[0]) ? pts.flat() : pts; pl.cuts.push({ p: Float32Array.from(flat), w: typeof w === 'number' ? w : Float32Array.from(w), kind: o.kind || 'v', seed: o.seed ?? rnd() * 1000, t0: o.t0 ?? -1e9, dur: o.dur ?? .25, chip: o.chip ?? .16 }); };
    // hatch: walk each line; where `keep(x,y)` holds and the tone (0 dark … 1 bright) passes `thr`, lay cuts whose width
    // follows the tone; cuts break at random lengths (each is one stroke of the gouge)
    pl.hatch = (lines, o) => {
      const step = o.step || 3, [l0, l1] = o.len || [40, 160], [g0, g1] = o.gap || [4, 22], thr = o.thr ?? .06, wmin = o.wmin ?? .8, wmax = o.wmax ?? 6, gam = o.gamma ?? 1;
      for (const line of lines) {
        const pts = resample(line, step); let run = [], ws = [], want = lerp(l0, l1, rnd()), skip = 0;
        const flush = () => { if (run.length > 2) pl.cut(run, ws, { kind: o.kind, t0: o.t0 ? o.t0(run[0][0], run[0][1], rnd) : undefined, dur: o.dur, chip: o.chip }); run = []; ws = []; want = lerp(l0, l1, rnd()); };
        for (const [x, y] of pts) {
          if (skip > 0) { skip -= step; continue; }
          const ok = (!o.keep || o.keep(x, y)), tone = ok ? o.tone(x, y) : 0;
          if (tone > thr) { run.push([x, y]); ws.push(wmin + (wmax - wmin) * Math.pow(clamp((tone - thr) / (1 - thr)), gam)); if (run.length * step > want) { flush(); skip = lerp(g0, g1, rnd()); } }
          else if (run.length) flush();
        }
        flush();
      }
    };
    pl.stabs = (list, o = {}) => { for (const [x, y, r] of list) { const a = rnd() * 6.283, d = r * (1.2 + rnd()), t0 = o.t0 ? o.t0(x, y, rnd) : undefined; pl.cut([[x - Math.cos(a) * d / 2, y - Math.sin(a) * d / 2], [x + Math.cos(a) * d / 2, y + Math.sin(a) * d / 2]], r * 2, { kind: 'stab', t0, dur: .12, chip: .25 }); } };
    // a white knife line just outside a silhouette (so a black figure reads against black ground)
    pl.halo = (pts, o = {}) => { const all = resample(pts, 3); let i = 0; while (i < all.length - 3) { const n = Math.round(lerp(10, 40, rnd())), seg = all.slice(i, i + n + 1); if (seg.length > 2) pl.cut(seg, o.w || 2.4, { kind: 'k', chip: .2, t0: o.t0 ? o.t0(seg[0][0], seg[0][1], rnd) : undefined, dur: o.dur }); i += n + Math.round(lerp(1, 4, rnd())); } };
    pl.gold = fn => pl.golds.push(fn);
    build(pl);

    // ink: textured once (mottled, wood grain streaks, specks where the ink did not take); untimed cuts removed once
    const base = P.canvas(pw, ph), bg = base.getContext('2d');
    bg.fillStyle = INK; bg.fillRect(0, 0, pw, ph);
    { const d = bg.getImageData(0, 0, pw, ph), a = d.data, r2 = P.rng(seed + 9);
      for (let y = 0; y < ph; y++) { const grain = .5 + .5 * Math.sin(y * .9 + 3 * Math.sin(y * .013) + seed); for (let x = 0; x < pw; x++) { const i = (y * pw + x) * 4, n = (r2() - .5) * 10 + grain * 5 + 6 * (P.noise(x * .02, y * .02) - .5);
        a[i] += n; a[i + 1] += n; a[i + 2] += n; if (r2() < .0016) a[i + 3] = 40; } }
      bg.putImageData(d, 0, 0); }
    bg.save(); bg.scale(RES, RES); bg.globalCompositeOperation = 'destination-out'; bg.fillStyle = '#000'; bg.beginPath();
    pl.timed = []; for (const c of pl.cuts) { if (c.t0 < -1e8) cutPath(bg, c, 1); else pl.timed.push(c); } bg.fill(); bg.restore();
    const work = P.canvas(pw, ph), wg = work.getContext('2d');
    // paper: warm laid paper with fibre and a faint chain-line rhythm
    const paper = P.canvas(pw, ph), pg = paper.getContext('2d'); pg.fillStyle = PAPER; pg.fillRect(0, 0, pw, ph);
    { const d = pg.getImageData(0, 0, pw, ph), a = d.data, r3 = P.rng(seed + 21);
      for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) { const i = (y * pw + x) * 4, n = (r3() - .5) * 9 + 5 * (P.noise(x * .05, y * .4) - .5) - (x % 46 < 2 ? 3 : 0); a[i] += n; a[i + 1] += n; a[i + 2] += n * 1.1; }
      pg.putImageData(d, 0, 0); }
    const goldC = P.canvas(pw, ph), gg = goldC.getContext('2d');

    pl.render = (ctx, t, cam = {}) => {
      const z = cam.z || 1, cx = cam.x ?? W / 2, cy = cam.y ?? H / 2;
      wg.globalCompositeOperation = 'copy'; wg.drawImage(base, 0, 0); wg.globalCompositeOperation = 'destination-out';
      wg.save(); wg.scale(RES, RES); wg.fillStyle = '#000'; wg.beginPath(); for (const c of pl.timed) { const pr = progress(c, t); if (pr > 0) cutPath(wg, c, pr); } wg.fill(); wg.restore();
      ctx.save(); ctx.setTransform(z / RES, 0, 0, z / RES, W / 2 - cx * z, H / 2 - cy * z);
      ctx.drawImage(paper, 0, 0);
      if (pl.golds.length) { gg.setTransform(1, 0, 0, 1, 0, 0); gg.clearRect(0, 0, pw, ph); gg.scale(RES, RES); for (const f of pl.golds) f(gg, t); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(goldC, 0, 0); ctx.globalCompositeOperation = 'source-over'; }
      ctx.drawImage(work, 0, 0);
      ctx.restore();
    };
    return pl;
  }

  // the brayer rolls fresh ink over the block from left to right (k 0..1): the plate goes black under a wet highlight
  function brayer(ctx, k, x0 = 0) {
    if (k <= 0) return; const W = P.W, H = P.H, x = lerp(x0 - 120, W + 120, k);
    ctx.save(); ctx.fillStyle = INK; ctx.fillRect(0, 0, Math.max(0, x - 40), H);
    const g = ctx.createLinearGradient(x - 120, 0, x + 10, 0); g.addColorStop(0, 'rgba(22,18,14,1)'); g.addColorStop(.55, 'rgba(60,52,44,1)'); g.addColorStop(.75, 'rgba(118,108,96,.85)'); g.addColorStop(1, 'rgba(22,18,14,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 120, 0, 130, H); ctx.restore();
  }
  window.Woodcut = { plate, brayer, INK, PAPER, resample, RES };
})();
