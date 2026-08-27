import { requireActiveVendor } from "@/lib/auth-utils";
import { vendorOrderService } from "@/server/services/admin-order.service";
import { toErrorResponse } from "@/server/errors/app-error";
import type { OrderStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { vendor } = await requireActiveVendor();
    const { searchParams } = new URL(request.url);
    const data = await vendorOrderService.list(vendor.id, {
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
      status: (searchParams.get("status") as OrderStatus) || undefined,
    });
    return Response.json(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
