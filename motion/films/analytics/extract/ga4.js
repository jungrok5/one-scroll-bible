// GA4 → reports → traffic acquisition (session default channel group), last 28 days: one row per channel group.
(() => {
  const s = document.body.innerText, period = (s.match(/(\d+월 \d+일~\d{4}년 \d+월 \d+일)/) || [])[1], rows = {};
  for (const line of s.split('\n')) { const c = line.trim().split('\t').map(x => x.trim());   /* rows start with a tab (2026-11-05) */ if (c.length >= 9 && /^\d+$/.test(c[0])) rows[c[1]] = { sessions: num(c[2]), engaged: num(c[3]), engagementRate: pctv(c[4]), avgTime: c[5], events: num(c[7]), keyEvents: num(c[8]) }; }
  return { source: 'ga4', period, rows };
})()
