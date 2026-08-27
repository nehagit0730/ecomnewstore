"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().regex(/^\d{6}$/),
  phone: z.string().regex(/^[6-9]\d{9}$/),
});

type FormData = z.infer<typeof schema>;

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
};

export function AddressesManager({
  initial,
  profile,
}: {
  initial: Address[];
  profile: { firstName: string | null; lastName: string | null; phone: string | null };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openAdd = () => {
    setEditing(null);
    reset({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      phone: profile.phone ?? "",
    });
    setOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    reset({
      firstName: addr.firstName,
      lastName: addr.lastName,
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      phone: addr.phone,
    });
    setOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    const url = editing ? `/api/account/addresses/${editing.id}` : "/api/account/addresses";
    const method = editing ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setOpen(false);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl">Addresses</h1>
        <Button variant="outline" size="sm" onClick={openAdd}>
          Add address
        </Button>
      </div>

      {initial.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center border rounded-sm">
          No saved addresses. Add one or complete checkout to save an address.
        </p>
      ) : (
        <div className="space-y-4">
          {initial.map((addr) => (
            <div key={addr.id} className="border rounded-sm p-4 relative bg-card">
              {addr.isDefault && (
                <span className="absolute top-4 right-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Default
                </span>
              )}
              <p className="font-medium">
                {addr.firstName} {addr.lastName}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {addr.line1}
                {addr.line2 && <>, {addr.line2}</>}
                <br />
                {addr.city}, {addr.state} {addr.postalCode}
                <br />
                +91 {addr.phone}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await fetch(`/api/account/addresses/${addr.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isDefault: true }),
                      });
                      router.refresh();
                    }}
                  >
                    Set default
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => openEdit(addr)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={async () => {
                    if (!confirm("Delete this address?")) return;
                    await fetch(`/api/account/addresses/${addr.id}`, { method: "DELETE" });
                    router.refresh();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit address" : "Add address"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First name</Label>
                <Input className="mt-1.5" {...register("firstName")} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input className="mt-1.5" {...register("lastName")} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input className="mt-1.5" {...register("line1")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input className="mt-1.5" {...register("city")} />
              </div>
              <div>
                <Label>State</Label>
                <Input className="mt-1.5" {...register("state")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PIN code</Label>
                <Input className="mt-1.5" {...register("postalCode")} />
                {errors.postalCode && (
                  <p className="text-xs text-destructive mt-1">{errors.postalCode.message}</p>
                )}
              </div>
              <div>
                <Label>Mobile</Label>
                <Input className="mt-1.5" {...register("phone")} />
              </div>
            </div>
            <Button type="submit" variant="luxury" className="w-full">
              {editing ? "Save address" : "Add address"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
