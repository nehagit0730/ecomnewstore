import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductDetails } from "@/components/product/product-details";
import { ProductBreadcrumbs } from "@/components/product/product-breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { ProductViewTracker } from "@/components/product/product-view-tracker";
import { SectionHeading } from "@/components/shared/section-heading";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { buildMetadata } from "@/lib/seo";
import { getSiteSeo } from "@/lib/site-seo";
import { ProductReviews } from "@/components/product/product-reviews";
import { productService } from "@/server/services/product.service";
import { reviewService } from "@/server/services/review.service";
import { storefrontService } from "@/server/services/storefront.service";
import { getSessionUser } from "@/lib/auth-utils";
import { AppError } from "@/server/errors/app-error";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props) {
  try {
    const { handle } = await params;
    const [product, seo] = await Promise.all([
      productService.getByHandle(handle),
      getSiteSeo(),
    ]);
    return buildMetadata(
      {
        title: product.title,
        description: product.description,
        path: `/products/${handle}`,
        image: product.featuredImage,
      },
      seo
    );
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;

  let product;
  let related;
  let globalSizeChart;
  let reviewData;
  try {
    const sessionUser = await getSessionUser();
    product = await productService.getByHandle(handle);
    [related, globalSizeChart, reviewData] = await Promise.all([
      productService.getRelated(handle),
      storefrontService.getSizeChart(),
      reviewService.listForProduct(product.id, sessionUser?.id),
    ]);
  } catch (e) {
    if (e instanceof AppError && e.statusCode === 404) notFound();
    throw e;
  }

  const sizeChartContent = product.sizeChart?.trim() || globalSizeChart.content;
  const sizeChartTitle = product.sizeChart?.trim()
    ? "Size guide"
    : globalSizeChart.title;

  return (
    <>
      <ProductViewTracker handle={handle} />
      <div className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <ProductBreadcrumbs
            category={product.category}
            title={product.title}
            className="pt-6 pb-6 md:pt-8 md:pb-8"
          />

          {/* Unified PDP: gallery + details left, purchase right */}
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:gap-y-8 lg:items-start">
            <div className="order-1 lg:col-span-7 lg:col-start-1 lg:row-start-1 space-y-5">
              <ProductGallery images={product.images} title={product.title} />
            </div>

            <aside className="order-2 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 lg:self-start">
              <div className="lg:border-l lg:border-border/60 lg:pl-8">
                <ProductPurchasePanel
                  product={product}
                  sizeChartTitle={sizeChartTitle}
                  sizeChartContent={sizeChartContent}
                />
              </div>
            </aside>

            <div className="order-3 lg:col-span-7 lg:col-start-1 lg:row-start-2">
              <p className="hidden lg:block text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground mb-3">
                Story &amp; specifications
              </p>
              <ProductDetails product={product} />
            </div>
          </div>
        </div>

        <section className="mt-14 md:mt-20 border-t border-border/60">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <ProductReviews
              productHandle={product.handle}
              productTitle={product.title}
              rating={product.rating}
              reviewCount={product.reviewCount}
              initialReviews={reviewData.reviews}
              initialUserReview={reviewData.userReview}
            />
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-14 md:mt-20 border-t border-border/60 bg-secondary/25">
            <div className="container mx-auto px-4 py-12 md:py-16">
              <ScrollReveal>
                <SectionHeading
                  eyebrow="Complete the look"
                  title="You may also like"
                  href={`/collections/${product.category}`}
                  linkLabel="Shop category"
                />
              </ScrollReveal>
              <ScrollReveal delay={0.08} className="mt-8 md:mt-10">
                <ProductGrid products={related} columns={4} />
              </ScrollReveal>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4">
          <RecentlyViewed excludeHandle={handle} />
        </div>
      </div>
    </>
  );
}
