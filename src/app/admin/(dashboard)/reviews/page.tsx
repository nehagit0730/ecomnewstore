import { adminReviewService } from "@/server/services/admin-review.service";
import { ReviewManager } from "@/components/admin/review-manager";

export default async function AdminReviewsPage() {
  const reviews = await adminReviewService.list();

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Customer reviews</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Moderate, edit, and publish reviews submitted on product pages.
      </p>
      <ReviewManager initial={reviews} />
    </div>
  );
}
