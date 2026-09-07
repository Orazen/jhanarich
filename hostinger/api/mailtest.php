<?php
// Admin-only mail self-test: reports transport status, sends one branded email.
// Requires an admin session (log in at /admin/login.php first).
require_once __DIR__ . '/../admin/guard.php';
require_once __DIR__ . '/mail.php';
if (!jh_admin_ok()) { http_response_code(403); header('Content-Type: text/plain; charset=UTF-8'); exit("admin session required — log in at /admin/login.php first\n"); }
header('Content-Type: text/plain; charset=UTF-8');

$c = jh_mail_creds();
echo 'transport: ' . ($c['user'] !== '' && $c['host'] !== ''
    ? 'SMTP ' . $c['user'] . ' via ' . $c['host'] . ':' . $c['port'] . "\n"
    : "PHP mail() fallback — SMTP not configured in secrets.env\n");

$to = trim((string)($_GET['to'] ?? ''));
if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) { exit("usage: /api/mailtest.php?to=you@example.com\n"); }

$html = jh_mail_wrap('MAIL TEST ' . date('His'),
    '<p style="margin:0 0 10px">This is a delivery self-test from jhanarich.com.</p>'
    . '<p style="margin:0">If this lands in the inbox, order and status notifications will arrive too.</p>');
$ok = jh_mail($to, 'JHANARICH mail self-test — ' . date('j M Y H:i'), $html);
echo 'send: ' . ($ok ? "ACCEPTED\n" : "FAILED — check ~/.config/jhanarich/mail.log on the server\n");
