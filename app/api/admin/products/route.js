import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, COOKIE } from "@/lib/auth";

async function guard(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(COOKIE + "="));
  const t = token ? decodeURIComponent(token.slice(COOKIE.length + 1)) : null;
  console.log("[products guard] cookieHeader:", JSON.stringify(cookieHeader), "valid:", verifyToken(t));
  return verifyToken(t);
}

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function POST(req) {
  if (!(await guard(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.name || !b.category) {
    return NextResponse.json({ error: "Name and category required" }, { status: 400 });
  }
  const slug = b.slug ? slugify(b.slug) : slugify(b.name);
  try {
    const p = await prisma.product.create({
      data: {
        name: String(b.name).slice(0, 120),
        slug: slug + "-" + Math.random().toString(36).slice(2, 6),
        category: b.category,
        description: String(b.description || "").slice(0, 500),
        image: b.image || "",
        active: b.active ?? true,
        featured: b.featured ?? false,
        sortOrder: Number(b.sortOrder) || 99,
      },
    });
    return NextResponse.json({ ok: true, product: p });
  } catch (e) {
    return NextResponse.json({ error: "Could not create product" }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!(await guard(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const data = {};
  for (const k of ["name", "category", "description", "image"]) {
    if (b[k] !== undefined) data[k] = b[k];
  }
  for (const k of ["active", "featured"]) {
    if (b[k] !== undefined) data[k] = !!b[k];
  }
  if (b.sortOrder !== undefined) data.sortOrder = Number(b.sortOrder) || 0;
  try {
    const p = await prisma.product.update({ where: { id: b.id }, data });
    return NextResponse.json({ ok: true, product: p });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!(await guard(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
