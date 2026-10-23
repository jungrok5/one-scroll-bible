// Paste-in helper for threads.com to schedule the Shorts from motion/out/insta/reels-<lang>/threads.json
// (node motion/social/insta_reels_plan.mjs <lang> --threads). Needs `node motion/youtube/serve.mjs`; files come through the
// relay popup (motion/youtube/relay.html) like meta-reels.js, since threads.com's CSP blocks 127.0.0.1.
// Per post (what worked 2026-10-23, 21 posts):
//   1. real click the "+" composer · real click the text box · TYPE the caption (real keystrokes) · Escape
//   2. await __attach(n); wait ~8-12 s (upload) · __capOk(n) === 'caption ok'
//   3. real click the composer's ⋯ · __press(__menuItem()) (a synthetic pointer press opens "예약…"; a plain click often
//      did nothing) · await __waitCal()
//   4. __focusT('hh') + type 19 · __focusT('mm') + type 00 — never click the time fields by coordinate: when the click
//      missed, the digits went into the caption ("#성경1900"); fix with Backspace before scheduling
//   5. await __pickDate(n) (pages "다음 달" itself; cells are role=gridcell whose text starts "YYYY년 M월 D일 ")
//      · __dateOk(n).ok
//   6. in a SEPARATE tool call: real click 완료 (a 6-row month moves it ~31 px down) · __bannerOk(n) checks
//      "… 오후 7:00 GMT+9에 게시 예정" · real click 예약. Clicking 완료 right after the date pick in the same batch
//      often closed the picker without saving.
// Check: composer → 임시 저장본 lists every scheduled post with its time.
(() => {
  const SRV = 'http://127.0.0.1:8765', LANG = window.__osbLang || 'ko', sleep = ms => new Promise(r => setTimeout(r, ms));
  const oc = HTMLInputElement.prototype.click;
  if (!window.__fiHook) { window.__fiHook = 1; HTMLInputElement.prototype.click = function () { if (this.type === 'file') { window.__fi = this; return; } return oc.call(this); }; }
  window.__relay = window.__relay || { pend: {}, ready: false, win: null };
  if (!window.__relayL) { window.__relayL = 1; addEventListener('message', e => {
    if (e.origin !== SRV || !e.data) return; const R = window.__relay;
    if (e.data.osb === 'ready') R.ready = true;
    else if (e.data.osb === 'file' || e.data.osb === 'err') { const p = R.pend[e.data.id]; if (p) { delete R.pend[e.data.id]; e.data.osb === 'file' ? p.res(e.data) : p.rej(new Error(e.data.msg)); } }
  }); }
  window.__get = path => new Promise((res, rej) => { const id = Math.random().toString(36).slice(2); window.__relay.pend[id] = { res, rej };
    window.__relay.win.postMessage({ osb: 'get', id, path }, SRV); setTimeout(() => rej(new Error('relay timeout ' + path)), 120000); });
  window.__putR = async (path, input) => { const d = await window.__get(path), name = path.split('/').pop();
    const f = new File([d.buf], name, { type: name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg' }), dt = new DataTransfer(); dt.items.add(f);
    input.files = dt.files; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
    return name + ' ' + (f.size / 1e6).toFixed(1) + 'MB'; };
  window.__loadPlan = async () => { const d = await window.__get(`out/insta/reels-${LANG}/threads.json`); return (window.__plan = JSON.parse(new TextDecoder().decode(d.buf))).length; };
  const P = n => window.__plan.find(p => p.n === n);
  const kst = n => { const d = new Date(Date.parse(P(n).at) + 9 * 3600e3); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCDay()]; };
  window.__press = el => { const r = el.getBoundingClientRect(), o = { bubbles: true, cancelable: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, button: 0, pointerId: 1, pointerType: 'mouse', isPrimary: true };
    el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new MouseEvent('mousedown', o)); el.dispatchEvent(new PointerEvent('pointerup', o)); el.dispatchEvent(new MouseEvent('mouseup', o)); el.dispatchEvent(new MouseEvent('click', o)); };
  window.__menuItem = () => { const it = [...document.querySelectorAll('[role=button],[role=menuitem],div')].filter(e => e.offsetParent !== null && /^예약…?\.*$/.test(e.textContent.trim())); return it[it.length - 1]; };
  window.__attach = async n => { const i = [...document.querySelectorAll('input[type=file]')].find(x => x.accept.includes('video')); if (!i) return 'no input';
    return await window.__putR(P(n).video.replace(/\\/g, '/').replace(/^.*?\/motion\//, ''), i); };
  window.__capOk = n => { const ed = document.querySelector('[contenteditable=true]'), t = ed ? ed.innerText.replace(/\n\n\n/g, '\n\n').trim() : '';
    return t === P(n).caption ? 'caption ok' : 'MISMATCH ' + JSON.stringify(t); };
  window.__waitCal = async () => { for (let i = 0; i < 15; i++) { if (document.querySelector('[role=gridcell]')) return 'calendar open'; await sleep(200); } throw new Error('calendar not open'); };
  window.__focusT = k => { const el = document.querySelector(`input[placeholder="${k}"]`); if (!el) throw new Error('no ' + k + ' input'); el.focus(); el.select(); return 'focused ' + k; };
  const cell = (y, m, d) => [...document.querySelectorAll('[role=gridcell]')].find(c => c.textContent.startsWith(`${y}년 ${m}월 ${d}일 `));
  window.__pickDate = async n => { const [y, m, d] = kst(n);
    for (let i = 0; i < 3 && !cell(y, m, d); i++) { window.__press(document.querySelector('[aria-label="다음 달"]')); await sleep(600); }
    const c = cell(y, m, d); if (!c) return 'no cell'; (c.firstElementChild || c).click(); await sleep(400);
    return 'picked ' + c.textContent + (c.textContent.includes('선택됨') ? ' (selected)' : ''); };
  window.__dateOk = n => { const [y, m, d] = kst(n), c = cell(y, m, d), hh = document.querySelector('input[placeholder="hh"]')?.value, mm = document.querySelector('input[placeholder="mm"]')?.value;
    return { ok: !!c && c.textContent.includes('선택됨') && hh === '19' && mm === '00', hh, mm }; };
  window.__bannerOk = n => { const [, m, d, wd] = kst(n), w = '일월화수목금토'[wd] + '요일', b = (document.body.innerText.match(/[^\n]*게시 예정/) || [''])[0];
    if (!/오후 7:00 GMT\+9/.test(b) || !(b.includes(w) || b.includes(`${m}월 ${d}일`) || b.startsWith('내일'))) throw new Error('banner: ' + b); return b; };
  let b = document.getElementById('osbRelayBtn');
  if (!b) { b = document.createElement('button'); b.id = 'osbRelayBtn'; b.textContent = 'OSB RELAY';
    b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;padding:12px 18px;background:#c00;color:#fff;font:16px sans-serif';
    b.onclick = () => { window.__relay.win = window.open(SRV + '/youtube/relay.html', 'osbrelay', 'width=320,height=120'); }; document.body.appendChild(b); }
  return 'threads helper ready — click OSB RELAY, then await __loadPlan()';
})();
