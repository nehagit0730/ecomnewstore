"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getFrequentlyBoughtTogether } from "@/data/products";
import type { Product } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";

type FrequentlyBoughtProps = {
  product: Product;
};

export function FrequentlyBought({ product }: FrequentlyBoughtProps) {
  const bundle = getFrequentlyBoughtTogether(product);
  const addItem = useCartStore((s) => s.addItem);
  const total = bundle.reduce((sum, p) => sum + p.price, 0);

  const addAll = () => {
    bundle.forEach((p) => {
      const color = p.colors[0];
      const size = p.sizes[0];
      if (color && size) {
        addItem({
          product: p,
          quantity: 1,
          size,
          color: color.slug,
          colorHex: color.hex,
        });
      }
    });
  };

  return (
    <section className="mt-12 border p-6 md:p-8">
      <SectionHeading title="Frequently Bought Together" />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {bundle.map((p, i) => (
          <div key={p.id} className="flex items-center gap-4">
            {i > 0 && <Plus className="h-4 w-4 text-muted-foreground shrink-0" />}
            <Link href={`/products/${p.handle}`} className="group text-center">
              <div className="relative h-24 w-20 overflow-hidden bg-secondary">
                <Image
                  src={p.featuredImage}
                  alt={p.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <p className="mt-2 text-xs font-medium max-w-[80px] truncate group-hover:underline">
                {p.title}
              </p>
              <p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p>
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <p className="font-semibold">Bundle: {formatPrice(total)}</p>
        <Button variant="outline" onClick={addAll}>
          Add All to Bag
        </Button>
      </div>
    </section>
  );
}
