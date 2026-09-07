<?php
// CSV export of website orders.
require_once __DIR__ . '/guard.php';
jh_admin_require();
$db = jh_db();

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="jhanarich-orders.csv"');
$out = fopen('php://output', 'w');
fwrite($out, "\xEF\xBB\xBF"); // Excel UTF-8 BOM
fputcsv($out, ['Ref', 'Date', 'Name', 'Phone', 'Email', 'Business', 'City', 'Address', 'Items', 'Total', 'Status', 'Notes'], ',', '"', "\\");

$st = $db->query("SELECT * FROM OrderRequest ORDER BY createdAt DESC");
foreach ($st->fetchAll() as $o) {
    $items = json_decode($o['items'], true) ?: [];
    $lines = [];
    foreach ($items as $it) $lines[] = $it['qty'] . ' x ' . $it['name'] . (($it['price'] ?? null) !== null ? ' @ ' . $it['price'] : '');
    fputcsv($out, [
        $o['ref'], $o['createdAt'], $o['name'], $o['phone'], $o['email'], $o['business'], $o['city'],
        $o['address'], implode('; ', $lines), $o['total'], $o['status'], $o['notes'],
    ], ',', '"', "\\");
}
fclose($out);
