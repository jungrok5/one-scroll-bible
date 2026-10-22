// Paste-in helpers for scheduling the Shorts in YouTube Studio (Claude in Chrome's javascript tool, on any studio page).
// Same setup as studio-upload.js: the local file server on 127.0.0.1:8765 serves motion/ (videos from motion/out/release).
// Studio rejects eval (Trusted Types), so paste the code itself; the tool times out after 45 s, so start a chain without
// awaiting it and read window.__shortLog. Never reload the page mid-chain: it drops these functions and __shortIds.
//
// Lessons (2026-10-22):
// - The schedule TIME box only commits a value PICKED FROM ITS LIST — typing "오전 8:00" shows it but saves 0:00.
// - The schedule DATE box lives in a popup outside the upload dialog: open #datepicker-trigger, then type into it.
// - The language dropdown sometimes ignores the first click: retry until the label reads the language.
// - "관련 동영상" (the Short's related video) is only on the edit page, not in the upload dialog → second pass per Short.
// - The edit page reached by pushState can be half-rendered: wait for #save and the visibility button, else re-navigate.
//
//   window.__shortIds = {}; then e.g.
//   (async () => { for (let n = 1; n <= 21; n++) window.__shortLog.push(await __osbShort('en', n, '2026. 10. 24.', '오전 8:00')); })()

window.__pickTime = async (scope, time) => {   // the time box only commits a value picked from its list
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const pk = [...scope.querySelectorAll('ytcp-datetime-picker')].find(p => p.offsetParent); const ti = pk.querySelector('input');
  ti.click(); ti.focus(); await sleep(700);
  let it = [...document.querySelectorAll('tp-yt-paper-item')].filter(i => i.offsetParent).find(i => i.innerText.trim() === time);
  if (!it) { pk.querySelector('tp-yt-paper-input, #input-container, .container')?.click(); await sleep(700); it = [...document.querySelectorAll('tp-yt-paper-item')].filter(i => i.offsetParent).find(i => i.innerText.trim() === time); }
  it?.click(); await sleep(600); return ti.value;
};

window.__osbFix = async (id, L, time) => {   // a scheduled Short: optionally fix its time, link the language's film as related video, save
  const sleep = ms => new Promise(r => setTimeout(r, ms)); const wait = async (fn, ms = 20000) => { for (let t = 0; t < ms; t += 250) { const v = fn(); if (v) return v; await sleep(250); } return null; };
  const m = window.__man || (window.__man = await (await fetch('http://127.0.0.1:8765/youtube/manifest.json')).json());
  const ready = () => location.pathname.includes(id) && document.querySelector('ytcp-button#save') && document.querySelector('[aria-label="동영상 공개 상태 수정"]') && document.querySelector('#textbox');
  for (let a = 0; a < 3 && !ready(); a++) {
    [...document.querySelectorAll('ytcp-button, button')].filter(x => x.offsetParent && x.innerText?.trim() === '닫기').forEach(x => x.click());
    history.pushState({}, '', `/channel/UCtCcbrM2mCgfhSryo4SWxzg/videos/short`); dispatchEvent(new PopStateEvent('popstate', { state: {} })); await sleep(1500);
    history.pushState({}, '', `/video/${id}/edit`); dispatchEvent(new PopStateEvent('popstate', { state: {} })); await wait(ready, 12000); }
  if (!ready()) return { id, L, error: 'edit page did not load' };
  await sleep(2500);
  const r = { id, L };
  if (time) { document.querySelector('[aria-label="동영상 공개 상태 수정"]').click(); await sleep(1500);
    r.time = await window.__pickTime(document, time);
    [...document.querySelectorAll('ytcp-button, button')].filter(b => b.offsetParent && b.innerText.trim() === '완료').at(-1)?.click(); await sleep(1200); }
  const side = () => document.querySelector('ytcp-video-metadata-editor-sidepanel, #side-panel')?.innerText || '';
  const already = side().includes(m.languages[L].film.title.slice(0, 18));
  const rel = [...document.querySelectorAll('button, ytcp-button, [role=button]')].find(b => b.offsetParent && (b.getAttribute('aria-label') || b.innerText || '').trim().startsWith('관련 동영상'));
  if (!already && rel) { rel.click();
    const card = await wait(() => [...document.querySelectorAll('ytcp-dialog *, tp-yt-paper-dialog *')].filter(e => e.offsetParent && e.children.length === 0).find(e => e.textContent.trim().startsWith(m.languages[L].film.title.slice(0, 18))), 10000);
    card?.click(); await sleep(1500); r.related = !!card; } else r.related = already ? 'already' : 'no button';
  const s = document.querySelector('ytcp-button#save'); if (s && !s.hasAttribute('disabled')) { s.click(); r.saved = !!(await wait(() => s.hasAttribute('disabled'), 20000)); } else r.saved = 'nothing to save';
  await sleep(1500); return r;
};

