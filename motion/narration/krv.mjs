// 개역개정(대한성서공회 bskorea.or.kr) 본문을 글자 그대로 가져온다 — 내레이션 원고의 인용 확인용.
//   node motion/narration/krv.mjs gen.1.3 jhn.1.14 isa.53.5 …   (책 코드는 bskorea 의 3글자: gen exo … jhn rom rev)
// 각주 표시(“4)”)와 팝업 주석은 뺀다. 같은 장은 한 번만 받는다.
const cache = {};
async function chapter(book, chap) {
  const k = book + chap; if (cache[k]) return cache[k];
  const r = await fetch(`https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE&book=${book}&chap=${chap}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  let t = new TextDecoder('utf-8').decode(await r.arrayBuffer());
  t = t.replace(/<div[^>]*class=D2[\s\S]*?<\/div>/g, '').replace(/<font[^>]*class=smallTitle[\s\S]*?<\/font>/g, '');
  const body = t.replace(/<span class="number">\s*(\d+)(&nbsp;)*\s*<\/span>/g, '\n@@$1@@').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
  const v = {}; for (const m of body.matchAll(/@@(\d+)@@([^@]*)/g)) v[m[1]] = m[2].split('성경 단어 검색')[0].replace(/[0-9ㄱ-ㅎ]+\)/g, '').replace(/\s+/g, ' ').trim();
  // the last verse of a section can carry the next section's heading (e.g. "… 떠나가시니라 창으로 옆구리를 찌르다") — check by eye
  return (cache[k] = v);
}
for (const ref of process.argv.slice(2)) {
  const [book, chap, vs] = ref.toLowerCase().split('.');
  const v = await chapter(book, chap); const [a, b = a] = vs.split('-');
  const text = []; for (let i = +a; i <= +b; i++) text.push(v[i] ?? `[없음 ${i}]`);
  console.log(`${ref}\t${text.join(' ')}`);
}
