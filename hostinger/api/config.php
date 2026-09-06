<?php
// JHANARICH — production config (Hostinger, MySQL).
// DB password + admin password come from ~/.config/jhanarich/secrets.env
// (outside the webroot), restored from your backup — never stored here.

$config = [
    'db' => [
        'driver' => 'mysql',
        'host'   => 'localhost',
        'name'   => 'u347958425_Jhanarich',
        'user'   => 'u347958425_Jhanarich',
        'pass'   => '', // from secrets.env
    ],
    'admin' => [
        'user' => 'admin',
        'pass' => '', // from secrets.env (ADMIN_PASS)
    ],
    'wa' => '919440121743',
    'seed_if_empty' => true,
];

$override = __DIR__ . '/config.local.php';
if (file_exists($override)) {
    $config = array_replace_recursive($config, require $override);
}
return $config;
