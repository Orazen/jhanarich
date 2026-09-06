<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/_layout.php';
jh_admin_require();
$db = jh_db();

// actions (all POST + param-bound)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    if (($_POST['action'] ?? '') === 'status' && in_array($_POST['status'] ?? '', ['new','contacted','closed'], true) && $id) {
        $st = $db->prepare("UPDATE Enquiry SET status = :s WHERE id = :id");
        $st->execute([':s' => $_POST['status'], ':id' => $id]);
    }
    if (($_POST['action'] ?? '') === 'delete' && $id) {
        $st = $db->prepare("DELETE FROM Enquiry WHERE id = :id");
        $st->execute([':id' => $id]);
    }
    header('Location: enquiries.php' . (!empty($_POST['back']) ? '?filter=' . urlencode($_POST['back']) : ''));
    exit;
}

$filter = in_array($_GET['filter'] ?? '', ['new','contacted','closed'], true) ? $_GET['filter'] : 'all';
if ($filter === 'all') {
    $rows = $db->query("SELECT * FROM Enquiry ORDER BY createdAt DESC, id DESC")->fetchAll();
} else {
    $st = $db->prepare("SELECT * FROM Enquiry WHERE status = :s ORDER BY createdAt DESC, id DESC");
    $st->execute([':s' => $filter]);
    $rows = $st->fetchAll();
}
$newN = count(array_filter($rows, fn($r) => $r['status'] === 'new'));

// AI draft modal state
$ai = null;
if (isset($_GET['ai'])) {
    $st = $db->prepare("SELECT * FROM Enquiry WHERE id = :id");
    $st->execute([':id' => $_GET['ai']]);
    $row = $st->fetch();
    if ($row) $ai = ['row' => $row, 'draft' => jhana_draft($row)];
}

jh_admin_head('Enquiries', "{$newN} new · " . count($rows) . " shown");
?>
<div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:18px">
  <div class="filters">
    <?php foreach (['all','new','contacted','closed'] as $f): ?>
      <a class="<?= $filter === $f ? 'on' : '' ?>" href="?filter=<?= $f ?>"><?= $f ?></a>
    <?php endforeach; ?>
  </div>
  <a class="admin-btn ghost" href="export-csv.php">↓ Export CSV</a>
</div>
<div class="panel">
  <?php if (!$rows): ?>
    <div class="empty-state">Nothing here yet.</div>
  <?php else: ?>
  <div class="table-scroll"><table class="admin-table">
    <thead><tr><th>When</th><th>Contact</th><th>Interest</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
    <?php foreach ($rows as $e): $waNum = preg_replace('/\D/', '', $e['phone'] ?? ''); ?>
      <tr>
        <td style="white-space:nowrap;color:var(--ink-faint);font-size:12px">
          <?= htmlspecialchars(date('j M', strtotime($e['createdAt']))) ?><br><?= htmlspecialchars(date('H:i', strtotime($e['createdAt']))) ?></td>
        <td><b><?= htmlspecialchars($e['name']) ?></b><br>
          <?php if ($e['phone']): ?><span style="font-size:12px"><?= htmlspecialchars($e['phone']) ?></span><br><?php endif; ?>
          <?php if ($e['business']): ?><span style="font-size:11px;color:var(--ink-faint)"><?= htmlspecialchars($e['business']) ?></span><?php endif; ?></td>
        <td style="max-width:150px"><?= htmlspecialchars($e['product'] ?: $e['line'] ?: '—') ?></td>
        <td style="max-width:240px;font-size:13px;color:var(--ink-soft)"><?= htmlspecialchars(mb_strimwidth($e['message'] ?? '—', 0, 120, '…')) ?></td>
        <td>
          <form method="post" style="display:inline">
            <input type="hidden" name="action" value="status"><input type="hidden" name="id" value="<?= htmlspecialchars($e['id']) ?>">
            <input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>">
            <select name="status" class="pill <?= htmlspecialchars($e['status']) ?>" style="border:none;cursor:pointer;text-transform:uppercase" onchange="this.form.submit()">
              <?php foreach (['new','contacted','closed'] as $s): ?>
                <option value="<?= $s ?>" <?= $e['status'] === $s ? 'selected' : '' ?>><?= $s ?></option>
              <?php endforeach; ?>
            </select>
          </form>
        </td>
        <td>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <a class="admin-btn gold" style="padding:7px 12px;text-decoration:none" href="?filter=<?= htmlspecialchars($filter) ?>&ai=<?= htmlspecialchars($e['id']) ?>#ai">✦ AI</a>
            <?php if ($waNum): ?>
              <a class="wa-reply" target="_blank" rel="noopener" href="https://wa.me/<?= $waNum ?>?text=<?= rawurlencode('Hello ' . $e['name'] . "! This is JHANARICH regarding your cookware enquiry.") ?>">Reply</a>
            <?php endif; ?>
            <form method="post" onsubmit="return confirm('Delete this enquiry permanently?')">
              <input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= htmlspecialchars($e['id']) ?>">
              <input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>">
              <button class="admin-btn danger" style="padding:7px 12px">Del</button>
            </form>
          </div>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
  <?php endif; ?>
</div>

<?php if ($ai): ?>
<div class="modal" id="ai" onclick="if(event.target===this)location.href='enquiries.php?filter=<?= htmlspecialchars($filter) ?>'">
  <div class="panel" onclick="event.stopPropagation()">
    <div class="panel-h" style="border:none;padding:0 0 14px">
      <span>✦ AI draft — <?= htmlspecialchars($ai['row']['name']) ?></span>
      <span class="pill <?= $ai['draft']['urgency'] === 'high' ? 'new' : 'contacted' ?>"><?= htmlspecialchars($ai['draft']['intent']) ?> · <?= htmlspecialchars($ai['draft']['urgency']) ?> urgency</span>
    </div>
    <textarea class="admin-input" id="aiDraft" rows="7"><?= htmlspecialchars($ai['draft']['reply']) ?></textarea>
    <div style="display:flex;gap:10px;margin-top:16px">
      <?php $waNum = preg_replace('/\D/', '', $ai['row']['phone'] ?? ''); if ($waNum): ?>
        <a class="admin-btn" style="text-decoration:none" target="_blank" rel="noopener"
           href="https://wa.me/<?= $waNum ?>?text=" onclick="this.href='https://wa.me/<?= $waNum ?>?text='+encodeURIComponent(document.getElementById('aiDraft').value)">Send on WhatsApp ↗</a>
      <?php else: ?>
        <button class="admin-btn ghost" onclick="navigator.clipboard.writeText(document.getElementById('aiDraft').value);this.textContent='Copied ✓'">Copy draft</button>
      <?php endif; ?>
      <a class="admin-btn ghost" style="text-decoration:none" href="enquiries.php?filter=<?= htmlspecialchars($filter) ?>">Close</a>
    </div>
    <?php if (!$waNum): ?><p style="font-size:12px;color:var(--ink-faint);margin-top:12px">No phone on this enquiry — copy the draft or reply by email.</p><?php endif; ?>
  </div>
</div>
<script>document.querySelector('#ai textarea')?.focus();</script>
<?php endif; ?>
<?php jh_admin_foot();
