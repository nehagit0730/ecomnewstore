"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  productId: string;
  className?: string;
  size?: "sm" | "md";
};

export function WishlistButton({
  productId,
  className,
  size = "md",
}: WishlistButtonProps) {
  const hydrated = useHydrated();
  const { has, toggle } = useWishlistStore();
  const isActive = hydrated && has(productId);
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 p-2 shadow-sm transition-colors hover:bg-white",
        className
      )}
      aria-label={isActive ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          iconSize,
          "transition-colors",
          isActive ? "fill-destructive text-destructive" : "text-foreground"
        )}
      />
    </motion.button>
  );
}
