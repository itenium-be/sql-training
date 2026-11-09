#!/usr/bin/env bash
# Regenerate the app's avatar webp set from the midjourney raws.
# Each raw is named  laoujin2_<Character_Name>_<prompt...>_<uuid>.png ; the first
# two words are the character, so variants land as <slug>-<n>.webp in index order.
set -euo pipefail

RAW="${1:-/home/wouter/code/courses/2024-10-03-SQL/design/midjourney-raw}"
OUT="${2:-$(dirname "$0")/../../sql-front/public/avatars}"
SIZE=320

mkdir -p "$OUT"
rm -f "$OUT"/*.webp
declare -A n
for f in "$RAW"/laoujin2_*.png; do
  rest=$(basename "$f"); rest=${rest#laoujin2_}
  slug=$(printf '%s-%s' "$(cut -d_ -f1 <<<"$rest")" "$(cut -d_ -f2 <<<"$rest")" | tr '[:upper:]' '[:lower:]')
  slug=${slug/#he-/the-}  # midjourney drops the leading T of "The" in some filenames
  n[$slug]=$(( ${n[$slug]:-0} + 1 ))
  cwebp -quiet -q 82 -resize "$SIZE" "$SIZE" "$f" -o "$OUT/${slug}-${n[$slug]}.webp"
done

printf 'wrote %s avatars:\n' "$(ls "$OUT"/*.webp | wc -l)"
ls "$OUT" | sed 's/-[0-9]*\.webp//' | sort | uniq -c
