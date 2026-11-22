// nocturne3d.js — 「kingdom」 7부 「왕을 모신 사람들」 block 7-3 (film 805.8 → 905.6): the light that went out of Zacchaeus's door.
//   Q19b 눅 19:9 「오늘 구원이 이 집에 이르렀으니」 · Q19c 눅 19:10 · N34 「아무도 시키지 않았습니다 …」 · N35 「왕이 먼저 찾아와 …」 ·
//   N36 「예수님은, 자신이 왕으로 다시 오시는 날 …」 · L13/Q20a 마 25:34 · Q20b 마 25:35 · N36c 「그들은 그 일이 왕께 한 일인 줄은 몰랐다며 …」 ·
//   Q20 마 25:40 · N37 「그 왕은, 자기 형제 중 가장 작은 이 하나를 자기처럼 여기십니다.」
// Look: a 3D night town graded like Frederic Remington's nocturnes (moonlit blue-green adobe, warm doorways and lamps, deep aerial
// perspective, haze in the alleys, a few motes only inside the lamp beams). The block opens on the gouache frame of Zacchaeus's house
// (7-2's palette and composition, handoff.md) and on 「오늘 구원이」 the flat paint develops into depth — the first film's 「귀환」.
// film_ref: 「용서받지 못한 자」(1992, OPUSCAR 65) nocturne · 「타이타닉」(1997, OPUSCAR 70) the drawing developing into the world ·
//           「반지의 제왕: 왕의 귀환」(OPUSCAR 76) the light passed from point to point (the beacons).
// Skills read first (rules.json skills-first; nothing in motion-skills edited, code only from this film's own copies):
//   cinematic-3d (the engine — ../lib3d/cine.js + kit.js are its vendored copies: height fog in every material, lamp in-scatter, bloom,
//     DOF, AgX, grade), parallax-facade (the flat frame that tears open into depth — here by the camera's first move, not a dolly zoom),
//   cinecode/references/camera-moves.md (the named moves: tracking low on the ground · truck · dolly · crane up with an orbit ·
//     a log-distance glide), lineage-glow (light running along lines from node to node, many lines joined into one — the C5 threads),
//   canvas-film BODY-CHECK (hands on what they hold, one grip point for a handover, planted feet) + this film's people3d.js,
//   gold-world3d.js / pastel-children.js (a paint pass over the finished frame, fixed in the frame — no per-frame noise).
// Shots (one world; every time from the script's line times via beats()):
//   C1 Q19b–Q19c  the gouache frame (camera 1.6 m, 7 m from the door) → the warm light pours out of the door and runs down the street,
//                 the paint develops into 3D over 3.2 s as the camera starts — a low tracking shot after the light into lane A, the
//                 light running ahead into the far dark alleys (Q19c).
//   C2 N34–N35    cut: the square from the right, mid distance: the household gives — bread to an old man, coins to a woman, the old man
//                 halves his loaf for a child, bread to a lame man; a small warm glow on each gift, hand to hand. Zacchaeus takes the
//                 lamp from the ledge and walks into the dark alley B; the camera pans and follows; he knocks; the door opens on a crack.
//   C3 N36–Q20a   dissolve (time): lane A at night, a small lamp burning at every door, a slow dolly between them; on Q20a the gate at
//                 the far end opens and warm light spreads down the lane toward us.
//   C4 Q20b–N36c  cut: the street of doors in the same warm light — a slow diagonal truck past three doors (bread · a bowl of water ·
//                 a stranger let in) → pan to the lamp-bearers in the lane, from behind; they turn to each other as if surprised.
//   C5 Q20–N37    the same move goes on: a crane up with an orbit over the whole town; the lamps of the doors join into one line of
//                 light (lane A, running up the frame to the square where it began); then a log-distance glide down to one small man
//                 on a doorstep without a lamp, and the light comes to rest on him. Out: a warm gold bloom (the next block takes it).
// People: people3d.js robeMan (two-bone IK with fixed lengths, elbows down/out, planted feet, walk by time-warp). Zacchaeus: small,
// rust head cloth (#8a3b24), short beard — the same man in every shot. Nobody close: mid/far or silhouetted. No Jesus in this block.
// API: const NC = await (await import('./nocturne3d.js')).build(W, H, B);  NC.draw(ctx, t, shot)  — t = FILM seconds, shot 'c1'..'c4'
//      (the page's scene table; 'c4' runs C4 and C5 as one camera). NC.stats(t, shot) → camera + emission numbers (motion table).
//      NC.joints(t, shot) → bone quaternions of the visible people (joint-angle check). Pure in t.
import { Film, THREE, V, col, rng, FOG_GLSL } from '../lib3d/cine.js';
import * as K from '../lib3d/kit.js';
import * as P from './people3d.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const sine = x => { x = clamp(x); return .5 - .5 * Math.cos(Math.PI * x); };
const rampI = u => u * u * u - u * u * u * u / 2;   // ∫₀ᵘ smoothstep
const bump = (a, b, x) => Math.sin(Math.PI * clamp((x - a) / (b - a)));
const Q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();

// ---------------------------------------------------------------- the one table: every visual time from the line times
export function beats(B) {
  const pc = B.pc || {}, pq = (id, i, d) => (pc[id] && pc[id][i] != null ? pc[id][i] : d);
  const T = { start: B.Q19b, c2: B.N34, c3: B.N36, c4: B.Q20b, c5: B.Q20, end: B.END };
  // C1
  T.pour = [B.Q19b + .1, B.Q19b + 1.8];                   // the door's light swells and pours out
  T.dev = [B.Q19b + .5, B.Q19b + 3.7];                    // gouache → 3D (3.2 s), the camera starts with it
  T.flowK = [[B.Q19b + .25, 0], [B.Q19b + 2.4, 4.6], [B.Q19b + 4.3, 10.5], [B.Q19c, 17], [B.Q19c + 3.4, 37], [B.Q19c + 6.4, 60], [B.N34 + .4, 80]];
  // C2 (N34: three pieces, N35: two)
  const n34b = pq('N34', 1, B.N34 + 2.9), n34c = pq('N34', 2, B.N34 + 6.9), n35b = pq('N35', 1, B.N35 + 4.3);
  T.give1 = [B.N34 + .5, B.N34 + 1.7, B.N34 + 2.6];      // Zacchaeus → the old man: reach, meet, back
  T.give2 = [B.N34 + 2.0, B.N34 + 3.2, B.N34 + 4.0];     // the servant → the woman (coins)
  T.give3 = [n34b + .1, n34b + 1.4, n34b + 2.2];         // the old man halves his loaf for the child (light hand to hand)
  T.give4 = [n34b + 1.2, n34b + 2.6, n34b + 3.5];        // Zacchaeus bends to the lame man
  T.lamp = [n34c + .55, n34c + 1.55, n34c + 2.3];        // the servant hands him the lamp
  T.walk = [n34c + 2.35, n35b + 1.35];                   // into alley B, to the door
  T.knock = [n35b + 1.55, n35b + 2.75];                  // three knocks
  T.open = [n35b + 3.0, B.N36 + .2];                     // the door opens on a crack of light
  // C3
  T.dis = [B.N36 - .6, B.N36 + .4];
  T.gate = [B.Q20a + .2, B.Q20a + 3.6];                  // the gate's leaves open
  T.glow = [B.Q20a + .1, B.Q20a + 6.5];                  // the light beyond rises
  T.wash = [B.Q20a + .9, B.Q20a + 10.5];                 // the warm light runs down the lane toward us
  // C4 (Q20b: hungry + thirsty / stranger)
  const q20b2 = pq('Q20b', 1, B.Q20b + 8.6);
  T.bread = [B.Q20b + .6, B.Q20b + 2.0, B.Q20b + 2.9];
  T.water = [B.Q20b + 4.6, B.Q20b + 6.0, B.Q20b + 6.9];
  T.stranger = [q20b2 - .5, q20b2 + 1.8, B.N36c - .3];     // walks to the door · let in (the camera passes each door at its meet time)   // walks to the door · let in · gone inside
  T.turn = [B.N36c + .5, B.N36c + 2.9];                  // the lamp-bearers turn to each other
  // C5
  T.thread = [B.Q20 + .3, B.Q20 + 11.5];                 // the lamps join into one line (lane A first, then the streets)
  T.rest = [B.N37 + .2, B.N37 + 4.5];                    // the light gathers on the small man
  T.bloom = [B.END - 1.25, B.END];
  return T;
}

