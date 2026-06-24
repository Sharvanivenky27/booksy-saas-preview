"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { serviceSchema, type ServiceInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EntityFormDialog } from "@/components/forms/EntityFormDialog";
import { toast } from "@/hooks/use-toast";

export interface ServiceRecord {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  duration: number;
  price: number | string;
  currency: string;
  isActive: boolean;
}

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceRecord | null;
}

export function ServiceFormDialog({ open, onOpenChange, service }: ServiceFormDialogProps) {
  const router = useRouter();
  const isEdit = !!service;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: service?.name ?? "",
        category: service?.category ?? "",
        description: service?.description ?? "",
        duration: service?.duration ?? 30,
        price: service ? Number(service.price) : 0,
        currency: service?.currency ?? "CAD",
      });
    }
  }, [open, service, reset]);

  async function onSubmit(data: ServiceInput) {
    const url = isEdit ? `/api/services/${service!.id}` : "/api/services";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast({
        variant: "destructive",
        title: "Couldn't save service",
        description:
          typeof json.error === "string" ? json.error : "Please check the form and try again.",
      });
      return;
    }

    toast({ variant: "success", title: isEdit ? "Service updated" : "Service added" });
    onOpenChange(false);
    router.refresh();
  }

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Service" : "New Service"}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Add service"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="svc-name">Name</Label>
        <Input id="svc-name" placeholder="Haircut" error={errors.name?.message} {...register("name")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="svc-category">Category</Label>
        <Input id="svc-category" placeholder="Hair" error={errors.category?.message} {...register("category")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="svc-description">Description</Label>
        <Textarea id="svc-description" error={errors.description?.message} {...register("description")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="svc-duration">Duration (min)</Label>
          <Input
            id="svc-duration"
            type="number"
            min={5}
            error={errors.duration?.message}
            {...register("duration")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="svc-price">Price (CAD)</Label>
          <Input
            id="svc-price"
            type="number"
            step="0.01"
            min={0}
            error={errors.price?.message}
            {...register("price")}
          />
        </div>
      </div>
    </EntityFormDialog>
  );
}
