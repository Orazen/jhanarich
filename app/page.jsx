import { prisma } from "@/lib/db";
import Home from "@/components/Home";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  return <Home products={JSON.parse(JSON.stringify(products))} />;
}
