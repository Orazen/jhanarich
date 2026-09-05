import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry, waLink } from "../lib/validate.js";
import { answerChat, localDescription, classifyEnquiry } from "../lib/ai.js";
import { assertSafeUrl } from "../lib/urlguard.js";

const PRODUCTS = [
  { name: "Honeycomb Fry Pan", category: "triply", description: "Triply bonded body with laser honeycomb non-stick lattice." },
  { name: "Granite Fry Pan", category: "nonstick", description: "3-layer granite coating, PFOA-free, bakelite handle." },
  { name: "Steel Cups & Plates", category: "steel", description: "Food-grade SS serveware, mirror polished." },
  { name: "Spice Boxes", category: "plastic", description: "Food-grade spice boxes with airtight lids." },
  { name: "SS Handles", category: "handles", description: "Stamped stainless handles." },
];

/* ---------- validateEnquiry ---------- */

test("validateEnquiry rejects short names", () => {
  assert.equal(validateEnquiry({ name: "A" }).ok, false);
  assert.equal(validateEnquiry({}).ok, false);
  assert.equal(validateEnquiry(null).ok, false);
});

test("validateEnquiry clips long fields and normalizes source", () => {
  const out = validateEnquiry({ name: "Ravi Kumar", message: "x".repeat(3000), source: "whatever" });
  assert.equal(out.ok, true);
  assert.equal(out.data.message.length, 2000);
  assert.equal(out.data.source, "website");
});

test("validateEnquiry keeps whatsapp source", () => {
  assert.equal(validateEnquiry({ name: "Ravi", source: "whatsapp" }).data.source, "whatsapp");
});

test("waLink encodes text", () => {
  const l = waLink("919440121743", "Hello & hi");
  assert.ok(l.startsWith("https://wa.me/919440121743?text="));
  assert.ok(!l.includes(" "));
});

/* ---------- classifyEnquiry ---------- */

test("classify flags OEM intent", () => {
  const c = classifyEnquiry({ message: "We want our own brand, private label pans", business: "Acme Retail" });
  assert.equal(c.intent, "oem");
});

test("classify flags bulk as high urgency", () => {
  const c = classifyEnquiry({ message: "Need a large order for a tender, urgent", business: "" });
  assert.equal(c.urgency, "high");
});

test("classify hotel business gets medium urgency + horeca", () => {
  const c = classifyEnquiry({ message: "info please", business: "Grand Hotel" });
  assert.equal(c.urgency, "medium");
  assert.equal(c.intent, "horeca");
});

/* ---------- answerChat ---------- */

test("chat greets on short hello", () => {
  const r = answerChat("hi", PRODUCTS);
  assert.match(r.reply, /JHANA/);
});

test("chat routes triply question to triply products", () => {
  const r = answerChat("tell me about triply pans", PRODUCTS);
  assert.ok(r.products.length > 0);
  assert.ok(r.products.every((p) => p.category === "triply"));
});

test("chat routes OEM question without products necessarily", () => {
  const r = answerChat("do you do OEM private label?", PRODUCTS);
  assert.match(r.reply, /OEM/);
});

test("chat retrieval finds by token", () => {
  const r = answerChat("do you have grill pans?", PRODUCTS);
  assert.ok(r.products.some((p) => p.name === "Granite Fry Pan"));
});

test("chat answers address question", () => {
  const r = answerChat("where is your factory located?", PRODUCTS);
  assert.match(r.reply, /Visakhapatnam/);
});

test("chat fallback is honest", () => {
  const r = answerChat("can you repair my scooter", PRODUCTS);
  assert.match(r.reply, /couldn't find/);
});

test("chat handles empty/long input safely", () => {
  assert.ok(answerChat("", PRODUCTS).reply.length > 0);
});

/* ---------- localDescription ---------- */

test("local description mentions category trait and OEM", () => {
  const d = localDescription({ name: "Casserole", category: "triply" });
  assert.match(d, /triply-bonded/);
  assert.match(d, /OEM/);
});

test("local description varies by name", () => {
  const a = localDescription({ name: "Kadai", category: "nonstick" });
  const b = localDescription({ name: "Tawa", category: "nonstick" });
  assert.notEqual(a, b);
});

/* ---------- SSRF guard ---------- */

test("url guard blocks non-https", () => {
  assert.throws(() => assertSafeUrl("http://api.openai.com/v1"), /blocked_url/);
});

test("url guard blocks disallowed hosts", () => {
  assert.throws(() => assertSafeUrl("https://evil.example.com/x"), /blocked_host/);
  assert.throws(() => assertSafeUrl("https://localhost/x"), /blocked_host/);
  assert.throws(() => assertSafeUrl("https://192.168.1.1/x"), /blocked_host|blocked_ip/);
});

test("url guard allows known AI hosts", () => {
  assert.doesNotThrow(() => assertSafeUrl("https://api.openai.com/v1/chat/completions"));
  assert.doesNotThrow(() => assertSafeUrl("https://generativelanguage.googleapis.com/v1beta/models"));
});
