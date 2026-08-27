import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { Button } from "@/components/ui/button";

export default async function AdminPagesListPage() {
  const pages = await prisma.storePage.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div>
      <div className="flex justify-between mb-8">
        <h1 className="font-serif text-3xl">Content pages</h1>
        <Button variant="luxury" asChild>
          <Link href="/admin/pages/new">New page</Link>
        </Button>
      </div>
      <div className="border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-4">Title</th>
              <th className="p-4">Handle</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4">/pages/{p.handle}</td>
                <td className="p-4">{p.isPublished ? "Published" : "Draft"}</td>
                <td className="p-4">
                  <Link href={`/admin/pages/${p.id}`} className="underline">
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
