import { CouponType } from "@prisma/client";
import { AppError } from "@/server/errors/app-error";
import { prisma } from "@/server/db/prisma";

export class CouponService {
  async validate(code: string, subtotal?: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon?.isActive) throw new AppError("Invalid coupon");
    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new AppError("Coupon not yet active");
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new AppError("Coupon expired");
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new AppError("Coupon limit reached");
    }
    if (subtotal !== undefined && coupon.minOrderAmount) {
      if (subtotal < Number(coupon.minOrderAmount)) {
        throw new AppError("Minimum order amount not met");
      }
    }
    return coupon;
  }

  discount(
    coupon: { type: CouponType; value: { toString(): string } },
    subtotal: number
  ) {
    const value = Number(coupon.value);
    if (coupon.type === CouponType.PERCENTAGE) {
      return Math.round(subtotal * (value / 100) * 100) / 100;
    }
    return Math.min(value, subtotal);
  }
}

export const couponService = new CouponService();
