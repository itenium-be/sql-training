# Avatar picker mockups

Each character has a title + tagline and several variants; the player picks one.

- `preview.html`: three directions — A carousel · B stacked · **C two-pane** (chosen)

Shipped as the two-pane picker (character rail left, tagline + variants right). Character config + taglines live in `sql-front/src/avatars.ts`; images in `sql-front/public/avatars/` (regenerate with `design/avatars/convert.sh`).
