<?php
// POST /api/order.php — direct website order:
//   1. saved to OrderRequest (admin dashboard → Orders)
//   2. email notification → admin@jhanarich.com (+ customer ack if email given)
//   3. returns WhatsApp deep link with the full order summary
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mail.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new RuntimeException('POST only', 405);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];

    // honeypot: hidden field real browsers never fill
    if (!empty($b['website'])) { echo json_encode(['ok' => true, 'ref' => 'JR-' . strtoupper(bin2hex(random_bytes(3))), 'wa' => '']); exit; }

    $name = trim((string)($b['name'] ?? ''));
    $phone = preg_replace('/[^\d+]/', '', (string)($b['phone'] ?? ''));
    if (mb_strlen($name) < 2) throw new RuntimeException('Name is required', 400);
    if (strlen($phone) < 8) throw new RuntimeException('A valid phone / WhatsApp number is required', 400);

    $rawItems = is_array($b['items'] ?? null) ? $b['items'] : [];
    if (count($rawItems) > 60) throw new RuntimeException('Too many line items', 400);
    $items = [];
    foreach ($rawItems as $it) {
        if (!is_array($it)) continue;
        $qty = max(1, min(99999, (int)($it['qty'] ?? 1)));
        $nm = trim((string)($it['name'] ?? ''));
        if ($nm === '') continue;
        $price = isset($it['price']) && is_numeric($it['price']) ? max(0, (int)round((float)$it['price'])) : null;
        $items[] = [
            'slug' => mb_substr(trim((string)($it['slug'] ?? '')), 0, 160),
            'name' => mb_substr($nm, 0, 200),
            'qty' => $qty,
            'price' => $price,
        ];
    }
    if (!$items) throw new RuntimeException('Add at least one item — or note your requirement below and send as an enquiry', 400);

    $total = null;
    foreach ($items as $it) if ($it['price'] !== null) $total = ($total ?? 0) + $it['price'] * $it['qty'];

    // unique human ref: JR-XXXXXX
    for ($try = 0; $try < 5; $try++) {
        $ref = 'JR-' . strtoupper(substr(strtr(bin2hex(random_bytes(6)), ['0' => 'Q', '1' => 'R', 'l' => 'T']), 0, 6));
        $chk = jh_db()->prepare("SELECT COUNT(*) n FROM OrderRequest WHERE ref = :r");
        $chk->execute([':r' => $ref]);
        if ((int)$chk->fetch()['n'] === 0) break;
        $ref = null;
    }
    if (!$ref) $ref = 'JR-' . strtoupper(bin2hex(random_bytes(5)));

    $clip = fn($v, $n) => $v === null || $v === '' ? null : mb_substr((string)$v, 0, $n);
    $row = [
        'id' => 'o_' . bin2hex(random_bytes(10)),
        'ref' => $ref,
        'name' => mb_substr($name, 0, 200),
        'phone' => mb_substr($phone, 0, 40),
        'email' => $clip(filter_var($b['email'] ?? '', FILTER_VALIDATE_EMAIL) ? $b['email'] : null, 160),
        'business' => $clip($b['business'] ?? null, 200),
        'city' => $clip($b['city'] ?? null, 120),
        'address' => $clip($b['address'] ?? null, 600),
        'notes' => $clip($b['notes'] ?? null, 1000),
        'items' => json_encode($items, JSON_UNESCAPED_UNICODE),
        'total' => $total,
        'createdAt' => gmdate('Y-m-d H:i:s'),
    ];

    $db = jh_db();
    $st = $db->prepare("INSERT INTO OrderRequest (id, ref, name, phone, email, business, city, address, notes, items, total, source, status, createdAt)
                        VALUES (:id, :ref, :name, :phone, :email, :business, :city, :address, :notes, :items, :total, 'website', 'new', :now)");
    $st->execute([
        ':id' => $row['id'], ':ref' => $row['ref'], ':name' => $row['name'], ':phone' => $row['phone'],
        ':email' => $row['email'], ':business' => $row['business'], ':city' => $row['city'],
        ':address' => $row['address'], ':notes' => $row['notes'], ':items' => $row['items'],
        ':total' => $row['total'], ':now' => gmdate('Y-m-d H:i:s'),
    ]);

    // email fan-out — never blocks the order response
    try { jh_order_mails($row, $items); } catch (Throwable $e) { error_log('order mail failed: ' . $e->getMessage()); }

    // WhatsApp order summary (customer taps send → lands in company WhatsApp)
    $inr = fn($n) => '₹' . number_format((float)$n);
    $lines = [];
    $i = 0;
    foreach ($items as $it) {
        $i++;
        $lines[] = "{$i}. {$it['name']} × {$it['qty']}" . ($it['price'] !== null ? ' — ' . $inr($it['price'] * $it['qty']) : ' — price on request');
    }
    $text = "🛒 *New Order — {$ref}*\n"
        . ($row['business'] ? "{$row['name']} ({$row['business']})\n" : "{$row['name']}\n")
        . "Phone: {$row['phone']}\n"
        . ($row['email'] ? "Email: {$row['email']}\n" : '')
        . ($row['city'] ? "City: {$row['city']}\n" : '')
        . "\n" . implode("\n", $lines) . "\n"
        . ($total !== null ? "\n*Estimated total: {$inr($total)}*" : "\n*Pricing on request*")
        . ($row['address'] ? "\n\nDeliver to: {$row['address']}" : '')
        . ($row['notes'] ? "\n\nNotes: {$row['notes']}" : '')
        . "\n\n— placed on jhanarich.com";
    if (mb_strlen($text) > 1800) $text = mb_substr($text, 0, 1800) . '…';

    echo json_encode([
        'ok' => true,
        'id' => $row['id'],
        'ref' => $ref,
        'wa' => 'https://wa.me/' . jh_config()['wa'] . '?text=' . rawurlencode($text),
    ]);
} catch (RuntimeException $e) {
    http_response_code($e->getCode() >= 400 ? $e->getCode() : 400);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Something went wrong']);
}
