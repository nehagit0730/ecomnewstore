"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { instagramImage } from "@/lib/catalog-images";

const INSTAGRAM_IMAGES = [0, 1, 2, 3, 4, 5].map((i) => instagramImage(i));

export function InstagramFeed() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <SectionHeading
            title="@veloire"
            subtitle="Follow us on Instagram for style inspiration"
            align="center"
          />
        </ScrollReveal>
      </div>

      <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-0.5">
        {INSTAGRAM_IMAGES.map((src, i) => (
          <motion.a
            key={src}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <Image
              src={src}
              alt={`Instagram post ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 16vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
              <Instagram className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
