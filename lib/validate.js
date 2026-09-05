// Enquiry input validation (shared by API route + tests)

export function validateEnquiry(body) {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const name = String(body.name || "").trim();
  if (name.length < 2) return { ok: false, error: "Name is required" };
  const clip = (v, n) => (v == null ? null : String(v).slice(0, n));
  return {
    ok: true,
    data: {
      name: name.slice(0, 120),
      phone: clip(body.phone, 40),
      email: clip(body.email, 160),
      business: clip(body.business, 120),
      product: clip(body.product, 160),
      line: clip(body.line, 120),
      message: clip(body.message, 2000),
      source: body.source === "whatsapp" ? "whatsapp" : "website",
    },
  };
}

export function waLink(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
