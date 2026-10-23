# 영상 (한눈에 보는 성경 이야기 — 21장면, 약 14분)

사이트의 큰 줄거리를 21개 장면으로 만든 영상입니다. 장면마다 다른 화풍(수묵, 그림자극, 스테인드글라스, 필름…)으로
**코드로 그리며**, https://one-scroll-bible.com/film/ 에서 브라우저가 실시간으로 그립니다(영상 파일 없음).
성경 인용은 원문 그대로입니다(한국어 개역개정, 각 언어는 사이트 팩과 같은 성경).

| 위치 | 무엇 |
|---|---|
| `pilot/<scene>.html` | 장면 21개 (한 파일 = 한 장면). 공통 하네스 `pilot/lib.js` |
| `pilot/<scene>.sound.json` · `pilot/mix.py` | 음악·효과음 큐(ElevenLabs) → `pilot/<scene>.wav` |
| `pilot/i18n/<lang>/<scene>.json` | 번역 파일 — `"한국어 원문": "번역"` (`_ui.json` 플레이어 문구, `_fonts.json` 글꼴) |
| `i18n-scan.mjs` · `i18n-merge.mjs` | 번역할 문구 목록 / 누락·누출 검사 · 언어별 파일 합치기 |
| `sheets.mjs` | 언어별 확인용 컨택트시트 (장면 × 가로·세로) |
| `poster.sh` | 언어별 포스터(제목 카드) |
| `publish-film.py` | 사이트용 게시 → `film/s/` (장면·글꼴 서브셋·m4a·번역 파일) |
| `render.mjs` · `assemble.py` | (선택) MP4 녹화 — 정지 화면 확인은 `--stills`. 유튜브·인스타 업로드용은 `assemble.py h\|v --upload` |
| `I18N.md` · `pilot/SCENES.md` | 번역 지침(상세) · 장면 설명 |

```
node motion/render.mjs h --page pilot/cross.html --stills 3,12          # 정지 화면 → motion/out/
node motion/render.mjs v --page pilot/cross.html --lang en --stills 3   # 세로 · 영어
python3 motion/pilot/mix.py cross                                        # 소리 믹스
python3 motion/publish-film.py                                           # 사이트에 게시(film/s/)
python3 motion/assemble.py h --upload                                    # 전체 영상 + 유튜브 업로드용 사본
```
**장면 하나를 고친 뒤**: 그 장면만 다시 렌더하고 `assemble.py h --upload`를 다시 실행하면 됩니다. 장면 파일을 재압축 없이 이어 붙이고, 업로드용은 장면별로 `out/upcache/`에 저장해 두고 바뀐 장면만 다시 압축하므로 몇 분이면 끝납니다(예전에는 매번 50분). 다른 언어는 `--lang en`, 전체 언어 렌더는 `bash motion/render-lang.sh en`.

**유튜브·인스타에 올릴 때는 반드시 `--upload` 사본(`film-h-upload.mp4`)을 올리세요.** 장면이 바뀌는 곳마다 영상이 잠깐
튀는 문제(일부 폰·일부 화질에서만 보임)를 막도록 2초마다 완전한 화면을 넣고, 앞뒤 참조를 없앤 구조입니다(형식은 아래 **렌더 속도**).
필요: Node + Playwright(Chromium), ffmpeg, Python 3(numpy · fonttools+brotli), `~/.local/share/fonts`의 Noto 글꼴 — 직접 다 갖추기
어려우면 아래 "새 언어로 영상 만들기"처럼 GitHub Actions에서 돌리면 됩니다(로컬에는 Node·git·gh만).
`motion/`은 배포되지 않고(`.vercelignore`), `motion/out/`은 커밋하지 않습니다.

## 새 언어로 영상 만들기 — 전체 과정 (유튜브 업로드 전까지)
사이트에 이미 있는 언어(`i18n/<code>.json`)라면 누구나 같은 순서로 할 수 있습니다. 지휘 도구는 **`node motion/film-lang.mjs`** 하나이고,
무거운 일(컨택트시트, 사이트 글꼴·포스터, 렌더, 썸네일, 릴리즈)은 GitHub Actions(`render-film` 워크플로)가 합니다.
필요한 것: Node 22, git, GitHub CLI(`gh auth login`), 작업 브랜치(main 아님). 번역은 사람이든 AI 에이전트든 같은 파일 형식이면 됩니다.

