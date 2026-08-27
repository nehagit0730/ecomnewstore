"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import type { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithCredentials } from "@/server/actions/auth";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

type PortalLoginFormProps = {
  requiredRole: Extract<UserRole, "SUPER_ADMIN" | "VENDOR">;
  defaultCallbackUrl: string;
  wrongRoleMessage: string;
};

export function PortalLoginForm({
  requiredRole,
  defaultCallbackUrl,
}: PortalLoginFormProps) {
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState("");
  const callbackUrl = searchParams.get("callbackUrl") ?? defaultCallbackUrl;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: requiredRole === "SUPER_ADMIN" ? "admin@veloire.com" : "vendor@veloire.com",
      password: requiredRole === "SUPER_ADMIN" ? "Admin@123" : "Vendor@123",
    },
  });

  const fillAdmin = (email: string, pass: string) => {
    setValue("email", email);
    setValue("password", pass);
  };

  const onSubmit = async (data: FormData) => {
    setAuthError("");
    const result = await loginWithCredentials({
      email: data.email,
      password: data.password,
      requiredRole,
    });

    if (result?.error) {
      setAuthError(result.error);
      return;
    }

    // Direct redirect to ensure cookies and middleware sync
    window.location.href = callbackUrl;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {authError && (
        <p className="rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {authError}
        </p>
      )}

      <div className="rounded-sm border border-border/80 bg-secondary/50 p-3 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center justify-between font-medium text-foreground">
          <span>Demo Credentials</span>
          <span className="text-[10px] text-muted-foreground uppercase">Click to fill</span>
        </div>
        {requiredRole === "SUPER_ADMIN" ? (
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillAdmin("admin@veloire.com", "Admin@123")}
              className="h-7 text-xs px-2.5 bg-background"
            >
              admin@veloire.com
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillAdmin("rahul@prowebcoder.com", "Admin@123")}
              className="h-7 text-xs px-2.5 bg-background"
            >
              rahul@prowebcoder.com
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillAdmin("vendor@veloire.com", "Vendor@123")}
              className="h-7 text-xs px-2.5 bg-background"
            >
              vendor@veloire.com
            </Button>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1.5"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="mt-1.5"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" variant="luxury" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Back to storefront
        </Link>
      </p>
    </form>
  );
}

