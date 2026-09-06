<?php
// Shared admin chrome.
function jh_admin_head(string $title, string $sub): void {
    $active = basename($_SERVER['PHP_SELF']);
    $nav = ['index.php' => '◆ Overview', 'enquiries.php' => '✉ Enquiries', 'products.php' => '▣ Products'];
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= htmlspecialchars($title) ?> — JHANARICH Admin</title>
<link rel="icon" type="image/png" href="/assets/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Instrument+Sans:wght@400..700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--paper:#F3EDE1;--paper-2:#EAE1CF;--ink:#1B1510;--ink-soft:#584D40;--ink-faint:#8B7E6E;--ember:#C2430B;--gold:#D69136;--line:rgba(27,21,16,.16);--line-soft:rgba(27,21,16,.09);--dark:#151009;--serif:"Fraunces",Georgia,serif;--sans:"Instrument Sans",Helvetica,sans-serif;--mono:"IBM Plex Mono",monospace;--ease:cubic-bezier(.22,1,.36,1)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#F6F1E7;color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
.admin-shell{display:grid;grid-template-columns:232px 1fr;min-height:100vh}
.admin-side{background:var(--dark);color:var(--paper);padding:26px 18px;display:flex;flex-direction:column;gap:4px;position:sticky;top:0;height:100vh}
.admin-side .brand{display:flex;align-items:center;gap:10px;margin-bottom:22px;padding:0 10px}
.admin-side .brand img{height:40px;border-radius:50%;background:#241B10;padding:3px}
.admin-side .brand b{font-family:var(--serif);font-weight:500;letter-spacing:.04em;font-size:16px}
.admin-side .lbl{font-family:var(--mono);font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:rgba(243,237,225,.35);padding:16px 14px 6px}
.admin-side a{display:flex;gap:10px;align-items:center;padding:11px 14px;border-radius:10px;color:rgba(243,237,225,.6);font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;transition:all .3s;text-decoration:none}
.admin-side a:hover{color:#F3EDE1;background:rgba(243,237,225,.06)}
.admin-side a.active{background:var(--ember);color:#fff}
.admin-side .foot{margin-top:auto;padding:14px;font-family:var(--mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,237,225,.3)}
.admin-main{padding:36px clamp(20px,3.4vw,52px);max-width:1240px;width:100%}
.admin-top{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:26px}
.admin-h1{font-family:var(--serif);font-size:clamp(26px,3vw,38px);font-weight:450;line-height:1.05}
.admin-sub{font-family:var(--mono);font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-faint);margin-top:8px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:26px}
.stat-card{background:#fff;border:1px solid var(--line-soft);border-radius:16px;padding:20px 22px;position:relative;overflow:hidden}
.stat-card b{font-family:var(--serif);font-size:36px;font-weight:500;display:block;line-height:1.1}
.stat-card span{font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint)}
.panel{background:#fff;border:1px solid var(--line-soft);border-radius:16px;overflow:hidden;margin-bottom:26px}
.panel-h{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--line-soft);font-family:var(--mono);font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-soft)}
.panel-h a{color:var(--ember);text-decoration:none}
.table-scroll{overflow-x:auto}
table.admin-table{width:100%;border-collapse:collapse;font-size:14px}
.admin-table th{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint);text-align:left;padding:12px 16px;border-bottom:1px solid var(--line-soft);white-space:nowrap}
.admin-table td{padding:13px 16px;border-bottom:1px solid var(--line-soft);vertical-align:middle}
.admin-table tbody tr:last-child td{border-bottom:none}
.admin-table tbody tr:hover{background:#FBF8F1}
.pill{display:inline-flex;padding:5px 12px;border-radius:100px;font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase}
.pill.new{background:rgba(194,67,11,.12);color:var(--ember)}
.pill.contacted{background:rgba(214,145,54,.16);color:#8a5a10}
.pill.closed{background:rgba(34,150,83,.14);color:#1c7a41}
.pill.live{background:rgba(34,150,83,.14);color:#1c7a41}
.pill.hidden{background:rgba(27,21,16,.08);color:var(--ink-faint)}
.admin-btn{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:10px 18px;border-radius:100px;background:var(--ink);color:#fff;border:none;cursor:pointer;transition:all .3s;display:inline-flex;align-items:center;gap:8px;text-decoration:none}
.admin-btn:hover{background:var(--ember)}
.admin-btn.ghost{background:transparent;border:1px solid var(--line);color:var(--ink-soft)}
.admin-btn.ghost:hover{border-color:var(--ink);background:transparent;color:var(--ink)}
.admin-btn.gold{background:var(--gold)}
.admin-btn.gold:hover{background:var(--ember)}
.admin-btn.danger{background:transparent;border:1px solid rgba(200,52,42,.35);color:#b3372c}
.admin-btn.danger:hover{background:rgba(200,52,42,.08)}
.admin-input,.admin-select,textarea.admin-input{font-family:var(--sans);font-size:14px;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:#fff;outline:none;color:var(--ink);width:100%}
.admin-input:focus,.admin-select:focus,textarea.admin-input:focus{border-color:var(--ember)}
.field-g label{font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint);display:block;margin-bottom:6px}
.bar-chart{display:flex;flex-direction:column;gap:14px;padding:20px}
.bar-row{display:grid;grid-template-columns:170px 1fr 44px;gap:12px;align-items:center;font-size:13px}
.bar-row .track{height:12px;border-radius:6px;background:rgba(27,21,16,.06);overflow:hidden}
.bar-row .bar{height:100%;border-radius:6px;background:linear-gradient(90deg,var(--ember),var(--gold))}
.bar-row b{font-family:var(--mono);font-size:12px;font-weight:500;text-align:right}
.empty-state{padding:44px 20px;text-align:center;color:var(--ink-faint);font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}
.filters{display:flex;gap:8px;flex-wrap:wrap}
.filters a,.filters button{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:8px 14px;border-radius:100px;border:1.5px solid var(--line);background:#fff;color:var(--ink-soft);cursor:pointer;transition:all .3s;text-decoration:none}
.filters .on,.filters a:hover,.filters button:hover{background:var(--ink);border-color:var(--ink);color:#fff}
.modal{position:fixed;inset:0;background:rgba(21,16,9,.55);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px}
.modal .panel{width:min(560px,100%);padding:26px;margin:0}
.modal.wide .panel{width:min(680px,100%)}
.wa-reply{display:inline-flex;align-items:center;gap:6px;color:#1c7a41;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;text-decoration:none}
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(90% 90% at 50% 0%,#241B10,var(--dark));padding:20px}
.login-card{background:#fff;border-radius:22px;padding:46px 42px;width:min(430px,100%);box-shadow:0 60px 120px -40px rgba(0,0,0,.65)}
.login-card img{height:64px;margin:0 auto 18px;display:block}
.login-card h1{font-family:var(--serif);font-weight:480;font-size:24px;text-align:center}
.login-card .sub{font-family:var(--mono);font-size:9.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--ember);text-align:center;margin:8px 0 28px;display:block}
.err{color:#b3372c;font-size:13px;margin-bottom:14px}
.ai-badge{background:var(--gold);color:#fff}
@media(max-width:900px){.admin-shell{grid-template-columns:1fr}.admin-side{position:static;height:auto;flex-direction:row;flex-wrap:wrap;align-items:center}.admin-side .brand{margin-bottom:0}.admin-side .lbl,.admin-side .foot{display:none}.stat-grid{grid-template-columns:repeat(2,1fr)}.bar-row{grid-template-columns:110px 1fr 40px}}
</style>
</head>
<body>
<div class="admin-shell">
  <aside class="admin-side">
    <div class="brand"><img src="/assets/logo.png" alt="JHANARICH"><b>JHANARICH</b></div>
    <div class="lbl">Console</div>
    <?php foreach ($nav as $href => $label): ?>
      <a href="<?= $href ?>" class="<?= $active === $href ? 'active' : '' ?>"><span><?= explode(' ', $label)[0] ?></span><?= preg_replace('/^[^ ]+ /', '', $label) ?></a>
    <?php endforeach; ?>
    <div class="lbl">Site</div>
    <a href="/"><span>↗</span>View website</a>
    <a href="logout.php"><span>→</span>Sign out</a>
    <div class="foot">Jhanarich Pvt Ltd<br>Visakhapatnam, IN</div>
  </aside>
  <main class="admin-main">
    <div class="admin-top">
      <div><h1 class="admin-h1"><?= htmlspecialchars($title) ?></h1><div class="admin-sub"><?= htmlspecialchars($sub) ?></div></div>
    </div>
<?php
}
function jh_admin_foot(): void { ?>
  </main>
</div>
</body>
</html>
<?php }
