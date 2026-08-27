import { prisma } from "@/server/db/prisma";
import { siteConfig } from "@/config/site";

export class AdminInventoryService {
  async listLowStock() {
    const rows = await prisma.inventory.findMany({
      where: { quantity: { lte: siteConfig.lowStockThreshold } },
      include: {
        variant: {
          include: {
            product: {
              select: { id: true, title: true, handle: true, isActive: true },
            },
          },
        },
      },
      orderBy: { quantity: "asc" },
      take: 100,
    });
    return rows.map((r) => ({
      id: r.id,
      quantity: r.quantity,
      reservedQuantity: r.reservedQuantity,
      sku: r.variant.sku,
      colorName: r.variant.colorName,
      sizeLabel: r.variant.sizeLabel,
      product: r.variant.product,
    }));
  }
}

export const adminInventoryService = new AdminInventoryService();
