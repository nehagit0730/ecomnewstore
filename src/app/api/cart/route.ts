import { NextRequest } from "next/server";
import { cartService } from "@/server/services/cart.service";
import { getSessionUser } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const sessionId = req.headers.get("x-session-id") ?? undefined;
    const cart = await cartService.getOrCreate(user?.id, sessionId);
    return Response.json(cart);
  } catch (error) {
    return toErrorResponse(error);
  }
}
