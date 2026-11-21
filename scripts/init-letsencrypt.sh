#!/bin/bash
set -euo pipefail

COMPOSE="docker compose"
NGINX_CONF="./nginx/conf.d/mustang.conf"
PROD_TEMPLATE="./nginx/conf.d/mustang.prod.conf.template"
HTTP_TEMPLATE="./nginx/conf.d/mustang.http.conf.template"

if ! docker compose version >/dev/null 2>&1; then
  COMPOSE="docker-compose"
fi

if [ ! -f .env ]; then
  echo "Missing .env — copy .env.example to .env and edit passwords"
  exit 1
fi

# shellcheck disable=SC1091
set -a
# shellcheck source=/dev/null
source .env
set +a

DOMAIN="${DOMAIN:-mustang.easydev.tech}"
EMAIL="${CERTBOT_EMAIL:-admin@easydev.tech}"

echo "==> Domain: $DOMAIN"
echo "==> Email:  $EMAIL"
mkdir -p ./certbot/www/.well-known/acme-challenge ./certbot/conf

# Keep a copy of the HTTP-only config for re-issues
if [ ! -f "$HTTP_TEMPLATE" ]; then
  cp "$NGINX_CONF" "$HTTP_TEMPLATE"
fi

# Always start with HTTP so ACME challenge works
cp "$HTTP_TEMPLATE" "$NGINX_CONF"

echo "==> Building and starting stack (HTTP only)"
$COMPOSE up -d --build api frontend nginx

echo "==> Waiting for nginx..."
for i in $(seq 1 30); do
  if $COMPOSE exec -T nginx wget -qO- "http://127.0.0.1/" >/dev/null 2>&1 \
    || $COMPOSE exec -T nginx nginx -t >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "==> Checking ACME webroot via nginx"
PROBE="mustang-acme-probe-$(date +%s)"
echo "ok" > "./certbot/www/.well-known/acme-challenge/${PROBE}"
# nginx mounts www as :ro — file is on host, should be visible
HTTP_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1/.well-known/acme-challenge/${PROBE}" -H "Host: ${DOMAIN}" || true)"
rm -f "./certbot/www/.well-known/acme-challenge/${PROBE}"

if [ "$HTTP_CODE" != "200" ]; then
  echo ""
  echo "ERROR: nginx did not serve ACME challenge (HTTP $HTTP_CODE)."
  echo "Fix local nginx first, then retry."
  echo "  docker compose logs nginx --tail=50"
  exit 1
fi
echo "    local ACME path OK (HTTP 200)"

echo ""
echo "==> Requesting Let's Encrypt certificate (HTTP-01)"
echo "    IMPORTANT: Let's Encrypt must reach http://${DOMAIN}/.well-known/acme-challenge/"
echo "    If antiddos.pw sits in front and returns 503 — temporarily point A-record"
echo "    directly to this VPS IP, or allow ACME path through the proxy."
echo ""

set +e
$COMPOSE run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --non-interactive \
  --preferred-challenges http \
  -d "$DOMAIN"
CERT_RC=$?
set -e

if [ "$CERT_RC" -ne 0 ]; then
  echo ""
  echo "ERROR: certbot failed (exit $CERT_RC)."
  echo "Common causes:"
  echo "  1) Domain A/AAAA does not point to this server (or points only to antiddos)"
  echo "  2) Port 80 closed / firewall"
  echo "  3) antiddos blocks or doesn't forward /.well-known/acme-challenge/"
  echo "  4) Rate limit from Let's Encrypt (wait or use staging)"
  echo ""
  echo "Debug from this server:"
  echo "  curl -I http://${DOMAIN}/.well-known/acme-challenge/test"
  exit "$CERT_RC"
fi

if [ ! -f "./certbot/conf/live/${DOMAIN}/fullchain.pem" ]; then
  echo "ERROR: certificate files missing under certbot/conf/live/${DOMAIN}/"
  exit 1
fi

echo "==> Enabling HTTPS nginx config"
cp "$PROD_TEMPLATE" "$NGINX_CONF"

echo "==> Reloading nginx + starting renew loop"
$COMPOSE up -d nginx certbot
$COMPOSE exec -T nginx nginx -s reload

echo ""
echo "==> Ready"
echo "    https://${DOMAIN}/display"
echo "    https://${DOMAIN}/admin"
