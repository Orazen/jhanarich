<?php
// JHANA assistant brain — ported 1:1 from lib/ai.js (local engine).
require_once __DIR__ . '/db.php';

function jhana_answer(string $question, array $products): array {
    $q = strtolower(trim($question));
    if ($q === '') return ['reply' => 'Ask me anything about our cookware — series, sizes, coatings, MOQs, OEM.', 'products' => []];

    $has = fn(...$ws) => array_reduce($ws, fn($c, $w) => $c || str_contains($q, $w), false);

    if ($has('hi', 'hello', 'hey') && mb_strlen($q) < 12)
        return ['reply' => "Hey! I'm JHANA, the JHANARICH workshop assistant. Ask me about our triply, non-stick or stainless ranges — or say “OEM” if you want your own brand.", 'products' => []];

    if ($has('oem', 'private label', 'own brand', 'my brand'))
        return ['reply' => "Yes — OEM is our specialty. We manufacture to your spec with your logo, colours and packaging at production scale: custom branding & logo etching, bespoke packaging, product development to spec, flexible MOQs. Send your requirements on WhatsApp and we'll share the OEM deck.", 'products' => jh_filter($products, 'featured')];

    if ($has('price', 'cost', 'quote', 'moq', 'rate'))
        return ['reply' => "Pricing depends on sizes, finishes and volumes — we quote the same day. Ping us on WhatsApp with your SKU list or monthly quantities and you'll have a formal quote in hand. Flexible MOQs for first-time partners.", 'products' => jh_filter($products, 'featured')];

    if ($has('triply', 'three layer', '3 layer', 'honeycomb'))
        return ['reply' => "Triply is our flagship: a steel–aluminium–steel bond that heats edge to edge with zero hot spots. Food-safe 18/8 surface, induction-ready base. The Honeycomb range adds a laser-etched non-stick lattice — sears like cast iron, releases like non-stick. Works on gas, induction, electric and ceramic.", 'products' => jh_filter($products, 'triply')];

    if ($has('non stick', 'non-stick', 'nonstick', 'granite', 'kadai', 'grill'))
        return ['reply' => "Our non-stick line runs a 3-layer PFOA-free coating in matte black, granite or spatter finishes, with induction bottoms and bakelite handles — low-oil cooking that cleans in seconds. Fry pans, casseroles, kadais, grill pans and dosa tawas.", 'products' => jh_filter($products, 'nonstick')];

    if ($has('steel', 'stainless', 'cup', 'plate', 'bowl', 'tope'))
        return ['reply' => "The stainless essentials are deep-drawn food-grade steel, mirror polished and rust-resistant — cups, plates, bowls, topes and casseroles for daily and hospitality use.", 'products' => jh_filter($products, 'steel')];

    if ($has('where', 'location', 'address', 'visit', 'factory'))
        return ['reply' => "We're at # 27-17/9/8, Ayodhya Nagar, Madhurawada, Visakhapatnam, Andhra Pradesh 530048, India. Factory visits welcome — message us on WhatsApp to schedule one.", 'products' => []];

    if ($has('ship', 'dispatch', 'deliver', 'export', 'international'))
        return ['reply' => "We dispatch across India and export to partner markets — retail-ready or private-label packing. Share your city and quantities on WhatsApp and we'll confirm freight and timelines.", 'products' => []];

    if ($has('handle', 'bakelite'))
        return ['reply' => "We manufacture the hardware too: stamped SS side/long handles, gravity-cast handles and heat-resistant bakelite grips in matte or woodgrain — all rivet-ready.", 'products' => jh_filter($products, 'handles')];

    if ($has('plastic', 'spice', 'container', 'box'))
        return ['reply' => "Our plastics line covers food-grade spice boxes and durable packing containers — BPA-free and built for kitchen and retail duty.", 'products' => jh_filter($products, 'plastic')];

    // retrieval: token overlap scoring
    $stop = ['the','a','an','do','you','have','is','are','for','with','and','of','in','to','what','which','your'];
    $tokens = preg_split('/[^a-z0-9]+/', preg_replace('/[^a-z0-9 ]/', ' ', $q), -1, PREG_SPLIT_NO_EMPTY);
    $tokens = array_filter($tokens, fn($t) => mb_strlen($t) > 2 && !in_array($t, $stop, true));
    $scored = [];
    foreach ($products as $p) {
        $hay = strtolower($p['name'] . ' ' . $p['category'] . ' ' . $p['description']);
        $score = 0;
        foreach ($tokens as $t) if (str_contains($hay, $t)) $score++;
        if ($score > 0) $scored[] = ['p' => $p, 'score' => $score];
    }
    usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);
    if ($scored)
        return ['reply' => "Here's what matches “" . trim($question) . "” from our catalogue — tap Enquire on any card and we'll reply on WhatsApp the same day.", 'products' => array_slice(array_column($scored, 'p'), 0, 3)];

    return ['reply' => "I couldn't find that in the catalogue — but the team will know. Message us on WhatsApp with your requirement and we'll respond within a business day. Or ask me about triply, non-stick, stainless, handles, plastics or OEM.", 'products' => []];
}

