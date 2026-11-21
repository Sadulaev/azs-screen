#!/bin/bash
set -euo pipefail

COMPOSE="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE="docker-compose"
fi

if [ ! -f .env ]; then
  echo "Copy .env.example → .env and set ADMIN_PASSWORD / JWT_SECRET / CERTBOT_EMAIL"
  exit 1
fi

# shellcheck disable=SC1091
set -a
# shellcheck source=/dev/null
source .env
set +a

DOMAIN="${DOMAIN:-mustang.easydev.tech}"
CERT_PATH="./certbot/conf/live/${DOMAIN}/fullchain.pem"

if [ ! -f "$CERT_PATH" ]; then
  echo "No TLS cert yet — running init-letsencrypt.sh"
  exec "$(dirname "$0")/init-letsencrypt.sh"
fi

# Ensure HTTPS nginx config is active
cp ./nginx/conf.d/mustang.prod.conf.template ./nginx/conf.d/mustang.conf
$COMPOSE up -d --build
echo "Up: https://${DOMAIN}/display  |  https://${DOMAIN}/admin"
