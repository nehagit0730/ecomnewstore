"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/admin/image-uploader";
import { LinkListEditor } from "@/components/admin/link-list-editor";
import type { MegaMenuItem } from "@/types/store-theme";

export function MegaMenuEditor({
  items,
  onChange,
}: {
  items: MegaMenuItem[];
  onChange: (items: MegaMenuItem[]) => void;
}) {
  const updateItem = (index: number, patch: Partial<MegaMenuItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Navigation menu</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...items,
              {
                label: "New menu",
                href: "/collections",
                columns: [{ title: "Shop", links: [] }],
              },
            ])
          }
        >
          Add menu item
        </Button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="border rounded-sm p-4 space-y-4 bg-background">
          <div className="flex justify-between items-start gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Menu {i + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              Delete
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Label</Label>
              <Input
                className="mt-1"
                value={item.label}
                onChange={(e) => updateItem(i, { label: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Main link</Label>
              <Input
                className="mt-1"
                value={item.href}
                onChange={(e) => updateItem(i, { href: e.target.value })}
              />
            </div>
          </div>

          {item.columns.map((col, ci) => (
            <div key={ci} className="border-t pt-3">
              <div className="flex gap-2 items-end mb-2">
                <div className="flex-1">
                  <Label className="text-xs">Column title</Label>
                  <Input
                    className="mt-1"
                    value={col.title}
                    onChange={(e) => {
                      const columns = [...item.columns];
                      columns[ci] = { ...col, title: e.target.value };
                      updateItem(i, { columns });
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateItem(i, {
                      columns: item.columns.filter((_, j) => j !== ci),
                    })
                  }
                >
                  Remove column
                </Button>
              </div>
              <LinkListEditor
                label="Links"
                links={col.links}
                onChange={(links) => {
                  const columns = [...item.columns];
                  columns[ci] = { ...col, links };
                  updateItem(i, { columns });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              updateItem(i, {
                columns: [...item.columns, { title: "Links", links: [] }],
              })
            }
          >
            Add column
          </Button>

          <div className="border-t pt-3 space-y-2">
            <Label className="text-xs">Featured image block (optional)</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Title"
                value={item.featured?.title ?? ""}
                onChange={(e) =>
                  updateItem(i, {
                    featured: {
                      title: e.target.value,
                      subtitle: item.featured?.subtitle ?? "",
                      image: item.featured?.image ?? "",
                      href: item.featured?.href ?? item.href,
                    },
                  })
                }
              />
              <Input
                placeholder="Subtitle"
                value={item.featured?.subtitle ?? ""}
                onChange={(e) =>
                  updateItem(i, {
                    featured: {
                      title: item.featured?.title ?? item.label,
                      subtitle: e.target.value,
                      image: item.featured?.image ?? "",
                      href: item.featured?.href ?? item.href,
                    },
                  })
                }
              />
              <Input
                className="sm:col-span-2"
                placeholder="Image URL"
                value={item.featured?.image ?? ""}
                onChange={(e) =>
                  updateItem(i, {
                    featured: {
                      title: item.featured?.title ?? item.label,
                      subtitle: item.featured?.subtitle ?? "",
                      image: e.target.value,
                      href: item.featured?.href ?? item.href,
                    },
                  })
                }
              />
              <ImageUploader
                onUploaded={(url) =>
                  updateItem(i, {
                    featured: {
                      title: item.featured?.title ?? item.label,
                      subtitle: item.featured?.subtitle ?? "",
                      image: url,
                      href: item.featured?.href ?? item.href,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
