import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminCouponService } from "@/server/services/admin-coupon.service";
import { toErrorResponse } from "@/server/errors/app-error";

const schema = z.object({
  code: z.string().min(2).optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  value: z.coerce.number().positive().optional(),
  minOrderAmount: z.coerce.number().positive().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

type Props = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = schema.parse(await req.json());
    return Response.json(await adminCouponService.update(id, body));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    await adminCouponService.delete(id);
    return Response.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
