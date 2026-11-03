// Instagram professional dashboard → insights, last 7 days (instagram.com/accounts/insights/?timeframe=7).
(() => {
  const top = []; let k = idx('조회수 기준 인기 콘텐츠'); if (k > 0) for (k += 2; k < L.length && /^\d/.test(L[k]) && /월/.test(L[k + 1] || ''); k += 2) top.push({ views: num(L[k]), date: L[k + 1] });
  const ik = idx('반응'), ti = []; let j = idx('반응 기준 인기 콘텐츠'); if (j > 0) for (j += 2; j < L.length && /^\d/.test(L[j]) && /월/.test(L[j + 1] || ''); j += 2) ti.push({ interactions: num(L[j]), date: L[j + 1] });
  return { source: 'instagram', views: num(L[idx('계정 인사이트') + 2]), followerShare: num(L[idx('팔로워') + 1]) / 100, nonFollowerShare: num(after('팔로워가 아닌 사람')) / 100,
    reached: num(after('조회한 사람')), interactions: num(L[ik + 1]), engagedAccounts: num(after('참여한 계정')), profileVisits: num(after('프로필 방문')),
    followers: num(L[idx('총 팔로워') - 1]), topByViews: top, topByInteractions: ti };
})()
