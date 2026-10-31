/* One player for every film on /film/<slug>/ — the page sets window.FILM before loading this:
     { id: 'story',                     // GA4 `film` parameter, and the film's place in films.json
       path: '/film/story/',            // this page (share links)
       base: '/film/s/',                // where <scene>.html (a Pilot page: seek/__ready) and <scene>.m4a live
       scenes: [[file, label, sec], …], // one entry = a single-file film (silence: [['film', '침묵의 400년', 179.4]])
       marks: [[label, sec], …],        // optional chapters inside a single-file film (the chapter list then seeks)
       i18n: true,                      // page text from <base>i18n/<lang>.json "_ui" (else: Korean only)
       poster: (ori, lang) => url, title, shareText }
   Moved out of film/index.html on 2026-10-31 when /film/ became the list of films (motion/films/README.md §6). */
(function () {
  var C = window.FILM, LANG = C.i18n ? ((location.search.match(/[?&]lang=([\w-]+)/) || [])[1] || 'ko') : 'ko', UI = {};
  var S = C.scenes.map(function (s) { return s.slice(); }), MARKS = C.marks || null;
  // other languages: page text from <base>i18n/<lang>.json "_ui" (the scenes read the same file)
  if (LANG !== 'ko') { try { var x = new XMLHttpRequest(); x.open('GET', C.base + 'i18n/' + LANG + '.json', false); x.send();
    var J = JSON.parse(x.responseText); UI = J._ui || {}; document.documentElement.lang = LANG; document.documentElement.dir = J._dir || 'ltr'; } catch (e) { LANG = 'ko'; } }
  if (UI.ch) S.forEach(function (s, i) { if (UI.ch[i]) s[1] = UI.ch[i]; });
  document.querySelectorAll('[data-ui]').forEach(function (e) { if (UI[e.dataset.ui]) e.textContent = UI[e.dataset.ui]; });
  document.querySelectorAll('[data-ui-html]').forEach(function (e) { if (UI[e.dataset.uiHtml]) e.innerHTML = UI[e.dataset.uiHtml]; });
  document.querySelectorAll('[data-ui-aria]').forEach(function (e) { if (UI[e.dataset.uiAria]) e.setAttribute('aria-label', UI[e.dataset.uiAria]); });
  if (UI.title) document.title = UI.title;
  if (LANG !== 'ko') { document.getElementById('home').href = '/' + LANG + '/'; var lib = document.getElementById('library'); if (lib) lib.hidden = true; }
  document.getElementById('shareTop').onclick = function () { document.getElementById('share').click(); };
  // a shared link can point at one scene: /film/story/#cross
  var START_AT = Math.max(0, S.findIndex(function (s) { return '#' + s[0] === location.hash; }));
  var TOTAL = S.reduce(function (a, s) { return a + s[2]; }, 0), START = [], acc = 0;
  S.forEach(function (s) { START.push(acc); acc += s[2]; });
  var $ = function (id) { return document.getElementById(id); };
  // GA4 — every event carries the film and its language (same parameter name as the main site's events)
  function ev(n, p) { if (window.gtag) try { gtag('event', n, Object.assign({ film: C.id, site_language: LANG }, p || {})); } catch (e) {} }
  // watched = seconds actually played (not position): milestones say how far people really watch
  var watched = 0, MILE = [10, 25, 50, 75, 90], mileSent = {}, stallT = 0, stallSent = {}, pausedBy = '';
  function pos() { return Math.round(cur >= 0 ? START[cur] + (au.currentTime || 0) : 0); }
  var stage = $('stage'), frames = [$('fa'), $('fb')], big = $('big'), wait = $('wait'), poster = $('poster');
  var au = new Audio(); au.preload = 'auto'; au.setAttribute('playsinline', '');
  var pre = new Audio(); pre.preload = 'auto';
  var ori = matchMedia('(orientation: portrait)').matches ? 'v' : 'h';
  var cur = -1, front = 0, playing = false, started = false, loadedIdx = [-1, -1], fpsOn = /[?&]fps=1/.test(location.search), fpsEl = null;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var fmt = function (s) { s = Math.max(0, s | 0); return Math.floor(s / 60) + ':' + pad(s % 60); };
  var markAt = function (t) { var k = 0; if (MARKS) MARKS.forEach(function (m, j) { if (t >= m[1] - .05) k = j; }); return k; };
  var label = function () { return MARKS ? MARKS[markAt(cur >= 0 ? au.currentTime || 0 : 0)][0] : (cur >= 0 ? pad(cur) + ' ' + S[cur][1] : pad(START_AT) + ' ' + S[START_AT][1]); };

  // chapter buttons: scenes, or the marks inside a single-file film
  var ch = $('chapters');
  (MARKS || S).forEach(function (s, i) { var li = document.createElement('li'); li.innerHTML = '<button type="button"><b>' + (MARKS ? fmt(s[1]) : pad(i)) + '</b>' + (MARKS ? s[0] : s[1]) + '</button>';
    li.firstChild.onclick = function () {
      if (MARKS) { ev('film_chapter', { scene: s[0], scene_index: i }); if (cur < 0) go(0, true); else setPlay(true); au.currentTime = s[1]; clk = s[1]; }
      else { ev('film_chapter', { scene: s[0], scene_index: i, from_scene: cur >= 0 ? S[cur][0] : '' }); go(i, true); }
      stage.scrollIntoView({ behavior: 'smooth', block: 'center' }); }; ch.appendChild(li); });
  var chB = ch.querySelectorAll('button'), shownCh = -1;
  function markChapter(k) { if (k === shownCh) return; shownCh = k; chB.forEach(function (b, j) { b.setAttribute('aria-current', String(j === k)); }); }

  function size() {
    var W = ori === 'v' ? 1080 : 1920, H = ori === 'v' ? 1920 : 1080, full = document.body.classList.contains('full');
    var pc = getComputedStyle(stage.parentNode), inner = stage.parentNode.clientWidth - parseFloat(pc.paddingLeft) - parseFloat(pc.paddingRight);
    var maxW = full ? innerWidth : Math.min(inner, 1100), maxH = full ? innerHeight : Math.max(240, innerHeight - 150);
    var s = Math.min(maxW / W, maxH / H), w = Math.round(W * s), h = Math.round(H * s);
    if (!full) { stage.style.width = w + 'px'; stage.style.height = h + 'px'; }
    var ox = full ? (innerWidth - w) / 2 : 0, oy = full ? (innerHeight - h) / 2 : 0;
    frames.forEach(function (f) { f.width = W; f.height = H; f.style.transform = 'translate(' + ox + 'px,' + oy + 'px) scale(' + s + ')'; });
    poster.src = C.poster(ori, LANG);   // the title card in the page's language
    document.querySelectorAll('.bar [data-o]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.o === ori)); });
  }
  addEventListener('resize', size);

  function src(i) { return C.base + S[i][0] + '.html?render=1' + (ori === 'v' ? '&o=v' : '') + (LANG !== 'ko' ? '&lang=' + LANG : ''); }
  function load(slot, i) { if (loadedIdx[slot] === i && frames[slot].dataset.o === ori) return; loadedIdx[slot] = i; frames[slot].dataset.o = ori; frames[slot].src = src(i); drawnKey = ''; }
  function ready(slot) { try { var w = frames[slot].contentWindow; return !!(w && w.__ready && w.seek) && loadedIdx[slot] === cur; } catch (e) { return false; } }

  function go(i, play) {
    if (i < 0 || i >= S.length) { if (i >= S.length) { pausedBy = 'end'; setPlay(false); cur = S.length - 1; ev('film_complete', { watched_sec: Math.round(watched), orientation: ori }); } return; }
    var back = 1 - front;
    if (loadedIdx[back] === i && frames[back].dataset.o === ori) front = back; else load(front, i);
    cur = i; frames[front].classList.add('on'); frames[1 - front].classList.remove('on');
    srcT = performance.now(); au.src = C.base + S[i][0] + '.m4a'; au.currentTime = 0; clk = 0;
    if (i + 1 < S.length) { load(1 - front, i + 1); pre.src = C.base + S[i + 1][0] + '.m4a'; }
    $('now').textContent = label();
    if (!MARKS) markChapter(i);
    if (play !== undefined) setPlay(play); else if (playing) au.play().catch(function () {});
    if (started && !MARKS) ev('film_scene', { scene: S[i][0], scene_index: i, orientation: ori });
  }
  // play/pause button for screen readers: Korean keeps 재생/일시정지; other languages have only a translated "play"
  // (UI.play), so they use it as a toggle button (aria-pressed) instead of falling back to Korean words
  function ppLabel(p) { var b = $('pp'); if (LANG === 'ko' || !UI.play) b.setAttribute('aria-label', p ? '일시정지' : '재생');
    else { b.setAttribute('aria-label', UI.play); b.setAttribute('aria-pressed', p ? 'true' : 'false'); } }
  function setPlay(p) {
    playing = p; $('pp').textContent = p ? '❚❚' : '▶'; ppLabel(p);
    big.hidden = p || started; if (p) { started = true; poster.hidden = true; big.hidden = true; au.play().catch(function () {}); } else au.pause();
    if (!p && started && cur >= 0 && !pausedBy) ev('film_pause', { scene: S[cur][0], position_sec: pos(), watched_sec: Math.round(watched) });
    pausedBy = '';
  }
  big.onclick = function () { ev('film_play', { orientation: ori, start_scene: S[START_AT][0], from_link: START_AT > 0 }); if (cur < 0) go(START_AT, true); else setPlay(true); };
  $('pp').onclick = function () { if (cur < 0) go(START_AT, true); else setPlay(!playing); };
  // share: the film link (with the scene now showing, e.g. /film/story/#cross) — the phone's share sheet, else copy the link
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(function () { t.hidden = true; }, 2200); }
  $('share').onclick = function () {
    var i = cur >= 0 ? cur : START_AT, url = location.origin + C.path + (LANG !== 'ko' ? '?lang=' + LANG : '') + (i > 0 ? '#' + S[i][0] : '');
    var title = UI.title || C.title, text = (UI.shareText || C.shareText) + (i > 0 ? ' — ' + S[i][1] : '');
    function copy() {   // PC (and any share-sheet failure): copy the link and say so
      var done = function () { toast(UI.copied || '링크를 복사했어요'); ev('share', { method: 'copy', content_type: 'film', item_id: S[i][0] }); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, legacy); else legacy();
      function legacy() { var ta = document.createElement('textarea'); ta.value = url; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); if (ok) done(); else prompt('', url); }
    }
    // the system share sheet wherever the browser has one (phones and Windows/macOS PCs alike); if it can't open, copy the link
    var data = { title: title, text: text, url: url };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data)))
      navigator.share(data).then(function () { ev('share', { method: 'native', content_type: 'film', item_id: S[i][0] }); })
        .catch(function (e) { if (!e || e.name !== 'AbortError') { console.warn('share failed:', e); copy(); } });
    else copy();
  };
  // ⏮ ⏭: the previous / next scene, or the previous / next chapter mark of a single-file film
  function step(d) {
    ev('film_nav', { dir: d < 0 ? 'prev' : 'next', from_scene: cur >= 0 ? S[cur][0] : '' });
    if (MARKS) { var k = Math.max(0, Math.min(MARKS.length - 1, markAt(cur >= 0 ? au.currentTime : 0) + d)); if (cur < 0) go(0, true); au.currentTime = MARKS[k][1]; clk = MARKS[k][1]; return; }
    go(Math.max(0, Math.min(S.length - 1, cur + d)), playing || cur < 0);
  }
  $('prev').onclick = function () { step(-1); };
  $('next').onclick = function () { step(1); };
  stage.onclick = function (e) { if (e.target === big || big.contains(e.target)) return; if (started) setPlay(!playing); };
  document.querySelectorAll('.bar [data-o]').forEach(function (b) { b.onclick = function () {
    if (ori === b.dataset.o) return; ori = b.dataset.o; ev('film_orientation', { to: ori }); var t = au.currentTime; size();
    if (cur >= 0) { loadedIdx = [-1, -1]; var i = cur; cur = -1; go(i); au.currentTime = t; } }; });
  $('fs').onclick = function () {
    var on = !document.body.classList.contains('full'); document.body.classList.toggle('full', on); ev('film_fullscreen', { on: on });
    try { if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {}); else if (!on && document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    size(); poke();
  };
  document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && document.body.classList.contains('full')) { document.body.classList.remove('full'); size(); } });
  var idleT; function poke() { document.body.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(function () { if (playing) document.body.classList.add('idle'); }, 2500); }
  addEventListener('pointermove', poke); addEventListener('touchstart', poke, { passive: true });
  au.addEventListener('ended', function () { if (playing) go(cur + 1); });
  au.addEventListener('error', function () { if (cur >= 0 && started) ev('film_error', { kind: 'audio', scene: S[cur][0] }); });
  // 소리가 이 재생기 밖에서 멈추거나(잠금화면·알림·이어폰·시스템) 시작되면 재생 상태를 그대로 따른다 — 다시 틀지 않음
  au.addEventListener('pause', function () { if (selfPause) { selfPause = false; return; } if (performance.now() - srcT < 400) return; if (playing && !au.ended) setPlay(false); });
  au.addEventListener('play', function () { if (!playing && started) { playing = true; $('pp').textContent = '❚❚'; ppLabel(true); } });
  // 화면을 떠나면(탭 전환·앱 전환·브라우저 닫기) 소리도 멈춘다 — 그림은 숨은 탭에서 멈추므로 소리만 남지 않게
  document.addEventListener('visibilitychange', function () { if (document.hidden && playing) { pausedBy = 'hidden'; setPlay(false); } });
  // leaving: how much was watched and where — the drop-off point (sent with the beacon transport so it survives the unload)
  var exitSent = false;
  addEventListener('pagehide', function () {
    if (started && !exitSent) { exitSent = true; ev('film_exit', { scene: cur >= 0 ? S[cur][0] : '', position_sec: pos(), watched_sec: Math.round(watched), percent: Math.round(watched / TOTAL * 100), transport_type: 'beacon' }); }
    pausedBy = 'leave'; setPlay(false); try { au.removeAttribute('src'); au.load(); } catch (e) {} });
  // 잠금 화면·알림의 재생 컨트롤이 이 재생기를 따르도록
  if ('mediaSession' in navigator) { try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: UI.title || C.title, artist: UI.brand || '한눈에 보는 성경 이야기', artwork: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] });
    navigator.mediaSession.setActionHandler('play', function () { if (cur < 0) go(0, true); else setPlay(true); });
    navigator.mediaSession.setActionHandler('pause', function () { setPlay(false); });
    navigator.mediaSession.setActionHandler('stop', function () { setPlay(false); });
    navigator.mediaSession.setActionHandler('previoustrack', function () { step(-1); });
    navigator.mediaSession.setActionHandler('nexttrack', function () { step(1); });
  } catch (e) {} }

  if (fpsOn) { fpsEl = document.createElement('div'); fpsEl.className = 'fps'; stage.appendChild(fpsEl); }
  // scrolled out of view (reading the chapter list while listening): the sound plays on, the picture is not drawn
  var onScreen = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { var v = e[0].isIntersecting; if (v && !onScreen) drawnKey = ''; onScreen = v; }).observe(stage);
  var shownW = '', shownTm = '', shownNow = '';
  var selfPause = false, srcT = 0, fc = 0, fl = performance.now(), lastSeek = -1, drawnKey = '', drawnAt = 0, pending = false, clk = 0, lastNow = performance.now();
  (function loop(now) {
    if (cur >= 0) {
      var ok = ready(front), dt = Math.min(.5, (now - lastNow) / 1000);
      // clock: the audio when it plays; a free clock if this browser can't play the sound file
      if (!au.error) clk = au.currentTime || 0; else if (playing && ok) clk += dt;
      var t = clk;
      if (au.error && playing && clk >= S[cur][2]) { go(cur + 1); requestAnimationFrame(loop); lastNow = now; return; }
      wait.hidden = ok || !started;
      if (playing && ok) { watched += dt; stallT = 0; var pc = watched / TOTAL * 100; for (var mi = 0; mi < MILE.length; mi++) if (pc >= MILE[mi] && !mileSent[MILE[mi]]) { mileSent[MILE[mi]] = 1; ev('film_progress', { percent: MILE[mi], scene: S[cur][0], orientation: ori }); } }
      else if (playing && !ok) { stallT += dt; if (stallT > 5 && !stallSent[cur]) { stallSent[cur] = 1; ev('film_stall', { scene: S[cur][0], orientation: ori }); } }
      if (ok) {
        if (!playing && au.paused && au.readyState < 1) t = 0;
        // draw only when the picture can change: a new time, scene or orientation (paused = no 60 Hz redraw burning a
        // phone's battery); for 1 s after a change it keeps drawing so late-arriving fonts/textures still show up
        var key = front + ':' + loadedIdx[front] + ':' + ori + ':' + t;
        if (key !== drawnKey) { drawnKey = key; drawnAt = now; }
        if (onScreen && (t !== lastSeek || now - drawnAt < 1000)) { try { frames[front].contentWindow.seek(t); } catch (e) {} lastSeek = t; fc++; }
        if (playing && au.paused && !au.ended && !pending) { pending = true; au.play().catch(function () {}).then(function () { pending = false; }); }
      } else if (playing && !au.paused) { selfPause = true; au.pause(); }   // keep sound in step with the picture while a scene loads
      // the bar and the clock: touch the page only when what they show changes (not 60 times a second)
      var pw = (100 * (START[cur] + t) / TOTAL).toFixed(1) + '%', tx = fmt(START[cur] + t) + ' / ' + fmt(TOTAL);
      if (!MARKS) pw = (100 * t / S[cur][2]).toFixed(1) + '%';
      if (pw !== shownW) { $('prog').style.width = pw; shownW = pw; }
      if (tx !== shownTm) { $('tm').textContent = tx; shownTm = tx; }
      if (MARKS) { var k = markAt(t); markChapter(k); var nw = label(); if (nw !== shownNow) { $('now').textContent = nw; shownNow = nw; } }
    }
    if (fpsEl && now - fl > 1000) { fpsEl.textContent = Math.round(fc * 1000 / (now - fl)) + ' fps'; fc = 0; fl = now; }
    lastNow = now; requestAnimationFrame(loop);
  })(performance.now());

  $('tm').textContent = '0:00 / ' + fmt(TOTAL);
  size();
  load(0, START_AT); loadedIdx[0] = START_AT; frames[0].dataset.o = ori;  // warm up the first scene behind the poster
  $('now').textContent = label(); if (START_AT > 0) $('tm').textContent = fmt(START[START_AT]) + ' / ' + fmt(TOTAL);
})();
