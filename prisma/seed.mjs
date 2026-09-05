import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const P = (slug, name, category, description, image, sortOrder, featured = false) =>
  ({ slug, name, category, description, image, sortOrder, featured });

const products = [
  // Triply
  P("honeycomb-fry-pan", "Honeycomb Fry Pan", "triply", "Triply bonded body with laser honeycomb non-stick lattice.", "/assets/pan-hero.png", 1, true),
  P("triply-casserole", "Casserole", "triply", "Glass-lidded triply casserole. Even browning, easy cleaning.", "/assets/image6.jpg", 2, true),
  P("honeycomb-tawa", "Honeycomb Tawa", "triply", "Flat triply griddle for dosa, chapati and everyday rotis.", "/assets/image10.jpg", 3),
  P("triply-sauce-pan", "Sauce Pan", "triply", "Triply sauce pan with riveted stay-cool handle.", "/assets/wa-saucepan.jpg", 4),
  P("triply-fry-pan", "Fry Pan", "triply", "Classic triply fry pan — mirror finish, balanced pour.", "/assets/image3.jpg", 5),
  P("dosa-tawa", "Dosa Tawa", "triply", "Wide triply tawa with honeycomb texture for crisp dosas.", "/assets/image9.jpg", 6),
  P("triply-set", "Triply Set", "triply", "Kadai, tasla, tope and sauce pans — the full family.", "/assets/image2.jpg", 7),
  P("triply-tope", "Tope", "triply", "Deep triply tope for boiling, simmering and stocks.", "/assets/image27.jpg", 8),
  // Non-stick
  P("granite-fry-pan", "Granite Fry Pan", "nonstick", "3-layer granite coating, PFOA-free, bakelite handle.", "/assets/image30.jpg", 1, true),
  P("nonstick-casserole", "Casserole", "nonstick", "Matte-black non-stick casserole with glass lid and induction bottom.", "/assets/image13.jpg", 2),
  P("nonstick-kadai", "Kadai", "nonstick", "Deep non-stick kadai with twin stay-cool handles.", "/assets/image22.jpg", 3),
  P("grill-pan", "Grill Pan", "nonstick", "Square grill pan with raised ribs and red spatter finish.", "/assets/image23.jpg", 4),
  P("fry-pan-set", "Fry Pan Set", "nonstick", "Graduated fry pan set — matte black, induction ready.", "/assets/image11.jpg", 5),
  P("fry-pan-set-red", "Fry Pan Set — Red", "nonstick", "Signature red exterior, 3-layer non-stick interior.", "/assets/image12.jpg", 6),
  P("nonstick-fry-pan", "Fry Pan", "nonstick", "Everyday fry pan — maroon exterior, ergonomic grip.", "/assets/image8.jpg", 7),
  P("nonstick-tawa", "Dosa Tawa", "nonstick", "Lightweight non-stick tawa, low oil cooking.", "/assets/image21.jpg", 8),
  // Steel
  P("steel-cups-plates", "Steel Cups & Plates", "steel", "Food-grade SS serveware, mirror polished.", "/assets/image26.jpg", 1),
  P("ss-casserole", "SS Casserole", "steel", "Deep stainless casserole with snug steel lid and loop handles.", "/assets/wa-casserole.jpg", 2, true),
  P("ss-tope", "SS Tope", "steel", "Deep-drawn stainless tope with rolled rims.", "/assets/image25.jpg", 3),
  P("steel-bowls", "Steel Bowls", "steel", "Nesting bowls and vessels in brushed or mirror finish.", "/assets/image28.jpg", 4),
  P("steel-tumblers", "Tumblers & Cups", "steel", "Daily-use SS cups and tumblers, rust resistant.", "/assets/image29.jpg", 5),
  // Handles
  P("ss-handles", "SS Side & Long Handles", "handles", "Stamped stainless side and long handles, built to rivet.", "svg:ss-handles", 1),
  P("casted-handles", "Casted Handles", "handles", "Gravity-cast handles with solid weight and balance.", "svg:casted", 2),
  P("bakelite-handles", "Bakelite Handles", "handles", "Heat-resistant bakelite grips in matte or woodgrain.", "svg:bakelite", 3),
  // Plastic
  P("spice-boxes", "Spice Boxes", "plastic", "Food-grade spice boxes with airtight lids.", "svg:spice", 1),
  P("packing-boxes", "Packing Boxes", "plastic", "Durable plastic packing containers for kitchens & retail.", "svg:packing", 2),
];

const svg = {
  "svg:ss-handles": `<svg viewBox="0 0 120 120"><path d="M20 78 Q18 46 44 40 L92 32 Q104 30 106 40 Q108 50 96 52 L52 60 Q36 63 36 78 Q36 88 24 88 Q20 88 20 78Z" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="26" cy="82" r="5" fill="none" stroke="currentColor" stroke-width="3" opacity=".55"/></svg>`,
  "svg:casted": `<svg viewBox="0 0 120 120"><path d="M22 76 Q22 50 46 44 L90 34" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M90 34 Q104 32 106 42 Q107 50 96 52 L70 57" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" opacity=".25"/></svg>`,
  "svg:bakelite": `<svg viewBox="0 0 120 120"><path d="M24 78 Q22 52 46 46 L88 36" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M88 36 Q106 33 108 44 Q109 54 96 56 L74 60" fill="none" stroke="#4a3208" stroke-width="11" stroke-linecap="round"/></svg>`,
  "svg:spice": `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 5"/><circle cx="60" cy="34" r="4" fill="currentColor"/><circle cx="83" cy="72" r="4" fill="currentColor"/><circle cx="37" cy="72" r="4" fill="currentColor"/></svg>`,
  "svg:packing": `<svg viewBox="0 0 120 120"><rect x="26" y="44" width="68" height="44" rx="8" fill="none" stroke="currentColor" stroke-width="3"/><path d="M26 60 h68" stroke="currentColor" stroke-width="2"/><rect x="50" y="34" width="20" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`,
};

await prisma.enquiry.deleteMany();
await prisma.product.deleteMany();
for (const p of products) {
  await prisma.product.create({ data: p });
}
console.log(`Seeded ${products.length} products.`);
