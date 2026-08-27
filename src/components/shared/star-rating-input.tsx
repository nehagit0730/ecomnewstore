"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
};

export function StarRatingInput({
  value,
  onChange,
  size = "md",
  disabled = false,
  className,
}: StarRatingInputProps) {
  const iconSize =
    size === "sm" ? "h-5 w-5" : size === "lg" ? "h-7 w-7" : "h-6 w-6";

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="group"
      aria-label="Rating"
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className={cn(
              "rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              disabled && "pointer-events-none opacity-60"
            )}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                iconSize,
                filled ? "fill-gold text-gold" : "fill-muted/40 text-muted-foreground/50"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
