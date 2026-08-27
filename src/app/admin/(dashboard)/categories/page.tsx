import { prisma } from "@/server/db/prisma";
import { CreateCategoryForm } from "@/components/admin/create-category-form";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Categories</h1>
      <div className="border bg-background">
        <ul className="divide-y">
          {categories.map((c) => (
            <li key={c.id} className="px-4 py-3 flex justify-between text-sm">
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground">{c.slug}</span>
            </li>
          ))}
        </ul>
      </div>
      <CreateCategoryForm />
    </div>
  );
}
