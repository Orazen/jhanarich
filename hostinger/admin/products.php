<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/_layout.php';
jh_admin_require();
$db = jh_db();
$cats = ['triply','nonstick','steel','handles','plastic'];
$toast = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $id = $_POST['id'] ?? '';

    if ($action === 'toggle' && $id) {
        $st = $db->prepare("UPDATE Product SET active = 1 - active, updatedAt = :now WHERE id = :id");
        $st->execute([':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        $toast = 'Visibility updated';
    }
    if ($action === 'featured' && $id) {
        $st = $db->prepare("UPDATE Product SET featured = 1 - featured, updatedAt = :now WHERE id = :id");
        $st->execute([':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        $toast = 'Featured updated';
    }
    if ($action === 'order' && $id && isset($_POST['sortOrder'])) {
        $st = $db->prepare("UPDATE Product SET sortOrder = :o, updatedAt = :now WHERE id = :id");
        $st->execute([':o' => (int)$_POST['sortOrder'], ':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        $toast = 'Order saved';
    }
    if ($action === 'editcat' && $id && in_array($_POST['category'] ?? '', $cats, true)) {
        $st = $db->prepare("UPDATE Product SET category = :c, updatedAt = :now WHERE id = :id");
        $st->execute([':c' => $_POST['category'], ':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        $toast = 'Category updated';
    }
    if ($action === 'price' && $id) {
        $price = ($_POST['price'] ?? '') === '' ? null : (int)$_POST['price'];
        $mrp   = ($_POST['mrp'] ?? '') === '' ? null : (int)$_POST['mrp'];
        $moq   = ($_POST['moq'] ?? '') === '' ? null : (int)$_POST['moq'];
        $st = $db->prepare("UPDATE Product SET price = :p, mrp = :m, moq = :q, updatedAt = :now WHERE id = :id");
        $st->execute([':p' => $price, ':m' => $mrp, ':q' => $moq, ':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        $toast = 'Pricing saved — live on site';
    }
    if ($action === 'delete' && $id) {
        $st = $db->prepare("DELETE FROM Product WHERE id = :id");
        $st->execute([':id' => $id]);
        $toast = 'Product deleted';
    }
    if ($action === 'aiwrite' && $id) {
        $st = $db->prepare("SELECT name, category, description FROM Product WHERE id = :id");
        $st->execute([':id' => $id]);
        $p = $st->fetch();
        if ($p) {
            $st = $db->prepare("UPDATE Product SET description = :d, updatedAt = :now WHERE id = :id");
            $st->execute([':d' => jhana_description($p['name'], $p['category'], $p['description']), ':now' => gmdate('Y-m-d H:i:s'), ':id' => $id]);
        }
        $toast = '✦ AI wrote a fresh description';
    }
    if ($action === 'add') {
        $name = trim($_POST['name'] ?? '');
        $category = in_array($_POST['category'] ?? '', $cats, true) ? $_POST['category'] : 'triply';
        if ($name !== '') {
            $slug = strtolower(preg_replace('/[^a-z0-9]+/', '-', $name)) . '-' . substr(bin2hex(random_bytes(2)), 0, 4);
            $price = ($_POST['price'] ?? '') === '' ? null : (int)$_POST['price'];
            $mrp = ($_POST['mrp'] ?? '') === '' ? null : (int)$_POST['mrp'];
            $moq = ($_POST['moq'] ?? '') === '' ? null : (int)$_POST['moq'];
            $st = $db->prepare("INSERT INTO Product (id, slug, name, category, description, image, price, mrp, moq, active, featured, sortOrder, createdAt, updatedAt)
                                VALUES (:id, :slug, :name, :category, :description, :image, :price, :mrp, :moq, 1, 0, :sortOrder, :now, :now)");
            $st->execute([
                ':id' => 'p_' . bin2hex(random_bytes(10)), ':slug' => $slug, ':name' => $name,
                ':category' => $category,
                ':description' => jhana_description($name, $category, $_POST['description'] ?? ''),
                ':image' => trim($_POST['image'] ?? '') ?: '/assets/image3.jpg',
                ':price' => $price, ':mrp' => $mrp, ':moq' => $moq,
                ':sortOrder' => (int)($_POST['sortOrder'] ?? 99), ':now' => gmdate('Y-m-d H:i:s'),
            ]);
            $toast = "Added “{$name}”";
        }
    }
    header('Location: products.php' . (!empty($_POST['back']) ? '?filter=' . urlencode($_POST['back']) : '') . (!empty($toast) ? '&toast=' . urlencode($toast) : ''));
    exit;
}

$filter = in_array($_GET['filter'] ?? '', $cats, true) ? $_GET['filter'] : 'all';
$q = trim($_GET['q'] ?? '');
if ($q !== '') {
    $st = $db->prepare("SELECT * FROM Product WHERE (name LIKE :n OR description LIKE :d) " . (in_array($filter, $cats, true) ? "AND category = :c " : "") . "ORDER BY category, sortOrder");
    $st->execute(array_merge([':n' => "%{$q}%", ':d' => "%{$q}%"], in_array($filter, $cats, true) ? [':c' => $filter] : []));
    $rows = $st->fetchAll();
} elseif ($filter === 'all') {
    $rows = $db->query("SELECT * FROM Product ORDER BY category, sortOrder")->fetchAll();
} else {
    $st = $db->prepare("SELECT * FROM Product WHERE category = :c ORDER BY category, sortOrder");
    $st->execute([':c' => $filter]);
    $rows = $st->fetchAll();
}
$live = count(array_filter($rows, fn($r) => $r['active']));
$toastIn = trim($_GET['toast'] ?? '');

jh_admin_head('Products', count($rows) . " shown · {$live} live on site");
?>
<?php if ($toastIn): ?>
<div class="toast" id="toast"><?= htmlspecialchars($toastIn) ?></div>
<?php endif; ?>
<div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:18px">
  <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
    <div class="filters">
      <a class="<?= $filter === 'all' ? 'on' : '' ?>" href="?filter=all<?= $q !== '' ? '&q=' . urlencode($q) : '' ?>">all</a>
      <?php foreach ($cats as $c): ?>
        <a class="<?= $filter === $c ? 'on' : '' ?>" href="?filter=<?= $c ?><?= $q !== '' ? '&q=' . urlencode($q) : '' ?>"><?= $c ?></a>
      <?php endforeach; ?>
    </div>
    <form method="get" style="display:flex;gap:8px">
      <input type="hidden" name="filter" value="<?= htmlspecialchars($filter) ?>">
      <input class="admin-input" type="search" name="q" value="<?= htmlspecialchars($q) ?>" placeholder="Search name or description…" style="width:230px;padding:8px 14px;border-radius:100px">
    </form>
  </div>
  <form method="post" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input type="hidden" name="action" value="add">
    <input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>">
    <input class="admin-input" name="name" placeholder="New product name" style="width:190px" required>
    <select name="category" class="admin-select" style="width:120px">
      <?php foreach ($cats as $c): ?><option value="<?= $c ?>"><?= $c ?></option><?php endforeach; ?>
    </select>
    <input class="admin-input" type="number" name="price" placeholder="Price ₹" style="width:88px">
    <input class="admin-input" type="number" name="mrp" placeholder="MRP ₹" style="width:88px">
    <input class="admin-input" type="number" name="moq" placeholder="MOQ" style="width:70px">
    <button class="admin-btn">+ Add</button>
  </form>
</div>
<div class="panel">
  <div class="table-scroll"><table class="admin-table">
    <thead><tr><th>Product</th><th>Category</th><th>Pricing ₹ (price · MRP · MOQ)</th><th>Order</th><th>Live</th><th>Featured</th><th>AI</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $p): ?>
      <tr>
        <td><b><?= htmlspecialchars($p['name']) ?></b><div style="font-size:12px;color:var(--ink-faint);max-width:260px"><?= htmlspecialchars(mb_strimwidth($p['description'], 0, 80, '…')) ?></div></td>
        <td>
          <form method="post">
            <input type="hidden" name="action" value="editcat"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>"><input type="hidden" name="q" value="<?= htmlspecialchars($q) ?>">
            <select name="category" class="admin-select" style="width:120px;padding:6px 8px" onchange="this.form.submit()">
              <?php foreach ($cats as $c): ?><option value="<?= $c ?>" <?= $p['category'] === $c ? 'selected' : '' ?>><?= $c ?></option><?php endforeach; ?>
            </select>
          </form>
        </td>
        <td>
          <form method="post" class="price-form">
            <input type="hidden" name="action" value="price"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>"><input type="hidden" name="q" value="<?= htmlspecialchars($q) ?>">
            <div style="display:flex;gap:5px;align-items:center">
              <input class="admin-input num" type="number" name="price" value="<?= $p['price'] !== null ? (int)$p['price'] : '' ?>" placeholder="—" style="width:76px;padding:6px 8px" title="Selling price">
              <input class="admin-input num" type="number" name="mrp" value="<?= $p['mrp'] !== null ? (int)$p['mrp'] : '' ?>" placeholder="MRP" style="width:70px;padding:6px 8px" title="MRP (strike-through)">
              <input class="admin-input num" type="number" name="moq" value="<?= $p['moq'] !== null ? (int)$p['moq'] : '' ?>" placeholder="MOQ" style="width:60px;padding:6px 8px" title="Minimum order qty">
              <button class="admin-btn ghost" style="padding:6px 10px" title="Save pricing">✓</button>
            </div>
          </form>
        </td>
        <td style="width:70px">
          <form method="post"><input type="hidden" name="action" value="order"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>"><input type="hidden" name="q" value="<?= htmlspecialchars($q) ?>">
          <input class="admin-input" type="number" name="sortOrder" value="<?= (int)$p['sortOrder'] ?>" style="width:56px;padding:6px 8px" onchange="this.form.submit()"></form>
        </td>
        <td>
          <form method="post"><input type="hidden" name="action" value="toggle"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>"><input type="hidden" name="q" value="<?= htmlspecialchars($q) ?>">
          <button class="pill <?= $p['active'] ? 'live' : 'hidden' ?>" style="border:none;cursor:pointer"><?= $p['active'] ? 'live' : 'hidden' ?></button></form>
        </td>
        <td>
          <form method="post"><input type="hidden" name="action" value="featured"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>"><input type="hidden" name="q" value="<?= htmlspecialchars($q) ?>">
          <input type="checkbox" <?= $p['featured'] ? 'checked' : '' ?> onchange="this.form.submit()"></form>
        </td>
        <td>
          <form method="post"><input type="hidden" name="action" value="aiwrite"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>"><input type="hidden" name="q" value="<?= htmlspecialchars($q) ?>">
          <button class="admin-btn gold" style="padding:7px 12px">✦</button></form>
        </td>
        <td>
          <form method="post" onsubmit="return confirm('Delete this product permanently?')">
            <input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>"><input type="hidden" name="back" value="<?= htmlspecialchars($filter) ?>"><input type="hidden" name="q" value="<?= htmlspecialchars($q) ?>">
            <button class="admin-btn danger" style="padding:7px 10px">✕</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
</div>
<div class="panel" style="padding:20px">
  <div class="panel-h" style="border:none;padding:0 0 12px"><span>Notes</span></div>
  <p style="font-size:13.5px;color:var(--ink-soft)">Pricing, visibility and description changes apply <b>instantly</b> to the live site, the JHANA chat assistant and enquiries. Empty price = “price on request” on the site. MRP shows as a muted strike-through; discounts ≥ 15% get an automatic “% off” badge.</p>
</div>
<?php jh_admin_foot();
