import type { Product } from "@/types/product";
import type { Collection } from "@/types/collection";
import type { SiteSeoConfig } from "@/types/store-theme";
import { SITE_NAME, SITE_URL } from "./constants";

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.handle}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}

export function collectionJsonLd(collection: Collection) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.description,
    url: `${SITE_URL}/collections/${collection.handle}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}

export function organizationJsonLd(seo?: Pick<SiteSeoConfig, "siteName" | "siteUrl" | "logoUrl">) {
  const name = seo?.siteName ?? SITE_NAME;
  const url = seo?.siteUrl ?? SITE_URL;
  const logo = seo?.logoUrl ?? `${url.replace(/\/$/, "")}/logo.png`;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    sameAs: [
      "https://instagram.com/veloire",
      "https://facebook.com/veloire",
    ],
  };
}
