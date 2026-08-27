export type CartLineItem = {
  id: string;
  productId: string;
  handle: string;
  title: string;
  brand: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  maxQuantity: number;
};

export type CartState = {
  items: CartLineItem[];
  couponCode: string | null;
  couponDiscount: number;
};
