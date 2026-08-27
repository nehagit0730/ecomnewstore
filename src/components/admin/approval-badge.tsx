import type { ProductApprovalStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const styles: Record<ProductApprovalStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-amber-100 text-amber-900",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const labels: Record<ProductApprovalStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function ApprovalBadge({ status }: { status: ProductApprovalStatus }) {
  return (
    <span className={cn("inline-flex rounded-sm px-2 py-0.5 text-xs font-medium", styles[status])}>
      {labels[status]}
    </span>
  );
}
