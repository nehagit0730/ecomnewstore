"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { vendorFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";

export function VendorSubmitButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await vendorFetch(`/products/${productId}/submit`, { method: "POST" });
          router.refresh();
        } catch (e) {
          alert(e instanceof Error ? e.message : "Failed");
        } finally {
          setLoading(false);
        }
      }}
    >
      Submit for approval
    </Button>
  );
}
