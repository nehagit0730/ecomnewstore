import { storeThemeService } from "@/server/services/store-theme.service";
import { storefrontService } from "@/server/services/storefront.service";
import { StoreContentTabs } from "@/components/admin/store-content-tabs";
import { SizeChartEditor } from "@/components/admin/size-chart-editor";

export default async function AdminContentPage() {
  const [homepage, header, footer, seo, sizeChart, collections, categories] =
    await Promise.all([
      storeThemeService.getHomepage(),
      storeThemeService.getHeader(),
      storeThemeService.getFooter(),
      storeThemeService.getSeo(),
      storefrontService.getSizeChart(),
      storefrontService.getCollections(),
      storefrontService.getCategories(),
    ]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-3xl mb-2">Storefront</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Customize the homepage, header, footer, logo, favicon, SEO meta tags, and
          analytics. CMS page content & per-page SEO are under{" "}
          <span className="font-medium">Pages</span>.
        </p>
      </div>
      <StoreContentTabs
        homepage={homepage}
        header={header}
        footer={footer}
        seo={seo}
        collections={collections.map((c) => ({ handle: c.handle, title: c.title }))}
        categories={categories.map((c) => ({ handle: c.slug, title: c.name }))}
      />
      <SizeChartEditor initial={sizeChart} />
    </div>
  );
}
