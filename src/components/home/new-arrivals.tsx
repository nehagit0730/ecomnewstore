import { storefrontService } from "@/server/services/storefront.service";
import { ProductGrid } from "@/components/product/product-grid";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";

export async function NewArrivals() {
  const products = await storefrontService.getNewArrivals(8);
  if (!products.length) return null;

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <ScrollReveal>
        <SectionHeading
          title="New Arrivals"
          subtitle="Fresh styles just dropped"
          href="/collections/new-arrivals"
        />
      </ScrollReveal>
      <ScrollReveal delay={0.15} className="mt-10">
        <ProductGrid products={products} />
      </ScrollReveal>
    </section>
  );
}
