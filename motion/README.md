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
필요: Node + Playwright(Chromium), ffmpeg, Python 3(numpy · fonttools+brotli), `~/.local/share/fonts`의 Noto 글꼴.
`motion/`은 배포되지 않고(`.vercelignore`), `motion/out/`은 커밋하지 않습니다.

## 영상 번역 (새 언어 추가)
절차는 **`/add-film-language` 스킬**(`.claude/skills/add-film-language/SKILL.md`)에 있습니다 — 번역 → 검사
(`i18n-scan`, 컨택트시트) → 원어민 검토(`review-prompt.md`) → 포스터·버튼·게시. 사람이 직접 번역할 때도 같은 파일
형식(`pilot/i18n/<lang>/<scene>.json`)이면 됩니다 — `CONTRIBUTING.md`의 "D · 영상 번역"을 보세요.

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

**GitHub Actions로 병렬 렌더** (`.github/workflows/render-film.yml`, 공개 저장소라 무료·동시 20개): Actions 탭 → render-film →
Run workflow에서 언어·방향(·시험용 장면)을 넣으면 언어×방향마다 작업이 하나씩 돌고, 결과는 아티팩트(3일 보관)로 받는다
(`film-<lang>-h` = 가로 전체 영상, `shorts-<lang>` = 쇼츠 21개). 새 머신 준비는 `bash motion/ci-setup.sh`(Noto 가변 글꼴·ffmpeg·Playwright).

## 유튜브 업로드 자료 — 텔레포트·다른 컴퓨터에서 이어서 할 때
컨테이너를 떠나도 잃지 않도록 **작은 것은 git에, 영상은 GitHub 릴리즈에** 둡니다 (`motion/out/`만 컴퓨터마다 새로 생깁니다).

| 무엇 | 어디 | 다시 만들기 |
|---|---|---|
| 영상 (언어별 가로 전체 + 쇼츠 21개) | **GitHub 릴리즈 `youtube-v1`** — `film-<lang>.mp4`, `shorts-<lang>-NN-<scene>.mp4` | Actions → render-film (언어·방향) → 끝나면 Actions → **publish-release**(그 run id)로 릴리즈에 추가 |
| 업로드 시트 (언어별 제목·설명+챕터·태그·썸네일·자막 경로, 영상+쇼츠 21개) | `motion/youtube/manifest.json` (읽기용 `manifest.md`) | `python3 motion/youtube/manifest.py` — 영상 페이지의 언어별 문구(`_ui`)와 장면 타이밍에서 만듦 |
| 썸네일 (언어별 4안 + 생성기) | `motion/youtube/thumbs/<lang>/{A-exodus,B-cross,C-split,D-earth}.jpg` | `python3 motion/youtube/thumbs/make.py [lang…]` (글꼴은 없으면 내려받음) |
| 자막 (언어별 전체 영상 + 쇼츠별 SRT) | `motion/subs/<lang>/film-h.srt`, `motion/subs/<lang>/{h,v}/NN-<scene>.srt` | `node motion/subtitles.mjs srt <lang> h` (타임라인은 `motion/subs/timeline-<h\|v>.json`, 장면 타이밍이 바뀐 뒤에만 `scan`) |
| 소리 | 원본 클립 `motion/pilot/audio/*.mp3`(git) + 큐 `pilot/<scene>.sound.json` → 믹스 `pilot/<scene>.wav` | `python3 motion/pilot/mix.py` (wav가 없으면 assemble은 사이트의 `film/s/<scene>.m4a`를 씀 — CI가 만든 영상이 그것) |

```
gh release download youtube-v1 -R jungrok5/one-scroll-bible -p 'film-de.mp4' -p 'shorts-de-*' -D motion/out/release   # 한 언어
gh release download youtube-v1 -R jungrok5/one-scroll-bible -D motion/out/release                                      # 전부 (약 20 GB)
curl -LO https://github.com/jungrok5/one-scroll-bible/releases/download/youtube-v1/film-de.mp4                        # gh 없이 (공개 URL)
```
- 썸네일은 네 안 모두 같은 문구("성경 전체를 14분 만에")에 그림만 다릅니다 — 유튜브 스튜디오 **"테스트 및 비교"**에 세 장까지 넣어
  고르면 됩니다(승자는 시청시간 점유율 기준, 며칠~2주). 오른쪽 아래는 재생시간 배지가 덮으므로 비워 둔 레이아웃입니다.
- 쇼츠는 커스텀 썸네일을 받지 않고(영상 프레임 중 선택) 자막은 쇼츠별 SRT(`v/NN-*.srt`)를 올립니다.