| # | 단계 | 명령 / 할 일 | 결과 |
|---|---|---|---|
| 1 | **번역** | `motion/pilot/i18n/<code>/` — 장면 21개 + `_ui.json`(플레이어 문구, **`cta`** = 언어 페이지의 영상 버튼 글자) + 비라틴 문자면 `_fonts.json`, 그리고 `motion/youtube/lang/<code>.json`(썸네일 문구·유튜브 설명 한 줄·태그). 방법은 `/add-film-language` 스킬 1단계와 `I18N.md` | 번역 파일 |
| 2 | **자동 검사** | `node motion/film-lang.mjs check <code>` — 합치기 + 모든 장면 스캔(빠진 줄, 화면에 남은 한국어) | 21개 "complete" |
| 3 | **눈으로 확인** | 커밋·푸시 후 `node motion/film-lang.mjs ci <code> --steps sheets --wait` → `motion/out/sheets/<code>/`의 그림 42장을 모두 본다(글자 깨짐·넘침·겹침) | 고칠 줄 목록 |
| 4 | **원어민 검토** | `node motion/film-lang.mjs review <code>` → `motion/out/review-<code>.md`를 새 에이전트(또는 사람)에게. HIGH·MED 지적을 모두 반영하고 2단계를 다시, 최종 보고를 **`motion/reviews/<code>.md`**로 저장 | **품질 기준**: 이 파일이 있어야 공개 |
| 5 | **사이트 게시** | `node motion/film-lang.mjs site <code>` (index.html `FILM_CTA`에 버튼 추가 + 페이지 빌드) → 커밋·푸시 → `ci <code> --steps site --wait`(포스터 + `film/s/` 글꼴·언어 파일) → 커밋·푸시 → **main 배포는 관리자 허락 후** → `node motion/film-lang.mjs live <code>` | one-scroll-bible.com/film/?lang=<code> |
| 6 | **유튜브 영상·자료** | `node motion/film-lang.mjs ci <code> --steps "h v kit release" --wait` → 가로 전체 영상·쇼츠 21개는 릴리즈 `youtube-v1`로, 썸네일·업로드 시트·자막은 작업 트리로 → 커밋·푸시 | 업로드 준비 끝 |

- 진행 상황은 언제든 `node motion/film-lang.mjs status` (언어별로 번역·검사·검토·게시·자료·릴리즈가 어디까지 왔는지 표로).
- 여러 언어를 한 번에: 모든 명령이 `<code…>` 여러 개를 받습니다(GitHub은 언어×방향마다 작업을 동시에 돌림).
- 사이트에 게시되는 언어 = `index.html`의 `FILM_CTA`에 있는 언어. `publish-film.py`는 그 언어의 파일만 `film/s/`에 내보내므로,
  검토를 통과하지 않은 번역이 실수로 공개되지 않습니다. 업로드 시트(`manifest.mjs`)도 `motion/reviews/<code>.md`가 있는 언어만 담습니다.
- 유튜브에 올리는 일은 아래 **"유튜브에 올리기"**(스튜디오 도우미, 사람 확인 필요)로 이어집니다.

**어디서 렌더할까** (2026-10-23 측정, 같은 장면·영어 가로): GitHub 러너(4코어) 부활 57초·타락 183초, 이 저장소 관리자의 PC(i5-9600K 6코어)
51초·146초 — PC가 10~20% 빠를 뿐이고 헤드리스 크롬은 GPU를 쓰지 않아 창조 장면 WebGL도 프레임당 0.5초 대 0.6초로 비슷합니다.
GitHub은 언어×방향을 최대 20개 동시에 돌리므로 **여러 언어는 GitHub**(4개 언어 × 가로·세로 ≈ 35분, PC 한 대로는 약 4시간),
**장면 하나 고쳐 보기는 로컬**(`node motion/render.mjs h --page pilot/<scene>.html --lang <code>`)이 낫습니다. 로컬 렌더는 Noto 글꼴이
설치돼 있어야 실제와 같은 글자 모양이 나옵니다(윈도우: `motion/out/fonts`가 아니라 시스템/사용자 글꼴로 설치).

같은 방식을 다른 프로젝트에서 쓰려면 재사용 가능한 스킬 **canvas-film** (github.com/jungrok5/motion-skills)을 쓰면 됩니다.

