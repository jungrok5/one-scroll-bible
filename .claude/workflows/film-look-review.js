export const meta = {
  name: 'film-look-review',
  description: "A film's picture scored scene by scene by four fixed reviewers against the first film — scores, swipe points, fixes with times; report only",
  phases: [{ title: 'Review', detail: 'art director · novice 63 on a phone · believer 48 on TV · technical, in parallel' }],
}
// Stage 4 of the film pipeline (motion/films/film.mjs task <film> picture). Same reviewers, same brief, same output every time.
// args: the JSON from `node motion/films/pipeline/look-sheets.mjs <film>` (motion/out/look-review/<film>/args.json):
//   { film, render, first_film_sheet, scenes: [{ scene, a, b, times, sheet, look, lines, stats }] }
// The main session saves the result as motion/reviews/film-<film>-look.json and renders it with
// `node motion/films/pipeline/look-md.mjs <film>` (the picture gate reads that json and checks it belongs to the current render).
const A = typeof args === 'string' ? JSON.parse(args) : args
if (!A || !A.film || !Array.isArray(A.scenes)) throw new Error('args = look-sheets.mjs output { film, scenes, … }')

const sceneList = A.scenes.map((s, i) => `${i + 1}. ${s.scene} (${s.a}–${s.b}s) — 그림: ${s.sheet} (네 장: ${s.times.join('s, ')}s)
   화풍: ${s.look ? `${s.look.look} · ${s.look.source}${s.look.new ? ' · 이번에 새로 만든 화풍' : ''}` : '(표에 없음)'}
   화면 글: ${s.lines.length ? s.lines.join(' / ') : '(없음)'}
   수치: 밝기 ${s.stats.luma}(${s.stats.vs_first_film.luma}) · 가장 밝은 곳 ${s.stats.p98}(${s.stats.vs_first_film.p98}) · 채도 ${s.stats.sat}(${s.stats.vs_first_film.sat}) · 움직임 ${s.stats.motion}(${s.stats.vs_first_film.motion}) · 정지 ${Math.round(s.stats.held * 100)}%`).join('\n')

const BASE = `영상 「${A.film}」의 그림을 장면마다 보고 점수를 매긴다. 보고만 한다(파일을 고치지 않는다).
${A.ori === 'h' ? '이번에 보는 것은 가로판(16:9)이다 — 거실 TV로 보는 60대 이상이 주 시청자다(해설판 시청의 35%가 TV). 그림 한 장은 네 칸(왼쪽 위 → 오른쪽 위 → 왼쪽 아래 → 오른쪽 아래가 시간 순서). 세로판을 가로로 옮기며 생긴 문제(인물이 잘림, 빈 양옆, 너무 작은 주인공, 글자와 겹침)를 특히 본다.' : '세로 쇼츠(9:16, 3분 이하)가 메인이다.'} 대상은 성경을 잘 모르는 크리스천이다. 화면 글은 성경 인용(개역개정)과 해설 자막이다.
기준(넘어야 할 막대)은 이 채널의 첫 영상이다: ${A.first_film_sheet ? `${A.first_film_sheet} (${A.ori === 'h' ? '첫 영상 14분 가로판의 여덟 장면' : '첫 영상 쇼츠 여덟 편의 한 장면씩'})을 먼저 Read로 본다.` : ''}
첫 영상의 원칙: 카메라가 공간을 지나가는 영화 같은 화면, 빛이 주인공, 작은 인물, 절제, 포스터·인포그래픽·만화 금지, 그림 위에 글씨(그림의 일부로서의 글자) 금지, 휴대폰에서 무엇인지 읽혀야 함, 어두움(dim)은 괜찮지만 캄캄함(dark)은 안 됨.
장면마다 그림 파일을 Read로 열어 네 장을 본다(시간 순서). 수치의 괄호는 첫 영상 21편과 비교한 위치다.

장면 목록:
${sceneList}

장면마다: 점수 0–10(정수, 7 = 첫 영상과 같은 수준, 5 이하 = 내보내면 안 됨), 이 장면에서 넘기고 싶어지는가(swipe), 한 줄 평.
고칠 점: BLOCKER(내보내면 안 됨) · MAJOR(꼭 고침) · MINOR · NOTE로 나누고, 장면 이름과 초(at), 무엇이 문제인지, 구체적으로 어떻게 고칠지(그릴 것·빛·카메라·색·크기)를 적는다. 한국어로.`

const REVIEWERS = [
  { key: 'director', who: '아트 디렉터(첫 영상을 만든 사람의 눈)', prompt: `너는 이 채널 첫 영상의 아트 디렉터다. 장면마다 첫 영상 수준에 닿는지, 화풍이 그 장면의 말씀에 맞는지, 장면이 바뀔 때 화풍이 바뀌는 것이 리듬이 되는지 지루함이 되는지 본다.
영화 레퍼런스(촬영·조명)로 말하고, 고칠 점은 실제로 그릴 수 있는 지시로 쓴다.` },
  { key: 'novice63', who: '성경 잘 모르는 크리스천(63세, 휴대폰, 1번 대상)', prompt: `너는 63세, 교회는 다니지만 성경을 거의 읽어 본 적이 없는 크리스천이다. 휴대폰으로 유튜브를 본다. 눈이 예전 같지 않다.
그림에서 무엇이 보이는지(사람인지, 아기인지, 무엇을 하는지) 모르겠는 곳, 어두워서 안 보이는 곳, 같은 그림이 오래 이어져 지루한 곳을 솔직하게 짚는다. 점수는 네가 실제로 느끼는 대로.` },
  { key: 'tv48', who: '성경 잘 아는 신자(48세, 거실 TV)', prompt: `너는 48세, 성경을 여러 번 통독한 신자다. 거실 큰 TV로 본다. 큰 화면에서는 거친 붓질·흐린 형태·반복되는 무늬가 더 잘 보인다.
그림이 말씀을 정확하게 보여 주는지(마구간·목자·영광·십자가가 본문과 맞는지), 큰 화면에서 어색한 곳을 짚는다.` },
  { key: 'tech', who: '기술 검수(프레임·글자·전환)', prompt: `너는 영상 후반 작업 기술 검수자다. 글자가 그림 위에서 잘 읽히는지(대비·띠), 잘리거나 겹치는 것, 장면 전환의 튐, 형태가 깨지거나 얼룩지는 곳, 같은 수치 경고(첫 영상 하위 10%)가 실제로 문제인지 본다.
수치가 낮아도 그림이 의도대로 읽히면 문제 아님이라고 적는다.` },
]
const SCHEMA = {
  type: 'object',
  properties: {
    scenes: { type: 'array', items: { type: 'object', properties: { scene: { type: 'string' }, score: { type: 'integer', minimum: 0, maximum: 10 }, swipe: { type: 'boolean' }, note: { type: 'string' } }, required: ['scene', 'score', 'swipe', 'note'] } },
    fixes: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['BLOCKER', 'MAJOR', 'MINOR', 'NOTE'] }, scene: { type: 'string' }, at: { type: 'number' }, what: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'scene', 'what', 'fix'] } },
    summary: { type: 'string' },
  },
  required: ['scenes', 'fixes', 'summary'],
}

phase('Review')
const results = await parallel(REVIEWERS.map(r => () =>
  agent(`${BASE}\n\n${r.prompt}`, { label: `look:${r.key}`, phase: 'Review', schema: SCHEMA }).then(v => ({ key: r.key, who: r.who, ...v }))))
return { film: A.film, ori: A.ori || 'v', render: A.render, at: A.at || '', reviewers: results }
