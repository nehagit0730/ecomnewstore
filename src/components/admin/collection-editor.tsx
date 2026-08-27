"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type CollectionData = {
  id?: string;
  title: string;
  handle: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  productIds: string[];
};

export function CollectionEditor({
  initial,
  allProducts,
}: {
  initial?: CollectionData;
  allProducts: { id: string; title: string; handle: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initial?.productIds ?? []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title")),
      handle: String(fd.get("handle")),
      description: String(fd.get("description") || "") || undefined,
      image: String(fd.get("image") || "") || undefined,
      isActive: fd.get("isActive") === "on",
      sortOrder: Number(fd.get("sortOrder") ?? 0),
      productIds: selected,
    };

    try {
      if (initial?.id) {
        await adminFetch(`/collections/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch("/collections", { method: "POST", body: JSON.stringify(payload) });
      }
      router.push("/admin/collections");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6 border bg-background p-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Title</Label>
          <Input name="title" required defaultValue={initial?.title} className="mt-1" />
        </div>
        <div>
          <Label>Handle</Label>
          <Input
            name="handle"
            required
            pattern="[a-z0-9-]+"
            defaultValue={initial?.handle}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea name="description" defaultValue={initial?.description ?? ""} className="mt-1" />
      </div>
      <div>
        <Label>Hero image URL</Label>
        <Input name="image" type="url" defaultValue={initial?.image ?? ""} className="mt-1" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="isActive" defaultChecked={initial?.isActive ?? true} />
          Active
        </label>
        <div>
          <Label>Sort order</Label>
          <Input
            name="sortOrder"
            type="number"
            defaultValue={initial?.sortOrder ?? 0}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label className="mb-2 block">Products in collection</Label>
        <div className="max-h-64 overflow-y-auto border p-3 space-y-2">
          {allProducts.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={(e) => {
                  setSelected((prev) =>
                    e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                  );
                }}
              />
              {p.title} <span className="text-muted-foreground">({p.handle})</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" variant="luxury" disabled={loading}>
        Save collection
      </Button>
    </form>
  );
}
