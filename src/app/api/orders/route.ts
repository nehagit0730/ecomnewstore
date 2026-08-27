import { NextRequest } from "next/server";
import { z } from "zod";
import { orderService } from "@/server/services/order.service";
import { requireAuth } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(5),
  phone: z.string().min(10),
  sessionId: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const orders = await orderService.findUserOrders(user.id);
    return Response.json(orders);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await req.json());
    const order = await orderService.create(user.id, body);
    return Response.json(order, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
