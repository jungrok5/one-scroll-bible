// YouTube Studio → channel analytics overview (studio.youtube.com/channel/<id>/analytics/tab-overview/period-default):
// the 28-day totals, the realtime box (subscribers, views in the last 48 h and its top content), the latest upload.
(() => {
  const s = document.body.innerText, m28 = s.match(/지난 28일 동안 채널의 조회수가 ([\d,]+)회/), period = (s.match(/(\d{4}\. \d+\. \d+\. ~ \d{4}\. \d+\. \d+\.)/) || [])[1];
  const ri = idx('실시간 업데이트 중'), rt = {}; let k = L.indexOf('인기 콘텐츠', ri); if (k > 0) for (k += 2; k < L.length && L[k] !== '더보기'; k += 2) rt[L[k]] = num(L[k + 1]);
  const li = idx('최신 콘텐츠');
  return { source: 'studio-channel', period, views28: m28 ? num(m28[1]) : null, hours28: num(after('시청 시간(단위: 시간)')), subs28: num(after('구독자')),
    realtime: { subscribers: num(L[ri + 1]), views48h: num(L[L.indexOf('조회수 · 지난 48시간') - 1]), top: rt },
    latest: li > 0 ? { title: L[li + 1], window: L[li + 2], views: num(after('조회수', li)), avgPct: pctv(after('평균 조회율', li)), likes: num(after('좋아요', li)) } : null };
})()
