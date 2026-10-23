# 분석·검색 등록 가이드 — GA4 · 유튜브 · 인스타 · 검색엔진 (브라우저를 직접 조작하는 세션용)

이 문서는 **사람 계정으로 로그인된 브라우저를 조작할 수 있는 Claude 세션**(로컬 세션)이 그대로 따라 하도록 쓴 절차다.
사이트 코드 쪽 추적은 이미 배포돼 있다(이벤트 목록: `AGENTS.md`의 "GA4 events"). 여기서 할 일은 계정 화면에서만 할 수 있는 것들이다. 순서는 A → B → C → E → D(마무리).

| 파트 | 어디서 | 왜 |
|---|---|---|
| A | Google Analytics 4 | 이벤트에 붙어 오는 값(장면·언어·목적지…)을 보고서에서 보이게 등록, 핵심 이벤트 지정 |
| B | 저장소 + YouTube Studio | 영상 설명란의 사이트 링크를 언어 홈 + UTM 으로 바꿔 유튜브에서 온 방문을 언어·영상별로 구분 |
| C | Instagram | 프로필 링크에 UTM |
| E | 검색엔진 도구 · 유튜브 채널 · GitHub | 남은 등록(사이트맵 제출·연결·다음 검색 등록), 재측정용 기준선, AI 인용 확인 |

## 지켜야 할 것

> **계정 확인 — 무엇이든 바꾸기 전에 반드시.** 사용자는 구글 계정이 여러 개이고, 유튜브 채널은 브랜드 계정일 수 있다.
> 각 서비스 화면에 들어갈 때마다(아래 표의 순서대로) 바꾸기 **전에** 멈추고 사용자에게 이렇게 보여 준 뒤 **"맞다"는 답을 받고** 진행한다.
> - 서비스 이름, 지금 로그인된 계정 이름·이메일(화면 오른쪽 위 프로필에 보이는 그대로), 선택된 속성·사이트·채널 이름
>   (예: GA4 속성 "one-scroll-bible.com · G-JTXXC8TYVX", 서치콘솔 속성 `one-scroll-bible.com`, 유튜브 채널 `@one-scroll-bible`)
> - 그 화면의 스크린샷
>
> 사용자가 아니라고 하거나 답이 없으면 그 서비스는 건드리지 않는다. 계정 전환이 필요하면 사용자가 직접 바꾸게 하고 다시 확인받는다.
> 이메일·계정 이름을 짐작해서 고르지 않는다. 확인받은 계정은 아래 작업 기록의 "계정" 칸에 적는다(이메일은 앞 두 글자만, 예: `ju…@gmail.com`).
>
> | 확인 지점 | 맞아야 하는 것 |
> |---|---|
> | A. GA4 | 측정 ID `G-JTXXC8TYVX` 가 있는 속성 |
> | B2·E6. YouTube Studio | 채널 `@one-scroll-bible` (영상 66VfBSXxAs8 이 보이는 채널) |
> | C. Instagram | 계정 `one.scroll.bible` |
> | E1–E2. Search Console | 속성 `one-scroll-bible.com` (GA4 와 같은 구글 계정이어야 연결 가능) |
> | E3. 네이버 서치어드바이저 | 사이트 목록에 `one-scroll-bible.com` 이 있는 네이버 계정 |
> | E4. Bing Webmaster | 사이트 `one-scroll-bible.com/` 이 있는 계정 |
> | E5. 다음 웹마스터도구 | 사용자가 정해 준 카카오 계정 (새로 등록하므로 어느 계정으로 할지 먼저 묻는다) |
> | E7. GitHub | 저장소 `jungrok5/one-scroll-bible` 의 About 편집 권한이 있는 계정 |

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
**주의**: 언어 매개변수 이름은 `site_language` 다. `language` 는 gtag 가 예약 필드(브라우저 언어 `ul`)로 가져가 이벤트 매개변수로 오지 않는다(2026-10-23 실시간 확인 후 이름 변경, 예전 "Site language"(`language`) 측정기준은 보관 처리).
이미 같은 매개변수로 등록된 것이 있으면 건너뛴다. 매개변수 칸 드롭다운에 아직 안 보이면 직접 입력한다(처음 받은 날부터 목록에 뜬다).

| 매개변수 | 표시 이름 | 설명 |
|---|---|---|
| `site_language` | Site language | 페이지·영상 언어 코드 (GA 기본 "언어"=브라우저 언어와 다름) |
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
목록에 아직 없으면(최근 발생 전) 같은 화면의 **이벤트 만들기(Create event)** → 이벤트 이름 입력 → **주요 이벤트로 표시** 켬
(기본 값은 "설정 안함", 계산은 "이벤트당 한 번") → 생성 방법 **코드로 만들기(Create with code)** → 만들기. (2026-10 화면에는 "새 핵심 이벤트" 버튼이 없다.)

