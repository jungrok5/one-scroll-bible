// What a film's words and voice measure — one tool the pipeline gates read (stages.mjs budget · ending · pace · tone).
//   node motion/films/script-stats.mjs <film> [--json] [--voice <dir>] [--place <file>]   (dir/file inside sound/, for an older round)
// Prints:
//   - spoken syllables (Hangul syllables of every voiced narr/quote line) and the 3-minute budget (targets.json script.syllables_max)
//   - parts: seconds and syllables each, questions, quote share
//   - per quote line: syllables per second as read, the pause after it until the next voice (the hold), pieces (pieces.json)
//   - per voiced line: loudness of the raw take (LUFS) against the film's median — a whisper or a different tone shows up here
//   - the end card: the last on-screen label lines
// Calibration (2026-11-09): 「침묵의 400년」 and 「메시아」 3차/4차 — see targets.json script.* and sound.tone_*.
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i > -1 ? args.splice(i, 2)[1] : null; };
const asJson = args.includes('--json'); if (asJson) args.splice(args.indexOf('--json'), 1);
const noAudio = args.includes('--no-audio'); if (noAudio) args.splice(args.indexOf('--no-audio'), 1);   // words only (no ffmpeg)
const vdir = opt('--voice') || 'voice', pfile = opt('--place') || 'place.json';
const film = args[0]; if (!film) { console.error('usage: script-stats.mjs <film> [--json] [--voice <dir>] [--place <file>]'); process.exit(1); }
const J = f => { try { return JSON.parse(readFileSync(f, 'utf8').replace(/^\uFEFF/, '')); } catch { return null; } };
const D = join(HERE, film), S = join(D, 'sound'), s = J(join(D, 'script.json')); if (!s) { console.error('no script.json'); process.exit(1); }
const lines = Array.isArray(s) ? s : s.lines, place = J(join(S, pfile)), pieces = J(join(S, 'pieces.json')) || {};
const TRIM ='silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.10,areverse';   // = sound.mjs

const spokenText = l => (l.kind === 'narr' || l.kind === 'quote') && l.voice !== null ? (l.voice ?? l.text) : null;
const syl = t => (t || '').match(/[\uAC00-\uD7A3]/g)?.length || 0;
const at = l => place?.at?.[l.id] ?? l.at;
function take(id) {   // trimmed length (as sound.mjs lays it) and integrated loudness of one take
  const f = join(S, vdir, id + '.mp3'); if (noAudio || !existsSync(f)) return null;
  const r = spawnSync('ffmpeg', ['-hide_banner', '-stats', '-i', f, '-af', TRIM + ',ebur128=framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' }).stderr || '';
  const tm = [...r.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop(), I = r.slice(r.lastIndexOf('Summary')).match(/I:\s+(-?[\d.]+) LUFS/);
  return { dur: tm ? +tm[1] * 3600 + +tm[2] * 60 + +tm[3] : null, lufs: I ? +I[1] : null };
}

const voiced = lines.filter(l => spokenText(l) != null).map(l => ({ l, at: at(l), syl: syl(spokenText(l)), t: take(l.id) })).sort((a, b) => a.at - b.at);
const total = voiced.reduce((a, x) => a + x.syl, 0), quoteSyl = voiced.filter(x => x.l.kind === 'quote').reduce((a, x) => a + x.syl, 0);
const dur = place?.dur || s.dur || Math.max(...lines.map(l => l.at || 0)) + 5;
const parts = {}; for (const l of lines) { const p = l.part ?? 0; (parts[p] ||= { part: p, from: Infinity, to: 0, syl: 0, lines: 0 }); const P = parts[p]; P.from = Math.min(P.from, l.at ?? Infinity); P.to = Math.max(P.to, l.at ?? 0); P.lines++; P.syl += syl(spokenText(l)); }
const partList = Object.values(parts).sort((a, b) => a.from - b.from); partList.forEach((p, i) => { p.to = partList[i + 1]?.from ?? dur; p.sec = +(p.to - p.from).toFixed(1); });
const questions = lines.filter(l => l.kind === 'narr' && /\?\s*$/.test((l.voice ?? l.text).trim())).map(l => l.id);

// quotes: reading pace and the hold after them (the next voice's start minus this take's end)
const quotes = voiced.map((x, i) => ({ x, n: voiced[i + 1] })).filter(({ x }) => x.l.kind === 'quote').map(({ x, n }) => {
  const d = x.t?.dur, end = d != null ? x.at + d : null, pc = pieces[x.l.id]?.pieceStarts || null;
  return { id: x.l.id, cite: x.l.cite, syl: x.syl, sec: d != null ? +d.toFixed(2) : null, sps: d ? +(x.syl / d).toFixed(2) : null,
    hold: end != null && n ? +(n.at - end).toFixed(2) : null, next: n?.l.id || null, pieces: pc ? pc.length : 1 };
});
// tone: raw take loudness against the film median (sound.mjs evens only 70 % of the way, ±4 dB — a whispered take stays quieter and thinner)
const L = voiced.filter(x => x.t?.lufs != null).map(x => x.t.lufs).sort((a, b) => a - b), med = L.length ? L[Math.floor(L.length / 2)] : null;
const tone = voiced.filter(x => x.t?.lufs != null).map((x, i, A) => ({ id: x.l.id, lufs: x.t.lufs, dev: +(x.t.lufs - med).toFixed(1), jump: i ? +(x.t.lufs - A[i - 1].t.lufs).toFixed(1) : 0 }));
const lastAt = Math.max(...lines.map(l => l.at ?? 0)), endCard = lines.filter(l => l.kind === 'label' && (l.at ?? 0) >= lastAt - 0.01).map(l => ({ id: l.id, text: l.text }));
const out = { film, syllables: total, quote_share: total ? +(quoteSyl / total).toFixed(2) : 0, est_sec: +(total / 3.66).toFixed(1), dur, voiced: voiced.length,
  parts: partList.map(p => ({ part: p.part, sec: p.sec, syl: p.syl, lines: p.lines })), questions, quotes, tone_median: med, tone, end_card: endCard };
if (asJson) { console.log(JSON.stringify(out)); process.exit(0); }
console.log(`「${film}」 해설 ${total}음절(인용 ${Math.round(out.quote_share * 100)}%) ≈ ${out.est_sec}초(「침묵의 400년」 속도 3.66음절/초) · 길이 ${dur}초 · 목소리 줄 ${voiced.length}`);
console.log('부: ' + out.parts.map(p => `${p.part}부 ${p.sec}초·${p.syl}음절`).join(' | '));
console.log('질문: ' + questions.join(' '));
console.log('구절(음절/초 · 뒤 머묾):'); for (const q of quotes) console.log(`  ${q.id.padEnd(4)} ${String(q.cite || '').padEnd(12)} ${q.syl}음절 ${q.sec}s ${q.sps}/s  머묾 ${q.hold}s → ${q.next}${q.pieces > 1 ? ` (조각 ${q.pieces})` : ''}`);
console.log(`목소리 크기(LUFS, 가운데 ${med}): ` + tone.filter(t => Math.abs(t.dev) >= 1.5 || Math.abs(t.jump) >= 2.5).map(t => `${t.id} ${t.lufs}(${t.dev > 0 ? '+' : ''}${t.dev}, 앞줄과 ${t.jump > 0 ? '+' : ''}${t.jump})`).join(' · ') || '고름');
console.log('끝 화면: ' + endCard.map(e => `${e.id} "${e.text}"`).join(' / '));
