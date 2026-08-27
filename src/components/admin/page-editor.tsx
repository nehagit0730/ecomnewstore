"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type PageData = {
  id?: string;
  title: string;
  handle: string;
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
  showInFooter: boolean;
  sortOrder: number;
};

export function PageEditor({ initial }: { initial?: PageData }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title")),
      handle: String(fd.get("handle")),
      body: String(fd.get("body")),
      seoTitle: String(fd.get("seoTitle") || "") || undefined,
      seoDescription: String(fd.get("seoDescription") || "") || undefined,
      isPublished: fd.get("isPublished") === "on",
      showInFooter: fd.get("showInFooter") === "on",
      sortOrder: Number(fd.get("sortOrder") ?? 0),
    };

    try {
      if (initial?.id) {
        await adminFetch(`/pages/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch("/pages", { method: "POST", body: JSON.stringify(payload) });
      }
      router.push("/admin/pages");
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
          <Label>Handle (/pages/...)</Label>
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
        <Label>Body (HTML or markdown)</Label>
        <Textarea
          name="body"
          required
          defaultValue={initial?.body}
          className="mt-1 min-h-[280px] font-mono text-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>SEO title</Label>
          <Input name="seoTitle" defaultValue={initial?.seoTitle ?? ""} className="mt-1" />
        </div>
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
        <Label>SEO description</Label>
        <Textarea
          name="seoDescription"
          defaultValue={initial?.seoDescription ?? ""}
          className="mt-1"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        Published
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="showInFooter" defaultChecked={initial?.showInFooter ?? false} />
        Show in footer
      </label>
      <Button type="submit" variant="luxury" disabled={loading}>
        {loading ? "Saving..." : "Save page"}
      </Button>
    </form>
  );
}
