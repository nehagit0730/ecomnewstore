export const SITE_NAME = "Veloire";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://veloire.com";
export const SITE_DESCRIPTION =
  "Premium fashion essentials for men, women, and kids. Discover curated collections with timeless style and exceptional quality.";
export const FREE_SHIPPING_THRESHOLD = 1999;
export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";
export const PRODUCTS_PER_PAGE = 12;
export const LOW_STOCK_THRESHOLD = 5;
export const TAX_RATE = 0;
export const ESTIMATED_SHIPPING = 99;

export const TRENDING_SEARCHES = [
  "linen shirts",
  "cotton tees",
  "running shorts",
  "winter jackets",
  "premium underwear",
];

export const ANNOUNCEMENTS = [
  { id: "1", text: "Free shipping on orders above ₹1,999" },
  { id: "2", text: "New Season Collection — Up to 40% Off" },
  { id: "3", text: "Extra 10% off with code VELOIRE10" },
];
