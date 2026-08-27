import {
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_HOMEPAGE,
  DEFAULT_SEO,
} from "@/lib/store-theme-defaults";
import { DEFAULT_PRODUCT_COPY, DEFAULT_SIZE_CHART } from "@/lib/size-chart-defaults";
import { COLLECTIONS as SEED_COLLECTIONS, PRODUCTS as SEED_PRODUCTS, VENDORS as SEED_VENDORS } from "../../../prisma/seed-data";

// Simple ID generator
let idCounter = 1000;
function genId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${++idCounter}`;
}

export function createMockDb() {
  const adminId = "user_admin_1";
  const customerId = "user_customer_1";

  // 1. Users
  const users: any[] = [
    {
      id: "user_rahul_admin",
      email: "rahul@prowebcoder.com",
      passwordHash: "$2a$10$Ei3T2JOcv8IHt6Ik5ReebOw9ZywuyXDFfLGtxhMr9yXZZUTzzQoZe", // Admin@123 / password
      firstName: "Rahul",
      lastName: "Admin",
      phone: "+91 9876543299",
      role: "SUPER_ADMIN",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: adminId,
      email: "admin@veloire.com",
      passwordHash: "$2a$10$Ei3T2JOcv8IHt6Ik5ReebOw9ZywuyXDFfLGtxhMr9yXZZUTzzQoZe", // Admin@123
      firstName: "Super",
      lastName: "Admin",
      phone: "+91 9876543210",
      role: "SUPER_ADMIN",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: customerId,
      email: "customer@veloire.com",
      passwordHash: "$2a$10$t0AYFzYJw6fKDts2Vg//wOkzETGk4EweFnClBoy3.tyUYmMMyqanW", // Customer@123
      firstName: "Demo",
      lastName: "Customer",
      phone: "+91 9876543211",
      role: "CUSTOMER",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 2. Vendors
  const vendors: any[] = [];
  SEED_VENDORS.forEach((v, index) => {
    const vUserId = `user_vendor_${index + 1}`;
    users.push({
      id: vUserId,
      email: v.email,
      passwordHash: "$2a$10$.nzdQN8d.HhXc2fYd1f6xutlT1ouTA2ebxzYH.H4uM9P5XJMkcJyS", // Vendor@123
      firstName: v.firstName,
      lastName: v.lastName,
      role: "VENDOR",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vendors.push({
      id: `vendor_${v.slug}`,
      userId: vUserId,
      shopName: v.shopName,
      slug: v.slug,
      description: v.description,
      logo: null,
      status: v.status,
      commission: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // 3. Categories
  const categories: any[] = [
    { id: "cat_men", name: "Men", slug: "men", description: "Men essentials", sortOrder: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: "cat_women", name: "Women", slug: "women", description: "Women collection", sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: "cat_kids", name: "Kids", slug: "kids", description: "Kids wear", sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: "cat_accessories", name: "Accessories", slug: "accessories", description: "Accessories", sortOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  // 4. Collections
  const collections: any[] = SEED_COLLECTIONS.map((c, i) => ({
    id: `col_${c.handle}`,
    title: c.title,
    handle: c.handle,
    description: c.description,
    image: c.image,
    sortOrder: c.sortOrder ?? i,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // 5. Products & Variants & Images & Inventory
  const products: any[] = [];
  const productImages: any[] = [];
  const productVariants: any[] = [];
  const inventory: any[] = [];
  const collectionProducts: any[] = [];
  const reviews: any[] = [];

  SEED_PRODUCTS.forEach((p, idx) => {
    const prodId = `prod_${p.handle}`;
    const category = categories.find((c) => c.slug === p.categorySlug);
    const vendor = p.vendorSlug ? vendors.find((v) => v.slug === p.vendorSlug) : null;

    products.push({
      id: prodId,
      title: p.title,
      handle: p.handle,
      description: p.description,
      brand: p.brand,
      categoryId: category?.id ?? null,
      vendorId: vendor?.id ?? null,
      materials: "See product description.",
      careInstructions: DEFAULT_PRODUCT_COPY.careInstructions,
      shippingInfo: DEFAULT_PRODUCT_COPY.shippingInfo,
      returnPolicy: DEFAULT_PRODUCT_COPY.returnPolicy,
      sizeChart: "",
      approvalStatus: "APPROVED",
      rejectionReason: null,
      reviewedById: adminId,
      reviewedAt: new Date(),
      isActive: true,
      isFeatured: p.isFeatured ?? false,
      isNew: p.isNew ?? false,
      isTrending: p.isTrending ?? false,
      isBestSeller: p.isBestSeller ?? false,
      rating: 4.8,
      reviewCount: 12 + idx * 3,
      createdAt: new Date(Date.now() - idx * 86400000),
      updatedAt: new Date(),
    });

    // Images
    productImages.push({
      id: `img_${prodId}_0`,
      productId: prodId,
      url: p.image,
      alt: p.title,
      sortOrder: 0,
      createdAt: new Date(),
    });
    if (p.image2) {
      productImages.push({
        id: `img_${prodId}_1`,
        productId: prodId,
        url: p.image2,
        alt: p.title,
        sortOrder: 1,
        createdAt: new Date(),
      });
    }

    // Variant
    const variantId = `var_${p.sku}`;
    productVariants.push({
      id: variantId,
      productId: prodId,
      sku: p.sku,
      barcode: `890${p.sku.replace(/[^A-Z0-9]/gi, "").padEnd(10, "0").slice(0, 10)}`,
      colorName: p.colorName,
      colorHex: p.colorHex,
      colorSlug: p.colorSlug,
      sizeLabel: p.size,
      sizeValue: p.size,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    inventory.push({
      id: `inv_${variantId}`,
      variantId: variantId,
      quantity: 50 + (idx % 20),
      reservedQuantity: 0,
      lowStockThreshold: 5,
      updatedAt: new Date(),
    });

    // Collection relations
    p.collections.forEach((colHandle, colIdx) => {
      const col = collections.find((c) => c.handle === colHandle);
      if (col) {
        collectionProducts.push({
          collectionId: col.id,
          productId: prodId,
          sortOrder: colIdx,
        });
      }
    });
  });

  // 6. Site Settings
  const siteSettings: any[] = [
    { key: "store.header", value: DEFAULT_HEADER, updatedAt: new Date() },
    { key: "store.footer", value: DEFAULT_FOOTER, updatedAt: new Date() },
    { key: "store.homepage", value: DEFAULT_HOMEPAGE, updatedAt: new Date() },
    { key: "store.seo", value: DEFAULT_SEO, updatedAt: new Date() },
    { key: "homepage.hero", value: DEFAULT_HOMEPAGE.hero, updatedAt: new Date() },
    { key: "storefront.sizeChart", value: DEFAULT_SIZE_CHART, updatedAt: new Date() },
  ];

  // 7. Store Pages
  const storePages: any[] = [
    {
      id: "page_about",
      title: "About Us",
      handle: "about",
      body: "Veloire is a premium multi-vendor luxury fashion marketplace bringing together curated aesthetics, timeless craftsmanship, and contemporary everyday wear.",
      seoTitle: "About Us — Veloire",
      seoDescription: "Learn more about Veloire.",
      isPublished: true,
      showInFooter: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "page_shipping",
      title: "Shipping Policy",
      handle: "shipping",
      body: "We offer complimentary standard shipping across India on orders over ₹1,999. Typical delivery takes 2–4 business days with real-time end-to-end tracking.",
      seoTitle: "Shipping Policy — Veloire",
      seoDescription: "Shipping details and delivery timeframes.",
      isPublished: true,
      showInFooter: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "page_privacy",
      title: "Privacy Policy",
      handle: "privacy",
      body: "At Veloire, we value your privacy and handle all customer details with encrypted security standards. Your data is never sold or disclosed to unauthorized parties.",
      seoTitle: "Privacy Policy — Veloire",
      seoDescription: "How we safeguard your information.",
      isPublished: true,
      showInFooter: true,
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "page_returns",
      title: "Returns & Exchanges",
      handle: "returns",
      body: "Enjoy hassle-free 30-day returns and exchanges on unworn, unwashed merchandise with all original tags attached.",
      seoTitle: "Returns & Exchanges — Veloire",
      seoDescription: "Return terms and instructions.",
      isPublished: true,
      showInFooter: true,
      sortOrder: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "page_contact",
      title: "Contact Us",
      handle: "contact",
      body: "Have questions or need styling advice? Our concierge team is available Monday through Saturday, 9 AM – 7 PM IST at support@veloire.com.",
      seoTitle: "Contact Us — Veloire",
      seoDescription: "Reach our concierge team.",
      isPublished: true,
      showInFooter: true,
      sortOrder: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 8. Coupons
  const coupons: any[] = [
    {
      id: "cpn_1",
      code: "VELOIRE10",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmount: 500,
      maxUses: 1000,
      usedCount: 15,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cpn_2",
      code: "WELCOME20",
      type: "PERCENTAGE",
      value: 20,
      minOrderAmount: 1000,
      maxUses: 500,
      usedCount: 8,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 9. Sample Reviews
  reviews.push(
    {
      id: "rev_1",
      productId: "prod_premium-cotton-crew-tee",
      userId: customerId,
      rating: 5,
      title: "Exceptional quality",
      body: "The fabric quality is exceptional. Fits perfectly and feels premium all day.",
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "rev_2",
      productId: "prod_yoga-leggings",
      userId: customerId,
      rating: 5,
      title: "So comfortable",
      body: "Finally found leggings that are comfortable and stylish for yoga and everyday wear. Will buy again!",
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "rev_3",
      productId: "prod_performance-jogger",
      userId: customerId,
      rating: 4,
      title: "Great for workouts",
      body: "Great joggers for workouts and casual wear. True to size and very comfortable.",
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "rev_4",
      productId: "prod_linen-relaxed-shirt",
      userId: customerId,
      rating: 5,
      title: "Minimalist perfection",
      body: "Love the minimalist design. Packaging was beautiful too. Highly recommend.",
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );

  const tables: Record<string, any[]> = {
    user: users,
    vendor: vendors,
    category: categories,
    collection: collections,
    collectionProduct: collectionProducts,
    product: products,
    productImage: productImages,
    productVariant: productVariants,
    inventory: inventory,
    siteSetting: siteSettings,
    storePage: storePages,
    coupon: coupons,
    review: reviews,
    order: [],
    orderItem: [],
    orderAddress: [],
    payment: [],
    shipment: [],
    cart: [],
    cartItem: [],
    address: [],
    wishlist: [],
    account: [],
    session: [],
    verificationToken: [],
    passwordResetToken: [],
  };

  return tables;
}

export type MockDb = ReturnType<typeof createMockDb>;
