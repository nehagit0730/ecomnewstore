"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { PriceDisplay } from "@/components/shared/price-display";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { calculateDiscount, cn } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  priority = false,
  className,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const discount = calculateDiscount(product.price, product.compareAtPrice);
  const defaultColor = product.colors[0];
  const defaultSize = product.sizes.find(
    (s) => product.variants[0]?.sizes.find((vs) => vs.label === s)?.inStock
  ) ?? product.sizes[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultColor || !defaultSize) return;
    addItem({
      product,
      quantity: 1,
      size: defaultSize,
      color: defaultColor.slug,
      colorHex: defaultColor.hex,
    });
  };

  return (
    <motion.article
      className={cn("group relative", className)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          <Image
            src={product.featuredImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            priority={priority}
          />
          <Image
            src={product.hoverImage}
            alt={`${product.title} alternate view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isNew && <Badge variant="new">New</Badge>}
            {product.isSale && discount && (
              <Badge variant="sale">-{discount}%</Badge>
            )}
          </div>

          <div className="absolute right-3 top-3 z-10">
            <WishlistButton productId={product.id} />
          </div>

          <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
            <Button
              variant="default"
              className="w-full gap-2 bg-white text-foreground hover:bg-white/95 shadow-md"
              onClick={handleQuickAdd}
            >
              <Plus className="h-4 w-4" />
              Quick Add
            </Button>
          </div>
        </div>

        <div className="mt-3.5 space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
            {product.brand}
          </p>
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-foreground/80 transition-colors">
            {product.title}
          </h3>
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="sm"
          />
        </div>
      </Link>
    </motion.article>
  );
}
