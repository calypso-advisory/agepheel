#!/usr/bin/env bash
# Convertit un clip-pont vidéo en séquence d'images WebP pour le scrubbing au scroll.
# usage : tools/extract-frames.sh clip.mp4 v02 [fps=30] [largeur=1920]
set -euo pipefail
IN="$1"; NAME="$2"; FPS="${3:-30}"; W="${4:-1920}"
OUT="app/public/media/bridges/$NAME"
mkdir -p "$OUT"
ffmpeg -loglevel error -i "$IN" -vf "fps=$FPS,scale=$W:-2:flags=lanczos" -c:v libwebp -quality 82 "$OUT/%04d.webp"
ls "$OUT" | wc -l | xargs echo "images extraites :"
