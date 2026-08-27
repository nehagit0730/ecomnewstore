"use client";

import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/utils";

type PriceRangeSliderProps = {
  boundsMin: number;
  boundsMax: number;
  valueMin: number;
  valueMax: number;
  onCommit: (min: number, max: number) => void;
};

export function PriceRangeSlider({
  boundsMin,
  boundsMax,
  valueMin,
  valueMax,
  onCommit,
}: PriceRangeSliderProps) {
  const [range, setRange] = useState<[number, number]>([valueMin, valueMax]);

  useEffect(() => {
    setRange([valueMin, valueMax]);
  }, [valueMin, valueMax]);

  if (boundsMax <= boundsMin) {
    return (
      <p className="text-xs text-muted-foreground">
        {formatPrice(boundsMin)} — {formatPrice(boundsMax)}
      </p>
    );
  }

  const step = boundsMax - boundsMin > 2000 ? 100 : 50;

  return (
    <>
      <Slider
        min={boundsMin}
        max={boundsMax}
        step={step}
        value={range}
        onValueChange={(values) => {
          const min = values[0] ?? boundsMin;
          const max = values[1] ?? boundsMax;
          setRange([Math.min(min, max), Math.max(min, max)]);
        }}
        onValueCommit={(values) => {
          const min = values[0] ?? boundsMin;
          const max = values[1] ?? boundsMax;
          onCommit(Math.min(min, max), Math.max(min, max));
        }}
        className="mb-3"
      />
      <p className="text-xs text-muted-foreground">
        {formatPrice(range[0])} — {formatPrice(range[1])}
      </p>
    </>
  );
}
