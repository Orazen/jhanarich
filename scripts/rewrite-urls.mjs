// Rewrites client-side API calls from Next routes to PHP equivalents in the
// static export under out/.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const MAP = [
  ["/api/enquiry", "/api/enquiry.php"],
  ["/api/order", "/api/order.php"],
  ["/api/chat", "/api/chat.php"],
  // admin routes are served by admin/*.php UIs; no client fetch remains
];

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(js|html)$/.test(f)) {
      let s = readFileSync(p, "utf8");
      let changed = false;
      for (const [from, to] of MAP) {
        if (s.includes(from)) { s = s.split(from).join(to); changed = true; }
      }
      if (changed) { writeFileSync(p, s); console.log("rewrote", p); }
    }
  }
}
walk(OUT);
console.log("URL rewrite complete.");
