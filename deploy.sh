#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

usage() {
  echo "Usage: $0 [--reset]"
  echo "  Copies this checkout to the minipc and (re)starts everything there."
  echo "  --reset  wipe all databases (players, scores) on the minipc first"
}

RESET=0
for arg in "$@"; do
  case "$arg" in
    --reset) RESET=1 ;;
    -h|--help) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
done

ENV_FILE=.env
touch "$ENV_FILE"

get_env() { grep -E "^$1=" "$ENV_FILE" | tail -n1 | cut -d= -f2- || true; }
set_env() {
  if grep -qE "^$1=" "$ENV_FILE"; then
    sed -i.bak "s|^$1=.*|$1=$2|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
  else
    echo "$1=$2" >> "$ENV_FILE"
  fi
}

MINIPC_IP="$(get_env MINIPC_IP)"
MINIPC_IP="${MINIPC_IP:-192.168.1.20}"
MINIPC_USER="$(get_env MINIPC_USER)"
MINIPC_DIR="$(get_env MINIPC_DIR)"
MINIPC_DIR="${MINIPC_DIR:-sql-training}"

target() { if [ -n "$MINIPC_USER" ]; then echo "$MINIPC_USER@$MINIPC_IP"; else echo "$MINIPC_IP"; fi; }

while ! ssh -o BatchMode=yes -o ConnectTimeout=5 "$(target)" true 2>/dev/null; do
  echo "Cannot ssh into $(target)"
  read -r -p "Minipc IP (empty to abort): " NEW_IP
  [ -n "$NEW_IP" ] || exit 1
  MINIPC_IP="$NEW_IP"
done
set_env MINIPC_IP "$MINIPC_IP"

if [ "$RESET" = 1 ]; then
  read -r -p "Wipe ALL data on $(target) (scores, players)? [y/N] " answer
  [ "$answer" = "y" ] || [ "$answer" = "Y" ] || { echo "Aborted"; exit 1; }
fi

echo "Copying files to $(target):$MINIPC_DIR"
ssh "$(target)" "mkdir -p '$MINIPC_DIR' && find '$MINIPC_DIR' -mindepth 1 -maxdepth 1 ! -name .env -exec rm -rf {} +"
tar czf - \
  --exclude=./.git \
  --exclude=node_modules \
  --exclude=./.env \
  --exclude='*.pptx' \
  --exclude=./design \
  --exclude=./slides \
  --exclude=dist \
  . | ssh "$(target)" "tar xzf - -C '$MINIPC_DIR'"

ssh "$(target)" bash -s -- "$MINIPC_DIR" "$RESET" <<'REMOTE'
set -euo pipefail
cd "$1"
RESET="$2"

command -v docker >/dev/null || { echo "docker is not installed on the minipc" >&2; exit 1; }

if [ ! -f .env ]; then
  rand() { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; }
  printf 'API_KEY=%s\nINTERNAL_API_KEY=%s\nHTTP_PORT=80\n' "$(rand)" "$(rand)" > .env
  chmod 600 .env
  echo "Created .env with fresh secrets on the minipc"
fi

if [ "$RESET" = 1 ]; then
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
echo "API_KEY: $API_KEY"
REMOTE

echo
echo "Game:        http://$MINIPC_IP/"
echo "API:         http://$MINIPC_IP/api/"
echo "Leaderboard: http://$MINIPC_IP/leaderboard/"
