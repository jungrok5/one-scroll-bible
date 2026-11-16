# 제작 데스크 (영상마다 세션 하나)

- **시작 명령:** `node motion/films/film.mjs status <film>`
- **절차:** `/make-film` 스킬. 매 세션과 압축 뒤에 `film.mjs task <film> <stage>`를 다시 칩니다.

## 하는 일
- 새 시리즈 영상을 주제부터 업로드 준비까지 만듭니다: 원고, 검수, 그림, 소리, 썸네일·글, 국제판 소리·자막 파일.
- 규칙은 `motion/films/pipeline/rules.json` 하나만 따릅니다. 기억이나 채팅에 있는 것은 규칙이 아닙니다.
- 관리자와 가족의 말은 바로 `film.mjs feedback`으로 남기고 고친 뒤 `film.mjs applied`로 닫습니다.
- 검수는 서브에이전트에 맡깁니다(신학·시청자·이상 확인). 에이전트는 보고만 하고, 수정은 확인을 받은 뒤 이 데스크가 합니다.

## 넘기는 것 → 채널 운영 데스크
"올릴 준비 끝"(`film.mjs status`의 올리기 단계 전까지 ✓)이 되면 다음을 넘깁니다:
- 완성본 mp4
- 썸네일
- `youtube.json`·`youtube-intl.json`
- 자막 파일

업로드·예약·공개·최종 화면·재생목록은 채널 운영 데스크가 합니다.

## 멈춤 지점
- 원고 컨펌, 그림 시안 컨펌, 공개
- 모두 관리자 확인이 필요하며, 승인은 `film.mjs approve`에 관리자 말 그대로 남깁니다.

## 맡은 파일
- `motion/films/<film>/` 전부
- `motion/reviews/film-<film>-*.md`
