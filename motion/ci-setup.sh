#!/usr/bin/env bash
# Everything a fresh Ubuntu machine (a GitHub Actions runner, a new cloud box) needs to render the film:
# the fonts the scenes name (Google's Noto variable fonts, so every weight is there), ffmpeg, Playwright's Chromium.
#   bash motion/ci-setup.sh
set -euo pipefail
FD=${FONT_DIR:-$HOME/.local/share/fonts}; mkdir -p "$FD"
G=https://raw.githubusercontent.com/google/fonts/main/ofl
for f in notosanskr/NotoSansKR[wght].ttf notoserifkr/NotoSerifKR[wght].ttf \
         notosans/NotoSans[wdth,wght].ttf notoserif/NotoSerif[wdth,wght].ttf \
         notosansjp/NotoSansJP[wght].ttf notoserifjp/NotoSerifJP[wght].ttf \
         notosanssc/NotoSansSC[wght].ttf notoserifsc/NotoSerifSC[wght].ttf \
         notosanstc/NotoSansTC[wght].ttf notoseriftc/NotoSerifTC[wght].ttf \
         notonaskharabic/NotoNaskhArabic[wght].ttf notosansarabic/NotoSansArabic[wdth,wght].ttf \
         notoserifdevanagari/NotoSerifDevanagari[wdth,wght].ttf notosansdevanagari/NotoSansDevanagari[wdth,wght].ttf \
         notoserifthai/NotoSerifThai[wdth,wght].ttf notosansthai/NotoSansThai[wdth,wght].ttf \
         notoserifbengali/NotoSerifBengali[wdth,wght].ttf notosansbengali/NotoSansBengali[wdth,wght].ttf \
         notoseriftamil/NotoSerifTamil[wdth,wght].ttf notosanstamil/NotoSansTamil[wdth,wght].ttf \
         notosansmyanmar/NotoSansMyanmar[wdth,wght].ttf \
         notoserifkhmer/NotoSerifKhmer[wdth,wght].ttf notosanskhmer/NotoSansKhmer[wdth,wght].ttf; do
  out="$FD/$(basename "$f" | tr -d '[],')"
  [ -s "$out" ] || curl -fsSL --retry 3 "$G/$(echo "$f" | sed 's/\[/%5B/g; s/\]/%5D/g')" -o "$out"
done
# static Korean faces per weight — what publish-film.py subsets for the site (fonts.css serves one file per weight)
C=https://raw.githubusercontent.com/notofonts/noto-cjk/main
for f in Serif/SubsetOTF/KR/NotoSerifKR-Regular.otf Serif/SubsetOTF/KR/NotoSerifKR-SemiBold.otf Serif/SubsetOTF/KR/NotoSerifKR-Black.otf \
         Sans/SubsetOTF/KR/NotoSansKR-Light.otf Sans/SubsetOTF/KR/NotoSansKR-Regular.otf Sans/SubsetOTF/KR/NotoSansKR-Bold.otf; do
  out="$FD/$(basename "$f")"; [ -s "$out" ] || curl -fsSL "$C/$f" -o "$out"
done
fc-cache -f >/dev/null
echo "fonts: $(fc-list : family | grep -c Noto) Noto families"
# ffmpeg: a static build from GitHub, not apt — apt on the runners took anywhere from 1 to 43 minutes (2026-10-23)
if ! command -v ffmpeg >/dev/null; then
  FF=${FFMPEG_DIR:-$HOME/.local/ffmpeg}; mkdir -p "$FF"
  [ -x "$FF/bin/ffmpeg" ] || curl -fsSL --retry 3 https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.1-latest-linux64-gpl-8.1.tar.xz | tar -xJ -C "$FF" --strip-components=1
  export PATH="$FF/bin:$PATH"; if [ -n "${GITHUB_PATH:-}" ]; then echo "$FF/bin" >> "$GITHUB_PATH"; fi
fi
ffmpeg -version | head -1
if ! node -e "require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright')" 2>/dev/null; then npm i -g playwright@1.56.1 >/dev/null; fi
# Chromium only; the system libraries it needs are already on GitHub's Ubuntu image (it ships Google Chrome). --with-deps
# (apt again) only if the browser will not start.
npx --yes playwright@1.56.1 install chromium >/dev/null
if ! node -e "require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright').chromium.launch().then(b=>b.close())" 2>/dev/null; then
  echo "chromium needs system libraries — installing them"; NEEDRESTART_MODE=l sudo -E npx --yes playwright@1.56.1 install-deps chromium >/dev/null
fi
echo "playwright chromium ready"
# Python side (site publish: fonttools + brotli; thumbnails: pillow) — only when asked: WITH_PYTHON=1 bash motion/ci-setup.sh
if [ "${WITH_PYTHON:-}" = 1 ]; then python3 -m pip install -q fonttools brotli pillow; echo "python: fonttools brotli pillow"; fi
