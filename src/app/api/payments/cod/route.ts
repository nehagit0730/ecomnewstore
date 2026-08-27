import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";
import { paymentService } from "@/server/services/payment.service";
import { toErrorResponse } from "@/server/errors/app-error";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { orderId } = schema.parse(await req.json());
    const order = await paymentService.confirmCod(orderId, user.id);
    return Response.json(order);
  } catch (error) {
    return toErrorResponse(error);
  }
}
