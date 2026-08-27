import { AppError } from "@/server/errors/app-error";
import { prisma } from "@/server/db/prisma";
import { couponService } from "@/server/services/coupon.service";

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: { images: { orderBy: { sortOrder: "asc" as const }, take: 1 } },
          },
          inventory: true,
        },
      },
    },
  },
} as const;

export class CartService {
  async getOrCreate(userId?: string, sessionId?: string) {
    if (userId) {
      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: cartInclude,
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: cartInclude,
        });
      }
      return this.mapCart(cart);
    }
    if (!sessionId) throw new AppError("Session required for guest cart");
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: cartInclude,
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
        include: cartInclude,
      });
    }
    return this.mapCart(cart);
  }

  async addItem(
    userId: string | undefined,
    sessionId: string | undefined,
    variantId: string,
    quantity: number
  ) {
    const cartRecord = await this.resolveRecord(userId, sessionId);
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true },
    });
    if (!variant?.isActive) throw new AppError("Variant not found", 404);
    const available =
      (variant.inventory?.quantity ?? 0) -
      (variant.inventory?.reservedQuantity ?? 0);
    if (available < quantity) throw new AppError("Insufficient stock");

    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: { cartId: cartRecord.id, variantId },
      },
      create: { cartId: cartRecord.id, variantId, quantity },
      update: { quantity: { increment: quantity } },
    });
    return this.getOrCreate(userId, sessionId);
  }

  async updateItem(
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: string,
    quantity: number
  ) {
    const cartRecord = await this.resolveRecord(userId, sessionId);
    if (quantity < 1) {
      await prisma.cartItem.deleteMany({
        where: { id: itemId, cartId: cartRecord.id },
      });
    } else {
      await prisma.cartItem.updateMany({
        where: { id: itemId, cartId: cartRecord.id },
        data: { quantity },
      });
    }
    return this.getOrCreate(userId, sessionId);
  }

  async removeItem(
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: string
  ) {
    const cartRecord = await this.resolveRecord(userId, sessionId);
    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cartRecord.id },
    });
    return this.getOrCreate(userId, sessionId);
  }

  async syncFromClient(
    userId: string,
    items: { handle: string; size: string; color: string; quantity: number }[],
    couponCode?: string | null
  ) {
    const cartRecord = await this.resolveRecord(userId, undefined);
    await prisma.cartItem.deleteMany({ where: { cartId: cartRecord.id } });

    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: { handle: item.handle, isActive: true, approvalStatus: "APPROVED" },
        include: { variants: { include: { inventory: true } } },
      });
      if (!product) throw new AppError(`Product not found: ${item.handle}`, 404);

      const variant = product.variants.find(
        (v) =>
          v.isActive &&
          v.colorSlug === item.color &&
          (v.sizeValue === item.size || v.sizeLabel === item.size)
      );
      if (!variant) {
        throw new AppError(`Variant not found for ${item.handle} (${item.color}/${item.size})`, 404);
      }

      const available =
        (variant.inventory?.quantity ?? 0) - (variant.inventory?.reservedQuantity ?? 0);
      if (available < item.quantity) throw new AppError(`Insufficient stock for ${product.title}`);

      await prisma.cartItem.create({
        data: {
          cartId: cartRecord.id,
          variantId: variant.id,
          quantity: item.quantity,
        },
      });
    }

    await prisma.cart.update({
      where: { id: cartRecord.id },
      data: { couponCode: couponCode?.toUpperCase() || null },
    });

    return this.getOrCreate(userId, undefined);
  }

  async applyCoupon(
    userId: string | undefined,
    sessionId: string | undefined,
    code: string
  ) {
    const cart = await this.getOrCreate(userId, sessionId);
    await couponService.validate(code, cart.subtotal);
    const record = await this.resolveRecord(userId, sessionId);
    await prisma.cart.update({
      where: { id: record.id },
      data: { couponCode: code.toUpperCase() },
    });
    return this.getOrCreate(userId, sessionId);
  }

  private async resolveRecord(userId?: string, sessionId?: string) {
    const mapped = await this.getOrCreate(userId, sessionId);
    return prisma.cart.findUniqueOrThrow({ where: { id: mapped.id } });
  }

  private mapCart(cart: {
    id: string;
    couponCode: string | null;
    items: {
      id: string;
      quantity: number;
      variant: {
        id: string;
        sku: string;
        colorName: string;
        colorHex: string | null;
        sizeLabel: string;
        price: { toString(): string };
        compareAtPrice: { toString(): string } | null;
        product: {
          id: string;
          handle: string;
          title: string;
          brand: string;
          images: { url: string }[];
        };
        inventory: { quantity: number; reservedQuantity: number } | null;
      };
    }[];
  }) {
    const items = cart.items.map((item) => ({
      id: item.id,
      variantId: item.variant.id,
      productId: item.variant.product.id,
      handle: item.variant.product.handle,
      title: item.variant.product.title,
      brand: item.variant.product.brand,
      image: item.variant.product.images[0]?.url ?? "",
      price: Number(item.variant.price),
      compareAtPrice: item.variant.compareAtPrice
        ? Number(item.variant.compareAtPrice)
        : undefined,
      quantity: item.quantity,
      size: item.variant.sizeLabel,
      color: item.variant.colorName,
      colorHex: item.variant.colorHex ?? "#000",
      sku: item.variant.sku,
      maxQuantity: Math.max(
        0,
        (item.variant.inventory?.quantity ?? 0) -
          (item.variant.inventory?.reservedQuantity ?? 0)
      ),
    }));
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { id: cart.id, couponCode: cart.couponCode, items, subtotal };
  }
}

export const cartService = new CartService();
