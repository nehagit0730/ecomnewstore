import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import { z } from "zod";

export const pageSchema = z.object({
  title: z.string().min(1),
  handle: z.string().regex(/^[a-z0-9-]+$/),
  body: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isPublished: z.boolean().optional(),
  showInFooter: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export class AdminPageService {
  async list() {
    return prisma.storePage.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  }

  async getById(id: string) {
    const page = await prisma.storePage.findUnique({ where: { id } });
    if (!page) throw new AppError("Page not found", 404);
    return page;
  }

  async create(input: z.infer<typeof pageSchema>) {
    const exists = await prisma.storePage.findUnique({ where: { handle: input.handle } });
    if (exists) throw new AppError("Handle already exists", 409);
    return prisma.storePage.create({ data: input });
  }

  async update(id: string, input: Partial<z.infer<typeof pageSchema>>) {
    return prisma.storePage.update({ where: { id }, data: input });
  }

  async delete(id: string) {
    return prisma.storePage.delete({ where: { id } });
  }
}

export const adminPageService = new AdminPageService();
