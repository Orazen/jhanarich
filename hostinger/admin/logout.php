<?php
require_once __DIR__ . '/guard.php';
if (!jh_admin_ok()) { header('Location: login.php'); exit; }
jh_admin_logout();
header('Location: login.php');
