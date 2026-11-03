// YouTube Studio → one video's analytics, any tab (reach · engagement · audience · Shorts overview). Run it on each of the
// three tabs (sources.json lists the URLs); fields a tab does not show come back null. Values are "since published".
(() => {
  const section = (label, extra) => { const i = idx(label); if (i < 0) return {}; const j = extra ? L.indexOf(extra, i) : i; return pairs(L[j] || label, j > 0 ? j - 1 : i); };
  const ret = (document.body.innerText.match(/(\d+)%의 시청자가 약 0:30 지점/) || [])[1];
  const ext = (() => { const i = idx('외부 사이트 또는 앱'); if (i < 0) return null; const o = {}; for (let k = L.indexOf('전체 트래픽 대비 비율:', i) + 2; k < L.length && L[k] !== '더보기'; k += 2) if (/%$/.test(L[k + 1] || '')) o[L[k]] = pctv(L[k + 1]); else break; return o; })();
  const rel = (() => { const i = idx('이 동영상을 추천하는 콘텐츠'); if (i < 0) return null; const o = {}; for (let k = L.indexOf('전체 트래픽 대비 비율:', i) + 2; k < L.length && L[k] !== '더보기'; k += 2) if (/%$/.test(L[k + 1] || '')) o[L[k]] = pctv(L[k + 1]); else break; return o; })();
  return { source: 'studio-video', id: (location.pathname.match(/video\/([\w-]{11})/) || [])[1], tab: (location.pathname.match(/tab-(\w+)/) || [])[1],
    impressions: num(after('썸네일 노출수')), ctr: pctv(after('썸네일 클릭률')), views: num(after('조회수')), uniqueViewers: num(after('순 시청자수')), subs: num(after('구독자')),
    engagedViews: num(after('유효 조회수')), hours: num(after('시청 시간(단위: 시간)')), avgDuration: after('평균 시청 지속 시간'), avgPct: pctv(after('평균 조회율')),
    keptWatching: pctv(after('계속 시청함')), at30s: ret ? +ret / 100 : null, likeRatio: pctv(L[idx('좋아요(싫어요 대비)') + 3]), endScreenCtr: pctv(L[idx('엔딩 화면 요소 클릭률') + 3]),
    traffic: pairs('트래픽 소스'), shortsTraffic: pairs('상위 트래픽 소스'), external: ext, related: rel,
    viewerType: pairs('시청 행동별 시청자 구분'), device: pairs('기기 유형'), gender: (() => { const o = pairs('연령 및 성별'); const g = {}, a = {}; for (const [k, v] of Object.entries(o)) (/세/.test(k) ? a : g)[k] = v; return { gender: g, age: a }; })(),
    subscriberShare: pairs('구독자 시청 시간'), countries: pairs('많이 본 지역'), captions: pairs('인기 자막 언어'), abTest: (document.body.innerText.match(/A\/B 테스트[\s\S]{0,200}?(\d+일 \d+시간 남음|정보가 부족)/) || [])[1] || null };
})()