window.__osbShort = async (L, n, date, time) => {   // upload Short n of language L, scheduled at date ("2026. 10. 24.") + time ("오전 8:00", local time zone)
  const S = 'http://127.0.0.1:8765/', sleep = ms => new Promise(r => setTimeout(r, ms));
  const LANG_LABEL = { en: '영어', es: '스페인어', 'pt-BR': '포르투갈어(브라질)', fr: '프랑스어', de: '독일어', ru: '러시아어', id: '인도네시아어', 'zh-Hans': '중국어(간체)', 'zh-Hant': '중국어(번체)', ja: '일본어', ar: '아랍어', ko: '한국어' };
  const wait = async (fn, ms = 20000) => { for (let t = 0; t < ms; t += 250) { const v = fn(); if (v) return v; await sleep(250); } return null; };
  const closeNotice = () => [...document.querySelectorAll('ytcp-button, button')].filter(x => x.offsetParent && x.innerText?.trim() === '닫기').forEach(x => x.click());
  let fileInput = null;
  for (let a = 0; a < 3 && !fileInput; a++) { closeNotice(); await sleep(500);
    history.pushState({}, '', '/channel/UCtCcbrM2mCgfhSryo4SWxzg/videos/upload?d=ud'); dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    fileInput = await wait(() => document.querySelector('ytcp-uploads-dialog input[type=file]'), 8000); }
  if (!fileInput) return { L, n, error: 'no upload dialog' };
  const m = window.__man || (window.__man = await (await fetch(S + 'youtube/manifest.json')).json()); const f = m.languages[L].shorts[n - 1];
  const b = await (await fetch(S + 'out/release/' + f.file)).blob(); const dt = new DataTransfer(); dt.items.add(new File([b], f.file, { type: 'video/mp4' }));
  fileInput.files = dt.files; fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  const D = await wait(() => document.querySelectorAll('ytcp-uploads-dialog #textbox').length >= 2 && document.querySelector('ytcp-uploads-dialog'));
  if (!D) return { L, n, error: 'details did not open' };
  await sleep(1500);
  const put = (el, t) => { el.focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, t); el.dispatchEvent(new Event('input', { bubbles: true })); };
  const [title, desc] = D.querySelectorAll('#textbox'); put(title, f.title); await sleep(300); put(desc, f.description);
  D.querySelector('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').click();
  D.querySelector('#toggle-button').click(); await sleep(1200);
  D.querySelector('[name=VIDEO_HAS_ALTERED_CONTENT_NO]').click(); D.querySelector('[name=VIDEO_PAID_PRODUCT_PLACEMENT_NO]').click();
  const ti = D.querySelector('ytcp-chip-bar input#text-input'); ti.focus();
  for (const t of f.tags) { ti.value = t; ti.dispatchEvent(new Event('input', { bubbles: true })); ti.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })); await sleep(100); }
  const count = () => +(D.innerText.match(/(\d+)\/500/) || [])[1];
  for (let k = 0; count() > 480 && k < 15; k++) { [...D.querySelectorAll('ytcp-chip')].pop().querySelector('#delete-icon, tp-yt-iron-icon, yt-icon')?.click(); await sleep(200); }
  const notify = [...D.querySelectorAll('ytcp-checkbox-lit')].find(e => e.innerText.includes('구독 피드에 게시'));
  const nbox = notify?.querySelector('[role=checkbox]') || notify; if (L !== 'ko' && nbox?.getAttribute('aria-checked') === 'true') { nbox.click(); await sleep(300); }
  const langNow = () => (D.innerText.match(/동영상 언어\s*\n\s*(.+)/) || [])[1];
  for (let a = 0; a < 3 && langNow() !== LANG_LABEL[L]; a++) { document.body.click(); await sleep(300);
    D.querySelector('#language-input ytcp-dropdown-trigger, ytcp-form-language-input ytcp-dropdown-trigger')?.click(); await sleep(1200);
    [...document.querySelectorAll('tp-yt-paper-item')].find(e => e.innerText.trim() === LANG_LABEL[L])?.click(); await sleep(900); }
  const r = { L, n, language: langNow(), notify: nbox?.getAttribute('aria-checked'), ai: D.querySelector('[name=VIDEO_HAS_ALTERED_CONTENT_NO]').getAttribute('aria-checked') };
  for (let i = 0; i < 3; i++) { D.querySelector('#next-button').click(); await sleep(1500); }
  if (!D.querySelector('ytcp-datetime-picker')?.offsetParent) { D.querySelector('#second-container')?.click(); await sleep(1200); }
  const setIn = async (i, v) => { i.focus(); i.select(); document.execCommand('insertText', false, v); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); await sleep(700); };
  const vis = () => [...document.querySelectorAll('input')].filter(i => i.offsetParent);
  let di = vis().find(i => /^\d{4}\. \d/.test(i.value)); if (!di) { D.querySelector('#datepicker-trigger')?.click(); await sleep(800); di = await wait(() => vis().find(i => /^\d{4}\. \d/.test(i.value)), 5000); }
  if (!di) return { ...r, error: 'no date input' };
  await setIn(di, date); document.body.click(); await sleep(500);
  r.time = await window.__pickTime(D, time); document.body.click(); await sleep(400);
  r.when = (D.querySelector('ytcp-datetime-picker #datepicker-trigger')?.innerText.trim() || '') + ' ' + r.time;
  if (r.when !== `${date} ${time}` || r.language !== LANG_LABEL[L] || r.notify === 'true' || r.ai !== 'true') return { ...r, error: 'check failed' };
  await wait(() => /업로드 완료|처리|검사/.test(D.querySelector('ytcp-video-upload-progress')?.innerText || ''), 300000);
  r.url = [...D.querySelectorAll('a')].map(a => a.href).find(h => /youtube\.com\/shorts\/|youtu\.be\//.test(h));
  const done = D.querySelector('#done-button'); r.button = done.innerText.trim(); if (r.button !== '예약') return { ...r, error: 'not a schedule button' };
  done.click(); await sleep(3500); closeNotice(); await sleep(800);
  r.id = r.url?.split('/').pop(); (window.__shortIds[L] ||= {})[n] = r.id;
  const fx = await window.__osbFix(r.id, L, null); r.related = fx.related; r.fixError = fx.error; r.saved = true;
  return r;
};
