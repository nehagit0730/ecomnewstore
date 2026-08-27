import { requireSuperAdmin } from "@/lib/auth-utils";
import { adminOrderService } from "@/server/services/admin-order.service";
import { toErrorResponse } from "@/server/errors/app-error";
import type { OrderStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(request.url);
    const data = await adminOrderService.list({
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
      status: (searchParams.get("status") as OrderStatus) || undefined,
      vendorId: searchParams.get("vendorId") ?? undefined,
    });
    return Response.json(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
