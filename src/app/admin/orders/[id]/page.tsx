import { notFound } from "next/navigation";
import Link from "next/link";
import { adminOrderService } from "@/server/services/admin-order.service";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { ShipmentStatusSelect } from "@/components/admin/shipment-status-select";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ id: string }> };

const PAYMENT_LABELS: Record<string, string> = {
  RAZORPAY: "Razorpay (UPI / Card / Netbanking)",
  COD: "Cash on delivery",
  STRIPE: "Stripe",
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  let order;
  try {
    order = await adminOrderService.getById(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="text-sm text-muted-foreground hover:underline">
        ← Orders
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">{order.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {order.status.toLowerCase()}
        </Badge>
      </div>

      <div className="mb-6 flex flex-wrap gap-6 items-start">
        <OrderStatusSelect orderId={order.id} current={order.status} />
        {order.shipment && (
          <ShipmentStatusSelect
            orderId={order.id}
            current={order.shipment.status}
            trackingNumber={order.shipment.trackingNumber}
          />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {order.address && (
          <div className="border bg-background p-5 rounded-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3">Ship to</h2>
            <p className="text-sm leading-relaxed">
              {order.address.firstName} {order.address.lastName}
              <br />
              {order.address.line1}
              {order.address.line2 && (
                <>
                  <br />
                  {order.address.line2}
                </>
              )}
              <br />
              {order.address.city}, {order.address.state} {order.address.postalCode}
              <br />
              India · {order.address.phone}
            </p>
          </div>
        )}

        <div className="border bg-background p-5 rounded-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest">Payment</h2>
          {order.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment recorded</p>
          ) : (
            order.payments.map((p) => (
              <div key={p.id} className="text-sm space-y-1">
                <p className="font-medium">{PAYMENT_LABELS[p.provider] ?? p.provider}</p>
                <p className="text-muted-foreground capitalize">
                  {p.status.toLowerCase()} · {formatPrice(Number(p.amount))}
                </p>
                {p.providerPaymentId && (
                  <p className="text-xs text-muted-foreground font-mono">{p.providerPaymentId}</p>
                )}
              </div>
            ))
          )}
          {order.coupon && (
            <p className="text-sm pt-2 border-t">
              Coupon: <span className="font-medium">{order.coupon.code}</span>
            </p>
          )}
        </div>
      </div>

      <div className="border bg-background p-6 rounded-sm space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest">Items</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 text-sm border-b pb-3 last:border-0">
            <div>
              <p className="font-medium">{item.productTitle}</p>
              <p className="text-muted-foreground">
                {item.variantSku} · {item.colorName} / {item.sizeLabel}
                {item.vendor && ` · ${item.vendor.shopName}`}
              </p>
            </div>
            <p className="shrink-0">
              {item.quantity} × {formatPrice(Number(item.unitPrice))}
            </p>
          </div>
        ))}
        <div className="pt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>-{formatPrice(Number(order.discountAmount))}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {Number(order.shippingAmount) === 0
                ? "Free"
                : formatPrice(Number(order.shippingAmount))}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
