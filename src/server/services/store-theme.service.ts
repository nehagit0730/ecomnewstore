import { prisma } from "@/server/db/prisma";
import {
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_HOMEPAGE,
  DEFAULT_SEO,
} from "@/lib/store-theme-defaults";
import type {
  FooterConfig,
  HeaderConfig,
  HomepageConfig,
  SiteSeoConfig,
} from "@/types/store-theme";

const KEYS = {
  header: "store.header",
  footer: "store.footer",
  homepage: "store.homepage",
  seo: "store.seo",
  legacyHero: "homepage.hero",
} as const;

function mergeDeep<T extends Record<string, unknown>>(defaults: T, saved: unknown): T {
  if (!saved || typeof saved !== "object") return defaults;
  const out = { ...defaults };
  for (const key of Object.keys(saved as object)) {
    const val = (saved as Record<string, unknown>)[key];
    const def = defaults[key];
    if (val && typeof val === "object" && !Array.isArray(val) && def && typeof def === "object") {
      out[key as keyof T] = mergeDeep(
        def as Record<string, unknown>,
        val
      ) as T[keyof T];
    } else if (val !== undefined) {
      out[key as keyof T] = val as T[keyof T];
    }
  }
  return out;
}

async function readSetting<T>(key: string, defaults: T): Promise<T> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return mergeDeep(defaults as Record<string, unknown>, row?.value) as T;
  } catch {
    return defaults;
  }
}

async function writeSetting<T>(key: string, value: T) {
  try {
    return await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: value as object },
      update: { value: value as object },
    });
  } catch {
    return null;
  }
}

export class StoreThemeService {
  async getHeader(): Promise<HeaderConfig> {
    return readSetting(KEYS.header, DEFAULT_HEADER);
  }

  async updateHeader(value: HeaderConfig) {
    await writeSetting(KEYS.header, value);
    return value;
  }

  async getFooter(): Promise<FooterConfig> {
    return readSetting(KEYS.footer, DEFAULT_FOOTER);
  }

  async updateFooter(value: FooterConfig) {
    await writeSetting(KEYS.footer, value);
    return value;
  }

  async getHomepage(): Promise<HomepageConfig> {
    const saved = await readSetting(KEYS.homepage, DEFAULT_HOMEPAGE);

    try {
      const legacy = await prisma.siteSetting.findUnique({
        where: { key: KEYS.legacyHero },
      });
      if (legacy?.value && typeof legacy.value === "object") {
        saved.hero = mergeDeep(
          saved.hero as unknown as Record<string, unknown>,
          legacy.value
        ) as HomepageConfig["hero"];
      }
    } catch {
      // Fallback gracefully if database is not reachable
    }

    saved.productRows = saved.productRows.map((row) => {
      const legacy = row as HomepageConfig["productRows"][number] & {
        fetcher?: "new" | "best";
      };
      if (!legacy.sourceHandle && legacy.fetcher) {
        return {
          ...legacy,
          sourceType: "collection" as const,
          sourceHandle:
            legacy.fetcher === "best" ? "best-sellers" : "new-arrivals",
        };
      }
      return row;
    });

    return saved;
  }

  async updateHomepage(value: HomepageConfig) {
    await writeSetting(KEYS.homepage, value);
    await writeSetting(KEYS.legacyHero, value.hero);
    return value;
  }

  async getSeo(): Promise<SiteSeoConfig> {
    return readSetting(KEYS.seo, DEFAULT_SEO);
  }

  async updateSeo(value: SiteSeoConfig) {
    const cleaned: SiteSeoConfig = {
      ...value,
      googleAnalyticsId: value.googleAnalyticsId?.trim() || undefined,
      googleTagManagerId: value.googleTagManagerId?.trim() || undefined,
      metaKeywords: value.metaKeywords?.trim() || undefined,
      faviconUrl: value.faviconUrl?.trim() || undefined,
      logoUrl: value.logoUrl?.trim() || undefined,
      defaultOgImage: value.defaultOgImage?.trim() || undefined,
    };
    await writeSetting(KEYS.seo, cleaned);

    const header = await this.getHeader();
    await this.updateHeader({
      ...header,
      logo: {
        ...header.logo,
        text: cleaned.siteName,
        imageUrl: cleaned.logoUrl ?? header.logo.imageUrl,
      },
    });

    return cleaned;
  }
}

export const storeThemeService = new StoreThemeService();
