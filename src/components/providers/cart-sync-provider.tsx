"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cart-store";

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const synced = useRef(false);
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);

  useEffect(() => {
    if (status !== "authenticated" || synced.current || !items.length) return;
    synced.current = true;
    fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          handle: i.handle,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
        couponCode,
      }),
    }).catch(() => {
      synced.current = false;
    });
  }, [status, items, couponCode]);

  return <>{children}</>;
}
