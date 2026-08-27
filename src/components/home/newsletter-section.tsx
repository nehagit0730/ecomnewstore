"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type FormData = z.infer<typeof schema>;

export function NewsletterSection() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
  };

  return (
    <section className="border-t bg-secondary/20">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <ScrollReveal>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-serif text-2xl md:text-3xl">Join the Veloire Club</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe for exclusive offers, early access to new drops, and style tips.
            </p>

            {submitted ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-sm font-medium text-gold"
              >
                Thank you for subscribing!
              </motion.p>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start"
              >
                <div className="flex-1 text-left">
                  <Label htmlFor="newsletter-email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className="h-12"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="luxury"
                  disabled={isSubmitting}
                  className="h-12 shrink-0"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
