<?php
// GET /api/prices.php — live price map for the static site grid.
// Returns {slug: {price, mrp, moq}} so admin edits reflect on the site
// without re-uploading the whole export.
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

try {
    $rows = jh_db()->query("SELECT slug, price, mrp, moq FROM Product WHERE active = 1")->fetchAll();
    $map = new stdClass();
    foreach ($rows as $r) {
        $map->{$r['slug']} = [
            'price' => $r['price'] !== null ? (int)$r['price'] : null,
            'mrp'   => $r['mrp'] !== null ? (int)$r['mrp'] : null,
            'moq'   => $r['moq'] !== null ? (int)$r['moq'] : null,
        ];
    }
    echo json_encode($map);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Unavailable']);
}