const NOPASS = Q.has('nopass');
export async function build(W, H, B) {
  const T = beats(B), vert = H > W;
  const film = new Film({
    W, H, dur: 1e4, fov: 68.3, near: .05, far: 3000,
    atmos: { density: .016, falloff: .085, base: 0, start: 2.5, color: col('#2a3c4c', .62), colorUp: col('#1e2c3a', .5), max: 1600, scatter: 1, anisotropy: .78, phaseMix: .85 },
    bloom: { strength: .09, radius: 1.1, tint: col('#ffd6a4') },
    dof: { focus: 7, aperture: 2.2, maxCoc: 16 },
    look: { exposure: 1.78, contrast: 1.0, saturation: 1.04, lift: col('#0b151b'), shadowTint: col('#a6cad2'), highTint: col('#ffe6c4'), vignette: .3, grain: .014, ca: .12 },
  });
  Object.defineProperty(film, 'frame', { get: () => 0, set: () => {} });   // fixed dither and DOF jitter (no per-frame shimmer)
  film.canvas.style.display = 'none';
  const S = film.scene, cam = film.camera, R = film.renderer;
  const look0 = { ...film.look }, atm0 = { density: film.atmos.density, falloff: film.atmos.falloff };

  // ---------------------------------------------------------------- shared shader pieces
  const hashGLSL = `float hh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), u.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), u.x), u.y); }
    float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= .5; } return s; }`;
  // the warm light that is not a three.js light: the door lamps (a baked light map on the ground plane), hand lamps, door spills,
  // the flowing light (segments with a running front), the gate's light (a running front down lane A), the light that rests on him
  const NS = 24, ND = 10, NP = 6;
  const LM = { x0: -72, z0: -94, w: 144, d: 138, res: .25 };
  const WU = {
    uLM: { value: null }, uLMb: { value: new THREE.Vector4(LM.x0, LM.z0, LM.w, LM.d) }, uLampsOn: { value: 0 },
    uDyn: { value: Array.from({ length: ND }, () => new THREE.Vector4()) },
    uPool: { value: Array.from({ length: NP }, () => new THREE.Vector4()) }, uPoolN: { value: Array.from({ length: NP }, () => new THREE.Vector4()) },
    uSegA: { value: Array.from({ length: NS }, () => new THREE.Vector4()) }, uSegF: { value: Array.from({ length: NS }, () => new THREE.Vector4()) },
    uWarm: { value: col('#ffa458') }, uFlowC: { value: col('#ffb466') }, uGateC: { value: col('#ffc27a') },
    uGate: { value: new THREE.Vector4(0, 0, 0, 0) },   // x: intensity, y: front z (lit where z < y), z: pocket k (Sp's shade), w: —
    uGateD: { value: V(-.45, .36, -.82).normalize() },
    uRest: { value: new THREE.Vector4(0, 0, 0, 0) },   // xyz, k
    uPocket: { value: new THREE.Vector4(-5.7, .6, -20.2, 1.3) },
  };
  const WARM_GLSL = `
    uniform sampler2D uLM; uniform vec4 uLMb; uniform float uLampsOn;
    uniform vec4 uDyn[${ND}]; uniform vec4 uPool[${NP}]; uniform vec4 uPoolN[${NP}];
    uniform vec4 uSegA[${NS}]; uniform vec4 uSegF[${NS}];
    uniform vec3 uWarm, uFlowC, uGateC, uGateD; uniform vec4 uGate, uRest, uPocket;
    vec3 warmAt(vec3 P, vec3 N){
      vec3 c = vec3(0.);
      // the door lamps (baked)
      if (uLampsOn > 0.){ vec2 q = (P.xz - uLMb.xy) / uLMb.zw; if (q.x > 0. && q.x < 1. && q.y > 0. && q.y < 1.){
        float m = texture2D(uLM, q).r; c += uWarm * m * uLampsOn * exp(-max(P.y, 0.) / 1.3) * (N.y > .5 ? 1. : .8); } }
      // hand lamps and small near lights: point lights with a soft reach
      for (int i = 0; i < ${ND}; i++){ vec4 L = uDyn[i]; if (L.w <= 0.) continue; vec3 d = L.xyz - P; float r2 = dot(d, d); if (r2 > 36.) continue;
        float nl = max(dot(N, d * inversesqrt(max(r2, 1e-4))), 0.) * .8 + .2;
        c += uWarm * L.w * nl / (1. + r2 * 1.5) * (1. - smoothstep(16., 36., r2)); }
      // door spills: a soft half-disc in front of a doorway (n = the door's outward normal)
      for (int i = 0; i < ${NP}; i++){ vec4 L = uPool[i]; if (L.w <= 0.) continue; vec2 d = P.xz - L.xz; float fw = dot(d, uPoolN[i].xy), sd = dot(d, vec2(-uPoolN[i].y, uPoolN[i].x));
        float a = smoothstep(-.25, .3, fw) * exp(-fw * fw / 9. - sd * sd / max(1.2 + fw * .55, .5)) * exp(-max(P.y, 0.) / 1.6);
        c += uWarm * L.w * a * (N.y > .5 ? 1. : (abs(N.x) + abs(N.z) > .98 ? .8 : .12)); }
      // the flowing light
      float f = 0.;
      for (int i = 0; i < ${NS}; i++){ vec4 sf = uSegF[i]; if (sf.z <= 0.) continue; vec4 sa = uSegA[i];
        vec2 a = sa.xy, ab = sa.zw - sa.xy; float L = max(sf.y, 1e-3); vec2 dir = ab / L;
        float u = clamp(dot(P.xz - a, dir), -1., L + 1.); float d = length(P.xz - a - dir * clamp(u, 0., L));
        float lit = smoothstep(sf.x + .4, sf.x - 3.2, u), hx = (u - sf.x + 1.) / 1.8, head = exp(-hx * hx) * step(.05, sf.x) * step(sf.x, L - .05);
        float trail = .38 + .62 * exp(-max(sf.x - u, 0.) / 11.);   // a bright running head, a gentler warm trail behind it
        f = max(f, exp(-d * d / (sf.w * sf.w)) * (lit * trail + 1.1 * head) * sf.z); }
      c += uFlowC * f * exp(-max(P.y, 0.) / 1.25) * (N.y > .5 ? 1. : .6);
      // the gate's warm light (Q20a →): a key from the gate's side, running down the lane (lit where z < front)
      if (uGate.x > 0.){ float run = smoothstep(uGate.y + 6., uGate.y - 4., P.z); float nl = max(dot(N, uGateD), 0.) * .85 + .15 * step(.5, N.y);
        float pk = 1. - uGate.z * (1. - smoothstep(.6, 1.8, length(P - uPocket.xyz) / uPocket.w));
        float lane = 1. - smoothstep(3.6, 14., abs(P.x + 4.5)), roof = 1. - step(.7, N.y) * smoothstep(2.0, 2.7, P.y), near = .45 + .55 * exp(-max(P.z + 84., 0.) / 55.);   // it flows down lane A only; never on the roofs
        c += uGateC * uGate.x * run * nl * pk * lane * roof * near; }
      // the light that rests on the small man
      if (uRest.w > 0.){ vec3 d = uRest.xyz - P; float r2 = dot(d, d); float nl = max(dot(N, normalize(d + vec3(0., 2.5, 0.))), 0.) * .75 + .25;
        c += uFlowC * uRest.w * nl * exp(-r2 / 2.2); }
      return c; }`;
  // patch a MeshStandardMaterial: world position/normal, the warm light added to the indirect diffuse; `tex` = wall | ground | plain | room
  const ROOM = { pos: V(0, .95, -3.0), k: { value: 0 } };
  function patch(m, tex) {
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, WU, { uRoomK: ROOM.k, uRoomP: { value: ROOM.pos } });
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
        .replace('#include <project_vertex>', `#include <project_vertex>
          { vec4 w4 = vec4(transformed, 1.); vec3 wn = objectNormal;
            #ifdef USE_INSTANCING
            w4 = instanceMatrix * w4; wn = mat3(instanceMatrix) * wn;
            #endif
            vWP = (modelMatrix * w4).xyz; vWN = normalize(mat3(modelMatrix) * wn); }`);
      let fr = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform float uRoomK; uniform vec3 uRoomP;\n' + hashGLSL + WARM_GLSL);
      if (tex === 'wall') fr = fr.replace('#include <map_fragment>', `#include <map_fragment>
        { vec3 N = normalize(vWN); bool top = abs(N.y) > .7; vec2 q = top ? vWP.xz : (abs(N.x) > abs(N.z) ? vWP.zy : vWP.xy);
          float big = fb(q * .38 + 3.1), fine = fb(q * 3.3);
          vec3 c = diffuseColor.rgb * mix(.86, 1.08, big) * mix(.94, 1.04, fine);
          if (!top){ float row = floor(q.y / .115), off = mod(row, 2.) * .2, bx = fract((q.x + off) / .4), by = fract(q.y / .115);
            float joint = 1. - smoothstep(.0, .07, by) * smoothstep(1., .93, by) * smoothstep(.0, .035, bx) * smoothstep(1., .965, bx);
            float worn = smoothstep(.52, .74, fb(q * .8 + 7.)) ;
            c *= 1. - joint * worn * .2; c *= mix(1., .9 + .2 * hh(vec2(row, floor((q.x + off) / .4))), worn * .55);
            float base = 1. - smoothstep(.05, .95, vWP.y + (big - .5) * .55); c = mix(c, c * vec3(.68, .64, .6), base * .55);
            c *= 1. - .1 * smoothstep(.6, .9, fb(vec2(q.x * .6, q.y * 2.2) + 1.7)) * (1. - worn); }
          diffuseColor.rgb = c; }`);
      if (tex === 'ground') fr = fr.replace('#include <map_fragment>', `#include <map_fragment>
        { vec2 q = vWP.xz; float n = fb(q * .3), f = fb(q * 2.6); vec3 c = diffuseColor.rgb * mix(.8, 1.08, n) * mix(.92, 1.05, f);
          float pb = vn(q * 5.3 + 2.); c = mix(c, c * .66, smoothstep(.78, .86, pb) * .6); c = mix(c, c * 1.16, smoothstep(.84, .93, vn(q * 5.3 + 2.35)) * .45);
          c = mix(c, c * .86, smoothstep(.55, .8, fb(q * .9 + 4.)) * .4);
          diffuseColor.rgb = c; }`);
      fr = fr.replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        { vec3 N = normalize(vWN); reflectedLight.indirectDiffuse += diffuseColor.rgb * warmAt(vWP, N);
          ${tex === 'room' ? `{ vec3 d = uRoomP - vWP; float r2 = dot(d, d); reflectedLight.indirectDiffuse += diffuseColor.rgb * uWarm * uRoomK * (max(dot(N, normalize(d)), 0.) * .8 + .2) / (1. + r2 * .9); }` : ''} }`);
      sh.fragmentShader = fr;
    };
    m.customProgramCacheKey = () => 'noct-' + tex + (m.vertexColors ? '-vc' : '');
    return m;
  }
  const std = (hex, tex = 'plain', o = {}) => patch(new THREE.MeshStandardMaterial({ color: hex, roughness: .95, metalness: 0, ...o }), tex);

  // ---------------------------------------------------------------- light: the moon (cheated per shot to keep the faces lit) + sky
  const sky = K.sky(film, { top: col('#14222f', .62), mid: col('#1e3040', .72), horizon: col('#34505e', .9), stars: .5 });
  const hemi = new THREE.HemisphereLight(col('#4e6a80'), col('#22282c'), .82); S.add(hemi);
  const MOON = V(.45, .75, .48).normalize();
  const moonL = new THREE.DirectionalLight(col('#8ab2d0'), 1.5); moonL.castShadow = true; moonL.shadow.mapSize.set(4096, 4096);
  moonL.shadow.bias = -.0006; moonL.shadow.normalBias = .065; moonL.shadow.radius = 2.5; S.add(moonL, moonL.target);
  // the shadow frustum is FIXED per shot (never follows the camera inside a shot: no shimmer)
  const setMoon = (cx, cz, half) => { moonL.target.position.set(cx, 0, cz); moonL.position.copy(moonL.target.position).addScaledVector(MOON, 200);
    Object.assign(moonL.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 20, far: 420 }); moonL.shadow.camera.updateProjectionMatrix(); moonL.target.updateMatrixWorld(); };
  // the doorway spills that need real shadows (the door frame shapes the pool; people in it cast long shadows toward us)
  const spot = (pos, tgt) => { const l = new THREE.SpotLight(col('#ffb066'), 0, 22, 1.05, .55, 1.6); l.position.copy(pos); l.target.position.copy(tgt); l.castShadow = true;
    l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -.0008; l.shadow.normalBias = .02; l.shadow.radius = 3; l.shadow.camera.near = .25; l.shadow.camera.far = 24; S.add(l, l.target); return l; };
  const doorSpot = spot(V(0, 1.55, -1.5), V(0, 0, 5.5));
  const knockSpot = spot(V(7.6, 1.45, -3.5), V(2.0, .0, -3.0));

  // ---------------------------------------------------------------- the town plan (metres; −z = north toward the gate)
  // streets as rects [x0, x1, z0, z1]; houses pack the rest of the ground (greedy on a 0.5 m grid), special houses first
  const ST = {
    SQ: [-12, 12, 0, 14], LAs: [-6.2, -2.8, -28, 0], LAw: [-7.6, -1.4, -52, -28], LAn: [-6.2, -2.8, -84, -52], LB: [3.2, 6.0, -26, 0], LBx: [6.0, 18, -26, -23],
    A1: [-46, -6.2, -14.4, -11.6], A2: [-2.8, 40, -62, -59], A3: [-52, -6.2, -70, -67], R1: [6, 66, -36, -33], R2: [-66, -7.6, -44, -41],
    SE: [16, 20, -84, 40], SW: [-32, -28, -84, 40], SS: [-66, 66, 26, 30], SQw: [-28, -12, 5, 9], SQe: [12, 16, 5, 9], FE: [44, 48, -84, 40], FW: [-56, -52, -84, 40],
    NN: [-66, 66, -80, -77.5],
  };
  const NN = ST.NN; ST.NNw = [-66, -6.2, NN[2], NN[3]]; ST.NNe = [-2.8, 66, NN[2], NN[3]]; delete ST.NN;
  const GX0 = -70, GZ0 = -84, GXN = 280, GZN = 248, GR = .5;   // grid: x −70..70, z −84..40
  const occ = new Uint8Array(GXN * GZN);
  const cell = (x, z) => [Math.floor((x - GX0) / GR), Math.floor((z - GZ0) / GR)];
  const markRect = (r, v) => { const [a, c] = cell(r[0] + 1e-3, r[2] + 1e-3), [b, d] = cell(r[1] - 1e-3, r[3] - 1e-3);
    for (let j = Math.max(0, c); j <= Math.min(GZN - 1, d); j++) for (let i = Math.max(0, a); i <= Math.min(GXN - 1, b); i++) occ[j * GXN + i] = v; };
  for (const k in ST) markRect(ST[k], 1);
  const isStreet = (x, z) => { const [i, j] = cell(x, z); if (i < 0 || j < 0 || i >= GXN || j >= GZN) return false; return occ[j * GXN + i] === 1; };
  const RH = rng(7303);
  const HOUSES = [];
  const SPECIAL = {
    Z: { x0: -2.8, x1: 3.2, z0: -8, z1: 0, h: 3.5 },
    KN: { x0: 6.0, x1: 11.5, z0: -7, z1: 0, h: 3.3 },
    E1: { x0: -1.4, x1: 4.6, z0: -35, z1: -29.4, h: 3.4 }, E2: { x0: -1.4, x1: 4.2, z0: -41, z1: -35, h: 3.2 }, E3: { x0: -1.4, x1: 4.8, z0: -47.2, z1: -41, h: 3.6 },
    SP: { x0: -12, x1: -6.2, z0: -24, z1: -16.6, h: 3.2 },
  };
  for (const k in SPECIAL) { const s = SPECIAL[k]; markRect([s.x0, s.x1, s.z0, s.z1], 2); }
  for (let j = 0; j < GZN; j++) for (let i = 0; i < GXN; i++) {
    if (occ[j * GXN + i]) continue;
    let w = Math.round((4.5 + RH() * 4.5) / GR), d = Math.round((4.5 + RH() * 4.5) / GR);
    const fits = (w, d) => { if (i + w > GXN || j + d > GZN) return false; for (let b = j; b < j + d; b++) for (let a = i; a < i + w; a++) if (occ[b * GXN + a]) return false; return true; };
    // grow as far as it fits (shrink the bigger side first)
    let guard = 40; while (!fits(w, d) && guard--) { if (w >= d && w > 1) w--; else if (d > 1) d--; else break; }
    if (!fits(w, d)) { occ[j * GXN + i] = 3; continue; }
    for (let b = j; b < j + d; b++) for (let a = i; a < i + w; a++) occ[b * GXN + a] = 2;
    const x0 = GX0 + i * GR, z0 = GZ0 + j * GR, x1 = x0 + w * GR, z1 = z0 + d * GR;
    if (w * GR < 2.6 || d * GR < 2.6) { HOUSES.push({ x0, x1, z0, z1, h: .9 + RH() * .5, yard: true }); continue; }   // a low yard wall
    const tall = RH() < .12;
    HOUSES.push({ x0, x1, z0, z1, h: tall ? 5.4 + RH() * 1.2 : 2.8 + RH() * 1.3 });
  }

  // ---------------------------------------------------------------- geometry (merged by material)
  const parts = { wall: [], wood: [], dark: [], glow: [], clay: [] };   // [geometry, matrix, colour]
  const mtx = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(sx, sy, sz));
  const boxG = new THREE.BoxGeometry(1, 1, 1), cylG = new THREE.CylinderGeometry(1, 1, 1, 6);
  const RBC = new Map(); const rbox = (w, h, d, r) => { const k = [w, h, d, r].map(v => v.toFixed(2)).join(','); if (!RBC.has(k)) RBC.set(k, K.roundedBox(w, h, d, r, 1)); return RBC.get(k); };
  const WALLC = ['#b8a387', '#a89277', '#c2ae92', '#b09a7c', '#9e8a70', '#bba88e'];
  const addBox = (list, x0, x1, y0, y1, z0, z1, c, r = 0) => { const w = x1 - x0, h = y1 - y0, d = z1 - z0; if (w <= 0 || h <= 0 || d <= 0) return;
    list.push([r > 0 ? rbox(w, h, d, Math.min(r, w / 2 - .01, h / 2 - .01, d / 2 - .01)) : boxG, r > 0 ? mtx((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2) : mtx((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, 0, w, h, d), c]); };
  // a door on a face: n = outward normal (±x or ±z); centre (cx, cz) on the face line; returns the door record
  const DOORS = [], WINS = [];
  // glow quads carry an index (aIdx) into a small texture of intensities (doors 0.., windows 1000..)
  const glowParts = [];
  const quad = (cx, cy, cz, n, w, h, idx, cBot = 1, cTop = .55) => {   // a plane on a face, facing n, with a vertical gradient
    const g = new THREE.PlaneGeometry(w, h); const ry = Math.atan2(n[0], n[1]);
    g.applyMatrix4(mtx(cx, cy, cz, ry)); const c = new Float32Array(g.attributes.position.count * 3), id = new Float32Array(g.attributes.position.count);
    for (let i = 0; i < g.attributes.position.count; i++) { const k = g.attributes.position.getY(i) > cy ? cTop : cBot; c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = k; id[i] = idx; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.setAttribute('aIdx', new THREE.BufferAttribute(id, 1)); glowParts.push(g); };
  function door(cx, cz, n, { w = .82, h = 1.85, lamp = true, open = false, tag = null } = {}) {
    const ry = Math.atan2(n[0], n[1]), ox = n[0] * .012, oz = n[1] * .012;
    const leaf = new THREE.PlaneGeometry(w, h); parts.wood.push([leaf, mtx(cx + ox, h / 2, cz + oz, ry), RH() < .5 ? '#5a4432' : '#4a3828']);
    // the lintel beam and the threshold stone
    const tx = -n[1], tz = n[0];
    parts.wood.push([boxG, new THREE.Matrix4().compose(V(cx + n[0] * .06, h + .09, cz + n[1] * .06), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(w + .42, .17, .2)), '#4e3a2a']);
    parts.wall.push([boxG, new THREE.Matrix4().compose(V(cx + n[0] * .16, .04, cz + n[1] * .16), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(w + .3, .08, .34)), '#8a7c68']);
    const d = { i: DOORS.length, cx, cz, n, w, h, tx, tz, lamp, open, tag, lit: 0 };
    quad(cx + n[0] * .02, h / 2, cz + n[1] * .02, n, w * .96, h * .97, d.i, 1, .62);
    DOORS.push(d); return d; }
  function windowOn(cx, cy, cz, n, lit) { const ry = Math.atan2(n[0], n[1]); parts.dark.push([new THREE.PlaneGeometry(.46, .5), mtx(cx + n[0] * .012, cy, cz + n[1] * .012, ry), '#1a1410']);
    const w = { i: WINS.length, cx, cy, cz, n, lit }; quad(cx + n[0] * .02, cy, cz + n[1] * .02, n, .42, .46, 1000 + w.i, .9, .8); WINS.push(w); }
  // street contact along a face: sample every 0.5 m just outside it
  const faceRuns = (h) => { const F = [];
    const sides = [[h.x0, h.z0, h.x0, h.z1, [-1, 0]], [h.x1, h.z0, h.x1, h.z1, [1, 0]], [h.x0, h.z0, h.x1, h.z0, [0, -1]], [h.x0, h.z1, h.x1, h.z1, [0, 1]]];
    for (const [ax, az, bx, bz, n] of sides) { const L = Math.hypot(bx - ax, bz - az), m = Math.floor(L / .5); let run = null, best = null;
      for (let k = 0; k < m; k++) { const u = (k + .5) * .5, x = ax + (bx - ax) * u / L + n[0] * .3, z = az + (bz - az) * u / L + n[1] * .3;
        if (isStreet(x, z)) { if (!run) run = [u, u]; else run[1] = u; } else { if (run && (!best || run[1] - run[0] > best[1] - best[0])) best = run; run = null; } }
      if (run && (!best || run[1] - run[0] > best[1] - best[0])) best = run;
      if (best && best[1] - best[0] >= 1.4) F.push({ ax, az, bx, bz, n, L, a: best[0], b: best[1] }); }
    return F; };
  function house(h, c) {
    const top = h.h;
    addBox(parts.wall, h.x0, h.x1, 0, top, h.z0, h.z1, c, h.yard ? .1 : .2);
    if (h.yard) return;
    const pt = .2, ph = .38;   // the parapet round the flat roof
    addBox(parts.wall, h.x0, h.x1, top, top + ph, h.z0, h.z0 + pt, c, .05); addBox(parts.wall, h.x0, h.x1, top, top + ph, h.z1 - pt, h.z1, c, .05);
    addBox(parts.wall, h.x0, h.x0 + pt, top, top + ph, h.z0 + pt, h.z1 - pt, c, .05); addBox(parts.wall, h.x1 - pt, h.x1, top, top + ph, h.z0 + pt, h.z1 - pt, c, .05);
    if (!h.noRoom && RH() < .4 && h.x1 - h.x0 > 4 && h.z1 - h.z0 > 4) {   // a room on the roof, set back
      const rw = (h.x1 - h.x0) * (.4 + RH() * .2), rd = (h.z1 - h.z0) * (.4 + RH() * .2), rx = h.x0 + .3 + RH() * (h.x1 - h.x0 - rw - .6), rz = h.z0 + .3 + RH() * (h.z1 - h.z0 - rd - .6);
      addBox(parts.wall, rx, rx + rw, top, top + 2.1, rz, rz + rd, c, .08); addBox(parts.wall, rx - .05, rx + rw + .05, top + 2.1, top + 2.26, rz - .05, rz + rd + .05, '#9a8a74', .03);
      if (RH() < .25) WINS.length < 900 && windowOn(rx + rw / 2, top + 1.3, rz + rd + .0, [0, 1], RH() < .5); }
    { const n = (RH() * 3.2) | 0; for (let k = 0; k < n; k++) { const x = h.x0 + .6 + RH() * Math.max(.1, h.x1 - h.x0 - 1.2), z = h.z0 + .6 + RH() * Math.max(.1, h.z1 - h.z0 - 1.2), kind = RH();
      if (kind < .45) { const r = .16 + RH() * .12, hh = .35 + RH() * .3; parts.wall.push([cylG, mtx(x, top + hh / 2, z, 0, r, hh, r), RH() < .5 ? '#8a6448' : '#9c7a58']); }
      else if (kind < .8) addBox(parts.wood, x - .55, x + .55, top, top + .05, z - .4, z + .4, RH() < .5 ? '#6e5236' : '#7c6644');
      else addBox(parts.wood, x - .4, x + .4, top, top + .28, z - .25, z + .25, '#8c7a50', .06); } }
    { const kind = RH(), w = h.x1 - h.x0, d = h.z1 - h.z0;
      if (kind < .16 && w > 3.5) {   // a palm-mat awning on four poles
        const x = h.x0 + .5 + RH() * (w - 2.6), z = h.z0 + .5 + RH() * Math.max(.1, d - 2.4);
        for (const [px, pz] of [[0, 0], [1.9, 0], [0, 1.6], [1.9, 1.6]]) parts.wood.push([cylG, mtx(x + px, top + .85, z + pz, 0, .035, 1.7, .035), '#3e3024']);
        addBox(parts.wood, x - .15, x + 2.05, top + 1.7, top + 1.76, z - .15, z + 1.75, '#7a6a48'); }
      else if (kind < .3 && w > 3) {   // a clothesline between two poles, three cloths hanging still
        const z = h.z0 + .6 + RH() * Math.max(.1, d - 1.2), x0 = h.x0 + .4, x1 = h.x1 - .4;
        for (const px of [x0, x1]) parts.wood.push([cylG, mtx(px, top + .8, z, 0, .03, 1.6, .03), '#3e3024']);
        parts.wood.push([cylG, new THREE.Matrix4().compose(V((x0 + x1) / 2, top + 1.55, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)), V(.01, x1 - x0, .01)), '#2a2420']);
        for (let k = 0; k < 3; k++) { const cx = lerp(x0, x1, .2 + .3 * k + RH() * .08); addBox(parts.wall, cx - .3, cx + .3, top + .85, top + 1.53, z - .01, z + .01, ['#a8846a', '#6e7c8a', '#b0a088', '#8a5a4a'][(RH() * 4) | 0]); } }
      else if (kind < .45) {   // stairs up the outside of a wall to the roof
        const sd = RH() < .5 ? 0 : 1, n = Math.max(4, Math.round(top / .3)), run = Math.min(w - .4, n * .32);
        for (let k = 0; k < n; k++) { const y1 = top * (k + 1) / n, xx = sd ? h.x1 - .2 - (k + 1) * run / n : h.x0 + .2 + k * run / n;
          addBox(parts.wall, xx, xx + run / n + .02, 0, y1, sd ? h.z1 : h.z0 - .62, sd ? h.z1 + .62 : h.z0, c, .03); } } }
    // beam ends under the roof on the street faces, doors, windows
    const F = faceRuns(h); if (h.noDoor) return F;
    F.sort((a, b) => (b.b - b.a) - (a.b - a.a));
    F.forEach((f, k) => {
      const tx = (f.bx - f.ax) / f.L, tz = (f.bz - f.az) / f.L, ry = Math.atan2(f.n[0], f.n[1]);
      for (let u = .35; u < f.L - .2; u += .62) parts.wood.push([cylG, new THREE.Matrix4().compose(V(f.ax + tx * u + f.n[0] * .1, top - .22, f.az + tz * u + f.n[1] * .1), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, ry, 0, 'YXZ')), V(.075, .22, .075)), '#3e2e22']);
      // a door on the main face; every face on the lanes we walk (lane A, alley B, the square) gets one too
      const mx = (f.ax + f.bx) / 2 + f.n[0] * .6, mz = (f.az + f.bz) / 2 + f.n[1] * .6, inR = r => mx > r[0] && mx < r[1] && mz > r[2] && mz < r[3];
      const lane = [ST.LAs, ST.LAw, ST.LAn, ST.LB, ST.SQ].some(inR);
      if (k === 0 || lane || (k === 1 && RH() < .3)) { const u = f.a + .6 + RH() * Math.max(0, f.b - f.a - 1.2); door(f.ax + tx * u, f.az + tz * u, f.n, { w: .78 + RH() * .14, h: 1.75 + RH() * .2 }); }
      if (RH() < .55) { const u = f.a + RH() * (f.b - f.a); windowOn(f.ax + tx * u, Math.min(top - .75, 2.25 + RH() * .3), f.az + tz * u, f.n, RH() < .14); }
    });
    return F;
  }
  for (const h of HOUSES) house(h, WALLC[(RH() * WALLC.length) | 0]);

  // ---------------------------------------------------------------- the special houses (real openings, rooms behind them)
  const roomM = std('#a88e72', 'room', { vertexColors: false }), roomDark = std('#6a5240', 'room');
  const roomParts = [];
  // a front wall with an opening: face on the plane `fix` of axis ('z' or 'x'), the wall going inward by `th`; the opening [o0, o1] × [0, oh]
  function wallWithOpening(axis, fix, inward, a0, a1, top, o0, o1, oh, c) {
    const th = .45 * inward;
    if (axis === 'z') { const z0 = Math.min(fix, fix + th), z1 = Math.max(fix, fix + th);
      addBox(parts.wall, a0, o0, 0, top, z0, z1, c, .06); addBox(parts.wall, o1, a1, 0, top, z0, z1, c, .06); addBox(parts.wall, o0, o1, oh, top, z0, z1, c, .04); }
    else { const x0 = Math.min(fix, fix + th), x1 = Math.max(fix, fix + th);
      addBox(parts.wall, x0, x1, 0, top, a0, o0, c, .06); addBox(parts.wall, x0, x1, 0, top, o1, a1, c, .06); addBox(parts.wall, x0, x1, oh, top, o0, o1, c, .04); } }
  const roomBox = (x0, x1, z0, z1, hgt) => { // the inside: floor, walls, ceiling (seen through the door), drawn with the room material
    const g = []; const add = (a, b, c2, d, e, f) => { const w = b - a, hh = d - c2, dd = f - e; const m = new THREE.Mesh(boxG, roomM); m.scale.set(w, hh, dd); m.position.set((a + b) / 2, (c2 + d) / 2, (e + f) / 2); m.receiveShadow = true; S.add(m); g.push(m); };
    add(x0, x1, -.02, .01, z0, z1); add(x0, x1, hgt, hgt + .05, z0, z1); return g; };
  // --- Zacchaeus's house: the flat-on front (handoff.md), the door centred, a lamp on a table inside, a room on the roof
  const ZC = '#b4a084';
  { const s = SPECIAL.Z;
    wallWithOpening('z', 0, -1, s.x0, s.x1, s.h, -.32, .32, 1.9, ZC);
    addBox(parts.wall, s.x0, s.x0 + .45, 0, s.h, s.z0, -.45, ZC, .06); addBox(parts.wall, s.x1 - .45, s.x1, 0, s.h, s.z0, -.45, ZC, .06); addBox(parts.wall, s.x0, s.x1, 0, s.h, s.z0, s.z0 + .45, ZC, .06);
    addBox(parts.wall, s.x0, s.x1, s.h - .2, s.h, s.z0, 0, ZC, .04);
    // parapet, beam ends, the roof room with its lit window
    addBox(parts.wall, s.x0, s.x1, s.h, s.h + .4, -.22, 0, ZC, .05); addBox(parts.wall, s.x0, s.x0 + .22, s.h, s.h + .4, s.z0, 0, ZC, .05); addBox(parts.wall, s.x1 - .22, s.x1, s.h, s.h + .4, s.z0, 0, ZC, .05);
    addBox(parts.wall, .7, 3.2, s.h, s.h + 2.0, -6.4, -2.4, '#ad9a7e', .08); addBox(parts.wall, .65, 3.25, s.h + 2.0, s.h + 2.15, -6.45, -2.35, '#9a8a74', .03);
    windowOn(2.15, s.h + 1.15, -2.4, [0, 1], true);
    for (let x = s.x0 + .3; x < s.x1 - .1; x += .55) parts.wood.push([cylG, new THREE.Matrix4().compose(V(x, s.h - .25, .1), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), V(.075, .22, .075)), '#3e2e22']);
    parts.wood.push([boxG, mtx(0, 1.99, .06, 0, 1.05, .18, .2), '#4a3626']);   // lintel
    parts.wall.push([boxG, mtx(0, .04, .2, 0, .95, .08, .36), '#8a7c68']);      // threshold
    // the ledge beside the door where the lamp stands (Zacchaeus takes it up on N34)
    addBox(parts.wall, -.98, -.48, 1.02, 1.1, 0, .16, '#9c8a72', .02);
    windowOn(1.85, 2.3, 0, [0, 1], false);
    roomBox(-2.35, 2.75, -7.55, -.45, s.h - .2);
    // the table and its lamp, jars, a shelf, a hanging cloth (only a slice shows through the door)
    const tb = new THREE.Mesh(boxG, roomDark); tb.scale.set(1.0, .07, .62); tb.position.set(.15, .72, -3.0); S.add(tb);
    for (const [x, z] of [[-.28, -2.75], [.58, -2.75], [-.28, -3.25], [.58, -3.25]]) { const l = new THREE.Mesh(boxG, roomDark); l.scale.set(.06, .7, .06); l.position.set(x, .35, z); S.add(l); }
    for (const [x, z, r, hh] of [[-1.3, -6.9, .22, .7], [-.9, -7.05, .18, .55], [1.6, -6.95, .25, .8]]) { const j = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), roomDark); j.scale.set(1, hh / r / 2, 1); j.position.set(x, hh / 2, z); S.add(j); }
    const shelf = new THREE.Mesh(boxG, roomDark); shelf.scale.set(1.6, .06, .3); shelf.position.set(.1, 1.55, -7.35); S.add(shelf);
    // the open door leaf (inward, hinged at the left jamb)
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(.64, 1.86, .05), std('#5a4432')); leaf.geometry.translate(.32, .93, 0); leaf.position.set(-.32, 0, -.47); leaf.rotation.y = 1.25; leaf.castShadow = true; S.add(leaf);
  }
  // --- the house in alley B whose door Zacchaeus knocks at (door on its west face x = 6.0, at z = −3.5)
  const KNOCK = { x: 6.0, z: -3.5, leaf: null };
  { const s = SPECIAL.KN, c = '#a99378';
    wallWithOpening('x', 6.0, 1, s.z0, s.z1, s.h, -3.82, -3.18, 1.85, c);
    addBox(parts.wall, 6.0, s.x1, 0, s.h, s.z1 - .45, s.z1, c, .06); addBox(parts.wall, s.x1 - .45, s.x1, 0, s.h, s.z0, s.z1, c, .06); addBox(parts.wall, 6.0, s.x1, 0, s.h, s.z0, s.z0 + .45, c, .06);
    addBox(parts.wall, 6.0, s.x1, s.h - .2, s.h, s.z0, s.z1, c, .04); addBox(parts.wall, 6.0, s.x1, s.h, s.h + .38, s.z1 - .2, s.z1, c, .05); addBox(parts.wall, 6.0, 6.2, s.h, s.h + .38, s.z0, s.z1, c, .05);
    parts.wood.push([boxG, mtx(5.94, 1.94, -3.5, Math.PI / 2, 1.05, .17, .2), '#4a3626']); parts.wall.push([boxG, mtx(5.84, .04, -3.5, Math.PI / 2, .95, .08, .34), '#8a7c68']);
    const g = roomBox(6.45, s.x1 - .45, s.z0 + .45, s.z1 - .45, s.h - .2);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.84, .64), std('#4e3a2a')); leaf.geometry.translate(0, .92, -.32); leaf.position.set(6.24, 0, -3.18); leaf.castShadow = true; S.add(leaf); KNOCK.leaf = leaf;
    for (const f of faceRuns(s)) if (f.n[1] === 1) { door(8.8, 0, [0, 1], { lamp: true }); }
  }
  // --- the three doors of Matthew 25 (east side of the street of doors, faces x = −1.4 toward −x), each open on a lit room
  const EV = {}; const LAMPS_X = [];   // extra door lamps (the special houses)
  for (const [k, zc, c] of [['E1', -32.2, '#b09a7e'], ['E2', -38.0, '#a8927a'], ['E3', -44.1, '#b6a286']]) { const s = SPECIAL[k];
    wallWithOpening('x', -1.4, 1, s.z0, s.z1, s.h, zc - .44, zc + .44, 1.95, c);
    addBox(parts.wall, -1.4, s.x1, 0, s.h, s.z0, s.z0 + .45, c, .06); addBox(parts.wall, -1.4, s.x1, 0, s.h, s.z1 - .45, s.z1, c, .06); addBox(parts.wall, s.x1 - .45, s.x1, 0, s.h, s.z0, s.z1, c, .06);
    addBox(parts.wall, -1.4, s.x1, s.h - .2, s.h, s.z0, s.z1, c, .04);
    addBox(parts.wall, -1.4, -1.2, s.h, s.h + .38, s.z0, s.z1, c, .05); addBox(parts.wall, -1.4, s.x1, s.h, s.h + .38, s.z0, s.z0 + .2, c, .05);
    for (let z = s.z0 + .3; z < s.z1 - .1; z += .6) parts.wood.push([cylG, new THREE.Matrix4().compose(V(-1.5, s.h - .24, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)), V(.075, .22, .075)), '#3e2e22']);
    parts.wood.push([boxG, mtx(-1.46, 2.04, zc, Math.PI / 2, 1.3, .17, .2), '#4a3626']); parts.wall.push([boxG, mtx(-1.56, .04, zc, Math.PI / 2, 1.2, .08, .34), '#8a7c68']);
    roomBox(-.95, s.x1 - .45, s.z0 + .45, s.z1 - .45, s.h - .2);
    const back = new THREE.Mesh(boxG, roomDark); back.scale.set(.5, .8, .5); back.position.set(s.x1 - 1.2, .4, zc + .6); S.add(back);   // a chest inside
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.92, .86), std('#5a4432')); leaf.geometry.translate(0, .96, -.43); leaf.position.set(-.85, 0, zc + .44); leaf.rotation.y = k === 'E3' ? 0 : -1.3; leaf.castShadow = true; S.add(leaf);
    EV[k] = { z: zc, leaf, lamp: null }; windowOn(-1.4, 2.45, zc + 1.6, [-1, 0], k === 'E2'); windowOn(-1.4, 2.35, zc - 1.9, [-1, 0], k !== 'E2');
    parts.dark.push([new THREE.PlaneGeometry(.5, .62), mtx(-1.412, 1.25, zc + 2.3, -Math.PI / 2), '#2a2018']);                 // a niche
    parts.wall.push([cylG, mtx(-1.62, .26, zc + 2.3, 0, .1, .2, .1), '#9a6e4a']);                                               // its small jar
    for (const dz of [-.78, .82]) parts.wall.push([cylG, mtx(-1.66, .3, zc + dz, 0, .19, .6, .19), '#8a6448']);                // jars by the door
    addBox(parts.wall, -1.95, -1.42, 0, .42, zc - 2.9, zc - 2.0, '#8e806a', .05);                                              // a stone bench
    { const rug = new THREE.PlaneGeometry(.9, 1.3); const cc = ['#7a3a2a', '#3e4a6a', '#6a5a2a'][(zc | 0) % 3 < 0 ? 0 : 1]; parts.dark.push([rug, mtx(-1.41, 2.0, zc - 3.6 + (k === 'E3' ? 7 : 0), -Math.PI / 2), cc]); }
    for (const dz of [-.62, .62]) LAMPS_X.push({ x: -1.75, y: .13, z: zc + dz }); }
  // --- the small man's house (lane A, west side): his door has no lamp
  { const s = SPECIAL.SP; const F = house({ ...s, noRoom: true, noDoor: true }, '#a6907a');
    door(-6.2, -20.2, [1, 0], { lamp: false, tag: 'sp' }); }
  // the low walls of the square's foreground (handoff.md: the opening frame)
  addBox(parts.wall, -2.3, -.62, 0, .82, 4.4, 4.75, '#a8947a', .06); addBox(parts.wall, .62, 2.3, 0, .78, 4.5, 4.85, '#a8947a', .06);
  for (const [x0, x1, z0, z1, h] of [[.74, 1.18, .8, 1.16, .36], [-3.38, -2.9, -13.45, -12.95, .3], [-2.86, -2.36, -38.25, -37.55, .42], [-6.08, -5.5, -20.6, -19.8, .24]]) addBox(parts.wall, x0, x1, 0, h - .02, z0, z1, '#8a7e6c', .04);
  // --- the town wall and the gate at the north end of lane A
  const GATE = { z: -84, leaves: [] };
  { const c = '#9c8a72'; addBox(parts.wall, -72, -6.2, 0, 6.5, -86.2, -84, c, .1); addBox(parts.wall, -2.8, 72, 0, 6.5, -86.2, -84, c, .1); addBox(parts.wall, -6.2, -2.8, 4.3, 6.5, -86.2, -84, c, .06);
    for (const x of [-8.0, -1.0]) { const tw = new THREE.CylinderGeometry(2.1, 2.3, 8.2, 16); parts.wall.push([tw, mtx(x, 4.1, -85.1), c]); }
    for (let x = -70; x < 70; x += 1.6) if (x < -10 || x > 1) addBox(parts.wall, x, x + .8, 6.5, 7.1, -86.2, -85.6, c, .04);   // merlons
    for (const [hx, sd] of [[-6.2, 1], [-2.8, -1]]) { const lf = new THREE.Mesh(new THREE.BoxGeometry(1.7, 4.2, .12), std('#4a3828')); lf.geometry.translate(sd * .85, 2.1, 0); lf.position.set(hx, 0, -85.1); lf.castShadow = true; S.add(lf); GATE.leaves.push({ m: lf, sd }); } }
  // beyond the gate: open land, and the light that waits there (a warm glowing sky low on the horizon, dark until Q20a)
  const gateGlowM = new THREE.MeshBasicMaterial({ color: col('#ffc27a', 0), fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending });
  { const g = new THREE.PlaneGeometry(260, 110); const p = g.attributes.position, c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i), k = Math.exp(-Math.pow((y + 40) / 34, 2)) * Math.exp(-Math.pow(x / 110, 2)); c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = k; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); gateGlowM.vertexColors = true; const m = new THREE.Mesh(g, gateGlowM); m.position.set(-4.5, 40, -300); m.renderOrder = -5; S.add(m); }

  // ---------------------------------------------------------------- lamps at the doors (C3 →): a small clay lamp on the threshold
  const LAMPS = [];
  for (const L of LAMPS_X) LAMPS.push({ ...L, d: { n: [-1, 0], tx: 0, tz: 1 } });
  for (const d of DOORS) { if (!d.lamp) continue; const sd = (d.i % 2) ? 1 : -1, x = d.cx + d.n[0] * .38 + d.tx * sd * .62, z = d.cz + d.n[1] * .38 + d.tz * sd * .62;
    if (!isStreet(x, z) && !(x > -12 && x < 12 && z > 0 && z < 14)) continue;
    LAMPS.push({ x, y: .13, z, d }); }
  const lampG = (() => { const g = new THREE.SphereGeometry(.075, 10, 6); g.scale(1, .45, 1.25); const sp = new THREE.CylinderGeometry(.02, .03, .07, 6); sp.rotateX(Math.PI / 2); sp.translate(0, .01, -.09); return K.mergeGeometries([[g], [sp]]); })();
  for (const L of LAMPS) parts.clay.push([lampG, mtx(L.x, .05, L.z, Math.atan2(L.d.n[0], L.d.n[1])), '#9a6e4a']);
  // the light map of every door lamp on the ground (static; uLampsOn switches it per shot)
  { const nx = Math.round(LM.w / LM.res), nz = Math.round(LM.d / LM.res), A = new Float32Array(nx * nz);
    const stamp = (x, z, k, r) => { const i0 = Math.floor((x - r - LM.x0) / LM.res), i1 = Math.ceil((x + r - LM.x0) / LM.res), j0 = Math.floor((z - r - LM.z0) / LM.res), j1 = Math.ceil((z + r - LM.z0) / LM.res);
      for (let j = Math.max(0, j0); j <= Math.min(nz - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(nx - 1, i1); i++) { const px = LM.x0 + (i + .5) * LM.res, pz = LM.z0 + (j + .5) * LM.res, r2 = (px - x) ** 2 + (pz - z) ** 2;
        if (r2 < r * r) A[j * nx + i] += k / (1 + r2 * 2.2) * (1 - ss(r * r * .45, r * r, r2)); } };
    for (const L of LAMPS) stamp(L.x, L.z, 1.6, 4.0);
    const hf = new Uint16Array(nx * nz); for (let i = 0; i < hf.length; i++) hf[i] = THREE.DataUtils.toHalfFloat(A[i]);
    const tex = new THREE.DataTexture(hf, nx, nz, THREE.RedFormat, THREE.HalfFloatType); tex.magFilter = tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true; WU.uLM.value = tex; }

  // ---------------------------------------------------------------- merged meshes
  const wallM = std('#ffffff', 'wall', { vertexColors: true }), woodM = std('#ffffff', 'plain', { vertexColors: true, roughness: .9 }), darkM = std('#ffffff', 'plain', { vertexColors: true });
  const clayM = std('#ffffff', 'plain', { vertexColors: true });
  const merged = (list, m) => { if (!list.length) return null; const mesh = new THREE.Mesh(K.mergeGeometries(list), m); mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false; S.add(mesh); return mesh; };
  merged(parts.wall, wallM); merged(parts.wood, woodM); merged(parts.dark, darkM); const clayMesh = merged(parts.clay, clayM);
  // glow quads: additive warm light on doors/windows, intensity per index from a small texture
  const NG = 2048, gk = new Float32Array(NG * 4), gTex = new THREE.DataTexture(gk, NG, 1, THREE.RGBAFormat, THREE.FloatType); gTex.needsUpdate = true;
  const glowM = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: col('#ffffff') });
  glowM.onBeforeCompile = sh => { sh.uniforms.tK = { value: gTex }; sh.uniforms.uGlowC = { value: col('#ffa450', 2.4) };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aIdx; varying float vK; uniform sampler2D tK;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvK = texture2D(tK, vec2((aIdx + .5) / 2048., .5)).r;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vK; uniform vec3 uGlowC;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= uGlowC * vK;'); };
  glowM.customProgramCacheKey = () => 'noct-glow';
  { // merged by hand (kit's mergeGeometries drops aIdx)
    let n = 0; for (const p of glowParts) n += p.index ? p.index.count : p.attributes.position.count;
    const pos = new Float32Array(n * 3), c = new Float32Array(n * 3), id = new Float32Array(n); let o = 0;
    for (const p of glowParts) { const q = p.index ? p.toNonIndexed() : p; const m = q.attributes.position.count; pos.set(q.attributes.position.array, o * 3); c.set(q.attributes.color.array, o * 3); id.set(q.attributes.aIdx.array, o); o += m; }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); gg.setAttribute('color', new THREE.BufferAttribute(c, 3)); gg.setAttribute('aIdx', new THREE.BufferAttribute(id, 1));
    const m = new THREE.Mesh(gg, glowM); m.frustumCulled = false; m.renderOrder = 2; S.add(m); }
  const setGlow = (idx, k) => { gk[idx * 4] = k; };

  // ---------------------------------------------------------------- ground (one plane; the warm light and the light map run in its shader)
  const groundM = std('#8e7f6a', 'ground');
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400, 1, 1), groundM); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; S.add(ground);
  // far hills in the west and the wilderness beyond the gate (low silhouettes in the haze)
  { const hm = std('#4a5458');
    for (let i = 0; i < 12; i++) { const r = rng(90 + i), g = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), m = new THREE.Mesh(g, hm);
      const a = (i / 12) * Math.PI * 2, dist = 420 + r() * 220; m.scale.set(120 + r() * 140, 22 + r() * 30, 80 + r() * 60); m.position.set(Math.cos(a) * dist, -6, Math.sin(a) * dist - 40); m.rotation.y = -a; S.add(m); } }

  // ---------------------------------------------------------------- palms (Jericho, the city of palms): trunk + a crown of leaflets
  const palmParts = [], trunkParts = [];
  const RP = rng(4417);
  function palm(x, z, h, lean = 0) {
    const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(V(x + Math.sin(lean) * h * u * u * .35, h * u, z + Math.cos(lean) * h * u * u * .12)); }
    const curve = new THREE.CatmullRomCurve3(pts); trunkParts.push([new THREE.TubeGeometry(curve, 10, .2, 6), null, '#3a3028']);
    const top = pts[8]; const nF = 15;
    for (let f = 0; f < nF; f++) { const az = f / nF * Math.PI * 2 + RP() * .3, up = .55 - RP() * 1.0, len = 2.6 + RP() * 1.1;
      // the rachis bends down; leaflets along it on both sides (thin triangles)
      const P0 = []; for (let k = 0; k <= 10; k++) { const u = k / 10, a = up - u * u * 1.5; P0.push(V(top.x + Math.cos(az) * Math.cos(a) * len * u, top.y + Math.sin(a) * len * u * .9, top.z + Math.sin(az) * Math.cos(a) * len * u)); }
      const pos = [];
      for (let k = 1; k < 10; k++) { const p = P0[k], q = P0[k + 1], dir = q.clone().sub(p).normalize(), side = V(-Math.sin(az), 0, Math.cos(az)), ll = .55 * Math.sin(Math.PI * k / 10) + .12;
        for (const sd of [-1, 1]) for (const fr of [0, .5]) { const a = p.clone().lerp(q, fr), b = a.clone().addScaledVector(dir, .07), tip = a.clone().addScaledVector(side, sd * ll).addScaledVector(V(0, -1, 0), ll * .55).addScaledVector(dir, .2);
          pos.push(a.x, a.y, a.z, b.x, b.y, b.z, tip.x, tip.y, tip.z); } }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); palmParts.push([g, null, '#3c4a36']); } }
  for (const [x, z, h, l] of [[2.4, -11.5, 11.5, .4], [9.0, -15, 9.5, -.6], [-14, 18, 10, .3], [10.5, 17.5, 12, -.4], [-24, -30, 11, .8], [24, -50, 10, -.2], [-36, -58, 12.5, .4],
    [30, 8, 11, .1], [-44, 6, 10, -.5], [52, -20, 12, .6], [-60, -40, 11, .2], [8, -66, 10.5, -.7], [-20, -78, 9.5, .3], [36, -74, 12, .5], [-6, 34, 11, .2], [60, 30, 10, -.4]]) palm(x, z, h, l);
  { const pm = std('#ffffff', 'plain', { vertexColors: true, side: THREE.DoubleSide }); const m = new THREE.Mesh(K.mergeGeometries(palmParts), pm); m.castShadow = true; m.frustumCulled = false; S.add(m);
    const tm = std('#ffffff', 'plain', { vertexColors: true }); const t2 = new THREE.Mesh(K.mergeGeometries(trunkParts), tm); t2.castShadow = true; t2.frustumCulled = false; S.add(t2); }

  // ---------------------------------------------------------------- the moon (a sliver; its light is cheated to keep the faces lit)
  const moonTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 30, 128, 128, 128); gr.addColorStop(0, 'rgba(190,215,230,.07)'); gr.addColorStop(1, 'rgba(190,215,230,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    const m = document.createElement('canvas'); m.width = m.height = 256; const h = m.getContext('2d'); h.fillStyle = '#fff'; h.beginPath(); h.arc(128, 128, 58, 0, 6.283); h.fill();
    h.globalCompositeOperation = 'destination-out'; h.beginPath(); h.arc(108, 116, 56, 0, 6.283); h.fill(); g.drawImage(m, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const moon = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: moonTex, color: col('#e8f2f4', 2.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  moon.renderOrder = -8; S.add(moon);

  // ---------------------------------------------------------------- flames and halos (Points; fogged in the vertex shader)
  const flameMat = (core) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
    uniforms: { ...film.fogU, uScale: { value: H / 2 / Math.tan(68.3 / 2 * Math.PI / 180) }, uCol: { value: core ? col('#ffe2a8', 9) : col('#ffae5c', .5) }, uMin: { value: core ? 2.2 : 0 } },
    vertexShader: `${FOG_GLSL} attribute float aK; attribute float aS; varying float vK; uniform float uScale, uMin;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; float d = -mv.z;
        vec3 wp = (modelMatrix * vec4(position, 1.)).xyz; vec3 rd = wp - cameraPosition; float L = length(rd);
        float sz = aS * uScale / max(d, .1); float k = aK * fogT(cameraPosition, rd / max(L, 1e-4), L);
        if (sz < uMin){ k *= sz * sz / (uMin * uMin); sz = uMin; }   // energy kept when a far flame is smaller than a pixel or two
        gl_PointSize = clamp(sz, 0., 220.); vK = k; }`,
    fragmentShader: `varying float vK; uniform vec3 uCol; void main(){ vec2 q = gl_PointCoord * 2. - 1.; float r2 = dot(q, q); if (r2 > 1.) discard;
        float a = exp(-r2 * 4.) * (1. - r2); gl_FragColor = vec4(uCol * a * vK, 1.); }` });
  function points(n, core) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(n), 1));
    g.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(n), 1)); const p = new THREE.Points(g, flameMat(core)); p.frustumCulled = false; p.renderOrder = 5; S.add(p); return p; }
  const NL = LAMPS.length, NDY = 24;   // static door lamps; dynamic flames (hand lamps, the room's lamp, gifts' glows)
  const core = points(NL + NDY, true), halo = points(NL + NDY, false);
  LAMPS.forEach((L, i) => { for (const p of [core, halo]) p.geometry.attributes.position.setXYZ(i, L.x + L.d.n[0] * -.0, L.y + .06, L.z); core.geometry.attributes.aS.setX(i, .085); halo.geometry.attributes.aS.setX(i, 1.25); });
  const setFlame = (i, pos, k, sc = 1, hs = .95) => { for (const p of [core, halo]) p.geometry.attributes.position.setXYZ(i, pos.x, pos.y, pos.z); core.geometry.attributes.aK.setX(i, k); halo.geometry.attributes.aK.setX(i, k);
    core.geometry.attributes.aS.setX(i, .07 * sc); halo.geometry.attributes.aS.setX(i, hs * sc); };
  // motes: a few, only inside the beams (the doorway beam C1–C2, the gate's light C3–C4, the light on him C5)
  const NM = 90, motes = new THREE.Points(new THREE.BufferGeometry(), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...film.fogU, uScale: { value: H / 2 / Math.tan(68.3 / 2 * Math.PI / 180) } },
    vertexShader: `${FOG_GLSL} attribute float aK; varying float vK; uniform float uScale; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
      float d = -mv.z; float sz = .018 * uScale / max(d, .1); float k = aK; if (sz < 1.5){ k *= sz / 1.5; sz = 1.5; } gl_PointSize = min(sz * (1. + .9 * smoothstep(1., 4., abs(d - 6.))), 40.); vK = k / (1. + .6 * smoothstep(1., 4., abs(d - 6.))); }`,
    fragmentShader: `varying float vK; void main(){ vec2 q = gl_PointCoord * 2. - 1.; float r2 = dot(q, q); if (r2 > 1.) discard; gl_FragColor = vec4(vec3(1., .82, .56) * 1.6 * exp(-r2 * 3.) * vK, 1.); }` }));
  motes.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NM * 3), 3)); motes.geometry.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(NM), 1));
  motes.frustumCulled = false; motes.renderOrder = 6; S.add(motes);
  const MR = rng(991), MSEED = Array.from({ length: NM }, () => [MR(), MR(), MR(), MR(), MR()]);
  // the shaft of light that rests on him (C5): a soft cone, additive, fading toward its ends
  const shaftM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uK: { value: 0 } },
    vertexShader: `varying vec2 vU; varying vec3 vN; varying vec3 vV; void main(){ vU = uv; vec4 w = modelMatrix * vec4(position, 1.); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `varying vec2 vU; varying vec3 vN; varying vec3 vV; uniform float uK; void main(){ float e = pow(abs(dot(normalize(vN), normalize(vV))), 2.2); float y = vU.y;
      float a = e * smoothstep(0., .2, y) * (1. - smoothstep(.3, 1., y)) * uK; gl_FragColor = vec4(vec3(1., .76, .46) * a * .07, 1.); }` });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.22, .62, 8, 24, 1, true), shaftM); shaft.geometry.translate(0, 4.0, 0); shaft.visible = false; S.add(shaft);

  // ---------------------------------------------------------------- lamps that glow in the fog (film.lamp: in-scatter; ≤ 24)
  const fl = (c, size = .3) => film.lamp(V(0, -100, 0), c, { power: 0, size, fog: 1 });
  const L = { door: fl('#ffb468', .5), room: fl('#ffc27c', .2), gate: fl('#ffc280', 3), hand: fl('#ffc884', .12), knock: fl('#ffb468', .35), rest: fl('#ffcf90', .6),
    lb: Array.from({ length: 5 }, () => fl('#ffc884', .12)), near: Array.from({ length: 10 }, () => fl('#ffbc78', .14)) };

  // ---------------------------------------------------------------- people
  const robes = { oat: '#b5a486', brown: '#6e5442', indigo: '#3e4862', olive: '#5c6048', grey: '#5a5450', cream: '#c2b294', rust: '#8a3b24', teal: '#34505a', sand: '#9c8664', wine: '#6a3a3a', dun: '#7e6e58' };
  const PM = {}; const pm = hex => PM[hex] || (PM[hex] = std(hex, 'plain', { side: THREE.DoubleSide }));
  const faceM = std('#4a3020'), hairM = std('#22160e');
  const FIG = [];
  function person(name, o) {
    const s0 = o.h || 1.72; let g;
    if (o.woman) g = P.robeMan({ h: s0, broad: o.broad || .92, mat: pm(o.robe), cloth: pm(o.cloth || o.robe), face: faceM, head: 'veil' });
    else if (o.child) { g = P.robeMan({ h: s0, mat: pm(o.robe), cloth: pm(o.cloth || o.robe), face: faceM, child: true, head: 'cloth' }); P.headwear(g, 'bare', { dark: hairM }); const n = g.userData.neck; n.remove(n.children[n.children.length - 1]);
      const U = g.userData; if (U.skirt) { const k = .5, top = .99 * U.s; U.skirt.scale.y = k; U.skirt.position.y = top * (1 - k); } }
    else { g = P.robeMan({ h: s0, broad: o.broad || 1, mat: pm(o.robe), cloth: pm(o.mantle || o.robe), face: faceM, head: 'cloth', kind: o.kind || 'stand' }); P.headwear(g, o.wear || 'cloth', { dark: hairM, mat: pm(o.cloth || o.robe) });
      if (o.cloth && (o.wear || 'cloth') === 'cloth') { const n = g.userData.neck; n.children.forEach((c, i) => { if (i === 1 || i === 3) c.material = pm(o.cloth); }); } }
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    g.userData.name = name; g.visible = false; S.add(g); const F = { name, g, shots: new Set(o.shots), anim: null, s: g.userData.s }; FIG.push(F); return F; }
  const place = (g, x, z, yaw) => { g.position.set(x, 0, z); g.rotation.set(0, yaw, 0); g.updateMatrix(); g.updateMatrixWorld(true); };
  const toLocal = (g, w) => { g.updateMatrix(); return w.clone().applyMatrix4(g.matrix.clone().invert()); };
  const handW = (g, i) => { g.updateMatrixWorld(true); return P.handAt(g, i).applyMatrix4(g.matrixWorld); };
  const face = (dx, dz) => Math.atan2(-dx, -dz);
  const un = (a, ref) => { let d = a - ref; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return ref + d; };   // yaw that turns a figure (facing −z) toward (dx, dz)
  const angLerp = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
  // a walk along a smooth path, by a time warp of the gait (speed eases 0 → v → 0; the stance foot stays planted); ends on two feet
  function mkWalk(pts, t0, t1, s, acc = .9) {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => V(x, 0, z)), false, 'centripetal'), Lt = curve.getLength();
    const n = Math.max(2, 2 * Math.round(Lt / (1.24 * s))), Ls = Lt / n, G = (t1 - t0) - acc, Tg = 2 * G / n;
    const gt = t => { if (t <= t0) return 0; if (t >= t1) return G; const a = t - t0, b = t1 - t; if (a < acc) return acc * rampI(a / acc); if (b < acc) return G - acc * rampI(b / acc); return acc / 2 + (a - acc); };
    return { t0, t1, Tg, Ls, at(t) { const e = gt(t), d = e / (Tg / 2) * Ls, u = clamp(d / Lt), p = curve.getPointAt(u), tg = curve.getTangentAt(Math.min(u, .999));
      return { e, p, yaw: Math.atan2(-tg.x, -tg.z), go: t > t0 && t < t1 }; } }; }
  // pose for a walker at time t: the gait while walking; before/after it a standing pose eased in/out of the stride stance
  function walkPose(F, W, t, extra = {}) { const s = F.s, w = W.at(t), gp = P.walk(F.g, w.e, 0, { T: W.Tg, L: W.Ls });
    const id = P.idle(t, F.ph || 0, { s }); const kin = ss(W.t0 - .45, W.t0 + .1, t), kout = 1 - ss(W.t1 + .1, W.t1 + 1.2, t), k = Math.min(kin, kout);
    const feet = gp.feet.map((f, i) => { const g0 = id.feet[i]; return { u: lerp(g0.u, f.u, k), lift: f.lift * k + (i === 1 ? .05 * s * bump(W.t0 - .45, W.t0 + .1, t) : 0), pitch: (f.pitch || 0) * k }; });
    return { pose: { ...id, feet, bob: lerp(id.bob, gp.bob, k), lean: lerp(-.01, gp.lean, k), swing: [lerp(id.swing[0], gp.swing[0], k), lerp(id.swing[1], gp.swing[1], k)], side: id.side * (1 - k), twist: id.twist * (1 - k), ...extra }, p: w.p, yaw: w.yaw }; }
  // a held thing (bread, coins, bowl, lamp, staff)
  const ITEMS = [];
  const item = (geo, mat, shots) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.visible = false; S.add(m); const it = { m, shots: new Set(shots) }; ITEMS.push(it); return it; };
  const breadG = (() => { const g = new THREE.SphereGeometry(.085, 12, 8); g.scale(1, .42, 1); return g; })(), breadM = std('#a8743e');
  const coinG = new THREE.CylinderGeometry(.018, .018, .004, 10), coinM = std('#c8a050', 'plain', { metalness: .6, roughness: .4 });
  const bowlG = new THREE.LatheGeometry([[0, 0], [.07, .005], [.1, .04], [.11, .065]].map(([r, y]) => new THREE.Vector2(r, y)), 16), bowlM = std('#8a5e3e', 'plain', { side: THREE.DoubleSide });
  const staffG = new THREE.CylinderGeometry(.018, .022, 1.55, 6), staffM = std('#4a3a2a');
  const handLampG = (() => { const g = lampG.clone(); return g; })(), handLampM = std('#9a6e4a');
  const bundleG = new THREE.SphereGeometry(.2, 12, 8);

  // ---- C1: the murmurers in the foreground (backs to us; heads turned to each other — Luke 19:7)
  // (dark cloth: in the foreground they read as silhouettes against the moonlit wall and the door's light — never as close 3D dolls)
  const M1 = person('m1', { h: 1.74, robe: '#1c2226', cloth: '#262a2c', shots: ['c1'] }), M2 = person('m2', { h: 1.7, robe: '#22201e', cloth: '#2a2826', shots: ['c1'] });
  const M3 = person('m3', { h: 1.76, robe: '#1a2028', cloth: '#2a2a28', shots: ['c1'] }), W1 = person('w1', { h: 1.6, woman: true, robe: '#241e20', cloth: '#2a2624', shots: ['c1'] });
  // they stand murmuring (Luke 19:7); as the light pours out they turn away and walk off to the right, still talking (they leave the
  // frame as the camera trucks left — they never come close to the lens)
  const MW = [[M1, [[-.95, 3.45], [1.2, 3.7], [3.2, 4.1], [6.6, 5.3]], .55, face(.35, -1), -.5], [M2, [[-1.5, 3.85], [.8, 4.05], [3.0, 4.25], [6.9, 5.7]], .95, face(.1, -1), .45],
    [M3, [[1.02, 3.62], [2.6, 3.9], [4.6, 4.5], [8.0, 5.5]], .25, face(-.25, -1), .45], [W1, [[1.58, 3.98], [3.0, 4.2], [5.2, 5.0], [8.5, 6.0]], .7, face(-.3, -1), -.5]];
  for (const [F, path, d0, yaw0, hy] of MW) { const Wk = mkWalk(path, T.pour[0] + d0, T.pour[0] + d0 + 6.2, F.s, 1.1); F.ph = d0;
    F.anim = t => { const w = walkPose(F, Wk, t), yw = Wk.at(t).yaw, k = ss(Wk.t0 - .5, Wk.t0 + .5, t); place(F.g, w.p.x, w.p.z, yaw0 + (un(yw, yaw0) - yaw0) * k);
      P.pose(F.g, { ...w.pose, head: [-.03, hy * (1 - .45 * k) + .1 * Math.sin(t * .8 + d0 * 5)] }); }; }

  // ---- C2: the household and the poor at Zacchaeus's door; then Zacchaeus with the lamp into alley B
  const ZA = person('zacchaeus', { h: 1.5, broad: 1.06, robe: '#24363a', mantle: '#2c3e42', cloth: robes.rust, shots: ['c2'] });
  const SV = person('servant', { h: 1.7, robe: '#3a3228', cloth: '#4a4034', shots: ['c2'] });
  const OM = person('oldman', { h: 1.66, robe: '#4a4236', cloth: '#3a3632', shots: ['c2'] });
  const CH = person('child', { h: 1.12, child: true, robe: '#4e4232', shots: ['c2'] });
  const WM = person('woman', { h: 1.6, woman: true, robe: '#262c3a', cloth: '#3a2e26', shots: ['c2'] });
  const LM2 = person('lame', { h: 1.7, robe: '#3a2c22', cloth: '#443a2e', shots: ['c2'] });
  const AR1 = person('arr1', { h: 1.72, robe: robes.olive, cloth: robes.oat, shots: ['c2'] }), AR2 = person('arr2', { h: 1.58, woman: true, robe: robes.grey, cloth: robes.sand, shots: ['c2'] });
  const it = {
    b1: item(breadG, breadM, ['c2']), b1h: item(breadG, breadM, ['c2']), b2: item(breadG, breadM, ['c2']), coins: item(coinG, coinM, ['c2']),
    zlamp: item(handLampG, handLampM, ['c1', 'c2']), staff: item(staffG, staffM, ['c2']),
  };
  // where things are (world). Every handover meets halfway between the two shoulders (a little lower), so it is always within
  // both arms' reach (two-bone IK, fixed lengths) — computed from the planned positions and turns, never guessed.
  const ZD = V(.12, 0, .62);                      // Zacchaeus at his door
  const OMp = V(.32, 0, 1.34), CHp = V(.86, 0, 1.12), WMp = V(1.46, 0, 1.08), SVp = V(.96, 0, .5), LMp = V(-.78, 0, .9);
  const LEDGE = V(-.73, 1.16, .08);               // (C1: a lamp burning on the ledge left of the door)
  const fwdOf = y => V(-Math.sin(y), 0, -Math.cos(y)), rightOf = y => V(Math.cos(y), 0, -Math.sin(y));
  const shoulder = (p, yaw, s, sd, { broad = 1, lean = 0, y = null } = {}) => p.clone().addScaledVector(rightOf(yaw), sd * .235 * s * broad).addScaledVector(fwdOf(yaw), lean).setY(y ?? 1.38 * s);
  const mid = (a, b, drop) => a.clone().lerp(b, .5).add(V(0, -drop, 0));
  // the turns (unwrapped once, each the short way)
  const zs = 1.5 / 1.75, ZY = {}; ZY.om = face(OMp.x - ZD.x, OMp.z - ZD.z); ZY.lm = un(face(LMp.x - ZD.x, LMp.z - ZD.z), ZY.om); ZY.sv = un(Math.PI, ZY.lm);
  const ZW = mkWalk([[.12, .62], [.9, 1.0], [2.4, 1.3], [3.9, .7], [4.6, -1.1], [5.25, -3.05], [5.42, -3.45]], T.walk[0], T.walk[1], zs, 1.0);
  ZY.walk = un(ZW.at(T.walk[0] + .25).yaw, ZY.sv);
  const OY = { z: face(ZD.x - OMp.x, ZD.z - OMp.z) }; OY.ch = un(face(CHp.x - OMp.x, CHp.z - OMp.z), OY.z);
  const SY = { wm: face(WMp.x - SVp.x, WMp.z - SVp.z) }; SY.z = un(face(ZD.x - SVp.x, ZD.z - SVp.z), SY.wm); SY.half = lerp(SY.wm, SY.z, .7);
  const OMs = 1.66 / 1.75, CHs = 1.12 / 1.75, SVs = 1.7 / 1.75, WMs = 1.6 / 1.75, LMs = 1.7 / 1.75;
  const MEET = {
    m1: mid(shoulder(ZD, ZY.om, zs, 1, { broad: 1.06, lean: .1 }), shoulder(OMp, OY.z, OMs, 1, { lean: .08 }), .24),                       // bread: Zacchaeus to the old man
    m2: mid(shoulder(SVp, SY.wm, SVs, 1, { lean: .06 }), shoulder(WMp, face(SVp.x - WMp.x, SVp.z - WMp.z), WMs, -1, { broad: .92 }), .24),   // coins: the servant to the woman
    m3: mid(shoulder(OMp, OY.ch, OMs, 1, { lean: .16 }), shoulder(CHp, face(OMp.x - CHp.x, OMp.z - CHp.z), CHs, -1), .2),               // half the loaf: the old man to the child
    m4: mid(shoulder(ZD, ZY.lm, zs, 1, { broad: 1.06, lean: .3, y: 1.0 }), shoulder(LMp, face(ZD.x - LMp.x, ZD.z - LMp.z), LMs, -1, { y: .93 }), .1),   // bread: bending to the lame man
    m5: mid(shoulder(ZD, ZY.sv, zs, -1, { broad: 1.06 }), shoulder(SVp, SY.half, SVs, -1, { lean: .05 }), .22),                             // the lamp: the servant to Zacchaeus
  };
  // a handover: out = the giver's reach toward the meeting point, in = the receiver's; the thing changes hands at tm
  function give(t, [ta, tm, tb]) { return { out: ss(ta, tm - .1, t) * (1 - ss(tm + .1, tb, t)), in: ss(ta + .3, tm, t), passed: t > tm }; }
  const L3 = (g, w) => toLocal(g, w);
  // Zacchaeus: one body throughout — standing (the giving, the lamp), then the walk (feet eased into the stride), then the knock
  const zYaw = t => { const pathY = un(ZW.at(t).yaw, ZY.walk), endY = un(ZW.at(ZW.t1).yaw, ZY.walk), doorY = un(face(1, 0), endY);
    return ZY.om + (ZY.lm - ZY.om) * ss(T.give4[0] - .9, T.give4[0] + .2, t) + (ZY.sv - ZY.lm) * ss(T.give4[2] - .1, T.lamp[0] + .5, t) + (ZY.walk - ZY.sv) * ss(T.lamp[1] - .2, T.walk[0] + .2, t)
      + (pathY - ZY.walk) * ss(T.walk[0] + .2, T.walk[0] + .9, t) + (doorY - endY) * ss(ZW.t1 - .4, ZW.t1 + .6, t); };
  ZA.anim = (t) => {
    const s = ZA.s, g = ZA.g, wp = walkPose(ZA, ZW, t); place(g, wp.p.x, wp.p.z, zYaw(t));
    const g1 = give(t, T.give1), g4 = give(t, T.give4), g5 = give(t, T.lamp), kn = T.knock;
    const bend = sine(ss(T.give4[0] - .3, T.give4[1], t)) * (1 - ss(T.give4[1] + .2, T.give4[2] + .3, t));
    const restR = V(.13 * s, 1.0 * s, -.26 * s), restL = V(-.12 * s, 1.07 * s, -.3 * s);
    // right hand: bread to the old man, bread to the lame man, then (empty, after it has hung free) the three knocks on the door
    let hR, wR; if (t < T.give4[2] + 1) { hR = t < T.give4[0] ? restR.clone().lerp(L3(g, MEET.m1), g1.out) : restR.clone().lerp(L3(g, MEET.m4), g4.out); wR = t < T.give4[2] ? 1 : 1 - ss(T.give4[2], T.give4[2] + .9, t); }
    else { const pulse = [0, 1, 2].reduce((a, i) => a + bump(kn[0] + i * .36, kn[0] + i * .36 + .3, t), 0); hR = L3(g, V(5.965, 1.32, -3.38)); hR.z += .07 * pulse; wR = ss(kn[0] - .8, kn[0], t) * (1 - ss(kn[1] + .15, kn[1] + .8, t)); }
    // left hand: takes the lamp from the servant and holds it at the chest from then on
    const hL = t < T.lamp[1] ? L3(g, MEET.m5) : L3(g, MEET.m5).lerp(restL, ss(T.lamp[1], T.lamp[2] + .2, t)), wL = t < T.lamp[1] ? g5.in : 1;
    P.pose(g, { ...wp.pose, lean: wp.pose.lean - .18 * g1.out - .5 * bend, bob: wp.pose.bob - .1 * s * bend, head: [.1 + .3 * bend, 0], hands: [hL, hR], handsW: [wL, wR] });
  };
  // the servant: the lamp in his left hand from the start, coins from his right to the woman, then the lamp to his master
  SV.anim = t => { const g2 = give(t, T.give2), g5 = give(t, T.lamp), turn = ss(T.lamp[0] - 1.1, T.lamp[0], t) * (1 - ss(T.lamp[2], T.lamp[2] + 1.2, t) * .5);
    place(SV.g, SVp.x, SVp.z, lerp(SY.wm, SY.half, turn)); const id = P.idle(t, .55);
    const lampRest = V(-.12, 1.06, -.28), hL = lampRest.clone().lerp(L3(SV.g, MEET.m5), g5.out), wL = t < T.lamp[1] ? 1 : 1 - ss(T.lamp[1] + .1, T.lamp[2], t);
    P.pose(SV.g, { ...id, head: [.1, 0], hands: [hL, L3(SV.g, MEET.m2)], handsW: [wL, g2.out] }); };
  OM.anim = t => { const g1 = give(t, T.give1), g3 = give(t, T.give3); const turn = ss(T.give3[0] - .9, T.give3[0] + .15, t) * (1 - .55 * ss(T.give3[2], T.give3[2] + 1.3, t));
    place(OM.g, OMp.x, OMp.z, lerp(OY.z, OY.ch, turn)); const id = P.idle(t, .9, { s: OM.s });
    // the staff in his left hand (its foot on the ground); the bread in his right, then half of it to the child
    const hold = V(.1, 1.0, -.27); let hR, wR;
    if (t < T.give1[1]) { hR = L3(OM.g, MEET.m1); wR = g1.in; }
    else if (t < T.give3[0]) { hR = L3(OM.g, MEET.m1).lerp(hold, ss(T.give1[1], T.give1[2] + .3, t)); wR = 1; }
    else { hR = hold.clone().lerp(L3(OM.g, MEET.m3), g3.out); wR = 1; }
    P.pose(OM.g, { ...id, lean: -.12 - .1 * g1.in * (1 - ss(T.give1[1], T.give1[2], t)) - .2 * g3.out, head: [.18 + .15 * g3.out, 0], hands: [V(-.2, .98, -.26), hR], handsW: [1, wR] }); };
  CH.anim = t => { const g3 = give(t, T.give3); place(CH.g, CHp.x, CHp.z, face(OMp.x - CHp.x, OMp.z - CHp.z) - .3 * ss(T.give3[2], T.give3[2] + 1.3, t)); const id = P.idle(t, .35, { s: CH.s });
    const chest = V(-.05, .66, -.18), m = L3(CH.g, MEET.m3), hL = t < T.give3[1] ? m : m.lerp(chest, ss(T.give3[1], T.give3[2] + .3, t));
    P.pose(CH.g, { ...id, head: [-.25 + .2 * ss(T.give3[1], T.give3[2] + .5, t), 0], hands: [hL, null], handsW: [t < T.give3[1] ? g3.in : 1, 0] }); };
  WM.anim = t => { const g2 = give(t, T.give2); place(WM.g, WMp.x, WMp.z, face(SVp.x - WMp.x, SVp.z - WMp.z)); const id = P.idle(t, .15);
    const m = L3(WM.g, MEET.m2), cL = V(-.03, 1.0, -.21), cR = V(.05, 1.0, -.21), low = 1 - ss(T.give2[2] + 2.2, T.give2[2] + 3.6, t);
    const hL = t < T.give2[1] ? m : m.lerp(cL, ss(T.give2[1], T.give2[2] + .2, t));
    P.pose(WM.g, { ...id, head: [.12, 0], hands: [hL, cR], handsW: [t < T.give2[1] ? g2.in : low, ss(T.give2[1] + .2, T.give2[2] + .5, t) * low] }); };
  LM2.anim = t => { const g4 = give(t, T.give4), sit = P.rockSit(.36, LM2.s, { lean: -.18 }); place(LM2.g, LMp.x, LMp.z, face(ZD.x - LMp.x, ZD.z - LMp.z)); const id = P.idle(t, .45, { s: LM2.s });
    const kh = [P.kneeHand(LM2.g, -1, sit), P.kneeHand(LM2.g, 1, sit)], m = L3(LM2.g, MEET.m4), hold = V(-.04, .82, -.3);
    const hL = t < T.give4[1] ? kh[0].clone().lerp(m, g4.in) : m.lerp(hold, ss(T.give4[1], T.give4[2] + .3, t));
    P.pose(LM2.g, { ...id, ...sit, head: [-.12 + .12 * g4.in, 0], hands: [hL, kh[1]], handsW: [1, 1] }); };
  const AW1 = mkWalk([[-10.5, 4.2], [-6.5, 3.6], [-3.4, 2.7], [-2.2, 2.25]], T.c2 - .2, T.c2 + 6.5, AR1.s, .9), AW2 = mkWalk([[-11.4, 5.1], [-7.2, 4.4], [-3.9, 3.3], [-2.8, 2.9]], T.c2 + .4, T.c2 + 7.6, AR2.s, .9);
  AR1.anim = t => { const w = walkPose(AR1, AW1, t); place(AR1.g, w.p.x, w.p.z, t > AW1.t1 ? angLerp(w.yaw, face(ZD.x + 2.2, ZD.z - 2.25), ss(AW1.t1 - .3, AW1.t1 + 1, t)) : w.yaw); P.pose(AR1.g, w.pose); };
  AR2.anim = t => { const w = walkPose(AR2, AW2, t); place(AR2.g, w.p.x, w.p.z, t > AW2.t1 ? angLerp(w.yaw, face(ZD.x + 2.8, ZD.z - 2.9), ss(AW2.t1 - .3, AW2.t1 + 1, t)) : w.yaw); P.pose(AR2.g, w.pose); };
  const knockLeaf = t => 0 - .42 * eio((t - T.open[0]) / (T.open[1] - T.open[0]));   // inward (−) a crack: ≈ 24°

  // ---- C3: lane A at night (a woman at her door, a man by his door, the small man in the dark, a walker far ahead with a lamp)
  const C3W = person('c3woman', { h: 1.58, woman: true, robe: robes.brown, cloth: robes.oat, shots: ['c3'] });
  const C3M = person('c3man', { h: 1.72, robe: robes.oat, cloth: robes.grey, shots: ['c3'] });
  const WK = person('walker', { h: 1.7, robe: robes.dun, cloth: robes.sand, shots: ['c3'] });
  const SP = person('small', { h: 1.42, broad: .88, robe: '#4a3e32', cloth: '#5a4a3a', shots: ['c3', 'c4'] });
  C3W.anim = t => { const sit = P.rockSit(.3, C3W.s, { lean: -.1 }); place(C3W.g, -3.15, -13.2, face(-1, .1)); const id = P.idle(t, .2, { s: C3W.s }); P.pose(C3W.g, { ...id, ...sit, head: [.1, .1 * Math.sin(t * .4)], hands: [P.kneeHand(C3W.g, -1, sit), P.kneeHand(C3W.g, 1, sit)], handsW: [1, 1] }); };
  C3M.anim = t => { place(C3M.g, -5.75, -14.9, face(1, -.3)); const id = P.idle(t, .7); P.pose(C3M.g, { ...id, head: [0, -.25 + .08 * Math.sin(t * .5)] }); };
  const WKW = mkWalk([[-4.4, -42], [-4.5, -56], [-4.0, -59.6], [-1.5, -60.6], [4, -60.6]], T.c3 - 1.5, T.c3 + 25, WK.s, 1.2);   // (never a figure standing in the open gate)
  const wkLamp = item(handLampG, handLampM, ['c3']);
  WK.anim = t => { const w = walkPose(WK, WKW, t); place(WK.g, w.p.x, w.p.z, w.yaw); P.pose(WK.g, { ...w.pose, hands: [V(-.1, 1.06, -.3), null], handsW: [1, 0] }); };
  SP.anim = t => { const sit = P.rockSit(.24, SP.s, { tuck: .14, lean: -.38 }); place(SP.g, -5.78, -20.2, face(1, .05)); const id = P.idle(t, .05, { s: SP.s });
    const kh = [P.kneeHand(SP.g, -1, sit), P.kneeHand(SP.g, 1, sit)]; kh[0].z -= .04; kh[1].z -= .04;
    P.pose(SP.g, { ...id, ...sit, head: [.42, .0], breath: id.breath * .6, hands: kh, handsW: [1, 1], twist: 0, side: 0 }); };

  // ---- C4: the three doors (bread · water · a stranger), the lamp-bearers
  const E1W = person('e1woman', { h: 1.6, woman: true, robe: robes.wine, cloth: robes.cream, shots: ['c4'] });
  const E1P = person('e1poor', { h: 1.68, robe: '#6a6050', cloth: robes.grey, shots: ['c4'] });
  const E2M = person('e2man', { h: 1.74, robe: robes.olive, cloth: robes.oat, shots: ['c4'] });
  const E2T = person('e2trav', { h: 1.72, robe: robes.dun, cloth: robes.sand, shots: ['c4'] });
  const E3H = person('e3host', { h: 1.76, robe: robes.indigo, cloth: robes.oat, shots: ['c4'] });
  const E3S = person('e3stranger', { h: 1.7, robe: robes.grey, cloth: robes.brown, shots: ['c4'] });
  const LB = [person('lb1', { h: 1.74, robe: robes.oat, cloth: robes.grey, shots: ['c4'] }), person('lb2', { h: 1.6, woman: true, robe: robes.indigo, cloth: robes.sand, shots: ['c4'] }),
    person('lb3', { h: 1.7, robe: robes.brown, cloth: robes.oat, shots: ['c4'] }), person('lb4', { h: 1.66, robe: robes.olive, cloth: robes.dun, shots: ['c4'] }), person('lb5', { h: 1.62, woman: true, robe: robes.wine, cloth: robes.cream, shots: ['c4'] })];
  const it4 = { bread: item(breadG, breadM, ['c4']), bowl: item(bowlG, bowlM, ['c4']), staff: item(staffG, staffM, ['c4']), bundle: item(bundleG, pm(robes.sand), ['c4']) };
  const lbLamps = LB.map(() => item(handLampG, handLampM, ['c4']));
  const E1 = { door: V(-1.4, 0, EV.E1.z), meet: V(-2.05, 1.05, EV.E1.z - .05) }, E2 = { door: V(-1.4, 0, EV.E2.z), meet: V(-2.0, .82, EV.E2.z + .05) }, E3 = { door: V(-1.4, 0, EV.E3.z) };
  E1W.anim = t => { const gv = give(t, T.bread); place(E1W.g, -1.18, E1.door.z, face(-1, 0)); const id = P.idle(t, .3), rest = V(.08, 1.0, -.22);
    P.pose(E1W.g, { ...id, lean: -.15 * gv.out, head: [.12, 0], hands: [null, rest.clone().lerp(L3(E1W.g, E1.meet), gv.out)], handsW: [0, t < T.bread[1] ? 1 : 1 - ss(T.bread[2] - .3, T.bread[2] + .6, t)] }); };
  E1P.anim = t => { const gv = give(t, T.bread); place(E1P.g, -2.72, E1.door.z - .1, face(1, 0)); const id = P.idle(t, .65, { s: E1P.s });
    const held = V(.05, 1.02, -.24), m = L3(E1P.g, E1.meet), hR = t < T.bread[1] ? m : m.lerp(held, ss(T.bread[1], T.bread[2] + .3, t));
    P.pose(E1P.g, { ...id, lean: -.1 - .1 * gv.in * (1 - ss(T.bread[1], T.bread[2], t)), head: [.15, 0], hands: [held.clone().add(V(-.12, 0, 0)), hR], handsW: [ss(T.bread[1] + .2, T.bread[2] + .5, t), t < T.bread[1] ? gv.in : 1] }); };
  E2M.anim = t => { const gv = give(t, T.water); place(E2M.g, -1.22, E2.door.z, face(-1, 0)); const id = P.idle(t, .15);
    const bw = V(-1.62, .98, E2.door.z).lerp(E2.meet, gv.out), l = L3(E2M.g, bw), let_go = t < T.water[1] ? 1 : 1 - ss(T.water[1] + .1, T.water[1] + .8, t);
    P.pose(E2M.g, { ...id, lean: -.2 * gv.out, head: [.25, 0], hands: [l.clone().add(V(-.11, .02, 0)), l.clone().add(V(.11, .02, 0))], handsW: [let_go, let_go] }); };
  E2T.anim = t => { const gv = give(t, T.water), sit = P.rockSit(.42, E2T.s, { lean: -.12 }); place(E2T.g, -2.62, E2.door.z + .1, face(1, 0)); const id = P.idle(t, .85, { s: E2T.s });
    const drink = ss(T.water[2] - .2, T.water[2] + .9, t) * (1 - ss(T.water[2] + 3.2, T.water[2] + 4.4, t)), bw = E2.meet.clone().lerp(V(-2.36, 1.16, E2.door.z + .1), drink), l = L3(E2T.g, bw);
    const kh = [P.kneeHand(E2T.g, -1, sit), P.kneeHand(E2T.g, 1, sit)], w = t < T.water[1] ? gv.in : 1;
    P.pose(E2T.g, { ...id, ...sit, head: [.1 - .32 * drink, 0], hands: [kh[0].clone().lerp(l.clone().add(V(-.11, -.01, 0)), w), kh[1].clone().lerp(l.clone().add(V(.11, -.01, 0)), w)], handsW: [1, 1] }); };
  // one walk: up the street to the door and in (no stop — the host steps back to let him in as he arrives)
  const E3W = mkWalk([[-4.0, -48.6], [-3.5, -46.0], [-2.5, -44.5], [-1.5, -44.12], [-.4, -44.02], [.75, -43.95]], T.stranger[0] - 3.6, T.stranger[2] - .1, E3S.s, 1.1);
  E3H.anim = t => { const st = T.stranger, back = ss(st[0] + .6, st[1] - .2, t); place(E3H.g, lerp(-1.2, -.45, back), lerp(E3.door.z, E3.door.z - .62, back), face(-1, back * .6)); const id = P.idle(t, .4);
    const wave = ss(st[0] + .8, st[1], t) * (1 - ss(st[2] - .4, st[2] + .6, t)); P.pose(E3H.g, { ...id, head: [.05, .2 * back], hands: [null, V(.42, 1.0, -.25)], handsW: [0, wave], abd: [0, .2 * wave] }); };
  E3S.anim = t => { const w = walkPose(E3S, E3W, t); place(E3S.g, w.p.x, w.p.z, w.yaw);
    P.pose(E3S.g, { ...w.pose, hands: [null, V(.18, .95, -.12)], handsW: [0, 1] }); };
  const LBP = [[-4.0, -55.6, -.3], [-5.2, -56.4, .3], [-4.4, -58.2, 0], [-3.4, -59.1, -.2], [-5.4, -60.4, .25]];
  LB.forEach((F, i) => { F.anim = t => { const [x, z] = LBP[i], tk = T.turn, k = ss(tk[0] + i * .28, tk[0] + 1.5 + i * .28, t);
    const turnTo = [.85, -.8, .55, -.7, .6][i], head = [-.9, .95, -.6, .8, -.75][i]; place(F.g, x, z, [0.05, -.05, 0, .04, -.03][i] + turnTo * k);
    const id = P.idle(t, i * .21, { s: F.s }); const chest = i === 1 || i === 3 ? ss(tk[0] + .9, tk[0] + 2.1, t) : 0;
    P.pose(F.g, { ...id, head: [.05 * k, head * k * .55], twist: turnTo * .15 * k, hands: [V(-.1, 1.12, -.3), chest > 0 ? V(.03, 1.25, -.12) : null], handsW: [1, chest] }); }; });

  // ---------------------------------------------------------------- flowing light: the street network as segments
  const segs = [];
  const seg = (ax, az, bx, bz) => { const s = { ax, az, bx, bz, L: Math.hypot(bx - ax, bz - az), front: -1, k: 0, w: 1.2 }; segs.push(s); return s; };
  // C1: out of the door, across the square, into lane A, down it, into the far side alleys
  const C1S = [seg(0, -.3, 0, 1.9), seg(0, 1.9, -2.4, 2.6), seg(-2.4, 2.6, -4.5, .6), seg(-4.5, .6, -4.5, -28), seg(-4.5, -28, -4.5, -64), seg(-4.5, -12.9, -40, -12.9), seg(-4.5, -60.6, 30, -60.6), seg(-4.5, -63.5, -4.5, -76), seg(-4.5, -68.5, -40, -68.5)];
  const C1W = [1.05, 1.25, 1.25, 1.2, 1.15, .95, .95, 1.0, .9];
  let acc0 = 0; const C1S0 = []; for (let i = 0; i < 5; i++) { C1S0.push(acc0); acc0 += C1S[i].L; }
  C1S0.push(C1S0[3] + 13.5, C1S0[4] + 32.6, C1S0[4] + 35.5, C1S0[4] + 40.5);
  const flowS = t => { const k = T.flowK; if (t <= k[0][0]) return -1; if (t >= k[k.length - 1][0]) return k[k.length - 1][1];
    for (let i = 0; i < k.length - 1; i++) if (t < k[i + 1][0]) { const [t0, s0] = k[i], [t1, s1] = k[i + 1], m0 = i ? (k[i + 1][1] - k[i - 1][1]) / (k[i + 1][0] - k[i - 1][0]) : 0, m1 = (k[Math.min(k.length - 1, i + 2)][1] - k[i][1]) / (k[Math.min(k.length - 1, i + 2)][0] - k[i][0]);
      const h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * s0 + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * s1 + (u3 - u2) * h * m1; } };
  // C3: the gate's wash down lane A (from the gate toward the square); C5: the lamps joined — lane A from its north end down to the
  // square (running UP the frame in the orbit's top view), then each street out of it as the front passes its junction
  const C5A = seg(-4.5, -82, -4.5, 3);
  const C5N = [[-4.5, -12.9, -46, -12.9], [-4.5, -60.6, 40, -60.6], [-4.5, -68.5, -52, -68.5], [-4.5, -42.5, -66, -42.5], [-1.4, -34.5, 66, -34.5], [-4.5, -78.7, -66, -78.7], [-4.5, -78.7, 66, -78.7], [-4.5, 7, -30, 7], [-4.5, 7, 66, 7],
    [4.6, 1, 4.6, -24.5], [4.6, -24.5, 18, -24.5], [18, -84, 18, 40], [-30, -84, -30, 40], [46, -84, 46, 40], [-54, -84, -54, 40]].map(a => seg(...a));
  const C5N0 = [-12.9, -60.6, -68.5, -42.5, -34.5, -78.7, -78.7, 7, 7, 1, -24.5, -24.5, 7, -34.5, -42.5];   // the z on lane A where each one starts (it waits for the front)
  const C5Nd = [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 23, 40, 30, 58, 52];   // extra metres along the network before it starts
  // when lane A's front (z(t) = −82 → 3 on a sine over 7.2 s) passes each junction (+ the extra metres at ~7 m/s), staggered a little
  const C5J = C5N0.map((z, i) => { const u = clamp((z + 82) / 85), tz = T.thread[0] + 7.2 * Math.acos(1 - 2 * u) / Math.PI; return tz + C5Nd[i] / 7 + .18 * (i % 4); });

  // ---------------------------------------------------------------- cameras (Hermite through keys in time: velocity is continuous)
  // keys[0].go: the shot starts in motion (start tangent = the first secant), else at rest; every shot ends in motion (cut away)
  function hermite(keys, t, f) {
    const n = keys.length;
    const tan = j => { if (j === 0) return keys[0].go ? f(keys[1]).clone().sub(f(keys[0])).divideScalar(keys[1].t - keys[0].t) : f(keys[0]).clone().multiplyScalar(0);
      if (j === n - 1) return f(keys[n - 1]).clone().sub(f(keys[n - 2])).divideScalar(keys[n - 1].t - keys[n - 2].t);
      return f(keys[j + 1]).clone().sub(f(keys[j - 1])).divideScalar(keys[j + 1].t - keys[j - 1].t); };
    if (t <= keys[0].t) return keys[0].go ? f(keys[0]).clone().addScaledVector(tan(0), t - keys[0].t) : f(keys[0]).clone();
    if (t >= keys[n - 1].t) return f(keys[n - 1]).clone().addScaledVector(tan(n - 1), t - keys[n - 1].t);
    let i = 0; while (i < n - 2 && t > keys[i + 1].t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1.t - k0.t, u = (t - k0.t) / h, u2 = u * u, u3 = u2 * u;
    return f(k0).clone().multiplyScalar(2 * u3 - 3 * u2 + 1).addScaledVector(tan(i), (u3 - 2 * u2 + u) * h).addScaledVector(f(k1), -2 * u3 + 3 * u2).addScaledVector(tan(i + 1), (u3 - u2) * h); }
  const K1 = [   // C1: the gouache frame (handoff.md: 1.6 m, ~7 m, the door centred) → low tracking after the light into lane A
    { t: T.dev[0] + .05, p: V(0, 1.6, 7.0), l: V(0, .95, 0), f: 68.3 },
    { t: T.dev[0] + 2.6, p: V(-1.15, 1.32, 6.35), l: V(-1.6, .78, 0), f: 65 },
    { t: T.dev[0] + 4.6, p: V(-2.9, 1.0, 5.15), l: V(-4.0, .6, -2.5), f: 61 },
    { t: B.Q19c + 1.2, p: V(-4.25, .74, 2.6), l: V(-4.55, .5, -9), f: 56 },
    { t: B.Q19c + 4.6, p: V(-4.5, .64, -3.4), l: V(-4.5, .55, -24), f: 53 },
    { t: B.N34, p: V(-4.55, .68, -10.4), l: V(-4.45, .9, -40), f: 52 } ];
  const K2 = [   // C2: from the square's right, a slow truck left → pan right and follow him into alley B
    { t: B.N34, p: V(2.9, 1.18, 9.0), l: V(-.05, 1.12, .5), f: 36, go: true },
    { t: B.N34 + 5.5, p: V(2.2, 1.17, 8.9), l: V(0, 1.12, .55), f: 36 },
    { t: T.walk[0] - .2, p: V(1.75, 1.2, 8.3), l: V(.7, 1.08, .8), f: 38 },
    { t: T.walk[0] + 3.6, p: V(2.65, 1.52, 6.7), l: V(4.05, 1.0, -1.3), f: 44 },
    { t: T.knock[0] - .3, p: V(1.45, 1.5, 5.0), l: V(5.3, 1.15, -3.3), f: 43 },
    { t: B.N36 + .45, p: V(1.0, 1.5, 4.25), l: V(5.65, 1.2, -3.55), f: 42 } ];
  const K3 = [   // C3: a slow dolly down lane A between the door lamps
    { t: B.N36 - .65, p: V(-4.35, 1.55, .9), l: V(-4.45, 1.55, -40), f: 50, go: true },
    { t: B.N36 + 6, p: V(-4.45, 1.52, -3.0), l: V(-4.5, 1.6, -45), f: 50 },
    { t: B.Q20a + 2, p: V(-4.6, 1.48, -7.0), l: V(-4.52, 1.75, -60), f: 49 },
    { t: B.Q20b, p: V(-4.62, 1.45, -11.6), l: V(-4.5, 1.9, -84), f: 48 } ];
  const K4 = [   // C4 → C5: the diagonal truck past the three doors → pan to the lamp-bearers → crane up with an orbit → the glide to him
    { t: B.Q20b, p: V(-6.95, 1.62, -25.0), l: V(-1.75, 1.05, -29.6), f: 50, go: true },
    { t: T.bread[1], p: V(-6.92, 1.6, -27.6), l: V(-1.75, 1.05, -32.2), f: 50 },
    { t: T.water[1], p: V(-6.88, 1.56, -33.4), l: V(-1.75, 1.0, -38.0), f: 50 },
    { t: T.stranger[1], p: V(-6.8, 1.52, -39.5), l: V(-1.6, 1.08, -44.1), f: 50 },
    { t: T.stranger[1] + 1.3, p: V(-6.55, 1.51, -41.3), l: V(-2.2, 1.12, -47.6), f: 50 },
    { t: B.N36c + 1.4, p: V(-5.7, 1.5, -43.6), l: V(-4.0, 1.4, -61), f: 50 },
    { t: B.N36c + 4.4, p: V(-4.9, 1.8, -45.9), l: V(-4.5, 1.3, -63), f: 50 },
    { t: B.Q20 + .6, p: V(-4.7, 4.7, -46.5), l: V(-4.7, .9, -64), f: 51 },
    { t: B.Q20 + 3.8, p: V(-2.6, 13.5, -47.2), l: V(-11, 0, -68), f: 53 },
    { t: B.Q20 + 7.1, p: V(2.8, 26.5, -45.2), l: V(-31, 0, -50), f: 55 },
    { t: B.Q20 + 10.0, p: V(4.2, 37.5, -41.0), l: V(-23, 0, -12), f: 56 },
    { t: B.N37 - 1.2, p: V(-2.9, 36.0, -35.5), l: V(-5.4, 0, -4), f: 56 },
    { t: B.N37 + 1.2, p: V(-3.3, 21.0, -31.5), l: V(-5.4, 0, -17), f: 54 },
    { t: B.N37 + 3.6, p: V(-3.6, 10.0, -28.2), l: V(-5.7, .3, -19.9), f: 50 },
    { t: B.N37 + 5.8, p: V(-4.1, 4.2, -25.6), l: V(-5.68, .45, -20.25), f: 47 },
    { t: B.END, p: V(-4.35, 2.0, -24.7), l: V(-5.62, .52, -20.25), f: 46 } ];
  const camAt = (shot, t) => { const KS = { c1: K1, c2: K2, c3: K3, c4: K4 }[shot];
    return { p: hermite(KS, t, k => k.p), l: hermite(KS, t, k => k.l), f: hermite(KS, t, k => V(k.f, 0, 0)).x }; };
  function setCam(c) { cam.position.copy(c.p); cam.up.set(0, 1, 0); cam.lookAt(c.l); cam.fov = c.f; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); }
  // the moon sits in the upper left of the opening frame (above the roofline, beside the palm) and stays there in the world
  { setCam(camAt('c1', T.dev[0])); const d = V(-.62, .78, .5).unproject(cam).sub(cam.position).normalize(); moon.position.copy(d.multiplyScalar(1500)); moon.scale.setScalar(60); moon.lookAt(V(0, 1.6, 7)); }

  // ---------------------------------------------------------------- the gouache pass (the opening frame) — fixed in the frame
  const FS = (frag, uniforms) => { const m = new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    const sc = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); q.frustumCulled = false; sc.add(q); return { m, sc, u: m.uniforms }; };
  const ocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const rtA = new THREE.WebGLRenderTarget(film.w, film.h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const gouache = FS(`varying vec2 vUv; uniform sampler2D tIn; uniform vec2 px; uniform float uG;
    ${hashGLSL}
    float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
    void main(){
      vec3 src = texture2D(tIn, vUv).rgb;
      if (uG < .002){ gl_FragColor = vec4(src, 1.); return; }
      vec2 p = gl_FragCoord.xy;
      // the hand: shapes drawn with a loaded brush wobble a little at their edges (a slow fixed warp)
      vec2 wob = (vec2(fb(p * .0065), fb(p * .0065 + 7.3)) - .5) * 9. * px;
      vec2 uv = vUv + wob;
      // opaque flat paint: a Kuwahara over radius 4 (step 1.6 px) — the colour laid in flat matte patches, edges kept
      const int R = 4; vec3 m[4]; vec3 s2[4]; for (int k = 0; k < 4; k++){ m[k] = vec3(0.); s2[k] = vec3(0.); }
      for (int y = 0; y <= R; y++) for (int x = 0; x <= R; x++){ vec2 o = vec2(x, y) * 1.6 * px;
        vec3 a = texture2D(tIn, uv + vec2(-o.x, -o.y)).rgb, b = texture2D(tIn, uv + vec2(o.x, -o.y)).rgb, c = texture2D(tIn, uv + o).rgb, d = texture2D(tIn, uv + vec2(-o.x, o.y)).rgb;
        m[0] += a; s2[0] += a * a; m[1] += b; s2[1] += b * b; m[2] += c; s2[2] += c * c; m[3] += d; s2[3] += d * d; }
      float n = float((R + 1) * (R + 1)), best = 1e9; vec3 col = vec3(0.);
      for (int k = 0; k < 4; k++){ vec3 mu = m[k] / n, v = abs(s2[k] / n - mu * mu); float sv = v.r + v.g + v.b; if (sv < best){ best = sv; col = mu; } }
      // gouache is laid in a few flat values: soft steps of lightness (hue kept)
      float l = lum(col), q = 7., lq = (floor(l * q) + smoothstep(.28, .72, fract(l * q))) / q; col *= (lq + .015) / (l + .015);
      // matte and chalky: no deep black (the darks are the night's teal-umber), lights a little chalky
      col = mix(col, vec3(.11, .155, .2), (1. - smoothstep(.0, .2, l)) * .5);
      col = mix(col, col * .92 + vec3(.05, .055, .06), .3);
      // brush strokes: flat strokes along a slowly turning direction (mostly horizontal on the walls, a lift in the sky)
      float a = .15 + .9 * (fb(p * .0017 + 3.) - .5); vec2 dd = vec2(cos(a), sin(a)), ee = vec2(-dd.y, dd.x);
      float st = vn(vec2(dot(p, dd) / 34., dot(p, ee) / 5.)) * .65 + vn(vec2(dot(p, dd) / 11., dot(p, ee) / 2.2) + 5.) * .35;
      col *= 1. + (st - .5) * .1;
      // paint pooling at the edge of a shape
      float e = abs(lum(texture2D(tIn, uv + vec2(3., 0.) * px).rgb) - lum(texture2D(tIn, uv - vec2(3., 0.) * px).rgb)) + abs(lum(texture2D(tIn, uv + vec2(0., 3.) * px).rgb) - lum(texture2D(tIn, uv - vec2(0., 3.) * px).rgb));
      col *= 1. - smoothstep(.04, .22, e) * .16;
      // the paper's tooth, fixed
      col *= .965 + .055 * vn(p * .33) + .02 * vn(p * .09 + 4.);
      gl_FragColor = vec4(mix(src, col, uG), 1.);
    }`, { tIn: { value: null }, px: { value: new THREE.Vector2(1 / film.w, 1 / film.h) }, uG: { value: 0 } });
  const realSRT = R.setRenderTarget.bind(R);
  function renderAll(t, uG) {
    if (window.__NOREN) return;
    if (uG <= .002 || NOPASS) { film.render(t); return; }
    R.setRenderTarget = (tg, ...a) => realSRT(tg === null ? rtA : tg, ...a);
    try { film.render(t); } finally { R.setRenderTarget = realSRT; }
    gouache.u.tIn.value = rtA.texture; gouache.u.uG.value = uG; realSRT(null); R.render(gouache.sc, ocam);
  }

  // ---------------------------------------------------------------- one frame
  const F_C = { c1: ['c1'], c2: ['c2'], c3: ['c3'], c4: ['c4'] };
  let lastShot = null;
  const camTmp = V();
  const setLeaf = () => {};
  const DYN = WU.uDyn.value, POOL = WU.uPool.value, POOLN = WU.uPoolN.value;
  function clearWarm() { for (const d of DYN) d.set(0, 0, 0, 0); for (const p of POOL) p.set(0, 0, 0, 0); for (const s of segs) { s.k = 0; s.front = -1; } WU.uGate.value.set(0, 0, 0, 0); WU.uRest.value.set(0, 0, 0, 0); }
  function pushSegs() { segs.forEach((s, i) => { if (i >= NS) return; WU.uSegA.value[i].set(s.ax, s.az, s.bx, s.bz); WU.uSegF.value[i].set(s.front, s.L, s.k, s.w); }); }
  const flames = { n: 0 };   // dynamic flame slots after the static lamps
  function dynFlame(pos, k, sc = 1, hs = .95) { const i = NL + flames.n++; if (flames.n > NDY) return; setFlame(i, pos, k, sc, hs); }
  function setLamp(Lp, pos, power) { Lp.pos.copy(pos); Lp.power = power; }
  function setup(shot, t) {
    // reset
    clearWarm(); flames.n = 0; for (let i = NL; i < NL + NDY; i++) { core.geometry.attributes.aK.setX(i, 0); halo.geometry.attributes.aK.setX(i, 0); }
    for (const k of ['door', 'room', 'gate', 'hand', 'knock', 'rest']) L[k].power = 0; for (const l of L.lb) l.power = 0; for (const l of L.near) l.power = 0;
    for (let i = 0; i < NG * 4; i++) gk[i] = 0;
    ROOM.k.value = 0; doorSpot.intensity = 0; knockSpot.intensity = 0; shaft.visible = false; shaftM.uniforms.uK.value = 0;
    for (let i = 0; i < NM; i++) motes.geometry.attributes.aK.setX(i, 0);
    const lampsOn = shot === 'c3' || shot === 'c4' ? 1 : 0; WU.uLampsOn.value = lampsOn;
    for (let i = 0; i < NL; i++) { const fl = .92 + .08 * Math.sin(t * 6.1 + i * 1.7) * Math.sin(t * 3.3 + i * .9); core.geometry.attributes.aK.setX(i, lampsOn * fl); halo.geometry.attributes.aK.setX(i, lampsOn * fl); }
    clayMesh.visible = lampsOn > 0;
    // the windows: a few lit everywhere (each its own steady glow)
    const late = shot === 'c4' ? ss(B.Q20 - 2, B.Q20 + 4, t) : 0;   // over the town: more homes awake, lamps lit inside
    for (const w of WINS) setGlow(1000 + w.i, (w.lit || (late > 0 && (w.i * 7) % 10 < 5)) ? (.55 + .2 * ((w.i * 37) % 7) / 7) * (w.lit ? 1 : late) * (1 + 1.6 * late) : 0);
    // doors: open lit doors here and there from C3 on (people at home with the lamp lit)
    for (const d of DOORS) setGlow(d.i, lampsOn ? (((d.i * 53) % 9 === 0) ? .55 : 0) + (((d.i * 31) % 10 < 3) ? 1.1 * late : 0) : 0);
    // film look per shot
    Object.assign(film.look, look0); film.atmos.density = atm0.density; film.atmos.falloff = atm0.falloff; film.bloomCfg.strength = .09; moonL.intensity = 1.5; hemi.intensity = .82;
    const c = camAt(shot, t); setCam(c);
    // people
    for (const F of FIG) { F.g.visible = F.shots.has(shot); if (F.g.visible && F.anim) F.anim(t); }
    for (const it2 of ITEMS) it2.m.visible = false;
    // shot by shot
    if (shot === 'c1') setupC1(t); else if (shot === 'c2') setupC2(t); else if (shot === 'c3') setupC3(t); else setupC4(t);
    // the nearest lit door lamps glow in the fog (rank-faded so a lamp enters and leaves the set at zero)
    if (lampsOn) { camTmp.copy(cam.position); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion);
      const cand = []; for (let i = 0; i < NL; i++) { const Lm = LAMPS[i], dx = Lm.x - camTmp.x, dy = Lm.y - camTmp.y, dz = Lm.z - camTmp.z, d = Math.hypot(dx, dy, dz); if (dx * fwd.x + dy * fwd.y + dz * fwd.z < -2) continue; cand.push([d, i]); }
      cand.sort((a, b) => a[0] - b[0]); const dA = cand[6] ? cand[6][0] : 1e9, dB = cand[10] ? cand[10][0] : 1e9;
      for (let k = 0; k < 10 && k < cand.length; k++) { const [d, i] = cand[k], w = dB > dA ? 1 - ss(dA, dB, d) : 1; setLamp(L.near[k], V(LAMPS[i].x, LAMPS[i].y + .1, LAMPS[i].z), 1.1 * w * lampsOn); } }
    pushSegs();
    for (const a of ['position', 'aK', 'aS']) { core.geometry.attributes[a].needsUpdate = true; halo.geometry.attributes[a].needsUpdate = true; }
    motes.geometry.attributes.position.needsUpdate = true; motes.geometry.attributes.aK.needsUpdate = true; gTex.needsUpdate = true;
  }
  const lampOnHand = (F, i, itm, k = 1, lp = null) => { const h = handW(F.g, i); itm.m.visible = true; itm.m.position.copy(h).add(V(0, .035, 0)); itm.m.rotation.set(0, F.g.rotation.y, 0);
    const fp = h.clone().add(V(0, .085, 0)).addScaledVector(V(0, 0, -1).applyAxisAngle(V(0, 1, 0), F.g.rotation.y), .07); dynFlame(fp, k, 1.1, 1.15); if (lp) setLamp(lp, fp, 1.4 * k); return fp; };
  const moteBeam = (i0, n, f) => { for (let i = 0; i < n; i++) { const r = MSEED[(i0 + i) % NM], q = f(r, i); if (!q) continue; motes.geometry.attributes.position.setXYZ(i0 + i, q[0], q[1], q[2]); motes.geometry.attributes.aK.setX(i0 + i, q[3]); } };

  function setupC1(t) {
    setMoon(-6, -26, 52);
    film.dofCfg.focus = lerp(7.0, 9, ss(T.dev[1], B.Q19c + 3, t)); film.dofCfg.aperture = lerp(.6, 2.0, ss(T.dev[0], T.dev[1], t));
    // the room's lamp and the door: burning already (the end of 7-2), then pouring out
    const pour = ss(T.pour[0], T.pour[1], t);
    ROOM.k.value = 2.2 + 1.6 * pour; setLamp(L.room, ROOM.pos.clone().add(V(0, .1, 0)), 1.5 + pour);
    dynFlame(V(0.0, .83, -3.0), 1.0 + .3 * pour, 1.2, 1.2);
    doorSpot.intensity = 24 + 86 * pour; setLamp(L.door, V(0, 1.0, .35), 1.2 + 2.6 * pour);
    POOL[0].set(0, 0, .2, 1.1 + 1.2 * pour); POOLN[0].set(0, 1, 0, 0);
    // the light runs: out of the door, across the square, down lane A into the far alleys
    const sF = flowS(t), fade = 1 - .35 * ss(B.Q19c + 4, B.N34, t);
    C1S.forEach((s, i) => { const f = sF - C1S0[i]; s.front = clamp(f, -1, s.L + 4); s.k = (f > 0 ? 1 : 0) * (i < 3 ? 1.35 : 1.15 * (i >= 5 ? .85 : 1)) * fade; s.w = C1W[i]; });
    // the murmurers' lamp glow: nothing; the lamp on the ledge by the door (Zacchaeus takes it up in C2)
    it.zlamp.m.visible = true; it.zlamp.m.position.copy(LEDGE).add(V(0, -.04, 0)); dynFlame(LEDGE.clone().add(V(0, .06, -.06)), .9, 1.0, 1.1); DYN[0].set(LEDGE.x, LEDGE.y + .05, LEDGE.z + .1, .9);
    // motes in the doorway's beam only
    moteBeam(0, 26, (r) => { const u = (r[0] + t * .012 * (1 + r[3])) % 1, z = .3 + u * 3.6, sp = .2 + z * .1, x = (r[1] - .5) * 2 * sp, y = .25 + r[2] * (1.5 - z * .18) + .05 * Math.sin(t * .5 + r[4] * 6);
      const inB = Math.exp(-x * x / (sp * sp * .5)); return [x, y, z, inB * .7 * pour * ss(T.dev[1] - 1.2, T.dev[1], t) * ss(0, .1, u) * (1 - ss(.85, 1, u)) * (1 - ss(B.Q19c - 1, B.Q19c + 2, t))]; });
  }
  function setupC2(t) {
    setMoon(2, 0, 30);
    // focus on the giving, then on him with the lamp
    const zd = ZA.g.position.distanceTo(cam.position); film.dofCfg.focus = lerp(cam.position.distanceTo(V(0, 1, 1.1)), zd, ss(T.walk[0] - .3, T.walk[0] + 1.5, t)); film.dofCfg.aperture = 2.4;
    ROOM.k.value = 3.6; setLamp(L.room, ROOM.pos.clone().add(V(0, .1, 0)), 1.0); dynFlame(V(0, .83, -3.0), 1.2, 1.2, 1.2);
    doorSpot.intensity = 120; setLamp(L.door, V(0, 1.1, -.2), .3); moonL.intensity = .95; hemi.intensity = .6; POOL[0].set(0, 0, .2, 2.0); POOLN[0].set(0, 1, 0, 0);
    // the gifts: bread, coins — a small warm glow on each one as it passes from hand to hand
    const g1 = give(t, T.give1), g2 = give(t, T.give2), g3 = give(t, T.give3), g4 = give(t, T.give4);
    const show = (itm, pos, glowK) => { itm.m.visible = true; itm.m.position.copy(pos); if (glowK > 0) dynFlame(pos.clone().add(V(0, .03, 0)), glowK * .5, .9, 1.4); };
    // b1: Zacchaeus → the old man; the old man halves it: b1h goes to the child
    const zR = handW(ZA.g, 1), oR = handW(OM.g, 1), cL = handW(CH.g, 0), sR = handW(SV.g, 1), wL = handW(WM.g, 0), lR = handW(LM2.g, 1);
    if (t < T.give1[1]) show(it.b1, zR.clone().add(V(0, .03, 0)), g1.out); else show(it.b1, oR.clone().add(V(0, .03, 0)), Math.max(1 - ss(T.give1[1], T.give1[1] + 1.2, t), bump(T.give3[0], T.give3[2], t) * .6));
    if (t > T.give3[0] - .2) { if (t < T.give3[1]) show(it.b1h, oR.clone().add(V(.05, .06, 0)), g3.out); else show(it.b1h, cL.clone().add(V(0, .03, 0)), 1 - ss(T.give3[1], T.give3[1] + 1.4, t)); }
    if (t > T.give2[0] - .6 && t < T.give2[2] + 2.2) { const p = t < T.give2[1] ? sR : wL; show(it.coins, p.clone().add(V(0, .01, 0)), t < T.give2[1] ? g2.out * .8 : .8 * (1 - ss(T.give2[1], T.give2[1] + 1.2, t))); it.coins.m.rotation.x = 1.2; }
    if (t < T.give4[1]) { if (t > T.give1[2] - .2) show(it.b2, zR.clone().add(V(0, .03, 0)), g4.out); } else show(it.b2, lR.clone().add(V(0, .03, 0)), 1 - ss(T.give4[1], T.give4[1] + 1.3, t));
    // the old man's staff (its foot on the ground beside him)
    { const h = handW(OM.g, 0); it.staff.m.visible = true; const foot = V(h.x, 0, h.z); it.staff.m.position.copy(foot).lerp(h, .5).add(V(0, 0, 0)); it.staff.m.position.y = .77; it.staff.m.position.x = h.x; it.staff.m.position.z = h.z; it.staff.m.rotation.set(0, 0, 0); }
    // the lamp: on the ledge, then in his left hand as he goes; its light moves with him; then the door that opens on a crack
    { const fp = lampOnHand(t < T.lamp[1] ? SV : ZA, 0, it.zlamp, 1, L.hand), away = ss(T.walk[0], T.walk[0] + 3, t); DYN[0].set(fp.x, fp.y, fp.z, .18 + 2.2 * away); }   // in the servant's hand, then his
    dynFlame(LEDGE.clone().add(V(0, .02, -.06)), .9); DYN[1].set(LEDGE.x, LEDGE.y + .05, LEDGE.z + .1, .8);   // the lamp on the ledge keeps burning
    const op = ss(T.open[0], T.open[1], t); KNOCK.leaf.rotation.y = knockLeaf(t);
    knockSpot.intensity = 95 * op; setLamp(L.knock, V(6.1, 1.1, -3.4), 2.6 * op); POOL[1].set(5.85, 0, -3.5, 1.6 * op); POOLN[1].set(-1, 0, 0, 0);
    // motes: in the doorway's beam (the giving), then in the crack's light
    moteBeam(0, 34, (r) => { const u = (r[0] + t * .011 * (1 + r[3])) % 1, z = .3 + u * 4.5, sp = .25 + z * .22, x = (r[1] - .5) * 2 * sp, y = .2 + r[2] * 1.8; return [x, y, z, Math.exp(-x * x / (sp * sp * .5)) * .9 * ss(0, .1, u) * (1 - ss(.85, 1, u)) * (1 - ss(T.walk[0], T.walk[0] + 3, t))]; });
    moteBeam(34, 18, (r) => { const u = (r[0] + t * .015) % 1, x = 5.9 - u * 2.4, sp = .2 + u * .5, z = -3.5 + (r[1] - .5) * 2 * sp, y = .3 + r[2] * 1.5; return [x, y, z, op * .9 * Math.exp(-((z + 3.5) ** 2) / (sp * sp * .6)) * ss(0, .1, u) * (1 - ss(.8, 1, u))]; });
  }
  function setupC3(t) {
    setMoon(-4.5, -38, 50);
    film.dofCfg.focus = lerp(9, 14, ss(B.N36, B.Q20b, t)); film.dofCfg.aperture = 2.0;
    // the gate opens on Q20a: its leaves swing out, the light beyond rises, the warm wash runs down the lane toward us
    const gk2 = eio((t - T.gate[0]) / (T.gate[1] - T.gate[0])), gl = ss(T.glow[0], T.glow[1], t), wf = lerp(-84, 4, eio((t - T.wash[0]) / (T.wash[1] - T.wash[0])));
    for (const lf of GATE.leaves) lf.m.rotation.y = lf.sd * 1.25 * gk2;
    gateGlowM.color.copy(col('#ffc27a', 3.2 * gl)); setLamp(L.gate, V(-4.5, 3.2, -96), 110 * gl);
    WU.uGate.value.set(.85 * gl, wf, 1, 0); WU.uPocket.value.set(-5.78, .6, -20.2, 1.4);
    C5A.front = clamp(-82 - wf + 85, -1, C5A.L); C5A.k = 0;   // (the wash is the gate light's running front)
    // the walker's lamp far ahead
    lampOnHand(WK, 0, wkLamp, 1, L.hand); { const h = handW(WK.g, 0); DYN[1].set(h.x, h.y, h.z, 1.4); }
    // motes in the gate's light (far down the lane)
    moteBeam(0, 30, (r) => { const z = -84 + r[0] * 34 + 2 * Math.sin(t * .1 + r[3] * 6), x = -4.5 + (r[1] - .5) * 3, y = .3 + r[2] * 3.2; return [x, y, z, gl * .8 * ss(wf + 6, wf - 4, z)]; });
  }
  function setupC4(t) {
    const c5 = t > B.Q20 - 1;
    setMoon(c5 ? -10 : -4.5, c5 ? -36 : -46, c5 ? 75 : 34);
    // the gate's light is on: everything in the same warm light
    for (const lf of GATE.leaves) lf.m.rotation.y = lf.sd * 1.25;
    gateGlowM.color.copy(col('#ffc27a', 3.2)); setLamp(L.gate, V(-4.5, 3.2, -96), 110);
    const gather = ss(T.rest[0], T.rest[1], t);
    WU.uGate.value.set(.85 * (1 - .8 * gather), 60, 1 - ss(T.rest[0] - .5, T.rest[0] + 2, t), 0); WU.uPocket.value.set(-5.78, .6, -20.2, 1.4);
    // the three doors: lit rooms, spills in front, and light on the gifts
    for (const [k, i] of [['E1', 2], ['E2', 3], ['E3', 4]]) { POOL[i].set(-1.4, 0, EV[k].z, 1.5); POOLN[i].set(-1, 0, 0, 0); }
    ROOM.k.value = 0; EV.E3.leaf.rotation.y = -1.45 * eio((t - (T.stranger[0] - .2)) / 1.6);
    const gB = give(t, T.bread), gW = give(t, T.water);
    { const p = t < T.bread[1] ? handW(E1W.g, 1) : handW(E1P.g, 1); it4.bread.m.visible = t < T.bread[2] + 6; it4.bread.m.position.copy(p).add(V(0, .03, 0)); dynFlame(p.clone().add(V(0, .04, 0)), .5 * Math.max(gB.out, gB.in), .9, 1.4); }
    { const a = t < T.water[1] ? handW(E2M.g, 0) : handW(E2T.g, 0), b = t < T.water[1] ? handW(E2M.g, 1) : handW(E2T.g, 1); it4.bowl.m.visible = true; it4.bowl.m.position.copy(a).lerp(b, .5).add(V(0, -.03, 0)); dynFlame(it4.bowl.m.position.clone().add(V(0, .08, 0)), .45 * Math.max(gW.out, gW.in), .9, 1.4); }
    { const h = handW(E3S.g, 1); it4.staff.m.visible = E3S.g.visible; it4.staff.m.position.set(h.x, .77, h.z); const sp = E3S.g.position, bk = V(0, 1.25 * E3S.s, .2).applyAxisAngle(V(0, 1, 0), E3S.g.rotation.y); it4.bundle.m.visible = true; it4.bundle.m.position.copy(sp).add(bk); }
    // event lights on the figures at each door (the room light falls on them)
    DYN[2].set(-.75, 1.35, EV.E1.z, 2.0); DYN[3].set(-.75, 1.35, EV.E2.z, 2.0); DYN[4].set(-.75, 1.4, EV.E3.z, 2.0);
    // the lamp-bearers' lamps
    LB.forEach((F, i) => { const fp = lampOnHand(F, 0, lbLamps[i], 1, L.lb[i]); if (i < 4) DYN[5 + i].set(fp.x, fp.y, fp.z, 1.1 * (1 - .6 * gather)); });
    // C5: the lamps join into one line — lane A from the north end down to the square (up the frame), then the streets out of it
    const tk = T.thread, fz = lerp(-82, 3, sine((t - tk[0]) / 7.2));
    C5A.front = clamp(fz + 82, -1, C5A.L); C5A.k = (t > tk[0] ? 2.4 : 0) * (1 - .85 * gather); C5A.w = 1.5;
    // each street: its own eased run (speed rises from 0 and settles at its end) from the moment lane A's front passes its junction
    C5N.forEach((s, i) => { const tj = C5J[i], D = s.L / 7 + 2.2, tau = (t - tj) / D; s.front = tau <= 0 ? -1 : (s.L + 4) * sine(tau); s.k = (tau > 0 ? 1.7 : 0) * (1 - .9 * gather); s.w = 1.25; });
    // the light rests on the small man: a pool on his doorstep, a soft shaft from above, a few motes in it; the bloom at the end
    const rk = gather; WU.uRest.value.set(-5.7, .45, -20.2, 2.9 * rk); setLamp(L.rest, V(-5.6, 2.6, -20.2), .3 * rk);
    if (rk > 0) { shaft.visible = true; shaft.position.set(-5.65, .0, -20.15); shaftM.uniforms.uK.value = rk * (1 + .25 * ss(T.bloom[0], T.bloom[1], t)); }
    moteBeam(40, 26, (r) => { const y = .2 + ((r[0] + t * .02 * (1 + r[3])) % 1) * 4.5, a = r[1] * 6.283, rr = Math.sqrt(r[2]) * (.45 + y * .07); return [-5.65 + Math.cos(a) * rr, y, -20.15 + Math.sin(a) * rr, rk * .85 * (1 - ss(3.2, 4.6, y))]; });
    // focus
    const fc = t < B.N36c + 1 ? cam.position.distanceTo(V(-1.6, 1.0, t < T.water[1] - 1 ? EV.E1.z : t < T.stranger[1] - 1 ? EV.E2.z : EV.E3.z)) : cam.position.distanceTo(V(-4.6, 1.2, -57.5));
    const fr = cam.position.distanceTo(V(-5.7, .5, -20.2)); film.dofCfg.focus = lerp(fc, fr, ss(B.Q20 + 1, B.N37 + 1, t)); film.dofCfg.aperture = lerp(2.0, .8, ss(B.Q20, B.Q20 + 4, t)) + .9 * ss(B.N37 + 3, B.N37 + 7, t);   // (focus on him exactly; the doorway behind softens)
    // grade: the crane over the town gets a touch more exposure (the lamps are small up there); the end blooms warm gold
    // over the town: a deeper night (teal-blue, deep shadows), aerial haze that thickens with distance, the threads glowing (bloom)
    const air = ss(B.Q20 + 1, B.Q20 + 6, t) * (1 - ss(B.N37 + 2, B.N37 + 6, t));
    film.look.exposure = look0.exposure * (1 - .2 * air); hemi.intensity = .82 - .4 * air; moonL.intensity = 1.5 - .25 * air;
    film.atmos.density = atm0.density * (1 + .5 * air); film.atmos.falloff = atm0.falloff * (1 - .55 * air); film.bloomCfg.strength = .09 + .07 * air;
    // the end: dark round him, his lamp-less doorstep the only light (the gate's light and the door lamps fall back)
    WU.uLampsOn.value = 1 - .55 * gather;
  }

  // ---------------------------------------------------------------- draw
  function frame(t, shot) {
    setup(shot, t);
    S.updateMatrixWorld(true);
    const uG = shot === 'c1' ? 1 - eio((t - T.dev[0]) / (T.dev[1] - T.dev[0])) : 0;
    renderAll(t, uG);
  }
  function draw(ctx, t, shot) {
    frame(t, shot);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(film.canvas, 0, 0, W, H); ctx.restore();
    if (shot === 'c4') {   // out: the light on him blooms warm gold (the next block — the gold illuminated world — takes it)
      const bk = ss(T.bloom[0], T.bloom[1], t); if (bk > 0) { const p = V(-5.7, .7, -20.2).project(cam), x = (p.x + 1) / 2 * W, y = (1 - p.y) / 2 * H;
        ctx.save(); ctx.globalCompositeOperation = 'screen'; const r = lerp(H * .12, H * .95, bk), g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(250,212,136,${.85 * bk})`); g.addColorStop(.4, `rgba(232,172,84,${.5 * bk})`); g.addColorStop(1, `rgba(196,134,50,${.22 * bk * bk})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = `rgba(214,152,62,${.32 * bk * bk * bk})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  }
  // numbers for the motion-continuity table: camera position/direction, emission (lamps lit, flow front, motes)
  function stats(t, shot) { window.__NOREN = true; try { setup(shot, t); } finally { window.__NOREN = false; }
    const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion); let mk = 0; for (let i = 0; i < NM; i++) mk += motes.geometry.attributes.aK.getX(i);
    let fl2 = 0; for (const s of segs) if (s.k > 0) fl2 += clamp(s.front, 0, s.L); let lamps = 0; for (let i = 0; i < NL + NDY; i++) lamps += core.geometry.attributes.aK.getX(i) > .3 ? 1 : 0;
    return { p: cam.position.toArray(), d: fwd.toArray(), fov: cam.fov, motes: mk, flow: fl2, lamps }; }
  function joints(t, shot) { setup(shot, t); const out = {}; for (const F of FIG) { if (!F.g.visible) continue; const U = F.g.userData, q = [];
      const dir = m => V(0, 1, 0).applyQuaternion(m.quaternion).toArray();   // a limb is a round bone: its direction is what moves (the roll about its axis is invisible)
      for (const A of U.arms) { q.push(dir(A.up), dir(A.fo)); } for (const Lg of U.legs) { q.push(dir(Lg.thigh), dir(Lg.shin)); }
      q.push(F.g.quaternion.toArray(), U.upper.quaternion.toArray(), U.neck.quaternion.toArray()); out[F.name] = q; } return out; }
  S.updateMatrixWorld(true);
  return { film, draw, frame, stats, joints, T, camAt, info: { houses: HOUSES.length, doors: DOORS.length, lamps: LAMPS.length, wins: WINS.length } };
}
