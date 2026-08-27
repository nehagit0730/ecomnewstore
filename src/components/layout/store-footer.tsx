import { storefrontService } from "@/server/services/storefront.service";
import { storeThemeService } from "@/server/services/store-theme.service";
import { SiteFooter } from "./site-footer";

export async function StoreFooter() {
  const [footerPages, footer, header] = await Promise.all([
    storefrontService.getFooterPages(),
    storeThemeService.getFooter(),
    storeThemeService.getHeader(),
  ]);

  const cmsLinks = footerPages.map((p) => ({
    label: p.title,
    href: `/pages/${p.handle}`,
  }));

  return (
    <SiteFooter footer={footer} logoText={header.logo.text} cmsLinks={cmsLinks} />
  );
}
