/** Catalog data for prisma/seed.ts — 36 products, 10 collections, 5 vendors */

import { collectionImage, productImage } from "../src/lib/catalog-images";

export const VENDORS = [
  {
    slug: "demo-boutique",
    shopName: "Demo Boutique",
    email: "vendor@veloire.com",
    password: "Vendor@123",
    firstName: "Demo",
    lastName: "Vendor",
    description: "Curated menswear and womenswear with a modern classic feel.",
    status: "ACTIVE" as const,
  },
  {
    slug: "urban-threads",
    shopName: "Urban Threads Co.",
    email: "urban@veloire.com",
    password: "Vendor@123",
    firstName: "Rahul",
    lastName: "Mehta",
    description: "Street-inspired essentials and relaxed fits for everyday city life.",
    status: "ACTIVE" as const,
  },
  {
    slug: "sole-studio",
    shopName: "Sole Studio",
    email: "sole@veloire.com",
    password: "Vendor@123",
    firstName: "Ananya",
    lastName: "Kapoor",
    description: "Feminine silhouettes, dresses, and occasion-ready pieces.",
    status: "ACTIVE" as const,
  },
  {
    slug: "little-luxuries",
    shopName: "Little Luxuries",
    email: "kids@veloire.com",
    password: "Vendor@123",
    firstName: "Priya",
    lastName: "Sharma",
    description: "Premium comfort wear for kids — soft fabrics, playful designs.",
    status: "ACTIVE" as const,
  },
  {
    slug: "nordic-loom",
    shopName: "Nordic Loom",
    email: "accessories@veloire.com",
    password: "Vendor@123",
    firstName: "Vikram",
    lastName: "Singh",
    description: "Bags, belts, caps, and finishing accessories crafted to last.",
    status: "ACTIVE" as const,
  },
] as const;

export type VendorSlug = (typeof VENDORS)[number]["slug"];

export const COLLECTIONS = [
  {
    handle: "new-arrivals",
    title: "New Arrivals",
    description: "The latest styles just landed.",
    image: collectionImage("new-arrivals"),
    sortOrder: 0,
  },
  {
    handle: "best-sellers",
    title: "Best Sellers",
    description: "Our most-loved pieces this season.",
    image: collectionImage("best-sellers"),
    sortOrder: 1,
  },
  {
    handle: "men",
    title: "Men",
    description: "Essentials and statement pieces for him.",
    image: collectionImage("men"),
    sortOrder: 2,
  },
  {
    handle: "women",
    title: "Women",
    description: "Curated womenswear from everyday to evening.",
    image: collectionImage("women"),
    sortOrder: 3,
  },
  {
    handle: "kids",
    title: "Kids",
    description: "Comfort-first styles for little ones.",
    image: collectionImage("kids"),
    sortOrder: 4,
  },
  {
    handle: "accessories",
    title: "Accessories",
    description: "Finish the look with belts, caps, and more.",
    image: collectionImage("accessories"),
    sortOrder: 5,
  },
  {
    handle: "sale",
    title: "Sale",
    description: "Limited-time offers on select styles.",
    image: collectionImage("sale"),
    sortOrder: 6,
  },
  {
    handle: "trending",
    title: "Trending Now",
    description: "What everyone is wearing right now.",
    image: collectionImage("trending"),
    sortOrder: 7,
  },
  {
    handle: "activewear",
    title: "Activewear",
    description: "Move in comfort and style.",
    image: collectionImage("activewear"),
    sortOrder: 8,
  },
  {
    handle: "essentials",
    title: "Wardrobe Essentials",
    description: "Timeless basics you'll reach for daily.",
    image: collectionImage("essentials"),
    sortOrder: 9,
  },
] as const;

type ProductSeed = {
  handle: string;
  title: string;
  description: string;
  brand: string;
  categorySlug: "men" | "women" | "kids" | "accessories";
  collections: string[];
  price: number;
  compareAtPrice?: number;
  image: string;
  image2?: string;
  colorName: string;
  colorHex: string;
  colorSlug: string;
  size: string;
  sku: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  vendorSlug?: VendorSlug;
};

