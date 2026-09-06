#!/usr/bin/env bash
# JHANARICH — Hostinger static export
# Builds the site as static HTML (all animations intact) and packages it with
# the PHP backend (api/ + admin/) ready to upload into public_html.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> 1/7 stash server-only parts (PHP replaces them in the export)"
if [ -d app/api ]; then mv app/api .export-stash-api; fi
if [ -d app/admin ]; then mv app/admin .export-stash-admin; fi
sed -i.bak 's/^export const dynamic = "force-dynamic";$//' app/page.jsx

cleanup() {
  if [ -d .export-stash-api ]; then
    rm -rf app/api
    mv .export-stash-api app/api
  fi
  if [ -d .export-stash-admin ]; then
    rm -rf app/admin
    mv .export-stash-admin app/admin
  fi
  [ -f app/page.jsx.bak ] && mv app/page.jsx.bak app/page.jsx
  return 0
}
trap cleanup EXIT

echo "==> 2/7 clean + build"
rm -rf out .next
NEXT_TELEMETRY_DISABLED=1 npx next build

echo "==> 3/7 prune export artefacts"
rm -rf out/admin out/api
find out -name "*.txt" -delete

echo "==> 4/6 point client fetches at PHP endpoints"
node scripts/rewrite-urls.mjs

echo "==> 5/7 add PHP backend"
mkdir -p out/api out/admin out/_logs
cp -r hostinger/api/. out/api/
cp -r hostinger/admin/. out/admin/
rm -f out/api/config.local.php        # local test override never ships
# local convenience: keep testing with the override even though it's not in the zip
[ -f hostinger/api/config.local.php ] && cp hostinger/api/config.local.php out/api/

echo "==> 6/7 package"
rm -f jhanarich-hostinger.zip
(cd out && zip -rq ../jhanarich-hostinger.zip .)

echo "==> 7/7 done"
echo ""
echo "DONE → $(pwd)/jhanarich-hostinger.zip ($(du -h jhanarich-hostinger.zip | cut -f1))"
echo "Upload the ZIP contents into public_html via hPanel File Manager, then"
echo "open https://yourdomain.com/api/chat.php once to auto-create the database."
