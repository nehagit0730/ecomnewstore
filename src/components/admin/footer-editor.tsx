"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LinkListEditor } from "@/components/admin/link-list-editor";
import { TRUST_ICON_OPTIONS } from "@/lib/trust-icons";
import type { FooterConfig, FooterColumn, TrustIconKey } from "@/types/store-theme";

export function FooterEditor({ initial }: { initial: FooterConfig }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    const payload = {
      ...data,
      brand: {
        ...data.brand,
        socialLinks: data.brand.socialLinks.filter((s) => s.platform && s.url),
      },
    };
    try {
      await adminFetch("/settings/footer", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const updateColumn = (index: number, col: FooterColumn) => {
    const columns = [...data.columns];
    columns[index] = col;
    setData({ ...data, columns });
  };

  return (
    <div className="space-y-8 border bg-background p-6 rounded-sm">
      <div>
        <h2 className="font-medium text-lg">Footer</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Brand block, link columns, trust bar, newsletter, and legal links.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Brand</h3>
        <Textarea
          value={data.brand.description}
          onChange={(e) =>
            setData({ ...data, brand: { ...data.brand, description: e.target.value } })
          }
          className="min-h-[80px]"
        />
        <div className="space-y-2">
          <Label>Social links</Label>
          {data.brand.socialLinks.map((s, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="instagram"
                value={s.platform}
                onChange={(e) => {
                  const socialLinks = [...data.brand.socialLinks];
                  socialLinks[i] = { ...s, platform: e.target.value };
                  setData({ ...data, brand: { ...data.brand, socialLinks } });
                }}
              />
              <Input
                placeholder="https://..."
                value={s.url}
                onChange={(e) => {
                  const socialLinks = [...data.brand.socialLinks];
                  socialLinks[i] = { ...s, url: e.target.value };
                  setData({ ...data, brand: { ...data.brand, socialLinks } });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setData({
                ...data,
                brand: {
                  ...data.brand,
                  socialLinks: [...data.brand.socialLinks, { platform: "", url: "" }],
                },
              })
            }
          >
            Add social link
          </Button>
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest">Link columns</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setData({
                ...data,
                columns: [...data.columns, { title: "New column", links: [] }],
              })
            }
          >
            Add column
          </Button>
        </div>
        {data.columns.map((col, i) => (
          <div key={i} className="border rounded-sm p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                value={col.title}
                onChange={(e) => updateColumn(i, { ...col, title: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setData({ ...data, columns: data.columns.filter((_, j) => j !== i) })
                }
              >
                Remove
              </Button>
            </div>
            <LinkListEditor
              label="Links"
              links={col.links}
              onChange={(links) => updateColumn(i, { ...col, links })}
            />
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={data.mergeCmsPages}
            onCheckedChange={(v) => setData({ ...data, mergeCmsPages: !!v })}
          />
          Merge CMS pages (Admin → Pages) into footer
        </label>
        {data.mergeCmsPages && (
          <Input
            placeholder="Column title for CMS pages"
            value={data.cmsColumnTitle}
            onChange={(e) => setData({ ...data, cmsColumnTitle: e.target.value })}
          />
        )}
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Trust bar</h3>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={data.trustBar.enabled}
            onCheckedChange={(v) =>
              setData({ ...data, trustBar: { ...data.trustBar, enabled: !!v } })
            }
          />
          Show trust bar above footer
        </label>
        <Input
          value={data.trustBar.heading}
          onChange={(e) =>
            setData({
              ...data,
              trustBar: { ...data.trustBar, heading: e.target.value },
            })
          }
        />
        {data.trustBar.items.map((item, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-4 border rounded-sm p-3">
            <select
              className="h-9 rounded-sm border px-2 text-sm"
              value={item.icon}
              onChange={(e) => {
                const items = [...data.trustBar.items];
                items[i] = { ...item, icon: e.target.value as TrustIconKey };
                setData({ ...data, trustBar: { ...data.trustBar, items } });
              }}
            >
              {TRUST_ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Input
              placeholder="Title"
              value={item.title}
              onChange={(e) => {
                const items = [...data.trustBar.items];
                items[i] = { ...item, title: e.target.value };
                setData({ ...data, trustBar: { ...data.trustBar, items } });
              }}
            />
            <Input
              className="sm:col-span-2"
              placeholder="Description"
              value={item.desc}
              onChange={(e) => {
                const items = [...data.trustBar.items];
                items[i] = { ...item, desc: e.target.value };
                setData({ ...data, trustBar: { ...data.trustBar, items } });
              }}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setData({
              ...data,
              trustBar: {
                ...data.trustBar,
                items: [
                  ...data.trustBar.items,
                  { icon: "truck", title: "New benefit", desc: "Description" },
                ],
              },
            })
          }
        >
          Add trust item
        </Button>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Newsletter</h3>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={data.newsletter.enabled}
            onCheckedChange={(v) =>
              setData({ ...data, newsletter: { ...data.newsletter, enabled: !!v } })
            }
          />
          Show newsletter signup
        </label>
        <Input
          value={data.newsletter.title}
          onChange={(e) =>
            setData({
              ...data,
              newsletter: { ...data.newsletter, title: e.target.value },
            })
          }
        />
        <Input
          value={data.newsletter.subtitle}
          onChange={(e) =>
            setData({
              ...data,
              newsletter: { ...data.newsletter, subtitle: e.target.value },
            })
          }
        />
        <Input
          value={data.newsletter.buttonLabel}
          onChange={(e) =>
            setData({
              ...data,
              newsletter: { ...data.newsletter, buttonLabel: e.target.value },
            })
          }
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Legal bar</h3>
        <div>
          <Label>Support email</Label>
          <Input
            className="mt-1"
            value={data.legal.supportEmail}
            onChange={(e) =>
              setData({ ...data, legal: { ...data.legal, supportEmail: e.target.value } })
            }
          />
        </div>
        <LinkListEditor
          label="Bottom links"
          links={data.legal.links}
          onChange={(links) =>
            setData({ ...data, legal: { ...data.legal, links } })
          }
        />
      </section>

      <Button type="button" variant="luxury" disabled={loading} onClick={save}>
        {loading ? "Saving..." : "Save footer"}
      </Button>
    </div>
  );
}
