import { productImage } from "@/lib/catalog-images";
import type { Product, ProductColor } from "@/types/product";

function imgSet(handle: string) {
  return {
    featuredImage: productImage(handle),
    hoverImage: productImage(handle, 2),
    images: [
      productImage(handle, 1, 1200, 1200),
      productImage(handle, 2, 1200, 1200),
      productImage(`${handle}-gallery`, 1, 1200, 1200),
    ],
  };
}

const COLORS: Record<string, ProductColor> = {
  black: { name: "Black", hex: "#1a1a1a", slug: "black" },
  white: { name: "White", hex: "#f5f5f5", slug: "white" },
  navy: { name: "Navy", hex: "#1e3a5f", slug: "navy" },
  grey: { name: "Grey", hex: "#6b7280", slug: "grey" },
  beige: { name: "Beige", hex: "#d4c4a8", slug: "beige" },
  olive: { name: "Olive", hex: "#556b2f", slug: "olive" },
  burgundy: { name: "Burgundy", hex: "#722f37", slug: "burgundy" },
  blush: { name: "Blush", hex: "#e8b4b8", slug: "blush" },
};

const SIZES = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  kids: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
  accessories: ["One Size"],
};

type ProductInput = Omit<Product, "variants" | "colors" | "sizes" | "sizeChart"> & {
  colorSlugs: string[];
  sizeSet: keyof typeof SIZES;
  sizeChart?: string;
};

function buildProduct(partial: ProductInput): Product {
  const sizes = SIZES[partial.sizeSet];
  const colors = partial.colorSlugs.map((s) => COLORS[s]);
  return {
    ...partial,
    sizeChart: partial.sizeChart ?? "",
    colors,
    sizes,
    variants: colors.map((color, i) => ({
      id: `${partial.id}-${color.slug}`,
      color,
      sizes: sizes.map((label) => ({
        label,
        value: label,
        inStock: partial.inStock && partial.stockCount > i,
      })),
      images: [partial.featuredImage, partial.hoverImage, ...partial.images.slice(0, 2)],
      sku: `${partial.handle.toUpperCase()}-${color.slug.toUpperCase()}`,
    })),
  };
}

