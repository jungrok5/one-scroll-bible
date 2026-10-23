// Paste-in helpers for YouTube Studio: create one language's public playlist (title = the site brand, description = the
// film blurb, language = that language, order = published date oldest first → the film, then Shorts 1–21) holding the
// film and that language's scheduled Shorts. Needs the local file server (node motion/youtube/serve.mjs), reading
// motion/youtube/manifest.json and uploaded.json. Record the new id in uploaded.json "playlists".
//
// Steps per language (what worked on 2026-10-23, 16 languages):
//   1. real click Studio's top-right 만들기 → 새 재생목록 (the page's own "새 재생목록" button only exists while the channel
//      has no playlist at all)
//   2. __osbPlaylist('<code>', '<Studio language name, e.g. 영어>').then(r => window.__plr = r)
//        fills title/description, picks order + language, opens 동영상 추가 and ticks the film (found by title search)
//   3. if the language has Shorts: __plShorts('<code>').then(r => window.__pls = r)   (each Short found by its title —
//      the picker's search does not match descriptions or ids, and its list only lazy-loads the latest ~30 videos)
//   4. real click the picker's 완료, check "동영상 N개" in the dialog, real click 만들기
// For a later wave: run it after that wave's 21 Shorts are scheduled, so the playlist is made once with all 22.

window.__osbPlaylist = async (L, label) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)); const wait = async (fn, ms = 15000) => { for (let t = 0; t < ms; t += 250) { const v = fn(); if (v) return v; await sleep(250); } return null; };
  const m = await (await fetch('http://127.0.0.1:8765/youtube/manifest.json', { cache: 'no-store' })).json();
  const up = await (await fetch('http://127.0.0.1:8765/youtube/uploaded.json', { cache: 'no-store' })).json();
  const X = m.languages[L], filmId = up.film[L]?.id; if (!X || !filmId) return { L, err: 'no manifest entry or film id' };
  const r = { L };
  const d = await wait(() => [...document.querySelectorAll('ytcp-dialog')].find(e => e.offsetParent && /새 재생목록 만들기/.test(e.innerText))); if (!d) return { ...r, err: 'open the 새 재생목록 dialog first' };
  await sleep(800);
  const [t, ds] = d.querySelectorAll('#textbox'); const put = (el, v) => { el.focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
  put(t, X.brand); await sleep(300); put(ds, X.film.description.split('\n')[0]); await sleep(300);
  const pick = async (re, item) => { const tr = [...d.querySelectorAll('ytcp-dropdown-trigger')].find(e => re.test(e.innerText)); (tr.querySelector('#right-icon, tp-yt-iron-icon, #trigger') || tr).click(); await sleep(900);
    const it = [...document.querySelectorAll('tp-yt-paper-item')].find(e => e.offsetParent !== null && e.innerText.trim() === item); if (it) { it.scrollIntoView({ block: 'center' }); it.click(); await sleep(600); } };
  await pick(/기본 동영상 순서/, '게시된 날짜(오래된순)'); r.order = /오래된순/.test(d.innerText);
  await pick(/제목 및 설명/, label); r.lang = (d.innerText.match(/제목 및 설명\s*\n\s*(.+)/) || [])[1];
  [...d.querySelectorAll('ytcp-button')].find(b => b.innerText.trim() === '동영상 추가')?.click();
  const p = await wait(() => [...document.querySelectorAll('ytcp-dialog')].filter(e => e.offsetParent).find(e => /^동영상 추가/.test(e.innerText.trim()))); if (!p) return { ...r, err: 'no picker' };
  await sleep(1500);
  r.film = await tickBySearch(p, X.film.title.slice(0, 40), filmId);
  return r;
};

window.__plShorts = async L => {
  const m = await (await fetch('http://127.0.0.1:8765/youtube/manifest.json', { cache: 'no-store' })).json();
  const up = await (await fetch('http://127.0.0.1:8765/youtube/uploaded.json', { cache: 'no-store' })).json();
  const p = [...document.querySelectorAll('ytcp-dialog')].filter(e => e.offsetParent).find(e => /^동영상 추가/.test(e.innerText.trim())); if (!p) return 'no picker';
  const done = [], miss = [];
  for (const [n, id] of Object.entries(up.shorts[L]?.ids || {})) (await tickBySearch(p, m.languages[L].shorts[+n - 1].title.slice(0, 40), id) ? done : miss).push(n);
  return { done: done.length, miss };
};

async function tickBySearch(p, query, id) {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const idOf = img => ((img.src || '').match(/\/vi(?:_webp)?\/([^/]+)\//) || [])[1];   // the row thumbnail carries the video id
  const inp = p.querySelector('input'); inp.focus(); inp.value = query; inp.dispatchEvent(new Event('input', { bubbles: true }));
  inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })); await sleep(2300);
  for (const img of p.querySelectorAll('img')) { if (idOf(img) !== id) continue; let row = img; for (let k = 0; k < 10 && row && !row.querySelector('[role=checkbox]'); k++) row = row.parentElement;
    const cb = row && row.querySelector('[role=checkbox]'); if (!cb) continue; if (cb.getAttribute('aria-checked') !== 'true') { cb.click(); await sleep(200); } return true; }
  return false;
}
