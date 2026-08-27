"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Profile = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
};

export function ProfileForm({ initial }: { initial: Profile }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    reset({
      firstName: initial.firstName ?? "",
      lastName: initial.lastName ?? "",
      phone: initial.phone ?? "",
    });
  }, [initial, reset]);

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Failed to save");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Profile</h1>
      {saved && <p className="mb-4 text-sm text-emerald-700">Profile saved successfully.</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" className="mt-1.5" {...register("firstName")} />
            {errors.firstName && (
              <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" className="mt-1.5" {...register("lastName")} />
            {errors.lastName && (
              <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <Input value={initial.email} disabled className="mt-1.5 bg-secondary" />
        </div>
        <div>
          <Label htmlFor="profile-phone">Phone</Label>
          <Input id="profile-phone" className="mt-1.5" {...register("phone")} />
        </div>
        <Button type="submit" variant="luxury" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
