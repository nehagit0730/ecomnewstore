import { z } from "zod";
import { cartService } from "@/server/services/cart.service";
import { requireAuth } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";

const schema = z.object({
  items: z
    .array(
      z.object({
        handle: z.string().min(1),
        size: z.string().min(1),
        color: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1),
  couponCode: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await req.json());
    const cart = await cartService.syncFromClient(user.id, body.items, body.couponCode);
    return Response.json(cart);
  } catch (error) {
    return toErrorResponse(error);
  }
}
