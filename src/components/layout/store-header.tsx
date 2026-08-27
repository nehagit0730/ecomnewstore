import { storefrontService } from "@/server/services/storefront.service";
import { storeThemeService } from "@/server/services/store-theme.service";
import { buildMegaMenuFromCollections } from "@/lib/build-navigation";
import { SiteHeader } from "./site-header";

export async function StoreHeader() {
  const [collections, header] = await Promise.all([
    storefrontService.getCollections(),
    storeThemeService.getHeader(),
  ]);

  const megaMenu =
    header.navigationMode === "collections" || !header.navigation.length
      ? buildMegaMenuFromCollections(collections)
      : header.navigation;

  return <SiteHeader header={header} megaMenu={megaMenu} />;
}
