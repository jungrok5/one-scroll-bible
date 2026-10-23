// Instagram Reels plan: one Short a day, in scene order, with its cover and caption.
//   node motion/social/insta_reels_plan.mjs [lang=ko] [--start 2026-10-24] [--time 19:00] [--tz +09:00]
//   → motion/out/insta/reels-<lang>/plan.json (+ plan.md to read): n, scene, video (the opened Short from
//     motion/out/release-open), cover (insta_reel_covers.py), caption, at (ISO time).
// Caption = the Short's hook, chapter · series n/21, one line about the film, "profile link" (Instagram captions do
// not link), 5 hashtags. The profile link carries the UTM (utm_source=instagram&utm_medium=social&utm_campaign=bio).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const M = join(dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2), val = (n, d) => (a.includes('--' + n) ? a[a.indexOf('--' + n) + 1] : d);
const lang = a.find((x, i) => !x.startsWith('--') && !a[i - 1]?.startsWith('--')) || 'ko';
const start = val('start', '2026-10-24'), time = val('time', '19:00'), tz = val('tz', '+09:00');
const man = JSON.parse(readFileSync(join(M, 'youtube', 'manifest.json'), 'utf8')).languages[lang];
const OUT = join(M, 'out', 'insta', `reels-${lang}`);
const LINE = { ko: '창조부터 새 하늘과 새 땅까지, 성경 전체를 14분 영상으로.\n전체 영상과 글로 읽는 성경 이야기는 프로필 링크에서.' };
const TAGS = { ko: ['#성경', '#성경이야기', '#한눈에보는성경', '#기독교'] };
// chapter name when the Short's title has none ("hook n/21")
const CHAPTER = { ko: { opening: '하나의 줄거리', evidence: '성경은 실화인가' } };

const plan = man.shorts.map((s, i) => {
  const m = s.title.match(/^(.*?)\s+(\d+)\/(\d+)$/); const body = m[1], n = +m[2], tot = +m[3];
  const k = body.lastIndexOf(' — '), hook = k < 0 ? body : body.slice(0, k), chap = k < 0 ? (CHAPTER[lang]?.[s.scene] || '') : body.slice(k + 3);
  if (!chap) throw new Error(`no chapter name for ${s.scene} — add it to CHAPTER`);
  const at = new Date(Date.parse(`${start}T${time}:00${tz}`) + i * 864e5).toISOString();
  const video = join(M, 'out', 'release-open', s.file), cover = join(OUT, `cover-${String(n).padStart(2, '0')}-${s.scene}.jpg`);
  for (const f of [video, cover]) if (!existsSync(f)) throw new Error('missing ' + f);
  const caption = `${hook}\n\n${chap} · ${man.brand} ${n}/${tot}\n${LINE[lang]}\n\n${[...TAGS[lang], '#' + chap.replace(/[\s·?…]/g, '')].join(' ')}`;
  return { n, scene: s.scene, at, video, cover, caption };
});
writeFileSync(join(OUT, 'plan.json'), JSON.stringify(plan, null, 1));
writeFileSync(join(OUT, 'plan.md'), plan.map(p => `## ${p.n}. ${p.scene} — ${p.at}\n\n${p.caption}\n`).join('\n'));
console.log(`${plan.length} reels → ${join(OUT, 'plan.json')} (${plan[0].at} … ${plan.at(-1).at})`);
