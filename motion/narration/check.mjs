// 내레이션 원고 검사: (1) q 가 있는 줄은 개역개정 본문에 글자 그대로 들어 있는지(문장부호·띄어쓰기 무시),
// (2) 말하는 시간이 다음 줄 시작 전에 끝나는지(초당 RATE 음절 + 쉼표·마침표마다 PAUSE 초로 추정).
// 그리고 사람이 읽을 원고 ko-script.md 를 만든다.
//   node motion/narration/check.mjs [--rate 4.2]
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const RATE = +(process.argv.includes('--rate') ? process.argv[process.argv.indexOf('--rate') + 1] : 4.2), PAUSE = 0.35, END = 863;
const { lines } = JSON.parse(readFileSync(join(HERE, 'ko.json'), 'utf8'));
const refs = [...new Set(lines.filter(l => l.q).map(l => l.q))];
const verses = Object.fromEntries(execFileSync('node', [join(HERE, 'krv.mjs'), ...refs], { encoding: 'utf8' }).trim().split('\n').map(l => l.split('\t')));
const BOOK = { gen: '창세기', exo: '출애굽기', deu: '신명기', jdg: '사사기', psa: '시편', '1sa': '사무엘상', '2sa': '사무엘하', '1ki': '열왕기상', neh: '느헤미야',
  isa: '이사야', mat: '마태복음', mrk: '마가복음', luk: '누가복음', jhn: '요한복음', act: '사도행전', rom: '로마서', gal: '갈라디아서', eph: '에베소서', col: '골로새서', rev: '요한계시록' };
const cite = q => { const [b, c, v] = q.split('.'); return `${BOOK[b] || b} ${c}:${v}`; };
const norm = s => s.replace(/[^가-힣0-9]/g, '');
const dur = s => (s.match(/[가-힣0-9]/g) || []).length / RATE + (s.match(/[,.?!·—]/g) || []).length * PAUSE;
let bad = 0, scene = '', md = `# 한국어 내레이션 원고 (초안)\n\n시간은 영상 속 시작 위치. **굵은 글씨** = 성경 인용(개역개정 그대로). 말 속도 초당 ${RATE}음절 기준.\n`;
lines.forEach((l, i) => {
  if (l.scene) { scene = l.scene; md += `\n## ${scene}\n\n`; }
  const d = dur(l.text), next = lines[i + 1]?.t ?? END, end = l.t + d, notes = [];
  if (l.q) { const v = verses[l.q] || ''; if (!norm(v).includes(norm(l.text))) { notes.push(`인용 불일치: ${l.q} = ${v}`); bad++; } }
  if (end > next + 0.3) { notes.push(`다음 줄과 ${(end - next).toFixed(1)}초 겹침`); bad++; }
  const mm = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  md += `- \`${mm(l.t)}\` ${l.q ? `**${l.text}** (${cite(l.q)})` : l.text}${notes.length ? ` ⚠️ ${notes.join(' / ')}` : ''}\n`;
  if (notes.length) console.log(`${mm(l.t)} ${l.text.slice(0, 30)} — ${notes.join(' / ')}`);
});
const total = lines.reduce((a, l) => a + dur(l.text), 0);
md += `\n---\n말하는 시간 합계 약 ${Math.round(total)}초 / 영상 ${END}초 (${Math.round(total / END * 100)}%).\n`;
writeFileSync(join(HERE, 'ko-script.md'), md);
console.log(`${lines.length} lines, ${bad} problem(s), speech ≈ ${Math.round(total)} s of ${END} s → ko-script.md`);
