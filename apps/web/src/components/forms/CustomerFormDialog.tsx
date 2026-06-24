"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EntityFormDialog } from "@/components/forms/EntityFormDialog";
import { toast } from "@/hooks/use-toast";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | Date | null;
  notes: string | null;
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerRecord | null;
}

function toDateInputValue(value: string | Date | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const router = useRouter();
  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: customer?.name ?? "",
        email: customer?.email ?? "",
        phone: customer?.phone ?? "",
        dateOfBirth: toDateInputValue(customer?.dateOfBirth ?? null),
        notes: customer?.notes ?? "",
      });
    }
  }, [open, customer, reset]);

  async function onSubmit(data: CustomerInput) {
    const url = isEdit ? `/api/customers/${customer!.id}` : "/api/customers";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast({
        variant: "destructive",
        title: "Couldn't save customer",
        description:
          typeof json.error === "string" ? json.error : "Please check the form and try again.",
      });
      return;
    }

    toast({ variant: "success", title: isEdit ? "Customer updated" : "Customer added" });
    onOpenChange(false);
    router.refresh();
  }

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Customer" : "New Customer"}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Add customer"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="cust-name">Name</Label>
        <Input id="cust-name" placeholder="Jane Smith" error={errors.name?.message} {...register("name")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cust-email">Email</Label>
          <Input
            id="cust-email"
            type="email"
            placeholder="jane@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cust-phone">Phone</Label>
          <Input id="cust-phone" error={errors.phone?.message} {...register("phone")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cust-dob">Date of Birth</Label>
        <Input
          id="cust-dob"
          type="date"
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cust-notes">Notes</Label>
        <Textarea id="cust-notes" error={errors.notes?.message} {...register("notes")} />
      </div>
    </EntityFormDialog>
  );
}
