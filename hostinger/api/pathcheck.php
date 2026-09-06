<?php
// temporary diagnostic — delete after use
header('Content-Type: text/plain');
$dir = __DIR__;
echo "dir=$dir\n";
$p = preg_replace('#(/public_html)?/[^/]+/api$#', '', $dir);
echo "p($p)\n";
$p2 = dirname($dir, 2);
echo "p2($p2)\n";
foreach ([$p, $p2] as $cand) {
    $sf = $cand . '/.config/jhanarich/secrets.env';
    echo $sf, ' exists=', var_export(file_exists($sf), true), "\n";
}
