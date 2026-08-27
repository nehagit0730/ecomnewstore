import { prisma } from "@/server/db/prisma";
import { requireActiveVendor } from "@/lib/auth-utils";
import { vendorOrderService } from "@/server/services/admin-order.service";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET() {
  try {
    const { vendor } = await requireActiveVendor();
    const [products, pending, sales] = await Promise.all([
      prisma.product.count({ where: { vendorId: vendor.id } }),
      prisma.product.count({
        where: { vendorId: vendor.id, approvalStatus: "PENDING_REVIEW" },
      }),
      vendorOrderService.getSalesSummary(vendor.id),
    ]);
    return Response.json({
      shopName: vendor.shopName,
      products,
      pendingReview: pending,
      ...sales,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
