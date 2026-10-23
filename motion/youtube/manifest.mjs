// The YouTube upload sheet — every film language, the film and its 21 Shorts: file names (release assets), title,
// description with chapter timestamps, tags, thumbnails, caption tracks. Built only from what already exists, so nothing
// is translated twice:
//   - the film's own strings: motion/pilot/i18n/<lang>.json (_ui: blurb, legal, chapter names; scene lines for the hooks)
//   - the scene timings: motion/subs/timeline-h.json
//   - a few YouTube-only lines per language: motion/youtube/lang/<code>.json (watch, short_tail, tags; thumb = thumbnail text)
//   node motion/youtube/manifest.mjs   → motion/youtube/manifest.json (+ manifest.md to read, + shorts-titles.md)
// A language is included when it has a lang file and (except Korean) a merged film pack and a native review on record
// (motion/reviews/<code>.md) — the same quality gate as the site.
// Shorts titles: a hook line the scene itself shows + chapter name + "n/21" (HOOK below = the Korean keys; each language's
// reviewed film translation of those keys). Paths in the manifest are relative to the repository root.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), M = join(HERE, '..');
const ORDER = ['opening', 'creation', 'fall', 'patriarch', 'exodus', 'wilderness', 'judges', 'kingdom', 'exile', 'return', 'silence',
  'advent', 'cross', 'rise', 'church', 'renewal', 'mirror', 'gospel', 'evidence', 'ship', 'invite'];
const SITE = 'https://one-scroll-bible.com', RELEASE = process.env.RELEASE || 'youtube-v1', REPO = 'jungrok5/one-scroll-bible';
const KO_UI = { brand: '한눈에 보는 성경 이야기', sub: '창조에서 새 하늘과 새 땅까지 — 장면마다 다른 화풍으로 그린 21개 장면이 하나의 줄거리로 이어집니다.',
  shareText: '창조에서 새 하늘과 새 땅까지, 성경 이야기를 14분 영상으로',
  legal: '성경 인용: 「성경전서 개역개정판」 © 대한성서공회. 저작권은 대한성서공회에 있으며, 출처를 밝혀 인용했습니다. 장면의 그림은 모두 코드로 그렸고, 음악·효과음은 ElevenLabs로 만들었습니다.' };
const HOOK = {   // scene → Korean key(s), exactly as in motion/pilot/i18n/_ko/<scene>.json
  opening: ['성경은 결국 한 편의 이야기입니다'], creation: ['“하나님이 이르시되 빛이 있으라”'], fall: ['“네가 어디 있느냐”'],
  patriarch: ['“하늘을 우러러 뭇별을 셀 수 있나 보라”'], exodus: ['“내 백성을 보내라”'], wilderness: ['약속의 땅 문 앞에 선 백성, 이제 들어갑니다…'],
  judges: ['왕이 없어 제멋대로 행하다.'], kingdom: ['사람은 외모를 보거니와 나 여호와는 중심을 보느니라'],
  exile: ['성전이 불타고, 백성은 바벨론으로 끌려갑니다.'], return: ['여호와로 인하여 기뻐하는 것이 너희의 힘이니라'],
  silence: ['선지자의 음성이 멈춘 400년'], advent: ['“말씀이 육신이 되어 우리 가운데 거하시매”'],
  cross: ['그 십자가에 달려야 했던 사람은', '바로 나였습니다.'], rise: ['“그가 말씀 하시던 대로 살아나셨느니라”'],
  church: ['“… 땅 끝까지 이르러 내 증인이 되리라”'], renewal: ['“모든 눈물을 그 눈에서 닦아 주시니”'],
  mirror: ['결국 가장 깊은 우상은', '“하나님 자리에 앉은 나 자신”입니다.'], gospel: ['“행하라”가 아니라 “이루어졌다”'],
  evidence: ['성경이 진짜 실화인가요?'], ship: ['예수님 안 믿어도,\n그냥 착하게 살면 되는 것 아닌가요?'], invite: ['이 사랑은 정보가 아니라 초대입니다.'],
};
const ALT = { kingdom: ['나 여호와는 중심을 보느니라'] };   // when the full line makes the title too long (Arabic)
const NO_CHAPTER = new Set(['opening', 'evidence']);   // the hook already says the chapter name

