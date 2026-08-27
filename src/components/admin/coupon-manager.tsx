"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Coupon } from "@prisma/client";

export function CouponManager({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-10">
      <form
        className="max-w-xl space-y-4 border bg-background p-6 rounded-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setLoading(true);
          const fd = new FormData(e.currentTarget);
          try {
            await adminFetch("/coupons", {
              method: "POST",
              body: JSON.stringify({
                code: fd.get("code"),
                type: fd.get("type"),
                value: Number(fd.get("value")),
                minOrderAmount: fd.get("minOrderAmount")
                  ? Number(fd.get("minOrderAmount"))
                  : undefined,
                maxUses: fd.get("maxUses") ? Number(fd.get("maxUses")) : undefined,
                expiresAt: fd.get("expiresAt") || undefined,
                isActive: fd.get("isActive") === "on",
              }),
            });
            (e.target as HTMLFormElement).reset();
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create coupon");
          } finally {
            setLoading(false);
          }
        }}
      >
        <h2 className="font-medium">Create coupon</h2>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Code</Label>
            <Input name="code" required placeholder="VELOIRE10" className="mt-1 uppercase" />
          </div>
          <div>
            <Label>Type</Label>
            <select
              name="type"
              className="mt-1 flex h-10 w-full rounded-sm border border-input bg-background px-3 text-sm"
              defaultValue="PERCENTAGE"
            >
              <option value="PERCENTAGE">Percentage off</option>
              <option value="FIXED">Fixed amount (₹)</option>
            </select>
          </div>
          <div>
            <Label>Value</Label>
            <Input name="value" type="number" required placeholder="10" className="mt-1" />
          </div>
          <div>
            <Label>Min order (₹)</Label>
            <Input name="minOrderAmount" type="number" placeholder="1999" className="mt-1" />
          </div>
          <div>
            <Label>Max uses</Label>
            <Input name="maxUses" type="number" placeholder="100" className="mt-1" />
          </div>
          <div>
            <Label>Expires</Label>
            <Input name="expiresAt" type="date" className="mt-1" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="isActive" defaultChecked />
          Active on storefront
        </label>
        <Button type="submit" variant="luxury" disabled={loading}>
          {loading ? "Creating..." : "Create coupon"}
        </Button>
      </form>

      <div className="border bg-background rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">Code</th>
              <th className="p-3 font-medium">Discount</th>
              <th className="p-3 font-medium">Usage</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono font-medium">{c.code}</td>
                <td className="p-3">
                  {c.type === "PERCENTAGE"
                    ? `${Number(c.value)}%`
                    : formatPrice(Number(c.value))}
                  {c.minOrderAmount && (
                    <span className="block text-xs text-muted-foreground">
                      Min {formatPrice(Number(c.minOrderAmount))}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {c.usedCount}
                  {c.maxUses ? ` / ${c.maxUses}` : ""}
                </td>
                <td className="p-3 capitalize">{c.isActive ? "Active" : "Inactive"}</td>
                <td className="p-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (!confirm(`Delete coupon ${c.code}?`)) return;
                      await adminFetch(`/coupons/${c.id}`, { method: "DELETE" });
                      router.refresh();
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!initial.length && (
          <p className="p-6 text-sm text-muted-foreground text-center">No coupons yet.</p>
        )}
      </div>
    </div>
  );
}
