import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminVendorService } from "@/server/services/admin-vendor.service";
import { toErrorResponse } from "@/server/errors/app-error";
import { z } from "zod";
import type { VendorStatus } from "@prisma/client";

const updateSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]),
});

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const { status } = updateSchema.parse(await request.json());
    const vendor = await adminVendorService.updateStatus(id, status as VendorStatus);
    return Response.json(vendor);
  } catch (error) {
    return toErrorResponse(error);
  }
}
