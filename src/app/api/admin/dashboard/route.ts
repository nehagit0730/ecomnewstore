import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET() {
  try {
    await requireSuperAdmin();
    const [orders, revenue, customers, products, lowStock, vendors, pendingProducts] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
          where: { status: { in: ["PAID", "FULFILLED"] } },
          _sum: { total: true },
        }),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.product.count({ where: { isActive: true, approvalStatus: "APPROVED" } }),
        prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
        prisma.vendor.count({ where: { status: "ACTIVE" } }),
        prisma.product.count({ where: { approvalStatus: "PENDING_REVIEW" } }),
      ]);
    return Response.json({
      orders,
      revenue: Number(revenue._sum.total ?? 0),
      customers,
      products,
      lowStock,
      vendors,
      pendingProducts,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
