"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLineItem } from "@/types/cart";
import type { Product } from "@/types/product";
import { ESTIMATED_SHIPPING, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { normalizeProductImageUrl } from "@/lib/catalog-images";

type AddToCartPayload = {
  product: Product;
  quantity: number;
  size: string;
  color: string;
  colorHex: string;
};

type CartStore = {
  items: CartLineItem[];
  isOpen: boolean;
  couponCode: string | null;
  couponDiscount: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (payload: AddToCartPayload) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string) => boolean;
  setCoupon: (code: string, discountRate: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getItemCount: () => number;
};

const VALID_COUPONS: Record<string, number> = {
  VELOIRE10: 0.1,
  WELCOME15: 0.15,
};

function createLineId(
  productId: string,
  size: string,
  color: string
): string {
  return `${productId}-${size}-${color}`;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      couponDiscount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: ({ product, quantity, size, color, colorHex }) => {
        const id = createLineId(product.id, size, color);
        const variant = product.variants.find((v) => v.color.slug === color);
        const sku = variant?.sku ?? product.handle.toUpperCase();

        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + quantity,
                        i.maxQuantity
                      ),
                    }
                  : i
              ),
              isOpen: true,
            };
          }
          const line: CartLineItem = {
            id,
            productId: product.id,
            handle: product.handle,
            title: product.title,
            brand: product.brand,
            image: normalizeProductImageUrl(
              product.featuredImage,
              product.handle,
              160,
              192
            ),
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            quantity,
            size,
            color,
            colorHex,
            sku,
            maxQuantity: Math.min(product.stockCount, 10),
          };
          return { items: [...state.items, line], isOpen: true };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
              : i
          ),
        }));
      },

      applyCoupon: (code) => {
        const discount = VALID_COUPONS[code.toUpperCase()];
        if (!discount) return false;
        set({ couponCode: code.toUpperCase(), couponDiscount: discount });
        return true;
      },

      setCoupon: (code, discountRate) =>
        set({ couponCode: code.toUpperCase(), couponDiscount: discountRate }),

      removeCoupon: () =>
        set({ couponCode: null, couponDiscount: 0 }),

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
          ? 0
          : ESTIMATED_SHIPPING;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShipping();
        const discount = subtotal * get().couponDiscount;
        return subtotal - discount + shipping;
      },

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "veloire-cart",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as {
          items?: CartLineItem[];
          couponCode?: string | null;
          couponDiscount?: number;
        };
        if (state?.items?.length) {
          state.items = state.items.map((item) => ({
            ...item,
            image: normalizeProductImageUrl(item.image, item.handle, 160, 192),
          }));
        }
        return state;
      },
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
      }),
    }
  )
);
