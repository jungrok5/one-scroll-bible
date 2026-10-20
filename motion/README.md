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
**유튜브·인스타에 올릴 때는 반드시 `--upload` 사본(`film-h-upload.mp4`)을 올리세요.** 장면이 바뀌는 곳마다 영상이 잠깐
튀는 문제(일부 폰·일부 화질에서만 보임)를 막도록 2초마다 완전한 화면을 넣고, 앞뒤 참조를 없앤 구조입니다(H.265, 400MB 이하).
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