- `prayer_complete` — 영접 기도를 끝까지 읽음 (이 사이트의 목적)
- `prayer_view` — 영접 기도 섹션에 도달
- `film_complete` — 영상 페이지에서 끝까지 시청
- `film_cta_click` — 첫 화면 영상 버튼 클릭

### A3. 확인

1. 시크릿 창으로 `https://one-scroll-bible.com/?utm_source=setup_test` 를 연다 → "14분 영상으로 보기" 버튼을 누른다(유튜브 새 탭은 닫아도 됨).
2. GA4 **보고서 → 실시간(Realtime)** 의 "이벤트 수(Event count by Event name)" 카드에 `film_cta_click` 이 1분 안에 보이면 성공.
3. 그 이벤트를 눌러 매개변수에 `dest = youtube`, `site_language = ko` 가 보이면 측정기준 이름과 매개변수가 맞다.

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
**설명란 전체를 바꾸지 말고, 사이트 링크가 있는 줄만** 새 manifest 의 해당 줄로 바꾼다. 영상마다 스튜디오에서 손본 설명이 있을 수
있다 — 특히 한국어 가로 영상 `66VfBSXxAs8` 은 사용자 승인으로 첫 문단·해시태그·챕터 이름을 따로 다듬었으므로 manifest 설명과 다르다.
도우미: `motion/youtube/studio-describe.js` (기존 링크 줄을 찾아 그 줄만 바꾸고, 저장 뒤 예약 시각이 그대로인지 영상 데이터로 확인).

1. **먼저 한 개만**(한국어 가로 영상 `66VfBSXxAs8`) 바꾸고, 공개 페이지에서 링크를 눌러 첫 페이지가 열리는지 확인한 뒤 나머지를 한다.
2. 예약된 쇼츠는 **예약 시각·공개 범위를 다시 고르지 않는다** — 설명만 바꾸고 저장. 저장할 때마다 예약 시각(`scheduledPublishingDetails`)과
   관련 동영상이 그대로인지 다시 읽어 확인한다(스튜디오의 예약 시간 칸은 목록에서 고르지 않은 값을 0시로 저장한 적이 있다).
3. 결과를 `uploaded.json` 각 항목의 `note` 에 "description UTM 2026-MM-DD" 로 남긴다.

선택: 각 가로 영상에 **고정 댓글** 한 줄 — 그 언어의 `respond.h3`(사이트 팩의 이미 번역된 "그래서, 나는 어떻게?" 문구) +
`home(L) + utm('video', 'film_' + L, 'pinned') + '#respond'` (영접 기도 섹션으로 바로 감). 새 번역 문장은 만들지 않는다.
**채널 이름으로 공개 글을 쓰는 일이므로 문구를 보여 주고 사용자 허락을 받은 뒤에만** 단다.

---

## C. 인스타그램 프로필 링크

계정 **one.scroll.bible** → **프로필 편집(Edit profile)** → **링크(Links)** → 사이트 링크를 아래로 바꾸고 저장.
```
https://one-scroll-bible.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio
```
게시물·릴스 캡션의 링크는 바꾸지 않는다(인스타는 캡션 링크를 누를 수 없음).

---

## E. 검색엔진 등록 · 기준선 · 연결

SEO 작업 기록(`tools/seo-log.md`)의 **"기준선"과 "AI 인용 기준선"** 표를 채우는 단계이고, 11월 5일 재측정이 이 값과 비교한다.
숫자는 화면에 보이는 그대로 적고, 못 찾은 값은 비워 두고 이유를 적는다(추정해서 채우지 않는다).

### E1. Google Search Console (search.google.com/search-console)
속성 `one-scroll-bible.com`(또는 `https://one-scroll-bible.com/`).
1. **Sitemaps**: `sitemap.xml` 이 제출돼 있고 상태가 "성공(Success)"인지. 없으면 `sitemap.xml` 입력 → 제출. 발견된 URL 수를 적는다(약 445).
2. **실적(Performance)** → 기간 "지난 28일": 총 클릭·총 노출·평균 CTR·평균 게재순위를 적는다. "검색어(Queries)" 탭 상위 10개도 적는다.
3. **페이지 색인 생성(Pages)**: 색인됨/색인 안 됨 수.
4. **URL 검사**: `https://one-scroll-bible.com/film/` → 색인 안 됐으면 "색인 생성 요청(Request indexing)".

