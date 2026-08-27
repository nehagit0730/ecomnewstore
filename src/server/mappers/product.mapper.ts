import type { Product, ProductCategory, ProductVariant } from "@/types/product";

type DbProduct = {
  id: string;
  handle: string;
  title: string;
  brand: string;
  description: string;
  materials: string | null;
  careInstructions: string | null;
  shippingInfo: string | null;
  returnPolicy: string | null;
  sizeChart: string | null;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  createdAt: Date;
  tags?: string[];
  category?: { slug: string } | null;
  images: { url: string }[];
  variants: {
    id: string;
    sku: string;
    barcode?: string | null;
    colorName: string;
    colorHex: string | null;
    colorSlug: string;
    sizeLabel: string;
    sizeValue: string;
    price: { toString(): string };
    compareAtPrice: { toString(): string } | null;
    inventory: { quantity: number; reservedQuantity: number } | null;
  }[];
};

function categoryFromSlug(slug: string | undefined): ProductCategory {
  const allowed: ProductCategory[] = ["men", "women", "kids", "accessories"];
  if (slug && allowed.includes(slug as ProductCategory)) return slug as ProductCategory;
  return "men";
}

function buildVariants(rows: DbProduct["variants"]): ProductVariant[] {
  const byColor = new Map<string, ProductVariant>();
  for (const row of rows) {
    const stock = Math.max(
      0,
      (row.inventory?.quantity ?? 0) - (row.inventory?.reservedQuantity ?? 0)
    );
    const existing = byColor.get(row.colorSlug);
    const size = { label: row.sizeLabel, value: row.sizeValue, inStock: stock > 0 };
    if (existing) {
      existing.sizes.push(size);
    } else {
      byColor.set(row.colorSlug, {
        id: row.colorSlug,
        sku: row.sku,
        color: {
          name: row.colorName,
          hex: row.colorHex ?? "#000000",
          slug: row.colorSlug,
        },
        sizes: [size],
        images: [],
      });
    }
  }
  return [...byColor.values()];
}

export function mapDbProductToProduct(product: DbProduct): Product {
  const prices = product.variants.map((v) => Number(v.price));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const saleVariant = product.variants.find((v) => v.compareAtPrice);
  const variants = buildVariants(product.variants);
  const colors = variants.map((v) => v.color);
  const sizes = [...new Set(product.variants.map((v) => v.sizeValue))];
  const totalStock = product.variants.reduce(
    (sum, v) =>
      sum +
      Math.max(0, (v.inventory?.quantity ?? 0) - (v.inventory?.reservedQuantity ?? 0)),
    0
  );

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    brand: product.brand,
    description: product.description,
    materials: product.materials ?? "",
    careInstructions: product.careInstructions ?? "",
    shippingInfo: product.shippingInfo ?? "",
    returnPolicy: product.returnPolicy ?? "",
    sizeChart: product.sizeChart ?? "",
    category: categoryFromSlug(product.category?.slug),
    tags: product.tags ?? [],
    price: minPrice,
    compareAtPrice: saleVariant ? Number(saleVariant.compareAtPrice) : undefined,
    rating: product.rating,
    reviewCount: product.reviewCount,
    featuredImage: product.images[0]?.url ?? "",
    hoverImage: product.images[1]?.url ?? product.images[0]?.url ?? "",
    images: product.images.map((i) => i.url),
    colors,
    sizes,
    variants,
    inStock: totalStock > 0,
    stockCount: totalStock,
    isNew: product.isNew ?? false,
    isSale: !!saleVariant,
    isBestSeller: product.isBestSeller ?? false,
    isTrending: product.isTrending ?? false,
    createdAt: product.createdAt.toISOString(),
  };
}

export function mapDbProductToCard(product: DbProduct): Product {
  return mapDbProductToProduct(product);
}
