// Paste-in helpers for a film's WATCH page (youtube.com/watch?v=<id>, signed in as the channel @one-scroll-bible): post or
// update the channel's pinned comment from motion/youtube/manifest.json (film.pinned = the site's faq.h + the language's
// home page #faq, tagged utm_content=pinned). Needs the local file server (node motion/youtube/serve.mjs).
// It is a public post in the channel's name — get the user's yes first.
//
// What works (2026-10-23, 16 films): typing and the post/save buttons react to script clicks, but the comment's ⋮ menu
// and the pin dialog's confirm button often do NOT — so the script finds where they are and you click them for real
// (Claude in Chrome: computer left_click at the returned coordinates, or the find tool + ref for the confirm button).
// Coordinates are in a 1044-px-wide screenshot frame (scale = 1044 / innerWidth); change W below if yours differs.
//
//   1. __osbCommentPrep('en').then(r => window.__cr = r)
//        → { state: 'unchanged' }                       done
//        → { state: 'posted', menu: [x, y] }            new comment posted → step 2 with 고정/Pin
//        → { state: 'edit', menu: [x, y] }              existing comment differs → step 2 with 수정/Edit
//   2. real click on menu → __osbMenuItems() → [[label, x, y], …] → real click on 고정 or 수정
//   3a. pin: the dialog's 고정/Pin button — real click (find "고정 confirm button") → __osbCommentCheck('en')
//   3b. edit: __osbCommentType('en').then(r => window.__cr = r)   → 'updated pinned'
// Wait for each result before navigating away: leaving before the save confirms loses it (happened once).

const W = 1044;
const at = el => { const b = el.getBoundingClientRect(), s = W / innerWidth; return [Math.round((b.x + b.width / 2) * s), Math.round((b.y + b.height / 2) * s)]; };
const pinned = async L => {
  const m = await (await fetch('http://127.0.0.1:8765/youtube/manifest.json', { cache: 'no-store' })).json();
  const p = m.languages[L]?.film?.pinned;
  if (!p?.text || !/^https:\/\/one-scroll-bible\.com\/\S*#faq$/.test(p.link || '')) throw new Error('manifest has no pinned text/link — run node motion/youtube/manifest.mjs');
  return { ...p, want: p.text + '\n' + p.link };
};
const mine = () => [...document.querySelectorAll('ytd-comment-thread-renderer')].find(t => /one-scroll-bible/.test(t.querySelector('#author-text')?.innerText || ''));
const typeInto = (ed, p) => { ed.focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, p.text); document.execCommand('insertLineBreak'); document.execCommand('insertText', false, p.link); ed.dispatchEvent(new Event('input', { bubbles: true })); };

window.__osbCommentPrep = async L => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)), p = await pinned(L);
  document.querySelector('video')?.pause();
  for (let k = 0; k < 30 && !document.querySelector('#simplebox-placeholder'); k++) { window.scrollBy(0, 400); await sleep(400); }
  const ph = document.querySelector('#simplebox-placeholder'); if (!ph) return { state: 'error', error: 'comments did not load (comments off?)' };
  await sleep(1500);
  let th = mine();
  if (th) {
    if ((th.querySelector('#content-text')?.innerText || '').trim() === p.want) return { state: 'unchanged' };
    th.scrollIntoView({ block: 'center' }); await sleep(700); return { state: 'edit', menu: at(th.querySelector('#action-menu button')) };
  }
  ph.scrollIntoView({ block: 'center' }); ph.click(); await sleep(900);
  const ed = document.querySelector('#contenteditable-root'); if (!ed) return { state: 'error', error: 'no editor' };
  typeInto(ed, p); await sleep(600); if (ed.innerText.trim() !== p.want) return { state: 'error', error: 'text mismatch' };
  document.querySelector('#submit-button button, #submit-button').click();
  for (let k = 0; k < 40 && !(th = mine()); k++) await sleep(300);
  if (!th) return { state: 'error', error: 'posted? thread not found' };
  th.scrollIntoView({ block: 'center' }); await sleep(700);
  return { state: 'posted', menu: at(th.querySelector('#action-menu button')) };
};

window.__osbMenuItems = () => [...document.querySelectorAll('ytd-menu-service-item-renderer, tp-yt-paper-item')].filter(e => e.offsetParent).map(e => [e.innerText.trim(), ...at(e)]);

window.__osbCommentType = async L => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)), p = await pinned(L), th = mine();
  const ed = th?.querySelector('#contenteditable-root'); if (!ed) return 'no inline editor — click 수정/Edit first';
  typeInto(ed, p); await sleep(600); if (ed.innerText.trim() !== p.want) return 'text mismatch';
  th.querySelector('#submit-button button, #submit-button').click();
  for (let k = 0; k < 30; k++) { await sleep(400); const t = mine(); if ((t?.querySelector('#content-text')?.innerText || '').trim() === p.want) return 'updated ' + (window.__osbIsPinned() ? 'pinned' : 'NOT pinned'); }
  return 'saved? text not confirmed';
};

window.__osbIsPinned = () => !!(mine()?.querySelector('#pinned-comment-badge')?.innerText || '').trim();
window.__osbCommentCheck = async L => { const p = await pinned(L); return { pinned: window.__osbIsPinned(), text: (mine()?.querySelector('#content-text')?.innerText || '').trim() === p.want }; };
