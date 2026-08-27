import Link from "next/link";
import { notFound } from "next/navigation";
import { requireVendor, getVendorForUser } from "@/lib/auth-utils";
import { prisma } from "@/server/db/prisma";
import { ProductForm, type ProductFormInitial } from "@/components/admin/product-form";

type Props = { params: Promise<{ id: string }> };

export default async function VendorEditProductPage({ params }: Props) {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, vendorId: vendor.id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { include: { inventory: true } },
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
      <Link href="/vendor/products" className="text-sm text-muted-foreground hover:underline">
        ← My products
      </Link>
      <h1 className="font-serif text-3xl mt-4 mb-8">Edit product</h1>
      <ProductForm mode="vendor" categories={categories} initial={initial} />
    </div>
  );
}
