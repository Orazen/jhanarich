import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { answerChat } from "@/lib/ai";

export const dynamic = "force-dynamic";

// naive in-memory rate limit: 20 req / min / ip
const hits = globalThis.__jhChatHits ?? new Map();
globalThis.__jhChatHits = hits;

function limited(ip) {
  const now = Date.now();
  const win = hits.get(ip) || { n: 0, reset: now + 60000 };
  if (now > win.reset) { win.n = 0; win.reset = now + 60000; }
  win.n += 1;
  hits.set(ip, win);
  return win.n > 20;
}

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    if (limited(ip)) return NextResponse.json({ error: "Slow down a little" }, { status: 429 });

    const { message } = await req.json().catch(() => ({}));
    if (!message || typeof message !== "string" || message.length > 500) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    const products = await prisma.product.findMany({ where: { active: true } });
    const plain = JSON.parse(JSON.stringify(products));
    const out = answerChat(message, plain);
    return NextResponse.json({
      reply: out.reply,
      products: out.products.slice(0, 3).map((p) => ({
        name: p.name, category: p.category, image: p.image, description: p.description,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}
