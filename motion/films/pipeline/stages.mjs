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
const intlRec = c => (J(join(ROOT, 'motion/youtube/uploaded.json')) || {}).global?.films?.[c.film];   // the international cut's record
// script-stats.mjs once per check (syllables, quote pace and holds, take loudness, end card) — memoized on the context
function stats(c, o = {}) { const k = o.noAudio ? '_statsText' : '_stats'; if (c[k] !== undefined) return c[k]; if (o.noAudio && c._stats) return c._stats;
  const r = node([join(FILMS, 'script-stats.mjs'), c.film, '--json', ...(o.noAudio ? ['--no-audio'] : [])]);
  try { c[k] = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch { c[k] = null; } return c[k]; }

// ---------------------------------------------------------------------------------------------------- gates
const G = {
  // the topic comes from the backlog with its numbers (topic.mjs; README 10절), not from a session
  topic: c => { const why = []; if (!c.review.logline) why.push('review.json에 logline(한 줄 요약)이 없다');
    const B = J(join(FILMS, 'pipeline/topics.json')) || { topics: [] }, t = B.topics.find(x => x.id === c.review.topic_id);
    if (!t) why.push(`review.json topic_id가 pipeline/topics.json에 없다 — node motion/films/topic.mjs pick <id> ${c.film}`);
    else if (t.film !== c.film) why.push(`topics.json ${t.id}.film이 ${c.film}이 아니다 — topic.mjs pick`);
    const ev = c.review.topic_evidence || []; if (ev.filter(e => e.fact && e.source && /\d/.test(e.fact)).length < 2) why.push('topic_evidence: 출처가 있는 숫자 근거 2개 이상(topic.mjs cite → pick)');
    return why.length ? { ok: false, why } : pass(); },
  script: c => {
    if (!c.s) return fail('script.json이 없다');
    const why = [], quotes = c.lines.filter(l => l.kind === 'quote');
    for (const l of quotes) if (!l.usfm || !l.cite) why.push(`인용 ${l.id}: usfm/cite 없음`);
    const r = node([join(FILMS, 'check-quotes.mjs'), c.film]); const bad = (r.stdout || '').split('\n').filter(x => /MISMATCH|MISSING/.test(x));
    if (r.status !== 0 || bad.length) why.push(...(bad.length ? bad.map(b => '인용 원문 불일치: ' + b) : ['check-quotes 실패: ' + (r.stderr || '').slice(0, 200)]));
    const mc = c.review.message_check; if (!mc || (Array.isArray(mc) ? mc.length : Object.keys(mc).length) < 12) why.push('message_check 12문항이 다 채워지지 않았다');
    // a story, not a list of verses (README 3): question → stakes → person → reversal → payoff, each tied to a script line
    const sp = c.review.story_spine || {}, at = id => c.lines.find(l => l.id === id)?.at;
    // + surprise: what someone who never read it did not know (관리자 2026-11-06 "이 영상에 사람들이 몰랐던 사실이 뭐지?")
    for (const k of ['question', 'stakes', 'person', 'reversal', 'payoff', 'surprise']) {
      const v = sp[k]; if (!v?.how || !v?.id) { why.push(`story_spine.${k}이 없다 — 이야기 뼈대(README 3절)부터`); continue; }
      if (at(v.id) == null) why.push(`story_spine.${k}: script.json에 줄 ${v.id}이 없다`); }
    if (at(sp.question?.id) != null && at(sp.payoff?.id) != null && at(sp.payoff.id) <= at(sp.question.id)) why.push('story_spine: payoff(답)가 question(질문)보다 뒤에 와야 한다');
    // the shot list: every line says what is seen while it plays (관리자 2026-11-07 "그림과 내용이 따로 노는지") — shots-sheet.py checks the render against it
    const noShot = c.lines.filter(l => l.at != null && ['narr', 'quote', 'label', 'title'].includes(l.kind) && !(l.screen || '').trim()).map(l => l.id);
    if (noShot.length) why.push(`장면표: screen(그 줄 동안 보이는 것)이 없는 줄 ${noShot.join(' ')}`);
    return why.length ? { ok: false, why } : pass(); },
  // the 3-minute budget in spoken syllables (script-stats.mjs; 관리자 2026-11-07 "640음절로 줄임")
  budget: c => { if (!c.s) return fail('script.json이 없다'); const s = stats(c, { noAudio: true }); if (!s) return fail('script-stats 실패');
    if (s.syllables > T.script.syllables_max) return fail(`해설 ${s.syllables}음절 > ${T.script.syllables_max}(≈${s.est_sec}초, 「침묵의 400년」 속도) — 목소리 줄을 줄이거나 화면 전용으로`);
    // draft timing (before the voice exists): a line's syllables over the time until the next voiced line, and the end card's hold
    const why = [], sp = l => (l.kind === 'narr' || l.kind === 'quote') && l.voice !== null ? (l.voice ?? l.text) : null, n = t => (t.match(/[가-힣]/g) || []).length;
    const V = c.lines.filter(l => sp(l) != null && l.at != null).sort((a, b) => a.at - b.at), cardAt = Math.max(...c.lines.map(l => l.at ?? 0)), dur = c.s.dur ?? cardAt;
    if (!c.place) {
      const crowd = V.map((l, i) => ({ id: l.id, r: n(sp(l)) / ((V[i + 1]?.at ?? cardAt) - l.at) })).filter(x => x.r > T.script.draft_line_pace_max);
      if (crowd.length) why.push(`말이 몰린 줄 ${crowd.map(x => `${x.id} ${x.r.toFixed(1)}음절/초`).join(' · ')} > ${T.script.draft_line_pace_max} — node motion/films/script-retime.mjs ${c.film} --write`);
      if (dur - cardAt < T.script.end_card_min_s) why.push(`끝 화면 ${(dur - cardAt).toFixed(1)}초 < ${T.script.end_card_min_s}초 — script-retime.mjs로 다시 맞추기`); }
    return why.length ? { ok: false, why } : { ok: true, why: [], info: { syllables: s.syllables, est_sec: s.est_sec, quote_share: s.quote_share } }; },
  // the ending is one reading hook (관리자·아내 2026-11-07): an open question in the last seconds, an end card with ONE passage, no "읽어 보세요" list
  // or (관리자 2026-11-14 「그리스도」 6차 "억지로 넣은 느낌 … 400년 영상 끝처럼 해도 돼") a message ending: the film's message brought to the
  // viewer in its last seconds (ending = { kind: 'message', line: <id>, why }), the end card naming only passages that appear in the film
  ending: c => { if (!c.s) return fail('script.json이 없다'); const e = c.review.ending || {}, why = [], s = stats(c, { noAudio: true });
    if (e.kind === 'message') { const m = c.lines.find(l => l.id === e.line), card = s?.end_card || [], cardAt = Math.max(...c.lines.map(l => l.at ?? 0));
      if (!m) why.push(`ending.line ${e.line}이 script.json에 없다`); else if (cardAt - m.at > T.script.ending_window_s) why.push(`맺는 줄 ${m.id}(${m.at}초)이 끝 화면보다 ${(cardAt - m.at).toFixed(1)}초 앞 — 마지막 ${T.script.ending_window_s}초 안에`);
      const txt = card.map(x => x.text).join(' / '), refs = txt.match(/[가-힣]+\s*\d+\s*장/g) || [], cites = c.lines.map(l => l.cite || '').join(' ') + ' ' + c.lines.filter(l => l.kind === 'label').map(l => l.text).join(' ');
      for (const r of refs) { const book = r.replace(/\s*\d+\s*장$/, ''), ch = r.match(/(\d+)\s*장/)[1]; if (!new RegExp(`${book}\\s*${ch}(:|장)`).test(cites)) why.push(`끝 화면 ${r}은 영상에 나오지 않은 본문`); }
      if (/읽어\s*보세요|읽어보세요|관련\s*성경/.test(txt)) why.push('끝 화면이 "읽어 보세요"류 — 영상 속 말씀만 적는다');
      if (!e.why) why.push('ending.why(왜 열린 질문 대신 메시지로 맺는지) 없음');
      return why.length ? { ok: false, why } : pass(); }
    if (!e.question || !e.passage) return fail('review.json ending = { question: <끝의 열린 질문 줄 id>, passage: "<읽을 곳 하나, 예: 마태복음 2장>", answer: "<그 본문에서 풀리는 것 한 줄>" } 없음');
    const q = c.lines.find(l => l.id === e.question), card = s?.end_card || [], cardAt = Math.max(...c.lines.map(l => l.at ?? 0));
    if (!q) why.push(`ending.question ${e.question}이 script.json에 없다`);
    else { if (!/\?\s*$/.test((q.voice ?? q.text).trim())) why.push(`ending.question ${q.id}이 물음표로 끝나지 않는다`);
      if (cardAt - q.at > T.script.ending_window_s) why.push(`열린 질문 ${q.id}(${q.at}초)이 끝 화면(${cardAt}초)보다 ${(cardAt - q.at).toFixed(1)}초 앞 — 마지막 ${T.script.ending_window_s}초 안에`); }
    const txt = card.map(x => x.text).join(' / '), refs = txt.match(/[가-힣]+\s*\d+\s*(장|:\s*\d+)/g) || [];
    if (!txt.includes(e.passage)) why.push(`끝 화면에 읽을 곳 "${e.passage}"이 없다 (지금: ${txt || '끝 화면 글자 없음'})`);
    if (refs.length > 1) why.push(`끝 화면에 읽을 곳이 ${refs.length}개(${refs.join(', ')}) — 하나만, 나머지는 설명란·고정 댓글`);
    if (/읽어\s*보세요|읽어보세요|관련\s*성경/.test(txt)) why.push('끝 화면이 "읽어 보세요"류 — 뒷이야기가 궁금하게 끝내고 본문 하나만 가리킨다');
    if (!e.answer) why.push('ending.answer(그 본문에서 무엇이 풀리는지) 없음');
    return why.length ? { ok: false, why } : pass(); },
  // feedback and rounds are written by film.mjs feedback/applied/round, in one shape (관리자 2026-11-09)
  record: c => { const r = c.review, why = [], FB = r.feedback_log || [], R = r.rounds || [];
    FB.forEach((f, i) => { if (!f.at || !f.who || !f.said) why.push(`feedback_log[${i}]: at·who·said 형식이 아니다 — film.mjs feedback`);
      else if (!f.applied && f.status !== 'open' && f.status !== 'declined') why.push(`feedback_log[${i}] (${f.who}: ${String(f.said).slice(0, 30)}…): 처리(applied)가 없다 — film.mjs applied`); });
    if (R.length && R[R.length - 1].n !== r.round) why.push(`round ${r.round}인데 rounds[] 마지막이 ${R[R.length - 1]?.n} — film.mjs round로 차수를 닫는다`);
    R.forEach(x => { if (x.n > 1 && !Array.isArray(x.changed)) why.push(`rounds ${x.n}: changed(바뀐 줄 id) 없음`); });
    const open = FB.filter(f => f.status === 'open'); if (open.length) why.push(`아직 처리 안 한 피드백 ${open.length}개: ` + open.map(f => `${f.who}: ${String(f.said).slice(0, 24)}…`).join(' / '));
    return why.length ? { ok: false, why } : pass(); },
  // nothing drifts from what the maintainer approved without a round saying so (관리자 2026-11-07 "초안에서 너무 벗어난건 아니야?")
  drift: c => { const ap = approved(c, 'review'); if (!ap) return pass();
    const snap = J(join(c.d, 'rounds', 'script-approved-review.json')); if (!snap) return fail('승인 시점 원고 rounds/script-approved-review.json 없음 — film.mjs approve가 남긴다(옛 승인: film.mjs snapshot ' + c.film + ' review)');
    const old = new Map((snap.lines || snap).map(l => [l.id, l])), changed = [];
    for (const l of c.lines) { const o = old.get(l.id); if (!o || o.text !== l.text || (o.voice ?? null) !== (l.voice ?? null) || o.usfm !== l.usfm) changed.push(l.id); }
    for (const id of old.keys()) if (!c.lines.some(l => l.id === id)) changed.push(id + '(뺌)');
    const since = new Date(ap.at).getTime(), told = new Set((c.review.rounds || []).filter(x => new Date(x.date || x.at || 0).getTime() >= since - 864e5).flatMap(x => x.changed || []));
    const silent = changed.filter(id => !told.has(id.replace('(뺌)', '')));
    return silent.length ? fail(`승인 뒤 바뀌었는데 차수 기록에 없는 줄: ${silent.join(' ')} — film.mjs round로 남기고 관리자에게 알린다(film.mjs diff ${c.film})`) : { ok: true, why: [], info: { changed_since_approval: changed.length } }; },
  // verses are not rushed (관리자 2026-11-07 "특히 성경구절은 훅훅"): pace incl. the hold after, and the hold itself
  pace: c => { if (!c.s) return fail('script.json이 없다'); const s = stats(c); if (!s) return fail('script-stats 실패'); const why = [];
    for (const q of s.quotes) { if (q.sec == null) { why.push(`구절 ${q.id}: 목소리 파일 없음`); continue; }
      const eff = q.hold != null ? q.syl / (q.sec + Math.max(0, q.hold)) : q.syl / q.sec;
      if (eff > T.script.quote_pace_max) why.push(`구절 ${q.id}(${q.cite}): ${eff.toFixed(2)}음절/초 > ${T.script.quote_pace_max} — 조각 사이 쉼(sound-edit gaps)·끝 머묾`);
      if (q.hold != null && q.hold < T.script.quote_hold_min) why.push(`구절 ${q.id}(${q.cite}) 뒤 머묾 ${q.hold}초 < ${T.script.quote_hold_min} — 다음 말(${q.next})을 늦춘다`); }
    return why.length ? { ok: false, why } : pass(); },
  // one voice, one tone (관리자 2026-11-07 "속삭이는 목소리 톤 변화가 급격해 어색")
  tone: c => { if (!c.s) return fail('script.json이 없다'); const s = stats(c); if (!s) return fail('script-stats 실패'); const why = [];
    for (const t of s.tone) { if (Math.abs(t.dev) > T.sound.tone_dev_max) why.push(`해설 ${t.id}: 크기 ${t.lufs} LUFS — 가운데값과 ${t.dev > 0 ? '+' : ''}${t.dev} > ±${T.sound.tone_dev_max}(톤이 다른 테이크 — 같은 지시로 다시 녹음)`);
      else if (Math.abs(t.jump) > T.sound.tone_jump_max) why.push(`해설 ${t.id}: 앞줄과 ${t.jump > 0 ? '+' : ''}${t.jump} LU > ±${T.sound.tone_jump_max}`); }
    return why.length ? { ok: false, why } : pass(); },
  // the action sheet (actions.mjs): moments that must have their own effect, for the current code and cues
  actions: c => { const f = join(c.d, 'sound', 'actions.json'), A = J(f); if (!A) return fail(`sound/actions.json 없음 — node motion/films/actions.mjs ${c.film}`);
    const why = [], src = [join(c.d, 'film.html'), join(c.d, 'sound', 'cues.json'), join(OUT, `${c.film}-v-narr.mp4`)]; if (src.some(x => mt(x) > mt(f))) why.push('동작표가 그림·cues보다 오래됐다 — actions.mjs 다시');
    if (A.cover < T.sound.action_cover_min) why.push(`소리가 꼭 있어야 하는 동작 중 효과음 ${Math.round(A.cover * 100)}% < ${T.sound.action_cover_min * 100}% — ` + A.actions.filter(x => ['gold', 'link', 'flash', 'end'].includes(x.kind) && !x.covered).slice(0, 8).map(x => `${x.t}s ${x.kind}`).join(' '));
    return why.length ? { ok: false, why } : { ok: true, why: [], info: { cover: A.cover, need: A.need } }; },
  // the render matches the shot list (shots-sheet.py → look → review.json shots_check)
  shotsheet: c => { const why = [], stamp = J(join(OUT, `${c.film}-v-narr.mp4.src.json`)), M = J(join(OUT, 'shots', c.film, 'manifest.json')), sc = c.review.shots_check;
    if (!M) return fail(`장면표 시트 없음 — py motion/films/shots-sheet.py ${c.film}`);
    if (stamp && M.render !== stamp.hash) why.push('장면표 시트가 지금 렌더가 아니다 — shots-sheet.py 다시');
    if (!sc || sc.render !== M.render) why.push(`시트를 보고 review.json shots_check = { render: "${M.render}", at, misses: [{id, what}] }를 적는다(그림이 screen 문장과 다른 줄)`);
    else if ((sc.misses || []).length) why.push('장면표와 다른 화면: ' + sc.misses.map(m => `${m.id} ${m.what}`).join(' / '));
    return why.length ? { ok: false, why } : pass(); },
  // eyes on every 0.5 s of the render (관리자 2026-11-10 "만든 영상을 확인해서 이상유무 판단하는 스텝" → "ㅇㅇ"): frame-sheets.py → tasks/anomaly.md → review.json anomaly_check
  anomaly: c => { const why = [], stamp = J(join(OUT, `${c.film}-v-narr.mp4.src.json`)), M = J(join(OUT, 'frames', c.film, 'manifest.json')), ac = c.review.anomaly_check;
    if (!M) return fail(`이상 확인 시트 없음 — py motion/films/frame-sheets.py ${c.film} → motion/films/pipeline/tasks/anomaly.md`);
    if (stamp && M.render !== stamp.hash) why.push('이상 확인 시트가 지금 렌더가 아니다 — frame-sheets.py 다시');
    if (!ac || ac.render !== M.render) why.push(`시트를 보고(tasks/anomaly.md) review.json anomaly_check = { render: "${M.render}", at, issues: [{t, what, severity, status}] }를 적는다`);
    else { const open = (ac.issues || []).filter(i => !i.status || i.status === 'open'); if (open.length) why.push('이상한 프레임(고칠 것): ' + open.map(i => `${i.t}초 ${i.what}`).join(' / ')); }
    const H = J(join(OUT, 'frames', c.film + '-h', 'manifest.json')), hs = J(join(OUT, `${c.film}-h-narr.mp4.src.json`));
    if (hs && (!H || H.render !== hs.hash)) why.push(`가로판 이상 확인 시트 없음/오래됨 — py motion/films/frame-sheets.py ${c.film} --ori h`);
    else if (H && (!c.review.anomaly_check_h || c.review.anomaly_check_h.render !== H.render)) why.push('가로판 시트를 보고 review.json anomaly_check_h를 적는다');
    else if (H) { const o = (c.review.anomaly_check_h.issues || []).filter(i => !i.status || i.status === 'open'); if (o.length) why.push('가로판 이상한 프레임: ' + o.map(i => `${i.t}초 ${i.what}`).join(' / ')); }
    return why.length ? { ok: false, why } : pass(); },
  // the last step (관리자 2026-11-11 "공정에 마지막엔 대화에만 남은 피드백 같은 거 확인해서 공정에 반영하는 스텝"): every remark of the film checked for what belongs to every film
  sweep: c => { const fs = c.review.feedback_sweep, log = c.review.feedback_log || [];
    if (!fs) return fail(`대화 피드백 정리 없음 — feedback_log ${log.length}건 + 대화 기록을 훑어 앞으로의 영상에 적용할 것을 rules.json·tasks·README로 옮기고 review.json feedback_sweep = { at, items: [{ said, to, status: 'moved'|'film-only' }] }`);
    const open = (fs.items || []).filter(i => !['moved', 'film-only'].includes(i.status)); return open.length ? fail('정리 안 된 피드백: ' + open.map(i => i.said).join(' / ')) : pass(); },
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
    if (!c.review.artifact_url) why.push('초안 페이지 artifact_url 없음');
    // the primary audience's scores carry a bar (targets.json script.novice_*) unless the maintainer froze the review (tasks/review.md)
    const R = J(join(ROOT, 'motion/reviews', `film-${c.film}-script.json`)), nov = R?.reviewers?.find(r => /novice/.test(r.key));
    if (!nov) why.push(`motion/reviews/film-${c.film}-script.json에 1번 대상(novice) 점수가 없다`);
    else if (!R.frozen) { const g = nov.parts.map(p => ({ p: p.part, v: (p.gamdong + p.jeonyul) / 2 })), mean = g.reduce((a, x) => a + x.v, 0) / g.length;
      if (mean < T.script.novice_mean_min) why.push(`1번 대상 평균 ${mean.toFixed(2)} < ${T.script.novice_mean_min} — 낮은 부를 고쳐 다시 리뷰(또는 관리자가 굳히기로 하면 frozen)`);
      for (const x of g) if (x.v < T.script.novice_part_min) why.push(`1번 대상 ${x.p}: ${x.v} < ${T.script.novice_part_min}`); }
    else if (!/관리자/.test(R.frozen.by || '')) why.push('리뷰 frozen에 관리자의 말(by)이 없다');
    const st = stats(c, { noAudio: true }); if (st && R?.syllables != null && Math.abs(st.syllables - R.syllables) > 40) why.push(`리뷰한 원고(${R.syllables}음절)와 지금 원고(${st.syllables}음절)가 크게 다르다 — 다시 리뷰`);
    return why.length ? { ok: false, why } : pass(); },
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
      for (const q of F.flickers || []) why.push(`깜빡임 ${q.scene}: 프레임의 ${(q.rate * 100).toFixed(0)}%에서 한 자리(가로 ${q.x}·세로 ${q.y})가 밝아졌다 어두워졌다 — z-fighting(두 면이 같은 평면) 등을 고친다(의도한 깜빡임이면 QA_PLANNED)`);
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
        if (FH.frames) { for (const q of FH.flickers || []) why.push(`가로판 깜빡임 ${q.scene}: 프레임의 ${(q.rate * 100).toFixed(0)}% (가로 ${q.x}·세로 ${q.y})`); if (FH.black > TF.black_max) why.push(`가로판 검은 프레임 ${FH.black}장 — ${FH.blackAt.join(' ')}s`); if (FH.frozen.length > TF.frozen_max) why.push(`가로판 얼어붙은 구간 ${FH.frozen.map(([a, b]) => a + '–' + b + 's').join(' ')}`); j.frames_h = { black: FH.black, frozen: FH.frozen.length, held: FH.held }; } } }
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
    // harsh highs (관리자 2026-11-05 「메시아」 S9 제비 소리: "끼긱끼긱 날카로운 불편한 소리, 칠판 긁는 소리 같은"): an effect whose energy above
    // 3.5 kHz is high reads as a screech on a phone speaker — the first film's effects sit under −30 dB there
    for (const q of sfx) { const fp = q.file ? join(ROOT, q.file) : join(sd, 'audio', q.id + '.mp3'); if (!existsSync(fp)) continue;
      const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', fp, '-af', 'highpass=f=3500,volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }), m = (r.stderr || '').match(/mean_volume: (-?[d.]+)/);
      if (m && +m[1] + (q.db || 0) > T.sound.harsh_hf_max) why.push(`효과음 ${q.id}: 3.5 kHz 위 ${(+m[1] + (q.db || 0)).toFixed(1)} dB > ${T.sound.harsh_hf_max} — 휴대폰에서 날카롭게 들린다(새소리·긁는 소리를 로우패스하거나 바꾼다)`); }
    // music as movements, not one cue per scene (SOUND.md 「메시아」에서 배운 것, 2026-11-05): few long cues that overlap ≥ 1 s, no duck on a joint
    { const M = [...(c.cues.music || [])].sort((p, q) => p.at - q.at), mpm = M.length / (dur / 60); if (mpm > T.sound.music_cues_per_min_max) why.push(`음악 큐 분당 ${mpm.toFixed(1)}개 > ${T.sound.music_cues_per_min_max} — 장면마다 새 큐는 컷이 된다(SOUND.md: 악장 3~4개)`);
      for (let i = 1; i < M.length; i++) { const end = M[i - 1].at + M[i - 1].len, ov = end - M[i].at; if (ov > -.01 && ov < 1) why.push(`음악 ${M[i - 1].id} → ${M[i].id}: 겹침 ${ov.toFixed(1)}초 < 1초`);
        for (const d of c.cues.ducks || []) if (d.from >= M[i].at - 1 && d.from <= M[i].at + 1) why.push(`음악 이음매 ${M[i].at}초에 숨 멈춤(ducks) — 이음매가 컷으로 들린다`); } }
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
    // title/thumbnail from evidence (관리자 2026-11-10 "데이터는 없어? 공정에도 반영해") — same-topic market + our own CTR/A/B
    if (!existsSync(join(c.d, 'research', 'titles.json'))) why.push(`research/titles.json 없음 — node motion/youtube/title-research.mjs "<주제 검색어>" … --json motion/films/${c.film}/research/titles.json`);
    if (!/근거/.test(t)) why.push("upload.md에 제목·썸네일 '근거' 줄이 없다(같은 주제 시장 · 우리 CTR/A/B 중 무엇을 보고 골랐나)");
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
  captions: c => { const have = new Set(c.up?.captions || []), miss = T.captions.langs.filter(l => !have.has(l)), why = []; if (miss.length) why.push(`한국어판 자막 없는 언어 ${miss.length}개: ${miss.join(' ')}`);
    const g = intlRec(c); if (g) for (const k of ['h', 'v']) { const hv = new Set(g[k]?.captions || []), m = T.captions.langs.filter(l => l !== 'ko' && !hv.has(l)); if (m.length) why.push(`국제판 ${k} 자막 없는 언어 ${m.length}개: ${m.join(' ')}`); }
    return why.length ? { ok: false, why } : pass(); },
  // 10. the English-text master on the international channel with the voice tracks (README 4절 순서와 도구 1–7)
  intl: c => { const why = [], sd = join(c.d, 'sound');
    for (const l of T.intl.voice_langs) { if (!existsSync(join(sd, `place-${l}.json`))) why.push(`${l}: sound/place-${l}.json 없음 — voice-lines → ElevenLabs → fetch-takes → fit-voice`);
      if (l !== 'en' && !existsSync(join(OUT, `${c.film}-${l}-narr.mp3`))) why.push(`${l}: 오디오 트랙 motion/out/${c.film}-${l}-narr.mp3 없음 — sound.mjs ${c.film} v --lang ${l}`); }
    for (const o of ['v', 'h']) if (!existsSync(join(OUT, `${c.film}-en-${o}-narr.mp4`))) why.push(`영어판 ${o} motion/out/${c.film}-en-${o}-narr.mp4 없음 — render.mjs ${o} --lang en → sound.mjs --lang en`);
    if (!existsSync(join(c.d, 'youtube-intl.json'))) why.push('youtube-intl.json(언어별 제목·설명) 없음');
    if (!existsSync(join(ROOT, 'motion/reviews', `film-${c.film}-yt.md`))) why.push(`motion/reviews/film-${c.film}-yt.md(제목·설명 원어민 검수) 없음`);
    const g = intlRec(c); if (!g?.h?.id || !g?.v?.id) why.push(`uploaded.json global.films.${c.film} h·v id 없음 — intl.mjs entry → 스튜디오 → intl.mjs api`);
    else for (const k of ['h', 'v']) { const a = new Set(g[k].audio || []), m = T.intl.voice_langs.filter(l => l !== 'en' && !a.has(l)); if (m.length) why.push(`국제판 ${k} 오디오 트랙 없음: ${m.join(' ')} (스튜디오 언어 탭)`); }
    return why.length ? { ok: false, why } : pass(); },
  // 12. the international cut public (maintainer OK) with its related video / end screen
  intlpub: c => { const g = intlRec(c), why = []; if (!g?.h?.id) return fail('국제판이 아직 없다');
    for (const k of ['h', 'v']) if (g[k]?.privacy !== 'public') why.push(`국제판 ${k} privacy ${g[k]?.privacy} — 관리자 OK 뒤 yt-api privacy public`);
    if (!g.related_video) why.push('국제판 쇼츠 관련 동영상 기록 없음'); if (!/end screen|최종 화면/i.test(JSON.stringify(g))) why.push('국제판 가로 최종 화면 기록 없음');
    return why.length ? { ok: false, why } : pass(); },
  // 13. the site /film page (README 6절): publish.py → film/<slug>/ + films.json line
  site: c => { const F = J(join(ROOT, 'film/films.json')) || [], slug = c.review.site_slug, why = [];
    if (!slug) return fail(`review.json site_slug(사이트 주소 /film/<slug>/) 없음`);
    if (!F.some(x => x.id === slug)) why.push(`film/films.json에 ${slug} 줄 없음`); if (!existsSync(join(ROOT, 'film', slug, 'index.html'))) why.push(`film/${slug}/index.html 없음 — py motion/films/publish.py ${c.film} ${slug}`);
    return why.length ? { ok: false, why } : pass(); },
};