### E2. GA4 ↔ Search Console 연결
GA4 **관리 → 제품 링크(Product links) → Search Console 링크** → 연결 → 위 속성 선택 → 웹 스트림 선택 → 제출.
(GA 보고서에서 검색어별 유입을 볼 수 있게 된다. 다른 제품 링크 — Google Ads 등 — 는 만들지 않는다.)

### E3. 네이버 서치어드바이저 (searchadvisor.naver.com)
사이트는 이미 소유 확인돼 있다(사이트에 `naver-site-verification` 메타).
1. **요청 → 사이트맵 제출**: `https://one-scroll-bible.com/sitemap.xml` 이 있는지, 없으면 제출.
2. **검증 → robots.txt**: 수집 허용(Yeti)으로 나오는지.
3. **요청 → 웹 페이지 수집**: `https://one-scroll-bible.com/`, `https://one-scroll-bible.com/film/` 수집 요청.
4. **리포트 → 검색 유입 / 콘텐츠 노출 및 클릭**: 최근 28일 노출·클릭과 검색어 상위 10개를 적는다.

### E4. Bing Webmaster Tools (bing.com/webmasters)
등록·소유 확인은 돼 있다.
1. **사이트맵**: `sitemap.xml` 제출·성공 상태 확인.
2. **IndexNow**: 최근 제출 내역에 우리 주소가 보이는지(배포마다 자동 핑 — 2026-10-22에 4개 + 214개 제출).
3. **검색 성능**(최근 28일 노출·클릭)과 **AI Performance**(Copilot 인용 수) 값을 적는다.
4. **Recommendations**: "Meta descriptions too short" 페이지 수를 적는다(10-22 기준 88 → 다시 스캔되면 줄어야 함).

### E5. 다음(카카오) 웹마스터도구 (webmaster.daum.net) — 아직 미등록
한국 검색 점유율 3위. 등록하려면 다음이 주는 **PIN 줄을 robots.txt 에 넣어야** 한다.
1. 사이트 등록 → `https://one-scroll-bible.com` 입력 → 화면에 나오는 `#DaumWebMasterTool:…` 한 줄을 **글자 그대로** 복사.
2. 저장소 `robots.txt` 맨 위 주석 줄들 아래에 그 줄을 붙여 커밋하고, **사용자에게 배포 허락을 받은 뒤** main 에 반영
   (`AGENTS.md`의 배포 절차). 배포가 라이브에 반영되면(`curl https://one-scroll-bible.com/robots.txt` 로 확인) 다음 화면에서 인증 → 사이트맵 제출.

### E6. 유튜브 채널 링크
YouTube Studio → **맞춤설정(Customization) → 기본 정보(Basic info) → 링크(Links)**: 사이트 링크가 없으면 추가
(제목 "한눈에 보는 성경 이야기", 주소 `https://one-scroll-bible.com/?utm_source=youtube&utm_medium=channel&utm_campaign=about`).
채널 설명의 다른 문구는 바꾸지 않는다. (사이트의 구조화 데이터가 이미 이 채널을 공식 계정으로 가리키므로 양쪽이 서로를 가리키게 된다.)

### E7. GitHub 저장소
브라우저보다 GitHub CLI 가 확실하다(로그인 계정은 `gh auth status` 로 확인 — `jungrok5`):
```
gh repo edit jungrok5/one-scroll-bible --homepage https://one-scroll-bible.com \
  --add-topic bible --add-topic gospel --add-topic christianity --add-topic multilingual --add-topic redemptive-history
```
(설명 문구가 비어 있으면 `--description` 에 README 첫 문장을 그대로 쓴다.) 브라우저로 할 때: 오른쪽 **About 옆 톱니** → Website · Topics → Save.

### E8. AI 인용 기준선
`tools/seo-log.md` 의 "AI 인용 기준선" 표 질문 8개를 **로그아웃 상태 또는 새 대화**에서 그대로 묻는다.
- ChatGPT(검색 켜기), Perplexity, 네이버(앱 또는 웹 검색 → AI 브리핑).
- 답의 출처 목록에 `one-scroll-bible.com` 이 있으면 O, 없으면 X. 다른 사이트가 인용되면 어느 사이트인지 짧게 적는다.
- 답 내용을 길게 옮겨 적지 않는다.
- 로봇 확인(CAPTCHA)이 나오면 풀지 말고 멈춘다 — 그 서비스는 사용자가 직접 하도록 표에 "사용자 확인 필요"로 남긴다.

---

## D. 끝난 뒤

1. 시크릿 창에서 바꾼 링크 하나씩(유튜브 1개, 인스타 1개)을 눌러 사이트가 열리는지 확인.
2. 다음 날 GA4 **보고서 → 획득 → 트래픽 획득**에서 "세션 소스/매체"에 `youtube / video`, `youtube / shorts`, `instagram / social` 이 보이는지.
3. 아래 작업 기록과 `tools/seo-log.md` 기준선 표를 채우고 커밋. 사용자에게: 바꾼 것 개수, 확인 결과, 멈춘 곳과 이유.

