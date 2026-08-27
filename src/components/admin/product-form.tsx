"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, vendorFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/admin/image-uploader";

export type ProductFormInitial = {
  id: string;
  title: string;
  handle: string;
  description: string;
  brand: string;
  categoryId: string | null;
  materials: string | null;
  careInstructions: string | null;
  shippingInfo: string | null;
  returnPolicy: string | null;
  sizeChart: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  approvalStatus: string;
  images: { url: string }[];
  variants: {
    sku: string;
    colorName: string;
    colorSlug: string;
    colorHex: string | null;
    sizeLabel: string;
    sizeValue: string;
    price: { toString(): string };
    compareAtPrice: { toString(): string } | null;
    inventory: { quantity: number } | null;
  }[];
};

type ProductFormProps = {
  mode: "admin" | "vendor";
  categories: { id: string; name: string }[];
  initial?: ProductFormInitial;
};

export function ProductForm({ mode, categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState(
    initial?.images.map((i) => i.url).join("\n") ?? ""
  );
  const isEdit = !!initial;
  const v0 = initial?.variants[0];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const parsedImageUrls = imageUrls
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: String(fd.get("title")),
      handle: String(fd.get("handle")),
      description: String(fd.get("description")),
      brand: String(fd.get("brand")),
      categoryId: String(fd.get("categoryId") || "") || undefined,
      materials: String(fd.get("materials") || "") || undefined,
      careInstructions: String(fd.get("careInstructions") || "") || undefined,
      shippingInfo: String(fd.get("shippingInfo") || "") || undefined,
      returnPolicy: String(fd.get("returnPolicy") || "") || undefined,
      sizeChart: String(fd.get("sizeChart") || "") || undefined,
      imageUrls: parsedImageUrls,
      variants: [
        {
          sku: String(fd.get("sku")),
          colorName: String(fd.get("colorName")),
          colorSlug: String(fd.get("colorSlug")),
          colorHex: String(fd.get("colorHex") || "#000000"),
          sizeLabel: String(fd.get("sizeLabel")),
          sizeValue: String(fd.get("sizeValue")),
          price: Number(fd.get("price")),
          compareAtPrice: fd.get("compareAtPrice")
            ? Number(fd.get("compareAtPrice"))
            : undefined,
          quantity: Number(fd.get("quantity") ?? 0),
        },
      ],
      ...(mode === "admin" && !isEdit
        ? { approvalStatus: "APPROVED" as const, isActive: true }
        : {}),
      ...(mode === "admin" && isEdit
        ? {
            approvalStatus: initial!.approvalStatus,
            isActive: fd.get("isActive") === "on",
            isFeatured: fd.get("isFeatured") === "on",
            isNew: fd.get("isNew") === "on",
            isTrending: fd.get("isTrending") === "on",
            isBestSeller: fd.get("isBestSeller") === "on",
          }
        : {}),
    };

    try {
      if (mode === "admin") {
        if (isEdit) {
          await adminFetch(`/products/${initial!.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await adminFetch("/products", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
        router.push("/admin/products");
      } else if (isEdit) {
        await vendorFetch(`/products/${initial!.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        router.push("/vendor/products");
      } else {
        const product = await vendorFetch<{ id: string }>("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await vendorFetch(`/products/${product.id}/submit`, { method: "POST" });
        router.push("/vendor/products");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initial || !confirm("Delete this product permanently?")) return;
    setLoading(true);
    try {
      await adminFetch(`/products/${initial.id}`, { method: "DELETE" });
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6 border bg-background p-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={initial?.title}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="handle">Handle (url slug)</Label>
          <Input
            id="handle"
            name="handle"
            required
            pattern="[a-z0-9-]+"
            defaultValue={initial?.handle}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={initial?.description}
          className="mt-1 min-h-[120px]"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            name="brand"
            required
            defaultValue={initial?.brand}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initial?.categoryId ?? ""}
            className="mt-1 flex h-10 w-full rounded-sm border border-input bg-background px-3 text-sm"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="border-t pt-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest">Storefront product details</p>
        <p className="text-sm text-muted-foreground -mt-2">
          Shown on the product page tabs. Leave size chart empty to use the global chart from Store
          content.
        </p>
        <div>
          <Label htmlFor="materials">Materials</Label>
          <Textarea
            id="materials"
            name="materials"
            defaultValue={initial?.materials ?? ""}
            className="mt-1 min-h-[72px]"
          />
        </div>
        <div>
          <Label htmlFor="careInstructions">Care instructions</Label>
          <Textarea
            id="careInstructions"
            name="careInstructions"
            defaultValue={initial?.careInstructions ?? ""}
            className="mt-1 min-h-[72px]"
          />
        </div>
        <div>
          <Label htmlFor="shippingInfo">Shipping</Label>
          <Textarea
            id="shippingInfo"
            name="shippingInfo"
            defaultValue={initial?.shippingInfo ?? ""}
            className="mt-1 min-h-[72px]"
          />
        </div>
        <div>
          <Label htmlFor="returnPolicy">Returns</Label>
          <Textarea
            id="returnPolicy"
            name="returnPolicy"
            defaultValue={initial?.returnPolicy ?? ""}
            className="mt-1 min-h-[72px]"
          />
        </div>
        <div>
          <Label htmlFor="sizeChart">Size chart (optional override)</Label>
          <Textarea
            id="sizeChart"
            name="sizeChart"
            defaultValue={initial?.sizeChart ?? ""}
            placeholder="Leave blank to use the global size chart from Admin → Store content"
            className="mt-1 min-h-[160px] font-mono text-xs"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="imageUrls">Image URLs (one per line)</Label>
        <ImageUploader
          onUploaded={(url) =>
            setImageUrls((prev) => (prev ? `${prev}\n${url}` : url))
          }
        />
        <Textarea
          id="imageUrls"
          name="imageUrls"
          required
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
          className="mt-2 font-mono text-xs min-h-[80px]"
        />
      </div>
      <div className="border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4">Primary variant</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" required defaultValue={v0?.sku} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="price">Price (INR)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              required
              defaultValue={v0 ? Number(v0.price) : undefined}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="compareAtPrice">Compare at price</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              defaultValue={v0?.compareAtPrice ? Number(v0.compareAtPrice) : undefined}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="colorName">Color</Label>
            <Input
              id="colorName"
              name="colorName"
              required
              defaultValue={v0?.colorName}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="colorSlug">Color slug</Label>
            <Input
              id="colorSlug"
              name="colorSlug"
              required
              defaultValue={v0?.colorSlug}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="colorHex">Color hex</Label>
            <Input
              id="colorHex"
              name="colorHex"
              defaultValue={v0?.colorHex ?? "#000000"}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="sizeLabel">Size label</Label>
            <Input
              id="sizeLabel"
              name="sizeLabel"
              defaultValue={v0?.sizeLabel ?? "M"}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="sizeValue">Size value</Label>
            <Input
              id="sizeValue"
              name="sizeValue"
              defaultValue={v0?.sizeValue ?? "M"}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="quantity">Stock</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              defaultValue={v0?.inventory?.quantity ?? 10}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {mode === "admin" && isEdit && (
        <div className="border-t pt-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest">Storefront flags</p>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="isActive" defaultChecked={initial?.isActive} />
            Active on store
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="isFeatured" defaultChecked={initial?.isFeatured} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="isNew" defaultChecked={initial?.isNew} />
            New arrival
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="isTrending" defaultChecked={initial?.isTrending} />
            Trending
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="isBestSeller" defaultChecked={initial?.isBestSeller} />
            Best seller
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="luxury" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Save changes" : mode === "vendor" ? "Save & submit" : "Publish"}
        </Button>
        {mode === "admin" && isEdit && (
          <Button type="button" variant="outline" disabled={loading} onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
