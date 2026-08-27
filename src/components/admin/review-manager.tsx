"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
function formatReviewDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
import { adminFetch } from "@/lib/admin-fetch";
import { RatingStars } from "@/components/shared/rating-stars";
import { StarRatingInput } from "@/components/shared/star-rating-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProductReview } from "@/types/review";

export function ReviewManager({ initial }: { initial: ProductReview[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<{
    rating: number;
    title: string;
    body: string;
    isApproved: boolean;
  } | null>(null);

  const startEdit = (review: ProductReview) => {
    setEditingId(review.id);
    setDraft({
      rating: review.rating,
      title: review.title ?? "",
      body: review.body,
      isApproved: review.isApproved,
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
    setError("");
  };

  const saveEdit = async () => {
    if (!editingId || !draft) return;
    setLoading(true);
    setError("");
    try {
      await adminFetch(`/reviews/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          rating: draft.rating,
          title: draft.title.trim() || null,
          body: draft.body,
          isApproved: draft.isApproved,
        }),
      });
      cancelEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review");
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (review: ProductReview) => {
    setLoading(true);
    setError("");
    try {
      await adminFetch(`/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isApproved: !review.isApproved }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setLoading(true);
    setError("");
    try {
      await adminFetch(`/reviews/${id}`, { method: "DELETE" });
      if (editingId === id) cancelEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setLoading(false);
    }
  };

  if (!initial.length) {
    return (
      <p className="text-sm text-muted-foreground border bg-background p-8 rounded-sm text-center">
        No customer reviews yet. Reviews appear here when shoppers rate products on the storefront.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="border bg-background rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Rating</th>
              <th className="p-3 font-medium">Review</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {initial.map((review) => (
              <tr key={review.id} className="border-t align-top">
                <td className="p-3">
                  {review.product ? (
                    <Link
                      href={`/products/${review.product.handle}`}
                      className="font-medium hover:underline"
                      target="_blank"
                    >
                      {review.product.title}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {formatReviewDate(review.createdAt)}
                  </p>
                </td>
                <td className="p-3">{review.author.name}</td>
                <td className="p-3">
                  <RatingStars rating={review.rating} size="sm" />
                </td>
                <td className="p-3 max-w-xs">
                  {review.title && <p className="font-medium mb-1">{review.title}</p>}
                  <p className="text-muted-foreground line-clamp-3">{review.body}</p>
                </td>
                <td className="p-3">
                  <span
                    className={
                      review.isApproved
                        ? "text-emerald-700 text-xs font-medium uppercase tracking-wide"
                        : "text-amber-700 text-xs font-medium uppercase tracking-wide"
                    }
                  >
                    {review.isApproved ? "Published" : "Hidden"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      onClick={() => startEdit(review)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      onClick={() => toggleApproval(review)}
                    >
                      {review.isApproved ? "Hide" : "Publish"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={loading}
                      onClick={() => deleteReview(review.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && draft && (
        <div className="border bg-background p-6 rounded-sm space-y-4 max-w-2xl">
          <h2 className="font-medium">Edit review</h2>
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRatingInput
              value={draft.rating}
              onChange={(rating) => setDraft({ ...draft, rating })}
            />
          </div>
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Review text</Label>
            <Textarea
              rows={5}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={draft.isApproved}
              onCheckedChange={(checked) =>
                setDraft({ ...draft, isApproved: checked === true })
              }
            />
            Published on storefront
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="luxury" disabled={loading} onClick={saveEdit}>
              {loading ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
