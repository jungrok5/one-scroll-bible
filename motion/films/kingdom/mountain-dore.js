// mountain-dore.js — 「kingdom」 3부 N13 (film ≈ 282.9–288.3): the night on the mountain cut into a line engraving after Gustave Doré.
// Source: motion-skills canvas-film/kits/doreline/kit.js (ENG.engrave — one-scroll-bible 「메시아」 engrave-shepherds.js, 2026-11-03),
// copied here (the skill repo is not modified) and changed for this scene:
//   * the plate is the 3D frame itself (crowd-evening3d.js S3): its luma, lifted (Doré's night skies keep a lot of paper),
//     with the subtitle band filled toward solid ink so the words never sit on stripes (STYLE.md "Checks");
//   * the lines are CUT over time, as a burin does (cinecode styles/engraving.md §5 "cutting order is the animation"): each line
//     starts on its own beat (top of the plate first, a little out of order) and its cut runs across the frame in 0.9 s; the
//     crossing lines in the deep shadows follow; meanwhile the colour drains into the paper — at the end it is a print;
//   * the field: horizontal swells in the sky; below the horizon the lines bend down the knoll's flanks (they follow the form).
// Nothing in it is random per frame: the lines are fixed in the frame, only the picture under them moves (a slow dolly out).
//   const ENG = makeEngraver(W, H);  ENG.draw(ctx, k, { t, t0, xs, hy, ink, paper })   ctx already holds the 3D frame
//   k: 0 → no engraving (nothing done), 1 → the full print. t0: when the cutting began (film seconds).
export function makeEngraver(W, H) {
  const buf = document.createElement('canvas'); buf.width = W; buf.height = H; const bx = buf.getContext('2d', { willReadFrequently: true });
  const src = document.createElement('canvas'); src.width = W; src.height = H; const sx = src.getContext('2d', { willReadFrequently: true });
  const out = bx.createImageData(W, H), d = out.data;
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const ss = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  function draw(ctx, k, o = {}) {
    if (k <= 0) return;
    sx.setTransform(1, 0, 0, 1, 0, 0); sx.drawImage(ctx.canvas, 0, 0, W, H);
    const s = sx.getImageData(0, 0, W, H).data;
    const sp = (o.spacing || 10) * (W / 1080), ink = o.ink || [34, 24, 16], paper = o.paper || [216, 202, 176], warm = [255, 214, 140];
    const t = o.t || 0, t0 = o.t0 ?? t, el = t - t0, xs = o.xs ?? W / 2, hy = o.hy ?? H * .5, band0 = H * .64, band1 = H * .78;
    const cr = .7, ca = 1.05, cs = Math.cos(ca), sn = Math.sin(ca), aa = 1.7 / sp, nLines = H / sp;
    const drain = ss(.7, 3.6, el) * k, cutK = k;   // the colour goes into the paper; the cutting (k caps it so a partial k shows a partial print)
    for (let y = 0; y < H; y++) {
      const kb = ss(band0, band1, y), below = ss(hy - 30, hy + 90, y), sw = 8 * (W / 1080);
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) << 2, L = (.3 * s[i] + .59 * s[i + 1] + .11 * s[i + 2]) / 255;
        let v = Math.min(1, .06 + 1.3 * Math.pow(L, .8)); v *= 1 - .72 * kb;          // the plate: lifted night; ink under the words
        const c = 1 - v;
        // the line field: swells in the sky, bending down the flanks of the knoll below the horizon
        const f = y + sw * Math.sin(x * .0042 / (W / 1080) + 1.3) * (1 - below) + below * Math.abs(x - xs) * .13;
        const f1 = f / sp, n = Math.floor(f1), d1 = Math.abs(f1 - n - .5) * 2;
        // the burin's schedule for this line: top first, a little out of order; its cut runs across in 0.9 s (alternating direction)
        const tn = (n / nLines) * 1.5 + hash(n) * .65, run = (el - tn) / .9, px = n & 1 ? 1 - x / W : x / W, cut = Math.min(1, Math.max(0, (run - px) * 14)) * cutK;
        let cov = Math.min(1, Math.max(0, (c * 1.12 - d1) / aa + .5)) * cut;
        if (c > cr) { const f2 = (x * cs + y * sn) / (sp * 1.15), m = Math.floor(f2), d2 = Math.abs(f2 - m - .5) * 2, tm = 1.4 + hash(m + 999) * 1.2 + (y / H) * .5, cut2 = Math.min(1, Math.max(0, (el - tm) / .5)) * cutK;
          cov = Math.max(cov, Math.min(1, Math.max(0, ((c - cr) / (1 - cr) - d2) / aa + .5)) * cut2); }
        const tw = Math.max(0, L - .55) * .55, pr = paper[0] + (warm[0] - paper[0]) * tw, pg = paper[1] + (warm[1] - paper[1]) * tw, pb = paper[2] + (warm[2] - paper[2]) * tw;
        // the base under the lines: the 3D colour draining into the paper
        const br = s[i] + (pr - s[i]) * drain, bg = s[i + 1] + (pg - s[i + 1]) * drain, bb = s[i + 2] + (pb - s[i + 2]) * drain;
        d[i] = br + (ink[0] - br) * cov; d[i + 1] = bg + (ink[1] - bg) * cov; d[i + 2] = bb + (ink[2] - bb) * cov; d[i + 3] = 255; } }
    bx.putImageData(out, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(buf, 0, 0); ctx.restore();
  }
  return { draw };
}
