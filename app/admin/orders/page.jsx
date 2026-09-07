import { prisma } from "@/lib/db";
import OrdersClient from "@/components/OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const orders = await prisma.orderRequest.findMany({ orderBy: { createdAt: "desc" } });
  return <OrdersClient orders={JSON.parse(JSON.stringify(orders))} />;
}
