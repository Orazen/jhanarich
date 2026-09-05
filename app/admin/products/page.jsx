import { prisma } from "@/lib/db";
import ProductsClient from "@/components/ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  return <ProductsClient products={JSON.parse(JSON.stringify(products))} />;
}
