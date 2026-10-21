#!/usr/bin/env bash
# Render the film in one language and make the YouTube files:
#   bash motion/render-lang.sh en [h v]   → h: motion/out/film-en-h-upload.mp4 (the whole film)
#                                           v: motion/out/shorts/en/NN-<scene>.mp4 (21 Shorts, one per scene)
# Per-scene clips and the master are deleted after the upload copy is made (disk); out/upcache/ keeps each scene's upload
# encode, so after fixing one scene: render it again (render.mjs … --lang en) and run assemble.py h --lang en --upload.
# Check translations first: node motion/i18n-scan.mjs en  (every scene must say "complete").
set -euo pipefail
cd "$(dirname "$0")/.."
lang=$1; shift; oris=${*:-h v}
SCENES="opening creation fall patriarch exodus wilderness judges kingdom exile return silence advent cross rise church renewal mirror gospel evidence ship invite"
# a clip already in the upload format (H.265, the render.mjs default) moves to out/upcache/ — later fixes re-join from there;
# an old H.264 clip is deleted (its upload encode is already in upcache/)
keep_or_rm() { mkdir -p motion/out/upcache; for s in $SCENES; do f=motion/out/$s-$lang-$1.mp4; [ -f $f ] || continue
  if [ "$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 $f)" = hevc ]; then mv -f $f motion/out/upcache/; else rm -f $f; fi; done; }
for o in $oris; do
  for s in $SCENES; do
    [ -s motion/out/$s-$lang-$o.mp4 ] || [ -s motion/out/upcache/$s-$lang-$o.mp4 ] && continue
    echo "[$(date +%H:%M)] $lang $o $s"
    node motion/render.mjs $o --page pilot/$s.html --lang $lang > /dev/null
  done
  if [ $o = v ]; then
    python3 motion/assemble.py v --lang $lang --shorts
    [ $(ls motion/out/shorts/$lang/*.mp4 | wc -l) -eq 21 ] && keep_or_rm v
    echo "[$(date +%H:%M)] done motion/out/shorts/$lang ($(du -sm motion/out/shorts/$lang | cut -f1) MB)"
  else
    python3 motion/assemble.py $o --lang $lang --upload
    up=motion/out/film-$lang-$o-upload.mp4
    [ -s "$up" ] && { rm -f motion/out/film-$lang-$o.mp4; keep_or_rm $o; }
    echo "[$(date +%H:%M)] done $up ($(du -m $up | cut -f1) MB)"
  fi
done
