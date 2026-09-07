<?php
// Order email notifications — PHP mail() (Hostinger shared: enabled by default).
// admin@jhanarich.com is the account's own domain mailbox, so mail() delivers
// without SMTP credentials.
//
// Templates: table-based HTML with inline styles (Gmail/Outlook safe). The logo
// is loaded from the live site — email clients cannot inline local assets.

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

function jh_esc($v): string { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }

// ---- shared branded shell -------------------------------------------------
// $badge = small gold label top-right (e.g. "NEW ORDER JR-XXXXXX")
function jh_mail_wrap(string $badge, string $bodyHtml, string $footerNote = ''): string {
    $foot = $footerNote !== '' ? $footerNote : 'Jhanarich Private Limited · Madhurawada, Visakhapatnam 530048 · admin@jhanarich.com';
    return '<!doctype html><html><body style="margin:0;padding:0;background:#F1EADB">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1EADB"><tr><td align="center" style="padding:26px 12px">'
        . '<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFDF8;border-radius:14px;overflow:hidden;border:1px solid #E4DBC6">'
        // header: logo + wordmark + badge (table cells — Outlook-safe)
        . '<tr><td style="background:#151009;padding:20px 26px">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
        . '<td style="width:46px"><img src="https://jhanarich.com/assets/logo.png" width="40" height="40" alt="JHANARICH" style="display:block;border-radius:9px"></td>'
        . '<td style="padding-left:12px;font-family:Georgia,serif;color:#F3EDE1;font-size:19px;letter-spacing:.05em">JHANA<span style="color:#D69136">rich</span>'
        . '<br><span style="font-size:9px;letter-spacing:.26em;color:#8D8377">STAINLESS STEEL COOKWARE · MADE IN INDIA</span></td>'
        . '<td align="right" valign="top" style="color:#D69136;font-family:Consolas,monospace;font-size:11px;letter-spacing:.16em">' . $badge . '</td>'
        . '</tr></table></td></tr>'
        // body
        . '<tr><td style="padding:26px 28px;font-family:Helvetica,Arial,sans-serif;color:#221D15;font-size:14px;line-height:1.65">' . $bodyHtml . '</td></tr>'
        // footer
        . '<tr><td style="padding:16px 24px;background:#FAF7EF;border-top:1px solid #EFE7D4;text-align:center;color:#9A9184;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.7">' . $foot . '</td></tr>'
        . '</table></td></tr></table></body></html>';
}

// green WhatsApp pill used across mails
function jh_wa_button(string $label, string $text): string {
    return '<a href="https://wa.me/919440121743?text=' . rawurlencode($text) . '" style="display:inline-block;background:#1FA855;color:#fff;text-decoration:none;padding:11px 24px;border-radius:100px;font-size:12px;letter-spacing:.1em;font-weight:bold">' . $label . '</a>';
}

// ---- HTML builders (public so they can be previewed/tested) ---------------

function jh_order_admin_html(array $o, array $items): string {
    $when = date('j M Y, H:i', strtotime($o['createdAt'] ?: 'now')) . ' IST';
    $body = '<p style="margin:0 0 6px;font-size:15px">New direct order from the website:</p>'
        . '<h2 style="margin:0 0 18px;font-size:19px">' . jh_esc($o['name']) . ($o['business'] ? ' <span style="color:#888;font-weight:400">(' . jh_esc($o['business']) . ')</span>' : '') . '</h2>'
        . '<table style="border-collapse:collapse;font-size:13px;margin-bottom:18px">'
        . '<tr><td style="padding:4px 14px 4px 0;color:#8B857A">Phone</td><td><b>' . jh_esc($o['phone'] ?: '—') . '</b></td></tr>'
        . '<tr><td style="padding:4px 14px 4px 0;color:#8B857A">Email</td><td>' . jh_esc($o['email'] ?: '—') . '</td></tr>'
        . '<tr><td style="padding:4px 14px 4px 0;color:#8B857A">City</td><td>' . jh_esc($o['city'] ?: '—') . '</td></tr>'
        . '<tr><td style="padding:4px 14px 4px 0;color:#8B857A">Placed</td><td>' . $when . '</td></tr>'
        . '</table>'
        . '<table style="border-collapse:collapse;width:100%;font-size:13px;margin:0 0 18px">'
        . '<tr style="background:#FAF7EF"><th align="left" style="padding:9px 12px">Item</th><th align="center" style="padding:9px 12px">Qty</th><th align="right" style="padding:9px 12px">Line</th></tr>';
    $total = 0; $anyPriced = false;
    foreach ($items as $it) {
        $priced = ($it['price'] ?? null) !== null && $it['price'] !== '';
        $line = $priced ? jh_inr($it['price'] * max(1, (int)$it['qty'])) : '<span style="color:#999">on request</span>';
        if ($priced) { $anyPriced = true; $total += $it['price'] * max(1, (int)$it['qty']); }
        $body .= '<tr><td style="padding:9px 12px;border-bottom:1px solid #EFE7D4;font-weight:600">' . jh_esc($it['name']) . '</td>'
            . '<td align="center" style="padding:9px 12px;border-bottom:1px solid #EFE7D4">' . (int)$it['qty'] . '</td>'
            . '<td align="right" style="padding:9px 12px;border-bottom:1px solid #EFE7D4">' . $line . '</td></tr>';
    }
    $body .= $anyPriced
        ? '<tr><td colspan="2" align="right" style="padding:12px;font-weight:700">Estimated total</td><td align="right" style="padding:12px;font-weight:700">' . jh_inr($total) . '</td></tr>'
        : '<tr><td colspan="3" style="padding:12px;color:#999">Priced items on request — quote to be shared by the JHANARICH team.</td></tr>';
    $body .= '</table>'
        . ($o['address'] ? '<div style="margin-top:14px;font-size:13px"><b>Delivery address:</b><br>' . nl2br(jh_esc($o['address'])) . '</div>' : '')
        . ($o['notes'] ? '<div style="margin-top:12px;font-size:13px"><b>Notes:</b> ' . nl2br(jh_esc($o['notes'])) . '</div>' : '')
        . '<a href="https://jhanarich.com/admin/orders.php?ref=' . rawurlencode($o['ref']) . '" style="display:inline-block;margin-top:22px;background:#C2430B;color:#fff;text-decoration:none;padding:11px 22px;border-radius:100px;font-size:12px;letter-spacing:.1em;font-weight:bold">OPEN IN ADMIN DASHBOARD</a>'
        . '<p style="color:#999;font-size:11px;margin-top:18px">Reply to the customer on WhatsApp for fastest confirmation.</p>';
    return jh_mail_wrap('NEW ORDER ' . jh_esc($o['ref']), $body,
        'Manage orders at jhanarich.com/admin · This is an automated notification from your website.');
}

