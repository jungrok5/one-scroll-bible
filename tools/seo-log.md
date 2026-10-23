# SEO · AEO · GEO · NEO 작업 기록

검색·AI 인용 최적화의 기준선·변경·재측정 기록. 절차는 `.claude/skills/fire-your-seo-agency/` (`/fire-your-seo-agency`).
"고쳤다"로 끝내지 않고 **언제 무엇을 다시 재는지**까지 적는다.

## 2026-10-22 — 1차 진단 (크롤러 눈, curl)

| 레인 | 상태 | 근거 |
|---|---|---|
| SEO | ✅ | 214개 언어 본문 SSR 프리렌더, 고유 title·canonical·hreflang 215개, 404는 404, noindex 없음. ⚠️ 영상 페이지가 사이트맵에 없었음, lastmod 표가 낡아 있었음(얕은 클론 빌드) |
| AEO | ⚠️ | FAQPage LD 4문항 = 화면 글자와 일치. Bing Webmaster Tools 등록됨(메타가 아닌 다른 방식으로 확인). ⚠️ Article에 날짜 없음, Bing 권고: 설명·제목이 짧은 페이지·링크 부족 |
| GEO | ✅ | robots.txt 학습·검색·fetch 크롤러 전부 Allow, llms.txt·llms-full.txt·/ai/*.json 있음. ⚠️ llms.txt에 영상 없음 |
| LLMO | ⚠️ | Organization sameAs가 GitHub 하나뿐이었음 → 유튜브·인스타 추가. 이름 표기는 ko/en 두 개로 일관 |
| NEO | ⚠️ | 서치어드바이저 소유확인 메타 있음. IndexNow 없음(네이버·빙 수집 가속 못 함) |
| 콘텐츠 | ⚠️ | 블로그·피드 없음. 질문 하나 = 페이지 하나 구조 아님(한 장 스크롤 + 언어별 페이지) |

### 바꾼 것 (배포 전 브랜치)
- 사이트맵·llms.txt에 `/film/` 추가 (lastmod = film/index.html 마지막 커밋)
- 영상 페이지 JSON-LD: WebPage + BreadcrumbList (화면의 제목·설명과 동일, 전역 #org·#website 참조)
- 본문 페이지 Article LD에 `dateModified` = 그 페이지 소스의 마지막 커밋 날짜(사이트맵 lastmod와 같은 값)
- `tools/lastmod.json` 갱신 — 얕은 클론에서 빌드하면 표가 갱신되지 않아 7월 날짜에 멈춰 있었다. 빌드 전 `git fetch --unshallow`
- Organization sameAs: YouTube @one-scroll-bible · Instagram one.scroll.bible · GitHub
- IndexNow: 키 파일 + `tools/indexnow.mjs` + 배포 후 자동 핑 워크플로(`.github/workflows/indexnow.yml`)

### 기준선 (사람이 계정으로 찍어야 하는 것)
- [x] Google Search Console: 최근 28일 노출·클릭·평균 순위 (2026-10-23, 아래)
- [x] 네이버 서치어드바이저 (2026-10-23, 사용자 확인 · 최근 30일 PC+모바일): **클릭 4**(지난달 대비 −55.6%) · **노출 약 570**(+62%) · CTR 0.7%.
  하루 노출 10→40 사이로 오름세(9-23 ~10, 10-11 정점 40), 클릭은 하루 0~1.
  검색어 Top: 성경 이야기 1클릭/42노출 · 핵심성경 이야기 1/2 · 성경의하나님의약속 1/1 · 한눈에 들어오는 성경 1/1 ·
  **성경이야기 0/136** · 이야기 성경 0/39 · 이야기성경 0/37 · 예수님이라면 어떻게 하실까 줄거리 0/17 · **한눈에 보는 성경 0/14** · baebele 0/9.
  → 노출이 가장 많은 "성경이야기"와 우리 이름에 가까운 "한눈에 보는 성경"이 클릭 0 — 네이버 검색 결과의 제목·설명(스니펫)을 다음 측정 때 직접 확인할 것
- [ ] Bing Webmaster Tools(등록됨): 검색 성능 28일 + AI Performance(베타) + 권고 목록 + IndexNow 탭에서 핑 수신 확인

### AI 인용 기준선 (Perplexity 2026-10-23, jungrok5 로그인, 출처 "링크" 탭 기준: 1/8 · ChatGPT 로그아웃 검색 0/3, 나머지는 로그인 필요 · 네이버는 브라우저 확장이 막아 사용자 확인 필요) — 아래 질문을 ChatGPT(검색)·Perplexity·네이버 AI 브리핑에 던져 출처에 도메인이 뜨면 O
| 질문 | ChatGPT | Perplexity | 네이버 |
|---|---|---|---|
| 성경 전체 줄거리 한눈에 요약 | X (이미지 출처만) | O | 확장 프로그램이 막음 |
| 성경 흐름 창조부터 재림까지 정리 | X (BibleProject) | X (TGC·BibleGateway·블로그) | 확장 프로그램이 막음 |
| 구속사 흐름 쉽게 | X (BibleProject) | X (네이버 블로그·유튜브) | 확장 프로그램이 막음 |
| 예수님이 오신 이유 | — (로그아웃: 웹 검색 없이 답함) | X (열린교회·Logos·GTY) | 확장 프로그램이 막음 |
| 영접기도 | — (로그아웃: 웹 검색 없이 답함) | X (ddaglebible·유튜브·교회 사이트) | 확장 프로그램이 막음 |
| 착하게 살면 천국 가나요 | 로그인 필요 | X (국민일보·티스토리·브런치) | 확장 프로그램이 막음 |
| Bible story summary from creation to the second coming | 로그인 필요 | X (TGC·Wikipedia·BibleGateway) | 확장 프로그램이 막음 |
| whole Bible overview in one page | 로그인 필요 | X (Desiring God·Tyndale·American Bible) | 확장 프로그램이 막음 |

### 기준선 — Google Search Console (2026-10-23, 계정 ju…@gmail.com, 속성 https://one-scroll-bible.com/)
- 실적, 지난 28일(2026-09-23 ~ 10-20): **클릭 24 · 노출 424 · CTR 5.7% · 평균 게재순위 7.1**
- 검색어(전부 5개): 성경 지도 0/6 · 성경지도 0/1 · kapernaum karte 0/1 · ስነ ፍጥረት ትግርኛ 0/1 · salmo 35 na papiamentu 0/1 (클릭/노출)
- 페이지 색인: **색인됨 179 · 안 됨 69** (크롤링됨-색인 안 됨 66, 404 2, 다른 표준 선택 1)
- 사이트맵: 6-17 제출, **6-19 이후 안 읽힘(발견 45)** → 10-23 재제출, 즉시 읽혀 **445** 성공
- `/film/`: "발견됨 - 현재 색인이 생성되지 않음"(크롤링 전) → 색인 생성 요청
- GA4 연결: 6-17 연결은 데이터 없는 "Domain" 스트림에 붙어 있었음 → 10-23 해제하고 "메인" 스트림(실제 측정)에 다시 연결. GA 자연검색 보고서는 이날부터 채워지는지 재측정 때 확인

### 재측정
- 배포 후 14일 (최근 2~3일 제외하고 비교): 위 표 전부 + 사이트맵 제출 상태

## 2026-10-22 — 배포 확인 · Bing 권고
- 배포 확인(curl): 라이브 사이트맵에 `/film/` (lastmod 2026-10-22), IndexNow 키 파일 서빙, Organization sameAs 3개
- IndexNow 첫 자동 실행: 4개 URL → `202 Accepted`
- Bing 권고 ① **메타 설명이 짧음 — 88페이지** (언어 페이지 중앙값 80자, 197개가 100자 미만): 공유 문장 뒤에 이미 번역·검수되어
  본문에 보이는 13개 시대 제목을 160자 안에서 덧붙임(새 번역 문장 없음) → 214개 페이지 109~160자. 공유 카드 문구는 그대로.
  남은 것: 지도 페이지 10개(주로 한자·가나 언어)가 100자 미만
- Bing 권고 ② **고품질 도메인의 인바운드 링크 부족**: 백링크 구매·교환은 하지 않는다. 정공법 = 우리 공식 표면(유튜브 설명·
  인스타 프로필·GitHub 저장소 홈페이지 칸)에서 사이트로 링크, 실제 교회·선교 단체가 쓰고 소개하는 것
- 설명 배포 후 자동 핑은 4개뿐이었다(언어 페이지의 lastmod는 각 언어 팩 날짜라 틀 변경이 안 잡힘) → 214개 언어 페이지를 수동으로
  IndexNow 핑(200 OK). 워크플로 수정: index.html·build-pages.mjs가 바뀐 푸시는 전 언어 페이지를 핑(`--all-langs`)
- 영상 페이지 VideoObject(유튜브 66VfBSXxAs8, 14:20, 21개 Clip) 배포·라이브 확인. 페이지에 유튜브 플레이어가 없어 구글 영상
  리치 결과는 기대치 낮음 — 효과는 사이트↔유튜브 엔티티 연결
