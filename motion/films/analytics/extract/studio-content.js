// YouTube Studio → channel analytics → content explorer table, 28 days, metrics views · average % viewed · subscribers
// (URL in sources.json): one row per video {title, duration, views, avgPct, subs}.
(() => {
  const i = idx('합계'), rows = [];
  for (let k = i + 4; k < L.length - 5; k++) if (/^\d+:\d\d$/.test(L[k]) && !isNum(L[k + 1])) {
    rows.push({ duration: L[k], title: L[k + 1], views: num(L[k + 2]), share: pctv(L[k + 3]), avgPct: pctv(L[k + 4]), subs: num(L[k + 5]) }); k += 5; }
  return { source: 'studio-content', total: { views: num(L[i + 1]), avgPct: pctv(L[i + 2]), subs: num(L[i + 3]) }, rows };
})()
