// Paste-in helper for YouTube Studio: set a Short's "관련 동영상" (only on the edit page — the API can't) to its language's
// film, on whichever channel the Studio page is on (studio-shorts.js __osbFix is the Korean-channel original).
// Needs the local file server (node motion/youtube/serve.mjs) for manifest.json + uploaded.json.
//   paste, then start without awaiting:  window.__relLog = []; __osbRelatedAll(['zh-Hans','zh-Hant','ja','ar'])
//   read window.__relLog later. Each entry: { L, nn, id, related: true | 'already' | false, saved }.
// The film is found in the picker by the first 18 characters of manifest.languages[L].film.title (the international
// channel's film has that title). A brand-new upload may not be in the picker for a day (index lag, 2026-11-01):
// then related = false — run it again the next day; 'already' entries are skipped quickly.
window.__osbRelated = async (L, id) => {
  const S = 'http://127.0.0.1:8765/', sleep = ms => new Promise(r => setTimeout(r, ms));
  const wait = async (fn, ms = 20000) => { for (let t = 0; t < ms; t += 250) { const v = fn(); if (v) return v; await sleep(250); } return null; };
  const CH = location.pathname.match(/\/channel\/([\w-]+)/)?.[1] || window.__osbCh; if (CH) window.__osbCh = CH;
  const m = window.__man || (window.__man = await (await fetch(S + 'youtube/manifest.json', { cache: 'no-store' })).json());
  const title = m.languages[L].film.title.slice(0, 18);
  const ready = () => location.pathname.includes(id) && document.querySelector('ytcp-button#save') && document.querySelector('#textbox');
  for (let a = 0; a < 3 && !ready(); a++) {
    [...document.querySelectorAll('ytcp-button, button')].filter(x => x.offsetParent && x.innerText?.trim() === '닫기').forEach(x => x.click());
    history.pushState({}, '', `/channel/${window.__osbCh}/videos/short`); dispatchEvent(new PopStateEvent('popstate', { state: {} })); await sleep(1500);
    history.pushState({}, '', `/video/${id}/edit`); dispatchEvent(new PopStateEvent('popstate', { state: {} })); await wait(ready, 12000); }
  if (!ready()) return { L, id, error: 'edit page did not load' };
  await sleep(2500);
  const side = () => document.querySelector('ytcp-video-metadata-editor-sidepanel, #side-panel')?.innerText || '';
  const r = { L, id }, already = side().includes(title);
  const rel = [...document.querySelectorAll('button, ytcp-button, [role=button]')].find(b => b.offsetParent && (b.getAttribute('aria-label') || b.innerText || '').trim().startsWith('관련 동영상'));
  if (!already && rel) { rel.click();
    const card = await wait(() => [...document.querySelectorAll('ytcp-dialog *, tp-yt-paper-dialog *')].filter(e => e.offsetParent && e.children.length === 0).find(e => e.textContent.trim().startsWith(title)), 10000);
    if (card) { card.click(); await sleep(1500); } else [...document.querySelectorAll('ytcp-dialog #close-button, tp-yt-paper-dialog [aria-label=닫기]')].forEach(x => x.click());
    r.related = !!card; } else r.related = already ? 'already' : 'no button';
  const s = document.querySelector('ytcp-button#save'); if (s && !s.hasAttribute('disabled')) { s.click(); r.saved = !!(await wait(() => s.hasAttribute('disabled'), 20000)); } else r.saved = 'nothing to save';
  await sleep(1200); return r;
};
// every recorded Short of these languages (uploaded.json global.shorts[L].ids; korean: true → uploaded.json shorts[L].ids)
window.__osbRelatedAll = async (langs, { korean = false } = {}) => {
  window.__relLog ||= [];
  const up = await (await fetch('http://127.0.0.1:8765/youtube/uploaded.json', { cache: 'no-store' })).json();
  for (const L of langs) for (const [nn, id] of Object.entries((korean ? up.shorts : up.global.shorts)[L]?.ids || {}).sort()) {
    let r; try { r = await window.__osbRelated(L, id); } catch (e) { r = { L, id, error: e.message }; }
    window.__relLog.push({ nn, ...r }); }
  window.__relLog.push('END');
};
'studio-related.js loaded';
