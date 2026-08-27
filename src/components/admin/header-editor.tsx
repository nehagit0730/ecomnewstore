"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/admin/image-uploader";
import { LinkListEditor } from "@/components/admin/link-list-editor";
import { MegaMenuEditor } from "@/components/admin/mega-menu-editor";
import type { HeaderConfig } from "@/types/store-theme";

export function HeaderEditor({ initial }: { initial: HeaderConfig }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await adminFetch("/settings/header", {
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
        <h2 className="font-medium text-lg">Header & navigation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Announcement bar, logo, main menu, and extra links like Sale.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Announcement bar</h3>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={data.announcement.enabled}
            onCheckedChange={(v) =>
              setData({
                ...data,
                announcement: { ...data.announcement, enabled: !!v },
              })
            }
          />
          Show announcement bar
        </label>
        <div className="space-y-2">
          {data.announcement.items.map((item, i) => (
            <div key={item.id} className="flex gap-2">
              <Input
                value={item.text}
                onChange={(e) => {
                  const items = [...data.announcement.items];
                  items[i] = { ...item, text: e.target.value };
                  setData({ ...data, announcement: { ...data.announcement, items } });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setData({
                    ...data,
                    announcement: {
                      ...data.announcement,
                      items: data.announcement.items.filter((_, j) => j !== i),
                    },
                  })
                }
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setData({
                ...data,
                announcement: {
                  ...data.announcement,
                  items: [
                    ...data.announcement.items,
                    { id: String(Date.now()), text: "New announcement" },
                  ],
                },
              })
            }
          >
            Add message
          </Button>
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Logo</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Store name</Label>
            <Input
              className="mt-1"
              value={data.logo.text}
              onChange={(e) =>
                setData({ ...data, logo: { ...data.logo, text: e.target.value } })
              }
            />
          </div>
          <div>
            <Label>Logo link</Label>
            <Input
              className="mt-1"
              value={data.logo.href}
              onChange={(e) =>
                setData({ ...data, logo: { ...data.logo, href: e.target.value } })
              }
            />
          </div>
        </div>
        <div>
          <Label>Logo image URL (optional)</Label>
          <Input
            className="mt-1"
            value={data.logo.imageUrl ?? ""}
            onChange={(e) =>
              setData({
                ...data,
                logo: { ...data.logo, imageUrl: e.target.value || undefined },
              })
            }
            placeholder="Leave blank to use text logo"
          />
          <ImageUploader
            onUploaded={(url) =>
              setData({ ...data, logo: { ...data.logo, imageUrl: url } })
            }
          />
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Main navigation</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="navMode"
            checked={data.navigationMode === "custom"}
            onChange={() => setData({ ...data, navigationMode: "custom" })}
          />
          Custom menu (edit below)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="navMode"
            checked={data.navigationMode === "collections"}
            onChange={() => setData({ ...data, navigationMode: "collections" })}
          />
          Auto-generate from collections
        </label>
        {data.navigationMode === "custom" && (
          <MegaMenuEditor
            items={data.navigation}
            onChange={(navigation) => setData({ ...data, navigation })}
          />
        )}
      </section>

      <section className="border-t pt-6">
        <LinkListEditor
          label="Extra header links (e.g. Sale)"
          links={data.extraLinks.map((l) => ({
            label: l.label,
            href: l.href,
          }))}
          onChange={(links) =>
            setData({
              ...data,
              extraLinks: links.map((l, i) => ({
                ...l,
                highlight: data.extraLinks[i]?.highlight ?? l.label.toLowerCase() === "sale",
              })),
            })
          }
        />
      </section>

      <Button type="button" variant="luxury" disabled={loading} onClick={save}>
        {loading ? "Saving..." : "Save header"}
      </Button>
    </div>
  );
}
