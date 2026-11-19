// crowd-evening3d.js — 「kingdom」 3부 「사람들이 기다린 나라」 opening (film 237.6–288.3): the people who waited for a king who would
// drive Rome out; the five thousand fed; the man who would not be that king and went up the mountain alone.
// Same world and engine as the liked village of part 2 (heal-village.js: motion/films/lib3d cine.js + kit.js, height fog with the
// sun's in-scatter, bloom, depth of field, AgX, grain; robed people from people3d.js). Skills read first (rules.json skills-first):
//   motion-skills/cinematic-3d (the engine itself — lib/cine.js, kit.js are the vendored copies in motion/films/lib3d),
//   cinecode/references/camera-moves.md (the named moves below), canvas-film/references/BODY-CHECK.md (held baskets/spears/staff),
//   canvas-film/kits/doreline (the engraving at the end — mountain-dore.js), oil-paint-world/landmark-map-3d (looked at; their
//   painted dabs / toy-map materials are not this world's look, so nothing copied from them).
// Film refs: 「벤허」(65 mm epic: hard low sun, dust) + 「아라비아의 로렌스」(telephoto column in heat shimmer, warm–cool) for S1–S2;
//            「노인을 위한 나라는 없다」(the sun pressed on the horizon, long shadows toward the camera, faded ochre/grey-green) for S3.
// Three shots, two hard cuts between clearly different framings (no near-identical jumps), each shot one continuous camera:
//   S1 C2–N11  telephoto tracking on the Roman spear column in heat shimmer under a huge low sun (8°) → a slow zoom out with a
//              pedestal up (8° → 42°, inertia) that reveals the crowd on the hill above the road, from behind, long shadows toward
//              us → N11: the crowd looks down at the soldiers — heads turn after the column, a ripple of pointing, one man lifts
//              his staff, a mother draws her child in. Light handheld none (a crane).
//   S2 N12–Q4b FPV low over the five thousand sitting in groups on the grass (baskets passing hand to hand, both hands on the rim)
//              toward the one man standing in the middle with the low sun over the lake behind him → N12c: they rise, a ripple out
//              from him, look at each other, stir (handheld 0.5, a 15° orbit) → L4/Q4: they press in toward him, arms up.
//   S3 Q4b–end tracking at walking pace behind him climbing the last of the hill against the sun pressed on the horizon (his
//              long shadow down the slope toward us) → he stands at the top → N13: dolly out 5.5 s, night comes down, stars, the
//              crowd's fires below in the field; the page engraves it (mountain-dore.js).
// The King is never shown by face: from behind, small, against the sun. Men in hoods/headcloths, no long hair. No words.
// API: const CE = await (await import('./crowd-evening3d.js')).build(W, H, B); CE.draw(ctx, t) — t = FILM seconds; B = line times
// (C2 N10 N11 N12 N12c L4 Q4 Q4b N13 END) from script.json via the page. Every visual time comes from beats(B). Pure in t.
import { Film, THREE, V, col, rng, noise1 } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const inertia = x => { x = clamp(x); return .35 * x + .65 * x * x * (3 - 2 * x); };
const lv = (a, b, k) => a.clone().lerp(b, k);
const D2R = Math.PI / 180;

// ---------------------------------------------------------------- the one table: shots and events from the line times
export function beats(B) {
  const T = { c2: B.C2, n10: B.N10, n11: B.N11, n12: B.N12, n12c: B.N12c, l4: B.L4, q4: B.Q4, q4b: B.Q4b, n13: B.N13, end: B.END };
  T.shots = [[T.c2, T.n12], [T.n12, T.q4b], [T.q4b, T.end + .5]];
  T.zoom = [T.n10 + .1, T.n11 + 2.4];              // S1 telephoto → wide (with the pedestal up)
  T.crane = [T.n11 + 1.0, T.n12];                   // S1 the slow rise over the crowd under N11
  T.turn0 = T.n10 + 3.2;                            // S1 heads begin to follow the column (each on his own delay)
  T.point0 = T.n11 + .9;                            // S1 the ripple of pointing
  T.staff = [T.n11 + 3.4, T.n11 + 4.6];             // S1 one man lifts his staff
  T.pass = [T.n12 + 1.7, T.n12 + 3.6, T.n12 + 5.4]; // S2 three baskets change hands (the hand-off moments)
  T.fpv1 = T.n12c + 1.2;                            // S2 the forward glide eases into the orbit
  T.rise = [T.n12c + .15, T.n12c + 3.4];            // S2 the ripple of rising, out from him
  T.surge = [T.l4 - .2, T.q4b - .4];                // S2 they press in toward him
  T.away = T.q4b - 1.7;                             // S2 he steps away from them
  T.top = T.n13 - .8;                               // S3 he reaches the top and stops
  T.dolly = [T.n13 - .4, T.n13 + 5.6];              // S3 the dolly out (≈ 0.27/s in size, then a slow drift to the cut)
  T.night = [T.q4b + .5, T.n13 + 4.5];              // S3 the sun goes under, night comes down
  T.stars = [T.n13 - .5, T.n13 + 4.2];
  T.etch = [T.n13 + 1.2, T.n13 + 5.4];              // S3 the engraving is cut into the picture (mountain-dore.js)
  return T;
}