function jh_filter(array $products, string $key): array {
    return array_values(array_filter($products, fn($p) => ($p[$key] ?? 0) == 1 || $p['category'] === $key));
}

function jhana_classify(array $e): array {
    $blob = ($e['message'] ?? '') . ' ' . ($e['product'] ?? '') . ' ' . ($e['line'] ?? '') . ' ' . ($e['business'] ?? '');
    $urgency = preg_match('/urgent|immediately|asap|bulk|large (order|qty|quantity)|tender|project|rush/i', $blob) ? 'high'
        : (preg_match('/hotel|restaurant|distributor|wholesaler|export/i', $e['business'] ?? '') ? 'medium' : 'low');
    if (preg_match('/oem|private label|our brand|own brand/i', $blob)) $intent = 'oem';
    elseif (preg_match('/price|quote|cost|moq|rate/i', $blob)) $intent = 'pricing';
    elseif (preg_match('/sample|catalogue|catalog/i', $blob)) $intent = 'catalogue';
    elseif (preg_match('/hotel|restaurant|commercial/i', $blob)) $intent = 'horeca';
    elseif (preg_match('/distribut|wholesal|retail|resell/i', $blob)) $intent = 'partnership';
    else $intent = 'general';
    return ['intent' => $intent, 'urgency' => $urgency];
}

function jhana_draft(array $e): array {
    $c = jhana_classify($e);
    $first = explode(' ', trim($e['name'] ?? 'there'))[0];
    $steps = [
        'oem' => "we do full OEM/private-label — logo etching, custom packaging, and specs to match your market. Could you share the products and quantities you have in mind? I'll send our OEM deck and MOQ sheet right away.",
        'pricing' => "happy to share pricing — it depends on sizes and quantities. Send me your SKU list or monthly volumes and I'll put a quote together the same day.",
        'catalogue' => "I'll WhatsApp over our latest catalogue with sizes, finishes and specs. If you tell me which series caught your eye (triply, non-stick or stainless), I'll highlight those pages.",
        'horeca' => "we supply hotels and restaurants across the region — heavy-gauge bodies built for commercial burners. Tell me your kitchen's volume and I'll recommend the right series plus bulk pricing.",
        'partnership' => "great timing — we're expanding our distributor network. Share your city and monthly volumes and I'll send our distributor terms and the full catalogue.",
        'general' => "thanks for reaching out! Tell me a little about what you're cooking up — sizes, quantities, or a product type — and I'll point you to the right series.",
    ];
    return ['reply' => "Hi {$first}! " . $steps[$c['intent']], 'intent' => $c['intent'], 'urgency' => $c['urgency']];
}

function jhana_description(string $name, string $category, string $hints = ''): string {
    $traits = [
        'triply' => 'triply-bonded steel-aluminium-steel body that heats edge to edge with zero hot spots',
        'nonstick' => 'three-layer PFOA-free non-stick release with a durable granite/matte finish',
        'steel' => 'deep-drawn food-grade stainless steel with a mirror polish that never reacts with food',
        'handles' => 'rivet-ready construction engineered for a lifetime of daily kitchen abuse',
        'plastic' => 'food-grade, BPA-free polymers built for commercial kitchen duty',
    ];
    $trait = $traits[$category] ?? $traits['triply'];
    $hintsL = mb_strtolower($hints);
    $finish = str_contains($hintsL, 'granite') ? 'granite' : (str_contains($hintsL, 'spatter') ? 'spatter' : (str_contains($hintsL, 'ceramic') ? 'ceramic' : (str_contains($hintsL, 'black') || str_contains($hintsL, 'matte') ? 'matte' : 'mirror')));
    $openings = [
        "The {$name} is built around a {$trait}.",
        "Engineered for daily service, the {$name} pairs a {$trait}.",
        "A workshop favourite, the {$name} delivers a {$trait}.",
    ];
    $idx = array_sum(array_map('ord', str_split($name))) % count($openings);
    $body = in_array($category, ['handles', 'plastic'], true)
        ? "Finished to JHANARICH's export standard and QC-checked batch by batch, it ships retail-ready or under your private label."
        : "The {$finish} finish shrugs off commercial duty, the induction-ready base works on every cooktop, and every batch passes JHANARICH's strength and food-safety QC before it leaves Visakhapatnam.";
    return trim(preg_replace('/\s+/', ' ', $openings[$idx] . ' ' . $body . ' Available in standard sizes with OEM branding and bespoke packaging on request.'));
}
