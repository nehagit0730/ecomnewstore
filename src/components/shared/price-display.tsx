import { formatPrice, calculateDiscount } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type PriceDisplayProps = {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  className?: string;
};

export function PriceDisplay({
  price,
  compareAtPrice,
  size = "md",
  showBadge = false,
  className,
}: PriceDisplayProps) {
  const discount = calculateDiscount(price, compareAtPrice);
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className={cn("font-semibold", sizeClasses[size])}>
        {formatPrice(price)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <>
          <span className="text-muted-foreground line-through text-sm">
            {formatPrice(compareAtPrice)}
          </span>
          {showBadge && discount && (
            <Badge variant="sale">{discount}% OFF</Badge>
          )}
        </>
      )}
    </div>
  );
}
