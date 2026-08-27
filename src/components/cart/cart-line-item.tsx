"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import type { CartLineItem as CartLineItemType } from "@/types/cart";
import { PriceDisplay } from "@/components/shared/price-display";
import { Button } from "@/components/ui/button";
import { normalizeProductImageUrl } from "@/lib/catalog-images";
import { useCartStore } from "@/stores/cart-store";

type CartLineItemProps = {
  item: CartLineItemType;
};

export function CartLineItem({ item }: CartLineItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const imageSrc = normalizeProductImageUrl(item.image, item.handle, 160, 192);

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/products/${item.handle}`}
        className="relative h-24 w-20 shrink-0 overflow-hidden bg-secondary"
      >
        <Image
          src={imageSrc}
          alt={item.title}
          fill
          className="object-cover"
          sizes="80px"
        />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase">{item.brand}</p>
            <Link
              href={`/products/${item.handle}`}
              className="text-sm font-medium hover:underline"
            >
              {item.title}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.color} / {item.size}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <PriceDisplay price={item.price * item.quantity} size="sm" />
        </div>
      </div>
    </div>
  );
}
