// Paste-in helper for a film's WATCH page (youtube.com/watch?v=<id>, signed in as the channel @one-scroll-bible) — posts or
// updates the channel's pinned comment from motion/youtube/manifest.json (film.pinned = the site's faq.h + the language's
// home page #faq, tagged utm_content=pinned). Needs the local file server (motion/ on http://127.0.0.1:8765, see
// studio-upload.js). It is a public post in the channel's name: show the text to the user and get a yes first.
//
//   window.__cr = null; __osbComment('en').then(r => window.__cr = r);   // then read window.__cr
//
// Results: 'unchanged' · 'updated' (edited in place, stays pinned) · 'confirm-pin' (posted and the pin dialog is open —
// the dialog's 고정/Pin button only reacts to a REAL click: find it with the find tool and click its ref, then check
// '#pinned-comment-badge') · an error string. Lessons (2026-10-23): JS .click() on the confirm button does nothing;
// execCommand('insertText') + insertLineBreak into #contenteditable-root types reliably; always fetch the manifest fresh.

window.__osbComment = async (L) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const m = await (await fetch('http://127.0.0.1:8765/youtube/manifest.json', { cache: 'no-store' })).json();
  const p = m.languages[L]?.film?.pinned;
  if (!p?.text || !/^https:\/\/one-scroll-bible\.com\/\S*#faq$/.test(p.link || '')) return 'manifest has no pinned text/link — run node motion/youtube/manifest.mjs';
  const want = p.text + '\n' + p.link;
  document.querySelector('video')?.pause();
  for (let k = 0; k < 30 && !document.querySelector('#simplebox-placeholder'); k++) { window.scrollBy(0, 400); await sleep(400); }
  if (!document.querySelector('#simplebox-placeholder')) return 'comments did not load (comments off?)';
  for (let k = 0; k < 10 && !document.querySelector('ytd-comment-thread-renderer'); k++) await sleep(400);
  const mine = () => [...document.querySelectorAll('ytd-comment-thread-renderer')].find(t => /one-scroll-bible/.test(t.querySelector('#author-text')?.innerText || ''));
  const typeInto = async ed => { ed.focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, p.text); document.execCommand('insertLineBreak'); document.execCommand('insertText', false, p.link); ed.dispatchEvent(new Event('input', { bubbles: true })); await sleep(600); return ed.innerText.trim() === want; };
  const menuItem = re => [...document.querySelectorAll('ytd-menu-service-item-renderer, tp-yt-paper-item')].find(e => e.offsetParent && re.test(e.innerText.trim()));
  let th = mine();
  if (th) {
    const cur = (th.querySelector('#content-text')?.innerText || '').trim();
    if (cur === want) return 'unchanged';
    th.scrollIntoView({ block: 'center' }); await sleep(400);
    th.querySelector('#action-menu button').click(); await sleep(800);
    const edit = menuItem(/^(수정|Edit)$/); if (!edit) return 'no edit item';
    edit.click(); await sleep(1000);
    const ed = th.querySelector('#contenteditable-root'); if (!ed) return 'no inline editor';
    if (!await typeInto(ed)) return 'edit text mismatch';
    const save = th.querySelector('#submit-button button, #submit-button'); if (!save) return 'no save button';
    save.click();
    for (let k = 0; k < 30; k++) { await sleep(400); if ((mine()?.querySelector('#content-text')?.innerText || '').trim() === want) return 'updated'; }
    return 'saved? text not confirmed';
  }
  const ph = document.querySelector('#simplebox-placeholder'); ph.scrollIntoView({ block: 'center' }); ph.click(); await sleep(800);
  const ed = document.querySelector('#contenteditable-root'); if (!ed) return 'no editor';
  if (!await typeInto(ed)) return 'text mismatch';
  document.querySelector('#submit-button button, #submit-button').click();
  for (let k = 0; k < 40 && !(th = mine()); k++) await sleep(300);
  if (!th) return 'posted? thread not found';
  th.scrollIntoView({ block: 'center' }); await sleep(500);
  th.querySelector('#action-menu button').click(); await sleep(900);
  const pin = menuItem(/^(고정|Pin)$/); if (!pin) return 'no pin item';
  pin.click(); await sleep(900);
  return [...document.querySelectorAll('yt-confirm-dialog-renderer')].some(e => e.offsetParent) ? 'confirm-pin' : 'no pin dialog';
};
