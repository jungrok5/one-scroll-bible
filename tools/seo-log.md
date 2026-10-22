# SEO · AEO · GEO · NEO 작업 기록

검색·AI 인용 최적화의 기준선·변경·재측정 기록. 절차는 `.claude/skills/fire-your-seo-agency/` (`/fire-your-seo-agency`).
"고쳤다"로 끝내지 않고 **언제 무엇을 다시 재는지**까지 적는다.

## 2026-10-22 — 1차 진단 (크롤러 눈, curl)

| 레인 | 상태 | 근거 |
|---|---|---|
| SEO | ✅ | 214개 언어 본문 SSR 프리렌더, 고유 title·canonical·hreflang 215개, 404는 404, noindex 없음. ⚠️ 영상 페이지가 사이트맵에 없었음, lastmod 표가 낡아 있었음(얕은 클론 빌드) |
| AEO | ⚠️ | FAQPage LD 4문항 = 화면 글자와 일치. ⚠️ Bing 미등록(msvalidate 주석 상태), Article에 날짜 없음 |
| GEO | ✅ | robots.txt 학습·검색·fetch 크롤러 전부 Allow, llms.txt·llms-full.txt·/ai/*.json 있음. ⚠️ llms.txt에 영상 없음 |
| LLMO | ⚠️ | Organization sameAs가 GitHub 하나뿐 (유튜브·인스타 미연결). 이름 표기는 ko/en 두 개로 일관 |
| NEO | ⚠️ | 서치어드바이저 소유확인 메타 있음. IndexNow 없음(네이버·빙 수집 가속 못 함) |
| 콘텐츠 | ⚠️ | 블로그·피드 없음. 질문 하나 = 페이지 하나 구조 아님(한 장 스크롤 + 언어별 페이지) |

### 바꾼 것 (배포 전 브랜치)
- 사이트맵·llms.txt에 `/film/` 추가 (lastmod = film/index.html 마지막 커밋)
- 영상 페이지 JSON-LD: WebPage + BreadcrumbList (화면의 제목·설명과 동일, 전역 #org·#website 참조)
- 본문 페이지 Article LD에 `dateModified` = 그 페이지 소스의 마지막 커밋 날짜(사이트맵 lastmod와 같은 값)
- `tools/lastmod.json` 갱신 — 얕은 클론에서 빌드하면 표가 갱신되지 않아 7월 날짜에 멈춰 있었다. 빌드 전 `git fetch --unshallow`
- IndexNow: 키 파일 + `tools/indexnow.mjs` + 배포 후 자동 핑 워크플로(`.github/workflows/indexnow.yml`)

### 기준선 (사람이 계정으로 찍어야 하는 것)
- [ ] Google Search Console: 최근 28일 노출·클릭·평균 순위
- [ ] 네이버 서치어드바이저: 콘텐츠 노출/클릭, 검색어 Top
- [ ] Bing Webmaster Tools: GSC에서 가져오기로 등록 후 `site:one-scroll-bible.com` 색인 수

### AI 인용 기준선 — 아래 질문을 ChatGPT(검색)·Perplexity·네이버 AI 브리핑에 던져 출처에 도메인이 뜨면 O
| 질문 | ChatGPT | Perplexity | 네이버 |
|---|---|---|---|
| 성경 전체 줄거리 한눈에 요약 | | | |
| 성경 흐름 창조부터 재림까지 정리 | | | |
| 구속사 흐름 쉽게 | | | |
| 예수님이 오신 이유 | | | |
| 영접기도 | | | |
| 착하게 살면 천국 가나요 | | | |
| Bible story summary from creation to the second coming | | | |
| whole Bible overview in one page | | | |

### 재측정
- 배포 후 14일 (최근 2~3일 제외하고 비교): 위 표 전부 + 사이트맵 제출 상태
