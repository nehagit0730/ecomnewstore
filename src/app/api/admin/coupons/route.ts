import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminCouponService } from "@/server/services/admin-coupon.service";
import { toErrorResponse } from "@/server/errors/app-error";

const schema = z.object({
  code: z.string().min(2),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().positive().optional(),
  maxUses: z.coerce.number().int().positive().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireSuperAdmin();
    return Response.json(await adminCouponService.list());
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
    const body = schema.parse(await req.json());
    const coupon = await adminCouponService.create(body);
    return Response.json(coupon, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
