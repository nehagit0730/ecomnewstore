import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import { z } from "zod";

export const collectionSchema = z.object({
  title: z.string().min(1),
  handle: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  productIds: z.array(z.string()).optional(),
});

export class AdminCollectionService {
  async list() {
    return prisma.collection.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: { include: { product: { select: { id: true, title: true, handle: true } } } },
        _count: { select: { products: true } },
      },
    });
  }

  async getById(id: string) {
    const col = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: { orderBy: { sortOrder: "asc" }, include: { product: true } },
      },
    });
    if (!col) throw new AppError("Collection not found", 404);
    return col;
  }

  async create(input: z.infer<typeof collectionSchema>) {
    const exists = await prisma.collection.findUnique({ where: { handle: input.handle } });
    if (exists) throw new AppError("Handle already exists", 409);
    const { productIds, ...data } = input;
    return prisma.collection.create({
      data: {
        ...data,
        image: data.image || null,
        products: productIds?.length
          ? {
              create: productIds.map((productId, i) => ({
                productId,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: { products: true },
    });
  }

  async update(id: string, input: Partial<z.infer<typeof collectionSchema>>) {
    const { productIds, ...data } = input;
    return prisma.$transaction(async (tx) => {
      if (productIds !== undefined) {
        await tx.collectionProduct.deleteMany({ where: { collectionId: id } });
        if (productIds.length) {
          await tx.collectionProduct.createMany({
            data: productIds.map((productId, i) => ({
              collectionId: id,
              productId,
              sortOrder: i,
            })),
          });
        }
      }
      return tx.collection.update({
        where: { id },
        data: {
          ...data,
          ...(data.image !== undefined ? { image: data.image || null } : {}),
        },
        include: { products: { include: { product: true } } },
      });
    });
  }

  async delete(id: string) {
    return prisma.collection.delete({ where: { id } });
  }
}

export const adminCollectionService = new AdminCollectionService();
