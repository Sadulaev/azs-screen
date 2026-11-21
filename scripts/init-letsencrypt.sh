#!/bin/bash
set -euo pipefail

COMPOSE="docker compose"
NGINX_CONF="./nginx/conf.d/mustang.conf"
PROD_TEMPLATE="./nginx/conf.d/mustang.prod.conf.template"

if ! docker compose version >/dev/null 2>&1; then
  COMPOSE="docker-compose"
fi

if [ ! -f .env ]; then
  echo "Missing .env — copy .env.example to .env and edit passwords"
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
set +a
DOMAIN="${DOMAIN:-mustang.easydev.tech}"
EMAIL="${CERTBOT_EMAIL:-admin@easydev.tech}"

echo "==> Domain: $DOMAIN  email: $EMAIL"
mkdir -p ./certbot/www ./certbot/conf

echo "==> Building and starting stack (HTTP)"
$COMPOSE up -d --build api frontend nginx

echo "==> Waiting for nginx..."
sleep 5

echo "==> Requesting Let's Encrypt certificate"
$COMPOSE run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d "$DOMAIN"

echo "==> Enabling HTTPS nginx config"
cp "$PROD_TEMPLATE" "$NGINX_CONF"

echo "==> Full production stack"
$COMPOSE up -d nginx certbot
$COMPOSE exec nginx nginx -s reload

echo ""
echo "==> Ready"
echo "    https://$DOMAIN/display"
echo "    https://$DOMAIN/admin"
