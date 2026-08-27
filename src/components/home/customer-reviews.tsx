"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RatingStars } from "@/components/shared/rating-stars";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import type { ProductReview } from "@/types/review";

export function CustomerReviews({ reviews }: { reviews: ProductReview[] }) {
  if (!reviews.length) return null;

  return (
    <section className="border-t border-border/60 bg-secondary/20">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <ScrollReveal>
          <SectionHeading
            title="What Our Customers Say"
            subtitle="Real reviews from verified shoppers"
            align="center"
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review, i) => (
            <ScrollReveal key={review.id} delay={i * 0.1}>
              <motion.article
                whileHover={{ y: -4 }}
                className="rounded-sm border border-border/70 bg-background p-6 h-full flex flex-col shadow-sm"
              >
                <RatingStars rating={review.rating} size="md" />
                {review.title && (
                  <h3 className="mt-4 text-sm font-medium leading-snug">{review.title}</h3>
                )}
                <p className="mt-3 text-sm leading-relaxed text-foreground/90 flex-1">
                  &ldquo;{review.body}&rdquo;
                </p>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <p className="text-sm font-medium">{review.author.name}</p>
                  {review.product && (
                    <Link
                      href={`/products/${review.product.handle}`}
                      className="text-xs text-muted-foreground mt-0.5 hover:text-foreground transition-colors line-clamp-1"
                    >
                      {review.product.title}
                    </Link>
                  )}
                </div>
              </motion.article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
