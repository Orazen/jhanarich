import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, COOKIE } from "@/lib/auth";
import { generateDescription, draftReply } from "@/lib/ai";

async function guard(req) {
  const header = req.headers.get("cookie") || "";
  const token = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(COOKIE + "="));
  return verifyToken(token ? decodeURIComponent(token.slice(COOKIE.length + 1)) : null);
}

export async function POST(req) {
  if (!(await guard(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));

  if (b.task === "description") {
    if (!b.name || !b.category) return NextResponse.json({ error: "name & category required" }, { status: 400 });
    const out = await generateDescription({ name: b.name, category: b.category, hints: b.hints });
    return NextResponse.json({ ok: true, ...out });
  }

  if (b.task === "reply") {
    if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const e = await prisma.enquiry.findUnique({ where: { id: b.id } });
    if (!e) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    const out = await draftReply(e);
    return NextResponse.json({ ok: true, ...out });
  }

  return NextResponse.json({ error: "Unknown task" }, { status: 400 });
}
