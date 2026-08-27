import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import type { CreateProductInput } from "@/server/validation/admin-product.schema";

export class VendorProductService {
  async list(vendorId: string, params: { page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const where = { vendorId };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          variants: { take: 1 },
          _count: { select: { variants: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getById(vendorId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { inventory: true } },
        category: true,
      },
    });
    if (!product) throw new AppError("Product not found", 404);
    return product;
  }

  async create(vendorId: string, input: CreateProductInput) {
    const exists = await prisma.product.findUnique({ where: { handle: input.handle } });
    if (exists) throw new AppError("Handle already exists", 409);

    return prisma.product.create({
      data: {
        title: input.title,
        handle: input.handle,
        description: input.description,
        brand: input.brand,
        categoryId: input.categoryId,
        vendorId,
        materials: input.materials,
        careInstructions: input.careInstructions,
        shippingInfo: input.shippingInfo,
        returnPolicy: input.returnPolicy,
        sizeChart: input.sizeChart,
        approvalStatus: "DRAFT",
        isActive: false,
        images: {
          create: input.imageUrls.map((url, i) => ({ url, sortOrder: i })),
        },
        variants: {
          create: input.variants.map((v) => ({
            sku: v.sku,
            barcode: v.barcode,
            colorName: v.colorName,
            colorHex: v.colorHex,
            colorSlug: v.colorSlug,
            sizeLabel: v.sizeLabel,
            sizeValue: v.sizeValue,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            inventory: { create: { quantity: v.quantity } },
          })),
        },
      },
      include: { variants: true, images: true },
    });
  }

  async submitForReview(vendorId: string, productId: string) {
    const product = await this.getById(vendorId, productId);
    if (product.approvalStatus === "APPROVED") {
      throw new AppError("Product is already approved", 400);
    }
    return prisma.product.update({
      where: { id: productId },
      data: { approvalStatus: "PENDING_REVIEW" },
    });
  }

  async update(vendorId: string, productId: string, input: Partial<CreateProductInput>) {
    const product = await this.getById(vendorId, productId);
    if (product.approvalStatus === "PENDING_REVIEW") {
      throw new AppError("Cannot edit while pending review", 400);
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        title: input.title,
        description: input.description,
        brand: input.brand,
        categoryId: input.categoryId,
        materials: input.materials,
        careInstructions: input.careInstructions,
        shippingInfo: input.shippingInfo,
        returnPolicy: input.returnPolicy,
        sizeChart: input.sizeChart,
        ...(product.approvalStatus === "APPROVED"
          ? { approvalStatus: "PENDING_REVIEW", isActive: false }
          : {}),
      },
    });
  }
}

export const vendorProductService = new VendorProductService();
