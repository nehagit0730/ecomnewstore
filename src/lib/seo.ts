import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "./constants";
import type { SiteSeoConfig } from "@/types/store-theme";

type PageMeta = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string;
};

type SiteMetaOptions = Pick<
  SiteSeoConfig,
  "siteName" | "defaultMetaDescription" | "defaultOgImage" | "siteUrl" | "metaKeywords"
>;

function resolveSite(options?: SiteMetaOptions) {
  return {
    siteName: options?.siteName ?? SITE_NAME,
    siteUrl: options?.siteUrl ?? SITE_URL,
    defaultDescription: options?.defaultMetaDescription ?? SITE_DESCRIPTION,
    defaultOgImage: options?.defaultOgImage ?? "/og-default.jpg",
    metaKeywords: options?.metaKeywords,
  };
}

export function buildMetadata(
  {
    title,
    description,
    path = "",
    image,
    noIndex = false,
    keywords,
  }: PageMeta,
  site?: SiteMetaOptions
): Metadata {
  const { siteName, siteUrl, defaultDescription, defaultOgImage, metaKeywords } =
    resolveSite(site);
  const metaDescription = description ?? defaultDescription;
  const ogImage = image ?? defaultOgImage;
  const url = `${siteUrl.replace(/\/$/, "")}${path}`;
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const allKeywords = [keywords, metaKeywords].filter(Boolean).join(", ") || undefined;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: allKeywords,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url,
      siteName,
      locale: "en_IN",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function buildRootMetadata(seo: SiteSeoConfig): Metadata {
  const base = buildMetadata(
    {
      title: seo.defaultMetaTitle,
      description: seo.defaultMetaDescription,
      image: seo.defaultOgImage,
      path: "/",
    },
    seo
  );

  return {
    ...base,
    title: {
      default: seo.defaultMetaTitle,
      template: `%s | ${seo.siteName}`,
    },
    icons: seo.faviconUrl
      ? {
          icon: seo.faviconUrl,
          shortcut: seo.faviconUrl,
          apple: seo.faviconUrl,
        }
      : undefined,
  };
}
