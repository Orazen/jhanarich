# Hostinger Shared Hosting — Upload Guide

No Node, no Git, no Turso needed. The ZIP contains the full site (static HTML with
all animations) + a PHP backend (MySQL) + PHP admin console.

## 1. Create the MySQL database

hPanel → **Websites → Dashboard → Databases → Management**:

1. **New Database** → pick a name like `jhanarich`. Note the full DB name
   (e.g. `u123456789_jhanarich`), and create a DB user + password (same screen).
2. Keep this tab open — you'll paste the credentials in step 3.

## 2. Build the ZIP

On your Mac:

```bash
cd ~/jhanarich-web
npm run export:hostinger
# → jhanarich-hostinger.zip  (~3.4 MB)
```

## 3. Configure the ZIP (one file)

Unzip, open **`api/config.php`** in any text editor, and fill in from step 1:

```php
'db' => [
    'driver' => 'mysql',
    'host'   => 'localhost',           // Hostinger uses localhost
    'name'   => 'u123456789_jhanarich',
    'user'   => 'u123456789_admin',
    'pass'   => 'YOUR_DB_PASSWORD',
],
'admin' => [
    'user' => 'your-admin-username',
    'pass' => 'YOUR-STRONG-PASSWORD',
],
```

Re-zip the folder (select all contents → Compress). Or skip this step and edit
the file later via hPanel File Manager after uploading.

## 4. Upload

hPanel → **Files → File Manager** → open `public_html`:

1. Delete any default `default.php`/`index.html` inside it.
2. Upload the ZIP → right-click → **Extract** → confirm files landed directly in
   `public_html` (so `public_html/index.html` and `public_html/api/config.php`
   exist — not nested in a subfolder).
3. If hPanel extracts into a folder, move the contents up one level.

## 5. Done — it just works

- **Website:** `https://yourdomain.com` — the full animated site, identical to the
  local Next.js version. Products come from the MySQL DB via PHP.
- **JHANA chat:** first message auto-creates the tables and seeds the 26 products.
- **Admin:** `https://yourdomain.com/admin` (login with the credentials from step 3):
  overview stats, enquiry triage with ✦AI reply drafts, CSV export, product
  management with ✦AI descriptions.

## How the site gets its products

The static home page bakes in the product grid at export time. The admin's
product changes apply instantly to **JHANA chat + enquiries**. To refresh the
marketing grid after catalogue edits, re-run `npm run export:hostinger` and
re-upload (2 min), or ask me to wire product cards to a PHP fetch so they're
live too.

## Updating later

1. Edit anything locally → `npm run export:hostinger`
2. Upload the new ZIP → extract over `public_html` (DB credentials persist —
   the database is never overwritten by uploads).
