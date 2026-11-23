// 「kingdom」 10차 리뷰 반영 — 관리자 2026-11-23 "응"(반영안 그대로). rounds/script-10.json → script.json. at은 임시, 뒤이어 script-retime.
//   node motion/films/kingdom/rounds/script-10b-spec.mjs
//   node motion/films/script-retime.mjs kingdom --write --pace 4.5 --gap 1.0 --quote-hold 1.8 --part-gap 6
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const s = JSON.parse(readFileSync(join(HERE, 'script-10.json'), 'utf8'));
const TEXT = {
  N101: '그런데 이 말을 삼 년 동안 가장 가까이에서 들은 사람도, / 십자가 앞에서까지 잘못 알아들었습니다.',
  N106: '그런데 베드로는 그 고기를 붙들지 않았습니다. / 그분의 무릎 아래 엎드렸습니다.',
  N136: '예수님이 꿈꾸신 나라는, 잃어버린 사람들이 / 하나님께 돌아오는 나라였습니다.',
  N145: '예수님은 칼을 칼집에 꽂으라 하시고, / 그 귀를 만져 낫게 하신 뒤 끌려가셨습니다.',
  N26b: '우리 죗값을 대신 치르셔서, / 하나님을 밀어냈던 우리가 다시 그 왕께 돌아갈 수 있도록.',
  N150: '함께 죽겠다던 그 곁에, 베드로는 없었습니다.',
  N160: '그 말씀대로 갈릴리로 돌아간 베드로는, / 다시 그물을 들었습니다.',
  N165: "'숯불', 원어로 이 낱말은 신약 성경에 딱 두 번 나옵니다. / 베드로가 예수님을 부인하던 밤의 그 불, 그리고 이 아침.",
  N173: '믿는 사람들은 누가 시키지 않아도, / 서로의 필요를 따라 자기 것을 나누었습니다.',
  N36: '그날 왕이 그 나라 사람들에게 하실 말씀을, / 예수님은 미리 들려주셨습니다.',
  N180: '그날까지, 베드로처럼 잘못 알아듣고 넘어져 우는 사람을, / 왕은 다시 찾아와 부르십니다.',
  N29d: '그 부르심에 붙들려 내 삶의 왕좌에서 내려와 / 예수님을 왕으로 믿고 따르는 자리, / 그 나라는 지금 거기에 임합니다.',
  N181: '이제 그 나라의 증인으로 나갈 차례는, / 우리입니다.',
};
const SCREEN = {
  N145: '칼이 내려가고, 다친 종에게 손을 뻗는 뒷모습 — 횃불들 사이로 끌려감',
  N163: '은빛 고기가 그물을 가득 채움 — 1부와 같은 구도이되 그물은 팽팽하게 버팀',
  N173: '문밖 길 위, 떡과 그릇이 손에서 손으로 — 따뜻한 빛',
};
const N = (id, part, text, screen) => ({ id, part, kind: 'narr', text, screen });
const INSERT_AFTER = {
  N43: [N('N43b', 2, '하나님의 아들 예수님이, / 바로 그 왕으로 오신 것입니다.', '스테인드글라스의 금 이음선 사이로 빛이 들어옴')],
  Q105: [N('N121b', 3, '그리스도, 하나님이 보내 주기로 / 약속하신 왕이라는 뜻입니다.', '노을빛이 큰 바위 전체로 번짐')],
  Q108: [N('N135b', 4, '평화를 주러 오신 왕을 눈앞에 두고도, / 그 성은 알아보지 못했습니다.', '성 안의 지붕들과 작은 사람들, 아무도 고개를 들지 않음')],
  N136: [N('N137', 4, '그 꿈을 이루시려고, / 그분은 그 성으로 들어가셨습니다.', '작은 뒷모습이 저무는 빛 속에 성문을 향해 걸어감')],
  N27: [
    { id: 'L108', part: 7, kind: 'label', voice: null, text: '마가복음 16장 · 빈 무덤의 천사가 여인들에게', screen: '인용 위 작은 표기' },
    { id: 'Q130', part: 7, kind: 'quote', usfm: 'MRK.16.7', cite: '마가복음 16:7', text: '가서 그의 제자들과 베드로에게 이르기를 / 예수께서 너희보다 먼저 갈릴리로 가시나니 / 전에 너희에게 말씀하신 대로 너희가 거기서 뵈오리라 하라', hl: '베드로에게', screen: '새벽빛이 든 빈 무덤 입구 — 개켜진 세마포' },
    N('N159', 7, '제자들과, 베드로. / 세 번 부인한 그 사람의 이름이 따로 불렸습니다.', '어두운 골목 벽에 기대 있던 베드로의 실루엣 위로 새벽빛이 닿음'),
  ],
  N163: [N('N163b', 7, '그런데 이번에는, / 그물이 찢어지지 않았습니다.', '가득 찬 그물이 팽팽하게 버티며 호숫가로 끌려옴')],
};
const INSERT_BEFORE = { N165: [{ id: 'L109', part: 7, kind: 'label', voice: null, text: "요한복음 18:18 · 21:9 (18:18은 개역개정에 '불')", screen: '작은 표기' }] };
// 8부: 나눔 → 완성의 날 → 그날 왕이 하실 말씀 → 지극히 작은 자 → 넘어져도 부르심 → 왕을 모심 → 곁의 작은 사람 → 우리 차례 → 주기도문
const P8 = ['C5', 'N15c', 'Q6', 'N15d', 'N28c', 'Q6a', 'N170', 'N172', 'N173', 'N28b', 'N29', 'L14', 'Q21', 'N36', 'L13', 'Q20b', 'N36c', 'Q20', 'N180', 'N29d', 'N29e', 'N181', 'N30', 'L2', 'Q2', 'E1'];
const apply = l => ({ ...l, ...(TEXT[l.id] ? { text: TEXT[l.id] } : {}), ...(SCREEN[l.id] ? { screen: SCREEN[l.id] } : {}) });
const out = [];
for (const l of s.lines.filter(x => x.part < 8)) { for (const x of INSERT_BEFORE[l.id] || []) out.push(x); out.push(apply(l)); for (const x of INSERT_AFTER[l.id] || []) out.push(x); }
const by8 = Object.fromEntries(s.lines.filter(x => x.part === 8).map(l => [l.id, l]));
if (Object.keys(by8).length !== P8.length || P8.some(id => !by8[id])) throw new Error('8부 줄이 맞지 않음');
for (const id of P8) out.push(apply(by8[id]));
let t = -0.7; const lines = out.map(x => { const cap = x.kind === 'label' && /^L/.test(x.id); return { ...x, at: cap ? +(t + .8).toFixed(1) : +(t += 1).toFixed(1) }; });
const ids = lines.map(l => l.id), dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) throw new Error('같은 id: ' + dup);
writeFileSync(join(HERE, '..', 'script.json'), JSON.stringify({ ...s, lines }, null, 1) + '\n');
console.log(lines.length + '줄 · 인용 ' + lines.filter(l => l.kind === 'quote').length + '개');
