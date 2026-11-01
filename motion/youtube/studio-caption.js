// Paste-in helper for YouTube Studio: add one caption track (a timed .vtt/.srt) to a video in one language — through the Studio
// page, so it costs no Data API quota (captions.insert is 400 units each; 16 languages × 4 videos would take days).
// 2026-11-01: Studio accepts a file set by script once the file chooser is intercepted (the 2026-10-23 refusal no longer holds).
// Load into studio.youtube.com/video/<id>/translations (eval is blocked by Studio's CSP — inject as a nonce'd <script> through a
// Trusted Types policy), then: window.__osbCapResult = null; __osbCaption('de', 'films/silence400/sound/de.ko-timing.vtt')
// and read window.__osbCapResult (the javascript tool times out after 45 s). Files come from the local server (serve.mjs).
// A language whose row already shows a published caption is skipped. Nothing is published except that caption track.
window.__osbCaption = async (L, path, { publish = true } = {}) => {
  const S = 'http://127.0.0.1:8765/', sleep = ms => new Promise(r => setTimeout(r, ms));
  const LABEL = { 'zh-Hans': '중국어(간체)', 'zh-Hant': '중국어(번체)', ja: '일본어', fr: '프랑스어', de: '독일어', ru: '러시아어', ar: '아랍어',
    hi: '힌디어', id: '인도네시아어', vi: '베트남어', th: '태국어', tl: ['필리핀어', '타갈로그어'], bn: ['벵골어', '뱅골어'], sw: ['스와힐리어', '스와힐리'],
    fa: ['페르시아어', '페르시아어(이란)'], ta: '타밀어', it: '이탈리아어', pl: '폴란드어', tr: ['튀르키예어', '터키어'],
    uz: '우즈베크어', ne: '네팔어', km: '크메르어', mn: '몽골어', my: ['버마어', '미얀마어'], en: '영어', es: '스페인어', 'pt-BR': '포르투갈어(브라질)', ko: '한국어' };
  const labels = [].concat(LABEL[L] || []); if (!labels.length) return { L, error: 'no Studio label for ' + L };
  const wait = async (fn, ms = 15000) => { for (let t = 0; t < ms; t += 250) { const v = fn(); if (v) return v; await sleep(250); } return null; };
  const vis = e => e && e.offsetParent !== null;
  const txt = e => (e.innerText || '').trim();
  const byText = (sel, t, root = document) => [...root.querySelectorAll(sel)].find(e => vis(e) && txt(e) === t);
  if (!window.__osbClickPatched) { const orig = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () { if (this.type === 'file') { window.__lastFileInput = this; return; } return orig.call(this); }; window.__osbClickPatched = true; }
  // 1. the language's row (already published → skip), or add the language
  const row = [...document.querySelectorAll('ytgn-video-translation-row')].find(r => labels.some(l => txt(r).startsWith(l)));
  if (row && /개 게시됨/.test(txt(row))) return { L, skipped: 'already has a published caption' };
  if (row) row.click();
  else {
    const add = byText('ytcp-button, button', '언어 추가'); if (!add) return { L, error: 'no "add language" button' };
    add.click(); await sleep(800);
    const opt = await wait(() => [...document.querySelectorAll('tp-yt-paper-item, [role=option]')].find(e => labels.includes(txt(e))));
    if (!opt) return { L, error: 'language not in the picker: ' + labels.join('/') };
    opt.scrollIntoView(); opt.click();
  }
  const dlg = await wait(() => [...document.querySelectorAll('ytgn-language-dialog')].find(vis));
  if (!dlg) return { L, error: 'language dialog did not open' };
  await sleep(800);
  // 2. manual subtitles → add  (the row's last button)
  const capRow = [...dlg.querySelectorAll('*')].filter(e => /^수동 자막/.test(txt(e)) && e.querySelector('ytcp-button, button')).sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length)[0];
  const addBtn = capRow ? [...capRow.querySelectorAll('ytcp-button, button')].find(b => txt(b) === '추가') : null;
  if (!addBtn) return { L, error: 'no "add" for manual subtitles (a track may exist)' };
  addBtn.click();
  // 3. upload a file → with timing → continue
  const up = await wait(() => [...document.querySelectorAll('button#choose-upload-file')].find(vis));
  if (!up) return { L, error: 'caption editor did not open' };
  up.click(); await sleep(800);
  const cont = await wait(() => [...document.querySelectorAll('ytve-captions-editor-upload-dialog ytcp-button#confirm-button, ytcp-button#confirm-button.ytve-captions-editor-upload-dialog')].find(vis));
  if (!cont) return { L, error: 'no format dialog' };
  window.__lastFileInput = null; cont.click();
  const inp = await wait(() => window.__lastFileInput, 5000); if (!inp) return { L, error: 'file chooser not captured' };
  const b = await (await fetch(S + path, { cache: 'no-store' })).blob(), dt = new DataTransfer();
  dt.items.add(new File([b], path.split('/').pop(), { type: path.endsWith('.srt') ? 'application/x-subrip' : 'text/vtt' }));
  inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true }));
  await sleep(3500);
  if (!publish) return { L, loaded: true };
  const pub = await wait(() => [...document.querySelectorAll('ytcp-button#publish-button.ytve-captions-editor-modal, ytve-captions-editor-modal ytcp-button#publish-button')].find(e => vis(e) && e.getAttribute('aria-disabled') !== 'true'));
  if (!pub) return { L, error: 'no publish button' };
  pub.click();
  // published when the language row shows a published caption
  const ok = await wait(() => [...document.querySelectorAll('ytgn-video-translation-row')].some(r => labels.some(l => txt(r).startsWith(l)) && /개 게시됨/.test(txt(r))), 15000);
  return { L, published: !!ok };
};
// several in a row: await __osbCaptions([['fr', 'films/…/fr.ko-timing.vtt'], …]) → one result per language (stops at none; errors are reported)
window.__osbCaptions = async list => { const out = []; for (const [L, p] of list) { try { out.push(await window.__osbCaption(L, p)); } catch (e) { out.push({ L, error: String(e) }); }
  await new Promise(r => setTimeout(r, 1500)); } return out; };
