"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, IndianRupee, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import type { CheckoutPaymentMethod } from "@/lib/payments";
import { siteConfig } from "@/config/site";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(5),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

type FormData = z.infer<typeof schema>;

type CheckoutFormProps = {
  razorpayEnabled: boolean;
};

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm({ razorpayEnabled }: CheckoutFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getSubtotal, getShipping, getTotal, clearCart, couponCode, couponDiscount } =
    useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>(
    razorpayEnabled ? "razorpay" : "cod"
  );
  const [error, setError] = useState("");

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();
  const discount = subtotal * couponDiscount;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const load = async () => {
      const [profileRes, addressesRes] = await Promise.all([
        fetch("/api/account/profile"),
        fetch("/api/account/addresses"),
      ]);
      const profile = profileRes.ok ? await profileRes.json() : null;
      const addresses = addressesRes.ok ? await addressesRes.json() : [];
      const defaultAddr =
        addresses.find((a: { isDefault: boolean }) => a.isDefault) ?? addresses[0];

      reset({
        email: session.user.email ?? "",
        firstName: profile?.firstName ?? session.user.name?.split(" ")[0] ?? "",
        lastName:
          profile?.lastName ?? session.user.name?.split(" ").slice(1).join(" ") ?? "",
        phone: defaultAddr?.phone ?? profile?.phone ?? "",
        address: defaultAddr?.line1 ?? "",
        city: defaultAddr?.city ?? "",
        state: defaultAddr?.state ?? "",
        postalCode: defaultAddr?.postalCode ?? "",
      });
    };

    load().catch(() => undefined);
  }, [session, status, reset]);

  const onSubmit = async (data: FormData) => {
    setError("");
    if (status !== "authenticated" || !session?.user) {
      router.push(`/account/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }

    try {
      const syncRes = await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            handle: item.handle,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
          couponCode,
        }),
      });
      if (!syncRes.ok) {
        const err = await syncRes.json().catch(() => ({}));
        throw new Error(err.message ?? err.error ?? "Could not sync cart");
      }

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          line1: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          phone: data.phone,
        }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err.message ?? err.error ?? "Could not create order");
      }
      const order = await orderRes.json();

      if (paymentMethod === "cod") {
        const codRes = await fetch("/api/payments/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        if (!codRes.ok) {
          const err = await codRes.json().catch(() => ({}));
          throw new Error(err.message ?? err.error ?? "Could not confirm COD order");
        }
        clearCart();
        router.push(`/account/orders?placed=${order.orderNumber}`);
        return;
      }

      const payRes = await fetch("/api/payments/razorpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!payRes.ok) {
        const err = await payRes.json().catch(() => ({}));
        throw new Error(err.message ?? err.error ?? "Could not start payment");
      }
      const checkout = await payRes.json();

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Payment gateway failed to load. Try again or choose Cash on delivery.");
      }

      const rzp = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: "Veloire",
        description: `Order ${checkout.orderNumber}`,
        order_id: checkout.razorpayOrderId,
        prefill: checkout.customer,
        theme: { color: "#171717" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) {
            setError("Payment received but verification failed. Contact support with your order number.");
            return;
          }
          clearCart();
          router.push(`/account/orders?placed=${checkout.orderNumber}`);
        },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled. Your order is saved — you can retry from your account.");
            router.push("/account/orders");
          },
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    }
  };

  if (!items.length) {
    return (
      <p className="text-muted-foreground py-12 text-center">
        Your bag is empty.{" "}
        <Link href="/collections/new-arrivals" className="underline">
          Continue shopping
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-12 lg:grid-cols-2">
      {status === "unauthenticated" && (
        <div className="lg:col-span-2 rounded-sm border bg-secondary/50 px-4 py-3 text-sm">
          <Link href="/account/login?redirect=%2Fcheckout" className="font-medium underline">
            Sign in
          </Link>{" "}
          to complete your purchase. Orders are saved to your account after payment.
        </div>
      )}

      {error && (
        <div className="lg:col-span-2 rounded-sm border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h2 className="font-serif text-xl mb-4">Contact</h2>
          <Label htmlFor="checkout-email">Email</Label>
          <Input id="checkout-email" type="email" className="mt-1.5" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <h2 className="font-serif text-xl mb-4">Shipping address</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" className="mt-1.5" {...register("firstName")} />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" className="mt-1.5" {...register("lastName")} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" className="mt-1.5" {...register("address")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" className="mt-1.5" {...register("city")} />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" className="mt-1.5" {...register("state")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">PIN code</Label>
                <Input id="postalCode" className="mt-1.5" {...register("postalCode")} />
                {errors.postalCode && (
                  <p className="text-xs text-destructive mt-1">{errors.postalCode.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Mobile (+91)</Label>
                <Input id="phone" className="mt-1.5" placeholder="9876543210" {...register("phone")} />
                {errors.phone && (
                  <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl mb-4">Payment</h2>
          <div className="space-y-3">
            {razorpayEnabled && (
              <PaymentOption
                selected={paymentMethod === "razorpay"}
                onSelect={() => setPaymentMethod("razorpay")}
                icon={CreditCard}
                title="Pay online"
                detail="UPI · Cards · Netbanking · Wallets via Razorpay"
              />
            )}
            <PaymentOption
              selected={paymentMethod === "cod"}
              onSelect={() => setPaymentMethod("cod")}
              icon={Truck}
              title="Cash on delivery"
              detail="Pay in cash when your order is delivered"
            />
            {!razorpayEnabled && (
              <p className="text-xs text-muted-foreground leading-relaxed rounded-sm border border-dashed border-border/80 bg-secondary/30 px-3 py-2.5">
                Pay online (UPI, cards, netbanking) is hidden because Razorpay keys are not
                set on this deployment. Add{" "}
                <code className="text-[10px]">RAZORPAY_KEY_ID</code>,{" "}
                <code className="text-[10px]">RAZORPAY_KEY_SECRET</code>, and{" "}
                <code className="text-[10px]">NEXT_PUBLIC_RAZORPAY_KEY_ID</code> in Vercel
                env, then redeploy.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 h-fit border p-6 space-y-4 rounded-sm bg-card">
        <h2 className="font-serif text-xl">Order summary</h2>
        <ul className="space-y-3 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm gap-4">
              <span className="line-clamp-1">
                {item.title} × {item.quantity}
              </span>
              <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          {siteConfig.pricesIncludeGst && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{siteConfig.gstLabel}</span>
              <span>—</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-2">
            <span className="inline-flex items-center gap-1">
              <IndianRupee className="h-4 w-4" />
              Total
            </span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <Button type="submit" variant="luxury" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? "Processing..."
            : paymentMethod === "cod"
              ? "Place COD order"
              : "Pay securely"}
        </Button>
        <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
          {paymentMethod === "razorpay"
            ? "Secured by Razorpay. Supports UPI, Indian cards & netbanking."
            : "No online payment now. Pay the delivery partner in cash on arrival."}
        </p>
      </div>
    </form>
  );
}

function PaymentOption({
  selected,
  onSelect,
  icon: Icon,
  title,
  detail,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 rounded-sm border p-4 text-left transition-colors",
        selected ? "border-foreground bg-secondary/40" : "border-border hover:border-foreground/30"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          selected ? "bg-foreground text-background" : "bg-secondary"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground mt-0.5">{detail}</span>
      </span>
    </button>
  );
}
