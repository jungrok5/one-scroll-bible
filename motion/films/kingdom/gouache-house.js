// gouache-house.js — 「kingdom」 7부 「왕을 모신 사람들」 block 7-2: the house of Zacchaeus at night, film 767.8 (N33) → 805.8 (Q19b)
//   N33  「사람들은 죄인의 집에 들어갔다며 수군거렸지만, / 삭개오는 기뻐하며 그 왕을 모셔 들였습니다.」 · N33b 「그리고 삭개오가 일어나 말했습니다.」 ·
//   Q19  눅 19:8 「주여 보시옵소서 내 소유의 절반을 가난한 자들에게 주겠사오며 / 만일 누구의 것을 속여 빼앗은 일이 있으면 네 갑절이나 갚겠나이다」 ·
//   N33c 「예수님이 말씀하셨습니다.」  (Q19b at 805.8 belongs to 7-3, which opens on the house from the street — a cut)
// Look (new for this film): opaque night gouache — solid flat colour masses in a few value bands, a hard warm–cool split (the
// lamplit room in umber/orange, the night street in teal-blue), dry-brush broken edges, a matte paper surface, chalky lights laid
// on top of the darks (gouache paints light over dark). film_ref: 「용서받지 못한 자」 (1992, OPUSCAR 65) — Frederic Remington's
// blue-green nocturnes lit by warm windows; 「아라비아의 로렌스」 (1962, OPUSCAR 35) — Terpning's poster gouache warm–cool split
// (the first film's 「출애굽」 Passover door, motion/pilot/exodus.html, is the channel's own gouache bar); Georges de La Tour's
// single-lamp interiors for the table. Built as 3D blocking (lib3d/cine.js: fog, lamp in-scatter, bloom, DOF, vignette) and then
// repainted by a gouache pass that is FIXED in the frame (no per-frame noise — owner: no flicker):
//   pass 1  Kuwahara (r 6) → flat loaded masses; value posterised into bands in a perceptual scale, the band threshold dragged by
//           a fixed brush field (hard edges that break along the stroke); colour pulled toward two gouache ramps — the cool night
//           ramp and the warm lamp ramp — by each pixel's own warmth (the warm–cool split is decided by the light, not by a mask)
//   pass 2  dry brush: the paint sampled along a fixed stroke field so every boundary between two masses breaks into bristle
//           streaks; dry skips where the tooth is low; chalky opaque lights on the light masses; matte cold-press paper; the lens
//           bloom of the 3D render laid back on top (the lamp still blooms past the paint).
// Shots (cinecode camera-moves; one slow move each; cut in and out moving — the speed never stalls inside a shot):
//   B1 street   767.8–779.2  push in (dolly, ~0.47 m/s, slow) past the murmurers toward the door. Foreground: two knots of people
//               at the low walls, heads bent together (one whispers behind his hand, one turns to look at the door). Beyond: the
//               guest (oatmeal cloak, grey-brown head cloth — only ever from behind) walks up the street to the open door; the small
//               man (rust head cloth) at the door beckons him; on 「삭개오는 기뻐하며…」 he opens his arm to the door, the guest goes in,
//               he follows him in, and the light inside comes up (the lamps lit) and spills out onto the street.
//   B2 rise     779.2–784.3  inside, behind the seated guest (his back, lower right, dark): pedestal up with the small man as he
//               rises from his knees at the table, the lamp beside him, the blue night of the open door behind him.
//   B3 table    784.3–801.0  close on the table from its end (push-in, slow): his two hands (painted 2D shapes — 3D hands look crude
//               close; owner) come in and push the stacked purses across toward the guest; coins slide out of the tipped purse; on the
//               second half (「네 갑절이나 갚겠나이다」) the hands bring the tax tally board and the big purse after them — it tips and
//               more coins run out. The lamp's pool spreads over them all the while.
//   B4 look     801.0–805.8  over the guest's shoulder (a dark soft shape, low left): he raises his head to the small man standing in
//               the lamplight; push-in toward Zacchaeus; the light on him grows.
// People: people3d.js (robeMan, two-bone IK, fixed limb lengths, elbows down/out; walk() with planted feet). Zacchaeus is small
// (h 1.48, Lk 19:3) with the rust head cloth (#8a3b24) in every shot; the guest is the same build and clothes as the other men,
// back view only, never central-big, no glow. No long hair on any man; adult men keep a beard line.
// Skills read: canvas-film STYLE-INDEX (35 Terpning poster gouache, 14 Welsh valley gouache), kits/storybook (night gouache: flat
// opaque fills, rough edges, chalky dry-brush tooth — method), kits/lamplit + kits/oilpaint example.caravaggio (one lamp in the dark),
// oil-paint-world (pass structure, as roof-table-3d.js), cinematic-3d (lib3d/cine.js), cinecode camera-moves (dolly in, pedestal,
// push-in on detail, over-the-shoulder push).
// API: const GH = await (await import('./gouache-house.js')).build(W, H);  GH.draw(ctx, t, B, shot)  t = FILM seconds,
//      shot = 'b1' | 'b2' | 'b3' | 'b4' (the page's scene table picks it); B = { N33, N33b, Q19, N33c, Q19b, pc: { id: [piece times] } }.
//      GH.measure(B, t0, t1) → { joints, cam } (no GPU work) for the body / motion-continuity checks. Pure in t.
import { Film, THREE, V, col, rng } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const { clamp, lerp, ss } = P;
const face = (dx, dz) => Math.atan2(-dx, -dz);   // rotation.y that turns a figure (facing −z) toward (dx, dz)
const sine = x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
// camera progress through a shot: the speed runs 0.85 → 1.15 of its mean (it never starts from or drops to zero inside a shot —
// motion-continuity: cut in moving, cut out moving)
const prog = x => { x = clamp(x); return .85 * x + .15 * x * x; };
const NOPASS = typeof location !== 'undefined' && /[?&]nopass=1/.test(location.search);   // debug: the 3D frame without the gouache pass

export function beats(B) {
  const pc = B.pc || {}, T = {};
  T.b1 = B.N33; T.b2 = B.N33b; T.b3 = B.Q19; T.b4 = B.N33c; T.end = B.Q19b;
  T.n33b = (pc.N33 && pc.N33[1]) || B.N33 + 5.5;   // 「삭개오는 기뻐하며 그 왕을 모셔 들였습니다」
  T.q19b = (pc.Q19 && pc.Q19[1]) || B.Q19 + 7.8;   // 「만일 누구의 것을 속여 빼앗은 일이 있으면 네 갑절이나 갚겠나이다」
  // B1 — the guest reaches the threshold a little after the second piece begins; the small man beckons through the first piece
  T.door = T.n33b + 1.5;                              // the guest at the threshold
  T.beck = [B.N33 - .6, T.n33b + .5];                 // beckoning (already under way when the shot opens)
  T.welcome = [T.n33b - .4, T.n33b + 1.9];            // the open arm toward the door (it takes over from the beckoning in the same 0.9 s)
  T.zTurn = [T.door + .15, T.door + 1.15];            // he turns (stepping) to the door …
  T.zWalk = T.door + .95;                             // … and follows him in
  T.lampUp = [T.n33b + .6, T.n33b + 4.6];             // the light inside comes up as they go in
  T.whisper = [B.N33 - 1, B.N33b];                    // the murmurers lean in and out the whole first shot
  T.turnLook = [B.N33 + 1.0, B.N33 + 3.2];            // one of them turns his head to the door
  // B2
  T.rise = [B.N33b + .6, B.N33b + 3.6];
  // B3 — two events, one per half of the verse
  T.in1 = [B.Q19 - .2, B.Q19 + 1.1];                  // the hands come in
  T.push1 = [B.Q19 + .9, B.Q19 + 4.4];                // they push the purses across
  T.spill1 = [B.Q19 + 2.0, B.Q19 + 7.2];   // round 3: the coins keep running out until the second half (no still stretch between the two gestures)              // coins slide out of the tipped purse
  T.back1 = [B.Q19 + 5.0, T.q19b + .1];               // the hands draw back to the board and the big purse
  T.push2 = [T.q19b + .3, T.q19b + 3.9];              // and push them after the rest
  T.spill2 = [T.q19b + 1.9, T.q19b + 5.4];            // the big purse tips: more coins
  T.glow = [B.Q19 + .3, B.Q19b];                      // the lamp's pool spreads (one smooth rise over B3–B4)
  // B4
  T.look = [B.N33c + .25, B.N33c + 2.6];              // the guest raises his head
  return T;
}

