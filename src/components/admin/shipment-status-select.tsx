"use client";

import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import type { ShipmentStatus } from "@prisma/client";

const statuses: ShipmentStatus[] = [
  "PENDING",
  "LABEL_CREATED",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
];

const LABELS: Record<ShipmentStatus, string> = {
  PENDING: "Pending",
  LABEL_CREATED: "Label created",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  FAILED: "Failed",
};

export function ShipmentStatusSelect({
  orderId,
  current,
  trackingNumber,
}: {
  orderId: string;
  current: ShipmentStatus;
  trackingNumber?: string | null;
}) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-widest">Shipment</label>
        <select
          value={current}
          className="h-8 rounded-sm border border-input bg-background px-2 text-xs"
          onChange={async (e) => {
            try {
              await adminFetch(`/orders/${orderId}/shipment`, {
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
              {LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const tracking = String(fd.get("tracking") || "").trim();
          try {
            await adminFetch(`/orders/${orderId}/shipment`, {
              method: "PATCH",
              body: JSON.stringify({ trackingNumber: tracking || null }),
            });
            router.refresh();
          } catch (err) {
            alert(err instanceof Error ? err.message : "Update failed");
          }
        }}
      >
        <input
          name="tracking"
          defaultValue={trackingNumber ?? ""}
          placeholder="Tracking number"
          className="h-8 flex-1 min-w-[180px] rounded-sm border border-input bg-background px-2 text-xs"
        />
        <button
          type="submit"
          className="h-8 rounded-sm border px-3 text-xs hover:bg-secondary"
        >
          Save tracking
        </button>
      </form>
    </div>
  );
}
