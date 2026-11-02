// Review page feedback: who is reviewing, notes per line, picks per decision, a general note.
// Shared through the artifact's db ("feedback/r<round>-<who>"), drafts kept in this browser, and a copy-as-text fallback
// for anyone whose view cannot write (signed out, view-only link) — they paste it into a message instead.
(function () {
  const R = window.REVIEW, $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const PRESET = { owner: '관리자', wife: '아내' };
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)) } catch (e) { return null } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} },
  };
  const WHO_KEY = 'osb-review-who';
  let who = store.get(WHO_KEY);                       // {key, name}
  let mine = blank(), all = {}, db = null, writable = true, timer = null, writing = false, again = false, adopted = false;
  function blank() { return { lines: {}, picks: {}, notes: {}, general: '' } }
  const draftKey = () => `osb-review-${R.film}-r${R.round}-${who ? who.key : 'none'}`;
  const docId = () => `r${R.round}-${who.key}`;

  // ---------- who ----------
  function paintWho() {
    $$('.who .chip').forEach(b => b.setAttribute('aria-pressed', String(!!who && (b.dataset.who === who.key || (b.dataset.who === 'other' && !PRESET[who.key])))));
    const inp = $('#whoName'); inp.hidden = !(who && !PRESET[who.key]);
    if (who && !PRESET[who.key] && document.activeElement !== inp) inp.value = who.name || '';
    $('.who').classList.toggle('need', !who);
  }
  function setWho(next) {
    who = next; store.set(WHO_KEY, who);
    mine = Object.assign(blank(), store.get(draftKey()) || {}); adopted = false;
    adoptFromDb(); paintAll();
  }
  $$('.who .chip').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.who === 'other') { const k = who && !PRESET[who.key] ? who.key : 'p-' + Math.random().toString(36).slice(2, 8); setWho({ key: k, name: $('#whoName').value.trim() }); $('#whoName').focus(); }
    else setWho({ key: b.dataset.who, name: PRESET[b.dataset.who] });
  }));
  $('#whoName').addEventListener('input', e => { if (!who) return; who.name = e.target.value.trim(); store.set(WHO_KEY, who); queue(); });
  const needWho = () => { if (who) return false; $('.who').classList.add('need'); $('.who .chip').focus(); status('먼저 위에서 누구인지 골라 주세요', 'off'); return true; };

  // ---------- inputs ----------
  $$('.opt').forEach(b => b.addEventListener('click', () => {
    if (needWho()) return;
    const k = b.dataset.key, v = b.dataset.opt;
    if (mine.picks[k] === v) delete mine.picks[k]; else mine.picks[k] = v;
    changed();
  }));
  $$('.addfb').forEach(b => b.addEventListener('click', () => {
    if (needWho()) return;
    const ta = $('#fb-' + b.dataset.id); ta.hidden = false; b.hidden = true; ta.focus();
  }));
  $$('textarea[data-kind]').forEach(ta => ta.addEventListener('input', () => {
    if (needWho()) { ta.value = ''; return; }
    const kind = ta.dataset.kind, id = ta.dataset.id, v = ta.value;
    if (kind === 'general') mine.general = v;
    else { const bag = kind === 'line' ? mine.lines : mine.notes; if (v.trim()) bag[id] = v; else delete bag[id]; }
    changed(true);
  }));
  function changed(typing) { store.set(draftKey(), { ...mine, _at: new Date().toISOString() }); if (!typing) paintAll(); else paintCopy(); queue(); }

  // ---------- db ----------
  function status(t, cls) { const el = $('#saveState'); el.textContent = t; el.className = 'save ' + (cls || ''); }
  function queue() { if (!db || !writable || !who) { if (who && !db) status('이 브라우저에만 저장됨 — 함께 보려면 맨 아래 "내 의견 복사"', 'off'); return; }
    status('저장 중…'); clearTimeout(timer); timer = setTimeout(flush, 1200); }
  async function flush() {
    if (writing) { again = true; return; }
    writing = true;
    try {
      await db.collection('feedback').doc(docId()).set({ film: R.film, round: R.round, who: who.name || '이름 없음', ...mine, at: new Date().toISOString() });
      status('저장됨 · 함께 보는 사람에게 보여요', 'ok');
    } catch (e) {
      if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'not_granted')) { writable = false; status('이 화면에서는 공유 저장이 안 돼요 — 맨 아래 "내 의견 복사"로 보내 주세요', 'off'); }
      else status('저장 못 함 — 잠시 뒤 다시 써 보거나 "내 의견 복사"를 써 주세요', 'off');
    }
    writing = false; if (again) { again = false; flush(); }
  }
  function adoptFromDb() {
    if (adopted || !who) return;
    const d = all[docId()];
    if (d) { const local = store.get(draftKey()); if (!local || (d.at && (!local._at || d.at > local._at))) mine = { lines: d.lines || {}, picks: d.picks || {}, notes: d.notes || {}, general: d.general || '' }; adopted = true; }
  }
  (async () => {
    if (!window.claude || !window.claude.use) { status('이 브라우저에만 저장됨 — 함께 보려면 맨 아래 "내 의견 복사"', 'off'); return; }
    const [d, u] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    db = d;
    if (!db) { status('이 화면에서는 공유 저장이 안 돼요 — 맨 아래 "내 의견 복사"로 보내 주세요', 'off'); return; }
    if (u) { try { const can = await u.can('data.write'); if (can === false) { writable = false; status('보기 전용이라 공유 저장이 안 돼요 — 맨 아래 "내 의견 복사"로 보내 주세요', 'off'); } } catch (e) {} }
    const slow = setTimeout(() => status('함께 본 의견을 아직 못 불러왔어요 — 연결을 확인해 주세요', 'off'), 10000);
    db.collection('feedback').onSnapshot(snap => {
      if (!snap.metadata.fromCache) clearTimeout(slow);
      all = {}; snap.docs.forEach(s => { const x = s.data(); if (x && x.round === R.round) all[s.id] = x; });
      adoptFromDb(); paintAll();
      if (writable && who && $('#saveState').textContent === '') status('함께 보는 중', 'ok');
    }, () => { clearTimeout(slow); status('함께 본 의견을 못 불러왔어요 — "내 의견 복사"를 써 주세요', 'off'); });
  })();

  // ---------- paint ----------
  const others = () => Object.entries(all).filter(([k]) => !who || k !== docId()).map(([, v]) => v);
  function li(name, text) { const el = document.createElement('li'); const b = document.createElement('b'); b.textContent = name; el.append(b, document.createTextNode(text)); return el; }
  function paintAll() {
    paintWho();
    $$('.opt').forEach(b => {
      const k = b.dataset.key, v = b.dataset.opt;
      b.setAttribute('aria-pressed', String(mine.picks[k] === v));
      const names = others().filter(o => o.picks && o.picks[k] === v).map(o => o.who);
      if (who && mine.picks[k] === v) names.unshift((who.name || '나') + '(나)');
      $('.by', b).textContent = names.length ? '✓ ' + names.join(', ') : '';
    });
    $$('.fb').forEach(box => {
      const id = box.dataset.id, kind = box.dataset.kind, ul = $('.others', box); ul.textContent = '';
      for (const o of others()) { const t = kind === 'line' ? (o.lines || {})[id] : kind === 'dec' ? (o.notes || {})[id] : o.general; if (t && t.trim()) ul.append(li(o.who + ':', t)); }
      const ta = $('textarea', box), mineText = kind === 'line' ? mine.lines[id] : kind === 'dec' ? mine.notes[id] : mine.general;
      if (document.activeElement !== ta) ta.value = mineText || '';
      const add = $('.addfb', box); if (add) { const open = !!(mineText && mineText.trim()); if (open) { ta.hidden = false; add.hidden = true; } else if (document.activeElement !== ta) { ta.hidden = true; add.hidden = false; } }
    });
    paintCopy();
  }
  function paintCopy() {
    const L = [`[${R.title} · ${R.stageName} ${R.round}차 의견 — ${who ? who.name || '이름 없음' : '?'}]`, ''];
    const dec = R.decisions.filter(d => mine.picks[d.key] || mine.notes[d.key]);
    if (dec.length) { L.push('■ 정할 것'); dec.forEach(d => L.push(`- ${d.q} → ${mine.picks[d.key] || '(고르지 않음)'}${mine.notes[d.key] ? ' / ' + mine.notes[d.key].trim() : ''}`)); L.push(''); }
    const lines = R.lines.filter(l => mine.lines[l.id]);
    if (lines.length) { L.push('■ 줄마다'); lines.forEach(l => L.push(`- [${l.id}] ${l.label}\n  → ${mine.lines[l.id].trim()}`)); L.push(''); }
    if (mine.general.trim()) { L.push('■ 전체 의견', mine.general.trim()); }
    $('#copyOut').value = L.join('\n').trim();
  }
  $('#copyBtn').addEventListener('click', () => {
    const ta = $('#copyOut'), done = () => { $('#copyBtn').textContent = '복사했어요'; setTimeout(() => $('#copyBtn').textContent = '내 의견 복사', 2000); };
    const fallback = () => { ta.focus(); ta.select(); $('#copyBtn').textContent = '선택됨 — 길게 눌러 복사'; };
    try { navigator.clipboard.writeText(ta.value).then(done, fallback); } catch (e) { fallback(); }
  });

  mine = Object.assign(blank(), who ? store.get(draftKey()) || {} : {});
  paintAll();
  if (!who) status('');
})();
