import { cache } from "react";
import { storeThemeService } from "@/server/services/store-theme.service";
import type { SiteSeoConfig } from "@/types/store-theme";

/** Cached per-request site SEO & branding (logo, favicon, analytics IDs). */
export const getSiteSeo = cache(async (): Promise<SiteSeoConfig> => {
  return storeThemeService.getSeo();
});
