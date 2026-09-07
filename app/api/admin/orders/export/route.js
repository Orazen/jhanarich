import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const header = req.headers.get("cookie") || "";
  const token = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(COOKIE + "="));
  if (!verifyToken(token ? decodeURIComponent(token.slice(COOKIE.length + 1)) : null)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.orderRequest.findMany({ orderBy: { createdAt: "desc" } });
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const itemsOf = (json) => {
    try {
      return JSON.parse(json || "[]")
        .map((it) => `${it.qty} x ${it.name}${it.price != null ? ` @ ${it.price}` : " (on request)"}`)
        .join("; ");
    } catch {
      return "";
    }
  };
  const cols = ["ref", "createdAt", "name", "phone", "email", "business", "city", "address", "items", "total", "status", "notes"];
  const csv = ["\uFEFF" + cols.join(",")]
    .concat(rows.map((r) => cols.map((c) => esc(c === "items" ? itemsOf(r.items) : c === "createdAt" ? new Date(r[c]).toISOString() : r[c])).join(",")))
    .join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jhanarich-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
