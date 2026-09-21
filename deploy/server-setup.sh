#!/usr/bin/env bash
# Kolan sunucusunda (Ubuntu 24.04) root olarak BİR KEZ çalıştırın:
#   bash server-setup.sh
set -euo pipefail

REPO_URL="https://github.com/Emrullah0642/AYZEK_WEB.git"
APP_DIR="/opt/ayzek"

echo ">> Paketler güncelleniyor"
apt-get update && apt-get upgrade -y
apt-get install -y ca-certificates curl git ufw certbot

echo ">> Docker kuruluyor"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

echo ">> 4 GB swap açılıyor (2 GB RAM ile Next.js build'i için gerekli)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ">> Güvenlik duvarı (sadece SSH, HTTP, HTTPS)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ">> Repo klonlanıyor"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi
mkdir -p "$APP_DIR/BACKEND/public/uploads"

echo ">> Sertifika yenilemesi için nginx durdur/başlat hook'ları"
mkdir -p /etc/letsencrypt/renewal-hooks/pre /etc/letsencrypt/renewal-hooks/post
printf '#!/bin/sh\ncd %s && docker compose stop nginx\n' "$APP_DIR" > /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh
printf '#!/bin/sh\ncd %s && docker compose start nginx\n' "$APP_DIR" > /etc/letsencrypt/renewal-hooks/post/start-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh /etc/letsencrypt/renewal-hooks/post/start-nginx.sh

echo ">> GitHub Actions için deploy anahtarı oluşturuluyor"
if [ ! -f /root/.ssh/github_deploy ]; then
  mkdir -p /root/.ssh && chmod 700 /root/.ssh
  ssh-keygen -t ed25519 -N "" -C "github-actions-deploy" -f /root/.ssh/github_deploy
  cat /root/.ssh/github_deploy.pub >> /root/.ssh/authorized_keys
  chmod 600 /root/.ssh/authorized_keys
fi

cat <<EOF

=====================================================================
Kurulum tamam. Kalan adımlar:

1) .env oluştur:
     cp $APP_DIR/.env.example $APP_DIR/.env && nano $APP_DIR/.env

2) SSL sertifikası al (DNS'te ayzek.tr, www.ayzek.tr, api.ayzek.tr
   bu sunucunun IP'sini göstermeli; 80 portu boş olmalı):
     certbot certonly --standalone -d ayzek.tr -d www.ayzek.tr -d api.ayzek.tr

3) İlk kez ayağa kaldır:
     cd $APP_DIR && docker compose up -d --build

4) GitHub > AYZEK_WEB > Settings > Secrets and variables > Actions:
     HOST     = bu sunucunun IP'si
     SSH_USER = root
     SSH_KEY  = aşağıdaki özel anahtarın TAMAMI:
       cat /root/.ssh/github_deploy
=====================================================================
EOF
