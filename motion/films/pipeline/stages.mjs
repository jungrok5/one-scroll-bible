// The film pipeline as code (관리자 2026-11-04: "전부 코드화 해서 항상 일관된 제작 절차와 동일한 수준의 결과물이 나올 수 있도록").
// Each stage: what it produces, the commands that (re)build it, the agent task for the creative part (a fixed brief in
// pipeline/tasks/), the gates that must pass before the next stage, and the approval it needs from the maintainer.
// Stage status is computed from the files every time (nothing to forget): a stage is done when its gates pass and its
// approval is recorded (film.mjs approve). film.mjs status prints the first stage that is not done and exactly what to do.
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';

export const ROOT = process.cwd(), FILMS = join(ROOT, 'motion/films'), OUT = join(ROOT, 'motion/out');
export const T = JSON.parse(readFileSync(join(FILMS, 'pipeline/targets.json'), 'utf8'));
const J = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const mt = f => existsSync(f) ? statSync(f).mtimeMs : 0;
const node = (args, o = {}) => spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 1 << 26, ...o });
export function ctx(film) {
  const d = join(FILMS, film), s = J(join(d, 'script.json')), lines = s ? (Array.isArray(s) ? s : s.lines || []) : [];
  return { film, d, s, lines, review: J(join(d, 'review.json')) || {}, place: J(join(d, 'sound/place.json')), cues: J(join(d, 'sound/cues.json')),
    up: (J(join(ROOT, 'motion/youtube/uploaded.json')) || {})[film], src: () => readdirSync(d).filter(f => /\.(html|js)$/.test(f)).map(f => join(d, f)) };
}
// the picture's code as one fingerprint (comments and whitespace dropped, so a comment edit does not demand a re-render);
// film.mjs run <film> picture writes it next to the render: motion/out/<film>-v-narr.mp4.src.json
import { createHash } from 'node:crypto';
export function srcHash(c) { const h = createHash('sha256');
  for (const f of c.src().sort()) h.update(f.split(/[\\/]/).pop() + '\n' + readFileSync(f, 'utf8').replace(/const QA_(PLANNED|HOLD) = \[[\s\S]*?\];/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1').replace(/\s+/g, ' '));
  for (const f of ['script.json']) if (existsSync(join(c.d, f))) h.update(readFileSync(join(c.d, f), 'utf8'));
  return h.digest('hex').slice(0, 16); }
const pass = () => ({ ok: true, why: [] }), fail = (...why) => ({ ok: false, why });
const all = (...rs) => { const why = rs.flatMap(r => r.ok ? [] : r.why); return why.length ? { ok: false, why } : pass(); };
const approved = (c, k) => (c.review.pipeline?.approvals || {})[k];

// ---------------------------------------------------------------------------------------------------- gates
const G = {
  topic: c => c.review.logline ? pass() : fail('review.json에 logline(한 줄 요약)이 없다'),
  script: c => {
    if (!c.s) return fail('script.json이 없다');
    const why = [], quotes = c.lines.filter(l => l.kind === 'quote');
    for (const l of quotes) if (!l.usfm || !l.cite) why.push(`인용 ${l.id}: usfm/cite 없음`);
    const r = node([join(FILMS, 'check-quotes.mjs'), c.film]); const bad = (r.stdout || '').split('\n').filter(x => /MISMATCH|MISSING/.test(x));
    if (r.status !== 0 || bad.length) why.push(...(bad.length ? bad.map(b => '인용 원문 불일치: ' + b) : ['check-quotes 실패: ' + (r.stderr || '').slice(0, 200)]));
    const mc = c.review.message_check; if (!mc || (Array.isArray(mc) ? mc.length : Object.keys(mc).length) < 12) why.push('message_check 12문항이 다 채워지지 않았다');
    return why.length ? { ok: false, why } : pass(); },
  looks: c => {
    const L = c.review.looks; if (!Array.isArray(L) || !L.length) return fail('review.json looks(장면마다 화풍 표)가 없다');
    const why = [], nw = L.filter(x => x.style_new).length, distinct = new Set(L.map(x => x.look.split(/[ (]/)[0])).size;
    if (nw < T.looks.new_min) why.push(`새 화풍 ${nw}개 — 적어도 ${T.looks.new_min}개`);
    if (T.looks.new_max != null && nw > T.looks.new_max) why.push(`새 화풍 ${nw}개 — 많아야 ${T.looks.new_max}개`);
    if (distinct < T.looks.distinct_min) why.push(`화풍 종류 ${distinct}개 — 적어도 ${T.looks.distinct_min}개`);
    for (let i = 1; i < L.length; i++) if (L[i].look === L[i - 1].look && !L[i].same_reason) why.push(`${L[i - 1].scene} → ${L[i].scene}: 같은 화풍이 이어진다(same_reason 없음)`);
    return why.length ? { ok: false, why } : pass(); },
  reviews: c => { const f = join(ROOT, 'motion/reviews', `film-${c.film}-script.md`); if (!existsSync(f)) return fail(`motion/reviews/film-${c.film}-script.md 없음`);
    const t = readFileSync(f, 'utf8'), why = []; if (!/관점 검수/.test(t)) why.push('리뷰 기록에 관점 검수가 없다'); if (!/성경 잘 모르는/.test(t)) why.push('리뷰 기록에 1번 대상(성경 잘 모르는 크리스천) 리뷰가 없다');
    if (!c.review.artifact_url) why.push('초안 페이지 artifact_url 없음'); return why.length ? { ok: false, why } : pass(); },
  picture: c => {
    const vid = join(OUT, `${c.film}-v-narr.mp4`); if (!existsSync(vid)) return fail(`렌더+소리본 motion/out/${c.film}-v-narr.mp4 없음`);
    const why = [], stamp = J(vid + '.src.json');
    if (stamp) { if (stamp.hash !== srcHash(c)) why.push('렌더 뒤에 그림 코드가 바뀌었다(내용 지문이 다름) — film.mjs run ' + c.film + ' picture'); }
    else { const old = c.src().filter(f => mt(f) > mt(vid)); if (old.length) why.push('렌더가 그림 코드보다 오래됐다: ' + old.map(f => f.split(/[\\/]/).pop()).join(', ')); }
    const r = node([join(FILMS, 'look-check.mjs'), vid, '--json', '--film', c.film]), j = JSON.parse((r.stdout || '[]').trim().split('\n').pop() || '[]')[0];
    if (!j) return fail('look-check 실패');
    if (j.brightness < T.look.brightness_min) why.push(`밝기 ${j.brightness} < ${T.look.brightness_min}`);
    if (j.dark > T.look.dark_max) why.push(`어두운 화면 ${(j.dark * 100).toFixed(0)}% > ${T.look.dark_max * 100}% — 가장 어두운 곳 ${j.darkest.map(([t]) => t + 's').join(' ')}`);
    if (j.still > T.look.still_max) why.push(`거의 멈춘 화면 ${(j.still * 100).toFixed(0)}% > ${T.look.still_max * 100}% — 가장 멈춘 곳 ${j.stillest.map(([t]) => t + 's').join(' ')}`);
    if (j.seconds > T.format.portrait_max_s + .5) why.push(`세로판 ${j.seconds}s > ${T.format.portrait_max_s}s`);
    // every frame (frame-qa.mjs): black, frozen, pops outside the film's planned effects, held share overall and per scene
    const q = node([join(FILMS, 'frame-qa.mjs'), vid, '--film', c.film, '--json']), F = JSON.parse((q.stdout || '{}').trim().split('\n').pop() || '{}'), TF = T.frames;
    if (F.frames) { if (F.black > TF.black_max) why.push(`검은 프레임 ${F.black}장 — ${F.blackAt.join(' ')}s`); if (F.frozen.length > TF.frozen_max) why.push(`얼어붙은 구간 ${F.frozen.map(([a, b]) => a + '–' + b + 's').join(' ')}`);
      if (F.pops.length > TF.pops_max) why.push(`튀는 프레임 ${F.pops.length}개 — ${F.pops.slice(0, 8).join(' ')}s (의도한 효과면 film.html QA_PLANNED에)`);
      if (F.held > TF.held_max) why.push(`정지 프레임 ${(F.held * 100).toFixed(0)}% > ${TF.held_max * 100}%`);
      for (const s of F.perScene) if (s.held > TF.scene_held_max) why.push(`${s.scene}(${s.a}–${s.b}s) 정지 ${(s.held * 100).toFixed(0)}% > ${TF.scene_held_max * 100}% — 멈춘 장면도 카메라가 천천히 밀려 들어가야 한다`);
      j.frames = { black: F.black, frozen: F.frozen.length, pops: F.pops.length, held: F.held };
      // darker-and-slower than anything in the first film (below its p10 on both the brightest tone and motion): named, judged by the look review
      const FF = TF.first_film; if (FF) j.below_first_film = F.perScene.filter(s => s.p98 < FF.p98[0] && s.motion < FF.motion[0]).map(s => `${s.scene}(${s.a}–${s.b}s)`); }
    // the TV cut (insight older-tv: a third of the long film's watch time is on a TV): rendered from the same code, fresh, no black/frozen frames
    if (T.format.tv_cut) { const hv = join(OUT, `${c.film}-h-narr.mp4`), hs = J(hv + '.src.json');
      if (!existsSync(hv)) why.push(`가로판(TV) motion/out/${c.film}-h-narr.mp4 없음`);
      else { if (!hs || hs.hash !== srcHash(c)) why.push('가로판 렌더가 지금 그림 코드가 아니다 — film.mjs run ' + c.film + ' picture');
        const qh = node([join(FILMS, 'frame-qa.mjs'), hv, '--film', c.film, '--json']), FH = JSON.parse((qh.stdout || '{}').trim().split('\n').pop() || '{}');
        if (FH.frames) { if (FH.black > TF.black_max) why.push(`가로판 검은 프레임 ${FH.black}장 — ${FH.blackAt.join(' ')}s`); if (FH.frozen.length > TF.frozen_max) why.push(`가로판 얼어붙은 구간 ${FH.frozen.map(([a, b]) => a + '–' + b + 's').join(' ')}`); j.frames_h = { black: FH.black, frozen: FH.frozen.length, held: FH.held }; } } }
    return why.length ? { ok: false, why, info: j } : { ok: true, why: [], info: j }; },
  // the picture scored scene by scene (.claude/workflows/film-look-review.js) — for this render, not an older one
  lookreview: c => { const why = [], TL = T.look_review;
    for (const ori of T.format.tv_cut ? ['v', 'h'] : ['v']) { const sfx = ori === 'h' ? '-h' : '', name = ori === 'h' ? '가로판 ' : '';
    const f = join(ROOT, 'motion/reviews', `film-${c.film}-look${sfx}.json`), R = J(f);
    if (!R) { why.push(`motion/reviews/film-${c.film}-look${sfx}.json 없음 — look-sheets.mjs ${c.film} --ori ${ori} → 워크플로 film-look-review`); continue; }
    const stamp = J(join(OUT, `${c.film}-${ori}-narr.mp4.src.json`));
    if (!stamp || R.render !== stamp.hash) why.push(`${name}그림 리뷰가 지금 렌더(${stamp?.hash})가 아니라 ${R.render}에 대한 것이다 — 다시 리뷰`);
    const m = new Map(); for (const r of R.reviewers) for (const s of r.scenes) m.set(s.scene, [...(m.get(s.scene) || []), s.score]);
    const means = [...m].map(([k, v]) => [k, v.reduce((a, b) => a + b, 0) / v.length]), all = means.reduce((a, [, v]) => a + v, 0) / Math.max(1, means.length);
    for (const [k, v] of means) if (v < TL.scene_min) why.push(`${name}${k} 그림 평균 ${v.toFixed(1)} < ${TL.scene_min}`);
    if (all < TL.mean_min) why.push(`${name}그림 전체 평균 ${all.toFixed(2)} < ${TL.mean_min}`);
    for (const r of R.reviewers) for (const x of r.fixes) if (x.severity === 'BLOCKER') why.push(`${name}BLOCKER(${r.key}) ${x.scene}${x.at != null ? ' ' + x.at + 's' : ''}: ${x.what}`); }
    return why.length ? { ok: false, why } : pass(); },
  // loop Shorts cut from the film (clips.mjs; insight shorts-loop): enough of them, each ~40 s, starting on a word, with the reason it loops
  clips: c => { const K = T.clips, L = c.review.clips || [], why = [];
    if (L.length < K.min) why.push(`review.json clips ${L.length}개 < ${K.min} — 끝이 처음으로 이어지는 짧은 쇼츠(clips.mjs)`);
    const R = J(join(OUT, `${c.film}-clips.json`)) || [], vid = join(OUT, `${c.film}-v-narr.mp4`);
    for (const x of L) { const r = R.find(o => o.id === x.id), f = join(OUT, `${c.film}-clip-${x.id}.mp4`);
      if (!r || !existsSync(f)) { why.push(`clip ${x.id}: 아직 안 만듦 — node motion/films/clips.mjs ${c.film}`); continue; }
      if (mt(f) < mt(vid)) why.push(`clip ${x.id}: 본편 렌더보다 오래됨 — clips.mjs 다시`);
      if (r.len < K.len_min || r.len > K.len_max) why.push(`clip ${x.id}: ${r.len}s — ${K.len_min}–${K.len_max}초(목표 ${K.len_goal})`);
      if (r.first == null || r.first > K.first_spoken_max) why.push(`clip ${x.id}: 첫 해설이 ${r.first}초 — ${K.first_spoken_max}초 안에`);
      if (!x.why) why.push(`clip ${x.id}: why(끝이 어떻게 처음으로 이어지는지) 없음`); if (!x.title) why.push(`clip ${x.id}: title 없음`); }
    return why.length ? { ok: false, why } : pass(); },
  sound: c => {
    if (!c.place || !c.cues) return fail('sound/place.json · cues.json 없음');
    const why = [], sd = join(c.d, 'sound');
    for (const l of c.lines) if (l.kind === 'narr' && !existsSync(join(sd, 'voice', l.id + '.mp3'))) why.push(`해설 ${l.id}: voice/${l.id}.mp3 없음`);
    for (const l of c.lines) if (l.kind === 'narr' && existsSync(join(sd, 'voice', l.id + '.mp3')) && c.place.at[l.id] == null && !(c.place.subs_extra || {})[l.id]) why.push(`해설 ${l.id}: place.json at 없음`);
    const sfx = c.cues.sfx || [], dur = c.place.dur || 180, perMin = sfx.length / (dur / 60); if (perMin < T.sound.sfx_per_min_min) why.push(`효과음 분당 ${perMin.toFixed(1)}개 < ${T.sound.sfx_per_min_min} (SOUND.md — 화면 동작마다 소리)`);
    if ((c.cues.ducks || []).length < T.sound.ducks_min) why.push(`숨 멈춤(ducks) ${(c.cues.ducks || []).length}개 < ${T.sound.ducks_min}`);
    for (const q of [...(c.cues.music || []), ...sfx]) { const f = q.file ? join(ROOT, q.file) : join(sd, 'audio', q.id + '.mp3'); if (!existsSync(f)) why.push(`소리 ${q.id}: 파일 없음`); }
    const pr = J(join(sd, 'prompts.json')), names = new Set((pr?.entries || []).map(e => e.name));
    for (const q of [...(c.cues.music || []), ...sfx]) if (!q.file && !names.has(q.id)) why.push(`소리 ${q.id}: 프롬프트 기록 없음(sound-prompts.mjs)`);
    const mix = join(OUT, `${c.film}-narr.wav`); if (!existsSync(mix)) why.push(`섞은 소리 motion/out/${c.film}-narr.wav 없음`);
    else { if ([join(sd, 'cues.json'), join(sd, 'place.json')].some(f => mt(f) > mt(mix))) why.push('섞기가 cues/place보다 오래됐다 — sound.mjs 다시');
      const r = node([join(FILMS, 'sound-check.mjs'), mix, '--json']), j = JSON.parse((r.stdout || '[]').trim().split('\n').pop() || '[]')[0];
      if (j) { if (Math.abs(j.lufs - T.sound.lufs) > T.sound.lufs_tol) why.push(`크기 ${j.lufs} LUFS (목표 ${T.sound.lufs}±${T.sound.lufs_tol})`); if (j.peak > T.sound.peak_max) why.push(`최대 ${j.peak} dBTP > ${T.sound.peak_max}`); } }
    if (!existsSync(join(sd, 'ko.vtt'))) why.push('sound/ko.vtt(위쪽 자막) 없음');
    // word-level sync: every voiced gold word lights on its spoken word (word-sync.mjs, Scribe timings of the voice track)
    const wf = join(sd, 'words-ko.json'), voice = join(OUT, `${c.film}-voice.wav`);
    if (!existsSync(wf)) why.push('sound/words-ko.json(해설 단어 시각) 없음 — 목소리 트랙을 받아쓰기');
    else { if (existsSync(voice) && [join(sd, 'place.json')].some(f => mt(f) > mt(wf))) why.push('해설 배치가 바뀐 뒤 단어 시각을 다시 받지 않았다');
      const w = node([join(FILMS, 'word-sync.mjs'), c.film, '--json']), arr = JSON.parse((w.stdout || '[]').trim() || '[]');
      for (const o of arr) if (o.delta == null && !o.note) why.push(`${o.id} 「${o.hl}」 금빛 시각이 없다 — word-sync.mjs --write`); else if (o.delta != null && Math.abs(o.delta) > T.sound.word_tol_s) why.push(`${o.id} 「${o.hl}」 금빛이 말과 ${o.delta > 0 ? '+' : ''}${o.delta}s 어긋남 — word-sync.mjs ${c.film} --write`); }
    return why.length ? { ok: false, why } : pass(); },
  sheet: c => {
    const f = join(c.d, 'upload.md'); if (!existsSync(f)) return fail('upload.md 없음'); if (!existsSync(join(c.d, 'youtube.json'))) return fail('youtube.json 없음');
    const t = readFileSync(f, 'utf8'), why = []; for (const k of ['제목', '설명', '태그', '고정 댓글']) if (!t.includes(k)) why.push(`upload.md에 '${k}' 칸이 없다`);
    const y = J(join(c.d, 'youtube.json')) || {}, items = Array.isArray(y) ? y : (y.videos || Object.values(y).filter(v => v && typeof v === 'object'));
    for (const v of items) { if (v.title && v.title.length > T.upload.title_max) why.push(`제목 ${v.title.length}자 > ${T.upload.title_max}`);
      const first = (v.description || '').split('\n')[0]; if (first && first.length > T.upload.first_line_max) why.push(`설명 첫 줄 ${first.length}자 > ${T.upload.first_line_max}(단톡방 미리보기)`);
      if (/ElevenLabs/.test(v.description || '')) why.push(`${v.title || ''}: 설명에 도구 크레딧 줄 — 빼기로 함(motion/youtube/credit.mjs)`); }
    return why.length ? { ok: false, why } : pass(); },
  publish: c => { const u = c.up; if (!u?.h?.id || !u?.v?.id) return fail('uploaded.json에 가로·세로 id 없음');
    const why = []; for (const k of ['h', 'v']) { const at = u[k].publish_at; if (!at) { why.push(`${k}: publish_at 없음`); continue; }
      const kst = new Date(Date.parse(at) + 9 * 3600e3); if (T.upload.no_sunday_kst && kst.getUTCDay() === 0) why.push(`${k}: 공개가 주일(KST)`); }
    return why.length ? { ok: false, why } : pass(); },
  social: c => c.up?.instagram && c.up?.threads ? pass() : fail('uploaded.json에 instagram·threads 기록 없음'),
  after: c => { const u = c.up || {}, why = []; if (!u.h?.pinned_comment || !u.v?.pinned_comment) why.push('고정 댓글 id 없음');
    if (!/end screen|최종 화면/i.test(JSON.stringify(u.h || {}))) why.push('가로판 최종 화면 기록 없음'); if (!/related/i.test(JSON.stringify(u.v || {}))) why.push('쇼츠 관련 동영상 기록 없음');
    return why.length ? { ok: false, why } : pass(); },
  // every new look of this film is packaged as a motion-skills canvas-film kit (관리자 2026-11-04: "화풍 추가되면 재사용할 수 있게 캔버스필름에 추가")
  kits: c => { const L = (c.review.looks || []).filter(x => x.style_new), why = [];
    for (const x of L) { if (x.skill) {   // a look that is its own motion-skills skill (three.js, not a canvas-film kit): the shot goes back as that skill's example
        if (!x.example || !existsSync(join(T.looks.skills_kits, '..', '..', x.example, 'README.md'))) why.push(`새 화풍 "${x.look}"(${x.scene}): motion-skills ${x.skill}에 이 샷의 견본(looks[].example/README.md)이 없다`); continue; }
      if (!x.kit) { why.push(`새 화풍 "${x.look}"(${x.scene}): looks[].kit(키트 이름)이 없다`); continue; }
      const k = join(T.looks.skills_kits, x.kit); for (const f of ['kit.js', 'STYLE.md', 'template.html', 'script.example.js']) if (!existsSync(join(k, f))) why.push(`키트 ${x.kit}: ${f} 없음`);
      const v = join(c.d, `kit-${x.kit}.js`); if (!existsSync(v)) why.push(`영상이 키트를 쓰지 않는다: ${c.film}/kit-${x.kit}.js 없음`);
      else if (existsSync(join(k, 'kit.js')) && readFileSync(v, 'utf8').replace(/\r/g, '') !== readFileSync(join(k, 'kit.js'), 'utf8').replace(/\r/g, '')) why.push(`kit-${x.kit}.js가 키트 원본과 다르다(키트를 고쳤으면 다시 복사하거나 원본에 반영)`); }
    const idx = join(T.looks.skills_kits, '..', 'references', 'STYLE-INDEX.md'); if (existsSync(idx)) { const s = readFileSync(idx, 'utf8'); for (const x of L) if (x.kit && !x.skill && !s.includes('`' + x.kit + '`')) why.push(`STYLE-INDEX에 ${x.kit}가 없다(scripts/style-index.py)`); }
    return why.length ? { ok: false, why } : pass(); },
  captions: c => { const have = new Set(c.up?.captions || []), miss = T.captions.langs.filter(l => !have.has(l)); return miss.length ? fail(`자막 없는 언어 ${miss.length}개: ${miss.join(' ')}`) : pass(); },
};

// ---------------------------------------------------------------------------------------------------- stages
export const STAGES = [
  { id: 'topic', n: 1, name: '주제', task: 'topic', gates: ['topic'], approve: '관리자가 주제를 고름' },
  { id: 'script', n: 2, name: '원고·장면별 화풍·메시지 점검', task: 'script', gates: ['script', 'looks'] },
  { id: 'review', n: 3, name: '관점 검수·시청자 리뷰·초안 페이지', task: 'review', run: [['node', 'motion/films/review-page.mjs', '{film}']], gates: ['reviews'], approve: '관리자·아내가 초안을 컨펌' },
  { id: 'picture', n: 4, name: '그리기·렌더', task: 'picture', run: [['node', 'motion/render.mjs', 'v', '--page', 'films/{film}/film.html', '--workers', '6'], ['node', 'motion/films/sound.mjs', '{film}', 'v'], ['node', 'motion/render.mjs', 'h', '--page', 'films/{film}/film.html', '--workers', '6'], ['node', 'motion/films/sound.mjs', '{film}', 'h']], gates: ['picture', 'lookreview'], approve: '관리자·가족이 시안 확인' },
  { id: 'kits', n: 4.5, name: '새 화풍을 canvas-film 키트로', task: 'kits', gates: ['kits'] },
  { id: 'sound', n: 5, name: '해설·음악·효과음·섞기', task: 'sound', run: [['node', 'motion/films/sound.mjs', '{film}', 'v'], ['node', 'motion/films/sound-prompts.mjs', 'md', 'motion/films/{film}/sound/prompts.json']], gates: ['sound'] },
  { id: 'clips', n: 5.5, name: '반복용 짧은 쇼츠(끝이 처음으로)', task: 'clips', run: [['node', 'motion/films/clips.mjs', '{film}']], gates: ['clips'] },
  { id: 'sheet', n: 6, name: '올릴 글·썸네일', task: 'sheet', gates: ['sheet'] },
  { id: 'publish', n: 7, name: '한국어 채널 올리기·예약', task: 'publish', gates: ['publish'], approve: '관리자가 공개 시각 OK' },
  { id: 'social', n: 8, name: '인스타·스레드', task: 'social', gates: ['social'] },
  { id: 'after', n: 9, name: '공개 직후(고정 댓글·최종 화면·관련 동영상)', task: 'after', gates: ['after'] },
  { id: 'captions', n: 11, name: '외국어 자막 27개', task: 'captions', gates: ['captions'] },
];
// ---------------------------------------------------------------------------------------------------- insights
// pipeline/insights.json: what the numbers taught (the periodic analysis writes it). Active rules with a `check` are gates of
// their stages; the rest are printed with the stage's brief (film.mjs task).
export const INSIGHTS = (J(join(FILMS, 'pipeline/insights.json')) || { insights: [] }).insights;
const spoken = l => (l.kind === 'narr' || l.kind === 'quote') && l.voice !== null;
const IC = {
  narr_voiced: c => { const silent = c.lines.filter(l => l.kind === 'narr' && l.voice === null); return silent.length ? fail(`해설 ${silent.map(l => l.id).join(' ')}에 목소리가 없다(voice: null)`) : pass(); },
  hook: c => { const L = c.lines.filter(l => l.at != null).sort((a, b) => a.at - b.at), first = L.find(spoken), q = L.find(l => l.kind === 'narr' && /\?\s*$/.test(l.text.trim()));
    const why = []; if (!first || first.at > 1.0) why.push(`첫 해설이 ${first ? first.at + '초' : '없음'} — 1초 안에 시작`);
    if (!q || q.at > 10) why.push(`영상을 붙잡는 질문(물음표 해설)이 ${q ? q.at + '초(' + q.id + ')' : '없음'} — 10초 안에`); return why.length ? fail(...why) : pass(); },
};
export function insightGate(c, stageId) {
  const act = INSIGHTS.filter(x => x.status === 'active' && x.check && (x.stages || []).includes(stageId) && IC[x.check]);
  if (!act.length) return null;
  const why = act.flatMap(x => { const r = IC[x.check](c); return r.ok ? [] : r.why.map(w => `[인사이트 ${x.id}] ${w}`); });
  return why.length ? { ok: false, why } : pass();
}
export function stageStatus(c, st) {
  const results = st.gates.map(g => [g, G[g](c)]), ig = insightGate(c, st.id); if (ig) results.push(['insights', ig]);
  const ok = results.every(([, r]) => r.ok), ap = st.approve ? approved(c, st.id) : true;
  return { ok, approved: !!ap, done: ok && !!ap, results };
}
