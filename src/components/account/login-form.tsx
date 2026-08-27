"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithCredentials } from "@/server/actions/auth";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState("");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account/profile";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "customer@veloire.com",
      password: "Customer@123",
    },
  });

  const fillCustomer = () => {
    setValue("email", "customer@veloire.com");
    setValue("password", "Customer@123");
  };

  const onSubmit = async (data: FormData) => {
    setAuthError("");
    const result = await loginWithCredentials({
      email: data.email,
      password: data.password,
    });
    if (result?.error) {
      setAuthError(result.error);
      return;
    }
    // Full navigation so session cookie is sent before middleware runs
    window.location.href = callbackUrl;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      {authError && (
        <p className="rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {authError}
        </p>
      )}

      <div className="rounded-sm border border-border/80 bg-secondary/50 p-3 text-xs text-muted-foreground flex items-center justify-between">
        <div>
          <span className="font-semibold text-foreground">Demo Customer:</span> customer@veloire.com
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fillCustomer}
          className="h-6 text-[11px] px-2 bg-background"
        >
          Auto-fill
        </Button>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" className="mt-1.5" {...register("email")} />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" className="mt-1.5" {...register("password")} />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" variant="luxury" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        <Link href="/account/forgot-password" className="hover:underline">
          Forgot password?
        </Link>
      </p>
      <p className="text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{" "}
        <Link href="/account/register" className="font-medium text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