const read = p => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''));
const OPEN = read(join(HERE, 'shorts-open.json'));   // a Short starts this far into its scene (skips the fade-in)
// the site's FAQ heading per language: ko from index.html's markup, the rest from i18n/<L>.json (en.json mirrors EN_PACK)
const faqHeading = L => L === 'ko'
  ? (readFileSync(join(M, '..', 'index.html'), 'utf8').match(/data-i18n="faq\.h">([^<]+)</) || [])[1]
  : existsSync(join(M, '..', 'i18n', L + '.json')) ? read(join(M, '..', 'i18n', L + '.json')).s?.['faq.h'] : undefined;
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/ /g, ' ');
// drop the last sentence "…drawn live in your browser" (true on the site only); Hindi ends sentences with "।";
// a script without sentence marks (Thai) gives its YouTube blurb in motion/youtube/lang/<code>.json → "blurb"
const blurb = s => strip(s).replace(/([.。।])[^.。।]+[.。।]\s*$/u, '$1');
const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const CJK = '\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\u3000-\\u303f\\uff00-\\uffef';
const clean = s => String(s).replace(new RegExp(`(?<=[${CJK}])\\s*\\n\\s*|\\s*\\n\\s*(?=[${CJK}])`, 'gu'), '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
const tidy = s => s.replace(/[\s—–:,]+$/u, '').replace(/^([\p{P}\s]*)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase());

const tl = read(join(M, 'subs', 'timeline-h.json'));
const starts = {}; let off = 0; for (const sc of ORDER) { starts[sc] = off; off += tl[sc].frames / 30; }
const koIds = Object.fromEntries(ORDER.map(sc => [sc, read(join(M, 'pilot', 'i18n', '_ko', sc + '.json')).ids]));
const koCh = ORDER.map(sc => koIds[sc].find(k => /^\d\d\s*·/.test(k)).replace(/^\d\d\s*·\s*/, ''));
// in the site's own language order (LANGS in index.html), so the sheet stays stable as languages are added
const SITE_ORDER = [...readFileSync(join(M, '..', 'index.html'), 'utf8').match(/const LANGS\s*=\s*\[([\s\S]*?)\];/)[1].matchAll(/code:'([^']+)'/g)].map(x => x[1]);
const LANGS = readdirSync(join(HERE, 'lang')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5))
  .filter(L => L === 'ko' || (existsSync(join(M, 'pilot', 'i18n', L + '.json')) && existsSync(join(M, 'reviews', L + '.md'))))   // quality gate: reviewed only
  .sort((a, b) => (SITE_ORDER.indexOf(a) + 1 || 1e9) - (SITE_ORDER.indexOf(b) + 1 || 1e9));
const subsOf = (dir, file) => Object.fromEntries(LANGS.filter(l => l !== 'ko' && existsSync(join(M, 'subs', l, dir, file))).map(l => [l, `motion/subs/${l}/${dir ? dir + '/' : ''}${file}`]));

