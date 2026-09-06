<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/_layout.php';
jh_admin_require();
$db = jh_db();
$cats = ['triply','nonstick','steel','handles','plastic'];
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $id = $_POST['id'] ?? '';

    if ($action === 'toggle' && $id) {
        $st = $db->prepare("UPDATE Product SET active = 1 - active, updatedAt = :now WHERE id = :id");
        $st->execute([':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        $msg = 'Visibility updated.';
    }
    if ($action === 'featured' && $id) {
        $st = $db->prepare("UPDATE Product SET featured = 1 - featured, updatedAt = :now WHERE id = :id");
        $st->execute([':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        $msg = 'Featured updated.';
    }
    if ($action === 'order' && $id && isset($_POST['sortOrder'])) {
        $st = $db->prepare("UPDATE Product SET sortOrder = :o, updatedAt = :now WHERE id = :id");
        $st->execute([':o' => (int)$_POST['sortOrder'], ':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        $msg = 'Order saved.';
    }
    if ($action === 'editcat' && $id && in_array($_POST['category'] ?? '', $cats, true)) {
        $st = $db->prepare("UPDATE Product SET category = :c, updatedAt = :now WHERE id = :id");
        $st->execute([':c' => $_POST['category'], ':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        $msg = 'Category updated.';
    }
    if ($action === 'delete' && $id) {
        $st = $db->prepare("DELETE FROM Product WHERE id = :id");
        $st->execute([':id' => $id]);
        $msg = 'Product deleted.';
    }
    if ($action === 'aiwrite' && $id) {
        $st = $db->prepare("SELECT name, category, description FROM Product WHERE id = :id");
        $st->execute([':id' => $id]);
        $p = $st->fetch();
        if ($p) {
            $st = $db->prepare("UPDATE Product SET description = :d, updatedAt = :now WHERE id = :id");
            $st->execute([':d' => jhana_description($p['name'], $p['category'], $p['description']), ':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        }
        $msg = '✦ AI wrote a fresh description.';
    }
    if ($action === 'add') {
        $name = trim($_POST['name'] ?? '');
        $category = in_array($_POST['category'] ?? '', $cats, true) ? $_POST['category'] : 'triply';
        if ($name !== '') {
            $slug = strtolower(preg_replace('/[^a-z0-9]+/', '-', $name)) . '-' . substr(bin2hex(random_bytes(2)), 0, 4);
            $st = $db->prepare("INSERT INTO Product (id, slug, name, category, description, image, active, featured, sortOrder, createdAt, updatedAt)
                                VALUES (:id, :slug, :name, :category, :description, :image, 1, 0, :sortOrder, :now, :now)");
            $st->execute([
                ':id' => 'p_' . bin2hex(random_bytes(10)), ':slug' => $slug, ':name' => $name,
                ':category' => $category,
                ':description' => jhana_description($name, $category, $_POST['description'] ?? ''),
                ':image' => trim($_POST['image'] ?? '') ?: '/assets/image3.jpg',
                ':sortOrder' => (int)($_POST['sortOrder'] ?? 99), ':now' => gmdate('Y-m-d H:i:s'),
            ]);
            $msg = "Added “{$name}”.";
        }
    }
    header('Location: products.php' . (!empty($_POST['back']) ? '?filter=' . urlencode($_POST['back']) : ''));
    exit;
}

$filter = in_array($_GET['filter'] ?? '', $cats, true) ? $_GET['filter'] : 'all';
if ($filter === 'all') {
    $rows = $db->query("SELECT * FROM Product ORDER BY category, sortOrder")->fetchAll();
} else {
    $st = $db->prepare("SELECT * FROM Product WHERE category = :c ORDER BY category, sortOrder");
    $st->execute([':c' => $filter]);
    $rows = $st->fetchAll();
}
$live = count(array_filter($rows, fn($r) => $r['active']));

jh_admin_head('Products', count($rows) . " shown · {$live} live on site");
?>
<?php if ($msg): ?>
<div class="panel" style="padding:14px 20px;background:#EDF7EE;border-color:rgba(34,150,83,.3)"><?= htmlspecialchars($msg) ?> <a href="products.php" style="color:var(--ink-faint);font-family:var(--mono);font-size:10px;margin-left:8px">clear</a></div>
<?php endif; ?>
<div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:18px">
  <div class="filters">
    <a class="<?= $filter === 'all' ? 'on' : '' ?>" href="?filter=all">all</a>
    <?php foreach ($cats as $c): ?>
      <a class="<?= $filter === $c ? 'on' : '' ?>" href="?filter=<?= $c ?>"><?= $c ?></a>
    <?php endforeach; ?>
  </div>
  <form method="post" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input type="hidden" name="action" value="add">
    <input class="admin-input" name="name" placeholder="New product name" style="width:200px" required>
    <select name="category" class="admin-select" style="width:130px">
      <?php foreach ($cats as $c): ?><option value="<?= $c ?>"><?= $c ?></option><?php endforeach; ?>
    </select>
    <input class="admin-input" name="image" placeholder="/assets/image.jpg" style="width:170px">
    <button class="admin-btn">+ Add (AI writes copy)</button>
  </form>
</div>
<div class="panel">
  <div class="table-scroll"><table class="admin-table">
    <thead><tr><th>Product</th><th>Category</th><th>Image</th><th>Order</th><th>Live</th><th>Featured</th><th>AI</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $p): $waNum = ''; ?>
      <tr>
        <td><b><?= htmlspecialchars($p['name']) ?></b><div style="font-size:12px;color:var(--ink-faint);max-width:280px"><?= htmlspecialchars(mb_strimwidth($p['description'], 0, 90, '…')) ?></div></td>
        <td>
          <form method="post">
            <input type="hidden" name="action" value="editcat"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>">
            <select name="category" class="admin-select" style="width:130px;padding:7px 10px" onchange="this.form.submit()">
              <?php foreach ($cats as $c): ?><option value="<?= $c ?>" <?= $p['category'] === $c ? 'selected' : '' ?>><?= $c ?></option><?php endforeach; ?>
            </select>
          </form>
        </td>
        <td style="width:76px">
          <?php if (!str_starts_with($p['image'], 'svg:')): ?>
            <img src="<?= htmlspecialchars($p['image']) ?>" alt="" style="width:56px;height:42px;object-fit:contain;background:#F6F1E7;border-radius:8px;padding:3px">
          <?php else: ?><span style="font-family:var(--mono);font-size:10px;color:var(--ink-faint)">SVG</span><?php endif; ?>
        </td>
        <td style="width:80px">
          <form method="post"><input type="hidden" name="action" value="order"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>">
          <input class="admin-input" type="number" name="sortOrder" value="<?= (int)$p['sortOrder'] ?>" style="width:64px;padding:7px 8px" onchange="this.form.submit()"></form>
        </td>
        <td>
          <form method="post"><input type="hidden" name="action" value="toggle"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>">
          <button class="pill <?= $p['active'] ? 'live' : 'hidden' ?>" style="border:none;cursor:pointer"><?= $p['active'] ? 'live' : 'hidden' ?></button></form>
        </td>
        <td>
          <form method="post"><input type="hidden" name="action" value="featured"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>">
          <input type="checkbox" <?= $p['featured'] ? 'checked' : '' ?> onchange="this.form.submit()"></form>
        </td>
        <td>
          <form method="post"><input type="hidden" name="action" value="aiwrite"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>">
          <button class="admin-btn gold" style="padding:7px 12px">✦ AI</button></form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
</div>
<div class="panel" style="padding:20px">
  <div class="panel-h" style="border:none;padding:0 0 12px"><span>Notes</span></div>
  <p style="font-size:13.5px;color:var(--ink-soft)">Changes here apply instantly to the <b>JHANA chat assistant</b> and the enquiry system. The marketing page grid is baked at export — re-upload the ZIP after catalogue changes, or run <code style="font-family:var(--mono);font-size:12px">npm run export:hostinger</code> locally.</p>
</div>
<?php jh_admin_foot();
