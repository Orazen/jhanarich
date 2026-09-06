<?php
require_once __DIR__ . '/guard.php';
if (jh_admin_ok()) { header('Location: index.php'); exit; }

$err = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (jh_admin_login($_POST['username'] ?? '', $_POST['password'] ?? '')) {
        session_regenerate_id(true);
        $_SESSION['jh_admin'] = true;
        $_SESSION['jh_admin_exp'] = time() + 7 * 86400;
        header('Location: index.php'); exit;
    }
    $err = 'Invalid credentials';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login — JHANARICH</title>
<link rel="icon" type="image/png" href="/assets/logo.png">
<style>
body{margin:0;font-family:"Instrument Sans",Helvetica,sans-serif;-webkit-font-smoothing:antialiased}
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(90% 90% at 50% 0%,#241B10,#151009);padding:20px}
.login-card{background:#fff;border-radius:22px;padding:46px 42px;width:min(430px,100%);box-shadow:0 60px 120px -40px rgba(0,0,0,.65)}
.login-card img{height:64px;margin:0 auto 18px;display:block}
.login-card h1{font-family:Fraunces,Georgia,serif;font-weight:480;font-size:24px;text-align:center;margin:0}
.login-card .sub{font-family:"IBM Plex Mono",monospace;font-size:9.5px;letter-spacing:.24em;text-transform:uppercase;color:#C2430B;text-align:center;margin:8px 0 28px;display:block}
.field-g{margin-bottom:16px}
.field-g label{font-family:"IBM Plex Mono",monospace;font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:#8B7E6E;display:block;margin-bottom:6px}
.admin-input{font-size:14px;padding:11px 12px;border:1.5px solid rgba(27,21,16,.16);border-radius:10px;width:100%;outline:none;box-sizing:border-box}
.admin-input:focus{border-color:#C2430B}
.admin-btn{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:14px;border-radius:100px;background:#1B1510;color:#fff;border:none;cursor:pointer;width:100%}
.admin-btn:hover{background:#C2430B}
.err{color:#b3372c;font-size:13px;margin-bottom:14px}
</style>
</head>
<body>
<div class="login-wrap">
  <form class="login-card" method="post">
    <img src="/assets/logo.png" alt="JHANARICH">
    <h1>Admin Console</h1>
    <span class="sub">Jhanarich Private Limited</span>
    <?php if ($err): ?><p class="err"><?= htmlspecialchars($err) ?></p><?php endif; ?>
    <div class="field-g"><label>Username</label><input class="admin-input" name="username" required autofocus autocomplete="username"></div>
    <div class="field-g"><label>Password</label><input class="admin-input" type="password" name="password" required autocomplete="current-password"></div>
    <button class="admin-btn">Sign in</button>
  </form>
</div>
</body>
</html>
