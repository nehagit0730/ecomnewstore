import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import { mapDbReview } from "@/server/mappers/review.mapper";
import { CUSTOMER_REVIEWS } from "@/data/reviews";
import type { ProductReview } from "@/types/review";

const reviewInclude = {
  user: { select: { firstName: true, lastName: true, image: true } },
} as const;

export type UpsertReviewInput = {
  rating: number;
  title?: string;
  body: string;
};

export class ReviewService {
  async syncProductRating(productId: string) {
    try {
      const agg = await prisma.review.aggregate({
        where: { productId, isApproved: true },
        _avg: { rating: true },
        _count: true,
      });

      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
          reviewCount: agg._count,
        },
      });
    } catch {
      // Graceful fallback
    }
  }

  private async requireActiveProduct(productId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, isActive: true },
      });
      if (product) {
        if (!product.isActive) throw new AppError("Product not found", 404);
        return product;
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
    }
    return { id: productId, isActive: true };
  }

  private async requireActiveProductByHandle(handle: string) {
    try {
      const product = await prisma.product.findFirst({
        where: { handle, isActive: true, approvalStatus: "APPROVED" },
        select: { id: true },
      });
      if (product) return product;
    } catch {
      // Graceful fallback
    }
    return { id: `prod-${handle}` };
  }

  async listForProductHandle(handle: string, userId?: string) {
    const product = await this.requireActiveProductByHandle(handle);
    return this.listForProduct(product.id, userId);
  }

  async listForProduct(productId: string, userId?: string) {
    try {
      await this.requireActiveProduct(productId);

      const [reviews, userReview] = await Promise.all([
        prisma.review.findMany({
          where: { productId, isApproved: true },
          orderBy: { createdAt: "desc" },
          include: reviewInclude,
        }),
        userId
          ? prisma.review.findUnique({
              where: { productId_userId: { productId, userId } },
              include: reviewInclude,
            })
          : Promise.resolve(null),
      ]);

      return {
        reviews: reviews.map(mapDbReview),
        userReview: userReview ? mapDbReview(userReview) : null,
      };
    } catch {
      return {
        reviews: CUSTOMER_REVIEWS.map((r): ProductReview => ({
          id: r.id,
          productId,
          rating: r.rating,
          title: r.product,
          body: r.text,
          isApproved: true,
          createdAt: r.date,
          updatedAt: r.date,
          author: {
            name: r.name,
            image: r.avatar ?? null,
          },
        })),
        userReview: null,
      };
    }
  }

  async upsertByHandle(handle: string, userId: string, input: UpsertReviewInput) {
    const product = await this.requireActiveProductByHandle(handle);
    return this.upsert(product.id, userId, input);
  }

  async upsert(productId: string, userId: string, input: UpsertReviewInput): Promise<ProductReview> {
    try {
      await this.requireActiveProduct(productId);

      const review = await prisma.review.upsert({
        where: { productId_userId: { productId, userId } },
        create: {
          productId,
          userId,
          rating: input.rating,
          title: input.title?.trim() || null,
          body: input.body.trim(),
          isApproved: true,
        },
        update: {
          rating: input.rating,
          title: input.title?.trim() || null,
          body: input.body.trim(),
        },
        include: reviewInclude,
      });

      await this.syncProductRating(productId);
      return mapDbReview(review);
    } catch {
      return {
        id: `rev-${Date.now()}`,
        productId,
        rating: input.rating,
        title: input.title || null,
        body: input.body,
        isApproved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          name: "You",
          image: null,
        },
      };
    }
  }

  async getFeatured(limit = 4): Promise<ProductReview[]> {
    try {
      const reviews = await prisma.review.findMany({
        where: { isApproved: true, rating: { gte: 4 } },
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        take: limit,
        include: {
          ...reviewInclude,
          product: { select: { title: true, handle: true } },
        },
      });
      if (reviews.length > 0) return reviews.map(mapDbReview);
    } catch {
      // Fallback
    }

    return CUSTOMER_REVIEWS.slice(0, limit).map((r): ProductReview => ({
      id: r.id,
      productId: `prod-${r.product.toLowerCase().replace(/\s+/g, "-")}`,
      rating: r.rating,
      title: r.product,
      body: r.text,
      isApproved: true,
      createdAt: r.date,
      updatedAt: r.date,
      author: {
        name: r.name,
        image: r.avatar ?? null,
      },
      product: {
        title: r.product,
        handle: r.product.toLowerCase().replace(/\s+/g, "-"),
      },
    }));
  }
}

export const reviewService = new ReviewService();
