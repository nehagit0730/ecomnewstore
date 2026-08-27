import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { CollectionEditor } from "@/components/admin/collection-editor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditCollectionPage({ params }: Props) {
  const { id } = await params;
  const col = await prisma.collection.findUnique({
    where: { id },
    include: { products: true },
  });
  if (!col) notFound();

  const allProducts = await prisma.product.findMany({
    select: { id: true, title: true, handle: true },
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Edit collection</h1>
      <CollectionEditor
        allProducts={allProducts}
        initial={{
          id: col.id,
          title: col.title,
          handle: col.handle,
          description: col.description,
          image: col.image,
          isActive: col.isActive,
          sortOrder: col.sortOrder,
          productIds: col.products.map((p) => p.productId),
        }}
      />
    </div>
  );
}
