#!/usr/bin/env bash
# First-time Let's Encrypt certificate for the site (run once on the server, from the project folder):
#   bash deploy/init-letsencrypt.sh
# Needs .env.prod (DOMAIN, LETSENCRYPT_EMAIL) and DNS already pointing at this server.
# Nginx cannot start without a certificate and Let's Encrypt cannot issue one without Nginx answering on port 80,
# so a throw-away certificate is created first, Nginx is started with it, then the real certificate replaces it.
set -euo pipefail

cd "$(dirname "$0")/.."
set -a; source .env.prod; set +a
: "${DOMAIN:?Set DOMAIN in .env.prod}"
: "${LETSENCRYPT_EMAIL:?Set LETSENCRYPT_EMAIL in .env.prod}"

compose() { docker compose --env-file .env.prod -f docker-compose.prod.yml "$@"; }

echo "==> Creating a temporary certificate for ${DOMAIN}"
compose run --rm --entrypoint sh certbot -c "
  mkdir -p /etc/letsencrypt/live/${DOMAIN} &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/${DOMAIN}/privkey.pem \
    -out /etc/letsencrypt/live/${DOMAIN}/fullchain.pem -subj '/CN=localhost'"

echo "==> Starting Nginx"
compose up -d --force-recreate nginx
sleep 5

echo "==> Requesting the real certificate"
compose run --rm --entrypoint sh certbot -c "
  rm -rf /etc/letsencrypt/live/${DOMAIN} /etc/letsencrypt/archive/${DOMAIN} /etc/letsencrypt/renewal/${DOMAIN}.conf &&
  certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN} \
    --email ${LETSENCRYPT_EMAIL} --agree-tos --no-eff-email --non-interactive"

echo "==> Reloading Nginx with the real certificate"
compose exec nginx nginx -s reload
echo "Done. Renewal runs automatically (the certbot service)."
