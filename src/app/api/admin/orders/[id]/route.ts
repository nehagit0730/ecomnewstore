import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminOrderService } from "@/server/services/admin-order.service";
import { orderService } from "@/server/services/order.service";
import { toErrorResponse } from "@/server/errors/app-error";
import { z } from "zod";
import type { OrderStatus } from "@prisma/client";

const updateSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"]),
});

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    return Response.json(await adminOrderService.getById(id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const { status } = updateSchema.parse(await request.json());
    const order = await orderService.updateStatus(id, status as OrderStatus);
    return Response.json(order);
  } catch (error) {
    return toErrorResponse(error);
  }
}
