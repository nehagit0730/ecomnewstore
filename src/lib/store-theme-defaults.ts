import { heroImage, navImage } from "@/lib/catalog-images";
import { MEGA_MENU, FOOTER_LINKS } from "@/data/navigation";
import { ANNOUNCEMENTS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import type {
  FooterConfig,
  HeaderConfig,
  HomepageConfig,
  SiteSeoConfig,
} from "@/types/store-theme";

export const DEFAULT_SEO: SiteSeoConfig = {
  siteName: SITE_NAME,
  defaultMetaTitle: SITE_NAME,
  defaultMetaDescription: SITE_DESCRIPTION,
  defaultOgImage: "/og-default.jpg",
  siteUrl: SITE_URL,
};

export const DEFAULT_HEADER: HeaderConfig = {
  announcement: {
    enabled: true,
    items: ANNOUNCEMENTS.map((a) => ({ id: a.id, text: a.text })),
  },
  logo: {
    text: SITE_NAME,
    href: "/",
  },
  navigationMode: "custom",
  navigation: MEGA_MENU,
  extraLinks: [{ label: "Sale", href: "/collections/sale", highlight: true }],
};

export const DEFAULT_FOOTER: FooterConfig = {
  trustBar: {
    enabled: true,
    heading: "Why shop with us",
    items: [
      {
        icon: "truck",
        title: "Free shipping",
        desc: `On orders over ${formatPrice(siteConfig.freeShippingThreshold)}`,
      },
      {
        icon: "rotate-ccw",
        title: "Easy returns",
        desc: "30-day hassle-free returns",
      },
      {
        icon: "shield-check",
        title: "Secure checkout",
        desc: "SSL-encrypted payments",
      },
      {
        icon: "package",
        title: "Fast dispatch",
        desc: "Ships within 24–48 hours",
      },
      {
        icon: "badge-check",
        title: "Verified sellers",
        desc: "Quality-checked marketplace",
      },
      {
        icon: "headphones",
        title: "Dedicated support",
        desc: "Help when you need it",
      },
    ],
  },
  brand: {
    description:
      "Modern essentials for men, women, and kids — curated quality, thoughtful design, and a seamless shopping experience.",
    socialLinks: [{ platform: "instagram", url: "https://instagram.com" }],
  },
  columns: [
    { title: "Shop", links: FOOTER_LINKS.shop },
    {
      title: "Help",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Shipping & delivery", href: "/pages/shipping" },
        { label: "Returns & exchanges", href: "/contact" },
        { label: "Track your order", href: "/account/orders" },
      ],
    },
    { title: "Company", links: FOOTER_LINKS.company },
  ],
  mergeCmsPages: true,
  cmsColumnTitle: "Company",
  newsletter: {
    enabled: true,
    title: "Stay in the loop",
    subtitle: "New drops and exclusive offers — no spam.",
    buttonLabel: "Join",
  },
  legal: {
    links: [
      { label: "Privacy", href: "/pages/privacy" },
      { label: "Shipping", href: "/pages/shipping" },
      { label: "About", href: "/pages/about" },
    ],
    supportEmail: "support@veloire.com",
  },
};

export const DEFAULT_HOMEPAGE: HomepageConfig = {
  hero: {
    title: "Elevate Your Everyday",
    subtitle: "Premium fashion essentials crafted for comfort and style.",
    ctaLabel: "Shop New Arrivals",
    ctaHref: "/collections/new-arrivals",
    secondaryCtaLabel: "Shop Men",
    secondaryCtaHref: "/collections/men",
    imageUrl: heroImage(),
  },
  quickLinks: [
    { label: "Women", href: "/collections/women" },
    { label: "Men", href: "/collections/men" },
    { label: "New in", href: "/collections/new-arrivals" },
    { label: "Sale", href: "/collections/sale" },
  ],
  featuredSection: {
    enabled: true,
    eyebrow: "Shop by category",
    title: "The edit",
    subtitle: "Four destinations — one wardrobe refresh.",
    linkLabel: "Browse all",
    linkHref: "/collections/new-arrivals",
    tiles: [
      {
        handle: "women",
        tagline: "Dresses, layers & signature pieces",
        featured: true,
      },
      {
        handle: "men",
        tagline: "Tailored essentials for every day",
      },
      {
        handle: "new-arrivals",
        tagline: "Limited drops — shop before they go",
      },
      {
        handle: "sale",
        tagline: "Seasonal edits up to 40% off",
        accent: true,
      },
    ],
  },
  productRows: [
    {
      id: "new-arrivals",
      enabled: true,
      eyebrow: "Just in",
      title: "New Arrivals",
      subtitle: "Latest pieces from our catalog",
      href: "/collections/new-arrivals",
      sourceType: "collection",
      sourceHandle: "new-arrivals",
      muted: false,
    },
    {
      id: "best-sellers",
      enabled: true,
      eyebrow: "Most loved",
      title: "Best Sellers",
      subtitle: "Top picks from the community",
      href: "/collections/best-sellers",
      sourceType: "collection",
      sourceHandle: "best-sellers",
      muted: true,
    },
  ],
};

/** Seed-friendly nav images when featured image missing */
export function defaultNavFeaturedImage(label: string) {
  const key = label.toLowerCase();
  if (key.includes("men")) return navImage("men");
  if (key.includes("women")) return navImage("women");
  if (key.includes("kid")) return navImage("kids");
  return navImage("accessories");
}
