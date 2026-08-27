import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import type { OrderStatus, Prisma } from "@prisma/client";

export class AdminOrderService {
  async list(params: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    vendorId?: string;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const where: Prisma.OrderWhereInput = {};
    if (params.status) where.status = params.status;
    if (params.vendorId) {
      where.items = { some: { vendorId: params.vendorId } };
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          items: { include: { vendor: { select: { shopName: true } } } },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { variant: true, vendor: true } },
        address: true,
        payments: true,
        shipment: true,
        coupon: true,
      },
    });
    if (!order) throw new AppError("Order not found", 404);
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const data: Prisma.OrderUpdateInput = { status };
    if (status === "PAID") data.paidAt = new Date();
    if (status === "FULFILLED") data.fulfilledAt = new Date();
    if (status === "CANCELLED") data.cancelledAt = new Date();
    return prisma.order.update({ where: { id }, data });
  }
}

export const adminOrderService = new AdminOrderService();

export class VendorOrderService {
  async list(vendorId: string, params: { page?: number; limit?: number; status?: OrderStatus }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const where: Prisma.OrderWhereInput = {
      items: { some: { vendorId } },
    };
    if (params.status) where.status = params.status;

    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: { where: { vendorId }, include: { variant: true } },
        user: { select: { email: true } },
      },
    });

    const total = await prisma.order.count({ where });
    return { items: orders, total, page, limit };
  }

  async getSalesSummary(vendorId: string) {
    const items = await prisma.orderItem.findMany({
      where: {
        vendorId,
        order: { status: { in: ["PAID", "FULFILLED"] } },
      },
      select: { totalPrice: true, quantity: true, order: { select: { createdAt: true } } },
    });

    const revenue = items.reduce((sum, i) => sum + Number(i.totalPrice), 0);
    const unitsSold = items.reduce((sum, i) => sum + i.quantity, 0);

    return { revenue, unitsSold, orderLines: items.length };
  }
}

export const vendorOrderService = new VendorOrderService();
