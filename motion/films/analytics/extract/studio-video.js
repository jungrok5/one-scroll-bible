// YouTube Studio → one video's analytics, any tab (reach · engagement · audience · Shorts overview). Run it on each of the
// three tabs (sources.json lists the URLs); fields a tab does not show come back null. Values are "since published".
// Two layouts: the old tabs and, from 2026-11-16, the hub pages the tab-* URLs redirect to (hub_reach · hub_engagement ·
// hub_audience): "순 시청자" (not 순 시청자수), "구독자 수", lists that start after "총 트래픽 점유율 / x%", "평균 조회율" and
// "00:30 지점에서 계속 시청 중" printed AFTER their value, 연령 and 성별 as two lists, 구독자 시청 시간 as "value / label" pairs.
(() => {
  const at = (label, d) => { const i = idx(label); return i < 0 ? null : L[i + d]; };
  const first = (...xs) => xs.find(x => x != null) ?? null;
  // one list after a section title — skips the "조회수 • 게시 이후" line and the "총 트래픽 점유율 / x%" total; stops at the first
  // line that is not "name / x%"; "x% / name" pairs (구독자 시청 시간) are read the other way round
  const sec = label => { const i = idx(label); if (i < 0) return null; const o = {}; let k = i + 1;
    while (k < L.length && (/•/.test(L[k]) || L[k] === '게시 이후')) k++;
    if (L[k] === '총 트래픽 점유율' || L[k] === '전체 트래픽 대비 비율:') k += 2;
    if (/%$/.test(L[k] || '') && L[k + 1] && !/%$/.test(L[k + 1])) { for (; k < L.length - 1 && /%$/.test(L[k]) && !/%$/.test(L[k + 1]); k += 2) o[L[k + 1]] = pctv(L[k]); return o; }
    for (; k < L.length - 1 && /%$/.test(L[k + 1] || '') && !/%$/.test(L[k]); k += 2) o[L[k]] = pctv(L[k + 1]);
    return Object.keys(o).length ? o : null; };
  const ret = (document.body.innerText.match(/(\d+)%의 시청자가 약 0:30 지점/) || [])[1];
  const hubPct = label => { const v = at(label, -1); return /%$/.test(v || '') ? pctv(v) : null; };
  const old = pairs('연령 및 성별'), g = {}, a = {}; for (const [k, v] of Object.entries(old)) (/세/.test(k) ? a : g)[k] = v;
  return { source: 'studio-video', id: (location.pathname.match(/video\/([\w-]{11})/) || [])[1], tab: (location.pathname.match(/(?:tab|hub)[-_](\w+)/) || [])[1],
    impressions: num(after('썸네일 노출수')), ctr: pctv(after('썸네일 클릭률')), views: num(after('조회수')), uniqueViewers: num(first(after('순 시청자수'), after('순 시청자'))),
    subs: num(first(after('구독자'), after('구독자 수'))), engagedViews: num(after('유효 조회수')), hours: num(after('시청 시간(단위: 시간)')),
    avgDuration: after('평균 시청 지속 시간'), avgPct: first(hubPct('평균 조회율'), pctv(after('평균 조회율'))),   // hub first: there after() would reach the next block's "65.4%" (0:30 retention)
    // hub Shorts overview: "55.3% / 계속 시청함 / 44.7% / 이탈함" — the value comes BEFORE its label (after() would read 이탈함's)
    keptWatching: at('계속 시청함', 2) === '이탈함' ? hubPct('계속 시청함') : pctv(after('계속 시청함')), at30s: ret ? +ret / 100 : hubPct('00:30 지점에서 계속 시청 중'),
    likeRatio: first(pctv(L[idx('좋아요(싫어요 대비)') + 3]), pctv(after('좋아요 및 싫어요 비율'))), endScreenCtr: pctv(L[idx('엔딩 화면 요소 클릭률') + 3]),
    shares: num(after('공유')), likes: num(after('좋아요')), comments: num(after('댓글')),
    traffic: first(sec('트래픽 소스'), sec('시청자가 이 동영상을 찾은 경로')), shortsTraffic: sec('상위 트래픽 소스'),
    external: sec('외부 사이트 또는 앱'), related: sec('이 동영상을 추천하는 콘텐츠'), searchTerms: sec('YouTube 검색어'), playlists: sec('이 동영상을 추천하는 재생목록'),
    viewerType: sec('시청 행동별 시청자 구분'), device: sec('기기 유형'),
    gender: Object.keys(old).length ? { gender: g, age: a } : { gender: sec('성별') || {}, age: sec('연령') || {} },
    subscriberShare: sec('구독자 시청 시간'), countries: sec('많이 본 지역'), captions: sec('인기 자막 언어'),
    abTest: (document.body.innerText.match(/A\/B 테스트[\s\S]{0,200}?(완료됨|\d+일 \d+시간 남음|정보가 부족)/) || [])[1] || null };
})()
