"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateVendorForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await adminFetch("/vendors", {
        method: "POST",
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
          firstName: fd.get("firstName"),
          lastName: fd.get("lastName"),
          shopName: fd.get("shopName"),
          slug: fd.get("slug"),
          status: "ACTIVE",
        }),
      });
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 border bg-background p-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>First name</Label>
          <Input name="firstName" required className="mt-1" />
        </div>
        <div>
          <Label>Last name</Label>
          <Input name="lastName" required className="mt-1" />
        </div>
      </div>
      <div>
        <Label>Email</Label>
        <Input name="email" type="email" required className="mt-1" />
      </div>
      <div>
        <Label>Password</Label>
        <Input name="password" type="password" required minLength={8} className="mt-1" />
      </div>
      <div>
        <Label>Shop name</Label>
        <Input name="shopName" required className="mt-1" />
      </div>
      <div>
        <Label>Shop slug (lowercase, hyphens)</Label>
        <Input name="slug" required pattern="[a-z0-9-]+" className="mt-1" />
      </div>
      <Button type="submit" variant="luxury" disabled={loading}>
        Create vendor
      </Button>
    </form>
  );
}
