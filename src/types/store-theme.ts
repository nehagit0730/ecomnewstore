export type ThemeNavLink = {
  label: string;
  href: string;
  description?: string;
};

export type MegaMenuColumn = {
  title: string;
  links: ThemeNavLink[];
};

export type MegaMenuItem = {
  label: string;
  href: string;
  columns: MegaMenuColumn[];
  featured?: {
    title: string;
    subtitle: string;
    image: string;
    href: string;
  };
};

export type HeaderConfig = {
  announcement: {
    enabled: boolean;
    items: { id: string; text: string }[];
  };
  logo: {
    text: string;
    imageUrl?: string;
    href: string;
  };
  navigationMode: "custom" | "collections";
  navigation: MegaMenuItem[];
  extraLinks: { label: string; href: string; highlight?: boolean }[];
};

export type FooterColumn = {
  title: string;
  links: ThemeNavLink[];
};

export type TrustIconKey =
  | "truck"
  | "rotate-ccw"
  | "shield-check"
  | "package"
  | "badge-check"
  | "headphones";

export type FooterConfig = {
  trustBar: {
    enabled: boolean;
    heading: string;
    items: { icon: TrustIconKey; title: string; desc: string }[];
  };
  brand: {
    description: string;
    socialLinks: { platform: string; url: string }[];
  };
  columns: FooterColumn[];
  mergeCmsPages: boolean;
  cmsColumnTitle: string;
  newsletter: {
    enabled: boolean;
    title: string;
    subtitle: string;
    buttonLabel: string;
  };
  legal: {
    links: ThemeNavLink[];
    supportEmail: string;
  };
};

export type HomepageTile = {
  handle: string;
  tagline: string;
  featured?: boolean;
  accent?: boolean;
  imageUrl?: string;
  title?: string;
};

export type HomepageProductRow = {
  id: string;
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  /** Products are loaded only from this collection or category */
  sourceType: "collection" | "category";
  sourceHandle: string;
  muted: boolean;
};

export type SiteSeoConfig = {
  siteName: string;
  /** Homepage & fallback `<title>` when a page has no custom SEO title */
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultOgImage?: string;
  faviconUrl?: string;
  logoUrl?: string;
  siteUrl: string;
  metaKeywords?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
};

export type HomepageConfig = {
  hero: {
    title: string;
    subtitle?: string;
    ctaLabel?: string;
    ctaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
    imageUrl: string;
  };
  quickLinks: ThemeNavLink[];
  featuredSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    subtitle: string;
    linkLabel: string;
    linkHref: string;
    tiles: HomepageTile[];
  };
  productRows: HomepageProductRow[];
};
