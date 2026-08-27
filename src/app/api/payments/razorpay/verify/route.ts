import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";
import { paymentService } from "@/server/services/payment.service";
import { toErrorResponse } from "@/server/errors/app-error";

const schema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await req.json());
    const order = await paymentService.verifyRazorpayPayment(user.id, body);
    return Response.json(order);
  } catch (error) {
    return toErrorResponse(error);
  }
}
