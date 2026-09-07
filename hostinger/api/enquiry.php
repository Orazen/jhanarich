<?php
// POST /api/enquiry.php — save enquiry, return WhatsApp deep link.
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/ai.php';
require_once __DIR__ . '/mail.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new RuntimeException('POST only', 405);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];

    $name = trim((string)($b['name'] ?? ''));
    if (mb_strlen($name) < 2) throw new RuntimeException('Name is required', 400);

    $clip = fn($v, $n) => $v === null ? null : mb_substr((string)$v, 0, $n);
    $row = [
        'id' => 'e_' . bin2hex(random_bytes(10)),
        'name' => mb_substr($name, 0, 120),
        'phone' => $clip($b['phone'] ?? null, 40),
        'email' => $clip($b['email'] ?? null, 160),
        'business' => $clip($b['business'] ?? null, 120),
        'product' => $clip($b['product'] ?? null, 160),
        'line' => $clip($b['line'] ?? null, 120),
        'message' => $clip($b['message'] ?? null, 2000),
        'source' => ($b['source'] ?? '') === 'whatsapp' ? 'whatsapp' : 'website',
    ];

    $db = jh_db();
    $st = $db->prepare("INSERT INTO Enquiry (id, name, phone, email, business, product, line, message, source, status, createdAt)
                        VALUES (:id, :name, :phone, :email, :business, :product, :line, :message, :source, 'new', :now)");
    $st->execute([
        ':id' => $row['id'], ':name' => $row['name'], ':phone' => $row['phone'],
        ':email' => $row['email'], ':business' => $row['business'], ':product' => $row['product'],
        ':line' => $row['line'], ':message' => $row['message'], ':source' => $row['source'],
        ':now' => gmdate('Y-m-d H:i:s'),
    ]);

    $wa = jhana_classify($row);
    $text = "Hello JHANARICH! I'm {$row['name']}" . ($row['business'] ? " ({$row['business']})" : "") . ". "
          . ($row['product'] ? "I'm interested in: {$row['product']}." : ($row['line'] ? "Interested in: {$row['line']}." : ""))
          . ' ' . ($row['message'] ?: 'Please share your catalogue and pricing.');

    // admin heads-up (never blocks the response)
    try {
        $lines = [];
        foreach (['phone' => 'Phone', 'email' => 'Email', 'business' => 'Business', 'product' => 'Product', 'line' => 'Line'] as $k => $lbl) {
            if ($row[$k]) $lines[] = '<b>' . $lbl . ':</b> ' . htmlspecialchars($row[$k]);
        }
        $html = '<div style="font-family:Georgia,serif;background:#F7F2E7;padding:28px">'
              . '<div style="background:#1B1510;color:#F3EDE1;padding:18px 24px;border-radius:12px 12px 0 0;font-size:20px">New enquiry — ' . htmlspecialchars($row['name']) . '</div>'
              . '<div style="background:#fff;padding:22px 24px;border-radius:0 0 12px 12px;line-height:1.8;font-size:14px;color:#1B1510">'
              . implode('<br>', $lines)
              . ($row['message'] ? '<br><br><b>Message:</b><br>' . nl2br(htmlspecialchars($row['message'])) : '')
              . '<br><br><a href="https://jhanarich.com/admin/enquiries.php" style="background:#C2430B;color:#fff;padding:11px 20px;border-radius:100px;text-decoration:none;font-size:12px">OPEN IN ADMIN DASHBOARD</a>'
              . '</div></div>';
        jh_mail('admin@jhanarich.com', 'New enquiry — ' . $row['name'] . ($row['business'] ? ' (' . $row['business'] . ')' : ''), $html, (string)($row['email'] ?: ''));
    } catch (Throwable $e) {
        error_log('enquiry mail failed: ' . $e->getMessage());
    }

    echo json_encode([
        'ok' => true,
        'id' => $row['id'],
        'wa' => 'https://wa.me/' . jh_config()['wa'] . '?text=' . rawurlencode($text),
    ]);
} catch (RuntimeException $e) {
    http_response_code($e->getCode() >= 400 ? $e->getCode() : 400);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Something went wrong']);
}
