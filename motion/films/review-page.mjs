// A film's review page — the same page every round, every film, every session.
//   node motion/films/review-page.mjs <film> [--no-check]
// Reads films/<film>/script.json + review.json (+ README 0절 for the step list), runs check-quotes, and writes
// motion/out/review/<film>.html. Publish that file with the Artifact tool to review.json "artifact_url"
// (first time: publish without url with capabilities {db:{}, user:{}}, then save the URL there). Reviewers' notes land in
// the artifact's db collection "feedback" (doc "r<round>-<who>") — read them with ArtifactData list "feedback".
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..', '..');
const [film, ...flags] = process.argv.slice(2);
if (!film) { console.error('usage: node motion/films/review-page.mjs <film> [--no-check]'); process.exit(1); }
const J = p => JSON.parse(readFileSync(p, 'utf8'));
const S = J(join(HERE, film, 'script.json')), RV = J(join(HERE, film, 'review.json'));

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const md = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
const tc = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const spoken = l => l.voice === null ? '' : l.voice ?? l.text;
const syl = s => (s.match(/[가-힣]/g) || []).length + (s.match(/\d/g) || []).length;   // same count for every film, so films compare
const chars = s => s.replace(/[\s/]/g, '').length;

// ---- checks -------------------------------------------------------------------------------------------------------
let quoteCheck = { ok: null, text: '건너뜀(--no-check)' };
if (!flags.includes('--no-check')) {
  try { const out = execFileSync('node', [join(HERE, 'check-quotes.mjs'), film], { encoding: 'utf8' }); const n = out.trim().split(/\r?\n/).length; quoteCheck = { ok: true, text: `${n}곳 모두 일치` }; }
  catch (e) { const bad = String(e.stdout || '').split(/\r?\n/).filter(l => /MISMATCH|MISSING/.test(l)); quoteCheck = { ok: false, text: `${bad.length}곳 다름: ` + bad.map(l => l.split(' ')[0]).join(', ') }; }
}
const voiced = S.lines.filter(l => l.kind !== 'label' && l.voice !== null).sort((a, b) => a.at - b.at);
const tight = {};
voiced.forEach((l, i) => { const avail = (voiced[i + 1]?.at ?? S.dur) - l.at, need = 1.5 + 0.12 * chars(l.text); if (avail < need) tight[l.id] = { need, avail }; });
const sylTotal = voiced.reduce((n, l) => n + syl(spoken(l)), 0);
let ref = null;
if (RV.ref_film) { const R = J(join(HERE, RV.ref_film, 'script.json')); ref = { title: R.title, dur: R.dur, syl: R.lines.filter(l => l.kind !== 'label' && l.voice !== null).reduce((n, l) => n + syl(spoken(l)), 0) }; }
const estSec = ref ? sylTotal * ref.dur / ref.syl : null;

