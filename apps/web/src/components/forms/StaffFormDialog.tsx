"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { staffSchema, type StaffInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntityFormDialog } from "@/components/forms/EntityFormDialog";
import { toast } from "@/hooks/use-toast";

export interface StaffRecord {
  id: string;
  isActive: boolean;
  bio: string | null;
  locationId: string | null;
  user: { id: string; name: string; email: string; phone: string | null };
}

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffRecord | null;
  locations: { id: string; name: string }[];
}

export function StaffFormDialog({ open, onOpenChange, staff, locations }: StaffFormDialogProps) {
  const router = useRouter();
  const isEdit = !!staff;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StaffInput>({
    resolver: zodResolver(staffSchema),
  });

  const locationId = watch("locationId");

  useEffect(() => {
    if (open) {
      reset({
        // name/email/password are required by staffSchema but are not editable
        // here on edit (the PUT /api/staff/[id] route only accepts bio,
        // specializations, locationId, workingHours - name/email live on User,
        // not Staff, and there's no staff-edit-name endpoint). Carrying the
        // existing values through keeps validation happy without exposing
        // fields the API would silently ignore.
        name: staff?.user.name ?? "",
        email: staff?.user.email ?? "",
        password: undefined,
        bio: staff?.bio ?? "",
        locationId: staff?.locationId ?? "",
      });
    }
  }, [open, staff, reset]);

  async function onSubmit(data: StaffInput) {
    const url = isEdit ? `/api/staff/${staff!.id}` : "/api/staff";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast({
        variant: "destructive",
        title: "Couldn't save staff member",
        description:
          typeof json.error === "string" ? json.error : "Please check the form and try again.",
      });
      return;
    }

    toast({ variant: "success", title: isEdit ? "Staff member updated" : "Staff member added" });
    onOpenChange(false);
    router.refresh();
  }

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Staff" : "New Staff"}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Add staff member"}
    >
      {!isEdit && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="staff-name">Name</Label>
            <Input id="staff-name" placeholder="Jane Smith" error={errors.name?.message} {...register("name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-email">Email</Label>
            <Input
              id="staff-email"
              type="email"
              placeholder="jane@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-password">Password</Label>
            <Input
              id="staff-password"
              type="password"
              placeholder="Leave blank to use a default password"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>
        </>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="staff-bio">Bio</Label>
        <Textarea id="staff-bio" error={errors.bio?.message} {...register("bio")} />
      </div>
      <div className="space-y-1.5">
        <Label>Location</Label>
        <Select
          value={locationId || undefined}
          onValueChange={(val) => setValue("locationId", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {locations.length === 0 && (
          <p className="text-xs text-gray-500">Add a location first to assign one here.</p>
        )}
      </div>
    </EntityFormDialog>
  );
}