## 인스타그램 (한국어만)
인스타는 3분이 넘는 릴스를 팔로워가 아닌 사람에게 추천하지 않으므로 7편(3장면씩)과 1분 예고편으로 나눠 올립니다.
`out/<scene>-v.mp4`(장면별 세로 원본)가 있어야 합니다. 결과는 `out/insta/`.
```
python3 motion/social/insta_parts.py [1 2 …]     # 1~7편 (배지 + 다음 편 끝화면), 번호를 주면 그 편만
python3 motion/social/insta_teaser.py            # 1분 예고편 (박자 길이 클립 12개 + 음악 한 곡)
python3 motion/social/insta_covers.py            # 편별 릴스 표지 (세 장면을 작은 액자로 통째로)
python3 motion/social/insta_teaser_cover.py      # 예고편 표지
```
- H.264로 인코딩합니다(인스타 권장). 앱의 "최고 화질로 업로드"를 켜야 화질이 덜 뭉개집니다.
- 끝화면의 장면 이름은 한 줄에 하나씩(한 줄로 이으면 화면 밖으로 넘침). 표지는 가운데 3:4 안에 제목을 둡니다.
- 폰트 경로(`/root/.local/share/fonts/Noto-*.ttf`)는 이 환경 기준이니 다른 곳에서는 바꾸세요.

**렌더 속도** (2026-10 측정, CPU 4코어·GPU 없음):
- 프레임은 화면 캡처 대신 장면 캔버스에서 바로 읽고(픽셀 동일), 처음부터 업로드 형식으로 압축한다 — 합치기는 재압축 없이 이어 붙이기만.
- 업로드 형식 = **H.264 faster, CRF 18, ≤12 Mbps, 닫힌 GOP·2초 키프레임·B프레임 없음**(`osb-upload` 태그). 예전 HEVC 3.6 Mbps
  상한(400 MB 전송 한도용)은 질감 많은 장면을 36 dB로 눌렀고, 지금은 39.6 dB에 압축 CPU가 절반. 가로 전체 영상은 ~0.7 GB가
  되므로 전송은 `zip -s 390m`으로 나눈다. 작은 파일이 필요하면 `--venc x265`.
- **창조 장면의 우주(WebGL)는 언어와 무관** → `out/glcache/creation-<h|v>-<해시>/`에 무손실 PNG로 방향당 한 번 저장(처음 렌더할 때
  자동, 약 25분)하고 모든 언어가 재사용(창조 장면 13분 → 약 1.5분; 셰이더 직접 그리기와 200만 픽셀 중 0~2픽셀 ±1 차이). 캐시 키는
  장면이 정한다(`__glFrame.key`: 셰이더·해상도·타임라인) — 무관한 편집은 캐시를 유지, 셰이더가 바뀌면 자동으로 다시 만든다.
- 측정해 보고 접은 것: 픽셀 그대로 전송(4배 느림), HTTP 전송·작업자 수·압축기 스레드·브라우저 래스터 옵션·글자 비트맵 캐시(모두 차이 없음).
- 한 방향: 약 75분 → 약 30분. `SCENES="rise church" bash motion/render-lang.sh en h`로 일부 장면만 빠르게 시험.

**GitHub Actions** (`.github/workflows/render-film.yml`, 공개 저장소라 무료·동시 20개): `film-lang.mjs ci`가 부르거나 Actions 탭 →
render-film → Run workflow(작업 브랜치 선택)에서 언어와 단계(`sheets site h v kit release`)를 넣습니다. 결과는 아티팩트(3일 보관):
`sheets-<lang>`, `site`, `film-<lang>-h`, `shorts-<lang>`, `kit` — `release` 단계는 영상을 릴리즈(만료 없음)로 옮깁니다.
창조 장면 캐시는 **Actions 캐시에 보관**되어(키 = `creation.html`·`lib.js` 내용) 다음 실행부터는 약 27분짜리 캐시 만들기를 건너뜁니다.
새 머신 준비는 `bash motion/ci-setup.sh`(Noto 글꼴 — 한·중·일·아랍·데바나가리·태국·미얀마·크메르 포함, ffmpeg, Playwright;
`WITH_PYTHON=1`이면 fonttools·brotli·pillow도). 새 문자 체계를 추가하면 그 Noto 글꼴을 `ci-setup.sh` 목록에 넣으세요.

## 유튜브 업로드 자료 — 텔레포트·다른 컴퓨터에서 이어서 할 때
컨테이너를 떠나도 잃지 않도록 **작은 것은 git에, 영상은 GitHub 릴리즈에** 둡니다 (`motion/out/`만 컴퓨터마다 새로 생깁니다).

