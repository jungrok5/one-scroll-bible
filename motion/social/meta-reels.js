// Paste-in helper for Meta Business Suite (business.facebook.com) to schedule the Instagram Reels in
// motion/out/insta/reels-<lang>/plan.json (motion/social/insta_reels_plan.mjs). Needs `node motion/youtube/serve.mjs`.
// Business Suite's CSP blocks fetching 127.0.0.1, so files come through a popup (motion/youtube/relay.html, same origin as
// the server) that posts the bytes back. Opening that popup needs a real click: the red "OSB RELAY" button this adds.
//   1. paste this, click OSB RELAY (once per full page load; SPA moves keep it)  → __relay.ready === true
//   2. per reel: __ct('Create reel') · click the caption box and TYPE the caption with real keystrokes (scripted insertText
//      scrambles the editor's hashtag nodes and can crash it: "Reel details are temporarily unavailable") · Escape ·
//      await __media(n) · __capOk(n) · await __toSchedule() (→ 'on schedule') · real clicks + typing: date field
//      (triple-click, ctrl+a, mm/dd/yyyy, Enter), then hour 07, minutes 00, meridiem P ·
//      __finish(n) — checks date/time against the plan and clicks Schedule only if they match.
// Start each reel from the Content page's "Create reel" (an SPA move keeps the helper); opening the composer by URL reloads
// the page and the helper + relay must be set up again. A paused-upload "copyright may be found" note clears in ~10 s.
// The Planner (week view) is the reliable check; the Scheduled list lags by minutes.
(() => {
  const SRV = 'http://127.0.0.1:8765', LANG = window.__osbLang || 'ko';
  const oc = HTMLInputElement.prototype.click;   // a file input's click() is captured instead of opening the OS picker
  if (!window.__fiHook) { window.__fiHook = 1; HTMLInputElement.prototype.click = function () { if (this.type === 'file') { window.__fi = this; return; } return oc.call(this); }; }
  window.__relay = window.__relay || { pend: {}, ready: false, win: null };
  if (!window.__relayL) { window.__relayL = 1; addEventListener('message', e => {
    if (e.origin !== SRV || !e.data) return; const R = window.__relay;
    if (e.data.osb === 'ready') R.ready = true;
    else if (e.data.osb === 'file' || e.data.osb === 'err') { const p = R.pend[e.data.id]; if (p) { delete R.pend[e.data.id]; e.data.osb === 'file' ? p.res(e.data) : p.rej(new Error(e.data.msg)); } }
  }); }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  window.__get = path => new Promise((res, rej) => { const id = Math.random().toString(36).slice(2); window.__relay.pend[id] = { res, rej };
    window.__relay.win.postMessage({ osb: 'get', id, path }, SRV); setTimeout(() => rej(new Error('relay timeout ' + path)), 120000); });
  window.__putR = async (path, input) => { const d = await window.__get(path), name = path.split('/').pop();
    const f = new File([d.buf], name, { type: name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg' }), dt = new DataTransfer(); dt.items.add(f);
    input.files = dt.files; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
    return name + ' ' + (f.size / 1e6).toFixed(1) + 'MB'; };
  const vis = t => [...document.querySelectorAll('[role=button],button,a')].filter(e => e.offsetParent !== null && e.textContent.trim() === t);
  window.__ct = t => { const e = vis(t)[0]; if (!e) return 'not found: ' + t; e.click(); return 'clicked ' + t; };
  window.__ctLast = t => { const l = vis(t), e = l[l.length - 1]; if (!e) return 'not found: ' + t; e.click(); return 'clicked last ' + t; };
  window.__loadPlan = async () => { const d = await window.__get(`out/insta/reels-${LANG}/plan.json`); return (window.__plan = JSON.parse(new TextDecoder().decode(d.buf))).length; };
  const P = n => window.__plan.find(p => p.n === n), rel = f => f.replace(/\\/g, '/').replace(/^.*?\/motion\//, '');
  window.__media = async n => { const p = P(n), out = [];
    window.__fi = null; window.__ct('Add Video'); await sleep(500); if (!window.__fi) return 'no video input';
    out.push(await window.__putR(rel(p.video), window.__fi)); await sleep(8000);
    window.__fi = null; window.__ct('Upload image'); await sleep(800); window.__ctLast('Upload image'); await sleep(500); if (!window.__fi) return out.concat('no image input').join(' | ');
    out.push(await window.__putR(rel(p.cover), window.__fi)); return out.join(' | '); };
  window.__capOk = n => { const t = (document.querySelector('[contenteditable=true]')?.innerText || '').replace(/\n\n\n/g, '\n\n'); return t === P(n).caption ? 'caption ok' : 'CAPTION MISMATCH ' + JSON.stringify(t); };
  // Next can stay disabled while the upload finishes: keep clicking until the Share step shows, then pick Schedule
  window.__toSchedule = async () => { for (let i = 0; i < 12; i++) {
      if (document.querySelector('input[placeholder="mm/dd/yyyy"]')) return 'on schedule';
      if (vis('Share now').length) { window.__ct('Schedule'); await sleep(1500); continue; }
      window.__ct('Next'); await sleep(2500); }
    return document.querySelector('input[placeholder="mm/dd/yyyy"]') ? 'on schedule' : 'STUCK'; };
  window.__want = n => { const d = new Date(P(n).at), f = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', month: 'short', day: 'numeric', year: 'numeric' });
    return f.format(d); };   // e.g. "Oct 26, 2026" (the field shows this after typing 10/26/2026)
  window.__finish = n => { const want = window.__want(n), date = document.querySelector('input[placeholder="mm/dd/yyyy"]')?.value,
      sp = l => document.querySelector(`[role=spinbutton][aria-label="${l}"]`),   // the segments are empty; values live in aria-*
      h = sp('hours')?.getAttribute('aria-valuenow'), m = sp('minutes')?.getAttribute('aria-valuenow'), ap = sp('meridiem')?.getAttribute('aria-valuetext');
    if (date !== want || h !== '7' || m !== '0' || ap !== 'PM') return `NOT scheduled: field ${date} ${h}:${m} ${ap}, want ${want} 7:0 PM`;
    window.__ctLast('Schedule'); return `scheduled ${n}: ${date} ${h}:${m} ${ap}`; };
  let b = document.getElementById('osbRelayBtn');
  if (!b) { b = document.createElement('button'); b.id = 'osbRelayBtn'; b.textContent = 'OSB RELAY';
    b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;padding:12px 18px;background:#c00;color:#fff;font:16px sans-serif';
    b.onclick = () => { window.__relay.win = window.open(SRV + '/youtube/relay.html', 'osbrelay', 'width=320,height=120'); }; document.body.appendChild(b); }
  return 'meta-reels helper ready — click OSB RELAY';
})();
