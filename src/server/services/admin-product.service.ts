import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import type { CreateProductInput } from "@/server/validation/admin-product.schema";
import type { Prisma, ProductApprovalStatus } from "@prisma/client";

export class AdminProductService {
  async list(params: {
    page?: number;
    limit?: number;
    approvalStatus?: ProductApprovalStatus;
    vendorId?: string;
    search?: string;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const where: Prisma.ProductWhereInput = {};
    if (params.approvalStatus) where.approvalStatus = params.approvalStatus;
    if (params.vendorId) where.vendorId = params.vendorId;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { handle: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          vendor: { select: { id: true, shopName: true, slug: true } },
          category: { select: { name: true } },
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          variants: { take: 1, include: { inventory: true } },
          _count: { select: { variants: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { inventory: true } },
      },
    });
    if (!product) throw new AppError("Product not found", 404);
    return product;
  }

  async getByHandle(handle: string) {
    const product = await prisma.product.findUnique({
      where: { handle },
      include: {
        vendor: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { inventory: true } },
      },
    });
    if (!product) throw new AppError("Product not found", 404);
    return product;
  }

  async getByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        vendor: { select: { id: true, shopName: true } },
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { inventory: true } },
        _count: { select: { variants: true } },
      },
    });
  }

  async create(input: CreateProductInput, reviewerId?: string) {
    // Check if handle exists
    const exists = await prisma.product.findUnique({ 
      where: { handle: input.handle } 
    });
    if (exists) throw new AppError("Handle already exists", 409);

    // Check if SKU exists
    if (input.variants[0]?.sku) {
      const skuExists = await prisma.productVariant.findUnique({
        where: { sku: input.variants[0].sku }
      });
      if (skuExists) throw new AppError("SKU already exists", 409);
    }

    // Check if barcode exists
    if (input.variants[0]?.barcode) {
      const barcodeExists = await prisma.productVariant.findUnique({
        where: { barcode: input.variants[0].barcode }
      });
      if (barcodeExists) throw new AppError("Barcode already exists", 409);
    }

    const status = input.approvalStatus ?? "APPROVED";
    const isActive = input.isActive ?? status === "APPROVED";

    return prisma.product.create({
      data: {
        title: input.title,
        handle: input.handle,
        description: input.description,
        brand: input.brand,
        categoryId: input.categoryId,
        vendorId: input.vendorId,
        materials: input.materials,
        careInstructions: input.careInstructions,
        shippingInfo: input.shippingInfo,
        returnPolicy: input.returnPolicy,
        sizeChart: input.sizeChart,
        approvalStatus: status,
        isActive,
        isFeatured: input.isFeatured ?? false,
        isNew: input.isNew ?? false,
        isTrending: input.isTrending ?? false,
        isBestSeller: input.isBestSeller ?? false,
        reviewedAt: status === "APPROVED" ? new Date() : undefined,
        reviewedById: status === "APPROVED" ? reviewerId : undefined,
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
      include: { variants: true, images: true, vendor: true },
    });
  }

  async approve(id: string, reviewerId: string) {
    return prisma.product.update({
      where: { id },
      data: {
        approvalStatus: "APPROVED",
        isActive: true,
        rejectionReason: null,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
      },
    });
  }

  async reject(id: string, reviewerId: string, reason: string) {
    return prisma.product.update({
      where: { id },
      data: {
        approvalStatus: "REJECTED",
        isActive: false,
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
      },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  }

  async updateFull(id: string, input: CreateProductInput, reviewerId?: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new AppError("Product not found", 404);

    if (input.handle !== existing.handle) {
      const clash = await prisma.product.findUnique({ where: { handle: input.handle } });
      if (clash) throw new AppError("Handle already exists", 409);
    }

    // Check SKU uniqueness if changed
    if (input.variants[0]?.sku) {
      const existingVariant = await prisma.productVariant.findFirst({
        where: { 
          sku: input.variants[0].sku,
          productId: { not: id }
        }
      });
      if (existingVariant) throw new AppError("SKU already exists", 409);
    }

    const status = input.approvalStatus ?? existing.approvalStatus;
    const isActive = input.isActive ?? (status === "APPROVED");

    return prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          title: input.title,
          handle: input.handle,
          description: input.description,
          brand: input.brand,
          categoryId: input.categoryId || null,
          vendorId: input.vendorId || null,
          materials: input.materials,
          careInstructions: input.careInstructions,
          shippingInfo: input.shippingInfo,
          returnPolicy: input.returnPolicy,
          sizeChart: input.sizeChart,
          approvalStatus: status,
          isActive,
          isFeatured: input.isFeatured ?? existing.isFeatured,
          isNew: input.isNew ?? existing.isNew,
          isTrending: input.isTrending ?? existing.isTrending,
          isBestSeller: input.isBestSeller ?? existing.isBestSeller,
          reviewedAt: status === "APPROVED" ? new Date() : existing.reviewedAt,
          reviewedById: status === "APPROVED" ? reviewerId ?? existing.reviewedById : existing.reviewedById,
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
        include: {
          images: true,
          variants: { include: { inventory: true } },
          vendor: true,
          category: true,
        },
      });
    });
  }

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const variantIds = variants.map((v) => v.id);

      if (variantIds.length > 0) {
        await tx.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.orderItem.updateMany({
          where: { variantId: { in: variantIds } },
          data: { variantId: null },
        });
        await tx.inventory.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.productVariant.deleteMany({ where: { id: { in: variantIds } } });
      }

      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.collectionProduct.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.wishlist.deleteMany({ where: { productId: id } });
      return tx.product.delete({ where: { id } });
    });
  }

  async bulkDelete(ids: string[]) {
    if (ids.length === 0) throw new AppError("No product IDs provided", 400);

    return prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { productId: { in: ids } },
        select: { id: true },
      });
      const variantIds = variants.map((v) => v.id);

      if (variantIds.length > 0) {
        await tx.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.orderItem.updateMany({
          where: { variantId: { in: variantIds } },
          data: { variantId: null },
        });
        await tx.inventory.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.productVariant.deleteMany({ where: { id: { in: variantIds } } });
      }

      await tx.productImage.deleteMany({ where: { productId: { in: ids } } });
      await tx.collectionProduct.deleteMany({ where: { productId: { in: ids } } });
      await tx.review.deleteMany({ where: { productId: { in: ids } } });
      await tx.wishlist.deleteMany({ where: { productId: { in: ids } } });

      const result = await tx.product.deleteMany({
        where: { id: { in: ids } },
      });

      return { deletedCount: result.count };
    });
  }
}

export const adminProductService = new AdminProductService();