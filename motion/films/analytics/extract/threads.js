// Threads → insights (threads.com/insights): the latest posts with their views (the first line of each post is its title).
(() => {
  const posts = []; let start = idx('최신 게시물') + 1;
  for (let k = start; k < L.length; k++) if (L[k] === '조회수' && isNum(L[k - 1])) { posts.push({ title: L[start], views: num(L[k - 1]) }); start = k + 1; }
  return { source: 'threads', posts };
})()
