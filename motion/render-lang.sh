#!/usr/bin/env bash
# Render the whole film in one language, both orientations, and make the YouTube upload copies.
#   bash motion/render-lang.sh en [h v]   → motion/out/film-en-h-upload.mp4, film-en-v-upload.mp4
# Per-scene clips (out/<scene>-en-<h|v>.mp4) and the master are deleted after the upload copy is made (disk).
# Check translations first: node motion/i18n-scan.mjs en  (every scene must say "complete").
set -euo pipefail
cd "$(dirname "$0")/.."
lang=$1; shift; oris=${*:-h v}
SCENES="opening creation fall patriarch exodus wilderness judges kingdom exile return silence advent cross rise church renewal mirror gospel evidence ship invite"
for o in $oris; do
  for s in $SCENES; do
    [ -s motion/out/$s-$lang-$o.mp4 ] && continue
    echo "[$(date +%H:%M)] $lang $o $s"
    node motion/render.mjs $o --page pilot/$s.html --lang $lang > /dev/null
  done
  python3 motion/assemble.py $o --lang $lang --upload
  up=motion/out/film-$lang-$o-upload.mp4
  [ -s "$up" ] && rm -f motion/out/film-$lang-$o.mp4 $(for s in $SCENES; do echo motion/out/$s-$lang-$o.mp4; done)
  echo "[$(date +%H:%M)] done $up ($(du -m $up | cut -f1) MB)"
done
