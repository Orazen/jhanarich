<?php
// Order email notifications — PHP mail() (Hostinger shared: enabled by default).
// admin@jhanarich.com is the account's own domain mailbox, so mail() delivers
// without SMTP credentials.

function jh_mail(string $to, string $subject, string $html, string $replyTo = ''): bool {
    $from = 'orders@jhanarich.com';
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: JHANARICH Orders <' . $from . '>',
        'X-Mailer: JHANARICH-SITE',
    ];
    if ($replyTo !== '') $headers[] = 'Reply-To: ' . $replyTo;
    return @mail($to, $subject, $html, implode("\r\n", $headers));
}

// inr formatter shared by order mails
function jh_inr($n): string { return '&#8377;' . number_format((float)$n, 0); }

// Full order confirmation → admin, acknowledgment → customer.
// $o = order row (array), $items = decoded items [[name,qty,price],...]
function jh_order_mails(array $o, array $items): void {
    $when = date('j M Y, H:i', strtotime($o['createdAt'] ?: 'now')) . ' IST';
    $ref = htmlspecialchars($o['ref']);

    // ---- item rows ----
    $rowsHtml = '';
    $total = 0; $anyPriced = false;
    foreach ($items as $it) {
        $line = '';
        if (($it['price'] ?? null) !== null && $it['price'] !== '') {
            $anyPriced = true;
            $line = jh_inr($it['price'] * max(1, (int)$it['qty']));
            $total += $it['price'] * max(1, (int)$it['qty']);
        }
        $rowsHtml .= '<tr>'
            . '<td style="padding:9px 12px;border-bottom:1px solid #eee;font-weight:600">' . htmlspecialchars($it['name']) . '</td>'
            . '<td style="padding:9px 12px;border-bottom:1px solid #eee;text-align:center">' . (int)$it['qty'] . '</td>'
            . '<td style="padding:9px 12px;border-bottom:1px solid #eee;text-align:right">' . (($it['price'] ?? null) !== null && $it['price'] !== '' ? jh_inr($it['price']) : '<span style="color:#999">on request</span>') . '</td>'
            . '<td style="padding:9px 12px;border-bottom:1px solid #eee;text-align:right">' . $line . '</td>'
            . '</tr>';
    }
    $totalHtml = $anyPriced
        ? '<tr><td colspan="3" style="padding:12px;text-align:right;font-weight:700">Estimated total</td><td style="padding:12px;text-align:right;font-weight:700">' . jh_inr($total) . '</td></tr>'
        : '<tr><td colspan="4" style="padding:12px;color:#999">Priced items on request — quote to be shared by the JHANARICH team.</td></tr>';

    $itemList = '';
    foreach ($items as $it) {
        $itemList .= '&#8226; ' . htmlspecialchars($it['name']) . ' × ' . (int)$it['qty']
            . ((($it['price'] ?? null) !== null && $it['price'] !== '') ? ' (' . jh_inr($it['price']) . ')' : ' (price on request)') . '<br>';
    }

    // ---- admin notification ----
    $adminHtml = '<div style="font-family:Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
  <div style="background:#151009;padding:22px 28px">
    <span style="color:#F3EDE1;font-family:Georgia,serif;font-size:20px;letter-spacing:.04em">JHANA<span style="color:#D69136">rich</span></span>
    <span style="float:right;color:#C2430B;font-family:monospace;font-size:11px;letter-spacing:.2em">NEW ORDER ' . $ref . '</span>
  </div>
  <div style="padding:26px 28px">
    <p style="margin:0 0 6px;font-size:15px">New direct order from the website:</p>
    <h2 style="margin:0 0 18px;font-size:19px">' . htmlspecialchars($o['name']) . ($o['business'] ? ' <span style="color:#888;font-weight:400">(' . htmlspecialchars($o['business']) . ')</span>' : '') . '</h2>
    <table style="border-collapse:collapse;font-size:13px;margin-bottom:18px">
      <tr><td style="padding:4px 14px 4px 0;color:#888">Phone</td><td><b>' . htmlspecialchars($o['phone'] ?: '—') . '</b></td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#888">Email</td><td>' . htmlspecialchars($o['email'] ?: '—') . '</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#888">City</td><td>' . htmlspecialchars($o['city'] ?: '—') . '</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#888">Placed</td><td>' . $when . '</td></tr>
    </table>
    <div style="font-size:14px;margin-bottom:6px;font-weight:600">Order items</div>' . $itemList . '
    ' . ($o['address'] ? '<div style="margin-top:14px;font-size:13px"><b>Delivery address:</b><br>' . nl2br(htmlspecialchars($o['address'])) . '</div>' : '') . '
    ' . ($o['notes'] ? '<div style="margin-top:12px;font-size:13px"><b>Notes:</b> ' . nl2br(htmlspecialchars($o['notes'])) . '</div>' : '') . '
    <a href="https://jhanarich.com/admin/orders.php?ref=' . $ref . '" style="display:inline-block;margin-top:22px;background:#C2430B;color:#fff;text-decoration:none;padding:11px 22px;border-radius:100px;font-size:12px;letter-spacing:.1em">OPEN IN ADMIN DASHBOARD</a>
    <p style="color:#999;font-size:11px;margin-top:18px">Manage at jhanarich.com/admin — Orders section. Reply to the customer on WhatsApp for fastest confirmation.</p>
  </div>
</div>';

    // ---- customer acknowledgment ----
    $custHtml = '<div style="font-family:Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
  <div style="background:#151009;padding:22px 28px">
    <span style="color:#F3EDE1;font-family:Georgia,serif;font-size:20px;letter-spacing:.04em">JHANA<span style="color:#D69136">rich</span></span>
    <span style="float:right;color:#D69136;font-family:monospace;font-size:11px;letter-spacing:.2em">ORDER ' . $ref . '</span>
  </div>
  <div style="padding:26px 28px;font-size:14px;line-height:1.6">
    <p style="margin:0 0 14px">Hello ' . htmlspecialchars(explode(' ', trim($o['name']))[0]) . ',</p>
    <p style="margin:0 0 14px">Thank you for your order. We have received it and our team will confirm pricing, availability and delivery on ' . ($o['phone'] ? '<b>WhatsApp (' . htmlspecialchars($o['phone']) . ')</b>' : 'this email') . ' within one business day.</p>
    <table style="border-collapse:collapse;width:100%;font-size:13px;margin:18px 0">
      <tr style="background:#faf8f3"><th style="padding:9px 12px;text-align:left">Item</th><th style="padding:9px 12px;text-align:center">Qty</th><th style="padding:9px 12px;text-align:right">Unit</th><th style="padding:9px 12px;text-align:right">Line</th></tr>'
      . $rowsHtml . $totalHtml . '
    </table>
    <p style="margin:0 0 14px">Your order reference is <b style="color:#C2430B">' . $ref . '</b> — quote it in any conversation with us.</p>
    ' . ($o['notes'] ? '<p style="margin:0 0 14px;color:#555"><b>Your notes:</b> ' . nl2br(htmlspecialchars($o['notes'])) . '</p>' : '') . '
    <a href="https://wa.me/919440121743?text=' . rawurlencode('Hello JHANARICH! Regarding my order ' . $o['ref'] . '.') . '" style="display:inline-block;background:#22c15e;color:#fff;text-decoration:none;padding:11px 22px;border-radius:100px;font-size:12px;letter-spacing:.1em">CHAT WITH US ON WHATSAPP</a>
    <p style="color:#999;font-size:11px;margin-top:22px">Jhanarich Private Limited · Madhurawada, Visakhapatnam 530048 · admin@jhanarich.com</p>
  </div>
</div>';

    jh_mail('admin@jhanarich.com', 'New order ' . $o['ref'] . ' — ' . $o['name'] . ($o['city'] ? ' (' . $o['city'] . ')' : ''), $adminHtml, (string)($o['email'] ?: ''));
    if (!empty($o['email'])) {
        jh_mail($o['email'], 'Order ' . $ref . ' received — JHANARICH', $custHtml, 'admin@jhanarich.com');
    }
}
