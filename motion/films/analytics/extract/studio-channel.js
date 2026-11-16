// YouTube Studio → channel analytics overview (studio.youtube.com/channel/<id>/analytics/tab-overview/period-default):
// the 28-day totals, the realtime box (subscribers, views in the last 48 h and its top content), the latest upload.
// Two layouts: the old overview ("지난 28일 동안 채널의 조회수가 …회", "실시간 업데이트 중", "최신 콘텐츠") and, from 2026-11-16, the
// "채널 통계" hub the tab-overview URL now redirects to (…/analytics/hub_overview: "주요 측정항목" 조회수 · 시청 시간 · 구독자 수,
// "48시간 조회수", "총 구독자 수", "실시간 인기 동영상", "최근 동영상 실적" with the window line before the title).
(() => {
  const s = document.body.innerText, hub = idx('주요 측정항목') >= 0;
  if (!hub) {
    const m28 = s.match(/지난 28일 동안 채널의 조회수가 ([\d,]+)회/), period = (s.match(/(\d{4}\. \d+\. \d+\. ~ \d{4}\. \d+\. \d+\.)/) || [])[1];
    const ri = idx('실시간 업데이트 중'), rt = {}; let k = L.indexOf('인기 콘텐츠', ri); if (k > 0) for (k += 2; k < L.length && L[k] !== '더보기'; k += 2) rt[L[k]] = num(L[k + 1]);
    const li = idx('최신 콘텐츠');
    return { source: 'studio-channel', layout: 'overview', period, views28: m28 ? num(m28[1]) : null, hours28: num(after('시청 시간(단위: 시간)')), subs28: num(after('구독자')),
      realtime: { subscribers: num(L[ri + 1]), views48h: num(L[L.indexOf('조회수 · 지난 48시간') - 1]), top: rt },
      latest: li > 0 ? { title: L[li + 1], window: L[li + 2], views: num(after('조회수', li)), avgPct: pctv(after('평균 조회율', li)), likes: num(after('좋아요', li)) } : null };
  }
  const mi = idx('주요 측정항목'), dates = L.slice(mi, mi + 20).filter(x => /^\d{4}\. \d+\. \d+\.$/.test(x));
  const ti = idx('실시간 인기 동영상'), rt = {}; if (ti > 0) for (let k = ti + 1; k < L.length - 1 && !['콘텐츠', '모두 보기'].includes(L[k]); k += 2) { if (!isNum(L[k + 1])) break; rt[L[k]] = num(L[k + 1]); }
  const li = idx('최근 동영상 실적');
  return { source: 'studio-channel', layout: 'hub', period: dates.length >= 2 ? `${dates[0]} ~ ${dates[dates.length - 1]}` : null,
    views28: num(after('조회수', mi)), hours28: num(after('시청 시간(단위: 시간)', mi)), subs28: num(after('구독자 수', mi)),
    realtime: { subscribers: num(after('총 구독자 수')), views48h: num(after('48시간 조회수')), top: rt },
    latest: li > 0 ? { title: L[li + 2], window: L[li + 1], views: num(after('조회수', li)), avgPct: pctv(after('평균 조회율', li)), likes: num(after('좋아요', li)) } : null };
})()
