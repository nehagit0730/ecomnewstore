import { CouponType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";

export type CreateCouponInput = {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
};

export type UpdateCouponInput = Partial<{
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}>;

export class AdminCouponService {
  async list() {
    return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(input: CreateCouponInput) {
    const code = input.code.toUpperCase();
    const exists = await prisma.coupon.findUnique({ where: { code } });
    if (exists) throw new AppError("Coupon code already exists", 409);

    return prisma.coupon.create({
      data: {
        code,
        type: input.type,
        value: input.value,
        minOrderAmount: input.minOrderAmount,
        maxUses: input.maxUses,
        startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        isActive: input.isActive ?? true,
      },
    });
  }

  async update(id: string, input: UpdateCouponInput) {
    return prisma.coupon.update({
      where: { id },
      data: {
        ...(input.code ? { code: input.code.toUpperCase() } : {}),
        ...(input.type ? { type: input.type } : {}),
        ...(input.value !== undefined ? { value: input.value } : {}),
        ...(input.minOrderAmount !== undefined
          ? { minOrderAmount: input.minOrderAmount }
          : {}),
        ...(input.maxUses !== undefined ? { maxUses: input.maxUses } : {}),
        ...(input.startsAt !== undefined
          ? { startsAt: input.startsAt ? new Date(input.startsAt) : null }
          : {}),
        ...(input.expiresAt !== undefined
          ? { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
  }

  async delete(id: string) {
    return prisma.coupon.delete({ where: { id } });
  }
}

export const adminCouponService = new AdminCouponService();
