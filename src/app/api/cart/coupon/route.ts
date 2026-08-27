import { z } from "zod";
import { cartService } from "@/server/services/cart.service";
import { couponService } from "@/server/services/coupon.service";
import { prisma } from "@/server/db/prisma";
import { getSessionUser } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";

const applySchema = z.object({ code: z.string().min(2) });

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ message: "Sign in required" }, { status: 401 });
    const { code } = applySchema.parse(await req.json());
    const cart = await cartService.applyCoupon(user.id, undefined, code);
    const coupon = await couponService.validate(cart.couponCode!, cart.subtotal);
    const discountAmount = couponService.discount(coupon, cart.subtotal);
    const discountRate = cart.subtotal > 0 ? discountAmount / cart.subtotal : 0;
    return Response.json({ ...cart, discountRate, discountAmount });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ message: "Sign in required" }, { status: 401 });
    const cart = await cartService.getOrCreate(user.id, undefined);
    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponCode: null },
    });
    return Response.json(await cartService.getOrCreate(user.id, undefined));
  } catch (error) {
    return toErrorResponse(error);
  }
}