| 무엇 | 어디 | 다시 만들기 |
|---|---|---|
| 영상 (언어별 가로 전체 + 쇼츠 21개) | **GitHub 릴리즈 `youtube-v1`** — `film-<lang>.mp4`, `shorts-<lang>-NN-<scene>.mp4` | `node motion/film-lang.mjs ci <lang> --steps "h v release"` (예전 실행의 아티팩트를 옮기려면 Actions → **publish-release**에 run id) |
| 업로드 시트 (언어별 제목·설명+챕터·태그·썸네일·자막 경로, 영상+쇼츠 21개, 쇼츠 제목 = 장면 속 문장 훅) | `motion/youtube/manifest.json` (읽기용 `manifest.md`, `shorts-titles.md`) | `node motion/youtube/manifest.mjs` — 영상 번역(`_ui`, 장면 문장)·장면 타이밍·`motion/youtube/lang/<code>.json`에서 만듦 |
| 썸네일 (언어별 4안 + 생성기) | `motion/youtube/thumbs/<lang>/{A-exodus,B-cross,C-split,D-earth}.jpg` | `python3 motion/youtube/thumbs/make.py [lang…]` 또는 `ci … --steps kit` (문구·글꼴은 `motion/youtube/lang/<code>.json`의 `thumb`) |
| 자막 (언어별 전체 영상 + 쇼츠별 SRT) | `motion/subs/<lang>/film-h.srt`, `motion/subs/<lang>/{h,v}/NN-<scene>.srt` | `node motion/subtitles.mjs srt <lang> h` (타임라인은 `motion/subs/timeline-<h\|v>.json`, 장면 타이밍이 바뀐 뒤에만 `scan`) |
| 소리 | 원본 클립 `motion/pilot/audio/*.mp3`(git) + 큐 `pilot/<scene>.sound.json` → 믹스 `pilot/<scene>.wav` | `python3 motion/pilot/mix.py` (wav가 없으면 assemble은 사이트의 `film/s/<scene>.m4a`를 씀 — CI가 만든 영상이 그것) |

```
gh release download youtube-v1 -R jungrok5/one-scroll-bible -p 'film-de.mp4' -p 'shorts-de-*' -D motion/out/release   # 한 언어
gh release download youtube-v1 -R jungrok5/one-scroll-bible -D motion/out/release                                      # 전부 (약 20 GB)
curl -LO https://github.com/jungrok5/one-scroll-bible/releases/download/youtube-v1/film-de.mp4                        # gh 없이 (공개 URL)
```
- 썸네일은 네 안 모두 같은 문구("성경 전체를 14분 만에")에 그림만 다릅니다 — 유튜브 스튜디오 **"테스트 및 비교"**에 세 장까지 넣어
  고르면 됩니다(승자는 시청시간 점유율 기준, 며칠~2주). 오른쪽 아래는 재생시간 배지가 덮으므로 비워 둔 레이아웃입니다.
- **유튜브·인스타에서 사이트로 거는 링크에는 UTM을 붙인다** — GA에서 어느 영상·어느 언어에서 온 방문인지 보인다:
  `https://one-scroll-bible.com/<lang>/?utm_source=youtube&utm_medium=video&utm_campaign=film_<lang>` (쇼츠는 `utm_medium=shorts`,
  `utm_content=NN-<scene>`; 인스타 프로필은 `utm_source=instagram&utm_medium=social&utm_campaign=bio`). 복음·기도로 바로: 끝에 `#respond`.
  canonical 이 정본을 가리키므로 검색 중복 문제는 없다.
- **새 언어 영상을 유튜브에 공개하면** `index.html`의 `FILM_YT`에 그 언어의 영상 id를 넣는다 — 첫 화면 영상 버튼이 `/film/` 대신
  그 유튜브 영상으로 간다(없는 언어는 `/film/?lang=`). 비공개 id는 넣지 않는다('비공개 동영상'이 뜸).
- 쇼츠는 커스텀 썸네일을 받지 않고(영상 프레임 중 선택) 자막은 쇼츠별 SRT(`v/NN-*.srt`)를 올립니다.

