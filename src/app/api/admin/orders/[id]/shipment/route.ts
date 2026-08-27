import { z } from "zod";
import { ShipmentStatus } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/server/db/prisma";
import { toErrorResponse } from "@/server/errors/app-error";
import { AppError } from "@/server/errors/app-error";

const schema = z.object({
  status: z
    .enum(["PENDING", "LABEL_CREATED", "IN_TRANSIT", "DELIVERED", "FAILED"])
    .optional(),
  trackingNumber: z.string().nullable().optional(),
});

type Props = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = schema.parse(await req.json());

    const order = await prisma.order.findUnique({
      where: { id },
      include: { shipment: true },
    });
    if (!order) throw new AppError("Order not found", 404);
    if (!order.shipment) throw new AppError("Shipment not found", 404);

    const data: { status?: ShipmentStatus; trackingNumber?: string | null } = {};
    if (body.status) data.status = body.status as ShipmentStatus;
    if (body.trackingNumber !== undefined) data.trackingNumber = body.trackingNumber;

    const shipment = await prisma.shipment.update({
      where: { id: order.shipment.id },
      data,
    });
    return Response.json(shipment);
  } catch (error) {
    return toErrorResponse(error);
  }
}
