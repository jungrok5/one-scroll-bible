# 분석 설정 가이드 — GA4 · 유튜브 · 인스타 (브라우저를 직접 조작하는 세션용)

이 문서는 **사람 계정으로 로그인된 브라우저를 조작할 수 있는 Claude 세션**(로컬 세션)이 그대로 따라 하도록 쓴 절차다.
사이트 코드 쪽 추적은 이미 배포돼 있다(이벤트 목록: `AGENTS.md`의 "GA4 events"). 여기서 할 일은 계정 화면에서만 할 수 있는 세 가지다.

| 파트 | 어디서 | 왜 |
|---|---|---|
| A | Google Analytics 4 | 이벤트에 붙어 오는 값(장면·언어·목적지…)을 보고서에서 보이게 등록, 핵심 이벤트 지정 |
| B | 저장소 + YouTube Studio | 영상 설명란의 사이트 링크를 언어 홈 + UTM 으로 바꿔 유튜브에서 온 방문을 언어·영상별로 구분 |
| C | Instagram | 프로필 링크에 UTM |

## 지켜야 할 것

- **이 문서에 적힌 것만 바꾼다.** 제목·썸네일·공개 상태·예약 시각·재생목록·관련 동영상·자막·태그는 건드리지 않는다.
- 결제, 권한 부여, 계정 연결, 데이터 공유 설정, 데이터 보존 기간 같은 **다른 설정 화면이 나오면 멈추고 사용자에게 묻는다.**
- 화면 문구는 언어 설정에 따라 한국어/영어로 다르다 — 아래에 둘 다 적었다. 메뉴 위치가 문서와 다르면 추측하지 말고 스크린샷으로 확인한다.
- 한 묶음을 끝낼 때마다 결과를 이 문서 맨 아래 **작업 기록**에 적고 커밋한다(커밋 규칙은 `AGENTS.md`).

---

## A. Google Analytics 4

속성: **one-scroll-bible.com**, 측정 ID `G-JTXXC8TYVX` (사이트·영상·지도·소개 페이지 모두 같은 속성).

### A1. 맞춤 측정기준 등록 (이벤트 범위)

경로: 왼쪽 아래 **관리(Admin, 톱니)** → 속성 열 **데이터 표시(Data display)** → **맞춤 정의(Custom definitions)**
→ **맞춤 측정기준 만들기(Create custom dimension)**.

각 줄마다: 측정기준 이름 = 아래 "표시 이름", **범위(Scope) = 이벤트(Event)**, 설명 = 아래 "설명", 이벤트 매개변수(Event parameter) = 아래 "매개변수"(글자 그대로) → 저장.
이미 같은 매개변수로 등록된 것이 있으면 건너뛴다. 매개변수 칸 드롭다운에 아직 안 보이면 직접 입력한다(처음 받은 날부터 목록에 뜬다).

| 매개변수 | 표시 이름 | 설명 |
|---|---|---|
| `language` | Site language | 페이지·영상 언어 코드 (GA 기본 "언어"=브라우저 언어와 다름) |
| `page_type` | Page type | maps / about (본문·영상 페이지는 비어 있음) |
| `scene` | Scene | 영상 장면 id 또는 본문 장면 번호 |
| `scene_index` | Scene index | 영상 장면 순번 0–20 |
| `section` | Section | 도달한 섹션 (hero, gospel, respond, ot, paul …) |
| `percent` | Percent | 영상 실제 시청 진행률 10/25/50/75/90, 본문 스크롤 깊이 |
| `position_sec` | Film position (s) | 영상에서 멈추거나 떠난 위치(초) |
| `watched_sec` | Watched (s) | 그때까지 실제로 본 시간(초) |
| `dest` | Film button destination | 첫 화면 영상 버튼: youtube / film |
| `video_id` | YouTube video id | 영상 버튼이 연 유튜브 영상 |
| `to` | Navigated to | 사이트 안 이동 대상: film / maps / about / languages / home |
| `host` | Outbound host | 바깥 링크 도메인 |
| `orientation` | Orientation | 영상 가로 h / 세로 v |
| `map` | Map | 지도: ot / jesus / paul |
| `method` | Share method | 공유 방법: native / copy / qr / 채널 |
| `dir` | Direction | 이전 prev / 다음 next |
| `q` | FAQ question | 펼친 FAQ 번호 |
| `ref` | Verse ref | 누른 성경 구절 |

완료 확인: 맞춤 측정기준 목록에 위 18개가 모두 "이벤트" 범위로 보인다. **값은 등록한 날부터 쌓이고 과거로 소급되지 않는다.**

### A2. 핵심 이벤트(전환) 지정

경로: **관리 → 데이터 표시 → 이벤트(Events)** → 아래 이벤트 줄의 **"핵심 이벤트로 표시(Mark as key event)"** 별/토글을 켠다.
목록에 아직 없으면(최근 발생 전) **관리 → 데이터 표시 → 핵심 이벤트(Key events) → 새 핵심 이벤트(New key event)** 에 이름을 그대로 입력한다.

- `prayer_complete` — 영접 기도를 끝까지 읽음 (이 사이트의 목적)
- `prayer_view` — 영접 기도 섹션에 도달
- `film_complete` — 영상 페이지에서 끝까지 시청
- `film_cta_click` — 첫 화면 영상 버튼 클릭

### A3. 확인

