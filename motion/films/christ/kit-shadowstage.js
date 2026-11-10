/* vendored for 「그리스도」 (2026-11): one change — headPath honours F.hf (a head turned to look back over the shoulder). */
/* kit-shadowstage.js — paper cut-out shadow theatre, portrait-native.  Global: window.ShadowStage
   A little toy theatre: a dark-red velvet proscenium (side curtains with fold shading that part and close, a scalloped
   valance with a gold braid); inside, a painted sky whose palette is a time-of-day track (peach dusk → rose → violet →
   indigo night) with a soft sun or moon and its halo, stars that come out one by one; 2–3 layers of flat cut-out
   silhouettes (a hazy far town, rolling hills with round trees, the near ground) with hand-cut paper edges and a small
   paper shadow on the sky; a cut-out house (roof, chimney with curling smoke, windows that light up warm with mullions
   and tied-back curtains, a door that swings open and throws a wedge of warm light on the ground); lamp posts; jointed
   silhouette figures (2-bone IK legs and arms, planted-foot walk, coat/hat/hair variants, a carried box) that move on
   twos like cut-outs; a dark caption plaque hanging on two strings that swings in; paper grain and a vignette.
   Borrowed craft (prompt-motion.com/x4b47x-9cc84f by @x4b47x), own renderer.
   Load after lib.js and story.js:  <script src="lib.js"></script><script src="story.js"></script><script src="kit-shadowstage.js"></script>
   Design space: the portrait frame 1080×1920 (K.W × K.H); in landscape K.begin pillarboxes it.
   Pure and deterministic: textures built once by init(), seeded noise only, every draw a function of its arguments. */
