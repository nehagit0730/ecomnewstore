import { z } from "zod";
import { couponService } from "@/server/services/coupon.service";
import { toErrorResponse } from "@/server/errors/app-error";

const schema = z.object({
  code: z.string().min(2),
  subtotal: z.number().min(0),
});

export async function POST(req: Request) {
  try {
    const { code, subtotal } = schema.parse(await req.json());
    const coupon = await couponService.validate(code, subtotal);
    const discountAmount = couponService.discount(coupon, subtotal);
    const discountRate = subtotal > 0 ? discountAmount / subtotal : 0;
    return Response.json({
      code: coupon.code,
      discountAmount,
      discountRate,
      type: coupon.type,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
