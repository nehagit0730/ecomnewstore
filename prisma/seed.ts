import {
  PrismaClient,
  UserRole,
  CouponType,
  ProductApprovalStatus,
  VendorStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { heroImage } from "../src/lib/catalog-images";
import { DEFAULT_PRODUCT_COPY, DEFAULT_SIZE_CHART } from "../src/lib/size-chart-defaults";
import { COLLECTIONS, PRODUCTS, VENDORS } from "./seed-data";

const prisma = new PrismaClient();

async function upsertProduct(
  data: (typeof PRODUCTS)[number],
  categoryId: string,
  vendorId: string | null,
  reviewerId: string
) {
  const images = [
    { url: data.image, sortOrder: 0 },
    ...(data.image2 ? [{ url: data.image2, sortOrder: 1 }] : []),
  ];

  const productData = {
    title: data.title,
    handle: data.handle,
    description: data.description,
    brand: data.brand,
    categoryId,
    vendorId,
    materials: "See product description.",
    careInstructions: DEFAULT_PRODUCT_COPY.careInstructions,
    shippingInfo: DEFAULT_PRODUCT_COPY.shippingInfo,
    returnPolicy: DEFAULT_PRODUCT_COPY.returnPolicy,
    approvalStatus: ProductApprovalStatus.APPROVED,
    isActive: true,
    isFeatured: data.isFeatured ?? false,
    isNew: data.isNew ?? false,
    isTrending: data.isTrending ?? false,
    isBestSeller: data.isBestSeller ?? false,
    reviewedById: reviewerId,
    reviewedAt: new Date(),
    images: { create: images },
    variants: {
      create: [
        {
          sku: data.sku,
          barcode: `890${data.sku.replace(/[^A-Z0-9]/gi, "").padEnd(10, "0").slice(0, 10)}`,
          colorName: data.colorName,
          colorHex: data.colorHex,
          colorSlug: data.colorSlug,
          sizeLabel: data.size,
          sizeValue: data.size,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          inventory: { create: { quantity: 25 + Math.floor(Math.random() * 75) } },
        },
      ],
    },
  };

  const existing = await prisma.product.findUnique({ where: { handle: data.handle } });
  if (existing) {
    await prisma.productImage.deleteMany({ where: { productId: existing.id } });
    await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
    return prisma.product.update({
      where: { id: existing.id },
      data: productData,
    });
  }
  return prisma.product.create({ data: productData });
}

async function main() {
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const customerHash = await bcrypt.hash("Customer@123", 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@veloire.com" },
    update: { role: UserRole.SUPER_ADMIN },
    create: {
      email: "admin@veloire.com",
      passwordHash: adminHash,
      firstName: "Super",
      lastName: "Admin",
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
      cart: { create: {} },
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@veloire.com" },
    update: {},
    create: {
      email: "customer@veloire.com",
      passwordHash: customerHash,
      firstName: "Demo",
      lastName: "Customer",
      emailVerified: new Date(),
      cart: { create: {} },
    },
  });

  console.log(`Seeding ${VENDORS.length} vendors...`);
  const vendorRecords: Record<string, string> = {};

  for (const v of VENDORS) {
    const passwordHash = await bcrypt.hash(v.password, 12);
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: { role: UserRole.VENDOR },
      create: {
        email: v.email,
        passwordHash,
        firstName: v.firstName,
        lastName: v.lastName,
        role: UserRole.VENDOR,
        emailVerified: new Date(),
        cart: { create: {} },
      },
    });

    const shop = await prisma.vendor.upsert({
      where: { slug: v.slug },
      update: {
        shopName: v.shopName,
        description: v.description,
        status: v.status as VendorStatus,
      },
      create: {
        userId: user.id,
        shopName: v.shopName,
        slug: v.slug,
        description: v.description,
        status: v.status as VendorStatus,
      },
    });
    vendorRecords[v.slug] = shop.id;
  }

  const categoryRecords: Record<string, string> = {};
  for (const cat of [
    { name: "Men", slug: "men", description: "Men essentials" },
    { name: "Women", slug: "women", description: "Women collection" },
    { name: "Kids", slug: "kids", description: "Kids wear" },
    { name: "Accessories", slug: "accessories", description: "Accessories" },
  ]) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryRecords[cat.slug] = row.id;
  }

  console.log(`Seeding ${PRODUCTS.length} products...`);
  const productIds: Record<string, string> = {};

  for (const p of PRODUCTS) {
    const categoryId = categoryRecords[p.categorySlug];
    const vendorId = p.vendorSlug ? vendorRecords[p.vendorSlug] : null;
    const product = await upsertProduct(p, categoryId, vendorId, superAdmin.id);
    productIds[p.handle] = product.id;
  }

  console.log(`Seeding ${COLLECTIONS.length} collections...`);
  const collectionIds: Record<string, string> = {};

  for (const col of COLLECTIONS) {
    const collection = await prisma.collection.upsert({
      where: { handle: col.handle },
      update: {
        title: col.title,
        description: col.description,
        image: col.image,
        sortOrder: col.sortOrder,
        isActive: true,
      },
      create: {
        title: col.title,
        handle: col.handle,
        description: col.description,
        image: col.image,
        sortOrder: col.sortOrder,
        isActive: true,
      },
    });
    collectionIds[col.handle] = collection.id;
    await prisma.collectionProduct.deleteMany({ where: { collectionId: collection.id } });
  }

  let linkCount = 0;
  for (const p of PRODUCTS) {
    const productId = productIds[p.handle];
    if (!productId) continue;
    for (let i = 0; i < p.collections.length; i++) {
      const collectionId = collectionIds[p.collections[i]];
      if (!collectionId) continue;
      await prisma.collectionProduct.upsert({
        where: {
          collectionId_productId: { collectionId, productId },
        },
        update: { sortOrder: i },
        create: { collectionId, productId, sortOrder: i },
      });
      linkCount++;
    }
  }

  await prisma.coupon.upsert({
    where: { code: "VELOIRE10" },
    update: {},
    create: {
      code: "VELOIRE10",
      type: CouponType.PERCENTAGE,
      value: 10,
      minOrderAmount: 500,
    },
  });

  const { DEFAULT_HEADER, DEFAULT_FOOTER, DEFAULT_HOMEPAGE, DEFAULT_SEO } = await import(
    "../src/lib/store-theme-defaults"
  );

  await prisma.siteSetting.upsert({
    where: { key: "store.header" },
    update: { value: DEFAULT_HEADER },
    create: { key: "store.header", value: DEFAULT_HEADER },
  });

  await prisma.siteSetting.upsert({
    where: { key: "store.footer" },
    update: { value: DEFAULT_FOOTER },
    create: { key: "store.footer", value: DEFAULT_FOOTER },
  });

  await prisma.siteSetting.upsert({
    where: { key: "store.homepage" },
    update: { value: DEFAULT_HOMEPAGE },
    create: { key: "store.homepage", value: DEFAULT_HOMEPAGE },
  });

  await prisma.siteSetting.upsert({
    where: { key: "store.seo" },
    update: { value: DEFAULT_SEO },
    create: { key: "store.seo", value: DEFAULT_SEO },
  });

  await prisma.siteSetting.upsert({
    where: { key: "homepage.hero" },
    update: { value: DEFAULT_HOMEPAGE.hero },
    create: { key: "homepage.hero", value: DEFAULT_HOMEPAGE.hero },
  });

  await prisma.siteSetting.upsert({
    where: { key: "storefront.sizeChart" },
    update: { value: DEFAULT_SIZE_CHART },
    create: { key: "storefront.sizeChart", value: DEFAULT_SIZE_CHART },
  });

  for (const page of [
    {
      title: "About Us",
      handle: "about",
      body: "Veloire is a premium multivendor fashion marketplace.",
      isPublished: true,
      showInFooter: true,
      sortOrder: 1,
    },
    {
      title: "Shipping Policy",
      handle: "shipping",
      body: "Free shipping on orders over ₹999. Standard delivery 3–7 business days.",
      isPublished: true,
      showInFooter: true,
      sortOrder: 2,
    },
    {
      title: "Privacy Policy",
      handle: "privacy",
      body: "We respect your privacy and protect your personal data.",
      isPublished: true,
      showInFooter: true,
      sortOrder: 3,
    },
  ]) {
    await prisma.storePage.upsert({
      where: { handle: page.handle },
      update: page,
      create: page,
    });
  }

  const customer = await prisma.user.findUnique({
    where: { email: "customer@veloire.com" },
    select: { id: true },
  });

  const seedReviews = [
    {
      handle: "premium-cotton-crew-tee",
      rating: 5,
      title: "Exceptional quality",
      body: "The fabric quality is exceptional. Fits perfectly and feels premium all day.",
    },
    {
      handle: "yoga-leggings",
      rating: 5,
      title: "So comfortable",
      body: "Finally found leggings that are comfortable and stylish for yoga and everyday wear. Will buy again!",
    },
    {
      handle: "performance-jogger",
      rating: 4,
      title: "Great for workouts",
      body: "Great joggers for workouts and casual wear. True to size and very comfortable.",
    },
    {
      handle: "linen-relaxed-shirt",
      rating: 5,
      title: "Minimalist perfection",
      body: "Love the minimalist design. Packaging was beautiful too. Highly recommend.",
    },
  ];

  if (customer) {
    for (const r of seedReviews) {
      const productId = productIds[r.handle];
      if (!productId) continue;
      await prisma.review.upsert({
        where: {
          productId_userId: { productId, userId: customer.id },
        },
        update: {
          rating: r.rating,
          title: r.title,
          body: r.body,
          isApproved: true,
        },
        create: {
          productId,
          userId: customer.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          isApproved: true,
        },
      });

      const agg = await prisma.review.aggregate({
        where: { productId, isApproved: true },
        _avg: { rating: true },
        _count: true,
      });
      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
          reviewCount: agg._count,
        },
      });
    }
    console.log(`  → ${seedReviews.length} sample reviews`);
  }

  console.log("Seed complete");
  console.log(`  → ${VENDORS.length} vendors`);
  console.log(`  → ${PRODUCTS.length} products`);
  console.log(`  → ${COLLECTIONS.length} collections`);
  console.log(`  → ${linkCount} collection-product links`);
  console.log("Super Admin: admin@veloire.com / Admin@123  →  /admin");
  console.log("Customer: customer@veloire.com / Customer@123");
  console.log("Vendors (all password: Vendor@123):");
  for (const v of VENDORS) {
    console.log(`  • ${v.shopName}: ${v.email}  →  /vendor`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
