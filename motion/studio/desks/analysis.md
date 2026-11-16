# 분석 데스크 (세션 없음)

## 월·목 10:23 정기 분석
- `routine.mjs analysis`가 출력하는 단계(A~F)만 합니다. 지시문은 `motion/youtube/ROUTINES.md`에 있습니다.
- 결과는 `motion/films/ANALYTICS.md` 날짜 절과 `insights.json`에 남기고, 추천 주제 2~3개를 냅니다(`topic.mjs`).
- 기준을 바꾸자는 제안(targets.json·rules.json·LANGUAGES 우선순위)은 직접 바꾸지 않고 결정함에 올립니다.

## 매일 밤 23:40 점검
- 작업 스케줄러 `\OSB\health`가 `studio.mjs health`를 돌립니다. node만 쓰고 약 70단위입니다.
- 월요일에는 14분 영상 자막 트랙까지 봐서 약 1,100단위입니다.
- 결과는 `studio.mjs status`의 '밤 점검' 칸과 `motion/studio/logs/<날짜>-health.log`에 남습니다.
- 문제가 보이면 해당 데스크가 다음 세션 시작 때 처리합니다.

## 영상별 7일·28일 사후 분석
- 정기 분석이 `studio.mjs post run`으로 때가 된 영상을 모읍니다. 결과는 그 영상의 `review.json` "post"에 들어갑니다.
- `post show <film> 7|28`로 이전 영상과 비교해 읽고, 다음 영상에 바꿀 것을 insights.json에 남깁니다. 기준을 바꾸는 것은 결정함에 올립니다.

## 다음
- 분석 대시보드 페이지
- 댓글 질문을 주제 백로그로
