// Korean Bible references → links to read them in 개역개정 on the Korean Bible Society's Bible platform (bible.bskorea.or.kr:
// official, made for phones, USFM book codes: /bible/NKRV/MAL.4.5-6). 관리자 2026-11-05: "읽어야 하는 성경 링크 — 개역개정이면서
// 모바일에서 읽기 편한 걸로, 영상 보고 바로 읽을 수 있게". Book names come from the site's own table (index.html BOOKS.ko).
// Note: YouTube does not make links clickable in Shorts descriptions/comments (since 2023) nor Instagram in captions —
// the clickable place is a long video's description, Threads posts, and the site.
//   node motion/youtube/bible-links.mjs "말라기 4:5–6 → 하박국 2:3 → 다니엘 2장 → 사도행전 13–14장, 17장"
//   import { bibleUrl, bibleLines } from './bible-links.mjs'
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BOOKS = JSON.parse(readFileSync(join(ROOT, 'index.html'), 'utf8').match(/var BOOKS=(\{"ko":\{[^}]*\})/)[1] + '}').ko;
const BASE = 'https://bible.bskorea.or.kr/bible/NKRV/';
// "말라기 4:5–6" · "다니엘 2장" · "사도행전 13–14장" · "누가복음 4:16–21" · "고린도전서 15:3–4" → URL (a chapter range opens its first chapter)
export function bibleUrl(ref) {
  const m = ref.trim().match(/^(.+?)\s*(\d+)(?:\s*[:장]\s*(\d+)?(?:\s*[–-]\s*(\d+))?(?:\s*장)?)?/);
  if (!m) return null; const book = BOOKS[m[1].trim()]; if (!book) return null;
  const [, , ch, v1, v2] = m; if (!v1) return BASE + `${book}.${ch}`;
  return BASE + `${book}.${ch}.${v1}${v2 ? '-' + v2 : ''}`;
}
// a "A → B → C" reading list → [{ ref, url }]; "13–14장, 17장" after one book name splits into chapters of that book
export function bibleLines(list) {
  const out = []; let last = null;
  for (const raw of list.split(/\s*(?:→|·|\n)\s*/).filter(Boolean)) for (const part of raw.split(/\s*,\s*/)) {
    const ref = /^\d/.test(part) && last ? `${last} ${part}` : part, url = bibleUrl(ref); if (!url) continue;
    last = ref.match(/^(\D+?)\s*\d/)?.[1]?.trim() || last; out.push({ ref, url }); }
  return out;
}
if (process.argv[1] && process.argv[1].endsWith('bible-links.mjs') && process.argv[2]) for (const { ref, url } of bibleLines(process.argv.slice(2).join(' '))) console.log(`${ref}  ${url}`);
