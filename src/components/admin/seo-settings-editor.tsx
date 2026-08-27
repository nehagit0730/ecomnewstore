"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { SiteSeoConfig } from "@/types/store-theme";

export function SeoSettingsEditor({ initial }: { initial: SiteSeoConfig }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await adminFetch("/settings/seo", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 border bg-background p-6 rounded-sm">
      <div>
        <h2 className="font-medium text-lg">SEO, branding & analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Site name, logo, favicon, default meta tags, and tracking scripts. Per-page SEO for
          CMS pages is under <span className="font-medium">Pages</span>.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Branding</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Site name</Label>
            <Input
              className="mt-1"
              value={data.siteName}
              onChange={(e) => setData({ ...data, siteName: e.target.value })}
              placeholder="Veloire"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Used in browser titles and header logo text.
            </p>
          </div>
          <div>
            <Label>Site URL</Label>
            <Input
              className="mt-1"
              value={data.siteUrl}
              onChange={(e) => setData({ ...data, siteUrl: e.target.value })}
              placeholder="https://veloire.com"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Canonical base URL for SEO and social previews.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Logo image</Label>
            <Input
              value={data.logoUrl ?? ""}
              onChange={(e) =>
                setData({ ...data, logoUrl: e.target.value || undefined })
              }
              placeholder="https://..."
            />
            <ImageUploader
              onUploaded={(url) => setData({ ...data, logoUrl: url })}
            />
            {data.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logoUrl}
                alt="Logo preview"
                className="mt-2 h-10 w-auto object-contain"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Favicon</Label>
            <Input
              value={data.faviconUrl ?? ""}
              onChange={(e) =>
                setData({ ...data, faviconUrl: e.target.value || undefined })
              }
              placeholder="https://... or /favicon.ico"
            />
            <ImageUploader
              onUploaded={(url) => setData({ ...data, faviconUrl: url })}
            />
            {data.faviconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.faviconUrl}
                alt="Favicon preview"
                className="mt-2 h-8 w-8 object-contain rounded-sm border"
              />
            )}
            <p className="text-[11px] text-muted-foreground">
              Square image recommended (32×32 or 512×512 PNG).
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Default meta tags</h3>
        <div>
          <Label>Default meta title</Label>
          <Input
            className="mt-1"
            value={data.defaultMetaTitle}
            onChange={(e) => setData({ ...data, defaultMetaTitle: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Homepage title and fallback when a page has no custom SEO title.
          </p>
        </div>
        <div>
          <Label>Default meta description</Label>
          <Textarea
            className="mt-1"
            rows={3}
            value={data.defaultMetaDescription}
            onChange={(e) =>
              setData({ ...data, defaultMetaDescription: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Meta keywords (optional)</Label>
          <Input
            className="mt-1"
            value={data.metaKeywords ?? ""}
            onChange={(e) =>
              setData({ ...data, metaKeywords: e.target.value || undefined })
            }
            placeholder="fashion, clothing, premium apparel"
          />
        </div>
        <div>
          <Label>Default social share image (OG image)</Label>
          <Input
            className="mt-1"
            value={data.defaultOgImage ?? ""}
            onChange={(e) =>
              setData({ ...data, defaultOgImage: e.target.value || undefined })
            }
            placeholder="/og-default.jpg"
          />
          <ImageUploader
            onUploaded={(url) => setData({ ...data, defaultOgImage: url })}
          />
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Analytics</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Google Analytics ID</Label>
            <Input
              className="mt-1 font-mono text-sm"
              value={data.googleAnalyticsId ?? ""}
              onChange={(e) =>
                setData({
                  ...data,
                  googleAnalyticsId: e.target.value || undefined,
                })
              }
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <div>
            <Label>Google Tag Manager ID (optional)</Label>
            <Input
              className="mt-1 font-mono text-sm"
              value={data.googleTagManagerId ?? ""}
              onChange={(e) =>
                setData({
                  ...data,
                  googleTagManagerId: e.target.value || undefined,
                })
              }
              placeholder="GTM-XXXXXXX"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Scripts are injected on the storefront only (not in admin or vendor panels).
        </p>
      </section>

      <Button type="button" variant="luxury" disabled={loading} onClick={save}>
        {loading ? "Saving…" : "Save SEO & branding"}
      </Button>
    </div>
  );
}
