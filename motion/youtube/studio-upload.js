// Paste-in helper for YouTube Studio (run in the upload dialog page, e.g. through Claude in Chrome's javascript tool):
// uploads one language's film as a PRIVATE video with everything from motion/youtube/manifest.json filled in.
// Needs the local file server (motion/out/release + motion/youtube served on http://127.0.0.1:8765, CORS for Studio).
//   open https://studio.youtube.com/channel/<id>/videos/upload?d=ud, then: await __osbUpload('de')
// The javascript tool times out after 45 s, so start it without awaiting and read window.__osbResult later.
// Returns a check list; nothing is published — the final "저장" saves it as 비공개 (private).
window.__osbUpload = async (L, { save = true } = {}) => {
  const S = 'http://127.0.0.1:8765/', sleep = ms => new Promise(r => setTimeout(r, ms));
  const LANG_LABEL = { en: '영어', es: '스페인어', 'pt-BR': '포르투갈어(브라질)', fr: '프랑스어', de: '독일어', ru: '러시아어', id: '인도네시아어',
    'zh-Hans': '중국어(간체)', 'zh-Hant': '중국어(번체)', ja: '일본어', ar: '아랍어', ko: '한국어' };
  const wait = async (fn, ms = 20000) => { for (let t = 0; t < ms; t += 250) { const v = fn(); if (v) return v; await sleep(250); } return null; };
  const m = await (await fetch(S + 'youtube/manifest.json')).json(); const f = m.languages[L].film;
  const fileInput = await wait(() => document.querySelector('ytcp-uploads-dialog input[type=file]'));
  const blob = async (p, name, type) => { const b = await (await fetch(S + p)).blob(); const dt = new DataTransfer(); dt.items.add(new File([b], name, { type })); return dt.files; };
  fileInput.files = await blob('out/release/' + f.file, f.file, 'video/mp4'); fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  const D = await wait(() => document.querySelectorAll('ytcp-uploads-dialog #textbox').length >= 2 && document.querySelector('ytcp-uploads-dialog'));
  await sleep(1500);
  const put = (el, t) => { el.focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, t); el.dispatchEvent(new Event('input', { bubbles: true })); };
  const [title, desc] = D.querySelectorAll('#textbox'); put(title, f.title); await sleep(300); put(desc, f.description);
  const thumb = D.querySelector('input#file-loader'); thumb.files = await blob(f.thumbnail.replace(/^motion\//, ''), L + '-A.jpg', 'image/jpeg'); thumb.dispatchEvent(new Event('change', { bubbles: true }));
  D.querySelector('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').click();
  D.querySelector('#toggle-button').click(); await sleep(1200);
  D.querySelector('[name=VIDEO_HAS_ALTERED_CONTENT_NO]').click(); D.querySelector('[name=VIDEO_PAID_PRODUCT_PLACEMENT_NO]').click();   // by name: the label text is not in innerText
  // tags: one chip each, then drop from the end until YouTube's own counter is under 500
  const ti = D.querySelector('ytcp-chip-bar input#text-input'); ti.focus();
  for (const t of f.tags) { ti.value = t; ti.dispatchEvent(new Event('input', { bubbles: true })); ti.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })); await sleep(120); }
  const count = () => +(D.innerText.match(/(\d+)\/500/) || [])[1];
  for (let n = 0; count() > 480 && n < 15; n++) { const c = [...D.querySelectorAll('ytcp-chip')].pop(); c.querySelector('#delete-icon, tp-yt-iron-icon, yt-icon')?.click(); await sleep(200); }
  // notifications off (every non-Korean version)
  const notify = [...D.querySelectorAll('ytcp-checkbox-lit')].find(e => e.innerText.includes('구독 피드에 게시'));
  const nbox = notify?.querySelector('[role=checkbox]') || notify; if (L !== 'ko' && nbox?.getAttribute('aria-checked') === 'true') { nbox.click(); await sleep(300); }
  // video language
  D.querySelector('#language-input ytcp-dropdown-trigger, ytcp-form-language-input ytcp-dropdown-trigger')?.click(); await sleep(900);
  [...document.querySelectorAll('tp-yt-paper-item')].find(e => e.innerText.trim() === LANG_LABEL[L])?.click(); await sleep(700);
  const checks = { L, title: title.innerText.slice(0, 50), desc: desc.innerText.length, tags: count(), language: (D.innerText.match(/동영상 언어\s*\n\s*(.+)/) || [])[1],
    notify: nbox?.getAttribute('aria-checked'), ai: D.querySelector('[name=VIDEO_HAS_ALTERED_CONTENT_NO]').getAttribute('aria-checked'), kids: D.querySelector('[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').getAttribute('aria-checked') };
  for (let i = 0; i < 3; i++) { D.querySelector('#next-button').click(); await sleep(1500); }
  D.querySelector('tp-yt-paper-radio-button[name="PRIVATE"]').click(); await sleep(500);
  checks.private = D.querySelector('tp-yt-paper-radio-button[name="PRIVATE"]').getAttribute('aria-checked');
  await wait(() => /업로드 완료|처리/.test(D.querySelector('ytcp-video-upload-progress')?.innerText || ''), 600000);
  checks.url = [...D.querySelectorAll('a')].map(a => a.href).find(h => /youtu\.be\//.test(h));
  if (save && checks.private === 'true' && checks.notify !== 'true' && checks.ai === 'true' && checks.language === LANG_LABEL[L]) {
    D.querySelector('#done-button').click(); await sleep(3000);
    [...document.querySelectorAll('ytcp-button, button')].find(b => b.innerText?.trim() === '닫기' && b.offsetParent)?.click();
    checks.saved = true;
  }
  checks.done = true; window.__osbResult = checks; return checks;
};
// Several languages in a row without reloading (a reload drops __osbUpload): reopen the upload dialog through the SPA router.
window.__osbChain = async langs => { const sleep = ms => new Promise(r => setTimeout(r, ms)); window.__osbLog = [];
  for (const L of langs) {
    if (!document.querySelector('ytcp-uploads-dialog input[type=file]')) { history.pushState({}, '', location.pathname + '?d=ud'); dispatchEvent(new PopStateEvent('popstate', { state: {} })); await sleep(3000); }
    let r; try { r = await window.__osbUpload(L); } catch (e) { r = { L, error: e.message }; }
    window.__osbLog.push(r); if (!r.saved) break; await sleep(2500);
  } window.__osbLog.push('END'); };
