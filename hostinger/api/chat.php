<?php
// POST /api/chat.php — JHANA assistant (also auto-provisions the DB on first hit).
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/ai.php';

session_start();
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new RuntimeException('POST only', 405);

    // rate limit: 20/min/session
    $now = time();
    $_SESSION['chat_hits'] = array_values(array_filter($_SESSION['chat_hits'] ?? [], fn($t) => $t > $now - 60));
    if (count($_SESSION['chat_hits']) >= 20) throw new RuntimeException('Slow down a little', 429);
    $_SESSION['chat_hits'][] = $now;

    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $message = (string)($b['message'] ?? '');
    if ($message === '' || mb_strlen($message) > 500) throw new RuntimeException('Invalid message', 400);

    $rows = jh_db()->query("SELECT name, category, description, image, featured, active FROM Product WHERE active = 1")->fetchAll();
    $out = jhana_answer($message, $rows);

    $prods = array_slice(array_map(fn($p) => [
        'name' => $p['name'], 'category' => $p['category'],
        'image' => $p['image'], 'description' => $p['description'],
    ], $out['products']), 0, 3);

    echo json_encode(['reply' => $out['reply'], 'products' => $prods]);
} catch (RuntimeException $e) {
    http_response_code($e->getCode() >= 400 ? $e->getCode() : 400);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Assistant unavailable']);
}
