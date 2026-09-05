import { PrismaClient } from "@prisma/client";
const g = globalThis;
export const prisma = g.__prisma ?? new PrismaClient();
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
