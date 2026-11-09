#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

usage() {
  echo "Usage: $0 [--reset] [--no-pull]"
  echo "  --reset    wipe all databases (players, scores, exercises) before starting"
  echo "  --no-pull  deploy the current checkout without git pull"
}

RESET=0
PULL=1
for arg in "$@"; do
  case "$arg" in
    --reset) RESET=1 ;;
    --no-pull) PULL=0 ;;
    -h|--help) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
done

command -v docker >/dev/null || { echo "docker is not installed" >&2; exit 1; }
docker compose version >/dev/null || { echo "docker compose plugin is not installed" >&2; exit 1; }

if [ "$PULL" = 1 ]; then
  git pull --ff-only
fi

if [ ! -f .env ]; then
  rand() { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; }
  cat > .env <<EOF
API_KEY=$(rand)
INTERNAL_API_KEY=$(rand)
HTTP_PORT=80
EOF
  chmod 600 .env
  echo "Created .env with fresh secrets"
fi

if [ "$RESET" = 1 ]; then
  read -r -p "Wipe ALL data (scores, players)? [y/N] " answer
  [ "$answer" = "y" ] || [ "$answer" = "Y" ] || { echo "Aborted"; exit 1; }
  docker compose down -v
fi

docker compose up -d --build --remove-orphans
docker image prune -f >/dev/null

set -a; . ./.env; set +a
PORT="${HTTP_PORT:-80}"

echo -n "Waiting for the site"
UP=0
for _ in $(seq 1 90); do
  if curl -fs -o /dev/null "http://localhost:$PORT/" && curl -fs -o /dev/null "http://localhost:$PORT/api/"; then
    UP=1
    echo " up"
    break
  fi
  echo -n "."
  sleep 2
done
[ "$UP" = 1 ] || echo " not responding after 3 minutes, check: docker compose logs"

docker compose ps

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
SUFFIX=""
[ "$PORT" != 80 ] && SUFFIX=":$PORT"
echo
echo "Game:        http://${IP:-localhost}${SUFFIX}/"
echo "API:         http://${IP:-localhost}${SUFFIX}/api/"
echo "Leaderboard: http://${IP:-localhost}${SUFFIX}/leaderboard/"
echo "API_KEY:     $API_KEY"
