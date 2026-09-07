<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/_layout.php';
jh_admin_require();
$db = jh_db();

$enqNew  = (int)$db->query("SELECT COUNT(*) n FROM Enquiry WHERE status = 'new'")->fetch()['n'];
$enqAll  = (int)$db->query("SELECT COUNT(*) n FROM Enquiry")->fetch()['n'];
$prodN   = (int)$db->query("SELECT COUNT(*) n FROM Product")->fetch()['n'];
try {
  $ordNew  = (int)$db->query("SELECT COUNT(*) n FROM OrderRequest WHERE status = 'new'")->fetch()['n'];
  $ordAll  = (int)$db->query("SELECT COUNT(*) n FROM OrderRequest")->fetch()['n'];
  $ordVal  = (int)$db->query("SELECT COALESCE(SUM(total), 0) n FROM OrderRequest WHERE status IN ('confirmed','shipped','closed')")->fetch()['n'];
  $latestO = $db->query("SELECT * FROM OrderRequest ORDER BY createdAt DESC, id DESC LIMIT 5")->fetchAll();
} catch (Throwable $e) {
  $ordNew = $ordAll = $ordVal = 0; $latestO = [];
}
$latest  = $db->query("SELECT * FROM Enquiry ORDER BY createdAt DESC, id DESC LIMIT 6")->fetchAll();
$cats    = $db->query("SELECT category, COUNT(*) n FROM Product GROUP BY category")->fetchAll();
$max = 1; foreach ($cats as $c) $max = max($max, (int)$c['n']);
$catLabel = ['triply'=>'Triply','nonstick'=>'Non-Stick','steel'=>'Stainless Steel','handles'=>'Handles','plastic'=>'Plastic'];

jh_admin_head('Overview', 'Business pulse — updated live');
?>
<div class="stat-grid">
  <div class="stat-card" style="border-color:rgba(194,67,11,.45)"><b><?= $ordNew ?></b><span>New orders</span></div>
  <div class="stat-card"><b><?= $ordAll ?></b><span>Total orders</span></div>
  <div class="stat-card"><b>₹<?= number_format($ordVal) ?></b><span>Confirmed value</span></div>
  <div class="stat-card"><b><?= $enqNew ?></b><span>New enquiries</span></div>
  <div class="stat-card"><b><?= $enqAll ?></b><span>Total enquiries</span></div>
  <div class="stat-card"><b><?= $prodN ?></b><span>Products live</span></div>
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
  <div class="panel-h"><span>Latest orders</span><a href="orders.php">View all →</a></div>
  <?php if (!$latestO): ?>
    <div class="empty-state">No direct orders yet — website orders land here instantly with email + WhatsApp fan-out.</div>
  <?php else: ?>
  <div class="table-scroll"><table class="admin-table">
    <thead><tr><th>When</th><th>Ref</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
    <tbody>
    <?php foreach ($latestO as $o): $its = json_decode($o['items'], true) ?: []; $sum = [];
      foreach (array_slice($its, 0, 2) as $it) $sum[] = htmlspecialchars($it['name']) . ' × ' . (int)$it['qty'];
      if (count($its) > 2) $sum[] = '+' . (count($its) - 2) . ' more'; ?>
      <tr>
        <td style="white-space:nowrap;color:var(--ink-faint);font-size:12px"><?= htmlspecialchars(date('j M', strtotime($o['createdAt']))) ?></td>
        <td><span class="order-ref"><?= htmlspecialchars($o['ref']) ?></span></td>
        <td><b><?= htmlspecialchars($o['name']) ?></b></td>
        <td class="order-items"><?= implode(', ', $sum) ?: '—' ?></td>
        <td style="white-space:nowrap;font-weight:600"><?= $o['total'] !== null ? '₹' . number_format((float)$o['total']) : '<span style="color:var(--ink-faint);font-weight:400;font-size:12px">on request</span>' ?></td>
        <td><span class="pill <?= htmlspecialchars($o['status']) ?>"><?= htmlspecialchars($o['status']) ?></span></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
  <?php endif; ?>
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
