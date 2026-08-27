"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { StarRatingInput } from "@/components/shared/star-rating-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductReview } from "@/types/review";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type ProductReviewFormProps = {
  productHandle: string;
  initialReview?: ProductReview | null;
  onSaved?: (review: ProductReview) => void;
};

export function ProductReviewForm({
  productHandle,
  initialReview,
  onSaved,
}: ProductReviewFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [title, setTitle] = useState(initialReview?.title ?? "");
  const [body, setBody] = useState(initialReview?.body ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(
    JSON.stringify({
      rating: initialReview?.rating ?? 0,
      title: initialReview?.title ?? "",
      body: initialReview?.body ?? "",
    })
  );

  const loginUrl = `/account/login?callbackUrl=${encodeURIComponent(
    `/products/${productHandle}#reviews`
  )}`;

  const saveReview = useCallback(
    async (payload: { rating: number; title: string; body: string }) => {
      if (!session?.user) {
        router.push(loginUrl);
        return;
      }
      if (payload.rating < 1 || payload.body.trim().length < 10) return;

      const snapshot = JSON.stringify(payload);
      if (snapshot === lastSavedRef.current) return;

      setSaveStatus("saving");
      setError("");

      try {
        const res = await fetch(`/api/products/${productHandle}/reviews`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: payload.rating,
            title: payload.title.trim() || undefined,
            body: payload.body.trim(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to save review");
        }
        lastSavedRef.current = snapshot;
        setSaveStatus("saved");
        onSaved?.(data as ProductReview);
        router.refresh();
      } catch (err) {
        setSaveStatus("error");
        setError(err instanceof Error ? err.message : "Failed to save review");
      }
    },
    [productHandle, onSaved, router, session?.user, loginUrl]
  );

  const scheduleSave = useCallback(
    (nextRating: number, nextTitle: string, nextBody: string) => {
      if (!session?.user) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void saveReview({ rating: nextRating, title: nextTitle, body: nextBody });
      }, 1200);
    },
    [saveReview, session?.user]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setTitle(initialReview.title ?? "");
      setBody(initialReview.body);
      lastSavedRef.current = JSON.stringify({
        rating: initialReview.rating,
        title: initialReview.title ?? "",
        body: initialReview.body,
      });
    }
  }, [initialReview]);

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const canSubmit = rating >= 1 && body.trim().length >= 10;

  return (
    <form
      className="rounded-sm border border-border/70 bg-card/40 p-5 md:p-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        void saveReview({ rating, title, body });
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-sm uppercase tracking-[0.15em]">
            {initialReview ? "Update your review" : "Write a review"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isLoggedIn
              ? "Your review saves automatically as you write."
              : "Fill in your review below, then sign in to publish it."}
          </p>
        </div>
        {isLoggedIn && (
          <span
            className={cn(
              "text-[11px] font-medium uppercase tracking-wider",
              saveStatus === "saving" && "text-muted-foreground",
              saveStatus === "saved" && "text-emerald-700",
              saveStatus === "error" && "text-destructive"
            )}
          >
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Save failed"}
          </span>
        )}
      </div>

      {!isLoggedIn && status !== "loading" && (
        <div className="rounded-sm bg-secondary/40 border border-border/60 px-4 py-3 text-sm text-muted-foreground">
          <Link href={loginUrl} className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to publish your review. You can still draft it below.
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Your rating
        </Label>
        <StarRatingInput
          value={rating}
          onChange={(next) => {
            setRating(next);
            scheduleSave(next, title, body);
          }}
          size="lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title" className="text-xs uppercase tracking-wider text-muted-foreground">
          Headline <span className="normal-case tracking-normal">(optional)</span>
        </Label>
        <Input
          id="review-title"
          value={title}
          maxLength={120}
          placeholder="Summarize your experience"
          onChange={(e) => {
            const next = e.target.value;
            setTitle(next);
            scheduleSave(rating, next, body);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-body" className="text-xs uppercase tracking-wider text-muted-foreground">
          Your review
        </Label>
        <Textarea
          id="review-body"
          value={body}
          rows={4}
          maxLength={2000}
          placeholder="What did you like or dislike? How was the fit and quality?"
          onChange={(e) => {
            const next = e.target.value;
            setBody(next);
            scheduleSave(rating, title, next);
          }}
        />
        <p className="text-[11px] text-muted-foreground text-right">
          {body.length}/2000 · min. 10 characters
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoggedIn ? (
        <Button type="submit" variant="luxury" disabled={!canSubmit || saveStatus === "saving"}>
          {saveStatus === "saving" ? "Saving…" : initialReview ? "Save changes" : "Publish review"}
        </Button>
      ) : (
        <Button type="submit" variant="luxury" disabled={!canSubmit}>
          Sign in to publish review
        </Button>
      )}
    </form>
  );
}
