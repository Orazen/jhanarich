<?php
// Admin session guard — include at the top of every admin page.
require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../api/ai.php';

function jh_admin_config() { return jh_config()['admin']; }

function jh_admin_login(string $u, string $p): bool {
    return jh_admin_check($u, $p);
}

function jh_admin_ok(): bool {
    if (session_status() === PHP_SESSION_NONE) session_start();
    return !empty($_SESSION['jh_admin']) && $_SESSION['jh_admin_exp'] > time();
}

function jh_admin_require(): void {
    if (!jh_admin_ok()) {
        header('Location: login.php');
        exit;
    }
}

function jh_admin_logout(): void {
    if (session_status() === PHP_SESSION_NONE) session_start();
    $_SESSION = [];
    session_destroy();
}
