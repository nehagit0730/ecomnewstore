import { OrderStatus } from "@prisma/client";
import { AppError } from "@/server/errors/app-error";
import { prisma } from "@/server/db/prisma";
import { cartService } from "@/server/services/cart.service";
import { couponService } from "@/server/services/coupon.service";
import { siteConfig } from "@/config/site";
import { generateOrderNumber } from "@/utils/slug";
import { accountService } from "@/server/services/account.service";

export type CreateOrderInput = {
  email: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  sessionId?: string;
};

export class OrderService {
  async create(userId: string | undefined, input: CreateOrderInput) {
    const cart = await cartService.getOrCreate(userId, input.sessionId);
    if (!cart.items.length) throw new AppError("Cart is empty");

    let discountAmount = 0;
    let couponId: string | undefined;
    if (cart.couponCode) {
      const coupon = await couponService.validate(cart.couponCode, cart.subtotal);
      discountAmount = couponService.discount(coupon, cart.subtotal);
      couponId = coupon.id;
    }

    const shippingAmount =
      cart.subtotal >= siteConfig.freeShippingThreshold
        ? 0
        : siteConfig.defaultShipping;
    const subtotal = cart.subtotal;
    const taxable = subtotal - discountAmount;
    const taxAmount = siteConfig.pricesIncludeGst ? 0 : Math.round(taxable * 0.05 * 100) / 100;
    const total = taxable + taxAmount + shippingAmount;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: { reservedQuantity: { increment: item.quantity } },
        });
      }

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          status: OrderStatus.PENDING,
          email: input.email,
          subtotal,
          discountAmount,
          shippingAmount,
          taxAmount,
          total,
          couponId,
          items: {
            create: await Promise.all(
              cart.items.map(async (item) => {
                const variant = await tx.productVariant.findUnique({
                  where: { id: item.variantId },
                  include: { product: { select: { vendorId: true } } },
                });
                return {
                  variantId: item.variantId,
                  vendorId: variant?.product.vendorId ?? undefined,
                  productTitle: item.title,
                  variantSku: item.sku,
                  colorName: item.color,
                  sizeLabel: item.size,
                  imageUrl: item.image,
                  quantity: item.quantity,
                  unitPrice: item.price,
                  totalPrice: item.price * item.quantity,
                };
              })
            ),
          },
          address: {
            create: {
              firstName: input.firstName,
              lastName: input.lastName,
              line1: input.line1,
              line2: input.line2,
              city: input.city,
              state: input.state,
              postalCode: input.postalCode,
              phone: input.phone,
            },
          },
          shipment: { create: { status: "PENDING" } },
        },
        include: { items: true, address: true },
      });

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });

    if (userId) {
      await accountService.saveCheckoutAddress(userId, input).catch(() => undefined);
    }

    return order;
  }

  async cancelByCustomer(orderId: string, userId: string) {
    const order = await this.findById(orderId, userId);
    if (order.status !== OrderStatus.PENDING) {
      throw new AppError("Only pending orders can be cancelled", 400);
    }
    return this.updateStatus(orderId, OrderStatus.CANCELLED);
  }

  async findUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true, address: true, payments: true, shipment: true },
    });
  }

  async findById(id: string, userId?: string) {
    const order = await prisma.order.findFirst({
      where: userId ? { id, userId } : { id },
      include: {
        items: true,
        address: true,
        payments: true,
        shipment: true,
      },
    });
    if (!order) throw new AppError("Order not found", 404);
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new AppError("Order not found", 404);

    const data: Record<string, unknown> = { status };
    if (status === OrderStatus.PAID) data.paidAt = new Date();
    if (status === OrderStatus.FULFILLED) data.fulfilledAt = new Date();
    if (status === OrderStatus.CANCELLED) data.cancelledAt = new Date();

    return prisma.$transaction(async (tx) => {
      if (status === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.inventory.update({
              where: { variantId: item.variantId },
              data: { reservedQuantity: { decrement: item.quantity } },
            });
          }
        }
      }
      if (status === OrderStatus.PAID) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.inventory.update({
              where: { variantId: item.variantId },
              data: {
                quantity: { decrement: item.quantity },
                reservedQuantity: { decrement: item.quantity },
              },
            });
          }
        }
      }
      return tx.order.update({
        where: { id },
        data,
        include: { items: true, shipment: true },
      });
    });
  }
}

export const orderService = new OrderService();
