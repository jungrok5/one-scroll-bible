#!/usr/bin/env bash
# The film page's poster (shown before Play, and as the share image) for one language: the title card of the last scene.
#   bash motion/poster.sh <lang>   → film/poster-h-<lang>.jpg (1280×720) + film/poster-v-<lang>.jpg (720×1280)
#   (Korean is the default poster: bash motion/poster.sh ko → film/poster-h.jpg, film/poster-v.jpg)
set -euo pipefail
cd "$(dirname "$0")/.."
L="${1:?usage: bash motion/poster.sh <lang>}"; S=$([ "$L" = ko ] && echo "" || echo "-$L"); A=$([ "$L" = ko ] && echo "" || echo "--lang $L")
for o in h v; do
  node motion/render.mjs $o --page pilot/invite.html $A --stills 55 >/dev/null
  size=$([ $o = h ] && echo 1280:720 || echo 720:1280)
  ffmpeg -loglevel error -y -i "motion/out/still-invite$S-$o-55.png" -vf "scale=$size" -q:v 3 "film/poster-$o$S.jpg"
  echo "film/poster-$o$S.jpg"
done
