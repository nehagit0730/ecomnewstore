"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateCategoryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="max-w-md space-y-4 border bg-background p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        try {
          await adminFetch("/categories", {
            method: "POST",
            body: JSON.stringify({
              name: fd.get("name"),
              slug: fd.get("slug"),
            }),
          });
          router.refresh();
          (e.target as HTMLFormElement).reset();
        } catch (err) {
          alert(err instanceof Error ? err.message : "Failed");
        } finally {
          setLoading(false);
        }
      }}
    >
      <h2 className="font-medium">Add category</h2>
      <div>
        <Label>Name</Label>
        <Input name="name" required className="mt-1" />
      </div>
      <div>
        <Label>Slug</Label>
        <Input name="slug" required pattern="[a-z0-9-]+" className="mt-1" />
      </div>
      <Button type="submit" variant="luxury" disabled={loading}>
        Add
      </Button>
    </form>
  );
}
