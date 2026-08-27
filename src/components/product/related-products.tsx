import { getRelatedProducts } from "@/data/products";
import type { Product } from "@/types/product";
import { ProductGrid } from "./product-grid";
import { SectionHeading } from "@/components/shared/section-heading";

type RelatedProductsProps = {
  product: Product;
};

export function RelatedProducts({ product }: RelatedProductsProps) {
  const related = getRelatedProducts(product);

  if (!related.length) return null;

  return (
    <section className="mt-16 md:mt-24">
      <SectionHeading title="You May Also Like" />
      <div className="mt-8">
        <ProductGrid products={related} columns={4} />
      </div>
    </section>
  );
}
