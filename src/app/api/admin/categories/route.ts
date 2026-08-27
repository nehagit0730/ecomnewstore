import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
});

export async function GET() {
  try {
    await requireSuperAdmin();
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    return Response.json(categories);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = createSchema.parse(await request.json());
    const category = await prisma.category.create({ data: body });
    return Response.json(category, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
