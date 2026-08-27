import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { productService } from "@/server/services/product.service";
import { storefrontService } from "@/server/services/storefront.service";
import { CollectionListing } from "@/components/collection/collection-listing";
import { buildMetadata } from "@/lib/seo";
import { getSiteSeo } from "@/lib/site-seo";
import { collectionJsonLd } from "@/lib/structured-data";

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const [collection, seo] = await Promise.all([
    storefrontService.getCollection(handle),
    getSiteSeo(),
  ]);
  if (!collection) return {};
  return buildMetadata(
    {
      title: collection.title,
      description: collection.description ?? undefined,
      path: `/collections/${handle}`,
      image: collection.image ?? undefined,
    },
    seo
  );
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  const collection = await storefrontService.getCollection(handle);
  if (!collection) notFound();

  const initialList = await productService.list({
    collectionHandle: handle,
    limit: 12,
    page: 1,
    sort: "featured",
  });
  const initialPage = {
    products: initialList.items,
    total: initialList.total,
    hasMore: initialList.total > initialList.items.length,
  };

  const jsonLd = collectionJsonLd({
    id: collection.id,
    title: collection.title,
    description: collection.description ?? "",
    handle: collection.handle,
    image: collection.image ?? "",
    productCount: collection.products.length,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="border-b border-border/60">
        {collection.image ? (
          <div className="relative h-52 md:h-72 overflow-hidden bg-foreground">
            <Image
              src={collection.image}
              alt={collection.title}
              fill
              className="object-cover opacity-95"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
            <div className="absolute inset-0 flex items-end">
              <div className="container mx-auto px-4 pb-10 md:pb-12 text-white">
                <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/60 mb-3">
                  Collection
                </p>
                <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-balance">
                  {collection.title}
                </h1>
                {collection.description && (
                  <p className="mt-3 text-sm md:text-base text-white/75 max-w-xl leading-relaxed">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-12 md:py-16 bg-secondary/25">
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground mb-3">
              Collection
            </p>
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-balance">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-10 md:py-14">
        <Suspense fallback={<div className="animate-pulse h-96 bg-secondary" />}>
          <CollectionListing collectionHandle={handle} initialPage={initialPage} />
        </Suspense>
      </div>
    </>
  );
}
