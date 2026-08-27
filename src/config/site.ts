export const siteConfig = {
  name: "Veloire",
  description:
    "Premium fashion essentials for men, women, and kids. Timeless style, exceptional quality.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  currency: "INR",
  currencySymbol: "₹",
  freeShippingThreshold: 1999,
  defaultShipping: 99,
  productsPerPage: 12,
  lowStockThreshold: 5,
  /** Display-only: prices are inclusive of GST (common for Indian D2C) */
  pricesIncludeGst: true,
  gstLabel: "GST (included)",
} as const;
