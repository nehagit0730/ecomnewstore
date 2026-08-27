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
import type { HomepageConfig, HomepageProductRow } from "@/types/store-theme";

type PickerOption = { handle: string; title: string };

function defaultRowHref(sourceType: HomepageProductRow["sourceType"], handle: string) {
  return sourceType === "collection"
    ? `/collections/${handle}`
    : `/search?category=${handle}`;
}

export function HomepageLayoutEditor({
  initial,
  collections,
  categories,
}: {
  initial: HomepageConfig;
  collections: PickerOption[];
  categories: PickerOption[];
}) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await adminFetch("/settings/homepage", {
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
        <h2 className="font-medium text-lg">Homepage</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Hero, category tiles, and product rows on the home page.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Hero banner</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Title</Label>
            <Input
              className="mt-1"
              value={data.hero.title}
              onChange={(e) =>
                setData({ ...data, hero: { ...data.hero, title: e.target.value } })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Subtitle</Label>
            <Input
              className="mt-1"
              value={data.hero.subtitle ?? ""}
              onChange={(e) =>
                setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })
              }
            />
          </div>
          <div>
            <Label>Primary CTA label</Label>
            <Input
              className="mt-1"
              value={data.hero.ctaLabel ?? ""}
              onChange={(e) =>
                setData({ ...data, hero: { ...data.hero, ctaLabel: e.target.value } })
              }
            />
          </div>
          <div>
            <Label>Primary CTA link</Label>
            <Input
              className="mt-1"
              value={data.hero.ctaHref ?? ""}
              onChange={(e) =>
                setData({ ...data, hero: { ...data.hero, ctaHref: e.target.value } })
              }
            />
          </div>
          <div>
            <Label>Secondary CTA label</Label>
            <Input
              className="mt-1"
              value={data.hero.secondaryCtaLabel ?? ""}
              onChange={(e) =>
                setData({
                  ...data,
                  hero: { ...data.hero, secondaryCtaLabel: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Secondary CTA link</Label>
            <Input
              className="mt-1"
              value={data.hero.secondaryCtaHref ?? ""}
              onChange={(e) =>
                setData({
                  ...data,
                  hero: { ...data.hero, secondaryCtaHref: e.target.value },
                })
              }
            />
          </div>
        </div>
        <div>
          <Label>Background image</Label>
          <Input
            className="mt-1"
            value={data.hero.imageUrl}
            onChange={(e) =>
              setData({ ...data, hero: { ...data.hero, imageUrl: e.target.value } })
            }
          />
          <ImageUploader
            onUploaded={(url) =>
              setData({ ...data, hero: { ...data.hero, imageUrl: url } })
            }
          />
        </div>
        <LinkListEditor
          label="Hero quick links"
          links={data.quickLinks}
          onChange={(quickLinks) => setData({ ...data, quickLinks })}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest">Featured categories</h3>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={data.featuredSection.enabled}
            onCheckedChange={(v) =>
              setData({
                ...data,
                featuredSection: { ...data.featuredSection, enabled: !!v },
              })
            }
          />
          Show featured category section
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder="Eyebrow"
            value={data.featuredSection.eyebrow}
            onChange={(e) =>
              setData({
                ...data,
                featuredSection: { ...data.featuredSection, eyebrow: e.target.value },
              })
            }
          />
          <Input
            placeholder="Title"
            value={data.featuredSection.title}
            onChange={(e) =>
              setData({
                ...data,
                featuredSection: { ...data.featuredSection, title: e.target.value },
              })
            }
          />
          <Input
            className="sm:col-span-2"
            placeholder="Subtitle"
            value={data.featuredSection.subtitle}
            onChange={(e) =>
              setData({
                ...data,
                featuredSection: { ...data.featuredSection, subtitle: e.target.value },
              })
            }
          />
          <Input
            placeholder="Link label"
            value={data.featuredSection.linkLabel}
            onChange={(e) =>
              setData({
                ...data,
                featuredSection: { ...data.featuredSection, linkLabel: e.target.value },
              })
            }
          />
          <Input
            placeholder="Link href"
            value={data.featuredSection.linkHref}
            onChange={(e) =>
              setData({
                ...data,
                featuredSection: { ...data.featuredSection, linkHref: e.target.value },
              })
            }
          />
        </div>
        <div className="space-y-3">
          <Label>Category tiles</Label>
          {data.featuredSection.tiles.map((tile, i) => (
            <div key={i} className="border rounded-sm p-3 space-y-2 bg-secondary/20">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Collection handle (e.g. women)"
                  value={tile.handle}
                  onChange={(e) => {
                    const tiles = [...data.featuredSection.tiles];
                    tiles[i] = { ...tile, handle: e.target.value };
                    setData({
                      ...data,
                      featuredSection: { ...data.featuredSection, tiles },
                    });
                  }}
                />
                <Input
                  placeholder="Title override (optional)"
                  value={tile.title ?? ""}
                  onChange={(e) => {
                    const tiles = [...data.featuredSection.tiles];
                    tiles[i] = { ...tile, title: e.target.value || undefined };
                    setData({
                      ...data,
                      featuredSection: { ...data.featuredSection, tiles },
                    });
                  }}
                />
                <Input
                  className="sm:col-span-2"
                  placeholder="Tagline"
                  value={tile.tagline}
                  onChange={(e) => {
                    const tiles = [...data.featuredSection.tiles];
                    tiles[i] = { ...tile, tagline: e.target.value };
                    setData({
                      ...data,
                      featuredSection: { ...data.featuredSection, tiles },
                    });
                  }}
                />
                <Input
                  className="sm:col-span-2"
                  placeholder="Image URL override (optional)"
                  value={tile.imageUrl ?? ""}
                  onChange={(e) => {
                    const tiles = [...data.featuredSection.tiles];
                    tiles[i] = { ...tile, imageUrl: e.target.value || undefined };
                    setData({
                      ...data,
                      featuredSection: { ...data.featuredSection, tiles },
                    });
                  }}
                />
                <ImageUploader
                  onUploaded={(url) => {
                    const tiles = [...data.featuredSection.tiles];
                    tiles[i] = { ...tile, imageUrl: url };
                    setData({
                      ...data,
                      featuredSection: { ...data.featuredSection, tiles },
                    });
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={!!tile.featured}
                    onCheckedChange={(v) => {
                      const tiles = data.featuredSection.tiles.map((t, j) => ({
                        ...t,
                        featured: j === i ? !!v : false,
                      }));
                      setData({
                        ...data,
                        featuredSection: { ...data.featuredSection, tiles },
                      });
                    }}
                  />
                  Large featured tile
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={!!tile.accent}
                    onCheckedChange={(v) => {
                      const tiles = [...data.featuredSection.tiles];
                      tiles[i] = { ...tile, accent: !!v };
                      setData({
                        ...data,
                        featuredSection: { ...data.featuredSection, tiles },
                      });
                    }}
                  />
                  Sale badge
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() =>
                    setData({
                      ...data,
                      featuredSection: {
                        ...data.featuredSection,
                        tiles: data.featuredSection.tiles.filter((_, j) => j !== i),
                      },
                    })
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setData({
                ...data,
                featuredSection: {
                  ...data.featuredSection,
                  tiles: [
                    ...data.featuredSection.tiles,
                    { handle: "", tagline: "" },
                  ],
                },
              })
            }
          >
            Add tile
          </Button>
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest">Product rows</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Products are loaded only from the selected collection or category.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const handle = collections[0]?.handle ?? "new-arrivals";
              setData({
                ...data,
                productRows: [
                  ...data.productRows,
                  {
                    id: String(Date.now()),
                    enabled: true,
                    eyebrow: "Featured",
                    title: "Products",
                    subtitle: "",
                    href: defaultRowHref("collection", handle),
                    sourceType: "collection",
                    sourceHandle: handle,
                    muted: false,
                  },
                ],
              });
            }}
          >
            Add row
          </Button>
        </div>
        {data.productRows.map((row, i) => (
          <div key={row.id} className="border rounded-sm p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={row.enabled}
                onCheckedChange={(v) => {
                  const productRows = [...data.productRows];
                  productRows[i] = { ...row, enabled: !!v };
                  setData({ ...data, productRows });
                }}
              />
              Enabled
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Eyebrow"
                value={row.eyebrow}
                onChange={(e) => {
                  const productRows = [...data.productRows];
                  productRows[i] = { ...row, eyebrow: e.target.value };
                  setData({ ...data, productRows });
                }}
              />
              <Input
                placeholder="Title"
                value={row.title}
                onChange={(e) => {
                  const productRows = [...data.productRows];
                  productRows[i] = { ...row, title: e.target.value };
                  setData({ ...data, productRows });
                }}
              />
              <Input
                className="sm:col-span-2"
                placeholder="Subtitle"
                value={row.subtitle}
                onChange={(e) => {
                  const productRows = [...data.productRows];
                  productRows[i] = { ...row, subtitle: e.target.value };
                  setData({ ...data, productRows });
                }}
              />
              <div>
                <Label className="text-xs">Show products from</Label>
                <div className="mt-1 grid gap-2 sm:grid-cols-2">
                  <select
                    className="h-9 rounded-sm border px-2 text-sm w-full"
                    value={row.sourceType}
                    onChange={(e) => {
                      const sourceType = e.target.value as HomepageProductRow["sourceType"];
                      const options = sourceType === "collection" ? collections : categories;
                      const handle = options[0]?.handle ?? row.sourceHandle;
                      const productRows = [...data.productRows];
                      productRows[i] = {
                        ...row,
                        sourceType,
                        sourceHandle: handle,
                        href: defaultRowHref(sourceType, handle),
                      };
                      setData({ ...data, productRows });
                    }}
                  >
                    <option value="collection">Collection</option>
                    <option value="category">Category</option>
                  </select>
                  <select
                    className="h-9 rounded-sm border px-2 text-sm w-full"
                    value={row.sourceHandle}
                    onChange={(e) => {
                      const handle = e.target.value;
                      const productRows = [...data.productRows];
                      productRows[i] = {
                        ...row,
                        sourceHandle: handle,
                        href: defaultRowHref(row.sourceType, handle),
                      };
                      setData({ ...data, productRows });
                    }}
                  >
                    {(row.sourceType === "collection" ? collections : categories).map(
                      (opt) => (
                        <option key={opt.handle} value={opt.handle}>
                          {opt.title}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              <Input
                className="sm:col-span-2"
                placeholder="View all link"
                value={row.href}
                onChange={(e) => {
                  const productRows = [...data.productRows];
                  productRows[i] = { ...row, href: e.target.value };
                  setData({ ...data, productRows });
                }}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={row.muted}
                onCheckedChange={(v) => {
                  const productRows = [...data.productRows];
                  productRows[i] = { ...row, muted: !!v };
                  setData({ ...data, productRows });
                }}
              />
              Muted background
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() =>
                setData({
                  ...data,
                  productRows: data.productRows.filter((_, j) => j !== i),
                })
              }
            >
              Remove row
            </Button>
          </div>
        ))}
      </section>

      <Button type="button" variant="luxury" disabled={loading} onClick={save}>
        {loading ? "Saving..." : "Save homepage"}
      </Button>
    </div>
  );
}
