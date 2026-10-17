# 모션그래픽 (한눈에 보는 성경 이야기)

사이트 한국어 본문(13장면 · 복음의 핵심 · 영접 기도)을 약 4분짜리 모션그래픽으로 만든 것입니다.
성경 인용은 사이트와 같은 개역개정 원문 그대로입니다.

- `index.html` — 브라우저에서 바로 재생 (화면 비율에 따라 가로/세로 자동, 버튼으로 전환)
- `render.mjs` — 프레임 단위로 MP4 녹화
  ```
  node motion/render.mjs h   # 1920×1080 → motion/out/one-scroll-bible-h.mp4
  node motion/render.mjs v   # 1080×1920 → motion/out/one-scroll-bible-v.mp4
  node motion/render.mjs h --stills 20,98   # 확인용 정지 화면
  ```
  Playwright(Chromium) + ffmpeg, 로컬에 설치된 Noto Sans KR / Noto Serif KR 글꼴이 필요합니다.

`motion/`은 사이트에 배포되지 않고(`.vercelignore`), 녹화 결과 `motion/out/`은 커밋하지 않습니다.

## 시안 (`pilot/`)

주제마다 다른 화풍으로 만든 장면 시안입니다. 화풍은 lemo-opuscar(MIT)의 스타일 지침을 참고했고, 그림과 소리는 모두 코드로 만듭니다.

| 파일 | 장면 | 화풍 |
|---|---|---|
| `pilot/patriarch.html` | 03 족장 시대 (창 15:5) | 해 질 녘 소프트 파스텔 |
| `pilot/cross.html` | 11 십자가 (눅 23:44 · 사 53:5 · 요 19:30) | 흑백 필름에 빨강 하나 → 렘브란트 탑라이트 유화 |
| `pilot/rise.html` | 12 부활 (마 28:6) | 임파스토(팔레트 나이프) — 회색 세상이 색으로 다시 칠해짐 |

```
python3 motion/pilot/sound.py                         # 소리 합성 → pilot/*.wav
node motion/render.mjs h --page pilot/cross.html      # → motion/out/cross-h.mp4 (같은 이름의 .wav를 자동으로 합침)
```
