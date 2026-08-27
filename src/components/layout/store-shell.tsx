import { Suspense } from "react";
import { headers } from "next/headers";
import { HeaderFallback } from "@/components/layout/header-fallback";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { SiteAnalytics } from "@/components/analytics/site-analytics";
import type { SiteSeoConfig } from "@/types/store-theme";

export async function StoreShell({
  children,
  seo,
}: {
  children: React.ReactNode;
  seo: SiteSeoConfig;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isPanel = pathname.startsWith("/admin") || pathname.startsWith("/vendor");

  if (isPanel) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteAnalytics
        googleAnalyticsId={seo.googleAnalyticsId}
        googleTagManagerId={seo.googleTagManagerId}
      />
      <Suspense fallback={<HeaderFallback />}>
        <StoreHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <StoreFooter />
      </Suspense>
    </>
  );
}
