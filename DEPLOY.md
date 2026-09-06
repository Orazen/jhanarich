# Deploying JHANARICH on Hostinger VPS

The VPS filesystem is persistent, so the app runs on **plain SQLite — no external database needed** (Turso/Vercel not required).

## 1. Get the VPS

- Hostinger → **VPS** → plan **KVM 2 (2 GB RAM)** or higher (a 1 GB plan can't run `next build`; see "Low-RAM option" below).
- OS template: **Ubuntu 24.04** (or 22.04).
- Note the server **IP** and the **root password** from hPanel.

## 2. Clone and run the setup script

SSH in (or use hPanel's Browser terminal):

```bash
ssh root@YOUR_SERVER_IP
apt update && apt install -y git && mkdir -p /opt && cd /opt
git clone https://github.com/Orazen/jhanarich.git
cd jhanarich
bash scripts/vps-setup.sh
```

The script is idempotent — re-run any time to pull updates. It installs Node 20 + nginx + PM2, builds the app, creates `prisma/prod.db` with all 26 products, starts the site on port 3000 and proxies port 80.

## 3. Set the admin password (do this first!)

```bash
nano /opt/jhanarich/.env        # set ADMIN_USER + ADMIN_PASSWORD
pm2 restart jhanarich
```

Admin console: `http://YOUR_IP/admin`

## 4. Point your domain

1. In your domain's DNS: `A` record → `@` and `www` → `YOUR_SERVER_IP`.
2. On the VPS:
   ```bash
   sudo nano /etc/nginx/sites-available/jhanarich   # server_name yourdomain.com www.yourdomain.com;
   sudo nginx -t && sudo systemctl reload nginx
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com   # free HTTPS + auto-renew
   ```

## 5. Everyday operations

```bash
cd /opt/jhanarich
git pull && npm ci && npm run build && pm2 restart jhanarich   # update
pm2 logs jhanarich                                             # logs
pm2 monit                                                      # live status
```

Products & enquiries live in `prisma/prod.db` — back that file up periodically:
```bash
cp prisma/prod.db backups/prod-$(date +%F).db
```

## Low-RAM option (1 GB plans)

Build on your Mac and ship the artifacts instead of building on the VPS:

```bash
# local
npm ci && npm run build
rsync -av --exclude node_modules --exclude .next --exclude .git ./ root@IP:/opt/jhanarich/
ssh root@IP "cd /opt/jhanarich && npm ci && bash scripts/vps-setup.sh"
```

## Updating the catalogue

Admin → Products (live instantly). Bulk changes: edit `prisma/seed.mjs`, then
`npm run db:setup` (safe upsert — doesn't overwrite edits to other fields).
