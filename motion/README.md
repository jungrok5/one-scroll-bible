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
- 유튜브에 실제로 올리는 일은 이 과정 밖입니다(사람이 스튜디오에서).

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
- **새 언어 영상을 유튜브에 공개하면** `index.html`의 `FILM_YT`에 그 언어의 영상 id를 넣는다 — 첫 화면 영상 버튼이 `/film/` 대신
  그 유튜브 영상으로 간다(없는 언어는 `/film/?lang=`). 비공개 id는 넣지 않는다('비공개 동영상'이 뜸).
- 쇼츠는 커스텀 썸네일을 받지 않고(영상 프레임 중 선택) 자막은 쇼츠별 SRT(`v/NN-*.srt`)를 올립니다.
