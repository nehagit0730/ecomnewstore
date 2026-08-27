import { collectionImage } from "@/lib/catalog-images";
import type { Collection } from "@/types/collection";

export const COLLECTIONS: Collection[] = [
  {
    id: "col-men",
    handle: "men",
    title: "Men",
    description: "Premium essentials crafted for modern men.",
    image: collectionImage("men", 800, 800),
    category: "men",
    productCount: 24,
  },
  {
    id: "col-women",
    handle: "women",
    title: "Women",
    description: "Elegant silhouettes and everyday luxury.",
    image: collectionImage("women", 800, 800),
    category: "women",
    productCount: 28,
  },
  {
    id: "col-kids",
    handle: "kids",
    title: "Kids",
    description: "Comfort-first styles for active little ones.",
    image: collectionImage("kids", 800, 800),
    category: "kids",
    productCount: 16,
  },
  {
    id: "col-accessories",
    handle: "accessories",
    title: "Accessories",
    description: "Finishing touches that elevate every look.",
    image: collectionImage("accessories", 800, 800),
    category: "accessories",
    productCount: 18,
  },
  {
    id: "col-new",
    handle: "new-arrivals",
    title: "New Arrivals",
    description: "Fresh drops from our latest collection.",
    image: collectionImage("new-arrivals", 800, 800),
    productCount: 12,
  },
  {
    id: "col-best",
    handle: "best-sellers",
    title: "Best Sellers",
    description: "Customer favorites you will love.",
    image: collectionImage("best-sellers", 800, 800),
    productCount: 10,
  },
  {
    id: "col-trending",
    handle: "trending",
    title: "Trending",
    description: "What everyone is wearing right now.",
    image: collectionImage("trending", 800, 800),
    productCount: 8,
  },
  {
    id: "col-sale",
    handle: "sale",
    title: "Sale",
    description: "Limited-time offers on premium styles.",
    image: collectionImage("sale", 800, 800),
    productCount: 14,
  },
];

export function getCollectionByHandle(handle: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.handle === handle);
}
