// Shorts titles: a hook line from the scene itself + the chapter name + "n/21", in every language.
// The hook is a line the film already shows (its Korean key → each language's reviewed film translation), so nothing is
// translated anew. Two keys in one hook are shown one after the other in the film, so joining them reads naturally.
//   node motion/youtube/shorts-titles.mjs   → updates shorts[].title in motion/youtube/manifest.json, writes shorts-titles.md
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), M = join(HERE, '..');
const HOOK = {   // scene → Korean key(s), exactly as in motion/pilot/i18n/_ko/<scene>.json
  opening: ['성경은 결국 한 편의 이야기입니다'],
  creation: ['“하나님이 이르시되 빛이 있으라”'],
  fall: ['“네가 어디 있느냐”'],
  patriarch: ['“하늘을 우러러 뭇별을 셀 수 있나 보라”'],
  exodus: ['“내 백성을 보내라”'],
  wilderness: ['약속의 땅 문 앞에 선 백성, 이제 들어갑니다…'],
  judges: ['왕이 없어 제멋대로 행하다.'],
  kingdom: ['사람은 외모를 보거니와 나 여호와는 중심을 보느니라'],
  exile: ['성전이 불타고, 백성은 바벨론으로 끌려갑니다.'],
  return: ['여호와로 인하여 기뻐하는 것이 너희의 힘이니라'],
  silence: ['선지자의 음성이 멈춘 400년'],
  advent: ['“말씀이 육신이 되어 우리 가운데 거하시매”'],
  cross: ['그 십자가에 달려야 했던 사람은', '바로 나였습니다.'],
  rise: ['“그가 말씀 하시던 대로 살아나셨느니라”'],
  church: ['“… 땅 끝까지 이르러 내 증인이 되리라”'],
  renewal: ['“모든 눈물을 그 눈에서 닦아 주시니”'],
  mirror: ['결국 가장 깊은 우상은', '“하나님 자리에 앉은 나 자신”입니다.'],
  gospel: ['“행하라”가 아니라 “이루어졌다”'],
  evidence: ['성경이 진짜 실화인가요?'],
  ship: ['예수님 안 믿어도,\n그냥 착하게 살면 되는 것 아닌가요?'],
  invite: ['이 사랑은 정보가 아니라 초대입니다.'],
};
const ALT = { kingdom: ['나 여호와는 중심을 보느니라'] };   // when the full line makes the title too long (Arabic)
const NO_CHAPTER = new Set(['opening', 'evidence']);   // the hook already says the chapter name
// a hook cut from the middle of a sentence may end in a dash or colon, or start in lower case
const tidy = s => s.replace(/[\s—–:,]+$/u, '').replace(/^([\p{P}\s]*)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase());
const man = JSON.parse(readFileSync(join(HERE, 'manifest.json'), 'utf8'));
const CJK = '\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\u3000-\\u303f\\uff00-\\uffef';
const clean = s => String(s).replace(new RegExp(`(?<=[${CJK}])\\s*\\n\\s*|\\s*\\n\\s*(?=[${CJK}])`, 'gu'), '')   // no space at a CJK line break
  .replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
const md = ['# Shorts titles (hook — chapter n/21)', ''], problems = [];
for (const [L, lang] of Object.entries(man.languages)) {
  const pack = L === 'ko' ? null : JSON.parse(readFileSync(join(M, 'pilot', 'i18n', L + '.json'), 'utf8'));
  md.push(`## ${L}`);
  for (const s of lang.shorts) {
    const ids = JSON.parse(readFileSync(join(M, 'pilot', 'i18n', '_ko', s.scene + '.json'), 'utf8')).ids;
    const hookFor = keys => keys.map(k => {
      if (!ids.includes(k)) problems.push(`${s.scene}: key not in the scene: ${k}`);
      const v = pack ? pack[s.scene]?.[k] : k; if (pack && !v) problems.push(`${L}/${s.scene}: untranslated: ${k}`);
      return clean(v || k);
    });
    const chapter = pack ? pack._ui.ch[s.n - 1] : ids.find(k => /^\d\d\s*·/.test(k)).replace(/^\d\d\s*·\s*/, '');   // so a re-run gives the same title
    const make = (ps, chap = !NO_CHAPTER.has(s.scene)) => { const h = tidy(clean(ps.join('\n')));return chap ? `${h} — ${chapter} ${s.n}/21` : `${h} ${s.n}/21`; };
    const long = t => [...t].length > 100;   // YouTube's title limit
    let title = make(hookFor(HOOK[s.scene]));
    if (long(title)) title = make(hookFor(HOOK[s.scene]), false);   // drop the chapter name first
    if (long(title) && ALT[s.scene]) title = make(hookFor(ALT[s.scene]));
    if ([...title].length > 100) problems.push(`${L}/${s.scene}: title over 100 characters`);
    s.title = title; md.push(`${String(s.n).padStart(2, '0')}. ${title}`);
  }
  md.push('');
}
writeFileSync(join(HERE, 'manifest.json'), JSON.stringify(man, null, 1));
writeFileSync(join(HERE, 'shorts-titles.md'), md.join('\n'));
console.log(problems.length ? problems.join('\n') : 'ok — every hook found and translated');
