# 언어 데스크

**시작 명령:** `node motion/youtube/film14.mjs status`

정책은 [`motion/youtube/LANGUAGES.md`](../../youtube/LANGUAGES.md) §4-1에, 규칙은 `motion/youtube/film14.json`에 있습니다.

## 하는 일

**14분 영상의 언어 확장**
- 음악판, 해설판(가로·세로), 화면 글자 자막, 사이트 버튼을 만듭니다.
- 언어 하나가 작업 하나입니다. 같은 체크리스트를 돌립니다(번역 → 원어민 검수 → 녹음 → 배포).
- 해설판 관문은 `film14.mjs narr-check <lang>`입니다. 성경 낭독 허락은 결정함 D5입니다.

**사이트 언어**
- `/add-language` 스킬을 따릅니다.
- 품질 관문: 역번역이 맞고, 원어민 검수에 풀리지 않은 BLOCKER/MAJOR가 없어야 합니다. 통과하지 못하면 미룹니다. 정확성이 규모보다 먼저입니다.

**영상 자막 번역**
- 새 영상의 자막 27개 번역은 제작 데스크가 요청하면 이 데스크의 절차로 합니다(`/add-film-language`).

## 넘기는 것 → 채널 운영 데스크
- 언어별 mp4·자막 파일
- `film14.json` 단계 표시

업로드와 물결 공개는 채널 운영 데스크가 합니다.

## 멈춤 지점
- 해설판 1분 시험본 승인
- 공개

## 맡은 파일
- `motion/youtube/film14.json`
- `motion/narration/`
- `i18n/`
- `motion/youtube/LANGUAGES.md` (바뀔 때마다 고칩니다)