function jh_order_customer_html(array $o, array $items): string {
    $ref = jh_esc($o['ref']);
    $body = '<p style="margin:0 0 14px">Hello ' . jh_esc(explode(' ', trim($o['name']))[0]) . ',</p>'
        . '<p style="margin:0 0 14px">Thank you for your order. We have received it and our team will confirm pricing, availability and delivery on '
        . ($o['phone'] ? '<b>WhatsApp (' . jh_esc($o['phone']) . ')</b>' : 'this email') . ' within one business day.</p>'
        . '<table style="border-collapse:collapse;width:100%;font-size:13px;margin:18px 0">'
        . '<tr style="background:#FAF7EF"><th align="left" style="padding:9px 12px">Item</th><th align="center" style="padding:9px 12px">Qty</th><th align="right" style="padding:9px 12px">Unit</th><th align="right" style="padding:9px 12px">Line</th></tr>';
    $total = 0; $anyPriced = false;
    foreach ($items as $it) {
        $priced = ($it['price'] ?? null) !== null && $it['price'] !== '';
        $line = $priced ? jh_inr($it['price'] * max(1, (int)$it['qty'])) : '<span style="color:#999">on request</span>';
        if ($priced) { $anyPriced = true; $total += $it['price'] * max(1, (int)$it['qty']); }
        $body .= '<tr><td style="padding:9px 12px;border-bottom:1px solid #EFE7D4;font-weight:600">' . jh_esc($it['name']) . '</td>'
            . '<td align="center" style="padding:9px 12px;border-bottom:1px solid #EFE7D4">' . (int)$it['qty'] . '</td>'
            . '<td align="right" style="padding:9px 12px;border-bottom:1px solid #EFE7D4">' . ($priced ? jh_inr($it['price']) : '<span style="color:#999">on request</span>') . '</td>'
            . '<td align="right" style="padding:9px 12px;border-bottom:1px solid #EFE7D4">' . $line . '</td></tr>';
    }
    $body .= $anyPriced
        ? '<tr><td colspan="3" align="right" style="padding:12px;font-weight:700">Estimated total</td><td align="right" style="padding:12px;font-weight:700">' . jh_inr($total) . '</td></tr>'
        : '<tr><td colspan="4" style="padding:12px;color:#999">Priced items on request — quote to be shared by the JHANARICH team.</td></tr>';
    $body .= '</table>'
        . '<p style="margin:0 0 14px">Your order reference is <b style="color:#C2430B">' . $ref . '</b> — quote it in any conversation with us.</p>'
        . ($o['notes'] ? '<p style="margin:0 0 14px;color:#555"><b>Your notes:</b> ' . nl2br(jh_esc($o['notes'])) . '</p>' : '')
        . jh_wa_button('CHAT WITH US ON WHATSAPP', 'Hello JHANARICH! Regarding my order ' . $o['ref'] . '.');
    return jh_mail_wrap('ORDER ' . $ref, $body);
}

// ---- status update → customer ---------------------------------------------

