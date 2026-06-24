"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { locationSchema, type LocationInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EntityFormDialog } from "@/components/forms/EntityFormDialog";
import { toast } from "@/hooks/use-toast";

export interface LocationRecord {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
}

interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: LocationRecord | null;
}

export function LocationFormDialog({ open, onOpenChange, location }: LocationFormDialogProps) {
  const router = useRouter();
  const isEdit = !!location;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LocationInput>({
    resolver: zodResolver(locationSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: location?.name ?? "",
        address: location?.address ?? "",
        city: location?.city ?? "",
        province: location?.province ?? "",
        postalCode: location?.postalCode ?? "",
        phone: location?.phone ?? "",
        email: location?.email ?? "",
      });
    }
  }, [open, location, reset]);

  async function onSubmit(data: LocationInput) {
    const url = isEdit ? `/api/locations/${location!.id}` : "/api/locations";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast({
        variant: "destructive",
        title: "Couldn't save location",
        description:
          typeof json.error === "string" ? json.error : "Please check the form and try again.",
      });
      return;
    }

    toast({
      variant: "success",
      title: isEdit ? "Location updated" : "Location added",
    });
    onOpenChange(false);
    router.refresh();
  }

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Location" : "New Location"}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Add location"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="loc-name">Name</Label>
        <Input id="loc-name" placeholder="Downtown Clinic" error={errors.name?.message} {...register("name")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="loc-address">Address</Label>
        <Input id="loc-address" placeholder="123 Main St" error={errors.address?.message} {...register("address")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="loc-city">City</Label>
          <Input id="loc-city" error={errors.city?.message} {...register("city")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="loc-province">Province</Label>
          <Input id="loc-province" error={errors.province?.message} {...register("province")} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="loc-postal">Postal Code</Label>
          <Input id="loc-postal" error={errors.postalCode?.message} {...register("postalCode")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="loc-phone">Phone</Label>
          <Input id="loc-phone" error={errors.phone?.message} {...register("phone")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="loc-email">Email</Label>
        <Input
          id="loc-email"
          type="email"
          placeholder="location@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>
    </EntityFormDialog>
  );
}
