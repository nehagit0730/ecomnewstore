"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const navigate = (dir: number) => {
    setActiveIndex((prev) => (prev + dir + images.length) % images.length);
  };

  if (!images.length) return null;

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[72px_1fr] lg:gap-4">
        <div className="hidden lg:flex flex-col gap-2 order-2 lg:order-1">
          {images.map((img, i) => (
            <button
              key={`thumb-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-[3/4] w-[72px] overflow-hidden rounded-sm ring-1 transition-all",
                activeIndex === i
                  ? "ring-foreground opacity-100"
                  : "ring-border/60 opacity-60 hover:opacity-100 hover:ring-foreground/30"
              )}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="72px" />
            </button>
          ))}
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary ring-1 ring-border/50">
            <button
              type="button"
              className="absolute inset-0 z-0 cursor-zoom-in"
              onClick={() => setZoomOpen(true)}
              aria-label="Open image gallery"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[activeIndex]}
                    alt={`${title} — view ${activeIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </button>

            {images.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 h-9 w-9 rounded-full bg-background/90 shadow-sm hidden sm:flex"
                  onClick={() => navigate(-1)}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 h-9 w-9 rounded-full bg-background/90 shadow-sm hidden sm:flex"
                  onClick={() => navigate(1)}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-background/90 shadow-sm"
              onClick={() => setZoomOpen(true)}
              aria-label="Zoom image"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {images.length > 1 && (
              <span className="absolute bottom-3 left-3 z-10 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium tabular-nums tracking-wide shadow-sm">
                {activeIndex + 1} / {images.length}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:hidden">
            {images.map((img, i) => (
              <button
                key={`mobile-thumb-${i}`}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative h-[4.5rem] w-14 shrink-0 overflow-hidden rounded-sm ring-1 transition-all",
                  activeIndex === i
                    ? "ring-foreground"
                    : "ring-border/50 opacity-70"
                )}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={images[activeIndex]}
              alt={title}
              fill
              className="object-contain"
              sizes="90vw"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                  onClick={() => navigate(-1)}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                  onClick={() => navigate(1)}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="absolute right-4 top-4 text-white hover:opacity-80"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
