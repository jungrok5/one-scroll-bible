# 11. 외국어 자막 27개 — {film}
README 4절 8·9: 번역 → 원문 대조 → 원어민 검수 → MED 고치면 재검수 → .vtt 눈 확인 → 업로드. HIGH/MED 남으면 그 언어는 올리지 않는다(번역 품질 관문).
목록은 `pipeline/targets.json` captions.langs(고정 27개 + ko, 바꾸려면 관리자 결정). **국제판(10단계)과 동시에** 돌린다(관리자 2026-11-15 "병렬로").
1. 지시문: `node motion/films/i18n-brief.mjs {film} --point "<이 영상의 핵심 낱말>"` → `motion/films/{film}/i18n/CAPTIONS-BRIEF.md`(줄 id·인용·표기는 원고에서 자동).
   en.json(10단계 1)이 먼저 있어야 한다 — 모든 번역의 뜻 기준.
2. 번역: captions.groups 묶음마다 에이전트 하나를 **한 번에** — 지시문 `pipeline/briefs/translate.md`({film}, {codes}, {scratch} = 그 묶음만의 임시 폴더
   scratchpad\tr-<묶음>\ — 같은 이름의 임시 파일로 다른 묶음을 덮어쓴 일이 있었다). 결과 `i18n/<code>.json` + `backtr-<code>.md`, check-quotes 15/15.
3. 원어민 검수: 번역 묶음이 끝나는 대로 같은 묶음에 하나 — `pipeline/briefs/review-captions.md` → `motion/reviews/film-{film}-captions-<묶음>.md`.
   HIGH/MED는 review.json `intl_progress.owner`에 모아 관리자 확인 뒤 고치고(confirm-agent-fixes), 고친 줄만 새 검수 에이전트로 다시 본다.
   LOW·원문 그대로인 구절 범위 조정은 재검수 없이.
4. 자막 파일: `captions-on-ko.mjs {film} <lang…>`(한국어판 = 한국어 해설 시각) / `--timing en`(국제판 = 영어 해설 시각) → .vtt를 언어마다 눈으로(특히 1번 줄).
5. 올리기: 한국어판·국제판의 **세로·가로 모두(4편)**에 화면 위쪽 .vtt — 스튜디오 `motion/youtube/studio-caption.js`(할당량 없음), 그 뒤 우리 자막이 있는 언어의
   자동 자막 지우기(`yt-api.mjs asr-off`). 기록: 한국어판 uploaded.json `{film}.captions`, 국제판 `global.films.{film}.h|v.captions`.