export const PRODUCTS: Product[] = [
  buildProduct({
    id: "p1",
    handle: "premium-cotton-crew-tee",
    title: "Premium Cotton Crew Tee",
    brand: "Veloire",
    description:
      "Ultra-soft 100% combed cotton tee with a refined fit. Breathable, durable, and designed for everyday luxury.",
    materials: "100% Combed Cotton, 180 GSM",
    careInstructions: "Machine wash cold. Tumble dry low. Do not bleach.",
    shippingInfo: "Ships within 2-3 business days. Free shipping above ₹1,999.",
    returnPolicy: "30-day easy returns on unworn items with tags attached.",
    category: "men",
    tags: ["tees", "basics", "cotton"],
    price: 899,
    compareAtPrice: 1299,
    rating: 4.8,
    reviewCount: 342,
    ...imgSet("premium-cotton-crew-tee"),
    colorSlugs: ["black", "white", "navy", "grey"],
    sizeSet: "apparel",
    inStock: true,
    stockCount: 48,
    isNew: true,
    isSale: true,
    isBestSeller: true,
    isTrending: true,
    createdAt: "2025-05-01",
  }),
  buildProduct({
    id: "p2",
    handle: "linen-relaxed-shirt",
    title: "Linen Relaxed Shirt",
    brand: "Veloire",
    description:
      "Breathable European linen shirt with a relaxed silhouette. Perfect for warm weather and effortless style.",
    materials: "100% European Linen",
    careInstructions: "Hand wash recommended. Iron on low heat.",
    shippingInfo: "Ships within 2-3 business days.",
    returnPolicy: "30-day easy returns.",
    category: "men",
    tags: ["shirts", "linen", "summer"],
    price: 2499,
    compareAtPrice: 3299,
    rating: 4.9,
    reviewCount: 128,
    ...imgSet("linen-relaxed-shirt"),
    colorSlugs: ["white", "beige", "olive"],
    sizeSet: "apparel",
    inStock: true,
    stockCount: 22,
    isNew: true,
    isSale: true,
    isTrending: true,
    createdAt: "2025-04-20",
  }),
  buildProduct({
    id: "p3",
    handle: "performance-flex-joggers",
    title: "Performance Flex Joggers",
    brand: "Veloire Active",
    description:
      "Four-way stretch joggers with moisture-wicking technology. Engineered for movement and all-day comfort.",
    materials: "88% Polyester, 12% Elastane",
    careInstructions: "Machine wash cold. Do not iron.",
    shippingInfo: "Ships within 1-2 business days.",
    returnPolicy: "30-day easy returns.",
    category: "men",
    tags: ["bottoms", "activewear", "joggers"],
    price: 1899,
    rating: 4.7,
    reviewCount: 256,
    ...imgSet("performance-flex-joggers"),
    colorSlugs: ["black", "navy", "grey"],
    sizeSet: "apparel",
    inStock: true,
    stockCount: 35,
    isBestSeller: true,
    isTrending: true,
    createdAt: "2025-03-15",
  }),
  buildProduct({
    id: "p4",
    handle: "seamless-comfort-bralette",
    title: "Seamless Comfort Bralette",
    brand: "Veloire",
    description:
      "Wire-free seamless bralette with buttery-soft fabric. All-day support without compromise.",
    materials: "92% Nylon, 8% Spandex",
    careInstructions: "Hand wash cold. Lay flat to dry.",
    shippingInfo: "Discreet packaging. Ships in 2-3 days.",
    returnPolicy: "30-day returns on unworn items.",
    category: "women",
    tags: ["innerwear", "bras", "comfort"],
    price: 1299,
    compareAtPrice: 1699,
    rating: 4.9,
    reviewCount: 489,
    ...imgSet("seamless-comfort-bralette"),
    colorSlugs: ["black", "blush", "white", "navy"],
    sizeSet: "apparel",
    inStock: true,
    stockCount: 4,
    isNew: true,
    isSale: true,
    isBestSeller: true,
    createdAt: "2025-05-10",
  }),
  buildProduct({
    id: "p5",
    handle: "high-waist-leggings",
    title: "High-Waist Sculpt Leggings",
    brand: "Veloire Active",
    description:
      "Second-skin leggings with high-rise waistband and squat-proof fabric. Your go-to for studio and street.",
    materials: "75% Nylon, 25% Spandex",
    careInstructions: "Machine wash cold inside out.",
    shippingInfo: "Ships within 2-3 business days.",
    returnPolicy: "30-day easy returns.",
    category: "women",
    tags: ["activewear", "leggings"],
    price: 1599,
    rating: 4.8,
    reviewCount: 312,
    ...imgSet("high-waist-leggings"),
    colorSlugs: ["black", "navy", "burgundy"],
    sizeSet: "apparel",
    inStock: true,
    stockCount: 28,
    isBestSeller: true,
    isTrending: true,
    createdAt: "2025-04-01",
  }),
  buildProduct({
    id: "p6",
    handle: "oversized-lounge-hoodie",
    title: "Oversized Lounge Hoodie",
    brand: "Veloire",
    description:
      "Plush French terry hoodie with an oversized fit. The ultimate off-duty essential.",
    materials: "80% Cotton, 20% Polyester French Terry",
    careInstructions: "Machine wash cold. Tumble dry low.",
    shippingInfo: "Ships within 2-3 business days.",
    returnPolicy: "30-day easy returns.",
    category: "women",
    tags: ["lounge", "hoodies"],
    price: 2199,
    compareAtPrice: 2799,
    rating: 4.6,
    reviewCount: 167,
    ...imgSet("oversized-lounge-hoodie"),
    colorSlugs: ["grey", "beige", "black"],
    sizeSet: "apparel",
    inStock: true,
    stockCount: 18,
    isNew: true,
    isSale: true,
    createdAt: "2025-05-05",
  }),
  buildProduct({
    id: "p7",
    handle: "kids-cotton-play-tee",
    title: "Kids Cotton Play Tee",
    brand: "Veloire Kids",
    description:
      "Soft, durable cotton tee made for endless play. Tagless label for extra comfort.",
    materials: "100% Organic Cotton",
    careInstructions: "Machine wash warm. Tumble dry.",
    shippingInfo: "Ships within 2-3 business days.",
    returnPolicy: "30-day easy returns.",
    category: "kids",
    tags: ["tees", "boys", "girls"],
    price: 599,
    rating: 4.7,
    reviewCount: 89,
    ...imgSet("kids-cotton-play-tee"),
    colorSlugs: ["white", "navy", "olive"],
    sizeSet: "kids",
    inStock: true,
    stockCount: 40,
    isNew: true,
    createdAt: "2025-05-08",
  }),
  buildProduct({
    id: "p8",
    handle: "kids-flex-shorts",
    title: "Kids Flex Active Shorts",
    brand: "Veloire Kids",
    description:
      "Lightweight stretch shorts with elastic waistband. Built for school, sports, and adventure.",
    materials: "90% Polyester, 10% Elastane",
    careInstructions: "Machine wash cold.",
    shippingInfo: "Ships within 2-3 business days.",
    returnPolicy: "30-day easy returns.",
    category: "kids",
    tags: ["bottoms", "active"],
    price: 799,
    compareAtPrice: 999,
    rating: 4.5,
    reviewCount: 54,
    ...imgSet("kids-flex-shorts"),
    colorSlugs: ["black", "navy", "grey"],
    sizeSet: "kids",
    inStock: true,
    stockCount: 25,
    isSale: true,
    createdAt: "2025-04-10",
  }),
  buildProduct({
    id: "p9",
    handle: "premium-leather-cap",
    title: "Premium Leather Cap",
    brand: "Veloire",
    description:
      "Hand-finished leather cap with adjustable strap. A timeless accessory for any season.",
    materials: "Genuine Leather, Cotton Lining",
    careInstructions: "Spot clean only. Store away from moisture.",
    shippingInfo: "Ships within 3-5 business days.",
    returnPolicy: "30-day easy returns.",
    category: "accessories",
    tags: ["caps", "hats"],
    price: 1499,
    rating: 4.6,
    reviewCount: 76,
    ...imgSet("premium-leather-cap"),
    colorSlugs: ["black", "beige"],
    sizeSet: "accessories",
    inStock: true,
    stockCount: 15,
    isTrending: true,
    createdAt: "2025-03-20",
  }),
  buildProduct({
    id: "p10",
    handle: "everyday-canvas-tote",
    title: "Everyday Canvas Tote",
    brand: "Veloire",
    description:
      "Heavy-duty canvas tote with interior pocket. Spacious, sustainable, and effortlessly chic.",
    materials: "100% Organic Canvas, Leather Handles",
    careInstructions: "Spot clean. Air dry.",
    shippingInfo: "Ships within 2-3 business days.",
    returnPolicy: "30-day easy returns.",
    category: "accessories",
    tags: ["bags"],
    price: 1799,
    compareAtPrice: 2299,
    rating: 4.8,
    reviewCount: 143,
    ...imgSet("everyday-canvas-tote"),
    colorSlugs: ["beige", "black"],
    sizeSet: "accessories",
    inStock: true,
    stockCount: 20,
    isNew: true,
    isSale: true,
    isBestSeller: true,
    createdAt: "2025-05-02",
  }),
  buildProduct({
    id: "p11",
    handle: "micro-modal-trunk",
    title: "Micro Modal Trunk",
    brand: "Veloire",
    description:
      "Buttery-soft micro modal trunk with no-roll waistband. The upgrade your drawer deserves.",
    materials: "95% Micro Modal, 5% Spandex",
    careInstructions: "Machine wash cold. Do not bleach.",
    shippingInfo: "Discreet packaging.",
    returnPolicy: "30-day returns on unworn items.",
    category: "men",
    tags: ["innerwear"],
    price: 699,
    compareAtPrice: 899,
    rating: 4.9,
    reviewCount: 521,
    ...imgSet("micro-modal-trunk"),
    colorSlugs: ["black", "navy", "grey", "white"],
    sizeSet: "apparel",
    inStock: true,
    stockCount: 60,
    isBestSeller: true,
    createdAt: "2025-02-01",
  }),
  buildProduct({
    id: "p12",
    handle: "ribbed-tank-dress",
    title: "Ribbed Tank Midi Dress",
    brand: "Veloire",
    description:
      "Figure-skimming ribbed dress with a flattering midi length. Dress up or down with ease.",
    materials: "95% Cotton, 5% Spandex Rib",
    careInstructions: "Machine wash cold. Lay flat to dry.",
    shippingInfo: "Ships within 2-3 business days.",
    returnPolicy: "30-day easy returns.",
    category: "women",
    tags: ["dresses"],
    price: 1999,
    rating: 4.7,
    reviewCount: 198,
    ...imgSet("ribbed-tank-dress"),
    colorSlugs: ["black", "burgundy", "beige"],
    sizeSet: "apparel",
    inStock: true,
    stockCount: 14,
    isNew: true,
    isTrending: true,
    createdAt: "2025-05-12",
  }),
];

export function getProductByHandle(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)) ||
      p.category.includes(q)
  );
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, limit);
}

export function getFrequentlyBoughtTogether(product: Product): Product[] {
  const others = PRODUCTS.filter((p) => p.id !== product.id);
  return [product, ...others.slice(0, 2)];
}
