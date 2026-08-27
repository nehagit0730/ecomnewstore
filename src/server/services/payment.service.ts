import crypto from "crypto";
import {
  PaymentProvider,
  PaymentStatus,
  OrderStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay";
import { isRazorpayConfigured } from "@/lib/payments";
import { orderService } from "@/server/services/order.service";
import { sendOrderConfirmationEmail } from "@/server/services/email.service";

function toPaymentMetadata(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function notifyOrderPlaced(orderId: string, paymentLabel: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;
  await sendOrderConfirmationEmail({
    orderNumber: order.orderNumber,
    email: order.email,
    total: Number(order.total),
    paymentLabel,
    items: order.items.map((i) => ({
      productTitle: i.productTitle,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
    })),
  });
}

export class PaymentService {
  async createRazorpayCheckout(orderId: string, userId: string) {
    if (!isRazorpayConfigured()) {
      throw new AppError("Online payments are not configured", 503);
    }

    const order = await orderService.findById(orderId, userId);
    if (order.status !== OrderStatus.PENDING) {
      throw new AppError("Order cannot be paid", 400);
    }

    const amountPaise = Math.round(Number(order.total) * 100);
    if (amountPaise < 100) {
      throw new AppError("Order amount is too low for online payment", 400);
    }

    const razorpay = getRazorpayClient();
    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: PaymentProvider.RAZORPAY,
        status: PaymentStatus.PENDING,
        amount: order.total,
        currency: "INR",
        providerOrderId: rzpOrder.id,
        metadata: toPaymentMetadata({ razorpayOrder: rzpOrder }),
      },
    });

    return {
      keyId: getRazorpayKeyId(),
      razorpayOrderId: rzpOrder.id,
      amount: amountPaise,
      currency: "INR",
      orderId: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.address
          ? `${order.address.firstName} ${order.address.lastName}`
          : undefined,
        email: order.email,
        contact: order.address?.phone,
      },
    };
  }

  async verifyRazorpayPayment(
    userId: string,
    input: {
      orderId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ) {
    if (!isRazorpayConfigured()) {
      throw new AppError("Online payments are not configured", 503);
    }

    const order = await orderService.findById(input.orderId, userId);
    if (order.status === OrderStatus.PAID) {
      return order;
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
      .digest("hex");

    if (expected !== input.razorpay_signature) {
      throw new AppError("Payment verification failed", 400);
    }

    const payment = await prisma.payment.findFirst({
      where: {
        orderId: order.id,
        provider: PaymentProvider.RAZORPAY,
        providerOrderId: input.razorpay_order_id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.CAPTURED,
          providerPaymentId: input.razorpay_payment_id,
          metadata: toPaymentMetadata({
            ...(typeof payment.metadata === "object" &&
            payment.metadata &&
            !Array.isArray(payment.metadata)
              ? payment.metadata
              : {}),
            verifiedAt: new Date().toISOString(),
          }),
        },
      });
    }

    const updated = await orderService.updateStatus(order.id, OrderStatus.PAID);
    await notifyOrderPlaced(order.id, "Paid online (Razorpay)");
    return updated;
  }

  async confirmCod(orderId: string, userId: string) {
    const order = await orderService.findById(orderId, userId);
    if (order.status !== OrderStatus.PENDING) {
      throw new AppError("Order already processed", 400);
    }

    const existing = await prisma.payment.findFirst({
      where: { orderId: order.id, provider: PaymentProvider.COD },
    });
    if (!existing) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: PaymentProvider.COD,
          status: PaymentStatus.PENDING,
          amount: order.total,
          currency: "INR",
          metadata: { note: "Collect on delivery" },
        },
      });
    }

    await notifyOrderPlaced(order.id, "Cash on delivery");
    return order;
  }

  async handleRazorpayWebhook(payload: {
    event: string;
    payload: {
      payment?: { entity: { id: string; order_id: string; status: string } };
      order?: { entity: { id: string; receipt: string } };
    };
  }) {
    if (payload.event === "payment.captured") {
      const paymentEntity = payload.payload.payment?.entity;
      if (!paymentEntity?.order_id) return;

      const payment = await prisma.payment.findFirst({
        where: {
          providerOrderId: paymentEntity.order_id,
          provider: PaymentProvider.RAZORPAY,
        },
        include: { order: true },
      });
      if (!payment || payment.order.status === OrderStatus.PAID) return;

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.CAPTURED,
          providerPaymentId: paymentEntity.id,
        },
      });
      await orderService.updateStatus(payment.orderId, OrderStatus.PAID);
      await notifyOrderPlaced(payment.orderId, "Paid online (Razorpay)");
    }
  }
}

export const paymentService = new PaymentService();