## 작업 기록

| 날짜 | 파트 | 계정(사용자 확인) | 한 일 | 확인 |
|---|---|---|---|---|
| 2026-10-23 | A1 | ju…@gmail.com (속성 one-scroll-bible, G-JTXXC8TYVX = 스트림 "메인") | 맞춤 측정기준 18/18 — 이후 `language` 가 gtag 예약 필드라 안 온다는 걸 A3 에서 확인 → 사이트 매개변수를 `site_language` 로 바꾸고, 예전 Site language 보관·새로 등록 | 목록 18개 이벤트 범위 |
| 2026-10-23 | A2 | ju…@gmail.com | 핵심 이벤트 4/4 (prayer_complete·prayer_view 별표, film_complete·film_cta_click 은 "이벤트 만들기 → 코드로 만들기") | 주요 이벤트 탭 4개 ★ |
| 2026-10-23 | A3 | ju…@gmail.com | 실시간: film_cta_click 1건(주요 이벤트로 집계), dest=youtube, video_id 옴. language 없음 → 위 A1 수정(배포 후 site_language 재확인) | 실시간 카드 |
| 2026-10-23 | B1 | (저장소) | manifest.mjs: 설명 링크 = 언어 첫 페이지 + UTM(영화 video/film_<L>, 쇼츠 shorts/shorts_<L>/NN-<scene>), lang 16개 `watch` 의 " · 영상 페이지" 삭제; 스튜디오 도우미 studio-describe.js | ko·en 설명 눈으로 확인 |
| 2026-10-23 | E7 | jungrok5 (gh) | 바꿀 것 없음 — Website `https://one-scroll-bible.com`, Topics 에 bible·gospel·christianity·multilingual·redemptive-history 이미 있음 | `gh repo view` |
| 2026-10-23 | B2 | 채널 @one-scroll-bible | 설명 갱신: 가로 12/12 · 쇼츠 84/84 (ko·en·es·pt-BR). 한국어 가로 영상은 "글로 천천히 읽기" 줄의 주소만. ⚠ 첫 시도에서 탭에 남은 예전 매니페스트 때문에 한국어 설명에 "…: undefined" 가 1~2분 저장됐다가 바로 고침 → studio-describe.js 가 매번 새로 받고 값이 없으면 저장 안 함. 고정 댓글 12/12 (사용자 허락: "유튜브 댓글도달아") — respond.h3 + 언어 첫 페이지 UTM(utm_content=pinned)#respond | 공개 페이지 설명·고정 표시, 쇼츠는 저장 뒤 예약 시각·관련 영상 다시 읽어 84개 모두 그대로 |
| | C | | 인스타 프로필 링크 (사용자: 일단 보류) | |
| 2026-10-23 | E1–E2 | ju…@gmail.com (속성 https://one-scroll-bible.com/) | 사이트맵 재제출(6-19 이후 안 읽혀 45개 → 즉시 445개 성공), 기준선 seo-log.md, /film/ 색인 생성 요청("발견됨 - 색인 안 됨"이었음). GA 연결은 2026-06-17 에 이미 있으나 **데이터 없는 "Domain" 스트림**(15089714499)에 붙어 있음 — 실제 측정은 "메인" 스트림. → 사용자 지시("G4a도 해봐")로 예전 연결 해제 후 **"메인"(15081818451)에 다시 연결** (2026-10-23) | 사이트맵 표·URL 검사 |
| | E3–E4 | | 네이버·빙 기준선, 사이트맵·IndexNow 확인 | |
| | E5 | | 다음 웹마스터도구 PIN → robots.txt (배포 허락 대기) | |
| 2026-10-23 | E6 | 채널 @one-scroll-bible | 바꿀 것 없음 — 채널 링크에 이미 "one-scroll-bible → https://one-scroll-bible.com/" 있음(UTM 없음, 안내대로 그대로 둠). 채널 설명은 비어 있음 | 맞춤설정 → 프로필 |
| 2026-10-23 | E8 | Perplexity: jungrok5 (사용자가 직접 가입한 뒤 로그인) · ChatGPT: 로그아웃 | AI 인용 기준선: Perplexity 8/8 물음 → **1/8 인용**("성경 전체 줄거리 한눈에 요약"), ChatGPT 로그아웃 검색 3개 0/3(이후 웹 검색 없이 답하고 로그인 창), 네이버는 브라우저 확장이 막음. 결과 표는 seo-log.md | Perplexity "링크" 탭 |
