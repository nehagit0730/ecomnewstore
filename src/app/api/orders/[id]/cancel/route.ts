import { requireAuth } from "@/lib/auth-utils";
import { orderService } from "@/server/services/order.service";
import { toErrorResponse } from "@/server/errors/app-error";

type Props = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Props) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const order = await orderService.cancelByCustomer(id, user.id);
    return Response.json(order);
  } catch (error) {
    return toErrorResponse(error);
  }
}
