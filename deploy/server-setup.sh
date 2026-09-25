#!/usr/bin/env bash
# Kolan sunucusunda (Ubuntu 24.04) root olarak BİR KEZ çalıştırın:
#   bash server-setup.sh
set -euo pipefail

REPO_URL="https://github.com/sadikbilal/AYZEK_WEB.git"
APP_DIR="/opt/ayzek"

echo ">> Paketler güncelleniyor"
apt-get update && apt-get upgrade -y
apt-get install -y ca-certificates curl git openssl ufw

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

echo ">> İlk açılış için geçici HTTPS sertifikası hazırlanıyor"
install -d -m 700 /etc/ssl/ayzek
if [ ! -s /etc/ssl/ayzek/origin.pem ] || [ ! -s /etc/ssl/ayzek/origin.key ]; then
  openssl req -x509 -nodes -newkey rsa:2048 -days 7 \
    -keyout /etc/ssl/ayzek/origin.key \
    -out /etc/ssl/ayzek/origin.pem \
    -subj '/CN=ayzek22.com.tr' \
    -addext 'subjectAltName=DNS:ayzek22.com.tr,DNS:www.ayzek22.com.tr,DNS:api.ayzek22.com.tr'
  chmod 600 /etc/ssl/ayzek/origin.key
fi

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

2) DNS: ayzek22.com.tr, www.ayzek22.com.tr ve api.ayzek22.com.tr
   A kayıtlarını bu sunucunun IP adresine yönlendirin.
   Sistemde başka bir nginx varsa kapatın:
     systemctl disable --now nginx

3) İlk kez ayağa kaldır:
     cd $APP_DIR && docker compose up -d --build

4) DNS yayıldıktan sonra güvenilir HTTPS sertifikasını alın:
     bash $APP_DIR/deploy/tls.sh issue

5) GitHub > AYZEK_WEB > Settings > Secrets and variables > Actions:
     SSH_USER = root
     SSH_KEY  = aşağıdaki özel anahtarın TAMAMI:
       cat /root/.ssh/github_deploy
=====================================================================
EOF
