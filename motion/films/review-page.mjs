// A film's draft page — the draft itself (synopsis + style frames per part, then the whole script), nothing else.
//   node motion/films/review-page.mjs <film> [--no-check]
// Reads films/<film>/script.json + review.json, runs check-quotes, prints the checks (quotes, length estimate, tight
// reading time) for the agent, and writes motion/out/review/<film>.html. Publish that file with the Artifact tool to
// review.json "artifact_url" (first time without url, then save the URL there). Feedback comes back in chat, not on the page
// (2026-11-02 관리자: "검토용 페이지일 필요 없고 초안만").
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
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
const fbBox = () => '';   // draft page: no in-page feedback (2026-11-02 관리자 — 초안만, 의견은 대화로)
function lineCard(l) {
  const tg = tight[l.id];
  const meta = [`<span class="kind">${KIND[l.kind] || l.kind}</span>`, l.cite ? `<span class="cite">${esc(l.cite)}</span>` : '', voiceMeta(l),
    
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
facts.forEach(f => console.log(`  ${f.b} — ${f.s}`));   // the checks are for the agent; the page itself is only the draft

// ---- style samples: real frames of an earlier film drawn in the same look (review.json parts[].samples {film, t, o?, cap}) ----
// rendered once with render.mjs --stills, kept as small JPEGs in motion/out/review/img/, embedded in the page as data URIs
const IMG = join(ROOT, 'motion', 'out', 'review', 'img'); mkdirSync(IMG, { recursive: true });
const need = {};
for (const p of parts) for (const s of p.samples || []) { s.o ||= 'v'; s.file = join(IMG, `${s.film}-${s.o}-${s.t}.jpg`); if (!existsSync(s.file)) (need[s.film + '|' + s.o] ||= new Set()).add(s.t); }
for (const [k, ts] of Object.entries(need)) {
  const [fl, o] = k.split('|');
  execFileSync('node', [join(ROOT, 'motion', 'render.mjs'), o, '--page', `films/${fl}/film.html`, '--stills', [...ts].join(',')], { stdio: 'inherit', cwd: ROOT });
  for (const t of ts) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(ROOT, 'motion', 'out', `still-film-${o}-${t}.png`), '-vf', 'scale=540:-2', '-q:v', '5', join(IMG, `${fl}-${o}-${t}.jpg`)]);
}
const dataUri = f => 'data:image/jpeg;base64,' + readFileSync(f).toString('base64');
const storyHtml = parts.some(p => p.story || p.samples) ? `<section id="story"><h2>초안 — 줄거리와 화풍 <small>${tc(S.dur)} · ${parts.length}부 · 그림은 앞 영상에서 같은 화풍으로 그린 장면(새 영상은 이 화풍으로 새로 그립니다)</small></h2>
<div class="story">${parts.map(p => `<article class="sp" style="--pc: var(--p${p.n})"><div class="shots">${(p.samples || []).map(s => `<figure><img src="${dataUri(s.file)}" alt="${esc(s.cap)}"><figcaption>${esc(s.cap)}</figcaption></figure>`).join('')}</div><div class="sx"><span class="no">${p.n}부 · ${tc(p.start)}–${tc(p.end)}</span><h3>${esc(p.name || '')}</h3>${p.story ? `<p>${esc(p.story)}</p>` : ''}${p.style ? `<p class="style">화풍: ${esc(p.style)}${p.src ? ` <small>(${esc(p.src)})</small>` : ''}</p>` : ''}<a href="#part-${p.n}">이 부분 원고 보기 ↓</a></div></article>`).join('\n')}</div>
</section>` : '';
const html = `<title>${esc(S.title)} 초안</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@600;700&display=swap">
<style>
${readFileSync(join(HERE, 'review', 'page.css'), 'utf8')}
</style>
<div class="band"><div class="wrap">
  <span class="eyebrow">새 영상 원고 초안 · ${RV.round}차 · ${esc(round.date)}</span>
  <h1>「${esc(S.title)}」</h1>
  <p>${tc(S.dur)} · ${parts.length}부 · 세로(쇼츠·릴스)와 가로(유튜브) 같은 내용</p>
</div></div>
<main class="wrap">
${storyHtml}
<section id="script"><h2>원고 전체 <small>시각은 대략 · 금빛 = 강조 · 밑줄 = 목소리로 읽는 부분</small></h2>
<p class="lede">'해설'은 목소리로 읽고 화면에도 같은 글자가 나옵니다. '성경'은 개역개정 원문 그대로입니다. '화면 글자'는 읽지 않고 화면에만 보입니다. 화면·메모는 그림 설명과 근거입니다.</p>
${parts.map(partHtml).join('\n')}
</section>
${(RV.decisions || []).length ? `<section id="decide"><h2>정할 것</h2><ul class="plain">${RV.decisions.map(d => `<li><b>${esc(d.q)}</b> — ${d.options.map(esc).join(' / ')}${d.detail ? `<br><small>${esc(d.detail)}</small>` : ''}</li>`).join('')}</ul></section>` : ''}
</main>
<footer class="wrap">motion/films/${esc(film)}/script.json · ${new Date().toISOString().slice(0, 10)}</footer>
`;
const outDir = join(ROOT, 'motion', 'out', 'review'); mkdirSync(outDir, { recursive: true });
const out = join(outDir, film + '.html'); writeFileSync(out, html);
console.log(`${out}\n  quotes: ${quoteCheck.text} · voiced ${voiced.length} lines ${sylTotal} syllables${estSec ? ` ≈ ${tc(estSec)}` : ''} · tight ${tightN}${tightN ? ' (' + Object.keys(tight).join(', ') + ')' : ''}\n  publish: ${RV.artifact_url ? 'Artifact url=' + RV.artifact_url : 'new artifact, capabilities {db:{}, user:{}} → save the URL in review.json artifact_url'}`);
