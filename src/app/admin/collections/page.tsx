import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { Button } from "@/components/ui/button";

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex justify-between mb-8">
        <h1 className="font-serif text-3xl">Collections</h1>
        <Button variant="luxury" asChild>
          <Link href="/admin/collections/new">New collection</Link>
        </Button>
      </div>
      <div className="border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-4">Title</th>
              <th className="p-4">Handle</th>
              <th className="p-4">Products</th>
              <th className="p-4">Active</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-4 font-medium">{c.title}</td>
                <td className="p-4">/collections/{c.handle}</td>
                <td className="p-4">{c._count.products}</td>
                <td className="p-4">{c.isActive ? "Yes" : "No"}</td>
                <td className="p-4">
                  <Link href={`/admin/collections/${c.id}`} className="underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
