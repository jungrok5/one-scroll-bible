/* kit-doreline.js — house style "line engraving" (global: window.ENG). Kits: canvas-film kits/doreline (STYLE.md). From one-scroll-bible
   「메시아 예언과 성탄」 (2026-11-03: the shepherds' field). Line engraving after Gustave Doré's Bible plates (Lemo-Opuscar
   `engraving`, OPUSCAR 64). The picture is drawn as values only (a grey "plate", 0 = black … 1 = white); ENG.engrave() cuts it into
   parallel lines on cream paper: each line swells where the plate is dark, thins and breaks where it is light, a second set
   crosses it in the deepest shadows, and pure light is bare paper. Lines follow a field (horizontal swells in the sky, the
   contour of the land below) given as a function, so they read like a burin following the form. Computed per frame (the light
   can flood the plate: hatching parts where the glory comes).
     ENG.engrave(ctx, plate, { field: (x, y) => s, spacing: 7, ink: [32,22,14], paper: [239,228,204], cross: .58, crossAngle: 1.05 }) */
(function () {
  const P = Pilot;
  function engrave(ctx, plate, o = {}) {
    const w = plate.width, h = plate.height, src = plate.getContext('2d').getImageData(0, 0, w, h).data;
    if (!ENG.buf || ENG.buf.width !== w || ENG.buf.height !== h) { ENG.buf = P.canvas(w, h); ENG.bg = ENG.buf.getContext('2d'); }
    const out = ENG.bg.createImageData(w, h), d = out.data;
    const sp = o.spacing || 7, ink = o.ink || [32, 22, 14], paper = o.paper || [239, 228, 204], tint = o.tint, cr = o.cross ?? .58, ca = o.crossAngle ?? 1.05, cs = Math.cos(ca), sn = Math.sin(ca);
    const field = o.field || ((x, y) => y), aa = 1.2 / sp;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) << 2, v = (.3 * src[i] + .59 * src[i + 1] + .11 * src[i + 2]) / 255, c = 1 - v;   // ink wanted here
      const f1 = field(x, y) / sp, d1 = Math.abs(f1 - Math.floor(f1) - .5) * 2;                                // 0 on a line … 1 between
      let cov = Math.min(1, Math.max(0, (c * 1.05 - d1) / aa + .5));
      if (c > cr) { const f2 = (x * cs + y * sn) / (sp * 1.15), d2 = Math.abs(f2 - Math.floor(f2) - .5) * 2; cov = Math.max(cov, Math.min(1, Math.max(0, ((c - cr) / (1 - cr) - d2) / aa + .5))); }
      const pc = tint ? [paper[0] * (1 - tint[3]) + tint[0] * tint[3], paper[1] * (1 - tint[3]) + tint[1] * tint[3], paper[2] * (1 - tint[3]) + tint[2] * tint[3]] : paper;
      d[i] = pc[0] + (ink[0] - pc[0]) * cov; d[i + 1] = pc[1] + (ink[1] - pc[1]) * cov; d[i + 2] = pc[2] + (ink[2] - pc[2]) * cov; d[i + 3] = 255; }
    ENG.bg.putImageData(out, 0, 0); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(ENG.buf, 0, 0); ctx.restore();   // via a buffer: drawn in order with the rest
  }
  const ENG = window.ENG = { engrave };
})();