export async function build(W, H, Bt) {
  const T = beats(Bt);
  const vert = H > W, FOV = vert ? 46 : 32;
  const film = new Film({
    W, H, dur: 1e4, fov: FOV, near: .1, far: 3000,
    atmos: { density: .006, falloff: .03, base: 0, start: 2, color: col('#c98a5a', .62), colorUp: col('#b39a84', .55), max: 1400, scatter: 1, anisotropy: .8, phaseMix: .85 },
    bloom: { strength: .07, radius: 1.1, tint: col('#ffd9b0') },
    dof: { focus: 12, aperture: 2.4, maxCoc: 24 },
    look: { exposure: 1.05, contrast: 1.06, saturation: 1.0, lift: col('#0e0906'), shadowTint: col('#cfd2e2'), highTint: col('#fff0d8'), vignette: .32, grain: .03, ca: .3 },
  });
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera;
  const A = new THREE.Group(), Bg = new THREE.Group(); S.add(A, Bg);   // region A (the hill over the road), region B (the field, the lake, the mountain)
  // region A is built 6 km to the side of B (coordinates below already carry the offset); only one is shown at a time

  // ---------------------------------------------------------------- light
  const sky = K.sky(film, { top: col('#56688c', .5), mid: col('#cf9a6e', .9), horizon: col('#ffbf7e', 1.6), sunDir: V(0, .05, -1).normalize(), sunColor: col('#fff0cc', 22), sunGlow: col('#ffb070', 1.5), clouds: .25, cloudColor: col('#ffd2a0', 1.0), cloudShade: col('#a07a6a', .6) });
  const SKY = sky.u;
  const hemi = new THREE.HemisphereLight(col('#b8a894'), col('#6e5236'), .5); S.add(hemi);
  const sunL = new THREE.DirectionalLight(col('#ffc890'), 3.2); sunL.castShadow = true; sunL.shadow.mapSize.set(4096, 4096);
  Object.assign(sunL.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 600 }); sunL.shadow.bias = -.0005; sunL.shadow.normalBias = .05;
  S.add(sunL, sunL.target);
  const sunLamp = film.lamp(V(0, 30, -300), '#ffc890', { power: 2000, size: 60, fog: 1 });
  // the sun as seen (low) and as it lights (a little higher, for clean long shadows); set per shot
  let SUN = V(0, .05, -1).normalize();
  function setSun(dirSeen, elevLight, focus, power = 3.2) {
    SUN = dirSeen.clone().normalize(); SKY.sunDir.value.copy(SUN);
    const L = V(SUN.x, 0, SUN.z).normalize(); L.y = Math.tan(elevLight * D2R); L.normalize();
    sunL.target.position.copy(focus); sunL.position.copy(focus).addScaledVector(L, 250); sunL.intensity = power;
    sunLamp.pos.copy(cam.position).addScaledVector(SUN, 320); GU.uSunG.value.copy(SUN);
  }
  function shadowBox(hx, hy) { const c = sunL.shadow.camera; if (c.right !== hx || c.top !== hy) { Object.assign(c, { left: -hx, right: hx, top: hy, bottom: -hy }); c.updateProjectionMatrix(); } }

  // ---------------------------------------------------------------- materials
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;
  // the sun's rim on the backlit people: a fresnel edge on the side facing the sun (roof-table-3d.js rimify, from a direction)
  const RIMU = { uSunV: { value: V(0, 0, -1) }, uRimC: { value: col('#ff9a5a', 1.25) }, uRimK: { value: 1 } };
  const rimSun = (m, key, k = 1) => { m.onBeforeCompile = sh => { Object.assign(sh.uniforms, RIMU); sh.uniforms.uRimS = { value: k };
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunV, uRimC; uniform float uRimK, uRimS;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 3.2);
            totalEmissiveRadiance += uRimC * fr * smoothstep(-.2, .55, dot(normal, uSunV)) * uRimK * uRimS; }`); };
    m.customProgramCacheKey = () => 'ce-rim-' + key; return m; };
  // ground: world-space grass and dust, fixed to the world (no swimming), soft
  const GU = { uSunG: { value: V(0, .05, -1) }, uSheen: { value: .22 } };
  const groundM = (key, c1, c2, road) => { const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(...c1.split(',').map(Number)), roughness: 1 });
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, GU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform vec3 uSunG; uniform float uSheen;\n' + hashGLSL)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec3 vd = normalize(vWP - cameraPosition); float b = pow(max(dot(vd, uSunG), 0.), 5.); totalEmissiveRadiance += diffuseColor.rgb * vec3(1., .72, .45) * b * uSheen; }`)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec2 q = vWP.xz; float n = fb(q * .045), f = fb(q * .6), g = fb(q * 2.7 + 3.);
            vec3 c = mix(diffuseColor.rgb, vec3(${c2}), smoothstep(.35, .75, fb(q * .12 + 7.)));
            c *= mix(.78, 1.1, n) * mix(.9, 1.06, f) * mix(.94, 1.04, g);
            float steep = 1. - smoothstep(.7, .95, normalize(vWN).y); c = mix(c, vec3(.42, .36, .28), steep * .5);
            float st = smoothstep(.74, .8, fb(q * 1.9 + 5.)); c = mix(c, vec3(.36, .32, .27), st * .45);
            ${road ? `float rd = 1. - smoothstep(3.0, 4.6, abs(vWP.z - (${road}) + sin(vWP.x * .012) * 2.)); float rut = rd * exp(-pow((abs(vWP.z - (${road}) + sin(vWP.x * .012) * 2.) - .8) / .2, 2.)) * .35;
                      c = mix(c, vec3(.74, .62, .46) * mix(.9, 1.05, f), rd * .85); c *= 1. - rut;` : ''}
            diffuseColor.rgb = c; }`); };
    m.customProgramCacheKey = () => 'ce-ground-' + key; return m; };
  const terrain = (fn, cx, cz, size, seg, mat, parent) => { const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + cx, z = p.getZ(i) + cz; p.setY(i, fn(x, z)); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.position.set(cx, 0, cz); m.receiveShadow = true; parent.add(m); return m; };
  const farHills = (parent, z0, color, seed, n = 9, h0 = 30, w0 = 140) => { const hm = new THREE.MeshStandardMaterial({ color, roughness: 1 });
    for (let i = 0; i < n; i++) { const g = new THREE.SphereGeometry(1, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), r = rng(seed + i), pos = g.attributes.position;
      for (let k = 0; k < pos.count; k++) { const y = pos.getY(k); pos.setY(k, y * (1 + .22 * noise1(pos.getX(k) * 3 + i, i) + .1 * noise1(pos.getZ(k) * 7, i + 3))); } g.computeVertexNormals();
      const m = new THREE.Mesh(g, hm); m.scale.set(w0 + r() * w0, h0 + r() * h0, 80 + r() * 70); m.position.set((i - n / 2) * w0 * .9 + r() * 60, -3, z0 - r() * 220); parent.add(m); } };

  // ---------------------------------------------------------------- region A: a hill above a valley road
  const hA = (x, z) => { const ridge = 19 * Math.exp(-((z / 46) ** 2)) * (1 + .1 * Math.sin(x * .031 + 1)) + 1.2 * noise1(x * .05 + z * .02, 3);
    const back = 26 * ss(-430, -760, z); const roadFlat = Math.exp(-(((z + 240) / 18) ** 2));
    return ridge + back + (1 - roadFlat) * 1.1 * noise1(x * .021, 8) * ss(-80, -160, z) + .4 * noise1(x * .013 + 5, 2); };
  const ROADZ = -240;
  terrain(hA, -6000, -300, 1500, 300, groundM('a', '.4, .32, .21', '.5, .42, .27', ROADZ), A);   // (size/seg 5 m; crest smooth)
  terrain(hA, -6000, -12, 120, 120, groundM('a2', '.4, .32, .21', '.5, .42, .27', ROADZ), A).position.y = .02;   // 1 m cells where the people stand
  farHills(A, -900, '#9a7a62', 31, 10, 40, 160);
  // a few olive trees on the slope (bare kit tree + clumps), dark against the haze
  const leafM = K.std('#5c6448', { roughness: .9 }), trunkM = K.std('#3e3226', { roughness: .95 });
  const olive = (parent, x, z, y, h, seed) => { const tr = K.tree({ seed, height: h, trunk: .2, depth: 4, spread: .7, up: .2, twig: 0, mat: trunkM, layer: 0 }); tr.position.set(x, y, z); parent.add(tr);
    const r = rng(seed), n = 40, inst = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.55, 0), leafM, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * h * .38, yy = h * (.55 + r() * .35); m4.compose(V(x + Math.cos(a) * rr, y + yy, z + Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, 0)), V(1, .7, 1).multiplyScalar(.7 + r() * .8)); inst.setMatrixAt(i, m4); }
    inst.castShadow = true; parent.add(inst); };
  for (const [x, z, h] of [[-26, -14, 5.5], [21, -22, 6], [-40, -60, 5], [34, -90, 6.5], [-18, -130, 5], [55, -190, 6], [-70, -210, 5.5], [8, 30, 6]]) olive(A, -6000 + x, z, hA(-6000 + x, z), h, (x * 7 - z) | 0);
  for (let i = 0; i < 14; i++) { const r = rng(300 + i), x = (r() - .5) * 260, z = ROADZ - 12 - r() * 220; olive(A, -6000 + x, z, hA(-6000 + x, z), 5 + r() * 2, 500 + i); }   // the valley beyond the road
  // scrub and stone across the valley: dark low clumps so the haze has something to lie over (and the shimmer something to bend)
  { const r = rng(919), n = 1000, g = new THREE.IcosahedronGeometry(1, 1), pp = g.attributes.position; for (let k = 0; k < pp.count; k++) { const f = 1 + .3 * Math.sin(pp.getX(k) * 5 + pp.getZ(k) * 3); pp.setXYZ(k, pp.getX(k) * f, Math.max(-.2, pp.getY(k)) * f, pp.getZ(k) * f); } g.computeVertexNormals();
    const inst = new THREE.InstancedMesh(g, K.std('#5a5034', { roughness: 1 }), n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    for (let i = 0; i < n; i++) { let x, z; do { x = (r() - .5) * 520; z = -110 - r() * 540; } while (Math.abs(z - ROADZ) < 8);
      const lane = Math.round(x / 38) * 38 + (r() - .5) * 6, xx = r() < .55 ? lane : x;   // many along field edges, some loose
      const sz = .25 + r() * r() * .6; q.setFromEuler(new THREE.Euler(0, r() * 6, 0)); m4.compose(V(-6000 + xx, hA(-6000 + xx, z), z), q, V(sz * (1 + r() * .4), sz * (.75 + r() * .3), sz)); inst.setMatrixAt(i, m4); c.setHSL(.1 + r() * .05, .16 + r() * .1, .33 + r() * .1); inst.setColorAt(i, c); }
    inst.castShadow = true; inst.receiveShadow = true; A.add(inst); }

  // ---------------------------------------------------------------- region B: the field by the lake, the mountain
  const HILL = V(-150, 0, -40);
  const hillH = (x, z) => { const d = Math.hypot(x - HILL.x, (z - HILL.z) * 1.1); return 26 * Math.exp(-Math.pow(d / 32, 1.8)) + 5 * Math.exp(-Math.pow(Math.hypot(x - HILL.x + 45, z - HILL.z + 30) / 40, 2)); };   // a knoll at the edge of the plain
  const hB = (x, z) => { const field = .035 * Math.max(0, z + 150) + Math.min(0, z + 150) * .2;
    return field + hillH(x, z) + .5 * noise1(x * .04 + z * .013, 5) + .35 * noise1(z * .05 - x * .02, 9); };
  const SUMMIT = (() => { let best = V(); let hb = -1; for (let i = 0; i < 400; i++) { const x = HILL.x - 10 + (i % 20), z = HILL.z - 10 + ((i / 20) | 0); const y = hB(x, z); if (y > hb) { hb = y; best.set(x, y, z); } } return best; })();
  const grassM = groundM('b', '.33, .33, .19', '.45, .4, .23', null);
  terrain(hB, -200, -80, 1700, 340, grassM, Bg);
  terrain(hB, 0, 0, 120, 120, groundM('b2', '.33, .33, .19', '.45, .4, .23', null), Bg).position.y = .02;
  terrain(hB, SUMMIT.x + 14, SUMMIT.z + 4, 70, 70, groundM('b3', '.33, .33, .19', '.45, .4, .23', null), Bg).position.y = .02;
  // the lake beyond the field: dark water with the low sun's glitter (analytic, fixed in the world)
  const waterU = { uSunW: { value: V(0, .05, -1) }, uT: { value: 0 } };
  const waterM = new THREE.MeshStandardMaterial({ color: '#3e4a56', roughness: .35, metalness: 0 });
  waterM.onBeforeCompile = sh => { Object.assign(sh.uniforms, waterU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform vec3 uSunW; uniform float uT;\n' + hashGLSL)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { vec3 vd = normalize(vWP - cameraPosition); vec2 q = vWP.xz;
          vec3 n = normalize(vec3((fb(q * .35 + vec2(uT * .05, 0.)) - .5) * .5 + (fb(q * 1.7 - vec2(0., uT * .08)) - .5) * .25, 1., (fb(q * .3 + 4. + vec2(0., uT * .04)) - .5) * .5));
          vec3 r = reflect(vd, n); float s = max(dot(r, uSunW), 0.);
          float fres = .04 + .96 * pow(1. - max(dot(-vd, vec3(0., 1., 0.)), 0.), 5.);
          totalEmissiveRadiance += vec3(1., .68, .38) * (pow(s, 380.) * 14. + pow(s, 40.) * .5) + vec3(.95, .62, .42) * fres * .55; }`); };
  waterM.customProgramCacheKey = () => 'ce-water';
  { const w = new THREE.Mesh(new THREE.PlaneGeometry(4000, 1500), waterM); w.rotation.x = -Math.PI / 2; w.position.set(0, -.35, -900); Bg.add(w); }
  farHills(Bg, -1250, '#8a7266', 41, 12, 34, 170);
  { const gW = new THREE.Group(); gW.rotation.y = Math.PI / 2; farHills(gW, -1150, '#7a6660', 47, 10, 30, 170); Bg.add(gW); }   // the far side of the plain to the west (S3)
  // grass tufts round the paths (swaying gently in the evening wind; fixed to the world)
  const tuftU = { uT: { value: 0 } };
  { const blades = []; const r = rng(77);
    for (let i = 0; i < 6; i++) { const a = r() * 6.283, h = .14 + r() * .2, w = .02, g = new THREE.PlaneGeometry(w, h, 1, 3); g.translate(0, h / 2, 0);
      const p = g.attributes.position; for (let k = 0; k < p.count; k++) { const y = p.getY(k), u = y / h; p.setX(k, p.getX(k) * (1 - u * .85)); p.setZ(k, u * u * .09); }
      g.rotateY(a); g.translate(Math.cos(a) * .05, 0, Math.sin(a) * .05); blades.push(g); }
    const geo = K.mergeGeometries(blades.map(g => [g, new THREE.Matrix4()]));
    const tm = new THREE.MeshStandardMaterial({ color: '#c8b070', roughness: .9, side: THREE.DoubleSide, emissive: col('#6a4a20'), emissiveIntensity: .5 });
    tm.onBeforeCompile = sh => { Object.assign(sh.uniforms, tuftU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <begin_vertex>', `#include <begin_vertex>
        { vec2 ip = vec2(instanceMatrix[3].x, instanceMatrix[3].z); float w = sin(uT * 1.1 + ip.x * .15 + ip.y * .09) * .6 + sin(uT * 2.3 + ip.x * .4) * .25; transformed.x += w * .05 * position.y * 3.; }`); };
    tm.customProgramCacheKey = () => 'ce-tuft';
    const pts = []; const add = (cx, cz, rad, n) => { for (let i = 0; i < n; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * rad; pts.push([cx + Math.cos(a) * d, cz + Math.sin(a) * d]); } };
    add(0, 4, 32, 7000); add(SUMMIT.x + 10, SUMMIT.z + 2, 18, 1600);
    const inst = new THREE.InstancedMesh(geo, tm, pts.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    pts.forEach(([x, z], i) => { q.setFromAxisAngle(V(0, 1, 0), r() * 6.283); m4.compose(V(x, hB(x, z) + .01, z), q, V(1, .7 + r() * .7, 1)); inst.setMatrixAt(i, m4); c.setHSL(.13 + r() * .04, .35 + r() * .15, .42 + r() * .16); inst.setColorAt(i, c); });
    inst.receiveShadow = true; Bg.add(inst); }

  // ---------------------------------------------------------------- people: materials
  const robeCols = ['#5a4a38', '#4a3e30', '#6a5440', '#3e3428', '#584632', '#4e4234', '#62503c', '#46382a'];
  const mantleCols = ['#8a6a32', '#5e5a32', '#7a3424', '#a89a80', '#5a4030', '#4a4640', '#9a8458', '#6a4a2c', '#7c6a48', '#4a5060'];
  const robes = robeCols.map((c, i) => rimSun(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'r' + i));
  const mantles = mantleCols.map((c, i) => rimSun(K.std(c, { roughness: .95, side: THREE.DoubleSide }), 'm' + i));
  const faceM = K.std('#1c120a', { roughness: 1 });
  const kingM = rimSun(K.std('#b9a88a', { roughness: .95, side: THREE.DoubleSide }), 'kg', 1.15), kingC = rimSun(K.std('#8c7a5e', { roughness: .95, side: THREE.DoubleSide }), 'kc', 1.15);
  const mk = o => P.robeMan({ face: faceM, ...o, mat: o.mat || robes[0] });
  const face = (dx, dz) => Math.atan2(-dx, -dz);
  const person = (r, kindBias = 0) => { const u = r(), kind = u < .15 + kindBias ? 'child' : u < .42 ? 'woman' : 'man';
    const o = kind === 'child' ? { h: 1.02 + r() * .3, child: true, head: r() < .55 ? 'cloth' : 'veil', broad: .9 } : kind === 'woman' ? { h: 1.5 + r() * .13, head: 'veil', broad: .82 + r() * .1 } : { h: 1.62 + r() * .2, head: r() < .5 ? 'hood' : 'cloth', broad: .9 + r() * .22 };
    const p = mk({ ...o, mat: robes[(r() * robes.length) | 0], cloth: mantles[(r() * mantles.length) | 0] }); p.userData.kind = kind; p.userData.ph = r(); return p; };
  const life = (p, t, extra = {}) => { const U = p.userData; return P.pose(p, { ...P.idle(t, U.ph, { s: U.s }), ...extra }); };
  const yawTo = (p, wx, wz) => { const a = face(wx - p.position.x, wz - p.position.z) - p.rotation.y; return Math.atan2(Math.sin(a), Math.cos(a)); };

  // ---------------------------------------------------------------- S1: the soldiers on the road (region A)
  const red = rimSun(K.std('#7a2418', { roughness: .9, side: THREE.DoubleSide }), 'sold', .9), iron = rimSun(K.std('#5a5650', { roughness: .45, metalness: .6 }), 'iron', 1.3);
  const shieldM = rimSun(K.std('#6a2016', { roughness: .7, side: THREE.DoubleSide }), 'shield', 1.1), ash = K.std('#6a5034', { roughness: .8 }), skinA = K.std('#5e3c26', { roughness: .8 });
  const tipM = new THREE.MeshStandardMaterial({ color: '#d8c8a8', roughness: .2, metalness: .9, emissive: col('#ffd8a0'), emissiveIntensity: 2.2 });
  const soldiers = []; const COLV = 1.25, ROWS = 24, FILES = 4;
  { const r = rng(808); for (let row = 0; row < ROWS; row++) for (let f = 0; f < FILES; f++) {
      const s = P.soldier({ h: 1.7 + r() * .1, mat: red, skin: skinA, metal: iron, shieldM, wood: ash, tip: tipM });
      s.userData.row = row; s.userData.dz = (f - 1.5) * 1.05 + (r() - .5) * .12; s.userData.dx = (r() - .5) * .14; s.userData.ph = (r() - .5) * .06; A.add(s); soldiers.push(s); } }
  // the standard at the head of the column: a pole with a crossbar and a red cloth (no letters)
  const standard = new THREE.Group(); { const pole = new THREE.Mesh(new THREE.CylinderGeometry(.025, .03, 3.2, 6), ash); pole.position.y = 1.6; standard.add(pole);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .7, 5), ash); bar.rotation.z = Math.PI / 2; bar.position.y = 3.0; standard.add(bar);
    const cl = new THREE.Mesh(new THREE.PlaneGeometry(.62, .55, 4, 3), shieldM); cl.position.set(0, 2.68, .01); standard.add(cl);
    standard.traverse(o => { if (o.isMesh) o.castShadow = true; }); A.add(standard); }
  const bearer = P.soldier({ h: 1.76, mat: red, skin: skinA, metal: iron, shieldM, wood: ash, tip: tipM }); bearer.userData.ph = 0; A.add(bearer);
  bearer.userData.U = bearer.userData; bearer.userData.spear.visible = false;
  const colX = t => 34 - COLV * (t - T.c2);          // the head of the column (region-A local x), marching toward −x
  function soldiersAt(t) {
    const x0 = colX(t);
    for (const s of soldiers) { const U = s.userData, x = -6000 + x0 + 2.2 + U.row * 1.3 + U.dx;
      const w = P.walk(s, t + U.ph, T.c2 - 3, { T: 1.0, L: .62 });   // in step (they march), each a hair off
      s.position.set(x, hA(x, ROADZ + U.dz), ROADZ + U.dz); s.rotation.y = Math.PI / 2;   // facing −x
      P.soldierPose(s, { ...w, lean: -.04, head: [0, 0] }); }
    { const x = -6000 + x0, w = P.walk(bearer, t, T.c2 - 3, { T: 1.0, L: .62 }); bearer.position.set(x, hA(x, ROADZ), ROADZ); bearer.rotation.y = Math.PI / 2;
      // the standard in both hands, upright before him (hands ON the pole: it is placed at his grips)
      bearer.updateMatrix(); const gl = V(-.05, 1.22 + w.bob, -.34), gr = V(.05, .92 + w.bob, -.33);
      P.pose(bearer, { ...w, lean: -.03, hands: [gl, gr] });
      const gw = gr.clone().applyMatrix4(bearer.matrix); standard.position.set(gw.x, gw.y - .92 + .02, gw.z); standard.rotation.set(0, Math.PI / 2, 0); }
  }

  // ---------------------------------------------------------------- S1: the crowd on the crest (region A), from behind
  const crowdA = []; const AX = -6000;
  { const r = rng(4101), centres = [];
    for (let n = 0; n < 900 && centres.length < 30; n++) { const x = (r() - .5) * 30, z = -4 + (r() - .5) * 8; if (centres.some(([u, v]) => Math.hypot(u - x, v - z) < 1.9)) continue; centres.push([x, z]); }
    const spots = []; centres.forEach(([cx, cz], ci) => { const m = 2 + ((r() * 5) | 0);
      for (let j = 0; j < m * 8 && spots.filter(q => q.c === ci).length < m; j++) { const x = cx + (r() - .5) * 1.8, z = cz + (r() - .5) * 1.5; if (spots.some(q => Math.hypot(q.x - x, q.z - z) < .62)) continue; spots.push({ x, z, c: ci }); } });
    for (const q of spots) { const p = person(r); const x = AX + q.x; p.position.set(x, hA(x, q.z), q.z);
      const mates = spots.filter(w => w.c === q.c && w !== q), mate = mates.length && r() < .3 ? mates[(r() * mates.length) | 0] : null;
      p.rotation.y = mate ? face(mate.x - q.x, mate.z - q.z) * .5 + (r() - .5) * .5 : (r() - .5) * .7;   // most face the valley (−z)
      p.userData.dl = r() * 1.6; p.userData.mate = mate; p.userData.point = false; A.add(p); crowdA.push(p); }
    // the ripple of pointing: men near the middle of the frame, in order across it
    crowdA.filter(p => p.userData.kind === 'man' && Math.abs(p.position.x - AX) < 9).sort((a, b) => a.position.x - b.position.x).forEach((p, i) => { if (i % 3 === 1) { p.userData.point = true; p.userData.pdl = (i / 3) * .45; } });
  }
  // the man with the staff (front, a little right of centre), the mother and her child (left)
  const staffMan = (() => { const p = mk({ h: 1.8, head: 'cloth', broad: 1.1, mat: robes[3], cloth: mantles[2] }); const x = AX + 3.2, z = -6.2; p.position.set(x, hA(x, z), z); p.rotation.y = .1; p.userData.ph = .37; A.add(p); return p; })();
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(.022, .026, 1.75, 6), ash); staff.castShadow = true; A.add(staff);
  const mother = (() => { const p = mk({ h: 1.56, head: 'veil', broad: .86, mat: robes[1], cloth: mantles[3] }); const x = AX - 4.5, z = -5.2; p.position.set(x, hA(x, z), z); p.rotation.y = -.15; p.userData.ph = .61; A.add(p); return p; })();
  const childA = (() => { const p = mk({ h: 1.1, child: true, head: 'cloth', mat: robes[6], cloth: mantles[6] }); const x = AX - 3.85, z = -5.0; p.position.set(x, hA(x, z), z); p.rotation.y = -.1; p.userData.ph = .2; A.add(p); return p; })();
  function crowdAAt(t) {
    const cx = AX + colX(t) + 14, cz = ROADZ;   // where they look: the middle of the column
    for (const p of crowdA) { const U = p.userData, k = ss(T.turn0 + U.dl, T.turn0 + U.dl + 1.4, t);
      const yaw = clamp(yawTo(p, cx, cz), -1.0, 1.0) * k, ex = { head: [lerp(.02, -.12, k) + .03 * Math.sin(t * .4 + U.ph * 9), yaw * .7], twist: yaw * .25 };
      if (U.mate && t < T.turn0 + U.dl) ex.head = [0, clamp(yawTo(p, AX + U.mate.x, U.mate.z), -.8, .8) * .6];
      if (U.point) { const pk = ss(T.point0 + U.pdl, T.point0 + U.pdl + .9, t) * (1 - ss(T.point0 + U.pdl + 3.6, T.point0 + U.pdl + 4.6, t));
        if (pk > 0) { const d = V(cx - p.position.x, 0, cz - p.position.z).normalize().applyAxisAngle(V(0, 1, 0), -p.rotation.y);   // to the column, in his frame
          ex.hands = [null, lv(V(.22 * U.s, .82 * U.s, -.12 * U.s), V(.2 * U.s + d.x * .55, 1.32 * U.s, d.z * .6), pk)]; } }
      life(p, t, ex); }
    // the staff: held in his right hand; lifted (not shaken) under "로마를 몰아낼 왕"
    { const U = staffMan.userData, k = eio((t - T.staff[0]) / (T.staff[1] - T.staff[0])) * (1 - ss(T.staff[1] + 2.4, T.staff[1] + 3.6, t)), turn = ss(T.turn0, T.turn0 + 1.6, t);
      const g = lv(V(.26, .98, -.14), V(.24, 1.62, -.3), k);   // the grip, root frame
      P.pose(staffMan, { ...P.idle(t, U.ph, { s: U.s }), head: [lerp(0, -.1, turn), clamp(yawTo(staffMan, cx, cz), -.9, .9) * .6 * turn], lean: -.05 * k, hands: [null, g] });
      staffMan.updateMatrix(); const gw = g.clone().applyMatrix4(staffMan.matrix);
      staff.position.set(gw.x, gw.y - .98 + .875, gw.z); staff.rotation.set(0, 0, -.04); }   // the grip is 0.98 m up the staff: at rest its foot is on the ground
    // the mother takes her child's hand and draws him to her side (one point both hands share)
    { const k = ss(T.n11 + 2.0, T.n11 + 3.4, t); mother.updateMatrix(); childA.updateMatrix();
      const meet = lv(V(-4.12, .8, -5.08), V(-4.2, .78, -5.12), k).add(V(AX, hA(AX - 4.15, -5.1), 0));
      const inv = m => m.matrix.clone().invert();
      childA.position.x = AX + lerp(-3.85, -3.98, k);
      P.pose(mother, { ...P.idle(t, .61, { s: mother.userData.s }), head: [-.12 * k, .35 * k + clamp(yawTo(mother, cx, cz), -.6, .6) * .4 * (1 - k)], hands: [null, meet.clone().applyMatrix4(inv(mother))] });
      P.pose(childA, { ...P.idle(t, .2, { s: childA.userData.s }), head: [.15, -.3 * k], hands: [meet.clone().applyMatrix4(inv(childA)), null] }); }
  }

  // ---------------------------------------------------------------- S2: the five thousand in the field (region B)
  const C = V(0, hB(0, -10), -10);
  // S2 camera: polar round the man (θ = 0 → behind him, +z); FPV in (r falls), then a slow 15° orbit; handheld 0.5 from N12c
  const camS2 = t => { const kf = inertia((t - T.n12) / (T.fpv1 - T.n12)), ko = eio((t - T.fpv1) / (T.q4b - T.fpv1));
    const r = lerp(31, 14.5, 1 - Math.pow(1 - kf, 2.2)) - 1.2 * ko, th = (lerp(-9, -7, kf) + 15 * ko) * D2R, y = lerp(1.25, 1.75, kf) + .7 * ko;
    const x = C.x + Math.sin(th) * r, z = C.z + Math.cos(th) * r; return V(x, hB(x, z) + y, z); };
  const hand = (t, amt) => amt ? V(noise1(t * .55, 11) * .045 + noise1(t * 1.3, 4) * .012, noise1(t * .5, 7) * .03, noise1(t * .45, 2) * .03).multiplyScalar(amt / .5) : V();
  // who is seen: a wedge from behind the camera's path toward him (detailed robed people); everyone else instanced
  const camMid = C.clone().add(V(Math.sin(-8 * D2R) * 44, 0, Math.cos(-8 * D2R) * 44));
  const inWedge = (x, z) => { const a = Math.atan2(x - camMid.x, -(z - camMid.z)) - Math.atan2(C.x - camMid.x, -(C.z - camMid.z)); return Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 25 * D2R; };
  const pathD = (x, z) => { let m = 1e9; for (let i = 0; i <= 40; i++) { const p = camS2(lerp(T.n12, T.q4b, i / 40)); m = Math.min(m, Math.hypot(p.x - x, p.z - z)); } return m; };
  // the sight lane: nobody stands between the camera and him while the camera orbits (a fan from him to the camera's path)
  const laneD = (x, z) => { let m = 1e9; for (let i = 0; i <= 12; i++) { const c = camS2(lerp(T.n12c - 1, T.q4b, i / 12)), dx = c.x - C.x, dz = c.z - C.z, L = Math.hypot(dx, dz);
      const u = clamp(((x - C.x) * dx + (z - C.z) * dz) / (L * L)), px = C.x + dx * u - x, pz = C.z + dz * u - z; m = Math.min(m, Math.hypot(px, pz) - (.6 + .07 * u * L)); } return m; };
  // the three basket pairs, placed beside the camera's path a little ahead of where the camera is at each hand-off (computed first:
  // the crowd keeps clear of them)
  const passPos = [[22, 1.0], [19, -1.05], [16.6, 1.25]].map(([rp, lat], i) => {   // on the path at radius rp from him, lat to the side (all passed by the camera before it slows)
    const dXZ = (a, b) => Math.hypot(a.x - b.x, a.z - b.z); let tA = T.fpv1;
    for (let k = 0; k <= 400; k++) { const tt = lerp(T.n12, T.fpv1, k / 400); if (dXZ(camS2(tt), C) < rp) { tA = tt; break; } }
    const c0 = camS2(tA), fwd = camS2(tA + .3).sub(c0).setY(0).normalize(), side = V(-fwd.z, 0, fwd.x);
    const mid = c0.clone().addScaledVector(side, lat); mid.y = 0;
    let tp = T.n12 + .8; for (let k = 0; k <= 400; k++) { const tt = lerp(T.n12, T.fpv1, k / 400); if (dXZ(camS2(tt), mid) < 6.2) { tp = Math.max(T.n12 + .8, tt); break; } }   // the hand-off when the camera is ~6 m short
    const ax = side.clone().multiplyScalar(lat > 0 ? -1 : 1).applyAxisAngle(V(0, 1, 0), .35 * (i - 1));   // giver → receiver, across the frame
    return { tp, posA: mid.clone().addScaledVector(ax, -.55), posB: mid.clone().addScaledVector(ax, .55), mid }; });
  T.pass = passPos.map(q => q.tp);
  const crowdB = [], spotsI = [];
  { const r = rng(5150), centres = [];
    for (let n = 0; n < 6000 && centres.length < 700; n++) { const a = r() * 6.283, d = 3.2 + Math.pow(r(), .8) * 86, x = C.x + Math.cos(a) * d, z = C.z + Math.sin(a) * d * .9;
      if (z < -140 || hillH(x, z) > 2.5) continue; if (centres.some(([u, v, s]) => Math.hypot(u - x, v - z) < s + 1.6)) continue; centres.push([x, z, 1.0 + r() * 1.3]); }
    for (const [cx, cz, s] of centres) { const m = 4 + ((r() * 9) | 0), pts = [];
      for (let j = 0; j < m * 6 && pts.length < m; j++) { const a = r() * 6.283, d = Math.sqrt(r()) * s, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
        if (Math.hypot(x - C.x, z - C.z) < 2.6 || pts.some(([u, v]) => Math.hypot(u - x, v - z) < .62)) continue; pts.push([x, z]); }
      for (const [x, z] of pts) { const dc = Math.hypot(x - C.x, z - C.z), pd = pathD(x, z);
        if (pd < 2.1 || laneD(x, z) < 0 || passPos.some(q => Math.hypot(q.mid.x - x, q.mid.z - z) < 1.6)) continue;   // the camera's corridor, the sight lane to him, the basket pairs
        const detailed = inWedge(x, z) && (dc < 17 || pd < 7) && crowdB.length < 190;
        if (detailed) { const p = person(r); p.position.set(x, hB(x, z), z);
          const toC = face(C.x - x, C.z - z), toG = face(cx - x, cz - z); p.rotation.y = r() < .55 ? toC + (r() - .5) * .5 : toG + (r() - .5) * .6;   // to him, or into the group
          p.userData.dc = dc; p.userData.gc = [cx, cz]; Bg.add(p); crowdB.push(p); }
        else spotsI.push([x, z, dc, cx, cz]); } } }
  // each detailed person: when he rises (a ripple out from the man), whom he turns to, whether and where he presses in
  { const r = rng(616); for (const p of crowdB) { const U = p.userData;
      U.tRise = T.rise[0] + (U.dc / 17) * (T.rise[1] - T.rise[0] - 1.2) + r() * .5; U.mateI = (r() * crowdB.length) | 0; U.eat = r() < .35; U.eph = r() * 6;
      U.gest = r() < .25 ? 1 : r() < .2 ? 2 : 0;                 // 1: an arm raised (they stir), 2: a hand to the chest
      const out = V(p.position.x - C.x, 0, p.position.z - C.z), d = out.length(); out.normalize();
      U.rStop = 2.2 + Math.min(1, d / 17) * 3.6 + r() * .6; U.walkD = Math.max(0, d - U.rStop); U.dir = out.clone().negate();
      U.tWalk = T.surge[0] + .3 + (d / 17) * 1.2 + r() * .9; U.reach = r() < .7;
      for (let q = 0; q <= 10; q++) { const w = p.position.clone().addScaledVector(U.dir, U.walkD * q / 10); if (laneD(w.x, w.z) < .35) { U.walkD = 0; break; } } } }   // nobody walks into the camera's sight lane
  // the man: undyed robe, a darker headcloth like every man's (heal-village.js) — no mark, no glow; standing, back to us, on the sun's axis
  const king = mk({ h: 1.76, head: 'cloth', mat: kingM, cloth: kingC, broad: 1.02 }); king.position.copy(C); king.rotation.y = 0; king.userData.ph = .13; Bg.add(king);
  // baskets passing hand to hand (both hands on the rim; the receiver's hands close on it before the giver lets go)
  const wickerM = new THREE.MeshStandardMaterial({ color: '#9a7444', roughness: .95, side: THREE.DoubleSide });
  wickerM.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLP;').replace('#include <map_fragment>', `#include <map_fragment>
      { float a = atan(vLP.z, vLP.x); float w = sin(a * 60.) * sin(vLP.y * 120.); diffuseColor.rgb *= .82 + .2 * smoothstep(-.2, .2, w); }`); };
  wickerM.customProgramCacheKey = () => 'ce-wicker';
  { const pc = wickerM.onBeforeCompile; wickerM.onBeforeCompile = sh => { pc(sh); Object.assign(sh.uniforms, RIMU); sh.uniforms.uRimS = { value: 1.8 };
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunV, uRimC; uniform float uRimK, uRimS;').replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      { vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 2.5); totalEmissiveRadiance += uRimC * fr * smoothstep(-.3, .5, dot(normal, uSunV)) * uRimK * uRimS; }`); }; }
  const breadM = rimSun(K.std('#d09a5a', { roughness: .85 }), 'bread', 1.6), fishM = K.std('#8a8478', { roughness: .5, metalness: .2 });
  const makeBasket = () => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.LatheGeometry([[.12, 0], [.17, .03], [.2, .09], [.21, .15], [.2, .16]].map(([x, y]) => new THREE.Vector2(x, y)), 22), wickerM); b.castShadow = true; g.add(b);
    const rimT = new THREE.Mesh(new THREE.TorusGeometry(.205, .013, 5, 24), wickerM); rimT.rotation.x = Math.PI / 2; rimT.position.y = .155; g.add(rimT);
    for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(.065, 10, 6), breadM); l.scale.set(1, .5, 1); l.position.set(Math.cos(i * 1.7) * .09, .13, Math.sin(i * 1.7) * .09); g.add(l); }
    for (let i = 0; i < 2; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.04, 8, 5), fishM); f.scale.set(2.6, .55, .9); f.position.set(-.04 + i * .07, .145, .03 - i * .07); f.rotation.y = .6 + i; g.add(f); }
    g.scale.setScalar(1.3); Bg.add(g); return g; };
  // the three pairs, placed beside the camera's path a little ahead of where the camera is at each hand-off
  const passes = passPos.map(({ tp, posA, posB, mid }, i) => {
    const r = rng(90 + i), a = person(() => r() * .85 + .15), b = person(r);
    for (const [p, q] of [[a, posA], [b, posB]]) { p.position.set(q.x, hB(q.x, q.z), q.z); Bg.add(p); }
    a.rotation.y = face(posB.x - posA.x, posB.z - posA.z) - .5; b.rotation.y = face(posA.x - posB.x, posA.z - posB.z) + .5;
    a.userData.dc = b.userData.dc = Math.hypot(mid.x - C.x, mid.z - C.z);
    return { tp, a, b, basket: makeBasket() }; });
  for (const ps of passes) for (const p of [ps.a, ps.b]) { const U = p.userData; U.tRise = T.rise[0] + (U.dc / 17) * (T.rise[1] - T.rise[0] - 1.2) + .3; U.walkD = 0; U.gest = 0; U.mateI = 0; U.dir = V(0, 0, -1); }
  const lapAt = (p, k = 0) => { p.updateMatrix(); return V(0, .5 + .1 * k, -.32).applyMatrix4(p.matrix); };   // in front of a kneeling person, world
  // instanced far crowd: one lathe figure that morphs from sitting to standing (same vertex count), rising on its own time
  const IU = { uT: { value: 0 }, uC: { value: C.clone() }, uSurge0: { value: T.surge[0] }, uRiseOverride: { value: -1 } };
  const prof = (pts) => pts.map(([r, y]) => new THREE.Vector2(r, y));
  const standG = new THREE.LatheGeometry(prof([[.001, 0], [.27, .02], [.25, .45], [.22, .9], [.24, 1.22], [.2, 1.4], [.08, 1.48], [.105, 1.56], [.1, 1.68], [.001, 1.74]]), 10);
  const sitG = new THREE.LatheGeometry(prof([[.001, 0], [.38, .02], [.37, .18], [.31, .36], [.25, .6], [.2, .78], [.075, .84], [.1, .92], [.095, 1.02], [.001, 1.08]]), 10);
  standG.setAttribute('position2', sitG.attributes.position); standG.setAttribute('normal2', sitG.attributes.normal);
  { const n = spotsI.length, aT = new Float32Array(n), aD = new Float32Array(n), aS = new Float32Array(n), r = rng(31);
    spotsI.forEach(([x, z, dc], i) => { aT[i] = T.rise[0] + Math.min(1, dc / 60) * 2.6 + r() * .9; aD[i] = Math.max(0, Math.min(9, (dc - 5) * .36)) * (r() < .85 ? 1 : 0); aS[i] = r(); });
    standG.setAttribute('aT', new THREE.InstancedBufferAttribute(aT, 1)); standG.setAttribute('aD', new THREE.InstancedBufferAttribute(aD, 1)); standG.setAttribute('aS', new THREE.InstancedBufferAttribute(aS, 1));
    const im = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .95 });
    im.onBeforeCompile = sh => { Object.assign(sh.uniforms, IU, RIMU); sh.uniforms.uRimS = { value: .9 };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>
          attribute vec3 position2; attribute vec3 normal2; attribute float aT, aD, aS; uniform float uT, uSurge0, uRiseOverride; uniform vec3 uC; varying float vRise;`)
        .replace('#include <beginnormal_vertex>', `float rise = uRiseOverride >= 0. ? uRiseOverride : smoothstep(aT, aT + 1.3, uT); vRise = rise;
          vec3 objectNormal = normalize(mix(normal2, normal, rise));`)
        .replace('#include <begin_vertex>', `vec3 transformed = mix(position2, position, rise);
          transformed.x += sin(uT * (.4 + aS * .3) + aS * 30.) * .03 * transformed.y; transformed.z += sin(uT * .5 + aS * 17.) * .02 * transformed.y;
          { float m = smoothstep(uSurge0 + aS * 1.2, uSurge0 + aS * 1.2 + 4.5, uT) * aD; vec3 ip = vec3(instanceMatrix[3].x, 0., instanceMatrix[3].z);
            vec3 toC = normalize(vec3(uC.x, 0., uC.z) - ip); transformed += (mat3(inverse(instanceMatrix)) * toC) * m; transformed.y += abs(sin(uT * 5.7 + aS * 9.)) * .04 * step(.01, m) * (1. - step(aD - .01, m)); }`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunV, uRimC; uniform float uRimK, uRimS;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { vec3 Vd = normalize(vViewPosition); float fr = pow(1. - clamp(dot(normal, Vd), 0., 1.), 3.2); totalEmissiveRadiance += uRimC * fr * smoothstep(-.2, .55, dot(normal, uSunV)) * uRimK * uRimS; }`); };
    im.customProgramCacheKey = () => 'ce-inst';
    const inst = new THREE.InstancedMesh(standG, im, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    spotsI.forEach(([x, z, dc, cx, cz], i) => { const toC = Math.atan2(C.x - x, C.z - z); q.setFromAxisAngle(V(0, 1, 0), r() < .6 ? toC : Math.atan2(cx - x, cz - z) + (r() - .5));
      const h = r() < .15 ? .68 + r() * .12 : .9 + r() * .14; m4.compose(V(x, hB(x, z), z), q, V(h * (.9 + r() * .2), h, h * (.9 + r() * .2))); inst.setMatrixAt(i, m4);
      c.set(r() < .5 ? mantleCols[(r() * mantleCols.length) | 0] : robeCols[(r() * robeCols.length) | 0]); inst.setColorAt(i, c); });
    inst.castShadow = false; inst.receiveShadow = true; inst.frustumCulled = false; Bg.add(inst); var crowdI = inst; }

  function kneelOrStand(p, t, extra = {}) {   // a field person before/through/after rising; ex: head/hands overrides
    const U = p.userData, k = clamp((t - U.tRise) / 1.25), kr = P.kneelRise(k, U.s, U.ph);
    const base = k >= 1 ? P.idle(t, U.ph, { s: U.s }) : { breath: P.breath(t, U.ph), twist: .03 * Math.sin(t * .23 + U.ph * 5), lean: -.16 - .05 * Math.sin(t * .3 + U.ph * 7), head: [-.05 + .04 * Math.sin(t * .4 + U.ph * 9), .06 * Math.sin(t * .19 + U.ph * 4)] };
    const restH = [V(-.16 * U.s, lerp(.52, .82, k) * U.s, lerp(-.3, -.12, k) * U.s), V(.16 * U.s, lerp(.52, .82, k) * U.s, lerp(-.28, -.12, k) * U.s)];
    const P0 = { ...base, ...(k < 1 ? kr : { feet: base.feet }), lean: (k < 1 ? kr.lean : 0) + (base.lean || 0) };
    if (k >= 1) { P0.bob = base.bob; }
    P.pose(p, { ...P0, hands: k < 1 ? restH : null, ...extra });
    return k;
  }
  function crowdBAt(t) {
    IU.uT.value = t;
    const camP = cam.position;
    for (const p of crowdB) { const U = p.userData; const k = clamp((t - U.tRise) / 1.25);
      if (U.walkD > 0 && t > U.tWalk && k >= 1) {   // pressing in toward him (feet planted; they slow and stop at their place)
        const v = .5 / .58, dur = U.walkD / v * 1.25, t1 = U.tWalk + dur, steps = 24; let dist = 0;
        for (let i = 0; i < steps; i++) { const tt = U.tWalk + (Math.min(t, t1) - U.tWalk) * (i + .5) / steps; dist += v * ss(U.tWalk, U.tWalk + .6, tt) * (1 - ss(t1 - .8, t1, tt)) * (Math.min(t, t1) - U.tWalk) / steps; }
        const amt = ss(U.tWalk, U.tWalk + .6, t) * (1 - ss(t1 - .8, t1, t)), w = P.walk(p, t, U.tWalk, { T: 1.16, L: .5, amt: Math.max(.001, amt) });
        if (!U.p0) U.p0 = p.position.clone(); p.position.copy(U.p0).addScaledVector(U.dir, Math.min(dist, U.walkD)); p.position.y = hB(p.position.x, p.position.z);
        const ry0 = U.ry0 ?? (U.ry0 = p.rotation.y), ryW = face(U.dir.x, U.dir.z), dr = Math.atan2(Math.sin(ryW - ry0), Math.cos(ryW - ry0)); p.rotation.y = ry0 + dr * ss(U.tWalk - .3, U.tWalk + .5, t);
        const up = U.reach ? ss(U.tWalk + .8, U.tWalk + 2.0, t) : 0;
        const id = P.idle(t, U.ph, { s: U.s }), feet = amt > .02 ? w.feet : id.feet;
        P.pose(p, { ...id, ...(amt > .02 ? w : {}), feet, head: [.12 * up + .05, 0], hands: up > 0 ? [null, lv(V(.2, .85, -.15).multiplyScalar(U.s), V(.22 * U.s, 1.78 * U.s, -.38 * U.s), up)] : null });
        continue; }
      if (U.p0) { p.position.copy(U.p0); }   // (pure in t: back to the start before the walk)
      if (U.ry0 != null) p.rotation.y = U.ry0;
      const ex = {};
      if (k >= 1) {   // standing: they look at each other, stir; a few raise an arm or press a hand to the chest
        const m = crowdB[U.mateI], lk = ss(U.tRise + 1.2, U.tRise + 2.2, t), toM = m ? clamp(yawTo(p, m.position.x, m.position.z), -1.1, 1.1) : 0, toK = clamp(yawTo(p, C.x, C.z), -1.1, 1.1);
        const sw = .5 + .5 * Math.sin(t * .9 + U.ph * 6), yaw = lerp(toK, toM, lk * sw);
        ex.head = [.05 + .03 * Math.sin(t * .5 + U.ph * 7), yaw * .75]; ex.twist = yaw * .3;
        if (U.gest === 1) { const g = ss(U.tRise + 1.6, U.tRise + 2.6, t) * (.75 + .25 * Math.sin(t * 1.1 + U.ph * 4)); ex.hands = [null, lv(V(.2, .85, -.15).multiplyScalar(U.s), V(.25 * U.s, 1.7 * U.s, -.3 * U.s), g)]; }
        else if (U.gest === 2) { const g = ss(U.tRise + 1.4, U.tRise + 2.4, t); ex.hands = [lv(V(-.2, .85, -.15).multiplyScalar(U.s), V(-.04 * U.s, 1.18 * U.s, -.2 * U.s), g), null]; }
      } else if (U.eat) {   // sitting: now and then a hand to the mouth (bread), eased
        const e = Math.max(0, Math.sin(t * .8 + U.eph)), ek = e * e * (3 - 2 * e);
        ex.hands = [V(-.16 * U.s, .52 * U.s, -.3 * U.s), lv(V(.16 * U.s, .52 * U.s, -.28 * U.s), V(.05 * U.s, 1.3 * U.s - .44 * U.s, -.16 * U.s), ek * .9)];
      }
      kneelOrStand(p, t, ex); }
    // the baskets
    for (const ps of passes) { const { tp, a, b, basket } = ps, LA = lapAt(a), LB = lapAt(b), M = LA.clone().lerp(LB, .5); M.y += .2;
      const up = ss(tp - 1.6, tp - .6, t), dn = ss(tp + .2, tp + 1.2, t), kr = clamp((t - b.userData.tRise) / 1.25);
      // after the rise he keeps it, both hands on the rim, carried in front of his waist (it rises with him)
      const pos = kr > 0 ? lv(LB, V(0, .5 + .4, -.3).applyMatrix4(b.matrix), kr * kr * (3 - 2 * kr)) : t < tp ? lv(LA, M, up) : lv(M, LB, dn); basket.position.copy(pos); basket.rotation.y = a.rotation.y;
      const ax = LB.clone().sub(LA).setY(0).normalize(), perp = V(-ax.z, 0, ax.x), rimY = .2;
      const grip = (towards, side) => pos.clone().add(V(0, rimY, 0)).addScaledVector(towards, -.195).addScaledVector(perp, side * .18);   // on the rim, toward the holder
      const inv = p => { p.updateMatrix(); return p.matrix.clone().invert(); };
      const restA = [V(-.16 * a.userData.s, .52 * a.userData.s, -.3 * a.userData.s), V(.16 * a.userData.s, .52 * a.userData.s, -.28 * a.userData.s)], restB = [V(-.16 * b.userData.s, .52 * b.userData.s, -.3 * b.userData.s), V(.16 * b.userData.s, .52 * b.userData.s, -.28 * b.userData.s)];
      const iA = inv(a), iB = inv(b), rel = ss(tp + .2, tp + .8, t), take = ss(tp - 1.0, tp - .2, t);
      const gA = [grip(ax, -1).applyMatrix4(iA), grip(ax, 1).applyMatrix4(iA)], gB = [grip(ax.clone().negate(), 1).applyMatrix4(iB), grip(ax.clone().negate(), -1).applyMatrix4(iB)];
      const lean = (k) => -.15 * k;
      if (t < a.userData.tRise) kneelOrStand(a, t, { hands: [lv(gA[0], restA[0], rel), lv(gA[1], restA[1], rel)], lean: lean(up * (1 - rel)) - .05, head: [-.2, 0] });
      else kneelOrStand(a, t);
      if (t < b.userData.tRise) kneelOrStand(b, t, { hands: [lv(restB[0], gB[0], take), lv(restB[1], gB[1], take)], lean: lean(take * (1 - dn)) - .05, head: [-.2, 0] });
      else kneelOrStand(b, t, { hands: gB, lean: -.04, head: [-.08, 0] });
    }
    // the man: still among them; at "억지로 붙들어" he lowers his head a little; then he steps away from them (back to us)
    { const U = king.userData, aw = T.away;
      if (t < aw) { king.position.copy(C); P.pose(king, { ...P.idle(t, U.ph, { s: U.s }), head: [-.03 - .08 * ss(T.q4 + .5, T.q4 + 1.6, t), .1 * Math.sin(t * .3) * (1 - ss(T.rise[0], T.rise[0] + 1, t))] }); }
      else { const dir = V(-.25, 0, -1).normalize(); const w = P.walk(king, t, aw, { T: 1.12, L: .52 }); king.position.copy(C).addScaledVector(dir, w.dist); king.position.y = hB(king.position.x, king.position.z); king.rotation.y = face(dir.x, dir.z) * ss(aw, aw + .5, t);
        P.pose(king, { ...w, breath: .5, head: [-.08, 0] }); } }
  }

  // ---------------------------------------------------------------- S3: the mountain — his climb, the fires, the stars
  const climbDir = V(-1, 0, -.22).normalize();   // from the field side (+x) up to the top, toward the set sun
  const STOP = SUMMIT.clone().addScaledVector(climbDir, -.6); STOP.y = hB(STOP.x, STOP.z);
  const walkLen = (T.top - T.q4b) * (.52 / .56) + .35;
  const START = STOP.clone().addScaledVector(climbDir, -walkLen); START.y = hB(START.x, START.z);
  const kingS3 = mk({ h: 1.76, head: 'cloth', mat: kingM, cloth: kingC, broad: 1.02 }); kingS3.userData.ph = .13; Bg.add(kingS3);
  function kingClimb(t) {
    const tStop = T.top, v = .52 / .56; let d;
    if (t < tStop - .5) d = (t - T.q4b) * v; else { const e = Math.min(t, tStop + .5) - (tStop - .5); d = (tStop - .5 - T.q4b) * v + v * (e - e * e / 2); }   // slows over the last second
    const p = START.clone().addScaledVector(climbDir, Math.max(0, d)); p.y = hB(p.x, p.z); kingS3.position.copy(p); kingS3.rotation.y = face(climbDir.x, climbDir.z);
    const amt = 1 - ss(tStop - .6, tStop + .5, t), w = P.walk(kingS3, t, T.q4b - .27, { T: 1.12, L: .52, amt: Math.max(.001, amt) });
    const slope = (hB(p.x + climbDir.x * .5, p.z + climbDir.z * .5) - hB(p.x - climbDir.x * .5, p.z - climbDir.z * .5));   // rise per metre along the way
    const id = P.idle(t, .13, { s: kingS3.userData.s });
    const feet = w.feet.map((f, i) => { const g = { u: lerp(id.feet[i].u, f.u, amt), lift: f.lift * amt, pitch: (f.pitch || 0) * amt }; g.lift += g.u * slope; return g; });
    P.pose(kingS3, { ...id, ...w, feet, bob: w.bob * amt, lean: -.1 * amt - .02, swing: w.swing.map(s => s * amt), head: [lerp(-.05, .1, ss(T.n13, T.n13 + 3, t)), 0], breath: P.breath(t, .13) });
  }
  // S3 camera: behind him at walking pace, then the dolly out to OUT (just under his eye line, so he stands against the sky)
  const back = climbDir.clone().negate(), lat = V(-back.z, 0, back.x);
  const OUT = SUMMIT.clone().addScaledVector(back, 38).addScaledVector(lat, 3.5); OUT.y = SUMMIT.y - 1.4;
  const OUTDIR = V(climbDir.x, Math.tan(-1.2 * D2R), climbDir.z).normalize().applyAxisAngle(V(0, 1, 0), .02);
  // the crowd's fires on the plain below and beyond the knoll, placed where the final frame sees them (rays from OUT through
  // chosen points of the frame, marched to the ground; only flat ground, off the knoll). Flicker: smooth sums of sines.
  const fires = []; { const r = rng(2024), cm = new THREE.PerspectiveCamera(FOV, W / H, .1, 3000); cm.position.copy(OUT); cm.lookAt(OUT.clone().add(OUTDIR)); cm.updateMatrixWorld();
    for (let i = 0; i < 400 && fires.length < 24; i++) { const u = r() < .5 ? .05 + r() * .33 : .62 + r() * .33, v = .515 + r() * .085;
      const d = V(u * 2 - 1, 1 - v * 2, .5).unproject(cm).sub(OUT).normalize(); let hit = null;
      for (let s2 = 30; s2 < 1200; s2 += 2) { const q = OUT.clone().addScaledVector(d, s2); if (q.y < hB(q.x, q.z)) { hit = q; break; } }
      if (!hit || hillH(hit.x, hit.z) > 1.2 || fires.some(f => f.p.distanceTo(hit) < 25)) continue;
      fires.push({ p: V(hit.x, hB(hit.x, hit.z) + .3, hit.z), ph: r() * 9, k: .6 + r() * .6 }); } }
  const fireU = { uT: { value: 0 }, uK: { value: 0 }, uPx: { value: H / 1920 } };
  { const n = fires.length * 5, pos = new Float32Array(n * 3), aS = new Float32Array(n), r = rng(5);
    fires.forEach((f, i) => { for (let j = 0; j < 5; j++) { const k = i * 5 + j; pos[k * 3] = f.p.x + (r() - .5) * .5; pos[k * 3 + 1] = f.p.y + r() * .5; pos[k * 3 + 2] = f.p.z + (r() - .5) * .5; aS[k] = f.ph + j * 1.3; } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
    const m = new THREE.ShaderMaterial({ uniforms: fireU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
        float fl = .75 + .15 * sin(uT * 7.1 + aS * 3.) + .1 * sin(uT * 13.3 + aS * 7.); gl_PointSize = clamp(uPx * 5200. / -mv.z * fl, 1.5, 26.); vA = fl; }`,
      fragmentShader: `uniform float uK; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 18.); gl_FragColor = vec4(vec3(1., .62, .28) * 2.4 * vA, a * uK); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; Bg.add(pts); }
  const fireLamps = fires.slice(0, 14).map(f => film.lamp(f.p.clone().add(V(0, .6, 0)), '#ff9a4a', { power: 0, size: 2.5, fog: 1 }));
  // small dark figures sitting round the nearest fires (instanced sitting lathes, fixed)
  { const n = fires.length * 6, im = new THREE.InstancedMesh(sitG, K.std('#2a2019', { roughness: 1 }), n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), r = rng(66); let k = 0;
    for (const f of fires) for (let j = 0; j < 6; j++) { const a = j / 6 * 6.283 + r(), d = 1.1 + r() * .5, x = f.p.x + Math.cos(a) * d, z = f.p.z + Math.sin(a) * d; q.setFromAxisAngle(V(0, 1, 0), Math.atan2(f.p.x - x, f.p.z - z)); m4.compose(V(x, hB(x, z), z), q, V(1, .95, 1)); im.setMatrixAt(k++, m4); }
    im.receiveShadow = true; Bg.add(im); var fireSitters = im; }
  // stars: points on a sphere that rides with the camera (fixed while the camera turns slowly), each comes out on its own time
  const starU = { uK: { value: 0 }, uPx: { value: H / 1920 } };
  { const n = 1400, pos = new Float32Array(n * 3), aS = new Float32Array(n), r = rng(1999);
    for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * 6.283, y = Math.abs(u) * .95 + .02, q = Math.sqrt(1 - y * y); pos[i * 3] = Math.cos(a) * q * 1500; pos[i * 3 + 1] = y * 1500; pos[i * 3 + 2] = Math.sin(a) * q * 1500; aS[i] = r(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
    const m = new THREE.ShaderMaterial({ uniforms: starU, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uK, uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
        float b = pow(aS, 3.); gl_PointSize = uPx * (1.6 + 3.2 * b); vA = smoothstep(aS * .85, aS * .85 + .15, uK) * (.35 + .65 * b) * smoothstep(.04, .2, position.y / 1500.); }`,
      fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 16.); gl_FragColor = vec4(vec3(1., .96, .88) * 1.6, a * vA); }` });
    const st = new THREE.Points(g, m); st.frustumCulled = false; st.renderOrder = -5; S.add(st); var stars = st; }

  // dust motes in the low sun near the camera (tens, depth-faded; heal-village.js)
  const dustU = { uT: { value: 0 }, uA: { value: 1 }, uPx: { value: H / 1920 }, uC: { value: V() } };
  { const n = 120, Rr = rng(57), p = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { p[i * 3] = (Rr() - .5) * 8; p[i * 3 + 1] = Rr() * 3.5; p[i * 3 + 2] = -Rr() * 12; sd[i] = Rr(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({ uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uT, uPx; uniform vec3 uC; varying float vA;
        void main(){ vec3 q = position + uC; q.y += mod(uT * (.05 + .06 * aS) + aS * 3.5, 3.5) - 1.75 * aS; q.x += sin(uT * .4 + aS * 30.) * .3; q.z += cos(uT * .3 + aS * 17.) * .3;
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
          gl_PointSize = clamp(uPx * (2. + 4. * aS) * 12. / d, 1., 12.); vA = clamp(1.2 - d / 12., 0., 1.) * (.4 + .6 * aS); }`,
      fragmentShader: `uniform float uA; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; float a = exp(-dot(c, c) * 14.); gl_FragColor = vec4(vec3(1., .82, .58) * 1.5, a * vA * uA); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; S.add(pts); var dust = pts; }

  // ---------------------------------------------------------------- the shots
  const tmpV = V();
  function setCam(pos, look, roll = 0) { cam.position.copy(pos); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(look); }
  function setFov(f) { if (cam.fov !== f) { cam.fov = f; cam.updateProjectionMatrix(); } }
  const skyEvening = { top: col('#56688c', .4), mid: col('#cf9a6e', .76), horizon: col('#ffbf7e', 1.45) };
  let shimmerK = 0, godK = .5, inS3 = false;
  const S1 = { A0: V(AX + 2, hA(AX + 2, 13) + 6.2, 13), A1: V(AX + 1, hA(AX + 1, 11) + 5.6, 11), A2: V(AX + .5, hA(AX + .5, 9.5) + 8.6, 9.5) };
  function frame(shot, t) {
    const Lk = film.look, Dc = film.dofCfg, at = film.atmos;
    A.visible = shot === 0; Bg.visible = shot > 0; stars.visible = shot === 2; dust.visible = shot !== 0 || t > T.zoom[1] - 1;
    Lk.grain = .03; Lk.exposure = .72; Dc.maxCoc = 24; inS3 = shot === 2;
    SKY.top.value.copy(skyEvening.top); SKY.mid.value.copy(skyEvening.mid); SKY.horizon.value.copy(skyEvening.horizon); SKY.sunColor.value.copy(col('#fff0cc', 22)); SKY.sunGlow.value.copy(col('#ffb070', 1.5)); SKY.clouds.value = .25;
    at.color.copy(col('#c98a5a', .54)); at.colorUp.copy(col('#b39a84', .47)); at.density = .006; at.falloff = .03; at.base = 0; at.scatter = 1;
    RIMU.uRimK.value = 1; RIMU.uRimC.value.copy(col('#ff9a5a', 1.25)); fireU.uK.value = 0; fireLamps.forEach(l => l.power = 0); hemi.intensity = .5; hemi.color.copy(col('#b8a894')); sunLamp.power = 2000; godK = .5;
    if (shot === 0) {
      // S1: telephoto on the column (shimmer), zoom out + pedestal up to the crowd on the hill; then the slow rise over them under N11
      soldiersAt(t); crowdAAt(t);
      const kz = eio((t - T.zoom[0]) / (T.zoom[1] - T.zoom[0])), kc = eio((t - T.crane[0]) / (T.crane[1] - T.crane[0]));
      const fov = Math.exp(lerp(Math.log(8), Math.log(42), kz));
      const pos = lv(S1.A0, S1.A1, kz).lerp(S1.A2, kc * .9);
      const colMid = V(AX + colX(t) + 13, 1.0, ROADZ);
      const teleLook = colMid.clone().sub(S1.A0).normalize(), wideLook = V(AX + 2.5, 2, -95).sub(pos).normalize();
      const look = pos.clone().add(lv(teleLook, wideLook, kz).normalize().multiplyScalar(100));
      setFov(fov); setCam(pos, look);
      setSun(V(-.1, .042, -1), 9, V(AX + 8, 8, -120), 3.0); shadowBox(70, 34);
      at.density = lerp(.0016, .0036, kz); at.falloff = .02; at.scatter = lerp(.35, .8, kz);
      SKY.sunColor.value.copy(col('#ffd9a8', lerp(7, 20, kz))); SKY.sunGlow.value.copy(col('#ffa060', lerp(2.2, 1.5, kz)));
      Dc.focus = lerp(colMid.distanceTo(pos), pos.distanceTo(V(AX + 1, hA(AX + 1, -4) + 1.4, -4)), kz); Dc.aperture = lerp(5, 1.1, kz);
      Lk.exposure = lerp(.68, .72, kz); shimmerK = 1 - ss(T.zoom[0], T.zoom[0] + 3.5, t) * .85;
      dustU.uC.value.set(pos.x, pos.y - 3, pos.z - 2);
    } else if (shot === 1) {
      // S2: FPV in over the seated groups toward him, the orbit as they rise, the press
      crowdBAt(t); for (const f of [fireSitters]) f.visible = false; kingS3.visible = false; king.visible = true; crowdI.visible = true;
      const pos = camS2(t).add(hand(t, .5 * ss(T.n12c - .5, T.n12c + .8, t)));
      const look = C.clone().add(V(0, 1.15 + .35 * ss(T.n12c, T.n12c + 3, t), 0)).add(hand(t + 7, .25 * ss(T.n12c - .5, T.n12c + .8, t)));
      const bank = (noise1(t * .35, 21) * .6) * D2R * (1 - ss(T.fpv1 - 1, T.fpv1, t)) + hand(t + 3, .5 * ss(T.n12c - .5, T.n12c + .8, t)).x * .06;
      setFov(FOV); setCam(pos, look, bank);
      setSun(V(.0, .062, -1), 9, C.clone().add(V(0, 0, 6)), 3.1); shadowBox(45, 45);
      at.density = .0055; at.falloff = .03; at.base = 3;
      RIMU.uRimC.value.copy(col('#ff8248', lerp(1.2, 1.7, ss(T.n12c, T.n12c + 2, t))));
      Dc.focus = pos.distanceTo(king.position); Dc.aperture = lerp(.9, 1.9, ss(T.pass[2] + 1, T.n12c + 1, t));   // the baskets near the path stay readable
      waterU.uSunW.value.copy(SUN); waterU.uT.value = t; tuftU.uT.value = t; shimmerK = 0;
      dustU.uC.value.set(pos.x, pos.y - 1.4, pos.z - 1);
    } else {
      // S3: behind him up the last of the hill, the sun pressed on the horizon behind the top; he stands; the dolly out into the night
      king.visible = false; crowdI.visible = false; kingS3.visible = true; for (const p of crowdB) p.visible = false; for (const ps of passes) { ps.a.visible = ps.b.visible = ps.basket.visible = false; }
      fireSitters.visible = true; kingClimb(t);
      const n = eio((t - T.night[0]) / (T.night[1] - T.night[0])), kd = eio((t - T.dolly[0]) / (T.dolly[1] - T.dolly[0])), drift = Math.max(0, t - T.dolly[1]) * .4;
      const kp = kingS3.position.clone(), kpF = kp.clone(); if (t > T.dolly[0]) { /* the follow point stays where it was when the dolly began */ }
      const follow = kp.clone().addScaledVector(back, 10.5).addScaledVector(lat, 1.2); follow.y = Math.max(hB(follow.x, follow.z) + 1.1, kp.y - .1);
      const outP = OUT.clone().addScaledVector(back, drift).add(V(0, drift * .05, 0));
      const pos = lv(follow, outP, kd);
      const look = lv(kp.clone().add(V(0, 1.3, 0)).addScaledVector(climbDir, 6), outP.clone().addScaledVector(OUTDIR, 100), kd);
      setFov(FOV); setCam(pos, look);
      // the sun sits on the horizon behind the top, then goes under; the sky cools to night
      const elev = lerp(1.7, -4.5, ss(T.q4b, T.n13 + 2.2, t)), az = climbDir.clone(); const sd = V(az.x, Math.tan(elev * D2R), az.z).normalize().applyAxisAngle(V(0, 1, 0), -.12);
      setSun(sd, lerp(7, 3, n), kp.clone(), lerp(2.6, 0, ss(T.q4b + 1, T.n13 + 1.2, t))); shadowBox(45, 45);
      SKY.top.value.copy(lv(skyEvening.top, col('#0d1426', .5), n)); SKY.mid.value.copy(lv(col('#c88a66', .85), col('#2a3050', .5), n)); SKY.horizon.value.copy(lv(col('#ffae6a', 1.7), col('#a86a50', .6), n));
      SKY.sunColor.value.copy(col('#ffcf96', lerp(16, 0, ss(T.q4b + .5, T.n13 + 1.5, t)))); SKY.sunGlow.value.copy(col('#ff9a58', lerp(1.8, .5, n))); SKY.clouds.value = lerp(.25, .12, n);
      at.color.copy(lv(col('#c08058', .6), col('#3a3c56', .4), n)); at.colorUp.copy(lv(col('#a8907e', .5), col('#28304a', .4), n)); at.density = .005; at.falloff = .03; at.base = 4;
      hemi.intensity = lerp(.5, .32, n); hemi.color.copy(lv(col('#a2aecb'), col('#6a7aa8'), n));
      RIMU.uRimC.value.copy(lv(col('#ff8a4a', 1.5), col('#8aa0d0', .35), n));
      Lk.exposure = lerp(.72, 1.02, n); sunLamp.power = lerp(2400, 200, n);
      fireU.uK.value = ss(T.q4b + 2.5, T.n13 + 2.5, t); fires.slice(0, 14).forEach((f, i) => { fireLamps[i].power = fireU.uK.value * 14 * f.k * (.85 + .15 * Math.sin(t * 6.3 + f.ph)); }); fireU.uT.value = t;
      starU.uK.value = ss(T.stars[0], T.stars[1], t); stars.position.copy(pos);
      Dc.focus = pos.distanceTo(kp); Dc.aperture = lerp(1.6, .6, kd); Lk.grain = lerp(.03, .0, ss(T.etch[0] - 1, T.etch[0], t));
      tuftU.uT.value = t; shimmerK = 0; godK = .55 * (1 - n);
      dustU.uC.value.set(pos.x, pos.y - 1.4, pos.z); dustU.uA.value = 1 - n;
    }
    if (shot !== 2) { for (const p of crowdB) p.visible = true; for (const ps of passes) { ps.a.visible = ps.b.visible = ps.basket.visible = true; } dustU.uA.value = 1; }
    RIMU.uSunV.value.copy(SUN).transformDirection(cam.matrixWorldInverse.copy(cam.matrixWorld).invert());
    dustU.uT.value = t;
    film.render(t);
  }

  // ---- screen-space light scattering from the sun (heal-village.js / veil-temple.js godRays)
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const gS = mkC(W >> 2, H >> 2), gsx = gS.getContext('2d', { willReadFrequently: true }), gB = mkC(W >> 2, H >> 2), gbx = gB.getContext('2d');
  function godRays(ctx, cx, cy, k) {
    const w = gS.width, h = gS.height; gsx.setTransform(1, 0, 0, 1, 0, 0); gsx.drawImage(ctx.canvas, 0, 0, w, h);
    const im = gsx.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = clamp((.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2] - 170) / 85); d[i] *= v; d[i + 1] *= v; d[i + 2] *= v; }
    gsx.putImageData(im, 0, 0);
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over'; gbx.fillStyle = '#000'; gbx.fillRect(0, 0, w, h);
    gbx.globalCompositeOperation = 'lighter'; const sx = cx / 4, sy = cy / 4;
    for (let i = 0; i < 24; i++) { const sc = 1 + i * .05; gbx.globalAlpha = Math.pow(.9, i) * .15; gbx.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); gbx.drawImage(gS, 0, 0); }
    gbx.setTransform(1, 0, 0, 1, 0, 0); gbx.globalAlpha = 1; gbx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = k; ctx.imageSmoothingEnabled = true; ctx.drawImage(gB, 0, 0, W, H); ctx.restore();
  }
  // heat shimmer (「아라비아의 로렌스」): the frame in thin horizontal strips, each nudged sideways by slow travelling waves (smooth in
  // t and y — nothing random per frame), strongest low in the frame where the hot air lies over the valley
  function blit(ctx, t) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    if (shimmerK <= .01) ctx.drawImage(film.canvas, 0, 0, W, H);
    else { const sh = 4; ctx.drawImage(film.canvas, 0, 0, W, H);
      for (let y = 0; y < H; y += sh) { const v = y / H, amp = shimmerK * (1.2 + 3.2 * ss(.25, .9, v)) * (H / 1920);
        const dx = amp * (Math.sin(y * .051 + t * 6.1 + Math.sin(y * .013 - t * 1.7) * 2.2) * .7 + Math.sin(y * .17 - t * 9.3) * .3);
        ctx.drawImage(film.canvas, 0, y * film.canvas.height / H, film.canvas.width, sh * film.canvas.height / H, dx, y, W, sh); } }
    ctx.restore();
  }
  function draw(ctx, t) {
    let shot = 0; T.shots.forEach(([a, b], i) => { if (t >= a && t < b) shot = i; }); if (t >= T.shots[2][0]) shot = 2;
    frame(shot, t); blit(ctx, t);
    tmpV.copy(cam.position).add(SUN.clone().multiplyScalar(500)).project(cam);
    if (godK > .01 && tmpV.z < 1 && Math.abs(tmpV.x) < 1.6 && Math.abs(tmpV.y) < 1.6) godRays(ctx, (tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H, godK);
  }
  // where the knoll's top and the plain's horizon are in the frame now (for the engraving's line field, mountain-dore.js)
  function marks() { const sP = SUMMIT.clone().project(cam), hz = V(cam.position.x + OUTDIR.x * 1200, 2, cam.position.z + OUTDIR.z * 1200).project(cam);
    return { xs: (sP.x + 1) / 2 * W, hy: (1 - hz.y) / 2 * H }; }
  return { film, draw, marks, debug: { fires, nB: crowdB.length, nI: spotsI.length, SUMMIT, OUT }, beats: () => T, shotAt: t => (t >= T.shots[2][0] ? 2 : t >= T.shots[1][0] ? 1 : 0), canvas: film.canvas };
}
