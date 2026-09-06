#!/usr/bin/env bash
# JHANARICH — one-shot VPS setup (Ubuntu/Debian, Hostinger VPS friendly)
# Run as a sudo-capable user from the REPO ROOT on the server:
#   bash scripts/vps-setup.sh
# Idempotent: safe to re-run. Skips what already exists.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="${1:-main}"

echo "==> 1/7 System packages (node 20 LTS, nginx, git, curl)"
if ! command -v node >/dev/null 2>&1 || [ "$(node -e 'console.log(parseInt(process.versions.node))')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo apt-get update -y
sudo apt-get install -y nginx git curl

echo "==> 2/7 Fetch latest code"
cd "$APP_DIR"
[ -d .git ] || { echo "Run this script from the cloned repo directory."; exit 1; }
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "==> 3/7 Install deps + build"
npm ci --omit=dev=false
npm run build

echo "==> 4/7 Environment file"
if [ ! -f .env ]; then
  SECRET=$(head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 40)
  cat > .env <<EOF
# SQLite on the VPS disk — persistent, no external DB needed.
DATABASE_URL="file:./prisma/prod.db"
# CHANGE THESE BEFORE EXPOSING THE SITE:
ADMIN_USER="admin"
ADMIN_PASSWORD="CHANGE_ME_STRONG_PASSWORD"
ADMIN_SECRET="$SECRET"
EOF
  echo "Created .env — EDIT ADMIN_PASSWORD NOW:  nano $APP_DIR/.env"
fi
mkdir -p prisma logs

echo "==> 5/7 Create DB + seed (idempotent)"
npm run db:setup

echo "==> 6/7 PM2 process manager"
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm i -g pm2
fi
cd "$APP_DIR"
pm2 start ecosystem.config.js || pm2 restart jhanarich
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | bash || true

echo "==> 7/7 Nginx reverse proxy"
NGINX_CONF="/etc/nginx/sites-available/jhanarich"
sudo tee "$NGINX_CONF" > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;   # replace with your domain when ready

    client_max_body_size 8M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/jhanarich
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

IP=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")
echo ""
echo "=============================================="
echo " DONE — site should be live on http://$IP"
echo " Admin:  http://$IP/admin"
echo " EDIT PASSWORD:  nano $APP_DIR/.env && pm2 restart jhanarich"
echo " Logs:           pm2 logs jhanarich"
echo " Later (domain): point DNS A record at $IP, then:"
echo "   sudo nano $NGINX_CONF   (set server_name)"
echo "   sudo systemctl reload nginx"
echo "   sudo apt install -y certbot python3-certbot-nginx && sudo certbot --nginx"
echo "=============================================="