function jh_order_status_meta(string $s): array {
    switch ($s) {
        case 'confirmed':  return ['CONFIRMED', '#1E7D45', '#EAF6EE', 'Your order is confirmed', 'Good news — our team has confirmed your order. We will share final pricing, availability and delivery details on WhatsApp shortly.'];
        case 'shipped':    return ['SHIPPED', '#155E9C', '#EAF2FA', 'Your order is on its way', 'Your order has been dispatched and is on its way to the delivery address you provided.'];
        case 'closed':     return ['COMPLETED', '#8A6D1F', '#FAF6E8', 'Your order is complete', 'Your order has been delivered and closed. Thank you for choosing JHANARICH — we would love to cook with you again.'];
        case 'cancelled':  return ['CANCELLED', '#B3261E', '#FDECEA', 'Your order has been cancelled', 'Your order has been cancelled. If this was unexpected, reply to this email or message us on WhatsApp and we will help you.'];
        default:           return [strtoupper($s), '#5A5347', '#F4F0E7', 'Order update', 'The status of your order has been updated.'];
    }
}

function jh_order_status_html(array $o, string $status): string {
    [$label, $color, $bg, $headline, $copy] = jh_order_status_meta($status);
    $ref = jh_esc($o['ref']);
    $items = json_decode((string)$o['items'], true);
    $listHtml = '';
    if (is_array($items) && $items) {
        $listHtml = '<table style="border-collapse:collapse;width:100%;font-size:13px;margin:16px 0">'
            . '<tr style="background:#FAF7EF"><th align="left" style="padding:8px 12px">Item</th><th align="center" style="padding:8px 12px">Qty</th><th align="right" style="padding:8px 12px">Line</th></tr>';
        foreach ($items as $it) {
            $priced = ($it['price'] ?? null) !== null && $it['price'] !== '';
            $listHtml .= '<tr><td style="padding:8px 12px;border-bottom:1px solid #EFE7D4">' . jh_esc($it['name']) . '</td>'
                . '<td align="center" style="padding:8px 12px;border-bottom:1px solid #EFE7D4">' . (int)$it['qty'] . '</td>'
                . '<td align="right" style="padding:8px 12px;border-bottom:1px solid #EFE7D4">' . ($priced ? jh_inr($it['price'] * max(1, (int)$it['qty'])) : '<span style="color:#999">on request</span>') . '</td></tr>';
        }
        $listHtml .= '</table>';
    }
    $body = '<p style="margin:0 0 14px">Hello ' . jh_esc(explode(' ', trim($o['name']))[0]) . ',</p>'
        . '<div style="background:' . $bg . ';border-left:4px solid ' . $color . ';border-radius:8px;padding:14px 18px;margin:0 0 14px">'
        . '<div style="color:' . $color . ';font-size:11px;letter-spacing:.2em;font-weight:bold">' . $label . '</div>'
        . '<div style="font-size:17px;font-weight:bold;margin-top:4px">' . $headline . '</div>'
        . '<div style="color:#555;font-size:13px;margin-top:4px">' . $copy . '</div></div>'
        . $listHtml
        . '<p style="margin:14px 0">Order reference <b style="color:#C2430B">' . $ref . '</b> · Questions? Just reply to this email or reach us on WhatsApp.</p>'
        . jh_wa_button('MESSAGE US ON WHATSAPP', 'Hello JHANARICH! Regarding my order ' . $o['ref'] . '.');
    return jh_mail_wrap('ORDER ' . $ref . ' · ' . $label, $body);
}

// ---- senders ---------------------------------------------------------------

// Full order confirmation → admin, acknowledgment → customer.
// $o = order row (array), $items = decoded items [[name,qty,price],...]
function jh_order_mails(array $o, array $items): void {
    jh_mail('admin@jhanarich.com', 'New order ' . $o['ref'] . ' — ' . $o['name'] . ($o['city'] ? ' (' . $o['city'] . ')' : ''), jh_order_admin_html($o, $items), (string)($o['email'] ?: ''));
    if (!empty($o['email'])) {
        jh_mail($o['email'], 'Order ' . jh_esc($o['ref']) . ' received — JHANARICH', jh_order_customer_html($o, $items), 'admin@jhanarich.com');
    }
}

// Status change → customer. No-op without an email or for "new" (the ack mail
// already covers it). Never let mail() failure break the admin action.
function jh_order_status_mail(array $o, string $status): void {
    if (empty($o['email']) || $status === 'new') return;
    $subjects = [
        'confirmed' => 'Order ' . $o['ref'] . ' confirmed',
        'shipped'   => 'Order ' . $o['ref'] . ' shipped',
        'closed'    => 'Order ' . $o['ref'] . ' completed',
        'cancelled' => 'Order ' . $o['ref'] . ' cancelled',
    ];
    $subject = ($subjects[$status] ?? 'Update on order ' . $o['ref']) . ' — JHANARICH';
    jh_mail($o['email'], $subject, jh_order_status_html($o, $status), 'admin@jhanarich.com');
}
