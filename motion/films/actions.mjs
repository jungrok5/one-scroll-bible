// The action sheet SOUND.md asks for ("동작표부터"): everything that starts moving or appears on screen, with its start and length,
// read from the film's code and from the render — then which of them have no effect at that moment.
//   node motion/films/actions.mjs <film> [--json] [--no-video]     → motion/films/<film>/sound/actions.json + a table
// Sources:
//   code   — clamp((t - a) / d) and ss(a, b, t) in film.html and the film's *.js (film-time numbers inside the film's length)
//   text   — TEXT rows: a verse (quote), its gold word (hlAt), a verse link, the end card; subtitles are listed but need no effect
//   scene  — SCENES joins (a 0.7 s dissolve: music or a soft whoosh carries it)
//   flash  — big picture changes measured in the render (ffmpeg scene score ≥ 0.25 on motion/out/<film>-v-narr.mp4)
// Covered = an effect (cues.json sfx) starts within ±0.5 s (music cue starts count for scene joins). The sound gate reads
// actions.json: share of gold words · links · flashes covered ≥ targets.json sound.action_cover_min.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2);
const asJson = args.includes('--json'), noVideo = args.includes('--no-video'), film = args.find(a => !a.startsWith('--'));
if (!film) { console.error('usage: actions.mjs <film> [--json] [--no-video]'); process.exit(1); }
const D = join(HERE, film), S = join(D, 'sound'), J = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const cues = J(join(S, 'cues.json')) || { sfx: [], music: [] }, html = readFileSync(join(D, 'film.html'), 'utf8');
const dur = +(html.match(/FILM_DUR\s*=\s*([\d.]+)/)?.[1] || cues.dur || 180), A = [];
const num = x => +(+x).toFixed(2);

// 1. code
for (const f of ['film.html', ...readdirSync(D).filter(f => f.endsWith('.js') && !f.startsWith('kit-'))]) {
  const src = readFileSync(join(D, f), 'utf8').split('\n');
  src.forEach((line, i) => {
    for (const m of line.matchAll(/clamp\(\(t\s*-\s*([\d.]+)\)\s*\/\s*([\d.]+)\)/g)) A.push({ t: num(m[1]), len: num(m[2]), kind: 'code', what: `${f}:${i + 1} ${line.trim().slice(0, 70)}` });
    for (const m of line.matchAll(/\bss\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*t\s*\)/g)) A.push({ t: num(m[1]), len: num(m[2] - m[1]), kind: 'code', what: `${f}:${i + 1} ${line.trim().slice(0, 70)}` });
  });
}
// 2. text table
const T = html.match(/const TEXT = \[([\s\S]*?)\n\];/)?.[1] || '';
for (const m of T.matchAll(/\['(\w+)',\s*'([^']+)',\s*([\d.]+),\s*([\d.]+)([^\]]*)/g)) {
  const [, kind, id, a, b, rest] = m; if (kind === 'sub' || kind === 'label') { A.push({ t: num(a), len: num(b - a), kind: 'sub', what: `${kind} ${id}` }); continue; }
  A.push({ t: num(a), len: num(b - a), kind: kind === 'link' ? 'link' : kind === 'end' ? 'end' : 'quote', what: `${kind} ${id}` });
  const hl = rest.match(/hlAt:\s*([\d.]+)/); if (hl) A.push({ t: num(hl[1]), len: 1.2, kind: 'gold', what: `gold word of ${id}` });
  const to = rest.match(/to:\s*'([^']+)'/); if (kind === 'link' && to) A.push({ t: num(b), len: 1, kind: 'link', what: `link ${id} → ${to[1]}` });
}
// 3. scene joins
const SC = html.match(/const SCENES = \[([\s\S]*?)\n\];/)?.[1] || '';
for (const m of SC.matchAll(/\[\s*([\d.]+)\s*,\s*([\d.]+)\s*,/g)) if (+m[1] > 0) A.push({ t: num(m[1]), len: .7, kind: 'scene', what: `scene from ${m[1]} to ${m[2]}` });
// 4. measured flashes
const vid = join(HERE, '..', 'out', `${film}-v-narr.mp4`);
if (!noVideo && existsSync(vid)) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', vid, '-vf', "scale=270:-2,select='gt(scene,0.25)',showinfo", '-an', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stderr || '';
  for (const m of r.matchAll(/pts_time:([\d.]+)/g)) A.push({ t: num(m[1]), len: .3, kind: 'flash', what: 'big change in the render (scene score ≥ 0.25)' });
}
const inFilm = A.filter(x => x.t >= 0 && x.t <= dur).sort((a, b) => a.t - b.t);
// dedupe code entries that sit on the same moment
const acts = inFilm.filter((x, i, L) => !(x.kind === 'code' && L.slice(0, i).some(y => y.kind === 'code' && Math.abs(y.t - x.t) < .2)));
const sfx = (cues.sfx || []).map(q => q.at), mus = (cues.music || []).map(q => q.at);
for (const x of acts) { const near = sfx.filter(a => Math.abs(a - x.t) <= .5); x.covered = near.length > 0 || (x.kind === 'scene' && mus.some(a => Math.abs(a - x.t) <= 1)); x.sfx = (cues.sfx || []).filter(q => Math.abs(q.at - x.t) <= .5).map(q => q.id); }
const need = acts.filter(x => ['gold', 'link', 'flash', 'end'].includes(x.kind)), cover = need.length ? +(need.filter(x => x.covered).length / need.length).toFixed(2) : 1;
const outFile = { film, dur, made: new Date().toISOString().slice(0, 16), cover, need: need.length, actions: acts };
writeFileSync(join(S, 'actions.json'), JSON.stringify(outFile, null, 1) + '\n');
if (asJson) { console.log(JSON.stringify({ cover, need: need.length, uncovered: need.filter(x => !x.covered) })); process.exit(0); }
console.log(`「${film}」 동작 ${acts.length}개 (코드 ${acts.filter(x => x.kind === 'code').length} · 글자 ${acts.filter(x => ['sub', 'quote', 'gold', 'link', 'end'].includes(x.kind)).length} · 장면 이음 ${acts.filter(x => x.kind === 'scene').length} · 렌더에서 잰 큰 변화 ${acts.filter(x => x.kind === 'flash').length}) → sound/actions.json`);
console.log(`소리가 꼭 있어야 하는 동작(금빛 말·말씀 잇기·큰 변화·끝 화면) ${need.length}개 중 효과음 있음 ${Math.round(cover * 100)}%`);
for (const x of acts) if (x.kind !== 'sub') console.log(`${x.covered ? '  ' : '✗ '}${String(x.t).padStart(6)}s ${String(x.len).padStart(5)}s  ${x.kind.padEnd(5)} ${x.what}${x.sfx.length ? '  ← ' + x.sfx.join(',') : ''}`);
