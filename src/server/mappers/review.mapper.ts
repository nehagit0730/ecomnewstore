import type { ProductReview } from "@/types/review";

type ReviewUser = {
  firstName: string | null;
  lastName: string | null;
  image: string | null;
};

type ReviewProduct = {
  title: string;
  handle: string;
};

type DbReview = {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: ReviewUser;
  product?: ReviewProduct;
};

function authorName(user: ReviewUser) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || "Verified customer";
}

export function mapDbReview(review: DbReview): ProductReview {
  return {
    id: review.id,
    productId: review.productId,
    rating: review.rating,
    title: review.title,
    body: review.body,
    isApproved: review.isApproved,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    author: {
      name: authorName(review.user),
      image: review.user.image,
    },
    ...(review.product
      ? { product: { title: review.product.title, handle: review.product.handle } }
      : {}),
  };
}
