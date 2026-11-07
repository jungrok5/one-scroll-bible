export const meta = {
  name: 'film-script-review',
  description: 'A film script read by four fixed reviewers (theology + three viewers), scores per part, issues by severity — report only',
  phases: [{ title: 'Review', detail: 'theology · novice 63 · believer 48 · non-believer 34, in parallel' }],
}
// Stage 3 of the film pipeline (motion/films/film.mjs task <film> review). Same reviewers, same brief, same output every time.
// args: { film: '<folder under motion/films>' }. The result is saved by the main session as motion/reviews/film-<film>-script.json
// and rendered with `node motion/films/pipeline/review-md.mjs <film>` (the gate reads that .md).
const film = (args && args.film) || args, AT = (args && args.at) || ''  // Date is unavailable in workflow scripts: pass args.at
if (!film || typeof film !== 'string') throw new Error('args.film is required')

const BASE = `영상 「${film}」의 원고를 읽고 보고만 한다(파일을 고치지 않는다).
읽을 것: motion/films/${film}/script.json(줄마다 id·part·kind·text·cite), motion/films/${film}/review.json의 parts(부 이름·느낌·핵심 줄·이야기)와 logline.
영상은 세로 쇼츠가 메인(3분 이하)이고, 화면 글자는 성경 인용(개역개정 그대로)과 해설 자막이다.
부(part)마다 감동 0–5, 전율 0–5를 정수로 매기고, 넘기고 싶어지는 순간이 있으면 그 줄 id와 이유를 적는다.
고칠 점은 BLOCKER(내보내면 안 됨) · MAJOR(꼭 고침) · MINOR · NOTE로 나누고, 줄 id와 구체적인 대안 문장을 함께 낸다. 한국어로.`

const REVIEWERS = [
  { key: 'theology', who: '관점 검수자', prompt: `너는 복음주의·개혁주의 구속사 관점과 개역개정을 기준으로 원고를 검수한다(웨스트민스터 신앙고백·대소교리를 안다).
성경 본문을 바꾸거나 잇대어 새 문장을 만든 곳, 교리적으로 틀리거나 오해를 부를 표현, 본문이 말하지 않는 것을 단정한 곳, 민감한 주제의 표현을 찾는다.
점수는 1번 대상(성경 잘 모르는 크리스천)이 받을 감동·전율을 네가 추정해 매긴다.` },
  { key: 'novice63', who: '성경 잘 모르는 크리스천(63세, 1번 대상)', prompt: `너는 63세, 교회는 다니지만 성경을 거의 읽어 본 적이 없는 크리스천이다. 휴대폰과 TV로 유튜브를 보고, 어려운 말이나 낯선 이름이 나오면 넘긴다.
네가 실제로 느낄 감동·전율을 솔직하게 매기고, 무슨 말인지 모르겠는 곳(이름·지명·연결)을 꼭 짚는다.` },
  { key: 'believer48', who: '성경 잘 아는 신자(48세, TV로 봄)', prompt: `너는 48세, 성경을 여러 번 통독한 신자다. 주로 거실 TV로 본다. 이미 아는 이야기라 새로 보이는 연결이 있어야 전율을 느낀다.
본문 연결의 정확성, 뻔한 곳, 더 강한 구절이 있는 곳을 짚는다.` },
  { key: 'nonbeliever34', who: '비신자(34세)', prompt: `너는 34세, 교회에 다니지 않는 사람이다. 쇼츠 피드에서 우연히 이 영상을 만났다. 종교적 강요로 느껴지는 곳, 첫 3초에 넘길 이유, 끝까지 보게 만드는 것을 솔직히 말한다.
(이 채널의 우선순위는 1번 대상이므로 네 의견은 참고로만 쓰인다.)` },
]
const SCHEMA = {
  type: 'object',
  properties: {
    parts: { type: 'array', items: { type: 'object', properties: { part: { type: 'string' }, gamdong: { type: 'integer', minimum: 0, maximum: 5 }, jeonyul: { type: 'integer', minimum: 0, maximum: 5 }, swipe: { type: 'string' } }, required: ['part', 'gamdong', 'jeonyul'] } },
    issues: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['BLOCKER', 'MAJOR', 'MINOR', 'NOTE'] }, line: { type: 'string' }, text: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'text'] } },
    summary: { type: 'string' },
  },
  required: ['parts', 'issues', 'summary'],
}

phase('Review')
const results = await parallel(REVIEWERS.map(r => () =>
  agent(`${BASE}\n\n${r.prompt}`, { label: `review:${r.key}`, phase: 'Review', schema: SCHEMA }).then(v => ({ key: r.key, who: r.who, ...v }))))
return { film, at: AT, reviewers: results }