(function () {
  const { clamp, lerp, ss, eio, rng, noise, fbm, canvas, hex, mix, rgb } = Pilot;
  const K = {}, TAU = Math.PI * 2;
  K.W = 1080; K.H = 1920;

  // ================================================================ palette & type
  // C: the fixed colours. Silhouettes are near-black browns (figures darkest, the house a shade warmer so a figure in
  // front of it still reads); light is always amber and always comes from a source (a window, a door, a lamp).
  K.C = {
    velvet: '#5a0e16', velvetHi: '#a0303a', velvetLo: '#1e0408',   // curtain body, fold crest, fold valley
    gold: '#c9a15a', goldLo: '#6e4f22',                            // valance braid, tassels, end-card rule
    ink: '#0e0a0b',        // figures and the nearest cut-outs
    house: '#1c1315',      // the house cut-out (a shade warmer than the figures)
    ground: '#120c0d',     // the near ground
    floor: '#1d1311', floorHi: '#3a2720',                           // the stage boards under the scenery
    board: '#1f1619', boardHi: '#2e2226', dot: '#a68c6c',           // caption plaque
    words: '#f4e7cb', wordsSrc: '#cdb99a',                          // plaque words, small source line
    amber: '#ffc773', amberHi: '#fff0c6', amberLo: '#e48a3a',       // window/door/lamp light (the kit's own warm)
    prop: '#5e3517',       // silhouettes seen inside a lit window (warm dark brown, not black)
    moon: '#f6eed6', sun: '#fff1cc',
  };
  K.GLOW = [255, 196, 112];        // rgb of light spill (halos, wedges, rims)
  // ACCENT: the one extra colour a film may add (the template's flower; a film's own thing). init({ accent }) changes it.
  K.ACCENT = '#d8533a';
  K.SERIF = "'Noto Serif KR',serif"; K.SANS = "'Noto Sans KR',sans-serif";
  // pass to Pilot.run({ fonts: ShadowStage.FONTS }) so every face is loaded before the first frame
  K.FONTS = [`600 52px ${K.SERIF}`, `700 72px ${K.SERIF}`, `400 28px ${K.SANS}`, `500 30px ${K.SANS}`];

  // SKY: the time-of-day track. k = 0 dusk (peach), 1 rose, 2 violet, 3 night (indigo); fractional k blends.
  //   top / mid / low: the painted sky (zenith → middle → horizon); far / mid2: the haze tints of the far town and the
  //   hills; halo: rgb of the sun/moon halo.  skyAt(k) gives the blended rgb arrays.
  K.SKY = [
    { top: '#e09b78', mid: '#efb889', low: '#f8d9a4', far: '#a8705c', mid2: '#6a4038', halo: '#ffd79a' },
    { top: '#a6668a', mid: '#d4878a', low: '#efa98d', far: '#8a4f5e', mid2: '#563040', halo: '#ffc0a8' },
    { top: '#544a8e', mid: '#7f6cab', low: '#a891c4', far: '#5f507f', mid2: '#3c2e4e', halo: '#ddd0ff' },
    { top: '#1c2150', mid: '#333777', low: '#534e90', far: '#383664', mid2: '#2a2442', halo: '#d6dcff' },
  ];
  const SKYRGB = K.SKY.map(o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, hex(v)])));
  // skyAt(k) → { top, mid, low, far, mid2, halo } as rgb arrays for time-of-day k (0..3)
  K.skyAt = function (k) {
    k = clamp(k, 0, 3); const i = Math.min(2, Math.floor(k)), f = ss(0, 1, k - i), a = SKYRGB[i], b = SKYRGB[i + 1], o = {};
    for (const key in a) o[key] = mix(a[key], b[key], f);
    return o;
  };
  // skyTrack(t, keys) → k: a piecewise time→k track, keys = [[t, k], …] (eased between keys). E.g. dusk to night over a
  // film: skyTrack(t, [[2, 0], [6, 1], [9.5, 2], [12.5, 3]]).
  K.skyTrack = function (t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) if (t <= keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], eio((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])));
    return keys[keys.length - 1][1];
  };

  // ================================================================ setup
  let grain = null, curL = null, curOpen = null, val = null, scratch = null, sx = null, lit = null, lx = null, STARS = [];
  // init({ accent, seed = 7, vignette = 1 }): builds the paper grain (with the vignette baked in), curtain and valance sprites, the star field and the
  // scratch/light layers (~150 ms). Call once from Pilot.run({ init }).
  K.init = function (o = {}) {
    if (o.accent) K.ACCENT = o.accent;
    const seed = o.seed ?? 7;
    // paper grain + vignette in ONE full-resolution sheet, laid with 'overlay' (mid-grey = no change, darker = darker):
    // fibre mottling and fine tooth built at half resolution and scaled up once, the vignette baked in as darkening
    // toward the corners. One unscaled overlay blit ≈ 4 ms (a scaled soft-light pass cost 30 ms).
    { const w = 540, h = 960, half = canvas(w, h), x = half.getContext('2d'), d = x.createImageData(w, h), r = rng(seed);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const m = fbm(i * .02, j * .02, 3) - .5, fib = noise(i * .6, j * .05) - .5, v = 128 + 26 * m + 10 * fib + (r() - .5) * 22;
        const p = (j * w + i) * 4; d.data[p] = d.data[p + 1] = d.data[p + 2] = v; d.data[p + 3] = 255;
      }
      x.putImageData(d, 0, 0);
      grain = canvas(K.W, K.H); const gx = grain.getContext('2d'); gx.drawImage(half, 0, 0, K.W, K.H);
      const vs = o.vignette ?? 1, g = gx.createRadialGradient(540, 920, 120, 540, 960, 1180);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.55, `rgba(0,0,0,${.1 * vs})`); g.addColorStop(1, `rgba(0,0,0,${.62 * vs})`);
      gx.fillStyle = g; gx.fillRect(0, 0, K.W, K.H); }
    curL = buildCurtain(seed); val = buildValance(seed);
    curOpen = canvas(92 + 20, K.H); curOpen.getContext('2d').drawImage(curL, 0, 0, 580, K.H, 0, 0, 112, K.H);   // the gathered curtain, pre-scaled
    scratch = canvas(K.W, K.H); sx = scratch.getContext('2d');
    lit = canvas(K.W, K.H); lx = lit.getContext('2d');
    // the star field: positions over the upper sky, each with its own "comes out at" threshold
    const r = rng(seed + 11); STARS = [];
    for (let i = 0; i < 120; i++) STARS.push({ x: 60 + r() * 960, y: 150 + Math.pow(r(), 1.25) * 1000, r: .9 + Math.pow(r(), 3) * 2.4, th: r() * .85, ph: r() * TAU, w: 1.5 + r() * 2.5 });
  };

  // ================================================================ timing
  // on2(t): time held on twos (15 drawings/s at 30 fps) — figures and cut-outs move on twos, sky/light/curtains on ones.
  K.on2 = t => Math.floor(t * 15 + 1e-6) / 15;
  // lightOn(t, at, dur = .5) → 0..1: a lamp being lit — a quick stutter on the 1/15 s grid, then a soft rise to 1.
  K.lightOn = function (t, at, dur = .5) {
    if (t < at) return 0;
    const st = [.35, .12, .6, .4], i = Math.floor((t - at) * 15);
    return i < st.length ? st[i] : lerp(.6, 1, ss(at + st.length / 15, at + st.length / 15 + dur, t));
  };
  // spring(dt, w = 6): critically damped 0 → 1 (no overshoot) — drops and settles
  K.spring = (dt, w = 6) => dt <= 0 ? 0 : 1 - (1 + w * dt) * Math.exp(-w * dt);
  // curtainOpen(t, openAt, openDur = 2, closeAt = Infinity, closeDur = 1) → 0 closed … 1 open
  K.curtainOpen = (t, a, d = 2, c = Infinity, cd = 1) => eio((t - a) / d) * (1 - eio((t - c) / cd));

  // ================================================================ cut paper
  // jag(pts, amp = 1.4, seed = 1, step = 8) → closed point list with a hand-cut edge (smooth noise along the normal;
  // corners stay sharp). Same seed + shape = same cut. Use on every silhouette outline.
  K.jag = function (pts, amp = 1.4, seed = 1, step = 8) {
    const out = [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      if (len < 1e-6) continue;
      const nx = -dy / len, ny = dx / len, m = Math.max(1, Math.ceil(len / step));
      for (let j = 0; j < m; j++) {
        const s = j / m, d = s * len, taper = Math.min(1, d / 10, (len - d) / 10);
        const e = amp * taper * (noise(seed * 3.1 + i * 13.7 + d * .06, seed * .71) - .5) * 2;
        out.push([a[0] + dx * s + nx * e, a[1] + dy * s + ny * e]);
      }
    }
    return out;
  };
  // addPoly(path, pts): append a closed polygon to a Path2D (returns the path)
  K.addPoly = function (p, pts) { pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
  // circlePts(cx, cy, r, n = 18, ry = r) → polygon points of a circle/ellipse (jag it for a cut disc)
  K.circlePts = (cx, cy, r, n = 18, ry = r) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(i / n * TAU), cy + ry * Math.sin(i / n * TAU)]);
  // layer(ctx, path, col, { lift = [5, 6], liftA = .2, edge = null }): fill a cut-out layer: first its small paper shadow
  // on whatever is behind (offset `lift` px, alpha liftA), then (optional) a 1.5 px lighter top edge `edge` (css colour),
  // then the piece. col: css colour or rgb array.
  K.layer = function (ctx, path, col, o = {}) {
    const lift = o.lift || [5, 6];
    if ((o.liftA ?? .2) > 0) { ctx.save(); ctx.translate(lift[0], lift[1]); ctx.fillStyle = `rgba(8,3,6,${o.liftA ?? .2})`; ctx.fill(path); ctx.restore(); }
    if (o.edge) { ctx.save(); ctx.translate(0, -1.6); ctx.fillStyle = o.edge; ctx.fill(path); ctx.restore(); }
    ctx.fillStyle = Array.isArray(col) ? rgb(col) : col; ctx.fill(path);
  };

  // ================================================================ landscape builders (Path2D, built once)
  // hillPath({ y, amp = 40, freq = .004, seed = 1, x0 = -40, x1 = 1120, bottom = 1920 }): a rolling hill silhouette
  // whose top runs around y (± amp), filled down to `bottom`.
  K.hillPath = function (o) {
    const pts = [], x0 = o.x0 ?? -40, x1 = o.x1 ?? 1120, a = o.amp ?? 40, f = o.freq ?? .004, sd = o.seed ?? 1;
    for (let x = x0; x <= x1; x += 12) pts.push([x, o.y - a * (fbm(x * f + sd * 7.3, sd * 1.7, 3) - .5) * 2]);
    pts.push([x1, o.bottom ?? 1920], [x0, o.bottom ?? 1920]);
    return K.addPoly(new Path2D(), K.jag(pts, 1.2, sd, 10));
  };
  // flatGround({ y, x0, x1, seed, bottom }): a near ground whose top is level at y (± 1 px of paper edge) — figures plant
  // their feet on y exactly.
  K.flatGround = function (o) {
    const x0 = o.x0 ?? -40, x1 = o.x1 ?? 1120;
    return K.addPoly(new Path2D(), K.jag([[x0, o.y], [x1, o.y], [x1, o.bottom ?? 1920], [x0, o.bottom ?? 1920]], 1, o.seed ?? 3, 9));
  };
  // townPath({ y, x0 = -20, x1 = 1100, seed = 2, scale = 1, hill = 22 }): a far town on a low hill whose top runs
  // around y (± hill px): small pitched and flat roofs, chimneys, a tower or two, round trees between, the hill filled
  // to the bottom — one Path2D (fill it with the hazy `far` colour).
  K.townPath = function (o) {
    const p = new Path2D(), r = rng(o.seed ?? 2), s = o.scale ?? 1, x1 = o.x1 ?? 1100, x0 = o.x0 ?? -20, hill = o.hill ?? 22, sd = o.seed ?? 2;
    const hy = x => o.y - hill * (fbm(x * .004 + sd * 3.7, sd * .9, 3) - .5) * 2;
    const base = []; for (let x = x0; x <= x1; x += 14) base.push([x, hy(x)]); base.push([x1, 1940], [x0, 1940]);
    K.addPoly(p, K.jag(base, 1, sd + 9, 10));
    let x = x0 + r() * 30, n = 0;
    while (x < x1) {
      const kind = r(), w = (26 + r() * 30) * s, h = (16 + r() * 36) * s, y = Math.max(hy(x), hy(x + w)) + 6;
      if (kind < .1 && n > 1) {                                    // a tower with a pointed roof
        const tw = 18 * s, th = h + 40 * s;
        K.addPoly(p, K.jag([[x, y], [x, y - th], [x + tw / 2, y - th - 26 * s], [x + tw, y - th], [x + tw, y]], .7, 40 + n, 6)); x += tw + 4 * s;
      } else if (kind < .38) {                                     // one or two round trees
        const tr = (9 + r() * 9) * s, ty = hy(x + tr) - (12 + r() * 8) * s;
        K.addPoly(p, K.jag(K.circlePts(x + tr, ty, tr, 14), .7, 60 + n, 5)); K.addPoly(p, [[x + tr - 1.5 * s, ty], [x + tr + 1.5 * s, ty], [x + tr + 1.5 * s, hy(x + tr) + 6], [x + tr - 1.5 * s, hy(x + tr) + 6]]); x += 2 * tr + (r() < .5 ? 2 : 14) * s;
      } else if (kind < .52) {                                     // flat roof block with a chimney
        const cx = x + w * (.2 + r() * .5);
        K.addPoly(p, K.jag([[x, y], [x, y - h], [cx, y - h], [cx, y - h - 10 * s], [cx + 7 * s, y - h - 10 * s], [cx + 7 * s, y - h], [x + w, y - h], [x + w, y]], .7, 80 + n, 6)); x += w + (r() < .5 ? 2 : 16) * s;
      } else {                                                     // pitched roof house
        const rh = (12 + r() * 16) * s;
        K.addPoly(p, K.jag([[x, y], [x, y - h], [x + w / 2, y - h - rh], [x + w, y - h], [x + w, y]], .7, 100 + n, 6)); x += w + (r() < .55 ? 2 : 18 + r() * 30) * s;
      }
      if (r() < .18) x += (30 + r() * 60) * s;                     // a gap: just the hill
      n++;
    }
    return p;
  };
  // treesPath(list): lollipop trees [[x, gy, h, r], …] (trunk from gy up to h, round crown r) → one Path2D
  K.treesPath = function (list, seed = 5) {
    const p = new Path2D();
    list.forEach(([x, gy, h, rr], i) => {
      K.addPoly(p, K.jag([[x - 3, gy + 6], [x - 2.5, gy - h + rr], [x + 2.5, gy - h + rr], [x + 3, gy + 6]], .5, seed + i, 6));
      K.addPoly(p, K.jag(K.circlePts(x, gy - h, rr, 18, rr * 1.05), 1.1, seed + 30 + i, 6));
    });
    return p;
  };
  // bareTree(x, gy, h, seed) → Path2D: a bare winter-ish tree of tapering cut branches (for a side of the stage)
  K.bareTree = function (x, gy, h, seed = 9) {
    const p = new Path2D(), r = rng(seed);
    const br = (x0, y0, a, len, w, d) => {
      const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len, nx = -Math.sin(a), ny = Math.cos(a), w1 = w * .62;
      K.addPoly(p, [[x0 + nx * w, y0 + ny * w], [x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w, y0 - ny * w]]);
      if (d > 0) { const k = 2 + (r() < .5 ? 1 : 0); for (let i = 0; i < k; i++) br(x1, y1, a + (r() - .5) * 1.3, len * (.62 + r() * .15), w1, d - 1); }
    };
    br(x, gy + 4, -Math.PI / 2, h * .38, 9, 4);
    return p;
  };
  // fencePath(x0, x1, gy, h = 34, gap = 15) → Path2D: a picket fence (pointed pickets + two rails)
  K.fencePath = function (x0, x1, gy, h = 34, gap = 15) {
    const p = new Path2D();
    for (let x = x0; x <= x1; x += gap) K.addPoly(p, [[x, gy + 3], [x, gy - h + 6], [x + 3, gy - h], [x + 6, gy - h + 6], [x + 6, gy + 3]]);
    K.addPoly(p, [[x0, gy - h * .75], [x1 + 6, gy - h * .75], [x1 + 6, gy - h * .75 + 4], [x0, gy - h * .75 + 4]]);
    K.addPoly(p, [[x0, gy - h * .3], [x1 + 6, gy - h * .3], [x1 + 6, gy - h * .3 + 4], [x0, gy - h * .3 + 4]]);
    return p;
  };
  // tuftsPath({ y, x0, x1, seed = 4, h = 26 }) → Path2D: a foreground strip of grass tufts standing on y, filled down
  // to the bottom of the frame (the nearest cut-out, in front of everything).
  K.tuftsPath = function (o) {
    const pts = [], r = rng(o.seed ?? 4), h = o.h ?? 26;
    let x = o.x0;
    pts.push([o.x0, 1940]);
    while (x < o.x1) {
      pts.push([x, o.y]);
      const n = 2 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) { const bx = x + 3 + i * 5 + r() * 3, bh = h * (.4 + r() * .8); pts.push([bx + (r() - .5) * 8, o.y - bh], [bx + 3, o.y - 2]); }
      x += 14 + r() * 40;
    }
    pts.push([o.x1, o.y], [o.x1, 1940]);
    return K.addPoly(new Path2D(), pts);
  };

  // ================================================================ sky
  // begin(ctx): black, pillarbox the portrait frame in landscape (?o=h). Call first in draw().
  K.begin = function (ctx) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, Pilot.W, Pilot.H);
    if (Pilot.ori !== 'v') { ctx.translate((Pilot.W - K.W * Pilot.H / K.H) / 2, 0); ctx.scale(Pilot.H / K.H, Pilot.H / K.H); ctx.beginPath(); ctx.rect(0, 0, K.W, K.H); ctx.clip(); }
  };
  // sky(ctx, k, { y0 = 0, y1 = 1500, below = 80 }) → the palette (skyAt(k)): the painted sky for time-of-day k, zenith
  // at y0, horizon at y1; it is filled only down to y1 + below (the ground must cover the rest — saves ~2 ms).
  K.sky = function (ctx, k, o = {}) {
    const pal = K.skyAt(k), y0 = o.y0 ?? 0, y1 = o.y1 ?? 1500, g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, rgb(pal.top)); g.addColorStop(.5, rgb(pal.mid)); g.addColorStop(1, rgb(pal.low));
    ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, Math.min(K.H, y1 + (o.below ?? 80)));
    return pal;
  };
  // halo(ctx, x, y, r, rgbArr, a): a soft round glow around a light source (sun, moon, lamp) — only ever AT a source
  K.halo = function (ctx, x, y, r, c, a) {
    if (a <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgb(c, .55 * a)); g.addColorStop(.35, rgb(c, .2 * a)); g.addColorStop(1, rgb(c, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  // sun(ctx, x, y, r, pal, a = 1): a soft low sun disc with its warm halo (set it behind the far layer so it sinks)
  K.sun = function (ctx, x, y, r, pal, a = 1) {
    if (a <= 0) return;
    K.halo(ctx, x, y, r * 7, pal.halo, .9 * a);
    const g = ctx.createRadialGradient(x, y - r * .2, 0, x, y, r); g.addColorStop(0, rgb([255, 250, 232], a)); g.addColorStop(1, rgb(hex(K.C.sun), a * .92));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  };
  // moon(ctx, x, y, r, pal, a = 1): a pale full moon with faint maria and its cool halo
  K.moon = function (ctx, x, y, r, pal, a = 1) {
    if (a <= 0) return;
    K.halo(ctx, x, y, r * 5.5, pal.halo, .7 * a);
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, K.C.moon);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(180,170,150,.28)';
    [[-.3, -.15, .28], [.25, .2, .22], [.05, -.42, .14], [-.1, .35, .12], [.38, -.2, .1]].forEach(([u, v, s]) => { ctx.beginPath(); ctx.arc(x + u * r, y + v * r, s * r, 0, TAU); ctx.fill(); });
    ctx.restore();
  };
  // stars(ctx, n, t, { y1 = 1250, scale = 1 }): the stars that are out at night amount n (0..1): each star appears at its
  // own threshold and twinkles gently; none below y1.
  K.stars = function (ctx, n, t, o = {}) {
    if (n <= 0) return; const y1 = o.y1 ?? 1250;
    for (const s of STARS) {
      if (s.y > y1) continue;
      const a = clamp((n - s.th) / .12) * (.72 + .28 * Math.sin(t * s.w + s.ph)); if (a <= .01) continue;
      ctx.fillStyle = `rgba(255,248,230,${a * .9})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (o.scale ?? 1), 0, TAU); ctx.fill();
      if (s.r > 2.4) { ctx.fillStyle = `rgba(255,248,230,${a * .35})`; ctx.fillRect(s.x - 5, s.y - .6, 10, 1.2); ctx.fillRect(s.x - .6, s.y - 5, 1.2, 10); }
    }
  };
  // cloud(ctx, x, y, w, col, seed = 1): a flat cut-paper cloud strip (lumpy top, flat bottom); col css/rgb
  K.cloud = function (ctx, x, y, w, col, seed = 1) {
    const r = rng(seed), pts = [[x, y]]; let u = 0;
    while (u < w) { const bw = 30 + r() * 40, bh = 12 + r() * 20; pts.push([x + u + bw * .5, y - bh]); u += bw * .7; }
    pts.push([x + w, y]);
    const p = new Path2D(); ctx.fillStyle = Array.isArray(col) ? rgb(col) : col;
    p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.quadraticCurveTo(pts[i][0], pts[i][1] - 6, pts[i][0] + 10, pts[i][1] + 4);
    p.lineTo(x + w, y); p.closePath(); ctx.fill(p);
  };

  // ================================================================ lamps, smoke
  // lamp(ctx, x, gy, h, on, { col = C.ink, pal }) → [hx, hy] the lantern centre: a cut-out lamp post (base, slim post,
  // a four-pane lantern with a little roof). on 0..1 lights the panes amber with a halo (lightOn() for the stutter).
  K.lamp = function (ctx, x, gy, h, on, o = {}) {
    const col = o.col || K.C.ink, hy = gy - h, p = new Path2D();
    K.addPoly(p, [[x - 11, gy + 2], [x - 8, gy - 16], [x - 3, gy - 22], [x - 3, hy + 22], [x + 3, hy + 22], [x + 3, gy - 22], [x + 8, gy - 16], [x + 11, gy + 2]]);
    K.addPoly(p, [[x - 16, hy + 22], [x + 16, hy + 22], [x + 13, hy + 17], [x - 13, hy + 17]]);   // lantern floor
    K.addPoly(p, [[x - 19, hy - 22], [x, hy - 38], [x + 19, hy - 22], [x + 13, hy - 18], [x - 13, hy - 18]]);   // roof
    K.addPoly(p, [[x - 2.5, hy - 38], [x - 2.5, hy - 46], [x + 2.5, hy - 46], [x + 2.5, hy - 38]]);
    K.addPoly(p, [[x - 3, hy - 13], [x + 3, hy - 13], [x + 3, hy - 32], [x - 3, hy - 32]]);
    if (on > 0) K.halo(ctx, x, hy, 150, K.GLOW, on * .8);
    ctx.fillStyle = col; ctx.fill(p);
    const pane = [[x - 13, hy - 18], [x + 13, hy - 18], [x + 11, hy + 17], [x - 11, hy + 17]];   // dark when off
    ctx.fillStyle = on > 0 ? rgb(mix(hex(col), hex(K.C.amber), on)) : col; ctx.beginPath(); pane.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, hy - 18); ctx.lineTo(x, hy + 17); ctx.moveTo(x - 12, hy); ctx.lineTo(x + 12, hy); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.beginPath(); pane.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.stroke();
    return [x, hy];
  };
  // smoke(ctx, x, y, t, { every = 1.15, life = 5, rise = 42, drift = -9, size = 1, col = 'rgba(30,20,26,.7)', w = 3.4 }):
  // cut-paper smoke curls from a chimney mouth at (x, y): one curl every `every` s, rising, drifting, uncurling, fading.
  K.smoke = function (ctx, x, y, t, o = {}) {
    const ev = o.every ?? 1.15, life = o.life ?? 5, rise = o.rise ?? 42, dr = o.drift ?? -9, sz = o.size ?? 1;
    ctx.save(); ctx.strokeStyle = o.col || 'rgba(30,20,26,.7)'; ctx.lineCap = 'round';
    for (let i = Math.floor((t - life) / ev); i <= Math.floor(t / ev); i++) {
      const age = t - i * ev; if (age < 0 || age > life) continue;
      const u = age / life, px = x + dr * age + 9 * Math.sin(age * 1.1 + i * 2.3), py = y - rise * age - 6, R = (5 + 13 * Math.sqrt(u)) * sz;
      ctx.globalAlpha = ss(0, .5, age) * (1 - ss(.55, 1, u)); ctx.lineWidth = (o.w ?? 3.4) * (1 - .4 * u);
      const turns = 1.7 - .5 * u, dir = i % 2 ? 1 : -1;
      ctx.beginPath();
      for (let q = 0; q <= 28; q++) { const th = q / 28 * turns * TAU, rr = R * (1 - q / 34); ctx.lineTo(px + dir * Math.cos(th + i) * rr, py + Math.sin(th + i) * rr * .85); }
      ctx.stroke();
    }
    ctx.restore();
  };

  // ================================================================ the house
  /* houseGeo(H) → absolute geometry of a house spec (scene coordinates):
     H = { x, gy, w, wallH, roofH, over = 30, chimney: { x, w = 40, top } (x from the wall's left, top px above gy),
           door: { x, w, h }, windows: [{ x, y, w, h, shape: 'rect'|'arch'|'round', mull: 'cross'|'none', curtains = true,
           sill = true }] (x from the wall's left, y = top above gy), lantern: { x, y } (a wall lamp, optional), seed }
     → { wall, roof, chimney (mouth [x,y]), door {x, y, w, h}, windows [{x, y, w, h, …}], lantern, apex } */
  K.houseGeo = function (H) {
    const x = H.x, gy = H.gy, top = gy - H.wallH, ov = H.over ?? 30, cx = x + H.w / 2;
    const g = { x, gy, top, w: H.w, apex: [cx, top - H.roofH], over: ov };
    if (H.chimney) { const c = H.chimney, cw = c.w ?? 40; g.chimney = { x: x + c.x, w: cw, top: gy - c.top, mouth: [x + c.x + cw / 2, gy - c.top - 10] }; }
    if (H.door) g.door = { x: x + H.door.x, y: gy - H.door.h, w: H.door.w, h: H.door.h };
    g.windows = (H.windows || []).map(w => ({ ...w, x: x + w.x, y: gy - w.y }));
    if (H.lantern) g.lantern = [x + H.lantern.x, gy - H.lantern.y];
    return g;
  };
  const housePaths = new Map();
  function houseBody(H, g) {
    const key = JSON.stringify([H.x, H.gy, H.w, H.wallH, H.roofH, H.over, H.chimney, H.seed]);
    let p = housePaths.get(key); if (p) return p;
    p = new Path2D(); const sd = H.seed ?? 21, ov = g.over, x = g.x, w = g.w, top = g.top;
    K.addPoly(p, K.jag([[x, g.gy + 3], [x, top + 4], [x + w, top + 4], [x + w, g.gy + 3]], 1.2, sd, 9));
    // roof with eaves that overhang and a thin lower lip
    K.addPoly(p, K.jag([[x - ov, top + 14], [g.apex[0] - 6, g.apex[1] + 2], [g.apex[0] + 6, g.apex[1] + 2], [x + w + ov, top + 14], [x + w + ov - 4, top + 22], [x - ov + 4, top + 22]], 1.3, sd + 1, 9));
    if (g.chimney) { const c = g.chimney;
      K.addPoly(p, K.jag([[c.x, top], [c.x, c.top], [c.x + c.w, c.top], [c.x + c.w, top]], 1, sd + 2, 8));
      K.addPoly(p, K.jag([[c.x - 6, c.top + 2], [c.x - 6, c.top - 10], [c.x + c.w + 6, c.top - 10], [c.x + c.w + 6, c.top + 2]], .8, sd + 3, 8)); }
    // a doorstep
    if (H.door) { const d = g.door; K.addPoly(p, [[d.x - 12, g.gy + 3], [d.x - 10, g.gy - 6], [d.x + d.w + 10, g.gy - 6], [d.x + d.w + 12, g.gy + 3]]); }
    housePaths.set(key, p); return p;
  }
  function shapePath(w, pad = 0) {   // a window/door opening as a Path2D
    const p = new Path2D(), x = w.x - pad, y = w.y - pad, ww = w.w + 2 * pad, hh = w.h + 2 * pad;
    if (w.shape === 'round') { p.ellipse(x + ww / 2, y + hh / 2, ww / 2, hh / 2, 0, 0, TAU); return p; }
    if (w.shape === 'arch') { const r = ww / 2; p.moveTo(x, y + hh); p.lineTo(x, y + r); p.arc(x + r, y + r, r, Math.PI, 0); p.lineTo(x + ww, y + hh); p.closePath(); return p; }
    p.rect(x, y, ww, hh); return p;
  }
  K.openingPath = shapePath;   // openingPath(rect, pad = 0) → Path2D of a window/door rect ({x, y, w, h, shape}), grown by pad
  // interior fill of a lit opening: warm gradient, brighter up and in the middle
  function warmFill(ctx, w, k) {
    const g = ctx.createRadialGradient(w.x + w.w / 2, w.y + w.h * .35, 2, w.x + w.w / 2, w.y + w.h * .45, Math.max(w.w, w.h) * .8);
    const base = hex(K.C.house);
    g.addColorStop(0, rgb(mix(base, hex(K.C.amberHi), k))); g.addColorStop(.55, rgb(mix(base, hex(K.C.amber), k))); g.addColorStop(1, rgb(mix(base, hex(K.C.amberLo), k)));
    ctx.fillStyle = g;
  }
  /* house(ctx, H, st, hooks) → houseGeo(H): draws the cut-out house.
     st = { win: [0..1 per window] (lightOn values), door: 0..1 (swing open), doorLight: 0..1 (interior lit; defaults to
     door > 0 ? 1 : max window), lantern: 0..1, col }
     hooks (scene drawing, all optional):
       window(ctx, i, rect, k) — silhouettes inside lit window i (furniture, a plate, a person) — drawn over the warm
                                 fill, under the curtains and mullions. Use C.prop for them.
       door(ctx, rect, k)      — whoever stands in the open doorway (drawn clipped to the opening, over the swung leaf).
     The smoke is separate: K.smoke(ctx, ...geo.chimney.mouth, t). Window halos on the wall are included. */
  K.house = function (ctx, H, st = {}, hk = {}) {
    const g = K.houseGeo(H), col = st.col || K.C.house, ink = hex(col);
    // halos of the lit windows/door spill around them onto the sky behind (under the house)
    ctx.fillStyle = col; K.layer(ctx, houseBody(H, g), col, { lift: [6, 7], liftA: .25 });
    // lit windows
    g.windows.forEach((w, i) => {
      const k = (st.win && st.win[i]) || 0, op = shapePath(w);
      if (k > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'source-over';
        const hg = ctx.createRadialGradient(w.x + w.w / 2, w.y + w.h / 2, Math.min(w.w, w.h) * .4, w.x + w.w / 2, w.y + w.h / 2, Math.max(w.w, w.h) * 1.25);
        hg.addColorStop(0, rgb(K.GLOW, .3 * k)); hg.addColorStop(1, rgb(K.GLOW, 0)); ctx.fillStyle = hg;
        ctx.beginPath(); ctx.rect(g.x, g.top, g.w, g.gy - g.top); ctx.clip(); ctx.fillRect(w.x - w.w, w.y - w.h, w.w * 3, w.h * 3); ctx.restore();
        ctx.save(); ctx.clip(op); warmFill(ctx, w, k); ctx.fill(op);
        if (hk.window) hk.window(ctx, i, w, k);
        if (w.curtains !== false && w.shape !== 'round') {   // tied-back curtains: two drapes gathered at 62 % height
          ctx.fillStyle = rgb(mix(ink, hex(K.C.prop), .55));
          for (const sd of [-1, 1]) {
            const ex = sd < 0 ? w.x : w.x + w.w, tie = w.y + w.h * .62, ins = w.w * .16 * -sd;
            ctx.beginPath(); ctx.moveTo(ex, w.y - 2); ctx.lineTo(ex + ins * 1.6, w.y - 2);
            ctx.quadraticCurveTo(ex + ins * 1.2, tie - w.h * .25, ex + ins * .45, tie);
            ctx.quadraticCurveTo(ex + ins * .9, tie + w.h * .2, ex + ins * 1.15, w.y + w.h + 2); ctx.lineTo(ex, w.y + w.h + 2); ctx.fill();
          }
        }
        ctx.restore();
      }
      // mullions, frame and sill are part of the wall cut-out (always drawn, so an unlit window still has its shape)
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col;
      if (k > 0) {
        if (w.mull !== 'none') { const mw = w.shape === 'round' ? 5 : 6; ctx.lineWidth = mw; ctx.beginPath();
          ctx.moveTo(w.x + w.w / 2, w.y); ctx.lineTo(w.x + w.w / 2, w.y + w.h); ctx.moveTo(w.x, w.y + w.h * (w.shape === 'round' ? .5 : .42)); ctx.lineTo(w.x + w.w, w.y + w.h * (w.shape === 'round' ? .5 : .42)); ctx.stroke(); }
        ctx.lineWidth = 5; ctx.stroke(shapePath(w, 1.5));
      } else { ctx.strokeStyle = rgb(mix(ink, [90, 70, 70], .25)); ctx.lineWidth = 2; ctx.stroke(shapePath(w, 3)); }
      if (w.sill !== false && w.shape !== 'round') { ctx.fillStyle = col; ctx.fillRect(w.x - 10, w.y + w.h, w.w + 20, 9); }
      ctx.restore();
    });
    // the door
    if (g.door) {
      const d = g.door, open = clamp(st.door || 0), dl = st.doorLight ?? (open > 0 ? 1 : 0), dp = shapePath({ ...d, shape: 'arch' });
      if (open > 0) {
        ctx.save(); ctx.clip(dp);
        warmFill(ctx, { x: d.x - d.w * .2, y: d.y - d.h * .1, w: d.w * 1.4, h: d.h * 1.1 }, dl); ctx.fillRect(d.x - 2, d.y - 2, d.w + 4, d.h + 4);
        ctx.fillStyle = rgb(mix(hex(K.C.amberLo), ink, .35), dl); ctx.beginPath(); ctx.moveTo(d.x, d.y + d.h); ctx.lineTo(d.x + d.w * .18, d.y + d.h * .86); ctx.lineTo(d.x + d.w * .82, d.y + d.h * .86); ctx.lineTo(d.x + d.w, d.y + d.h); ctx.fill();   // the hall floor
        // the leaf swings inward on its left hinge: a narrowing panel, its far edge a little shorter (it goes away from us)
        const th = open * Math.PI * .46, lw = d.w * Math.cos(th), sh = d.h * .07 * Math.sin(th);
        ctx.fillStyle = rgb(mix(ink, [70, 46, 36], .5)); ctx.beginPath(); ctx.moveTo(d.x, d.y - 4); ctx.lineTo(d.x + lw, d.y + sh); ctx.lineTo(d.x + lw, d.y + d.h - sh * .6); ctx.lineTo(d.x, d.y + d.h); ctx.fill();
        if (hk.door) hk.door(ctx, d, open);
        ctx.restore();
      } else {
        ctx.save(); ctx.strokeStyle = rgb(mix(ink, [120, 90, 80], .3)); ctx.lineWidth = 2.5; ctx.stroke(dp);
        const dk = st.doorWin ?? 0;   // the small round window in the door, lit with the house
        ctx.fillStyle = dk > 0 ? rgb(mix(ink, hex(K.C.amber), dk)) : rgb(mix(ink, [120, 90, 80], .3));
        ctx.beginPath(); ctx.arc(d.x + d.w / 2, d.y + d.h * .3, d.w * .13, 0, TAU); ctx.fill();
        ctx.fillStyle = rgb(mix(ink, [140, 110, 90], .35)); ctx.beginPath(); ctx.arc(d.x + d.w * .8, d.y + d.h * .56, 4, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }
    if (g.lantern) {   // a small wall lamp by the door
      const [lx0, ly0] = g.lantern, k = st.lantern || 0;
      if (k > 0) K.halo(ctx, lx0, ly0, 90, K.GLOW, k * .7);
      ctx.fillStyle = col; ctx.fillRect(lx0 - 2, ly0 - 26, 4, 10); ctx.beginPath(); ctx.moveTo(lx0 - 11, ly0 - 16); ctx.lineTo(lx0 + 11, ly0 - 16); ctx.lineTo(lx0, ly0 - 26); ctx.fill();
      ctx.fillStyle = k > 0 ? rgb(mix(ink, hex(K.C.amber), k)) : col; ctx.fillRect(lx0 - 8, ly0 - 15, 16, 22);
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.strokeRect(lx0 - 8, ly0 - 15, 16, 22); ctx.fillStyle = col; ctx.fillRect(lx0 - 10, ly0 + 7, 20, 4);
    }
    return g;
  };

  // ================================================================ light on the ground (door wedge), shadows
  // lightBegin() → the light layer's ctx, cleared. Draw light shapes on it (doorLight, pools), cut shadows out of it
  // (castShadow), then lightEnd(ctx, y0 = 0) lays it over the frame (only rows ≥ y0: pass the ground line). Draw it after the ground, before the figures.
  K.lightBegin = function () { lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalCompositeOperation = 'source-over'; lx.clearRect(0, 0, K.W, K.H); return lx; };
  K.lightEnd = function (ctx, y0 = 0) { y0 = clamp(Math.round(y0), 0, K.H - 1); ctx.drawImage(lit, 0, y0, K.W, K.H - y0, 0, y0, K.W, K.H - y0); };
  // doorLight(lc, door, open, { len = 430, spread = 1.15, pool = [380, 150], gy, ly = 160 }) → the light point L {x, y} for
  // shadows: the warm wedge an open door throws on the ground in front of it (a trapezoid fanning toward us from the
  // opening, fading with distance) plus a soft pool around the step. door = geo.door; open 0..1.
  K.doorLight = function (lc, d, open, o = {}) {
    const gy = o.gy ?? d.y + d.h, len = o.len ?? 430, sp = o.spread ?? 1.15, k = clamp(open * 1.6);
    const lw = d.w * Math.cos(open * Math.PI * .46), x0 = d.x + lw * .7, x1 = d.x + d.w, hw = (x1 - x0) / 2, cx = (x0 + x1) / 2;
    const L = { x: cx, y: gy - (o.ly ?? 160) };   // the light point for castShadow: in the doorway, behind the figures
    if (k <= 0) return L;
    const pr = o.pool || [380, 150];
    lc.save(); lc.translate(cx, gy); lc.scale(1, pr[1] / pr[0]);
    const pg = lc.createRadialGradient(0, 0, 0, 0, 0, pr[0]); pg.addColorStop(0, rgb(K.GLOW, .34 * k)); pg.addColorStop(1, rgb(K.GLOW, 0));
    lc.fillStyle = pg; lc.beginPath(); lc.rect(-pr[0], 0, 2 * pr[0], pr[0]); lc.fill(); lc.restore();
    const wg = lc.createLinearGradient(0, gy, 0, gy + len); wg.addColorStop(0, rgb([255, 214, 140], .78 * k)); wg.addColorStop(.5, rgb(K.GLOW, .36 * k)); wg.addColorStop(1, rgb(K.GLOW, 0));
    lc.fillStyle = wg; lc.beginPath(); lc.moveTo(x0, gy); lc.lineTo(x1, gy); lc.lineTo(cx + hw + len * .32 * sp, gy + len); lc.lineTo(cx - hw - len * .32 * sp, gy + len); lc.closePath(); lc.fill();
    return L;
  };
  // groundPool(ctx, x, gy, rx, ry, a, c = GLOW): a soft half-ellipse of light on the ground under a lamp (below gy only)
  K.groundPool = function (ctx, x, gy, rx, ry, a, c = K.GLOW) {
    if (a <= 0) return; ctx.save(); ctx.translate(x, gy); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, rgb(c, .3 * a)); g.addColorStop(1, rgb(c, 0));
    ctx.fillStyle = g; ctx.fillRect(-rx, 0, 2 * rx, rx); ctx.restore();
  };
  // castShadow(lc, F, L, { len = 1, a = .85, draw }) : cut figure F's shadow out of the light layer: the silhouette
  // laid on the ground from its feet, pointing away from light point L {x, y} (y above the ground = a light behind the
  // figure, so the shadow falls toward us), `len` × its height. draw(c, F) defaults to K.body.
  K.castShadow = function (lc, F, L, o = {}) {
    const fx = F.hip[0], gy = F.gy, dx0 = fx - L.x, dy0 = gy - L.y, dl = Math.hypot(dx0, dy0) || 1, dx = dx0 / dl, dy = dy0 / dl, k = o.len ?? 1;
    const bx = clamp(Math.floor(fx - 520), 0, K.W), by = clamp(Math.floor(gy - 300 * F.s), 0, K.H), bw = Math.min(K.W, Math.ceil(fx + 520)) - bx, bh = Math.min(K.H, Math.ceil(gy + 320 * F.s)) - by;
    if (bw <= 0 || bh <= 0) return;
    sx.setTransform(1, 0, 0, 1, 0, 0); sx.clearRect(bx, by, bw, bh);
    sx.save(); sx.translate(fx, gy); sx.transform(1, 0, -dx * k, -dy * k, 0, 0); sx.translate(-fx, -gy);   // height h above the feet → h·k along (dx, dy)
    (o.draw || K.body)(sx, F, '#000', '#000'); sx.restore();
    lc.save(); lc.globalCompositeOperation = 'destination-out'; lc.globalAlpha = o.a ?? .85; lc.drawImage(scratch, bx, by, bw, bh, bx, by, bw, bh); lc.restore();
  };

  // ================================================================ figures (jointed cut-outs, 2-bone IK)
  /* ik(a, t, l1, l2, pick) → [middle joint, end]: 2-bone IK from joint a toward target t with FIXED bone lengths (the
     target is clamped to reach); pick(j1, j2) chooses the knee/elbow. */
  const ik = K.ik = function (a, t, l1, l2, pick) {
    const dx = t[0] - a[0], dy = t[1] - a[1], d = Math.hypot(dx, dy) || 1e-6, dd = clamp(d, Math.abs(l1 - l2) + .5, l1 + l2 - .3);
    const tx = a[0] + dx / d * dd, ty = a[1] + dy / d * dd, an = Math.atan2(ty - a[1], tx - a[0]), b = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1));
    const j1 = [a[0] + Math.cos(an + b) * l1, a[1] + Math.sin(an + b) * l1], j2 = [a[0] + Math.cos(an - b) * l1, a[1] + Math.sin(an - b) * l1];
    return [pick(j1, j2), [tx, ty]];
  };
  // BODY: the rig at s = 1 (px): ankle height, shin, thigh, upper arm, forearm, hip→shoulder, standing hip height.
  // A figure is ~205·s px tall (hats add ~20). s 1.1 ≈ 225 px reads well against a 260 px door.
  K.BODY = { ANK: 7, SHIN: 46, THIGH: 48, UARM: 38, FARM: 36, SHO: 60, HIP: 97 };
  const B = K.BODY;
  // frame(F) → { up, fw, P(a, b) }: the torso frame; P(a, b) = hip + forward·a + up·b (body units × s)
  const frame = K.frame = function (F) {
    const up = [Math.sin(F.ang), -Math.cos(F.ang)], fw = [F.f * Math.cos(F.ang), F.f * Math.sin(F.ang)], s = F.s;
    return { up, fw, P: (a, b) => [F.hip[0] + fw[0] * a * s + up[0] * b * s, F.hip[1] + fw[1] * a * s + up[1] * b * s] };
  };
  K.shoulder = (F, i = 1) => frame(F).P(i ? 3 : -2, B.SHO - (i ? 1 : 0));   // shoulder i (0 far, 1 near), world px
  const capsule = (c, a, b, ra, rb) => {   // a tapered limb piece a→b (round ends), filled with the current fillStyle
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    c.beginPath(); c.moveTo(a[0] + nx * ra, a[1] + ny * ra); c.lineTo(b[0] + nx * rb, b[1] + ny * rb); c.lineTo(b[0] - nx * rb, b[1] - ny * rb); c.lineTo(a[0] - nx * ra, a[1] - ny * ra); c.fill();
    c.beginPath(); c.arc(a[0], a[1], ra, 0, TAU); c.fill(); c.beginPath(); c.arc(b[0], b[1], rb, 0, TAU); c.fill();
  };
  const polyW = (c, P, pts) => { c.beginPath(); pts.forEach(([a, b], i) => { const q = P(a, b); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.fill(); };
  // HEADS: profile outlines in head space (x forward, y down, units; centre of the skull at 0,0)
  const FACE = [[0, -17], [7, -15.5], [11.5, -11], [13.5, -5], [14, -2], [18.5, 3], [14.5, 5], [15, 8], [13.5, 10], [14, 12], [11, 16], [5, 18], [0, 16], [-6, 14], [-12, 8], [-14, 0], [-12, -9], [-7, -15]];
  const HAIR = {
    short: [[-15, 4], [-15.5, -6], [-11, -15], [-3, -20], [7, -19.5], [13, -15], [15.5, -9], [11, -10.5], [5, -12], [-1, -9], [-5, -3], [-8, 6], [-12, 9]],
    bob: [[-16, 13], [-18, 2], [-16, -10], [-9, -19], [2, -21.5], [11, -18], [15.5, -11], [16, -5], [11, -8], [5, -10], [-1, -6], [-3, 4], [-5, 14], [-11, 16]],
    bun: [[-15, 3], [-15.5, -7], [-11, -15], [-3, -19.5], [7, -19], [13, -14], [15, -9], [10, -10], [3, -11], [-4, -7], [-9, 2], [-13, 8]],
    cap: [[-15, -2], [-14, -12], [-6, -20], [6, -21], [13, -17], [16, -12], [27, -10], [26.5, -7.5], [13, -8], [-15, 0]],
    hat: [[-26, -12], [-22, -15], [-12, -15], [-11, -27], [-3, -31], [2, -28], [8, -31], [12, -27], [12, -15], [22, -15], [27, -12], [22, -10], [-22, -10]],
  };
  const headPath = (c, F, Hc, tilt) => {
    const s = F.s, hu = [Math.sin(tilt), -Math.cos(tilt)], hff = F.hf || F.f, hf = [hff * Math.cos(tilt), hff * Math.sin(tilt)];   // christ: F.hf = the head faces the other way (looks back)
    const T = ([u, v]) => [Hc[0] + (hf[0] * u - hu[0] * v) * s, Hc[1] + (hf[1] * u - hu[1] * v) * s];
    const fill = pts => { c.beginPath(); pts.forEach((p, i) => { const q = T(p); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.fill(); };
    fill(FACE);
    const hd = F.head || 'short'; if (HAIR[hd]) fill(HAIR[hd]);
    if (hd === 'bun') { const q = T([-17, -9]); c.beginPath(); c.arc(q[0], q[1], 7.5 * s, 0, TAU); c.fill(); }
  };
  /* body(c, F, col, colFar): draw figure F as one flat silhouette in `col` (far limbs in colFar, a hair lighter so a
     crossing leg still reads). The scene usually calls person() instead; castShadow() uses this with black.
     F (a pose from walk / stand / kneel / mix …):
       { s scale, f facing ±1, gy ground y, hip [x, y], ang torso lean (rad, + = forward), feet [[x, y] far, near]
         (the sole under the ankle), toes [far, near] foot angles (rad, optional), hands [far, near] grip points or null
         (= hanging), tilt head tilt (rad, + = nod forward), head 'short'|'bob'|'bun'|'cap'|'hat', dress
         'coat'|'jacket'|'apron'|'skirt', sway hem trail (px), box { x, y, w, h } a carried box (drawn between the body
         and the near arm), kneel [far, near] true = that knee bends down (kneeling), hold(c, col) a custom held thing }. */
  K.body = function (c, F, col, colFar) {
    const s = F.s, f = F.f, { P } = frame(F), dress = F.dress || 'jacket';
    const legW = dress === 'coat' || dress === 'skirt' ? [7.5, 5.8, 4.4] : [8.5, 6.4, 4.8];
    const leg = (i, cc) => {
      const T = F.feet[i], hp = P(i ? 3 : -3, 2), ank = [T[0], T[1] - B.ANK * s];
      const low = F.kneel && F.kneel[i];
      const [kn, an] = ik(hp, ank, B.THIGH * s, B.SHIN * s, low ? ((a, b) => a[1] > b[1] ? a : b) : ((a, b) => f * a[0] > f * b[0] ? a : b));
      c.fillStyle = cc; capsule(c, hp, kn, legW[0] * s, legW[1] * s); capsule(c, kn, an, legW[1] * s, legW[2] * s);
      const lift = Math.max(0, F.gy - T[1]), toe = F.toes && F.toes[i] != null ? F.toes[i] : lift > 3 * s ? -.25 * clamp(lift / (10 * s)) : 0;
      const cs = Math.cos(toe), sn = Math.sin(toe), shoe = [[-6, -9], [5, -9], [15, -5], [20, -1.5], [20, 1], [-7, 1]];
      c.beginPath(); shoe.forEach(([u, v], j) => { const x = an[0] + f * (u * cs - v * sn) * s, y = an[1] + B.ANK * s + (u * sn + v * cs) * s; j ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fill();
    };
    const arm = (i, cc) => {
      const sh = K.shoulder(F, i); let T = F.hands[i];
      if (!T) T = [sh[0] - f * 4 * s, sh[1] + 70 * s];
      const up = T[1] < sh[1] - 6 * s;
      const [el, hd] = ik(sh, T, B.UARM * s, B.FARM * s, up ? ((a, b) => a[1] > b[1] ? a : b) : ((a, b) => f * a[0] < f * b[0] ? a : b));
      c.fillStyle = cc; capsule(c, sh, el, 6 * s, 5 * s); capsule(c, el, hd, 5 * s, 3.8 * s);
      const an = Math.atan2(hd[1] - el[1], hd[0] - el[0]);
      c.beginPath(); c.ellipse(hd[0] + Math.cos(an) * 4 * s, hd[1] + Math.sin(an) * 4 * s, 6.5 * s, 4.6 * s, an, 0, TAU); c.fill();
    };
    arm(0, colFar); leg(0, colFar); leg(1, col);
    c.fillStyle = col;
    // below the waist a coat/skirt/apron hangs with gravity: its points turn with only 30 % of the torso lean
    const sw = (F.sway || 0), ha = F.ang * .3, hc = Math.cos(ha), hs = Math.sin(ha), W0 = P(0, 4);
    const hem = (a, b) => { const u = f * a * s, v = -(b - 4) * s; return [W0[0] + u * hc - v * hs - f * sw * s * clamp(-b / 50), W0[1] + u * hs + v * hc]; };
    const poly = pts => { c.beginPath(); pts.forEach((p, i) => { const q = p.length === 3 ? hem(p[0], p[1]) : P(p[0], p[1]); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.fill(); };
    // torso: shoulders → waist (all dresses), then the dress's own lower part
    poly([[-13, 64], [10, 66], [17, 58], [17, 40], [15, 18], [13, 2], [-13, 2], [-16, 20], [-17, 44], [-16, 58]]);
    if (dress === 'coat') poly([[13, 6], [16, -20, 1], [24, -50, 1], [-25, -52, 1], [-18, -18, 1], [-15, 6]]);
    else if (dress === 'skirt') poly([[13, 6], [20, -26, 1], [27, -46, 1], [-26, -47, 1], [-19, -24, 1], [-14, 6]]);
    else if (dress === 'apron') {
      poly([[13, 6], [15, -12], [-16, -12], [-15, 6]]);
      poly([[12, 44], [18, 40], [19, 10], [21, -14, 1], [23, -46, 1], [12, -47, 1], [6, -10], [8, 30]]);   // the apron's bib and skirt, standing off the front
      const b0 = P(-16, 6); c.beginPath(); c.ellipse(b0[0] - f * 4 * s, b0[1] - 1 * s, 5 * s, 3.2 * s, -.5 * f, 0, TAU); c.fill();   // the apron's bow at the back
      c.beginPath(); c.moveTo(b0[0] - f * 2 * s, b0[1]); c.lineTo(b0[0] - f * 8 * s, b0[1] + 11 * s); c.lineTo(b0[0] - f * 5 * s, b0[1] + 12 * s); c.lineTo(b0[0] + f * 1 * s, b0[1] + 2 * s); c.fill();
    } else poly([[13, 6], [16, -14], [-17, -14], [-15, 6]]);
    // neck + head
    const tilt = F.ang + (F.tilt || 0), N = P(3, 64), hu = [Math.sin(tilt), -Math.cos(tilt)];
    capsule(c, N, [N[0] + hu[0] * 12 * s, N[1] + hu[1] * 12 * s], 5.5 * s, 5.5 * s);
    headPath(c, F, [N[0] + hu[0] * 22 * s + F.f * Math.cos(tilt) * 1 * s, N[1] + hu[1] * 22 * s], tilt);
    if (F.box) K.giftBox(c, F.box, col);
    if (F.hold) F.hold(c, col);
    arm(1, col);
  };
  // giftBox(c, box, col): a small gift box {x, y (centre), w, h, a = 0} with a ribbon bow on top, in silhouette
  K.giftBox = function (c, b, col) {
    c.save(); c.translate(b.x, b.y); c.rotate(b.a || 0); c.fillStyle = col;
    c.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); c.fillRect(-b.w / 2 - 2, -b.h / 2 - 5, b.w + 4, 7);   // box + lid
    c.beginPath(); c.ellipse(-7, -b.h / 2 - 11, 8, 5.5, .5, 0, TAU); c.fill(); c.beginPath(); c.ellipse(7, -b.h / 2 - 11, 8, 5.5, -.5, 0, TAU); c.fill();
    if (b.ribbon) { c.fillStyle = b.ribbon; c.fillRect(-2, -b.h / 2 - 5, 4, b.h + 5); c.globalAlpha = .9; c.fillRect(-b.w / 2 - 2, -b.h / 2 - 1, b.w + 4, 2.5); }
    c.restore();
  };
  /* person(ctx, F, { col = C.ink, rim: { x, y, a, reach = 520 } }): draw a figure; with `rim`, a light at (x, y) of
     strength a puts a thin warm edge on the side of the silhouette that faces it (fading with distance). */
  K.person = function (ctx, F, o = {}) {
    const col = o.col || K.C.ink, far = rgb(mix(hex(col), [70, 55, 60], .16));
    if (o.rim && o.rim.a > 0) {
      const R = o.rim, cx = F.hip[0], cy = F.hip[1] - 40 * F.s, dx = R.x - cx, dy = R.y - cy, d = Math.hypot(dx, dy) || 1;
      const a = R.a * clamp(1 - d / (R.reach ?? 520)); if (a > 0) {
        const rc = rgb(mix(hex(col), [255, 196, 120], a)), off = 2.6 * F.s;
        ctx.save(); ctx.translate(dx / d * off, dy / d * off); K.body(ctx, F, rc, rc); ctx.restore();
      }
    }
    K.body(ctx, F, col, far);
  };

  // ---------------- poses (pure data; build, mix, then person())
  const frac = x => x - Math.floor(x);
  // hipFor(feet, x, gy, s, nominal): the highest hip height ≤ nominal from which both legs still reach their feet
  const hipFor = (feet, x, gy, s, nom) => { let h = nom; const L = (B.THIGH + B.SHIN) * s * .985;
    for (const [fx, fy] of feet) { const dx = fx - x; h = Math.min(h, Math.sqrt(Math.max(0, L * L - dx * dx)) + B.ANK * s + (gy - fy)); }
    return h; };
  /* walk(x, gy, s, f, ph, stride, { lift = 14, lean = .05 }) — a walking pose: hip at x, ground gy, scale s, facing f,
     phase ph = distance / stride (use walkAlong), stride px per full cycle (two steps; ~120·s). Feet are planted while in
     stance — they never slide — and the hip drops to keep both legs within reach. Arms swing. */
  K.walk = function (x, gy, s, f, ph, stride, o = {}) {
    const lift = (o.lift ?? 14) * s;
    const feet = [0, 1].map(i => { const p = frac(ph + i * .5); let off, up = 0;
      if (p < .6) off = stride * (.3 - p); else { const u = (p - .6) / .4; off = -.3 * stride + .6 * stride * eio(u); up = lift * Math.sin(Math.PI * u); }
      return [x + f * off, gy - up]; });
    const hipH = hipFor(feet.map(q => [q[0], gy]), x, gy, s, B.HIP * s);
    const F = { s, f, gy, hip: [x, gy - hipH], ang: f * (o.lean ?? .05), feet, hands: [null, null], tilt: 0, sway: 5 * Math.sin(TAU * ph), ph };
    const sw = 14 * Math.sin(TAU * ph) * s, shN = K.shoulder(F, 1), shF = K.shoulder(F, 0);
    F.hands = [[shF[0] + f * sw, shF[1] + 68 * s], [shN[0] - f * sw, shN[1] + 68 * s]];   // arms swing against the legs
    return F;
  };
  // walkAlong(t, t0, t1, x0, x1, stride, ease = .6) → { x, ph, moving }: travel x0 → x1 between t0 and t1, constant
  // speed then easing to a stop over the last `ease` fraction... ph = |x − x0| / stride, so feet stay planted. Pick the
  // stride with stopStride() so the figure stops with both feet down.
  K.walkAlong = function (t, t0, t1, x0, x1, stride, ease = .25) {
    const u = clamp((t - t0) / (t1 - t0)), e = ease, k = u < 1 - e ? u / (1 - e / 2) : (1 - e + e * (1 - Math.pow(1 - (u - 1 + e) / e, 2)) / 2) / (1 - e / 2);
    const x = lerp(x0, x1, clamp(k)); return { x, ph: Math.abs(x - x0) / stride, moving: u > 0 && u < 1 };
  };
  // stopStride(dist, nominal) → a stride near `nominal` such that dist/stride ends at a both-feet-down phase (n + .05)
  K.stopStride = (dist, nom) => { const n = Math.max(1, Math.round(dist / nom - .05)); return dist / (n + .05); };
  // stand(x, gy, s, f, { spread = 13, lean = .02 }) — standing, feet a little apart, arms hanging
  K.stand = function (x, gy, s, f, o = {}) {
    const sp = (o.spread ?? 13) * s, feet = [[x - f * sp, gy], [x + f * sp * .8, gy]];
    return { s, f, gy, hip: [x, gy - hipFor(feet, x, gy, s, (B.HIP - 1) * s)], ang: f * (o.lean ?? .02), feet, hands: [null, null], tilt: 0, sway: 0 };
  };
  // fromWalk(W) — the standing pose a walk stopped in (same feet, hands hanging): hold this after walkAlong ends
  K.fromWalk = W => ({ ...W, hands: [null, null], sway: 0, ang: W.f * .02 });
  // closeStep(W, k) — after a walk stops (fromWalk pose W, feet half a stride apart) the back foot lifts and steps up
  // beside the front one (k 0..1 over ~.4 s); the front foot stays planted, the hip moves over both. Nothing slides.
  K.closeStep = function (W, k) {
    const F = K.fromWalk(W); if (k <= 0) return F;
    const f = F.f, s = F.s, b = f * F.feet[0][0] < f * F.feet[1][0] ? 0 : 1, fr = F.feet[1 - b], to = fr[0] - f * 22 * s, e = eio(k);
    const feet = F.feet.slice(); feet[b] = [lerp(F.feet[b][0], to, e), F.gy - 12 * s * Math.sin(Math.PI * clamp(k))];
    const x = lerp(F.hip[0], (fr[0] + to) / 2 + f * 2 * s, e);
    return { ...F, feet, hip: [x, F.gy - hipFor([[feet[0][0], F.gy], [feet[1][0], F.gy]], x, F.gy, s, (B.HIP - 1) * s)], toes: [0, 0] };
  };
  // kneel(x, gy, s, f, lean = .3) — down on the far knee (shin flat behind, toes tucked), near foot planted forward.
  // lean ~.3 upright (waiting); ~1.1 bent over the ground in front (planting, reaching down).
  K.kneel = function (x, gy, s, f, lean = .3) {
    return { s, f, gy, hip: [x, gy - 58 * s], ang: f * lean, feet: [[x - f * 52 * s, gy - 2 * s], [x + f * 40 * s, gy]], toes: [.9, 0], kneel: [true, false], hands: [null, null], tilt: .15, sway: 0 };
  };
  // mix(A, B, k) — in-between of two poses (positions blend; facing / head / dress come from the nearer one). Use ≥ .4 s
  // for stand ↔ kneel. Hands default to hanging for the blend.
  K.mix = function (A, Bp, k) {
    if (k <= 0) return A; if (k >= 1) return Bp;
    const l2 = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], pick = k < .5 ? A : Bp;
    const hang = F => [0, 1].map(i => { const sh = K.shoulder(F, i); return [sh[0] - F.f * 4 * F.s, sh[1] + 70 * F.s]; });
    const hA = hang(A), hB = hang(Bp);
    return { ...pick, s: lerp(A.s, Bp.s, k), gy: lerp(A.gy, Bp.gy, k), hip: l2(A.hip, Bp.hip), ang: lerp(A.ang, Bp.ang, k), feet: [l2(A.feet[0], Bp.feet[0]), l2(A.feet[1], Bp.feet[1])],
      hands: [0, 1].map(i => l2(A.hands[i] || hA[i], Bp.hands[i] || hB[i])), tilt: lerp(A.tilt || 0, Bp.tilt || 0, k), sway: lerp(A.sway || 0, Bp.sway || 0, k),
      toes: [0, 1].map(i => lerp(A.toes?.[i] ?? 0, Bp.toes?.[i] ?? 0, k)), kneel: k < .5 ? A.kneel : Bp.kneel };
  };
  // reach(F, i, p) — hand i (0 far, 1 near) to world point p (IK keeps the bone lengths: aim within ~70·s of the shoulder)
  K.reach = function (F, i, p) { F.hands = F.hands.slice(); F.hands[i] = p; return F; };
  // armTo(F, i, th, r = 70) — hand i swung through the arc in front of the body: th = 0 hanging, π/2 straight forward,
  // ~2.8 raised high. Blend gestures by blending th (the hand travels the arc, never through the face).
  K.armTo = function (F, i, th, r = 70) { const sh = K.shoulder(F, i), s = F.s; return K.reach(F, i, [sh[0] + F.f * (Math.sin(th) * r - 4 * Math.cos(th)) * s, sh[1] + Math.cos(th) * r * s]); };
  // wave(F, i, t, k = 1) — hand i raised high, waving side to side (k 0..1 swings it up from hanging, in front)
  K.wave = function (F, i, t, k = 1) { return k <= 0 ? F : K.armTo(F, i, eio(k) * (2.75 + .16 * Math.sin(t * 8) * k)); };
  // beckon(F, i, k = 1) — hand i held out forward a little above the waist, open ("come in")
  K.beckon = function (F, i, k = 1) { return k <= 0 ? F : K.armTo(F, i, eio(k) * 1.35, 68); };
  // holdBox(F, w = 40, h = 30, fwd = 26, k = 0) — a box held in front at the waist with both hands under it (k 0..1 pushes
  // it forward, offering it). Sets F.box and both hands; returns F.
  K.holdBox = function (F, w = 40, h = 30, fwd = 26, k = 0) {
    const { P } = frame(F), s = F.s, c = P(fwd + 12 * k, 22 + 8 * k);
    F.box = { x: c[0], y: c[1], w: w * s, h: h * s, a: 0 };
    F.hands = [[c[0] - F.f * w * s * .18, c[1] + h * s * .42], [c[0] + F.f * w * s * .22, c[1] + h * s * .45]];
    return F;
  };
  // lookAt(F, p, max = .5) — tilt the head toward world point p (clamped)
  K.lookAt = function (F, p, max = .5) { const { P } = frame(F), N = P(3, 86), dx = p[0] - N[0], dy = p[1] - N[1];
    const T = F.f > 0 ? Math.atan2(dy, dx) : Math.atan2(-dy, -dx); F.tilt = clamp(T - F.ang, -max, max); return F; };

  // ================================================================ the proscenium
  function buildCurtain(seed) {   // the LEFT curtain, closed width 580 × 1920; pleats as vertical light/dark bands
    const w = 580, h = K.H, c = canvas(w, h), x = c.getContext('2d'), r = rng(seed + 3);
    const N = 9, g = x.createLinearGradient(0, 0, w, 0), lo = hex(K.C.velvetLo), mid = hex(K.C.velvet), hi = hex(K.C.velvetHi);
    for (let i = 0; i <= N * 8; i++) {
      const u = i / (N * 8), ph = (u * N + .25) % 1, crest = Math.pow(.5 + .5 * Math.cos(ph * TAU), 1.6), valley = Math.pow(.5 - .5 * Math.cos(ph * TAU), 6);
      g.addColorStop(u, rgb(mix(mix(mid, hi, crest * .55), lo, valley * .9 + .08 * r())));
    }
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    // velvet sheen: a soft lighter band near the top (stage light), darker toward the floor
    const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(255,170,150,.10)'); v.addColorStop(.35, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,0,2,.45)');
    x.fillStyle = v; x.fillRect(0, 0, w, h);
    // fine pile texture
    const d = x.getImageData(0, 0, w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const p = (j * w + i) * 4, n = (noise(i * .9, j * .08) - .5) * 14 + (r() - .5) * 8; d.data[p] += n; d.data[p + 1] += n * .4; d.data[p + 2] += n * .4; }
    x.putImageData(d, 0, 0);
    return c;
  }
  function buildValance(seed) {   // the valance: pleated band with scalloped swags, a gold braid and tassels; 1080 × 170
    const w = K.W, h = 170, c = canvas(w, h), x = c.getContext('2d'), n = 7, sw = w / n, base = 86, dip = 34;
    const path = new Path2D(); path.moveTo(0, 0); path.lineTo(w, 0); path.lineTo(w, base);
    for (let i = n - 1; i >= 0; i--) { const x0 = (i + 1) * sw, x1 = i * sw; path.bezierCurveTo(x0 - sw * .15, base + dip * 1.35, x1 + sw * .15, base + dip * 1.35, x1, base); }
    path.closePath();
    x.save(); x.clip(path);
    const g = x.createLinearGradient(0, 0, w, 0), lo = hex(K.C.velvetLo), mid = hex(K.C.velvet), hi = hex(K.C.velvetHi);
    for (let i = 0; i <= 140; i++) { const u = i / 140, ph = (u * 34) % 1, cr = Math.pow(.5 + .5 * Math.cos(ph * TAU), 2); g.addColorStop(u, rgb(mix(mix(mid, hi, cr * .4), lo, (1 - cr) * .35))); }
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {   // each swag is shaded darker toward its belly (it hangs in folds)
      const cx = (i + .5) * sw, sg = x.createRadialGradient(cx, base - 10, 10, cx, base + 10, sw * .62);
      sg.addColorStop(0, 'rgba(255,140,130,.10)'); sg.addColorStop(.7, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(15,0,3,.35)'); x.fillStyle = sg; x.fillRect(i * sw, 0, sw, h);
    }
    const tg = x.createLinearGradient(0, 0, 0, 40); tg.addColorStop(0, 'rgba(0,0,0,.55)'); tg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = tg; x.fillRect(0, 0, w, 40);
    x.restore();
    // gold braid along the scallops, a thin line at the top band, tassels at the joins
    x.strokeStyle = K.C.gold; x.lineWidth = 3.2; x.beginPath(); x.moveTo(w, base);
    for (let i = n - 1; i >= 0; i--) { const x0 = (i + 1) * sw, x1 = i * sw; x.bezierCurveTo(x0 - sw * .15, base + dip * 1.35 - 3, x1 + sw * .15, base + dip * 1.35 - 3, x1, base); }
    x.stroke();
    x.strokeStyle = 'rgba(201,161,90,.45)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, 50); x.lineTo(w, 50); x.stroke();
    for (let i = 0; i <= n; i++) { const tx = i * sw;
      x.fillStyle = K.C.goldLo; x.beginPath(); x.arc(tx, base + 4, 6, 0, TAU); x.fill();
      x.fillStyle = K.C.gold; x.beginPath(); x.moveTo(tx - 5, base + 8); x.lineTo(tx + 5, base + 8); x.lineTo(tx + 7, base + 30); x.lineTo(tx - 7, base + 30); x.fill(); }
    return c;
  }
  /* curtains(ctx, open, { gather = 92 }): the proscenium — both side curtains (closed when open = 0; gathered to
     `gather` px each side when open = 1; pleats compress as they gather, the leading edge bellies while they move) and
     the valance on top. Draw after the stage picture and the plaque. */
  K.curtains = function (ctx, open, o = {}) {
    const gw = o.gather ?? 92, cw = lerp(560, gw, clamp(open)), belly = 36 * Math.sin(Math.PI * clamp(open)), bands = 40, bh = K.H / bands;
    for (const side of [-1, 1]) {
      ctx.save();
      if (side > 0) { ctx.translate(K.W, 0); ctx.scale(-1, 1); }
      if (open >= .999 && gw === 92) ctx.drawImage(curOpen, -20, 0);   // fully open: the pre-scaled gathered curtain
      else for (let i = 0; i < bands; i++) {   // the leading edge lags in the middle (a belly) while moving
        const y = i * bh, bx = belly * Math.sin(Math.PI * (y + bh / 2) / K.H) * .9, ww = cw - bx + 20;
        ctx.drawImage(curL, 0, y, 580, bh, -20, y, ww, bh + .6);
      }
      // the leading edge's shadow on the stage
      const eg = ctx.createLinearGradient(cw - belly * .5, 0, cw + 40, 0); eg.addColorStop(0, 'rgba(10,2,4,.45)'); eg.addColorStop(1, 'rgba(10,2,4,0)');
      ctx.fillStyle = eg; ctx.fillRect(cw - 4, 0, 44, K.H);
      ctx.restore();
    }
    ctx.drawImage(val, 0, 0);
  };
  // apron(ctx, y = 1790): the stage floor in front of the scenery — dark boards, plank seams, a lit front lip
  K.apron = function (ctx, y = 1790) {
    const g = ctx.createLinearGradient(0, y, 0, K.H); g.addColorStop(0, K.C.floorHi); g.addColorStop(.12, K.C.floor); g.addColorStop(1, '#0b0706');
    ctx.fillStyle = g; ctx.fillRect(0, y, K.W, K.H - y);
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 1; i < 4; i++) { const yy = y + i * (K.H - y) / 4; ctx.moveTo(0, yy); ctx.lineTo(K.W, yy); }
    for (let i = 0; i < 9; i++) { const xx = 70 + i * 120 + (i % 2) * 40, yy = y + ((i % 3) + 1) * (K.H - y) / 4; ctx.moveTo(xx, yy - (K.H - y) / 4); ctx.lineTo(xx, yy); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,200,150,.12)'; ctx.fillRect(0, y, K.W, 3);
  };

  // ================================================================ the caption plaque
  // plaqueSize(ctx, lines, size = 50) → { w, h, size }: one size for the whole film (the widest line), so the board
  // never resizes between captions.
  K.plaqueSize = function (ctx, lines, size = 50) {
    ctx.save(); ctx.font = `600 ${size}px ${K.SERIF}`; let mw = 0, two = false, src = false;
    for (const l of lines) { const s = Pilot.tr(l[2]); s.split('\n').forEach(q => mw = Math.max(mw, ctx.measureText(q).width)); if (s.includes('\n')) two = true; if (l[3]) src = true; }
    ctx.restore();
    return { w: clamp(mw + 150, 520, 820), h: (two ? 190 : 132) + (src ? 44 : 0), size };
  };
  /* plaque(ctx, x, y, w, h, ang, drop = 0, o): the hanging board: two strings from above the frame to its top corners,
     the dark board (paper edge, a soft top light), a dotted inner border and corner studs, rotated by ang (rad) about the
     string top (x, 0) and lowered by `drop` px (0 = at rest, its top edge at y). o.words(ctx, cx, cy) draws the words in
     board space (centre at cx, cy). */
  K.plaque = function (ctx, x, y, w, h, ang, drop = 0, o = {}) {
    ctx.save(); ctx.translate(x, 0); ctx.rotate(ang); ctx.translate(0, y - drop);
    const sx0 = -w / 2 + 46, sx1 = w / 2 - 46;
    ctx.strokeStyle = 'rgba(28,18,18,.9)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(sx0, -y - 40 + drop); ctx.lineTo(sx0, 4); ctx.moveTo(sx1, -y - 40 + drop); ctx.lineTo(sx1, 4); ctx.stroke();
    const pts = K.jag([[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]], 1.3, 77, 10), p = K.addPoly(new Path2D(), pts);
    ctx.save(); ctx.translate(7, 9); ctx.fillStyle = 'rgba(10,4,8,.28)'; ctx.fill(p); ctx.restore();
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, K.C.boardHi); g.addColorStop(1, K.C.board); ctx.fillStyle = g; ctx.fill(p);
    ctx.fillStyle = K.C.dot;
    const ins = 13, dot = (px, py) => { ctx.beginPath(); ctx.arc(px, py, 1.8, 0, TAU); ctx.fill(); };
    for (let u = -w / 2 + ins; u <= w / 2 - ins + .1; u += (w - 2 * ins) / Math.round((w - 2 * ins) / 15)) { dot(u, ins); dot(u, h - ins); }
    for (let v = ins; v <= h - ins + .1; v += (h - 2 * ins) / Math.round((h - 2 * ins) / 15)) { dot(-w / 2 + ins, v); dot(w / 2 - ins, v); }
    ctx.fillStyle = '#7d6449'; for (const [u, v] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) { const px = u * (w / 2 - 6), py = v ? h - 6 : 6; ctx.beginPath(); ctx.moveTo(px, py - 5); ctx.lineTo(px + 5, py); ctx.lineTo(px, py + 5); ctx.lineTo(px - 5, py); ctx.fill(); }
    ctx.fillStyle = '#5c4632'; ctx.beginPath(); ctx.arc(sx0, 9, 3.4, 0, TAU); ctx.arc(sx1, 9, 3.4, 0, TAU); ctx.fill();
    if (o.words) o.words(ctx, 0, h / 2);
    ctx.restore();
  };
  // italic(ctx, s, x, y, o): Pilot.text in an italic serif (Noto Serif KR has no italic: a synthesised 11° slant)
  K.italic = function (ctx, s, x, y, o = {}) { ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, -.19, 1, 0, 0); Pilot.text(ctx, s, 0, 0, o); ctx.restore(); };
  /* captions(ctx, t, lines, { from, to, y = 236, size = 50, swing = .05 }): the plaque captions for SCRIPT.lines
     ([from, to, text, source?]). The board drops in from behind the valance at `from` (default: .6 s before the first
     line) and hangs all film long, swinging a little each time new words arrive; words fade in/out on it (italic serif,
     a source line in small sans under them). `to`: the board is pulled back up (e.g. before an end card). */
  K.captions = function (ctx, t, lines, o = {}) {
    if (!lines.length) return;
    const from = o.from ?? lines[0][0] - .6; if (t < from) return;
    const sz = o.sizeCache || (K._pl = K._pl && K._pl.key === lines ? K._pl : { key: lines, v: K.plaqueSize(ctx, lines, o.size ?? 50) }).v;
    const y = o.y ?? 236, dt = t - from;
    let drop = (1 - K.spring(dt, 5)) * (y + sz.h + 30);
    if (o.to != null && t > o.to) drop += (y + sz.h + 60) * eio((t - o.to) / .8);
    let ang = (o.swing ?? .05) * Math.exp(-1.5 * dt) * Math.sin(dt * 3.3 + .6);
    for (const l of lines) if (t > l[0] && l[0] > from + .3) { const e = t - l[0]; ang += .018 * Math.exp(-1.6 * e) * Math.sin(e * 3.3); }
    K.plaque(ctx, 540, y, sz.w, sz.h, ang, drop, { words: (c, cx, cy) => {
      for (const [a, b, s, src] of lines) {
        const al = Pilot.win(t, a, b, .4, .4); if (al <= 0) continue;
        const ls = Pilot.tr(s).split('\n'), size = ls.length > 1 ? sz.size * .94 : sz.size, lh = size * 1.42, y0 = cy - (ls.length - 1) * lh / 2 + size * .36 - (src ? 20 : 0);
        K.italic(c, ls.join('\n'), cx, y0, { size, weight: 600, font: K.SERIF, color: K.C.words, alpha: al, lh: 1.42 });
        if (src) Pilot.text(c, src, cx, y0 + (ls.length - 1) * lh + 52, { size: 26, font: K.SANS, color: K.C.wordsSrc, alpha: al * .9, ls: 1 });
      }
    } });
  };
  /* endCard(ctx, t, card, at, { y = 760 }): the end card on the closed curtain (close them with curtainOpen(…, closeAt =
     at − .9)): title in serif cream, a gold rule, passage and by-line in small sans. */
  K.endCard = function (ctx, t, card, at, o = {}) {
    const a = ss(at, at + .6, t); if (a <= 0) return;
    const y = o.y ?? 760, sh = 'rgba(20,0,4,.8)', q = card.compact ? .35 : 1, ls = String(Pilot.tr(card.title)).split('\n').length;
    if (card.kicker) Pilot.text(ctx, card.kicker, 540, y - 110, { size: 30, font: K.SANS, weight: 500, color: K.C.gold, alpha: a, ls: 2, shadow: sh, shadowBlur: 10 });
    Pilot.text(ctx, card.title, 540, y, { size: 72, weight: 700, font: K.SERIF, color: K.C.words, alpha: a, shadow: sh, shadowBlur: 14, lh: 1.4 });
    const yr = y + (ls - 1) * 100 + 64, rw = 260 * eio((t - at - .2) / .7);
    if (rw > 1) { ctx.fillStyle = K.C.gold; ctx.globalAlpha = a; ctx.fillRect(540 - rw / 2, yr, rw, 2.5); ctx.beginPath(); ctx.moveTo(540, yr - 7); ctx.lineTo(547, yr + 1.2); ctx.lineTo(540, yr + 9); ctx.lineTo(533, yr + 1.2); ctx.fill(); ctx.globalAlpha = 1; }
    Pilot.text(ctx, card.passage, 540, yr + 74, { size: 34, font: K.SANS, weight: 500, color: K.C.wordsSrc, alpha: a * ss(at + .4 * q, at + 1.3 * q, t), shadow: sh, shadowBlur: 8 });
    Pilot.text(ctx, card.by, 540, yr + 130, { size: 30, font: K.SANS, color: K.C.wordsSrc, alpha: a * ss(at + .6 * q, at + 1.5 * q, t) * .9, shadow: sh, shadowBlur: 8 });
    if (card.cta) Pilot.text(ctx, card.cta, 540, yr + 230, { size: 30, font: K.SANS, weight: 600, color: K.C.gold, alpha: a * ss(at + 1.2, at + 2.1, t), ls: 2, shadow: sh, shadowBlur: 8 });
  };

  // ================================================================ post
  // post(ctx, { grain = .7 }): paper grain and vignette (one overlay sheet, see init) over the whole frame. Draw it after
  // the curtains; the plaque is drawn before it so the board gets the grain too; end-card words go after it.
  K.post = function (ctx, o = {}) {
    const a = o.grain ?? .7; if (a <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = a; ctx.drawImage(grain, 0, 0); ctx.restore();
  };
  // fade(ctx, t, dur, fi = .5, fo = .5): from/to black at the ends (Story.fadeBlack's curve; fi or fo 0 = no fade there)
  K.fade = function (ctx, t, dur, fi = .5, fo = .5) {
    const k = 1 - (fi > 0 ? ss(0, fi, t) : 1) * (1 - (fo > 0 ? ss(dur - fo, dur, t) : 0)); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, K.W, K.H); ctx.restore();
  };

  window.ShadowStage = K;
})();
