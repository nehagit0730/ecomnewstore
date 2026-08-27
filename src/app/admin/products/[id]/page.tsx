import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { ProductForm, type ProductFormInitial } from "@/components/admin/product-form";
import { ApprovalBadge } from "@/components/admin/approval-badge";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditProductPage({ params }: Props) {
  await requireSuperAdmin();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { include: { inventory: true } },
      vendor: { select: { shopName: true } },
    },
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  const initial: ProductFormInitial = {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    brand: product.brand,
    categoryId: product.categoryId,
    materials: product.materials,
    careInstructions: product.careInstructions,
    shippingInfo: product.shippingInfo,
    returnPolicy: product.returnPolicy,
    sizeChart: product.sizeChart,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isTrending: product.isTrending,
    isBestSeller: product.isBestSeller,
    isActive: product.isActive,
    approvalStatus: product.approvalStatus,
    images: product.images,
    variants: product.variants,
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="text-sm text-muted-foreground hover:underline">
          ← Products
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl">Edit product</h1>
          <ApprovalBadge status={product.approvalStatus} />
          {product.vendor && (
            <span className="text-sm text-muted-foreground">Vendor: {product.vendor.shopName}</span>
          )}
        </div>
      </div>
      <ProductForm mode="admin" categories={categories} initial={initial} />
    </div>
  );
}