// ---- step list from README 0절 (single source) --------------------------------------------------------------------
const readme = readFileSync(join(HERE, 'README.md'), 'utf8');
const sec0 = readme.split(/\n## 0\./)[1]?.split(/\n## /)[0] || '';
const steps = sec0.split(/\r?\n/).map(l => l.match(/^\|\s*(\d+)\s*\|(.*)\|(.*)\|(.*)\|\s*$/)).filter(Boolean).map(m => ({ n: +m[1], what: m[2].trim(), how: m[3].trim(), stop: m[4].trim() }));
const stageName = (steps.find(s => s.n === RV.stage)?.what || '').split(/[(·]/)[0].trim() || '검토';

// ---- line text: '/' = line break, hl = gold mark, voice = underline ----------------------------------------------
function lineHtml(l) {
  const t = l.text, flag = Array.from(t, () => ({ hl: false, said: false }));
  const mark = (sub, key) => { if (!sub) return; const pieces = sub.split(/\s*\/\s*/); let from = 0; for (const p of pieces) { const i = t.indexOf(p, from); if (i < 0) continue; for (let k = i; k < i + p.length; k++) flag[k][key] = true; from = i + p.length; } };
  mark(l.hl, 'hl'); if (l.kind === 'quote' && typeof l.voice === 'string' && l.voice !== l.text) mark(l.voice, 'said');
  let out = '', cur = null, buf = '';
  const close = () => { if (!buf) return; let h = esc(buf); if (cur.said) h = `<span class="said">${h}</span>`; if (cur.hl) h = `<mark>${h}</mark>`; out += h; buf = ''; };
  Array.from(t).forEach((ch, i) => { const f = flag[i]; if (!cur || f.hl !== cur.hl || f.said !== cur.said) { close(); cur = f; } buf += ch; });
  close();
  return out.replace(/\s*\/\s*/g, '<br>');
}
const changed = new Set(RV.rounds?.at(-1)?.changed || []);
const KIND = { narr: '해설', quote: '성경', label: '화면 글자' };
function voiceMeta(l) {
  if (l.kind === 'label') return '';
  if (l.voice === null) return '<span>화면에만(읽지 않음)</span>';
  if (l.kind === 'quote' && typeof l.voice === 'string' && l.voice !== l.text) return '<span>밑줄 부분만 읽음</span>';
  return l.kind === 'quote' ? '<span>전체를 읽음</span>' : '';
}
const fbBox = (id, kind, add = '이 줄에 의견 쓰기') => `<div class="fb" data-id="${esc(id)}" data-kind="${kind}"><ul class="others"></ul>${add ? `<button class="addfb" type="button" data-id="${esc(id)}">＋ ${add}</button>` : ''}<textarea id="fb-${esc(id)}" data-kind="${kind}" data-id="${esc(id)}" ${add ? 'hidden' : ''} placeholder="고칠 점, 좋은 점, 궁금한 점"></textarea></div>`;
function lineCard(l) {
  const tg = tight[l.id];
  const meta = [`<span class="kind">${KIND[l.kind] || l.kind}</span>`, l.cite ? `<span class="cite">${esc(l.cite)}</span>` : '', voiceMeta(l),
    tg ? `<span class="flag" title="읽는 시간 기준: 1.5초 + 글자당 0.12초">읽는 시간 빠듯 · 필요 ${tg.need.toFixed(1)}초 / 다음 줄까지 ${tg.avail.toFixed(1)}초</span>` : '',
    changed.has(l.id) ? '<span class="newtag">이번 차수에 바뀜</span>' : '', `<span>#${esc(l.id)}</span>`].filter(Boolean).join('');
  const aside = [l.screen ? `<dt>화면</dt><dd>${esc(l.screen)}</dd>` : '', l.note ? `<dt>메모</dt><dd>${esc(l.note)}</dd>` : ''].join('');
  return `<article class="ln k-${l.kind}${l.kind === 'label' ? ' label' : ''}${changed.has(l.id) ? ' changed' : ''}" id="L-${esc(l.id)}">
<div class="tc">${tc(l.at)}</div><div class="lb"><div class="meta">${meta}</div><p class="txt">${lineHtml(l)}</p>${aside ? `<dl class="aside">${aside}</dl>` : ''}${fbBox(l.id, 'line')}</div></article>`;
}

// ---- parts --------------------------------------------------------------------------------------------------------
const partNos = [...new Set(S.lines.map(l => l.part))].sort((a, b) => a - b);
const parts = partNos.map(n => { const ls = S.lines.filter(l => l.part === n); return { n, ...(RV.parts || []).find(p => p.n === n), start: Math.min(...ls.map(l => l.at)), lines: ls }; });
parts.forEach((p, i) => { p.end = parts[i + 1]?.start ?? S.dur; });
function partHtml(p) {
  // repeated short labels on one picture (map names) read better as one row of chips than as six cards
  const groups = {}; p.lines.filter(l => l.kind === 'label' && l.text.length <= 8 && l.screen).forEach(l => (groups[l.screen] ||= []).push(l));
  const chipped = new Set(Object.values(groups).filter(g => g.length >= 3).flat().map(l => l.id));
  const ordered = p.lines.filter(l => !chipped.has(l.id)).sort((a, b) => a.at - b.at || S.lines.indexOf(a) - S.lines.indexOf(b));
  const chipRows = Object.entries(groups).filter(([, g]) => g.length >= 3).map(([scr, g]) => `<article class="ln label" id="L-${esc(g[0].id)}"><div class="tc">${tc(g[0].at)}</div><div class="lb"><div class="meta"><span class="kind">${esc(scr)} 글자</span><span>#${g.map(l => esc(l.id)).join(' #')}</span></div><ul class="mapchips">${g.map(l => `<li>${esc(l.text)}</li>`).join('')}</ul>${g[0].note ? `<dl class="aside"><dt>메모</dt><dd>${esc(g[0].note)}</dd></dl>` : ''}${fbBox(g[0].id, 'line')}</div></article>`);
  const cards = ordered.map(lineCard); if (chipRows.length) { const k = ordered.findIndex(l => l.at >= Math.max(...Object.values(groups).flat().map(l => l.at))); cards.splice(k < 0 ? cards.length : k + 1, 0, ...chipRows); }
  return `<section class="part" style="--pc: var(--p${p.n})" id="part-${p.n}"><header><span class="no">${p.n}부 · ${tc(p.start)}–${tc(p.end)}</span><h3>${esc(p.name || '')}</h3>${p.style ? `<span class="style">화풍: ${esc(p.style)}${p.src ? ` <small>(${esc(p.src)})</small>` : ''}</span>` : ''}</header><div class="lines">${cards.join('\n')}</div></section>`;
}

// ---- page ---------------------------------------------------------------------------------------------------------
const round = RV.rounds?.at(-1) || { n: RV.round, date: '', summary: '' };
const tightN = Object.keys(tight).length;
const facts = [
  { b: tc(S.dur), s: '목표 길이(쇼츠·릴스 3분 미만)' },
  { b: `${voiced.length}줄 · ${sylTotal}음절`, s: ref ? `목소리 분량 · 「${ref.title}」 ${ref.syl}음절 = ${tc(ref.dur)}` : '목소리 분량' },
  ...(estSec ? [{ b: `약 ${tc(estSec)}`, s: `같은 빠르기로 읽으면(${estSec > S.dur ? '목표보다 김 — 줄일 곳 필요' : '목표 안'})`, c: estSec > S.dur + 2 ? 'warn' : 'ok' }] : []),
  { b: quoteCheck.ok === false ? '다름' : quoteCheck.ok ? '일치' : '—', s: `성경 인용 개역개정 원문 대조 · ${quoteCheck.text}`, c: quoteCheck.ok === false ? 'warn' : quoteCheck.ok ? 'ok' : '' },
  { b: tightN ? `${tightN}줄` : '없음', s: '읽는 시간이 빠듯한 줄(대략 시각 기준, 그림을 짤 때 다시 맞춤)', c: tightN ? 'warn' : 'ok' },
];
const cfg = { film, title: S.title, round: RV.round, stageName, decisions: (RV.decisions || []).map(d => ({ key: d.key, q: d.q })),
  lines: S.lines.map(l => ({ id: l.id, label: (l.cite ? l.cite + ' ' : '') + l.text.replace(/\s*\/\s*/g, ' ').slice(0, 40) })) };
const opt = o => `<span>${esc(o)}</span>`;
const html = `<title>${esc(S.title)} 검토</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@600;700&display=swap">
<style>
${readFileSync(join(HERE, 'review', 'page.css'), 'utf8')}
</style>
<div class="band"><div class="wrap">
  <span class="eyebrow">새 영상 ${esc(stageName)} 검토 · ${RV.round}차 · ${esc(round.date)}</span>
  <h1>「${esc(S.title)}」</h1>
  <p>${esc(round.summary)}</p>
  <span class="pill">${esc(RV.status || '')}</span>
</div></div>
<div class="who"><div class="wrap">
  <span class="lbl">누가 보고 있나요?</span>
  <div class="chips"><button class="chip" type="button" data-who="owner" aria-pressed="false">관리자</button><button class="chip" type="button" data-who="wife" aria-pressed="false">아내</button><button class="chip" type="button" data-who="other" aria-pressed="false">다른 사람</button></div>
  <input id="whoName" type="text" placeholder="이름" hidden aria-label="이름">
  <span id="saveState" class="save" role="status"></span>
</div></div>
<main class="wrap">
<section id="decide"><h2>정할 것 <small>골라 주시면 그대로 반영합니다</small></h2>
<div class="decs">${(RV.decisions || []).map(d => `<div class="dec"><h3>${esc(d.q)}</h3>${d.detail ? `<p>${esc(d.detail)}</p>` : ''}<div class="opts">${d.options.map(o => `<button class="opt" type="button" aria-pressed="false" data-key="${esc(d.key)}" data-opt="${esc(o)}">${opt(o)}<span class="by"></span></button>`).join('')}</div>${fbBox(d.key, 'dec', '덧붙일 말')}</div>`).join('')}</div>
</section>
<section id="glance"><h2>한눈에</h2>
<div class="bar" role="img" aria-label="부별 길이">${parts.map(p => `<span style="width:${((p.end - p.start) / S.dur * 100).toFixed(2)}%;background:var(--p${p.n})" title="${p.n}부 ${esc(p.name || '')}"></span>`).join('')}</div>
<ul class="parts">${parts.map(p => `<li><span class="sw" style="background:var(--p${p.n})"></span><span><b>${p.n}부 ${esc(p.name || '')}</b> · ${tc(p.start)}–${tc(p.end)}<br><small>${esc(p.style || '')}</small></span></li>`).join('')}</ul>
<div class="facts">${facts.map(f => `<div class="fact ${f.c || ''}"><b>${esc(f.b)}</b><span>${esc(f.s)}</span></div>`).join('')}</div>
</section>
<section id="script"><h2>원고 <small>시각은 대략 · 금빛 = 강조 · 밑줄 = 목소리로 읽는 부분</small></h2>
<p class="lede">'해설'은 목소리로 읽고 화면에도 같은 글자가 나옵니다. '성경'은 개역개정 원문 그대로입니다. '화면 글자'는 읽지 않고 화면에만 보입니다. 화면·메모는 그림 설명과 근거입니다.</p>
${parts.map(partHtml).join('\n')}
</section>
<section id="upload"><h2>올릴 글 <small>설명란·고정 댓글에 들어갈 것</small></h2>
<div class="decs">
${S._short_title ? `<div class="box"><h3>쇼츠 제목(첫 줄 훅)</h3><p>${esc(S._short_title)}</p></div>` : ''}
${S.reading_list ? `<div class="box"><h3>읽기 목록</h3><p>${esc(S.reading_list)}</p></div>` : ''}
${S.description_notes ? `<div class="box"><h3>설명란 배경 메모</h3><p>${esc(S.description_notes)}</p></div>` : ''}
</div></section>
<section id="steps"><h2>진행 순서 <small>지금 ${RV.stage}단계</small></h2>
<div class="scroll"><table><thead><tr><th>#</th><th>단계</th><th>무엇으로</th><th>멈춤 지점</th></tr></thead><tbody>
${steps.map(s => `<tr class="${s.n === RV.stage ? 'now' : s.n < RV.stage ? 'done' : ''}"><td class="n">${s.n}</td><td>${md(s.what)}</td><td>${md(s.how)}</td><td>${md(s.stop)}</td></tr>`).join('\n')}
</tbody></table></div>
${(RV.process_changes || []).length ? `<div class="box" style="margin-top:14px"><h3>이번 영상에서 고친 과정</h3><ul class="plain">${RV.process_changes.map(c => `<li>${esc(c.date)} — ${md(c.what)}</li>`).join('')}</ul></div>` : ''}
${(RV.rounds || []).length > 1 ? `<div class="box" style="margin-top:14px"><h3>차수 기록</h3><ul class="plain">${RV.rounds.map(r => `<li>${r.n}차 ${esc(r.date)} — ${esc(r.summary)}</li>`).join('')}</ul></div>` : ''}
</section>
<section id="general"><h2>전체 의견</h2>
${fbBox('general', 'general', '')}
<div class="box" style="margin-top:14px"><h3>내 의견 복사</h3><p>공유 저장이 안 되는 화면이면, 아래 글을 복사해 카카오톡 등으로 보내 주세요.</p>
<textarea id="copyOut" readonly></textarea><button class="btn" id="copyBtn" type="button">내 의견 복사</button></div>
</section>
</main>
<footer class="wrap">만든 곳: <code>motion/films/${esc(film)}/script.json</code> · <code>review.json</code> → <code>node motion/films/review-page.mjs ${esc(film)}</code> · ${new Date().toISOString().slice(0, 10)}</footer>
<script>window.REVIEW = ${JSON.stringify(cfg).replace(/</g, '\\u003c')};</script>
<script>
${readFileSync(join(HERE, 'review', 'page.js'), 'utf8')}
</script>
`;
const outDir = join(ROOT, 'motion', 'out', 'review'); mkdirSync(outDir, { recursive: true });
const out = join(outDir, film + '.html'); writeFileSync(out, html);
console.log(`${out}\n  quotes: ${quoteCheck.text} · voiced ${voiced.length} lines ${sylTotal} syllables${estSec ? ` ≈ ${tc(estSec)}` : ''} · tight ${tightN}${tightN ? ' (' + Object.keys(tight).join(', ') + ')' : ''}\n  publish: ${RV.artifact_url ? 'Artifact url=' + RV.artifact_url : 'new artifact, capabilities {db:{}, user:{}} → save the URL in review.json artifact_url'}`);
