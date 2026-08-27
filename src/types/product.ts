export type ProductCategory = "men" | "women" | "kids" | "accessories";

export type ProductColor = {
  name: string;
  hex: string;
  slug: string;
};

export type ProductSize = {
  label: string;
  value: string;
  inStock: boolean;
};

export type ProductVariant = {
  id: string;
  color: ProductColor;
  sizes: ProductSize[];
  images: string[];
  sku: string;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  brand: string;
  description: string;
  materials: string;
  careInstructions: string;
  shippingInfo: string;
  returnPolicy: string;
  sizeChart: string;
  category: ProductCategory;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  featuredImage: string;
  hoverImage: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  inStock: boolean;
  stockCount: number;
  isNew?: boolean;
  isSale?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  createdAt: string;
};

export type ProductSortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling"
  | "rating";

export type CollectionFilters = {
  categories: ProductCategory[];
  brands: string[];
  colors: string[];
  sizes: string[];
  priceMin: number;
  priceMax: number;
};
