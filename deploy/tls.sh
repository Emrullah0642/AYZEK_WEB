#!/usr/bin/env bash
# Issue or renew the public certificate after all three DNS records point here.
set -euo pipefail

APP_DIR=/opt/ayzek
DOMAIN=ayzek22.com.tr
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
WEBROOT="$APP_DIR/certbot/www"

cd "$APP_DIR"
mkdir -p "$WEBROOT" /etc/letsencrypt /var/lib/letsencrypt /etc/ssl/ayzek

certbot() {
  docker run --rm \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/lib/letsencrypt:/var/lib/letsencrypt \
    -v "$WEBROOT":/var/www/certbot \
    certbot/certbot:latest "$@"
}

case "${1:-}" in
  issue)
    if [ ! -s "$CERT_DIR/fullchain.pem" ]; then
      certbot certonly --webroot -w /var/www/certbot \
        --non-interactive --agree-tos --register-unsafely-without-email \
        --cert-name "$DOMAIN" \
        -d "$DOMAIN" -d "www.$DOMAIN" -d "api.$DOMAIN"
    fi
    ;;
  renew)
    certbot renew --cert-name "$DOMAIN" --non-interactive
    ;;
  *)
    echo "Usage: $0 issue|renew" >&2
    exit 2
    ;;
esac

if ! cmp -s "$CERT_DIR/fullchain.pem" /etc/ssl/ayzek/origin.pem || \
   ! cmp -s "$CERT_DIR/privkey.pem" /etc/ssl/ayzek/origin.key; then
  install -m 644 "$CERT_DIR/fullchain.pem" /etc/ssl/ayzek/origin.pem
  install -m 600 "$CERT_DIR/privkey.pem" /etc/ssl/ayzek/origin.key
  docker compose exec -T nginx nginx -s reload
fi

if [ "${1:-}" = issue ]; then
  install -m 644 "$APP_DIR/deploy/ayzek-tls-renew.service" /etc/systemd/system/ayzek-tls-renew.service
  install -m 644 "$APP_DIR/deploy/ayzek-tls-renew.timer" /etc/systemd/system/ayzek-tls-renew.timer
  systemctl daemon-reload
  systemctl enable --now ayzek-tls-renew.timer
fi
