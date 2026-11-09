#!/usr/bin/env bash
# Append meme drop-ins to the app as sql-<N>.webp, continuing the sequence.
# Drop any png/jpg/webp/gif in this folder, run this, then clear the folder.
set -euo pipefail

SRC="${1:-$(cd "$(dirname "$0")" && pwd)}"
OUT="${2:-$(cd "$(dirname "$0")/../../sql-front/public/memes" && pwd)}"
MAXDIM=800; Q=82

n=$(ls "$OUT"/sql-*.webp 2>/dev/null | sed -E 's#.*/sql-([0-9]+)\.webp$#\1#' | sort -n | tail -1)
n=${n:-0}

shopt -s nullglob nocaseglob
for f in "$SRC"/*.png "$SRC"/*.jpg "$SRC"/*.jpeg "$SRC"/*.webp "$SRC"/*.gif; do
  n=$((n + 1))
  convert "$f" -resize "${MAXDIM}x${MAXDIM}>" -quality "$Q" "$OUT/sql-$n.webp"
done

echo "memes now: $(ls "$OUT"/sql-*.webp | wc -l)"
