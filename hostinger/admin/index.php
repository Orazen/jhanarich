<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/_layout.php';
jh_admin_require();
$db = jh_db();

$enqNew  = (int)$db->query("SELECT COUNT(*) n FROM Enquiry WHERE status = 'new'")->fetch()['n'];
$enqAll  = (int)$db->query("SELECT COUNT(*) n FROM Enquiry")->fetch()['n'];
$prodN   = (int)$db->query("SELECT COUNT(*) n FROM Product")->fetch()['n'];
$latest  = $db->query("SELECT * FROM Enquiry ORDER BY createdAt DESC, id DESC LIMIT 6")->fetchAll();
$cats    = $db->query("SELECT category, COUNT(*) n FROM Product GROUP BY category")->fetchAll();
$max = 1; foreach ($cats as $c) $max = max($max, (int)$c['n']);
$catLabel = ['triply'=>'Triply','nonstick'=>'Non-Stick','steel'=>'Stainless Steel','handles'=>'Handles','plastic'=>'Plastic'];

jh_admin_head('Overview', 'Business pulse — updated live');
?>
<div class="stat-grid">
  <div class="stat-card"><b><?= $enqNew ?></b><span>New enquiries</span></div>
  <div class="stat-card"><b><?= $enqAll ?></b><span>Total enquiries</span></div>
  <div class="stat-card"><b><?= $prodN ?></b><span>Products live</span></div>
  <div class="stat-card"><b><?= count($cats) ?></b><span>Categories active</span></div>
</div>
<div class="panel">
  <div class="panel-h"><span>Catalogue composition</span><a href="products.php">Manage →</a></div>
  <div class="bar-chart">
    <?php foreach ($cats as $c): ?>
    <div class="bar-row"><span><?= $catLabel[$c['category']] ?? $c['category'] ?></span>
      <div class="track"><div class="bar" style="width: <?= (int)round($c['n'] / $max * 100) ?>%"></div></div>
      <b><?= (int)$c['n'] ?></b></div>
    <?php endforeach; ?>
  </div>
</div>
<div class="panel">
  <div class="panel-h"><span>Latest enquiries</span><a href="enquiries.php">View all →</a></div>
  <?php if (!$latest): ?>
    <div class="empty-state">No enquiries yet — they land here in real time.</div>
  <?php else: ?>
  <div class="table-scroll"><table class="admin-table">
    <thead><tr><th>When</th><th>Name</th><th>Business</th><th>Interest</th><th>Status</th></tr></thead>
    <tbody>
    <?php foreach ($latest as $e): ?>
      <tr>
        <td style="white-space:nowrap;color:var(--ink-faint);font-size:12px"><?= htmlspecialchars(date('j M', strtotime($e['createdAt']))) ?></td>
        <td><b><?= htmlspecialchars($e['name']) ?></b></td>
        <td><?= htmlspecialchars($e['business'] ?: '—') ?></td>
        <td><?= htmlspecialchars($e['product'] ?: $e['line'] ?: '—') ?></td>
        <td><span class="pill <?= htmlspecialchars($e['status']) ?>"><?= htmlspecialchars($e['status']) ?></span></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
  <?php endif; ?>
</div>
<?php jh_admin_foot();
