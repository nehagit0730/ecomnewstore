import { prisma } from "@/server/db/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function VendorNewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Add product</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Products are reviewed by the platform before going live on the store.
      </p>
      <ProductForm mode="vendor" categories={categories} />
    </div>
  );
}
