"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";

export function CartUpsell() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts({ sort: "rating", limit: "4" })
      .then((r) => setProducts(r.items))
      .catch(() => setProducts([]));
  }, []);

  if (!products.length) return null;

  return (
    <section className="mt-12 border-t pt-12">
      <SectionHeading title="You Might Also Like" />
      <div className="mt-6">
        <ProductGrid products={products} columns={2} />
      </div>
    </section>
  );
}
