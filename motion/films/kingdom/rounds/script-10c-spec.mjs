// 「kingdom」 10차 관점 재검수 7개 반영 — 관리자 2026-11-24 "그래". rounds/script-10b.json → script.json (motion/reviews/film-kingdom-theology-r10b.json)
//   node motion/films/kingdom/rounds/script-10c-spec.mjs
//   node motion/films/script-retime.mjs kingdom --write --pace 4.5 --gap 1.0 --quote-hold 1.8 --part-gap 6
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const s = JSON.parse(readFileSync(join(HERE, 'script-10b.json'), 'utf8'));
const TEXT = {
  N121b: "그리스도는 '기름 부음 받은 자', / 하나님이 보내 주기로 약속하신 그 왕을 가리킵니다.",
  N160: '살아나신 예수님을 뵌 뒤, 그 말씀대로 / 갈릴리로 돌아간 베드로는, 다시 그물을 들었습니다.',
  N163b: '그런데 이번에는, 뭍으로 끌어 올릴 때까지 / 그물이 찢어지지 않았습니다.',
  N164: "'주님이시라'는 말을 듣자, 베드로는 겉옷을 두르고 / 바다로 뛰어들었습니다.",
  N180: '그날까지, 베드로처럼 잘못 알아듣고 넘어져 우는 사람을, / 왕은 다시 찾아와 돌아오라 부르십니다.',
  N36: '그날 왕은 그 나라 사람들에게, 창세로부터 예비된 나라를 / 상속받으라 하시며 이렇게 말씀하실 것입니다.',
  L108: '마가복음 16장 · 빈 무덤에서 여인들에게',
};
let n = 0; const lines = s.lines.map(l => { if (!TEXT[l.id]) return l; n++; return { ...l, text: TEXT[l.id] }; });
if (n !== Object.keys(TEXT).length) throw new Error('고칠 줄이 맞지 않음 ' + n);
writeFileSync(join(HERE, '..', 'script.json'), JSON.stringify({ ...s, lines }, null, 1) + '\n'); console.log('고친 줄', n);
