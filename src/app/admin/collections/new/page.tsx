import { prisma } from "@/server/db/prisma";
import { CollectionEditor } from "@/components/admin/collection-editor";

export default async function AdminNewCollectionPage() {
  const allProducts = await prisma.product.findMany({
    select: { id: true, title: true, handle: true },
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">New collection</h1>
      <CollectionEditor allProducts={allProducts} />
    </div>
  );
}
