<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/../api/mail.php';
require_once __DIR__ . '/_layout.php';
jh_admin_require();
$db = jh_db();

const ORD_STATUSES = ['new', 'confirmed', 'shipped', 'closed', 'cancelled'];

// actions (all POST + param-bound)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    if (($_POST['action'] ?? '') === 'status' && in_array($_POST['status'] ?? '', ORD_STATUSES, true) && $id) {
        $cur = $db->prepare("SELECT * FROM OrderRequest WHERE id = :id");
        $cur->execute([':id' => $id]);
        $o = $cur->fetch();
        // email the customer only on a real status change (not a re-save)
        if ($o && $o['status'] !== $_POST['status']) {
            $st = $db->prepare("UPDATE OrderRequest SET status = :s WHERE id = :id");
            $st->execute([':s' => $_POST['status'], ':id' => $id]);
            try { jh_order_status_mail($o, $_POST['status']); } catch (Throwable $e) { error_log('status mail failed: ' . $e->getMessage()); }
        }
    }
    if (($_POST['action'] ?? '') === 'delete' && $id) {
        $st = $db->prepare("DELETE FROM OrderRequest WHERE id = :id");
        $st->execute([':id' => $id]);
    }
    header('Location: orders.php' . (!empty($_POST['back']) ? '?filter=' . urlencode($_POST['back']) : ''));
    exit;
}

$filter = in_array($_GET['filter'] ?? '', ORD_STATUSES, true) ? $_GET['filter'] : 'all';
$refQ = trim((string)($_GET['ref'] ?? ''));
if ($refQ !== '') {
    // deep link from the admin notification email (?ref=JR-XXXXXX, partial ok)
    $st = $db->prepare("SELECT * FROM OrderRequest WHERE ref LIKE :r ORDER BY createdAt DESC, id DESC");
    $st->execute([':r' => '%' . $refQ . '%']);
    $rows = $st->fetchAll();
} elseif ($filter === 'all') {
    $rows = $db->query("SELECT * FROM OrderRequest ORDER BY createdAt DESC, id DESC")->fetchAll();
} else {
    $st = $db->prepare("SELECT * FROM OrderRequest WHERE status = :s ORDER BY createdAt DESC, id DESC");
    $st->execute([':s' => $filter]);
    $rows = $st->fetchAll();
}
$newN = count(array_filter($rows, fn($r) => $r['status'] === 'new'));
$value = 0;
foreach ($rows as $r) if ($r['total'] !== null) $value += (int)$r['total'];

function ord_items(string $json): array {
    $a = json_decode($json, true);
    return is_array($a) ? $a : [];
}
function ord_summary(array $items): string {
    $parts = [];
    foreach (array_slice($items, 0, 2) as $it) $parts[] = htmlspecialchars($it['name']) . ' × ' . (int)$it['qty'];
    if (count($items) > 2) $parts[] = '+' . (count($items) - 2) . ' more';
    return implode(', ', $parts) ?: '—';
}

jh_admin_head('Orders', "{$newN} new · " . count($rows) . " shown · ₹" . number_format($value) . " pipeline");
?>
<div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:18px">
  <div class="filters">
    <?php foreach (array_merge(['all'], ORD_STATUSES) as $f): ?>
      <a class="<?= $filter === $f ? 'on' : '' ?>" href="?filter=<?= $f ?>"><?= $f ?></a>
    <?php endforeach; ?>
  </div>
  <a class="admin-btn ghost" href="export-orders.php">↓ Export CSV</a>
</div>
<div class="panel">
  <?php if (!$rows): ?>
    <div class="empty-state">No orders yet — direct orders from the website land here instantly (plus email notification).</div>
  <?php else: ?>
  <div class="table-scroll"><table class="admin-table">
    <thead><tr><th>When</th><th>Ref</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
    <?php foreach ($rows as $o): $items = ord_items($o['items']); $waNum = preg_replace('/\D/', '', $o['phone'] ?? ''); ?>
      <tr>
        <td style="white-space:nowrap;color:var(--ink-faint);font-size:12px">
          <?= htmlspecialchars(date('j M', strtotime($o['createdAt']))) ?><br><?= htmlspecialchars(date('H:i', strtotime($o['createdAt']))) ?></td>
        <td><span class="order-ref"><?= htmlspecialchars($o['ref']) ?></span></td>
        <td><b><?= htmlspecialchars($o['name']) ?></b>
          <?php if ($o['business']): ?><br><span style="font-size:11px;color:var(--ink-faint)"><?= htmlspecialchars($o['business']) ?></span><?php endif; ?>
          <?php if ($o['phone']): ?><br><span style="font-size:12px"><?= htmlspecialchars($o['phone']) ?></span><?php endif; ?></td>
        <td class="order-items" style="max-width:230px"><?= ord_summary($items) ?></td>
        <td style="white-space:nowrap;font-weight:600"><?= $o['total'] !== null ? '₹' . number_format((float)$o['total']) : '<span style="color:var(--ink-faint);font-weight:400;font-size:12px">on request</span>' ?></td>
        <td>
          <form method="post" style="display:inline">
            <input type="hidden" name="action" value="status"><input type="hidden" name="id" value="<?= htmlspecialchars($o['id']) ?>">
            <input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>">
            <select name="status" class="pill <?= htmlspecialchars($o['status']) ?>" style="border:none;cursor:pointer;text-transform:uppercase" onchange="this.form.submit()">
              <?php foreach (ORD_STATUSES as $s): ?>
                <option value="<?= $s ?>" <?= $o['status'] === $s ? 'selected' : '' ?>><?= $s ?></option>
              <?php endforeach; ?>
            </select>
          </form>
        </td>
        <td>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <?php if ($waNum): ?>
              <a class="wa-reply" target="_blank" rel="noopener" href="https://wa.me/<?= $waNum ?>?text=<?= rawurlencode('Hello ' . $o['name'] . '! This is JHANARICH regarding your order ' . $o['ref'] . '. We are confirming availability and delivery details.') ?>">Reply</a>
            <?php endif; ?>
            <?php if ($o['email']): ?>
              <a class="wa-reply" style="color:var(--ink-soft)" href="mailto:<?= htmlspecialchars($o['email']) ?>?subject=<?= rawurlencode('Your JHANARICH order ' . $o['ref']) ?>">✉</a>
            <?php endif; ?>
            <form method="post" onsubmit="return confirm('Delete this order permanently?')">
              <input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= htmlspecialchars($o['id']) ?>">
              <input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>">
              <button class="admin-btn danger" style="padding:7px 12px">Del</button>
            </form>
          </div>
        </td>
      </tr>
      <tr style="background:#FBF8F1">
        <td></td>
        <td colspan="6" class="order-items">
          <?php foreach ($items as $it): ?>
            <div><b><?= (int)$it['qty'] ?> × <?= htmlspecialchars($it['name']) ?></b> — <?= ($it['price'] ?? null) !== null && $it['price'] !== '' ? '₹' . number_format((float)$it['price']) . ' / unit' : 'price on request' ?></div>
          <?php endforeach; ?>
          <?php if ($o['address']): ?><div style="margin-top:6px"><b>Address:</b> <?= nl2br(htmlspecialchars($o['address'])) ?></div><?php endif; ?>
          <?php if ($o['notes']): ?><div style="margin-top:4px"><b>Notes:</b> <?= nl2br(htmlspecialchars($o['notes'])) ?></div><?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
  <?php endif; ?>
</div>
<?php jh_admin_foot();
