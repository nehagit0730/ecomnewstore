import { requireVendor, getVendorForUser } from "@/lib/auth-utils";
import { prisma } from "@/server/db/prisma";
import { vendorOrderService } from "@/server/services/admin-order.service";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function VendorDashboardPage() {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);

  const [products, pending, sales] = await Promise.all([
    prisma.product.count({ where: { vendorId: vendor.id } }),
    prisma.product.count({
      where: { vendorId: vendor.id, approvalStatus: "PENDING_REVIEW" },
    }),
    vendorOrderService.getSalesSummary(vendor.id),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Vendor dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Products" value={String(products)} />
        <Stat label="Pending approval" value={String(pending)} />
        <Stat label="Revenue" value={formatPrice(sales.revenue)} />
        <Stat label="Units sold" value={String(sales.unitsSold)} />
      </div>
      <div className="mt-8">
        <Button variant="luxury" asChild>
          <Link href="/vendor/products/new">Add new product</Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border bg-background p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
