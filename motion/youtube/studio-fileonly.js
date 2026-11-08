// Paste-in helper for YouTube Studio: upload Shorts as FILE ONLY (no form) to whichever channel the Studio page is on —
// the international channel's waves (uploaded.json _shorts_note). The API then does the rest:
//   1. node motion/youtube/serve.mjs                     (serves motion/ on 127.0.0.1:8765)
//   2. Chrome that is signed into the channel accounts → studio.youtube.com/channel/<id>/videos/upload?d=ud
//      paste this file, then start without awaiting (the javascript tool times out after 45 s):
//        window.__foLog = []; __osbFileOnlyWave(['zh-Hans','zh-Hant','ja','ar'])     → read window.__foLog later
//        (or __osbFileOnlyWave(null, [['ja', 4], ['ar', 7]]) to redo some)
//   3. node motion/youtube/global-move.mjs record-from-files <L…>     (ids by file name; duplicates are reported)
//   4. node motion/youtube/global-move.mjs schedule-shorts <L> <first day> <HH:MM> <+HH:MM> --wave="wave 3"
//   5. node motion/youtube/global-move.mjs playlist-shorts <L…>        (50 units each — the next day if quota is short)
//   6. related video (edit page only): paste studio-related.js → __osbRelatedAll([...])
// Files: motion/out/release-open/<manifest shorts[n].file> (the new opening, shorts-retrim.mjs); falls back to out/release/.
//
// Lessons (2026-11-08 — the first version "finished" 100 Shorts in 15 min and YouTube had 6):
// - While uploading, the progress line already says "동영상이 업로드된 후 처리가 시작됨", so matching 처리 closed the dialog
//   at 33 % and cancelled the upload. Done = the line no longer says "업로드 중" and says 업로드 완료 / 처리 / 검사.
// - A dialog left open keeps its hidden file input: setting a new file on it does nothing, so every next Short "uploaded"
//   in 2 s. Each Short now starts from a closed dialog, and the title box must show THIS file's name (Studio fills it from
//   the file name, "-" → " ") before it counts.
// - The dialog's youtu.be link is often missing or the previous one; ids come from record-from-files, not from here.
// - DAILY UPLOAD LIMIT ≈ 100 per channel per 24 h (2026-11-08: after 101 uploads the dialog still said 업로드 완료, but
//   nothing more was saved — 67 Shorts lost silently). Upload at most ~4 languages (84) a day, and run
//   record-from-files after each language: a language that records fewer than 21 = stop and continue tomorrow.
// - Keep the Studio tab IN FRONT: a background tab's timers are throttled (one Short per ~3 min instead of ~15 s). A
//   screenshot of the tab brings it forward.
// - Never reload mid-chain (it drops these functions). To stop a chain: window.__foStop = true.
window.__osbFileOnly = async (L, n) => {
  const S = 'http://127.0.0.1:8765/', sleep = ms => new Promise(r => setTimeout(r, ms));
  const wait = async (fn, ms = 20000) => { for (let t = 0; t < ms; t += 500) { const v = fn(); if (v) return v; await sleep(500); } return null; };
  const dlg = () => document.querySelector('ytcp-uploads-dialog'), open = () => !!dlg()?.offsetParent;
  const close = async () => { for (let a = 0; a < 5 && open(); a++) { dlg().querySelector('#close-button, [id$="close-button"]')?.click(); await sleep(2000);   // closing can take several seconds
    [...document.querySelectorAll('ytcp-button, button')].find(x => x.offsetParent && /^(닫기|저장하지 않고 닫기|확인)$/.test(x.innerText?.trim() || ''))?.click(); await wait(() => !open(), 6000); } return !open(); };
  const m = window.__man || (window.__man = await (await fetch(S + 'youtube/manifest.json', { cache: 'no-store' })).json());
  const f = m.languages[L]?.shorts?.[n - 1]; if (!f?.file) return { L, n, error: 'no manifest entry' };
  const name = f.file.replace(/\.mp4$/, '').replace(/-/g, ' ');
  if (!(await close())) return { L, n, error: 'a dialog would not close' };
  const base = location.pathname.replace(/\/videos.*$/, '/videos/upload');
  for (let a = 0; a < 3 && !open(); a++) {
    history.pushState({}, '', base.replace('/upload', '')); dispatchEvent(new PopStateEvent('popstate', { state: {} })); await sleep(1500);
    history.pushState({}, '', base + '?d=ud'); dispatchEvent(new PopStateEvent('popstate', { state: {} })); await wait(open, 8000); }
  const inp = open() && dlg().querySelector('input[type=file]'); if (!inp) return { L, n, error: 'no fresh upload dialog' };
  if (dlg().querySelector('#textbox')?.offsetParent) return { L, n, error: 'dialog is not on the file picker' };
  let r = await fetch(S + 'out/release-open/' + f.file); if (!r.ok) r = await fetch(S + 'out/release/' + f.file);
  const b = await r.blob(); if (b.size < 1e6) return { L, n, error: 'file fetch failed ' + b.size };
  const dt = new DataTransfer(); dt.items.add(new File([b], f.file, { type: 'video/mp4' })); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true }));
  const titled = await wait(() => dlg()?.querySelector('#textbox')?.innerText?.trim() === name, 60000);
  if (!titled) { const t = dlg()?.innerText || ''; return { L, n, error: /한도|limit/i.test(t) ? 'daily upload limit' : 'title never showed this file' }; }
  const prog = () => (dlg()?.querySelector('ytcp-video-upload-progress')?.innerText || '').replace(/\s+/g, ' ');
  const done = await wait(() => { const p = prog(); return p && !/업로드 중/.test(p) && /업로드 완료|처리|검사/.test(p) && p; }, 900000);
  if (!done) return { L, n, error: 'upload did not finish: ' + prog().slice(0, 80) };
  await sleep(1000); const closed = await close();
  return { L, n, file: f.file, progress: done.slice(0, 40), closed };
};

// a whole wave, language by language, Short 1–21 (or `only`: [[L, n], …]); stops at the first error
window.__osbFileOnlyWave = async (langs, only = null) => {
  window.__foLog ||= []; window.__foStop = false;
  const jobs = only || langs.flatMap(L => Array.from({ length: 21 }, (_, i) => [L, i + 1]));
  for (const [L, n] of jobs) { if (window.__foStop) { window.__foLog.push('STOPPED'); return; }
    let r; for (let a = 0; a < 4; a++) {   // the local file server can drop a request (or die — restart serve.mjs): retry
      try { r = await window.__osbFileOnly(L, n); } catch (e) { r = { L, n, error: e.message }; }
      if (!/fetch/i.test(r.error || '')) break; await new Promise(x => setTimeout(x, 15000)); }
    window.__foLog.push(r); if (r.error) break; await new Promise(x => setTimeout(x, 1500)); }
  window.__foLog.push('END');
};
'studio-fileonly.js loaded';
