"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SizeChartData = {
  title: string;
  content: string;
};

export function SizeChartEditor({ initial }: { initial: SizeChartData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      className="max-w-2xl space-y-4 border bg-background p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        try {
          await adminFetch("/settings/size-chart", {
            method: "PUT",
            body: JSON.stringify({
              title: fd.get("title"),
              content: fd.get("content"),
            }),
          });
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to save");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div>
        <h2 className="font-medium">Global size chart</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Shown when a product has no custom size chart. Use plain text; line breaks are preserved.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <Label htmlFor="sizeChartTitle">Panel title</Label>
        <Input
          id="sizeChartTitle"
          name="title"
          required
          defaultValue={initial.title}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="sizeChartContent">Size chart content</Label>
        <Textarea
          id="sizeChartContent"
          name="content"
          required
          defaultValue={initial.content}
          className="mt-1 min-h-[220px] font-mono text-xs leading-relaxed"
        />
      </div>
      <Button type="submit" variant="luxury" disabled={loading}>
        {loading ? "Saving..." : "Save size chart"}
      </Button>
    </form>
  );
}
