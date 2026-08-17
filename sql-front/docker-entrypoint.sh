#!/bin/sh
set -eu

# The bundle is built once and pointed at a server at start up, so the same
# image works for the shared game server and for somebody running it locally.
API_URL="${API_URL:-}"
LEADERBOARD_URL="${LEADERBOARD_URL:-}"

cat > /usr/src/app/dist/config.js <<EOF
window.SQL_TRAINING_CONFIG = {
  api: "${API_URL}",
  leaderboardApi: "${LEADERBOARD_URL}",
};
EOF

echo "Playing against api=${API_URL:-<built-in default>} leaderboard=${LEADERBOARD_URL:-<built-in default>}"

exec serve -s dist -l 3000