export const PRODUCTS: ProductSeed[] = [
  { handle: "premium-cotton-crew-tee", title: "Premium Cotton Crew Tee", description: "Ultra-soft combed cotton with a refined everyday fit.", brand: "Veloire", categorySlug: "men", collections: ["new-arrivals", "men", "essentials", "trending"], price: 899, compareAtPrice: 1299, image: productImage("premium-cotton-crew-tee"), image2: productImage("premium-cotton-crew-tee", 2), colorName: "Black", colorHex: "#1a1a1a", colorSlug: "black", size: "M", sku: "VEL-TEE-001", isNew: true, isTrending: true, isFeatured: true },
  { handle: "linen-relaxed-shirt", title: "Linen Relaxed Shirt", description: "Breathable European linen for warm days.", brand: "Demo Boutique", categorySlug: "men", collections: ["men", "best-sellers", "essentials"], price: 2499, compareAtPrice: 3299, image: productImage("linen-relaxed-shirt"), colorName: "Beige", colorHex: "#d4c4a8", colorSlug: "beige", size: "M", sku: "DB-LINEN-01", isBestSeller: true, vendorSlug: "demo-boutique" },
  { handle: "slim-fit-chino", title: "Slim Fit Chino", description: "Stretch cotton chinos with a clean tapered leg.", brand: "Veloire", categorySlug: "men", collections: ["men", "essentials"], price: 1899, image: productImage("slim-fit-chino"), colorName: "Navy", colorHex: "#1e3a5f", colorSlug: "navy", size: "32", sku: "VEL-CHN-002", isFeatured: true },
  { handle: "oxford-button-down", title: "Oxford Button-Down Shirt", description: "Classic oxford weave, perfect for office or weekend.", brand: "Veloire", categorySlug: "men", collections: ["men", "essentials"], price: 1699, compareAtPrice: 2199, image: productImage("oxford-button-down"), colorName: "White", colorHex: "#f5f5f5", colorSlug: "white", size: "L", sku: "VEL-OXF-003" },
  { handle: "merino-crew-sweater", title: "Merino Crew Sweater", description: "Fine merino wool with natural temperature regulation.", brand: "Veloire", categorySlug: "men", collections: ["men", "best-sellers", "trending"], price: 3299, image: productImage("merino-crew-sweater"), colorName: "Charcoal", colorHex: "#36454f", colorSlug: "charcoal", size: "M", sku: "VEL-SWT-004", isBestSeller: true },
  { handle: "denim-trucker-jacket", title: "Denim Trucker Jacket", description: "Medium-wash denim with vintage-inspired details.", brand: "Urban Threads Co.", categorySlug: "men", collections: ["men", "new-arrivals", "trending"], price: 3999, compareAtPrice: 4999, image: productImage("denim-trucker-jacket"), colorName: "Indigo", colorHex: "#3f5277", colorSlug: "indigo", size: "L", sku: "UT-DNM-005", isNew: true, vendorSlug: "urban-threads" },
  { handle: "performance-jogger", title: "Performance Jogger", description: "Moisture-wicking fabric with zip pockets.", brand: "Urban Threads Co.", categorySlug: "men", collections: ["men", "activewear", "trending"], price: 1499, image: productImage("performance-jogger"), colorName: "Black", colorHex: "#1a1a1a", colorSlug: "black", size: "M", sku: "UT-JOG-006", isTrending: true, vendorSlug: "urban-threads" },
  { handle: "leather-belt-classic", title: "Classic Leather Belt", description: "Full-grain leather with brushed nickel buckle.", brand: "Nordic Loom", categorySlug: "accessories", collections: ["accessories", "men", "essentials"], price: 999, image: productImage("leather-belt-classic"), colorName: "Brown", colorHex: "#5c4033", colorSlug: "brown", size: "M", sku: "NL-BLT-007", vendorSlug: "nordic-loom" },
  { handle: "wool-blend-overcoat", title: "Wool Blend Overcoat", description: "Tailored overcoat for transitional weather.", brand: "Veloire", categorySlug: "men", collections: ["men", "best-sellers"], price: 8999, compareAtPrice: 11999, image: productImage("wool-blend-overcoat"), colorName: "Camel", colorHex: "#c19a6b", colorSlug: "camel", size: "L", sku: "VEL-COT-008", isBestSeller: true },
  { handle: "graphic-street-tee", title: "Graphic Street Tee", description: "Soft cotton tee with minimal front print.", brand: "Urban Threads Co.", categorySlug: "men", collections: ["men", "sale", "trending"], price: 699, compareAtPrice: 999, image: productImage("graphic-street-tee"), colorName: "Grey", colorHex: "#6b7280", colorSlug: "grey", size: "L", sku: "UT-GFX-009", vendorSlug: "urban-threads" },
  { handle: "tailored-blazer", title: "Tailored Blazer", description: "Structured shoulders with a modern slim silhouette.", brand: "Veloire", categorySlug: "men", collections: ["men", "new-arrivals"], price: 5499, image: productImage("tailored-blazer"), colorName: "Black", colorHex: "#1a1a1a", colorSlug: "black", size: "M", sku: "VEL-BLZ-010", isNew: true },
  { handle: "cotton-polo-shirt", title: "Cotton Pique Polo", description: "Classic polo in breathable pique knit.", brand: "Veloire", categorySlug: "men", collections: ["men", "essentials"], price: 1299, image: productImage("cotton-polo-shirt"), colorName: "Forest", colorHex: "#228b22", colorSlug: "forest", size: "M", sku: "VEL-POL-011" },
  { handle: "cargo-utility-pant", title: "Cargo Utility Pant", description: "Relaxed fit with reinforced pockets.", brand: "Urban Threads Co.", categorySlug: "men", collections: ["men", "activewear"], price: 2199, image: productImage("cargo-utility-pant"), colorName: "Olive", colorHex: "#556b2f", colorSlug: "olive", size: "32", sku: "UT-CRG-012", vendorSlug: "urban-threads" },
  { handle: "silk-evening-shirt", title: "Silk Blend Evening Shirt", description: "Subtle sheen for dressy occasions.", brand: "Demo Boutique", categorySlug: "men", collections: ["men", "best-sellers"], price: 4499, image: productImage("silk-evening-shirt"), colorName: "Burgundy", colorHex: "#800020", colorSlug: "burgundy", size: "M", sku: "DB-SLK-13", vendorSlug: "demo-boutique", isBestSeller: true },
  { handle: "fleece-hoodie", title: "Fleece Pullover Hoodie", description: "Plush fleece interior, kangaroo pocket.", brand: "Urban Threads Co.", categorySlug: "men", collections: ["men", "activewear", "sale"], price: 1799, compareAtPrice: 2499, image: productImage("fleece-hoodie"), colorName: "Heather", colorHex: "#9ca3af", colorSlug: "heather", size: "L", sku: "UT-HOD-014", vendorSlug: "urban-threads" },
  { handle: "floral-midi-dress", title: "Floral Midi Dress", description: "Lightweight fabric with a flattering A-line cut.", brand: "Sole Studio", categorySlug: "women", collections: ["women", "new-arrivals", "trending"], price: 2799, compareAtPrice: 3499, image: productImage("floral-midi-dress"), colorName: "Rose", colorHex: "#e8b4b8", colorSlug: "rose", size: "S", sku: "SS-DRS-015", isNew: true, isTrending: true, vendorSlug: "sole-studio" },
  { handle: "high-waist-wide-leg-jean", title: "High-Waist Wide Leg Jean", description: "Vintage-inspired denim with a modern rise.", brand: "Veloire", categorySlug: "women", collections: ["women", "best-sellers", "trending"], price: 2499, image: productImage("high-waist-wide-leg-jean"), colorName: "Light Wash", colorHex: "#87ceeb", colorSlug: "light-wash", size: "28", sku: "VEL-JEN-016", isBestSeller: true },
  { handle: "satin-slip-dress", title: "Satin Slip Dress", description: "Bias-cut satin for effortless evening elegance.", brand: "Sole Studio", categorySlug: "women", collections: ["women", "new-arrivals"], price: 3599, image: productImage("satin-slip-dress"), colorName: "Champagne", colorHex: "#f7e7ce", colorSlug: "champagne", size: "M", sku: "SS-SLP-017", isNew: true, vendorSlug: "sole-studio" },
  { handle: "cropped-knit-cardigan", title: "Cropped Knit Cardigan", description: "Soft rib knit with pearl button closure.", brand: "Sole Studio", categorySlug: "women", collections: ["women", "essentials", "trending"], price: 1899, image: productImage("cropped-knit-cardigan"), colorName: "Cream", colorHex: "#fffdd0", colorSlug: "cream", size: "S", sku: "SS-CRD-018", isTrending: true, vendorSlug: "sole-studio" },
  { handle: "linen-blend-trouser", title: "Linen Blend Trouser", description: "Relaxed wide leg with pressed crease.", brand: "Veloire", categorySlug: "women", collections: ["women", "essentials"], price: 2199, image: productImage("linen-blend-trouser"), colorName: "Sand", colorHex: "#c2b280", colorSlug: "sand", size: "M", sku: "VEL-TRS-019" },
  { handle: "oversized-blazer-women", title: "Oversized Blazer", description: "Power shoulders with a relaxed drape.", brand: "Veloire", categorySlug: "women", collections: ["women", "best-sellers"], price: 4299, compareAtPrice: 5499, image: productImage("oversized-blazer-women"), colorName: "Black", colorHex: "#1a1a1a", colorSlug: "black", size: "M", sku: "VEL-WBL-020", isBestSeller: true },
  { handle: "ribbed-tank-top", title: "Ribbed Tank Top", description: "Stretch rib fabric, perfect for layering.", brand: "Veloire", categorySlug: "women", collections: ["women", "essentials", "sale"], price: 599, compareAtPrice: 899, image: productImage("ribbed-tank-top"), image2: productImage("ribbed-tank-top", 2), colorName: "White", colorHex: "#f5f5f5", colorSlug: "white", size: "S", sku: "VEL-TNK-021" },
  { handle: "pleated-midi-skirt", title: "Pleated Midi Skirt", description: "Flowy pleats with elastic comfort waist.", brand: "Sole Studio", categorySlug: "women", collections: ["women", "trending"], price: 1699, image: productImage("pleated-midi-skirt"), colorName: "Plum", colorHex: "#8e4585", colorSlug: "plum", size: "M", sku: "SS-SKT-022", isTrending: true, vendorSlug: "sole-studio" },
  { handle: "wrap-blouse", title: "Wrap Front Blouse", description: "Flattering wrap neckline in viscose blend.", brand: "Demo Boutique", categorySlug: "women", collections: ["women", "new-arrivals"], price: 1499, image: productImage("wrap-blouse"), colorName: "Teal", colorHex: "#008080", colorSlug: "teal", size: "M", sku: "DB-BLS-23", vendorSlug: "demo-boutique", isNew: true },
  { handle: "yoga-leggings", title: "High-Rise Yoga Leggings", description: "Four-way stretch with hidden waistband pocket.", brand: "Veloire Active", categorySlug: "women", collections: ["women", "activewear", "best-sellers"], price: 1299, image: productImage("yoga-leggings"), colorName: "Black", colorHex: "#1a1a1a", colorSlug: "black", size: "S", sku: "VEL-LEG-024", isBestSeller: true },
  { handle: "wool-coat-women", title: "Double-Breasted Wool Coat", description: "Warm wool blend with full lining.", brand: "Veloire", categorySlug: "women", collections: ["women", "best-sellers"], price: 7999, image: productImage("wool-coat-women"), colorName: "Grey", colorHex: "#6b7280", colorSlug: "grey", size: "M", sku: "VEL-WCO-025", isFeatured: true },
  { handle: "printed-maxi-dress", title: "Printed Maxi Dress", description: "Bold print on flowing viscose.", brand: "Sole Studio", categorySlug: "women", collections: ["women", "sale", "trending"], price: 1999, compareAtPrice: 2999, image: productImage("printed-maxi-dress"), colorName: "Multi", colorHex: "#4a5568", colorSlug: "multi", size: "M", sku: "SS-MAX-026", vendorSlug: "sole-studio" },
  { handle: "kids-cotton-tee-pack", title: "Kids Cotton Tee 2-Pack", description: "Soft cotton tees in playful colors.", brand: "Little Luxuries", categorySlug: "kids", collections: ["kids", "essentials", "sale"], price: 799, compareAtPrice: 999, image: productImage("kids-cotton-tee-pack"), colorName: "Blue", colorHex: "#3b82f6", colorSlug: "blue", size: "6Y", sku: "LL-KTE-027", vendorSlug: "little-luxuries" },
  { handle: "kids-denim-overall", title: "Kids Denim Overall", description: "Adjustable straps, durable denim.", brand: "Little Luxuries", categorySlug: "kids", collections: ["kids", "new-arrivals"], price: 1299, image: productImage("kids-denim-overall"), colorName: "Denim", colorHex: "#3f5277", colorSlug: "denim", size: "4Y", sku: "LL-KOV-028", isNew: true, vendorSlug: "little-luxuries" },
  { handle: "kids-hooded-sweatshirt", title: "Kids Hooded Sweatshirt", description: "Cozy fleece-lined hoodie for playtime.", brand: "Little Luxuries", categorySlug: "kids", collections: ["kids", "activewear"], price: 999, image: productImage("kids-hooded-sweatshirt"), colorName: "Red", colorHex: "#dc2626", colorSlug: "red", size: "8Y", sku: "LL-KHD-029", vendorSlug: "little-luxuries" },
  { handle: "kids-print-leggings", title: "Kids Print Leggings", description: "Stretch leggings with fun all-over print.", brand: "Little Luxuries", categorySlug: "kids", collections: ["kids", "trending"], price: 599, image: productImage("kids-print-leggings"), colorName: "Pink", colorHex: "#ec4899", colorSlug: "pink", size: "6Y", sku: "LL-KLG-030", isTrending: true, vendorSlug: "little-luxuries" },
  { handle: "kids-puffer-jacket", title: "Kids Lightweight Puffer", description: "Water-resistant shell with light fill.", brand: "Little Luxuries", categorySlug: "kids", collections: ["kids", "best-sellers"], price: 1899, image: productImage("kids-puffer-jacket"), colorName: "Yellow", colorHex: "#eab308", colorSlug: "yellow", size: "5Y", sku: "LL-KPF-031", isBestSeller: true, vendorSlug: "little-luxuries" },
  { handle: "leather-crossbody-bag", title: "Leather Crossbody Bag", description: "Compact bag with adjustable strap.", brand: "Nordic Loom", categorySlug: "accessories", collections: ["accessories", "women", "best-sellers"], price: 2999, compareAtPrice: 3999, image: productImage("leather-crossbody-bag"), colorName: "Tan", colorHex: "#d2b48c", colorSlug: "tan", size: "OS", sku: "NL-BAG-032", isBestSeller: true, vendorSlug: "nordic-loom" },
  { handle: "canvas-tote-bag", title: "Canvas Tote Bag", description: "Oversized tote with interior pocket.", brand: "Nordic Loom", categorySlug: "accessories", collections: ["accessories", "essentials"], price: 899, image: productImage("canvas-tote-bag"), colorName: "Natural", colorHex: "#f5f5dc", colorSlug: "natural", size: "OS", sku: "NL-TOT-033", vendorSlug: "nordic-loom" },
  { handle: "classic-sneaker-cap", title: "Structured Dad Cap", description: "Cotton twill cap with embroidered logo.", brand: "Nordic Loom", categorySlug: "accessories", collections: ["accessories", "men", "women", "trending"], price: 699, image: productImage("classic-sneaker-cap"), colorName: "Black", colorHex: "#1a1a1a", colorSlug: "black", size: "OS", sku: "NL-CAP-034", isTrending: true, vendorSlug: "nordic-loom" },
  { handle: "silk-scarf-print", title: "Printed Silk Scarf", description: "Lightweight silk accent for neck or bag.", brand: "Nordic Loom", categorySlug: "accessories", collections: ["accessories", "women", "new-arrivals"], price: 1299, image: productImage("silk-scarf-print"), colorName: "Floral", colorHex: "#be185d", colorSlug: "floral", size: "OS", sku: "NL-SCF-035", isNew: true, vendorSlug: "nordic-loom" },
];
