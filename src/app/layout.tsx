import type { Metadata } from "next";
import { StoreShell } from "@/components/layout/store-shell";
import { AppProviders } from "@/providers/app-providers";
import { buildRootMetadata } from "@/lib/seo";
import { getSiteSeo } from "@/lib/site-seo";
import { organizationJsonLd } from "@/lib/structured-data";
import { auth } from "@/auth";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return buildRootMetadata(seo);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [seo, session] = await Promise.all([getSiteSeo(), auth()]);

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(seo)),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <AppProviders session={session}>
          <StoreShell seo={seo}>{children}</StoreShell>
        </AppProviders>
      </body>
    </html>
  );
}
