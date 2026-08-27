import { prisma } from "@/server/db/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function AdminNewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Add product</h1>
      <ProductForm mode="admin" categories={categories} />
    </div>
  );
}
