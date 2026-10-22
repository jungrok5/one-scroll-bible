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
         notonaskharabic/NotoNaskhArabic[wght].ttf notosansarabic/NotoSansArabic[wdth,wght].ttf; do
  out="$FD/$(basename "$f" | tr -d '[],')"
  [ -s "$out" ] || curl -fsSL "$G/$(echo "$f" | sed 's/\[/%5B/g; s/\]/%5D/g')" -o "$out"
done
fc-cache -f >/dev/null
echo "fonts: $(fc-list : family | grep -c Noto) Noto families"
if ! command -v ffmpeg >/dev/null; then sudo apt-get update -qq && sudo apt-get install -y -qq ffmpeg >/dev/null; fi
ffmpeg -version | head -1
if ! node -e "require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright')" 2>/dev/null; then npm i -g playwright@1.56.1 >/dev/null; fi
npx --yes playwright@1.56.1 install --with-deps chromium >/dev/null
echo "playwright chromium ready"
