import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, COOKIE } from "@/lib/auth";

async function guard(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(COOKIE + "="));
  return verifyToken(token ? decodeURIComponent(token.slice(COOKIE.length + 1)) : null);
}

export async function PATCH(req) {
  if (!(await guard(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  if (!id || !["new", "contacted", "closed"].includes(status)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const e = await prisma.enquiry.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true, enquiry: e });
}

export async function DELETE(req) {
  if (!(await guard(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await prisma.enquiry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
