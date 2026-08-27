"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { VariantSelector } from "./variant-selector";
import { ProductPurchaseNotes } from "./product-purchase-notes";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { calculateDiscount, cn } from "@/lib/utils";

type ProductPurchasePanelProps = {
  product: Product;
  sizeChartTitle: string;
  sizeChartContent: string;
};

export function ProductPurchasePanel({
  product,
  sizeChartTitle,
  sizeChartContent,
}: ProductPurchasePanelProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.slug ?? "");
  const [selectedSize, setSelectedSize] = useState("");
  const [error, setError] = useState("");

  const variant = product.variants.find((v) => v.color.slug === selectedColor);
  const sizes = variant?.sizes ?? [];
  const sku = variant?.sku ?? product.handle.toUpperCase();
  const colorObj = product.colors.find((c) => c.slug === selectedColor);
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const handleAddToCart = (redirect?: boolean) => {
    if (!selectedSize && sizes.length > 0) {
      setError("Please select a size");
      return;
    }
    setError("");
    addItem({
      product,
      quantity: 1,
      size: selectedSize || product.sizes[0] || "One Size",
      color: selectedColor,
      colorHex: colorObj?.hex ?? "#000",
    });
    if (redirect) router.push("/checkout");
  };

  const stockStatus = !product.inStock
    ? { label: "Out of stock", className: "text-destructive", dot: "bg-destructive" }
    : product.stockCount <= LOW_STOCK_THRESHOLD
      ? {
          label: `Only ${product.stockCount} left`,
          className: "text-amber-700",
          dot: "bg-amber-500",
        }
      : { label: "In stock — ships soon", className: "text-emerald-700", dot: "bg-emerald-500" };

  return (
    <div className="space-y-6 md:space-y-7">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {product.isNew && <Badge variant="new">New</Badge>}
          {product.isSale && discount != null && <Badge variant="sale">-{discount}%</Badge>}
          {product.isBestSeller && (
            <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
              Best seller
            </Badge>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/collections/${product.category}`}
              className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
            >
              {product.brand}
            </Link>
            <h1 className="font-serif text-3xl md:text-[2.35rem] tracking-tight leading-[1.08] mt-2 text-balance">
              {product.title}
            </h1>
          </div>
          <WishlistButton productId={product.id} size="md" className="relative shrink-0 mt-1" />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} showCount size="md" />
          <Link
            href="#reviews"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Reviews ({product.reviewCount})
          </Link>
          <Link
            href="#product-details"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Details
          </Link>
          <span className="hidden sm:inline h-3 w-px bg-border" />
          <div className={cn("flex items-center gap-2 text-sm font-medium", stockStatus.className)}>
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", stockStatus.dot)} />
            {stockStatus.label}
          </div>
        </div>
      </div>

      <div className="rounded-sm bg-secondary/40 px-4 py-4 md:px-5 md:py-5 ring-1 ring-border/50">
        <PriceDisplay
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          size="lg"
          showBadge
          className="[&>span:first-child]:text-2xl md:[&>span:first-child]:text-[1.75rem] [&>span:first-child]:font-serif [&>span:first-child]:font-normal"
        />
        {product.compareAtPrice && product.compareAtPrice > product.price && discount != null && (
          <p className="text-xs text-muted-foreground mt-2">
            You save {discount}% vs. regular price
          </p>
        )}
      </div>

      <VariantSelector
        colors={product.colors}
        sizes={sizes}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        sizeChartTitle={sizeChartTitle}
        sizeChartContent={sizeChartContent}
        onColorChange={(slug) => {
          setSelectedColor(slug);
          setSelectedSize("");
        }}
        onSizeChange={setSelectedSize}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="luxury"
          size="lg"
          className="flex-1 h-12"
          disabled={!product.inStock}
          onClick={() => handleAddToCart()}
        >
          Add to bag
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-12"
          disabled={!product.inStock}
          onClick={() => handleAddToCart(true)}
        >
          Buy now
        </Button>
      </div>

      <ProductPurchaseNotes />

      <p className="text-[11px] text-muted-foreground tracking-wide pb-1">
        SKU <span className="text-foreground/80">{sku}</span>
      </p>
    </div>
  );
}
