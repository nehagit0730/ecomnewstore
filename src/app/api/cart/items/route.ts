import { NextRequest } from "next/server";
import { z } from "zod";
import { cartService } from "@/server/services/cart.service";
import { getSessionUser } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";

const schema = z.object({
  variantId: z.string(),
  quantity: z.number().int().min(1).max(10),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const sessionId = req.headers.get("x-session-id") ?? undefined;
    const body = schema.parse(await req.json());
    const cart = await cartService.addItem(
      user?.id,
      sessionId,
      body.variantId,
      body.quantity
    );
    return Response.json(cart);
  } catch (error) {
    return toErrorResponse(error);
  }
}