const out = { release: RELEASE, release_url: `https://github.com/${REPO}/releases/tag/${RELEASE}`, film_seconds: +off.toFixed(1), languages: {} };
const md = [`# YouTube upload sheet\n\nVideos: release **${RELEASE}** (\`gh release download ${RELEASE} -R ${REPO}\`). Paths are relative to the repository root.\n`];
const titlesMd = ['# Shorts titles (hook — chapter n/21)', ''], problems = [];
for (const L of LANGS) {
  const pack = L === 'ko' ? null : read(join(M, 'pilot', 'i18n', L + '.json'));
  const ui = pack ? pack._ui : KO_UI, ch = pack ? ui.ch : koCh, X = read(join(HERE, 'lang', L + '.json'));
  for (const k of ['watch', 'short_tail', 'tags', 'thumb']) if (!X[k]) problems.push(`${L}: motion/youtube/lang/${L}.json has no "${k}"`);
  const page = `${SITE}/film/` + (L === 'ko' ? '' : `?lang=${L}`);
  // the description links to the language's home page (gospel → prayer), tagged so GA4 can tell YouTube visits apart;
  // not to the film page: the site's film button sends people to YouTube, so the two would only point at each other
  const home = `${SITE}/${L === 'ko' ? '' : L + '/'}`;
  // Korean lives at the root, which (unlike /en/, /es/ …) picks its language from a saved choice or the browser language —
  // lang=ko pins it, so a Korean link never opens in English (2026-10-23)
  const utm = (medium, campaign, content) => `?${L === 'ko' ? 'lang=ko&' : ''}utm_source=youtube&utm_medium=${medium}&utm_campaign=${campaign}` + (content ? `&utm_content=${content}` : '');
  const chapters = ORDER.map((sc, i) => ({ time: mmss(starts[sc]), seconds: +starts[sc].toFixed(1), title: ch[i] }));
  const hashtags = n => (X.tags || []).slice(0, n).map(t => '#' + t.replace(/\s/g, '')).join(' ');
  const link = home + utm('video', `film_${L}`);
  const description = [X.blurb || blurb(ui.sub), '', `${X.watch}: ${link}`, '', ...chapters.map(c => `${c.time} ${c.title}`), '', strip(ui.legal), '', hashtags(3)].join('\n');
  const tags = [ui.brand, ...(X.tags || []), ...ch]; while (tags.join(',').length > 480) tags.pop();   // YouTube: 500 characters in all
  const film = { file: `film-${L}.mp4`, local: `motion/out/release/film-${L}.mp4`, title: ui.shareText.slice(0, 100), description, link, tags, language: L,
    thumbnail: `motion/youtube/thumbs/${L}/A-exodus.jpg`, thumbnail_alternatives: ['B-cross', 'C-split', 'D-earth'].map(v => `motion/youtube/thumbs/${L}/${v}.jpg`),
    captions: subsOf('', 'film-h.srt'), chapters, playlist: ui.brand, page,
    // pinned comment: the site's FAQ ("still wrestling with something?") — the film already ends on the prayer, and the
    // description already links the home page, so the comment points at what the film does not have. Text = the site
    // pack's already-reviewed faq.h (no new translation). Posted/updated with studio-comment.js.
    pinned: { text: faqHeading(L), link: home + utm('video', `film_${L}`, 'pinned') + '#faq' } };
  if (!film.pinned.text) problems.push(`${L}: no faq.h in the site pack`);
  titlesMd.push(`## ${L}`);
  const shorts = ORDER.map((sc, i) => {
    const n = i + 1, name = `${String(n).padStart(2, '0')}-${sc}`;
    const hookFor = keys => keys.map(k => {
      if (!koIds[sc].includes(k)) problems.push(`${sc}: hook key not in the scene: ${k}`);
      const v = pack ? pack[sc]?.[k] : k; if (pack && !v) problems.push(`${L}/${sc}: hook untranslated: ${k}`);
      return clean(v || k);
    });
    const make = (ps, chap = !NO_CHAPTER.has(sc)) => { const h = tidy(clean(ps.join('\n'))); return chap ? `${h} — ${ch[i]} ${n}/21` : `${h} ${n}/21`; };
    const long = t => [...t].length > 100;   // YouTube's title limit
    let title = make(hookFor(HOOK[sc]));
    if (long(title)) title = make(hookFor(HOOK[sc]), false);   // drop the chapter name first
    if (long(title) && ALT[sc]) title = make(hookFor(ALT[sc]));
    if (long(title)) problems.push(`${L}/${sc}: title over 100 characters`);
    titlesMd.push(`${String(n).padStart(2, '0')}. ${title}`);
    const slink = home + utm('shorts', `shorts_${L}`, name);
    return { n, scene: sc, file: `shorts-${L}-${name}.mp4`, local: `motion/out/release/shorts-${L}-${name}.mp4`, title, link: slink,
      description: [ui.shareText, `${X.short_tail}: ${slink}`, '', '#Shorts ' + hashtags(2)].join('\n'),
      tags: tags.slice(0, 12), language: L, seconds: +(tl[sc].frames / 30 - (OPEN.scenes[sc] ?? OPEN.default)).toFixed(1), captions: subsOf('v', name + '.srt') };
  });
  titlesMd.push('');
  out.languages[L] = { brand: ui.brand, film, shorts };
  md.push(`## ${L} — ${ui.brand}`, `**Film** \`${film.file}\` · thumbnail \`${film.thumbnail}\` (alternatives B/C/D) · captions ${Object.keys(film.captions).length} languages`,
    `- title: ${film.title}`, '- description:', '```', description, '```', `- tags: ${tags.join(', ')}`, '', `**Shorts** (\`shorts-${L}-NN-<scene>.mp4\`)`,
    ...shorts.map(s => `${String(s.n).padStart(2, '0')}. ${s.title}  (${s.seconds} s)`), '');
}
writeFileSync(join(HERE, 'manifest.json'), JSON.stringify(out, null, 1));
writeFileSync(join(HERE, 'manifest.md'), md.join('\n'));
writeFileSync(join(HERE, 'shorts-titles.md'), titlesMd.join('\n'));
console.log(`→ motion/youtube/manifest.json · ${LANGS.length} languages (${LANGS.join(' ')}) · ${off.toFixed(1)} s`);
if (problems.length) { console.log(problems.join('\n')); process.exitCode = 1; }
