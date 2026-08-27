/**
 * Seeds sample customer reviews without re-running the full product seed.
 * Run: npx tsx scripts/seed-reviews.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_REVIEWS = [
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

async function syncProductRating(productId: string) {
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

async function main() {
  const customer = await prisma.user.findUnique({
    where: { email: "customer@veloire.com" },
    select: { id: true },
  });
  if (!customer) {
    throw new Error("Demo customer not found. Run npm run db:seed first.");
  }

  let created = 0;
  for (const r of SEED_REVIEWS) {
    const product = await prisma.product.findUnique({
      where: { handle: r.handle },
      select: { id: true },
    });
    if (!product) {
      console.warn(`Skipping review — product not found: ${r.handle}`);
      continue;
    }

    await prisma.review.upsert({
      where: {
        productId_userId: { productId: product.id, userId: customer.id },
      },
      update: {
        rating: r.rating,
        title: r.title,
        body: r.body,
        isApproved: true,
      },
      create: {
        productId: product.id,
        userId: customer.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        isApproved: true,
      },
    });
    await syncProductRating(product.id);
    created++;
    console.log(`✓ ${r.handle}`);
  }

  console.log(`Done — ${created} reviews seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
