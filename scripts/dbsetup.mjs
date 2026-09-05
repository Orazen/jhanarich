// Creates tables if missing + seeds the catalog.
// Works against local file DB (default) OR Turso when DATABASE_URL starts
// with libsql:// (DATABASE_AUTH_TOKEN required). Usage: npm run db:setup
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

function makeClient() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  if (url.startsWith("libsql://")) {
    const adapter = new PrismaLibSQL(
      createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN })
    );
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}
const prisma = makeClient();

const DDL = [
  `CREATE TABLE IF NOT EXISTS Product (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS Product_category_idx ON Product (category)`,
  `CREATE TABLE IF NOT EXISTS Enquiry (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    business TEXT,
    product TEXT,
    line TEXT,
    message TEXT,
    source TEXT NOT NULL DEFAULT 'website',
    status TEXT NOT NULL DEFAULT 'new',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS Enquiry_status_idx ON Enquiry (status)`,
];

for (const sql of DDL) await prisma.$executeRawUnsafe(sql);
console.log("Tables ready.");

// ---- seed (same data as prisma/seed.mjs) ----
const P = (slug, name, category, description, image, sortOrder, featured = false) =>
  ({ slug, name, category, description, image, sortOrder, featured });

const products = [
  P("honeycomb-fry-pan", "Honeycomb Fry Pan", "triply", "Triply bonded body with laser honeycomb non-stick lattice.", "/assets/pan-hero.png", 1, true),
  P("triply-casserole", "Casserole", "triply", "Glass-lidded triply casserole. Even browning, easy cleaning.", "/assets/image6.jpg", 2, true),
  P("honeycomb-tawa", "Honeycomb Tawa", "triply", "Flat triply griddle for dosa, chapati and everyday rotis.", "/assets/image10.jpg", 3),
  P("triply-sauce-pan", "Sauce Pan", "triply", "Triply sauce pan with riveted stay-cool handle.", "/assets/wa-saucepan.jpg", 4),
  P("triply-fry-pan", "Fry Pan", "triply", "Classic triply fry pan — mirror finish, balanced pour.", "/assets/image3.jpg", 5),
  P("dosa-tawa", "Dosa Tawa", "triply", "Wide triply tawa with honeycomb texture for crisp dosas.", "/assets/image9.jpg", 6),
  P("triply-set", "Triply Set", "triply", "Kadai, tasla, tope and sauce pans — the full family.", "/assets/image2.jpg", 7),
  P("triply-tope", "Tope", "triply", "Deep triply tope for boiling, simmering and stocks.", "/assets/image27.jpg", 8),
  P("granite-fry-pan", "Granite Fry Pan", "nonstick", "3-layer granite coating, PFOA-free, bakelite handle.", "/assets/image30.jpg", 1, true),
  P("nonstick-casserole", "Casserole", "nonstick", "Matte-black non-stick casserole with glass lid and induction bottom.", "/assets/image13.jpg", 2),
  P("nonstick-kadai", "Kadai", "nonstick", "Deep non-stick kadai with twin stay-cool handles.", "/assets/image22.jpg", 3),
  P("grill-pan", "Grill Pan", "nonstick", "Square grill pan with raised ribs and red spatter finish.", "/assets/image23.jpg", 4),
  P("fry-pan-set", "Fry Pan Set", "nonstick", "Graduated fry pan set — matte black, induction ready.", "/assets/image11.jpg", 5),
  P("fry-pan-set-red", "Fry Pan Set — Red", "nonstick", "Signature red exterior, 3-layer non-stick interior.", "/assets/image12.jpg", 6),
  P("nonstick-fry-pan", "Fry Pan", "nonstick", "Everyday fry pan — maroon exterior, ergonomic grip.", "/assets/image8.jpg", 7),
  P("nonstick-tawa", "Dosa Tawa", "nonstick", "Lightweight non-stick tawa, low oil cooking.", "/assets/image21.jpg", 8),
  P("steel-cups-plates", "Steel Cups & Plates", "steel", "Food-grade SS serveware, mirror polished.", "/assets/image26.jpg", 1),
  P("ss-casserole", "SS Casserole", "steel", "Deep stainless casserole with snug steel lid and loop handles.", "/assets/wa-casserole.jpg", 2, true),
  P("ss-tope", "SS Tope", "steel", "Deep-drawn stainless tope with rolled rims.", "/assets/image25.jpg", 3),
  P("steel-bowls", "Steel Bowls", "steel", "Nesting bowls and vessels in brushed or mirror finish.", "/assets/image28.jpg", 4),
  P("steel-tumblers", "Tumblers & Cups", "steel", "Daily-use SS cups and tumblers, rust resistant.", "/assets/image29.jpg", 5),
  P("ss-handles", "SS Side & Long Handles", "handles", "Stamped stainless side and long handles, built to rivet.", "svg:ss-handles", 1),
  P("casted-handles", "Casted Handles", "handles", "Gravity-cast handles with solid weight and balance.", "svg:casted", 2),
  P("bakelite-handles", "Bakelite Handles", "handles", "Heat-resistant bakelite grips in matte or woodgrain.", "svg:bakelite", 3),
  P("spice-boxes", "Spice Boxes", "plastic", "Food-grade spice boxes with airtight lids.", "svg:spice", 1),
  P("packing-boxes", "Packing Boxes", "plastic", "Durable plastic packing containers for kitchens & retail.", "svg:packing", 2),
];

// upsert by slug so re-running is safe on a live DB
for (const p of products) {
  await prisma.product.upsert({
    where: { slug: p.slug },
    update: { ...p },
    create: p,
  });
}
console.log(`Seeded/refreshed ${products.length} products.`);
await prisma.$disconnect();
