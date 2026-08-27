"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { promoImage } from "@/lib/catalog-images";

export function PromoBanner() {
  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <ScrollReveal>
        <div className="relative overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square md:aspect-auto md:min-h-[400px]">
              <Image
                src={promoImage()}
                alt="Summer Sale"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center bg-primary text-primary-foreground p-8 md:p-16">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-xs uppercase tracking-[0.3em] mb-3"
              >
                Limited Time
              </motion.p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl">
                Up to 40% Off
              </h2>
              <p className="mt-4 text-sm text-primary-foreground/80 max-w-sm">
                Refresh your wardrobe with our biggest sale of the season.
                Premium quality at unbeatable prices.
              </p>
              <Button
                variant="luxury"
                className="mt-8 w-fit bg-white text-foreground hover:bg-white/90"
                asChild
              >
                <Link href="/collections/sale">Shop the Sale</Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
