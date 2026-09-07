import { NextResponse } from "next/server";
import { prisma, waLink } from "@/lib/db";

function inr(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}
function makeRef() {
  const chars = "QRSTUVWXYZABCDEFGHIJKLMNOP23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "JR-" + s;
}

export async function POST(req) {
  try {
    const b = await req.json();
    if (b.website) return NextResponse.json({ ok: true, ref: "JR-XXXXXX", wa: "" });
    if (!b.name || String(b.name).trim().length < 2) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const phone = b.phone ? String(b.phone).replace(/[^\d+]/g, "") : "";
    if (phone && phone.replace(/\D/g, "").length < 8) {
      return NextResponse.json({ error: "Valid phone is required" }, { status: 400 });
    }
    const rawItems = Array.isArray(b.items) ? b.items.slice(0, 60) : [];
    const items = [];
    let total = null;
    for (const it of rawItems) {
      const qty = Math.min(99999, Math.max(1, parseInt(it.qty, 10) || 1));
      const name = String(it.name || "").trim().slice(0, 160);
      if (!name) continue;
      const price = it.price === null || it.price === undefined || it.price === "" ? null : Math.max(0, parseInt(it.price, 10) || 0);
      if (price !== null) {
        if (total === null) total = 0;
        total += price * qty;
      }
      items.push({ slug: String(it.slug || "").slice(0, 80), name, qty, price });
    }
    if (!items.length) {
      return NextResponse.json({ error: "Add at least one product" }, { status: 400 });
    }

    let ref = makeRef();
    let row;
    for (let i = 0; i < 5; i++) {
      try {
        row = await prisma.orderRequest.create({
          data: {
            ref,
            name: String(b.name).trim().slice(0, 120),
            phone: phone || null,
            email: b.email ? String(b.email).slice(0, 160) : null,
            business: b.business ? String(b.business).slice(0, 120) : null,
            city: b.city ? String(b.city).slice(0, 120) : null,
            address: b.address ? String(b.address).slice(0, 500) : null,
            notes: b.notes ? String(b.notes).slice(0, 2000) : null,
            items: JSON.stringify(items),
            total,
            source: "website",
            status: "new",
          },
        });
        break;
      } catch (e) {
        if (i === 4 || !/unique/i.test(String(e))) throw e;
        ref = makeRef();
      }
    }

    const lines = items.map((it, i) =>
      `${i + 1}. ${it.name} × ${it.qty} — ${it.price !== null ? inr(it.price * it.qty) : "price on request"}`
    );
    // No 4-byte emoji: WhatsApp's wa.me redirector mangles astral-plane
    // characters into U+FFFD; BMP symbols (₹, ×, —) survive.
    const text = [
      `*NEW ORDER — ${row.ref}*`,
      `Customer: ${row.name}${row.business ? ` (${row.business})` : ""}`,
      row.phone ? `Phone: ${row.phone}` : "",
      row.email ? `Email: ${row.email}` : "",
      row.city ? `City: ${row.city}` : "",
      "",
      "*Items*",
      ...lines,
      "",
      total !== null ? `*Estimated total: ${inr(total)}*` : "*Pricing on request*",
      row.address ? "*Deliver to*\n" + row.address : "",
      row.notes ? `Notes: ${row.notes}` : "",
      "",
      "Manage order: https://jhanarich.com/admin/orders.php",
      "— placed on jhanarich.com",
    ].filter(Boolean).join("\n").slice(0, 1800);

    return NextResponse.json({ ok: true, id: row.id, ref: row.ref, wa: waLink(text) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
