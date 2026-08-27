"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/product-grid";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";

export function WishlistContent() {
  const hydrated = useHydrated();
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated || !productIds.length) {
      setProducts([]);
      return;
    }
    setLoading(true);
    fetchProducts({ ids: productIds.join(",") })
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [hydrated, productIds]);

  if (!hydrated || loading) {
    return <div className="animate-pulse h-48 bg-secondary" />;
  }

  if (!products.length) {
    return (
      <div className="py-16 text-center">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Your wishlist is empty</p>
        <Button variant="luxury" className="mt-6" asChild>
          <Link href="/collections/new-arrivals">Discover Products</Link>
        </Button>
      </div>
    );
  }

  return <ProductGrid products={products} />;
}
