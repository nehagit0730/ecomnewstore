import { prisma } from "@/server/db/prisma";
import { formatPrice } from "@/lib/utils";
import { ApprovalBadge } from "@/components/admin/approval-badge";
import { ProductApproveButton, ProductRejectButton } from "@/components/admin/product-actions";

export default async function AdminPendingProductsPage() {
  const products = await prisma.product.findMany({
    where: { approvalStatus: "PENDING_REVIEW" },
    orderBy: { updatedAt: "desc" },
    include: {
      vendor: { select: { shopName: true, slug: true } },
      variants: { take: 1 },
      images: { take: 1 },
    },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Product approvals</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Vendor submissions appear here. Approve only after quality check.
      </p>
      {products.length === 0 ? (
        <p className="text-muted-foreground">No products pending review.</p>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.id} className="border bg-background p-6">
              <div className="flex flex-wrap gap-6">
                {p.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0].url}
                    alt=""
                    className="h-24 w-20 object-cover"
                  />
                )}
                <div className="flex-1 min-w-[200px]">
                  <h2 className="font-medium text-lg">{p.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vendor: {p.vendor?.shopName ?? "Unknown"} · {p.handle}
                  </p>
                  <p className="text-sm mt-2 line-clamp-2">{p.description}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <ApprovalBadge status={p.approvalStatus} />
                    {p.variants[0] && (
                      <span className="text-sm">{formatPrice(Number(p.variants[0].price))}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <ProductApproveButton productId={p.id} />
                  <ProductRejectButton productId={p.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
