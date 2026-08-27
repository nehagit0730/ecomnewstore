export type ProductReview = {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    image: string | null;
  };
  product?: {
    title: string;
    handle: string;
  };
};

export type FeaturedReview = ProductReview & {
  product: {
    title: string;
    handle: string;
  };
};
