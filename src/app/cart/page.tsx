"use client";

import Link from "next/link";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartUpsell } from "@/components/cart/cart-upsell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, getSubtotal, getShipping, getTotal, couponDiscount } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();
  const discount = subtotal * couponDiscount;

  if (!items.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-3xl">Your Bag</h1>
        <p className="mt-4 text-muted-foreground">Your bag is empty</p>
        <Button variant="luxury" className="mt-8" asChild>
          <Link href="/collections/new-arrivals">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="font-serif text-3xl mb-8">Your Bag</h1>
      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          {items.map((item) => (
            <div key={item.id}>
              <CartLineItem item={item} />
              <Separator />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="border p-6 space-y-3 sticky top-24">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button variant="luxury" className="w-full" asChild>
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
          <CartUpsell />
        </div>
      </div>
    </div>
  );
}
