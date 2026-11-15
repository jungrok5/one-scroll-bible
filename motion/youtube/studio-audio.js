// Paste-in helper for YouTube Studio: add a dubbed AUDIO TRACK (multi-language audio) to a video in one language — the
// international film's es / pt-BR narration (motion/out/<film>-<lang>-narr.mp3, films README §4; motion/films/intl.mjs prints the files).
// Load into studio.youtube.com/video/<id>/translations (paste the code — Studio's CSP blocks eval), then start without awaiting:
//   window.__audRes = null; __osbAudio([['es', 'out/christ-es-narr.mp3'], ['pt-BR', 'out/christ-pt-BR-narr.mp3']]).then(r => window.__audRes = r)
// Files come from the local server (node motion/youtube/serve.mjs serves motion/).
//
// WHERE THE AUDIO TRACK LIVES (2026-11-16, found after a long search — keep this):
// - Only on the "언어" page, whose list has the columns 언어 · 오디오 · 자막 · 제목 및 설명 · 썸네일 (page title "언어 - YouTube Studio").
//   Row click → language dialog → the 오디오/더빙 row → "추가" → ytgn-audio-upload-dialog input#audio-file-loader → 게시 → 업데이트.
// - If the page is titled "동영상 자막" and the list has only 자막 · 제목 및 설명, the CHANNEL has no multi-language audio: it needs
//   "고급 기능" — Studio → 설정 → 채널 → 기능 사용 자격: 2. 중급 기능 (phone verification) and 3. 고급 기능 (video verification, a valid ID,
//   or channel history). Only the channel OWNER can verify (and never an agent — it involves codes/ID). The international channel
//   @bibleinonescroll was in this state on 2026-11-16 (both tiers ⚠, 거주 국가 unset) although 「침묵의 400년」 got its tracks on 2026-11-01.
//   This helper checks that first and says so instead of failing somewhere in the middle.
// - An automatic dub in the same language must be deleted before our own track can be added.
// Untested end to end on 2026-11-16 (the channel lacked the feature) — the dialog steps follow the 2026-11-01 record (motion/README.md
// "유튜브에 올리기" 10); fix the selectors here the first time it runs and note the date.
window.__osbAudio = async list => {
  const S = 'http://127.0.0.1:8765/', sleep = ms => new Promise(r => setTimeout(r, ms));
  const wait = async (fn, ms = 15000) => { for (let t = 0; t < ms; t += 250) { const v = fn(); if (v) return v; await sleep(250); } return null; };
  const vis = e => e && e.offsetParent !== null, txt = e => (e?.innerText || '').trim();
  const LABEL = { es: '스페인어', 'pt-BR': '포르투갈어(브라질)', en: '영어', fr: '프랑스어', de: '독일어', ja: '일본어', 'zh-Hans': '중국어(간체)', 'zh-Hant': '중국어(번체)', ko: '한국어' };
  await wait(() => document.querySelector('ytgn-video-translation-row'), 20000);
  const heads = txt(document.querySelector('ytgn-video-translations-list'));
  if (!/오디오/.test(heads.split('\n').slice(0, 8).join(' '))) return [{ error: 'no 오디오 column — this channel has no multi-language audio. Owner: Studio → 설정 → 채널 → 기능 사용 자격 → 중급(전화 인증) + 고급(영상 인증·신분증·채널 기록)', page: document.title }];
  if (!window.__osbClickPatched) { const orig = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () { if (this.type === 'file') { window.__lastFileInput = this; return; } return orig.call(this); }; window.__osbClickPatched = true; }
  const out = [];
  for (const [L, path] of list) {
    const r = { L };
    try {
      const label = LABEL[L]; if (!label) { r.error = 'no Studio label'; out.push(r); continue; }
      let row = [...document.querySelectorAll('ytgn-video-translation-row')].find(x => txt(x).startsWith(label));
      if (!row) { [...document.querySelectorAll('ytcp-button, button')].find(b => vis(b) && txt(b) === '언어 추가')?.click(); await sleep(800);
        (await wait(() => [...document.querySelectorAll('tp-yt-paper-item, [role=option]')].find(e => txt(e) === label)))?.click();
        row = await wait(() => [...document.querySelectorAll('ytgn-video-translation-row')].find(x => txt(x).startsWith(label))); }
      if (!row) { r.error = 'language row missing'; out.push(r); continue; }
      row.click();
      const dlg = await wait(() => [...document.querySelectorAll('ytgn-language-dialog')].find(vis), 6000);
      if (!dlg) { r.error = 'language dialog did not open'; out.push(r); continue; }
      await sleep(800);
      const aRow = [...dlg.querySelectorAll('*')].filter(e => /^(오디오|더빙)/.test(txt(e)) && e.querySelector('ytcp-button, button')).sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length)[0];
      const add = aRow && [...aRow.querySelectorAll('ytcp-button, button')].find(b => txt(b) === '추가');
      if (!add) { r.error = 'no "추가" on the audio row (a track — or an automatic dub to delete first — may exist): ' + txt(aRow).slice(0, 60); out.push(r); continue; }
      add.click();
      const inp = await wait(() => document.querySelector('ytgn-audio-upload-dialog input#audio-file-loader, ytgn-audio-upload-dialog input[type=file]'), 10000);
      if (!inp) { r.error = 'audio upload dialog did not open'; out.push(r); continue; }
      const b = await (await fetch(S + path, { cache: 'no-store' })).blob(), dt = new DataTransfer();
      dt.items.add(new File([b], path.split('/').pop(), { type: 'audio/mpeg' })); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true }));
      const pub = await wait(() => [...document.querySelectorAll('ytgn-audio-upload-dialog ytcp-button, ytgn-language-dialog ytcp-button')].find(x => vis(x) && txt(x) === '게시' && x.getAttribute('aria-disabled') !== 'true'), 120000);
      if (!pub) { r.error = 'no enabled 게시 (file still uploading or rejected — length must match the video)'; out.push(r); continue; }
      pub.click(); await sleep(2000);
      const upd = await wait(() => [...document.querySelectorAll('ytcp-button, button')].find(x => vis(x) && txt(x) === '업데이트' && x.getAttribute('aria-disabled') !== 'true'), 8000);
      if (upd) { upd.click(); await sleep(2000); }
      r.published = !!(await wait(() => /오디오|더빙/.test(txt(row)) && /게시/.test(txt(row)), 20000)) || 'check the row';
    } catch (e) { r.error = String(e); }
    out.push(r); await sleep(1500);
  }
  return out;
};