// ---------------------------------------------------------------------------------------------------- stages
export const STAGES = [
  { id: 'topic', n: 1, name: '주제', task: 'topic', gates: ['topic'], approve: '관리자가 주제를 고름' },
  { id: 'script', n: 2, name: '원고·장면별 화풍·메시지 점검', task: 'script', gates: ['script', 'looks', 'budget', 'ending'] },
  { id: 'review', n: 3, name: '관점 검수·시청자 리뷰·초안 페이지', task: 'review', run: [['node', 'motion/films/review-page.mjs', '{film}']], gates: ['reviews', 'budget', 'ending', 'record'], approve: '관리자·아내가 초안을 컨펌' },
  { id: 'picture', n: 4, name: '그리기·렌더', task: 'picture', run: [['node', 'motion/render.mjs', 'v', '--page', 'films/{film}/film.html', '--workers', '6'], ['node', 'motion/films/sound.mjs', '{film}', 'v'], ['node', 'motion/render.mjs', 'h', '--page', 'films/{film}/film.html', '--workers', '6'], ['node', 'motion/films/sound.mjs', '{film}', 'h'], ['py', 'motion/films/shots-sheet.py', '{film}'], ['py', 'motion/films/frame-sheets.py', '{film}'], ['py', 'motion/films/frame-sheets.py', '{film}', '--ori', 'h']], gates: ['picture', 'shotsheet', 'anomaly', 'drift', 'record'], approve: '관리자·가족이 시안 확인', optional: ['lookreview'] }   /* 관리자 2026-11-05: "점수 뽑는 리뷰는 빼자, 내가 요청할 때 해" — the look review runs only on request (film.mjs check <film> picture --review) */,
  { id: 'kits', n: 4.5, name: '새 화풍을 canvas-film 키트로', task: 'kits', gates: ['kits'] },
  { id: 'sound', n: 5, name: '해설·음악·효과음·섞기', task: 'sound', run: [['node', 'motion/films/sound.mjs', '{film}', 'v'], ['node', 'motion/films/sound-prompts.mjs', 'md', 'motion/films/{film}/sound/prompts.json'], ['node', 'motion/films/actions.mjs', '{film}']], gates: ['sound', 'pace', 'tone', 'actions'] },
  { id: 'clips', n: 5.5, name: '반복용 짧은 쇼츠(끝이 처음으로)', task: 'clips', run: [['node', 'motion/films/clips.mjs', '{film}']], gates: ['clips'] },
  { id: 'sheet', n: 6, name: '올릴 글·썸네일', task: 'sheet', gates: ['sheet'] },
  { id: 'publish', n: 7, name: '한국어 채널 올리기·예약', task: 'publish', gates: ['publish'], approve: '관리자가 공개 시각 OK' },
  { id: 'social', n: 8, name: '인스타·스레드', task: 'social', gates: ['social'] },
  { id: 'after', n: 9, name: '공개 직후(고정 댓글·최종 화면·관련 동영상)', task: 'after', gates: ['after'] },
  { id: 'intl', n: 10, name: '국제판(영어 글자판 + 해설 트랙)', task: 'intl', gates: ['intl'] },
  { id: 'captions', n: 11, name: '외국어 자막 27개(한국어판·국제판)', task: 'captions', gates: ['captions'] },
  { id: 'intlpub', n: 12, name: '국제판 공개', task: 'intlpub', gates: ['intlpub'], approve: '관리자가 국제판 공개 OK' },
  { id: 'site', n: 13, name: '사이트 /film · 대화 피드백 정리', task: 'site', gates: ['site', 'sweep'] },
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