## 유튜브에 올리기 — 스튜디오 도우미 (6단계 다음)
브라우저(Claude in Chrome 등)로 채널 **@one-scroll-bible**에 로그인한 스튜디오/시청 페이지에 붙여 넣어 쓰는 도우미들입니다. API 키는 쓰지
않습니다. **공개·게시는 공개적인 행동이므로 관리자 허락을 받은 뒤**에만 합니다. 결과 id·상태는 `motion/youtube/uploaded.json`에 적습니다.

| # | 할 일 | 도우미 | 메모 |
|---|---|---|---|
| 0 | 로컬 파일 서버 | `node motion/youtube/serve.mjs` (켜 둔 채로) | `motion/`을 127.0.0.1:8765에 읽기 전용으로. 스튜디오·유튜브 시청 페이지만 허용 |
| 1 | 영상 내려받기 | `gh release download youtube-v1 -p 'film-<code>.mp4' -D motion/out/release` | 약 0.9 GB |
| 2 | 비공개 업로드 | `studio-upload.js` → `__osbChain(['<code>', …])` (업로드 창 `…/videos/upload?d=ud`) | 제목·설명(챕터)·태그·썸네일 A·아동용 아님·AI 아님·알림 끔(한국어만 켬)·동영상 언어 |
| 3 | 썸네일 A/B + 공개 | `studio-publish.js` → `__osbPublish('<code>', '<id>')` | **처리가 끝난 뒤** 편집 페이지에서(업로드 창에서는 A/B 버튼이 반응 안 함) |
| 4 | 고정 댓글 | `studio-comment.js` → `__osbCommentPrep` → 메뉴 실제 클릭 → `__osbMenuItems` → 고정/수정 (시청 페이지, 파일 머리말 순서대로) | 사이트 FAQ 제목(`faq.h`, 이미 검토된 번역) + 그 언어 첫 페이지 `#faq` |
| 5 | 사이트 버튼 | `index.html`의 `FILM_YT`에 공개 id 추가 → 빌드 → 배포 | 첫 화면 영상 버튼이 유튜브로 감 |
| 6 | 설명 링크만 고칠 때 | `studio-describe.js` → `__osbDescribe(id, '<code>', n?)` | 링크 줄만 바꾸고, 쇼츠는 예약 시각·관련 영상이 그대로인지 다시 읽어 확인 |
| 7 | 쇼츠 예약 | `studio-shorts.js` (`__osbShort`, `__pickTime`) | 예약 시간은 **목록에서 골라야** 함(입력하면 0시로 저장됨) |
| 8 | 언어 재생목록 | `studio-playlist.js` → `__osbPlaylist` + `__plShorts` (파일 머리말 순서대로) | 쇼츠 21편을 예약한 뒤 한 번에: 가로 영상 → 쇼츠 1~21(게시일 오래된순). id는 `uploaded.json` `playlists`. 채널 홈 탭(켜 둠)의 "생성된 재생목록"에 자동으로 뜸 |

| 9 | 자막(검색용) | `node motion/youtube/yt-api.mjs captions [<code>…]` (YouTube Data API) | 영상에 말소리가 없어 자동 자막이 없고, 화면에 박힌 글자는 검색이 못 읽음 → 그 언어 `film-h.srt`를 그 언어 영상에. 스튜디오 화면의 수동 업로드는 스크립트로 넣은 파일을 거부함(2026-10-23) |

**YouTube Data API (한 번만)**: Google Cloud 프로젝트 **`one-scroll-bible`**(jungrok5 계정, 2026-10-23 생성 — YouTube Data API v3·
YouTube Analytics API 사용, OAuth 앱 "one-scroll-bible tools" 외부·**프로덕션**(테스트 중이면 인증이 7일마다 만료), 홈페이지·
처리방침 `/privacy.html`·승인 도메인 one-scroll-bible.com, 테스트 사용자 onescrollbible@ · jungrok5@)에서 남은 것은 관리자가 직접:
사용자 인증 정보 → OAuth 클라이언트 ID(데스크톱 앱) JSON 내려받기 → `node motion/youtube/yt-auth.mjs <그 JSON>` →
**채널 소유 계정 onescrollbible@gmail.com**으로 허용("확인되지 않은 앱" 화면이 나오면 고급 → 이동 — 우리 앱이 맞음). 값은 이 컴퓨터 사용자 환경 변수에만 저장되고 화면·채팅에 나오지 않는다
(JSON은 저장소 밖에 두거나 지운다 — `.gitignore`가 `client_secret*.json`을 막음). 확인: `node motion/youtube/yt-api.mjs whoami`.

