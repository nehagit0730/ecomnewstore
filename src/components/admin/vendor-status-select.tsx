"use client";

import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import type { VendorStatus } from "@prisma/client";

const statuses: VendorStatus[] = ["PENDING", "ACTIVE", "SUSPENDED"];

export function VendorStatusSelect({
  vendorId,
  current,
}: {
  vendorId: string;
  current: VendorStatus;
}) {
  const router = useRouter();

  return (
    <select
      value={current}
      className="h-8 rounded-sm border border-input bg-background px-2 text-xs"
      onChange={async (e) => {
        try {
          await adminFetch(`/vendors/${vendorId}`, {
            method: "PATCH",
            body: JSON.stringify({ status: e.target.value }),
          });
          router.refresh();
        } catch (err) {
          alert(err instanceof Error ? err.message : "Update failed");
        }
      }}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
