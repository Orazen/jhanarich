import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Turso (libSQL) in production via DATABASE_URL + DATABASE_AUTH_TOKEN;
// plain local SQLite file when no Turso config is present.
const g = globalThis;

function makeClient() {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("libsql://")) {
    const libsql = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

export const prisma = g.__prisma ?? makeClient();
if (process.env.NODE_ENV !== "production") g.__prisma = prisma;

export const CATEGORIES = [
  { key: "triply", label: "Triply" },
  { key: "nonstick", label: "Non-Stick" },
  { key: "steel", label: "Stainless Steel" },
  { key: "handles", label: "Handles" },
  { key: "plastic", label: "Plastic" },
];

export const WA_NUMBER = "919440121743";

export function waLink(text) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
