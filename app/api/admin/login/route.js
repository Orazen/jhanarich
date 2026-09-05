import { NextResponse } from "next/server";
import { checkCreds, makeToken, COOKIE } from "@/lib/auth";

export async function POST(req) {
  const { username, password } = await req.json().catch(() => ({}));
  if (!checkCreds(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 86400,
  });
  return res;
}
