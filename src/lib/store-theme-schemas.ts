import { z } from "zod";

const navLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  description: z.string().optional(),
});

const megaMenuColumnSchema = z.object({
  title: z.string().min(1),
  links: z.array(navLinkSchema),
});

const megaMenuItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  columns: z.array(megaMenuColumnSchema),
  featured: z
    .object({
      title: z.string().min(1),
      subtitle: z.string(),
      image: z.string().min(1),
      href: z.string().min(1),
    })
    .optional(),
});

export const headerConfigSchema = z.object({
  announcement: z.object({
    enabled: z.boolean(),
    items: z.array(z.object({ id: z.string(), text: z.string().min(1) })),
  }),
  logo: z.object({
    text: z.string().min(1),
    imageUrl: z.string().optional(),
    href: z.string().min(1),
  }),
  navigationMode: z.enum(["custom", "collections"]),
  navigation: z.array(megaMenuItemSchema),
  extraLinks: z.array(
    z.object({
      label: z.string().min(1),
      href: z.string().min(1),
      highlight: z.boolean().optional(),
    })
  ),
});

const trustIconSchema = z.enum([
  "truck",
  "rotate-ccw",
  "shield-check",
  "package",
  "badge-check",
  "headphones",
]);

export const footerConfigSchema = z.object({
  trustBar: z.object({
    enabled: z.boolean(),
    heading: z.string(),
    items: z.array(
      z.object({
        icon: trustIconSchema,
        title: z.string().min(1),
        desc: z.string().min(1),
      })
    ),
  }),
  brand: z.object({
    description: z.string(),
    socialLinks: z.array(
      z.object({ platform: z.string().min(1), url: z.string().url() })
    ),
  }),
  columns: z.array(
    z.object({
      title: z.string().min(1),
      links: z.array(navLinkSchema),
    })
  ),
  mergeCmsPages: z.boolean(),
  cmsColumnTitle: z.string(),
  newsletter: z.object({
    enabled: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    buttonLabel: z.string(),
  }),
  legal: z.object({
    links: z.array(navLinkSchema),
    supportEmail: z.string().email(),
  }),
});

export const seoConfigSchema = z.object({
  siteName: z.string().min(1),
  defaultMetaTitle: z.string().min(1),
  defaultMetaDescription: z.string().min(1),
  defaultOgImage: z.string().optional(),
  faviconUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  siteUrl: z.string().url(),
  metaKeywords: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  googleTagManagerId: z.string().optional(),
});

export const homepageConfigSchema = z.object({
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
    secondaryCtaLabel: z.string().optional(),
    secondaryCtaHref: z.string().optional(),
    imageUrl: z.string().min(1),
  }),
  quickLinks: z.array(navLinkSchema),
  featuredSection: z.object({
    enabled: z.boolean(),
    eyebrow: z.string(),
    title: z.string(),
    subtitle: z.string(),
    linkLabel: z.string(),
    linkHref: z.string(),
    tiles: z.array(
      z.object({
        handle: z.string().min(1),
        tagline: z.string(),
        featured: z.boolean().optional(),
        accent: z.boolean().optional(),
        imageUrl: z.string().optional(),
        title: z.string().optional(),
      })
    ),
  }),
  productRows: z.array(
    z.object({
      id: z.string(),
      enabled: z.boolean(),
      eyebrow: z.string(),
      title: z.string(),
      subtitle: z.string(),
      href: z.string(),
      sourceType: z.enum(["collection", "category"]),
      sourceHandle: z.string().min(1),
      muted: z.boolean(),
    })
  ),
});
