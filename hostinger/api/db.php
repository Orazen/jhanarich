<?php
// PDO connection + schema auto-provisioning + catalog seed.
// All queries use prepared statements (parameter binding) — no string SQL.

function jh_config() {
    static $c = null;
    if ($c === null) $c = require __DIR__ . '/config.php';
    return $c;
}

function jh_db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $c = jh_config()['db'];

    // Secrets (DB password, admin password) live OUTSIDE the webroot in
    // ~/.config/jhanarich/secrets.env — never inside public_html.
    // NOTE: web PHP often has no HOME env — resolve the account home from
    // this file's own path (public_html/api → 4 levels up = account home).
    $home = dirname(__DIR__, 4);
    $secretsFile = $home . '/.config/jhanarich/secrets.env';
    $secrets = file_exists($secretsFile) ? parse_ini_file($secretsFile) : [];

    $pass = !empty($c['pass']) ? $c['pass'] : ($secrets['DB_PASS'] ?? '');

    try {
        if (($c['driver'] ?? 'mysql') === 'sqlite') {
            $pdo = new PDO('sqlite:' . (__DIR__ . '/jhanarich.sqlite'));
        } else {
            $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $c['host'], $c['name']);
            $pdo = new PDO($dsn, $c['user'], $pass);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Database connection failed — check hostinger/api/config.php']);
        exit;
    }
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    jh_ensure_schema($pdo);
    return $pdo;
}

function jh_admin_check(string $user, string $pass): bool {
    $c = jh_config()['admin'];
    $home = dirname(__DIR__, 4);
    $secretsFile = $home . '/.config/jhanarich/secrets.env';
    $secrets = file_exists($secretsFile) ? parse_ini_file($secretsFile) : [];
    $expectUser = !empty($c['user']) ? $c['user'] : ($secrets['ADMIN_USER'] ?? 'admin');
    $expectPass = !empty($c['pass']) ? $c['pass'] : ($secrets['ADMIN_PASS'] ?? '');
    if ($expectPass === '') return false;
    return hash_equals($expectUser, $user) && hash_equals($expectPass, $pass);
}

