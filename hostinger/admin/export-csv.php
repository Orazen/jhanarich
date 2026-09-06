<?php
require_once __DIR__ . '/guard.php';
jh_admin_require();
$db = jh_db();

$st = $db->prepare("SELECT * FROM Enquiry ORDER BY createdAt DESC, id DESC");
$st->execute();
$rows = $st->fetchAll();

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="jhanarich-enquiries-' . date('Y-m-d') . '.csv"');
$out = fopen('php://output', 'w');
fputcsv($out, ['createdAt','name','phone','email','business','product','line','message','source','status'], separator: ",", enclosure: "\"", escape: "\\");
foreach ($rows as $r) {
    fputcsv($out, [$r['createdAt'],$r['name'],$r['phone'],$r['email'],$r['business'],$r['product'],$r['line'],$r['message'],$r['source'],$r['status']], separator: ",", enclosure: "\"", escape: "\\");
}
fclose($out);
