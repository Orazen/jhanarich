<?php
// ============================================
// JHANARICH — edit this file on your hosting.
// Get DB credentials from hPanel → Databases → Management.
// ============================================

$config = [
    'db' => [
        // 'mysql' on Hostinger, 'sqlite' for local testing
        'driver' => 'mysql',
        'host'   => 'localhost',
        'name'   => 'u123456789_jhanarich',
        'user'   => 'u123456789_admin',
        'pass'   => 'CHANGE_ME_DB_PASSWORD',
    ],
    // Admin console (/admin) — CHANGE before going live.
    'admin' => [
        'user' => 'admin',
        'pass' => 'jhanarich2025',
    ],
    'wa' => '919440121743',
    // Creates tables + seeds the 26-product catalogue on first run.
    'seed_if_empty' => true,
];

// Optional local override (config.local.php) — same structure, e.g. for
// testing with the sqlite driver. Gitignored, never uploaded.
$override = __DIR__ . '/config.local.php';
if (file_exists($override)) {
    $config = array_replace_recursive($config, require $override);
}
return $config;
