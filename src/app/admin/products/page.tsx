import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { Button } from "@/components/ui/button";
import { ImportExportButtons } from "@/components/admin/products/import-export-buttons";
import { ProductTable } from "@/components/admin/products/product-table";
import { Plus, Sparkles } from "lucide-react";

export default async function AdminProductsPage() {
  const [productsRaw, categoriesRaw, vendorsRaw, pendingCount] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 500,
      include: {
        vendor: { select: { id: true, shopName: true } },
        category: { select: { id: true, name: true } },
        variants: {
          include: { inventory: true },
          orderBy: { price: "asc" },
        },
        images: { orderBy: { sortOrder: "asc" } },
        _count: { select: { variants: true, reviews: true } },
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.vendor.findMany({
      select: { id: true, shopName: true },
      orderBy: { shopName: "asc" },
    }),
    prisma.product.count({
      where: { approvalStatus: "PENDING_REVIEW" },
    }),
  ]);

  // Deep clone with JSON to convert Decimal and Date objects cleanly
  const products = JSON.parse(
    JSON.stringify(productsRaw, (_key, value) => {
      if (
        value &&
        typeof value === "object" &&
        value.constructor?.name === "Decimal"
      ) {
        return Number(value);
      }
      return value;
    })
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Products
            </h1>
            {pendingCount > 0 && (
              <Link
                href="/admin/products/pending"
                className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-medium hover:bg-amber-200 transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                {pendingCount} Pending Review
              </Link>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your catalog, variants, pricing, inventory stock, and imports/exports.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ImportExportButtons />
          <Button variant="luxury" className="gap-1.5 shadow-xs" asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Table Component */}
      <ProductTable
        products={products}
        categories={categoriesRaw}
        vendors={vendorsRaw}
      />
    </div>
  );
}