export async function build(W, H) {
  const film = new Film({
    W, H, dur: 1e4, fov: 44, near: .02, far: 400,
    atmos: { density: .006, falloff: .05, base: 0, start: 3, color: col('#2a4054', .55), colorUp: col('#2e465a', .55), max: 400, scatter: 1, anisotropy: .6, phaseMix: .6 },
    bloom: { strength: .085, radius: 1.1, tint: col('#ffd9a8') },
    dof: { focus: 8, aperture: 2, maxCoc: 14 },
    look: { exposure: 1.25, contrast: 1.0, saturation: 1.0, lift: col('#18242e'), shadowTint: col('#dfe8f0'), highTint: col('#fff0d8'), vignette: .3, grain: 0, ca: .12 },
  });
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither (no per-frame shimmer)
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera, R = film.renderer;
  let T = null;
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;

  // ---------------------------------------------------------------- materials
  // mud plaster / earth / wood with large painterly patches (after roof-table-3d.js surfM) — the gouache pass turns them into
  // flat patches of two or three values, which is what a gouache wall is
  const surfM = (base, key, o = {}, big = .8) => { const m = new THREE.MeshStandardMaterial({ color: base, roughness: .95, ...o });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;\n' + hashGLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 N = normalize(vWN); vec2 q = abs(N.y) > .7 ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
            float big = fb(q * ${big.toFixed(2)} + 3.1), st = smoothstep(.52, .68, fb(q * 1.6 + 7.)), low = smoothstep(.9, 0., vWP.y);
            diffuseColor.rgb *= mix(.8, 1.12, big) * (1. - st * .14) * (1. - low * .16); }`); };
    m.customProgramCacheKey = () => 'gh-surf-' + key; return m; };
  const M = {
    wall: surfM('#8e9aa0', 'wall'), wall2: surfM('#7c8890', 'wall2'), wallFar: surfM('#5e6c78', 'wallF'), earth: surfM('#6e6a62', 'earth', {}, .5),
    room: surfM('#a07c5a', 'room'), floor: surfM('#6a5038', 'floor', {}, 1.2), wood: surfM('#4a3220', 'wood'), woodL: surfM('#6a4a2c', 'woodL'),
    beam: surfM('#2e2016', 'beam'), dark: K.std('#1a1410', { roughness: 1 }),
  };
  const box = (w, h, d, x, y, z, m, parent = S, r = .02) => { const b = new THREE.Mesh(r > 0 ? K.roundedBox(w, h, d, Math.min(r, w / 4, h / 4, d / 4), 2) : new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; parent.add(b); return b; };

  // ---------------------------------------------------------------- the sky: night teal with a sliver of moon (upper left)
  const MOON = V(-.42, .5, -.76).normalize();
  const skyM = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { lo: { value: col('#3e5c74') }, mid: { value: col('#33506a') }, hi: { value: col('#2a4460') }, moon: { value: MOON }, mk: { value: 1 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec3 vD; uniform vec3 lo, mid, hi, moon; uniform float mk;
      void main(){ vec3 d = normalize(vD); float y = d.y;
        vec3 c = mix(lo, mid, smoothstep(-.02, .22, y)); c = mix(c, hi, smoothstep(.22, .75, y));
        float a = acos(clamp(dot(d, moon), -1., 1.));
        c += vec3(.18, .24, .3) * .35 * exp(-a * a / .02) * mk;                 // the moon's halo on the sky
        vec3 m2 = normalize(moon + vec3(.014, .012, .0));                       // the shadowed part of the disc: a sliver remains
        float disc = smoothstep(.0145, .0125, a), cut = smoothstep(.0128, .0142, acos(clamp(dot(d, m2), -1., 1.)));
        c = mix(c, vec3(3.2, 3.1, 2.7), disc * cut * mk);
        gl_FragColor = vec4(c, 1.); }` });
  const skyMesh = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), skyM); skyMesh.frustumCulled = false; S.add(skyMesh);

  // ---------------------------------------------------------------- the street and the house of Zacchaeus (door centred at x 0, front face z 0)
  const ST = new THREE.Group(); S.add(ST);
  const DW = .82, DH = 2.08, WH = 3.0, WT = .45;   // door width / height, wall height / thickness
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.earth); g.rotation.x = -Math.PI / 2; g.position.set(0, 0, 10); g.receiveShadow = true; ST.add(g);
    // the front wall with the doorway; a wooden lintel; the parapet with roof-beam ends sticking out
    box(4.5 - DW / 2, WH, WT, -(DW / 2 + (4.5 - DW / 2) / 2), WH / 2, -WT / 2, M.wall, ST, .04);
    box(4.5 - DW / 2, WH, WT, DW / 2 + (4.5 - DW / 2) / 2, WH / 2, -WT / 2, M.wall, ST, .04);
    box(DW + .02, WH - DH, WT, 0, DH + (WH - DH) / 2, -WT / 2, M.wall, ST, .02);
    box(DW + .5, .14, .2, 0, DH + .07, .05, M.wood, ST);
    box(9.2, .38, WT + .06, 0, WH + .19, -WT / 2, M.wall2, ST, .05);
    for (let i = 0; i < 11; i++) { const x = -4.1 + i * .82, b = new THREE.Mesh(new THREE.CylinderGeometry(.07, .08, .32, 7), M.beam); b.rotation.x = Math.PI / 2; b.position.set(x, WH - .2, .05); b.castShadow = true; ST.add(b); }
    box(DW + .3, .1, .55, 0, .05, .2, M.wall2, ST, .02);   // the threshold stone
    // the door leaf, swung in against the inner wall
    const leaf = box(DW * .96, DH - .04, .06, 0, (DH - .04) / 2, 0, M.woodL, ST, .01); leaf.geometry.translate(DW * .48, 0, 0); leaf.position.set(-DW / 2 + .02, (DH - .04) / 2, -WT - .04); leaf.rotation.y = -1.75;
    // a water jar and a bench by the wall outside
    const jar = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.16, .03], [.22, .2], [.2, .42], [.1, .55], [.08, .6], [.11, .63]].map(([r, y]) => new THREE.Vector2(r, y)), 18), M.wood); jar.position.set(1.25, 0, .35); jar.castShadow = jar.receiveShadow = true; ST.add(jar);
    jar.material = surfM('#6e5444', 'jar');
    box(1.4, .42, .38, -1.6, .21, .3, M.wall2, ST, .05);
    // the neighbours: the left house stepped forward and taller, the right one set back and lower
    box(6, 3.6, 3, -7.5, 1.8, 1.2 - 1.5, M.wall2, ST, .05); box(6.2, .3, 3.1, -7.5, 3.75, -.3, M.wallFar, ST, .05);
    box(6, 2.7, 3, 7.5, 1.35, -1.0 - 1.5, M.wall2, ST, .05); box(6.2, .28, 3.1, 7.5, 2.84, -2.5, M.wallFar, ST, .05);
    box(.5, .7, .1, -6.2, 2.4, 1.23, M.dark, ST, .01);   // a small dark window next door
    // the town beyond the roofs (fog fades it), a date palm against the sky at the right
    const r = rng(7);
    for (let i = 0; i < 16; i++) { const w = 2.5 + r() * 3, h = 3.5 + r() * 3.2, x = -16 + i * 2.2 + r(), z = -8 - r() * 9; box(w, h, 3, x, h / 2, z, M.wallFar, ST, .05); }
    const palm = new THREE.Group(); palm.position.set(3.2, 0, -6.5); ST.add(palm);
    { const tg = new THREE.CylinderGeometry(.11, .2, 7.2, 8, 12); const p = tg.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 3.6; p.setX(i, p.getX(i) + .35 * (y / 7.2) ** 2); } tg.translate(0, 3.6, 0); tg.computeVertexNormals();
      const tr = new THREE.Mesh(tg, M.beam); tr.castShadow = true; palm.add(tr);
      const fm = K.std('#1c2a2c', { roughness: 1, side: THREE.DoubleSide });
      for (let i = 0; i < 15; i++) { const a = i / 15 * 6.283 + r() * .3, fg = new THREE.PlaneGeometry(2.4, .34, 12, 1), fp = fg.attributes.position;
        for (let j = 0; j < fp.count; j++) { const u = (fp.getX(j) + 1.2) / 2.4; fp.setY(j, fp.getY(j) * Math.sin(Math.PI * Math.min(1, u * 1.15)) - .95 * u * u * (.6 + .4 * Math.cos(i))); fp.setX(j, u * 2.4); }
        fg.computeVertexNormals(); const f = new THREE.Mesh(fg, fm); f.position.set(.35, 7.15, 0); f.rotation.set(0, a, .25 + r() * .3); palm.add(f); } }
    // the low walls of the foreground and the houses across the street (seen from inside through the door)
    box(1.6, .82, .4, -2.15, .41, 7.0, M.wall2, ST, .05); box(1.5, .78, .4, 2.1, .39, 7.4, M.wall2, ST, .05);
    for (let i = 0; i < 6; i++) { const h = 2.8 + (i % 3) * .5; box(3.2, h, 2, -8 + i * 3.25, h / 2, 17, M.wallFar, ST, .05); }
  }
  // ---------------------------------------------------------------- the room
  const RM = new THREE.Group(); S.add(RM);
  const TY = .42, TC = V(0, TY, -2.05);   // table top height, table centre
  { box(6, .1, 5, 0, -.05, -2.7, M.floor, RM, 0);
    box(6, 2.9, .3, 0, 1.45, -5.3, M.room, RM, .02); box(.3, 2.9, 5, -3.1, 1.45, -2.75, surfM('#a07c5a', 'roomS', {}, .3), RM, .02); box(.3, 2.9, 5, 3.1, 1.45, -2.75, M.room, RM, .02);
    box(6.4, .2, 5.2, 0, 2.95, -2.75, M.beam, RM, 0);
    for (let i = 0; i < 7; i++) box(.16, .2, 5, -2.6 + i * .86, 2.78, -2.75, M.beam, RM, .02);
    // the low table, cushions round it, a niche with jars, a chest, a hanging cloth
    box(1.55, .06, 1.1, TC.x, TY - .03, TC.z, M.woodL, RM, 0);   // (a plain box: roundedBox grows by its bevel and the top would sit 1.5 cm high)
    for (const [x, z] of [[-.68, -.48], [.68, -.48], [-.68, .48], [.68, .48]]) box(.08, TY - .06, .08, TC.x + x, (TY - .06) / 2, TC.z + z, M.wood, RM, .01);
    for (const [x, z, c] of [[-.15, -1.3, '#6e3624'], [-.3, -2.98, '#4e5a4a'], [.75, -1.5, '#5a4a36'], [-1.05, -2.95, '#6a4a30']]) box(.62, .1, .5, x, .05, z, K.std(c, { roughness: 1 }), RM, .04);
    box(1.2, .9, .35, -1.6, 1.25, -5.1, M.beam, RM, .02);
    for (let i = 0; i < 3; i++) { const j = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 10), surfM('#7a5a40', 'jr')); j.scale.set(1, 1.3, 1); j.position.set(-2 + i * .38, 1.0, -5.0); j.castShadow = j.receiveShadow = true; RM.add(j); }
    box(1.1, .6, .6, 2.2, .3, -4.7, M.wood, RM, .03); box(1.14, .06, .64, 2.2, .52, -4.7, M.beam, RM, .01);
    box(1.4, 1.9, .04, -2.9, 1.4, -3.6, K.std('#5a3a2a', { roughness: 1 }), RM, .01).rotation.y = Math.PI / 2;
  }
  { // round 3: a shelf on the side wall with jars and a folded cloth (seen out of focus behind the table in B3)
    box(.24, .04, 1.3, -2.83, 1.12, -1.95, M.wood, RM, .01); box(.04, .18, .04, -2.83, 1.03, -1.4, M.wood, RM, .005); box(.04, .18, .04, -2.83, 1.03, -2.5, M.wood, RM, .005);
    const jarG = new THREE.LatheGeometry([[0, 0], [.08, .02], [.11, .1], [.1, .2], [.05, .27], [.045, .3], [.06, .32]].map(([r, y]) => new THREE.Vector2(r, y)), 18);
    [[-2.82, -1.45, 1.0, '#7a5a40'], [-2.82, -1.75, .8, '#6a4a34'], [-2.82, -2.1, 1.15, '#80603f'], [-2.82, -2.38, .7, '#5e4430']].forEach(([x, z, sc, c]) => { const j = new THREE.Mesh(jarG, surfM(c, 'jarS' + z, {}, 6)); j.position.set(x, 1.14, z); j.scale.setScalar(sc); j.castShadow = j.receiveShadow = true; RM.add(j); });
    box(.06, .5, .5, -2.9, 1.75, -2.75, K.std('#5a3a2a', { roughness: 1 }), RM, .01); }
  // the lamp on the table: a clay oil lamp; the flame (HDR) and its in-scatter glow; a real light with shadows
  const LAMP = V(-.5, TY + .06, -1.58);   // beside the small man (his shadow falls to the side wall, not up the wall behind him)
  const lampG = new THREE.Group(); lampG.position.set(LAMP.x, TY, LAMP.z); RM.add(lampG);
  { const body = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 10), surfM('#7a5236', 'lamp')); body.scale.set(1, .42, .78); body.position.y = .025; body.castShadow = true; lampG.add(body);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(.016, .022, .07, 8), body.material); sp.rotation.z = -Math.PI / 2 + .3; sp.position.set(.07, .035, 0); lampG.add(sp); }
  const flame = new THREE.Mesh(new THREE.SphereGeometry(.014, 10, 8), K.glow('#ffd8a0', 14)); flame.scale.set(.75, 1.9, .75); flame.position.set(.1, .068, 0); lampG.add(flame);
  const lampL = new THREE.PointLight(col('#ffbf7a'), 2, 9, 1.6); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); lampL.shadow.bias = -.002; lampL.shadow.normalBias = .02; lampL.shadow.radius = 3; lampL.shadow.camera.near = .05; S.add(lampL);
  const lampF = film.lamp(V(LAMP.x + .1, TY + .07, LAMP.z), '#ffcf96', { power: 1, size: .16, fog: 1 });
  // a second lamp in the wall niche (lit as they come in — the room comes up), and the bounce of the lamplit room
  const niche = new THREE.PointLight(col('#ffb36a'), 0, 7, 1.7); niche.position.set(-1.6, 1.55, -4.75); S.add(niche);
  const nicheF = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), K.glow('#ffd8a0', 10)); nicheF.scale.set(.8, 1.8, .8); nicheF.position.set(-1.6, 1.5, -4.95); RM.add(nicheF);
  const nicheGl = film.lamp(V(-1.6, 1.5, -4.95), '#ffcf96', { power: 0, size: .3, fog: 1 });
  const bounce = new THREE.PointLight(col('#c98a52'), .5, 7, 1.4); bounce.position.set(0, 1.9, -2.6); S.add(bounce);
  const zKey = new THREE.SpotLight(col('#ffc890'), 0, 7, .55, .9, 1.2); zKey.position.set(.95, 2.1, -.5); zKey.target.position.set(-.06, 1.15, -1.36);   // round 2: from behind his shoulder (the door side) — he is lit from the side and back, his face stays in shadow S.add(zKey, zKey.target);
  // the light out through the door onto the street (the wall shadows it into the door's shape)
  const spill = new THREE.SpotLight(col('#ffbe78'), 0, 22, .62, .5, 1.3); spill.position.set(0, 1.65, -2.4); spill.target.position.set(0, 0, 4.5);
  spill.castShadow = true; spill.shadow.mapSize.set(1024, 1024); spill.shadow.bias = -.0008; spill.shadow.normalBias = .02; Object.assign(spill.shadow.camera, { near: .3, far: 22 }); S.add(spill, spill.target);
  // the moonlight (cool, from the upper left in front) and the sky's fill
  const moon = new THREE.DirectionalLight(col('#9ab8d0'), 1.2); moon.position.set(-9, 13, 11); moon.target.position.set(0, 0, 3);
  moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -12, right: 12, top: 12, bottom: -10, near: 1, far: 60 }); moon.shadow.bias = -.0006; moon.shadow.normalBias = .03; S.add(moon, moon.target);
  const hemi = new THREE.HemisphereLight(col('#5d7d96'), col('#202a30'), .9); S.add(hemi);
  // the night through the door, seen from inside (a cool fill that rims the small man from behind)
  const doorCool = new THREE.SpotLight(col('#7d9ab4'), 0, 8, .7, .6, 1.2); doorCool.position.set(0, 1.3, .9); doorCool.target.position.set(0, .8, -2.2); S.add(doorCool, doorCool.target);

  // ---------------------------------------------------------------- the purses, the coins, the tally board
  const leather = ['#6e4628', '#4e301c', '#7a3a22', '#5e3e24'].map((c, i) => surfM(c, 'lea' + i, { roughness: .7 }, 9));
  const purseG = new THREE.LatheGeometry([[0, 0], [.036, .002], [.06, .013], [.068, .03], [.064, .048], [.05, .064], [.03, .077], [.017, .086], [.019, .091], [.028, .098], [.031, .106], [.024, .11]].map(([r, y]) => new THREE.Vector2(r, y)), 28, 0, Math.PI * 2);
  { const p = purseG.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), a = Math.atan2(p.getZ(i), p.getX(i));
      const gather = ss(.05, .085, y) * (1 - ss(.1, .119, y) * .5), frill = ss(.095, .119, y), sag = 1 + .07 * (1 - ss(0, .04, y)) - .03 * ss(.04, .07, y);
      const f = sag * (1 + .1 * gather * Math.sin(a * 9 + 1.3) + .2 * frill * Math.sin(a * 5 + y * 30) + .06 * Math.sin(a * 2 + 2) * Math.sin(y * 55) + .04 * Math.cos(a));   // lumps of coin inside, slumped to one side
      p.setX(i, p.getX(i) * f); p.setZ(i, p.getZ(i) * f * .9); p.setY(i, y - .006 * Math.cos(a) * (1 - ss(0, .06, y))); }
    purseG.computeVertexNormals(); }
  const cordM = K.std('#2a1a10', { roughness: 1 });
  const mkPurse = (sc, mi) => { const g = new THREE.Group(), m = new THREE.Mesh(purseG, leather[mi]); m.castShadow = m.receiveShadow = true; g.add(m);
    const c = new THREE.Mesh(new THREE.TorusGeometry(.018, .0045, 6, 16), cordM); c.rotation.x = Math.PI / 2; c.position.y = .088; g.add(c);
    for (const [ax, az, l] of [[.5, .3, .05], [-.2, .55, .04]]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(.0025, .002, l, 5), cordM); e.geometry.translate(0, -l / 2, 0); e.position.set(.018, .088, 0); e.rotation.set(az, 0, ax); e.castShadow = true; g.add(e); }   // the tie's two loose ends
    g.scale.setScalar(sc); RM.add(g); return g; };
  // [x, z, scale, leather, lying?] — the three pushed first (one lies on its side, mouth toward the guest), then the big one
  const PURSES = [[0, -1.95, .85, 0, 0], [.1, -1.99, .75, 1, 0], [-.07, -1.91, .8, 2, 1], [.02, -1.7, 1.05, 3, 1]].map(([x, z, sc, mi, lie]) => ({ x, z, sc, lie, g: mkPurse(sc, mi) }));   // round 2: just in front of the lamp (they stand against its light); the big one waits at the near edge, by his hand
  const board = new THREE.Group(); RM.add(board);
  { box(.2, .014, .13, 0, .007, 0, M.woodL, board, .004); box(.17, .004, .1, 0, .015, 0, K.std('#2a2014', { roughness: .6 }), board, 0);
    const lm = K.std('#c8b48a', { roughness: .8 }); for (let i = 0; i < 4; i++) box(.12 - i * .02, .002, .006, -.01, .018, -.032 + i * .022, lm, board, 0); }
  const BOARD0 = V(-.02, TY, -1.86);
  const coinG = new THREE.CylinderGeometry(.019, .019, .004, 18), coinM = K.std('#e8b860', { roughness: .18, metalness: .6, emissive: col('#ffcf80', .32) });   // pale gold discs: the chalky lights of the table
  const rc = rng(31);
  const COINS = [];
  for (let i = 0; i < 24; i++) { const grp = i < 13 ? 0 : 1, m = new THREE.Mesh(coinG, coinM); m.castShadow = true; m.receiveShadow = true; RM.add(m);
    COINS.push({ m, grp, u: (() => { const k = grp ? i - 13 : i, N = grp ? 11 : 13, q = (k + .5) / N; return Math.acos(1 - 2 * q) / Math.PI; })(), ur: rc(), ang: (rc() - .5) * 1.9, d: .05 + rc() * .12, spin: (rc() - .5) * 6, tilt: rc() < .2 ? .3 : 0 }); }
  // the hands (B3, round 2 — main session: "dark silhouettes rim-lit by the lamp"): seen from the side, low across the table, with the
  // flame beyond them. Painted 2D shapes on cut-outs that face the camera (simple 3D hands look crude close — owner); the shapes
  // are only a clip — inside, dark umber laid in with strokes along the form, and the lamp's rim painted in warm dry strokes on the
  // edges that face the flame (the knuckles, the back of the fingers, the fingertips, the top of the wrist), never a clean contour.
  const HW = .42, HH = .42, FTU = .65, FTV = .18;   // FT = the palm's front edge, low, where it presses the purse   // the plane in metres; where the fingertips are in it (u from the left, v from the bottom)
  const handTex = (seed, dark) => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = rng(seed);
    // round 2b: a pushing hand — palm upright against the purse, fingers up and a little apart (each tip shows), the thumb out toward us
    const cap = (x0, y0, x1, y1, w) => { const p = new Path2D(), a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * w, ny = Math.cos(a) * w; p.moveTo(x0 + nx, y0 + ny); p.lineTo(x1 + nx, y1 + ny); p.arc(x1, y1, w, a + Math.PI / 2, a - Math.PI / 2, true); p.lineTo(x0 - nx, y0 - ny); p.arc(x0, y0, w, a - Math.PI / 2, a + Math.PI / 2, true); p.closePath(); return p; };
    const arm = new Path2D(); arm.moveTo(-10, 110); arm.bezierCurveTo(70, 170, 150, 250, 214, 356); arm.lineTo(238, 470); arm.bezierCurveTo(160, 420, 70, 372, -10, 332); arm.closePath();
    const palm = new Path2D(); palm.moveTo(212, 360); palm.bezierCurveTo(226, 330, 240, 306, 258, 296); palm.lineTo(300, 300); palm.lineTo(326, 306); palm.bezierCurveTo(334, 340, 336, 400, 331, 446); palm.bezierCurveTo(328, 474, 318, 492, 300, 497); palm.bezierCurveTo(280, 495, 256, 485, 236, 470); palm.closePath();
    const FG = [[262, 306, 286, 214, 15], [278, 308, 306, 214, 15], [293, 312, 322, 228, 14], [306, 320, 335, 250, 12]], fingers = FG.map(f => cap(...f)), thumb = cap(264, 396, 214, 326, 15);
    const hand = new Path2D(); hand.addPath(palm); fingers.forEach(f => hand.addPath(f)); hand.addPath(thumb);
    const all = new Path2D(); all.addPath(arm); all.addPath(hand);
    const base = dark ? [26, 17, 12] : [36, 24, 16];
    g.save(); g.clip(all); g.fillStyle = `rgb(${base})`; g.fillRect(0, 0, 512, 512);
    // the body: strokes along the form (the arm's length, then round the hand), a little warmer in the middle (bounce off the wood)
    g.lineCap = 'round';
    for (let i = 0; i < 200; i++) { const x = r() * 420, y = 40 + r() * 430; if (!g.isPointInPath(all, x, y)) continue;
      const a = x < 215 ? .62 + (r() - .5) * .3 : y < 320 ? -1.25 + (r() - .5) * .4 : 1.45 + (r() - .5) * .6, l = 14 + r() * 30, w = 3 + r() * 6, k = (r() - .5) * 16 + (y > 380 ? 10 : 0);
      g.strokeStyle = `rgba(${base[0] + 10 + k | 0},${base[1] + 7 + k * .7 | 0},${base[2] + 5 + k * .5 | 0},${.18 + r() * .22})`; g.lineWidth = w * 1.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    g.setLineDash([]);
    // the folds where the fingers bend (darker), a sleeve cuff at the wrist
    g.strokeStyle = 'rgba(10,6,4,.6)'; g.lineWidth = 3.5; for (const [x0, y0, x1, y1] of FG) { g.beginPath(); g.moveTo(x0 + 9, y0 - 4); g.lineTo(x1 + 9, y1 + 12); g.stroke(); }   // the shadow between the fingers
    g.fillStyle = `rgba(${base[0] + 20},${base[1] + 14},${base[2] + 9},.9)`; g.beginPath(); g.moveTo(196, 346); g.lineTo(222, 360); g.lineTo(246, 472); g.lineTo(220, 462); g.closePath(); g.fill();
    g.restore();
    // the rim: warm light paint dragged along the edges that face the flame (top and right), broken, thicker on the knuckles
    const rimPts = []; { const P = [[0, 114], [90, 190], [170, 280], [214, 352], [250, 292], [280, 206], [300, 202], [318, 216], [334, 236], [344, 262], [336, 330], [336, 390], [331, 446], [312, 490]];
      for (let i = 0; i < P.length - 1; i++) for (let k = 0; k < 10; k++) { const f = k / 10; rimPts.push([P[i][0] + (P[i + 1][0] - P[i][0]) * f, P[i][1] + (P[i + 1][1] - P[i][1]) * f, i]); } }
    g.save(); g.clip(all); g.lineCap = 'round';
    g.strokeStyle = `rgba(214,140,80,${dark ? .5 : .8})`; g.lineWidth = dark ? 6 : 9; g.lineJoin = 'round'; g.beginPath(); rimPts.forEach(([x, y], j) => j ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();   // one continuous band of lamplight on the edge (half of it falls inside the clip)
    for (const [x, y, i] of rimPts) { if (r() < .6) continue; const knuck = i >= 5 && i <= 12 ? 1 : .5, w = (3 + r() * 6) * knuck * (dark ? .7 : 1), l = 8 + r() * 14, a = Math.atan2(1, 1.2) + (r() - .5) * .8;
      const hot = r() < .35 * knuck; g.strokeStyle = hot ? `rgba(255,214,150,${.75 * (dark ? .6 : 1)})` : `rgba(226,150,86,${(.55 + r() * .3) * (dark ? .6 : 1)})`; g.lineWidth = w;
      g.beginPath(); g.moveTo(x - 2, y - 2); g.lineTo(x - 2 - Math.cos(a) * l * .3, y + Math.sin(a) * l * .3 + 3); g.stroke(); }
    g.restore();
    // the outer edge broken by a few short dragged strokes of the dark paint (no vector line)
    g.save(); g.lineCap = 'round';
    for (let i = 0; i < 700; i++) { const x = r() * 430, y = 30 + r() * 450; if (!g.isPointInPath(all, x, y)) continue; const a = r() * 6.283, l = 5 + r() * 9, x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
      if (g.isPointInPath(all, x2, y2)) continue; g.strokeStyle = `rgba(${base},${.5 + r() * .4})`; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); }
    g.restore();
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; return tx; };
  const hands = [[73, 1], [71, 0]].map(([seed, dark]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(HW, HH), new THREE.MeshBasicMaterial({ map: handTex(seed, dark), alphaTest: .5, side: THREE.DoubleSide, color: col('#ffffff', 1), fog: false, depthTest: true, depthWrite: true, polygonOffset: true, polygonOffsetFactor: -4 }));   // they write depth, so the macro depth of field keeps them sharp (without it they blurred into ghosts)
    m.renderOrder = 20; m.castShadow = true; m.visible = false; RM.add(m); return m; });
  // the sleeves (B3): dark robe masses that only touch the frame edge, out of focus
  const sleeveM = K.std('#2a1e16', { roughness: 1 });
  const sleeveA = new THREE.Mesh(new THREE.CapsuleGeometry(.06, .5, 4, 12), sleeveM); sleeveA.rotation.set(-.9, 0, .25); sleeveA.visible = false; RM.add(sleeveA);
  const sleeveB = new THREE.Mesh(new THREE.CapsuleGeometry(.055, .45, 4, 12), sleeveM); sleeveB.rotation.set(.15, 0, -.35); sleeveB.visible = false; RM.add(sleeveB);
  // dust in the lamp's light: a few dozen motes, only near the flame, drifting (no emission: a fixed set)
  const MOTES = 46, mr = rng(5), moteP = new Float32Array(MOTES * 3), moteS = new Float32Array(MOTES);
  const MOTE0 = []; for (let i = 0; i < MOTES; i++) MOTE0.push([(mr() - .5) * .9, mr() * .9, (mr() - .5) * .9, mr() * 6.28, .5 + mr()]);
  const moteGeo = new THREE.BufferGeometry(); moteGeo.setAttribute('position', new THREE.BufferAttribute(moteP, 3)); moteGeo.setAttribute('aS', new THREE.BufferAttribute(moteS, 1));
  const moteM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uK: { value: 0 }, uPx: { value: H / 1920 } },
    vertexShader: 'attribute float aS; varying float vA; uniform float uPx; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); float d = -mv.z; gl_PointSize = clamp(9. / d, 2., 26.) * uPx * aS; vA = aS; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying float vA; uniform float uK; void main(){ vec2 q = gl_PointCoord - .5; float r = length(q); gl_FragColor = vec4(vec3(1., .8, .52) * smoothstep(.5, .1, r) * .35 * uK, 1.); }' });
  const motes = new THREE.Points(moteGeo, moteM); motes.frustumCulled = false; S.add(motes);

  // ---------------------------------------------------------------- people
  const robe = (c, k) => K.std(c, { roughness: .95, side: THREE.DoubleSide });
  const faceM = K.std('#24160e', { roughness: 1 }), zFace = K.std('#2e1c12', { roughness: 1 }), hairM = K.std('#1a120c', { roughness: 1 });
  const setHead = (g, m) => { const n = g.userData.neck.children; if (n[1]) n[1].material = m; if (n[3]) n[3].material = m; };   // recolour the head cloth only (cap + side cloth)
  const RUST = K.std('#8a3b24', { roughness: .95, side: THREE.DoubleSide }), GUESTH = K.std('#857664', { roughness: .95, side: THREE.DoubleSide });
  const mkMan = o => { const g = P.robeMan({ face: faceM, head: 'cloth', ...o }); if (!o.child && o.head !== 'veil') P.headwear(g, 'cloth', { dark: hairM }); g.traverse(m => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; } }); S.add(g); return g; };
  // Zacchaeus: small, a good brown robe, a tawny mantle, the rust head cloth; the guest: an undyed oatmeal cloak like the others
  const zac = mkMan({ h: 1.48, broad: 1.02, mat: robe('#5a4430'), cloth: robe('#7a5a3a'), face: zFace }); setHead(zac, RUST);
  { const n = zac.userData.neck.children, bd = n[n.length - 1]; bd.scale.multiplyScalar(.72); bd.position.y -= .012; bd.position.z -= .01; }   // a short beard
  const guestW = mkMan({ h: 1.75, mat: robe('#948870'), cloth: robe('#a2967c') }); setHead(guestW, GUESTH);
  const guestS = mkMan({ h: 1.75, kind: 'sit', mat: robe('#a89a80'), cloth: robe('#b8ab90') }); setHead(guestS, GUESTH); guestS.userData.neck.children[2].material = GUESTH;   // no contrasting cord: from behind the cloth reads as cloth, not a rimmed pot
  // the murmurers: two knots by the low walls (men in head cloths, one woman veiled), dark robes
  const MUR = [[-1.0, 7.65, '#525a5c', 'cloth', 1.72], [-.56, 7.32, '#5e5242', 'cloth', 1.68], [-.92, 6.95, '#4a4c52', 'veil', 1.6], [.62, 7.85, '#5a5246', 'cloth', 1.74], [1.04, 7.52, '#4e565a', 'cloth', 1.66]]
    .map(([x, z, c, head, h], i) => { const g = mkMan({ h, mat: robe(c), cloth: robe(c), head }); g.position.set(x, 0, z); g.userData.ph = i * .23 + .1; return g; });
  const murCentre = [V(-.82, 0, 7.3), V(.83, 0, 7.68)];
  MUR.forEach((g, i) => { const c = murCentre[i < 3 ? 0 : 1]; g.userData.base = face(c.x - g.position.x, c.z - g.position.z); g.rotation.y = g.userData.base; });

  // ---------------------------------------------------------------- the gouache pass (on the finished frame, display values)
  const FS = (frag, uniforms) => { const m = new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    const sc = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); q.frustumCulled = false; sc.add(q); return { m, sc, u: m.uniforms }; };
  const ocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const rtOpt = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
  const rtA = new THREE.WebGLRenderTarget(film.w, film.h, rtOpt), rtB = new THREE.WebGLRenderTarget(film.w, film.h, rtOpt);
  const pxk = film.w / 1080;   // brush sizes are designed at 1080 wide
  const pass1 = FS(`varying vec2 vUv; uniform sampler2D tIn; uniform vec2 px; uniform float bands, ramp, sc, ks;
    ${hashGLSL}
    float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
    vec3 rampC(float v, vec3 a, vec3 b, vec3 c, vec3 d, vec3 e, vec3 f){ v = clamp(v, 0., 1.) * 5.; return v < 1. ? mix(a, b, v) : v < 2. ? mix(b, c, v - 1.) : v < 3. ? mix(c, d, v - 2.) : v < 4. ? mix(d, e, v - 3.) : mix(e, f, v - 4.); }
    void main(){
      // Kuwahara (4 quadrants, radius 6): each pixel takes the mean of its calmest neighbourhood — flat loaded masses, edges kept
      const int R = 6; vec3 m[4]; vec3 s2[4]; for (int k = 0; k < 4; k++){ m[k] = vec3(0.); s2[k] = vec3(0.); }
      for (int y = 0; y <= R; y++) for (int x = 0; x <= R; x++){
        vec2 o = vec2(x, y) * px * ks;
        vec3 a = texture2D(tIn, vUv - o).rgb, b = texture2D(tIn, vUv + vec2(o.x, -o.y)).rgb, c = texture2D(tIn, vUv + o).rgb, d = texture2D(tIn, vUv + vec2(-o.x, o.y)).rgb;
        m[0] += a; s2[0] += a * a; m[1] += b; s2[1] += b * b; m[2] += c; s2[2] += c * c; m[3] += d; s2[3] += d * d; }
      float n = float((R + 1) * (R + 1)), best = 1e9; vec3 col = vec3(0.);
      for (int k = 0; k < 4; k++){ vec3 mu = m[k] / n, v = abs(s2[k] / n - mu * mu); float sv = v.r + v.g + v.b; if (sv < best){ best = sv; col = mu; } }
      vec2 p = gl_FragCoord.xy / sc; float l = max(lum(col), 1e-4);
      // value bands in a perceptual scale; the threshold is dragged by a fixed brush field, so a band edge is hard and breaks
      // along the stroke (never a smooth ramp, never a ruler line)
      float a = .62 + .3 * (vn(p * .0009 + 5.) - .5); vec2 d = vec2(cos(a), sin(a)), e = vec2(-d.y, d.x);
      float br = vn(p / 24.) * .6 + vn(p / 7. + 4.) * .4;
      float v = sqrt(l) * bands + (br - .5) * .16, i = floor(v), f = v - i, q = (i + smoothstep(.44, .56, f)) / bands, lq = q * q;
      vec3 c = col * (lq / l);
      // the two gouache ramps, chosen by the pixel's own warmth (the lamp decides the split): night teal-blue / lamp umber-orange
      float w = smoothstep(-.015, .09, col.r - col.b);
      vec3 cool = rampC(q * 1.02, vec3(.06, .09, .12), vec3(.11, .165, .22), vec3(.173, .255, .322), vec3(.29, .38, .44), vec3(.5, .59, .64), vec3(.86, .89, .88));
      vec3 warm = rampC(q * 1.02, vec3(.1, .06, .04), vec3(.227, .141, .094), vec3(.45, .26, .14), vec3(.79, .54, .32), vec3(.914, .647, .306), vec3(1., .93, .74));
      vec3 rp = mix(cool, warm, w);
      float chroma = length(col - vec3(lum(col)));
      c = mix(c, rp, ramp * (1. - smoothstep(.06, .2, chroma) * .55));   // a strongly coloured cloth (the rust head cloth) keeps its own hue
      gl_FragColor = vec4(c, 1.);
    }`, { tIn: { value: null }, px: { value: new THREE.Vector2(1 / film.w, 1 / film.h) }, bands: { value: 7.5 }, ramp: { value: .55 }, sc: { value: pxk }, ks: { value: pxk } });
  const pass2 = FS(`varying vec2 vUv; uniform sampler2D tB, tBloom; uniform vec2 px; uniform float sc, bk, chalk; uniform vec3 ground;
    ${hashGLSL}
    float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
    void main(){
      vec2 p = gl_FragCoord.xy / sc;
      // round 2 (main session: the all-over diagonal streaks read as rain): gouache is flat opaque masses with crisp-ish edges —
      // the dry brush lives only at the borders between masses, its angle changes from patch to patch, and the masses stay calm
      vec3 c0 = texture2D(tB, vUv).rgb;
      vec2 q3 = vec2(3., 0.) * px * sc, r3 = vec2(0., 3.) * px * sc;
      float eg = length(texture2D(tB, vUv + q3).rgb - texture2D(tB, vUv - q3).rgb) + length(texture2D(tB, vUv + r3).rgb - texture2D(tB, vUv - r3).rgb);
      float em = smoothstep(.04, .2, eg);                                    // 1 at a border between two masses, 0 inside a mass
      vec2 cell = floor(p / 90.); float a = 6.283 * hh(cell + 3.1) + 1.2 * (vn(p * .011) - .5);   // a different stroke angle per patch
      vec2 d = vec2(cos(a), sin(a)), e = vec2(-d.y, d.x);
      float s3 = vn(vec2(dot(p, d) / 22., dot(p, e) / .9) + 2.), s2 = vn(vec2(dot(p, d) / 14., dot(p, e) / 5.) + 7.);
      vec2 off = (d * (s3 - .5) * 10. + e * (s2 - .5) * 2.) * px * sc * em;    // the border dragged by the bristles — only at borders
      vec3 c = texture2D(tB, vUv + off).rgb;
      float tooth = vn(p * .42) * .45 + vn(p * 1.1 + 5.) * .3 + vn(p * .09 + 9.) * .25;
      float skip = em * smoothstep(.45, .28, tooth) * smoothstep(.4, .7, s3);   // a few dry skips at the borders
      c = mix(c, mix(c0, ground, .4), skip * .5);
      // chalky lights laid on top of the light masses (a pale opaque coat, a little uneven — never streaks)
      float l = lum(c), hi = smoothstep(.5, .85, l);
      c = mix(c, c * .8 + vec3(.98, .93, .82) * .22, hi * (.3 + .25 * s2) * chalk);
      // the matte body: a faint unevenness of the paint and the paper, nothing directional
      c *= 1. + (vn(p * .02 + 4.) - .5) * .05 + (tooth - .5) * .035;
      // the lens on top: the 3D render's bloom laid back over the paint (the lamp still blooms)
      vec3 bl = texture2D(tBloom, vUv).rgb; c += (vec3(1.) - exp(-bl * bk)) * vec3(1., .86, .66) * .5;
      gl_FragColor = vec4(clamp(c, 0., 1.), 1.);
    }`, { tB: { value: null }, tBloom: { value: null }, px: { value: new THREE.Vector2(1 / film.w, 1 / film.h) }, sc: { value: pxk }, bk: { value: .9 }, chalk: { value: 1 }, ground: { value: V(.16, .14, .12) } });
  const realSRT = R.setRenderTarget.bind(R);
  function renderAll() {
    R.setRenderTarget = (tg, ...a) => realSRT(tg === null ? rtA : tg, ...a);
    try { film.render(film.time); } finally { R.setRenderTarget = realSRT; }
    if (NOPASS) { film.copyLinear(rtA.texture, null); return; }
    pass1.u.tIn.value = rtA.texture; realSRT(rtB); R.render(pass1.sc, ocam);
    pass2.u.tB.value = rtB.texture; pass2.u.tBloom.value = film.finishPass.u.tBloom.value; realSRT(null); R.render(pass2.sc, ocam);
  }

  // ---------------------------------------------------------------- motion helpers
  const lookAt = (pos, tgt) => { cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(tgt); };
  const rampI = u => u * u * u - u * u * u * u / 2;   // ∫₀ᵘ smoothstep
  // a gait time that eases in from standing (speed 0 → 1 over D seconds): the body moves exactly with walk().dist, so the feet stay planted
  const easeIn = (t, t0, D) => t <= t0 ? t0 : t0 + (t - t0 < D ? D * rampI((t - t0) / D) : D / 2 + (t - t0 - D));
  const arc = pts => { const c = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); c.arcLengthDivisions = 400; return { c, L: c.getLength() }; };
  // heading = the chord over ±0.25 m of path (about a stride): the body turns smoothly through a bend instead of snapping to the tangent
  const along = (A, s) => { const u = clamp(s / A.L), p = A.c.getPointAt(u), d = .25 / A.L, q = A.c.getPointAt(Math.min(1, u + d)), r = A.c.getPointAt(Math.max(0, u - d)); return { p, ry: face(q.x - r.x, q.z - r.z), u }; };
  // the guest walks up the middle of the street, through the door, and bends left inside (out of sight behind the jamb)
  const GV = { T: 1.3, L: .48 }, gSpeed = GV.L / (GV.T / 2);
  const gA = arc([V(.12, 0, 9), V(.12, 0, 4.5), V(.11, 0, 1.2), V(.07, 0, -.25), V(-.3, 0, -.95), V(-1.0, 0, -1.33), V(-1.8, 0, -1.42)]);
  let gS0 = 0; { let best = 1e9; for (let i = 0; i <= 2000; i++) { const s = i / 2000 * gA.L, z = gA.c.getPointAt(i / 2000).z; if (Math.abs(z - .1) < best) { best = Math.abs(z - .1); gS0 = s; } } }   // arc length at the threshold
  function guestWalk(t) {
    const g = guestW, t0 = T.b1 - 3, w = P.walk(g, t, t0, GV), s = gS0 - gSpeed * (T.door - t0) + w.dist, a = along(gA, s);
    g.position.copy(a.p); g.rotation.y = a.ry; g.visible = a.u < .97;
    P.pose(g, { ...w, breath: P.breath(t, .3), head: [-.04 + .03 * Math.sin(t * .7), .04 * Math.sin(t * .5)] });
  }
  // the small man at the door: faces the street and beckons, opens his right arm to the door, then follows him in on a curve
  // (a tight turn in three steps: the path starts in the direction he faces, so heading = path tangent from the first step)
  const zA = arc([V(.84, 0, .5), V(.7, 0, .86), V(.36, 0, .9), V(.12, 0, .48), V(.03, 0, -.2), V(-.3, 0, -.95), V(-1.2, 0, -1.4)]);
  const ZV = { T: 1.0, L: .36 }, ZD = .9;   // a small man's shorter, quicker step; 0.9 s to get going
  function zacStreet(t) {
    const g = zac, s = g.userData.s, st = along(zA, 0);
    const X = [T.welcome[0], T.welcome[0] + .9], beckW = ss(T.beck[0], T.beck[0] + .6, t) * (1 - ss(X[0], X[1], t)), welW = ss(X[0], X[1], t) * (1 - ss(T.welcome[1] - .6, T.welcome[1], t));
    // beckoning: the right hand, palm up, drawn in toward the chest, ~1.15 s a cycle (eased by its own weight — no snap)
    const bk = .5 - .5 * Math.cos((t - T.beck[0]) * 5.46);
    const hB = V(.2 * s, lerp(1.08, 1.18, bk) * s, -lerp(.42, .25, bk) * s), hW = V(.52 * s, 1.0 * s, -.14 * s);
    const hw = clamp(beckW + welW), hand = hB.clone().multiplyScalar(beckW).add(hW.clone().multiplyScalar(welW)).divideScalar(Math.max(1e-4, beckW + welW));
    const idl = P.idle(t, .62, { s });
    let pose, pos = st.p, ry = st.ry;
    if (t < T.zWalk) pose = { ...idl, lean: -.03 - .05 * beckW, head: [.08 + .04 * beckW, -.1 * welW] };
    else { const tau = easeIn(t, T.zWalk, ZD), w = P.walk(g, tau, T.zWalk, ZV), a = along(zA, w.dist), kf = ss(T.zWalk, T.zWalk + .55, t);
      // the first step: the feet go from his standing stance to the gait's (eased, while the gait itself is still slow)
      const feet = w.feet.map((f, i) => ({ ...f, u: lerp(idl.feet[i].u, f.u, kf), lift: f.lift * kf }));
      pos = a.p; ry = a.ry; pose = { ...w, feet, bob: lerp(idl.bob, w.bob, kf), head: [.04, 0], breath: .5 }; g.visible = a.u < .97; }
    if (t < T.zWalk) g.visible = true;
    pose.hands = [null, hand]; pose.handsW = [0, sine(hw)];
    g.position.copy(pos); g.rotation.y = ry; P.pose(g, pose);
  }
  // the murmurers: heads bent together, leaning in and out on their own phases; one whispers behind his hand; one looks to the door
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  function murmur(t) {
    MUR.forEach((g, i) => { const s = g.userData.s, ph = g.userData.ph, id = P.idle(t, ph, { s });
      const w = .5 + .5 * Math.sin(t * (.55 + .07 * i) + ph * 9), lean = -.14 - .12 * w;
      let head = [-.22 - .14 * w, .1 * Math.sin(t * .4 + ph * 5)], hands = [null, null], hw = [0, 0], twist = id.twist;
      if (i === 1) {   // whispering behind his hand: the hand beside his mouth, wherever the lean has put the head
        const cl = Math.cos(lean), sl = Math.sin(lean), hy = .7 * s * cl + .03 * s * sl, hz = .7 * s * sl - .03 * s * cl;
        hands[1] = V(.07 * s, .9 * s + hy - .07 * s, hz - .12 * s); hw[1] = .75 + .25 * w; }
      if (i === 3) { const k = ss(T.turnLook[0], T.turnLook[0] + 1.4, t) * (1 - ss(T.turnLook[1] + 1.2, T.turnLook[1] + 3, t)), rel = wrap(face(-g.position.x, -g.position.z) - g.rotation.y);
        head = [lerp(head[0], -.02, k), lerp(head[1], clamp(rel * .72, -1, 1), k)]; twist = lerp(twist, rel * .25, k); }
      g.rotation.y = g.userData.base + .08 * Math.sin(t * .3 + ph * 4);
      P.pose(g, { ...id, lean, twist, head, hands, handsW: hw }); });
  }
  // B2–B4: the small man kneels at the table, rises, stands; the guest sits across from him
  const ZT = V(-.06, 0, -1.36), GT = V(-.3, 0, -2.98);
  function zacRoom(t, shot) {
    const g = zac, s = g.userData.s; g.visible = shot !== 'b3'; g.position.copy(ZT); g.rotation.y = face(GT.x - ZT.x, GT.z - ZT.z);
    const k = ss(T.rise[0], T.rise[1], t), kr = P.kneelRise(k, s, .2), id = P.idle(t, .62, { s }), up = ss(T.rise[1] - .4, T.rise[1] + .8, t);
    // kneeling: hands on the thighs; rising: they push off the knees and let go; standing (B4): a little open toward the guest
    const kneeY = .35 * s + (kr.bob + .44 * s) * .35, knee = [V(-.13 * s, kneeY, -.28 * s), V(.13 * s, kneeY, -.28 * s)];
    const open = ss(T.b4 - .2, T.b4 + 2.5, t), hO = [V(-.24 * s, .86 * s, -.3 * s), V(.24 * s, .86 * s, -.3 * s)];
    const hands = [knee[0].clone().lerp(hO[0], open), knee[1].clone().lerp(hO[1], open)], hw = Math.max(1 - up, open * .9);
    P.pose(g, { ...kr, bob: kr.bob + id.bob * up, side: id.side * up, breath: P.breath(t, .62), lean: kr.lean - .04 * open,
      head: [lerp(-.12, .04, k) - .05 * open + .1 * ss(T.look[0], T.look[1], t), id.head[1] * up], hands, handsW: [hw, hw] });
  }
  function guestRoom(t, shot) {
    const g = guestS; g.visible = shot !== 'b3'; g.position.copy(GT); g.rotation.y = face(ZT.x - GT.x, ZT.z - GT.z);
    const s = g.userData.s, lk = sine((t - T.look[0]) / (T.look[1] - T.look[0]));
    const hands = [V(-.1 * s, .3 * s, -.3 * s), V(.1 * s, .3 * s, -.32 * s)];
    P.pose(g, { breath: P.breath(t, .3), lean: lerp(-.3, .06, lk), head: [lerp(-.62, .28, lk) + .02 * Math.sin(t * .6), .04 * Math.sin(t * .31) + .1 * lk], hands, handsW: [1, 1] });   // he looks down at what is laid before him, then raises his head to the man
  }
  // the purses, the board, the coins and the hands in time
  const A1 = .09, A2 = .12;   // how far (m, along −z) the first push moves the three purses, the second the board and the big purse
  const pushK = t => A1 * sine((t - T.push1[0]) / (T.push1[1] - T.push1[0])), push2K = t => A2 * sine((t - T.push2[0] - 1.5) / (T.push2[1] - T.push2[0] - 1.5));
  const MOUTH = [0, 0, -.8, -.25];   // round 2b: the lying purses open toward the camera side, so the coins run out onto the lit wood in front of the pile   // the y-turn of a lying purse: its mouth points (−sin, −cos) in x, z
  function purseAt(i, t) {
    const p = PURSES[i], k1 = pushK(t), k2 = push2K(t), lag = i === 1 ? .92 : 1;
    const dz = i < 3 ? k1 * lag + .02 * k2 : k2;
    const tip = i === 2 ? ss(T.push1[0] + .5, T.push1[0] + 1.8, t) : i === 3 ? ss(T.push2[0] + 2.2, T.push2[0] + 3.2, t) : 0;
    const lie = i === 3 ? tip : p.lie ? 1 : 0;
    if (i === 3) { const c = handsAt(t).carry; return { x: c.x, z: c.z, y: Math.max(TY, c.y), lie, tip }; }   // the big purse rides in front of his palms
    return { x: p.x, z: p.z - dz, lie, tip };
  }
  function table(t) {
    PURSES.forEach((p, i) => { const a = purseAt(i, t), sc = p.sc;
      p.g.position.set(a.x, (a.y ?? TY) + a.lie * .049 * sc, a.z); p.g.visible = i < 3 || t > T.back1[1] - .2;
      // lying purses lie on their side, the mouth forward-left (toward the guest and the lamp); the pushed one rolls a little as it goes
      p.g.rotation.set(-Math.PI / 2 * a.lie * (i === 2 ? .88 + .12 * a.tip : 1), p.lie ? MOUTH[i] : (i - 1.5) * .45, 0, 'YXZ'); });
    board.visible = false;   // (round 2: the flat tally board does not read from a low side view — the second gesture is the big purse)
    // coins: each slides out of its purse's mouth at its own time (spread smoothly over the spill), decelerating to rest
    for (const c of COINS) { const si = c.grp ? 3 : 2, win = c.grp ? T.spill2 : T.spill1, ts = lerp(win[0], win[1], c.u), tau = t - ts;
      if (tau <= 0) { c.m.visible = false; continue; }
      const a = purseAt(si, ts), sc = PURSES[si].sc, my = MOUTH[si], mx = a.x - Math.sin(my) * .13 * sc + .012 * Math.sin(c.ur * 40), mz = a.z - Math.cos(my) * .13 * sc;
      const s = c.d * (1 - Math.exp(-tau / .8)), ca = my + c.ang * .85, dx = -Math.sin(ca), dz = -Math.cos(ca);
      c.m.visible = true; c.m.position.set(mx + dx * s, TY + .0021 + c.tilt * .005, mz + dz * s);
      c.m.rotation.set(c.tilt, c.spin * (1 - Math.exp(-tau / .8)), 0); }
  }
  // the hands' place (B3): the fingertips' point for each hand [left, right] — in from the bottom of the frame (his side), behind the
  // three purses and pushing them; back to the board (left hand) and the big purse (right hand); pushing them after the rest
  // round 2b: the second gesture — the hands go up and away, come back down carrying the big purse, set it beside the others and push
  const AIR = [V(-.09, TY + .32, -1.44), V(.05, TY + .32, -1.44)], SET = [V(-.09, TY + .05, -1.705), V(.05, TY + .05, -1.705)];
  function handsAt(t) {
    const k1 = pushK(t), inK = sine((t - T.in1[0]) / (T.in1[1] - T.in1[0])), back = sine((t - T.back1[0]) / (T.back1[1] - T.back1[0]));
    const down = sine((t - T.push2[0]) / 1.5), slide = push2K(t);
    const P1 = [V(-.09, TY + .04, -1.893 - k1), V(.03, TY + .045, -1.893 - k1)], IN = [V(-.09, TY + .2, -1.4), V(.05, TY + .2, -1.4)];
    const pts = [0, 1].map(i => IN[i].clone().lerp(P1[i], inK).lerp(AIR[i], back).lerp(SET[i], down).add(V(0, 0, -slide)));
    return { pts, show: t > T.in1[0] - .05, carry: pts[0].clone().add(pts[1]).multiplyScalar(.5).add(V(0, -.045, -.07)) };
  }
  // ---------------------------------------------------------------- the shots
  function setLights(t, shot) {
    const up = ss(T.lampUp[0], T.lampUp[1], t), gl = ss(T.glow[0], T.glow[1], t), fl = 1 + .035 * Math.sin(t * 2.1) + .02 * Math.sin(t * 3.3 + 1);   // the flame breathes slowly (no flicker)
    const inside = shot !== 'b1';
    lampL.position.set(LAMP.x + .1, TY + .1, LAMP.z);
    lampL.intensity = (shot === 'b3' ? .9 + .5 * gl : inside ? 1.6 + .7 * gl : lerp(.9, 2.2, up)) * fl; lampL.distance = inside ? 6 + 3 * gl : 9;
    lampF.power = (shot === 'b3' ? .2 + .08 * gl : inside ? .5 + .25 * gl : lerp(.45, 1.1, up)) * fl;
    niche.intensity = (shot === 'b2' ? 1.0 : shot === 'b4' ? .45 : inside ? 1.0 : 1.4 * up) * fl;   // the niche lamp behind the camera lights the guest's back (he reads as a man, not a dark mound)
    nicheGl.power = (inside ? .25 : .4 * up) * fl; nicheF.visible = inside || up > .02;
    bounce.intensity = shot === 'b3' ? .7 + .2 * gl : inside ? .55 + .2 * gl : lerp(.15, .6, up);
    spill.intensity = inside ? 0 : lerp(1.4, 7, up) * fl;
    moon.intensity = inside ? .5 : 1.9; hemi.intensity = inside ? .25 : .62; hemi.color.copy(col(inside ? '#7a6050' : '#5d7d96')); hemi.groundColor.copy(col(inside ? '#2a1c14' : '#202a30'));
    const gb = shot === 'b4' || shot === 'b2'; doorCool.intensity = inside ? (shot === 'b4' ? 5 : gb ? 3.2 : 2.2) : 0; doorCool.angle = gb ? .5 : .7; doorCool.target.position.set(gb ? -.3 : 0, gb ? 1.0 : .8, gb ? -2.98 : -2.2);   // in B4 the night through the door rims the guest (cool on warm)
    const b4 = shot === 'b4' ? 1 : 0; zKey.intensity = shot === 'b2' ? 1.2 : b4 * (1.6 + 2.6 * ss(T.look[0], T.end, t)); if (b4) lampL.intensity *= .75;
    const fu = film.fogU; fu.uFogDensity.value = inside ? .012 : .006; fu.uFogColor.value.copy(col(inside ? '#3a2a20' : '#2a4054', .55)); fu.uFogColorUp.value.copy(col(inside ? '#3a2a20' : '#2e465a', .55));
    film.atmos.density = fu.uFogDensity.value;
    skyM.uniforms.mk.value = 1;
    moteM.uniforms.uK.value = inside ? .6 + .6 * gl : 0;
    // the motes: drifting slowly round the flame, fading out at the edge of its pool
    for (let i = 0; i < MOTES; i++) { const [x, y, z, ph, sz] = MOTE0[i], a = t * .11 + ph, rr = Math.hypot(x, z);
      moteP[i * 3] = LAMP.x + .1 + x * Math.cos(t * .05) + .05 * Math.sin(a); moteP[i * 3 + 1] = TY + .05 + ((y + t * .025 * sz) % .9); moteP[i * 3 + 2] = LAMP.z + z + .05 * Math.cos(a * 1.3);
      moteS[i] = sz * (1 - ss(.3, .45, rr)); }
    moteGeo.attributes.position.needsUpdate = true; moteGeo.attributes.aS.needsUpdate = true;
  }
  const CAM = {
    b1: t => { const u = prog((t - T.b1) / (T.b2 + .6 - T.b1));
      return { p: V(lerp(.32, .06, u), lerp(1.52, 1.6, u), lerp(13.6, 8.2, u)), l: V(lerp(.08, .02, u), lerp(1.36, 1.3, u), 0), fov: lerp(45, 43, u), focus: lerp(13, 8.4, u), ap: 1.4 }; },
    b2: t => { const u = prog((t - (T.b2 - .4)) / (T.b3 - T.b2 + .4));   // pedestal up with him as he rises (behind the guest, his back at the left)
      return { p: V(lerp(-1.1, -1.06, u), lerp(1.0, 1.2, u), lerp(-4.82, -4.7, u)), l: V(-.1, lerp(.78, 1.02, u), -1.36), fov: 44, focus: 3.4, ap: 2.4 }; },
    b3: t => { const u = prog((t - T.b3) / (T.b4 - T.b3));                   // his own view over the table: push in, down toward the purses
      return { p: V(lerp(1.42, 1.28, u), .74, lerp(-1.86, -1.9, u)), l: V(lerp(-.1, -.12, u), .5, lerp(-1.86, -1.92, u)), fov: 44, focus: lerp(1.5, 1.36, u), ap: 6 }; },   // round 2: low across the table at the lamp's height, a long lens (macro depth of field)
    b4: t => { const u = prog((t - T.b4) / (T.end - T.b4));                  // over the guest's shoulder (low left): push in toward the standing man
      return { p: V(lerp(-.98, -.9, u), lerp(.98, 1.0, u), lerp(-4.78, -4.5, u)), l: V(-.1, lerp(.98, 1.03, u), -1.36), fov: 46, focus: lerp(2.75, 2.48, u), ap: 2.6 }; },
  };
  function setState(t, shot) {
    if (!T) throw new Error('beats first');
    const inside = shot !== 'b1';
    film.time = t;
    // people
    MUR.forEach(g => g.visible = true); murmur(t);
    if (inside) { guestW.visible = false; guestS.visible = true; zacRoom(t, shot); guestRoom(t, shot); }
    else { guestS.visible = false; guestW.visible = true; guestWalk(t); zacStreet(t); }
    table(t);
    const hp = handsAt(t);
    if (shot === 'b3') { const c0 = CAM.b3(t); lookAt(c0.p, c0.l); cam.updateMatrixWorld(); }
    hands.forEach(m => { m.visible = false; });   // round 3 (main session): the painted hands read as a glowing rake — removed
    { const b3 = shot === 'b3'; const k1 = pushK(t) / A1, back = ss(T.back1[0], T.back1[0] + 1.2, t), inK = sine((t - T.in1[0]) / (T.in1[1] - T.in1[0]));
      // the sleeve at the left edge: in with the first push, out again before the second
      sleeveA.visible = false && b3 && inK > 0 && back < 1;   // (round 3: even near the lens the sleeve read as a blue pipe — the purses slide as if pushed from just out of frame) sleeveA.position.set(.86, TY + .1 + .1 * back, lerp(-1.6, -1.71, inK) - .05 * k1 + .15 * back);   // close to the lens: a soft dark mass at the left edge only
      sleeveB.visible = false; }   // (round 3: the big purse comes down on its own — a top-edge sleeve read as a pipe)
    setLights(t, shot);
    const c = CAM[shot](t); lookAt(c.p, c.l); cam.fov = c.fov; cam.near = inside ? .02 : .1; cam.updateProjectionMatrix();
    film.dofCfg.focus = c.focus; film.dofCfg.aperture = c.ap;
    film.dofCfg.maxCoc = shot === 'b3' ? 44 : 14; film.look.exposure = shot === 'b3' ? 1.5 : inside ? 1.35 : 1.5; pass1.u.ks.value = shot === 'b3' ? pxk * .5 : pxk;   // B3 macro: a finer Kuwahara keeps the coins' glints small and sharp film.bloomCfg.strength = shot === 'b3' ? .045 : .085; pass2.u.bk.value = shot === 'b3' ? .45 : .9;
    pass1.u.ramp.value = inside ? .5 : .58; pass2.u.ground.value.set(inside ? .2 : .1, inside ? .13 : .14, inside ? .09 : .17);
    return c;
  }
  function draw(ctx, t, B, shot = 'b1') {
    if (!T) T = beats(B);
    setState(t, shot); renderAll();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
  }
  // ---------------------------------------------------------------- checks (no GPU work): joint-angle changes per frame, camera speed per 0.25 s
  const people = { zac, guestW, guestS, m0: MUR[0], m1: MUR[1], m2: MUR[2], m3: MUR[3], m4: MUR[4] };
  const angles = g => { const U = g.userData, out = []; if (!g.visible) return null;
    U.arms.forEach(A => { if (!A.E) return; const u = A.E.clone().sub(A.S2).normalize(), f = A.T.clone().sub(A.E).normalize(); out.push(Math.acos(clamp(u.dot(f), -1, 1)), Math.atan2(u.x, -u.y), Math.atan2(u.z, -u.y)); });
    (U.legs || []).forEach(L => { const a = V(0, 1, 0).applyQuaternion(L.thigh.quaternion), b = V(0, 1, 0).applyQuaternion(L.shin.quaternion); out.push(Math.acos(clamp(a.dot(b), -1, 1)), Math.atan2(a.z, a.y)); });
    out.push(U.neck.rotation.x, U.neck.rotation.y, U.upper.rotation.x, U.upper.rotation.y, g.rotation.y); return out; };
  function measure(B, t0, t1, shotAt) {
    if (!T) T = beats(B);
    const fps = 30, prev = {}, maxd = {}, cams = []; let lastShot = null;
    for (let f = 0; t0 + f / fps < t1; f++) { const t = t0 + f / fps, shot = shotAt(t); setState(t, shot);
      for (const [k, g] of Object.entries(people)) { const a = angles(g); if (!a) { prev[k] = null; continue; }
        if (prev[k] && shot === lastShot) { let m = 0, j = -1; a.forEach((v, i) => { let d = Math.abs(v - prev[k][i]); if (d > Math.PI) d = 2 * Math.PI - d; if (d > m) { m = d; j = i; } }); if (!maxd[k] || m > maxd[k][0]) maxd[k] = [m, t, j]; }
        prev[k] = a; }
      lastShot = shot; }
    // camera per 0.25 s: speed (m/s) and turn rate (deg/s) by central differences inside the shot; coins leaving per 0.25 s; motes lit
    for (let t = t0 + .125; t < t1; t += .25) { const shot = shotAt(t), a = CAM[shot](t - .05), b = CAM[shot](t + .05);
      const sp = a.p.distanceTo(b.p) / .1, da = a.l.clone().sub(a.p).normalize(), db = b.l.clone().sub(b.p).normalize(), tr = Math.acos(clamp(da.dot(db), -1, 1)) * 57.3 / .1;
      const coins = COINS.filter(c => { const win = c.grp ? T.spill2 : T.spill1, ts = lerp(win[0], win[1], c.u); return ts >= t - .125 && ts < t + .125; }).length;
      cams.push({ t: +t.toFixed(3), shot, speed: +sp.toFixed(4), turn: +tr.toFixed(3), coinsPerS: coins * 4, motes: shot === 'b1' ? 0 : MOTES }); }
    return { joints: Object.fromEntries(Object.entries(maxd).map(([k, [m, t, j]]) => [k, { deg: +(m * 57.3).toFixed(2), t: +t.toFixed(3), j }])), cam: cams };
  }

  S.updateMatrixWorld(true);
  return { film, draw, measure, beats: () => T, people, setState };
}
