import { requireVendor, getVendorForUser } from "@/lib/auth-utils";
import { vendorOrderService } from "@/server/services/admin-order.service";
import { formatPrice } from "@/lib/utils";

export default async function VendorOrdersPage() {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);
  const { items: orders } = await vendorOrderService.list(vendor.id, { limit: 50 });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">My orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet for your products.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const vendorTotal = o.items.reduce((s, i) => s + Number(i.totalPrice), 0);
            return (
              <div key={o.id} className="border bg-background p-4">
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-medium">{o.orderNumber}</span>
                  <span className="text-muted-foreground">{o.status}</span>
                </div>
                {o.items.map((item) => (
                  <p key={item.id} className="text-sm text-muted-foreground">
                    {item.productTitle} × {item.quantity}
                  </p>
                ))}
                <p className="text-sm font-medium mt-2 text-right">
                  Your portion: {formatPrice(vendorTotal)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
