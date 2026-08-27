import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageEditor } from "@/components/admin/page-editor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditPagePage({ params }: Props) {
  const { id } = await params;
  const page = await prisma.storePage.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Edit page</h1>
      <PageEditor initial={page} />
    </div>
  );
}
