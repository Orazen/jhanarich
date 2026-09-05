import { NextResponse } from "next/server";
import { prisma, waLink } from "@/lib/db";

export async function POST(req) {
  try {
    const b = await req.json();
    if (!b.name || String(b.name).trim().length < 2) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const e = await prisma.enquiry.create({
      data: {
        name: String(b.name).slice(0, 120),
        phone: b.phone ? String(b.phone).slice(0, 40) : null,
        email: b.email ? String(b.email).slice(0, 160) : null,
        business: b.business ? String(b.business).slice(0, 120) : null,
        product: b.product ? String(b.product).slice(0, 160) : null,
        line: b.line ? String(b.line).slice(0, 120) : null,
        message: b.message ? String(b.message).slice(0, 2000) : null,
        source: b.source === "whatsapp" ? "whatsapp" : "website",
      },
    });
    const text = `Hello JHANARICH! I'm ${e.name}${e.business ? ` (${e.business})` : ""}. ${
      e.product ? `I'm interested in: ${e.product}.` : e.line ? `Interested in: ${e.line}.` : ""
    } ${e.message || "Please share your catalogue and pricing."}`;
    return NextResponse.json({ ok: true, id: e.id, wa: waLink(text) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
