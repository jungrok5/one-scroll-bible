// Paste-in helper for YouTube Studio (Claude in Chrome's javascript tool) — tools/ANALYTICS-SETUP.md part B2:
// replace ONLY the site-link line of a video's description with the new manifest line (language home + UTM), keep every
// other line as it is in Studio (a video may have a hand-edited description), save, then read the video back and check
// that the description now has the new link and that a scheduled Short's time and related video did not change.
// Needs the local file server (motion/ on http://127.0.0.1:8765, see studio-upload.js). Start without awaiting (45 s tool
// limit) and read window.__descLog.
//   window.__descLog = []; (async () => { for (const [id, L, n] of [['IDvto63DZC8', 'en'], ['ZJKs9IpX2Cc', 'en', 1]]) window.__descLog.push(await __osbDescribe(id, L, n)); })()
//   n = Short number (1–21), omit for the landscape film.

window.__osbDescribe = async (id, L, n) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // always fetch fresh (no-store): a manifest cached in the tab from before `link` existed once wrote "…: undefined" into a
  // public description (2026-10-23, fixed within minutes)
  const m = await (await fetch('http://127.0.0.1:8765/youtube/manifest.json', { cache: 'no-store' })).json();
  const lang = await (await fetch(`http://127.0.0.1:8765/youtube/lang/${L}.json`, { cache: 'no-store' })).json();
  const item = n ? m.languages[L]?.shorts?.[n - 1] : m.languages[L]?.film;
  const label = n ? lang.short_tail : lang.watch;
  if (!/^https:\/\/one-scroll-bible\.com\/[^\s]*utm_source=youtube/.test(item?.link || '') || !label) return { id, L, n, error: 'manifest has no link/label — run node motion/youtube/manifest.mjs', link: item?.link };
  const newLine = label + ': ' + item.link;
  // open the edit page through the SPA router (list → edit, or the editor can stay on the previous video)
  let v = null;
  for (let a = 0; a < 3 && !v; a++) {
    history.pushState({}, '', '/channel/UCtCcbrM2mCgfhSryo4SWxzg/videos/upload'); dispatchEvent(new PopStateEvent('popstate', { state: {} })); await sleep(1200);
    history.pushState({}, '', `/video/${id}/edit`); dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    for (let k = 0; k < 40; k++) { const x = document.querySelector('ytcp-video-metadata-editor')?.video; if (x?.videoId === id && document.querySelectorAll('#textbox').length >= 2) { v = x; break; } await sleep(250); }
  }
  if (!v) return { id, L, n, error: 'edit page did not load' };
  await sleep(1500);
  const before = { at: v.scheduledPublishingDetails?.scheduledPublishings?.[0]?.scheduledTimeSeconds, rel: v.videoLinkageShortsAttribution?.links?.[0]?.targetExternalVideoId };
  const box = document.querySelectorAll('#textbox')[1], old = box.innerText.replace(/\n$/, '');
  const lines = old.split('\n');
  let i;
  if (id === '66VfBSXxAs8') i = lines.findIndex(s => /one-scroll-bible\.com\/?(\s|$)/.test(s) && !/\/film\//.test(s));   // hand-edited Korean film: its home-page line only
  else i = lines.findIndex(s => /one-scroll-bible\.com\/(film\/|\?|[a-zA-Z-]+\/\?utm)/.test(s));
  if (i < 0) return { id, L, n, error: 'no site-link line found', old: old.slice(0, 200) };
  const replaced = id === '66VfBSXxAs8' ? lines[i].replace(/https:\/\/one-scroll-bible\.com\/?(?=\s|$)/, item.link) : newLine;
  if (lines[i] === replaced) return { id, L, n, unchanged: true };
  lines[i] = replaced; const text = lines.join('\n');
  box.focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, text); box.dispatchEvent(new Event('input', { bubbles: true }));
  await sleep(600);
  const save = document.querySelector('ytcp-button#save'); if (!save || save.hasAttribute('disabled')) return { id, L, n, error: 'save not enabled' };
  save.click(); for (let k = 0; k < 80 && !save.hasAttribute('disabled'); k++) await sleep(250);
  await sleep(1500);
  // read back from the server-side video object
  history.pushState({}, '', '/channel/UCtCcbrM2mCgfhSryo4SWxzg/videos/upload'); dispatchEvent(new PopStateEvent('popstate', { state: {} })); await sleep(1200);
  history.pushState({}, '', `/video/${id}/edit`); dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  let w = null; for (let k = 0; k < 40; k++) { const x = document.querySelector('ytcp-video-metadata-editor')?.video; if (x?.videoId === id) { w = x; break; } await sleep(250); }
  const after = { at: w?.scheduledPublishingDetails?.scheduledPublishings?.[0]?.scheduledTimeSeconds, rel: w?.videoLinkageShortsAttribution?.links?.[0]?.targetExternalVideoId };
  const ok = !!w && (w.description || '').includes(item.link) && after.at === before.at && after.rel === before.rel;
  return { id, L, n, ok, line: replaced, before, after };
};
