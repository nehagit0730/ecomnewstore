import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import { mapDbReview } from "@/server/mappers/review.mapper";
import { reviewService } from "@/server/services/review.service";

const reviewInclude = {
  user: { select: { firstName: true, lastName: true, image: true } },
  product: { select: { title: true, handle: true } },
} as const;

export type AdminUpdateReviewInput = Partial<{
  rating: number;
  title: string | null;
  body: string;
  isApproved: boolean;
}>;

export class AdminReviewService {
  async list(filters?: { productId?: string; approved?: boolean }) {
    const reviews = await prisma.review.findMany({
      where: {
        ...(filters?.productId ? { productId: filters.productId } : {}),
        ...(filters?.approved !== undefined ? { isApproved: filters.approved } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: reviewInclude,
    });
    return reviews.map(mapDbReview);
  }

  async update(id: string, input: AdminUpdateReviewInput) {
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) throw new AppError("Review not found", 404);

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(input.rating !== undefined ? { rating: input.rating } : {}),
        ...(input.title !== undefined ? { title: input.title?.trim() || null } : {}),
        ...(input.body !== undefined ? { body: input.body.trim() } : {}),
        ...(input.isApproved !== undefined ? { isApproved: input.isApproved } : {}),
      },
      include: reviewInclude,
    });

    await reviewService.syncProductRating(existing.productId);
    return mapDbReview(review);
  }

  async delete(id: string) {
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) throw new AppError("Review not found", 404);

    await prisma.review.delete({ where: { id } });
    await reviewService.syncProductRating(existing.productId);
    return { ok: true };
  }
}

export const adminReviewService = new AdminReviewService();