1. 시크릿 창으로 `https://one-scroll-bible.com/?utm_source=setup_test` 를 연다 → "14분 영상으로 보기" 버튼을 누른다(유튜브 새 탭은 닫아도 됨).
2. GA4 **보고서 → 실시간(Realtime)** 의 "이벤트 수(Event count by Event name)" 카드에 `film_cta_click` 이 1분 안에 보이면 성공.
3. 그 이벤트를 눌러 매개변수에 `dest = youtube`, `language = ko` 가 보이면 측정기준 이름과 매개변수가 맞다.

---

## B. 유튜브 설명란 링크 (저장소에서 생성 → Studio에 반영)

**지금 상태**: 설명란 링크가 영상 페이지(`/film/?lang=…`)를 가리킨다. 사이트의 영상 버튼이 이제 유튜브로 보내므로 서로를 가리키는
고리가 됐다. 링크는 **그 언어의 사이트 첫 페이지**(복음·영접 기도가 이어지는 곳)로 보내고, 출처 꼬리표(UTM)를 붙인다.

### B1. 생성기 수정 — `motion/youtube/manifest.mjs` (단일 출처)

1. 영화 설명의 링크: `page` 대신 아래 주소를 쓴다.
   ```js
   const home = L => `${SITE}/${L === 'ko' ? '' : L + '/'}`;
   const utm = (medium, campaign, content) =>
     `?utm_source=youtube&utm_medium=${medium}&utm_campaign=${campaign}` + (content ? `&utm_content=${content}` : '');
   // 영화:  home(L) + utm('video',  `film_${L}`)
   // 쇼츠:  home(L) + utm('shorts', `shorts_${L}`, name)      // name = 'NN-<scene>' (예: 13-cross)
   ```
   매니페스트의 `page` 필드(영상 페이지 주소)는 다른 용도가 있을 수 있으니 그대로 두고, 설명란에 쓰는 링크만 바꾼다.
2. 문구: `motion/youtube/lang/<code>.json` 의 `watch` 는 "글로 천천히 읽기 · 영상 페이지" 두 가지를 말한다. 링크가 첫 페이지 하나가
   되므로 **" · " 뒤 부분(영상 페이지)을 지운다** — 예: `Read the whole story slowly · the film page` → `Read the whole story slowly`.
   새 문장을 쓰지 말고 지우기만 한다(번역 품질 게이트). `short_tail` 은 그대로 둔다.
3. `node motion/youtube/manifest.mjs` → `manifest.md` 에서 두 언어(ko, en)의 설명을 눈으로 확인: 링크가 `https://one-scroll-bible.com/en/?utm_source=youtube&utm_medium=video&utm_campaign=film_en` 꼴이고 나머지 줄은 그대로인지.
4. 커밋·푸시.

### B2. Studio에 반영

대상: `motion/youtube/uploaded.json` 의 영상 — 가로 영상(`film`)에서 상태가 public 인 12개, 그리고 기록된 쇼츠.
**설명란만** 새 manifest 의 `description` 으로 바꿔 저장한다(기존 스튜디오 도우미 `studio-upload.js` / `studio-shorts.js` 에 설명만
갱신하는 경로가 있으면 그걸 쓰고, 없으면 영상 세부정보 화면에서 설명 칸만 교체).

1. **먼저 한 개만**(한국어 가로 영상 `66VfBSXxAs8`) 바꾸고, 공개 페이지에서 링크를 눌러 첫 페이지가 열리는지 확인한 뒤 나머지를 한다.
2. 예약된 쇼츠는 **예약 시각·공개 범위를 다시 고르지 않는다** — 설명만 바꾸고 저장.
3. 결과를 `uploaded.json` 각 항목의 `note` 에 "description UTM 2026-MM-DD" 로 남긴다.

선택(권장): 각 가로 영상에 **고정 댓글** 한 줄 — 그 언어의 `respond.h3`(사이트 팩의 이미 번역된 "그래서, 나는 어떻게?" 문구) +
`home(L) + utm('video', 'film_' + L, 'pinned') + '#respond'` (영접 기도 섹션으로 바로 감). 새 번역 문장은 만들지 않는다.

---

## C. 인스타그램 프로필 링크

계정 **one.scroll.bible** → **프로필 편집(Edit profile)** → **링크(Links)** → 사이트 링크를 아래로 바꾸고 저장.
```
https://one-scroll-bible.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio
```
게시물·릴스 캡션의 링크는 바꾸지 않는다(인스타는 캡션 링크를 누를 수 없음).

---

## D. 끝난 뒤

1. 시크릿 창에서 바꾼 링크 하나씩(유튜브 1개, 인스타 1개)을 눌러 사이트가 열리는지 확인.
2. 다음 날 GA4 **보고서 → 획득 → 트래픽 획득**에서 "세션 소스/매체"에 `youtube / video`, `youtube / shorts`, `instagram / social` 이 보이는지.
3. 아래 작업 기록을 채우고 커밋. 사용자에게: 바꾼 것 개수, 확인 결과, 멈춘 곳과 이유.

## 작업 기록

| 날짜 | 파트 | 한 일 | 확인 |
|---|---|---|---|
| | A1 | 맞춤 측정기준 __/18 | |
| | A2 | 핵심 이벤트 __/4 | |
| | B1 | manifest.mjs·lang 파일 수정 | |
| | B2 | 설명 갱신: 가로 __/12 · 쇼츠 __ | |
| | C | 인스타 프로필 링크 | |
