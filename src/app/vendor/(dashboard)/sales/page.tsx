import { requireVendor, getVendorForUser } from "@/lib/auth-utils";
import { vendorOrderService } from "@/server/services/admin-order.service";
import { formatPrice } from "@/lib/utils";

export default async function VendorSalesPage() {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);
  const sales = await vendorOrderService.getSalesSummary(vendor.id);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Sales overview</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border bg-background p-6">
          <p className="text-sm text-muted-foreground">Total revenue</p>
          <p className="mt-2 text-2xl font-semibold">{formatPrice(sales.revenue)}</p>
        </div>
        <div className="border bg-background p-6">
          <p className="text-sm text-muted-foreground">Units sold</p>
          <p className="mt-2 text-2xl font-semibold">{sales.unitsSold}</p>
        </div>
        <div className="border bg-background p-6">
          <p className="text-sm text-muted-foreground">Order lines</p>
          <p className="mt-2 text-2xl font-semibold">{sales.orderLines}</p>
        </div>
      </div>
    </div>
  );
}
