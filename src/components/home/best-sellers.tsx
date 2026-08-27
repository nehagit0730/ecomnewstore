import { storefrontService } from "@/server/services/storefront.service";
import { ProductGrid } from "@/components/product/product-grid";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";

export async function BestSellers() {
  const products = await storefrontService.getBestSellers(8);
  if (!products.length) return null;

  return (
    <section className="container mx-auto px-4 py-16 md:py-24 bg-secondary/30">
      <ScrollReveal>
        <SectionHeading title="Best Sellers" subtitle="Customer favorites" />
      </ScrollReveal>
      <ScrollReveal delay={0.15} className="mt-10">
        <ProductGrid products={products} />
      </ScrollReveal>
    </section>
  );
}
