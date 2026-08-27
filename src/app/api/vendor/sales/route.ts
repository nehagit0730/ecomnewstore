import { requireActiveVendor } from "@/lib/auth-utils";
import { vendorOrderService } from "@/server/services/admin-order.service";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET() {
  try {
    const { vendor } = await requireActiveVendor();
    const sales = await vendorOrderService.getSalesSummary(vendor.id);
    return Response.json(sales);
  } catch (error) {
    return toErrorResponse(error);
  }
}
