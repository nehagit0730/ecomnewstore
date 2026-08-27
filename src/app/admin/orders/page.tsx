import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { email: true } },
      items: { include: { vendor: { select: { shopName: true } } } },
    },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Orders</h1>
      <div className="border bg-background overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Vendors</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="p-4 font-medium">
                  <Link href={`/admin/orders/${o.id}`} className="underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="p-4">{o.email}</td>
                <td className="p-4 text-xs text-muted-foreground">
                  {[...new Set(o.items.map((i) => i.vendor?.shopName ?? "Platform"))].join(", ")}
                </td>
                <td className="p-4">{formatPrice(Number(o.total))}</td>
                <td className="p-4">
                  <OrderStatusSelect orderId={o.id} current={o.status} />
                </td>
                <td className="p-4 text-muted-foreground">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
