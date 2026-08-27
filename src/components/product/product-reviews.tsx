"use client";

import { useEffect, useState } from "react";
import { ProductReviewForm } from "@/components/product/product-review-form";
import { RatingStars } from "@/components/shared/rating-stars";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import type { ProductReview } from "@/types/review";
import { cn } from "@/lib/utils";

function formatReviewDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

type ProductReviewsProps = {
  productHandle: string;
  productTitle: string;
  rating: number;
  reviewCount: number;
  initialReviews?: ProductReview[];
  initialUserReview?: ProductReview | null;
};

function ReviewCard({ review }: { review: ProductReview }) {
  const initials = review.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="rounded-sm border border-border/70 bg-card/30 p-5 md:p-6 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold uppercase tracking-wide"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{review.author.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatReviewDate(review.createdAt)}
            </p>
          </div>
        </div>
        <RatingStars rating={review.rating} size="sm" />
      </div>

      {review.title && (
        <h4 className="mt-4 text-sm font-medium leading-snug">{review.title}</h4>
      )}
      <p className={cn("text-sm leading-relaxed text-foreground/90", review.title ? "mt-2" : "mt-4")}>
        {review.body}
      </p>
    </article>
  );
}

export function ProductReviews({
  productHandle,
  productTitle,
  rating,
  reviewCount,
  initialReviews = [],
  initialUserReview = null,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [userReview, setUserReview] = useState<ProductReview | null>(initialUserReview);

  useEffect(() => {
    setReviews(initialReviews);
    setUserReview(initialUserReview);
  }, [initialReviews, initialUserReview]);

  const handleSaved = (saved: ProductReview) => {
    setUserReview(saved);
    if (!saved.isApproved) return;
    setReviews((prev) => {
      const without = prev.filter((r) => r.id !== saved.id);
      return [saved, ...without];
    });
  };

  return (
    <section id="reviews" className="scroll-mt-28">
      <ScrollReveal>
        <SectionHeading
          eyebrow="Customer feedback"
          title="Reviews"
          subtitle={`What shoppers say about ${productTitle}`}
        />
      </ScrollReveal>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-sm border border-border/60 bg-secondary/25 px-5 py-4">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-4xl leading-none">{rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">out of 5</span>
        </div>
        <RatingStars rating={rating} reviewCount={reviewCount} showCount size="md" />
      </div>

      <div className="mt-8">
        <ProductReviewForm
          productHandle={productHandle}
          initialReview={userReview}
          onSaved={handleSaved}
        />
      </div>

      <div className="mt-10 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {reviews.length
            ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}`
            : "No reviews yet"}
        </h3>

        {reviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review, i) => (
              <ScrollReveal key={review.id} delay={i * 0.05}>
                <ReviewCard review={review} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-border/70 bg-background/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Be the first to review this product.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