function jh_ensure_schema(PDO $pdo): void {
    $c = jh_config();
    // BOOLEAN + CURRENT_TIMESTAMP defaults work on both MySQL and SQLite.
    $pdo->exec("CREATE TABLE IF NOT EXISTS Product (
        id VARCHAR(32) PRIMARY KEY,
        slug VARCHAR(160) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(40) NOT NULL,
        description TEXT NOT NULL,
        image VARCHAR(300) NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        featured INTEGER NOT NULL DEFAULT 0,
        sortOrder INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS Enquiry (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        phone VARCHAR(60) DEFAULT NULL,
        email VARCHAR(200) DEFAULT NULL,
        business VARCHAR(200) DEFAULT NULL,
        product VARCHAR(200) DEFAULT NULL,
        line VARCHAR(200) DEFAULT NULL,
        message TEXT DEFAULT NULL,
        source VARCHAR(20) NOT NULL DEFAULT 'website',
        status VARCHAR(20) NOT NULL DEFAULT 'new',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )");
    try { $pdo->exec("CREATE INDEX IF NOT EXISTS Product_category_idx ON Product (category)"); } catch (Throwable $e) {}
    try { $pdo->exec("CREATE INDEX IF NOT EXISTS Enquiry_status_idx ON Enquiry (status)"); } catch (Throwable $e) {}

    if (!empty($c['seed_if_empty'])) {
        $n = (int)$pdo->query("SELECT COUNT(*) AS n FROM Product")->fetch()['n'];
        if ($n === 0) jh_seed_products($pdo);
    }
}

function jh_products_seed(): array {
    return [
        ['honeycomb-fry-pan','Honeycomb Fry Pan','triply','Triply bonded body with laser honeycomb non-stick lattice.','/assets/pan-hero.png',1,1],
        ['triply-casserole','Casserole','triply','Glass-lidded triply casserole. Even browning, easy cleaning.','/assets/image6.jpg',2,1],
        ['honeycomb-tawa','Honeycomb Tawa','triply','Flat triply griddle for dosa, chapati and everyday rotis.','/assets/image10.jpg',3,0],
        ['triply-sauce-pan','Sauce Pan','triply','Triply sauce pan with riveted stay-cool handle.','/assets/wa-saucepan.jpg',4,0],
        ['triply-fry-pan','Fry Pan','triply','Classic triply fry pan — mirror finish, balanced pour.','/assets/image3.jpg',5,0],
        ['dosa-tawa','Dosa Tawa','triply','Wide triply tawa with honeycomb texture for crisp dosas.','/assets/image9.jpg',6,0],
        ['triply-set','Triply Set','triply','Kadai, tasla, tope and sauce pans — the full family.','/assets/image2.jpg',7,0],
        ['triply-tope','Tope','triply','Deep triply tope for boiling, simmering and stocks.','/assets/image27.jpg',8,0],
        ['granite-fry-pan','Granite Fry Pan','nonstick','3-layer granite coating, PFOA-free, bakelite handle.','/assets/image30.jpg',1,1],
        ['nonstick-casserole','Casserole','nonstick','Matte-black non-stick casserole with glass lid and induction bottom.','/assets/image13.jpg',2,0],
        ['nonstick-kadai','Kadai','nonstick','Deep non-stick kadai with twin stay-cool handles.','/assets/image22.jpg',3,0],
        ['grill-pan','Grill Pan','nonstick','Square grill pan with raised ribs and red spatter finish.','/assets/image23.jpg',4,0],
        ['fry-pan-set','Fry Pan Set','nonstick','Graduated fry pan set — matte black, induction ready.','/assets/image11.jpg',5,0],
        ['fry-pan-set-red','Fry Pan Set — Red','nonstick','Signature red exterior, 3-layer non-stick interior.','/assets/image12.jpg',6,0],
        ['nonstick-fry-pan','Fry Pan','nonstick','Everyday fry pan — maroon exterior, ergonomic grip.','/assets/image8.jpg',7,0],
        ['nonstick-tawa','Dosa Tawa','nonstick','Lightweight non-stick tawa, low oil cooking.','/assets/image21.jpg',8,0],
        ['steel-cups-plates','Steel Cups & Plates','steel','Food-grade SS serveware, mirror polished.','/assets/image26.jpg',1,0],
        ['ss-casserole','SS Casserole','steel','Deep stainless casserole with snug steel lid and loop handles.','/assets/wa-casserole.jpg',2,1],
        ['ss-tope','SS Tope','steel','Deep-drawn stainless tope with rolled rims.','/assets/image25.jpg',3,0],
        ['steel-bowls','Steel Bowls','steel','Nesting bowls and vessels in brushed or mirror finish.','/assets/image28.jpg',4,0],
        ['steel-tumblers','Tumblers & Cups','steel','Daily-use SS cups and tumblers, rust resistant.','/assets/image29.jpg',5,0],
        ['ss-handles','SS Side & Long Handles','handles','Stamped stainless side and long handles, built to rivet.','svg:ss-handles',1,0],
        ['casted-handles','Casted Handles','handles','Gravity-cast handles with solid weight and balance.','svg:casted',2,0],
        ['bakelite-handles','Bakelite Handles','handles','Heat-resistant bakelite grips in matte or woodgrain.','svg:bakelite',3,0],
        ['spice-boxes','Spice Boxes','plastic','Food-grade spice boxes with airtight lids.','svg:spice',1,0],
        ['packing-boxes','Packing Boxes','plastic','Durable plastic packing containers for kitchens & retail.','svg:packing',2,0],
    ];
}

function jh_seed_products(PDO $pdo): void {
    $driver = jh_config()['db']['driver'] ?? 'mysql';
    $ignore = $driver === 'sqlite' ? 'INSERT OR IGNORE INTO' : 'INSERT IGNORE INTO';
    $st = $pdo->prepare("$ignore Product
        (id, slug, name, category, description, image, active, featured, sortOrder, createdAt, updatedAt)
        VALUES (:id, :slug, :name, :category, :description, :image, 1, :featured, :sortOrder, :now, :now)");
    foreach (jh_products_seed() as [$slug, $name, $category, $description, $image, $sortOrder, $featured]) {
        $now = gmdate('Y-m-d H:i:s');
        $st->execute([
            ':id' => 'p_' . substr(md5($slug), 0, 20),
            ':slug' => $slug, ':name' => $name, ':category' => $category,
            ':description' => $description, ':image' => $image,
            ':featured' => $featured, ':sortOrder' => $sortOrder, ':now' => $now,
        ]);
    }
}
