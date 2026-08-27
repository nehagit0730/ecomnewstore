import Link from "next/link";
import { requireVendor, getVendorForUser } from "@/lib/auth-utils";
import { prisma } from "@/server/db/prisma";
import { ApprovalBadge } from "@/components/admin/approval-badge";
import { VendorSubmitButton } from "@/components/vendor/vendor-submit-button";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default async function VendorProductsPage() {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    orderBy: { updatedAt: "desc" },
    include: { variants: { take: 1 } },
  });

  return (
    <div>
      <div className="flex justify-between mb-8">
        <h1 className="font-serif text-3xl">My products</h1>
        <Button variant="luxury" asChild>
          <Link href="/vendor/products/new">Add product</Link>
        </Button>
      </div>
      <div className="border bg-background overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Price</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4">
                  <ApprovalBadge status={p.approvalStatus} />
                  {p.rejectionReason && (
                    <p className="text-xs text-destructive mt-1">{p.rejectionReason}</p>
                  )}
                </td>
                <td className="p-4">
                  {p.variants[0] ? formatPrice(Number(p.variants[0].price)) : "—"}
                </td>
                <td className="p-4 space-x-3">
                  <Link href={`/vendor/products/${p.id}`} className="underline text-xs">
                    Edit
                  </Link>
                  {(p.approvalStatus === "DRAFT" || p.approvalStatus === "REJECTED") && (
                    <VendorSubmitButton productId={p.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
