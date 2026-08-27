"use client";

import { cn } from "@/lib/utils";
import type { ProductColor, ProductSize } from "@/types/product";
import { SizeChartDialog } from "./size-chart-dialog";

type VariantSelectorProps = {
  colors: ProductColor[];
  sizes: ProductSize[];
  selectedColor: string;
  selectedSize: string;
  onColorChange: (slug: string) => void;
  onSizeChange: (size: string) => void;
  sizeChartTitle: string;
  sizeChartContent: string;
};

export function VariantSelector({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
  sizeChartTitle,
  sizeChartContent,
}: VariantSelectorProps) {
  const selectedColorName = colors.find((c) => c.slug === selectedColor)?.name;

  return (
    <div className="space-y-7">
      {colors.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
              Color
            </p>
            <span className="text-sm text-muted-foreground">{selectedColorName}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => (
              <button
                key={color.slug}
                type="button"
                onClick={() => onColorChange(color.slug)}
                className={cn(
                  "h-9 w-9 rounded-full border-2 transition-all",
                  selectedColor === color.slug
                    ? "border-foreground scale-105 ring-2 ring-offset-2 ring-foreground/20"
                    : "border-border hover:border-foreground/50"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={`Color ${color.name}`}
                aria-pressed={selectedColor === color.slug}
              />
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
              Size
            </p>
            <SizeChartDialog title={sizeChartTitle} content={sizeChartContent} />
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size.value}
                type="button"
                disabled={!size.inStock}
                onClick={() => onSizeChange(size.value)}
                aria-pressed={selectedSize === size.value}
                className={cn(
                  "min-w-[3rem] rounded-sm border px-3.5 py-2.5 text-sm font-medium transition-colors",
                  selectedSize === size.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:border-foreground/60",
                  !size.inStock && "opacity-35 cursor-not-allowed line-through"
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
