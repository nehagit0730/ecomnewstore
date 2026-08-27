"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartLineItem } from "./cart-line-item";
import { CartUpsell } from "./cart-upsell";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    getSubtotal,
    getShipping,
    getTotal,
    couponCode,
    setCoupon,
    removeCoupon,
    couponDiscount,
  } = useCartStore();
  const { status } = useSession();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();
  const discount = subtotal * couponDiscount;

  const handleCoupon = async () => {
    setCouponError("");
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setCouponError(err.message ?? "Invalid coupon code");
        return;
      }
      const data = await res.json();
      setCoupon(data.code, data.discountRate);
      if (status === "authenticated") {
        await fetch("/api/cart/coupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: data.code }),
        });
      }
      setCouponInput("");
    } catch {
      setCouponError("Could not apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    removeCoupon();
    if (status === "authenticated") {
      await fetch("/api/cart/coupon", { method: "DELETE" }).catch(() => undefined);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="font-serif text-lg tracking-wide">
            Your Bag ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your bag is empty</p>
            <Button variant="luxury" onClick={closeCart} asChild>
              <Link href="/collections/new-arrivals">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <CartLineItem item={item} />
                    <Separator />
                  </motion.div>
                ))}
              </AnimatePresence>
              <CartUpsell />
            </ScrollArea>

            <div className="border-t px-6 py-4 space-y-4">
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-muted-foreground text-center">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                </p>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  disabled={!!couponCode}
                />
                {couponCode ? (
                  <Button variant="outline" onClick={handleRemoveCoupon}>
                    Remove
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleCoupon} disabled={couponLoading}>
                    {couponLoading ? "..." : "Apply"}
                  </Button>
                )}
              </div>
              {couponError && (
                <p className="text-xs text-destructive">{couponError}</p>
              )}
              {couponCode && (
                <p className="text-xs text-green-700">
                  Code {couponCode} applied
                </p>
              )}

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button variant="luxury" className="w-full" asChild>
                <Link href="/checkout" onClick={closeCart}>
                  Checkout
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/cart" onClick={closeCart}>
                  View Bag
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
