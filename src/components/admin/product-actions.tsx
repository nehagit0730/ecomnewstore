"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductApproveButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      size="sm"
      variant="default"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await adminFetch(`/products/${productId}/approve`, { method: "POST" });
          router.refresh();
        } catch (e) {
          alert(e instanceof Error ? e.message : "Failed");
        } finally {
          setLoading(false);
        }
      }}
    >
      Approve
    </Button>
  );
}

export function ProductRejectButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        placeholder="Rejection reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="h-8 text-xs"
      />
      <Button
        size="sm"
        variant="outline"
        disabled={loading || reason.length < 3}
        onClick={async () => {
          setLoading(true);
          try {
            await adminFetch(`/products/${productId}/reject`, {
              method: "POST",
              body: JSON.stringify({ reason }),
            });
            router.refresh();
          } catch (e) {
            alert(e instanceof Error ? e.message : "Failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        Reject
      </Button>
    </div>
  );
}
