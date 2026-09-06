<?php
// temporary diagnostic — delete after use
header('Content-Type: text/plain');
$home = getenv('HOME');
echo 'HOME=', $home ?: '(none)', PHP_EOL;
$sf = $home . '/.config/jhanarich/secrets.env';
echo 'path=', $sf, PHP_EOL;
echo 'exists=', var_export(file_exists($sf), true), PHP_EOL;
$s = file_exists($sf) ? parse_ini_file($sf) : [];
echo 'keys=', implode(',', array_keys($s ?: [])), PHP_EOL;
echo 'dbpass_len=', strlen($s['DB_PASS'] ?? ''), PHP_EOL;
echo 'adminpass_len=', strlen($s['ADMIN_PASS'] ?? ''), PHP_EOL;
require __DIR__ . '/api/db.php';
require __DIR__ . '/admin/guard.php';
echo 'login_check=', var_export(jh_admin_login('admin', 'JhanarichAdmin#2026'), true), PHP_EOL;
