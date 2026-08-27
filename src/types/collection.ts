import type { ProductCategory } from "./product";

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: string;
  category?: ProductCategory;
  productCount: number;
};