**쇼츠 시작 규칙** (`motion/youtube/shorts-open.json`, 2026-10-23 리뷰): 장면은 검은 화면에서 약 1.2초 동안 밝아지고 부활 장면은 첫 4.7초가
거의 무음이라, 쇼츠는 장면 안 1초(십자가 0초, 부활 4초) 지점부터 시작하고 소리에 리미터(-1.5 dBFS)를 건다. `assemble.py --shorts`가 새로
만들 때 적용하고, 이미 만든 쇼츠는 `node motion/youtube/shorts-retrim.mjs <code…> [--upload]`로 다시 자른다(업로드 전인 것만).
1물결(ko·en·es·pt-BR)은 예전 시작으로 이미 예약돼 있어 그대로 두고, 첫 주 수치를 2물결과 비교한다.

### 공개 정책 — 4개 언어씩 "물결" (2026-10-23 관리자 승인)
번역은 계속 늘지만 한 번에 다 할 수 없으므로 같은 순서를 반복한다.

| 순서 | 할 일 |
|---|---|
| 1 | 4개 언어를 함께 번역·원어민 검토(품질 기준 통과한 언어만) — GitHub 렌더가 4개를 약 35분에 함께 처리 |
| 2 | 같은 날: 사이트 영상 페이지·버튼 + 유튜브 가로 영상 공개(A/B 썸네일, FAQ 고정 댓글, `FILM_YT`) — 쇼츠의 관련 영상이 이 영상이라 먼저 |
| 3 | 다음 날부터 쇼츠 21일: 언어마다 하루 1편, 그 나라 저녁 시간, 장면 순서. 21편을 한 번에 예약 + 언어 재생목록(8단계) |
| 4 | 7일째 점검: 쇼츠 "본 비율 대 넘긴 비율", 가로 영상 시청 지속률 → 제목·훅을 다음 물결 전에 고침 |

- **겹치기**: 쇼츠는 동시에 최대 두 물결(하루 8편). 새 물결은 앞 물결이 7일 치 자료를 쌓은 뒤 시작.
- **알림**: 구독자 알림은 한국어 영상만 켬(구독자 대부분이 한국어 시청자).
- **A/B 결과**: 2주 뒤 이긴 썸네일 그림을 다음 물결부터 기본(A)으로.
- **순서**: 화자 수 × 유튜브 사용률 × 기독교 인구로 정하되, 원어민 검토 통과가 먼저.
- **일정(10-23 기준)**: 1물결 ko·en·es·pt-BR 쇼츠 10-24~11-13 · 2물결 id·fr·de·ru ≈10-31 · 3물결 zh-Hans·zh-Hant·ja·ar ≈11-14 ·
  4물결 hi·vi·th·tl ≈11-21 (가로 영상은 16개 모두 공개됨). 실제 시작일은 `uploaded.json`의 `shorts.<code>.first_day`.

**함정 (겪은 것만)**
- 탭에 남은 예전 매니페스트를 쓰면 안 된다 — 2026-10-23 한국어 공개 영상 설명에 `…: undefined`가 1~2분 저장됐다. 도우미는 매번
  `cache: 'no-store'`로 새로 받고, 값이 비면 저장하지 않는다. `includes(undefined)`는 검사가 아니다(문자열 "undefined"와 맞음).
- 유튜브 시청 페이지의 댓글 메뉴(⋮)와 고정 확인 버튼은 **스크립트 클릭에 반응하지 않을 때가 많다** — 위치만 스크립트로 구하고
  실제 클릭을 한다. 글 넣기·저장은 `execCommand('insertText')` + `insertLineBreak` 후 스크립트 클릭으로 된다.
- 저장 확인 전에 다음 영상으로 넘어가면 저장이 사라진다(중국어 간체 1번) — 결과를 읽은 뒤 넘어간다.
- 한국어 링크는 루트(`/`)라서 저장된 언어 선택·브라우저 언어를 따른다 → 유튜브 링크에는 `?lang=ko`를 붙인다(`manifest.mjs`가 함).
- 도우미는 한 번도 저장소 밖(대화·임시 폴더)에만 두지 않는다 — 다음 세션이 다시 만들다 실수한다. `serve.mjs`·`studio-publish.js`가
  그렇게 빠져 있었다(2026-10-23에 저장소로).
- 스튜디오 동영상 언어 이름은 한국어 UI 기준(`studio-upload.js`의 `LANG_LABEL`). 새 언어는 거기에 먼저 넣는다.
